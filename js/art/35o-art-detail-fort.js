'use strict';
/* Enemy art: the detail layer for Chapter 16, Fort Shortneck. */
/* The same idea as js/art/35l-art-detail.js, for the soldiers, machines and bosses of js/art/35n-art-fort.js: each drawing is wrapped (dt_wrap) and many small parts are added under and over
   it, so a creature is built of dozens of pieces: stitching and straps, pouches and magazines, rivets and weld seams, hatches, lamps and lenses, hoses, tread blocks, patches and
   stencils. The ordinary kinds read only def, type, r, anim and state (so the sprite cache keeps pictures of them and the parts cost nothing per frame); the bosses are drawn live. */
const FD_BRASS = '#D8B050', FD_WEB = '#3A3A2A', FD_NAV_R = '#FF4A3A', FD_NAV_G = '#4AFF7A';
/* MOLLE webbing: rows of short loops, the thing every vest is covered in */
function fd_molle(ctx, x, y, w, h, rows, s){ for (let r = 0; r < rows; r++) for (let k = 0; k < Math.floor(w / (1.5 * s)); k++) tw_rect(ctx, x + k * 1.5 * s, y + r * h / rows, 1 * s, 0.35 * s, FD_WEB); }
/* a rifle magazine pouch: a box, a flap, a brass-topped magazine peeking out */
function fd_pouch(ctx, x, y, w, h, c){ tw_rr(ctx, x, y, w, h, h * 0.2, tw_sh(c, 0.45)); tw_rect(ctx, x, y, w, h * 0.3, tw_li(c, 0.12)); tw_rect(ctx, x + w * 0.2, y + h * 0.1, w * 0.6, h * 0.14, FD_BRASS); }
/* a camouflage net over a helmet: crossed strands and a few leaf scraps */
function fd_net(ctx, x, y, r, c, s){ ctx.strokeStyle = 'rgba(20,26,12,.28)'; ctx.lineWidth = 0.35 * s; ctx.beginPath(); for (let k = -2; k <= 2; k++){ ctx.moveTo(x - r, y + k * r * 0.4); ctx.lineTo(x + r, y + k * r * 0.4 + r * 0.3); ctx.moveTo(x + k * r * 0.4, y - r); ctx.lineTo(x + k * r * 0.4 + r * 0.3, y + r); } ctx.stroke(); for (let k = 0; k < 6; k++){ const a = k * 1.05; lkOV(ctx, x + Math.cos(a) * r * 0.65, y + Math.sin(a) * r * 0.65, 0.9 * s, 0.45 * s, k % 2 ? '#5A6A2A' : tw_li(c, 0.2), a); } }
/* a rotor blade tip stripe pair, for the flying machines */
function fd_tip(ctx, x, y, an, len, w){ ctx.save(); ctx.translate(x, y); ctx.rotate(an); tw_rect(ctx, len * 0.78, -w / 2, len * 0.1, w, '#F4F0E0'); tw_rect(ctx, len * 0.88, -w / 2, len * 0.12, w, FD_NAV_R); ctx.restore(); }
/* a hose with ferrules at both ends */
function fd_hose(ctx, pts, w, c){ tw_ln(ctx, pts, w * 1.5, '#0A0C10'); tw_ln(ctx, pts, w, c); for (const i of [0, pts.length - 2]) fillCircle(ctx, pts[i], pts[i + 1], w * 0.95, '#8A909C'); }
/* a gear: toothed ring and a hub */
function fd_gear(ctx, x, y, r, n, c, a){ for (let k = 0; k < n; k++){ const an = a + k * TAU / n; tw_rect(ctx, x + Math.cos(an) * r - r * 0.16, y + Math.sin(an) * r - r * 0.16, r * 0.32, r * 0.32, c); } fillCircle(ctx, x, y, r * 0.85, c); fillCircle(ctx, x, y, r * 0.4, tw_sh(c, 0.5)); }

