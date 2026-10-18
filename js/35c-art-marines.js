'use strict';
/* Enemy art, Chapter 8: Space Marines (MARINE_DRAW). Chapters 12 and 13 reuse this code. */
/* ======================== Chapter 8: Space Marines ======================== */
/* Earth's marines, seen from above and facing +x: blue-and-white armour, a glass visor, a rifle. Every unit is the
   same base soldier with its own kit, which is what makes them read as one army. A unit's own colour (d.pale) is the
   one accent: chest bar, shoulder stripes and helmet crest. Shared look: gunmetal kit, cyan visor, cyan energy strip.
   Chapter 12 passes d.look = 'a51_*' and the soldier then wears desert camouflage (a51Camo in 35f-art-a51.js). */
const MR8_G0 = '#161A22', MR8_G1 = '#20242E', MR8_G2 = '#2E333F', MR8_G3 = '#4A505E', MR8_ST = '#8A93A8', MR8_VIS = '#7FD8FF', MR8_VIS2 = '#4FA6D6';
const MR8_PAL = {}; let mr8_palN = 0;
/* the tight palette of one unit: hi (lighter), sh (darker, same hue), mid, deep (outlines), and two camouflage tones. Cached by colour pair. */
function mr8_pal(b, dk){
  const k = b + dk; let p = MR8_PAL[k];
  if (!p){
    if (mr8_palN > 240){ for (const q in MR8_PAL) delete MR8_PAL[q]; mr8_palN = 0; }
    p = MR8_PAL[k] = { hi: blendHex(b, '#FFFFFF', 0.26), sh: blendHex(b, dk, 0.5), mid: blendHex(b, dk, 0.22), deep: blendHex(dk, '#080B12', 0.42),
      c1: blendHex(b, dk, 0.52), c3: blendHex(b, '#F2E6BE', 0.42) };
    mr8_palN++;
  }
  return p;
}
function mr8_a51(d){ return !!(d && d.look && d.look.charCodeAt(0) === 97 && d.look.indexOf('a51_') === 0 && typeof a51Camo === 'function'); }
function mr8_rect(ctx, x, y, w, h, c){ ctx.fillStyle = c; ctx.fillRect(x, y, w, h); }

/* the soldier's lower half: life-support pack, striding legs, the torso plate with its shading, chest bar, belt and pouches */
function mr8_lower(ctx, b, dk, pale, s, bob, ph, d, pack){
  const p = mr8_pal(b, dk), ga = ctx.globalAlpha, camo = mr8_a51(d), sw = Math.sin(ph || 0) * 7.2 * s;
  if (pack !== 0){                                                                                                       /* the pack */
    mr8_rect(ctx, -13.6 * s, bob - 5.6 * s, 6.8 * s, 11.2 * s, p.deep); mr8_rect(ctx, -12.8 * s, bob - 4.8 * s, 5.2 * s, 9.6 * s, MR8_G2);
    mr8_rect(ctx, -11.4 * s, bob - 3.6 * s, 1 * s, 7.2 * s, pale);
  }
  for (let k = -1; k <= 1; k += 2){                                                                                      /* legs, boots */
    const y = bob + k * 5 * s, fx = -1 * s + (k > 0 ? sw : -sw);
    lkLN(ctx, [-1 * s, y, fx, y], 4.8 * s, p.deep); lkLN(ctx, [-1 * s, y, fx, y], 3.3 * s, p.sh);
    lkLN(ctx, [fx - 0.6 * s, y, fx + 3.6 * s, y], 4.4 * s, MR8_G1);
  }
  lkOV(ctx, -1 * s, bob, 9.1 * s, 12.7 * s, p.deep);                                                                      /* torso plate */
  lkOV(ctx, -1 * s, bob, 8.2 * s, 11.8 * s, b);
  if (camo) a51Camo(ctx, -1 * s, bob, 8.2 * s, 11.8 * s, 0, p.c1, dk, p.c3, 6);
  ctx.globalAlpha = ga * (camo ? 0.5 : 1);
  lkOV(ctx, -3.8 * s, bob, 4.7 * s, 10.4 * s, p.mid);                                                                     /* back shading */
  lkOV(ctx, 1.8 * s, bob - 0.6 * s, 5.2 * s, 8.4 * s, p.hi);                                                              /* chest plate */
  ctx.globalAlpha = ga;
  mr8_rect(ctx, -0.4 * s, bob - 9.6 * s, 3.4 * s, 19.2 * s, p.deep); mr8_rect(ctx, 0, bob - 9.2 * s, 2.6 * s, 18.4 * s, pale);   /* the accent bar */
  mr8_rect(ctx, -7.4 * s, bob - 9.8 * s, 1.5 * s, 19.6 * s, p.deep);                                                       /* belt */
  for (let k = -1; k <= 1; k += 2){ const y = bob + k * 8.6 * s - 1.7 * s; mr8_rect(ctx, -9.6 * s, y, 4.8 * s, 3.4 * s, MR8_G1); }   /* pouches */
}
/* the upper half: shoulder plates with stripes, ear pods, helmet with crest and visor, antenna. o = { ps: shoulder scale, vis, vis2, crest:false, cross, lamp } */
function mr8_upper(ctx, b, dk, pale, s, bob, d, o){
  const p = mr8_pal(b, dk), camo = mr8_a51(d), ps = (o && o.ps) || 1, vis = (o && o.vis) || MR8_VIS, vis2 = (o && o.vis2) || MR8_VIS2;
  for (let k = -1; k <= 1; k += 2){                                                                                      /* pauldrons */
    const y = bob + k * 11 * s * (ps > 1 ? 1.08 : 1);
    lkOV(ctx, 0, y, 5.4 * s * ps, 4.4 * s * ps, p.deep); lkOV(ctx, 0.3 * s, y, 4.6 * s * ps, 3.6 * s * ps, b);
    if (camo) a51Camo(ctx, 0.3 * s, y, 4.6 * s * ps, 3.6 * s * ps, k > 0 ? 1 : 2, p.c1, dk, p.c3, 3);
    lkOV(ctx, 1.3 * s, y - 1.1 * s * ps, 2.7 * s * ps, 1.3 * s * ps, p.hi);
    lkLN(ctx, [-3.4 * s * ps, y + k * 1 * s, 3.6 * s * ps, y + k * 1 * s], 1.3 * s, pale);
  }
  lkLN(ctx, [0.6 * s, bob + 5.4 * s, -4 * s, bob + 9.8 * s], 0.9 * s, MR8_ST); fillCircle(ctx, -4 * s, bob + 9.8 * s, 1 * s, pale);   /* antenna */
  lkOV(ctx, 1.8 * s, bob - 6.4 * s, 1.9 * s, 2.2 * s, MR8_G2); lkOV(ctx, 1.8 * s, bob + 6.4 * s, 1.9 * s, 2.2 * s, MR8_G2);        /* ear pods */
  fillCircle(ctx, 2.6 * s, bob, 6.7 * s, p.deep); fillCircle(ctx, 2.6 * s, bob, 6 * s, b);                               /* helmet */
  if (camo) a51Camo(ctx, 2.6 * s, bob, 6 * s, 6 * s, 3, p.c1, dk, p.c3, 5);
  lkOV(ctx, 1.1 * s, bob - 2.6 * s, 3.3 * s, 1.9 * s, p.hi, -0.35);                                                      /* dome highlight */
  if (!(o && o.crest === false)) lkLN(ctx, [-2.8 * s, bob, 3.2 * s, bob], 1.4 * s, pale);                                 /* crest stripe */
  if (o && o.cross){ mr8_rect(ctx, -0.8 * s, bob - 3.4 * s, 1.6 * s, 6.8 * s, pale); mr8_rect(ctx, -3.4 * s, bob - 0.8 * s, 6.8 * s, 1.6 * s, pale); }
  if (o && o.lamp){ lkLN(ctx, [-3.6 * s, bob - 5.4 * s, 4.6 * s, bob - 5.4 * s], 1.6 * s, p.deep); fillCircle(ctx, 3.2 * s, bob - 5.4 * s, 1.4 * s, '#FFF2B0'); }
  lkOV(ctx, 5.9 * s, bob, 3 * s, 4.9 * s, MR8_G0);                                                                       /* visor */
  lkOV(ctx, 6 * s, bob, 2.3 * s, 4.2 * s, vis); lkOV(ctx, 6.5 * s, bob + 1.7 * s, 1.5 * s, 2.2 * s, vis2);
  lkOV(ctx, 6.6 * s, bob - 1.7 * s, 0.9 * s, 1.5 * s, '#FFFFFF', -0.25);
}
function mBody(ctx, b, dk, pale, s, bob, ph, d, pack, o){
  mr8_lower(ctx, b, dk, pale, s, bob, ph, d, pack); mr8_upper(ctx, b, dk, pale, s, bob, d, o);
}
/* A detailed marine rifle, seen from above, pointing along +x: stock, receiver with an ejection port, a vented handguard,
   magazine, grip, a top rail with an optic, a barrel with a muzzle brake, and a glowing energy strip in the unit's colour.
   Drawn from x = 3s to 3s + len, so the muzzle sits where the old single line ended. acc (optional): a colour band on the handguard. */
