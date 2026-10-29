'use strict';
/* Enemy art: the detail layer for Chapters 13.5 (the Domes), 14 (the Tower) and 15 (the Siege). */
/* Each creature of those chapters already has its main shapes (js/art/35i-art-domes.js, 35j-art-tower.js, 35k-art-siege.js, and the Arctic art for the Domes' ordinary kinds).
   This file wraps each drawing and adds many small parts around it: bolts and seams, vents and lamps, jointed legs and claws, cables, fur and frost, so a creature is built of
   many pieces instead of a few big ones. `under` runs before the original drawing (feet, legs, tails behind the body), `over` runs after it (everything on top). Both are
   given the same arguments as the original and read only what the original reads (def, type, r, anim, state), so the sprite cache (js/game/44t-enemy-sprites.js) still keeps
   pictures of the ordinary ones and the extra parts cost nothing per frame for them. Bosses are drawn live; their extra parts are kept to a few hundred small shapes. */
const DT_RED = '#FF5A4A', DT_STEEL = '#C8CCD6', DT_DARK = '#10141C';
/* a bolt with a glint */
function dt_bolt(ctx, x, y, r, c){ fillCircle(ctx, x, y, r, c || DT_STEEL); fillCircle(ctx, x - r * 0.3, y - r * 0.3, r * 0.4, 'rgba(255,255,255,.7)'); }
/* bolts at each [x, y] of a flat list, scaled by s */
function dt_bolts(ctx, arr, s, r, c){ for (let i = 0; i < arr.length; i += 2) dt_bolt(ctx, arr[i] * s, arr[i + 1] * s, r * s, c); }
/* a lamp: dark ring, lit (or dim) lens, glint */
function dt_led(ctx, x, y, r, c, on){ fillCircle(ctx, x, y, r * 1.4, DT_DARK); fillCircle(ctx, x, y, r, on === false ? tw_sh(c, 0.7) : c); if (on !== false) fillCircle(ctx, x - r * 0.3, y - r * 0.3, r * 0.35, 'rgba(255,255,255,.85)'); }
/* n slits across a rectangle (vertical slits when vert) */
function dt_vent(ctx, x, y, w, h, n, c, vert){ for (let i = 0; i < n; i++){ if (vert) tw_rect(ctx, x + i * w / n, y, w / n * 0.55, h, c); else tw_rect(ctx, x, y + i * h / n, w, h / n * 0.55, c); } }
/* a cable: dark sheath with a coloured core */
function dt_wire(ctx, pts, w, c){ tw_ln(ctx, pts, w * 1.7, DT_DARK); tw_ln(ctx, pts, w, c); }
/* a two-part leg with a knee and a foot: hip, knee and foot as x, y pairs */
function dt_leg(ctx, x0, y0, x1, y1, x2, y2, w, c){
  tw_ln(ctx, [x0, y0, x1, y1], w, c); tw_ln(ctx, [x1, y1, x2, y2], w * 0.8, c);
  fillCircle(ctx, x1, y1, w * 0.7, tw_li(c, 0.18)); fillCircle(ctx, x1, y1, w * 0.3, tw_sh(c, 0.45)); fillCircle(ctx, x2, y2, w * 0.62, tw_sh(c, 0.3));
}
/* a paw or hand with toes: at (x, y), pointing along angle an */
function dt_toes(ctx, x, y, an, n, len, w, c){ for (let i = 0; i < n; i++){ const o = (i - (n - 1) / 2) * 0.5; tw_ln(ctx, [x, y, x + Math.cos(an + o) * len, y + Math.sin(an + o) * len], w, c); } }
/* a point along a flat polyline [x0,y0,x1,y1,...] at t (0..1) */
function dt_at(pts, t){ const n = pts.length / 2 - 1, f = Math.min(n - 1e-6, Math.max(0, t * n)), i = Math.floor(f), u = f - i; return [pts[i * 2] + (pts[i * 2 + 2] - pts[i * 2]) * u, pts[i * 2 + 1] + (pts[i * 2 + 3] - pts[i * 2 + 1]) * u]; }
/* a panel: dark edge, face, light top, shaded bottom, and (when rv) a bolt in each corner */
function dt_panel(ctx, x, y, w, h, r, b, dk, rv, bs){
  tw_rr(ctx, x, y, w, h, r, dk); tw_rr(ctx, x + r * 0.3, y + r * 0.3, w - r * 0.6, h - r * 0.6, r * 0.8, b);
  const t = Math.max(0.6, h * 0.12); tw_rect(ctx, x + r * 0.5, y + r * 0.5, w - r, t, tw_li(b, 0.4)); tw_rect(ctx, x + r * 0.5, y + h - r * 0.5 - t, w - r, t, tw_sh(b, 0.3));
  if (rv){ const q = r * 0.9, k = bs || r * 0.4; dt_bolt(ctx, x + q, y + q, k); dt_bolt(ctx, x + w - q, y + q, k); dt_bolt(ctx, x + q, y + h - q, k); dt_bolt(ctx, x + w - q, y + h - q, k); }
}
/* wrap the drawing of one creature with parts drawn under and over it */
function dt_wrap(name, under, over, only){
  const base = ENEMY_LOOK_DRAW[name]; if (!base) return;
  ENEMY_LOOK_DRAW[name] = function(ctx, e, b, dk, bob, wind, d){
    if (only && !only(d)) return base.apply(this, arguments);
    if (under) under(ctx, e, b, dk, bob, d, wind);
    base.apply(this, arguments);
    if (over) over(ctx, e, b, dk, bob, d, wind);
  };
}

