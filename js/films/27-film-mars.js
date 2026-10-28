'use strict';
/* The Mars films. */
/* ========================= THE MARS FILMS ========================= */
/* Three films: the SP-1 flies to Mars (with the Mutation Vial: the end of Chapter 12), Marine ships come down on the plain (after wave 15 of Chapter 13),
   and the SP-1 flies home (the end of Chapter 13). Like the other films, every frame is a pure function of time. */
function marsPlanet(ctx, cx, cy, r){
  ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, r, 0, TAU); ctx.clip();
  const g = ctx.createRadialGradient(cx - r * 0.35, cy - r * 0.35, r * 0.1, cx, cy, r); g.addColorStop(0, '#E88A5A'); g.addColorStop(0.6, '#B8502E'); g.addColorStop(1, '#6A2A18'); ctx.fillStyle = g; ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
  for (let k = 0; k < 11; k++){ const a = csR(k + 14000) * TAU, dd = csR(k + 14050) * 0.7 * r; ctx.globalAlpha = 0.45; ctx.fillStyle = '#7A3320'; ctx.beginPath(); ctx.ellipse(cx + Math.cos(a) * dd, cy + Math.sin(a) * dd, (0.1 + csR(k + 14100) * 0.2) * r, (0.06 + csR(k + 14150) * 0.1) * r, a, 0, TAU); ctx.fill(); }
  ctx.globalAlpha = 0.85; ctx.fillStyle = '#F4E8E0'; ctx.beginPath(); ctx.ellipse(cx, cy - r * 0.94, r * 0.3, r * 0.1, 0, 0, TAU); ctx.fill(); ctx.globalAlpha = 1;
  const sh = ctx.createRadialGradient(cx - r * 0.45, cy - r * 0.45, r * 0.5, cx + r * 0.2, cy + r * 0.2, r * 1.25); sh.addColorStop(0, 'rgba(0,0,0,0)'); sh.addColorStop(1, 'rgba(10,0,0,.7)'); ctx.fillStyle = sh; ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
  ctx.restore();
  ctx.strokeStyle = 'rgba(255,170,120,.25)'; ctx.lineWidth = Math.max(1, r * 0.04); ctx.beginPath(); ctx.arc(cx, cy, r * 1.02, 0, TAU); ctx.stroke();
}
/* the Mutation Vial, large: glass, glowing green liquid with a wavy top, rising bubbles */
function marsVial(ctx, cx, cy, s, t, glow){
  csGlow(ctx, cx, cy, 240 * s, '#9BE86A', 0.38 * glow);
  ctx.save(); ctx.translate(cx, cy); ctx.rotate(Math.sin(t * 0.8) * 0.07); ctx.scale(s, s);
  const body = () => { ctx.beginPath(); ctx.moveTo(-26, -70); ctx.lineTo(26, -70); ctx.lineTo(26, -40); ctx.lineTo(70, 70); ctx.quadraticCurveTo(76, 112, 0, 112); ctx.quadraticCurveTo(-76, 112, -70, 70); ctx.lineTo(-26, -40); ctx.closePath(); };
  ctx.save(); body(); ctx.clip();
  const lg = ctx.createLinearGradient(0, 10, 0, 112); lg.addColorStop(0, '#CFFFB0'); lg.addColorStop(1, '#2FAE34'); ctx.fillStyle = lg;
  ctx.beginPath(); ctx.moveTo(-90, 120); ctx.lineTo(-90, 18 + Math.sin(t * 2) * 3); for (let x = -90; x <= 90; x += 10) ctx.lineTo(x, 18 + Math.sin(t * 2 + x * 0.08) * 4); ctx.lineTo(90, 120); ctx.closePath(); ctx.fill();
  for (let k = 0; k < 7; k++){ const a = (t * 0.35 + csR(k + 14300)) % 1; ctx.globalAlpha = 0.7 * (1 - a); fillCircle(ctx, (csR(k + 14350) - 0.5) * 80, 100 - a * 86, 2 + csR(k + 14400) * 3, '#E8FFD8'); } ctx.globalAlpha = 1;
  ctx.restore();
  body(); ctx.fillStyle = 'rgba(200,255,200,.10)'; ctx.fill(); ctx.strokeStyle = '#CFE8CF'; ctx.lineWidth = 5; ctx.stroke();
  ctx.strokeStyle = 'rgba(255,255,255,.55)'; ctx.lineWidth = 4; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-50, 50); ctx.quadraticCurveTo(-56, 84, -40, 100); ctx.stroke(); ctx.lineCap = 'butt';
  ctx.fillStyle = '#6A6E5A'; ctx.fillRect(-32, -96, 64, 28); ctx.fillStyle = '#8A8E7A'; ctx.fillRect(-32, -96, 64, 8); ctx.strokeStyle = '#2A2E22'; ctx.lineWidth = 2; ctx.strokeRect(-32, -96, 64, 28);
  ctx.restore();
}
const MARS_FILMS = {};
function marsFilmFade(T, END, t){
  let f = 1 - csSm(0, 1.0, t); f = Math.max(f, csSm(END - 1.8, END, t));
  for (let i = 0; i < T.length; i++) f = Math.max(f, 1 - csSm(0, 0.4, Math.abs(t - T[i])));
  return f;
}
function marsFilmCaps(ctx, caps, t, accent){
  let cap = null;
  for (let i = 0; i < caps.length; i++) if (t >= caps[i][0] && t < caps[i][0] + caps[i][3]) cap = caps[i];
  if (!cap) return;
  const a = csSm(0, 0.25, t - cap[0]) * (1 - csSm(cap[3] - 0.35, cap[3], t - cap[0])), wide = cap[1].length > 22 || (cap[2] && cap[2].length > 34);
  ctx.globalAlpha = a; ctx.fillStyle = 'rgba(0,0,10,.58)'; ctx.fillRect(0, 618, wide ? 860 : cap[2] ? 640 : 460, cap[2] ? 84 : 58); ctx.fillStyle = accent; ctx.fillRect(0, 618, 5, cap[2] ? 84 : 58);
  csText(ctx, cap[1], 26, 652, 25, '#F4F8FF', 'left', '800'); if (cap[2]) csText(ctx, cap[2], 26, 682, 15, '#C8D0E0', 'left', '600');
  ctx.globalAlpha = 1;
}
/* the red plain at dusk, ground line gy: sky, sun, ridges, ground */
function marsLand(ctx, t, gy, sc, dusk){
  afSky(ctx, dusk ? '#2A1230' : '#7A4A5A', dusk ? '#C0502E' : '#E89A6A', dusk ? '#F0A070' : '#F4C8A0');
  csGlow(ctx, 900, gy - 40, 300, '#FFD0A0', 0.45); fillCircle(ctx, 900, gy - 40, 34, '#FFE8CC');
  afClouds(ctx, sc * 0.05 + t * 6, 4, 60, 220, 0.2, '#F0B898');
  afRidge(ctx, gy - 36, 66, 3.1, '#8A4630', sc * 0.1); afRidge(ctx, gy - 6, 46, 6.2, '#6A3424', sc * 0.25);
  if (gy < CS_H){ const gg = ctx.createLinearGradient(0, gy, 0, CS_H); gg.addColorStop(0, '#A04A2C'); gg.addColorStop(1, '#5A2616'); ctx.fillStyle = gg; ctx.fillRect(0, gy, CS_W, CS_H - gy + 2); }
}
/* ---- film 1 (18 s): the Mutation Vial, the SP-1 in space, the landing ---- */
const MARS_TRIP_T = { B: 5.5, C: 12, END: 18 };
const MARS_TRIP_CAPS = [
  [0.8, 'THE MUTATION VIAL', 'Taken from the hatch at the heart of Area 51', 3.6],
  [3.8, 'THE SOURCE IS NOT HERE', 'The samples were never from Earth', 3.4],
  [6.0, 'THE SP-1', 'The salvaged engine core takes her out past the Moon', 3.4],
  [9.8, 'MARS', 'The vial is pulling toward it', 2.4],
  [12.4, 'LANDING', '', 2.2],
  [15.2, 'THE RED PLAIN', 'Something is moving in the dust', 2.6]
];
function marsTripScene(ctx, t){
  const T = MARS_TRIP_T;
  if (t < T.B){
    const u = t; ctx.fillStyle = '#05080A'; ctx.fillRect(0, 0, CS_W, CS_H);
    const g = ctx.createRadialGradient(640, 330, 20, 640, 330, 600); g.addColorStop(0, 'rgba(40,90,40,.55)'); g.addColorStop(1, 'rgba(5,10,8,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, CS_W, CS_H);
    for (let k = 0; k < 40; k++){ const a = (u * 0.06 + csR(k + 14500)) % 1; ctx.globalAlpha = 0.45 * Math.sin(a * Math.PI); fillCircle(ctx, csR(k + 14550) * CS_W, 700 - a * 700, 2, '#BFFFA0'); } ctx.globalAlpha = 1;
    marsVial(ctx, 640, 340, 1.9 + 0.1 * csSm(0, 5, u), t, 0.7 + 0.3 * Math.sin(t * 2));
  } else if (t < T.C){
    const u = t - T.B, p = csSm(0, 6.5, u);
    ctx.fillStyle = '#02040C'; ctx.fillRect(0, 0, CS_W, CS_H); csStars(ctx, 1, t, -u * 30, 0);
    csEarth(ctx, csLerp(260, -30, p), csLerp(500, 700, p), csLerp(180, 70, p), t * 0.05, t, false);
    marsPlanet(ctx, csLerp(1090, 900, p), csLerp(200, 260, p), csLerp(34, 150, p));
    hmPlane(ctx, { x: csLerp(380, 560, p), y: 380 + Math.sin(t * 1.4) * 8, s: 1.1, build: 4, t: t, rot: -0.02, flame: 80 + 20 * Math.sin(t * 9), core: 0.9, pilot: 1, bare: false });
  } else {
    const u = t - T.C, land = csSm(0, 3.8, u), gy = 560;
    marsLand(ctx, t, gy, u * 80, false);
    const py = csLerp(120, gy - 44 * 1.3 - 2, land), px = 640 - 20 * land;
    hmPlane(ctx, { x: px, y: py, s: 1.3, build: 4, t: t, rot: 0.12 * (1 - land), gear: land > 0.7, flame: land < 0.9 ? 40 + 80 * (1 - land) : 0, core: 0.7, pilot: 1, bare: false });
    if (u > 3.0){ const a = csSm(3.0, 6, u); for (let k = 0; k < 10; k++){ ctx.globalAlpha = 0.35 * (1 - a) * (1 - k / 12); ctx.fillStyle = '#D89A74'; ctx.beginPath(); ctx.arc(px - 200 + k * 40 + a * (k - 5) * 30, gy - 6 - a * 22, 14 + a * 26, 0, TAU); ctx.fill(); } ctx.globalAlpha = 1; }
  }
}
MARS_FILMS.mars = {
  end: MARS_TRIP_T.END, starts: [0, MARS_TRIP_T.B, MARS_TRIP_T.C, 0, 0, 0, 0, 0],
  scene: marsTripScene,
  over(ctx, t){
    const v = ctx.createRadialGradient(640, 360, 300, 640, 360, 780); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,.4)'); ctx.fillStyle = v; ctx.fillRect(0, 0, CS_W, CS_H);
    marsFilmCaps(ctx, MARS_TRIP_CAPS, t, '#FF9A6A');
    const f = marsFilmFade([MARS_TRIP_T.B, MARS_TRIP_T.C], MARS_TRIP_T.END, t); if (f > 0.005){ ctx.fillStyle = 'rgba(0,0,0,' + f + ')'; ctx.fillRect(0, 0, CS_W, CS_H); }
  },
  cues: [[1.0, () => SFX.click()], [4.0, () => SFX.level()], [6.0, () => SFX.zap()], [6.4, () => SFX.whoosh()], [10.0, () => SFX.whoosh()], [14.4, () => SFX.boom()], [16.0, () => SFX.click()]]
};
/* ---- film 2 (8 s): Marine ships come down on the plain, and the dust aliens look up ---- */
const MARS_SHIPS_END = 8;
const MARS_SHIPS_CAPS = [[0.6, 'MARINE SHIPS INBOUND', 'Earth has noticed the SP-1', 3.2], [4.0, 'THE DUST HAS NOTICED TOO', '', 3.0]];
function marsShip(ctx, x, y, s, rot, t){
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  csGlow(ctx, -70, 0, 60, '#FFB070', 0.8);
  ctx.fillStyle = '#FF9A4A'; ctx.beginPath(); ctx.moveTo(-60, -8); ctx.lineTo(-120 - 30 * Math.sin(t * 20), 0); ctx.lineTo(-60, 8); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#7A8294'; ctx.beginPath(); ctx.moveTo(70, 0); ctx.lineTo(30, -22); ctx.lineTo(-56, -26); ctx.lineTo(-64, 0); ctx.lineTo(-56, 26); ctx.lineTo(30, 22); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = '#3A4458'; ctx.lineWidth = 2.4; ctx.stroke();
  ctx.fillStyle = '#3B5B92'; ctx.fillRect(-50, -4, 100, 8); ctx.fillStyle = '#DDE3EC'; ctx.fillRect(-20, -26, 12, 52);
  ctx.fillStyle = '#7FD8FF'; ctx.beginPath(); ctx.ellipse(40, 0, 16, 7, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = '#4A5468'; ctx.beginPath(); ctx.moveTo(-30, -24); ctx.lineTo(-62, -52); ctx.lineTo(-52, -24); ctx.closePath(); ctx.fill(); ctx.beginPath(); ctx.moveTo(-30, 24); ctx.lineTo(-62, 52); ctx.lineTo(-52, 24); ctx.closePath(); ctx.fill();
  ctx.restore();
}
function marsShipsScene(ctx, t){
  const gy = 560;
  marsLand(ctx, t, gy, 0, true);
  for (let k = 0; k < 4; k++){                                                        /* the ships come in from the top right, one after another */
    const t0 = 0.3 + k * 0.7, u = csC((t - t0) / 5.5, 0, 1); if (t < t0) continue;
    const x = csLerp(1450 - k * 60, 380 + k * 190, u), y = csLerp(-60 + k * 20, 330 + k * 24, Math.pow(u, 0.8));
    for (let j = 1; j < 9; j++){ ctx.globalAlpha = 0.22 * (1 - j / 9); ctx.fillStyle = '#E8B890'; ctx.beginPath(); ctx.arc(x + j * 26, y - j * 14, 9 + j * 3, 0, TAU); ctx.fill(); } ctx.globalAlpha = 1;
    marsShip(ctx, x, y, 0.7 - k * 0.04, 0.4, t + k);
  }
  const rise = csSm(3.5, 5.0, t);                                                      /* dust aliens on the ridge turn toward the sky */
  for (let k = 0; k < 14; k++){
    const x = 120 + k * 84 + (k % 3) * 14, y = gy + 8 + (k % 4) * 18, s = 0.7 + (k % 3) * 0.2, h = 18 + rise * 16 * s;
    ctx.fillStyle = '#2A0E08'; ctx.beginPath(); ctx.ellipse(x, y - h * 0.5, 12 * s, h * 0.7, 0, 0, TAU); ctx.fill();
    for (const sd of [-1, 1]) lkLN(ctx, [x + sd * 8 * s, y - h * 0.4, x + sd * 16 * s, y], 2 * s, '#2A0E08');
    csGlow(ctx, x - 3, y - h * 0.7, 6, '#FFD0A0', 0.5 + 0.5 * rise); csGlow(ctx, x + 3, y - h * 0.7, 6, '#FFD0A0', 0.5 + 0.5 * rise);
  }
}
MARS_FILMS.mships = {
  end: MARS_SHIPS_END, starts: [0, 2, 4, 6, 0, 0, 0, 0], scene: marsShipsScene,
  over(ctx, t){
    const v = ctx.createRadialGradient(640, 360, 300, 640, 360, 780); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(60,0,0,' + (0.35 + 0.1 * Math.sin(t * 5)) + ')'); ctx.fillStyle = v; ctx.fillRect(0, 0, CS_W, CS_H);
    marsFilmCaps(ctx, MARS_SHIPS_CAPS, t, '#7FD8FF');
    const f = marsFilmFade([], MARS_SHIPS_END, t); if (f > 0.005){ ctx.fillStyle = 'rgba(0,0,0,' + f + ')'; ctx.fillRect(0, 0, CS_W, CS_H); }
  },
  cues: [[0.3, () => SFX.whoosh()], [1.0, () => SFX.whoosh()], [1.7, () => SFX.boom()], [2.4, () => SFX.whoosh()], [4.2, () => SFX.boss()]]
};
/* ---- film 3 (15 s): the SP-1 lifts off the red plain and flies home ---- */
const MARS_HOME_T = { B: 5.5, C: 11, D: 16, E: 22, END: 29 };
const MARS_HOME_CAPS = [
  [0.8, 'LIFTOFF', 'The SP-1 leaves the red plain', 3.2],
  [6.0, 'THE LONG WAY HOME', 'Mars shrinks behind her', 3.6],
  [11.6, 'EARTH', 'Home is a blue light ahead', 3.4],
  [16.5, 'THE OLD AIRFIELD', 'The same strip, the same long grass', 3.4],
  [22.4, 'THE UNDERGROUND CITY', 'She has an idea', 3.0],
  [25.4, 'THE LAB', 'A place to open the vial', 3.0]
];
/* the new lab in the Underground Giraffe City: a frame, then walls, then glass, a lamp and a bench; p is how much of it has been built (0 to 1) */
function marsLab(ctx, x, y, p, t){
  const w = 380, h = 250;
  ctx.fillStyle = 'rgba(0,0,0,.3)'; ctx.fillRect(x - w / 2 + 8, y - 6, w, 14);
  const a = csSm(0, 0.3, p), b = csSm(0.25, 0.6, p), c = csSm(0.55, 0.85, p), d = csSm(0.8, 1, p);
  ctx.strokeStyle = '#8A6A44'; ctx.lineWidth = 7; ctx.globalAlpha = a;                      /* the timber frame going up */
  ctx.beginPath(); ctx.moveTo(x - w / 2, y); ctx.lineTo(x - w / 2, y - h * a); ctx.moveTo(x + w / 2, y); ctx.lineTo(x + w / 2, y - h * a); ctx.moveTo(x, y); ctx.lineTo(x, y - h * a); ctx.moveTo(x - w / 2, y - h * a); ctx.lineTo(x + w / 2, y - h * a); ctx.stroke(); ctx.globalAlpha = 1;
  if (b > 0.01){ ctx.fillStyle = '#6A5A4A'; ctx.fillRect(x - w / 2 + 4, y - h * b + 4, w - 8, h * b - 4); ctx.strokeStyle = 'rgba(0,0,0,.25)'; ctx.lineWidth = 2; for (let k = 1; k < 5; k++){ ctx.beginPath(); ctx.moveTo(x - w / 2 + 4, y - h * b * k / 5); ctx.lineTo(x + w / 2 - 4, y - h * b * k / 5); ctx.stroke(); } }
  if (c > 0.01){ ctx.fillStyle = 'rgba(160,230,200,' + (0.22 * c) + ')'; ctx.fillRect(x - w / 2 + 28, y - 190, 120, 110 * c); ctx.fillRect(x + w / 2 - 148, y - 190, 120, 110 * c); ctx.strokeStyle = '#C8E8D8'; ctx.lineWidth = 3; ctx.globalAlpha = c; ctx.strokeRect(x - w / 2 + 28, y - 190, 120, 110); ctx.strokeRect(x + w / 2 - 148, y - 190, 120, 110); ctx.globalAlpha = 1;
    ctx.fillStyle = '#2A3A32'; ctx.fillRect(x - 40, y - 120 * c, 80, 120 * c); }
  if (d > 0.01){
    ctx.globalAlpha = d; ctx.fillStyle = '#4A3A2A'; ctx.fillRect(x - w / 2 + 40, y - 70, 150, 12); ctx.fillRect(x - w / 2 + 50, y - 58, 8, 58); ctx.fillRect(x - w / 2 + 172, y - 58, 8, 58);
    csGlow(ctx, x + w / 2 - 60, y - 200, 70, '#FFE0A0', 0.5); fillCircle(ctx, x + w / 2 - 60, y - 200, 9, '#FFF0C0');
    csText(ctx, 'LAB', x, y - h - 16, 26, '#E8F4E0', 'center', '800'); ctx.globalAlpha = 1;
  }
}
function marsHomeScene(ctx, t){
  const T = MARS_HOME_T;
  if (t < T.B){
    const u = t, gy = 560, lift = csSm(1.2, 5.2, u);
    marsLand(ctx, t, gy + lift * 420, u * 6, false);
    const py = gy - 44 * 1.3 - lift * 520, px = 640 + lift * 120;
    if (u < 4.8) for (let k = 0; k < 12; k++){ const a = (u * 0.9 + k / 12) % 1; ctx.globalAlpha = 0.4 * (1 - a) * (1 - lift); ctx.fillStyle = '#D89A74'; ctx.beginPath(); ctx.arc(px - 120 + (k - 6) * 36 * (0.5 + a), gy + lift * 420 - 6 - a * 24, 14 + a * 30, 0, TAU); ctx.fill(); } ctx.globalAlpha = 1;
    hmPlane(ctx, { x: px, y: py, s: 1.3, build: 4, t: t, rot: -0.35 * lift, gear: lift < 0.15, flame: 60 + 100 * lift, core: 0.9, pilot: 1, bare: false });
  } else if (t < T.C){
    const u = t - T.B, p = csSm(0, 5.5, u);
    ctx.fillStyle = '#02040C'; ctx.fillRect(0, 0, CS_W, CS_H); csStars(ctx, 1, t, u * 30, 0);
    marsPlanet(ctx, csLerp(260, 40, p), csLerp(480, 650, p), csLerp(170, 60, p));
    csEarth(ctx, csLerp(1130, 940, p), csLerp(200, 240, p), csLerp(30, 120, p), t * 0.05, t, false);
    hmPlane(ctx, { x: 600, y: 360 + Math.sin(t * 1.4) * 8, s: 1.1, build: 4, t: t, rot: 0.02, flame: 80, core: 0.9, pilot: 1, bare: false });
  } else if (t < T.D){
    const u = t - T.C, p = csSm(0, 5, u);
    ctx.fillStyle = '#02040C'; ctx.fillRect(0, 0, CS_W, CS_H); csStars(ctx, 1 - 0.5 * p, t, u * 20, 0);
    csEarth(ctx, csLerp(900, 760, p), csLerp(260, 330, p), csLerp(120, 330, p), t * 0.05, t, false);
    hmPlane(ctx, { x: csLerp(520, 420, p), y: 380, s: csLerp(1.1, 0.8, p), build: 4, t: t, rot: 0.02, flame: 70, core: 0.9, pilot: 1, bare: false });
  } else if (t < T.E){                                                                  /* the SP-1 lands on the old airfield and she steps out, helmet off */
    const u = t - T.D, land = csSm(0, 3.0, u), gy = 566, PS = 1.5;
    afSavanna(ctx, t, gy, 0); ctx.fillStyle = '#4A4650'; ctx.fillRect(0, gy, CS_W, 24); ctx.fillStyle = '#6A6670'; ctx.fillRect(0, gy, CS_W, 5);
    const py = csLerp(120, gy - 44 * PS, land);
    hmPlane(ctx, { x: 760, y: py, s: PS, build: 4, t: t, rot: 0.1 * (1 - land), gear: land > 0.7, flame: land < 0.9 ? 40 + 80 * (1 - land) : 0, core: 0.6, pilot: u > 4.2 ? 1 - csSm(4.2, 4.8, u) : 1, bare: u > 3.6, canopy: csBump(u, 3.4, 99, 0.7) });
    if (u > 4.4) csGiraffe(ctx, { x: csLerp(800, 1000, csSm(4.4, 5.5, u)), y: gy + 22, s: 0.66, face: 1, walk: u * 8, moving: u < 5.4, neck: 0.25, head: 0.1, bare: true, boots: false });
  } else {                                                                              /* the Underground Giraffe City, and the lab going up */
    const u = t - T.E, p = csSm(0.4, 4.4, u);
    hmCityBack(ctx, t);
    [[180, 0.6, 1, 1], [330, 0.56, 2, 1], [1130, 0.62, 3, -1], [1230, 0.5, 4, -1]].forEach((c, i) => csGiraffe(ctx, Object.assign({ x: c[0], y: 616, s: c[1], face: c[3], walk: t * 1.2 + i, moving: false, neck: 0.28 + 0.1 * Math.sin(t * 0.9 + i), head: 0.1, bare: true, boots: false }, HM_COATS[c[2]])));
    marsLab(ctx, 760, 616, p, t);
    const gx = csLerp(-100, 520, csSm(0, 3.0, u)), hold = csSm(4.6, 5.6, u);
    csGiraffe(ctx, { x: gx, y: 616, s: 0.9, face: 1, walk: u * 6, moving: u < 3.0, neck: 0.3 + 0.2 * hold, head: 0.1, bare: true, boots: false });
    if (p > 0.9){ const vx = csLerp(gx + 34, 700, hold), vy = csLerp(616 - 200, 616 - 90, hold); marsVial(ctx, vx, vy, 0.2, t, 0.5 + 0.4 * hold); }
  }
}
MARS_FILMS.marshome = {
  end: MARS_HOME_T.END, starts: [0, MARS_HOME_T.B, MARS_HOME_T.C, MARS_HOME_T.D, MARS_HOME_T.E, 0, 0, 0], scene: marsHomeScene,
  over(ctx, t){
    const v = ctx.createRadialGradient(640, 360, 300, 640, 360, 780); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,.4)'); ctx.fillStyle = v; ctx.fillRect(0, 0, CS_W, CS_H);
    marsFilmCaps(ctx, MARS_HOME_CAPS, t, '#FF9A6A');
    const f = marsFilmFade([MARS_HOME_T.B, MARS_HOME_T.C, MARS_HOME_T.D, MARS_HOME_T.E], MARS_HOME_T.END, t); if (f > 0.005){ ctx.fillStyle = 'rgba(0,0,0,' + f + ')'; ctx.fillRect(0, 0, CS_W, CS_H); }
  },
  cues: [[1.2, () => SFX.zap()], [1.6, () => SFX.boom()], [2.6, () => SFX.whoosh()], [6.4, () => SFX.whoosh()], [11.6, () => SFX.level()], [17.0, () => SFX.whoosh()], [19.5, () => SFX.boom()], [23.4, () => SFX.click()], [24.6, () => SFX.click()], [25.4, () => SFX.click()], [26.4, () => SFX.click()], [27.2, () => SFX.level()]]
};

