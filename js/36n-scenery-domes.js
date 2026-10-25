'use strict';
/* Scenery definitions: the Domes (Chapter 13.5, internal chapter 14; see js/36a-scenery-core.js for the format), and the dome's floor. */
/* Inside a dome it is cold and quiet: pale steel floor plates furred with frost, veins of glowing crystal root crossing the floor, frozen crates, seed pods
   under grow-lamps, vents breathing fog, and ice that has no business being in the savannah. The mylar skin is the frame round the arena. Everything lives
   inside one function so it adds only the globals the render and the run setup call. */
let groundPatternDome = null;
function buildGroundDome(){
  const c = document.createElement('canvas'); c.width = 160; c.height = 160;
  const g = c.getContext('2d'); if (!g) return;
  g.fillStyle = '#9FB4C2'; g.fillRect(0, 0, 160, 160);
  for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++){ g.fillStyle = (i + j) % 2 ? '#A8BDCA' : '#97ADBB'; g.fillRect(i * 40 + 1, j * 40 + 1, 38, 38); }         /* steel plates with seams between them */
  g.strokeStyle = 'rgba(40,64,84,.45)'; g.lineWidth = 2; for (let i = 0; i <= 4; i++){ g.beginPath(); g.moveTo(i * 40, 0); g.lineTo(i * 40, 160); g.moveTo(0, i * 40); g.lineTo(160, i * 40); g.stroke(); }
  g.fillStyle = 'rgba(30,50,68,.55)'; for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++){ g.fillRect(i * 40 + 4, j * 40 + 4, 2.4, 2.4); g.fillRect(i * 40 + 33, j * 40 + 4, 2.4, 2.4); g.fillRect(i * 40 + 4, j * 40 + 33, 2.4, 2.4); g.fillRect(i * 40 + 33, j * 40 + 33, 2.4, 2.4); }   /* rivets */
  for (let i = 0; i < 520; i++){ g.fillStyle = ['rgba(255,255,255,.55)', 'rgba(220,240,250,.5)', 'rgba(255,255,255,.3)', 'rgba(120,150,170,.4)'][i % 4]; g.fillRect(Math.random() * 160, Math.random() * 160, 1 + Math.random() * 2, 1 + Math.random() * 2); }   /* frost grain */
  const ctx = CTX; if (ctx && ctx.createPattern) groundPatternDome = ctx.createPattern(c, 'repeat');
}
const DOME_PATCHES = [], DOME_VEINS = [], DOME_PUDDLES = [];
for (let i = 0; i < 260; i++) DOME_PATCHES.push({ x: csR(i + 21000) * ARENA_W, y: csR(i + 21050) * ARENA_H, rx: 80 + csR(i + 21100) * 260, ry: 50 + csR(i + 21150) * 150, a: csR(i + 21200) * TAU, c: ['#F2FAFF', '#D6EAF6', '#BBD6E8', '#7FA0B8'][Math.floor(csR(i + 21250) * 4)], al: 0.1 + csR(i + 21300) * 0.16 });
for (let i = 0; i < 46; i++){                                                                                        /* veins of crystal root: wandering chains of short segments */
  let x = csR(i + 21400) * ARENA_W, y = csR(i + 21450) * ARENA_H, a = csR(i + 21500) * TAU; const pts = [[x, y]], n = 9 + Math.floor(csR(i + 21550) * 9);
  for (let k = 0; k < n; k++){ a += (csR(i * 31 + k + 21600) - 0.5) * 1.1; x += Math.cos(a) * (60 + csR(i * 17 + k + 21700) * 50); y += Math.sin(a) * (60 + csR(i * 13 + k + 21800) * 50); pts.push([x, y]); }
  DOME_VEINS.push(pts);
}
for (let i = 0; i < 40; i++) DOME_PUDDLES.push({ x: csR(i + 22000) * ARENA_W, y: csR(i + 22050) * ARENA_H, rx: 26 + csR(i + 22100) * 70, ry: 16 + csR(i + 22150) * 40, a: csR(i + 22200) * TAU });
function buildDomeWorld(){ G.buildings = []; G.rocket = null; }
function drawGroundDome(ctx, cx, cy, vw, vh){
  const x0 = cx - vw / 2, y0 = cy - vh / 2, x1 = x0 + vw, y1 = y0 + vh, t = G.time;
  ctx.fillStyle = groundPatternDome || '#9FB4C2'; ctx.fillRect(x0 - 40, y0 - 40, vw + 80, vh + 80);
  for (let i = 0; i < DOME_PATCHES.length; i++){
    const p = DOME_PATCHES[i]; if (p.x + p.rx < x0 || p.x - p.rx > x1 || p.y + p.rx < y0 || p.y - p.rx > y1) continue;
    ctx.globalAlpha = p.al; ctx.fillStyle = p.c; ctx.beginPath(); ctx.ellipse(p.x, p.y, p.rx, p.ry, p.a, 0, TAU); ctx.fill();
  }
  ctx.globalAlpha = 1;
  for (let i = 0; i < DOME_PUDDLES.length; i++){                                                                      /* dark frozen puddles with a shine */
    const p = DOME_PUDDLES[i]; if (p.x + p.rx < x0 || p.x - p.rx > x1 || p.y + p.rx < y0 || p.y - p.rx > y1) continue;
    ctx.fillStyle = 'rgba(40,72,96,.42)'; ctx.beginPath(); ctx.ellipse(p.x, p.y, p.rx, p.ry, p.a, 0, TAU); ctx.fill();
    ctx.fillStyle = 'rgba(210,240,255,.35)'; ctx.beginPath(); ctx.ellipse(p.x - p.rx * 0.22, p.y - p.ry * 0.25, p.rx * 0.5, p.ry * 0.28, p.a, 0, TAU); ctx.fill();
  }
  const glow = 0.45 + 0.2 * Math.sin(t * 1.4);
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  for (let i = 0; i < DOME_VEINS.length; i++){
    const v = DOME_VEINS[i]; let ok = false;
    for (let k = 0; k < v.length; k++) if (v[k][0] > x0 - 80 && v[k][0] < x1 + 80 && v[k][1] > y0 - 80 && v[k][1] < y1 + 80){ ok = true; break; }
    if (!ok) continue;
    ctx.beginPath(); ctx.moveTo(v[0][0], v[0][1]); for (let k = 1; k < v.length; k++) ctx.lineTo(v[k][0], v[k][1]);
    ctx.strokeStyle = 'rgba(90,220,255,' + (0.1 * glow).toFixed(3) + ')'; ctx.lineWidth = 16; ctx.stroke();          /* the glow under the vein */
    ctx.strokeStyle = 'rgba(120,236,255,' + (0.5 * glow).toFixed(3) + ')'; ctx.lineWidth = 4; ctx.stroke();
    ctx.strokeStyle = 'rgba(230,255,255,.7)'; ctx.lineWidth = 1.4; ctx.stroke();
  }
  ctx.lineCap = 'butt'; ctx.lineJoin = 'miter';
  /* the dome's own frame: a heavy rim of steel with mylar panels, shining like a mirror and throwing back a bright bar of desert light */
  const FI = 30;
  ctx.fillStyle = '#5E7284'; ctx.fillRect(-FI, -FI, ARENA_W + FI * 2, FI); ctx.fillRect(-FI, ARENA_H, ARENA_W + FI * 2, FI); ctx.fillRect(-FI, 0, FI, ARENA_H); ctx.fillRect(ARENA_W, 0, FI, ARENA_H);
  ctx.strokeStyle = '#33485A'; ctx.lineWidth = 6; ctx.strokeRect(-3, -3, ARENA_W + 6, ARENA_H + 6);
  const sheen = 0.18 + 0.1 * Math.sin(t * 0.7);
  for (let x = 0; x < ARENA_W; x += 260){ if (x + 260 < x0 || x > x1) continue; ctx.fillStyle = 'rgba(255,248,200,' + sheen + ')'; ctx.fillRect(x + 20, -FI + 6, 220, FI - 12); ctx.fillRect(x + 20, ARENA_H + 6, 220, FI - 12); }
  for (let y = 0; y < ARENA_H; y += 260){ if (y + 260 < y0 || y > y1) continue; ctx.fillStyle = 'rgba(255,248,200,' + sheen + ')'; ctx.fillRect(-FI + 6, y + 20, FI - 12, 220); ctx.fillRect(ARENA_W + 6, y + 20, FI - 12, 220); }
  ctx.fillStyle = '#0E1822'; const pad = 400;                                                                          /* beyond the rim */
  if (x0 < -FI) ctx.fillRect(x0 - pad, y0 - pad, -FI - x0 + pad, vh + pad * 2);
  if (y0 < -FI) ctx.fillRect(x0 - pad, y0 - pad, vw + pad * 2, -FI - y0 + pad);
  if (x1 > ARENA_W + FI) ctx.fillRect(ARENA_W + FI, y0 - pad, x1 - ARENA_W - FI + pad, vh + pad * 2);
  if (y1 > ARENA_H + FI) ctx.fillRect(x0 - pad, ARENA_H + FI, vw + pad * 2, y1 - ARENA_H - FI + pad);
}

