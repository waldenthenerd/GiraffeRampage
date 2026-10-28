'use strict';
/* The Venus film (end of chapter 8). */
/* ======================= THE VENUS FILM (Chapter 8 ending) ======================= */
/* The giraffe takes a Marine troop transport off the Moon. Marine fire clips an engine, the steering goes, and the
   course locks on Venus. She ejects in the clouds; the ship crashes in the distance; the pod lands on a burning
   world and she is stranded again. Like the first film, every frame is a pure function of time. */
const CV_T = { A: 0, B: 9.5, C: 17.5, D: 26, E: 33, F: 41, END: 53.5 };
const CV_CAPS = [
  [0.8, 'ESF LONGBOW', 'Marine troop transport. Nobody is guarding it.', 3.4],
  [4.6, 'BOARDING', '', 2.0],
  [7.4, 'HATCH SEALED', '', 1.6],
  [9.9, 'LIFTOFF', 'Stolen, and going up', 2.6],
  [13.4, 'HULL HIT', 'Marine fire clips the port engine', 3.2],
  [17.9, 'LEAVING THE MOON', '', 1.8],
  [20.0, 'STEERING DAMAGED', 'Course locked on Venus', 3.4],
  [23.6, 'FUEL CRITICAL', '', 2.0],
  [26.4, 'VENUS', 'Atmospheric entry', 2.8],
  [29.6, 'ENGINES FAILING', 'Hull temperature rising', 2.6],
  [32.2, 'EJECT', '', 0.9],
  [35.2, 'PARACHUTE DEPLOYED', '', 2.0],
  [37.3, 'IMPACT', 'The ship is lost', 2.6],
  [41.6, 'VENUS SURFACE', '464 \u00B0C \u00B7 92 atmospheres', 3.6]
];
/* ---- the marine transport, seen from the side, nose to the right ---- */
function cvLocal(o, lx, ly){ const s = o.s || 1, c = Math.cos(o.rot || 0), n = Math.sin(o.rot || 0); return [o.x + (lx * c - ly * n) * s, o.y + (lx * n + ly * c) * s]; }
function cvShip(ctx, o){
  const t = o.t || 0, S = o.s || 1, th = o.thrust || 0, dmg = o.dmg || 0;
  ctx.save(); ctx.translate(o.x, o.y); ctx.rotate(o.rot || 0); ctx.scale(S, S);
  if (th > 0.02) for (const [ex, bad] of [[-74, dmg > 0.55], [36, false]]){
    ctx.save(); ctx.translate(ex, 42); ctx.rotate((o.tilt || 0) * Math.PI / 2);
    const L = (bad ? (Math.sin(t * 23 + ex) > 0.25 ? 0.3 : 0.05) : 1) * th * 110; csFlame(ctx, 0, 0, L, 26, '', t, false); ctx.restore();
  }
  if ((o.legs || 0) > 0.02) for (const lx of [-100, -26, 62]){
    const l = o.legs; ctx.strokeStyle = '#8A93A8'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(lx, 22); ctx.lineTo(lx - 8 * l, 22 + 24 * l); ctx.stroke();
    ctx.fillStyle = '#B4B9C6'; ctx.fillRect(lx - 8 * l - 11, 22 + 24 * l - 2, 24, 5);
  }
  if ((o.ramp || 0) > 0.02){ const e = o.ramp; ctx.strokeStyle = '#4A5468'; ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(-126, 22); ctx.lineTo(-126 - 66 * e, 22 + 24 * e); ctx.stroke(); ctx.strokeStyle = '#FFB040'; ctx.lineWidth = 1.6; ctx.setLineDash([5, 5]); ctx.beginPath(); ctx.moveTo(-126, 22); ctx.lineTo(-126 - 66 * e, 22 + 24 * e); ctx.stroke(); ctx.setLineDash([]); }
  ctx.fillStyle = '#20283C'; ctx.fillRect(-98, 24, 46, 20); ctx.fillRect(14, 24, 46, 20);                      /* engine pods */
  ctx.fillStyle = '#3A4668'; ctx.fillRect(-98, 24, 46, 5); ctx.fillRect(14, 24, 46, 5);
  ctx.fillStyle = '#20304F'; ctx.beginPath(); ctx.moveTo(-70, -26); ctx.lineTo(-96, -60); ctx.lineTo(-58, -60); ctx.lineTo(-26, -28); ctx.closePath(); ctx.fill();   /* tail fin */
  ctx.fillStyle = '#FF8A2A'; ctx.beginPath(); ctx.moveTo(-92, -54); ctx.lineTo(-76, -54); ctx.lineTo(-84, -40); ctx.closePath(); ctx.fill();
  const hull = ctx.createLinearGradient(0, -30, 0, 32); hull.addColorStop(0, '#4A6DA6'); hull.addColorStop(0.55, '#3B5B92'); hull.addColorStop(1, '#22365C');
  ctx.fillStyle = hull; ctx.beginPath(); ctx.moveTo(140, 8); ctx.lineTo(100, -14); ctx.lineTo(40, -28); ctx.lineTo(-60, -30); ctx.lineTo(-120, -18); ctx.lineTo(-132, 6); ctx.lineTo(-100, 26); ctx.lineTo(30, 30); ctx.lineTo(112, 24); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = '#121C30'; ctx.lineWidth = 2; ctx.stroke();
  ctx.fillStyle = '#E8ECF2'; ctx.beginPath(); ctx.moveTo(100, -2); ctx.lineTo(36, -10); ctx.lineTo(-116, -6); ctx.lineTo(-118, 2); ctx.lineTo(34, 4); ctx.lineTo(104, 6); ctx.closePath(); ctx.fill();  /* the white stripe */
  ctx.fillStyle = '#FF8A2A'; ctx.fillRect(-48, -6, 26, 6);
  ctx.strokeStyle = 'rgba(10,18,36,.5)'; ctx.lineWidth = 1.2; ctx.beginPath(); for (const px of [-86, -40, 6, 52]){ ctx.moveTo(px, -24); ctx.lineTo(px, 24); } ctx.stroke();
  const cg = ctx.createLinearGradient(0, -14, 0, 4); cg.addColorStop(0, '#BFF4FF'); cg.addColorStop(1, '#4AA0D8');
  ctx.fillStyle = cg; ctx.beginPath(); ctx.moveTo(122, 4); ctx.lineTo(96, -14); ctx.lineTo(70, -15); ctx.lineTo(80, 4); ctx.closePath(); ctx.fill(); ctx.strokeStyle = '#121C30'; ctx.lineWidth = 1.6; ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,.6)'; ctx.beginPath(); ctx.moveTo(96, -11); ctx.lineTo(104, -2); ctx.lineTo(100, -2); ctx.lineTo(92, -11); ctx.closePath(); ctx.fill();
  csText(ctx, 'ESF-07', -30, 16, 11, '#E8ECF2', 'left', '800');
  if ((o.ramp || 0) > 0.05){ ctx.fillStyle = '#0E1420'; ctx.fillRect(-132, -12, 36, 34); ctx.fillStyle = 'rgba(255,190,80,' + (0.5 + 0.2 * Math.sin(t * 6)) + ')'; ctx.fillRect(-132, -12, 36, 4); ctx.fillStyle = '#FFB040'; ctx.fillRect(-130, 18, 32, 2); }
  if (dmg > 0){
    ctx.fillStyle = 'rgba(20,16,14,' + 0.55 * dmg + ')'; ctx.beginPath(); ctx.ellipse(-84, 18, 34, 12, 0, 0, TAU); ctx.fill();
    for (let k = 0; k < 9; k++){
      const age = (t * 1.1 + k / 9) % 1, px = -84 - age * 170, py = 30 + Math.sin(k * 3 + t) * 6 - age * 18;
      ctx.globalAlpha = 0.6 * (1 - age) * Math.min(1, dmg * 1.4); ctx.fillStyle = k % 3 ? '#3A3632' : '#6A645C'; ctx.beginPath(); ctx.arc(px, py, 10 + age * 26, 0, TAU); ctx.fill();
    }
    ctx.globalAlpha = 1; csGlow(ctx, -84, 30, 34, '#FF6A1E', 0.7 * dmg * (0.7 + 0.3 * Math.sin(t * 19)));
    if (Math.sin(t * 13) > 0.3) for (let k = 0; k < 3; k++){ const a = csR(Math.floor(t * 13) + k) * TAU; ctx.strokeStyle = '#FFE08A'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-84, 30); ctx.lineTo(-84 + Math.cos(a) * 26, 30 + Math.sin(a) * 26); ctx.stroke(); }
  }
  ctx.restore();
}
/* ---- a distant marine, running or firing ---- */
function cvMarine(ctx, x, y, s, ph, fire){
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.strokeStyle = '#162238'; ctx.lineWidth = 4; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(0, -10); ctx.lineTo(Math.sin(ph) * 7, 0); ctx.moveTo(0, -10); ctx.lineTo(-Math.sin(ph) * 7, 0); ctx.stroke(); ctx.lineCap = 'butt';
  ctx.fillStyle = '#3B5B92'; ctx.fillRect(-5, -26, 10, 17); ctx.fillStyle = '#E8ECF2'; ctx.fillRect(-5, -20, 10, 3);
  fillCircle(ctx, 0, -31, 5.4, '#3B5B92'); ctx.fillStyle = '#7FD8FF'; ctx.fillRect(1, -33, 5, 4);
  ctx.strokeStyle = '#20242E'; ctx.lineWidth = 2.6; ctx.beginPath(); ctx.moveTo(2, -19); ctx.lineTo(fire ? 16 : 12, fire ? -24 : -16); ctx.stroke();
  ctx.restore();
}
/* ---- Venus ---- */
function cvVenus(ctx, cx, cy, r, t){
  csGlow(ctx, cx, cy, r * 1.5, '#FFD98A', 0.32);
  const g = ctx.createRadialGradient(cx - r * 0.35, cy - r * 0.35, r * 0.1, cx, cy, r);
  g.addColorStop(0, '#FFF6D0'); g.addColorStop(0.55, '#EBC878'); g.addColorStop(1, '#A8702C');
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, r, 0, TAU); ctx.fill();
  ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, r, 0, TAU); ctx.clip();
  for (let k = 0; k < 9; k++){
    const yy = cy - r + (k + 0.5) * r * 2 / 9, sh = Math.sin(t * 0.05 + k * 1.7) * r * 0.05;
    ctx.strokeStyle = k % 2 ? 'rgba(150,96,36,.3)' : 'rgba(255,240,190,.3)'; ctx.lineWidth = r * 0.07;
    ctx.beginPath(); ctx.moveTo(cx - r, yy + sh); ctx.quadraticCurveTo(cx - r * 0.3, yy - r * 0.12 + sh, cx + r * 0.2, yy + r * 0.05 + sh); ctx.quadraticCurveTo(cx + r * 0.6, yy + r * 0.12, cx + r, yy - r * 0.04); ctx.stroke();
  }
  const sh = ctx.createRadialGradient(cx + r * 0.5, cy + r * 0.3, r * 0.5, cx + r * 0.5, cy + r * 0.3, r * 1.5); sh.addColorStop(0, 'rgba(20,8,0,0)'); sh.addColorStop(1, 'rgba(20,8,0,.6)');
  ctx.fillStyle = sh; ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
  ctx.restore();
}
function cvChute(ctx, x, y, s, open, sway){
  if (open <= 0.02) return;
  ctx.save(); ctx.translate(x, y); ctx.rotate(sway * 0.12); ctx.scale(s, s);
  const W = 120 * open, H = 66 * (0.5 + 0.5 * open), top = -150 * (0.6 + 0.4 * open);
  ctx.strokeStyle = 'rgba(240,230,210,.8)'; ctx.lineWidth = 1.4;
  ctx.beginPath(); for (const fx of [-1, -0.5, 0.5, 1]){ ctx.moveTo(0, 0); ctx.lineTo(fx * W * 0.92, top + H * 0.4); } ctx.stroke();
  ctx.fillStyle = '#F2EDE2'; ctx.beginPath(); ctx.moveTo(-W, top + H * 0.4); ctx.quadraticCurveTo(-W * 0.85, top - H * 0.5, 0, top - H * 0.55); ctx.quadraticCurveTo(W * 0.85, top - H * 0.5, W, top + H * 0.4); ctx.quadraticCurveTo(W * 0.5, top + H * 0.15, 0, top + H * 0.4); ctx.quadraticCurveTo(-W * 0.5, top + H * 0.15, -W, top + H * 0.4); ctx.fill();
  ctx.fillStyle = '#FF7A2A'; for (const [a, b] of [[-0.66, -0.33], [0, 0.33]]){ ctx.beginPath(); ctx.moveTo(a * W, top + H * 0.37); ctx.quadraticCurveTo(a * W * 0.9, top - H * 0.35, (a + b) / 2 * W * 0.9, top - H * 0.5); ctx.lineTo(b * W * 0.9, top - H * 0.35); ctx.quadraticCurveTo(b * W, top + H * 0.1, b * W, top + H * 0.37); ctx.closePath(); ctx.fill(); }
  ctx.restore();
}
/* the ejection pod: a capsule with a window, and the giraffe inside */
function cvPod(ctx, x, y, s, rot, flame, t, door){
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  if (flame > 0.02) csFlame(ctx, 0, 24, 60 * flame, 22, '', t, false);
  ctx.fillStyle = '#8A93A8'; ctx.beginPath(); ctx.moveTo(-22, 24); ctx.lineTo(-28, -2); ctx.quadraticCurveTo(-24, -34, 0, -40); ctx.quadraticCurveTo(24, -34, 28, -2); ctx.lineTo(22, 24); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = '#3A4458'; ctx.lineWidth = 2; ctx.stroke(); ctx.fillStyle = '#FF8A2A'; ctx.fillRect(-25, 8, 50, 6);
  if (!door){ ctx.fillStyle = '#BFF4FF'; ctx.beginPath(); ctx.arc(0, -12, 13, 0, TAU); ctx.fill(); ctx.strokeStyle = '#3A4458'; ctx.lineWidth = 2.4; ctx.stroke();
    ctx.fillStyle = (typeof giraffeCustom === 'function' && giraffeCustom() || { coat: '#D6A44F' }).coat; ctx.beginPath(); ctx.ellipse(1, -10, 8, 7, 0, 0, TAU); ctx.fill(); ctx.strokeStyle = '#8A5A24'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-3, -16); ctx.lineTo(-4, -22); ctx.moveTo(4, -16); ctx.lineTo(5, -22); ctx.stroke(); fillCircle(ctx, 4, -11, 1.6, '#1A1008'); }
  else { ctx.fillStyle = '#0E1420'; ctx.beginPath(); ctx.ellipse(0, -10, 12, 16, 0, 0, TAU); ctx.fill(); }
  ctx.restore();
}
/* ---- skies and grounds ---- */
function cvOrangeSky(ctx, t, top, mid, bot, bands){
  const g = ctx.createLinearGradient(0, 0, 0, CS_H); g.addColorStop(0, top); g.addColorStop(0.55, mid); g.addColorStop(1, bot);
  ctx.fillStyle = g; ctx.fillRect(0, 0, CS_W, CS_H);
  for (let k = 0; k < bands; k++){ const yy = (csR(k + 7000) * CS_H * 1.4 - t * (8 + csR(k + 7100) * 14)) % (CS_H * 1.2); ctx.fillStyle = 'rgba(255,220,150,' + (0.05 + csR(k + 7200) * 0.08) + ')'; ctx.beginPath(); ctx.ellipse(csR(k + 7300) * CS_W, yy < 0 ? yy + CS_H * 1.2 : yy, 300 + csR(k + 7400) * 400, 14 + csR(k + 7500) * 30, 0, 0, TAU); ctx.fill(); }
}
function cvGround(ctx, hy, t, camx){
  const g = ctx.createLinearGradient(0, hy, 0, CS_H + 400); g.addColorStop(0, '#6A4A32'); g.addColorStop(0.15, '#3E2C24'); g.addColorStop(1, '#1C1412');
  ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(-50, hy);
  for (let x = -50; x <= CS_W + 50; x += 30) ctx.lineTo(x, hy - 4 - 10 * Math.abs(Math.sin((x + camx) * 0.012 + 1)) - 6 * Math.sin((x + camx) * 0.04));
  ctx.lineTo(CS_W + 50, CS_H + 600); ctx.lineTo(-50, CS_H + 600); ctx.closePath(); ctx.fill();
  ctx.lineCap = 'round';
  for (let k = 0; k < 22; k++){                                                         /* lava running through cracks in the basalt */
    const x0 = ((csR(k + 7600) * 1700 - camx * (0.5 + (k % 4) * 0.3)) % 1500 + 1500) % 1500 - 120, y0 = hy + 12 + csR(k + 7700) * 520, L = 60 + csR(k + 7800) * 180, yy = (y0 - hy) / 520, f = 0.6 + 0.4 * Math.sin(t * 1.6 + k);
    ctx.strokeStyle = 'rgba(255,120,30,' + (0.25 + 0.35 * f) * (0.35 + yy) + ')'; ctx.lineWidth = 1.5 + yy * 5;
    ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x0 + L * 0.4, y0 + 8 * Math.sin(k)); ctx.lineTo(x0 + L, y0 - 6 + 12 * csR(k + 7900)); ctx.stroke();
    ctx.strokeStyle = 'rgba(255,220,120,' + 0.3 * f * (0.35 + yy) + ')'; ctx.lineWidth = Math.max(1, yy * 2); ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x0 + L * 0.4, y0 + 8 * Math.sin(k)); ctx.lineTo(x0 + L, y0 - 6 + 12 * csR(k + 7900)); ctx.stroke();
  }
  ctx.lineCap = 'butt';
  for (let k = 0; k < 16; k++){ const x = ((csR(k + 8000) * 1600 - camx * 1.2) % 1500 + 1500) % 1500 - 100, y = hy + 30 + csR(k + 8100) * 500, r = 8 + csR(k + 8200) * 26 * ((y - hy) / 500 + 0.3);
    ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.beginPath(); ctx.ellipse(x + r * 0.4, y + r * 0.3, r * 1.2, r * 0.45, 0, 0, TAU); ctx.fill(); ctx.fillStyle = '#4A362C'; ctx.beginPath(); ctx.ellipse(x, y - r * 0.2, r, r * 0.65, 0, 0, TAU); ctx.fill(); ctx.fillStyle = '#7A5A46'; ctx.beginPath(); ctx.ellipse(x - r * 0.25, y - r * 0.4, r * 0.5, r * 0.25, 0, 0, TAU); ctx.fill(); }
}
function cvVolcano(ctx, x, hy, s, t){
  ctx.fillStyle = '#5A3A2A'; ctx.beginPath(); ctx.moveTo(x - 210 * s, hy); ctx.lineTo(x - 26 * s, hy - 130 * s); ctx.lineTo(x + 26 * s, hy - 130 * s); ctx.lineTo(x + 210 * s, hy); ctx.closePath(); ctx.fill();
  csGlow(ctx, x, hy - 132 * s, 90 * s, '#FF7A1E', 0.75 + 0.15 * Math.sin(t * 2));
  ctx.fillStyle = '#FFB040'; ctx.beginPath(); ctx.ellipse(x, hy - 130 * s, 26 * s, 5 * s, 0, 0, TAU); ctx.fill();
  for (let k = 0; k < 6; k++){ const a = (t * 0.25 + k / 6) % 1; ctx.globalAlpha = 0.4 * (1 - a); ctx.fillStyle = '#3A2A24'; ctx.beginPath(); ctx.arc(x + Math.sin(k * 2 + t) * 20 * s * a, hy - 132 * s - a * 190 * s, (16 + a * 50) * s, 0, TAU); ctx.fill(); }
  ctx.globalAlpha = 1;
}
/* ============ SCENE A: the Moon, the transport, the boarding (0 - 9.5 s) ============ */
const CV_SX = 820, CV_S = 1.9, CV_GY = 600, CV_SY = 600 - 46 * 1.9;
function cvSceneA(ctx, u, t){
  csNow = t;
  csSurfaceSky(ctx, t); csMoonGround(ctx, 3, 0);
  for (let k = 0; k < 4; k++){ const x = 1000 + k * 70 + 230 * csSm(0, 9, u) * (0.8 + 0.12 * k) + (u < 0.2 ? 0 : 0); if (x < 1320) cvMarine(ctx, x, 470 + k * 6, 0.55, u * 9 + k, false); }      /* the survivors, falling back */
  const ramp = csSm(2.0, 3.2, u) * (1 - csSm(6.6, 7.8, u)), ship = { x: CV_SX, y: CV_SY, s: CV_S, rot: 0, ramp: ramp, legs: 1, thrust: csSm(8.2, 9.2, u) * 0.25, tilt: 0, t: t };
  cvShip(ctx, ship);
  const rx = CV_SX - 126 * CV_S, rb = CV_SX - 192 * CV_S;                                  /* where the ramp meets the floor, and where it meets the bay */
  let gx, gy, walk = 0, moving = true;
  if (u < 3.4){ gx = -100 + (rb + 100) * csSm(0.2, 3.4, u); gy = CV_GY; walk = u * 5.2; }
  else if (u < 5.2){ const p = csSm(3.4, 5.2, u); gx = csLerp(rb, rx, p); gy = csLerp(CV_GY, CV_SY + 22 * CV_S, p); walk = u * 4.4; }
  else { gx = csLerp(rx, CV_SX - 90 * CV_S, csSm(5.2, 6.6, u)); gy = CV_SY + 22 * CV_S; walk = u * 4.4; }
  ctx.save(); ctx.beginPath(); ctx.rect(-400, 0, CV_SX - 100 * CV_S + 400, CS_H); ctx.clip();
  const gc = { x: gx, y: gy - Math.abs(Math.sin(walk)) * 2, s: 0.42, face: 1, neck: 0.3, head: 0.1, walk: walk, moving: moving, blink: 0, look: 0, tuck: 0, crouch: 0 };
  if (u < 6.9) csGiraffe(ctx, gc);
  ctx.restore();
  if (u > 8.2) csGlow(ctx, CV_SX - 74 * CV_S, CV_SY + 42 * CV_S, 60, '#FFB050', 0.5 * csSm(8.2, 9.4, u));
}
/* In the lift-off scene the camera climbs slowly enough that the pad stays in view while the Marines fire. They stand on the ground, so they
   slide DOWN the screen with it as the camera rises (they never move up with the ship). Everything on the ground uses one projection. */
