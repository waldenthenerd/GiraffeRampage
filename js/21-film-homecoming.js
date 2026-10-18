'use strict';
/* The homecoming film. */
/* ======================= THE HOMECOMING FILM (after the spaceplane is built) ======================= */
/* The giraffe boards the spaceplane built from the salvaged engine core, flies from Venus to Earth, lands at an old airfield in
   the savannah, steps out, takes her helmet off, goes down a hatch in the hangar floor, and is taken in by the Underground
   Giraffe City. Like the other films, every frame is a pure function of time. */
const HM_T = { A: 0, B: 8, C: 15, D: 23, E: 29, F: 35.4, G: 42.4, H: 49, END: 61.5 };
const HM_CAPS = [
  [0.8, 'VENUS OUTPOST', 'The spaceplane is ready', 3.4],
  [4.7, 'BOARDING', '', 2.2],
  [8.5, 'IGNITION', 'The salvaged engine core lights', 3.0],
  [11.9, 'LIFTOFF', '', 2.2],
  [15.6, 'LEAVING VENUS', '', 2.2],
  [18.7, 'COURSE SET', 'Destination: Earth', 3.2],
  [23.5, 'EARTH', 'Home, at last', 3.2],
  [29.5, 'RE-ENTRY', 'Hull temperature rising', 3.0],
  [32.8, 'ALL SYSTEMS HOLD', '', 2.0],
  [35.7, 'THE SAVANNAH', 'An old airfield, far from anywhere', 3.6],
  [39.8, 'TOUCHDOWN', '', 2.0],
  [42.9, 'FRESH AIR', '', 2.0],
  [45.6, 'THE HANGAR', 'A hatch in the floor', 3.0],
  [49.9, 'THE UNDERGROUND GIRAFFE CITY', '', 3.4],
  [53.8, 'TAKEN IN', 'She is home', 4.2]
];
const HM_COATS = [{}, { coat: '#C98A3A', darkc: '#A8702A', spotc: '#6A3A18' }, { coat: '#E0B86A', darkc: '#C09A4C', spotc: '#9A6A2C' }, { coat: '#B8864A', darkc: '#946A34', spotc: '#5A3A1A' }, { coat: '#EAD39A', darkc: '#CDB074', spotc: '#A07A3C' }];

/* ---- the spaceplane, side on, nose to the right. build 0..4 draws it part by part (used by the outpost picture too):
   1 the frame, 2 skin, wings and heat tiles, 3 the engine, 4 the cockpit and lights ---- */
/* The giraffe in the cockpit is the SAME sprite as the one that walked up to the plane, at the same size compared with the plane (she is drawn at
   0.41 of the plane's scale everywhere: 0.82 beside a plane drawn at 2.0). Her neck is pitched almost flat, head at the front, body low in the
   fuselage, so the canopy only has to be big enough for her neck, her head and her helmet. Placed so the helmet is centred at (84, -37). */