dt_wrap('ft_guard', function(ctx, e, b, dk, bob){
  const s = e.r / 13, a = e.anim * 2.4;
  for (const sd of [-1, 1]){ const w = Math.sin(a + (sd > 0 ? 0 : Math.PI)) * 3 * s; for (let k = 0; k < 3; k++) tw_rect(ctx, w - 1.4 * s + k * 0.9 * s, bob + sd * 3.4 * s - 0.3 * s, 0.35 * s, 0.7 * s, '#8A8A6A'); }       /* boot laces and soles */
}, function(ctx, e, b, dk, bob){
  const s = e.r / 13, burst = e.state === 'burst', hl = tw_li(b, 0.05);
  fd_molle(ctx, -2.2 * s, bob - 6.6 * s, 3.6 * s, 1.6 * s, 4, s); fd_molle(ctx, -2.2 * s, bob + 3.2 * s, 3.6 * s, 1.6 * s, 4, s);           /* webbing on the vest */
  for (const sd of [-1, 1]) fd_pouch(ctx, 0.5 * s, bob + sd * 3.4 * s - 1 * s, 2.2 * s, 1.8 * s, b);
  fillCircle(ctx, -1.4 * s, bob + 5.2 * s, 0.9 * s, '#2A3A1A'); fillCircle(ctx, -1.4 * s, bob + 5.2 * s, 0.4 * s, '#8A9A5A');                    /* a grenade on the chest */
  tw_rect(ctx, -3.4 * s, bob - 6.6 * s, 1.5 * s, 0.9 * s, '#3A5A9A'); tw_rect(ctx, -3.4 * s, bob - 5.8 * s, 1.5 * s, 0.4 * s, '#C8C8D0');       /* shoulder patch */
  tw_ln(ctx, [-4 * s, bob + 5.2 * s, -5 * s, bob + 8 * s], 0.35 * s, '#C8CCD4'); dt_led(ctx, -5 * s, bob + 8.2 * s, 0.4 * s, FD_NAV_G, Math.sin(e.anim * 2) > -0.3);   /* the radio and its light */
  for (const sd of [-1, 1]){ fillCircle(ctx, 1.4 * s, bob + sd * 5.3 * s, 0.9 * s, tw_sh(b, 0.2)); fillCircle(ctx, 1.4 * s, bob + sd * 5.3 * s, 0.4 * s, hl); }   /* elbow pads */
  fd_net(ctx, 1.2 * s, bob, 3.6 * s, b, s);
  for (const sd of [-1, 1]) tw_ln(ctx, [1 * s, bob + sd * 3.4 * s, 2.2 * s, bob + sd * 4.4 * s], 0.35 * s, '#1A1C14');                           /* chin strap */
  tw_rect(ctx, 8 * s, bob - 1.8 * s, 3 * s, 0.9 * s, '#0A0A10'); fillCircle(ctx, 11.2 * s, bob - 1.4 * s, 0.8 * s, 'rgba(160,220,255,.8)'); fillCircle(ctx, 10.9 * s, bob - 1.7 * s, 0.3 * s, '#FFFFFF');   /* the scope */
  for (let k = 0; k < 6; k++) tw_rect(ctx, (3 + k * 1.6) * s, bob - 0.95 * s, 0.35 * s, 0.4 * s, '#4A4E5A');                                    /* rail ticks */
  tw_ln(ctx, [2 * s, bob + 1 * s, -3 * s, bob + 4.4 * s], 0.5 * s, '#2A2A1E');                                                             /* the sling */
  tw_rect(ctx, 14.4 * s, bob - 1 * s, 0.7 * s, 2 * s, '#0A0A10'); tw_rect(ctx, 15.4 * s, bob - 0.8 * s, 0.6 * s, 1.6 * s, '#0A0A10');       /* the brake */
  fillCircle(ctx, -8.4 * s, bob - 3.6 * s, 1 * s, '#6A7A5A'); fillCircle(ctx, -8.4 * s, bob - 3.6 * s, 0.5 * s, '#3A4A2A');                    /* a canteen */
  tw_ln(ctx, [-9.6 * s, bob + 2 * s, -12.6 * s, bob + 4.4 * s], 0.7 * s, '#6A5A3A'); tw_rect(ctx, -13 * s, bob + 4 * s, 1.1 * s, 1 * s, '#9AA0A8');   /* an entrenching tool */
  if (burst) for (let k = 0; k < 3; k++){ const q = ctx.globalAlpha; fillCircle(ctx, (6 + k * 1.6) * s, bob + (3.2 + k * 0.9) * s, 0.4 * s, FD_BRASS); ctx.globalAlpha = q; }  /* brass flying */
});
dt_wrap('ft_cadet', null, function(ctx, e, b, dk, bob){
  const s = e.r / 10, a = e.anim * 3.6, sweat = Math.sin(a) > 0;
  fd_net(ctx, 1.4 * s, bob, 3.9 * s, b, s);
  tw_rect(ctx, -4 * s, bob - 1.6 * s, 2.4 * s, 1.5 * s, '#E8E8D0'); tw_rect(ctx, -3.6 * s, bob - 1.1 * s, 1.6 * s, 0.35 * s, '#3A3A2A');          /* a name tag on the back */
  for (const k of [-1, 1]){ fillCircle(ctx, -9 * s, bob + k * 2.6 * s, 1.1 * s, '#8A909C'); fillCircle(ctx, -9 * s, bob + k * 2.6 * s, 0.6 * s, '#3A3E48'); }   /* pots hung on the pack */
  tw_ln(ctx, [-8 * s, bob + 2.6 * s, -9 * s, bob + 2.6 * s], 0.3 * s, '#2A2A1E');
  if (sweat){ lkOV(ctx, 4.6 * s, bob - 5 * s, 0.5 * s, 0.8 * s, 'rgba(160,210,255,.85)'); lkOV(ctx, 3.4 * s, bob + 5.4 * s, 0.4 * s, 0.7 * s, 'rgba(160,210,255,.85)'); }
  for (const sd of [-1, 1]){ for (let k = -1; k <= 1; k++) tw_ln(ctx, [3 * s, bob + sd * 8 * s, 3.6 * s + k * 0.5 * s, bob + sd * 9.6 * s], 0.28 * s, '#D8B898'); }   /* fingers spread, both hands up */
  tw_rect(ctx, 2 * s, bob - 3 * s, 1.2 * s, 0.35 * s, '#2A2A1E');                                                                           /* a helmet band too loose */
  for (const sd of [-1, 1]) tw_ln(ctx, [-1 * s, bob + sd * 1.5 * s, -3.4 * s, bob + sd * 2.2 * s], 0.35 * s, '#C8402A');                      /* a scarf */
  for (const sd of [-1, 1]) tw_rect(ctx, -2.6 * s + Math.sin(a + sd) * 1.6 * s, bob + sd * 3.4 * s - 0.2 * s, 1.1 * s, 0.35 * s, '#E8E8D0');    /* loose laces */
});
dt_wrap('ft_hound', function(ctx, e, b, dk, bob){
  const s = e.r / 12, a = e.anim * 3;
  for (let i = 0; i < 2; i++) for (const sd of [-1, 1]){ const w = Math.sin(a + i * Math.PI + (sd > 0 ? 0 : 1.7)) * 3.6 * s, x0 = (6 - i * 11) * s; dt_toes(ctx, x0 + 1 * s + w * 1.4, bob + sd * 9.4 * s, sd * 1.3, 3, 1.4 * s, 0.5 * s, '#C8CCD4'); }
}, function(ctx, e, b, dk, bob){
  const s = e.r / 12, lunge = e.state === 'lunge';
  for (let k = 0; k < 5; k++){ const x = (-9 + k * 3.4) * s; tw_poly(ctx, [x, bob - 4.6 * s, x + 1.4 * s, bob - 5.8 * s, x + 2.4 * s, bob - 4.6 * s], tw_sh(b, 0.3)); tw_poly(ctx, [x, bob + 4.6 * s, x + 1.4 * s, bob + 5.8 * s, x + 2.4 * s, bob + 4.6 * s], tw_sh(b, 0.3)); }   /* back plates, edge-on */
  dt_bolts(ctx, [-8, -3.4, -8, 3.4, -4.6, -3.4, -4.6, 3.4, -1.2, -3.4, -1.2, 3.4], s, 0.4);
  dt_wire(ctx, [-9 * s, bob, -6 * s, bob - 1.4 * s, -2 * s, bob + 1.4 * s, 3 * s, bob], 0.4 * s, '#E8A83A');                                   /* the spine cable */
  dt_led(ctx, -2.4 * s, bob - 2.2 * s, 0.5 * s, '#6AFFB0', Math.sin(e.anim * 4) > -0.2); dt_led(ctx, -2.4 * s, bob + 2.2 * s, 0.5 * s, FD_NAV_R, true);
  tw_rr(ctx, -7 * s, bob - 1.2 * s, 2.6 * s, 2.4 * s, 0.4 * s, '#2A2E38'); dt_vent(ctx, -6.8 * s, bob - 0.9 * s, 2.2 * s, 1.8 * s, 3, '#10141C', false);   /* the battery and its vent */
  for (let k = 0; k < 6; k++){ const an = k * 1.05 + 0.2; dt_bolt(ctx, 5.6 * s + Math.cos(an) * 5.2 * s, bob + Math.sin(an) * 5.2 * s, 0.35 * s, '#E8E8EE'); }   /* the collar studs */
  tw_ln(ctx, [9 * s, bob - 3.6 * s, 11 * s, bob - 5.6 * s], 0.35 * s, '#C8CCD4'); tw_ln(ctx, [9 * s, bob + 3.6 * s, 11 * s, bob + 5.6 * s], 0.35 * s, '#C8CCD4');   /* ear aerials */
  fillCircle(ctx, 10.4 * s, bob - 1.8 * s, 1 * s, '#10141C'); fillCircle(ctx, 10.4 * s, bob - 1.8 * s, 0.6 * s, lunge ? '#FFE04A' : FD_NAV_R); ctx.strokeStyle = 'rgba(200,204,212,.6)'; ctx.lineWidth = 0.3 * s; ctx.beginPath(); ctx.arc(10.4 * s, bob - 1.8 * s, 1.3 * s, 0, TAU); ctx.stroke();
  for (let k = 0; k < 4; k++){ tw_rect(ctx, (12.4 + k * 0.7) * s, bob - 0.5 * s, 0.3 * s, 0.35 * s, '#F4F0E0'); tw_rect(ctx, (12.4 + k * 0.7) * s, bob + 0.2 * s, 0.3 * s, 0.35 * s, '#F4F0E0'); }   /* teeth */
  for (const sd of [-1, 1]){ fillCircle(ctx, 6 * s, bob + sd * 3.4 * s, 1 * s, '#4A4E58'); fillCircle(ctx, 6 * s, bob + sd * 3.4 * s, 0.45 * s, '#9AA0AC'); fillCircle(ctx, -6 * s, bob + sd * 3.6 * s, 1 * s, '#4A4E58'); fillCircle(ctx, -6 * s, bob + sd * 3.6 * s, 0.45 * s, '#9AA0AC'); }   /* hip and shoulder joints */
  if (lunge) for (let k = 1; k < 4; k++) tw_ln(ctx, [(-12 - k * 2.4) * s, bob + (k - 2) * 1.4 * s, (-16 - k * 2.4) * s, bob + (k - 2) * 1.4 * s], 0.4 * s, 'rgba(255,255,255,.35)');
});
dt_wrap('ft_jeep', function(ctx, e, b, dk, bob){
  const s = e.r / 14; for (const [wx, wy] of [[-9, -9], [-9, 9], [9, -9], [9, 9]]){ fillCircle(ctx, wx * s, bob + wy * s, 1.5 * s, '#2A2C34'); }
}, function(ctx, e, b, dk, bob){
  const s = e.r / 14, run = e.state === 'wind' || e.state === 'roll';
  for (const [wx, wy] of [[-9, -9], [-9, 9], [9, -9], [9, 9]]){ fillCircle(ctx, wx * s, bob + wy * s, 1.3 * s, '#6A6E78'); for (let k = 0; k < 4; k++) dt_bolt(ctx, wx * s + Math.cos(k * 1.57) * 0.8 * s, bob + wy * s + Math.sin(k * 1.57) * 0.8 * s, 0.25 * s, '#C8CCD4'); }   /* wheel hubs and nuts */
  for (let k = 0; k < 6; k++) tw_rect(ctx, 7.6 * s, bob + (-4.4 + k * 1.5) * s, 4.6 * s, 0.4 * s, tw_sh(b, 0.4));                                  /* the grille slats */
  tw_ln(ctx, [6 * s, bob - 5.8 * s, 6 * s, bob + 5.8 * s], 0.6 * s, '#1A1C22'); tw_ln(ctx, [5.6 * s, bob + 0.4 * s, 5.6 * s, bob + 4.8 * s], 0.35 * s, '#C8CCD4');     /* the windscreen frame and a wiper */
  fillCircle(ctx, -12.8 * s, bob - 3 * s, 2.2 * s, '#14161C'); fillCircle(ctx, -12.8 * s, bob - 3 * s, 1.4 * s, '#2A2C34'); for (let k = 0; k < 8; k++){ const an = k * 0.785; tw_rect(ctx, -12.8 * s + Math.cos(an) * 1.8 * s - 0.2 * s, bob - 3 * s + Math.sin(an) * 1.8 * s - 0.2 * s, 0.4 * s, 0.4 * s, '#3A3C44'); }   /* the spare wheel */
  for (const sd of [-1, 1]){ tw_rr(ctx, -10 * s, bob + sd * 6.2 * s - 1 * s, 2.4 * s, 2 * s, 0.4 * s, '#5A6A2A'); tw_rect(ctx, -9.6 * s, bob + sd * 6.2 * s - 0.2 * s, 1.6 * s, 0.4 * s, '#3A4A1A'); fillCircle(ctx, -13.6 * s, bob + sd * 5.6 * s, 0.6 * s, FD_NAV_R); }  /* jerry cans, tail lights */
  tw_ln(ctx, [-6 * s, bob + 6 * s, -6.6 * s, bob + 10 * s], 0.25 * s, '#C8CCD4'); dt_led(ctx, -6.6 * s, bob + 10.2 * s, 0.4 * s, FD_NAV_R, true);       /* the whip aerial */
  tw_rect(ctx, 12.4 * s, bob - 0.8 * s, 1.6 * s, 1.6 * s, '#E8E8E0'); tw_rect(ctx, 12.6 * s, bob - 0.5 * s, 1.2 * s, 0.35 * s, '#3A3A3A');          /* the number plate */
  for (const [mx, my] of [[3, -7], [-5, 6.4], [9, 6], [-8, -6.6]]) lkOV(ctx, mx * s, bob + my * s, 1.1 * s, 0.6 * s, 'rgba(70,54,30,.55)');            /* mud */
  for (const sd of [-1, 1]) dt_bolts(ctx, [-1.4, sd * 6.6], s, 0.3);
  if (run) for (let k = 1; k < 3; k++){ tw_ln(ctx, [(-15 - k * 3) * s, bob - 8 * s, (-19 - k * 3) * s, bob - 8 * s], 0.4 * s, 'rgba(255,255,255,.3)'); tw_ln(ctx, [(-15 - k * 3) * s, bob + 8 * s, (-19 - k * 3) * s, bob + 8 * s], 0.4 * s, 'rgba(255,255,255,.3)'); }
});
dt_wrap('ft_riot', function(ctx, e, b, dk, bob){
  const s = e.r / 16; for (const sd of [-1, 1]) dt_toes(ctx, 2 * s, bob + sd * 4 * s, sd * 1.4, 2, 1.4 * s, 0.4 * s, '#2A2E38');
}, function(ctx, e, b, dk, bob){
  const s = e.r / 16, bash = e.state === 'bash' || e.state === 'bashwind', out = bash ? 4 * s : 0;
  ctx.strokeStyle = 'rgba(255,255,255,.55)'; ctx.lineWidth = 0.35 * s; ctx.beginPath(); ctx.moveTo(9 * s + out, bob - 4 * s); ctx.lineTo(10.4 * s + out, bob - 2 * s); ctx.lineTo(9.6 * s + out, bob - 0.8 * s); ctx.moveTo(10.4 * s + out, bob - 2 * s); ctx.lineTo(11.6 * s + out, bob - 1.4 * s); ctx.moveTo(9.4 * s + out, bob + 6 * s); ctx.lineTo(10.6 * s + out, bob + 8 * s); ctx.stroke();   /* cracks in the shield */
  for (let k = 0; k < 6; k++) tw_rect(ctx, 7.6 * s + out, bob - 12 * s + k * 4.4 * s, 5 * s, 0.4 * s, 'rgba(200,204,212,.5)');                       /* its frame ribs */
  tw_rr(ctx, 5.2 * s + out, bob - 1.6 * s, 2.4 * s, 3.2 * s, 0.6 * s, '#14161C'); tw_rect(ctx, 5.6 * s + out, bob - 0.4 * s, 1.6 * s, 0.8 * s, '#4A4E58');   /* the grip behind it */
  for (const sd of [-1, 1]){ tw_rect(ctx, 7.6 * s + out, bob + sd * 10 * s - 0.5 * s, 5 * s, 0.9 * s, '#1E1E22'); for (let k = 0; k < 3; k++) tw_rect(ctx, (8 + k * 1.6) * s + out, bob + sd * 10 * s - 0.5 * s, 0.8 * s, 0.9 * s, '#E8C84A'); }   /* hazard end caps */
  tw_ln(ctx, [-2 * s, bob + 8 * s, -2 * s, bob + 13 * s], 0.9 * s, '#14161C'); tw_rect(ctx, -2.4 * s, bob + 12.6 * s, 0.8 * s, 1 * s, '#C8CCD4');     /* a baton on the hip */
  tw_rect(ctx, -0.4 * s, bob - 2.2 * s, 1.4 * s, 4.4 * s, '#1E222A'); for (let k = 0; k < 3; k++) tw_rect(ctx, -0.2 * s, bob + (-1.6 + k * 1.4) * s, 1 * s, 0.4 * s, '#4A4E58');   /* the chest plate and its straps */
  for (const sd of [-1, 1]){ dt_bolts(ctx, [-2, sd * 9.4, 2, sd * 9.4], s, 0.3); tw_rect(ctx, -2.6 * s, bob + sd * 7.4 * s - 0.2 * s, 5.2 * s, 0.4 * s, '#2A2E38'); }  /* pauldron straps */
  tw_ln(ctx, [1.6 * s, bob - 2 * s, 2.8 * s, bob + 2 * s], 0.35 * s, '#9AA0AC');                                                           /* a visor catch */
  dt_led(ctx, -4.6 * s, bob - 1.4 * s, 0.4 * s, FD_NAV_R, Math.sin(e.anim * 3) > 0);
});
dt_wrap('ft_copter', null, function(ctx, e, b, dk, bob){
  const s = e.r / 12, a = e.anim * 12, bomb = e.state === 'drop' || e.state === 'dropwind';
  for (let k = 0; k < 4; k++){ fd_tip(ctx, 0, bob, a + k * Math.PI / 2, 17 * s, 1.5 * s); }                                                   /* rotor tips, striped */
  for (const sd of [-1, 1]){ for (let k = 0; k < 4; k++) tw_rect(ctx, (-4 + k * 2.2) * s, bob + sd * 5.2 * s - 0.2 * s, 0.4 * s, 0.4 * s, '#8A909C'); tw_rect(ctx, 3.4 * s, bob + sd * 5.2 * s - 0.5 * s, 0.5 * s, 1 * s, '#C8CCD4'); }   /* skid brackets */
  for (let k = 0; k < 5; k++) tw_rect(ctx, (-7 + k * 2.6) * s, bob - 4.8 * s, 0.35 * s, 9.6 * s, 'rgba(0,0,0,.14)');                              /* fuselage panel lines */
  dt_bolts(ctx, [-7, -3.6, -7, 3.6, -2, -4.4, -2, 4.4, 4, -3.6, 4, 3.6], s, 0.3);
  tw_ln(ctx, [3 * s, bob - 3 * s, 4.6 * s, bob - 3.6 * s, 6.2 * s, bob - 2.6 * s], 0.35 * s, 'rgba(255,255,255,.5)'); tw_ln(ctx, [3 * s, bob + 3 * s, 4.6 * s, bob + 3.6 * s, 6.2 * s, bob + 2.6 * s], 0.35 * s, 'rgba(255,255,255,.5)');   /* canopy frame */
  dt_led(ctx, -1 * s, bob - 5.4 * s, 0.5 * s, FD_NAV_R, Math.sin(a * 0.2) > -0.4); dt_led(ctx, -1 * s, bob + 5.4 * s, 0.5 * s, FD_NAV_G, Math.sin(a * 0.2) > -0.4); dt_led(ctx, -19.6 * s, bob, 0.5 * s, '#F4F0E0', Math.sin(a * 0.2 + 1) > 0);   /* nav lights */
  tw_ln(ctx, [-12 * s, bob - 1.4 * s, -16 * s, bob - 1.4 * s], 0.35 * s, '#E8E8E0'); tw_ln(ctx, [-12 * s, bob + 1.4 * s, -16 * s, bob + 1.4 * s], 0.35 * s, '#E8E8E0');   /* tail boom stripes */
  tw_ln(ctx, [0, bob - 2 * s, 0, bob - 7 * s], 0.3 * s, '#C8CCD4'); fillCircle(ctx, 0, bob - 7.2 * s, 0.5 * s, '#C8CCD4');                          /* the aerial */
  if (bomb) for (let k = 0; k < 2; k++){ fillCircle(ctx, (4 + k * 3) * s, bob + 5.4 * s, 1 * s, '#2A2E38'); tw_poly(ctx, [(3 + k * 3) * s, bob + 5.4 * s, (4 + k * 3) * s, bob + 7.4 * s, (5 + k * 3) * s, bob + 5.4 * s], '#C8402A'); }   /* bombs hanging from the pylons */
});
dt_wrap('ft_apc', function(ctx, e, b, dk, bob){
  const s = e.r / 17; for (const sd of [-1, 1]) for (let k = 0; k < 3; k++){ const wx = (-12 + k * 12) * s; fillCircle(ctx, wx, bob + sd * 12 * s, 1.6 * s, '#2A2C34'); }
}, function(ctx, e, b, dk, bob){
  const s = e.r / 17, ram = e.state === 'ram' || e.state === 'ramwind', hi = tw_li(b, 0.2);
  for (const sd of [-1, 1]) for (let k = 0; k < 3; k++){ const wx = (-12 + k * 12) * s; fillCircle(ctx, wx, bob + sd * 12 * s, 1.5 * s, '#6A6E78'); for (let q = 0; q < 6; q++) dt_bolt(ctx, wx + Math.cos(q * 1.047) * 0.9 * s, bob + sd * 12 * s + Math.sin(q * 1.047) * 0.9 * s, 0.22 * s, '#C8CCD4'); }   /* hubs */
  for (let k = 0; k < 9; k++){ dt_bolt(ctx, (-17 + k * 4.3) * s, bob - 9.4 * s, 0.4 * s, hi); dt_bolt(ctx, (-17 + k * 4.3) * s, bob + 9.4 * s, 0.4 * s, hi); }   /* rivet rows */
  ctx.strokeStyle = 'rgba(0,0,0,.35)'; ctx.lineWidth = 0.35 * s; ctx.beginPath(); ctx.moveTo(-18 * s, bob - 5 * s); ctx.lineTo(-12 * s, bob - 5 * s); ctx.lineTo(-12 * s, bob + 5 * s); ctx.lineTo(-18 * s, bob + 5 * s); ctx.moveTo(8 * s, bob - 9 * s); ctx.lineTo(8 * s, bob + 9 * s); ctx.stroke();   /* weld seams */
  for (const [hx, hy] of [[-8, -4.6], [-8, 4.6]]){ fillCircle(ctx, hx * s, bob + hy * s, 2 * s, '#14160E'); fillCircle(ctx, hx * s, bob + hy * s, 1.6 * s, hi); tw_ln(ctx, [(hx - 0.8) * s, bob + hy * s, (hx + 0.8) * s, bob + hy * s], 0.4 * s, '#4A4E40'); }   /* the roof hatches */
  for (let k = 0; k < 3; k++) tw_rr(ctx, (-4 + k * 1.6) * s, bob - 8.4 * s, 1.2 * s, 2.2 * s, 0.3 * s, '#10141C');                                  /* smoke launchers */
  tw_ln(ctx, [-13 * s, bob - 7 * s, -17 * s, bob - 13 * s], 0.35 * s, '#C8CCD4'); dt_led(ctx, -17.2 * s, bob - 13.4 * s, 0.5 * s, FD_NAV_R, Math.sin(e.anim * 2) > 0);   /* aerial */
  for (const sd of [-1, 1]){ tw_rr(ctx, 14 * s, bob + sd * 6 * s - 0.8 * s, 3 * s, 1.6 * s, 0.3 * s, '#10141C'); tw_rect(ctx, 14.4 * s, bob + sd * 6 * s - 0.3 * s, 2.2 * s, 0.6 * s, 'rgba(150,210,240,.6)'); }   /* periscopes */
  for (let k = 0; k < 4; k++) tw_rect(ctx, (11.4 + k * 0.9) * s, bob - 0.7 * s, 0.4 * s, 1.4 * s, '#10121A');                                       /* the barrel's cooling slots */
  for (const [cx, cy] of [[-14, 3], [2, -7], [6, 5]]) lkOV(ctx, cx * s, bob + cy * s, 2.4 * s, 1.5 * s, 'rgba(50,60,24,.45)');                        /* camouflage patches */
  tw_ln(ctx, [-18.4 * s, bob - 6 * s, -18.4 * s, bob - 2 * s], 0.5 * s, '#8A909C'); tw_ln(ctx, [-18.4 * s, bob + 2 * s, -18.4 * s, bob + 6 * s], 0.5 * s, '#8A909C');   /* tow cable */
  if (ram) for (let k = 1; k < 3; k++) tw_ln(ctx, [(-22 - k * 2.6) * s, bob - 8 * s, (-27 - k * 2.6) * s, bob - 8 * s], 0.4 * s, 'rgba(255,255,255,.3)');
});
dt_wrap('ft_mortar', null, function(ctx, e, b, dk, bob){
  const s = e.r / 14, up = e.state === 'lobwind';
  for (let k = 0; k < 3; k++) for (let q = 0; q < 2; q++){ tw_poly(ctx, [(5.8 + q * 3.4) * s, bob + (-4.8 + k * 4) * s, (6.4 + q * 3.4) * s, bob + (-5.6 + k * 4) * s, (7 + q * 3.4) * s, bob + (-4.8 + k * 4) * s], '#C8402A'); }   /* shell noses in the crate */
  tw_rect(ctx, 5 * s, bob - 6 * s, 7 * s, 0.6 * s, '#E8C84A'); tw_rect(ctx, 5 * s, bob + 5.4 * s, 7 * s, 0.6 * s, '#E8C84A');                      /* its stencil band */
  for (let k = 0; k < 3; k++) tw_ln(ctx, [(-3 + k * 4.4) * s, bob - 0.2 * s, (-3 + k * 4.4) * s, bob + 0.2 * s], 1.6 * s, 'rgba(0,0,0,.4)');          /* clamp bands on the tube */
  for (let k = 0; k < 6; k++){ const an = k * 1.047; dt_bolt(ctx, -4 * s + Math.cos(an) * 5.2 * s, bob + Math.sin(an) * 5.2 * s, 0.4 * s, '#C8CCD4'); }   /* base plate bolts */
  for (const sd of [-1, 1]){ fillCircle(ctx, 1 * s, bob + sd * 6.6 * s, 0.8 * s, '#2A2E38'); tw_ln(ctx, [1 * s, bob + sd * 6.6 * s, 4 * s, bob + sd * 9 * s], 0.4 * s, '#C8CCD4'); }   /* bipod feet */
  tw_rr(ctx, -2 * s, bob - 3.6 * s, 2 * s, 1.4 * s, 0.3 * s, '#2A2E38'); fillCircle(ctx, -1 * s, bob - 2.9 * s, 0.5 * s, 'rgba(160,220,255,.8)');   /* the sight */
  for (const sd of [-1, 1]){ fd_net(ctx, 1.2 * s, bob + sd * 7.6 * s - sd * 0.4 * s, 3 * s, b, s * 0.7); fd_pouch(ctx, 0.6 * s, bob + sd * 7.6 * s - 1 * s, 1.8 * s, 1.5 * s, b); }
  if (up){ ctx.globalAlpha = 0.5; fillCircle(ctx, 8.4 * s, bob, 1.6 * s, '#FFE0A0'); ctx.globalAlpha = 1; for (let k = 0; k < 3; k++) fillCircle(ctx, (9 + k * 1.6) * s, bob + (k - 1) * 0.9 * s, 0.5 * s, 'rgba(180,170,160,.6)'); }
});
dt_wrap('ft_grenadier', null, function(ctx, e, b, dk, bob){
  const s = e.r / 12, wnd = e.state === 'lobwind';
  for (let k = 0; k < 5; k++){ const x = (-5 + k * 2.6) * s, y = bob - 4 * s + k * 1.8 * s; ctx.save(); ctx.translate(0, bob); ctx.rotate(0.4); ctx.translate(0, -bob); tw_rect(ctx, x - 0.2 * s, y - 2.2 * s, 0.4 * s, 0.9 * s, '#8A909C'); fillCircle(ctx, x + 0.9 * s, y - 1.6 * s, 0.5 * s, '#C8CCD4'); ctx.restore(); }   /* pins and spoons */
  for (const sd of [-1, 1]) tw_ln(ctx, [-2 * s, bob + sd * 6 * s, 3 * s, bob + sd * 4 * s], 0.5 * s, '#3A2E1A');                                   /* belt */
  tw_rect(ctx, 0.2 * s, bob - 4 * s, 2 * s, 1.4 * s, '#4A3A24'); tw_rect(ctx, 0.4 * s, bob - 3.6 * s, 1.6 * s, 0.4 * s, FD_BRASS);                 /* a pouch */
  fd_net(ctx, 1.2 * s, bob, 3.4 * s, b, s);
  fillCircle(ctx, 1.4 * s, bob + 6 * s, 0.9 * s, tw_sh(b, 0.2)); tw_rect(ctx, -2.2 * s, bob - 6.8 * s, 1.6 * s, 0.8 * s, '#C8402A');                  /* a knee pad, a rank flash */
  tw_ln(ctx, [-8 * s, bob + 2.4 * s, -6 * s, bob + 5 * s], 0.5 * s, '#2A2A1E');
  if (wnd){ const gx = -8 * s, gy = bob + 12 * s; tw_ln(ctx, [gx, gy - 1.4 * s, gx - 1 * s, gy - 3 * s], 0.3 * s, '#FFE0A0'); fillCircle(ctx, gx - 1 * s, gy - 3.2 * s, 0.5 * s, '#FFE04A'); csGlow(ctx, gx - 1 * s, gy - 3.2 * s, 3 * s, '#FFB84A', 0.5); }   /* the fuse */
});
dt_wrap('ft_sniper', null, function(ctx, e, b, dk, bob){
  const s = e.r / 13, aim = e.state === 'aim';
  for (let k = 0; k < 14; k++){ const an = k * 0.47 + 0.2, r0 = (5.4 + (k % 3)) * s; ctx.strokeStyle = k % 2 ? '#6A7A3A' : '#3A4A22'; ctx.lineWidth = 0.35 * s; ctx.beginPath(); ctx.moveTo(-3 * s + Math.cos(an) * r0 * 0.5, bob + Math.sin(an) * r0 * 0.5); ctx.lineTo(-3 * s + Math.cos(an) * r0, bob + Math.sin(an) * r0 * 0.9); ctx.stroke(); }   /* twigs and fronds stitched on */
  for (let k = 0; k < 8; k++){ const an = k * 0.8 + 0.4; lkOV(ctx, -3 * s + Math.cos(an) * 6.6 * s, bob + Math.sin(an) * 5.8 * s, 1.1 * s, 0.5 * s, k % 2 ? '#8A9A4A' : '#4A5A2A', an); }
  tw_rect(ctx, 2 * s, bob - 1.4 * s, 3 * s, 2.8 * s, '#2A2A1E'); tw_rect(ctx, 6.4 * s, bob - 0.4 * s, 1.4 * s, 1.2 * s, '#4A4E5A');                   /* the stock's cheek rest and the bolt */
  tw_rect(ctx, 4.6 * s, bob - 3.4 * s, 0.9 * s, 1 * s, '#2A2E38'); fillCircle(ctx, 4.8 * s, bob - 2.6 * s, 0.7 * s, aim ? '#FFFFFF' : 'rgba(160,220,255,.8)'); fillCircle(ctx, 4.8 * s, bob - 2.6 * s, 1.1 * s, 'rgba(10,12,16,.4)');   /* the scope's lens */
  tw_rect(ctx, 16.6 * s, bob - 1 * s, 2.8 * s, 2 * s, '#14161C'); for (let k = 0; k < 3; k++) tw_rect(ctx, (16.8 + k * 0.8) * s, bob - 1.2 * s, 0.35 * s, 2.4 * s, '#2A2E38');   /* the suppressor's baffles */
  for (const sd of [-1, 1]) for (let k = 0; k < 3; k++) tw_rect(ctx, (2.6 + k * 0.4) * s, bob + sd * 2.6 * s, 0.25 * s, 0.7 * s, 'rgba(40,30,20,.8)');   /* face paint stripes */
  dt_led(ctx, 6.4 * s, bob - 3.8 * s, 0.4 * s, FD_NAV_R, Math.sin(e.anim * 3) > 0.2);                                                       /* a rangefinder light */
  tw_ln(ctx, [11 * s, bob - 0.8 * s, 14 * s, bob - 4 * s], 0.4 * s, '#C8CCD4'); tw_ln(ctx, [11 * s, bob + 0.8 * s, 14 * s, bob + 4 * s], 0.4 * s, '#C8CCD4');    /* bipod legs */
});
dt_wrap('ft_pyro', null, function(ctx, e, b, dk, bob){
  const s = e.r / 13, fire = e.state === 'burn', wnd = e.state === 'burnwind';
  for (const sd of [-1, 1]){ tw_rr(ctx, -13.4 * s, bob + sd * 2.6 * s - 1.4 * s, 2.4 * s, 2.8 * s, 0.4 * s, '#8A909C'); fillCircle(ctx, -12 * s, bob + sd * 2.6 * s, 0.7 * s, '#C8402A'); tw_rect(ctx, -11 * s, bob + sd * 2.6 * s - 0.25 * s, 3 * s, 0.5 * s, '#4A4E58'); }   /* valves and gauges on the tanks */
  for (const sd of [-1, 1]) for (let k = 0; k < 2; k++) tw_rect(ctx, (-14.4 + k * 5) * s, bob + sd * 2.6 * s - 2 * s, 0.5 * s, 4 * s, '#E8C84A');       /* hazard bands */
  fd_hose(ctx, [-9 * s, bob, -6 * s, bob + 2 * s, 0, bob + 4.6 * s, 6 * s, bob + 2.6 * s], 0.7 * s, '#2A2E38');                                       /* the fuel hose to the nozzle */
  for (const sd of [-1, 1]) tw_rect(ctx, -2 * s, bob + sd * 5.6 * s, 3 * s, 0.4 * s, '#E8E8E0');                                                /* reflective stripes on the arms */
  fillCircle(ctx, 1.4 * s, bob, 3.7 * s, 'rgba(0,0,0,.18)'); tw_rect(ctx, 3.4 * s, bob - 2 * s, 0.8 * s, 4 * s, '#06080C');                       /* the helmet's visor frame */
  for (const [x, y] of [[-2, -4], [1, 5], [-5, 1]]) lkOV(ctx, x * s, bob + y * s, 1.1 * s, 0.7 * s, 'rgba(10,6,4,.4)');                              /* soot */
  tw_rr(ctx, 13 * s, bob - 1.6 * s, 2 * s, 3.2 * s, 0.4 * s, '#4A4E58'); fillCircle(ctx, 18.4 * s, bob, 0.5 * s, wnd || fire ? '#FFE04A' : '#FF8A3A');   /* the nozzle ring and its pilot */
  if (fire) for (let k = 0; k < 4; k++){ const ph = (e.anim * 3 + k * 0.25) % 1; ctx.globalAlpha = 0.6 * (1 - ph); lkOV(ctx, (22 + ph * 12) * s, bob + (k - 1.5) * 1.2 * s, 1.2 * s, 0.7 * s, '#FFB84A'); } ctx.globalAlpha = 1;   /* sparks */
});
dt_wrap('ft_medic', null, function(ctx, e, b, dk, bob){
  const s = e.r / 13, heal = e.state === 'heal', pulse = 0.5 + 0.5 * Math.sin(e.anim * 4);
  for (const sd of [-1, 1]){ tw_rect(ctx, -2.2 * s, bob + sd * 6.6 * s - 0.5 * s, 1.8 * s, 1 * s, '#F4F6FA'); tw_rect(ctx, -1.6 * s, bob + sd * 6.6 * s - 0.2 * s, 0.6 * s, 0.4 * s, '#E0413A'); tw_rect(ctx, -1.5 * s, bob + sd * 6.6 * s - 0.35 * s, 0.4 * s, 0.7 * s, '#E0413A'); }   /* a cross on each shoulder */
  tw_ln(ctx, [-7 * s, bob - 4.4 * s, -7 * s, bob + 4.4 * s], 0.5 * s, '#9AA0AC'); fillCircle(ctx, -7 * s, bob, 0.6 * s, '#C8CCD4');                  /* the bag's zip and its pull */
  tw_ln(ctx, [-9.4 * s, bob - 1.6 * s, -11.6 * s, bob - 1.6 * s], 0.5 * s, '#9AA0AC'); tw_ln(ctx, [-9.4 * s, bob + 1.6 * s, -11.6 * s, bob + 1.6 * s], 0.5 * s, '#9AA0AC');   /* its handles */
  tw_rr(ctx, -10 * s, bob - 5.6 * s, 1.6 * s, 2.6 * s, 0.5 * s, 'rgba(200,236,255,.85)'); tw_ln(ctx, [-9.2 * s, bob - 3 * s, -6 * s, bob - 1 * s], 0.25 * s, '#C8CCD4');   /* an IV bag and its line */
  for (let k = 0; k < 3; k++){ fillCircle(ctx, (-2 + k * 1.4) * s, bob + 5.6 * s, 0.6 * s, '#F4F0E0'); fillCircle(ctx, (-2 + k * 1.4) * s, bob + 5.6 * s, 0.25 * s, '#C8C0B0'); }   /* bandage rolls */
  tw_ln(ctx, [0.6 * s, bob - 3.4 * s, 2 * s, bob - 1.6 * s, 0.6 * s, bob - 0.4 * s], 0.3 * s, '#2A2E38'); fillCircle(ctx, 0.6 * s, bob - 0.2 * s, 0.5 * s, '#9AA0AC');   /* a stethoscope */
  tw_rect(ctx, 3.6 * s, bob - 3.6 * s, 0.5 * s, 7.2 * s, 'rgba(255,255,255,.35)'); tw_ln(ctx, [0.8 * s, bob - 3.7 * s, 0.8 * s, bob + 3.7 * s], 0.3 * s, '#C8CCD4');   /* helmet rim and seam */
  dt_led(ctx, -6 * s, bob + 5 * s, 0.5 * s, FD_NAV_G, Math.sin(e.anim * 3) > -0.3);
  if (heal){ for (let k = 0; k < 5; k++){ const ph = (e.anim * 1.2 + k * 0.2) % 1, an = k * 1.26; ctx.globalAlpha = 0.8 * (1 - ph); tw_rect(ctx, Math.cos(an) * (6 + ph * 14) * s - 0.4 * s, bob + Math.sin(an) * (6 + ph * 14) * s - 1.2 * s, 0.8 * s, 2.4 * s, '#6AE08A'); tw_rect(ctx, Math.cos(an) * (6 + ph * 14) * s - 1.2 * s, bob + Math.sin(an) * (6 + ph * 14) * s - 0.4 * s, 2.4 * s, 0.8 * s, '#6AE08A'); } ctx.globalAlpha = 1; }   /* plus signs drifting out */
  else if (pulse > 0.5) fillCircle(ctx, -6 * s, bob, 0.5 * s, '#6AE08A');
});