function cvCamH(u){ const up = csSm(1.6, 8, u); return 3 + 5.8 * up * up; }
const CV_MARINES = [200, 290, 380].map((x0, k) => { const gz = 3 * CS_F / (478 + k * 6 - CS_HZ); return { gz: gz, gx: (x0 - 640) * gz / CS_F }; });
function cvMarinePos(k, u){ const m = CV_MARINES[k]; return { x: 640 + m.gx * CS_F / m.gz, y: CS_HZ + cvCamH(u) * CS_F / m.gz, s: 0.85 }; }
function cvGroundY(u){ return CS_HZ + cvCamH(u) * CS_F / (3 * CS_F / 170); }             /* the ground at the ship's feet (it starts at y = 600) */
/* ============ SCENE B: liftoff, and the marines get a shot in (9.5 - 17.5 s) ============ */
function cvSceneB(ctx, u, t){
  csNow = t;
  const up = csSm(1.6, 8, u), alt = up * up * 620 + csSm(1.6, 4, u) * 30;
  csSurfaceSky(ctx, t); csMoonGround(ctx, cvCamH(u), 0);
  csLandingDust(ctx, Math.max(0, u - 1.0) * 0.9, CV_SX, cvGroundY(u));
  const thrust = 0.25 + 0.75 * csSm(0.8, 1.8, u), tilt = csSm(3.6, 7, u), lift = Math.min(alt * 0.7, 190);
  for (let k = 0; k < 3; k++){ const mp = cvMarinePos(k, u); if (u > 1.2 && mp.y < 760) cvMarine(ctx, mp.x, mp.y, mp.s, 0, true); }        /* the last marines at the pad, firing up: on the ground, so they slide down with it */
  const sx = CV_SX + 160 * csSm(3.6, 8, u), sy = CV_SY - lift, rot = -0.22 * tilt, ship = { x: sx, y: sy, s: CV_S * (1 - 0.28 * csSm(3, 8, u)), rot: rot, ramp: 0, legs: 1 - csSm(2.8, 3.6, u), thrust: thrust, tilt: tilt, dmg: csSm(6.2, 7.4, u), t: t };
  const hit = cvLocal(ship, -74, 30);
  if (u > 4.3 && u < 7.0) for (let k = 0; k < 5; k++){ const mp = cvMarinePos(k % 3, u); if (mp.y > 760) continue;
    const p = ((u * 4.4 + k * 0.41) % 1), mx = mp.x + 14 * mp.s, my0 = mp.y - 24 * mp.s, mx1 = (u > 6.2 ? hit[0] : ship.x - 40), my1 = (u > 6.2 ? hit[1] : ship.y + 30);          /* the shots leave each Marine's rifle */
    const a = csLerp(mx, mx1, p), b = csLerp(my0, my1, p), a2 = csLerp(mx, mx1, Math.max(0, p - 0.07)), b2 = csLerp(my0, my1, Math.max(0, p - 0.07));
    ctx.strokeStyle = '#FFE08A'; ctx.lineWidth = 2.6; ctx.beginPath(); ctx.moveTo(a2, b2); ctx.lineTo(a, b); ctx.stroke(); }
  cvShip(ctx, ship);
  if (u > 6.2 && u < 7.2){ const f = 1 - csSm(6.2, 7.2, u); csGlow(ctx, hit[0], hit[1], 70 * (0.4 + f), '#FFFFFF', 0.8 * f); csGlow(ctx, hit[0], hit[1], 110, '#FF8A2E', 0.6 * f); }
}
/* ============ SCENE C: deep space, damaged, locked on Venus (17.5 - 26 s) ============ */
function cvHud(ctx, lines, t, x, y){
  ctx.fillStyle = 'rgba(0,0,10,.55)'; ctx.fillRect(x, y, 300, 26 + lines.length * 26);
  csText(ctx, 'SYSTEMS', x + 12, y + 20, 11, '#8FA2C8', 'left', '600');
  for (let i = 0; i < lines.length; i++){ const L = lines[i], on = !L[2] || Math.sin(t * 9 + i) > -0.2; if (!on) continue;
    csText(ctx, L[0], x + 12, y + 46 + i * 26, 14, '#C8D6F0', 'left', '600'); csText(ctx, L[1], x + 288, y + 46 + i * 26, 14, L[3] || '#FF6A5A', 'right', '800'); }
}
function cvSceneC(ctx, u, t){
  csNow = t;
  ctx.fillStyle = '#000003'; ctx.fillRect(0, 0, CS_W, CS_H); csStars(ctx, 0.95, t, -u * 46, 0);
  csEarth(ctx, 190 - u * 6, 560, 34 - u * 1.6, t * 0.02, t);
  cvVenus(ctx, 1040 + 30 * (1 - csSm(0, 8.5, u)), 360, 70 + 210 * csSm(0, 8.5, u) * csSm(0, 8.5, u), t);
  const drift = 0.2 * csSm(2.2, 7, u), ship = { x: 500 + 10 * Math.sin(u * 0.9), y: 400 + 14 * Math.sin(u * 1.3) + 30 * csSm(2.2, 8, u), s: 1.05, rot: 0.05 * Math.sin(u * 1.1) + drift, thrust: 0.55 + 0.1 * Math.sin(u * 7), tilt: 1, dmg: 1, t: t };
  cvShip(ctx, ship);
  const sh = 1.5 + 3 * csSm(2, 6, u);
  csCabin(ctx, 40, 40, 300, 186, t, { label: 'COCKPIT', shake: sh, glow: 'rgba(255,40,30,' + (0.05 + 0.1 * Math.max(0, Math.sin(t * 7))) * csSm(1.5, 3, u) + ')' });
  cvHud(ctx, [['PORT ENGINE', 'OUT', false], ['STEERING', u > 2 ? 'FAULT' : 'OK', u > 2, u > 2 ? '#FF6A5A' : '#5CE08A'], ['NAV LOCK', u > 2.8 ? 'VENUS' : 'NONE', false, '#FFC84A'], ['FUEL', u > 6 ? '4 %' : '11 %', u > 6]], t, 940, 40);
}
/* ============ SCENE D: entering Venus's atmosphere (26 - 33 s) ============ */
function cvSceneD(ctx, u, t){
  csNow = t;
  const deep = csSm(0, 7, u);
  cvOrangeSky(ctx, t * (1 + 4 * deep), csHex('#F0D894', '#C8702A', deep), csHex('#E8B868', '#A8541E', deep), csHex('#C88A3C', '#7A3412', deep), 26);
  for (let k = 0; k < 18; k++){ const sp = 300 + k * 50 + deep * 500, yy = ((csR(k + 8300) * 900 + t * sp) % 1000) - 140, x0 = csR(k + 8400) * CS_W; ctx.strokeStyle = 'rgba(255,230,170,' + (0.06 + 0.1 * csR(k + 8500)) + ')'; ctx.lineWidth = 2 + csR(k + 8600) * 3; ctx.beginPath(); ctx.moveTo(x0, yy); ctx.lineTo(x0 - 20, yy - 100 - deep * 120); ctx.stroke(); }
  const sh = csShake(t, 2 + 7 * csSm(0, 7, u)), x = 420 + 330 * csSm(0, 7, u), y = 210 + 210 * csSm(0, 7, u), rot = 0.55 + 0.15 * Math.sin(u * 2) + 0.2 * csSm(3, 7, u);
  const ship = { x: x + sh[0], y: y + sh[1], s: 1.1, rot: rot, thrust: u < 3.6 ? 0.6 : 0.15 * (Math.sin(t * 17) > 0), tilt: 1, dmg: 1, t: t };
  const nose = cvLocal(ship, 140, 6);
  for (let k = 1; k <= 14; k++){ const p = k / 14; csGlow(ctx, nose[0] - Math.cos(rot) * p * 330, nose[1] - Math.sin(rot) * p * 330, 70 * (1 - p * 0.5), k < 4 ? '#FFFFFF' : '#FF7A2E', (1 - p) * 0.55 * (0.4 + 0.6 * csSm(0, 3, u))); }
  cvShip(ctx, ship);
  csGlow(ctx, nose[0], nose[1], 130, '#FFF2C8', 0.85 * csSm(0, 3, u)); csGlow(ctx, nose[0], nose[1], 60, '#FFFFFF', 0.9 * csSm(0, 3, u));
  const alt = Math.round(csLerp(72, 47, csSm(0, 7, u))), temp = Math.round(csLerp(120, 1480, csSm(0, 6.5, u)));
  cvHud(ctx, [['ALTITUDE', alt + ' KM', false, '#FFC84A'], ['HULL TEMP', temp + ' \u00B0C', u > 3, '#FF6A5A'], ['ENGINES', 'FAILING', true], ['EJECT', u > 4 ? 'READY' : 'LOCKED', u > 4, u > 4 ? '#5CE08A' : '#8FA2C8']], t, 940, 40);
  const lean = csSm(5.4, 6.0, u) * (1 - csSm(6.3, 6.9, u));
  csCabin(ctx, 40, 40, 330, 204, t, { label: 'COCKPIT', shake: 4 + 6 * csSm(0, 7, u), neck: 0.85 + 0.4 * lean, head: -0.05 + 0.35 * lean, glow: 'rgba(255,50,20,' + (0.08 + 0.12 * Math.max(0, Math.sin(t * 9))) + ')' });
  if (u > 4){ const hx = 40 + 330 - 52, hy = 40 + 204 * 0.56, pulled = csSm(5.8, 6.2, u); ctx.fillStyle = '#20242E'; ctx.fillRect(hx - 6, hy - 22, 12, 12 + 26 * pulled); ctx.fillStyle = Math.sin(t * 10) > 0 ? '#FFC84A' : '#20242E'; ctx.fillRect(hx - 24, hy + 4 + 26 * pulled, 48, 14); ctx.fillStyle = '#FF3A2A'; ctx.fillRect(hx - 24, hy + 4 + 26 * pulled, 48, 4); csText(ctx, 'EJECT', hx, hy + 38 + 26 * pulled, 11, '#FFC84A', 'center', '800'); }
  if (u > 6.4) { ctx.fillStyle = 'rgba(255,255,255,' + csSm(6.4, 7, u) + ')'; ctx.fillRect(0, 0, CS_W, CS_H); }
}
/* ============ SCENE E: ejection, the parachute, the crash from a distance (33 - 41 s) ============ */
function cvSceneE(ctx, u, t){
  csNow = t;
  const cam = 520 * csSm(1.8, 7.4, u), GW = 790;
  cvOrangeSky(ctx, t, '#B5601F', '#D98E3C', '#F0BE72', 14);
  csGlow(ctx, 640, GW - cam - 20, 700, '#FFD890', 0.35);
  cvVolcano(ctx, 1010, GW - cam + 2, 0.9, t); cvVolcano(ctx, 200, GW - cam + 2, 0.5, t + 3);
  cvGround(ctx, GW - cam, t, cam);
  const crashU = 3.8, sfx_ = 640 - 55 * crashU, sx = 640 - 55 * Math.min(u, crashU), wy = 300 + 75 * Math.pow(Math.min(u, crashU), 1.4);
  if (u < crashU){
    const ship = { x: sx, y: wy - cam, s: 0.95, rot: 1.05 + 0.35 * Math.sin(u * 1.6), thrust: 0, tilt: 1, dmg: 1, t: t };
    for (let k = 1; k <= 12; k++){ const uu = Math.max(0, u - k * 0.09), px = 640 - 55 * uu, py = 300 + 75 * Math.pow(uu, 1.4) - cam; ctx.globalAlpha = (1 - k / 13) * 0.6; ctx.fillStyle = k < 5 ? '#FF8A2E' : '#3A3632'; ctx.beginPath(); ctx.arc(px, py, 12 + k * 3, 0, TAU); ctx.fill(); }
    ctx.globalAlpha = 1; cvShip(ctx, ship);
  } else {
    const a = u - crashU, gy = GW - cam;
    csFireball(ctx, sfx_, gy - 18, 210 * csSm(0, 0.5, a) * (1 - 0.35 * csSm(0.5, 3.4, a)), 1 - csSm(1.4, 4, a));
    ctx.strokeStyle = 'rgba(255,220,160,' + 0.7 * (1 - csSm(0, 1.6, a)) + ')'; ctx.lineWidth = 6; ctx.beginPath(); ctx.ellipse(sfx_, gy, 420 * csSm(0, 1.6, a), 60 * csSm(0, 1.6, a), 0, 0, TAU); ctx.stroke();
    for (let k = 0; k < 16; k++){ const q = a * 0.5 - k * 0.025; if (q <= 0) continue; const p = csC(q, 0, 1); csGlow(ctx, sfx_ + Math.sin(k * 1.7 + a) * 16 + p * 30, gy - 20 - p * 400 - k * 6, 24 + p * 52 + k, k < 4 ? '#6A4630' : '#3A2C26', 0.42 * (1 - p * 0.35) * csSm(0, 0.25, q)); }
  }
  const podU = Math.max(0, u - 0.3), py = 330 - 50 * csSm(0, 1.3, podU) + 70 * csSm(1.3, 8, podU);
  const pStart = 560 + 230 * csSm(0, 1.0, podU);
  const ejected = u > 0.3;
  if (ejected){ const flame = 1 - csSm(0.3, 1.4, podU), chute = csSm(1.45, 2.0, u), sway = Math.sin(u * 1.5) * 0.7;
    const pxx = csLerp(pStart, 790 + 24 * Math.sin(u * 0.8), csSm(0.6, 1.6, podU)), pyy = py + (1 - csSm(0, 0.9, podU)) * 0;
    cvChute(ctx, pxx, pyy - 38, 1.15, chute, sway); cvPod(ctx, pxx, pyy, 1.0, sway * 0.12 * chute, flame, t, false); }
  if (u < 0.3) csGlow(ctx, 560, 300, 260, '#FFFFFF', 0.9 * (1 - u / 0.3));
  if (u < 0.45){ ctx.fillStyle = 'rgba(255,255,255,' + 0.8 * (1 - u / 0.45) + ')'; ctx.fillRect(0, 0, CS_W, CS_H); }
  if (u >= crashU && u < crashU + 0.5){ ctx.fillStyle = 'rgba(255,240,200,' + 0.55 * (1 - (u - crashU) / 0.5) + ')'; ctx.fillRect(-20, -20, CS_W + 40, CS_H + 40); }
}
/* ============ SCENE F: stranded on Venus (41 - 53.5 s) ============ */
function cvSceneF(ctx, u, t){
  csNow = t;
  const HY = 430, zoom = 1 + 0.07 * csSm(6, 12, u);
  ctx.save(); ctx.translate(640, 470); ctx.scale(zoom, zoom); ctx.translate(-640, -470);
  cvOrangeSky(ctx, t, '#A8541E', '#D98A3A', '#F2C07A', 12);
  csGlow(ctx, 640, HY, 760, '#FFD890', 0.4);
  cvVolcano(ctx, 1060, HY + 2, 0.85, t); cvVolcano(ctx, 210, HY + 2, 0.55, t + 2);
  for (let k = 0; k < 7; k++){ const a = (t * 0.12 + k / 7) % 1; ctx.globalAlpha = 0.5 * (1 - a * 0.6); ctx.fillStyle = k < 2 ? '#4A342A' : '#33261F'; ctx.beginPath(); ctx.arc(320 + Math.sin(k * 2 + t * 0.6) * 26 * a + a * 60, HY - a * 300, 14 + a * 46, 0, TAU); ctx.fill(); }   /* the crash, still burning */
  ctx.globalAlpha = 1; csGlow(ctx, 320, HY - 4, 60, '#FF7A1E', 0.6 * (0.7 + 0.3 * Math.sin(t * 7)));
  cvGround(ctx, HY, t, 0);
  const landU = 2.2, podX = 760, podY = 590;
  const drop = u < landU ? (1 - csSm(0, landU, u)) : 0, py = podY - drop * 640 - (u < landU ? 0 : 0), sway = Math.sin(u * 1.4) * 0.6 * (1 - csSm(1.6, landU, u));
  if (u < landU + 2.2){
    const collapse = csSm(landU, landU + 2.0, u);
    if (u < landU) cvChute(ctx, podX + 18 * sway, py - 36, 1.15, 1, sway);
    else { ctx.save(); ctx.translate(podX + 60 * collapse, podY - 30 * (1 - collapse) + 6 * collapse); ctx.rotate(0.9 * collapse); ctx.scale(1.1, 1.1 - 0.75 * collapse); ctx.translate(-0, 36); cvChute(ctx, 0, 0, 1, 1 - 0.3 * collapse, 0); ctx.restore(); }
  }
  ctx.fillStyle = 'rgba(0,0,0,.3)'; ctx.beginPath(); ctx.ellipse(podX, podY + 26, 40 + drop * 10, 8, 0, 0, TAU); ctx.fill();
  cvPod(ctx, podX + 18 * sway * (u < landU ? 1 : 0), py, 1.0, sway * 0.1, 0, t, u > 4.6);
  if (u > landU && u < landU + 2.4){ const a = (u - landU) / 2.4; for (let k = 0; k < 10; k++){ ctx.globalAlpha = 0.6 * (1 - a); ctx.fillStyle = '#B08A66'; ctx.beginPath(); ctx.arc(podX + (k - 5) * 26 * (0.4 + a), podY + 22 - a * 26 * csR(k + 8700), 14 + a * 36, 0, TAU); ctx.fill(); } ctx.globalAlpha = 1; }
  if (u > 4.6){ const o = csSm(4.6, 5.5, u); ctx.save(); ctx.translate(podX + 14, podY - 6); ctx.rotate(-0.2 - 1.1 * o); ctx.fillStyle = '#6A7288'; ctx.fillRect(0, -3, 28, 6); ctx.restore(); }
  const wk = csSm(5.4, 8.0, u), gx = csLerp(podX + 26, 930, wk), moving = u > 5.4 && u < 8.0;
  if (u > 5.2){ const lookUp = csSm(8.2, 9.6, u), gc = { x: gx, y: podY + 30 - (moving ? Math.abs(Math.sin(u * 5)) * 3 : 0), s: 0.78, face: 1, neck: csLerp(0.5, 0.05, lookUp), head: csLerp(0.3, -0.2, lookUp), walk: u * 4.6, moving: moving, blink: (Math.sin(t * 1.3) > 0.96) ? 1 : 0, look: 1.2 * lookUp, tuck: 0, crouch: 0 };
    ctx.save(); if (u < 5.9){ ctx.beginPath(); ctx.rect(podX + 10, 0, 1400, CS_H); ctx.clip(); } csGiraffe(ctx, gc); ctx.restore(); }
  for (let k = 0; k < 26; k++){ const x = ((csR(k + 8800) * 1500 + t * (90 + csR(k + 8900) * 140)) % 1500) - 110, y = 440 + csR(k + 9000) * 280; ctx.globalAlpha = 0.25; ctx.fillStyle = '#E8C898'; ctx.fillRect(x, y, 14 + csR(k + 9100) * 26, 1.6); }
  ctx.globalAlpha = 1; ctx.restore();
  const card = csSm(9.4, 10.6, u) * (1 - csSm(12.0, 12.5, u) * 0);
  if (card > 0.01){
    ctx.globalAlpha = card * 0.6; ctx.fillStyle = 'rgba(10,4,0,1)'; ctx.fillRect(0, 214, CS_W, 168);
    ctx.globalAlpha = card; csText(ctx, 'STRANDED', 640 - 14 * (1 - card), 318, 92, '#FFE2B0', 'center', '900');
    csText(ctx, 'The ship was the only way off.', 640, 366, 24, '#FFB070', 'center', '600'); ctx.globalAlpha = 1;
  }
}
function cvScene(ctx, t){
  const T = CV_T;
  if (t < T.B) cvSceneA(ctx, t - T.A, t);
  else if (t < T.C) cvSceneB(ctx, t - T.B, t);
  else if (t < T.D) cvSceneC(ctx, t - T.C, t);
  else if (t < T.E) cvSceneD(ctx, t - T.D, t);
  else if (t < T.F) cvSceneE(ctx, t - T.E, t);
  else cvSceneF(ctx, t - T.F, t);
}
function cvFade(t){
  let f = 1 - csSm(0, 1.2, t);
  f = Math.max(f, csSm(CV_T.END - 1.8, CV_T.END, t));
  for (const b of [CV_T.B, CV_T.C, CV_T.D, CV_T.F]) f = Math.max(f, 1 - csSm(0, 0.4, Math.abs(t - b)));
  return f;
}
function cvOverlays(ctx, t){
  const v = ctx.createRadialGradient(640, 360, 300, 640, 360, 780); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,.4)');
  ctx.fillStyle = v; ctx.fillRect(0, 0, CS_W, CS_H);
  let cap = null;
  for (let i = 0; i < CV_CAPS.length; i++) if (t >= CV_CAPS[i][0] && t < CV_CAPS[i][0] + CV_CAPS[i][3]) cap = CV_CAPS[i];
  if (cap){
    const a = csSm(0, 0.25, t - cap[0]) * (1 - csSm(cap[3] - 0.35, cap[3], t - cap[0]));
    ctx.globalAlpha = a; ctx.fillStyle = 'rgba(0,0,10,.58)'; ctx.fillRect(0, 618, cap[2] ? 640 : 460, cap[2] ? 84 : 58);
    ctx.fillStyle = '#FFB070'; ctx.fillRect(0, 618, 5, cap[2] ? 84 : 58);
    csText(ctx, cap[1], 26, 652, 25, '#F4F8FF', 'left', '800');
    if (cap[2]) csText(ctx, cap[2], 26, 682, 15, '#A8BCE0', 'left', '600');
    ctx.globalAlpha = 1;
  }
  const f = cvFade(t);
  if (f > 0.005){ ctx.fillStyle = 'rgba(0,0,0,' + f + ')'; ctx.fillRect(0, 0, CS_W, CS_H); }
}
const CV_CUES = [];
(function(){
  const add = (t, fn) => CV_CUES.push([t, fn]);
  add(1.0, () => SFX.click()); add(4.6, () => SFX.click()); add(7.4, () => SFX.click()); add(7.9, () => SFX.boom());
  add(9.9, () => SFX.whoosh()); add(10.4, () => SFX.boom()); add(11.0, () => SFX.boom()); add(13.0, () => SFX.whoosh());
  add(15.7, () => SFX.zap()); add(15.8, () => SFX.boom()); add(16.2, () => SFX.boom());
  add(20.0, () => SFX.click()); for (let x = 20.6; x < 25.6; x += 0.8) add(x, () => SFX.click());
  add(27.0, () => SFX.whoosh()); for (let x = 28.4; x < 32.2; x += 0.5) add(x, () => SFX.click());
  add(32.4, () => SFX.zap()); add(33.3, () => SFX.boom()); add(33.4, () => SFX.whoosh());
  add(34.9, () => SFX.whoosh()); add(36.8, () => SFX.boom()); add(37.0, () => SFX.boom()); add(37.4, () => SFX.boom());
  add(43.2, () => SFX.boom()); add(46.0, () => SFX.click()); add(50.6, () => SFX.level()); add(52.0, () => SFX.over());
  CV_CUES.sort((a, b) => a[0] - b[0]);
})();

