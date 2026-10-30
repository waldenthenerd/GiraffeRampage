'use strict';
/* The Fort Shortneck films (Chapter 16). */
/* ========================= THE FORT FILMS ========================= */
/* Two films in the same format as the Siege's (MARS_FILMS: end, starts, scene, over, cues): the climb, at the start of Chapter 16 (night on the ridge, the floodlit wall, and she goes up it with
   her neck and hooves and drops down inside), and, at the end, the morning after (the fort smoking from the ridge, a cracked screen in the wreck of the command bunker with a map on it and one
   place circled in red, and her on the wall as the sun comes up), which closes nothing. Every frame is a pure function of time. */
const FT_CLIMB_T = { B: 8, C: 17, END: 25 };
const FT_OUT_T = { B: 8, C: 15, END: 22 };
const FT_CLIMB_CAPS = [
  [0.8, 'THE RIDGE', 'Above the waterhole, one place with every light on', 3.2],
  [4.4, 'FORT SHORTNECK', 'Where the machines were made, and where they were sent from', 3.2],
  [8.8, 'THE WALL', 'Concrete, razor wire, and a searchlight that never stops', 3.2],
  [12.6, 'UP', 'A neck is good for more than leaves', 3.2],
  [17.6, 'OVER', 'Hangars, barracks, a fuel depot and a very large bunker', 3.4],
  [21.4, 'EVERYTHING IN THERE IS A TARGET', 'Jump', 3.2]
];
const FT_OUT_CAPS = [
  [0.8, 'MORNING', 'The sirens have stopped, one by one', 3.4],
  [4.4, 'THE RIDGE', 'Smoke from the hangar, the depot and the plant', 3.0],
  [8.6, 'THE COMMAND BUNKER', 'A cracked screen is still lit', 3.2],
  [11.8, 'A MAP', 'With one place circled in red', 3.0],
  [15.6, 'THE WALL', 'She looks out over what is left', 3.2],
  [19.0, 'THE SUN COMES UP', 'And she has somewhere to be', 3.0]
];
function ftNight(ctx, t, k){ afSky(ctx, '#080C1E', '#1C2A4A', '#3A4A66'); csStars(ctx, 0.9 * (1 - k * 0.5), t, 0, 0); csGlow(ctx, 280, 150, 160, '#CFE0FF', 0.25); fillCircle(ctx, 280, 150, 36, '#E8F0FF'); fillCircle(ctx, 294, 142, 36, '#14223E'); }
function ftDawn(ctx, t){ afSky(ctx, '#2A3A6A', '#E88A6A', '#FFD890'); csGlow(ctx, 980, 470, 300, '#FFE6B0', 0.45); fillCircle(ctx, 980, 480, 52, '#FFF2D0'); }
function ftSearch(ctx, x, y, a, len, w, alpha){ ctx.save(); ctx.translate(x, y); ctx.rotate(a); ctx.globalCompositeOperation = 'lighter'; const g = ctx.createLinearGradient(0, 0, len, 0); g.addColorStop(0, 'rgba(255,240,180,' + alpha + ')'); g.addColorStop(1, 'rgba(255,240,180,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(len, -w); ctx.lineTo(len, w); ctx.closePath(); ctx.fill(); ctx.globalCompositeOperation = 'source-over'; ctx.restore(); }
/* the fort seen from a distance in silhouette: the wall, a watchtower at each end, and the hangar, the radar dome, the bunker and a chimney of smoke or two */
function ftSkyline(ctx, gy, k, t, smoke, lit){
  const col = '#0C1018', wall = '#161C26';
  ctx.fillStyle = wall; ctx.fillRect(160, gy - 36 * k, 960, 40 * k); ctx.fillStyle = '#242C3A'; ctx.fillRect(160, gy - 36 * k, 960, 5 * k);
  for (const tx of [160, 1120]){ ctx.fillStyle = col; ctx.fillRect(tx - 24 * k, gy - 100 * k, 48 * k, 104 * k); ctx.fillRect(tx - 34 * k, gy - 118 * k, 68 * k, 20 * k); if (lit){ fillCircle(ctx, tx, gy - 108 * k, 5 * k, '#FFF2B0'); csGlow(ctx, tx, gy - 108 * k, 60 * k, '#FFF2B0', 0.4); } }
  ctx.fillStyle = col; ctx.fillRect(250, gy - 80 * k, 190 * k, 84 * k); ctx.beginPath(); ctx.moveTo(250, gy - 80 * k); ctx.quadraticCurveTo(345, gy - 130 * k, 250 + 190 * k, gy - 80 * k); ctx.fill();
  ctx.beginPath(); ctx.arc(560, gy - 70 * k, 44 * k, Math.PI, TAU); ctx.fill(); ctx.fillRect(516, gy - 70 * k, 88 * k, 74 * k);
  ctx.fillRect(660, gy - 70 * k, 300 * k, 74 * k); ctx.fillRect(740, gy - 96 * k, 140 * k, 30 * k); ctx.fillRect(1000, gy - 140 * k, 12 * k, 144 * k); fillCircle(ctx, 1006, gy - 142 * k, 5 * k, lit ? '#FF5A4A' : '#3A1410');
  if (lit) for (let i = 0; i < 24; i++){ const x = 190 + csR(i + 40) * 900; if (csR(i + 90) > 0.4) { ctx.fillStyle = 'rgba(255,214,130,.85)'; ctx.fillRect(x, gy - 26 * k, 6 * k, 8 * k); } }
  if (smoke) for (const sx of [330, 560, 840, 1040]) sgSmoke(ctx, sx, gy - 60 * k, t + sx * 0.3, 240 * k, 0.9);
}
function ftWallFace(ctx, gy, top, t){                                           /* the wall close up: concrete blocks, razor wire along the top, and floodlights */
  ctx.fillStyle = '#4A4E54'; ctx.fillRect(0, top, CS_W, gy - top); ctx.fillStyle = '#6A6E74'; ctx.fillRect(0, top, CS_W, 16);
  for (let r = 0; r < Math.ceil((gy - top) / 40); r++) for (let c = 0; c < 20; c++){ const x = c * 70 + (r % 2) * 35 - 30, y = top + 16 + r * 40; ctx.fillStyle = (r + c) % 3 ? 'rgba(0,0,0,.1)' : 'rgba(255,255,255,.06)'; ctx.fillRect(x + 2, y + 2, 66, 36); ctx.strokeStyle = 'rgba(0,0,0,.4)'; ctx.lineWidth = 2; ctx.strokeRect(x, y, 70, 40); }
  ctx.strokeStyle = 'rgba(210,214,222,.8)'; ctx.lineWidth = 3; ctx.beginPath(); for (let x = 0; x <= CS_W; x += 18){ ctx.lineTo(x, top - 8 + (x / 18 % 2 ? -10 : 10)); } ctx.stroke(); ctx.beginPath(); for (let x = 9; x <= CS_W; x += 18){ ctx.lineTo(x, top - 26 + (x / 18 % 2 ? -10 : 10)); } ctx.stroke();
  for (const fx of [180, 560, 940, 1260]){ ctx.fillStyle = '#2E3038'; ctx.fillRect(fx - 4, top - 44, 8, 44); ctx.fillStyle = '#FFF2B0'; ctx.fillRect(fx - 18, top - 56, 36, 14); csGlow(ctx, fx, top - 49, 110, '#FFF2B0', 0.5); ctx.globalCompositeOperation = 'lighter'; const g = ctx.createLinearGradient(0, top - 40, 0, gy); g.addColorStop(0, 'rgba(255,240,180,.25)'); g.addColorStop(1, 'rgba(255,240,180,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(fx - 14, top - 40); ctx.lineTo(fx + 14, top - 40); ctx.lineTo(fx + 150, gy); ctx.lineTo(fx - 150, gy); ctx.closePath(); ctx.fill(); ctx.globalCompositeOperation = 'source-over'; }
}
function fortClimbScene(ctx, t){
  const T = FT_CLIMB_T;
  if (t < T.B){                                                                      /* the ridge at night: the fort lit up in the distance, and her creeping along the grass toward it */
    const u = t, gy = 600, k = csLerp(0.55, 0.95, csSm(0, 8, u)); ftNight(ctx, t, 0);
    ctx.fillStyle = '#0E1A1E'; ctx.beginPath(); ctx.moveTo(0, gy - 20); for (let x = 0; x <= CS_W; x += 80) ctx.lineTo(x, gy - 20 - 30 * Math.sin(x * 0.006 + 1)); ctx.lineTo(CS_W, gy + 40); ctx.lineTo(0, gy + 40); ctx.closePath(); ctx.fill();
    ftSkyline(ctx, gy - 40, k, t, false, true); ftSearch(ctx, 160, gy - 150 * k, -0.5 + Math.sin(t * 0.7) * 0.5, 520, 70, 0.2); ftSearch(ctx, 1120, gy - 150 * k, -2.6 - Math.sin(t * 0.7 + 1) * 0.5, 520, 70, 0.2);
    sgGround(ctx, gy, '#0E1C1A', '#1A2E28', u * 160); for (let i = 0; i < 5; i++) sgAcacia(ctx, ((i * 330 - u * 90) % 1800 + 1800) % 1800 - 200, gy + 4, 0.8 + (i % 3) * 0.3);
    csGiraffe(ctx, { x: csLerp(160, 760, csSm(0, 8, u)), y: gy + 40, s: 0.62, face: 1, walk: u * 6, moving: true, neck: 0.3, head: 0.1, bare: true, boots: false });
    ctx.fillStyle = 'rgba(0,0,0,' + (0.6 * (1 - csSm(0, 1.4, u))).toFixed(3) + ')'; ctx.fillRect(0, 0, CS_W, CS_H);
  } else if (t < T.C){                                                               /* the foot of the wall: she looks up, stretches, hooks her chin over the top and walks up it */
    const u = t - T.B, gy = 640, top = 150; afSky(ctx, '#080C1E', '#1C2A4A', '#3A4A66'); csStars(ctx, 0.7, t, 0, 0);
    ftWallFace(ctx, gy, top, t); sgGround(ctx, gy, '#10201C', '#1E3430', 0);
    const sweep = -0.7 + Math.sin(t * 0.8) * 0.9; ftSearch(ctx, 80, top - 60, 0.3 + sweep * 0.2, 900, 90, 0.22);
    const reach = csSm(0.8, 3.6, u), up = csSm(3.8, 9, u), gx = 620, gyy = csLerp(gy + 20, top + 74, up);
    const rot = -1.32 * (csSm(3.2, 4.6, u) - csSm(8.2, 9, u));                                                      /* she tips back and goes up it on all fours, then rights herself on top */
    ctx.save(); ctx.translate(gx, gyy); ctx.rotate(rot); csGiraffe(ctx, { x: 0, y: 0, s: 0.66, face: 1, walk: u * 7, moving: up > 0.02 && up < 0.98, neck: csLerp(0.3, 1.0, reach), head: csLerp(0.1, -0.3, reach), tuck: 0, bare: true, boots: false }); ctx.restore();
  } else {                                                                           /* on the wall: the whole fort below her, and she jumps */
    const u = t - T.C, gy = 640, k = csLerp(1.0, 1.4, csSm(0, 4, u)); ftNight(ctx, t, 0.5);
    ctx.fillStyle = '#10161E'; ctx.fillRect(0, gy - 120, CS_W, 200); ftSkyline(ctx, gy - 70, k, t, true, true);
    for (let i = 0; i < 4; i++) ftSearch(ctx, 250 + i * 260, gy - 90, -1.2 + Math.sin(t * 0.8 + i * 1.3) * 0.7, 460, 60, 0.2);
    ctx.fillStyle = '#242C34'; ctx.fillRect(0, gy + 6, CS_W, 120); ctx.fillStyle = '#4A4E54'; ctx.fillRect(0, gy, CS_W, 14);
    const jump = csSm(5.2, 7.2, u), gx = csLerp(300, 460, csSm(0, 5, u) * 0.2 + jump * 0.8), gyy = csLerp(gy - 8, gy + 230, jump * jump);
    csGiraffe(ctx, { x: gx, y: gyy, s: 0.7, face: 1, walk: u * 4, moving: u < 5, neck: csLerp(0.4, 0.8, jump), head: -0.1, tuck: jump, bare: true, boots: false });
    if (u > 7.2){ const lp = (u - 7.2) / 0.8; if (lp < 1){ ctx.strokeStyle = 'rgba(255,240,200,' + (1 - lp) + ')'; ctx.lineWidth = 6; ctx.beginPath(); ctx.ellipse(gx, gy + 236, 40 + lp * 160, 10 + lp * 30, 0, 0, TAU); ctx.stroke(); } }
  }
}
MARS_FILMS.fortflight = {
  end: FT_CLIMB_T.END, starts: [0, FT_CLIMB_T.B, FT_CLIMB_T.C, 0, 0, 0, 0, 0], scene: fortClimbScene,
  over(ctx, t){
    const v = ctx.createRadialGradient(640, 360, 300, 640, 360, 780); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(4,8,20,.5)'); ctx.fillStyle = v; ctx.fillRect(0, 0, CS_W, CS_H);
    marsFilmCaps(ctx, FT_CLIMB_CAPS, t, '#FFE49A');
    const f = marsFilmFade([FT_CLIMB_T.B, FT_CLIMB_T.C], FT_CLIMB_T.END, t); if (f > 0.005){ ctx.fillStyle = 'rgba(0,0,0,' + f + ')'; ctx.fillRect(0, 0, CS_W, CS_H); }
  },
  cues: [[0.4, () => SFX.click()], [2.4, () => SFX.whoosh()], [8.6, () => SFX.click()], [12.4, () => SFX.whoosh()], [16.4, () => SFX.click()], [22.2, () => SFX.whoosh()], [24.0, () => SFX.boom && SFX.boom()]]
};

/* ---- film 2 (22 s): the morning after ---- */
function ftScreen(ctx, x, y, w, h, t){                                                                   /* the cracked screen with a map on it and one place circled in red */
  ctx.fillStyle = '#06080C'; ctx.fillRect(x - 10, y - 10, w + 20, h + 20); ctx.fillStyle = '#10241E'; ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = 'rgba(122,255,200,.18)'; ctx.lineWidth = 1; for (let i = 1; i < 12; i++){ ctx.beginPath(); ctx.moveTo(x + i * w / 12, y); ctx.lineTo(x + i * w / 12, y + h); ctx.stroke(); } for (let j = 1; j < 7; j++){ ctx.beginPath(); ctx.moveTo(x, y + j * h / 7); ctx.lineTo(x + w, y + j * h / 7); ctx.stroke(); }
  ctx.fillStyle = 'rgba(122,255,200,.35)'; ctx.beginPath(); ctx.moveTo(x + w * 0.1, y + h * 0.6); ctx.bezierCurveTo(x + w * 0.2, y + h * 0.2, x + w * 0.4, y + h * 0.3, x + w * 0.5, y + h * 0.5); ctx.bezierCurveTo(x + w * 0.6, y + h * 0.7, x + w * 0.8, y + h * 0.4, x + w * 0.9, y + h * 0.3); ctx.lineTo(x + w * 0.9, y + h * 0.9); ctx.lineTo(x + w * 0.1, y + h * 0.9); ctx.closePath(); ctx.fill();
  const px = x + w * 0.72, py = y + h * 0.4, pulse = 0.5 + 0.5 * Math.sin(t * 3); ctx.strokeStyle = 'rgba(255,90,74,' + (0.7 + 0.3 * pulse) + ')'; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(px, py, 26 + 4 * pulse, 0, TAU); ctx.stroke(); csGlow(ctx, px, py, 60, '#FF5A4A', 0.3);
  ctx.strokeStyle = 'rgba(255,255,255,.55)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x + w * 0.3, y); ctx.lineTo(x + w * 0.38, y + h * 0.4); ctx.lineTo(x + w * 0.3, y + h * 0.7); ctx.lineTo(x + w * 0.4, y + h); ctx.moveTo(x + w * 0.38, y + h * 0.4); ctx.lineTo(x + w * 0.62, y + h * 0.5); ctx.stroke();
  csGlow(ctx, x + w / 2, y + h / 2, w * 0.7, '#7AFFC8', 0.12);
}
function fortOutScene(ctx, t){
  const T = FT_OUT_T;
  if (t < T.B){                                                                      /* morning on the ridge: the fort below, smoking */
    const u = t, gy = 600; ftDawn(ctx, t); ctx.fillStyle = '#2A2E3A'; ctx.beginPath(); ctx.moveTo(0, gy - 60); for (let x = 0; x <= CS_W; x += 80) ctx.lineTo(x, gy - 60 - 22 * Math.sin(x * 0.007 + 2)); ctx.lineTo(CS_W, gy + 50); ctx.lineTo(0, gy + 50); ctx.closePath(); ctx.fill();
    ftSkyline(ctx, gy - 30, 1.0 + u * 0.01, t, true, false); sgGround(ctx, gy + 6, '#4A4430', '#6A6244', u * 20);
    for (const sx of [330, 560, 840, 1040]) sgSmoke(ctx, sx, gy - 70, t + sx * 0.3, 280, 1);
    csGiraffe(ctx, { x: 150, y: gy + 40, s: 0.62, face: 1, walk: 0, moving: false, neck: 0.55 + 0.03 * Math.sin(t * 2), head: 0.1, bare: true, boots: false });
    ctx.fillStyle = 'rgba(0,0,0,' + (0.5 * (1 - csSm(0, 1.4, u))).toFixed(3) + ')'; ctx.fillRect(0, 0, CS_W, CS_H);
  } else if (t < T.C){                                                               /* inside the command bunker: the cracked screen */
    const u = t - T.B; ctx.fillStyle = '#14181E'; ctx.fillRect(0, 0, CS_W, CS_H); ctx.fillStyle = '#1E242C'; ctx.fillRect(0, 520, CS_W, 200);
    for (let i = 0; i < 6; i++){ ctx.fillStyle = 'rgba(255,255,255,.04)'; ctx.fillRect(60 + i * 200, 40, 6, 480); }
    ftScreen(ctx, 360, 120, 560, 330, t); ctx.strokeStyle = 'rgba(255,255,255,.7)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(640, 120); ctx.lineTo(600, 230); ctx.lineTo(680, 300); ctx.lineTo(620, 450); ctx.moveTo(600, 230); ctx.lineTo(430, 260); ctx.stroke();
    for (let i = 0; i < 14; i++){ ctx.fillStyle = 'rgba(80,76,72,.6)'; const rx = 120 + csR(i + 300) * 1040, ry = 540 + csR(i + 330) * 60; ctx.fillRect(rx, ry, 10 + csR(i + 360) * 28, 6 + csR(i + 390) * 12); }
    sgSmoke(ctx, 1140, 560, t, 300, 0.6);
    csGiraffe(ctx, { x: csLerp(160, 360, csSm(0, 6, u)), y: 640, s: 0.8, face: 1, walk: u * 5, moving: u < 6, neck: 0.5, head: 0.1, bare: true, boots: false });
  } else {                                                                           /* on the wall, as the sun comes up */
    const u = t - T.C; ftDawn(ctx, t); ctx.fillStyle = '#242C34'; ctx.fillRect(0, 600, CS_W, 200); ctx.fillStyle = '#4A4E54'; ctx.fillRect(0, 590, CS_W, 14);
    ctx.fillStyle = '#10161E'; ctx.beginPath(); ctx.moveTo(0, 590); for (let x = 0; x <= CS_W; x += 60) ctx.lineTo(x, 590 - 34 - 28 * csR(x + 7)); ctx.lineTo(CS_W, 590); ctx.closePath(); ctx.fill();
    for (const sx of [180, 460, 780]) sgSmoke(ctx, sx, 560, t + sx * 0.2, 240, 0.8);
    csGlow(ctx, 980, 470, 320, '#FFE6B0', 0.3 + 0.2 * csSm(0, 7, u));
    csGiraffe(ctx, { x: 560, y: 596, s: 0.78, face: 1, walk: 0, moving: false, neck: 0.62 + 0.03 * Math.sin(t * 1.6), head: 0.12, bare: true, boots: false });
  }
}
MARS_FILMS.fortout = {
  end: FT_OUT_T.END, starts: [0, FT_OUT_T.B, FT_OUT_T.C, 0, 0, 0, 0, 0], scene: fortOutScene,
  over(ctx, t){
    const v = ctx.createRadialGradient(640, 360, 300, 640, 360, 780); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(10,8,16,.35)'); ctx.fillStyle = v; ctx.fillRect(0, 0, CS_W, CS_H);
    marsFilmCaps(ctx, FT_OUT_CAPS, t, '#FFD890');
    const f = marsFilmFade([FT_OUT_T.B, FT_OUT_T.C], FT_OUT_T.END, t); if (f > 0.005){ ctx.fillStyle = 'rgba(0,0,0,' + f + ')'; ctx.fillRect(0, 0, CS_W, CS_H); }
  },
  cues: [[0.4, () => SFX.click()], [4.6, () => SFX.whoosh()], [8.8, () => SFX.click()], [12.0, () => SFX.pickupS()], [15.6, () => SFX.whoosh()], [19.4, () => SFX.click()]]
};