const HM_PILOT = { s: 0.41, neck: 1.3, head: 0.05, x: 31.67, y: 18.82 };
function hmCanopyPath(ctx){                                                         /* a short, swept-back canopy with a raked windscreen */
  ctx.beginPath(); ctx.moveTo(12, -21); ctx.quadraticCurveTo(40, -50, 88, -55); ctx.quadraticCurveTo(108, -52, 114, -8); ctx.quadraticCurveTo(66, -24, 12, -21); ctx.closePath();
}
function hmBodyPath(ctx){ ctx.beginPath(); ctx.moveTo(-112, -14); ctx.quadraticCurveTo(-20, -26, 48, -20); ctx.quadraticCurveTo(110, -12, 132, 3); ctx.quadraticCurveTo(100, 16, 30, 17); ctx.lineTo(-112, 12); ctx.closePath(); }
function hmPlane(ctx, o){
  const s = o.s || 1, b = o.build === undefined ? 4 : o.build, t = o.t || 0;
  ctx.save(); ctx.translate(o.x, o.y); ctx.rotate(o.rot || 0); ctx.scale(s, s);
  if (o.plasma > 0.01){                                                            /* re-entry: a sheath of hot air round the nose and belly */
    for (let k = 0; k < 6; k++) csGlow(ctx, 112 - k * 34, 8, 80 + k * 14, k < 2 ? '#FFE8B0' : '#FF8A30', o.plasma * (0.5 - k * 0.05));
    for (let k = 0; k < 7; k++){ const a = o.plasma * (0.5 - k * 0.05); ctx.fillStyle = 'rgba(255,' + (150 - k * 12) + ',60,' + a + ')'; ctx.beginPath(); ctx.moveTo(130, 4); ctx.quadraticCurveTo(40 - k * 40, -30 - k * 10 + Math.sin(t * 40 + k) * 4, -150 - k * 50, -4 + k * 5); ctx.quadraticCurveTo(40 - k * 40, 36 + k * 8, 130, 4); ctx.fill(); }
  }
  if (o.flame > 1 && b >= 3){ ctx.save(); ctx.translate(-124, 1); ctx.rotate(Math.PI / 2); csFlame(ctx, 0, 0, o.flame, o.fw || 24, o.fk || 'k', t, true); ctx.restore(); }
  if (b < 1){ ctx.restore(); return; }
  if (b < 2){                                                                      /* the frame: ribs and spars, no skin yet */
    hmBodyPath(ctx); ctx.strokeStyle = '#9AA0AC'; ctx.lineWidth = 3; ctx.stroke();
    ctx.lineWidth = 2; ctx.strokeStyle = '#7A808C'; ctx.beginPath();
    for (let x = -96; x <= 112; x += 26){ const top = -17 - Math.max(0, (60 - Math.abs(x - 10)) * 0.12), bot = 13 + (x > 60 ? -(x - 60) * 0.18 : 0); ctx.moveTo(x, top); ctx.lineTo(x, bot); }
    ctx.moveTo(-112, -2); ctx.lineTo(128, 2); ctx.moveTo(-100, -14); ctx.lineTo(60, 14); ctx.moveTo(60, -20); ctx.lineTo(-100, 12); ctx.stroke();
    ctx.restore(); return;
  }
  if (o.gear){                                                                     /* landing gear */
    ctx.strokeStyle = '#6A707C'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(60, 12); ctx.lineTo(60, 33); ctx.moveTo(-58, 10); ctx.lineTo(-58, 33); ctx.stroke();
    for (const wx of [60, -58]){ fillCircle(ctx, wx, 37, 7, '#1E1E24'); fillCircle(ctx, wx, 37, 3.2, '#9AA0AC'); }
  }
  /* tail fin, far wing */
  ctx.fillStyle = '#C8CCD6'; ctx.beginPath(); ctx.moveTo(-100, -14); ctx.lineTo(-126, -66); ctx.lineTo(-90, -66); ctx.lineTo(-52, -18); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#E8662A'; ctx.beginPath(); ctx.moveTo(-122, -58); ctx.lineTo(-126, -66); ctx.lineTo(-90, -66); ctx.lineTo(-96, -50); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#9AA0AC'; ctx.beginPath(); ctx.moveTo(26, 2); ctx.lineTo(-80, -2); ctx.lineTo(-108, -26); ctx.lineTo(-40, -12); ctx.closePath(); ctx.fill();
  /* fuselage */
  hmBodyPath(ctx); const g = ctx.createLinearGradient(0, -26, 0, 18); g.addColorStop(0, '#F4F6FA'); g.addColorStop(0.55, '#DCE0E8'); g.addColorStop(1, '#9AA2B0'); ctx.fillStyle = g; ctx.fill();
  ctx.save(); hmBodyPath(ctx); ctx.clip();
  ctx.fillStyle = '#2A2C34'; ctx.fillRect(-120, 6, 260, 20);                       /* the black heat tiles along the belly */
  ctx.strokeStyle = 'rgba(120,126,140,.7)'; ctx.lineWidth = 1; ctx.beginPath(); for (let x = -112; x < 130; x += 11){ ctx.moveTo(x, 6); ctx.lineTo(x, 20); } ctx.moveTo(-120, 12); ctx.lineTo(140, 12); ctx.stroke();
  ctx.fillStyle = '#E8662A'; ctx.fillRect(-120, -3, 260, 4); ctx.fillStyle = '#F4B040'; ctx.fillRect(-120, 1, 260, 1.4);   /* the orange stripe */
  ctx.restore();
  hmBodyPath(ctx); ctx.strokeStyle = 'rgba(60,66,80,.55)'; ctx.lineWidth = 1.6; ctx.stroke();
  /* near wing, swept back */
  ctx.fillStyle = '#C8CCD6'; ctx.beginPath(); ctx.moveTo(34, 5); ctx.lineTo(-92, 5); ctx.lineTo(-112, 40); ctx.lineTo(-30, 24); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#2A2C34'; ctx.beginPath(); ctx.moveTo(-70, 8); ctx.lineTo(-92, 5); ctx.lineTo(-112, 40); ctx.lineTo(-96, 36); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#E8662A'; ctx.beginPath(); ctx.moveTo(-112, 40); ctx.lineTo(-96, 36); ctx.lineTo(-100, 31); ctx.lineTo(-110, 33); ctx.fill();
  if (b >= 3){                                                                      /* the engine: a nozzle, with the salvaged core glowing in it */
    ctx.fillStyle = '#4A4E58'; ctx.beginPath(); ctx.moveTo(-108, -10); ctx.lineTo(-126, -13); ctx.lineTo(-126, 15); ctx.lineTo(-108, 11); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#2A2C34'; ctx.lineWidth = 1.4; ctx.stroke();
    const eg = o.core === undefined ? 0.5 : o.core; csGlow(ctx, -124, 1, 16, '#FFB050', 0.35 + eg * 0.5); fillCircle(ctx, -124, 1, 5.6, eg > 0.6 ? '#FFF2C0' : '#FF8A30');
  }
  if (b >= 4){                                                                      /* a short, swept-back canopy just big enough for her head and neck, and the lights */
    const lift = o.canopy || 0, pa = o.pilot === true ? 1 : (+o.pilot || 0);
    if (pa > 0.01){                                                                  /* the real giraffe, her neck laid forward, her body down inside the fuselage */
      ctx.save(); ctx.globalAlpha *= pa; hmCanopyPath(ctx); ctx.clip();
      csGiraffe(ctx, { x: HM_PILOT.x, y: HM_PILOT.y, s: HM_PILOT.s, face: 1, neck: HM_PILOT.neck, head: HM_PILOT.head, bare: !!o.bare, boots: !o.bare, moving: false });
      ctx.restore();
    }
    ctx.save(); ctx.translate(12, -21); ctx.rotate(-lift * 0.5); ctx.translate(-12, 21);          /* the canopy tilts up on a rear hinge to let her in and out */
    hmCanopyPath(ctx); const cg = ctx.createLinearGradient(0, -55, 0, -10); cg.addColorStop(0, 'rgba(190,225,255,.30)'); cg.addColorStop(1, 'rgba(120,170,230,.14)'); ctx.fillStyle = cg; ctx.fill();
    ctx.strokeStyle = '#8A92A2'; ctx.lineWidth = 2.2; ctx.stroke();
    { const t = 0.5, tx = (1 - t) * (1 - t) * 12 + 2 * t * (1 - t) * 40 + t * t * 88, ty = (1 - t) * (1 - t) * -21 + 2 * t * (1 - t) * -50 + t * t * -55; ctx.strokeStyle = 'rgba(138,146,162,.9)'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(tx, ty); ctx.lineTo(tx + 2, -19); ctx.stroke(); }   /* a canopy strut */
    ctx.strokeStyle = 'rgba(255,255,255,.65)'; ctx.lineWidth = 1.8; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(24, -31); ctx.quadraticCurveTo(48, -46, 80, -51); ctx.stroke(); ctx.lineCap = 'butt';   /* a glint */
    ctx.restore();
    const blink = Math.sin(t * 6) > 0;
    fillCircle(ctx, -70, -17, 2.4, blink ? '#FF4A3A' : '#7A2A22'); fillCircle(ctx, 128, 3, 2, blink ? '#FFFFFF' : '#8A8A8A'); fillCircle(ctx, -118, -64, 2, blink ? '#4AFF7A' : '#2A6A3A');
    ctx.fillStyle = '#3A404C'; ctx.font = '700 9px ' + CS_MONO; ctx.fillText('SP-1', -30, -8);
  }
  ctx.restore();
}

