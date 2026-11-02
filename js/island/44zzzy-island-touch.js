'use strict';
/* Chapter 17, the Island Lab: things she can knock about, how the water clings to her, and the music between the beach and the lab. */
/* ========================= THE ISLAND UNDER HER HOOVES ========================= */
/* Palms: walking into a palm or kicking it shakes it, and two or three coconuts drop from its crown (b.nuts, which grow back); each lands where its shadow was
   and hits every creature it lands on for three of her kicks. Buoys bob on ropes in the shallows (ISLE_BUOYS): she and the creatures shove them aside and they drift
   back. The beached boat creaks and rocks when she walks or kicks into it.
   The water: in the shallows a wake opens behind her as she moves and each hoof splashes; for a few seconds after she comes out she leaves wet hoofprints that
   dry away. The music: the island's own theme on the beach, the reef and in the mangroves, and a tenser one (islelab) inside the lab's fence; the two change over
   at a bar line, with the music's usual dip and swell, and a little way past the fence each way so walking along it does not flip them. */
SFX.creak = function(){ const b = this.abilityGain; this.tone('sawtooth', 190, 130, 0.42, 0.035, 0, 0, b); this.tone('triangle', 330, 250, 0.36, 0.03, 0.06, 0, b); this.burst(0.3, 0.05, 700, 400, 3, 0, 'bandpass', b); };
/* the buoys' anchors: in the shallows along the beach, the coasts and the reef */
const ISLE_BUOYS = [[620, 2900], [1520, 2930], [2560, 2950], [3300, 2920], [330, 1320], [3870, 1000], [1100, 1660], [3300, 1700], [330, 620], [3870, 2300]];
function ilKickDmg(){ const s = P.stats || {}, wp = P.weapon || DEFAULT_WEAPON; return wp.dmg * (s.kickDmgMul || 1) * (s.allDmgMul || 1); }
function ilTouchTick(dt){
  const il = G.il, t = G.time, sp = Math.hypot(P.vx, P.vy);
  /* the palms */
  for (let i = 0; i < IL.all.length; i++){
    const b = IL.all[i]; if (b.kind !== 'palm' && b.kind !== 'boat') continue;
    if (b.kind === 'palm'){
      b.shake = Math.max(0, (b.shake || 0) - dt * 1.4); b.cd = (b.cd || 0) - dt;
      if (b.nuts === undefined) b.nuts = 4; if (b.nuts < 4){ b.nutT = (b.nutT || 0) + dt; if (b.nutT > 8){ b.nuts++; b.nutT = 0; } }
      if (!P.dead && sp > 60 && b.cd <= 0 && hyp(P.x - (b.x + b.w / 2), P.y - (b.y + b.h / 2)) < b.w / 2 + (P.r || 22) + 12) ilPalmKnock(b);
    } else {
      b.rock = Math.max(0, (b.rock || 0) - dt * 0.7); b.cd = (b.cd || 0) - dt;
      if (!P.dead && sp > 60 && b.cd <= 0 && P.x > b.x - (P.r || 22) - 10 && P.x < b.x + b.w + (P.r || 22) + 10 && P.y > b.y - (P.r || 22) - 10 && P.y < b.y + b.h + (P.r || 22) + 10) ilBoatKnock(b);
    }
  }
  /* the coconuts: falling, landing, lying a while */
  if (il.nuts) for (let i = il.nuts.length - 1; i >= 0; i--){
    const n = il.nuts[i]; n.t += dt;
    if (!n.down && n.t >= n.fall){
      n.down = true; const near = enemiesNear(n.x, n.y, 70, []), dm = ilKickDmg() * 3; let hit = false;
      for (let k = 0; k < near.length; k++){ const e = near[k]; if (e.dead || e.untarg || e.def.flyOver) continue; damageEnemy(e, dm, {}); hit = true; }
      burstParticles(n.x, n.y, 5, '#D6C28C', 90, 2); if (hit){ addText(n.x, n.y - 30, 'BONK', '#E8C05A', 15, false); sfx('hit', 0.06, n.x, n.y); }
    }
    if (n.t > n.fall + 9) il.nuts.splice(i, 1);
  }
  /* the buoys: shoved by her and by whatever wades into them, pulled back on their ropes */
  il.buoys = il.buoys || ISLE_BUOYS.map(function(a){ return { ax: a[0], ay: a[1], x: a[0], y: a[1], vx: 0, vy: 0 }; });
  for (let i = 0; i < il.buoys.length; i++){
    const o = il.buoys[i];
    const push = function(px, py, pr, pvx, pvy){ const dx = o.x - px, dy = o.y - py, d = Math.hypot(dx, dy) || 1, m = pr + 13; if (d >= m) return; const nx = dx / d, ny = dy / d; o.x = px + nx * m; o.y = py + ny * m; const v = Math.max(0, pvx * nx + pvy * ny) + 90; o.vx += nx * v * 0.6; o.vy += ny * v * 0.6; o.bump = 1; };
    if (!P.dead) push(P.x, P.y, P.r || 22, P.vx, P.vy);
    for (let k = 0; k < G.enemies.length; k++){ const e = G.enemies[k]; if (e.dead || e.hidden || e.def.flyOver || Math.abs(e.x - o.x) > 90 || Math.abs(e.y - o.y) > 90) continue; push(e.x, e.y, e.r, e.vx || 0, e.vy || 0); }
    o.vx += (o.ax - o.x) * 2.2 * dt; o.vy += (o.ay - o.y) * 2.2 * dt; const f = Math.exp(-dt * 2.4); o.vx *= f; o.vy *= f; o.x += o.vx * dt; o.y += o.vy * dt;
    const L = Math.hypot(o.x - o.ax, o.y - o.ay); if (L > 110){ o.x = o.ax + (o.x - o.ax) / L * 110; o.y = o.ay + (o.y - o.ay) / L * 110; }
    o.bump = Math.max(0, (o.bump || 0) - dt * 2);
  }
  /* the water on her: a wake and a splash for every hoof in the shallows, wet hoofprints for a while after */
  const wet = isleWet(P.x, P.y), k = Math.floor((P.walk || 0) / Math.PI);
  il.wake = il.wake || []; il.prints = il.prints || [];
  if (wet) il.dryT = 0; else il.dryT = (il.dryT === undefined ? 99 : il.dryT) + dt;
  if (wet && sp > 40 && !P.dead){ const l = il.wake[0]; if (!l || hyp(P.x - l.x, P.y - l.y) > 18){ il.wake.unshift({ x: P.x, y: P.y + 6, a: Math.atan2(P.vy, P.vx), t: 0 }); if (il.wake.length > 36) il.wake.pop(); } }
  for (let i = il.wake.length - 1; i >= 0; i--){ il.wake[i].t += dt; if (il.wake[i].t > 1.4) il.wake.splice(i, 1); }
  if (k !== il.step){
    il.step = k; il.lr = !il.lr;
    if (sp > 45 && !P.dead){
      const a = Math.atan2(P.vy, P.vx), side = il.lr ? 1 : -1, hx = P.x + Math.cos(a) * 10 - Math.sin(a) * 9 * side, hy = P.y + 8 + Math.sin(a) * 10 + Math.cos(a) * 9 * side;
      if (wet) ilSplash(hx, hy, 0.55);
      else if (il.dryT < 4.5){ il.prints.unshift({ x: hx, y: hy, a: a, t: 0, w: 1 - il.dryT / 4.5 }); if (il.prints.length > 60) il.prints.pop(); }
    }
  }
  for (let i = il.prints.length - 1; i >= 0; i--){ il.prints[i].t += dt; if (il.prints[i].t > 8) il.prints.splice(i, 1); }
}
function ilPalmKnock(b){
  b.cd = 1.6; b.shake = 1; sfx('rustle', 0.2, b.x + b.w / 2, b.y);
  const il = G.il; if (!il) return; il.nuts = il.nuts || [];
  const n = Math.min(b.nuts === undefined ? 4 : b.nuts, 2 + (Math.random() < 0.5 ? 1 : 0)), cx = b.x + b.w / 2, cy = b.y + b.h / 2;
  for (let i = 0; i < n; i++){
    for (let tries = 0; tries < 8; tries++){ const a = Math.random() * TAU, d = rand(45, 95), x = cx + Math.cos(a) * d, y = cy + Math.sin(a) * d;
      if (!ilClear(x, y, 6)) continue; il.nuts.push({ x: x, y: y, t: -i * 0.12, fall: 0.55, down: false, a: Math.random() * TAU }); b.nuts = (b.nuts === undefined ? 4 : b.nuts) - 1; b.nutT = 0; break; }
  }
}
function ilBoatKnock(b){ b.cd = 1.4; b.rock = 1; sfx('creak', 0.3, b.x + b.w / 2, b.y + b.h / 2); ilSplash(b.x + rand(0, b.w), b.y + (Math.random() < 0.5 ? 0 : b.h), 0.9); }
/* a kick at a palm shakes it and at the boat rocks it, as walking into them does */
const ilTouchBaseDeflect = deflectSpark;
deflectSpark = function(b){ const r = ilTouchBaseDeflect.apply(this, arguments); if (b && b.isle && G.il){ if (b.kind === 'palm' && !(b.cd > 0)) ilPalmKnock(b); else if (b.kind === 'boat' && !(b.cd > 0)) ilBoatKnock(b); } return r; };
const ilTouchBaseBld = updateBuildings;
updateBuildings = function(dt){ ilTouchBaseBld.apply(this, arguments); if (G.biome === 'isle' && G.chapter === ISLE_CHAPTER && G.il) ilTouchTick(dt); };

