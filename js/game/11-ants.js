'use strict';
/* The ant colony. */
/* ========================= ANT COLONY ========================= */
/* Unlocked for good the first time a run reaches 100,000,000 points. An
   anthill then sits at the center of the arena in every run, and ants hired
   at the trading post (paid for in food) pour out of it to fight alongside
   the giraffe. Each type has its own 15-second respawn timer that only runs
   while fewer of that type are on the field than the player owns. */
const ANT_UNLOCK_SCORE = 100000000;
const ANT_MAX_BASE = 10, ANT_RESPAWN_BASE = 15, ANT_AGGRO = 150;
function antMax(){ return ANT_MAX_BASE + 2 * metaLevel('antcap') + venusAntCap() + 2 * cityLevel('c_antcap'); }
function antRespawnTime(){ return Math.max(4, ANT_RESPAWN_BASE * (1 - 0.15 * metaLevel('antrespawn')) * (1 - 0.06 * cityLevel('c_antrate'))); }
const FOOD_GOLD = 4000, FOOD_GEMS = 30;
const ANT_TYPES = {
  soldier:    { name: 'Soldier Ant',    color: '#8A2A14', abdomen: '#5A1A0A', hp: 70, spd: 150, r: 7.5, dmg: 16, cd: 0.55,
                desc: 'Charges the nearest enemy and bites it. The toughest ant.' },
  distractor: { name: 'Distractor Ant', color: '#E8B830', abdomen: '#E8B830', hp: 24, spd: 225, r: 6,   blast: 45, blastR: 85,
                desc: 'Lingers at the edge of an enemy\u2019s aggro range to draw it off you. Fastest and frailest; explodes when killed.' },
  shooter:    { name: 'Shooter Ant',    color: '#3A6A22', abdomen: '#7FD03A', hp: 40, spd: 180, r: 6.5, dmg: 13, cd: 1.0, range: 260,
                desc: 'Keeps its distance and spits globs of acid. Faster but frailer than a soldier.' }
};
const ANT_ORDER = ['soldier', 'distractor', 'shooter'];
function antHill(){ return { x: ARENA_W / 2, y: ARENA_H / 2 }; }
/* ants scale with the wave so they stay relevant against later chapters */
function antPower(){ return 1 + 0.12 * Math.max(0, (G.wave | 0) - 1); }
function antHpMul(){ return 1 + 0.15 * metaLevel('anthp') + venusAntHp() + 0.12 * cityLevel('c_anthp') + (mutHas('m_ants') ? 0.4 : 0); }
function antDmgMul(){ return 1 + 0.15 * metaLevel('antdmg') + venusAntDmg() + 0.12 * cityLevel('c_antdmg') + (mutHas('m_ants') ? 0.4 : 0); }
function antBlastMul(){ return 1 + 0.25 * metaLevel('antblast'); }
const ANT_COST_CAP = 16;   /* ants get dearer for the first 16, then the price stays where it is */
function antCost(type){
  const n = Math.min(ANT_COST_CAP, (Save.data.ants && Save.data.ants[type]) | 0);
  return Math.round(Math.pow(1.3, n) * 10) / 10;
}
/* how much food the current gold and gems could make right now */
function foodAffordable(){ return Math.max(0, Math.min(Math.floor(Save.data.gold / FOOD_GOLD), Math.floor((Save.data.gems | 0) / FOOD_GEMS))); }
let foodNote = '';
/* Makes up to `n` food (default 1): as many as can be afforded, never a
   partial unit. Returns how many were made, so 0 means nothing happened. */
