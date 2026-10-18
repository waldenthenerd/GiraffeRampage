'use strict';
/* Enemy art, Chapter 6: Houston (CITY_DRAW). */
/* ======================== Chapter 6: Houston ======================== */
/* The city is evacuated -- no people anywhere -- so the streets belong to
   the animals that live alongside people, while the military sends in
   armour and aircraft to drive the giraffe out.
   Shared look: animals are warm fur tones with amber eyes; every machine has a
   hard dark outline, lit panels and the same orange/red warning lights, so grey
   hulls still read against the grey asphalt. */

/* ---- small local helpers (ct6_ prefix keeps them off the shared global scope) ---- */
const CT6_PC = new Map();
/* cached palette derived from a body/dark pair (these change only on a hit flash) */
function ct6_pal(b, dk){
  const k = b + dk; let p = CT6_PC.get(k);
  if (!p){
    p = {
      hi: blendHex(b, '#FFFFFF', 0.22), hi2: blendHex(b, '#FFFFFF', 0.42),
      lo: blendHex(b, dk, 0.42), mid: blendHex(b, dk, 0.7), deep: blendHex(dk, '#14100E', 0.35)
    };
    CT6_PC.set(k, p);
  }
  return p;
}
function ct6_eye(ctx, x, y, r, iris){
  fillCircle(ctx, x, y, r, iris);
  fillCircle(ctx, x + r * 0.2, y, r * 0.5, '#1A1410');
  fillCircle(ctx, x - r * 0.25, y - r * 0.4, r * 0.28, '#FFFFFF');
}
function ct6_leg(ctx, x0, y0, x1, y1, w, c, pc){
  lkLN(ctx, [x0, y0, x1, y1], w, c);
  lkOV(ctx, x1 + w * 0.3, y1 + (y1 > y0 ? w * 0.18 : -w * 0.18), w * 0.9, w * 0.62, pc);
}
/* four walking legs: front pair at fx, rear pair at rx, reaching from y0 out to y1 */
function ct6_legs(ctx, e, bob, fx, rx, y0, y1, w, c, pc, amp, k){
  const sw = Math.sin(e.anim * (k || 2.4)) * amp;
  for (let s = -1; s <= 1; s += 2){
    const f = s < 0 ? sw : -sw;
    ct6_leg(ctx, fx, bob + s * y0, fx + f, bob + s * y1, w, c, pc);
    ct6_leg(ctx, rx, bob + s * y0 * 1.05, rx - f, bob + s * y1 * 1.02, w * 1.08, c, pc);
  }
}
/* polygon from a flat [x,y,...] array (mirror on y with sy = -1) */
function ct6_poly(ctx, pts, fill, stroke, lw, ox, oy, sy){
  ox = ox || 0; oy = oy || 0; sy = sy || 1;
  ctx.beginPath(); ctx.moveTo(pts[0] + ox, pts[1] * sy + oy);
  for (let i = 2; i < pts.length; i += 2) ctx.lineTo(pts[i] + ox, pts[i + 1] * sy + oy);
  ctx.closePath();
  if (fill){ ctx.fillStyle = fill; ctx.fill(); }
  if (stroke){ ctx.strokeStyle = stroke; ctx.lineWidth = lw || 1; ctx.lineJoin = 'round'; ctx.stroke(); ctx.lineJoin = 'miter'; }
}
function ct6_ov(ctx, x, y, rx, ry, fill, stroke, lw, rot){
  ctx.beginPath(); ctx.ellipse(x, y, rx, ry, rot || 0, 0, TAU);
  if (fill){ ctx.fillStyle = fill; ctx.fill(); }
  if (stroke){ ctx.strokeStyle = stroke; ctx.lineWidth = lw || 1; ctx.stroke(); }
}
function ct6_rect(ctx, x, y, w, h, fill, stroke, lw){
  if (fill){ ctx.fillStyle = fill; ctx.fillRect(x, y, w, h); }
  if (stroke){ ctx.strokeStyle = stroke; ctx.lineWidth = lw || 1; ctx.strokeRect(x, y, w, h); }
}
/* a warning lamp: soft halo plus a hard bright core */
function ct6_lamp(ctx, x, y, r, c){
  softBlob(ctx, x, y, r * 2.4, c, 0.28);
  fillCircle(ctx, x, y, r, c);
}

function drawPigeon(ctx, x, y, s, b, dk, pale, flap, lod){
  const p = ct6_pal(b, dk);
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  for (let k = -1; k <= 1; k += 2){
    if (!lod) lkOV(ctx, -3, k * (5 + flap), 6.6, 3, p.deep, -k * 0.4 - flap * 0.1 * k);   /* wing rim */
    lkOV(ctx, -3, k * (5 + flap), 6, 2.6, b, -k * 0.4 - flap * 0.1 * k);
    lkOV(ctx, -7.4, k * (6.6 + flap), 2.6, 1.5, dk, -k * 0.4 - flap * 0.1 * k);      /* dark primaries */
    if (!lod) lkOV(ctx, -1.2, k * (3.8 + flap), 3.6, 1.5, p.hi, -k * 0.4);           /* pale coverts */
  }
  lkTRI(ctx, -6.5, -2.6, -12.4, 0, -6.5, 2.6, dk);                                       /* fan tail */
  if (!lod) lkLN(ctx, [-10.6, -1.8, -10.6, 1.8], 1, p.hi);                               /* tail band */
  lkOV(ctx, -1, 0, 6.5, 4.2, b);
  if (!lod) lkOV(ctx, -5.6, 0, 2, 2.6, '#E4E6EA');                                      /* pale rump */
  lkOV(ctx, 3.6, 0, 3, 3.6, pale);                                                       /* the iridescent neck */
  if (!lod) lkOV(ctx, 3, 0, 1.2, 3, '#A878B8');                                          /* purple band */
  lkOV(ctx, 6, 0, 2.8, 2.6, p.mid);
  lkTRI(ctx, 8.2, -0.9, 10.6, 0, 8.2, 0.9, '#2A2420');
  fillCircle(ctx, 8.6, 0, 0.55, '#E4E6EA');                                             /* the cere */
  fillCircle(ctx, 6.6, -1.3, 0.75, '#E86A2A'); fillCircle(ctx, 6.6, 1.3, 0.75, '#E86A2A');
  for (let k = -1; k <= 1; k += 2) lkLN(ctx, [-3, k * 1.5, -5, k * 2.4], 0.8, dk);        /* wing bars */
  ctx.restore();
}
function drawRotor(ctx, x, y, len, blades, t, col, tip){
  const wd = len > 40 ? 3.4 : 2.6;
  ctx.globalAlpha = 0.12; fillCircle(ctx, x, y, len, col); ctx.globalAlpha = 1;
  ctx.save(); ctx.translate(x, y); ctx.rotate(t);
  ctx.fillStyle = col; ctx.globalAlpha = 0.7;
  for (let i = 0; i < blades; i++){ ctx.rotate(TAU / blades); ctx.fillRect(0, -wd / 2, len, wd); }
  if (tip){                                    /* painted blade tips so the spin reads */
    ctx.fillStyle = tip; ctx.globalAlpha = 0.9;
    for (let i = 0; i < blades; i++){ ctx.rotate(TAU / blades); ctx.fillRect(len * 0.8, -wd / 2, len * 0.2, wd); }
  }
  ctx.globalAlpha = 1; ctx.restore();
  if (len >= 14){ fillCircle(ctx, x, y, 3.4, '#1A1A1A'); fillCircle(ctx, x, y, 1.5, '#7A7E82'); }
  else fillCircle(ctx, x, y, 2.4, '#1A1A1A');
}
function drawTreads(ctx, x, y, len, w, col, t){
  const dkc = shade(col, -0.45), lt = shade(col, 0.22), r = Math.min(w / 2, 6);
  ctx.fillStyle = dkc; ctx.fillRect(x - 0.8, y - 0.8, len + 1.6, w + 1.6);           /* hard outline */
  ctx.fillStyle = col; ctx.fillRect(x, y, len, w);
  ctx.strokeStyle = lt; ctx.lineWidth = 1;                                              /* track links */
  const off = (t * 20) % 5;
  ctx.beginPath(); for (let k = x + off; k < x + len; k += 5){ ctx.moveTo(k, y + 0.5); ctx.lineTo(k, y + w - 0.5); } ctx.stroke();
  ctx.fillStyle = dkc;                                                                  /* sprockets and road wheels */
  const n = Math.max(2, Math.floor(len / (w * 0.95)));
  for (let i = 0; i < n; i++){
    const wx = x + r + (len - 2 * r) * (n === 1 ? 0 : i / (n - 1));
    fillCircle(ctx, wx, y + w / 2, w * 0.36, dkc);
    fillCircle(ctx, wx, y + w / 2, w * 0.16, lt);
  }
}