/* ======================= Chapter 14: the Tower ======================= */
dt_wrap('tw_rat', function(ctx, e, b, dk, bob, d){                                  /* toes behind the legs */
  const s = e.r / 14, a = e.anim * 2;
  for (let i = 0; i < 3; i++) for (const sd of [-1, 1]){ const w = Math.sin(a + i * 2.1 + (sd > 0 ? 0 : 1.7)) * 2.2 * s, x0 = (5 - i * 5) * s; dt_toes(ctx, x0 + 3.5 * s + w, bob + sd * 10.5 * s, sd * 1.2, 3, 2.2 * s, 0.7 * s, '#E8C0C0'); }
}, function(ctx, e, b, dk, bob, d){
  const s = e.r / 14, a = e.anim * 2, hi = tw_li(b, 0.45), lunge = e.state === 'lunge', tw = Math.sin(a) * 4 * s;
  for (let k = 0; k < 7; k++){ const x = (-10 + k * 2.6) * s; for (const sd of [-1, 1]) lkTRI(ctx, x, bob + sd * 7.6 * s, x + 0.9 * s, bob + sd * 8.8 * s, x + 2 * s, bob + sd * 7.5 * s, hi); }      /* fur tufts along the flanks */
  for (const sd of [-1, 1]) for (let k = 0; k < 4; k++) tw_ln(ctx, [(-9 + k * 3.6) * s, bob + sd * 4.4 * s, (-7.4 + k * 3.6) * s, bob + sd * 6.8 * s], 0.6 * s, tw_sh(b, 0.35));   /* ribs */
  tw_rect(ctx, 3.4 * s, bob - 5 * s, 1.6 * s, 10 * s, '#4A5060'); dt_bolts(ctx, [4.2, -4, 4.2, 4], s, 0.5);                        /* collar band behind the head */
  dt_panel(ctx, -13 * s, bob - 3 * s, 4 * s, 6 * s, 1 * s, '#9AA0AE', '#3A3E48', true, 0.4 * s);                                         /* rump plate */
  for (let k = 0; k < 3; k++) dt_led(ctx, (-4.6 + k * 1.6) * s, bob + 0.2 * s, 0.5 * s, k === 1 ? '#6AFFB0' : '#FFB84A', Math.sin(a * 1.5 + k * 2) > -0.3);
  dt_wire(ctx, [-3 * s, bob - 3.4 * s, 0, bob - 6 * s, 5 * s, bob - 4.6 * s, 8 * s, bob - 3.6 * s], 0.5 * s, '#4A8AE8');             /* a wire from the back plate to the head */
  const tp = [-9 * s, bob, -17 * s, bob + tw * 0.4, -24 * s, bob - tw * 0.5, -31 * s, bob + tw * 0.2];
  for (let k = 1; k < 6; k++){ const p = dt_at(tp, k / 6); fillCircle(ctx, p[0], p[1], 1.5 * s, '#1E2228'); fillCircle(ctx, p[0], p[1], 0.8 * s, '#C8A850'); }   /* clamps along the tail */
  const pe = dt_at(tp, 1); tw_rr(ctx, pe[0] - 3.4 * s, pe[1] - 1.4 * s, 3.4 * s, 2.8 * s, 0.6 * s, '#8A909C'); tw_ln(ctx, [pe[0] - 3.4 * s, pe[1] - 0.7 * s, pe[0] - 5.4 * s, pe[1] - 0.7 * s], 0.5 * s, DT_STEEL); tw_ln(ctx, [pe[0] - 3.4 * s, pe[1] + 0.7 * s, pe[0] - 5.4 * s, pe[1] + 0.7 * s], 0.5 * s, DT_STEEL);
  for (const sd of [-1, 1]){ lkTRI(ctx, 10.4 * s, bob + sd * 4.8 * s, 14.2 * s, bob + sd * 4.4 * s, 12.6 * s, bob + sd * 3.4 * s, '#2A1A14'); lkLN(ctx, [14 * s, bob + sd * 0.4 * s, 20 * s, bob + sd * 7 * s], 0.5 * s, d.pale); lkLN(ctx, [14.4 * s, bob + sd * 1.8 * s, 20 * s, bob + sd * 5.8 * s], 0.5 * s, d.pale); fillCircle(ctx, 6 * s, bob + sd * 6 * s, 1.1 * s, '#C88088'); }
  tw_rect(ctx, 15.4 * s, bob - 1.5 * s, 1.1 * s, 1.4 * s, '#FFFFFF'); tw_rect(ctx, 15.4 * s, bob + 0.1 * s, 1.1 * s, 1.4 * s, '#FFFFFF');   /* the front teeth */
  if (lunge) for (let k = 0; k < 3; k++) tw_ln(ctx, [(-14 - k * 3) * s, bob + (k - 1) * 3.4 * s, (-19 - k * 3) * s, bob + (k - 1) * 3.4 * s], 0.6 * s, 'rgba(255,255,255,.6)');
});
dt_wrap('tw_mite', function(ctx, e, b, dk, bob){
  const s = e.r / 5.5, a = e.anim * 3;
  for (let i = 0; i < 3; i++) for (const sd of [-1, 1]){ const w = Math.sin(a + i * 2.2 + (sd > 0 ? 0 : 1.6)) * 1.2 * s; fillCircle(ctx, (4 - i * 2.6) * s, bob + sd * 5.6 * s, 0.7 * s, '#3A3E48'); fillCircle(ctx, (3 - i * 2.6) * s + w, bob + sd * 4 * s, 0.5 * s, '#6A707C'); }
}, function(ctx, e, b, dk, bob){
  const s = e.r / 5.5, a = e.anim * 3;
  for (const sd of [-1, 1]){ tw_rect(ctx, sd > 0 ? 4.6 * s : -5.8 * s, bob - 2.1 * s, 1.2 * s, 4.2 * s, tw_sh(b, 0.35)); tw_ln(ctx, [5.8 * s, bob + sd * 1.2 * s, 8.2 * s, bob + sd * 3.4 * s + Math.sin(a) * 0.5 * s * sd], 0.4 * s, '#8A909C'); fillCircle(ctx, 8.3 * s, bob + sd * 3.4 * s, 0.4 * s, '#FFB84A'); }
  dt_bolt(ctx, -1.6 * s, bob, 0.6 * s, '#E8ECF2'); tw_rect(ctx, -5 * s, bob + 1.2 * s, 10 * s, 0.4 * s, tw_li(b, 0.3));
  for (const [x, y] of [[-4.6, -0.8], [-2.2, 1.4], [2.8, -1.2]]) fillCircle(ctx, x * s, bob + y * s, 0.3 * s, '#8A5A3A');
});
dt_wrap('tw_courier', function(ctx, e, b, dk, bob){
  const s = e.r / 13;
  for (const sd of [-1, 1]){ tw_rect(ctx, -6 * s, bob + sd * 5.4 * s - 0.5 * s, 12 * s, 1 * s, '#2A2E38'); tw_rect(ctx, 5 * s, bob + sd * 5.4 * s - 0.5 * s, 1.4 * s, 1 * s, '#6A707C'); }       /* landing skids */
}, function(ctx, e, b, dk, bob){
  const s = e.r / 13, a = e.anim * 9;
  for (const [rx, ry] of [[9, -9], [9, 9], [-9, -9], [-9, 9]]){
    ctx.strokeStyle = 'rgba(42,46,56,.7)'; ctx.lineWidth = 1.2 * s; ctx.beginPath(); ctx.moveTo(rx * s + Math.cos(a + rx + 1.57) * 6 * s, bob + ry * s + Math.sin(a + rx + 1.57) * 6 * s); ctx.lineTo(rx * s - Math.cos(a + rx + 1.57) * 6 * s, bob + ry * s - Math.sin(a + rx + 1.57) * 6 * s); ctx.stroke();
    ctx.strokeStyle = '#6A707C'; ctx.lineWidth = 0.7 * s; ctx.beginPath(); ctx.arc(rx * s, bob + ry * s, 6.9 * s, 0, TAU); ctx.stroke();
    fillCircle(ctx, rx * s, bob + ry * s, 2.2 * s, '#1E222A'); dt_bolt(ctx, rx * s, bob + ry * s, 1.1 * s, '#8A909C'); dt_bolt(ctx, rx * s * 0.7, bob + ry * s * 0.7, 0.7 * s, '#8A909C');
  }
  tw_rr(ctx, -2.2 * s, bob - 1.8 * s, 3.6 * s, 2.2 * s, 0.3 * s, '#FFFFFF'); tw_rect(ctx, -1.8 * s, bob - 1.2 * s, 2.6 * s, 0.3 * s, '#8A8A9A'); tw_rect(ctx, -1.8 * s, bob - 0.6 * s, 1.8 * s, 0.3 * s, '#8A8A9A');     /* the address label */
  tw_ln(ctx, [-4.4 * s, bob - 3.4 * s, -4.4 * s, bob + 3.4 * s], 0.5 * s, '#4A3A28'); tw_ln(ctx, [3.4 * s, bob - 3.4 * s, 3.4 * s, bob + 3.4 * s], 0.5 * s, '#4A3A28');   /* straps round the parcel */
  dt_led(ctx, -4 * s, bob - 3.2 * s, 0.5 * s, '#6AFFB0', Math.sin(e.anim * 3) > 0); dt_led(ctx, -4 * s, bob + 3.2 * s, 0.5 * s, DT_RED, Math.sin(e.anim * 3 + 3) > 0);
  tw_ln(ctx, [-5.4 * s, bob, -8.4 * s, bob - 1.4 * s], 0.5 * s, '#8A909C'); fillCircle(ctx, -8.6 * s, bob - 1.5 * s, 0.6 * s, DT_RED);
  ctx.strokeStyle = '#6A707C'; ctx.lineWidth = 0.6 * s; ctx.beginPath(); ctx.arc(4.6 * s, bob, 2.4 * s, 0, TAU); ctx.stroke();
});
dt_wrap('tw_roller', null, function(ctx, e, b, dk, bob){
  const s = e.r / 14, a = e.anim * 2, roll = e.state === 'roll';
  for (let k = 0; k < 5; k++){ const an = k * TAU / 5 + (roll ? a * 3 : a * 0.3), wx = Math.cos(an) * 10.6 * s, wy = bob + Math.sin(an) * 10.6 * s, jx = Math.cos(an) * 5.4 * s, jy = bob + Math.sin(an) * 5.4 * s;
    fillCircle(ctx, jx, jy, 1.2 * s, '#4A505C'); dt_bolt(ctx, jx, jy, 0.5 * s, '#C8CCD6');
    ctx.strokeStyle = '#3A3E48'; ctx.lineWidth = 0.6 * s; ctx.beginPath(); ctx.arc(wx, wy, 2.1 * s, 0, TAU); ctx.stroke();
    tw_ln(ctx, [wx - Math.cos(an + a * 4) * 1.6 * s, wy - Math.sin(an + a * 4) * 1.6 * s, wx + Math.cos(an + a * 4) * 1.6 * s, wy + Math.sin(an + a * 4) * 1.6 * s], 0.5 * s, '#C8CCD6');
    tw_rect(ctx, wx - 0.5 * s, wy - 3.4 * s, 1 * s, 1 * s, '#6A7280'); }
  for (let k = 0; k < 10; k++){ const an = k * TAU / 10; fillCircle(ctx, Math.cos(an) * 6 * s, bob + Math.sin(an) * 6 * s, 0.35 * s, tw_sh(b, 0.5)); }          /* stitching round the seat */
  tw_rr(ctx, -8.4 * s, bob - 2.4 * s, 5 * s, 4.8 * s, 1 * s, '#3A3E48'); tw_rr(ctx, -8 * s, bob - 1.8 * s, 4 * s, 3.6 * s, 0.8 * s, '#8A909C'); tw_poly(ctx, [-8.4 * s, bob - 2.4 * s, -10.4 * s, bob - 4.6 * s, -8.4 * s, bob - 1 * s], '#FF8A3A'); tw_poly(ctx, [-8.4 * s, bob + 2.4 * s, -10.4 * s, bob + 4.6 * s, -8.4 * s, bob + 1 * s], '#FF8A3A');   /* the rocket and its fins */
  tw_rect(ctx, -7.6 * s, bob - 0.4 * s, 3 * s, 0.8 * s, DT_RED); tw_poly(ctx, [-8.4 * s, bob - 1.6 * s, -10 * s, bob - 2.4 * s, -10 * s, bob + 2.4 * s, -8.4 * s, bob + 1.6 * s], '#2A2E38');
  for (const sd of [-1, 1]){ tw_rr(ctx, 1.6 * s, bob + sd * 7.4 * s - 1.4 * s, 3.6 * s, 2.8 * s, 0.8 * s, '#6A7280'); }
});
dt_wrap('tw_copier', function(ctx, e, b, dk, bob){
  const s = e.r / 24, a = e.anim * 1.4;
  for (const [lx, ly] of [[-12, -17], [-12, 17], [12, -17], [12, 17]]){ const w = Math.sin(a + lx + ly) * 1.8 * s; fillCircle(ctx, lx * s + w, bob + ly * s, 1.4 * s, '#5A606C'); tw_rect(ctx, lx * s + w - 3.4 * s, bob + ly * s - 0.6 * s, 6.8 * s, 1.2 * s, '#1A1E26'); }
}, function(ctx, e, b, dk, bob){
  const s = e.r / 24, a = e.anim * 1.4, jam = e.state === 'jam';
  dt_bolts(ctx, [-17.6, -13.6, 17.6, -13.6, -17.6, 13.6, 17.6, 13.6], s, 0.9, '#C8CCD6');
  dt_vent(ctx, -16 * s, bob - 13.4 * s, 12 * s, 2.4 * s, 4, '#2A303C', true); dt_vent(ctx, -16 * s, bob + 11.4 * s, 12 * s, 2.4 * s, 4, '#2A303C', true);
  tw_rect(ctx, 6.4 * s, bob - 10 * s, 0.9 * s, 20 * s, tw_sh(b, 0.35));                                  /* the seam between glass and controls */
  tw_rr(ctx, 10.6 * s, bob + 9.2 * s, 6.4 * s, 4.4 * s, 0.8 * s, '#8CC8E0'); tw_rect(ctx, 11.4 * s, bob + 10.2 * s, 4.8 * s, 0.5 * s, '#26303C'); tw_rect(ctx, 11.4 * s, bob + 11.4 * s, 3 * s, 0.5 * s, '#26303C');   /* a little display */
  dt_led(ctx, 11.6 * s, bob - 11 * s, 0.9 * s, '#6AFFB0', true); dt_led(ctx, 14.4 * s, bob - 11 * s, 0.9 * s, jam ? DT_RED : '#FFB84A', true);
  for (let k = 0; k < 3; k++) tw_ln(ctx, [(-12 + k * 5) * s, bob - 9 * s, (-12 + k * 5) * s + 3 * s, bob - 3 * s], 0.4 * s, 'rgba(255,255,255,.5)');   /* glints on the glass */
  tw_rr(ctx, 18.4 * s, bob - 4 * s, 6 * s, 1.4 * s, 0.4 * s, '#B8B8B4'); tw_rr(ctx, 18.4 * s, bob + 2.6 * s, 6 * s, 1.4 * s, 0.4 * s, '#B8B8B4');       /* the paper tray slots */
  for (let k = 0; k < 4; k++) fillCircle(ctx, (-14 + k * 3.4) * s, bob + 15.6 * s, 0.5 * s, tw_sh(b, 0.45));
  tw_rr(ctx, -19 * s, bob - 6 * s, 3 * s, 12 * s, 0.8 * s, tw_sh(b, 0.18)); dt_bolts(ctx, [-17.6, -4, -17.6, 4], s, 0.5);                              /* the hinge */
  tw_rect(ctx, -16 * s, bob - 0.3 * s, 6 * s, 0.6 * s, '#E8A83A'); tw_rect(ctx, -16 * s, bob + 6.4 * s, 4 * s, 0.6 * s, '#E8A83A');
});
dt_wrap('tw_safe', function(ctx, e, b, dk, bob){
  const s = e.r / 31, a = e.anim * 1.2, slam = e.state === 'slam', up = slam ? -4 * s : 0;
  for (const [lx, ly] of [[8, -20], [8, 20], [-14, -18], [-14, 18]]){ const w = Math.sin(a + lx + ly) * 3 * s, fx = (lx + (lx > 0 ? 6 : 0)) * s + w, fy = bob + ly * s * 1.05;
    for (let k = 0; k < 4; k++){ const kx = fx + (k - 1.5) * 1.8 * s; lkOV(ctx, kx, fy, 1.5 * s, 2.4 * s, tw_li(b, 0.3)); lkOV(ctx, kx, fy, 1.5 * s, 2.4 * s, 'rgba(0,0,0,.2)'); }
    tw_ln(ctx, [fx - 3.4 * s, fy, fx - 8 * s, bob + (ly > 0 ? 14 : -14) * s], 3 * s, '#3A3E48'); }
}, function(ctx, e, b, dk, bob){
  const s = e.r / 31, a = e.anim * 1.2, slam = e.state === 'slam', up = slam ? -4 * s : 0;
  for (const sd of [-1, 1]){ for (let k = 0; k < 3; k++) tw_rr(ctx, (-20 + k * 4) * s, bob + sd * 17.4 * s - 1 * s + up, 3 * s, 2 * s, 0.4 * s, tw_sh(b, 0.25)); }   /* rivet strips */
  for (const sd of [-1, 1]){ tw_rr(ctx, -23.4 * s, bob + sd * 9 * s - 3 * s + up, 2.6 * s, 6 * s, 0.8 * s, '#8A909C'); dt_bolt(ctx, -22.2 * s, bob + sd * 9 * s - 1.4 * s + up, 0.5 * s, '#E8ECF2'); dt_bolt(ctx, -22.2 * s, bob + sd * 9 * s + 1.4 * s + up, 0.5 * s, '#E8ECF2'); }   /* hinges */
  tw_ln(ctx, [-12 * s, bob - 12 * s + up, 14 * s, bob - 12 * s + up, 14 * s, bob + 12 * s + up, -12 * s, bob + 12 * s + up], 0.6 * s, tw_sh(b, 0.45));     /* the door's edge */
  ctx.strokeStyle = '#8A7A3A'; ctx.lineWidth = 0.7 * s; ctx.beginPath(); ctx.arc(1 * s, bob + up, 9 * s, 0, TAU); ctx.stroke();
  for (let k = 0; k < 8; k++){ const an = k * TAU / 8 + 0.4; fillCircle(ctx, 1 * s + Math.cos(an) * 9 * s, bob + up + Math.sin(an) * 9 * s, 0.5 * s, '#E8D890'); }
  tw_rr(ctx, 12 * s, bob - 6.4 * s + up, 3.6 * s, 3 * s, 0.6 * s, '#B8BEC8'); tw_rr(ctx, 12 * s, bob + 3.4 * s + up, 3.6 * s, 3 * s, 0.6 * s, '#B8BEC8');           /* lock bolts */
  tw_rr(ctx, 16.4 * s, bob - 1.6 * s + up, 2.6 * s, 3.2 * s, 0.5 * s, '#2A2E38'); fillCircle(ctx, 17.7 * s, bob + up, 0.6 * s, '#E8D890');                    /* the keyhole */
  tw_rect(ctx, -22 * s, bob - 20 * s + up, 44 * s, 0.8 * s, tw_li(b, 0.6));
  for (let k = 0; k < 5; k++) tw_ln(ctx, [(-18 + k * 8) * s, bob + 8 * s + up, (-16 + k * 8) * s, bob + 14 * s + up], 0.5 * s, 'rgba(0,0,0,.25)');           /* scratches */
  tw_rr(ctx, -20 * s, bob - 5 * s + up, 6 * s, 10 * s, 1 * s, '#E8C84A'); tw_rect(ctx, -19 * s, bob - 3 * s + up, 4 * s, 1 * s, '#2A2E38'); tw_rect(ctx, -19 * s, bob - 0.6 * s + up, 4 * s, 1 * s, '#2A2E38'); tw_rect(ctx, -19 * s, bob + 1.8 * s + up, 4 * s, 1 * s, '#2A2E38');   /* a warning plate */
});
dt_wrap('tw_intern', null, function(ctx, e, b, dk, bob, d){
  const s = e.r / 16, a = e.anim * 1.6, leap = e.state === 'leap', ax = leap ? 14 : 11 + Math.sin(a * 1.1) * 2, skin = b;
  for (const sd of [-1, 1]){ const hy = bob + sd * 5 * s + (leap ? -sd * 3 * s : 0); dt_toes(ctx, ax * s + 1.4 * s, hy, sd * 0.5, 4, 2.6 * s, 0.7 * s, tw_sh(skin, 0.2)); fillCircle(ctx, 7 * s, bob + sd * 8.6 * s, 1.5 * s, tw_li(skin, 0.15)); fillCircle(ctx, 7 * s, bob + sd * 8.6 * s, 0.6 * s, tw_sh(skin, 0.4));      /* hands with fingers, elbows */
    tw_rect(ctx, 5.4 * s, bob + sd * 7.8 * s - 0.4 * s, 3 * s, 0.8 * s, '#B8B8C0'); }                                              /* a rolled sleeve */
  for (let k = 0; k < 4; k++){ tw_ln(ctx, [(-8 + k * 3) * s, bob - 7 * s, (-6.6 + k * 3) * s, bob + 7 * s], 0.4 * s, 'rgba(0,0,0,.12)'); }       /* shirt creases */
  tw_ln(ctx, [-1 * s, bob + 3 * s, -1 * s, bob + 6 * s, -2.6 * s, bob + 8 * s], 0.5 * s, '#C8402E'); tw_rr(ctx, -3.6 * s, bob + 7.4 * s, 2 * s, 1.4 * s, 0.4 * s, '#2A8A5A');   /* a lanyard and its pass */
  tw_rr(ctx, 1.2 * s, bob - 5 * s, 2.6 * s, 2.2 * s, 0.4 * s, '#F4F0C8'); tw_rect(ctx, 1.4 * s, bob - 4.6 * s, 2.2 * s, 0.3 * s, '#4A8AE8'); tw_rect(ctx, 1.4 * s, bob - 4 * s, 1.6 * s, 0.3 * s, '#4A8AE8');   /* a pocket and a pen */
  dt_bolt(ctx, 4 * s, bob - 0.9 * s, 0.45 * s, '#E8C84A'); dt_bolt(ctx, 4 * s, bob + 0.9 * s, 0.45 * s, '#E8C84A');                      /* tie pin and button */
  for (const sd of [-1, 1]){ tw_ln(ctx, [5.6 * s, bob + sd * 4.4 * s, 9.6 * s, bob + sd * 4.2 * s], 0.7 * s, '#3A2A1A'); lkOV(ctx, 3.4 * s, bob + sd * 5.4 * s, 1.1 * s, 1.5 * s, tw_sh(skin, 0.15)); lkOV(ctx, 3.4 * s, bob + sd * 5.4 * s, 0.6 * s, 0.9 * s, '#E8A0A0'); }
  tw_ln(ctx, [-5 * s, bob - 6 * s, -7 * s, bob - 8 * s], 0.5 * s, '#C8CCD6'); fillCircle(ctx, -7.2 * s, bob - 8.2 * s, 0.7 * s, '#FF5A4A');      /* a stapler-sized power pack aerial */
});
dt_wrap('tw_shredder', function(ctx, e, b, dk, bob){
  const s = e.r / 15, a = e.anim * 2;
  for (let k = 0; k < 3; k++) for (const sd of [-1, 1]){ const w = Math.sin(a + k * 2 + (sd > 0 ? 0 : 1.5)) * 2 * s; fillCircle(ctx, (-1 + k * 5) * s, bob + sd * 13 * s, 1.5 * s, '#3A3E48'); fillCircle(ctx, (-3 + k * 5) * s + w, bob + sd * 11 * s, 0.7 * s, '#6A707C'); }
}, function(ctx, e, b, dk, bob){
  const s = e.r / 15, a = e.anim * 2, spin = e.state === 'spin';
  dt_bolts(ctx, [-10, -7.4, -10, 7.4, 8, -7.4, 8, 7.4], s, 0.6, '#C8CCD6');
  dt_vent(ctx, -10 * s, bob - 3 * s, 3 * s, 6 * s, 4, '#2A2E38', false);
  tw_rr(ctx, -2 * s, bob - 7.4 * s, 4 * s, 2 * s, 0.4 * s, '#E8E8E4'); dt_led(ctx, 1.6 * s, bob - 6.4 * s, 0.5 * s, '#6AFFB0', true); dt_led(ctx, 3.2 * s, bob - 6.4 * s, 0.5 * s, spin ? DT_RED : '#4A3A1E', spin);     /* a power switch and lamps */
  tw_rect(ctx, 4.6 * s, bob - 8 * s, 0.9 * s, 16 * s, tw_sh(b, 0.3)); tw_rect(ctx, 6.4 * s, bob - 8 * s, 0.9 * s, 16 * s, tw_sh(b, 0.3));
  for (let k = 0; k < 5; k++) tw_poly(ctx, [(9.4 + k * 1.7) * s, bob - 7 * s, (10.4 + k * 1.7) * s, bob - 5.6 * s, (8.4 + k * 1.7) * s, bob - 5.6 * s], '#F8F8F0');       /* paper snagged in the mouth */
  for (const sd of [-1, 1]){ tw_rect(ctx, 9.4 * s, bob + sd * 6.4 * s - 0.5 * s, 8 * s, 1 * s, '#4A505C'); for (let k = 0; k < 4; k++) tw_rect(ctx, (10.4 + k * 1.8) * s, bob + sd * 5.6 * s - 0.3 * s, 0.6 * s, 0.6 * s, '#C8CCD6'); }
  for (let k = 0; k < 5; k++) tw_rect(ctx, (-8 + k * 1.4) * s, bob + 7.4 * s, 0.8 * s, 0.8 * s, '#F8F8F0');
  tw_ln(ctx, [-12 * s, bob - 4 * s, -15 * s, bob - 5 * s, -17 * s, bob - 4 * s], 0.7 * s, '#1E2228'); tw_ln(ctx, [-12 * s, bob + 4 * s, -15 * s, bob + 5 * s, -17 * s, bob + 4 * s], 0.7 * s, '#1E2228');      /* power cable stubs */
});
dt_wrap('tw_cam', function(ctx, e, b, dk, bob){
  const s = e.r / 15, a = e.anim;
  for (let k = 0; k < 3; k++){ const an = k * TAU / 3 + a * 2.4, fx = Math.cos(an) * 12 * s, fy = bob + Math.sin(an) * 12 * s; for (const o of [-0.4, 0.4]) tw_ln(ctx, [fx, fy, fx + Math.cos(an + o) * 3 * s, fy + Math.sin(an + o) * 3 * s], 0.7 * s, '#4A505C'); }
}, function(ctx, e, b, dk, bob){
  const s = e.r / 15, a = e.anim, st = e.state === 'stare';
  for (let k = 0; k < 8; k++){ const an = k * TAU / 8 + 0.2; fillCircle(ctx, Math.cos(an) * 8.4 * s, bob + Math.sin(an) * 8.4 * s, 0.55 * s, tw_sh(b, 0.45)); }          /* a ring of screws */
  ctx.strokeStyle = '#2A2E38'; ctx.lineWidth = 0.8 * s; ctx.beginPath(); ctx.arc(5 * s, bob, 6.6 * s, 0, TAU); ctx.stroke();      /* the lens housing */
  ctx.strokeStyle = 'rgba(255,255,255,.35)'; ctx.lineWidth = 0.6 * s; ctx.beginPath(); ctx.arc(5 * s, bob, 4 * s, -2.4, -0.8); ctx.stroke();
  for (let k = 0; k < 6; k++){ const an = k * TAU / 6 + a * 0.4; tw_rect(ctx, 5 * s + Math.cos(an) * 5.2 * s - 0.4 * s, bob + Math.sin(an) * 5.2 * s - 0.4 * s, 0.8 * s, 0.8 * s, '#1E222A'); }     /* the iris blades */
  dt_led(ctx, -2.4 * s, bob - 7 * s, 0.6 * s, '#FFB84A', Math.sin(a * 2) > 0); dt_led(ctx, -4.6 * s, bob + 5.8 * s, 0.6 * s, '#6AFFB0', Math.sin(a * 3 + 1) > 0);
  tw_rr(ctx, -10.4 * s, bob - 2 * s, 3 * s, 4 * s, 0.6 * s, '#3A3E48'); dt_bolt(ctx, -9 * s, bob, 0.6 * s, '#8A909C');             /* the mount he was ripped from */
  dt_wire(ctx, [-9 * s, bob, -11 * s, bob + 3 * s, -13 * s, bob + Math.sin(a * 1.6) * 3 * s * 0.6], 0.5 * s, '#E8C23A');
  if (st) for (let k = 0; k < 4; k++){ const an = -0.7 + k * 0.47; tw_ln(ctx, [11 * s, bob + Math.sin(an) * 3 * s, 15 * s, bob + Math.sin(an) * 8 * s], 0.5 * s, 'rgba(255,150,130,.7)'); }
});
dt_wrap('tw_cable', null, function(ctx, e, b, dk, bob){
  const s = e.r / 11, a = e.anim * 1.4, whip = e.state === 'whip', n = 10, pts = [];
  for (let i = 0; i < n; i++){ const t = i / (n - 1), amp = (whip ? 2 : 4.6) * s * (0.4 + t); pts.push((8 - t * 40) * s, bob + Math.sin(a + t * 5) * amp); }
  for (let i = 1; i < n - 1; i++){ const x = pts[i * 2], y = pts[i * 2 + 1]; tw_rect(ctx, x - 0.4 * s, y - (3.4 - i * 0.2) * s, 0.8 * s, (6.8 - i * 0.4) * s, 'rgba(10,12,20,.35)'); if (i % 3 === 0){ tw_rr(ctx, x - 1 * s, y - 2.6 * s, 2 * s, 5.2 * s, 0.5 * s, '#C8CCD6'); tw_rect(ctx, x - 0.4 * s, y - 2.2 * s, 0.8 * s, 4.4 * s, '#8A909C'); } }     /* ribbing and cable clips */
  const hy = pts[1];
  for (const sd of [-1, 1]){ tw_rr(ctx, 11.4 * s, hy + sd * 2.4 * s - 0.3 * s, 5.4 * s, 0.6 * s, 0.2 * s, '#8A909C'); fillCircle(ctx, 16.6 * s, hy + sd * 2.3 * s, 0.7 * s, '#FFE890'); }       /* the prongs' tips */
  tw_rect(ctx, 3.4 * s, hy - 1.4 * s, 1.2 * s, 2.8 * s, '#4A505C'); tw_rect(ctx, 6 * s, hy - 3.2 * s, 3.4 * s, 0.6 * s, '#10141A'); tw_rect(ctx, 6 * s, hy + 2.6 * s, 3.4 * s, 0.6 * s, '#10141A');
  dt_bolts(ctx, [3.8, -3, 3.8, 3, 10.4, -3, 10.4, 3].map((v, i) => i % 2 ? v + hy / s : v), s, 0.5, '#C8CCD6');
  tw_rr(ctx, 0.4 * s, hy - 2.6 * s, 2.6 * s, 5.2 * s, 0.8 * s, '#3A3E48');                 /* the strain relief behind the plug */
  fillCircle(ctx, pts[pts.length - 2], pts[pts.length - 1], 1.4 * s, '#8A909C'); fillCircle(ctx, pts[pts.length - 2], pts[pts.length - 1], 0.7 * s, '#E8C23A');      /* a frayed end */
  for (const sd of [-1, 1]) tw_ln(ctx, [pts[pts.length - 2], pts[pts.length - 1], pts[pts.length - 2] - 2 * s, pts[pts.length - 1] + sd * 2 * s], 0.4 * s, sd > 0 ? '#C8402E' : '#2E5AC8');
});
dt_wrap('tw_hive', function(ctx, e, b, dk, bob){
  const s = e.r / 22, a = e.anim * 1.3;
  for (let k = 0; k < 6; k++){ const sd = k < 3 ? -1 : 1, i = k % 3, w = Math.sin(a + k * 1.5) * 2 * s; fillCircle(ctx, (-8 + i * 10) * s + w, bob + sd * 19 * s, 1.8 * s, '#3A3E48'); dt_toes(ctx, (-4 + i * 10) * s, bob + sd * 23 * s, sd * 1.4, 3, 2.6 * s, 0.8 * s, '#1A1E26'); }
}, function(ctx, e, b, dk, bob, d){
  const s = e.r / 22, a = e.anim * 1.3, vent = e.state === 'vent';
  dt_bolts(ctx, [-17, -12, 17, -12, -17, 12, 17, 12], s, 0.8, '#C8CCD6');
  for (let k = 0; k < 5; k++){ const y = bob + (-9.4 + k * 4.4) * s; for (let j = 0; j < 5; j++) tw_rect(ctx, (-7 + j * 3) * s, y + 0.6 * s, 2 * s, 2 * s, '#2A303C'); tw_rect(ctx, 7 * s, y + 1.2 * s, 1 * s, 1 * s, '#6AFFB0'); }       /* drive bays */
  dt_wire(ctx, [-18 * s, bob - 8 * s, -21 * s, bob - 4 * s, -19 * s, bob + 2 * s, -22 * s, bob + 8 * s], 0.7 * s, '#4A8AE8'); dt_wire(ctx, [-18 * s, bob - 4 * s, -23 * s, bob, -18 * s, bob + 6 * s], 0.7 * s, '#E8A83A');   /* patch cables hanging out the back */
  tw_rr(ctx, -19 * s, bob - 1.4 * s, 3 * s, 2.8 * s, 0.5 * s, '#8A909C');
  for (let k = 0; k < 3; k++) tw_rect(ctx, 11 * s, bob + (-9 + k * 8) * s, 7 * s, 0.6 * s, '#2A303C');                       /* door hinges and slats */
  for (let k = 0; k < 7; k++){ const my = bob + (-8.4 + k * 2.8) * s, mx = (12 + (k % 2) * 3.4) * s + (vent ? Math.sin(a * 4 + k) * 1.6 * s : 0); tw_ln(ctx, [mx - 0.8 * s, my - 0.8 * s, mx - 1.6 * s, my - 1.4 * s], 0.3 * s, '#D8DCE4'); tw_ln(ctx, [mx - 0.8 * s, my + 0.8 * s, mx - 1.6 * s, my + 1.4 * s], 0.3 * s, '#D8DCE4'); }     /* each mite's legs */
  dt_led(ctx, 15 * s, bob - 12.4 * s, 0.7 * s, DT_RED, Math.sin(a * 3) > 0); dt_led(ctx, 15 * s, bob + 12.4 * s, 0.7 * s, DT_RED, Math.sin(a * 3 + 2) > 0);
  tw_rr(ctx, -6 * s, bob - 14.4 * s, 12 * s, 1.2 * s, 0.4 * s, '#E8C84A'); for (let k = 0; k < 5; k++) tw_poly(ctx, [(-5 + k * 2.2) * s, bob - 14.2 * s, (-3.6 + k * 2.2) * s, bob - 14.2 * s, (-4.6 + k * 2.2) * s, bob - 13.4 * s], '#1A1E26');
});
dt_wrap('tw_battery', null, function(ctx, e, b, dk, bob){
  const s = e.r / 12, a = e.anim * 2, swell = e.state === 'swell', k = swell ? 1.28 : 1 + Math.sin(a * 1.5) * 0.03;
  for (const [x, y] of [[-7.4, -5.6], [7.4, -5.6], [-7.4, 5.6], [7.4, 5.6]]) dt_bolt(ctx, x * s * k, bob + y * s * k, 0.55 * s, '#C8CCD6');
  tw_rect(ctx, -8.6 * s * k, bob - 2.6 * s * k, 17.2 * s * k, 0.6 * s, tw_sh(b, 0.4));
  for (let i = 0; i < 4; i++) tw_rect(ctx, (-7 + i * 4.6) * s * k, bob - 6.4 * s * k, 1 * s, 2.4 * s, tw_li(b, 0.7));                    /* a label of ridges */
  tw_ln(ctx, [2 * s * k, bob - 6 * s * k, 4 * s * k, bob - 3 * s * k, 2.6 * s * k, bob - 1 * s * k], 0.6 * s, swell ? '#FFE04A' : '#9AE86A');   /* hairline cracks */
  tw_ln(ctx, [-6.4 * s * k, bob + 6 * s * k, -4.4 * s * k, bob + 4.4 * s * k, -5.4 * s * k, bob + 3.4 * s * k], 0.5 * s, swell ? '#FFE04A' : '#9AE86A');
  for (let i = 0; i < 4; i++){ const p = (a * 0.8 + i * 0.25) % 1; ctx.globalAlpha = 1 - p; fillCircle(ctx, (-4 + i * 3) * s * k, bob - (8 + p * 4) * s * k, (0.5 + p * 0.5) * s, '#CFFF9A'); } ctx.globalAlpha = 1;     /* leaking fumes */
  tw_rr(ctx, 8.6 * s * k, bob - 4.6 * s, 1.6 * s, 2 * s, 0.4 * s, '#6A707C'); tw_rr(ctx, 8.6 * s * k, bob + 2.6 * s, 1.6 * s, 2 * s, 0.4 * s, '#6A707C');
  for (const sd of [-1, 1]){ tw_ln(ctx, [9 * s * k, bob + sd * 6.6 * s, 11 * s * k, bob + sd * 9 * s], 0.6 * s, swell ? '#FFE04A' : '#CFFF6A'); fillCircle(ctx, 11.2 * s * k, bob + sd * 9.2 * s, 0.6 * s, '#FFFFFF'); }     /* sparks */
});

