'use strict';
/* Enemy art, Chapter 14: the Tower (TOWER_DRAW). */
/* Twelve ordinary kinds and five bosses, all new: office machines and lab animals the glimmer has got into, drawn from above like every creature, facing +x. The
   ordinary ones read only def, type, r, anim and state of the creature, so the sprite cache (js/44t-enemy-sprites.js) can keep pictures of them. Shared look:
   cold greys and cream plastic, with a hot accent (a red lens, a green glow, a yellow warning stripe) so each one stands out on the carpet. */
const TW_RED = '#FF5A4A', TW_GLOW = '#9AF0C8', TW_GOLD = '#E8C84A', TW_EYE_DK = '#10141C';
const TW_MIXC = {};
function tw_mix(a, c, t){ const k = a + c + t; return TW_MIXC[k] || (TW_MIXC[k] = blendHex(a, c, t)); }
function tw_li(a, t){ return tw_mix(a, '#FFFFFF', t); }
function tw_sh(a, t){ return tw_mix(a, '#0A0C14', t); }
function tw_poly(ctx, pts, c){ ctx.fillStyle = c; ctx.beginPath(); ctx.moveTo(pts[0], pts[1]); for (let i = 2; i < pts.length; i += 2) ctx.lineTo(pts[i], pts[i + 1]); ctx.closePath(); ctx.fill(); }
function tw_ln(ctx, pts, w, c){ ctx.lineJoin = 'round'; lkLN(ctx, pts, w, c); ctx.lineJoin = 'miter'; }
function tw_eye(ctx, x, y, r, c){ fillCircle(ctx, x, y, r * 1.35, TW_EYE_DK); fillCircle(ctx, x, y, r, c || TW_RED); fillCircle(ctx, x - r * 0.3, y - r * 0.35, r * 0.32, '#FFFFFF'); }
function tw_rect(ctx, x, y, w, h, c){ ctx.fillStyle = c; ctx.fillRect(x, y, w, h); }
function tw_rr(ctx, x, y, w, h, r, c){ ctx.fillStyle = c; ctx.beginPath(); ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y); ctx.quadraticCurveTo(x + w, y, x + w, y + r); ctx.lineTo(x + w, y + h - r); ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h); ctx.lineTo(x + r, y + h); ctx.quadraticCurveTo(x, y + h, x, y + h - r); ctx.lineTo(x, y + r); ctx.quadraticCurveTo(x, y, x + r, y); ctx.closePath(); ctx.fill(); }

