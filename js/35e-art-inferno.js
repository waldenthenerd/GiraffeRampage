'use strict';
/* Enemy art, Chapter 10: the Inferno (INFERNO_DRAW). */
/* ======================== Chapter 10: the Inferno ======================== */
/* A different family of fire aliens from Chapter 9's smooth, magma-cracked ones: these are built of overlapping plates of
   cooled rock with glowing seams between them, and every one has its own silhouette and its own weapon. Seen from above,
   facing +x.
   Palette rules for this file: every body is body colour b over a darker same-hue dk, edged with an ASH-GREY rim (so dark
   rock still reads on the scorched ground), lit by one orange-yellow heat family (d.pale, then IN10_HOT, then IN10_CORE) and
   with bone-coloured (IN10_BONE) horns, teeth and claws. Eyes are always: dark socket, glowing iris, tiny white glint. */
const IN10_BONE = '#E8D8B0', IN10_HOT = '#FFE9A8', IN10_CORE = '#FFF6D8', IN10_SOCK = '#1A0A06', IN10_ASH = '#CDBFB2';
const IN10_PLATES = [[0, 0, 9.5, 12], [-4, -8, 6, 5.5], [-4, 8, 6, 5.5], [5, -7, 5, 4.5], [5, 7, 5, 4.5], [-9.5, 0, 4.4, 6.4]];
const IN10_SHARDS = [[-16, -4, -9, -12, -3, -8, -6, -1], [-16, 4, -6, 1, -3, 8, -9, 12], [-2, -9, 4, -14, 10, -9, 6, -3], [-2, 9, 6, 3, 10, 9, 4, 14], [-8, -3, -2, -1, -8, 3, -13, 0], [4, -2, 11, -3, 11, 3, 4, 2]];
const IN10_MC = {}; let in10_mn = 0;
/* blendHex with a small cache (the same few colours are asked for every frame) */
function in10_mix(a, c, t){
  const k = a + c + t; let v = IN10_MC[k];
  if (v === undefined){ if (++in10_mn > 500){ for (const q in IN10_MC) delete IN10_MC[q]; in10_mn = 0; } v = IN10_MC[k] = blendHex(a, c, t); }
  return v;
}
function in10_rim(dk){ return in10_mix(dk, IN10_ASH, 0.5); }      /* the ash-grey edge that keeps dark rock readable */
function in10_hi(b){ return in10_mix(b, '#FFE4C4', 0.3); }        /* a lighter face of the same rock */
function in10_deep(b){ return in10_mix(b, '#14100E', 0.32); }     /* a darker, same-hue shade */
/* strokes the path already built on ctx as a glowing crack: wide soft halo, bright body, white-hot core */
function in10_crack(ctx, w, col, a){
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.strokeStyle = col; ctx.globalAlpha = a * 0.32; ctx.lineWidth = w * 2.6; ctx.stroke();
  ctx.globalAlpha = a; ctx.lineWidth = w; ctx.stroke();
  ctx.strokeStyle = IN10_HOT; ctx.lineWidth = Math.max(0.6, w * 0.38); ctx.stroke();
  ctx.globalAlpha = 1; ctx.lineCap = 'butt'; ctx.lineJoin = 'miter';
}
/* one armour plate: ash rim, dark edge, body face and a lit crescent */
function in10_plate(ctx, x, y, rx, ry, b, dk, rim, rot, hi){
  lkOV(ctx, x, y, rx + 1.2, ry + 1.2, rim, rot);
  lkOV(ctx, x, y, rx, ry, dk, rot);
  lkOV(ctx, x, y, rx * 0.82, ry * 0.8, b, rot);
  ctx.globalAlpha = 0.5; lkOV(ctx, x - rx * 0.1, y - ry * 0.3, rx * 0.5, ry * 0.26, hi || in10_hi(b), rot); ctx.globalAlpha = 1;
}
/* a spike with a dark edge */
function in10_spk(ctx, x1, y1, x2, y2, x3, y3, c, edge){
  ctx.fillStyle = c; ctx.strokeStyle = edge; ctx.lineWidth = 1; ctx.lineJoin = 'round';
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.lineTo(x3, y3); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.lineJoin = 'miter';
}
/* a curved, tapering horn along a quadratic curve, filled with col */
function in10_horn(ctx, x0, y0, cx, cy, x1, y1, w, col){
  ctx.fillStyle = col; ctx.beginPath();
  for (let i = 0; i <= 5; i++){
    const t = i / 5, u = 1 - t, x = u * u * x0 + 2 * u * t * cx + t * t * x1, y = u * u * y0 + 2 * u * t * cy + t * t * y1;
    const dx = 2 * u * (cx - x0) + 2 * t * (x1 - cx), dy = 2 * u * (cy - y0) + 2 * t * (y1 - cy), l = Math.hypot(dx, dy) || 1, hw = w * 0.5 * (1 - t * 0.93);
    if (i === 0) ctx.moveTo(x - dy / l * hw, y + dx / l * hw); else ctx.lineTo(x - dy / l * hw, y + dx / l * hw);
  }
  for (let i = 5; i >= 0; i--){
    const t = i / 5, u = 1 - t, x = u * u * x0 + 2 * u * t * cx + t * t * x1, y = u * u * y0 + 2 * u * t * cy + t * t * y1;
    const dx = 2 * u * (cx - x0) + 2 * t * (x1 - cx), dy = 2 * u * (cy - y0) + 2 * t * (y1 - cy), l = Math.hypot(dx, dy) || 1, hw = w * 0.5 * (1 - t * 0.93);
    ctx.lineTo(x + dy / l * hw, y - dx / l * hw);
  }
  ctx.closePath(); ctx.fill();
}
/* a horn drawn as dark edge + bone + a thin lit stripe */
function in10_bhorn(ctx, x0, y0, cx, cy, x1, y1, w, edge){
  in10_horn(ctx, x0, y0, cx, cy, x1, y1, w + 1.8, edge);
  in10_horn(ctx, x0, y0, cx, cy, x1, y1, w, IN10_BONE);
  in10_horn(ctx, x0, y0 - w * 0.12, cx, cy - w * 0.1, x1, y1, w * 0.34, '#FFF4DC');
}
/* a teardrop flame pointing along ang */
function in10_fl(ctx, x, y, ang, len, w, c1, c2){
  ctx.save(); ctx.translate(x, y); ctx.rotate(ang);
  ctx.fillStyle = c1; ctx.beginPath(); ctx.moveTo(0, -w); ctx.quadraticCurveTo(len * 0.55, -w * 0.9, len, 0); ctx.quadraticCurveTo(len * 0.55, w * 0.9, 0, w); ctx.closePath(); ctx.fill();
  ctx.fillStyle = c2; ctx.beginPath(); ctx.moveTo(0, -w * 0.5); ctx.quadraticCurveTo(len * 0.4, -w * 0.45, len * 0.66, 0); ctx.quadraticCurveTo(len * 0.4, w * 0.45, 0, w * 0.5); ctx.closePath(); ctx.fill();
  ctx.restore();
}
/* eye: dark socket, glowing iris, tiny glint */
function in10_eye(ctx, x, y, r, pale){
  ctx.globalAlpha = 0.28; fillCircle(ctx, x, y, r * 2.7, pale); ctx.globalAlpha = 1;
  fillCircle(ctx, x, y, r * 1.55, IN10_SOCK); fillCircle(ctx, x, y, r * 1.02, pale); fillCircle(ctx, x + r * 0.28, y - r * 0.3, r * 0.4, '#FFFFFF');
}
/* the plated rock body shared by the humanoid Inferno creatures */
function in10_body(ctx, b, dk, pale, s, bob, e){
  const f = 0.7 + 0.3 * Math.sin(((e && e.anim) || 0) * 0.8), rim = in10_rim(dk), hi = in10_hi(b), P = IN10_PLATES, rw = Math.max(1, 1.25 * s);
  csGlow(ctx, 0, bob, 19 * s, pale, 0.22 + 0.08 * f);
  lkOV(ctx, 0, bob, 12.8 * s, 14.8 * s, 'rgba(24,6,2,.5)');
  for (let i = 0; i < P.length; i++){ const p = P[i]; lkOV(ctx, p[0] * s, bob + p[1] * s, p[2] * s + rw, p[3] * s + rw, rim); }
  for (let i = 0; i < P.length; i++){ const p = P[i]; lkOV(ctx, p[0] * s, bob + p[1] * s, p[2] * s, p[3] * s, dk); }
  for (let i = 0; i < P.length; i++){ const p = P[i]; lkOV(ctx, p[0] * s, bob + p[1] * s, p[2] * s * 0.82, p[3] * s * 0.82, b); }
  ctx.globalAlpha = 0.5;
  for (let i = 0; i < 3; i++){ const p = P[i]; lkOV(ctx, p[0] * s - p[2] * s * 0.12, bob + p[1] * s - p[3] * s * 0.34, p[2] * s * 0.5, p[3] * s * 0.24, hi); }
  ctx.globalAlpha = 1;
  const pit = in10_deep(dk);
  for (let i = 0; i < 4; i++) fillCircle(ctx, (-6 + i * 4.4) * s, bob + (i % 2 ? 6.4 : -6.4) * s, 0.9 * s, pit);       /* pits in the rock */
  ctx.beginPath();
  ctx.moveTo(-8 * s, bob - 4 * s); ctx.lineTo(-3 * s, bob - 3.2 * s); ctx.lineTo(2 * s, bob - 4.6 * s); ctx.lineTo(8 * s, bob - 3 * s);
  ctx.moveTo(-8 * s, bob + 4 * s); ctx.lineTo(-2 * s, bob + 3.4 * s); ctx.lineTo(3 * s, bob + 4.8 * s); ctx.lineTo(8 * s, bob + 3 * s);
  ctx.moveTo(0, bob - 11 * s); ctx.lineTo(0.8 * s, bob - 5 * s); ctx.lineTo(-0.5 * s, bob); ctx.lineTo(0.8 * s, bob + 5 * s); ctx.lineTo(0, bob + 11 * s);
  in10_crack(ctx, Math.max(1, 1.2 * s), pale, 0.62 + 0.3 * f);
  ctx.globalAlpha = 0.5 + 0.4 * f; fillCircle(ctx, 0, bob, 2.4 * s, pale); ctx.globalAlpha = 1; fillCircle(ctx, 0, bob, 1.1 * s, IN10_CORE);   /* the ember heart */
}
function rockEyes(ctx, pale, x, bob, gap, r){ for (const sy of [-1, 1]) in10_eye(ctx, x, bob + sy * gap, r, pale); }
/* weapons (own copies, so this chapter does not depend on the Chapter 9 helpers) */
function in10_blade(ctx, s, wind, pale){
  ctx.fillStyle = '#2A1A12'; ctx.fillRect(-7 * s, -2 * s, 9.5 * s, 4 * s);                                  /* the grip, with wrapped bands */
  ctx.strokeStyle = '#9A6A3A'; ctx.lineWidth = Math.max(1, s * 0.8); ctx.beginPath(); for (let k = 0; k < 4; k++){ ctx.moveTo((-6 + k * 2.2) * s, -2 * s); ctx.lineTo((-5 + k * 2.2) * s, 2 * s); } ctx.stroke();
  fillCircle(ctx, -8.4 * s, 0, 2.5 * s, '#5A3A22'); fillCircle(ctx, -8.4 * s, 0, 1.4 * s, pale);              /* the glowing pommel */
  lkTRI(ctx, 2 * s, -2 * s, 6 * s, -9 * s, 7.4 * s, -2 * s, '#B8885A'); lkTRI(ctx, 2 * s, 2 * s, 6 * s, 9 * s, 7.4 * s, 2 * s, '#B8885A');   /* the swept guard */
  ctx.fillStyle = '#3A2418'; ctx.beginPath(); ctx.moveTo(4 * s, -3.6 * s); ctx.lineTo(31 * s, -3.2 * s); ctx.lineTo(43 * s, 0); ctx.lineTo(31 * s, 3.2 * s); ctx.lineTo(4 * s, 3.6 * s); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#F2C27A'; ctx.beginPath(); ctx.moveTo(5 * s, -2.5 * s); ctx.lineTo(31 * s, -2.1 * s); ctx.lineTo(40.5 * s, 0); ctx.lineTo(31 * s, 2.1 * s); ctx.lineTo(5 * s, 2.5 * s); ctx.closePath(); ctx.fill();
  for (let k = 0; k < 5; k++){ const bx = (9 + k * 5) * s; lkTRI(ctx, bx, -3 * s, bx + 2.4 * s, -5 * s, bx + 3.8 * s, -3 * s, '#FFD890'); }   /* the saw edge */
  lkLN(ctx, [8 * s, 0, 36 * s, 0], 1.6 * s, '#FF8A1E'); lkLN(ctx, [12 * s, 0, 34 * s, 0], 0.7 * s, IN10_CORE);   /* the molten fuller */
}
function in10_cannon(ctx, s, y, len, pale, dk, rim){
  ctx.fillStyle = rim; ctx.fillRect(2.4 * s, y - 4.6 * s, 11.6 * s, 9.2 * s);
  ctx.fillStyle = '#2A1410'; ctx.fillRect(3.2 * s, y - 3.8 * s, 10 * s, 7.6 * s);                              /* the housing */
  ctx.fillStyle = '#5A3418'; ctx.fillRect(3.2 * s, y - 3.8 * s, 10 * s, 1.5 * s);
  fillCircle(ctx, 8 * s, y - 5.2 * s, 3.4 * s, '#4A1A0A'); fillCircle(ctx, 8 * s, y - 5.2 * s, 2.2 * s, '#FF7A1E'); fillCircle(ctx, 7.4 * s, y - 5.8 * s, 0.8 * s, IN10_CORE);   /* the slag tank */
  lkLN(ctx, [13 * s, y, len, y], 4.4 * s, rim); lkLN(ctx, [13 * s, y, len, y], 3.2 * s, '#3A241A');            /* the barrel */
  for (let i = 0; i < 3; i++){ const bx = 14 * s + (len - 14 * s) * (0.18 + i * 0.28); ctx.fillStyle = '#7A4A1C'; ctx.fillRect(bx, y - 3 * s, 1.5 * s, 6 * s); }   /* cooling rings */
  lkLN(ctx, [13 * s, y + 2.4 * s, len - 4 * s, y + 2.4 * s], 1.1 * s, pale);                                  /* coolant line */
  lkTRI(ctx, len - 3 * s, y - 3.6 * s, len + 3.4 * s, y, len - 3 * s, y + 3.6 * s, '#2A1410');                 /* the flared muzzle */
  ctx.strokeStyle = pale; ctx.lineWidth = Math.max(1, s * 0.9); ctx.globalAlpha = 0.85; ctx.beginPath(); ctx.arc(len + 1 * s, y, 2.8 * s, -1.2, 1.2); ctx.stroke(); ctx.globalAlpha = 1;
}
const INFERNO_DRAW = {
  cinderimp(ctx, e, b, dk, bob, wind, d){
    const s = e.r / 14, rim = in10_rim(dk), hi = in10_hi(b), pale = d.pale, sw = Math.sin(e.anim * 1.7), fl = Math.sin(G.time * 16 + e.x * 0.05);
    /* a barbed tail ending in a flame */
    const tx = -21 * s, ty = bob + sw * 3.6 * s;
    lkCV(ctx, -9 * s, bob, -15 * s, bob + sw * 2.4 * s, tx, ty, 3.8 * s, rim); lkCV(ctx, -9 * s, bob, -15 * s, bob + sw * 2.4 * s, tx, ty, 2.5 * s, dk);
    lkCV(ctx, -9 * s, bob, -15 * s, bob + sw * 2.4 * s, tx, ty, 1 * s, b);
    const by = bob + sw * 2.1 * s; lkTRI(ctx, -13.6 * s, by - 1 * s, -17 * s, by - 4.6 * s, -16.4 * s, by - 0.4 * s, IN10_BONE); lkTRI(ctx, -13.6 * s, by + 1 * s, -17 * s, by + 4.6 * s, -16.4 * s, by + 0.4 * s, IN10_BONE);
    csGlow(ctx, tx, ty, 9 * s, pale, 0.6); in10_fl(ctx, tx + 0.5 * s, ty, Math.PI + 0.2 * sw, (7.5 + fl * 1.6) * s, 3.2 * s, pale, IN10_HOT);
    for (const sy of [-1, 1]){                                                                                 /* stepping feet */
      const fx = (-5 + sy * sw * 2.6) * s, fy = bob + sy * 11.8 * s;
      lkLN(ctx, [-3 * s, bob + sy * 6 * s, fx, fy], 4.2 * s, rim); lkLN(ctx, [-3 * s, bob + sy * 6 * s, fx, fy], 2.9 * s, dk); lkOV(ctx, fx + 0.6 * s, fy + sy * 0.6 * s, 2.6 * s, 1.9 * s, b);
    }
    in10_body(ctx, b, dk, pale, s * 0.9, bob, e);
    for (const sy of [-1, 1]){
      lkTRI(ctx, 5 * s, bob + sy * 3.6 * s, 2.6 * s, bob + sy * 9.4 * s, 8.4 * s, bob + sy * 4.6 * s, rim);                    /* pointed ears */
      lkTRI(ctx, 5.2 * s, bob + sy * 3.9 * s, 3.2 * s, bob + sy * 8.4 * s, 7.8 * s, bob + sy * 4.5 * s, pale);
    }
    in10_plate(ctx, 7 * s, bob, 5.9 * s, 5.3 * s, b, dk, rim, 0, hi);
    for (const sy of [-1, 1]) lkTRI(ctx, 8 * s, bob + sy * 3.2 * s, 14.4 * s, bob + sy * 6.4 * s, 10 * s, bob + sy * 1.8 * s, IN10_BONE);   /* little horns */
    rockEyes(ctx, pale, 10 * s, bob, 2.4 * s, 1.15 * s);
    ctx.strokeStyle = pale; ctx.lineWidth = Math.max(1, 1.5 * s); ctx.beginPath(); ctx.arc(11.4 * s, bob, 3 * s, -0.9, 0.9); ctx.stroke();       /* a grin */
    for (const sy of [-1, 1]) lkTRI(ctx, 13.6 * s, bob + sy * 2 * s, 14.8 * s, bob + sy * 2.6 * s, 13.2 * s, bob + sy * 3.2 * s, IN10_CORE);   /* fangs */
    for (const sy of [-1, 1]){
      const reach = wind ? 17 : 11, ay = bob + sy * 7 * s;
      fillCircle(ctx, 3 * s, bob + sy * 9.4 * s, 3.1 * s, rim); fillCircle(ctx, 3 * s, bob + sy * 9.4 * s, 2.4 * s, dk);
      lkLN(ctx, [3 * s, bob + sy * 9 * s, reach * s, ay], 4.2 * s, rim); lkLN(ctx, [3 * s, bob + sy * 9 * s, reach * s, ay], 3 * s, dk);
      fillCircle(ctx, reach * s, ay, 2 * s, b);
      for (let k = -1; k <= 1; k++) lkLN(ctx, [reach * s, ay, (reach + 4.4) * s, ay + k * 2.2 * s], 1.3 * s, IN10_BONE);
    }
    if (wind) csGlow(ctx, 17 * s, bob, 14 * s, pale, 0.8);
  },
  magmahopper(ctx, e, b, dk, bob, wind, d){
    const s = e.r / 14, z = e.z || 0, up = e.state === 'air' || wind, rim = in10_rim(dk), hi = in10_hi(b), pale = d.pale;
    if (up) for (const sy of [-1, 1]){ csGlow(ctx, -10 * s, bob + sy * 6 * s, 14 + z * 0.1, '#FF8A1E', 0.8); lkTRI(ctx, -8 * s, bob + sy * 4 * s - 2 * s, -22 * s - z * 0.12, bob + sy * 6 * s, -8 * s, bob + sy * 4 * s + 2 * s, '#FFE070'); }
    ctx.translate(0, -z);
    for (const sy of [-1, 1]){
      const kx = (up ? -10 : -13) * s, ky = bob + sy * (up ? 9 : 14) * s, fx = (up ? -22 : -6) * s, fy = bob + sy * (up ? 12 : 17.5) * s;
      lkLN(ctx, [-3 * s, bob + sy * 6 * s, kx, ky, fx, fy], 6.6 * s, rim); lkLN(ctx, [-3 * s, bob + sy * 6 * s, kx, ky, fx, fy], 5 * s, dk);   /* big back legs: thigh and shin */
      lkLN(ctx, [-3.6 * s, bob + sy * 6 * s, kx, ky], 2.4 * s, b);
      for (let k = -1; k <= 1; k++) lkLN(ctx, [fx, fy, fx + (up ? -3.6 : 3.6) * s, fy + sy * 1.2 * s + k * 2.2 * s], 1.5 * s, rim);   /* splayed toes */
      lkLN(ctx, [4 * s, bob + sy * 7 * s, 11 * s, bob + sy * 10.5 * s], 4.4 * s, rim); lkLN(ctx, [4 * s, bob + sy * 7 * s, 11 * s, bob + sy * 10.5 * s], 3 * s, dk);
    }
    lkOV(ctx, 0, bob, 12.6 * s, 10.5 * s, rim); lkOV(ctx, 0, bob, 11.5 * s, 9.5 * s, dk); lkOV(ctx, 0, bob, 10 * s, 8 * s, b);
    ctx.globalAlpha = 0.5; lkOV(ctx, -1 * s, bob - 3.6 * s, 6 * s, 2.4 * s, hi); ctx.globalAlpha = 1;
    csGlow(ctx, 0, bob, 8 * s, pale, 0.5);
    const mot = [[-5, -2.4, 2.4, 1.7], [-1, 3.6, 2.6, 1.9], [3, -4.2, 2.2, 1.5], [-7.2, 3, 1.8, 1.4]];
    for (let i = 0; i < mot.length; i++){ const m = mot[i]; lkOV(ctx, m[0] * s, bob + m[1] * s, m[2] * s, m[3] * s, in10_deep(b), i * 0.7); }   /* mottling */
    for (let i = 0; i < 3; i++) fillCircle(ctx, (-3 + i * 3.4) * s, bob + (i === 1 ? -1.2 : 1.3) * s, 0.9 * s, IN10_HOT);
    ctx.beginPath(); ctx.moveTo(-9 * s, bob); ctx.lineTo(-4 * s, bob - 0.8 * s); ctx.lineTo(1 * s, bob + 0.7 * s); ctx.lineTo(7 * s, bob); in10_crack(ctx, Math.max(1, 1.1 * s), pale, 0.8);
    ctx.strokeStyle = dk; ctx.lineWidth = Math.max(1, 1.2 * s); ctx.beginPath(); ctx.arc(2 * s, bob, 9.2 * s, -0.55, 0.55); ctx.stroke();    /* the wide mouth line */
    for (const sy of [-1, 1]){
      fillCircle(ctx, 6.6 * s, bob + sy * 5.6 * s, 3.7 * s, rim); fillCircle(ctx, 6.6 * s, bob + sy * 5.6 * s, 3.2 * s, dk); fillCircle(ctx, 6.4 * s, bob + sy * 5.4 * s, 2.5 * s, b);   /* bulging eye domes */
      fillCircle(ctx, 7 * s, bob + sy * 5.6 * s, 1.7 * s, pale); lkOV(ctx, 7.2 * s, bob + sy * 5.6 * s, 0.6 * s, 1.4 * s, IN10_SOCK); fillCircle(ctx, 7.6 * s, bob + sy * 4.9 * s, 0.5 * s, '#FFFFFF');
      fillCircle(ctx, 10.4 * s, bob + sy * 1.8 * s, 0.7 * s, dk);
    }
  },
  slagram(ctx, e, b, dk, bob, wind, d){
    const s = e.r / 13, rim = in10_rim(dk), hi = in10_hi(b), pale = d.pale, st = Math.sin(e.anim * 1.4);
    for (const sy of [-1, 1]) for (const hx of [-10, 7]){                                                      /* hooves poking out from under the shell */
      const px = (hx + sy * st * (hx < 0 ? -1.2 : 1.2)) * s;
      lkOV(ctx, px, bob + sy * 16.6 * s, 4.4 * s, 3.2 * s, rim); lkOV(ctx, px, bob + sy * 16.6 * s, 3.6 * s, 2.5 * s, dk); fillCircle(ctx, px + 1 * s, bob + sy * 17.4 * s, 1 * s, pale);
    }
    in10_body(ctx, b, dk, pale, s * 1.15, bob, e);
    for (const sy of [-1, 1]) for (let k = 0; k < 3; k++){                                                     /* shoulder spikes */
      const px = (-8 + k * 6) * s, py = bob + sy * 15.4 * s;
      in10_spk(ctx, px - 2.4 * s, py, px + 0.6 * s, py + sy * (6 + (k === 1 ? 2 : 0)) * s, px + 2.6 * s, py - sy * 0.4 * s, IN10_BONE, rim);
    }
    const fp =in10_mix(dk, '#3A2A2E', 0.5);
    ctx.fillStyle = fp; ctx.strokeStyle = rim; ctx.lineWidth = Math.max(1, 1.4 * s * 0.8); ctx.lineJoin = 'round';
    ctx.beginPath(); ctx.moveTo(11 * s, bob - 16 * s); ctx.lineTo(20 * s, bob - 11 * s); ctx.lineTo(20 * s, bob + 11 * s); ctx.lineTo(11 * s, bob + 16 * s); ctx.lineTo(14 * s, bob); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.lineJoin = 'miter';
    ctx.fillStyle = b; ctx.beginPath(); ctx.moveTo(13.4 * s, bob - 12 * s); ctx.lineTo(19 * s, bob - 8.6 * s); ctx.lineTo(19 * s, bob + 8.6 * s); ctx.lineTo(13.4 * s, bob + 12 * s); ctx.lineTo(15.4 * s, bob); ctx.closePath(); ctx.fill();
    ctx.globalAlpha = 0.45; lkTRI(ctx, 13.4 * s, bob - 12 * s, 19 * s, bob - 8.6 * s, 17.4 * s, bob - 4 * s, hi); ctx.globalAlpha = 1;
    ctx.beginPath(); ctx.moveTo(14.6 * s, bob - 10 * s); ctx.lineTo(18 * s, bob - 3 * s); ctx.lineTo(15.8 * s, bob + 3 * s); ctx.lineTo(18.4 * s, bob + 7.4 * s); in10_crack(ctx, Math.max(1, 1.2 * s), pale, 0.85);
    rockEyes(ctx, pale, 17.6 * s, bob, 5.6 * s, 1.1 * s);
    fillCircle(ctx, 19.6 * s, bob - 1.6 * s, 0.8 * s, pale); fillCircle(ctx, 19.6 * s, bob + 1.6 * s, 0.8 * s, pale);
    for (const sy of [-1, 1]){                                                                                 /* curling horns, in front of the faceplate */
      in10_horn(ctx, 6 * s, bob + sy * 10 * s, 14 * s, bob + sy * 28 * s, 27 * s, bob + sy * 14 * s, 8.4 * s, rim);
      in10_horn(ctx, 6 * s, bob + sy * 10 * s, 14 * s, bob + sy * 28 * s, 27 * s, bob + sy * 14 * s, 6.6 * s, IN10_BONE);
      in10_horn(ctx, 7 * s, bob + sy * 11 * s, 14 * s, bob + sy * 26 * s, 25 * s, bob + sy * 14.4 * s, 2.2 * s, '#FFF4DC');
      ctx.strokeStyle = '#9A8660'; ctx.lineWidth = Math.max(1, 1.1 * s); ctx.beginPath();
      for (let k = 1; k <= 3; k++){ const t = 0.14 + k * 0.17, u = 1 - t, hx = u * u * 6 + 2 * u * t * 14 + t * t * 27, hy = u * u * 10 + 2 * u * t * 28 + t * t * 14; ctx.moveTo(hx * s - 1.4 * s, bob + sy * (hy - 2.6) * s); ctx.lineTo(hx * s + 1.4 * s, bob + sy * (hy + 2.6) * s); }
      ctx.stroke();
    }
    if (wind) csGlow(ctx, 20 * s, bob, 24 * s, '#FFFFFF', 0.6);
  },
  magmacocoon(ctx, e, b, dk, bob, wind, d){
    if (e.state === 'fall') return;
    const r = e.r, hatch = e.stateT < 1.0, sh = hatch ? Math.sin(e.anim * 30) * 1.6 : 0, f = Math.sin(e.anim * (hatch ? 9 : 3)) > 0.3, rim = in10_rim(dk), hi = in10_hi(b), pale = d.pale;
    ctx.translate(sh, 0); csGlow(ctx, 0, 0, r + 16, '#FF7A1E', 0.3 + (f ? 0.2 : 0));
    const L = [[-0.3, -0.45, 0.8], [-0.3, 0.45, 0.8], [0.35, 0, 0.95]];
    for (let i = 0; i < 3; i++){ const p = L[i]; lkOV(ctx, p[0] * r, p[1] * r, r * p[2] + 3.4, r * p[2] * 1.05 + 3.4, rim); }
    for (let i = 0; i < 3; i++){ const p = L[i]; lkOV(ctx, p[0] * r, p[1] * r, r * p[2] + 2, r * p[2] * 1.05 + 2, dk); }
    for (let i = 0; i < 3; i++){ const p = L[i]; lkOV(ctx, p[0] * r, p[1] * r, r * p[2] - 1, r * p[2] * 1.02 - 1, b); }
    ctx.strokeStyle = in10_deep(dk); ctx.lineWidth = 1.5;
    for (let i = 0; i < 3; i++){                                                                               /* ridged husk bands */
      const p = L[i], cx = p[0] * r, cy = p[1] * r, rr = r * p[2];
      ctx.beginPath(); ctx.arc(cx, cy, rr * 0.7, 2.3, 4.0); ctx.moveTo(cx + Math.cos(0.3) * rr * 0.52, cy + Math.sin(0.3) * rr * 0.52); ctx.arc(cx, cy, rr * 0.52, 0.3, 1.5); ctx.stroke();
    }
    ctx.globalAlpha = 0.5;
    for (let i = 0; i < 3; i++){ const p = L[i]; lkOV(ctx, p[0] * r + r * p[2] * 0.12, p[1] * r - r * p[2] * 0.5, r * p[2] * 0.5, r * p[2] * 0.18, hi, 0.2); }
    ctx.globalAlpha = 1;
    const cc = f || hatch ? '#FFF0A0' : pale;
    ctx.beginPath();
    for (let k = 0; k < 6; k++){
      const a = k / 6 * TAU + 0.4, a2 = a + 0.2;
      ctx.moveTo(Math.cos(a) * r * 0.2, Math.sin(a) * r * 0.2); ctx.lineTo(Math.cos(a2) * r * 0.46, Math.sin(a2) * r * 0.46); ctx.lineTo(Math.cos(a2 - 0.14) * r * 0.7, Math.sin(a2 - 0.14) * r * 0.7);
      ctx.moveTo(Math.cos(a2) * r * 0.46, Math.sin(a2) * r * 0.46); ctx.lineTo(Math.cos(a2 + 0.34) * r * 0.58, Math.sin(a2 + 0.34) * r * 0.58);
    }
    in10_crack(ctx, 1.9, cc, 0.95);
    for (let k = 0; k < 3; k++){ const a = e.anim * 0.7 + k * 2.1; ctx.globalAlpha = f ? 0.9 : 0.5; fillCircle(ctx, Math.cos(a) * r * 1.05, Math.sin(a) * r * 1.0, 1.2, pale); }   /* drifting sparks */
    ctx.globalAlpha = 1;
    if (hatch) csGlow(ctx, 0, 0, r * 0.9, '#FFFFFF', 0.45);
  },
  cindergnat(ctx, e, b, dk, bob, wind, d){
    const s = e.r / 8, fl = Math.sin(G.time * 42 + e.x * 0.1), pale = d.pale, rim = in10_rim(dk);
    csGlow(ctx, 0, bob, 16 * s, pale, 0.35); fillCircle(ctx, -2 * s, bob, 11 * s, 'rgba(24,6,2,.45)');        /* a dark underlay, so a small flyer still stands out */
    for (const sy of [-1, 1]){                                                                                 /* two pairs of blurring wings */
      ctx.save(); ctx.translate(-1 * s, bob + sy * 4 * s); ctx.rotate(sy * (0.6 + fl * 0.45)); ctx.globalAlpha = 0.5;
      lkOV(ctx, 0, sy * 6 * s, 3.4 * s, 9 * s, '#FFD890'); lkLN(ctx, [0, sy * 1.5 * s, 0, sy * 13 * s], 0.7 * s, '#FF9A30'); ctx.globalAlpha = 1; ctx.restore();
      ctx.save(); ctx.translate(-3 * s, bob + sy * 3 * s); ctx.rotate(sy * (1.25 - fl * 0.4)); ctx.globalAlpha = 0.4; lkOV(ctx, 0, sy * 4 * s, 2.4 * s, 6.2 * s, '#FFC070'); ctx.globalAlpha = 1; ctx.restore();
    }
    for (const sy of [-1, 1]) for (let k = 0; k < 3; k++) lkLN(ctx, [(2 - k * 2.6) * s, bob + sy * 3 * s, (1.4 - k * 3) * s, bob + sy * (6.6 + k * 0.6) * s], 0.9 * s, rim);   /* dangling legs */
    lkOV(ctx, -6 * s, bob, 6.2 * s, 4 * s, rim); lkOV(ctx, -6 * s, bob, 5.4 * s, 3.3 * s, dk); lkOV(ctx, -6 * s, bob, 4.4 * s, 2.6 * s, pale);
    for (let k = 0; k < 2; k++) lkOV(ctx, (-8 + k * 3.6) * s, bob, 0.8 * s, 2.7 * s, dk);                      /* banded abdomen */
    lkTRI(ctx, -11 * s, bob - 1.4 * s, -17.5 * s, bob, -11 * s, bob + 1.4 * s, IN10_BONE);
    fillCircle(ctx, 1 * s, bob, 5.7 * s, rim); fillCircle(ctx, 1 * s, bob, 5 * s, dk); fillCircle(ctx, 1 * s, bob, 4 * s, b); fillCircle(ctx, 0.2 * s, bob - 1.4 * s, 1.8 * s, in10_hi(b));
    fillCircle(ctx, 5.6 * s, bob, 3 * s, dk);
    for (const sy of [-1, 1]) lkCV(ctx, 7 * s, bob + sy * 1 * s, 10 * s, bob + sy * 2.4 * s, 11.4 * s, bob + sy * 4.6 * s, 0.8 * s, rim);    /* antennae */
    for (const sy of [-1, 1]){ fillCircle(ctx, 4.6 * s, bob + sy * 2 * s, 1.7 * s, '#FFFFFF'); fillCircle(ctx, 4.9 * s, bob + sy * 2 * s, 0.95 * s, IN10_SOCK); }
    if (wind) csGlow(ctx, 6 * s, bob, 14 * s, '#FFFFFF', 0.8);
  },
  spikecharger(ctx, e, b, dk, bob, wind, d){
    const s = e.r / 16, dash = e.state === 'dash', rim = in10_rim(dk), hi = in10_hi(b), pale = d.pale, ph = Math.sin(e.anim * (dash ? 3 : 2.2));
    if (dash) for (let k = 1; k <= 4; k++) csGlow(ctx, -k * 14 * s, bob, 15 * s, '#FF8A1E', 0.5 - k * 0.1);
    for (const sx of [-9, 5]) for (const sy of [-1, 1]){                                                       /* jointed legs */
      const sw = (sx < 0 ? 1 : -1) * sy * ph, kx = (sx + (dash ? -3 : 1)) * s, fx = (sx + (dash ? -6 : 3) + sw * 2.4) * s;
      lkLN(ctx, [sx * s, bob + sy * 5 * s, kx, bob + sy * 9.6 * s, fx, bob + sy * 12.8 * s], 3.8 * s, rim); lkLN(ctx, [sx * s, bob + sy * 5 * s, kx, bob + sy * 9.6 * s, fx, bob + sy * 12.8 * s], 2.5 * s, dk);
    }
    lkTRI(ctx, -14 * s, bob - 2 * s, -24 * s, bob, -14 * s, bob + 2 * s, rim); lkTRI(ctx, -14.4 * s, bob - 1.2 * s, -22 * s, bob, -14.4 * s, bob + 1.2 * s, IN10_BONE);   /* tail spike */
    lkOV(ctx, -2 * s, bob, 16.4 * s, 9.8 * s, rim); lkOV(ctx, -2 * s, bob, 15 * s, 8.5 * s, dk); lkOV(ctx, -2 * s, bob, 13.4 * s, 7 * s, b);
    ctx.globalAlpha = 0.45; lkOV(ctx, -3 * s, bob - 3.6 * s, 9 * s, 2 * s, hi); ctx.globalAlpha = 1;
    ctx.strokeStyle = in10_deep(dk); ctx.lineWidth = Math.max(1, 1.3 * s); ctx.beginPath();
    for (let k = 0; k < 4; k++){ const x = (-10 + k * 4.6) * s; ctx.moveTo(x, bob - 6.2 * s); ctx.quadraticCurveTo(x + 1.6 * s, bob, x, bob + 6.2 * s); } ctx.stroke();   /* carapace segments */
    ctx.beginPath(); ctx.moveTo(-14 * s, bob); ctx.lineTo(-6 * s, bob - 0.7 * s); ctx.lineTo(1 * s, bob + 0.7 * s); ctx.lineTo(8 * s, bob); in10_crack(ctx, Math.max(1, 1.1 * s), pale, 0.8);
    for (let k = 0; k < 5; k++){
      const x = (-10 + k * 4) * s, wob = Math.sin(G.time * 14 + k) * 1.5;
      for (const sy of [-1, 1]) in10_spk(ctx, x, bob + sy * 5.2 * s, x - 2 * s, bob + sy * (11 * s + wob), x + 3 * s, bob + sy * 5.2 * s, k % 2 ? IN10_BONE : pale, rim);
    }
    in10_plate(ctx, 14 * s, bob, 5.6 * s, 4.8 * s, b, dk, rim, 0, hi);
    for (const sy of [-1, 1]){ lkTRI(ctx, 12 * s, bob + sy * 3.6 * s, 11 * s, bob + sy * 8 * s, 16.4 * s, bob + sy * 4.6 * s, rim); lkTRI(ctx, 12.4 * s, bob + sy * 4 * s, 12 * s, bob + sy * 7.4 * s, 15.6 * s, bob + sy * 4.7 * s, dk); }   /* cheek guards */
    /* the lance: a long ridged horn that glows toward its tip */
    const hy = bob, base = 17 * s;
    lkTRI(ctx, base - 1 * s, hy - 4.2 * s, 47 * s, hy, base - 1 * s, hy + 4.2 * s, rim);
    lkTRI(ctx, base, hy - 3.2 * s, 45 * s, hy, base, hy + 3.2 * s, IN10_BONE);
    lkTRI(ctx, base + 1 * s, hy - 1.2 * s, 43 * s, hy - 0.2 * s, base + 1 * s, hy + 0.4 * s, '#FFF4DC');
    lkTRI(ctx, 33 * s, hy - 1.15 * s, 46.4 * s, hy, 33 * s, hy + 1.15 * s, pale);
    ctx.strokeStyle = '#9A8660'; ctx.lineWidth = Math.max(1, 1.1 * s); ctx.beginPath();
    for (let k = 0; k < 4; k++){ const x = (21 + k * 4.4) * s, w = (3.2 - k * 0.62) * s; ctx.moveTo(x, hy - w); ctx.lineTo(x + 1.2 * s, hy + w); } ctx.stroke();
    ctx.fillStyle = in10_deep(dk); ctx.fillRect(base - 1.4 * s, hy - 4.4 * s, 3.4 * s, 8.8 * s);
    rockEyes(ctx, pale, 15.6 * s, bob, 2.5 * s, 1 * s); csGlow(ctx, 44 * s, bob, wind ? 22 : dash ? 20 : 9, wind ? '#FFFFFF' : pale, wind ? 0.95 : 0.6);
  },
  bladewhirl(ctx, e, b, dk, bob, wind, d){
    const s = e.r / 14, spin = e.state === 'spin', rim = in10_rim(dk), hi = in10_hi(b), pale = d.pale, a0 = spin ? G.time * 9 : 0.4 + Math.sin(e.anim * 0.6) * 0.12;
    if (spin) csGlow(ctx, 0, bob, 34 * s, pale, 0.35);
    for (let k = 0; k < 4; k++){
      ctx.save(); ctx.rotate(a0 + k * Math.PI / 2);
      lkTRI(ctx, 5.6 * s, bob - 4 * s, 25.4 * s, bob, 5.6 * s, bob + 4 * s, rim);                              /* edge */
      lkTRI(ctx, 6.6 * s, bob - 3 * s, 23.6 * s, bob, 6.6 * s, bob + 3 * s, IN10_BONE);                         /* blade */
      for (let j = 0; j < 3; j++){ const x0 = 9 + j * 4.6, w0 = 3 * (1 - (x0 - 6.6) / 17), w1 = 3 * (1 - (x0 + 3 - 6.6) / 17); lkTRI(ctx, x0 * s, bob + w0 * s, (x0 - 0.8) * s, bob + (w0 + 2.6) * s, (x0 + 3) * s, bob + w1 * s, IN10_BONE); }   /* barbs */
      lkTRI(ctx, 9 * s, bob - 1.1 * s, 21 * s, bob, 9 * s, bob + 1.1 * s, pale);                               /* the hot core */
      ctx.restore();
    }
    fillCircle(ctx, 0, bob, 11 * s, 'rgba(24,6,2,.5)'); fillCircle(ctx, 0, bob, 10 * s, rim); fillCircle(ctx, 0, bob, 9 * s, dk); fillCircle(ctx, 0, bob, 7.6 * s, b);
    ctx.globalAlpha = 0.5; lkOV(ctx, -1.4 * s, bob - 4 * s, 4.2 * s, 1.8 * s, hi); ctx.globalAlpha = 1;
    for (let k = 0; k < 4; k++){ const a = a0 + k * Math.PI / 2 + Math.PI / 4; fillCircle(ctx, Math.cos(a) * 7.4 * s, bob + Math.sin(a) * 7.4 * s, 1.15 * s, dk); fillCircle(ctx, Math.cos(a) * 7.4 * s, bob + Math.sin(a) * 7.4 * s, 0.6 * s, pale); }   /* rivets */
    ctx.strokeStyle = pale; ctx.lineWidth = Math.max(1, 1.5 * s); ctx.beginPath(); ctx.arc(0, bob, 4.8 * s, 0, TAU); ctx.stroke(); csGlow(ctx, 0, bob, 7 * s, pale, 0.8);
    rockEyes(ctx, pale, 4 * s, bob, 2 * s, 1 * s);
    if (wind || spin){ ctx.strokeStyle = 'rgba(255,170,60,' + (spin ? 0.5 : 0.3) + ')'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(0, bob, 26 * s, 0, TAU); ctx.stroke(); }
  },
  sootshaman(ctx, e, b, dk, bob, wind, d){
    const s = e.r / 14, heal = e.healTgtT > 0, acc = heal ? '#7CFFB0' : d.pale, rim = in10_rim(dk), hi = in10_hi(b), t = G.time;
    csGlow(ctx, 0, bob, 24 * s, acc, 0.26);
    for (let k = 0; k < 3; k++){ ctx.globalAlpha = 0.34 - k * 0.08; fillCircle(ctx, (-14 - k * 5) * s, bob + Math.sin(t * 2 + k * 1.7) * 3.4 * s, (4.2 - k * 0.8) * s, '#4A3E3A'); } ctx.globalAlpha = 1;   /* drifting soot */
    lkOV(ctx, -2 * s, bob, 12.8 * s, 14.8 * s, rim); lkOV(ctx, -2 * s, bob, 11.5 * s, 13.5 * s, dk); lkOV(ctx, -2 * s, bob, 9.6 * s, 11.6 * s, b);
    for (let k = -2; k <= 2; k++) lkTRI(ctx, -11.4 * s, bob + k * 5.6 * s - 2.4 * s, -17 * s, bob + k * 5.6 * s + (k % 2 ? 1 : -1) * 0.8 * s, -11.4 * s, bob + k * 5.6 * s + 2.4 * s, dk);   /* a tattered hem */
    ctx.strokeStyle = dk; ctx.lineWidth = Math.max(1, 1.4 * s); ctx.beginPath(); for (let k = -2; k <= 2; k++){ ctx.moveTo(-10 * s, bob + k * 4.6 * s); ctx.lineTo(3 * s, bob + k * 2.4 * s); } ctx.stroke();
    ctx.globalAlpha = 0.4; lkOV(ctx, -4 * s, bob - 7 * s, 5 * s, 2 * s, hi, -0.3); ctx.globalAlpha = 1;
    ctx.strokeStyle = acc; ctx.lineWidth = Math.max(1, s); ctx.globalAlpha = 0.7; ctx.beginPath(); ctx.moveTo(-8 * s, bob - 7 * s); ctx.lineTo(-3 * s, bob - 1 * s); ctx.lineTo(-7 * s, bob + 4 * s); ctx.stroke(); ctx.globalAlpha = 1;   /* a glowing sigil */
    for (const sy of [-1, 1]){ in10_plate(ctx, 2 * s, bob + sy * 11 * s, 4 * s, 3.2 * s, b, dk, rim, 0, hi); in10_spk(ctx, 1 * s, bob + sy * 13.4 * s, -1.4 * s, bob + sy * 17.6 * s, 4 * s, bob + sy * 14 * s, IN10_BONE, rim); }   /* bone-spiked pauldrons */
    lkLN(ctx, [3 * s, bob - 11 * s, 10 * s, bob - 8 * s], 3.4 * s, rim); lkLN(ctx, [3 * s, bob - 11 * s, 10 * s, bob - 8 * s], 2.4 * s, dk); fillCircle(ctx, 10.6 * s, bob - 8 * s, 1.7 * s, b);
    fillCircle(ctx, 6 * s, bob, 7 * s, rim); fillCircle(ctx, 6 * s, bob, 6.2 * s, dk); fillCircle(ctx, 5.4 * s, bob, 5.4 * s, b);            /* the hood */
    for (const sy of [-1, 1]) in10_horn(ctx, 4 * s, bob + sy * 4.4 * s, 2 * s, bob + sy * 10 * s, 7.6 * s, bob + sy * 11.4 * s, 3.2 * s, IN10_BONE);
    lkOV(ctx, 7.6 * s, bob, 4.4 * s, 4.1 * s, '#1A0C08'); rockEyes(ctx, acc, 9.2 * s, bob, 1.8 * s, 1 * s);
    ctx.fillStyle = IN10_BONE; for (let k = -1; k <= 1; k++){ ctx.beginPath(); ctx.arc(1.6 * s, bob + k * 3.2 * s, 1 * s, 0, TAU); ctx.fill(); }   /* a bead necklace */
    /* the staff: a bound pole with a cradle and a floating flame orb */
    const sy2 = bob + 11 * s;
    lkLN(ctx, [3 * s, sy2, 23 * s, sy2], 3.2 * s, rim); lkLN(ctx, [3 * s, sy2, 23 * s, sy2], 2 * s, '#7A5230');
    ctx.strokeStyle = '#2A1410'; ctx.lineWidth = Math.max(1, 0.9 * s); ctx.beginPath(); for (let k = 0; k < 6; k++){ ctx.moveTo((5 + k * 3) * s, sy2 - 1.4 * s); ctx.lineTo((7 + k * 3) * s, sy2 + 1.4 * s); } ctx.stroke();
    lkTRI(ctx, 21 * s, sy2 - 1 * s, 29 * s, sy2 - 5.8 * s, 25 * s, sy2 - 0.6 * s, '#C8A878'); lkTRI(ctx, 21 * s, sy2 + 1 * s, 29 * s, sy2 + 5.8 * s, 25 * s, sy2 + 0.6 * s, '#C8A878');
    csGlow(ctx, 25.4 * s, sy2, 9 * s, acc, 0.6); fillCircle(ctx, 25.4 * s, sy2, 3.6 * s, acc); fillCircle(ctx, 25.4 * s, sy2, 1.8 * s, '#FFFFFF');
    for (let k = 0; k < 3; k++){ const a = t * 3 + k * TAU / 3; fillCircle(ctx, 25.4 * s + Math.cos(a) * 6 * s, sy2 + Math.sin(a) * 6 * s, 0.9 * s, IN10_HOT); }
    for (let k = 0; k < 4; k++){ const a = t * 2.2 + k * Math.PI / 2; fillCircle(ctx, Math.cos(a) * 17 * s, bob + Math.sin(a) * 17 * s, 1.5 * s, acc); }
  },
  magmamaw(ctx, e, b, dk, bob, wind, d){
    const s = e.r / 14, under = e.state === 'burrow' || e.state === 'wind', rim = in10_rim(dk), hi = in10_hi(b), pale = d.pale;
    if (under){
      for (let k = 0; k < 3; k++){ ctx.strokeStyle = 'rgba(40,18,8,' + (0.4 - k * 0.1) + ')'; ctx.lineWidth = 4 - k; ctx.beginPath(); ctx.arc(0, bob, (9 + k * 7 + Math.sin(G.time * 12 + k) * 2) * s, 0, TAU); ctx.stroke(); }
      csGlow(ctx, 0, bob, 12 * s, pale, wind ? 0.55 : 0.22); if (wind){ ctx.strokeStyle = pale; ctx.lineWidth = 2; for (let k = 0; k < 5; k++){ const a = k * 1.26 + G.time * 3; ctx.beginPath(); ctx.moveTo(Math.cos(a) * 6 * s, Math.sin(a) * 6 * s); ctx.lineTo(Math.cos(a) * 17 * s, Math.sin(a) * 17 * s); ctx.stroke(); } }
      for (let k = 0; k < 4; k++){ const a = G.time * 1.6 + k * 1.6; fillCircle(ctx, Math.cos(a) * 12 * s, Math.sin(a) * 11 * s, 1.5 * s, '#5A4036'); }   /* rock chips thrown up */
      return;
    }
    const seg = [[-10, 9], [-19, 7], [-27, 5]];
    for (let i = 0; i < 3; i++){
      const p = seg[i], x = p[0] * s, r = p[1] * s, wob = Math.sin(G.time * 5 - i * 1.3) * 1.4 * s;
      fillCircle(ctx, x, bob + wob, r + 1.3 * s, rim); fillCircle(ctx, x, bob + wob, r + 0.4 * s, dk); fillCircle(ctx, x, bob + wob, r * 0.9, b);
      ctx.strokeStyle = in10_deep(dk); ctx.lineWidth = Math.max(1, 1.3 * s); ctx.beginPath(); ctx.arc(x, bob + wob, r * 0.6, 1.9, 4.4); ctx.stroke();      /* a ridged ring plate */
      ctx.globalAlpha = 0.5; fillCircle(ctx, x - r * 0.2, bob + wob - r * 0.4, r * 0.32, hi); ctx.globalAlpha = 1;
      fillCircle(ctx, x + r * 0.98, bob + wob * 0.6, 1.5 * s, pale);                                               /* lava glowing between the rings */
    }
    fillCircle(ctx, 0, bob, 13.2 * s, 'rgba(24,6,2,.5)'); fillCircle(ctx, 0, bob, 12.4 * s, rim); fillCircle(ctx, 0, bob, 11.4 * s, dk); fillCircle(ctx, 0, bob, 9.6 * s, b);
    ctx.strokeStyle = in10_deep(dk); ctx.lineWidth = Math.max(1, 1.3 * s); ctx.beginPath();
    for (let k = 0; k < 9; k++){ const a = (k + 0.5) / 9 * TAU; ctx.moveTo(Math.cos(a) * 9.4 * s + s, bob + Math.sin(a) * 9.4 * s); ctx.lineTo(Math.cos(a) * 11.2 * s + s, bob + Math.sin(a) * 11.2 * s); } ctx.stroke();   /* plates round the lip */
    fillCircle(ctx, 1 * s, bob, 6.2 * s, '#1A0A06'); csGlow(ctx, 1 * s, bob, 9 * s, pale, 0.9);
    const pu = 0.8 + 0.2 * Math.sin(G.time * 5);
    for (let k = 0; k < 7; k++){ const a = -k / 7 * TAU + G.time * 1.2, c = Math.cos(a), sn = Math.sin(a); lkTRI(ctx, (c * 5.8 - sn * 1 * pu) * s + s, bob + (sn * 5.8 + c * 1 * pu) * s, c * 2.6 * s + s, bob + sn * 2.6 * s, (c * 5.8 + sn * 1 * pu) * s + s, bob + (sn * 5.8 - c * 1 * pu) * s, '#D8C8A0'); }   /* a second ring of teeth, deep inside */
    fillCircle(ctx, 1 * s, bob, 2 * s, IN10_HOT);
    for (let k = 0; k < 9; k++){ const a = k / 9 * TAU; lkTRI(ctx, Math.cos(a - 0.2) * 9.4 * s + s, bob + Math.sin(a - 0.2) * 9.4 * s, Math.cos(a) * 4.6 * s + s, bob + Math.sin(a) * 4.6 * s, Math.cos(a + 0.2) * 9.4 * s + s, bob + Math.sin(a + 0.2) * 9.4 * s, '#F0E0C0'); }
  },
  smokeserpent(ctx, e, b, dk, bob, wind, d){
    const va = e.vis === undefined ? 0.1 : e.vis, rim = in10_rim(dk), hi = in10_hi(b), pale = d.pale, s = e.r / 9, t = G.time;
    ctx.globalAlpha = va;
    for (let k = 0; k < 3; k++){ ctx.fillStyle = 'rgba(70,58,74,.55)'; ctx.beginPath(); ctx.arc(-12 * s - k * 9 * s, bob + Math.sin(t * 3 + k) * 5 * s, (5 - k) * s, 0, TAU); ctx.fill(); }    /* trailing smoke */
    for (let k = 7; k >= 1; k--){
      const y = bob + Math.sin(t * 5 - k * 0.8) * 3.4 * s, x = -k * 6.4 * s, r = (6.6 - k * 0.55) * s;
      fillCircle(ctx, x, y, r + 1.4, rim); fillCircle(ctx, x, y, r + 0.2, k % 2 ? b : dk);
      ctx.globalAlpha = va * 0.4; fillCircle(ctx, x - r * 0.15, y - r * 0.4, r * 0.36, hi); ctx.globalAlpha = va;
      if (k % 2){ fillCircle(ctx, x, y + r * 0.2, r * 0.3, pale); }                                            /* embers showing through the scales */
      else { ctx.strokeStyle = rim; ctx.lineWidth = Math.max(1, 0.9 * s); ctx.beginPath(); ctx.arc(x, y, r * 0.6, -0.7, 0.7); ctx.stroke(); }
    }
    for (const sy of [-1, 1]){ lkTRI(ctx, 3 * s, bob + sy * 3.4 * s, -3 * s, bob + sy * 10.6 * s, 0 * s, bob + sy * 2.8 * s, rim); lkTRI(ctx, 3 * s, bob + sy * 3.2 * s, -2.2 * s, bob + sy * 9 * s, 0.4 * s, bob + sy * 2.9 * s, dk); lkTRI(ctx, 2.4 * s, bob + sy * 3.2 * s, -0.4 * s, bob + sy * 7 * s, 0.6 * s, bob + sy * 3 * s, pale); }   /* a cobra hood */
    lkOV(ctx, 2 * s, bob, 9 * s, 6.9 * s, rim); lkOV(ctx, 2 * s, bob, 8 * s, 6 * s, dk); lkOV(ctx, 2 * s, bob, 6.8 * s, 5 * s, b);
    ctx.globalAlpha = va * 0.45; lkOV(ctx, 1 * s, bob - 2 * s, 4 * s, 1.2 * s, hi); ctx.globalAlpha = va;
    ctx.strokeStyle = dk; ctx.lineWidth = Math.max(1, s); ctx.beginPath(); ctx.moveTo(-1 * s, bob - 3.6 * s); ctx.lineTo(0.8 * s, bob); ctx.lineTo(-1 * s, bob + 3.6 * s); ctx.stroke();
    rockEyes(ctx, pale, 5 * s, bob, 2.4 * s, 1.1 * s);
    for (const sy of [-1, 1]) lkTRI(ctx, 8 * s, bob + sy * 1.6 * s, 14 * s, bob + sy * 2.4 * s, 8 * s, bob + sy * 3 * s, '#F0E0C0');
    const fk = Math.sin(t * 11) * 1.4 * s;
    lkLN(ctx, [8.6 * s, bob, 12.4 * s, bob, 14.4 * s, bob + fk, 15.8 * s, bob + fk + 1.6 * s], 0.8 * s, pale); lkLN(ctx, [12.4 * s, bob, 14.4 * s, bob + fk, 15.8 * s, bob + fk - 1.4 * s], 0.8 * s, pale);
    if (e.state === 'wind' || e.state === 'dash'){ lkLN(ctx, [8 * s, bob, 26 * s, bob], 2 * s, '#FFE0B0'); csGlow(ctx, 26 * s, bob, 16, pale, 0.9); }
    ctx.globalAlpha = 1;
  },
  blastbeetle(ctx, e, b, dk, bob, wind, d){
    const s = e.r / 9, fz = e.fuse === undefined ? 3 : e.fuse, on = Math.sin(fz * (10 + (3.2 - fz) * 6)) > 0, rim = in10_rim(dk), hi = in10_hi(b), pale = d.pale, ph = Math.sin(e.anim * 2.4);
    for (const sy of [-1, 1]) for (let i = 0; i < 3; i++){                                                     /* six jointed legs */
      const sx = -6 + i * 6, sw = ((i + (sy > 0 ? 1 : 0)) % 2 ? 1 : -1) * ph * 1.6, kx = (sx + (i - 1) * 1.6) * s, fx = (sx + 2.4 + sw + (i - 1) * 1.8) * s;
      lkLN(ctx, [sx * s, bob + sy * 6 * s, kx, bob + sy * 10.4 * s, fx, bob + sy * 13.6 * s], 2.8 * s, rim); lkLN(ctx, [sx * s, bob + sy * 6 * s, kx, bob + sy * 10.4 * s, fx, bob + sy * 13.6 * s], 1.7 * s, dk);
    }
    csGlow(ctx, -7 * s, bob, 13 * s, pale, on ? 0.8 : 0.28);
    lkOV(ctx, -9.4 * s, bob, 5.4 * s, 6.2 * s, rim); lkOV(ctx, -9.4 * s, bob, 4.6 * s, 5.4 * s, dk); lkOV(ctx, -9.4 * s, bob, 3.6 * s, 4.4 * s, on ? '#FFE070' : pale);   /* the bomb sac */
    for (let k = -1; k <= 1; k++) lkLN(ctx, [-12.2 * s, bob + k * 2.2 * s, -7 * s, bob + k * 2.6 * s], 0.7 * s, dk);
    fillCircle(ctx, -9.4 * s, bob - 1.6 * s, 1 * s, IN10_CORE);
    lkOV(ctx, -1 * s, bob, 10.6 * s, 12.6 * s, rim); lkOV(ctx, -1 * s, bob, 9.6 * s, 11.6 * s, dk);                  /* the wing cases, split down the middle */
    for (const sy of [-1, 1]){ lkOV(ctx, -1 * s, bob + sy * 5.6 * s, 8 * s, 5.6 * s, b, sy * 0.1); ctx.globalAlpha = 0.45; lkOV(ctx, -2 * s, bob + sy * 7.6 * s, 5.4 * s, 1.6 * s, hi, sy * 0.1); ctx.globalAlpha = 1; }
    ctx.beginPath(); ctx.moveTo(-10 * s, bob); ctx.lineTo(8 * s, bob); ctx.strokeStyle = dk; ctx.lineWidth = Math.max(1, 1.4 * s); ctx.stroke();
    ctx.beginPath(); for (const sy of [-1, 1]){ ctx.moveTo(-5 * s, bob + sy * 2 * s); ctx.lineTo(-2 * s, bob + sy * 5 * s); ctx.lineTo(-4 * s, bob + sy * 9 * s); ctx.moveTo(3 * s, bob + sy * 3 * s); ctx.lineTo(5 * s, bob + sy * 7 * s); }
    in10_crack(ctx, Math.max(1, 0.9 * s), pale, on ? 0.95 : 0.55);                                             /* heat cracking the shell */
    in10_plate(ctx, 7.4 * s, bob, 3.6 * s, 7 * s, b, dk, rim, 0, hi);                                          /* the pronotum shield */
    lkOV(ctx, 11.6 * s, bob, 3.6 * s, 3.6 * s, rim); lkOV(ctx, 11.6 * s, bob, 3 * s, 3 * s, dk); rockEyes(ctx, pale, 12.4 * s, bob, 1.9 * s, 0.9 * s);
    for (const sy of [-1, 1]){
      lkCV(ctx, 13 * s, bob + sy * 1.4 * s, 17 * s, bob + sy * 1.8 * s, 19.6 * s, bob + sy * 6 * s, 1.5 * s, IN10_BONE);   /* pincers */
      lkCV(ctx, 12 * s, bob + sy * 3.2 * s, 15 * s, bob + sy * 6 * s, 18 * s, bob + sy * 9 * s, 0.8 * s, rim);              /* antennae */
    }
    if (on) csGlow(ctx, -13 * s, bob, 6 * s, '#FFFFFF', 0.6);
  },
  infernoblade(ctx, e, b, dk, bob, wind, d){
    const s = e.r / 14, rot = wind ? -1.2 : e.state === 'dash' ? 0.1 : e.state === 'back' ? 1.3 : 0.2, rim = in10_rim(dk), hi = in10_hi(b), pale = d.pale;
    if (e.state === 'dash') for (let k = 1; k <= 3; k++) csGlow(ctx, -k * 10 * s, bob, 13 * s, '#FF8A1E', 0.5 - k * 0.1);
    in10_body(ctx, b, dk, pale, s * 0.95, bob, e);
    for (const sy of [-1, 1]){
      in10_plate(ctx, 4 * s, bob + sy * 11.6 * s, 4 * s, 3.2 * s, b, dk, rim, 0, hi);                         /* pauldrons */
      ctx.save(); ctx.translate(5 * s, bob + sy * 7 * s); ctx.rotate(sy > 0 ? rot : -rot * 0.6 - 0.3);
      in10_blade(ctx, s, wind, pale);
      for (let k = 0; k < 3; k++) lkTRI(ctx, (8 + k * 8) * s, -3.4 * s, (12 + k * 8) * s, -9 * s - Math.sin(G.time * 18 + k) * 2, (14 + k * 8) * s, -3.4 * s, '#FF9A30');
      csGlow(ctx, 22 * s, 0, wind ? 24 : 13, '#FF8A1E', wind ? 0.95 : 0.55); ctx.restore();
    }
    in10_plate(ctx, 7 * s, bob, 5.2 * s, 4.7 * s, b, dk, rim, 0, hi);
    lkTRI(ctx, 3.6 * s, bob - 1 * s, -2.4 * s, bob, 3.6 * s, bob + 1 * s, pale);                                 /* a flame crest */
    lkTRI(ctx, 6 * s, bob - 3.8 * s, 3 * s, bob - 8 * s, 8 * s, bob - 4.6 * s, IN10_BONE); lkTRI(ctx, 6 * s, bob + 3.8 * s, 3 * s, bob + 8 * s, 8 * s, bob + 4.6 * s, IN10_BONE);   /* helm horns */
    rockEyes(ctx, pale, 9.6 * s, bob, 2.2 * s, 1.1 * s);
  },
  slagslinger(ctx, e, b, dk, bob, wind, d){
    const s = e.r / 14, rim = in10_rim(dk), hi = in10_hi(b), pale = d.pale;
    in10_body(ctx, b, dk, pale, s * 0.95, bob, e);
    in10_plate(ctx, 2 * s, bob - 11.4 * s, 4 * s, 3.2 * s, b, dk, rim, 0, hi); in10_plate(ctx, 2 * s, bob + 11.4 * s, 4 * s, 3.2 * s, b, dk, rim, 0, hi);
    fillCircle(ctx, -9 * s, bob, 3.4 * s, rim); fillCircle(ctx, -9 * s, bob, 2.7 * s, '#3A1A0A'); fillCircle(ctx, -9 * s, bob, 1.6 * s, pale);   /* a slag reservoir on its back */
    csGlow(ctx, -9 * s, bob, 6 * s, pale, 0.5);
    in10_plate(ctx, 7 * s, bob, 5.2 * s, 4.7 * s, b, dk, rim, 0, hi); rockEyes(ctx, pale, 9.6 * s, bob, 2.2 * s, 1.1 * s);
    for (const sy of [-1, 1]) lkTRI(ctx, 6.4 * s, bob + sy * 4 * s, 4.4 * s, bob + sy * 8.6 * s, 9 * s, bob + sy * 5 * s, IN10_BONE);   /* brow horns */
    lkLN(ctx, [2 * s, bob + 9 * s, 12 * s, bob + 6 * s], 5.6 * s, rim); lkLN(ctx, [2 * s, bob + 9 * s, 12 * s, bob + 6 * s], 4.2 * s, dk);       /* a molten cannon in place of a hand */
    in10_cannon(ctx, s, bob + 6 * s, 24 * s, pale, dk, rim); csGlow(ctx, 27 * s, bob + 6 * s, 10, pale, 0.7);
    lkLN(ctx, [3 * s, bob - 9 * s, 8 * s, bob - 5 * s], 4 * s, rim); lkLN(ctx, [3 * s, bob - 9 * s, 8 * s, bob - 5 * s], 2.8 * s, dk); fillCircle(ctx, 8.4 * s, bob - 4.8 * s, 1.9 * s, b);
    if (wind) csGlow(ctx, 30 * s, bob + 6 * s, 14, '#FFF0A0', 0.9);
    if (e.state === 'burst') csGlow(ctx, 34 * s, bob + 6 * s, 18, '#FFB030', 0.95);
  },
  /* ---- bosses ---- */
  tyrant(ctx, e, b, dk, bob, wind, d){
    const s = e.r / 12, roar = e.state === 'roar', dash = e.state === 'dash', rim = in10_rim(dk), hi = in10_hi(b), pale = d.pale, sw = Math.sin(e.anim * 0.9), t = G.time;
    if (dash) for (let k = 1; k <= 4; k++) csGlow(ctx, -k * 18 * s, bob, 20 * s, '#FF8A1E', 0.5 - k * 0.1);
    csGlow(ctx, 0, bob, 34 * s, pale, roar ? 0.6 : 0.3);
    /* a heavy, spiked tail that sways */
    const tx = -30 * s, ty = bob + sw * 9 * s;
    lkCV(ctx, -11 * s, bob, -21 * s, bob + sw * 3 * s, tx, ty, 8.4 * s, rim); lkCV(ctx, -11 * s, bob, -21 * s, bob + sw * 3 * s, tx, ty, 6.6 * s, dk); lkCV(ctx, -11 * s, bob, -21 * s, bob + sw * 3 * s, tx, ty, 3.6 * s, b);
    for (let k = 0; k < 3; k++){ const u = 0.3 + k * 0.22, x = (-11 - 19 * u) * s, y = bob + sw * (3 * 2 * u * (1 - u) + 9 * u * u) * s; in10_spk(ctx, x + 2 * s, y - 3 * s, x - 2.4 * s, y - 8.4 * s, x - 1 * s, y - 2.6 * s, IN10_BONE, rim); in10_spk(ctx, x + 2 * s, y + 3 * s, x - 2.4 * s, y + 8.4 * s, x - 1 * s, y + 2.6 * s, IN10_BONE, rim); }
    in10_fl(ctx, tx, ty, Math.PI + sw * 0.4, (8 + Math.sin(t * 15) * 1.6) * s, 3.4 * s, pale, IN10_HOT);
    in10_body(ctx, b, dk, pale, s * 1.1, bob, e);
    for (let k = 0; k < 4; k++){ const x = (-10 + k * 3.4) * s, w = (1.6 + k * 0.5) * s; ctx.fillStyle = rim; ctx.beginPath(); ctx.moveTo(x - w * 1.8, bob); ctx.lineTo(x, bob - w * 1.5); ctx.lineTo(x + w * 1.8, bob); ctx.lineTo(x, bob + w * 1.5); ctx.closePath(); ctx.fill(); lkOV(ctx, x, bob, w * 1.15, w * 0.8, IN10_BONE); }   /* back plates */
    for (const sy of [-1, 1]){
      const fx = (wind ? 18 : 13) * s, fy = bob + sy * (wind ? 18 : 10) * s, ex = 8 * s, ey = bob + sy * (wind ? 19 : 16) * s;
      in10_spk(ctx, -2 * s, bob + sy * 12 * s, -10 * s, bob + sy * 23 * s, 5 * s, bob + sy * 15 * s, IN10_BONE, rim);                        /* shoulder spike */
      in10_plate(ctx, 0.5 * s, bob + sy * 13.6 * s, 5.8 * s, 4.4 * s, b, dk, rim, 0, hi);                                                   /* pauldron */
      lkLN(ctx, [3 * s, bob + sy * 12.4 * s, ex, ey, fx, fy], 6.6 * s, rim); lkLN(ctx, [3 * s, bob + sy * 12.4 * s, ex, ey, fx, fy], 5 * s, dk); lkLN(ctx, [3.6 * s, bob + sy * 12.4 * s, ex, ey], 2.2 * s, b);
      fillCircle(ctx, fx, fy, 5.6 * s, rim); fillCircle(ctx, fx, fy, 4.7 * s, '#2A1410'); fillCircle(ctx, fx - 0.4 * s, fy - 0.6 * s, 3.4 * s, b);   /* the fists */
      for (let k = -1; k <= 1; k++) fillCircle(ctx, fx + 3.4 * s, fy + k * 2.2 * s, 1.2 * s, dk);
      ctx.beginPath(); ctx.moveTo(fx - 3 * s, fy - 1.4 * s); ctx.lineTo(fx, fy + 0.4 * s); ctx.lineTo(fx + 2 * s, fy - 1 * s); in10_crack(ctx, Math.max(1, 0.9 * s), pale, 0.85);
    }
    in10_plate(ctx, 10 * s, bob, 7.6 * s, 6.8 * s, b, dk, rim, 0, hi);
    lkOV(ctx, 14.6 * s, bob, 3.8 * s, 5 * s, rim); lkOV(ctx, 14.6 * s, bob, 3 * s, 4.2 * s, in10_deep(dk));        /* the jaw */
    if (roar){ lkOV(ctx, 15.6 * s, bob, 3 * s, 4 * s, '#2A0A04'); csGlow(ctx, 16 * s, bob, 22, '#FFD060', 0.9); fillCircle(ctx, 15.6 * s, bob, 1.8 * s, IN10_HOT); }
    else { lkLN(ctx, [14 * s, bob - 3 * s, 17 * s, bob, 14 * s, bob + 3 * s], 1.2 * s, pale); }
    for (const sy of [-1, 1]){ lkTRI(ctx, 16.6 * s, bob + sy * 3.2 * s, 21 * s, bob + sy * 4.4 * s, 16.4 * s, bob + sy * 1.6 * s, IN10_BONE); fillCircle(ctx, 16.6 * s, bob + sy * 5.2 * s, 0.9 * s, pale); }   /* tusks, nostrils */
    for (let k = -2; k <= 2; k++) in10_bhorn(ctx, 8.4 * s, bob + k * 3 * s, 13.4 * s, bob + k * 4.2 * s, (20 - Math.abs(k) * 3) * s, bob + k * 5.6 * s, 3.2 * s, rim);   /* a crown of horns */
    rockEyes(ctx, pale, 13 * s, bob, 2.8 * s, 1.35 * s);
  },
  magmamother(ctx, e, b, dk, bob, wind, d){
    const s = e.r / 20, stomp = e.state === 'stomp', rim = in10_rim(dk), hi = in10_hi(b), pale = d.pale, t = G.time, sw = Math.sin(e.anim * 0.8);
    csGlow(ctx, 0, bob, 50 * s, pale, stomp ? 0.55 : 0.28);
    for (const p of [[-14, -20], [-14, 20], [12, -22], [12, 22]]){                                                /* six-jointed walking legs, claws splayed */
      const sy = p[1] < 0 ? -1 : 1, st = Math.sin(e.anim * 1.1 + (p[0] > 0 ? 0 : 1.6)) * 2.4 * sy;
      const kx = (p[0] + (p[0] > 0 ? 6 : -6)) * s, ky = bob + sy * 28 * s, fx = (p[0] + (p[0] > 0 ? 16 : -12) + st) * s, fy = bob + sy * 34 * s;
      lkLN(ctx, [p[0] * 0.4 * s, bob + p[1] * 0.4 * s, kx, ky, fx, fy], 9.4 * s, rim); lkLN(ctx, [p[0] * 0.4 * s, bob + p[1] * 0.4 * s, kx, ky, fx, fy], 7.6 * s, dk);
      lkLN(ctx, [p[0] * 0.5 * s, bob + p[1] * 0.5 * s, kx, ky], 3.2 * s, b);
      for (let k = -1; k <= 1; k++) lkTRI(ctx, fx - 1.4 * s, fy + k * 2 * s - 1 * s, fx + (p[0] > 0 ? 4.6 : -4.6) * s + k * 1.4 * s, fy + sy * 3.4 * s + k * 1.2 * s, fx + 1.4 * s, fy + k * 2 * s + 1 * s, IN10_BONE);
    }
    lkOV(ctx, -2 * s, bob, 28.4 * s, 24.4 * s, rim); lkOV(ctx, -2 * s, bob, 27 * s, 23 * s, dk); lkOV(ctx, -2 * s, bob, 24 * s, 20 * s, b);
    ctx.globalAlpha = 0.4; lkOV(ctx, -4 * s, bob - 13 * s, 15 * s, 5 * s, hi); ctx.globalAlpha = 1;
    ctx.strokeStyle = in10_deep(dk); ctx.lineWidth = Math.max(1, 1.6 * s); ctx.beginPath();                       /* the carapace's plate lines */
    for (let k = 0; k < 4; k++){ const x = (-18 + k * 7.4) * s; ctx.moveTo(x, bob - 17 * s); ctx.quadraticCurveTo(x + 4 * s, bob, x, bob + 17 * s); } ctx.stroke();
    for (let k = 0; k < 9; k++){                                                                                  /* a rim of spines */
      const a = (k - 4) * 0.5 + Math.PI, c = Math.cos(a), sn = Math.sin(a);
      in10_spk(ctx, -2 * s + c * 23 * s - sn * 2.4 * s, bob + sn * 19 * s + c * 2.4 * s, -2 * s + c * 31 * s, bob + sn * 26.5 * s, -2 * s + c * 23 * s + sn * 2.4 * s, bob + sn * 19 * s - c * 2.4 * s, IN10_BONE, rim);
    }
    ctx.beginPath(); ctx.moveTo(-24 * s, bob); ctx.lineTo(-17 * s, bob - 2 * s); ctx.lineTo(-10 * s, bob + 1.4 * s); ctx.moveTo(-14 * s, bob - 14 * s); ctx.lineTo(-17 * s, bob - 7 * s); ctx.moveTo(-14 * s, bob + 14 * s); ctx.lineTo(-17 * s, bob + 7 * s);
    in10_crack(ctx, Math.max(1, 1.3 * s), pale, 0.7);
    for (let k = 0; k < 7; k++){                                                                                  /* egg sacs on her back */
      const a = k * 0.9 + 0.3, px = -8 * s + Math.cos(a) * 12 * s, py = bob + Math.sin(a) * 13 * s, pu = 0.6 + 0.4 * Math.sin(t * 3 + k * 1.3);
      fillCircle(ctx, px, py, 5.6 * s, rim); fillCircle(ctx, px, py, 5 * s, dk); fillCircle(ctx, px, py, 3.9 * s, '#FFC060'); csGlow(ctx, px, py, 8 * s, pale, 0.6 * pu);
      fillCircle(ctx, px + 0.4 * s, py + 0.3 * s, (1.3 + pu * 0.7) * s, '#C8501E'); fillCircle(ctx, px - 1.4 * s, py - 1.5 * s, 0.9 * s, '#FFF4DC');   /* a curled embryo and a glint */
    }
    lkOV(ctx, 22 * s, bob, 11.2 * s, 10 * s, rim); lkOV(ctx, 22 * s, bob, 10 * s, 8.8 * s, dk); lkOV(ctx, 22 * s, bob, 8.4 * s, 7.6 * s, b);
    ctx.globalAlpha = 0.45; lkOV(ctx, 20.6 * s, bob - 4 * s, 5 * s, 1.8 * s, hi); ctx.globalAlpha = 1;
    for (const sy of [-1, 1]){
      in10_horn(ctx, 20 * s, bob + sy * 7 * s, 26 * s, bob + sy * 13 * s, 18 * s, bob + sy * 17 * s, 3.6 * s, IN10_BONE);              /* swept-back horns */
      in10_horn(ctx, 28 * s, bob + sy * 2 * s, 36 * s, bob + sy * 2 * s, 39 * s, bob + sy * 9 * s + sw * sy * 1.2 * s, 5 * s, rim);      /* pincer mandibles */
      in10_horn(ctx, 28.4 * s, bob + sy * 2 * s, 36 * s, bob + sy * 2.2 * s, 38 * s, bob + sy * 8.4 * s + sw * sy * 1.2 * s, 3.4 * s, IN10_BONE);
    }
    rockEyes(ctx, pale, 27 * s, bob, 3.4 * s, 1.6 * s);
    for (const sy of [-1, 1]) in10_eye(ctx, 22.4 * s, bob + sy * 6 * s, 1 * s, pale);
    if (stomp) ringPath(ctx, 0, bob, 36 * s, 4, '#FFFFFF', 0.5);
  },
  rampager(ctx, e, b, dk, bob, wind, d){
    const s = e.r / 16, dash = e.state === 'dash', rim = in10_rim(dk), pale = d.pale, glass = in10_mix(b, '#BFA9B8', 0.34), sheen = in10_mix(b, '#E4D0D8', 0.5), st = Math.sin(e.anim * 1.3);
    if (dash) for (let k = 1; k <= 5; k++) csGlow(ctx, -k * 16 * s, bob, 18 * s, '#FF8A1E', 0.5 - k * 0.08);
    for (const sy of [-1, 1]) for (const sx of [-12, 6]){
      const hx = (sx + (dash ? -6 : 2) + sy * st * (sx < 0 ? -1 : 1) * 1.6) * s, kx = (sx + (dash ? -3 : 1)) * s;
      lkLN(ctx, [sx * s, bob + sy * 10 * s, kx, bob + sy * 14 * s, hx, bob + sy * 18.4 * s], 7 * s, rim); lkLN(ctx, [sx * s, bob + sy * 10 * s, kx, bob + sy * 14 * s, hx, bob + sy * 18.4 * s], 5.4 * s, dk);
      lkOV(ctx, hx + 0.8 * s, bob + sy * 19.2 * s, 3.6 * s, 2.6 * s, rim); lkOV(ctx, hx + 0.8 * s, bob + sy * 19.2 * s, 2.8 * s, 1.9 * s, '#2A1E22'); fillCircle(ctx, hx + 1.4 * s, bob + sy * 19.8 * s, 0.8 * s, pale);   /* hooves */
    }
    lkOV(ctx, -2 * s, bob, 20.4 * s, 16.4 * s, rim); lkOV(ctx, -2 * s, bob, 19 * s, 15 * s, dk); lkOV(ctx, -2 * s, bob, 17 * s, 13 * s, b);
    for (let i = 0; i < IN10_SHARDS.length; i++){                                                                   /* faceted obsidian shards */
      const q = IN10_SHARDS[i];
      ctx.fillStyle = glass; ctx.strokeStyle = dk; ctx.lineWidth = Math.max(1, 1.2 * s); ctx.lineJoin = 'round';
      ctx.beginPath(); ctx.moveTo(q[0] * s, bob + q[1] * s); ctx.lineTo(q[2] * s, bob + q[3] * s); ctx.lineTo(q[4] * s, bob + q[5] * s); ctx.lineTo(q[6] * s, bob + q[7] * s); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillStyle = sheen; ctx.globalAlpha = 0.5; ctx.beginPath(); ctx.moveTo(q[0] * s, bob + q[1] * s); ctx.lineTo(q[2] * s, bob + q[3] * s); ctx.lineTo(q[4] * s, bob + q[5] * s); ctx.closePath(); ctx.fill(); ctx.globalAlpha = 1;
    }
    ctx.lineJoin = 'miter';
    ctx.beginPath(); ctx.moveTo(-15 * s, bob - 3 * s); ctx.lineTo(-8 * s, bob + 0 * s); ctx.lineTo(0, bob - 0.4 * s); ctx.lineTo(3 * s, bob + 4 * s); ctx.lineTo(10 * s, bob + 1 * s);
    ctx.moveTo(-8 * s, bob); ctx.lineTo(-12 * s, bob + 5 * s); ctx.moveTo(-4 * s, bob - 8.6 * s); ctx.lineTo(-1.6 * s, bob - 4.6 * s); ctx.moveTo(2 * s, bob + 8.6 * s); ctx.lineTo(3 * s, bob + 4 * s);
    in10_crack(ctx, Math.max(1, 1.9 * s * 0.8), pale, 0.9);
    lkOV(ctx, 18 * s, bob, 12 * s, 10.8 * s, rim); lkOV(ctx, 18 * s, bob, 11 * s, 9.8 * s, dk); lkOV(ctx, 18 * s, bob, 9.4 * s, 8.4 * s, b);
    lkOV(ctx, 15 * s, bob, 5 * s, 6.6 * s, glass); lkTRI(ctx, 10.4 * s, bob - 2 * s, 20 * s, bob - 5 * s, 19 * s, bob, sheen);
    for (const sy of [-1, 1]){                                                                                      /* heavy horns, swept forward */
      in10_horn(ctx, 20 * s, bob + sy * 7 * s, 33 * s, bob + sy * 22 * s, 43 * s, bob + sy * 12 * s, 8.8 * s, rim);
      in10_horn(ctx, 20 * s, bob + sy * 7 * s, 33 * s, bob + sy * 22 * s, 43 * s, bob + sy * 12 * s, 7 * s, IN10_BONE);
      in10_horn(ctx, 21 * s, bob + sy * 8 * s, 33 * s, bob + sy * 21 * s, 41 * s, bob + sy * 12.6 * s, 2.4 * s, '#FFF4DC');
      in10_horn(ctx, 38 * s, bob + sy * 17 * s, 41 * s, bob + sy * 15 * s, 43 * s, bob + sy * 12 * s, 3.6 * s, pale);
    }
    for (const sy of [-1, 1]) fillCircle(ctx, 28.2 * s, bob + sy * 2.6 * s, 1.1 * s, pale);                         /* glowing nostrils */
    rockEyes(ctx, pale, 24 * s, bob, 4 * s, 1.8 * s); if (e.state === 'wind') csGlow(ctx, 24 * s, bob, 30, '#FFFFFF', 0.7);
  },
  leviathan(ctx, e, b, dk, bob, wind, d){
    const s = e.r / 16, lunge = e.state === 'lunge' || e.state === 'wind', roll = e.state === 'roll', rim = in10_rim(dk), hi = in10_hi(b), pale = d.pale, t = G.time, alt = in10_mix(b, '#14100E', 0.22);
    for (let k = 9; k >= 1; k--){
      const y = bob + Math.sin(t * 3 - k * 0.7) * 5 * s * (roll ? 3 : 1), x = -k * 9 * s, r = (13 - k * 0.9) * s;
      fillCircle(ctx, x, y, r + 2.6, rim); fillCircle(ctx, x, y, r + 1.3, dk); fillCircle(ctx, x, y, r, k % 2 ? b : alt);
      ctx.globalAlpha = 0.4; fillCircle(ctx, x - r * 0.1, y - r * 0.4, r * 0.4, hi); ctx.globalAlpha = 1;
      in10_spk(ctx, x + 3 * s, y - 2.2 * s, x - 3.6 * s, y, x + 3 * s, y + 2.2 * s, IN10_BONE, rim);              /* a dorsal spine on every segment */
      if (k % 2){ ctx.strokeStyle = pale; ctx.globalAlpha = 0.8; ctx.lineWidth = Math.max(1, 1.5 * s); ctx.beginPath(); ctx.arc(x, y, r * 0.78, 1.9, 4.4); ctx.stroke(); ctx.globalAlpha = 1; }   /* heat between the plates */
    }
    csGlow(ctx, -40 * s, bob, 24 * s, pale, 0.35);
    const sw = Math.sin(t * 4);
    for (const sy of [-1, 1]) for (const lx of [-9, 5]){                                                           /* stubby clawed legs */
      const fx = (lx + 4 + sy * sw * (lx < 0 ? -2 : 2)) * s, fy = bob + sy * 19 * s;
      lkLN(ctx, [lx * s, bob + sy * 9 * s, fx, fy], 6.4 * s, rim); lkLN(ctx, [lx * s, bob + sy * 9 * s, fx, fy], 4.6 * s, dk);
      for (let k = -1; k <= 1; k++) lkTRI(ctx, fx - 1.4 * s, fy + sy * 1 * s, fx + 4.6 * s + k * 0.4 * s, fy + sy * 3.4 * s + k * 2.4 * s, fx + 1.8 * s, fy + sy * 0.6 * s, IN10_BONE);
    }
    lkOV(ctx, 0, bob, 18.4 * s, 13.4 * s, rim); lkOV(ctx, 0, bob, 17 * s, 12 * s, dk); lkOV(ctx, 0, bob, 15 * s, 10 * s, b);
    ctx.globalAlpha = 0.4; lkOV(ctx, -1 * s, bob - 5.4 * s, 10 * s, 2.4 * s, hi); ctx.globalAlpha = 1;
    for (let k = 0; k < 4; k++) for (const sy of [-1, 1]) lkOV(ctx, (-9 + k * 5) * s, bob + sy * 5.6 * s, 2.5 * s, 2.1 * s, alt);       /* osteoderm plates */
    ctx.beginPath(); ctx.moveTo(-14 * s, bob); ctx.lineTo(-8 * s, bob - 1.2 * s); ctx.lineTo(-2 * s, bob + 1 * s); ctx.lineTo(4 * s, bob - 0.8 * s); ctx.lineTo(10 * s, bob); in10_crack(ctx, Math.max(1, 1.4 * s), pale, 0.9);
    const jaw = lunge ? 0.55 : 0.12;
    if (lunge){ const c = Math.cos(jaw), sn = Math.sin(jaw); lkTRI(ctx, 12 * s, bob, (12 + 26 * c) * s, bob - 26 * sn * s, (12 + 26 * c) * s, bob + 26 * sn * s, '#7A1E08'); lkTRI(ctx, 14 * s, bob, (12 + 19 * c) * s, bob - 15 * sn * s, (12 + 19 * c) * s, bob + 15 * sn * s, pale); }   /* the glowing throat */
    for (const sy of [-1, 1]){ ctx.save(); ctx.translate(12 * s, bob); ctx.rotate(sy * jaw);
      lkTRI(ctx, -1 * s, -sy * 2 * s, 29.5 * s, 0, -1 * s, sy * 10.4 * s, rim);
      lkTRI(ctx, 0, -sy * 1 * s, 28 * s, 0, 0, sy * 9 * s, dk); lkTRI(ctx, 1 * s, sy * 0.4 * s, 26 * s, sy * 0.6 * s, 1 * s, sy * 8.4 * s, b);
      ctx.globalAlpha = 0.5; lkTRI(ctx, 4 * s, sy * 2 * s, 22 * s, sy * 1 * s, 4 * s, sy * 5.4 * s, hi); ctx.globalAlpha = 1;
      for (let k = 0; k < 5; k++) lkTRI(ctx, (6 + k * 4.4) * s, sy * (k * 0.3) * s, (7.6 + k * 4.4) * s, sy * (3.8 + k * 0.4) * s, (9 + k * 4.4) * s, sy * (k * 0.3) * s, '#F0E0C0'); ctx.restore(); }
    for (const sy of [-1, 1]){ lkTRI(ctx, 6.6 * s, bob + sy * 4.4 * s, 10 * s, bob + sy * 11.4 * s, 13 * s, bob + sy * 5 * s, rim); lkTRI(ctx, 7.4 * s, bob + sy * 5 * s, 10 * s, bob + sy * 10 * s, 12 * s, bob + sy * 5.4 * s, IN10_BONE); }   /* brow horns over the eyes */
    rockEyes(ctx, pale, 10 * s, bob, 7 * s, 2 * s); if (lunge) csGlow(ctx, 30 * s, bob, 26, '#FFB040', 0.8);
  },
  sovereign(ctx, e, b, dk, bob, wind, d){
    const s = e.r / 20, t = G.time, rim = in10_rim(dk), hi = in10_hi(b), pale = d.pale;
    for (let k = 0; k < 7; k++){                                                                                   /* a cloak of flame, two layers deep */
      const sy = (k - 3), fl = Math.sin(t * 6 + k) * 4 * s, ex = (-42 - Math.abs(sy) * 3) * s + fl;
      ctx.fillStyle = k % 2 ? 'rgba(255,120,30,.55)' : 'rgba(255,200,80,.5)'; ctx.beginPath(); ctx.moveTo(-6 * s, bob + sy * 5 * s); ctx.lineTo(ex, bob + sy * 10 * s); ctx.lineTo(-6 * s, bob + sy * 5 * s + 8 * s); ctx.closePath(); ctx.fill();
      ctx.fillStyle = 'rgba(255,238,170,.5)'; ctx.beginPath(); ctx.moveTo(-6 * s, bob + sy * 5 * s + 1.4 * s); ctx.lineTo(ex * 0.55 - 3 * s, bob + sy * 8 * s + 3 * s); ctx.lineTo(-6 * s, bob + sy * 5 * s + 6.4 * s); ctx.closePath(); ctx.fill();
    }
    csGlow(ctx, 0, bob, 56 * s, pale, 0.4);
    ctx.fillStyle = 'rgba(255,214,120,.5)';
    for (let k = 0; k < 10; k++){                                                                                  /* a slowly turning halo of rays */
      const a = -t * 0.5 + k * TAU / 10, c = Math.cos(a), sn = Math.sin(a);
      ctx.beginPath(); ctx.moveTo(c * 22 * s - sn * 2.2 * s, bob + sn * 22 * s + c * 2.2 * s); ctx.lineTo(c * 30 * s, bob + sn * 30 * s); ctx.lineTo(c * 22 * s + sn * 2.2 * s, bob + sn * 22 * s - c * 2.2 * s); ctx.closePath(); ctx.fill();
    }
    in10_body(ctx, b, dk, pale, s * 1.35, bob, e);
    for (const sy of [-1, 1]){                                                                                     /* spiked pauldrons */
      in10_spk(ctx, 2 * s, bob + sy * 20 * s, -2 * s, bob + sy * 31 * s, 8 * s, bob + sy * 22 * s, IN10_BONE, rim);
      in10_spk(ctx, 9 * s, bob + sy * 20 * s, 10 * s, bob + sy * 28 * s, 14 * s, bob + sy * 21 * s, IN10_BONE, rim);
      in10_plate(ctx, 4 * s, bob + sy * 19.4 * s, 8.4 * s, 5.4 * s, b, dk, rim, sy * 0.2, hi);
      const hx = (wind ? 22 : 16) * s, hy = bob + sy * (wind ? 30 : 25) * s, hf = Math.sin(t * 5 + sy);                 /* floating gauntlets */
      csGlow(ctx, hx, hy, 11 * s, pale, 0.45 + 0.1 * hf);
      lkOV(ctx, hx, hy, 6 * s, 5 * s, rim); lkOV(ctx, hx, hy, 5.2 * s, 4.2 * s, dk); lkOV(ctx, hx, hy, 4 * s, 3.2 * s, b);
      for (let k = -1; k <= 1; k++) lkTRI(ctx, hx + 4 * s, hy + k * 2 * s - 1 * s, hx + 8.4 * s, hy + k * 2.6 * s, hx + 4 * s, hy + k * 2 * s + 1 * s, IN10_BONE);
    }
    for (let k = 0; k < 8; k++){ const a = t * 1.4 + k * TAU / 8; fillCircle(ctx, Math.cos(a) * 34 * s, bob + Math.sin(a) * 34 * s, 3.2 * s, k % 2 ? pale : '#FFFFFF'); csGlow(ctx, Math.cos(a) * 34 * s, bob + Math.sin(a) * 34 * s, 8 * s, pale, 0.6); }   /* a ring of embers */
    in10_plate(ctx, 14 * s, bob, 9.4 * s, 8.4 * s, b, dk, rim, 0, hi);
    for (let k = -3; k <= 3; k++){ const x1 = 13 * s, y1 = bob + k * 2.8 * s, tx = (24 - Math.abs(k) * 2.4) * s, ty = bob + k * 4.2 * s; lkTRI(ctx, x1, y1 - 1.4 * s, tx, ty, x1, y1 + 1.4 * s, rim); lkTRI(ctx, x1, y1 - 1 * s, tx - 0.8 * s, ty, x1, y1 + 1 * s, '#FFE090'); }   /* the crown */
    for (const k of [-2, 0, 2]) fillCircle(ctx, (14.6 - Math.abs(k) * 0.4) * s, bob + k * 2.8 * s, 1.2 * s, '#FF4A1A');
    rockEyes(ctx, pale, 18 * s, bob, 3 * s, 1.5 * s);
    if (wind) csGlow(ctx, 0, bob, 44 * s, '#FFFFFF', 0.45);
  }
};