/* the Tower's bosses */
dt_wrap('tw_reception', null, function(ctx, e, b, dk, bob, d){
  const s = e.r / 52, a = e.anim, ring = e.state === 'ring';
  for (let i = 0; i < 4; i++) for (const sd of [-1, 1]){ const w = Math.sin(a * 1.1 + i * 1.7 + (sd > 0 ? 0 : 1.6)) * 4 * s, x0 = (24 - i * 17) * s, kx = x0 + 2 * s + w, ky = bob + sd * 36 * s;
    fillCircle(ctx, kx, ky, 2.6 * s, '#1E222A'); fillCircle(ctx, kx, ky, 1.8 * s, '#8A909C'); dt_bolt(ctx, kx, ky, 0.8 * s, '#E8ECF2'); dt_toes(ctx, x0 + 8 * s + w, bob + sd * 46 * s, sd * 1.3, 3, 4 * s, 1.1 * s, '#2A2E38'); }
  dt_bolts(ctx, [-35, -25, 35, -25, -35, 25, 35, 25, -35, 0, 35, 0], s, 1.5, '#C8A850');
  for (let k = 0; k < 6; k++){ const y = bob + (-27.6 + k * 1.2) * s; tw_ln(ctx, [-37 * s, y, -22 * s, y + 0.4 * s], 0.3 * s, tw_sh(b, 0.18)); tw_ln(ctx, [-37 * s, bob + (21 + k * 1.2) * s, -16 * s, bob + (21.4 + k * 1.2) * s], 0.3 * s, tw_sh(b, 0.18)); }     /* wood grain */
  for (const x of [-30, -10]){ tw_rr(ctx, x * s, bob + 22 * s, 12 * s, 6 * s, 1 * s, tw_sh(b, 0.2)); tw_rr(ctx, (x + 4) * s, bob + 24 * s, 4 * s, 1.6 * s, 0.6 * s, '#C8A850'); }     /* drawer fronts and pulls */
  tw_rr(ctx, -34 * s, bob - 26 * s, 12 * s, 7 * s, 1 * s, '#F4F0E8'); tw_rr(ctx, -33 * s, bob - 25 * s, 12 * s, 7 * s, 1 * s, '#E8E4DC'); for (let k = 0; k < 3; k++) tw_rect(ctx, -31 * s, bob + (-23.6 + k * 1.8) * s, 8 * s, 0.4 * s, '#8A8A9A');     /* a stack of forms */
  tw_rr(ctx, 4 * s, bob - 26 * s, 10 * s, 6 * s, 1.2 * s, '#2A2E38'); for (let k = 0; k < 6; k++) fillCircle(ctx, (6 + (k % 3) * 2.8) * s, bob + (-24.4 + (k >> 1) * 1.8) * s, 0.5 * s, '#C8CCD6'); tw_ln(ctx, [14 * s, bob - 23 * s, 18 * s, bob - 20 * s, 20 * s, bob - 24 * s], 0.5 * s, '#2A2E38');   /* the desk phone, its cord */
  tw_rr(ctx, -16 * s, bob + 17 * s, 16 * s, 5 * s, 1 * s, '#C8A850'); tw_rect(ctx, -14 * s, bob + 18.6 * s, 12 * s, 0.7 * s, '#4A3A18'); tw_rect(ctx, -14 * s, bob + 19.8 * s, 8 * s, 0.7 * s, '#4A3A18');                             /* a brass nameplate */
  for (let r = 0; r < 2; r++) for (let c = 0; c < 5; c++) tw_rect(ctx, (27 + c * 2.2) * s, bob + (6.8 + r * 2.4) * s, 1.6 * s, 1.6 * s, '#E8E4DC');     /* keys */
  for (let k = 0; k < 3; k++) tw_rect(ctx, 28.4 * s, bob + (-9.6 + k * 2.6) * s, (8 - k * 1.6) * s, 0.7 * s, 'rgba(255,255,255,.7)'); tw_poly(ctx, [27 * s, bob - 11 * s, 33 * s, bob - 11 * s, 27 * s, bob - 5 * s], 'rgba(255,255,255,.25)');     /* lines of text, glare */
  tw_rect(ctx, 31.4 * s, bob - 0.6 * s, 3 * s, 1.2 * s, '#2A2E38'); dt_led(ctx, 38 * s, bob - 1.6 * s, 0.6 * s, '#6AFFB0', true);
  for (const sd of [-1, 1]){ fillCircle(ctx, 16 * s, bob + sd * 12 * s, 1.6 * s, '#F4F0E8'); tw_rect(ctx, 14 * s, bob + sd * 12 * s - 0.5 * s, 2 * s, 1 * s, '#C8A850'); for (let k = 0; k < 4; k++) tw_ln(ctx, [17 * s, bob + sd * 12 * s, 19.4 * s, bob + sd * (12 + (k - 1.5) * 1.1) * s], 0.5 * s, '#E8C8A8'); }     /* cuffs and fingers */
  for (let k = 0; k < 10; k++) tw_ln(ctx, [(-10 - Math.cos(k * 0.6) * 4) * s, bob + 2 * s + Math.sin(k * 0.6) * 4.6 * s, (-14 - Math.cos(k * 0.6) * 4) * s, bob + 2 * s + Math.sin(k * 0.6) * 6 * s], 0.4 * s, '#2A1810');   /* hair strands */
  fillCircle(ctx, -12 * s, bob - 6 * s, 1 * s, '#C8A850'); fillCircle(ctx, -12 * s, bob + 10 * s, 1 * s, '#C8A850');
  if (ring) for (let k = 0; k < 4; k++) tw_ln(ctx, [(30 + k * 2) * s, bob + 14 * s, (33 + k * 2) * s, bob + (10 - k * 2) * s], 0.5 * s, '#FFE49A');
});
dt_wrap('tw_manager', function(ctx, e, b, dk, bob){
  const s = e.r / 56, a = e.anim, charge = e.state === 'charge' || e.state === 'chargewind';
  for (const sd of [-1, 1]){ const w = charge ? 0 : Math.sin(a * 1.4 + (sd > 0 ? 0 : 3)) * 5 * s; tw_rr(ctx, -30 * s + w, bob + sd * 11 * s - 1.4 * s, 4 * s, 2.8 * s, 0.8 * s, '#05060C'); for (let k = 0; k < 4; k++) tw_rect(ctx, (-27 + k * 1.2) * s + w, bob + sd * 11 * s - 2.6 * s, 0.4 * s, 5.2 * s, '#3A3E4A'); }
}, function(ctx, e, b, dk, bob, d){
  const s = e.r / 56, a = e.anim, charge = e.state === 'charge' || e.state === 'chargewind', st = e.state;
  for (const sd of [-1, 1]){ tw_ln(ctx, [-2 * s, bob + sd * 16 * s, 8 * s, bob + sd * 8 * s, 12 * s, bob + sd * 2 * s], 1.2 * s, tw_sh(b, 0.35)); lkOV(ctx, -8 * s, bob + sd * 26 * s, 6 * s, 3 * s, tw_li(b, 0.22));      /* lapels and shoulder pads */
    for (let k = 0; k < 4; k++) tw_ln(ctx, [(-20 + k * 4) * s, bob + sd * 30 * s, (-18 + k * 4) * s, bob + sd * 34 * s], 0.5 * s, tw_sh(b, 0.3)); }
  for (let k = 0; k < 3; k++) dt_bolt(ctx, (-3 + k * 3.2) * s, bob + (k % 2 ? 0.8 : -0.8) * s, 0.7 * s, '#C8A850');                         /* buttons */
  for (let k = 0; k < 4; k++) tw_ln(ctx, [(5 + k * 3.4) * s, bob - 1.6 * s, (6.4 + k * 3.4) * s, bob + 1.6 * s], 0.6 * s, '#E86A6A');     /* tie stripes */
  tw_rr(ctx, 2 * s, bob - 9 * s, 3 * s, 2 * s, 0.4 * s, '#F4F0E0'); lkTRI(ctx, 6 * s, bob + 8 * s, 8 * s, bob + 8 * s, 7 * s, bob + 11 * s, '#E86A6A');           /* pocket square, collar point */
  for (const sd of [-1, 1]){ const reach = charge ? 6 * s : sd > 0 ? Math.sin(a) * 3 * s : 0, ex = 14 * s + reach, ey = bob + sd * 20 * s; tw_rect(ctx, ex - 5.6 * s, ey - 4 * s, 2.4 * s, 8 * s, '#F4F4F8'); dt_bolt(ctx, ex - 4.4 * s, ey - 2.4 * s, 0.7 * s, '#C8A850'); dt_toes(ctx, ex + 3 * s, ey, sd * 0.3, 4, 3.6 * s, 1.3 * s, '#D8B898');
    tw_rr(ctx, ex - 9 * s, ey + sd * 1 * s - 1.4 * s, 4.4 * s, 2.8 * s, 0.8 * s, '#5A5E6A'); fillCircle(ctx, ex - 6.8 * s, ey + sd * 1 * s, 0.8 * s, '#E8ECF2'); }          /* cuffs, cufflinks, fingers, a watch */
  tw_rect(ctx, 16.4 * s, bob + 24.4 * s, 7 * s, 0.8 * s, '#8A8A9A'); fillCircle(ctx, 20 * s, bob + 20.8 * s, 1 * s, '#C8CCD6'); tw_ln(ctx, [22 * s, bob + 34.6 * s, 24 * s, bob + 35 * s], 0.5 * s, '#8A8A9A');
  for (const sd of [-1, 1]){ lkOV(ctx, 8 * s, bob + sd * 10.4 * s, 1.5 * s, 2.2 * s, '#D8B898'); tw_ln(ctx, [11 * s, bob + sd * 5 * s, 15 * s, bob + sd * 5.6 * s], 0.5 * s, '#2A1A10'); }       /* ears, a creased brow */
  for (let k = 0; k < 9; k++) tw_ln(ctx, [(2 + k * 1.4) * s, bob - 8.4 * s, (3 + k * 1.4) * s, bob - 11.4 * s], 0.4 * s, '#5A4A3A');             /* hair gel */
  tw_ln(ctx, [-26 * s, bob, -12 * s, bob], 0.5 * s, 'rgba(0,0,0,.25)'); for (let k = 0; k < 4; k++) tw_ln(ctx, [(-24 + k * 5) * s, bob - 16 * s, (-22 + k * 5) * s, bob - 20 * s], 0.4 * s, tw_sh(b, 0.3));
  if (st === 'meeting') for (let k = 0; k < 6; k++) fillCircle(ctx, Math.cos(k * 1.05 + a) * 40 * s, bob + Math.sin(k * 1.05 + a) * 40 * s, 2 * s, d.pale);
});
dt_wrap('tw_vault', null, function(ctx, e, b, dk, bob){
  const s = e.r / 66, a = e.anim, st = e.state, slam = st === 'slamwind' || st === 'quake';
  for (let k = 0; k < 9; k++){ const x = (-44 + k * 11) * s; dt_bolt(ctx, x, bob - 46 * s, 1.7 * s, '#B8BEC8'); dt_bolt(ctx, x, bob + 46 * s, 1.7 * s, '#B8BEC8'); }
  for (let k = 0; k < 7; k++){ const y = (-33 + k * 11) * s; dt_bolt(ctx, -52 * s, bob + y, 1.7 * s, '#B8BEC8'); dt_bolt(ctx, 52 * s, bob + y, 1.7 * s, '#B8BEC8'); }
  for (const sd of [-1, 1]){ tw_rr(ctx, -59 * s, bob + sd * 22 * s - 8 * s, 8 * s, 16 * s, 2 * s, '#5A606C'); tw_rr(ctx, -58 * s, bob + sd * 22 * s - 6 * s, 5 * s, 12 * s, 1.4 * s, '#C8A850'); dt_bolt(ctx, -55.4 * s, bob + sd * 22 * s - 3 * s, 1 * s, '#E8D890'); dt_bolt(ctx, -55.4 * s, bob + sd * 22 * s + 3 * s, 1 * s, '#E8D890'); }     /* hinge barrels */
  for (const sd of [-1, 1]){ const gx = -44 * s, gy = bob + sd * 24 * s; fillCircle(ctx, gx, gy, 6.4 * s, '#2A2E38'); fillCircle(ctx, gx, gy, 5.2 * s, '#E8ECF2'); for (let k = 0; k < 8; k++){ const an = k * TAU / 8; tw_ln(ctx, [gx + Math.cos(an) * 4 * s, gy + Math.sin(an) * 4 * s, gx + Math.cos(an) * 5 * s, gy + Math.sin(an) * 5 * s], 0.5 * s, '#2A2E38'); }
    const na = Math.sin(a * 0.8 + sd) * 1.2 + (slam ? 1.6 : 0); tw_ln(ctx, [gx, gy, gx + Math.cos(na) * 4 * s, gy + Math.sin(na) * 4 * s], 0.8 * s, DT_RED); fillCircle(ctx, gx, gy, 0.9 * s, '#2A2E38'); }     /* pressure gauges */
  for (let k = 0; k < 16; k++){ const an = k * TAU / 16 + 0.1; dt_bolt(ctx, 2 * s + Math.cos(an) * 43 * s, bob + Math.sin(an) * 43 * s, 1.1 * s, '#B8BEC8'); }      /* the ring of lock bolts */
  for (let k = 0; k < 12; k++){ const x = (-52 + k * 8.8) * s; tw_poly(ctx, [x, bob + 51 * s, x + 4.4 * s, bob + 51 * s, x + 2.6 * s, bob + 44.4 * s, x - 1.8 * s, bob + 44.4 * s], k % 2 ? '#1A1E26' : '#E8C84A'); }          /* a hazard stripe along the foot */
  for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) tw_rect(ctx, (39.6 + c * 3.6) * s, bob + (-4.6 + r * 3.6) * s, 2.4 * s, 2.4 * s, (r * 3 + c) % 4 === 1 ? '#6AFFB0' : '#9AA0AE');
  for (const sd of [-1, 1]){ tw_ln(ctx, [40 * s, bob + sd * 17.4 * s, 56 * s, bob + sd * 17.4 * s], 0.6 * s, '#10141C'); tw_ln(ctx, [41 * s, bob + sd * 30.4 * s, 55 * s, bob + sd * 30.4 * s], 0.6 * s, '#10141C'); }
  for (const [lx, ly] of [[22, -50], [22, 50], [-26, -48], [-26, 48]]){ const w = Math.sin(a * 1.1 + lx + ly) * 4 * s; for (let k = 0; k < 3; k++) tw_rect(ctx, (lx - 6 + k * 5) * s + w, bob + ly * s - 2.4 * s, 2.4 * s, 4.8 * s, '#2A2E38'); dt_bolt(ctx, lx * s + w, bob + ly * s, 1.6 * s, '#9AA0AE'); }
  for (let k = 0; k < 5; k++) tw_ln(ctx, [(-40 + k * 8) * s, bob - 40 * s, (-38 + k * 8) * s, bob - 33 * s], 0.5 * s, 'rgba(255,255,255,.28)');             /* scuffs and glints */
});
dt_wrap('tw_scientist', null, function(ctx, e, b, dk, bob, d){
  const s = e.r / 54, a = e.anim, st = e.state, flask = st === 'flaskwind', release = st === 'release', p2 = e.p2;
  for (let k = 0; k < 4; k++) dt_bolt(ctx, (-12 + k * 5) * s, bob + (k % 2 ? 1 : -1) * 0.2 * s, 0.8 * s, '#C8D4C8');                                  /* coat buttons */
  tw_rr(ctx, -22 * s, bob + 24 * s, 12 * s, 8 * s, 1 * s, '#E2E8E0'); tw_rect(ctx, -20 * s, bob + 22 * s, 1 * s, 5 * s, '#E86A6A'); tw_rect(ctx, -18 * s, bob + 22 * s, 1 * s, 5 * s, '#6AB8E8'); tw_rect(ctx, -16 * s, bob + 22 * s, 1 * s, 5 * s, '#2A2E38');       /* a breast pocket full of pens */
  tw_rr(ctx, -26 * s, bob - 8 * s, 6 * s, 5 * s, 0.8 * s, '#F4F0C8'); tw_rect(ctx, -25 * s, bob - 6.6 * s, 4 * s, 0.5 * s, '#4A8AE8'); tw_rect(ctx, -25 * s, bob - 5.4 * s, 3 * s, 0.5 * s, '#E86A6A');                           /* an ID badge */
  for (let k = 0; k < 6; k++) tw_ln(ctx, [(-24 + k * 7) * s, bob - 33 * s + k * 0.4 * s, (-22 + k * 7) * s, bob - 30 * s], 0.5 * s, '#C8D4C8');   /* coat pleats */
  for (let k = 0; k < 4; k++){ const bx = (-6 + k * 5) * s, by = bob + 16 * s; ctx.globalAlpha = 0.8; fillCircle(ctx, bx + 1.8 * s, by - 1.4 * s + Math.sin(a * 2 + k) * 0.6 * s, 0.7 * s, '#E8FFE8'); ctx.globalAlpha = 1; tw_rect(ctx, bx + 1 * s, by - 1.4 * s, 1.6 * s, 1 * s, '#C8CCD6'); }    /* test-tube corks */
  tw_ln(ctx, [-8 * s, bob + 14 * s, -2 * s, bob + 20 * s, 8 * s, bob + 26 * s], 0.9 * s, '#5A6A5A');        /* a tube from belt to arm */
  for (const sd of [-1, 1]){ const ex = (flask ? 30 : 26) * s, ey = bob + sd * 24 * s + (flask ? -sd * 4 * s : 0); tw_rect(ctx, ex - 9 * s, ey - 2.6 * s, 3 * s, 5.2 * s, '#6AAE5A');
    if (sd > 0){ for (let k = 0; k < 9; k++) tw_rect(ctx, ex + (3 + k * 2.6) * s, ey - 3 * s, 0.5 * s, (k % 2 ? 1.4 : 2.4) * s, '#4A6A5A'); tw_ln(ctx, [ex + 36 * s, ey, ex + 40 * s, ey], 0.5 * s, '#FFFFFF'); fillCircle(ctx, ex + 38 * s, ey - 1 * s, 0.6 * s, 'rgba(255,255,255,.8)'); tw_rect(ctx, ex - 6 * s, ey - 6 * s, 1 * s, 12 * s, '#C8CCD6'); }
    else { tw_rr(ctx, ex + 1.2 * s, ey - 13 * s, 5.6 * s, 2.4 * s, 0.8 * s, '#A8784A'); tw_rr(ctx, ex - 1 * s, ey - 1.6 * s, 10 * s, 4 * s, 0.6 * s, '#F4F0C8'); tw_rect(ctx, ex, ey - 0.4 * s, 7 * s, 0.5 * s, '#4A5A4A'); tw_rect(ctx, ex, ey + 0.8 * s, 5 * s, 0.5 * s, '#4A5A4A'); for (let k = 0; k < 3; k++) tw_ln(ctx, [ex + (4 + k * 2) * s - 6 * s, ey - 6.6 * s, ex + (5 + k * 2) * s - 6 * s, ey - 4.6 * s], 0.4 * s, 'rgba(255,255,255,.6)'); }
  }
  for (let k = 0; k < 7; k++){ const an = -0.9 + k * 0.3; tw_ln(ctx, [8 * s - Math.cos(an) * 12 * s, bob + Math.sin(an) * 13 * s, 8 * s - Math.cos(an) * 16 * s, bob + Math.sin(an) * 17 * s], 0.5 * s, k % 2 ? '#FFFFFF' : '#C8C8D0'); }      /* wild hair */
  for (const sd of [-1, 1]){ tw_ln(ctx, [12 * s, bob + sd * 9 * s, 21 * s, bob + sd * 8 * s], 1 * s, '#1A2A1E'); fillCircle(ctx, 11 * s, bob + sd * 9 * s, 1.2 * s, '#2A2E38'); ctx.strokeStyle = 'rgba(255,255,255,.7)'; ctx.lineWidth = 0.6 * s; ctx.beginPath(); ctx.arc(17.8 * s, bob + sd * 4.6 * s, 3.8 * s, -2.4, -1.2); ctx.stroke(); }    /* goggle strap and glass glints */
  if (p2) for (let k = 0; k < 4; k++){ const ph = (a * 0.6 + k * 0.25) % 1; ctx.globalAlpha = 1 - ph; fillCircle(ctx, (-10 + k * 6) * s, bob + (20 - ph * 14) * s, 1 * s, '#B8FF8A'); } ctx.globalAlpha = 1;
  if (release) for (let k = 0; k < 6; k++){ const an = k * 1.05 + a; fillCircle(ctx, Math.cos(an) * 46 * s, bob + Math.sin(an) * 46 * s, 2.4 * s, 'rgba(184,255,138,.5)'); }
});
dt_wrap('tw_ceo', null, function(ctx, e, b, dk, bob, d){
  const s = e.r / 62, a = e.anim, st = e.state, glow = e.glow || 0, ph = e.phase || 1, pulse = 0.6 + 0.4 * Math.sin(a * (2 + ph));
  for (let k = 0; k < 9; k++){ const x = (-24 + k * 4.4) * s, hw = Math.sqrt(Math.max(0, 1 - Math.pow((x + 2 * s) / (28 * s), 2))) * 40 * s; if (x > 4 * s) continue; tw_ln(ctx, [x, bob - hw * 0.9, x, bob - 18 * s], 0.4 * s, 'rgba(120,130,170,.45)'); tw_ln(ctx, [x, bob + 18 * s, x, bob + hw * 0.9], 0.4 * s, 'rgba(120,130,170,.45)'); }     /* pinstripes */
  for (let k = 0; k < 3; k++) fillCircle(ctx, (-8 + k * 5) * s, bob + (k % 2 ? 1.6 : -1.6) * s, 1 * s, TW_GOLD);                                    /* gold buttons */
  tw_rect(ctx, 6 * s, bob - 4 * s, 1.6 * s, 8 * s, TW_GOLD); tw_poly(ctx, [-2 * s, bob - 18 * s, 4 * s, bob - 12 * s, -2 * s, bob - 9 * s], '#E8E8EE'); tw_poly(ctx, [-2 * s, bob + 18 * s, 4 * s, bob + 12 * s, -2 * s, bob + 9 * s], '#E8E8EE');    /* tie bar, collar */
  tw_rr(ctx, 1 * s, bob - 24 * s, 8 * s, 5 * s, 1 * s, '#10121C'); tw_poly(ctx, [2 * s, bob - 24 * s, 5 * s, bob - 27 * s, 8 * s, bob - 24 * s], '#F4F4F8');       /* pocket square */
  for (const sd of [-1, 1]){ const reach = (st === 'penwind' || st === 'chutewind' ? 10 : st === 'takeover' ? 14 : 4) * s, ex = 18 * s + reach, ey = bob + sd * 26 * s - (st === 'takeover' ? sd * 6 * s : 0);
    tw_rect(ctx, ex - 8.4 * s, ey - 4.4 * s, 2.6 * s, 8.8 * s, '#F4F4F8'); dt_bolt(ctx, ex - 7 * s, ey - 2.6 * s, 0.9 * s, TW_GOLD); dt_bolt(ctx, ex - 7 * s, ey + 2.6 * s, 0.9 * s, TW_GOLD); dt_toes(ctx, ex + 4 * s, ey, sd * 0.3, 4, 4 * s, 1.5 * s, '#D0AC88');
    tw_rr(ctx, ex - 14 * s, ey + sd * 1 * s - 2 * s, 5 * s, 4 * s, 1 * s, '#10121C'); fillCircle(ctx, ex - 11.6 * s, ey + sd * 1 * s, 1.4 * s, '#E8ECF2'); fillCircle(ctx, ex - 11.6 * s, ey + sd * 1 * s, 0.8 * s, TW_GOLD);      /* cuffs, a gold watch */
    if (sd > 0){ tw_ln(ctx, [ex + 4 * s, ey - 0.4 * s, ex + 12 * s, ey - 1.2 * s], 0.5 * s, '#FFFFFF'); for (let k = 0; k < 3; k++) tw_rect(ctx, ex + (14 + k * 6) * s, ey - 3.4 * s - k * 0.3 * s, 1.2 * s, 1.6 * s, TW_GOLD); tw_ln(ctx, [ex + 38 * s, ey - 5.4 * s, ex + 46 * s, ey - 4.2 * s], 0.5 * s, '#FFFFFF'); } }       /* the pen's clip and bands */
  for (let k = 0; k < 7; k++){ const x = (4 + k * 3) * s; fillCircle(ctx, x + 0.6 * s, bob - (18 + (k % 2) * 3) * s, 0.9 * s, k % 3 === 1 ? '#FF5A4A' : '#6AFFB0'); }       /* jewels on the crown */
  tw_ln(ctx, [5 * s, bob - 11 * s, 21 * s, bob - 10 * s], 0.5 * s, '#B8962A');
  for (const sd of [-1, 1]){ lkOV(ctx, 10 * s, bob + sd * 12.6 * s, 1.6 * s, 2.4 * s, '#D0AC88'); tw_ln(ctx, [19 * s, bob + sd * 7.6 * s, 23 * s, bob + sd * 5.6 * s], 0.8 * s, '#10121C'); }
  for (let k = 0; k < 5; k++) tw_ln(ctx, [(6 + k * 3.4) * s, bob + 11 * s, (7 + k * 3.4) * s, bob + 12.6 * s], 0.5 * s, '#9AA0AE');
  for (const sd of [-1, 1]) for (let k = 0; k < 3; k++) tw_rect(ctx, (-30 + k * 3) * s, bob + sd * 12 * s - 0.4 * s, 1 * s, 0.8 * s, '#2A2E3A');          /* shoe soles */
  if (glow > 0.2) for (let k = 0; k < 6; k++){ const an = k * 1.05 + a * 0.8; fillCircle(ctx, Math.cos(an) * 56 * s, bob + Math.sin(an) * 56 * s, (1.2 + glow) * s, 'rgba(255,228,154,' + (0.5 * glow + 0.2) + ')'); }
});

