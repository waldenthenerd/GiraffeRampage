'use strict';
/* Scenery definitions: arctic-swamp (see js/36a-scenery-core.js for the format). Chapter 2 = Arctic (ar_), chapter 3 = Swamp (sw_). */

/* ============================== ARCTIC ============================== */
function ar_poly(ctx, cx, cy, n, r0, r1, seed, k0, sx, sy){
  ctx.beginPath();
  for (let i = 0; i < n; i++){
    const a = (i / n) * TAU + scRnd(seed, k0 + i) * 0.4, r = r0 + scRnd(seed, k0 + 20 + i) * (r1 - r0);
    const x = cx + Math.cos(a) * r * sx, y = cy + Math.sin(a) * r * sy;
    if (i) ctx.lineTo(x, y); else ctx.moveTo(x, y);
  }
  ctx.closePath();
}

const AR_PROPS = [
  { id: 'ar_mound', count: 46, r: 30, gap: 30, s: [0.7, 1.3], draw: function(ctx, p){
      const w = 24 + scRnd(p.seed, 1) * 14, h = 10 + scRnd(p.seed, 2) * 6;
      scShadow(ctx, w, h * 0.9, 0.12);
      ctx.fillStyle = '#9DB6C6'; ctx.beginPath(); ctx.ellipse(0, 4, w + 3, h + 3, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = '#D3E2EB'; ctx.beginPath(); ctx.ellipse(-2, -1, w, h, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = '#ECF4F8'; ctx.beginPath(); ctx.ellipse(-w * 0.28, -h * 0.35, w * 0.45, h * 0.4, -0.2, 0, TAU); ctx.fill();
    } },
  { id: 'ar_chunk', count: 30, r: 26, gap: 40, s: [0.7, 1.4], draw: function(ctx, p){
      scShadow(ctx, 26, 11, 0.2);
      ctx.fillStyle = '#6E8DA2'; ar_poly(ctx, 0, 2, 6, 15, 25, p.seed, 3, 1, 0.75); ctx.fill();
      ctx.fillStyle = '#9DB9CB'; ar_poly(ctx, -2, -5, 6, 9, 17, p.seed, 3, 1, 0.7); ctx.fill();
      ctx.strokeStyle = '#DCEBF3'; ctx.lineWidth = 2; ctx.beginPath();
      ctx.moveTo(-12, -8); ctx.lineTo(-3, -13); ctx.lineTo(6, -10); ctx.stroke();
      ctx.fillStyle = 'rgba(70,100,125,.45)'; ctx.beginPath(); ctx.moveTo(4, 2); ctx.lineTo(17, 6); ctx.lineTo(8, 11); ctx.closePath(); ctx.fill();
    } },
  { id: 'ar_conifer', count: 22, r: 24, gap: 60, s: [0.8, 1.3], draw: function(ctx, p, t){
      const h = 38 + scRnd(p.seed, 1) * 18, sw = scSway(t, p, 0.6);
      scShadow(ctx, 16, 7, 0.22);
      ctx.fillStyle = '#E2ECF2'; ctx.beginPath(); ctx.ellipse(0, 4, 17, 6, 0, 0, TAU); ctx.fill();
      ctx.strokeStyle = '#51483F'; ctx.lineCap = 'round'; ctx.lineWidth = 5;
      ctx.beginPath(); ctx.moveTo(0, 2); ctx.lineTo(sw * 0.4, -h); ctx.stroke();
      ctx.lineWidth = 2.2; ctx.beginPath();
      for (let i = 0; i < 4; i++){
        const y = -h * (0.35 + i * 0.17), d = i % 2 ? 1 : -1, l = 9 + scRnd(p.seed, 5 + i) * 9;
        ctx.moveTo(0, y); ctx.lineTo(d * l, y - 7 + sw * 0.3);
      }
      ctx.stroke();
      ctx.fillStyle = '#E8F1F6'; ctx.beginPath(); ctx.ellipse(sw * 0.4, -h + 1, 5, 2.4, 0, 0, TAU); ctx.fill();
      ctx.beginPath(); ctx.ellipse(-10, -h * 0.6 - 7, 5, 2, 0, 0, TAU); ctx.fill();
    } },
  { id: 'ar_rock', count: 24, r: 24, gap: 40, s: [0.7, 1.4], draw: function(ctx, p){
      scShadow(ctx, 25, 10, 0.24);
      ctx.fillStyle = '#4F5E6A'; ar_poly(ctx, 0, 0, 7, 13, 22, p.seed, 2, 1, 0.72); ctx.fill();
      ctx.fillStyle = '#6F808D'; ar_poly(ctx, -2, -4, 6, 8, 15, p.seed, 2, 1, 0.65); ctx.fill();
      ctx.fillStyle = '#DCE8EE'; ctx.beginPath(); ctx.ellipse(-3, -8, 11, 4.5, -0.15, 0, TAU); ctx.fill();
      ctx.fillStyle = 'rgba(30,45,60,.35)'; ctx.beginPath(); ctx.ellipse(8, 3, 8, 3.5, 0.3, 0, TAU); ctx.fill();
    } },
  { id: 'ar_bones', count: 12, r: 36, gap: 80, s: [0.8, 1.3], rot: true, draw: function(ctx, p){
      ctx.lineCap = 'round';
      ctx.strokeStyle = 'rgba(70,100,125,.4)'; ctx.lineWidth = 5; ctx.beginPath();
      for (let i = 0; i < 5; i++){ const x = -28 + i * 14; ctx.moveTo(x, 3); ctx.quadraticCurveTo(x + 5, -22 - i % 2 * 4, x + 14, 3); }
      ctx.stroke();
      ctx.strokeStyle = '#D6CCB6'; ctx.lineWidth = 4; ctx.beginPath();
      for (let i = 0; i < 5; i++){ const x = -28 + i * 14; ctx.moveTo(x, 0); ctx.quadraticCurveTo(x + 5, -25 - i % 2 * 4, x + 14, 0); }
      ctx.stroke();
      ctx.strokeStyle = '#B7AD97'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(-32, 1); ctx.lineTo(44, 1); ctx.stroke();
    } },
  { id: 'ar_spires', count: 16, r: 22, gap: 50, s: [0.7, 1.2], draw: function(ctx, p){
      scShadow(ctx, 22, 8, 0.2);
      const n = 3;
      for (let i = 0; i < n; i++){
        const x = (i - 1) * 11 + scRnd(p.seed, i) * 4, h = 18 + scRnd(p.seed, 4 + i) * 20 + (i === 1 ? 8 : 0);
        ctx.fillStyle = '#7898AE'; ctx.beginPath(); ctx.moveTo(x - 7, 2); ctx.lineTo(x - 1, -h); ctx.lineTo(x + 7, 2); ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#B2CCDB'; ctx.beginPath(); ctx.moveTo(x - 7, 2); ctx.lineTo(x - 1, -h); ctx.lineTo(x - 1, 2); ctx.closePath(); ctx.fill();
      }
    } },
  { id: 'ar_twigs', count: 24, r: 16, gap: 24, s: [0.8, 1.3], draw: function(ctx, p, t){
      const sw = scSway(t, p, 1.2);
      ctx.strokeStyle = '#6A6058'; ctx.lineWidth = 1.6; ctx.lineCap = 'round'; ctx.beginPath();
      for (let i = 0; i < 7; i++){ const a = -2.5 + i * 0.33 + scRnd(p.seed, i) * 0.2, l = 12 + scRnd(p.seed, 9 + i) * 8; ctx.moveTo(0, 0); ctx.lineTo(Math.cos(a) * l + sw * 0.4, Math.sin(a) * l); }
      ctx.stroke();
      ctx.fillStyle = '#E4EEF4'; ctx.beginPath(); ctx.ellipse(0, 2, 9, 3.4, 0, 0, TAU); ctx.fill();
    } }
];

for (let i = 0; i < AR_PROPS.length; i++){ const q = AR_PROPS[i]; q.s = [q.s[0] * 1.2, q.s[1] * 1.2]; }
const AR_ARCH = { id: 'ar_arch', count: 2, r: 150, gap: 900, s: [1, 1.2], draw: function(ctx, p){
    scShadow(ctx, 150, 28, 0.2);
    ctx.fillStyle = 'rgba(40,70,95,.28)'; ctx.beginPath(); ctx.ellipse(20, 14, 130, 22, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = '#7C9BB0'; ctx.beginPath();
    ctx.moveTo(-140, 4); ctx.bezierCurveTo(-150, -150, 150, -150, 140, 4); ctx.lineTo(88, 6);
    ctx.bezierCurveTo(95, -78, -95, -78, -88, 6); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#A8C4D5'; ctx.beginPath();
    ctx.moveTo(-140, 4); ctx.bezierCurveTo(-148, -140, -20, -128, -60, -112); ctx.lineTo(-84, -34); ctx.lineTo(-88, 6); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#E3EFF5'; ctx.lineWidth = 7; ctx.lineCap = 'round'; ctx.beginPath();
    ctx.moveTo(-120, -86); ctx.bezierCurveTo(-60, -128, 60, -128, 118, -84); ctx.stroke();
    ctx.strokeStyle = '#5A7890'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(100, -30); ctx.lineTo(112, -60); ctx.moveTo(-100, -40); ctx.lineTo(-110, -20); ctx.stroke();
    ctx.fillStyle = '#E8F1F6'; ctx.beginPath(); ctx.ellipse(-112, 4, 30, 8, 0, 0, TAU); ctx.ellipse(116, 5, 28, 8, 0, 0, TAU); ctx.fill();
  } };
const AR_SPIRE = { id: 'ar_berg', count: 2, r: 110, gap: 900, s: [0.9, 1.2], draw: function(ctx, p){
    scShadow(ctx, 100, 24, 0.22);
    ctx.fillStyle = '#6A8AA0'; ctx.beginPath(); ctx.moveTo(-90, 6); ctx.lineTo(-52, -70); ctx.lineTo(-22, -40); ctx.lineTo(10, -150); ctx.lineTo(44, -60); ctx.lineTo(70, -90); ctx.lineTo(96, 6); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#9FBBCD'; ctx.beginPath(); ctx.moveTo(-90, 6); ctx.lineTo(-52, -70); ctx.lineTo(-22, -40); ctx.lineTo(10, -150); ctx.lineTo(-6, -20); ctx.lineTo(-18, 6); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#C6DAE6'; ctx.beginPath(); ctx.moveTo(10, -150); ctx.lineTo(-4, -96); ctx.lineTo(18, -90); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#4F6E86'; ctx.lineWidth = 2.4; ctx.beginPath(); ctx.moveTo(26, -70); ctx.lineTo(30, -20); ctx.moveTo(-40, -50); ctx.lineTo(-52, -5); ctx.stroke();
    ctx.fillStyle = '#E8F1F6'; ctx.beginPath(); ctx.ellipse(-60, 6, 26, 7, 0, 0, TAU); ctx.ellipse(78, 7, 24, 7, 0, 0, TAU); ctx.fill();
  } };

const AR_DECALS = [
  { id: 'ar_crack', count: 60, s: [0.8, 1.6], draw: function(ctx, d){
      ctx.strokeStyle = 'rgba(80,115,140,.5)'; ctx.lineWidth = 1.5; ctx.lineJoin = 'round'; ctx.beginPath();
      ctx.moveTo(-30, 0); ctx.lineTo(-18, -5); ctx.lineTo(-6, 2); ctx.lineTo(8, -4); ctx.lineTo(22, 3); ctx.lineTo(34, -2);
      ctx.moveTo(-6, 2); ctx.lineTo(-2, 12); ctx.moveTo(8, -4); ctx.lineTo(14, -14); ctx.stroke();
    } },
  { id: 'ar_streak', count: 90, s: [0.8, 1.5], draw: function(ctx, d){
      ctx.lineCap = 'round'; ctx.lineWidth = 2.4; ctx.strokeStyle = 'rgba(255,255,255,.55)'; ctx.beginPath();
      ctx.moveTo(-34, 0); ctx.lineTo(28, -2); ctx.moveTo(-18, 7); ctx.lineTo(36, 6); ctx.stroke();
      ctx.strokeStyle = 'rgba(120,155,180,.32)'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(-26, 12); ctx.lineTo(18, 11); ctx.stroke();
    } },
  { id: 'ar_tracks', count: 40, s: [0.9, 1.3], draw: function(ctx, d){
      ctx.fillStyle = 'rgba(95,125,148,.42)'; ctx.beginPath();
      for (let i = 0; i < 7; i++){ const x = -44 + i * 15, y = (i % 2 ? 6 : -6); ctx.moveTo(x + 4, y); ctx.ellipse(x, y, 4, 2.6, 0.3, 0, TAU); }
      ctx.fill();
    } },
  { id: 'ar_scuff', count: 50, s: [0.8, 1.6], draw: function(ctx, d){
      ctx.fillStyle = 'rgba(120,150,172,.28)'; ctx.beginPath(); ctx.ellipse(0, 0, 38, 14, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = 'rgba(100,135,160,.22)'; ctx.beginPath(); ctx.ellipse(8, 2, 20, 7, 0.2, 0, TAU); ctx.fill();
    } },
  { id: 'ar_sastrugi', count: 70, s: [0.8, 1.5], draw: function(ctx, d){
      ctx.strokeStyle = 'rgba(140,175,196,.5)'; ctx.lineWidth = 1.6; ctx.lineCap = 'round'; ctx.beginPath();
      for (let i = 0; i < 3; i++){ ctx.moveTo(-24 + i * 4, i * 7 - 7); ctx.quadraticCurveTo(0, i * 7 - 13, 26 - i * 3, i * 7 - 6); }
      ctx.stroke();
    } }
];

const AR_AMBIENT = [
  { id: 'ar_flurry', count: 36, layer: 'under',
    init: function(a){ a.sp = 14 + a.seed * 20; },
    update: function(a, dt, t){ a.x += a.sp * dt; a.y += (Math.sin(t * 1.4 + a.ph) * 8 + 10) * dt; },
    draw: function(ctx, a){ ctx.fillStyle = 'rgba(255,255,255,.85)'; ctx.fillRect(0, 0, 3, 3); ctx.fillStyle = 'rgba(110,145,170,.35)'; ctx.fillRect(1, 3, 3, 1.5); } },
  { id: 'ar_glint', count: 30, layer: 'under',
    draw: function(ctx, a, t){
      const k = Math.max(0, Math.sin(t * 2.1 + a.ph * 3));
      if (k < 0.1) return;
      ctx.strokeStyle = 'rgba(255,255,255,' + (0.35 + k * 0.6) + ')'; ctx.lineWidth = 1.6;
      const l = 2 + k * 4; ctx.beginPath(); ctx.moveTo(-l, 0); ctx.lineTo(l, 0); ctx.moveTo(0, -l); ctx.lineTo(0, l); ctx.stroke();
    } },
  { id: 'ar_owl', count: 2, layer: 'over',
    init: function(a){ a.dir = a.seed * TAU; },
    update: function(a, dt, t){ a.dir += Math.sin(t * 0.25 + a.ph) * 0.35 * dt; a.x += Math.cos(a.dir) * 55 * dt; a.y += Math.sin(a.dir) * 55 * dt; },
    draw: function(ctx, a, t){
      ctx.fillStyle = 'rgba(30,50,70,.2)'; ctx.beginPath(); ctx.ellipse(6, 34, 15, 5, 0, 0, TAU); ctx.fill();
      ctx.save(); ctx.translate(0, -18); ctx.rotate(a.dir);
      const f = Math.sin(t * 5 + a.ph) * 4;
      ctx.fillStyle = '#8A8478'; ctx.beginPath(); ctx.ellipse(-1, -11 - f, 5, 13, 0.2, 0, TAU); ctx.ellipse(-1, 11 + f, 5, 13, -0.2, 0, TAU); ctx.fill();
      ctx.fillStyle = '#B5AE9E'; ctx.beginPath(); ctx.ellipse(0, 0, 12, 6.5, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = '#C9C3B4'; ctx.beginPath(); ctx.arc(9, 0, 4.6, 0, TAU); ctx.fill();
      ctx.fillStyle = '#4A443A'; ctx.fillRect(12, -1.2, 2.6, 2.4);
      ctx.restore();
    } },
  { id: 'ar_fog', count: 7, layer: 'under',
    init: function(a){ a.sp = 6 + a.seed * 8; a.w = 130 + a.seed * 90; },
    update: function(a, dt, t){ a.x += a.sp * dt; a.y += Math.sin(t * 0.15 + a.ph) * 3 * dt; },
    draw: function(ctx, a){
      ctx.fillStyle = 'rgba(236,245,250,.14)'; ctx.beginPath(); ctx.ellipse(0, 0, a.w, a.w * 0.36, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = 'rgba(236,245,250,.12)'; ctx.beginPath(); ctx.ellipse(a.w * 0.3, -6, a.w * 0.6, a.w * 0.25, 0, 0, TAU); ctx.fill();
    } }
];

const AR_TERRAIN = [
  { id: 'ar_ice', kind: 'ice', accel: 0.16, count: 4, rMin: 100, rMax: 165, squash: 0.68, hint: 'Slick ice - you slide',
    draw: function(ctx, z){
      ctx.fillStyle = '#7FB2CC'; ctx.beginPath(); ctx.ellipse(0, 0, z.rx + 5, z.ry + 5, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = '#34536B'; ctx.beginPath(); ctx.ellipse(0, 0, z.rx, z.ry, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = '#41647E'; ctx.beginPath(); ctx.ellipse(-z.rx * 0.12, -z.ry * 0.12, z.rx * 0.72, z.ry * 0.68, 0, 0, TAU); ctx.fill();
      ctx.strokeStyle = 'rgba(190,225,240,.5)'; ctx.lineWidth = 1.6; ctx.lineCap = 'round'; ctx.beginPath();
      ctx.moveTo(-z.rx * 0.6, -z.ry * 0.1); ctx.lineTo(-z.rx * 0.25, z.ry * 0.12); ctx.lineTo(z.rx * 0.05, -z.ry * 0.1); ctx.lineTo(z.rx * 0.5, z.ry * 0.2);
      ctx.moveTo(-z.rx * 0.25, z.ry * 0.12); ctx.lineTo(-z.rx * 0.15, z.ry * 0.5); ctx.stroke();
      ctx.strokeStyle = 'rgba(235,248,255,.55)'; ctx.lineWidth = 5; ctx.beginPath();
      ctx.moveTo(-z.rx * 0.5, -z.ry * 0.5); ctx.lineTo(-z.rx * 0.2, -z.ry * 0.62); ctx.moveTo(z.rx * 0.2, z.ry * 0.55); ctx.lineTo(z.rx * 0.5, z.ry * 0.4); ctx.stroke();
    } },
  { id: 'ar_drift', kind: 'slow', mul: 0.72, count: 4, rMin: 90, rMax: 140, squash: 0.7, hint: 'Deep snow slows you',
    draw: function(ctx, z){
      ctx.fillStyle = '#8CAAC0'; ctx.beginPath(); ctx.ellipse(0, 7, z.rx + 4, z.ry + 3, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = '#E9F2F7'; ctx.beginPath(); ctx.ellipse(0, 0, z.rx * 0.97, z.ry * 0.92, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = '#F7FBFD';
      for (let i = 0; i < 4; i++){ const a = z.seed * 6 + i * 1.7; ctx.beginPath(); ctx.ellipse(Math.cos(a) * z.rx * 0.4, Math.sin(a) * z.ry * 0.35 - 4, z.rx * 0.32, z.ry * 0.26, 0, 0, TAU); ctx.fill(); }
      ctx.strokeStyle = 'rgba(100,140,166,.55)'; ctx.lineWidth = 2; ctx.setLineDash([9, 7]); ctx.beginPath(); ctx.ellipse(0, 0, z.rx * 0.97, z.ry * 0.92, 0, 0, TAU); ctx.stroke(); ctx.setLineDash([]);
    } }
];

sceneryRegister([2], {
  patches: [
    { fill: '#A5C0D2', alpha: 0.26, count: 11, rMin: 220, rMax: 420, squash: 0.62 },
    { fill: '#E6F0F6', alpha: 0.3, count: 9, rMin: 200, rMax: 380, squash: 0.6 },
    { fill: '#AFC6DE', alpha: 0.2, count: 6, rMin: 260, rMax: 440, squash: 0.55 },
    { fill: '#A9D0CE', alpha: 0.14, count: 5, rMin: 240, rMax: 400, squash: 0.5 }
  ],
  props: AR_PROPS,
  landmarks: [AR_ARCH, AR_SPIRE],
  decals: AR_DECALS,
  ambient: AR_AMBIENT,
  terrain: AR_TERRAIN
});

/* ============================== SWAMP ============================== */
const SW_PROPS = [
  { id: 'sw_cypress', count: 16, r: 34, gap: 90, s: [0.8, 1.25], draw: function(ctx, p, t){
      const sw = scSway(t, p, 0.8);
      scShadow(ctx, 34, 11, 0.3);
      ctx.fillStyle = '#5A4A33'; ctx.beginPath(); ctx.moveTo(-11, 2); ctx.lineTo(-8, -20); ctx.lineTo(8, -20); ctx.lineTo(11, 2); ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.moveTo(14, 4); ctx.lineTo(18, -6); ctx.lineTo(22, 4); ctx.moveTo(-18, 5); ctx.lineTo(-22, -3); ctx.lineTo(-25, 5); ctx.fill();
      ctx.fillStyle = '#2C3B22'; ctx.beginPath(); ctx.ellipse(sw * 0.3, -40, 28, 17, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = '#394C2A'; ctx.beginPath(); ctx.ellipse(-6 + sw * 0.3, -46, 19, 11, -0.1, 0, TAU); ctx.fill();
      ctx.fillStyle = '#4F6838'; ctx.beginPath(); ctx.ellipse(-10 + sw * 0.3, -50, 8, 4, -0.2, 0, TAU); ctx.fill();
      ctx.strokeStyle = 'rgba(160,172,120,.55)'; ctx.lineWidth = 2; ctx.lineCap = 'round'; ctx.beginPath();
      for (let i = 0; i < 4; i++){ const x = -18 + i * 12 + sw * 0.4, l = 14 + scRnd(p.seed, i) * 14; ctx.moveTo(x, -30); ctx.quadraticCurveTo(x + 2, -30 + l * 0.5, x + sw * 0.6, -30 + l); }
      ctx.stroke();
    } },
  { id: 'sw_log', count: 20, r: 32, gap: 40, s: [0.8, 1.3], rot: true, draw: function(ctx, p){
      ctx.strokeStyle = 'rgba(10,14,6,.35)'; ctx.lineCap = 'round'; ctx.lineWidth = 17; ctx.beginPath(); ctx.moveTo(-30, 4); ctx.lineTo(30, 4); ctx.stroke();
      ctx.strokeStyle = '#3F3323'; ctx.lineWidth = 16; ctx.beginPath(); ctx.moveTo(-30, 0); ctx.lineTo(30, 0); ctx.stroke();
      ctx.strokeStyle = '#594833'; ctx.lineWidth = 10; ctx.beginPath(); ctx.moveTo(-28, -1); ctx.lineTo(28, -1); ctx.stroke();
      ctx.strokeStyle = '#66763C'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(-18 + scRnd(p.seed, 1) * 10, -3); ctx.lineTo(12 + scRnd(p.seed, 2) * 12, -3); ctx.stroke();
      ctx.fillStyle = '#7B6A48'; ctx.beginPath(); ctx.ellipse(30, 0, 4, 7.5, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = '#4A3C28'; ctx.beginPath(); ctx.ellipse(30, 0, 1.8, 3.8, 0, 0, TAU); ctx.fill();
    } },
  { id: 'sw_reeds', count: 50, r: 18, gap: 20, s: [0.8, 1.3], draw: function(ctx, p, t){
      const sw = scSway(t, p, 1.6);
      ctx.fillStyle = 'rgba(12,18,8,.35)'; ctx.beginPath(); ctx.ellipse(0, 3, 14, 5, 0, 0, TAU); ctx.fill();
      ctx.lineCap = 'round'; ctx.lineWidth = 2.4; ctx.strokeStyle = '#6E8040'; ctx.beginPath();
      for (let i = 0; i < 4; i++){ const x = -9 + i * 6, h = 20 + scRnd(p.seed, i) * 14; ctx.moveTo(x, 2); ctx.quadraticCurveTo(x + 1, -h * 0.5, x + (i - 1.5) * 2 + sw, -h); }
      ctx.stroke();
      ctx.strokeStyle = '#8EA058'; ctx.lineWidth = 1.6; ctx.beginPath();
      for (let i = 0; i < 3; i++){ const x = -6 + i * 6, h = 16 + scRnd(p.seed, 6 + i) * 10; ctx.moveTo(x, 2); ctx.lineTo(x + sw * 0.8, -h); }
      ctx.stroke();
      ctx.strokeStyle = '#5E4128'; ctx.lineWidth = 4.5; ctx.beginPath();
      ctx.moveTo(-3 + sw, -27); ctx.lineTo(-3 + sw, -33); ctx.moveTo(5 + sw * 0.8, -22); ctx.lineTo(5 + sw * 0.8, -27); ctx.stroke();
    } },
  { id: 'sw_lilies', count: 22, r: 26, gap: 20, s: [0.8, 1.4], draw: function(ctx, p){
      ctx.fillStyle = 'rgba(14,20,10,.5)'; ctx.beginPath(); ctx.ellipse(0, 1, 28, 14, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = '#486630';
      for (let i = 0; i < 4; i++){ const a = i * 1.7 + scRnd(p.seed, i) * 2; ctx.beginPath(); ctx.ellipse(Math.cos(a) * 12, Math.sin(a) * 6, 9, 5.5, a * 0.3, 0, TAU); ctx.fill(); }
      ctx.fillStyle = '#5C7E3E'; ctx.beginPath(); ctx.ellipse(-2, -1, 7, 4, 0.2, 0, TAU); ctx.fill();
      ctx.fillStyle = '#D6CEA8'; ctx.beginPath(); ctx.arc(Math.cos(p.seed * 9) * 10, Math.sin(p.seed * 9) * 5, 2.2, 0, TAU); ctx.fill();
    } },
  { id: 'sw_mud', count: 22, r: 38, gap: 40, s: [0.8, 1.4], draw: function(ctx, p){
      ctx.fillStyle = '#4A3F2D'; ctx.beginPath(); ctx.ellipse(0, 2, 38, 15, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = '#5E5039'; ctx.beginPath(); ctx.ellipse(-3, -1, 30, 11, 0.05, 0, TAU); ctx.fill();
      ctx.fillStyle = 'rgba(150,135,95,.4)'; ctx.beginPath(); ctx.ellipse(-9, -4, 11, 3.5, -0.1, 0, TAU); ctx.fill();
      ctx.fillStyle = '#36301F'; ctx.beginPath(); ctx.ellipse(12, 3, 7, 2.6, 0, 0, TAU); ctx.fill();
    } },
  { id: 'sw_fungus', count: 16, r: 18, gap: 40, s: [0.8, 1.3], draw: function(ctx, p){
      scShadow(ctx, 15, 6, 0.28);
      ctx.fillStyle = '#3A2E20'; ctx.beginPath(); ctx.ellipse(0, 0, 10, 6, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = '#4A3C29'; ctx.beginPath(); ctx.ellipse(0, -5, 8, 4.5, 0, 0, TAU); ctx.fill();
      for (let i = 0; i < 3; i++){
        const x = (i - 1) * 8, y = -3 - i % 2 * 5;
        ctx.fillStyle = '#8C7A52'; ctx.beginPath(); ctx.ellipse(x, y, 8, 3.4, 0, 0, TAU); ctx.fill();
        ctx.fillStyle = '#AE9A6C'; ctx.beginPath(); ctx.ellipse(x - 1, y - 1.2, 5, 1.8, 0, 0, TAU); ctx.fill();
      }
    } },
  { id: 'sw_stump', count: 14, r: 18, gap: 40, s: [0.8, 1.3], draw: function(ctx, p){
      scShadow(ctx, 17, 7, 0.3);
      ctx.fillStyle = '#3C3022'; ctx.beginPath(); ctx.ellipse(0, 3, 14, 8, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = '#4E4030'; ctx.fillRect(-13, -9, 26, 12);
      ctx.fillStyle = '#6A573B'; ctx.beginPath(); ctx.ellipse(0, -9, 13, 6.5, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = '#231B11'; ctx.beginPath(); ctx.ellipse(1, -9, 7, 3.4, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = '#5C7438'; ctx.beginPath(); ctx.ellipse(-8, -12, 5, 2.4, 0, 0, TAU); ctx.fill();
    } },
  { id: 'sw_knees', count: 24, r: 16, gap: 24, s: [0.8, 1.3], draw: function(ctx, p){
      ctx.fillStyle = 'rgba(10,14,6,.3)'; ctx.beginPath(); ctx.ellipse(0, 3, 15, 5, 0, 0, TAU); ctx.fill();
      for (let i = 0; i < 3; i++){
        const x = (i - 1) * 8 + scRnd(p.seed, i) * 3, h = 9 + scRnd(p.seed, 4 + i) * 9;
        ctx.fillStyle = '#5A4A33'; ctx.beginPath(); ctx.moveTo(x - 4, 3); ctx.quadraticCurveTo(x - 1, -h * 0.7, x + 1, -h); ctx.quadraticCurveTo(x + 3, -h * 0.6, x + 5, 3); ctx.closePath(); ctx.fill();
      }
    } }
];

for (let i = 0; i < SW_PROPS.length; i++){ const q = SW_PROPS[i]; q.s = [q.s[0] * 1.2, q.s[1] * 1.2]; }
const SW_CYPRESS = { id: 'sw_giant', count: 2, r: 150, gap: 900, s: [1, 1.2], draw: function(ctx, p, t){
    const sw = scSway(t, p, 1.5);
    scShadow(ctx, 150, 36, 0.32);
    ctx.fillStyle = '#4C3D2A'; ctx.beginPath();
    ctx.moveTo(-70, 10); ctx.quadraticCurveTo(-36, -4, -26, -60); ctx.lineTo(26, -60); ctx.quadraticCurveTo(38, -4, 74, 12);
    ctx.quadraticCurveTo(0, 28, -70, 10); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#625039'; ctx.beginPath(); ctx.moveTo(-26, -60); ctx.lineTo(-10, -60); ctx.lineTo(-14, 2); ctx.quadraticCurveTo(-30, -2, -46, 8); ctx.quadraticCurveTo(-30, -10, -26, -60); ctx.fill();
    ctx.fillStyle = '#2B3A21'; ctx.beginPath(); ctx.ellipse(sw * 0.4, -130, 140, 56, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = '#374A29'; ctx.beginPath(); ctx.ellipse(-30 + sw * 0.4, -148, 96, 38, -0.08, 0, TAU); ctx.fill();
    ctx.fillStyle = '#4C6537'; ctx.beginPath(); ctx.ellipse(-46 + sw * 0.4, -160, 40, 12, -0.1, 0, TAU); ctx.fill();
    ctx.strokeStyle = 'rgba(165,176,125,.6)'; ctx.lineWidth = 3; ctx.lineCap = 'round'; ctx.beginPath();
    for (let i = 0; i < 9; i++){ const x = -110 + i * 27 + sw * 0.5, l = 36 + scRnd(p.seed, i) * 44; ctx.moveTo(x, -108); ctx.quadraticCurveTo(x + 4, -108 + l * 0.5, x + sw * 1.2, -108 + l); }
    ctx.stroke();
    ctx.fillStyle = '#5A4A33'; ctx.beginPath(); ctx.moveTo(60, 10); ctx.lineTo(74, -14); ctx.lineTo(86, 10); ctx.moveTo(-84, 12); ctx.lineTo(-98, -10); ctx.lineTo(-108, 12); ctx.fill();
  } };
const SW_BOAT = { id: 'sw_boat', count: 2, r: 100, gap: 800, s: [1, 1.3], rot: false, draw: function(ctx, p){
    scShadow(ctx, 100, 22, 0.28);
    ctx.fillStyle = '#3A2E20'; ctx.beginPath(); ctx.moveTo(-96, -4); ctx.quadraticCurveTo(0, 34, 100, -14); ctx.lineTo(88, -30); ctx.quadraticCurveTo(0, -4, -90, -26); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#1E1810'; ctx.beginPath(); ctx.moveTo(-86, -12); ctx.quadraticCurveTo(0, 12, 86, -20); ctx.quadraticCurveTo(0, -4, -86, -20); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#6A5A3C'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-90, -26); ctx.quadraticCurveTo(0, -4, 88, -30); ctx.stroke();
    ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(-40, -20); ctx.lineTo(-36, -52); ctx.moveTo(10, -18); ctx.lineTo(16, -46); ctx.moveTo(52, -22); ctx.lineTo(50, -36); ctx.stroke();
    ctx.fillStyle = '#5F7238'; ctx.beginPath(); ctx.ellipse(-30, -14, 22, 5, -0.05, 0, TAU); ctx.ellipse(64, -22, 14, 4, 0, 0, TAU); ctx.fill();
  } };

const SW_DECALS = [
  { id: 'sw_slide', count: 40, s: [0.8, 1.5], draw: function(ctx, d){
      ctx.lineCap = 'round'; ctx.strokeStyle = 'rgba(30,26,14,.34)'; ctx.lineWidth = 18; ctx.beginPath();
      ctx.moveTo(-50, 0); ctx.quadraticCurveTo(0, -10, 50, 4); ctx.stroke();
      ctx.strokeStyle = 'rgba(100,92,60,.3)'; ctx.lineWidth = 2; ctx.beginPath();
      ctx.moveTo(-48, -7); ctx.quadraticCurveTo(0, -17, 48, -3); ctx.moveTo(-48, 7); ctx.quadraticCurveTo(0, -3, 48, 11); ctx.stroke();
    } },
  { id: 'sw_pit', count: 26, s: [0.8, 1.3], draw: function(ctx, d, t){
      ctx.fillStyle = 'rgba(70,58,36,.5)'; ctx.beginPath(); ctx.ellipse(0, 0, 24, 13, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = 'rgba(12,16,8,.6)'; ctx.beginPath(); ctx.ellipse(0, 1, 15, 7.5, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = 'rgba(150,165,105,.5)'; ctx.beginPath();
      ctx.moveTo(-4 + 2.4, 0); ctx.arc(-4, 0, 2.4, 0, TAU); ctx.moveTo(5 + 1.4, 2); ctx.arc(5, 2, 1.4, 0, TAU); ctx.moveTo(1 + 1, -3); ctx.arc(1, -3, 1, 0, TAU); ctx.fill();
    } },
  { id: 'sw_scum', count: 40, s: [0.8, 1.6], draw: function(ctx, d){
      ctx.fillStyle = 'rgba(100,126,56,.2)'; ctx.beginPath(); ctx.ellipse(0, 0, 40, 15, 0.1, 0, TAU); ctx.fill();
      ctx.fillStyle = 'rgba(120,146,70,.16)'; ctx.beginPath(); ctx.ellipse(10, -2, 20, 7, 0, 0, TAU); ctx.fill();
    } },
  { id: 'sw_prints', count: 40, s: [0.9, 1.3], draw: function(ctx, d){
      ctx.strokeStyle = 'rgba(24,22,12,.55)'; ctx.lineWidth = 1.8; ctx.lineCap = 'round'; ctx.beginPath();
      for (let i = 0; i < 4; i++){ const x = -30 + i * 20, y = i % 2 ? 6 : -6; ctx.moveTo(x - 4, y); ctx.lineTo(x + 4, y - 3); ctx.moveTo(x - 4, y); ctx.lineTo(x + 4, y + 1); ctx.moveTo(x - 4, y); ctx.lineTo(x + 3, y + 5); }
      ctx.stroke();
    } },
  { id: 'sw_leaves', count: 70, s: [0.8, 1.5], draw: function(ctx, d){
      ctx.fillStyle = 'rgba(112,96,52,.55)'; ctx.beginPath();
      ctx.moveTo(-8 + 5, 0); ctx.ellipse(-8, 0, 5, 2.2, 0.4, 0, TAU); ctx.moveTo(8 + 4, 5); ctx.ellipse(8, 5, 4, 2, -0.5, 0, TAU); ctx.moveTo(2 + 4, -7); ctx.ellipse(2, -7, 4, 1.8, 0.1, 0, TAU);
      ctx.fill();
    } }
];

const SW_AMBIENT = [
  { id: 'sw_firefly', count: 28, layer: 'over',
    update: function(a, dt, t){ a.x += Math.cos(t * 0.5 + a.ph) * 16 * dt; a.y += Math.sin(t * 0.7 + a.ph * 2) * 12 * dt; },
    draw: function(ctx, a, t){
      const k = 0.25 + 0.75 * Math.max(0, Math.sin(t * 2.2 + a.ph * 5));
      ctx.fillStyle = 'rgba(200,220,100,' + (k * 0.18) + ')'; ctx.beginPath(); ctx.arc(0, 0, 6, 0, TAU); ctx.fill();
      ctx.fillStyle = 'rgba(224,236,130,' + (k * 0.8) + ')'; ctx.beginPath(); ctx.arc(0, 0, 1.8, 0, TAU); ctx.fill();
    } },
  { id: 'sw_gnats', count: 7, layer: 'over',
    update: function(a, dt, t){ a.x += Math.cos(a.ph + t * 0.2) * 12 * dt; a.y += Math.sin(a.ph * 1.7 + t * 0.25) * 10 * dt; },
    draw: function(ctx, a, t){
      ctx.fillStyle = 'rgba(20,22,12,.75)';
      for (let k = 0; k < 5; k++){ const q = t * (4 + k * 0.7) + k * 1.9 + a.seed * 9; ctx.fillRect(Math.cos(q) * (10 + k * 2), Math.sin(q * 1.3) * (8 + k), 1.8, 1.8); }
    } },
  { id: 'sw_heron', count: 2, layer: 'over',
    init: function(a){ a.dir = a.seed * TAU; },
    update: function(a, dt, t){ a.dir += Math.sin(t * 0.2 + a.ph) * 0.3 * dt; a.x += Math.cos(a.dir) * 48 * dt; a.y += Math.sin(a.dir) * 48 * dt; },
    draw: function(ctx, a, t){
      ctx.fillStyle = 'rgba(10,14,6,.28)'; ctx.beginPath(); ctx.ellipse(6, 36, 20, 6, 0, 0, TAU); ctx.fill();
      ctx.save(); ctx.translate(0, -20); ctx.rotate(a.dir);
      const f = Math.sin(t * 3 + a.ph) * 6;
      ctx.fillStyle = '#7F8C8E'; ctx.beginPath(); ctx.ellipse(-2, -15 - f, 6, 18, 0.15, 0, TAU); ctx.ellipse(-2, 15 + f, 6, 18, -0.15, 0, TAU); ctx.fill();
      ctx.fillStyle = '#AAB4B4'; ctx.beginPath(); ctx.ellipse(0, 0, 13, 5, 0, 0, TAU); ctx.fill();
      ctx.strokeStyle = '#9AA4A4'; ctx.lineWidth = 2.4; ctx.beginPath(); ctx.moveTo(10, 0); ctx.lineTo(20, 0); ctx.stroke();
      ctx.strokeStyle = '#5A5440'; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(-12, -1); ctx.lineTo(-26, -1); ctx.moveTo(-12, 1); ctx.lineTo(-26, 2); ctx.stroke();
      ctx.restore();
    } },
  { id: 'sw_mist', count: 8, layer: 'under',
    init: function(a){ a.sp = 5 + a.seed * 7; a.w = 130 + a.seed * 90; },
    update: function(a, dt, t){ a.x += a.sp * dt; a.y += Math.sin(t * 0.12 + a.ph) * 3 * dt; },
    draw: function(ctx, a){
      ctx.fillStyle = 'rgba(168,184,140,.1)'; ctx.beginPath(); ctx.ellipse(0, 0, a.w, a.w * 0.34, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = 'rgba(168,184,140,.08)'; ctx.beginPath(); ctx.ellipse(a.w * 0.25, -5, a.w * 0.6, a.w * 0.22, 0, 0, TAU); ctx.fill();
    } }
];

const SW_TERRAIN = [
  { id: 'sw_bog', kind: 'slow', mul: 0.7, count: 4, rMin: 100, rMax: 160, squash: 0.7, hint: 'Black mud slows you',
    draw: function(ctx, z, t){
      ctx.fillStyle = '#2B3019'; ctx.beginPath(); ctx.ellipse(0, 0, z.rx + 8, z.ry + 7, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = '#141910'; ctx.beginPath(); ctx.ellipse(0, 0, z.rx, z.ry, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = '#0D110A'; ctx.beginPath(); ctx.ellipse(z.rx * 0.1, z.ry * 0.05, z.rx * 0.66, z.ry * 0.6, 0, 0, TAU); ctx.fill();
      ctx.strokeStyle = 'rgba(120,140,92,.32)'; ctx.lineWidth = 1.6; ctx.beginPath();
      ctx.ellipse(-z.rx * 0.15, -z.ry * 0.1, z.rx * 0.35, z.ry * 0.28, 0, 0.3, 4.6);
      ctx.moveTo(z.rx * 0.5 + 18, z.ry * 0.2); ctx.ellipse(z.rx * 0.5, z.ry * 0.2, 18, 8, 0, 0, TAU); ctx.stroke();
      ctx.fillStyle = 'rgba(140,158,100,.3)'; ctx.beginPath(); ctx.ellipse(-z.rx * 0.38, -z.ry * 0.38, z.rx * 0.2, z.ry * 0.07, -0.3, 0, TAU); ctx.fill();
      ctx.strokeStyle = '#72843F'; ctx.lineWidth = 2.2; ctx.lineCap = 'round'; ctx.beginPath();
      for (let i = 0; i < 10; i++){
        const a = z.seed * 6 + i * 0.63, x = Math.cos(a) * (z.rx + 2), y = Math.sin(a) * (z.ry + 2), h = 12 + scRnd(z.seed, i) * 10;
        ctx.moveTo(x, y); ctx.lineTo(x + Math.cos(a) * 3, y - h);
      }
      ctx.stroke();
    } },
  { id: 'sw_marsh', kind: 'slow', mul: 0.78, count: 2, rMin: 90, rMax: 130, squash: 0.68, hint: 'Thick marsh slows you',
    draw: function(ctx, z){
      ctx.fillStyle = '#55743A'; ctx.beginPath(); ctx.ellipse(0, 0, z.rx, z.ry, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = '#6A8A44'; ctx.beginPath(); ctx.ellipse(-z.rx * 0.1, -z.ry * 0.1, z.rx * 0.8, z.ry * 0.74, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = '#1C2614';
      for (let i = 0; i < 4; i++){ const a = z.seed * 5 + i * 1.6; ctx.beginPath(); ctx.ellipse(Math.cos(a) * z.rx * 0.45, Math.sin(a) * z.ry * 0.42, 14, 6, a, 0, TAU); ctx.fill(); }
      ctx.strokeStyle = '#2A3A1A'; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(0, 0, z.rx, z.ry, 0, 0, TAU); ctx.stroke();
    } }
];

sceneryRegister([3], {
  patches: [
    { fill: '#2A3520', alpha: 0.3, count: 12, rMin: 220, rMax: 420, squash: 0.6 },
    { fill: '#556B34', alpha: 0.2, count: 9, rMin: 200, rMax: 380, squash: 0.6 },
    { fill: '#4C4430', alpha: 0.22, count: 7, rMin: 180, rMax: 340, squash: 0.65 },
    { fill: '#34503A', alpha: 0.18, count: 5, rMin: 240, rMax: 400, squash: 0.55 }
  ],
  props: SW_PROPS,
  landmarks: [SW_CYPRESS, SW_BOAT],
  decals: SW_DECALS,
  ambient: SW_AMBIENT,
  terrain: SW_TERRAIN
});
