'use strict';
/* Enemy art, Chapter 17: the Island Lab (ISLE_DRAW). */
/* Twelve ordinary kinds and five bosses, all sea creatures a scientist has changed, drawn from above like every creature, facing +x. Chapter 4's sea colours (teal, coral, sand,
   violet) with one lab mark on each, a steel tag, a clamp, a cable or a green glow, so they read as made, not born. Every part is drawn from where it joins the body: a leg starts
   inside the shell it comes out of, a claw is on the end of its arm, a spine stands on the skin, a tentacle hangs from the rim. Like the Fort's, the ordinary ones read only
   def, type, r, anim and state of the creature, so the sprite cache (js/game/44t-enemy-sprites.js) can keep pictures of them. The helpers (tw_poly, tw_ln, tw_rr, tw_eye ...) are
   the Tower art's, in js/art/35j-art-tower.js; lkOV is in js/art/34a-art-helpers.js. */
const IL_LAB = '#7AF0B8', IL_STEEL = '#A8B4BC', IL_DKSTEEL = '#3A444C', IL_FOAM = '#E8FAFA';
/* a jointed leg from (x0, y0) on the body, out through a knee to a foot: a dark outline, the colour, a lighter joint */
function il_leg(ctx, x0, y0, kx, ky, fx, fy, w, c, dk){
  tw_ln(ctx, [x0, y0, kx, ky, fx, fy], w + 1.6, dk); tw_ln(ctx, [x0, y0, kx, ky, fx, fy], w, c); fillCircle(ctx, kx, ky, w * 0.6, tw_li(c, 0.25)); fillCircle(ctx, fx, fy, w * 0.45, dk);
}
/* a claw on the end of its arm: the arm from the body, the hand, and the two fingers (open by `open`, 0 to 1) */
function il_claw(ctx, x0, y0, hx, hy, a, sz, open, c, dk, tip){
  tw_ln(ctx, [x0, y0, (x0 + hx) / 2, (y0 + hy) / 2 + (hy > y0 ? sz * 0.3 : -sz * 0.3), hx, hy], sz * 0.42 + 1.6, dk); tw_ln(ctx, [x0, y0, (x0 + hx) / 2, (y0 + hy) / 2 + (hy > y0 ? sz * 0.3 : -sz * 0.3), hx, hy], sz * 0.42, c);
  ctx.save(); ctx.translate(hx, hy); ctx.rotate(a);
  lkOV(ctx, sz * 0.3, 0, sz * 0.62, sz * 0.42, dk); lkOV(ctx, sz * 0.3, 0, sz * 0.55, sz * 0.36, c); lkOV(ctx, sz * 0.2, -sz * 0.12, sz * 0.3, sz * 0.14, tw_li(c, 0.3));
  const o = 0.15 + open * 0.45;
  for (const s of [-1, 1]){ ctx.save(); ctx.translate(sz * 0.75, s * sz * 0.12); ctx.rotate(s * o); tw_poly(ctx, [0, -sz * 0.16, sz * 0.62, -sz * 0.04 * s, sz * 0.7, 0, sz * 0.5, sz * 0.12, 0, sz * 0.16], s > 0 ? tw_sh(c, 0.12) : c); fillCircle(ctx, sz * 0.66, 0, sz * 0.06, tip || dk); ctx.restore(); }
  ctx.restore();
}
/* an eye on a stalk that grows from the head at (x0, y0) */
function il_stalkEye(ctx, x0, y0, x1, y1, r, c, dk, iris){
  tw_ln(ctx, [x0, y0, x1, y1], r * 0.8 + 1.2, dk); tw_ln(ctx, [x0, y0, x1, y1], r * 0.8, c);
  fillCircle(ctx, x1, y1, r * 1.2, dk); fillCircle(ctx, x1, y1, r, iris || '#1A1A22'); fillCircle(ctx, x1 - r * 0.3, y1 - r * 0.3, r * 0.35, '#FFFFFF');
}
/* a steel tag clipped to the skin at (x, y): the lab's mark on every creature */
function il_tag(ctx, x, y, s, a){
  ctx.save(); ctx.translate(x, y); ctx.rotate(a || 0);
  fillCircle(ctx, 0, 0, 1.4 * s, IL_DKSTEEL); tw_rr(ctx, -0.6 * s, 0.4 * s, 4.4 * s, 2.6 * s, 0.6 * s, IL_STEEL); tw_rect(ctx, 0.2 * s, 1.1 * s, 2.8 * s, 0.5 * s, IL_DKSTEEL); fillCircle(ctx, 3 * s, 1.7 * s, 0.5 * s, IL_LAB);
  ctx.restore();
}
/* a tapering body along a list of points (from the head back): rings of the given widths, an outline first */
function il_body(ctx, pts, w0, w1, c, dk){
  const n = pts.length / 2 - 1; ctx.lineCap = 'round';                                     /* round ends, so the bends do not show the joins */
  for (let pass = 0; pass < 2; pass++) for (let i = n; i > 0; i--){
    const w = w0 + (w1 - w0) * (i / n); tw_ln(ctx, [pts[i * 2 - 2], pts[i * 2 - 1], pts[i * 2], pts[i * 2 + 1]], pass ? w : w + 2, pass ? c : dk);
  }
  ctx.lineCap = 'butt';
}
/* a spine standing on the skin at angle a of a circle (cx, cy, r): base on the skin, out to its tip */
function il_spine(ctx, cx, cy, r, a, len, w, c, tip){
  const bx = cx + Math.cos(a) * r * 0.92, by = cy + Math.sin(a) * r * 0.92, ex = cx + Math.cos(a) * (r + len), ey = cy + Math.sin(a) * (r + len), px = -Math.sin(a) * w, py = Math.cos(a) * w;
  tw_poly(ctx, [bx + px, by + py, ex, ey, bx - px, by - py], c); if (tip) fillCircle(ctx, ex, ey, w * 0.35, tip);
}
const ISLE_DRAW = {
  il_hermit(ctx, e, b, dk, bob, wind, d){                                              /* Hermit Squatter: a hermit crab living in a dented lab drum, claws and eyestalks out the front */
    const s = e.r / 13, a = e.anim * 3, lunge = e.state === 'lunge';
    for (let i = 0; i < 3; i++) for (const sd of [-1, 1]){                             /* six walking legs, from under the front of the drum */
      const w = Math.sin(a + i * 2.1 + (sd > 0 ? 0 : Math.PI)) * 2.2 * s, x0 = (3 - i * 2.4) * s;
      il_leg(ctx, x0, bob + sd * 3 * s, x0 + 2.4 * s + w, bob + sd * 9 * s, x0 + 1 * s + w * 1.3, bob + sd * 12.6 * s, 1.5 * s, b, dk);
    }
    fillCircle(ctx, -4.4 * s, bob, 9.6 * s, dk); fillCircle(ctx, -4.4 * s, bob, 8.8 * s, '#5A7A88');      /* the drum, seen from above: the lid, two hoops and a hazard label */
    ringPath(ctx, -4.4 * s, bob, 7.2 * s, 1.1 * s, '#3A5260', 1); ringPath(ctx, -4.4 * s, bob, 4.6 * s, 0.9 * s, '#3A5260', 1);
    fillCircle(ctx, -4.4 * s, bob, 3.2 * s, '#6E909E'); fillCircle(ctx, -3.2 * s, bob - 1.6 * s, 1 * s, '#2A3A44');
    ctx.save(); ctx.beginPath(); ctx.arc(-4.4 * s, bob, 8.8 * s, 2.0, 3.0); ctx.lineTo(-4.4 * s, bob); ctx.closePath(); ctx.clip(); for (let k = 0; k < 6; k++) tw_poly(ctx, [-14 * s + k * 3 * s, bob, -12.5 * s + k * 3 * s, bob, -10.5 * s + k * 3 * s, bob + 10 * s, -12 * s + k * 3 * s, bob + 10 * s], k % 2 ? '#E8C83A' : '#1A1C22'); ctx.restore();
    tw_poly(ctx, [-11 * s, bob - 4 * s, -9.6 * s, bob - 6.4 * s, -8 * s, bob - 5 * s], '#3A5260');   /* a dent */
    lkOV(ctx, 4.6 * s, bob, 5.6 * s, 4.8 * s, dk); lkOV(ctx, 4.6 * s, bob, 4.9 * s, 4.1 * s, b); lkOV(ctx, 3.6 * s, bob - 1.4 * s, 2.6 * s, 1.6 * s, tw_li(b, 0.3));
    for (const sd of [-1, 1]) for (let q = 0; q < 3; q++) fillCircle(ctx, (3 + q * 1.6) * s, bob + sd * (2.4 - q * 0.3) * s, 0.5 * s, tw_sh(b, 0.35));
    il_claw(ctx, 6 * s, bob + 3.2 * s, 10 * s + (lunge ? 3 * s : 0), bob + 5.4 * s, 0.25, 6.6 * s, lunge ? 1 : 0.3 + 0.2 * Math.sin(a), b, dk, '#2A1A14');       /* the big claw */
    il_claw(ctx, 6 * s, bob - 3.2 * s, 9.6 * s + (lunge ? 2 * s : 0), bob - 4.4 * s, -0.2, 4.4 * s, lunge ? 0.8 : 0.4, b, dk, '#2A1A14');
    for (const sd of [-1, 1]) il_stalkEye(ctx, 8.6 * s, bob + sd * 1.2 * s, 12 * s, bob + sd * (2.4 + Math.sin(a * 0.5 + sd) * 0.6) * s, 1.1 * s, b, dk);
    for (const sd of [-1, 1]) tw_ln(ctx, [9 * s, bob + sd * 0.6 * s, 14 * s, bob + sd * 1.6 * s, 18 * s, bob + sd * (0.4 + Math.sin(a + sd) * 1.2) * s], 0.4 * s, tw_sh(b, 0.3));
    il_tag(ctx, -1 * s, bob - 7.4 * s, s * 0.8, -0.3);
  },
  il_shrimp(ctx, e, b, dk, bob, wind, d){                                              /* Lab Shrimp: a see-through pink shrimp, curled tail fan, long feelers, a green ring on its back */
    const s = e.r / 10, a = e.anim * 4.4, flick = Math.sin(a) * 0.12;
    for (let i = 0; i < 5; i++) for (const sd of [-1, 1]){ const w = Math.sin(a * 1.4 + i * 1.1 + (sd > 0 ? 0 : 1.5)) * 1.2 * s, x0 = (4 - i * 2.4) * s; tw_ln(ctx, [x0, bob + sd * 1.8 * s, x0 + 0.6 * s + w, bob + sd * 4.4 * s, x0 + w * 1.4, bob + sd * 5.6 * s], 0.7 * s, tw_sh(b, 0.25)); }
    const seg = [[6, 3.4], [3.2, 3.6], [0.4, 3.4], [-2.4, 3], [-5, 2.5], [-7.2, 2]];
    for (let i = seg.length - 1; i >= 0; i--){ const yo = Math.sin(i * 0.6 + a * 0.5) * flick * 6 * s; lkOV(ctx, seg[i][0] * s, bob + yo, 2.2 * s, seg[i][1] * s, dk); lkOV(ctx, seg[i][0] * s, bob + yo, 1.9 * s, seg[i][1] * s - 0.6 * s, i % 2 ? b : tw_li(b, 0.12)); lkOV(ctx, seg[i][0] * s - 0.4 * s, bob + yo - seg[i][1] * s * 0.4, 1 * s, 0.6 * s, 'rgba(255,255,255,.45)'); }
    const ty = Math.sin(5 * 0.6 + a * 0.5) * flick * 6 * s;                              /* the tail fan, on the last segment */
    for (const sd of [-1, 0, 1]) tw_poly(ctx, [-8.4 * s, bob + ty, -12.6 * s, bob + ty + sd * 3.4 * s - 1.2 * s, -13.2 * s, bob + ty + sd * 3.4 * s + 1.2 * s], sd ? tw_li(b, 0.15) : b);
    lkOV(ctx, 8.4 * s, bob, 3 * s, 2.6 * s, dk); lkOV(ctx, 8.4 * s, bob, 2.6 * s, 2.2 * s, tw_li(b, 0.08));                  /* the head and its spike */
    tw_poly(ctx, [10.6 * s, bob - 0.6 * s, 14.4 * s, bob, 10.6 * s, bob + 0.6 * s], tw_sh(b, 0.2));
    for (const sd of [-1, 1]){ fillCircle(ctx, 9.6 * s, bob + sd * 2 * s, 1.1 * s, '#14141C'); fillCircle(ctx, 9.4 * s, bob + sd * 1.8 * s, 0.4 * s, '#FFFFFF'); tw_ln(ctx, [10 * s, bob + sd * 1.2 * s, 15 * s, bob + sd * 3 * s, 21 * s, bob + sd * (2 + Math.sin(a + sd) * 2) * s], 0.35 * s, tw_sh(b, 0.3)); }
    ringPath(ctx, 0.4 * s, bob, 3.6 * s, 0.7 * s, IL_LAB, 0.9);
  },
  il_eel(ctx, e, b, dk, bob, wind, d){                                                 /* Eel Hound: a moray with a hound's broad head and frilled gills, a steel collar, a long body swinging behind */
    const s = e.r / 12, a = e.anim * 3, lunge = e.state === 'lunge', L = 30;
    const pts = []; for (let i = 0; i <= 10; i++){ const u = i / 10, x = 6 * s - u * L * s, y = bob + Math.sin(a - u * 4) * u * 6 * s; pts.push(x, y); }
    il_body(ctx, pts, 8.4 * s, 2 * s, b, dk);
    for (let i = 1; i < 10; i++) fillCircle(ctx, pts[i * 2], pts[i * 2 + 1], 0.9 * s, tw_li(b, 0.3));                      /* the pale line down its back, and spots */
    for (let i = 2; i < 10; i += 2) for (const sd of [-1, 1]) fillCircle(ctx, pts[i * 2] + 0.6 * s, pts[i * 2 + 1] + sd * (3.4 - i * 0.25) * s, 0.7 * s, tw_sh(b, 0.35));
    tw_ln(ctx, pts.slice(2), 1.1 * s, tw_li(b, 0.2));
    tw_poly(ctx, [pts[18], pts[19] - 1.4 * s, pts[20] - 4 * s, pts[21], pts[18], pts[19] + 1.4 * s], tw_sh(b, 0.15));       /* the tail tip */
    for (const sd of [-1, 1]){ const fl = Math.sin(a * 2 + sd) * 0.6 * s; tw_poly(ctx, [2 * s, bob + sd * 3.4 * s, -2 * s, bob + sd * (7.6 * s + fl), 0.2 * s, bob + sd * 3.6 * s], tw_li(b, 0.15)); }   /* gill frills */
    tw_rr(ctx, 2.6 * s, bob - 4.4 * s, 2.4 * s, 8.8 * s, 0.8 * s, IL_DKSTEEL); tw_rr(ctx, 2.9 * s, bob - 4.1 * s, 1.8 * s, 8.2 * s, 0.6 * s, IL_STEEL);   /* the collar */
    fillCircle(ctx, 3.8 * s, bob + 4.6 * s, 0.8 * s, IL_LAB);
    const jaw = lunge ? 2.6 * s : 0.8 * s;
    lkOV(ctx, 8.6 * s, bob, 5.6 * s, 4.8 * s, dk); lkOV(ctx, 8.6 * s, bob, 5 * s, 4.2 * s, b); lkOV(ctx, 7.6 * s, bob - 1.4 * s, 3 * s, 1.6 * s, tw_li(b, 0.25));
    tw_poly(ctx, [11 * s, bob - jaw, 15.4 * s, bob - jaw * 0.6, 15.4 * s, bob + jaw * 0.6, 11 * s, bob + jaw], '#3A1418');
    for (let k = 0; k < 4; k++) for (const sd of [-1, 1]) tw_poly(ctx, [11.6 * s + k * 1 * s, bob + sd * jaw * (1 - k * 0.1), 12.1 * s + k * 1 * s, bob + sd * (jaw - 1 * s), 12.6 * s + k * 1 * s, bob + sd * jaw * (1 - k * 0.1)], '#F2EEE0');
    for (const sd of [-1, 1]){ fillCircle(ctx, 9.6 * s, bob + sd * 2.6 * s, 1.2 * s, '#0A140E'); fillCircle(ctx, 9.6 * s, bob + sd * 2.6 * s, 0.8 * s, IL_LAB); fillCircle(ctx, 9.4 * s, bob + sd * 2.4 * s, 0.3 * s, '#FFFFFF'); }
    for (const sd of [-1, 1]) fillCircle(ctx, 13.8 * s, bob + sd * 1.4 * s, 0.4 * s, '#14100C');
  },
  il_urchin(ctx, e, b, dk, bob, wind, d){                                              /* Urchin Roller: a violet urchin as big as a boulder, a steel band clamped round it with two lamp eyes; spines spin when it rolls */
    const s = e.r / 12, roll = e.state === 'roll', spin = e.anim * (roll ? 2.4 : 0.6), R = 8.6 * s, wind2 = e.state === 'wind';
    for (let i = 0; i < 26; i++){ const aa = i * TAU / 26 + spin, len = (5.6 + ((i * 7) % 5) * 0.7) * s * (wind2 ? 1.15 : 1); il_spine(ctx, 0, bob, R, aa, len, 0.9 * s, i % 2 ? tw_sh(b, 0.1) : b, tw_li(d.pale || b, 0.2)); }
    fillCircle(ctx, 0, bob, R + 0.8 * s, dk); fillCircle(ctx, 0, bob, R, b);
    for (let i = 0; i < 10; i++){ const aa = i * TAU / 10 + spin; tw_ln(ctx, [Math.cos(aa) * 2 * s, bob + Math.sin(aa) * 2 * s, Math.cos(aa) * R * 0.9, bob + Math.sin(aa) * R * 0.9], 1.4 * s, tw_li(b, 0.18)); }
    for (let i = 0; i < 10; i++){ const aa = (i + 0.5) * TAU / 10 + spin; for (let q = 1; q < 4; q++) fillCircle(ctx, Math.cos(aa) * R * q * 0.24, bob + Math.sin(aa) * R * q * 0.24, 0.45 * s, tw_li(b, 0.4)); }
    fillCircle(ctx, 0, bob, 2.2 * s, tw_sh(b, 0.4)); fillCircle(ctx, 0, bob, 1.2 * s, d.pale || '#C89AE0');
    ctx.save(); ctx.beginPath(); ctx.arc(0, bob, R + 0.6 * s, 0, TAU); ctx.clip();                                         /* the band, across the top */
    tw_rect(ctx, 1.4 * s, bob - R - 1 * s, 2.6 * s, 2 * R + 2 * s, IL_DKSTEEL); tw_rect(ctx, 1.8 * s, bob - R - 1 * s, 1.8 * s, 2 * R + 2 * s, IL_STEEL);
    for (let k = -3; k <= 3; k++) fillCircle(ctx, 2.7 * s, bob + k * 2.4 * s, 0.35 * s, IL_DKSTEEL);
    ctx.restore();
    for (const sd of [-1, 1]){ fillCircle(ctx, 4.4 * s, bob + sd * 3 * s, 1.3 * s, IL_DKSTEEL); fillCircle(ctx, 4.4 * s, bob + sd * 3 * s, 0.9 * s, wind2 ? '#FFE07A' : IL_LAB); tw_rect(ctx, 3 * s, bob + sd * 3 * s - 0.4 * s, 1.4 * s, 0.8 * s, IL_STEEL); }
  },
  il_crab(ctx, e, b, dk, bob, wind, d){                                                /* Crab Tank: a broad red crab with a riveted steel plate bolted over its front, eight legs and two heavy claws */
    const s = e.r / 16, a = e.anim * 2.4, snap = e.state === 'snapwind' || e.state === 'snap';
    for (let i = 0; i < 4; i++) for (const sd of [-1, 1]){                            /* eight legs, from under the sides of the shell */
      const w = Math.sin(a + i * 1.6 + (sd > 0 ? 0 : Math.PI)) * 2.4 * s, x0 = (4 - i * 3.4) * s;
      il_leg(ctx, x0, bob + sd * 8 * s, x0 - 1 * s + w, bob + sd * 15 * s, x0 - 4 * s + w * 1.2, bob + sd * 19 * s, 2.2 * s, b, dk);
    }
    lkOV(ctx, -1 * s, bob, 11 * s, 13.6 * s, dk); lkOV(ctx, -1 * s, bob, 10.2 * s, 12.8 * s, b);                           /* the shell */
    lkOV(ctx, -2.6 * s, bob - 3 * s, 6 * s, 6 * s, tw_li(b, 0.15));
    for (const sd of [-1, 1]) for (let q = 0; q < 4; q++) il_spine(ctx, -1 * s, bob, 11.2 * s, sd * (0.9 + q * 0.42), 1.8 * s, 0.9 * s, tw_sh(b, 0.25));
    for (let q = 0; q < 7; q++) fillCircle(ctx, (-6 + (q % 3) * 3.4) * s, bob + (-6 + q * 2) * s, 0.8 * s, tw_sh(b, 0.3));
    ctx.save(); ctx.beginPath(); ctx.ellipse(-1 * s, bob, 10.2 * s, 12.8 * s, 0, -1.2, 1.2); ctx.lineTo(4 * s, bob); ctx.closePath(); ctx.clip();          /* the plate over the front of the shell */
    tw_rect(ctx, 3.4 * s, bob - 14 * s, 8 * s, 28 * s, IL_DKSTEEL); tw_rect(ctx, 4.2 * s, bob - 14 * s, 6.4 * s, 28 * s, IL_STEEL); tw_rect(ctx, 4.2 * s, bob - 14 * s, 1.4 * s, 28 * s, tw_li(IL_STEEL, 0.4));
    for (let k = -4; k <= 4; k++) fillCircle(ctx, 6 * s, bob + k * 2.8 * s, 0.45 * s, IL_DKSTEEL);
    ctx.restore();
    for (const sd of [-1, 1]) il_claw(ctx, 6 * s, bob + sd * 7 * s, 11 * s + (snap ? 3 * s : 0), bob + sd * 9.4 * s, sd * 0.35, 8.4 * s, snap ? (e.state === 'snap' ? 0 : 1) : 0.25 + 0.15 * Math.sin(a + sd), b, dk, '#2A0E08');
    for (const sd of [-1, 1]) il_stalkEye(ctx, 8.6 * s, bob + sd * 2 * s, 11.4 * s, bob + sd * 3.4 * s, 1.3 * s, b, dk);
    for (let q = -1; q <= 1; q++) fillCircle(ctx, 9.4 * s, bob + q * 1.1 * s, 0.6 * s, '#3A1A14');
  },
  il_jelly(ctx, e, b, dk, bob, wind, d){                                               /* Jelly Drifter: a violet moon-jelly with an electrode clipped to its bell; tentacles trail from the rim, sparks in the canals before it shocks */
    const s = e.r / 12, a = e.anim * 2.4, pulse = 1 + 0.08 * Math.sin(a), zap = e.state === 'zapwind', R = 9.6 * s * pulse;
    for (let k = 0; k < 9; k++){                                                       /* tentacles from the back half of the rim, trailing */
      const aa = Math.PI * 0.62 + k * Math.PI * 0.76 / 8, x0 = Math.cos(aa) * R * 0.94, y0 = bob + Math.sin(aa) * R * 0.94, pts = [x0, y0];
      for (let q = 1; q <= 6; q++) pts.push(x0 - q * 3.6 * s, y0 + Math.sin(a * 1.2 - q * 0.9 + k) * 1.6 * s * q / 3);
      tw_ln(ctx, pts, 0.9 * s, tw_li(b, 0.25)); fillCircle(ctx, pts[12], pts[13], 0.6 * s, d.pale || '#F0E4FF');
    }
    for (let k = 0; k < 4; k++){ const aa = Math.PI + (k - 1.5) * 0.3, x0 = Math.cos(aa) * R * 0.3, y0 = bob + Math.sin(aa) * R * 0.3; tw_ln(ctx, [x0, y0, x0 - 6 * s, y0 + Math.sin(a + k) * 2 * s, x0 - 12 * s, y0 + Math.sin(a + k + 1) * 3 * s], 1.8 * s, tw_li(b, 0.1)); }     /* the oral arms, from the middle */
    fillCircle(ctx, 0, bob, R + 0.8 * s, tw_sh(b, 0.3)); fillCircle(ctx, 0, bob, R, b); fillCircle(ctx, -1.2 * s, bob - 1.2 * s, R * 0.75, tw_li(b, 0.2));
    for (let k = 0; k < 16; k++){ const aa = k * TAU / 16; tw_ln(ctx, [Math.cos(aa) * 3.4 * s, bob + Math.sin(aa) * 3.4 * s, Math.cos(aa) * R * 0.95, bob + Math.sin(aa) * R * 0.95], 0.45 * s, zap ? '#FFFFFF' : tw_sh(b, 0.15)); }
    for (let k = 0; k < 4; k++){ const aa = k * TAU / 4 + 0.4; ringPath(ctx, Math.cos(aa) * 2.6 * s, bob + Math.sin(aa) * 2.6 * s, 1.8 * s, 0.9 * s, tw_sh(b, 0.3), 0.9); }
    for (let k = 0; k < 24; k++){ const aa = k * TAU / 24; fillCircle(ctx, Math.cos(aa) * R, bob + Math.sin(aa) * R, 0.55 * s, d.pale || '#F0E4FF'); }
    tw_rr(ctx, 2.6 * s, bob - 1.6 * s, 3.4 * s, 3.2 * s, 0.6 * s, IL_DKSTEEL); tw_rr(ctx, 3 * s, bob - 1.2 * s, 2.6 * s, 2.4 * s, 0.4 * s, IL_STEEL); fillCircle(ctx, 5.4 * s, bob, 0.8 * s, zap ? '#FFF6A0' : IL_LAB);    /* the electrode, clipped on top */
    if (zap) for (let k = 0; k < 5; k++){ const aa = k * TAU / 5 + a; tw_ln(ctx, [Math.cos(aa) * R * 0.5, bob + Math.sin(aa) * R * 0.5, Math.cos(aa + 0.2) * R * 0.8, bob + Math.sin(aa + 0.2) * R * 0.75, Math.cos(aa) * R * 1.05, bob + Math.sin(aa) * R * 1.05], 0.6 * s, '#FFF6C8'); }
  },
  il_brute(ctx, e, b, dk, bob, wind, d){                                               /* Barnacle Brute: a huge walrus thing crusted in barnacles, with tusks, whiskers and a lab harness */
    const s = e.r / 16, a = e.anim * 2, ram = e.state === 'ram' || e.state === 'ramwind';
    for (const sd of [-1, 1]){ const w = Math.sin(a + (sd > 0 ? 0 : Math.PI)) * 1.6 * s;                                   /* fore flippers from the shoulders, hind flippers from the hips */
      lkOV(ctx, 2.6 * s + w * 0.6, bob + sd * 14 * s, 3.4 * s, 5.6 * s, dk, sd * 0.3); lkOV(ctx, 2.6 * s + w * 0.6, bob + sd * 14 * s, 2.8 * s, 5 * s, tw_li(b, 0.05), sd * 0.3); for (let q = -1; q <= 1; q++) tw_ln(ctx, [2.6 * s + w * 0.6 + q * 1.2 * s, bob + sd * 16 * s, 2.6 * s + w * 0.6 + q * 1.6 * s, bob + sd * 19 * s], 0.5 * s, tw_sh(b, 0.3));
      tw_poly(ctx, [-13 * s, bob + sd * 4 * s, -21 * s - w, bob + sd * 9 * s, -22 * s - w, bob + sd * 3 * s, -15 * s, bob + sd * 1.2 * s], dk); tw_poly(ctx, [-13.6 * s, bob + sd * 3.8 * s, -20.4 * s - w, bob + sd * 8 * s, -21 * s - w, bob + sd * 3.4 * s, -15 * s, bob + sd * 1.8 * s], b); }
    lkOV(ctx, -3 * s, bob, 14 * s, 11 * s, dk); lkOV(ctx, -3 * s, bob, 13.2 * s, 10.2 * s, b); lkOV(ctx, -4 * s, bob - 2.6 * s, 9 * s, 5 * s, tw_li(b, 0.12));
    for (let q = 0; q < 4; q++) tw_ln(ctx, [(-12 + q * 5) * s, bob - 8 * s, (-11 + q * 5) * s, bob, (-12 + q * 5) * s, bob + 8 * s], 0.6 * s, tw_sh(b, 0.2));     /* skin folds */
    tw_rect(ctx, -1.4 * s, bob - 10.4 * s, 2.4 * s, 20.8 * s, '#2A2A2E'); tw_rect(ctx, -1 * s, bob - 10.4 * s, 1.6 * s, 20.8 * s, '#4A4A52'); fillCircle(ctx, -0.2 * s, bob, 1.4 * s, IL_STEEL); fillCircle(ctx, -0.2 * s, bob, 0.6 * s, IL_LAB);   /* the harness */
    for (const [bx, by, br] of [[-10, -4, 2.2], [-7, 3, 1.8], [-12, 2.4, 1.6], [-5, -6, 1.6], [-14, -1, 1.4], [-8, -1, 1.2], [3, 5, 1.4], [4, -5, 1.2]]){ fillCircle(ctx, bx * s, bob + by * s, br * s * 1.2, '#4A443C'); fillCircle(ctx, bx * s, bob + by * s, br * s, '#D8D0BC'); fillCircle(ctx, bx * s, bob + by * s, br * s * 0.4, '#4A443C'); }
    tw_ln(ctx, [-6 * s, bob - 9 * s, -10 * s, bob - 11 * s, -14 * s, bob - 10 * s], 1 * s, '#3A6A2A'); tw_ln(ctx, [-2 * s, bob + 9.4 * s, -6 * s, bob + 11.6 * s, -9 * s, bob + 10.6 * s], 0.8 * s, '#4A7A3A');   /* weed, draped on the back */
    const hx = 10 * s + (ram ? 1.6 * s : 0);
    lkOV(ctx, hx, bob, 7.4 * s, 7 * s, dk); lkOV(ctx, hx, bob, 6.8 * s, 6.4 * s, tw_li(b, 0.06)); lkOV(ctx, hx + 3 * s, bob, 3.4 * s, 4.8 * s, tw_li(b, 0.2));
    for (const sd of [-1, 1]){ tw_poly(ctx, [hx + 4 * s, bob + sd * 2.4 * s, hx + 15 * s, bob + sd * 3.4 * s, hx + 4.6 * s, bob + sd * 3.8 * s], '#F2ECDA'); tw_ln(ctx, [hx + 4 * s, bob + sd * 3 * s, hx + 14.6 * s, bob + sd * 3.4 * s], 0.4 * s, '#B8B098');      /* tusks, from the muzzle */
      for (let q = 0; q < 3; q++) tw_ln(ctx, [hx + 5 * s, bob + sd * (1 + q) * s, hx + 8.6 * s, bob + sd * (2 + q * 1.6) * s], 0.3 * s, '#E8E0C8');
      fillCircle(ctx, hx - 1 * s, bob + sd * 3.4 * s, 1 * s, '#14100C'); fillCircle(ctx, hx - 1.2 * s, bob + sd * 3.2 * s, 0.35 * s, '#FFFFFF'); }
  },
  il_octo(ctx, e, b, dk, bob, wind, d){                                                /* Ink Spitter: an octopus, mantle behind, eight curling arms with suckers, an ink sac glowing dark through the skin */
    const s = e.r / 13, a = e.anim * 2.2, lob = e.state === 'lobwind';
    for (let k = 0; k < 8; k++){                                                       /* the arms, all from the ring under the head */
      const aa = (k - 3.5) * 0.42 + (k < 4 ? -0.3 : 0.3), x0 = 2 * s + Math.cos(aa) * 3 * s, y0 = bob + Math.sin(aa) * 3 * s, pts = [x0, y0];
      let px = x0, py = y0, pa = aa;
      for (let q = 1; q <= 5; q++){ pa += Math.sin(a + k * 0.9 + q * 0.6) * 0.32 + (k < 4 ? -0.08 : 0.08); px += Math.cos(pa) * 3 * s; py += Math.sin(pa) * 3 * s; pts.push(px, py); }
      il_body(ctx, pts, 2.6 * s, 0.9 * s, b, dk);
      for (let q = 1; q < 5; q++) fillCircle(ctx, pts[q * 2], pts[q * 2 + 1], (0.55 - q * 0.07) * s, d.pale || '#F0B8D8');
    }
    lkOV(ctx, -5 * s, bob, 9 * s, 7.4 * s, dk); lkOV(ctx, -5 * s, bob, 8.3 * s, 6.7 * s, b);                                /* the mantle */
    lkOV(ctx, -6 * s, bob - 1.8 * s, 5 * s, 3 * s, tw_li(b, 0.18)); fillCircle(ctx, -6 * s, bob + 1 * s, 2.8 * s, lob ? '#1A0A1A' : '#3A1A34');
    for (let q = 0; q < 8; q++) fillCircle(ctx, (-11 + q * 1.6) * s, bob + Math.sin(q * 1.7) * 4 * s, 0.6 * s, tw_sh(b, 0.25));
    lkOV(ctx, 2 * s, bob, 4.6 * s, 5.6 * s, dk); lkOV(ctx, 2 * s, bob, 4 * s, 5 * s, tw_li(b, 0.06));                     /* the head */
    for (const sd of [-1, 1]){ fillCircle(ctx, 2.6 * s, bob + sd * 3.4 * s, 1.7 * s, dk); fillCircle(ctx, 2.6 * s, bob + sd * 3.4 * s, 1.4 * s, '#F2E6A0'); tw_rect(ctx, 2 * s, bob + sd * 3.4 * s - 0.35 * s, 1.4 * s, 0.7 * s, '#14100C'); }
    tw_ln(ctx, [-1 * s, bob + 4.6 * s, -3 * s, bob + 7 * s + (lob ? 1 * s : 0)], 1.4 * s, tw_sh(b, 0.2));                  /* the siphon */
    il_tag(ctx, -11.4 * s, bob - 2 * s, s * 0.8, 0.5);
  },
  il_mantis(ctx, e, b, dk, bob, wind, d){                                              /* Mantis Boxer: a banded green mantis shrimp with a rainbow back, eyes on stalks and two clubs folded ready to punch */
    const s = e.r / 12, a = e.anim * 3, punch = e.state === 'punch', wind2 = e.state === 'punchwind';
    for (let i = 0; i < 3; i++) for (const sd of [-1, 1]){ const w = Math.sin(a + i * 2 + (sd > 0 ? 0 : 1.6)) * 1.6 * s, x0 = (-1 - i * 2.4) * s; il_leg(ctx, x0, bob + sd * 2.6 * s, x0 + 0.8 * s + w, bob + sd * 6 * s, x0 + w, bob + sd * 7.8 * s, 1 * s, tw_li(b, 0.1), dk); }
    const seg = [[4, 4.2], [1.4, 4.6], [-1.4, 4.6], [-4.2, 4.4], [-7, 4], [-9.6, 3.4], [-12, 2.8]], rb = ['#3AA87A', '#3A9AC8', '#7A6AD8', '#C85AA8', '#E88A4A', '#E8C84A', '#3AA87A'];
    for (let i = seg.length - 1; i >= 0; i--){ lkOV(ctx, seg[i][0] * s, bob, 1.9 * s, seg[i][1] * s, dk); lkOV(ctx, seg[i][0] * s, bob, 1.6 * s, seg[i][1] * s - 0.6 * s, i === 0 ? b : blendHex(b, rb[i], 0.35)); tw_rect(ctx, seg[i][0] * s - 0.3 * s, bob - seg[i][1] * s + 0.8 * s, 0.6 * s, 2 * seg[i][1] * s - 1.6 * s, tw_li(rb[i], 0.2)); }
    for (const sd of [-1, 1]) tw_poly(ctx, [-13 * s, bob + sd * 0.4 * s, -17 * s, bob + sd * 4 * s, -15 * s, bob + sd * 0.4 * s], tw_li(b, 0.15));
    fillCircle(ctx, -16.2 * s, bob, 1.6 * s, '#3A9AC8'); fillCircle(ctx, -16.2 * s, bob, 0.8 * s, '#E8C84A');               /* the tail fan's eyespot */
    const reach = punch ? 9 * s : wind2 ? -1.6 * s : 2 * s;
    for (const sd of [-1, 1]){                                                         /* the clubs, on folded arms from under the head */
      const ex = 9 * s + reach, ey = bob + sd * (punch ? 2.6 : 4.6) * s;
      tw_ln(ctx, [5 * s, bob + sd * 2.4 * s, 6.4 * s + reach * 0.4, bob + sd * 5.4 * s, ex, ey], 2.2 * s, dk); tw_ln(ctx, [5 * s, bob + sd * 2.4 * s, 6.4 * s + reach * 0.4, bob + sd * 5.4 * s, ex, ey], 1.5 * s, '#E86A5A');
      fillCircle(ctx, ex, ey, 2 * s, dk); fillCircle(ctx, ex, ey, 1.6 * s, '#F08A6A'); fillCircle(ctx, ex - 0.4 * s, ey - 0.4 * s, 0.6 * s, '#FFD8C8');
    }
    lkOV(ctx, 6.6 * s, bob, 2.6 * s, 3.4 * s, dk); lkOV(ctx, 6.6 * s, bob, 2.2 * s, 3 * s, b);
    for (const sd of [-1, 1]){ tw_ln(ctx, [7.6 * s, bob + sd * 1 * s, 10.4 * s, bob + sd * 2.4 * s], 0.9 * s, dk); lkOV(ctx, 11 * s, bob + sd * 2.6 * s, 1.6 * s, 1.1 * s, dk); lkOV(ctx, 11 * s, bob + sd * 2.6 * s, 1.3 * s, 0.85 * s, '#3A9AC8'); tw_rect(ctx, 10.8 * s, bob + sd * 2.6 * s - 0.8 * s, 0.4 * s, 1.6 * s, '#E8C84A'); }
    for (const sd of [-1, 1]) tw_ln(ctx, [8 * s, bob + sd * 0.4 * s, 13 * s, bob + sd * 1 * s, 17 * s, bob + sd * (0.2 + Math.sin(a + sd) * 1.4) * s], 0.35 * s, tw_li(b, 0.3));
    il_tag(ctx, -4.2 * s, bob - 4 * s, s * 0.7, 0);
  },
  il_snake(ctx, e, b, dk, bob, wind, d){                                               /* Sea Snake: a cream and black banded sea krait with a paddle tail and a flicking tongue */
    const s = e.r / 11, a = e.anim * 3, strike = e.state === 'strike', L = 34;
    const pts = []; for (let i = 0; i <= 12; i++){ const u = i / 12, x = 5 * s - u * L * s, y = bob + Math.sin(a - u * 5) * (strike ? 1.6 : 4.4) * s * Math.min(1, u * 2); pts.push(x, y); }
    il_body(ctx, pts, 4.2 * s, 2.6 * s, b, dk);
    for (let i = 1; i < 12; i += 2) tw_ln(ctx, [pts[i * 2], pts[i * 2 + 1], pts[i * 2 + 2], pts[i * 2 + 3]], (4.2 - (i / 12) * 1.6) * s * 0.8, '#1E1E2A');        /* the bands */
    const tx = pts[24], ty = pts[25];
    tw_poly(ctx, [tx + 1.4 * s, ty - 1.4 * s, tx - 4.4 * s, ty - 3 * s + Math.sin(a) * 1 * s, tx - 4.4 * s, ty + 3 * s + Math.sin(a) * 1 * s, tx + 1.4 * s, ty + 1.4 * s], '#1E1E2A');   /* the paddle tail */
    lkOV(ctx, 7 * s, bob, 3.6 * s, 2.8 * s, dk); lkOV(ctx, 7 * s, bob, 3.1 * s, 2.3 * s, b); lkOV(ctx, 6 * s, bob, 1.6 * s, 2.4 * s, '#1E1E2A');
    for (const sd of [-1, 1]){ fillCircle(ctx, 8.4 * s, bob + sd * 1.4 * s, 0.7 * s, '#14141C'); fillCircle(ctx, 8.2 * s, bob + sd * 1.2 * s, 0.25 * s, '#FFFFFF'); }
    if (Math.sin(a * 3) > 0 || strike) for (const sd of [-1, 1]) tw_ln(ctx, [10 * s, bob, 12.4 * s, bob + sd * 0.2 * s, 13.6 * s, bob + sd * 0.9 * s], 0.3 * s, '#E8404A');   /* the tongue, from the mouth */
    il_tag(ctx, pts[8], pts[9] - 3 * s, s * 0.6, 0);
  },
  il_puffer(ctx, e, b, dk, bob, wind, d){                                              /* Puffer Bomber: a spotted yellow pufferfish with a tag clipped to its fin; when it swells it is a ball of spines */
    const s = e.r / 12, a = e.anim * 3, puff = e.state === 'puff', sw = puff ? 1 + 0.06 * Math.sin(a * 6) : 1, R = (puff ? 10.4 : 7.4) * s * sw;
    tw_poly(ctx, [-R * 0.9, bob, -R - 6 * s, bob - 4 * s + Math.sin(a) * 1.4 * s, -R - 4.6 * s, bob, -R - 6 * s, bob + 4 * s + Math.sin(a) * 1.4 * s], tw_sh(b, 0.1));   /* the tail fin, on the back of the body */
    for (const sd of [-1, 1]){ const fw = Math.sin(a * 2 + sd) * 1.2 * s; tw_poly(ctx, [1 * s, bob + sd * R * 0.82, -2.4 * s, bob + sd * (R + 3.4 * s + fw), 1.6 * s, bob + sd * (R + 2 * s + fw)], tw_li(b, 0.15)); }   /* side fins */
    if (puff) for (let i = 0; i < 28; i++){ const aa = i * TAU / 28; il_spine(ctx, 0, bob, R, aa, 3 * s, 0.7 * s, '#C8A040', '#FFF8D8'); }
    lkOV(ctx, 0, bob, puff ? R : R * 1.15, R, dk); lkOV(ctx, 0, bob, (puff ? R : R * 1.15) - 0.7 * s, R - 0.7 * s, b); lkOV(ctx, -1 * s, bob - R * 0.3, R * 0.6, R * 0.4, tw_li(b, 0.3));
    for (let q = 0; q < 9; q++){ const aa = q * 2.3, rr = (0.3 + (q % 3) * 0.2) * R; fillCircle(ctx, Math.cos(aa) * rr - 1 * s, bob + Math.sin(aa) * rr, 0.75 * s, tw_sh(b, 0.45)); }
    if (!puff) for (let i = 0; i < 10; i++){ const aa = i * TAU / 10 + 0.3; il_spine(ctx, 0, bob, R * 0.98, aa, 1.2 * s, 0.5 * s, tw_sh(b, 0.25)); }
    for (const sd of [-1, 1]){ fillCircle(ctx, R * 0.55, bob + sd * R * 0.44, 1.9 * s, dk); fillCircle(ctx, R * 0.55, bob + sd * R * 0.44, 1.5 * s, '#F8F8F0'); fillCircle(ctx, R * 0.62, bob + sd * R * 0.44, 0.8 * s, '#14141C'); }
    tw_rr(ctx, R * 0.9, bob - 1.2 * s, 2 * s, 2.4 * s, 0.8 * s, '#C88A5A'); tw_rect(ctx, R * 0.9 + 1 * s, bob - 1.2 * s, 0.4 * s, 2.4 * s, '#5A3A1E');   /* the beak */
    il_tag(ctx, 1 * s, bob + R * 0.86 + 1.4 * s, s * 0.7, 0.3);
  },
  il_anemone(ctx, e, b, dk, bob, wind, d){                                             /* Anemone Nurse: a pink anemone on a creeping foot, a ring of glowing tentacles round its mouth, a clownfish living in it */
    const s = e.r / 13, a = e.anim * 2, heal = e.state === 'heal', R = 7.4 * s;
    fillCircle(ctx, 0, bob, R + 3.4 * s, tw_sh(b, 0.45)); fillCircle(ctx, 0, bob, R + 2.6 * s, tw_sh(b, 0.25));                 /* the foot and the column */
    for (let i = 0; i < 12; i++){ const aa = i * TAU / 12; fillCircle(ctx, Math.cos(aa) * (R + 2.8 * s), bob + Math.sin(aa) * (R + 2.8 * s), 1 * s, tw_sh(b, 0.35)); }
    for (let ring = 0; ring < 2; ring++) for (let i = 0; i < 18; i++){                 /* tentacles, rooted on the disc, waving */
      const aa = i * TAU / 18 + ring * 0.17, r0 = R * (0.55 + ring * 0.3), L = (5.4 - ring * 1.4) * s * (heal ? 1.25 : 1), sw2 = Math.sin(a + i * 0.7 + ring) * 0.35;
      const x0 = Math.cos(aa) * r0, y0 = bob + Math.sin(aa) * r0, mx = x0 + Math.cos(aa + sw2) * L * 0.6, my = y0 + Math.sin(aa + sw2) * L * 0.6, ex = x0 + Math.cos(aa + sw2 * 1.6) * L, ey = y0 + Math.sin(aa + sw2 * 1.6) * L;
      tw_ln(ctx, [x0, y0, mx, my, ex, ey], (1.8 - ring * 0.3) * s, ring ? tw_li(b, 0.15) : b); fillCircle(ctx, ex, ey, (1 - ring * 0.15) * s, heal ? '#FFFFFF' : (d.pale || '#FFC8D8'));
    }
    fillCircle(ctx, 0, bob, R * 0.5, tw_sh(b, 0.2)); fillCircle(ctx, 0, bob, R * 0.3, '#5A1A2A'); ringPath(ctx, 0, bob, R * 0.42, 0.6 * s, tw_li(b, 0.3), 0.9);
    const ca = a * 0.6, cx = Math.cos(ca) * R * 0.75, cy = bob + Math.sin(ca) * R * 0.75;                              /* the clownfish, nosing in the tentacles */
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(ca + Math.PI / 2);
    tw_poly(ctx, [-3 * s, 0, -4.6 * s, -1.4 * s, -4.6 * s, 1.4 * s], '#E8682A'); lkOV(ctx, 0, 0, 3.4 * s, 1.7 * s, '#14100C'); lkOV(ctx, 0, 0, 3 * s, 1.4 * s, '#F27A2A');
    for (const x of [-1.6, 0.6]) tw_rect(ctx, x * s, -1.4 * s, 0.7 * s, 2.8 * s, '#FFFFFF'); fillCircle(ctx, 2.2 * s, -0.5 * s, 0.4 * s, '#14100C');
    ctx.restore();
    tw_rr(ctx, -R - 3.6 * s, bob - 1.4 * s, 3.4 * s, 2.8 * s, 0.6 * s, IL_DKSTEEL); fillCircle(ctx, -R - 2 * s, bob, 0.8 * s, IL_LAB);      /* a sensor pad stuck on the column */
  },

  /* ---------------------------------------------------------------- the bosses */
  il_kingclaw(ctx, e, b, dk, bob, wind, d){                                            /* King Claw: a giant spiked crab, scarred and crusted, one crusher claw bigger than she is, steel bolted to its shell and green vials on a harness */
    const s = e.r / 62, a = e.anim * 1.6, st = e.state, glow = e.glow || 0, swing = st === 'sweepwind' ? -0.5 : st === 'sweep' ? 0.6 : 0, slam = st === 'slamwind';
    csGlow(ctx, 0, bob, 90 * s, '#F8B898', 0.05 + 0.12 * glow);
    for (let i = 0; i < 4; i++) for (const sd of [-1, 1]){ const w = Math.sin(a + i * 1.5 + (sd > 0 ? 0 : Math.PI)) * 8 * s, x0 = (14 - i * 13) * s;
      il_leg(ctx, x0, bob + sd * 30 * s, x0 - 4 * s + w, bob + sd * 58 * s, x0 - 16 * s + w * 1.3, bob + sd * 74 * s, 8 * s, b, dk);
      for (let q = 0; q < 3; q++) il_spine(ctx, x0 - 2 * s + w * 0.5 * (q / 2), bob + sd * (38 + q * 7) * s, 2 * s, sd * 1.6, 4 * s, 1.6 * s, tw_li(b, 0.25)); }
    lkOV(ctx, -4 * s, bob, 42 * s, 50 * s, dk); lkOV(ctx, -4 * s, bob, 39 * s, 47 * s, b);
    lkOV(ctx, -10 * s, bob - 10 * s, 24 * s, 22 * s, tw_li(b, 0.14));
    for (let q = 0; q < 12; q++){ const aa = Math.PI * 0.55 + q * Math.PI * 0.9 / 11; il_spine(ctx, -4 * s, bob, 41 * s, aa, 9 * s, 3 * s, tw_sh(b, 0.2), tw_li(b, 0.4)); il_spine(ctx, -4 * s, bob, 41 * s, -aa, 9 * s, 3 * s, tw_sh(b, 0.2), tw_li(b, 0.4)); }
    for (const [bx, by, br] of [[-24, -18, 5], [-18, 22, 4], [-30, 6, 4.4], [-8, 30, 3.4], [-34, -10, 3]]){ fillCircle(ctx, bx * s, bob + by * s, br * s * 1.2, '#4A443C'); fillCircle(ctx, bx * s, bob + by * s, br * s, '#D8D0BC'); fillCircle(ctx, bx * s, bob + by * s, br * s * 0.4, '#4A443C'); }
    tw_ln(ctx, [-30 * s, bob - 30 * s, -16 * s, bob - 20 * s, -6 * s, bob - 26 * s], 2 * s, tw_sh(b, 0.45)); tw_ln(ctx, [-20 * s, bob + 14 * s, -10 * s, bob + 4 * s], 1.6 * s, tw_sh(b, 0.45));   /* scars */
    for (const [px, py, pw, ph] of [[2, -24, 18, 14], [2, 10, 18, 14], [-18, -6, 14, 12]]){ tw_rr(ctx, px * s, bob + py * s, pw * s, ph * s, 2 * s, IL_DKSTEEL); tw_rr(ctx, (px + 1) * s, bob + (py + 1) * s, (pw - 2) * s, (ph - 2) * s, 1.6 * s, IL_STEEL);
      for (const [qx, qy] of [[2, 2], [pw - 2, 2], [2, ph - 2], [pw - 2, ph - 2]]) fillCircle(ctx, (px + qx) * s, bob + (py + qy) * s, 1.2 * s, IL_DKSTEEL); }
    tw_ln(ctx, [-36 * s, bob - 14 * s, -36 * s, bob + 14 * s], 4 * s, '#2A2A2E');                                         /* the harness strap and its vials */
    for (let k = -1; k <= 1; k++){ tw_rr(ctx, -40 * s, bob + (k * 10 - 3) * s, 8 * s, 6 * s, 2 * s, IL_DKSTEEL); tw_rr(ctx, -39 * s, bob + (k * 10 - 2) * s, 6 * s, 4 * s, 1.4 * s, IL_LAB); }
    il_claw(ctx, 22 * s, bob + 30 * s, 50 * s + swing * 10 * s, bob + 46 * s + swing * 18 * s, 0.4 + swing, 50 * s, st === 'sweep' ? 0 : slam ? 0.2 : 0.35 + 0.1 * Math.sin(a), b, dk, '#1A0604');       /* the crusher */
    il_claw(ctx, 22 * s, bob - 26 * s, 42 * s, bob - 34 * s, -0.3, 24 * s, st === 'bubble' ? 0.9 : 0.4 + 0.2 * Math.sin(a * 1.3), b, dk, '#1A0604');
    for (const sd of [-1, 1]) il_stalkEye(ctx, 28 * s, bob + sd * 8 * s, 40 * s, bob + sd * (12 + Math.sin(a + sd) * 2) * s, 4 * s, b, dk, glow > 0.3 ? '#F8B898' : '#1A1A22');
    for (let k = -2; k <= 2; k++) tw_ln(ctx, [32 * s, bob + k * 3 * s, 38 * s, bob + k * 3.6 * s], 1.6 * s, tw_sh(b, 0.3));     /* mouthparts */
    if (st === 'bubble') for (let k = 0; k < 4; k++) ringPath(ctx, (40 + k * 6) * s, bob + Math.sin(a * 4 + k) * 4 * s, (3 + k) * s, 1.2, '#C8FFF4', 0.7);
    if (slam) ringPath(ctx, 0, bob, 70 * s, 4, '#F8B898', 0.5);
    if (st === 'roar') ringPath(ctx, 0, bob, 90 * s, 5, '#FFE4D8', 0.5);
  },
  il_stormjelly(ctx, e, b, dk, bob, wind, d){                                          /* The Stormjelly: a jellyfish as big as a house, lightning in its canals, a forest of trailing tentacles and frilled oral arms, a lab buoy chained to its crown */
    const s = e.r / 64, a = e.anim * 1.4, st = e.state, glow = e.glow || 0, zap = st === 'rainwind' || st === 'ringwind', pulse = 1 + 0.06 * Math.sin(a * 1.6), R = 46 * s * pulse;
    csGlow(ctx, 0, bob, 110 * s, '#C8D8FF', 0.1 + 0.15 * glow + (zap ? 0.15 : 0));
    for (let k = 0; k < 16; k++){                                                      /* tentacles from the back half of the rim */
      const aa = Math.PI * 0.55 + k * Math.PI * 0.9 / 15, x0 = Math.cos(aa) * R * 0.96, y0 = bob + Math.sin(aa) * R * 0.96, pts = [x0, y0];
      for (let q = 1; q <= 9; q++) pts.push(x0 - q * 9 * s, y0 + Math.sin(a * 1.3 - q * 0.7 + k * 0.8) * 3 * s * q / 3);
      tw_ln(ctx, pts, 2.2 * s, tw_li(b, 0.3)); for (let q = 2; q < 9; q += 2) fillCircle(ctx, pts[q * 2], pts[q * 2 + 1], 1.4 * s, '#E8F0FF');
    }
    for (let k = 0; k < 4; k++){ const y0 = bob + (k - 1.5) * 8 * s, pts = [-6 * s, y0]; for (let q = 1; q <= 6; q++) pts.push(-6 * s - q * 11 * s, y0 + Math.sin(a + k * 1.4 - q * 0.6) * 6 * s); tw_ln(ctx, pts, 6 * s, tw_sh(b, 0.1)); tw_ln(ctx, pts, 3.6 * s, tw_li(b, 0.15)); }   /* the oral arms */
    fillCircle(ctx, 0, bob, R + 3 * s, tw_sh(b, 0.35)); fillCircle(ctx, 0, bob, R, b); fillCircle(ctx, -6 * s, bob - 6 * s, R * 0.72, tw_li(b, 0.2));
    for (let k = 0; k < 24; k++){ const aa = k * TAU / 24; tw_ln(ctx, [Math.cos(aa) * 14 * s, bob + Math.sin(aa) * 14 * s, Math.cos(aa + 0.05) * R * 0.6, bob + Math.sin(aa + 0.05) * R * 0.6, Math.cos(aa) * R * 0.96, bob + Math.sin(aa) * R * 0.96], 1.2 * s, zap || glow > 0.3 ? '#FFFFFF' : tw_sh(b, 0.18)); }
    for (let k = 0; k < 4; k++){ const aa = k * TAU / 4 + 0.4; ringPath(ctx, Math.cos(aa) * 12 * s, bob + Math.sin(aa) * 12 * s, 8 * s, 3 * s, tw_sh(b, 0.35), 0.9); }
    for (let k = 0; k < 40; k++){ const aa = k * TAU / 40; fillCircle(ctx, Math.cos(aa) * R, bob + Math.sin(aa) * R, 1.6 * s, '#E8F0FF'); }
    if (zap || glow > 0.5) for (let k = 0; k < 6; k++){ const aa = k * TAU / 6 + a * 0.7; tw_ln(ctx, [Math.cos(aa) * 10 * s, bob + Math.sin(aa) * 10 * s, Math.cos(aa + 0.25) * R * 0.5, bob + Math.sin(aa + 0.25) * R * 0.45, Math.cos(aa - 0.1) * R * 0.8, bob + Math.sin(aa - 0.1) * R * 0.8, Math.cos(aa) * R * 1.1, bob + Math.sin(aa) * R * 1.1], 1.6 * s, '#FFF6C8'); }
    tw_ln(ctx, [0, bob, 8 * s, bob - 4 * s, 16 * s, bob], 1.4 * s, IL_DKSTEEL);                                             /* the buoy, chained to the crown */
    fillCircle(ctx, 18 * s, bob, 7 * s, IL_DKSTEEL); fillCircle(ctx, 18 * s, bob, 6 * s, '#E8682A'); tw_rect(ctx, 12 * s, bob - 1.4 * s, 12 * s, 2.8 * s, '#F2EEE0'); fillCircle(ctx, 18 * s, bob, 2 * s, zap ? '#FFF6A0' : IL_LAB);
    if (st === 'roar') ringPath(ctx, 0, bob, 92 * s, 5, '#E8F0FF', 0.5);
  },
  il_hammer(ctx, e, b, dk, bob, wind, d){                                              /* Old Hammerhead: a scarred hammerhead with a steel brace on its jaw and a tracking tag in its dorsal fin; the body swings as it swims */
    const s = e.r / 64, a = e.anim * 2.2, st = e.state, glow = e.glow || 0, chg = st === 'charge', bite = st === 'bitewind';
    csGlow(ctx, 0, bob, 90 * s, '#D8E4EA', 0.04 + 0.1 * glow);
    const sw = Math.sin(a) * (chg ? 4 : 9) * s, pts = [];
    for (let i = 0; i <= 8; i++){ const u = i / 8; pts.push(22 * s - u * 128 * s, bob + Math.sin(a - u * 2.6) * u * (chg ? 6 : 14) * s); }
    for (const sd of [-1, 1]) tw_poly(ctx, [pts[2] + 8 * s, pts[3] + sd * 12 * s, pts[2] - 24 * s, pts[3] + sd * 46 * s, pts[2] - 14 * s, pts[3] + sd * 46 * s, pts[2] - 10 * s, pts[3] + sd * 12 * s], tw_sh(b, 0.12));   /* pectoral fins, from the shoulders */
    for (const sd of [-1, 1]) tw_poly(ctx, [pts[10], pts[11] + sd * 8 * s, pts[10] - 16 * s, pts[11] + sd * 20 * s, pts[10] - 10 * s, pts[11] + sd * 6 * s], tw_sh(b, 0.15));   /* pelvic fins */
    il_body(ctx, pts, 34 * s, 8 * s, b, dk);
    tw_ln(ctx, pts.slice(0, 14), 10 * s, tw_li(b, 0.15));
    const tx = pts[16], ty = pts[17];
    tw_poly(ctx, [tx + 4 * s, ty - 4 * s, tx - 30 * s, ty - 24 * s + sw * 0.4, tx - 18 * s, ty, tx - 24 * s, ty + 16 * s + sw * 0.4, tx + 4 * s, ty + 4 * s], tw_sh(b, 0.08));   /* the tail, on the end of the body */
    tw_poly(ctx, [pts[4] + 10 * s, pts[5], pts[4] - 18 * s, pts[5] - 4 * s, pts[4] - 20 * s, pts[5] + 4 * s], tw_sh(b, 0.3));   /* the dorsal fin (seen from above: a dark blade down the back) */
    tw_rr(ctx, pts[4] - 12 * s, pts[5] - 7 * s, 8 * s, 5 * s, 1 * s, '#E8682A'); fillCircle(ctx, pts[4] - 8 * s, pts[5] - 4.6 * s, 1.2 * s, IL_LAB);
    tw_ln(ctx, [-30 * s, bob - 10 * s, -12 * s, bob - 4 * s], 1.6 * s, tw_sh(b, 0.45)); tw_ln(ctx, [-40 * s, bob + 8 * s, -26 * s, bob + 12 * s, -18 * s, bob + 6 * s], 1.4 * s, tw_sh(b, 0.45));   /* scars */
    for (let k = 0; k < 5; k++) for (const sd of [-1, 1]) tw_ln(ctx, [(8 - k * 4) * s, bob + sd * 13 * s, (6 - k * 4) * s, bob + sd * 17 * s], 1.2 * s, tw_sh(b, 0.35));      /* gill slits */
    tw_poly(ctx, [12 * s, bob - 16 * s, 30 * s, bob - 46 * s, 46 * s, bob - 44 * s, 44 * s, bob, 46 * s, bob + 44 * s, 30 * s, bob + 46 * s, 12 * s, bob + 16 * s], dk);     /* the hammer */
    tw_poly(ctx, [14 * s, bob - 15 * s, 31 * s, bob - 44 * s, 44 * s, bob - 42 * s, 42 * s, bob, 44 * s, bob + 42 * s, 31 * s, bob + 44 * s, 14 * s, bob + 15 * s], b);
    tw_poly(ctx, [22 * s, bob - 10 * s, 37 * s, bob - 36 * s, 40 * s, bob - 34 * s, 36 * s, bob - 4 * s], tw_li(b, 0.18));
    for (const sd of [-1, 1]){ fillCircle(ctx, 41 * s, bob + sd * 39 * s, 4 * s, dk); fillCircle(ctx, 41 * s, bob + sd * 39 * s, 3 * s, glow > 0.3 ? '#FF6A4A' : '#E8E0A0'); fillCircle(ctx, 41.6 * s, bob + sd * 39 * s, 1.4 * s, '#14141C'); }
    const jaw = bite ? 10 * s : 3 * s;
    tw_poly(ctx, [36 * s, bob - jaw, 44 * s, bob - jaw * 0.6, 44 * s, bob + jaw * 0.6, 36 * s, bob + jaw], '#3A1418');
    for (let k = 0; k < 5; k++) for (const sd of [-1, 1]) tw_poly(ctx, [36.6 * s + k * 1.4 * s, bob + sd * jaw * (1 - k * 0.12), 37.3 * s + k * 1.4 * s, bob + sd * (jaw - 2.6 * s), 38 * s + k * 1.4 * s, bob + sd * jaw * (1 - k * 0.12)], '#F2EEE0');
    tw_ln(ctx, [30 * s, bob - 14 * s, 38 * s, bob - 10 * s, 38 * s, bob + 10 * s, 30 * s, bob + 14 * s], 2.4 * s, IL_DKSTEEL); tw_ln(ctx, [30 * s, bob - 14 * s, 38 * s, bob - 10 * s, 38 * s, bob + 10 * s, 30 * s, bob + 14 * s], 1.2 * s, IL_STEEL);   /* the jaw brace */
    if (bite) ringPath(ctx, 0, bob, 80 * s, 4, '#FFFFFF', 0.5);
    if (st === 'roar') ringPath(ctx, 0, bob, 90 * s, 5, '#E8F4FA', 0.5);
  },
  il_leviathan(ctx, e, b, dk, bob, wind, d){                                           /* The Leviathan Eel: a green-black eel many times her length; its body follows where its head has been, glowing spots down its flanks, steel collars every few metres */
    const s = e.r / 58, st = e.state, glow = e.glow || 0, coil = st === 'coil', a = e.anim * 2;
    csGlow(ctx, 0, bob, 90 * s, '#8AF0D8', 0.05 + 0.12 * glow);
    const tr = e.trail || [], ca = Math.cos(-(e.ang || 0)), sa = Math.sin(-(e.ang || 0)), pts = [8 * s, bob];
    for (let i = 0; i < tr.length; i++){ const dx = tr[i][0] - e.x, dy = tr[i][1] - e.y; pts.push(dx * ca - dy * sa, dy * ca + dx * sa + bob); }
    if (pts.length < 6) for (let i = 1; i <= 14; i++) pts.push(8 * s - i * 22 * s, bob + Math.sin(a - i * 0.5) * 10 * s);
    il_body(ctx, pts, 26 * s, 6 * s, b, dk);
    tw_ln(ctx, pts, 8 * s, tw_li(b, 0.1));
    const n = pts.length / 2 - 1;
    for (let i = 1; i < n; i++){ const px = pts[i * 2], py = pts[i * 2 + 1], qx = pts[i * 2 + 2], qy = pts[i * 2 + 3], na = Math.atan2(qy - py, qx - px) + Math.PI / 2, w = (26 - 20 * i / n) * s * 0.42;
      for (const sd of [-1, 1]) fillCircle(ctx, px + Math.cos(na) * w * sd, py + Math.sin(na) * w * sd, 2.2 * s, glow > 0.2 || i % 2 ? '#8AF0D8' : tw_li(b, 0.3));
      if (i % 5 === 2){ tw_ln(ctx, [px + Math.cos(na) * w * 1.25, py + Math.sin(na) * w * 1.25, px - Math.cos(na) * w * 1.25, py - Math.sin(na) * w * 1.25], 5 * s, IL_DKSTEEL); tw_ln(ctx, [px + Math.cos(na) * w * 1.15, py + Math.sin(na) * w * 1.15, px - Math.cos(na) * w * 1.15, py - Math.sin(na) * w * 1.15], 3 * s, IL_STEEL); }
    }
    const lx = pts[n * 2], ly = pts[n * 2 + 1], la = Math.atan2(ly - pts[n * 2 - 1], lx - pts[n * 2 - 2]);
    tw_poly(ctx, [lx - Math.sin(la) * 6 * s, ly + Math.cos(la) * 6 * s, lx + Math.cos(la) * 20 * s, ly + Math.sin(la) * 20 * s, lx + Math.sin(la) * 6 * s, ly - Math.cos(la) * 6 * s], tw_sh(b, 0.1));   /* the tail tip */
    for (const sd of [-1, 1]) tw_poly(ctx, [-4 * s, bob + sd * 10 * s, -18 * s, bob + sd * 26 * s + Math.sin(a * 2) * 3 * s, -10 * s, bob + sd * 11 * s], tw_li(b, 0.2));   /* the frills behind the head */
    const jaw = st === 'lunge' || st === 'lungewind' ? 9 * s : coil ? 6 * s : 2.4 * s;
    lkOV(ctx, 16 * s, bob, 22 * s, 17 * s, dk); lkOV(ctx, 16 * s, bob, 20 * s, 15 * s, b); lkOV(ctx, 12 * s, bob - 5 * s, 11 * s, 5 * s, tw_li(b, 0.2));
    tw_poly(ctx, [26 * s, bob - jaw, 40 * s, bob - jaw * 0.5, 40 * s, bob + jaw * 0.5, 26 * s, bob + jaw], '#2A0A10');
    for (let k = 0; k < 6; k++) for (const sd of [-1, 1]) tw_poly(ctx, [27 * s + k * 2.2 * s, bob + sd * jaw * (1 - k * 0.1), 28 * s + k * 2.2 * s, bob + sd * (jaw - 3.4 * s), 29 * s + k * 2.2 * s, bob + sd * jaw * (1 - k * 0.1)], '#F2EEE0');
    for (const sd of [-1, 1]){ fillCircle(ctx, 22 * s, bob + sd * 8 * s, 3.6 * s, '#06140E'); fillCircle(ctx, 22 * s, bob + sd * 8 * s, 2.6 * s, '#8AF0D8'); fillCircle(ctx, 21.4 * s, bob + sd * 7.4 * s, 0.9 * s, '#FFFFFF'); }
    if (coil) ringPath(ctx, 0, bob, 70 * s, 4, '#8AF0D8', 0.5);
    if (st === 'roar') ringPath(ctx, 0, bob, 90 * s, 5, '#D8FFF4', 0.5);
  },
  il_zero(ctx, e, b, dk, bob, wind, d){                                                /* Specimen Zero: the first thing the lab made, a kraken with three eyes and a parrot beak, green veins, cables still plugged into its mantle from the tank it broke */
    const s = e.r / 70, a = e.anim * 1.2, st = e.state, ph = e.phase || 1, glow = e.glow || 0, beat = 0.6 + 0.4 * Math.sin(e.anim * (2 + ph));
    csGlow(ctx, 0, bob, 120 * s, '#C8F0A8', 0.06 + 0.16 * glow + 0.05 * beat);
    for (let k = 0; k < 8; k++){                                                       /* eight arms, from the ring under the head, curling out and back */
      const aa = (k - 3.5) * 0.5 + (k < 4 ? -0.4 : 0.4), x0 = 18 * s + Math.cos(aa) * 14 * s, y0 = bob + Math.sin(aa) * 14 * s;
      ilTentacle(ctx, x0, y0, aa + Math.sin(a + k) * 0.25 - (k < 4 ? 0.3 : -0.3), (70 + (k % 3) * 12) * s, 16 * s, b, d.pale || '#C8F0A8');
    }
    for (let q = 0; q < 3; q++){ const y0 = bob + (q - 1) * 16 * s, pts = [-46 * s, y0]; for (let i = 1; i <= 5; i++) pts.push(-46 * s - i * 12 * s, y0 + Math.sin(a + q * 2 - i * 0.6) * 6 * s + (q - 1) * i * 4 * s);    /* the cables, from sockets in the mantle */
      tw_ln(ctx, pts, 5 * s, '#14181C'); tw_ln(ctx, pts, 3 * s, q === 1 ? '#2A6A5A' : '#3A3A44'); const ex = pts[10], ey = pts[11]; tw_rr(ctx, ex - 6 * s, ey - 4 * s, 8 * s, 8 * s, 1.6 * s, IL_DKSTEEL); tw_rect(ctx, ex - 10 * s, ey - 1.4 * s, 4 * s, 2.8 * s, IL_STEEL); }
    lkOV(ctx, -20 * s, bob, 36 * s, 28 * s, dk); lkOV(ctx, -20 * s, bob, 34 * s, 26 * s, b); lkOV(ctx, -24 * s, bob - 7 * s, 22 * s, 12 * s, tw_li(b, 0.12));
    for (let q = 0; q < 6; q++){ const yy = bob + (q - 2.5) * 8 * s; tw_ln(ctx, [-48 * s, yy, -36 * s, yy + Math.sin(q) * 4 * s, -22 * s, yy - Math.sin(q * 2) * 3 * s, -8 * s, yy * 0.6 + bob * 0.4], 1.4 * s, glow > 0.2 ? '#C8F0A8' : tw_li(b, 0.25)); }   /* veins */
    for (let q = -1; q <= 1; q++){ fillCircle(ctx, -46 * s, bob + q * 16 * s, 5 * s, IL_DKSTEEL); fillCircle(ctx, -46 * s, bob + q * 16 * s, 3 * s, IL_STEEL); }
    for (let q = 0; q < 5; q++){ const gx = (-34 + q * 6) * s, gy = bob + (q % 2 ? 18 : -16) * s; tw_poly(ctx, [gx, gy, gx + 4 * s, gy - 6 * s, gx + 6 * s, gy + 1 * s], 'rgba(210,250,250,.75)'); }   /* glass from the tank, stuck in its skin */
    lkOV(ctx, 16 * s, bob, 20 * s, 22 * s, dk); lkOV(ctx, 16 * s, bob, 18 * s, 20 * s, tw_li(b, 0.05));
    for (const [ex, ey, er] of [[18, -10, 5.4], [18, 10, 5.4], [26, 0, 4]]){ fillCircle(ctx, ex * s, bob + ey * s, er * 1.3 * s, dk); fillCircle(ctx, ex * s, bob + ey * s, er * s, '#F2E6A0'); tw_rect(ctx, (ex - er * 0.7) * s, bob + (ey - 0.7) * s, er * 1.4 * s, 1.4 * s, '#14100C'); fillCircle(ctx, (ex - er * 0.3) * s, bob + (ey - er * 0.35) * s, er * 0.3 * s, '#FFFFFF'); }
    const bk = st === 'spawnwind' || st === 'roar' ? 4 * s : 1.4 * s;
    tw_poly(ctx, [32 * s, bob - 5 * s - bk, 42 * s, bob - bk * 0.4, 32 * s, bob - 0.5 * s], '#2A1E14'); tw_poly(ctx, [32 * s, bob + 5 * s + bk, 41 * s, bob + bk * 0.4, 32 * s, bob + 0.5 * s], '#3A2A1C');
    if (st === 'inkwind') for (let q = 0; q < 4; q++) fillCircle(ctx, (44 + q * 6) * s, bob + Math.sin(q * 2) * 4 * s, (5 - q) * s, 'rgba(20,10,24,.75)');
    if (glow > 0.2) ringPath(ctx, 0, bob, 96 * s, 4, '#C8F0A8', 0.3 + 0.3 * glow);
    if (st === 'roar') ringPath(ctx, 0, bob, 104 * s, 5, '#E8FFD8', 0.5);
  }
};
Object.assign(ENEMY_LOOK_DRAW, ISLE_DRAW);
