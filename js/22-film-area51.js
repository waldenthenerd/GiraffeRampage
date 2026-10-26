'use strict';
/* The Area 51 film. */
/* ======================= THE AREA 51 FILM (the end of Chapter 11) ======================= */
/* The giraffe takes a small trainer jet from the old airfield, flies west across the desert, is picked up by the base's radar, and jumps.
   She skydives, opens a parachute, and comes down just outside Area 51. Like the other films, every frame is a pure function of time. */
const A51_T = { A: 0, B: 8.5, C: 17.5, D: 27.5, E: 34.5, F: 44, END: 57.5 };
const A51_CAPS = [
  [0.8, 'THE CHANGED SAVANNAH', 'Whatever did this came from the west', 3.8],
  [4.8, 'AN OLD TRAINER JET', 'Left behind on the airfield', 3.2],
  [9.1, 'TAKEOFF', '', 2.2],
  [12.6, 'HEADING WEST', '', 2.4],
  [18.2, 'NEVADA', 'Miles of empty desert', 3.2],
  [22.6, 'RESTRICTED AIRSPACE', 'No flight plan. No clearance.', 3.6],
  [28.0, 'AREA 51', 'Radar has found her', 2.8],
  [31.0, 'NO PLACE TO LAND', 'She jumps', 2.8],
  [35.0, 'FREEFALL', '', 2.6],
  [45.0, 'PARACHUTE', '', 2.2],
  [52.4, 'TOUCHDOWN', '', 2.0]
];
/* ---- shared pieces ---- */
function afSky(ctx, top, mid, bot){ const g = ctx.createLinearGradient(0, 0, 0, CS_H); g.addColorStop(0, top); g.addColorStop(0.6, mid); g.addColorStop(1, bot); ctx.fillStyle = g; ctx.fillRect(0, 0, CS_W, CS_H); }
function afCloud(ctx, x, y, s, a, col){ ctx.globalAlpha = a; ctx.fillStyle = col || '#FFFFFF'; for (let j = 0; j < 5; j++){ ctx.beginPath(); ctx.ellipse(x + (j - 2) * 34 * s, y + Math.sin(j * 2.1) * 8 * s, 46 * s, 20 * s, 0, 0, TAU); ctx.fill(); } ctx.globalAlpha = 1; }
function afClouds(ctx, scroll, n, yMin, yMax, a, col){
  for (let k = 0; k < n; k++){
    const x = (((csR(k + 9600) * 1900 - scroll * (0.6 + csR(k + 9650) * 0.8)) % 1900) + 1900) % 1900 - 310;
    afCloud(ctx, x, yMin + csR(k + 9700) * (yMax - yMin), 0.7 + csR(k + 9750) * 1.2, a * (0.5 + 0.5 * csR(k + 9800)), col);
  }
}
function afRidge(ctx, base, amp, seed, col, scroll){
  ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(0, CS_H + 40);
  for (let x = 0; x <= CS_W + 20; x += 20){ const u = x + scroll; ctx.lineTo(x, base - amp * (0.9 + 0.55 * Math.sin(u * 0.0045 + seed) + 0.35 * Math.sin(u * 0.0113 + seed * 2.3) + 0.12 * Math.sin(u * 0.03 + seed * 5))); }
  ctx.lineTo(CS_W + 20, CS_H + 40); ctx.closePath(); ctx.fill();
}
function afAcacia(ctx, x, y, s){
  ctx.fillStyle = '#2A1A1E'; ctx.fillRect(x - 3 * s, y - 52 * s, 6 * s, 52 * s);
  ctx.beginPath(); ctx.ellipse(x, y - 56 * s, 56 * s, 12 * s, 0, 0, TAU); ctx.fill(); ctx.beginPath(); ctx.ellipse(x - 26 * s, y - 50 * s, 30 * s, 8 * s, 0, 0, TAU); ctx.fill();
}
/* the savannah at sunset, with the ground line at gy (it drops away as the jet climbs) */
function afSavanna(ctx, t, gy, sc){
  afSky(ctx, '#2A2250', '#C85A3A', '#F6B060');
  csGlow(ctx, 820, gy - 70, 340, '#FFD890', 0.5); fillCircle(ctx, 820, gy - 70, 46, '#FFE9B8');
  afClouds(ctx, sc * 0.05 + t * 6, 6, 70, 260, 0.35, '#F8C8A0');
  afRidge(ctx, gy - 40, 70, 1.3, '#6A3A3A', sc * 0.1); afRidge(ctx, gy - 6, 50, 4.1, '#4A2A2E', sc * 0.25);
  for (let k = 0; k < 5; k++) afAcacia(ctx, (((k * 410 + 120 - sc * 0.4) % 2100) + 2100) % 2100 - 300, gy - 4, 0.8 + (k % 3) * 0.25);
  if (gy < CS_H){ const gg = ctx.createLinearGradient(0, gy, 0, CS_H); gg.addColorStop(0, '#6A4A2A'); gg.addColorStop(1, '#3A2418'); ctx.fillStyle = gg; ctx.fillRect(0, gy, CS_W, CS_H - gy + 2); }
}
/* a night desert horizon at ground line gy */
function afNight(ctx, t, gy, sc){
  afSky(ctx, '#02040C', '#0C1630', '#2A2848'); csStars(ctx, 1, t, 0, 0);
  afRidge(ctx, gy - 20, 60, 3.4, '#0C1020', sc * 0.1); afRidge(ctx, gy, 36, 7.7, '#080A14', sc * 0.2);
  if (gy < CS_H){ const gg = ctx.createLinearGradient(0, gy, 0, CS_H); gg.addColorStop(0, '#1C1710'); gg.addColorStop(1, '#0C0A07'); ctx.fillStyle = gg; ctx.fillRect(0, gy, CS_W, CS_H - gy + 2); }
}
function afBeam(ctx, x, y, ang, len, spread, a){
  ctx.fillStyle = 'rgba(214,255,206,' + a + ')'; ctx.beginPath(); ctx.moveTo(x, y);
  ctx.lineTo(x + Math.cos(ang - spread) * len, y + Math.sin(ang - spread) * len); ctx.lineTo(x + Math.cos(ang + spread) * len, y + Math.sin(ang + spread) * len); ctx.closePath(); ctx.fill();
}
/* the base on the horizon: four hangars with lit doors, a fence, two towers, and the green glow from below. Returns the two tower tops. */
function afBase(ctx, gy, t, k, x0){
  csGlow(ctx, x0 + 360 * k, gy, 330 * k, '#9BE86A', 0.22 + 0.06 * Math.sin(t * 2));
  ctx.strokeStyle = 'rgba(200,210,190,.5)'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(x0 - 120 * k, gy - 16 * k); ctx.lineTo(x0 + 860 * k, gy - 16 * k); ctx.stroke();
  ctx.fillStyle = 'rgba(200,210,190,.5)'; for (let x = x0 - 120 * k; x < x0 + 860 * k; x += 40 * k) ctx.fillRect(x - 1, gy - 22 * k, 2, 22 * k);
  for (let i = 0; i < 4; i++){
    const hx = x0 + i * 190 * k, hw = 150 * k, hh = (46 + (i % 2) * 14) * k;
    ctx.fillStyle = '#10140F'; ctx.beginPath(); ctx.moveTo(hx, gy); ctx.lineTo(hx, gy - hh * 0.6); ctx.quadraticCurveTo(hx + hw / 2, gy - hh * 1.5, hx + hw, gy - hh * 0.6); ctx.lineTo(hx + hw, gy); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#9BE86A'; ctx.globalAlpha = 0.55 + 0.2 * Math.sin(t * 2 + i); ctx.fillRect(hx + hw * 0.3, gy - hh * 0.5, hw * 0.4, hh * 0.5); ctx.globalAlpha = 1;
  }
  const tops = [];
  for (const tx of [x0 - 60 * k, x0 + 800 * k]){
    ctx.fillStyle = '#10140F'; ctx.fillRect(tx - 4 * k, gy - 120 * k, 8 * k, 120 * k); ctx.fillRect(tx - 16 * k, gy - 140 * k, 32 * k, 22 * k);
    fillCircle(ctx, tx, gy - 146 * k, 3 * k, Math.sin(t * 4 + tx) > 0 ? '#FF4A3A' : '#5A1A14'); tops.push({ x: tx, y: gy - 130 * k });
  }
  return tops;
}
/* the little trainer jet, side on and nose to the right. It is drawn in the same units as the spaceplane, so the pilot is the very same
   giraffe sprite as in the homecoming film (HM_PILOT), bare-headed, with her neck laid forward under the canopy. */
