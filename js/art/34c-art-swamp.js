'use strict';
/* Enemy art, Chapter 3: the swamp (SWAMP_DRAW). */
/* ======================== Chapter 3: the swamp ======================== */
/* Local helpers (prefix sw3_). Every creature is drawn in its own local space: +x is forward, +y its right side.
   Colors are always derived from b / dk (so the hit flash still washes them out); fixed colors are only used
   for eyes, teeth, metal-like accents and the lily-pad / algae greens that mark this swamp. */
const SW3_P = { x: 0, y: 0 };
/* a point on a quadratic curve (returned in a shared scratch object, read it straight away) */
function sw3_q(x0, y0, cx, cy, x1, y1, t){
  const u = 1 - t;
  SW3_P.x = u * u * x0 + 2 * u * t * cx + t * t * x1;
  SW3_P.y = u * u * y0 + 2 * u * t * cy + t * t * y1;
  return SW3_P;
}
/* the swamp's shared eye style: a colored iris, a dark pupil and one tiny glint */
function sw3_eye(ctx, x, y, r, iris, pup){
  fillCircle(ctx, x, y, r, iris);
  fillCircle(ctx, x + r * 0.15, y, r * 0.5, pup || '#0A0806');
  fillCircle(ctx, x + r * 0.35, y - r * 0.4, r * 0.28, '#FFFFFF');
}
/* a fan of n short toes / claws leaving (x, y) in direction (dx, dy) */
function sw3_toes(ctx, x, y, dx, dy, n, len, spread, w, c){
  ctx.strokeStyle = c; ctx.lineWidth = w; ctx.lineCap = 'round'; ctx.beginPath();
  for (let i = 0; i < n; i++){
    const a = (i - (n - 1) / 2) * spread, ca = Math.cos(a), sa = Math.sin(a);
    ctx.moveTo(x, y); ctx.lineTo(x + (dx * ca - dy * sa) * len, y + (dx * sa + dy * ca) * len);
  }
  ctx.stroke(); ctx.lineCap = 'butt';
}
/* several separate short strokes (whiskers, fur ticks) in one path: a = [x0, y0, x1, y1, x0, y0, ...] */
function sw3_segs(ctx, a, w, c){
  ctx.strokeStyle = c; ctx.lineWidth = w; ctx.lineCap = 'round'; ctx.beginPath();
  for (let i = 0; i < a.length; i += 4){ ctx.moveTo(a[i], a[i + 1]); ctx.lineTo(a[i + 2], a[i + 3]); }
  ctx.stroke(); ctx.lineCap = 'butt';
}
const SW3_CAT_SPOTS = [[-26, -10], [-20, 8], [-14, -15], [-10, 11], [-2, -9], [0, 13], [6, -14], [-6, 2], [-30, 0], [10, 8], [4, 0], [-16, -3]];
const SW3_BEAR_TUFTS = [[-36, -14], [-28, 12], [-18, -22], [-10, 20], [0, -26], [8, 14], [-24, 0], [-2, 4], [14, -16], [-38, 8]];