/* ---- scene A (0 - 8 s): the outpost, and the boarding ---- */
function hmBase(ctx, x, hy, t){
  ctx.fillStyle = 'rgba(0,0,0,.28)'; ctx.beginPath(); ctx.ellipse(x + 20, hy + 6, 190, 14, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = '#9AA0AC'; ctx.fillRect(x - 40, hy - 78, 136, 78); ctx.fillStyle = '#7A808C'; ctx.fillRect(x - 40, hy - 78, 136, 8);
  ctx.fillStyle = '#FFD890'; for (const wx of [x - 20, x + 20, x + 60]) { ctx.fillRect(wx, hy - 56, 20, 22); csGlow(ctx, wx + 10, hy - 45, 30, '#FFD890', 0.3); }
  ctx.fillStyle = '#4A4E58'; ctx.fillRect(x + 80, hy - 124, 14, 50); csGlow(ctx, x + 87, hy - 128, 26, '#FFB070', 0.35);
  for (let k = 0; k < 4; k++){ const a = (t * 0.3 + k / 4) % 1; ctx.globalAlpha = 0.4 * (1 - a); ctx.fillStyle = '#6A6068'; ctx.beginPath(); ctx.arc(x + 87 + Math.sin(k * 2 + t) * 10 * a, hy - 130 - a * 70, 8 + a * 14, 0, TAU); ctx.fill(); } ctx.globalAlpha = 1;
  const dg = ctx.createRadialGradient(x - 90, hy - 40, 20, x - 90, hy, 120); dg.addColorStop(0, 'rgba(190,230,255,.22)'); dg.addColorStop(1, 'rgba(150,200,240,.34)');
  ctx.fillStyle = dg; ctx.beginPath(); ctx.arc(x - 80, hy, 118, Math.PI, TAU); ctx.fill(); ctx.strokeStyle = 'rgba(235,245,255,.85)'; ctx.lineWidth = 3; ctx.stroke();
  ctx.strokeStyle = 'rgba(235,245,255,.35)'; ctx.lineWidth = 1.4; for (let k = 1; k < 5; k++){ ctx.beginPath(); ctx.arc(x - 80, hy, 118, Math.PI + k * Math.PI / 5, Math.PI + k * Math.PI / 5 + 0.001); ctx.moveTo(x - 80, hy); ctx.lineTo(x - 80 + Math.cos(Math.PI + k * Math.PI / 5) * 118, hy + Math.sin(Math.PI + k * Math.PI / 5) * 118); ctx.stroke(); }
  ctx.fillStyle = '#2A4A8A'; for (let k = 0; k < 3; k++) ctx.fillRect(x - 26 + k * 28, hy - 96, 24, 14);
}
function hmPad(ctx, x0, x1, y, t){
  ctx.fillStyle = '#4A4650'; ctx.fillRect(x0, y, x1 - x0, 16); ctx.fillStyle = '#6A6670'; ctx.fillRect(x0, y, x1 - x0, 4);
  ctx.fillStyle = '#F4C040'; for (let x = x0 + 20; x < x1 - 30; x += 70) ctx.fillRect(x, y + 8, 34, 3);
  for (let x = x0 + 10; x < x1; x += 90){ const on = Math.sin(t * 4 + x) > -0.3; fillCircle(ctx, x, y - 2, 3, on ? '#FFD060' : '#6A5A30'); if (on) csGlow(ctx, x, y - 2, 18, '#FFC040', 0.4); }
}
function hmSceneA(ctx, u, t){
  cvOrangeSky(ctx, t, '#2A1208', '#8A3A14', '#E8A050', 6);
  cvVolcano(ctx, 1080, 560, 1.0, t); cvVolcano(ctx, 150, 575, 0.7, t);
  cvGround(ctx, 566, t, 0);
  hmBase(ctx, 300, 570, t); hmPad(ctx, 470, 1260, 566, t);
  const PS = 2.0, PX = 830, PY = 480, open = csBump(u, 5.0, 7.2, 0.5), pilotA = csSm(5.6, 6.3, u);
  hmPlane(ctx, { x: PX, y: PY, s: PS, gear: true, build: 4, t: t, canopy: open, pilot: pilotA, core: 0.3 + 0.2 * Math.sin(t * 2) });
  for (let k = 0; k < 5; k++){ const a = (t * 0.5 + k / 5) % 1; ctx.globalAlpha = 0.5 * (1 - a); ctx.fillStyle = '#E8E0D8'; ctx.beginPath(); ctx.arc(520 + k * 40 + Math.sin(k + t) * 6, 560 - a * 40, 6 + a * 10, 0, TAU); ctx.fill(); } ctx.globalAlpha = 1;   /* steam from the fuel lines */
  if (u < 6.4){                                                                     /* she walks up, climbs in, and the same giraffe is then seen in the cockpit */
    const walk = csSm(0.3, 4.6, u), climb = csSm(4.6, 5.6, u), sx = PX + PS * HM_PILOT.x, sy = PY + PS * HM_PILOT.y;
    ctx.globalAlpha = 1 - csSm(5.6, 6.3, u);
    csGiraffe(ctx, { x: csLerp(csLerp(-130, 840, walk), sx, climb), y: csLerp(566, sy, climb) - Math.sin(climb * Math.PI) * 26, s: PS * HM_PILOT.s, walk: u * 7, moving: walk > 0 && walk < 0.999 && climb < 0.05,
      neck: csLerp(0.35, HM_PILOT.neck, climb), head: csLerp(0.1, HM_PILOT.head, climb), tuck: Math.sin(climb * Math.PI) * 0.9, boots: true, blink: Math.sin(u * 3) > 0.96 ? 1 : 0 });
    ctx.globalAlpha = 1;
  }
}

/* ---- scene B (8 - 15 s): ignition, the take-off run, and the climb ---- */
function hmSceneB(ctx, u, t){
  const run = Math.max(0, u - 2.2), camx = 700 * run * run * run / (3 * 2.4 * 2.4) * (u < 4.6 ? 1 : 1) + (u > 4.6 ? 700 * (u - 4.6) * 1.2 : 0);
  const climb = Math.max(0, u - 4.4), hy = 566 + climb * climb * 70 + climb * 90;
  cvOrangeSky(ctx, t + camx * 0.01, '#2A1208', '#8A3A14', '#E8A050', 6);
  cvVolcano(ctx, 1080 - camx * 0.2, hy - 6, 1.0, t); cvGround(ctx, hy, t, camx);
  hmBase(ctx, 300 - camx, hy + 4, t); hmPad(ctx, 470 - camx, 1260 - camx, hy, t);
  const px = 830 - 190 * csSm(1.0, 4.4, u), sh = u < 2.2 ? csShake(u, 1.4 + u * 1.2) : csShake(u, 1.6);
  const py = 480 - (u > 4.4 ? climb * climb * 26 + climb * 22 : 0), rot = -0.30 * csSm(4.4, 6.0, u);
  const gear = u < 5.7, flame = 30 + 170 * csSm(0.4, 2.2, u);
  for (let k = 0; k < 14; k++){ const a = csC((u - 1.0 - k * 0.14) * 0.5, 0, 1); if (a > 0 && u < 7){ ctx.globalAlpha = 0.65 * (1 - a); ctx.fillStyle = '#C8B8A8'; ctx.beginPath(); ctx.arc(px - 120 - a * (60 + k * 30), hy - 10 - a * 40 + sh[1], 20 + a * 46, 0, TAU); ctx.fill(); } } ctx.globalAlpha = 1;   /* the engine's blast along the pad */
  hmPlane(ctx, { x: px + sh[0], y: py + sh[1], s: 2.0, gear: gear, build: 4, t: t, rot: rot, flame: flame, fw: 30, fk: 'k', pilot: true, core: 0.9 });
  if (u > 5.4){ const a = csSm(5.4, 7.0, u); csClouds(ctx, t * 120, a * 0.9); ctx.fillStyle = 'rgba(255,170,90,' + a * 0.4 + ')'; ctx.fillRect(0, 0, CS_W, CS_H); }
  if (u > 2.2 && u < 5.0){ ctx.strokeStyle = 'rgba(255,230,200,.25)'; ctx.lineWidth = 2; for (let k = 0; k < 10; k++){ const y = 380 + csR(k + 3000) * 190, x = ((csR(k + 3100) * 1500 - camx * 2.4) % 1500 + 1500) % 1500 - 100; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 70 + run * 16, y); ctx.stroke(); } }
}

