'use strict';
/* =============================================================================================================================
   33e-gear-art-more.js  --  THE ART FOR SIX MORE SETS. Cinderhide and Rooftop Runner (common), Moondust and Rustwalker (rare), Site Zero
   (epic) and Worldspire (mythical): a cape, a weapon and an armor each, added to the same registries the first sixteen sets use
   (CAPE_DESIGNS in 33a, WEAPON_ART in 33b, ARMOR_REDRAW and ARMOR_DESIGNS in 33c). Worldspire is the showpiece: a cape of shifting dawn
   colors with rays and stars, a spire of light that reaches far ahead of her, and a plate ringed by a turning constellation.
   ============================================================================================================================= */

/* ---------- capes ---------- */
CAPE_DESIGNS.cinder = function(ctx, o){                                        /* charred cloth, cracked with embers, a ragged hem */
  const F = capeFrame(o), c = o.color, hem = function(v, j){ return (j % 2 ? 0.14 : 0.0) + Math.sin(v * 9) * 0.04; };
  capeBase(ctx, F, blendHex('#2A1A14', c, 0.28), hem, 0.97);
  ctx.save(); gaGlow(ctx, '#FF8A3C', 4); ctx.strokeStyle = '#FF8A3C'; ctx.lineWidth = 1; ctx.globalAlpha = 0.65 + 0.35 * Math.sin(o.t * 5);
  [[0.1, -0.5, 0.45, -0.2, 0.62, -0.6], [0.2, 0.4, 0.5, 0.1, 0.8, 0.5], [0.4, -0.1, 0.7, 0.0, 0.95, -0.3]].forEach(function(r){
    ctx.beginPath(); let p = F(r[0], r[1]); ctx.moveTo(p[0], p[1]); p = F(r[2], r[3]); ctx.lineTo(p[0], p[1]); p = F(r[4], r[5]); ctx.lineTo(p[0], p[1]); ctx.stroke(); });
  ctx.restore();
  for (let i = 0; i < 5; i++) capeDot(ctx, F, 0.15 + i * 0.18, Math.sin(i * 2.3) * 0.6, 0.8 + 0.5 * Math.sin(o.t * 6 + i), 'rgba(255,200,110,' + (0.5 + 0.4 * Math.sin(o.t * 4 + i)) + ')');
  return hem;
};
CAPE_DESIGNS.rooftop = function(ctx, o){                                       /* a windbreaker: two reflective bands, a zip, a hem that flaps */
  const F = capeFrame(o), c = o.color, hem = function(v){ return 0.03 + Math.sin(v * 5 + o.t * 6) * 0.03; };
  capeBase(ctx, F, shade(c, -0.1), hem);
  ctx.strokeStyle = '#E8F57A'; ctx.lineWidth = 2.2; ctx.globalAlpha = 0.9;
  [0.4, 0.62].forEach(function(u){ capeLine(ctx, F, u, -1, u, 1, 3); ctx.stroke(); });
  ctx.strokeStyle = shade(c, 0.55); ctx.lineWidth = 0.9; ctx.setLineDash([1.5, 1.5]); capeLine(ctx, F, 0.04, 0, 0.98, 0.02, 6); ctx.stroke(); ctx.setLineDash([]); ctx.globalAlpha = 1;
  capeDot(ctx, F, 0.1, 0.3, 1.5, '#E8F57A');
  return hem;
};
CAPE_DESIGNS.moondust = function(ctx, o){                                      /* pale dusty cloth with craters and star specks */
  const F = capeFrame(o), c = o.color, hem = function(v){ return Math.sin(v * 4) * 0.05; };
  capeBase(ctx, F, shade(c, -0.18), hem);
  [[0.25, -0.4, 3.2], [0.5, 0.3, 4], [0.72, -0.2, 2.6], [0.88, 0.5, 2.2], [0.14, 0.55, 2]].forEach(function(r){
    const p = F(r[0], r[1]); ctx.strokeStyle = shade(c, -0.4); ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(p[0], p[1], r[2], 0, TAU); ctx.stroke();
    ctx.strokeStyle = 'rgba(255,255,255,.55)'; ctx.beginPath(); ctx.arc(p[0], p[1], r[2], 0.9, 2.3); ctx.stroke(); });
  for (let i = 0; i < 6; i++) capeDot(ctx, F, 0.1 + ((i * 0.31) % 0.85), -0.8 + ((i * 0.47) % 1.6), 0.7, 'rgba(255,255,255,' + (0.4 + 0.4 * Math.sin(o.t * 3 + i)) + ')');
  return hem;
};
CAPE_DESIGNS.rustwalker = function(ctx, o){                                    /* patched iron-red cloth, rivets, streaks of rust */
  const F = capeFrame(o), c = o.color, hem = function(v, j){ return (j % 3 === 0 ? 0.06 : 0.0); };
  capeBase(ctx, F, shade(c, -0.15), hem);
  ctx.fillStyle = shade(c, -0.35); ctx.globalAlpha = 0.9;
  [[0.2, -0.5, 0.18, 0.4], [0.55, 0.2, 0.2, 0.5], [0.78, -0.4, 0.16, 0.35]].forEach(function(r){
    const a = F(r[0], r[1]), b = F(r[0], r[1] + r[3]), d = F(r[0] + r[2], r[1] + r[3]), e = F(r[0] + r[2], r[1]); ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.lineTo(d[0], d[1]); ctx.lineTo(e[0], e[1]); ctx.closePath(); ctx.fill();
    [[0.02, 0.04], [0.02, r[3] - 0.04], [r[2] - 0.02, 0.04], [r[2] - 0.02, r[3] - 0.04]].forEach(function(q){ capeDot(ctx, F, r[0] + q[0], r[1] + q[1], 0.9, '#E8B08A'); }); });
  ctx.globalAlpha = 0.5; ctx.strokeStyle = '#8A3A1A'; ctx.lineWidth = 1; capeLine(ctx, F, 0.3, 0.6, 0.9, 0.7, 3); ctx.stroke(); capeLine(ctx, F, 0.1, -0.8, 0.5, -0.75, 3); ctx.stroke(); ctx.globalAlpha = 1;
  return hem;
};
CAPE_DESIGNS.sitezero = function(ctx, o){                                      /* black cloth, a green grid, redaction bars, a glowing seam */
  const F = capeFrame(o), c = o.color, hem = function(v){ return 0.02; };
  capeBase(ctx, F, '#0E1512', hem, 0.97);
  ctx.strokeStyle = 'rgba(124,255,176,.28)'; ctx.lineWidth = 0.7;
  for (let i = 1; i < 6; i++){ capeLine(ctx, F, i * 0.17, -1, i * 0.17, 1, 2); ctx.stroke(); }
  for (let j = -2; j <= 2; j++){ capeLine(ctx, F, 0.05, j * 0.4, 1, j * 0.4, 3); ctx.stroke(); }
  ctx.fillStyle = '#000'; [[0.25, -0.6, 0.22, 0.45], [0.55, 0.1, 0.3, 0.5]].forEach(function(r){
    const a = F(r[0], r[1]), b = F(r[0], r[1] + r[3]), d = F(r[0] + r[2], r[1] + r[3]), e = F(r[0] + r[2], r[1]); ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.lineTo(d[0], d[1]); ctx.lineTo(e[0], e[1]); ctx.closePath(); ctx.fill(); });
  ctx.save(); gaGlow(ctx, c, 5); ctx.strokeStyle = c; ctx.lineWidth = 1.1; ctx.globalAlpha = 0.6 + 0.4 * Math.sin(o.t * 2.6); capeLine(ctx, F, 0.04, 0.9, 0.97, 0.9, 4); ctx.stroke(); ctx.restore();
  return hem;
};
CAPE_DESIGNS.worldspire = function(ctx, o){                                    /* mythical: dawn colors that turn, rays from the collar, stars, a hem of light */
  const F = capeFrame(o), hem = function(v, j){ return 0.06 + 0.06 * Math.sin(v * 5 + o.t * 3) + (j % 2 ? 0.05 : 0); };
  const h0 = (o.t * 28) % 360;
  ctx.globalAlpha = 0.96;
  for (let i = 0; i < 6; i++){
    const v0 = -1 + i * 0.334, v1 = v0 + 0.334; ctx.fillStyle = hslc(h0 + 300 + i * 22, 78, 66); ctx.beginPath();
    let p = F(0, v0); ctx.moveTo(p[0], p[1]);
    for (let k = 1; k <= 8; k++){ p = F(k / 8, v0); ctx.lineTo(p[0], p[1]); }
    p = F(1 + hem(v1, i), (v0 + v1) / 2); ctx.lineTo(p[0], p[1]);
    for (let k = 8; k >= 0; k--){ p = F(k / 8, v1); ctx.lineTo(p[0], p[1]); }
    ctx.closePath(); ctx.fill();
  }
  ctx.shadowBlur = 0;
  ctx.globalAlpha = 0.3; ctx.strokeStyle = '#FFFFFF'; ctx.lineWidth = 0.9;
  for (let r = -3; r <= 3; r++){ capeLine(ctx, F, 0.02, r * 0.05, 1.05, r * 0.38, 4); ctx.stroke(); }
  ctx.globalAlpha = 1;
  for (let i = 0; i < 9; i++){ const tw = 0.5 + 0.5 * Math.sin(o.t * 5 + i * 1.9), p = F(0.12 + ((i * 0.29) % 0.85), -0.85 + ((i * 0.51) % 1.7)); ctx.globalAlpha = 0.4 + tw * 0.6; ctx.fillStyle = '#FFFFFF'; ctx.beginPath(); ctx.arc(p[0], p[1], 0.8 + tw * 0.9, 0, TAU); ctx.fill(); }
  ctx.globalAlpha = 0.85; ctx.save(); gaGlow(ctx, '#FFE9A0', 6); ctx.strokeStyle = '#FFE9A0'; ctx.lineWidth = 1.4; capePath(ctx, F, hem); ctx.stroke(); ctx.restore(); ctx.globalAlpha = 1;
  return hem;
};

