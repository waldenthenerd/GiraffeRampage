'use strict';
/* Enemy art, Chapter 5: the Amazon canopy (JUNGLE_DRAW). */
/* ---- Chapter 5 artwork: entirely new Amazon animals ----
   Each is drawn top-down, facing +x, at the same scale as the chapter-1
   creature whose AI it borrows, so hitboxes still match what you see.
   Shared look: every animal is built from a base / shade / highlight of its
   own body colour plus one vivid jungle accent (gold, lime, coral, ivory),
   dark animals get a violet-or-warm rim light so they read on the deep green
   ground, and predators share lime/gold slit-pupil eyes. */
function rosette(ctx, x, y, r, ring, fillc){
  ctx.strokeStyle = ring; ctx.lineWidth = 1.2;
  ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.stroke();
  if (fillc) fillCircle(ctx, x, y, r * 0.5, fillc);
}

/* ---- small shared helpers (jg5_ prefix: Chapter 5 only) ---- */
const JG5_CAC = {};
/* cached shade()/blendHex() so a crowd of animals does not re-parse colour strings every frame */
function jg5_c(c, a){ const k = c + a; return JG5_CAC[k] || (JG5_CAC[k] = shade(c, a)); }
function jg5_m(c, t, a){ const k = c + t + a; return JG5_CAC[k] || (JG5_CAC[k] = blendHex(c, t, a)); }
/* add one (rotated) ellipse to the current path, so many can share a single fill() */
function jg5_ovp(ctx, x, y, rx, ry, rot){
  ctx.moveTo(x + Math.cos(rot) * rx, y + Math.sin(rot) * rx);
  ctx.ellipse(x, y, rx, ry, rot, 0, TAU);
}
/* a batch of equal dots from a flat [x,y,x,y...] list, one fill */
function jg5_dots(ctx, arr, ox, oy, r, c){
  ctx.fillStyle = c; ctx.beginPath();
  for (let i = 0; i < arr.length; i += 2){ ctx.moveTo(ox + arr[i] + r, oy + arr[i + 1]); ctx.arc(ox + arr[i], oy + arr[i + 1], r, 0, TAU); }
  ctx.fill();
}
function jg5_limb(ctx, x0, y0, x1, y1, w, c){
  ctx.strokeStyle = c; ctx.lineWidth = w; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke(); ctx.lineCap = 'butt';
}
/* one consistent eye: dark socket, coloured iris, pupil, tiny glint */
function jg5_eye(ctx, x, y, r, iris, slit){
  fillCircle(ctx, x, y, r * 1.35, '#120C06');
  fillCircle(ctx, x, y, r, iris);
  if (slit || r >= 1.6){                                    /* tiny eyes skip the pupil: socket + iris + glint reads fine */
    ctx.fillStyle = '#0A0604'; ctx.beginPath();
    if (slit) ctx.ellipse(x + r * 0.1, y, r * 0.3, r * 0.82, 0, 0, TAU); else ctx.arc(x + r * 0.12, y, r * 0.5, 0, TAU);
    ctx.fill();
  }
  fillCircle(ctx, x + r * 0.3, y - r * 0.36, Math.max(0.35, r * 0.28), '#FFFFFF');
}
function jg5_q(t, a, c, d){ const u = 1 - t; return u * u * a + 2 * u * t * c + t * t * d; }
/* light catching the upper edge of a body: the rim that lifts dark animals off dark ground */
function jg5_rim(ctx, x, y, rx, ry, c, w){
  ctx.strokeStyle = c; ctx.lineWidth = w || 1.2; ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, Math.PI * 1.06, Math.PI * 1.94); ctx.stroke();
}
/* a hex-ish grid of small scute dots clipped to an ellipse, single fill */
function jg5_scutes(ctx, cx, cy, rx, ry, step, r, c){
  ctx.fillStyle = c; ctx.beginPath();
  let row = 0;
  for (let y = -ry + step * 0.5; y < ry; y += step * 0.86, row++){
    const off = (row & 1) ? step * 0.5 : 0;
    for (let x = -rx + off + step * 0.5; x < rx; x += step){
      const nx = x / rx, ny = y / ry;
      if (nx * nx + ny * ny < 0.8){ ctx.moveTo(cx + x + r, cy + y); ctx.arc(cx + x, cy + y, r, 0, TAU); }
    }
  }
  ctx.fill();
}
/* one leaf-shaped blade lying along +x, from tail (x=-L) to tip (x=+L), width w */
function jg5_leafPath(ctx, L, w){
  ctx.beginPath(); ctx.moveTo(-L, 0);
  ctx.quadraticCurveTo(-L * 0.1, -w * 1.15, L, 0);
  ctx.quadraticCurveTo(-L * 0.1, w * 1.15, -L, 0);
  ctx.closePath();
}
/* a fan of overlapping flight feathers from one shoulder: outer (long) to inner (short, swept back) */
function jg5_wing(ctx, side, sx, sy, n, L0, L1, wd, t0, t1, cB, cT, cLine){
  ctx.fillStyle = cB; ctx.strokeStyle = cLine; ctx.lineWidth = Math.max(0.7, wd * 0.24);
  ctx.beginPath();
  for (let k = 0; k < n; k++){
    const f = n > 1 ? k / (n - 1) : 0, a = side * (Math.PI / 2 + t0 + (t1 - t0) * f), L = L0 + (L1 - L0) * f;
    jg5_ovp(ctx, sx + Math.cos(a) * L * 0.5, sy + Math.sin(a) * L * 0.5, L * 0.5, wd, a);
  }
  ctx.fill(); ctx.stroke();
  ctx.fillStyle = cT; ctx.beginPath();
  for (let k = 0; k < n; k++){
    const f = n > 1 ? k / (n - 1) : 0, a = side * (Math.PI / 2 + t0 + (t1 - t0) * f), L = L0 + (L1 - L0) * f;
    jg5_ovp(ctx, sx + Math.cos(a) * L * 0.86, sy + Math.sin(a) * L * 0.86, L * 0.15, wd * 0.8, a);
  }
  ctx.fill();
}

const JG5_PEC_FLECK = [-12, -4, -9, 3, -6, -6, -4, 5, -1, -2, 2, 4, 5, -5, 8, 2, -10, 6, 0, 7, -14, 0, 3, -8, 6, 6, -7, 0];
const JG5_JAG_SPOT = [-10, -1, -3, 2.5, 3, -2, 8, 0.5, -15, -1, 12, -6.5, -9, -7.5, -2, -8, 5, 7.5, 9, 6.5, -12, 7.5, 2, -7];
const JG5_OCE_ROW = [-9, -4.4, -3, -4.6, 3, -4.2, 8.6, -3.4, -11, 0, -5, 0.2, 1, 0, 7, 0.4, -9, 4.4, -3, 4.6, 3, 4.2, 8.6, 3.4];
const JG5_BOA_X = new Float32Array(15), JG5_BOA_Y = new Float32Array(15);

