'use strict';
/* =============================================================================================================================
   44zzr-engineer-ants.js  --  THE ENGINEER ANT. A late-game ant (unlocked by the Engineer Garage at the Venus outpost, which needs the Makeshift Rover, the
   Basalt Burrows and Chapter 9 finished) that does not fight: it drives round in a little rover, stops, and builds a TURRET that shoots nearby enemies.
   THE ENGINEER  Fastest ant, fragile. Its cap is half the others' (antCapFor), its food price is higher (antCostMul). It keeps ENG.avoid away from enemies,
     and only half that while it is building. It builds for ENG.build seconds; if an enemy comes inside the building distance it ABANDONS the turret where it is
     and drives off. Another engineer (or the same one, later) goes back and finishes an abandoned turret before it starts a new one.
   THE TURRET  No limit on how many (only a safety cap, ENG.turretCap, for speed: the oldest unfinished ones go first). A finished turret shoots the nearest enemy
     in range; an unfinished one does not shoot and is weak: its health is the full health times turretHpFrac(progress) = 0.04 + 0.96 x progress^3, so a half-built
     turret has about 16% and a nearly finished one most of it. Enemies go for engineers and turrets like any other ant (antAggroTarget is wrapped), and hurt them by
     touching them. Damage is counted in the run report as "Ant turrets".
   WHERE THEY LIVE  Engineers and turrets are in their own lists (G.engineers, G.antTurrets), made new whenever a run starts (G.ants is a new array then), so the
     ordinary ant loop in 11-ants.js never meets them and nothing is saved mid-run. ANT_TYPES.engineer holds the stats for the Ants page but it is not in ANT_ORDER.
   UPGRADES  Three more upgrades in the Ants group of the Upgrades tab (Quick Hands, Hardened Turrets, Long Barrels); they unlock with the Engineer Garage.
   Wraps updateAnts, drawAnts, drawAntShadows, antAggroTarget, antCost, venusHas, upgLocked, buyUpgrade and buyUpgradeMax; this file loads last of the ant files.
   ============================================================================================================================= */
const ENG = { hp: 45, spd: 250, r: 8, avoid: 300, build: 3.0, cool: 5, spacing: 110, siteMin: 140, siteMax: 420, cost: 2, turretCap: 80 };
const ENG_TURRET = { hp: 70, range: 280, cd: 1.1, dmg: 10, r: 12, speed: 440 };
ANT_TYPES.engineer = { name: 'Engineer Ant', color: '#E0A82A', abdomen: '#8A5E14', hp: ENG.hp, spd: ENG.spd, r: ENG.r,
  desc: 'Drives about in a little rover and keeps away from enemies. It stops to build a turret that shoots anything near it. Quick, fragile, and half as many fit in the hill.' };
function engineersUnlocked(){ return !!(Save.data && Save.data.antsUnlocked && venusHas('garage')); }
function antCapFor(type){ return type === 'engineer' ? Math.max(1, Math.floor(antMax() / 2)) : antMax(); }
function antCostMul(type){ return type === 'engineer' ? ENG.cost : 1; }
function turretHpFrac(p){ p = Math.max(0, Math.min(1, p)); return 0.04 + 0.96 * p * p * p; }
function engBuildTime(){ return ENG.build * Math.pow(0.88, metaLevel('engspeed')); }
function turretHpMul(){ return 1 + 0.15 * metaLevel('engturhp'); }
function turretRange(){ return ENG_TURRET.range * (1 + 0.08 * metaLevel('engrange')); }