/* ---------------------------------------------------------------- drawing: prints, the wake, buoys and coconuts, over the ground and under the creatures */
const ilTouchBaseDrawGround = drawGround;
drawGround = function(ctx, cx, cy, vw, vh){
  ilTouchBaseDrawGround.apply(this, arguments);
  if (G.biome !== 'isle' || G.state === 'menu' || !G.il) return;
  ilTouchWorld(ctx, cx - vw / 2, cy - vh / 2, cx + vw / 2, cy + vh / 2, G.time);
};
function ilTouchWorld(ctx, x0, y0, x1, y1, t){
  const il = G.il;
  if (il.prints) for (let i = 0; i < il.prints.length; i++){                                             /* wet hoofprints: two halves of a cloven hoof, darker sand, drying */
    const p = il.prints[i]; if (!ilOn(x0, y0, x1, y1, p.x, p.y, 20)) continue; const a = Math.min(1, (8 - p.t) / 3) * 0.75 * (0.35 + 0.65 * p.w); if (a < 0.02) continue;
    ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.a); ctx.fillStyle = 'rgba(70,54,30,' + a.toFixed(3) + ')';
    ctx.beginPath(); ctx.ellipse(1, -3, 5.6, 2.6, -0.1, 0, TAU); ctx.fill(); ctx.beginPath(); ctx.ellipse(1, 3, 5.6, 2.6, 0.1, 0, TAU); ctx.fill(); ctx.restore();
  }
  if (il.wake && il.wake.length){                                                                       /* the wake: two lines opening out behind her */
    ctx.lineWidth = 3; ctx.lineCap = 'round';
    for (let i = 0; i < il.wake.length; i++){ const w = il.wake[i]; if (!ilOn(x0, y0, x1, y1, w.x, w.y, 80) || !isleWet(w.x, w.y)) continue;
      const k = w.t / 1.4, o = 12 + k * 46, back = k * 20, nx = -Math.sin(w.a), ny = Math.cos(w.a), bx = w.x - Math.cos(w.a) * back, by = w.y - Math.sin(w.a) * back;
      ctx.strokeStyle = 'rgba(248,255,255,' + (0.85 * (1 - k)).toFixed(3) + ')';
      for (const sd of [-1, 1]){ const px = bx + nx * o * sd, py = by + ny * o * sd; ctx.beginPath(); ctx.moveTo(px - Math.cos(w.a) * 10, py - Math.sin(w.a) * 10); ctx.lineTo(px + Math.cos(w.a) * 10 - nx * sd * 4, py + Math.sin(w.a) * 10 - ny * sd * 4); ctx.stroke(); }
    }
    ctx.lineCap = 'butt';
  }
  if (il.buoys) for (let i = 0; i < il.buoys.length; i++){                                               /* the buoys: the anchor block on the bottom, the rope, the float */
    const o = il.buoys[i]; if (!ilOn(x0, y0, x1, y1, o.x, o.y, 140)) continue; const bob = Math.sin(t * 2 + i) * 0.8;
    ctx.fillStyle = 'rgba(30,50,54,.45)'; ctx.fillRect(o.ax - 6, o.ay - 4, 12, 8);
    ctx.strokeStyle = 'rgba(220,200,150,.55)'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(o.ax, o.ay); ctx.quadraticCurveTo((o.ax + o.x) / 2, (o.ay + o.y) / 2 + 10, o.x, o.y); ctx.stroke();
    const ph = (t * 0.9 + i * 0.3) % 1; ctx.strokeStyle = 'rgba(240,252,250,' + (0.5 * (1 - ph) + 0.3 * (o.bump || 0)).toFixed(3) + ')'; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(o.x, o.y + 2, 14 + ph * 12, 10 + ph * 8, 0, 0, TAU); ctx.stroke();
    ctx.fillStyle = 'rgba(10,30,40,.25)'; ctx.beginPath(); ctx.ellipse(o.x + 4, o.y + 6, 11, 8, 0, 0, TAU); ctx.fill();
    fillCircle(ctx, o.x, o.y + bob, 11, '#D8402A'); ctx.save(); ctx.beginPath(); ctx.arc(o.x, o.y + bob, 11, 0, TAU); ctx.clip(); ctx.fillStyle = '#F2EEDC'; ctx.fillRect(o.x - 12, o.y + bob - 3, 24, 6); ctx.restore();
    fillCircle(ctx, o.x - 3, o.y + bob - 4, 3, 'rgba(255,255,255,.35)'); fillCircle(ctx, o.x, o.y + bob, 3.4, '#2A2E34'); fillCircle(ctx, o.x, o.y + bob, 1.6, '#8A9294');
  }
  if (il.nuts) for (let i = 0; i < il.nuts.length; i++){                                                /* the coconuts: the shadow grows under one falling, then it lies there */
    const n = il.nuts[i]; if (n.t < 0 || !ilOn(x0, y0, x1, y1, n.x, n.y, 120)) continue;
    const u = Math.min(1, n.t / n.fall), h = n.down ? Math.max(0, Math.sin(Math.min(1, (n.t - n.fall) / 0.3) * Math.PI) * 6) : 90 * (1 - u * u), fade = n.down ? clamp((n.fall + 9 - n.t) / 1.5, 0, 1) : 1;
    ctx.save(); ctx.globalAlpha = fade;
    ctx.fillStyle = 'rgba(10,30,40,' + (0.12 + 0.2 * u).toFixed(3) + ')'; ctx.beginPath(); ctx.ellipse(n.x + 2, n.y + 4, 4 + 5 * u, 3 + 3 * u, 0, 0, TAU); ctx.fill();
    const s = n.down ? 1 : 1.25 - 0.25 * u; fillCircle(ctx, n.x, n.y - h, 7 * s, '#5A3A1E'); fillCircle(ctx, n.x - 2 * s, n.y - h - 2 * s, 2.6 * s, '#8A6A44');
    for (let q = 0; q < 3; q++){ const a = n.a + q * TAU / 3; fillCircle(ctx, n.x + Math.cos(a) * 2.6 * s, n.y - h + Math.sin(a) * 2.6 * s, 0.9 * s, '#2A1A0E'); }
    ctx.restore();
  }
}

/* ---------------------------------------------------------------- the music: the beach, and the lab */
MUSIC_THEMES.islelab = { bpm: 108, root: 50, scale: 'phrygian', prog: [0, 1, 0, 8], minor: true, bass: 'sawtooth', lead: 'square', drum: 'heavy' };
const ilTouchBaseMusic = Music.refresh;
Music.refresh = function(){
  ilTouchBaseMusic.apply(this, arguments);
  if (G.state !== 'playing' || G.attract || G.biome !== 'isle' || G.chapter !== ISLE_CHAPTER || !G.il) return;
  const il = G.il; if (P.y < 900) il.inLab = true; else if (P.y > 1010) il.inLab = false;          /* the fence is at 900: in past it, out a little way below it */
  if (il.inLab && this.want.theme === 'isle') this.want.theme = 'islelab';
};