const JUNGLE_DRAW = {
  peccary(ctx, e, b, dk, bob){
    const sw = Math.sin(e.anim * 2) * 2.2;
    const lo = jg5_c(b, -0.4), hi = jg5_m(b, '#D8C8AC', 0.34);
    for (let s = -1; s <= 1; s += 2){                       /* trotters, diagonal gait */
      jg5_limb(ctx, 8, bob + s * 8, 8 + sw * s, bob + s * 12.6, 3.2, lo);
      jg5_limb(ctx, -9, bob + s * 8, -9 - sw * s, bob + s * 12.6, 3.4, lo);
      fillCircle(ctx, 8 + sw * s, bob + s * 13.2, 1.7, dk);
      fillCircle(ctx, -9 - sw * s, bob + s * 13.2, 1.8, dk);
    }
    lkOV(ctx, -17.6, bob, 2.4, 1.8, dk);                    /* stub tail */
    lkOV(ctx, -1, bob, 17.2, 11.6, lo);                     /* darker underside rim */
    lkOV(ctx, -1, bob, 16, 10.5, b);
    lkOV(ctx, -3, bob - 3.4, 12, 3.6, jg5_m(b, '#FFFFFF', 0.14));
    jg5_dots(ctx, JG5_PEC_FLECK, 0, bob, 0.75, hi);         /* grizzled flecks */
    ctx.fillStyle = jg5_m(dk, b, 0.3);                      /* bristly, spiky crest down the spine */
    ctx.beginPath(); ctx.moveTo(-15, bob);
    for (let i = 0; i < 8; i++){ ctx.lineTo(-13 + i * 3.3, bob - 3.8); ctx.lineTo(-11.4 + i * 3.3, bob - 1.2); }
    ctx.lineTo(11, bob);
    for (let i = 7; i >= 0; i--){ ctx.lineTo(-11.4 + i * 3.3, bob + 1.2); ctx.lineTo(-13 + i * 3.3, bob + 3.8); }
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#DCD0B6'; ctx.lineWidth = 3;         /* the pale collar of a collared peccary */
    ctx.beginPath(); ctx.arc(-4, bob, 11.6, -0.95, 0.95); ctx.stroke();
    lkOV(ctx, 14, bob, 7.8, 6.8, lo);
    lkOV(ctx, 14, bob, 7.5, 6.5, b);
    lkTRI(ctx, 11.5, bob - 4.8, 6.5, bob - 11, 8.6, bob - 4.2, dk);   /* ears */
    lkTRI(ctx, 11.5, bob + 4.8, 6.5, bob + 11, 8.6, bob + 4.2, dk);
    lkTRI(ctx, 10.6, bob - 5, 8, bob - 8.6, 9.4, bob - 4.8, jg5_m(b, '#C79A8A', 0.5));
    lkTRI(ctx, 10.6, bob + 5, 8, bob + 8.6, 9.4, bob + 4.8, jg5_m(b, '#C79A8A', 0.5));
    lkOV(ctx, 18.6, bob, 4.2, 5.4, '#E6DCC8');              /* the white lip that names it */
    lkOV(ctx, 22.6, bob, 2.5, 3.1, '#B88A7E');
    fillCircle(ctx, 23.4, bob - 1.1, 0.6, '#1A0E0A'); fillCircle(ctx, 23.4, bob + 1.1, 0.6, '#1A0E0A');
    lkTRI(ctx, 19.6, bob - 4.6, 23.2, bob - 7, 22, bob - 3.4, '#F2EBDD');   /* little tusks */
    lkTRI(ctx, 19.6, bob + 4.6, 23.2, bob + 7, 22, bob + 3.4, '#F2EBDD');
    lkLN(ctx, [14.5, bob - 3.6, 18.5, bob - 2.8], 0.9, dk);  /* dark face stripes */
    lkLN(ctx, [14.5, bob + 3.6, 18.5, bob + 2.8], 0.9, dk);
    jg5_eye(ctx, 13.4, bob - 3.8, 1.1, '#D8903A'); jg5_eye(ctx, 13.4, bob + 3.8, 1.1, '#D8903A');
  },
  jaguar(ctx, e, b, dk, bob, wind){
    if (wind) ringPath(ctx, 0, bob, 24, 2.5, '#FFFFFF', 0.7);
    const s = Math.sin(e.anim * 2), sw = Math.sin(e.anim * 2.4) * 2.6;
    const lo = jg5_c(b, -0.4), mid = jg5_c(b, -0.2), cream = jg5_m(b, '#FFF0C8', 0.34);
    const cx = -26, cy = bob + s * 8, tx = -30, ty = bob + s * 12;   /* ringed tail */
    lkCV(ctx, -16, bob, cx, cy, tx, ty, 4.6, lo);
    lkCV(ctx, -16, bob, cx, cy, tx, ty, 3.2, b);
    ctx.strokeStyle = dk; ctx.lineWidth = 3.4; ctx.beginPath();
    for (let k = 0; k < 3; k++){
      const t0 = 0.28 + k * 0.22, t1 = t0 + 0.1;
      ctx.moveTo(jg5_q(t0, -16, cx, tx), jg5_q(t0, bob, cy, ty)); ctx.lineTo(jg5_q(t1, -16, cx, tx), jg5_q(t1, bob, cy, ty));
    }
    ctx.stroke();
    fillCircle(ctx, tx, ty, 1.9, dk);
    for (let q = -1; q <= 1; q += 2){                       /* four padded legs */
      jg5_limb(ctx, 9, bob + q * 7, 9 + sw * q, bob + q * 11.6, 3.8, mid);
      jg5_limb(ctx, -10, bob + q * 7, -10 - sw * q, bob + q * 11.6, 4, mid);
      lkOV(ctx, 10 + sw * q, bob + q * 12.4, 2.9, 2.3, b);
      lkOV(ctx, -9 - sw * q, bob + q * 12.4, 3, 2.4, b);
    }
    lkOV(ctx, 0, bob, 19.8, 10.8, lo);
    lkOV(ctx, 0, bob, 19, 10, b);
    lkOV(ctx, -1, bob - 5.8, 13.5, 2.6, cream);             /* sunlit flank */
    lkOV(ctx, -1, bob + 6.4, 12, 2, jg5_c(b, -0.1));
    lkOV(ctx, -1, bob, 13, 2.2, mid);                       /* spine band */
    const ros = [-13, -4.4, -7, 4.2, -1, -4.8, 5, 3.6, -4, 0, 10, -3.8, 12.5, 3.8, -14.5, 3.6];
    for (let i = 0; i < ros.length; i += 2) rosette(ctx, ros[i], bob + ros[i + 1], 2.5, dk, jg5_c(b, -0.26));
    jg5_dots(ctx, JG5_JAG_SPOT, 0, bob, 0.8, dk);
    lkOV(ctx, 17, bob, 7.9, 7.3, lo);                       /* head */
    lkOV(ctx, 17, bob, 7.5, 7, b);
    fillCircle(ctx, 13, bob - 5.8, 2.6, dk); fillCircle(ctx, 13, bob + 5.8, 2.6, dk);   /* ears */
    fillCircle(ctx, 13.4, bob - 5.6, 1.1, '#E8DCC0'); fillCircle(ctx, 13.4, bob + 5.6, 1.1, '#E8DCC0');
    lkLN(ctx, [12.5, bob - 2.2, 16.5, bob - 1.8], 0.9, dk);
    lkLN(ctx, [12.5, bob + 2.2, 16.5, bob + 1.8], 0.9, dk);
    lkOV(ctx, 21.6, bob, 3.6, 4.2, jg5_m(b, '#FFF3D8', 0.62));   /* pale muzzle */
    lkOV(ctx, 24.6, bob, 1.4, 1.7, '#6A3A34');
    jg5_dots(ctx, [22, -2.2, 22, 2.2, 20.8, -3.4, 20.8, 3.4], 0, bob, 0.5, dk);
    jg5_eye(ctx, 19, bob - 3.3, 1.35, '#C8E04A', true); jg5_eye(ctx, 19, bob + 3.3, 1.35, '#C8E04A', true);
  },
  tapir(ctx, e, b, dk, bob, wind, d){
    if (wind) ringPath(ctx, 0, bob, 32, 4, '#FF6A4A', 0.6);
    const pale = d.pale || '#D8D2C8';
    const sw = Math.sin(e.anim * 1.6) * 2.4, sn = Math.sin(e.anim * 1.5) * 4;
    const lo = jg5_c(b, -0.5), lite = jg5_m(b, '#CDBFA6', 0.3), pl2 = jg5_c(pale, -0.22);
    for (let s = -1; s <= 1; s += 2){                       /* stout legs, hoofed */
      jg5_limb(ctx, 10, bob + s * 15, 10 + sw * s, bob + s * 22, 7, lo);
      jg5_limb(ctx, -18, bob + s * 14, -18 - sw * s, bob + s * 21.5, 7.4, lo);
      lkOV(ctx, 10 + sw * s, bob + s * 23, 3.6, 2.5, dk);
      lkOV(ctx, -18 - sw * s, bob + s * 22.4, 3.8, 2.6, dk);
    }
    lkOV(ctx, -30.2, bob, 3, 2.4, lo);                      /* stub tail */
    lkOV(ctx, -3, bob, 28.4, 19.4, lo);
    lkOV(ctx, -3, bob, 27, 18, b);
    jg5_rim(ctx, -3, bob, 26.2, 17.2, lite, 1.5);
    lkOV(ctx, 6, bob - 8.5, 16, 4.6, jg5_m(b, '#CDBFA6', 0.12));
    lkOV(ctx, -8, bob + 0.9, 16.6, 17, pl2);                /* the pale saddle: rounded, shaded underneath */
    lkOV(ctx, -8, bob, 16.2, 16.6, pale);
    ctx.strokeStyle = pl2; ctx.lineWidth = 1; ctx.beginPath();   /* coat strokes */
    for (let k = 0; k < 5; k++){
      const o = (k & 1) * 2;
      ctx.moveTo(-20 + k * 6, bob - 9 + o); ctx.lineTo(-18 + k * 6, bob - 5 + o);
      ctx.moveTo(-20 + k * 6, bob + 9 - o); ctx.lineTo(-18 + k * 6, bob + 5 - o);
    }
    ctx.stroke();
    lkOV(ctx, 21, bob, 11.8, 10.8, lo);                     /* head */
    lkOV(ctx, 20.5, bob, 11, 10, b);
    lkOV(ctx, 22, bob - 3.6, 7, 2.4, jg5_m(b, '#CDBFA6', 0.16));
    for (let s = -1; s <= 1; s += 2){                       /* rounded ears with pale rims */
      lkOV(ctx, 13.2, bob + s * 10.2, 4.6, 3.4, pale, s * 0.5);
      lkOV(ctx, 13.4, bob + s * 9.2, 4.2, 3, dk, s * 0.5);
    }
    lkCV(ctx, 28, bob, 34, bob + sn, 38.5, bob + sn * 0.75, 7, lo);   /* flexible proboscis */
    lkCV(ctx, 28, bob, 34, bob + sn, 38.5, bob + sn * 0.75, 5.6, b);
    lkCV(ctx, 30, bob - 1.2, 34, bob + sn - 1.2, 37, bob + sn * 0.75 - 0.8, 1.6, lite);
    fillCircle(ctx, 39, bob + sn * 0.75, 3, jg5_m(b, '#D8C8B0', 0.5));   /* pale tip */
    fillCircle(ctx, 40, bob + sn * 0.75 - 1.1, 0.7, '#120C06'); fillCircle(ctx, 40, bob + sn * 0.75 + 1.1, 0.7, '#120C06');
    jg5_eye(ctx, 23.4, bob - 5.4, 1.5, '#8A5A2E'); jg5_eye(ctx, 23.4, bob + 5.4, 1.5, '#8A5A2E');
  },
  leafcutter(ctx, e, b, dk, bob){
    const lo = jg5_c(b, -0.38), hi = jg5_m(b, '#F0A070', 0.36);
    ctx.strokeStyle = dk; ctx.lineWidth = 1.5; ctx.beginPath();       /* three jointed legs a side */
    for (let i = -1; i <= 1; i++){
      const w = Math.sin(e.anim * 6 + i * 2) * 2, x = i * 5 + 1;
      for (let s = -1; s <= 1; s += 2){
        ctx.moveTo(x, bob + s * 3.2); ctx.lineTo(x + i * 2.6 + w, bob + s * 9); ctx.lineTo(x + i * 5 - w, bob + s * 13.5);
      }
    }
    ctx.stroke();
    ctx.lineWidth = 1.2; ctx.beginPath();                   /* elbowed antennae */
    ctx.moveTo(14, bob - 2); ctx.lineTo(19, bob - 5.5); ctx.lineTo(23, bob - 4);
    ctx.moveTo(14, bob + 2); ctx.lineTo(19, bob + 5.5); ctx.lineTo(23, bob + 4);
    ctx.stroke();
    lkOV(ctx, -10, bob, 8.6, 7.2, lo);                      /* gaster, thorax, head */
    lkOV(ctx, -10, bob, 8, 6.5, b);
    lkOV(ctx, -11.5, bob - 2.4, 4.6, 2.2, hi);
    fillCircle(ctx, -4.4, bob, 1.7, lo);                    /* waist */
    lkOV(ctx, 0, bob, 5, 4, lo);
    lkOV(ctx, 0, bob, 4.5, 3.6, b);
    lkTRI(ctx, 2, bob - 3, 5, bob - 6.4, 4.4, bob - 2.4, dk);      /* thorax spines */
    lkTRI(ctx, 2, bob + 3, 5, bob + 6.4, 4.4, bob + 2.4, dk);
    lkOV(ctx, 9.5, bob, 6.6, 5.9, lo);
    lkOV(ctx, 9.5, bob, 6, 5.5, b);
    lkLN(ctx, [14.4, bob - 1.2, 17.6, bob - 2.8], 1.4, dk);         /* mandibles */
    lkLN(ctx, [14.4, bob + 1.2, 17.6, bob + 2.8], 1.4, dk);
    fillCircle(ctx, 11.6, bob - 3.4, 1.1, '#120C06'); fillCircle(ctx, 11.6, bob + 3.4, 1.1, '#120C06');
    fillCircle(ctx, 11.9, bob - 3.7, 0.4, '#FFFFFF'); fillCircle(ctx, 11.9, bob + 3.1, 0.4, '#FFFFFF');
    ctx.save(); ctx.translate(4, bob - 6.4); ctx.rotate(-0.5 + Math.sin(e.anim * 2) * 0.1);   /* the leaf it hauls */
    jg5_leafPath(ctx, 15, 8.6); ctx.fillStyle = '#5FB23C'; ctx.fill();
    ctx.fillStyle = '#4B9A30'; ctx.beginPath();                      /* shaded half */
    ctx.moveTo(-15, 0); ctx.quadraticCurveTo(-1.5, 9.9, 15, 0); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#8ED65A'; ctx.lineWidth = 1; jg5_leafPath(ctx, 14.2, 7.9); ctx.stroke();
    ctx.strokeStyle = '#2E6A22'; ctx.lineWidth = 1.1; ctx.beginPath();
    ctx.moveTo(-15, 0); ctx.lineTo(14, 0);
    for (let k = -2; k <= 2; k++){
      ctx.moveTo(k * 5, 0); ctx.lineTo(k * 5 + 4, -4.4 + Math.abs(k) * 0.7);
      ctx.moveTo(k * 5, 0); ctx.lineTo(k * 5 + 4, 4.4 - Math.abs(k) * 0.7);
    }
    ctx.stroke();
    ctx.restore();
  },
  ant(ctx, e, b, dk, bob){
    ctx.strokeStyle = dk; ctx.lineWidth = 1; ctx.beginPath();
    for (let i = -1; i <= 1; i++){
      const w = Math.sin(e.anim * 8 + i * 2) * 1.4;
      for (let s = -1; s <= 1; s += 2){ ctx.moveTo(i * 2.8, bob + s * 1.5); ctx.lineTo(i * 2.8 + i * 1.6 + w, bob + s * 4.8); ctx.lineTo(i * 2.8 + i * 3.2 - w, bob + s * 7); }
    }
    ctx.moveTo(8, bob - 1); ctx.lineTo(11, bob - 3); ctx.lineTo(13, bob - 2.4);     /* antennae */
    ctx.moveTo(8, bob + 1); ctx.lineTo(11, bob + 3); ctx.lineTo(13, bob + 2.4);
    ctx.stroke();
    fillCircle(ctx, -5.2, bob, 4, jg5_c(b, -0.35));         /* gaster, thorax, head */
    fillCircle(ctx, -5, bob, 3.6, b);
    fillCircle(ctx, -5.8, bob - 1.2, 1.5, jg5_m(b, '#F0A070', 0.4));
    fillCircle(ctx, 0, bob, 2.3, b);
    fillCircle(ctx, 5.2, bob, 3.2, jg5_c(b, -0.2));
    fillCircle(ctx, 5.2, bob, 2.9, b);
    lkLN(ctx, [8, bob - 0.8, 9.8, bob - 1.9], 0.9, dk); lkLN(ctx, [8, bob + 0.8, 9.8, bob + 1.9], 0.9, dk);
    fillCircle(ctx, 6.2, bob - 1.7, 0.75, '#120C06'); fillCircle(ctx, 6.2, bob + 1.7, 0.75, '#120C06');
  },
  harpy(ctx, e, b, dk, bob, wind, d){
    const flap = Math.sin(e.anim * 1.6) * 0.45;
    const pale = d.pale || '#E8E6E0';
    const lo = jg5_c(b, -0.32), hi = jg5_m(b, '#F4F0E4', 0.3);
    ctx.fillStyle = lo; ctx.beginPath();                    /* barred tail fan */
    for (let k = -2; k <= 2; k++){ const a = k * 0.2; jg5_ovp(ctx, -8 - Math.cos(a) * 8.5, bob - Math.sin(a) * 8.5, 8.6, 2.1, Math.PI + a); }
    ctx.fill();
    ctx.strokeStyle = dk; ctx.lineWidth = 1.3; ctx.beginPath();
    for (let k = -2; k <= 2; k++){ const a = k * 0.2; ctx.moveTo(-8 - Math.cos(a) * 12, bob - Math.sin(a) * 12 - 1.8); ctx.lineTo(-8 - Math.cos(a) * 12, bob - Math.sin(a) * 12 + 1.8); }
    ctx.stroke();
    ctx.fillStyle = jg5_c(b, -0.6); ctx.beginPath();
    for (let k = -2; k <= 2; k++){ const a = k * 0.2; jg5_ovp(ctx, -8 - Math.cos(a) * 15.8, bob - Math.sin(a) * 15.8, 2.4, 1.9, Math.PI + a); }
    ctx.fill();
    for (let side = -1; side <= 1; side += 2){
      ctx.save(); ctx.rotate(side * flap);
      jg5_wing(ctx, side, -1, side * 7, 5, 19, 12, 2.5, 0.04, 0.6, lo, jg5_c(b, -0.6), jg5_c(b, -0.5));
      ctx.fillStyle = b; ctx.beginPath();                   /* coverts */
      jg5_ovp(ctx, -2, side * 12.5, 9.6, 5.2, side * 0.3);
      ctx.fill();
      ctx.fillStyle = hi; ctx.beginPath();
      jg5_ovp(ctx, 0, side * 10.4, 6, 3.2, side * 0.3);
      ctx.fill();
      ctx.strokeStyle = dk; ctx.lineWidth = 1.2; ctx.beginPath();   /* bars across the coverts */
      for (let k = -1; k <= 1; k++){ ctx.moveTo(-2 + k * 4.6, side * 9); ctx.lineTo(-4 + k * 4.6, side * 16); }
      ctx.stroke();
      ctx.restore();
    }
    ctx.strokeStyle = '#E8B830'; ctx.lineWidth = 1.5; ctx.lineCap = 'round'; ctx.beginPath();   /* talons drawn up */
    ctx.moveTo(8, bob - 3); ctx.lineTo(16, bob - 6); ctx.lineTo(22, bob - 6.6);
    ctx.moveTo(8, bob + 3); ctx.lineTo(16, bob + 6); ctx.lineTo(22, bob + 6.6);
    ctx.stroke(); ctx.lineCap = 'butt';
    fillCircle(ctx, 22.4, bob - 6.8, 1, dk); fillCircle(ctx, 22.4, bob + 6.8, 1, dk);
    lkOV(ctx, 0, bob, 12.4, 8.9, lo);
    lkOV(ctx, 0, bob, 12, 8.5, pale);                       /* white breast */
    lkOV(ctx, -3, bob, 8, 5.2, jg5_c(pale, -0.12));
    lkOV(ctx, 6, bob, 3.2, 8.2, dk);                        /* dark chest band */
    lkOV(ctx, -6, bob - 6, 6, 3, hi); lkOV(ctx, -6, bob + 6, 6, 3, hi);   /* feathered thighs */
    lkOV(ctx, 12, bob, 6.3, 5.8, jg5_m(b, '#E8E6E0', 0.4));  /* pale grey head */
    lkOV(ctx, 13.4, bob, 4, 4.4, jg5_m(b, '#F4F0E4', 0.55));
    lkTRI(ctx, 9, bob - 3, 1, bob - 9.4, 7.6, bob - 0.8, dk);     /* the forked double crest */
    lkTRI(ctx, 9, bob + 3, 1, bob + 9.4, 7.6, bob + 0.8, dk);
    lkTRI(ctx, 8, bob - 2, 3, bob - 7, 7, bob - 1, jg5_c(b, -0.55));
    lkTRI(ctx, 8, bob + 2, 3, bob + 7, 7, bob + 1, jg5_c(b, -0.55));
    ctx.fillStyle = '#1A1A18';                              /* hooked beak with a gold cere */
    ctx.beginPath(); ctx.moveTo(16, bob - 2.8); ctx.quadraticCurveTo(21, bob - 2.6, 23, bob + 2.4); ctx.quadraticCurveTo(19.5, bob + 0.8, 16, bob + 2.8); ctx.closePath(); ctx.fill();
    lkOV(ctx, 16.4, bob, 1.6, 2.7, '#F2C24A');
    lkTRI(ctx, 11.6, bob - 4.2, 15.6, bob - 4.4, 13.4, bob - 2.2, dk);    /* heavy brow */
    lkTRI(ctx, 11.6, bob + 4.2, 15.6, bob + 4.4, 13.4, bob + 2.2, dk);
    jg5_eye(ctx, 13.4, bob - 2.7, 1.3, '#F2D24A'); jg5_eye(ctx, 13.4, bob + 2.7, 1.3, '#F2D24A');
  },
  ocelot(ctx, e, b, dk, bob){
    const s = Math.sin(e.anim * 2.4), sw = Math.sin(e.anim * 2.2) * 2.2;
    const lo = jg5_c(b, -0.4), mid = jg5_c(b, -0.2), cream = jg5_m(b, '#FFF0D0', 0.4);
    const cx = -19, cy = bob + s * 3, tx = -26, ty = bob + s * 6;      /* ringed tail */
    lkCV(ctx, -14, bob, cx, cy, tx, ty, 3.6, lo);
    lkCV(ctx, -14, bob, cx, cy, tx, ty, 2.5, b);
    ctx.strokeStyle = dk; ctx.lineWidth = 2.7; ctx.beginPath();
    for (let k = 0; k < 3; k++){
      const t0 = 0.3 + k * 0.2, t1 = t0 + 0.09;
      ctx.moveTo(jg5_q(t0, -14, cx, tx), jg5_q(t0, bob, cy, ty)); ctx.lineTo(jg5_q(t1, -14, cx, tx), jg5_q(t1, bob, cy, ty));
    }
    ctx.stroke();
    fillCircle(ctx, tx, ty, 1.5, dk);
    for (let q = -1; q <= 1; q += 2){                       /* slim legs, dark-spotted paws */
      jg5_limb(ctx, 7, bob + q * 5.4, 7 + sw * q, bob + q * 9.6, 3, mid);
      jg5_limb(ctx, -8, bob + q * 5.4, -8 - sw * q, bob + q * 9.6, 3.2, mid);
      lkOV(ctx, 8 + sw * q, bob + q * 10.2, 2.4, 1.9, b);
      lkOV(ctx, -7 - sw * q, bob + q * 10.2, 2.5, 2, b);
    }
    lkOV(ctx, -1, bob, 15.8, 8.3, lo);
    lkOV(ctx, -1, bob, 15, 7.5, b);
    lkOV(ctx, -1, bob - 4.2, 11, 2, cream);
    lkOV(ctx, -1, bob + 4.6, 10, 1.6, jg5_c(b, -0.08));
    ctx.fillStyle = dk; ctx.beginPath();                    /* chain-like outlined blotches */
    for (let i = 0; i < JG5_OCE_ROW.length; i += 2) jg5_ovp(ctx, JG5_OCE_ROW[i], bob + JG5_OCE_ROW[i + 1], 3.1, 1.5, 0);
    ctx.fill();
    ctx.fillStyle = jg5_c(b, -0.12); ctx.beginPath();
    for (let i = 0; i < JG5_OCE_ROW.length; i += 2) jg5_ovp(ctx, JG5_OCE_ROW[i], bob + JG5_OCE_ROW[i + 1], 1.9, 0.75, 0);
    ctx.fill();
    lkOV(ctx, 13, bob, 6.4, 5.6, lo);
    lkOV(ctx, 13, bob, 6.2, 5.4, b);
    fillCircle(ctx, 9.6, bob - 4.6, 2.2, dk); fillCircle(ctx, 9.6, bob + 4.6, 2.2, dk);   /* ears with white spots */
    fillCircle(ctx, 10, bob - 4.4, 0.95, '#F4EEDC'); fillCircle(ctx, 10, bob + 4.4, 0.95, '#F4EEDC');
    ctx.strokeStyle = '#F4EEDC'; ctx.lineWidth = 0.9;       /* pale tear lines flanked by dark cheek stripes */
    ctx.beginPath(); ctx.moveTo(14.4, bob - 2.2); ctx.lineTo(10.4, bob - 3); ctx.moveTo(14.4, bob + 2.2); ctx.lineTo(10.4, bob + 3); ctx.stroke();
    lkLN(ctx, [12, bob - 4.4, 15, bob - 3.8], 0.9, dk); lkLN(ctx, [12, bob + 4.4, 15, bob + 3.8], 0.9, dk);
    lkOV(ctx, 17.6, bob, 2.5, 2.9, jg5_m(b, '#FFF3D8', 0.6));
    lkOV(ctx, 19.6, bob, 1.1, 1.4, '#5A3030');
    jg5_eye(ctx, 15.2, bob - 2.4, 1.2, '#A8D84A', true); jg5_eye(ctx, 15.2, bob + 2.4, 1.2, '#A8D84A', true);
  },
  capybara(ctx, e, b, dk, bob, wind){
    if (wind) ringPath(ctx, 0, bob, 25, 3, '#FF9C6A', 0.6);
    const sw = Math.sin(e.anim * 1.8) * 1.8;
    const lo = jg5_c(b, -0.42), hi = jg5_m(b, '#E8C898', 0.3);
    for (let s = -1; s <= 1; s += 2){                       /* short webbed legs */
      jg5_limb(ctx, 8, bob + s * 10, 8 + sw * s, bob + s * 14.6, 4.4, lo);
      jg5_limb(ctx, -14, bob + s * 10, -14 - sw * s, bob + s * 14.6, 4.8, lo);
      lkOV(ctx, 9 + sw * s, bob + s * 15.4, 3.2, 2.2, dk);
      lkOV(ctx, -13 - sw * s, bob + s * 15.4, 3.4, 2.3, dk);
    }
    lkOV(ctx, -3, bob, 21, 14.5, lo);
    lkOV(ctx, -3, bob, 20, 13.5, b);
    lkOV(ctx, -3, bob - 7, 14.5, 4.2, jg5_m(b, '#E8C898', 0.14));
    lkOV(ctx, -3, bob, 16, 3, dk);                          /* dark spine band */
    ctx.strokeStyle = jg5_c(b, -0.25); ctx.lineWidth = 1; ctx.beginPath();   /* coarse coat strokes */
    for (let k = 0; k < 6; k++){
      const x = -16 + k * 5.4, o = (k & 1) * 1.6;
      ctx.moveTo(x, bob - 11 + o); ctx.lineTo(x + 2.2, bob - 7.4 + o);
      ctx.moveTo(x, bob + 11 - o); ctx.lineTo(x + 2.2, bob + 7.4 - o);
    }
    ctx.stroke();
    ctx.fillStyle = lo;                                     /* that blunt, boxy head */
    ctx.beginPath(); ctx.moveTo(8, bob - 9); ctx.lineTo(22, bob - 7.6); ctx.quadraticCurveTo(26.8, bob - 7, 26.8, bob - 3);
    ctx.lineTo(26.8, bob + 3); ctx.quadraticCurveTo(26.8, bob + 7, 22, bob + 7.6); ctx.lineTo(8, bob + 9); ctx.closePath(); ctx.fill();
    ctx.fillStyle = b;
    ctx.beginPath(); ctx.moveTo(9, bob - 8); ctx.lineTo(22, bob - 6.8); ctx.quadraticCurveTo(25.8, bob - 6.2, 25.8, bob - 3);
    ctx.lineTo(25.8, bob + 3); ctx.quadraticCurveTo(25.8, bob + 6.2, 22, bob + 6.8); ctx.lineTo(9, bob + 8); ctx.closePath(); ctx.fill();
    lkOV(ctx, 18, bob - 3.5, 6, 1.8, hi);
    lkOV(ctx, 24.8, bob, 1.9, 5.2, '#2A1C14');              /* broad nose pad */
    fillCircle(ctx, 25.6, bob - 2.2, 0.7, '#0A0604'); fillCircle(ctx, 25.6, bob + 2.2, 0.7, '#0A0604');
    lkOV(ctx, 19.4, bob + 1.4, 2.6, 1.7, jg5_c(b, -0.3));  /* scent-gland bump */
    fillCircle(ctx, 10.4, bob - 8.4, 2.3, dk); fillCircle(ctx, 10.4, bob + 8.4, 2.3, dk);   /* small ears */
    fillCircle(ctx, 10.6, bob - 8.4, 1.1, jg5_m(b, '#E8A890', 0.4)); fillCircle(ctx, 10.6, bob + 8.4, 1.1, jg5_m(b, '#E8A890', 0.4));
    lkLN(ctx, [24, bob - 2, 28.4, bob - 4.6], 0.7, hi); lkLN(ctx, [24, bob + 2, 28.4, bob + 4.6], 0.7, hi);   /* whiskers */
    jg5_eye(ctx, 15.6, bob - 5.4, 1.25, '#5A3A1C'); jg5_eye(ctx, 15.6, bob + 5.4, 1.25, '#5A3A1C');
    const by = bob - 2 + Math.sin(e.anim * 2) * 0.6;       /* the little bird that always rides along */
    lkOV(ctx, -9.6, by, 2.6, 1.6, '#A8881C');
    lkOV(ctx, -8, by, 3.3, 2.5, '#F2D23A');
    lkOV(ctx, -8.8, by, 2, 1.3, '#C8A420');
    fillCircle(ctx, -4.8, by, 1.6, '#F2D23A');
    lkTRI(ctx, -3.6, by - 0.8, -1.8, by, -3.6, by + 0.8, '#E8862A');
    fillCircle(ctx, -4.5, by - 0.6, 0.45, '#0E0A06');
  },
  howler(ctx, e, b, dk, bob){
    const sw = Math.sin(e.anim * 1.5) * 1.4;
    const lo = jg5_c(b, -0.4), hi = jg5_m(b, '#E8884A', 0.4), mane = jg5_m(b, dk, 0.5);
    ctx.strokeStyle = lo; ctx.lineWidth = 4.2; ctx.lineCap = 'round';   /* prehensile tail curl */
    ctx.beginPath(); ctx.moveTo(-12, bob);
    ctx.bezierCurveTo(-24, bob, -26, bob - 12, -19, bob - 12 + sw);
    ctx.quadraticCurveTo(-15, bob - 12 + sw, -16, bob - 8); ctx.stroke();
    ctx.strokeStyle = b; ctx.lineWidth = 2.8;
    ctx.beginPath(); ctx.moveTo(-12, bob);
    ctx.bezierCurveTo(-24, bob, -26, bob - 12, -19, bob - 12 + sw);
    ctx.quadraticCurveTo(-15, bob - 12 + sw, -16, bob - 8); ctx.stroke();
    ctx.lineCap = 'butt';
    fillCircle(ctx, -16, bob - 8, 1.7, dk);                 /* bare gripping tip */
    for (let s = -1; s <= 1; s += 2){                       /* limbs: hind legs and reaching arms */
      jg5_limb(ctx, -7, bob + s * 8, -10 - sw * s, bob + s * 12.8, 3.6, lo);
      lkOV(ctx, -10.6 - sw * s, bob + s * 13.6, 3, 2, dk);
      jg5_limb(ctx, 4, bob + s * 8, 10 + sw * s, bob + s * 12, 3.2, lo);
      lkOV(ctx, 12 + sw * s, bob + s * 12.6, 2.6, 1.9, dk);
    }
    for (let pass = 0; pass < 2; pass++){                   /* shaggy mane of alternating tufts, two batched fills */
      ctx.fillStyle = pass ? dk : mane; ctx.beginPath();
      for (let i = pass; i < 12; i += 2){ const a = i * TAU / 12; jg5_ovp(ctx, -2 + Math.cos(a) * 11.4, bob + Math.sin(a) * 11.4, 4.4, 3, a); }
      ctx.fill();
    }
    lkOV(ctx, -2, bob, 12.2, 12.2, lo);
    lkOV(ctx, -2, bob, 11.5, 11.5, b);
    lkOV(ctx, -4, bob - 4.4, 7.4, 4.2, hi);                 /* russet sheen on the back */
    lkOV(ctx, -6, bob + 3, 5, 3, jg5_c(b, -0.2));
    ctx.strokeStyle = lo; ctx.lineWidth = 1; ctx.beginPath();   /* shaggy fur flicks */
    for (let k = 0; k < 5; k++){ const a = -0.9 + k * 0.45; ctx.moveTo(-2 + Math.cos(a) * 5, bob + Math.sin(a) * 5 - 1); ctx.lineTo(-2 + Math.cos(a) * 9.4, bob + Math.sin(a) * 9.4 - 1); }
    ctx.stroke();
    lkOV(ctx, 11, bob, 8, 7.5, lo);
    lkOV(ctx, 11, bob, 7.5, 7, b);
    fillCircle(ctx, 8.2, bob - 6.6, 2.1, dk); fillCircle(ctx, 8.2, bob + 6.6, 2.1, dk);   /* ears */
    lkOV(ctx, 15.4, bob, 4.8, 5.2, '#1A0E08');             /* bare dark face and beard */
    lkOV(ctx, 13.6, bob, 7, 6.4, 'rgba(26,14,8,0.35)');
    if (Math.sin(e.anim * 2.5) > 0.55){ fillCircle(ctx, 18.4, bob, 2.5, '#4A0E08'); fillCircle(ctx, 18.8, bob, 1.2, '#C8505A'); }   /* mid-howl */
    fillCircle(ctx, 18.2, bob - 3.2, 0.6, '#3A2018'); fillCircle(ctx, 18.2, bob + 3.2, 0.6, '#3A2018');
    lkLN(ctx, [11.6, bob - 4.6, 14.8, bob - 3.8], 1, dk); lkLN(ctx, [11.6, bob + 4.6, 14.8, bob + 3.8], 1, dk);
    jg5_eye(ctx, 13.4, bob - 2.5, 1.15, '#E8C86A'); jg5_eye(ctx, 13.4, bob + 2.5, 1.15, '#E8C86A');
  },
  anteater(ctx, e, b, dk, bob, wind, d){
    const pale = d.pale || '#F0ECE2';
    const sw = Math.sin(e.anim * 1.8) * 2, ts = Math.sin(e.anim) * 1.5;
    const lo = jg5_c(b, -0.45), hi = jg5_m(b, '#D8CCB8', 0.34), tip = jg5_m(b, '#E8E0D0', 0.5);
    for (let s = -1; s <= 1; s += 2){                       /* hind legs, then pale forelegs with great claws */
      jg5_limb(ctx, -8, bob + s * 6.6, -8 - sw * s, bob + s * 11.6, 3.4, lo);
      lkOV(ctx, -8 - sw * s, bob + s * 12.2, 3, 2, dk);
      jg5_limb(ctx, 6, bob + s * 6.6, 7 + sw * s, bob + s * 11.4, 3.6, pale);
      lkLN(ctx, [7 + sw * s, bob + s * 8.6, 7 + sw * s, bob + s * 11.6], 3.6, dk);
      lkTRI(ctx, 5.6 + sw * s, bob + s * 11.6, 11.6 + sw * s, bob + s * 13.6, 8.4 + sw * s, bob + s * 10.4, '#F2ECDC');
    }
    ctx.fillStyle = dk;                                     /* the great bushy fan of a tail */
    ctx.beginPath(); ctx.ellipse(-21, bob + ts, 10.4, 8.4, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = jg5_m(b, dk, 0.45);
    ctx.beginPath(); ctx.ellipse(-22, bob + ts, 7.6, 5.6, 0, 0, TAU); ctx.fill();
    ctx.strokeStyle = tip; ctx.lineWidth = 1; ctx.beginPath();
    for (let k = -3; k <= 3; k++){ ctx.moveTo(-14, bob); ctx.lineTo(-30, bob + ts + k * 3); }
    ctx.stroke();
    ctx.strokeStyle = '#2A2420'; ctx.lineWidth = 1; ctx.beginPath();
    for (let k = -3; k <= 3; k++){ ctx.moveTo(-14, bob + k * 0.6); ctx.lineTo(-26, bob + ts + k * 2.4); }
    ctx.stroke();
    lkOV(ctx, -2, bob, 16, 9.8, lo);
    lkOV(ctx, -2, bob, 15, 9, b);
    jg5_rim(ctx, -2, bob, 14.4, 8.4, hi, 1.4);
    ctx.fillStyle = pale;                                   /* white-edged black shoulder stripe */
    ctx.beginPath(); ctx.moveTo(-4, bob - 9); ctx.lineTo(4.4, bob - 9); ctx.lineTo(-1.6, bob + 9); ctx.lineTo(-10.4, bob + 9); ctx.closePath(); ctx.fill();
    ctx.fillStyle = dk;
    ctx.beginPath(); ctx.moveTo(-2.5, bob - 9); ctx.lineTo(2.5, bob - 9); ctx.lineTo(-3.5, bob + 9); ctx.lineTo(-8.5, bob + 9); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = hi; ctx.lineWidth = 0.9; ctx.beginPath();     /* coarse guard hairs */
    for (let k = 0; k < 5; k++){ ctx.moveTo(-14 + k * 1.6, bob - 4 + k * 0.4); ctx.lineTo(-17 + k * 1.2, bob - 5 + k * 0.4); ctx.moveTo(-13 + k * 1.6, bob + 3 + k * 0.5); ctx.lineTo(-16 + k * 1.2, bob + 4.2 + k * 0.5); }
    ctx.stroke();
    lkOV(ctx, 9, bob, 6.4, 6, lo);
    lkOV(ctx, 9, bob, 6, 5.6, b);
    fillCircle(ctx, 6.4, bob - 5.4, 1.9, dk); fillCircle(ctx, 6.4, bob + 5.4, 1.9, dk);    /* small round ears */
    ctx.fillStyle = lo;                                     /* long tapering snout */
    ctx.beginPath(); ctx.moveTo(10, bob - 5); ctx.lineTo(31.4, bob - 1.5); ctx.lineTo(31.4, bob + 1.5); ctx.lineTo(10, bob + 5); ctx.closePath(); ctx.fill();
    ctx.fillStyle = b;
    ctx.beginPath(); ctx.moveTo(10, bob - 4.2); ctx.lineTo(31, bob - 0.9); ctx.lineTo(31, bob + 0.9); ctx.lineTo(10, bob + 4.2); ctx.closePath(); ctx.fill();
    lkLN(ctx, [12, bob - 1.6, 28, bob - 0.4], 0.8, hi);
    fillCircle(ctx, 31.4, bob, 1.6, dk);
    const tl = Math.max(0, Math.sin(e.anim * 3)) * 5;      /* flicking tongue */
    if (tl > 0.4) lkLN(ctx, [32, bob, 32 + tl, bob + Math.sin(e.anim * 6) * 0.8], 1.1, '#E0707E');
    jg5_eye(ctx, 13.6, bob - 2.9, 1.05, '#7A5A34'); jg5_eye(ctx, 13.6, bob + 2.9, 1.05, '#7A5A34');
  },
  dartfrog(ctx, e, b, dk, bob){
    const leap = e.state === 'dash' ? 1 : 0;
    const lo = jg5_c(b, -0.38), hi = jg5_m(b, '#CFF0FF', 0.5), pad = jg5_m(b, '#CFF0FF', 0.3);
    for (let s = -1; s <= 1; s += 2){                       /* folded hind legs (splayed hard mid-leap) and small arms */
      const kx = -5 - leap * 4, ky = bob + s * (6.4 + leap * 1.6), fx = -9.5 - leap * 6, fy = bob + s * (9.8 + leap * 2.4);
      lkOV(ctx, kx, ky, 4.8 + leap * 1.4, 2.8, lo, s * 0.5);
      lkLN(ctx, [kx - 2, ky + s * 0.8, fx, fy], 2.2, lo);
      fillCircle(ctx, fx - 0.4, fy + s * 0.5, 1.2, pad); fillCircle(ctx, fx - 1.8, fy - s * 0.4, 1, pad); fillCircle(ctx, fx + 0.6, fy + s * 1.6, 1, pad);
      lkLN(ctx, [4, bob + s * 4.6, 6.4, bob + s * 8.4], 2, lo);
      fillCircle(ctx, 6.4, bob + s * 8.9, 1.4, pad);
      fillCircle(ctx, 8, bob + s * 8.4, 1, pad);
    }
    lkOV(ctx, 0, bob, 9.8, 8.3, lo);
    lkOV(ctx, 0, bob, 9, 7.5, b);
    lkOV(ctx, -1, bob - 3.6, 6, 2, hi);                     /* glossy back sheen */
    jg5_dots(ctx, [-4, -3, 1, 3, -3, 3.6, 3, -2.6, -6.5, 0, 0, -0.4], 0, bob, 1.5, dk);   /* black spotting */
    jg5_dots(ctx, [-4, -3, 1, 3], 0, bob, 0.7, jg5_c(b, -0.2));
    fillCircle(ctx, 6, bob - 3.8, 2.9, lo); fillCircle(ctx, 6, bob + 3.8, 2.9, lo);     /* bulging eyes */
    fillCircle(ctx, 6.1, bob - 3.8, 2.3, '#0A0A0A'); fillCircle(ctx, 6.1, bob + 3.8, 2.3, '#0A0A0A');
    fillCircle(ctx, 6.9, bob - 4.6, 0.75, '#FFFFFF'); fillCircle(ctx, 6.9, bob + 3, 0.75, '#FFFFFF');
    fillCircle(ctx, 9.2, bob - 1.2, 0.45, dk); fillCircle(ctx, 9.2, bob + 1.2, 0.45, dk);   /* nostrils */
  },
  froglet(ctx, e, b, dk, bob){
    softBlob(ctx, 0, bob, 11, '#B8E04A', 0.18);
    const lo = jg5_c(b, -0.32), hi = jg5_m(b, '#FFF0B0', 0.5);
    for (let s = -1; s <= 1; s += 2){
      lkOV(ctx, -3.6, bob + s * 4.6, 3.4, 1.8, lo, s * 0.6);
      lkLN(ctx, [-5, bob + s * 5.6, -7, bob + s * 7.4], 1.5, lo);
      fillCircle(ctx, -7.4, bob + s * 7.9, 0.9, hi);
      lkLN(ctx, [3, bob + s * 3.6, 4.6, bob + s * 6.2], 1.3, lo);
      fillCircle(ctx, 4.8, bob + s * 6.6, 0.9, hi);
    }
    lkOV(ctx, 0, bob, 6.4, 5.4, lo);
    lkOV(ctx, 0, bob, 6, 5, b);
    lkOV(ctx, -0.6, bob - 2, 3.4, 1.2, hi);
    lkOV(ctx, -1, bob, 4.2, 0.9, dk);                       /* dorsal stripe */
    fillCircle(ctx, 3.6, bob - 2.6, 1.9, lo); fillCircle(ctx, 3.6, bob + 2.6, 1.9, lo);
    fillCircle(ctx, 3.7, bob - 2.6, 1.5, '#0A0A0A'); fillCircle(ctx, 3.7, bob + 2.6, 1.5, '#0A0A0A');
    fillCircle(ctx, 4.2, bob - 3.1, 0.5, '#FFFFFF'); fillCircle(ctx, 4.2, bob + 2.1, 0.5, '#FFFFFF');
  },
  shadowjag(ctx, e, b, dk, bob){
    const RIM = '#6A5A82', SHEEN = jg5_m(b, '#8A78A8', 0.2), RING = '#5A4E70', AMBER = '#D49A32';
    const s = Math.sin(e.anim), sw = Math.sin(e.anim * 1.7) * 4;
    const cx = -56, cy = bob + s * 12, tx = -68, ty = bob + s * 22;   /* long, thick tail */
    lkCV(ctx, -38, bob, cx, cy, tx, ty, 8.2, RIM);
    lkCV(ctx, -38, bob, cx, cy, tx, ty, 6, b);
    ctx.strokeStyle = RING; ctx.lineWidth = 6; ctx.beginPath();
    for (let k = 0; k < 4; k++){
      const t0 = 0.22 + k * 0.17, t1 = t0 + 0.06;
      ctx.moveTo(jg5_q(t0, -38, cx, tx), jg5_q(t0, bob, cy, ty)); ctx.lineTo(jg5_q(t1, -38, cx, tx), jg5_q(t1, bob, cy, ty));
    }
    ctx.stroke();
    fillCircle(ctx, tx, ty, 3.4, '#8A6A2A');                /* amber-tipped */
    fillCircle(ctx, tx, ty, 2.4, AMBER);
    for (let q = -1; q <= 1; q += 2){                       /* heavy limbs with big spread paws */
      jg5_limb(ctx, 18, bob + q * 18, 19 + sw * q, bob + q * 30, 12.4, RIM);
      jg5_limb(ctx, 18, bob + q * 18, 19 + sw * q, bob + q * 30, 10.2, b);
      jg5_limb(ctx, -24, bob + q * 17, -26 - sw * q, bob + q * 29, 13.4, RIM);
      jg5_limb(ctx, -24, bob + q * 17, -26 - sw * q, bob + q * 29, 11.2, b);
      lkOV(ctx, 21 + sw * q, bob + q * 33, 7.6, 5.8, RIM);
      lkOV(ctx, 21 + sw * q, bob + q * 33, 7, 5.2, b);
      lkOV(ctx, -25 - sw * q, bob + q * 32, 8, 6, RIM);
      lkOV(ctx, -25 - sw * q, bob + q * 32, 7.4, 5.4, b);
      jg5_dots(ctx, [25 + sw * q, q * 31.2, 25.6 + sw * q, q * 33.6, 25 + sw * q, q * 36], 0, bob, 1.1, SHEEN);   /* toe beans */
      lkTRI(ctx, 27.6 + sw * q, bob + q * 31, 31.4 + sw * q, bob + q * 33, 27.6 + sw * q, bob + q * 35, '#D8CFC0');   /* claws */
    }
    lkOV(ctx, -4, bob, 42.6, 27.2, RIM);                    /* violet rim light so the black coat reads on the ground */
    lkOV(ctx, -4, bob, 40.8, 25.4, b);
    lkOV(ctx, -6, bob - 9, 31, 9.4, SHEEN);                 /* glossy sheen along the back */
    lkOV(ctx, -4, bob, 33, 3, jg5_m(b, dk, 0.55));          /* dark spine */
    lkOV(ctx, 12, bob - 14, 9, 6.4, SHEEN, -0.3); lkOV(ctx, 12, bob + 14, 9, 6.4, jg5_m(b, '#8A78A8', 0.1), 0.3);   /* shoulders */
    const ros = [-26, -11, -18, 9, -8, -13, 0, 8, 10, -10, -20, -18, 4, 15, -30, 6, 14, 10, -34, -6, -14, 17, -1, -19];
    ctx.strokeStyle = RING; ctx.lineWidth = 2.2; ctx.beginPath();          /* rosettes: open rings of ghost-spots ... */
    for (let i = 0; i < ros.length; i += 2){
      const rx = ros[i], ry = bob + ros[i + 1], o = i * 0.9;
      ctx.moveTo(rx + Math.cos(o) * 5, ry + Math.sin(o) * 5); ctx.arc(rx, ry, 5, o, o + 1.7);
      ctx.moveTo(rx + Math.cos(o + 2.4) * 5, ry + Math.sin(o + 2.4) * 5); ctx.arc(rx, ry, 5, o + 2.4, o + 4.1);
      ctx.moveTo(rx + Math.cos(o + 4.8) * 5, ry + Math.sin(o + 4.8) * 5); ctx.arc(rx, ry, 5, o + 4.8, o + 5.9);
    }
    ctx.stroke();
    ctx.fillStyle = AMBER; ctx.beginPath();                 /* ... with one amber fleck each */
    for (let i = 0; i < ros.length; i += 2){ ctx.moveTo(ros[i] + 0.9, bob + ros[i + 1]); ctx.arc(ros[i], bob + ros[i + 1], 0.9, 0, TAU); }
    ctx.fill();
    lkOV(ctx, 30, bob, 17.4, 16.4, RIM);                    /* broad head */
    lkOV(ctx, 30, bob, 16, 15, b);
    lkOV(ctx, 28, bob - 6, 10, 4, SHEEN);
    lkTRI(ctx, 24, bob - 13, 30, bob - 18, 31, bob - 10, jg5_m(b, '#8A78A8', 0.12));   /* cheek ruff */
    lkTRI(ctx, 24, bob + 13, 30, bob + 18, 31, bob + 10, jg5_m(b, '#8A78A8', 0.12));
    lkOV(ctx, 21.4, bob - 12.4, 6.2, 5.8, RIM); lkOV(ctx, 21.4, bob + 12.4, 6.2, 5.8, RIM);   /* round ears */
    fillCircle(ctx, 21.4, bob - 12.4, 5, dk); fillCircle(ctx, 21.4, bob + 12.4, 5, dk);
    fillCircle(ctx, 22.4, bob - 12.2, 2.3, '#9A8AAE'); fillCircle(ctx, 22.4, bob + 12.2, 2.3, '#9A8AAE');
    lkLN(ctx, [24, bob - 3, 33, bob - 2.4], 1.4, RING); lkLN(ctx, [24, bob + 3, 33, bob + 2.4], 1.4, RING);   /* forehead stripes */
    lkOV(ctx, 41, bob, 7.6, 8.2, RIM);
    lkOV(ctx, 41, bob, 7, 7.5, jg5_m(b, '#8A78A8', 0.3));   /* lighter muzzle */
    jg5_dots(ctx, [42, -4, 42, 4, 40, -5.6, 40, 5.6, 44, -2.4, 44, 2.4], 0, bob, 0.8, dk);
    lkOV(ctx, 47, bob, 2.4, 1.9, '#B07A82');                /* nose */
    softBlob(ctx, 34, bob - 6.5, 7, '#D8F04A', 0.3); softBlob(ctx, 34, bob + 6.5, 7, '#D8F04A', 0.3);
    fillCircle(ctx, 34, bob - 6.5, 3.3, '#120C06'); fillCircle(ctx, 34, bob + 6.5, 3.3, '#120C06');
    fillCircle(ctx, 34, bob - 6.5, 2.8, '#D8F04A'); fillCircle(ctx, 34, bob + 6.5, 2.8, '#D8F04A');
    ctx.fillStyle = '#0A0A0A';
    ctx.beginPath(); ctx.ellipse(34.4, bob - 6.5, 0.8, 2.2, 0, 0, TAU); ctx.fill();
    ctx.beginPath(); ctx.ellipse(34.4, bob + 6.5, 0.8, 2.2, 0, 0, TAU); ctx.fill();
    fillCircle(ctx, 35.2, bob - 7.5, 0.7, '#FFFFFF'); fillCircle(ctx, 35.2, bob + 5.5, 0.7, '#FFFFFF');
    lkTRI(ctx, 29.6, bob - 10.6, 37.4, bob - 11, 34.6, bob - 8.8, dk); lkTRI(ctx, 29.6, bob + 10.6, 37.4, bob + 11, 34.6, bob + 8.8, dk);   /* brows */
    if (e.state === 'roar'){
      ctx.fillStyle = '#6E1A1C'; ctx.beginPath(); ctx.ellipse(45, bob, 6, 5 + Math.sin(G.time * 30) * 1.5, 0, 0, TAU); ctx.fill();
      lkTRI(ctx, 42, bob - 3.6, 46.4, bob - 4, 44.4, bob - 0.6, '#F0E8D8'); lkTRI(ctx, 42, bob + 3.6, 46.4, bob + 4, 44.4, bob + 0.6, '#F0E8D8');
    }
  },
  harpyqueen(ctx, e, b, dk, bob, wind, d){
    const flap = Math.sin(e.anim * 1.1) * 0.3;
    const pale = d.pale || '#ECEAE4', GOLD = '#F2C24A';
    const lo = jg5_c(b, -0.34), hi = jg5_m(b, '#F4F0E4', 0.3), deep = jg5_c(b, -0.55);
    ctx.fillStyle = lo; ctx.strokeStyle = deep; ctx.lineWidth = 1.2; ctx.beginPath();   /* great barred tail fan */
    for (let k = -3; k <= 3; k++){ const a = k * 0.17; jg5_ovp(ctx, -26 - Math.cos(a) * 17, bob - Math.sin(a) * 17, 18, 4.2, Math.PI + a); }
    ctx.fill(); ctx.stroke();
    ctx.strokeStyle = dk; ctx.lineWidth = 2; ctx.beginPath();
    for (let k = -3; k <= 3; k++){ const a = k * 0.17; for (let j = 0; j < 2; j++){ const L = 22 + j * 9; ctx.moveTo(-26 - Math.cos(a) * L + Math.sin(a) * 0.2, bob - Math.sin(a) * L - 3); ctx.lineTo(-26 - Math.cos(a) * L, bob - Math.sin(a) * L + 3); } }
    ctx.stroke();
    ctx.fillStyle = dk; ctx.beginPath();
    for (let k = -3; k <= 3; k++){ const a = k * 0.17; jg5_ovp(ctx, -26 - Math.cos(a) * 33.5, bob - Math.sin(a) * 33.5, 4, 3.4, Math.PI + a); }
    ctx.fill();
    for (let side = -1; side <= 1; side += 2){
      ctx.save(); ctx.rotate(side * flap);
      jg5_wing(ctx, side, -2, side * 20, 8, 46, 28, 5, 0.03, 0.7, lo, jg5_c(b, -0.62), deep);      /* primaries */
      jg5_wing(ctx, side, 0, side * 18, 5, 30, 20, 5.4, 0.45, 0.95, jg5_c(b, -0.12), jg5_c(b, -0.5), deep);   /* secondaries */
      ctx.fillStyle = b; ctx.strokeStyle = deep; ctx.lineWidth = 1; ctx.beginPath();        /* coverts, three rows */
      jg5_ovp(ctx, -2, side * 28, 22, 8.6, side * 0.38);
      jg5_ovp(ctx, 2, side * 24, 17, 7, side * 0.3);
      ctx.fill(); ctx.stroke();
      ctx.fillStyle = hi; ctx.beginPath();
      jg5_ovp(ctx, 0, side * 24.5, 16, 5.4, side * 0.36);
      jg5_ovp(ctx, 3, side * 21.4, 10, 3.6, side * 0.3);
      ctx.fill();
      ctx.strokeStyle = dk; ctx.lineWidth = 2; ctx.beginPath();                             /* bold wing bars */
      for (let k = -2; k <= 2; k++){ ctx.moveTo(-1 + k * 7.4, side * 17); ctx.lineTo(-6 + k * 7.4, side * 31); }
      ctx.stroke();
      ctx.restore();
    }
    ctx.strokeStyle = GOLD; ctx.lineWidth = 3.6; ctx.lineCap = 'round'; ctx.beginPath();     /* gold legs and spread talons */
    ctx.moveTo(14, bob - 8); ctx.lineTo(28, bob - 11); ctx.lineTo(37, bob - 11);
    ctx.moveTo(14, bob + 8); ctx.lineTo(28, bob + 11); ctx.lineTo(37, bob + 11);
    ctx.stroke();
    ctx.lineWidth = 2.4; ctx.beginPath();
    for (let s = -1; s <= 1; s += 2){ ctx.moveTo(37, bob + s * 11); ctx.lineTo(45, bob + s * 6.4); ctx.moveTo(37, bob + s * 11); ctx.lineTo(46, bob + s * 11); ctx.moveTo(37, bob + s * 11); ctx.lineTo(44, bob + s * 16); }
    ctx.stroke();
    ctx.strokeStyle = '#1A1A18'; ctx.lineWidth = 1.8; ctx.beginPath();
    for (let s = -1; s <= 1; s += 2){ ctx.moveTo(45, bob + s * 6.4); ctx.lineTo(48.4, bob + s * 5); ctx.moveTo(46, bob + s * 11); ctx.lineTo(49.4, bob + s * 11.6); ctx.moveTo(44, bob + s * 16); ctx.lineTo(46.8, bob + s * 18.6); }
    ctx.stroke(); ctx.lineCap = 'butt';
    lkOV(ctx, -6, bob, 31, 23, lo);
    lkOV(ctx, -6, bob, 30, 22, pale);                       /* big white breast */
    lkOV(ctx, -12, bob, 20, 15, jg5_c(pale, -0.1));
    ctx.strokeStyle = jg5_c(pale, -0.28); ctx.lineWidth = 1.4; ctx.beginPath();            /* breast feathering */
    for (let r = 0; r < 3; r++) for (let k = -2; k <= 2; k++){ const x = -14 + r * 9 + (k & 1) * 3, y = bob + k * 7; ctx.moveTo(x, y - 2.6); ctx.quadraticCurveTo(x + 3, y, x, y + 2.6); }
    ctx.stroke();
    lkOV(ctx, -22, bob - 16, 11, 6.6, b, -0.3); lkOV(ctx, -22, bob + 16, 11, 6.6, b, 0.3);   /* feathered trousers */
    lkOV(ctx, 10, bob, 7.6, 20.4, lo);
    lkOV(ctx, 10, bob, 7, 19.6, dk);                        /* black chest band */
    lkOV(ctx, 8.4, bob, 3.4, 14, jg5_m(dk, b, 0.35));
    lkOV(ctx, 26, bob, 14.6, 13.6, lo);                     /* head */
    lkOV(ctx, 26, bob, 14, 13, jg5_m(b, '#E8E6E0', 0.3));
    lkOV(ctx, 29, bob, 9, 9.2, jg5_m(b, '#F4F0E4', 0.55));  /* pale facial disc */
    for (let side = -1; side <= 1; side += 2) for (let k = 0; k < 3; k++){     /* raised crest, the display of an angry harpy */
      lkTRI(ctx, 22 - k * 3, bob + side * 7, 4 - k * 4, bob + side * (19 + k * 3.4), 20 - k * 3, bob + side * 3, dk);
      lkTRI(ctx, 20 - k * 3, bob + side * 6, 8 - k * 4, bob + side * (15 + k * 3), 19 - k * 3, bob + side * 3.4, jg5_c(b, -0.5));
    }
    ctx.fillStyle = '#1A1A18';                              /* heavy hooked beak, gold cere */
    ctx.beginPath(); ctx.moveTo(36, bob - 6); ctx.quadraticCurveTo(48, bob - 5.6, 53.4, bob + 4.4); ctx.quadraticCurveTo(46, bob + 1.2, 36, bob + 6); ctx.closePath(); ctx.fill();
    lkOV(ctx, 37.6, bob, 3.4, 6, GOLD);
    lkLN(ctx, [40, bob - 3.4, 49, bob - 1.4], 1.1, '#4A4A46');
    fillCircle(ctx, 40, bob - 2, 0.9, '#1A1A18'); fillCircle(ctx, 40, bob + 2, 0.9, '#1A1A18');
    lkTRI(ctx, 27, bob - 10.4, 37, bob - 10.4, 32, bob - 5.4, dk); lkTRI(ctx, 27, bob + 10.4, 37, bob + 10.4, 32, bob + 5.4, dk);   /* fierce brows */
    jg5_eye(ctx, 31.4, bob - 6.2, 2.8, GOLD); jg5_eye(ctx, 31.4, bob + 6.2, 2.8, GOLD);
  },
  armadillo(ctx, e, b, dk, bob){
    if (e.state === 'dash' || e.state === 'wind') softBlob(ctx, 10, bob, 52, '#FF5A2C', 0.1);
    const sw = Math.sin(e.anim * 1.5) * 2;
    const lo = jg5_c(b, -0.4), skin = jg5_m(b, '#D8B09A', 0.5), skinLo = jg5_c(skin, -0.25), lite = jg5_m(b, '#F0E4CC', 0.32);
    ctx.fillStyle = lo;                                     /* tapering banded tail */
    ctx.beginPath(); ctx.moveTo(-38, bob - 7.4); ctx.lineTo(-72, bob); ctx.lineTo(-38, bob + 7.4); ctx.closePath(); ctx.fill();
    ctx.fillStyle = b;
    ctx.beginPath(); ctx.moveTo(-38, bob - 6.2); ctx.lineTo(-70, bob); ctx.lineTo(-38, bob + 6.2); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = dk; ctx.lineWidth = 1.8; ctx.beginPath();
    for (let k = 0; k < 6; k++){ const x = -44 - k * 5, h = 5.6 - k * 0.9; ctx.moveTo(x, bob - h); ctx.lineTo(x, bob + h); }
    ctx.stroke();
    for (let s = -1; s <= 1; s += 2){                       /* stout digging legs under the shell */
      jg5_limb(ctx, 22, bob + s * 20, 27 + sw * s, bob + s * 29, 11, skinLo);
      jg5_limb(ctx, 22, bob + s * 20, 27 + sw * s, bob + s * 29, 9, skin);
      jg5_limb(ctx, -28, bob + s * 20, -29 - sw * s, bob + s * 28, 11.4, skinLo);
      jg5_limb(ctx, -28, bob + s * 20, -29 - sw * s, bob + s * 28, 9.4, skin);
      ctx.fillStyle = '#E8E0D2';                            /* huge digging claws */
      ctx.beginPath();
      for (let k = 0; k < 3; k++){
        ctx.moveTo(26 + k * 4 + sw * s, bob + s * 27); ctx.lineTo(37 + k * 4 + sw * s, bob + s * 35); ctx.lineTo(29 + k * 4 + sw * s, bob + s * 25); ctx.closePath();
        ctx.moveTo(-34 + k * 3.6 - sw * s, bob + s * 27); ctx.lineTo(-28 + k * 3.6 - sw * s, bob + s * 33.4); ctx.lineTo(-31 + k * 3.6 - sw * s, bob + s * 26); ctx.closePath();
      }
      ctx.fill();
    }
    lkOV(ctx, -6, bob, 45.6, 31.6, lo);                     /* shell rim and dome */
    lkOV(ctx, -6, bob, 44, 30, b);
    lkOV(ctx, -8, bob - 11, 32, 8, jg5_m(b, '#F0E4CC', 0.16));
    lkOV(ctx, 22, bob, 14.4, 20.4, lo);                     /* scapular shield */
    lkOV(ctx, 22, bob, 13.4, 19.4, lite);
    jg5_scutes(ctx, 22, bob, 12, 18, 5, 1.5, jg5_c(b, -0.3));
    lkOV(ctx, -36, bob, 13.6, 19.4, lo);                    /* pelvic shield */
    lkOV(ctx, -36, bob, 12.6, 18.4, lite);
    jg5_scutes(ctx, -36, bob, 11.4, 17, 5, 1.5, jg5_c(b, -0.3));
    ctx.strokeStyle = dk; ctx.lineWidth = 2.2; ctx.beginPath();       /* the movable armour bands */
    for (let k = 0; k <= 8; k++){
      const x = -30 + k * 5.5, nx = (x + 6) / 44, h = 30 * Math.sqrt(Math.max(0.02, 1 - nx * nx)) - 1.4;
      ctx.moveTo(x, bob - h); ctx.quadraticCurveTo(x + 3.6, bob, x, bob + h);
    }
    ctx.stroke();
    ctx.strokeStyle = lite; ctx.lineWidth = 1.2; ctx.beginPath();
    for (let k = 0; k <= 8; k++){
      const x = -27.2 + k * 5.5, nx = (x + 6) / 44, h = 30 * Math.sqrt(Math.max(0.02, 1 - nx * nx)) - 2.6;
      ctx.moveTo(x, bob - h); ctx.quadraticCurveTo(x + 3.6, bob, x, bob + h);
    }
    ctx.stroke();
    ctx.fillStyle = jg5_c(b, -0.32); ctx.beginPath();       /* scute studs along the bands */
    for (let k = 0; k < 8; k++){
      const x = -27 + k * 5.5, nx = (x + 6) / 44, h = 30 * Math.sqrt(Math.max(0.02, 1 - nx * nx)) - 5;
      for (let y = -h; y <= h; y += 6.4){ ctx.moveTo(x + 1.1, bob + y); ctx.arc(x, bob + y, 1.1, 0, TAU); }
    }
    ctx.fill();
    ctx.fillStyle = jg5_c(skin, -0.12);                     /* narrow armoured head */
    ctx.beginPath(); ctx.moveTo(32, bob - 11.4); ctx.lineTo(52.4, bob - 3.4); ctx.lineTo(52.4, bob + 3.4); ctx.lineTo(32, bob + 11.4); ctx.closePath(); ctx.fill();
    ctx.fillStyle = jg5_m(skin, '#F0E4CC', 0.25);
    ctx.beginPath(); ctx.moveTo(33, bob - 9); ctx.lineTo(50, bob - 2.4); ctx.lineTo(50, bob + 2.4); ctx.lineTo(33, bob + 9); ctx.closePath(); ctx.fill();
    jg5_dots(ctx, [38, -5, 38, 5, 43, -3, 43, 3, 47, 0, 38, 0], 0, bob, 1.1, jg5_c(skin, -0.32));
    lkOV(ctx, 34, bob - 11.6, 3.6, 2.6, skinLo, 0.3); lkOV(ctx, 34, bob + 11.6, 3.6, 2.6, skinLo, -0.3);   /* ears */
    fillCircle(ctx, 52, bob, 2.2, '#6A4A40');               /* nose */
    jg5_eye(ctx, 42, bob - 5.2, 1.8, '#FF5A3C'); jg5_eye(ctx, 42, bob + 5.2, 1.8, '#FF5A3C');
  },
  anaconda(ctx, e, b, dk, bob){
    const px = JG5_BOA_X, py = JG5_BOA_Y;
    for (let k = 0; k <= 14; k++){
      px[k] = -84 + k * 8;
      py[k] = bob + Math.sin(k * 0.55 + e.anim * 1.4) * 20 * (1 - k / 18);
    }
    const lo = jg5_c(b, -0.42), hi = jg5_m(b, '#D8E890', 0.26), YEL = '#C9B84A';
    ctx.fillStyle = lo; ctx.beginPath();                    /* thick muscular coils: shaded rim pass ... */
    for (let k = 0; k <= 14; k++){ const r = 6.2 + Math.min(k, 8) * 1.4; ctx.moveTo(px[k] + r, py[k]); ctx.arc(px[k], py[k], r, 0, TAU); }
    ctx.fill();
    ctx.fillStyle = b; ctx.beginPath();                     /* ... then the body itself */
    for (let k = 0; k <= 14; k++){ const r = 5 + Math.min(k, 8) * 1.4; ctx.moveTo(px[k] + r, py[k]); ctx.arc(px[k], py[k], r, 0, TAU); }
    ctx.fill();
    ctx.fillStyle = hi; ctx.beginPath();                    /* glossy back sheen */
    for (let k = 0; k <= 14; k++){ const r = 5 + Math.min(k, 8) * 1.4; jg5_ovp(ctx, px[k], py[k] - r * 0.42, r * 0.7, r * 0.2, 0); }
    ctx.fill();
    ctx.fillStyle = YEL; ctx.beginPath();                   /* big dorsal blotches with yellow edges ... */
    for (let k = 1; k < 14; k += 2){ const r = 5 + Math.min(k, 8) * 1.4; jg5_ovp(ctx, px[k], py[k], 6.4, r * 0.62 + 0.8, 0); }
    ctx.fill();
    ctx.fillStyle = jg5_m(dk, b, 0.28); ctx.beginPath();
    for (let k = 1; k < 14; k += 2){ const r = 5 + Math.min(k, 8) * 1.4; jg5_ovp(ctx, px[k], py[k], 5.5, r * 0.62 - 0.2, 0); }
    ctx.fill();
    ctx.fillStyle = dk; ctx.beginPath();                    /* ... and smaller flank spots in the gaps */
    for (let k = 0; k < 14; k += 2){ const r = 5 + Math.min(k, 8) * 1.4; for (let s = -1; s <= 1; s += 2){ ctx.moveTo(px[k] + 2.2, py[k] + s * r * 0.72); ctx.arc(px[k], py[k] + s * r * 0.72, 2.2, 0, TAU); } }
    ctx.fill();
    ctx.fillStyle = YEL; ctx.beginPath();
    for (let k = 0; k < 14; k += 2){ const r = 5 + Math.min(k, 8) * 1.4; for (let s = -1; s <= 1; s += 2){ ctx.moveTo(px[k] + 0.8, py[k] + s * r * 0.72); ctx.arc(px[k], py[k] + s * r * 0.72, 0.8, 0, TAU); } }
    ctx.fill();
    lkOV(ctx, 34, bob, 19.4, 14.4, lo);                     /* broad wedge of a head */
    lkOV(ctx, 34, bob, 18, 13, b);
    lkOV(ctx, 45, bob, 9.6, 9, b);
    lkOV(ctx, 32, bob - 5, 12, 2.4, hi);
    lkOV(ctx, 30, bob, 8.4, 3.2, dk);                       /* arrow marking on the crown */
    lkTRI(ctx, 36.4, bob - 3, 42, bob, 36.4, bob + 3, dk);
    lkLN(ctx, [37, bob - 9, 44, bob - 11.4], 1.8, dk); lkLN(ctx, [37, bob + 9, 44, bob + 11.4], 1.8, dk);   /* post-ocular stripes */
    fillCircle(ctx, 51.4, bob - 2.6, 0.8, dk); fillCircle(ctx, 51.4, bob + 2.6, 0.8, dk);   /* nostrils */
    jg5_eye(ctx, 40, bob - 7.2, 2.7, '#E8D04A', true); jg5_eye(ctx, 40, bob + 7.2, 2.7, '#E8D04A', true);
    if (Math.sin(e.anim * 5) > 0.4){                        /* forked tongue flicker */
      ctx.strokeStyle = '#C8323A'; ctx.lineWidth = 1.6;
      ctx.beginPath(); ctx.moveTo(53, bob); ctx.lineTo(60, bob); ctx.lineTo(64, bob - 3); ctx.moveTo(60, bob); ctx.lineTo(64, bob + 3); ctx.stroke();
    }
    if (e.state === 'roll') ringPath(ctx, 0, bob, 62, 3, '#8AA83A', 0.4);
  },
  venomqueen(ctx, e, b, dk, bob){
    ringPath(ctx, 0, bob, 56 + Math.sin(e.anim * 3) * 4, 3, '#B8E04A', 0.3);
    softBlob(ctx, 0, bob, 60, '#B8E04A', 0.14);
    const lo = jg5_c(b, -0.38), orange = jg5_m(b, '#E67E14', 0.55), hi = jg5_m(b, '#FFF4B0', 0.5), amber = jg5_m(b, '#D8941A', 0.42);
    const throb = 0.5 + 0.5 * Math.sin(e.anim * 3);
    for (let s = -1; s <= 1; s += 2){                       /* folded back legs with webbed toes, planted front legs */
      lkOV(ctx, -20, bob + s * 22, 16, 10, lo, s * 0.7);
      lkOV(ctx, -20, bob + s * 22, 15, 9, b, s * 0.7);
      lkOV(ctx, -38, bob + s * 33, 10.4, 5.2, lo, s * 0.4);
      lkOV(ctx, -38, bob + s * 33, 9.6, 4.6, b, s * 0.4);
      for (let k = 0; k < 4; k++) fillCircle(ctx, -46.4 - k * 0.2, bob + s * (29.6 + k * 2.6), 2.4, orange);
      lkOV(ctx, 17, bob + s * 26.6, 11.6, 6.6, lo, s * -0.5);
      lkOV(ctx, 17, bob + s * 26.6, 10.6, 5.8, b, s * -0.5);
      for (let k = -1; k <= 1; k++) fillCircle(ctx, 24 + k * 5, bob + s * 33.4, 3.2, orange);
      lkOV(ctx, 8, bob + s * 18, 8, 3.6, amber, s * -0.8);
    }
    lkOV(ctx, 0, bob, 37.6, 31.6, lo);                      /* the big golden body */
    lkOV(ctx, 0, bob, 36, 30, b);
    lkOV(ctx, -4, bob, 24, 18, jg5_m(b, '#E8A810', 0.3));  /* warmer saddle across the back */
    ctx.strokeStyle = amber; ctx.lineWidth = 3; ctx.beginPath();   /* amber flank stripes */
    ctx.arc(0, bob, 31.6, 2.2, 3.4); ctx.stroke();
    ctx.beginPath(); ctx.arc(0, bob, 31.6, -3.4, -2.2); ctx.stroke();
    jg5_dots(ctx, [-16, -8, -10, 11, -22, 3, -4, -2, 6, 14, 4, -13, -26, -10, -28, 10], 0, bob, 2.2, amber);
    lkOV(ctx, -8, bob - 11, 18, 9, 'rgba(255,244,176,0.42)', -0.3);   /* glossy toxic sheen */
    lkOV(ctx, 8, bob + 10, 8, 3.4, 'rgba(255,244,176,0.3)', 0.4);
    lkOV(ctx, 5, bob - 21, 6, 3.4, orange, 0.4); lkOV(ctx, 5, bob + 21, 6, 3.4, orange, -0.4);   /* parotoid glands */
    fillCircle(ctx, 18, bob - 14, 11, lo); fillCircle(ctx, 18, bob + 14, 11, lo);       /* huge bulging eyes */
    fillCircle(ctx, 18, bob - 14, 9.6, orange); fillCircle(ctx, 18, bob + 14, 9.6, orange);
    fillCircle(ctx, 18, bob - 14, 9, '#0A0A0A'); fillCircle(ctx, 18, bob + 14, 9, '#0A0A0A');
    fillCircle(ctx, 20, bob - 16, 2.6, '#FFFFFF'); fillCircle(ctx, 20, bob + 12, 2.6, '#FFFFFF');
    fillCircle(ctx, 15.4, bob - 11.4, 1.2, '#FFFFFF'); fillCircle(ctx, 15.4, bob + 16.6, 1.2, '#FFFFFF');
    fillCircle(ctx, 33, bob - 4, 1.2, dk); fillCircle(ctx, 33, bob + 4, 1.2, dk);    /* nostrils */
    ctx.strokeStyle = dk; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(22, bob, 14, -0.7, 0.7); ctx.stroke();
    ctx.globalAlpha = 0.5 + throb * 0.4;                    /* beads of venom */
    for (let k = 0; k < 6; k++){
      const a = k * TAU / 6 + e.anim * 0.6;
      fillCircle(ctx, Math.cos(a) * 45, bob + Math.sin(a) * 40, 2 + throb * 0.8, '#B8E04A');
    }
    ctx.globalAlpha = 1;
  }
};

/* ---- Chapters 2-4 artwork: real animals of each habitat ----
   Same scheme as chapter 5: each creature keeps its chapter-1 AI, hitbox
   and role, while `look` points here for brand-new artwork. All drawn
   top-down, facing +x, in the enemy's local space. Small shared helpers
   first to keep the fifty-odd drawings compact. */