function renderCutscene(ctx, t, W, H, kind){
  W = W || G.W; H = H || G.H;
  const V = kind === 'venus', HMF = kind === 'home', A51F = kind === 'a51', SHN = shChapterOf(kind), MF = MARS_FILMS[kind];
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
  const k = Math.min(W / CS_W, H / CS_H), ox = (W - CS_W * k) / 2, oy = (H - CS_H * k) / 2, T = CS_T;
  ctx.save(); ctx.translate(ox, oy); ctx.scale(k, k);
  ctx.beginPath(); ctx.rect(0, 0, CS_W, CS_H); ctx.clip();
  if (MF) MF.scene(ctx, t);
  else if (SHN) shScene(ctx, t, SHN);
  else if (A51F) a51Scene(ctx, t);
  else if (HMF) hmScene(ctx, t);
  else if (V) cvScene(ctx, t);
  else if (t < T.B) csScenePad(ctx, t - T.A, t);
  else if (t < T.C) csSceneAscent(ctx, t - T.B, t);
  else if (t < T.D) csSceneTLI(ctx, t - T.C, t);
  else if (t < T.E) csSceneCoast(ctx, t - T.D, t);
  else if (t < T.F) csSceneOrbit(ctx, t - T.E, t);
  else if (t < T.G) csSceneDescent(ctx, t - T.F, t);
  else csSceneSurface(ctx, t - T.G, t);
  if (MF) MF.over(ctx, t); else if (SHN) shOverlays(ctx, t, SHN); else if (A51F) a51Overlays(ctx, t); else if (HMF) hmOverlays(ctx, t); else if (V) cvOverlays(ctx, t); else csOverlays(ctx, t);
  ctx.restore();
  /* the skip button, drawn in screen space so it stays reachable outside the letterbox */
  const bw = 156, bh = 40, bx = W - bw - 16, by = H - bh - 16;
  if (G.cut){
    G.cutSkipRect = { x: bx, y: by, w: bw, h: bh };
    ctx.fillStyle = 'rgba(0,0,10,.55)'; ctx.fillRect(bx, by, bw, bh); ctx.strokeStyle = 'rgba(200,214,240,.5)'; ctx.lineWidth = 1; ctx.strokeRect(bx + 0.5, by + 0.5, bw - 1, bh - 1);
    ctx.font = '600 15px ' + CS_MONO; ctx.fillStyle = '#E8F0FF'; ctx.textAlign = 'center'; ctx.fillText('Skip \u25B8  Esc', bx + bw / 2, by + 25); ctx.textAlign = 'left';
    if (G.cut.debug){ ctx.font = '600 12px ' + CS_MONO; ctx.fillStyle = '#FFC84A'; ctx.textAlign = 'right'; ctx.fillText('DEV \u00B7 keys 1-' + (V || A51F ? 6 : 8) + ' jump to a scene \u00B7 t=' + t.toFixed(1) + 's', W - 16, 22); ctx.textAlign = 'left'; }
  }
}