const CT6_ARM = '#FF8A3A', CT6_RED = '#E8452E', CT6_GLASS = '#9AB0B8';
/* ---- static outlines (no per-frame allocation) ---- */
const CT6_LT_HULL = [-23, -12, 15, -12, 24, -6, 24, 6, 15, 12, -23, 12];
const CT6_LT_GLAC = [15, -12, 24, -6, 24, 6, 15, 12];
const CT6_AB_HULL = [-43, -24, 30, -24, 43, -14, 43, 14, 30, 24, -43, 24];
const CT6_AB_GLAC = [30, -24, 43, -14, 43, 14, 30, 24];
const CT6_AB_TUR = [-20, -20, 16, -17, 27, -7, 27, 7, 16, 17, -20, 20];
const CT6_AB_TURF = [16, -17, 27, -7, 27, 7, 16, 17];
const CT6_A10_WING = [6, -5, 0, -52, -12, -52, -10, -5, -10, 5, -12, 52, 0, 52, 6, 5];
const CT6_A10_FLAP = [-10, -8, -5, -8, -7, -51, -12, -52];
const CT6_GR_WING = [3, 3, 0, 10, -5, 20, -8, 25, -10, 19.6, -13.4, 23, -14.6, 16.4, -18.4, 18.4, -18, 11, -21.6, 11.6, -15.6, 5, -8, 3];
const CT6_A10_CAM = [[-3, 18, 3.4, 6.6, 0.2], [-6, 31, 3, 5, -0.2], [0, 42, 2.6, 6, 0.1], [-4, 8, 2.8, 3, 0]];

