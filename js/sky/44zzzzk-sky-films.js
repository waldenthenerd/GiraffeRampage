'use strict';
/* =============================================================================================================================
   44zzzzk-sky-films.js  --  THE AIR CHASE FILMS (Chapter 17.5), in the same format as the Island's (MARS_FILMS: end, starts, scene, over, cues).
   The opening goes on from Chapter 17's last shot: low over the sea at sundown, LAB-1 ahead; its cargo door slides open and drones pour out; she is at
   the town helicopter's open door with the gun the mechanic bolted on. The ending: LAB-1, hit, smoking and spinning down onto the sea; it floats tail up;
   the coast guard comes alongside and pulls out two scientists in white coats and a case of notes; the boat and the town helicopter head for the coast
   together. It closes the chase, nothing more. Every frame is a pure function of time.
   ============================================================================================================================= */
const SKY_IN_T = { B: 7.4, C: 14.2, END: 21 };
const SKY_OUT_T = { B: 7.2, C: 14.6, D: 21.4, END: 27.5 };
const SKY_IN_CAPS = [
  [0.8, 'LOW OVER THE WATER', 'LAB-1 is still ahead, and still running west', 3.2],
  [4.4, 'CLOSING IN', 'Close enough to read the number on its tail', 2.6],
  [8.0, 'THE CARGO DOOR', 'It slides open', 2.6],
  [10.8, 'DRONES', 'Dozens of them, and a call on the radio for help', 3.0],
  [14.8, 'THE DOOR GUN', 'The town mechanic bolted it on last week, just in case', 3.2],
  [18.2, 'BRING IT DOWN', 'Nose gun, left door, right door', 2.6]
];
const SKY_OUT_CAPS = [
  [0.8, 'LAB-1 IS HIT', 'Smoke from the engine, and the tail rotor gone', 3.0],
  [4.2, 'DOWN', 'Into the sea, in one piece', 2.6],
  [7.8, 'IT FLOATS', 'Tail up, rocking in its own waves', 3.0],
  [11.0, 'THE COAST GUARD', 'Called in by the town helicopter’s radio', 3.0],
  [15.0, 'CAUGHT', 'Two scientists, wet through, and a case of notes', 3.4],
  [18.6, 'NO MORE RUNNING', 'They sit very still on the deck', 2.6],
  [21.8, 'EAST', 'The long way back to Longneck Town', 3.0],
  [25.0, 'SIDE BY SIDE', 'The boat, and the helicopter low beside it', 2.2]
];
/* a few drones in the side view: a dark body and a blur of rotors */
function skyFilmDrone(ctx, x, y, s, t, k){
  ctx.save(); ctx.translate(x, y + Math.sin(t * 5 + k) * 3 * s); ctx.scale(s, s);
  ctx.fillStyle = 'rgba(220,230,236,.3)'; ctx.fillRect(-22, -12, 16, 3); ctx.fillRect(6, -12, 16, 3);
  ctx.strokeStyle = '#2A3034'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-14, -9); ctx.lineTo(-8, -2); ctx.moveTo(14, -9); ctx.lineTo(8, -2); ctx.stroke();
  ctx.fillStyle = '#5A646C'; ctx.beginPath(); ctx.ellipse(0, 0, 11, 6, 0, 0, TAU); ctx.fill(); fillCircle(ctx, 8, 0, 2.4, '#FF4A3A');
  ctx.restore();
}
/* the coast guard boat, side on: a white hull with an orange stripe, a cabin, a light bar and a crane */
function skyFilmBoat(ctx, x, y, s, t){
  const bob = Math.sin(t * 1.8) * 3 * s; ctx.save(); ctx.translate(x, y + bob); ctx.scale(s, s);
  ctx.fillStyle = '#F4F4EE'; ctx.beginPath(); ctx.moveTo(-170, -30); ctx.lineTo(150, -30); ctx.lineTo(190, -56); ctx.lineTo(176, 10); ctx.lineTo(-150, 10); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#E8682A'; ctx.beginPath(); ctx.moveTo(60, -30); ctx.lineTo(90, -30); ctx.lineTo(40, 10); ctx.lineTo(10, 10); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#2A4A7A'; ctx.fillRect(-150, 0, 326, 10);
  ctx.fillStyle = '#E8E8E2'; ctx.fillRect(-60, -96, 120, 66); ctx.fillStyle = '#8AC8E8'; for (let k = 0; k < 4; k++) ctx.fillRect(-52 + k * 28, -86, 22, 18);
  ctx.fillStyle = '#2A2E34'; ctx.fillRect(-40, -104, 80, 8); fillCircle(ctx, -24, -108, 5, Math.sin(t * 8) > 0 ? '#4A8AFF' : '#FF4A3A'); fillCircle(ctx, 24, -108, 5, Math.sin(t * 8) > 0 ? '#FF4A3A' : '#4A8AFF');
  ctx.strokeStyle = '#5A6068'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(-130, -30); ctx.lineTo(-130, -110); ctx.lineTo(-200, -140); ctx.stroke();
  ctx.fillStyle = '#2A4A7A'; ctx.font = 'bold 18px system-ui, sans-serif'; ctx.textAlign = 'center'; ctx.fillText('COAST GUARD', 120, -8);
  ctx.restore();
}
/* LAB-1 in the water: the cabin half under, the tail up, rings round it */
function skyFilmFloat(ctx, x, gy, t, sea){
  ctx.save(); ctx.translate(x, gy + 10 + Math.sin(t * 1.4) * 4); ctx.rotate(-0.42 + Math.sin(t * 1.1) * 0.05);
  domeHeli(ctx, { x: 0, y: 0, s: 0.62, t: t, spin: 0, pal: IL_LAB_HELI }); ctx.restore();
  ctx.save(); ctx.beginPath(); ctx.rect(x - 150, gy + 20, 300, 70); ctx.clip(); sea(); ctx.restore();                 /* the sea again over its lower half, so the cabin is under the water */
  for (let r = 0; r < 4; r++){ const a = (t * 0.6 + r / 4) % 1; ctx.strokeStyle = 'rgba(235,250,255,' + (0.5 * (1 - a)).toFixed(3) + ')'; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(x, gy + 22, 60 + a * 180, 6 + a * 14, 0, 0, TAU); ctx.stroke(); }
}
function skyInScene(ctx, t){
  const T = SKY_IN_T, gy = 430;
  if (t < T.B){                                                                               /* the chase, as Chapter 17 left it, closing in */
    const u = t, close = csSm(1, 7, u);
    ctx.save(); ctx.translate(CS_W / 2 + Math.sin(t * 13) * 1.4, CS_H / 2 + Math.sin(t * 17) * 1.2); ctx.scale(1.01, 1.01); ctx.translate(-CS_W / 2, -CS_H / 2);
    ilDusk(ctx, t); ilFilmSea(ctx, gy, t, u * 900, 0);
    const wx = csLerp(300, 470, close) + Math.sin(t * 0.8) * 20, wy = 250 + Math.sin(t * 1.3) * 8, ws = csLerp(0.42, 0.7, close);
    ctx.fillStyle = 'rgba(20,24,40,.25)'; ctx.beginPath(); ctx.ellipse(wx, gy + 26, 60 * ws, 7, 0, 0, TAU); ctx.fill();
    ctx.save(); ctx.translate(wx, wy); ctx.scale(-ws, ws); domeHeli(ctx, { x: 0, y: 0, s: 1, t: t, rot: 0.12, spin: 1, pal: IL_LAB_HELI }); ctx.restore();
    const tx = 860 + Math.sin(t * 0.9) * 24, ty = 336 + Math.sin(t * 1.7) * 10;
    for (let k = 0; k < 5; k++){ const a = (t * 2.2 + k / 5) % 1; ctx.strokeStyle = 'rgba(255,255,255,' + (0.5 * (1 - a)).toFixed(3) + ')'; ctx.lineWidth = 2.4; ctx.beginPath(); ctx.ellipse(tx + a * 90, gy + 74, 50 + a * 150, 7 + a * 14, 0, 0, TAU); ctx.stroke(); }
    ctx.save(); ctx.translate(tx, ty); ctx.scale(-1, 1); domeHeli(ctx, { x: 0, y: 0, s: 1.05, t: t, rot: 0.1, spin: 1, pilot: true }); ctx.restore();
    ctx.restore();
  } else if (t < T.C){                                                                        /* close on LAB-1: the cargo door slides, the drones come out */
    const u = t - T.B, door = csSm(0.4, 2, u), out = csSm(2.2, 6.6, u);
    ilDusk(ctx, t); ilFilmSea(ctx, 520, t, u * 700, 0);
    const hx = 640 + Math.sin(t * 0.7) * 16, hy = 290 + Math.sin(t * 1.2) * 6;
    ctx.save(); ctx.translate(hx, hy); ctx.scale(-1.5, 1.5); domeHeli(ctx, { x: 0, y: 0, s: 1, t: t, rot: 0.06, spin: 1, pal: IL_LAB_HELI, pilot: true }); ctx.restore();
    ctx.fillStyle = '#1A2024'; ctx.fillRect(hx - 30, hy - 30, 60 * door, 52); ctx.fillStyle = '#C8D0D4'; ctx.fillRect(hx - 30 + 60 * door, hy - 30, 6, 52);       /* the open cargo door, and its edge */
    for (let k = 0; k < 16; k++){ const f = csSm(k * 0.24, k * 0.24 + 2.4, out * 6.6); if (f <= 0) continue; const a = csR(k + 9100) * TAU, d = f * (220 + csR(k + 9200) * 420);
      skyFilmDrone(ctx, hx + Math.cos(a) * d * 1.4 + f * 120, hy + Math.sin(a) * d * 0.5 - f * 40, 1.3 + csR(k + 9300) * 0.9, t, k); }
  } else {                                                                                    /* inside the town helicopter: her at the open side door, the gun on its mount */
    const u = t - T.C, gy2 = 520, sc = u * 600;
    ilDusk(ctx, t); ilFilmSea(ctx, gy2, t, sc, 0);
    for (let k = 0; k < 8; k++) skyFilmDrone(ctx, 300 + k * 95 + Math.sin(t + k) * 30, 170 + (k % 3) * 70 + Math.sin(t * 2 + k) * 10, 1.1 + (k % 3) * 0.3, t, k);
    ctx.fillStyle = '#35543A'; ctx.fillRect(0, 0, 220, CS_H); ctx.fillRect(1060, 0, 220, CS_H); ctx.fillRect(0, 0, CS_W, 90); ctx.fillRect(0, 610, CS_W, 110);           /* the door frame */
    ctx.fillStyle = '#223A28'; ctx.fillRect(210, 90, 14, 520); ctx.fillRect(1056, 90, 14, 520); ctx.fillStyle = '#E8C24A'; ctx.fillRect(0, 600, CS_W, 10);
    csGiraffe(ctx, { x: 420, y: 600, s: 0.95, face: 1, walk: 0, moving: false, neck: csLerp(0.3, 0.75, csSm(0.5, 3, u)), head: 0.05, bare: true, boots: false });
    ctx.fillStyle = '#2A3034'; ctx.fillRect(560, 470, 16, 140); ctx.fillRect(520, 440, 220, 22); ctx.fillRect(730, 446, 60, 10);                   /* the door gun on its post */
    if (u > 4.2 && Math.sin(t * 40) > 0){ fillCircle(ctx, 800, 451, 16, 'rgba(255,230,160,.9)'); }
  }
}
function skyOutScene(ctx, t){
  const T = SKY_OUT_T, gy = 470;
  if (t < T.B){                                                                               /* LAB-1 hit: smoke, a spin, down onto the sea */
    const u = t, fall = csSm(1.4, 6, u), spin = u * (1 + fall * 5);
    ilDusk(ctx, t); ilFilmSea(ctx, gy, t, u * 300, 0);
    const hx = csLerp(520, 760, fall), hy = csLerp(220, gy + 10, fall * fall);
    for (let k = 0; k < 18; k++){ const a = (u * 0.8 + k / 18) % 1; ctx.globalAlpha = 0.5 * (1 - a); fillCircle(ctx, hx - 80 - a * 260 + Math.sin(k) * 20, hy - 30 - a * 120 * (1 - fall) + Math.cos(k) * 10, 14 + a * 34, '#3A3638'); }
    ctx.globalAlpha = 1;
    if (fall < 0.98){ ctx.save(); ctx.translate(hx, hy); ctx.scale(-1, 1); domeHeli(ctx, { x: 0, y: 0, s: 0.8, t: t, rot: Math.sin(spin) * 0.5 + fall * 0.4, spin: 1 - fall * 0.5, pal: IL_LAB_HELI }); ctx.restore(); fillCircle(ctx, hx + 30, hy - 30, 10 + Math.sin(t * 20) * 3, '#FF8A3A'); }
    const sp = csSm(5.6, 7, u); if (sp > 0){ for (let k = 0; k < 14; k++){ const a = k / 14 * Math.PI, d = sp * 160; fillCircle(ctx, 760 + Math.cos(a) * d * 1.6, gy + 10 - Math.sin(a) * d * (1 - sp * 0.6), 12 * (1 - sp * 0.5), 'rgba(235,250,255,' + (0.8 * (1 - sp * 0.7)).toFixed(3) + ')'); } }
    if (fall > 0.98) skyFilmFloat(ctx, 760, gy, t, function(){ ilFilmSea(ctx, gy, t, u * 300, 0); });
  } else if (t < T.C){                                                                        /* it floats; the town helicopter hovers; the coast guard comes */
    const u = t - T.B, come = csSm(3, 7, u);
    ilDusk(ctx, t); ilFilmSea(ctx, gy, t, u * 40, 0);
    skyFilmFloat(ctx, 560, gy, t, function(){ ilFilmSea(ctx, gy, t, u * 40, 0); });
    skyFilmBoat(ctx, csLerp(1600, 960, come), gy + 40, 0.75, t);
    const tx = 300 + Math.sin(t * 0.7) * 10, ty = 190 + Math.sin(t * 1.3) * 8;
    for (let k = 0; k < 5; k++){ const a = (t * 1.6 + k / 5) % 1; ctx.strokeStyle = 'rgba(255,255,255,' + (0.4 * (1 - a)).toFixed(3) + ')'; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(tx, gy + 30, 40 + a * 140, 6 + a * 12, 0, 0, TAU); ctx.stroke(); }
    ctx.save(); ctx.translate(tx, ty); domeHeli(ctx, { x: 0, y: 0, s: 0.75, t: t, rot: 0.02, spin: 1, pilot: true }); ctx.restore();
  } else if (t < T.D){                                                                        /* on the coast guard's deck: two scientists, a blanket each, a case of notes, and her looking down from the door */
    const u = t - T.C;
    ilDusk(ctx, t); ilFilmSea(ctx, 380, t, u * 30, 0);
    { const dg = ctx.createLinearGradient(0, 520, 0, CS_H); dg.addColorStop(0, '#C8C4BC'); dg.addColorStop(1, '#8A867E'); ctx.fillStyle = dg; ctx.fillRect(0, 520, CS_W, 200); } ctx.fillStyle = '#E8682A'; ctx.fillRect(0, 520, CS_W, 12); ctx.fillStyle = '#9A9EA2'; ctx.fillRect(0, 532, CS_W, 6);      /* the deck, in the evening light */
    ctx.strokeStyle = '#8A9298'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(0, 470); ctx.lineTo(CS_W, 470); for (let x = 40; x < CS_W; x += 120){ ctx.moveTo(x, 470); ctx.lineTo(x, 520); } ctx.stroke();
    const walk = csSm(0, 2.6, u);
    ilFilmScientist(ctx, csLerp(1100, 520, walk), 600, 1.0, walk < 1, t); ilFilmScientist(ctx, csLerp(1200, 660, walk), 606, 0.95, walk < 1, t + 1);
    if (walk >= 1) [[522, 600, 1], [662, 606, 0.95]].forEach(function(b){ const bx = b[0], by = b[1], k = b[2]; ctx.fillStyle = '#A84A32'; ctx.beginPath(); ctx.moveTo(bx - 16 * k, by - 96 * k); ctx.quadraticCurveTo(bx + 2 * k, by - 104 * k, bx + 20 * k, by - 96 * k); ctx.lineTo(bx + 30 * k, by - 30 * k); ctx.quadraticCurveTo(bx + 2 * k, by - 22 * k, bx - 26 * k, by - 30 * k); ctx.closePath(); ctx.fill(); ctx.strokeStyle = '#E8C070'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(bx - 24 * k, by - 40 * k); ctx.quadraticCurveTo(bx + 2 * k, by - 32 * k, bx + 28 * k, by - 40 * k); ctx.stroke(); });      /* a blanket round the shoulders of each */
    ctx.fillStyle = '#4A3A2A'; ctx.fillRect(780, 572, 60, 34); ctx.fillStyle = '#C8A870'; ctx.fillRect(800, 566, 20, 6);                   /* the case of notes */
    ctx.fillStyle = '#2A4A7A'; ctx.fillRect(900, 470, 40, 90); fillCircle(ctx, 920, 456, 16, '#E8C4A4'); ctx.fillStyle = '#E8682A'; ctx.fillRect(896, 500, 48, 30);  /* a coast guard in a life vest */
    const hx = 260, hy = 150 + Math.sin(t * 1.2) * 6; ctx.save(); ctx.translate(hx, hy); domeHeli(ctx, { x: 0, y: 0, s: 0.62, t: t, spin: 1, pilot: true }); ctx.restore();
  } else {                                                                                    /* east at sundown: the boat and the helicopter side by side */
    const u = t - T.D;
    ilDusk(ctx, t); ilFilmSea(ctx, gy, t, u * 260, 0);
    skyFilmBoat(ctx, 560 + u * 10, gy + 60, 0.6, t);
    for (let k = 0; k < 6; k++){ const a = (t * 0.8 + k / 6) % 1; ctx.strokeStyle = 'rgba(255,255,255,' + (0.35 * (1 - a)).toFixed(3) + ')'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(420 - a * 400, gy + 70 + k * 3); ctx.lineTo(500 - a * 400, gy + 70 + k * 3); ctx.stroke(); }
    const tx = 760 + u * 16, ty = 300 + Math.sin(t * 1.3) * 8; ctx.save(); ctx.translate(tx, ty); domeHeli(ctx, { x: 0, y: 0, s: 0.7, t: t, rot: 0.04, spin: 1, pilot: true }); ctx.restore();
  }
}
MARS_FILMS.skyin = {
  end: SKY_IN_T.END, starts: [0, SKY_IN_T.B, SKY_IN_T.C, 0, 0, 0, 0, 0], scene: skyInScene,
  over(ctx, t){
    const v = ctx.createRadialGradient(640, 360, 300, 640, 360, 780); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(10,8,20,.38)'); ctx.fillStyle = v; ctx.fillRect(0, 0, CS_W, CS_H);
    marsFilmCaps(ctx, SKY_IN_CAPS, t, '#FFD8A0');
    const f = marsFilmFade([SKY_IN_T.B, SKY_IN_T.C], SKY_IN_T.END, t); if (f > 0.005){ ctx.fillStyle = 'rgba(0,0,0,' + f + ')'; ctx.fillRect(0, 0, CS_W, CS_H); }
  },
  cues: [[0.4, () => SFX.click()], [4.4, () => SFX.whoosh()], [8.0, () => SFX.click()], [10.8, () => SFX.whoosh()], [14.8, () => SFX.click()], [18.2, () => SFX.whoosh()]]
};
MARS_FILMS.skyout = {
  end: SKY_OUT_T.END, starts: [0, SKY_OUT_T.B, SKY_OUT_T.C, SKY_OUT_T.D, 0, 0, 0, 0], scene: skyOutScene,
  over(ctx, t){
    const v = ctx.createRadialGradient(640, 360, 300, 640, 360, 780); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(10,8,20,.38)'); ctx.fillStyle = v; ctx.fillRect(0, 0, CS_W, CS_H);
    marsFilmCaps(ctx, SKY_OUT_CAPS, t, '#FFD8A0');
    const f = marsFilmFade([SKY_OUT_T.B, SKY_OUT_T.C, SKY_OUT_T.D], SKY_OUT_T.END, t); if (f > 0.005){ ctx.fillStyle = 'rgba(0,0,0,' + f + ')'; ctx.fillRect(0, 0, CS_W, CS_H); }
  },
  cues: [[0.4, () => SFX.click()], [4.2, () => SFX.whoosh()], [7.8, () => SFX.click()], [11.0, () => SFX.whoosh()], [15.0, () => SFX.click()], [18.6, () => SFX.whoosh()], [21.8, () => SFX.click()], [25.0, () => SFX.whoosh()]]
};