/* ---------- weapons ---------- */
WEAPON_ART.embers = {                                                          /* glowing spurs on the hoof, sparks as it cuts */
  hoof(ctx, o){
    const L = 5 + o.swing * 4, fl = Math.sin(o.t * 12) * 0.8;
    [[5, -3.4, -0.5], [6, 0, 0], [5, 3.4, 0.5]].forEach(function(r){ ctx.fillStyle = '#3A2018'; wpSpike(ctx, r[0], r[1], L + 1, 1.9, r[2]); ctx.fillStyle = o.color; wpSpike(ctx, r[0] + 0.8, r[1], L - 1, 1.1, r[2]); });
    ctx.fillStyle = 'rgba(255,170,70,.85)'; ctx.beginPath(); ctx.moveTo(8, -1.5); ctx.quadraticCurveTo(12 + o.swing * 3, -4 + fl, 15 + o.swing * 5, fl); ctx.quadraticCurveTo(12, 3 + fl, 8, 1.5); ctx.fill();
    if (o.swing > 0.3){ ctx.fillStyle = '#FFD27A'; for (let i = 0; i < 4; i++){ ctx.beginPath(); ctx.arc(10 + i * 3 + o.swing * 4, Math.sin(i * 3 + o.t * 20) * 4, 0.9, 0, TAU); ctx.fill(); } }
  }
};
WEAPON_ART.rebar = {                                                           /* two steel bars strapped along the hoof */
  hoof(ctx, o){
    const L = 11 + o.swing * 5;
    ctx.fillStyle = '#6E727A'; ctx.fillRect(-4, -3.2, L, 2.2); ctx.fillRect(-4, 1, L, 2.2);
    ctx.fillStyle = o.color; ctx.fillRect(-4, -3.2, L, 1); ctx.fillRect(-4, 1, L, 1);
    ctx.strokeStyle = '#3C3F45'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(-1, -4); ctx.lineTo(-1, 4); ctx.moveTo(4, -4); ctx.lineTo(4, 4); ctx.stroke();
    ctx.fillStyle = '#B5651D'; for (let i = 0; i < 3; i++) ctx.fillRect(1 + i * 4, -3.2, 1.2, 1);
  }
};
WEAPON_ART.regolith = {                                                        /* a slab of moon rock on the hoof */
  hoof(ctx, o){
    const k = 1 + o.swing * 0.3, g = ctx.createLinearGradient(0, -7, 0, 7); g.addColorStop(0, '#E4E6EE'); g.addColorStop(1, '#8A8D99');
    ctx.save(); ctx.translate(3, 0); ctx.scale(k, k); ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(-6, -6); ctx.lineTo(7, -7); ctx.lineTo(10, 0); ctx.lineTo(7, 7); ctx.lineTo(-6, 6); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#6A6D78'; ctx.lineWidth = 0.9; ctx.stroke(); ctx.beginPath(); ctx.arc(1, -2, 1.8, 0, TAU); ctx.arc(4, 3, 1.3, 0, TAU); ctx.stroke(); ctx.restore();
    if (o.swing > 0.55){ ctx.globalAlpha = (o.swing - 0.55) * 2; ctx.strokeStyle = 'rgba(210,214,226,.9)'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(8, 0, 9 + o.swing * 4, -1.1, 1.1); ctx.stroke(); ctx.globalAlpha = 1; }
  }
};
WEAPON_ART.ironclad = {                                                        /* a red-iron horseshoe, ringing on the strike */
  hoof(ctx, o){
    ctx.strokeStyle = '#7A3B1E'; ctx.lineWidth = 4.2; ctx.beginPath(); ctx.arc(2, 0, 6.2, -2.6, 2.6, false); ctx.stroke();
    ctx.strokeStyle = o.color; ctx.lineWidth = 2.4; ctx.beginPath(); ctx.arc(2, 0, 6.2, -2.6, 2.6, false); ctx.stroke();
    ctx.fillStyle = '#E8B08A'; for (let i = 0; i < 5; i++){ const a = -2.2 + i * 1.1; ctx.beginPath(); ctx.arc(2 + Math.cos(a) * 6.2, Math.sin(a) * 6.2, 0.8, 0, TAU); ctx.fill(); }
    if (o.swing > 0.35){ ctx.globalAlpha = o.swing * 0.8; ctx.strokeStyle = '#FFD9B8'; ctx.lineWidth = 1; for (let i = 1; i <= 2; i++){ ctx.beginPath(); ctx.arc(9, 0, 4 + i * 4 * o.swing, -0.8, 0.8); ctx.stroke(); } ctx.globalAlpha = 1; }
  }
};
WEAPON_ART.tranq = {                                                           /* a thin prod with a glowing green tip */
  head(ctx, o){
    const L = 26 + o.swing * 10, p = 0.6 + 0.4 * Math.sin(o.t * 6);
    ctx.strokeStyle = '#2B3A33'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(8, 0); ctx.lineTo(8 + L, 0); ctx.stroke();
    ctx.fillStyle = '#D8E6DE'; ctx.fillRect(8 + L * 0.35, -2.6, 8, 5.2); ctx.fillStyle = o.color; ctx.fillRect(8 + L * 0.35 + 1, -1.6, 6, 3.2);
    ctx.save(); gaGlow(ctx, o.color, 8); ctx.fillStyle = 'rgba(190,255,215,' + (0.7 + 0.3 * p) + ')'; wpSpike(ctx, 8 + L - 3, 0, 9 + o.swing * 3, 2.2, 0); ctx.restore();
    if (o.swing > 0.4){ ctx.strokeStyle = o.color; ctx.lineWidth = 1; ctx.globalAlpha = o.swing; ctx.beginPath(); ctx.moveTo(8 + L + 6, 0); ctx.lineTo(8 + L + 10, -4); ctx.lineTo(8 + L + 13, 2); ctx.lineTo(8 + L + 17, -3); ctx.stroke(); ctx.globalAlpha = 1; }
  }
};
WEAPON_ART.worldspire = {                                                      /* mythical: a tall spire of light, a halo that turns, stars in its wake */
  head(ctx, o){
    const L = 46 + o.swing * 18, t = o.t, h = (t * 40) % 360;
    const g = ctx.createLinearGradient(8, 0, 8 + L, 0); g.addColorStop(0, 'rgba(255,255,255,.95)'); g.addColorStop(0.6, hslc(h + 300, 90, 75)); g.addColorStop(1, hslc(h + 40, 95, 82));
    ctx.save(); gaGlow(ctx, '#FF6BD6', 10); ctx.fillStyle = g;
    ctx.beginPath(); ctx.moveTo(8, -3.2); ctx.lineTo(8 + L - 8, -2.2); ctx.lineTo(8 + L + 10, 0); ctx.lineTo(8 + L - 8, 2.2); ctx.lineTo(8, 3.2); ctx.closePath(); ctx.fill(); ctx.restore();
    ctx.strokeStyle = 'rgba(255,255,255,.8)'; ctx.lineWidth = 0.8; ctx.beginPath(); ctx.moveTo(10, 0); ctx.lineTo(8 + L + 6, 0); ctx.stroke();
    ctx.save(); ctx.translate(8 + L * 0.55, 0); ctx.rotate(t * 1.6); ctx.strokeStyle = '#FFE9A0'; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.ellipse(0, 0, 3.6, 8.5, 0, 0, TAU); ctx.stroke();
    ctx.fillStyle = '#FFE9A0'; ctx.beginPath(); ctx.arc(0, -8.5, 1.4, 0, TAU); ctx.arc(0, 8.5, 1.4, 0, TAU); ctx.fill(); ctx.restore();
    for (let i = 0; i < 5; i++){ const s = 0.5 + 0.5 * Math.sin(t * 6 + i * 2); ctx.globalAlpha = 0.4 + 0.6 * s; ctx.fillStyle = '#FFFFFF'; ctx.beginPath(); ctx.arc(12 + i * (L / 5), Math.sin(i * 3.1 + t * 3) * 6, 0.9 + s, 0, TAU); ctx.fill(); }
    ctx.globalAlpha = 1;
  }
};