/* ---------- sound ---------- */
const CS_CUES = [];
(function(){
  const add = (t, fn) => CS_CUES.push([t, fn]);
  for (let s = 1; s <= 8; s++) add(s, () => SFX.click());
  add(4.0, () => SFX.whoosh()); add(6.0, () => SFX.splash());
  [8.0, 8.6, 9.2, 10.2, 12.0, 15.0, 18.5, 21.0, 23.5].forEach(x => add(x, () => SFX.boom()));
  [25.4, 26.0, 29.0, 32.4, 33.0].forEach(x => add(x, () => SFX.boom()));
  [26.3, 29.6, 33.4, 36.5].forEach(x => add(x, () => SFX.whoosh()));
  add(29.0, () => SFX.click()); add(40.2, () => SFX.click()); add(42.4, () => SFX.click()); add(44.9, () => SFX.whoosh()); add(46.4, () => SFX.zap()); add(47.2, () => SFX.click());
  add(61.2, () => SFX.click()); add(64.8, () => SFX.whoosh()); add(65.4, () => SFX.click()); add(74.9, () => SFX.click()); add(75.0, () => SFX.boom());
  add(76.4, () => SFX.level()); add(79.6, () => SFX.whoosh()); add(85.5, () => SFX.click());
  for (let x = 91; x <= 93.5; x += 0.5) add(x, () => SFX.click());
  [93.6, 93.75, 94.0].forEach(x => add(x, () => SFX.boom()));
  add(100.0, () => SFX.over());
  CS_CUES.sort((a, b) => a[0] - b[0]);
})();
function csCueIndexAt(t, cues){ cues = cues || CS_CUES; let i = 0; while (i < cues.length && cues[i][0] < t) i++; return i; }

