'use strict';
/* =============================================================================================================================
   44zzzzk-sky-films.js  --  THE AIR CHASE FILMS (Chapter 17.5), in the same format as the Island's (MARS_FILMS: end, starts, scene, over, cues).
   The opening goes on from Chapter 17's last shot: low over the sea at sundown, LAB-1 ahead (the town mechanic flies the town helicopter, she is at its
   open side door); LAB-1's cargo door slides back on its rail and drones pour out; then inside the town helicopter's cabin, her at the open door with the
   gun the mechanic bolted to the floor. The ending: LAB-1, hit, its tail rotor gone, smoking and spinning down onto the sea; it floats tail up with its
   blades bent and two scientists in the water by the skid; the coast guard comes alongside and lowers its hook; on the deck the two sit wrapped in
   blankets with their case of notes; the boat and the town helicopter head east together. It closes the chase, nothing more.
   Every frame is a pure function of time. Everything that is fixed to something (a gun to its post, a strap to its ring, a hook to its cable) is drawn
   from the thing it hangs on.
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
/* a point of a helicopter drawn with domeHeli at (x, y), scale s, turn rot, mirrored when m is -1, in screen space */
function skyHeliPt(x, y, s, rot, m, lx, ly){ const c = Math.cos(rot), n = Math.sin(rot); return [x + m * s * (lx * c - ly * n), y + s * (lx * n + ly * c)]; }
/* the sun on the water: a column of short bright dashes under the sun that flicker */
function skyFilmGlitter(ctx, gy, t){
  for (let k = 0; k < 26; k++){ const f = k / 26, y = gy + 4 + f * f * 220, w = 10 + f * 46, x = 220 + (csR(k + 77100) - 0.5) * (30 + f * 120), a = 0.5 + 0.5 * Math.sin(t * 4 + k * 1.7);
    ctx.fillStyle = 'rgba(255,236,190,' + (a * (0.5 - f * 0.3)).toFixed(3) + ')'; ctx.fillRect(x - w / 2, y, w, 1.6 + f * 1.6); }
}
/* long thin clouds low over the sea, lit from below */
function skyFilmClouds(ctx, t, gy){
  for (let k = 0; k < 6; k++){ const y = gy - 60 - k * 34, x = ((csR(k + 77200) * 1600 - t * (8 + k * 3)) % 1700 + 1700) % 1700 - 200, w = 160 + csR(k + 77300) * 200;
    ctx.fillStyle = 'rgba(255,214,180,' + (0.16 - k * 0.015).toFixed(3) + ')'; ctx.beginPath(); ctx.ellipse(x, y, w, 7 + k, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = 'rgba(110,80,110,' + (0.12 - k * 0.012).toFixed(3) + ')'; ctx.beginPath(); ctx.ellipse(x + 20, y + 5, w * 0.8, 4, 0, 0, TAU); ctx.fill(); }
}
/* a drone in the side view: four arms out from a dark body, a motor pod and a blur of rotor on each, a camera eye and a red light */
function skyFilmDrone(ctx, x, y, s, t, k, o){
  o = o || {}; ctx.save(); ctx.translate(x, y + Math.sin(t * 5 + k) * 3 * s); ctx.rotate((o.tilt || 0) + Math.sin(t * 3 + k) * 0.06); ctx.scale(s, s);
  ctx.strokeStyle = '#2A3034'; ctx.lineWidth = 3; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-16, -9); ctx.lineTo(-6, -2); ctx.moveTo(16, -9); ctx.lineTo(6, -2); ctx.moveTo(-10, -8); ctx.lineTo(-3, -2); ctx.moveTo(10, -8); ctx.lineTo(3, -2); ctx.stroke(); ctx.lineCap = 'butt';
  [-16, 16].forEach(function(px){ fillRoundBox(ctx, px - 3, -13, 6, 5, 1.5, '#3A4248'); ctx.fillStyle = 'rgba(220,230,236,.34)'; ctx.beginPath(); ctx.ellipse(px, -13.5, 10, 1.8, 0, 0, TAU); ctx.fill();
    const b = Math.cos(t * 60 + px) * 10; ctx.strokeStyle = 'rgba(30,36,40,.7)'; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(px - b, -13.5); ctx.lineTo(px + b, -13.5); ctx.stroke(); });
  ctx.fillStyle = '#4A545C'; ctx.beginPath(); ctx.ellipse(0, 1, 11, 6, 0, 0, TAU); ctx.fill(); ctx.fillStyle = '#6A767E'; ctx.beginPath(); ctx.ellipse(-1, -1.5, 8, 2.6, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = '#2A3034'; ctx.fillRect(-6, 6, 2, 4); ctx.fillRect(4, 6, 2, 4); ctx.fillRect(-8, 9.4, 6, 1.4); ctx.fillRect(2, 9.4, 6, 1.4);               /* the little landing legs */
  fillCircle(ctx, 8, 2, 3, '#1A1E22'); fillCircle(ctx, 8.6, 1.6, 1.6, '#5AC8FF'); fillCircle(ctx, -9, -1, 1.6, Math.sin(t * 9 + k) > 0 ? '#FF4A3A' : '#6A2A24');
  if (o.hit){ ctx.globalAlpha = Math.min(1, o.hit); fillCircle(ctx, -2, -4, 6 + o.hit * 4, 'rgba(255,150,60,.85)'); ctx.globalAlpha = 1; }
  ctx.restore();
  if (o.hit){ for (let q = 0; q < 6; q++){ const a = (o.hit * 1.4 + q / 6) % 1; ctx.globalAlpha = 0.45 * (1 - a); fillCircle(ctx, x - a * 30 * s + Math.sin(q) * 4, y - 6 * s - a * 40 * s, (4 + a * 10) * s, '#3A3638'); } ctx.globalAlpha = 1; }
}
/* the town mechanic in the cockpit seat (drawn by domeHeli inside its glass): blue overalls, a red cap, a headset with a mic, a hand on the stick */
function skyMechanicSeat(ctx, t){
  ctx.fillStyle = '#2E4A7A'; ctx.beginPath(); ctx.ellipse(19, 12, 9, 14, 0.1, 0, TAU); ctx.fill();
  ctx.strokeStyle = '#2E4A7A'; ctx.lineWidth = 4.4; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(22, 6); ctx.lineTo(34, 14 + Math.sin(t * 3) * 0.8); ctx.stroke();
  fillCircle(ctx, 35, 14.5 + Math.sin(t * 3) * 0.8, 2.4, '#E0B890'); ctx.strokeStyle = '#2A2E30'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(35, 16); ctx.lineTo(33, 26); ctx.stroke();   /* the stick */
  fillCircle(ctx, 23, -6, 7.4, '#E0B890'); ctx.fillStyle = '#C8402A'; ctx.beginPath(); ctx.arc(23, -8, 7.6, Math.PI, TAU); ctx.fill(); ctx.fillRect(23, -9, 10, 2.4);
  ctx.strokeStyle = '#1A1E22'; ctx.lineWidth = 1.8; ctx.beginPath(); ctx.arc(22, -7, 8.2, Math.PI * 1.05, Math.PI * 1.95); ctx.stroke(); fillRoundBox(ctx, 17, -9, 5, 7, 2, '#1A1E22');
  ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(20, -3); ctx.quadraticCurveTo(24, 1, 29, -1); ctx.stroke(); fillCircle(ctx, 29, -1, 1.4, '#1A1E22'); ctx.lineCap = 'butt';
}
/* the town helicopter: the mechanic flying it, the side door slid back on its rail, her neck and head in the doorway, the gun barrel out over the sill */
function skyTownHeli(ctx, x, y, s, t, o){
  o = o || {}; const rot = o.rot || 0, m = o.flip ? -1 : 1;
  ctx.save(); ctx.translate(x, y); ctx.scale(m, 1);
  domeHeli(ctx, { x: 0, y: 0, s: s, t: t, rot: rot, spin: o.spin === undefined ? 1 : o.spin, seat: skyMechanicSeat });
  ctx.rotate(rot); ctx.scale(s, s);
  ctx.strokeStyle = '#162418'; ctx.lineWidth = 2.4; ctx.beginPath(); ctx.moveTo(-70, -21); ctx.lineTo(-2, -24); ctx.stroke();                                     /* the door rail */
  const door = () => { ctx.beginPath(); ctx.moveTo(-33, -16); ctx.lineTo(-5, -19); ctx.lineTo(-5, 31); ctx.quadraticCurveTo(-20, 33, -33, 28); ctx.closePath(); };
  ctx.fillStyle = '#16201A'; door(); ctx.fill();
  ctx.save(); door(); ctx.clip();
  ctx.fillStyle = '#26342A'; ctx.fillRect(-34, -20, 30, 18); csGlow(ctx, -20, -12, 16, '#FF7A4A', 0.35);                                                           /* the far wall and the red cabin light */
  csGiraffe(ctx, { x: -38, y: 44, s: 0.3, face: 1, walk: 0, moving: false, neck: 0.66 + Math.sin(t * 1.3) * 0.04, head: 0.12, bare: true, boots: false });
  ctx.fillStyle = '#3A443C'; ctx.fillRect(-34, 24, 30, 10);                                                                                                   /* the cabin floor at the sill */
  ctx.restore();
  ctx.strokeStyle = '#E8C24A'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-33, 28); ctx.quadraticCurveTo(-20, 33, -5, 31); ctx.stroke();                      /* the sill's yellow edge */
  ctx.save(); ctx.translate(-30, 0);                                                                                                                         /* the door panel, slid back toward the tail */
  ctx.fillStyle = '#2E4A32'; door(); ctx.fill(); ctx.strokeStyle = '#162418'; ctx.lineWidth = 2; ctx.stroke();
  ctx.fillStyle = '#5A7A86'; ctx.fillRect(-29, -13, 20, 14); ctx.fillStyle = 'rgba(255,255,255,.3)'; ctx.fillRect(-27, -12, 5, 12);
  fillCircle(ctx, -28, -19, 2, '#8A948C'); fillCircle(ctx, -10, -21, 2, '#8A948C'); ctx.restore();                                                             /* its rollers on the rail */
  if (o.gun !== false){ ctx.fillStyle = '#1A1E22'; ctx.save(); ctx.translate(-7, 8); ctx.rotate(-0.12); ctx.fillRect(-6, -3, 14, 6); ctx.fillRect(8, -1.6, 26, 3.2); ctx.fillRect(32, -2.4, 5, 4.8); ctx.restore(); }
  ctx.restore();
}
/* LAB-1, flying west (mirrored): its number on the tail, the cargo door (door 0 shut to 1 slid right back), fire and soot on the engine, or a wreck */
function skyLab(ctx, x, y, s, t, o){
  o = o || {}; const rot = o.rot || 0;
  ctx.save(); ctx.translate(x, y); ctx.scale(-1, 1);
  domeHeli(ctx, { x: 0, y: 0, s: s, t: t, rot: rot, spin: o.spin === undefined ? 1 : o.spin, pal: IL_LAB_HELI, tailGone: o.tailGone, wreck: o.wreck, light: o.wreck ? false : undefined,
    seat: function(c){ fillCircle(c, 22, -5, 7, '#E8C4A4'); c.fillStyle = '#C8C8C4'; c.beginPath(); c.arc(20, -8, 7.4, Math.PI * 0.9, Math.PI * 1.9); c.fill(); c.fillStyle = '#E8ECEE'; c.beginPath(); c.ellipse(18, 13, 9, 13, 0, 0, TAU); c.fill(); } });
  ctx.rotate(rot); ctx.scale(s, s);
  ctx.save(); ctx.translate(-153, -11); ctx.scale(-1, 1); ctx.fillStyle = '#26343A'; ctx.font = 'bold 9px system-ui, sans-serif'; ctx.textAlign = 'center'; ctx.fillText('LAB-1', 0, 3); ctx.restore();
  const door = () => { ctx.beginPath(); ctx.moveTo(-33, -16); ctx.lineTo(-5, -19); ctx.lineTo(-5, 31); ctx.quadraticCurveTo(-20, 33, -33, 28); ctx.closePath(); };
  if (o.door){
    ctx.strokeStyle = '#26343A'; ctx.lineWidth = 2.4; ctx.beginPath(); ctx.moveTo(-72, -21); ctx.lineTo(-2, -24); ctx.stroke();
    ctx.fillStyle = '#12181C'; door(); ctx.fill();
    ctx.save(); door(); ctx.clip();                                                                                                                         /* inside: the drone racks, their lights */
    ctx.fillStyle = '#20282E'; for (let r = 0; r < 3; r++) ctx.fillRect(-34, -12 + r * 14, 30, 3);
    for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++){ if (csR(r * 3 + c + 77400) < o.door * 0.9) continue; fillCircle(ctx, -28 + c * 9, -15 + r * 14, 3.4, '#4A545C'); fillCircle(ctx, -26 + c * 9, -15 + r * 14, 1, '#FF4A3A'); }
    csGlow(ctx, -18, 0, 18, '#7ADCFF', 0.18); ctx.restore();
    ctx.save(); ctx.translate(-30 * o.door, 0); ctx.fillStyle = '#DDE2E4'; door(); ctx.fill(); ctx.strokeStyle = '#26343A'; ctx.lineWidth = 2; ctx.stroke();
    ctx.fillStyle = '#6A8A96'; ctx.fillRect(-29, -13, 20, 14); ctx.fillStyle = '#2A8A7A'; ctx.fillRect(-31, 18, 24, 4); fillCircle(ctx, -28, -19, 2, '#8A949A'); fillCircle(ctx, -10, -21, 2, '#8A949A'); ctx.restore();
  }
  if (o.soot || o.wreck){ ctx.fillStyle = 'rgba(40,36,34,.55)'; ctx.beginPath(); ctx.ellipse(-14, -40, 22, 9, -0.2, 0, TAU); ctx.fill(); ctx.beginPath(); ctx.ellipse(-48, -30, 14, 6, 0.1, 0, TAU); ctx.fill(); }
  if (o.fire){ for (let k = 0; k < 5; k++){ const f = 0.6 + 0.4 * Math.sin(t * 22 + k * 1.9); ctx.fillStyle = k % 2 ? 'rgba(255,200,80,.9)' : 'rgba(255,110,40,.9)';
    ctx.beginPath(); ctx.moveTo(-36 + k * 9, -40); ctx.quadraticCurveTo(-40 + k * 9, -52 - 14 * f, -30 + k * 9 + Math.sin(t * 9 + k) * 3, -62 - 16 * f); ctx.quadraticCurveTo(-30 + k * 9, -50, -26 + k * 9, -40); ctx.closePath(); ctx.fill(); } }
  ctx.restore();
}
/* the coast guard boat, side on, heading right: a white hull in the water to its waterline (the sea is painted again over its bottom), an orange slash, a
   wheelhouse with a radar and a light bar, rails on their posts, life rings on the wall, and the davit crane at the stern with its cable and hook */