/* ---------- the way in: the Venus upgrade, the price, the upgrades ---------- */
(function(){
  const has = venusHas;                                                                 /* "ch9" is not an upgrade: it stands for Chapter 9 being finished, so the Venus page can list it as a missing requirement */
  venusHas = function(id){ return id === 'ch9' ? !!(Save.data && Save.data.chapter9Complete) : has(id); };
  VENUS_BY_ID.ch9 = { id: 'ch9', name: 'Chapter 9 finished', req: [], cost: { s: 0, b: 0 }, desc: '' };
  const u = { id: 'garage', grp: 'Vehicle', icon: '@t-x-rover', name: 'Engineer Garage', cost: { s: 260, b: 300 }, req: ['rover', 'col2', 'ch9'],
    desc: 'A workshop for the colony’s engineers. Unlocks the Engineer Ant at the trading post: a quick ant in a rover that builds turrets. Needs Chapter 9 finished.' };
  VENUS_UP.push(u); VENUS_BY_ID.garage = u;
  const ac = antCost;
  antCost = function(type){ const v = ac.apply(this, arguments); return type === 'engineer' ? Math.round(v * ENG.cost * 10) / 10 : v; };
  /* three upgrades, in the Ants group of the Upgrades tab; they unlock with the garage */
  [{ id: 'engspeed', icon: '@t-hammer', name: 'Quick Hands', max: 4, cost: 700, mult: 1.9, desc: function(l){ return 'Turrets are built ' + Math.round((1 - Math.pow(0.88, l)) * 100) + '% faster'; } },
   { id: 'engturhp', icon: '@t-x-plate', name: 'Hardened Turrets', max: 4, cost: 750, mult: 1.9, desc: function(l){ return 'Turrets have ' + (l * 15) + '% more health'; } },
   { id: 'engrange', icon: '@t-x-crosshair', name: 'Long Barrels', max: 4, cost: 800, mult: 1.95, desc: function(l){ return 'Turrets shoot ' + (l * 8) + '% further'; } }].forEach(function(m){
    m.requires = 'antsUnlocked'; m.needsEngineers = true; m.lockText = 'Build the Engineer Garage at the Venus outpost first';
    META.push(m); METAMAP[m.id] = m; UPG_GROUPS.filter(function(g){ return g.id === 'ants'; })[0].ids.push(m.id);
  });
  const ul = upgLocked;
  upgLocked = function(m){ return ul.apply(this, arguments) || !!(m.needsEngineers && !engineersUnlocked()); };
  const bu = buyUpgrade, bm = buyUpgradeMax;
  buyUpgrade = function(id){ const m = METAMAP[id]; if (m && m.needsEngineers && !engineersUnlocked()){ SFX.deny(); return; } return bu.apply(this, arguments); };
  buyUpgradeMax = function(id){ const m = METAMAP[id]; if (m && m.needsEngineers && !engineersUnlocked()){ SFX.deny(); return; } return bm.apply(this, arguments); };
})();

