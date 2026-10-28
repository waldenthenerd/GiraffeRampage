'use strict';
/* The Tower films (Chapter 14). */
/* ========================= THE TOWER FILMS ========================= */
/* Two films in the same format as the Mars and Dome films (MARS_FILMS: end, starts, scene, over, cues), with nobody in them but the giraffe: the helicopter comes in over
   New York at night and sets down by a glass tower, and she crosses the plaza to the elevator (the start of Chapter 14); and, at the end, the vial, a paraglider off the top
   floor, a rooftop across the city and a second helicopter (the end of Chapter 14). Every frame is a pure function of time. */
const TW_FLIGHT_T = { B: 8, C: 16, D: 23, END: 31 };
const TW_OUT_T = { B: 8, C: 15, D: 23, END: 32 };
const TW_FLIGHT_CAPS = [
  [0.8, 'NEW YORK, AT NIGHT', 'The trail of foil stamps ends in one place', 3.4],
  [4.4, 'GREYMERE', 'A tower with its name in lights, high over the river', 3.2],
  [8.6, 'SET DOWN', 'A plaza, a pad, and nobody out at this hour', 3.2],
  [12.2, 'THE DOMES CAME FROM HERE', 'Every dome was ordered from the top floor', 3.4],
  [16.6, 'THE FRONT DOOR', 'Glass, brass, and not locked', 3.2],
  [20.0, 'IT IS TWENTY-FIVE FLOORS UP', 'And every one of them has a door', 2.8],
  [23.6, 'THE LOBBY', 'Marble, quiet, and a very large elevator', 3.2],
  [27.4, 'GOING UP', 'She presses the only button', 3.0]
];
const TW_OUT_CAPS = [
  [0.8, 'THE CORNER OFFICE', 'In the glass case on the wall, the vial', 3.4],
  [4.4, 'THE VIAL', 'Green, warm, and humming at her harness', 3.0],
  [8.6, 'THE ALARMS', 'Every light in the tower goes red', 2.8],
  [11.6, 'ONE WAY DOWN', 'The terrace, the rail, and a paraglider on a rack', 3.2],
  [15.6, 'OVER THE CITY', 'The whole of New York lit up under her feet', 3.4],
  [19.4, 'ANOTHER ROOF', 'A helipad across the river, with a helicopter on it', 3.2],
  [23.6, 'HOLD ON', 'The rotors are already turning', 2.6],
  [27.4, 'AWAY', 'The city falls behind, and the sky goes pale', 3.4]
];
const TW_HELI_PAL = { g: '#1C2230', gd: '#10131C', gl: '#2E3850', ink: '#0A0C12', band: '#C8CCD6' };
/* a city at night in layers: each layer is a row of towers scrolling at its own speed, lit windows on the near ones; k is how far, 0 near to 1 far */
function twCity(ctx, gy, sc, layer, seed){
  const cfgs = [{ par: 0.55, hMin: 160, hMax: 460, w: [60, 120], col: '#0E1220', win: 0.5, gap: 8 }, { par: 0.3, hMin: 130, hMax: 380, w: [50, 100], col: '#171B30', win: 0.4, gap: 6 }, { par: 0.14, hMin: 100, hMax: 300, w: [44, 90], col: '#222640', win: 0.3, gap: 4 }], K = cfgs[layer];
  const span = 2200; let x = -(((sc * K.par) % span) + span) % span - 200, i = 0;
  while (x < CS_W + 200){
    const r1 = csR(seed + layer * 100 + i), r2 = csR(seed + layer * 100 + i + 50), r3 = csR(seed + layer * 100 + i + 90), w = csLerp(K.w[0], K.w[1], r1), h = csLerp(K.hMin, K.hMax, r2);
    ctx.fillStyle = K.col; ctx.fillRect(x, gy - h, w, h + 4);
    if (r3 > 0.78){ ctx.beginPath(); ctx.moveTo(x + w * 0.2, gy - h); ctx.lineTo(x + w * 0.5, gy - h - 40 - r1 * 40); ctx.lineTo(x + w * 0.8, gy - h); ctx.closePath(); ctx.fill(); ctx.fillRect(x + w * 0.48, gy - h - 70 - r1 * 40, 2, 34); }
    else if (r3 > 0.5){ ctx.fillRect(x + w * 0.2, gy - h - 14, w * 0.6, 14); }
    if (layer < 2) for (let wy = gy - h + 10; wy < gy - 6; wy += 13) for (let wx = x + 6; wx < x + w - 8; wx += 11){ if (csR(seed + wx * 0.37 + wy * 1.7 + layer) < K.win){ ctx.fillStyle = csR(wx * 3.1 + wy) > 0.5 ? 'rgba(255,228,150,.85)' : 'rgba(255,200,120,.7)'; ctx.fillRect(wx, wy, 5, 6); } }
    x += w + K.gap + r1 * 12; i++;
  }
}
/* the Greymere tower itself, side on: a tall glass shaft with setbacks, a crown of lights, and its name down the side */
function twTower(ctx, x, gy, s, t, glow){
  const w = 180 * s, h = 880 * s;
  ctx.fillStyle = '#10162A'; ctx.fillRect(x - w / 2, gy - h, w, h + 6);
  ctx.fillStyle = '#18203A'; ctx.fillRect(x - w * 0.34, gy - h - 80 * s, w * 0.68, 80 * s + 1); ctx.fillRect(x - w * 0.18, gy - h - 140 * s, w * 0.36, 60 * s + 1);
  ctx.fillStyle = '#1E2848'; ctx.beginPath(); ctx.moveTo(x - w * 0.12, gy - h - 140 * s); ctx.lineTo(x, gy - h - 210 * s); ctx.lineTo(x + w * 0.12, gy - h - 140 * s); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#B8C0D8'; ctx.fillRect(x - 1.5 * s, gy - h - 280 * s, 3 * s, 72 * s); fillCircle(ctx, x, gy - h - 284 * s, 5 * s, Math.sin(t * 3) > 0 ? '#FF5A4A' : '#5A1A14');
  for (let wy = gy - h + 10 * s; wy < gy - 30 * s; wy += 16 * s) for (let wx = x - w / 2 + 8 * s; wx < x + w / 2 - 10 * s; wx += 14 * s){ const r = csR(wx * 0.31 + wy * 0.77 + 5); ctx.fillStyle = r < 0.55 ? 'rgba(255,230,160,' + (0.5 + 0.4 * r) + ')' : 'rgba(110,150,210,.25)'; ctx.fillRect(wx, wy, 8 * s, 10 * s); }
  const gg = ctx.createLinearGradient(x - w / 2, 0, x + w / 2, 0); gg.addColorStop(0, 'rgba(120,180,255,.18)'); gg.addColorStop(0.5, 'rgba(255,255,255,.04)'); gg.addColorStop(1, 'rgba(0,0,0,.25)'); ctx.fillStyle = gg; ctx.fillRect(x - w / 2, gy - h, w, h);
  const fs = Math.max(10, 24 * s), st = fs * 1.22, y0 = gy - 300 * s;
  ctx.fillStyle = '#05081A'; ctx.fillRect(x - fs * 0.85, y0 - fs * 1.1, fs * 1.7, st * 8 + fs * 0.5); ctx.strokeStyle = '#C8A850'; ctx.lineWidth = Math.max(1, 1.6 * s); ctx.strokeRect(x - fs * 0.85, y0 - fs * 1.1, fs * 1.7, st * 8 + fs * 0.5);
  ctx.font = '900 ' + fs + 'px "Arial Black", sans-serif'; ctx.textAlign = 'center'; ctx.lineJoin = 'round'; ctx.lineWidth = Math.max(2, fs * 0.2); ctx.strokeStyle = '#05081A'; ctx.fillStyle = '#FFE066';
  ctx.save(); ctx.translate(x, y0); for (const ch of 'GREYMERE'.split('')){ ctx.strokeText(ch, 0, 0); ctx.fillText(ch, 0, 0); ctx.translate(0, st); } ctx.restore(); ctx.textAlign = 'left';
  if (glow) csGlow(ctx, x, gy - h * 0.5, w * 2.4, '#FFE49A', glow * 0.2);
}
function twRiver(ctx, t, gy, sc, tone){
  const g = ctx.createLinearGradient(0, gy, 0, CS_H); g.addColorStop(0, '#2A2448'); g.addColorStop(1, '#0A0C18'); ctx.fillStyle = g; ctx.fillRect(0, gy, CS_W, CS_H - gy + 2);
  for (let k = 0; k < 70; k++){ const x = (((csR(k + 41000) * 1700 - sc * (0.2 + csR(k + 41050) * 0.5)) % 1700) + 1700) % 1700 - 200, y = gy + 6 + csR(k + 41100) * (CS_H - gy - 10); ctx.globalAlpha = 0.3 + 0.4 * Math.sin(t * 2 + k); ctx.fillStyle = csR(k + 41200) > 0.5 ? '#FFE49A' : '#9AB8FF'; ctx.fillRect(x, y, 6 + csR(k + 41300) * 22, 2); } ctx.globalAlpha = 1;
}
function twNight(ctx, t, tone){ afSky(ctx, '#05071A', '#241B4A', '#6A3A62'); csStars(ctx, 1, t, 0, 0); csGlow(ctx, 1040, 120, 200, '#DCE4FF', 0.2); fillCircle(ctx, 1040, 120, 34, '#EEF2FF'); fillCircle(ctx, 1028, 112, 6, 'rgba(160,170,200,.5)'); fillCircle(ctx, 1052, 130, 4, 'rgba(160,170,200,.5)'); }

