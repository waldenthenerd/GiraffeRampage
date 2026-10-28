'use strict';
/* Enemy art, Chapter 4: the open ocean (OCEAN_DRAW). */
/* ======================== Chapter 4: the open ocean ======================== */
/* One shared sea palette keeps the whole chapter in one world: a cool white highlight (OC4_FOAM),
   a deep navy shadow (OC4_ABYSS), a single teal accent for the few glowing things (OC4_TEAL) and an
   amber eye iris. Every body is built from the definition colors b / dk (so hit-flashes still work)
   as: base, shade, highlight, plus a light rim wherever the creature is dark against the deep ground. */
const OC4_ABYSS = '#06141F', OC4_FOAM = '#D6F0FF', OC4_TEAL = '#7FF0DC', OC4_AMBER = '#E8B64A';
function oc4_dk(c, a){ return blendHex(c, OC4_ABYSS, a); }
function oc4_lt(c, a){ return blendHex(c, OC4_FOAM, a); }
/* a round eye: dark socket, colored iris, pupil, one tiny glint */
function oc4_eye(ctx, x, y, r, iris){
  fillCircle(ctx, x, y, r, '#060B10');
  fillCircle(ctx, x + r * 0.12, y, r * 0.68, iris || OC4_AMBER);
  fillCircle(ctx, x + r * 0.22, y, r * 0.34, '#04070A');
  fillCircle(ctx, x + r * 0.42, y - r * 0.34, Math.max(0.35, r * 0.22), '#FFFFFF');
}
/* a stroked ellipse outline (rim light that lifts a dark body off the dark water) */
function oc4_rim(ctx, x, y, rx, ry, c, a, w, rot){
  ctx.globalAlpha = a; ctx.strokeStyle = c; ctx.lineWidth = w;
  ctx.beginPath(); ctx.ellipse(x, y, rx, ry, rot || 0, 0, TAU); ctx.stroke(); ctx.globalAlpha = 1;
}
/* one point of a quadratic curve (used to lay suckers along arms) */
function oc4_q(p0, p1, p2, t){ const u = 1 - t; return u * u * p0 + 2 * u * t * p1 + t * t * p2; }