/* ======================= Chapter 15: the Siege ======================= */
dt_wrap('sg_patrol', function(ctx, e, b, dk, bob){
  const s = e.r / 13, a = e.anim * 2.4;
  for (let i = 0; i < 2; i++) for (const sd of [-1, 1]){ const w = Math.sin(a + i * Math.PI + (sd > 0 ? 0 : 1.6)) * 3 * s, x0 = (7 - i * 12) * s; fillCircle(ctx, x0 + 2 * s + w, bob + sd * 9 * s, 1.5 * s, '#4A505C'); dt_toes(ctx, x0 + w * 1.4, bob + sd * 12 * s, sd * 1.3, 3, 2.2 * s, 0.8 * s, '#2A2E38'); }
}, function(ctx, e, b, dk, bob){
  const s = e.r / 13, lunge = e.state === 'lunge';
  dt_bolts(ctx, [-12, -4, -12, 4, 7, -4, 7, 4, -4, -4.2, -4, 4.2], s, 0.55);
  dt_vent(ctx, -11 * s, bob - 1.8 * s, 5 * s, 3.6 * s, 4, '#1C2028', false);
  tw_rect(ctx, -5.4 * s, bob - 5 * s, 0.7 * s, 10 * s, 'rgba(0,0,0,.2)'); tw_rect(ctx, 2 * s, bob - 5 * s, 0.7 * s, 10 * s, 'rgba(0,0,0,.2)');
  tw_poly(ctx, [-2 * s, bob - 5 * s, 2 * s, bob - 5 * s, 0, bob - 2 * s], '#E8C84A'); tw_poly(ctx, [-2 * s, bob + 5 * s, 2 * s, bob + 5 * s, 0, bob + 2 * s], '#E8C84A');
  dt_wire(ctx, [-6 * s, bob - 3 * s, -3 * s, bob - 6 * s, 3 * s, bob - 6.4 * s, 9 * s, bob - 4.4 * s], 0.5 * s, '#E8A83A');
  for (const sd of [-1, 1]){ tw_rr(ctx, 12 * s, bob + sd * 4.8 * s - 0.8 * s, 4 * s, 1.6 * s, 0.4 * s, '#2A2E38'); dt_led(ctx, 10 * s, bob + sd * 3.6 * s, 0.6 * s, lunge ? '#FFE04A' : SG_RED, true); }
  tw_ln(ctx, [9 * s, bob - 5 * s, 7 * s, bob - 9 * s], 0.5 * s, '#C8CCD4'); dt_led(ctx, 6.8 * s, bob - 9.4 * s, 0.7 * s, '#6AFFB0', Math.sin(e.anim * 3) > 0);
  tw_rr(ctx, 15.4 * s, bob - 1.4 * s, 2.4 * s, 2.8 * s, 0.4 * s, '#8A909C'); for (let k = 0; k < 3; k++) tw_rect(ctx, 16 * s, bob + (-1 + k * 0.9) * s, 1.4 * s, 0.35 * s, '#2A2E38');
});
dt_wrap('sg_maggot', null, function(ctx, e, b, dk, bob){
  const s = e.r / 6, a = e.anim * 3;
  for (let i = 3; i >= 0; i--){ const w = Math.sin(a - i * 0.9) * 1.1 * s, x = (-3 - i * 3.2) * s, rx = (3.7 - i * 0.4) * s; tw_ln(ctx, [x, bob + w - rx * 0.7, x, bob + w + rx * 0.7], 0.35 * s, tw_sh(b, 0.35));
    for (const sd of [-1, 1]){ fillCircle(ctx, x, bob + w + sd * rx * 0.55, 0.45 * s, SG_LIME); fillCircle(ctx, x - 0.3 * s, bob + w + sd * rx * 0.9, 0.6 * s, tw_sh(b, 0.25)); } }
  for (let k = 0; k < 5; k++){ const ph = (e.anim * 0.8 + k * 0.2) % 1; ctx.globalAlpha = 0.8 * (1 - ph); fillCircle(ctx, (-9 + k * 2.6) * s, bob + (k % 2 ? -1 : 1) * (1 + ph * 2) * s, 0.35 * s, '#F4FFD0'); } ctx.globalAlpha = 1;
  for (const sd of [-1, 1]){ tw_ln(ctx, [5.4 * s, bob + sd * 1.6 * s, 7.6 * s, bob + sd * 3 * s], 0.4 * s, '#E8FFC0'); fillCircle(ctx, 7.7 * s, bob + sd * 3.1 * s, 0.4 * s, '#F4FFD0'); }
  lkOV(ctx, 5.2 * s, bob, 0.9 * s, 1.2 * s, '#20400E');
});
dt_wrap('sg_skitter', null, function(ctx, e, b, dk, bob){
  const s = e.r / 11, a = e.anim * 9, dash = e.state === 'dash' || e.state === 'wind';
  for (const [ax, ay] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]){ const x = ax * 9 * s, y = bob + ay * 9 * s; fillCircle(ctx, x, y, 1.4 * s, '#2A2E38'); dt_bolt(ctx, x, y, 0.7 * s, '#8A909C'); fillCircle(ctx, ax * 4.6 * s, bob + ay * 4.6 * s, 0.9 * s, '#3A2E14');
    ctx.strokeStyle = 'rgba(40,44,52,.6)'; ctx.lineWidth = 0.5 * s; ctx.beginPath(); ctx.arc(x, y, 7.6 * s, 0, TAU); ctx.stroke(); }
  dt_bolts(ctx, [-3, -3.6, 3, -3.6, -3, 3.6, 3, 3.6], s, 0.5);
  tw_rr(ctx, -4 * s, bob - 5.2 * s, 5 * s, 1.4 * s, 0.4 * s, tw_sh(b, 0.3)); tw_rr(ctx, -4 * s, bob + 3.8 * s, 5 * s, 1.4 * s, 0.4 * s, tw_sh(b, 0.3));
  dt_led(ctx, -3.6 * s, bob, 0.7 * s, dash ? '#FFE04A' : '#6AFFB0', Math.sin(e.anim * 4) > -0.2);
  tw_ln(ctx, [-5.6 * s, bob, -8.6 * s, bob + 1 * s], 0.5 * s, '#C8CCD4'); dt_led(ctx, -8.8 * s, bob + 1.1 * s, 0.5 * s, SG_RED, true);
  ctx.strokeStyle = 'rgba(0,0,0,.35)'; ctx.lineWidth = 0.6 * s; ctx.beginPath(); ctx.arc(4 * s, bob, 3 * s, 0, TAU); ctx.stroke();
});
dt_wrap('sg_raptor', function(ctx, e, b, dk, bob){
  const s = e.r / 14, a = e.anim * 3;
  for (const sd of [-1, 1]){ const w = Math.sin(a + (sd > 0 ? 0 : Math.PI)) * 6 * s; dt_toes(ctx, -14 * s + w * 1.6, bob + sd * 7 * s, Math.PI, 3, 3 * s, 0.9 * s, '#1A2230'); dt_toes(ctx, 8.6 * s - w + 5 * s, bob + sd * 6 * s, 0, 3, 2.6 * s, 0.8 * s, '#1A2230'); }
}, function(ctx, e, b, dk, bob){
  const s = e.r / 14, a = e.anim * 3, run = e.state === 'wind' || e.state === 'roll';
  for (const sd of [-1, 1]){ const w = Math.sin(a + (sd > 0 ? 0 : Math.PI)) * 6 * s; fillCircle(ctx, -9 * s + w, bob + sd * 8 * s, 1.6 * s, '#2A3A5A'); dt_bolt(ctx, -9 * s + w, bob + sd * 8 * s, 0.7 * s, '#8AB8FF'); }
  for (let k = 0; k < 5; k++) tw_rect(ctx, (-9 + k * 3.4) * s, bob - 3.4 * s - Math.abs(k - 2) * 0.3 * s, 1.8 * s, 6.4 * s, 'rgba(10,20,50,.22)');
  tw_ln(ctx, [-12 * s, bob - 1.4 * s, 10 * s, bob - 1.4 * s], 0.5 * s, '#8AB8FF'); tw_ln(ctx, [-12 * s, bob + 1.4 * s, 10 * s, bob + 1.4 * s], 0.5 * s, '#8AB8FF');
  dt_bolts(ctx, [-2, -4, -2, 4, 5, -3.6, 5, 3.6], s, 0.5);
  for (const sd of [-1, 1]){ lkTRI(ctx, 10 * s, bob + sd * 3 * s, 13 * s, bob + sd * 5 * s, 14 * s, bob + sd * 3 * s, '#2A3A5A'); dt_led(ctx, 15.6 * s, bob + sd * 1.8 * s, 0.6 * s, run ? '#FFE04A' : SG_RED, true); }
  tw_rect(ctx, -18 * s, bob - 0.5 * s, 4 * s, 1 * s, '#2A3A5A'); tw_rect(ctx, -22 * s, bob - 1.4 * s + Math.sin(a) * 2 * s, 1.8 * s, 2.8 * s, '#8AB8FF');
});
dt_wrap('sg_dozer', null, function(ctx, e, b, dk, bob){
  const s = e.r / 15, a = e.anim * 1.6;
  for (const sd of [-1, 1]){ for (let k = 0; k < 4; k++){ fillCircle(ctx, (-9 + k * 6.6) * s, bob + sd * 10 * s, 1.5 * s, '#3A3E48'); dt_bolt(ctx, (-9 + k * 6.6) * s, bob + sd * 10 * s, 0.6 * s, '#8A909C'); } tw_rect(ctx, -14 * s, bob + sd * 10 * s - 0.3 * s, 26 * s, 0.6 * s, 'rgba(255,255,255,.1)'); }
  dt_bolts(ctx, [-10, -5.6, 8, -5.6, -10, 5.6, 8, 5.6], s, 0.6);
  dt_vent(ctx, -10 * s, bob - 3.6 * s, 6 * s, 7.2 * s, 5, '#8A6A1A', false);
  tw_rr(ctx, 1 * s, bob - 3.2 * s, 5 * s, 6.4 * s, 1 * s, '#3A4250'); tw_rect(ctx, 1.8 * s, bob - 2.4 * s, 3.4 * s, 2 * s, '#8CC8E0'); tw_ln(ctx, [2.2 * s, bob - 2.2 * s, 3.6 * s, bob - 0.8 * s], 0.4 * s, '#FFFFFF');
  for (const sd of [-1, 1]){ tw_rect(ctx, 11 * s, bob + sd * 11 * s - 1 * s, 2 * s, 2 * s, '#8A909C'); tw_ln(ctx, [13 * s, bob + sd * 11 * s, 14.4 * s, bob + sd * 11 * s], 1 * s, '#C8CCD4'); }
  for (let k = 0; k < 6; k++) tw_poly(ctx, [15 * s, bob + (-11 + k * 4.4) * s, 17.4 * s, bob + (-11 + k * 4.4) * s, 17.4 * s, bob + (-9 + k * 4.4) * s], '#8A6A1A');
  dt_led(ctx, -10 * s, bob - 7.6 * s, 0.7 * s, '#FFB84A', Math.sin(e.anim * 2) > 0); tw_rect(ctx, 11.4 * s, bob - 4 * s, 1.2 * s, 8 * s, 'rgba(0,0,0,.25)');
  for (let k = 0; k < 3; k++){ const ph = (e.anim * 0.5 + k * 0.33) % 1; ctx.globalAlpha = 0.5 * (1 - ph); fillCircle(ctx, -17.4 * s - ph * 3 * s, bob - 8.6 * s - ph * 3 * s, (1.2 + ph) * s, '#7A7A80'); } ctx.globalAlpha = 1;
});
dt_wrap('sg_spotter', null, function(ctx, e, b, dk, bob){
  const s = e.r / 10, a = e.anim * 7, aim = e.state === 'aim';
  for (const sd of [-1, 1]){ fillCircle(ctx, -2 * s, bob + sd * 4 * s, 1.1 * s, '#4A505C'); fillCircle(ctx, -2 * s, bob + sd * 9 * s, 1.3 * s, '#2A2E38'); dt_bolt(ctx, -2 * s, bob + sd * 9 * s, 0.6 * s, '#8A909C'); }
  for (let k = 0; k < 6; k++){ const an = k * TAU / 6; fillCircle(ctx, 5 * s + Math.cos(an) * 3.3 * s, bob + Math.sin(an) * 3.3 * s, 0.4 * s, '#2A2E38'); }
  ctx.strokeStyle = tw_sh(b, 0.4); ctx.lineWidth = 0.5 * s; ctx.beginPath(); ctx.arc(0, bob, 5 * s, 2, 4.3); ctx.stroke();
  tw_rr(ctx, -6 * s, bob - 1.4 * s, 3 * s, 2.8 * s, 0.6 * s, '#3A4250'); dt_led(ctx, -4.6 * s, bob, 0.7 * s, aim ? '#FFE04A' : '#6AFFB0', Math.sin(e.anim * 4) > -0.3);
  tw_ln(ctx, [-6.4 * s, bob, -9.6 * s, bob - 2 * s], 0.5 * s, '#C8CCD4'); tw_ln(ctx, [-6.4 * s, bob, -9 * s, bob + 2.4 * s], 0.5 * s, '#C8CCD4'); fillCircle(ctx, -9.8 * s, bob - 2.2 * s, 0.5 * s, SG_RED);
  ctx.strokeStyle = 'rgba(255,255,255,.5)'; ctx.lineWidth = 0.5 * s; ctx.beginPath(); ctx.arc(5 * s, bob, 3.2 * s, -2.6, -1.2); ctx.stroke(); fillCircle(ctx, 6.2 * s, bob + 1.2 * s, 0.5 * s, 'rgba(255,255,255,.5)');
});
dt_wrap('sg_hornback', function(ctx, e, b, dk, bob){
  const s = e.r / 17, a = e.anim * 1.8;
  for (const sd of [-1, 1]) for (let i = 0; i < 2; i++){ const w = Math.sin(a + i * Math.PI + (sd > 0 ? 0 : 1.4)) * 2.6 * s, x = (7 - i * 14) * s + w, y = bob + sd * 10 * s; for (let k = 0; k < 3; k++) lkOV(ctx, x + (k - 1) * 1.8 * s, y + sd * 2.6 * s, 1.1 * s, 1.4 * s, '#2A2E24'); tw_ln(ctx, [x, bob + sd * 7 * s, x, y], 2.6 * s, tw_sh(b, 0.35)); }
}, function(ctx, e, b, dk, bob){
  const s = e.r / 17, charge = e.state === 'dash' || e.state === 'charge';
  for (let k = 0; k < 4; k++) for (const sd of [-1, 1]){ const x = (-9 + k * 5) * s; for (const [oy, r] of [[4.4, 1], [6.6, 0.8]]) dt_bolt(ctx, x, bob + sd * oy * s, r * s, tw_li(b, 0.4)); fillCircle(ctx, x + 1.4 * s, bob + sd * 2.4 * s, 0.5 * s, SG_LIME); }
  for (let k = 0; k < 4; k++){ const x = (-9 + k * 5) * s; tw_ln(ctx, [x, bob - 2 * s, x + 2 * s, bob - 4 * s, x + 1 * s, bob - 5 * s], 0.4 * s, SG_LIME); tw_ln(ctx, [x, bob + 2 * s, x + 2 * s, bob + 4 * s, x + 1 * s, bob + 5 * s], 0.4 * s, SG_LIME); }
  for (let k = 0; k < 4; k++){ tw_poly(ctx, [(-14 + k * 1) * s, bob - 3 * s, (-13 + k * 1) * s, bob - 5 * s, (-12 + k * 1) * s, bob - 3 * s], tw_sh(b, 0.35)); }
  for (const sd of [-1, 1]){ lkTRI(ctx, 13 * s, bob + sd * 6.6 * s, 15.6 * s, bob + sd * 9.4 * s, 16 * s, bob + sd * 6 * s, '#F0E8C8'); lkOV(ctx, 18 * s, bob + sd * 2 * s, 1.6 * s, 1 * s, tw_sh(b, 0.3)); fillCircle(ctx, 16 * s, bob + sd * 3.4 * s, 0.4 * s, '#10200A'); }
  for (let k = 0; k < 3; k++) tw_ln(ctx, [(20 + k * 2.4) * s, bob - 1.2 * s + k * 0.1, (21.4 + k * 2.4) * s, bob], 0.4 * s, '#FFFFFF');
  tw_ln(ctx, [-18 * s, bob, -21 * s, bob + 1 * s, -22 * s, bob - 1 * s], 0.9 * s, dk); fillCircle(ctx, -22.4 * s, bob - 1 * s, 1.2 * s, tw_sh(b, 0.3));
  if (charge) for (let k = 1; k < 4; k++) tw_ln(ctx, [(-22 - k * 4) * s, bob + (k - 2) * 3 * s, (-27 - k * 4) * s, bob + (k - 2) * 3 * s], 0.6 * s, 'rgba(255,255,255,.5)');
});
dt_wrap('sg_hurler', null, function(ctx, e, b, dk, bob){
  const s = e.r / 14, a = e.anim * 2, lob = e.state === 'lobwind' || e.state === 'lob';
  for (const sd of [-1, 1]){ const w = Math.sin(a + (sd > 0 ? 0 : Math.PI)) * 2.4 * s; dt_toes(ctx, -11.4 * s + w, bob + sd * 7 * s, Math.PI, 3, 2.2 * s, 0.9 * s, tw_sh(b, 0.35)); }
  for (let k = 0; k < 9; k++){ const x = (-10 + k * 1.2) * s; tw_ln(ctx, [x, bob - 6 * s + (k % 3) * 0.6 * s, x - 1.6 * s, bob - 8 * s], 0.5 * s, tw_li(b, 0.2)); tw_ln(ctx, [x, bob + 6 * s - (k % 3) * 0.6 * s, x - 1.6 * s, bob + 8 * s], 0.5 * s, tw_li(b, 0.2)); }
  for (const [x, y, r] of [[-2, -3, 1.4], [-6, 2.4, 1.1], [-4, 5, 1.6], [1, 3.4, 1]]){ fillCircle(ctx, x * s, bob + y * s, r * s, 'rgba(200,160,255,.7)'); fillCircle(ctx, x * s - 0.3 * s, bob + y * s - 0.3 * s, r * 0.4 * s, '#F0E0FF'); }
  for (const sd of [-1, 1]){ const big = sd > 0, ex = (lob && big ? 4 : 10) * s, ey = bob + sd * (big ? 15 : 10) * s - (lob && big ? 8 * s : 0); fillCircle(ctx, 5 * s, bob + sd * 11 * s, (big ? 2.6 : 1.8) * s, tw_sh(b, 0.2)); dt_toes(ctx, ex, ey, sd * 1.2, big ? 4 : 3, (big ? 4 : 2.6) * s, (big ? 1.6 : 1) * s, tw_sh(b, 0.25)); }
  for (const sd of [-1, 1]){ lkOV(ctx, 11 * s, bob + sd * 5 * s, 1.2 * s, 1.8 * s, tw_sh(b, 0.2)); tw_ln(ctx, [10 * s, bob + sd * 1.4 * s, 13 * s, bob + sd * 1.8 * s], 0.5 * s, '#4A3A2A'); tw_ln(ctx, [8 * s, bob + sd * 2.6 * s, 11 * s, bob + sd * 3.4 * s], 0.5 * s, tw_sh(b, 0.4)); }
  for (let k = 0; k < 3; k++) fillCircle(ctx, (13 + (k % 2) * 0.8) * s, bob + (k - 1) * 0.9 * s, 0.35 * s, '#4A3A2A');
});
dt_wrap('sg_sapper', function(ctx, e, b, dk, bob){
  const s = e.r / 10, a = e.anim * 4;
  for (let i = 0; i < 3; i++) for (const sd of [-1, 1]){ const w = Math.sin(a + i * 2.1 + (sd > 0 ? 0 : 1.6)) * 1.8 * s; fillCircle(ctx, (5 - i * 4) * s + w, bob + sd * 8.6 * s, 1.6 * s, '#2A2E38'); dt_toes(ctx, (5 - i * 4) * s + w, bob + sd * 8.6 * s, sd * 1.4, 2, 1.8 * s, 0.7 * s, '#2A2E38'); }
}, function(ctx, e, b, dk, bob){
  const s = e.r / 10, blink = Math.sin(e.anim * 3) > 0;
  ctx.strokeStyle = tw_sh(b, 0.4); ctx.lineWidth = 0.5 * s; ctx.beginPath(); ctx.arc(0, bob, 7 * s, 0.4, 2.7); ctx.stroke(); ctx.beginPath(); ctx.arc(0, bob, 7 * s, 3.6, 5.9); ctx.stroke();
  dt_bolts(ctx, [-5.4, -2, -5.4, 2, -6.4, 0, 2, -6.6, 2, 6.6], s, 0.55, '#6A4A3A');
  for (const sd of [-1, 1]){ for (let k = 0; k < 3; k++) tw_rect(ctx, (-2 + k * 2.4) * s, bob + sd * 6 * s - 2.1 * s, 0.6 * s, 4.2 * s, '#1A1008'); dt_led(ctx, 4.4 * s, bob + sd * 6 * s, 0.5 * s, SG_RED, blink); tw_ln(ctx, [-3 * s, bob + sd * 4 * s, -5 * s, bob + sd * 2 * s], 0.5 * s, '#E8A83A'); }
  for (let k = 0; k < 6; k++){ const ph = (e.anim * 2 + k / 6) % 1; if (blink) { ctx.globalAlpha = 1 - ph; fillCircle(ctx, 2 * s + Math.cos(k * 1.6) * ph * 3 * s, bob - 11.4 * s - ph * 3 * s, 0.4 * s, '#FFE04A'); } } ctx.globalAlpha = 1;
  tw_rr(ctx, -2.6 * s, bob - 6.6 * s, 5.2 * s, 1.2 * s, 0.4 * s, '#C8A060'); lkOV(ctx, -3 * s, bob - 3 * s, 2.4 * s, 1 * s, 'rgba(255,255,255,.35)', -0.6);
  tw_rect(ctx, 3.4 * s, bob - 3.4 * s, 2 * s, 0.6 * s, '#3A2A24'); tw_rect(ctx, 3.4 * s, bob + 2.8 * s, 2 * s, 0.6 * s, '#3A2A24');
});
dt_wrap('sg_glassfang', null, function(ctx, e, b, dk, bob){
  const s = e.r / 11, a = e.anim * 2.2, n = 9, lunge = e.state === 'lunge';
  for (let i = n - 1; i >= 0; i--){ const x = (8 - i * 4.2) * s, y = bob + Math.sin(a - i * 0.7) * 3.4 * s * (0.5 + i / n), r = (4.6 - i * 0.38) * s;
    tw_poly(ctx, [x + r * 0.3, y - r * 0.9, x - r * 0.5, y - r * 1.5, x - r * 0.6, y - r * 0.8], '#C8FFF0'); tw_poly(ctx, [x + r * 0.3, y + r * 0.9, x - r * 0.5, y + r * 1.5, x - r * 0.6, y + r * 0.8], '#C8FFF0');
    ctx.strokeStyle = 'rgba(255,255,255,.4)'; ctx.lineWidth = 0.4 * s; ctx.beginPath(); ctx.arc(x, y, r * 0.7, 3.4, 5); ctx.stroke(); fillCircle(ctx, x + r * 0.2, y, r * 0.22, i % 2 ? '#F0FFFC' : '#7AF0D8'); }
  for (let k = 0; k < 4; k++){ const ph = (e.anim * 0.7 + k / 4) % 1; ctx.globalAlpha = 1 - ph; fillCircle(ctx, (6 - k * 8) * s, bob + Math.sin(k * 2.4) * (4 + ph * 2) * s, 0.5 * s, '#CFFFF4'); } ctx.globalAlpha = 1;
  for (const sd of [-1, 1]){ tw_ln(ctx, [13.6 * s, bob + sd * 0.8 * s, 16 * s, bob + sd * 2.4 * s, lunge ? 18 * s : 15.6 * s, bob + sd * 3.4 * s], 0.5 * s, '#F0FFFC'); lkTRI(ctx, 8 * s, bob + sd * 4 * s, 10 * s, bob + sd * 6.6 * s, 11.4 * s, bob + sd * 4 * s, '#C8FFF0'); }
  tw_ln(ctx, [15 * s, bob, lunge ? 20 * s : 17 * s, bob], 0.4 * s, '#FF5A8A');
});
dt_wrap('sg_torch', function(ctx, e, b, dk, bob){
  const s = e.r / 12, a = e.anim * 3;
  for (const sd of [-1, 1]) for (const x of [-6, 5]){ for (let k = 0; k < 3; k++) tw_rect(ctx, (x - 2 + k * 1.6) * s, bob + sd * 9 * s - 2.4 * s, 0.6 * s, 4.8 * s, '#3A3E48'); }
}, function(ctx, e, b, dk, bob){
  const s = e.r / 12, fire = e.state === 'burn' || e.state === 'burnwind';
  dt_bolts(ctx, [-8, -5.6, 6, -5.6, -8, 5.6, 6, 5.6], s, 0.55);
  for (const x of [-6, -2.6, 0.8]) tw_rect(ctx, x * s, bob - 7 * s, 0.6 * s, 14 * s, 'rgba(0,0,0,.25)');
  tw_rr(ctx, -3 * s, bob - 5.6 * s, 6 * s, 3 * s, 0.6 * s, '#C8CCD6'); tw_rect(ctx, -2 * s, bob - 4.4 * s, 4 * s, 0.5 * s, '#2A2E38'); fillCircle(ctx, -6.6 * s, bob + 3.6 * s, 1.4 * s, '#2A2E38'); tw_ln(ctx, [-6.6 * s, bob + 3.6 * s, -6 * s, bob + 2.4 * s], 0.5 * s, DT_RED);
  dt_wire(ctx, [5 * s, bob - 5 * s, 8 * s, bob - 7 * s, 12 * s, bob - 4 * s, 14 * s, bob - 2.6 * s], 0.7 * s, '#4A4A52'); dt_wire(ctx, [5 * s, bob + 5 * s, 8 * s, bob + 7 * s, 12 * s, bob + 4 * s, 14 * s, bob + 2.6 * s], 0.7 * s, '#4A4A52');
  for (const sd of [-1, 1]){ tw_rect(ctx, 13.4 * s, bob + sd * 2.4 * s - 0.3 * s, 2.4 * s, 0.6 * s, '#E8A83A'); tw_rr(ctx, 14 * s, bob - 2.6 * s, 0.9 * s, 5.2 * s, 0.3 * s, '#6A707C'); }
  dt_led(ctx, 10 * s, bob + 3.2 * s, 0.6 * s, fire ? '#FF8A3A' : '#6AFFB0', true);
  for (let k = 0; k < 5; k++){ const ph = (e.anim * (fire ? 3 : 1.4) + k / 5) % 1; ctx.globalAlpha = 0.9 * (1 - ph); fillCircle(ctx, (18 + ph * (fire ? 9 : 4)) * s, bob + Math.sin(k * 5) * 2 * s * ph, 0.5 * s, '#FFE890'); } ctx.globalAlpha = 1;
});
dt_wrap('sg_gnawer', function(ctx, e, b, dk, bob){
  const s = e.r / 13, a = e.anim * 2.6;
  for (let i = 0; i < 3; i++) for (const sd of [-1, 1]){ const w = Math.sin(a + i * 2 + (sd > 0 ? 0 : 1.4)) * 2 * s; fillCircle(ctx, (7 - i * 6) * s + w, bob + sd * 11 * s, 1.5 * s, tw_li(b, 0.15)); dt_toes(ctx, (4 - i * 6) * s + w, bob + sd * 13.4 * s, sd * 1.3, 2, 2.2 * s, 0.9 * s, '#2A3A10'); }
}, function(ctx, e, b, dk, bob){
  const s = e.r / 13, chew = Math.sin(e.anim * 6) * 1.6 * s;
  for (let k = 0; k < 3; k++) for (const sd of [-1, 1]) for (let j = 0; j < 3; j++) fillCircle(ctx, (-12 + k * 4.4) * s, bob + sd * (2 + j * 2.4) * s, 0.55 * s, tw_li(b, 0.45));
  for (const sd of [-1, 1]){ tw_ln(ctx, [-6 * s, bob + sd * 1 * s, -6 * s, bob + sd * 8 * s], 0.5 * s, tw_sh(b, 0.3)); lkOV(ctx, -13 * s, bob + sd * 5.6 * s, 2 * s, 1.2 * s, SG_LIME); }
  for (const sd of [-1, 1]){ for (let k = 0; k < 4; k++) tw_ln(ctx, [(10.6 + k * 1.6) * s, bob + sd * (2.4 + k * 0.4) * s, (11.4 + k * 1.6) * s, bob + sd * (3.8 + k * 0.4) * s], 0.4 * s, '#8A9A50');
    tw_ln(ctx, [8 * s, bob + sd * 4.4 * s, 12 * s, bob + sd * 6.6 * s], 0.7 * s, tw_sh(b, 0.3)); fillCircle(ctx, 12.4 * s, bob + sd * 6.8 * s, 0.7 * s, '#E8F0B0'); }
  for (let k = 0; k < 4; k++){ const ph = (e.anim * 1.2 + k / 4) % 1; ctx.globalAlpha = 1 - ph; fillCircle(ctx, (14 + ph * 2) * s, bob + (k - 1.5) * 1.2 * s + chew * 0.4, 0.5 * s, '#D8C890'); } ctx.globalAlpha = 1;
  for (const sd of [-1, 1]) tw_ln(ctx, [8.6 * s, bob + sd * 1 * s, 12 * s, bob + sd * 1.4 * s], 0.5 * s, '#2A3A10');
});

