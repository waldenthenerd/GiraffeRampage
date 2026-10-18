'use strict';
/* Enemy art, Chapter 2: the Arctic (ARCTIC_DRAW). */
/* ======================== Chapter 2: the Arctic ======================== */

/* Shared helpers (ar2_ prefix). Palette rule for this world: pale animals get a cool blue-grey rim and
   shade so they never melt into the snow; every predator shares amber eyes; warm accents are pink noses
   and ochre horn/ivory. Colours are derived from b / dk so the white hit-flash still works. */
const AR2_COOL = '#5E7C99';
function ar2_cool(c, t){ return blendHex(c, AR2_COOL, t); }
/* a flat eye: iris, pupil and one glint */
function ar2_eye(ctx, x, y, r, iris){
  fillCircle(ctx, x, y, r, iris);
  fillCircle(ctx, x + r * 0.22, y, r * 0.56, '#14110E');
  fillCircle(ctx, x + r * 0.5, y - r * 0.4, r * 0.3, '#FFFFFF');
}
/* many short strokes in one path: flat array [x0,y0,x1,y1, ...] shifted by (ox,oy), mirrored in y when m = -1 */
function ar2_strokes(ctx, arr, ox, oy, m, w, c, a){
  ctx.globalAlpha = a; ctx.strokeStyle = c; ctx.lineWidth = w; ctx.lineCap = 'round'; ctx.beginPath();
  for (let i = 0; i < arr.length; i += 4){
    ctx.moveTo(ox + arr[i], oy + m * arr[i + 1]); ctx.lineTo(ox + arr[i + 2], oy + m * arr[i + 3]);
  }
  ctx.stroke(); ctx.lineCap = 'butt'; ctx.globalAlpha = 1;
}
/* rim ellipse then fill: gives a body a crisp cool outline */
function ar2_body(ctx, x, y, rx, ry, c, rim, t, rot){
  lkOV(ctx, x, y, rx + t, ry + t, rim, rot); lkOV(ctx, x, y, rx, ry, c, rot);
}

const AR2_WOLF_FUR = [-12, 4, -8, 5.4, -6, 3, -2, 4.6, 0, 5.4, 4, 5.8, -9, 7.4, -5, 7.8, 1, 8, 5, 7.4];
const AR2_LYNX_SPOTS = [-11, -3.2, 1.5, -6, 3, 1.3, -2, -4.4, 1.7, 3, -2.8, 1.4, 8, 3.6, 1.3, -9, 1.4, 1.1, 6, -4.2, 1.2, -1, 2.4, 1.2];

const AR2_ST1 = [9, 7, 12, 10, 12, 6.4, 15, 9.4];
const AR2_ST2 = [-24, -10, -18, -12, -22, -4, -15, -6, -22, 4, -15, 6, -24, 10, -18, 12, 6, -12, 12, -10, 6, 12, 12, 10, 4, -4, 12, -3, 4, 4, 12, 3];
const AR2_ST3 = [14, -8, 20, -7, 14, 8, 20, 7];
const AR2_ST4 = [-12, 3, -9, 5, -4, 2.4, -1, 4.6, 2, 3, 5, 5.4];
const AR2_ST5 = [5, -6, 10, -8, 5, 6, 10, 8, 8, -3, 14, -4, 8, 3, 14, 4];
const AR2_ST6 = [-9, -2, -4, -1, -9, 2, -4, 1, 0, -2.4, 4, -1.6, 0, 2.4, 4, 1.6];
const AR2_ST7 = [-30, 10, -22, 12, -24, 4, -16, 6, -12, 9, -4, 11, -18, 16, -10, 17, -2, 4, 6, 6, -28, 18, -20, 20, 2, 13, 10, 14, -34, 4, -27, 5];
const AR2_ST8 = [-40, -14, -34, -10, -42, -4, -35, -2, -42, 6, -35, 4, -40, 14, -34, 10, -28, -22, -20, -20, -28, 22, -20, 20];
const AR2_ST9 = [-34, 8, -26, 10, -30, 16, -22, 17, -18, 6, -10, 8, 18, 6, 26, 7, 16, 14, 24, 15, -14, 18, -6, 19, 22, -8, 14, -6];
const AR2_ST10 = [-50, -3, -44, -4, -50, 3, -44, 4];

