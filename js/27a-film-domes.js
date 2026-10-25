'use strict';
/* The Dome films (Chapter 13.5). */
/* ========================= THE DOME FILMS ========================= */
/* Two films in the same format as the Mars films (MARS_FILMS: end, starts, scene, over, cues): the helicopter from Longneck Town over the mirrored domes
   (after the Chapter 13 films, or when 13.5 is started from the menu), and the escape from the domes to New York City (the end of Chapter 13.5).
   Every frame is a pure function of time. */
/* the town helicopter, side on, nose to the right: a dark green pod with a glass nose, a tail boom with a fin and a tail rotor, skids, and a main rotor on a mast.
   o = { x, y (the middle of the body), s, t, rot, spin (0 to 1: how fast the rotors turn), pilot (the giraffe in the cockpit), light } */
function domeHeli(ctx, o){
  const s = o.s || 1, t = o.t || 0, spin = o.spin === undefined ? 1 : o.spin, GREEN = '#35543A', GREEN_D = '#223A28', GREEN_L = '#4A7050', GLASS = '#BCE4F0';
  ctx.save(); ctx.translate(o.x, o.y); ctx.rotate(o.rot || 0); ctx.scale(s, s);
  /* skids, behind the body */
  ctx.strokeStyle = '#1A2A1E'; ctx.lineWidth = 5; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(-46, 40); ctx.lineTo(-52, 62); ctx.moveTo(30, 40); ctx.lineTo(34, 62); ctx.moveTo(-74, 64); ctx.lineTo(70, 64); ctx.lineTo(82, 56); ctx.stroke(); ctx.lineCap = 'butt';
  /* tail boom, fin, stabiliser */
  ctx.fillStyle = GREEN; ctx.beginPath(); ctx.moveTo(-40, -16); ctx.lineTo(-196, -26); ctx.lineTo(-196, -12); ctx.lineTo(-40, 14); ctx.closePath(); ctx.fill();
  ctx.fillStyle = GREEN_D; ctx.beginPath(); ctx.moveTo(-40, 2); ctx.lineTo(-196, -16); ctx.lineTo(-196, -12); ctx.lineTo(-40, 14); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#E8C23A'; ctx.beginPath(); ctx.moveTo(-120, -22); ctx.lineTo(-136, -23); ctx.lineTo(-136, -4); ctx.lineTo(-120, -2); ctx.closePath(); ctx.fill();      /* the town's yellow band */
  ctx.fillStyle = GREEN; ctx.beginPath(); ctx.moveTo(-178, -24); ctx.lineTo(-206, -70); ctx.lineTo(-190, -72); ctx.lineTo(-162, -26); ctx.closePath(); ctx.fill();
  ctx.fillStyle = GREEN_D; ctx.beginPath(); ctx.moveTo(-170, -24); ctx.lineTo(-198, -68); ctx.lineTo(-190, -72); ctx.lineTo(-162, -26); ctx.closePath(); ctx.fill();
  ctx.fillStyle = GREEN_D; ctx.beginPath(); ctx.moveTo(-170, -12); ctx.lineTo(-190, 4); ctx.lineTo(-178, 6); ctx.lineTo(-156, -10); ctx.closePath(); ctx.fill();
  /* tail rotor */
  const ta = t * 38 * spin;
  ctx.fillStyle = '#10181288'; ctx.beginPath(); ctx.ellipse(-198, -54, 4 + 3 * (1 - spin), 26, 0, 0, TAU); ctx.fill();
  ctx.strokeStyle = '#141E16'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(-198, -54 - Math.cos(ta) * 24); ctx.lineTo(-198, -54 + Math.cos(ta) * 24); ctx.stroke();
  fillCircle(ctx, -198, -54, 4.4, '#C8D0C0');
  /* the body */
  ctx.fillStyle = GREEN_D; ctx.beginPath(); ctx.ellipse(0, 6, 76, 42, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = GREEN; ctx.beginPath(); ctx.ellipse(0, 0, 76, 40, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = GREEN_L; ctx.beginPath(); ctx.ellipse(-8, -14, 56, 14, -0.06, 0, TAU); ctx.fill();
  ctx.fillStyle = GREEN_D; ctx.beginPath(); ctx.ellipse(-4, 24, 66, 14, 0, 0, TAU); ctx.fill();                                      /* the darker belly */
  ctx.fillStyle = GREEN_D; ctx.beginPath(); ctx.moveTo(-34, -36); ctx.quadraticCurveTo(-16, -62, 14, -52); ctx.lineTo(24, -34); ctx.closePath(); ctx.fill();      /* the engine hump */
  ctx.fillStyle = GREEN; ctx.beginPath(); ctx.moveTo(-30, -36); ctx.quadraticCurveTo(-14, -57, 10, -49); ctx.lineTo(18, -36); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = '#1A2A1E'; ctx.lineWidth = 2; for (let k = 0; k < 3; k++){ ctx.beginPath(); ctx.moveTo(-22 + k * 10, -44 + k * 1.4); ctx.lineTo(-18 + k * 10, -38); ctx.stroke(); }
  ctx.strokeStyle = '#162418'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-34, -18); ctx.lineTo(-34, 30); ctx.moveTo(-4, -22); ctx.lineTo(-4, 34); ctx.stroke();      /* the door seams */
  ctx.fillStyle = GREEN_L; ctx.fillRect(-32, 2, 6, 3);                                                                            /* a door handle */
  /* the glass nose and the cockpit */
  const gg = ctx.createLinearGradient(20, -34, 70, 22); gg.addColorStop(0, '#E4F8FF'); gg.addColorStop(0.5, GLASS); gg.addColorStop(1, '#6EA6BC');
  ctx.fillStyle = gg; ctx.beginPath(); ctx.moveTo(10, -30); ctx.quadraticCurveTo(52, -34, 76, -6); ctx.quadraticCurveTo(74, 18, 40, 24); ctx.lineTo(10, 24); ctx.closePath(); ctx.fill();
  if (o.pilot){                                                                                                                    /* the giraffe, her neck bent forward under the glass */
    ctx.save(); ctx.beginPath(); ctx.moveTo(10, -30); ctx.quadraticCurveTo(52, -34, 76, -6); ctx.quadraticCurveTo(74, 18, 40, 24); ctx.lineTo(10, 24); ctx.closePath(); ctx.clip();
    csGiraffe(ctx, { x: 6, y: 52, s: 0.44, face: 1, neck: 0.55, head: 0.35, crouch: 14, bare: true, boots: false });
    ctx.restore();
  }
  ctx.strokeStyle = '#1A2A1E'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(10, -30); ctx.quadraticCurveTo(52, -34, 76, -6); ctx.quadraticCurveTo(74, 18, 40, 24); ctx.lineTo(10, 24); ctx.closePath(); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(34, -33); ctx.lineTo(30, 24); ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,.45)'; ctx.beginPath(); ctx.moveTo(18, -26); ctx.lineTo(34, -30); ctx.lineTo(26, 14); ctx.lineTo(18, 14); ctx.closePath(); ctx.fill();   /* a reflection */
  /* lights */
  if (o.light !== false){ const on = Math.sin(t * 7) > 0; fillCircle(ctx, 70, 14, 3, on ? '#FFF2B0' : '#6A6A50'); fillCircle(ctx, -196, -19, 3, on ? '#FF4A3A' : '#5A1A14'); }
  /* the main rotor: a mast, a hub, a soft disc when it is fast and two long blades when it is slow */
  ctx.fillStyle = '#1A2A1E'; ctx.fillRect(-5, -60, 10, 14); fillCircle(ctx, 0, -62, 7, '#10181A');
  const ra = t * 30 * spin, bl = Math.cos(ra) * 214;
  ctx.fillStyle = 'rgba(20,30,24,' + (0.16 * spin) + ')'; ctx.beginPath(); ctx.ellipse(0, -62, 216, 9 + 3 * spin, 0, 0, TAU); ctx.fill();
  ctx.strokeStyle = '#121C14'; ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-bl, -62 + Math.sin(ra) * 4); ctx.lineTo(bl, -62 - Math.sin(ra) * 4); ctx.stroke(); ctx.lineCap = 'butt';
  ctx.restore();
}
/* a mirrored dome, side on: a steel ring, a hemisphere wrapped in mylar (a silver skin that throws the sun back in bright streaks), ribs, a door, and a vent.
   o = { peel (0 to 1: a flap of foil lifted to show the frost and the cold glow behind it), warn (0 to 1: the whole dome glowing from inside), crack } */