function mRifle(ctx, s, bob, len, glow, heavy, acc){
  const L = Math.max(len, 11 * s), x0 = 3 * s, y = bob + 3 * s, dk1 = MR8_G1, dk2 = MR8_G2, mid = MR8_G3, steel = MR8_ST, ga = ctx.globalAlpha;
  ctx.fillStyle = dk1; ctx.fillRect(x0 - 4.6 * s, y - 1.9 * s, 5.4 * s, 3.8 * s);                                         /* the stock */
  ctx.fillStyle = dk2; ctx.fillRect(x0 - 5.4 * s, y - 2.5 * s, 1.6 * s, 5 * s);                                           /* its butt plate */
  ctx.fillStyle = dk2; ctx.fillRect(x0, y - 2.7 * s, L * 0.42, 5.4 * s);                                                  /* the receiver */
  ctx.strokeStyle = dk1; ctx.lineWidth = 0.8; ctx.strokeRect(x0, y - 2.7 * s, L * 0.42, 5.4 * s);
  ctx.fillStyle = steel; ctx.fillRect(x0 + L * 0.1, y - 2.7 * s, L * 0.13, 1.4 * s);                                      /* the ejection port */
  ctx.fillStyle = mid; ctx.fillRect(x0 + L * 0.42, y - 2.3 * s, L * 0.3, 4.6 * s);                                        /* the handguard */
  ctx.fillStyle = dk1;
  for (let k = 0; k < 2; k++) ctx.fillRect(x0 + L * (0.47 + k * 0.1), y - 1.1 * s, L * 0.04, 2.2 * s);               /* its vents */
  if (acc){ ctx.fillStyle = acc; ctx.fillRect(x0 + L * 0.42, y - 2.3 * s, L * 0.035, 4.6 * s); }                          /* the unit's colour band */
  ctx.fillStyle = dk1; ctx.fillRect(x0 + L * 0.3, y + 2.5 * s, 2.8 * s, (heavy ? 6.4 : 5) * s);                        /* the magazine */
  lkLN(ctx, [x0 + L * 0.17, y + 2.6 * s, x0 + L * 0.13, y + 6.2 * s], 2 * s, dk1);                                         /* the grip */
  lkLN(ctx, [x0 + L * 0.72, y, x0 + L, y], 1.7 * s, steel);                                                              /* the barrel */
  ctx.fillStyle = dk1; ctx.fillRect(x0 + L - 2.4 * s, y - 2.1 * s, 3.2 * s, 4.2 * s);                                     /* the muzzle brake */
  ctx.fillStyle = dk2; ctx.fillRect(x0 + L * 0.1, y - 4.5 * s, L * 0.5, 1.7 * s);                                         /* the top rail */
  fillCircle(ctx, x0 + L * 0.2, y - 4.8 * s, 1.5 * s, dk1); fillCircle(ctx, x0 + L * 0.2, y - 4.8 * s, 0.9 * s, glow);   /* the optic */
  ctx.globalAlpha = ga * 0.9; ctx.fillStyle = glow; ctx.fillRect(x0 + L * 0.04, y - 0.5 * s, L * 0.3, 1 * s); ctx.globalAlpha = ga;   /* the energy strip */
  fillCircle(ctx, x0 + L * 0.58, y + 0.4 * s, 2 * s, MR8_G0); fillCircle(ctx, x0 + L * 0.15, y + 3.2 * s, 1.9 * s, MR8_G0);   /* gloved hands */
}
/* both arms reach the rifle: a sleeve in the armour colour (sl) to the elbow, a dark forearm to the glove. skipL leaves the left arm to the caller. */
function mArms(ctx, s, bob, len, col, sl, glow, acc, skipL){
  const L = Math.max(len, 11 * s), x0 = 3 * s, y = bob + 3 * s, hx = x0 + L * 0.58, hy = y + 0.4 * s, tx = x0 + L * 0.15, ty = y + 3.2 * s;
  sl = sl || col;
  if (!skipL){
    const ex = (0.5 * s + hx) * 0.5 + 0.8 * s, ey = bob - 7.2 * s;
    lkLN(ctx, [0.5 * s, bob - 10.4 * s, ex, ey], 3.8 * s, sl); lkLN(ctx, [ex, ey, hx, hy], 3.2 * s, col); fillCircle(ctx, ex, ey, 1.9 * s, sl);
  }
  const rx = (0.5 * s + tx) * 0.5 - 0.6 * s, ry = bob + 9.6 * s;
  lkLN(ctx, [0.5 * s, bob + 10.4 * s, rx, ry], 3.8 * s, sl); lkLN(ctx, [rx, ry, tx, ty], 3.2 * s, col); fillCircle(ctx, rx, ry, 1.9 * s, sl);
  mRifle(ctx, s, bob, len, glow || MR8_VIS, false, acc);
}
/* the one cheap "generic unit": body, arms, rifle, upper half. */
function mr8_trooper(ctx, e, b, dk, bob, d, s, len, o, glow){
  const p = mr8_pal(b, dk);
  mr8_lower(ctx, b, dk, d.pale, s, bob, e.anim * 1.1, d);
  mArms(ctx, s, bob, len, dk, p.sh, glow, d.pale);
  mr8_upper(ctx, b, dk, d.pale, s, bob, d, o);
}
const MR8_O_HEAVY = { ps: 1.24 };
const MR8_O_ENG = { lamp: true };
const MR8_O_MED = { cross: true, crest: false };
const MR8_O_OP = { vis: '#C9A8FF', vis2: '#8A5CE0' };

