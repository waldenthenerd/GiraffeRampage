'use strict';
/* Scenery definitions: moon-venus-inferno (see js/36a-scenery-core.js for the format). */

/* ---------- shared helpers (mvi_ prefix) ---------- */
/* an irregular rounded polygon path around (x, y): n corners, radius jittered by the seed */
function mvi_blob(ctx, x, y, rx, ry, seed, k, n, rot){
  const c = Math.cos(rot || 0), s = Math.sin(rot || 0);
  ctx.beginPath();
  for (let i = 0; i < n; i++){
    const a = i / n * TAU, j = 0.78 + 0.4 * scRnd(seed, k + i), px = Math.cos(a) * rx * j, py = Math.sin(a) * ry * j;
    ctx.lineTo(x + px * c - py * s, y + px * s + py * c);
  }
  ctx.closePath();
}
function mvi_hex(ctx, x, y, r, rot){
  ctx.beginPath();
  for (let i = 0; i < 6; i++){ const a = i / 6 * TAU + rot; ctx.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r * 0.86); }
  ctx.closePath();
}
/* a long thin kite (a crystal or a shard) standing from (bx, by) toward angle a */
function mvi_kite(ctx, bx, by, a, L, w){
  const tx = bx + Math.cos(a) * L, ty = by + Math.sin(a) * L, px = -Math.sin(a) * w, py = Math.cos(a) * w;
  ctx.beginPath(); ctx.moveTo(bx - px, by - py); ctx.lineTo(tx, ty); ctx.lineTo(bx + px, by + py); ctx.closePath();
}
const mvi_DASH = [7, 7], mvi_NODASH = [];

