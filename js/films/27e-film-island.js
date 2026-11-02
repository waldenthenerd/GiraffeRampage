'use strict';
/* The Island Lab films (Chapter 17). */
/* ========================= THE ISLAND FILMS ========================= */
/* Two films in the same format as the Fort's (MARS_FILMS: end, starts, scene, over, cues): the crossing, at the start of Chapter 17 (the fishing boat on the open sea, a fog bank, the
   island coming out of it with the lab's lights on, and her wading ashore with something swimming under the surface), and, at the end, the escape (the tank room flooding, someone in a
   white coat running for the helipad and a white helicopter lifting off west over the water, the town helicopter coming in low to pick her up, and the two of them low over the
   sea at sundown, the white one still in sight ahead), which closes nothing. Every frame is a pure function of time. */
const IL_SAIL_T = { B: 7.6, C: 15.2, END: 24 };
const IL_OUT_T = { B: 7.2, C: 14.2, D: 24.5, END: 31 };
const IL_SAIL_CAPS = [
  [0.8, 'OUT PAST THE REEF', 'Three days of open sea in the fishing boat', 3.2],
  [4.4, 'THE CIRCLE ON THE MAP', 'Nothing out here but water', 2.8],
  [8.2, 'FOG', 'And then, lights', 2.8],
  [11.4, 'THE ISLAND', 'Palms, a beach, and glass buildings humming on the hill', 3.4],
  [15.8, 'THE SHALLOWS', 'Warm water, white sand', 3.0],
  [19.4, 'SOMETHING IS SWIMMING', 'She is not alone in the water', 3.4]
];
const IL_OUT_CAPS = [
  [0.8, 'THE TANK ROOM', 'The pumps have stopped, and the sea is coming in', 3.2],
  [4.2, 'SPECIMEN ZERO', 'Sinking back into the dark', 2.6],
  [7.8, 'THE HELIPAD', 'Someone in a white coat is running', 3.0],
  [11.0, 'LAB-1', 'Lifting off, heading west over the water', 2.8],
  [14.6, 'THE SHALLOWS', 'Too late, by a few seconds', 3.0],
  [18.0, 'AN OLD FRIEND', 'The town helicopter, coming in low', 3.0],
  [21.4, 'AFTER THEM', 'West, over the water', 2.6],
  [25.1, 'LOW OVER THE WATER', 'The white helicopter, still in sight', 3.0],
  [28.4, 'WEST', 'Wherever it lands, they will be right behind it', 2.4]
];
const IL_LAB_HELI = { g: '#E8ECEE', gd: '#AEB8BE', gl: '#FFFFFF', ink: '#26343A', band: '#2A8A7A' };
function ilMorning(ctx, t){ afSky(ctx, '#4A7AA8', '#9ACAE0', '#F2E2C0'); csGlow(ctx, 1040, 360, 260, '#FFF0C8', 0.4); fillCircle(ctx, 1040, 380, 40, '#FFF6DC'); }
function ilDusk(ctx, t){ afSky(ctx, '#2A3A6A', '#C87A6A', '#F2C890'); csGlow(ctx, 220, 420, 280, '#FFD8A0', 0.45); fillCircle(ctx, 220, 440, 46, '#FFE8C0'); }
/* the open sea from the side: bands of water, darker away from the light, wave crests that move */
function ilFilmSea(ctx, gy, t, sc, tone){
  const g = ctx.createLinearGradient(0, gy, 0, CS_H); g.addColorStop(0, tone ? '#3A5A7A' : '#2E7A9A'); g.addColorStop(1, tone ? '#14243A' : '#103A56'); ctx.fillStyle = g; ctx.fillRect(0, gy, CS_W, CS_H - gy);
  for (let r = 0; r < 9; r++){ const y = gy + 6 + r * r * 4, a = 0.12 + r * 0.03; ctx.strokeStyle = 'rgba(230,250,255,' + a.toFixed(2) + ')'; ctx.lineWidth = 1 + r * 0.3; ctx.beginPath();
    for (let x = -40; x <= CS_W + 40; x += 30){ const xx = ((x + sc * (0.3 + r * 0.12)) % (CS_W + 80) + CS_W + 80) % (CS_W + 80) - 40; ctx.moveTo(xx, y + Math.sin(t * 2 + x * 0.05 + r) * 2); ctx.lineTo(xx + 14 + r * 2, y + Math.sin(t * 2 + x * 0.05 + r) * 2); } ctx.stroke(); }
  ctx.fillStyle = 'rgba(255,255,255,.22)'; ctx.fillRect(0, gy, CS_W, 2);
}
/* water over her legs where she wades: the water behind her is painted again inside a box from the waterline down, so it covers her legs and its edges cannot be seen; rings on the surface */
function ilWaterLegs(ctx, x, y, w, h, paint, t){
  ctx.save(); ctx.beginPath(); ctx.rect(x - w / 2, y, w, h); ctx.clip(); paint(); ctx.restore();
  ctx.strokeStyle = 'rgba(255,255,255,.7)'; ctx.lineWidth = 2; for (let k = 0; k < 2; k++){ const ph = (t * 1.4 + k * 0.5) % 1; ctx.beginPath(); ctx.ellipse(x, y + 2, w * 0.18 + ph * w * 0.16, 5 + ph * 5, 0, 0, TAU); ctx.stroke(); }
}
/* the beach's water, from the foam line down */
function ilBeachWater(ctx, gy, t){
  ctx.fillStyle = '#E8D8A8'; ctx.fillRect(0, gy + 60, CS_W, 40); ctx.fillStyle = 'rgba(80,190,200,.85)'; ctx.fillRect(0, gy + 90, CS_W, CS_H - gy - 90);
  ctx.strokeStyle = 'rgba(255,255,255,.8)'; ctx.lineWidth = 4; ctx.beginPath(); for (let x = 0; x <= CS_W; x += 20) ctx.lineTo(x, gy + 90 + Math.sin(x * 0.02 + t * 2) * 6); ctx.stroke();
  for (let r = 0; r < 6; r++){ ctx.strokeStyle = 'rgba(255,255,255,' + (0.18 + r * 0.03).toFixed(2) + ')'; ctx.lineWidth = 2; ctx.beginPath(); for (let x = 0; x <= CS_W; x += 24) ctx.lineTo(x, gy + 120 + r * 30 + Math.sin(x * 0.03 + t * 1.6 + r) * 4); ctx.stroke(); }
}
/* the fishing boat side on: blue hull with a white strake, a wheelhouse, a mast with a lamp, and her standing at the bow; the hull is drawn over her legs */
function ilBoat(ctx, x, y, s, t, o){
  o = o || {}; const roll = Math.sin(t * 1.6) * 0.03, bob = Math.sin(t * 2.1) * 3 * s;
  ctx.save(); ctx.translate(x, y + bob); ctx.rotate(roll); ctx.scale(s, s);
  ctx.fillStyle = '#E8E4D8'; ctx.fillRect(-130, -96, 92, 70); ctx.fillStyle = '#C8402A'; ctx.fillRect(-134, -104, 100, 12);
  ctx.fillStyle = '#8AC8E8'; ctx.fillRect(-120, -82, 26, 22); ctx.fillRect(-86, -82, 26, 22); ctx.strokeStyle = '#5A6A74'; ctx.lineWidth = 2; ctx.strokeRect(-120, -82, 26, 22); ctx.strokeRect(-86, -82, 26, 22);
  ctx.fillStyle = '#5A6A74'; ctx.fillRect(-92, -190, 5, 92); ctx.fillRect(-120, -160, 60, 4); fillCircle(ctx, -90, -194, 5, '#FFF2B0'); csGlow(ctx, -90, -194, 30, '#FFF2B0', 0.3);
  ctx.strokeStyle = 'rgba(60,70,80,.7)'; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(-90, -190); ctx.lineTo(150, -24); ctx.moveTo(-90, -190); ctx.lineTo(-210, -24); ctx.stroke();
  if (o.rider) csGiraffe(ctx, { x: 70, y: -14, s: 0.6, face: 1, walk: 0, moving: false, neck: 0.52 + 0.03 * Math.sin(t * 1.4), head: 0.12, bare: true, boots: false });
  ctx.fillStyle = '#2E4A6A'; ctx.beginPath(); ctx.moveTo(-220, -30); ctx.lineTo(200, -30); ctx.quadraticCurveTo(232, -30, 250, -52); ctx.lineTo(236, 6); ctx.quadraticCurveTo(170, 40, 0, 40); ctx.quadraticCurveTo(-170, 40, -210, 10); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#E8E4D8'; ctx.beginPath(); ctx.moveTo(-220, -30); ctx.lineTo(200, -30); ctx.quadraticCurveTo(232, -30, 250, -52); ctx.lineTo(246, -36); ctx.quadraticCurveTo(230, -16, 200, -16); ctx.lineTo(-216, -16); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#1E3450'; ctx.fillRect(-200, 4, 400, 6); ctx.fillStyle = '#F2EEDC'; ctx.font = '800 18px ui-sans-serif, sans-serif'; ctx.textAlign = 'left'; ctx.fillText('LONGNECK 2', -40, 0);
  for (let i = 0; i < 3; i++){ fillCircle(ctx, -150 + i * 120, -22, 9, '#F2EEDC'); fillCircle(ctx, -150 + i * 120, -22, 4, '#C8402A'); }
  ctx.restore();
  if (o.wake){ for (let k = 0; k < 6; k++){ const wx = x - 230 * s - k * 70 * s - ((t * 60) % 70) * s, a = 0.5 - k * 0.07; ctx.strokeStyle = 'rgba(255,255,255,' + Math.max(0, a).toFixed(2) + ')'; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(wx, y + 38 * s, 40 * s + k * 10 * s, 6 * s, 0, 0, TAU); ctx.stroke(); } }
}
/* the island from the sea: a hump of green with palms, a white beach, the lab's glass houses and tanks on the hill, the helipad light */
function ilIslandFar(ctx, x, gy, k, t, lit){
  ctx.fillStyle = '#2E5A3A'; ctx.beginPath(); ctx.moveTo(x - 420 * k, gy); ctx.quadraticCurveTo(x - 260 * k, gy - 120 * k, x - 40 * k, gy - 150 * k); ctx.quadraticCurveTo(x + 200 * k, gy - 160 * k, x + 420 * k, gy); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#E8D8A8'; ctx.beginPath(); ctx.moveTo(x - 440 * k, gy + 2); ctx.quadraticCurveTo(x, gy - 18 * k, x + 440 * k, gy + 2); ctx.lineTo(x + 440 * k, gy + 6); ctx.lineTo(x - 440 * k, gy + 6); ctx.closePath(); ctx.fill();
  for (let i = 0; i < 9; i++){ const px = x - 360 * k + i * 90 * k, py = gy - 10 * k - Math.max(0, 70 - Math.abs(i - 4) * 14) * k; ctx.strokeStyle = '#4A3A24'; ctx.lineWidth = 3 * k; ctx.beginPath(); ctx.moveTo(px, py + 40 * k); ctx.quadraticCurveTo(px + 6 * k, py + 16 * k, px + 2 * k, py); ctx.stroke();
    ctx.fillStyle = '#2A6A2E'; for (let q = 0; q < 5; q++){ const a = -Math.PI / 2 + (q - 2) * 0.6; ctx.beginPath(); ctx.moveTo(px + 2 * k, py); ctx.quadraticCurveTo(px + Math.cos(a) * 20 * k, py + Math.sin(a) * 14 * k, px + Math.cos(a) * 34 * k, py + Math.sin(a) * 12 * k + 10 * k); ctx.quadraticCurveTo(px + Math.cos(a) * 18 * k, py + Math.sin(a) * 8 * k + 6 * k, px + 2 * k, py); ctx.fill(); } }
  ctx.fillStyle = '#C8D0D4'; ctx.fillRect(x - 120 * k, gy - 170 * k, 240 * k, 34 * k); ctx.fillStyle = 'rgba(160,230,230,.8)'; for (let i = 0; i < 4; i++){ ctx.beginPath(); ctx.arc(x - 90 * k + i * 60 * k, gy - 170 * k, 24 * k, Math.PI, TAU); ctx.fill(); }
  ctx.fillStyle = '#9AA2A4'; ctx.fillRect(x + 130 * k, gy - 162 * k, 70 * k, 28 * k); ctx.fillRect(x + 186 * k, gy - 210 * k, 4 * k, 50 * k);
  if (lit){ for (let i = 0; i < 8; i++){ const lx = x - 110 * k + i * 30 * k; fillCircle(ctx, lx, gy - 150 * k, 3 * k, 'rgba(180,255,230,.9)'); } const on = Math.sin(t * 4) > 0; fillCircle(ctx, x + 188 * k, gy - 212 * k, 4 * k, on ? '#FF5A4A' : '#5A2A22'); if (on) csGlow(ctx, x + 188 * k, gy - 212 * k, 30 * k, '#FF5A4A', 0.4); csGlow(ctx, x, gy - 160 * k, 160 * k, '#7AF0E0', 0.12); }
}
/* someone in a white coat, side on, running with a case: grey hair, round glasses */
function ilFilmScientist(ctx, x, y, s, run, t){
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  const ph = run ? t * 12 : 0, l1 = Math.sin(ph) * 0.5, l2 = -l1;
  ctx.strokeStyle = '#2A2E34'; ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(0, -40); ctx.lineTo(Math.sin(l1) * 22, -40 + Math.cos(l1) * 40); ctx.moveTo(0, -40); ctx.lineTo(Math.sin(l2) * 22, -40 + Math.cos(l2) * 40); ctx.stroke();
  ctx.fillStyle = '#E8ECEE'; ctx.beginPath(); ctx.moveTo(-14, -92); ctx.lineTo(14, -92); ctx.lineTo(18 + (run ? -6 : 0), -34); ctx.lineTo(-18 + (run ? -8 : 0), -30); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = '#C8D0D4'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(2, -90); ctx.lineTo(2, -36); ctx.stroke();
  ctx.strokeStyle = '#E8ECEE'; ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(0, -84); ctx.lineTo(16, -62 + Math.sin(ph + 1) * 6); ctx.stroke();
  ctx.fillStyle = '#4A3A2A'; ctx.fillRect(12, -62 + Math.sin(ph + 1) * 6, 24, 18); ctx.fillStyle = '#7A6A4A'; ctx.fillRect(20, -66 + Math.sin(ph + 1) * 6, 8, 4);
  ctx.fillStyle = '#E8C4A4'; ctx.beginPath(); ctx.arc(2, -104, 12, 0, TAU); ctx.fill(); ctx.fillStyle = '#C8C8C4'; ctx.beginPath(); ctx.arc(-1, -108, 12, Math.PI * 0.9, Math.PI * 1.9); ctx.fill();
  ctx.strokeStyle = '#2A2E34'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.arc(9, -104, 4, 0, TAU); ctx.stroke();
  ctx.lineCap = 'butt'; ctx.restore();
}
/* the tank room, side on: tall broken tanks, the floor going under, sparks from the lights */
function ilTankRoom(ctx, t, level){
  const g = ctx.createLinearGradient(0, 0, 0, CS_H); g.addColorStop(0, '#0E2224'); g.addColorStop(1, '#1E3A3C'); ctx.fillStyle = g; ctx.fillRect(0, 0, CS_W, CS_H);
  for (let i = 0; i < 5; i++){ const tx = 140 + i * 250, gl = 0.5 + 0.3 * Math.sin(t * 2 + i); ctx.fillStyle = 'rgba(90,230,190,' + (0.18 * gl).toFixed(3) + ')'; ctx.fillRect(tx - 60, 120, 120, 460); ctx.strokeStyle = '#4A6A6C'; ctx.lineWidth = 6; ctx.strokeRect(tx - 60, 120, 120, 460);
    ctx.fillStyle = '#2A3A3C'; ctx.fillRect(tx - 70, 96, 140, 30); ctx.fillRect(tx - 70, 576, 140, 30);
    if (i % 2){ ctx.fillStyle = 'rgba(210,250,250,.7)'; ctx.beginPath(); ctx.moveTo(tx - 60, 340); ctx.lineTo(tx - 20, 300); ctx.lineTo(tx + 10, 380); ctx.lineTo(tx + 60, 330); ctx.lineTo(tx + 60, 400); ctx.lineTo(tx - 60, 420); ctx.closePath(); ctx.fill(); ctx.fillStyle = '#0E2224'; ctx.fillRect(tx - 54, 346, 108, 60); } }
  for (let i = 0; i < 4; i++){ const lx = 260 + i * 260, on = Math.sin(t * 7 + i * 3) > 0.2; ctx.fillStyle = on ? '#E8FFF4' : '#2A3A3C'; ctx.fillRect(lx - 40, 40, 80, 10); if (on) csGlow(ctx, lx, 46, 120, '#C8FFF4', 0.25); else if (Math.sin(t * 13 + i) > 0.6) for (let k = 0; k < 4; k++) fillCircle(ctx, lx + k * 6 - 10, 56 + k * 8, 2, '#FFF6A0'); }
  const wy = CS_H - level; ctx.fillStyle = 'rgba(40,140,150,.75)'; ctx.fillRect(0, wy, CS_W, level); ctx.strokeStyle = 'rgba(230,252,250,.7)'; ctx.lineWidth = 3; ctx.beginPath(); for (let x = 0; x <= CS_W; x += 20) ctx.lineTo(x, wy + Math.sin(x * 0.03 + t * 3) * 5); ctx.stroke();
  for (let k = 0; k < 3; k++){ const sx = 40 + k * 600, sy = 140; ctx.fillStyle = 'rgba(200,250,250,.5)'; ctx.fillRect(sx, sy, 16, wy - sy); }
}
function isleSailScene(ctx, t){
  const T = IL_SAIL_T;
  if (t < T.B){                                                                      /* the open sea: the boat, the wake, gulls */
    const u = t, gy = 470; ilMorning(ctx, t); ilFilmSea(ctx, gy, t, u * 220, 0);
    for (let k = 0; k < 3; k++){ const gx = 300 + k * 160 + Math.sin(t * 0.7 + k) * 40, gyy = 160 + k * 30 + Math.sin(t * 1.3 + k * 2) * 10, w = Math.sin(t * 6 + k) * 6; ctx.strokeStyle = '#2A2E34'; ctx.lineWidth = 2.4; ctx.beginPath(); ctx.moveTo(gx - 16, gyy - w); ctx.quadraticCurveTo(gx - 8, gyy - 6, gx, gyy); ctx.quadraticCurveTo(gx + 8, gyy - 6, gx + 16, gyy - w); ctx.stroke(); }
    ilBoat(ctx, csLerp(520, 680, csSm(0, 7, u)), gy + 70, 0.95, t, { rider: true, wake: true });
    ctx.fillStyle = 'rgba(0,0,0,' + (0.6 * (1 - csSm(0, 1.4, u))).toFixed(3) + ')'; ctx.fillRect(0, 0, CS_W, CS_H);
  } else if (t < T.C){                                                               /* the fog bank, and the island coming out of it */
    const u = t - T.B, gy = 470, clear = csSm(2.6, 6.8, u); afSky(ctx, '#8AA4B4', '#B8CCD4', '#DCE4E4'); ilFilmSea(ctx, gy, t, 1600 + u * 140, 1);
    ctx.globalAlpha = 0.25 + 0.75 * clear; ilIslandFar(ctx, 900, gy, csLerp(0.7, 1.0, clear), t, true); ctx.globalAlpha = 1;
    for (let k = 0; k < 7; k++){ const fx = ((k * 260 - u * 30) % 1600 + 1600) % 1600 - 160, fa = (0.55 - 0.4 * clear) * (0.6 + 0.4 * Math.sin(k + t * 0.4)); ctx.fillStyle = 'rgba(232,238,240,' + fa.toFixed(3) + ')'; ctx.beginPath(); ctx.ellipse(fx, gy - 60 + (k % 3) * 30, 260, 70, 0, 0, TAU); ctx.fill(); }
    ilBoat(ctx, csLerp(300, 420, csSm(0, 7.6, u)), gy + 90, 0.8, t, { rider: true, wake: true });
  } else {                                                                           /* the shallows: the boat on the sand, her wading in, a shape under the water */
    const u = t - T.C, gy = 430; ilMorning(ctx, t);
    ctx.fillStyle = '#2E5A3A'; ctx.fillRect(0, gy - 90, CS_W, 90); for (let i = 0; i < 8; i++){ const px = 80 + i * 170, py = gy - 90; ctx.strokeStyle = '#4A3A24'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(px, gy - 20); ctx.quadraticCurveTo(px + 14, py - 40, px + 6, py - 110); ctx.stroke(); ctx.fillStyle = '#2A6A2E'; for (let q = 0; q < 6; q++){ const a = -Math.PI / 2 + (q - 2.5) * 0.55; ctx.beginPath(); ctx.moveTo(px + 6, py - 110); ctx.quadraticCurveTo(px + 6 + Math.cos(a) * 40, py - 110 + Math.sin(a) * 30, px + 6 + Math.cos(a) * 70, py - 100 + Math.sin(a) * 26 + 20); ctx.quadraticCurveTo(px + 6 + Math.cos(a) * 36, py - 104 + Math.sin(a) * 16, px + 6, py - 110); ctx.fill(); } }
    ctx.fillStyle = '#E8D8A8'; ctx.fillRect(0, gy, CS_W, 90); ilBeachWater(ctx, gy, t);
    ilBoat(ctx, 1040, gy + 150, 0.7, t, {});
    const wade = csSm(0.6, 6, u), gx = csLerp(860, 520, wade), wy = csLerp(gy + 150, gy + 96, wade);
    csGiraffe(ctx, { x: gx, y: wy, s: 0.7, face: -1, walk: u * 5, moving: u < 6, neck: 0.4, head: 0.1, bare: true, boots: false });
    if (wy - 22 > gy + 92) ilWaterLegs(ctx, gx, wy - 22, 200, 60, function(){ ilBeachWater(ctx, gy, t); }, t);           /* the water round her legs, once she is in it */
    const sh = csSm(3.2, 8.8, u); if (sh > 0){ const sx = csLerp(200, 760, sh), sy = gy + 220 + Math.sin(t * 1.6) * 10; ctx.fillStyle = 'rgba(10,40,48,' + (0.45 * Math.min(1, sh * 3)).toFixed(3) + ')'; ctx.beginPath(); ctx.ellipse(sx, sy, 90, 18, 0, 0, TAU); ctx.fill(); ctx.beginPath(); ctx.moveTo(sx - 80, sy); ctx.lineTo(sx - 130, sy - 14); ctx.lineTo(sx - 124, sy + 14); ctx.closePath(); ctx.fill(); }
  }
}
MARS_FILMS.islesail = {
  end: IL_SAIL_T.END, starts: [0, IL_SAIL_T.B, IL_SAIL_T.C, 0, 0, 0, 0, 0], scene: isleSailScene,
  over(ctx, t){
    const v = ctx.createRadialGradient(640, 360, 300, 640, 360, 780); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(4,16,24,.4)'); ctx.fillStyle = v; ctx.fillRect(0, 0, CS_W, CS_H);
    marsFilmCaps(ctx, IL_SAIL_CAPS, t, '#9AF0E0');
    const f = marsFilmFade([IL_SAIL_T.B, IL_SAIL_T.C], IL_SAIL_T.END, t); if (f > 0.005){ ctx.fillStyle = 'rgba(0,0,0,' + f + ')'; ctx.fillRect(0, 0, CS_W, CS_H); }
  },
  cues: [[0.4, () => SFX.click()], [4.6, () => SFX.whoosh()], [8.2, () => SFX.click()], [11.6, () => SFX.whoosh()], [15.8, () => SFX.click()], [19.6, () => SFX.whoosh()]]
};