const SWAMP_DRAW = {
  nutria(ctx, e, b, dk, bob){
    const hi = blendHex(b, '#E8D2A0', 0.32), lo = shade(b, -0.22), sw = Math.sin(e.anim * 2) * 5;
    lkCV(ctx, -14, bob, -24, bob + sw, -32, bob, 2.2, '#8A6A58');   /* naked scaly rat tail */
    for (let k = 1; k <= 3; k++){ const p = sw3_q(-14, bob, -24, bob + sw, -32, bob, k * 0.25); lkLN(ctx, [p.x, p.y - 1.5, p.x, p.y + 1.5], 0.7, '#4A3426'); }
    for (let s = -1; s <= 1; s += 2){
      lkOV(ctx, -8, bob + s * 8.8, 5, 2.4, lo, s * 0.15);          /* big webbed hind feet */
      sw3_toes(ctx, -3.4, bob + s * 8.9, 1, s * 0.15, 3, 3.2, 0.45, 0.8, dk);
      lkOV(ctx, 7, bob + s * 7.6, 3.2, 1.8, lo, s * 0.2);          /* front paws */
      lkOV(ctx, 8.4, bob + s * 6.6, 2.4, 2, lo);                    /* small round ears */
      lkOV(ctx, 8.6, bob + s * 6.8, 1.2, 1, '#C89A80');
    }
    lkOV(ctx, -1, bob, 15, 9.5, b);
    lkOV(ctx, -3, bob, 11, 4.4, lo);                               /* darker saddle */
    lkOV(ctx, 0, bob - 5.6, 10, 1.4, hi); lkOV(ctx, 0, bob + 5.6, 10, 1.2, hi);
    ctx.strokeStyle = dk; ctx.lineWidth = 0.7; ctx.beginPath();    /* coarse guard hairs */
    for (let k = -2; k <= 1; k++){ ctx.moveTo(k * 5 - 2, bob - 3); ctx.lineTo(k * 5 + 1, bob - 5.8); }
    ctx.stroke();
    lkOV(ctx, 13, bob, 7.4, 6.4, b);
    lkOV(ctx, 11.6, bob - 2.2, 4, 1.4, hi);
    lkOV(ctx, 19.4, bob, 4, 4.2, '#E8DCC0');                       /* the white muzzle */
    fillCircle(ctx, 22.6, bob, 1.4, '#2A1C14');
    lkLN(ctx, [22.2, bob - 1.5, 25.4, bob - 1.5], 1.3, '#F28A2A'); lkLN(ctx, [22.2, bob + 1.5, 25.4, bob + 1.5], 1.3, '#F28A2A');   /* bright orange incisors */
    sw3_segs(ctx, [20, bob - 2.4, 25, bob - 6.4, 20, bob + 2.4, 25, bob + 6.4, 20.4, bob - 1.8, 25.4, bob - 3.2, 20.4, bob + 1.8, 25.4, bob + 3.2], 0.6, '#E0D8C4');
    sw3_eye(ctx, 15, bob - 3.4, 1.3, '#4A2E18'); sw3_eye(ctx, 15, bob + 3.4, 1.3, '#4A2E18');
  },
  bobcat(ctx, e, b, dk, bob, wind){
    if (wind) ringPath(ctx, 0, bob, 24, 2.5, '#FFFFFF', 0.7);
    const hi = blendHex(b, '#F4E6C0', 0.4), lo = shade(b, -0.2), tw = Math.sin(e.anim * 3) * 1.2;
    lkOV(ctx, -17, bob + tw * 0.4, 3.8, 3, b);                    /* the short "bobbed" tail: black bar, white tip */
    lkOV(ctx, -19.6, bob + tw * 0.6, 1.8, 2.8, dk);
    lkOV(ctx, -21.6, bob + tw * 0.8, 1.4, 2.3, '#F0E8DC');
    for (let s = -1; s <= 1; s += 2){
      lkOV(ctx, -9.5, bob + s * 9.2, 5.2, 2.6, lo, s * 0.2);       /* long hind legs */
      lkOV(ctx, -5, bob + s * 9.8, 2, 1.7, hi);
      lkOV(ctx, 8.5, bob + s * 8, 4.4, 2.2, lo, s * -0.2);          /* forelegs */
      lkOV(ctx, 12, bob + s * 8.4, 1.9, 1.6, hi);
    }
    lkOV(ctx, 0, bob, 16, 8.6, b);
    lkOV(ctx, -2, bob, 12, 2.6, lo);                               /* darker dorsal stripe */
    lkOV(ctx, 1, bob - 5, 11, 1.5, hi); lkOV(ctx, 1, bob + 5, 11, 1.5, hi);
    for (let k = 0; k < 12; k++){ const a = k * 2.4; fillCircle(ctx, -2 + Math.cos(a) * 11, bob + Math.sin(a) * 5.4, 1 + (k % 3) * 0.25, dk); }
    for (let k = -2; k <= 1; k++){ lkLN(ctx, [k * 5, bob - 7.4, k * 5 + 2, bob - 4.4], 1, dk); lkLN(ctx, [k * 5 + 2, bob + 7.4, k * 5 + 4, bob + 4.4], 1, dk); }
    for (let s = -1; s <= 1; s += 2){
      lkTRI(ctx, 9, bob + s * 4.6, 11.4, bob + s * 10.2, 14.6, bob + s * 5.4, dk);   /* tufted ears, black backs */
      lkLN(ctx, [11.4, bob + s * 10, 10.6, bob + s * 12.4], 0.8, dk);
      fillCircle(ctx, 11.6, bob + s * 7.2, 1, '#F0E8DC');          /* white ear spot */
    }
    lkOV(ctx, 15, bob, 7, 6.4, b);
    lkOV(ctx, 13, bob - 2.6, 4.4, 1.3, hi);
    sw3_segs(ctx, [14.6, bob - 2.4, 10.6, bob - 3.4, 14.6, bob + 2.4, 10.6, bob + 3.4, 15, bob, 10.6, bob], 0.9, dk);
    lkLN(ctx, [18, bob - 5, 15, bob - 8], 1.2, '#F0E8DC'); lkLN(ctx, [18, bob + 5, 15, bob + 8], 1.2, '#F0E8DC');   /* white cheek ruffs */
    lkOV(ctx, 20.2, bob, 2.8, 2.5, '#F0E8DC');
    fillCircle(ctx, 22.4, bob, 1, '#C88A80');
    sw3_eye(ctx, 16.6, bob - 3, 1.3, '#C8C84A'); sw3_eye(ctx, 16.6, bob + 3, 1.3, '#C8C84A');
  },
  feralhog(ctx, e, b, dk, bob, wind, d){
    if (wind) ringPath(ctx, 0, bob, 32, 4, '#FF6A4A', 0.6);
    const warm = blendHex(b, '#C8A478', 0.42), rim = blendHex(b, '#9A7A58', 0.5), lo = shade(b, -0.3), sw = Math.sin(e.anim * 2) * 3;
    lkCV(ctx, -28, bob, -35, bob + sw, -32, bob + 6 + sw * 0.5, 1.8, rim);    /* the little corkscrew tail */
    fillCircle(ctx, -32, bob + 6 + sw * 0.5, 1.8, warm);
    for (const px of [-14, 10]) for (let s = -1; s <= 1; s += 2){
      lkOV(ctx, px, bob + s * 16.4, 5.6, 3, lo, s * 0.15);          /* stout trotters */
      lkOV(ctx, px + 4.4, bob + s * 16.8, 2.2, 2.6, '#1C1612');
      lkLN(ctx, [px + 3.6, bob + s * 16.8, px + 6.4, bob + s * 16.8], 0.6, rim);
    }
    lkOV(ctx, -2, bob, 29.8, 18.8, rim);                            /* a lighter bristly rim so the dark hide reads */
    lkOV(ctx, -2, bob, 28, 17, b);
    lkOV(ctx, -4, bob + 9, 20, 6, lo);
    lkOV(ctx, -4, bob - 10, 20, 3, blendHex(b, warm, 0.5));
    fillCircle(ctx, -12, bob - 8, 3.2, '#5E4E36'); fillCircle(ctx, 4, bob + 9, 2.6, '#5E4E36'); fillCircle(ctx, -20, bob + 5, 2.2, '#5E4E36'); fillCircle(ctx, 8, bob - 10, 1.8, '#5E4E36');   /* dried wallow mud */
    lkLN(ctx, [-27, bob, 16, bob], 3, lo);
    for (let k = -5; k <= 3; k++){                                  /* the razorback's bristle ridge */
      lkTRI(ctx, k * 5 - 2, bob - 2, k * 5, bob - 7.4, k * 5 + 2, bob - 2, warm);
      lkTRI(ctx, k * 5 - 2, bob + 2, k * 5, bob + 7.4, k * 5 + 2, bob + 2, warm);
    }
    for (let s = -1; s <= 1; s += 2){
      lkTRI(ctx, 14, bob + s * 7, 13, bob + s * 15, 21.4, bob + s * 9, lo);      /* big floppy ears */
      lkTRI(ctx, 15.2, bob + s * 8.6, 14.8, bob + s * 12.8, 19.4, bob + s * 9.8, d.pale);
    }
    lkOV(ctx, 22, bob, 13.2, 11.2, rim);
    lkOV(ctx, 22, bob, 12, 10, b);
    lkOV(ctx, 20, bob - 3.6, 7, 2, warm);
    lkLN(ctx, [26, bob - 2.6, 20, bob - 3.2], 0.8, lo); lkLN(ctx, [26, bob + 2.6, 20, bob + 3.2], 0.8, lo);
    lkOV(ctx, 31, bob, 7.6, 5.6, blendHex(b, warm, 0.3));         /* long snout */
    lkOV(ctx, 35, bob, 4.4, 6, d.pale);                             /* rooting disc */
    lkE2(ctx, 35.4, bob, 2, 0.9, '#3A1A10');
    for (let s = -1; s <= 1; s += 2) lkTRI(ctx, 31, bob + s * 5, 33, bob + s * 7, 39, bob + s * 12, '#F2EEE0');   /* tusks */
    for (let s = -1; s <= 1; s += 2) sw3_eye(ctx, 26, bob + s * 5.4, 1.6, '#C8802A', '#0E0A06');
  },
  bullfrog(ctx, e, b, dk, bob, wind, d){
    const hi = blendHex(b, '#D8F0A0', 0.35), lo = shade(b, -0.28), p = Math.sin(e.anim * 2.4) * 0.6;
    for (let s = -1; s <= 1; s += 2){
      lkOV(ctx, -10, bob + s * 11, 9, 4.4, b, s * 0.7);              /* folded hind legs */
      lkOV(ctx, -9.5, bob + s * 16.4, 6.5, 2.6, b, s * 0.12);
      lkOV(ctx, -18, bob + s * 15.8, 4.2, 2, lo, s * 0.1);           /* webbed hind feet */
      sw3_toes(ctx, -21.6, bob + s * 15.8, -1, s * 0.1, 4, 3.4, 0.4, 0.9, lo);
      lkLN(ctx, [-14, bob + s * 8.6, -11, bob + s * 13.6], 1, dk); lkLN(ctx, [-8, bob + s * 10, -5, bob + s * 15], 1, dk);   /* barred thighs */
      lkOV(ctx, 7, bob + s * 10, 5, 2.4, b, s * -0.6);               /* forelegs */
      lkOV(ctx, 11.4, bob + s * 13.6, 3, 1.6, lo, s * -0.5);
      sw3_toes(ctx, 13.6, bob + s * 14.2, 1, s * 0.3, 3, 2.8, 0.45, 0.9, lo);
    }
    lkOV(ctx, 0, bob, 14, 12, b);
    lkOV(ctx, -3, bob - 4.4, 8.4, 3, hi);
    lkCV(ctx, 6, bob - 8.4, -2, bob - 9.6, -11, bob - 6, 1, dk); lkCV(ctx, 6, bob + 8.4, -2, bob + 9.6, -11, bob + 6, 1, dk);   /* dorsolateral folds */
    const sp = [[-6, -4, 2.8, 1.9, 0.4], [-2, 4, 2.4, 1.6, -0.5], [-9, 2, 1.9, 1.5, 0.2], [2, -3.4, 1.7, 1.2, 0.8], [-12, -3, 1.4, 1.1, 0], [-5, 7.4, 1.5, 1, 0.3]];
    for (let i = 0; i < sp.length; i++) lkOV(ctx, sp[i][0], bob + sp[i][1], sp[i][2], sp[i][3], dk, sp[i][4]);
    lkOV(ctx, 16.4, bob, 3.2 + p, 4.6 + p * 0.6, d.pale);          /* the pulsing vocal sac */
    lkOV(ctx, 8.4, bob, 7, 8.4, b);
    lkOV(ctx, 10, bob - 1.2, 5, 5.4, hi);
    lkOV(ctx, 14.2, bob, 3.4, 4.2, hi);
    lkLN(ctx, [12.4, bob - 4.8, 17, bob - 1.6], 0.8, dk); lkLN(ctx, [12.4, bob + 4.8, 17, bob + 1.6], 0.8, dk);
    fillCircle(ctx, 16.8, bob - 1.1, 0.5, dk); fillCircle(ctx, 16.8, bob + 1.1, 0.5, dk);
    for (let s = -1; s <= 1; s += 2){
      fillCircle(ctx, 5.6, bob + s * 7.4, 3.2, '#C8B868'); fillCircle(ctx, 5.6, bob + s * 7.4, 2.4, '#6A5A2A');   /* big round eardrums */
      fillCircle(ctx, 11, bob + s * 5, 3.5, hi);
      sw3_eye(ctx, 11.4, bob + s * 5, 2.5, '#E8C84A', '#0A0A0A');
    }
  },
  tadpole(ctx, e, b, dk, bob){
    const c = blendHex(b, '#A8A04A', 0.5), hi = blendHex(c, '#F0E8A0', 0.4);
    const w1 = Math.sin(e.anim * 8) * 4, w2 = Math.sin(e.anim * 8 + 1) * 3;
    ctx.globalAlpha = 0.5; lkCV(ctx, -3, bob, -10, bob + w1, -15, bob + w2, 5.6, hi); ctx.globalAlpha = 1;   /* the finned tail */
    lkCV(ctx, -3, bob, -10, bob + w1, -15, bob + w2, 2.2, c);
    lkOV(ctx, -3.4, bob - 3.6, 1.8, 1.1, shade(c, -0.2), -0.4); lkOV(ctx, -3.4, bob + 3.6, 1.8, 1.1, shade(c, -0.2), 0.4);   /* hind-leg buds */
    lkLN(ctx, [3, bob - 4, 1.4, bob - 6.6], 0.9, '#B8604A'); lkLN(ctx, [3, bob + 4, 1.4, bob + 6.6], 0.9, '#B8604A');       /* feathery gills */
    lkOV(ctx, 2, bob, 5.6, 4.6, c);
    lkOV(ctx, 3, bob - 1.8, 3.2, 1.2, hi);
    fillCircle(ctx, -0.4, bob + 1.2, 0.9, dk); fillCircle(ctx, 1.6, bob - 0.6, 0.7, dk); fillCircle(ctx, -1.6, bob - 1.6, 0.7, dk);
    sw3_eye(ctx, 4.6, bob - 2.3, 1.2, '#D8C84A'); sw3_eye(ctx, 4.6, bob + 2.3, 1.2, '#D8C84A');
  },
  heron(ctx, e, b, dk, bob, wind, d){
    const hi = blendHex(b, '#E0E8F0', 0.42), lo = shade(b, -0.2), fl = Math.sin(e.anim * 1.4) * 0.35;
    lkLN(ctx, [-8, bob - 1.4, -26, bob - 2.4], 1, '#B0A060'); lkLN(ctx, [-8, bob + 1.4, -26, bob + 2.6], 1, '#B0A060');   /* long legs trailing */
    lkLN(ctx, [-26, bob - 2.4, -29, bob - 4], 0.8, '#B0A060'); lkLN(ctx, [-26, bob + 2.6, -29, bob + 4.4], 0.8, '#B0A060');
    for (let side = -1; side <= 1; side += 2){
      ctx.save(); ctx.rotate(side * fl);
      lkOV(ctx, -3, side * 15, 15, 6.4, b, side * 0.28);
      lkOV(ctx, -1, side * 13.4, 10.5, 3, hi, side * 0.28);       /* paler wing coverts */
      lkOV(ctx, -3 - 10.8, side * 19.5, 5.4, 3.5, dk, side * 0.28);
      for (let j = 0; j < 3; j++) lkLN(ctx, [-10 - j * 3.4, side * (18 + j * 0.6), -14 - j * 3.4, side * (22.6 + j * 0.4)], 0.8, dk);   /* black flight feathers */
      ctx.restore();
    }
    lkOV(ctx, -2, bob, 10, 6.4, b);
    lkOV(ctx, 2, bob, 5.4, 3.4, hi);
    lkOV(ctx, -5, bob - 4.8, 5.4, 1.5, dk); lkOV(ctx, -5, bob + 4.8, 5.4, 1.5, dk);           /* dark flank plumes */
    lkCV(ctx, 6, bob, 10, bob + Math.sin(e.anim) * 3, 14, bob, 2.6, '#C8D0D8');   /* the long pale neck */
    lkCV(ctx, 6.5, bob + 1, 10, bob + Math.sin(e.anim) * 3 + 1, 13.5, bob + 0.6, 0.8, lo);
    lkOV(ctx, 15, bob, 3.6, 3, '#E8ECEE');
    lkLN(ctx, [14, bob - 1.8, 6, bob - 5.2], 1.3, '#141414'); lkLN(ctx, [14, bob + 1.8, 7, bob + 4.8], 1, '#141414');   /* black head plumes */
    lkTRI(ctx, 17, bob - 1.3, 29, bob, 17, bob + 1.3, d.pale);     /* dagger bill */
    lkLN(ctx, [17, bob, 29, bob], 0.6, shade(d.pale, -0.35));
    sw3_eye(ctx, 15.8, bob - 1.7, 1, '#E8C84A'); sw3_eye(ctx, 15.8, bob + 1.7, 1, '#E8C84A');
  },
  otter(ctx, e, b, dk, bob, wind, d){
    const hi = blendHex(b, '#E0C090', 0.36), lo = shade(b, -0.22), sw = Math.sin(e.anim * 2.4) * 4;
    lkTRI(ctx, -12, bob - 4, -28, bob + sw, -12, bob + 4, b);     /* thick tapering rudder tail */
    lkTRI(ctx, -12, bob - 1.6, -24, bob + sw * 0.9, -12, bob + 1.6, hi);
    for (let s = -1; s <= 1; s += 2){
      lkOV(ctx, -8, bob + s * 7.6, 5.2, 2.4, lo, s * 0.15);       /* webbed hind feet */
      sw3_toes(ctx, -3.2, bob + s * 7.8, 1, s * 0.15, 3, 3, 0.45, 0.8, dk);
      lkOV(ctx, 9, bob + s * 6.2, 3.2, 1.8, lo, s * 0.2);
    }
    lkOV(ctx, -1, bob, 15, 7, b);
    lkOV(ctx, 0, bob - 3.4, 11, 1.4, hi);                          /* wet sheen */
    lkOV(ctx, -1, bob + 4.4, 12, 1.5, lo);
    for (let k = -2; k <= 2; k++) lkLN(ctx, [k * 4.4 - 3, bob - 1.2, k * 4.4 - 5, bob + 2.4], 0.7, lo);
    lkE2(ctx, 10, bob, 4.8, 1.5, dk); lkE2(ctx, 10.2, bob, 4.8, 0.7, '#C89A80');
    lkOV(ctx, 13, bob, 6, 5.4, b);
    lkOV(ctx, 11.4, bob - 2.2, 3.6, 1.2, hi);
    lkOV(ctx, 16, bob, 3.6, 4.2, d.pale);
    fillCircle(ctx, 19.4, bob, 1.3, '#141414');
    sw3_segs(ctx, [18, bob - 2, 23, bob - 5, 18, bob + 2, 23, bob + 5, 18.4, bob - 1, 23.4, bob - 2, 18.4, bob + 1, 23.4, bob + 2], 0.6, '#E8E0D0');
    sw3_eye(ctx, 14.5, bob - 2.4, 1.2, '#4A3018'); sw3_eye(ctx, 14.5, bob + 2.4, 1.2, '#4A3018');
  },
  beaver(ctx, e, b, dk, bob, wind, d){
    if (wind) ringPath(ctx, 0, bob, 25, 3, '#FF9C6A', 0.6);
    const hi = blendHex(b, '#E0BE8A', 0.34), lo = shade(b, -0.24);
    ctx.save(); ctx.translate(-24, bob); ctx.rotate(Math.sin(e.anim * 1.6) * 0.15);   /* flat scaly paddle tail */
    lkOV(ctx, 0, 0, 9.4, 6.8, '#7A6044');
    lkOV(ctx, 0, 0, 8.4, 5.9, '#4C3826');
    ctx.strokeStyle = '#7A6244'; ctx.lineWidth = 0.7; ctx.beginPath();
    for (let k = -2; k <= 2; k++){ ctx.moveTo(-8, k * 2.4); ctx.lineTo(8, k * 2.4); ctx.moveTo(k * 3, -5.8); ctx.lineTo(k * 3, 5.8); }
    ctx.stroke(); ctx.restore();
    for (let s = -1; s <= 1; s += 2){
      lkOV(ctx, -12, bob + s * 12.4, 6.4, 2.8, lo, s * 0.25);     /* big webbed hind feet */
      sw3_toes(ctx, -6.2, bob + s * 12.8, 1, s * 0.25, 4, 3.4, 0.4, 0.9, dk);
      lkOV(ctx, 10, bob + s * 9.4, 3.6, 2, lo, s * 0.2);
      lkOV(ctx, 11, bob + s * 7.4, 2.4, 2, lo);                     /* small ears */
    }
    lkOV(ctx, -2, bob, 18, 13, b);
    lkOV(ctx, -5, bob, 12, 6.6, lo);
    lkOV(ctx, -2, bob - 8, 13, 2.6, hi);
    ctx.strokeStyle = dk; ctx.lineWidth = 0.8; ctx.beginPath();    /* fur strokes */
    for (let k = -2; k <= 2; k++){ ctx.moveTo(k * 6 - 4, bob - 3); ctx.lineTo(k * 6 - 1, bob - 6.4); }
    ctx.stroke();
    lkOV(ctx, 16, bob, 8, 7.4, b);
    lkOV(ctx, 14, bob - 3, 5, 1.6, hi);
    lkE2(ctx, 11.4, bob, 6.8, 1.4, dk); lkE2(ctx, 11.6, bob, 6.8, 0.7, '#C89A80');
    lkOV(ctx, 21.6, bob, 3.4, 3.6, hi);
    ctx.fillStyle = d.pale; ctx.fillRect(22, bob - 2, 3, 4);       /* orange gnawing teeth */
    lkLN(ctx, [22, bob, 25, bob], 0.5, shade(d.pale, -0.4));
    fillCircle(ctx, 22.4, bob - 3.8, 0.6, dk); fillCircle(ctx, 22.4, bob + 3.8, 0.6, dk);
    sw3_segs(ctx, [22, bob - 3, 26, bob - 5.6, 22, bob + 3, 26, bob + 5.6], 0.5, '#E0D4B8');
    sw3_eye(ctx, 18, bob - 3.4, 1.3, '#3A2410'); sw3_eye(ctx, 18, bob + 3.4, 1.3, '#3A2410');
  },
  raccoon(ctx, e, b, dk, bob, wind, d){
    const hi = blendHex(b, '#F4F4EE', 0.3), lo = shade(b, -0.22);
    for (let k = 0; k < 6; k++){                                    /* long ringed tail, tapering to a black tip */
      const y = bob + Math.sin(e.anim * 2 + k * 0.5) * 2, r = 3.7 - k * 0.24;
      fillCircle(ctx, -12 - k * 3.4, y, r, k === 5 ? dk : (k % 2 ? dk : hi));
    }
    for (let s = -1; s <= 1; s += 2){
      lkOV(ctx, -7, bob + s * 9.2, 3.8, 2, dk, s * 0.2);          /* dark hind feet */
      sw3_toes(ctx, -3.6, bob + s * 9.4, 1, s * 0.2, 3, 2.6, 0.5, 0.6, '#C8C8C0');
      lkOV(ctx, 8.4, bob + s * 8.4, 3.2, 1.8, dk, s * -0.2);      /* little black hands */
      sw3_toes(ctx, 11, bob + s * 8.2, 1, s * -0.2, 3, 2.4, 0.5, 0.6, '#C8C8C0');
    }
    lkOV(ctx, -1, bob, 12, 10, b);
    lkOV(ctx, -3, bob, 8.4, 4.4, lo);                              /* darker back */
    lkOV(ctx, 0, bob - 6.4, 8, 1.4, hi);
    ctx.strokeStyle = dk; ctx.lineWidth = 0.6; ctx.beginPath();
    for (let k = -1; k <= 1; k++){ ctx.moveTo(k * 4.4 - 3, bob - 3.4); ctx.lineTo(k * 4.4 - 1, bob - 6); }
    ctx.stroke();
    lkE2(ctx, 7.6, bob, 5.8, 2.7, b); lkE2(ctx, 7.8, bob, 5.8, 1.5, dk); lkE2(ctx, 7.4, bob, 7.4, 0.8, d.pale);   /* rounded ears, pale rims */
    lkOV(ctx, 12, bob, 7.4, 7, b);
    lkOV(ctx, 10, bob, 4.4, 2.8, hi);
    lkLN(ctx, [11, bob, 18, bob], 1.5, dk);                         /* dark nose stripe */
    lkOV(ctx, 14, bob, 2.8, 6.2, dk);                               /* the bandit mask */
    lkE2(ctx, 11.8, bob, 4.8, 1.1, d.pale);                         /* pale brow patches */
    lkOV(ctx, 18.5, bob, 3, 2.6, d.pale); fillCircle(ctx, 21, bob, 1.2, '#141414');
    sw3_segs(ctx, [19, bob - 2, 24, bob - 5, 19, bob + 2, 24, bob + 5], 0.5, '#D8D8D0');
    sw3_eye(ctx, 14.4, bob - 2.7, 1.2, '#F2E0A0'); sw3_eye(ctx, 14.4, bob + 2.7, 1.2, '#F2E0A0');
  },
  opossum(ctx, e, b, dk, bob, wind, d){
    const hi = blendHex(b, '#FFFFFF', 0.35), lo = shade(b, -0.2);
    const ty = bob + Math.sin(e.anim * 2) * 4;
    lkCV(ctx, -13, bob, -24, bob + 10, -30, ty, 2, '#E8A8A8');    /* naked pink prehensile tail */
    lkCV(ctx, -30, ty, -33, ty - 3, -30.4, ty - 5, 1.4, '#E8A8A8');
    for (let k = 1; k <= 3; k++){ const p = sw3_q(-13, bob, -24, bob + 10, -30, ty, k * 0.25); lkLN(ctx, [p.x - 0.6, p.y - 1.4, p.x - 0.6, p.y + 1.4], 0.6, '#B87A7A'); }
    for (let s = -1; s <= 1; s += 2){
      lkOV(ctx, -7, bob + s * 8.8, 3.8, 2, dk, s * 0.2);          /* dark feet, pink toes */
      sw3_toes(ctx, -3.4, bob + s * 9, 1, s * 0.2, 3, 2.6, 0.5, 0.8, '#E8A8A8');
      lkOV(ctx, 8, bob + s * 7.4, 3, 1.8, dk, s * -0.2);
      sw3_toes(ctx, 10.4, bob + s * 7.4, 1, s * -0.2, 3, 2.4, 0.5, 0.8, '#E8A8A8');
    }
    lkOV(ctx, -1, bob, 14, 9.5, b);
    lkOV(ctx, -3, bob, 9.6, 4.6, lo);                              /* darker underfur showing through */
    ctx.strokeStyle = '#D4D4CE'; ctx.lineWidth = 0.8; ctx.beginPath();   /* long white guard hairs */
    for (let k = 0; k < 14; k++){ const a = k / 14 * TAU; ctx.moveTo(-1 + Math.cos(a) * 12, bob + Math.sin(a) * 8); ctx.lineTo(-1 + Math.cos(a) * 16, bob + Math.sin(a) * 11); }
    ctx.stroke();
    ctx.strokeStyle = hi; ctx.lineWidth = 0.7; ctx.beginPath();
    for (let k = -1; k <= 1; k++){ ctx.moveTo(k * 5 - 3, bob - 2); ctx.lineTo(k * 5, bob - 5); }
    ctx.stroke();
    lkE2(ctx, 10, bob, 6.4, 2.6, dk); lkE2(ctx, 10.2, bob, 6.4, 1.3, '#E8A8A8');   /* bare black ears, pink inside */
    lkTRI(ctx, 9, bob - 6, 25, bob, 9, bob + 6, d.pale);          /* pointed white face */
    lkTRI(ctx, 9, bob - 1.6, 17, bob, 9, bob + 1.6, '#C8C8C2');    /* gray crown stripe */
    lkLN(ctx, [15.4, bob - 1.6, 11, bob - 4.6], 0.9, dk); lkLN(ctx, [15.4, bob + 1.6, 11, bob + 4.6], 0.9, dk);
    fillCircle(ctx, 24.4, bob, 1.6, '#E88A9A');
    sw3_segs(ctx, [20, bob - 1, 26, bob - 3.6, 20, bob + 1, 26, bob + 3.6], 0.5, '#8A8A86');
    sw3_eye(ctx, 15.6, bob - 2.6, 1.3, '#2A2018', '#0A0806'); sw3_eye(ctx, 15.6, bob + 2.6, 1.3, '#2A2018', '#0A0806');
  },
  cottonmouth(ctx, e, b, dk, bob, wind, d){
    const c = blendHex(b, '#A89A5E', 0.4), rim = blendHex(b, '#D0C48C', 0.5), band = blendHex(c, dk, 0.5);
    const gape = (e.state === 'dash' || e.state === 'wind');
    lkCHAIN(ctx, 9, -24, 4, 4, e.anim * 3, 3.2, 5.8, rim, bob);   /* pale belly-scale edge so the dark coils read */
    const pts = lkCHAIN(ctx, 9, -24, 4, 4, e.anim * 3, 2.4, 4.8, c, bob);
    for (let k = 1; k < pts.length - 1; k += 2) lkOV(ctx, pts[k].x, pts[k].y, pts[k].r * 0.55, pts[k].r * 0.95, band);   /* dark crossbands */
    for (let k = 0; k < pts.length - 1; k += 2) fillCircle(ctx, pts[k].x, pts[k].y - pts[k].r * 0.35, pts[k].r * 0.28, blendHex(c, '#F0E8B8', 0.4));
    fillCircle(ctx, pts[0].x - 2.4, pts[0].y, 1.7, c);             /* tapering tail tip */
    fillCircle(ctx, pts[0].x - 4.2, pts[0].y, 1.1, c);
    if (!gape){                                                     /* flickering forked tongue */
      const t = Math.sin(e.anim * 10) * 1.4;
      lkLN(ctx, [13, bob, 17.4, bob + t * 0.4], 0.8, '#D84A4A');
      lkLN(ctx, [17.4, bob + t * 0.4, 19.4, bob + t + 1.2], 0.7, '#D84A4A'); lkLN(ctx, [17.4, bob + t * 0.4, 19.4, bob + t - 1.2], 0.7, '#D84A4A');
    }
    lkTRI(ctx, 4, bob - 5.4, 14, bob, 4, bob + 5.4, c);           /* broad triangular pit-viper head */
    lkOV(ctx, 5.4, bob, 3.6, 5.6, c);                               /* heavy jowls */
    lkLN(ctx, [12.6, bob - 1.4, 5.2, bob - 4.6], 1.3, dk); lkLN(ctx, [12.6, bob + 1.4, 5.2, bob + 4.6], 1.3, dk);   /* dark eye stripes */
    lkLN(ctx, [12.4, bob - 2.4, 7, bob - 5.2], 0.7, '#E8E4C8'); lkLN(ctx, [12.4, bob + 2.4, 7, bob + 5.2], 0.7, '#E8E4C8');   /* pale lip scales */
    if (gape){                                                      /* the white "cotton" mouth gaping */
      lkTRI(ctx, 8, bob - 3, 18.4, bob - 6.4, 12, bob, shade(b, -0.3));
      lkTRI(ctx, 8, bob + 3, 18.4, bob + 6.4, 12, bob, shade(b, -0.3));
      lkOV(ctx, 13.4, bob, 4.6, 3.4, d.pale);
      lkTRI(ctx, 15.4, bob - 2.6, 16.4, bob - 4.6, 17, bob - 2, '#FFFFFF'); lkTRI(ctx, 15.4, bob + 2.6, 16.4, bob + 4.6, 17, bob + 2, '#FFFFFF');   /* fangs */
    }
    lkE2(ctx, 8.4, bob, 3, 1.15, '#C8A84A');
    lkE2(ctx, 8.4, bob, 3, 0.45, '#0A0806');
    fillCircle(ctx, 12.8, bob - 1.2, 0.4, dk); fillCircle(ctx, 12.8, bob + 1.2, 0.4, dk);
  },
  mosquito(ctx, e, b, dk, bob){
    const f = Math.sin(e.anim * 20) * 0.4, leg = blendHex(b, '#D0C0A0', 0.5), cream = '#DCD0B0';
    ctx.globalAlpha = 0.5;
    lkOV(ctx, -2, bob - 5.6, 6.6, 2.6, '#E8F0F4', -0.5 + f); lkOV(ctx, -2, bob + 5.6, 6.6, 2.6, '#E8F0F4', 0.5 - f);
    ctx.globalAlpha = 1;
    ctx.strokeStyle = '#B8C8D0'; ctx.lineWidth = 0.5; ctx.globalAlpha = 0.7; ctx.beginPath();   /* wing veins */
    for (let s = -1; s <= 1; s += 2){ const a = s * (0.5 - f); ctx.moveTo(-2 - Math.cos(a) * 6, bob + s * 5.6 - Math.sin(a) * 6); ctx.lineTo(-2 + Math.cos(a) * 6, bob + s * 5.6 + Math.sin(a) * 6); }
    ctx.stroke(); ctx.globalAlpha = 1;
    ctx.strokeStyle = leg; ctx.lineWidth = 0.7; ctx.beginPath();   /* long jointed legs */
    for (let s = -1; s <= 1; s += 2) for (let k = -1; k <= 1; k++){ ctx.moveTo(k * 2, bob + s * 1.4); ctx.lineTo(k * 3.6, bob + s * 4.8); ctx.lineTo(k * 3 - 3, bob + s * 8.6); }
    ctx.stroke();
    lkOV(ctx, -6.4, bob, 6.4, 2.4, b);                             /* striped abdomen */
    for (let k = 0; k < 3; k++) lkLN(ctx, [-9 + k * 3.2, bob - 2.2, -9 + k * 3.2, bob + 2.2], 0.9, cream);
    lkOV(ctx, 1, bob, 3.4, 2.6, blendHex(b, '#C8B898', 0.25));
    lkLN(ctx, [-1, bob, 3, bob], 0.8, cream);
    fillCircle(ctx, 4.4, bob, 1.8, dk);
    fillCircle(ctx, 5, bob - 1, 0.9, '#B83A2A'); fillCircle(ctx, 5, bob + 1, 0.9, '#B83A2A');
    lkLN(ctx, [5.4, bob - 0.8, 8, bob - 3.6], 0.5, leg); lkLN(ctx, [5.4, bob + 0.8, 8, bob + 3.6], 0.5, leg);   /* feathery antennae */
    lkLN(ctx, [5.4, bob, 13, bob], 0.9, dk);
  },
  panther(ctx, e, b, dk, bob, wind, d){
    const hi = blendHex(b, '#F4E2B8', 0.42), lo = shade(b, -0.24), ty = Math.sin(e.anim) * 22;
    lkCV(ctx, -38, bob, -56, bob + ty * 0.55, -66, bob + ty, 5.4, b);
    lkCV(ctx, -38, bob - 1.4, -56, bob + ty * 0.55 - 1.4, -66, bob + ty - 1.4, 1.4, hi);   /* long, heavy tail */
    const tp = sw3_q(-38, bob, -56, bob + ty * 0.55, -66, bob + ty, 0.76), tx = tp.x, tyy = tp.y;
    lkLN(ctx, [tx, tyy, -66, bob + ty], 6.2, dk);                 /* dark tail tip */
    fillCircle(ctx, -66, bob + ty, 3.4, dk);
    for (let s = -1; s <= 1; s += 2){
      lkOV(ctx, -24, bob + s * 22, 11, 6, lo, s * 0.25);          /* hind legs */
      lkOV(ctx, -14.4, bob + s * 23.6, 4.6, 3.6, b);
      sw3_toes(ctx, -11.6, bob + s * 24, 1, s * 0.1, 3, 3.4, 0.4, 1.1, dk);
      lkOV(ctx, 14, bob + s * 20.6, 9, 5, lo, s * -0.2);          /* forelegs */
      lkOV(ctx, 22.4, bob + s * 21.4, 4.2, 3.4, b);
      sw3_toes(ctx, 25.4, bob + s * 21.6, 1, s * 0.1, 3, 3.4, 0.4, 1.1, dk);
    }
    lkOV(ctx, -4, bob, 40, 24, b);
    ctx.globalAlpha = 0.25; lkOV(ctx, -6, bob, 30, 8, dk); ctx.globalAlpha = 1;   /* the dark dorsal stripe */
    lkOV(ctx, -6, bob + 15, 30, 6, lo);
    lkOV(ctx, -4, bob - 16, 28, 3.6, hi);
    lkOV(ctx, -24, bob - 6, 11, 8, hi, -0.3);                      /* hip highlight */
    for (let i = 0; i < SW3_CAT_SPOTS.length; i++) fillCircle(ctx, SW3_CAT_SPOTS[i][0], bob + SW3_CAT_SPOTS[i][1], 1.8, lo);   /* faint kitten spotting */
    lkCV(ctx, 10, bob - 18, 16, bob - 6, 11, bob + 6, 1.2, lo);   /* shoulder crease */
    for (let s = -1; s <= 1; s += 2){
      lkTRI(ctx, 30, bob + s * 11, 29, bob + s * 17.6, 36.6, bob + s * 12.4, b);   /* cheek ruff */
      lkOV(ctx, 20.6, bob + s * 12.4, 5.2, 4.8, dk);             /* round ears, black backs */
      lkOV(ctx, 21.4, bob + s * 12.2, 3.6, 3.2, b);
      lkOV(ctx, 21.8, bob + s * 12, 1.8, 1.6, '#D8A898');
    }
    lkOV(ctx, 30, bob, 15, 14, b);
    lkOV(ctx, 27, bob, 9, 3.4, hi);
    lkLN(ctx, [34, bob - 3, 28, bob - 4], 1.2, lo); lkLN(ctx, [34, bob + 3, 28, bob + 4], 1.2, lo); lkLN(ctx, [34.6, bob, 27, bob], 1.2, lo);   /* forehead stripes */
    lkOV(ctx, 41, bob, 7, 7.4, d.pale);
    fillCircle(ctx, 46, bob, 2.2, '#D8A898');
    lkLN(ctx, [46, bob, 46, bob + 3.6], 0.8, dk);
    for (let s = -1; s <= 1; s += 2){
      for (let k = 0; k < 3; k++) fillCircle(ctx, 41.6 + k * 1.8, bob + s * (3.6 + k * 0.4), 0.55, '#8A7458');   /* whisker pads */
      sw3_segs(ctx, [44, bob + s * 2, 53, bob + s * 7, 44.4, bob + s * 3.2, 52, bob + s * 11], 0.65, '#E8DCC8');
      lkLN(ctx, [32, bob + s * 8.4, 37, bob + s * 7.6], 1.1, dk);   /* heavy brow */
      sw3_eye(ctx, 34, bob + s * 6.2, 2.4, '#9AD84A', '#0A0A0A');
    }
    if (e.state === 'roar'){
      lkOV(ctx, 45, bob, 6, 5 + Math.sin(G.time * 30) * 1.5, '#6E1A1C');
      lkTRI(ctx, 43, bob - 4, 45, bob - 1.6, 47, bob - 4.4, '#F4EFE0'); lkTRI(ctx, 43, bob + 4, 45, bob + 1.6, 47, bob + 4.4, '#F4EFE0');   /* fangs */
      lkOV(ctx, 45, bob, 3.6, 1.8, '#C8605A');
    }
  },
  blackbear(ctx, e, b, dk, bob, wind, d){
    const hi = blendHex(b, '#A08868', 0.5), mid = blendHex(b, '#A08868', 0.28), rim = blendHex(b, '#B09878', 0.5);
    for (const px of [-22, 22]) for (let s = -1; s <= 1; s += 2){
      const st = Math.sin(e.anim + px) * 2;
      lkOV(ctx, px + st, bob + s * 32, 11.4, 8, rim);             /* lighter pad-edge under the dark legs */
      lkOV(ctx, px + st, bob + s * 32, 10, 7, b);
      lkOV(ctx, px + st - 2, bob + s * 30.6, 5.4, 2.4, mid);
      for (let k = -1; k <= 1; k++){                                /* long pale claws */
        const cy = bob + s * (34 + k * 3);
        lkLN(ctx, [px + 8 + st, cy, px + 12 + st, cy + s * k * 0.9], 1.5, '#D8D0C0');
      }
    }
    ctx.strokeStyle = dk; ctx.lineWidth = 2.2; ctx.beginPath();    /* shaggy fur fringe */
    for (let k = 0; k < 26; k++){ const a = k / 26 * TAU; ctx.moveTo(-4 + Math.cos(a) * 46, bob + Math.sin(a) * 32); ctx.lineTo(-4 + Math.cos(a) * 51, bob + Math.sin(a) * 36); }
    ctx.stroke();
    ctx.strokeStyle = rim; ctx.lineWidth = 1.2; ctx.beginPath();   /* frosted, sun-bleached fur tips */
    for (let k = 0; k < 26; k += 2){ const a = (k + 0.5) / 26 * TAU; ctx.moveTo(-4 + Math.cos(a) * 49, bob + Math.sin(a) * 34); ctx.lineTo(-4 + Math.cos(a) * 54, bob + Math.sin(a) * 38.5); }
    ctx.stroke();
    lkOV(ctx, -4, bob, 49.4, 35.4, rim);                           /* thin warm rim so the near-black hide separates from the swamp floor */
    lkOV(ctx, -4, bob, 48, 34, b);
    lkOV(ctx, 6, bob - 17, 30, 6, mid, -0.06);                      /* sunlit shoulder-to-haunch sheen */
    lkOV(ctx, -10, bob + 18, 24, 4.4, mid, 0.05);
    ctx.strokeStyle = hi; ctx.lineWidth = 1.2; ctx.beginPath();    /* hair-direction chevrons */
    for (let i = 0; i < SW3_BEAR_TUFTS.length; i++){ const t = SW3_BEAR_TUFTS[i]; ctx.moveTo(t[0] - 4, bob + t[1] - 1.4); ctx.lineTo(t[0] + 2, bob + t[1] + 1.4); }
    ctx.stroke();
    for (let s = -1; s <= 1; s += 2){
      lkOV(ctx, 30, bob + s * 14, 7.4, 6.6, dk);                   /* round ears */
      lkOV(ctx, 30.6, bob + s * 14, 5.6, 5, b);
      lkOV(ctx, 31, bob + s * 14, 3.2, 2.8, '#7A5E44');
    }
    lkOV(ctx, 38, bob, 19.2, 18.2, rim);
    lkOV(ctx, 38, bob, 18, 17, b);
    lkOV(ctx, 34, bob - 6, 10, 4, mid);
    lkLN(ctx, [44, bob - 6, 36, bob - 7.4], 1.4, hi); lkLN(ctx, [44, bob + 6, 36, bob + 7.4], 1.4, dk);   /* heavy brow ridges */
    lkOV(ctx, 52, bob, 9, 8, d.pale);                              /* the tan muzzle */
    lkOV(ctx, 51, bob - 2.8, 6, 2.2, blendHex(d.pale, '#FFFFFF', 0.25));
    lkLN(ctx, [58, bob + 2, 50, bob + 4.4], 0.8, shade(d.pale, -0.4)); lkLN(ctx, [58, bob - 2, 50, bob - 4.4], 0.8, shade(d.pale, -0.4));
    lkOV(ctx, 59, bob, 3.4, 4, '#141414');
    fillCircle(ctx, 60, bob - 1.2, 0.9, '#6A5E52');
    for (let s = -1; s <= 1; s += 2) sw3_eye(ctx, 44, bob + s * 6.4, 2.3, '#9A6A2C', '#0A0806');
  },
  snapper(ctx, e, b, dk, bob, wind, d){
    if (e.state === 'dash' || e.state === 'wind') softBlob(ctx, 10, bob, 52, '#FF5A2C', 0.1);
    const hi = blendHex(b, '#D8D08C', 0.38), rimC = blendHex(b, '#D0C890', 0.34), lo = shade(b, -0.28), skin = blendHex(d.pale, '#E8E0A8', 0.15);
    const sw = Math.sin(e.anim * 1.5) * 2;
    lkTRI(ctx, -38, bob - 6, -66, bob + sw, -38, bob + 6, d.pale);   /* the long, ridged tail */
    lkLN(ctx, [-40, bob, -64, bob + sw], 1, shade(d.pale, -0.3));
    for (let k = 0; k < 4; k++){
      const t = (2 + k * 6) / 26, yc = bob + sw * t;
      lkTRI(ctx, -44 - k * 6, yc - 1, -47 - k * 6, yc - 5.4, -50 - k * 6, yc - 1, dk);
      lkTRI(ctx, -44 - k * 6, yc + 1, -47 - k * 6, yc + 5.4, -50 - k * 6, yc + 1, dk);
    }
    for (const px of [-26, 24]) for (let s = -1; s <= 1; s += 2){
      lkOV(ctx, px, bob + s * 32, 10, 7, d.pale, s * 0.4);
      lkOV(ctx, px - 2, bob + s * 30, 5.4, 2.4, skin, s * 0.4);
      lkLN(ctx, [px - 4, bob + s * 33, px + 1, bob + s * 35.4], 0.8, shade(d.pale, -0.35));   /* scaly folds */
      for (let k = -1; k <= 1; k++){
        const cy = bob + s * (34 + k * 3);
        lkLN(ctx, [px + 8, cy, px + 11.6, cy + s * k * 0.8], 1.5, '#1A1A12');   /* heavy claws */
      }
    }
    ctx.fillStyle = rimC; ctx.beginPath();                         /* serrated shell rim */
    for (let k = 0; k <= 24; k++){ const a = k / 24 * TAU, rr = k % 2 ? 41 : 46; ctx.lineTo(-4 + Math.cos(a) * rr, bob + Math.sin(a) * rr * 0.78); }
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = dk; ctx.beginPath();
    for (let k = 0; k <= 24; k++){ const a = k / 24 * TAU, rr = k % 2 ? 38 : 42; ctx.lineTo(-4 + Math.cos(a) * rr, bob + Math.sin(a) * rr * 0.78); }
    ctx.closePath(); ctx.fill();
    lkOV(ctx, -4, bob, 39, 30, b);
    lkOV(ctx, -4, bob - 13, 30, 5, blendHex(b, hi, 0.4));          /* sunlit upper edge of the shell */
    ctx.strokeStyle = lo; ctx.lineWidth = 1.2; ctx.globalAlpha = 0.7;   /* concentric growth rings */
    ctx.beginPath(); ctx.ellipse(-4, bob, 30, 22.6, 0, 0, TAU); ctx.stroke();
    ctx.beginPath(); ctx.ellipse(-4, bob, 20, 15, 0, 0, TAU); ctx.stroke();
    ctx.globalAlpha = 1;
    for (const row of [-12, 0, 12]) for (let k = -3; k <= 3; k++){   /* three rows of ridged keels */
      const kx = -4 + k * 9;
      lkTRI(ctx, kx + 3.6, bob + row - 3.6, kx - 4.6, bob + row + 0.4, kx + 3.6, bob + row + 3.6, dk);
      lkTRI(ctx, kx + 2.6, bob + row - 2.4, kx - 2.4, bob + row - 0.2, kx + 2.6, bob + row + 0.4, hi);
    }
    fillCircle(ctx, -22, bob - 17, 3, '#5E7A34'); fillCircle(ctx, -17, bob - 19, 2, '#6E8A3A'); fillCircle(ctx, 8, bob + 18, 2.6, '#5E7A34'); fillCircle(ctx, 14, bob + 15, 1.8, '#6E8A3A'); fillCircle(ctx, -30, bob + 10, 2.2, '#5E7A34');   /* algae */
    lkOV(ctx, 44, bob, 18, 16, d.pale);
    lkOV(ctx, 41, bob - 5.6, 10, 4, skin);
    for (let k = 0; k < 3; k++){ lkLN(ctx, [34 + k * 3, bob - 10 + k, 36 + k * 3, bob - 7], 0.8, shade(d.pale, -0.35)); lkLN(ctx, [34 + k * 3, bob + 10 - k, 36 + k * 3, bob + 7], 0.8, shade(d.pale, -0.35)); }
    fillCircle(ctx, 40, bob + 4, 1, shade(d.pale, -0.4)); fillCircle(ctx, 46, bob - 2, 1, shade(d.pale, -0.4)); fillCircle(ctx, 36, bob - 1, 0.9, shade(d.pale, -0.4)); fillCircle(ctx, 52, bob + 5, 0.9, shade(d.pale, -0.4));
    const wg = Math.sin(e.anim * 5);
    lkCV(ctx, 58, bob + 3, 64, bob + 3 + wg * 3, 69, bob + 3 + Math.sin(e.anim * 5 + 1) * 5, 1.6, '#E08A9A');   /* the worm-like tongue lure */
    lkTRI(ctx, 54, bob - 6, 68, bob, 54, bob + 6, '#2A2A1A');      /* the hooked beak */
    lkTRI(ctx, 64, bob - 1.6, 71, bob + 1.4, 63, bob + 2.4, '#14140C');
    lkLN(ctx, [56, bob - 3.4, 66, bob - 0.6], 0.8, '#6A6A44');
    lkE2(ctx, 47.6, bob, 9.4, 3.6, shade(d.pale, -0.28));          /* brow ridge over each eye */
    for (let s = -1; s <= 1; s += 2){
      sw3_eye(ctx, 48, bob + s * 9, 2.5, '#C8A84A', '#0A0A0A');
      lkLN(ctx, [48 - 2.2, bob + s * 9, 48 + 2.4, bob + s * 9], 0.5, '#7A5E20');   /* the golden "star" radiating from the pupil */
    }
  },
  alligator(ctx, e, b, dk, bob){
    const sw = Math.sin(e.anim * 1.2) * 10;
    const rim = blendHex(b, '#A8B070', 0.4), scute = blendHex(b, '#98A860', 0.5), hi = blendHex(b, '#B0BA78', 0.3), cream = '#D8D4A8', lo = shade(b, -0.3);
    lkTRI(ctx, -37, bob - 12, -94, bob + sw, -37, bob + 12, rim);  /* tail, with a pale rim so the dark hide reads */
    lkTRI(ctx, -38, bob - 11, -92, bob + sw, -38, bob + 11, b);
    for (let k = 0; k < 8; k++){                                    /* double row of tail crest */
      const t = (6 + k * 6.5) / 54, yc = bob + sw * t, hw = 11 * (1 - t);
      lkTRI(ctx, -44 - k * 6.5, yc - 1.4, -47 - k * 6.5, yc - Math.min(7, hw * 0.8), -50 - k * 6.5, yc - 1.4, scute);
      lkTRI(ctx, -44 - k * 6.5, yc + 1.4, -47 - k * 6.5, yc + Math.min(7, hw * 0.8), -50 - k * 6.5, yc + 1.4, dk);
    }
    for (const px of [-26, 16]) for (let s = -1; s <= 1; s += 2){
      const lx = px + Math.sin(e.anim + px) * 3;
      lkOV(ctx, lx, bob + s * 22, 9.8, 5.6, rim, s * 0.6);
      lkOV(ctx, lx, bob + s * 22, 9, 5, b, s * 0.6);              /* sprawled legs */
      lkOV(ctx, lx + 3 * s * 0.5 + 6.4, bob + s * 26.6, 4.4, 2.4, hi, s * 0.2);
      sw3_toes(ctx, lx + 10.4, bob + s * 27.2, 1, s * 0.3, 4, 3.4, 0.4, 1, cream);
    }
    lkOV(ctx, -10, bob, 35.6, 19.6, rim);
    lkOV(ctx, -10, bob, 34, 18, b);
    lkOV(ctx, -10, bob + 12, 28, 4, lo);
    for (let r = -2; r <= 2; r++) for (let k = -4; k <= 4; k++){   /* rows of bony scutes: pale ridge in the middle, dark at the flanks */
      ctx.fillStyle = Math.abs(r) === 2 ? dk : (Math.abs(r) === 1 ? hi : scute);
      ctx.fillRect(-10 + k * 6.4 - 2 + (r & 1) * 1.4, bob + r * 5 - 1.6, 4, 3.2);
    }
    lkOV(ctx, 22, bob, 14.2, 14.6, rim);
    lkOV(ctx, 40, bob, 19.4, 12.2, rim);
    lkOV(ctx, 20, bob, 12, 13, b);
    lkOV(ctx, 40, bob, 18, 11, b);                                 /* broad rounded U snout, not a croc's V */
    lkOV(ctx, 22, bob - 5, 8, 3, hi);
    lkLN(ctx, [30, bob - 4, 50, bob - 3.4], 1, lo); lkLN(ctx, [30, bob + 4, 50, bob + 3.4], 1, lo);   /* cranial ridges */
    lkCV(ctx, 28, bob - 10.6, 44, bob - 11.2, 56, bob - 4.6, 1.2, cream); lkCV(ctx, 28, bob + 10.6, 44, bob + 11.2, 56, bob + 4.6, 1.2, cream);   /* pale jaw line */
    for (let k = 0; k < 6; k++){                                    /* interlocking teeth */
      const x = 31 + k * 4.6, ey = 11 * Math.sqrt(Math.max(0, 1 - ((x - 40) / 18) * ((x - 40) / 18)));
      lkTRI(ctx, x - 1.2, bob - ey + 0.4, x + 1.2, bob - ey + 0.4, x, bob - ey + 3.2, '#EFEAD0');
      lkTRI(ctx, x - 1.2 + 2.3, bob + ey - 0.4, x + 1.2 + 2.3, bob + ey - 0.4, x + 2.3, bob + ey - 3.2, '#EFEAD0');
    }
    lkE2(ctx, 55, bob, 3.6, 2, hi); lkE2(ctx, 55.4, bob, 3.6, 1.1, '#0A0A0A');   /* raised nostrils */
    lkE2(ctx, 23.4, bob, 8.2, 4.2, hi);                            /* raised eye sockets */
    for (let s = -1; s <= 1; s += 2){
      lkOV(ctx, 24.2, bob + s * 8, 3.2, 2.7, '#C8C84A');
      lkOV(ctx, 24.8, bob + s * 8, 0.9, 2.2, '#0A0A0A');          /* vertical slit pupils */
      fillCircle(ctx, 23.6, bob + s * 7.2, 0.6, '#FFFFFF');
    }
    lkOV(ctx, -20, bob - 6, 7, 6, '#4E8A2E');                      /* a lily pad caught on its back */
    lkTRI(ctx, -20, bob - 6, -13, bob - 9, -13, bob - 3, b);
    lkLN(ctx, [-20, bob - 6, -25, bob - 8], 0.6, '#6AAE3E'); lkLN(ctx, [-20, bob - 6, -24.6, bob - 3], 0.6, '#6AAE3E'); lkLN(ctx, [-20, bob - 6, -17, bob - 11], 0.6, '#6AAE3E');
    fillCircle(ctx, -21, bob - 6.4, 1.3, '#F0B4C0');               /* a pink lotus bud */
    if (e.state === 'roll') ringPath(ctx, 0, bob, 62, 3, '#7A9A3E', 0.4);
  },
  mosquitoqueen(ctx, e, b, dk, bob, wind, d){
    ringPath(ctx, 0, bob, 54 + Math.sin(e.anim * 3) * 4, 3, '#9ACB5E', 0.3);
    const f = Math.sin(e.anim * 18) * 0.25;
    const legHi = blendHex(b, '#E0D0B0', 0.4), redHi = blendHex(d.pale, '#FFFFFF', 0.3), redLo = shade(d.pale, -0.32);
    for (let s = -1; s <= 1; s += 2){                               /* veined, translucent wings */
      ctx.save(); ctx.translate(-6, bob + s * 28); ctx.rotate(s * (0.4 - f));
      ctx.globalAlpha = 0.4; lkOV(ctx, 0, 0, 34, 11, '#E8F0F4');
      ctx.globalAlpha = 0.7; ctx.strokeStyle = '#E4EEF0'; ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.ellipse(0, 0, 34, 11, 0, 0, TAU); ctx.stroke();
      ctx.lineWidth = 0.9; ctx.beginPath();
      ctx.moveTo(-32, 0); ctx.lineTo(30, -0.6);
      for (let k = -2; k <= 2; k++){ ctx.moveTo(k * 11, 0); ctx.lineTo(k * 11 + 7, -s * 8.6); ctx.moveTo(k * 11, 0); ctx.lineTo(k * 11 + 7, s * 8.6); }
      ctx.stroke(); ctx.globalAlpha = 1;
      ctx.restore();
    }
    ctx.strokeStyle = dk; ctx.lineWidth = 2.6;                      /* long jointed legs */
    ctx.beginPath();
    for (let s = -1; s <= 1; s += 2) for (let k = -1; k <= 1; k++){ ctx.moveTo(6 + k * 8, bob + s * 6); ctx.lineTo(14 + k * 18, bob + s * 30); ctx.lineTo(10 + k * 26, bob + s * 52); }
    ctx.stroke();
    ctx.strokeStyle = legHi; ctx.lineWidth = 1; ctx.beginPath();
    for (let s = -1; s <= 1; s += 2) for (let k = -1; k <= 1; k++){ ctx.moveTo(6 + k * 8, bob + s * 6); ctx.lineTo(14 + k * 18, bob + s * 30); ctx.lineTo(10 + k * 26, bob + s * 52); }
    ctx.stroke();
    for (let s = -1; s <= 1; s += 2) for (let k = -1; k <= 1; k++){
      fillCircle(ctx, 14 + k * 18, bob + s * 30, 2, dk);            /* knee joints, pale foot tips */
      fillCircle(ctx, 10 + k * 26, bob + s * 52, 1.4, '#E8E0C8');
    }
    lkTRI(ctx, -46, bob - 2.6, -56, bob, -46, bob + 2.6, dk);       /* abdomen tip */
    lkOV(ctx, -22, bob, 26, 13, d.pale);                           /* blood-swollen abdomen */
    lkOV(ctx, -22, bob + 6, 23, 5.6, redLo);
    lkOV(ctx, -24, bob - 6, 19, 2.8, redHi);
    for (let k = 0; k < 5; k++){
      const x = -40 + k * 8, u = (x + 22) / 26, h = 13 * Math.sqrt(Math.max(0, 1 - u * u)) * 0.92;
      lkOV(ctx, x, bob, 1.7, h, dk);
    }
    lkOV(ctx, 4, bob, 13, 11, b);
    lkOV(ctx, 2, bob - 4, 9, 3, blendHex(b, '#E0D0B0', 0.3));
    lkLN(ctx, [-6, bob - 3.6, 12, bob - 4], 1.4, legHi); lkLN(ctx, [-6, bob + 3.6, 12, bob + 4], 1.4, legHi);   /* striped thorax */
    lkLN(ctx, [-8, bob, 10, bob], 1.2, dk);
    fillCircle(ctx, -8, bob - 12.4, 1.8, '#E8E0C8'); fillCircle(ctx, -8, bob + 12.4, 1.8, '#E8E0C8');          /* halteres */
    lkOV(ctx, 20, bob, 8, 9, b);
    lkLN(ctx, [28, bob - 3, 38, bob - 11], 0.9, dk); lkLN(ctx, [28, bob + 3, 38, bob + 11], 0.9, dk);        /* feathery antennae */
    for (let k = 0; k < 3; k++){ lkLN(ctx, [31 + k * 2.4, bob - 5.2 - k * 2.4, 34 + k * 2.4, bob - 4.2 - k * 2.4], 0.6, dk); lkLN(ctx, [31 + k * 2.4, bob + 5.2 + k * 2.4, 34 + k * 2.4, bob + 4.2 + k * 2.4], 0.6, dk); }
    lkLN(ctx, [28, bob - 2.4, 40, bob - 3], 2.2, dk); lkLN(ctx, [28, bob + 2.4, 40, bob + 3], 2.2, dk);     /* palps */
    lkE2(ctx, 22, bob, 6.4, 4.8, '#6A1A12');                       /* compound eyes */
    lkE2(ctx, 22.8, bob, 6.4, 2.8, '#A82A1E');
    lkE2(ctx, 23.6, bob - 1, 6.4, 0.8, '#E8A89A');
    lkLN(ctx, [28, bob, 52, bob], 2, '#141410');                   /* piercing proboscis */
    lkLN(ctx, [46, bob, 56, bob], 1.1, d.pale);
  }
};