/* the Siege's bosses */
dt_wrap('sg_walker', function(ctx, e, b, dk, bob){
  const s = e.r / 56, a = e.anim * 1.4;
  for (const sd of [-1, 1]) for (let i = 0; i < 2; i++){ const w = Math.sin(a + i * Math.PI + (sd > 0 ? 0 : 1.2)) * 9 * s, x0 = (24 - i * 40) * s; for (let k = 0; k < 4; k++) tw_ln(ctx, [x0 + 2 * s + w * 1.5, bob + sd * 50 * s, x0 + (2 + (k - 1.5) * 4) * s + w * 1.5, bob + sd * 58 * s], 2 * s, '#1C1E24'); }
}, function(ctx, e, b, dk, bob){
  const s = e.r / 56, a = e.anim * 1.4, st = e.state, glow = st === 'stompwind' || st === 'cannonwind' ? 1 : 0;
  for (const sd of [-1, 1]) for (let i = 0; i < 2; i++){ const w = Math.sin(a + i * Math.PI + (sd > 0 ? 0 : 1.2)) * 9 * s, x0 = (24 - i * 40) * s, kx = x0 + 6 * s + w, ky = bob + sd * 36 * s;
    fillCircle(ctx, kx, ky, 5 * s, '#1C1E24'); fillCircle(ctx, kx, ky, 3.8 * s, '#6A707C'); dt_bolt(ctx, kx, ky, 1.6 * s, '#C8CCD6'); tw_rr(ctx, x0 - 2 * s, bob + sd * 20 * s - 3 * s, 6 * s, 6 * s, 1.4 * s, '#3A3E48');
    tw_ln(ctx, [x0, bob + sd * 21 * s, kx, ky - sd * 4 * s], 1.4 * s, '#E8A83A'); }                            /* hydraulic hoses at the knees */
  for (let k = 0; k < 9; k++){ const x = (-38 + k * 8) * s; dt_bolt(ctx, x, bob - 22 * s, 1.2 * s, '#B8BEC8'); dt_bolt(ctx, x, bob + 22 * s, 1.2 * s, '#B8BEC8'); }
  for (let k = 0; k < 6; k++) tw_poly(ctx, [(-38 + k * 6) * s, bob + 8 * s, (-34 + k * 6) * s, bob + 8 * s, (-32 + k * 6) * s, bob + 12 * s, (-36 + k * 6) * s, bob + 12 * s], k % 2 ? '#1C1E24' : '#E8C84A');      /* a hazard strip */
  dt_vent(ctx, -36 * s, bob - 14 * s, 18 * s, 6 * s, 6, '#10121A', true); dt_vent(ctx, 6 * s, bob + 12 * s, 14 * s, 6 * s, 5, '#10121A', true);
  dt_wire(ctx, [-30 * s, bob - 8 * s, -24 * s, bob - 4 * s, -14 * s, bob - 10 * s, -4 * s, bob - 6 * s], 1 * s, '#E8A83A'); dt_wire(ctx, [-30 * s, bob + 12 * s, -20 * s, bob + 8 * s, -12 * s, bob + 14 * s], 1 * s, '#4A8AE8');
  for (let k = 0; k < 6; k++){ tw_ln(ctx, [(10 + k * 6) * s, bob - 33 * s, (10 + k * 6) * s, bob - 23 * s], 0.5 * s, 'rgba(0,0,0,.4)'); }
  for (let k = 0; k < 4; k++) tw_ln(ctx, [(46 + k * 4) * s, bob - 31 * s, (46 + k * 4) * s, bob - 25 * s], 0.7 * s, '#06080E');       /* cannon cooling rings */
  tw_rect(ctx, 56 * s, bob - 30 * s, 6 * s, 4 * s, '#06080E'); if (glow) csGlow(ctx, 62 * s, bob - 28 * s, 12 * s, SG_AMBER, 0.6);
  for (const sd of [-1, 1]){ tw_rr(ctx, 44 * s, bob + sd * 13 * s - 2 * s, 5 * s, 4 * s, 1 * s, '#2A2E38'); dt_led(ctx, 46.4 * s, bob + sd * 13 * s, 1.2 * s, SG_RED, true); }
  tw_ln(ctx, [26 * s, bob - 14 * s, 26 * s, bob + 14 * s], 0.7 * s, '#06080E'); for (let k = 0; k < 3; k++) tw_rect(ctx, 46 * s, bob + (-9 + k * 9) * s - 0.4 * s, 2.4 * s, 0.8 * s, '#F4F0E0');
  for (let k = 0; k < 8; k++) tw_ln(ctx, [(-34 + k * 6) * s, bob + 18 * s, (-32 + k * 6) * s, bob + 22 * s], 0.5 * s, 'rgba(255,200,60,.4)');
  for (const [x, y] of [[-20, -12], [12, 4], [-6, 14]]) { tw_ln(ctx, [x * s, y * s + bob, (x + 5) * s, y * s + bob - 3 * s, (x + 9) * s, y * s + bob], 0.5 * s, 'rgba(0,0,0,.35)'); }
  dt_led(ctx, -34 * s, bob - 18 * s, 1.1 * s, '#6AFFB0', Math.sin(a * 3) > 0); dt_led(ctx, -30 * s, bob - 18 * s, 1.1 * s, SG_AMBER, Math.sin(a * 3 + 2) > 0);
});
dt_wrap('sg_queen', function(ctx, e, b, dk, bob){
  const s = e.r / 58, a = e.anim * 1.6;
  for (let i = 0; i < 5; i++) for (const sd of [-1, 1]){ const w = Math.sin(a + i * 1.7 + (sd > 0 ? 0 : 1.1)) * 6 * s, x0 = (22 - i * 15) * s; for (let k = 0; k < 3; k++) tw_ln(ctx, [x0 + w * 1.4, bob + sd * 46 * s, x0 + (k - 1) * 3.4 * s + w * 1.4 + 2 * s, bob + sd * 54 * s], 2.2 * s, dk); }
}, function(ctx, e, b, dk, bob){
  const s = e.r / 58, a = e.anim * 1.6, st = e.state, pulse = 0.6 + 0.4 * Math.sin(e.anim * 2.4), glow = st === 'spawnwind' || st === 'spitwind' ? 1 : 0;
  for (let i = 0; i < 5; i++) for (const sd of [-1, 1]){ const w = Math.sin(a + i * 1.7 + (sd > 0 ? 0 : 1.1)) * 6 * s, x0 = (22 - i * 15) * s; fillCircle(ctx, x0 + 5 * s + w, bob + sd * 36 * s, 3.6 * s, tw_li(b, 0.15)); fillCircle(ctx, x0 + 5 * s + w, bob + sd * 36 * s, 1.6 * s, SG_LIME); for (let k = 0; k < 3; k++) tw_ln(ctx, [x0 + 5 * s + w, bob + sd * 33 * s, x0 + (6 + k * 2) * s + w, bob + sd * 40 * s], 0.5 * s, '#2E5A14'); }
  for (let k = 0; k < 6; k++){ const sd = k % 2 ? 1 : -1, x = (-34 + (k >> 1) * 14) * s, y = bob + sd * 19 * s; for (let j = 0; j < 5; j++){ const an = j * 1.25 + k; fillCircle(ctx, x + Math.cos(an) * 3 * s, y + Math.sin(an) * 3 * s, 0.8 * s, 'rgba(255,255,220,' + (0.3 + 0.4 * pulse) + ')'); } tw_ln(ctx, [x - 6 * s, y, x + 6 * s, y], 0.5 * s, 'rgba(46,90,20,.5)'); }
  for (let k = 0; k < 14; k++){ const x = (-50 + k * 4.4) * s; for (const sd of [-1, 1]) lkTRI(ctx, x, bob + sd * (24 - Math.abs(k - 7) * 0.8) * s, x + 1.4 * s, bob + sd * (28 - Math.abs(k - 7) * 0.8) * s, x + 2.4 * s, bob + sd * (24 - Math.abs(k - 7) * 0.8) * s, '#2E5A14'); }
  for (let k = 0; k < 4; k++) for (const sd of [-1, 1]) fillCircle(ctx, (-40 + k * 8) * s, bob + sd * (4 + (k % 2) * 3) * s, 1 * s, SG_TEAL);
  for (let k = 0; k < 5; k++){ const an = (k - 2) * 0.42, ln = (k === 2 ? 26 : 20) * s, tx = 20 * s + Math.cos(an) * ln, ty = bob + Math.sin(an) * ln * 0.9; fillCircle(ctx, tx, ty, 1.2 * s, '#FFFFFF'); tw_ln(ctx, [20 * s, bob - 12 * s + (k - 2) * 2 * s, tx, ty], 0.4 * s, 'rgba(255,255,255,.55)'); }
  for (let k = 0; k < 7; k++) fillCircle(ctx, (6 + (k % 4) * 3.6) * s, bob + (-9 + k * 3) * s, 0.8 * s, '#8AB840');
  for (const sd of [-1, 1]){ lkOV(ctx, 24 * s, bob + sd * 13 * s, 3 * s, 5 * s, '#8AB840'); tw_ln(ctx, [32 * s, bob + sd * 4 * s, 28 * s, bob + sd * 8 * s], 1.4 * s, '#F4FFD0'); for (let k = 0; k < 3; k++) tw_ln(ctx, [(24 + k * 3) * s, bob + sd * 15 * s, (26 + k * 3) * s, bob + sd * 18 * s], 0.5 * s, '#2E5A14'); }
  for (let k = 0; k < 5; k++){ const ph = (e.anim * 0.5 + k / 5) % 1; ctx.globalAlpha = 0.7 * (1 - ph); fillCircle(ctx, 38 * s + ph * 10 * s, bob + (k - 2) * 1.6 * s, 1 * s, SG_LIME); } ctx.globalAlpha = 1;
  if (glow) for (let k = 0; k < 6; k++) fillCircle(ctx, (36 + k * 3) * s, bob + Math.sin(k * 2.4 + a) * 4 * s, 1.1 * s, '#E8FFC0');
});
dt_wrap('sg_ram', null, function(ctx, e, b, dk, bob){
  const s = e.r / 66, a = e.anim * 1.2, st = e.state, charge = st === 'charge', wd = st === 'chargewind', out = (wd ? -10 : charge ? 14 : 0) * s;
  for (const sd of [-1, 1]) for (let k = 0; k < 6; k++){ const x = (-44 + k * 17) * s; fillCircle(ctx, x, bob + sd * 36 * s, 5.4 * s, '#1A1C22'); fillCircle(ctx, x, bob + sd * 36 * s, 3.4 * s, '#4A505C'); dt_bolt(ctx, x, bob + sd * 36 * s, 1.4 * s, '#B8BEC8'); }
  for (let k = 0; k < 6; k++){ const x = (-42 + k * 15) * s; dt_bolt(ctx, x, bob - 26 * s, 1.3 * s, '#D8C890'); dt_bolt(ctx, x, bob + 26 * s, 1.3 * s, '#D8C890'); }
  for (const sd of [-1, 1]){ for (let k = 0; k < 4; k++) tw_poly(ctx, [(-26 + k * 6) * s, bob + sd * 30 * s, (-22 + k * 6) * s, bob + sd * 30 * s, (-24 + k * 6) * s, bob + sd * 26 * s], '#F4F0E0'); tw_ln(ctx, [-30 * s, bob + sd * 22 * s, -2 * s, bob + sd * 22 * s], 0.6 * s, '#7A1E14'); }
  dt_vent(ctx, 12 * s, bob - 24 * s, 16 * s, 8 * s, 6, '#3A2A12', true); dt_vent(ctx, 12 * s, bob + 16 * s, 16 * s, 8 * s, 6, '#3A2A12', true);
  tw_ln(ctx, [-6 * s, bob - 8 * s, 10 * s, bob - 16 * s, 24 * s, bob - 10 * s], 1.2 * s, '#1C1E24'); tw_ln(ctx, [-6 * s, bob + 8 * s, 10 * s, bob + 16 * s, 24 * s, bob + 10 * s], 1.2 * s, '#1C1E24');
  tw_rr(ctx, -34 * s, bob - 12 * s, 28 * s, 3 * s, 1 * s, '#2A2E38'); for (let k = 0; k < 4; k++) fillCircle(ctx, (-30 + k * 6) * s, bob - 10.4 * s, 0.7 * s, k === wd ? '#FFE04A' : '#6AFFB0');
  for (let k = 0; k < 4; k++) for (const sd of [-1, 1]) tw_ln(ctx, [(34 + k * 10) * s + out, bob + sd * 9.6 * s, (34 + k * 10) * s + out, bob + sd * 12 * s], 0.9 * s, '#E8E8F0');
  for (let k = 0; k < 4; k++){ const x = (38 + k * 11) * s + out; tw_ln(ctx, [x, bob - 10 * s, x, bob + 10 * s], 0.5 * s, 'rgba(255,255,255,.3)'); tw_rect(ctx, x - 1 * s, bob - 11 * s, 2 * s, 1.4 * s, '#4A3A18'); tw_rect(ctx, x - 1 * s, bob + 9.6 * s, 2 * s, 1.4 * s, '#4A3A18'); }
  for (let k = 0; k < 5; k++) tw_ln(ctx, [(80 + k * 1) * s + out, bob + (k - 2) * 1.8 * s, (86 + k * 1) * s + out, bob + (k - 2) * 1.1 * s], 0.4 * s, '#FFFFFF');
  for (let k = 0; k < 6; k++){ const ph = (e.anim * 0.6 + k / 6) % 1; ctx.globalAlpha = 0.45 * (1 - ph); fillCircle(ctx, (-52 - ph * 8) * s, bob + (k % 2 ? 24 : -24) * s, (2 + ph * 3) * s, '#7A7A80'); } ctx.globalAlpha = 1;
  dt_led(ctx, -18 * s, bob - 16 * s, 1.2 * s, SG_RED, Math.sin(e.anim * 3) > 0); dt_led(ctx, -18 * s, bob + 16 * s, 1.2 * s, SG_RED, Math.sin(e.anim * 3 + 3) > 0);
});
dt_wrap('sg_carrier', null, function(ctx, e, b, dk, bob){
  const s = e.r / 60, a = e.anim * 11, st = e.state, open = st === 'launch' || st === 'launchwind';
  for (let k = 0; k < 8; k++){ const x = (-48 + k * 12) * s; dt_bolt(ctx, x, bob - (24 + k * 0.7) * s, 1.1 * s, '#B8BEC8'); dt_bolt(ctx, x, bob + (24 + k * 0.7) * s, 1.1 * s, '#B8BEC8'); }
  for (const [rx, ry] of [[-46, -34], [-46, 34], [34, -40], [34, 40]]){ const x = rx * s, y = bob + ry * s; ctx.strokeStyle = 'rgba(40,44,52,.5)'; ctx.lineWidth = 0.7 * s; ctx.beginPath(); ctx.arc(x, y, 10 * s, 0, TAU); ctx.stroke(); fillCircle(ctx, x, y, 3 * s, '#3A3E48'); dt_bolt(ctx, x, y, 1.4 * s, '#B8BEC8'); tw_ln(ctx, [x + Math.cos(a * 0.7 + ry) * 9 * s, y + Math.sin(a * 0.7 + ry) * 9 * s, x - Math.cos(a * 0.7 + ry) * 9 * s, y - Math.sin(a * 0.7 + ry) * 9 * s], 0.9 * s, 'rgba(210,216,226,.45)'); }
  for (let k = 0; k < 6; k++) tw_rect(ctx, (-30 + k * 6) * s, bob - 15 * s, 3 * s, 1.4 * s, k % 2 ? '#1C1E24' : '#E8C84A');
  for (let k = 0; k < 6; k++) tw_rect(ctx, (-30 + k * 6) * s, bob + 13.6 * s, 3 * s, 1.4 * s, k % 2 ? '#1C1E24' : '#E8C84A');
  for (const sd of [-1, 1]){ tw_ln(ctx, [-34 * s, bob + sd * 14 * s, 6 * s, bob + sd * 14 * s], 0.9 * s, '#2A3A56'); dt_led(ctx, -36 * s, bob + sd * 8 * s, 1 * s, open ? '#6AFFB0' : SG_AMBER, true); dt_led(ctx, 8 * s, bob + sd * 8 * s, 1 * s, open ? '#6AFFB0' : SG_AMBER, true); }
  tw_rr(ctx, 40 * s, bob + 14 * s, 10 * s, 4 * s, 1 * s, '#1C1E24'); tw_rr(ctx, 40 * s, bob - 18 * s, 10 * s, 4 * s, 1 * s, '#1C1E24'); dt_led(ctx, 44 * s, bob + 16 * s, 0.9 * s, SG_RED, true);
  tw_ln(ctx, [-50 * s, bob - 10 * s, -58 * s, bob - 12 * s], 0.9 * s, '#C8CCD4'); tw_ln(ctx, [-50 * s, bob + 10 * s, -58 * s, bob + 12 * s], 0.9 * s, '#C8CCD4'); dt_led(ctx, -58.6 * s, bob - 12.2 * s, 1 * s, SG_RED, Math.sin(e.anim * 3) > 0); dt_led(ctx, -58.6 * s, bob + 12.2 * s, 1 * s, '#6AFFB0', Math.sin(e.anim * 3) <= 0);
  for (let k = 0; k < 4; k++) tw_ln(ctx, [(4 + k * 10) * s, bob - 22 * s, (8 + k * 10) * s, bob - 8 * s], 0.5 * s, 'rgba(255,255,255,.18)');
  for (let k = 0; k < 8; k++) tw_ln(ctx, [(-44 + k * 6) * s, bob - 22 * s, (-42 + k * 6) * s, bob - 18 * s], 0.5 * s, 'rgba(0,0,0,.3)');
});
dt_wrap('sg_warden', null, function(ctx, e, b, dk, bob){
  const s = e.r / 64, a = e.anim * 1.3, st = e.state, glow = e.glow || 0, core = 0.6 + 0.4 * Math.sin(e.anim * (2 + (e.phase || 1)));
  for (const sd of [-1, 1]){ const w = Math.sin(a + (sd > 0 ? 0 : Math.PI)) * 8 * s; for (let k = 0; k < 3; k++) tw_rect(ctx, (-30 + k * 7) * s + w, bob + sd * 20 * s - 5 * s, 1 * s, 10 * s, 'rgba(0,0,0,.3)'); dt_bolt(ctx, -29 * s + w, bob + sd * 20 * s, 1.4 * s, '#8A909C'); }
  for (let k = 0; k < 7; k++){ const x = (-24 + k * 8.4) * s; dt_bolt(ctx, x, bob - 25 * s, 1.1 * s, '#B8BEC8'); dt_bolt(ctx, x, bob + 25 * s, 1.1 * s, '#B8BEC8'); }
  for (let k = 0; k < 8; k++){ const an = k * TAU / 8 + a * 0.3; tw_ln(ctx, [-4 * s + Math.cos(an) * 13 * s, bob + Math.sin(an) * 13 * s, -4 * s + Math.cos(an) * 15.4 * s, bob + Math.sin(an) * 15.4 * s], 1 * s, '#FFB84A'); }
  ctx.strokeStyle = 'rgba(255,200,180,.55)'; ctx.lineWidth = 0.8 * s; ctx.beginPath(); ctx.arc(-4 * s, bob, (6 + 2 * core) * s * 0.7, 0, TAU); ctx.stroke();
  for (const sd of [-1, 1]){ const reach = (st === 'barragewind' || st === 'beamwind' ? 8 : 0) * s, ex = 24 * s + reach, ey = bob + sd * 36 * s;
    for (let k = 0; k < 4; k++) tw_ln(ctx, [(2 + k * 5) * s, bob + sd * 24 * s, (2 + k * 5) * s, bob + sd * 36 * s], 0.5 * s, 'rgba(0,0,0,.35)'); tw_rr(ctx, ex - 4 * s, ey - 3.4 * s, 4 * s, 6.8 * s, 1 * s, '#10121A'); dt_led(ctx, 4 * s, bob + sd * 33 * s, 1 * s, SG_RED, true);
    for (let k = 0; k < 3; k++) tw_rect(ctx, ex + (2 + k * 3) * s, ey - 1.6 * s, 1 * s, 3.2 * s, '#06080E'); tw_ln(ctx, [-10 * s, bob + sd * 24 * s, -10 * s, bob + sd * 32 * s], 1.6 * s, '#E8A83A'); }
  for (let k = 0; k < 4; k++) tw_ln(ctx, [(24 + k * 3.4) * s, bob - 13 * s, (24 + k * 3.4) * s, bob + 13 * s], 0.4 * s, 'rgba(255,255,255,.14)');
  tw_ln(ctx, [36 * s, bob - 12 * s, 36 * s, bob + 12 * s], 0.5 * s, '#2A2E38'); dt_led(ctx, 41 * s, bob - 8 * s, 0.9 * s, '#6AFFB0', true); dt_led(ctx, 41 * s, bob + 8 * s, 0.9 * s, '#6AFFB0', true);
  for (let k = 0; k < 3; k++) tw_poly(ctx, [(-26 + k * 3) * s, bob - 28 * s, (-24 + k * 3) * s, bob - 33 * s, (-22 + k * 3) * s, bob - 28 * s], '#1C1E24');
  tw_ln(ctx, [-30 * s, bob - 18 * s, -36 * s, bob - 22 * s, -38 * s, bob - 30 * s], 0.9 * s, '#C8CCD4'); dt_led(ctx, -38.2 * s, bob - 30.4 * s, 1.1 * s, SG_RED, Math.sin(a * 3) > 0);
  for (let k = 0; k < 6; k++) tw_ln(ctx, [(-24 + k * 8) * s, bob - 24 * s, (-21 + k * 8) * s, bob - 20 * s], 0.5 * s, 'rgba(0,0,0,.3)');
  if (glow > 0.2) for (let k = 0; k < 8; k++){ const an = k * 0.785 + a; fillCircle(ctx, Math.cos(an) * 56 * s, bob + Math.sin(an) * 56 * s, 1.6 * s, 'rgba(255,90,74,' + (0.3 + 0.4 * glow) + ')'); }
});