function domeBuilding(ctx, x, gy, R, t, o){
  o = o || {};
  const ry = R * 0.86, ringH = Math.max(8, R * 0.09), peel = o.peel || 0, warn = o.warn || 0;
  ctx.save(); ctx.translate(x, gy);
  ctx.fillStyle = 'rgba(40,24,10,.28)'; ctx.beginPath(); ctx.ellipse(R * 0.14, 2, R * 1.12, R * 0.07, 0, 0, TAU); ctx.fill();            /* its shadow on the ground */
  ctx.save(); ctx.beginPath(); ctx.ellipse(0, 0, R, ry, 0, Math.PI, 0); ctx.closePath(); ctx.clip();
  const g = ctx.createLinearGradient(-R, -ry, R, 0); g.addColorStop(0, '#F4F8FA'); g.addColorStop(0.45, '#C4CFD6'); g.addColorStop(1, '#7E8E9A'); ctx.fillStyle = g; ctx.fillRect(-R, -ry, R * 2, ry);
  for (let k = 0; k < 26; k++){                                                                                                           /* crinkled foil: patches that catch the light differently */
    const a = csR(k + 31000) * Math.PI, rr = csR(k + 31100) * 0.9 * R, px = -Math.cos(a) * rr, py = -Math.sin(a) * rr * 0.86, sz = R * (0.1 + csR(k + 31200) * 0.14), br = csR(k + 31300);
    ctx.fillStyle = br > 0.5 ? 'rgba(255,252,236,' + (0.16 + br * 0.2) + ')' : 'rgba(60,76,92,' + (0.1 + br * 0.14) + ')';
    ctx.beginPath(); ctx.moveTo(px, py - sz); ctx.lineTo(px + sz * 0.8, py + sz * 0.4); ctx.lineTo(px - sz * 0.9, py + sz * 0.6); ctx.closePath(); ctx.fill();
  }
  ctx.strokeStyle = 'rgba(40,58,74,.55)'; ctx.lineWidth = Math.max(1.2, R * 0.012);                                                       /* the ribs and rings of the frame */
  for (let k = 1; k < 7; k++){ ctx.beginPath(); ctx.ellipse(0, 0, R * k / 7, ry, 0, Math.PI, 0); ctx.stroke(); }
  for (let k = 1; k < 5; k++){ ctx.beginPath(); ctx.ellipse(0, 0, R, ry * k / 5, 0, Math.PI, 0); ctx.stroke(); }
  const sw = ((t * 0.22 + R * 0.002) % 1.4) - 0.2;                                                                                       /* a streak of sun sweeping across the foil */
  if (sw > -0.1 && sw < 1.1){ ctx.fillStyle = 'rgba(255,252,220,.42)'; const bx = -R + sw * R * 2; ctx.beginPath(); ctx.moveTo(bx, -ry); ctx.lineTo(bx + R * 0.18, -ry); ctx.lineTo(bx + R * 0.05, 0); ctx.lineTo(bx - R * 0.13, 0); ctx.closePath(); ctx.fill(); }
  if (peel > 0.01){                                                                                                                       /* a flap of foil lifted: frost and a cold glow behind it */
    const fx = -R * 0.34, fy = -ry * 0.46, fw = R * 0.34 * peel, fh = R * 0.3 * peel;
    ctx.fillStyle = '#0E2230'; ctx.fillRect(fx - fw / 2, fy - fh / 2, fw, fh);
    const fg = ctx.createRadialGradient(fx, fy, 0, fx, fy, fw); fg.addColorStop(0, 'rgba(160,248,255,.95)'); fg.addColorStop(1, 'rgba(90,200,236,.2)'); ctx.fillStyle = fg; ctx.fillRect(fx - fw / 2, fy - fh / 2, fw, fh);
    ctx.strokeStyle = 'rgba(240,252,255,.9)'; ctx.lineWidth = 1.6; for (let k = 0; k < 7; k++){ const a = k * 0.9 + 0.3; ctx.beginPath(); ctx.moveTo(fx, fy); ctx.lineTo(fx + Math.cos(a) * fw * 0.5, fy + Math.sin(a) * fh * 0.5); ctx.stroke(); }
    ctx.fillStyle = '#9AA8B2'; ctx.beginPath(); ctx.moveTo(fx - fw / 2, fy - fh / 2); ctx.lineTo(fx - fw / 2 - fw * 0.5, fy - fh / 2 - fh * 0.2); ctx.lineTo(fx - fw / 2 - fw * 0.3, fy + fh * 0.2); ctx.lineTo(fx - fw / 2, fy + fh / 2); ctx.closePath(); ctx.fill();   /* the lifted corner */
  }
  if (warn > 0.01){ const wg = ctx.createRadialGradient(0, -ry * 0.3, R * 0.1, 0, -ry * 0.3, R * 1.1); wg.addColorStop(0, 'rgba(150,245,255,' + (0.8 * warn) + ')'); wg.addColorStop(1, 'rgba(60,170,230,' + (0.15 * warn) + ')'); ctx.fillStyle = wg; ctx.fillRect(-R, -ry, R * 2, ry); }
  if (o.crack){ ctx.strokeStyle = 'rgba(220,255,255,' + Math.min(1, o.crack) + ')'; ctx.lineWidth = Math.max(2, R * 0.02); ctx.lineCap = 'round'; for (let k = 0; k < 6; k++){ const a = Math.PI * (0.18 + k * 0.13); ctx.beginPath(); ctx.moveTo(Math.cos(a) * R * 0.2, -Math.sin(a) * ry * 0.2); ctx.lineTo(Math.cos(a) * R * (0.5 + 0.1 * (k % 2)), -Math.sin(a) * ry * (0.55 + 0.1 * (k % 3))); ctx.stroke(); } ctx.lineCap = 'butt'; }
  ctx.restore();
  ctx.strokeStyle = '#33485A'; ctx.lineWidth = Math.max(2, R * 0.024); ctx.beginPath(); ctx.ellipse(0, 0, R, ry, 0, Math.PI, 0); ctx.stroke();
  ctx.fillStyle = '#4A5E6E'; ctx.fillRect(-R * 1.04, -ringH, R * 2.08, ringH); ctx.fillStyle = '#6A8090'; ctx.fillRect(-R * 1.04, -ringH, R * 2.08, ringH * 0.3);   /* the steel ring it stands on */
  ctx.fillStyle = '#1A2630'; ctx.fillRect(R * 0.28, -ringH - R * 0.18, R * 0.2, R * 0.18 + ringH * 0.9); ctx.strokeStyle = '#8CA2B2'; ctx.lineWidth = 2; ctx.strokeRect(R * 0.28, -ringH - R * 0.18, R * 0.2, R * 0.18 + ringH * 0.9);   /* a door */
  ctx.fillStyle = '#5E7284'; ctx.fillRect(-R * 0.62, -ry - R * 0.08, R * 0.1, R * 0.12); ctx.fillRect(-R * 0.66, -ry - R * 0.12, R * 0.18, R * 0.05);                         /* a vent stack on the crown */
  const sa = ((t * 0.6 + R * 0.01) % 1);
  ctx.globalAlpha = 0.5 * (1 - sa); ctx.fillStyle = '#F4FAFF'; ctx.beginPath(); ctx.ellipse(-R * 0.57 + sa * R * 0.1, -ry - R * 0.2 - sa * R * 0.4, R * 0.08 + sa * R * 0.12, R * 0.05 + sa * R * 0.08, 0, 0, TAU); ctx.fill(); ctx.globalAlpha = 1;   /* cold steam */
  ctx.restore();
}
/* the hot savannah in full daylight: a pale, glaring sky, dry ridges and ground, heat shimmer. gy = the ground line, sc = how far it has scrolled */
function domeDay(ctx, t, gy, sc, dusk){
  if (dusk) afSky(ctx, '#2A2250', '#E0703A', '#FFC070'); else afSky(ctx, '#5AB4EA', '#C4E8F6', '#FFF6D8');
  csGlow(ctx, 260, 110, 360, dusk ? '#FFB070' : '#FFFFFF', dusk ? 0.45 : 0.6); fillCircle(ctx, 260, 110, dusk ? 56 : 40, dusk ? '#FFD8A0' : '#FFFFFF');
  afClouds(ctx, sc * 0.05 + t * 8, 5, 60, 240, dusk ? 0.3 : 0.5, dusk ? '#F8C8A0' : '#FFFFFF');
  afRidge(ctx, gy - 44, 60, 2.2, dusk ? '#8A5A3A' : '#C8B070', sc * 0.1); afRidge(ctx, gy - 8, 40, 5.3, dusk ? '#6A4228' : '#B09850', sc * 0.25);
  for (let k = 0; k < 5; k++) afAcacia(ctx, (((k * 430 + 160 - sc * 0.5) % 2150) + 2150) % 2150 - 300, gy - 4, 0.7 + (k % 3) * 0.25);
  if (gy < CS_H){ const gg = ctx.createLinearGradient(0, gy, 0, CS_H); gg.addColorStop(0, dusk ? '#8A5A30' : '#D4B468'); gg.addColorStop(1, dusk ? '#4A2E18' : '#A8884A'); ctx.fillStyle = gg; ctx.fillRect(0, gy, CS_W, CS_H - gy + 2); }
  if (!dusk){ ctx.strokeStyle = 'rgba(255,255,255,.2)'; ctx.lineWidth = 2; for (let k = 0; k < 6; k++){ ctx.beginPath(); for (let x = 0; x <= CS_W; x += 20) ctx.lineTo(x, gy - 6 - k * 6 + Math.sin(x * 0.03 + t * 3 + k) * 3); ctx.stroke(); } }      /* heat shimmer over the horizon */
}
/* the glitter on the grass: bright cyan points that thicken the nearer the domes get (k from 0 to 1) */
function domeGlitter(ctx, t, gy, sc, k){
  const n = Math.round(10 + 80 * k);
  for (let i = 0; i < n; i++){
    const x = (((csR(i + 31500) * 1500 - sc * (0.9 + csR(i + 31600))) % 1500) + 1500) % 1500 - 110, y = gy + 8 + csR(i + 31700) * (CS_H - gy - 30), a = 0.5 + 0.5 * Math.sin(t * 4 + i * 1.7);
    ctx.globalAlpha = a * (0.4 + 0.5 * k); ctx.fillStyle = '#7FFFEA'; ctx.fillRect(x - 1.5, y - 1.5, 3, 3); ctx.fillStyle = '#E8FFFA'; ctx.fillRect(x - 0.5, y - 0.5, 1, 1);
  }
  ctx.globalAlpha = 1;
}