function afJetBody(ctx){ ctx.beginPath(); ctx.moveTo(-118, -12); ctx.quadraticCurveTo(-20, -24, 48, -20); ctx.quadraticCurveTo(120, -14, 158, 4); ctx.quadraticCurveTo(110, 16, 30, 17); ctx.lineTo(-118, 12); ctx.closePath(); }
function afJet(ctx, o){
  const s = o.s || 1, t = o.t || 0;
  ctx.save(); ctx.translate(o.x, o.y); ctx.rotate(o.rot || 0); ctx.scale(s, s);
  if (o.flame > 1){ ctx.save(); ctx.translate(-126, 0); ctx.rotate(Math.PI / 2); csFlame(ctx, 0, 0, o.flame, 16, 'k', t, true); ctx.restore(); }
  if (o.gear){ ctx.strokeStyle = '#6A707C'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(70, 12); ctx.lineTo(70, 33); ctx.moveTo(-50, 10); ctx.lineTo(-50, 33); ctx.stroke(); for (const wx of [70, -50]){ fillCircle(ctx, wx, 37, 7, '#1E1E24'); fillCircle(ctx, wx, 37, 3.2, '#9AA0AC'); } }
  ctx.fillStyle = '#B8BCC8'; ctx.beginPath(); ctx.moveTo(-96, -12); ctx.lineTo(-122, -58); ctx.lineTo(-92, -58); ctx.lineTo(-52, -16); ctx.closePath(); ctx.fill();              /* far fin and wing */
  ctx.fillStyle = '#9AA0AC'; ctx.beginPath(); ctx.moveTo(26, 2); ctx.lineTo(-70, -2); ctx.lineTo(-104, -22); ctx.lineTo(-40, -10); ctx.closePath(); ctx.fill();
  afJetBody(ctx); const g = ctx.createLinearGradient(0, -24, 0, 17); g.addColorStop(0, '#F4F6FA'); g.addColorStop(0.6, '#D6DAE4'); g.addColorStop(1, '#9AA2B0'); ctx.fillStyle = g; ctx.fill();
  ctx.save(); afJetBody(ctx); ctx.clip();
  ctx.fillStyle = '#C8302A'; ctx.fillRect(-120, -3, 290, 5); ctx.fillStyle = '#1E2A4A'; ctx.fillRect(122, -20, 50, 40); ctx.fillStyle = '#5A606C'; ctx.fillRect(-120, 9, 290, 10);
  ctx.restore();
  afJetBody(ctx); ctx.strokeStyle = 'rgba(60,66,80,.55)'; ctx.lineWidth = 1.6; ctx.stroke();
  ctx.fillStyle = '#20242E'; ctx.beginPath(); ctx.ellipse(70, 6, 14, 6, 0, 0, TAU); ctx.fill();                                                                                  /* the intake */
  ctx.fillStyle = '#C8CCD6'; ctx.beginPath(); ctx.moveTo(40, 5); ctx.lineTo(-84, 5); ctx.lineTo(-106, 38); ctx.lineTo(-20, 22); ctx.closePath(); ctx.fill();                       /* near wing */
  ctx.fillStyle = '#C8302A'; ctx.beginPath(); ctx.moveTo(-106, 38); ctx.lineTo(-90, 34); ctx.lineTo(-96, 28); ctx.lineTo(-104, 30); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#DADEE8'; ctx.beginPath(); ctx.moveTo(-100, -13); ctx.lineTo(-128, -64); ctx.lineTo(-94, -64); ctx.lineTo(-56, -17); ctx.closePath(); ctx.fill();               /* near fin */
  ctx.fillStyle = '#C8302A'; ctx.beginPath(); ctx.moveTo(-124, -57); ctx.lineTo(-128, -64); ctx.lineTo(-94, -64); ctx.lineTo(-100, -52); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#4A4E58'; ctx.beginPath(); ctx.moveTo(-114, -9); ctx.lineTo(-128, -11); ctx.lineTo(-128, 12); ctx.lineTo(-114, 10); ctx.closePath(); ctx.fill();
  if (o.flame > 1) csGlow(ctx, -128, 1, 18, '#FFB050', 0.7);
  const lift = o.canopy || 0, pa = o.pilot === true ? 1 : (+o.pilot || 0);
  if (pa > 0.01){
    ctx.save(); ctx.globalAlpha *= pa; hmCanopyPath(ctx); ctx.clip();
    csGiraffe(ctx, { x: HM_PILOT.x, y: HM_PILOT.y, s: HM_PILOT.s, face: 1, neck: HM_PILOT.neck, head: HM_PILOT.head, bare: true, boots: false, moving: false });
    ctx.restore();
  }
  ctx.save(); ctx.translate(12, -21); ctx.rotate(-lift * 0.5); ctx.translate(-12, 21);                       /* the canopy tilts up on a rear hinge */
  hmCanopyPath(ctx); const cg = ctx.createLinearGradient(0, -55, 0, -10); cg.addColorStop(0, 'rgba(190,225,255,.30)'); cg.addColorStop(1, 'rgba(120,170,230,.14)'); ctx.fillStyle = cg; ctx.fill();
  ctx.strokeStyle = '#8A92A2'; ctx.lineWidth = 2.2; ctx.stroke();
  ctx.strokeStyle = 'rgba(255,255,255,.65)'; ctx.lineWidth = 1.8; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(24, -31); ctx.quadraticCurveTo(48, -46, 80, -51); ctx.stroke(); ctx.lineCap = 'butt';
  ctx.restore();
  const blink = Math.sin(t * 6) > 0;
  fillCircle(ctx, -74, -15, 2.2, blink ? '#FF4A3A' : '#7A2A22'); fillCircle(ctx, 156, 4, 2, blink ? '#FFFFFF' : '#8A8A8A');
  ctx.restore();
}
/* the giraffe with her body center at (cx, cy), turned by rot, with an orange parachute pack on her back if g.pack is set */
function afGiraffeAt(ctx, cx, cy, rot, g){
  const s = g.s || 1;
  ctx.save(); ctx.translate(cx, cy); ctx.rotate(rot || 0);
  csGiraffe(ctx, Object.assign({}, g, { x: 0, y: 98 * s }));
  if (g.pack){
    ctx.save(); ctx.translate(0, 98 * s); ctx.scale(s, s);
    ctx.fillStyle = '#E8762A'; ctx.fillRect(-18, -136, 38, 26); ctx.fillStyle = '#B85A1A'; ctx.fillRect(-18, -118, 38, 4);
    ctx.strokeStyle = '#C8C4B4'; ctx.lineWidth = 2.4; ctx.beginPath(); ctx.moveTo(-4, -110); ctx.lineTo(-8, -76); ctx.moveTo(10, -110); ctx.lineTo(14, -76); ctx.stroke();
    ctx.restore();
  }
  ctx.restore();
}
/* a parachute: the origin is the harness point and the canopy rises above it. kx and ky squash it while it is opening or collapsing. */
function afChute(ctx, kx, ky, a){
  const cy0 = -200 * ky, rx = 125 * kx, ry = 72 * ky;
  ctx.save(); ctx.globalAlpha *= a;
  ctx.strokeStyle = 'rgba(240,240,228,.7)'; ctx.lineWidth = 1; ctx.beginPath();
  for (let i = 0; i <= 8; i++){ ctx.moveTo(-rx + i * rx / 4, cy0 + 4); ctx.lineTo(-4, -20); }
  ctx.stroke();
  for (let i = 0; i < 8; i++){
    const a0 = -Math.acos(-1 + i / 4), a1 = -Math.acos(-1 + (i + 1) / 4), xa = -rx + i * rx / 4, xb = xa + rx / 4;     /* panels of equal width across the dome */
    ctx.fillStyle = i % 2 ? '#F4F0E0' : '#FF8A2A'; ctx.beginPath(); ctx.ellipse(0, cy0, rx, Math.max(0.5, ry), 0, a0, a1); ctx.lineTo(xb, cy0); ctx.quadraticCurveTo((xa + xb) / 2, cy0 + 12 * ky, xa, cy0); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(80,40,10,.55)'; ctx.lineWidth = 1.2; ctx.stroke();
  }
  ctx.restore();
}