/* ---- film 1 (31 s): in over the river, down on the plaza, across it, and up in the elevator ---- */
function towerFlightScene(ctx, t){
  const T = TW_FLIGHT_T;
  if (t < T.B){                                                                     /* over the river toward the tower */
    const u = t, p = csSm(0, 8, u), gy = 520;
    twNight(ctx, t, 0); twCity(ctx, gy - 20, u * 40, 2, 7); twCity(ctx, gy, u * 70, 1, 11);
    twTower(ctx, csLerp(1120, 800, p), gy, csLerp(0.5, 1.12, p), t, 1); twCity(ctx, gy + 14, u * 140, 0, 3);
    twRiver(ctx, t, gy + 14, u * 240, 0);
    domeHeli(ctx, { x: csLerp(220, 520, p), y: 250 + Math.sin(t * 1.3) * 10, s: csLerp(0.7, 1.0, p), t: t, rot: 0.04, pilot: true, light: true });
    ctx.fillStyle = 'rgba(255,250,210,.1)'; ctx.beginPath(); ctx.moveTo(csLerp(220, 520, p) + 70, 270); ctx.lineTo(csLerp(220, 520, p) + 700, 470); ctx.lineTo(csLerp(220, 520, p) + 560, 540); ctx.closePath(); ctx.fill();
  } else if (t < T.C){                                                              /* down on the plaza */
    const u = t - T.B, gy = 600, land = csSm(0.5, 6, u), rotor = u < 6.4 ? 1 : 1 - csSm(6.4, 8, u);
    twNight(ctx, t, 0); twCity(ctx, gy - 90, 900 + u * 10, 2, 7); twCity(ctx, gy - 60, 900 + u * 20, 1, 11);
    twTower(ctx, 1060, gy - 40, 1.5, t, 0.5);
    twPlaza(ctx, t, gy);
    const hy = csLerp(260, gy - 74, land);
    domeHeli(ctx, { x: 470, y: hy, s: 1.0, t: t, rot: 0.06 * (1 - land), spin: rotor, pilot: u < 7.2 });
    ctx.fillStyle = 'rgba(255,250,210,' + (0.14 * (1 - land * 0.6)) + ')'; ctx.beginPath(); ctx.moveTo(540, hy + 10); ctx.lineTo(760, gy + 40); ctx.lineTo(380, gy + 40); ctx.closePath(); ctx.fill();
    if (u > 6.9) csGiraffe(ctx, { x: csLerp(440, 760, csSm(6.9, 8, u)), y: gy + 14, s: 0.72, face: 1, walk: u * 8, moving: true, neck: 0.25, head: 0.1, bare: true, boots: false });
  } else if (t < T.D){                                                              /* across the plaza toward the glass doors */
    const u = t - T.C, gy = 610, sc = u * 120;
    afSky(ctx, '#05071A', '#1A1640', '#3A2A5A'); csStars(ctx, 0.8, t, 0, 0);
    twFacade(ctx, t, gy, u);
    twPlaza(ctx, t, gy, true, sc);
    csGiraffe(ctx, { x: csLerp(100, 920, csSm(0.2, 6.4, u)), y: gy + 4, s: 0.78, face: 1, walk: u * 7, moving: u < 6.6, neck: 0.22, head: 0.08, bare: true, boots: false });
  } else {                                                                          /* the lobby, and the elevator */
    const u = t - T.D, gy = 560;
    twLobby(ctx, t, u);
    const open = csSm(2.6, 4, u) * (1 - csSm(5.4, 6.4, u));
    csGiraffe(ctx, { x: csLerp(220, 760, csSm(0.4, 4.4, u)), y: gy + 80 + 6 * csSm(0.4, 4.4, u), s: csLerp(0.9, 0.62, csSm(0.4, 4.4, u)), face: 1, walk: u * 7, moving: u < 4.6, neck: 0.25, head: 0.08, bare: true, boots: false });
    twLiftDoors(ctx, 640, 232, open, u);
  }
}
/* the plaza by the river: paving, a helipad, lamps, and the bit of tower that reaches the ground */
function twPlaza(ctx, t, gy, noPad, sc){
  const g = ctx.createLinearGradient(0, gy, 0, CS_H); g.addColorStop(0, '#3A3650'); g.addColorStop(1, '#1A1830'); ctx.fillStyle = g; ctx.fillRect(0, gy, CS_W, CS_H - gy + 2);
  ctx.strokeStyle = 'rgba(120,130,170,.25)'; ctx.lineWidth = 2; for (let k = -2; k < 24; k++){ const x = ((k * 90 - (sc || 0)) % 2160 + 2160) % 2160 - 200; ctx.beginPath(); ctx.moveTo(x, gy); ctx.lineTo(x - 80 - (x - 640) * 0.3, CS_H); ctx.stroke(); }
  for (let j = 1; j < 5; j++){ ctx.beginPath(); ctx.moveTo(0, gy + j * j * 8); ctx.lineTo(CS_W, gy + j * j * 8); ctx.stroke(); }
  if (!noPad){ domePad(ctx, 470, gy, t, 1); }
  for (const lx of (noPad ? [150, 400] : [150, 820, 1180])){ ctx.fillStyle = '#2A2E3E'; ctx.fillRect(lx - 3, gy - 150, 6, 150); ctx.fillRect(lx - 14, gy - 154, 28, 6); csGlow(ctx, lx, gy - 148, 90, '#FFE49A', 0.4); fillCircle(ctx, lx, gy - 146, 6, '#FFF4C0'); }
}
/* the tower from the street: a wall of glass going up out of the top of the picture, a canopy, and brass doors; the name in lights over them */
function twFacade(ctx, t, gy, u){
  const x0 = 520, x1 = 1280, dh = 200, ch = gy - dh - 26;                          /* doors dh tall (she is under 180), the canopy at ch, the name plate above it */
  ctx.fillStyle = '#0E1226'; ctx.fillRect(x0, 0, x1 - x0, gy);
  for (let wy = 10; wy < ch - 104; wy += 40) for (let wx = x0 + 10; wx < x1 - 6; wx += 52){ const r = csR(wx * 0.31 + wy * 0.77); ctx.fillStyle = r < 0.5 ? 'rgba(255,230,160,' + (0.35 + 0.4 * r) + ')' : 'rgba(110,150,210,.2)'; ctx.fillRect(wx, wy, 40, 28); ctx.fillStyle = 'rgba(255,255,255,.1)'; ctx.fillRect(wx, wy, 40, 4); }
  ctx.fillStyle = '#1A2038'; for (let wx = x0; wx < x1; wx += 52) ctx.fillRect(wx - 1, 0, 3, ch - 104);
  ctx.fillStyle = '#1C2240'; ctx.fillRect(x0, ch - 100, x1 - x0, gy - ch + 100); ctx.fillStyle = '#C8A850'; ctx.fillRect(x0, ch - 104, x1 - x0, 5);
  const px0 = 780, pw = 440, py0 = ch - 84, ph = 62;                                  /* the name plate: dark, brass-framed, outlined gold letters */
  ctx.fillStyle = '#080B1C'; ctx.fillRect(px0, py0, pw, ph); ctx.strokeStyle = '#C8A850'; ctx.lineWidth = 3; ctx.strokeRect(px0, py0, pw, ph);
  ctx.font = '900 36px "Arial Black", sans-serif'; ctx.textAlign = 'center'; ctx.lineJoin = 'round'; ctx.lineWidth = 6; ctx.strokeStyle = '#05081A'; ctx.fillStyle = '#FFE066'; ctx.strokeText('GREYMERE GROUP', px0 + pw / 2, py0 + 44); ctx.fillText('GREYMERE GROUP', px0 + pw / 2, py0 + 44); ctx.textAlign = 'left';
  csGlow(ctx, px0 + pw / 2, py0 + ph / 2, 230, '#E8C84A', 0.12 + 0.04 * Math.sin(t * 5));
  ctx.fillStyle = '#242A44'; ctx.fillRect(x0, ch, x1 - x0, 20); ctx.fillStyle = '#C8A850'; ctx.fillRect(x0, ch + 20, x1 - x0, 4);                      /* the canopy over the doors */
  ctx.fillStyle = '#0A0E20'; ctx.fillRect(x0 + 80, ch + 24, 520, gy - ch - 24);
  for (let k = 0; k < 4; k++){ const dx = x0 + 100 + k * 124, dw = 112, dt = ch + 30; ctx.fillStyle = '#6A8AA8'; ctx.fillRect(dx, dt, dw, gy - dt); ctx.fillStyle = 'rgba(255,255,255,.22)'; ctx.fillRect(dx + 10, dt + 10, 28, gy - dt - 40); ctx.fillStyle = '#C8A850'; ctx.fillRect(dx + dw / 2 - 4, dt, 8, gy - dt); ctx.fillRect(dx, dt, dw, 5); ctx.fillRect(dx, dt + (gy - dt) * 0.5, dw, 3); ctx.fillStyle = '#E8D890'; ctx.fillRect(dx + dw / 2 - 18, dt + (gy - dt) * 0.55, 6, 28); ctx.fillRect(dx + dw / 2 + 12, dt + (gy - dt) * 0.55, 6, 28); }
  const open = csSm(5.2, 7, u); if (open > 0){ ctx.fillStyle = 'rgba(255,230,170,' + (0.5 * open) + ')'; ctx.fillRect(x0 + 100 + 2 * 124, ch + 30, 112, gy - ch - 30); }
}
/* the lobby, looking straight in: a marble floor running back to a wall of brass elevator doors, pillars either side, and a long empty desk */
function twLobby(ctx, t, u){
  const g = ctx.createLinearGradient(0, 0, 0, 720); g.addColorStop(0, '#1C1A2E'); g.addColorStop(0.555, '#2A2640'); g.addColorStop(0.556, '#D8D2C2'); g.addColorStop(1, '#8A8472'); ctx.fillStyle = g; ctx.fillRect(0, 0, CS_W, CS_H);
  ctx.fillStyle = '#242038'; ctx.fillRect(0, 0, CS_W, 400);
  for (let k = 0; k < 14; k++){ ctx.fillStyle = 'rgba(232,200,120,.12)'; ctx.fillRect(40 + k * 90, 0, 6, 400); }
  ctx.fillStyle = '#3A3452'; ctx.fillRect(0, 386, CS_W, 14); ctx.fillStyle = '#C8A850'; ctx.fillRect(0, 384, CS_W, 3);                                /* skirting where the wall meets the marble */
  ctx.strokeStyle = 'rgba(120,110,90,.35)'; ctx.lineWidth = 2; for (let k = -8; k <= 8; k++){ ctx.beginPath(); ctx.moveTo(640 + k * 40, 400); ctx.lineTo(640 + k * 190, CS_H); ctx.stroke(); } for (let j = 0; j < 8; j++){ const y = 400 + Math.pow(j / 7, 1.8) * 320; ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(CS_W, y); ctx.stroke(); }
    ctx.fillStyle = '#5A1E2A'; ctx.beginPath(); ctx.moveTo(590, 400); ctx.lineTo(690, 400); ctx.lineTo(760, CS_H); ctx.lineTo(520, CS_H); ctx.closePath(); ctx.fill(); ctx.strokeStyle = '#C8A850'; ctx.lineWidth = 3; ctx.stroke();
  for (const px of [150, 1130]){ ctx.fillStyle = '#B8B2A2'; ctx.fillRect(px - 44, 0, 88, 560); ctx.fillStyle = '#D8D2C2'; ctx.fillRect(px - 44, 0, 20, 560); ctx.fillStyle = 'rgba(0,0,0,.18)'; ctx.fillRect(px + 24, 0, 20, 560); ctx.fillStyle = '#C8A850'; ctx.fillRect(px - 52, 540, 104, 22); ctx.fillRect(px - 52, 0, 104, 18); ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.fillRect(px - 52, 562, 104, 10); }
  ctx.fillStyle = '#C8A850'; ctx.fillRect(500, 96, 280, 52); ctx.fillStyle = '#7A6428'; ctx.fillRect(500, 144, 280, 4);                                  /* the name plate, brass on the wall above the elevator */
  ctx.fillStyle = '#1E1A2E'; ctx.fillRect(506, 102, 268, 40); ctx.font = '900 26px "Arial Black", sans-serif'; ctx.textAlign = 'center'; ctx.lineJoin = 'round'; ctx.lineWidth = 5; ctx.strokeStyle = '#05081A'; ctx.fillStyle = '#FFE066'; ctx.strokeText('GREYMERE', 640, 132); ctx.fillText('GREYMERE', 640, 132); ctx.textAlign = 'left';
  csGlow(ctx, 640, 310, 240, '#FFE49A', 0.12);
}
function twLiftDoors(ctx, cx, y, open, u){
  const w = 200, h = 150, x = cx - w / 2, gap = open * 46;
  ctx.fillStyle = '#C8A850'; ctx.fillRect(x - 14, y - 14, w + 28, h + 14); ctx.fillStyle = '#7A6428'; ctx.fillRect(x - 14, y - 14, w + 28, 4); ctx.fillStyle = '#10141C'; ctx.fillRect(x - 6, y - 6, w + 12, h + 6); ctx.fillStyle = '#1E2A38'; ctx.fillRect(x, y, w, h);
  if (open > 0.05){ const gg = ctx.createLinearGradient(0, y, 0, y + h); gg.addColorStop(0, '#FFF6D8'); gg.addColorStop(1, '#C8B890'); ctx.fillStyle = gg; ctx.fillRect(cx - gap, y, gap * 2, h); ctx.fillStyle = 'rgba(80,60,30,.5)'; ctx.fillRect(cx - gap, y + h * 0.55, gap * 2, 4); }
  for (const dl of [[x, w / 2 - gap], [cx + gap, w / 2 - gap]]){ const dg = ctx.createLinearGradient(dl[0], 0, dl[0] + dl[1], 0); dg.addColorStop(0, '#B8A060'); dg.addColorStop(0.5, '#D8C27C'); dg.addColorStop(1, '#A89050'); ctx.fillStyle = dg; ctx.fillRect(dl[0], y, dl[1], h); ctx.fillStyle = 'rgba(0,0,0,.22)'; ctx.fillRect(dl[0] + 8, y + 22, Math.max(0, dl[1] - 16), h - 34); ctx.fillStyle = '#E8D890'; ctx.fillRect(dl[0] + 4, y + 4, Math.max(0, dl[1] - 8), 8); }
  ctx.fillStyle = '#6A5A2A'; ctx.fillRect(x + (w / 2 - gap) - 2, y, 2, h); ctx.fillRect(cx + gap, y, 2, h);
  ctx.fillStyle = '#10141C'; ctx.fillRect(cx - 24, y - 44, 48, 26); ctx.strokeStyle = '#C8A850'; ctx.lineWidth = 2; ctx.strokeRect(cx - 24, y - 44, 48, 26); ctx.fillStyle = '#9AE8FF'; ctx.font = '900 18px "Arial Black", sans-serif'; ctx.textAlign = 'center'; ctx.fillText(open > 0.9 ? 'L' : u > 6 ? '1' : 'L', cx, y - 24); ctx.textAlign = 'left';
  ctx.fillStyle = '#B8A060'; ctx.fillRect(x + w + 20, y + 44, 24, 64); ctx.fillStyle = '#10141C'; ctx.fillRect(x + w + 23, y + 47, 18, 58);              /* the call plate, screwed to the wall beside the doors */
  ctx.fillStyle = '#9AE8FF'; ctx.beginPath(); ctx.moveTo(x + w + 25, y + 70); ctx.lineTo(x + w + 32, y + 54); ctx.lineTo(x + w + 39, y + 70); ctx.fill(); fillCircle(ctx, x + w + 32, y + 90, 6, Math.sin(u * 5) > 0 ? '#9AE8FF' : '#2A4A5A');
}
MARS_FILMS.towerflight = {
  end: TW_FLIGHT_T.END, starts: [0, TW_FLIGHT_T.B, TW_FLIGHT_T.C, TW_FLIGHT_T.D, 0, 0, 0, 0], scene: towerFlightScene,
  over(ctx, t){
    const v = ctx.createRadialGradient(640, 360, 300, 640, 360, 780); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(4,2,14,.42)'); ctx.fillStyle = v; ctx.fillRect(0, 0, CS_W, CS_H);
    marsFilmCaps(ctx, TW_FLIGHT_CAPS, t, '#E8C84A');
    const f = marsFilmFade([TW_FLIGHT_T.B, TW_FLIGHT_T.C, TW_FLIGHT_T.D], TW_FLIGHT_T.END, t); if (f > 0.005){ ctx.fillStyle = 'rgba(0,0,0,' + f + ')'; ctx.fillRect(0, 0, CS_W, CS_H); }
  },
  cues: [[0.4, () => SFX.click()], [1.6, () => SFX.whoosh()], [8.4, () => SFX.whoosh()], [14.0, () => SFX.click()], [16.4, () => SFX.click()], [20.4, () => SFX.whoosh()], [23.6, () => SFX.click()], [26.8, () => SFX.level()], [28.4, () => SFX.click()]]
};