const ARCTIC_DRAW = {
  arcticwolf(ctx, e, b, dk, bob, wind, d){
    const tw = Math.sin(e.anim * 2) * 3, st = Math.sin(e.anim * 1.6) * 2.4;
    const rim = ar2_cool(b, 0.6), shd = blendHex(b, dk, 0.5), hi = blendHex(b, '#FFFFFF', 0.7);
    /* four loping paws */
    lkOV(ctx, -9 + st, bob - 10, 4.4, 2.4, rim); lkOV(ctx, -9 - st, bob + 10, 4.4, 2.4, rim);
    lkOV(ctx, 8 - st, bob - 9.4, 4, 2.2, rim); lkOV(ctx, 8 + st, bob + 9.4, 4, 2.2, rim);
    lkOV(ctx, -9 + st, bob - 10.4, 2.6, 1.3, shd); lkOV(ctx, -9 - st, bob + 10.4, 2.6, 1.3, shd);
    /* brush tail with a grey-tipped end */
    ar2_body(ctx, -20, bob + tw, 9.6, 4.8, b, rim, 1.2);
    lkOV(ctx, -26, bob + tw * 1.2, 3.6, 3, shd);
    lkOV(ctx, -18, bob + tw * 0.8, 6, 1.5, hi, 0.1);
    /* body and shading */
    ar2_body(ctx, -1, bob, 16, 9.5, b, rim, 1.4);
    ctx.globalAlpha = 0.45; lkOV(ctx, -3, bob, 12, 3, shd); ctx.globalAlpha = 1;
    lkOV(ctx, -1, bob - 5.4, 11, 1.6, hi); lkOV(ctx, -1, bob + 5.4, 11, 1.6, hi);
    ar2_strokes(ctx, AR2_WOLF_FUR, 0, bob, 1, 1, shd, 0.55); ar2_strokes(ctx, AR2_WOLF_FUR, 0, bob, -1, 1, shd, 0.55);
    /* thick chest ruff */
    ar2_body(ctx, 9, bob, 6, 8.4, b, rim, 1);
    lkTRI(ctx, 11, bob - 7, 5, bob - 9.4, 7.6, bob - 4, b); lkTRI(ctx, 11, bob + 7, 5, bob + 9.4, 7.6, bob + 4, b);
    /* head */
    ar2_body(ctx, 14.5, bob, 8, 6.7, b, rim, 1.2);
    /* ears: cool outer edge, dusky inner */
    for (let s = -1; s <= 1; s += 2){
      lkTRI(ctx, 9.6, bob + s * 3.8, 10.6, bob + s * 10.6, 14.4, bob + s * 4.6, rim);
      lkTRI(ctx, 10.6, bob + s * 4.6, 11.2, bob + s * 9, 13.2, bob + s * 4.9, shd);
    }
    lkOV(ctx, 21, bob, 5.4, 3.7, hi);                            /* long muzzle */
    lkOV(ctx, 19.4, bob, 3.4, 1.1, shd, 0);
    fillCircle(ctx, 25.6, bob, 1.7, '#1A1A1E');
    ar2_eye(ctx, 17.6, bob - 3.1, 1.5, '#E8A83A'); ar2_eye(ctx, 17.6, bob + 3.1, 1.5, '#E8A83A');
  },

  lynx(ctx, e, b, dk, bob, wind){
    if (wind){ ringPath(ctx, 0, bob, 24, 2.5, '#FFFFFF', 0.7); ringPath(ctx, 0, bob, 21.5, 1.6, '#C4583A', 0.55); }
    const st = Math.sin(e.anim * 1.7) * 2.2;
    const rim = blendHex(b, dk, 0.55), shd = blendHex(b, dk, 0.35), hi = blendHex(b, '#FFFFFF', 0.4), cream = '#EDE6D6';
    /* big furry snowshoe paws */
    lkOV(ctx, -8 + st, bob - 9.6, 4.2, 2.8, rim); lkOV(ctx, -8 - st, bob + 9.6, 4.2, 2.8, rim);
    lkOV(ctx, 8 - st, bob - 9, 3.8, 2.6, rim); lkOV(ctx, 8 + st, bob + 9, 3.8, 2.6, rim);
    lkOV(ctx, -8 + st, bob - 9.4, 3.4, 2.2, hi); lkOV(ctx, -8 - st, bob + 9.4, 3.4, 2.2, hi);
    lkOV(ctx, 8 - st, bob - 8.8, 3, 2, hi); lkOV(ctx, 8 + st, bob + 8.8, 3, 2, hi);
    /* bobbed tail with its black tip */
    ar2_body(ctx, -18, bob, 4.4, 3.2, b, rim, 1);
    lkOV(ctx, -21.2, bob, 2.4, 3, '#1A1A1A');
    /* body */
    ar2_body(ctx, 0, bob, 17, 8.8, b, rim, 1.3);
    ctx.globalAlpha = 0.5; lkOV(ctx, -2, bob, 14, 2.8, shd); ctx.globalAlpha = 1;
    lkOV(ctx, 0, bob - 5.6, 12, 1.5, hi); lkOV(ctx, 0, bob + 5.6, 12, 1.5, hi);
    ctx.globalAlpha = 0.5;
    for (let i = 0; i < AR2_LYNX_SPOTS.length; i += 3){
      const sx = AR2_LYNX_SPOTS[i], sy = AR2_LYNX_SPOTS[i + 1], sr = AR2_LYNX_SPOTS[i + 2];
      fillCircle(ctx, sx, bob + sy * 1.6, sr, dk);
      fillCircle(ctx, sx + 0.4, bob - sy * 1.2, sr * 0.8, dk);
    }
    ctx.globalAlpha = 1;
    /* the cream facial ruff with dark ruff bars */
    ar2_body(ctx, 13, bob, 5, 9.5, cream, rim, 1);
    ar2_strokes(ctx, AR2_ST1, 0, bob, 1, 1.1, dk, 0.8);
    ar2_strokes(ctx, AR2_ST1, 0, bob, -1, 1.1, dk, 0.8);
    ar2_body(ctx, 16.5, bob, 6.8, 6.2, b, rim, 1.1);
    /* ears with black tufts */
    for (let s = -1; s <= 1; s += 2){
      lkTRI(ctx, 12.4, bob + s * 4.2, 11.6, bob + s * 9.6, 16, bob + s * 5.4, rim);
      lkTRI(ctx, 13, bob + s * 4.8, 12.4, bob + s * 8.4, 15, bob + s * 5.6, '#D8A8A0');
      lkLN(ctx, [11.8, bob + s * 9, 10.2, bob + s * 12.8], 1.6, '#141414');
    }
    lkLN(ctx, [14, bob - 1.8, 18.5, bob - 1.4], 1, dk); lkLN(ctx, [14, bob + 1.8, 18.5, bob + 1.4], 1, dk);
    lkOV(ctx, 21.4, bob, 2.8, 2.4, cream);
    fillCircle(ctx, 23.4, bob, 1.1, '#C8707A');
    for (let s = -1; s <= 1; s += 2){
      fillCircle(ctx, 19.2, bob + s * 2.8, 1.5, '#D8C84A');
      lkOV(ctx, 19.4, bob + s * 2.8, 0.5, 1.2, '#141414');
    }
  },

  muskox(ctx, e, b, dk, bob, wind, d){
    if (wind) ringPath(ctx, 0, bob, 34, 4, '#FF6A4A', 0.6);
    const pale = d.pale || '#A8906C', mid = blendHex(b, dk, 0.4), lt = blendHex(b, pale, 0.45);
    /* pale-stockinged feet under the skirt */
    const st = Math.sin(e.anim * 1.3) * 2;
    for (const px of [-14, 14]) for (let s = -1; s <= 1; s += 2){
      lkOV(ctx, px + st * s * (px < 0 ? 1 : -1), bob + s * 19, 5, 3.4, pale);
      lkOV(ctx, px + st * s * (px < 0 ? 1 : -1) + 2, bob + s * 20, 2.6, 1.6, dk);
    }
    /* long shaggy skirt of guard hair, two layers */
    ctx.strokeStyle = dk; ctx.lineWidth = 2.2; ctx.beginPath();
    for (let k = 0; k < 22; k++){
      const a = k / 22 * TAU, x = -3 + Math.cos(a) * 27, y = bob + Math.sin(a) * 18;
      ctx.moveTo(x, y); ctx.lineTo(x + Math.cos(a) * 5.4, y + Math.sin(a) * 5.4 + Math.sin(e.anim + k) * 1.2);
    }
    ctx.stroke();
    ctx.strokeStyle = mid; ctx.lineWidth = 1.5; ctx.beginPath();
    for (let k = 0; k < 22; k++){
      const a = (k + 0.5) / 22 * TAU, x = -3 + Math.cos(a) * 25, y = bob + Math.sin(a) * 16.5;
      ctx.moveTo(x, y); ctx.lineTo(x + Math.cos(a) * 5, y + Math.sin(a) * 5 + Math.sin(e.anim + k + 2) * 1);
    }
    ctx.stroke();
    ar2_body(ctx, -3, bob, 27, 18, b, dk, 1.2);
    /* hair strands over the mass of the body */
    ctx.globalAlpha = 0.5; lkOV(ctx, -8, bob, 20, 11, mid); ctx.globalAlpha = 1;
    ctx.globalAlpha = 0.8; lkOV(ctx, -6, bob, 9, 10, lt); ctx.globalAlpha = 1;   /* pale saddle patch */
    ctx.globalAlpha = 0.5; lkOV(ctx, -7, bob, 5, 6, pale); ctx.globalAlpha = 1;
    ar2_strokes(ctx, AR2_ST2, 0, bob, 1, 1.2, dk, 0.6);
    /* the head */
    ar2_body(ctx, 21, bob, 10, 10, b, dk, 1.2);
    ar2_strokes(ctx, AR2_ST3, 0, bob, 1, 1.4, dk, 0.5);
    /* boss of the horns across the brow, then the curling horn tips */
    lkOV(ctx, 23, bob, 5.6, 11.4, '#6A5A44'); lkOV(ctx, 23, bob, 4.6, 10.4, '#D8CCB0');
    lkOV(ctx, 22, bob, 1.6, 8, '#F2EADA');
    ctx.strokeStyle = '#6A5A44'; ctx.lineWidth = 4.4; ctx.lineCap = 'round'; ctx.beginPath();
    ctx.moveTo(23, bob - 10); ctx.quadraticCurveTo(22, bob - 18, 29, bob - 16);
    ctx.moveTo(23, bob + 10); ctx.quadraticCurveTo(22, bob + 18, 29, bob + 16);
    ctx.stroke();
    ctx.strokeStyle = '#D8CCB0'; ctx.lineWidth = 3; ctx.beginPath();
    ctx.moveTo(23, bob - 10); ctx.quadraticCurveTo(22, bob - 18, 29, bob - 16);
    ctx.moveTo(23, bob + 10); ctx.quadraticCurveTo(22, bob + 18, 29, bob + 16);
    ctx.stroke(); ctx.lineCap = 'butt';
    fillCircle(ctx, 29.4, bob - 16, 1.3, '#F2EADA'); fillCircle(ctx, 29.4, bob + 16, 1.3, '#F2EADA');
    lkOV(ctx, 31, bob, 4, 5, '#2A221A');                          /* wet black muzzle */
    lkOV(ctx, 32.4, bob, 1.6, 3.4, '#4A3C30');
    for (let s = -1; s <= 1; s += 2){
      lkOV(ctx, 17, bob + s * 9.6, 2.6, 1.6, dk, s * 0.6);        /* small ears */
      ar2_eye(ctx, 26, bob + s * 6.5, 1.3, '#C89A4A');
    }
  },

  arctichare(ctx, e, b, dk, bob, wind, d){
    const st = Math.sin(e.anim * 1.8) * 2;
    const rim = ar2_cool(b, 0.6), shd = ar2_cool(b, 0.32), pink = d.pale || '#E8A8B0';
    /* long hind feet and short fore paws */
    lkOV(ctx, -7 + st, bob - 10.6, 7, 2.9, rim); lkOV(ctx, -7 - st, bob + 10.6, 7, 2.9, rim);
    lkOV(ctx, -7 + st, bob - 10.8, 5.6, 1.7, b); lkOV(ctx, -7 - st, bob + 10.8, 5.6, 1.7, b);
    lkOV(ctx, 8 - st, bob - 6.4, 3.2, 1.9, rim); lkOV(ctx, 8 + st, bob + 6.4, 3.2, 1.9, rim);
    /* cottontail */
    fillCircle(ctx, -13.4, bob, 5.2, rim); fillCircle(ctx, -13.4, bob, 4.2, b); fillCircle(ctx, -14.4, bob - 1, 1.6, '#FFFFFF');
    /* round body with big haunches */
    ar2_body(ctx, -1, bob, 13, 10, b, rim, 1.4);
    lkOV(ctx, -5, bob - 6, 6.6, 4.4, shd, 0.2); lkOV(ctx, -5, bob + 6, 6.6, 4.4, shd, -0.2);
    lkOV(ctx, -5.4, bob - 6.4, 5, 3, b, 0.2); lkOV(ctx, -5.4, bob + 6.4, 5, 3, b, -0.2);
    ctx.globalAlpha = 0.4; lkOV(ctx, 2, bob, 9, 2.4, shd); ctx.globalAlpha = 1;
    fillCircle(ctx, 4, bob - 3.6, 0.8, shd); fillCircle(ctx, 0, bob + 3.4, 0.8, shd); fillCircle(ctx, -2, bob - 1.2, 0.7, shd);
    /* head */
    ar2_body(ctx, 11, bob, 7.5, 6.2, b, rim, 1.2);
    lkOV(ctx, 16.6, bob, 3.4, 2.8, b);
    /* long ears laid back along the shoulders, black-tipped */
    for (let s = -1; s <= 1; s += 2){
      lkOV(ctx, 1.5, bob + s * 4.4, 10.4, 3.6, rim, -s * 0.15);
      lkOV(ctx, 1.5, bob + s * 4.4, 9.4, 2.8, b, -s * 0.15);
      lkOV(ctx, 2.2, bob + s * 4.4, 7.4, 1.3, pink, -s * 0.15);
      lkOV(ctx, -6.6, bob + s * 5.6, 2.2, 1.4, dk, -s * 0.15);
    }
    for (let s = -1; s <= 1; s += 2) ar2_eye(ctx, 13.4, bob + s * 3.6, 1.7, '#8A3A44');
    fillCircle(ctx, 19.2, bob, 1.5, pink);
    lkLN(ctx, [18, bob - 1.4, 22, bob - 3.6], 0.7, shd); lkLN(ctx, [18, bob + 1.4, 22, bob + 3.6], 0.7, shd);
  },

  leveret(ctx, e, b, dk, bob){
    const st = Math.sin(e.anim * 2.2) * 1.4;
    const rim = ar2_cool(b, 0.6), shd = ar2_cool(b, 0.3);
    lkOV(ctx, -4 + st, bob - 5.4, 3.8, 1.6, rim); lkOV(ctx, -4 - st, bob + 5.4, 3.8, 1.6, rim);
    fillCircle(ctx, -8, bob, 2.6, rim); fillCircle(ctx, -8, bob, 1.9, '#FFFFFF');
    ar2_body(ctx, -1, bob, 6.5, 5, b, rim, 1);
    lkOV(ctx, -2.6, bob - 2.8, 3, 2, shd); lkOV(ctx, -2.6, bob + 2.8, 3, 2, shd);
    ar2_body(ctx, 5, bob, 3.8, 3.2, b, rim, 0.9);
    lkOV(ctx, 0, bob - 2.8, 5.2, 1.7, rim, 0.18); lkOV(ctx, 0, bob + 2.8, 5.2, 1.7, rim, -0.18);
    lkOV(ctx, 0, bob - 2.8, 4.6, 1.2, b, 0.18); lkOV(ctx, 0, bob + 2.8, 4.6, 1.2, b, -0.18);
    fillCircle(ctx, -4.4, bob - 3.6, 1.1, dk); fillCircle(ctx, -4.4, bob + 3.6, 1.1, dk);
    fillCircle(ctx, 6.2, bob - 1.8, 0.9, dk); fillCircle(ctx, 6.2, bob + 1.8, 0.9, dk);
    fillCircle(ctx, 8.6, bob, 0.8, '#D8909A');
  },

  gyrfalcon(ctx, e, b, dk, bob, wind, d){
    const fl = Math.sin(e.anim * 1.8) * 0.4;
    const rim = ar2_cool(b, 0.55), shd = blendHex(b, dk, 0.35), gold = d.pale || '#F2C84A';
    /* wings: coverts, barred secondaries and dark-fingered primaries */
    for (let s = -1; s <= 1; s += 2){
      ctx.save(); ctx.rotate(s * fl);
      lkOV(ctx, -12, s * 22, 4, 11, rim, s * 0.22);
      for (let k = 0; k < 4; k++){
        lkOV(ctx, -4 - k * 4.4, s * (17 + k * 1.6), 11.4 - k * 0.6, 3, k % 2 ? dk : shd, s * (0.35 + k * 0.1));
      }
      lkOV(ctx, -3, s * 14, 15.4, 6.8, rim, s * 0.28);
      lkOV(ctx, -3, s * 14, 14.2, 5.7, b, s * 0.28);
      lkOV(ctx, -1, s * 11, 8.4, 3, shd, s * 0.28);                /* the shoulder coverts */
      for (let k = 0; k < 4; k++) fillCircle(ctx, -9 + k * 3.8, s * (16.4 + k * 0.4), 1, dk);
      lkOV(ctx, -16, s * 18, 4.6, 1.8, dk, s * 0.4);
      ctx.restore();
    }
    /* fanned tail with dark bars */
    for (let k = -1; k <= 1; k++) lkOV(ctx, -14.5, bob + k * 2.6, 6.4, 1.9, k ? shd : b, k * 0.14);
    lkLN(ctx, [-13, bob - 3.8, -13, bob + 3.8], 1.1, dk);
    lkLN(ctx, [-16.4, bob - 3.8, -16.4, bob + 3.8], 1.1, dk);
    ar2_body(ctx, 0, bob, 11, 7.5, b, rim, 1.2);
    ctx.globalAlpha = 0.5; lkOV(ctx, -3, bob, 8, 2.6, shd); ctx.globalAlpha = 1;
    for (let k = 0; k < 8; k++) fillCircle(ctx, -6 + k * 2, bob + (k % 2 ? 2.8 : -2.8), 0.9, dk);    /* speckled breast */
    ar2_body(ctx, 10, bob, 5.4, 5, b, rim, 1);
    lkOV(ctx, 10.6, bob - 3.8, 2.8, 0.9, dk, 0.2); lkOV(ctx, 10.6, bob + 3.8, 2.8, 0.9, dk, -0.2);   /* malar stripes */
    lkTRI(ctx, 13.4, bob - 2.4, 19.4, bob, 13.4, bob + 2.4, '#3A3E44');
    lkTRI(ctx, 13.4, bob - 2.4, 16.6, bob - 0.4, 13.4, bob + 0.2, gold);
    lkTRI(ctx, 13.4, bob + 2.4, 16.6, bob + 0.4, 13.4, bob - 0.2, gold);
    for (let s = -1; s <= 1; s += 2){ fillCircle(ctx, 12, bob + s * 2.8, 1.7, gold); fillCircle(ctx, 12.2, bob + s * 2.8, 1, '#14110E'); }
  },

  arcticfox(ctx, e, b, dk, bob){
    const tw = Math.sin(e.anim * 2.2) * 4, st = Math.sin(e.anim * 1.9) * 2;
    const rim = ar2_cool(b, 0.55), shd = blendHex(b, dk, 0.45), hi = '#FFFFFF';
    lkOV(ctx, -7 + st, bob - 8.6, 3.8, 2, rim); lkOV(ctx, -7 - st, bob + 8.6, 3.8, 2, rim);
    lkOV(ctx, 6 - st, bob - 7.4, 3.4, 1.9, rim); lkOV(ctx, 6 + st, bob + 7.4, 3.4, 1.9, rim);
    lkOV(ctx, -7 + st, bob - 9, 2.2, 1.1, '#3A3E44'); lkOV(ctx, -7 - st, bob + 9, 2.2, 1.1, '#3A3E44');
    /* the enormous bushy tail, fluffed along its length */
    ar2_body(ctx, -19, bob + tw, 11, 5.6, b, rim, 1.3);
    lkOV(ctx, -18, bob + tw * 0.9, 8, 2.2, shd, 0.1);
    lkOV(ctx, -20, bob + tw - 1.2, 8, 1.4, hi);
    lkOV(ctx, -27, bob + tw * 1.2, 2.6, 3, rim);
    ar2_body(ctx, -1, bob, 13, 7.4, b, rim, 1.3);
    ctx.globalAlpha = 0.5; lkOV(ctx, -3, bob, 10, 2.4, shd); ctx.globalAlpha = 1;
    lkOV(ctx, 0, bob - 4.6, 8, 1.3, hi); lkOV(ctx, 0, bob + 4.6, 8, 1.3, hi);
    lkTRI(ctx, 8, bob - 5, 5, bob - 8.2, 10.4, bob - 4.6, b); lkTRI(ctx, 8, bob + 5, 5, bob + 8.2, 10.4, bob + 4.6, b);   /* cheek fluff */
    ar2_body(ctx, 11, bob, 6.4, 5.8, b, rim, 1.2);
    /* small rounded ears with dusky inner */
    for (let s = -1; s <= 1; s += 2){
      lkTRI(ctx, 7, bob + s * 3.6, 6.4, bob + s * 9.6, 11.4, bob + s * 4.6, rim); lkTRI(ctx, 8, bob + s * 4.4, 7.6, bob + s * 8.2, 10.4, bob + s * 4.8, b); lkTRI(ctx, 8.6, bob + s * 4.8, 8.4, bob + s * 7.2, 10, bob + s * 5, '#B8A8AC');
    }
    ar2_body(ctx, 16.6, bob, 3.8, 2.6, b, rim, 0.9);
    fillCircle(ctx, 20.4, bob, 1.3, '#1A1A1E');
    for (let s = -1; s <= 1; s += 2) ar2_eye(ctx, 13.4, bob + s * 2.6, 1.3, '#C8883A');
  },

  caribou(ctx, e, b, dk, bob, wind, d){
    if (wind) ringPath(ctx, 0, bob, 25, 3, '#FF9C6A', 0.6);
    const st = Math.sin(e.anim * 1.5) * 2.4;
    const pale = d.pale || '#E8E0D0', mid = blendHex(b, dk, 0.4);
    const antler = '#B8A484', antRim = '#6A5640';
    /* long legs reaching out from under the barrel */
    for (let s = -1; s <= 1; s += 2){
      lkOV(ctx, -12 + st * s, bob + s * 11, 4.4, 2.2, dk); lkOV(ctx, 8 - st * s, bob + s * 10.2, 4.2, 2.1, dk);
      lkOV(ctx, -13.6 + st * s, bob + s * 11.6, 2.2, 1.2, pale); lkOV(ctx, 6.6 - st * s, bob + s * 10.8, 2.1, 1.1, pale);
    }
    lkOV(ctx, -17.4, bob, 3.4, 3.4, '#6A5440'); lkOV(ctx, -18, bob, 2.4, 2.4, pale);    /* the white rump and tail */
    ar2_body(ctx, -2, bob, 18, 11, b, dk, 1.2);
    ctx.globalAlpha = 0.5; lkOV(ctx, -4, bob, 13, 4, mid); ctx.globalAlpha = 1;
    lkOV(ctx, -8, bob - 7.6, 8, 1.4, blendHex(b, pale, 0.4)); lkOV(ctx, -8, bob + 7.6, 8, 1.4, blendHex(b, pale, 0.4));
    ar2_strokes(ctx, AR2_ST4, 0, bob, 1, 1, dk, 0.45);
    ar2_strokes(ctx, AR2_ST4, 0, bob, -1, 1, dk, 0.45);
    ar2_body(ctx, 10, bob, 6.8, 9, pale, mid, 1.1);                 /* shaggy pale neck mane */
    ar2_strokes(ctx, AR2_ST5, 0, bob, 1, 1.1, b, 0.6);
    /* sweeping antlers, dark-edged so they read on snow, with brow tines (the head sits over their roots) */
    ctx.lineCap = 'round';
    for (let pass = 0; pass < 2; pass++){
      ctx.strokeStyle = pass ? antler : antRim; ctx.lineWidth = pass ? 1.7 : 3.2;
      for (let s = -1; s <= 1; s += 2){
        ctx.beginPath();
        ctx.moveTo(17, bob + s * 3); ctx.quadraticCurveTo(12, bob + s * 14, 2, bob + s * 17);
        ctx.moveTo(12, bob + s * 11); ctx.lineTo(16, bob + s * 16);
        ctx.moveTo(7, bob + s * 15); ctx.lineTo(9, bob + s * 21);
        ctx.moveTo(3, bob + s * 17); ctx.lineTo(1, bob + s * 22);
        ctx.moveTo(14, bob + s * 6); ctx.lineTo(20, bob + s * 11);          /* the brow tine */
        ctx.moveTo(2, bob + s * 17); ctx.lineTo(-4, bob + s * 20);
        ctx.stroke();
      }
    }
    ctx.lineCap = 'butt';
    /* head and muzzle */
    ar2_body(ctx, 19, bob, 7.4, 5.6, dk, '#1E1610', 1);
    lkOV(ctx, 19, bob - 0.4, 5, 3, mid);
    lkOV(ctx, 25.4, bob, 3.2, 3.8, '#5A4430'); lkOV(ctx, 27, bob, 1.4, 2.6, pale);
    for (let s = -1; s <= 1; s += 2) lkOV(ctx, 15.4, bob + s * 6.6, 3, 1.6, dk, s * 0.5);   /* ears */
    for (let s = -1; s <= 1; s += 2) ar2_eye(ctx, 21.4, bob + s * 3.5, 1.4, '#C8944A');
  },

  ermine(ctx, e, b, dk, bob){
    const w = Math.sin(e.anim * 3) * 3, st = Math.sin(e.anim * 3) * 2.2;
    const rim = ar2_cool(b, 0.6), shd = ar2_cool(b, 0.32);
    lkOV(ctx, -8 + st, bob - 5.6, 3, 1.6, rim); lkOV(ctx, -8 - st, bob + 5.6, 3, 1.6, rim);
    lkOV(ctx, 6 - st, bob - 4.8, 2.8, 1.5, rim); lkOV(ctx, 6 + st, bob + 4.8, 2.8, 1.5, rim);
    lkCV(ctx, -12, bob, -20, bob + w, -27, bob - w, 3.4, rim);
    lkCV(ctx, -12, bob, -20, bob + w, -27, bob - w, 2.2, b);
    fillCircle(ctx, -27, bob - w, 2.8, '#141414');                /* the black tail tip it keeps all winter */
    ar2_body(ctx, -1, bob + w * 0.3, 14, 5.6, b, rim, 1.2);
    ctx.globalAlpha = 0.45; lkOV(ctx, -2, bob + w * 0.3, 11, 1.8, shd); ctx.globalAlpha = 1;
    lkOV(ctx, 3, bob + w * 0.1, 6, 4.4, shd, 0); lkOV(ctx, 3, bob + w * 0.1, 5, 3.4, b);
    ar2_body(ctx, 13, bob, 6, 5, b, rim, 1.1);
    for (let s = -1; s <= 1; s += 2){
      fillCircle(ctx, 9.6, bob + s * 4.8, 2.1, rim); fillCircle(ctx, 9.6, bob + s * 4.8, 1.4, '#D8A8B2');
      fillCircle(ctx, 15.6, bob + s * 2.4, 1.2, '#141414'); fillCircle(ctx, 16, bob + s * 2, 0.4, '#FFFFFF');
      lkLN(ctx, [18, bob + s * 0.8, 22, bob + s * 3], 0.6, shd);
    }
    fillCircle(ctx, 19, bob, 1.1, '#D88A9A');
  },

  wolverine(ctx, e, b, dk, bob, wind, d){
    const st = Math.sin(e.anim * 1.6) * 2.2;
    const pale = d.pale || '#C9A26A', rim = '#120C08', mid = blendHex(b, pale, 0.25);
    /* strong paws with pale claws */
    for (let s = -1; s <= 1; s += 2){
      lkOV(ctx, -8 + st * s, bob + s * 10.4, 3.8, 2.2, dk); lkOV(ctx, 8 - st * s, bob + s * 10, 3.6, 2.1, dk);
      lkTRI(ctx, -5.6 + st * s, bob + s * 11.4, -4.6 + st * s, bob + s * 13, -3.6 + st * s, bob + s * 11.6, pale);
      lkTRI(ctx, 10.4 - st * s, bob + s * 11, 11.4 - st * s, bob + s * 12.6, 12.4 - st * s, bob + s * 11.2, pale);
    }
    /* bushy tail */
    ar2_body(ctx, -16.4, bob, 6.8, 4.6, dk, rim, 1);
    lkOV(ctx, -17, bob, 4, 2, b);
    ar2_body(ctx, -1, bob, 15, 10, b, rim, 1.2);
    ctx.globalAlpha = 0.5; lkOV(ctx, -3, bob, 11, 5, dk); ctx.globalAlpha = 1;
    /* the pale band running down each side and over the rump */
    ctx.strokeStyle = pale; ctx.lineWidth = 2.8; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.ellipse(-2, bob, 11.5, 7.4, 0, 0.5, TAU - 0.5); ctx.stroke();
        ctx.lineCap = 'butt';
    ar2_strokes(ctx, AR2_ST6, 0, bob, 1, 1, dk, 0.7);
    ar2_body(ctx, 12.4, bob, 7, 6.8, b, rim, 1.1);
    lkOV(ctx, 11, bob, 3.2, 6, '#7A6048');                           /* tan forehead */
    lkOV(ctx, 15.6, bob, 4.6, 3.8, '#A8886A');
    for (let s = -1; s <= 1; s += 2){
      lkOV(ctx, 7.6, bob + s * 5.4, 2.6, 2.2, rim);                  /* rounded ears */
      lkOV(ctx, 8, bob + s * 5.4, 1.4, 1.1, '#6A5038');
      lkOV(ctx, 13.4, bob + s * 3, 3.2, 1.6, rim, s * 0.2);         /* dark face mask */
      ar2_eye(ctx, 14.4, bob + s * 2.8, 1.3, '#E0B24A');
    }
    lkOV(ctx, 18.6, bob, 3.2, 2.8, '#1A120C');
    fillCircle(ctx, 20.4, bob, 1, '#4A3A30');
  },

  lemming(ctx, e, b, dk, bob){
    const st = e.state === 'dash' ? 1.25 : 1;
    const wig = Math.sin(e.anim * 2.6) * 1.2;
    const rim = blendHex(b, dk, 0.6), lt = blendHex(b, '#FFFFFF', 0.4), mid = blendHex(b, dk, 0.35);
    lkOV(ctx, -3 * st + wig, bob - 5.8, 2.6, 1.5, rim); lkOV(ctx, -3 * st - wig, bob + 5.8, 2.6, 1.5, rim);
    lkOV(ctx, 3.4 * st - wig, bob - 4.6, 2.2, 1.3, rim); lkOV(ctx, 3.4 * st + wig, bob + 4.6, 2.2, 1.3, rim);
    fillCircle(ctx, -9 * st, bob, 1.5, rim);
    ar2_body(ctx, -1, bob, 8 * st, 6.4 / st, b, rim, 1);
    lkOV(ctx, -2, bob, 6 * st, 1.7, dk);                           /* the dark dorsal stripe */
    lkOV(ctx, -2.4 * st, bob - 3.8 / st, 4.4, 1.2, lt); lkOV(ctx, -2.4 * st, bob + 3.8 / st, 4.4, 1.2, lt);
    ar2_body(ctx, 6 * st, bob, 4, 4, b, rim, 0.9);
    lkOV(ctx, 8.6 * st, bob, 1.8, 2, lt);
    for (let s = -1; s <= 1; s += 2){
      fillCircle(ctx, 3.8 * st, bob + s * 3.6, 1.4, mid);          /* tiny ears */
      fillCircle(ctx, 7.4 * st, bob + s * 1.8, 1, '#0A0A0A');
    }
    fillCircle(ctx, 10.4 * st, bob, 0.8, '#C8707A');
  },

  owlet(ctx, e, b, dk, bob){
    softBlob(ctx, 0, bob, 11, '#FFFFFF', 0.16);
    const rim = ar2_cool(b, 0.55), shd = blendHex(b, dk, 0.4);
    for (let k = 0; k < 8; k++){                                  /* fluffy down edge */
      const a = k / 8 * TAU + 0.2;
      fillCircle(ctx, Math.cos(a) * 6.4, bob + Math.sin(a) * 6.4, 2.2, rim);
    }
    fillCircle(ctx, 0, bob, 7.4, rim); fillCircle(ctx, 0, bob, 6.6, b);
    for (let k = 0; k < 8; k++){
      const a = k / 8 * TAU + 0.2;
      fillCircle(ctx, Math.cos(a) * 5.6, bob + Math.sin(a) * 5.6, 1.5, b);
    }
    for (let s = -1; s <= 1; s += 2){                             /* folded wings */
      lkOV(ctx, -3, bob + s * 3.6, 4.2, 1.7, shd, s * 0.3);
    }
    for (let k = 0; k < 4; k++) fillCircle(ctx, -4.6 + k * 1.8, bob + (k % 2 ? 0.9 : -0.9), 0.6, dk);
    fillCircle(ctx, 3.4, bob, 4.6, '#F4F6F8');                    /* the facial disc */
    ctx.strokeStyle = shd; ctx.lineWidth = 0.9; ctx.beginPath(); ctx.arc(3.4, bob, 4.6, 0, TAU); ctx.stroke();
    for (let s = -1; s <= 1; s += 2){ fillCircle(ctx, 4, bob + s * 2, 1.9, '#F2C84A'); fillCircle(ctx, 4.4, bob + s * 2, 1, '#0A0A0A'); }
    lkTRI(ctx, 6.4, bob - 0.9, 8.4, bob, 6.4, bob + 0.9, '#3A3A40');
  },

  polarbear(ctx, e, b, dk, bob){
    const rim = ar2_cool(b, 0.55), shd = blendHex(b, dk, 0.55), warm = blendHex(b, '#E8D4A8', 0.35), hi = blendHex(b, '#FFFFFF', 0.7);
    /* four heavy paws, flat pads and black claws */
    for (const px of [-18, 20]) for (let s = -1; s <= 1; s += 2){
      const st = Math.sin(e.anim + px) * 2;
      ar2_body(ctx, px + st, bob + s * 26, 9.4, 7, b, rim, 1.3);
      lkOV(ctx, px + st - 1.2, bob + s * 28, 5.2, 2.6, shd);
      for (let k = -1; k <= 1; k++){
        lkOV(ctx, px + 7.6 + st, bob + s * (27.6 + k * 3.2), 2, 1.1, '#2A2A30');
        lkOV(ctx, px + 5.6 + st, bob + s * (27.6 + k * 3.2), 1.4, 1.3, hi);
      }
    }
    /* rump and tail nub */
    fillCircle(ctx, -43, bob, 4, rim); fillCircle(ctx, -43, bob, 3, b);
    /* barrel body */
    ar2_body(ctx, -4, bob, 40, 26, b, rim, 1.8);
    ctx.globalAlpha = 0.22; lkOV(ctx, -8, bob + 8, 31, 12, dk); ctx.globalAlpha = 1;
    lkOV(ctx, -6, bob - 12, 30, 5, hi, 0.0);                        /* back-light along one flank */
    ctx.globalAlpha = 0.5; lkOV(ctx, -8, bob, 27, 5, warm); ctx.globalAlpha = 1;
    lkOV(ctx, 8, bob - 14, 12, 8, b, -0.3); lkOV(ctx, 8, bob + 14, 12, 8, b, 0.3);    /* shoulder muscle */
    ctx.globalAlpha = 0.35; lkOV(ctx, 8, bob - 15, 9, 3, shd, -0.3); lkOV(ctx, 8, bob + 15, 9, 3, shd, 0.3); ctx.globalAlpha = 1;
    /* guard-hair strokes in one batch */
    ar2_strokes(ctx, AR2_ST7,
      0, bob, 1, 1.5, shd, 0.5);
    ar2_strokes(ctx, AR2_ST7,
      0, bob, -1, 1.5, shd, 0.5);
    /* neck then head */
    ar2_body(ctx, 25, bob, 13, 12, b, rim, 1.6);
    ar2_body(ctx, 31, bob, 16, 14, b, rim, 1.7);
    ctx.globalAlpha = 0.35; lkOV(ctx, 31, bob + 5, 13, 6, shd); ctx.globalAlpha = 1;
    for (let s = -1; s <= 1; s += 2){
      ar2_body(ctx, 22, bob + s * 11.4, 4.6, 4.4, b, rim, 1.2);   /* round ears with dusky centres */
      fillCircle(ctx, 22.4, bob + s * 11.4, 2.5, shd);
      lkOV(ctx, 35.4, bob + s * 9.6, 3.6, 1.1, shd, -s * 0.3);    /* brow shadow */
    }
    /* long muzzle with whisker dots */
    ar2_body(ctx, 43, bob, 8, 7, '#EFE8D6', rim, 1.3);
    lkOV(ctx, 41, bob, 5, 3, hi);
    for (let k = 0; k < 3; k++){ fillCircle(ctx, 43 + k * 2.2, bob - 3.8, 0.6, shd); fillCircle(ctx, 43 + k * 2.2, bob + 3.8, 0.6, shd); }
    lkOV(ctx, 49, bob, 3, 3.8, '#141414');
    lkOV(ctx, 48.6, bob - 1.2, 1.2, 0.8, '#5A5A66');
    for (let s = -1; s <= 1; s += 2){ fillCircle(ctx, 36, bob + s * 7.4, 2, '#1E1E22'); fillCircle(ctx, 36.6, bob + s * 6.8, 0.7, '#FFFFFF'); }
    if (e.state === 'roar') lkOV(ctx, 46, bob, 5, 4 + Math.sin(G.time * 30) * 1.4, '#6E241C');
  },

  walrus(ctx, e, b, dk, bob, wind, d){
    const rim = '#3A2018', shd = blendHex(b, dk, 0.5), hi = blendHex(b, '#F0D8C0', 0.35), ivory = d.pale || '#F0E8D8';
    const pad = Math.sin(e.anim * 1.2) * 3;
    /* hind flippers spread behind, fore flippers paddling at the sides */
    for (let s = -1; s <= 1; s += 2){
      lkOV(ctx, -48, bob + s * 15, 13, 7, rim, s * -0.4); lkOV(ctx, -48, bob + s * 15, 11.6, 5.8, dk, s * -0.4);
      lkOV(ctx, -56, bob + s * 19, 3.6, 2.2, dk, s * -0.6);
      lkOV(ctx, 14 + pad * s, bob + s * 38, 13, 6.6, rim, s * 0.5); lkOV(ctx, 14 + pad * s, bob + s * 38, 11.6, 5.4, dk, s * 0.5);
      for (let k = 0; k < 3; k++) lkOV(ctx, 24 + pad * s + k * 1.4, bob + s * (42.6 + k * 1.2), 2, 1.1, ivory, s * 0.5);   /* nail tips */
    }
    /* huge blubbery body */
    ar2_body(ctx, -6, bob, 50, 36, b, rim, 2);
    ctx.globalAlpha = 0.25; lkOV(ctx, -10, bob + 10, 40, 18, dk); ctx.globalAlpha = 1;
    ctx.globalAlpha = 0.5; lkOV(ctx, -8, bob - 10, 36, 9, hi); ctx.globalAlpha = 1;
    ctx.strokeStyle = shd; ctx.lineWidth = 1.5; ctx.globalAlpha = 0.6;   /* blubbery folds */
    for (let k = 0; k < 6; k++){ ctx.beginPath(); ctx.ellipse(-10 + k * 6, bob, 4, 26 - k * 2, 0, -1.2, 1.2); ctx.stroke(); }
    ctx.globalAlpha = 1;
    ar2_strokes(ctx, AR2_ST8, 0, bob, 1, 1.4, shd, 0.5);
    ctx.globalAlpha = 0.5;                                          /* warts and scars */
    for (let k = 0; k < 12; k++){ const a = k * 2.1; fillCircle(ctx, -14 + Math.cos(a) * 30, bob + Math.sin(a) * 20, 1.4 + (k % 3) * 0.5, dk); }
    ctx.globalAlpha = 1;
    /* head and face */
    ar2_body(ctx, 36, bob, 20, 18, b, rim, 2);
    lkOV(ctx, 30, bob - 8, 7, 5, hi, 0.2); lkOV(ctx, 30, bob + 8, 7, 5, hi, -0.2);
    for (let s = -1; s <= 1; s += 2) lkOV(ctx, 41, bob + s * 11.6, 6, 3.2, shd, s * 0.4);   /* cheek ridge */
    lkE2(ctx, 49, bob, 6.5, 7.4, shd);
    lkE2(ctx, 48.6, bob, 6.2, 6.6, d.pale);                          /* bristly whisker pads */
    lkE2(ctx, 48.6, bob, 6.2, 5, blendHex(d.pale, b, 0.3));
    for (let k = 0; k < 10; k++) fillCircle(ctx, 46 + (k % 3) * 3, bob + (k < 5 ? -1 : 1) * (3 + (k % 5) * 1.6), 0.8, dk);
    lkOV(ctx, 56, bob, 3.6, 3, '#2A1A14');                          /* nose */
    /* long tusks with ring marks */
    for (let s = -1; s <= 1; s += 2){
      lkTRI(ctx, 50, bob + s * 2.6, 50, bob + s * 8.4, 75, bob + s * 9.4, rim);
      lkTRI(ctx, 51, bob + s * 3.6, 51, bob + s * 7.4, 72, bob + s * 8.8, ivory);
      lkLN(ctx, [53, bob + s * 4.4, 68, bob + s * 7.2], 1, '#FFFFFF');
      fillCircle(ctx, 59, bob + s * 7.2, 0.8, '#B8AA94'); fillCircle(ctx, 65, bob + s * 8.2, 0.8, '#B8AA94');
      ar2_eye(ctx, 40, bob + s * 10, 1.9, '#2A1A14');
    }
    lkE2(ctx, 40, bob, 10, 1.1, '#FFFFFF');
  },

  moose(ctx, e, b, dk, bob, wind, d){
    if (e.state === 'dash' || e.state === 'wind') softBlob(ctx, 10, bob, 52, '#FF5A2C', 0.1);
    const pale = d.pale || '#C8B08A', mid = '#4A3828', sock = '#8A7A66', rim = '#120C08';
    const st = Math.sin(e.anim * 1.4) * 3;
    /* long pale-socked legs */
    for (let s = -1; s <= 1; s += 2){
      lkOV(ctx, -26 + st * s, bob + s * 26, 8, 4.2, dk); lkOV(ctx, -23 + st * s, bob + s * 27, 4.4, 2.4, sock);
      lkOV(ctx, 18 - st * s, bob + s * 22, 8, 4.2, dk); lkOV(ctx, 21 - st * s, bob + s * 23, 4.4, 2.4, sock);
    }
    /* body mass and shoulder hump */
    ar2_body(ctx, -6, bob, 42, 26, b, rim, 1.8);
    ctx.globalAlpha = 0.4; lkOV(ctx, -12, bob, 30, 8, '#5A4638'); ctx.globalAlpha = 1;
    lkOV(ctx, -2, bob - 14, 28, 4, mid, -0.04); lkOV(ctx, -2, bob + 14, 28, 4, mid, 0.04);
    lkOV(ctx, 10, bob, 16, 22, mid);
    ctx.globalAlpha = 0.5; lkOV(ctx, 6, bob - 4, 10, 8, '#6A5442'); ctx.globalAlpha = 1;
    ar2_strokes(ctx, AR2_ST9, 0, bob, 1, 1.5, '#5A4638', 0.8);
    ar2_strokes(ctx, AR2_ST9, 0, bob, -1, 1.5, '#5A4638', 0.8);
    /* head, bell and drooping muzzle */
    ar2_body(ctx, 34, bob, 9, 10, b, rim, 1.4);
    lkOV(ctx, 30, bob, 6, 3.4, '#5A4638');
    ar2_body(ctx, 48, bob, 12, 8, mid, rim, 1.2);
    lkOV(ctx, 51, bob, 8, 5, '#6A5442');
    lkOV(ctx, 58, bob, 3.4, 5.4, '#1E1610');                          /* broad nose */
    lkE2(ctx, 57, bob, 2.4, 1.2, '#050403');
    for (let s = -1; s <= 1; s += 2){
      lkOV(ctx, 28, bob + s * 11, 5, 2.6, b, s * 0.6); lkOV(ctx, 28.4, bob + s * 11, 3.2, 1.3, '#7A5A4A', s * 0.6);   /* big mule ears */
    }
    /* broad palmate antlers: dark edge, pale palm, long tines */
    for (let s = -1; s <= 1; s += 2){
      lkLN(ctx, [34, bob + s * 8, 30, bob + s * 20], 5, '#5A4630');
      lkOV(ctx, 30, bob + s * 28, 12.4, 16, '#6A5640', s * 0.3);
      for (let k = 0; k < 5; k++) lkTRI(ctx, 23 + k * 4, bob + s * 38, 29 + k * 4, bob + s * 38, 26 + k * 4, bob + s * 48, '#6A5640');
      lkOV(ctx, 30, bob + s * 28, 11, 14.6, pale, s * 0.3);
      lkOV(ctx, 28, bob + s * 29, 6, 8.6, blendHex(pale, '#FFFFFF', 0.25), s * 0.3);
      for (let k = 0; k < 5; k++) lkTRI(ctx, 24 + k * 4, bob + s * 38, 28 + k * 4, bob + s * 38, 26 + k * 4, bob + s * 46, pale);
      lkLN(ctx, [38, bob + s * 26, 46, bob + s * 30], 2.2, '#6A5640'); lkLN(ctx, [38, bob + s * 26, 46, bob + s * 30], 1.2, pale);
    }
    for (let s = -1; s <= 1; s += 2) ar2_eye(ctx, 40, bob + s * 6, 1.9, '#C8944A');
  },

  narwhal(ctx, e, b, dk, bob, wind, d){
    const sw = Math.sin(e.anim * 1.2) * 6;
    const rim = blendHex(b, dk, 0.75), belly = blendHex(b, '#FFFFFF', 0.5), lt = blendHex(b, '#FFFFFF', 0.25);
    /* flukes with a central notch */
    for (let s = -1; s <= 1; s += 2){
      lkOV(ctx, -68, bob + sw + s * 9, 14, 5.4, rim, s * 0.5);
      lkOV(ctx, -68, bob + sw + s * 9, 12.6, 4.2, dk, s * 0.5);
      lkOV(ctx, -66, bob + sw + s * 8, 8, 2, b, s * 0.5);
    }
    lkOV(ctx, -58, bob + sw * 0.8, 6, 4, rim);
    /* the long torpedo body */
    ar2_body(ctx, -10, bob + sw * 0.3, 52, 22, b, rim, 1.8);
    lkOV(ctx, -12, bob + sw * 0.3 - 11, 46, 6, belly, -0.02); lkOV(ctx, -12, bob + sw * 0.3 + 11, 46, 6, belly, 0.02);   /* pale flanks */
    ctx.globalAlpha = 0.32; lkOV(ctx, -14, bob + sw * 0.3, 42, 7, dk); ctx.globalAlpha = 1;    /* dark back */
    for (let k = 0; k < 18; k++){ const a = k * 2.4; fillCircle(ctx, -14 + Math.cos(a) * 38, bob + Math.sin(a) * 14, 2 + (k % 3), dk); }
    ctx.globalAlpha = 0.6;
    for (let k = 0; k < 12; k++){ const a = k * 1.7 + 0.5; fillCircle(ctx, -12 + Math.cos(a) * 34, bob + Math.sin(a) * 16, 1.4 + (k % 2), lt); }
    ctx.globalAlpha = 1;
    ar2_strokes(ctx, AR2_ST10, 0, bob + sw * 0.5, 1, 1.3, rim, 0.5);   /* dorsal ridge scars */
    /* pectoral flippers */
    for (let s = -1; s <= 1; s += 2){
      lkOV(ctx, 16, bob + s * 23, 11, 5, rim, s * 0.5); lkOV(ctx, 16, bob + s * 23, 9.6, 3.8, dk, s * 0.5);
    }
    ar2_body(ctx, 30, bob, 15, 14, b, rim, 1.4);                    /* the bulging melon */
    lkOV(ctx, 32, bob, 8, 7, lt);
    /* the spiral tusk, edged for the snow, with twist bands */
    lkLN(ctx, [40, bob, 96, bob], 5.4, '#6A5E48');
    lkLN(ctx, [40, bob, 96, bob], 3.6, d.pale);
    lkLN(ctx, [40, bob - 0.8, 96, bob - 0.8], 1, '#FFFFFF');
    ctx.strokeStyle = '#8A7C62'; ctx.lineWidth = 1.2; ctx.beginPath();
    for (let x = 44; x < 94; x += 5){ ctx.moveTo(x, bob - 2); ctx.lineTo(x + 3, bob + 2); }
    ctx.stroke();
    fillCircle(ctx, 96.6, bob, 1.5, d.pale);
    lkE2(ctx, 30, bob, 9, 1.8, '#141414');
    for (let s = -1; s <= 1; s += 2) fillCircle(ctx, 30.6, bob + s * 9, 0.7, '#FFFFFF');
    fillCircle(ctx, 14, bob, 1.6, rim);                              /* blowhole */
    if (e.state === 'roll') ringPath(ctx, 0, bob, 62, 3, '#BEEFFF', 0.4);
  },

  snowyowl(ctx, e, b, dk, bob, wind, d){
    ringPath(ctx, 0, bob, 54 + Math.sin(e.anim * 3) * 4, 3, '#BEEFFF', 0.3);
    const f = Math.sin(e.anim * 1.3) * 0.18;
    const rim = ar2_cool(b, 0.6), shd = ar2_cool(b, 0.32), bar = blendHex(b, dk, 0.5);
    /* tail feathers, barred */
    for (let k = -2; k <= 2; k++){
      lkOV(ctx, -34, bob + k * 5, 12, 3.4, rim, k * 0.12); lkOV(ctx, -34, bob + k * 5, 10.8, 2.6, k % 2 ? shd : b, k * 0.12);
    }
    lkLN(ctx, [-40, bob - 11, -40, bob + 11], 1.6, bar); lkLN(ctx, [-34, bob - 12, -34, bob + 12], 1.4, bar);
    /* great wings: coverts, three feather rows, dark fingertips */
    for (let s = -1; s <= 1; s += 2){
      ctx.save(); ctx.rotate(s * f);
      for (let k = 0; k < 6; k++){
        const px = -18 - k * 3.2, py = s * (40 + k * 1.2), ra = s * (0.22 + k * 0.1);
        lkOV(ctx, px, py, 13.4, 3.6, rim, ra);
        lkOV(ctx, px, py, 12.2, 2.7, k % 2 ? shd : b, ra);
        lkOV(ctx, px - 9.6 * Math.cos(ra), py - 9.6 * Math.sin(ra), 3.2, 1.9, '#4A4A54', ra);
      }
      ar2_body(ctx, -8, s * 30, 34, 13, b, rim, 1.6, s * 0.15);
      lkOV(ctx, -4, s * 24, 22, 5, shd, s * 0.15);
      for (let k = 0; k < 9; k++) fillCircle(ctx, -30 + k * 6, s * (26 + (k % 2) * 6), 1.5, dk);
      for (let k = 0; k < 5; k++) lkOV(ctx, -26 + k * 8, s * 36, 3, 1.1, bar, s * 0.3);
      ctx.restore();
    }
    /* feathered body with chest barring */
    ar2_body(ctx, 0, bob, 34, 30, b, rim, 2);
    ctx.globalAlpha = 0.45; lkOV(ctx, -8, bob, 22, 14, shd); ctx.globalAlpha = 1;
    for (let k = 0; k < 16; k++){ const a = k * 2.3; fillCircle(ctx, -6 + Math.cos(a) * 22, bob + Math.sin(a) * 18, 1.7, dk); }
    ctx.strokeStyle = bar; ctx.lineWidth = 1.4; ctx.globalAlpha = 0.7;
    for (let k = 0; k < 4; k++){ ctx.beginPath(); ctx.arc(4 - k * 6, bob, 20 + k * 2, -0.9, 0.9); ctx.stroke(); }
    ctx.globalAlpha = 1;
    /* the facial disc with a dusky rim, golden eyes and a dark hooked beak */
    fillCircle(ctx, 20, bob, 17.4, rim); fillCircle(ctx, 20, bob, 16, '#FAFBFC');
    ctx.strokeStyle = shd; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(20, bob, 11, 0.6, TAU - 0.6); ctx.stroke();
    for (let s = -1; s <= 1; s += 2){
      lkOV(ctx, 24, bob + s * 8.4, 4.4, 2.6, shd, s * 0.4);
      fillCircle(ctx, 24, bob + s * 7, 6.4, bar);
      fillCircle(ctx, 24, bob + s * 7, 5.4, d.pale); fillCircle(ctx, 24.8, bob + s * 7, 3, '#0A0A0A'); fillCircle(ctx, 26, bob + s * 6, 1, '#FFFFFF');
    }
    lkTRI(ctx, 29, bob - 3, 37, bob, 29, bob + 3, '#2A2A30'); lkTRI(ctx, 29.4, bob - 1.4, 34, bob, 29.4, bob + 1, '#5A5A64');
  }
};