/* ---- film 1 (30 s): the helicopter from Longneck Town, the glitter, the domes, the landing ---- */
const DOME_FLIGHT_T = { B: 7, C: 14, D: 22, END: 30 };
const DOME_FLIGHT_CAPS = [
  [0.8, 'LONGNECK TOWN', 'The town helicopter, and a hunch', 3.4],
  [4.2, 'LIFTOFF', 'The vial hums. The grass is still glittering', 2.6],
  [7.6, 'THE TRAIL', 'Every glimmer points the same way', 3.4],
  [11.0, 'HEAT', 'The savannah is baking', 2.8],
  [14.6, 'MIRRORS ON THE HORIZON', 'A ring of domes, wrapped in foil', 3.4],
  [18.2, 'BUT LOOK CLOSER', 'Frost, inside a dome, in this heat', 3.4],
  [22.6, 'HOLD ON', 'The helicopter sets down in the shimmer', 3.2],
  [26.2, 'THE HATCH', 'She goes in alone', 3.0]
];
function domeFlightScene(ctx, t){
  const T = DOME_FLIGHT_T;
  if (t < T.B){                                                                      /* Longneck Town's helipad at dawn: she climbs in and the helicopter lifts off */
    const u = t, gy = 580, spin = csSm(0.2, 3.4, u), lift = csSm(4.4, 7, u);
    domeDay(ctx, t, gy + lift * 120, u * 4, false);
    ctx.fillStyle = 'rgba(255,230,160,.12)'; ctx.fillRect(0, 0, CS_W, CS_H);
    for (const [hx, hh, hw] of [[900, 120, 150], [1060, 90, 120], [1200, 150, 130]]){ ctx.fillStyle = '#8A6A4A'; ctx.fillRect(hx - hw / 2, gy + lift * 120 - hh, hw, hh); ctx.fillStyle = '#A04A3A'; ctx.beginPath(); ctx.moveTo(hx - hw / 2 - 10, gy + lift * 120 - hh); ctx.lineTo(hx, gy + lift * 120 - hh - 44); ctx.lineTo(hx + hw / 2 + 10, gy + lift * 120 - hh); ctx.closePath(); ctx.fill(); ctx.fillStyle = '#FFE8A0'; ctx.fillRect(hx - 14, gy + lift * 120 - hh + 24, 28, 26); }
    ctx.fillStyle = '#6A6A70'; ctx.beginPath(); ctx.ellipse(560, gy + lift * 120 + 6, 250, 20, 0, 0, TAU); ctx.fill(); ctx.fillStyle = '#F2F2EE'; ctx.font = '700 38px system-ui, sans-serif'; ctx.textAlign = 'center'; ctx.fillText('H', 560, gy + lift * 120 + 16); ctx.textAlign = 'left';
    const py = gy - 70 - lift * 270, px = 560 + lift * 60;
    const boarded = csSm(2.0, 3.2, u);
    if (u < 3.2) csGiraffe(ctx, { x: csLerp(120, 470, csSm(0.2, 2.4, u)), y: gy + 14, s: 0.72, face: 1, walk: u * 7, moving: u < 2.5, neck: 0.3, head: 0.1, bare: true, boots: false });
    domeHeli(ctx, { x: px, y: py, s: 1.0, t: t, rot: -0.08 * lift, spin: spin, pilot: boarded > 0.5 });
    if (u < 5) for (let k = 0; k < 14; k++){ const a = (u * 1.2 + k / 14) % 1; ctx.globalAlpha = 0.28 * (1 - a) * spin; ctx.fillStyle = '#D8C090'; ctx.beginPath(); ctx.arc(px + (k - 7) * 30 * (0.4 + a), gy + 4 - a * 14, 12 + a * 24, 0, TAU); ctx.fill(); }
    ctx.globalAlpha = 1;
  } else if (t < T.C){                                                               /* over the savannah: the glitter thickening */
    const u = t - T.B, sc = u * 240, k = csSm(0, 7, u), gy = 560;
    domeDay(ctx, t, gy, sc, false); domeGlitter(ctx, t, gy, sc, k);
    domeHeli(ctx, { x: 520 + Math.sin(t * 1.1) * 8, y: 250 + Math.sin(t * 1.7) * 8, s: 1.0, t: t, rot: 0.03, pilot: true });
    ctx.globalAlpha = 0.6 * csSm(2, 6, u); const gx = csLerp(1500, 1100, csSm(0, 7, u)); domeBuilding(ctx, gx, gy - 24, 40, t, {}); ctx.globalAlpha = 1;
  } else if (t < T.D){                                                               /* the ring of domes, and a close look through the glass at one of them */
    const u = t - T.C, sc = 1700 + u * 150, p = csSm(0, 6, u), gy = 580;
    domeDay(ctx, t, gy, sc, false); domeGlitter(ctx, t, gy, sc, 1);
    domeBuilding(ctx, csLerp(1100, 960, p), gy - 6, csLerp(60, 150, p), t, { peel: csSm(4.2, 6, u) });
    domeBuilding(ctx, csLerp(1400, 1200, p), gy - 14, csLerp(40, 100, p), t, {});
    domeBuilding(ctx, csLerp(1650, 1500, p), gy - 20, csLerp(34, 84, p), t, {});
    domeHeli(ctx, { x: csLerp(420, 360, p), y: 270 + Math.sin(t * 1.7) * 8, s: 1.0, t: t, rot: 0.04, pilot: true });
    if (u > 4.4){                                                                    /* binoculars: a round window on the frosted flap */
      const a = csSm(4.4, 5.2, u); ctx.globalAlpha = a; ctx.save(); ctx.beginPath(); ctx.arc(1020, 190, 124, 0, TAU); ctx.clip();
      afSky(ctx, '#0E2230', '#1E4A62', '#5ABAD8'); csGlow(ctx, 1020, 200, 160, '#9AF4FF', 0.7);
      ctx.strokeStyle = 'rgba(240,252,255,.9)'; ctx.lineWidth = 3; for (let k = 0; k < 16; k++){ const an = k * 0.4; ctx.beginPath(); ctx.moveTo(1020, 200); ctx.lineTo(1020 + Math.cos(an) * 120, 200 + Math.sin(an) * 120); ctx.stroke(); }
      for (let k = 0; k < 5; k++){ ctx.fillStyle = '#6FE0FF'; ctx.beginPath(); ctx.moveTo(960 + k * 28, 270); ctx.lineTo(968 + k * 28, 190 - (k % 3) * 20); ctx.lineTo(980 + k * 28, 270); ctx.closePath(); ctx.fill(); }
      ctx.fillStyle = 'rgba(244,252,255,.7)'; for (let k = 0; k < 7; k++){ const sa = ((t * 0.5 + k / 7) % 1); ctx.beginPath(); ctx.ellipse(1000 + k * 8, 150 - sa * 90, 12 + sa * 18, 8 + sa * 10, 0, 0, TAU); ctx.fill(); }
      ctx.restore(); ctx.strokeStyle = '#10181A'; ctx.lineWidth = 8; ctx.beginPath(); ctx.arc(1020, 190, 124, 0, TAU); ctx.stroke(); ctx.globalAlpha = 1;
    }
  } else {                                                                           /* down beside the nearest dome, and out */
    const u = t - T.D, gy = 600, land = csSm(0, 3.4, u), sc = 2400;
    domeDay(ctx, t, gy, sc, false); domeGlitter(ctx, t, gy, sc, 1);
    domeBuilding(ctx, 880, gy + 6, 260, t, { peel: 1 });
    const py = csLerp(230, gy - 74, land);
    domeHeli(ctx, { x: csLerp(420, 360, land), y: py, s: 1.0, t: t, rot: 0.08 * (1 - land), spin: u < 5.4 ? 1 : 1 - csSm(5.4, 8, u), pilot: u < 3.8 });
    if (u > 3.8) csGiraffe(ctx, { x: csLerp(380, 790, csSm(3.8, 7.6, u)), y: gy + 16, s: 0.7, face: 1, walk: u * 8, moving: u < 7.6, neck: 0.22, head: 0.08, bare: true, boots: false });
  }
}
MARS_FILMS.domeflight = {
  end: DOME_FLIGHT_T.END, starts: [0, DOME_FLIGHT_T.B, DOME_FLIGHT_T.C, DOME_FLIGHT_T.D, 0, 0, 0, 0], scene: domeFlightScene,
  over(ctx, t){
    const v = ctx.createRadialGradient(640, 360, 300, 640, 360, 780); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(20,10,0,.34)'); ctx.fillStyle = v; ctx.fillRect(0, 0, CS_W, CS_H);
    marsFilmCaps(ctx, DOME_FLIGHT_CAPS, t, '#9FE8FF');
    const f = marsFilmFade([DOME_FLIGHT_T.B, DOME_FLIGHT_T.C, DOME_FLIGHT_T.D], DOME_FLIGHT_T.END, t); if (f > 0.005){ ctx.fillStyle = 'rgba(0,0,0,' + f + ')'; ctx.fillRect(0, 0, CS_W, CS_H); }
  },
  cues: [[0.4, () => SFX.click()], [1.6, () => SFX.whoosh()], [4.4, () => SFX.whoosh()], [8.0, () => SFX.click()], [14.6, () => SFX.click()], [18.4, () => SFX.zap()], [22.4, () => SFX.whoosh()], [26.4, () => SFX.click()]]
};