const MARINE_DRAW = {
  rifleman(ctx, e, b, dk, bob, wind, d){
    const s = e.r / 14;
    mr8_trooper(ctx, e, b, dk, bob, d, s, 20 * s);
    if (e.state === 'burst') csGlow(ctx, 25 * s, bob + 3 * s, 14, '#FFD870', 0.85);
    if (wind) csGlow(ctx, 25 * s, bob + 3 * s, 8, '#FF5A4A', 0.8);
  },
  jumptrooper(ctx, e, b, dk, bob, wind, d){
    const s = e.r / 14, z = e.z || 0, up = e.state === 'air' || wind, p = mr8_pal(b, dk), pl = d.pale;
    ctx.translate(0, -z);
    if (up){ for (const sy of [-5, 5]){ csGlow(ctx, -14 * s, bob + sy * s, 16 + z * 0.1, '#FF8A2A', 0.75); lkTRI(ctx, -9 * s, bob + (sy - 2.4) * s, -26 * s - z * 0.12, bob + sy * s, -9 * s, bob + (sy + 2.4) * s, '#FFD070'); } }
    /* the jet pack: a cross brace, twin fuel tanks with a colour band, nozzle bells and wing fins */
    mr8_rect(ctx, -10.6 * s, bob - 4.2 * s, 3.6 * s, 8.4 * s, MR8_G2);
    for (const sy of [-1, 1]){
      const y = bob + sy * 5 * s;
      lkTRI(ctx, -8 * s, y + sy * 2.2 * s, -14 * s, y + sy * 6.4 * s, -14 * s, y + sy * 2.2 * s, MR8_G3);
      lkLN(ctx, [-12.4 * s, y, -6.4 * s, y], 5.4 * s, MR8_G1); lkLN(ctx, [-12 * s, y, -7 * s, y], 3.8 * s, '#5A606E');
      mr8_rect(ctx, -10.2 * s, y - 2.8 * s, 1.5 * s, 5.6 * s, pl);
      lkOV(ctx, -13.4 * s, y, 1.7 * s, 3 * s, MR8_G0); lkOV(ctx, -13.8 * s, y, 0.9 * s, 1.8 * s, up ? '#FFD070' : p.deep);
    }
    mr8_trooper(ctx, e, b, dk, bob, d, s, 14 * s, { crest: true });
  },
  riottrooper(ctx, e, b, dk, bob, wind, d){
    const s = e.r / 14, p = mr8_pal(b, dk), pl = d.pale;
    mr8_lower(ctx, b, dk, pl, s, bob, e.anim * 0.9, d);
    /* the riot shield: a curved dark frame, a glowing rim and a faint energy plane, held out by two emitter fists */
    const cx = -4 * s, R = 18 * s;
    ctx.globalAlpha = 0.2; ctx.fillStyle = pl; ctx.beginPath(); ctx.arc(cx, bob, R + 3.4 * s, -0.95, 0.95); ctx.arc(cx, bob, R - 0.6 * s, 0.95, -0.95, true); ctx.closePath(); ctx.fill(); ctx.globalAlpha = 1;
    ctx.lineCap = 'round'; ctx.strokeStyle = p.deep; ctx.lineWidth = 4.6 * s; ctx.beginPath(); ctx.arc(cx, bob, R, -0.95, 0.95); ctx.stroke();
    ctx.strokeStyle = p.sh; ctx.lineWidth = 3 * s; ctx.beginPath(); ctx.arc(cx, bob, R, -0.9, 0.9); ctx.stroke();
    ctx.strokeStyle = pl; ctx.lineWidth = 1.2 * s; ctx.beginPath(); ctx.arc(cx, bob, R + 1.4 * s, -0.86, 0.86); ctx.stroke(); ctx.lineCap = 'butt';
    for (const sy of [-1, 1]){
      lkLN(ctx, [0.5 * s, bob + sy * 10.8 * s, 6.4 * s, bob + sy * 9.6 * s], 4.4 * s, p.sh); lkLN(ctx, [6.4 * s, bob + sy * 9.6 * s, 12 * s, bob + sy * 6 * s], 3.8 * s, dk);
      fillCircle(ctx, 6.4 * s, bob + sy * 9.6 * s, 2.3 * s, p.deep); fillCircle(ctx, 6.4 * s, bob + sy * 9.6 * s, 1.5 * s, b);
      mr8_rect(ctx, 11 * s, bob + sy * 6 * s - 2.2 * s, 4.2 * s, 4.4 * s, MR8_G1); fillCircle(ctx, 13.4 * s, bob + sy * 6 * s, 1.5 * s, pl);          /* emitter nodes */
    }
    mr8_upper(ctx, b, dk, pl, s, bob, d, MR8_O_HEAVY);
    if (wind) csGlow(ctx, 20 * s, bob, 26 * s, '#FFFFFF', 0.6);
  },
  droppod(ctx, e, b, dk, bob, wind, d){
    if (e.state === 'fall') return;                                      /* it is still coming down: the marker draws it */
    const r = e.r, p = mr8_pal(b, dk), pl = d.pale, V = TAU / 6;
    ctx.fillStyle = 'rgba(255,140,60,' + (e.stateT > 2.3 ? 0.5 : 0) + ')'; ctx.beginPath(); ctx.arc(0, 0, r + 6, 0, TAU); ctx.fill();
    for (let k = 0; k < 6; k++){ const a = k * V; lkLN(ctx, [Math.cos(a) * (r - 2), Math.sin(a) * (r - 2), Math.cos(a) * (r + 4), Math.sin(a) * (r + 4)], 4.4, p.deep); fillCircle(ctx, Math.cos(a) * (r + 4), Math.sin(a) * (r + 4), 2.6, MR8_G2); }   /* landing feet */
    ctx.fillStyle = p.deep; ctx.beginPath(); for (let k = 0; k < 6; k++){ const a = k * V; ctx.lineTo(Math.cos(a) * (r + 2), Math.sin(a) * (r + 2)); } ctx.closePath(); ctx.fill();
    ctx.fillStyle = p.sh; ctx.beginPath(); for (let k = 0; k < 6; k++){ const a = k * V; ctx.lineTo(Math.cos(a) * (r - 1.2), Math.sin(a) * (r - 1.2)); } ctx.closePath(); ctx.fill();
    for (let k = 0; k < 6; k += 2){ const a = k * V, a2 = a + V; lkTRI(ctx, 0, 0, Math.cos(a) * (r - 1.6), Math.sin(a) * (r - 1.6), Math.cos(a2) * (r - 1.6), Math.sin(a2) * (r - 1.6), b); }   /* alternate hull panels */
    ctx.strokeStyle = p.deep; ctx.lineWidth = 1.2; ctx.beginPath(); for (let k = 0; k < 6; k++){ const a = k * V; ctx.moveTo(0, 0); ctx.lineTo(Math.cos(a) * (r - 1.2), Math.sin(a) * (r - 1.2)); } ctx.stroke();
    ctx.globalAlpha = 0.28; fillCircle(ctx, -r * 0.42, r * 0.3, r * 0.3, '#14100E'); fillCircle(ctx, r * 0.34, -r * 0.46, r * 0.2, '#14100E'); ctx.globalAlpha = 1;   /* re-entry scorching */
    fillCircle(ctx, 0, 0, r * 0.52, p.deep); fillCircle(ctx, 0, 0, r * 0.44, MR8_G2);                                    /* the hatch */
    ctx.strokeStyle = pl; ctx.lineWidth = 1.8; ctx.beginPath(); ctx.arc(0, 0, r * 0.44, 0, TAU); ctx.stroke();
    ctx.strokeStyle = MR8_G0; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(-r * 0.36, 0); ctx.lineTo(r * 0.36, 0); ctx.moveTo(0, -r * 0.36); ctx.lineTo(0, r * 0.36); ctx.stroke();
    fillCircle(ctx, 0, 0, 2.6, MR8_G0); fillCircle(ctx, 0, 0, 1.4, MR8_ST);
    const blink = e.stateT < 1.0 ? Math.sin(e.anim * 9) > 0 : Math.sin(e.anim * 3) > 0.4;                 /* the hatch lights speed up before it opens */
    for (let k = 0; k < 6; k++){ const a = k / 6 * TAU + 0.5; fillCircle(ctx, Math.cos(a) * (r - 6), Math.sin(a) * (r - 6), 1.8, blink ? pl : '#4A2A18'); }
  },
  attackdrone(ctx, e, b, dk, bob, wind, d){
    const p = mr8_pal(b, dk), pl = d.pale;
    lkLN(ctx, [-6, bob - 6, 6, bob + 6], 2.4, p.deep); lkLN(ctx, [-6, bob + 6, 6, bob - 6], 2.4, p.deep);
    lkLN(ctx, [-6, bob - 6, 6, bob + 6], 1.2, dk); lkLN(ctx, [-6, bob + 6, 6, bob - 6], 1.2, dk);
    for (const px of [-6, 6]) for (const py of [-6, 6]){ fillCircle(ctx, px, bob + py, 3.1, MR8_G1); drawRotor(ctx, px, bob + py, 4.8, 2, G.time * 70 + px * py, '#5A5E68'); }
    lkLN(ctx, [3, bob - 2.8, 9.4, bob - 2.8], 1.5, MR8_G1); lkLN(ctx, [3, bob + 2.8, 9.4, bob + 2.8], 1.5, MR8_G1);            /* gun pods */
    fillCircle(ctx, 9.6, bob - 2.8, 0.9, wind ? '#FF5A4A' : MR8_ST); fillCircle(ctx, 9.6, bob + 2.8, 0.9, wind ? '#FF5A4A' : MR8_ST);
    lkLN(ctx, [-4.6, bob, -9.4, bob], 1, MR8_ST); fillCircle(ctx, -9.4, bob, 1, pl);                                                      /* antenna */
    lkOV(ctx, 0, bob, 6.8, 5.6, p.deep); lkOV(ctx, 0, bob, 6, 4.8, b); lkOV(ctx, -1.2, bob - 1.4, 3.2, 1.7, p.hi);
    lkLN(ctx, [-5, bob + 2.4, 1, bob + 2.4], 1.1, p.sh); lkLN(ctx, [-5.4, bob - 3, 0, bob - 3], 0.9, pl);                                 /* panel line, colour stripe */
    fillCircle(ctx, 3, bob, 2.9, MR8_G0); fillCircle(ctx, 3, bob, 2.2, wind ? '#FFFFFF' : pl); fillCircle(ctx, 3.7, bob - 0.7, 0.7, '#FFFFFF');   /* the eye */
    if (wind) csGlow(ctx, 3, bob, 12, '#FF5A4A', 0.8);
  },
  bladeguard(ctx, e, b, dk, bob, wind, d){
    const s = e.r / 14, rot = wind ? -1.2 : e.state === 'dash' ? 0.1 : e.state === 'back' ? 1.3 : 0.2, p = mr8_pal(b, dk), pl = d.pale;
    if (e.state === 'dash') for (let k = 1; k <= 3; k++) csGlow(ctx, -k * 10 * s, bob, 12 * s, pl, 0.45 - k * 0.1);
    mr8_lower(ctx, b, dk, pl, s, bob, e.anim * 1.2, d);
    lkLN(ctx, [0.5 * s, bob - 10.4 * s, 4.6 * s, bob - 8 * s], 3.6 * s, p.sh); lkLN(ctx, [4.6 * s, bob - 8 * s, 8 * s, bob - 4.4 * s], 3.2 * s, dk);   /* the off arm with a vambrace */
    fillCircle(ctx, 8 * s, bob - 4.4 * s, 2 * s, MR8_G0); lkLN(ctx, [5 * s, bob - 7.4 * s, 7 * s, bob - 5.4 * s], 1.4 * s, pl);
    lkLN(ctx, [0.5 * s, bob + 10.4 * s, 4 * s, bob + 8.6 * s], 3.6 * s, p.sh); lkLN(ctx, [4 * s, bob + 8.6 * s, 5 * s, bob + 5 * s], 3.2 * s, dk);
    mr8_upper(ctx, b, dk, pl, s, bob, d);
    ctx.save(); ctx.translate(5 * s, bob + 5 * s); ctx.rotate(rot);                                       /* the sword, swung about the fist */
    lkLN(ctx, [-3.6 * s, 0, 2.4 * s, 0], 3.2 * s, MR8_G1); fillCircle(ctx, -4.2 * s, 0, 1.9 * s, MR8_ST);   /* grip, pommel */
    lkLN(ctx, [-2 * s, 0, 1.6 * s, 0], 1.2 * s, MR8_G3);
    lkLN(ctx, [2.8 * s, -4.6 * s, 2.8 * s, 4.6 * s], 2.2 * s, '#C8CCD6'); lkLN(ctx, [2.8 * s, -4.6 * s, 2.8 * s, 4.6 * s], 0.9 * s, MR8_G3);   /* guard */
    ctx.fillStyle = MR8_G1; ctx.beginPath(); ctx.moveTo(4 * s, -2.4 * s); ctx.lineTo(33 * s, -2.7 * s); ctx.lineTo(42 * s, 0); ctx.lineTo(33 * s, 2.7 * s); ctx.lineTo(4 * s, 2.4 * s); ctx.closePath(); ctx.fill();
    ctx.fillStyle = pl; ctx.beginPath(); ctx.moveTo(4.4 * s, -1.7 * s); ctx.lineTo(33 * s, -2 * s); ctx.lineTo(40 * s, 0); ctx.lineTo(33 * s, 2 * s); ctx.lineTo(4.4 * s, 1.7 * s); ctx.closePath(); ctx.fill();
    lkLN(ctx, [6 * s, 0, 36 * s, 0], 1.2 * s, '#FFFFFF');                                                  /* the white core */
    csGlow(ctx, 22 * s, 0, wind ? 24 : 13, pl, wind ? 0.9 : 0.55); ctx.restore();
  },
  lancer(ctx, e, b, dk, bob, wind, d){
    const s = e.r / 14, dash = e.state === 'dash', p = mr8_pal(b, dk), pl = d.pale, y = bob + 2 * s, fl = Math.sin(e.anim * 2.2) * 1.6 * s;
    if (dash) for (let k = 1; k <= 4; k++) csGlow(ctx, -k * 12 * s, bob, 14 * s, pl, 0.5 - k * 0.1);
    mr8_lower(ctx, b, dk, pl, s, bob, e.anim * 1.2, d);
    for (const sy of [-1, 1]){ const hx = sy < 0 ? 9 * s : 1 * s, hy = y + (sy < 0 ? 0 : 0.4 * s); lkLN(ctx, [0.5 * s, bob + sy * 10.4 * s, 4.6 * s, bob + sy * 7 * s], 3.8 * s, p.sh); lkLN(ctx, [4.6 * s, bob + sy * 7 * s, hx, hy], 3.2 * s, dk); }
    lkLN(ctx, [-6 * s, y, 38 * s, y], 3.4 * s, MR8_G1); lkLN(ctx, [-6 * s, y, 38 * s, y], 1.7 * s, MR8_ST);   /* the lance shaft */
    mr8_rect(ctx, -4.4 * s, y - 1.8 * s, 3 * s, 3.6 * s, MR8_G0); mr8_rect(ctx, 5.6 * s, y - 1.8 * s, 3 * s, 3.6 * s, MR8_G0);      /* grips */
    lkOV(ctx, 13.6 * s, y, 1.5 * s, 4.6 * s, MR8_G1); lkOV(ctx, 13.8 * s, y, 0.8 * s, 3.6 * s, pl);                              /* the hand guard */
    ctx.globalAlpha = 0.9; for (let k = 0; k < 4; k++) mr8_rect(ctx, (19 + k * 4.6) * s, y - 1.2 * s, 2.4 * s, 2.4 * s, pl); ctx.globalAlpha = 1;   /* energy conduit */
    mr8_rect(ctx, 36 * s, y - 3 * s, 2 * s, 6 * s, MR8_G1);
    lkTRI(ctx, 37 * s, y - 4.4 * s, 53 * s, y, 37 * s, y + 4.4 * s, MR8_G1);
    lkTRI(ctx, 38 * s, y - 3.2 * s, 51.4 * s, y, 38 * s, y + 3.2 * s, pl); lkLN(ctx, [38 * s, y, 49 * s, y], 1 * s, '#FFFFFF');   /* the head */
    lkTRI(ctx, 29 * s, y + 1 * s, 21 * s, y + 7 * s + fl, 25 * s, y + 1 * s, pl);                                              /* the pennon */
    csGlow(ctx, 46 * s, y, wind ? 22 : dash ? 20 : 10, pl, wind ? 0.95 : 0.7);
    mr8_upper(ctx, b, dk, pl, s, bob, d);
  },
  shocktrooper(ctx, e, b, dk, bob, wind, d){
    const s = e.r / 14, p = mr8_pal(b, dk), pl = d.pale, zz = Math.sin(e.anim * 9) * 1.2 * s;
    mr8_lower(ctx, b, dk, pl, s, bob, e.anim * 1.2, d);
    mr8_rect(ctx, -9.6 * s, bob + 4.6 * s, 4.4 * s, 4.2 * s, MR8_G1); fillCircle(ctx, -7.4 * s, bob + 6.7 * s, 1 * s, pl);          /* the battery */
    lkCV(ctx, -7.4 * s, bob + 6.7 * s, 0 * s, bob + 15 * s, 5 * s, bob + 7 * s, 1.1 * s, MR8_G3);                                   /* power cable */
    lkLN(ctx, [0.5 * s, bob - 10.4 * s, 4.4 * s, bob - 8 * s], 3.6 * s, p.sh); lkLN(ctx, [4.4 * s, bob - 8 * s, 8 * s, bob - 4 * s], 3.2 * s, dk);
    lkLN(ctx, [0.5 * s, bob + 10.4 * s, 3 * s, bob + 9 * s], 3.6 * s, p.sh); lkLN(ctx, [3 * s, bob + 9 * s, 5.4 * s, bob + 6.4 * s], 3.2 * s, dk);
    mr8_upper(ctx, b, dk, pl, s, bob, d);
    ctx.save(); ctx.translate(5 * s, bob + 6 * s); ctx.rotate(wind ? -1.1 : 0.15);                  /* the shock baton */
    lkLN(ctx, [-2 * s, 0, 24 * s, 0], 3.8 * s, MR8_G1); lkLN(ctx, [4 * s, 0, 22 * s, 0], 1.2 * s, MR8_G3);
    for (let k = 0; k < 3; k++) mr8_rect(ctx, (11 + k * 4) * s, -2.8 * s, 1.5 * s, 5.6 * s, pl);   /* coils */
    fillCircle(ctx, 25.4 * s, 0, 4.6 * s, MR8_G0); fillCircle(ctx, 25.4 * s, 0, 3.4 * s, pl); fillCircle(ctx, 25.4 * s, 0, 1.5 * s, '#FFFFFF');
    lkLN(ctx, [29 * s, -3 * s, 31 * s, -zz, 30 * s, zz * 0.5, 33 * s, 3 * s], 1 * s, wind ? '#FFFFFF' : pl);                                  /* the arc */
    lkLN(ctx, [21 * s, -4.8 * s, 24 * s, -6.2 * s - zz, 27 * s, -4.4 * s], 0.9 * s, pl);
    csGlow(ctx, 25 * s, 0, wind ? 20 : 11, pl, wind ? 0.95 : 0.6);
    ctx.restore();
  },
  engineer(ctx, e, b, dk, bob, wind, d){
    const s = e.r / 14, p = mr8_pal(b, dk), pl = d.pale;
    mr8_rect(ctx, -17 * s, bob - 8.6 * s, 11 * s, 17.2 * s, p.deep); mr8_rect(ctx, -16 * s, bob - 7.6 * s, 9 * s, 15.2 * s, MR8_G2);            /* tool pack */
    lkLN(ctx, [-14.4 * s, bob - 5 * s, -9.2 * s, bob - 5 * s], 3.4 * s, MR8_G1); lkLN(ctx, [-14.4 * s, bob + 5 * s, -9.2 * s, bob + 5 * s], 3.4 * s, MR8_G1);   /* gas bottles */
    mr8_rect(ctx, -12.4 * s, bob - 7 * s, 1.2 * s, 14 * s, pl);
    for (const sy of [-1, 1]){                                                                                                           /* jointed tool arms */
      const ey = bob + sy * 13 * s;
      lkLN(ctx, [-11 * s, bob + sy * 4 * s, -5 * s, ey], 2.6 * s, MR8_ST); lkLN(ctx, [-5 * s, ey, 4 * s, bob + sy * 14 * s], 2.2 * s, '#B9C1D2');
      fillCircle(ctx, -5 * s, ey, 1.7 * s, MR8_G1); fillCircle(ctx, -11 * s, bob + sy * 4 * s, 1.5 * s, MR8_G1);
    }
    lkLN(ctx, [4 * s, bob - 14 * s, 8 * s, bob - 16.4 * s], 1.4 * s, MR8_ST); lkLN(ctx, [4 * s, bob - 14 * s, 8 * s, bob - 11.6 * s], 1.4 * s, MR8_ST);   /* claw */
    lkLN(ctx, [4 * s, bob + 14 * s, 9 * s, bob + 14 * s], 1.8 * s, MR8_G3); fillCircle(ctx, 9.6 * s, bob + 14 * s, 1.1 * s, wind ? '#FFFFFF' : pl);    /* torch */
    mr8_lower(ctx, b, dk, pl, s, bob, e.anim * 1.1, d, 0);
    mArms(ctx, s, bob, 8 * s, dk, p.sh, '#FFE080', pl);
    mr8_upper(ctx, b, dk, pl, s, bob, d, MR8_O_ENG);
    if (wind){ const sp = Math.sin(e.anim * 20) > 0; csGlow(ctx, 16 * s, bob + 4 * s, 14 * s, sp ? '#FFFFFF' : '#FFE080', 0.9); }
  },
  medic(ctx, e, b, dk, bob, wind, d){
    const s = e.r / 14, p = mr8_pal(b, dk), pl = d.pale;
    mr8_rect(ctx, -16 * s, bob - 7.8 * s, 10 * s, 15.6 * s, p.deep); mr8_rect(ctx, -15.2 * s, bob - 7 * s, 8.4 * s, 14 * s, '#C8D0DC');   /* med pack */
    mr8_rect(ctx, -15.2 * s, bob - 7 * s, 8.4 * s, 2.2 * s, p.sh); mr8_rect(ctx, -15.2 * s, bob + 4.8 * s, 8.4 * s, 2.2 * s, p.sh);
    mr8_lower(ctx, b, dk, pl, s, bob, e.anim * 1.1, d, 0);
    mArms(ctx, s, bob, 10 * s, dk, p.sh, '#7CFFB0', pl);
    mr8_rect(ctx, -13 * s, bob - 1.6 * s, 7 * s, 3.2 * s, pl); mr8_rect(ctx, -11.2 * s, bob - 3.4 * s, 3.4 * s, 6.8 * s, pl);                  /* the green cross on the pack */
    for (const sy of [-1, 1]){ mr8_rect(ctx, -8.6 * s, bob + sy * 11 * s - 0.5 * s, 3.6 * s, 1 * s, pl); mr8_rect(ctx, -7.3 * s, bob + sy * 11 * s - 1.8 * s, 1 * s, 3.6 * s, pl); }   /* cross on the shoulders */
    mr8_upper(ctx, b, dk, pl, s, bob, d, MR8_O_MED);
    fillCircle(ctx, -15 * s, bob - 6.4 * s, 1.2 * s, Math.sin(e.anim * 2.4) > 0 ? pl : p.deep);                                          /* the beacon */
    if (e.healTgtT > 0) csGlow(ctx, 8 * s, bob, 18 * s, '#7CFFB0', 0.4);
  },
  siegebreaker(ctx, e, b, dk, bob, wind, d){
    const s = e.r / 11, up = wind, rec = e.state === 'recover', fx = (up ? 15 : 19) * s, fy = bob - (up ? 20 : 9) * s, p = mr8_pal(b, dk), pl = d.pale;
    mr8_rect(ctx, -16 * s, bob - 8.6 * s, 10 * s, 17.2 * s, p.deep); mr8_rect(ctx, -15 * s, bob - 7.6 * s, 8 * s, 15.2 * s, MR8_G1);       /* the armoured pack */
    for (let k = 0; k < 3; k++) mr8_rect(ctx, (-14 + k * 2.6) * s, bob - 5.4 * s, 1.2 * s, 10.8 * s, MR8_G3);
    if (rec) csGlow(ctx, 20 * s, bob, 30 * s, pl, 0.4);
    mr8_lower(ctx, b, dk, pl, s, bob, e.anim * 0.8, d, 0);
    for (let k = 0; k < 3; k++) mr8_rect(ctx, (-5 + k * 3.2) * s, bob - 11.2 * s, 2.4 * s, 22.4 * s, 'rgba(8,11,18,.28)');                      /* back plating */
    lkLN(ctx, [1 * s, bob + 10.4 * s, 5.6 * s, bob + 8 * s], 4.6 * s, p.sh); lkLN(ctx, [5.6 * s, bob + 8 * s, 10 * s, bob + 4 * s], 4 * s, dk);
    fillCircle(ctx, 10 * s, bob + 4 * s, 2.4 * s, MR8_G0);
    lkLN(ctx, [1 * s, bob - 10.4 * s, fx, fy], 5 * s, dk); lkLN(ctx, [1 * s, bob - 10.4 * s, fx, fy], 2.8 * s, p.sh);                       /* the arm is the haft */
    mr8_upper(ctx, b, dk, pl, s, bob, d, MR8_O_HEAVY);
    const hr = up ? 8 : 7, ha = Math.atan2(fy - (bob - 10.4 * s), fx - 1 * s);                                                           /* the sledge head */
    ctx.save(); ctx.translate(fx, fy); ctx.rotate(ha);
    mr8_rect(ctx, -5.2 * s, -hr * s - 1.4 * s, 10.4 * s, (hr * 2 + 2.8) * s, p.deep); mr8_rect(ctx, -4.2 * s, -hr * s, 8.4 * s, hr * 2 * s, '#3A4658');
    mr8_rect(ctx, -4.2 * s, -hr * s, 2.6 * s, hr * 2 * s, '#56647C');
    mr8_rect(ctx, -5.6 * s, -hr * s - 1.6 * s, 11.2 * s, 2.2 * s, pl); mr8_rect(ctx, -5.6 * s, hr * s - 0.6 * s, 11.2 * s, 2.2 * s, pl);       /* impact plates */
    fillCircle(ctx, 0, 0, 2 * s, MR8_G0); fillCircle(ctx, 0, 0, 1 * s, MR8_ST);
    ctx.restore();
    if (up) csGlow(ctx, fx, fy, 24, pl, 0.9);
  },
  shadowop(ctx, e, b, dk, bob, wind, d){
    ctx.globalAlpha = e.vis === undefined ? 0.1 : e.vis;               /* mostly invisible until it commits */
    const s = e.r / 8, p = mr8_pal(b, dk), pl = d.pale, fl = Math.sin(e.anim * 1.8) * 1.5 * s;
    lkTRI(ctx, -6 * s, bob - 7 * s, -17 * s, bob - 8 * s + fl, -8 * s, bob - 1 * s, p.sh);                                               /* the cloak tails */
    lkTRI(ctx, -6 * s, bob + 7 * s, -17 * s, bob + 8 * s - fl, -8 * s, bob + 1 * s, p.sh);
    lkTRI(ctx, -8 * s, bob - 3 * s, -20 * s, bob - fl * 0.5, -8 * s, bob + 3 * s, dk);
    mr8_lower(ctx, b, dk, pl, s, bob, e.anim * 1.3, d, 0);
    mArms(ctx, s, bob, 6 * s, dk, p.sh, pl, pl);
    ctx.strokeStyle = pl; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.ellipse(-1 * s, bob, 8.4 * s, 12 * s, 0, 0, TAU); ctx.stroke();
    lkLN(ctx, [-5 * s, bob - 8 * s, -5 * s, bob + 8 * s], 0.8 * s, pl);                                                                  /* light strips */
    mr8_upper(ctx, b, dk, pl, s, bob, d, MR8_O_OP);
    if (e.state === 'wind' || e.state === 'dash'){ lkLN(ctx, [4 * s, bob + 4 * s, 26 * s, bob + 4 * s], 2.4 * s, '#E8E0FF'); csGlow(ctx, 26 * s, bob + 4 * s, 16, pl, 0.9); }
  },
  breacher(ctx, e, b, dk, bob, wind, d){
    const s = e.r / 8, p = mr8_pal(b, dk), pl = d.pale;
    mr8_lower(ctx, b, dk, pl, s, bob, e.anim * 1.1, d);
    for (let k = -2; k <= 2; k++){ lkLN(ctx, [-4 * s + k * 1.4 * s, bob - 9.6 * s, 1 * s + k * 1.4 * s, bob + 9.6 * s], 0.9 * s, '#5C2A1E'); }   /* the grenade bandolier */
    mArms(ctx, s, bob, 4 * s, dk, p.sh, pl, pl);
    mr8_rect(ctx, 5.6 * s, bob - 8.6 * s, 11 * s, 17.2 * s, MR8_G0); mr8_rect(ctx, 6.4 * s, bob - 7.8 * s, 9.4 * s, 15.6 * s, '#8A3220');   /* the satchel charge */
    mr8_rect(ctx, 6.4 * s, bob - 7.8 * s, 9.4 * s, 2 * s, '#B24E30'); mr8_rect(ctx, 6.4 * s, bob + 5.8 * s, 9.4 * s, 2 * s, '#B24E30');
    for (let k = 0; k < 2; k++) mr8_rect(ctx, (7.4 + k * 3) * s, bob - 5.4 * s, 1.1 * s, 10.8 * s, '#4A1A12');
    mr8_rect(ctx, 12.4 * s, bob - 2.4 * s, 2.6 * s, 4.8 * s, MR8_G0);                                                                       /* timer window */
    const on = Math.sin((e.fuse === undefined ? 3 : e.fuse) * (10 + (3.2 - (e.fuse || 3)) * 6)) > 0;
    mr8_upper(ctx, b, dk, pl, s, bob, d, MR8_O_HEAVY);
    fillCircle(ctx, 11.4 * s, bob, 2 * s, on ? '#FF3A2A' : '#4A1A12'); if (on) csGlow(ctx, 11.4 * s, bob, 12, '#FF3A2A', 0.8);
  },
  sentryturret(ctx, e, b, dk, bob, wind, d){
    const p = mr8_pal(b, dk), pl = d.pale;
    for (let k = 0; k < 3; k++){ const a = k * TAU / 3 + 0.52, ca = Math.cos(a), sa = Math.sin(a); lkLN(ctx, [ca * 8, sa * 8, ca * 16, sa * 16], 3.4, p.deep); fillCircle(ctx, ca * 16, sa * 16, 2.4, MR8_G1); }   /* tripod */
    fillCircle(ctx, 0, 0, 12.6, p.deep); fillCircle(ctx, 0, 0, 11.2, p.sh); fillCircle(ctx, 0, 0, 9.4, b);
    for (let k = 0; k < 4; k++){ const a = k * TAU / 4 + 0.78; fillCircle(ctx, Math.cos(a) * 10.4, Math.sin(a) * 10.4, 1.5, MR8_G1); }
    ctx.strokeStyle = pl; ctx.lineWidth = 1; ctx.globalAlpha = 0.6; ctx.beginPath(); ctx.arc(0, 0, 7.6, 0.4, 2.2); ctx.stroke(); ctx.globalAlpha = 1;   /* warning arc */
    mr8_rect(ctx, -6, -7.6, 11, 15.2, MR8_G1); mr8_rect(ctx, -5, -6.6, 9, 13.2, MR8_G2); mr8_rect(ctx, -3.6, -6.6, 2, 13.2, MR8_G3);        /* the gun body */
    mr8_rect(ctx, -6.6, 4.6, 5, 5.6, MR8_G0); mr8_rect(ctx, -5.8, 5.4, 3.4, 4, '#5A5E68');                                                    /* ammo box */
    lkCV(ctx, -2.6, 5.4, 0, 3, 3, 3.4, 1.1, MR8_ST);
    mr8_rect(ctx, 6, -8.8, 3.4, 17.6, p.deep); mr8_rect(ctx, 6.6, -8, 2.2, 16, b);                                                          /* gun shield */
    for (const sy of [-3.4, 3.4]){
      mr8_rect(ctx, 3, sy - 2.6, 5, 5.2, MR8_G2); lkLN(ctx, [9.4, sy, 20, sy], 2.6, MR8_G3); lkLN(ctx, [20, sy, 24, sy], 2.2, MR8_ST);
      mr8_rect(ctx, 22, sy - 2.4, 3.4, 4.8, MR8_G1); mr8_rect(ctx, 12, sy - 1.6, 1.2, 3.2, MR8_G0); mr8_rect(ctx, 15, sy - 1.6, 1.2, 3.2, MR8_G0);
      ctx.fillStyle = pl; ctx.globalAlpha = 0.85; ctx.fillRect(10, sy - 0.5, 7, 1); ctx.globalAlpha = 1;
    }
    fillCircle(ctx, 0.4, 0, 3, MR8_G0); fillCircle(ctx, 0.4, 0, 2, pl); fillCircle(ctx, 0.9, -0.6, 0.7, '#FFFFFF');                        /* the sensor */
    lkLN(ctx, [-5, -6.4, -8.4, -10], 0.9, MR8_ST); fillCircle(ctx, -8.4, -10, 1, pl);
    if (e.state === 'burst') csGlow(ctx, 23, 0, 12, '#FFE080', 0.9);
    const left = e.life === undefined ? 14 : e.life; if (left < 3 && Math.sin(e.anim * 8) > 0) fillCircle(ctx, -6, 0, 2, '#FF3A2A');
  },
  /* ---- bosses ---- */
  sergeant(ctx, e, b, dk, bob, wind, d){
    const s = e.r / 11, p = mr8_pal(b, dk), pl = d.pale, fl = Math.sin(e.anim * 1.5) * 1.6 * s;
    ctx.fillStyle = p.deep; ctx.beginPath(); ctx.moveTo(-2 * s, bob - 11 * s); ctx.lineTo(-19 * s + fl, bob - 8 * s); ctx.lineTo(-22 * s, bob); ctx.lineTo(-19 * s - fl, bob + 8 * s); ctx.lineTo(-2 * s, bob + 11 * s); ctx.closePath(); ctx.fill();   /* the command cloak */
    ctx.fillStyle = dk; ctx.beginPath(); ctx.moveTo(-2 * s, bob - 9.6 * s); ctx.lineTo(-17.6 * s + fl, bob - 6.8 * s); ctx.lineTo(-20 * s, bob); ctx.lineTo(-17.6 * s - fl, bob + 6.8 * s); ctx.lineTo(-2 * s, bob + 9.6 * s); ctx.closePath(); ctx.fill();
    lkLN(ctx, [-12 * s, bob - 7 * s, -17 * s, bob - 5 * s], 1 * s, pl); lkLN(ctx, [-12 * s, bob + 7 * s, -17 * s, bob + 5 * s], 1 * s, pl);
    mr8_lower(ctx, b, dk, pl, s, bob, e.anim * 0.9, d);
    for (let k = 0; k < 2; k++){ const x = -8.6 * s - k * 2 * s; lkLN(ctx, [x + 3 * s, bob - 3.6 * s, x, bob, x + 3 * s, bob + 3.6 * s], 1.5 * s, pl); }   /* rank chevrons on the back */
    mr8_rect(ctx, -9.4 * s, bob + 8.2 * s, 2.6 * s, 4.4 * s, MR8_G0);                                                                          /* holster */
    mArms(ctx, s, bob, 28 * s, dk, p.sh, '#FFB040', pl, e.state === 'wind');
    if (e.state === 'wind'){ lkLN(ctx, [0.5 * s, bob - 10.4 * s, 6 * s, bob - 16 * s], 3.8 * s, p.sh); lkLN(ctx, [6 * s, bob - 16 * s, 12 * s, bob - 22 * s], 3.4 * s, dk); fillCircle(ctx, 12 * s, bob - 22 * s, 2 * s, MR8_G0); csGlow(ctx, 13 * s, bob - 23 * s, 20, '#FFB040', 0.9); }
    mr8_upper(ctx, b, dk, pl, s, bob, d, MR8_O_HEAVY);
    ctx.fillStyle = p.deep; ctx.fillRect(-3.6 * s, bob - 2.2 * s, 13 * s, 4.4 * s); ctx.fillStyle = pl; ctx.fillRect(-3 * s, bob - 1.4 * s, 12 * s, 2.8 * s);   /* the command crest on the helmet */
    for (let k = 0; k < 3; k++) fillCircle(ctx, (-1 + k * 3.6) * s, bob, 0.6 * s, p.deep);
    fillCircle(ctx, -3 * s, bob - 13 * s, 2.4 * s, '#FFE080'); fillCircle(ctx, -3 * s, bob + 13 * s, 2.4 * s, '#FFE080');
    fillCircle(ctx, -3 * s, bob - 13 * s, 1.2 * s, '#C79A2A'); fillCircle(ctx, -3 * s, bob + 13 * s, 1.2 * s, '#C79A2A');
    if (e.state === 'burst') csGlow(ctx, 31 * s, bob + 3 * s, 18, '#FFD870', 0.9);
  },
  spotter(ctx, e, b, dk, bob, wind, d){
    const s = e.r / 12, p = mr8_pal(b, dk), pl = d.pale;
    ctx.strokeStyle = MR8_ST; ctx.lineWidth = 2 * s; ctx.beginPath(); ctx.moveTo(-8 * s, bob); ctx.lineTo(-16 * s, bob - 8 * s); ctx.moveTo(-8 * s, bob); ctx.lineTo(-16 * s, bob + 8 * s); ctx.stroke();
    lkLN(ctx, [-8 * s, bob, -16 * s, bob], 2.4 * s, MR8_G2);
    ctx.save(); ctx.translate(-16 * s, bob); ctx.rotate(G.time * 1.4);                                                  /* the radar dish, turning */
    ctx.fillStyle = p.deep; ctx.beginPath(); ctx.ellipse(0, 0, 10.4 * s, 4.8 * s, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = '#C8D0DC'; ctx.beginPath(); ctx.ellipse(0, 0, 9 * s, 4 * s, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = '#8A93A8'; ctx.beginPath(); ctx.ellipse(0, 0, 6 * s, 2.5 * s, 0, 0, TAU); ctx.fill();
    ctx.strokeStyle = '#5A6478'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.ellipse(0, 0, 9 * s, 4 * s, 0, 0, TAU); ctx.stroke();
    lkLN(ctx, [0, 0, 8 * s, 0], 1.2 * s, MR8_G1); fillCircle(ctx, 0, 0, 1.4 * s, MR8_G1); fillCircle(ctx, 8 * s, 0, 1 * s, pl);
    ctx.restore();
    lkLN(ctx, [-9 * s, bob - 7 * s, -13 * s, bob - 13 * s], 0.9 * s, MR8_ST); fillCircle(ctx, -13 * s, bob - 13 * s, 1.1 * s, pl);   /* radio whip */
    mr8_lower(ctx, b, dk, pl, s, bob, e.anim * 0.9, d, 0);
    lkLN(ctx, [0.5 * s, bob - 10.4 * s, 5 * s, bob - 7.4 * s], 3.8 * s, p.sh); lkLN(ctx, [5 * s, bob - 7.4 * s, 9 * s, bob - 3 * s], 3.2 * s, dk);
    lkLN(ctx, [0.5 * s, bob + 10.4 * s, wind ? 7 * s : 5 * s, wind ? bob + 16 * s : bob + 7.4 * s], 3.8 * s, p.sh);
    lkLN(ctx, [wind ? 7 * s : 5 * s, wind ? bob + 16 * s : bob + 7.4 * s, wind ? 14 * s : 9 * s, wind ? bob + 22 * s : bob + 3 * s], 3.2 * s, dk);
    if (wind){ lkLN(ctx, [14 * s, bob + 22 * s, 14 * s, bob + 22 * s + 4], 3 * s, MR8_G1); csGlow(ctx, 14 * s, bob + 24 * s, 28, pl, 0.9); }
    else { mr8_rect(ctx, 8.6 * s, bob - 3.6 * s, 4.4 * s, 7.2 * s, MR8_G1); mr8_rect(ctx, 9.4 * s, bob - 2.6 * s, 2.6 * s, 5.2 * s, pl); fillCircle(ctx, 9 * s, bob - 3 * s, 1.5 * s, MR8_G0); fillCircle(ctx, 9 * s, bob + 3 * s, 1.5 * s, MR8_G0); }   /* the held range-finder */
    mr8_upper(ctx, b, dk, pl, s, bob, d, { ps: 1.14, vis: '#9AF0FF', vis2: '#5CC8E8' });
    lkLN(ctx, [6 * s, bob - 4.4 * s, 9.6 * s, bob - 4.4 * s], 1.8 * s, MR8_G1); lkLN(ctx, [6 * s, bob + 4.4 * s, 9.6 * s, bob + 4.4 * s], 1.8 * s, MR8_G1);   /* twin binocular tubes on the brow */
    fillCircle(ctx, 9.8 * s, bob - 4.4 * s, 1 * s, pl); fillCircle(ctx, 9.8 * s, bob + 4.4 * s, 1 * s, pl);
  },
  colossus(ctx, e, b, dk, bob, wind, d){
    const s = e.r / 23, z = e.z || 0, p = mr8_pal(b, dk), pl = d.pale, camo = mr8_a51(d);
    if (e.state === 'air') csGlow(ctx, -6, 0, 40 + z * 0.2, '#FF8A3A', 0.6);
    ctx.translate(0, -z);
    const st = Math.sin(e.anim * 0.55) * 8 * s;
    for (const sy of [-1, 1]){                                                                                         /* the legs: thigh, knee, foot with toe blocks */
      const fx = sy < 0 ? st : -st, fy = bob + sy * 20 * s;
      lkLN(ctx, [0, bob + sy * 12 * s, fx * 0.6, bob + sy * 16 * s], 7 * s, p.deep);
      lkOV(ctx, fx, fy, 12.6 * s, 8.6 * s, p.deep); lkOV(ctx, fx, fy, 11.4 * s, 7.4 * s, dk);
      for (let k = -1; k <= 1; k++) mr8_rect(ctx, fx + 8.4 * s, fy + k * 4.4 * s - 1.5 * s, 4.4 * s, 3 * s, MR8_G1);
      lkOV(ctx, fx - 1 * s, fy, 5.6 * s, 4 * s, p.sh); fillCircle(ctx, fx * 0.6, bob + sy * 16 * s, 2.8 * s, MR8_G1);
    }
    for (const w of [[31, 27, p.deep], [27.4, 23.4, p.sh]]){                                                           /* hull rim, hull */
      ctx.fillStyle = w[2]; ctx.beginPath(); for (let k = 0; k < 8; k++){ const a = k / 8 * TAU + Math.PI / 8; ctx.lineTo(Math.cos(a) * w[0] * s, bob + Math.sin(a) * w[1] * s); } ctx.closePath(); ctx.fill();
    }
    ctx.fillStyle = b; ctx.beginPath(); for (let k = 0; k < 8; k++){ const a = k / 8 * TAU + Math.PI / 8; ctx.lineTo(Math.cos(a) * 24 * s - 1.4 * s, bob + Math.sin(a) * 20.4 * s); } ctx.closePath(); ctx.fill();
    if (camo) a51Camo(ctx, -1.4 * s, bob, 21 * s, 17.4 * s, 0, p.c1, dk, p.c3);
    ctx.strokeStyle = p.deep; ctx.lineWidth = 1.4 * s; ctx.beginPath(); ctx.moveTo(-8 * s, bob - 22 * s); ctx.lineTo(-8 * s, bob + 22 * s); ctx.moveTo(-24 * s, bob); ctx.lineTo(24 * s, bob);
    ctx.moveTo(4 * s, bob - 21 * s); ctx.lineTo(4 * s, bob - 11 * s); ctx.moveTo(4 * s, bob + 11 * s); ctx.lineTo(4 * s, bob + 21 * s); ctx.stroke();   /* panel seams */
    for (let k = 0; k < 8; k++){ const a = k / 8 * TAU + Math.PI / 8; fillCircle(ctx, Math.cos(a) * 25.4 * s, bob + Math.sin(a) * 21.8 * s, 1.5 * s, p.hi); }   /* rivets */
    for (let k = 0; k < 3; k++) mr8_rect(ctx, (-22 + k * 3.4) * s, bob - 4 * s, 2 * s, 8 * s, MR8_G1);                  /* engine grille */
    for (const sy of [-1, 1]){ fillCircle(ctx, -26.4 * s, bob + sy * 9 * s, 3 * s, MR8_G0); fillCircle(ctx, -26.4 * s, bob + sy * 9 * s, 1.9 * s, pl); }   /* thrusters */
    for (const sy of [-1, 1]){                                                                                         /* side missile pods */
      const y = bob + sy * 27 * s;
      mr8_rect(ctx, -13 * s, y - 5.6 * s, 20 * s, 11.2 * s, p.deep); mr8_rect(ctx, -12 * s, y - 4.6 * s, 18 * s, 9.2 * s, MR8_G1);
      mr8_rect(ctx, -12 * s, y - 4.6 * s, 18 * s, 2.2 * s, MR8_G2);
      for (let k = 0; k < 3; k++) fillCircle(ctx, 4 * s, y - 3 * s + k * 3 * s, 1.4 * s, pl);
      mr8_rect(ctx, -10 * s, y - 0.6 * s, 10 * s, 1.2 * s, pl);
    }
    const spin = e.state === 'burst' ? G.time * 45 : 0;                                                                /* the gatling arm */
    mr8_rect(ctx, 9 * s, bob - 22 * s, 14 * s, 13 * s, p.deep); mr8_rect(ctx, 10 * s, bob - 21 * s, 12 * s, 11 * s, MR8_G1); mr8_rect(ctx, 10 * s, bob - 21 * s, 12 * s, 3 * s, MR8_G2);
    lkOV(ctx, 14 * s, bob - 22.4 * s, 4.4 * s, 3 * s, MR8_G2);
    for (let k = 0; k < 3; k++){ const oy = Math.sin(spin + k * 2.1) * 3 * s; lkLN(ctx, [22 * s, bob - 15.5 * s + oy, 50 * s, bob - 15.5 * s + oy], 3 * s, '#3A3E48'); }
    mr8_rect(ctx, 30 * s, bob - 21 * s, 2.4 * s, 11 * s, MR8_G0); mr8_rect(ctx, 41 * s, bob - 21 * s, 2.4 * s, 11 * s, MR8_G0); mr8_rect(ctx, 48.4 * s, bob - 20 * s, 3 * s, 9 * s, MR8_G0);
    mr8_rect(ctx, 10 * s, bob + 9 * s, 16 * s, 15 * s, p.deep); mr8_rect(ctx, 11 * s, bob + 10 * s, 14 * s, 13 * s, MR8_G1);       /* the cannon arm */
    lkLN(ctx, [24 * s, bob + 16 * s, 44 * s, bob + 16 * s], 6.6 * s, MR8_G0); lkLN(ctx, [10 * s, bob + 16 * s, 44 * s, bob + 16 * s], 5.2 * s, '#2A2E38');
    lkLN(ctx, [24 * s, bob + 14.4 * s, 44 * s, bob + 14.4 * s], 1.2 * s, MR8_G3);
    for (let k = 0; k < 3; k++) mr8_rect(ctx, (27 + k * 4.4) * s, bob + 12 * s, 1.6 * s, 8 * s, MR8_G0);
    fillCircle(ctx, 44 * s, bob + 16 * s, 3.8 * s, MR8_G0); fillCircle(ctx, 44 * s, bob + 16 * s, 2.8 * s, pl);
    lkOV(ctx, 12 * s, bob, 10.8 * s, 13.6 * s, p.deep); lkOV(ctx, 12 * s, bob, 9 * s, 12 * s, MR8_VIS);                 /* the canopy */
    lkOV(ctx, 13.6 * s, bob + 3.6 * s, 6.2 * s, 7.4 * s, MR8_VIS2);
    ctx.strokeStyle = p.deep; ctx.lineWidth = 1.3 * s; ctx.beginPath(); ctx.moveTo(6.4 * s, bob - 10 * s); ctx.lineTo(6.4 * s, bob + 10 * s); ctx.stroke();
    lkOV(ctx, 14 * s, bob - 3.4 * s, 3 * s, 4 * s, '#FFFFFF', -0.2);
    if (e.state === 'burst') csGlow(ctx, 51 * s, bob - 15.5 * s, 24, '#FFB040', 0.95);
    if (e.state === 'wind') ringPath(ctx, 0, bob, 36 * s, 3, '#FFFFFF', 0.6);
  },
  warden(ctx, e, b, dk, bob, wind, d){
    const s = e.r / 40, pull = e.state === 'pull', t = G.time, p = mr8_pal(b, dk), pl = d.pale;
    csGlow(ctx, 0, bob, 78 * s * (pull ? 1.3 : 1), pl, pull ? 0.5 : 0.28);
    for (let k = 0; k < 3; k++){
      const r = (58 - k * 11) * s * (pull ? 0.8 + 0.1 * Math.sin(t * 8 + k) : 1), a = t * (1.1 + k * 0.7) * (k % 2 ? -1 : 1);
      ringPath(ctx, 0, bob, r, 1, pl, 0.28);                                                                             /* the orbit track */
      ctx.strokeStyle = pl; ctx.lineWidth = (4 - k) * s; ctx.globalAlpha = 0.9 - k * 0.15;
      ctx.beginPath(); ctx.arc(0, bob, r, a, a + TAU * 0.72); ctx.stroke();
      ctx.globalAlpha = 1;
      fillCircle(ctx, Math.cos(a) * r, bob + Math.sin(a) * r, 4 * s, '#FFFFFF'); fillCircle(ctx, Math.cos(a) * r, bob + Math.sin(a) * r, 2 * s, pl);
    }
    ctx.globalAlpha = 1;
    fillCircle(ctx, 0, bob, 28.4 * s, p.deep); fillCircle(ctx, 0, bob, 25.4 * s, b);                                      /* the armoured shell */
    ctx.lineWidth = 6 * s;
    for (let k = 0; k < 8; k++){ ctx.strokeStyle = k % 2 ? p.sh : p.mid; ctx.beginPath(); ctx.arc(0, bob, 22.4 * s, k * TAU / 8 + 0.04, (k + 1) * TAU / 8 - 0.04); ctx.stroke(); }   /* plates */
    fillCircle(ctx, 0, bob, 18.6 * s, p.deep);
    ctx.fillStyle = MR8_G1; ctx.beginPath(); for (let k = 0; k < 6; k++){ const a = k / 6 * TAU; ctx.lineTo(Math.cos(a) * 16 * s, bob + Math.sin(a) * 16 * s); } ctx.closePath(); ctx.fill();
    ctx.strokeStyle = pl; ctx.lineWidth = 1.2 * s; ctx.globalAlpha = 0.8; ctx.stroke(); ctx.globalAlpha = 1;
    for (let k = 0; k < 6; k++){ const a = k / 6 * TAU; fillCircle(ctx, Math.cos(a) * 16 * s, bob + Math.sin(a) * 16 * s, 1.8 * s, pl); }
    csGlow(ctx, 0, bob, 18 * s, pl, 0.9); fillCircle(ctx, 0, bob, 8 * s, pl); fillCircle(ctx, 0, bob, 3.6 * s, '#FFFFFF');
    ringPath(ctx, 0, bob, 11 * s + Math.sin(t * 4) * 1.2 * s, 1.4 * s, '#FFFFFF', 0.55);
    lkOV(ctx, 19.6 * s, bob, 7.4 * s, 9.4 * s, MR8_G0); lkOV(ctx, 19.8 * s, bob, 6 * s, 8 * s, MR8_VIS);                 /* the sensor eye */
    lkOV(ctx, 20.8 * s, bob + 2.4 * s, 3.6 * s, 4.6 * s, MR8_VIS2); lkOV(ctx, 21.4 * s, bob - 2.6 * s, 1.6 * s, 2.4 * s, '#FFFFFF', -0.2);
    mr8_rect(ctx, 17 * s, bob - 0.5 * s + Math.sin(t * 2.2) * 5 * s, 6 * s, 1 * s, MR8_G1);                                /* the scan line */
  },
  admiral(ctx, e, b, dk, bob, wind, d){
    const s = e.r / 36, t = G.time, p = mr8_pal(b, dk), pl = d.pale, camo = mr8_a51(d);
    for (const sy of [-1, 1]){ csGlow(ctx, -46 * s, bob + sy * 26 * s, 26 * s, '#7FE8FF', 0.7); lkTRI(ctx, -38 * s, bob + sy * 24 * s, -70 * s - Math.sin(t * 30) * 4, bob + sy * 26 * s, -38 * s, bob + sy * 30 * s, '#BFF4FF'); }
    ctx.fillStyle = p.deep; ctx.beginPath(); ctx.moveTo(63 * s, bob); ctx.lineTo(-8 * s, bob - 71 * s); ctx.lineTo(-45 * s, bob - 57 * s); ctx.lineTo(-27 * s, bob - 16 * s); ctx.lineTo(-45 * s, bob); ctx.lineTo(-27 * s, bob + 16 * s); ctx.lineTo(-45 * s, bob + 57 * s); ctx.lineTo(-8 * s, bob + 71 * s); ctx.closePath(); ctx.fill();
    ctx.fillStyle = dk; ctx.beginPath(); ctx.moveTo(62 * s, bob); ctx.lineTo(-8 * s, bob - 70 * s); ctx.lineTo(-44 * s, bob - 56 * s); ctx.lineTo(-26 * s, bob - 16 * s); ctx.lineTo(-44 * s, bob); ctx.lineTo(-26 * s, bob + 16 * s); ctx.lineTo(-44 * s, bob + 56 * s); ctx.lineTo(-8 * s, bob + 70 * s); ctx.closePath(); ctx.fill();
    ctx.fillStyle = p.mid; ctx.beginPath(); ctx.moveTo(56 * s, bob); ctx.lineTo(-6 * s, bob - 62 * s); ctx.lineTo(-36 * s, bob - 50 * s); ctx.lineTo(-20 * s, bob - 14 * s); ctx.lineTo(-38 * s, bob); ctx.lineTo(-20 * s, bob + 14 * s); ctx.lineTo(-36 * s, bob + 50 * s); ctx.lineTo(-6 * s, bob + 62 * s); ctx.closePath(); ctx.fill();
    for (const sy of [-1, 1]){
      if (camo) a51Camo(ctx, 2 * s, bob + sy * 30 * s, 18 * s, 22 * s, sy < 0 ? 1 : 2, p.c1, dk, p.c3);
      lkTRI(ctx, 50 * s, bob + sy * 3 * s, 0, bob + sy * 54 * s, -14 * s, bob + sy * 46 * s, b);                                          /* leading armour plate */
      lkTRI(ctx, 50 * s, bob + sy * 3 * s, -14 * s, bob + sy * 46 * s, 10 * s, bob + sy * 3 * s, p.hi);
      lkTRI(ctx, -16 * s, bob + sy * 44 * s, -33 * s, bob + sy * 48 * s, -20 * s, bob + sy * 15 * s, p.sh);                               /* trailing plate */
      for (let k = 1; k <= 3; k++) fillCircle(ctx, (44 - k * 14) * s, bob + sy * (k * 13 + 2) * s, 1.8 * s, k % 2 ? pl : '#FFFFFF');      /* wing lights */
      fillCircle(ctx, -6 * s, bob + sy * 56 * s, 4.4 * s, MR8_G0); lkLN(ctx, [-6 * s, bob + sy * 56 * s, 12 * s, bob + sy * 56 * s], 2.6 * s, MR8_G0);   /* wing-tip guns */
      lkLN(ctx, [4 * s, bob + sy * 56 * s, 12 * s, bob + sy * 56 * s], 1.2 * s, MR8_ST);
    }
    ctx.strokeStyle = 'rgba(20,30,50,.55)'; ctx.lineWidth = 1.4; ctx.beginPath(); for (let k = 1; k <= 3; k++){ ctx.moveTo(40 * s - k * 16 * s, bob - 8 * s - k * 12 * s); ctx.lineTo(40 * s - k * 16 * s, bob + 8 * s + k * 12 * s); } ctx.stroke();
    for (const sy of [-1, 1]){
      mr8_rect(ctx, -2 * s, bob + sy * 36 * s - 4.6 * s, 23 * s, 9.2 * s, p.deep); mr8_rect(ctx, -1 * s, bob + sy * 36 * s - 3.6 * s, 21 * s, 7.2 * s, MR8_G1);
      for (let k = 0; k < 3; k++) fillCircle(ctx, 16 * s, bob + sy * 36 * s - 2.4 * s + k * 2.4 * s, 1.4 * s, '#FF6A5A');                      /* missile racks */
      mr8_rect(ctx, 0, bob + sy * 36 * s - 0.5 * s, 10 * s, 1 * s, MR8_G3);
      mr8_rect(ctx, -41 * s, bob + sy * 26 * s - 5 * s, 12 * s, 10 * s, p.deep); mr8_rect(ctx, -40 * s, bob + sy * 26 * s - 4 * s, 10 * s, 8 * s, MR8_G2);   /* engine nacelles */
    }
    ctx.fillStyle = p.deep; ctx.beginPath(); ctx.ellipse(-4 * s, bob, 27 * s, 14 * s, 0, 0, TAU); ctx.fill();                              /* the bridge */
    ctx.fillStyle = b; ctx.beginPath(); ctx.ellipse(-4 * s, bob, 22.6 * s, 10.6 * s, 0, 0, TAU); ctx.fill();
    lkOV(ctx, -14 * s, bob, 8 * s, 6 * s, p.sh); lkLN(ctx, [-14 * s, bob, -28 * s, bob], 1.2 * s, MR8_ST); fillCircle(ctx, -28 * s, bob, 1.6 * s, pl);   /* the tower and its mast */
    lkOV(ctx, 14 * s, bob, 10 * s, 7 * s, MR8_G0); lkOV(ctx, 14 * s, bob, 9 * s, 6 * s, MR8_VIS);
    lkOV(ctx, 16 * s, bob + 1.6 * s, 5.6 * s, 3.4 * s, MR8_VIS2); lkOV(ctx, 16 * s, bob - 1.8 * s, 3 * s, 2 * s, '#FFFFFF');
    if (e.state === 'cross' || e.state === 'wind') csGlow(ctx, 0, bob, 36 * s, e.state === 'cross' ? '#FF6A5A' : '#FFFFFF', 0.6);
  }
};