const CITY_DRAW = {
  streetdog(ctx, e, b, dk, bob, wind, d){
    const p = ct6_pal(b, dk), tw = Math.sin(e.anim * 6) * 6;
    ct6_legs(ctx, e, bob, 9, -9, 6, 11.8, 3.4, p.lo, p.hi, 3.4);
    lkCV(ctx, -15, bob, -21, bob + tw * 0.7, -25, bob + tw * 1.25, 3.2, b);   /* wagging tail */
    fillCircle(ctx, -25, bob + tw * 1.25, 1.8, p.hi2);
    lkOV(ctx, -1, bob, 17.4, 10.2, p.deep);
    lkOV(ctx, -1, bob, 16, 9, b);
    lkOV(ctx, -6, bob - 1.4, 7.4, 5.2, dk);                      /* a mutt's patch */
    lkOV(ctx, 5, bob + 4.2, 3.6, 2.8, dk);
    ctx.globalAlpha = 0.5; lkOV(ctx, -9, bob - 5, 5.4, 2.4, p.hi2); lkOV(ctx, 5, bob - 5.4, 5, 2.2, p.hi2); ctx.globalAlpha = 1;   /* lit shoulders */
    lkLN(ctx, [-12, bob + 6, -12, bob + 3.4], 1, p.deep); lkLN(ctx, [-8, bob + 7, -8, bob + 4.4], 1, p.deep);   /* ribs */
    lkOV(ctx, 14, bob, 8.6, 7.6, p.deep);
    lkOV(ctx, 14, bob, 7.5, 6.5, b);
    lkOV(ctx, 10, bob - 6.4, 4.6, 2.8, dk, -0.3); lkOV(ctx, 10, bob + 6.4, 4.6, 2.8, dk, 0.3);   /* floppy ears */
    lkOV(ctx, 9.4, bob - 6.2, 2.2, 1, p.lo, -0.3); lkOV(ctx, 9.4, bob + 6.2, 2.2, 1, p.lo, 0.3);
    lkOV(ctx, 8.6, bob, 1.8, 7, d.pale);                         /* red collar */
    fillCircle(ctx, 9.8, bob + 1.6, 1.5, '#F2C850');             /* tag */
    lkOV(ctx, 20.4, bob, 4.8, 3.6, '#D4B48C');                   /* muzzle */
    lkLN(ctx, [16, bob, 22, bob], 1.1, p.lo);
    fillCircle(ctx, 24, bob, 1.6, '#1A1410'); fillCircle(ctx, 23.5, bob - 0.5, 0.45, '#FFFFFF');
    ct6_eye(ctx, 16.8, bob - 2.9, 1.5, '#D8A040'); ct6_eye(ctx, 16.8, bob + 2.9, 1.5, '#D8A040');
  },
  coyote(ctx, e, b, dk, bob){
    const p = ct6_pal(b, dk), tw = Math.sin(e.anim * 2) * 3;
    ct6_legs(ctx, e, bob, 10, -10, 4.2, 10.8, 2.6, p.lo, p.hi, 3.6);
    lkOV(ctx, -18, bob + tw * 0.6, 9.4, 4.4, p.deep, tw * 0.04);   /* black-tipped bushy tail */
    lkOV(ctx, -18, bob + tw * 0.6, 8.6, 3.8, b, tw * 0.04);
    lkOV(ctx, -20, bob + tw * 0.7, 5, 1.6, p.lo, tw * 0.04);
    lkOV(ctx, -25.4, bob + tw * 1.2, 3.4, 2.6, '#1E1A18');
    lkOV(ctx, -1, bob, 15.6, 8.4, p.deep);
    lkOV(ctx, -1, bob, 15, 7.8, b);
    ctx.globalAlpha = 0.5; lkOV(ctx, -3, bob, 11, 3.4, dk); ctx.globalAlpha = 1;   /* grey-brown saddle */
    ctx.globalAlpha = 0.5; lkOV(ctx, 0, bob - 5.4, 11, 1.6, p.hi2); ctx.globalAlpha = 1;
    lkTRI(ctx, 8, bob - 3, 12, bob - 8.6, 12.4, bob - 2, '#E8D8B8'); lkTRI(ctx, 8, bob + 3, 12, bob + 8.6, 12.4, bob + 2, '#E8D8B8');   /* ruff */
    lkOV(ctx, 12, bob, 6.8, 5.6, p.deep);
    lkOV(ctx, 12, bob, 6.2, 5, b);
    lkTRI(ctx, 15, bob - 3.4, 24, bob, 15, bob + 3.4, p.hi);    /* narrow snout */
    lkLN(ctx, [14, bob, 22.6, bob], 1.4, dk);
    fillCircle(ctx, 23.4, bob, 1.4, '#141414'); fillCircle(ctx, 23, bob - 0.4, 0.4, '#FFFFFF');
    lkTRI(ctx, 8, bob - 3, 9, bob - 11, 13, bob - 4, dk); lkTRI(ctx, 8, bob + 3, 9, bob + 11, 13, bob + 4, dk);   /* big ears */
    lkTRI(ctx, 9.2, bob - 4.4, 9.8, bob - 9, 11.8, bob - 4.8, '#D8A890'); lkTRI(ctx, 9.2, bob + 4.4, 9.8, bob + 9, 11.8, bob + 4.8, '#D8A890');
    ct6_eye(ctx, 15.4, bob - 2.4, 1.5, '#E8C84A'); ct6_eye(ctx, 15.4, bob + 2.4, 1.5, '#E8C84A');
  },
  alleycat(ctx, e, b, dk, bob, wind){
    const p = ct6_pal(b, dk), sway = Math.sin(e.anim * 1.6) * 1.8, cream = '#F0E2C0';
    if (wind) ringPath(ctx, 0, bob, 22, 2.5, '#FFFFFF', 0.7);
    ct6_legs(ctx, e, bob, 8, -8, 4, 9, 2.6, p.lo, cream, 2.4);
    ctx.strokeStyle = b; ctx.lineWidth = 2.8; ctx.lineCap = 'round';   /* tail up in a question mark */
    ctx.beginPath(); ctx.moveTo(-12, bob); ctx.quadraticCurveTo(-22, bob - 2, -22, bob - 10); ctx.quadraticCurveTo(-22, bob - 15, -17 + sway, bob - 14); ctx.stroke();
    ctx.strokeStyle = dk; ctx.lineWidth = 2.9;                           /* tail rings */
    ctx.beginPath(); ctx.moveTo(-20.4, bob - 4); ctx.lineTo(-23.6, bob - 4); ctx.moveTo(-20.4, bob - 8); ctx.lineTo(-23.6, bob - 8);
    ctx.moveTo(-21.6, bob - 12.6); ctx.lineTo(-22.4, bob - 11); ctx.stroke();
    ctx.lineCap = 'butt';
    fillCircle(ctx, -17 + sway, bob - 14, 1.6, dk);
    lkOV(ctx, 0, bob, 13.6, 7.6, p.deep);
    lkOV(ctx, 0, bob, 13, 7, b);
    for (let k = -2; k <= 2; k++) lkOV(ctx, k * 4.6, bob, 1.2, 6.2 - Math.abs(k) * 0.2, dk);   /* tabby stripes */
    lkLN(ctx, [-12, bob, 9, bob], 1.3, dk);                              /* spine line */
    ctx.globalAlpha = 0.45; lkOV(ctx, 0, bob - 4.8, 10, 1.6, p.hi2); ctx.globalAlpha = 1;
    lkOV(ctx, 12.4, bob, 6.8, 6.2, p.deep);
    lkOV(ctx, 12.4, bob, 6.2, 5.6, b);
    lkTRI(ctx, 9, bob - 3, 10, bob - 9.4, 13.4, bob - 4, b); lkTRI(ctx, 9, bob + 3, 10, bob + 9.4, 13.4, bob + 4, b);
    lkTRI(ctx, 10, bob - 4, 10.6, bob - 8, 12.4, bob - 4.6, '#E0A0A0'); lkTRI(ctx, 10, bob + 4, 10.6, bob + 8, 12.4, bob + 4.6, '#E0A0A0');
    lkOV(ctx, 16, bob, 3, 2.6, cream);                                   /* pale muzzle */
    lkE2(ctx, 14.6, bob, 2.5, 1.6, '#9AD84A');
    lkE2(ctx, 14.8, bob, 2.5, 0.5, '#141414');                           /* slit pupils */
    fillCircle(ctx, 18.2, bob, 1, '#D88A9A');
    ctx.strokeStyle = '#F4EAD0'; ctx.lineWidth = 0.6; ctx.beginPath();  /* whiskers */
    for (let k = -1; k <= 1; k += 2){
      ctx.moveTo(17, bob + k * 1.6); ctx.lineTo(21.4, bob + k * 5); ctx.moveTo(17.4, bob + k * 1.2); ctx.lineTo(22, bob + k * 2.6);
    }
    ctx.stroke();
  },
  ninebanded(ctx, e, b, dk, bob, wind, d){
    const p = ct6_pal(b, dk), pk = d.pale;
    if (wind) ringPath(ctx, 0, bob, 24, 3, '#FF9C6A', 0.6);
    ct6_legs(ctx, e, bob, 8, -9, 7, 12, 3.8, p.lo, p.mid, 2.8);
    ctx.strokeStyle = '#E8DCC8'; ctx.lineWidth = 0.9; ctx.beginPath();   /* claws */
    for (let s = -1; s <= 1; s += 2) for (const fx of [-9, 8]) for (let j = -1; j <= 1; j++){
      ctx.moveTo(fx + j * 1.6 + 1.6, bob + s * 13.4); ctx.lineTo(fx + j * 2.4 + 2, bob + s * 15.2);
    }
    ctx.stroke();
    lkTRI(ctx, -12, bob - 3.6, -27, bob, -12, bob + 3.6, p.deep);     /* banded tapering tail */
    lkTRI(ctx, -12, bob - 3, -26, bob, -12, bob + 3, b);
    for (let k = 0; k < 4; k++) lkLN(ctx, [-14 - k * 3, bob - 2.4 + k * 0.5, -14 - k * 3, bob + 2.4 - k * 0.5], 0.9, dk);
    lkOV(ctx, -1, bob, 15.2, 11.2, p.deep);                              /* shell with a hard rim */
    lkOV(ctx, -1, bob, 14, 10, b);
    lkOV(ctx, 7.4, bob, 5.4, 8.6, p.hi);                                 /* shoulder shield */
    lkOV(ctx, -11.4, bob, 4.4, 7.4, p.hi);                               /* pelvic shield */
    ctx.strokeStyle = dk; ctx.lineWidth = 1.3; ctx.beginPath();          /* the nine bands */
    for (let k = -3; k <= 3; k++){
      const bx = -1 + k * 2.6, br = 9 - Math.abs(k) * 0.5;
      ctx.moveTo(bx + 0.8, bob); ctx.ellipse(bx, bob, 0.8, br, 0, 0, TAU);
    }
    ctx.stroke();
    ctx.globalAlpha = 0.55; ctx.strokeStyle = p.hi2; ctx.lineWidth = 0.9; ctx.beginPath();
    for (let k = -3; k <= 3; k++){
      const bx = -1 + k * 2.6 + 1.2, br = 8.2 - Math.abs(k) * 0.5;
      ctx.moveTo(bx + 0.5, bob); ctx.ellipse(bx, bob, 0.5, br, 0, -1.2, 1.2);
    }
    ctx.stroke(); ctx.globalAlpha = 1;
    ctx.fillStyle = p.mid; ctx.beginPath();                              /* scute studs on the shields */
    for (let k = -2; k <= 2; k++){ ctx.moveTo(7.4 + 1.2, bob + k * 3); ctx.arc(7.4, bob + k * 3, 1.1, 0, TAU); }
    for (let k = -2; k <= 2; k++){ ctx.moveTo(-11.4 + 1, bob + k * 2.8); ctx.arc(-11.4, bob + k * 2.8, 1, 0, TAU); }
    ctx.fill();
    lkLN(ctx, [-9, bob, 9, bob], 0.9, p.deep);
    lkOV(ctx, 11, bob - 4.4, 3, 1.9, pk, 0.4); lkOV(ctx, 11, bob + 4.4, 3, 1.9, pk, -0.4);   /* big ears */
    lkOV(ctx, 11, bob - 4.4, 1.5, 0.8, dk, 0.4); lkOV(ctx, 11, bob + 4.4, 1.5, 0.8, dk, -0.4);
    lkTRI(ctx, 11, bob - 4.2, 25, bob, 11, bob + 4.2, p.deep);        /* long pink snout */
    lkTRI(ctx, 11.4, bob - 3.6, 24.2, bob, 11.4, bob + 3.6, pk);
    lkTRI(ctx, 12, bob - 1.6, 22, bob, 12, bob + 1.6, '#F0CFC0');
    fillCircle(ctx, 24.2, bob, 1.1, '#6A3A3A');
    lkE2(ctx, 14.4, bob, 2.5, 0.95, '#1A1410');
    lkE2(ctx, 14.1, bob, 2.2, 0.35, '#FFFFFF');
  },
  lighttank(ctx, e, b, dk, bob, wind, d){
    const p = ct6_pal(b, dk), shade2 = e.anim;
    if (wind) ringPath(ctx, 0, bob, 34, 4, '#FF6A4A', 0.6);
    drawTreads(ctx, -26, bob - 18, 52, 8, dk, e.anim);
    drawTreads(ctx, -26, bob + 10, 52, 8, dk, e.anim);
    ct6_poly(ctx, CT6_LT_HULL, b, p.deep, 1.6, 0, bob);               /* hull with a sloped nose */
    ct6_poly(ctx, CT6_LT_GLAC, p.hi, p.deep, 1.2, 0, bob);
    ctx.globalAlpha = 0.4;                                              /* camouflage blotches */
    lkOV(ctx, -8, bob + 6, 7, 3.4, dk, 0.2); lkOV(ctx, 8, bob - 7, 5, 2.4, dk, -0.3);
    ctx.globalAlpha = 1;
    ct6_rect(ctx, -21, bob - 9, 11, 18, p.mid, p.deep, 1);             /* engine deck */
    ctx.strokeStyle = p.deep; ctx.lineWidth = 1; ctx.beginPath();
    for (let k = 0; k < 4; k++){ ctx.moveTo(-19 + k * 2.6, bob - 7.4); ctx.lineTo(-19 + k * 2.6, bob + 7.4); } ctx.stroke();
    lkOV(ctx, -24, bob - 6, 1.6, 1.2, '#26231A'); lkOV(ctx, -24, bob + 6, 1.6, 1.2, '#26231A');   /* exhausts */
    fillCircle(ctx, 22.4, bob - 8.6, 1.6, '#FFD070'); fillCircle(ctx, 22.4, bob + 8.6, 1.6, '#FFD070');   /* headlights */
    fillCircle(ctx, -22.4, bob - 10, 1.1, CT6_RED); fillCircle(ctx, -22.4, bob + 10, 1.1, CT6_RED);
    lkLN(ctx, [6, bob, 37, bob], 4.2, p.deep);                          /* main gun */
    lkLN(ctx, [6, bob, 37, bob], 2.6, dk);
    lkLN(ctx, [8, bob - 0.8, 36, bob - 0.8], 0.8, p.lo);
    ct6_rect(ctx, 14, bob - 2.6, 9, 5.2, dk, p.deep, 0.8);              /* barrel sleeve */
    fillCircle(ctx, 37, bob, 2.8, p.deep); fillCircle(ctx, 37, bob, 1.1, '#141210');   /* muzzle brake */
    fillCircle(ctx, 4, bob, 11.4, p.deep);                              /* turret */
    fillCircle(ctx, 4, bob, 10.5, d.pale);
    ctx.globalAlpha = 0.4; ct6_ov(ctx, 2, bob - 3.4, 7, 4, p.hi2, null, 0, -0.3); ctx.globalAlpha = 1;
    fillCircle(ctx, 4, bob, 10.5, 'rgba(0,0,0,.08)');
    ctx.strokeStyle = CT6_ARM; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.arc(4, bob, 8.4, 2.3, 3.9); ctx.stroke();   /* recognition band */
    fillCircle(ctx, 0.4, bob - 4, 3.6, p.deep); fillCircle(ctx, 0.4, bob - 4, 2.6, dk);   /* commander hatch */
    fillCircle(ctx, 0.4, bob - 4, 1.2, p.lo);
    lkLN(ctx, [0.4, bob - 4, 5, bob - 7], 1.2, '#1A1A1A');            /* hatch machine gun */
    ct6_rect(ctx, 8.6, bob + 3, 3.2, 3.2, p.deep);                      /* sight box */
    fillCircle(ctx, 10.2, bob + 4.6, 0.8, CT6_ARM);
    lkLN(ctx, [-4, bob + 8, -16, bob + 18 + Math.sin(shade2 * 2) * 1], 0.7, '#26231A');   /* aerial */
  },
  grackle(ctx, e, b, dk, bob, wind, d){
    const f = 1 + Math.sin(e.anim * 2.4) * 0.2, sh = '#4A5AA8', tl = '#3E8A8A', p = ct6_pal(b, dk);
    for (let s = -1; s <= 1; s += 2){                                    /* feathered wings, swept back */
      ctx.save(); ctx.translate(0, bob); ctx.scale(1, s * f);
      ct6_poly(ctx, CT6_GR_WING, b, '#05050A', 1.4);
      ctx.strokeStyle = '#05050A'; ctx.lineWidth = 0.8; ctx.beginPath();   /* feather splits */
      ctx.moveTo(-8, 4); ctx.lineTo(-9, 20); ctx.moveTo(-12, 4.4); ctx.lineTo(-13.4, 18); ctx.moveTo(-15.6, 5); ctx.lineTo(-17.6, 15); ctx.stroke();
      ctx.globalAlpha = 0.65; ctx.fillStyle = sh; ctx.beginPath(); ctx.ellipse(-3, 10, 2.6, 7.2, 0.45, 0, TAU); ctx.fill();   /* blue sheen on the coverts */
      ctx.fillStyle = tl; ctx.beginPath(); ctx.ellipse(-9, 12, 1.4, 5, 0.3, 0, TAU); ctx.fill();
      ctx.globalAlpha = 1; ctx.restore();
    }
    lkTRI(ctx, -8, bob - 1.6, -25, bob - 4.4, -21, bob, dk);            /* long keel-shaped tail */
    lkTRI(ctx, -8, bob + 1.6, -25, bob + 4.4, -21, bob, dk);
    lkTRI(ctx, -8, bob - 2, -24, bob, -8, bob + 2, b);
    ctx.globalAlpha = 0.5; lkLN(ctx, [-9, bob, -21, bob], 1, tl); ctx.globalAlpha = 1;
    lkOV(ctx, -1, bob, 10, 6.4, b);
    ctx.globalAlpha = 0.55; lkOV(ctx, 1, bob - 1.8, 7.4, 2.4, sh); lkOV(ctx, -2, bob + 1.8, 5, 1.4, tl); ctx.globalAlpha = 1;   /* purple and teal sheen */
    lkOV(ctx, 9, bob, 5.2, 4.6, b);
    ctx.globalAlpha = 0.55; lkOV(ctx, 8.4, bob - 1.4, 3, 1.4, '#7A6ACA'); ctx.globalAlpha = 1;
    lkTRI(ctx, 13, bob - 1.6, 21, bob, 13, bob + 1.6, '#141414');
    lkLN(ctx, [13.4, bob, 19, bob], 0.7, '#4A4A52');
    lkE2(ctx, 10.8, bob, 2.2, 1.35, d.pale); lkE2(ctx, 11.1, bob, 2.2, 0.55, '#141414');   /* pale yellow eyes */
  },
  k9(ctx, e, b, dk, bob, wind, d){
    const p = ct6_pal(b, dk), vp = ct6_pal(d.pale, '#14100E'), tw = Math.sin(e.anim * 3) * 3;
    ct6_legs(ctx, e, bob, 9, -10, 6, 11.8, 3.6, p.lo, p.hi, 3.4);
    lkCV(ctx, -14, bob, -22, bob + tw, -27, bob + 2 + tw * 0.4, 4.6, dk);   /* bushy tail */
    lkCV(ctx, -14, bob, -22, bob + tw, -26, bob + 2 + tw * 0.4, 2, p.lo);
    lkOV(ctx, -1, bob, 15.8, 9.8, p.deep);
    lkOV(ctx, -1, bob, 15, 9, b);
    lkOV(ctx, -4, bob, 11, 5.8, dk);                                     /* black saddle */
    ctx.globalAlpha = 0.5; lkOV(ctx, -9, bob - 5.6, 5, 1.8, p.hi2); ctx.globalAlpha = 1;
    ct6_rect(ctx, -5, bob - 8.6, 14, 17.2, d.pale, '#1A2216', 1);       /* tactical vest */
    ctx.fillStyle = vp.hi; ctx.fillRect(-5, bob - 8.6, 14, 2); ctx.fillRect(-5, bob + 6.6, 14, 2);   /* piping */
    ctx.fillStyle = 'rgba(0,0,0,.38)';
    ctx.fillRect(-2.6, bob - 6, 3.6, 3.6); ctx.fillRect(-2.6, bob + 2.4, 3.6, 3.6); ctx.fillRect(3, bob - 6, 3.6, 3.6); ctx.fillRect(3, bob + 2.4, 3.6, 3.6);
    ctx.fillStyle = CT6_ARM; ctx.fillRect(-5.6, bob - 8.4, 1.6, 16.8);   /* reflective stripe */
    lkLN(ctx, [-1, bob - 1.4, 6, bob - 1.4], 1.1, '#141414');           /* grab handle */
    lkLN(ctx, [-1, bob + 1.4, 6, bob + 1.4], 1.1, '#141414');
    lkOV(ctx, 13, bob, 7.8, 6.8, p.deep);
    lkOV(ctx, 13, bob, 7, 6, b);
    lkTRI(ctx, 8, bob - 3, 9, bob - 11, 13, bob - 4, dk); lkTRI(ctx, 8, bob + 3, 9, bob + 11, 13, bob + 4, dk);   /* upright ears */
    lkTRI(ctx, 9.4, bob - 4.4, 10, bob - 9, 12, bob - 4.8, p.lo); lkTRI(ctx, 9.4, bob + 4.4, 10, bob + 9, 12, bob + 4.8, p.lo);
    lkOV(ctx, 20, bob, 4.8, 3.6, dk);                                    /* dark muzzle */
    lkOV(ctx, 19, bob - 2.6, 2.6, 1, p.hi, 0.2); lkOV(ctx, 19, bob + 2.6, 2.6, 1, p.hi, -0.2);
    fillCircle(ctx, 24, bob, 1.5, '#141414'); fillCircle(ctx, 23.5, bob - 0.5, 0.45, '#FFFFFF');
    ct6_eye(ctx, 16.2, bob - 2.8, 1.5, '#D8A838'); ct6_eye(ctx, 16.2, bob + 2.8, 1.5, '#D8A838');
    lkLN(ctx, [8.2, bob - 6.6, 8.2, bob + 6.6], 1.8, '#1A1A1A');       /* collar */
    fillCircle(ctx, 8.2, bob, 1.1, CT6_ARM);
  },
  helicopter(ctx, e, b, dk, bob, wind, d){
    const p = ct6_pal(b, dk);
    for (let s = -1; s <= 1; s += 2){                                    /* skids with struts */
      lkLN(ctx, [-10, bob + s * 7.4, 10, bob + s * 7.4], 1.8, '#26261A');
      lkLN(ctx, [-5, bob + s * 3.4, -5, bob + s * 7.4], 1.1, dk); lkLN(ctx, [5, bob + s * 3.4, 5, bob + s * 7.4], 1.1, dk);
    }
    lkTRI(ctx, -6, bob - 3.4, -29, bob - 1.4, -29, bob + 1.4, p.deep);   /* tapered tail boom */
    lkTRI(ctx, -6, bob - 3.4, -29, bob - 1.4, -6, bob + 3.4, p.deep);
    lkTRI(ctx, -6, bob - 2.8, -28, bob, -6, bob + 2.8, b);
    lkLN(ctx, [-8, bob, -26, bob], 0.8, p.lo);
    lkLN(ctx, [-25, bob - 1.6, -25, bob + 1.6], 2.2, CT6_ARM);          /* warning stripes */
    lkOV(ctx, -27, bob, 2.4, 5.4, dk);                                   /* stabiliser */
    drawRotor(ctx, -28, bob + 5, 5, 2, G.time * 60, '#2A2A2A', CT6_ARM);   /* tail rotor */
    lkOV(ctx, 0, bob, 14, 7, p.deep);
    lkOV(ctx, 0, bob, 13, 6.2, b);
    ctx.globalAlpha = 0.45; lkOV(ctx, -2, bob - 3, 8, 1.8, p.hi2); ctx.globalAlpha = 1;
    lkOV(ctx, -4, bob, 6.4, 3.8, p.mid);                                 /* engine cowling */
    lkLN(ctx, [-7, bob - 1.4, -1, bob - 1.4], 0.7, p.deep); lkLN(ctx, [-7, bob + 1.4, -1, bob + 1.4], 0.7, p.deep);
    for (let s = -1; s <= 1; s += 2){                                    /* weapon stubs */
      lkOV(ctx, 1, bob + s * 8.2, 4.2, 1.7, dk);
      fillCircle(ctx, 5.4, bob + s * 8.2, 1.2, CT6_ARM);
    }
    ct6_ov(ctx, 8, bob, 5.4, 4.8, d.pale, p.deep, 1);                    /* cockpit glass */
    lkLN(ctx, [8, bob - 4.6, 8, bob + 4.6], 0.9, p.deep);
    ctx.globalAlpha = 0.55; lkOV(ctx, 9.4, bob - 1.8, 2.2, 1.2, '#FFFFFF'); ctx.globalAlpha = 1;
    fillCircle(ctx, 13.2, bob, 1.6, dk);                                 /* nose sensor */
    if (Math.sin(G.time * 6) > 0) ct6_lamp(ctx, -29, bob - 2, 1.2, CT6_RED);
    drawRotor(ctx, 0, bob, 26, 2, G.time * 40, '#1E1E1E', CT6_ARM);    /* main rotor */
  },
  rat(ctx, e, b, dk, bob, wind, d){
    const p = ct6_pal(b, dk), st = e.state === 'dash' ? 1.2 : 1, sw = Math.sin(e.anim * 5);
    lkCV(ctx, -8 * st, bob, -16, bob + sw * 5, -24, bob + Math.sin(e.anim * 5 + 1) * 3, 1.5, p.deep);   /* long naked tail */
    lkCV(ctx, -8 * st, bob, -16, bob + sw * 5, -24, bob + Math.sin(e.anim * 5 + 1) * 3, 0.9, d.pale);
    ct6_legs(ctx, e, bob, 4 * st, -5 * st, 3.2, 7, 1.5, d.pale, d.pale, 1.8, 4);
    lkOV(ctx, -1, bob, 8.8 * st, 5.6 / st, p.deep);
    lkOV(ctx, -1, bob, 8 * st, 5 / st, b);
    lkOV(ctx, -4 * st, bob, 4.6 * st, 4.4 / st, p.hi);                   /* round haunches */
    ctx.globalAlpha = 0.5; lkLN(ctx, [-6 * st, bob, 4 * st, bob], 1.2, dk); ctx.globalAlpha = 1;
    lkTRI(ctx, 5 * st, bob - 3.6, 13.6 * st, bob, 5 * st, bob + 3.6, p.deep);
    lkTRI(ctx, 5 * st, bob - 3, 13 * st, bob, 5 * st, bob + 3, b);
    lkE2(ctx, 4.4 * st, bob, 3.4, 2.2, p.deep);
    lkE2(ctx, 4.4 * st, bob, 3.4, 1.7, d.pale);                          /* pink ears */
    lkE2(ctx, 4.4 * st, bob, 3.4, 0.8, '#B87880');
    lkE2(ctx, 8.4 * st, bob, 1.7, 0.95, '#141414');
    lkE2(ctx, 8.1 * st, bob, 1.9, 0.3, '#FFFFFF');
    fillCircle(ctx, 13.4 * st, bob, 1, d.pale);
    ctx.strokeStyle = '#D8D4CC'; ctx.lineWidth = 0.5; ctx.beginPath();   /* whiskers */
    for (let k = -1; k <= 1; k += 2){ ctx.moveTo(11.4 * st, bob + k * 1); ctx.lineTo(15 * st, bob + k * 3.8); ctx.moveTo(11.6 * st, bob + k * 0.6); ctx.lineTo(15.6 * st, bob + k * 1.8); }
    ctx.stroke();
  },
  pigeonflock(ctx, e, b, dk, bob, wind, d){
    const pts = [[4, -8], [-6, 6], [8, 8], [-8, -6], [0, 0]];
    for (let i = 0; i < pts.length; i++){
      const f = Math.sin(e.anim * 8 + i * 1.7) * 1.2;
      drawPigeon(ctx, pts[i][0] + Math.sin(e.anim + i) * 1.5, bob + pts[i][1], 0.95, b, dk, d.pale, f, true);
    }
  },
  pigeon(ctx, e, b, dk, bob, wind, d){
    drawPigeon(ctx, 0, bob, 0.9, b, dk, d.pale, Math.sin(e.anim * 9) * 1.2, false);
  },
  drone(ctx, e, b, dk, bob, wind, d){
    const p = ct6_pal(b, dk);
    lkLN(ctx, [-6, bob - 6, 6, bob + 6], 2.6, p.deep); lkLN(ctx, [-6, bob + 6, 6, bob - 6], 2.6, p.deep);   /* X frame */
    lkLN(ctx, [-6, bob - 6, 6, bob + 6], 1.4, p.hi); lkLN(ctx, [-6, bob + 6, 6, bob - 6], 1.4, p.hi);
    for (const px of [-6, 6]) for (const py of [-6, 6]){
      fillCircle(ctx, px, bob + py, 2.7, p.deep);                        /* motor pods */
      drawRotor(ctx, px, bob + py, 4.4, 2, G.time * 70 + px, '#B8BEC4');
      fillCircle(ctx, px, bob + py, 1.1, CT6_ARM);
    }
    ct6_ov(ctx, 0, bob, 4.6, 3.8, b, p.deep, 1.2);                       /* body shell */
    ct6_rect(ctx, -3.6, bob - 2, 3.8, 4, p.hi);                          /* lit top plate */
    fillCircle(ctx, 3.4, bob, 1.7, '#1A1A1A'); fillCircle(ctx, 3.4, bob, 0.9, '#6AB8D8');   /* camera lens */
    lkLN(ctx, [-4.4, bob - 2.4, -4.4, bob + 2.4], 1, CT6_ARM);          /* rear stripe */
    if (Math.sin(G.time * 8 + e.anim) > 0) ct6_lamp(ctx, 1, bob - 2.6, 1.1, d.pale);   /* blinking light */
  },
  rottweiler(ctx, e, b, dk, bob, wind, d){
    const p = ct6_pal(b, dk), tan = d.pale, w = Math.sin(e.anim * 2) * 4;
    for (const px of [-18, 20]) for (let s = -1; s <= 1; s += 2){        /* legs ending in tan paws with toes */
      const f = s * px > 0 ? w : -w, fx = px + f;
      lkLN(ctx, [px, bob + s * 15, fx, bob + s * 22], 9, p.deep);
      lkLN(ctx, [px, bob + s * 15, fx, bob + s * 22], 7.4, b);
      lkOV(ctx, fx, bob + s * 24, 7.4, 5.8, '#7A4A22');
      lkOV(ctx, fx, bob + s * 24, 6.6, 5, tan);
      lkLN(ctx, [fx + 2, bob + s * 21, fx + 4.6, bob + s * 25.4], 0.9, '#7A4A22');
      lkLN(ctx, [fx - 0.4, bob + s * 21, fx + 1, bob + s * 26.4], 0.9, '#7A4A22');
      lkLN(ctx, [fx - 3, bob + s * 21.6, fx - 3, bob + s * 26], 0.9, '#7A4A22');
    }
    const tl = Math.sin(e.anim * 4) * 4;
    lkCV(ctx, -38, bob, -46, bob + tl, -50, bob + tl * 0.8, 6.4, p.deep);   /* docked tail stub */
    lkCV(ctx, -38, bob, -46, bob + tl, -50, bob + tl * 0.8, 4.8, b);
    lkOV(ctx, -4, bob, 41.6, 25.4, p.deep);                              /* the body, with a hard rim */
    lkOV(ctx, -4, bob, 40, 24, b);
    ctx.globalAlpha = 0.3; lkOV(ctx, -6, bob - 9, 28, 8, p.hi2); ctx.globalAlpha = 1;   /* glossy coat */
    ctx.globalAlpha = 0.28;
    lkOV(ctx, -24, bob - 11, 11, 8, p.hi2); lkOV(ctx, -24, bob + 11, 11, 8, p.hi2);     /* haunches */
    lkOV(ctx, 8, bob - 13, 9, 6, p.hi2); lkOV(ctx, 8, bob + 13, 9, 6, p.hi2);           /* shoulders */
    ctx.globalAlpha = 1;
    lkLN(ctx, [-38, bob, 14, bob], 1.6, dk);                             /* spine */
    lkOV(ctx, 17, bob - 15, 4.6, 3, tan, 0.5); lkOV(ctx, 17, bob + 15, 4.6, 3, tan, -0.5);   /* tan chest marks */
    lkOV(ctx, -38, bob - 6, 3.4, 2.4, tan, 0.4); lkOV(ctx, -38, bob + 6, 3.4, 2.4, tan, -0.4);
    lkOV(ctx, 30, bob, 17, 16, p.deep);                                  /* head */
    lkOV(ctx, 30, bob, 16, 15, b);
    ctx.globalAlpha = 0.3; lkOV(ctx, 28, bob - 6, 9, 3.6, p.hi2); ctx.globalAlpha = 1;
    for (let s = -1; s <= 1; s += 2){                                    /* drop ears */
      lkOV(ctx, 23, bob + s * 14, 9, 5.2, p.deep, s * 0.55);
      lkOV(ctx, 23, bob + s * 14, 8, 4.4, dk, s * 0.55);
      lkOV(ctx, 22, bob + s * 13.2, 5.4, 1.8, p.lo, s * 0.55);
    }
    lkOV(ctx, 42, bob, 9.6, 8.6, '#7A4A22');                             /* tan muzzle */
    lkOV(ctx, 42, bob, 8.8, 7.8, tan);
    lkOV(ctx, 43, bob, 7, 2.6, p.mid);                                   /* dark bridge */
    lkOV(ctx, 38, bob - 6.6, 4.6, 2.6, tan, 0.4); lkOV(ctx, 38, bob + 6.6, 4.6, 2.6, tan, -0.4);   /* jowls */
    lkLN(ctx, [36, bob - 4, 47, bob - 3.4], 1.2, '#7A4A22'); lkLN(ctx, [36, bob + 4, 47, bob + 3.4], 1.2, '#7A4A22');
    fillCircle(ctx, 48.4, bob, 3, '#141414');                            /* nose with a wet glint */
    fillCircle(ctx, 47.4, bob - 1.2, 0.9, '#7A7A82');
    fillCircle(ctx, 49.4, bob - 1.2, 0.5, '#2A2A30'); fillCircle(ctx, 49.4, bob + 1.2, 0.5, '#2A2A30');
    lkE2(ctx, 32.4, bob, 4.6, 2.2, tan);                                 /* tan brow spots */
    ct6_eye(ctx, 34.6, bob - 6.4, 2.6, '#E0A030'); ct6_eye(ctx, 34.6, bob + 6.4, 2.6, '#E0A030');
    lkLN(ctx, [31, bob - 8.4, 36.6, bob - 8.8], 1.4, dk); lkLN(ctx, [31, bob + 8.4, 36.6, bob + 8.8], 1.4, dk);   /* angry brows */
    ctx.strokeStyle = '#4A4A4E'; ctx.lineWidth = 4;                      /* spiked collar */
    ctx.beginPath(); ctx.ellipse(18, bob, 3.4, 17.4, 0, 0, TAU); ctx.stroke();
    ctx.strokeStyle = '#8A8A90'; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.ellipse(17.4, bob, 3, 17, 0, -1.9, 1.9); ctx.stroke();
    for (let k = -3; k <= 3; k++){
      lkTRI(ctx, 15.4, bob + k * 4.6 - 1.8, 22.4, bob + k * 4.6, 15.4, bob + k * 4.6 + 1.8, '#C8C8CC');
      fillCircle(ctx, 15.6, bob + k * 4.6, 1, '#5A5A60');
    }
    fillCircle(ctx, 21.4, bob + 2, 2.4, CT6_ARM);                        /* dog tag */
    const cs = Math.sin(e.anim * 3) * 3;                                 /* a broken chain trailing off the collar */
    lkLN(ctx, [16, bob + 17, 11 + cs * 0.4, bob + 22, 5 + cs, bob + 26], 1.8, '#7A7A82');
    fillCircle(ctx, 11 + cs * 0.4, bob + 22, 1.5, '#A8A8B0'); fillCircle(ctx, 5 + cs, bob + 26, 1.5, '#A8A8B0');
    if (e.state === 'roar'){
      const gap = 5 + Math.sin(G.time * 30) * 1.5;
      lkOV(ctx, 49, bob, 6.4, gap, '#6E1A1C');
      lkOV(ctx, 48, bob, 3.6, gap * 0.5, '#C86A6A');                     /* tongue */
      for (let k = -1; k <= 1; k += 2) for (let j = 0; j < 3; j++) lkTRI(ctx, 46 + j * 2.6, bob + k * (gap - 0.4), 47.2 + j * 2.6, bob + k * (gap - 0.4), 46.6 + j * 2.6, bob + k * (gap - 3), '#F0EAD8');
    }
  },
  gunship(ctx, e, b, dk, bob, wind, d){
    const p = ct6_pal(b, dk), blink = Math.sin(G.time * 5) > 0;
    ct6_poly(ctx, [-18, -6, -67, -3, -67, 3, -18, 6], b, p.deep, 1.6, 0, bob);   /* tapered tail boom */
    lkLN(ctx, [-22, bob, -64, bob], 1.1, p.lo);
    ctx.fillStyle = CT6_ARM; ctx.fillRect(-60, bob - 3.2, 3, 6.4); ctx.fillRect(-54, bob - 3.6, 3, 7.2);   /* warning bands */
    lkTRI(ctx, -62, bob, -78, bob - 13, -72, bob, p.deep);              /* tail fin */
    lkTRI(ctx, -62, bob, -76.6, bob - 11.4, -71, bob, dk);
    ct6_rect(ctx, -72, bob - 11, 7, 22, dk, p.deep, 1.2);                /* stabiliser */
    lkLN(ctx, [-68.4, bob - 9, -68.4, bob + 9], 0.9, p.lo);
    drawRotor(ctx, -70, bob + 10, 10, 2, G.time * 60, '#2A2A2A', CT6_ARM);
    if (blink){ ct6_lamp(ctx, -70, bob - 11, 1.6, CT6_RED); ct6_lamp(ctx, -70, bob + 11, 1.6, CT6_RED); }
    ct6_rect(ctx, -9, bob - 32, 18, 64, dk, p.deep, 1.4);               /* stub wings */
    ctx.fillStyle = p.hi; ctx.globalAlpha = 0.4; ctx.fillRect(2, bob - 31, 5, 62); ctx.globalAlpha = 1;
    lkLN(ctx, [-9, bob - 13, 9, bob - 13], 1, p.deep); lkLN(ctx, [-9, bob + 13, 9, bob + 13], 1, p.deep);
    for (const s of [-1, 1]) for (const k of [0, 1]){                    /* rocket pods */
      const py = bob + s * (22 + k * 8);
      ct6_rect(ctx, -13, py - 3.4, 23, 6.8, '#4A4A34', p.deep, 1);
      ctx.fillStyle = CT6_ARM; ctx.fillRect(-13, py - 3.4, 3, 6.8);
      fillCircle(ctx, 10, py, 2.8, '#1A1A1A'); fillCircle(ctx, 10, py, 1.2, CT6_ARM);
    }
    lkOV(ctx, 0, bob, 41.4, 16.4, p.deep);                               /* fuselage */
    lkOV(ctx, 0, bob, 40, 15, b);
    ctx.globalAlpha = 0.45; lkOV(ctx, -2, bob - 6.6, 30, 3.4, p.hi2); ctx.globalAlpha = 1;
    ctx.strokeStyle = p.deep; ctx.lineWidth = 1; ctx.beginPath();        /* armour plate seams */
    for (const x of [-30, -18, -6, 6]){ ctx.moveTo(x, bob - 12); ctx.lineTo(x, bob + 12); }
    ctx.moveTo(-36, bob); ctx.lineTo(-6, bob);
    ctx.stroke();
    ct6_ov(ctx, -20, bob - 7.6, 13, 5, p.lo, p.deep, 1.2); ct6_ov(ctx, -20, bob + 7.6, 13, 5, p.lo, p.deep, 1.2);   /* engine nacelles */
    fillCircle(ctx, -9, bob - 7.6, 3.4, '#141210'); fillCircle(ctx, -9, bob + 7.6, 3.4, '#141210');
    fillCircle(ctx, -32, bob - 7.6, 2.4, CT6_ARM); fillCircle(ctx, -32, bob + 7.6, 2.4, CT6_ARM);   /* hot exhausts */
    ct6_ov(ctx, 26, bob, 12, 8, d.pale, p.deep, 1.4);                    /* tandem cockpit */
    ct6_ov(ctx, 14, bob, 8, 7, d.pale, p.deep, 1.4);
    lkLN(ctx, [20, bob - 7.6, 20, bob + 7.6], 1.2, p.deep);              /* canopy bows */
    lkLN(ctx, [30, bob - 6.4, 30, bob + 6.4], 1.2, p.deep);
    ctx.globalAlpha = 0.5; lkOV(ctx, 28, bob - 3, 5, 2, '#FFFFFF'); lkOV(ctx, 13, bob - 3, 3.4, 1.4, '#FFFFFF'); ctx.globalAlpha = 1;
    fillCircle(ctx, 37, bob, 3.2, dk); fillCircle(ctx, 37, bob, 1.6, CT6_ARM);   /* nose sensor */
    lkLN(ctx, [38, bob + 6, 48, bob + 6], 3.2, '#1A1A1A');              /* chin cannon */
    lkLN(ctx, [38, bob + 6, 48, bob + 6], 1.2, '#5A5A5A');
    drawRotor(ctx, 0, bob, 70, 4, G.time * 30, '#1A1A1A', CT6_ARM);
    fillCircle(ctx, 0, bob, 5.6, p.deep); fillCircle(ctx, 0, bob, 3.6, p.lo); fillCircle(ctx, 0, bob, 1.6, CT6_ARM);   /* rotor hub */
  },
  abrams(ctx, e, b, dk, bob, wind, d){
    const p = ct6_pal(b, dk), tp = ct6_pal(d.pale, dk);
    if (e.state === 'dash' || e.state === 'wind') softBlob(ctx, 10, bob, 58, '#FF5A2C', 0.12);
    drawTreads(ctx, -46, bob - 35, 92, 14, '#3A3628', e.anim);
    drawTreads(ctx, -46, bob + 21, 92, 14, '#3A3628', e.anim);
    ct6_poly(ctx, CT6_AB_HULL, b, p.deep, 1.8, 0, bob);                  /* hull with a sloped glacis */
    ct6_poly(ctx, CT6_AB_GLAC, p.hi, p.deep, 1.4, 0, bob);
    ctx.globalAlpha = 0.4;                                               /* desert-and-brown camouflage */
    lkOV(ctx, -20, bob + 12, 14, 5, dk, 0.2); lkOV(ctx, 6, bob - 16, 10, 3.6, dk, -0.15); lkOV(ctx, 28, bob + 10, 6, 3, dk, 0.4);
    ctx.globalAlpha = 1;
    ctx.fillStyle = p.lo; ctx.strokeStyle = p.deep; ctx.lineWidth = 1;   /* side skirt plates */
    for (let k = 0; k < 7; k++){
      const sx = -40 + k * 10.6;
      ctx.fillRect(sx, bob - 29.6, 9.6, 6); ctx.strokeRect(sx, bob - 29.6, 9.6, 6);
      ctx.fillRect(sx, bob + 23.6, 9.6, 6); ctx.strokeRect(sx, bob + 23.6, 9.6, 6);
    }
    ct6_rect(ctx, -40, bob - 17, 16, 34, p.mid, p.deep, 1.2);            /* engine deck */
    ctx.strokeStyle = p.deep; ctx.lineWidth = 1; ctx.beginPath();
    for (let k = 0; k < 6; k++){ ctx.moveTo(-37 + k * 2.6, bob - 15); ctx.lineTo(-37 + k * 2.6, bob + 15); } ctx.stroke();
    ctx.fillStyle = CT6_ARM; ctx.fillRect(-42.4, bob - 10, 2.4, 20);   /* recognition panel */
    fillCircle(ctx, -42, bob - 19, 1.4, CT6_RED); fillCircle(ctx, -42, bob + 19, 1.4, CT6_RED);   /* tail lights */
    fillCircle(ctx, 40, bob - 17, 1.8, '#FFD070'); fillCircle(ctx, 40, bob + 17, 1.8, '#FFD070');   /* headlights */
    fillCircle(ctx, 36, bob, 3.6, p.deep); fillCircle(ctx, 36, bob, 2.4, p.lo);                    /* driver's hatch */
    lkLN(ctx, [14, bob, 74, bob], 7.4, p.deep);                          /* the 120mm gun */
    lkLN(ctx, [14, bob, 74, bob], 5.6, dk);
    ct6_rect(ctx, 24, bob - 4.2, 28, 8.4, dk, p.deep, 1);               /* thermal sleeve */
    lkLN(ctx, [26, bob - 1.6, 50, bob - 1.6], 1, p.lo);
    ct6_rect(ctx, 50, bob - 3.6, 5, 7.2, dk, p.deep, 1);                /* bore evacuator */
    ct6_rect(ctx, 66, bob - 5, 8, 10, dk, p.deep, 1.2);
    fillCircle(ctx, 74, bob, 2, '#141210');
    ct6_poly(ctx, CT6_AB_TUR, d.pale, p.deep, 1.6, 0, bob);              /* angular turret */
    ct6_poly(ctx, CT6_AB_TURF, tp.hi, p.deep, 1.2, 0, bob);
    ctx.fillStyle = dk; ctx.strokeStyle = p.deep; ctx.lineWidth = 0.8;   /* ERA blocks on the cheeks */
    for (let k = 0; k < 3; k++){
      ctx.fillRect(-14 + k * 9, bob - 19.6, 7, 3.4); ctx.strokeRect(-14 + k * 9, bob - 19.6, 7, 3.4);
      ctx.fillRect(-14 + k * 9, bob + 16.2, 7, 3.4); ctx.strokeRect(-14 + k * 9, bob + 16.2, 7, 3.4);
    }
    ct6_rect(ctx, 20, bob - 8, 7, 16, dk, p.deep, 1.2);                  /* gun mantlet */
    ct6_rect(ctx, -14, bob - 4, 12, 8, '#E8742A', p.deep, 1);            /* air recognition panel */
    fillCircle(ctx, -4, bob - 10, 6, p.deep); fillCircle(ctx, -4, bob - 10, 4.6, dk);   /* commander cupola */
    fillCircle(ctx, -4, bob - 10, 2, p.lo);
    fillCircle(ctx, -4, bob + 10, 5, p.deep); fillCircle(ctx, -4, bob + 10, 3.8, dk);   /* loader hatch */
    lkLN(ctx, [-4, bob - 10, 10, bob - 12], 1.8, '#1A1A1A');            /* hatch machine gun */
    ct6_rect(ctx, 10, bob + 10, 5, 4, p.deep); fillCircle(ctx, 14, bob + 12, 0.9, CT6_ARM);   /* sight box */
    for (let k = -1; k <= 1; k++) fillCircle(ctx, 24, bob + k * 12 + (k === 0 ? 0 : 0), 1, '#141210');   /* smoke dischargers */
    const aw = Math.sin(e.anim * 2.4) * 3;
    lkCV(ctx, -22, bob + 16, -34, bob + 20 + aw * 0.3, -44, bob + 26 + aw, 1, '#26231A');   /* whip aerial */
    fillCircle(ctx, -44, bob + 26 + aw, 1.3, CT6_ARM);
  },
  sewergator(ctx, e, b, dk, bob, wind, d){
    const p = ct6_pal(b, dk), sw = Math.sin(e.anim * 1.2) * 10, belly = blendHex(b, d.pale, 0.28);
    for (let k = 0; k < 8; k++){                                         /* sinuous tapering tail */
      const t = k / 7, tx = -36 - 54 * t, ty = bob + sw * t * t, tr = 11.6 * (1 - t) + 1.4;
      fillCircle(ctx, tx, ty, tr + 1, p.deep);
    }
    for (let k = 0; k < 8; k++){
      const t = k / 7, tx = -36 - 54 * t, ty = bob + sw * t * t, tr = 11.6 * (1 - t) + 1.4;
      fillCircle(ctx, tx, ty, tr, b);
    }
    ctx.fillStyle = dk; ctx.beginPath();                                 /* dorsal spikes and tail bands */
    for (let k = 0; k < 7; k++){
      const t = (k + 0.6) / 7, tx = -36 - 54 * t, ty = bob + sw * t * t;
      ctx.moveTo(tx + 3, ty); ctx.lineTo(tx, ty - 3.4 + t * 1.6); ctx.lineTo(tx - 3, ty); ctx.lineTo(tx, ty + 3.4 - t * 1.6); ctx.closePath();
    }
    ctx.fill();
    for (const px of [-26, 16]) for (let s = -1; s <= 1; s += 2){        /* sprawling legs with claws */
      const lx = px + Math.sin(e.anim * 1.6 + px) * 3, ly = bob + s * 22;
      lkLN(ctx, [px, bob + s * 12, lx, ly], 7, p.deep);
      lkLN(ctx, [px, bob + s * 12, lx, ly], 5.6, b);
      lkOV(ctx, lx + 3, ly + s * 3, 8, 4.4, p.deep, s * 0.6);
      lkOV(ctx, lx + 3, ly + s * 3, 7, 3.6, b, s * 0.6);
      ctx.strokeStyle = '#D8D0B0'; ctx.lineWidth = 1.2; ctx.beginPath();
      ctx.moveTo(lx + 7, ly + s * 5); ctx.lineTo(lx + 11, ly + s * 6.4);
      ctx.moveTo(lx + 8, ly + s * 3); ctx.lineTo(lx + 12.4, ly + s * 3.4);
      ctx.moveTo(lx + 7, ly + s * 1); ctx.lineTo(lx + 11, ly + s * 0.6); ctx.stroke();
    }
    lkOV(ctx, -10, bob, 35.4, 19.4, p.deep);                             /* body */
    lkOV(ctx, -10, bob, 34, 18, b);
    ctx.globalAlpha = 0.5; lkOV(ctx, -10, bob - 15.4, 28, 2.6, belly); lkOV(ctx, -10, bob + 15.4, 28, 2.6, belly); ctx.globalAlpha = 1;   /* pale flank */
    ctx.fillStyle = p.lo; ctx.beginPath();                               /* armoured scutes */
    for (let r = -1; r <= 1; r++) for (let k = -4; k <= 3; k++){
      const sx = -12 + k * 7, sy = bob + r * 7;
      ctx.moveTo(sx + 3, sy); ctx.ellipse(sx, sy, 3, 2.4, 0, 0, TAU);
    }
    ctx.fill();
    ctx.fillStyle = dk; ctx.beginPath();
    for (let k = -4; k <= 3; k++){ ctx.moveTo(-12 + k * 7 + 1.4, bob); ctx.ellipse(-12 + k * 7, bob, 1.4, 1.2, 0, 0, TAU); }
    ctx.fill();
    ctx.fillStyle = p.hi2; ctx.globalAlpha = 0.6; ctx.beginPath();       /* highlights on the scutes */
    for (let r = -1; r <= 1; r++) for (let k = -4; k <= 3; k++){
      const sx = -12 + k * 7 - 0.8, sy = bob + r * 7 - 0.8;
      ctx.moveTo(sx + 1, sy); ctx.arc(sx, sy, 1, 0, TAU);
    }
    ctx.fill(); ctx.globalAlpha = 1;
    ctx.globalAlpha = 0.5;                                               /* sludge and algae from the storm drains */
    lkOV(ctx, -20, bob + 6, 8, 4, '#6A7A3A'); lkOV(ctx, 4, bob - 8, 6, 3, '#6A7A3A');
    ctx.globalAlpha = 1;
    lkOV(ctx, 22, bob, 13, 13, p.deep);                                  /* shoulders and head */
    lkOV(ctx, 22, bob, 12, 12, b);
    lkOV(ctx, 31, bob, 13, 11.4, p.deep);
    lkOV(ctx, 31, bob, 12.2, 10.6, b);
    lkOV(ctx, 45, bob, 16, 7.6, p.deep);
    lkOV(ctx, 45, bob, 15, 6.6, b);
    lkOV(ctx, 44, bob - 2, 12, 2, p.hi, null);                            /* lit snout top */
    ctx.fillStyle = '#E8E0C0'; ctx.beginPath();                          /* teeth along the jaw edge */
    for (let k = 0; k < 6; k++){
      const tx = 36 + k * 4;
      ctx.moveTo(tx, bob - 7.4); ctx.lineTo(tx + 1.2, bob - 4.8); ctx.lineTo(tx + 2.4, bob - 7.4);
      ctx.moveTo(tx, bob + 7.4); ctx.lineTo(tx + 1.2, bob + 4.8); ctx.lineTo(tx + 2.4, bob + 7.4);
    }
    ctx.fill();
    ctx.strokeStyle = '#141414'; ctx.lineWidth = 6.4;                    /* an old tyre stuck around its neck */
    ctx.beginPath(); ctx.ellipse(12, bob, 5, 16, 0, 0, TAU); ctx.stroke();
    ctx.strokeStyle = '#5A5A5E'; ctx.lineWidth = 1; ctx.beginPath();
    for (let k = -3; k <= 3; k++){ ctx.moveTo(9, bob + k * 4.4); ctx.lineTo(15, bob + k * 4.4); } ctx.stroke();
    ctx.strokeStyle = '#7A7A80'; ctx.lineWidth = 0.9; ctx.beginPath(); ctx.ellipse(10.2, bob, 4.6, 15.4, 0, -1.7, 1.7); ctx.stroke();
    for (let s = -1; s <= 1; s += 2){                                    /* bony eye ridges and golden slit eyes */
      lkOV(ctx, 26.4, bob + s * 8.6, 5.6, 4, p.hi, s * 0.2);
      fillCircle(ctx, 27, bob + s * 8.6, 3, d.pale);
      lkOV(ctx, 27.4, bob + s * 8.6, 0.7, 2.4, '#0A0A0A');
      fillCircle(ctx, 26.4, bob + s * 7.6, 0.7, '#FFFFFF');
    }
    lkE2(ctx, 57, bob, 3, 1.7, p.hi); lkE2(ctx, 57.4, bob, 3, 0.7, '#0A0A0A');   /* nostrils */
    if (e.state === 'roll') ringPath(ctx, 0, bob, 62, 3, '#8A9A6A', 0.4);
  },
  a10(ctx, e, b, dk, bob, wind, d){
    const p = ct6_pal(b, dk);
    softBlob(ctx, -54, bob, 20, d.pale, 0.25 + 0.1 * Math.sin(G.time * 20));   /* engine heat */
    ct6_poly(ctx, CT6_A10_WING, b, p.deep, 2, 0, bob);                   /* long straight wings with a dark rim */
    for (let s = -1; s <= 1; s += 2){
      ct6_poly(ctx, CT6_A10_FLAP, p.lo, p.deep, 1, 0, bob, s);          /* flaps and ailerons */
      ctx.globalAlpha = 0.5; ctx.fillStyle = dk;                         /* camouflage patches */
      for (let k = 0; k < CT6_A10_CAM.length; k++){
        const c = CT6_A10_CAM[k]; ctx.beginPath(); ctx.ellipse(c[0], bob + s * c[1], c[2], c[3], c[4] * s, 0, TAU); ctx.fill();
      }
      ctx.globalAlpha = 1;
      lkLN(ctx, [4.6, bob + s * 6, 0.8, bob + s * 50], 1.6, p.hi2);     /* lit leading edge */
      lkLN(ctx, [-9, bob + s * 24, 3, bob + s * 24], 0.9, p.deep);      /* panel seams */
      lkLN(ctx, [-10, bob + s * 36, 2, bob + s * 36], 0.9, p.deep);
      ctx.fillStyle = CT6_ARM; ctx.fillRect(-11.4, bob + s * 46 - 1.4, 11.8, 2.8);   /* warning band on the tips */
      fillCircle(ctx, -6, bob + s * 51.4, 1.6, s < 0 ? CT6_RED : '#6AD86A');           /* wing-tip nav lights */
    }
    for (const s of [-1, 1]) for (let k = 1; k <= 3; k++){               /* pylons and ordnance */
      const py = bob + s * (14 + k * 10);
      lkLN(ctx, [-5, py, 3, py], 2.4, p.deep);
      lkOV(ctx, 2, py, 8, 2.4, p.lo, 0); lkOV(ctx, 2, py - 0.6, 6, 0.8, p.hi, 0);
      fillCircle(ctx, 9.6, py, 1.7, k === 1 ? CT6_ARM : '#C8B060');
    }
    ct6_rect(ctx, -45, bob - 21, 10, 42, b, p.deep, 1.4);                /* tailplane */
    lkLN(ctx, [-38, bob - 20, -38, bob + 20], 1, p.deep);
    for (const s of [-1, 1]){                                            /* twin tail fins */
      ct6_rect(ctx, -47, bob + s * 21 - 1.6, 13, 3.2, dk, p.deep, 1);
      fillCircle(ctx, -46.6, bob + s * 21, 1.3, CT6_ARM);
    }
    for (const s of [-1, 1]){                                            /* twin engines on the back */
      lkLN(ctx, [-22, bob + s * 6, -22, bob + s * 11], 4, p.deep);
      ct6_ov(ctx, -26, bob + s * 11, 10, 5.4, p.lo, p.deep, 1.2);
      lkOV(ctx, -26, bob + s * 9.4, 7, 1.4, p.hi);
      fillCircle(ctx, -17, bob + s * 11, 3.4, '#1A1A1A'); fillCircle(ctx, -17, bob + s * 11, 1.5, '#5A5A5E');   /* inlet */
      fillCircle(ctx, -36, bob + s * 11, 3.2, dk); fillCircle(ctx, -36, bob + s * 11, 1.8, CT6_ARM);          /* exhaust */
    }
    lkOV(ctx, -2, bob, 45, 8.4, p.deep);                                 /* fuselage */
    lkOV(ctx, -2, bob, 44, 7.4, b);
    ctx.globalAlpha = 0.55; lkOV(ctx, 0, bob - 3, 36, 1.9, p.hi2); ctx.globalAlpha = 1;
    ctx.globalAlpha = 0.45; lkOV(ctx, -10, bob + 2.4, 9, 2.8, dk); lkOV(ctx, 8, bob - 1.6, 7, 2.2, dk); ctx.globalAlpha = 1;
    ctx.strokeStyle = p.deep; ctx.lineWidth = 0.9; ctx.beginPath();      /* panel lines */
    for (const x of [-30, -16, -4, 12]){ ctx.moveTo(x, bob - 6.6); ctx.lineTo(x, bob + 6.6); }
    ctx.stroke();
    ct6_ov(ctx, 26, bob, 7.4, 4.8, CT6_GLASS, p.deep, 1.2);              /* canopy */
    lkOV(ctx, 24, bob + 0.6, 3.4, 2.6, '#5A7A88');
    lkLN(ctx, [25.6, bob - 4.6, 25.6, bob + 4.6], 0.9, p.deep);
    ctx.globalAlpha = 0.6; lkOV(ctx, 28, bob - 1.8, 2.6, 1, '#FFFFFF'); ctx.globalAlpha = 1;
    ctx.fillStyle = '#B8261E'; ctx.beginPath();                          /* the famous shark-mouth nose art */
    ctx.moveTo(34, bob - 5.6); ctx.quadraticCurveTo(43, bob, 34, bob + 5.6); ctx.lineTo(38, bob); ctx.closePath(); ctx.fill();
    for (let k = -2; k <= 2; k++) lkTRI(ctx, 35 + Math.abs(k) * 0.6, bob + k * 2 - 0.8, 38.6, bob + k * 2, 35 + Math.abs(k) * 0.6, bob + k * 2 + 0.8, '#F4F4F0');
    fillCircle(ctx, 31.4, bob - 3.6, 1.1, '#F4F4F0'); fillCircle(ctx, 31.4, bob + 3.6, 1.1, '#F4F4F0');   /* shark eyes */
    fillCircle(ctx, 31.6, bob - 3.6, 0.5, '#141414'); fillCircle(ctx, 31.6, bob + 3.6, 0.5, '#141414');
    lkLN(ctx, [42, bob, 51, bob], 3, '#1A1A1A');                         /* the GAU-8 cannon */
    lkLN(ctx, [42, bob, 51, bob], 1.1, '#6A6A70');
    fillCircle(ctx, 51.4, bob, 1.8, '#1A1A1A');
  }
};