/* ---- scene C (15 - 23 s): space; Venus falls behind and Earth appears ---- */
function hmSceneC(ctx, u, t){
  ctx.fillStyle = '#02040E'; ctx.fillRect(0, 0, CS_W, CS_H);
  csStars(ctx, 1, t, -u * 26, 0);
  cvVenus(ctx, csLerp(210, -90, csSm(0, 8, u)), csLerp(440, 310, csSm(0, 8, u)), csLerp(360, 150, csSm(0, 8, u)), t);
  csGlow(ctx, 1180, 60, 280, '#FFE8A0', 0.18);
  if (u > 3.4) csEarth(ctx, csLerp(1150, 1040, csSm(3.4, 8, u)), csLerp(250, 280, csSm(3.4, 8, u)), csLerp(8, 58, csSm(3.4, 8, u)), t * 0.05, t, true);
  const bob = Math.sin(t * 1.3) * 6, x = csLerp(300, 620, csSm(0, 3.5, u));
  hmPlane(ctx, { x: x, y: 380 + bob, s: 1.5, build: 4, t: t, rot: -0.04 + Math.sin(t * 0.8) * 0.01, flame: 110, fw: 22, fk: 'h2', pilot: true, core: 0.8 });
  if (u > 3.4) cvHud(ctx, [['ENGINE CORE', 'STABLE', false, '#7AF0A0'], ['COURSE', 'EARTH', false, '#7AF0A0'], ['FUEL', Math.round(88 - u * 1.5) + '%', false, '#FFD27A']], t, 20, 20);
}

/* ---- scene D (23 - 29 s): the approach to Earth ---- */
function hmSceneD(ctx, u, t){
  ctx.fillStyle = '#02040E'; ctx.fillRect(0, 0, CS_W, CS_H);
  csStars(ctx, 1, t, -u * 10, 0); csGlow(ctx, 90, 70, 340, '#FFF0B8', 0.3); csGlow(ctx, 90, 70, 90, '#FFFFFF', 0.5);
  const grow = csSm(0, 6, u); csEarth(ctx, csLerp(1000, 900, grow), csLerp(520, 700, grow), csLerp(260, 560, grow), t * 0.03, t, false);
  const f = csSm(0, 6, u), x = csLerp(250, 720, f), y = csLerp(260, 330, f), s = csLerp(1.25, 0.62, f);
  hmPlane(ctx, { x: x, y: y + Math.sin(t) * 4, s: s, build: 4, t: t, rot: 0.1 + f * 0.1, flame: csLerp(90, 10, f) * 1, fw: 18, fk: 'h2', pilot: true, core: 0.7 });
  if (u > 4.4) hmPlane(ctx, { x: x, y: y, s: s, build: 4, t: t, rot: 0.2, plasma: csSm(4.4, 6, u) * 0.35, pilot: true, flame: 0 });
}

/* ---- scene E (29 - 35.4 s): re-entry ---- */
function hmSceneE(ctx, u, t){
  const alt = csSm(0, 6.4, u);
  csSky(ctx, 0.62 - alt * 0.34); if (alt < 0.5) csStars(ctx, 1 - alt * 2, t, 0, 0);
  csClouds(ctx, t * 300, 0.15 + alt * 0.7);
  const hot = csBump(u, 0.3, 4.3, 0.9), sh = csShake(u, hot * 3.2);
  for (let k = 0; k < 16; k++){ const x = ((csR(k + 3300) * 1700 - t * 1300) % 1700 + 1700) % 1700 - 200, y = 90 + csR(k + 3400) * 540; ctx.strokeStyle = 'rgba(255,' + (190 + (k % 3) * 20) + ',120,' + (0.18 + hot * 0.4) + ')'; ctx.lineWidth = 2 + (k % 3); ctx.beginPath(); ctx.moveTo(x, y - 30); ctx.lineTo(x + 140 + hot * 120, y); ctx.stroke(); }
  hmPlane(ctx, { x: 640 + sh[0], y: 360 + sh[1], s: 1.55, build: 4, t: t, rot: 0.22 - csSm(4.4, 6.2, u) * 0.18, plasma: hot, pilot: true, core: 0.9, flame: 0 });
  if (hot > 0.15) cvHud(ctx, [['HULL TEMP', Math.round(900 + hot * 760 + Math.sin(t * 30) * 20) + ' \u00B0C', hot > 0.7, '#FF6A5A'], ['COMMS', 'BLACKOUT', hot > 0.5, '#FFB070'], ['CORE', 'HOLDING', false, '#7AF0A0']], t, 20, 20);
  if (u > 5.6) { const a = csSm(5.6, 6.3, u); ctx.fillStyle = 'rgba(255,248,230,' + (a * (1 - csSm(6.1, 6.4, u))) * 0.7 + ')'; ctx.fillRect(0, 0, CS_W, CS_H); }
}

