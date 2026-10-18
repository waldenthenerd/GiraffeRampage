'use strict';
/* The Moon (chapter 8). */
/* ========================= THE MOON (Chapter 8) ========================= */
/* Grey regolith, craters, scattered boulders, and -- where the giraffe landed
   at the end of Chapter 7 -- the burned-out remains of the lander. It is all
   ground scenery (nothing blocks you): the Marines are the obstacle. */
const MOON_WRECK = { x: 940, y: 690 };
const MOON_CRATERS = [], MOON_ROCKS = [];
for (let i = 0; i < 85; i++) MOON_CRATERS.push({ x: 90 + csR(i + 4100) * (ARENA_W - 180), y: 90 + csR(i + 4200) * (ARENA_H - 180), r: 44 + Math.pow(csR(i + 4300), 1.8) * 150 });
for (let i = 0; i < 290; i++) MOON_ROCKS.push({ x: csR(i + 4400) * ARENA_W, y: csR(i + 4500) * ARENA_H, r: 4 + csR(i + 4600) * 12, a: csR(i + 4700) * TAU });
let groundPatternMoon = null;
function buildGroundMoon(){
  const c = document.createElement('canvas');
  c.width = 128; c.height = 128;
  const g = c.getContext('2d');
  if (!g) return;
  g.fillStyle = '#8D8C88'; g.fillRect(0, 0, 128, 128);
  for (let i = 0; i < 320; i++){
    g.fillStyle = ['#7E7D79', '#9A9994', '#858481', '#A3A29C'][(Math.random() * 4) | 0];
    g.fillRect(Math.random() * 128, Math.random() * 128, 1 + Math.random() * 2, 1 + Math.random() * 2);
  }
  const ctx = CTX;
  if (ctx && ctx.createPattern) groundPatternMoon = ctx.createPattern(c, 'repeat');
}
function buildMoon(){ G.buildings = []; G.rocket = null; }
function drawMoonWreck(ctx){
  const w = MOON_WRECK;
  const sg = ctx.createRadialGradient(w.x, w.y, 10, w.x, w.y, 190); sg.addColorStop(0, 'rgba(24,22,20,.8)'); sg.addColorStop(0.6, 'rgba(40,38,34,.4)'); sg.addColorStop(1, 'rgba(60,58,54,0)');
  ctx.fillStyle = sg; ctx.beginPath(); ctx.arc(w.x, w.y, 190, 0, TAU); ctx.fill();                       /* the scorch */
  for (let k = 0; k < 26; k++){                                                                            /* scattered wreckage */
    const a = csR(k + 4800) * TAU, dd = 40 + csR(k + 4900) * 150, x = w.x + Math.cos(a) * dd, y = w.y + Math.sin(a) * dd;
    ctx.save(); ctx.translate(x, y); ctx.rotate(csR(k + 5000) * TAU);
    if (k % 4 === 0){ ctx.fillStyle = '#C79A32'; ctx.fillRect(-9, -5, 18, 10); ctx.fillStyle = '#F0D480'; ctx.fillRect(-9, -5, 18, 3); }
    else if (k % 4 === 1){ ctx.strokeStyle = '#A6A8B0'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-14, 0); ctx.lineTo(14, 0); ctx.stroke(); }
    else if (k % 4 === 2){ ctx.fillStyle = '#5A5C64'; ctx.beginPath(); ctx.moveTo(-8, -6); ctx.lineTo(10, -3); ctx.lineTo(6, 7); ctx.lineTo(-9, 4); ctx.closePath(); ctx.fill(); }
    else { ctx.fillStyle = '#C4C7CE'; ctx.beginPath(); ctx.ellipse(0, 0, 8, 3, 0, 0, TAU); ctx.fill(); }
    ctx.restore();
  }
  ctx.strokeStyle = '#6E7078'; ctx.lineWidth = 5; ctx.lineCap = 'round';                                  /* what is left of the legs */
  for (let k = 0; k < 4; k++){ const a = k * TAU / 4 + 0.6, bend = k === 1 ? 0.5 : 1; ctx.beginPath(); ctx.moveTo(w.x + Math.cos(a) * 14, w.y + Math.sin(a) * 14); ctx.lineTo(w.x + Math.cos(a) * 62 * bend, w.y + Math.sin(a) * 62 * bend); ctx.stroke(); ctx.fillStyle = '#B4B7BE'; ctx.beginPath(); ctx.arc(w.x + Math.cos(a) * 62 * bend, w.y + Math.sin(a) * 62 * bend, 8, 0, TAU); ctx.fill(); }
  ctx.lineCap = 'butt';
  ctx.fillStyle = '#26221E'; ctx.beginPath(); for (let k = 0; k < 8; k++){ const a = k / 8 * TAU + 0.4, r = k % 2 ? 38 : 33; ctx.lineTo(w.x + Math.cos(a) * r, w.y + Math.sin(a) * r); } ctx.closePath(); ctx.fill();   /* the charred descent stage */
  ctx.strokeStyle = 'rgba(199,154,50,.55)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(w.x - 22, w.y - 10); ctx.lineTo(w.x - 8, w.y + 4); ctx.moveTo(w.x + 6, w.y - 20); ctx.lineTo(w.x + 22, w.y - 6); ctx.stroke();
  ctx.fillStyle = '#0E0C0A'; ctx.beginPath(); ctx.arc(w.x, w.y, 13, 0, TAU); ctx.fill();               /* the engine bell */
  ctx.strokeStyle = '#5A5450'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(w.x, w.y, 13, 0, TAU); ctx.stroke();
  const gl = 0.10 + 0.05 * Math.sin(G.time * 2); csGlow(ctx, w.x, w.y, 34, '#FF7A2A', gl);              /* it still smoulders */
  ctx.fillStyle = 'rgba(80,72,66,.7)'; for (let k = 0; k < 9; k++) ctx.fillRect(w.x - 190 + k * 8 + csR(k + 5100) * 4, w.y + 190 + Math.sin(k) * 3, 4, 2);   /* hoofprints leading away, from the ending */
}
function drawGroundMoon(ctx, cx, cy, vw, vh){
  const x0 = cx - vw / 2, y0 = cy - vh / 2;
  ctx.fillStyle = groundPatternMoon || '#8D8C88';
  ctx.fillRect(x0 - 40, y0 - 40, vw + 80, vh + 80);
  for (let i = 0; i < MOON_CRATERS.length; i++){
    const c = MOON_CRATERS[i];
    if (c.x + c.r < x0 - 30 || c.x - c.r > x0 + vw + 30 || c.y + c.r < y0 - 30 || c.y - c.r > y0 + vh + 30) continue;
    const g = ctx.createRadialGradient(c.x + c.r * 0.18, c.y + c.r * 0.18, c.r * 0.15, c.x, c.y, c.r);
    g.addColorStop(0, '#5C5B57'); g.addColorStop(0.75, '#74736F'); g.addColorStop(1, '#8D8C88');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(c.x, c.y, c.r, 0, TAU); ctx.fill();
    ctx.lineWidth = Math.max(2, c.r * 0.07);
    ctx.strokeStyle = 'rgba(214,212,204,.5)'; ctx.beginPath(); ctx.arc(c.x, c.y, c.r, Math.PI * 0.95, Math.PI * 1.65); ctx.stroke();    /* the lit rim */
    ctx.strokeStyle = 'rgba(40,38,36,.45)'; ctx.beginPath(); ctx.arc(c.x, c.y, c.r, Math.PI * -0.05, Math.PI * 0.65); ctx.stroke();       /* the shadowed rim */
  }
  for (let i = 0; i < MOON_ROCKS.length; i++){
    const r = MOON_ROCKS[i];
    if (r.x < x0 - 20 || r.x > x0 + vw + 20 || r.y < y0 - 20 || r.y > y0 + vh + 20) continue;
    ctx.fillStyle = 'rgba(30,28,26,.35)'; ctx.beginPath(); ctx.ellipse(r.x + r.r * 0.5, r.y + r.r * 0.45, r.r * 1.1, r.r * 0.7, r.a, 0, TAU); ctx.fill();
    ctx.fillStyle = '#6E6D69'; ctx.beginPath(); ctx.ellipse(r.x, r.y, r.r, r.r * 0.75, r.a, 0, TAU); ctx.fill();
    ctx.fillStyle = '#A9A8A2'; ctx.beginPath(); ctx.ellipse(r.x - r.r * 0.25, r.y - r.r * 0.2, r.r * 0.5, r.r * 0.32, r.a, 0, TAU); ctx.fill();
  }
  if (MOON_WRECK.x > x0 - 240 && MOON_WRECK.x < x0 + vw + 240 && MOON_WRECK.y > y0 - 240 && MOON_WRECK.y < y0 + vh + 240) drawMoonWreck(ctx);
  ctx.strokeStyle = 'rgba(10,10,12,.9)'; ctx.lineWidth = 10;
  ctx.strokeRect(-5, -5, ARENA_W + 10, ARENA_H + 10);
  ctx.fillStyle = '#0A0A0C';
  const pad = 400;
  if (x0 < 0) ctx.fillRect(x0 - pad, y0 - pad, -x0 + pad, vh + pad * 2);
  if (y0 < 0) ctx.fillRect(x0 - pad, y0 - pad, vw + pad * 2, -y0 + pad);
  if (x0 + vw > ARENA_W) ctx.fillRect(ARENA_W, y0 - pad, x0 + vw - ARENA_W + pad, vh + pad * 2);
  if (y0 + vh > ARENA_H) ctx.fillRect(x0 - pad, ARENA_H, vw + pad * 2, y0 + vh - ARENA_H + pad);
}