/* ---------------- the bosses (drawn live: a few hundred small parts each) ---------------- */
dt_wrap('ft_sergeant', null, function(ctx, e, b, dk, bob){
  const s = e.r / 58, spin = e.state === 'spinwind' || e.state === 'spin', a = e.anim * (spin ? 9 : 1);
  for (let k = 0; k < 14; k++){ const an = k * 0.45; dt_bolt(ctx, -4 * s + Math.cos(an) * 25 * s, bob + Math.sin(an) * 30 * s, 1.1 * s, '#C8CCD4'); }                  /* rivets round the breastplate */
  for (const [x, y] of [[-18, -20], [-6, 14], [8, -8]]) { tw_ln(ctx, [x * s, bob + y * s, (x + 7) * s, bob + (y + 3) * s], 1 * s, 'rgba(20,24,10,.5)'); tw_ln(ctx, [(x + 3) * s, bob + (y - 2) * s, (x + 8) * s, bob + (y - 5) * s], 0.8 * s, 'rgba(20,24,10,.5)'); }   /* dents and scratches */
  for (let k = 0; k < 8; k++) tw_rect(ctx, (-24 + k * 5) * s, bob - 22 * s, 3 * s, 1.2 * s, FD_BRASS);                                              /* the stripe of ammunition across the chest */
  for (let k = 0; k < 7; k++){ const x = (4 + k * 4.4) * s, y = bob + (30 - k * 0.4) * s; tw_rect(ctx, x, y - 0.8 * s, 3 * s, 1.6 * s, FD_BRASS); tw_rect(ctx, x + 1 * s, y - 1.4 * s, 0.8 * s, 2.8 * s, '#5A4A24'); }   /* the belt feeding the gun */
  for (let k = 0; k < 6; k++){ const gy = bob + 25 * s + Math.sin(a + k * 1.05) * 5 * s; fillCircle(ctx, (34 + 54 * 0) * s + k * 3.6 * s, gy, 0.9 * s, '#8A909C'); }   /* the barrels' collar rings */
  for (let k = 0; k < 5; k++) tw_rect(ctx, (8 + k * 4.4) * s, bob + 18 * s, 0.8 * s, 14 * s, '#14181E');                                           /* cooling fins on the gun housing */
  tw_ln(ctx, [28 * s, bob + 19.6 * s, 54 * s, bob + 19.6 * s], 0.8 * s, '#C8CCD4'); tw_ln(ctx, [28 * s, bob + 30.4 * s, 54 * s, bob + 30.4 * s], 0.8 * s, '#C8CCD4');   /* the shroud rails */
  for (let k = 0; k < 4; k++) dt_bolt(ctx, (10 + k * 4.4) * s, bob - 44 * s, 1.1 * s, '#C8CCD4');                                                  /* the riot plate */
  tw_ln(ctx, [10 * s, bob - 40 * s, 16 * s, bob - 34 * s, 12 * s, bob - 28 * s], 1 * s, 'rgba(255,255,255,.5)'); tw_ln(ctx, [20 * s, bob - 30 * s, 24 * s, bob - 24 * s], 0.9 * s, 'rgba(255,255,255,.4)');   /* its cracks */
  for (let k = 0; k < 6; k++) tw_rect(ctx, 8 * s, bob - 52 * s + k * 5.4 * s, 17 * s, 1 * s, k % 2 ? '#E8C84A' : '#1E1E22');                      /* hazard bars on it */
  for (const sd of [-1, 1]){ for (let k = 0; k < 3; k++) fillCircle(ctx, 16 * s + k * 1.6 * s, bob + sd * 14 * s, 0.9 * s, '#E8C84A'); tw_ln(ctx, [10 * s, bob + sd * 17 * s, 22 * s, bob + sd * 17 * s], 0.8 * s, '#14181E'); }   /* helmet bars and a strap */
  dt_led(ctx, 30 * s, bob - 6 * s, 1.2 * s, e.phase > 1 ? FD_NAV_R : '#9AD8F0', true); dt_led(ctx, 30 * s, bob + 6 * s, 1.2 * s, e.phase > 1 ? FD_NAV_R : '#9AD8F0', true);   /* lamps in the visor */
  for (let k = 0; k < 4; k++) fillCircle(ctx, (-16 + k * 3) * s, bob + 12 * s, 0.7 * s, k % 2 ? '#C8CCD4' : '#E8C84A');                           /* medals */
  tw_rect(ctx, 6 * s, bob - 16 * s, 5 * s, 3 * s, '#C8402A'); tw_rect(ctx, 6 * s, bob - 14.4 * s, 5 * s, 0.6 * s, '#F4F0E0');                      /* a flag patch */
  if (spin) for (let k = 0; k < 4; k++){ const q = ctx.globalAlpha; ctx.globalAlpha = 0.4; tw_rect(ctx, (56 + k * 3) * s, bob + 25 * s - 1.4 * s + (k - 1.5) * 2 * s, 5 * s, 0.7 * s, '#FFD88A'); ctx.globalAlpha = q; }   /* the muzzle flicker */
});
dt_wrap('ft_gunship', null, function(ctx, e, b, dk, bob){
  const s = e.r / 62, a = e.anim * 14, pod = e.state === 'rocketwind' || e.state === 'rockets';
  for (let k = 0; k < 4; k++) fd_tip(ctx, 2 * s, bob, a + k * Math.PI / 2, 84 * s, 4.4 * s);                                                       /* rotor tips */
  for (let k = 0; k < 10; k++){ const x = (-34 + k * 7.4) * s; tw_rect(ctx, x, bob - 13 * s, 0.7 * s, 26 * s, 'rgba(0,0,0,.16)'); dt_bolt(ctx, x, bob - 14.6 * s, 0.9 * s, '#8A909C'); dt_bolt(ctx, x, bob + 14.6 * s, 0.9 * s, '#8A909C'); }   /* panel lines and rivets */
  for (const sd of [-1, 1]){ for (let k = 0; k < 7; k++) tw_poly(ctx, [(46 - k * 2.6) * s, bob + sd * (3 + k * 0.4) * s, (47.4 - k * 2.6) * s, bob + sd * (2 + k * 0.4) * s, (48.8 - k * 2.6) * s, bob + sd * (3 + k * 0.4) * s], '#F4F0E0');   /* shark teeth along the nose */
    tw_ln(ctx, [-4 * s, bob + sd * 40 * s - 2 * s, 22 * s, bob + sd * 40 * s - 2 * s], 0.7 * s, '#C8CCD4'); for (let k = 0; k < 6; k++) tw_poly(ctx, [(24 - k * 0 + 0) * s, bob + sd * 40 * s + (k - 2.5) * 1.6 * s, 28 * s, bob + sd * 40 * s + (k - 2.5) * 1.6 * s - 0.6 * s, 28 * s, bob + sd * 40 * s + (k - 2.5) * 1.6 * s + 0.6 * s], pod ? '#FFB84A' : FD_NAV_R);   /* the pods' rocket tips */
    dt_led(ctx, 4 * s, bob + sd * 44 * s, 1.4 * s, sd > 0 ? FD_NAV_R : FD_NAV_G, Math.sin(a * 0.1 + sd) > -0.3); }                                  /* wing-tip lights */
  for (let k = 0; k < 5; k++) tw_ln(ctx, [(-70 + k * 2.4) * s, bob - 1.6 * s, (-70 + k * 2.4) * s, bob + 1.6 * s], 0.5 * s, 'rgba(0,0,0,.3)');          /* tail boom ribs */
  dt_led(ctx, -82 * s, bob - 18 * s, 1.5 * s, '#F4F0E0', Math.sin(a * 0.1) > 0); tw_ln(ctx, [24 * s, bob - 6 * s, 34 * s, bob - 6 * s], 0.7 * s, '#C8CCD4'); tw_ln(ctx, [24 * s, bob + 6 * s, 34 * s, bob + 6 * s], 0.7 * s, '#C8CCD4');   /* a lamp on the tail fin, canopy frame */
  for (let k = 0; k < 3; k++){ tw_rr(ctx, (-30 + k * 3) * s, bob + 18 * s, 2 * s, 3 * s, 0.4 * s, '#10141C'); tw_rr(ctx, (-30 + k * 3) * s, bob - 21 * s, 2 * s, 3 * s, 0.4 * s, '#10141C'); }   /* flare dispensers */
  fillCircle(ctx, 50 * s, bob, 5 * s, '#10141C'); fillCircle(ctx, 50 * s, bob, 3.6 * s, 'rgba(120,190,230,.7)'); fillCircle(ctx, 49 * s, bob - 1 * s, 1.2 * s, '#FFFFFF');   /* the chin sensor ball */
  for (const sd of [-1, 1]) for (let k = 0; k < 3; k++) fillCircle(ctx, (-44 + k * 3) * s, bob + sd * 8 * s, 1 * s, '#FF8A3A');                    /* exhaust glow */
});
dt_wrap('ft_tank', null, function(ctx, e, b, dk, bob){
  const s = e.r / 68, a = e.anim * 1.2, charge = e.state === 'charge' || e.state === 'chargewind', rec = e.state === 'cannon' ? -5 * s : 0;
  for (let k = 0; k < 14; k++){ dt_bolt(ctx, (-50 + k * 7.2) * s, bob - 33 * s, 1.1 * s, '#8A909C'); dt_bolt(ctx, (-50 + k * 7.2) * s, bob + 33 * s, 1.1 * s, '#8A909C'); }   /* the hull's rivet rows */
  for (const sd of [-1, 1]){ for (let k = 0; k < 5; k++){ tw_rect(ctx, (-44 + k * 22 - 1) * s, bob + sd * 40 * s - 11 * s, 2 * s, 22 * s, 'rgba(0,0,0,.25)'); for (let q = 0; q < 6; q++) dt_bolt(ctx, (-44 + k * 22) * s + Math.cos(q * 1.047 + a) * 3.6 * s, bob + sd * 40 * s + Math.sin(q * 1.047 + a) * 3.6 * s, 0.6 * s, '#C8CCD4'); }   /* road-wheel nuts */
    for (let k = 0; k < 8; k++) tw_rect(ctx, (-42 + k * 4) * s, bob + sd * 51 * s - 0.5 * s, 2.4 * s, 1 * s, '#1E2024'); }                           /* spare track links on the fender */
  for (let k = 0; k < 4; k++) tw_ln(ctx, [(-24 + k * 6) * s, bob + 8 * s, (-24 + k * 6) * s, bob + 14 * s], 0.9 * s, '#10121A');                      /* the engine deck's louvres, deeper */
  for (const sd of [-1, 1]) for (let k = 0; k < 3; k++){ tw_rr(ctx, (-30 + k * 3.4) * s, bob + sd * 24 * s - 2 * s, 2.4 * s, 4 * s, 0.5 * s, '#10141C'); }   /* smoke dischargers */
  ctx.save(); ctx.translate(rec, 0);
  fillCircle(ctx, -14 * s, bob - 4 * s, 9 * s, 'rgba(0,0,0,.2)'); for (let k = 0; k < 6; k++){ const an = k * 1.047; tw_rect(ctx, -14 * s + Math.cos(an) * 8 * s - 0.9 * s, bob - 4 * s + Math.sin(an) * 8 * s - 0.9 * s, 1.8 * s, 1.8 * s, '#C8CCD4'); }   /* the commander's cupola ring */
  tw_rect(ctx, -14 * s, bob - 4 * s, 18 * s, 1.4 * s, '#10121A'); fillCircle(ctx, 4 * s, bob - 3.4 * s, 1.6 * s, '#2A2E38');                             /* its machine gun */
  for (let k = 0; k < 4; k++) tw_rect(ctx, (60 + k * 2.6) * s, bob - 4 * s, 1.2 * s, 1.4 * s, '#10121A'); for (let k = 0; k < 4; k++) tw_rect(ctx, (60 + k * 2.6) * s, bob + 2.8 * s, 1.2 * s, 1.4 * s, '#10121A');   /* the muzzle brake's slots */
  tw_rect(ctx, 24 * s, bob - 6 * s, 10 * s, 12 * s, 'rgba(0,0,0,.25)'); tw_rect(ctx, 24 * s, bob - 5 * s, 10 * s, 1 * s, '#C8CCD4');                     /* the fume extractor */
  ctx.restore();
  for (const [x, y] of [[-20, 12], [10, 20], [30, -16]]) lkOV(ctx, x * s, bob + y * s, 7 * s, 4 * s, 'rgba(46,56,22,.4)');                              /* camouflage blotches */
  tw_rect(ctx, 40 * s, bob - 12 * s, 8 * s, 2.4 * s, '#F4F0E0'); tw_rect(ctx, 40 * s, bob - 8 * s, 8 * s, 2.4 * s, '#F4F0E0');                          /* unit stripes */
  for (let k = 0; k < 3; k++){ fillCircle(ctx, (-48 + k * 5) * s, bob - 24 * s, 2.4 * s, '#3A4A24'); tw_rect(ctx, (-50 + k * 5) * s, bob - 24.4 * s, 4 * s, 0.8 * s, '#C8CCD4'); }   /* fuel drums on the rear deck */
  if (charge) for (let k = 1; k < 4; k++) tw_ln(ctx, [(-60 - k * 5) * s, bob - 30 * s, (-70 - k * 5) * s, bob - 30 * s], 0.9 * s, 'rgba(255,255,255,.25)');
});
dt_wrap('ft_colonel', null, function(ctx, e, b, dk, bob){
  const s = e.r / 60, a = e.anim * 1.4, burn = e.state === 'burn' || e.state === 'burnwind';
  for (let k = 0; k < 12; k++){ dt_bolt(ctx, (-34 + k * 5.8) * s, bob - 22 * s, 1 * s, '#E8C84A'); dt_bolt(ctx, (-34 + k * 5.8) * s, bob + 22 * s, 1 * s, '#E8C84A'); }   /* gold rivets */
  for (const sd of [-1, 1]){ for (let k = 0; k < 4; k++) tw_ln(ctx, [(6 + k * 6) * s, bob + sd * 24 * s, (6 + k * 6) * s, bob + sd * 30 * s], 0.9 * s, '#E8C84A');   /* braid on the arms */
    fd_hose(ctx, [-4 * s, bob + sd * 20 * s, 2 * s, bob + sd * 30 * s, 14 * s, bob + sd * 36 * s, 26 * s, bob + sd * 34 * s], 1.4 * s, '#2A2E38');       /* hydraulic hoses to the flamers */
    for (let k = 0; k < 3; k++){ fillCircle(ctx, (8 + k * 8) * s, bob + sd * (30 + k * 1.6) * s, 1.6 * s, '#8A909C'); fillCircle(ctx, (8 + k * 8) * s, bob + sd * (30 + k * 1.6) * s, 0.7 * s, '#2A2E38'); }   /* piston joints */
    tw_rr(ctx, 26 * s, bob + sd * 40 * s - 2 * s, 14 * s, 4 * s, 1 * s, '#4A4E58'); dt_led(ctx, 41 * s, bob + sd * 36 * s, 1.1 * s, burn ? '#FFE04A' : '#FF8A3A', true); }   /* fuel pods and pilot lights */
  for (let k = 0; k < 5; k++){ const x = (-26 + k * 4.4) * s; tw_poly(ctx, [x, bob - 8 * s, x + 1.3 * s, bob - 11 * s, x + 2.6 * s, bob - 8 * s], '#E8C84A'); }   /* stars of rank */
  tw_ln(ctx, [-30 * s, bob - 22 * s, -30 * s, bob - 48 * s], 0.9 * s, '#C8CCD4'); tw_poly(ctx, [-30 * s, bob - 48 * s, -18 * s, bob - 44 * s + Math.sin(a * 3) * 1.4 * s, -30 * s, bob - 40 * s], '#C8402A'); tw_rect(ctx, -26 * s, bob - 46 * s, 4 * s, 0.8 * s, '#F4F0E0');   /* a pennant on a pole */
  ctx.strokeStyle = 'rgba(20,16,8,.7)'; ctx.lineWidth = 1.4 * s; ctx.beginPath(); ctx.moveTo(14 * s, bob - 16 * s); ctx.lineTo(14 * s, bob + 16 * s); ctx.moveTo(-0.5 * s, bob); ctx.lineTo(28 * s, bob); ctx.stroke();   /* the canopy's crossbars */
  for (let k = 0; k < 6; k++){ const an = k * 1.047 + a; dt_bolt(ctx, 14 * s + Math.cos(an) * 17 * s, bob + Math.sin(an) * 17 * s, 0.8 * s, '#E8C84A'); }   /* canopy bolts */
  for (const sd of [-1, 1]) for (let k = 0; k < 3; k++){ fillCircle(ctx, (-36 - k * 3) * s, bob + sd * 8 * s, 1.6 * s, '#2A2E38'); if (burn) fillCircle(ctx, (-36 - k * 3) * s, bob + sd * 8 * s, 0.9 * s, '#FF8A3A'); }   /* exhaust stacks */
  for (let k = 0; k < 4; k++) fillCircle(ctx, (-16 + k * 3) * s, bob + 10 * s, 0.8 * s, k % 2 ? '#C8CCD4' : '#E8C84A');                              /* medals */
});
dt_wrap('ft_maker', null, function(ctx, e, b, dk, bob){
  const s = e.r / 66, a = e.anim * 1.2, ph = e.phase || 1, core = 0.6 + 0.4 * Math.sin(e.anim * (2 + ph)), zap = e.state === 'zapwind' || e.state === 'zap';
  for (let k = 0; k < 14; k++){ const an = k * 0.45; fd_gear(ctx, -6 * s + Math.cos(an) * 34 * s, bob + Math.sin(an) * 30 * s, 1.5 * s, 6, '#3A4A44', a * (k % 2 ? 1 : -1)); }   /* a ring of small gears round the body */
  for (let k = 0; k < 4; k++){ ctx.strokeStyle = 'rgba(154,240,200,' + (0.35 + 0.3 * core) + ')'; ctx.lineWidth = 1.2 * s; ctx.beginPath(); ctx.arc(-6 * s, bob, (12 + k * 3.6) * s, a + k, a + k + 1.9); ctx.stroke(); }   /* coils round the core */
  for (const sd of [-1, 1]) for (let q = 0; q < 3; q++){ const t0 = (e.anim * 0.8 + q * 0.33) % 1; const px = -30 * s + (-34 * s) * t0, py = bob + sd * (6 + q * 6 + 8 * t0) * s; fillCircle(ctx, px, py, 1.2 * s, '#E8FFF4'); }   /* pulses running down the cables */
  for (let k = 0; k < 3; k++){ const an = a * 0.7 + k * 2.09; tw_rr(ctx, Math.cos(an) * 48 * s - 4 * s, bob + Math.sin(an) * 44 * s - 3 * s, 8 * s, 6 * s, 1 * s, 'rgba(122,255,200,.35)'); tw_rect(ctx, Math.cos(an) * 48 * s - 3 * s, bob + Math.sin(an) * 44 * s - 1.4 * s, 6 * s, 0.7 * s, '#E8FFF4'); tw_rect(ctx, Math.cos(an) * 48 * s - 3 * s, bob + Math.sin(an) * 44 * s + 0.4 * s, 4 * s, 0.7 * s, '#9AF0C8'); }   /* holo-panels orbiting */
  for (let k = 0; k < 8; k++) dt_bolt(ctx, 14 * s + Math.cos(k * 0.785) * 17 * s, bob + Math.sin(k * 0.785) * 17 * s, 0.8 * s, '#9AF0C8');          /* the dome's rim bolts */
  ctx.strokeStyle = 'rgba(255,255,255,.4)'; ctx.lineWidth = 0.7 * s; ctx.beginPath(); ctx.arc(14 * s, bob, 13 * s, -2.2, -1.2); ctx.stroke();           /* a reflection on the glass */
  for (const sd of [-1, 1]){ tw_ln(ctx, [18 * s, bob + sd * 5 * s, 24 * s, bob + sd * 5 * s], 0.5 * s, '#2A2E34'); fillCircle(ctx, 22 * s, bob + sd * 2.4 * s, 1.1 * s, 'rgba(255,255,255,.6)'); }   /* spectacle arms */
  for (let k = 0; k < 4; k++) tw_ln(ctx, [12 * s, bob - 6 * s + k * 0.4 * s, 9 * s, bob - 8 * s + k * 1.2 * s], 0.3 * s, '#C8C8C0');              /* wisps of hair */
  for (let k = 0; k < 6; k++){ const an = k * 1.047 + 0.3, mx = 14 * s * 0 + (-6 + Math.cos(an) * 27) * s, my = bob + Math.sin(an) * 24 * s; fillCircle(ctx, mx, my, 1 * s, '#9AF0C8'); ctx.strokeStyle = 'rgba(20,40,32,.6)'; ctx.lineWidth = 0.5 * s; ctx.beginPath(); ctx.arc(mx, my, 1.8 * s, 0, TAU); ctx.stroke(); }   /* vents ringed in the casing */
  if (zap) for (let k = 0; k < 6; k++){ const an = k * 1.05 + a * 3; tw_ln(ctx, [(-6 + Math.cos(an) * 24) * s, bob + Math.sin(an) * 22 * s, (-6 + Math.cos(an + 0.2) * 40) * s, bob + Math.sin(an + 0.2) * 36 * s], 0.7 * s, '#E8FFF4'); }   /* sparks off the casing */
  for (const sd of [-1, 1]) for (let q = 0; q < 3; q++){ const ex = (-6 + (q === 0 ? 20 : q === 1 ? 14 : 8) * 0 + 40 - q * 6) * s; tw_rect(ctx, ex - 1 * s, bob + sd * (58 + q * 3) * s - 0.5 * s, 2 * s, 1 * s, '#C8D8D0'); }
});
