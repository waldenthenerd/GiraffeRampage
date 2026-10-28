'use strict';
/* The Siege films (Chapter 15). */
/* ========================= THE SIEGE FILMS ========================= */
/* Two films in the same format as the Tower's (MARS_FILMS: end, starts, scene, over, cues): the helicopter brings her home at dusk to a town with smoke over it, and she drops in
   beside the militia (the start of Chapter 15); and, at the end, the morning after: the Warden smoking at the edge of town, the militia on their sandbags, the hatch in the
   Square lifting a crack, and one small drone slipping away east over the grass toward the waterhole (the end of Chapter 15, which closes nothing). Every frame is a pure
   function of time. */
const SG_FLIGHT_T = { B: 8, C: 16, END: 24 };
const SG_OUT_T = { B: 8, C: 15, END: 22 };
const SG_FLIGHT_CAPS = [
  [0.8, 'HOME', 'The grass, the acacias, and a light that is wrong', 3.2],
  [4.2, 'SMOKE ON THE HORIZON', 'Three columns, where there should be none', 3.2],
  [8.6, 'LONGNECK TOWN', 'The Hall, the lighthouse, the launchpad', 3.0],
  [12.0, 'THEY CAME BY THE ROAD', 'Machines, in a line, and the glimmer behind them', 3.4],
  [16.6, 'THE MILITIA', 'Sandbags, rifles, and a lot of tired giraffes', 3.2],
  [20.2, 'HOLD THE LINE', 'The herd is in the Burrows. The town is not', 3.4]
];
const SG_OUT_CAPS = [
  [0.8, 'MORNING', 'The smoke is thinner, and the siren has stopped', 3.4],
  [4.4, 'THE WARDEN', 'Down at the edge of town, still smoking', 3.0],
  [8.6, 'THE SQUARE', 'The hatch lifts a crack, and then a hoof', 3.2],
  [12.0, 'ALL CLEAR?', 'Not quite. The Hall is still standing, though', 3.0],
  [15.6, 'ONE SMALL DRONE', 'It slips away east over the grass', 3.2],
  [19.0, 'TOWARD THE WATERHOLE', 'With a little green light on its belly', 3.0]
];
const SG_HELI_PAL = { g: '#3A4A52', gd: '#222C32', gl: '#566A74', ink: '#10161A', band: '#E8C84A' };
function sgDusk(ctx, t, k){ afSky(ctx, '#1A1030', '#7A3050', '#F08A3A'); csStars(ctx, 0.5 * (1 - k), t, 0, 0); csGlow(ctx, 980, 430, 260, '#FFB060', 0.35); fillCircle(ctx, 980, 440, 54, '#FFD890'); }
function sgMorning(ctx, t){ afSky(ctx, '#3A4A78', '#E89A7A', '#FFD8A0'); csGlow(ctx, 300, 430, 280, '#FFE6B0', 0.4); fillCircle(ctx, 300, 450, 48, '#FFF2D0'); }
function sgGround(ctx, gy, c1, c2, scroll){
  ctx.fillStyle = c1; ctx.fillRect(0, gy, CS_W, CS_H - gy); ctx.fillStyle = c2; ctx.fillRect(0, gy, CS_W, 6);
  for (let k = 0; k < 40; k++){ const x = ((k * 97 - scroll * 0.6) % (CS_W + 100) + CS_W + 100) % (CS_W + 100) - 50; ctx.fillStyle = 'rgba(0,0,0,.16)'; ctx.fillRect(x, gy + 14 + (k % 5) * 18, 36 + (k % 3) * 14, 3); }
}
function sgAcacia(ctx, x, gy, s){ ctx.fillStyle = '#120A14'; ctx.fillRect(x - 3 * s, gy - 70 * s, 6 * s, 70 * s); ctx.beginPath(); ctx.ellipse(x, gy - 76 * s, 62 * s, 16 * s, 0, 0, TAU); ctx.fill(); ctx.beginPath(); ctx.ellipse(x - 26 * s, gy - 62 * s, 36 * s, 10 * s, 0, 0, TAU); ctx.fill(); }
function sgSmoke(ctx, x, gy, t, h, a){
  for (let k = 0; k < 16; k++){ const u = (k / 16 + t * 0.07) % 1, y = gy - u * h, w = 10 + u * 70, drift = Math.sin(t * 0.6 + k) * 8 + u * 60; ctx.fillStyle = 'rgba(40,30,34,' + (a * (1 - u) * 0.8).toFixed(3) + ')'; ctx.beginPath(); ctx.ellipse(x + drift, y, w, w * 0.7, 0, 0, TAU); ctx.fill(); }
  csGlow(ctx, x, gy - 6, 70, '#FF6A2A', 0.35 * a);
}
/* the town from the edge of the grass, in silhouette: houses, the Hall's bell tower, the lighthouse and the launch tower */
/* what the town looks like at the end: the keys that were wrecked, and how scarred it is (G.sgFilm is written when the run ends, in js/siege/44zzzh-siege-events.js; a replay from the menu
   has no run, so it is worked out from the best the player has done) */