const OCEAN_DRAW = {
  barracuda(ctx, e, b, dk, bob){
    const sw = Math.sin(e.anim * 3) * 3, fl = Math.sin(e.anim * 4) * 0.9, by = bob + sw * 0.3;
    const back = oc4_dk(b, 0.45), fin = oc4_dk(b, 0.26), lit = oc4_lt(b, 0.5);
    /* forked tail on a slim peduncle, with fine rays */
    lkFork(ctx, -18, bob + sw, 11, 7, fin);
    ctx.strokeStyle = back; ctx.lineWidth = 0.6; ctx.beginPath();
    ctx.moveTo(-18, bob + sw); ctx.lineTo(-26.8, bob + sw - 3.5);
    ctx.moveTo(-18, bob + sw); ctx.lineTo(-26.8, bob + sw + 3.5);
    ctx.stroke();
    lkOV(ctx, -15, bob + sw * 0.6, 5, 1.7, back);
    /* second dorsal + anal fins stick out beside the tail root; pectorals flutter */
    for (let s = -1; s <= 1; s += 2){
      lkTRI(ctx, -8, by + s * 3.8, -15, by + s * 7, -13, by + s * 3.2, fin);
      lkTRI(ctx, 9, by + s * 3.6, 3, by + s * (8 + fl), 6.5, by + s * 3.2, fin);
    }
    /* silver body: light flanks, dark back stripe, bars */
    lkOV(ctx, 0, by, 20, 5.2, b);
    lkOV(ctx, -1, by, 17.5, 2.6, back);
    ctx.strokeStyle = lit; ctx.globalAlpha = 0.8; ctx.lineWidth = 0.9; ctx.beginPath();
    ctx.moveTo(-14, by - 3.7); ctx.lineTo(0, by - 4.3); ctx.lineTo(14, by - 3);
    ctx.moveTo(-14, by + 3.7); ctx.lineTo(0, by + 4.3); ctx.lineTo(14, by + 3);
    ctx.stroke(); ctx.globalAlpha = 1;
    ctx.strokeStyle = dk; ctx.globalAlpha = 0.6; ctx.lineWidth = 1; ctx.beginPath();
    for (let k = -3; k <= 2; k++){ const x = k * 5; ctx.moveTo(x - 1.6, by - 2.6); ctx.lineTo(x + 0.6, by); ctx.lineTo(x - 1.6, by + 2.6); }
    ctx.stroke(); ctx.globalAlpha = 1;
    lkTRI(ctx, -12, by - 1.2, 2, by, -12, by + 1.2, fin);        /* first dorsal ridge */
    /* pike head: pointed snout, jutting lower jaw, needle teeth */
    lkTRI(ctx, 15, bob - 3.4, 27.5, bob - 0.3, 15, bob + 3.4, b);
    lkTRI(ctx, 16, bob - 1.7, 25, bob, 16, bob + 1.7, back);
    lkLN(ctx, [17, bob + 0.9, 28.5, bob + 1.3], 1.1, lit);
    ctx.fillStyle = '#F4F8FA'; ctx.beginPath();
    for (let k = 0; k < 4; k++){ const x = 20 + k * 2.3; ctx.moveTo(x, bob + 1.1); ctx.lineTo(x + 0.7, bob + 1.2); ctx.lineTo(x + 0.2, bob + 2.5); }
    ctx.fill();
    lkCV(ctx, 13.2, bob - 4.2, 15.8, bob, 13.2, bob + 4.2, 0.9, dk);   /* gill cover */
    oc4_eye(ctx, 18, bob - 2.5, 1.5, '#F0D060'); oc4_eye(ctx, 18, bob + 2.5, 1.5, '#F0D060');
  },
  sailfish(ctx, e, b, dk, bob, wind, d){
    if (wind) ringPath(ctx, 0, bob, 24, 2.5, '#FFFFFF', 0.7);
    const sail = e.state === 'dash' ? 0.3 : 1;                 /* the great sail folds flat when it sprints */
    const pale = d.pale || '#6FB8E8', sw = Math.sin(e.anim * 3.2) * 2.5;
    const back = oc4_dk(b, 0.5), flank = oc4_lt(b, 0.28), belly = oc4_lt(b, 0.55), fin = oc4_lt(b, 0.1);
    /* the sail: a webbed membrane with spines and dark spots */
    ctx.globalAlpha = 0.8; ctx.fillStyle = pale; ctx.beginPath(); ctx.moveTo(10, bob);
    for (let k = 0; k <= 6; k++) ctx.lineTo(10 - k * 4, bob - (8 + Math.sin(k * 1.3) * 3) * sail - 2);
    ctx.lineTo(-16, bob); ctx.closePath(); ctx.fill(); ctx.globalAlpha = 1;
    ctx.strokeStyle = oc4_dk(b, 0.1); ctx.lineWidth = 0.7; ctx.globalAlpha = 0.7; ctx.beginPath();
    for (let k = 0; k <= 6; k++){ ctx.moveTo(10 - k * 4, bob); ctx.lineTo(10 - k * 4, bob - (8 + Math.sin(k * 1.3) * 3) * sail - 2); }
    ctx.stroke(); ctx.globalAlpha = 1;
    ctx.fillStyle = back; ctx.beginPath();
    for (let k = 0; k < 4; k++){ const x = 6 - k * 5, y = bob - 5 * sail - 1; ctx.moveTo(x + 1, y); ctx.arc(x, y, 1, 0, TAU); }
    for (let k = 0; k < 3; k++){ const x = 3.5 - k * 5, y = bob - 2.4 * sail; ctx.moveTo(x + 0.8, y); ctx.arc(x, y, 0.8, 0, TAU); }
    ctx.fill();
    /* lunate tail with a keel */
    lkFork(ctx, -16, bob + sw, 11, 8.5, fin);
    lkLN(ctx, [-16, bob + sw, -25.5, bob + sw - 4, -16, bob + sw, -25.5, bob + sw + 4], 0.6, back);
    lkOV(ctx, -13.5, bob + sw * 0.5, 4.5, 1.6, back);
    /* long swept pectorals */
    for (let s = -1; s <= 1; s += 2){
      lkTRI(ctx, 6, bob + s * 3.8, -8, bob + s * (13 + sw * 0.2), 0, bob + s * 4.4, fin);
      lkLN(ctx, [3, bob + s * 3, -4, bob + s * 8.5], 0.6, back);
    }
    /* body: dark back, silver flanks, pale bars */
    lkOV(ctx, 0, bob, 17, 4.8, belly);
    lkOV(ctx, 0, bob, 17, 4.2, flank);
    lkOV(ctx, -1, bob, 15, 2.6, back);
    ctx.strokeStyle = pale; ctx.globalAlpha = 0.5; ctx.lineWidth = 0.9; ctx.beginPath();
    for (let k = 0; k < 6; k++){ const x = -10 + k * 4; ctx.moveTo(x, bob - 3.4); ctx.lineTo(x - 0.6, bob - 1.4); ctx.moveTo(x, bob + 3.4); ctx.lineTo(x - 0.6, bob + 1.4); }
    ctx.stroke(); ctx.globalAlpha = 1;
    /* head, gill cover, spear bill (pale edge and dark ridge) */
    lkOV(ctx, 13, bob, 5, 3.4, flank);
    lkTRI(ctx, 15, bob - 2, 34, bob, 15, bob + 2, oc4_dk(b, 0.2));
    lkLN(ctx, [16, bob, 33, bob], 0.8, belly);
    lkCV(ctx, 10.6, bob - 3.6, 12.4, bob, 10.6, bob + 3.6, 0.8, back);
    oc4_eye(ctx, 13.3, bob - 2.8, 1.6); oc4_eye(ctx, 13.3, bob + 2.8, 1.6);
  },
  hammerhead(ctx, e, b, dk, bob, wind){
    if (wind) ringPath(ctx, 0, bob, 32, 4, '#FF6A4A', 0.6);
    const sw = Math.sin(e.anim * 2) * 5, fl = Math.sin(e.anim * 2.2) * 1.4;
    const back = oc4_dk(b, 0.38), tip = oc4_dk(b, 0.6), lit = oc4_lt(b, 0.5), mid = oc4_lt(b, 0.14);
    /* heterocercal tail: tall upper lobe, short lower lobe, dark trailing edge */
    lkTRI(ctx, -24, bob + sw * 0.6, -42, bob + sw - 12, -30, bob + sw, b);
    lkTRI(ctx, -24, bob + sw * 0.6, -38, bob + sw + 6, -30, bob + sw, b);
    lkTRI(ctx, -26, bob + sw * 0.6 - 0.6, -40, bob + sw - 10.5, -31, bob + sw - 0.6, back);
    lkLN(ctx, [-42, bob + sw - 12, -30, bob + sw, -38, bob + sw + 6], 1.2, tip);
    lkOV(ctx, -22, bob + sw * 0.4, 6, 2.6, b);
    /* pelvic, anal and pectoral fins */
    for (let s = -1; s <= 1; s += 2){
      lkTRI(ctx, -12, bob + s * 6, -21, bob + s * 13, -17, bob + s * 5.5, mid);
      lkTRI(ctx, -19, bob + s * 3.5, -26, bob + s * 7.5, -24, bob + s * 3, mid);
      lkTRI(ctx, 5, bob + s * 7, -9, bob + s * (22 + fl), -3, bob + s * 7, b);
      lkTRI(ctx, -2, bob + s * 14.5, -9, bob + s * (22 + fl), -6, bob + s * 14.5, tip);
      lkLN(ctx, [4, bob + s * 8, -6, bob + s * 18], 0.7, back);
    }
    /* body: pale rim, gray flank, dark back */
    lkOV(ctx, -2, bob, 28.5, 10.4, lit);
    lkOV(ctx, -2, bob, 28, 9.2, b);
    lkOV(ctx, -3, bob, 24, 5.2, back);
    lkTRI(ctx, -12, bob - 3.2, 9, bob, -12, bob + 3.2, tip);    /* first dorsal fin */
    lkLN(ctx, [-9, bob, 8, bob], 0.8, mid);
    lkTRI(ctx, -19, bob - 1.5, -14, bob, -19, bob + 1.5, tip);
    /* gill slits */
    ctx.strokeStyle = tip; ctx.lineWidth = 1; ctx.lineCap = 'round'; ctx.beginPath();
    for (let s = -1; s <= 1; s += 2) for (let k = 0; k < 5; k++){ const x = 18 - k * 3; ctx.moveTo(x, bob + s * 6.4); ctx.lineTo(x - 0.8, bob + s * 9.2); }
    ctx.stroke(); ctx.lineCap = 'butt';
    /* the hammer: pale leading edge, nostril slits, eyes on the tips */
    lkOV(ctx, 19, bob, 7, 6.4, b);
    lkOV(ctx, 28, bob, 5.6, 19.6, lit);
    lkOV(ctx, 27.4, bob, 5.4, 18.6, b);
    ctx.globalAlpha = 0.45; lkOV(ctx, 26.2, bob, 2.6, 10, back); ctx.globalAlpha = 1;
    ctx.strokeStyle = tip; ctx.lineWidth = 0.9; ctx.beginPath();
    for (let s = -1; s <= 1; s += 2){ ctx.moveTo(31.2, bob + s * 11); ctx.lineTo(29.4, bob + s * 12.6); ctx.moveTo(31.6, bob + s * 4); ctx.lineTo(30, bob + s * 5.4); }
    ctx.stroke();
    oc4_eye(ctx, 28.4, bob - 18, 1.9); oc4_eye(ctx, 28.4, bob + 18, 1.9);
  },
  jellyfish(ctx, e, b, dk, bob){
    const pulse = 1 + Math.sin(e.anim * 3) * 0.08, hi = oc4_lt(b, 0.5), core = oc4_lt(b, 0.78);
    /* trailing stinging tentacles, thin and wavering */
    ctx.strokeStyle = b; ctx.lineWidth = 1; ctx.globalAlpha = 0.7; ctx.beginPath();
    for (let k = 0; k < 10; k++){
      const a = Math.PI * 0.6 + k / 9 * Math.PI * 0.8, x0 = Math.cos(a) * 10, y0 = Math.sin(a) * 10;
      ctx.moveTo(x0, bob + y0);
      ctx.quadraticCurveTo(x0 - 12, bob + y0 + Math.sin(e.anim * 2 + k) * 5, x0 - 24 - (k % 3) * 3, bob + y0 * 1.25 + Math.sin(e.anim * 2 + k + 1) * 5);
    }
    ctx.stroke();
    /* four frilly oral arms, thicker and brighter */
    ctx.strokeStyle = hi; ctx.lineWidth = 2.4; ctx.globalAlpha = 0.85; ctx.lineCap = 'round'; ctx.beginPath();
    for (let j = 0; j < 4; j++){
      const o = (j - 1.5) * 3;
      ctx.moveTo(-3, bob + o * 0.7);
      ctx.quadraticCurveTo(-10, bob + o + Math.sin(e.anim * 2.2 + j * 1.7) * 3.5, -19, bob + o * 1.3 + Math.sin(e.anim * 2 + j) * 4);
    }
    ctx.stroke(); ctx.lineCap = 'butt'; ctx.globalAlpha = 1;
    /* the bell: soft halo, body, scalloped margin, inner dome */
    ctx.globalAlpha = 0.62; fillCircle(ctx, 0, bob, 13 * pulse, b);
    ctx.globalAlpha = 0.8; ctx.fillStyle = b; ctx.beginPath();
    for (let k = 0; k < 12; k++){ const a = k / 12 * TAU, px = Math.cos(a) * 13 * pulse, py = bob + Math.sin(a) * 13 * pulse; ctx.moveTo(px + 2, py); ctx.arc(px, py, 2, 0, TAU); }
    ctx.fill();
    ctx.globalAlpha = 0.45; fillCircle(ctx, 0, bob, 8.6 * pulse, hi); ctx.globalAlpha = 1;
    oc4_rim(ctx, 0, bob, 12.6 * pulse, 12.6 * pulse, hi, 0.75, 1);
    ctx.strokeStyle = dk; ctx.lineWidth = 0.9; ctx.globalAlpha = 0.8; ctx.beginPath();  /* radial canals */
    for (let k = 0; k < 8; k++){ const a = k / 8 * TAU + 0.2; ctx.moveTo(0, bob); ctx.lineTo(Math.cos(a) * 11.5 * pulse, bob + Math.sin(a) * 11.5 * pulse); }
    ctx.stroke(); ctx.globalAlpha = 1;
    for (let k = 0; k < 4; k++){                               /* the clover of gonads */
      const a = k / 4 * TAU + 0.78;
      ctx.globalAlpha = 0.6; lkOV(ctx, Math.cos(a) * 5, bob + Math.sin(a) * 5, 3.2, 2, dk, a); ctx.globalAlpha = 1;
    }
    fillCircle(ctx, 0, bob, 3, core);
    ctx.globalAlpha = 0.55; lkOV(ctx, -3.5, bob - 6.4, 3.4, 1.4, '#FFFFFF', -0.7); ctx.globalAlpha = 1;
  },
  jellylet(ctx, e, b, dk, bob){
    const pulse = 1 + Math.sin(e.anim * 3) * 0.1, hi = oc4_lt(b, 0.5);
    for (let k = 0; k < 5; k++) lkCV(ctx, -3, bob + (k - 2) * 1.6, -8, bob + (k - 2) * 2.6 + Math.sin(e.anim * 3 + k) * 2, -14, bob + (k - 2) * 3.2 + Math.sin(e.anim * 3 + k + 1.2) * 2, 0.9, b);
    ctx.globalAlpha = 0.35; fillCircle(ctx, 0, bob, 7.4 * pulse, b);
    ctx.globalAlpha = 0.7; fillCircle(ctx, 0, bob, 6 * pulse, b);
    ctx.fillStyle = b; ctx.beginPath();
    for (let k = 0; k < 8; k++){ const a = k / 8 * TAU, px = Math.cos(a) * 6 * pulse, py = bob + Math.sin(a) * 6 * pulse; ctx.moveTo(px + 1.3, py); ctx.arc(px, py, 1.3, 0, TAU); }
    ctx.fill();
    ctx.globalAlpha = 0.5; fillCircle(ctx, -0.6, bob - 0.6, 3.6 * pulse, hi); ctx.globalAlpha = 1;
    oc4_rim(ctx, 0, bob, 5.6 * pulse, 5.6 * pulse, hi, 0.7, 0.8);
    ctx.strokeStyle = dk; ctx.lineWidth = 0.6; ctx.globalAlpha = 0.7; ctx.beginPath();
    for (let k = 0; k < 4; k++){ const a = k / 4 * TAU + 0.4; ctx.moveTo(0, bob); ctx.lineTo(Math.cos(a) * 5 * pulse, bob + Math.sin(a) * 5 * pulse); }
    ctx.stroke(); ctx.globalAlpha = 1;
    fillCircle(ctx, 0, bob, 1.9, dk);
    fillCircle(ctx, -0.4, bob - 0.4, 0.8, '#FFFFFF');
  },
  pelican(ctx, e, b, dk, bob, wind, d){
    const flap = Math.sin(e.anim * 1.3) * 0.35, pale = d.pale || '#F2A83A';
    const shd = oc4_dk(b, 0.2), shd2 = oc4_dk(b, 0.34), quill = oc4_lt(dk, 0.16);
    const billc = blendHex(pale, '#E8A83A', 0.5), pouch = oc4_lt(pale, 0.35);
    /* broad wings: coverts, flight feathers, dark primaries */
    for (let s = -1; s <= 1; s += 2){
      ctx.save(); ctx.rotate(s * flap);
      lkOV(ctx, -3, s * 17, 17, 6.4, b, s * 0.28);
      lkOV(ctx, -5, s * 19.4, 14, 3.4, shd, s * 0.28);
      ctx.strokeStyle = shd2; ctx.lineWidth = 0.8; ctx.lineCap = 'round'; ctx.beginPath();
      ctx.moveTo(9, s * 14); ctx.quadraticCurveTo(-1, s * 12.4, -13, s * 15.2);
      for (let k = 0; k < 4; k++){ const x = -2 - k * 4; ctx.moveTo(x, s * (19.6 + k * 0.4)); ctx.lineTo(x - 3.4, s * (22.4 + k * 0.5)); }
      ctx.stroke(); ctx.lineCap = 'butt';
      for (let j = 0; j < 4; j++) lkOV(ctx, -12.5 - j * 1.8, s * (20.4 + j * 1.7), 5.2 - j * 0.3, 1.1, quill, s * (0.28 + 0.12 * j));
      ctx.restore();
    }
    /* webbed feet and tail trail behind */
    for (let s = -1; s <= 1; s += 2){
      lkTRI(ctx, -10, bob + s * 2.2, -18, bob + s * 5, -14, bob + s * 0.8, billc);
      lkOV(ctx, -14.5, bob + s * 1.6, 5, 1.5, shd, s * 0.25);
    }
    lkOV(ctx, -14, bob, 5.5, 1.6, shd2);
    /* body, mantle, head, crest */
    lkOV(ctx, -2, bob, 11, 7, b);
    lkOV(ctx, -4, bob, 8, 3.6, shd);
    lkOV(ctx, 3, bob - 1.5, 5, 2.2, oc4_lt(b, 0.5), -0.2);
    lkOV(ctx, 8, bob, 4, 3.2, shd);                            /* neck */
    lkOV(ctx, 10.5, bob, 5, 4.6, b);
    lkOV(ctx, 7.6, bob, 2.6, 4.2, oc4_dk(b, 0.1));
    lkTRI(ctx, 8, bob - 3.6, 4, bob - 4.4, 6.4, bob - 1.6, shd);   /* crest tufts */
    lkTRI(ctx, 8, bob + 3.6, 4, bob + 4.4, 6.4, bob + 1.6, shd);
    /* the throat pouch swells either side of the long bill */
    lkOV(ctx, 22, bob, 10.5, 4.6, pouch);
    lkLN(ctx, [14, bob - 3.4, 30, bob - 3.2], 0.7, billc);
    lkLN(ctx, [14, bob + 3.4, 30, bob + 3.2], 0.7, billc);
    lkTRI(ctx, 13, bob - 2.1, 34, bob, 13, bob + 2.1, billc);
    lkLN(ctx, [14, bob, 32, bob], 0.7, oc4_dk(billc, 0.3));
    lkTRI(ctx, 31.2, bob - 0.9, 35, bob + 0.2, 31.2, bob + 0.9, '#B8482A');   /* hooked nail */
    oc4_eye(ctx, 11.6, bob - 2.8, 1.25, '#F2E6B0'); oc4_eye(ctx, 11.6, bob + 2.8, 1.25, '#F2E6B0');
  },
  dolphin(ctx, e, b, dk, bob){
    const sw = Math.sin(e.anim * 3) * 4, fl = Math.sin(e.anim * 2.5) * 1.2;
    const back = oc4_dk(b, 0.34), belly = oc4_lt(b, 0.52), mid = oc4_lt(b, 0.14), tip = oc4_dk(b, 0.55);
    /* tail stock and horizontal flukes (with a trailing notch) */
    lkOV(ctx, -13, bob + sw * 0.6, 7, 2.4, b);
    for (let s = -1; s <= 1; s += 2){
      lkTRI(ctx, -16, bob + sw, -23, bob + sw + s * 9.4, -27, bob + sw + s * 5.4, b);
      lkTRI(ctx, -21.4, bob + sw + s * 6.4, -23, bob + sw + s * 9.4, -25.6, bob + sw + s * 4.6, tip);
    }
    lkTRI(ctx, -24, bob + sw, -28, bob + sw - 2, -28, bob + sw + 2, tip);
    /* flippers */
    for (let s = -1; s <= 1; s += 2){
      lkTRI(ctx, 7, bob + s * 5, -3, bob + s * (13 + fl), 1, bob + s * 4.6, b);
      lkTRI(ctx, -1.4, bob + s * 9.6, -3, bob + s * (13 + fl), 0.2, bob + s * 8, tip);
    }
    /* body: pale belly rim, gray flank, dark cape */
    lkOV(ctx, -1, bob + sw * 0.2, 17.4, 6.7, belly);
    lkOV(ctx, -1, bob + sw * 0.2, 17, 5.9, mid);
    lkOV(ctx, -2, bob + sw * 0.1, 14.5, 3.7, back);
    lkOV(ctx, -3, bob, 12, 2.2, tip);
    ctx.strokeStyle = tip; ctx.globalAlpha = 0.6; ctx.lineWidth = 0.7; ctx.beginPath();  /* scratches and tail-stock ridges */
    ctx.moveTo(-6, bob + 4.4); ctx.lineTo(-3, bob + 5.2); ctx.moveTo(-1, bob - 5); ctx.lineTo(2, bob - 4.2);
    ctx.stroke(); ctx.globalAlpha = 1;
    lkTRI(ctx, -8, bob - 2, 3, bob, -8, bob + 2, tip);          /* falcate dorsal fin */
    lkLN(ctx, [-6, bob, 2, bob], 0.7, mid);
    /* melon, beak with a mouth line, blowhole, eyes */
    lkOV(ctx, 14, bob, 4.4, 3.8, mid);
    lkOV(ctx, 19.6, bob, 5.2, 2.2, b);
    lkLN(ctx, [15, bob + 1.2, 24, bob + 0.5], 0.6, tip);
    lkLN(ctx, [15, bob - 1.2, 24, bob - 0.5], 0.6, tip);
    fillCircle(ctx, 9.6, bob, 1, '#0A1218');
    oc4_eye(ctx, 14.4, bob - 4.1, 1.25, '#C99A3A'); oc4_eye(ctx, 14.4, bob + 4.1, 1.25, '#C99A3A');
  },
  swordfish(ctx, e, b, dk, bob, wind, d){
    if (wind) ringPath(ctx, 0, bob, 25, 3, '#FF9C6A', 0.6);
    const sw = Math.sin(e.anim * 2.6) * 4, pale = d.pale || '#C8D0D8';
    const lit = oc4_lt(b, 0.5), mid = oc4_lt(b, 0.22), back = oc4_dk(b, 0.45), fin = oc4_lt(b, 0.12);
    /* crescent tail with rays and a keel */
    lkFork(ctx, -18, bob + sw, 12, 10, fin);
    lkLN(ctx, [-18, bob + sw, -28.4, bob + sw - 5, -18, bob + sw, -28.4, bob + sw + 5], 0.7, back);
    lkOV(ctx, -15, bob + sw * 0.6, 5, 1.8, back);
    for (let s = -1; s <= 1; s += 2){
      lkTRI(ctx, 4, bob + s * 5, -8, bob + s * 14, -2, bob + s * 5, fin);
      lkLN(ctx, [3, bob + s * 6, -4, bob + s * 11], 0.7, back);
      lkTRI(ctx, -10, bob + s * 3.2, -16, bob + s * 6.4, -14, bob + s * 3, fin);
    }
    /* body: pale rim, lightened blue flank, dark back, silvery lateral lines */
    lkOV(ctx, -1, bob, 20.4, 7.4, lit);
    lkOV(ctx, -1, bob, 20, 6.6, mid);
    lkOV(ctx, -2, bob, 17, 3.8, b);
    lkOV(ctx, -3, bob, 14, 1.8, back);
    lkLN(ctx, [-12, bob - 4.6, 0, bob - 5, 13, bob - 3.8], 1, pale);
    lkLN(ctx, [-12, bob + 4.6, 0, bob + 5, 13, bob + 3.8], 1, pale);
    lkTRI(ctx, -10, bob - 1.8, 10, bob, -10, bob + 1.8, back);   /* dorsal ridge */
    /* head, gill cover, the flat sword with a ridge */
    lkOV(ctx, 16.6, bob, 4, 3, mid);
    lkCV(ctx, 11.6, bob - 5, 13.8, bob, 11.6, bob + 5, 0.9, back);
    lkTRI(ctx, 17, bob - 2.2, 44, bob, 17, bob + 2.2, pale);
    lkTRI(ctx, 17, bob - 0.9, 42, bob, 17, bob + 0.9, oc4_dk(pale, 0.3));
    oc4_eye(ctx, 15.2, bob - 3.8, 2.2); oc4_eye(ctx, 15.2, bob + 3.8, 2.2);
  },
  octopus(ctx, e, b, dk, bob){
    const arm = oc4_dk(b, 0.22), tipc = oc4_lt(b, 0.18), suck = oc4_lt(b, 0.62), mot = oc4_dk(b, 0.34), hi = oc4_lt(b, 0.3);
    fillCircle(ctx, 0, bob, 8.5, arm);                         /* the web between the arms */
    ctx.lineCap = 'round';
    ctx.strokeStyle = tipc; ctx.lineWidth = 2.2; ctx.beginPath();
    for (let k = 0; k < 8; k++){                               /* eight curling arms, thin tips */
      const a = k / 8 * TAU + 0.2, w = Math.sin(e.anim * 2 + k) * 0.5;
      ctx.moveTo(Math.cos(a) * 5, bob + Math.sin(a) * 5);
      ctx.quadraticCurveTo(Math.cos(a + w) * 14, bob + Math.sin(a + w) * 14, Math.cos(a - w * 1.4) * 21, bob + Math.sin(a - w * 1.4) * 21);
    }
    ctx.stroke();
    ctx.strokeStyle = b; ctx.lineWidth = 3.8; ctx.beginPath();  /* thick roots over the thin tips */
    for (let k = 0; k < 8; k++){
      const a = k / 8 * TAU + 0.2, w = Math.sin(e.anim * 2 + k) * 0.5;
      const x0 = Math.cos(a) * 5, y0 = bob + Math.sin(a) * 5, cx = Math.cos(a + w) * 14, cy = bob + Math.sin(a + w) * 14;
      const ex = Math.cos(a - w * 1.4) * 21, ey = bob + Math.sin(a - w * 1.4) * 21;
      ctx.moveTo(x0, y0); ctx.quadraticCurveTo((x0 + cx) / 2, (y0 + cy) / 2, (x0 + 2 * cx + ex) / 4, (y0 + 2 * cy + ey) / 4);
    }
    ctx.stroke(); ctx.lineCap = 'butt';
    ctx.fillStyle = suck; ctx.globalAlpha = 0.85; ctx.beginPath();  /* sucker rows */
    for (let k = 0; k < 8; k++){
      const a = k / 8 * TAU + 0.2, w = Math.sin(e.anim * 2 + k) * 0.5;
      const x0 = Math.cos(a) * 5, y0 = bob + Math.sin(a) * 5, cx = Math.cos(a + w) * 14, cy = bob + Math.sin(a + w) * 14;
      const ex = Math.cos(a - w * 1.4) * 21, ey = bob + Math.sin(a - w * 1.4) * 21;
      for (let j = 0; j < 4; j++){
        const t = 0.3 + j * 0.2, px = oc4_q(x0, cx, ex, t), py = oc4_q(y0, cy, ey, t), r = 0.95 - j * 0.14;
        ctx.moveTo(px + r, py); ctx.arc(px, py, r, 0, TAU);
      }
    }
    ctx.fill(); ctx.globalAlpha = 1;
    /* mantle with mottling and a sheen */
    lkOV(ctx, -4, bob, 11.6, 9.6, hi);
    lkOV(ctx, -4, bob, 11, 9, b);
    lkOV(ctx, -6, bob, 7, 5, mot);
    ctx.fillStyle = mot; ctx.globalAlpha = 0.9; ctx.beginPath();
    const sp = [[-8, -3, 1.4], [-4, 3, 1.3], [-10, 2.4, 1.2], [-2, -2.4, 1.1], [-12, -1, 0.9], [-7, 5, 1], [-6, -6, 1.1]];
    for (let i = 0; i < sp.length; i++){ ctx.moveTo(sp[i][0] + sp[i][2], bob + sp[i][1]); ctx.arc(sp[i][0], bob + sp[i][1], sp[i][2], 0, TAU); }
    ctx.fill(); ctx.globalAlpha = 1;
    ctx.globalAlpha = 0.6; lkOV(ctx, -3, bob - 4.8, 5, 1.6, '#FFFFFF', -0.2); ctx.globalAlpha = 1;
    /* bulging eyes with a horizontal pupil and a brow ridge */
    for (let s = -1; s <= 1; s += 2){
      lkOV(ctx, 4, bob + s * 4.6, 3.6, 3.1, arm);
      fillCircle(ctx, 4.2, bob + s * 4.6, 2.5, '#F2E0A0');
      lkOV(ctx, 4.8, bob + s * 4.6, 0.8, 2.1, '#0A0A0A');
      fillCircle(ctx, 3.6, bob + s * 4.6 - 0.8, 0.6, '#FFFFFF');
      lkLN(ctx, [1.6, bob + s * 7, 5.6, bob + s * 7.6], 0.8, dk);
    }
  },
  crab(ctx, e, b, dk, bob, wind, d){
    const pale = d.pale || '#F2D8C8', leg = oc4_dk(b, 0.28), hi = oc4_lt(b, 0.3), knee = oc4_lt(b, 0.45);
    const snap = Math.sin(e.anim * 4);
    ctx.lineCap = 'round';
    ctx.strokeStyle = leg; ctx.lineWidth = 3.4; ctx.beginPath();   /* jointed walking legs: shadow pass */
    for (let s = -1; s <= 1; s += 2) for (let k = 0; k < 4; k++){
      const x = -6 + k * 4, st = Math.sin(e.anim * 6 + k) * 2;
      ctx.moveTo(x, bob + s * 8); ctx.lineTo(x - 3 + st, bob + s * 15); ctx.lineTo(x - 7 + st, bob + s * 20);
    }
    ctx.stroke();
    ctx.strokeStyle = b; ctx.lineWidth = 2.1; ctx.beginPath();     /* lit pass */
    for (let s = -1; s <= 1; s += 2) for (let k = 0; k < 4; k++){
      const x = -6 + k * 4, st = Math.sin(e.anim * 6 + k) * 2;
      ctx.moveTo(x, bob + s * 8); ctx.lineTo(x - 3 + st, bob + s * 15); ctx.lineTo(x - 7 + st, bob + s * 20);
    }
    ctx.stroke();
    ctx.fillStyle = knee; ctx.beginPath();                         /* knee joints and pointed feet */
    for (let s = -1; s <= 1; s += 2) for (let k = 0; k < 4; k++){
      const x = -6 + k * 4, st = Math.sin(e.anim * 6 + k) * 2;
      ctx.moveTo(x - 3 + st + 1.2, bob + s * 15); ctx.arc(x - 3 + st, bob + s * 15, 1.2, 0, TAU);
      ctx.moveTo(x - 7 + st + 0.8, bob + s * 20); ctx.arc(x - 7 + st, bob + s * 20, 0.8, 0, TAU);
    }
    ctx.fill();
    /* the big claws: jointed arm, armored palm, open serrated pincers that snap */
    for (let s = -1; s <= 1; s += 2){
      const sn = snap * 1.4 * s;
      ctx.strokeStyle = leg; ctx.lineWidth = 3.6;
      ctx.beginPath(); ctx.moveTo(6, bob + s * 7); ctx.lineTo(10, bob + s * 12); ctx.lineTo(14, bob + s * 11.6); ctx.stroke();
      ctx.strokeStyle = b; ctx.lineWidth = 2.4;
      ctx.beginPath(); ctx.moveTo(6, bob + s * 7); ctx.lineTo(10, bob + s * 12); ctx.lineTo(14, bob + s * 11.6); ctx.stroke();
      fillCircle(ctx, 10, bob + s * 12, 1.3, knee);
      lkOV(ctx, 19, bob + s * 11.6, 7, 4.9, hi, s * 0.3);
      lkOV(ctx, 19, bob + s * 11.6, 6.4, 4.3, b, s * 0.3);
      lkOV(ctx, 17.6, bob + s * 11.2, 3.2, 1.7, hi, s * 0.3);
      lkTRI(ctx, 22, bob + s * 9.6, 30, bob + s * (8.4 + sn * 0.3), 22, bob + s * 12, pale);
      lkTRI(ctx, 22, bob + s * 12, 30, bob + s * (15.2 + sn), 22, bob + s * 14.6, pale);
      lkTRI(ctx, 26.6, bob + s * (9.1 + sn * 0.15), 30, bob + s * (8.4 + sn * 0.3), 27, bob + s * 10.2, dk);
      lkTRI(ctx, 26.6, bob + s * (13.6 + sn * 0.5), 30, bob + s * (15.2 + sn), 26.2, bob + s * 14.4, dk);
    }
    ctx.lineCap = 'butt';
    /* carapace: spiny rim, domed shell, grooves, tubercles, abdomen flap */
    lkOV(ctx, -12, bob, 3.2, 3.6, leg);
    ctx.fillStyle = hi; ctx.beginPath();
    for (let s = -1; s <= 1; s += 2) for (let k = 0; k < 5; k++){
      const a = -0.5 + k * 0.62, px = Math.cos(a) * 11.4, py = Math.sin(a) * 11.2 * s;
      ctx.moveTo(px - 1.2, py - 1.2); ctx.lineTo(px + Math.cos(a) * 3.4, py + Math.sin(a) * 3.4 * s); ctx.lineTo(px + 1.2, py + 1.2);
    }
    ctx.fill();
    lkOV(ctx, 0, bob, 12.6, 11.6, hi);
    lkOV(ctx, 0, bob, 12, 11, b);
    lkOV(ctx, -1, bob, 8, 7, hi); ctx.globalAlpha = 0.35; lkOV(ctx, -1, bob, 8, 7, b); ctx.globalAlpha = 1;
    ctx.strokeStyle = dk; ctx.globalAlpha = 0.55; ctx.lineWidth = 0.9; ctx.beginPath();
    ctx.moveTo(4, bob - 8); ctx.quadraticCurveTo(7, bob, 4, bob + 8);
    ctx.moveTo(-6, bob - 7); ctx.quadraticCurveTo(-3, bob, -6, bob + 7);
    ctx.stroke(); ctx.globalAlpha = 1;
    ctx.fillStyle = dk; ctx.beginPath();
    for (let k = 0; k < 10; k++){ const a = k * 2.4, px = Math.cos(a) * 7, py = bob + Math.sin(a) * 6; ctx.moveTo(px + 1, py); ctx.arc(px, py, 1, 0, TAU); }
    ctx.fill();
    ctx.fillStyle = knee; ctx.beginPath();
    for (let k = 0; k < 5; k++){ const a = k * 2.4 + 1.1, px = Math.cos(a) * 4.5, py = bob + Math.sin(a) * 4; ctx.moveTo(px + 0.7, py); ctx.arc(px, py, 0.7, 0, TAU); }
    ctx.fill();
    /* eyes on short stalks */
    for (let s = -1; s <= 1; s += 2){
      lkLN(ctx, [10, bob + s * 2.2, 13, bob + s * 3.4], 1.2, leg);
      oc4_eye(ctx, 13.4, bob + s * 3.5, 1.5);
    }
  },
  seasnake(ctx, e, b, dk, bob){
    const N = 15, ph = e.anim * 3, band = oc4_lt(dk, 0.2), shd = oc4_dk(b, 0.18);
    /* a smooth body of overlapping discs; bands are laid across the body's own direction */
    let y0 = 0, yEnd = 0, xEnd = 0;
    for (let i = 0; i < N; i++){
      const t = i / (N - 1), x = -24 + 30 * t, y = bob + Math.sin(i * 0.54 + ph) * 4.4 * (1 - t * 0.6), r = 1.9 + 2.3 * t;
      fillCircle(ctx, x, y, r, b);
      if (i === 0) y0 = y;
      if (i === N - 1){ xEnd = x; yEnd = y; }
    }
    ctx.strokeStyle = shd; ctx.globalAlpha = 0.55; ctx.lineWidth = 1; ctx.beginPath();   /* a faint spine for form */
    for (let i = 0; i < N; i++){
      const t = i / (N - 1), x = -24 + 30 * t, y = bob + Math.sin(i * 0.54 + ph) * 4.4 * (1 - t * 0.6);
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke(); ctx.globalAlpha = 1;
    ctx.strokeStyle = band; ctx.lineWidth = 2.5; ctx.beginPath();
    for (let i = 1; i < N - 1; i += 3){
      const t = i / (N - 1), t0 = (i - 1) / (N - 1), t1 = (i + 1) / (N - 1);
      const x = -24 + 30 * t, y = bob + Math.sin(i * 0.54 + ph) * 4.4 * (1 - t * 0.6), r = 1.9 + 2.3 * t;
      const dx = (-24 + 30 * t1) - (-24 + 30 * t0), dy = (bob + Math.sin((i + 1) * 0.54 + ph) * 4.4 * (1 - t1 * 0.6)) - (bob + Math.sin((i - 1) * 0.54 + ph) * 4.4 * (1 - t0 * 0.6));
      const l = Math.hypot(dx, dy) || 1, nx = -dy / l * r * 1.02, ny = dx / l * r * 1.02;
      ctx.moveTo(x - nx, y - ny); ctx.lineTo(x + nx, y + ny);
    }
    ctx.stroke();
    /* paddle-flattened tail with a dark edge */
    lkOV(ctx, -26.4, y0, 3.8, 2.6, dk);
    lkOV(ctx, -26.2, y0, 2.4, 1.2, band);
    /* head follows the neck: dark cap, pale lip, tongue flick, eyes */
    const hx = xEnd + 4, hy = yEnd, tg = Math.max(0, Math.sin(e.anim * 6)) * 2.2;
    lkLN(ctx, [hx + 3.2, hy, hx + 5.6 + tg, hy, hx + 7.4 + tg, hy - 1.1, hx + 5.6 + tg, hy, hx + 7.4 + tg, hy + 1.1], 0.6, '#E8788A');
    lkOV(ctx, hx, hy, 5.2, 3.7, dk);
    lkOV(ctx, hx + 1.4, hy, 3, 2.1, band);
    lkOV(ctx, hx + 3.4, hy, 1.7, 1.5, b);
    oc4_eye(ctx, hx + 1.6, hy - 2, 1, '#F0D060'); oc4_eye(ctx, hx + 1.6, hy + 2, 1, '#F0D060');
  },
  lanternfish(ctx, e, b, dk, bob, wind, d){
    const pale = d.pale || OC4_TEAL, lit = oc4_lt(b, 0.45), mid = oc4_lt(b, 0.2), sw = Math.sin(e.anim * 5) * 1.2;
    softBlob(ctx, 0, bob, 10, pale, 0.16);
    lkFork(ctx, -6, bob + sw, 6, 4.4, mid);
    lkOV(ctx, -5.4, bob + sw * 0.5, 2.6, 1.2, mid);
    for (let s = -1; s <= 1; s += 2){
      lkTRI(ctx, 2, bob + s * 2.8, -3, bob + s * 6.4, -0.4, bob + s * 2.6, mid);
      lkTRI(ctx, -5, bob + s * 1.8, -8, bob + s * 3.2, -7, bob + s * 1.4, mid);
    }
    oc4_rim(ctx, 0, bob, 7.6, 4.6, lit, 0.7, 0.9);
    lkOV(ctx, 0, bob, 7.2, 4.2, mid);
    lkOV(ctx, -0.4, bob, 6.2, 2.2, b);
    lkOV(ctx, 0, bob, 4.6, 0.9, dk);
    lkOV(ctx, 5.6, bob, 2.6, 2.3, mid);                        /* blunt head with a wide mouth */
    lkLN(ctx, [6, bob + 0.6, 8.6, bob + 0.2], 0.5, dk);
    for (let k = 0; k < 4; k++){                               /* glowing photophores in rows */
      const tw = 0.5 + 0.5 * Math.sin(e.anim * 4 + k);
      ctx.globalAlpha = 0.5 + tw * 0.5;
      fillCircle(ctx, -4 + k * 2.6, bob - 2.7, 0.8, pale);
      fillCircle(ctx, -4 + k * 2.6 + 1.2, bob + 2.7, 0.8, pale);
    }
    ctx.globalAlpha = 1;
    fillCircle(ctx, 6.6, bob - 1.4, 0.6, pale);
    oc4_eye(ctx, 4.4, bob - 1.9, 1.5, pale); oc4_eye(ctx, 4.4, bob + 1.9, 1.5, pale);
  },
  greatwhite(ctx, e, b, dk, bob){
    const sw = Math.sin(e.anim * 1.6) * 8, fl = Math.sin(e.anim * 1.2) * 2;
    const belly = oc4_lt(b, 0.62), lit = oc4_lt(b, 0.28), back = oc4_dk(b, 0.34), tip = oc4_dk(b, 0.62), mid = oc4_lt(b, 0.12);
    /* heterocercal tail: a tall upper lobe, a shorter lower lobe, dark trailing edge, pale leading edge */
    lkOV(ctx, -33, bob + sw * 0.42, 9, 4.6, b);
    lkTRI(ctx, -38, bob + sw * 0.5, -60, bob + sw - 16, -50, bob + sw, b);
    lkTRI(ctx, -38, bob + sw * 0.5, -58, bob + sw + 13, -50, bob + sw, b);
    lkTRI(ctx, -41, bob + sw * 0.5 - 0.8, -57, bob + sw - 13.4, -50.5, bob + sw - 0.8, back);
    lkLN(ctx, [-60, bob + sw - 16, -50, bob + sw, -58, bob + sw + 13], 1.6, tip);
    lkLN(ctx, [-38, bob + sw * 0.5, -60, bob + sw - 16], 0.9, lit);
    /* pelvic, second-dorsal and anal fins; broad pectorals with ribbed, dark-tipped blades */
    for (let s = -1; s <= 1; s += 2){
      lkTRI(ctx, -16, bob + s * 9, -27, bob + s * 18, -21, bob + s * 8, mid);
      lkTRI(ctx, -27, bob + s * 5, -35, bob + s * 10, -33, bob + s * 4.4, mid);
      lkTRI(ctx, 12, bob + s * 12, -10, bob + s * (36 + fl), 2, bob + s * 12, b);
      lkTRI(ctx, 1, bob + s * 12.6, -10, bob + s * (36 + fl), -4, bob + s * 21, mid);
      lkLN(ctx, [9, bob + s * 13, -6, bob + s * 30, 2, bob + s * 14, -3, bob + s * 24], 0.8, back);
    }
    /* body: pale belly edge, gray flank, dark back, center ridge */
    lkOV(ctx, -4, bob + sw * 0.15, 44.6, 16.6, belly);
    lkOV(ctx, -4, bob + sw * 0.15, 44, 15, b);
    lkOV(ctx, -6, bob + sw * 0.1, 36, 8.6, back);
    lkOV(ctx, -6, bob, 34, 4, tip);
    ctx.strokeStyle = lit; ctx.globalAlpha = 0.8; ctx.lineWidth = 1; ctx.beginPath();   /* old scars */
    ctx.moveTo(14, bob - 9.6); ctx.lineTo(8, bob - 12.4); ctx.moveTo(10, bob + 8.8); ctx.lineTo(4, bob + 12);
    ctx.moveTo(-14, bob - 10); ctx.lineTo(-19, bob - 12);
    ctx.stroke(); ctx.globalAlpha = 1;
    /* dorsal fins */
    lkTRI(ctx, -16, bob - 5.4, 14, bob, -16, bob + 5.4, tip);
    lkLN(ctx, [-12, bob, 12, bob], 1, lit);
    lkTRI(ctx, -26, bob - 2.2, -20, bob, -26, bob + 2.2, tip);
    /* snout, nostrils, jaw line */
    lkTRI(ctx, 36, bob - 11, 56, bob, 36, bob + 11, b);
    lkTRI(ctx, 38, bob - 6.4, 55, bob, 38, bob + 6.4, mid);
    lkTRI(ctx, 40, bob - 3, 55, bob, 40, bob + 3, back);
    fillCircle(ctx, 50.4, bob - 2.4, 0.9, '#07121A'); fillCircle(ctx, 50.4, bob + 2.4, 0.9, '#07121A');
    ctx.strokeStyle = tip; ctx.lineWidth = 1.2; ctx.lineCap = 'round'; ctx.beginPath();     /* gill slits */
    for (let s = -1; s <= 1; s += 2) for (let k = 0; k < 5; k++){ const x = 26 - k * 3.4; ctx.moveTo(x, bob + s * 10.4); ctx.lineTo(x - 1, bob + s * 14.6); }
    ctx.stroke(); ctx.lineCap = 'butt';
    /* the cold black eye */
    for (let s = -1; s <= 1; s += 2){
      fillCircle(ctx, 40, bob + s * 6.2, 2.7, '#04080B');
      fillCircle(ctx, 40.4, bob + s * 6.2, 1.5, '#2A3640');
      fillCircle(ctx, 40.9, bob + s * 5.7, 0.55, '#FFFFFF');
    }
    if (e.state === 'roar'){
      lkOV(ctx, 50, bob, 7, 6 + Math.sin(G.time * 30) * 1.5, '#7A1A1C');
      for (let k = -3; k <= 3; k++) lkTRI(ctx, 46 + Math.abs(k), bob + k * 1.8 - 0.8, 50, bob + k * 1.8, 46 + Math.abs(k), bob + k * 1.8 + 0.8, '#F4F4F0');
    }
  },
  whale(ctx, e, b, dk, bob, wind, d){
    const sw = Math.sin(e.anim * 0.9) * 8, pale = d.pale || '#E8ECF0';
    const body = oc4_lt(b, 0.16), top = oc4_dk(b, 0.34), lit = oc4_lt(b, 0.5), shell = oc4_dk(pale, 0.14);
    /* tail stock and broad flukes with a scalloped trailing edge */
    lkOV(ctx, -52, bob + sw * 0.55, 14, 7, body);
    for (let s = -1; s <= 1; s += 2){
      lkOV(ctx, -64.6, bob + sw + s * 12.4, 17, 7, lit, s * 0.5);
      lkOV(ctx, -64, bob + sw + s * 12, 16, 6, body, s * 0.5);
      lkOV(ctx, -62, bob + sw + s * 10.6, 11, 2.4, top, s * 0.5);
      ctx.fillStyle = top; ctx.beginPath();
      for (let k = 0; k < 4; k++){ const px = -73 - k * 0.6, py = bob + sw + s * (13 + k * 2.4); ctx.moveTo(px + 1.5, py); ctx.arc(px, py, 1.5, 0, TAU); }
      ctx.fill();
    }
    /* the humpback's huge white pectorals: knobbly leading edge, dark upper surface */
    for (let s = -1; s <= 1; s += 2){
      ctx.save(); ctx.translate(4, bob + s * 34); ctx.rotate(s * 0.9);
      lkOV(ctx, 0, 0, 26.6, 5.4, shell);
      lkOV(ctx, 0.5, 0, 26, 4.6, pale);
      lkOV(ctx, 1, -s * 1.2, 22, 1.8, oc4_dk(pale, 0.22));
      ctx.fillStyle = pale; ctx.beginPath();
      for (let k = 0; k < 7; k++){ const px = -18 + k * 5.6, py = -s * 5.4 * Math.sqrt(1 - (px / 27) * (px / 27)); ctx.moveTo(px + 1.5, py); ctx.arc(px, py, 1.5, 0, TAU); }
      ctx.fill();
      ctx.restore();
    }
    /* body: rim light, slate flank, dark back, ventral pleats, dorsal hump */
    lkOV(ctx, -6, bob + sw * 0.2, 56.6, 22.6, lit);
    lkOV(ctx, -6, bob + sw * 0.2, 56, 22, body);
    ctx.globalAlpha = 0.5; lkOV(ctx, -8, bob, 48, 9.6, top); ctx.globalAlpha = 1;
    ctx.strokeStyle = top; ctx.globalAlpha = 0.55; ctx.lineWidth = 0.9; ctx.beginPath();
    for (let s = -1; s <= 1; s += 2) for (let j = 0; j < 4; j++){
      ctx.moveTo(26 - j * 3, bob + s * (10.4 + j * 2.1)); ctx.lineTo(-2 - j * 4, bob + s * (12.2 + j * 2.2));
    }
    ctx.stroke(); ctx.globalAlpha = 1;
    lkTRI(ctx, -22, bob - 3.6, -36, bob, -22, bob + 3.6, top);
    lkLN(ctx, [-24, bob, -34, bob], 0.8, lit);
    /* head: knobbly tubercle rows, barnacle patches, mouth line, blowholes, eyes */
    ctx.fillStyle = pale; ctx.beginPath();
    for (let k = 0; k < 10; k++){ const px = 34 + (k % 4) * 4, py = bob + ((k % 3) - 1) * 6; ctx.moveTo(px + 1.8, py); ctx.arc(px, py, 1.8, 0, TAU); }
    ctx.fill();
    ctx.fillStyle = shell; ctx.beginPath();
    for (let s = -1; s <= 1; s += 2) for (let k = 0; k < 6; k++){ const px = 40 + k * 1.8, py = bob + s * (12.6 + (k % 3) * 1.4); ctx.moveTo(px + 0.9, py); ctx.arc(px, py, 0.9, 0, TAU); }
    ctx.fill();
    ctx.strokeStyle = top; ctx.lineWidth = 1.3; ctx.beginPath();
    ctx.moveTo(49, bob - 5); ctx.quadraticCurveTo(42, bob - 17, 28, bob - 17.5);
    ctx.moveTo(49, bob + 5); ctx.quadraticCurveTo(42, bob + 17, 28, bob + 17.5);
    ctx.stroke();
    lkLN(ctx, [24, bob - 2.6, 20, bob - 1.6], 1.4, '#0A1218'); lkLN(ctx, [24, bob + 2.6, 20, bob + 1.6], 1.4, '#0A1218');
    oc4_eye(ctx, 36, bob - 16, 2.3); oc4_eye(ctx, 36, bob + 16, 2.3);
  },
  orca(ctx, e, b, dk, bob, wind, d){
    if (e.state === 'dash' || e.state === 'wind') softBlob(ctx, 10, bob, 52, '#FF5A2C', 0.1);
    const sw = Math.sin(e.anim * 1.4) * 6, wh = d.pale || '#F4F6F8', whs = oc4_dk(wh, 0.14);
    const sheen = oc4_lt(b, 0.34), gloss = oc4_lt(b, 0.5), saddle = '#6A7078';
    /* tail stock and flukes (pale edge so the black reads on dark water) */
    lkOV(ctx, -43, bob + sw * 0.5, 10, 5.6, b);
    for (let s = -1; s <= 1; s += 2){
      lkOV(ctx, -52, bob + sw + s * 10, 14, 5, b, s * 0.5);
      oc4_rim(ctx, -52, bob + sw + s * 10, 14, 5, gloss, 0.55, 1, s * 0.5);
      lkOV(ctx, -55, bob + sw + s * 12, 7, 1.6, whs, s * 0.5);
    }
    /* big rounded paddle flippers */
    for (let s = -1; s <= 1; s += 2){
      lkOV(ctx, 10, bob + s * 20, 12, 6, b, s * 0.8);
      oc4_rim(ctx, 10, bob + s * 20, 12, 6, gloss, 0.55, 1, s * 0.8);
      lkOV(ctx, 8, bob + s * 18.6, 6, 1.6, sheen, s * 0.8);
    }
    /* body: white underside showing at the flanks, black back with a glossy sheen */
    lkOV(ctx, -4, bob + sw * 0.15, 44, 18, whs);
    lkOV(ctx, -3.6, bob + sw * 0.15, 43.2, 15.9, b);
    oc4_rim(ctx, -4, bob + sw * 0.15, 44.4, 18.4, gloss, 0.35, 1.2);
    ctx.globalAlpha = 0.5; lkOV(ctx, -4, bob, 38, 11, sheen); ctx.globalAlpha = 0.5; lkOV(ctx, -6, bob, 32, 5.6, gloss); ctx.globalAlpha = 1;
    /* gray saddle patch and the towering dorsal fin, edge-on */
    lkOV(ctx, -10, bob, 12, 11, saddle);
    ctx.globalAlpha = 0.5; lkOV(ctx, -12, bob, 8, 7, oc4_lt(saddle, 0.3)); ctx.globalAlpha = 1;
    lkTRI(ctx, -14, bob - 4.2, 15, bob, -14, bob + 4.2, '#0A0C0E');
    lkLN(ctx, [-11, bob, 13, bob], 0.9, gloss);
    /* white eye patches, melon, mouth, blowhole */
    lkOV(ctx, 36, bob, 7, 8.4, b);
    lkLN(ctx, [42, bob - 4, 36, bob - 8.4], 0.9, sheen); lkLN(ctx, [42, bob + 4, 36, bob + 8.4], 0.9, sheen);
    fillCircle(ctx, 14, bob, 1.1, '#02080C');
    for (let s = -1; s <= 1; s += 2){
      lkOV(ctx, 26.6, bob + s * 11, 6.6, 3.1, wh, s * 0.32);
      fillCircle(ctx, 25, bob + s * 11.2, 1.7, '#06090B');
      fillCircle(ctx, 25.6, bob + s * 10.7, 0.55, '#FFFFFF');
    }
  },
  giantsquid(ctx, e, b, dk, bob){
    const arm = oc4_lt(b, 0.14), tipc = oc4_lt(b, 0.32), suck = '#F4E6CC', back = oc4_dk(b, 0.38), lit = oc4_lt(b, 0.4);
    const flo = Math.sin(e.anim * 2) * 1.6;
    ctx.lineCap = 'round';
    /* eight arms: thin lit tips, thick roots, cream sucker rows */
    ctx.strokeStyle = tipc; ctx.lineWidth = 2.4; ctx.beginPath();
    for (let k = 0; k < 8; k++){
      const off = (k - 3.5) * 4.2, w = Math.sin(e.anim * 2 + k) * 6;
      ctx.moveTo(28, bob + off * 0.6); ctx.quadraticCurveTo(46, bob + off + w, 60, bob + off * 1.5 - w);
    }
    ctx.stroke();
    ctx.strokeStyle = b; ctx.lineWidth = 4.6; ctx.beginPath();
    for (let k = 0; k < 8; k++){
      const off = (k - 3.5) * 4.2, w = Math.sin(e.anim * 2 + k) * 6;
      const y0 = bob + off * 0.6, cy = bob + off + w, ey = bob + off * 1.5 - w;
      ctx.moveTo(28, y0); ctx.quadraticCurveTo(37, (y0 + cy) / 2, (28 + 92 + 60) / 4, (y0 + 2 * cy + ey) / 4);
    }
    ctx.stroke();
    ctx.fillStyle = suck; ctx.globalAlpha = 0.85; ctx.beginPath();
    for (let k = 0; k < 8; k++){
      const off = (k - 3.5) * 4.2, w = Math.sin(e.anim * 2 + k) * 6;
      const y0 = bob + off * 0.6, cy = bob + off + w, ey = bob + off * 1.5 - w;
      for (let j = 0; j < 5; j++){
        const t = 0.18 + j * 0.16, px = oc4_q(28, 46, 60, t), py = oc4_q(y0, cy, ey, t), r = 1.15 - j * 0.14;
        ctx.moveTo(px + r, py); ctx.arc(px, py, r, 0, TAU);
      }
    }
    ctx.fill(); ctx.globalAlpha = 1;
    /* two long feeding tentacles with clubbed, sucker-studded tips */
    for (let s = -1; s <= 1; s += 2){
      const w = Math.sin(e.anim * 1.4 + s) * 10, cx = 92, cy = bob + s * 4 - w;
      ctx.strokeStyle = b; ctx.lineWidth = 2.4;
      ctx.beginPath(); ctx.moveTo(28, bob + s * 3); ctx.quadraticCurveTo(62, bob + s * 6 + w, 90, bob + s * 4 - w); ctx.stroke();
      ctx.strokeStyle = tipc; ctx.lineWidth = 0.8;
      ctx.beginPath(); ctx.moveTo(30, bob + s * 3); ctx.quadraticCurveTo(62, bob + s * 6 + w, 88, bob + s * 4 - w); ctx.stroke();
      lkOV(ctx, cx + 1, cy, 7.6, 4.2, back);
      lkOV(ctx, cx + 1, cy, 7, 3.6, b);
      ctx.fillStyle = suck; ctx.beginPath();
      for (let j = 0; j < 5; j++){ const px = cx - 3 + j * 2.4, py = cy + ((j % 2) ? 1.2 : -1.2); ctx.moveTo(px + 0.9, py); ctx.arc(px, py, 0.9, 0, TAU); }
      ctx.fill();
      lkTRI(ctx, cx + 7, cy - 1.2, cx + 11, cy, cx + 7, cy + 1.2, back);
    }
    ctx.lineCap = 'butt';
    /* diamond tail fin with fine rays; it ripples */
    lkTRI(ctx, -54, bob, -34, bob - 19 - flo, -22, bob, back);
    lkTRI(ctx, -54, bob, -34, bob + 19 + flo, -22, bob, back);
    lkTRI(ctx, -52, bob, -35, bob - 17.4 - flo, -26, bob, b);
    lkTRI(ctx, -52, bob, -35, bob + 17.4 + flo, -26, bob, b);
    ctx.strokeStyle = back; ctx.globalAlpha = 0.7; ctx.lineWidth = 0.7; ctx.beginPath();
    for (let s = -1; s <= 1; s += 2) for (let k = 0; k < 4; k++){ ctx.moveTo(-26, bob); ctx.lineTo(-40 + k * 3.6, bob + s * (13 + flo * 0.8 + (k % 2) * 3 - (k > 2 ? 3 : 0))); }
    ctx.stroke(); ctx.globalAlpha = 1;
    /* mantle: pale rim, red body, dark spine, chromatophore spots, collar */
    lkOV(ctx, -6, bob, 40.6, 15.6, lit);
    lkOV(ctx, -6, bob, 40, 15, b);
    lkOV(ctx, -8, bob, 34, 6, back);
    ctx.fillStyle = dk; ctx.beginPath();
    for (let k = 0; k < 14; k++){ const x = -36 + k * 5, y = bob + Math.sin(k * 1.7) * 7, r = 1.6 + 0.5 * Math.sin(e.anim * 3 + k); ctx.moveTo(x + r, y); ctx.arc(x, y, r, 0, TAU); }
    ctx.fill();
    ctx.fillStyle = lit; ctx.globalAlpha = 0.75; ctx.beginPath();
    for (let k = 0; k < 10; k++){ const x = -33 + k * 5.4, y = bob + Math.sin(k * 2.3 + 1) * 10.4, r = 1.1 + 0.3 * Math.sin(e.anim * 2.6 + k * 1.3); ctx.moveTo(x + r, y); ctx.arc(x, y, r, 0, TAU); }
    ctx.fill(); ctx.globalAlpha = 1;
    lkOV(ctx, 17, bob, 4, 14.4, dk);
    /* head, funnel, beak, and the dinner-plate eyes */
    lkOV(ctx, 24, bob, 10, 14, b);
    lkOV(ctx, 26, bob, 6, 6.6, arm);
    lkTRI(ctx, 29, bob - 1.8, 35, bob, 29, bob + 1.8, '#2A1410');
    for (let s = -1; s <= 1; s += 2){
      const ey = bob + s * 9;
      fillCircle(ctx, 24, ey, 6.5, back);
      fillCircle(ctx, 24, ey, 5.6, '#F2E8D0');
      fillCircle(ctx, 24.5, ey, 3.9, OC4_AMBER);
      fillCircle(ctx, 24.9, ey, 2.5, '#0A0A0A');
      fillCircle(ctx, 25.9, ey - 1.4, 0.9, '#FFFFFF');
    }
    if (e.state === 'roll') ringPath(ctx, 0, bob, 62, 3, '#3EE8DC', 0.4);
  },
  anglerfish(ctx, e, b, dk, bob, wind, d){
    const pale = d.pale || OC4_TEAL, lit = oc4_lt(b, 0.45), mid = oc4_lt(b, 0.2), fin = oc4_lt(b, 0.1), pit = oc4_lt(dk, 0.1);
    softBlob(ctx, 0, bob, 60, '#0A1A24', 0.22);
    /* fanned tail and big ray-finned pectorals */
    lkFork(ctx, -30, bob, 17, 13, fin);
    ctx.strokeStyle = lit; ctx.globalAlpha = 0.5; ctx.lineWidth = 0.8; ctx.beginPath();
    for (let k = -2; k <= 2; k++){ ctx.moveTo(-30, bob); ctx.lineTo(-45, bob + k * 5.4); }
    for (let s = -1; s <= 1; s += 2) for (let k = 0; k < 4; k++){ ctx.moveTo(-4, bob + s * 26); ctx.lineTo(-13 + k * 5, bob + s * (33 + (k % 2) * 2)); }
    ctx.stroke(); ctx.globalAlpha = 1;
    for (let s = -1; s <= 1; s += 2){
      lkOV(ctx, -4, bob + s * 28, 12, 6.4, fin, s * 0.5);
      oc4_rim(ctx, -4, bob + s * 28, 12, 6.4, lit, 0.55, 1, s * 0.5);
    }
    /* the lumpy body: pale rim, mottled skin, dorsal spines, glow dots */
    oc4_rim(ctx, 0, bob, 34.6, 30.6, lit, 0.5, 2);
    lkOV(ctx, 0, bob, 34, 30, b);
    lkOV(ctx, 2, bob, 28, 24, mid);
    ctx.globalAlpha = 0.5; lkOV(ctx, -6, bob, 26, 20, b); ctx.globalAlpha = 1;
    ctx.fillStyle = dk; ctx.globalAlpha = 0.6; ctx.beginPath();
    for (let k = 0; k < 16; k++){ const x = -14 + Math.cos(k * 2.4) * 17, y = bob + Math.sin(k * 2.4) * 17, r = 2 + (k % 3) * 0.9; ctx.moveTo(x + r, y); ctx.arc(x, y, r, 0, TAU); }
    ctx.fill();
    ctx.fillStyle = lit; ctx.globalAlpha = 0.45; ctx.beginPath();
    for (let k = 0; k < 14; k++){ const x = -10 + Math.cos(k * 2.9 + 0.7) * 18, y = bob + Math.sin(k * 2.9 + 0.7) * 18, r = 1 + (k % 2) * 0.7; ctx.moveTo(x + r, y); ctx.arc(x, y, r, 0, TAU); }
    ctx.fill(); ctx.globalAlpha = 1;
    ctx.fillStyle = mid; ctx.beginPath();                       /* spiny crest toward the tail */
    for (let s = -1; s <= 1; s += 2) for (let k = 0; k < 6; k++){
      const a = Math.PI - 0.15 - k * 0.2, px = Math.cos(a) * 33.4, py = bob + s * Math.sin(a) * 29.4;
      ctx.moveTo(px - 1.2, py - 1.4 * s); ctx.lineTo(px + Math.cos(a) * 4.4, py + s * Math.sin(a) * 4.4); ctx.lineTo(px + 1.2, py + 1.4 * s);
    }
    ctx.fill();
    ctx.fillStyle = pale; ctx.globalAlpha = 0.5 + 0.2 * Math.sin(e.anim * 3); ctx.beginPath();  /* a few lateral glow dots */
    for (let s = -1; s <= 1; s += 2) for (let k = 0; k < 4; k++){ const x = -18 + k * 7, y = bob + s * (24 - Math.abs(k - 1.5) * 2.4); ctx.moveTo(x + 1, y); ctx.arc(x, y, 1, 0, TAU); }
    ctx.fill(); ctx.globalAlpha = 1;
    /* cavernous mouth: jutting jaw rim, dark gullet, tongue, double rows of needle teeth */
    lkOV(ctx, 28, bob, 11.4, 25, mid);
    lkOV(ctx, 28.6, bob, 10, 24, '#1A0E10');
    lkOV(ctx, 30, bob, 6.4, 17, '#3A1620');
    lkOV(ctx, 31.4, bob, 3.6, 8, '#6A2A34');
    ctx.fillStyle = '#F2EEE4'; ctx.beginPath();
    for (let k = -5; k <= 5; k++){
      const y = bob + k * 4, l = 10 + ((k + 5) % 3) * 2;
      ctx.moveTo(30, y - 1.2); ctx.lineTo(30 + l, y); ctx.lineTo(30, y + 1.2);
    }
    for (let k = -4; k <= 4; k++){
      const y = bob + k * 4 + 2;
      ctx.moveTo(30, y - 0.9); ctx.lineTo(30 + 5.6, y); ctx.lineTo(30, y + 0.9);
    }
    ctx.fill();
    /* small baleful eyes */
    oc4_eye(ctx, 14, bob - 16, 2.9, pale); oc4_eye(ctx, 14, bob + 16, 2.9, pale);
    /* the lure on its jointed stalk */
    const lx = 58 + Math.sin(e.anim * 1.5) * 4, ly = bob + Math.cos(e.anim * 1.2) * 6;
    lkCV(ctx, 10, bob, 40, bob - 26, lx, ly, 3, '#0A1218');
    lkCV(ctx, 10, bob, 40, bob - 26, lx, ly, 1.8, lit);
    fillCircle(ctx, 10, bob, 3.4, mid);
    softBlob(ctx, lx, ly, 14, pale, 0.3 + 0.18 * Math.sin(e.anim * 4));
    softBlob(ctx, lx, ly, 8, pale, 0.35);
    ctx.strokeStyle = pale; ctx.lineWidth = 0.8; ctx.globalAlpha = 0.7; ctx.beginPath();
    for (let k = 0; k < 5; k++){ const a = k * 1.26 + e.anim * 0.8; ctx.moveTo(lx, ly); ctx.lineTo(lx + Math.cos(a) * 8, ly + Math.sin(a) * 8); }
    ctx.stroke(); ctx.globalAlpha = 1;
    fillCircle(ctx, lx, ly, 4, pale);
    fillCircle(ctx, lx - 0.6, ly - 0.6, 1.8, '#F4FFFC');
  }
};