/* ---------- the run ---------- */
function engInit(){
  if (G._engAnts === G.ants) return;                                                    /* G.ants is a new array at every run start: so is everything here */
  G._engAnts = G.ants; G.engineers = []; G.antTurrets = []; G.engTimer = antRespawnTime();
}
function engNearestEnemyDist(x, y, r){ const e = nearestEnemy(x, y, r); return e ? hyp(e.x - x, e.y - y) : Infinity; }
function engSpawn(){
  const h = antHill(), pw = antPower() * antHpMul();
  G.engineers.push({ x: h.x + rand(-10, 10), y: h.y + rand(-10, 10), ang: Math.random() * TAU, hp: ENG.hp * pw, maxHp: ENG.hp * pw, r: ENG.r, anim: Math.random() * 6,
    hurt: 0, flash: 0, state: 'wait', cool: rand(1, 3), tx: 0, ty: 0, turret: null, tgtT: 0, dead: false, fleeT: 0 });
  burstParticles(h.x, h.y, 6, '#E0A82A', 110, 3);
}
function engNewTurret(x, y){
  const hp = ENG_TURRET.hp * antPower() * antHpMul() * turretHpMul();
  const t = { x: x, y: y, ang: Math.random() * TAU, r: ENG_TURRET.r, maxHp: hp, hp: hp * turretHpFrac(0), progress: 0, done: false, atk: 0.4, flash: 0, hurt: 0, builder: null, tgt: null, scanT: Math.random() * 0.2, dead: false, anim: 0 };
  G.antTurrets.push(t);
  if (G.antTurrets.length > ENG.turretCap){                                              /* the safety cap: unfinished ones with nobody working on them go first, then the oldest */
    let k = -1; for (let i = 0; i < G.antTurrets.length; i++){ const o = G.antTurrets[i]; if (o !== t && !o.done && !o.builder){ k = i; break; } }
    if (k < 0) k = 0;
    G.antTurrets[k].dead = true; G.antTurrets.splice(k, 1);
  }
  return t;
}
function engSetProgress(t, p){
  const f0 = turretHpFrac(t.progress); t.progress = Math.max(0, Math.min(1, p)); const f1 = turretHpFrac(t.progress);
  t.hp = Math.min(t.maxHp * f1, t.hp + t.maxHp * (f1 - f0));                              /* health grows with the work, and damage already taken stays taken */
}
/* somewhere safe to build: near her, away from other turrets and from enemies, and not inside a building */
function engPickSite(e){
  for (let k = 0; k < 14; k++){
    const a = Math.random() * TAU, d = rand(ENG.siteMin, ENG.siteMax), x = clamp(P.x + Math.cos(a) * d, 70, ARENA_W - 70), y = clamp(P.y + Math.sin(a) * d, 70, ARENA_H - 70);
    let ok = true;
    for (let i = 0; i < G.antTurrets.length && ok; i++) if (hyp(G.antTurrets[i].x - x, G.antTurrets[i].y - y) < ENG.spacing) ok = false;
    if (!ok || engNearestEnemyDist(x, y, ENG.avoid) < ENG.avoid) continue;
    if (G.buildings && G.buildings.length){ const q = { x: x, y: y }; resolveBuildings(q, 24); if (hyp(q.x - x, q.y - y) > 1) continue; }
    return { x: x, y: y };
  }
  return null;
}
/* an abandoned turret that is safe to go back to */
function engPickUnfinished(e){
  let best = null, bd = 900;
  for (let i = 0; i < G.antTurrets.length; i++){
    const t = G.antTurrets[i]; if (t.done || t.builder) continue;
    const d = hyp(t.x - e.x, t.y - e.y); if (d >= bd) continue;
    if (engNearestEnemyDist(t.x, t.y, ENG.avoid) < ENG.avoid) continue;
    best = t; bd = d;
  }
  return best;
}
function engKill(e){ e.dead = true; if (e.turret){ e.turret.builder = null; e.turret = null; } burstParticles(e.x, e.y, 8, '#E0A82A', 150, 3); }
function engUpdateOne(e, dt){
  const spd = ENG.spd * antSpdMul(); let mx = 0, my = 0, sp = 1;
  e.anim += dt * 16; e.hurt -= dt; e.flash -= dt; e.tgtT -= dt;
  const near = enemiesNear(e.x, e.y, 90);                                               /* enemies that touch it hurt it, as with the other ants */
  for (let j = 0; j < near.length && e.hurt <= 0; j++){ const q = near[j]; if (!q.dead && hyp(q.x - e.x, q.y - e.y) < q.r + e.r){ e.hp -= q.dmg * 0.6; e.hurt = 0.4; e.flash = 0.12; } }
  if (e.hp <= 0){ engKill(e); return; }
  const foe = nearestEnemy(e.x, e.y, ENG.avoid);
  const dFoe = foe ? hyp(foe.x - e.x, foe.y - e.y) : Infinity;
  if (e.state === 'build'){
    const t = e.turret;
    if (!t || t.dead){ e.state = 'wait'; e.turret = null; e.cool = 1; }
    else if (dFoe < ENG.avoid / 2){ t.builder = null; e.turret = null; e.state = 'flee'; e.fleeT = 0.4; e.cool = ENG.cool; }          /* too close: leave it as it is */
    else {
      e.ang = Math.atan2(t.y - e.y, t.x - e.x); engSetProgress(t, t.progress + dt / engBuildTime());
      if (Math.random() < dt * 9) burstParticles(t.x, t.y, 1, '#FFD84D', 70, 2);
      if (t.progress >= 1){ t.done = true; t.builder = null; t.flash = 0.3; e.turret = null; e.state = 'wait'; e.cool = ENG.cool * rand(0.8, 1.3); burstParticles(t.x, t.y, 10, '#FFD84D', 170, 3, { glow: true }); sfx('whoosh', 0.08); }
    }
    return;
  }
  if (foe){                                                                              /* an enemy inside the keep-away distance: run, away from it */
    e.state = 'flee'; e.fleeT = 0.35; e.turret = null;
    const dx = e.x - foe.x, dy = e.y - foe.y, d = hyp(dx, dy) || 1, gx = P.x - e.x, gy = P.y - e.y, gd = hyp(gx, gy) || 1;
    mx = dx / d + gx / gd * 0.25; my = dy / d + gy / gd * 0.25;
  } else if (e.state === 'flee'){ e.fleeT -= dt; if (e.fleeT <= 0){ e.state = 'wait'; e.cool = Math.min(e.cool, 1.5); } }
  else {
    e.cool -= dt;
    if (e.state === 'wait' && e.cool <= 0){
      const t = engPickUnfinished(e);
      if (t){ e.turret = t; e.tx = t.x; e.ty = t.y; e.state = 'drive'; }
      else { const s = engPickSite(e); if (s){ e.turret = null; e.tx = s.x; e.ty = s.y; e.state = 'drive'; } else e.cool = 1.5; }
    }
    if (e.state === 'drive'){
      if (e.turret && (e.turret.dead || e.turret.builder || e.turret.done)){ e.state = 'wait'; e.turret = null; e.cool = 0.5; }
      else {
        const dx = e.tx - e.x, dy = e.ty - e.y, d = hyp(dx, dy) || 1;
        if (d < 12){
          if (engNearestEnemyDist(e.x, e.y, ENG.avoid / 2) < ENG.avoid / 2){ e.state = 'wait'; e.turret = null; e.cool = 1.5; }
          else { const t = e.turret || engNewTurret(e.tx, e.ty); t.builder = e; e.turret = t; e.state = 'build'; }
        } else { mx = dx / d; my = dy / d; }
      }
    } else if (e.state === 'wait'){                                                        /* between jobs: idle about near her */
      if (e.tgtT <= 0 || hyp(e.tx - e.x, e.ty - e.y) < 12){ const a = Math.random() * TAU, r = rand(150, 300); e.tx = clamp(P.x + Math.cos(a) * r, 60, ARENA_W - 60); e.ty = clamp(P.y + Math.sin(a) * r, 60, ARENA_H - 60); e.tgtT = rand(2, 4); }
      const dx = e.tx - e.x, dy = e.ty - e.y, d = hyp(dx, dy) || 1; mx = dx / d; my = dy / d; sp = 0.5;
    }
  }
  const m = hyp(mx, my);
  if (m > 0){
    e.ang = Math.atan2(my, mx);
    e.x = clamp(e.x + mx / m * spd * sp * dt, 20, ARENA_W - 20); e.y = clamp(e.y + my / m * spd * sp * dt, 20, ARENA_H - 20);
    if (G.buildings && G.buildings.length) resolveBuildings(e, e.r);
  }
}
function turretUpdateOne(t, dt){
  t.anim += dt; t.atk -= dt; t.hurt -= dt; t.flash -= dt; t.scanT -= dt;
  if (t.scanT <= 0){                                                                   /* a few looks a second, not one a frame */
    t.scanT = 0.14 + Math.random() * 0.1;
    if (t.hurt <= 0){ const near = enemiesNear(t.x, t.y, 80); for (let j = 0; j < near.length; j++){ const q = near[j]; if (!q.dead && hyp(q.x - t.x, q.y - t.y) < q.r + t.r){ t.hp -= q.dmg * 0.6; t.hurt = 0.4; t.flash = 0.12; break; } } }
    if (t.done) t.tgt = nearestEnemy(t.x, t.y, turretRange());
  }
  if (t.hp <= 0){ t.dead = true; if (t.builder){ t.builder.turret = null; t.builder = null; } burstParticles(t.x, t.y, 10, '#8A8E98', 150, 3); return; }
  if (!t.done) return;
  const q = t.tgt;
  if (!q || q.dead || q.untarg){ t.tgt = null; return; }
  const dx = q.x - t.x, dy = q.y - t.y, d = hyp(dx, dy) || 1;
  if (d > turretRange() + q.r){ t.tgt = null; return; }
  t.ang = Math.atan2(dy, dx);
  if (t.atk <= 0){
    t.atk = ENG_TURRET.cd; t.flash = 0.1;
    const keep = dmgSrc; dmgSrc = 'turrets';
    addProj(t.x + dx / d * 14, t.y + dy / d * 14, dx / d * ENG_TURRET.speed, dy / d * ENG_TURRET.speed, 4.5, ENG_TURRET.dmg * antPower() * antDmgMul(), '#FFD84D', { life: turretRange() / ENG_TURRET.speed + 0.1, kind: 'spit' });
    dmgSrc = keep; sfx('spit', 0.06);
  }
}
(function(){
  const base = updateAnts;
  updateAnts = function(dt){
    base.apply(this, arguments);
    if (!Save.data.antsUnlocked || G.attract) return;
    engInit();
    const cap = engineersUnlocked() ? Math.min(antCapFor('engineer'), Save.data.ants.engineer | 0) : 0;
    if (G.engineers.length < cap){ G.engTimer -= dt; if (G.engTimer <= 0){ G.engTimer = antRespawnTime(); engSpawn(); } } else G.engTimer = antRespawnTime();
    if (G.engineers.length > cap){ const x = G.engineers.pop(); engKill(x); }
    for (let i = G.engineers.length - 1; i >= 0; i--){ const e = G.engineers[i]; engUpdateOne(e, dt); if (e.dead) G.engineers.splice(i, 1); }
    for (let i = G.antTurrets.length - 1; i >= 0; i--){ const t = G.antTurrets[i]; turretUpdateOne(t, dt); if (t.dead) G.antTurrets.splice(i, 1); }
  };
  /* enemies go for an engineer or a turret that is nearer than what they would otherwise head for (150 px, as with the other ants) */
  const aggro = antAggroTarget;
  antAggroTarget = function(e){
    let best = aggro.apply(this, arguments);
    if (!G.engineers) return best;
    const pd = hyp(P.x - e.x, P.y - e.y);
    let bd = best ? hyp(best.x - e.x, best.y - e.y) : Math.min(pd, ANT_AGGRO);
    const look = function(list){ for (let i = 0; i < list.length; i++){ const a = list[i]; if (a.dead) continue; const d = hyp(a.x - e.x, a.y - e.y); if (d < bd){ bd = d; best = a; } } };
    look(G.engineers); look(G.antTurrets);
    return best;
  };
})();

