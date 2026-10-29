'use strict';
/* Enemy art, Chapter 16: Fort Shortneck (FORT_DRAW). */
/* Twelve ordinary kinds and five bosses, all new, drawn from above like every creature, facing +x: the fort's soldiers and machines in olive drab, steel and khaki, each with one hot
   accent (an amber lamp, a red lens, a green cross, an orange flame) so it can be told apart on the gravel. Like the Siege's, the ordinary ones read only def, type, r, anim and state of
   the creature, so the sprite cache (js/game/44t-enemy-sprites.js) can keep pictures of them. The helpers (tw_poly, tw_ln, tw_rr, tw_eye ...) are the Tower art's, in js/art/35j-art-tower.js. */
const FT_AMBER = '#FFB84A', FT_RED = '#FF5A4A', FT_GREEN = '#6AE08A', FT_STEEL = '#8A93A2', FT_DARKSTEEL = '#2A2E38', FT_FLAME = ['#FFE04A', '#FF8A3A', '#E8401A'];
/* a soldier seen from above, walking: boots, torso with a vest and pouches, a pack, two arms and a helmet. o: helm (colour), pack (colour), rifle (bool), flash (bool), arms (0 forward, 1 raised) */
function ft_man(ctx, e, b, dk, bob, s, a, o){
  for (const sd of [-1, 1]){ const w = Math.sin(a + (sd > 0 ? 0 : Math.PI)) * 3 * s; lkOV(ctx, w, bob + sd * 3.4 * s, 3.4 * s, 1.9 * s, '#1A1C14'); lkOV(ctx, w - 0.5 * s, bob + sd * 3.4 * s, 2.4 * s, 1.2 * s, '#3A3C2C'); }
  const pk = o.pack || tw_sh(b, 0.3);
  tw_rr(ctx, -9.6 * s, bob - 5.2 * s, 5.8 * s, 10.4 * s, 1.6 * s, dk); tw_rr(ctx, -9.2 * s, bob - 4.8 * s, 5 * s, 9.6 * s, 1.4 * s, pk);
  tw_rect(ctx, -9.2 * s, bob - 0.4 * s, 5 * s, 0.8 * s, tw_sh(pk, 0.4)); lkOV(ctx, -10.6 * s, bob, 1.2 * s, 4.6 * s, tw_li(pk, 0.18));                         /* the bedroll */
  lkOV(ctx, -1 * s, bob, 4.8 * s, 8.4 * s, dk); lkOV(ctx, -1 * s, bob, 4.2 * s, 7.6 * s, b);
  tw_rect(ctx, -2.4 * s, bob - 7.2 * s, 1.3 * s, 14.4 * s, tw_sh(b, 0.38)); tw_rect(ctx, 0.6 * s, bob - 6.6 * s, 1 * s, 13.2 * s, tw_sh(b, 0.28));         /* the vest straps */
  for (const py of [-5, -1.8, 1.8]){ tw_rr(ctx, 0.4 * s, bob + py * s, 2.4 * s, 3 * s, 0.6 * s, tw_sh(b, 0.45)); tw_rect(ctx, 0.5 * s, bob + py * s + 0.2 * s, 2.2 * s, 0.5 * s, tw_li(b, 0.18)); }
  const reach = o.arms ? 3 : 8.6;
  for (const sd of [-1, 1]){ tw_ln(ctx, [0, bob + sd * 7.4 * s, 3.4 * s, bob + sd * (o.arms ? 8.6 : 6) * s, reach * s, bob + sd * (o.arms ? 8 : 2.2) * s], 2.6 * s, dk); tw_ln(ctx, [0, bob + sd * 7.4 * s, 3.4 * s, bob + sd * (o.arms ? 8.6 : 6) * s, reach * s, bob + sd * (o.arms ? 8 : 2.2) * s], 1.8 * s, b); fillCircle(ctx, reach * s, bob + sd * (o.arms ? 8 : 2.2) * s, 1.3 * s, '#D8B898'); }
  if (o.rifle){
    tw_rect(ctx, 2 * s, bob - 1 * s, 13 * s, 2 * s, '#161820'); tw_rect(ctx, 2 * s, bob - 0.9 * s, 13 * s, 0.7 * s, '#3A3E4A'); tw_rect(ctx, 6 * s, bob + 0.8 * s, 2.2 * s, 3.4 * s, '#161820'); tw_rect(ctx, 1 * s, bob - 1.4 * s, 3 * s, 2.8 * s, '#4A3A28');
    tw_rect(ctx, 14.4 * s, bob - 0.6 * s, 2 * s, 1.2 * s, '#0A0A10'); tw_rect(ctx, 8 * s, bob - 1.8 * s, 3 * s, 0.9 * s, '#0A0A10');
    if (o.flash){ csGlow(ctx, 18 * s, bob, 7 * s, FT_AMBER, 0.6); tw_poly(ctx, [16.4 * s, bob, 21 * s, bob - 1.8 * s, 23 * s, bob, 21 * s, bob + 1.8 * s], '#FFF0A0'); }
  }
  fillCircle(ctx, 1.4 * s, bob, 4.4 * s, '#14160E'); fillCircle(ctx, 1.2 * s, bob, 3.9 * s, o.helm || tw_li(b, 0.08)); fillCircle(ctx, 0.2 * s, bob - 1.1 * s, 2 * s, tw_li(o.helm || b, 0.3));
  ctx.strokeStyle = tw_sh(o.helm || b, 0.5); ctx.lineWidth = 0.7 * s; ctx.beginPath(); ctx.moveTo(1.2 * s, bob - 3.7 * s); ctx.lineTo(1.2 * s, bob + 3.7 * s); ctx.stroke();
  tw_rect(ctx, 3.6 * s, bob - 2.2 * s, 1.1 * s, 4.4 * s, o.visor || '#9AD8F0');
}
const FORT_DRAW = {
  ft_guard(ctx, e, b, dk, bob, wind, d){                                               /* Base Guard: a rifleman in an olive helmet, firing short bursts */
    const s = e.r / 13; ft_man(ctx, e, b, dk, bob, s, e.anim * 2.4, { rifle: true, flash: e.state === 'burst', helm: tw_li(b, 0.05) });
  },
  ft_cadet(ctx, e, b, dk, bob, wind, d){                                               /* Cadet: a recruit with a helmet a size too big and both hands up, running scared */
    const s = e.r / 10, a = e.anim * 3.6;
    ft_man(ctx, e, b, dk, bob, s * 0.95, a, { arms: 1, helm: tw_li(b, 0.2), pack: '#8A8A6A', visor: '#E8E8D0' });
    tw_rr(ctx, 3.6 * s, bob - 5 * s, 3.4 * s, 10 * s, 1.2 * s, 'rgba(255,255,255,0)'); lkOV(ctx, 1.4 * s, bob - 3.8 * s, 1 * s, 0.7 * s, '#FFFFFF'); lkOV(ctx, 1.4 * s, bob + 3.8 * s, 1 * s, 0.7 * s, '#FFFFFF');
  },
  ft_hound(ctx, e, b, dk, bob, wind, d){                                               /* Guard Hound: a lean guard dog in a steel harness, spiked collar and a red sensor eye */
    const s = e.r / 12, a = e.anim * 3, lunge = e.state === 'lunge';
    for (let i = 0; i < 2; i++) for (const sd of [-1, 1]){ const w = Math.sin(a + i * Math.PI + (sd > 0 ? 0 : 1.7)) * 3.6 * s, x0 = (6 - i * 11) * s; tw_ln(ctx, [x0, bob + sd * 3.6 * s, x0 + 2 * s + w, bob + sd * 6.4 * s, x0 + w * 1.4, bob + sd * 8.6 * s], 2.2 * s, dk); fillCircle(ctx, x0 + w * 1.4, bob + sd * 8.6 * s, 1.3 * s, '#3A3E48'); }
    tw_ln(ctx, [-9 * s, bob, -14 * s, bob + Math.sin(a * 1.4) * 2.4 * s, -17 * s, bob + Math.sin(a * 1.4 + 1) * 3.4 * s], 2 * s, dk);
    lkOV(ctx, -3 * s, bob, 11 * s, 5.6 * s, dk); lkOV(ctx, -3 * s, bob, 10 * s, 4.8 * s, b); lkOV(ctx, -4 * s, bob - 1.6 * s, 6.6 * s, 1.8 * s, tw_li(b, 0.3));
    for (let k = 0; k < 4; k++){ tw_rect(ctx, (-8 + k * 3.6) * s, bob - 4.6 * s, 1.2 * s, 9.2 * s, FT_DARKSTEEL); fillCircle(ctx, (-7.4 + k * 3.6) * s, bob - 3.4 * s, 0.5 * s, '#C8CCD4'); fillCircle(ctx, (-7.4 + k * 3.6) * s, bob + 3.4 * s, 0.5 * s, '#C8CCD4'); }
    tw_rr(ctx, -4 * s, bob - 3 * s, 5 * s, 6 * s, 1 * s, '#4A4E5A'); fillCircle(ctx, -1.6 * s, bob, 1 * s, lunge ? '#FFE04A' : FT_RED);
    lkOV(ctx, 8 * s, bob, 5 * s, 4 * s, dk); lkOV(ctx, 8 * s, bob, 4.4 * s, 3.4 * s, tw_li(b, 0.2)); lkOV(ctx, 12.6 * s, bob, 3.6 * s, 2.4 * s, tw_li(b, 0.38)); fillCircle(ctx, 15 * s, bob, 1 * s, '#10141C');
    for (let k = 0; k < 6; k++){ const an = k * 1.05 + 0.2; tw_poly(ctx, [5.6 * s + Math.cos(an) * 4.2 * s, bob + Math.sin(an) * 4.2 * s, 5.6 * s + Math.cos(an) * 6.2 * s, bob + Math.sin(an) * 6.2 * s, 5.6 * s + Math.cos(an + 0.5) * 4.2 * s, bob + Math.sin(an + 0.5) * 4.2 * s], '#C8CCD4'); }
    for (const sd of [-1, 1]){ tw_poly(ctx, [6 * s, bob + sd * 3.4 * s, 4 * s, bob + sd * 6.6 * s, 8 * s, bob + sd * 4.2 * s], dk); fillCircle(ctx, 10.4 * s, bob + sd * 1.8 * s, 0.9 * s, '#FFE04A'); }
    if (lunge) for (const sd of [-1, 1]) tw_poly(ctx, [14 * s, bob + sd * 0.4 * s, 17 * s, bob + sd * 1.4 * s, 14.4 * s, bob + sd * 1.8 * s], '#F4F0E0');
  },
  ft_jeep(ctx, e, b, dk, bob, wind, d){                                                /* Scout Jeep: an open jeep with a roll bar, a star on the hood, and a gun on a post behind the seats */
    const s = e.r / 14, a = e.anim * 3, run = e.state === 'wind' || e.state === 'roll';
    ctx.globalAlpha = 0.2; lkOV(ctx, 1 * s, bob + 3 * s, 15 * s, 9 * s, '#000000'); ctx.globalAlpha = 1;
    for (const [wx, wy] of [[-9, -9], [-9, 9], [9, -9], [9, 9]]){ tw_rr(ctx, (wx - 3.4) * s, bob + wy * s - 2 * s, 6.8 * s, 4 * s, 1.4 * s, '#14161C'); for (let k = 0; k < 3; k++) tw_rect(ctx, (wx - 3 + ((k * 2.4 + a * 2) % 6)) * s, bob + wy * s - 1.8 * s, 0.7 * s, 3.6 * s, '#3A3C44'); }
    tw_rr(ctx, -13 * s, bob - 8 * s, 27 * s, 16 * s, 3 * s, dk); tw_rr(ctx, -12 * s, bob - 7 * s, 25 * s, 14 * s, 2.6 * s, b);
    tw_rect(ctx, -12 * s, bob - 7 * s, 25 * s, 2 * s, tw_li(b, 0.3)); tw_rr(ctx, 3 * s, bob - 6 * s, 9 * s, 12 * s, 2 * s, tw_sh(b, 0.18));                  /* the hood and its panel line */
    for (let k = 0; k < 4; k++) tw_rect(ctx, (4 + k * 2) * s, bob - 5 * s, 0.7 * s, 10 * s, tw_sh(b, 0.35));
    tw_poly(ctx, [7 * s, bob - 2.4 * s, 8.4 * s, bob - 0.5 * s, 10.4 * s, bob, 8.4 * s, bob + 0.5 * s, 7 * s, bob + 2.4 * s, 7.4 * s, bob], '#F2EEDC');
    tw_rr(ctx, -9 * s, bob - 5.6 * s, 7 * s, 4 * s, 1.2 * s, '#3A3A2E'); tw_rr(ctx, -9 * s, bob + 1.6 * s, 7 * s, 4 * s, 1.2 * s, '#3A3A2E');                 /* the seats */
    tw_ln(ctx, [-2 * s, bob - 6.6 * s, -2 * s, bob + 6.6 * s], 1.4 * s, '#C8CCD4'); tw_ln(ctx, [-12 * s, bob, -6 * s, bob], 1.6 * s, '#1E2228'); tw_rect(ctx, -12 * s, bob - 1.6 * s, 4 * s, 3.2 * s, '#4A4E5A');
    tw_rect(ctx, -6.6 * s, bob - 0.8 * s, 9 * s, 1.6 * s, '#10121A'); fillCircle(ctx, -7 * s, bob, 1.6 * s, '#30343E');
    for (const sd of [-1, 1]){ fillCircle(ctx, 12.6 * s, bob + sd * 5 * s, 1.5 * s, '#FFF2B0'); csGlow(ctx, 15 * s, bob + sd * 5 * s, 7 * s, FT_AMBER, run ? 0.5 : 0.28); }
    if (run) for (let k = 1; k < 4; k++){ ctx.globalAlpha = 0.12; tw_rr(ctx, (-14 - k * 8) * s, bob - 7 * s, 24 * s, 14 * s, 2.6 * s, '#C8B88A'); } ctx.globalAlpha = 1;
  },
  ft_riot(ctx, e, b, dk, bob, wind, d){                                                /* Riot Trooper: a heavy in plates behind a great clear shield studded with bolts */
    const s = e.r / 16, a = e.anim * 1.8, bash = e.state === 'bash' || e.state === 'bashwind', out = bash ? 4 * s : 0;
    ft_man(ctx, e, b, dk, bob, s * 1.1, a, { helm: tw_sh(b, 0.1), visor: '#10141C', pack: '#2A2E38', arms: 0 });
    for (const sd of [-1, 1]) tw_rr(ctx, -3 * s, bob + sd * 8.8 * s - 2.6 * s, 6 * s, 5.2 * s, 2 * s, tw_li(b, 0.16));                                   /* the pauldrons */
    tw_rr(ctx, 7 * s + out, bob - 12 * s, 6 * s, 24 * s, 3 * s, '#0C0E14'); tw_rr(ctx, 7.8 * s + out, bob - 11 * s, 4.4 * s, 22 * s, 2.4 * s, 'rgba(150,200,230,.55)');
    tw_rect(ctx, 8.4 * s + out, bob - 10 * s, 1 * s, 20 * s, 'rgba(255,255,255,.35)'); for (const py of [-10, -4, 4, 10]) fillCircle(ctx, 9.8 * s + out, bob + py * s, 0.9 * s, '#C8CCD4');
    tw_rect(ctx, 7.6 * s + out, bob - 12.4 * s, 5 * s, 1.6 * s, FT_AMBER); tw_rect(ctx, 7.6 * s + out, bob + 10.8 * s, 5 * s, 1.6 * s, FT_AMBER);
    if (bash) ringPath(ctx, 9 * s, bob, 13 * s, 3, FT_AMBER, 0.5);
  },
  ft_copter(ctx, e, b, dk, bob, wind, d){                                              /* Mini Copter: a one-seat scout helicopter, rotor a blur, searchlight under the nose */
    const s = e.r / 12, a = e.anim * 12, bomb = e.state === 'drop' || e.state === 'dropwind';
    ctx.globalAlpha = 0.16; lkOV(ctx, 3 * s, bob + 14 * s, 11 * s, 5 * s, '#000000'); ctx.globalAlpha = 1;
    tw_ln(ctx, [-6 * s, bob, -17 * s, bob], 2.6 * s, dk); tw_ln(ctx, [-6 * s, bob, -17 * s, bob], 1.6 * s, b); tw_poly(ctx, [-17 * s, bob - 0.8 * s, -20 * s, bob - 4.6 * s, -18 * s, bob - 4.6 * s, -15 * s, bob], tw_sh(b, 0.2));
    ctx.save(); ctx.translate(-18.4 * s, bob - 3 * s); ctx.rotate(a * 1.6); lkOV(ctx, 0, 0, 0.8 * s, 4.6 * s, 'rgba(220,226,236,.55)'); ctx.restore();
    for (const sd of [-1, 1]){ tw_ln(ctx, [-4 * s, bob + sd * 5 * s, 6 * s, bob + sd * 5 * s], 1.4 * s, '#14161C'); tw_ln(ctx, [-1 * s, bob + sd * 2.4 * s, -1 * s, bob + sd * 5 * s], 1 * s, '#14161C'); tw_rect(ctx, 3 * s, bob + sd * 5.4 * s - 1.2 * s, 4.6 * s, 2.4 * s, bomb ? '#FFB84A' : '#3A3E48'); }
    lkOV(ctx, 0, bob, 9.4 * s, 6 * s, dk); lkOV(ctx, 0, bob, 8.6 * s, 5.2 * s, b); lkOV(ctx, -1 * s, bob - 1.4 * s, 5.4 * s, 2 * s, tw_li(b, 0.3));
    lkOV(ctx, 4 * s, bob, 4.6 * s, 3.6 * s, 'rgba(150,210,240,.8)'); lkOV(ctx, 3 * s, bob - 1 * s, 2 * s, 1.2 * s, 'rgba(255,255,255,.55)'); lkOV(ctx, -3.6 * s, bob, 2.2 * s, 1.6 * s, '#10141C');
    fillCircle(ctx, 8 * s, bob, 1.5 * s, '#FFF2B0'); csGlow(ctx, 10 * s, bob, 6 * s, FT_AMBER, 0.34);
    ctx.save(); ctx.translate(0, bob); ctx.rotate(a); lkOV(ctx, 0, 0, 17 * s, 1.1 * s, 'rgba(228,232,240,.5)'); ctx.rotate(Math.PI / 2); lkOV(ctx, 0, 0, 17 * s, 1.1 * s, 'rgba(228,232,240,.4)'); ctx.restore();
    fillCircle(ctx, 0, bob, 1.8 * s, '#10141C'); fillCircle(ctx, 0, bob, 1 * s, '#C8CCD4');
  },
  ft_apc(ctx, e, b, dk, bob, wind, d){                                                 /* APC: a six-wheeled troop carrier with a gun turret and a rear door, slab-sided and bolted */
    const s = e.r / 17, a = e.anim * 1.8, st = e.state, ram = st === 'ram' || st === 'ramwind';
    ctx.globalAlpha = 0.2; lkOV(ctx, 1 * s, bob + 4 * s, 22 * s, 12 * s, '#000000'); ctx.globalAlpha = 1;
    for (const sd of [-1, 1]) for (let k = 0; k < 3; k++){ const wx = (-12 + k * 12) * s; tw_rr(ctx, wx - 4.6 * s, bob + sd * 12 * s - 2.6 * s, 9.2 * s, 5.2 * s, 2 * s, '#14161C'); for (let q = 0; q < 4; q++) tw_rect(ctx, wx - 4 * s + ((q * 2.4 * s + a * 2 * s) % (8 * s)), bob + sd * 12 * s - 2.2 * s, 0.8 * s, 4.4 * s, '#3A3C44'); }
    tw_rr(ctx, -19 * s, bob - 11 * s, 38 * s, 22 * s, 4 * s, dk); tw_rr(ctx, -18 * s, bob - 10 * s, 36 * s, 20 * s, 3.4 * s, b);
    tw_poly(ctx, [10 * s, bob - 10 * s, 18 * s, bob - 7 * s, 18 * s, bob + 7 * s, 10 * s, bob + 10 * s], tw_li(b, 0.14)); tw_rect(ctx, -18 * s, bob - 10 * s, 36 * s, 2.4 * s, tw_li(b, 0.34));
    for (const x of [-12, -4, 4]) tw_rect(ctx, x * s, bob - 10 * s, 0.8 * s, 20 * s, tw_sh(b, 0.32));
    for (const [x, y] of [[-17, -9], [-17, 9], [17, -9], [17, 9], [0, -9.4], [0, 9.4]]) fillCircle(ctx, x * s, bob + y * s, 0.8 * s, '#2A2C22');
    tw_rr(ctx, -17 * s, bob - 5 * s, 6 * s, 10 * s, 1.4 * s, tw_sh(b, 0.28)); tw_ln(ctx, [-17 * s, bob, -11 * s, bob], 0.8 * s, '#10121A');
    tw_rect(ctx, 12 * s, bob - 5 * s, 5 * s, 3 * s, '#10141C'); tw_rect(ctx, 12 * s, bob + 2 * s, 5 * s, 3 * s, '#10141C'); tw_rect(ctx, 12.6 * s, bob - 4.4 * s, 4 * s, 0.8 * s, 'rgba(150,210,240,.6)');
    fillCircle(ctx, -3 * s, bob, 7.4 * s, '#14160E'); fillCircle(ctx, -3 * s, bob, 6.6 * s, tw_li(b, 0.08)); fillCircle(ctx, -4.4 * s, bob - 1.6 * s, 3.2 * s, tw_li(b, 0.3)); fillCircle(ctx, -6 * s, bob + 2.4 * s, 1.5 * s, '#2A2C22');
    tw_rect(ctx, 2 * s, bob - 1.2 * s, 12 * s, 2.4 * s, '#10121A'); tw_rect(ctx, 12 * s, bob - 1.8 * s, 3.2 * s, 3.6 * s, '#1E2030'); tw_ln(ctx, [-9 * s, bob - 5 * s, -14 * s, bob - 9 * s], 0.9 * s, '#C8CCD4');
    for (const sd of [-1, 1]) fillCircle(ctx, 16.6 * s, bob + sd * 8 * s, 1.2 * s, '#FFF2B0');
    if (ram) ringPath(ctx, 0, bob, 24 * s, 3, FT_AMBER, 0.5);
  },
  ft_mortar(ctx, e, b, dk, bob, wind, d){                                              /* Mortar Crew: two soldiers behind a squat tube on a base plate, shells stacked in a crate */
    const s = e.r / 14, a = e.anim * 1.6, up = e.state === 'lobwind';
    tw_rr(ctx, 4 * s, bob - 7 * s, 9 * s, 14 * s, 1.6 * s, '#14160E'); tw_rr(ctx, 4.6 * s, bob - 6.4 * s, 7.8 * s, 12.8 * s, 1.3 * s, '#7A6A3A');
    for (let k = 0; k < 3; k++) for (let q = 0; q < 2; q++){ fillCircle(ctx, (6.4 + q * 3.4) * s, bob + (-4 + k * 4) * s, 1.3 * s, '#C8A04A'); fillCircle(ctx, (6.4 + q * 3.4) * s, bob + (-4 + k * 4) * s, 0.6 * s, '#5A4A22'); }
    ft_man(ctx, e, b, dk, bob - 7.6 * s, s * 0.9, a, { pack: '#5A5A3A', arms: 0 }); ft_man(ctx, e, b, dk, bob + 7.6 * s, s * 0.9, a + 2, { pack: '#5A5A3A', arms: 0 });
    fillCircle(ctx, -4 * s, bob, 6 * s, '#10121A'); fillCircle(ctx, -4 * s, bob, 5.2 * s, '#5A5E6A');
    tw_ln(ctx, [-4 * s, bob, (up ? 8 : 5) * s, bob], 5 * s, '#10121A'); tw_ln(ctx, [-4 * s, bob, (up ? 8 : 5) * s, bob], 3.6 * s, FT_STEEL); fillCircle(ctx, (up ? 8 : 5) * s, bob, 2.4 * s, '#06080E');
    for (const sd of [-1, 1]) tw_ln(ctx, [-3 * s, bob + sd * 2 * s, 1 * s, bob + sd * 6.6 * s], 1.2 * s, '#2A2E38');
    if (up) csGlow(ctx, 8 * s, bob, 8 * s, FT_AMBER, 0.5);
  },
  ft_grenadier(ctx, e, b, dk, bob, wind, d){                                           /* Grenadier: a soldier with a bandolier of grenades, one arm cocked back to throw */
    const s = e.r / 12, a = e.anim * 2.4, wnd = e.state === 'lobwind';
    ft_man(ctx, e, b, dk, bob, s, a, { helm: tw_sh(b, 0.1), pack: '#4A3A24', arms: 0 });
    ctx.save(); ctx.translate(0, bob); ctx.rotate(0.4); for (let k = 0; k < 5; k++){ fillCircle(ctx, (-5 + k * 2.6) * s, -4 * s + k * 1.8 * s, 1.5 * s, '#14160E'); fillCircle(ctx, (-5 + k * 2.6) * s, -4 * s + k * 1.8 * s, 1.1 * s, '#4A5A2A'); } ctx.restore();
    tw_ln(ctx, [0, bob + 7 * s, -4 * s, bob + 9 * s, (wnd ? -8 : 6) * s, bob + (wnd ? 12 : 3) * s], 2.6 * s, dk); tw_ln(ctx, [0, bob + 7 * s, -4 * s, bob + 9 * s, (wnd ? -8 : 6) * s, bob + (wnd ? 12 : 3) * s], 1.8 * s, b);
    fillCircle(ctx, (wnd ? -8 : 7) * s, bob + (wnd ? 12 : 3) * s, 2 * s, '#14160E'); fillCircle(ctx, (wnd ? -8 : 7) * s, bob + (wnd ? 12 : 3) * s, 1.5 * s, '#5A6A2A'); fillCircle(ctx, (wnd ? -8 : 7) * s, bob + (wnd ? 11 : 2) * s, 0.5 * s, FT_RED);
  },
  ft_sniper(ctx, e, b, dk, bob, wind, d){                                              /* Sniper: a figure under a leafy cloak with a long rifle, the scope catching the light */
    const s = e.r / 13, aim = e.state === 'aim';
    lkOV(ctx, -3 * s, bob, 9 * s, 7.6 * s, dk); lkOV(ctx, -3 * s, bob, 8.2 * s, 6.8 * s, b);
    for (let k = 0; k < 16; k++){ const an = k * 0.4, r0 = (3 + (k % 4)) * s; const lx = -3 * s + Math.cos(an) * r0, ly = bob + Math.sin(an) * r0 * 0.9; tw_poly(ctx, [lx, ly - 1.3 * s, lx + 2.3 * s, ly, lx, ly + 1.3 * s, lx - 2.3 * s, ly], k % 3 === 0 ? tw_li(b, 0.2) : k % 3 === 1 ? tw_sh(b, 0.25) : '#6A7A3A'); }
    tw_rect(ctx, -2 * s, bob - 0.8 * s, 20 * s, 1.6 * s, '#10121A'); tw_rect(ctx, -2 * s, bob - 0.6 * s, 20 * s, 0.5 * s, '#3A3E4A'); tw_rect(ctx, 5 * s, bob - 2.4 * s, 5 * s, 1.5 * s, '#10121A'); fillCircle(ctx, 5.4 * s, bob - 1.6 * s, 1 * s, aim ? '#FFFFFF' : '#9AD8F0');
    tw_rect(ctx, 16 * s, bob - 1.4 * s, 4 * s, 2.8 * s, '#0A0C10'); for (const sd of [-1, 1]) tw_ln(ctx, [11 * s, bob + sd * 0.8 * s, 14 * s, bob + sd * 4 * s], 0.9 * s, '#2A2E38');
    fillCircle(ctx, 2.4 * s, bob, 3.6 * s, '#14160E'); fillCircle(ctx, 2.2 * s, bob, 3.1 * s, tw_li(b, 0.14)); tw_rect(ctx, 4 * s, bob - 1.8 * s, 1 * s, 3.6 * s, '#9AD8F0');
    if (aim){ ctx.globalAlpha = 0.3; tw_rect(ctx, 20 * s, bob - 0.4 * s, 90 * s, 0.8 * s, FT_RED); ctx.globalAlpha = 1; csGlow(ctx, 20 * s, bob, 6 * s, FT_RED, 0.5); }
  },
  ft_pyro(ctx, e, b, dk, bob, wind, d){                                                /* Pyro Trooper: a soldier in an orange suit with a fuel tank on the back and a nozzle that spits fire */
    const s = e.r / 13, fire = e.state === 'burn', wnd = e.state === 'burnwind';
    for (const sd of [-1, 1]){ lkOV(ctx, -11 * s, bob + sd * 2.6 * s, 3.2 * s, 2.4 * s, '#14160E'); lkOV(ctx, -11 * s, bob + sd * 2.6 * s, 2.7 * s, 2 * s, '#C84A2A'); lkOV(ctx, -11.8 * s, bob + sd * 2.2 * s, 1 * s, 0.8 * s, '#FFB090'); }
    tw_rect(ctx, -12 * s, bob - 1.2 * s, 5 * s, 2.4 * s, '#2A2E38');
    ft_man(ctx, e, b, dk, bob, s, e.anim * 1.8, { helm: tw_sh(b, 0.15), visor: '#10141C', pack: '#2A2E38', arms: 0 });
    tw_rr(ctx, 6 * s, bob - 2 * s, 9 * s, 4 * s, 1.2 * s, '#14161C'); tw_rect(ctx, 14 * s, bob - 1 * s, 3 * s, 2 * s, '#4A4E5A'); fillCircle(ctx, 17.6 * s, bob, 1.2 * s, wnd || fire ? '#FFE04A' : '#FF8A3A');
    if (fire || wnd){ const fl = fire ? 1 : 0.4; for (let k = 0; k < 3; k++){ const w2 = Math.sin(e.anim * 14 + k * 2) * 1.4 * s; ctx.globalAlpha = 0.85; lkOV(ctx, (20 + k * 3.6 * fl) * s, bob + w2, (3.2 + fl * 3 - k * 0.7) * s, (2.2 + fl * 1.4 - k * 0.5) * s, FT_FLAME[k]); } ctx.globalAlpha = 1; csGlow(ctx, 22 * s, bob, 10 * s * (0.6 + fl), FT_AMBER, 0.28); }
  },
  ft_medic(ctx, e, b, dk, bob, wind, d){                                               /* Field Medic: a soldier in white with a red cross on the back and a green heal-beacon pack */
    const s = e.r / 13, heal = e.state === 'heal', pulse = 0.5 + 0.5 * Math.sin(e.anim * 4);
    if (heal) ringPath(ctx, 0, bob, 24 * s, 3, FT_GREEN, 0.4 + 0.3 * pulse);
    ft_man(ctx, e, b, dk, bob, s, e.anim * 2, { helm: '#F4F6FA', visor: '#6AE08A', pack: '#E8ECF2', arms: 0 });
    tw_rect(ctx, -8.4 * s, bob - 1.2 * s, 4 * s, 2.4 * s, '#E0413A'); tw_rect(ctx, -7.6 * s, bob - 2 * s, 2.4 * s, 4 * s, '#E0413A');
    fillCircle(ctx, 1.4 * s, bob, 1.4 * s, '#E0413A'); tw_rect(ctx, 0.8 * s, bob - 0.3 * s, 1.2 * s, 0.6 * s, '#FFFFFF'); tw_rect(ctx, 1.1 * s, bob - 0.7 * s, 0.6 * s, 1.4 * s, '#FFFFFF');
    tw_rr(ctx, 4 * s, bob + 3 * s, 4.4 * s, 3.6 * s, 0.9 * s, '#E8ECF2'); tw_rect(ctx, 5.6 * s, bob + 3.6 * s, 1.2 * s, 2.4 * s, FT_GREEN); tw_rect(ctx, 5 * s, bob + 4.2 * s, 2.4 * s, 1.2 * s, FT_GREEN);
    csGlow(ctx, -6 * s, bob, 9 * s, FT_GREEN, 0.14 + 0.12 * pulse);
  },
  ft_sergeant(ctx, e, b, dk, bob, wind, d){                                            /* Sergeant Ironside: a hulking trooper in plate, a rotary gun on one arm, a riot plate on the other, a chest full of ribbons */
    const s = e.r / 58, a = e.anim * 1.2, st = e.state, ph = e.phase || 1, spin = st === 'spinwind' || st === 'spin', glow = e.glow || 0;
    csGlow(ctx, 0, bob, 90 * s, FT_AMBER, 0.05 + 0.12 * glow);
    for (const sd of [-1, 1]){ const w = Math.sin(a + (sd > 0 ? 0 : Math.PI)) * 9 * s; lkOV(ctx, w, bob + sd * 17 * s, 16 * s, 8 * s, '#0A0C08'); lkOV(ctx, w - 1 * s, bob + sd * 17 * s, 13 * s, 6 * s, '#3A3C2C'); for (let k = 0; k < 3; k++) tw_rect(ctx, w - 8 * s + k * 6 * s, bob + sd * 17 * s - 5 * s, 1.6 * s, 10 * s, '#14160E'); }
    tw_rr(ctx, -30 * s, bob - 8 * s, 14 * s, 16 * s, 3 * s, '#0A0C08'); tw_rr(ctx, -28 * s, bob - 6.4 * s, 10 * s, 12.8 * s, 2.4 * s, '#4A3A24');                    /* the ammo pack */
    for (let k = 0; k < 4; k++) tw_rect(ctx, (-27 + k * 2.6) * s, bob - 6 * s, 1 * s, 12 * s, '#C8A04A');
    lkOV(ctx, -4 * s, bob, 28 * s, 34 * s, '#0A0C08'); lkOV(ctx, -4 * s, bob, 26 * s, 32 * s, b);
    for (const [x, y, w, h] of [[-18, -24, 26, 14], [-16, 10, 26, 14], [4, -12, 16, 24]]) { tw_rr(ctx, x * s, bob + y * s, w * s, h * s, 3 * s, tw_li(b, 0.1 + ((x + y) % 3) * 0.06)); for (const [px, py] of [[2, 2], [w - 2, 2], [2, h - 2], [w - 2, h - 2]]) fillCircle(ctx, (x + px) * s, bob + (y + py) * s, 1 * s, '#2A2C1E'); }
    tw_rect(ctx, -26 * s, bob - 1.4 * s, 44 * s, 2.8 * s, 'rgba(255,208,70,.5)');
    for (let k = 0; k < 5; k++){ tw_rect(ctx, (4 + k * 3) * s, bob - 18 * s, 2.2 * s, 5 * s, ['#C8402A', '#E8C84A', '#2A6AC8', '#E8C84A', '#C8402A'][k]); }
    fillCircle(ctx, 12 * s, bob + 4 * s, 3 * s, '#C8CCD4'); fillCircle(ctx, 12 * s, bob + 4 * s, 2 * s, '#8A93A2');
    tw_rr(ctx, 6 * s, bob - 54 * s, 22 * s, 36 * s, 6 * s, '#0A0C08'); tw_rr(ctx, 7.6 * s, bob - 52 * s, 18.8 * s, 32 * s, 5 * s, 'rgba(150,200,230,.5)'); for (const py of [-48, -34, -24]) fillCircle(ctx, 22 * s, bob + py * s, 1.4 * s, '#C8CCD4');   /* the riot plate */
    const gx = 4 * s; tw_rr(ctx, gx, bob + 18 * s, 30 * s, 14 * s, 4 * s, '#0A0C08'); tw_rr(ctx, gx + 2 * s, bob + 19.6 * s, 26 * s, 10.8 * s, 3 * s, tw_sh(b, 0.2));
    for (let k = 0; k < 6; k++){ const an = e.anim * (spin ? 9 : 1) + k * Math.PI / 3, oy = Math.sin(an) * 5 * s; tw_rect(ctx, gx + 28 * s, bob + 25 * s + oy - 1.1 * s, 26 * s, 2.2 * s, spin ? '#C8CCD4' : '#8A93A2'); }
    fillCircle(ctx, gx + 54 * s, bob + 25 * s, 6.4 * s, '#0A0C08'); fillCircle(ctx, gx + 54 * s, bob + 25 * s, 4.6 * s, spin ? '#FF8A3A' : '#2A2E38'); if (spin) csGlow(ctx, gx + 56 * s, bob + 25 * s, 16 * s, FT_AMBER, 0.55);
    tw_ln(ctx, [-4 * s, bob + 14 * s, 4 * s, bob + 22 * s, 8 * s, bob + 26 * s], 11 * s, '#0A0C08'); tw_ln(ctx, [-4 * s, bob + 14 * s, 4 * s, bob + 22 * s, 8 * s, bob + 26 * s], 8 * s, b);
    fillCircle(ctx, 18 * s, bob, 17 * s, '#0A0C08'); fillCircle(ctx, 18 * s, bob, 15 * s, tw_li(b, 0.06)); fillCircle(ctx, 14 * s, bob - 5 * s, 8 * s, tw_li(b, 0.3));
    ctx.strokeStyle = tw_sh(b, 0.45); ctx.lineWidth = 1.4 * s; ctx.beginPath(); ctx.moveTo(18 * s, bob - 15 * s); ctx.lineTo(18 * s, bob + 15 * s); ctx.moveTo(8 * s, bob - 11 * s); ctx.lineTo(28 * s, bob - 8 * s); ctx.moveTo(8 * s, bob + 11 * s); ctx.lineTo(28 * s, bob + 8 * s); ctx.stroke();
    tw_rr(ctx, 26 * s, bob - 9 * s, 8 * s, 18 * s, 3 * s, '#06080C'); tw_rect(ctx, 28 * s, bob - 6 * s, 5 * s, 12 * s, ph > 1 ? '#FF5A4A' : '#9AD8F0'); csGlow(ctx, 32 * s, bob, 10 * s, ph > 1 ? FT_RED : '#9AD8F0', 0.3);
    if (st === 'slamwind') ringPath(ctx, 0, bob, 72 * s, 4, FT_AMBER, 0.5);
    if (st === 'roar') ringPath(ctx, 0, bob, 84 * s, 5, '#FFD890', 0.5);
  },
  ft_gunship(ctx, e, b, dk, bob, wind, d){                                             /* The Gunship: an attack helicopter seen from above, rocket pods on stub wings, a chin gun and a rotor that fills the sky */
    const s = e.r / 62, a = e.anim * 14, st = e.state, glow = e.glow || 0, pod = st === 'rocketwind' || st === 'rockets';
    ctx.globalAlpha = 0.16; lkOV(ctx, 8 * s, bob + 34 * s, 54 * s, 18 * s, '#000000'); ctx.globalAlpha = 1;
    csGlow(ctx, 0, bob, 90 * s, FT_AMBER, 0.04 + 0.1 * glow);
    tw_poly(ctx, [-26 * s, bob - 5 * s, -78 * s, bob - 3 * s, -78 * s, bob + 3 * s, -26 * s, bob + 5 * s], '#0C1018'); tw_poly(ctx, [-28 * s, bob - 3.6 * s, -74 * s, bob - 2 * s, -74 * s, bob + 2 * s, -28 * s, bob + 3.6 * s], b);
    tw_poly(ctx, [-70 * s, bob - 2 * s, -82 * s, bob - 18 * s, -76 * s, bob - 18 * s, -64 * s, bob], tw_sh(b, 0.2)); tw_poly(ctx, [-70 * s, bob + 2 * s, -82 * s, bob + 18 * s, -76 * s, bob + 18 * s, -64 * s, bob], tw_sh(b, 0.2));
    ctx.save(); ctx.translate(-80 * s, bob - 16 * s); ctx.rotate(a * 1.8); lkOV(ctx, 0, 0, 1.4 * s, 12 * s, 'rgba(220,226,236,.55)'); ctx.rotate(Math.PI / 2); lkOV(ctx, 0, 0, 1.4 * s, 12 * s, 'rgba(220,226,236,.4)'); ctx.restore();
    for (const sd of [-1, 1]){ tw_poly(ctx, [-14 * s, bob + sd * 8 * s, 8 * s, bob + sd * 8 * s, 6 * s, bob + sd * 40 * s, -10 * s, bob + sd * 40 * s], '#0C1018'); tw_poly(ctx, [-12 * s, bob + sd * 10 * s, 6 * s, bob + sd * 10 * s, 4.6 * s, bob + sd * 38 * s, -8.6 * s, bob + sd * 38 * s], tw_sh(b, 0.15));
      tw_rr(ctx, -4 * s, bob + sd * 40 * s - 7 * s, 30 * s, 14 * s, 4 * s, '#0C1018'); tw_rr(ctx, -2 * s, bob + sd * 40 * s - 5.4 * s, 26 * s, 10.8 * s, 3 * s, FT_DARKSTEEL);
      for (let k = 0; k < 7; k++) fillCircle(ctx, (3 + (k % 4) * 5) * s, bob + sd * 40 * s + (k < 4 ? -2.4 : 2.4) * s, 1.5 * s, pod ? '#FFB84A' : '#14161C');
      tw_ln(ctx, [-6 * s, bob + sd * 16 * s, -6 * s, bob + sd * 40 * s], 1.6 * s, '#C8CCD4'); }
    lkOV(ctx, -8 * s, bob, 40 * s, 18 * s, '#0C1018'); lkOV(ctx, -8 * s, bob, 38 * s, 16 * s, b);
    lkOV(ctx, -14 * s, bob - 4 * s, 26 * s, 5 * s, tw_li(b, 0.28)); for (let k = 0; k < 6; k++) tw_rect(ctx, (-34 + k * 8) * s, bob - 14 * s, 1 * s, 28 * s, tw_sh(b, 0.28));
    for (const [x, y] of [[-26, -9], [-26, 9], [-4, -11], [-4, 11], [14, -8], [14, 8]]) fillCircle(ctx, x * s, bob + y * s, 1.2 * s, '#14181E');
    lkOV(ctx, 24 * s, bob, 18 * s, 11 * s, '#0C1018'); lkOV(ctx, 24 * s, bob, 16.4 * s, 9.6 * s, 'rgba(120,190,230,.85)'); lkOV(ctx, 20 * s, bob - 3 * s, 8 * s, 3 * s, 'rgba(255,255,255,.4)'); lkOV(ctx, 26 * s, bob + 1 * s, 6 * s, 4 * s, '#10181E');
    tw_rr(ctx, 36 * s, bob - 3 * s, 20 * s, 6 * s, 2 * s, '#0C1018'); tw_rect(ctx, 52 * s, bob - 1.2 * s, 14 * s, 2.4 * s, '#2A2E38'); fillCircle(ctx, 66 * s, bob, 1.6 * s, st === 'strafe' ? '#FFE04A' : '#3A3E48'); if (st === 'strafe') csGlow(ctx, 68 * s, bob, 12 * s, FT_AMBER, 0.6);
    fillCircle(ctx, 38 * s, bob + 9 * s, 3 * s, '#FFF2B0'); csGlow(ctx, 42 * s, bob + 9 * s, 12 * s, '#FFF2B0', 0.3);
    ctx.save(); ctx.translate(2 * s, bob); ctx.rotate(a); for (let k = 0; k < 4; k++){ ctx.rotate(Math.PI / 2); lkOV(ctx, 40 * s, 0, 44 * s, 2.4 * s, k % 2 ? 'rgba(228,232,240,.26)' : 'rgba(228,232,240,.4)'); } ctx.restore();
    fillCircle(ctx, 2 * s, bob, 7 * s, '#0C1018'); fillCircle(ctx, 2 * s, bob, 5 * s, '#4A5060'); fillCircle(ctx, 2 * s, bob, 2 * s, '#C8CCD4');
    if (st === 'roar') ringPath(ctx, 0, bob, 84 * s, 5, '#FFD890', 0.5);
  },
  ft_tank(ctx, e, b, dk, bob, wind, d){                                                /* Old Thunder: a battle tank with a long gun, drive-wheels under its tracks, a hatch with a flag and smoke launchers */
    const s = e.r / 68, a = e.anim * 1.2, st = e.state, glow = e.glow || 0, fire = st === 'cannon' || st === 'cannonwind', charge = st === 'charge' || st === 'chargewind', rec = st === 'cannon' ? -5 * s : 0;
    csGlow(ctx, 0, bob, 96 * s, FT_AMBER, 0.04 + 0.1 * glow);
    for (const sd of [-1, 1]){ tw_rr(ctx, -58 * s, bob + sd * 40 * s - 14 * s, 118 * s, 28 * s, 10 * s, '#06080A'); for (let k = 0; k < 16; k++){ const x = -56 * s + ((k * 7.4 * s + a * 7 * s * (charge ? 3 : 1)) % (112 * s)); tw_rect(ctx, x, bob + sd * 40 * s - 12.6 * s, 3 * s, 25.2 * s, '#2E3028'); }
      for (let k = 0; k < 5; k++){ fillCircle(ctx, (-44 + k * 22) * s, bob + sd * 40 * s, 8 * s, '#14160E'); fillCircle(ctx, (-44 + k * 22) * s, bob + sd * 40 * s, 5.4 * s, '#4A4E40'); fillCircle(ctx, (-44 + k * 22) * s, bob + sd * 40 * s, 1.8 * s, '#1A1C14'); } }
    tw_rr(ctx, -54 * s, bob - 36 * s, 108 * s, 72 * s, 10 * s, '#06080A'); tw_rr(ctx, -52 * s, bob - 34 * s, 104 * s, 68 * s, 9 * s, b);
    tw_poly(ctx, [36 * s, bob - 34 * s, 54 * s, bob - 20 * s, 54 * s, bob + 20 * s, 36 * s, bob + 34 * s], tw_li(b, 0.12)); tw_rect(ctx, -52 * s, bob - 34 * s, 104 * s, 7 * s, tw_li(b, 0.32));
    for (let k = 0; k < 6; k++) tw_rect(ctx, (-46 + k * 14) * s, bob - 34 * s, 1.6 * s, 68 * s, tw_sh(b, 0.26));
    for (const [x, y] of [[-48, -30], [-48, 30], [48, -30], [48, 30], [0, -31], [0, 31]]) fillCircle(ctx, x * s, bob + y * s, 2 * s, '#262A1C');
    for (let k = 0; k < 4; k++) tw_rect(ctx, (-48 + k * 5) * s, bob - 24 * s, 3 * s, 14 * s, '#14160E');                       /* the engine deck's louvres */
    tw_rect(ctx, -50 * s, bob + 14 * s, 24 * s, 3 * s, FT_AMBER); tw_rect(ctx, -50 * s, bob + 21 * s, 24 * s, 3 * s, '#14160E');
    ctx.save(); ctx.translate(rec, 0);
    tw_rect(ctx, 6 * s, bob - 5 * s, 62 * s, 10 * s, '#06080A'); tw_rect(ctx, 6 * s, bob - 3.6 * s, 62 * s, 7.2 * s, FT_STEEL); tw_rect(ctx, 6 * s, bob - 3.6 * s, 62 * s, 2 * s, tw_li(FT_STEEL, 0.3)); tw_rr(ctx, 56 * s, bob - 7 * s, 16 * s, 14 * s, 3 * s, '#06080A'); tw_rect(ctx, 70 * s, bob - 4 * s, 4 * s, 8 * s, '#10121A');
    if (fire) csGlow(ctx, 76 * s, bob, 20 * s, FT_AMBER, 0.7);
    lkOV(ctx, -8 * s, bob, 36 * s, 28 * s, '#06080A'); lkOV(ctx, -8 * s, bob, 34 * s, 26 * s, tw_li(b, 0.08)); lkOV(ctx, -16 * s, bob - 8 * s, 18 * s, 10 * s, tw_li(b, 0.3));
    ctx.restore();
    for (let k = 0; k < 3; k++) tw_rr(ctx, -34 * s, bob - 13 * s + k * 9 * s, 9 * s, 6 * s, 1.4 * s, '#14160E');
    fillCircle(ctx, -14 * s, bob - 4 * s, 9 * s, '#06080A'); fillCircle(ctx, -14 * s, bob - 4 * s, 7.6 * s, '#3A3E34'); fillCircle(ctx, -14 * s, bob - 4 * s, 4 * s, '#1A1C14');
    tw_ln(ctx, [-24 * s, bob + 12 * s, -34 * s, bob + 26 * s], 1.8 * s, '#C8CCD4'); tw_poly(ctx, [-34 * s, bob + 26 * s, -52 * s, bob + 24 * s, -48 * s, bob + 31 * s], '#C8402A');
    fillCircle(ctx, 12 * s, bob - 10 * s, 3.4 * s, '#06080A'); tw_rect(ctx, 11 * s, bob - 17 * s, 2 * s, 8 * s, '#2A2E38'); fillCircle(ctx, 12 * s, bob - 17 * s, 2 * s, FT_RED);
    for (const sd of [-1, 1]) { fillCircle(ctx, 50 * s, bob + sd * 28 * s, 3 * s, '#FFF2B0'); csGlow(ctx, 56 * s, bob + sd * 28 * s, 12 * s, FT_AMBER, 0.3); }
    if (st === 'chargewind') ringPath(ctx, 0, bob, 80 * s, 4, FT_AMBER, 0.5);
    if (st === 'roar') ringPath(ctx, 0, bob, 90 * s, 5, '#FFD890', 0.5);
  },
  ft_colonel(ctx, e, b, dk, bob, wind, d){                                             /* Colonel Mortimer: a gold-trimmed walker with a glass cockpit (a peaked cap inside), a flamer on each arm and shield drones that circle it */
    const s = e.r / 60, a = e.anim * 1.4, st = e.state, ph = e.phase || 1, glow = e.glow || 0, burn = st === 'burn' || st === 'burnwind', core = 0.5 + 0.5 * Math.sin(e.anim * 3);
    csGlow(ctx, 0, bob, 92 * s, FT_AMBER, 0.06 + 0.12 * glow);
    for (const sd of [-1, 1]) for (let i = 0; i < 2; i++){ const w = Math.sin(a + i * Math.PI + (sd > 0 ? 0 : 1.1)) * 9 * s, x0 = (18 - i * 34) * s; tw_ln(ctx, [x0, bob + sd * 18 * s, x0 + 5 * s + w, bob + sd * 34 * s, x0 + 1 * s + w * 1.5, bob + sd * 46 * s], 10 * s, '#0A0806'); tw_ln(ctx, [x0, bob + sd * 18 * s, x0 + 5 * s + w, bob + sd * 34 * s, x0 + 1 * s + w * 1.5, bob + sd * 46 * s], 7 * s, b); lkOV(ctx, x0 + 1 * s + w * 1.5, bob + sd * 46 * s, 8 * s, 5.4 * s, '#1A1208'); }
    tw_rr(ctx, -40 * s, bob - 26 * s, 76 * s, 52 * s, 11 * s, '#0A0806'); tw_rr(ctx, -38 * s, bob - 24 * s, 72 * s, 48 * s, 10 * s, b);
    for (const [x, y, w, h] of [[-32, -20, 24, 14], [-4, -22, 22, 12], [-30, 4, 26, 16], [0, 6, 24, 14]]) { tw_rr(ctx, x * s, bob + y * s, w * s, h * s, 2 * s, tw_li(b, 0.08 + ((x + y) % 3) * 0.07)); for (const [px, py] of [[1.6, 1.6], [w - 1.6, 1.6], [1.6, h - 1.6], [w - 1.6, h - 1.6]]) fillCircle(ctx, (x + px) * s, bob + (y + py) * s, 0.9 * s, '#2A1E10'); }
    tw_rect(ctx, -38 * s, bob - 2 * s, 72 * s, 3 * s, '#E8C84A'); for (let k = 0; k < 6; k++) tw_rect(ctx, (-34 + k * 11) * s, bob - 24 * s, 5 * s, 3 * s, '#E8C84A');
    for (const sd of [-1, 1]){ tw_ln(ctx, [-4 * s, bob + sd * 22 * s, 12 * s, bob + sd * 32 * s, 30 * s, bob + sd * 32 * s], 11 * s, '#0A0806'); tw_ln(ctx, [-4 * s, bob + sd * 22 * s, 12 * s, bob + sd * 32 * s, 30 * s, bob + sd * 32 * s], 8 * s, tw_sh(b, 0.1));
      tw_rr(ctx, 26 * s, bob + sd * 32 * s - 6 * s, 24 * s, 12 * s, 3 * s, '#0A0806'); tw_rect(ctx, 44 * s, bob + sd * 32 * s - 3 * s, 10 * s, 6 * s, '#2A2E38'); fillCircle(ctx, 55 * s, bob + sd * 32 * s, 3 * s, burn ? '#FFE04A' : '#FF8A3A');
      if (burn || st === 'burnwind'){ const fl = burn ? 1 : 0.4; for (let k = 0; k < 3; k++){ const w2 = Math.sin(e.anim * 14 + k * 2 + sd) * 2 * s; ctx.globalAlpha = 0.85; lkOV(ctx, (60 + k * 8 * fl) * s, bob + sd * 32 * s + w2, (6 + fl * 6 - k * 1.5) * s, (4 + fl * 3 - k) * s, FT_FLAME[k]); } ctx.globalAlpha = 1; csGlow(ctx, 70 * s, bob + sd * 32 * s, 24 * s * (0.5 + fl), FT_AMBER, 0.3); } }
    fillCircle(ctx, 14 * s, bob, 18 * s, '#0A0806'); fillCircle(ctx, 14 * s, bob, 16 * s, 'rgba(120,190,230,.8)'); fillCircle(ctx, 8 * s, bob - 7 * s, 7 * s, 'rgba(255,255,255,.3)');
    fillCircle(ctx, 14 * s, bob, 8 * s, '#3A2E1C'); fillCircle(ctx, 14 * s, bob, 6.4 * s, '#6A5A3A'); tw_poly(ctx, [14 * s, bob - 5 * s, 24 * s, bob - 3 * s, 24 * s, bob + 3 * s, 14 * s, bob + 5 * s], '#2A3A2A'); fillCircle(ctx, 20 * s, bob, 1.4 * s, '#E8C84A');
    for (let k = 0; k < 2; k++){ const an = e.anim * 2.2 + k * Math.PI + (ph > 1 ? 0.8 : 0), dx = Math.cos(an) * 56 * s, dy = Math.sin(an) * 50 * s; ctx.globalAlpha = 0.9; fillCircle(ctx, dx, bob + dy, 7 * s, '#0A0806'); fillCircle(ctx, dx, bob + dy, 5.6 * s, '#4A5060'); fillCircle(ctx, dx + 2 * s, bob + dy, 2.4 * s, FT_RED); ctx.globalAlpha = 0.25 + 0.2 * core; ringPath(ctx, dx, bob + dy, 11 * s, 2, '#9AD8F0', 0.7); ctx.globalAlpha = 1; }
    if (st === 'roar') ringPath(ctx, 0, bob, 80 * s, 5, '#FFD890', 0.5);
  },
  ft_maker(ctx, e, b, dk, bob, wind, d){                                               /* The Maker: a hunched scientist in a floating glimmer-reactor throne, a glass dome over her, six spider arms with claws and green cables running into the core */
    const s = e.r / 66, a = e.anim * 1.2, st = e.state, ph = e.phase || 1, glow = e.glow || 0, core = 0.6 + 0.4 * Math.sin(e.anim * (2 + ph)), zap = st === 'zapwind' || st === 'zap';
    csGlow(ctx, 0, bob, 110 * s, '#7AFFC8', 0.08 + 0.18 * glow + 0.06 * core);
    for (let k = 0; k < 6; k++){ const sd = k % 2 ? 1 : -1, row = k >> 1, w = Math.sin(a * 1.6 + k * 1.3) * 7 * s, bx = (14 - row * 18) * s, by = bob + sd * 22 * s, mx = bx + (12 - row * 6) * s + w, my = bob + sd * 44 * s, ex = bx + (30 - row * 8) * s + w * 1.4, ey = bob + sd * (58 + row * 3) * s;
      tw_ln(ctx, [bx, by, mx, my, ex, ey], 7 * s, '#06100C'); tw_ln(ctx, [bx, by, mx, my, ex, ey], 4.6 * s, tw_li(b, 0.12)); fillCircle(ctx, mx, my, 4 * s, '#06100C'); fillCircle(ctx, mx, my, 2.6 * s, '#9AF0C8');
      tw_poly(ctx, [ex, ey - 4 * s, ex + 12 * s, ey - 1.4 * s, ex, ey], '#C8D8D0'); tw_poly(ctx, [ex, ey + 4 * s, ex + 12 * s, ey + 1.4 * s, ex, ey], '#C8D8D0'); }
    lkOV(ctx, -6 * s, bob, 40 * s, 36 * s, '#06100C'); lkOV(ctx, -6 * s, bob, 37.6 * s, 33.6 * s, b);
    for (let k = 0; k < 8; k++){ const an = k * TAU / 8; tw_ln(ctx, [-6 * s + Math.cos(an) * 14 * s, bob + Math.sin(an) * 14 * s, -6 * s + Math.cos(an) * 34 * s, bob + Math.sin(an) * 31 * s], 1.6 * s, tw_sh(b, 0.35)); }
    for (let k = 0; k < 10; k++){ const an = k * TAU / 10 + 0.3; fillCircle(ctx, -6 * s + Math.cos(an) * 30 * s, bob + Math.sin(an) * 27 * s, 1.4 * s, '#2A3A34'); }
    for (const sd of [-1, 1]) for (let q = 0; q < 3; q++){ tw_ln(ctx, [-30 * s, bob + sd * (6 + q * 6) * s, -50 * s, bob + sd * (14 + q * 10) * s, -64 * s, bob + sd * (10 + q * 7) * s], 2 * s, '#06100C'); tw_ln(ctx, [-30 * s, bob + sd * (6 + q * 6) * s, -50 * s, bob + sd * (14 + q * 10) * s, -64 * s, bob + sd * (10 + q * 7) * s], 1 * s, '#7AFFC8'); }
    fillCircle(ctx, -6 * s, bob, 24 * s, '#06100C'); fillCircle(ctx, -6 * s, bob, 22 * s, '#12261E'); fillCircle(ctx, -6 * s, bob, (11 + 3 * core) * s, '#7AFFC8'); fillCircle(ctx, -6 * s, bob, (6 + 2 * core) * s, '#E8FFF4'); ringPath(ctx, -6 * s, bob, 22 * s, 2 * s, '#9AF0C8', 0.4 + 0.3 * core);
    fillCircle(ctx, 14 * s, bob, 19 * s, '#06100C'); fillCircle(ctx, 14 * s, bob, 17 * s, 'rgba(150,230,210,.55)'); fillCircle(ctx, 8 * s, bob - 7 * s, 6 * s, 'rgba(255,255,255,.35)');
    lkOV(ctx, 10 * s, bob, 10 * s, 8 * s, '#E8E8E0'); fillCircle(ctx, 18 * s, bob, 7 * s, '#D8B898'); fillCircle(ctx, 18 * s, bob, 5.4 * s, '#E8C8A8'); tw_poly(ctx, [12 * s, bob - 6.4 * s, 22 * s, bob - 5 * s, 20 * s, bob - 2.4 * s, 12 * s, bob - 3 * s], '#C8C8C0');
    for (const sd of [-1, 1]) { fillCircle(ctx, 22 * s, bob + sd * 2.4 * s, 2.4 * s, '#FFFFFF'); fillCircle(ctx, 22.6 * s, bob + sd * 2.4 * s, 1.2 * s, '#2A5A4A'); ringPath(ctx, 22 * s, bob + sd * 2.4 * s, 3.4 * s, 1, '#2A2E34', 0.8); }
    tw_rr(ctx, 5 * s, bob - 14 * s, 6 * s, 28 * s, 2 * s, 'rgba(10,20,16,.5)');
    if (zap){ ringPath(ctx, -6 * s, bob, 40 * s + (zap ? 6 * s : 0), 3, '#9AF0C8', 0.55); csGlow(ctx, 30 * s, bob, 26 * s, '#7AFFC8', 0.5); }
    if (glow > 0.2) ringPath(ctx, 0, bob, 82 * s, 4, '#7AFFC8', 0.3 + 0.3 * glow);
    if (st === 'roar') ringPath(ctx, 0, bob, 92 * s, 5, '#D8FFF0', 0.5);
  }
};
Object.assign(ENEMY_LOOK_DRAW, FORT_DRAW);