/* ---- the savannah and its airfield (scenes F and G) ---- */
function hmAcacia(ctx, x, y, s){
  ctx.fillStyle = '#2A1E16'; ctx.beginPath(); ctx.moveTo(x - 6 * s, y); ctx.quadraticCurveTo(x - 4 * s, y - 70 * s, x - 14 * s, y - 110 * s); ctx.lineTo(x + 2 * s, y - 108 * s); ctx.quadraticCurveTo(x + 2 * s, y - 60 * s, x + 7 * s, y); ctx.fill();
  ctx.fillStyle = '#34402A'; ctx.beginPath(); ctx.ellipse(x - 6 * s, y - 118 * s, 70 * s, 17 * s, 0, 0, TAU); ctx.ellipse(x - 34 * s, y - 108 * s, 40 * s, 12 * s, 0, 0, TAU); ctx.ellipse(x + 26 * s, y - 112 * s, 44 * s, 12 * s, 0, 0, TAU); ctx.fill();
}
function hmSavannahBack(ctx, t, camx){
  const g = ctx.createLinearGradient(0, 0, 0, 560); g.addColorStop(0, '#2E2A5E'); g.addColorStop(0.5, '#C86A5A'); g.addColorStop(1, '#F8B868'); ctx.fillStyle = g; ctx.fillRect(0, 0, CS_W, CS_H);
  csGlow(ctx, 250, 505, 380, '#FFC070', 0.55); fillCircle(ctx, 250, 505, 54, '#FFE2A0'); csGlow(ctx, 250, 505, 90, '#FFF6D8', 0.6);
  ctx.fillStyle = '#6A4A52'; ctx.beginPath(); ctx.moveTo(0, 520); for (let x = 0; x <= CS_W; x += 40) ctx.lineTo(x, 500 - 22 * Math.abs(Math.sin(x * 0.007 + 1.3)) - 10 * Math.sin(x * 0.02)); ctx.lineTo(CS_W, 560); ctx.lineTo(0, 560); ctx.fill();   /* far hills */
  const gg = ctx.createLinearGradient(0, 520, 0, CS_H); gg.addColorStop(0, '#D6A24E'); gg.addColorStop(1, '#8A5A2A'); ctx.fillStyle = gg; ctx.fillRect(0, 540, CS_W, CS_H - 540);
  ctx.strokeStyle = 'rgba(120,80,30,.35)'; ctx.lineWidth = 1; for (let k = 0; k < 70; k++){ const x = (csR(k + 3500) * 1500 - camx) % 1400, y = 545 + csR(k + 3600) * 160; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.sin(t * 2 + k) * 2, y - 10 - csR(k + 3700) * 8); ctx.stroke(); }
  for (const a of [[120, 548, 0.8], [380, 545, 0.55], [610, 549, 0.9], [900, 546, 0.6]]) hmAcacia(ctx, a[0] - camx * 0.3, a[1], a[2]);
  for (let k = 0; k < 5; k++) csGiraffe(ctx, { x: 470 + k * 78 + Math.sin(k * 3) * 18 - camx * 0.2, y: 556, s: 0.2 + (k % 2) * 0.04, walk: t * 1.4 + k, moving: true, neck: 0.3 + 0.1 * Math.sin(t * 0.7 + k), bare: true, boots: false, coat: '#3A2A24', darkc: '#2A1E1A', spotc: '#1E1612' });   /* a distant herd */
}
function hmHangar(ctx, x, y, t){
  ctx.fillStyle = 'rgba(0,0,0,.3)'; ctx.fillRect(x - 20, y - 6, 330, 12);
  ctx.fillStyle = '#7A6A5A'; ctx.fillRect(x, y - 210, 290, 210); ctx.fillStyle = '#6A5A4A'; ctx.beginPath(); ctx.moveTo(x - 14, y - 206); ctx.quadraticCurveTo(x + 145, y - 290, x + 304, y - 206); ctx.lineTo(x + 304, y - 196); ctx.lineTo(x - 14, y - 196); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(40,30,24,.4)'; ctx.lineWidth = 2; for (let k = 1; k < 14; k++){ ctx.beginPath(); ctx.moveTo(x + k * 21, y - 206); ctx.lineTo(x + k * 21, y); ctx.stroke(); }
  ctx.fillStyle = '#1A1210'; ctx.fillRect(x + 40, y - 170, 210, 170); csGlow(ctx, x + 145, y - 80, 150, '#FFB868', 0.28);
  ctx.fillStyle = '#C8A878'; ctx.font = '800 22px ' + CS_MONO; ctx.textAlign = 'center'; ctx.fillText('HANGAR 7', x + 145, y - 220); ctx.textAlign = 'left';
  ctx.fillStyle = '#4A4036'; ctx.fillRect(x + 262, y - 270, 10, 70); fillCircle(ctx, x + 267, y - 274, 6, Math.sin(t * 3) > 0 ? '#FF8A3A' : '#6A3A20');
}
function hmRunway(ctx, y, camx, t){
  ctx.fillStyle = '#54505A'; ctx.fillRect(0, y, CS_W, 54); ctx.fillStyle = '#6A6670'; ctx.fillRect(0, y, CS_W, 4);
  ctx.fillStyle = '#E8E0C8'; for (let x = -((camx) % 90); x < CS_W; x += 90) ctx.fillRect(x, y + 24, 46, 4);
  for (let x = -((camx) % 70); x < CS_W; x += 70){ const on = Math.sin(t * 3 + x * 0.05) > -0.6; fillCircle(ctx, x, y + 48, 3, on ? '#FFD060' : '#7A6A30'); if (on) csGlow(ctx, x, y + 48, 16, '#FFC040', 0.5); }
}
function hmSceneF(ctx, u, t){
  hmSavannahBack(ctx, t, 0); hmRunway(ctx, 570, 0, t); hmHangar(ctx, 990, 590, t);
  ctx.strokeStyle = '#4A4036'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(930, 570); ctx.lineTo(930, 460); ctx.stroke();
  ctx.fillStyle = '#E8662A'; ctx.beginPath(); ctx.moveTo(930, 462); ctx.lineTo(990 + Math.sin(t * 2) * 6, 470 + Math.sin(t * 3) * 3); ctx.lineTo(930, 484); ctx.fill(); ctx.fillStyle = '#F4F4F0'; ctx.beginPath(); ctx.moveTo(950, 466); ctx.lineTo(966, 468); ctx.lineTo(950, 478); ctx.fill();   /* the windsock */
  const td = 4.3, roll = csC((u - td) / 2.7, 0, 1), air = u < td;
  const x = air ? csLerp(-160, 520, csSm(0, td, u)) : csLerp(520, 860, 1 - Math.pow(1 - roll, 2.2));
  const gy = 570 - 74 * 1.45 * 0.5 + 6, y = air ? csLerp(150, gy, Math.pow(csSm(0, td, u), 1.5)) : gy, rot = air ? 0.12 - csSm(2.6, td, u) * 0.1 : 0;
  hmPlane(ctx, { x: x, y: y, s: 1.45, gear: true, build: 4, t: t, rot: rot, pilot: true, core: 0.4, flame: air ? 20 : 0, fk: 'k', fw: 12 });
  if (!air){ csLandingDust(ctx, u - td, 520, 570); if (roll < 0.9) for (const wx of [x + 60 * 1.45, x - 58 * 1.45]){ ctx.globalAlpha = 0.4 * (1 - roll); ctx.fillStyle = '#E8E0D0'; ctx.beginPath(); ctx.ellipse(wx - 20, 566, 30, 8, 0, 0, TAU); ctx.fill(); } ctx.globalAlpha = 1; }
}
function hmHelmet(ctx, x, y, a, k){ ctx.save(); ctx.translate(x, y); ctx.rotate(a); ctx.scale(k || 1, k || 1); ctx.fillStyle = 'rgba(190,225,255,.35)'; ctx.beginPath(); ctx.arc(0, 0, 21, 0, TAU); ctx.fill(); ctx.strokeStyle = 'rgba(235,245,255,.9)'; ctx.lineWidth = 2; ctx.stroke(); ctx.fillStyle = '#C8CCD4'; ctx.beginPath(); ctx.ellipse(0, 18, 14, 5, 0, 0, TAU); ctx.fill(); ctx.strokeStyle = 'rgba(255,255,255,.8)'; ctx.lineWidth = 2.4; ctx.beginPath(); ctx.arc(0, 0, 16, Math.PI * 1.1, Math.PI * 1.45); ctx.stroke(); ctx.restore(); }
function hmSceneG(ctx, u, t){
  const CUT = 3.6;                                                                    /* outside until 3.6 s, then the hangar */
  if (u < CUT){                                                                       /* outside: she climbs out and takes her helmet off */
    hmSavannahBack(ctx, t, 0); hmRunway(ctx, 570, 0, t); hmHangar(ctx, 990, 590, t);
    ctx.strokeStyle = '#4A4036'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(930, 570); ctx.lineTo(930, 460); ctx.stroke(); ctx.fillStyle = '#E8662A'; ctx.beginPath(); ctx.moveTo(930, 462); ctx.lineTo(990 + Math.sin(t * 2) * 6, 470); ctx.lineTo(930, 484); ctx.fill();
    const PS = 1.45, PX = 860, PY = 570 - 74 * PS * 0.5 + 6, K = HM_PILOT.s, outA = csSm(0.7, 1.4, u), hop = csSm(1.2, 2.1, u), off = csSm(2.2, 2.9, u), walk = csSm(2.9, 3.6, u), helmetOn = u < 2.2;
    hmPlane(ctx, { x: PX, y: PY, s: PS, gear: true, build: 4, t: t, canopy: csBump(u, 0.2, 3.4, 0.8), pilot: 1 - outA, core: 0.2 });
    const g = { x: csLerp(PX + PS * HM_PILOT.x, 1010, hop) + csLerp(0, 110, walk), y: csLerp(PY + PS * HM_PILOT.y, 570, hop) - Math.sin(hop * Math.PI) * 30, s: PS * K, face: 1, walk: u * 6, moving: walk > 0 && walk < 1,
      neck: helmetOn ? csLerp(HM_PILOT.neck, 0.2, hop) : csLerp(0.2, -0.1, off) + 0.4 * walk, head: helmetOn ? csLerp(HM_PILOT.head, 0.1, hop) : csLerp(0.1, -0.35, off) * (1 - walk) + 0.1 * walk,
      blink: !helmetOn && walk < 0.3 ? 1 : 0, bare: !helmetOn, boots: helmetOn, tuck: (1 - hop) * Math.sin(Math.min(1, outA * 2) * Math.PI / 2) * 0.9 };
    if (u > 0.7){ ctx.globalAlpha = outA; csGiraffe(ctx, g); ctx.globalAlpha = 1; }
    if (u >= 2.2){                                                                    /* the helmet drops from her head and rolls on the ground */
      const g0 = { x: 1010, y: 570, s: PS * K, face: 1, neck: 0.2, head: 0.1 }, hp = csGiraffeHead(g0), tau = u - 2.2;
      hmHelmet(ctx, hp.x - tau * 30, Math.min(556, hp.y + 560 * tau * tau), tau * 5, (31 * PS * K) / 21);
    }
    if (u > 2.2){ ctx.globalAlpha = 0.6 * (1 - csSm(2.2, 3.6, u)); ctx.fillStyle = '#FFF4D8'; for (let k = 0; k < 8; k++){ const a = csC((u - 2.2) / 1.4, 0, 1); ctx.beginPath(); ctx.arc(1030 + k * 8 + a * 40, 410 - a * 60 + Math.sin(k * 2 + t * 3) * 8, 2, 0, TAU); ctx.fill(); } ctx.globalAlpha = 1; }
  } else {                                                                            /* inside the hangar: a hatch in the floor, and down she goes */
    const v = u - CUT;
    ctx.fillStyle = '#1C1410'; ctx.fillRect(0, 0, CS_W, CS_H);
    const wall = ctx.createLinearGradient(0, 0, 0, 470); wall.addColorStop(0, '#2A2018'); wall.addColorStop(1, '#5A4636'); ctx.fillStyle = wall; ctx.fillRect(0, 0, CS_W, 470);
    ctx.strokeStyle = 'rgba(0,0,0,.3)'; ctx.lineWidth = 3; for (let x = 0; x < CS_W; x += 80){ ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 470); ctx.stroke(); }
    ctx.fillStyle = '#FFD890'; ctx.fillRect(160, 120, 90, 150); csGlow(ctx, 205, 195, 190, '#FFB868', 0.28); ctx.fillStyle = '#1C1410'; ctx.fillRect(166, 126, 78, 138);
    for (const lx of [420, 900]){ ctx.strokeStyle = '#3A3028'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(lx, 0); ctx.lineTo(lx, 90); ctx.stroke(); fillCircle(ctx, lx, 100, 14, '#FFE0A0'); csGlow(ctx, lx, 100, 150, '#FFC870', 0.35); }
    ctx.fillStyle = '#6A5A4A'; ctx.fillRect(0, 470, CS_W, 24); ctx.fillStyle = '#8A7A68'; ctx.fillRect(0, 470, CS_W, 5);
    const hatch = csSm(0.4, 1.4, v);
    ctx.fillStyle = '#0A0806'; ctx.fillRect(560, 470, 220, 250);                    /* the shaft below the hatch, glowing gold from far down */
    const sg = ctx.createLinearGradient(0, 470, 0, 720); sg.addColorStop(0, 'rgba(255,200,110,.0)'); sg.addColorStop(1, 'rgba(255,200,110,' + (0.55 * hatch) + ')'); ctx.fillStyle = sg; ctx.fillRect(560, 470, 220, 250);
    ctx.strokeStyle = '#8A7A68'; ctx.lineWidth = 3; for (let k = 0; k < 8; k++){ ctx.beginPath(); ctx.moveTo(560 + (k % 2) * 40, 490 + k * 30); ctx.lineTo(560 + ((k + 1) % 2) * 40 + 40, 520 + k * 30); ctx.stroke(); }
    ctx.fillStyle = '#7A6A58'; ctx.fillRect(560 - hatch * 100, 470, 110, 10); ctx.fillRect(670 + hatch * 100, 470, 110, 10);   /* the two leaves of the hatch slide apart */
    ctx.strokeStyle = 'rgba(240,200,120,.5)'; ctx.lineWidth = 2; ctx.strokeRect(560 - hatch * 100, 470, 110, 10); ctx.strokeRect(670 + hatch * 100, 470, 110, 10);
    csGlow(ctx, 670, 478, 150 * hatch, '#FFC870', 0.5);
    const wk = csSm(0.1, 1.6, v), dn = csSm(1.7, 3.0, v), gx = csLerp(-60, 560, wk) + csLerp(0, 110, dn), gy = 470 + dn * 235;
    ctx.save(); ctx.beginPath(); ctx.rect(0, 0, CS_W, 472); ctx.rect(570, 472, 200, 250); ctx.clip();           /* below the floor she is only visible inside the shaft */
    csGiraffe(ctx, { x: gx, y: gy, s: csLerp(0.72, 0.62, dn), walk: v * 6, moving: wk < 0.999 || (dn > 0.01 && dn < 0.99), neck: csLerp(0.2, 0.0, dn), head: 0.15, bare: true, boots: false });
    ctx.restore();
  }
}