/* ======================= Chapter 13.5: the Domes ======================= */
/* The Domes' ordinary creatures are the Arctic animals with a glimmer on them (d.dome), so they get their extra frost only there and the Arctic chapter stays as it was.
   Each look is described by where its body is: [centre x, half length, half width, head x]; every frost part is placed from that. */
const DT_FROST = { arcticwolf: [-1, 16, 9.5, 16], lynx: [0, 17, 8.8, 16.5], muskox: [-3, 27, 18, 24], arctichare: [-1, 13, 10, 12], leveret: [-1, 6.5, 5, 5], gyrfalcon: [0, 11, 7.5, 10],
  arcticfox: [-1, 13, 7.4, 11], caribou: [-2, 18, 11, 19], ermine: [-1, 14, 5.6, 13], wolverine: [-1, 15, 10, 12.4], lemming: [-1, 8, 6.4, 6], owlet: [0, 8, 8, 6] };
const DT_ICE = '#BDE6F4', DT_ICE_L = '#F4FFFF';
function dt_ice(ctx, x, y, an, L, w){ const ca = Math.cos(an), sa = Math.sin(an); tw_poly(ctx, [x - sa * w, y + ca * w, x + ca * L, y + sa * L, x + sa * w, y - ca * w], DT_ICE); tw_poly(ctx, [x - sa * w, y + ca * w, x + ca * L, y + sa * L, x, y], DT_ICE_L); }
function dt_domeFrost(look){
  const [cx, L, W, hx] = DT_FROST[look], k = Math.max(0.5, Math.min(1.6, L / 14));
  dt_wrap(look, null, function(ctx, e, b, dk, bob, d){
    const a = e.anim, n = Math.max(4, Math.round(L / 2.6));
    for (let i = 0; i < n; i++){ const x = cx - L * 0.8 + i * (L * 1.6) / (n - 1), up = (i % 2 ? 1 : 0.6) * k; for (const sd of [-1, 1]) dt_ice(ctx, x, bob + sd * (W * (0.92 - Math.abs(x - cx) / L * 0.3)), sd * 1.35 + (x - cx) * 0.01, (2.4 + up * 2.2), 0.9 * k); }       /* rime crystals along both flanks */
    for (let i = 0; i < 5; i++){ const x = cx - L * 0.7 + i * L * 0.35; tw_ln(ctx, [x, bob - W * 0.5, x + L * 0.14, bob - W * 0.1, x + L * 0.04, bob + W * 0.3], 0.5 * k, 'rgba(127,240,255,.75)'); dt_bolt(ctx, x + L * 0.14, bob - W * 0.1, 0.55 * k, '#BFFFFF'); }     /* glimmer veins with their nodes */
    for (let i = 0; i < 12; i++){ const px = cx + Math.cos(i * 2.4) * L * 0.7, py = bob + Math.sin(i * 1.7) * W * 0.7; fillCircle(ctx, px, py, 0.45 * k, 'rgba(255,255,255,.75)'); }       /* frost speckle */
    for (let i = 0; i < 3; i++){ tw_poly(ctx, [hx + 2 * k + i * 1.4 * k, bob + W * 0.5, hx + 2.8 * k + i * 1.4 * k, bob + W * 0.5, hx + 2.4 * k + i * 1.4 * k, bob + W * 0.5 + (2.4 + i) * k * 0.9], DT_ICE_L); }      /* icicles from the chin */
    for (let i = 0; i < 3; i++){ const ph = (a * 0.5 + i / 3) % 1; ctx.globalAlpha = 0.6 * (1 - ph); fillCircle(ctx, hx + L * 0.5 + ph * 4 * k, bob - 1 * k + (i - 1) * ph * 1.4 * k, (0.7 + ph) * k, '#F4FFFF'); } ctx.globalAlpha = 1;        /* frozen breath */
    for (const sd of [-1, 1]){ fillCircle(ctx, cx - L * 0.5, bob + sd * (W + 1.2 * k), 1.1 * k, DT_ICE); fillCircle(ctx, cx + L * 0.45, bob + sd * (W + 1 * k), 1.1 * k, DT_ICE); dt_ice(ctx, hx - 3 * k, bob + sd * 3.4 * k, sd * 1.2, 3.6 * k, 0.9 * k); }       /* frost on the paws, brow shards */
    csGlow(ctx, cx, bob, L * 1.1, '#7FF0FF', 0.1 + 0.05 * Math.sin(a * 2));
  }, function(d){ return d && d.dome; });
}
for (const look in DT_FROST) dt_domeFrost(look);

