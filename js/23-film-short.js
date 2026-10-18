'use strict';
/* The short travel films between chapters. */
/* ======================= THE SHORT TRAVEL FILMS (the end of Chapters 1-6, 9 and 10) ======================= */
/* Each is 8-10 seconds long: the giraffe on the move from the place she has just cleared to the next one. Chapters 1-6 are a walk (or a wade) in
   which the scenery fades from one place into the other; Chapter 9 stays on Venus, where more fire aliens come in over the battlefield; Chapter 10
   is the spaceplane's flight home. Like the other films, every frame is a pure function of time. */
const SH_LOC = {
  savanna: { sky: ['#3F78C4', '#BBD8F0'], gnd: ['#9A8450', '#6A5A30'], ridge: '#7A6A48' },
  snow:    { sky: ['#9CB4C8', '#E6EEF4'], gnd: ['#E8F0F6', '#B8CAD8'], ridge: '#B8CCDC' },
  swamp:   { sky: ['#4A5A3A', '#9AAA70'], gnd: ['#3E4A2C', '#2A3420'], ridge: '#4A5A3A' },
  ocean:   { sky: ['#2A78B0', '#A8D8F0'], gnd: ['#1E6AA0', '#0F3A60'], ridge: '#6AA8D0', water: true },
  jungle:  { sky: ['#5AA050', '#C8E0A0'], gnd: ['#2A4A1C', '#1A2E10'], ridge: '#2E5A2A' },
  city:    { sky: ['#6A7A98', '#E0C898'], gnd: ['#4A4A50', '#2E2E34'], ridge: '#8A92A8' },
  space:   { sky: ['#4A8AD0', '#C8E4F8'], gnd: ['#6A7A5A', '#4A5A3A'], ridge: '#8AA0B0' }
};
const SH_FILMS = {
  1:  { from: 'savanna', to: 'snow',   title: 'FROSTREACH',       sub: 'The giraffe treks north, into the snow', T: 8 },
  2:  { from: 'snow',    to: 'swamp',  title: 'MURKFEN',          sub: 'The giraffe wades on, into the swamp', T: 8 },
  3:  { from: 'swamp',   to: 'ocean',  title: 'THE DEEP',         sub: 'The giraffe swims on, into open water', T: 8 },
  4:  { from: 'ocean',   to: 'jungle', title: 'THE CANOPY',       sub: 'The giraffe washes ashore, into the rainforest', T: 8 },
  5:  { from: 'jungle',  to: 'city',   title: 'HOUSTON',          sub: 'The giraffe wanders out of the forest into an empty city', T: 8 },
  6:  { from: 'city',    to: 'space',  title: 'THE SPACE CENTER', sub: 'The giraffe follows the freeway south-east', T: 8 },
  9:  { special: 'inferno', title: 'THE INFERNO', sub: 'The fire is not finished. More are coming.', T: 10 }
};
function shLen(n){ return SH_FILMS[n] ? SH_FILMS[n].T : 8; }
function shChapterOf(kind){ return /^sh\d+$/.test(kind || '') ? +kind.slice(2) : 0; }
/* the horizon's hills, and the things that stand on the ground, for each place; a is how visible that place is while the two blend */
function shBack(ctx, name, sc, a){
  ctx.globalAlpha = a; afRidge(ctx, 462, name === 'ocean' ? 4 : 60, 2.7 + name.length, SH_LOC[name].ridge, sc * 0.1); ctx.globalAlpha = 1;
}
function shFront(ctx, name, sc, a, hy){
  if (a < 0.01 || name === 'ocean') return;
  ctx.globalAlpha = a;
  const N = name === 'city' ? 14 : 8;
  for (let k = 0; k < N; k++){
    const par = 0.75 + csR(k + 11100) * 0.5, y = hy + 8 + csR(k + 11200) * 70, s = 0.7 + csR(k + 11300) * 0.7 + (y - hy) / 200;
    const x = (((csR(k + 11000 + name.length * 7) * 2200 - sc * par) % 2200) + 2200) % 2200 - 400;
    if (name === 'savanna') afAcacia(ctx, x, y, s);
    else if (name === 'snow'){
      ctx.fillStyle = '#4A3A2A'; ctx.fillRect(x - 3 * s, y - 14 * s, 6 * s, 14 * s);
      for (let i = 0; i < 3; i++){ ctx.fillStyle = i % 2 ? '#2E5A46' : '#3A6A52'; ctx.beginPath(); ctx.moveTo(x - (34 - i * 8) * s, y - (10 + i * 26) * s); ctx.lineTo(x, y - (60 + i * 26) * s); ctx.lineTo(x + (34 - i * 8) * s, y - (10 + i * 26) * s); ctx.closePath(); ctx.fill(); ctx.fillStyle = '#F4F8FA'; ctx.beginPath(); ctx.moveTo(x - 12 * s, y - (38 + i * 26) * s); ctx.lineTo(x, y - (60 + i * 26) * s); ctx.lineTo(x + 12 * s, y - (38 + i * 26) * s); ctx.closePath(); ctx.fill(); }
    } else if (name === 'swamp'){
      ctx.fillStyle = '#2A2A1A'; ctx.beginPath(); ctx.moveTo(x - 14 * s, y); ctx.lineTo(x - 5 * s, y - 90 * s); ctx.lineTo(x + 5 * s, y - 90 * s); ctx.lineTo(x + 14 * s, y); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#4A5A32'; ctx.beginPath(); ctx.ellipse(x, y - 96 * s, 46 * s, 16 * s, 0, 0, TAU); ctx.fill();
      ctx.strokeStyle = '#8A9A6A'; ctx.lineWidth = 2; ctx.beginPath(); for (let i = -3; i <= 3; i++){ ctx.moveTo(x + i * 12 * s, y - 90 * s); ctx.lineTo(x + i * 12 * s + 3, y - (50 + Math.abs(i) * 6) * s); } ctx.stroke();
    } else if (name === 'jungle'){
      ctx.fillStyle = '#3A2A1A'; ctx.fillRect(x - 8 * s, y - 130 * s, 16 * s, 130 * s);
      for (const [dx, dy, r] of [[0, -150, 50], [-34, -128, 38], [34, -130, 40]]){ ctx.fillStyle = '#1E4A1E'; ctx.beginPath(); ctx.arc(x + dx * s, y + dy * s, r * s, 0, TAU); ctx.fill(); ctx.fillStyle = '#2E6A2A'; ctx.beginPath(); ctx.arc(x + dx * s - 6 * s, y + dy * s - 6 * s, r * s * 0.6, 0, TAU); ctx.fill(); }
      ctx.strokeStyle = '#3E7A2E'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x + 6 * s, y - 120 * s); ctx.quadraticCurveTo(x + 18 * s, y - 70 * s, x + 4 * s, y - 20 * s); ctx.stroke();
    } else if (name === 'city'){
      const w = 40 + csR(k + 11400) * 50, h = 90 + csR(k + 11500) * 220;
      ctx.fillStyle = '#3A3E52'; ctx.fillRect(x - w / 2, y - h, w, h); ctx.fillStyle = '#2A2E42'; ctx.fillRect(x - w / 2, y - h, 6, h);
      for (let wy = y - h + 10; wy < y - 14; wy += 18) for (let wx = x - w / 2 + 10; wx < x + w / 2 - 8; wx += 14){ ctx.fillStyle = csR(wx * 3 + wy) > 0.6 ? '#FFD890' : '#4A5068'; ctx.fillRect(wx, wy, 7, 9); }
    } else if (name === 'space'){
      if (k < 2){                                                                                           /* a rocket on its pad, with a gantry beside it */
        const rx = x + k * 0, h = 260 * (0.8 + s * 0.3);
        ctx.fillStyle = '#F4F6FA'; ctx.fillRect(rx - 22, y - h, 44, h); ctx.beginPath(); ctx.moveTo(rx - 22, y - h); ctx.lineTo(rx, y - h - 60); ctx.lineTo(rx + 22, y - h); ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#C8302A'; ctx.fillRect(rx - 22, y - h + 40, 44, 14); ctx.fillStyle = '#2A2E3A'; ctx.fillRect(rx - 22, y - 30, 44, 30);
        ctx.strokeStyle = '#6A6E7A'; ctx.lineWidth = 3; ctx.strokeRect(rx + 34, y - h * 0.9, 18, h * 0.9); ctx.beginPath(); for (let gy2 = y - h * 0.9; gy2 < y; gy2 += 24){ ctx.moveTo(rx + 34, gy2); ctx.lineTo(rx + 52, gy2 + 24); } ctx.moveTo(rx + 34, y - h * 0.7); ctx.lineTo(rx + 22, y - h * 0.7); ctx.stroke();
      } else {
        const w = 60 + csR(k + 11600) * 60, h = 36 + csR(k + 11700) * 44;
        ctx.fillStyle = '#9AA6B8'; ctx.fillRect(x - w / 2, y - h, w, h); ctx.fillStyle = '#6A7A98'; ctx.fillRect(x - w / 2, y - h, w, 6);
        ctx.fillStyle = '#5A8AC8'; for (let wx = x - w / 2 + 8; wx < x + w / 2 - 10; wx += 16) ctx.fillRect(wx, y - h + 14, 9, 10);
      }
    }
  }
  ctx.globalAlpha = 1;
}
function shWalk(ctx, t, f){
  const A = SH_LOC[f.from], B = SH_LOC[f.to], p = csSm(2.0, 5.0, t), hy = 470, sc = t * 150;
  afSky(ctx, csHex(A.sky[0], B.sky[0], p), csHex(csHex(A.sky[0], A.sky[1], 0.5), csHex(B.sky[0], B.sky[1], 0.5), p), csHex(A.sky[1], B.sky[1], p));
  csGlow(ctx, 1000, 140, 260, '#FFF0C8', 0.25);
  afClouds(ctx, sc * 0.3, 5, 50, 250, 0.45, '#FFFFFF');
  shBack(ctx, f.from, sc, 1 - p); shBack(ctx, f.to, sc, p);
  const g = ctx.createLinearGradient(0, hy, 0, CS_H); g.addColorStop(0, csHex(A.gnd[0], B.gnd[0], p)); g.addColorStop(1, csHex(A.gnd[1], B.gnd[1], p)); ctx.fillStyle = g; ctx.fillRect(0, hy, CS_W, CS_H - hy);
  ctx.fillStyle = 'rgba(0,0,0,.12)'; for (let k = 0; k < 30; k++){ const x = (((csR(k + 11800) * 1500 - sc * 1.4) % 1500) + 1500) % 1500 - 100, y = hy + 20 + csR(k + 11900) * (CS_H - hy - 40); ctx.fillRect(x, y, 20 + csR(k + 11950) * 40, 2); }
  shFront(ctx, f.from, sc, 1 - p, hy); shFront(ctx, f.to, sc, p, hy);
  const ws = (f.from === 'snow' ? 1 - p : 0) + (f.to === 'snow' ? p : 0);
  const wa = (A.water ? 1 - p : 0) + (B.water ? p : 0);
  csGiraffe(ctx, { x: 560, y: 612 + 20 * wa + Math.sin(t * 7) * 1.5, s: 0.95, face: 1, walk: t * 7, moving: true, neck: 0.3, head: 0.1, bare: true, boots: false });
  if (wa > 0.02){                                                                                       /* she is up to her knees, then deeper, in water */
    const wy = 580;
    ctx.beginPath(); ctx.moveTo(0, CS_H); ctx.lineTo(0, wy);
    for (let x = 0; x <= CS_W; x += 20) ctx.lineTo(x, wy + Math.sin(x * 0.03 + t * 3) * 4);
    ctx.lineTo(CS_W, CS_H); ctx.closePath();
    const wg = ctx.createLinearGradient(0, wy, 0, CS_H); wg.addColorStop(0, 'rgba(70,170,220,' + 0.5 * wa + ')'); wg.addColorStop(1, 'rgba(20,80,140,' + 0.7 * wa + ')'); ctx.fillStyle = wg; ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,' + 0.5 * wa + ')'; ctx.lineWidth = 2; ctx.beginPath(); for (let x = 0; x <= CS_W; x += 20){ const y = wy + Math.sin(x * 0.03 + t * 3) * 4; if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y); } ctx.stroke();
  }
  if (ws > 0.02){ ctx.fillStyle = '#FFFFFF'; for (let k = 0; k < 60; k++){ ctx.globalAlpha = 0.85 * ws; ctx.beginPath(); ctx.arc(((csR(k + 12200) * 1400 + Math.sin(t + k) * 20 - sc * 0.2) % 1400 + 1400) % 1400 - 60, (csR(k + 12300) * 800 + t * 90 * (0.6 + csR(k + 12400))) % 800 - 40, 1.5 + csR(k + 12500) * 1.8, 0, TAU); ctx.fill(); } ctx.globalAlpha = 1; }
}
/* Chapter 9 into Chapter 10: the same battlefield, from above as in the game, and fire aliens flooding in from the east */
function shInferno(ctx, t){
  const z = venusBaseZone(), cx = z.x + 260, cy = z.y;
  const saved = { biome: G.biome, buildings: G.buildings, rocket: G.rocket, x: P.x, y: P.y, vx: P.vx, vy: P.vy, face: P.face, aim: P.aim, walk: P.walk, invuln: P.invuln, hurtT: P.hurtT, kickAnim: P.kickAnim };
  const keep = G.particles.length;
  ctx.save();
  try {
    G.biome = 'venus'; G.buildings = []; G.rocket = null;
    ctx.translate(CS_W / 2, CS_H / 2); ctx.translate(-cx, -cy);
    drawGroundVenus(ctx, cx, cy, CS_W, CS_H);
    const types = ['hyena', 'sword', 'cheetah', 'rhino', 'jackal', 'vulture', 'honeybadger', 'baboon'];
    for (let k = 0; k < 46; k++){
      const ts = 0.4 + k * 0.19; if (t < ts) continue;
      const u = csC((t - ts) / 3.2, 0, 1), e = 1 - Math.pow(1 - u, 3), th = (csR(k + 12000) - 0.5) * 2.2, d = 240 + csR(k + 12100) * 420;
      const dist = csLerp(1100, d, e), ex = z.x + Math.cos(th) * dist, ey = z.y + Math.sin(th) * dist, type = types[k % types.length], def = ETYPES_INFERNO[type];
      drawEnemy(ctx, { portrait: true, def: def, type: type, x: ex, y: ey, r: def.r, ang: Math.atan2(z.y - ey, z.x - ex), flash: 0, state: 'idle', anim: t * 6 + k, hp: 1, maxHp: 1, big: def.big, kx: 0, ky: 0, stunT: 0, burnT: 0, slowT: 0, slowMul: 1 });
    }
    P.x = z.x; P.y = z.y; P.vx = 0; P.vy = 0; P.invuln = 0; P.hurtT = 0; P.kickAnim = 0; P.walk = 0; P.aim = 0; P.face = 0;
    drawPlayer(ctx);
  } catch (err) {}
  finally {
    ctx.restore();
    G.biome = saved.biome; G.buildings = saved.buildings; G.rocket = saved.rocket;
    P.x = saved.x; P.y = saved.y; P.vx = saved.vx; P.vy = saved.vy; P.face = saved.face; P.aim = saved.aim; P.walk = saved.walk; P.invuln = saved.invuln; P.hurtT = saved.hurtT; P.kickAnim = saved.kickAnim;
    if (G.particles.length > keep) G.particles.length = keep;
  }
}
function shScene(ctx, t, n){
  const f = SH_FILMS[n]; if (!f) return;
  if (f.special === 'inferno') shInferno(ctx, t);
  else shWalk(ctx, t, f);
}
function shOverlays(ctx, t, n){
  const f = SH_FILMS[n]; if (!f) return;
  const v = ctx.createRadialGradient(640, 360, 300, 640, 360, 780); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, f.special === 'inferno' ? 'rgba(120,10,0,' + (0.35 + 0.12 * Math.sin(t * 5)) + ')' : 'rgba(0,0,0,.4)');
  ctx.fillStyle = v; ctx.fillRect(0, 0, CS_W, CS_H);
  const c0 = f.special === 'inferno' ? 0.8 : 3.0, a = csSm(0, 0.3, t - c0) * (1 - csSm(3.3, 3.7, t - c0));
  if (a > 0.01){
    ctx.globalAlpha = a; ctx.fillStyle = 'rgba(0,0,10,.58)'; ctx.fillRect(0, 618, 860, 84); ctx.fillStyle = f.special === 'inferno' ? '#FF8A3A' : '#FFD27A'; ctx.fillRect(0, 618, 5, 84);
    csText(ctx, f.title, 26, 652, 25, '#F4F8FF', 'left', '800'); csText(ctx, f.sub, 26, 682, 15, '#C8D0E0', 'left', '600'); ctx.globalAlpha = 1;
  }
  const fd = Math.max(1 - csSm(0, 0.8, t), csSm(f.T - 1.2, f.T, t));
  if (fd > 0.005){ ctx.fillStyle = 'rgba(0,0,0,' + fd + ')'; ctx.fillRect(0, 0, CS_W, CS_H); }
}
const SH_CUES = [];
(function(){
  const add = (t, fn) => SH_CUES.push([t, fn]);
  add(0.4, () => SFX.whoosh()); add(3.5, () => SFX.click()); add(6.5, () => SFX.whoosh());
  SH_CUES.sort((a, b) => a[0] - b[0]);
})();

