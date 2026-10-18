'use strict';
/* Shared drawing helpers for enemies: per-chapter mutation kits (frost, swamp, ocean) and the lk* shape helpers. */
/* ========================= 28. ENEMIES ========================= */
/* ---- per-chapter mutation kits --------------------------------------
   Chapters 2-4 used to reuse chapter 1's creature silhouettes untouched,
   recoloured only. These small helpers let every case in drawEnemy layer
   on a genuinely different, chapter-appropriate look -- jagged ice growths
   for the frost, moss and dripping bog growths for the swamp, fins and
   bioluminescence for the open ocean -- while keeping every creature's
   base proportions (and hitbox) the same animal underneath. All draw in
   the enemy's own local space (already translated/rotated/scaled). */
function frostSpikes(ctx, x, y, n, len, rot, color){
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
  ctx.fillStyle = color;
  for (let i = 0; i < n; i++){
    const a = (i - (n - 1) / 2) * 0.42;
    const l = len * (0.75 + 0.25 * Math.sin(i * 2.1));
    ctx.save(); ctx.rotate(a);
    ctx.beginPath(); ctx.moveTo(0, -2); ctx.lineTo(l, 0); ctx.lineTo(0, 2); ctx.closePath(); ctx.fill();
    ctx.restore();
  }
  ctx.restore();
}
function frostRime(ctx, x, y, rx, ry, rot){
  ctx.save(); ctx.fillStyle = 'rgba(234,249,255,.55)';
  ctx.beginPath(); ctx.ellipse(x, y, rx, ry, rot || 0, 0, TAU); ctx.fill();
  ctx.restore();
}
function icicleDrip(ctx, x, y, len, color){
  ctx.fillStyle = color;
  ctx.beginPath(); ctx.moveTo(x - 1.6, y); ctx.lineTo(x + 1.6, y); ctx.lineTo(x, y + len); ctx.closePath(); ctx.fill();
}
function mossPatch(ctx, x, y, n, size, color){
  for (let i = 0; i < n; i++){
    const a = i * 2.4, r = size * 0.6;
    fillCircle(ctx, x + Math.cos(a) * r * 0.7, y + Math.sin(a) * r * 0.5, size * (0.45 + 0.2 * Math.sin(i * 3)), color);
  }
}
function vineWrap(ctx, x, y, len, rot, color){
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
  ctx.strokeStyle = color; ctx.lineWidth = 1.4; ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-len / 2, 0);
  ctx.quadraticCurveTo(0, -len * 0.4, len / 2, 0);
  ctx.stroke();
  ctx.restore();
}
function bogDrip(ctx, x, y, len, color){
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x - 1.4, y); ctx.lineTo(x + 1.4, y);
  ctx.quadraticCurveTo(x + 1.8, y + len * 0.7, x, y + len);
  ctx.quadraticCurveTo(x - 1.8, y + len * 0.7, x - 1.4, y);
  ctx.closePath(); ctx.fill();
}
function finFrill(ctx, x, y, len, rot, color){
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
  ctx.fillStyle = color; ctx.globalAlpha = 0.85;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  for (let i = 0; i <= 4; i++){
    const t = i / 4;
    ctx.lineTo(len * t, -len * 0.5 * Math.sin(t * Math.PI));
  }
  ctx.lineTo(len, 0); ctx.closePath(); ctx.fill();
  ctx.globalAlpha = 1;
  ctx.restore();
}
function bioSpots(ctx, x, y, n, spread, color, t){
  for (let i = 0; i < n; i++){
    const a = i * 2.1 + t * 0.3;
    const px = x + Math.cos(a) * spread * 0.6, py = y + Math.sin(a) * spread * 0.4;
    const tw = 0.5 + 0.5 * Math.sin(t * 3 + i * 2);
    ctx.globalAlpha = 0.5 + tw * 0.5;
    fillCircle(ctx, px, py, 1 + tw * 0.6, color);
    ctx.globalAlpha = 1;
  }
}
function gillSlits(ctx, x, y, rot, color){
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
  ctx.strokeStyle = color; ctx.lineWidth = 1.2; ctx.lineCap = 'round';
  for (let i = -1; i <= 1; i++){
    ctx.beginPath(); ctx.moveTo(i * 2.6, -3); ctx.quadraticCurveTo(i * 2.6 + 1.4, 0, i * 2.6, 3); ctx.stroke();
  }
  ctx.restore();
}


function lkOV(ctx, x, y, rx, ry, c, rot){ ctx.fillStyle = c; ctx.beginPath(); ctx.ellipse(x, y, rx, ry, rot || 0, 0, TAU); ctx.fill(); }
function lkE2(ctx, x, y, dy, r, c){ fillCircle(ctx, x, y - dy, r, c); fillCircle(ctx, x, y + dy, r, c); }
function lkTRI(ctx, x1, y1, x2, y2, x3, y3, c){ ctx.fillStyle = c; ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.lineTo(x3, y3); ctx.closePath(); ctx.fill(); }
function lkLN(ctx, pts, w, c){
  ctx.strokeStyle = c; ctx.lineWidth = w; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(pts[0], pts[1]);
  for (let i = 2; i < pts.length; i += 2) ctx.lineTo(pts[i], pts[i + 1]);
  ctx.stroke(); ctx.lineCap = 'butt';
}
function lkCV(ctx, x0, y0, cx, cy, x1, y1, w, c){
  ctx.strokeStyle = c; ctx.lineWidth = w; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(x0, y0); ctx.quadraticCurveTo(cx, cy, x1, y1); ctx.stroke(); ctx.lineCap = 'butt';
}
function lkFork(ctx, x, y, len, spread, c){
  ctx.fillStyle = c; ctx.beginPath();
  ctx.moveTo(x, y); ctx.lineTo(x - len, y - spread); ctx.lineTo(x - len * 0.6, y); ctx.lineTo(x - len, y + spread);
  ctx.closePath(); ctx.fill();
}
/* a sinuous body built from overlapping circles, returned so bands can be laid over it */
function lkCHAIN(ctx, n, x0, x1, amp, ph, r0, r1, c, bob){
  const pts = [];
  for (let i = 0; i < n; i++){
    const t = i / (n - 1);
    const p = { x: x0 + (x1 - x0) * t, y: bob + Math.sin(i * 0.9 + ph) * amp * (1 - t * 0.6), r: r0 + (r1 - r0) * t };
    fillCircle(ctx, p.x, p.y, p.r, c); pts.push(p);
  }
  return pts;
}
function lkWings(ctx, flap, len, wid, off, b, tip){
  for (let side = -1; side <= 1; side += 2){
    ctx.save(); ctx.rotate(side * flap);
    lkOV(ctx, -3, side * off, len, wid, b, side * 0.28);
    if (tip) lkOV(ctx, -3 - len * 0.72, side * (off + wid * 0.7), len * 0.36, wid * 0.55, tip, side * 0.28);
    ctx.restore();
  }
}

