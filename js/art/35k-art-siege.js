'use strict';
/* Enemy art, Chapter 15: the Siege (SIEGE_DRAW). */
/* Twelve ordinary kinds and five bosses, all new, drawn from above like every creature, facing +x: the humans' machines (steel and scrap, a red lens, a yellow warning stripe) and the
   creatures the glimmer has changed (lime and teal glow through the skin). Like the Tower's, the ordinary ones read only def, type, r, anim and state of the creature, so the sprite
   cache (js/game/44t-enemy-sprites.js) can keep pictures of them. The helpers (tw_poly, tw_ln, tw_rr, tw_eye ...) are the Tower art's, in js/art/35j-art-tower.js. */
const SG_RED = '#FF5A4A', SG_LIME = '#C8FF6A', SG_TEAL = '#7AF0D8', SG_AMBER = '#FFB84A';
const SIEGE_DRAW = {
  sg_patrol(ctx, e, b, dk, bob, wind, d){                                              /* Patrol Bot: a legged guard dog of scrap plate with a red visor */
    const s = e.r / 13, a = e.anim * 2.4, lunge = e.state === 'lunge';
    for (let i = 0; i < 2; i++) for (const sd of [-1, 1]){ const w = Math.sin(a + i * Math.PI + (sd > 0 ? 0 : 1.6)) * 3 * s, x0 = (7 - i * 12) * s; tw_ln(ctx, [x0, bob + sd * 5 * s, x0 + 2 * s + w, bob + sd * 9 * s, x0 + w * 1.4, bob + sd * 12 * s], 2.4 * s, dk); fillCircle(ctx, x0 + w * 1.4, bob + sd * 12 * s, 1.6 * s, '#2A3038'); }
    tw_rr(ctx, -14 * s, bob - 6 * s, 24 * s, 12 * s, 3 * s, dk); tw_rr(ctx, -13 * s, bob - 5 * s, 22 * s, 10 * s, 2.6 * s, b);
    tw_rect(ctx, -8 * s, bob - 5 * s, 2.6 * s, 10 * s, tw_sh(b, 0.3)); tw_rect(ctx, -1 * s, bob - 5 * s, 2.6 * s, 10 * s, tw_sh(b, 0.3)); tw_rect(ctx, -13 * s, bob - 5 * s, 22 * s, 2 * s, tw_li(b, 0.4));
    tw_rr(ctx, 8 * s, bob - 5 * s, 10 * s, 10 * s, 2.4 * s, dk); tw_rr(ctx, 9 * s, bob - 4 * s, 8 * s, 8 * s, 2 * s, tw_li(b, 0.25)); tw_rect(ctx, 13 * s, bob - 3.4 * s, 3.6 * s, 6.8 * s, '#10141C'); fillCircle(ctx, 15 * s, bob, 1.6 * s, SG_RED);
    tw_ln(ctx, [9 * s, bob - 5 * s, 7 * s, bob - 9 * s], 1.2 * s, '#C8CCD4'); fillCircle(ctx, -14 * s, bob, 1.6 * s, lunge ? '#FFE04A' : '#FF8A3A');
  },
  sg_maggot(ctx, e, b, dk, bob, wind, d){                                              /* Glimmer Maggot: a fat grub that glows from the inside */
    const s = e.r / 6, a = e.anim * 3;
    csGlow(ctx, 0, bob, 12 * s, SG_LIME, 0.22);
    for (let i = 3; i >= 0; i--){ const w = Math.sin(a - i * 0.9) * 1.1 * s, x = (-3 - i * 3.2) * s; lkOV(ctx, x, bob + w, (4.2 - i * 0.4) * s, (3.4 - i * 0.3) * s, dk); lkOV(ctx, x, bob + w, (3.7 - i * 0.4) * s, (2.9 - i * 0.3) * s, i % 2 ? tw_li(b, 0.2) : b); }
    lkOV(ctx, 3 * s, bob, 4.6 * s, 3.8 * s, dk); lkOV(ctx, 3 * s, bob, 4.1 * s, 3.3 * s, tw_li(b, 0.3)); lkTRI(ctx, 6.8 * s, bob - 1.8 * s, 9.4 * s, bob - 0.6 * s, 6.8 * s, bob, '#F4FFD0'); lkTRI(ctx, 6.8 * s, bob + 1.8 * s, 9.4 * s, bob + 0.6 * s, 6.8 * s, bob, '#F4FFD0');
    fillCircle(ctx, 4.4 * s, bob - 1.4 * s, 0.8 * s, '#10200A'); fillCircle(ctx, 4.4 * s, bob + 1.4 * s, 0.8 * s, '#10200A');
  },
  sg_skitter(ctx, e, b, dk, bob, wind, d){                                             /* Skitter Drone: four rotors round a yellow body, a lens underneath */
    const s = e.r / 11, a = e.anim * 9, dash = e.state === 'dash' || e.state === 'wind';
    for (const [ax, ay] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]){ tw_ln(ctx, [0, bob, ax * 9 * s, bob + ay * 9 * s], 1.8 * s, dk); ctx.save(); ctx.translate(ax * 9 * s, bob + ay * 9 * s); ctx.rotate(a * ax * ay); lkOV(ctx, 0, 0, 7 * s, 1.6 * s, 'rgba(220,226,236,.55)'); lkOV(ctx, 0, 0, 1.6 * s, 7 * s, 'rgba(220,226,236,.35)'); ctx.restore(); fillCircle(ctx, ax * 9 * s, bob + ay * 9 * s, 2 * s, dk); }
    fillCircle(ctx, 0, bob, 6.4 * s, dk); fillCircle(ctx, 0, bob, 5.6 * s, b); fillCircle(ctx, -1 * s, bob - 1.4 * s, 3 * s, tw_li(b, 0.4)); tw_rect(ctx, -5.6 * s, bob - 0.8 * s, 11.2 * s, 1.6 * s, '#3A2E14');
    tw_eye(ctx, 4 * s, bob, 1.8 * s, dash ? '#FFE04A' : SG_RED);
  },
  sg_raptor(ctx, e, b, dk, bob, wind, d){                                              /* Raptor Bot: a low blue sprinter on two long digitigrade legs */
    const s = e.r / 14, a = e.anim * 3, run = e.state === 'wind' || e.state === 'roll';
    for (const sd of [-1, 1]){ const w = Math.sin(a + (sd > 0 ? 0 : Math.PI)) * 6 * s; tw_ln(ctx, [-6 * s, bob + sd * 5 * s, -9 * s + w, bob + sd * 8 * s, -14 * s + w * 1.6, bob + sd * 7 * s], 3 * s, dk); tw_ln(ctx, [5 * s, bob + sd * 4 * s, 8 * s - w, bob + sd * 7 * s, 4 * s - w * 1.4, bob + sd * 8 * s], 2.4 * s, dk); }
    lkOV(ctx, -1 * s, bob, 15 * s, 6.6 * s, dk); lkOV(ctx, -1 * s, bob, 14 * s, 5.6 * s, b); lkOV(ctx, -2 * s, bob - 2 * s, 9 * s, 1.8 * s, tw_li(b, 0.4)); tw_rect(ctx, -6 * s, bob - 5.4 * s, 2 * s, 10.8 * s, tw_sh(b, 0.3));
    lkOV(ctx, 13 * s, bob, 6 * s, 3.6 * s, dk); lkOV(ctx, 13 * s, bob, 5.2 * s, 3 * s, tw_li(b, 0.2)); tw_rect(ctx, 14 * s, bob - 1.2 * s, 5 * s, 2.4 * s, SG_RED); tw_ln(ctx, [-14 * s, bob, -22 * s, bob + Math.sin(a) * 2 * s], 2 * s, dk);
    if (run) for (let k = 1; k < 4; k++){ ctx.globalAlpha = 0.14; lkOV(ctx, (-14 - k * 9) * s, bob, 12 * s, 5 * s, '#8AB8FF'); } ctx.globalAlpha = 1;
  },
  sg_dozer(ctx, e, b, dk, bob, wind, d){                                               /* Dozer Bot: a yellow bulldozer with a blade across the front and a small red eye in the cab */
    const s = e.r / 15, a = e.anim * 1.6;
    for (const sd of [-1, 1]){ tw_rr(ctx, -14 * s, bob + sd * 10 * s - 3.6 * s, 26 * s, 7.2 * s, 2.6 * s, '#1C1E24'); for (let k = 0; k < 6; k++){ const x = -13 * s + ((k * 4.4 * s + a * 3 * s) % (24 * s)); tw_rect(ctx, x, bob + sd * 10 * s - 3 * s, 1.2 * s, 6 * s, '#40444E'); } }
    tw_rr(ctx, -12 * s, bob - 8 * s, 22 * s, 16 * s, 3 * s, dk); tw_rr(ctx, -11 * s, bob - 7 * s, 20 * s, 14 * s, 2.6 * s, b); tw_rect(ctx, -11 * s, bob - 7 * s, 20 * s, 2.6 * s, tw_li(b, 0.45));
    for (let k = 0; k < 4; k++) tw_poly(ctx, [-8 * s + k * 5 * s, bob + 7 * s, -5 * s + k * 5 * s, bob + 7 * s, -3 * s + k * 5 * s, bob + 3 * s, -6 * s + k * 5 * s, bob + 3 * s], k % 2 ? '#1C1E24' : '#F4F0E0');
    tw_rr(ctx, -2 * s, bob - 4 * s, 9 * s, 8 * s, 1.6 * s, '#2A2E38'); tw_eye(ctx, 4 * s, bob, 1.6 * s, SG_RED);
    tw_poly(ctx, [12 * s, bob - 15 * s, 18 * s, bob - 13 * s, 18 * s, bob + 13 * s, 12 * s, bob + 15 * s], dk); tw_poly(ctx, [12.4 * s, bob - 13.6 * s, 17 * s, bob - 11.6 * s, 17 * s, bob + 11.6 * s, 12.4 * s, bob + 13.6 * s], tw_li(b, 0.2));
    tw_ln(ctx, [-12 * s, bob - 4 * s, -17 * s, bob - 8 * s], 2 * s, '#2A2E38'); fillCircle(ctx, -17.4 * s, bob - 8.6 * s, 1.6 * s, 'rgba(120,120,126,.6)');
  },
  sg_spotter(ctx, e, b, dk, bob, wind, d){                                             /* Spotter Drone: a hovering camera ball with one big lens and a searchlight */
    const s = e.r / 10, a = e.anim * 7, aim = e.state === 'aim';
    if (aim){ ctx.globalAlpha = 0.16; lkTRI(ctx, 4 * s, bob, 60 * s, bob - 14 * s, 60 * s, bob + 14 * s, '#FFE8A0'); ctx.globalAlpha = 1; }
    for (const sd of [-1, 1]){ ctx.save(); ctx.translate(-2 * s, bob + sd * 9 * s); ctx.rotate(a * sd); lkOV(ctx, 0, 0, 6.4 * s, 1.3 * s, 'rgba(220,226,236,.5)'); ctx.restore(); tw_ln(ctx, [-2 * s, bob + sd * 4 * s, -2 * s, bob + sd * 9 * s], 1.4 * s, dk); }
    fillCircle(ctx, 0, bob, 8 * s, dk); fillCircle(ctx, 0, bob, 7.2 * s, b); fillCircle(ctx, -2 * s, bob - 2 * s, 3.8 * s, tw_li(b, 0.4)); ctx.strokeStyle = tw_sh(b, 0.4); ctx.lineWidth = 0.9 * s; ctx.beginPath(); ctx.moveTo(-7 * s, bob); ctx.lineTo(7 * s, bob); ctx.stroke();
    fillCircle(ctx, 5 * s, bob, 3.8 * s, '#10141C'); fillCircle(ctx, 5 * s, bob, 2.8 * s, aim ? '#FFE04A' : SG_RED); fillCircle(ctx, 4.2 * s, bob - 1 * s, 0.9 * s, '#FFFFFF');
  },
  sg_hornback(ctx, e, b, dk, bob, wind, d){                                            /* Glimmerhorn: a mutated rhino with a crystal horn and glowing veins down its plates */
    const s = e.r / 17, a = e.anim * 1.8, charge = e.state === 'dash' || e.state === 'charge';
    for (const sd of [-1, 1]) for (let i = 0; i < 2; i++){ const w = Math.sin(a + i * Math.PI + (sd > 0 ? 0 : 1.4)) * 2.6 * s; lkOV(ctx, (7 - i * 14) * s + w, bob + sd * 10 * s, 4.4 * s, 3.4 * s, dk); }
    lkOV(ctx, -1 * s, bob, 18 * s, 12 * s, dk); lkOV(ctx, -1 * s, bob, 16.6 * s, 11 * s, b);
    for (let k = 0; k < 4; k++){ lkOV(ctx, (-9 + k * 5) * s, bob, 3 * s, 10 * s, tw_li(b, 0.14)); tw_ln(ctx, [(-9 + k * 5) * s, bob - 7 * s, (-9 + k * 5) * s + 0.5 * s, bob + 7 * s], 0.9 * s, SG_LIME); }
    csGlow(ctx, 0, bob, 20 * s, SG_LIME, 0.12);
    lkOV(ctx, 14 * s, bob, 8 * s, 6.4 * s, dk); lkOV(ctx, 14 * s, bob, 7.2 * s, 5.6 * s, tw_li(b, 0.2));
    tw_poly(ctx, [19 * s, bob - 2.6 * s, 29 * s, bob, 19 * s, bob + 2.6 * s], '#C8FFF0'); tw_poly(ctx, [19 * s, bob - 1.4 * s, 26 * s, bob, 19 * s, bob + 1.4 * s], '#7AF0D8'); csGlow(ctx, 27 * s, bob, 8 * s, SG_TEAL, charge ? 0.4 : 0.2);
    for (const sd of [-1, 1]){ lkTRI(ctx, 9 * s, bob + sd * 5.6 * s, 12 * s, bob + sd * 9 * s, 13 * s, bob + sd * 5.4 * s, dk); fillCircle(ctx, 16 * s, bob + sd * 3.4 * s, 1 * s, '#FFE04A'); }
  },
  sg_hurler(ctx, e, b, dk, bob, wind, d){                                              /* Rockhurler: a hunched mutant baboon with one huge arm and glowing patches */
    const s = e.r / 14, a = e.anim * 2, wind2 = e.state === 'lobwind' || e.state === 'lob';
    for (const sd of [-1, 1]){ const w = Math.sin(a + (sd > 0 ? 0 : Math.PI)) * 2.4 * s; lkOV(ctx, -8 * s + w, bob + sd * 7 * s, 4.6 * s, 3.2 * s, dk); }
    lkOV(ctx, -3 * s, bob, 12 * s, 9 * s, dk); lkOV(ctx, -3 * s, bob, 11 * s, 8 * s, b); lkOV(ctx, -6 * s, bob, 5 * s, 6 * s, tw_li(b, 0.14)); csGlow(ctx, -4 * s, bob + 2 * s, 7 * s, '#C8A0FF', 0.2);
    for (const sd of [-1, 1]){ const big = sd > 0, ex = (wind2 && big ? 4 : 10) * s, ey = bob + sd * (big ? 15 : 10) * s - (wind2 && big ? 8 * s : 0); tw_ln(ctx, [0, bob + sd * 6 * s, 5 * s, bob + sd * 11 * s, ex, ey], (big ? 6.4 : 4) * s, dk); tw_ln(ctx, [0, bob + sd * 6 * s, 5 * s, bob + sd * 11 * s, ex, ey], (big ? 5 : 3) * s, b); fillCircle(ctx, ex, ey, (big ? 4.4 : 2.8) * s, tw_li(b, 0.1)); if (big && wind2) fillCircle(ctx, ex + 3 * s, ey, 4.6 * s, '#8A8E98'); }
    lkOV(ctx, 8 * s, bob, 6 * s, 5.4 * s, dk); lkOV(ctx, 8.4 * s, bob, 5 * s, 4.6 * s, tw_li(b, 0.3)); lkOV(ctx, 12 * s, bob, 3 * s, 2.6 * s, '#D8C0A0'); fillCircle(ctx, 9.6 * s, bob - 2 * s, 0.9 * s, '#FFE04A'); fillCircle(ctx, 9.6 * s, bob + 2 * s, 0.9 * s, '#FFE04A');
  },
  sg_sapper(ctx, e, b, dk, bob, wind, d){                                              /* Sapper Bot: a round little bomb on stubby legs with charges strapped on and a fuse light that blinks faster as it nears a wall */
    const s = e.r / 10, a = e.anim * 4, blink = Math.sin(e.anim * 3) > 0;
    for (let i = 0; i < 3; i++) for (const sd of [-1, 1]){ const w = Math.sin(a + i * 2.1 + (sd > 0 ? 0 : 1.6)) * 1.8 * s; tw_ln(ctx, [(4 - i * 4) * s, bob + sd * 5 * s, (5 - i * 4) * s + w, bob + sd * 8.6 * s], 1.8 * s, dk); }
    fillCircle(ctx, 0, bob, 8.6 * s, dk); fillCircle(ctx, 0, bob, 7.8 * s, b); fillCircle(ctx, -2 * s, bob - 2.4 * s, 4 * s, tw_li(b, 0.35));
    for (const sd of [-1, 1]){ tw_rr(ctx, -3 * s, bob + sd * 6 * s - 1.8 * s, 7 * s, 3.6 * s, 1 * s, '#3A2A24'); tw_rect(ctx, -2 * s, bob + sd * 6 * s - 1 * s, 5 * s, 0.8 * s, SG_AMBER); }
    tw_rect(ctx, -2 * s, bob - 8.6 * s, 4 * s, 2 * s, '#2A2E38'); tw_ln(ctx, [0, bob - 8.6 * s, 2 * s, bob - 11 * s], 0.9 * s, '#C8A060'); fillCircle(ctx, 2 * s, bob - 11.4 * s, 1.5 * s, blink ? '#FFF04A' : '#7A2A1A');
    tw_eye(ctx, 5 * s, bob, 1.8 * s, SG_RED);
  },
  sg_glassfang(ctx, e, b, dk, bob, wind, d){                                           /* Glassfang: a long teal snake of living crystal, glowing along its spine */
    const s = e.r / 11, a = e.anim * 2.2, n = 9, lunge = e.state === 'lunge';
    csGlow(ctx, 0, bob, 24 * s, SG_TEAL, 0.12);
    for (let i = n - 1; i >= 0; i--){ const x = (8 - i * 4.2) * s, y = bob + Math.sin(a - i * 0.7) * 3.4 * s * (0.5 + i / n), r = (4.6 - i * 0.38) * s; fillCircle(ctx, x, y, r, dk); fillCircle(ctx, x, y, r * 0.86, i % 2 ? b : tw_li(b, 0.18)); fillCircle(ctx, x - r * 0.2, y - r * 0.2, r * 0.3, 'rgba(255,255,255,.55)'); if (i % 2 === 0) fillCircle(ctx, x, y, r * 0.3, SG_TEAL); }
    lkOV(ctx, 10 * s, bob, 5.6 * s, 4.2 * s, dk); lkOV(ctx, 10 * s, bob, 4.8 * s, 3.5 * s, tw_li(b, 0.3));
    lkTRI(ctx, 13 * s, bob - 1.4 * s, lunge ? 19 * s : 16.4 * s, bob - 0.6 * s, 13 * s, bob, '#F0FFFC'); lkTRI(ctx, 13 * s, bob + 1.4 * s, lunge ? 19 * s : 16.4 * s, bob + 0.6 * s, 13 * s, bob, '#F0FFFC');
    fillCircle(ctx, 11 * s, bob - 2 * s, 1 * s, '#FFE04A'); fillCircle(ctx, 11 * s, bob + 2 * s, 1 * s, '#FFE04A');
  },
  sg_torch(ctx, e, b, dk, bob, wind, d){                                               /* Torch Bot: a squat fuel drum on wheels with a nozzle and a flame at its mouth */
    const s = e.r / 12, fire = e.state === 'burn' || e.state === 'burnwind';
    for (const sd of [-1, 1]) for (const x of [-6, 5]){ tw_rr(ctx, x * s - 2.6 * s, bob + sd * 9 * s - 2 * s, 5.2 * s, 4 * s, 1.2 * s, '#1C1E24'); }
    tw_rr(ctx, -10 * s, bob - 8 * s, 18 * s, 16 * s, 4 * s, dk); tw_rr(ctx, -9 * s, bob - 7 * s, 16 * s, 14 * s, 3.4 * s, b); tw_rect(ctx, -9 * s, bob - 7 * s, 16 * s, 2.4 * s, tw_li(b, 0.4)); tw_rect(ctx, -9 * s, bob - 1 * s, 16 * s, 2 * s, '#2A1208');
    for (let k = 0; k < 3; k++) tw_poly(ctx, [-8 * s + k * 5 * s, bob + 7 * s, -5 * s + k * 5 * s, bob + 7 * s, -3 * s + k * 5 * s, bob + 3 * s, -6 * s + k * 5 * s, bob + 3 * s], k % 2 ? '#1C1E24' : SG_AMBER);
    tw_rr(ctx, 7 * s, bob - 3 * s, 8 * s, 6 * s, 1.4 * s, '#2A2E38'); tw_rect(ctx, 14 * s, bob - 2 * s, 3 * s, 4 * s, '#10141C'); fillCircle(ctx, 1 * s, bob - 4 * s, 1.4 * s, SG_RED);
    const fl = fire ? 1 : 0.35; for (let k = 0; k < 3; k++){ const w = Math.sin(e.anim * 14 + k * 2) * 1.4 * s; ctx.globalAlpha = 0.85; lkOV(ctx, (18 + k * 3.4 * fl) * s, bob + w, (3 + fl * 3 - k * 0.7) * s, (2.2 + fl * 1.4 - k * 0.5) * s, ['#FFE04A', '#FF8A3A', '#E8401A'][k]); } ctx.globalAlpha = 1;
    csGlow(ctx, 20 * s, bob, 10 * s * (0.6 + fl), '#FF8A3A', 0.25);
  },
  sg_gnawer(ctx, e, b, dk, bob, wind, d){                                              /* Gnawer: a bloated glimmer beetle with big mandibles that chew through anything */
    const s = e.r / 13, a = e.anim * 2.6, chew = Math.sin(e.anim * 6) * 1.6 * s;
    for (let i = 0; i < 3; i++) for (const sd of [-1, 1]){ const w = Math.sin(a + i * 2 + (sd > 0 ? 0 : 1.4)) * 2 * s; tw_ln(ctx, [(5 - i * 6) * s, bob + sd * 6 * s, (7 - i * 6) * s + w, bob + sd * 11 * s, (4 - i * 6) * s + w, bob + sd * 13.4 * s], 1.8 * s, dk); }
    lkOV(ctx, -6 * s, bob, 11 * s, 9.4 * s, dk); lkOV(ctx, -6 * s, bob, 10 * s, 8.4 * s, b); csGlow(ctx, -8 * s, bob, 12 * s, SG_LIME, 0.22); lkOV(ctx, -9 * s, bob, 5 * s, 5 * s, tw_li(b, 0.4));
    for (let k = 0; k < 3; k++) tw_ln(ctx, [(-14 + k * 5) * s, bob - 7 * s, (-14 + k * 5) * s, bob + 7 * s], 0.9 * s, tw_sh(b, 0.3));
    lkOV(ctx, 6 * s, bob, 7 * s, 6 * s, dk); lkOV(ctx, 6 * s, bob, 6 * s, 5 * s, tw_li(b, 0.2));
    for (const sd of [-1, 1]){ const m = sd * (4 + chew * sd * 0.5) * s; tw_poly(ctx, [10 * s, bob + sd * 2 * s, 17 * s, bob + m * 0.7, 18 * s, bob + m * 0.5, 11 * s, bob + sd * 4.6 * s], '#E8F0B0'); fillCircle(ctx, 8 * s, bob + sd * 3 * s, 1 * s, SG_RED); }
  },
  sg_walker(ctx, e, b, dk, bob, wind, d){                                              /* The Scrap Walker: a four-legged hulk welded from everything, a cannon on one shoulder and a stack of red lenses for a face */
    const s = e.r / 56, a = e.anim * 1.4, st = e.state, glow = st === 'stompwind' || st === 'cannonwind' ? 1 : 0;
    csGlow(ctx, 0, bob, 90 * s, SG_RED, 0.06 + 0.14 * glow);
    for (const sd of [-1, 1]) for (let i = 0; i < 2; i++){ const w = Math.sin(a + i * Math.PI + (sd > 0 ? 0 : 1.2)) * 9 * s, x0 = (24 - i * 40) * s; tw_ln(ctx, [x0, bob + sd * 20 * s, x0 + 6 * s + w, bob + sd * 36 * s, x0 + 2 * s + w * 1.5, bob + sd * 50 * s], 11 * s, '#14161C'); tw_ln(ctx, [x0, bob + sd * 20 * s, x0 + 6 * s + w, bob + sd * 36 * s, x0 + 2 * s + w * 1.5, bob + sd * 50 * s], 8 * s, b); lkOV(ctx, x0 + 2 * s + w * 1.5, bob + sd * 50 * s, 9 * s, 6 * s, '#1C1E24'); }
    tw_rr(ctx, -42 * s, bob - 26 * s, 74 * s, 52 * s, 9 * s, '#0C0E14'); tw_rr(ctx, -40 * s, bob - 24 * s, 70 * s, 48 * s, 8 * s, b);
    for (const [x, y, w, h] of [[-34, -20, 22, 14], [-8, -22, 24, 12], [-30, 4, 28, 16], [4, 6, 22, 14]]) { tw_rr(ctx, x * s, bob + y * s, w * s, h * s, 2 * s, tw_li(b, 0.1 + ((x + y) % 3) * 0.08)); for (const [px, py] of [[1.6, 1.6], [w - 1.6, 1.6], [1.6, h - 1.6], [w - 1.6, h - 1.6]]) fillCircle(ctx, (x + px) * s, bob + (y + py) * s, 0.9 * s, '#30343E'); }
    tw_rect(ctx, -40 * s, bob - 2 * s, 70 * s, 3 * s, 'rgba(255,208,70,.55)');
    tw_rr(ctx, 6 * s, bob - 34 * s, 40 * s, 12 * s, 3 * s, '#0C0E14'); tw_rr(ctx, 8 * s, bob - 32.4 * s, 36 * s, 9 * s, 2 * s, tw_sh(b, 0.2)); tw_rr(ctx, 44 * s, bob - 31 * s, 16 * s, 6 * s, 1.6 * s, '#10121A'); fillCircle(ctx, 60 * s, bob - 28 * s, 3 * s, glow ? '#FFB84A' : '#3A3E48');
    tw_rr(ctx, 26 * s, bob - 15 * s, 22 * s, 30 * s, 6 * s, '#0C0E14'); for (let k = 0; k < 3; k++){ tw_eye(ctx, 40 * s, bob + (-9 + k * 9) * s, (3.4 - (k === 1 ? 0 : 0.8)) * s, k === 1 ? '#FF2A1A' : SG_RED); }
    tw_ln(ctx, [-30 * s, bob - 22 * s, -38 * s, bob - 34 * s], 3 * s, '#C8CCD4'); fillCircle(ctx, -38.6 * s, bob - 35 * s, 2.4 * s, 'rgba(210,214,222,.55)');
    if (st === 'stompwind') ringPath(ctx, 0, bob, 62 * s, 4, '#FFB84A', 0.5);
  },
  sg_queen(ctx, e, b, dk, bob, wind, d){                                               /* The Brood Queen: a swollen glimmer mutant, egg sacs glowing in her sides, a crown of crystal and too many legs */
    const s = e.r / 58, a = e.anim * 1.6, st = e.state, pulse = 0.6 + 0.4 * Math.sin(e.anim * 2.4), glow = st === 'spawnwind' || st === 'spitwind' ? 1 : 0;
    csGlow(ctx, 0, bob, 96 * s, SG_LIME, 0.1 + 0.14 * pulse + 0.1 * glow);
    for (let i = 0; i < 5; i++) for (const sd of [-1, 1]){ const w = Math.sin(a + i * 1.7 + (sd > 0 ? 0 : 1.1)) * 6 * s, x0 = (22 - i * 15) * s; tw_ln(ctx, [x0, bob + sd * 22 * s, x0 + 5 * s + w, bob + sd * 36 * s, x0 + w * 1.4, bob + sd * 46 * s], 5 * s, dk); }
    lkOV(ctx, -22 * s, bob, 34 * s, 28 * s, dk); lkOV(ctx, -22 * s, bob, 32.4 * s, 26.6 * s, b);
    for (let k = 0; k < 6; k++){ const sd = k % 2 ? 1 : -1, x = (-34 + (k >> 1) * 14) * s, y = bob + sd * 19 * s; fillCircle(ctx, x, y, 8 * s, '#2E5A14'); fillCircle(ctx, x, y, 6.6 * s, '#E8FFC0'); csGlow(ctx, x, y, 11 * s, SG_LIME, 0.3 * pulse); fillCircle(ctx, x - 1.6 * s, y - 1.6 * s, 2 * s, '#FFFFFF'); }
    for (let k = 0; k < 4; k++) tw_ln(ctx, [(-44 + k * 11) * s, bob - 24 * s, (-44 + k * 11) * s, bob + 24 * s], 1.4 * s, 'rgba(30,60,10,.45)');
    lkOV(ctx, 14 * s, bob, 22 * s, 20 * s, dk); lkOV(ctx, 14 * s, bob, 20.6 * s, 18.6 * s, tw_li(b, 0.14));
    for (let k = 0; k < 5; k++){ const an = (k - 2) * 0.42, ln = (k === 2 ? 26 : 20) * s; tw_poly(ctx, [20 * s + Math.cos(an - 1.6) * 5 * s, bob + Math.sin(an - 1.6) * 5 * s - 12 * s, 20 * s + Math.cos(an) * ln, bob + Math.sin(an) * ln * 0.9, 20 * s + Math.cos(an + 1.6) * 5 * s, bob + Math.sin(an + 1.6) * 5 * s - 12 * s].map((v, i) => i % 2 ? v - 10 * s : v), '#C8FFF0'); }
    for (const sd of [-1, 1]){ tw_eye(ctx, 24 * s, bob + sd * 8 * s, 3.4 * s, '#FFE04A'); lkTRI(ctx, 32 * s, bob + sd * 4 * s, 44 * s + (glow ? 8 * s : 0), bob + sd * 1 * s, 32 * s, bob + sd * 1 * s, '#F4FFD0'); }
    lkOV(ctx, 33 * s, bob, 6 * s, 4 * s, '#1E3A0E'); if (glow) csGlow(ctx, 36 * s, bob, 14 * s, SG_LIME, 0.5);
  },
  sg_ram(ctx, e, b, dk, bob, wind, d){                                                 /* The Battering Ram: a tracked siege engine behind a log-shaped steel ram, banner plates down its flanks */
    const s = e.r / 66, a = e.anim * 1.2, st = e.state, charge = st === 'charge', wd = st === 'chargewind';
    for (const sd of [-1, 1]){ tw_rr(ctx, -50 * s, bob + sd * 36 * s - 9 * s, 96 * s, 18 * s, 6 * s, '#0E1016'); for (let k = 0; k < 14; k++){ const x = -48 * s + ((k * 7 * s + a * 6 * s * (charge ? 3 : 1)) % (92 * s)); tw_rect(ctx, x, bob + sd * 36 * s - 8 * s, 2.4 * s, 16 * s, '#3A3E48'); } }
    tw_rr(ctx, -46 * s, bob - 32 * s, 86 * s, 64 * s, 8 * s, '#0C0E14'); tw_rr(ctx, -44 * s, bob - 30 * s, 82 * s, 60 * s, 7 * s, b);
    for (let k = 0; k < 5; k++) tw_rect(ctx, (-40 + k * 16) * s, bob - 30 * s, 5 * s, 60 * s, tw_sh(b, 0.22)); tw_rect(ctx, -44 * s, bob - 30 * s, 82 * s, 6 * s, tw_li(b, 0.4));
    for (const sd of [-1, 1]){ tw_poly(ctx, [-30 * s, bob + sd * 30 * s, -2 * s, bob + sd * 30 * s, -8 * s, bob + sd * 20 * s, -26 * s, bob + sd * 20 * s], '#D8483A'); tw_poly(ctx, [-24 * s, bob + sd * 28 * s, -8 * s, bob + sd * 28 * s, -12 * s, bob + sd * 22 * s, -22 * s, bob + sd * 22 * s], '#F4EEE0'); }
    tw_rr(ctx, -34 * s, bob - 12 * s, 28 * s, 24 * s, 4 * s, '#14161C'); tw_eye(ctx, -18 * s, bob, 5 * s, wd || charge ? '#FFE04A' : SG_RED);
    const out = (wd ? -10 : charge ? 14 : 0) * s;                                                                          /* the ram: drawn back when winding up, out when it hits */
    tw_rr(ctx, 30 * s + out, bob - 12 * s, 48 * s, 24 * s, 9 * s, '#0C0E14'); tw_rr(ctx, 32 * s + out, bob - 10 * s, 44 * s, 20 * s, 8 * s, '#B8863A'); tw_rect(ctx, 32 * s + out, bob - 10 * s, 44 * s, 5 * s, tw_li('#B8863A', 0.4));
    for (const x of [40, 54, 66]) tw_rect(ctx, x * s + out, bob - 10 * s, 3 * s, 20 * s, '#6E4E1A'); tw_poly(ctx, [76 * s + out, bob - 10 * s, 88 * s + out, bob - 4 * s, 88 * s + out, bob + 4 * s, 76 * s + out, bob + 10 * s], '#C8CCD4'); tw_poly(ctx, [78 * s + out, bob - 7 * s, 86 * s + out, bob - 2 * s, 86 * s + out, bob + 2 * s, 78 * s + out, bob + 7 * s], '#F0F2F8');
    if (charge) for (let k = 1; k < 5; k++){ ctx.globalAlpha = 0.12; tw_rr(ctx, (-40 - k * 16) * s, bob - 26 * s, 60 * s, 52 * s, 8 * s, '#B8863A'); } ctx.globalAlpha = 1;
    if (wd) ringPath(ctx, 0, bob, 78 * s, 4, '#FFB84A', 0.5);
  },
  sg_carrier(ctx, e, b, dk, bob, wind, d){                                             /* The Hive Carrier: a flat airship of a drone with a rotor at each corner and a hangar bay under it that opens to let the little ones out */
    const s = e.r / 60, a = e.anim * 11, st = e.state, open = st === 'launch' || st === 'launchwind', bomb = st === 'bombwind';
    ctx.globalAlpha = 0.18; lkOV(ctx, 6 * s, bob + 22 * s, 60 * s, 36 * s, '#000000'); ctx.globalAlpha = 1;
    tw_poly(ctx, [-54 * s, bob - 26 * s, 22 * s, bob - 34 * s, 58 * s, bob - 12 * s, 58 * s, bob + 12 * s, 22 * s, bob + 34 * s, -54 * s, bob + 26 * s], '#0C0E14'); tw_poly(ctx, [-51 * s, bob - 23 * s, 22 * s, bob - 31 * s, 54 * s, bob - 11 * s, 54 * s, bob + 11 * s, 22 * s, bob + 31 * s, -51 * s, bob + 23 * s], b);
    tw_rect(ctx, -48 * s, bob - 3 * s, 100 * s, 6 * s, tw_li(b, 0.2)); for (let k = 0; k < 6; k++) tw_rect(ctx, (-40 + k * 15) * s, bob - 22 * s, 2 * s, 44 * s, tw_sh(b, 0.28));
    tw_rr(ctx, -34 * s, bob - 14 * s, 40 * s, 28 * s, 4 * s, '#06080E'); const dh = open ? 12 : 3; tw_rect(ctx, -32 * s, bob - dh * s, 36 * s, dh * 2 * s, open ? '#2A3A56' : '#10141C'); if (open) for (let k = 0; k < 3; k++) fillCircle(ctx, (-26 + k * 11) * s, bob, 3.2 * s, '#C8A04A');
    for (const [rx, ry] of [[-46, -34], [-46, 34], [34, -40], [34, 40]]){ tw_ln(ctx, [rx * 0.5 * s, bob + ry * 0.4 * s, rx * s, bob + ry * s], 4 * s, dk); fillCircle(ctx, rx * s, bob + ry * s, 7 * s, '#1C1E24'); ctx.save(); ctx.translate(rx * s, bob + ry * s); ctx.rotate(a); lkOV(ctx, 0, 0, 22 * s, 3 * s, 'rgba(220,226,236,.5)'); ctx.rotate(Math.PI / 2); lkOV(ctx, 0, 0, 22 * s, 3 * s, 'rgba(220,226,236,.32)'); ctx.restore(); }
    tw_rr(ctx, 40 * s, bob - 10 * s, 18 * s, 20 * s, 5 * s, '#10121A'); tw_eye(ctx, 50 * s, bob - 4 * s, 3 * s, SG_RED); tw_eye(ctx, 50 * s, bob + 4 * s, 3 * s, SG_RED);
    if (bomb) ringPath(ctx, 0, bob, 66 * s, 4, '#FF5A4A', 0.5);
  },
  sg_warden(ctx, e, b, dk, bob, wind, d){                                              /* The Warden: an upright war mech seen from above, broad shoulders with a cannon on each, a red core in its chest and a visor like a slot */
    const s = e.r / 64, a = e.anim * 1.3, st = e.state, ph = e.phase || 1, glow = e.glow || 0, core = 0.6 + 0.4 * Math.sin(e.anim * (2 + ph));
    csGlow(ctx, 0, bob, 96 * s, SG_RED, 0.08 + 0.16 * glow + 0.05 * core);
    for (const sd of [-1, 1]){ const w = Math.sin(a + (sd > 0 ? 0 : Math.PI)) * 8 * s; tw_rr(ctx, -34 * s + w, bob + sd * 20 * s - 7 * s, 30 * s, 14 * s, 4 * s, '#06080E'); tw_rr(ctx, -32 * s + w, bob + sd * 20 * s - 5.6 * s, 26 * s, 11 * s, 3 * s, tw_sh(b, 0.2)); }
    tw_rr(ctx, -30 * s, bob - 30 * s, 62 * s, 60 * s, 12 * s, '#06080E'); tw_rr(ctx, -28 * s, bob - 28 * s, 58 * s, 56 * s, 10 * s, b);
    tw_rect(ctx, -28 * s, bob - 28 * s, 58 * s, 7 * s, tw_li(b, 0.3)); for (let k = 0; k < 4; k++) tw_ln(ctx, [(-22 + k * 14) * s, bob - 20 * s, (-22 + k * 14) * s, bob + 20 * s], 1.2 * s, tw_sh(b, 0.35));
    fillCircle(ctx, -4 * s, bob, 12 * s, '#06080E'); fillCircle(ctx, -4 * s, bob, 10 * s, '#3A0E0A'); fillCircle(ctx, -4 * s, bob, (6 + 2 * core) * s, SG_RED); fillCircle(ctx, -6 * s, bob - 2 * s, 2.6 * s, '#FFE0D0'); ringPath(ctx, -4 * s, bob, 12 * s, 2 * s, '#FF8A6A', 0.4 + 0.3 * core);
    for (const sd of [-1, 1]){ const reach = (st === 'barragewind' || st === 'beamwind' ? 8 : 0) * s, ex = 24 * s + reach, ey = bob + sd * 36 * s; tw_rr(ctx, -16 * s, bob + sd * 30 * s - 7 * s, 34 * s, 14 * s, 5 * s, '#06080E'); tw_rr(ctx, -14 * s, bob + sd * 30 * s - 5.6 * s, 30 * s, 11 * s, 4 * s, tw_sh(b, 0.1)); tw_rr(ctx, 16 * s, ey - 5 * s, 34 * s + reach, 10 * s, 3 * s, '#10121A'); tw_rect(ctx, 46 * s + reach, ey - 3 * s, 12 * s, 6 * s, '#1E2030'); fillCircle(ctx, 58 * s + reach, ey, 3 * s, st === 'barragewind' || st === 'beamwind' ? '#FFB84A' : '#3A3E48'); }
    tw_rr(ctx, 22 * s, bob - 15 * s, 22 * s, 30 * s, 7 * s, '#06080E'); tw_rr(ctx, 24 * s, bob - 13 * s, 18 * s, 26 * s, 6 * s, tw_li(b, 0.08)); tw_rect(ctx, 30 * s, bob - 11 * s, 11 * s, 22 * s, '#10121A'); tw_rect(ctx, 33 * s, bob - 3 * s, 8 * s, 6 * s, '#FF2A1A'); csGlow(ctx, 38 * s, bob, 12 * s, SG_RED, 0.4);
    tw_poly(ctx, [-28 * s, bob - 28 * s, -22 * s, bob - 38 * s, -14 * s, bob - 28 * s], '#E8C84A'); tw_poly(ctx, [-28 * s, bob + 28 * s, -22 * s, bob + 38 * s, -14 * s, bob + 28 * s], '#E8C84A');
    if (glow > 0.2) ringPath(ctx, 0, bob, 70 * s, 4, SG_RED, 0.4 + 0.3 * glow);
    if (st === 'roar') ringPath(ctx, 0, bob, 84 * s, 5, '#FFD0C0', 0.5);
  }
};
Object.assign(ENEMY_LOOK_DRAW, SIEGE_DRAW);