function skyFilmBoat(ctx, x, y, s, t, o){
  o = o || {}; const bob = Math.sin(t * 1.8) * 3 * s, roll = Math.sin(t * 1.3) * 0.012, hook = o.hook === undefined ? 0.3 : o.hook;
  ctx.save(); ctx.translate(x, y + bob); ctx.rotate(roll); ctx.scale(s, s);
  ctx.strokeStyle = '#8A9298'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-160, -58); ctx.lineTo(-64, -58); ctx.moveTo(64, -58); ctx.lineTo(150, -58); ctx.stroke();       /* the rails, on their posts */
  ctx.lineWidth = 2.4; ctx.beginPath(); for (let px = -156; px <= 150; px += 26){ if (px > -66 && px < 62) continue; ctx.moveTo(px, -58); ctx.lineTo(px, -30); } ctx.stroke();
  ctx.fillStyle = '#E8E8E2'; ctx.fillRect(-60, -96, 120, 66); ctx.fillStyle = '#D0D0CA'; ctx.fillRect(-60, -40, 120, 10);
  ctx.fillStyle = '#8AC8E8'; for (let k = 0; k < 4; k++) ctx.fillRect(-52 + k * 28, -86, 22, 18); ctx.fillStyle = 'rgba(255,255,255,.4)'; for (let k = 0; k < 4; k++) ctx.fillRect(-50 + k * 28, -85, 5, 16);
  ctx.strokeStyle = '#7A8288'; ctx.lineWidth = 1.6; for (let k = 0; k < 4; k++) ctx.strokeRect(-52 + k * 28, -86, 22, 18);
  [[-40, -52], [40, -52]].forEach(function(r){ ctx.strokeStyle = '#E8682A'; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(r[0], r[1], 8, 0, TAU); ctx.stroke(); ctx.strokeStyle = '#F4F4EE'; ctx.lineWidth = 2; for (let q = 0; q < 4; q++){ const a = q * Math.PI / 2 + 0.4; ctx.beginPath(); ctx.arc(r[0], r[1], 8, a, a + 0.35); ctx.stroke(); } });
  ctx.fillStyle = '#2A2E34'; ctx.fillRect(-40, -104, 80, 8); fillCircle(ctx, -24, -108, 5, Math.sin(t * 8) > 0 ? '#4A8AFF' : '#FF4A3A'); fillCircle(ctx, 24, -108, 5, Math.sin(t * 8) > 0 ? '#FF4A3A' : '#4A8AFF');
  ctx.fillStyle = '#5A6068'; ctx.fillRect(-4, -134, 6, 30); const rb = Math.cos(t * 3) * 22; ctx.fillRect(-1 - Math.abs(rb), -138, Math.abs(rb) * 2 + 2, 4);              /* the radar mast and its turning bar */
  ctx.strokeStyle = '#5A6068'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(40, -104); ctx.lineTo(48, -150); ctx.stroke();                                    /* the whip antenna */
  /* the davit crane at the stern: a post on a base, a boom, and the cable down to a hook that swings */
  ctx.fillStyle = '#5A6068'; ctx.fillRect(-140, -42, 20, 12); ctx.strokeStyle = '#5A6068'; ctx.lineWidth = 6; ctx.lineJoin = 'round'; ctx.beginPath(); ctx.moveTo(-130, -40); ctx.lineTo(-130, -112); ctx.lineTo(-196, -134); ctx.stroke(); ctx.lineJoin = 'miter';
  ctx.lineWidth = 2.4; ctx.beginPath(); ctx.moveTo(-130, -76); ctx.lineTo(-170, -125); ctx.stroke(); fillCircle(ctx, -196, -134, 5, '#3A4048'); fillCircle(ctx, -130, -112, 4, '#3A4048');
  const sw = Math.sin(t * 1.6) * 0.08, hl = 40 + hook * 120, hx = -196 + Math.sin(sw) * hl, hy = -134 + Math.cos(sw) * hl;
  ctx.strokeStyle = '#2A2E34'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(-196, -134); ctx.lineTo(hx, hy); ctx.stroke();
  fillRoundBox(ctx, hx - 4, hy - 2, 8, 8, 2, '#E8C24A'); ctx.strokeStyle = '#3A4048'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(hx, hy + 12, 5, -0.4, Math.PI); ctx.stroke();
  /* the hull */
  ctx.fillStyle = '#F4F4EE'; ctx.beginPath(); ctx.moveTo(-170, -30); ctx.lineTo(150, -30); ctx.lineTo(190, -56); ctx.lineTo(176, 10); ctx.quadraticCurveTo(10, 22, -150, 10); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#E8682A'; ctx.beginPath(); ctx.moveTo(60, -30); ctx.lineTo(90, -30); ctx.lineTo(40, 14); ctx.lineTo(10, 14); ctx.closePath(); ctx.fill(); ctx.fillStyle = '#2A4A7A'; ctx.beginPath(); ctx.moveTo(94, -30); ctx.lineTo(104, -30); ctx.lineTo(58, 14); ctx.lineTo(48, 14); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#C8C8C0'; ctx.fillRect(-168, -32, 340, 4); ctx.fillStyle = '#2A4A7A'; ctx.beginPath(); ctx.moveTo(-152, 4); ctx.lineTo(178, 4); ctx.lineTo(176, 10); ctx.quadraticCurveTo(10, 22, -150, 10); ctx.closePath(); ctx.fill();
  for (let k = 0; k < 5; k++){ fillCircle(ctx, -120 + k * 34, -14, 4.6, '#8A9298'); fillCircle(ctx, -120 + k * 34, -14, 3.2, '#3A5A7A'); }                                       /* portholes */
  ctx.fillStyle = '#2A4A7A'; ctx.font = 'bold 18px system-ui, sans-serif'; ctx.textAlign = 'center'; ctx.fillText('COAST GUARD', 126, -8);
  ctx.strokeStyle = '#8A9298'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(-160, -30); ctx.lineTo(-160, -62); ctx.stroke(); ctx.fillStyle = '#2A4A7A'; ctx.fillRect(-176, -62, 16, 10); ctx.fillStyle = '#E8682A'; ctx.fillRect(-176, -57, 16, 3);  /* the flag at the stern */
  if (o.crew) o.crew(ctx);
  ctx.restore();
  if (o.sea){ ctx.save(); ctx.beginPath(); ctx.rect(x - 210 * s, y + bob, 430 * s, 60 * s); ctx.clip(); o.sea(); ctx.restore();                                    /* the water over the hull below its waterline */
    ctx.strokeStyle = 'rgba(245,252,255,.8)'; ctx.lineWidth = 2.4; ctx.beginPath(); for (let px = -150; px <= 180; px += 12) ctx.lineTo(x + px * s, y + bob + Math.sin(t * 5 + px * 0.2) * 1.4); ctx.stroke();
    if (o.moving){ ctx.fillStyle = 'rgba(245,252,255,.75)'; ctx.beginPath(); ctx.moveTo(x + 172 * s, y + bob); ctx.quadraticCurveTo(x + 196 * s, y + bob - 10 * s, x + 220 * s, y + bob + 2 * s); ctx.quadraticCurveTo(x + 196 * s, y + bob + 4 * s, x + 172 * s, y + bob + 3 * s); ctx.fill(); } }
}
/* someone in the water: an orange life vest at the waterline, wet grey hair, round glasses, rings round them; an arm waving when wave is set */
function skyFilmSwimmer(ctx, x, y, t, k, wave){
  const b = Math.sin(t * 2 + k) * 2.4; y += b;
  for (let r = 0; r < 2; r++){ const a = (t * 0.9 + r * 0.5 + k * 0.3) % 1; ctx.strokeStyle = 'rgba(240,252,255,' + (0.6 * (1 - a)).toFixed(3) + ')'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.ellipse(x, y + 2, 16 + a * 22, 3 + a * 4, 0, 0, TAU); ctx.stroke(); }
  if (wave){ const w = Math.sin(t * 8 + k) * 0.4; ctx.strokeStyle = '#E8ECEE'; ctx.lineWidth = 5; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(x + 8, y - 4); ctx.lineTo(x + 14 + w * 8, y - 26); ctx.stroke(); ctx.lineCap = 'butt'; fillCircle(ctx, x + 14 + w * 8, y - 28, 3.4, '#E8C4A4'); }
  ctx.fillStyle = '#E8682A'; ctx.beginPath(); ctx.ellipse(x, y, 15, 6, 0, Math.PI, TAU); ctx.fill(); ctx.fillStyle = '#C8C8C0'; ctx.fillRect(x - 2, y - 6, 4, 6);
  fillCircle(ctx, x, y - 13, 9, '#E8C4A4'); ctx.fillStyle = '#A8A8A4'; ctx.beginPath(); ctx.arc(x - 2, y - 16, 9, Math.PI * 0.85, Math.PI * 1.95); ctx.fill();
  ctx.strokeStyle = '#2A2E34'; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.arc(x + 5, y - 13, 3, 0, TAU); ctx.stroke();
  ctx.strokeStyle = 'rgba(240,252,255,.9)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x - 17, y + 1); ctx.lineTo(x + 17, y + 1); ctx.stroke();
}
/* LAB-1 in the water: the cabin half under, the tail up, the blades bent, steam off the engine, rings, an oil sheen and bits of it floating */
function skyFilmFloat(ctx, x, gy, t, sea, o){
  o = o || {}; const fs = o.s || 0.62, k = fs / 0.62, fy = gy + (10 + Math.sin(t * 1.4) * 4) * k, fr = 0.42 + Math.sin(t * 1.1) * 0.05;          /* k: everything sized to the wreck, so a far one sits in the water too */
  ctx.save(); const sh = ctx.createRadialGradient(x - 40 * k, gy + 26 * k, 10 * k, x - 40 * k, gy + 26 * k, 150 * k); sh.addColorStop(0, 'rgba(255,170,220,.18)'); sh.addColorStop(0.5, 'rgba(140,230,200,.12)'); sh.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = sh; ctx.beginPath(); ctx.ellipse(x - 40 * k, gy + 26 * k, 170 * k, 16 * k, 0, 0, TAU); ctx.fill(); ctx.restore();                                /* the oil sheen */
  skyLab(ctx, x, fy, fs, t, { rot: fr, spin: 0, wreck: true });
  ctx.save(); ctx.beginPath(); ctx.rect(x - 260 * k, gy + 20 * k, 520 * k, 90); ctx.clip(); sea(); ctx.restore();                                        /* the sea again over its lower half, so the cabin is under the water */
  ctx.strokeStyle = 'rgba(245,252,255,.75)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x - 70 * k, gy + 20 * k); ctx.lineTo(x + 110 * k, gy + 20 * k); ctx.stroke();   /* the waterline foam along the hull */
  for (let r = 0; r < 4; r++){ const a = (t * 0.6 + r / 4) % 1; ctx.strokeStyle = 'rgba(235,250,255,' + (0.5 * (1 - a)).toFixed(3) + ')'; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(x, gy + 22 * k, (60 + a * 180) * k, (6 + a * 14) * k, 0, 0, TAU); ctx.stroke(); }
  const e = skyHeliPt(x, fy, fs, fr, -1, -14, -44);                                                                                                         /* steam off the hot engine */
  for (let q = 0; q < 8; q++){ const a = (t * 0.35 + q / 8) % 1; ctx.globalAlpha = 0.35 * (1 - a); fillCircle(ctx, e[0] + (Math.sin(q * 2 + t) * 10 + a * 40) * k, e[1] - a * 120 * k, (6 + a * 22) * k, '#D8D4D0'); }
  ctx.globalAlpha = 1;
  if (o.bits !== false){                                                                                                                                    /* a door panel, a seat cushion and loose sheets of notes, bobbing */
    const by = (k) => gy + 26 + Math.sin(t * 1.8 + k) * 3;
    ctx.save(); ctx.translate(x - 210, by(1)); ctx.rotate(0.05 + Math.sin(t + 1) * 0.04); ctx.fillStyle = '#DDE2E4'; ctx.fillRect(-26, -5, 52, 7); ctx.fillStyle = '#6A8A96'; ctx.fillRect(-16, -5, 18, 3); ctx.restore();
    ctx.save(); ctx.translate(x + 150, by(2)); ctx.rotate(-0.08); ctx.fillStyle = '#2A8A7A'; ctx.fillRect(-14, -6, 28, 8); ctx.restore();
    for (let k = 0; k < 6; k++){ ctx.save(); ctx.translate(x - 150 + k * 46 + Math.sin(t * 0.6 + k) * 8, by(k + 3) + 4); ctx.rotate(csR(k + 77500) - 0.5); ctx.fillStyle = 'rgba(248,248,240,.9)'; ctx.fillRect(-6, -2, 12, 4); ctx.restore(); }
  }
}
/* someone sitting, side on, facing right: wet coat, knees up, a blanket round the shoulders that falls to the seat, drips off the hair, a puddle */
function skyFilmSitter(ctx, x, y, s, t, k, o){
  o = o || {};
  ctx.fillStyle = 'rgba(70,90,110,.35)'; ctx.beginPath(); ctx.ellipse(x + 26 * s, y + 66 * s, 34 * s, 6 * s, 0, 0, TAU); ctx.fill();                                     /* the puddle on the deck */
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.strokeStyle = '#2A2E34'; ctx.lineWidth = 7; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(26, -2); ctx.lineTo(28, 60); ctx.stroke();               /* the legs: thigh along the seat, shin down to the deck */
  fillRoundBox(ctx, 24, 58, 14, 6, 2, '#1A1E22');                                                                                                           /* a shoe */
  ctx.fillStyle = '#D8DCDE'; ctx.beginPath(); ctx.moveTo(-10, -50); ctx.lineTo(10, -50); ctx.lineTo(24, -6); ctx.lineTo(22, 6); ctx.lineTo(-12, 6); ctx.closePath(); ctx.fill();     /* the wet coat, darker than it was */
  fillCircle(ctx, 8, -64, 12, '#E8C4A4'); ctx.fillStyle = '#9A9A96'; ctx.beginPath(); ctx.arc(5, -67, 12, Math.PI * 0.85, Math.PI * 1.95); ctx.fill();
  ctx.fillRect(-6, -66, 4, 10); ctx.strokeStyle = '#2A2E34'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.arc(15, -63, 4, 0, TAU); ctx.stroke(); ctx.beginPath(); ctx.moveTo(12, -54); ctx.quadraticCurveTo(15, -56, 18, -54); ctx.stroke();   /* hair, glasses, a frown */
  ctx.fillStyle = o.col || '#A84A32'; ctx.beginPath(); ctx.moveTo(-6, -58); ctx.quadraticCurveTo(6, -54, 18, -50); ctx.quadraticCurveTo(28, -30, 26, -4); ctx.lineTo(-16, 4); ctx.quadraticCurveTo(-20, -30, -6, -58); ctx.closePath(); ctx.fill();   /* the blanket */
  ctx.strokeStyle = 'rgba(0,0,0,.18)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(2, -52); ctx.quadraticCurveTo(4, -24, 0, 2); ctx.moveTo(12, -48); ctx.quadraticCurveTo(18, -24, 14, 0); ctx.stroke();      /* its folds */
  ctx.strokeStyle = '#E8C070'; ctx.lineWidth = 2.4; ctx.beginPath(); ctx.moveTo(-16, -2); ctx.lineTo(26, -8); ctx.stroke();
  if (o.mug){ fillCircle(ctx, 28, -22, 3.4, '#E8C4A4'); fillRoundBox(ctx, 28, -32, 10, 12, 2, '#F4F4EE'); ctx.strokeStyle = '#F4F4EE'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(39, -26, 3, -1.4, 1.4); ctx.stroke();
    for (let q = 0; q < 3; q++){ const a = (t * 0.7 + q / 3) % 1; ctx.strokeStyle = 'rgba(255,255,255,' + (0.5 * (1 - a)).toFixed(3) + ')'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(33 + Math.sin(a * 6 + q) * 3, -34 - a * 26); ctx.lineTo(33 + Math.sin(a * 6 + q + 1) * 3, -40 - a * 26); ctx.stroke(); } }
  ctx.lineCap = 'butt'; ctx.restore();
  for (let q = 0; q < 2; q++){ const a = (t * 1.2 + q * 0.5 + k * 0.3) % 1; fillCircle(ctx, x - 4 * s + q * 6 * s, y + (-56 + a * 116) * s, 1.8 * s, 'rgba(170,210,235,' + (0.8 * (1 - a * 0.6)).toFixed(3) + ')'); }   /* drips */
}
/* a coast guard, side on: boots, navy trousers, an orange life vest over a navy shirt, a cap, a clipboard */
function skyFilmCrew(ctx, x, y, s, t, face){
  ctx.save(); ctx.translate(x, y); ctx.scale(s * (face || 1), s);
  ctx.strokeStyle = '#1E2A44'; ctx.lineWidth = 9; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-4, -46); ctx.lineTo(-8, -4); ctx.moveTo(4, -46); ctx.lineTo(8, -4); ctx.stroke();
  fillRoundBox(ctx, -14, -6, 14, 8, 2, '#1A1E22'); fillRoundBox(ctx, 4, -6, 14, 8, 2, '#1A1E22');
  ctx.fillStyle = '#1E2A44'; ctx.beginPath(); ctx.moveTo(-14, -96); ctx.lineTo(14, -96); ctx.lineTo(13, -44); ctx.lineTo(-13, -44); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#E8682A'; ctx.beginPath(); ctx.moveTo(-15, -92); ctx.lineTo(15, -92); ctx.lineTo(16, -56); ctx.lineTo(-16, -56); ctx.closePath(); ctx.fill(); ctx.fillStyle = '#F4F4EE'; ctx.fillRect(-15, -74, 31, 4);
  ctx.strokeStyle = '#1E2A44'; ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(10, -88); ctx.lineTo(20, -66); ctx.lineTo(30, -72); ctx.stroke(); ctx.lineCap = 'butt';
  ctx.save(); ctx.translate(30, -76); ctx.rotate(-0.3); fillRoundBox(ctx, -2, -14, 16, 22, 2, '#8A6A44'); ctx.fillStyle = '#F4F4EE'; ctx.fillRect(1, -11, 10, 16); ctx.fillStyle = '#5A6068'; ctx.fillRect(3, -16, 6, 4); ctx.restore();
  fillCircle(ctx, 30, -72, 3.6, '#C89A74');
  ctx.fillStyle = '#C89A74'; ctx.fillRect(-4, -104, 8, 8); fillCircle(ctx, 2, -112, 11, '#C89A74');
  ctx.fillStyle = '#1E2A44'; ctx.beginPath(); ctx.arc(1, -115, 11.4, Math.PI, TAU); ctx.fill(); ctx.fillRect(1, -117, 16, 3.4); ctx.fillStyle = '#E8C24A'; ctx.fillRect(-2, -122, 5, 3);
  fillCircle(ctx, 8, -112, 1.4, '#1A1E22');
  ctx.restore();
}
/* inside the town helicopter's cabin, looking out of the open side door: the quilted walls, the ceiling rail and light, the bench and the straps, the
   pilot's seat and the mechanic at the front, the ribbed floor up to the sill, the gun on its post bolted to the floor, her in a harness clipped to the
   ceiling with a headset on, and the sea and the drones outside, banking */