function makeFood(n){
  const want = Math.max(1, Math.floor(n || 1));
  const made = Math.min(want, foodAffordable());
  if (made <= 0){ SFX.deny(); foodNote = 'Not enough gold and gems for any food.'; return 0; }
  Save.data.gold -= FOOD_GOLD * made; Save.data.gems -= FOOD_GEMS * made;
  Save.data.food = Math.round((Save.data.food + made) * 10) / 10;
  foodNote = made < want ? 'Made ' + made + ' of ' + want + ' food \u2014 ran out of gold or gems.' : 'Made ' + made + ' food.';
  Save.write(); SFX.buy(); return made;
}
function hireAnt(type){
  if (!ANT_TYPES[type] || !Save.data.antsUnlocked){ SFX.deny(); return false; }
  const n = Save.data.ants[type] | 0, c = antCost(type);
  if (n >= (typeof antCapFor === 'function' ? antCapFor(type) : antMax()) || Save.data.food + 1e-9 < c){ SFX.deny(); return false; }
  Save.data.food = Math.round((Save.data.food - c) * 10) / 10;
  Save.data.ants[type] = n + 1;
  Save.write(); SFX.buy(); return true;
}
function checkAntUnlock(){
  if (Save.data.antsUnlocked || G.attract || G.score < ANT_UNLOCK_SCORE) return;
  Save.data.antsUnlocked = true; Save.write();
  banner('ANT COLONY UNLOCKED', 'An anthill has appeared at the center of the arena. Hire ants at the trading post.', '#C98A3A', 3.6);
  SFX.level();
}
function spawnAnt(type){
  const T = ANT_TYPES[type], h = antHill(), pw = antPower() * antHpMul();
  G.ants.push({ type: type, x: h.x + rand(-10, 10), y: h.y + rand(-10, 10), hp: T.hp * pw, maxHp: T.hp * pw, r: T.r,
    ang: Math.random() * TAU, anim: Math.random() * 6, atk: rand(0, 0.5), hurt: 0, flash: 0, bite: 0, wx: 0, wy: 0, wt: 0 });
  burstParticles(h.x, h.y, 6, '#7A5A36', 110, 3);
}
function antDie(a){
  const T = ANT_TYPES[a.type];
  burstParticles(a.x, a.y, 8, T.color, 150, 3);
  if (a.type === 'distractor'){
    const bm = antBlastMul();
    addShock(a.x, a.y, T.blastR * bm, 0.3, T.blast * antPower() * bm, '#FFB838', { width: 12, kb: 260, filled: true });
    const sb = stickyBlast();
    if (sb){ const near = enemiesNear(a.x, a.y, T.blastR * bm + 30, []); for (let i = 0; i < near.length; i++){ const q = near[i]; if (q.dead || q.big || hyp(q.x - a.x, q.y - a.y) > T.blastR * bm + q.r) continue; q.slowT = Math.max(q.slowT, sb.dur); q.slowMul = Math.min(q.slowMul, 0.5); } burstParticles(a.x, a.y, 10, '#E8B830', 150, 3, { glow: true }); }
    burstParticles(a.x, a.y, 14, '#FFB838', 240, 4, { glow: true });
    abilityShake(4); sfx('boom', 0.12);
  }
}
/* Which target an enemy should head for: the player, unless an ant inside
   ANT_AGGRO range is even closer. The player is always a candidate at any
   distance, so enemies never simply forget about the giraffe. */
function antAggroTarget(e){
  const ants = G.ants, al = G.allies, pd = hyp(P.x - e.x, P.y - e.y);
  let best = null, bd = Math.min(pd, ANT_AGGRO);
  if (ants) for (let i = 0; i < ants.length; i++){
    const a = ants[i], d = hyp(a.x - e.x, a.y - e.y);
    if (d < bd){ bd = d; best = a; }
  }
  if (al && al.length){                                                    /* a Marine on Mars goes for the nearest dust alien fighting it, or the giraffe if she is nearer; anything else goes for a squad alien that is close */
    const mar = !!(e.def && e.def.marine);
    let ad = mar ? pd : Math.min(pd, 340), ab = null;
    for (let i = 0; i < al.length; i++){ const a = al[i]; if (!mar && !a.squad) continue; const d = hyp(a.x - e.x, a.y - e.y); if (d < ad){ ad = d; ab = a; } }
    if (ab && (!best || ad < bd)) best = ab;
  }
  return best;
}
/* Distractors pick the nearest enemy, except they skip any enemy that is
   still outside their aggravation range AND already has another distractor
   heading for it -- so a group of distractors fans out across several
   enemies instead of all mobbing the same one. An enemy already inside
   range is always fair game (it's aggravated at this ant regardless). If
   every enemy is spoken for, the ant doubles up rather than standing idle. */