const SG_FILM_CLEAN = { wrecked: [], scars: 0, held: 25, flawless: false };            /* the town before the night: what the arrival film shows */
function sgFilmState(){
  if (G.sgFilm) return G.sgFilm;
  const d = Save.data || {}, flaw = !!d.siegeFlawless, held = flaw ? 25 : (d.siegeHeldBest | 0) || 12;
  return { wrecked: [], scars: flaw ? 4 : 30 + (25 - held) * 3, held: held, flawless: flaw };
}
const SG_SMOKE_X = { lighthouse: 250, library: 430, hall: 640, post: 850, mission: 1010 };
function sgSkyline(ctx, gy, k, t, glow, st){
  st = st || SG_FILM_CLEAN;
  const col = '#1A0E1A', lit = 'rgba(255,200,120,.8)', down = function(key){ return st.wrecked.indexOf(key) >= 0; };
  const dmg = Math.min(0.8, st.wrecked.length * 0.18 + st.scars / 260), thr = st.flawless ? 0.2 : 0.4 + dmg * 0.45;      /* fewer lit windows the more the town has lost */
  ctx.fillStyle = col; ctx.fillRect(0, gy - 6, CS_W, 12);
  for (let i = 0; i < 18; i++){ const x = 40 + i * 70 + csR(i + 77) * 20, h = (50 + csR(i + 5) * 80) * k, w = 46 + csR(i + 9) * 26; ctx.fillStyle = col; ctx.fillRect(x, gy - h, w, h + 4); ctx.beginPath(); ctx.moveTo(x - 4, gy - h); ctx.lineTo(x + w / 2, gy - h - 24 * k); ctx.lineTo(x + w + 4, gy - h); ctx.closePath(); ctx.fill(); if (csR(i + 31) > thr){ ctx.fillStyle = lit; ctx.fillRect(x + 10, gy - h + 18 * k, 8 * k, 10 * k); } }
  const hx = 640, hallDown = down('hall'), hh = (hallDown ? 118 : 190) * k;                  /* Herd Hall: a square tower with a gold bell, or what is left of it */
  ctx.fillStyle = col; ctx.fillRect(hx - 70 * k, gy - 96 * k, 140 * k, 100 * k); ctx.fillRect(hx - 26 * k, gy - hh - 30 * k, 52 * k, hh + 34 * k);
  if (hallDown){ ctx.beginPath(); ctx.moveTo(hx - 26 * k, gy - hh - 30 * k); ctx.lineTo(hx - 12 * k, gy - hh - 44 * k); ctx.lineTo(hx - 2 * k, gy - hh - 32 * k); ctx.lineTo(hx + 10 * k, gy - hh - 50 * k); ctx.lineTo(hx + 26 * k, gy - hh - 30 * k); ctx.fill(); }
  else { ctx.beginPath(); ctx.moveTo(hx - 34 * k, gy - hh - 30 * k); ctx.lineTo(hx, gy - hh - 80 * k); ctx.lineTo(hx + 34 * k, gy - hh - 30 * k); ctx.fill(); fillCircle(ctx, hx, gy - hh + 20 * k, 9 * k, '#E8C84A'); }
  const lx = 250, lampOn = !down('lighthouse'); ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(lx - 22 * k, gy); ctx.lineTo(lx - 12 * k, gy - 170 * k); ctx.lineTo(lx + 12 * k, gy - 170 * k); ctx.lineTo(lx + 22 * k, gy); ctx.fill(); ctx.fillRect(lx - 16 * k, gy - 190 * k, 32 * k, 24 * k);
  if (lampOn){ fillCircle(ctx, lx, gy - 178 * k, 7 * k, '#FFE49A'); csGlow(ctx, lx, gy - 178 * k, 60 * k, '#FFE49A', 0.4 + 0.2 * Math.sin(t * 3)); } else fillCircle(ctx, lx, gy - 178 * k, 7 * k, '#3A2A2E');      /* its lamp is out */
  const rx = 1010, mastH = down('mission') ? 120 : 210; ctx.fillStyle = col; ctx.fillRect(rx - 8 * k, gy - mastH * k, 16 * k, (mastH + 4) * k); ctx.beginPath(); ctx.moveTo(rx - 22 * k, gy); ctx.lineTo(rx - 8 * k, gy - 150 * k); ctx.lineTo(rx + 8 * k, gy - 150 * k); ctx.lineTo(rx + 22 * k, gy); ctx.fill();
  if (down('mission')){ ctx.strokeStyle = col; ctx.lineWidth = 6 * k; ctx.beginPath(); ctx.moveTo(rx, gy - mastH * k); ctx.lineTo(rx + 40 * k, gy - (mastH - 30) * k); ctx.stroke(); } else fillCircle(ctx, rx, gy - 214 * k, 5 * k, '#FF6A5A');           /* the radio mast, bent over, its light gone */
  if (glow) for (const sx of [330, 640, 900]){ sgSmoke(ctx, sx, gy - 40 * k, t + sx, 220 * k, 0.9); }
  st.wrecked.forEach(function(key){ if (SG_SMOKE_X[key]) sgSmoke(ctx, SG_SMOKE_X[key], gy - 20 * k, t + SG_SMOKE_X[key] * 0.37, 200 * k, 0.8); });
}
/* scorch marks and a crater or two on the ground in front of the town, as many as the night left */
function sgFilmScars(ctx, gy, st, kk){
  const n = Math.max(1, Math.min(14, Math.round(st.scars / 9)));
  for (let i = 0; i < n; i++){ const x = 60 + csR(i + 910) * 1160, y = gy + 16 + csR(i + 940) * 84, r = 30 + csR(i + 970) * 44 * kk;
    ctx.fillStyle = 'rgba(14,10,8,.4)'; ctx.beginPath(); ctx.ellipse(x, y, r, r * 0.34, 0, 0, TAU); ctx.fill(); ctx.fillStyle = 'rgba(8,6,6,.45)'; ctx.beginPath(); ctx.ellipse(x, y, r * 0.55, r * 0.18, 0, 0, TAU); ctx.fill(); }
}
/* a militia giraffe in side view, seen against the sandbags: a small giraffe with a cap and a rifle across the shoulder */
function sgMilitia(ctx, x, y, s, t, face){
  csGiraffe(ctx, { x: x, y: y, s: s, face: face, walk: 0, moving: false, neck: 0.5 + 0.04 * Math.sin(t * 2 + x), head: 0.05, bare: true, boots: false });
  ctx.save(); ctx.translate(x + face * 36 * s, y - 120 * s); ctx.fillStyle = '#4A6A3A'; ctx.beginPath(); ctx.arc(0, 0, 11 * s, Math.PI, TAU); ctx.fill(); ctx.strokeStyle = '#2A2218'; ctx.lineWidth = 5 * s; ctx.beginPath(); ctx.moveTo(face * -10 * s, 70 * s); ctx.lineTo(face * 60 * s, 52 * s); ctx.stroke(); ctx.restore();
}
function sgBags(ctx, x, gy, w){ for (let k = 0; k < Math.ceil(w / 46); k++) for (let r = 0; r < 2; r++){ ctx.fillStyle = (k + r) % 2 ? '#B8A57A' : '#A89468'; ctx.beginPath(); ctx.ellipse(x + k * 46 + (r % 2) * 22, gy - 12 - r * 22, 26, 12, 0, 0, TAU); ctx.fill(); ctx.strokeStyle = 'rgba(60,46,24,.5)'; ctx.lineWidth = 2; ctx.stroke(); } }
function siegeFlightScene(ctx, t){
  const T = SG_FLIGHT_T;
  if (t < T.B){                                                                      /* the grass at dusk and the smoke on the horizon, the helicopter low over it */
    const u = t, gy = 600; sgDusk(ctx, t, 0);
    for (const sx of [760, 900, 1100]) sgSmoke(ctx, sx, gy - 12, t + sx * 0.01, 160 + (sx % 3) * 40, csSm(2.5, 5, u));
    sgGround(ctx, gy, '#2A1A22', '#4A2A30', u * 220); for (let k = 0; k < 6; k++) sgAcacia(ctx, ((k * 310 - u * 140) % 1900 + 1900) % 1900 - 200, gy + 4, 0.9 + (k % 3) * 0.3);
    domeHeli(ctx, { x: csLerp(160, 760, csSm(0, 8, u)), y: 250 + Math.sin(t * 1.4) * 8, s: 0.9, t: t, rot: 0.05, spin: 1, pilot: true, pal: SG_HELI_PAL });
  } else if (t < T.C){                                                               /* the town at dusk, smoke over it, and machines on the road */
    const u = t - T.B, gy = 560, k = csLerp(0.7, 1.2, csSm(0, 8, u)); sgDusk(ctx, t, 0.5);
    sgSkyline(ctx, gy, k, t, true); sgGround(ctx, gy + 4, '#22141C', '#3A2028', u * 120);
    for (let i = 0; i < 9; i++){ const x = ((i * 150 + u * 60) % 1500) - 100, y = gy + 40 + (i % 3) * 22; ctx.fillStyle = '#10080E'; ctx.fillRect(x - 12, y - 10, 24, 14); fillCircle(ctx, x + 6, y - 4, 2.4, '#FF5A4A'); }       /* the machines, in a line */
    domeHeli(ctx, { x: csLerp(60, 560, csSm(0, 8, u)), y: csLerp(180, 280, csSm(0, 8, u)), s: csLerp(0.7, 1.0, csSm(0, 8, u)), t: t, rot: 0.08, spin: 1, pilot: true, pal: SG_HELI_PAL });
  } else {                                                                           /* the edge of town: the militia behind their sandbags, and she drops in */
    const u = t - T.C, gy = 600; sgDusk(ctx, t, 0.9); sgSkyline(ctx, gy - 140, 0.7, t, true); sgGround(ctx, gy, '#2A1A22', '#4A2A30', 0); sgBags(ctx, 700, gy + 8, 380);
    for (let i = 0; i < 3; i++) sgMilitia(ctx, 760 + i * 130, gy - 14, 0.62, t, -1);
    const drop = csSm(0.8, 3.2, u), gx = csLerp(300, 560, csSm(3.4, 6, u)); const gyy = csLerp(60, gy - 16, drop);
    domeHeli(ctx, { x: 240, y: 150 + Math.sin(t * 1.4) * 6, s: 0.8, t: t, rot: -0.06, spin: 1, pilot: true, pal: SG_HELI_PAL });
    csGiraffe(ctx, { x: gx, y: gyy, s: 0.8, face: 1, walk: u * 8, moving: u > 3.4 && u < 6, neck: csLerp(0.6, 0.3, drop), head: 0.1, tuck: 1 - drop, bare: true, boots: false });
  }
}
MARS_FILMS.siegeflight = {
  end: SG_FLIGHT_T.END, starts: [0, SG_FLIGHT_T.B, SG_FLIGHT_T.C, 0, 0, 0, 0, 0], scene: siegeFlightScene,
  over(ctx, t){
    const v = ctx.createRadialGradient(640, 360, 300, 640, 360, 780); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(20,6,10,.4)'); ctx.fillStyle = v; ctx.fillRect(0, 0, CS_W, CS_H);
    marsFilmCaps(ctx, SG_FLIGHT_CAPS, t, '#FFB070');
    const f = marsFilmFade([SG_FLIGHT_T.B, SG_FLIGHT_T.C], SG_FLIGHT_T.END, t); if (f > 0.005){ ctx.fillStyle = 'rgba(0,0,0,' + f + ')'; ctx.fillRect(0, 0, CS_W, CS_H); }
  },
  cues: [[0.4, () => SFX.click()], [1.6, () => SFX.whoosh()], [8.4, () => SFX.whoosh()], [12.4, () => SFX.click()], [16.4, () => SFX.click()], [18.2, () => SFX.whoosh()], [20.4, () => SFX.level()]]
};

