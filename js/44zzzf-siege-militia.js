'use strict';
/* Chapter 15, the Siege: the town militia, friendly giraffes with rifles (the posts are placed in js/44zzzd-siege-town.js). */
/* ========================= THE MILITIA ========================= */
/* Ten posts, each a sandbag nest with a wall of sandbags to either side and two militia giraffes in it. A militia giraffe shoots the nearest creature in range that she
   can see (the Tower's sight test, towerSight): a common creature falls to one shot (MIL_DMG), the heavy ones take two, and a boss only a chip, so the posts hold the line
   and she still has to fight. They are hit, too: a creature that gets close to a giraffe hurts her, and one that gets close to a post wears its sandbags down. A post at 30
   or less is ABANDONED: its giraffes leave it and fight on foot, near whichever key building is under the most pressure, and run from anything that gets close. Between waves
   the posts are mended (+40) and manned again. A giraffe that has no health left lies down (nobody dies, and nothing is lost for good): she gets up when the giraffe walks
   over her, which heals a hurt one too, and every one of them is on her feet again at the start of the next wave. In Play together either giraffe can heal them. */
const MIL = { per: 2, range: 560, reload: 1.9, footReload: 2.5, hp: 100, hitDmg: 22, hitCd: 1.0, shotDmg: 22, postHp: 100, abandon: 30, mend: 40, heal: 150, healR: 36, speed: 150, flee: 100 };
const MIL_HEAVY = { warthog: 1, rhino: 1 };                                       /* two shots, not one */
const SGM = { posts: [], men: [], tracers: [], tipped: false };
const MIL_COATS = [['#C8A04A', '#7A5A1E'], ['#A9B86A', '#5E6E2E'], ['#D08A5A', '#7E4A28'], ['#8AAED0', '#42607E'], ['#C89AB8', '#7E4A6A'], ['#B8A0D8', '#62487E']];
function siegeMilitiaInit(){
  SGM.posts.length = 0; SGM.men.length = 0; SGM.tracers.length = 0; SGM.tipped = false;
  const bs = G.buildings;
  SIEGE_POSTS.forEach(function(p, pi){
    const nest = bs.filter(function(b){ return b.post === p.id && b.kind === 'nest'; })[0];
    const post = { id: p.id, b: nest, hp: MIL.postHp, abandoned: false, flash: 0, hitCd: 0, men: [], cx: p.x + SG_NEST.w / 2, cy: p.y + SG_NEST.h / 2 };
    SGM.posts.push(post);
    for (let k = 0; k < MIL.per; k++){
      const c = MIL_COATS[(pi * MIL.per + k) % MIL_COATS.length];
      const m = { x: post.cx + (k ? 24 : -24), y: post.cy - 4, post: post, slot: k, state: 'post', hp: MIL.hp, face: -Math.PI / 2, aim: -Math.PI / 2, walk: Math.random() * 6, reload: Math.random() * MIL.reload, flash: 0, hurtCd: 0, coat: c[0], dark: c[1], tgt: null, tgtT: 0, kick: 0 };
      post.men.push(m); SGM.men.push(m);
    }
  });
}
function siegePostOf(b){ return b && b.post ? SGM.posts.filter(function(p){ return p.id === b.post; })[0] : null; }