/* ---- scene A (0 - 8.5 s): the old airfield, and the boarding ---- */
function afSceneA(ctx, u, t){
  const gy = 566, PX = 760, PS = 1.5, PY = gy - 44 * PS;
  afSavanna(ctx, t, gy, 0);
  ctx.fillStyle = '#2E2024'; ctx.fillRect(40, gy - 74, 180, 74); ctx.beginPath(); ctx.moveTo(30, gy - 74); ctx.quadraticCurveTo(130, gy - 128, 230, gy - 74); ctx.closePath(); ctx.fill();      /* an old hangar */
  ctx.fillStyle = '#FFD890'; ctx.fillRect(100, gy - 40, 60, 40); csGlow(ctx, 130, gy - 20, 70, '#FFD890', 0.35);
  ctx.strokeStyle = '#2A1A1E'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(1180, gy); ctx.lineTo(1180, gy - 96); ctx.stroke();                                                            /* a windsock */
  const wv = Math.sin(t * 3) * 4; ctx.fillStyle = '#E8662A'; ctx.beginPath(); ctx.moveTo(1180, gy - 96); ctx.lineTo(1120, gy - 90 + wv); ctx.lineTo(1120, gy - 74 + wv); ctx.lineTo(1180, gy - 80); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#4A4650'; ctx.fillRect(0, gy, CS_W, 24); ctx.fillStyle = '#6A6670'; ctx.fillRect(0, gy, CS_W, 5);
  ctx.fillStyle = '#F4C040'; for (let x = 20; x < CS_W; x += 120) ctx.fillRect(x, gy + 12, 60, 4);
  afJet(ctx, { x: PX, y: PY, s: PS, gear: true, t: t, canopy: csBump(u, 4.4, 7.2, 0.8), pilot: csSm(5.2, 6.0, u) });
  const wa = 1 - csSm(4.9, 5.5, u);
  if (wa > 0.01){                                                                                   /* she walks out of the hangar to the jet, then climbs in */
    ctx.globalAlpha = wa;
    csGiraffe(ctx, { x: csLerp(120, 800, csSm(0.4, 4.6, u)), y: gy + 22, s: 0.66, face: 1, walk: u * 8, moving: u < 4.7, neck: 0.25, head: 0.1, bare: true, boots: false });
    ctx.globalAlpha = 1;
  }
  for (let k = 0; k < 18; k++){ const a = (t * 0.12 + csR(k + 9900)) % 1; ctx.globalAlpha = 0.45 * Math.sin(a * Math.PI); fillCircle(ctx, csR(k + 9950) * CS_W + Math.sin(t + k) * 12, 560 - a * 440, 2, '#FFE8A0'); } ctx.globalAlpha = 1;   /* drifting sparks of dust and light */
}
/* ---- scene B (8.5 - 17.5 s): the take-off run ---- */
function afSceneB(ctx, u, t){
  const lift = csSm(5.0, 9.0, u), gy = 566 + lift * 430, sc = 55 * u * u + (u > 5 ? (u - 5) * (u - 5) * 160 : 0);
  const sh = csShake(u, 1.4 * csSm(0, 3, u) * (1 - csSm(4.6, 5.4, u)));
  ctx.save(); ctx.translate(sh[0], sh[1]);
  afSavanna(ctx, t, gy, sc);
  const rw = 2400 - sc;
  if (gy < CS_H && rw > 0){
    ctx.fillStyle = '#4A4650'; ctx.fillRect(0, gy, Math.min(CS_W, rw), 24); ctx.fillStyle = '#6A6670'; ctx.fillRect(0, gy, Math.min(CS_W, rw), 5);
    ctx.fillStyle = '#F4C040'; for (let k = Math.floor(sc / 120); k < Math.floor(sc / 120) + 12; k++){ const x = 20 + k * 120 - sc; if (x < rw - 60) ctx.fillRect(x, gy + 12, 60, 4); }
    for (let k = Math.floor(sc / 90); k < Math.floor(sc / 90) + 16; k++){ const x = k * 90 - sc; if (x < rw) fillCircle(ctx, x, gy - 2, 3, Math.sin(t * 4 + k) > -0.3 ? '#FFD060' : '#6A5A30'); }
  }
  const PS = 1.5, PX = 330 + csSm(0, 5, u) * 130, py = (566 - 44 * PS) - lift * 140;
  afJet(ctx, { x: PX, y: py, s: PS, rot: -0.3 * csSm(5.0, 6.4, u), gear: u < 6.6, flame: 55 + 80 * csSm(0.3, 2.5, u), t: t, canopy: 0, pilot: 1 });
  if (u < 5.6){ for (let k = 0; k < 9; k++){ const a = (u * 1.6 + k / 9) % 1; ctx.globalAlpha = 0.3 * (1 - a); ctx.fillStyle = '#C8B090'; ctx.beginPath(); ctx.arc(PX - 130 - a * 260, gy - 4 - a * 18, 8 + a * 26, 0, TAU); ctx.fill(); } ctx.globalAlpha = 1; }
  ctx.restore();
}
/* ---- scene C (17.5 - 27.5 s): across the Nevada desert at dusk, and a radar lock ---- */
function afSceneC(ctx, u, t){
  const sc = u * 260;
  afSky(ctx, '#243A78', '#D8805A', '#F8C890'); csGlow(ctx, 220, 500, 380, '#FFD890', 0.5); fillCircle(ctx, 220, 500, 40, '#FFE9B8');
  afClouds(ctx, sc * 0.3, 8, 80, 330, 0.55, '#FBE0C8');
  afRidge(ctx, 560, 90, 2.2, '#8A5A5A', sc * 0.18); afRidge(ctx, 610, 70, 5.9, '#6A3E46', sc * 0.4);
  const gg = ctx.createLinearGradient(0, 640, 0, CS_H); gg.addColorStop(0, '#6A4A4A'); gg.addColorStop(1, '#3A2630'); ctx.fillStyle = gg; ctx.fillRect(0, 640, CS_W, CS_H - 640);
  ctx.fillStyle = 'rgba(200,180,170,.18)'; ctx.beginPath(); ctx.ellipse(((900 - sc * 0.9) % 1800 + 1800) % 1800 - 200, 690, 260, 14, 0, 0, TAU); ctx.fill();                  /* a dry lake bed */
  afRidge(ctx, 700, 26, 8.3, '#4A2A34', sc * 0.9);
  const hz = csSm(5, 10, u); csGlow(ctx, 1230, 612, 150 + 120 * hz, '#9BE86A', 0.5 * hz);                                                                                    /* a green glow on the horizon */
  for (let k = 0; k < 14; k++){ const x = (((csR(k + 10000) * 1500 - sc * 3.2 * (0.6 + csR(k + 10050))) % 1500) + 1500) % 1500 - 100, y = 120 + csR(k + 10100) * 480; ctx.globalAlpha = 0.22; ctx.fillStyle = '#FFFFFF'; ctx.fillRect(x, y, 90 + csR(k + 10150) * 120, 1.6); } ctx.globalAlpha = 1;
  afJet(ctx, { x: 620 + Math.sin(u * 0.8) * 24, y: 300 + Math.sin(u * 1.3) * 12, s: 1.15, rot: Math.sin(u * 0.8) * 0.025, flame: 70, t: t, canopy: 0, pilot: 1 });
  const w = csBump(u, 6.4, 9.8, 0.4);
  if (w > 0.01){                                                                                /* radar lock: a flashing red frame */
    const fl = 0.5 + 0.5 * Math.sin(t * 14);
    ctx.strokeStyle = 'rgba(255,60,50,' + (w * fl * 0.85) + ')'; ctx.lineWidth = 14; ctx.strokeRect(7, 7, CS_W - 14, CS_H - 14);
    ctx.globalAlpha = w * (0.4 + 0.6 * fl); csText(ctx, 'WARNING', 640, 130, 44, '#FF6A5A', 'center', '800'); csText(ctx, 'RADAR LOCK', 640, 166, 20, '#FFB0A8', 'center', '700'); ctx.globalAlpha = 1;
  }
}
/* ---- scene D (27.5 - 34.5 s): over the base at night, and the jump ---- */
function afJetX(u){ return 180 + 100 * u + 55 * Math.max(0, u - 3.6) * Math.max(0, u - 3.6); }
function afSceneD(ctx, u, t){
  const gy = 600, PS = 1.15, jx = afJetX(u), jy = 230 + Math.sin(u * 1.5) * 6, JU = 3.7;
  afNight(ctx, t, gy, u * 40);
  const tops = afBase(ctx, gy, t, 1.1, 300);
  const fu = u - JU, j0x = afJetX(JU), j0y = 230 + Math.sin(JU * 1.5) * 6;
  const bx = j0x + HM_PILOT.x * PS + 70 * fu, by = j0y + (HM_PILOT.y - 98 * HM_PILOT.s) * PS - 90 * fu + 330 * fu * fu;
  for (let i = 0; i < tops.length; i++){
    let ang = -Math.PI / 2 + Math.sin(t * 0.9 + i * 2.1) * 0.8;
    if (fu > 0) ang = csLerp(ang, Math.atan2(by - tops[i].y, bx - tops[i].x), csSm(0, 0.8, fu));
    afBeam(ctx, tops[i].x, tops[i].y, ang, 1100, 0.07, 0.16);
  }
  afJet(ctx, { x: jx, y: jy, s: PS, rot: Math.sin(u * 1.2) * 0.02, flame: 60, t: t, canopy: csBump(u, 3.0, 99, 0.5), pilot: 1 - csSm(3.65, 3.75, u) });
  if (fu > 0 && by < 800){
    afGiraffeAt(ctx, bx, by, fu * 2.4, { s: HM_PILOT.s * PS * (1 + 0.25 * fu), face: 1, neck: 1.3, head: 0.05, tuck: 0.8 * csSm(0, 0.5, fu), moving: false, bare: true, boots: false, pack: true });
  }
}
/* ---- scene E (34.5 - 44 s): freefall toward the glowing hatch ---- */
function afSceneE(ctx, u, t){
  const p = csSm(0, 9.5, u), gh = 760 - 300 * Math.pow(p, 1.3);
  afSky(ctx, '#02040C', '#101C3C', '#34305A'); csStars(ctx, 0.9, t, 0, 0);
  for (let k = 0; k < 7; k++){ const y = (((csR(k + 10400) * 1500 - u * 700) % 1500) + 1500) % 1500 - 300; afCloud(ctx, csR(k + 10450) * CS_W, y, 1.6 + csR(k + 10500), 0.35, '#3A4468'); }          /* cloud tops rushing up past her */
  if (gh < CS_H){
    const gg = ctx.createLinearGradient(0, gh, 0, CS_H); gg.addColorStop(0, '#1E1810'); gg.addColorStop(1, '#0C0A07'); ctx.fillStyle = gg; ctx.fillRect(0, gh, CS_W, CS_H - gh + 2);
    ctx.strokeStyle = 'rgba(214,200,150,.12)'; ctx.lineWidth = 1; ctx.beginPath();
    for (let i = -10; i <= 10; i++){ ctx.moveTo(640 + i * 150, CS_H); ctx.lineTo(640 + i * 150 * 0.14, gh); }
    for (let r = 1; r <= 6; r++){ const y = gh + (CS_H - gh) * Math.pow(r / 6, 1.7); ctx.moveTo(0, y); ctx.lineTo(CS_W, y); }
    ctx.stroke();
    for (let r = 1; r <= 7; r++){ const f = Math.pow(r / 7, 1.7), y = gh + (CS_H - gh) * f; for (let i = -9; i <= 9; i++){ ctx.globalAlpha = 0.5 + 0.3 * Math.sin(t * 3 + i * 1.7 + r); fillCircle(ctx, 640 + i * (30 + 120 * f), y, 1.4 + 2.4 * f, '#FFD060'); } } ctx.globalAlpha = 1;   /* the base's lights */
    const hy = gh + (CS_H - gh) * 0.4; csGlow(ctx, 640, hy, 40 + 130 * p, '#9BE86A', 0.55); csGlow(ctx, 640, hy, 16 + 50 * p, '#E8FFD0', 0.7);                                      /* the hatch, getting closer */
  }
  for (let k = 0; k < 22; k++){ const x = csR(k + 10100) * CS_W, v = 900 + csR(k + 10200) * 900, y = (((csR(k + 10300) * 1600 - u * v) % 1600) + 1600) % 1600 - 400; ctx.globalAlpha = 0.28; ctx.fillStyle = '#FFFFFF'; ctx.fillRect(x, y, 1.8, 60 + csR(k + 10350) * 90); } ctx.globalAlpha = 1;   /* wind */
  const rot = (1 - csSm(0, 2.8, u)) * 3.6 + Math.sin(t * 2.2) * 0.04;
  afGiraffeAt(ctx, 640, 290 + Math.sin(t * 2.6) * 4, rot, { s: 0.78, face: 1, moving: true, walk: t * 16, neck: 1.15, head: -0.1, bare: true, boots: false, pack: true });
}
/* ---- scene F (44 - 57.5 s): the parachute, and the landing ---- */
function afSceneF(ctx, u, t){
  const hy = 560, gy = 592, s = 0.62, u0 = 1.2, uL = 8.2;
  afNight(ctx, t, hy, u * 6);
  const tops = afBase(ctx, hy, t, 0.95, 540);
  for (let i = 0; i < tops.length; i++) afBeam(ctx, tops[i].x, tops[i].y, -Math.PI / 2 + Math.sin(t * 0.8 + i * 1.7) * 0.9, 1000, 0.06, 0.15);
  let cx, cy;
  if (u < u0){ cx = 520; cy = -120 + 300 * Math.pow(u / u0, 1.6); }
  else { const p = csC((u - u0) / (uL - u0), 0, 1); cx = 520 + 36 * (u - u0 > 7 ? 7 : u - u0); cy = 180 + (gy - 98 * s - 180) * p; }
  const sway = u > u0 && u < uL ? 0.1 * Math.sin((u - u0) * 1.7) * Math.exp(-(u - u0) * 0.1) : 0;
  const open = csSm(u0, u0 + 0.9, u), landed = csSm(uL, uL + 1.6, u);
  if (u > u0 - 0.1){
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(-sway * 0.6 - 1.3 * landed);
    afChute(ctx, 0.12 + 0.88 * open, 0.45 + 0.55 * open + 0.06 * Math.sin((u - u0) * 9) * (1 - open) - 0.55 * landed, 1 - csSm(10.0, 11.4, u));
    ctx.restore();
  }
  if (u >= u0 && u < u0 + 0.5){ ctx.globalAlpha = 0.5 * (1 - (u - u0) / 0.5); csGlow(ctx, cx, cy - 120, 150, '#FFFFFF', 0.9); ctx.globalAlpha = 1; }                       /* the jerk of the canopy */
  const walking = u > uL + 1.4 && u < uL + 2.6;
  afGiraffeAt(ctx, cx + (u > uL + 1.4 ? 26 * csSm(uL + 1.4, uL + 2.6, u) : 0), cy, sway * 0.6, { s: s, face: 1, neck: u < uL ? 0.5 : csLerp(0.2, 0.55, csSm(uL + 1.8, uL + 3.2, u)), head: 0.1, moving: walking, walk: t * 8, bare: true, boots: false, pack: true });
  if (u > uL && u < uL + 1.4){ const a = (u - uL) / 1.4; for (let k = 0; k < 10; k++){ ctx.globalAlpha = 0.4 * (1 - a); ctx.fillStyle = '#9A8A70'; ctx.beginPath(); ctx.arc(cx + (k - 5) * 16 * (0.4 + a), gy - 4 - a * 26 * csR(k + 10600), 6 + a * 16, 0, TAU); ctx.fill(); } ctx.globalAlpha = 1; }
}
function a51Scene(ctx, t){
  const T = A51_T;
  if (t < T.B) afSceneA(ctx, t - T.A, t);
  else if (t < T.C) afSceneB(ctx, t - T.B, t);
  else if (t < T.D) afSceneC(ctx, t - T.C, t);
  else if (t < T.E) afSceneD(ctx, t - T.D, t);
  else if (t < T.F) afSceneE(ctx, t - T.E, t);
  else afSceneF(ctx, t - T.F, t);
}
function a51Fade(t){
  let f = 1 - csSm(0, 1.2, t);
  f = Math.max(f, csSm(A51_T.END - 2.0, A51_T.END, t));
  for (const b of [A51_T.B, A51_T.C, A51_T.D, A51_T.E, A51_T.F]) f = Math.max(f, 1 - csSm(0, 0.4, Math.abs(t - b)));
  return f;
}
function a51Overlays(ctx, t){
  const v = ctx.createRadialGradient(640, 360, 300, 640, 360, 780); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,.4)');
  ctx.fillStyle = v; ctx.fillRect(0, 0, CS_W, CS_H);
  let cap = null;
  for (let i = 0; i < A51_CAPS.length; i++) if (t >= A51_CAPS[i][0] && t < A51_CAPS[i][0] + A51_CAPS[i][3]) cap = A51_CAPS[i];
  if (cap){
    const a = csSm(0, 0.25, t - cap[0]) * (1 - csSm(cap[3] - 0.35, cap[3], t - cap[0])), wide = cap[1].length > 22;
    ctx.globalAlpha = a; ctx.fillStyle = 'rgba(0,0,10,.58)'; ctx.fillRect(0, 618, wide ? 760 : cap[2] ? 640 : 460, cap[2] ? 84 : 58);
    ctx.fillStyle = '#9BE86A'; ctx.fillRect(0, 618, 5, cap[2] ? 84 : 58);
    csText(ctx, cap[1], 26, 652, 25, '#F4F8FF', 'left', '800');
    if (cap[2]) csText(ctx, cap[2], 26, 682, 15, '#C8D0E0', 'left', '600');
    ctx.globalAlpha = 1;
  }
  const tu = t - (A51_T.F + 10.2);
  if (tu > 0){ ctx.globalAlpha = csSm(0, 1.6, tu); csGlow(ctx, 640, 150, 340, '#9BE86A', 0.28); csText(ctx, 'AREA 51', 640, 168, 78, '#DFFFC8', 'center', '800'); ctx.globalAlpha = 1; }
  const f = a51Fade(t);
  if (f > 0.005){ ctx.fillStyle = 'rgba(0,0,0,' + f + ')'; ctx.fillRect(0, 0, CS_W, CS_H); }
}
const A51_CUES = [];
(function(){
  const add = (t, fn) => A51_CUES.push([t, fn]);
  add(1.0, () => SFX.click()); add(5.0, () => SFX.click()); add(7.0, () => SFX.click());
  add(8.9, () => SFX.zap()); add(9.3, () => SFX.whoosh()); add(12.4, () => SFX.whoosh()); add(14.8, () => SFX.click());
  add(18.0, () => SFX.whoosh()); for (let x = 24.0; x < 27.4; x += 0.6) add(x, () => SFX.click());
  add(30.5, () => SFX.boom()); add(31.2, () => SFX.whoosh());
  add(34.8, () => SFX.whoosh()); add(38.0, () => SFX.whoosh()); add(41.5, () => SFX.whoosh());
  add(45.2, () => SFX.boom()); add(45.5, () => SFX.whoosh()); add(52.3, () => SFX.click()); add(54.3, () => SFX.level()); add(56.4, () => SFX.over());
  A51_CUES.sort((a, b) => a[0] - b[0]);
})();