/* ---- film 2 (22 s): the morning after ---- */
function sgWreck(ctx, x, gy, s, t){                                                   /* the Warden, down: a toppled heap of plate lit along its top edge by the morning, with one red light left, and smoke */
  ctx.fillStyle = 'rgba(0,0,0,.3)'; ctx.beginPath(); ctx.ellipse(x + 20 * s, gy + 6 * s, 210 * s, 14 * s, 0, 0, TAU); ctx.fill();
  const top = [[x - 150 * s, gy], [x - 110 * s, gy - 90 * s], [x - 30 * s, gy - 130 * s], [x + 60 * s, gy - 100 * s], [x + 150 * s, gy - 40 * s], [x + 170 * s, gy]];
  ctx.fillStyle = '#141824'; ctx.beginPath(); ctx.moveTo(top[0][0], top[0][1]); for (let i = 1; i < top.length; i++) ctx.lineTo(top[i][0], top[i][1]); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(232,150,110,.85)'; ctx.lineWidth = 3 * s; ctx.beginPath(); ctx.moveTo(top[1][0], top[1][1]); ctx.lineTo(top[2][0], top[2][1]); ctx.lineTo(top[3][0], top[3][1]); ctx.lineTo(top[4][0], top[4][1]); ctx.stroke();      /* the lit edge */
  ctx.fillStyle = '#2A2E42'; ctx.fillRect(x - 90 * s, gy - 96 * s, 60 * s, 22 * s); ctx.fillRect(x + 20 * s, gy - 80 * s, 70 * s, 18 * s); ctx.fillRect(x - 60 * s, gy - 50 * s, 120 * s, 16 * s);
  ctx.fillStyle = '#4A5068'; ctx.fillRect(x - 90 * s, gy - 96 * s, 60 * s, 3 * s); ctx.fillRect(x + 20 * s, gy - 80 * s, 70 * s, 3 * s); ctx.fillRect(x - 60 * s, gy - 50 * s, 120 * s, 3 * s);
  ctx.fillStyle = '#E0B030'; ctx.beginPath(); ctx.moveTo(x - 128 * s, gy - 30 * s); ctx.lineTo(x - 112 * s, gy - 30 * s); ctx.lineTo(x - 120 * s, gy - 46 * s); ctx.closePath(); ctx.fill();   /* the Warden's yellow marking */
  ctx.strokeStyle = '#141824'; ctx.lineWidth = 12 * s; ctx.lineCap = 'round';
  for (const dy of [-26, -10]){ ctx.beginPath(); ctx.moveTo(x + 150 * s, gy + dy * s - 20 * s); ctx.lineTo(x + 250 * s, gy + dy * s + 10 * s); ctx.stroke(); }          /* the twin barrels, one drooping */
  ctx.beginPath(); ctx.moveTo(x - 120 * s, gy - 4 * s); ctx.lineTo(x - 168 * s, gy - 34 * s); ctx.lineTo(x - 190 * s, gy - 4 * s); ctx.stroke();                          /* a broken leg */
  ctx.lineCap = 'butt';
  const lit = Math.sin(t * 2) > 0.2; fillCircle(ctx, x - 40 * s, gy - 70 * s, 7 * s, lit ? '#FF3A2A' : '#4A1410'); if (lit) csGlow(ctx, x - 40 * s, gy - 70 * s, 26 * s, '#FF3A2A', 0.5);
  sgSmoke(ctx, x, gy - 110 * s, t, 200 * s, 0.7);
}
function siegeOutScene(ctx, t){
  const T = SG_OUT_T, st = sgFilmState();
  if (t < T.B){                                                                      /* morning at the edge of town: the wreck, and the militia on their sandbags */
    const u = t, gy = 600; sgMorning(ctx, t); ctx.globalAlpha = 0.9; sgSkyline(ctx, gy - 90, 0.9, t, false, st); ctx.globalAlpha = 1; sgSmoke(ctx, 640, gy - 130, t, 180, 0.5); sgGround(ctx, gy, '#5A4A3A', '#7A6A52', u * 20); sgFilmScars(ctx, gy, st, 1);
    sgWreck(ctx, 330, gy + 8, 1.2, t); sgBags(ctx, 760, gy + 10, 420);
    for (let i = 0; i < 4; i++) sgMilitia(ctx, 800 + i * 110, gy - 12, 0.62, t + i, -1);
    ctx.fillStyle = 'rgba(0,0,0,' + (0.5 * (1 - csSm(0, 1.4, u))).toFixed(3) + ')'; ctx.fillRect(0, 0, CS_W, CS_H);
  } else if (t < T.C){                                                               /* the Square: the fountain, the Hall, and the hatch lifting a crack */
    const u = t - T.B, gy = 600; afSky(ctx, '#4A5A88', '#F0A888', '#FFE0B0'); sgSkyline(ctx, gy - 150, 1.0, t, false, st);
    ctx.fillStyle = '#8A8478'; ctx.fillRect(0, gy, CS_W, CS_H - gy); ctx.fillStyle = '#A8A294'; ctx.fillRect(0, gy, CS_W, 8); sgFilmScars(ctx, gy + 20, { scars: st.scars * 0.5 }, 0.8);
    ctx.fillStyle = '#B8B2A4'; ctx.beginPath(); ctx.ellipse(380, gy + 70, 120, 30, 0, 0, TAU); ctx.fill(); ctx.fillStyle = '#4A9AC0'; ctx.beginPath(); ctx.ellipse(380, gy + 66, 100, 22, 0, 0, TAU); ctx.fill();
    const open = csSm(1.2, 3.4, u), hx = 940, hy = gy + 70; ctx.fillStyle = '#3A3E48'; ctx.beginPath(); ctx.ellipse(hx, hy, 84, 22, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = '#FFD890'; ctx.globalAlpha = 0.5 * open; ctx.beginPath(); ctx.ellipse(hx, hy, 70, 16, 0, 0, TAU); ctx.fill(); ctx.globalAlpha = 1;
    ctx.save(); ctx.translate(hx - 70, hy); ctx.rotate(-open * 0.6); ctx.fillStyle = '#6A707C'; ctx.fillRect(0, -10, 140, 14); ctx.restore();
    if (open > 0.6){ const peek = csSm(0.6, 1, open); for (let i = 0; i < 3; i++) csGiraffe(ctx, { x: hx - 30 + i * 36, y: hy + 40 - peek * 40, s: 0.5, face: i === 2 ? 1 : -1, walk: 0, moving: false, neck: 0.1, head: 0.2, bare: true, boots: false }); }
    for (let i = 0; i < 3; i++) sgMilitia(ctx, 560 + i * 90, gy + 76, 0.56, t + i, 1);
  } else {                                                                           /* a small drone, going east over the grass toward the waterhole */
    const u = t - T.C, gy = 620; afSky(ctx, '#3A4A78', '#F09A6A', '#FFD890'); sgGround(ctx, gy, '#5A5230', '#7A7040', u * 200);
    for (let k = 0; k < 5; k++) sgAcacia(ctx, ((k * 340 - u * 120) % 1900 + 1900) % 1900 - 200, gy + 4, 0.8 + (k % 3) * 0.3);
    ctx.fillStyle = '#3E86A8'; ctx.beginPath(); ctx.ellipse(1060, gy + 60, 150, 26, 0, 0, TAU); ctx.fill(); csGlow(ctx, 1060, gy + 60, 120, '#9AE8FF', 0.25);              /* the waterhole, far off */
    const dx = csLerp(240, 940, csSm(0, 7, u)), dy = 280 + Math.sin(t * 2.2) * 8 - csSm(0, 7, u) * 60;
    ctx.fillStyle = '#10080E'; ctx.fillRect(dx - 14, dy - 4, 28, 9); for (const sx of [-1, 1]){ ctx.fillRect(dx + sx * 18 - 12, dy - 8, 24, 2); } fillCircle(ctx, dx, dy + 6, 3.4, '#6AFFA0'); csGlow(ctx, dx, dy + 6, 34, '#6AFFA0', 0.5);
  }
}
MARS_FILMS.siegeout = {
  end: SG_OUT_T.END, starts: [0, SG_OUT_T.B, SG_OUT_T.C, 0, 0, 0, 0, 0], scene: siegeOutScene,
  over(ctx, t){
    const v = ctx.createRadialGradient(640, 360, 300, 640, 360, 780); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(20,8,12,.35)'); ctx.fillStyle = v; ctx.fillRect(0, 0, CS_W, CS_H);
    marsFilmCaps(ctx, SG_OUT_CAPS, t, '#FFD890');
    const f = marsFilmFade([SG_OUT_T.B, SG_OUT_T.C], SG_OUT_T.END, t); if (f > 0.005){ ctx.fillStyle = 'rgba(0,0,0,' + f + ')'; ctx.fillRect(0, 0, CS_W, CS_H); }
  },
  cues: [[0.4, () => SFX.click()], [4.6, () => SFX.whoosh()], [8.8, () => SFX.click()], [10.4, () => SFX.pickupS()], [15.6, () => SFX.whoosh()], [19.4, () => SFX.click()]]
};