const TOWER_DRAW = {
  tw_rat(ctx, e, b, dk, bob, wind, d){                                               /* Scrap Rat: a lab rat with plates screwed on and a power cable for a tail */
    const s = e.r / 14, a = e.anim * 2, lunge = e.state === 'lunge', hi = tw_li(b, 0.35), pale = d.pale;
    const tw = Math.sin(a) * 4 * s;
    tw_ln(ctx, [-9 * s, bob, -17 * s, bob + tw * 0.4, -24 * s, bob - tw * 0.5, -31 * s, bob + tw * 0.2], 2.6 * s, '#1E2228');
    tw_ln(ctx, [-9 * s, bob, -17 * s, bob + tw * 0.4, -24 * s, bob - tw * 0.5, -31 * s, bob + tw * 0.2], 1.1 * s, '#E8A83A');
    fillCircle(ctx, -31 * s, bob + tw * 0.2, 1.8 * s, '#C8CCD4');
    for (let i = 0; i < 3; i++) for (const sd of [-1, 1]){ const w = Math.sin(a + i * 2.1 + (sd > 0 ? 0 : 1.7)) * 2.2 * s, x0 = (5 - i * 5) * s; tw_ln(ctx, [x0, bob + sd * 4 * s, x0 + 1.5 * s + w, bob + sd * 8.6 * s, x0 + 3.5 * s + w, bob + sd * 10.5 * s], 2 * s, dk); }
    lkOV(ctx, -1 * s, bob, 13 * s, 8.4 * s, dk); lkOV(ctx, -1 * s, bob, 11.8 * s, 7.4 * s, b);
    lkOV(ctx, -2 * s, bob - 2 * s, 8.6 * s, 3.2 * s, hi);
    tw_rr(ctx, -6 * s, bob - 3.4 * s, 6.4 * s, 6.8 * s, 1.2 * s, '#9AA0AE'); for (const [px, py] of [[-5, -2.4], [-1.4, 2.4], [-1.4, -2.4], [-5, 2.4]]) fillCircle(ctx, px * s, bob + py * s, 0.55 * s, '#4A5060');
    lkOV(ctx, 10 * s, bob, 6.8 * s, 5 * s, dk); lkOV(ctx, 10 * s, bob, 6 * s, 4.3 * s, tw_li(b, 0.2));
    fillCircle(ctx, 16.4 * s, bob, 1.6 * s, '#E8A0A0');
    for (const sd of [-1, 1]){ fillCircle(ctx, 6 * s, bob + sd * 6 * s, 3.4 * s, dk); fillCircle(ctx, 6 * s, bob + sd * 6 * s, 2.5 * s, pale); tw_eye(ctx, 12 * s, bob + sd * 2.6 * s, 1.5 * s, lunge ? '#FFE04A' : TW_RED); lkLN(ctx, [15 * s, bob + sd * 1.4 * s, 20 * s, bob + sd * 4.4 * s], 0.7 * s, pale); lkLN(ctx, [15 * s, bob + sd * 0.8 * s, 20.5 * s, bob + sd * 1.4 * s], 0.7 * s, pale); }
    if (lunge) lkTRI(ctx, 15.4 * s, bob - 0.8 * s, 18 * s, bob, 15.4 * s, bob + 0.8 * s, '#FFFFFF');
  },
  tw_mite(ctx, e, b, dk, bob, wind, d){                                              /* Staple Mite: a staple that learned to walk */
    const s = e.r / 5.5, a = e.anim * 3;
    for (let i = 0; i < 3; i++) for (const sd of [-1, 1]){ const w = Math.sin(a + i * 2.2 + (sd > 0 ? 0 : 1.6)) * 1.2 * s; tw_ln(ctx, [(2 - i * 2.6) * s, bob + sd * 1.8 * s, (3 - i * 2.6) * s + w, bob + sd * 4 * s, (4 - i * 2.6) * s, bob + sd * 5.6 * s], 0.9 * s, dk); }
    tw_rr(ctx, -6 * s, bob - 2.6 * s, 12 * s, 5.2 * s, 1.4 * s, dk); tw_rr(ctx, -5.6 * s, bob - 2.1 * s, 11.2 * s, 4.2 * s, 1.1 * s, b);
    tw_rect(ctx, -3.6 * s, bob - 2.1 * s, 1 * s, 4.2 * s, tw_sh(b, 0.25)); tw_rect(ctx, 0.4 * s, bob - 2.1 * s, 1 * s, 4.2 * s, tw_sh(b, 0.25)); tw_rect(ctx, -5.6 * s, bob - 2.1 * s, 11.2 * s, 1.1 * s, tw_li(b, 0.6));
    lkTRI(ctx, 5.4 * s, bob - 2.4 * s, 9.6 * s, bob - 0.6 * s, 5.4 * s, bob - 0.2 * s, '#D8DCE4'); lkTRI(ctx, 5.4 * s, bob + 2.4 * s, 9.6 * s, bob + 0.6 * s, 5.4 * s, bob + 0.2 * s, '#D8DCE4');
    fillCircle(ctx, 2.4 * s, bob - 1.2 * s, 0.9 * s, TW_RED); fillCircle(ctx, 2.4 * s, bob + 1.2 * s, 0.9 * s, TW_RED);
  },
  tw_courier(ctx, e, b, dk, bob, wind, d){                                           /* Courier Drone: a quadcopter with a parcel strapped under it */
    const s = e.r / 13, a = e.anim * 9, dash = e.state === 'dash';
    for (const [rx, ry] of [[9, -9], [9, 9], [-9, -9], [-9, 9]]){
      tw_ln(ctx, [0, bob, rx * 0.7 * s, bob + ry * 0.7 * s], 1.8 * s, dk);
      ctx.fillStyle = 'rgba(40,44,52,.28)'; ctx.beginPath(); ctx.arc(rx * s, bob + ry * s, 6.2 * s, 0, TAU); ctx.fill();
      ctx.strokeStyle = '#2A2E38'; ctx.lineWidth = 1.5 * s; ctx.beginPath(); ctx.moveTo(rx * s + Math.cos(a + rx) * 6 * s, bob + ry * s + Math.sin(a + rx) * 6 * s); ctx.lineTo(rx * s - Math.cos(a + rx) * 6 * s, bob + ry * s - Math.sin(a + rx) * 6 * s); ctx.stroke();
      fillCircle(ctx, rx * s, bob + ry * s, 1.5 * s, '#C8CCD4');
    }
    tw_rr(ctx, -5.4 * s, bob - 4.6 * s, 10.8 * s, 9.2 * s, 2.4 * s, dk); tw_rr(ctx, -4.8 * s, bob - 4 * s, 9.6 * s, 8 * s, 2 * s, b);
    tw_rect(ctx, -4 * s, bob - 3.4 * s, 8 * s, 1.6 * s, tw_li(b, 0.5));
    tw_rr(ctx, -3 * s, bob - 2 * s, 6.4 * s, 4.4 * s, 0.8 * s, '#B8864A'); tw_rect(ctx, -3 * s, bob - 0.5 * s, 6.4 * s, 1.1 * s, '#E8D8B0'); tw_rect(ctx, -0.2 * s, bob - 2 * s, 1 * s, 4.4 * s, '#E8D8B0');
    fillCircle(ctx, 4.6 * s, bob, 1.9 * s, TW_EYE_DK); fillCircle(ctx, 4.8 * s, bob, 1.2 * s, dash ? '#FFFFFF' : '#FFF0B0');
    if (dash) for (let k = 1; k < 4; k++){ ctx.globalAlpha = 0.25 / k; tw_rr(ctx, (-5.4 - k * 5) * s, bob - 3 * s, 10.8 * s, 6 * s, 2 * s, d.pale); } ctx.globalAlpha = 1;
  },
  tw_roller(ctx, e, b, dk, bob, wind, d){                                            /* Swivel Charger: an office chair on five wheels with a rocket where the gas lift was */
    const s = e.r / 14, a = e.anim * 2, roll = e.state === 'roll', wnd = e.state === 'wind', lean = wnd ? -2 * s : 0;
    for (let k = 0; k < 5; k++){ const an = k * TAU / 5 + (roll ? a * 3 : a * 0.3); const wx = Math.cos(an) * 10.6 * s, wy = bob + Math.sin(an) * 10.6 * s;
      tw_ln(ctx, [0, bob, wx * 0.85, wy - bob * 0.15 + (bob - bob) ], 2.2 * s, dk); fillCircle(ctx, wx, wy, 2.6 * s, '#1A1E26'); fillCircle(ctx, wx, wy, 1.4 * s, '#6A7280'); }
    if (roll || wnd){ for (let k = 0; k < 4; k++){ ctx.globalAlpha = (roll ? 0.5 : 0.25) * (1 - k / 4); lkTRI(ctx, -10 * s, bob - 3 * s, (-18 - k * 4 - Math.sin(a * 6 + k) * 2) * s, bob, -10 * s, bob + 3 * s, k < 2 ? '#FFE08A' : '#FF8A3A'); } ctx.globalAlpha = 1; }
    fillCircle(ctx, 0, bob, 7.6 * s, dk); fillCircle(ctx, 0, bob, 6.8 * s, tw_li(b, 0.08));
    ctx.strokeStyle = tw_sh(b, 0.35); ctx.lineWidth = 0.9 * s; for (let k = 0; k < 3; k++){ ctx.beginPath(); ctx.arc(0, bob, 2 + k * 1.8, 0, TAU); ctx.stroke(); }
    ctx.strokeStyle = dk; ctx.lineWidth = 4 * s; ctx.lineCap = 'round'; ctx.beginPath(); ctx.arc(-3 * s + lean, bob, 8.2 * s, Math.PI * 0.62, Math.PI * 1.38); ctx.stroke(); ctx.lineCap = 'butt';
    ctx.strokeStyle = b; ctx.lineWidth = 2.6 * s; ctx.lineCap = 'round'; ctx.beginPath(); ctx.arc(-3 * s + lean, bob, 8.2 * s, Math.PI * 0.62, Math.PI * 1.38); ctx.stroke(); ctx.lineCap = 'butt';
    for (const sd of [-1, 1]){ tw_ln(ctx, [1 * s, bob + sd * 7.4 * s, 5.6 * s, bob + sd * 8.4 * s], 2.2 * s, dk); tw_eye(ctx, 6.6 * s, bob + sd * 2.4 * s, 1.3 * s, wnd ? '#FFE04A' : TW_RED); }
    tw_rr(ctx, 3 * s, bob - 1 * s, 3 * s, 2 * s, 0.6 * s, '#FF8A3A');
  },
  tw_copier(ctx, e, b, dk, bob, wind, d){                                            /* Copier Brute: a floor copier on stumpy legs, its lid a jaw */
    const s = e.r / 24, a = e.anim * 1.4, jam = e.state === 'jam';
    for (const [lx, ly] of [[-12, -17], [-12, 17], [12, -17], [12, 17]]){ const w = Math.sin(a + lx + ly) * 1.8 * s; lkOV(ctx, lx * s + w, bob + ly * s, 5 * s, 3.4 * s, '#2A2E38'); }
    tw_rr(ctx, -20 * s, bob - 16 * s, 40 * s, 32 * s, 4 * s, dk); tw_rr(ctx, -19 * s, bob - 15 * s, 38 * s, 30 * s, 3.4 * s, b);
    tw_rect(ctx, -19 * s, bob - 15 * s, 38 * s, 4 * s, tw_li(b, 0.5));
    tw_rr(ctx, -15 * s, bob - 10 * s, 21 * s, 20 * s, 2 * s, '#26303C'); tw_rr(ctx, -14 * s, bob - 9 * s, 19 * s, 18 * s, 1.6 * s, jam ? '#6AE0FF' : '#8CC8E0');
    const sweep = ((e.anim * 0.4) % 1) * 17 * s; ctx.fillStyle = 'rgba(255,255,255,' + (jam ? 0.9 : 0.5) + ')'; ctx.fillRect(-14 * s + sweep, bob - 9 * s, 1.6 * s, 18 * s);
    ctx.fillStyle = 'rgba(255,255,255,.35)'; ctx.beginPath(); ctx.moveTo(-14 * s, bob - 9 * s); ctx.lineTo(-6 * s, bob - 9 * s); ctx.lineTo(-14 * s, bob - 2 * s); ctx.closePath(); ctx.fill();
    tw_rr(ctx, 9 * s, bob - 10 * s, 9 * s, 20 * s, 1.6 * s, '#3A4250'); for (let k = 0; k < 4; k++) tw_rect(ctx, 10.6 * s, bob + (-8 + k * 4.2) * s, 3 * s, 2.4 * s, k === 1 ? TW_RED : k === 2 ? '#6AFFB0' : '#9AA0AE');
    tw_rect(ctx, 14.2 * s, bob - 8 * s, 2.6 * s, 6 * s, '#1E2430');
    tw_rr(ctx, 18 * s, bob - 11 * s, 7 * s, 22 * s, 1.6 * s, '#E8E8E4'); tw_rr(ctx, 19 * s, bob - 10 * s, 5 * s, 20 * s, 1 * s, jam ? '#FFFFFF' : '#F6F6F2');
    if (jam){ for (let k = -2; k <= 2; k++) tw_poly(ctx, [24 * s, bob + k * 3.6 * s - 1.2 * s, (30 + (k % 2) * 4) * s, bob + k * 4.4 * s, 24 * s, bob + k * 3.6 * s + 1.2 * s], '#FFFFF4'); csGlow(ctx, 20 * s, bob, 22 * s, '#FFFFFF', 0.3); }
    tw_eye(ctx, 6 * s, bob - 12.6 * s, 1.6 * s, TW_RED); tw_eye(ctx, 6 * s, bob + 12.6 * s, 1.6 * s, TW_RED);
  },
  tw_safe(ctx, e, b, dk, bob, wind, d){                                              /* Safe Slammer: a floor safe on four fists, its door a face */
    const s = e.r / 31, a = e.anim * 1.2, slam = e.state === 'slam', up = slam ? -4 * s : 0;
    for (const [lx, ly] of [[8, -20], [8, 20], [-14, -18], [-14, 18]]){ const w = Math.sin(a + lx + ly) * 3 * s; lkOV(ctx, (lx + (lx > 0 ? 6 : 0)) * s + w, bob + ly * s * 1.05, 6.4 * s, 5 * s, dk); lkOV(ctx, (lx + (lx > 0 ? 6 : 0)) * s + w, bob + ly * s * 1.05, 5.4 * s, 4 * s, tw_li(b, 0.15)); }
    tw_rr(ctx, -23 * s, bob - 21 * s + up, 46 * s, 42 * s, 5 * s, dk); tw_rr(ctx, -22 * s, bob - 20 * s + up, 44 * s, 40 * s, 4 * s, b);
    tw_rect(ctx, -22 * s, bob - 20 * s + up, 44 * s, 5 * s, tw_li(b, 0.4)); tw_rect(ctx, -22 * s, bob + 15 * s + up, 44 * s, 5 * s, tw_sh(b, 0.35));
    for (const [rx, ry] of [[-19, -17], [19, -17], [-19, 17], [19, 17]]) fillCircle(ctx, rx * s, bob + ry * s + up, 1.6 * s, '#C8CCD6');
    tw_rr(ctx, -12 * s, bob - 12 * s + up, 26 * s, 24 * s, 3 * s, '#2E323C'); tw_rr(ctx, -11 * s, bob - 11 * s + up, 24 * s, 22 * s, 2.4 * s, tw_li(b, 0.18));
    fillCircle(ctx, 1 * s, bob + up, 7.6 * s, '#2A2E38'); fillCircle(ctx, 1 * s, bob + up, 6.4 * s, '#C8A850'); fillCircle(ctx, 1 * s, bob + up, 3.2 * s, '#2A2E38');
    ctx.strokeStyle = '#E8D890'; ctx.lineWidth = 1.2 * s; for (let k = 0; k < 12; k++){ const an = k * TAU / 12; ctx.beginPath(); ctx.moveTo(1 * s + Math.cos(an) * 5.6 * s, bob + up + Math.sin(an) * 5.6 * s); ctx.lineTo(1 * s + Math.cos(an) * 6.2 * s, bob + up + Math.sin(an) * 6.2 * s); ctx.stroke(); }
    tw_ln(ctx, [1 * s, bob + up, 1 * s + Math.cos(a * 0.6) * 3.4 * s, bob + up + Math.sin(a * 0.6) * 3.4 * s], 1.4 * s, '#2A2E38');
    tw_rr(ctx, 16 * s, bob - 3 * s + up, 5 * s, 6 * s, 1 * s, '#8A909C');
    for (const sd of [-1, 1]){ tw_rect(ctx, 14 * s, bob + sd * 13 * s - 1.6 * s + up, 6 * s, 3.2 * s, '#C8CCD6'); tw_eye(ctx, 12 * s, bob + sd * 7 * s + up, 1.8 * s, slam ? '#FFE04A' : TW_RED); }
  },
  tw_intern(ctx, e, b, dk, bob, wind, d){                                            /* Mutated Intern: long arms, a tie, a lanyard, and a very tired grin */
    const s = e.r / 16, a = e.anim * 1.6, leap = e.state === 'leap', crouch = e.state === 'wind';
    const skin = b, shirt = '#E8E8EC', tie = '#B83A3A';
    for (const sd of [-1, 1]){ const w = leap ? 0 : Math.sin(a + (sd > 0 ? 0 : 3)) * 3 * s; tw_ln(ctx, [-4 * s, bob + sd * 5 * s, -9 * s + w, bob + sd * 7 * s, -14 * s + w, bob + sd * 6 * s], 3.6 * s, dk); tw_ln(ctx, [-4 * s, bob + sd * 5 * s, -9 * s + w, bob + sd * 7 * s, -14 * s + w, bob + sd * 6 * s], 2.4 * s, '#2A3A5A'); }
    lkOV(ctx, -3 * s, bob, 10.6 * s - (crouch ? 1.6 * s : 0), 9 * s, dk); lkOV(ctx, -3 * s, bob, 9.6 * s - (crouch ? 1.6 * s : 0), 8 * s, shirt);
    lkOV(ctx, -4 * s, bob - 2 * s, 6 * s, 2.4 * s, '#FFFFFF');
    tw_poly(ctx, [-2 * s, bob - 1.2 * s, 5.4 * s, bob - 0.8 * s, 6.4 * s, bob, 5.4 * s, bob + 0.8 * s, -2 * s, bob + 1.2 * s], tie);
    tw_rr(ctx, -2 * s, bob + 2 * s, 3.4 * s, 2.6 * s, 0.4 * s, '#F4F0C8'); tw_rect(ctx, -1.4 * s, bob + 2.6 * s, 2.2 * s, 0.5 * s, '#8A8A70');
    const ax = leap ? 14 : 11 + Math.sin(a * 1.1) * 2;
    for (const sd of [-1, 1]){ tw_ln(ctx, [2 * s, bob + sd * 6 * s, 7 * s, bob + sd * 8.6 * s, ax * s, bob + sd * 5 * s + (leap ? -sd * 3 * s : 0)], 3.6 * s, dk); tw_ln(ctx, [2 * s, bob + sd * 6 * s, 7 * s, bob + sd * 8.6 * s, ax * s, bob + sd * 5 * s + (leap ? -sd * 3 * s : 0)], 2.4 * s, skin); fillCircle(ctx, ax * s, bob + sd * 5 * s + (leap ? -sd * 3 * s : 0), 2 * s, skin); }
    lkOV(ctx, 4.6 * s, bob, 6.4 * s, 5.6 * s, dk); lkOV(ctx, 4.6 * s, bob, 5.6 * s, 4.8 * s, skin);
    for (let k = 0; k < 5; k++) lkTRI(ctx, (1 + k * 1.6) * s, bob - 4.4 * s, (2.4 + k * 1.6) * s, bob - 7 * s, (3.2 + k * 1.6) * s, bob - 4.2 * s, '#3A2A1A');
    for (const sd of [-1, 1]){ fillCircle(ctx, 7.4 * s, bob + sd * 2.4 * s, 1.9 * s, '#10181A'); fillCircle(ctx, 7.6 * s, bob + sd * 2.4 * s, 1.3 * s, d.pale); csGlow(ctx, 7.6 * s, bob + sd * 2.4 * s, 4 * s, d.pale, 0.5); }
    ctx.strokeStyle = '#1A1008'; ctx.lineWidth = 0.9 * s; ctx.beginPath(); ctx.moveTo(8.8 * s, bob - 1.8 * s); ctx.quadraticCurveTo(10 * s, bob, 8.8 * s, bob + 1.8 * s); ctx.stroke();
  },
  tw_shredder(ctx, e, b, dk, bob, wind, d){                                          /* Paper Shredder: a bin-sized shredder, its mouth a pair of toothed rollers */
    const s = e.r / 15, a = e.anim * 2, spin = e.state === 'spin', ro = spin ? e.anim * 12 : e.anim * 3;
    for (let k = 0; k < 3; k++) for (const sd of [-1, 1]){ const w = Math.sin(a + k * 2 + (sd > 0 ? 0 : 1.5)) * 2 * s; tw_ln(ctx, [(-4 + k * 5) * s, bob + sd * 6 * s, (-3 + k * 5) * s + w, bob + sd * 11 * s, (-1 + k * 5) * s, bob + sd * 13 * s], 2.2 * s, '#22262E'); }
    for (let k = 0; k < 6; k++){ const sw = Math.sin(a + k) * 2 * s; ctx.globalAlpha = 0.9; tw_rect(ctx, (-12 - k * 2.6) * s + sw, bob + (k % 3 - 1) * 2.4 * s, 4 * s, 0.8 * s, '#F8F8F0'); } ctx.globalAlpha = 1;
    tw_rr(ctx, -12 * s, bob - 9 * s, 24 * s, 18 * s, 3 * s, dk); tw_rr(ctx, -11 * s, bob - 8 * s, 22 * s, 16 * s, 2.4 * s, b); tw_rect(ctx, -11 * s, bob - 8 * s, 22 * s, 3 * s, tw_li(b, 0.4));
    tw_rr(ctx, -6 * s, bob - 4 * s, 9 * s, 8 * s, 1.4 * s, '#2A2E38'); tw_rect(ctx, -5 * s, bob - 1 * s, 7 * s, 0.9 * s, '#6A707C'); tw_rect(ctx, -5 * s, bob + 1.2 * s, 7 * s, 0.9 * s, '#6A707C'); fillCircle(ctx, -1 * s, bob - 5.6 * s, 0.9 * s, TW_RED);
    tw_rr(ctx, 9 * s, bob - 7 * s, 9 * s, 14 * s, 1.6 * s, '#10141C');
    for (const sd of [-1, 1]){ const cy = bob + sd * 2.6 * s; ctx.save(); ctx.translate(13.6 * s, cy); ctx.rotate(ro * sd); ctx.fillStyle = '#C8CCD6'; for (let k = 0; k < 8; k++){ ctx.rotate(TAU / 8); ctx.beginPath(); ctx.moveTo(1.6 * s, -1 * s); ctx.lineTo(4.4 * s, 0); ctx.lineTo(1.6 * s, 1 * s); ctx.closePath(); ctx.fill(); } fillCircle(ctx, 0, 0, 1.8 * s, '#6A707C'); ctx.restore(); }
    if (spin) csGlow(ctx, 13 * s, bob, 20 * s, '#FFC8A8', 0.4);
    tw_eye(ctx, 3 * s, bob - 6.6 * s, 1.3 * s, TW_RED); tw_eye(ctx, 3 * s, bob + 6.6 * s, 1.3 * s, TW_RED);
  },
  tw_cam(ctx, e, b, dk, bob, wind, d){                                               /* Watching Orb: a dome camera that learned to float, its lens a red eye */
    const s = e.r / 15, a = e.anim, st = e.state === 'stare', pulse = 0.6 + 0.4 * Math.sin(a * 3);
    ctx.fillStyle = 'rgba(0,0,0,.2)'; ctx.beginPath(); ctx.ellipse(0, bob + 4 * s, 12 * s, 9 * s, 0, 0, TAU); ctx.fill();
    for (let k = 0; k < 3; k++){ const an = k * TAU / 3 + a * 2.4; const fx = Math.cos(an) * 12 * s, fy = bob + Math.sin(an) * 12 * s; tw_ln(ctx, [Math.cos(an) * 8 * s, bob + Math.sin(an) * 8 * s, fx, fy], 1.8 * s, dk); fillCircle(ctx, fx, fy, 2.4 * s, '#2A2E38'); fillCircle(ctx, fx, fy, 1.4 * s, '#6A707C'); }
    tw_ln(ctx, [-9 * s, bob, -14 * s, bob + Math.sin(a * 1.6) * 3 * s, -19 * s, bob - Math.sin(a * 1.2) * 3 * s], 1.8 * s, '#1E2228');
    fillCircle(ctx, 0, bob, 10.4 * s, dk); fillCircle(ctx, 0, bob, 9.4 * s, b); lkOV(ctx, -2 * s, bob - 3.4 * s, 6.4 * s, 2.8 * s, tw_li(b, 0.5), -0.3);
    ctx.strokeStyle = tw_sh(b, 0.4); ctx.lineWidth = 0.9 * s; ctx.beginPath(); ctx.arc(0, bob, 6.2 * s, 0, TAU); ctx.stroke();
    fillCircle(ctx, 4.6 * s, bob, 5.8 * s, '#10141C'); fillCircle(ctx, 4.8 * s, bob, 4.6 * s, '#3A0C0C'); fillCircle(ctx, 5 * s, bob, (3 + (st ? 1.6 : 0) + pulse * 0.6) * s, st ? '#FF8A6A' : TW_RED); fillCircle(ctx, 5.2 * s, bob, 1.4 * s, '#FFFFFF');
    csGlow(ctx, 7 * s, bob, (st ? 18 : 10) * s, TW_RED, st ? 0.55 : 0.3);
    if (st){ ctx.strokeStyle = 'rgba(255,90,74,.5)'; ctx.lineWidth = 1.2 * s; ctx.setLineDash([3, 4]); ctx.beginPath(); ctx.moveTo(10 * s, bob); ctx.lineTo(60 * s, bob); ctx.stroke(); ctx.setLineDash([]); }
    fillCircle(ctx, -5 * s, bob - 5.4 * s, 0.9 * s, Math.sin(a * 4) > 0 ? '#6AFFB0' : '#1E4A38');
  },
  tw_cable(ctx, e, b, dk, bob, wind, d){                                             /* Cable Serpent: a long power cable with a plug for a head */
    const s = e.r / 11, a = e.anim * 1.4, whip = e.state === 'whip', n = 10, pts = [];
    for (let i = 0; i < n; i++){ const t = i / (n - 1), amp = (whip ? 2 : 4.6) * s * (0.4 + t); pts.push([(8 - t * 40) * s, bob + Math.sin(a + t * 5) * amp]); }
    const cols = [dk, '#C8402E', '#2E5AC8', '#E8C23A'];
    for (let i = n - 1; i > 0; i--){ const p = pts[i], q = pts[i - 1]; tw_ln(ctx, [p[0], p[1], q[0], q[1]], (4.6 - i * 0.28) * s, '#10141A'); tw_ln(ctx, [p[0], p[1], q[0], q[1]], (3.4 - i * 0.2) * s, dk); }
    for (let i = n - 1; i > 0; i--){ const p = pts[i], q = pts[i - 1]; tw_ln(ctx, [p[0], p[1] - 0.8 * s, q[0], q[1] - 0.8 * s], 0.8 * s, cols[1 + i % 3]); }
    const hx = 9 * s, hy = pts[0][1];
    tw_rr(ctx, 2 * s, hy - 4.6 * s, 10 * s, 9.2 * s, 1.6 * s, '#10141A'); tw_rr(ctx, 3 * s, hy - 3.8 * s, 8 * s, 7.6 * s, 1.2 * s, tw_li(b, 0.2)); tw_rect(ctx, 3 * s, hy - 3.8 * s, 8 * s, 2 * s, tw_li(b, 0.5));
    tw_rect(ctx, 11 * s, hy - 3.2 * s, 6.4 * s, 1.8 * s, '#D8DCE4'); tw_rect(ctx, 11 * s, hy + 1.4 * s, 6.4 * s, 1.8 * s, '#D8DCE4');
    if (whip){ ctx.strokeStyle = '#9AE8FF'; ctx.lineWidth = 1.2 * s; ctx.beginPath(); ctx.moveTo(17.4 * s, hy - 2.3 * s); ctx.lineTo(19.4 * s, hy - 0.2 * s); ctx.lineTo(17.6 * s, hy + 0.6 * s); ctx.lineTo(19.6 * s, hy + 2.3 * s); ctx.stroke(); csGlow(ctx, 18 * s, hy, 9 * s, '#9AE8FF', 0.6); }
    for (const sd of [-1, 1]) tw_eye(ctx, 6 * s, hy + sd * 2.2 * s, 1.3 * s, TW_RED);
  },
  tw_hive(ctx, e, b, dk, bob, wind, d){                                              /* Server Hive: a rack on its back legs, with a nest of mites in the door */
    const s = e.r / 22, a = e.anim * 1.3, vent = e.state === 'vent';
    for (let k = 0; k < 6; k++){ const sd = k < 3 ? -1 : 1, i = k % 3, w = Math.sin(a + k * 1.5) * 2 * s; tw_ln(ctx, [(-10 + i * 10) * s, bob + sd * 12 * s, (-8 + i * 10) * s + w, bob + sd * 19 * s, (-4 + i * 10) * s, bob + sd * 23 * s], 3 * s, '#1A1E26'); }
    tw_rr(ctx, -20 * s, bob - 15 * s, 40 * s, 30 * s, 3 * s, dk); tw_rr(ctx, -19 * s, bob - 14 * s, 38 * s, 28 * s, 2.4 * s, b);
    tw_rect(ctx, -19 * s, bob - 14 * s, 38 * s, 3.4 * s, tw_li(b, 0.4));
    for (let k = 0; k < 5; k++){ tw_rr(ctx, -16 * s, bob + (-9.4 + k * 4.4) * s, 24 * s, 3.4 * s, 0.8 * s, '#161A22'); const on = Math.sin(a * 3 + k * 1.7) > -0.2; fillCircle(ctx, -14 * s, bob + (-7.7 + k * 4.4) * s, 0.9 * s, on ? '#6AFFB0' : '#1E4A38'); fillCircle(ctx, -11.4 * s, bob + (-7.7 + k * 4.4) * s, 0.9 * s, k % 2 ? '#FFB84A' : '#4A3A1E'); }
    tw_rr(ctx, 10 * s, bob - 11 * s, 9 * s, 22 * s, 1.6 * s, '#10141A');
    for (let k = 0; k < 7; k++){ const mx = (12 + (k % 2) * 3.4) * s + (vent ? Math.sin(a * 4 + k) * 1.6 * s : 0), my = bob + (-8.4 + k * 2.8) * s; fillCircle(ctx, mx, my, 1.3 * s, '#D8DCE4'); fillCircle(ctx, mx + 0.6 * s, my, 0.5 * s, TW_RED); }
    if (vent){ csGlow(ctx, 16 * s, bob, 22 * s, '#E8F0FF', 0.4); for (let k = 0; k < 3; k++) tw_poly(ctx, [19 * s, bob + (k - 1) * 5 * s - 1.4 * s, 25 * s, bob + (k - 1) * 6 * s, 19 * s, bob + (k - 1) * 5 * s + 1.4 * s], '#D8DCE4'); }
    tw_eye(ctx, 0, bob - 12 * s, 1.6 * s, TW_RED); tw_eye(ctx, 0, bob + 12 * s, 1.6 * s, TW_RED);
  },
  tw_battery(ctx, e, b, dk, bob, wind, d){                                           /* Spark Battery: a swollen cell with a bad temper, bulging as it gets ready to go */
    const s = e.r / 12, a = e.anim * 2, swell = e.state === 'swell', k = swell ? 1.28 : 1 + Math.sin(a * 1.5) * 0.03;
    for (let i = 0; i < 3; i++) for (const sd of [-1, 1]){ const w = Math.sin(a + i * 2 + (sd > 0 ? 0 : 1.6)) * 1.6 * s; tw_ln(ctx, [(-3 + i * 4) * s, bob + sd * 6 * s, (-2 + i * 4) * s + w, bob + sd * 9 * s, i * 4 * s, bob + sd * 11 * s], 1.6 * s, '#1A1E26'); }
    tw_rr(ctx, -9.6 * s * k, bob - 8 * s * k, 19.2 * s * k, 16 * s * k, 3 * s, dk); tw_rr(ctx, -8.6 * s * k, bob - 7 * s * k, 17.2 * s * k, 14 * s * k, 2.4 * s, b);
    tw_rect(ctx, -8.6 * s * k, bob - 7 * s * k, 17.2 * s * k, 3 * s, tw_li(b, 0.5));
    tw_rr(ctx, 9 * s * k, bob - 3 * s, 3.6 * s, 6 * s, 1 * s, '#C8CCD6'); tw_rect(ctx, 10 * s * k, bob - 1 * s, 2.6 * s, 2 * s, '#FFE04A');
    ctx.strokeStyle = '#10141A'; ctx.lineWidth = 1.3 * s; ctx.font = 'bold ' + 9 * s + 'px sans-serif'; ctx.fillStyle = '#10141A'; ctx.textAlign = 'center'; ctx.fillText('+', -5 * s, bob + 3.2 * s); ctx.fillText('−', -1 * s, bob + 3.2 * s); ctx.textAlign = 'left';
    tw_rect(ctx, -8.6 * s * k, bob + 3.4 * s * k, 17.2 * s * k, 2.4 * s, '#10141A'); for (let i = 0; i < 5; i++) tw_rect(ctx, (-7.6 + i * 3.4) * s * k, bob + 3.8 * s * k, 2.4 * s, 1.6 * s, i < 3 ? '#6AFF6A' : '#2A4A1E');
    ctx.strokeStyle = swell ? '#FFE04A' : '#9AE86A'; ctx.lineWidth = 1 * s; ctx.beginPath(); const z = Math.floor(a * 2) % 3; ctx.moveTo(-4 * s, bob - 5 * s); ctx.lineTo(-2 * s + z * 0.6 * s, bob - 2.4 * s); ctx.lineTo(-5 * s, bob - 1 * s); ctx.lineTo(-2 * s, bob + 1.4 * s); ctx.stroke();
    csGlow(ctx, 0, bob, (swell ? 26 : 14) * s, swell ? '#FF8A3A' : '#CFFF6A', swell ? 0.55 : 0.28);
    tw_eye(ctx, 6 * s * k, bob - 4 * s, 1.5 * s, swell ? '#FFE04A' : TW_RED); tw_eye(ctx, 6 * s * k, bob + 4 * s, 1.5 * s, swell ? '#FFE04A' : TW_RED);
  },

  /* ================= the bosses ================= */
  tw_reception(ctx, e, b, dk, bob, wind, d){                                         /* The Receptionist: a reception desk on spider legs, with a very patient smile behind it */
    const s = e.r / 52, a = e.anim, st = e.state, ring = st === 'ring', p2 = e.p2;
    for (let i = 0; i < 4; i++) for (const sd of [-1, 1]){ const w = Math.sin(a * 1.1 + i * 1.7 + (sd > 0 ? 0 : 1.6)) * 4 * s, x0 = (24 - i * 17) * s; tw_ln(ctx, [x0, bob + sd * 20 * s, x0 + 2 * s + w, bob + sd * 36 * s, x0 + 8 * s + w, bob + sd * 46 * s], 4.4 * s, '#1E222A'); tw_ln(ctx, [x0, bob + sd * 20 * s, x0 + 2 * s + w, bob + sd * 36 * s, x0 + 8 * s + w, bob + sd * 46 * s], 2.2 * s, '#8A909C'); fillCircle(ctx, x0 + 2 * s + w, bob + sd * 36 * s, 2.6 * s, '#C8A850'); }
    tw_rr(ctx, -40 * s, bob - 30 * s, 80 * s, 60 * s, 8 * s, dk); tw_rr(ctx, -38 * s, bob - 28 * s, 76 * s, 56 * s, 7 * s, b);
    tw_rr(ctx, -38 * s, bob - 28 * s, 76 * s, 9 * s, 6 * s, tw_li(b, 0.4)); tw_rect(ctx, -36 * s, bob + 16 * s, 72 * s, 3 * s, d.pale); tw_rect(ctx, -36 * s, bob - 19 * s, 72 * s, 2 * s, '#C8A850');
    tw_rr(ctx, 18 * s, bob - 26 * s, 20 * s, 52 * s, 6 * s, tw_sh(b, 0.18)); tw_rect(ctx, 20 * s, bob - 24 * s, 16 * s, 3 * s, '#C8A850');
    lkOV(ctx, -10 * s, bob + 2 * s, 14 * s, 12 * s, '#2A2E4A'); lkOV(ctx, -10 * s, bob + 2 * s, 12.6 * s, 10.6 * s, '#3A4066');                                  /* her shoulders in a blazer */
    tw_poly(ctx, [-14 * s, bob - 4 * s, -6 * s, bob + 2 * s, -14 * s, bob + 8 * s, -17 * s, bob + 2 * s], '#F4F0E8');
    for (const sd of [-1, 1]){ const up = (st === 'cordwind' || st === 'memowind') ? -6 * s : 0; tw_ln(ctx, [-10 * s, bob + sd * 10 * s, 4 * s, bob + sd * 17 * s + up, 16 * s, bob + sd * 12 * s + up * 0.5], 5 * s, '#2A2E4A'); fillCircle(ctx, 16 * s, bob + sd * 12 * s + up * 0.5, 3.4 * s, '#E8C8A8'); }
    lkOV(ctx, -4 * s, bob + 2 * s, 10 * s, 9 * s, '#2A1810'); lkOV(ctx, -3 * s, bob + 2 * s, 9 * s, 8 * s, '#E8C8A8');                                                    /* head, from above: hair, and a headset */
    lkOV(ctx, -9 * s, bob + 2 * s, 7 * s, 8 * s, '#3A2418'); fillCircle(ctx, -14 * s, bob + 2 * s, 4.4 * s, '#3A2418'); fillCircle(ctx, -14 * s, bob + 2 * s, 3.2 * s, '#4A3020');
    for (const sd of [-1, 1]){ fillCircle(ctx, -3 * s, bob + 2 * s + sd * 9 * s, 3.6 * s, '#1E222A'); fillCircle(ctx, -3 * s, bob + 2 * s + sd * 9 * s, 2.4 * s, '#5A6070'); }
    ctx.strokeStyle = '#1E222A'; ctx.lineWidth = 1.6 * s; ctx.beginPath(); ctx.arc(-3 * s, bob + 2 * s, 9 * s, -1.4, 1.4); ctx.stroke();
    tw_ln(ctx, [-3 * s, bob + 10 * s, 4 * s, bob + 9 * s, 7 * s, bob + 6 * s], 1.2 * s, '#1E222A'); fillCircle(ctx, 7 * s, bob + 6 * s, 1.6 * s, '#1E222A');
    tw_eye(ctx, 4 * s, bob - 1 * s, 1.6 * s, p2 ? '#FFE04A' : TW_RED); tw_eye(ctx, 4 * s, bob + 5 * s, 1.6 * s, p2 ? '#FFE04A' : TW_RED);
    tw_rr(ctx, 26 * s, bob - 12 * s, 14 * s, 12 * s, 2 * s, '#2A2E38'); tw_rr(ctx, 27 * s, bob - 11 * s, 12 * s, 9 * s, 1.4 * s, Math.sin(a * 2) > 0 ? '#6AB8E8' : '#4A8AB8');       /* her monitor */
    tw_rr(ctx, 26 * s, bob + 6 * s, 12 * s, 6 * s, 1.4 * s, '#5A4A3A'); tw_rect(ctx, 28 * s, bob + 8 * s, 8 * s, 2 * s, '#C8B890');
    const bx = 30 * s, by = bob + 20 * s;                                                                                                                                    /* the bell on the desk */
    fillCircle(ctx, bx, by, 6.4 * s, '#4A3A18'); fillCircle(ctx, bx, by, 5.4 * s, ring ? '#FFF0A0' : '#C8A850'); fillCircle(ctx, bx - 1.4 * s, by - 1.6 * s, 2 * s, '#FFFFFF'); fillCircle(ctx, bx, by, 1.2 * s, '#4A3A18');
    if (ring){ for (let k = 0; k < 3; k++) ringPath(ctx, bx, by, (10 + k * 7 + (a * 24) % 7) * s, 2, '#FFE49A', 0.6 - k * 0.15); csGlow(ctx, bx, by, 30 * s, '#FFE49A', 0.5); }
    for (const sd of [-1, 1]) tw_ln(ctx, [22 * s, bob + sd * 3 * s, 26 * s, bob + sd * (6 + Math.sin(a * 2 + sd) * 3) * s, 30 * s, bob + sd * 8 * s], 1.2 * s, '#2A2E38');
    if (st === 'cordwind'){ ctx.strokeStyle = 'rgba(255,228,154,.7)'; ctx.lineWidth = 2 * s; for (const sd of [-1, 1]){ ctx.beginPath(); ctx.moveTo(16 * s, bob + sd * 12 * s); ctx.quadraticCurveTo(40 * s, bob + sd * 30 * s, 60 * s, bob + sd * 18 * s); ctx.stroke(); } }
  },
  tw_manager(ctx, e, b, dk, bob, wind, d){                                           /* The Floor Manager: broad shoulders, a lanyard, a clipboard, and the look of a man who has called a meeting */
    const s = e.r / 56, a = e.anim, st = e.state, charge = st === 'charge' || st === 'chargewind', stun = st === 'stun', p2 = e.p2;
    const suit = b, suitD = dk, shirt = '#F0F0F4';
    for (const sd of [-1, 1]){ const w = charge ? 0 : Math.sin(a * 1.4 + (sd > 0 ? 0 : 3)) * 5 * s; lkOV(ctx, -22 * s + w, bob + sd * 11 * s, 11 * s, 6 * s, '#10141C'); lkOV(ctx, -22 * s + w, bob + sd * 11 * s, 9.6 * s, 4.8 * s, '#2A2E3A'); }
    if (charge){ for (let k = 1; k < 5; k++){ ctx.globalAlpha = 0.18 / k * 2; lkOV(ctx, (-18 - k * 9) * s, bob, 22 * s, 30 * s, d.pale); } ctx.globalAlpha = 1; }
    lkOV(ctx, -2 * s, bob, 26 * s, 38 * s, suitD); lkOV(ctx, -2 * s, bob, 24.4 * s, 36.4 * s, suit);
    lkOV(ctx, -6 * s, bob - 12 * s, 14 * s, 8 * s, tw_li(suit, 0.18)); lkOV(ctx, -6 * s, bob + 12 * s, 14 * s, 8 * s, tw_sh(suit, 0.15));
    tw_poly(ctx, [-2 * s, bob - 16 * s, 12 * s, bob - 6 * s, 8 * s, bob, 12 * s, bob + 6 * s, -2 * s, bob + 16 * s, 2 * s, bob], shirt);
    tw_poly(ctx, [2 * s, bob - 2 * s, 18 * s, bob - 1.2 * s, 20 * s, bob, 18 * s, bob + 1.2 * s, 2 * s, bob + 2 * s], '#C84A4A');
    tw_ln(ctx, [-2 * s, bob - 14 * s, 8 * s, bob - 4 * s, 8 * s, bob + 6 * s, -2 * s, bob + 14 * s], 1.4 * s, '#2A8A5A'); tw_rr(ctx, 7 * s, bob + 4 * s, 5 * s, 6.4 * s, 0.8 * s, '#F4F0C8');
    for (const sd of [-1, 1]){ const reach = charge ? 6 * s : sd > 0 ? Math.sin(a) * 3 * s : 0, ex = 14 * s + reach, ey = bob + sd * 20 * s;
      tw_ln(ctx, [-4 * s, bob + sd * 22 * s, 6 * s, bob + sd * 28 * s, ex, ey], 11 * s, suitD); tw_ln(ctx, [-4 * s, bob + sd * 22 * s, 6 * s, bob + sd * 28 * s, ex, ey], 9 * s, suit); fillCircle(ctx, ex, ey, 5 * s, '#E8C8A8'); }
    tw_rr(ctx, 14 * s, bob + 22 * s, 12 * s, 16 * s, 1.4 * s, '#8A6A44'); tw_rr(ctx, 15 * s, bob + 23.4 * s, 10 * s, 13 * s, 1 * s, '#F4F0E0'); for (let k = 0; k < 3; k++) tw_rect(ctx, 16.6 * s, bob + (26 + k * 3.2) * s, 7 * s, 0.9 * s, '#8A8A9A'); tw_rect(ctx, 17 * s, bob + 21.4 * s, 6 * s, 2.4 * s, '#C8CCD6');
    lkOV(ctx, 10 * s, bob, 12 * s, 11 * s, '#1E1410'); lkOV(ctx, 11 * s, bob, 10.4 * s, 9.6 * s, '#E8C8A8');
    for (let k = 0; k < 6; k++) lkTRI(ctx, (2 + k * 2.4) * s, bob - 9 * s, (3.6 + k * 2.4) * s, bob - 12.4 * s, (5 + k * 2.4) * s, bob - 8.6 * s, '#3A2A20');
    lkOV(ctx, 3 * s, bob, 5 * s, 9 * s, '#4A3A30');
    for (const sd of [-1, 1]){ fillCircle(ctx, 17 * s, bob + sd * 4 * s, 2.4 * s, '#10141C'); fillCircle(ctx, 17.6 * s, bob + sd * 4 * s, 1.6 * s, stun ? '#FFFFFF' : p2 ? '#FFE04A' : TW_RED); tw_ln(ctx, [14 * s, bob + sd * 7.4 * s, 20 * s, bob + sd * 5.4 * s], 1.8 * s, '#2A1A10'); }
    ctx.strokeStyle = '#2A1008'; ctx.lineWidth = 1.4 * s; ctx.beginPath(); ctx.moveTo(19.4 * s, bob - 3 * s); ctx.quadraticCurveTo(21.4 * s, bob, 19.4 * s, bob + 3 * s); ctx.stroke();
    if (stun){ for (let k = 0; k < 4; k++){ const an = a * 3 + k * TAU / 4; fillCircle(ctx, 8 * s + Math.cos(an) * 16 * s, bob + Math.sin(an) * 10 * s - 14 * s, 2.4 * s, '#FFF3CC'); } }
    if (st === 'meeting'){ ringPath(ctx, 0, bob, 50 * s, 3, d.pale, 0.5); csGlow(ctx, 0, bob, 60 * s, d.pale, 0.25); }
  },
  tw_vault(ctx, e, b, dk, bob, wind, d){                                             /* The Vault: a bank vault door with legs, a wheel for a face, and a great deal inside */
    const s = e.r / 66, a = e.anim, st = e.state, open = e.open || 0, p2 = e.p2, slam = st === 'slamwind' || st === 'quake';
    for (const [lx, ly] of [[22, -50], [22, 50], [-26, -48], [-26, 48]]){ const w = Math.sin(a * 1.1 + lx + ly) * 4 * s; lkOV(ctx, lx * s + w, bob + ly * s, 13 * s, 9 * s, '#1A1E26'); lkOV(ctx, lx * s + w, bob + ly * s, 11 * s, 7 * s, '#4A505C'); tw_rect(ctx, (lx - 8) * s + w, bob + ly * s - 1 * s, 16 * s, 2 * s, '#8A909C'); }
    tw_rr(ctx, -58 * s, bob - 54 * s, 116 * s, 108 * s, 14 * s, dk); tw_rr(ctx, -55 * s, bob - 51 * s, 110 * s, 102 * s, 12 * s, b);
    tw_rr(ctx, -55 * s, bob - 51 * s, 110 * s, 16 * s, 10 * s, tw_li(b, 0.3)); tw_rr(ctx, -55 * s, bob + 36 * s, 110 * s, 15 * s, 10 * s, tw_sh(b, 0.3));
    for (const [rx, ry] of [[-48, -44], [48, -44], [-48, 44], [48, 44]]) { fillCircle(ctx, rx * s, bob + ry * s, 4.4 * s, '#2A2E38'); fillCircle(ctx, rx * s, bob + ry * s, 3.2 * s, '#B8BEC8'); fillCircle(ctx, (rx - 0.8) * s, bob + (ry - 0.8) * s, 1.2 * s, '#FFFFFF'); }
    const cx = 2 * s, cy = bob, R = 38 * s;
    fillCircle(ctx, cx, cy, R + 5 * s, '#1A1E26'); fillCircle(ctx, cx, cy, R + 2 * s, '#8A909C'); fillCircle(ctx, cx, cy, R - 1 * s, '#3E424C');
    const rot = Math.sin(a * 0.4) * 0.08 + open * 0.5; ctx.save(); ctx.translate(cx, cy); ctx.rotate(rot);
    for (let k = 0; k < 12; k++){ ctx.rotate(TAU / 12); const out = (1 - open) * 4 * s; tw_rect(ctx, R - 6 * s + out, -2.4 * s, 9 * s, 4.8 * s, '#C8CCD6'); tw_rect(ctx, R - 6 * s + out, -2.4 * s, 9 * s, 1.4 * s, '#FFFFFF'); }
    ctx.restore();
    if (open > 0.05){ ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, R - 4 * s, 0, TAU); ctx.clip(); const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, R); g.addColorStop(0, '#FFF6B0'); g.addColorStop(1, '#C8901A'); ctx.globalAlpha = open; ctx.fillStyle = g; ctx.fillRect(cx - R, cy - R, R * 2, R * 2); ctx.fillStyle = '#FFE04A'; for (let k = 0; k < 12; k++) fillCircle(ctx, cx + Math.cos(k * 2.1) * R * 0.5, cy + Math.sin(k * 1.7) * R * 0.5, 4 * s, k % 2 ? '#FFD84A' : '#E8B830'); ctx.restore(); ctx.globalAlpha = 1; csGlow(ctx, cx, cy, R * 1.6, '#FFE04A', 0.45 * open); }
    fillCircle(ctx, cx, cy, 15 * s, '#2A2E38'); fillCircle(ctx, cx, cy, 13 * s, '#C8A850'); fillCircle(ctx, cx - 3 * s, cy - 3 * s, 4 * s, '#FFF0B0'); fillCircle(ctx, cx, cy, 5 * s, '#2A2E38');
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(rot * 2 + a * 0.2); ctx.strokeStyle = '#E8D890'; ctx.lineWidth = 2.4 * s; for (let k = 0; k < 6; k++){ ctx.rotate(TAU / 6); ctx.beginPath(); ctx.moveTo(5 * s, 0); ctx.lineTo(14 * s, 0); ctx.stroke(); } ctx.restore();
    for (const sd of [-1, 1]){ tw_rr(ctx, 38 * s, bob + sd * 24 * s - 5 * s, 18 * s, 10 * s, 2 * s, '#1A1E26'); tw_eye(ctx, 48 * s, bob + sd * 24 * s, 3.4 * s, slam ? '#FFE04A' : p2 ? '#FFB84A' : TW_RED); }
    tw_rect(ctx, 38 * s, bob - 6 * s, 12 * s, 12 * s, '#2A2E38'); for (let k = 0; k < 3; k++) tw_rect(ctx, 40 * s, bob + (-4 + k * 3.4) * s, 8 * s, 1.6 * s, '#9AA0AE');
    if (slam){ ringPath(ctx, 0, bob, 70 * s, 5, '#C8D0E0', 0.5); }
  },
  tw_scientist(ctx, e, b, dk, bob, wind, d){                                         /* The Chief Scientist: a lab coat with syringes for arms, goggles, and a belt of things that bubble */
    const s = e.r / 54, a = e.anim, st = e.state, sprint = st === 'sprint', flask = st === 'flaskwind', p2 = e.p2, release = st === 'release';
    for (const sd of [-1, 1]){ const w = sprint ? Math.sin(a * 6) * 8 * s : Math.sin(a * 1.4 + (sd > 0 ? 0 : 3)) * 4 * s; lkOV(ctx, -20 * s + w, bob + sd * 11 * s, 11 * s, 6 * s, '#1A2A1E'); lkOV(ctx, -20 * s + w, bob + sd * 11 * s, 9.6 * s, 4.8 * s, '#2E3A30'); }
    tw_poly(ctx, [-30 * s, bob - 4 * s, -22 * s, bob - 36 * s, 2 * s, bob - 38 * s, 20 * s, bob - 24 * s, 20 * s, bob + 24 * s, 2 * s, bob + 38 * s, -22 * s, bob + 36 * s, -30 * s, bob + 4 * s], dk);
    tw_poly(ctx, [-28 * s, bob - 3 * s, -21 * s, bob - 33 * s, 1 * s, bob - 35 * s, 17 * s, bob - 22 * s, 17 * s, bob + 22 * s, 1 * s, bob + 35 * s, -21 * s, bob + 33 * s, -28 * s, bob + 3 * s], '#F2F6F0');
    tw_ln(ctx, [-26 * s, bob, 14 * s, bob], 1.8 * s, '#C8D4C8'); for (let k = 0; k < 5; k++){ const px = (-20 + k * 7) * s; tw_rr(ctx, px, bob - 26 * s - (k % 2) * 2 * s, 4 * s, 7 * s, 1 * s, ['#6AE08A', '#FFB84A', '#6AB8E8', '#E86AE8', '#E8E86A'][k]); }
    for (let k = 0; k < 4; k++){ const bx = (-6 + k * 5) * s, by = bob + 16 * s; tw_rr(ctx, bx, by, 3.6 * s, 7 * s, 1 * s, 'rgba(200,255,200,.6)'); tw_rect(ctx, bx + 0.4 * s, by + (2 - (k % 2) * 1.4) * s, 2.8 * s, 4.4 * s, ['#6AE08A', '#9AE86A', '#6AFFB0', '#C8FF6A'][k]); }
    tw_rect(ctx, -4 * s, bob + 12 * s, 24 * s, 2.4 * s, '#5A4A3A'); fillCircle(ctx, 4 * s, bob + 13.2 * s, 1.6 * s, '#C8A850');
    for (const sd of [-1, 1]){
      const ex = (flask ? 30 : 26) * s, ey = bob + sd * 24 * s + (flask ? -sd * 4 * s : 0), swing = Math.sin(a * 1.4 + sd) * 3 * s;
      tw_ln(ctx, [-4 * s, bob + sd * 26 * s, 8 * s, bob + sd * 32 * s + swing, ex, ey], 10 * s, '#2A3A2E'); tw_ln(ctx, [-4 * s, bob + sd * 26 * s, 8 * s, bob + sd * 32 * s + swing, ex, ey], 8.4 * s, '#F2F6F0');
      if (sd > 0){ tw_rr(ctx, ex - 4 * s, ey - 4 * s, 30 * s, 8 * s, 2 * s, '#C8E8F0'); tw_rect(ctx, ex + 2 * s, ey - 3 * s, 20 * s, 6 * s, '#6AE08A'); tw_rect(ctx, ex + 24 * s, ey - 1 * s, 12 * s, 2 * s, '#C8CCD6'); tw_rect(ctx, ex - 8 * s, ey - 1 * s, 5 * s, 2 * s, '#8A909C'); tw_rect(ctx, ex - 8 * s, ey - 5 * s, 2.4 * s, 10 * s, '#8A909C'); }
      else { fillCircle(ctx, ex + 4 * s, ey, 8 * s, '#C8E8F0'); fillCircle(ctx, ex + 4 * s, ey, 6.6 * s, flask ? '#B8FF8A' : '#6AE08A'); fillCircle(ctx, ex + 2 * s, ey - 2 * s, 2 * s, '#FFFFFF'); tw_rect(ctx, ex + 2 * s, ey - 12 * s, 4 * s, 5 * s, '#C8E8F0'); for (let k = 0; k < 3; k++){ const ph = (a * 0.7 + k * 0.33) % 1; ctx.globalAlpha = 1 - ph; fillCircle(ctx, ex + 4 * s + Math.sin(k * 3 + a) * 3 * s, ey - ph * 14 * s, 1.4 * s, '#FFFFFF'); } ctx.globalAlpha = 1; }
    }
    lkOV(ctx, 8 * s, bob, 12 * s, 11 * s, '#1A2A1E'); lkOV(ctx, 8 * s, bob, 10.6 * s, 9.8 * s, '#CFE8B8');
    for (let k = 0; k < 9; k++){ const an = -1.2 + k * 0.3, rr = 12 * s + (k % 2) * 3 * s; ctx.strokeStyle = k % 2 ? '#F4F4F4' : '#D8D8DC'; ctx.lineWidth = 2.2 * s; ctx.beginPath(); ctx.moveTo(8 * s - Math.cos(an) * 6 * s, bob + Math.sin(an) * 7 * s); ctx.lineTo(8 * s - Math.cos(an) * rr, bob + Math.sin(an) * rr * 1.2); ctx.stroke(); }
    tw_rr(ctx, 14 * s, bob - 9 * s, 6 * s, 18 * s, 2 * s, '#1E222A');
    for (const sd of [-1, 1]){ fillCircle(ctx, 17.4 * s, bob + sd * 4.6 * s, 4.4 * s, '#2A2E38'); fillCircle(ctx, 17.8 * s, bob + sd * 4.6 * s, 3.4 * s, p2 || release ? '#FFE04A' : '#8AFFB0'); fillCircle(ctx, 18.8 * s, bob + sd * 4.2 * s, 1.1 * s, '#FFFFFF'); }
    if (release) { ringPath(ctx, 0, bob, 60 * s, 4, '#B8FF8A', 0.55); csGlow(ctx, 0, bob, 70 * s, '#B8FF8A', 0.3); }
    if (sprint) for (let k = 1; k < 4; k++){ ctx.globalAlpha = 0.16; lkOV(ctx, (-20 - k * 10) * s, bob, 22 * s, 30 * s, '#B8FF8A'); } ctx.globalAlpha = 1;
  },
  tw_ceo(ctx, e, b, dk, bob, wind, d){                                               /* The Chief Executive: a black suit that fills the doorway, a gold tie, a pen for a spear, and a glowing green vial in the pocket */
    const s = e.r / 62, a = e.anim, st = e.state, glow = e.glow || 0, ph = e.phase || 1, roar = st === 'roar', pulse = 0.6 + 0.4 * Math.sin(a * (2 + ph));
    csGlow(ctx, 0, bob, 80 * s, TW_GOLD, 0.1 + 0.18 * glow + 0.05 * pulse);
    for (const sd of [-1, 1]){ const w = Math.sin(a * 1.2 + (sd > 0 ? 0 : 3)) * 5 * s; lkOV(ctx, -26 * s + w, bob + sd * 12 * s, 13 * s, 7 * s, '#06080E'); lkOV(ctx, -26 * s + w, bob + sd * 12 * s, 11.6 * s, 5.8 * s, '#1A1C28'); lkOV(ctx, -23 * s + w, bob + sd * 12 * s, 4 * s, 2 * s, '#4A4C5A'); }
    lkOV(ctx, -2 * s, bob, 30 * s, 44 * s, '#05060C'); lkOV(ctx, -2 * s, bob, 28.4 * s, 42.4 * s, b);
    lkOV(ctx, -8 * s, bob - 14 * s, 17 * s, 9 * s, tw_li(b, 0.16)); lkOV(ctx, -8 * s, bob + 14 * s, 17 * s, 9 * s, tw_sh(b, 0.2));
    tw_ln(ctx, [-6 * s, bob - 36 * s, 10 * s, bob - 8 * s], 1.4 * s, '#3A3E56'); tw_ln(ctx, [-6 * s, bob + 36 * s, 10 * s, bob + 8 * s], 1.4 * s, '#3A3E56');
    tw_poly(ctx, [-2 * s, bob - 18 * s, 14 * s, bob - 5 * s, 10 * s, bob, 14 * s, bob + 5 * s, -2 * s, bob + 18 * s, 2 * s, bob], '#F4F4F8');
    tw_poly(ctx, [3 * s, bob - 3 * s, 22 * s, bob - 2 * s, 25 * s, bob, 22 * s, bob + 2 * s, 3 * s, bob + 3 * s], TW_GOLD); tw_poly(ctx, [3 * s, bob - 3 * s, 22 * s, bob - 2 * s, 14 * s, bob], tw_li(TW_GOLD, 0.4));
    tw_rr(ctx, 4 * s, bob + 10 * s, 10 * s, 13 * s, 1.6 * s, '#10121C');                                                                                   /* the breast pocket, and the vial in it */
    tw_rr(ctx, 6 * s, bob + 8 * s, 4.4 * s, 12 * s, 1.8 * s, 'rgba(210,255,220,.8)'); tw_rect(ctx, 6.6 * s, bob + 11 * s, 3.2 * s, 8 * s, '#6AFFA0'); tw_rect(ctx, 6.4 * s, bob + 7 * s, 3.6 * s, 2 * s, '#C8CCD6'); csGlow(ctx, 8 * s, bob + 15 * s, 16 * s, '#6AFFA0', 0.45 + 0.3 * pulse);
    for (const sd of [-1, 1]){
      const reach = (st === 'penwind' || st === 'chutewind' ? 10 : st === 'takeover' ? 14 : 4) * s, ex = 18 * s + reach, ey = bob + sd * 26 * s - (st === 'takeover' ? sd * 6 * s : 0);
      tw_ln(ctx, [-6 * s, bob + sd * 30 * s, 8 * s, bob + sd * 34 * s, ex, ey], 13 * s, '#05060C'); tw_ln(ctx, [-6 * s, bob + sd * 30 * s, 8 * s, bob + sd * 34 * s, ex, ey], 11 * s, b);
      tw_ln(ctx, [ex - 6 * s, ey, ex, ey], 4 * s, '#F4F4F8'); fillCircle(ctx, ex + 2 * s, ey, 5.6 * s, '#E0BC98'); tw_rect(ctx, ex - 3 * s, ey - 1 * s, 3 * s, 2 * s, TW_GOLD);
      if (sd > 0){ tw_ln(ctx, [ex, ey, ex + 36 * s, ey - 4 * s], 2.6 * s, '#10121C'); tw_ln(ctx, [ex, ey, ex + 36 * s, ey - 4 * s], 1.4 * s, TW_GOLD); lkTRI(ctx, ex + 36 * s, ey - 6 * s, ex + 48 * s, ey - 4 * s, ex + 36 * s, ey - 2 * s, '#F0F0F4'); if (st === 'penwind') csGlow(ctx, ex + 48 * s, ey - 4 * s, 16 * s, TW_GOLD, 0.6); }
    }
    lkOV(ctx, 14 * s, bob, 14 * s, 13 * s, '#05060C'); lkOV(ctx, 15 * s, bob, 12.4 * s, 11.8 * s, '#E0BC98');
    lkOV(ctx, 9 * s, bob, 8 * s, 12 * s, '#C8CCD6'); for (let k = 0; k < 7; k++) lkTRI(ctx, (6 + k * 2) * s, bob - 11 * s, (7.4 + k * 2) * s, bob - 14.4 * s, (9 + k * 2) * s, bob - 10.6 * s, '#C8CCD6');
    tw_rr(ctx, 18 * s, bob - 9 * s, 7 * s, 18 * s, 2 * s, '#10121C'); for (const sd of [-1, 1]){ tw_rr(ctx, 18.4 * s, bob + sd * 4.6 * s - 3 * s, 6.4 * s, 6 * s, 1.4 * s, '#1E2030'); fillCircle(ctx, 22 * s, bob + sd * 4.6 * s, 1.2 * s, roar ? '#FFE04A' : TW_RED); csGlow(ctx, 22 * s, bob + sd * 4.6 * s, 7 * s, roar ? '#FFE04A' : TW_RED, 0.5); }
    ctx.strokeStyle = '#2A1008'; ctx.lineWidth = 1.6 * s; ctx.beginPath(); ctx.moveTo(25.4 * s, bob - 4 * s); ctx.quadraticCurveTo(27.4 * s, bob, 25.4 * s, bob + 4 * s); ctx.stroke();
    tw_poly(ctx, [4 * s, bob - 11 * s, 7 * s, bob - 19 * s, 10 * s, bob - 12 * s, 14 * s, bob - 21 * s, 17 * s, bob - 12 * s, 21 * s, bob - 18 * s, 22 * s, bob - 10 * s], TW_GOLD);
    if (glow > 0.2){ ctx.strokeStyle = 'rgba(255,228,154,' + (0.6 * glow) + ')'; ctx.lineWidth = 2; for (let k = 0; k < 10; k++){ const an = k * TAU / 10 + a * 0.6; ctx.beginPath(); ctx.moveTo(Math.cos(an) * 50 * s, bob + Math.sin(an) * 50 * s); ctx.lineTo(Math.cos(an) * (62 + 14 * glow) * s, bob + Math.sin(an) * (62 + 14 * glow) * s); ctx.stroke(); } }
    if (st === 'takeover') ringPath(ctx, 0, bob, 66 * s, 5, TW_GOLD, 0.5 + 0.3 * glow);
    if (roar) ringPath(ctx, 0, bob, 80 * s, 5, '#FFF3C0', 0.55);
  }
};
Object.assign(ENEMY_LOOK_DRAW, TOWER_DRAW);