/* ---- film 2 (28 s): the domes light up, the helicopter takes off, and the long flight to New York ---- */
const DOME_OUT_T = { B: 7, C: 14, D: 21, END: 28 };
const DOME_OUT_CAPS = [
  [0.8, 'THE HEART OF THE DOME', 'The root crystal cracks. Alarms everywhere', 3.4],
  [4.2, 'TO THE HELICOPTER', 'Run', 2.4],
  [7.6, 'AWAY', 'The domes flare behind her', 3.2],
  [11.0, 'THE TRAIL GOES NORTH', 'The foil on the domes had a stamp: a city name', 3.0],
  [14.6, 'ACROSS THE COUNTRY', 'Dusk, then the lights of towns', 3.4],
  [18.0, 'ALL NIGHT', 'The lights get thicker and thicker', 2.8],
  [21.6, 'NEW YORK CITY', 'The trail ends in the tallest streets she has ever seen', 3.6],
  [25.0, 'LOW OVER THE HARBOR', 'Something here is paying for all of this', 2.8]
];
function domeSkyline(ctx, t, gy, sc, p){                                              /* New York at dusk: towers, a spire, lit windows, the water in front, and the Lady on her island */
  afSky(ctx, '#1A1640', '#B0507A', '#FFB070'); csGlow(ctx, 360, gy - 40, 320, '#FFC890', 0.4);
  const towers = [[40, 120, 70], [130, 220, 56], [200, 160, 76], [290, 300, 50], [350, 190, 80], [440, 380, 58], [500, 250, 70], [590, 170, 84], [690, 330, 60], [760, 230, 78], [850, 420, 54], [920, 260, 80], [1010, 190, 70], [1090, 300, 62], [1170, 210, 84], [1250, 150, 74]];
  towers.forEach((b, i) => {
    const x = b[0] - sc * 0.2 * (1 + (i % 3) * 0.3), top = gy - b[1] * p;
    ctx.fillStyle = i % 2 ? '#1E1830' : '#2A2040'; ctx.fillRect(x - b[2] / 2, top, b[2], b[1] * p + 6);
    for (let k = 0; k < 40; k++){ const wx = x - b[2] / 2 + 6 + (k % 6) * (b[2] - 12) / 6, wy = top + 10 + Math.floor(k / 6) * 16; if (wy > gy - 4 || csR(i * 77 + k) < 0.35) continue; ctx.fillStyle = csR(i * 91 + k) > 0.5 ? '#FFE49A' : '#FFC870'; ctx.fillRect(wx, wy, 5, 7); }
    if (i === 5 || i === 10){ ctx.fillStyle = ctx.fillStyle; ctx.beginPath(); ctx.moveTo(x - 10, top); ctx.lineTo(x, top - 50 * p); ctx.lineTo(x + 10, top); ctx.closePath(); ctx.fillStyle = '#2A2040'; ctx.fill(); fillCircle(ctx, x, top - 52 * p, 2.4, Math.sin(t * 3 + i) > 0 ? '#FF5A4A' : '#5A1A14'); }
  });
  const wg = ctx.createLinearGradient(0, gy, 0, CS_H); wg.addColorStop(0, '#6A3A5A'); wg.addColorStop(1, '#1C1430'); ctx.fillStyle = wg; ctx.fillRect(0, gy, CS_W, CS_H - gy + 2);
  ctx.strokeStyle = 'rgba(255,200,140,.32)'; ctx.lineWidth = 2; for (let k = 0; k < 9; k++){ const y = gy + 14 + k * 18; ctx.beginPath(); for (let x = 0; x <= CS_W; x += 24) ctx.lineTo(x, y + Math.sin(x * 0.04 + t * 2 + k) * 2); ctx.stroke(); }
  const lx = 1080 - sc * 0.1;                                                         /* the statue: a small green figure with a raised arm and a crown of rays */
  ctx.fillStyle = '#243A34'; ctx.fillRect(lx - 24, gy - 8, 48, 14); ctx.fillStyle = '#3C6A5C'; ctx.fillRect(lx - 9, gy - 56, 18, 48); ctx.beginPath(); ctx.arc(lx, gy - 62, 8, 0, TAU); ctx.fill();
  ctx.strokeStyle = '#3C6A5C'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(lx + 6, gy - 52); ctx.lineTo(lx + 16, gy - 82); ctx.stroke(); fillCircle(ctx, lx + 17, gy - 86, 5, '#FFE49A');
  for (let k = -3; k <= 3; k++){ ctx.beginPath(); ctx.moveTo(lx + k * 3, gy - 68); ctx.lineTo(lx + k * 6, gy - 82); ctx.stroke(); }
}
function domeOutScene(ctx, t){
  const T = DOME_OUT_T;
  if (t < T.B){                                                                      /* the dome glows and cracks; she runs to the helicopter, which takes off */
    const u = t, gy = 590, spin = csSm(0, 2.0, u), lift = csSm(4.6, 7, u);
    domeDay(ctx, t, gy, u * 2, true);
    domeBuilding(ctx, 850, gy + 10, 300, t, { warn: csSm(0, 3.4, u) * (0.6 + 0.2 * Math.sin(t * 8)), crack: csSm(0.8, 3.4, u), peel: 1 });
    const flash = Math.sin(t * 9) > 0 ? 0.08 : 0; if (flash){ ctx.fillStyle = 'rgba(255,40,40,' + flash + ')'; ctx.fillRect(0, 0, CS_W, CS_H); }                /* alarm lights */
    const py = gy - 74 - lift * 250, px = 420 + lift * 140;
    if (u < 4.4) csGiraffe(ctx, { x: csLerp(40, 360, csSm(0.8, 4.0, u)), y: gy + 14, s: 0.72, face: 1, walk: u * 9, moving: u < 4.1, neck: 0.4, head: 0.1, bare: true, boots: false });
    domeHeli(ctx, { x: px, y: py, s: 1.0, t: t, rot: -0.1 * lift, spin: 1, pilot: u > 4.2 });
    for (let k = 0; k < 3; k++){ const gx = 1120 + k * 60; ctx.fillStyle = '#1A1A20'; ctx.fillRect(gx - 5, gy - 34, 10, 34); fillCircle(ctx, gx, gy - 40, 6, '#1A1A20'); ctx.fillStyle = 'rgba(255,248,200,.22)'; ctx.beginPath(); ctx.moveTo(gx, gy - 38); ctx.lineTo(gx - 220, gy - 90 - k * 20); ctx.lineTo(gx - 220, gy - 30 - k * 20); ctx.closePath(); ctx.fill(); }   /* guards with torches */
  } else if (t < T.C){                                                               /* away from the domes, the dome flaring behind */
    const u = t - T.B, sc = u * 260, gy = 580, p = csSm(0, 7, u);
    domeDay(ctx, t, gy, sc, true);
    ctx.globalAlpha = 1 - p * 0.6; domeBuilding(ctx, csLerp(300, -140, p), gy - 4, csLerp(210, 60, p), t, { warn: 0.8 + 0.2 * Math.sin(t * 8), crack: 1, peel: 1 }); ctx.globalAlpha = 1;
    domeHeli(ctx, { x: 660 + Math.sin(t * 1.1) * 8, y: 250 + Math.sin(t * 1.7) * 8, s: 1.0, t: t, rot: 0.04, pilot: true });
  } else if (t < T.D){                                                               /* dusk to night over the country: towns as little clusters of light */
    const u = t - T.C, sc = 2000 + u * 300, k = csSm(0, 7, u), gy = 600;
    afSky(ctx, '#1A1640', csLerp(0, 0, 0) ? '#000' : '#5A2A5A', '#E07A5A'); ctx.fillStyle = 'rgba(2,4,16,' + (0.2 + 0.6 * k) + ')'; ctx.fillRect(0, 0, CS_W, CS_H); csStars(ctx, k, t, 0, 0);
    afRidge(ctx, gy - 30, 50, 2.7, '#1C1830', sc * 0.1); afRidge(ctx, gy - 4, 30, 6.1, '#120E22', sc * 0.25);
    ctx.fillStyle = '#0C0A18'; ctx.fillRect(0, gy, CS_W, CS_H - gy + 2);
    for (let i = 0; i < 40; i++){ const x = (((csR(i + 32000) * 2000 - sc * 0.5) % 2000) + 2000) % 2000 - 360, y = gy + 8 + csR(i + 32100) * (CS_H - gy - 14); ctx.globalAlpha = k * (0.4 + 0.5 * csR(i + 32200)); ctx.fillStyle = '#FFD890'; ctx.fillRect(x, y, 3, 3); }
    ctx.globalAlpha = 1;
    domeHeli(ctx, { x: 560 + Math.sin(t * 1.1) * 8, y: 250 + Math.sin(t * 1.7) * 8, s: 1.0, t: t, rot: 0.04, pilot: true });
  } else {                                                                           /* the skyline of New York at dusk, and the helicopter coming in low over the water */
    const u = t - T.D, p = csSm(0, 3, u), gy = 560, sc = u * 40;
    domeSkyline(ctx, t, gy, sc, 0.55 + 0.45 * p);
    const hx = csLerp(-200, 560, csSm(0, 6, u)), hy = csLerp(180, 330, csSm(0, 6, u)) + Math.sin(t * 1.4) * 6;
    domeHeli(ctx, { x: hx, y: hy, s: csLerp(0.8, 1.0, csSm(0, 6, u)), t: t, rot: 0.05, pilot: true });
    ctx.fillStyle = 'rgba(255,250,210,.16)'; ctx.beginPath(); ctx.moveTo(hx + 60, hy + 14); ctx.lineTo(hx + 600, hy + 220); ctx.lineTo(hx + 520, hy + 280); ctx.closePath(); ctx.fill();
  }
}
MARS_FILMS.domeout = {
  end: DOME_OUT_T.END, starts: [0, DOME_OUT_T.B, DOME_OUT_T.C, DOME_OUT_T.D, 0, 0, 0, 0], scene: domeOutScene,
  over(ctx, t){
    const v = ctx.createRadialGradient(640, 360, 300, 640, 360, 780); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(10,6,24,.4)'); ctx.fillStyle = v; ctx.fillRect(0, 0, CS_W, CS_H);
    marsFilmCaps(ctx, DOME_OUT_CAPS, t, '#9FE8FF');
    const f = marsFilmFade([DOME_OUT_T.B, DOME_OUT_T.C, DOME_OUT_T.D], DOME_OUT_T.END, t); if (f > 0.005){ ctx.fillStyle = 'rgba(0,0,0,' + f + ')'; ctx.fillRect(0, 0, CS_W, CS_H); }
  },
  cues: [[0.4, () => SFX.boom()], [1.2, () => SFX.zap()], [2.4, () => SFX.boom()], [4.4, () => SFX.whoosh()], [7.6, () => SFX.whoosh()], [9.0, () => SFX.boom()], [14.6, () => SFX.click()], [21.6, () => SFX.level()], [25.0, () => SFX.whoosh()]]
};