/* ---- film 2 (32 s): the vial in the corner office, the terrace, the paraglider, the other roof, and the second helicopter ---- */
/* the paraglider, seen from the front: a wide curved canopy of cells, lines running down to a harness, and the giraffe in it with her legs tucked. o = { x, y (the harness), s, t, rot, fill (0 to 1: the canopy filling) } */
function twGlider(ctx, o){
  const s = o.s || 1, fill = o.fill === undefined ? 1 : o.fill, sway = Math.sin((o.t || 0) * 1.3) * 0.05 + (o.rot || 0);
  ctx.save(); ctx.translate(o.x, o.y); ctx.rotate(sway); ctx.scale(s, s);
  const W = 190 * fill, H = 92 * fill, top = -250 * fill - 40;
  ctx.strokeStyle = 'rgba(230,230,240,.7)'; ctx.lineWidth = 1.2; for (let k = -6; k <= 6; k++){ ctx.beginPath(); ctx.moveTo(k * 3, -30); ctx.lineTo(k * W / 6.4, top + H * (1 - Math.pow(k / 6.4, 2)) * 0.18 + 36 * Math.abs(k) / 6); ctx.stroke(); }
  const cells = 10; for (let k = 0; k < cells; k++){
    const x0 = -W + k * (W * 2 / cells), x1 = x0 + W * 2 / cells, y0 = top + 34 * Math.pow(x0 / W, 2) * fill, y1 = top + 34 * Math.pow(x1 / W, 2) * fill;
    ctx.fillStyle = k % 2 ? '#FF8A3A' : '#F6F0E4'; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.quadraticCurveTo((x0 + x1) / 2, Math.min(y0, y1) - 30 * fill, x1, y1); ctx.lineTo(x1 - 1, y1 + 30 * fill); ctx.quadraticCurveTo((x0 + x1) / 2, Math.min(y0, y1) + 4, x0 + 1, y0 + 30 * fill); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(60,40,30,.5)'; ctx.lineWidth = 1.4; ctx.stroke();
  }
  ctx.fillStyle = '#1E222C'; ctx.beginPath(); ctx.moveTo(-W, top + 34 * fill); ctx.quadraticCurveTo(0, top - 30 * fill, W, top + 34 * fill); ctx.lineTo(W, top + 40 * fill); ctx.quadraticCurveTo(0, top - 22 * fill, -W, top + 40 * fill); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = '#2A2E3A'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-18, -36); ctx.lineTo(0, -4); ctx.lineTo(18, -36); ctx.stroke();
  csGiraffe(ctx, { x: 0, y: 92, s: 0.62, face: 1, neck: 0.5, head: 0.12, tuck: 1, bare: true, boots: false, blink: 0 });
  ctx.strokeStyle = '#1E222C'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-18, 2); ctx.lineTo(0, 36); ctx.moveTo(18, 2); ctx.lineTo(0, 36); ctx.stroke();
  ctx.restore();
}
function towerOutScene(ctx, t){
  const T = TW_OUT_T;
  if (t < T.B){                                                                     /* the corner office: the vial in its case, and the alarms */
    const u = t, flash = u > 3.4 ? (Math.sin(t * 9) > 0 ? 0.16 : 0) : 0;
    twOffice(ctx, t, u);
    const gx = csLerp(420, 700, csSm(0.2, 2.6, u)), grab = csSm(3.0, 4.2, u);
    csGiraffe(ctx, { x: gx, y: 612, s: 0.9, face: 1, walk: u * 7, moving: u < 2.8, neck: csLerp(0.18, 0.55, grab), head: csLerp(0.1, -0.1, grab), bare: true, boots: false });
    if (u > 4.2) csGlow(ctx, gx + 70, 420, 90, '#6AFFA0', 0.4 * (1 - csSm(6, 8, u)));
    if (flash){ ctx.fillStyle = 'rgba(255,30,30,' + flash + ')'; ctx.fillRect(0, 0, CS_W, CS_H); }
  } else if (t < T.C){                                                              /* out onto the terrace, and off it */
    const u = t - T.B, gy = 600, run = csSm(0.2, 4.6, u), jump = csSm(5.0, 6.4, u), fall = csSm(5.4, 7, u);
    twNight(ctx, t, 0); twCity(ctx, gy + 20, 600, 2, 21); twCity(ctx, gy + 80, 900, 1, 25); twCity(ctx, gy + 150, 1200, 0, 29);
    ctx.fillStyle = '#242038'; ctx.fillRect(0, gy, 900, CS_H - gy); ctx.fillStyle = '#383250'; ctx.fillRect(0, gy, 900, 10);
    ctx.fillStyle = '#B8BCC8'; ctx.fillRect(0, gy - 70, 900, 5); for (let k = 0; k < 14; k++) ctx.fillRect(k * 66 + 4, gy - 70, 4, 70);                       /* the rail */
    ctx.fillStyle = '#10141C'; ctx.fillRect(34, gy - 8, 6, 8); ctx.fillRect(130, gy - 8, 6, 8); ctx.fillStyle = '#4A3A22'; ctx.fillRect(30, gy - 62, 110, 56); ctx.strokeStyle = '#8A6A3A'; ctx.lineWidth = 2; ctx.strokeRect(30, gy - 62, 110, 56);
    ctx.fillStyle = '#FF8A3A'; ctx.fillRect(40, gy - 54, 90, 22); ctx.fillStyle = '#F6F0E4'; ctx.fillRect(40, gy - 30, 90, 16); ctx.fillStyle = '#2A2238'; ctx.fillRect(40, gy - 33, 90, 3);        /* the rack and the folded paraglider */
    ctx.fillStyle = '#383250'; ctx.fillRect(896, gy, 8, CS_H - gy); ctx.fillStyle = '#B8BCC8'; ctx.fillRect(896, gy - 70, 5, 70);
    const px = csLerp(180, 860, run) + jump * 150, py = csLerp(gy + 10, gy + 10, 0) - jump * 90 + fall * 220;
    if (u < 5.2) csGiraffe(ctx, { x: px, y: py, s: 0.8, face: 1, walk: u * 9, moving: u < 4.7, neck: 0.3, head: 0.1, bare: true, boots: false });
    else twGlider(ctx, { x: px + 20, y: py - 90 + 60 * fall, s: 0.9, t: t, fill: csSm(5.4, 7.4, u) });
    if (u > 5.2) ctx.fillStyle = 'rgba(255,40,40,' + (Math.sin(t * 9) > 0 ? 0.08 : 0) + ')', ctx.fillRect(0, 0, CS_W, CS_H);
  } else if (t < T.D){                                                              /* gliding down across the lit city */
    const u = t - T.C, p = csSm(0, 8, u), gy = 640;
    twNight(ctx, t, 0); twCity(ctx, gy - 80, u * 80, 2, 21); twCity(ctx, gy - 40, u * 160, 1, 25);
    for (let k = 0; k < 2; k++){ const sx = 300 + k * 520, a = Math.sin(t * 0.7 + k * 2) * 0.3 - 1.45; ctx.fillStyle = 'rgba(255,250,220,.08)'; ctx.beginPath(); ctx.moveTo(sx, gy - 20); ctx.lineTo(sx + Math.cos(a - 0.1) * 900, gy - 20 + Math.sin(a - 0.1) * 900); ctx.lineTo(sx + Math.cos(a + 0.1) * 900, gy - 20 + Math.sin(a + 0.1) * 900); ctx.closePath(); ctx.fill(); }   /* searchlights */
    twCity(ctx, gy, u * 300, 0, 29);
    twRiver(ctx, t, gy + 10, u * 300, 0);
    const far = csLerp(1250, 940, p); twRoof(ctx, far, gy - 150 + 150 * 0, t, 0.5 + 0.5 * p);
    twGlider(ctx, { x: csLerp(300, 640, p), y: csLerp(260, 430, p) + Math.sin(t * 1.3) * 8, s: csLerp(0.95, 0.75, p), t: t, rot: 0.04 });
    for (let k = 0; k < 3; k++){ const dx = csLerp(-100, 200, p) - k * 90 + Math.sin(t * 2 + k) * 8, dy = 120 + k * 36; ctx.fillStyle = '#0A0C14'; ctx.fillRect(dx - 9, dy - 3, 18, 7); ctx.fillRect(dx - 16, dy - 6, 10, 2); ctx.fillRect(dx + 6, dy - 6, 10, 2); fillCircle(ctx, dx, dy + 1, 2.4, '#FF5A4A'); }
  } else {                                                                          /* the other roof, the helicopter, and away */
    const u = t - T.D, gy = 560, land = csSm(0, 2.4, u), run = csSm(2.4, 5.2, u), lift = csSm(6.6, 9, u);
    twNight(ctx, t, 0); const dawn = csSm(5, 9, u); if (dawn > 0){ const dg = ctx.createLinearGradient(0, 300, 0, 620); dg.addColorStop(0, 'rgba(255,170,100,0)'); dg.addColorStop(1, 'rgba(255,170,100,' + (0.45 * dawn) + ')'); ctx.fillStyle = dg; ctx.fillRect(0, 300, CS_W, 320); }
    twCity(ctx, gy + 60 - lift * 40, 3000 + u * 20, 2, 21); twCity(ctx, gy + 100 - lift * 60, 3000 + u * 40, 1, 25);
    twRoof(ctx, 640, gy, t, 1);
    const hx = csLerp(740, 900, lift) + lift * lift * 500, hy = gy - 64 - lift * 280 + lift * lift * 40;
    domeHeli(ctx, { x: hx, y: hy, s: csLerp(1, 0.8, lift), t: t, rot: -0.08 * lift, spin: csSm(0, 1, u), pilot: u > 5.2, pal: TW_HELI_PAL });
    if (u < 5.2){ if (u < 2.4) twGlider(ctx, { x: csLerp(300, 480, land), y: csLerp(200, gy - 110, land), s: 0.75, t: t, fill: 1 - csSm(1.8, 2.4, u) * 0.7 });
      else csGiraffe(ctx, { x: csLerp(480, 700, run), y: gy - 10, s: 0.72, face: 1, walk: u * 9, moving: u < 5, neck: 0.25, head: 0.1, bare: true, boots: false }); }
  }
}
/* the corner office, side on: a window wall onto the night city, a big desk, an overturned chair, and a glass case on the wall with a vial in it */
function twOffice(ctx, t, u){
  const g = ctx.createLinearGradient(0, 0, 0, 720); g.addColorStop(0, '#171424'); g.addColorStop(1, '#2A2236'); ctx.fillStyle = g; ctx.fillRect(0, 0, CS_W, CS_H);
  ctx.save(); ctx.beginPath(); ctx.rect(0, 40, 560, 500); ctx.clip(); afSky(ctx, '#05071A', '#241B4A', '#6A3A62'); csStars(ctx, 0.8, t, 0, 0); twCity(ctx, 480, 800, 2, 21); twCity(ctx, 520, 1200, 1, 25); twCity(ctx, 560, 1600, 0, 29); ctx.restore();
  ctx.strokeStyle = '#2A2640'; ctx.lineWidth = 10; ctx.strokeRect(0, 40, 560, 500); ctx.lineWidth = 6; for (const x of [140, 280, 420]){ ctx.beginPath(); ctx.moveTo(x, 40); ctx.lineTo(x, 540); ctx.stroke(); } ctx.beginPath(); ctx.moveTo(0, 290); ctx.lineTo(560, 290); ctx.stroke();
  ctx.fillStyle = 'rgba(160,200,255,.07)'; ctx.fillRect(0, 40, 560, 500);
  ctx.fillStyle = '#2E2238'; ctx.fillRect(560, 40, 720, 500); for (let k = 0; k < 6; k++){ ctx.fillStyle = 'rgba(232,200,120,.08)'; ctx.fillRect(600 + k * 110, 40, 5, 500); }
  ctx.fillStyle = '#4A2E20'; ctx.fillRect(0, 540, CS_W, 180); ctx.fillStyle = '#6A4630'; ctx.fillRect(0, 540, CS_W, 8); ctx.fillStyle = '#C8A850'; ctx.fillRect(560, 530, 720, 4);          /* the wall meets the wooden floor at 540 */
  ctx.fillStyle = 'rgba(0,0,0,.16)'; for (let k = 0; k < 7; k++) ctx.fillRect(0, 548 + k * k * 4 + k * 6, CS_W, 2);                                                      /* floorboards */
  ctx.fillStyle = '#7A1E2A'; ctx.fillRect(480, 626, 560, 22); ctx.fillStyle = '#C8A850'; ctx.fillRect(480, 626, 560, 3);                                                /* a rug under the desk */
  ctx.fillStyle = '#10141C'; ctx.fillRect(610, 470, 18, 110); ctx.fillRect(972, 470, 18, 110); ctx.fillStyle = '#5A3A24'; ctx.fillRect(628, 480, 344, 80);                   /* the desk: two panel legs and a modesty front */
  ctx.fillStyle = '#7A5636'; ctx.fillRect(590, 462, 420, 18); ctx.fillStyle = '#C8A850'; ctx.fillRect(590, 478, 420, 3); ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.fillRect(590, 580, 420, 6);
  ctx.fillStyle = '#10141C'; ctx.fillRect(840, 412, 90, 50); ctx.fillRect(878, 458, 14, 6); ctx.fillStyle = '#6AB8E8'; ctx.fillRect(846, 418, 78, 38);                         /* the screen, on its stand */
  ctx.fillStyle = '#E8E4DA'; ctx.fillRect(650, 450, 40, 12); ctx.fillStyle = '#C8A850'; ctx.fillRect(704, 440, 12, 22);                                                  /* a paper stack and a pen pot */
  ctx.save(); ctx.translate(1040, 618); ctx.rotate(-1.35); ctx.fillStyle = '#10141C'; ctx.fillRect(-26, -50, 52, 46); ctx.fillStyle = '#2A2E3C'; ctx.fillRect(-22, -46, 44, 14); ctx.fillStyle = '#10141C'; ctx.fillRect(-4, -4, 8, 40);
  ctx.strokeStyle = '#10141C'; ctx.lineWidth = 6; for (let k = 0; k < 5; k++){ const a = k / 5 * TAU; ctx.beginPath(); ctx.moveTo(0, 36); ctx.lineTo(Math.cos(a) * 30, 36 + Math.sin(a) * 14); ctx.stroke(); } ctx.restore();       /* the chair, tipped over in the rush */
  const cx = 1130, cy = 240, brk = csSm(3.2, 4.0, u), green = 0.6 + 0.3 * Math.sin(t * 4);
  ctx.fillStyle = '#C8A850'; ctx.fillRect(cx - 74, cy - 104, 148, 220); ctx.fillStyle = '#1A1630'; ctx.fillRect(cx - 64, cy - 94, 128, 200);
  csGlow(ctx, cx, cy, 130, '#6AFFA0', 0.3 * green);
  ctx.fillStyle = 'rgba(210,255,225,.85)'; ctx.fillRect(cx - 14, cy - 40, 28, 90); ctx.beginPath(); ctx.arc(cx, cy - 40, 14, Math.PI, 0); ctx.fill(); ctx.fillStyle = '#6AFFA0'; ctx.fillRect(cx - 10, cy - 14, 20, 60); ctx.fillStyle = '#C8CCD6'; ctx.fillRect(cx - 12, cy - 56, 24, 12); fillCircle(ctx, cx - 4, cy - 20, 3, '#FFFFFF');
  if (u < 4.2 && brk < 0.5){ ctx.fillStyle = 'rgba(180,220,255,.25)'; ctx.fillRect(cx - 64, cy - 94, 128, 200); }
  else { ctx.strokeStyle = 'rgba(220,240,255,.8)'; ctx.lineWidth = 2; for (let k = 0; k < 6; k++){ const a = k * 1.05 + 0.3; ctx.beginPath(); ctx.moveTo(cx - 58 + (k % 2) * 40, cy - 90); ctx.lineTo(cx - 58 + (k % 2) * 40 + Math.cos(a) * 36, cy - 90 + Math.sin(a) * 48 + 40); ctx.stroke(); } }
  ctx.fillStyle = '#C8A850'; ctx.fillRect(660, 100, 300, 60); ctx.fillStyle = '#1A1630'; ctx.fillRect(666, 106, 288, 48);
  ctx.font = '900 24px "Arial Black", sans-serif'; ctx.textAlign = 'center'; ctx.lineJoin = 'round'; ctx.lineWidth = 5; ctx.strokeStyle = '#05081A'; ctx.fillStyle = '#FFE066'; ctx.strokeText('GREYMERE GROUP', 810, 140); ctx.fillText('GREYMERE GROUP', 810, 140); ctx.textAlign = 'left';
}
/* a flat rooftop with a helipad: a ring of lights, a painted H, a stair hut, and the city behind it */
function twRoof(ctx, x, gy, t, k){
  const bk = gy - 40;                                                              /* the far edge of the roof; gy is the near edge */
  ctx.fillStyle = '#1C2232'; ctx.fillRect(x - 330, gy, 660, 400); ctx.fillStyle = '#2C3448'; ctx.fillRect(x - 330, bk, 660, 40); ctx.fillStyle = '#4A546C'; ctx.fillRect(x - 336, gy - 4, 672, 8); ctx.fillStyle = '#343C52'; ctx.fillRect(x - 336, bk - 8, 672, 8);
  ctx.fillStyle = '#3A4458'; ctx.fillRect(x - 300, bk - 100, 70, 100); ctx.fillStyle = '#2A3244'; ctx.fillRect(x - 306, bk - 106, 82, 8); ctx.fillStyle = '#1A2030'; ctx.fillRect(x - 280, bk - 64, 28, 64);
  ctx.strokeStyle = '#B8BCC8'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x + 150, bk - 8); ctx.lineTo(x + 150, bk - 66); ctx.moveTo(x + 150, bk - 66); ctx.lineTo(x + 330, bk - 66); ctx.moveTo(x + 330, bk - 8); ctx.lineTo(x + 330, bk - 66); ctx.stroke();
  ctx.fillStyle = '#10141C'; ctx.beginPath(); ctx.ellipse(x - 20, gy - 20, 230, 16, 0, 0, TAU); ctx.fill(); ctx.strokeStyle = '#E8E8E4'; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(x - 20, gy - 20, 204, 12, 0, 0, TAU); ctx.stroke();
  ctx.fillStyle = '#F2F2EE'; ctx.font = '700 26px system-ui, sans-serif'; ctx.textAlign = 'center'; ctx.fillText('H', x - 20, gy - 10); ctx.textAlign = 'left';
  for (let i = 0; i < 12; i++){ const a = i / 12 * TAU; fillCircle(ctx, x - 20 + Math.cos(a) * 224, gy - 20 + Math.sin(a) * 15, 3.4, Math.sin(t * 4 + i) > 0 ? '#6AFFB0' : '#2A5A44'); }
  ctx.fillStyle = '#E8C84A'; ctx.font = '900 14px "Arial Black", sans-serif'; ctx.lineJoin = 'round'; ctx.lineWidth = 3; ctx.strokeStyle = '#0A0C14'; ctx.strokeText('H-2', x + 220, gy + 30); ctx.fillText('H-2', x + 220, gy + 30);
}
MARS_FILMS.towerout = {
  end: TW_OUT_T.END, starts: [0, TW_OUT_T.B, TW_OUT_T.C, TW_OUT_T.D, 0, 0, 0, 0], scene: towerOutScene,
  over(ctx, t){
    const v = ctx.createRadialGradient(640, 360, 300, 640, 360, 780); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(10,4,20,.42)'); ctx.fillStyle = v; ctx.fillRect(0, 0, CS_W, CS_H);
    marsFilmCaps(ctx, TW_OUT_CAPS, t, '#E8C84A');
    const f = marsFilmFade([TW_OUT_T.B, TW_OUT_T.C, TW_OUT_T.D], TW_OUT_T.END, t); if (f > 0.005){ ctx.fillStyle = 'rgba(0,0,0,' + f + ')'; ctx.fillRect(0, 0, CS_W, CS_H); }
  },
  cues: [[0.4, () => SFX.click()], [3.4, () => SFX.zap()], [4.2, () => SFX.level()], [8.8, () => SFX.whoosh()], [12.8, () => SFX.whoosh()], [13.4, () => SFX.boom()], [15.6, () => SFX.whoosh()], [23.4, () => SFX.click()], [26.8, () => SFX.whoosh()], [28.6, () => SFX.whoosh()]]
};