function skyCabin(ctx, t, u){
  const X0 = 300, X1 = 1000, Y0 = 116, Y1 = 560, R = 46, fire = u > 4.2 && Math.sin(t * 3) > -0.2, shake = Math.sin(t * 31) * 1.2;
  const px = 760, py = 452, ga = -0.22 + Math.sin(t * 0.9) * 0.05, rk = fire && Math.sin(t * 40) > 0 ? -3 : 0;                                   /* the gun's post and aim, used for the tracer too */
  /* outside, banking a little */
  const bank = Math.sin(t * 0.6) * 0.04;
  ctx.save(); ctx.translate(640, 340); ctx.rotate(bank); ctx.scale(1.12, 1.12); ctx.translate(-640, -340);
  ilDusk(ctx, t); skyFilmClouds(ctx, t, 360); ilFilmSea(ctx, 360, t, u * 600, 0); skyFilmGlitter(ctx, 360, t);
  skyLab(ctx, 830, 230 + Math.sin(t * 0.8) * 6, 0.26, t, { rot: 0.08 });
  const D = [[420, 200, 1.3], [520, 290, 1.0], [610, 170, 1.5], [700, 300, 1.1], [790, 330, 0.9], [880, 180, 1.2], [480, 380, 0.8], [940, 270, 1.0]];
  const aim = D[(Math.floor(Math.max(0, u - 4.2) / 1.1)) % D.length];
  D.forEach(function(d, k){ const hit = u > 4.2 && d === aim ? csC(((u - 4.2) % 1.1) / 1.1, 0, 1) : 0;
    skyFilmDrone(ctx, d[0] + Math.sin(t + k) * 30, d[1] + Math.sin(t * 2 + k) * 10 + hit * hit * 60, d[2], t, k, { hit: hit > 0.45 ? (hit - 0.45) / 0.55 : 0, tilt: hit * 0.6 }); });
  for (let k = 0; k < 10; k++){ const a = (t * 2.4 + k / 10) % 1, y = 140 + csR(k + 77600) * 400; ctx.strokeStyle = 'rgba(255,255,255,' + (0.16 * (1 - a)).toFixed(3) + ')'; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(1040 - a * 800, y); ctx.lineTo(1000 - a * 800, y); ctx.stroke(); }   /* the wind past the door */
  const mx = px + Math.cos(ga) * 206 - 640, my = py - 6 + Math.sin(ga) * 206 - 340, mq = [640 + (mx * Math.cos(bank) + my * Math.sin(bank)) / 1.12, 340 + (-mx * Math.sin(bank) + my * Math.cos(bank)) / 1.12];   /* the muzzle, in the banked view */
  if (fire && Math.sin(t * 40) > 0){ ctx.strokeStyle = 'rgba(255,220,140,.8)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(mq[0], mq[1]); ctx.lineTo(aim[0] + Math.sin(t + D.indexOf(aim)) * 30, aim[1] + Math.sin(t * 2 + D.indexOf(aim)) * 10); ctx.stroke(); }   /* a tracer */
  ctx.restore();
  ctx.save(); ctx.translate(shake, shake * 0.6);
  /* the cabin walls, with the door cut through them */
  const open = () => { ctx.moveTo(X0 + R, Y0); ctx.lineTo(X1 - R, Y0); ctx.quadraticCurveTo(X1, Y0, X1, Y0 + R); ctx.lineTo(X1, Y1); ctx.lineTo(X0, Y1); ctx.lineTo(X0, Y0 + R); ctx.quadraticCurveTo(X0, Y0, X0 + R, Y0); ctx.closePath(); };
  { const wg = ctx.createLinearGradient(0, 0, 0, Y1); wg.addColorStop(0, '#1E2A22'); wg.addColorStop(1, '#2E3C32'); ctx.fillStyle = wg; }
  ctx.beginPath(); ctx.rect(-10, -10, CS_W + 20, Y1 + 10); open(); ctx.fill('evenodd');
  ctx.strokeStyle = '#3A4A3E'; ctx.lineWidth = 1.4;                                                                                                          /* the quilted padding, stitched in diamonds */
  [[20, 130, 260, 400], [1040, 130, 220, 140]].forEach(function(p){ fillRoundBox(ctx, p[0], p[1], p[2], p[3], 14, '#34443A');
    ctx.save(); ctx.beginPath(); ctx.rect(p[0], p[1], p[2], p[3]); ctx.clip(); ctx.beginPath(); for (let d = -p[3]; d < p[2] + p[3]; d += 34){ ctx.moveTo(p[0] + d, p[1]); ctx.lineTo(p[0] + d + p[3], p[1] + p[3]); ctx.moveTo(p[0] + d, p[1] + p[3]); ctx.lineTo(p[0] + d + p[3], p[1]); } ctx.stroke(); ctx.restore();
    for (let q = 0; q * 34 < p[2]; q++) fillCircle(ctx, p[0] + 17 + q * 34, p[1] + p[3] / 2, 1.6, '#4A5A4E'); });
  fillRoundBox(ctx, 0, 0, CS_W, 96, 0, '#1A241E'); ctx.fillStyle = '#26322A'; for (let q = 0; q < 9; q++) ctx.fillRect(40 + q * 140, 0, 8, 96);                            /* the ceiling and its ribs */
  ctx.strokeStyle = '#8A948C'; ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(60, 70); ctx.lineTo(1220, 70); ctx.stroke(); ctx.lineCap = 'butt';             /* the grab rail, on its brackets */
  ctx.fillStyle = '#5A645C'; for (let q = 0; q < 6; q++) ctx.fillRect(100 + q * 220, 56, 10, 18);
  ctx.strokeStyle = '#141A16'; ctx.lineWidth = 4; ctx.beginPath(); for (let q = 0; q < 5; q++){ const cx0 = 90 + q * 240; ctx.moveTo(cx0, 30); ctx.quadraticCurveTo(cx0 + 120, 52 + (q % 2) * 6, cx0 + 240, 30); } ctx.stroke();   /* cables looped from clip to clip */
  ctx.fillStyle = '#5A645C'; for (let q = 0; q < 6; q++) ctx.fillRect(86 + q * 240, 26, 8, 8);
  fillRoundBox(ctx, 620, 10, 50, 18, 6, '#3A2A24'); fillCircle(ctx, 645, 26, 10, '#FF6A4A'); csGlow(ctx, 645, 30, 260, '#FF7A4A', 0.16);                                      /* the red cabin light */
  /* the door frame: a thick edge, its rubber seal, rivets, and the rail the door slid back on */
  ctx.strokeStyle = '#4A5A4E'; ctx.lineWidth = 20; ctx.beginPath(); open(); ctx.stroke(); ctx.strokeStyle = '#141A16'; ctx.lineWidth = 4; ctx.beginPath(); open(); ctx.stroke();
  ctx.fillStyle = '#7A8A7E'; for (let q = 0; q < 12; q++){ fillCircle(ctx, X0 - 8, Y0 + 60 + q * 34, 2, '#7A8A7E'); fillCircle(ctx, X1 + 8, Y0 + 60 + q * 34, 2, '#7A8A7E'); }
  ctx.fillStyle = '#5A645C'; ctx.fillRect(X0 - 40, Y0 - 24, X1 - X0 + 80, 8); fillCircle(ctx, X0 - 20, Y0 - 20, 5, '#8A948C'); fillCircle(ctx, X0 + 6, Y0 - 20, 5, '#8A948C');
  ctx.fillStyle = '#2E4A32'; ctx.fillRect(X0 - 46, Y0 - 16, 30, Y1 - Y0 + 16); ctx.fillStyle = '#1A2A1E'; ctx.fillRect(X0 - 24, Y0 + 180, 6, 50);                    /* the door, slid back: its edge and handle */
  /* the left wall: the folding bench on its legs, the straps on the wall, a headset on a hook, the fire extinguisher in its bracket */
  ctx.fillStyle = '#5A645C'; ctx.fillRect(40, 470, 8, 120); ctx.fillRect(220, 470, 8, 120); fillRoundBox(ctx, 24, 456, 230, 20, 6, '#8A2A24');
  ctx.strokeStyle = '#A83A30'; ctx.lineWidth = 3; ctx.beginPath(); for (let q = 0; q < 6; q++){ ctx.moveTo(40 + q * 38, 456); ctx.lineTo(40 + q * 38, 476); } ctx.stroke();      /* its webbing */
  ctx.strokeStyle = '#7A6A4A'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(70, 160); ctx.lineTo(80, 450); ctx.moveTo(180, 160); ctx.lineTo(170, 450); ctx.stroke(); fillRoundBox(ctx, 64, 150, 22, 14, 3, '#8A948C'); fillRoundBox(ctx, 168, 150, 22, 14, 3, '#8A948C');
  fillRoundBox(ctx, 70, 300, 18, 14, 3, '#C8C8C0'); fillRoundBox(ctx, 162, 300, 18, 14, 3, '#C8C8C0');                                                                     /* buckles */
  ctx.strokeStyle = '#5A645C'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(122, 180); ctx.lineTo(122, 200); ctx.stroke(); ctx.strokeStyle = '#1A1E22'; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(122, 214, 16, Math.PI * 1.1, Math.PI * 1.9); ctx.stroke();
  fillRoundBox(ctx, 104, 210, 10, 16, 3, '#1A1E22'); fillRoundBox(ctx, 130, 210, 10, 16, 3, '#1A1E22');
  fillRoundBox(ctx, 236, 300, 26, 70, 10, '#C8302A'); fillRoundBox(ctx, 242, 290, 14, 12, 3, '#2A2E30'); ctx.fillStyle = '#E8E8E2'; ctx.fillRect(240, 324, 18, 14); ctx.fillStyle = '#5A645C'; ctx.fillRect(232, 330, 34, 4); ctx.fillRect(232, 356, 34, 4);
  /* the front: the back of the pilot's seat, the mechanic's head above it in his headset, the instrument glow, a placard */
  fillRoundBox(ctx, 1060, 300, 160, 270, 18, '#2A2E30'); fillRoundBox(ctx, 1080, 320, 120, 230, 12, '#3A4044'); ctx.fillStyle = '#5A645C'; ctx.fillRect(1090, 570, 10, 30); ctx.fillRect(1180, 570, 10, 30);
  csGlow(ctx, 1240, 300, 140, '#6AE0A0', 0.14);
  fillCircle(ctx, 1140, 262, 30, '#E0B890'); ctx.fillStyle = '#C8402A'; ctx.beginPath(); ctx.arc(1140, 254, 31, Math.PI, TAU); ctx.fill();
  ctx.strokeStyle = '#1A1E22'; ctx.lineWidth = 7; ctx.beginPath(); ctx.arc(1140, 258, 34, Math.PI * 1.02, Math.PI * 1.98); ctx.stroke(); fillRoundBox(ctx, 1100, 248, 14, 28, 6, '#1A1E22'); fillRoundBox(ctx, 1166, 248, 14, 28, 6, '#1A1E22');
  ctx.fillStyle = '#2E4A7A'; ctx.fillRect(1104, 288, 72, 14);                                                                                                  /* his collar, over the seat top */
  fillRoundBox(ctx, 1070, 180, 120, 40, 4, '#E8C24A'); ctx.fillStyle = '#1A1E22'; ctx.font = 'bold 15px system-ui, sans-serif'; ctx.textAlign = 'center'; ctx.fillText('MAX 4 + GUN', 1130, 206);
  ctx.restore();
  /* the floor, from the sill toward us: ribbed plates, tie-down rings, the sun lying across it from the door */
  ctx.save(); ctx.translate(shake, shake * 0.6);
  { const fg = ctx.createLinearGradient(0, Y1, 0, CS_H); fg.addColorStop(0, '#4A524A'); fg.addColorStop(1, '#2A302A'); ctx.fillStyle = fg; ctx.fillRect(-10, Y1, CS_W + 20, CS_H - Y1 + 10); }
  { const sg = ctx.createLinearGradient(0, Y1, 0, CS_H); sg.addColorStop(0, 'rgba(255,190,120,.32)'); sg.addColorStop(1, 'rgba(255,190,120,0)'); ctx.fillStyle = sg; ctx.beginPath(); ctx.moveTo(X0, Y1); ctx.lineTo(X1, Y1); ctx.lineTo(X1 + 120, CS_H); ctx.lineTo(X0 - 60, CS_H); ctx.closePath(); ctx.fill(); }
  ctx.strokeStyle = 'rgba(20,26,20,.55)'; ctx.lineWidth = 2; ctx.beginPath(); [586, 618, 658, 706].forEach(function(y){ ctx.moveTo(0, y); ctx.lineTo(CS_W, y); }); for (let q = -6; q <= 6; q++){ ctx.moveTo(640 + q * 110, Y1); ctx.lineTo(640 + q * 170, CS_H); } ctx.stroke();
  [[400, 600], [880, 600], [300, 680], [1000, 680], [640, 700]].forEach(function(p){ ctx.strokeStyle = '#8A948C'; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(p[0], p[1], 10, 4, 0, 0, TAU); ctx.stroke(); fillCircle(ctx, p[0], p[1], 2.4, '#1A1E1A'); });
  ctx.fillStyle = '#E8C24A'; ctx.fillRect(X0 - 10, Y1 - 4, X1 - X0 + 20, 14); ctx.fillStyle = '#1A1E1A'; for (let x = X0; x < X1; x += 32){ ctx.beginPath(); ctx.moveTo(x, Y1 + 10); ctx.lineTo(x + 14, Y1 - 4); ctx.lineTo(x + 26, Y1 - 4); ctx.lineTo(x + 12, Y1 + 10); ctx.closePath(); ctx.fill(); }   /* the sill, black and yellow */
  /* brass from the gun, rolling to rest on the floor */
  for (let k = 0; k < 28; k++){ const tk = 4.2 + k * 0.2; if (u < tk) break; const age = u - tk, lx = 830 + (csR(k + 77700) - 0.3) * 40, fy = 610 + csR(k + 77800) * 80, land = Math.sqrt((fy - 420) / 450);
    const ax = age < land ? 830 + (lx - 830) * age / land : lx + Math.min(age - land, 0.4) * 30 * (csR(k + 77900) - 0.5), ay = age < land ? 420 - 80 * age + 450 * age * age : fy;
    ctx.save(); ctx.translate(ax, ay); ctx.rotate(age < land ? age * 20 : csR(k) * 3); ctx.fillStyle = '#D8A840'; ctx.fillRect(-5, -2, 10, 4); ctx.fillStyle = '#8A6A2A'; ctx.fillRect(-5, -2, 2, 4); ctx.restore(); }
  /* her, in a harness clipped to the ceiling, with a headset */
  const gx = 520, gyF = 668, gs = 1.05, g = { x: gx, y: gyF, s: gs, face: 1, walk: 0, moving: false, neck: csLerp(0.3, 0.72, csSm(0.5, 3, u)), head: 0.08 + (fire ? Math.sin(t * 30) * 0.02 : 0), bare: true, boots: false };
  ctx.strokeStyle = '#E8C24A'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(560, 74); ctx.lineTo(gx + 20 * gs, gyF - 120 * gs); ctx.stroke(); fillRoundBox(ctx, 552, 64, 16, 14, 4, '#8A948C');      /* the strap, from a ring on the rail */
  csGiraffe(ctx, g);
  const geo = csGiraffeGeom(g), hx = gx + geo.hx * gs, hy = gyF + geo.hy * gs;
  ctx.strokeStyle = '#1A1E22'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(gx - 30 * gs, gyF - 128 * gs); ctx.lineTo(gx - 26 * gs, gyF - 96 * gs); ctx.moveTo(gx + 54 * gs, gyF - 126 * gs); ctx.lineTo(gx + 50 * gs, gyF - 94 * gs); ctx.stroke();      /* the harness round her body */
  ctx.strokeStyle = '#E8C24A'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(gx - 34 * gs, gyF - 120 * gs); ctx.lineTo(gx + 58 * gs, gyF - 118 * gs); ctx.stroke(); fillRoundBox(ctx, gx + 14 * gs, gyF - 126 * gs, 14, 12, 3, '#8A948C');
  ctx.strokeStyle = '#1A1E22'; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(hx - 2, hy - 6, 13, Math.PI * 1.1, Math.PI * 1.9); ctx.stroke(); fillRoundBox(ctx, hx - 8, hy - 6, 9, 13, 4, '#1A1E22');   /* the headset over her head */
  ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(hx - 4, hy + 6); ctx.quadraticCurveTo(hx + 6, hy + 14, hx + 14, hy + 10); ctx.stroke(); fillCircle(ctx, hx + 14, hy + 10, 2.6, '#1A1E22');
  /* the gun: a base plate bolted to the floor, braces, a post, a cradle, and the gun on it pointing out of the door; its ammo box and belt; spade grips at her head */
  ctx.fillStyle = '#3A4440'; ctx.beginPath(); ctx.ellipse(px, 652, 44, 12, 0, 0, TAU); ctx.fill(); ctx.fillStyle = '#5A645C'; ctx.beginPath(); ctx.ellipse(px, 648, 36, 9, 0, 0, TAU); ctx.fill();
  for (let q = 0; q < 4; q++) fillCircle(ctx, px - 28 + q * 19, 650 + (q % 2 ? 2 : -2), 2.6, '#9AA49C');                                                                     /* its bolts */
  ctx.strokeStyle = '#2A3034'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(px - 30, 648); ctx.lineTo(px - 4, 560); ctx.moveTo(px + 30, 648); ctx.lineTo(px + 4, 560); ctx.stroke();
  ctx.fillStyle = '#2A3034'; ctx.fillRect(px - 9, py, 18, 196); ctx.fillStyle = '#4A5458'; ctx.fillRect(px - 9, py, 5, 196); fillRoundBox(ctx, px - 16, py - 10, 32, 18, 5, '#1A1E22');
  ctx.save(); ctx.translate(px, py - 6); ctx.rotate(ga); ctx.translate(rk, 0);
  fillRoundBox(ctx, -70, -16, 110, 32, 5, '#2A3034'); ctx.fillStyle = '#3A4448'; ctx.fillRect(-66, -14, 100, 8); ctx.fillStyle = '#1A1E22'; ctx.fillRect(-40, -22, 44, 8);   /* the receiver and its top cover */
  ctx.fillStyle = '#1A1E22'; ctx.fillRect(40, -8, 120, 16); ctx.fillStyle = '#3A4448'; for (let q = 0; q < 8; q++) fillCircle(ctx, 50 + q * 13, 0, 3, '#0E1012');          /* the barrel shroud and its holes */
  ctx.fillStyle = '#1A1E22'; ctx.fillRect(158, -5, 30, 10); ctx.fillRect(186, -8, 12, 16);                                                                                /* the barrel and its flash hider */
  ctx.strokeStyle = '#1A1E22'; ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-70, -10); ctx.lineTo(-92, -18); ctx.moveTo(-70, 10); ctx.lineTo(-92, 14); ctx.stroke(); ctx.lineCap = 'butt';
  fillRoundBox(ctx, -98, -26, 12, 48, 4, '#5A3A24');                                                                                                         /* the spade grips */
  fillRoundBox(ctx, -36, 16, 50, 40, 4, '#4A5A3A'); ctx.fillStyle = '#E8E8E2'; ctx.font = 'bold 9px system-ui, sans-serif'; ctx.textAlign = 'center'; ctx.fillText('AMMO', -11, 40);  /* the ammo box under it */
  ctx.strokeStyle = '#B8902E'; ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(-28, 18); ctx.quadraticCurveTo(-34, 4, -20, -4); ctx.stroke(); ctx.strokeStyle = '#6A5420'; ctx.lineWidth = 1.4; ctx.beginPath(); for (let q = 0; q < 5; q++){ const a = q / 4; ctx.moveTo(-31 + a * 8 - 3, 16 - a * 18); ctx.lineTo(-31 + a * 8 + 3, 16 - a * 18); } ctx.stroke();
  if (fire && Math.sin(t * 40) > 0){ ctx.fillStyle = 'rgba(255,230,150,.95)'; ctx.beginPath(); for (let q = 0; q < 10; q++){ const a = q / 10 * TAU, r = q % 2 ? 10 : 30; ctx.lineTo(206 + Math.cos(a) * r, Math.sin(a) * r * 0.6); } ctx.closePath(); ctx.fill(); csGlow(ctx, 206, 0, 60, '#FFD890', 0.5); }
  ctx.restore();
  ctx.restore();
  const vg = ctx.createRadialGradient(640, 360, 380, 640, 360, 820); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(4,6,4,.45)'); ctx.fillStyle = vg; ctx.fillRect(0, 0, CS_W, CS_H);
}
function skyInScene(ctx, t){
  const T = SKY_IN_T, gy = 430;
  if (t < T.B){                                                                               /* the chase, as Chapter 17 left it, closing in */
    const u = t, close = csSm(1, 7, u);
    ctx.save(); ctx.translate(CS_W / 2 + Math.sin(t * 13) * 1.4, CS_H / 2 + Math.sin(t * 17) * 1.2); ctx.scale(1.01, 1.01); ctx.translate(-CS_W / 2, -CS_H / 2);
    ilDusk(ctx, t); skyFilmClouds(ctx, t, gy); ilFilmSea(ctx, gy, t, u * 900, 0); skyFilmGlitter(ctx, gy, t);
    const wx = csLerp(300, 470, close) + Math.sin(t * 0.8) * 20, wy = 250 + Math.sin(t * 1.3) * 8, ws = csLerp(0.42, 0.7, close);
    ctx.fillStyle = 'rgba(20,24,40,.25)'; ctx.beginPath(); ctx.ellipse(wx, gy + 26, 60 * ws, 7, 0, 0, TAU); ctx.fill();
    for (let k = 0; k < 4; k++){ const a = (t * 2.6 + k / 4) % 1; ctx.strokeStyle = 'rgba(255,255,255,' + (0.35 * (1 - a)).toFixed(3) + ')'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.ellipse(wx + a * 60, gy + 26, (40 + a * 90) * ws, (4 + a * 8) * ws, 0, 0, TAU); ctx.stroke(); }
    skyLab(ctx, wx, wy, ws, t, { rot: 0.12 });
    const tx = 860 + Math.sin(t * 0.9) * 24, ty = 336 + Math.sin(t * 1.7) * 10;
    for (let k = 0; k < 5; k++){ const a = (t * 2.2 + k / 5) % 1; ctx.strokeStyle = 'rgba(255,255,255,' + (0.5 * (1 - a)).toFixed(3) + ')'; ctx.lineWidth = 2.4; ctx.beginPath(); ctx.ellipse(tx + a * 90, gy + 74, 50 + a * 150, 7 + a * 14, 0, 0, TAU); ctx.stroke(); }
    for (let k = 0; k < 10; k++){ const a = (t * 1.6 + k / 10) % 1; fillCircle(ctx, tx + 40 + a * 160 + Math.sin(k * 3) * 30, gy + 70 - a * 20, 2 + a * 3, 'rgba(240,250,255,' + (0.5 * (1 - a)).toFixed(3) + ')'); }   /* spray off the downwash */
    skyTownHeli(ctx, tx, ty, 1.05, t, { flip: true, rot: 0.1 });
    ctx.restore();
  } else if (t < T.C){                                                                        /* close on LAB-1: the cargo door slides back on its rail, the drones come out of it */
    const u = t - T.B, door = csSm(0.4, 2, u), out = csSm(2.2, 6.6, u);
    ilDusk(ctx, t); skyFilmClouds(ctx, t, 520); ilFilmSea(ctx, 520, t, u * 700, 0); skyFilmGlitter(ctx, 520, t);
    const hx = 640 + Math.sin(t * 0.7) * 16, hy = 290 + Math.sin(t * 1.2) * 6, hr = 0.06, dp = skyHeliPt(hx, hy, 1.5, hr, -1, -19, 6);
    for (let k = 0; k < 6; k++){ const a = (t * 1.8 + k / 6) % 1; ctx.strokeStyle = 'rgba(255,255,255,' + (0.3 * (1 - a)).toFixed(3) + ')'; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(hx, 540, 80 + a * 260, 6 + a * 14, 0, 0, TAU); ctx.stroke(); }
    for (let k = 0; k < 16; k++){ const f = csSm(k * 0.24, k * 0.24 + 2.4, out * 6.6); if (f <= 0 || f >= 0.12) continue;                                                       /* the first moments of each: still in the doorway, behind the frame */
      skyFilmDrone(ctx, dp[0] + f * 60, dp[1] + f * 20, 1.3, t, k); }
    skyLab(ctx, hx, hy, 1.5, t, { rot: hr, door: door });
    for (let k = 0; k < 16; k++){ const f = csSm(k * 0.24, k * 0.24 + 2.4, out * 6.6); if (f < 0.12) continue; const a = csR(k + 9100) * TAU, d = (f - 0.12) * (240 + csR(k + 9200) * 460);
      skyFilmDrone(ctx, dp[0] + 7 + Math.cos(a) * d * 1.4 + f * 120, dp[1] + 2 + Math.sin(a) * d * 0.5 - f * 40, 1.3 + csR(k + 9300) * 0.9 * f, t, k); }
  } else {                                                                                    /* inside the town helicopter: her at the open side door, the gun on its post */
    skyCabin(ctx, t, t - T.C);
  }
}
function skyOutScene(ctx, t){
  const T = SKY_OUT_T, gy = 470;
  if (t < T.B){                                                                               /* LAB-1 hit: fire on the engine, smoke, the tail rotor gone, a spin, down onto the sea */
    const u = t, fall = csSm(1.4, 6, u), spin = u * (1 + fall * 5);
    ilDusk(ctx, t); skyFilmClouds(ctx, t, gy); ilFilmSea(ctx, gy, t, u * 300, 0); skyFilmGlitter(ctx, gy, t);
    const hx = csLerp(520, 760, fall), hy = csLerp(220, gy + 10, fall * fall), hr = Math.sin(spin) * 0.5 + fall * 0.4, e = skyHeliPt(hx, hy, 0.8, hr, -1, -20, -50);
    for (let k = 0; k < 18; k++){ const a = (u * 0.8 + k / 18) % 1, sx = csLerp(e[0], hx - 80, a * 0.2), sy = csLerp(e[1], hy - 30, a * 0.2); ctx.globalAlpha = 0.5 * (1 - a); fillCircle(ctx, sx - a * 260 + Math.sin(k) * 20 * a, sy - a * 120 * (1 - fall) + Math.cos(k) * 10 * a, 10 + a * 38, '#3A3638'); }
    ctx.globalAlpha = 1;
    if (fall < 0.98){ skyLab(ctx, hx, hy, 0.8, t, { rot: hr, spin: 1 - fall * 0.5, tailGone: true, fire: true, soot: true });
      const tp = skyHeliPt(hx, hy, 0.8, hr, -1, -198, -54); for (let k = 0; k < 6; k++){ const a = (t * 3 + k / 6) % 1; fillCircle(ctx, tp[0] + (csR(k + 78000) - 0.5) * 40 * a, tp[1] + a * 50, 2.2 * (1 - a) + 0.6, 'rgba(255,210,120,' + (1 - a).toFixed(3) + ')'); } }   /* sparks from the torn tail */
    const sp = csSm(5.6, 7, u); if (sp > 0){ for (let k = 0; k < 18; k++){ const a = k / 18 * Math.PI, d = sp * (140 + csR(k + 78100) * 60); fillCircle(ctx, 760 + Math.cos(a) * d * 1.6, gy + 10 - Math.sin(a) * d * (1 - sp * 0.6), 12 * (1 - sp * 0.5), 'rgba(235,250,255,' + (0.8 * (1 - sp * 0.7)).toFixed(3) + ')'); } }
    if (fall > 0.98) skyFilmFloat(ctx, 760, gy, t, function(){ ilFilmSea(ctx, gy, t, u * 300, 0); }, { bits: false });
  } else if (t < T.C){                                                                        /* it floats with the two in the water by it; the town helicopter hovers; the coast guard comes and lowers its hook */
    const u = t - T.B, come = csSm(3, 7, u), sea = function(){ ilFilmSea(ctx, gy, t, u * 40, 0); skyFilmGlitter(ctx, gy, t); };
    ilDusk(ctx, t); skyFilmClouds(ctx, t, gy); sea();
    skyFilmFloat(ctx, 560, gy, t, sea);
    skyFilmSwimmer(ctx, 660, gy + 34, t, 0, come > 0.5); skyFilmSwimmer(ctx, 700, gy + 42, t, 1, come > 0.7);
    const bx = csLerp(1600, 960, come);
    skyFilmBoat(ctx, bx, gy + 40, 0.75, t, { sea: sea, moving: come < 0.98, hook: csSm(5.8, 7.4, u), crew: function(c){ skyFilmCrew(c, 120, -30, 0.7, t, -1); } });
    const tx = 300 + Math.sin(t * 0.7) * 10, ty = 190 + Math.sin(t * 1.3) * 8;
    for (let k = 0; k < 5; k++){ const a = (t * 1.6 + k / 5) % 1; ctx.strokeStyle = 'rgba(255,255,255,' + (0.4 * (1 - a)).toFixed(3) + ')'; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(tx, gy + 30, 40 + a * 140, 6 + a * 12, 0, 0, TAU); ctx.stroke(); }
    skyTownHeli(ctx, tx, ty, 0.75, t, { rot: 0.02 });
  } else if (t < T.D){                                                                        /* on the coast guard's deck: they walk to the locker and sit, a blanket each, the case of notes, a coast guard writing it down */
    const u = t - T.C, hz = 380, sea = function(){ ilFilmSea(ctx, hz, t, u * 30, 0); };
    ilDusk(ctx, t); skyFilmClouds(ctx, t, hz); sea();
    skyFilmFloat(ctx, 760, hz, t, sea, { s: 0.22, bits: false });                                                                                            /* LAB-1 far off, tail up */
    skyTownHeli(ctx, 260, 150 + Math.sin(t * 1.2) * 6, 0.62, t, {});
    /* the boat's wheelhouse on the right, standing on the deck */
    ctx.fillStyle = '#E8E8E2'; ctx.fillRect(1010, 150, 280, 380); ctx.fillStyle = '#D0D0CA'; ctx.fillRect(1010, 150, 16, 380); ctx.fillStyle = '#2A2E34'; ctx.fillRect(1000, 138, 290, 14);
    fillRoundBox(ctx, 1060, 300, 110, 220, 8, '#D8D8D2'); ctx.strokeStyle = '#9A9EA2'; ctx.lineWidth = 3; ctx.strokeRect(1060, 300, 110, 220); fillCircle(ctx, 1115, 350, 24, '#8A9298'); fillCircle(ctx, 1115, 350, 18, '#5A8AA8'); ctx.fillStyle = 'rgba(255,255,255,.4)'; ctx.fillRect(1104, 338, 6, 18);
    fillRoundBox(ctx, 1150, 410, 12, 30, 3, '#8A9298');                                                                                                         /* the door handle */
    ctx.fillStyle = '#E8682A'; ctx.fillRect(1010, 250, 280, 20); ctx.fillStyle = '#2A4A7A'; ctx.fillRect(1010, 270, 280, 8);
    ctx.strokeStyle = '#E8682A'; ctx.lineWidth = 12; ctx.beginPath(); ctx.arc(1230, 400, 30, 0, TAU); ctx.stroke(); ctx.strokeStyle = '#F4F4EE'; ctx.lineWidth = 6; for (let q = 0; q < 4; q++){ const a = q * Math.PI / 2 + 0.4; ctx.beginPath(); ctx.arc(1230, 400, 30, a, a + 0.4); ctx.stroke(); }
    fillRoundBox(ctx, 1224, 360, 12, 10, 2, '#5A6068');                                                                                                         /* its hook on the wall */
    /* the deck and its rail */
    { const dg = ctx.createLinearGradient(0, 520, 0, CS_H); dg.addColorStop(0, '#B8B4AC'); dg.addColorStop(1, '#7A766E'); ctx.fillStyle = dg; ctx.fillRect(0, 520, CS_W, 200); }
    ctx.strokeStyle = 'rgba(60,60,56,.35)'; ctx.lineWidth = 2; ctx.beginPath(); [548, 584, 630, 690].forEach(function(y){ ctx.moveTo(0, y); ctx.lineTo(CS_W, y); }); ctx.stroke();      /* the deck plates */
    ctx.fillStyle = 'rgba(60,60,56,.4)'; for (let q = 0; q < 30; q++) fillCircle(ctx, (q * 97) % 1280, 556 + (q * 37) % 150, 1.6, 'rgba(60,60,56,.4)');
    ctx.fillStyle = '#E8682A'; ctx.fillRect(0, 520, 1010, 12); ctx.fillStyle = '#9A9EA2'; ctx.fillRect(0, 532, 1010, 6);
    ctx.strokeStyle = '#8A9298'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(0, 470); ctx.lineTo(1010, 470); ctx.moveTo(0, 494); ctx.lineTo(1010, 494); for (let x = 40; x < 1010; x += 120){ ctx.moveTo(x, 470); ctx.lineTo(x, 520); } ctx.stroke();
    ctx.strokeStyle = '#E8682A'; ctx.lineWidth = 9; ctx.beginPath(); ctx.arc(160, 488, 22, 0, TAU); ctx.stroke(); ctx.strokeStyle = '#F4F4EE'; ctx.lineWidth = 4; for (let q = 0; q < 4; q++){ const a = q * Math.PI / 2 + 0.4; ctx.beginPath(); ctx.arc(160, 488, 22, a, a + 0.4); ctx.stroke(); }   /* a life ring on the rail */
    fillRoundBox(ctx, 66, 560, 40, 30, 6, '#3A4048'); fillRoundBox(ctx, 74, 548, 24, 16, 4, '#5A6068');                                                                     /* a mooring bitt */
    ctx.strokeStyle = '#C8A870'; ctx.lineWidth = 5; for (let r = 0; r < 4; r++){ ctx.beginPath(); ctx.ellipse(220, 640, 40 - r * 8, 12 - r * 2, 0, 0, TAU); ctx.stroke(); }         /* a coil of rope */
    /* the locker they sit on */
    fillRoundBox(ctx, 420, 548, 360, 62, 6, '#5A6A78'); ctx.fillStyle = '#6A7A88'; ctx.fillRect(420, 548, 360, 10); ctx.fillStyle = '#E8E8E2'; ctx.font = 'bold 14px system-ui, sans-serif'; ctx.textAlign = 'center'; ctx.fillText('LIFE JACKETS', 600, 590);
    ctx.fillStyle = '#3A4650'; ctx.fillRect(430, 608, 20, 14); ctx.fillRect(750, 608, 20, 14);
    const walk = csSm(0, 2.6, u);
    if (walk < 1){ ilFilmScientist(ctx, csLerp(-60, 520, walk), 610, 1.0, true, t); ilFilmScientist(ctx, csLerp(-180, 660, walk), 612, 0.95, true, t + 1); }
    else { skyFilmSitter(ctx, 500, 552, 1.0, t, 0, { col: '#A84A32' }); skyFilmSitter(ctx, 650, 552, 0.96, t, 1, { col: '#4A6A8A', mug: u > 4.2 }); }
    /* the case of notes, dripping, with its strap and a stencil */
    ctx.fillStyle = 'rgba(70,90,110,.35)'; ctx.beginPath(); ctx.ellipse(850, 640, 50, 6, 0, 0, TAU); ctx.fill();
    fillRoundBox(ctx, 810, 590, 84, 50, 5, '#4A3A2A'); ctx.fillStyle = '#5A4A3A'; ctx.fillRect(810, 590, 84, 8); fillRoundBox(ctx, 838, 580, 28, 12, 4, '#2A2018'); ctx.fillStyle = '#C8A870'; ctx.fillRect(812, 610, 80, 5);
    fillCircle(ctx, 818, 603, 3, '#C8A870'); fillCircle(ctx, 886, 603, 3, '#C8A870'); ctx.fillStyle = '#E8E0C8'; ctx.font = 'bold 11px system-ui, sans-serif'; ctx.fillText('LAB-1 NOTES', 852, 632);
    skyFilmCrew(ctx, 950, 640, 1.0, t, -1);
  } else {                                                                                    /* east at sundown: the boat and the helicopter side by side, the coast ahead */
    const u = t - T.D, sea = function(){ ilFilmSea(ctx, gy, t, u * 260, 0); skyFilmGlitter(ctx, gy, t); };
    ilDusk(ctx, t); skyFilmClouds(ctx, t, gy);
    ctx.fillStyle = '#3A3050'; ctx.beginPath(); ctx.moveTo(880, gy); ctx.quadraticCurveTo(980, gy - 30, 1080, gy - 20); ctx.quadraticCurveTo(1180, gy - 44, 1300, gy - 26); ctx.lineTo(1300, gy); ctx.closePath(); ctx.fill();   /* the coast, far off */
    ctx.fillStyle = '#2A2440'; ctx.fillRect(1150, gy - 74, 10, 40); ctx.fillStyle = '#E8E0C8'; ctx.fillRect(1148, gy - 80, 14, 8); if (Math.sin(t * 2.2) > 0.3) csGlow(ctx, 1155, gy - 76, 40, '#FFF0B0', 0.6);   /* its lighthouse */
    for (let k = 0; k < 7; k++) fillCircle(ctx, 920 + k * 40, gy - 14 - (k % 3) * 4, 1.6, 'rgba(255,230,160,.8)');                                                       /* the lights of Longneck Town */
    sea();
    const bx = 560 + u * 10, by = gy + 60;
    for (let k = 0; k < 8; k++){ const a = (t * 0.8 + k / 8) % 1, sx = bx - 90 - a * 380, w = 10 + a * 60; ctx.strokeStyle = 'rgba(255,255,255,' + (0.5 * (1 - a)).toFixed(3) + ')'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(sx, by - 2 - w * 0.25); ctx.lineTo(sx - 30, by - 2 - w * 0.25 - 3); ctx.moveTo(sx, by + 4 + w * 0.25); ctx.lineTo(sx - 30, by + 4 + w * 0.25 + 3); ctx.stroke(); }   /* the wake, a V off the stern */
    skyFilmBoat(ctx, bx, by, 0.6, t, { sea: sea, moving: true, hook: 0 });
    for (let k = 0; k < 4; k++){ const gx = ((k * 260 + t * 30) % 1400) - 60, gyb = 200 + k * 40 + Math.sin(t * 2 + k) * 8, f = Math.sin(t * 6 + k) * 5; ctx.strokeStyle = '#2A2440'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(gx - 10, gyb - f); ctx.quadraticCurveTo(gx - 4, gyb - 4, gx, gyb); ctx.quadraticCurveTo(gx + 4, gyb - 4, gx + 10, gyb - f); ctx.stroke(); }   /* gulls */
    const tx = 760 + u * 16, ty = 300 + Math.sin(t * 1.3) * 8; skyTownHeli(ctx, tx, ty, 0.7, t, { rot: 0.04 });
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