/* ---- shooting ---- */
/* the Tower's sight test, except that a giraffe standing in her own post sees out of it (the nest and its two walls do not count) */
function milSight(m, x2, y2){
  const s = TW.solid, p = m.post, dx = x2 - m.x, dy = y2 - m.y, n = Math.ceil(Math.sqrt(dx * dx + dy * dy) / 24);
  for (let k = 1; k < n; k++){
    const x = m.x + dx * k / n, y = m.y + dy * k / n; if (!twIn(x, y)) return false;
    if (s[twCell(x, y)] && !(p && x > p.cx - 150 && x < p.cx + 150 && y > p.cy - 60 && y < p.cy + 60)) return false;
  }
  return true;
}
function milFind(m){
  let best = null, bd = MIL.range * MIL.range;
  const es = G.enemies;
  for (let i = 0; i < es.length; i++){
    const e = es[i]; if (e.dead || e.untarg || !e.def || !e.def.siege) continue;
    const dx = e.x - m.x, dy = e.y - m.y, d2 = dx * dx + dy * dy; if (d2 >= bd) continue;
    if (!milSight(m, e.x, e.y)) continue;
    bd = d2; best = e;
  }
  return best;
}
function milShot(m, e){
  const a = Math.atan2(e.y - m.y, e.x - m.x); m.aim = a; m.flash = 0.12; m.kick = 1;
  const dmg = e.big ? e.maxHp * 0.003 : MIL_HEAVY[e.type] ? e.maxHp * 0.55 : e.hp * 2 + 1;       /* one shot for most, two for the heavy ones, a chip for a boss */
  SGM.tracers.push({ x1: m.x + Math.cos(a) * 22, y1: m.y + Math.sin(a) * 22, x2: e.x, y2: e.y, t: 0.12 });
  burstParticles(m.x + Math.cos(a) * 24, m.y + Math.sin(a) * 24, 3, '#FFE9A0', 140, 2.4, { glow: true });
  sfx('zap', 0.07, m.x, m.y);
  if (dmg >= e.hp) e.xp *= 0.5;                                                  /* the experience for a militia kill is half: they did the work */
  dmgSrc = 'allies'; damageEnemy(e, dmg, { noCrit: true, quiet: true, color: '#FFE9A0' });
}

/* ---- being hit, going down, getting up ---- */
function milHurt(m, amt){
  if (m.state === 'down' || amt <= 0) return;
  m.hp -= amt; m.flash = 0.1; burstParticles(m.x, m.y, 4, '#E8A060', 90, 2.6, {});
  if (!SGM.tipped && m.hp < MIL.hp * 0.7){ SGM.tipped = true; addText(m.x, m.y - 38, 'Walk over a hurt militia giraffe to heal her', '#BFF0A0', 15, false); }
  if (m.hp <= 0){ m.hp = 0; m.state = 'down'; m.tgt = null; addText(m.x, m.y - 30, 'Down!', '#FFB070', 14, true); }
}
function milHeal(m, amt){
  const was = m.state === 'down';
  m.hp = Math.min(MIL.hp, m.hp + amt);
  if (was && m.hp >= 25){ m.state = m.post.abandoned ? 'foot' : 'post'; addText(m.x, m.y - 30, 'Back up!', '#BFF0A0', 14, true); burstParticles(m.x, m.y, 8, '#9AF0A0', 140, 3, { glow: true }); sfx('pickupS', 0.1, m.x, m.y); }
}
/* a creature's shot that reaches a giraffe hurts her and is spent (the Mars allies' hook, marsShotHitsAlly, is skipped when G.allies is empty, so the shots are looked at here) */
function siegeShotsAtMilitia(){
  const ms = SGM.men, es = G.eproj;
  for (let i = es.length - 1; i >= 0; i--){
    const p = es[i];
    for (let k = 0; k < ms.length; k++){ const m = ms[k]; if (m.state === 'down') continue; const dx = m.x - p.x, dy = m.y - p.y, rr = 16 + p.r; if (dx * dx + dy * dy < rr * rr){ milHurt(m, MIL.hitDmg); es.splice(i, 1); break; } }
  }
}
function siegePostHurt(post, amt){
  if (post.abandoned || amt <= 0) return;
  post.hp = Math.max(0, post.hp - amt); post.flash = 0.2;
  burstParticles(post.cx + rand(-40, 40), post.cy + rand(-20, 20), 4, '#C8B48A', 110, 3, {});
  if (post.hp <= MIL.abandon){
    post.abandoned = true;
    post.men.forEach(function(m){ if (m.state === 'post') m.state = 'foot'; });
    addText(post.cx, post.cy - 40, 'A post has been abandoned!', '#FFB070', 16, true); sfx('boom', 0.1, post.cx, post.cy);
  }
}

