'use strict';
/* Scenery definitions: savanna (see js/scenery/36a-scenery-core.js for the format). Chapter 1 the dry savanna, chapter 11 the Changed Savannah. */

const SV_DASH = [10, 9], SV_NODASH = [];

/* ---------- shared drawing helpers (sv_ prefix) ---------- */
function sv_mound(ctx, p, t){                      /* termite mound */
  const h = 0.75 + 0.55 * scRnd(p.seed, 1), w = 0.85 + 0.3 * scRnd(p.seed, 2);
  scShadow(ctx, 22 * w, 11, 0.24);
  ctx.fillStyle = '#7B6644';
  ctx.beginPath(); ctx.ellipse(0, 3, 19 * w, 10, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = '#8F7952';
  ctx.beginPath(); ctx.moveTo(-15 * w, 3); ctx.quadraticCurveTo(-12 * w, -12 * h, -3, -27 * h); ctx.quadraticCurveTo(4, -29 * h, 6, -22 * h);
  ctx.quadraticCurveTo(13 * w, -10 * h, 15 * w, 3); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#A38C64';
  ctx.beginPath(); ctx.moveTo(-12 * w, 0); ctx.quadraticCurveTo(-10 * w, -12 * h, -3, -25 * h); ctx.quadraticCurveTo(-4, -10 * h, -4, 0); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(58,44,26,.5)'; ctx.lineWidth = 1.4;
  ctx.beginPath(); ctx.moveTo(4, -6 * h); ctx.lineTo(8 * w, -10 * h); ctx.moveTo(-1, -14 * h); ctx.lineTo(3, -19 * h); ctx.stroke();
  ctx.fillStyle = '#4A3B25';
  ctx.beginPath(); ctx.ellipse(1, 2, 4.5 * w, 2.4, 0, 0, TAU); ctx.fill();
}
function sv_bones(ctx, p, tint){                   /* skull + ribs; tint = 0 plain bone, 1 crystalised */
  const a = scRnd(p.seed, 3), c1 = tint ? '#9FBDB2' : '#BDB295', c2 = tint ? '#C4DAD0' : '#D2C8AC';
  scShadow(ctx, 20, 8, 0.16);
  ctx.strokeStyle = c1; ctx.lineWidth = 2.6; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(-14, 2); ctx.lineTo(6, -2);
  ctx.moveTo(-8, 4); ctx.quadraticCurveTo(-9, -8, 0, -9); ctx.moveTo(-1, 3); ctx.quadraticCurveTo(0, -9, 9, -8); ctx.stroke();
  ctx.fillStyle = c1;
  fillCircle(ctx, -15, 2, 2.6, c1); fillCircle(ctx, 7, -2, 2.4, c1);
  if (a > 0.45){
    ctx.fillStyle = c2; ctx.beginPath(); ctx.ellipse(14, 5, 8, 5.5, 0.3, 0, TAU); ctx.fill();
    ctx.fillStyle = '#3A3022'; ctx.beginPath(); ctx.ellipse(15, 3.5, 1.7, 1.3, 0, 0, TAU); ctx.ellipse(18, 6, 1.5, 1.2, 0, 0, TAU); ctx.fill();
    ctx.strokeStyle = c2; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(20, 8); ctx.lineTo(25, 10); ctx.stroke();
  }
}
function sv_shard(ctx, x, y, w, h, lean, c1, c2){   /* a crystal: dark body, light facet */
  ctx.fillStyle = c1;
  ctx.beginPath(); ctx.moveTo(x - w, y); ctx.lineTo(x - w * 0.5 + lean, y - h * 0.8); ctx.lineTo(x + lean, y - h); ctx.lineTo(x + w * 0.6, y - h * 0.5 + lean * 0.3); ctx.lineTo(x + w, y); ctx.closePath(); ctx.fill();
  ctx.fillStyle = c2;
  ctx.beginPath(); ctx.moveTo(x - w * 0.2, y); ctx.lineTo(x - w * 0.5 + lean, y - h * 0.8); ctx.lineTo(x + lean, y - h); ctx.lineTo(x + w * 0.15, y - h * 0.4); ctx.closePath(); ctx.fill();
}
function sv_baobab(ctx, p, t, leafy){              /* big bottle trunk with a sprawl of branches; leafy = 0 petrified */
  const sw = scSway(t, p, 1.2), c0 = leafy ? '#74604A' : '#5F6862', c1 = leafy ? '#8A7660' : '#778680';
  scShadow(ctx, 118, 50, 0.22);
  ctx.fillStyle = c0;
  ctx.beginPath(); ctx.moveTo(-26, -62); ctx.bezierCurveTo(-40, -40, -62, -8, -46, 8); ctx.ellipse(0, 8, 46, 20, 0, Math.PI, 0, true);
  ctx.bezierCurveTo(62, -8, 40, -40, 26, -62); ctx.closePath(); ctx.fill();
  ctx.fillStyle = c1;
  ctx.beginPath(); ctx.moveTo(-24, -60); ctx.bezierCurveTo(-38, -38, -56, -6, -42, 6); ctx.bezierCurveTo(-30, -4, -22, -30, -14, -58); ctx.closePath(); ctx.fill();
  ctx.fillStyle = leafy ? '#6A5844' : '#56605A';
  ctx.beginPath(); ctx.ellipse(0, -62, 27, 11, 0, 0, TAU); ctx.fill();
  ctx.strokeStyle = 'rgba(36,28,18,.35)'; ctx.lineWidth = 1.6;
  ctx.beginPath(); ctx.moveTo(-14, 10); ctx.quadraticCurveTo(-18, -26, -10, -56); ctx.moveTo(10, 14); ctx.quadraticCurveTo(14, -26, 8, -56); ctx.moveTo(30, 6); ctx.quadraticCurveTo(30, -24, 20, -54); ctx.stroke();
  ctx.strokeStyle = leafy ? '#5E4F3C' : '#58625C'; ctx.lineWidth = 8; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(-16, -62); ctx.lineTo(-70, -98 + sw); ctx.moveTo(0, -64); ctx.lineTo(4, -118 + sw); ctx.moveTo(16, -62); ctx.lineTo(72, -96 + sw);
  ctx.moveTo(-8, -62); ctx.lineTo(-36, -112); ctx.moveTo(8, -62); ctx.lineTo(40, -114); ctx.stroke();
  if (leafy){
    ctx.fillStyle = '#4C5A2E';
    ctx.beginPath(); ctx.ellipse(-70, -104 + sw, 34, 17, 0, 0, TAU); ctx.ellipse(4, -126 + sw, 40, 19, 0, 0, TAU); ctx.ellipse(72, -102 + sw, 34, 17, 0, 0, TAU);
    ctx.ellipse(-36, -118, 26, 13, 0, 0, TAU); ctx.ellipse(40, -120, 26, 13, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = '#5E6E38';
    ctx.beginPath(); ctx.ellipse(-74, -110 + sw, 18, 7, 0, 0, TAU); ctx.ellipse(0, -132 + sw, 22, 8, 0, 0, TAU); ctx.ellipse(68, -108 + sw, 18, 7, 0, 0, TAU); ctx.ellipse(-38, -123, 12, 5, 0, 0, TAU); ctx.fill();
  } else {
    ctx.strokeStyle = c0; ctx.lineWidth = 4; ctx.beginPath();
    ctx.moveTo(-70, -98 + sw); ctx.lineTo(-90, -112); ctx.moveTo(72, -96 + sw); ctx.lineTo(92, -108); ctx.moveTo(4, -118 + sw); ctx.lineTo(-8, -138); ctx.moveTo(-36, -112); ctx.lineTo(-46, -134); ctx.stroke();
    sv_shard(ctx, -72, -96 + sw, 6, 24, -2, '#3C8F8A', '#5DB5AC');
    sv_shard(ctx, 74, -94 + sw, 6, 22, 2, '#3C8F8A', '#5DB5AC');
    sv_shard(ctx, 4, -116 + sw, 7, 28, 0, '#3C8F8A', '#5DB5AC');
  }
}
/* ========================= CHAPTER 1: SAVANNA ========================= */
const SV_DEF_1 = {
  patches: [
    { fill: '#8E7942', alpha: 0.22, count: 14, rMin: 220, rMax: 460, squash: 0.62 },     /* sun-baked ochre */
    { fill: '#6C6A36', alpha: 0.2, count: 10, rMin: 200, rMax: 400, squash: 0.65 },      /* greener, grassier ground */
    { fill: '#5C4B2E', alpha: 0.2, count: 8, rMin: 180, rMax: 340, squash: 0.6 },       /* dark soil */
    { fill: '#A89462', alpha: 0.15, count: 8, rMin: 200, rMax: 380, squash: 0.6 }       /* pale sand */
  ],
  props: [
    { id: 'sv_mound', count: 12, r: 28, gap: 90, s: [1.1, 1.7], draw: sv_mound },
    { id: 'sv_shrub', count: 30, r: 18, gap: 60, s: [0.8, 1.3], rot: true, draw: function(ctx, p, t){
        scShadow(ctx, 17, 7, 0.14);
        const n = 7; ctx.lineCap = 'round';
        ctx.strokeStyle = '#6F6236'; ctx.lineWidth = 1.7; ctx.beginPath();
        for (let i = 0; i < n; i++){ const a = i / n * Math.PI + 0.2 + scRnd(p.seed, i) * 0.3, L = 10 + scRnd(p.seed, i + 9) * 9; ctx.moveTo(0, 2); ctx.lineTo(Math.cos(a) * L * 1.2, -Math.sin(a) * L * 0.8); }
        ctx.stroke();
        ctx.strokeStyle = '#968547'; ctx.lineWidth = 1.2; ctx.beginPath();
        for (let i = 0; i < 4; i++){ const a = i * 0.8 + 0.4, L = 8 + scRnd(p.seed, i + 20) * 7; ctx.moveTo(0, 2); ctx.lineTo(Math.cos(a) * L * 1.2, -Math.sin(a) * L * 0.8); }
        ctx.stroke();
        ctx.fillStyle = '#4A3F24'; ctx.beginPath(); ctx.ellipse(0, 2, 3.5, 2, 0, 0, TAU); ctx.fill();
      } },
    { id: 'sv_grass', count: 34, r: 16, gap: 40, s: [0.8, 1.4], draw: function(ctx, p, t){
        const sw = scSway(t, p, 2.2); ctx.lineCap = 'round';
        ctx.strokeStyle = '#8A7C45'; ctx.lineWidth = 1.8; ctx.beginPath();
        for (let i = 0; i < 6; i++){ const x = -9 + i * 3.6, h = 16 + scRnd(p.seed, i) * 14; ctx.moveTo(x, 3); ctx.quadraticCurveTo(x + (i - 2.5) * 1.5, -h * 0.5, x + (i - 2.5) * 2.5 + sw * (h / 28), -h); }
        ctx.stroke();
        ctx.strokeStyle = '#B2A163'; ctx.lineWidth = 1.2; ctx.beginPath();
        for (let i = 0; i < 4; i++){ const x = -6 + i * 4.2, h = 14 + scRnd(p.seed, i + 7) * 10; ctx.moveTo(x, 3); ctx.quadraticCurveTo(x, -h * 0.5, x + (i - 1.5) * 2 + sw * (h / 28), -h); }
        ctx.stroke();
      } },
    { id: 'sv_bones', count: 9, r: 20, gap: 80, s: [0.9, 1.3], rot: true, draw: function(ctx, p, t){ sv_bones(ctx, p, 0); } },
    { id: 'sv_acacia', count: 9, r: 38, gap: 120, s: [0.8, 1.2], draw: function(ctx, p, t){
        scShadow(ctx, 44, 16, 0.2);
        ctx.fillStyle = '#4A3C26'; ctx.beginPath(); ctx.ellipse(0, 2, 5, 3.4, 0, 0, TAU); ctx.fill();
        ctx.fillStyle = '#4C5A2E'; ctx.beginPath(); ctx.ellipse(0, -20, 40, 15, 0, 0, TAU); ctx.fill();
        ctx.fillStyle = '#5C6C36'; ctx.beginPath(); ctx.ellipse(-8, -24, 28, 10, 0, 0, TAU); ctx.fill();
        ctx.fillStyle = '#6F7F42'; ctx.beginPath(); ctx.ellipse(-12, -27, 14, 4.5, -0.1, 0, TAU); ctx.fill();
        ctx.strokeStyle = '#3E4A26'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(22, -14); ctx.lineTo(30, -12); ctx.moveTo(-26, -12); ctx.lineTo(-32, -14); ctx.stroke();
      } },
    { id: 'sv_log', count: 7, r: 26, gap: 80, s: [0.8, 1.2], rot: true, draw: function(ctx, p, t){
        scShadow(ctx, 30, 9, 0.2);
        ctx.fillStyle = '#5E4C32'; ctx.beginPath(); ctx.ellipse(0, 0, 28, 8.5, 0, 0, TAU); ctx.fill();
        ctx.fillStyle = '#756146'; ctx.beginPath(); ctx.ellipse(-3, -2, 22, 4.4, 0, 0, TAU); ctx.fill();
        ctx.fillStyle = '#9A8660'; ctx.beginPath(); ctx.ellipse(-26, 0, 4.4, 7.8, 0, 0, TAU); ctx.fill();
        ctx.strokeStyle = '#5A4A30'; ctx.lineWidth = 1; ctx.beginPath(); ctx.ellipse(-26, 0, 2, 4, 0, 0, TAU); ctx.moveTo(6, -4); ctx.lineTo(14, -2); ctx.stroke();
      } },
    { id: 'sv_sandrock', count: 14, r: 22, gap: 60, s: [0.8, 1.4], draw: function(ctx, p, t){
        scShadow(ctx, 24, 10, 0.2);
        ctx.fillStyle = '#6F634E'; ctx.beginPath(); ctx.ellipse(4, 1, 15, 9, 0.1, 0, TAU); ctx.fill();
        ctx.fillStyle = '#85785F'; ctx.beginPath(); ctx.ellipse(-8, -4, 14, 10, -0.2, 0, TAU); ctx.fill();
        ctx.fillStyle = '#9C8F72'; ctx.beginPath(); ctx.ellipse(-11, -8, 7, 4, -0.2, 0, TAU); ctx.fill();
        ctx.fillStyle = '#7C8456'; ctx.beginPath(); ctx.ellipse(5, -2, 3.4, 2, 0, 0, TAU); ctx.fill();
      } }
  ],
  landmarks: [
    { id: 'sv_baobab', count: 2, r: 120, gap: 1100, s: [1, 1.2], draw: function(ctx, p, t){ sv_baobab(ctx, p, t, true); } },
    { id: 'sv_kopje', count: 2, r: 110, gap: 1000, s: [1, 1.25], draw: function(ctx, p, t){
        scShadow(ctx, 112, 40, 0.24);
        ctx.fillStyle = '#5E564A'; ctx.beginPath(); ctx.ellipse(-48, -4, 50, 30, 0.1, 0, TAU); ctx.fill();
        ctx.fillStyle = '#675F52'; ctx.beginPath(); ctx.ellipse(52, 0, 44, 26, -0.1, 0, TAU); ctx.fill();
        ctx.fillStyle = '#756C5D'; ctx.beginPath(); ctx.ellipse(-4, -18, 54, 36, 0, 0, TAU); ctx.fill();
        ctx.fillStyle = '#867D6C'; ctx.beginPath(); ctx.ellipse(-12, -40, 36, 24, -0.1, 0, TAU); ctx.fill();
        ctx.fillStyle = '#9A917E'; ctx.beginPath(); ctx.ellipse(-20, -50, 18, 10, -0.2, 0, TAU); ctx.fill();
        ctx.fillStyle = '#7E8458'; ctx.beginPath(); ctx.ellipse(10, -22, 12, 6, 0.3, 0, TAU); ctx.ellipse(-60, -10, 9, 5, 0, 0, TAU); ctx.fill();
        ctx.strokeStyle = 'rgba(30,24,16,.4)'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(-6, -2); ctx.lineTo(-2, -30); ctx.moveTo(50, -14); ctx.lineTo(56, 8); ctx.stroke();
      } },
    { id: 'sv_cathedral', count: 2, r: 60, gap: 900, s: [2.0, 2.4], draw: sv_mound }
  ],
  decals: [
    { id: 'sv_trail', count: 40, s: [0.8, 1.6], draw: function(ctx, d, t){
        ctx.fillStyle = 'rgba(168,148,104,.16)'; ctx.beginPath(); ctx.ellipse(0, 0, 120, 8, 0, 0, TAU); ctx.fill();
        ctx.fillStyle = 'rgba(176,156,112,.12)'; ctx.beginPath(); ctx.ellipse(40, 2, 70, 4, 0.04, 0, TAU); ctx.fill();
      } },
    { id: 'sv_crack', count: 55, s: [0.8, 1.5], draw: function(ctx, d, t){
        ctx.strokeStyle = 'rgba(50,38,22,.38)'; ctx.lineWidth = 1.3; ctx.lineJoin = 'round'; ctx.beginPath();
        ctx.moveTo(-34, 0); ctx.lineTo(-18, -5); ctx.lineTo(-4, 2); ctx.lineTo(14, -3); ctx.lineTo(32, 3);
        ctx.moveTo(-4, 2); ctx.lineTo(0, 12); ctx.lineTo(-6, 20); ctx.moveTo(14, -3); ctx.lineTo(20, -14);
        ctx.stroke();
      } },
    { id: 'sv_tracks', count: 40, s: [0.9, 1.3], draw: function(ctx, d, t){
        ctx.fillStyle = 'rgba(56,42,26,.3)'; ctx.beginPath();
        for (let i = 0; i < 6; i++){ const x = -40 + i * 16, y = (i & 1) ? 5 : -5; ctx.moveTo(x + 4, y); ctx.ellipse(x, y, 4, 2.8, 0.3, 0, TAU); }
        ctx.fill();
      } },
    { id: 'sv_litter', count: 55, s: [0.8, 1.4], draw: function(ctx, d, t){
        ctx.strokeStyle = 'rgba(170,152,92,.4)'; ctx.lineWidth = 1.2; ctx.lineCap = 'round'; ctx.beginPath();
        for (let i = 0; i < 6; i++){ const x = -14 + i * 5.5, y = scRnd(d.seed, i) * 10 - 5; ctx.moveTo(x, y); ctx.lineTo(x + 6, y + 2 - scRnd(d.seed, i + 5) * 5); }
        ctx.stroke();
      } },
    { id: 'sv_scuff', count: 45, s: [0.8, 1.5], draw: function(ctx, d, t){
        ctx.fillStyle = 'rgba(52,40,24,.22)'; ctx.beginPath(); ctx.ellipse(0, 0, 16, 6, 0, 0, TAU); ctx.fill();
        ctx.fillStyle = 'rgba(190,172,128,.2)'; ctx.beginPath(); ctx.ellipse(-3, -1, 8, 3, 0, 0, TAU); ctx.fill();
      } }
  ],
  ambient: [
    { id: 'sv_birds', count: 6, layer: 'over',
      init: function(a){ const ang = a.seed * TAU; a.vx = Math.cos(ang) * (50 + a.seed * 30); a.vy = Math.sin(ang) * (30 + a.seed * 20); },
      update: function(a, dt, t){ a.x += a.vx * dt; a.y += a.vy * dt; },
      draw: function(ctx, a, t){
        const f = Math.sin(t * 8 + a.ph) * 4;
        ctx.fillStyle = 'rgba(14,10,6,.14)'; ctx.beginPath(); ctx.ellipse(14, 34, 7, 3, 0, 0, TAU); ctx.fill();
        ctx.strokeStyle = '#4A4032'; ctx.lineWidth = 2.2; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(-9, -f); ctx.lineTo(0, 1); ctx.lineTo(9, -f); ctx.stroke();
        ctx.fillStyle = '#4A4032'; ctx.beginPath(); ctx.ellipse(0, 2, 3, 2, 0, 0, TAU); ctx.fill();
      } },
    { id: 'sv_dustdevil', count: 3, layer: 'under',
      init: function(a){ a.vx = 12 + a.seed * 16; a.vy = (a.seed - 0.5) * 20; },
      update: function(a, dt, t){ a.x += a.vx * dt; a.y += a.vy * dt + Math.sin(t * 0.4 + a.ph) * 6 * dt; },
      draw: function(ctx, a, t){
        ctx.strokeStyle = 'rgba(196,176,128,.22)'; ctx.lineWidth = 3; ctx.lineCap = 'round';
        for (let i = 0; i < 4; i++){ const r = 6 + i * 6, y = -i * 11, o = Math.sin(t * 3 + a.ph + i) * 3;
          ctx.beginPath(); ctx.ellipse(o, y, r, r * 0.32, 0, 0.2, Math.PI * 1.6); ctx.stroke(); }
        ctx.fillStyle = 'rgba(150,128,86,.14)'; ctx.beginPath(); ctx.ellipse(0, 4, 16, 6, 0, 0, TAU); ctx.fill();
      } },
    { id: 'sv_butterfly', count: 10, layer: 'over',
      init: function(a){ a.hd = a.seed * TAU; },
      update: function(a, dt, t){ a.hd += Math.sin(t * 1.7 + a.ph * 3) * dt * 3; a.x += Math.cos(a.hd) * 26 * dt; a.y += Math.sin(a.hd) * 18 * dt; },
      draw: function(ctx, a, t){
        const w = 1.2 + Math.abs(Math.sin(t * 14 + a.ph)) * 3.2;
        ctx.fillStyle = a.seed < 0.5 ? '#C7A872' : '#B9B58A';
        ctx.beginPath(); ctx.ellipse(-2, 0, w, 2.4, -0.4, 0, TAU); ctx.ellipse(2, 0, w, 2.4, 0.4, 0, TAU); ctx.fill();
        ctx.fillStyle = '#4A3E2A'; ctx.fillRect(-0.6, -2, 1.2, 4);
      } }
  ],
  terrain: [
    { id: 'sv_mud', kind: 'slow', mul: 0.74, count: 6, rMin: 90, rMax: 150, squash: 0.68,
      hint: 'Mud wallow: it slows you and the creatures',
      draw: function(ctx, z, t){
        ctx.fillStyle = 'rgba(40,30,18,.28)'; ctx.beginPath(); ctx.ellipse(3, 5, z.rx * 1.06, z.ry * 1.06, 0, 0, TAU); ctx.fill();
        ctx.fillStyle = '#7E6A46'; ctx.beginPath(); ctx.ellipse(0, 0, z.rx * 1.05, z.ry * 1.05, 0, 0, TAU); ctx.fill();
        ctx.fillStyle = '#56452D'; ctx.beginPath(); ctx.ellipse(0, 0, z.rx * 0.93, z.ry * 0.93, 0, 0, TAU); ctx.fill();
        ctx.fillStyle = '#625035'; ctx.beginPath(); ctx.ellipse(-z.rx * 0.1, -z.ry * 0.08, z.rx * 0.62, z.ry * 0.58, 0, 0, TAU); ctx.fill();
        ctx.strokeStyle = 'rgba(175,150,105,.3)'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.ellipse(0, 0, z.rx * 0.44, z.ry * 0.4, 0, 0.3, 2.6); ctx.ellipse(z.rx * 0.2, z.ry * 0.1, z.rx * 0.26, z.ry * 0.22, 0, 3.4, 5.8);
        ctx.moveTo(-z.rx * 0.7, z.ry * 0.3); ctx.lineTo(-z.rx * 0.5, z.ry * 0.38); ctx.stroke();
        ctx.fillStyle = 'rgba(160,138,96,.5)';
        ctx.beginPath(); for (let i = 0; i < 5; i++){ const a = z.seed * 6 + i * 1.25; ctx.moveTo(Math.cos(a) * z.rx * 0.78 + 2.5, Math.sin(a) * z.ry * 0.78); ctx.arc(Math.cos(a) * z.rx * 0.78, Math.sin(a) * z.ry * 0.78, 2.5, 0, TAU); } ctx.fill();
      } }
  ]
};

/* ========================= CHAPTER 11: THE CHANGED SAVANNAH ========================= */
const SV_DEF_11 = {
  patches: [
    { fill: '#4C8A7C', alpha: 0.17, count: 12, rMin: 200, rMax: 420, squash: 0.62 },     /* crystal-stained ground */
    { fill: '#8A8466', alpha: 0.2, count: 10, rMin: 200, rMax: 400, squash: 0.65 },      /* withered, ashen */
    { fill: '#6C7C8A', alpha: 0.13, count: 7, rMin: 220, rMax: 400, squash: 0.6 }       /* cool glassy sheen */
  ],
  props: [
    { id: 'sv_crystals', count: 20, r: 24, gap: 70, s: [0.8, 1.3], draw: function(ctx, p, t){
        scShadow(ctx, 22, 8, 0.2);
        sv_shard(ctx, -9, 3, 6, 18 + scRnd(p.seed, 1) * 8, -3, '#2F706C', '#468F88');
        sv_shard(ctx, 9, 4, 5, 15 + scRnd(p.seed, 2) * 8, 3, '#2F706C', '#468F88');
        sv_shard(ctx, 0, 5, 7, 25 + scRnd(p.seed, 3) * 10, 1, '#3A8580', '#5DB0A6');
        ctx.fillStyle = 'rgba(190,245,235,.55)'; ctx.beginPath(); ctx.ellipse(-1, -23 - scRnd(p.seed, 3) * 8, 1.6, 2.6, 0, 0, TAU); ctx.fill();
      } },
    { id: 'sv_stonetree', count: 14, r: 24, gap: 90, s: [0.8, 1.3], draw: function(ctx, p, t){
        scShadow(ctx, 24, 9, 0.2);
        ctx.lineCap = 'round'; ctx.strokeStyle = '#5E665F'; ctx.lineWidth = 5;
        ctx.beginPath(); ctx.moveTo(0, 4); ctx.lineTo(1, -24); ctx.moveTo(1, -12); ctx.lineTo(-15, -28); ctx.moveTo(1, -18); ctx.lineTo(15, -32); ctx.moveTo(1, -24); ctx.lineTo(3, -40); ctx.stroke();
        ctx.strokeStyle = '#7F8D86'; ctx.lineWidth = 1.6;
        ctx.beginPath(); ctx.moveTo(-1.5, 2); ctx.lineTo(-0.5, -22); ctx.moveTo(-3, -14); ctx.lineTo(-14, -27); ctx.stroke();
        ctx.fillStyle = '#4A433A'; ctx.beginPath(); ctx.ellipse(0, 4, 6, 3, 0, 0, TAU); ctx.fill();
        sv_shard(ctx, 15, -31, 2.6, 9, 1, '#3A8580', '#5DB0A6');
      } },
    { id: 'sv_withered', count: 34, r: 16, gap: 40, s: [0.8, 1.3], draw: function(ctx, p, t){
        ctx.lineCap = 'round'; ctx.strokeStyle = '#8C876A'; ctx.lineWidth = 1.6; ctx.beginPath();
        for (let i = 0; i < 6; i++){ const x = -9 + i * 3.6, h = 12 + scRnd(p.seed, i) * 10, l = (i - 2.5) * 2.6; ctx.moveTo(x, 3); ctx.lineTo(x + l * 0.5, -h * 0.55); ctx.lineTo(x + l, -h * 0.8 + 4); }
        ctx.stroke();
        ctx.strokeStyle = '#B4B08E'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(-3, 3); ctx.lineTo(-1, -14); ctx.moveTo(4, 3); ctx.lineTo(8, -10); ctx.stroke();
      } },
    { id: 'sv_glassrock', count: 14, r: 20, gap: 60, s: [0.8, 1.4], draw: function(ctx, p, t){
        scShadow(ctx, 20, 8, 0.2);
        ctx.fillStyle = '#4F6C68'; ctx.beginPath(); ctx.ellipse(0, 0, 15, 9, 0.1, 0, TAU); ctx.fill();
        ctx.fillStyle = '#6E918A'; ctx.beginPath(); ctx.ellipse(-3, -2, 10, 5.5, -0.2, 0, TAU); ctx.fill();
        ctx.fillStyle = 'rgba(205,245,236,.5)'; ctx.beginPath(); ctx.ellipse(-6, -4, 4, 1.8, -0.3, 0, TAU); ctx.fill();
      } },
    { id: 'sv_geode', count: 8, r: 22, gap: 80, s: [0.9, 1.3], draw: function(ctx, p, t){
        scShadow(ctx, 22, 9, 0.2);
        ctx.fillStyle = '#5E5B50'; ctx.beginPath(); ctx.ellipse(0, 0, 17, 10, 0, 0, TAU); ctx.fill();
        ctx.fillStyle = '#767265'; ctx.beginPath(); ctx.ellipse(-3, -3, 12, 6, 0, 0, TAU); ctx.fill();
        ctx.fillStyle = '#245E5C'; ctx.beginPath(); ctx.ellipse(2, -1, 8, 4.4, 0.1, 0, TAU); ctx.fill();
        ctx.fillStyle = '#4FA79C'; ctx.beginPath(); ctx.ellipse(3, -1.5, 4.5, 2.2, 0.1, 0, TAU); ctx.fill();
      } },
    { id: 'sv_xbones', count: 8, r: 20, gap: 80, s: [0.9, 1.3], rot: true, draw: function(ctx, p, t){ sv_bones(ctx, p, 1); } }
  ],
  landmarks: [
    { id: 'sv_spire', count: 2, r: 100, gap: 1000, s: [1, 1.25], draw: function(ctx, p, t){
        scShadow(ctx, 96, 34, 0.24);
        ctx.fillStyle = 'rgba(80,200,185,.08)'; ctx.beginPath(); ctx.ellipse(0, -10, 110, 52, 0, 0, TAU); ctx.fill();
        sv_shard(ctx, -48, 8, 14, 52, -6, '#2B6663', '#3F8580');
        sv_shard(ctx, 46, 10, 13, 46, 6, '#2B6663', '#3F8580');
        sv_shard(ctx, -18, 14, 18, 78, -3, '#2F706C', '#468F88');
        sv_shard(ctx, 22, 14, 16, 64, 4, '#337773', '#4FA096');
        sv_shard(ctx, 0, 18, 22, 104, 2, '#3A8580', '#5DB0A6');
        ctx.fillStyle = 'rgba(200,250,240,.6)'; ctx.beginPath(); ctx.ellipse(2, -82, 2.4, 6, 0.2, 0, TAU); ctx.fill();
      } },
    { id: 'sv_petribao', count: 1, r: 120, gap: 1100, s: [1, 1.1], draw: function(ctx, p, t){ sv_baobab(ctx, p, t, false); } }
  ],
  decals: [
    { id: 'sv_gcrack', count: 55, s: [0.8, 1.5], draw: function(ctx, d, t){
        ctx.lineJoin = 'round'; ctx.strokeStyle = 'rgba(30,50,48,.4)'; ctx.lineWidth = 2.2; ctx.beginPath();
        ctx.moveTo(-34, 0); ctx.lineTo(-18, -6); ctx.lineTo(-4, 2); ctx.lineTo(14, -4); ctx.lineTo(32, 3); ctx.moveTo(-4, 2); ctx.lineTo(1, 14); ctx.stroke();
        ctx.strokeStyle = 'rgba(120,225,210,.3)'; ctx.lineWidth = 1; ctx.beginPath();
        ctx.moveTo(-34, -1); ctx.lineTo(-18, -7); ctx.lineTo(-4, 1); ctx.lineTo(14, -5); ctx.lineTo(32, 2); ctx.stroke();
      } },
    { id: 'sv_gpuddle', count: 28, s: [0.8, 1.6], draw: function(ctx, d, t){
        ctx.fillStyle = 'rgba(100,170,160,.2)'; ctx.beginPath(); ctx.ellipse(0, 0, 30, 14, 0, 0, TAU); ctx.fill();
        ctx.fillStyle = 'rgba(190,240,232,.2)'; ctx.beginPath(); ctx.ellipse(-6, -3, 14, 5, -0.1, 0, TAU); ctx.fill();
      } },
    { id: 'sv_speck', count: 60, s: [0.8, 1.3], draw: function(ctx, d, t){
        ctx.fillStyle = 'rgba(160,235,222,.4)'; ctx.beginPath();
        for (let i = 0; i < 5; i++){ const x = scRnd(d.seed, i) * 30 - 15, y = scRnd(d.seed, i + 5) * 16 - 8; ctx.moveTo(x + 1.5, y); ctx.arc(x, y, 1.5, 0, TAU); }
        ctx.fill();
      } },
    { id: 'sv_fused', count: 26, s: [0.8, 1.4], draw: function(ctx, d, t){
        ctx.strokeStyle = 'rgba(30,26,20,.16)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(0, 0, 24, 11, 0, 0, TAU); ctx.stroke();
        ctx.strokeStyle = 'rgba(110,200,188,.25)'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.ellipse(0, 0, 18, 8, 0, 0, TAU); ctx.stroke();
      } },
    { id: 'sv_litter11', count: 40, s: [0.8, 1.3], draw: function(ctx, d, t){
        ctx.fillStyle = 'rgba(110,190,178,.4)'; ctx.beginPath();
        for (let i = 0; i < 3; i++){ const x = i * 8 - 8, y = scRnd(d.seed, i) * 8 - 4; ctx.moveTo(x - 2, y + 2); ctx.lineTo(x, y - 3); ctx.lineTo(x + 2.4, y + 2); ctx.closePath(); }
        ctx.fill();
      } }
  ],
  ambient: [
    { id: 'sv_motes', count: 24, layer: 'over',
      init: function(a){ a.vx = 0; a.vy = -(5 + a.seed * 8); },
      update: function(a, dt, t){ a.y += a.vy * dt; a.x += Math.sin(t * 0.6 + a.ph) * 8 * dt; },
      draw: function(ctx, a, t){
        const tw = 0.35 + 0.35 * Math.sin(t * 2 + a.ph * 3);
        ctx.globalAlpha = tw; ctx.fillStyle = '#B0F2E4';
        ctx.beginPath(); ctx.arc(0, 0, 1.4 + a.seed * 1.2, 0, TAU); ctx.fill(); ctx.globalAlpha = 1;
      } },
    { id: 'sv_glints', count: 34, layer: 'under',
      draw: function(ctx, a, t){
        const tw = Math.sin(t * 1.6 + a.ph * 4); if (tw < 0.2) return;
        ctx.strokeStyle = 'rgba(190,250,240,' + (tw * 0.5).toFixed(2) + ')'; ctx.lineWidth = 1.2;
        const s = 3 + tw * 3; ctx.beginPath(); ctx.moveTo(-s, 0); ctx.lineTo(s, 0); ctx.moveTo(0, -s); ctx.lineTo(0, s); ctx.stroke();
      } }
  ],
  terrain: [
    { id: 'sv_crystalgrass', kind: 'slow', mul: 0.76, count: 5, rMin: 90, rMax: 150, squash: 0.68,
      hint: 'Crystal grass: it slows you and the creatures',
      draw: function(ctx, z, t){
        ctx.fillStyle = 'rgba(54,130,120,.26)'; ctx.beginPath(); ctx.ellipse(0, 0, z.rx, z.ry, 0, 0, TAU); ctx.fill();
        ctx.strokeStyle = 'rgba(130,230,215,.4)'; ctx.lineWidth = 2; ctx.setLineDash(SV_DASH);
        ctx.beginPath(); ctx.ellipse(0, 0, z.rx * 0.97, z.ry * 0.97, 0, 0, TAU); ctx.stroke(); ctx.setLineDash(SV_NODASH);
        ctx.fillStyle = 'rgba(70,160,148,.8)'; ctx.beginPath();
        for (let i = 0; i < 16; i++){ const a = z.seed * 7 + i * 2.399, rr = Math.sqrt((i + 0.5) / 16), x = Math.cos(a) * z.rx * 0.82 * rr, y = Math.sin(a) * z.ry * 0.82 * rr;
          ctx.moveTo(x - 3, y + 3); ctx.lineTo(x + 0.5, y - 12 - (i % 3) * 3); ctx.lineTo(x + 3.5, y + 3); ctx.closePath(); }
        ctx.fill();
        ctx.fillStyle = 'rgba(190,248,238,.5)'; ctx.beginPath();
        for (let i = 0; i < 8; i++){ const a = z.seed * 5 + i * 2.399 + 0.5, rr = Math.sqrt((i + 0.5) / 8), x = Math.cos(a) * z.rx * 0.8 * rr, y = Math.sin(a) * z.ry * 0.8 * rr;
          ctx.moveTo(x + 0.5, y - 12); ctx.lineTo(x + 0.5, y - 5); ctx.lineTo(x + 2.5, y - 8); ctx.closePath(); }
        ctx.fill();
      } },
    { id: 'sv_glassice', kind: 'ice', accel: 0.16, count: 3, rMin: 90, rMax: 140, squash: 0.65,
      hint: 'Glassy ground: you slide',
      draw: function(ctx, z, t){
        ctx.fillStyle = 'rgba(170,225,225,.18)'; ctx.beginPath(); ctx.ellipse(0, 0, z.rx, z.ry, 0, 0, TAU); ctx.fill();
        ctx.fillStyle = 'rgba(215,248,244,.14)'; ctx.beginPath(); ctx.ellipse(-z.rx * 0.12, -z.ry * 0.12, z.rx * 0.7, z.ry * 0.62, 0, 0, TAU); ctx.fill();
        ctx.strokeStyle = 'rgba(230,255,250,.4)'; ctx.lineWidth = 2.2; ctx.beginPath(); ctx.ellipse(0, 0, z.rx, z.ry, 0, 0, TAU); ctx.stroke();
        ctx.strokeStyle = 'rgba(255,255,255,.3)'; ctx.lineWidth = 2; ctx.lineCap = 'round'; ctx.beginPath();
        ctx.moveTo(-z.rx * 0.5, -z.ry * 0.2); ctx.lineTo(-z.rx * 0.15, -z.ry * 0.5); ctx.moveTo(-z.rx * 0.35, z.ry * 0.1); ctx.lineTo(z.rx * 0.2, -z.ry * 0.35);
        ctx.moveTo(z.rx * 0.1, z.ry * 0.45); ctx.lineTo(z.rx * 0.5, z.ry * 0.1); ctx.stroke();
        ctx.strokeStyle = 'rgba(60,110,110,.45)'; ctx.lineWidth = 1.2; ctx.beginPath();
        ctx.moveTo(-z.rx * 0.1, 0); ctx.lineTo(z.rx * 0.15, z.ry * 0.2); ctx.lineTo(z.rx * 0.35, z.ry * 0.1); ctx.moveTo(z.rx * 0.15, z.ry * 0.2); ctx.lineTo(z.rx * 0.1, z.ry * 0.5); ctx.stroke();
      } }
  ]
};

sceneryRegister([1], SV_DEF_1);
sceneryRegister([11], SV_DEF_11);