/* ========================= CHAPTER 8: THE MOON ========================= */
const mn_def = {
  patches: [
    { fill: '#BDBBB2', alpha: 0.16, count: 10, rMin: 240, rMax: 480, squash: 0.7 },     /* pale ejecta blankets */
    { fill: '#6A6966', alpha: 0.16, count: 9,  rMin: 220, rMax: 420, squash: 0.65 },    /* darker basalt flow */
    { fill: '#7C8088', alpha: 0.12, count: 6,  rMin: 260, rMax: 440, squash: 0.7 }      /* a cool bluish-grey cast */
  ],
  decals: [
    { id: 'mn_tracks', count: 14, s: [0.8, 1.5], draw: function(ctx, d){
      ctx.strokeStyle = 'rgba(52,50,48,.34)'; ctx.lineWidth = 4; ctx.setLineDash(mvi_DASH);
      const b = (d.seed - 0.5) * 120;
      ctx.beginPath(); ctx.moveTo(-170, -7); ctx.quadraticCurveTo(0, b - 7, 170, -7); ctx.moveTo(-170, 7); ctx.quadraticCurveTo(0, b + 7, 170, 7); ctx.stroke();
      ctx.setLineDash(mvi_NODASH);
    } },
    { id: 'mn_prints', count: 12, s: [0.9, 1.3], draw: function(ctx, d){
      ctx.fillStyle = 'rgba(46,44,42,.3)'; ctx.beginPath();
      for (let i = 0; i < 9; i++){ const x = i * 14 - 60, y = (i % 2 ? 6 : -6) + Math.sin(i * 0.5 + d.seed * 6) * 5; ctx.ellipse(x, y, 5, 2.6, 0.2, 0, TAU); ctx.moveTo(x + 11, y); }
      ctx.fill();
    } },
    { id: 'mn_rays', count: 18, s: [0.7, 1.4], draw: function(ctx, d){
      ctx.strokeStyle = 'rgba(218,216,208,.22)'; ctx.lineWidth = 4; ctx.lineCap = 'round'; ctx.beginPath();
      for (let k = 0; k < 5; k++){ const a = (k - 2) * 0.22 + (scRnd(d.seed, k) - 0.5) * 0.12, l = 70 + scRnd(d.seed, k + 7) * 130; ctx.moveTo(Math.cos(a) * 14, Math.sin(a) * 14); ctx.lineTo(Math.cos(a) * l, Math.sin(a) * l); }
      ctx.stroke(); ctx.lineCap = 'butt';
    } },
    { id: 'mn_pit', count: 46, s: [0.6, 1.5], draw: function(ctx){
      ctx.fillStyle = 'rgba(40,38,36,.3)'; ctx.beginPath(); ctx.ellipse(0, 0, 13, 9, 0, 0, TAU); ctx.fill();
      ctx.strokeStyle = 'rgba(222,220,212,.35)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(0, 0, 13, 9, 0, Math.PI * 1.05, Math.PI * 1.6); ctx.stroke();
    } },
    { id: 'mn_dustring', count: 22, s: [0.8, 1.6], draw: function(ctx, d){
      ctx.fillStyle = 'rgba(214,212,204,.12)'; ctx.beginPath(); ctx.ellipse(0, 0, 60, 38, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = 'rgba(60,58,56,.2)'; ctx.beginPath();
      for (let k = 0; k < 6; k++){ const x = (scRnd(d.seed, k) - 0.5) * 80, y = (scRnd(d.seed, k + 5) - 0.5) * 46; ctx.moveTo(x + 2, y); ctx.arc(x, y, 2, 0, TAU); }
      ctx.fill();
    } }
  ],
  props: [
    { id: 'mn_boulder', count: 70, r: 26, gap: 40, s: [0.8, 1.5], draw: function(ctx, p){
      const s = p.seed, n = 2 + (s > 0.5 ? 1 : 0);
      scShadow(ctx, 30, 12, 0.26);
      for (let k = 0; k < n; k++){
        const x = (scRnd(s, k) - 0.5) * 28, y = (scRnd(s, k + 4) - 0.5) * 12, r = 8 + scRnd(s, k + 8) * 10;
        ctx.fillStyle = '#6A6965'; mvi_blob(ctx, x, y, r, r * 0.78, s, k * 9, 7, scRnd(s, k) * 3); ctx.fill();
        ctx.fillStyle = '#A2A19B'; ctx.beginPath(); ctx.ellipse(x - r * 0.25, y - r * 0.28, r * 0.5, r * 0.3, 0, 0, TAU); ctx.fill();
      }
    } },
    { id: 'mn_pebbles', count: 60, r: 18, gap: 24, s: [0.8, 1.3], draw: function(ctx, p){
      const s = p.seed;
      for (let k = 0; k < 6; k++){
        const x = (scRnd(s, k) - 0.5) * 36, y = (scRnd(s, k + 6) - 0.5) * 20, r = 2.4 + scRnd(s, k + 12) * 3.6;
        ctx.fillStyle = 'rgba(30,28,26,.3)'; ctx.beginPath(); ctx.ellipse(x + 2, y + 2, r * 1.1, r * 0.7, 0, 0, TAU); ctx.fill();
        ctx.fillStyle = k % 2 ? '#74736F' : '#9A9993'; ctx.beginPath(); ctx.ellipse(x, y, r, r * 0.75, 0, 0, TAU); ctx.fill();
      }
    } },
    { id: 'mn_flag', count: 7, r: 16, gap: 400, s: [0.9, 1.1], draw: function(ctx, p){
      ctx.fillStyle = 'rgba(14,10,6,.22)'; ctx.beginPath(); ctx.ellipse(10, 4, 18, 3, 0.1, 0, TAU); ctx.fill();      /* long thin shadow */
      ctx.fillStyle = '#7C7B77'; ctx.beginPath(); ctx.ellipse(0, 2, 6, 3, 0, 0, TAU); ctx.fill();
      ctx.strokeStyle = '#C8C6BE'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(0, 1); ctx.lineTo(0, -40); ctx.stroke();
      ctx.fillStyle = '#C6C3BA'; ctx.fillRect(1, -40, 20, 13);
      ctx.fillStyle = '#946058'; ctx.fillRect(1, -36, 20, 3); ctx.fillRect(1, -30, 20, 3);                              /* faded stripes */
      ctx.fillStyle = '#6E7788'; ctx.fillRect(1, -40, 8, 7);
    } },
    { id: 'mn_solar', count: 9, r: 40, gap: 120, s: [0.9, 1.2], rot: true, draw: function(ctx, p){
      ctx.fillStyle = 'rgba(14,10,6,.24)'; ctx.fillRect(-36, -10, 76, 30);
      for (let k = 0; k < 3; k++){
        const x = -35 + k * 25;
        ctx.fillStyle = '#8E9098'; ctx.fillRect(x - 1, -14, 24, 30);                                                  /* frame */
        ctx.fillStyle = '#3A4252'; ctx.fillRect(x + 1, -12, 20, 26);
        ctx.fillStyle = 'rgba(150,164,190,.3)'; ctx.fillRect(x + 1, -12, 20, 6);
      }
      ctx.strokeStyle = 'rgba(150,160,180,.35)'; ctx.lineWidth = 1; ctx.beginPath();
      for (let k = 0; k < 3; k++){ const x = -35 + k * 25; ctx.moveTo(x + 11, -12); ctx.lineTo(x + 11, 14); ctx.moveTo(x + 1, 1); ctx.lineTo(x + 21, 1); }
      ctx.stroke();
      ctx.fillStyle = '#6E6F76'; ctx.fillRect(-4, 16, 8, 8);
    } },
    { id: 'mn_cable', count: 16, r: 34, gap: 60, s: [0.9, 1.4], rot: true, draw: function(ctx, p){
      const s = p.seed, b = (scRnd(s, 1) - 0.5) * 36, e = (scRnd(s, 2) - 0.5) * 24;
      ctx.strokeStyle = 'rgba(14,10,6,.25)'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(-42, 3); ctx.bezierCurveTo(-16, b + 3, 16, -b + 3, 42, e + 3); ctx.stroke();
      ctx.strokeStyle = '#3C3B3A'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-42, 0); ctx.bezierCurveTo(-16, b, 16, -b, 42, e); ctx.stroke();
      ctx.strokeStyle = 'rgba(190,188,180,.35)'; ctx.lineWidth = 1; ctx.stroke();
      ctx.fillStyle = '#8A8C94'; ctx.fillRect(-48, -5, 10, 10); ctx.fillStyle = '#B4B6BC'; ctx.fillRect(-48, -5, 10, 3);
    } },
    { id: 'mn_dish', count: 8, r: 26, gap: 160, s: [0.9, 1.3], draw: function(ctx, p){
      const tilt = (p.seed - 0.5) * 0.8;
      scShadow(ctx, 26, 11, 0.26);
      ctx.fillStyle = '#7A7A7E'; ctx.beginPath(); ctx.ellipse(0, 2, 22, 13, tilt, 0, TAU); ctx.fill();
      ctx.fillStyle = '#C6C7CC'; ctx.beginPath(); ctx.ellipse(0, -2, 20, 11, tilt, 0, TAU); ctx.fill();
      ctx.fillStyle = '#9A9BA2'; ctx.beginPath(); ctx.ellipse(1, 0, 11, 6, tilt, 0, TAU); ctx.fill();
      ctx.strokeStyle = '#5C5D64'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(1, 0); ctx.lineTo(-9, -22); ctx.stroke();
      ctx.fillStyle = '#4A4B52'; ctx.beginPath(); ctx.arc(-9, -22, 2.4, 0, TAU); ctx.fill();
    } },
    { id: 'mn_crate', count: 12, r: 22, gap: 80, s: [0.9, 1.2], rot: true, draw: function(ctx, p){
      ctx.fillStyle = 'rgba(14,10,6,.26)'; ctx.fillRect(-16, -8, 38, 28);
      ctx.fillStyle = '#8E8C86'; ctx.fillRect(-18, -12, 36, 26);
      ctx.fillStyle = '#B2B0A8'; ctx.fillRect(-18, -12, 36, 9);
      ctx.fillStyle = '#62646C'; ctx.fillRect(-18, 3, 36, 4);
      ctx.fillStyle = '#6E6C66'; ctx.fillRect(-4, -12, 8, 26);
    } }
  ],
  landmarks: [
    { id: 'mn_ringcrater', count: 2, r: 180, gap: 900, s: [1, 1.2], draw: function(ctx, p){
      const s = p.seed;
      ctx.fillStyle = 'rgba(30,28,26,.22)'; ctx.beginPath(); ctx.ellipse(10, 14, 178, 134, 0, 0, TAU); ctx.fill();    /* rim shadow */
      ctx.fillStyle = '#9A9993'; mvi_blob(ctx, 0, 0, 172, 130, s, 0, 24, 0); ctx.fill();                               /* the raised rim */
      ctx.fillStyle = '#A8A7A0'; mvi_blob(ctx, -6, -6, 158, 116, s, 30, 24, 0); ctx.fill();
      ctx.fillStyle = '#6A6965'; mvi_blob(ctx, 2, 6, 124, 90, s, 60, 20, 0); ctx.fill();                              /* bowl */
      ctx.fillStyle = '#5A5955'; mvi_blob(ctx, 14, 14, 96, 62, s, 90, 18, 0); ctx.fill();
      ctx.strokeStyle = 'rgba(214,212,204,.4)'; ctx.lineWidth = 7; ctx.beginPath(); ctx.ellipse(2, 6, 124, 90, 0, Math.PI * 0.95, Math.PI * 1.55); ctx.stroke();
      ctx.strokeStyle = 'rgba(30,28,26,.35)'; ctx.beginPath(); ctx.ellipse(2, 6, 124, 90, 0, Math.PI * -0.05, Math.PI * 0.5); ctx.stroke();
      for (let k = 0; k < 6; k++){
        const a = scRnd(s, k + 20) * TAU, x = Math.cos(a) * (140 + scRnd(s, k + 30) * 24), y = Math.sin(a) * (104 + scRnd(s, k + 30) * 18), r = 5 + scRnd(s, k + 9) * 7;
        ctx.fillStyle = '#6A6965'; ctx.beginPath(); ctx.ellipse(x, y, r, r * 0.75, a, 0, TAU); ctx.fill();
        ctx.fillStyle = '#A8A7A1'; ctx.beginPath(); ctx.ellipse(x - r * 0.25, y - r * 0.25, r * 0.45, r * 0.3, 0, 0, TAU); ctx.fill();
      }
    } },
    { id: 'mn_ridge', count: 2, r: 150, gap: 800, s: [1, 1.3], rot: true, draw: function(ctx, p){
      const s = p.seed;
      ctx.fillStyle = 'rgba(30,28,26,.24)'; ctx.beginPath(); ctx.ellipse(0, 22, 160, 36, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = '#7C7B77'; mvi_blob(ctx, 0, 8, 150, 30, s, 0, 14, 0); ctx.fill();
      ctx.fillStyle = '#92918B'; mvi_blob(ctx, -4, -2, 138, 20, s, 20, 14, 0); ctx.fill();
      ctx.fillStyle = 'rgba(214,212,204,.2)'; ctx.beginPath(); ctx.ellipse(-20, -8, 80, 4, 0, 0, TAU); ctx.fill();
      for (let k = 0; k < 6; k++){ ctx.fillStyle = '#6A6965'; ctx.beginPath(); ctx.ellipse(-120 + k * 48 + scRnd(s, k) * 14, 18 + scRnd(s, k + 6) * 10, 8, 5, 0, 0, TAU); ctx.fill(); }
    } },
    { id: 'mn_lander', count: 1, r: 100, gap: 900, s: [1, 1.1], draw: function(ctx, p){
      ctx.fillStyle = 'rgba(24,22,20,.3)'; ctx.beginPath(); ctx.ellipse(0, 6, 108, 74, 0, 0, TAU); ctx.fill();         /* scorch */
      ctx.strokeStyle = '#7A7B82'; ctx.lineWidth = 5; ctx.lineCap = 'round'; ctx.beginPath();
      for (let k = 0; k < 4; k++){ const a = k * TAU / 4 + 0.78; ctx.moveTo(0, 0); ctx.lineTo(Math.cos(a) * 78, Math.sin(a) * 58); }
      ctx.stroke(); ctx.lineCap = 'butt';
      ctx.fillStyle = '#A4A5AB'; ctx.beginPath(); for (let k = 0; k < 4; k++){ const a = k * TAU / 4 + 0.78; ctx.moveTo(Math.cos(a) * 78 + 9, Math.sin(a) * 58); ctx.ellipse(Math.cos(a) * 78, Math.sin(a) * 58, 9, 6, 0, 0, TAU); } ctx.fill();
      ctx.fillStyle = '#6E6648'; mvi_hex(ctx, 0, 0, 40, 0.3); ctx.fill();                                            /* foil-wrapped stage */
      ctx.fillStyle = '#948A60'; mvi_hex(ctx, -3, -5, 32, 0.3); ctx.fill();
      ctx.fillStyle = '#6E6A60'; mvi_hex(ctx, 2, 0, 16, 0.3); ctx.fill();
      ctx.fillStyle = 'rgba(224,214,170,.4)'; ctx.fillRect(-20, -22, 22, 4);
    } }
  ],
  terrain: [
    { id: 'mn_deepdust', kind: 'slow', mul: 0.72, count: 5, rMin: 100, rMax: 150, squash: 0.7, hint: 'Deep dust slows you and the creatures', draw: function(ctx, z){
      ctx.fillStyle = 'rgba(200,198,190,.32)'; ctx.beginPath(); ctx.ellipse(0, 0, z.rx, z.ry, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = 'rgba(226,224,216,.18)'; ctx.beginPath(); ctx.ellipse(-z.rx * 0.08, -z.ry * 0.1, z.rx * 0.82, z.ry * 0.8, 0, 0, TAU); ctx.fill();
      ctx.strokeStyle = 'rgba(96,94,90,.42)'; ctx.lineWidth = 2.5; ctx.beginPath();
      for (let k = 0; k < 3; k++){ const f = 0.9 - k * 0.24; ctx.moveTo(z.rx * f, 0); ctx.ellipse(0, 0, z.rx * f, z.ry * f, 0, 0, TAU); }
      ctx.stroke();
      ctx.fillStyle = 'rgba(70,68,64,.4)'; ctx.beginPath();
      for (let k = 0; k < 8; k++){ const x = (scRnd(z.seed, k) - 0.5) * z.rx * 1.4, y = (scRnd(z.seed, k + 8) - 0.5) * z.ry * 1.3; ctx.moveTo(x + 2, y); ctx.arc(x, y, 2, 0, TAU); }
      ctx.fill();
    } }
  ],
  ambient: [
    { id: 'mn_mote', count: 46, layer: 'under',
      init: function(a){ a.vx = rand(-4, 4); a.vy = rand(-3, 3); },
      update: function(a, dt){ a.x += a.vx * dt; a.y += a.vy * dt; },
      draw: function(ctx, a, t){ ctx.globalAlpha = 0.18 + 0.18 * Math.sin(t * 1.4 + a.ph); ctx.fillStyle = '#E8E6DC'; ctx.fillRect(-1.2, -1.2, 2.4, 2.4); ctx.globalAlpha = 1; } },
    { id: 'mn_glint', count: 14, layer: 'under',
      init: function(a){ a.vx = 0; a.vy = 0; },
      update: function(){},
      draw: function(ctx, a, t){
        const g = Math.sin(t * 0.8 + a.ph), k = g > 0.6 ? (g - 0.6) / 0.4 : 0; if (k <= 0) return;
        ctx.strokeStyle = 'rgba(240,238,228,' + 0.5 * k + ')'; ctx.lineWidth = 1.5; ctx.beginPath();
        ctx.moveTo(-6 * k, 0); ctx.lineTo(6 * k, 0); ctx.moveTo(0, -6 * k); ctx.lineTo(0, 6 * k); ctx.stroke();
      } }
  ]
};
sceneryRegister([8], mn_def);

/* ========================= CHAPTER 9: VENUS ========================= */
/* the habitat and its healing zone are drawn by the ground: keep scenery out of it */
function vn_nearBase(o, extra){
  if (o.nb === undefined){
    o.nb = false;
    if (typeof venusBaseZone === 'function'){ const z = venusBaseZone(); o.nb = Math.hypot(o.x - z.x, o.y - z.y) < z.r + (extra || 120); }
  }
  return o.nb;
}
const vn_def = {
  patches: [
    { fill: '#B09A86', alpha: 0.16, count: 8, rMin: 220, rMax: 420, squash: 0.65 },      /* ash drifts */
    { fill: '#3A2216', alpha: 0.2,  count: 8, rMin: 200, rMax: 400, squash: 0.65 },      /* basalt beds */
    { fill: '#C4A64A', alpha: 0.12, count: 6, rMin: 180, rMax: 340, squash: 0.7 }       /* sulfur staining */
  ],
  decals: [
    { id: 'vn_crack', count: 60, s: [0.8, 1.6], draw: function(ctx, d){
      ctx.strokeStyle = 'rgba(32,16,8,.5)'; ctx.lineWidth = 2.4; ctx.lineJoin = 'round'; ctx.beginPath();
      ctx.moveTo(-50, 0); ctx.lineTo(-22, -5 - d.seed * 6); ctx.lineTo(4, 3); ctx.lineTo(30, -4); ctx.lineTo(52, 2);
      ctx.moveTo(4, 3); ctx.lineTo(12, 18 + d.seed * 8); ctx.stroke();
    } },
    { id: 'vn_ashstreak', count: 40, s: [0.8, 1.5], draw: function(ctx){
      ctx.fillStyle = 'rgba(190,172,152,.16)'; ctx.beginPath(); ctx.ellipse(0, 0, 70, 9, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = 'rgba(190,172,152,.12)'; ctx.beginPath(); ctx.ellipse(34, 3, 42, 5, 0, 0, TAU); ctx.fill();
    } },
    { id: 'vn_sulfurdust', count: 22, s: [0.8, 1.4], draw: function(ctx, d){
      ctx.fillStyle = 'rgba(196,180,96,.18)'; ctx.beginPath(); ctx.ellipse(0, 0, 40, 26, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = 'rgba(214,204,130,.35)'; ctx.beginPath();
      for (let k = 0; k < 7; k++){ const x = (scRnd(d.seed, k) - 0.5) * 60, y = (scRnd(d.seed, k + 7) - 0.5) * 36; ctx.moveTo(x + 1.6, y); ctx.arc(x, y, 1.6, 0, TAU); }
      ctx.fill();
    } },
    { id: 'vn_pit', count: 34, s: [0.6, 1.4], draw: function(ctx){
      ctx.fillStyle = 'rgba(30,14,8,.45)'; ctx.beginPath(); ctx.ellipse(0, 0, 11, 7, 0, 0, TAU); ctx.fill();
      ctx.strokeStyle = 'rgba(210,150,100,.3)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(0, 0, 11, 7, 0, Math.PI * 1.0, Math.PI * 1.6); ctx.stroke();
    } },
    { id: 'vn_scorch', count: 20, s: [0.8, 1.6], draw: function(ctx){
      ctx.fillStyle = 'rgba(28,14,8,.3)'; ctx.beginPath(); ctx.ellipse(0, 0, 34, 22, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = 'rgba(28,14,8,.2)'; ctx.beginPath(); ctx.ellipse(6, 2, 52, 32, 0, 0, TAU); ctx.fill();
    } }
  ],
  props: [
    { id: 'vn_sulfur', count: 36, r: 24, gap: 50, s: [0.8, 1.4], draw: function(ctx, p){
      if (vn_nearBase(p)) return;
      const s = p.seed, n = 3 + (s > 0.55 ? 2 : 0);
      scShadow(ctx, 24, 9, 0.24);
      ctx.fillStyle = '#8E8650'; ctx.beginPath(); ctx.ellipse(0, 3, 17, 7, 0, 0, TAU); ctx.fill();                  /* crusty base */
      for (let k = 0; k < n; k++){
        const bx = (scRnd(s, k) - 0.5) * 20, by = (scRnd(s, k + 3) - 0.5) * 7, L = 11 + scRnd(s, k + 6) * 15, w = 3.2 + scRnd(s, k + 9) * 2.8, a = -1.57 + (scRnd(s, k + 12) - 0.5) * 1.3;
        ctx.fillStyle = '#B7AE68'; mvi_kite(ctx, bx, by, a, L, w); ctx.fill();
        ctx.fillStyle = '#DDD6A4'; ctx.beginPath(); ctx.moveTo(bx - Math.sin(a) * w, by + Math.cos(a) * w); ctx.lineTo(bx + Math.cos(a) * L, by + Math.sin(a) * L); ctx.lineTo(bx, by); ctx.closePath(); ctx.fill();
      }
    } },
    { id: 'vn_basalt', count: 30, r: 28, gap: 60, s: [0.8, 1.3], draw: function(ctx, p){
      if (vn_nearBase(p)) return;
      const s = p.seed, n = 3 + (s > 0.5 ? 1 : 0);
      scShadow(ctx, 30, 11, 0.28);
      for (let k = 0; k < n; k++){
        const x = (k - (n - 1) / 2) * 12 + (scRnd(s, k) - 0.5) * 6, y = (k % 2 ? 6 : -5) + (scRnd(s, k + 4) - 0.5) * 5, r = 8.5 + scRnd(s, k + 8) * 4;
        ctx.fillStyle = '#1C1612'; mvi_hex(ctx, x, y + 5, r, 0.5); ctx.fill();
        ctx.fillStyle = '#3A2F29'; mvi_hex(ctx, x, y, r, 0.5); ctx.fill();
        ctx.fillStyle = '#5E4E42'; ctx.beginPath(); ctx.ellipse(x - r * 0.28, y - r * 0.28, r * 0.4, r * 0.24, 0, 0, TAU); ctx.fill();
      }
    } },
    { id: 'vn_fumarole', count: 12, r: 26, gap: 160, s: [0.9, 1.3], draw: function(ctx, p, t){
      if (vn_nearBase(p)) return;
      scShadow(ctx, 28, 11, 0.24);
      ctx.fillStyle = '#4C2E1C'; ctx.beginPath(); ctx.ellipse(0, 0, 22, 12, 0, 0, TAU); ctx.fill();
      ctx.strokeStyle = 'rgba(190,176,100,.7)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(0, 0, 20, 10.5, 0, 0, TAU); ctx.stroke();      /* sulfur crust */
      ctx.fillStyle = '#1A100A'; ctx.beginPath(); ctx.ellipse(0, 0, 11, 5.5, 0, 0, TAU); ctx.fill();
      for (let k = 0; k < 3; k++){ ctx.fillStyle = 'rgba(214,204,190,' + (0.2 - k * 0.04) + ')'; ctx.beginPath(); ctx.arc(scSway(t, p, 3) * (k + 1) * 0.6, -10 - k * 11, 6 + k * 3, 0, TAU); ctx.fill(); }
    } },
    { id: 'vn_plate', count: 34, r: 32, gap: 50, s: [0.8, 1.4], rot: true, draw: function(ctx, p){
      if (vn_nearBase(p)) return;
      const s = p.seed;
      ctx.fillStyle = 'rgba(14,8,4,.3)'; mvi_blob(ctx, 3, 4, 30, 21, s, 0, 9, 0); ctx.fill();
      ctx.fillStyle = '#2E1C14'; mvi_blob(ctx, 0, 0, 30, 21, s, 0, 9, 0); ctx.fill();
      ctx.fillStyle = '#46291B'; mvi_blob(ctx, -2, -2, 22, 14, s, 12, 9, 0); ctx.fill();
      ctx.strokeStyle = 'rgba(12,6,4,.7)'; ctx.lineWidth = 1.8; ctx.beginPath(); ctx.moveTo(-18, -4); ctx.lineTo(-4, 2); ctx.lineTo(6, -6); ctx.lineTo(18, 4); ctx.moveTo(-4, 2); ctx.lineTo(0, 12); ctx.stroke();
      ctx.strokeStyle = 'rgba(168,70,30,.42)'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(-4, 2); ctx.lineTo(6, -6); ctx.lineTo(18, 4); ctx.stroke();
    } },
    { id: 'vn_glass', count: 20, r: 20, gap: 50, s: [0.8, 1.3], rot: true, draw: function(ctx, p){
      if (vn_nearBase(p)) return;
      const s = p.seed;
      scShadow(ctx, 20, 7, 0.22);
      for (let k = 0; k < 3; k++){
        const bx = (k - 1) * 9, a = -1.2 + (scRnd(s, k) - 0.5) * 1.6, L = 14 + scRnd(s, k + 3) * 12;
        ctx.fillStyle = '#1C1416'; mvi_kite(ctx, bx, 2, a, L, 3.4); ctx.fill();
        ctx.strokeStyle = 'rgba(176,130,108,.6)'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(bx - Math.sin(a) * 3, 2 + Math.cos(a) * 3); ctx.lineTo(bx + Math.cos(a) * L, 2 + Math.sin(a) * L); ctx.stroke();
      }
    } },
    { id: 'vn_ashmound', count: 30, r: 28, gap: 50, s: [0.8, 1.5], draw: function(ctx, p){
      if (vn_nearBase(p)) return;
      ctx.fillStyle = 'rgba(14,10,6,.2)'; ctx.beginPath(); ctx.ellipse(3, 5, 30, 12, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = '#6E6052'; mvi_blob(ctx, 0, 0, 27, 11, p.seed, 0, 8, 0); ctx.fill();
      ctx.fillStyle = '#85786A'; mvi_blob(ctx, -4, -2, 19, 7, p.seed, 9, 8, 0); ctx.fill();
      ctx.strokeStyle = 'rgba(108,96,82,.5)'; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(-14, -3); ctx.quadraticCurveTo(0, -8, 14, -3); ctx.moveTo(-10, 2); ctx.quadraticCurveTo(0, -2, 12, 3); ctx.stroke();
    } },
    { id: 'vn_spire', count: 22, r: 22, gap: 80, s: [0.8, 1.4], draw: function(ctx, p){
      if (vn_nearBase(p)) return;
      const j = (p.seed - 0.5) * 8;
      scShadow(ctx, 28, 10, 0.28);
      ctx.fillStyle = '#4A2A18'; ctx.beginPath(); ctx.moveTo(-13, 4); ctx.lineTo(-7, -28); ctx.lineTo(j, -46); ctx.lineTo(8, -26); ctx.lineTo(14, 4); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#6E4428'; ctx.beginPath(); ctx.moveTo(-13, 4); ctx.lineTo(-7, -28); ctx.lineTo(j, -46); ctx.lineTo(1, -10); ctx.closePath(); ctx.fill();
      ctx.fillStyle = 'rgba(214,150,100,.35)'; ctx.beginPath(); ctx.moveTo(-7, -28); ctx.lineTo(j, -46); ctx.lineTo(j - 2, -26); ctx.closePath(); ctx.fill();
    } }
  ],
  landmarks: [
    { id: 'vn_mesa', count: 2, r: 170, gap: 800, s: [1, 1.2], draw: function(ctx, p){
      if (vn_nearBase(p, 160)) return;
      const s = p.seed;
      ctx.fillStyle = 'rgba(14,8,4,.26)'; mvi_blob(ctx, 10, 34, 165, 100, s, 0, 12, 0); ctx.fill();
      ctx.fillStyle = '#3E2214'; mvi_blob(ctx, 0, 22, 158, 98, s, 0, 12, 0); ctx.fill();                              /* cliff face */
      ctx.fillStyle = '#5A311C'; mvi_blob(ctx, 0, 12, 158, 98, s, 0, 12, 0); ctx.fill();
      ctx.fillStyle = '#9A6030'; mvi_blob(ctx, 0, -6, 150, 90, s, 0, 12, 0); ctx.fill();                              /* the flat top */
      ctx.fillStyle = '#AC7138'; mvi_blob(ctx, -8, -14, 110, 58, s, 20, 12, 0); ctx.fill();
      ctx.strokeStyle = 'rgba(70,36,18,.45)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-80, 6); ctx.quadraticCurveTo(-10, 24, 90, 4); ctx.moveTo(-60, 30); ctx.quadraticCurveTo(0, 46, 70, 30); ctx.stroke();
    } },
    { id: 'vn_sulfurbed', count: 1, r: 150, gap: 900, s: [1, 1.15], draw: function(ctx, p){
      if (vn_nearBase(p, 160)) return;
      const s = p.seed;
      ctx.fillStyle = 'rgba(150,140,70,.32)'; mvi_blob(ctx, 0, 0, 150, 96, s, 0, 12, 0); ctx.fill();
      ctx.fillStyle = 'rgba(196,186,110,.4)'; mvi_blob(ctx, -6, -4, 110, 68, s, 15, 12, 0); ctx.fill();
      for (let k = 0; k < 9; k++){
        const bx = (scRnd(s, k + 30) - 0.5) * 190, by = (scRnd(s, k + 40) - 0.5) * 100, L = 12 + scRnd(s, k + 50) * 14, a = -1.57 + (scRnd(s, k + 60) - 0.5);
        ctx.fillStyle = '#B7AE68'; mvi_kite(ctx, bx, by, a, L, 4.5); ctx.fill();
        ctx.fillStyle = '#DDD6A4'; ctx.beginPath(); ctx.moveTo(bx - Math.sin(a) * 4.5, by + Math.cos(a) * 4.5); ctx.lineTo(bx + Math.cos(a) * L, by + Math.sin(a) * L); ctx.lineTo(bx, by); ctx.closePath(); ctx.fill();
      }
    } },
    { id: 'vn_sinkhole', count: 1, r: 140, gap: 900, s: [1, 1.1], draw: function(ctx, p){
      if (vn_nearBase(p, 160)) return;
      const s = p.seed;
      ctx.fillStyle = '#5E3A22'; mvi_blob(ctx, 0, 0, 140, 100, s, 0, 14, 0); ctx.fill();
      ctx.fillStyle = '#7A4C2A'; ctx.beginPath(); ctx.ellipse(-4, -6, 130, 90, 0, Math.PI * 0.95, Math.PI * 1.7); ctx.lineTo(0, 0); ctx.fill();
      ctx.fillStyle = '#2A170E'; mvi_blob(ctx, 4, 6, 100, 68, s, 14, 14, 0); ctx.fill();
      ctx.fillStyle = '#170C07'; mvi_blob(ctx, 10, 12, 66, 42, s, 28, 12, 0); ctx.fill();
      ctx.fillStyle = 'rgba(190,176,100,.22)'; ctx.beginPath(); ctx.ellipse(-30, -26, 40, 12, -0.3, 0, TAU); ctx.fill();
    } }
  ],
  terrain: [
    { id: 'vn_acid', kind: 'hurt', dmgFrac: 0.012, count: 4, rMin: 80, rMax: 105, squash: 0.75, hint: 'Acid pool! It burns', draw: function(ctx, z, t){
      if (z.rx > 1 && vn_nearBase(z, 60)){ z.rx = 0; z.ry = 0; }
      if (z.rx < 1) return;
      ctx.fillStyle = '#7C7A44'; ctx.beginPath(); ctx.ellipse(0, 0, z.rx * 1.1, z.ry * 1.1, 0, 0, TAU); ctx.fill();         /* crusted lip */
      ctx.strokeStyle = 'rgba(232,230,150,.75)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(0, 0, z.rx * 1.1, z.ry * 1.1, 0, 0, TAU); ctx.stroke();
      ctx.fillStyle = '#8F9C38'; ctx.beginPath(); ctx.ellipse(0, 0, z.rx * 0.96, z.ry * 0.96, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = '#AEB852'; ctx.beginPath(); ctx.ellipse(-z.rx * 0.1, -z.ry * 0.1, z.rx * 0.66, z.ry * 0.62, 0, 0, TAU); ctx.fill();
      ctx.strokeStyle = 'rgba(236,246,170,.8)'; ctx.lineWidth = 1.6;
      for (let k = 0; k < 4; k++){
        const u = (t * 0.5 + z.seed * 3 + k * 0.27) % 1, x = (scRnd(z.seed, k) - 0.5) * z.rx * 1.2, y = (scRnd(z.seed, k + 4) - 0.5) * z.ry * 1.1;
        ctx.beginPath(); ctx.arc(x, y, 2 + u * 7, 0, TAU); ctx.stroke();
      }
    } },
    { id: 'vn_ashdrift', kind: 'slow', mul: 0.74, count: 4, rMin: 110, rMax: 160, squash: 0.65, hint: 'Deep ash slows you and the creatures', draw: function(ctx, z){
      if (z.rx > 1 && vn_nearBase(z, 100)){ z.rx = 0; z.ry = 0; }
      if (z.rx < 1) return;
      ctx.fillStyle = 'rgba(128,112,96,.5)'; ctx.beginPath(); ctx.ellipse(0, 0, z.rx, z.ry, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = 'rgba(170,154,136,.3)'; ctx.beginPath(); ctx.ellipse(-z.rx * 0.1, -z.ry * 0.12, z.rx * 0.75, z.ry * 0.7, 0, 0, TAU); ctx.fill();
      ctx.strokeStyle = 'rgba(100,88,74,.5)'; ctx.lineWidth = 2.4; ctx.beginPath();
      for (let k = 0; k < 3; k++){ const y = (k - 1) * z.ry * 0.42; ctx.moveTo(-z.rx * 0.6, y); ctx.quadraticCurveTo(0, y - 12, z.rx * 0.6, y); }
      ctx.stroke();
    } }
  ],
  ambient: [
    { id: 'vn_ash', count: 44, layer: 'under',
      init: function(a){ a.vx = rand(10, 22); a.vy = rand(2, 8); },
      update: function(a, dt, t){ a.x += a.vx * dt; a.y += (a.vy + Math.sin(t * 0.6 + a.ph) * 4) * dt; },
      draw: function(ctx, a){ ctx.globalAlpha = 0.5; ctx.fillStyle = '#C4B4A0'; ctx.fillRect(-1, -1, 2.2, 2); ctx.globalAlpha = 1; } },
    { id: 'vn_wisp', count: 10, layer: 'over',
      init: function(a){ a.vx = 0; a.vy = -rand(5, 12); },
      update: function(a, dt){ a.y += a.vy * dt; },
      draw: function(ctx, a, t){
        const w = Math.sin(t * 1.2 + a.ph) * 6;
        ctx.strokeStyle = 'rgba(255,214,160,.1)'; ctx.lineWidth = 4; ctx.lineCap = 'round'; ctx.beginPath();
        ctx.moveTo(-34, 0); ctx.bezierCurveTo(-14, -10 + w, 14, 10 - w, 34, 0); ctx.stroke(); ctx.lineCap = 'butt';
      } },
    { id: 'vn_steam', count: 16, layer: 'under',
      init: function(a){
        a.vx = 0; a.vy = 0;
        let n = 0; for (let i = 0; i < SCEN.props.length; i++) if (SCEN.props[i].def.id === 'vn_fumarole') n++;
        if (n){ let pick = Math.floor(a.seed * n) % n; for (let i = 0; i < SCEN.props.length; i++){ const q = SCEN.props[i]; if (q.def.id === 'vn_fumarole' && pick-- === 0){ a.x = q.x + (a.seed - 0.5) * 6; a.y = q.y - 6; break; } } }
      },
      update: function(){},
      draw: function(ctx, a, t){
        const u = (t * 0.3 + a.ph / TAU) % 1;
        ctx.fillStyle = 'rgba(218,208,194,' + 0.24 * (1 - u) + ')'; ctx.beginPath(); ctx.arc(Math.sin(u * 5 + a.ph) * 5, -8 - u * 46, 5 + u * 14, 0, TAU); ctx.fill();
      } }
  ]
};
sceneryRegister([9], vn_def);

/* ========================= CHAPTER 10: THE INFERNO ========================= */
/* same ground tile as Venus, so the dark scorched look comes from big dark patches and charred decals */
const in_def = {
  patches: [
    { fill: '#120806', alpha: 0.24, count: 12, rMin: 360, rMax: 700, squash: 0.65 },
    { fill: '#0A0504', alpha: 0.2,  count: 7, rMin: 300, rMax: 560, squash: 0.7 },     /* scorched earth */
    { fill: '#2A1008', alpha: 0.22, count: 7, rMin: 260, rMax: 520, squash: 0.65 },     /* burnt umber */
    { fill: '#6A2410', alpha: 0.18, count: 8,  rMin: 220, rMax: 420, squash: 0.7 }       /* a dull red heat stain */
  ],
  decals: [
    { id: 'in_seam', count: 46, s: [0.8, 1.6], draw: function(ctx, d){
      const b = (d.seed - 0.5) * 20;
      ctx.lineJoin = 'round'; ctx.strokeStyle = 'rgba(12,4,2,.7)'; ctx.lineWidth = 6; ctx.beginPath();
      ctx.moveTo(-60, 0); ctx.lineTo(-26, -6 + b); ctx.lineTo(6, 4); ctx.lineTo(34, -5 - b * 0.4); ctx.lineTo(64, 2); ctx.stroke();
      ctx.strokeStyle = 'rgba(190,78,26,.5)'; ctx.lineWidth = 2; ctx.stroke();                                         /* a dim glowing seam */
    } },
    { id: 'in_scorch', count: 34, s: [0.8, 1.7], draw: function(ctx){
      ctx.fillStyle = 'rgba(8,4,2,.34)'; ctx.beginPath(); ctx.ellipse(0, 0, 44, 28, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = 'rgba(8,4,2,.22)'; ctx.beginPath(); ctx.ellipse(8, 3, 66, 38, 0.1, 0, TAU); ctx.fill();
    } },
    { id: 'in_ashstreak', count: 34, s: [0.8, 1.5], draw: function(ctx){
      ctx.fillStyle = 'rgba(120,108,100,.18)'; ctx.beginPath(); ctx.ellipse(0, 0, 76, 8, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = 'rgba(120,108,100,.12)'; ctx.beginPath(); ctx.ellipse(40, 4, 40, 5, 0, 0, TAU); ctx.fill();
    } },
    { id: 'in_charcoal', count: 36, s: [0.8, 1.4], draw: function(ctx, d){
      ctx.fillStyle = 'rgba(10,6,4,.6)'; ctx.beginPath();
      for (let k = 0; k < 6; k++){ const x = (scRnd(d.seed, k) - 0.5) * 38, y = (scRnd(d.seed, k + 6) - 0.5) * 22, r = 2 + scRnd(d.seed, k + 12) * 3; ctx.moveTo(x + r, y); ctx.ellipse(x, y, r, r * 0.7, k, 0, TAU); }
      ctx.fill();
    } },
    { id: 'in_bonefrag', count: 14, s: [0.8, 1.3], draw: function(ctx, d){
      ctx.strokeStyle = 'rgba(176,160,134,.55)'; ctx.lineWidth = 3; ctx.lineCap = 'round'; ctx.beginPath();
      ctx.moveTo(-12, 0); ctx.lineTo(10, -3); ctx.moveTo(-4, 6); ctx.lineTo(8, 9 + d.seed * 4); ctx.stroke(); ctx.lineCap = 'butt';
    } }
  ],
  props: [
    { id: 'in_spire', count: 34, r: 24, gap: 60, s: [0.8, 1.5], draw: function(ctx, p){
      const j = (p.seed - 0.5) * 10;
      scShadow(ctx, 30, 10, 0.34);
      ctx.fillStyle = '#17101A'; ctx.beginPath(); ctx.moveTo(-14, 5); ctx.lineTo(-8, -30); ctx.lineTo(j, -54); ctx.lineTo(9, -28); ctx.lineTo(16, 5); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#2C2030'; ctx.beginPath(); ctx.moveTo(-14, 5); ctx.lineTo(-8, -30); ctx.lineTo(j, -54); ctx.lineTo(2, -10); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = 'rgba(150,120,160,.45)'; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(-8, -30); ctx.lineTo(j, -54); ctx.lineTo(4, -20); ctx.stroke();
    } },
    { id: 'in_stump', count: 26, r: 22, gap: 50, s: [0.8, 1.4], draw: function(ctx, p){
      scShadow(ctx, 22, 9, 0.3);
      ctx.fillStyle = '#18100C'; ctx.beginPath(); ctx.ellipse(0, 0, 15, 11, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = '#0A0605'; ctx.fillRect(-15, -14, 30, 14);
      ctx.fillStyle = '#2A1C14'; mvi_blob(ctx, 0, -14, 15, 8, p.seed, 0, 7, 0); ctx.fill();
      ctx.fillStyle = '#100906'; mvi_blob(ctx, 0, -14, 8, 4, p.seed, 8, 6, 0); ctx.fill();
      ctx.fillStyle = 'rgba(190,80,28,.5)'; ctx.fillRect(-10 + p.seed * 8, -12, 3, 2);                                       /* a last live ember */
      ctx.strokeStyle = '#1A110C'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(9, -14); ctx.lineTo(20, -26 - p.seed * 6); ctx.stroke();
    } },
    { id: 'in_ribs', count: 12, r: 36, gap: 140, s: [0.9, 1.4], rot: true, draw: function(ctx, p){
      ctx.fillStyle = 'rgba(8,4,2,.3)'; ctx.beginPath(); ctx.ellipse(0, 6, 40, 12, 0, 0, TAU); ctx.fill();
      ctx.strokeStyle = '#6A6052'; ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-40, 0); ctx.lineTo(40, 0); ctx.stroke();       /* spine */
      ctx.strokeStyle = '#B2A48A'; ctx.lineWidth = 4;
      ctx.beginPath();
      for (let k = 0; k < 5; k++){ const x = -32 + k * 16, h = 22 - Math.abs(k - 2) * 4; ctx.moveTo(x, 0); ctx.quadraticCurveTo(x + 6, -h * 1.1, x + 2, -h * 0.4 - 6); ctx.moveTo(x, 0); ctx.quadraticCurveTo(x + 6, h * 1.1, x + 2, h * 0.4 + 6); }
      ctx.stroke(); ctx.lineCap = 'butt';
    } },
    { id: 'in_crust', count: 30, r: 30, gap: 50, s: [0.8, 1.4], rot: true, draw: function(ctx, p){
      const s = p.seed;
      ctx.fillStyle = 'rgba(6,2,1,.4)'; mvi_blob(ctx, 3, 4, 30, 20, s, 0, 8, 0); ctx.fill();
      ctx.fillStyle = '#20120C'; mvi_blob(ctx, 0, 0, 30, 20, s, 0, 8, 0); ctx.fill();
      ctx.fillStyle = '#34201A'; mvi_blob(ctx, -2, -2, 21, 13, s, 11, 8, 0); ctx.fill();
      ctx.strokeStyle = 'rgba(180,70,24,.4)'; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(-22, 3); ctx.lineTo(-6, -2); ctx.lineTo(8, 5); ctx.lineTo(22, -1); ctx.stroke();
    } },
    { id: 'in_ashdune', count: 28, r: 34, gap: 60, s: [0.9, 1.6], draw: function(ctx, p){
      ctx.fillStyle = 'rgba(6,3,2,.25)'; ctx.beginPath(); ctx.ellipse(4, 6, 38, 13, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = '#3A322E'; mvi_blob(ctx, 0, 0, 35, 12, p.seed, 0, 9, 0); ctx.fill();
      ctx.fillStyle = '#54493F'; mvi_blob(ctx, -6, -3, 25, 7, p.seed, 10, 9, 0); ctx.fill();
      ctx.strokeStyle = 'rgba(160,146,134,.4)'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(-22, -3); ctx.quadraticCurveTo(0, -11, 22, -2); ctx.stroke();
    } },
    { id: 'in_rubble', count: 44, r: 20, gap: 30, s: [0.8, 1.4], draw: function(ctx, p){
      const s = p.seed;
      scShadow(ctx, 24, 9, 0.3);
      for (let k = 0; k < 3; k++){
        const x = (k - 1) * 11 + (scRnd(s, k) - 0.5) * 5, y = (scRnd(s, k + 3) - 0.5) * 7, r = 6 + scRnd(s, k + 6) * 5;
        ctx.fillStyle = '#1A1210'; mvi_blob(ctx, x, y, r, r * 0.75, s, k * 8, 6, scRnd(s, k) * 3); ctx.fill();
        ctx.fillStyle = '#463A36'; ctx.beginPath(); ctx.ellipse(x - r * 0.25, y - r * 0.28, r * 0.45, r * 0.26, 0, 0, TAU); ctx.fill();
      }
    } }
  ],
  landmarks: [
    { id: 'in_arch', count: 2, r: 170, gap: 900, s: [1, 1.2], draw: function(ctx, p){
      ctx.fillStyle = 'rgba(6,2,2,.36)'; ctx.beginPath(); ctx.ellipse(8, 30, 170, 40, 0, 0, TAU); ctx.fill();
      for (let k = 0; k < 2; k++){                                                                                       /* the two piers */
        const x = k ? 110 : -110;
        ctx.fillStyle = '#120C14'; ctx.beginPath(); ctx.moveTo(x - 34, 26); ctx.lineTo(x - 24, -60); ctx.lineTo(x + 10, -76); ctx.lineTo(x + 30, -50); ctx.lineTo(x + 38, 26); ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#2A1E2E'; ctx.beginPath(); ctx.moveTo(x - 34, 26); ctx.lineTo(x - 24, -60); ctx.lineTo(x + 10, -76); ctx.lineTo(x - 2, -10); ctx.closePath(); ctx.fill();
      }
      ctx.fillStyle = '#120C14'; ctx.beginPath(); ctx.moveTo(-124, -60); ctx.quadraticCurveTo(0, -190, 130, -52); ctx.lineTo(112, -28); ctx.quadraticCurveTo(0, -140, -96, -34); ctx.closePath(); ctx.fill();    /* the span */
      ctx.strokeStyle = 'rgba(160,126,170,.5)'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(-118, -62); ctx.quadraticCurveTo(0, -186, 124, -54); ctx.stroke();
      ctx.fillStyle = 'rgba(20,12,18,.5)'; ctx.beginPath(); ctx.ellipse(0, 22, 70, 12, 0, 0, TAU); ctx.fill();
    } },
    { id: 'in_obelisks', count: 2, r: 130, gap: 700, s: [1, 1.2], draw: function(ctx, p){
      const s = p.seed;
      ctx.fillStyle = 'rgba(6,2,2,.34)'; ctx.beginPath(); ctx.ellipse(6, 20, 130, 36, 0, 0, TAU); ctx.fill();
      for (let k = 0; k < 5; k++){
        const x = (k - 2) * 44 + (scRnd(s, k) - 0.5) * 20, h = 70 + scRnd(s, k + 5) * 90, w = 14 + scRnd(s, k + 10) * 10, y = (scRnd(s, k + 15) - 0.5) * 24;
        ctx.fillStyle = '#16101A'; ctx.beginPath(); ctx.moveTo(x - w, y + 8); ctx.lineTo(x - w * 0.7, y - h * 0.8); ctx.lineTo(x, y - h); ctx.lineTo(x + w * 0.7, y - h * 0.75); ctx.lineTo(x + w, y + 8); ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#2C2032'; ctx.beginPath(); ctx.moveTo(x - w, y + 8); ctx.lineTo(x - w * 0.7, y - h * 0.8); ctx.lineTo(x, y - h); ctx.lineTo(x - 1, y + 4); ctx.closePath(); ctx.fill();
      }
    } },
    { id: 'in_ribcage', count: 1, r: 150, gap: 900, s: [1.1, 1.3], draw: function(ctx, p){
      ctx.fillStyle = 'rgba(6,2,2,.3)'; ctx.beginPath(); ctx.ellipse(6, 26, 150, 34, 0, 0, TAU); ctx.fill();
      ctx.strokeStyle = '#7A6E5E'; ctx.lineWidth = 9; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-140, 8); ctx.lineTo(140, 8); ctx.stroke();
      ctx.strokeStyle = '#B8AA90'; ctx.lineWidth = 7; ctx.beginPath();
      for (let k = 0; k < 6; k++){ const x = -110 + k * 44, h = 100 - Math.abs(k - 2.5) * 14; ctx.moveTo(x, 8); ctx.quadraticCurveTo(x + 18, -h * 1.2, x + 6, -h * 0.55); }
      ctx.stroke();
      ctx.strokeStyle = 'rgba(232,222,196,.45)'; ctx.lineWidth = 2; ctx.stroke(); ctx.lineCap = 'butt';
    } },
    { id: 'in_cooled', count: 2, r: 200, gap: 800, s: [1, 1.2], rot: true, draw: function(ctx, p){
      const b = (p.seed - 0.5) * 80;                                                                                  /* a dead lava river bend, cooled to a crust */
      ctx.lineCap = 'round'; ctx.strokeStyle = 'rgba(6,2,2,.3)'; ctx.lineWidth = 96; ctx.beginPath(); ctx.moveTo(-220, 10); ctx.bezierCurveTo(-90, -90 + b, 90, 90 - b, 220, -10); ctx.stroke();
      ctx.strokeStyle = 'rgba(14,8,6,.55)'; ctx.lineWidth = 74; ctx.stroke();
      ctx.strokeStyle = 'rgba(40,24,18,.6)'; ctx.lineWidth = 46; ctx.stroke();
      ctx.strokeStyle = 'rgba(150,60,22,.28)'; ctx.lineWidth = 3; ctx.stroke(); ctx.lineCap = 'butt';
    } }
  ],
  terrain: [
    { id: 'in_lavaseam', kind: 'hurt', dmgFrac: 0.012, count: 4, rMin: 80, rMax: 105, squash: 0.7, hint: 'Lava! Do not touch', draw: function(ctx, z, t){
      ctx.fillStyle = '#100705'; ctx.beginPath(); ctx.ellipse(0, 0, z.rx * 1.14, z.ry * 1.14, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = '#4A1A0C'; ctx.beginPath(); ctx.ellipse(0, 0, z.rx * 1.02, z.ry * 1.02, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = '#A8400F'; ctx.beginPath(); ctx.ellipse(0, 0, z.rx * 0.92, z.ry * 0.92, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = '#D2641C'; ctx.beginPath(); ctx.ellipse(-z.rx * 0.06, -z.ry * 0.08, z.rx * 0.62, z.ry * 0.58, 0, 0, TAU); ctx.fill();
      ctx.strokeStyle = 'rgba(40,14,6,.7)'; ctx.lineWidth = 2.6; ctx.lineJoin = 'round'; ctx.beginPath();
      for (let k = 0; k < 3; k++){
        const a = z.seed * 6 + k * 2.1, x = Math.cos(a) * z.rx * 0.5, y = Math.sin(a) * z.ry * 0.5;
        ctx.moveTo(x - z.rx * 0.3, y - 4); ctx.lineTo(x - z.rx * 0.05, y + 6); ctx.lineTo(x + z.rx * 0.12, y - 5); ctx.lineTo(x + z.rx * 0.34, y + 3);
      }
      ctx.stroke();
      ctx.fillStyle = 'rgba(255,200,110,' + (0.12 + 0.08 * Math.sin(t * 3 + z.seed * 9)) + ')'; ctx.beginPath(); ctx.ellipse(0, 0, z.rx * 0.3, z.ry * 0.28, 0, 0, TAU); ctx.fill();
    } },
    { id: 'in_deepash', kind: 'slow', mul: 0.72, count: 3, rMin: 120, rMax: 160, squash: 0.65, hint: 'Deep ash slows you and the creatures', draw: function(ctx, z){
      ctx.fillStyle = 'rgba(64,56,52,.62)'; ctx.beginPath(); ctx.ellipse(0, 0, z.rx, z.ry, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = 'rgba(96,86,80,.34)'; ctx.beginPath(); ctx.ellipse(-z.rx * 0.1, -z.ry * 0.12, z.rx * 0.72, z.ry * 0.68, 0, 0, TAU); ctx.fill();
      ctx.strokeStyle = 'rgba(190,176,164,.38)'; ctx.lineWidth = 2.4; ctx.beginPath();
      for (let k = 0; k < 3; k++){ const y = (k - 1) * z.ry * 0.42; ctx.moveTo(-z.rx * 0.6, y); ctx.quadraticCurveTo(0, y - 12, z.rx * 0.6, y); }
      ctx.stroke();
    } }
  ],
  ambient: [
    { id: 'in_ember', count: 38, layer: 'under',
      init: function(a){ a.vx = 0; a.vy = -rand(14, 28); },
      update: function(a, dt, t){ a.y += a.vy * dt; a.x += Math.sin(t * 1.3 + a.ph) * 9 * dt; },
      draw: function(ctx, a, t){ ctx.globalAlpha = 0.3 + 0.3 * Math.sin(t * 3 + a.ph); ctx.fillStyle = '#D8602A'; ctx.fillRect(-1.2, -1.2, 2.4, 2.4); ctx.globalAlpha = 1; } },
    { id: 'in_spark', count: 12, layer: 'over',
      init: function(a){ a.vx = rand(-10, 10); a.vy = -rand(30, 52); },
      update: function(a, dt){ a.x += a.vx * dt; a.y += a.vy * dt; },
      draw: function(ctx, a, t){
        const f = 0.5 + 0.5 * Math.sin(t * 5 + a.ph);
        ctx.fillStyle = 'rgba(255,170,90,' + (0.2 + 0.4 * f) + ')'; ctx.fillRect(-1, -2, 2, 4);
      } },
    { id: 'in_ashfall', count: 26, layer: 'over',
      init: function(a){ a.vx = rand(-3, 6); a.vy = rand(10, 22); },
      update: function(a, dt, t){ a.x += (a.vx + Math.sin(t * 0.8 + a.ph) * 6) * dt; a.y += a.vy * dt; },
      draw: function(ctx){ ctx.globalAlpha = 0.4; ctx.fillStyle = '#1E1816'; ctx.fillRect(-1.2, -1, 2.6, 2); ctx.globalAlpha = 1; } }
  ]
};
sceneryRegister([10], in_def);