function distractorTarget(a, claims){
  /* Stick with the current target while it's alive and no other distractor
     shares it. Without this, a distractor circling its own enemy could drift
     into range of a neighboring one, swap to it for being nearer, and leave
     its original enemy undistracted. */
  const cur = a.tgt;
  if (cur && !cur.dead && hyp(cur.x - a.x, cur.y - a.y) < 900 && (claims.get(cur) || 0) <= 1) return cur;
  let best = null, bd = 900 * 900;
  const es = G.enemies, r2 = ANT_AGGRO * ANT_AGGRO;
  for (let i = 0; i < es.length; i++){
    const e = es[i];
    if (e.dead) continue;
    const dx = e.x - a.x, dy = e.y - a.y, d2 = dx * dx + dy * dy;
    if (d2 >= bd) continue;
    if (d2 > r2 && (claims.get(e) || 0) - (a.tgt === e ? 1 : 0) > 0) continue;
    bd = d2; best = e;
  }
  return best || nearestEnemy(a.x, a.y, 900);
}
function updateAnts(dt){
  if (!G.ants) G.ants = [];
  if (!Save.data.antsUnlocked || G.attract) return;
  const rt = antRespawnTime();
  if (!G.antTimers) G.antTimers = { soldier: rt, distractor: rt, shooter: rt };
  for (let k = 0; k < ANT_ORDER.length; k++){
    const type = ANT_ORDER[k];
    const owned = Math.min(antMax(), Save.data.ants[type] | 0);
    let alive = 0;
    for (let i = 0; i < G.ants.length; i++) if (G.ants[i].type === type) alive++;
    if (alive < owned){
      G.antTimers[type] -= dt;
      if (G.antTimers[type] <= 0){ G.antTimers[type] = rt; spawnAnt(type); }
    } else G.antTimers[type] = rt;
  }
  const pw = antPower(), hill = antHill();
  /* how many distractors are currently heading for each enemy, updated live
     as each one picks, so later distractors this frame see earlier choices */
  const claims = new Map();
  for (let i = 0; i < G.ants.length; i++){
    const o = G.ants[i];
    if (o.type === 'distractor' && o.tgt && !o.tgt.dead) claims.set(o.tgt, (claims.get(o.tgt) || 0) + 1);
  }
  for (let i = G.ants.length - 1; i >= 0; i--){
    const a = G.ants[i], T = ANT_TYPES[a.type];
    a.anim += dt * 14; a.atk -= dt; a.hurt -= dt; a.flash -= dt; a.bite -= dt;
    /* enemies that touch an ant hurt it */
    const near = enemiesNear(a.x, a.y, 90);
    for (let j = 0; j < near.length && a.hurt <= 0; j++){
      const e = near[j];
      if (!e.dead && hyp(e.x - a.x, e.y - a.y) < e.r + a.r){ a.hp -= e.dmg * 0.6; a.hurt = 0.4; a.flash = 0.12; }
    }
    if (a.hp <= 0){ antDie(a); G.ants.splice(i, 1); continue; }
    let tgt;
    if (a.type === 'distractor'){
      tgt = distractorTarget(a, claims);
      if (a.tgt !== tgt){
        if (a.tgt && claims.has(a.tgt)) claims.set(a.tgt, claims.get(a.tgt) - 1);
        if (tgt) claims.set(tgt, (claims.get(tgt) || 0) + 1);
        a.tgt = tgt;
      }
    } else tgt = nearestEnemy(a.x, a.y, 900);
    let mx = 0, my = 0, spdMul = 1;
    if (tgt){
      const dx = tgt.x - a.x, dy = tgt.y - a.y, d = hyp(dx, dy) || 1, ux = dx / d, uy = dy / d;
      a.ang = Math.atan2(uy, ux);
      if (a.type === 'soldier'){
        if (d > tgt.r + a.r + 3){ mx = ux; my = uy; }
        else if (a.atk <= 0){
          a.atk = T.cd; a.bite = 0.15;
          const vb = venomBite(), bd = T.dmg * pw * antDmgMul();
          dmgSrc = 'ants'; damageEnemy(tgt, bd, { color: T.color, kb: 60, sx: a.x, sy: a.y, noCrit: true, burn: vb ? bd * vb.dps : 0, burnT: vb ? vb.dur : 0 });
          if (vb && !tgt.dead) tgt.burnColor = '#8AE04A';
          sfx('hit', 0.06);
        }
      } else if (a.type === 'shooter'){
        const want = T.range * 0.75;
        if (d < want - 30){ mx = -ux; my = -uy; }
        else if (d > T.range - 10){ mx = ux; my = uy; }
        else { mx = -uy; my = ux; spdMul = 0.35; }
        if (d <= T.range && a.atk <= 0){
          a.atk = T.cd;
          const ab = acidBurst(), sd = T.dmg * pw * antDmgMul();
          addProj(a.x + ux * 8, a.y + uy * 8, ux * 420, uy * 420, ab ? 5.6 : 4.5, sd, '#9BE04A', { life: T.range / 420 + 0.1, kind: 'acid', explode: ab ? { r: ab.r, dmg: sd * ab.dmgMul } : null, pool: ab ? { r: ab.poolR, dur: ab.poolDur, dps: sd * ab.poolDps } : null });
          sfx('spit', 0.1);
        }
      } else {
        /* distractor: stay in the outer band of the enemy's aggro range */
        const lo = ANT_AGGRO * 0.7, hi = ANT_AGGRO * 0.92;
        if (d > hi){ mx = ux; my = uy; }
        else if (d < lo){ mx = -ux; my = -uy; }
        else { mx = -uy; my = ux; spdMul = 0.5; }
      }
    } else {
      /* nothing to fight: mill about near the anthill */
      a.wt -= dt;
      if (a.wt <= 0 || hyp(a.wx - a.x, a.wy - a.y) < 8){
        const ang = Math.random() * TAU, rr = rand(20, 90);
        a.wx = hill.x + Math.cos(ang) * rr; a.wy = hill.y + Math.sin(ang) * rr; a.wt = rand(1.5, 3.5);
      }
      const dx = a.wx - a.x, dy = a.wy - a.y, d = hyp(dx, dy) || 1;
      mx = dx / d; my = dy / d; spdMul = 0.45;
      a.ang = Math.atan2(my, mx);
    }
    const m = hyp(mx, my);
    if (m > 0){
      a.x = clamp(a.x + mx / m * T.spd * antSpdMul() * spdMul * dt, 20, ARENA_W - 20);
      a.y = clamp(a.y + my / m * T.spd * antSpdMul() * spdMul * dt, 20, ARENA_H - 20);
      if (G.buildings && G.buildings.length) resolveBuildings(a, a.r);
    }
  }
}
function drawAnthill(ctx){
  if (!Save.data || !Save.data.antsUnlocked) return;
  const h = antHill();
  drawColony(ctx, h.x, h.y, venusColTier(), G.time, 1, { aim: G.turret ? G.turret.ang : 0, flash: !!(G.turret && G.turret.flash > 0), rooms: squadRooms() });     /* a whole new look with every colony upgrade */
}
function drawAnt(ctx, a){
  const T = ANT_TYPES[a.type];
  const c = a.flash > 0 ? '#FFFFFF' : T.color;
  ctx.save(); ctx.translate(a.x, a.y); ctx.rotate(a.ang);
  const k = a.r / 7; ctx.scale(k, k);
  ctx.strokeStyle = '#1A0E08'; ctx.lineWidth = 1.2;
  ctx.beginPath();
  for (let j = -1; j <= 1; j++){
    const w = Math.sin(a.anim + j * 2) * 2.2;
    ctx.moveTo(j * 3, 0); ctx.lineTo(j * 3 + w, -7);
    ctx.moveTo(j * 3, 0); ctx.lineTo(j * 3 - w, 7);
  }
  ctx.moveTo(7, -1.5); ctx.lineTo(11, -5); ctx.moveTo(7, 1.5); ctx.lineTo(11, 5);
  ctx.stroke();
  if (a.type === 'distractor'){
    softBlob(ctx, -6, 0, 9, '#FFB838', 0.18 + 0.1 * Math.sin(a.anim * 0.5));
    fillCircle(ctx, -6, 0, 4.4, a.flash > 0 ? '#FFFFFF' : T.abdomen);
    ctx.strokeStyle = '#1A0E08'; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.moveTo(-8, -3.6); ctx.lineTo(-8, 3.6); ctx.moveTo(-5, -4.2); ctx.lineTo(-5, 4.2); ctx.stroke();
  } else if (a.type === 'shooter'){
    softBlob(ctx, -6, 0, 8, '#9BE04A', 0.2);
    fillCircle(ctx, -6, 0, 5, a.flash > 0 ? '#FFFFFF' : T.abdomen);
    fillCircle(ctx, -7, -1.5, 1.4, '#D8FF9A');
  } else {
    fillCircle(ctx, -6, 0, 4.2, a.flash > 0 ? '#FFFFFF' : T.abdomen);
  }
  fillCircle(ctx, 0, 0, 2.4, c);
  fillCircle(ctx, 5, 0, a.type === 'soldier' ? 3.8 : 3.2, c);
  if (a.type === 'soldier'){
    const open = a.bite > 0 ? 0.2 : 0.55;
    ctx.strokeStyle = '#2A0E04'; ctx.lineWidth = 1.6; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(8, -1.6); ctx.quadraticCurveTo(12, -1.6 - open * 6, 12.5, -open);
    ctx.moveTo(8, 1.6); ctx.quadraticCurveTo(12, 1.6 + open * 6, 12.5, open); ctx.stroke();
    ctx.lineCap = 'butt';
  }
  ctx.restore();
  if (a.hp < a.maxHp){
    const w = 14, p = clamp(a.hp / a.maxHp, 0, 1);
    ctx.fillStyle = 'rgba(18,13,10,.8)'; ctx.fillRect(a.x - w / 2, a.y - a.r - 8, w, 2.6);
    ctx.fillStyle = '#C98A3A'; ctx.fillRect(a.x - w / 2, a.y - a.r - 8, w * p, 2.6);
  }
}
function drawAnts(ctx){
  const ants = G.ants;
  if (!ants) return;
  const v = viewBounds(60);
  for (let i = 0; i < ants.length; i++){ const a = ants[i]; if (a.x < v.x0 || a.x > v.x1 || a.y < v.y0 || a.y > v.y1) continue; drawAnt(ctx, a); }
}
function antsTabHTML(){
  if (!Save.data.antsUnlocked){
    return '<p class="sub">The ant colony is still underground. Reach a score of <b>' + ANT_UNLOCK_SCORE.toLocaleString('en-US') +
      '</b> in a single run to unlock it. An anthill will then appear at the center of the arena.</p>';
  }
  const canFood = Save.data.gold >= FOOD_GOLD && (Save.data.gems | 0) >= FOOD_GEMS;
  const afford = foodAffordable();
  const note = foodNote; foodNote = '';
  let rows =
    '<div class="shoprow">' +
      '<div class="ic">' + ico('@t-apple') + '</div>' +
      '<div class="txt"><div class="nm">Food: ' + Save.data.food.toFixed(1) + '</div>' +
        '<div class="ds">Every ant costs food. Each extra ant of the same type costs 1.3\u00d7 the last.</div></div>' +
      '<button class="btn sm buy' + (canFood ? '' : ' ghost') + '" data-a="ant-food"' + (canFood ? '' : ' disabled') + '>' +
        'Make 1 food<br><small>' + fmt(FOOD_GOLD) + ' gold + ' + FOOD_GEMS + ' gems</small></button>' +
    '</div>' +
    '<div class="shoprow">' +
      '<div class="ic">' + ico('@t-apple') + '</div>' +
      '<div class="txt"><div class="nm">Make food in bulk</div>' +
        '<div class="ds">' + (note ? '<b>' + note + '</b> ' : '') + 'You can afford ' + afford + ' right now. Asking for more makes as many as you can afford.</div></div>' +
      '<div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap;justify-content:flex-end">' +
        '<button class="btn sm buy' + (canFood ? '' : ' ghost') + '" data-a="ant-food-5"' + (canFood ? '' : ' disabled') + '>' +
          'Make 5<br><small>' + fmt(FOOD_GOLD * 5) + ' gold + ' + (FOOD_GEMS * 5) + ' gems</small></button>' +
        '<input id="foodAmt" type="number" min="1" step="1" value="' + Math.max(1, Math.min(afford, 10) || 10) + '" ' +
          'style="width:64px;padding:7px;background:var(--soil);border:1px solid var(--bark2);border-radius:4px;color:var(--bone);font-size:14px">' +
        '<button class="btn sm buy' + (canFood ? '' : ' ghost') + '" data-a="ant-food-x"' + (canFood ? '' : ' disabled') + '>Make</button>' +
      '</div>' +
    '</div>' +
    '<div class="shoprow">' +
      '<div class="ic">' + ico('@t-x-grass') + '</div>' +
      '<div class="txt"><div class="nm">Forage under the acacia</div>' +
        '<div class="ds">A quick minigame: catch falling leaves with the giraffe\u2019s neck, 1 food each. Once every 15 minutes.</div></div>' +
      forageButtonHTML('btn sm') +
    '</div>';
  for (let i = 0; i < ANT_ORDER.length; i++){
    const type = ANT_ORDER[i], T = ANT_TYPES[type];
    const cap = antMax(), n = Save.data.ants[type] | 0, maxed = n >= cap, cost = antCost(type);
    const can = !maxed && Save.data.food + 1e-9 >= cost;
    let pip = '<div class="pips">';
    for (let k = 1; k <= cap; k++) pip += '<span class="pip' + (k <= n ? ' on' : '') + '"></span>';
    pip += '</div>';
    rows +=
      '<div class="shoprow">' +
        '<div class="ic" style="color:' + T.color + '">' + ico('@t-bug') + '</div>' +
        '<div class="txt"><div class="nm">' + T.name + ' \u2014 ' + n + ' / ' + cap + '</div>' +
          '<div class="ds">' + T.desc + '</div>' + pip + '</div>' +
        (maxed ? '<div class="maxed">Full</div>'
               : '<button class="btn sm buy' + (can ? '' : ' ghost') + '" data-a="hire-' + type + '"' + (can ? '' : ' disabled') + '>' +
                 'Hire for ' + cost.toFixed(1) + ' food</button>') +
      '</div>';
  }
  return '<p class="sub">Hired ants are permanent. Each type respawns from the anthill every 15 seconds until all you own are out.</p>' +
         '<div class="shoplist">' + rows + '</div>' + squadSectionHTML();
}
let wheelResult = null, wheelSpinning = false, wheelRotation = 0;
const WHEEL_SPIN_MS = 4200;
/* Data and animation are deliberately separate: spinWheel() above resolves
   and saves the reward the instant a key is spent, so the outcome is never
   lost even if the tab is closed mid-animation. This function only drives
   the visual spin and, after it finishes, re-renders to reveal the result. */