/* ---- each frame ---- */
function siegeMilitiaTick(dt){
  if (G.state !== 'playing' || !SGM.men.length) return;
  const heroes = (typeof Co !== 'undefined' && Co.on && Co.pl) ? Co.pl.filter(function(h){ return !h.down; }) : [P];
  for (let i = 0; i < SGM.posts.length; i++){ const p = SGM.posts[i]; if (p.flash > 0) p.flash -= dt; if (p.hitCd > 0) p.hitCd -= dt; }
  siegeShotsAtMilitia();
  /* creatures wear posts down and hurt giraffes that they get close to */
  const es = G.enemies;
  for (let i = 0; i < es.length; i++){
    const e = es[i]; if (e.dead || e.untarg || !e.def || !e.def.siege) continue;
    if (e.milCd > 0){ e.milCd -= dt; continue; }
    let done = false;
    for (let k = 0; k < SGM.men.length && !done; k++){ const m = SGM.men[k]; if (m.state === 'down') continue; if (hyp(e.x - m.x, e.y - m.y) < e.r + 18){ milHurt(m, MIL.hitDmg * (e.big ? 2 : 1)); e.milCd = MIL.hitCd; done = true; } }
    for (let k = 0; k < SGM.posts.length && !done; k++){
      const p = SGM.posts[k]; if (p.abandoned) continue;
      if (siegeRectDist(p.b, e.x, e.y) < e.r + 26){ siegePostHurt(p, (SIEGE_HIT[e.type] || 1) * 2.4); e.milCd = MIL.hitCd * 1.2; done = true; }
    }
  }
  for (let i = 0; i < SGM.men.length; i++){
    const m = SGM.men[i];
    if (m.flash > 0) m.flash -= dt; if (m.kick > 0) m.kick -= dt * 6;
    /* the giraffe walking over a hurt or fallen one heals her */
    if (m.hp < MIL.hp){ for (let h = 0; h < heroes.length; h++){ if (hyp(heroes[h].x - m.x, heroes[h].y - m.y) < MIL.healR){ milHeal(m, MIL.heal * dt); if (Math.random() < dt * 14) addParticle(m.x + rand(-10, 10), m.y - 6, 0, -rand(30, 60), rand(2, 3), 0.5, '#9AF0A0', { glow: true }); break; } } }
    if (m.state === 'down') continue;
    /* a post's garrison stays at its post; an abandoned post's giraffes go on foot */
    let mx = 0, my = 0;
    const p = m.post;
    if (m.state === 'post'){
      const sx = p.cx + (m.slot ? 24 : -24), sy = p.cy - 4, d = hyp(sx - m.x, sy - m.y);
      if (d > 4){ mx = (sx - m.x) / d * MIL.speed; my = (sy - m.y) / d * MIL.speed; }
    } else {                                                           /* on foot */
      let near = null, nd = MIL.flee;
      for (let k = 0; k < es.length; k++){ const e = es[k]; if (e.dead || !e.def || !e.def.siege) continue; const d = hyp(e.x - m.x, e.y - m.y); if (d < nd){ nd = d; near = e; } }
      if (near){ const d = nd || 1; mx = (m.x - near.x) / d * MIL.speed * 1.2; my = (m.y - near.y) / d * MIL.speed * 1.2; }        /* run from anything that gets close */
      else {
        let g = null, gd = 1e9;                                          /* the key building that has been hurt most lately, or the nearest standing one */
        for (const key in SGB){ const s = SGB[key]; if (s.wrecked) continue; const d = hyp(s.b.x + s.b.w / 2 - m.x, s.b.y + s.b.h / 2 - m.y) - (s.alert > 0 ? 400 : 0); if (d < gd){ gd = d; g = s; } }
        if (g){ const tx = g.b.x + g.b.w / 2 + (m.slot ? 150 : -150), ty = g.b.y + g.b.h + 110, d = hyp(tx - m.x, ty - m.y); if (d > 40){ mx = (tx - m.x) / d * MIL.speed * 0.8; my = (ty - m.y) / d * MIL.speed * 0.8; } }
      }
    }
    if (mx || my){
      const nx = m.x + mx * dt, ny = m.y + my * dt, q = { x: nx, y: ny }; if (m.state !== 'post') resolveBuildings(q, 14);
      m.x = q.x; m.y = q.y; m.face = Math.atan2(my, mx); m.walk += dt * 7;
    }
    /* shooting */
    m.reload -= dt; m.tgtT -= dt;
    if (m.tgtT <= 0){ m.tgt = milFind(m); m.tgtT = 0.2 + Math.random() * 0.1; }
    if (m.tgt && !m.tgt.dead){ m.aim = turnTo(m.aim, Math.atan2(m.tgt.y - m.y, m.tgt.x - m.x), 9 * dt); if (m.reload <= 0){ m.reload = m.state === 'post' ? MIL.reload + Math.random() * 0.4 : MIL.footReload + Math.random() * 0.4; milShot(m, m.tgt); } }
    else if (m.tgt) m.tgt = null;
  }
  for (let i = SGM.tracers.length - 1; i >= 0; i--){ SGM.tracers[i].t -= dt; if (SGM.tracers[i].t <= 0) SGM.tracers.splice(i, 1); }
}
/* the start of a wave: the posts are mended and manned again, and everybody is on her feet */
function siegeMilitiaWaveStart(n){
  if (!SGM.posts.length) return;
  SGM.posts.forEach(function(p){ p.hp = Math.min(MIL.postHp, p.hp + (n > SIEGE_FIRST_WAVE ? MIL.mend : 0)); if (p.hp > MIL.abandon) p.abandoned = false; });
  SGM.men.forEach(function(m){
    m.hp = MIL.hp; m.state = m.post.abandoned ? 'foot' : 'post'; m.tgt = null; m.hurtCd = 0;
    if (m.state === 'post' && hyp(m.x - m.post.cx, m.y - m.post.cy) > 200){ m.x = m.post.cx + (m.slot ? 24 : -24); m.y = m.post.cy - 4; }                    /* a giraffe that was a long way off is back at her post */
  });
}
const siegeMilBaseBldUpdate = updateBuildings;
updateBuildings = function(dt){ siegeMilBaseBldUpdate.apply(this, arguments); if (G.biome === 'siege' && G.chapter === SIEGE_CHAPTER) siegeMilitiaTick(dt); };
const siegeMilBaseStartWave = startWave;
startWave = function(n){ if (chapterOf(n) === SIEGE_CHAPTER) siegeMilitiaWaveStart(n); return siegeMilBaseStartWave.apply(this, arguments); };