/* ---- film 2: the escape ---- */
function isleOutScene(ctx, t){
  const T = IL_OUT_T;
  if (t < T.B){                                                                      /* the tank room flooding, and Zero's last arm going under */
    const u = t, level = csLerp(60, 300, csSm(0, 7, u)); ilTankRoom(ctx, t, level);
    const sink = csSm(3.6, 6.6, u), ax = 860, ay = CS_H - level + 20 + sink * 220;
    if (sink < 1) ilTentacle(ctx, ax, ay, -Math.PI / 2 - 0.2 + Math.sin(t * 2) * 0.2, 260 * (1 - sink * 0.6), 34, '#5A3A6A', '#C8F0A8');
    csGiraffe(ctx, { x: 300, y: CS_H - level + 40, s: 0.72, face: 1, walk: 0, moving: false, neck: 0.5, head: 0.1, bare: true, boots: false });
    ctx.fillStyle = 'rgba(40,140,150,.55)'; ctx.fillRect(0, CS_H - level, CS_W, level);                              /* the water over her legs and the arm */
    ctx.strokeStyle = 'rgba(230,252,250,.6)'; ctx.lineWidth = 2; ctx.beginPath(); for (let x = 0; x <= CS_W; x += 20) ctx.lineTo(x, CS_H - level + Math.sin(x * 0.03 + t * 3 + 1) * 4); ctx.stroke();
    ctx.fillStyle = 'rgba(0,0,0,' + (0.5 * (1 - csSm(0, 1.2, u))).toFixed(3) + ')'; ctx.fillRect(0, 0, CS_W, CS_H);
  } else if (t < T.C){                                                               /* the helipad: someone runs for the white helicopter, it lifts and turns west; she arrives too late */
    const u = t - T.B, gy = 560, run = csSm(0, 2.8, u), spin = csSm(0.6, 3.2, u), lift = csSm(3.4, 7, u);
    ilDusk(ctx, t); ilFilmSea(ctx, 470, t, u * 30, 0);
    ctx.fillStyle = '#6A7072'; ctx.fillRect(0, gy, CS_W, CS_H - gy); ctx.fillStyle = '#8A9294'; ctx.fillRect(0, gy, CS_W, 8); ctx.fillStyle = 'rgba(244,244,236,.6)'; ctx.fillRect(560, gy + 20, 260, 8);
    const hx = 700 - lift * lift * 900, hy = gy - 66 - lift * 300;
    if (u < 2.6) ilFilmScientist(ctx, csLerp(1100, 760, run), gy + 4, 0.9, true, t);
    ctx.save(); ctx.translate(hx, hy); ctx.scale(-1, 1); domeHeli(ctx, { x: 0, y: 0, s: csLerp(1, 0.6, lift), t: t, rot: 0.08 * lift, spin: spin, pilot: u > 2.6, pal: IL_LAB_HELI }); ctx.restore();
    if (u < 4) for (let k = 0; k < 12; k++){ const a = (u * 1.2 + k / 12) % 1; ctx.globalAlpha = 0.25 * (1 - a) * spin; ctx.fillStyle = '#C8D0D4'; ctx.beginPath(); ctx.arc(hx + (k - 6) * 30 * (0.4 + a), gy + 4 - a * 14, 12 + a * 24, 0, TAU); ctx.fill(); }
    ctx.globalAlpha = 1;
    const arrive = csSm(4.4, 6.8, u); if (arrive > 0) csGiraffe(ctx, { x: csLerp(1380, 980, arrive), y: gy + 10, s: 0.72, face: -1, walk: u * 8, moving: arrive < 0.98, neck: csLerp(0.3, 0.7, csSm(6.4, 7, u)), head: -0.1, bare: true, boots: false });
  } else if (t < T.D){                                                               /* the shallows at sundown: the white helicopter a speck in the west, the town helicopter comes in low, she climbs aboard, and they go after it */
    const u = t - T.C, gy = 470, come = csSm(2.4, 5.6, u), board = csSm(5.8, 7.2, u), go = csSm(7.4, 10.3, u);
    ilDusk(ctx, t); ilFilmSea(ctx, gy, t, u * 20, 0);
    const spx = csLerp(360, 120, csSm(0, 10, u)), spy = 230 - u * 2; ctx.save(); ctx.translate(spx, spy); ctx.scale(-0.22, 0.22); domeHeli(ctx, { x: 0, y: 0, s: 1, t: t, pal: IL_LAB_HELI }); ctx.restore();
    ctx.fillStyle = '#E8D8A8'; ctx.fillRect(900, gy + 140, CS_W - 900, CS_H - gy - 140);
    if (board < 0.5){ csGiraffe(ctx, { x: 820, y: gy + 170, s: 0.68, face: -1, walk: 0, moving: false, neck: 0.62, head: -0.05, bare: true, boots: false }); ilWaterLegs(ctx, 816, gy + 148, 160, 60, function(){ ilFilmSea(ctx, gy, t, u * 20, 0); }, t); }
    const tx = csLerp(1500, 840, come) - go * go * 1100, ty = csLerp(180, gy - 10, come) - go * 200 + Math.sin(t * 1.7) * 6;
    ctx.save(); ctx.translate(tx, ty); ctx.scale(-1, 1); domeHeli(ctx, { x: 0, y: 0, s: csLerp(1, 0.7, go), t: t, rot: -0.04 + 0.08 * go, spin: 1, pilot: true }); ctx.restore();
    if (come > 0.95 && go < 0.02){ ctx.strokeStyle = '#C8A870'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(tx - 10, ty + 40); ctx.lineTo(tx - 10, ty + 130); ctx.moveTo(tx + 10, ty + 40); ctx.lineTo(tx + 10, ty + 130); ctx.stroke(); for (let k = 0; k < 6; k++){ ctx.beginPath(); ctx.moveTo(tx - 10, ty + 52 + k * 14); ctx.lineTo(tx + 10, ty + 52 + k * 14); ctx.stroke(); } }
    for (let k = 0; k < 6; k++){ const a = (t * 1.4 + k / 6) % 1; ctx.strokeStyle = 'rgba(255,255,255,' + (0.4 * (1 - a) * (1 - go)).toFixed(3) + ')'; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(tx, gy + 150, 40 + a * 160, 8 + a * 20, 0, 0, TAU); ctx.stroke(); }
  } else {                                                                           /* the chase: low over the sea at sundown, the water racing under them, the white helicopter ahead, the island falling away behind */
    const u = t - T.D, gy = 430;
    ctx.save(); ctx.translate(CS_W / 2 + Math.sin(t * 13) * 1.4, CS_H / 2 + Math.sin(t * 17) * 1.2); ctx.scale(1.01, 1.01); ctx.translate(-CS_W / 2, -CS_H / 2);      /* a little shake, and enough margin that it shows no edge */
    ilDusk(ctx, t);
    ilIslandFar(ctx, csLerp(1160, 1420, csSm(0, 6.5, u)), gy, csLerp(0.34, 0.22, csSm(0, 6.5, u)), t, true);
    ilFilmSea(ctx, gy, t, u * 900, 0);
    for (let k = 0; k < 7; k++){ const sx = CS_W - ((u * 520 + k * 190) % (CS_W + 200)), sy = gy + 30 + (k * 47) % 220; ctx.strokeStyle = 'rgba(255,236,210,' + (0.18 + (k % 3) * 0.06).toFixed(2) + ')'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(sx + 60 + k * 6, sy); ctx.stroke(); }      /* the sun on the wave tops, streaming past */
    const wx = 300 + Math.sin(t * 0.8) * 30 - csSm(4.4, 6.5, u) * 40, wy = 250 + Math.sin(t * 1.3) * 8;
    ctx.fillStyle = 'rgba(20,24,40,.25)'; ctx.beginPath(); ctx.ellipse(wx, gy + 26, 34, 5, 0, 0, TAU); ctx.fill();
    ctx.save(); ctx.translate(wx, wy); ctx.scale(-0.42, 0.42); domeHeli(ctx, { x: 0, y: 0, s: 1, t: t, rot: 0.12, spin: 1, pal: IL_LAB_HELI }); ctx.restore();
    const tx = 840 + Math.sin(t * 0.9) * 24, ty = 336 + Math.sin(t * 1.7) * 10, wy2 = gy + 74;
    for (let k = 0; k < 5; k++){ const a = (t * 2.2 + k / 5) % 1; ctx.strokeStyle = 'rgba(255,255,255,' + (0.5 * (1 - a)).toFixed(3) + ')'; ctx.lineWidth = 2.4; ctx.beginPath(); ctx.ellipse(tx + a * 90, wy2, 50 + a * 150, 7 + a * 14, 0, 0, TAU); ctx.stroke(); }      /* the rotor's wash on the water, blown back */
    for (let k = 0; k < 16; k++){ const a = (t * 1.6 + k / 16) % 1, px = tx - 40 + k * 9 + a * 260, py = wy2 - 4 - Math.sin(a * Math.PI) * 26 - (k % 3) * 4; fillCircle(ctx, px, py, 2.6 * (1 - a) + 0.6, 'rgba(240,252,255,' + (0.55 * (1 - a)).toFixed(3) + ')'); }
    ctx.save(); ctx.translate(tx, ty); ctx.scale(-1, 1); domeHeli(ctx, { x: 0, y: 0, s: 1.05, t: t, rot: 0.1, spin: 1, pilot: true }); ctx.restore();
    ctx.restore();
  }
}
MARS_FILMS.isleout = {
  end: IL_OUT_T.END, starts: [0, IL_OUT_T.B, IL_OUT_T.C, IL_OUT_T.D, 0, 0, 0, 0], scene: isleOutScene,
  over(ctx, t){
    const v = ctx.createRadialGradient(640, 360, 300, 640, 360, 780); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(10,8,20,.38)'); ctx.fillStyle = v; ctx.fillRect(0, 0, CS_W, CS_H);
    marsFilmCaps(ctx, IL_OUT_CAPS, t, '#9AF0E0');
    const f = marsFilmFade([IL_OUT_T.B, IL_OUT_T.C, IL_OUT_T.D], IL_OUT_T.END, t); if (f > 0.005){ ctx.fillStyle = 'rgba(0,0,0,' + f + ')'; ctx.fillRect(0, 0, CS_W, CS_H); }
  },
  cues: [[0.4, () => SFX.click()], [4.2, () => SFX.whoosh()], [7.8, () => SFX.click()], [10.6, () => SFX.whoosh()], [14.6, () => SFX.click()], [17.8, () => SFX.whoosh()], [21.4, () => SFX.click()], [24.6, () => SFX.whoosh()], [28.4, () => SFX.click()]]
};