(function(){
  function E(ctx, x, y, rx, ry, c, rot){ ctx.fillStyle = c; ctx.beginPath(); ctx.ellipse(x, y, rx, ry, rot || 0, 0, TAU); ctx.fill(); }
  function shard(ctx, x, y, ang, L, w, c, c2){                                                       /* a crystal: a long kite with a lit facet */
    const ca = Math.cos(ang), sa = Math.sin(ang), px = -sa, py = ca;
    ctx.fillStyle = c; ctx.beginPath(); ctx.moveTo(x + ca * L, y + sa * L); ctx.lineTo(x + px * w + ca * L * 0.3, y + py * w + sa * L * 0.3); ctx.lineTo(x - ca * L * 0.1, y - sa * L * 0.1); ctx.lineTo(x - px * w + ca * L * 0.3, y - py * w + sa * L * 0.3); ctx.closePath(); ctx.fill();
    ctx.fillStyle = c2; ctx.beginPath(); ctx.moveTo(x + ca * L, y + sa * L); ctx.lineTo(x + px * w + ca * L * 0.3, y + py * w + sa * L * 0.3); ctx.lineTo(x - ca * L * 0.1, y - sa * L * 0.1); ctx.closePath(); ctx.fill();
  }
  const dome = {
    patches: [
      { fill: '#F2FAFF', alpha: 0.18, count: 11, rMin: 180, rMax: 360, squash: 0.62 },
      { fill: '#7FD8F0', alpha: 0.12, count: 8, rMin: 170, rMax: 320, squash: 0.6 },
      { fill: '#3A5A72', alpha: 0.14, count: 8, rMin: 200, rMax: 380, squash: 0.55 }
    ],
    decals: [
      { id: 'dm_frost', count: 120, draw(ctx, d, t){                                                 /* a frost fern on the steel */
          ctx.strokeStyle = 'rgba(245,252,255,.65)'; ctx.lineWidth = 1.4; ctx.lineCap = 'round'; ctx.beginPath();
          for (let k = 0; k < 6; k++){ const a = k * 1.05 + d.seed * 6; ctx.moveTo(0, 0); ctx.lineTo(Math.cos(a) * 16, Math.sin(a) * 16); ctx.moveTo(Math.cos(a) * 9, Math.sin(a) * 9); ctx.lineTo(Math.cos(a + 0.7) * 14, Math.sin(a + 0.7) * 14); ctx.moveTo(Math.cos(a) * 9, Math.sin(a) * 9); ctx.lineTo(Math.cos(a - 0.7) * 14, Math.sin(a - 0.7) * 14); }
          ctx.stroke(); } },
      { id: 'dm_drain', count: 16, draw(ctx, d, t){ E(ctx, 0, 0, 20, 14, 'rgba(30,48,64,.7)'); ctx.strokeStyle = 'rgba(150,176,194,.8)'; ctx.lineWidth = 2; for (let k = -2; k <= 2; k++){ ctx.beginPath(); ctx.moveTo(k * 6, -12); ctx.lineTo(k * 6, 12); ctx.stroke(); } } },
      { id: 'dm_crack', count: 40, draw(ctx, d, t){ ctx.strokeStyle = 'rgba(110,232,255,.55)'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(-18, 0); ctx.lineTo(-6, -4 + d.seed * 6); ctx.lineTo(4, 3); ctx.lineTo(18, -2 + d.seed * 4); ctx.stroke(); } },
      { id: 'dm_scuff', count: 50, draw(ctx, d, t){ ctx.strokeStyle = 'rgba(40,60,76,.28)'; ctx.lineWidth = 3; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-14, 0); ctx.lineTo(14, d.seed * 6 - 3); ctx.stroke(); } }
    ],
    props: [
      { id: 'dm_crystal', count: 30, r: 30, gap: 80, s: [0.8, 1.4], rot: false, draw(ctx, p, t){                   /* a cluster of root crystal, glowing a little */
          const g = 0.55 + 0.25 * Math.sin(t * 1.6 + p.seed * 9);
          scShadow(ctx, 24, 10, 0.22); csGlow(ctx, 0, -8, 46, '#6FE8FF', 0.2 * g);
          for (let k = 0; k < 5; k++){ const a = -Math.PI / 2 + (k - 2) * 0.34 + (scRnd(p.seed, k) - 0.5) * 0.2, L = 20 + scRnd(p.seed, k + 7) * 18; shard(ctx, (k - 2) * 5, 2, a, L, 5.4, '#4FB8E0', '#C8F6FF'); }
        } },
      { id: 'dm_stalag', count: 26, r: 18, gap: 60, s: [0.8, 1.3], rot: false, draw(ctx, p, t){                   /* ice grown up out of the floor */
          scShadow(ctx, 16, 7, 0.2); ctx.fillStyle = '#CFEAF8'; ctx.beginPath(); ctx.moveTo(-9, 2); ctx.lineTo(-2, -26); ctx.lineTo(1, -10); ctx.lineTo(5, -22); ctx.lineTo(10, 2); ctx.closePath(); ctx.fill();
          ctx.fillStyle = '#F4FCFF'; ctx.beginPath(); ctx.moveTo(-9, 2); ctx.lineTo(-2, -26); ctx.lineTo(-3, 2); ctx.closePath(); ctx.fill();
        } },
      { id: 'dm_crate', count: 24, r: 28, gap: 70, s: [0.9, 1.3], rot: true, draw(ctx, p, t){                      /* a steel crate furred with frost */
          scShadow(ctx, 26, 12, 0.26); ctx.fillStyle = '#6A7E8E'; ctx.fillRect(-20, -16, 40, 32); ctx.fillStyle = '#8CA2B2'; ctx.fillRect(-20, -16, 40, 6);
          ctx.strokeStyle = '#3A4C5A'; ctx.lineWidth = 2.4; ctx.strokeRect(-20, -16, 40, 32); ctx.beginPath(); ctx.moveTo(-20, -16); ctx.lineTo(20, 16); ctx.moveTo(20, -16); ctx.lineTo(-20, 16); ctx.stroke();
          ctx.fillStyle = 'rgba(245,252,255,.7)'; ctx.fillRect(-20, -16, 16, 4); ctx.fillRect(8, 12, 12, 4);
        } },
      { id: 'dm_pod', count: 18, r: 30, gap: 90, s: [0.9, 1.2], rot: false, draw(ctx, p, t){                       /* a seed pod under glass, frosted over, with something small and glowing in it */
          scShadow(ctx, 24, 10, 0.24); ctx.fillStyle = '#4A5E6E'; ctx.fillRect(-16, -2, 32, 12); ctx.fillStyle = 'rgba(190,226,244,.55)'; ctx.beginPath(); ctx.moveTo(-14, 2); ctx.lineTo(-14, -26); ctx.quadraticCurveTo(0, -38, 14, -26); ctx.lineTo(14, 2); ctx.closePath(); ctx.fill();
          ctx.strokeStyle = 'rgba(240,252,255,.85)'; ctx.lineWidth = 1.6; ctx.stroke(); csGlow(ctx, 0, -12, 18, '#9AFFB8', 0.2 + 0.1 * Math.sin(t * 2 + p.seed * 7)); E(ctx, 0, -12, 4.6, 7, '#7AE89A');
          ctx.fillStyle = 'rgba(255,255,255,.4)'; ctx.fillRect(-10, -24, 4, 16);
        } },
      { id: 'dm_pipe', count: 22, r: 24, gap: 70, s: [0.9, 1.4], rot: true, draw(ctx, p, t){                       /* a length of coolant pipe */
          scShadow(ctx, 36, 8, 0.2); ctx.fillStyle = '#7C92A2'; ctx.fillRect(-34, -7, 68, 14); ctx.fillStyle = '#A8BECC'; ctx.fillRect(-34, -7, 68, 4); ctx.fillStyle = '#4A5E6E'; ctx.fillRect(-34, 3, 68, 4);
          ctx.fillStyle = '#3A4C5A'; for (const x of [-22, 0, 22]) ctx.fillRect(x - 3, -9, 6, 18); ctx.fillStyle = 'rgba(245,252,255,.65)'; ctx.fillRect(-30, -7, 12, 3);
        } },
      { id: 'dm_lamp', count: 14, r: 30, gap: 110, s: [0.9, 1.2], rot: false, draw(ctx, p, t){                      /* a grow-lamp on a stand, giving a cold violet light */
          scShadow(ctx, 20, 9, 0.2); ctx.fillStyle = '#4A5E6E'; ctx.fillRect(-3, -24, 6, 26); csGlow(ctx, 0, -28, 52, '#B89AFF', 0.2 + 0.06 * Math.sin(t * 3 + p.seed * 5)); E(ctx, 0, -28, 15, 9, '#6A5A9A'); E(ctx, 0, -28, 11, 6, '#D8C8FF');
        } }
    ],
    landmarks: [
      { id: 'dm_root', count: 3, r: 150, gap: 900, s: [1, 1.2], draw(ctx, p, t){                                  /* a huge root crystal, the thing the domes were built round */
          const g = 0.6 + 0.25 * Math.sin(t * 1.2 + p.seed * 9);
          scShadow(ctx, 130, 52, 0.3); csGlow(ctx, 0, -30, 190, '#6FE8FF', 0.22 * g);
          for (let k = 0; k < 9; k++){ const a = -Math.PI / 2 + (k - 4) * 0.3, L = 60 + scRnd(p.seed, k) * 80; shard(ctx, (k - 4) * 14, 10, a, L, 16, '#3F9FCB', '#BDF4FF'); }
          for (let k = 0; k < 6; k++){ const a = -Math.PI / 2 + (k - 2.5) * 0.45, L = 36 + scRnd(p.seed, k + 20) * 40; shard(ctx, (k - 2.5) * 22, 18, a, L, 11, '#68D0F2', '#EFFFFF'); }
          ctx.strokeStyle = 'rgba(130,240,255,' + (0.5 * g).toFixed(2) + ')'; ctx.lineWidth = 3; ctx.lineCap = 'round'; for (let k = 0; k < 7; k++){ const a = Math.PI * (0.05 + k * 0.15); ctx.beginPath(); ctx.moveTo(0, 14); ctx.quadraticCurveTo(Math.cos(a) * 80, 24 + Math.sin(a) * 18, Math.cos(a) * 160, 22 + Math.sin(a) * 40); ctx.stroke(); }
        } },
      { id: 'dm_vent', count: 4, r: 90, gap: 700, s: [1, 1.2], draw(ctx, p, t){                                   /* a floor vent breathing out cold fog */
          scShadow(ctx, 80, 34, 0.26); E(ctx, 0, 0, 70, 46, '#3A4C5A'); E(ctx, 0, 0, 62, 40, '#1A2630');
          ctx.strokeStyle = '#8CA2B2'; ctx.lineWidth = 3; for (let k = -3; k <= 3; k++){ ctx.beginPath(); ctx.moveTo(k * 16, -34); ctx.lineTo(k * 16, 34); ctx.stroke(); }
          for (let k = 0; k < 6; k++){ const a = ((t * 0.3 + k / 6 + p.seed) % 1); ctx.globalAlpha = 0.28 * (1 - a); E(ctx, Math.sin(t + k) * 14, -a * 70, 30 + a * 40, 18 + a * 24, '#E8F6FF'); } ctx.globalAlpha = 1;
        } }
    ],
    ambient: [
      { id: 'dm_mist', count: 16, layer: 'under', init(a){ a.x = Math.random() * ARENA_W; a.y = Math.random() * ARENA_H; a.v = 6 + Math.random() * 14; a.s = 90 + Math.random() * 140; a.ph = Math.random() * 9; },
        update(a, dt, t){ a.x += a.v * dt; if (a.x > ARENA_W + 200) a.x = -200; }, draw(ctx, a, t){ ctx.globalAlpha = 0.07 + 0.035 * Math.sin(t * 0.5 + a.ph); E(ctx, 0, 0, a.s, a.s * 0.38, '#E8F6FF'); ctx.globalAlpha = 1; } },
      { id: 'dm_flake', count: 36, layer: 'over', init(a){ a.x = Math.random() * ARENA_W; a.y = Math.random() * ARENA_H; a.v = 18 + Math.random() * 26; a.ph = Math.random() * 9; },
        update(a, dt, t){ a.y += a.v * dt; a.x += Math.sin(t * 0.8 + a.ph) * 8 * dt; if (a.y > ARENA_H + 20){ a.y = -20; a.x = Math.random() * ARENA_W; } }, draw(ctx, a, t){ ctx.globalAlpha = 0.7; fillCircle(ctx, 0, 0, 1.6 + (a.ph % 1.4), '#F4FCFF'); ctx.globalAlpha = 1; } }
    ]
  };
  sceneryRegister([DOME_CHAPTER], dome);
})();