/* ---------- drawing ---------- */
function drawEngineerRover(ctx, x, y, ang, t, flash){
  ctx.save(); ctx.translate(x, y); ctx.scale(0.42, 0.42); drawRoverTop(ctx, 0, 0, ang, { t: t, flash: flash }); ctx.restore();
  ctx.save(); ctx.translate(x, y); ctx.rotate(ang);                                      /* the ant at the wheel, in a hard hat */
  fillCircle(ctx, -1, 0, 3.2, '#3A2410'); fillCircle(ctx, 3, 0, 2.6, '#4A2E14');
  ctx.fillStyle = '#FFC83A'; ctx.beginPath(); ctx.arc(3.4, 0, 2.7, -Math.PI / 2, Math.PI / 2); ctx.fill();
  ctx.restore();
}
function drawAntTurret(ctx, t, time){
  ctx.save(); ctx.translate(t.x, t.y);
  const p = t.progress, alpha = t.done ? 1 : 0.4 + 0.6 * p;
  ctx.fillStyle = 'rgba(0,0,0,.3)'; ctx.beginPath(); ctx.ellipse(2, 5, t.r * 1.1, t.r * 0.6, 0, 0, TAU); ctx.fill();
  ctx.globalAlpha = alpha;
  fillCircle(ctx, 0, 0, t.r, t.flash > 0 && t.hurt > 0 ? '#FFFFFF' : '#59606C'); fillCircle(ctx, 0, 0, t.r - 3, '#3A4048');
  if (t.done){
    ctx.save(); ctx.rotate(t.ang);
    ctx.fillStyle = '#2A2E36'; ctx.fillRect(2, -3, 17, 6); ctx.fillStyle = t.flash > 0.04 ? '#FFF3B0' : '#E0A82A'; ctx.fillRect(15, -2.2, 5, 4.4);
    ctx.restore(); fillCircle(ctx, 0, 0, 5.4, '#E0A82A'); fillCircle(ctx, 0, 0, 2.4, '#8A5E14');
    if (t.flash > 0.04) csGlow(ctx, Math.cos(t.ang) * 20, Math.sin(t.ang) * 20, 12, '#FFE27A', 0.5);
  } else {
    ctx.strokeStyle = '#E0A82A'; ctx.lineWidth = 1.6; ctx.setLineDash([4, 3]); ctx.beginPath(); ctx.arc(0, 0, t.r + 2, 0, TAU); ctx.stroke(); ctx.setLineDash([]);       /* scaffolding */
    ctx.beginPath(); ctx.moveTo(-8, -8); ctx.lineTo(8, 8); ctx.moveTo(8, -8); ctx.lineTo(-8, 8); ctx.stroke();
    ctx.strokeStyle = '#FFD84D'; ctx.lineWidth = 2.6; ctx.beginPath(); ctx.arc(0, 0, t.r + 6, -Math.PI / 2, -Math.PI / 2 + TAU * p); ctx.stroke();                   /* the work done so far */
  }
  ctx.globalAlpha = 1; ctx.restore();
  const f = t.hp / (t.maxHp * (t.done ? 1 : turretHpFrac(t.progress)));
  if (f < 0.999){ ctx.fillStyle = 'rgba(18,13,10,.8)'; ctx.fillRect(t.x - 11, t.y - t.r - 10, 22, 2.6); ctx.fillStyle = '#C98A3A'; ctx.fillRect(t.x - 11, t.y - t.r - 10, 22 * clamp(f, 0, 1), 2.6); }
}
(function(){
  const da = drawAnts;
  drawAnts = function(ctx){
    da.apply(this, arguments);
    if (!G.engineers || (!G.engineers.length && !G.antTurrets.length)) return;
    const v = viewBounds(60);
    for (let i = 0; i < G.antTurrets.length; i++){ const t = G.antTurrets[i]; if (t.x < v.x0 || t.x > v.x1 || t.y < v.y0 || t.y > v.y1) continue; drawAntTurret(ctx, t, G.time); }
    for (let i = 0; i < G.engineers.length; i++){ const e = G.engineers[i]; drawEngineerRover(ctx, e.x, e.y, e.ang, G.time, e.flash > 0); }
  };
  const ds = drawAntShadows;
  drawAntShadows = function(ctx){
    ds.apply(this, arguments);
    if (!G.engineers) return;
    ctx.fillStyle = 'rgba(22,15,10,.34)';
    for (let i = 0; i < G.engineers.length; i++){ const e = G.engineers[i]; ctx.beginPath(); ctx.ellipse(e.x + 1, e.y + 4, 11, 6, e.ang, 0, TAU); ctx.fill(); }
  };
})();