/* ---- scene H (49 - 61.5 s): the Underground Giraffe City ---- */
function hmCityBack(ctx, t){
  const bg = ctx.createLinearGradient(0, 0, 0, CS_H); bg.addColorStop(0, '#120A18'); bg.addColorStop(0.55, '#3A2238'); bg.addColorStop(1, '#6A4430'); ctx.fillStyle = bg; ctx.fillRect(0, 0, CS_W, CS_H);
  for (let k = 0; k < 7; k++){ const x = 80 + k * 190 + csR(k + 4000) * 60, L = 70 + csR(k + 4100) * 90; ctx.fillStyle = '#0E0812'; ctx.beginPath(); ctx.moveTo(x - 40, -2); ctx.lineTo(x, L); ctx.lineTo(x + 40, -2); ctx.closePath(); ctx.fill(); }
  for (let k = 0; k < 26; k++){ const x = csR(k + 4200) * CS_W, y = csR(k + 4300) * 120 + 20, p = 0.5 + 0.5 * Math.sin(t * 2 + k); csGlow(ctx, x, y, 14, k % 3 ? '#7AE8FF' : '#FF9AD8', 0.25 + 0.3 * p); }
  /* tiers of carved homes on the far wall */
  for (let tier = 0; tier < 3; tier++){
    const y0 = 190 + tier * 118, h = 100;
    ctx.fillStyle = tier % 2 ? '#2A1A26' : '#321E2E'; ctx.fillRect(0, y0, CS_W, h);
    ctx.fillStyle = '#4A3040'; ctx.fillRect(0, y0, CS_W, 5);
    for (let k = 0; k < 14; k++){
      const x = 24 + k * 94 + (tier % 2) * 40 + csR(k + tier * 20 + 4400) * 12, tall = 58 + csR(k + tier * 30 + 4500) * 24, on = Math.sin(t * 1.3 + k * 2 + tier) > -0.8;
      ctx.fillStyle = on ? '#FFD890' : '#5A4A3A'; ctx.beginPath(); ctx.moveTo(x, y0 + h); ctx.lineTo(x, y0 + h - tall + 16); ctx.quadraticCurveTo(x + 14, y0 + h - tall - 6, x + 28, y0 + h - tall + 16); ctx.lineTo(x + 28, y0 + h); ctx.fill();
      if (on) csGlow(ctx, x + 14, y0 + h - tall * 0.5, 36, '#FFC870', 0.32);
    }
  }
  ctx.strokeStyle = '#4A3040'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(300, 300); ctx.quadraticCurveTo(480, 330, 660, 300); ctx.moveTo(760, 420); ctx.quadraticCurveTo(920, 450, 1100, 420); ctx.stroke();   /* rope bridges */
  const wf = ctx.createLinearGradient(1090, 0, 1090, 520); wf.addColorStop(0, 'rgba(170,230,255,.1)'); wf.addColorStop(1, 'rgba(170,230,255,.5)'); ctx.fillStyle = wf; ctx.fillRect(1160, 0, 34, 540);   /* a waterfall into a glowing pool */
  for (let k = 0; k < 14; k++){ const y = ((t * 220 + k * 40) % 540); ctx.fillStyle = 'rgba(240,250,255,.5)'; ctx.fillRect(1164 + (k % 4) * 8, y, 2, 14); }
  ctx.fillStyle = 'rgba(120,230,255,.28)'; ctx.beginPath(); ctx.ellipse(1175, 600, 150, 28, 0, 0, TAU); ctx.fill(); csGlow(ctx, 1175, 600, 170, '#7AE8FF', 0.3);
  ctx.fillStyle = '#3A2830'; ctx.fillRect(0, 612, CS_W, 108); ctx.fillStyle = '#5A4038'; ctx.fillRect(0, 612, CS_W, 6);
  for (let k = 0; k < 12; k++){ const x = 60 + k * 106 + csR(k + 4600) * 30; ctx.strokeStyle = '#4A3A2A'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x, 612); ctx.lineTo(x, 520); ctx.stroke(); fillCircle(ctx, x, 514, 9, '#FFE0A0'); csGlow(ctx, x, 514, 70, '#FFC870', 0.28 + 0.1 * Math.sin(t * 3 + k)); }
  for (let k = 0; k < 18; k++){ const x = csR(k + 4700) * CS_W, h = 14 + csR(k + 4800) * 22; ctx.fillStyle = '#7AE8B8'; ctx.beginPath(); ctx.ellipse(x, 616, 8, h * 0.4, 0, Math.PI, TAU); ctx.fill(); csGlow(ctx, x, 612 - h * 0.2, 26, '#7AE8B8', 0.2); }
}
function hmSceneH(ctx, u, t){
  const z = csLerp(1.0, 1.07, csSm(6, 12, u)); ctx.save(); ctx.translate(640, 640); ctx.scale(z, z); ctx.translate(-640, -640);       /* a slow push in: it crops the cavern, it never reveals an edge */
  hmCityBack(ctx, t);
  const cr = [[1010, 0.70, 1, -1], [900, 0.56, 2, -1], [1110, 0.62, 3, -1], [330, 0.60, 4, 1], [190, 0.66, 1, 1], [1230, 0.52, 2, -1]];
  cr.forEach((c, i) => csGiraffe(ctx, Object.assign({ x: c[0], y: 616, s: c[1], face: c[3], walk: t * 1.2 + i, moving: false, neck: 0.28 + 0.1 * Math.sin(t * 0.9 + i) + (u > 5 ? 0.12 : 0), head: 0.1, bare: true, boots: false, blink: Math.sin(t * 0.7 + i * 2) > 0.97 ? 1 : 0 }, HM_COATS[c[2]])));
  const meet = csSm(4.4, 6.4, u), ex = csLerp(820, 700, csSm(4.4, 5.8, u));
  const elder = Object.assign({ x: ex, y: 616, s: 0.92, face: -1, walk: u * 2, moving: u > 4.4 && u < 5.8, neck: csLerp(0.2, 0.62, meet), head: csLerp(0.1, 0.3, meet), bare: true, boots: false, blink: 0 }, { coat: '#EAD39A', darkc: '#CDB074', spotc: '#A07A3C' });
  csGiraffe(ctx, elder);
  ctx.fillStyle = '#7A3A5A'; ctx.beginPath(); ctx.moveTo(ex - 8, 616 - 150 * 0.92); ctx.quadraticCurveTo(ex - 52, 616 - 126 * 0.92, ex - 28, 616 - 66 * 0.92); ctx.lineTo(ex + 22, 616 - 74 * 0.92); ctx.quadraticCurveTo(ex + 28, 616 - 128 * 0.92, ex - 8, 616 - 150 * 0.92); ctx.fill();   /* the elder's shawl */
  ctx.fillStyle = '#E8C060'; ctx.beginPath(); ctx.arc(ex - 8, 616 - 150 * 0.92, 4, 0, TAU); ctx.fill();
  const wk = csSm(0.3, 4.6, u), gx = csLerp(-120, 470, wk);
  csGiraffe(ctx, { x: gx, y: 616, s: 0.92, face: 1, walk: u * 6, moving: wk > 0 && wk < 0.999, neck: csLerp(0.05, 0.62, meet), head: csLerp(0.2, -0.05, meet), bare: true, boots: false, blink: u > 5.8 && u < 6.4 ? 1 : 0 });
  const bx = csLerp(1280, 560, csSm(6.8, 9.2, u));
  if (u > 6.6) csGiraffe(ctx, Object.assign({ x: bx, y: 616, s: 0.42, face: -1, walk: u * 9, moving: u < 9.2, neck: 0.25, head: 0.1, bare: true, boots: false }, HM_COATS[4]));    /* a calf runs up to say hello */
  for (let k = 0; k < 22; k++){ const a = (t * 0.1 + csR(k + 5000)) % 1; ctx.globalAlpha = 0.5 * Math.sin(a * Math.PI); fillCircle(ctx, csR(k + 5100) * CS_W + Math.sin(t + k) * 14, 620 - a * 520, 2.4, '#FFE8A0'); } ctx.globalAlpha = 1;   /* floating lantern sparks */
  ctx.restore();
}