/* ---- pictures ---- */
function sgDrawSandbags(ctx, b, t){
  const post = siegePostOf(b), hurt = post ? 1 - post.hp / MIL.postHp : 0, gone = post && post.abandoned;
  ctx.fillStyle = 'rgba(0,0,0,.3)'; ctx.fillRect(b.x + 8, b.y + 10, b.w, b.h);
  const cols = ['#B8A57A', '#A89468', '#C4B288'], horiz = b.w >= b.h, n = horiz ? Math.round(b.w / 26) : Math.round(b.h / 26), rows = Math.max(1, Math.round((horiz ? b.h : b.w) / 22));
  for (let r = 0; r < rows; r++) for (let i = 0; i < n; i++){
    const off = (r % 2) * 11, w = horiz ? b.w / n : b.w / rows, h = horiz ? b.h / rows : b.h / n;
    if (gone && csR(b.x + i * 3 + r * 7) < 0.4) continue;                                  /* torn open */
    const x = horiz ? b.x + i * w + off * 0.5 : b.x + r * w, y = horiz ? b.y + r * h : b.y + i * h + off * 0.5;
    ctx.fillStyle = cols[(i + r) % 3]; ctx.beginPath(); ctx.ellipse(x + w / 2, y + h / 2, w / 2 - 1, h / 2, 0, 0, TAU); ctx.fill();
    ctx.strokeStyle = 'rgba(60,46,24,.45)'; ctx.lineWidth = 1.4; ctx.stroke();
  }
  if (b.kind === 'nest'){ ctx.fillStyle = gone ? 'rgba(30,24,18,.55)' : 'rgba(40,52,30,.45)'; ctx.fillRect(b.x + 14, b.y + 14, b.w - 28, b.h - 28); }                  /* the dug-out middle */
  if (hurt > 0.01){ ctx.fillStyle = 'rgba(20,14,10,' + (hurt * 0.45).toFixed(2) + ')'; ctx.fillRect(b.x, b.y, b.w, b.h); }
}
function sgDrawPostStatus(ctx, b, t){
  const p = siegePostOf(b); if (!p) return;
  if (p.flash > 0){ ctx.fillStyle = 'rgba(255,220,170,' + (p.flash * 2).toFixed(2) + ')'; ctx.fillRect(b.x - 90, b.y, b.w + 180, b.h); }
  if (p.hp < MIL.postHp || p.abandoned){
    const bw = 90, bx = b.x + b.w / 2 - bw / 2, by = b.y - 14;
    ctx.fillStyle = 'rgba(14,12,16,.72)'; ctx.fillRect(bx - 2, by - 2, bw + 4, 9);
    ctx.fillStyle = p.abandoned ? '#6A2A22' : p.hp > 60 ? '#7AD86A' : '#E8B83A'; ctx.fillRect(bx, by, bw * clamp(p.hp / MIL.postHp, 0, 1), 5);
    if (p.abandoned){ ctx.font = '800 12px ui-sans-serif, sans-serif'; ctx.textAlign = 'center'; ctx.fillStyle = '#FF8A6A'; ctx.fillText('ABANDONED', b.x + b.w / 2, by - 6); }
  }
}
function drawMilitiaMan(ctx, m){
  const down = m.state === 'down', bob = down ? 0 : Math.sin(m.walk * 2) * 1.2, face = down ? m.face : m.face, aimNow = m.tgt && !down ? m.aim : m.state === 'post' ? m.aim : m.face;
  ctx.fillStyle = 'rgba(0,0,0,.28)'; ctx.beginPath(); ctx.ellipse(m.x + 3, m.y + 9, 20, 9, 0, 0, TAU); ctx.fill();
  ctx.save(); ctx.translate(m.x, m.y + bob); ctx.rotate(down ? m.face + Math.PI / 2 : face);
  if (down){ ctx.globalAlpha = 0.9; ctx.scale(1, 0.7); }
  const hurt = m.flash > 0, coat = hurt ? '#FFB9A8' : m.coat, dark = hurt ? '#C87A68' : m.dark, sw = Math.sin(m.walk * 2.2) * 5;
  ctx.fillStyle = dark; [[-10, -8, 1], [-10, 8, -1], [9, -7, -1], [9, 7, 1]].forEach(function(L){ ctx.beginPath(); ctx.ellipse(L[0] + sw * L[2] * 0.6, L[1], 5, 3.6, 0, 0, TAU); ctx.fill(); });
  ctx.strokeStyle = dark; ctx.lineWidth = 2.4; ctx.beginPath(); ctx.moveTo(-17, 0); ctx.quadraticCurveTo(-24, 3, -22, 9); ctx.stroke();
  ctx.fillStyle = coat; ctx.beginPath(); ctx.ellipse(0, 0, 18, 10, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = dark; [[-6, -3, 3], [3, 3, 3.2], [8, -4, 2.4], [-11, 4, 2.4]].forEach(function(s){ ctx.beginPath(); ctx.arc(s[0], s[1], s[2], 0, TAU); ctx.fill(); });
  ctx.fillStyle = '#3E5A34'; ctx.fillRect(-4, -10, 7, 20);                                                       /* a green sash */
  ctx.restore();
  /* the neck, head, cap and rifle point where she is aiming */
  ctx.save(); ctx.translate(m.x, m.y + bob - 2); ctx.rotate(down ? m.face : aimNow);
  if (down) ctx.scale(1, 0.7);
  ctx.strokeStyle = coat; ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(10, 0); ctx.lineTo(down ? 18 : 24, 0); ctx.stroke();
  ctx.fillStyle = coat; ctx.beginPath(); ctx.ellipse(down ? 24 : 31, 0, 8, 6, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = '#4A6A3A'; ctx.beginPath(); ctx.arc(down ? 24 : 30, 0, 6.4, Math.PI * 0.9, Math.PI * 2.1); ctx.fill();                       /* the cap */
  ctx.fillStyle = '#1E1814'; if (down){ ctx.fillRect(24, -4, 1.6, 8); } else { ctx.beginPath(); ctx.arc(33, -2, 1.5, 0, TAU); ctx.arc(33, 2, 1.5, 0, TAU); ctx.fill(); }
  if (!down){ const k = m.kick > 0 ? m.kick * 4 : 0; ctx.strokeStyle = '#3A2E22'; ctx.lineWidth = 3.4; ctx.beginPath(); ctx.moveTo(14 - k, 6); ctx.lineTo(44 - k, 6); ctx.stroke(); ctx.strokeStyle = '#8A8E96'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(38 - k, 6); ctx.lineTo(48 - k, 6); ctx.stroke(); }
  ctx.restore();
  if (m.flash > 0.05 && m.tgt){ ctx.fillStyle = 'rgba(255,230,150,.9)'; ctx.beginPath(); ctx.arc(m.x + Math.cos(m.aim) * 50, m.y + Math.sin(m.aim) * 50, 6, 0, TAU); ctx.fill(); }
  if (down || m.hp < MIL.hp){
    const bw = 34; ctx.fillStyle = 'rgba(14,12,16,.75)'; ctx.fillRect(m.x - bw / 2 - 1, m.y - 30, bw + 2, 6); ctx.fillStyle = down ? '#E8603A' : m.hp > 50 ? '#7AD86A' : '#E8B83A'; ctx.fillRect(m.x - bw / 2, m.y - 29, bw * clamp(m.hp / MIL.hp, 0, 1), 4);
    if (down){ const k = 0.6 + 0.4 * Math.sin(G.time * 6); ctx.fillStyle = 'rgba(122,240,150,' + k.toFixed(2) + ')'; ctx.fillRect(m.x - 2, m.y - 50, 4, 14); ctx.fillRect(m.x - 7, m.y - 45, 14, 4); }                         /* a green plus: walk over her */
  }
}
function drawMilitia(ctx){
  const ms = SGM.men, vx0 = G.camX - G.W / G.zoom / 2 - 80, vx1 = G.camX + G.W / G.zoom / 2 + 80, vy0 = G.camY - G.H / G.zoom / 2 - 80, vy1 = G.camY + G.H / G.zoom / 2 + 80;
  ctx.save(); ctx.lineCap = 'round';
  for (let i = 0; i < SGM.tracers.length; i++){ const q = SGM.tracers[i]; ctx.strokeStyle = 'rgba(255,236,170,' + clamp(q.t / 0.12, 0, 1).toFixed(2) + ')'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(q.x1, q.y1); ctx.lineTo(q.x2, q.y2); ctx.stroke(); }
  for (let i = 0; i < ms.length; i++){ const m = ms[i]; if (m.x < vx0 || m.x > vx1 || m.y < vy0 || m.y > vy1) continue; drawMilitiaMan(ctx, m); }
  ctx.restore();
}
const siegeBaseGiraffeGroup = drawGiraffeGroup;
drawGiraffeGroup = function(ctx){ siegeBaseGiraffeGroup.apply(this, arguments); if (G.biome === 'siege' && SGM.men.length) drawMilitia(ctx); };