/* ---------- armor ---------- */
function armorPlate(ctx, c, rim){                                              /* the oval of the back plate that every design here builds on */
  ctx.fillStyle = c; ctx.beginPath(); ctx.ellipse(-2, -1, 17, 9.8, 0, 0, TAU); ctx.fill();
  if (rim){ ctx.strokeStyle = rim; ctx.lineWidth = 1; ctx.beginPath(); ctx.ellipse(-2, -1, 16.4, 9.2, 0, 0, TAU); ctx.stroke(); }
}
ARMOR_REDRAW.cinder = function(ctx, c, t){                                     /* charred plates split by glowing cracks */
  armorPlate(ctx, '#2A1A14', shade(c, 0.1));
  ctx.save(); ctx.beginPath(); ctx.ellipse(-2, -1, 17, 9.8, 0, 0, TAU); ctx.clip();
  ctx.fillStyle = shade(c, -0.25); [[-12, -6, 9, 7], [0, -7, 10, 8], [-8, 2, 11, 7], [4, 1, 9, 7]].forEach(function(r){ ctx.beginPath(); ctx.rect(r[0], r[1], r[2], r[3]); ctx.fill(); });
  gaGlow(ctx, '#FF8A3C', 4); ctx.strokeStyle = '#FF9A4A'; ctx.lineWidth = 1.2; ctx.globalAlpha = 0.6 + 0.4 * Math.sin(t * 4);
  ctx.beginPath(); ctx.moveTo(-14, -1); ctx.lineTo(-3, -2); ctx.lineTo(2, 3); ctx.lineTo(12, 1); ctx.moveTo(-3, -9); ctx.lineTo(-2, 1); ctx.lineTo(-6, 8); ctx.stroke(); ctx.restore();
};
ARMOR_REDRAW.rooftop = function(ctx, c, t){                                    /* a hi-vis vest: reflective stripes, two pockets */
  armorPlate(ctx, shade(c, -0.05), shade(c, 0.4));
  ctx.save(); ctx.beginPath(); ctx.ellipse(-2, -1, 17, 9.8, 0, 0, TAU); ctx.clip();
  ctx.fillStyle = '#E8F57A'; ctx.fillRect(-20, -4.5, 36, 2.6); ctx.fillRect(-20, 1.5, 36, 2.6);
  ctx.fillStyle = 'rgba(255,255,255,.55)'; ctx.fillRect(-20, -4.5, 36, 0.9); ctx.fillRect(-20, 1.5, 36, 0.9);
  ctx.strokeStyle = shade(c, -0.4); ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(-2, -11); ctx.lineTo(-2, 9); ctx.stroke();
  ctx.strokeRect(-14, 4.5, 6, 4); ctx.strokeRect(6, 4.5, 6, 4); ctx.restore();
};
ARMOR_REDRAW.moondust = function(ctx, c, t){                                   /* a pressure plate: nested rings, a glass visor shine, bolts */
  armorPlate(ctx, shade(c, -0.2), shade(c, 0.5));
  ctx.strokeStyle = shade(c, -0.45); ctx.lineWidth = 1.1; [0.78, 0.55].forEach(function(k){ ctx.beginPath(); ctx.ellipse(-2, -1, 17 * k, 9.8 * k, 0, 0, TAU); ctx.stroke(); });
  const g = ctx.createRadialGradient(-5, -4, 1, -2, -1, 9); g.addColorStop(0, 'rgba(225,240,255,.9)'); g.addColorStop(1, 'rgba(120,160,210,.35)'); ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(-2, -1, 8, 4.8, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = shade(c, 0.5); for (let i = 0; i < 8; i++){ const a = i / 8 * TAU; ctx.beginPath(); ctx.arc(-2 + Math.cos(a) * 14.4, -1 + Math.sin(a) * 8, 0.9, 0, TAU); ctx.fill(); }
};
ARMOR_REDRAW.rustwalker = function(ctx, c, t){                                 /* three riveted iron plates, rust on the edges */
  armorPlate(ctx, shade(c, -0.4), shade(c, -0.1));
  ctx.save(); ctx.beginPath(); ctx.ellipse(-2, -1, 17, 9.8, 0, 0, TAU); ctx.clip();
  [-15, -5, 5].forEach(function(x, i){ ctx.fillStyle = i % 2 ? shade(c, -0.1) : c; ctx.fillRect(x, -11, 9.4, 20); ctx.strokeStyle = shade(c, -0.55); ctx.lineWidth = 1; ctx.strokeRect(x, -11, 9.4, 20);
    ctx.fillStyle = '#E8B08A'; [-8, 6].forEach(function(y){ ctx.beginPath(); ctx.arc(x + 2, y, 0.9, 0, TAU); ctx.arc(x + 7.4, y, 0.9, 0, TAU); ctx.fill(); }); });
  ctx.fillStyle = 'rgba(138,58,26,.55)'; for (let i = 0; i < 7; i++) ctx.fillRect(-17 + i * 5, -10 + (i * 7) % 15, 3, 1.4); ctx.restore();
};
ARMOR_REDRAW.sitezero = function(ctx, c, t){                                   /* a dark tactical rig: green grid, glowing nodes, a lens */
  armorPlate(ctx, '#0E1512', c);
  ctx.save(); ctx.beginPath(); ctx.ellipse(-2, -1, 17, 9.8, 0, 0, TAU); ctx.clip();
  ctx.strokeStyle = 'rgba(124,255,176,.3)'; ctx.lineWidth = 0.6; for (let x = -18; x <= 14; x += 4){ ctx.beginPath(); ctx.moveTo(x, -11); ctx.lineTo(x, 9); ctx.stroke(); } for (let y = -10; y <= 8; y += 4){ ctx.beginPath(); ctx.moveTo(-20, y); ctx.lineTo(16, y); ctx.stroke(); }
  ctx.restore();
  [[-12, -5], [8, -5], [-12, 4], [8, 4]].forEach(function(p, i){ fillCircle(ctx, p[0], p[1], 1.2, 'rgba(124,255,176,' + (0.5 + 0.5 * Math.sin(t * 3 + i * 1.5)) + ')'); });
  ctx.strokeStyle = c; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(-2, -1, 4.4, 0, TAU); ctx.stroke(); fillCircle(ctx, -2, -1, 2, '#001A0E'); fillCircle(ctx, -2.6, -1.6, 0.8, c);
};
ARMOR_REDRAW.worldspire = function(ctx, c, t){                                 /* mythical: an iridescent disc, a turning constellation, a halo */
  const h = (t * 30) % 360, g = ctx.createLinearGradient(-19, -10, 15, 8); g.addColorStop(0, hslc(h + 300, 75, 66)); g.addColorStop(0.5, hslc(h + 340, 80, 74)); g.addColorStop(1, hslc(h + 30, 80, 70));
  ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(-2, -1, 17, 9.8, 0, 0, TAU); ctx.fill();
  ctx.save(); gaGlow(ctx, '#FFE9A0', 5); ctx.strokeStyle = '#FFE9A0'; ctx.lineWidth = 1.3; ctx.beginPath(); ctx.ellipse(-2, -1, 16.4, 9.2, 0, 0, TAU); ctx.stroke(); ctx.restore();
  ctx.save(); ctx.translate(-2, -1); ctx.rotate(t * 0.5); const pts = [[0, -7], [6, -2], [4, 5], [-3, 4], [-6, -2]];
  ctx.strokeStyle = 'rgba(255,255,255,.8)'; ctx.lineWidth = 0.8; ctx.beginPath(); pts.forEach(function(p, i){ if (i) ctx.lineTo(p[0], p[1]); else ctx.moveTo(p[0], p[1]); }); ctx.closePath(); ctx.stroke();
  pts.forEach(function(p, i){ fillCircle(ctx, p[0], p[1], 1.1 + 0.5 * Math.sin(t * 4 + i), '#FFFFFF'); }); ctx.restore();
  fillCircle(ctx, -2, -1, 1.6, '#FFE9A0');
};
['cinder', 'rooftop', 'moondust', 'rustwalker', 'sitezero', 'worldspire'].forEach(function(id){
  ARMOR_ORIG[id] = ARMOR_REDRAW[id];                                           /* armorDraw() finds the design here */
  ARMOR_DESIGNS[id] = function(ctx, c, t){ armorDraw(ctx, id, c, (typeof SETMAP !== 'undefined' && SETMAP[id] ? SETMAP[id].rarity : 'common'), P.armorLevel || 1, t); };
});