/* ---- put it together ---- */
function hmScene(ctx, t){
  const T = HM_T;
  if (t < T.B) hmSceneA(ctx, t - T.A, t);
  else if (t < T.C) hmSceneB(ctx, t - T.B, t);
  else if (t < T.D) hmSceneC(ctx, t - T.C, t);
  else if (t < T.E) hmSceneD(ctx, t - T.D, t);
  else if (t < T.F) hmSceneE(ctx, t - T.E, t);
  else if (t < T.G) hmSceneF(ctx, t - T.F, t);
  else if (t < T.H) hmSceneG(ctx, t - T.G, t);
  else hmSceneH(ctx, t - T.H, t);
}
function hmFade(t){
  let f = 1 - csSm(0, 1.2, t);
  f = Math.max(f, csSm(HM_T.END - 2.0, HM_T.END, t));
  for (const b of [HM_T.B, HM_T.C, HM_T.D, HM_T.E, HM_T.F, HM_T.G, HM_T.H]) f = Math.max(f, 1 - csSm(0, 0.4, Math.abs(t - b)));
  f = Math.max(f, 1 - csSm(0, 0.35, Math.abs(t - (HM_T.G + 3.6))));
  return f;
}
function hmOverlays(ctx, t){
  const v = ctx.createRadialGradient(640, 360, 300, 640, 360, 780); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,.4)');
  ctx.fillStyle = v; ctx.fillRect(0, 0, CS_W, CS_H);
  let cap = null;
  for (let i = 0; i < HM_CAPS.length; i++) if (t >= HM_CAPS[i][0] && t < HM_CAPS[i][0] + HM_CAPS[i][3]) cap = HM_CAPS[i];
  if (cap){
    const a = csSm(0, 0.25, t - cap[0]) * (1 - csSm(cap[3] - 0.35, cap[3], t - cap[0])), wide = cap[1].length > 22;
    ctx.globalAlpha = a; ctx.fillStyle = 'rgba(0,0,10,.58)'; ctx.fillRect(0, 618, wide ? 760 : cap[2] ? 640 : 460, cap[2] ? 84 : 58);
    ctx.fillStyle = '#FFD27A'; ctx.fillRect(0, 618, 5, cap[2] ? 84 : 58);
    csText(ctx, cap[1], 26, 652, 25, '#F4F8FF', 'left', '800');
    if (cap[2]) csText(ctx, cap[2], 26, 682, 15, '#C8D0E0', 'left', '600');
    ctx.globalAlpha = 1;
  }
  const hu = t - (HM_T.H + 8.4);
  if (hu > 0){ const a = csSm(0, 1.6, hu); ctx.globalAlpha = a; csGlow(ctx, 640, 150, 340, '#FFD27A', 0.28); csText(ctx, 'HOME', 640, 168, 78, '#FFE6A8', 'center', '800'); ctx.globalAlpha = 1; }
  const f = hmFade(t);
  if (f > 0.005){ ctx.fillStyle = 'rgba(0,0,0,' + f + ')'; ctx.fillRect(0, 0, CS_W, CS_H); }
}
const HM_CUES = [];
(function(){
  const add = (t, fn) => HM_CUES.push([t, fn]);
  add(1.0, () => SFX.click()); add(4.7, () => SFX.click()); add(6.4, () => SFX.whoosh()); add(7.2, () => SFX.boom());
  add(8.6, () => SFX.zap()); add(9.0, () => SFX.boom()); add(10.4, () => SFX.whoosh()); add(12.4, () => SFX.boom()); add(13.0, () => SFX.whoosh());
  add(15.6, () => SFX.whoosh()); for (let x = 19; x < 22; x += 0.8) add(x, () => SFX.click()); add(23.5, () => SFX.level());
  add(29.8, () => SFX.boom()); for (let x = 30.4; x < 33; x += 0.5) add(x, () => SFX.click()); add(33.4, () => SFX.whoosh());
  add(36.4, () => SFX.whoosh()); add(39.7, () => SFX.boom()); add(40.0, () => SFX.whoosh());
  add(43.8, () => SFX.click()); add(45.2, () => SFX.zap()); add(47.2, () => SFX.click()); add(48.6, () => SFX.boom());
  add(50.2, () => SFX.level()); add(54.9, () => SFX.click()); add(55.6, () => SFX.level()); add(58.4, () => SFX.level()); add(60.0, () => SFX.over());
  HM_CUES.sort((a, b) => a[0] - b[0]);
})();

