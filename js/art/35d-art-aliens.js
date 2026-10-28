'use strict';
/* Enemy art, Chapter 9: the fire aliens of Venus (ALIEN_DRAW). */
/* ======================== Chapter 9: the fire aliens of Venus ======================== */
/* Seen from above, facing +x. The Venus aliens are one family: a dark, plated carapace (the body color for the plates,
   the dark color for the rim and joints), glowing ember seams between the plates (the definition's pale color, with a
   hotter core), spiked shoulders, a flame crest and amber eyes. Each species gets its own limbs, silhouette and tools.
   They use the Space Marines' behaviors (so each slot still plays like its Chapter 8 counterpart); only what you SEE is new.
   Helpers prefixed al9 are private to this file; the a* weapon helpers are shared with Chapter 10. */
const AL9_PAL = new Map(), AL9_LT = new Map();
const AL9_BONE = '#EBD7AC', AL9_BONE_D = '#B8955E', AL9_EYE = '#FFC83A', AL9_PUPIL = '#3A0C04';
/* a palette derived once per (body, dark, pale) color set, so a hit flash (which blends b and dk) still shades correctly */
function al9Pal(b, dk, pale){
  let p = AL9_PAL.get(b);
  if (p === undefined || p.dk !== dk || p.pale !== pale){
    if (AL9_PAL.size > 160) AL9_PAL.clear();
    p = { b: b, dk: dk, pale: pale, hi: blendHex(b, '#FFFFFF', 0.3), lo: shade(b, -0.34), mid: blendHex(b, dk, 0.5), deep: shade(dk, -0.5), hot: blendHex(pale, '#FFF6D8', 0.6) };
    AL9_PAL.set(b, p);
  }
  return p;
}
function al9Lt(c){ let v = AL9_LT.get(c); if (v === undefined){ if (AL9_LT.size > 120) AL9_LT.clear(); v = blendHex(c, '#FFFFFF', 0.28); AL9_LT.set(c, v); } return v; }
function al9Blob(ctx, x, y, r, c, a, A){ ctx.globalAlpha = A * a; ctx.fillStyle = c; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill(); ctx.globalAlpha = A; }
/* a lumpy rock polygon (fists, boulders) */
function al9Rock(ctx, x, y, r, c, ph, n){
  const m = n || 7; ctx.fillStyle = c; ctx.beginPath();
  for (let i = 0; i < m; i++){ const a = i / m * TAU + (ph || 0), k = 0.84 + 0.2 * ((i * 5 + 2) % 3) / 2; ctx.lineTo(x + Math.cos(a) * r * k, y + Math.sin(a) * r * k); }
  ctx.closePath(); ctx.fill();
}
/* the shared eye: a faint halo, an amber iris, a dark slit and a tiny glint. x forward, dy = half the gap between the eyes */
function al9Eyes(ctx, x, y, dy, r){
  ctx.fillStyle = 'rgba(255,196,60,.24)'; ctx.beginPath(); ctx.arc(x, y - dy, r * 1.8, 0, TAU); ctx.moveTo(x + r * 1.8, y + dy); ctx.arc(x, y + dy, r * 1.8, 0, TAU); ctx.fill();
  ctx.fillStyle = AL9_EYE; ctx.beginPath(); ctx.arc(x, y - dy, r, 0, TAU); ctx.moveTo(x + r, y + dy); ctx.arc(x, y + dy, r, 0, TAU); ctx.fill();
  ctx.fillStyle = AL9_PUPIL; ctx.beginPath(); ctx.ellipse(x + r * 0.12, y - dy, r * 0.4, r * 0.82, 0, 0, TAU); ctx.moveTo(x + r * 0.52, y + dy); ctx.ellipse(x + r * 0.12, y + dy, r * 0.4, r * 0.82, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = '#FFFFFF'; ctx.beginPath(); ctx.arc(x + r * 0.38, y - dy - r * 0.38, r * 0.28, 0, TAU); ctx.moveTo(x + r * 0.66, y + dy - r * 0.38); ctx.arc(x + r * 0.38, y + dy - r * 0.38, r * 0.28, 0, TAU); ctx.fill();
}
/* a swaying spiked (kind 1) or flaming (kind 2) tail */
function al9Tail(ctx, P, s, bob, e, kind, len){
  if (!kind) return;
  const sw = Math.sin(((e && e.anim) || 0) * 1.2), x0 = -9 * s, x1 = x0 - len * s, y1 = bob + sw * 4 * s, cx = (x0 + x1) / 2, cy = bob - sw * 2.6 * s;
  lkCV(ctx, x0, bob, cx, cy, x1, y1, 4.6 * s, P.deep); lkCV(ctx, x0, bob, cx, cy, x1, y1, 2.6 * s, P.lo);
  if (kind === 2){ lkTRI(ctx, x1 + 2 * s, y1 - 2.8 * s, x1 - 10 * s, y1 + sw * 2 * s, x1 + 2 * s, y1 + 2.8 * s, P.pale); lkTRI(ctx, x1 + 1 * s, y1 - 1.3 * s, x1 - 6 * s, y1 + sw * 1.2 * s, x1 + 1 * s, y1 + 1.3 * s, P.hot); }
  else lkTRI(ctx, x1 + 1.5 * s, y1 - 2.4 * s, x1 - 8 * s, y1 + sw * 1.5 * s, x1 + 1.5 * s, y1 + 2.4 * s, AL9_BONE);
}
/* digitigrade rear legs that step with the creature's animation (both legs share one stroked path) */
function al9Legs(ctx, P, s, bob, e, sz){
  if (!sz) return;
  const ph = Math.sin(((e && e.anim) || 0) * 1.4);
  ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.strokeStyle = P.deep; ctx.lineWidth = 4 * s; ctx.beginPath();
  for (let i = 0; i < 2; i++){
    const sy = i ? 1 : -1, q = i ? ph : -ph;
    ctx.moveTo(-5 * s, bob + sy * 8.4 * s); ctx.lineTo((-10.5 + q * 1.6) * s, bob + sy * 12 * s * sz); ctx.lineTo((-5.6 + q * 3) * s, bob + sy * 14.4 * s * sz);
  }
  ctx.stroke(); ctx.strokeStyle = P.lo; ctx.lineWidth = 2.3 * s; ctx.stroke(); ctx.lineCap = 'butt'; ctx.lineJoin = 'miter';
  ctx.fillStyle = AL9_BONE; ctx.beginPath();
  for (let i = 0; i < 2; i++){
    const sy = i ? 1 : -1, q = i ? ph : -ph, kx = (-10.5 + q * 1.6) * s, ky = bob + sy * 12 * s * sz, fx = (-5.6 + q * 3) * s, fy = bob + sy * 14.4 * s * sz;
    ctx.moveTo(fx - 1 * s, fy - 1.4 * s); ctx.lineTo(fx + 5.6 * s, fy - 3 * s * sy); ctx.lineTo(fx + 1 * s, fy + 1.2 * s);
    ctx.moveTo(fx, fy - 1.6 * s); ctx.lineTo(fx + 6.4 * s, fy); ctx.lineTo(fx + 1.6 * s, fy + 1.6 * s);
    ctx.moveTo(fx - 1 * s, fy + 1 * s); ctx.lineTo(fx + 5 * s, fy + 3.2 * s * sy); ctx.lineTo(fx + 1 * s, fy + 2.4 * s);
    ctx.moveTo(kx - 1.4 * s, ky - sy * 1 * s); ctx.lineTo(kx - 4.6 * s, ky + sy * 2.4 * s); ctx.lineTo(kx + 0.8 * s, ky + sy * 1.2 * s);   /* the knee spur */
  }
  ctx.fill();
}
/* the carapace: layered plates, transverse bands, a row of glowing vertebrae and cracked ember seams */
function al9Torso(ctx, P, s, bob, f, kw, A, hot){
  const ry = 12.6 * s * kw, cx = -1 * s;
  lkOV(ctx, cx, bob, 11.2 * s, ry + 1.7 * s, P.deep);
  lkOV(ctx, cx, bob, 9.8 * s, ry, P.lo);
  lkOV(ctx, cx - 0.7 * s, bob - 1 * s, 8.8 * s, ry - 1.4 * s, P.b);
  ctx.globalAlpha = A * 0.55; lkOV(ctx, -3.2 * s, bob - 4.6 * s * kw, 5.4 * s, 3.2 * s * kw, P.hi, -0.3); ctx.globalAlpha = A;
  ctx.strokeStyle = P.lo; ctx.lineWidth = Math.max(1, 1.5 * s); ctx.beginPath();
  for (let i = 0; i < 3; i++){ const x = (-7.2 + i * 4) * s, u = (x / s + 1) / 10.2, h = ry * 0.9 * Math.sqrt(Math.max(0.05, 1 - u * u)); ctx.moveTo(x, bob - h); ctx.quadraticCurveTo(x + 3 * s, bob, x, bob + h); }
  ctx.stroke();
  ctx.fillStyle = P.deep; ctx.beginPath(); for (let i = 0; i < 4; i++){ const x = (-8 + i * 3.4) * s; ctx.moveTo(x + 1.6 * s, bob); ctx.arc(x, bob, 1.6 * s, 0, TAU); } ctx.fill();
  ctx.globalAlpha = A * (hot ? 1 : 0.6 + 0.3 * f); ctx.fillStyle = P.hot; ctx.beginPath(); for (let i = 0; i < 4; i++){ const x = (-8 + i * 3.4) * s; ctx.moveTo(x + 0.75 * s, bob); ctx.arc(x, bob, 0.75 * s, 0, TAU); } ctx.fill();
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.strokeStyle = P.pale; ctx.lineWidth = Math.max(1.2, 1.5 * s); ctx.globalAlpha = A * (hot ? 1 : 0.62 + 0.3 * f);
  ctx.beginPath(); ctx.moveTo(-7 * s, bob - 9.4 * s * kw); ctx.lineTo(-3.4 * s, bob - 5 * s); ctx.lineTo(-1 * s, bob - 1 * s); ctx.lineTo(-5.4 * s, bob + 3.6 * s); ctx.lineTo(-1.6 * s, bob + 8 * s); ctx.lineTo(-0.6 * s, bob + 11 * s * kw);
  ctx.moveTo(-1 * s, bob - 1 * s); ctx.lineTo(3 * s, bob - 4 * s); ctx.moveTo(-5.4 * s, bob + 3.6 * s); ctx.lineTo(-9 * s, bob + 6 * s); ctx.moveTo(-3.4 * s, bob - 5 * s); ctx.lineTo(-8.4 * s, bob - 4 * s);
  ctx.stroke();
  ctx.strokeStyle = P.hot; ctx.lineWidth = Math.max(0.6, 0.55 * s); ctx.globalAlpha = A * 0.85; ctx.stroke();
  ctx.globalAlpha = A; ctx.lineCap = 'butt'; ctx.lineJoin = 'miter';
}
/* spiked, banded pauldrons (each layer is one path covering both shoulders) */
function al9Shoulders(ctx, P, s, bob, kw, sp){
  const yy = 10.8 * s * kw;
  for (let pass = 0; pass < 3; pass++){
    ctx.fillStyle = pass === 0 ? P.deep : pass === 1 ? P.mid : P.hi; ctx.beginPath();
    const rx = pass === 0 ? 5.2 : pass === 1 ? 4.3 : 2.4, ry = pass === 0 ? 4.2 : pass === 1 ? 3.4 : 1.3, ox = pass === 2 ? -0.8 : 0;
    for (let i = 0; i < 2; i++){ const sy = i ? 1 : -1, y = bob + sy * yy - (pass === 2 ? sy * 1 * s : 0); ctx.moveTo((2 + ox) * s + rx * s, y); ctx.ellipse((2 + ox) * s, y, rx * s, ry * s, 0, 0, TAU); }
    ctx.fill();
  }
  ctx.fillStyle = P.deep; ctx.beginPath();
  for (let i = 0; i < 2; i++){ const sy = i ? 1 : -1; ctx.moveTo(4.6 * s, bob + sy * (yy - 0.6 * s)); ctx.lineTo(-1 * s, bob + sy * (yy + 1.6 * s)); ctx.lineTo((-5 * sp) * s, bob + sy * (yy + 5.6 * s * sp)); ctx.closePath(); }
  ctx.fill();
  ctx.fillStyle = P.hot; ctx.beginPath();
  for (let i = 0; i < 2; i++){ const sy = i ? 1 : -1, x = (-5 * sp) * s, y = bob + sy * (yy + 5.6 * s * sp); ctx.moveTo(x + 0.9 * s, y); ctx.arc(x, y, 0.9 * s, 0, TAU); }
  ctx.fill();
}
/* the head: horns, mane (bosses), cowl, brow, snout, mandibles, flame crest and the two eyes */
function al9Head(ctx, P, s, bob, f, o, A){
  const hn = (o && o.hn !== undefined) ? o.hn : 1, t = G.time, hx = 6.5 * s;
  if (o && o.mane){
    ctx.fillStyle = P.pale; ctx.beginPath();
    for (let i = 0; i < 7; i++){ const a = 2.0 + i * 0.38, R = (i & 1 ? 10.5 : 13) * s + Math.sin(t * 8 + i * 1.7) * 0.8 * s; ctx.moveTo(hx + Math.cos(a - 0.22) * 5.6 * s, bob + Math.sin(a - 0.22) * 5.6 * s); ctx.lineTo(hx + Math.cos(a) * R, bob + Math.sin(a) * R); ctx.lineTo(hx + Math.cos(a + 0.22) * 5.6 * s, bob + Math.sin(a + 0.22) * 5.6 * s); }
    ctx.fill();
    ctx.fillStyle = P.hot; ctx.beginPath();
    for (let i = 0; i < 7; i++){ const a = 2.0 + i * 0.38, R = (i & 1 ? 8.8 : 10.6) * s; ctx.moveTo(hx + Math.cos(a - 0.1) * 5.6 * s, bob + Math.sin(a - 0.1) * 5.6 * s); ctx.lineTo(hx + Math.cos(a) * R, bob + Math.sin(a) * R); ctx.lineTo(hx + Math.cos(a + 0.1) * 5.6 * s, bob + Math.sin(a + 0.1) * 5.6 * s); }
    ctx.fill();
  }
  if (o && o.hood){ lkOV(ctx, 3.4 * s, bob, 9.2 * s, 8.8 * s, P.deep); lkOV(ctx, 3.8 * s, bob, 8 * s, 7.6 * s, P.dk); }
  if (hn > 0){
    ctx.fillStyle = AL9_BONE; ctx.beginPath();
    for (let i = 0; i < 2; i++){ const sy = i ? 1 : -1; ctx.moveTo(3.6 * s, bob + sy * 3.2 * s); ctx.quadraticCurveTo(9 * s, bob + sy * 4 * s * hn, (8 + 5 * hn) * s, bob + sy * (5.6 + 3.4 * hn) * s); ctx.quadraticCurveTo(10 * s, bob + sy * 3.6 * s, 9 * s, bob + sy * 5.6 * s); ctx.closePath(); }
    ctx.fill();
  }
  lkOV(ctx, hx + 0.3 * s, bob, 7.2 * s, 6.5 * s, P.deep); lkOV(ctx, hx, bob, 6.3 * s, 5.6 * s, P.b);
  ctx.globalAlpha = A * 0.6; lkOV(ctx, 5.2 * s, bob - 2.2 * s, 3.4 * s, 1.5 * s, P.hi, -0.15); ctx.globalAlpha = A;
  lkOV(ctx, 11 * s, bob, 3.4 * s, 2.8 * s, P.lo);
  ctx.fillStyle = P.deep; ctx.beginPath();
  for (let i = 0; i < 2; i++){ const sy = i ? 1 : -1; ctx.moveTo(7.2 * s, bob + sy * 1.6 * s); ctx.lineTo(12 * s, bob + sy * 5.2 * s); ctx.lineTo(8.4 * s, bob + sy * 5.6 * s); ctx.closePath(); ctx.moveTo(12.6 * s + 0.6 * s, bob + sy * 1.1 * s); ctx.arc(12.6 * s, bob + sy * 1.1 * s, 0.6 * s, 0, TAU); }
  ctx.fill();
  ctx.fillStyle = AL9_BONE; ctx.beginPath();
  for (let i = 0; i < 2; i++){ const sy = i ? 1 : -1; ctx.moveTo(13.2 * s, bob + sy * 1.4 * s); ctx.lineTo(17 * s, bob + sy * 3.6 * s); ctx.lineTo(13.6 * s, bob + sy * 3 * s); ctx.closePath(); }
  ctx.fill();
  const fl = Math.sin(t * 11) * 0.9 * s;
  ctx.fillStyle = P.pale; ctx.beginPath();
  for (let k = -1; k <= 1; k++){ const tip = (-6 - (k ? 0 : 3)) * s + (k ? fl * k : -fl); ctx.moveTo(4.4 * s, bob + k * 2.4 * s - 1.2 * s); ctx.lineTo(tip, bob + k * 4.2 * s); ctx.lineTo(4.4 * s, bob + k * 2.4 * s + 1.2 * s); ctx.closePath(); }
  ctx.fill();
  ctx.fillStyle = P.hot; ctx.beginPath();
  for (let k = -1; k <= 1; k++){ const tip = (-1.6 - (k ? 0 : 2)) * s; ctx.moveTo(4.2 * s, bob + k * 2.4 * s - 0.5 * s); ctx.lineTo(tip, bob + k * 3.4 * s); ctx.lineTo(4.2 * s, bob + k * 2.4 * s + 0.5 * s); ctx.closePath(); }
  ctx.fill();
  al9Eyes(ctx, 9.4 * s, bob, 3 * s, Math.max(1.1, 1.65 * s));
}
/* the shared alien build. o (optional): tail 0/1/2, tl tail length, leg size (0 = none), kw torso width, sp spike size, hn horn size, mane, hood */
function aBody(ctx, b, dk, pale, s, bob, e, o){
  const P = al9Pal(b, dk, pale), A = ctx.globalAlpha, f = 0.7 + 0.3 * Math.sin(((e && e.anim) || 0) * 0.9), kw = (o && o.kw) || 1, hot = !!(e && e.state === 'wind');
  al9Blob(ctx, -2 * s, bob, 19 * s, pale, 0.07 + 0.04 * f, A); al9Blob(ctx, -2 * s, bob, 14.5 * s, pale, 0.09 + 0.05 * f, A);
  al9Tail(ctx, P, s, bob, e, o && o.tail !== undefined ? o.tail : 1, (o && o.tl) || 12);
  al9Legs(ctx, P, s, bob, e, o && o.leg !== undefined ? o.leg : 1);
  al9Torso(ctx, P, s, bob, f, kw, A, hot);
  al9Shoulders(ctx, P, s, bob, kw, (o && o.sp) || 1);
  al9Head(ctx, P, s, bob, f, o, A);
}
/* jointed arms ending in three-clawed hands */
function aClaws(ctx, s, bob, len, col){
  const lt = al9Lt(col), ex = 5.6 * s + len * 0.35, hx = 9 * s + len;
  ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.strokeStyle = col; ctx.lineWidth = 4.2 * s; ctx.beginPath();
  for (let i = 0; i < 2; i++){ const sy = i ? 1 : -1; ctx.moveTo(1 * s, bob + sy * 11 * s); ctx.lineTo(ex, bob + sy * 13 * s); ctx.lineTo(hx, bob + sy * 5.2 * s); }
  ctx.stroke();
  ctx.strokeStyle = lt; ctx.lineWidth = 1.2 * s; ctx.beginPath();
  for (let i = 0; i < 2; i++){ const sy = i ? 1 : -1; ctx.moveTo(ex, bob + sy * 13 * s - sy * 0.8 * s); ctx.lineTo(hx, bob + sy * 5.2 * s - sy * 0.8 * s); }
  ctx.stroke(); ctx.lineCap = 'butt'; ctx.lineJoin = 'miter';
  ctx.fillStyle = col; ctx.beginPath();
  for (let i = 0; i < 2; i++){ const sy = i ? 1 : -1, ey = bob + sy * 13 * s;
    ctx.moveTo(hx + 2.5 * s, bob + sy * 5.2 * s); ctx.arc(hx, bob + sy * 5.2 * s, 2.5 * s, 0, TAU);
    ctx.moveTo(ex - 1.8 * s, ey + sy * 1 * s); ctx.lineTo(ex - 4.4 * s, ey + sy * 3.4 * s); ctx.lineTo(ex + 1.2 * s, ey + sy * 2 * s); ctx.closePath(); }       /* hands and elbow spikes */
  ctx.fill();
  ctx.fillStyle = AL9_BONE; ctx.beginPath();
  for (let i = 0; i < 2; i++){ const sy = i ? 1 : -1, hy = bob + sy * 5.2 * s;
    for (let k = -1; k <= 1; k++){ ctx.moveTo(hx, hy + k * 1.5 * s - 1 * s); ctx.lineTo(hx + 6 * s - (k ? 0 : -1 * s), hy + k * 3 * s); ctx.lineTo(hx, hy + k * 1.5 * s + 1 * s); ctx.closePath(); } }
  ctx.fill();
}
/* Venus alien weapons, built up from parts instead of single lines: forged haft and collar, molten edges, glowing seams. */
function aSpear(ctx, s, y, x0, x1, pale){
  const A0 = ctx.globalAlpha, hx = x1 - 14 * s, fl = Math.sin(G.time * 8);
  lkLN(ctx, [x0, y, hx, y], 3.2 * s, '#2A1410');                                                       /* the haft */
  lkLN(ctx, [x0, y - 0.6 * s, hx, y - 0.6 * s], 1.1 * s, '#7A4A22');
  ctx.fillStyle = '#5A3014'; ctx.beginPath(); for (let k = 0; k < 4; k++) ctx.rect(x0 + (hx - x0) * (0.12 + k * 0.26), y - 2.4 * s, 1.5 * s, 4.8 * s); ctx.fill();   /* banded grip */
  ctx.fillStyle = pale; ctx.globalAlpha = A0 * 0.7; ctx.beginPath(); for (let k = 0; k < 4; k++) ctx.rect(x0 + (hx - x0) * (0.12 + k * 0.26) + 0.4 * s, y - 1.4 * s, 0.7 * s, 2.8 * s); ctx.fill(); ctx.globalAlpha = A0;
  lkTRI(ctx, x0 - 5 * s, y, x0 + 1 * s, y - 2.2 * s, x0 + 1 * s, y + 2.2 * s, '#3A2418'); fillCircle(ctx, x0 + 1 * s, y, 1.8 * s, pale);   /* the butt cap */
  lkCV(ctx, hx - 1 * s, y + 3 * s, hx - 6 * s, y + (6.4 + fl * 1.4) * s, hx - 11 * s, y + (3.4 + fl * 1.8) * s, 1.5 * s, pale);                                              /* a fluttering ember pennant */
  ctx.fillStyle = '#4A2A14'; ctx.fillRect(hx - 1 * s, y - 3.8 * s, 4.4 * s, 7.6 * s);                  /* the forged collar */
  ctx.fillStyle = pale; ctx.globalAlpha = A0 * 0.85; ctx.fillRect(hx + 0.6 * s, y - 3.1 * s, 1.2 * s, 6.2 * s); ctx.globalAlpha = A0;
  ctx.fillStyle = '#C8A878'; ctx.beginPath(); ctx.moveTo(hx + 2 * s, y - 2 * s); ctx.lineTo(hx - 1 * s, y - 6.8 * s); ctx.lineTo(hx + 6 * s, y - 2.6 * s); ctx.closePath(); ctx.moveTo(hx + 2 * s, y + 2 * s); ctx.lineTo(hx - 1 * s, y + 6.8 * s); ctx.lineTo(hx + 6 * s, y + 2.6 * s); ctx.closePath(); ctx.fill();   /* the barbs */
  lkTRI(ctx, hx + 3 * s, y - 3.6 * s, x1 + 8 * s, y, hx + 3 * s, y + 3.6 * s, '#3A2418');              /* the head: dark edge, molten body, white core */
  lkTRI(ctx, hx + 4 * s, y - 2.6 * s, x1 + 6 * s, y, hx + 4 * s, y + 2.6 * s, '#FFB050');
  lkTRI(ctx, hx + 5 * s, y - 1.2 * s, x1 + 3 * s, y, hx + 5 * s, y + 1.2 * s, '#FFFFFF');
}
function aMagmaBlade(ctx, s, wind, pale){
  const A0 = ctx.globalAlpha;
  ctx.fillStyle = '#3A2418'; ctx.fillRect(-7 * s, -1.8 * s, 9 * s, 3.6 * s);                           /* the hilt */
  ctx.strokeStyle = '#7A4A18'; ctx.lineWidth = Math.max(1, s * 0.8); ctx.beginPath(); for (let k = 0; k < 4; k++){ ctx.moveTo((-6 + k * 2) * s, -1.8 * s); ctx.lineTo((-5 + k * 2) * s, 1.8 * s); } ctx.stroke();
  fillCircle(ctx, -8.4 * s, 0, 2.6 * s, '#3A2418'); fillCircle(ctx, -8.4 * s, 0, 1.7 * s, '#6A3A14'); fillCircle(ctx, -8.4 * s, 0, 0.9 * s, pale);          /* the glowing pommel */
  ctx.fillStyle = '#6A3A14'; ctx.beginPath(); ctx.moveTo(2 * s, -1.6 * s); ctx.lineTo(6 * s, -8.6 * s); ctx.lineTo(6.8 * s, -1.6 * s); ctx.closePath(); ctx.moveTo(2 * s, 1.6 * s); ctx.lineTo(6 * s, 8.6 * s); ctx.lineTo(6.8 * s, 1.6 * s); ctx.closePath(); ctx.fill();   /* the swept guard */
  ctx.fillStyle = '#9A5A22'; ctx.beginPath(); ctx.moveTo(3 * s, -1.6 * s); ctx.lineTo(5.6 * s, -6.6 * s); ctx.lineTo(6 * s, -1.6 * s); ctx.closePath(); ctx.moveTo(3 * s, 1.6 * s); ctx.lineTo(5.6 * s, 6.6 * s); ctx.lineTo(6 * s, 1.6 * s); ctx.closePath(); ctx.fill();
  fillCircle(ctx, 4.4 * s, 0, 1.5 * s, pale);                                                           /* a gem in the guard */
  ctx.fillStyle = '#3A2418'; ctx.beginPath(); ctx.moveTo(5 * s, -3.1 * s); ctx.lineTo(31 * s, -2.7 * s); ctx.lineTo(42 * s, 0); ctx.lineTo(31 * s, 2.7 * s); ctx.lineTo(5 * s, 3.1 * s); ctx.closePath(); ctx.fill();   /* a dark edge keeps the blade readable on bright ground */
  ctx.fillStyle = '#FFD890'; ctx.beginPath(); ctx.moveTo(5 * s, -2.6 * s); ctx.lineTo(31 * s, -2.2 * s); ctx.lineTo(41 * s, 0); ctx.lineTo(31 * s, 2.2 * s); ctx.lineTo(5 * s, 2.6 * s); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#FFD890'; ctx.beginPath(); for (let k = 0; k < 5; k++){ const bx = (9 + k * 5) * s; ctx.moveTo(bx, -2.5 * s); ctx.lineTo(bx + 2.4 * s, -4.2 * s); ctx.lineTo(bx + 3.6 * s, -2.4 * s); ctx.moveTo(bx, 2.5 * s); ctx.lineTo(bx + 2.4 * s, 4.2 * s); ctx.lineTo(bx + 3.6 * s, 2.4 * s); } ctx.fill();   /* the saw-edge */
  lkLN(ctx, [8 * s, 0, 36 * s, 0], 1.5 * s, '#FF8A1E'); lkLN(ctx, [12 * s, 0, 34 * s, 0], 0.6 * s, '#FFFFFF');                          /* the molten fuller */
  ctx.globalAlpha = A0 * 0.7; lkLN(ctx, [8 * s, -1.9 * s, 34 * s, -1.6 * s], 0.5 * s, '#FFFFFF'); ctx.globalAlpha = A0;
}
function aSpitLauncher(ctx, s, bob, pale, active){
  const A0 = ctx.globalAlpha;
  fillCircle(ctx, 10 * s, bob + 7.4 * s, 4.4 * s, '#3A1208'); fillCircle(ctx, 10 * s, bob + 7.4 * s, 3.4 * s, '#7A2A10');                 /* the bladder behind the sac */
  ctx.strokeStyle = pale; ctx.lineWidth = Math.max(1, s * 0.7); ctx.globalAlpha = A0 * 0.7; ctx.beginPath(); ctx.moveTo(8 * s, bob + 6 * s); ctx.lineTo(10 * s, bob + 8 * s); ctx.lineTo(12.4 * s, bob + 7 * s); ctx.moveTo(10 * s, bob + 8 * s); ctx.lineTo(9 * s, bob + 10 * s); ctx.stroke(); ctx.globalAlpha = A0;
  lkLN(ctx, [10 * s, bob + 5 * s, 20 * s, bob + 5 * s], 4 * s, '#2A1410');                          /* the ridged proboscis */
  ctx.fillStyle = '#7A4A18'; ctx.beginPath(); for (let k = 0; k < 3; k++) ctx.rect((12 + k * 2.8) * s, bob + 2.6 * s, 1.2 * s, 4.8 * s); ctx.fill();
  lkTRI(ctx, 19 * s, bob + 2.2 * s, 23.4 * s, bob + 5 * s, 19 * s, bob + 7.8 * s, '#2A1410');             /* the flared nozzle */
  fillCircle(ctx, 22 * s, bob + 5 * s, 1.3 * s, active ? '#FFF0A0' : pale);
}
function aWarHammer(ctx, s, bob, pale, wind){
  const A0 = ctx.globalAlpha;
  lkLN(ctx, [3 * s, bob + 10 * s, 19 * s, bob + 6 * s], 3.4 * s, '#2A1C10');                              /* the haft */
  lkLN(ctx, [3 * s, bob + 9.2 * s, 19 * s, bob + 5.2 * s], 1.1 * s, '#7A5A34');
  ctx.strokeStyle = '#8A6A3A'; ctx.lineWidth = Math.max(1, s * 0.8); ctx.beginPath(); for (let k = 0; k < 4; k++){ const u = 0.1 + k * 0.17; ctx.moveTo((3 + 16 * u) * s, bob + (10 - 4 * u) * s - 1.8 * s); ctx.lineTo((3 + 16 * u) * s + 1 * s, bob + (10 - 4 * u) * s + 1.8 * s); } ctx.stroke();
  fillCircle(ctx, 3 * s, bob + 10 * s, 2 * s, '#4A3A2A');
  ctx.save(); ctx.translate(21 * s, bob + 5.4 * s); ctx.rotate(-0.2);
  csGlow(ctx, 0, 0, 9 * s, pale, wind ? 0.6 : 0.3);
  ctx.fillStyle = '#2E2E36'; ctx.fillRect(-6.8 * s, -7.8 * s, 2.6 * s, 15.6 * s);                      /* flanges */
  ctx.fillStyle = '#4A4A54'; ctx.fillRect(-4.6 * s, -6.4 * s, 10.4 * s, 12.8 * s);                       /* the head */
  ctx.fillStyle = '#6A6A76'; ctx.fillRect(-4.6 * s, -6.4 * s, 10.4 * s, 2.2 * s);                        /* a lit top edge */
  ctx.strokeStyle = '#1A1A20'; ctx.lineWidth = Math.max(1, s); ctx.strokeRect(-4.6 * s, -6.4 * s, 10.4 * s, 12.8 * s);
  ctx.fillStyle = pale; ctx.globalAlpha = A0 * 0.9; ctx.fillRect(-3 * s, -3.4 * s, 7.4 * s, 1.3 * s); ctx.fillRect(-3 * s, 2.2 * s, 7.4 * s, 1.3 * s); ctx.globalAlpha = A0;   /* glowing rune bands */
  ctx.fillStyle = '#8A8A96'; ctx.beginPath(); for (let k = 0; k < 4; k++){ ctx.moveTo((-3.6 + (k & 1) * 8) * s + 0.6 * s, (k < 2 ? -5.2 : 5.2) * s); ctx.arc((-3.6 + (k & 1) * 8) * s, (k < 2 ? -5.2 : 5.2) * s, 0.6 * s, 0, TAU); } ctx.fill();   /* rivets */
  for (let k = -1; k <= 1; k++) lkTRI(ctx, 5.4 * s, k * 4.2 * s - 1.5 * s, 10.2 * s, k * 4.2 * s, 5.4 * s, k * 4.2 * s + 1.5 * s, '#A8A8B4');         /* striking spikes */
  lkTRI(ctx, -2 * s, -6.4 * s, 0.6 * s, -10.6 * s, 2.6 * s, -6.4 * s, '#A8A8B4'); lkTRI(ctx, -2 * s, 6.4 * s, 0.6 * s, 10.6 * s, 2.6 * s, 6.4 * s, '#A8A8B4');
  ctx.restore();
}
function aFlameStaff(ctx, s, bob, pale, dy){
  const y = bob + (dy === undefined ? 3 : dy) * s, t = G.time;
  lkLN(ctx, [3 * s, y, 23 * s, y], 2.6 * s, '#3A1E0A');                                                 /* the staff */
  lkLN(ctx, [3 * s, y - 0.7 * s, 23 * s, y - 0.7 * s], 1 * s, '#9A6A34');
  ctx.strokeStyle = '#1E0E08'; ctx.lineWidth = Math.max(1, s * 0.9); ctx.beginPath(); for (let k = 0; k < 6; k++){ ctx.moveTo((5 + k * 3) * s, y - 1.6 * s); ctx.lineTo((7 + k * 3) * s, y + 1.6 * s); } ctx.stroke();   /* its twisted binding */
  fillCircle(ctx, 3 * s, y, 1.7 * s, '#5A3014');
  lkTRI(ctx, 21 * s, y - 1 * s, 29 * s, y - 6 * s, 25 * s, y - 0.6 * s, '#3A1E0A'); lkTRI(ctx, 21 * s, y + 1 * s, 29 * s, y + 6 * s, 25 * s, y + 0.6 * s, '#3A1E0A');   /* the cradle prongs */
  lkTRI(ctx, 22 * s, y - 1 * s, 28 * s, y - 5 * s, 24.6 * s, y - 0.8 * s, '#8A5A28'); lkTRI(ctx, 22 * s, y + 1 * s, 28 * s, y + 5 * s, 24.6 * s, y + 0.8 * s, '#8A5A28');
  csGlow(ctx, 25.4 * s, y, 8 * s, pale, 0.55); fillCircle(ctx, 25.4 * s, y, 3.8 * s, pale); fillCircle(ctx, 25.4 * s, y, 2.2 * s, '#FFFFFF');
  const fl = Math.sin(t * 12) * 1 * s;
  lkTRI(ctx, 23.8 * s, y - 1.4 * s, 25.4 * s + fl, y - 8 * s, 27 * s, y - 1.4 * s, pale);                                                /* a licking flame */
  for (let k = 0; k < 3; k++){ const a = t * 3 + k * TAU / 3; fillCircle(ctx, 25.4 * s + Math.cos(a) * 6.4 * s, y + Math.sin(a) * 6.4 * s, 0.9 * s, '#FFE8A0'); }
}
function aMagmaCannon(ctx, s, bob, len, pale, small){
  const y = bob + 3 * s, k = small ? 0.6 : 1, A0 = ctx.globalAlpha;
  ctx.fillStyle = '#1E0E08'; ctx.fillRect(3 * s, y - 4.2 * s * k, 9 * s * k + 2.6 * s, 8.4 * s * k);        /* the housing */
  ctx.fillStyle = '#3A2418'; ctx.fillRect(3.6 * s, y - 3.4 * s * k, 8 * s * k + 1.8 * s, 2.2 * s * k);
  ctx.strokeStyle = '#0E0604'; ctx.lineWidth = Math.max(1, s * 0.8); ctx.strokeRect(3 * s, y - 4.2 * s * k, 9 * s * k + 2.6 * s, 8.4 * s * k);
  ctx.fillStyle = pale; ctx.globalAlpha = A0 * 0.8; ctx.fillRect(4.4 * s, y + 1.8 * s * k, 7 * s * k, 0.9 * s); ctx.fillRect(4.4 * s, y + 3 * s * k, 5 * s * k, 0.7 * s); ctx.globalAlpha = A0;   /* heat vents */
  fillCircle(ctx, 8 * s, y - 5.4 * s * k, 3.4 * s * k, '#3A1208'); fillCircle(ctx, 8 * s, y - 5.4 * s * k, 2.2 * s * k, '#FF7A1E'); fillCircle(ctx, 7.4 * s, y - 6 * s * k, 0.8 * s * k, '#FFE0A0'); csGlow(ctx, 8 * s, y - 5.4 * s * k, 6.4 * s * k, pale, 0.5);   /* the slag tank */
  lkLN(ctx, [12 * s * k + 2 * s, y, len, y], 3.8 * s * k, '#2A1410');                                      /* the barrel */
  lkLN(ctx, [12 * s * k + 2 * s, y - 1.2 * s * k, len, y - 1.2 * s * k], 1 * s * k, '#7A4A22');
  for (let i = 0; i < 3; i++){ const bx = 12 * s * k + 2 * s + (len - 12 * s * k - 2 * s) * (0.25 + i * 0.25); ctx.fillStyle = '#7A4A18'; ctx.fillRect(bx, y - 3 * s * k, 1.5 * s, 6 * s * k); }   /* its cooling rings */
  lkLN(ctx, [12 * s * k + 2 * s, y + 2.9 * s * k, len - 5 * s, y + 2.9 * s * k], 1.3 * s * k, pale);       /* a glowing coolant line */
  lkTRI(ctx, len - 3 * s, y - 3.6 * s * k, len + 3 * s, y, len - 3 * s, y + 3.6 * s * k, '#1E0E08');       /* the flared muzzle */
  lkTRI(ctx, len - 2 * s, y - 2.4 * s * k, len + 1.4 * s, y, len - 2 * s, y + 2.4 * s * k, '#4A2A14');
  ctx.strokeStyle = pale; ctx.lineWidth = Math.max(1, s * 0.9); ctx.globalAlpha = A0 * 0.8; ctx.beginPath(); ctx.arc(len + 1 * s, y, 2.8 * s * k, -1.2, 1.2); ctx.stroke(); ctx.globalAlpha = A0;
}
/* presets for aBody */
const AL9_SPIT = { tail: 1, tl: 11, kw: 0.96 }, AL9_LEAP = { tail: 2, tl: 15, leg: 1.18, kw: 0.88, hn: 0.8 }, AL9_BRUTE = { tail: 1, tl: 10, leg: 1.2, kw: 1.12, sp: 1.55, hn: 0 },
  AL9_BLADE = { tail: 1, tl: 14, kw: 0.94 }, AL9_FIEND = { tail: 1, tl: 15, kw: 0.9, hn: 0 }, AL9_BRAWL = { tail: 1, tl: 9, leg: 1.2, kw: 1.14, sp: 1.35, hn: 0.7 },
  AL9_FORGE = { tail: 1, tl: 8, leg: 1.1, kw: 1.08, sp: 1.2, hn: 0 }, AL9_PRIEST = { tail: 0, leg: 0, kw: 1, sp: 0.8, hn: 0, hood: 1 }, AL9_CRUSH = { tail: 1, tl: 10, leg: 1.3, kw: 1.18, sp: 1.5, hn: 0.5 },
  AL9_WRAITH = { tail: 0, leg: 0, kw: 0.86, sp: 1.35, hn: 0.6, hood: 1 }, AL9_WARLORD = { tail: 2, tl: 17, leg: 1.2, kw: 1.0, sp: 1.55, hn: 1.5, mane: 1 };
const ALIEN_DRAW = {  cinderspitter(ctx, e, b, dk, bob, wind, d){
    const s = e.r / 14, P = al9Pal(b, dk, d.pale), pu = 0.5 + 0.5 * Math.sin((e.anim || 0) * 1.3);
    aBody(ctx, b, dk, d.pale, s, bob, e, AL9_SPIT);
    fillCircle(ctx, -6.4 * s, bob, 3 * s, P.deep); al9Blob(ctx, -6.4 * s, bob, 2 * s, d.pale, 0.3 + 0.5 * pu, 1);   /* the swollen ember bladder on its back */
    aClaws(ctx, s, bob, 4 * s, dk);
    aSpitLauncher(ctx, s, bob, d.pale, e.state === 'burst');
    al9Blob(ctx, 13 * s, bob + 5 * s, 6.4 * s, d.pale, 0.24, 1); fillCircle(ctx, 13 * s, bob + 5 * s, 3.4 * s, P.deep); fillCircle(ctx, 13 * s, bob + 5 * s, 2.5 * s, d.pale);   /* the spit sac */
    if (wind) csGlow(ctx, 17 * s, bob + 5 * s, 10 * s, '#FFF0A0', 0.9);
    if (e.state === 'burst') csGlow(ctx, 20 * s, bob + 5 * s, 15, '#FFB030', 0.95);
  },
  flareleaper(ctx, e, b, dk, bob, wind, d){
    const s = e.r / 14, z = e.z || 0, up = e.state === 'air' || wind, P = al9Pal(b, dk, d.pale), fl = Math.sin(G.time * 16);
    ctx.translate(0, -z);
    if (up) for (let i = 0; i < 2; i++){ const sy = i ? 5 : -5; csGlow(ctx, -14 * s, bob + sy * s, 18 + z * 0.12, '#FF8A1E', 0.8); lkTRI(ctx, -9 * s, bob + (sy - 2.6) * s, -28 * s - z * 0.14, bob + sy * s, -9 * s, bob + (sy + 2.6) * s, '#FFE070'); }
    for (let pass = 0; pass < 3; pass++){                                                                                /* flame fins */
      ctx.fillStyle = pass === 0 ? P.deep : pass === 1 ? d.pale : P.hot; ctx.beginPath();
      for (let i = 0; i < 2; i++){ const sy = i ? 1 : -1, w = fl * 0.6 * s;
        if (pass === 0){ ctx.moveTo(-6 * s, bob + sy * 6 * s); ctx.lineTo(-17 * s + w, bob + sy * 17 * s); ctx.lineTo(-2 * s, bob + sy * 12 * s); ctx.closePath(); ctx.moveTo(-8 * s, bob + sy * 4 * s); ctx.lineTo(-21 * s, bob + sy * 8 * s); ctx.lineTo(-3 * s, bob + sy * 7.6 * s); ctx.closePath(); }
        else if (pass === 1){ ctx.moveTo(-5.4 * s, bob + sy * 6.4 * s); ctx.lineTo(-15.4 * s + w, bob + sy * 15.6 * s); ctx.lineTo(-2.4 * s, bob + sy * 11.6 * s); ctx.closePath(); ctx.moveTo(-7.6 * s, bob + sy * 4.4 * s); ctx.lineTo(-18.6 * s, bob + sy * 7.6 * s); ctx.lineTo(-3.4 * s, bob + sy * 7 * s); ctx.closePath(); }
        else { ctx.moveTo(-4.4 * s, bob + sy * 7 * s); ctx.lineTo(-11 * s, bob + sy * 13.4 * s); ctx.lineTo(-2.8 * s, bob + sy * 10.6 * s); ctx.closePath(); } }
      ctx.fill();
    }    aBody(ctx, b, dk, d.pale, s, bob, e, AL9_LEAP); aClaws(ctx, s, bob, 2 * s, dk);
    ctx.fillStyle = P.pale; ctx.beginPath(); for (let i = 0; i < 2; i++){ const sy = i ? 1 : -1; for (let k = 0; k < 3; k++){ const px = (-9 + k * 3.2) * s, py = bob + sy * (11.4 + k * 0.8) * s; ctx.moveTo(px + 0.7 * s, py); ctx.arc(px, py, 0.7 * s, 0, TAU); } } ctx.fill();   /* ember studs on the haunches */
  },
  obsidianbrute(ctx, e, b, dk, bob, wind, d){
    const s = e.r / 13, P = al9Pal(b, dk, d.pale), hot = wind;
    aBody(ctx, b, dk, d.pale, s, bob, e, AL9_BRUTE);
    ctx.fillStyle = '#14101A'; ctx.beginPath(); ctx.moveTo(9 * s, bob - 15 * s); ctx.lineTo(19 * s, bob - 8 * s); ctx.lineTo(19 * s, bob + 8 * s); ctx.lineTo(9 * s, bob + 15 * s); ctx.lineTo(13 * s, bob); ctx.closePath(); ctx.fill();   /* the obsidian shell */
    ctx.fillStyle = '#3A2E4A'; ctx.beginPath(); ctx.moveTo(10.6 * s, bob - 13.6 * s); ctx.lineTo(17.6 * s, bob - 8 * s); ctx.lineTo(14.2 * s, bob - 3 * s); ctx.closePath();
    ctx.moveTo(10.6 * s, bob + 13.6 * s); ctx.lineTo(17.6 * s, bob + 8 * s); ctx.lineTo(14.2 * s, bob + 3 * s); ctx.closePath(); ctx.fill();                                                         /* lit facets */
    ctx.fillStyle = 'rgba(255,140,60,.62)'; ctx.beginPath(); ctx.moveTo(12 * s, bob - 11 * s); ctx.lineTo(17 * s, bob - 5 * s); ctx.lineTo(14 * s, bob); ctx.lineTo(17 * s, bob + 5 * s); ctx.lineTo(12 * s, bob + 11 * s); ctx.lineTo(13.4 * s, bob); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#A894C8'; ctx.lineWidth = Math.max(1, s * 0.7); ctx.beginPath(); ctx.moveTo(10.4 * s, bob - 14 * s); ctx.lineTo(18.4 * s, bob - 8.2 * s); ctx.moveTo(10.4 * s, bob + 14 * s); ctx.lineTo(18.4 * s, bob + 8.2 * s); ctx.stroke();   /* glints */
    lkTRI(ctx, 14 * s, bob - 3.4 * s, 26 * s, bob, 14 * s, bob + 3.4 * s, '#14101A'); lkTRI(ctx, 14.6 * s, bob - 2.6 * s, 24 * s, bob - 0.4 * s, 14.6 * s, bob, '#4A3A60');   /* the main horn */
    for (let i = 0; i < 2; i++){ const sy = i ? 1 : -1; lkTRI(ctx, -2 * s, bob + sy * 8.6 * s, -9 * s, bob + sy * 10.4 * s, -4 * s, bob + sy * 4.6 * s, '#14101A'); lkTRI(ctx, -2.6 * s, bob + sy * 8 * s, -7.4 * s, bob + sy * 9.4 * s, -4 * s, bob + sy * 5.6 * s, '#3A2E4A'); }   /* back shards */
    al9Eyes(ctx, 9.4 * s, bob, 3 * s, Math.max(1.1, 1.7 * s));
    if (wind) csGlow(ctx, 18 * s, bob, 24 * s, '#FFFFFF', 0.6);
  },
  magmaegg(ctx, e, b, dk, bob, wind, d){
    if (e.state === 'fall') return;                                        /* still falling as a meteor: the marker draws it */
    const r = e.r, f = e.stateT < 1.0 ? Math.sin(e.anim * 9) > 0 : Math.sin(e.anim * 3) > 0.3, P = al9Pal(b, dk, d.pale), crk = f ? '#FFF0A0' : d.pale;
    csGlow(ctx, 0, 0, r + 14, '#FF7A1E', 0.3 + (f ? 0.2 : 0));
    ctx.fillStyle = P.deep; ctx.beginPath();
    for (let k = 0; k < 10; k++){ const a = k / 10 * TAU + 0.15, c = Math.cos(a), sn = Math.sin(a), rx = r + 1, ry = r * 1.15 + 1; ctx.moveTo(c * rx - sn * 3.2, sn * ry + c * 3.2); ctx.lineTo(c * (rx + 5.6), sn * (ry + 5.6)); ctx.lineTo(c * rx + sn * 3.2, sn * ry - c * 3.2); ctx.closePath(); }
    ctx.fill();                                                           /* a crown of shell spikes at the rim */
    lkOV(ctx, 0, 0, r + 2, r * 1.15 + 2, dk); lkOV(ctx, 0, 0, r - 1, r * 1.1, P.lo); lkOV(ctx, -1, -1.4, r - 3, r * 1.04 - 1, b);
    ctx.globalAlpha = 0.5; lkOV(ctx, -r * 0.3, -r * 0.6, r * 0.34, r * 0.18, P.hi, -0.5); ctx.globalAlpha = 1;
    ctx.strokeStyle = P.lo; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(-r * 0.86, -r * 0.4); ctx.quadraticCurveTo(0, -r * 0.7, r * 0.86, -r * 0.4); ctx.moveTo(-r * 0.9, r * 0.35); ctx.quadraticCurveTo(0, r * 0.66, r * 0.9, r * 0.35); ctx.stroke();   /* plate bands */
    ctx.fillStyle = P.deep; ctx.beginPath(); for (let k = 0; k < 6; k++){ const a = k * 1.05 + 0.5, x = Math.cos(a) * r * 0.62, y = Math.sin(a) * r * 0.74; ctx.moveTo(x + 1.3, y); ctx.arc(x, y, 1.3, 0, TAU); } ctx.fill();   /* pits */
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.strokeStyle = 'rgba(255,170,60,.35)'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(-r * 0.6, -r * 0.5); ctx.lineTo(-r * 0.1, -r * 0.1); ctx.lineTo(-r * 0.5, r * 0.3); ctx.moveTo(-r * 0.1, -r * 0.1); ctx.lineTo(r * 0.5, -r * 0.2); ctx.lineTo(r * 0.2, r * 0.6); ctx.stroke();
    ctx.strokeStyle = crk; ctx.lineWidth = 2.2; ctx.stroke();
    ctx.strokeStyle = P.hot; ctx.lineWidth = 0.9; ctx.beginPath(); ctx.moveTo(-r * 0.1, -r * 0.1); ctx.lineTo(r * 0.5, -r * 0.2); ctx.moveTo(-r * 0.1, -r * 0.1); ctx.lineTo(-r * 0.5, r * 0.3); ctx.stroke();
    ctx.strokeStyle = crk; ctx.lineWidth = 1.3; ctx.beginPath(); ctx.moveTo(r * 0.5, -r * 0.2); ctx.lineTo(r * 0.72, -r * 0.5); ctx.moveTo(r * 0.2, r * 0.6); ctx.lineTo(r * 0.5, r * 0.78); ctx.moveTo(-r * 0.6, -r * 0.5); ctx.lineTo(-r * 0.74, -r * 0.8); ctx.stroke();
    ctx.lineCap = 'butt'; ctx.lineJoin = 'miter';
  },
  firewisp(ctx, e, b, dk, bob, wind, d){
    const t = G.time, f = Math.sin(t * 30 + e.x) * 1.5, w = Math.sin(t * 9 + e.x * 0.05);
    csGlow(ctx, 0, bob, 18, '#FF8A1E', 0.7);
    lkCV(ctx, -3, bob, -12, bob + w * 4, -24 - f, bob - w * 3, 3, 'rgba(255,170,50,.55)');             /* long trailing wisps */
    lkCV(ctx, -3, bob + 2, -10, bob - w * 3, -19 - f, bob + w * 4 + 3, 2, 'rgba(255,210,90,.6)');
    for (let k = -1; k <= 1; k++) lkTRI(ctx, -2, bob + k * 3, -16 - f - (k ? 0 : 5), bob + k * 6, -2, bob + k * 3 + 3, '#FFB030');
    for (let k = -1; k <= 1; k++) lkTRI(ctx, -2, bob + k * 3 + 0.5, -11 - f * 0.6 - (k ? 0 : 3), bob + k * 5, -2, bob + k * 3 + 2.5, '#FFE070');
    fillCircle(ctx, 0, bob, 8.2, dk); fillCircle(ctx, 0, bob, 6.6, b); fillCircle(ctx, 0, bob, 4.6, '#FFE070');                  /* a dark, burnt rim keeps it readable on bright ground */
    lkTRI(ctx, 1, bob - 5.6, 4.6 + f * 0.3, bob - 10, 4.6, bob - 4.6, '#FFC040'); lkTRI(ctx, -2.6, bob - 5.4, -3.4, bob - 9.4 - f * 0.3, 0.6, bob - 6, '#FFC040');   /* a flame crown */
    fillCircle(ctx, 2.2, bob - 1.7, 1.2, '#7A1A06'); fillCircle(ctx, 2.2, bob + 1.7, 1.2, '#7A1A06');
    fillCircle(ctx, 2.6, bob - 2, 0.45, '#FFFFFF'); fillCircle(ctx, 2.6, bob + 1.4, 0.45, '#FFFFFF');
    fillCircle(ctx, -1.6, bob, 1.5, wind ? '#FFFFFF' : '#FFF8C8');
    for (let k = 0; k < 3; k++){ const a = t * 4 + k * TAU / 3; fillCircle(ctx, Math.cos(a) * 11, bob + Math.sin(a) * 9, 1, '#FFE8A0'); }
    if (wind) csGlow(ctx, 3, bob, 14, '#FFFFFF', 0.8);
  },
  emberblade(ctx, e, b, dk, bob, wind, d){
    const s = e.r / 14, rot = wind ? -1.2 : e.state === 'dash' ? 0.1 : e.state === 'back' ? 1.3 : 0.2, P = al9Pal(b, dk, d.pale);
    if (e.state === 'dash') for (let k = 1; k <= 3; k++) csGlow(ctx, -k * 10 * s, bob, 13 * s, '#FF8A1E', 0.5 - k * 0.1);
    aBody(ctx, b, dk, d.pale, s, bob, e, AL9_BLADE);
    lkLN(ctx, [1 * s, bob - 11 * s, 7 * s, bob - 13 * s, 10 * s, bob - 8 * s], 4 * s, dk); fillCircle(ctx, 10 * s, bob - 8 * s, 2.6 * s, P.deep); fillCircle(ctx, 10.4 * s, bob - 8.4 * s, 1.2 * s, P.hi);   /* the off hand */
    ctx.save(); ctx.translate(6 * s, bob + 6 * s); ctx.rotate(rot);
    aMagmaBlade(ctx, s, wind, d.pale);
    ctx.fillStyle = '#FF9A30'; ctx.beginPath(); for (let k = 0; k < 3; k++){ ctx.moveTo((8 + k * 8) * s, -2 * s); ctx.lineTo((12 + k * 8) * s, -9 * s - Math.sin(G.time * 18 + k) * 2); ctx.lineTo((14 + k * 8) * s, -2 * s); ctx.closePath(); } ctx.fill();
    csGlow(ctx, 22 * s, 0, wind ? 26 : 15, '#FF8A1E', wind ? 0.95 : 0.6); ctx.restore();
    lkLN(ctx, [1 * s, bob + 11 * s, 5 * s, bob + 8 * s], 4 * s, dk); fillCircle(ctx, 6 * s, bob + 6.4 * s, 2.6 * s, P.deep);
  },
  spearfiend(ctx, e, b, dk, bob, wind, d){
    const s = e.r / 14, dash = e.state === 'dash', P = al9Pal(b, dk, d.pale), fl = Math.sin(G.time * 6);
    if (dash) for (let k = 1; k <= 4; k++) csGlow(ctx, -k * 12 * s, bob, 15 * s, '#FF8A1E', 0.55 - k * 0.1);
    for (let pass = 0; pass < 2; pass++){                                                                              /* a ragged fan of plume blades */
      ctx.fillStyle = pass ? d.pale : P.deep; ctx.beginPath();
      for (let i = 0; i < 2; i++){ const sy = i ? 1 : -1;
        for (let k = 0; k < 3; k++){ const w = fl * 0.8 * (k + 1) * 0.4, o = pass ? 1.4 : 0, sh = pass ? 1 : 0;
          ctx.moveTo((4 - o) * s, bob + sy * (6 + k * 1.6 + o) * s); ctx.lineTo((-12 - k * 2.6 + sh) * s, bob + sy * (12 + k * 4.2 + w) * s); ctx.lineTo((-4 + o) * s, bob + sy * (11 + k * 1.4 - o * 0.4) * s); ctx.closePath(); } }
      ctx.fill();
    }
    aBody(ctx, b, dk, d.pale, s * 0.95, bob, e, AL9_FIEND);
    ctx.fillStyle = AL9_BONE; ctx.beginPath(); ctx.moveTo(10.4 * s, bob - 2.6 * s); ctx.quadraticCurveTo(17 * s, bob - 2.2 * s, 19.4 * s, bob + 2.2 * s); ctx.quadraticCurveTo(15.4 * s, bob + 0.6 * s, 10.4 * s, bob + 2.6 * s); ctx.closePath(); ctx.fill();   /* the hooked beak */
    lkTRI(ctx, 11 * s, bob + 0.4 * s, 17.6 * s, bob + 1.4 * s, 11 * s, bob + 2.2 * s, AL9_BONE_D);
    lkLN(ctx, [1 * s, bob + 10 * s, 5 * s, bob + 5.4 * s], 3.6 * s, dk);
    aSpear(ctx, s, bob + 3 * s, -8 * s, 48 * s, d.pale);
    csGlow(ctx, 50 * s, bob + 3 * s, wind ? 24 : dash ? 22 : 11, wind ? '#FFFFFF' : d.pale, wind ? 0.95 : 0.7);
  },
  cinderbrawler(ctx, e, b, dk, bob, wind, d){
    const s = e.r / 14, up = wind, ax = (up ? 16 : 10) * s, ayo = (up ? 17 : 8) * s, P = al9Pal(b, dk, d.pale), lt = al9Lt(dk), ex = (2 * s + ax) / 2 + 1.6 * s;
    aBody(ctx, b, dk, d.pale, s * 1.05, bob, e, AL9_BRAWL);
    ctx.fillStyle = P.deep; ctx.fillRect(-4.6 * s, bob - 9 * s, 2.4 * s, 18 * s); ctx.fillStyle = d.pale; ctx.globalAlpha = 0.75; ctx.fillRect(-4.1 * s, bob - 8 * s, 0.9 * s, 16 * s); ctx.globalAlpha = 1;   /* a heavy belt plate */
    ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.strokeStyle = dk; ctx.lineWidth = 5.2 * s; ctx.beginPath();
    for (let i = 0; i < 2; i++){ const sy = i ? 1 : -1, ey = (bob + sy * 11 * s + bob + sy * ayo) / 2 + sy * 2.6 * s; ctx.moveTo(2 * s, bob + sy * 11 * s); ctx.lineTo(ex, ey); ctx.lineTo(ax, bob + sy * ayo); }
    ctx.stroke(); ctx.strokeStyle = lt; ctx.lineWidth = 1.4 * s; ctx.beginPath();
    for (let i = 0; i < 2; i++){ const sy = i ? 1 : -1, ey = (bob + sy * 11 * s + bob + sy * ayo) / 2 + sy * 2.6 * s; ctx.moveTo(ex, ey - sy * 0.9 * s); ctx.lineTo(ax, bob + sy * ayo - sy * 0.9 * s); }
    ctx.stroke(); ctx.lineCap = 'butt'; ctx.lineJoin = 'miter';
    ctx.fillStyle = dk; ctx.beginPath();
    for (let i = 0; i < 2; i++){ const sy = i ? 1 : -1, ay = bob + sy * ayo; ctx.moveTo(ax + 3.8 * s, ay); ctx.arc(ax, ay, 3.8 * s, 0, TAU); }
    ctx.fill();
    ctx.fillStyle = AL9_BONE; ctx.beginPath();
    for (let i = 0; i < 2; i++){ const sy = i ? 1 : -1, ay = bob + sy * ayo, ey = (bob + sy * 11 * s + ay) / 2 + sy * 2.6 * s;
      ctx.moveTo(ex - 1.4 * s, ey + sy * 1.4 * s); ctx.lineTo(ex - 5 * s, ey + sy * 4.6 * s); ctx.lineTo(ex + 1.6 * s, ey + sy * 2.6 * s); ctx.closePath();
      for (let k = -1; k <= 1; k++){ ctx.moveTo(ax, ay + k * 2.4 * s - 1.6 * s); ctx.lineTo(ax + 11 * s, ay + k * 3.4 * s); ctx.lineTo(ax, ay + k * 2.4 * s + 1.6 * s); ctx.closePath(); } }
    ctx.fill();
    ctx.fillStyle = d.pale; ctx.beginPath(); for (let i = 0; i < 2; i++){ const sy = i ? 1 : -1, ay = bob + sy * ayo; ctx.moveTo(ax + 1.6 * s, ay); ctx.arc(ax + 0.8 * s, ay, 0.8 * s, 0, TAU); ctx.moveTo(ax + 3.4 * s, ay); ctx.arc(ax + 2.6 * s, ay, 0.8 * s, 0, TAU); } ctx.fill();   /* knuckle embers */
    if (up) csGlow(ctx, 18 * s, bob, 26 * s, d.pale, 0.8);
  },
  forgetender(ctx, e, b, dk, bob, wind, d){
    const s = e.r / 14, P = al9Pal(b, dk, d.pale), fl = Math.sin(G.time * 5);
    ctx.fillStyle = P.deep; ctx.beginPath();                                                                           /* a bristling mane down the back */
    for (let k = 0; k < 6; k++){ const x = (3 - k * 3.2) * s; ctx.moveTo(x + 1.6 * s, bob - 1.6 * s); ctx.lineTo(x - 1 * s, bob - (8 + (k & 1) * 2.4) * s); ctx.lineTo(x - 1.6 * s, bob - 1.6 * s); ctx.moveTo(x + 1.6 * s, bob + 1.6 * s); ctx.lineTo(x - 1 * s, bob + (8 + (k & 1) * 2.4) * s); ctx.lineTo(x - 1.6 * s, bob + 1.6 * s); }
    ctx.fill();
    aBody(ctx, b, dk, d.pale, s, bob, e, AL9_FORGE);
    ctx.fillStyle = '#2A1810'; ctx.beginPath(); ctx.moveTo(1 * s, bob - 6 * s); ctx.lineTo(7 * s, bob - 4 * s); ctx.lineTo(7 * s, bob + 4 * s); ctx.lineTo(1 * s, bob + 6 * s); ctx.closePath(); ctx.fill();      /* a leather forge apron */
    ctx.strokeStyle = d.pale; ctx.lineWidth = Math.max(1, s * 0.8); ctx.globalAlpha = 0.65 + 0.2 * fl; ctx.stroke(); ctx.globalAlpha = 1;
    ctx.fillStyle = '#B09A78'; ctx.beginPath(); for (let k = 0; k < 4; k++){ const y = bob + (k - 1.5) * 2.7 * s; ctx.moveTo(5.2 * s + 0.5 * s, y); ctx.arc(5.2 * s, y, 0.5 * s, 0, TAU); } ctx.fill();   /* rivets */
    ctx.fillStyle = AL9_BONE; ctx.beginPath();                                                                         /* tusks */
    for (let i = 0; i < 2; i++){ const sy = i ? 1 : -1; ctx.moveTo(12.4 * s, bob + sy * 1.8 * s); ctx.quadraticCurveTo(17 * s, bob + sy * 2.6 * s, 17.6 * s, bob + sy * 7.8 * s); ctx.quadraticCurveTo(15 * s, bob + sy * 4.4 * s, 12 * s, bob + sy * 3.4 * s); ctx.closePath(); }
    ctx.fill();
    aWarHammer(ctx, s, bob, d.pale, wind);
    lkLN(ctx, [3 * s, bob - 10 * s, 12 * s, bob - 6 * s], 3.6 * s, dk); fillCircle(ctx, 12.4 * s, bob - 5.8 * s, 2.5 * s, P.deep); fillCircle(ctx, 12.8 * s, bob - 6.2 * s, 1.1 * s, P.hi);
    if (wind) csGlow(ctx, 22 * s, bob + 5 * s, 16 * s, Math.sin(e.anim * 20) > 0 ? '#FFFFFF' : '#FFC030', 0.9);
  },
  emberpriest(ctx, e, b, dk, bob, wind, d){
    const s = e.r / 14, P = al9Pal(b, dk, d.pale), t = G.time, heal = e.healTgtT > 0;
    csGlow(ctx, 0, bob, 24 * s, heal ? '#7CFFB0' : d.pale, 0.28);
    lkOV(ctx, -3.6 * s, bob, 13.6 * s, 15.6 * s, P.deep); lkOV(ctx, -3.6 * s, bob, 12.2 * s, 14.2 * s, P.lo);                /* the sweeping robe */
    ctx.strokeStyle = d.pale; ctx.lineWidth = Math.max(1, s * 0.9); ctx.globalAlpha = 0.7; ctx.beginPath(); ctx.ellipse(-3.6 * s, bob, 12.4 * s, 14.4 * s, 0, 1.4, 4.9); ctx.stroke(); ctx.globalAlpha = 1;   /* a gilded hem */
    ctx.fillStyle = d.pale; ctx.beginPath(); for (let k = 0; k < 5; k++){ const a = 1.7 + k * 0.62, x = -3.6 * s + Math.cos(a) * 12.4 * s * 0.88, y = bob + Math.sin(a) * 14.4 * s * 0.88; ctx.moveTo(x + 0.8 * s, y); ctx.arc(x, y, 0.8 * s, 0, TAU); } ctx.fill();
    aBody(ctx, b, dk, d.pale, s, bob, e, AL9_PRIEST);
    lkLN(ctx, [-9 * s, bob - 6 * s, 2 * s, bob + 6 * s], 2.6 * s, d.pale); lkLN(ctx, [-9 * s, bob - 6 * s, 2 * s, bob + 6 * s], 1 * s, P.hot);   /* a sash of flame-thread */
    aClaws(ctx, s, bob, 0, dk);
    ctx.strokeStyle = d.pale; ctx.lineWidth = Math.max(1.2, 1.5 * s); ctx.beginPath(); ctx.arc(6.5 * s, bob, 9.5 * s, 0, TAU); ctx.stroke();                          /* a halo of flame */
    ctx.fillStyle = P.hot; ctx.beginPath(); for (let k = 0; k < 6; k++){ const a = t * 1.4 + k * TAU / 6; ctx.moveTo(6.5 * s + Math.cos(a) * 11.6 * s + 0.9 * s, bob + Math.sin(a) * 11.6 * s); ctx.arc(6.5 * s + Math.cos(a) * 11.6 * s, bob + Math.sin(a) * 11.6 * s, 0.9 * s, 0, TAU); } ctx.fill();
    aFlameStaff(ctx, s, bob, heal ? '#7CFFB0' : d.pale);
  },
  pyrecrusher(ctx, e, b, dk, bob, wind, d){
    const s = e.r / 11, up = wind, P = al9Pal(b, dk, d.pale), fx = (up ? 15 : 20) * s, fyo = (up ? 17 : 13) * s, ex = (2 * s + fx) / 2 - 1 * s;
    if (e.state === 'recover') csGlow(ctx, 20 * s, bob, 36 * s, '#FF7A1E', 0.45);
    aBody(ctx, b, dk, d.pale, s, bob, e, AL9_CRUSH);
    ctx.fillStyle = P.deep; ctx.beginPath(); ctx.moveTo(5 * s, bob); ctx.lineTo(-2 * s, bob - 4.2 * s); ctx.lineTo(-10.6 * s, bob - 2.4 * s); ctx.lineTo(-10.6 * s, bob + 2.4 * s); ctx.lineTo(-2 * s, bob + 4.2 * s); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#CDB9A0'; ctx.beginPath(); ctx.moveTo(3.6 * s, bob); ctx.lineTo(-2 * s, bob - 3 * s); ctx.lineTo(-9.6 * s, bob - 1.5 * s); ctx.lineTo(-9.6 * s, bob + 1.5 * s); ctx.lineTo(-2 * s, bob + 3 * s); ctx.closePath(); ctx.fill();   /* the pale saddle stripe */
    lkLN(ctx, [3 * s, bob, -9 * s, bob], 0.9 * s, d.pale);
    ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.strokeStyle = P.deep; ctx.lineWidth = 6.2 * s; ctx.beginPath();
    for (let i = 0; i < 2; i++){ const sy = i ? 1 : -1, fy = bob + sy * fyo, ey = (bob + sy * 11 * s + fy) / 2 + sy * 3 * s; ctx.moveTo(2 * s, bob + sy * 11 * s); ctx.lineTo(ex, ey); ctx.lineTo(fx, fy); }
    ctx.stroke(); ctx.strokeStyle = P.lo; ctx.lineWidth = 3.4 * s; ctx.stroke(); ctx.lineCap = 'butt'; ctx.lineJoin = 'miter';
    ctx.fillStyle = AL9_BONE; ctx.beginPath();
    for (let i = 0; i < 2; i++){ const sy = i ? 1 : -1, fy = bob + sy * fyo, ey = (bob + sy * 11 * s + fy) / 2 + sy * 3 * s;
      ctx.moveTo(ex - 2 * s, ey + sy * 1.4 * s); ctx.lineTo(ex - 5.4 * s, ey + sy * 5 * s); ctx.lineTo(ex + 2 * s, ey + sy * 2.8 * s); ctx.closePath();
      for (let k = 0; k < 4; k++){ const a = -0.9 + k * 0.6; ctx.moveTo(fx + Math.cos(a) * 7.6 * s - Math.sin(a) * 1.4 * s, fy + Math.sin(a) * 7.6 * s + Math.cos(a) * 1.4 * s); ctx.lineTo(fx + Math.cos(a) * 11.2 * s, fy + Math.sin(a) * 11.2 * s); ctx.lineTo(fx + Math.cos(a) * 7.6 * s + Math.sin(a) * 1.4 * s, fy + Math.sin(a) * 7.6 * s - Math.cos(a) * 1.4 * s); ctx.closePath(); } }
    ctx.fill();
    for (let i = 0; i < 2; i++){ const sy = i ? 1 : -1, fy = bob + sy * fyo;
      if (up) csGlow(ctx, fx, fy, 14 * s, d.pale, 0.9); else al9Blob(ctx, fx, fy, 12 * s, d.pale, 0.28, 1);
      al9Rock(ctx, fx, fy, 9.2 * s, '#1E0E08', 0.3 + i); al9Rock(ctx, fx, fy, 7.4 * s, '#5A2214', 0.3 + i); al9Rock(ctx, fx - 1.2 * s, fy - 1.2 * s, 4.4 * s, '#7A3A20', 0.8 + i); }
    ctx.strokeStyle = d.pale; ctx.lineWidth = Math.max(1, 1.2 * s); ctx.lineCap = 'round'; ctx.beginPath();
    for (let i = 0; i < 2; i++){ const fy = bob + (i ? 1 : -1) * fyo; ctx.moveTo(fx - 4.6 * s, fy + 0.6 * s); ctx.lineTo(fx - 1 * s, fy - 0.4 * s); ctx.lineTo(fx + 1.6 * s, fy + 3.6 * s); ctx.moveTo(fx - 1 * s, fy - 0.4 * s); ctx.lineTo(fx + 2.4 * s, fy - 3.4 * s); }
    ctx.stroke(); ctx.lineCap = 'butt';
  },
  smokewraith(ctx, e, b, dk, bob, wind, d){
    const vis = e.vis === undefined ? 0.1 : e.vis, A = 0.42 + 0.58 * vis, t = G.time, s = e.r / 8, P = al9Pal(b, dk, d.pale);
    ctx.globalAlpha = A;
    for (let k = 0; k < 5; k++){ ctx.fillStyle = k & 1 ? 'rgba(52,42,62,.4)' : 'rgba(30,24,38,.4)'; ctx.beginPath(); ctx.arc(-6 * s - k * 4.6 * s, bob + Math.sin(t * 4 + k) * 3 * s, (7 - k * 0.9) * s, 0, TAU); ctx.fill(); }
    ctx.fillStyle = P.deep; ctx.beginPath();                                                                          /* tattered shroud ends */
    for (let k = -2; k <= 2; k++){ const w = Math.sin(t * 5 + k) * 1.4 * s; ctx.moveTo(-3 * s, bob + k * 3.2 * s - 1.8 * s); ctx.lineTo((-13 - (2 - Math.abs(k)) * 2) * s, bob + k * 5.4 * s + w); ctx.lineTo(-3 * s, bob + k * 3.2 * s + 1.8 * s); ctx.closePath(); }
    ctx.fill();
    aBody(ctx, b, dk, d.pale, s, bob, e, AL9_WRAITH);
    ctx.globalAlpha = A; lkLN(ctx, [1 * s, bob + 10 * s, 6 * s, bob + 6 * s], 2.6 * s, dk); lkLN(ctx, [1 * s, bob - 10 * s, 6 * s, bob - 6 * s], 2.6 * s, dk);
    ctx.fillStyle = d.pale; ctx.beginPath(); for (let i = 0; i < 2; i++){ const sy = i ? 1 : -1; for (let k = 0; k < 3; k++){ ctx.moveTo(6 * s, bob + sy * 6 * s); ctx.lineTo((11 + k * 1.4) * s, bob + sy * (7.6 + k * 1.4) * s); ctx.lineTo(7.4 * s, bob + sy * (7 + k * 0.6) * s); ctx.closePath(); } }
    ctx.fill();                                                                                                        /* hooked wisp-claws */
    ctx.globalAlpha = 1;
    if (e.state === 'wind' || e.state === 'dash'){ lkLN(ctx, [4 * s, bob + 4 * s, 26 * s, bob + 4 * s], 2.6 * s, '#FFE0B0'); lkLN(ctx, [4 * s, bob + 4 * s, 26 * s, bob + 4 * s], 1 * s, '#FFFFFF'); csGlow(ctx, 26 * s, bob + 4 * s, 16, d.pale, 0.9); }
  },
  sporeimp(ctx, e, b, dk, bob, wind, d){
    const s = e.r / 8, fz = e.fuse === undefined ? 3 : e.fuse, on = Math.sin(fz * (10 + (3.2 - fz) * 6)) > 0, P = al9Pal(b, dk, d.pale), sw = Math.sin((e.anim || 0) * 1.4);
    csGlow(ctx, 0, bob, 14 * s, d.pale, on ? 0.7 : 0.25);
    ctx.fillStyle = P.deep; ctx.beginPath();                                                                           /* four stubby feet */
    for (let k = 0; k < 4; k++){ const a = k * TAU / 4 + 0.785, q = (k & 1 ? sw : -sw) * 0.14; ctx.moveTo(Math.cos(a + q) * 8 * s + 2 * s, bob + Math.sin(a + q) * 8 * s); ctx.arc(Math.cos(a + q) * 9.6 * s, bob + Math.sin(a + q) * 9.6 * s, 2.5 * s, 0, TAU); }
    ctx.fill();
    for (let k = 0; k < 8; k++){ const a = k / 8 * TAU; lkTRI(ctx, Math.cos(a - 0.3) * 8 * s, bob + Math.sin(a - 0.3) * 8 * s, Math.cos(a) * 12.8 * s, bob + Math.sin(a) * 12.8 * s, Math.cos(a + 0.3) * 8 * s, bob + Math.sin(a + 0.3) * 8 * s, dk); }
    ctx.fillStyle = P.mid; ctx.beginPath(); for (let k = 0; k < 8; k++){ const a = k / 8 * TAU + 0.39, x = Math.cos(a) * 7.4 * s, y = bob + Math.sin(a) * 7.4 * s; ctx.moveTo(x + 2.4 * s, y); ctx.arc(x, y, 2.4 * s, 0, TAU); } ctx.fill();   /* spore pods */
    fillCircle(ctx, 0, bob, 9 * s, P.deep); fillCircle(ctx, 0, bob, 8 * s, b);
    ctx.globalAlpha = 0.5; lkOV(ctx, -2.4 * s, bob - 3.8 * s, 4 * s, 2 * s, P.hi, -0.4); ctx.globalAlpha = 1;
    ctx.fillStyle = P.lo; ctx.beginPath(); for (let k = 0; k < 5; k++){ const a = 2.3 + k * 0.9, x = Math.cos(a) * 5.6 * s, y = bob + Math.sin(a) * 5.6 * s; ctx.moveTo(x + 1.1 * s, y); ctx.arc(x, y, 1.1 * s, 0, TAU); } ctx.fill();
    fillCircle(ctx, 0.4 * s, bob, 5 * s, on ? '#FFE070' : d.pale); fillCircle(ctx, 0.4 * s, bob, 3 * s, on ? '#FFF6C0' : P.hot);
    ctx.strokeStyle = P.deep; ctx.lineWidth = Math.max(1, 0.9 * s); ctx.beginPath(); ctx.moveTo(4.8 * s, bob - 1.4 * s); ctx.quadraticCurveTo(6.4 * s, bob, 4.8 * s, bob + 1.4 * s); ctx.stroke();   /* a tiny mouth */
    fillCircle(ctx, 3.4 * s, bob - 2.2 * s, 1.7 * s, '#FFFFFF'); fillCircle(ctx, 3.4 * s, bob + 2.2 * s, 1.7 * s, '#FFFFFF');
    fillCircle(ctx, 3.8 * s, bob - 2.2 * s, 0.9 * s, '#3A0C04'); fillCircle(ctx, 3.8 * s, bob + 2.2 * s, 0.9 * s, '#3A0C04');
    lkLN(ctx, [-6 * s, bob, -9 * s, bob - 1 * s, -12 * s, bob - 4 * s], 1.8 * s, '#3A2A1A'); if (on) csGlow(ctx, -12 * s, bob - 4 * s, 7, '#FFF0A0', 0.95);   /* the burning fuse */
    fillCircle(ctx, -12 * s, bob - 4 * s, 1 * s, on ? '#FFFFFF' : d.pale);
  },
  magmatotem(ctx, e, b, dk, bob, wind, d){
    const P = al9Pal(b, dk, d.pale);
    ctx.fillStyle = P.deep; ctx.beginPath(); for (let k = 0; k < 8; k++){ const a = k / 8 * TAU + 0.3927; ctx.lineTo(Math.cos(a) * 15, Math.sin(a) * 15); } ctx.closePath(); ctx.fill();      /* an octagonal armored base */
    ctx.fillStyle = dk; ctx.beginPath(); for (let k = 0; k < 8; k++){ const a = k / 8 * TAU + 0.3927; ctx.lineTo(Math.cos(a) * 12.6, Math.sin(a) * 12.6); } ctx.closePath(); ctx.fill();
    for (let k = 0; k < 4; k++){ const a = k * Math.PI / 2 + 0.7854; lkTRI(ctx, Math.cos(a - 0.3) * 12, Math.sin(a - 0.3) * 12, Math.cos(a) * 18, Math.sin(a) * 18, Math.cos(a + 0.3) * 12, Math.sin(a + 0.3) * 12, P.deep); }   /* corner spikes */
    ctx.fillStyle = '#8A7060'; ctx.beginPath(); for (let k = 0; k < 8; k++){ const a = k / 8 * TAU + 0.3927; ctx.moveTo(Math.cos(a) * 13.6 + 0.9, Math.sin(a) * 13.6); ctx.arc(Math.cos(a) * 13.6, Math.sin(a) * 13.6, 0.9, 0, TAU); } ctx.fill();   /* bolts */
    fillCircle(ctx, 0, 0, 10, P.lo); fillCircle(ctx, 0, 0, 8.6, b);
    ctx.globalAlpha = 0.5; lkOV(ctx, -3, -4.6, 5, 2.4, P.hi, -0.4); ctx.globalAlpha = 1;
    csGlow(ctx, 0, 0, 12, d.pale, 0.6 + 0.2 * Math.sin(G.time * 6)); fillCircle(ctx, 0, 0, 4.4, P.deep); fillCircle(ctx, 0, 0, 3.4, d.pale); fillCircle(ctx, -0.6, -0.6, 1.4, P.hot);
    ctx.fillStyle = '#2A1814'; ctx.fillRect(2, -5.8, 9.4, 11.6); ctx.strokeStyle = '#0E0604'; ctx.lineWidth = 1; ctx.strokeRect(2, -5.8, 9.4, 11.6);
    ctx.fillStyle = '#4A3228'; ctx.fillRect(3, -4.8, 7.4, 2.4);
    ctx.fillStyle = d.pale; ctx.globalAlpha = 0.8; ctx.fillRect(3.4, 2.4, 6.4, 1); ctx.fillRect(3.4, 4, 4.6, 0.8); ctx.globalAlpha = 1;
    ctx.fillStyle = '#4A3228'; for (let k = 0; k < 3; k++) ctx.fillRect(-9 - k * 2.2, -4, 1.4, 8);                                         /* rear radiator fins */
    lkLN(ctx, [11, 0, 22, 0], 4.6, '#2A1812'); lkLN(ctx, [11, -1.2, 22, -1.2], 1.2, '#6A4A38');
    for (let k = 0; k < 3; k++){ ctx.fillStyle = d.pale; ctx.globalAlpha = 0.8; ctx.fillRect(13 + k * 3, -1.4, 1.4, 2.8); ctx.globalAlpha = 1; }
    lkTRI(ctx, 14, -2.4, 17, -6.4, 18, -2.4, '#2A1812'); lkTRI(ctx, 14, 2.4, 17, 6.4, 18, 2.4, '#2A1812');                                   /* barrel fins */
    ctx.fillStyle = '#1A1010'; ctx.fillRect(21, -3.8, 4.4, 7.6); fillCircle(ctx, 25.6, 0, 2.2, d.pale); csGlow(ctx, 25.4, 0, 6, d.pale, 0.6);
    if (e.state === 'burst') csGlow(ctx, 24, 0, 14, '#FFD060', 0.95);
    const left = e.life === undefined ? 14 : e.life; if (left < 3 && Math.sin(e.anim * 8) > 0) fillCircle(ctx, -7, 0, 2, '#FFFFFF');
  },
  /* ---- bosses ---- */
  pyrax(ctx, e, b, dk, bob, wind, d){
    const s = e.r / 11, P = al9Pal(b, dk, d.pale), t = G.time;
    csGlow(ctx, -14 * s, bob, 30 * s, d.pale, 0.45);
    for (let k = -2; k <= 2; k++){ const fl = Math.sin(t * 7 + k * 1.3) * 1.8 * s, L = (34 + (2 - Math.abs(k)) * 5) * s;                                                       /* the war-banner of flame */
      lkTRI(ctx, -8 * s, bob + k * 4 * s - 3.4 * s, -L - fl, bob + k * 9.5 * s, -8 * s, bob + k * 4 * s + 3.4 * s, P.deep);
      lkTRI(ctx, -8 * s, bob + k * 4 * s - 2.6 * s, -L * 0.92 - fl, bob + k * 9.2 * s, -8 * s, bob + k * 4 * s + 2.6 * s, d.pale);
      lkTRI(ctx, -8 * s, bob + k * 4 * s - 1.2 * s, -L * 0.6 - fl, bob + k * 7 * s, -8 * s, bob + k * 4 * s + 1.2 * s, P.hot); }
    aBody(ctx, b, dk, d.pale, s, bob, e, AL9_WARLORD);
    ctx.strokeStyle = d.pale; ctx.lineWidth = 1.2 * s; ctx.globalAlpha = 0.55; ctx.beginPath(); ctx.ellipse(-1 * s, bob, 10.4 * s, 13.4 * s, 0, 0, TAU); ctx.stroke(); ctx.globalAlpha = 1;   /* a gilded armor trim */
    ctx.fillStyle = P.hot; ctx.beginPath(); for (let k = 0; k < 5; k++){ const a = -1.1 + k * 0.55; for (let i = 0; i < 2; i++){ const x = -1 * s + Math.cos(a) * 10.4 * s, y = bob + (i ? 1 : -1) * Math.sin(a) * 13.4 * s * 0.8; ctx.moveTo(x + 0.8 * s, y); ctx.arc(x, y, 0.8 * s, 0, TAU); } } ctx.fill();
    lkTRI(ctx, -8 * s, bob, -5 * s, bob - 3.4 * s, -2 * s, bob, P.deep); lkTRI(ctx, -8 * s, bob, -5 * s, bob + 3.4 * s, -2 * s, bob, P.deep); lkTRI(ctx, -6.4 * s, bob, -5 * s, bob - 1.8 * s, -3.6 * s, bob, d.pale); lkTRI(ctx, -6.4 * s, bob, -5 * s, bob + 1.8 * s, -3.6 * s, bob, d.pale);   /* a war-rune on its back */
    lkLN(ctx, [1 * s, bob + 10 * s, 9 * s, bob + 3 * s], 4.4 * s, dk); fillCircle(ctx, 9 * s, bob + 3 * s, 3.4 * s, P.deep); fillCircle(ctx, 9.4 * s, bob + 2.6 * s, 1.6 * s, P.mid);
    aMagmaCannon(ctx, s, bob, 28 * s, d.pale, false);
    if (wind){ lkLN(ctx, [1 * s, bob - 10 * s, 12 * s, bob - 22 * s], 4.4 * s, dk); fillCircle(ctx, 12.6 * s, bob - 22.6 * s, 3.6 * s, P.deep); fillCircle(ctx, 13 * s, bob - 23 * s, 2 * s, d.pale); csGlow(ctx, 13 * s, bob - 23 * s, 22, '#FFD060', 0.95); }
    else { lkLN(ctx, [1 * s, bob - 10 * s, 9 * s, bob - 3 * s], 4.4 * s, dk); fillCircle(ctx, 9 * s, bob - 3 * s, 3.4 * s, P.deep); fillCircle(ctx, 9.4 * s, bob - 3.4 * s, 1.6 * s, P.mid);
      ctx.fillStyle = AL9_BONE; ctx.beginPath(); for (let k = -1; k <= 1; k++){ ctx.moveTo(10.6 * s, bob - 3 * s + k * 2 * s - 0.9 * s); ctx.lineTo(16 * s, bob - 3 * s + k * 3.2 * s); ctx.lineTo(10.6 * s, bob - 3 * s + k * 2 * s + 0.9 * s); ctx.closePath(); } ctx.fill(); }
    if (e.state === 'burst') csGlow(ctx, 31 * s, bob + 3 * s, 20, '#FFB030', 0.95);
  },
  pyreseer(ctx, e, b, dk, bob, wind, d){
    const s = e.r / 20, t = G.time, P = al9Pal(b, dk, d.pale);
    csGlow(ctx, 0, bob, 44 * s, d.pale, 0.3);
    for (let k = -2; k <= 2; k++){ const w = Math.sin(t * 3 + k) * 1.6 * s, L = (30 + (2 - Math.abs(k)) * 5) * s;                                      /* trailing flame-veils behind the cloak */
      lkTRI(ctx, -6 * s, bob + k * 4 * s - 4 * s, -L, bob + k * 11 * s + w, -6 * s, bob + k * 4 * s + 4 * s, P.deep);
      lkTRI(ctx, -6 * s, bob + k * 4 * s - 2.6 * s, -L * 0.8, bob + k * 10 * s + w, -6 * s, bob + k * 4 * s + 2.6 * s, d.pale); }
    lkOV(ctx, -4 * s, bob, 17.4 * s, 21.4 * s, P.deep); lkOV(ctx, -4 * s, bob, 16 * s, 20 * s, dk); lkOV(ctx, -2 * s, bob, 12.6 * s, 15.6 * s, b);                                              /* a floating cloak */
    ctx.globalAlpha = 0.45; lkOV(ctx, -5 * s, bob - 3 * s, 8 * s, 9 * s, P.hi, -0.3); ctx.globalAlpha = 1;
    ctx.strokeStyle = dk; ctx.lineWidth = Math.max(1.4, 2 * s * 0.8); ctx.beginPath(); for (let k = -2; k <= 2; k++){ ctx.moveTo(-14 * s, bob + k * 6 * s); ctx.quadraticCurveTo(-6 * s, bob + k * 5 * s, 3 * s, bob + k * 2.4 * s); } ctx.stroke();
    ctx.strokeStyle = d.pale; ctx.lineWidth = Math.max(1, 1.2 * s); ctx.globalAlpha = 0.7; ctx.beginPath(); for (let k = -1; k <= 1; k++){ ctx.moveTo(-12 * s, bob + k * 6.4 * s + 3 * s); ctx.quadraticCurveTo(-6 * s, bob + k * 5.4 * s + 3 * s, 0, bob + k * 2.6 * s + 3 * s); } ctx.stroke(); ctx.globalAlpha = 1;   /* embroidered flame-thread */
    ctx.fillStyle = P.hot; ctx.beginPath(); for (let k = 0; k < 7; k++){ const a = 1.9 + k * 0.4, x = -4 * s + Math.cos(a) * 15.4 * s, y = bob + Math.sin(a) * 19 * s; ctx.moveTo(x + 1.5 * s, y); ctx.arc(x, y, 1.5 * s, 0, TAU); } ctx.fill();   /* the cloak's rim beads */
    for (let k = 0; k < 2; k++){ const a = t * (1.2 + k * 0.5) * (k ? -1 : 1), R = (30 + k * 6) * s;
      ctx.strokeStyle = d.pale; ctx.lineWidth = Math.max(1.4, 3 * s * 0.6); ctx.beginPath(); ctx.arc(0, bob, R, a, a + TAU * 0.6); ctx.stroke();
      ctx.fillStyle = P.hot; ctx.beginPath(); for (let j = 0; j < 4; j++){ const aa = a + j * 0.42, x = Math.cos(aa) * R, y = bob + Math.sin(aa) * R; ctx.moveTo(x + 1.6 * s, y); ctx.arc(x, y, 1.6 * s, 0, TAU); } ctx.fill(); }
    lkOV(ctx, 7 * s, bob, 10 * s, 9.6 * s, P.deep); lkOV(ctx, 7.6 * s, bob, 8.6 * s, 8.2 * s, dk);                                                          /* the hood */
    ctx.fillStyle = d.pale; ctx.beginPath(); for (let k = -2; k <= 2; k++){ ctx.moveTo(8 * s, bob + k * 3.2 * s - 1.2 * s); ctx.lineTo((13 - Math.abs(k) * 1.6) * s, bob + k * 4.2 * s); ctx.lineTo(8 * s, bob + k * 3.2 * s + 1.2 * s); ctx.closePath(); } ctx.fill();   /* a brow of flame */
    fillCircle(ctx, 9 * s, bob, 6.4 * s, '#FFE8A0'); fillCircle(ctx, 9.4 * s, bob, 4.6 * s, '#FFB830'); fillCircle(ctx, 9.8 * s, bob, 2.6 * s, '#3A0C04');
    fillCircle(ctx, 10.6 * s, bob - 1.4 * s, 1 * s, '#FFFFFF'); csGlow(ctx, 12 * s, bob, 9 * s, '#FFFFFF', 0.9);   /* the single great eye */
    const rx = wind ? 16 * s : 11 * s, ry = wind ? bob + 26 * s : bob + 10 * s;
    for (let i = 0; i < 2; i++){ const sy = i ? 1 : -1, hx = i ? rx : 11 * s, hy = i ? ry : bob - 10 * s;
      lkCV(ctx, 1 * s, bob + sy * 14 * s, 5 * s, bob + sy * 14 * s + (hy - bob - sy * 14 * s) * 0.2, hx, hy, 4.6 * s, dk); lkCV(ctx, 1 * s, bob + sy * 14 * s, 5 * s, bob + sy * 14 * s + (hy - bob - sy * 14 * s) * 0.2, hx, hy, 1.2 * s, P.mid);
      fillCircle(ctx, hx, hy, 2.6 * s, P.deep); fillCircle(ctx, hx + 0.3 * s, hy - 0.2 * s, 1.5 * s, b);
      ctx.fillStyle = AL9_BONE; ctx.beginPath(); for (let k = -1; k <= 1; k++){ ctx.moveTo(hx + 1 * s, hy + k * 1.6 * s - 0.7 * s); ctx.lineTo(hx + 5.4 * s, hy + k * 2.6 * s); ctx.lineTo(hx + 1 * s, hy + k * 1.6 * s + 0.7 * s); ctx.closePath(); } ctx.fill(); }
    if (wind){ fillCircle(ctx, 16 * s, bob + 27 * s, 5.4 * s, d.pale); fillCircle(ctx, 16 * s, bob + 27 * s, 3 * s, P.hot); csGlow(ctx, 16 * s, bob + 28 * s, 30, d.pale, 0.9); }
  },
  magmacolossus(ctx, e, b, dk, bob, wind, d){
    const s = e.r / 23, z = e.z || 0, P = al9Pal(b, dk, d.pale), t = G.time;
    if (e.state === 'air') csGlow(ctx, -6, 0, 42 + z * 0.2, '#FF8A3A', 0.6);
    ctx.translate(0, -z);
    const st = Math.sin(e.anim * 0.55) * 8 * s;
    for (let i = 0; i < 2; i++){ const sy = i ? 1 : -1, x = i ? -st : st; al9Rock(ctx, x, bob + sy * 20 * s, 12.6 * s, P.deep, i, 8); al9Rock(ctx, x, bob + sy * 20 * s, 10.4 * s, dk, i + 0.2, 8);
      al9Rock(ctx, x + 1.6 * s, bob + sy * 20 * s, 6 * s, P.mid, i + 0.5, 6); }
    ctx.fillStyle = P.deep; ctx.beginPath(); for (let k = 0; k < 9; k++){ const a = k / 9 * TAU, r = (k % 2 ? 30.4 : 34.4) * s; ctx.lineTo(Math.cos(a) * r, bob + Math.sin(a) * r * 0.88); } ctx.closePath(); ctx.fill();
    ctx.fillStyle = dk; ctx.beginPath(); for (let k = 0; k < 9; k++){ const a = k / 9 * TAU, r = (k % 2 ? 29 : 33) * s; ctx.lineTo(Math.cos(a) * r, bob + Math.sin(a) * r * 0.88); } ctx.closePath(); ctx.fill();
    ctx.fillStyle = b; ctx.beginPath(); for (let k = 0; k < 9; k++){ const a = k / 9 * TAU, r = (k % 2 ? 25 : 29) * s; ctx.lineTo(Math.cos(a) * r, bob + Math.sin(a) * r * 0.88); } ctx.closePath(); ctx.fill();
    ctx.fillStyle = P.mid; ctx.beginPath(); for (let k = 0; k < 9; k++){ const a = k / 9 * TAU + 0.2, r = (k % 2 ? 14 : 18) * s; ctx.lineTo(-3 * s + Math.cos(a) * r, bob - 1 * s + Math.sin(a) * r * 0.88); } ctx.closePath(); ctx.fill();   /* a raised central slab */
    ctx.strokeStyle = P.lo; ctx.lineWidth = 2.4 * s; ctx.beginPath(); for (let k = 0; k < 9; k += 2){ const a = k / 9 * TAU; ctx.moveTo(Math.cos(a) * 18 * s, bob + Math.sin(a) * 18 * s * 0.88); ctx.lineTo(Math.cos(a) * 28 * s, bob + Math.sin(a) * 28 * s * 0.88); } ctx.stroke();   /* plate joints */
    ctx.fillStyle = P.hi; ctx.globalAlpha = 0.5; ctx.beginPath(); for (let k = 5; k < 9; k++){ const a = k / 9 * TAU, r = (k % 2 ? 24 : 27.6) * s; ctx.lineTo(Math.cos(a) * r, bob + Math.sin(a) * r * 0.88); } ctx.lineTo(0, bob); ctx.closePath(); ctx.fill(); ctx.globalAlpha = 1;   /* a lit edge */
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.strokeStyle = d.pale; ctx.lineWidth = 3.2 * s; ctx.globalAlpha = 0.5 + 0.3 * Math.sin(t * 2); ctx.beginPath(); ctx.moveTo(-18 * s, bob - 14 * s); ctx.lineTo(-4 * s, bob - 2 * s); ctx.lineTo(-14 * s, bob + 10 * s); ctx.lineTo(0, bob + 20 * s); ctx.moveTo(-4 * s, bob - 2 * s); ctx.lineTo(14 * s, bob - 6 * s); ctx.moveTo(-14 * s, bob + 10 * s); ctx.lineTo(-24 * s, bob + 14 * s); ctx.stroke();
    ctx.globalAlpha = 0.95; ctx.strokeStyle = P.hot; ctx.lineWidth = 1.2 * s; ctx.stroke(); ctx.globalAlpha = 1; ctx.lineCap = 'butt'; ctx.lineJoin = 'miter';
    al9Rock(ctx, -14 * s, bob - 22 * s, 6 * s, dk, 1.2, 6); al9Rock(ctx, -14 * s, bob + 22 * s, 6 * s, dk, 2.2, 6); al9Rock(ctx, -24 * s, bob, 5.4 * s, dk, 0.6, 6);   /* back boulders */
    al9Rock(ctx, -14.6 * s, bob - 22.6 * s, 3 * s, P.mid, 1.2, 6); al9Rock(ctx, -14.6 * s, bob + 21.4 * s, 3 * s, P.mid, 2.2, 6);
    for (let i = 0; i < 2; i++){ const sy = i ? 1 : -1, fx = 20 * s, fy = bob + sy * 22 * s;
      lkLN(ctx, [4 * s, bob + sy * 17 * s, 12 * s, bob + sy * 21 * s, fx, fy], 9 * s, P.deep); lkLN(ctx, [4 * s, bob + sy * 17 * s, 12 * s, bob + sy * 21 * s, fx, fy], 6.4 * s, dk);
      al9Rock(ctx, fx, fy, 12.4 * s, P.deep, i * 0.9, 8); al9Rock(ctx, fx, fy, 10.6 * s, dk, i * 0.9 + 0.1, 8); al9Rock(ctx, fx - 0.6 * s, fy - 0.6 * s, 7.6 * s, b, i * 0.9 + 0.3, 7);   /* the fists */
      csGlow(ctx, fx, fy, 12 * s, d.pale, 0.5);
      ctx.strokeStyle = d.pale; ctx.lineWidth = Math.max(1, 1.6 * s); ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(fx - 5 * s, fy - 1 * s); ctx.lineTo(fx - 1 * s, fy + 0.6 * s); ctx.lineTo(fx + 1.4 * s, fy - 3.4 * s); ctx.moveTo(fx - 1 * s, fy + 0.6 * s); ctx.lineTo(fx + 2 * s, fy + 4.6 * s); ctx.stroke(); ctx.lineCap = 'butt';
      ctx.fillStyle = AL9_BONE; ctx.beginPath(); for (let k = -1; k <= 1; k++){ ctx.moveTo(fx + 9.4 * s, fy + k * 4 * s - 1.8 * s); ctx.lineTo(fx + 14.4 * s, fy + k * 4.6 * s); ctx.lineTo(fx + 9.4 * s, fy + k * 4 * s + 1.8 * s); ctx.closePath(); } ctx.fill(); }   /* knuckle spikes */
    ctx.fillStyle = AL9_BONE; ctx.beginPath(); for (let i = 0; i < 2; i++){ const sy = i ? 1 : -1; ctx.moveTo(9 * s, bob + sy * 5 * s); ctx.quadraticCurveTo(15 * s, bob + sy * 9 * s, 21 * s, bob + sy * 7 * s); ctx.quadraticCurveTo(15 * s, bob + sy * 12 * s, 7 * s, bob + sy * 9.4 * s); ctx.closePath(); }
    ctx.fill();                                                                                                        /* the great curved horns */
    al9Rock(ctx, 12 * s, bob, 9.6 * s, P.deep, 0.4, 8); al9Rock(ctx, 12 * s, bob, 8 * s, dk, 0.5, 8); lkOV(ctx, 12.4 * s, bob - 2.4 * s, 4.6 * s, 2 * s, P.mid, -0.1);
    lkLN(ctx, [17 * s, bob - 3.6 * s, 14 * s, bob - 5.6 * s], 1.8 * s, P.deep); lkLN(ctx, [17 * s, bob + 3.6 * s, 14 * s, bob + 5.6 * s], 1.8 * s, P.deep);   /* a heavy brow */
    ctx.strokeStyle = d.pale; ctx.lineWidth = Math.max(1, 1.2 * s); ctx.beginPath(); ctx.moveTo(18 * s, bob - 2 * s); ctx.lineTo(19.4 * s, bob); ctx.lineTo(18 * s, bob + 2 * s); ctx.stroke();                 /* a glowing maw seam */
    al9Eyes(ctx, 15 * s, bob, 3 * s, Math.max(1.3, 2.1 * s));
    csGlow(ctx, 15 * s, bob - 3 * s, 5 * s, '#FFFFFF', 0.5); csGlow(ctx, 15 * s, bob + 3 * s, 5 * s, '#FFFFFF', 0.5);
    if (e.state === 'burst') csGlow(ctx, 42 * s, bob, 26, '#FFB040', 0.95);
    if (e.state === 'wind') ringPath(ctx, 0, bob, 38 * s, 3, '#FFFFFF', 0.6);
  },
  maelstrom(ctx, e, b, dk, bob, wind, d){
    const s = e.r / 40, pull = e.state === 'pull', t = G.time, P = al9Pal(b, dk, d.pale), sp = t * (pull ? 3 : 1.6);
    csGlow(ctx, 0, bob, 84 * s * (pull ? 1.3 : 1), d.pale, pull ? 0.55 : 0.3);
    ctx.lineCap = 'round';
    for (let k = 0; k < 4; k++){
      for (let pass = 0; pass < 2; pass++){
        ctx.strokeStyle = pass ? (k % 2 ? d.pale : '#FF6A1E') : P.deep; ctx.lineWidth = (pass ? 7 - k : 9.6 - k) * s; ctx.globalAlpha = pass ? 0.85 - k * 0.1 : 0.55; ctx.beginPath();
        for (let j = 0; j <= 24; j++){ const u = j / 24, a = sp + k * TAU / 4 + u * 4.4, r = (8 + u * 52) * s * (pull ? 0.8 : 1); const px = Math.cos(a) * r, py = bob + Math.sin(a) * r; if (j) ctx.lineTo(px, py); else ctx.moveTo(px, py); }
        ctx.stroke();
      }
    }
    ctx.globalAlpha = 0.8; ctx.strokeStyle = P.hot; ctx.lineWidth = Math.max(1, 1.4 * s); ctx.beginPath();                      /* hot cores riding the arms */
    for (let k = 0; k < 4; k++){ for (let j = 0; j <= 18; j++){ const u = j / 24 + 0.04, a = sp + k * TAU / 4 + u * 4.4, r = (8 + u * 52) * s * (pull ? 0.8 : 1); const px = Math.cos(a) * r, py = bob + Math.sin(a) * r; if (j) ctx.lineTo(px, py); else ctx.moveTo(px, py); } }
    ctx.stroke(); ctx.globalAlpha = 1; ctx.lineCap = 'butt';
    for (let k = 0; k < 9; k++){ const u = (k * 0.113 + t * 0.07) % 1, a = sp * 1.2 + k * 2.4 + u * 6, r = (14 + u * 50) * s * (pull ? 0.8 : 1), x = Math.cos(a) * r, y = bob + Math.sin(a) * r;
      al9Rock(ctx, x, y, (3.6 - u * 1.4) * s + 0.6, P.deep, k, 5); al9Rock(ctx, x - 0.4 * s, y - 0.4 * s, (2.2 - u * 0.8) * s + 0.4, P.mid, k, 5); }   /* debris caught in it */
    fillCircle(ctx, 0, bob, 23.4 * s, P.deep); fillCircle(ctx, 0, bob, 22 * s, dk); fillCircle(ctx, 0, bob, 17 * s, b);
    ctx.fillStyle = AL9_BONE; ctx.beginPath(); for (let k = 0; k < 14; k++){ const a = t * (pull ? 1.4 : 0.6) + k / 14 * TAU, c = Math.cos(a), sn = Math.sin(a); ctx.moveTo(c * 17.2 * s - sn * 2.1 * s, bob + sn * 17.2 * s + c * 2.1 * s); ctx.lineTo(c * 12.4 * s, bob + sn * 12.4 * s); ctx.lineTo(c * 17.2 * s + sn * 2.1 * s, bob + sn * 17.2 * s - c * 2.1 * s); ctx.closePath(); }
    ctx.fill();                                                                                                        /* a ring of teeth: the maw of the storm */
    fillCircle(ctx, 0, bob, 12.2 * s, P.deep);
    csGlow(ctx, 0, bob, 16 * s, d.pale, 0.9); fillCircle(ctx, 0, bob, 9 * s, d.pale); fillCircle(ctx, 0, bob, 6 * s, P.hot); fillCircle(ctx, 0, bob, 3.4 * s, '#FFFFFF');
    ctx.strokeStyle = P.deep; ctx.lineWidth = Math.max(1, 1.6 * s); ctx.beginPath(); ctx.moveTo(0, bob - 5 * s); ctx.lineTo(0, bob + 5 * s); ctx.stroke();                 /* a slit pupil */
    al9Eyes(ctx, 14 * s, bob, 5 * s, Math.max(1.4, 2.4 * s));
    ctx.strokeStyle = P.hot; ctx.lineWidth = Math.max(1, 1.2 * s); ctx.globalAlpha = 0.75; ctx.beginPath();
    for (let k = 0; k < 3; k++){ const a = t * 9 + k * 2.1, c = Math.cos(a), sn = Math.sin(a); ctx.moveTo(c * 24 * s, bob + sn * 24 * s); ctx.lineTo(c * 29 * s - sn * 2.4 * s, bob + sn * 29 * s + c * 2.4 * s); ctx.lineTo(c * 33 * s + sn * 1.6 * s, bob + sn * 33 * s - c * 1.6 * s); ctx.lineTo(c * 38 * s, bob + sn * 38 * s); }
    ctx.stroke(); ctx.globalAlpha = 1;                                                                                 /* flickering arcs of lightning */
  },
  infernoqueen(ctx, e, b, dk, bob, wind, d){
    const s = e.r / 36, t = G.time, P = al9Pal(b, dk, d.pale), fp = 1 + 0.05 * Math.sin(t * 2.4);
    lkCV(ctx, -12 * s, bob, -26 * s, bob + Math.sin(t * 2) * 8 * s, -44 * s, bob + Math.sin(t * 2 + 1) * 12 * s, 6 * s, P.deep); lkCV(ctx, -12 * s, bob, -26 * s, bob + Math.sin(t * 2) * 8 * s, -44 * s, bob + Math.sin(t * 2 + 1) * 12 * s, 3.4 * s, d.pale);   /* a lashing tail of flame */
    for (let i = 0; i < 2; i++){ const sy = i ? 1 : -1;
      ctx.fillStyle = P.deep; ctx.beginPath(); ctx.moveTo(-4 * s, bob + sy * 10 * s); ctx.lineTo(-30 * s, bob + sy * 72 * s * fp); ctx.lineTo(-60 * s, bob + sy * 52 * s * fp); ctx.lineTo(-46 * s, bob + sy * 22 * s); ctx.lineTo(-54 * s, bob + sy * 4 * s); ctx.closePath(); ctx.fill();
      ctx.fillStyle = dk; ctx.beginPath(); ctx.moveTo(-4 * s, bob + sy * 10 * s); ctx.lineTo(-30 * s, bob + sy * 70 * s * fp); ctx.lineTo(-58 * s, bob + sy * 50 * s * fp); ctx.lineTo(-44 * s, bob + sy * 22 * s); ctx.lineTo(-52 * s, bob + sy * 4 * s); ctx.closePath(); ctx.fill();
      ctx.fillStyle = b; ctx.beginPath(); ctx.moveTo(-4 * s, bob + sy * 10 * s); ctx.lineTo(-28 * s, bob + sy * 62 * s * fp); ctx.lineTo(-50 * s, bob + sy * 46 * s * fp); ctx.lineTo(-38 * s, bob + sy * 20 * s); ctx.closePath(); ctx.fill();
      ctx.fillStyle = P.hi; ctx.globalAlpha = 0.28; ctx.beginPath(); ctx.moveTo(-4 * s, bob + sy * 10 * s); ctx.lineTo(-28 * s, bob + sy * 62 * s * fp); ctx.lineTo(-36 * s, bob + sy * 54 * s * fp); ctx.lineTo(-20 * s, bob + sy * 20 * s); ctx.closePath(); ctx.fill(); ctx.globalAlpha = 1;
      ctx.fillStyle = P.deep; ctx.beginPath(); for (let k = 0; k < 4; k++){ const u = k / 4, x0 = -30 * s + (-28 * s) * u, y0 = bob + sy * (70 - u * 20) * s * fp; ctx.moveTo(x0 + 6 * s, y0 - sy * 2 * s); ctx.lineTo(x0 - 3 * s, y0 + sy * 7 * s); ctx.lineTo(x0 - 5 * s, y0 - sy * 1 * s); ctx.closePath(); }
      ctx.fill();                                                                                                      /* scalloped trailing edge */
      lkLN(ctx, [-6 * s, bob + sy * 12 * s, -29 * s, bob + sy * 64 * s * fp], 2.6 * s, P.deep); lkLN(ctx, [-6 * s, bob + sy * 12 * s, -50 * s, bob + sy * 47 * s * fp], 2.6 * s, P.deep);   /* wing spars */
      ctx.strokeStyle = d.pale; ctx.lineWidth = Math.max(1.2, 2 * s * 0.8); ctx.globalAlpha = 0.5 + 0.3 * Math.sin(t * 4); ctx.beginPath(); for (let k = 1; k <= 4; k++){ ctx.moveTo(-6 * s, bob + sy * 12 * s); ctx.lineTo((-14 - k * 9) * s, bob + sy * (22 + k * 10) * s * fp); } ctx.stroke(); ctx.globalAlpha = 1;
      csGlow(ctx, -30 * s, bob + sy * 40 * s, 24 * s, d.pale, 0.35);
    }
    csGlow(ctx, 0, bob, 40 * s, d.pale, 0.4);
    for (let i = 0; i < 2; i++){ const sy = i ? 1 : -1;                                                                /* four armored legs and two raking arms */
      lkLN(ctx, [-4 * s, bob + sy * 9 * s, -9 * s, bob + sy * 17 * s, -3 * s, bob + sy * 22 * s], 4.4 * s, P.deep); lkLN(ctx, [-4 * s, bob + sy * 9 * s, -9 * s, bob + sy * 17 * s, -3 * s, bob + sy * 22 * s], 2.4 * s, P.mid);
      lkLN(ctx, [6 * s, bob + sy * 9 * s, 14 * s, bob + sy * 16 * s, 24 * s, bob + sy * 13 * s], 4.4 * s, P.deep); lkLN(ctx, [6 * s, bob + sy * 9 * s, 14 * s, bob + sy * 16 * s, 24 * s, bob + sy * 13 * s], 2.4 * s, b);
      ctx.fillStyle = AL9_BONE; ctx.beginPath(); for (let k = -1; k <= 1; k++){ ctx.moveTo(23.4 * s, bob + sy * 13 * s + k * 2.2 * s - 1.2 * s); ctx.lineTo(30 * s, bob + sy * 13 * s + k * 3.6 * s); ctx.lineTo(23.4 * s, bob + sy * 13 * s + k * 2.2 * s + 1.2 * s); ctx.closePath(); } ctx.fill(); }
    lkOV(ctx, 0, bob, 21.4 * s, 16.4 * s, P.deep); lkOV(ctx, 0, bob, 20 * s, 15 * s, dk); lkOV(ctx, 0, bob, 17 * s, 12 * s, b);
    ctx.globalAlpha = 0.45; lkOV(ctx, -3 * s, bob - 4.6 * s, 10 * s, 3.6 * s, P.hi, -0.1); ctx.globalAlpha = 1;
    ctx.strokeStyle = P.lo; ctx.lineWidth = Math.max(1.2, 2 * s); ctx.beginPath(); for (let k = 0; k < 4; k++){ const x = (-12 + k * 5) * s, h = 11 * s * Math.sqrt(1 - Math.pow((x / s) / 18, 2)); ctx.moveTo(x, bob - h); ctx.quadraticCurveTo(x + 3 * s, bob, x, bob + h); } ctx.stroke();
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.strokeStyle = d.pale; ctx.lineWidth = 2.4 * s * 0.8; ctx.beginPath(); ctx.moveTo(-12 * s, bob - 6 * s); ctx.lineTo(-2 * s, bob); ctx.lineTo(-10 * s, bob + 7 * s); ctx.stroke();
    ctx.strokeStyle = P.hot; ctx.lineWidth = Math.max(0.8, 0.9 * s); ctx.stroke(); ctx.lineCap = 'butt'; ctx.lineJoin = 'miter';
    lkTRI(ctx, 3 * s, bob, 8 * s, bob - 4 * s, 8 * s, bob + 4 * s, P.deep); fillCircle(ctx, 4 * s, bob, 3 * s, P.deep); fillCircle(ctx, 4 * s, bob, 2 * s, d.pale); fillCircle(ctx, 3.4 * s, bob - 0.6 * s, 0.8 * s, P.hot);   /* a heart-gem */
    lkOV(ctx, 14 * s, bob, 10 * s, 9 * s, P.deep); lkOV(ctx, 14 * s, bob, 9 * s, 8 * s, b);
    ctx.globalAlpha = 0.5; lkOV(ctx, 12.4 * s, bob - 3.4 * s, 4.6 * s, 1.8 * s, P.hi, -0.1); ctx.globalAlpha = 1;
    for (let k = -2; k <= 2; k++) lkTRI(ctx, 13 * s, bob + k * 3.4 * s - 1.6 * s, 23 * s - Math.abs(k) * 2 * s, bob + k * 5 * s, 13 * s, bob + k * 3.4 * s + 1.6 * s, '#FFE090');   /* the crown */
    ctx.fillStyle = P.deep; ctx.beginPath(); for (let k = -2; k <= 2; k++){ ctx.moveTo(13 * s, bob + k * 3.4 * s - 0.6 * s); ctx.lineTo(20 * s - Math.abs(k) * 2 * s, bob + k * 4.8 * s); ctx.lineTo(13 * s, bob + k * 3.4 * s + 0.6 * s); ctx.closePath(); } ctx.fill();
    fillCircle(ctx, 14.4 * s, bob, 1.6 * s, d.pale);                                                                  /* the crown jewel */
    al9Eyes(ctx, 17 * s, bob, 3.2 * s, Math.max(1.4, 2 * s));
    if (e.state === 'cross' || e.state === 'wind') csGlow(ctx, 0, bob, 36 * s, e.state === 'cross' ? '#FF6A3A' : '#FFFFFF', 0.6);
  }
};