function spinWheelUI(){
  if (wheelSpinning) return;
  const result = spinWheel();
  if (!result) return;
  wheelSpinning = true;
  wheelResult = null;
  const total = WHEEL_SEGMENTS.reduce((a, x) => a + x.weight, 0);
  let cum = 0, mid = 0;
  for (let i = 0; i < WHEEL_SEGMENTS.length; i++){
    if (WHEEL_SEGMENTS[i] === result.seg){ mid = (cum + result.seg.weight / 2) / total * 360; break; }
    cum += WHEEL_SEGMENTS[i].weight;
  }
  const extraSpins = 5;
  const target = wheelRotation - (wheelRotation % 360) + extraSpins * 360 + (360 - mid);
  /* Render the disc first at its CURRENT (pre-spin) rotation -- wheelRotation
     itself isn't bumped to the target until after the render below, so the
     fresh #wheelDisc element starts life at the same angle it was already
     resting at. Only once that starting frame is actually on screen (forced
     via the reflow read) do we hand it a new target with a transition; if we
     set both the starting HTML and the "spin to" value to the same target in
     one go, the transform property never changes and the browser has
     nothing to animate between, which is why the wheel used to jump straight
     to its result with no visible spin at all. */
  showShop('wheel');
  const disc = document.getElementById('wheelDisc');
  if (disc){
    void disc.offsetWidth;
    disc.style.transition = 'transform ' + (WHEEL_SPIN_MS / 1000) + 's cubic-bezier(0.13,0.66,0.24,1)';
    disc.style.transform = 'rotate(' + target + 'deg)';
  }
  wheelRotation = target;
  setTimeout(() => { revealWheelResult(result); }, WHEEL_SPIN_MS);
}
function revealWheelResult(result){
  wheelSpinning = false;
  wheelResult = result;
  if (G.state === 'shop' && shopTab === 'wheel') showShop('wheel');
}