dt_wrap('dome_thawed', null, function(ctx, e, b, dk, bob, d){
  const s = e.r / 46, t = G.time, a = e.anim, st = e.state, sag = st === 'slumpwind' ? 0.35 : st === 'slide' ? 1 : st === 'meltdown' ? 0.6 : 0, squash = 1 - 0.5 * sag, wob = Math.sin(a * 1.6) * 1.6 * s, ice = d.color, hi = d.pale;
  for (let k = 0; k < 3; k++){ const ph = (t * 0.4 + k / 3) % 1; ctx.strokeStyle = 'rgba(230,252,255,' + (0.5 * (1 - ph)) + ')'; ctx.lineWidth = 1 * s; ctx.beginPath(); ctx.ellipse(-30 * s, bob + 2 * s, (10 + ph * 50) * s, (6 + ph * 18) * s, 0, 0, TAU); ctx.stroke(); }     /* ripples in the puddle */
  for (let k = 0; k < 8; k++){ const bx = (-50 + k * 6) * s, by = bob + Math.sin(k * 2.3) * 12 * s, ph = (t * 0.5 + k * 0.13) % 1; ctx.globalAlpha = 0.7 * (1 - ph); fillCircle(ctx, bx, by - ph * 6 * s, (1 + (k % 3) * 0.4) * s, '#EFFFFF'); } ctx.globalAlpha = 1;
  for (let k = 0; k < 10; k++){ const an = -2.4 + k * 0.5, rx = 8 + Math.cos(an * 1.3) * 0; tw_ln(ctx, [(8 + Math.cos(an) * 27) * s, bob + wob + Math.sin(an) * 20 * s * squash, (8 + Math.cos(an) * 31) * s, bob + wob + Math.sin(an) * 24 * s * squash], 1.2 * s, hi); }      /* fur at the shoulders' edge */
  for (let k = 0; k < 14; k++){ const x = (-4 + (k % 7) * 4.4) * s, y = bob + wob + (k < 7 ? -1 : 1) * (6 + (k % 3) * 3) * s * squash; tw_ln(ctx, [x, y, x + 4 * s, y + (k < 7 ? -1 : 1) * 1.2 * s], 0.7 * s, k % 2 ? '#FFFFFF' : dm_mix(ice, '#FFFFFF', 0.6)); }
  for (const sd of [-1, 1]){ const pw2 = Math.sin(a * 1.4 + (sd > 0 ? 0 : 1.6)) * 4 * s * (1 - sag), px = (14 + pw2) * s, py = bob + sd * 16 * s * squash; for (let k = 0; k < 4; k++) tw_ln(ctx, [px + 6 * s, py + (k - 1.5) * 2 * s, px + 10 * s, py + (k - 1.5) * 2.6 * s], 1.1 * s, '#2A3A44'); dt_ice(ctx, px - 2 * s, py + sd * 5 * s * squash, sd * 1.5, 5 * s, 1.4 * s); }
  for (let k = 0; k < 3; k++) for (const sd of [-1, 1]) dt_ice(ctx, (28 + k * 3) * s, bob + wob + sd * (9 + k * 0.6) * s, sd * 1.2 + (k - 1) * 0.12, 5 * s, 1.1 * s);    /* ice crusting the brow */
  for (let k = 0; k < 3; k++){ tw_ln(ctx, [(46 + k * 3) * s, bob + wob - 2 * s, (48 + k * 3) * s, bob + wob - 4 * s], 0.5 * s, '#1A3A4A'); }
  tw_ln(ctx, [(52) * s, bob + wob + 2.6 * s, 58 * s, bob + wob + 3.4 * s], 0.7 * s, '#10303E'); fillCircle(ctx, 54 * s, bob + wob - 0.9 * s, 0.8 * s, '#FFFFFF');
  for (const sd of [-1, 1]){ tw_ln(ctx, [40 * s, bob + wob + sd * 8 * s, 46 * s, bob + wob + sd * 6.6 * s], 1.4 * s, '#8AA8B4'); lkOV(ctx, 31.4 * s, bob + wob + sd * 11 * s, 1.6 * s, 1.2 * s, '#F4B8C0'); }
  for (let k = 0; k < 5; k++){ const x = (-24 + k * 8) * s, y = bob + (k % 2 ? 6 : -4) * s; tw_ln(ctx, [x, y - 4 * s, x + 2 * s, y, x - 1 * s, y + 4 * s], 0.9 * s, 'rgba(127,240,255,.8)'); dt_bolt(ctx, x + 2 * s, y, 0.8 * s, '#BFFFFF'); }     /* cracks glowing where the ice is thin */
  for (let k = 0; k < 5; k++){ const ph = (t * 0.7 + k * 0.2) % 1; ctx.globalAlpha = 1 - ph; tw_poly(ctx, [(-8 + k * 9) * s, bob + (14 + ph * 22) * s * squash, (-6.6 + k * 9) * s, bob + (14 + ph * 22) * s * squash, (-7.4 + k * 9) * s, bob + (17 + ph * 22) * s * squash], '#E6FFFF'); } ctx.globalAlpha = 1;
});
dt_wrap('dome_iceheart', null, function(ctx, e, b, dk, bob, d){
  const s = e.r / 58, t = G.time, a = e.anim, st = e.state, glow = e.glow || 0, body = d.color, deep = d.dark, rim = dm_mix(body, '#FFFFFF', 0.4), pulse = 0.6 + 0.4 * Math.sin(t * (2 + (e.phase || 1)) + a);
  const hx = 12 * s, hy = bob + 2 * s;
  for (let i = 0; i < 2; i++) for (const sd of [-1, 1]){ const w = Math.sin(a * 1.1 + i * 3 + (sd > 0 ? 0 : 1.6)) * 4 * s, bx = (24 - i * 52) * s; dt_ice(ctx, bx + 6 * s + w, bob + sd * 20 * s, sd * 1.2, 9 * s, 2.4 * s); for (let k = 0; k < 3; k++) dt_ice(ctx, bx - 8 * s + k * 7 * s + w, bob + sd * 35 * s, sd * 1.57, 5 * s, 2 * s); tw_ln(ctx, [bx - 6 * s, bob + sd * 16 * s, bx + 4 * s + w, bob + sd * 28 * s], 0.7 * s, 'rgba(127,240,255,.7)'); }
  for (let k = 0; k < 7; k++){ const an = k * 0.9 + t * 0.7, rr = (54 + (k % 3) * 8) * s; tw_poly(ctx, [hx + Math.cos(an) * rr, hy + Math.sin(an) * rr * 0.8, hx + Math.cos(an + 0.12) * (rr + 4 * s), hy + Math.sin(an + 0.12) * (rr + 4 * s) * 0.8, hx + Math.cos(an - 0.1) * (rr + 3 * s), hy + Math.sin(an - 0.1) * (rr + 3 * s) * 0.8], k % 2 ? DT_ICE : DT_ICE_L); }     /* shards orbiting it */
  for (let k = 0; k < 6; k++){ const an = k * TAU / 6 + 0.3, hr = (15 + 5 * glow + 2 * pulse) * s; tw_ln(ctx, [hx + Math.cos(an) * hr * 1.1, hy + Math.sin(an) * hr * 1.1, hx + Math.cos(an) * (hr + (14 + (k % 2) * 8) * s), hy + Math.sin(an) * (hr + (14 + (k % 2) * 8) * s)], 0.9 * s, 'rgba(127,240,255,' + (0.45 + 0.4 * pulse) + ')'); }      /* veins running out of the heart */
  for (let k = 0; k < 6; k++){ const x = (-36 + k * 11) * s; tw_ln(ctx, [x, bob - 30 * s, x + 3 * s, bob - 20 * s, x - 1 * s, bob - 12 * s], 0.7 * s, 'rgba(30,70,100,.45)'); }
  for (const [x, y] of [[-40, -22], [-46, 6], [30, 18], [38, -22], [0, 22]]){ dm_poly(ctx, [(x - 3) * s, bob + (y + 2) * s, x * s, bob + (y - 4) * s, (x + 4) * s, bob + (y + 1) * s, (x + 1) * s, bob + (y + 4) * s], rim); fillCircle(ctx, x * s, bob + y * s, 0.7 * s, '#FFFFFF'); }       /* chipped facets */
  for (const sd of [-1, 1]){ dt_ice(ctx, 30 * s, bob + sd * 26 * s, sd * 1.1, 14 * s, 3.4 * s); dt_ice(ctx, 18 * s, bob + sd * 28 * s, sd * 1.35, 9 * s, 2.6 * s); dt_ice(ctx, 52 * s, bob + sd * 14 * s, sd * 0.7, 8 * s, 2 * s);      /* shoulder pauldrons, a lower jaw */
    for (let k = 0; k < 3; k++) lkTRI(ctx, (56 + k * 5) * s, bob + sd * 11 * s, (58 + k * 5) * s, bob + sd * 11 * s - sd * 3 * s, (60 + k * 5) * s, bob + sd * 11 * s, '#F4FFFF'); }
  tw_ln(ctx, [44 * s, bob - 8 * s, 56 * s, bob - 9 * s], 1.2 * s, deep); tw_ln(ctx, [44 * s, bob + 8 * s, 56 * s, bob + 9 * s], 1.2 * s, deep);
  for (let k = 0; k < 5; k++){ const ph = (t * 0.3 + k * 0.2) % 1; ctx.globalAlpha = 0.5 * (1 - ph); fillCircle(ctx, (68 + ph * 10) * s, bob + (k - 2) * 2.4 * s * (1 + ph), (1 + ph * 2) * s, '#E8F8FF'); } ctx.globalAlpha = 1;
  for (let k = 0; k < 4; k++) dt_ice(ctx, (-56 - k * 2) * s, bob + (k - 1.5) * 3 * s, Math.PI + (k - 1.5) * 0.3, 8 * s, 1.6 * s);
  if (st === 'novawind') for (let k = 0; k < 10; k++){ const an = k * 0.628 + t; tw_ln(ctx, [hx + Math.cos(an) * 30 * s, hy + Math.sin(an) * 30 * s, hx + Math.cos(an) * 40 * s, hy + Math.sin(an) * 40 * s], 1.2 * s, 'rgba(230,255,255,.6)'); }
});