/* ---------- state ---------- */
function startCutscene(after, debug, kind){
  const prev = G.state;
  G.prevCutState = prev;
  G.state = 'cutscene';
  hideOverlay();
  HUD.classList.remove('on'); TOUCH.classList.remove('on'); PAUSEBTN.classList.remove('on');
  G.cut = { t: 0, after: after || null, debug: !!debug, cue: 0, done: false, prevState: prev, kind: kind === 'venus' || kind === 'home' || kind === 'a51' || shChapterOf(kind) || MARS_FILMS[kind] ? kind : 'moon' };
  try { SFX.init(); SFX.resume(); } catch (e) {}
  G.fadeIn = { t: 0, dur: 0.45 };                      /* the film opens out of the dark */
}
function endCutscene(){
  const c = G.cut;
  if (!c || c.done) return;
  c.done = true;
  G.cut = null;
  G.fadeIn = { t: 0, dur: 0.45 };                      /* and the game comes back the same way */
  G.state = c.prevState || 'menu';
  if (c.after) c.after(); else showMenu();
}
function updateCutscene(dt){
  const c = G.cut;
  if (!c) return;
  c.t += dt;
  const shn = shChapterOf(c.kind), mf = MARS_FILMS[c.kind];
  const cues = mf ? mf.cues : shn ? SH_CUES : c.kind === 'a51' ? A51_CUES : c.kind === 'home' ? HM_CUES : c.kind === 'venus' ? CV_CUES : CS_CUES, end = mf ? mf.end : shn ? shLen(shn) : c.kind === 'a51' ? A51_T.END : c.kind === 'home' ? HM_T.END : c.kind === 'venus' ? CV_T.END : CS_T.END;
  while (c.cue < cues.length && cues[c.cue][0] <= c.t){ try { cues[c.cue][1](); } catch (e) {} c.cue++; }
  if (c.t >= end) endCutscene();
}
function cutSeek(t){
  if (!G.cut) return;
  const K = G.cut.kind, shn = shChapterOf(K), mf = MARS_FILMS[K], E = mf ? mf.end : shn ? shLen(shn) : K === 'a51' ? A51_T.END : K === 'home' ? HM_T.END : K === 'venus' ? CV_T.END : CS_T.END, C = mf ? mf.cues : shn ? SH_CUES : K === 'a51' ? A51_CUES : K === 'home' ? HM_CUES : K === 'venus' ? CV_CUES : CS_CUES;
  G.cut.t = csC(t, 0, E - 0.05);
  G.cut.cue = csCueIndexAt(G.cut.t, C);
}
function cutKey(e){
  if (!G.cut) return;
  if (e.code === 'Escape' || e.code === 'Space' || e.code === 'Enter'){ endCutscene(); return; }
  if (G.cut.debug){
    const starts = MARS_FILMS[G.cut.kind] ? MARS_FILMS[G.cut.kind].starts : shChapterOf(G.cut.kind) ? [0, 2, 4, 6, 0, 0, 0, 0] : G.cut.kind === 'a51' ? [A51_T.A, A51_T.B, A51_T.C, A51_T.D, A51_T.E, A51_T.F, A51_T.F, A51_T.F] : G.cut.kind === 'home' ? [HM_T.A, HM_T.B, HM_T.C, HM_T.D, HM_T.E, HM_T.F, HM_T.G, HM_T.H] : G.cut.kind === 'venus' ? [CV_T.A, CV_T.B, CV_T.C, CV_T.D, CV_T.E, CV_T.F, CV_T.F, CV_T.F] : [CS_T.A, CS_T.B, CS_T.C, CS_T.D, CS_T.E, CS_T.F, CS_T.G, CS_T.G + 15];
    const m = /^(Digit|Numpad)([1-8])$/.exec(e.code);
    if (m) cutSeek(starts[+m[2] - 1] + 0.05);
  }
}
function cutSkipHit(clientX, clientY){
  const r = G.cutSkipRect;
  if (!r || !G.cut) return false;
  const rc = stage.getBoundingClientRect(), x = clientX - rc.left, y = clientY - rc.top;
  return x >= r.x - 8 && x <= r.x + r.w + 8 && y >= r.y - 8 && y <= r.y + r.h + 8;
}