/* ---------- the Ants page ---------- */
function engineerStatsHTML(){
  const pw = antHpMul(), r = function(x){ return Math.round(x); }, bt = engBuildTime();
  const chips = [['Health', r(ENG.hp * pw)], ['Speed', r(ENG.spd * antSpdMul())], ['Keeps away', ENG.avoid + ' px'], ['While building', ENG.avoid / 2 + ' px'], ['Build time', bt.toFixed(1) + ' s'],
    ['Turret health', r(ENG_TURRET.hp * pw * turretHpMul())], ['Turret range', r(turretRange())], ['Turret damage', r(ENG_TURRET.dmg * antPower() * antDmgMul())]];
  return '<div class="arstats">' + chips.map(function(c){ return '<span>' + c[0] + ' <b>' + c[1] + '</b></span>'; }).join('') + '</div>' +
    '<p class="gnote" style="margin:4px 0 0">Half-built turrets are weak (a turret at half has about ' + Math.round(turretHpFrac(0.5) * 100) + '% of its health), so a quick finish matters. There is no limit on turrets.</p>';
}
/* the engineers' bay: rovers driving about, a finished turret, and one being built */
function antsEngineerScene(c, W, H, n, dt){
  const t = antsPage.t, T = ANT_TYPES.engineer, ghost = n <= 0;
  const turret = function(x, y, p, done, s){ c.save(); c.translate(x, y); c.scale(s, s); drawAntTurret(c, { x: 0, y: 0, ang: -0.5 + Math.sin(t * 0.7) * 0.4, r: ENG_TURRET.r, progress: p, done: done, flash: 0, hurt: 0, hp: 1, maxHp: 1 }, t); c.restore(); };
  c.globalAlpha = ghost ? 0.45 : 1;
  turret(W * 0.16, H * 0.72, 1, true, 1.7); turret(W * 0.84, H * 0.66, (t * 0.22) % 1, false, 1.7);
  if (ghost){
    c.globalAlpha = 0.28; c.save(); c.translate(W / 2, H / 2); c.scale(2, 2); drawEngineerRover(c, 0, 0, -0.4, t, false); c.restore(); c.globalAlpha = 1;
    c.fillStyle = 'rgba(214,201,178,.8)'; c.font = '600 12px system-ui,sans-serif'; c.textAlign = 'center'; c.fillText('Empty bay', W / 2, H - 10); return;
  }
  const rovers = antsSimStep('engineer', Math.min(6, n), dt, W, H);
  rovers.slice().sort(function(a, b){ return a.y - b.y; }).forEach(function(a){ c.save(); c.translate(a.x * W, a.y * H); c.scale(1.7, 1.7); drawEngineerRover(c, 0, 0, a.ang, t, false); c.restore(); });
  const extra = n - Math.min(6, n);
  if (extra > 0){ c.fillStyle = 'rgba(0,0,0,.5)'; c.fillRect(W - 40, 4, 36, 16); c.fillStyle = '#F4E4C4'; c.font = '700 11px system-ui,sans-serif'; c.textAlign = 'center'; c.fillText('+' + extra, W - 22, 16); }
}

