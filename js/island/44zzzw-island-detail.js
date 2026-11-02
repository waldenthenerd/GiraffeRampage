'use strict';
/* Chapter 17, the Island Lab: the detail layer for the map (the island is in js/island/44zzzt-island-map.js). */
/* Every prop was a few big shapes; this adds the small parts that make it a place. Rocks get limpets, a tide line, weed hanging off them and now and then a crab; coral heads get
   urchins and anemones at their foot; mangroves get seed pods and a nest; palms drop coconuts and an old frond; the boat gets rope, buoys, a fish box and a net; the lab gets gauges,
   valve wheels, dishes, signs, tank labels, drips, fuel cans, tie-downs and cables. The ground gets driftwood, bottles, rope ends, turtle tracks and kelp along the waterline, mangrove
   breathing roots and puddles in the mud, and oil stains, puddles, cable runs, cones and specimen crates on the lab's floor (ilGroundDetail, drawn with the cached ground). What moves is
   drawn live: fish shadows in the shallows and gulls' shadows passing over (ilLiveDetail). Everything is placed from the prop's or the cell's own number (csR), so it is the same every
   frame and on every run. */
function ilR(b, i){ return csR(b.x * 3.1 + b.y * 7.7 + i * 13.7); }
function ilLimpet(ctx, x, y, r){ fillCircle(ctx, x + 0.6, y + 1, r, 'rgba(0,0,0,.25)'); fillCircle(ctx, x, y, r, '#C8BCA8'); ctx.strokeStyle = '#8A7E6A'; ctx.lineWidth = 0.7; ctx.beginPath(); for (let k = 0; k < 6; k++){ const a = k * TAU / 6; ctx.moveTo(x, y); ctx.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r); } ctx.stroke(); fillCircle(ctx, x, y, r * 0.3, '#E8DCC8'); }
function ilSmallCrab(ctx, x, y, a, c){
  ctx.save(); ctx.translate(x, y); ctx.rotate(a);
  ctx.strokeStyle = tw_sh(c, 0.3); ctx.lineWidth = 1.2; ctx.beginPath(); for (const sd of [-1, 1]) for (let k = 0; k < 3; k++){ ctx.moveTo(-2 + k * 2.4, sd * 3); ctx.lineTo(-3 + k * 2.4, sd * 6.6); ctx.lineTo(-4.4 + k * 2.4, sd * 7.6); } ctx.stroke();
  for (const sd of [-1, 1]){ ctx.beginPath(); ctx.moveTo(3, sd * 2.6); ctx.lineTo(6, sd * 4.4); ctx.stroke(); fillCircle(ctx, 6.6, sd * 4.6, 1.6, c); }
  lkOV(ctx, 0, 0, 4.2, 4.8, tw_sh(c, 0.3)); lkOV(ctx, 0, 0, 3.6, 4.2, c); fillCircle(ctx, 3.4, -1.2, 0.7, '#14100C'); fillCircle(ctx, 3.4, 1.2, 0.7, '#14100C');
  ctx.restore();
}
function ilCoconut(ctx, x, y, r){ fillCircle(ctx, x + 1.4, y + 2, r, 'rgba(0,0,0,.25)'); fillCircle(ctx, x, y, r, '#6A4A2A'); fillCircle(ctx, x - r * 0.3, y - r * 0.3, r * 0.45, '#8A6A44'); for (let k = 0; k < 3; k++) fillCircle(ctx, x + Math.cos(k * 2.1) * r * 0.3, y + Math.sin(k * 2.1) * r * 0.3, r * 0.12, '#2A1A0E'); }
function ilGauge(ctx, x, y, r, t, ph){ fillCircle(ctx, x, y, r + 1.4, '#2A3234'); fillCircle(ctx, x, y, r, '#F2F2EC'); ctx.strokeStyle = '#C8402A'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(x, y, r * 0.8, 0.2, 0.9); ctx.stroke(); const a = -2.4 + 1.6 + Math.sin(t * 0.7 + ph) * 0.5; ctx.strokeStyle = '#14161C'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.cos(a) * r * 0.8, y + Math.sin(a) * r * 0.8); ctx.stroke(); fillCircle(ctx, x, y, 1, '#14161C'); }
function ilWheel(ctx, x, y, r, c){ ctx.strokeStyle = '#1A2224'; ctx.lineWidth = 3.4; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.stroke(); ctx.strokeStyle = c; ctx.lineWidth = 2.2; ctx.stroke(); ctx.lineWidth = 1.6; ctx.beginPath(); for (let k = 0; k < 4; k++){ const a = k * Math.PI / 2 + 0.4; ctx.moveTo(x, y); ctx.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r); } ctx.stroke(); fillCircle(ctx, x, y, 2, '#1A2224'); }
function ilSign(ctx, x, y, w, h, bg, fg, text){ ctx.fillStyle = 'rgba(0,0,0,.3)'; ctx.fillRect(x + 2, y + 3, w, h); ctx.fillStyle = bg; ctx.fillRect(x, y, w, h); ctx.strokeStyle = 'rgba(0,0,0,.4)'; ctx.lineWidth = 1; ctx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1); ctx.fillStyle = fg; ctx.font = '800 ' + Math.round(h * 0.6) + 'px ui-sans-serif, sans-serif'; ctx.textAlign = 'center'; ctx.fillText(text, x + w / 2, y + h * 0.75); }
function ilCable(ctx, pts, c){ ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.strokeStyle = 'rgba(0,0,0,.3)'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(pts[0] + 2, pts[1] + 3); for (let i = 2; i < pts.length; i += 2) ctx.quadraticCurveTo(pts[i - 2] + 2 + (pts[i] - pts[i - 2]) * 0.5 + 10, pts[i - 1] + 3 + (pts[i + 1] - pts[i - 1]) * 0.5 + 10, pts[i] + 2, pts[i + 1] + 3); ctx.stroke();
  ctx.strokeStyle = c || '#1A1E22'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(pts[0], pts[1]); for (let i = 2; i < pts.length; i += 2) ctx.quadraticCurveTo(pts[i - 2] + (pts[i] - pts[i - 2]) * 0.5 + 10, pts[i - 1] + (pts[i + 1] - pts[i - 1]) * 0.5 + 10, pts[i], pts[i + 1]); ctx.stroke(); ctx.lineCap = 'butt'; ctx.lineJoin = 'miter'; }

/* ---------------------------------------------------------------- the props */
function ilPropDetail(ctx, b, t){
  const k = b.kind, x = b.x, y = b.y, w = b.w, h = b.h, cx = x + w / 2, cy = y + h / 2;
  if (k === 'rock'){
    ctx.strokeStyle = 'rgba(40,60,50,.45)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(cx, cy + h * 0.06, w * 0.44, h * 0.42, 0, 0.3, Math.PI - 0.3); ctx.stroke();     /* the tide line */
    for (let i = 0; i < 7; i++){ const a = ilR(b, i) * TAU, rr = 0.25 + ilR(b, i + 9) * 0.5; ilLimpet(ctx, cx + Math.cos(a) * w * 0.4 * rr, cy + Math.sin(a) * h * 0.4 * rr, 2.6 + ilR(b, i + 3) * 2); }
    ctx.strokeStyle = '#3E6A34'; ctx.lineWidth = 2; ctx.lineCap = 'round'; ctx.beginPath();                                              /* weed hanging off the seaward side */
    for (let i = 0; i < 9; i++){ const a = 0.5 + i * 0.25, ex = cx + Math.cos(a) * w * 0.44, ey = cy + Math.sin(a) * h * 0.44; ctx.moveTo(ex, ey); ctx.quadraticCurveTo(ex + 3 + Math.sin(t * 1.4 + i) * 2, ey + 6, ex + Math.sin(t + i) * 3, ey + 12 + (i % 3) * 3); }
    ctx.stroke(); ctx.lineCap = 'butt';
    lkOV(ctx, cx - w * 0.12, cy - h * 0.16, w * 0.12, h * 0.07, 'rgba(70,184,192,.85)'); lkOV(ctx, cx - w * 0.14, cy - h * 0.18, w * 0.05, h * 0.025, 'rgba(255,255,255,.6)');       /* a pool on top */
    if (ilR(b, 30) < 0.6) ilSmallCrab(ctx, cx + w * 0.18, cy + h * 0.1, ilR(b, 31) * TAU, '#D8603A');
  } else if (k === 'coral'){
    for (let i = 0; i < 3; i++){ const a = 0.8 + i * 1.9 + ilR(b, i) * 0.5, ux = cx + Math.cos(a) * w * 0.56, uy = cy + Math.sin(a) * h * 0.56;     /* urchins at its foot */
      for (let q = 0; q < 12; q++){ const qa = q * TAU / 12; ctx.strokeStyle = '#2A1A3A'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(ux, uy); ctx.lineTo(ux + Math.cos(qa) * 8, uy + Math.sin(qa) * 8); ctx.stroke(); } fillCircle(ctx, ux, uy, 4, '#3A2A4A'); fillCircle(ctx, ux - 1, uy - 1, 1.4, '#6A5A7A'); }
    const ax = cx - w * 0.3, ay = cy + h * 0.3;                                                                                           /* an anemone tucked against it */
    for (let q = 0; q < 14; q++){ const qa = q * TAU / 14 + Math.sin(t * 1.5 + q) * 0.12; ctx.strokeStyle = '#F2A0C0'; ctx.lineWidth = 2; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(ax + Math.cos(qa) * 9, ay + Math.sin(qa) * 9); ctx.stroke(); } ctx.lineCap = 'butt'; fillCircle(ctx, ax, ay, 3.4, '#C8507A');
    for (let i = 0; i < 6; i++){ const a = ilR(b, i + 40) * TAU, d = 0.62 + ilR(b, i + 50) * 0.2; ctx.fillStyle = 'rgba(244,200,180,.7)'; ctx.fillRect(cx + Math.cos(a) * w * d, cy + Math.sin(a) * h * d, 3, 2); }      /* bits of broken coral */
  } else if (k === 'mangrove'){
    for (let i = 0; i < 8; i++){ const a = ilR(b, i) * TAU, px = cx + Math.cos(a) * w * 0.38, py = cy - 6 + Math.sin(a) * h * 0.36, l = 12 + ilR(b, i + 8) * 8;     /* seed pods hanging from the canopy */
      ctx.strokeStyle = '#4A5A2A'; ctx.lineWidth = 2.4; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px + 1, py + l); ctx.stroke(); fillCircle(ctx, px + 1, py + l, 1.6, '#6A4A2A'); }
    ctx.lineCap = 'butt';
    const nx = cx + w * 0.14, ny = cy - h * 0.14;                                                                                         /* a nest, with two eggs */
    ctx.strokeStyle = '#7A5A34'; ctx.lineWidth = 1.4; for (let q = 0; q < 10; q++){ const qa = q * 0.7; ctx.beginPath(); ctx.arc(nx, ny, 8 + (q % 3), qa, qa + 1.6); ctx.stroke(); }
    fillCircle(ctx, nx - 2, ny, 2.6, '#E8E0C8'); fillCircle(ctx, nx + 2.4, ny + 1, 2.6, '#D8E8E0'); fillCircle(ctx, nx + 2.6, ny + 0.6, 0.6, '#6A7A70');
    if (ilR(b, 20) < 0.7) ilSmallCrab(ctx, cx - w * 0.46, cy + h * 0.3, -0.6, '#A84A2A');
  } else if (k === 'palm'){
    ilCoconut(ctx, cx - 30, cy + 16, 6); ilCoconut(ctx, cx - 22, cy + 24, 5.4);                                                          /* coconuts at the foot (seen past the fronds' edge, they lie in their shade) */
    const fa = ilR(b, 3) * TAU, fx = cx + Math.cos(fa) * 130, fy = cy + Math.sin(fa) * 110;                                                 /* an old frond, brown, on the ground */
    ctx.strokeStyle = '#8A7448'; ctx.lineWidth = 2.4; ctx.beginPath(); ctx.moveTo(fx, fy); ctx.lineTo(fx + Math.cos(fa + 1.2) * 50, fy + Math.sin(fa + 1.2) * 50); ctx.stroke();
    ctx.fillStyle = '#9A845A'; for (let q = 1; q < 9; q++){ const px = fx + Math.cos(fa + 1.2) * q * 6, py = fy + Math.sin(fa + 1.2) * q * 6; for (const sg of [-1, 1]){ const la = fa + 1.2 + sg * 1.1; ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px + Math.cos(la) * 12, py + Math.sin(la) * 12); ctx.lineTo(px + Math.cos(fa + 1.2) * 5, py + Math.sin(fa + 1.2) * 5); ctx.closePath(); ctx.fill(); } }
  } else if (k === 'log'){
    for (let i = 0; i < 6; i++){ const px = x + 16 + ilR(b, i) * (w - 40), py = y + 6 + ilR(b, i + 6) * (h - 12); fillCircle(ctx, px, py, 2.6, '#4A443C'); fillCircle(ctx, px, py, 2, '#D8D0BC'); fillCircle(ctx, px, py, 0.8, '#4A443C'); }   /* barnacles */
    ctx.strokeStyle = '#C8A870'; ctx.lineWidth = 2.4; ctx.beginPath(); ctx.moveTo(x + w * 0.7, y - 1); ctx.lineTo(x + w * 0.72, y + h + 1); ctx.moveTo(x + w * 0.74, y - 1); ctx.lineTo(x + w * 0.76, y + h + 1); ctx.stroke();       /* a rope still round it, and its frayed end */
    ctx.beginPath(); ctx.moveTo(x + w * 0.75, y + h); ctx.quadraticCurveTo(x + w * 0.82, y + h + 16, x + w * 0.9, y + h + 12); ctx.stroke(); ctx.lineWidth = 1; for (let q = -1; q <= 1; q++){ ctx.beginPath(); ctx.moveTo(x + w * 0.9, y + h + 12); ctx.lineTo(x + w * 0.9 + 5, y + h + 12 + q * 3); ctx.stroke(); }
  } else if (k === 'crate'){
    ctx.strokeStyle = '#C8A870'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x - 2, y + h * 0.3); ctx.lineTo(x + w + 2, y + h * 0.3); ctx.moveTo(x + w * 0.7, y - 2); ctx.lineTo(x + w * 0.7, y + h + 2); ctx.stroke(); fillCircle(ctx, x + w * 0.7, y + h * 0.3, 3, '#A8884A');     /* rope, knotted */
    ctx.fillStyle = '#5A3E22'; ctx.beginPath(); ctx.moveTo(x + w, y + h - 14); ctx.lineTo(x + w - 10, y + h); ctx.lineTo(x + w, y + h); ctx.closePath(); ctx.fill(); ctx.fillStyle = '#C8A870'; ctx.fillRect(x + w - 6, y + h - 9, 4, 1.4);       /* a splintered corner */
  } else if (k === 'boat'){
    ctx.save(); ilBoatXf(ctx, b, cx, cy, t);
    ctx.strokeStyle = '#C8A870'; ctx.lineWidth = 2; for (let q = 0; q < 4; q++){ ctx.beginPath(); ctx.arc(w * 0.18, h * 0.12, 4 + q * 3, 0, TAU); ctx.stroke(); }            /* a coil of rope */
    ctx.fillStyle = '#4A7A9A'; ctx.fillRect(w * 0.08, -h * 0.34, 34, 20); ctx.fillStyle = '#8ACAE0'; ctx.fillRect(w * 0.08 + 3, -h * 0.34 + 3, 28, 14);                   /* the fish box, with fish */
    for (let q = 0; q < 3; q++){ const fx = w * 0.08 + 8 + q * 9, fy = -h * 0.34 + 8 + (q % 2) * 4; lkOV(ctx, fx, fy, 4.4, 1.6, '#C8D0D4', 0.3); tw_poly(ctx, [fx - 4, fy - 1, fx - 7, fy - 3, fx - 7, fy + 1], '#C8D0D4'); }
    ctx.fillStyle = 'rgba(80,90,70,.85)'; ctx.beginPath(); ctx.ellipse(-w * 0.4, h * 0.2, 18, 12, 0.3, 0, TAU); ctx.fill(); ctx.strokeStyle = 'rgba(200,190,150,.5)'; ctx.lineWidth = 0.8; for (let q = -3; q <= 3; q++){ ctx.beginPath(); ctx.moveTo(-w * 0.4 - 16, h * 0.2 + q * 3); ctx.lineTo(-w * 0.4 + 16, h * 0.2 + q * 3 + 2); ctx.stroke(); }       /* the net, heaped at the stern */
    for (const sd of [-1, 1]){ ctx.strokeStyle = '#C8A870'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(-w * 0.1, sd * (h / 2 - 8)); ctx.lineTo(-w * 0.1, sd * (h / 2 + 4)); ctx.stroke(); fillCircle(ctx, -w * 0.1, sd * (h / 2 + 8), 5, '#E8682A'); fillCircle(ctx, -w * 0.1 - 1.4, sd * (h / 2 + 8) - 1.4, 1.6, '#FFB890'); }   /* buoys over the side */
    fillCircle(ctx, -w * 0.18, -h * 0.3, 4, '#3A3A3A'); csGlow(ctx, -w * 0.18, -h * 0.3, 16, '#FFF2B0', 0.25 + 0.1 * Math.sin(t * 3)); fillCircle(ctx, -w * 0.18, -h * 0.3, 2, '#FFF2B0');     /* the lantern */
    ctx.restore();
  } else if (k === 'tankhouse'){
    for (let i = 0; i < 3; i++){ const tx = x + w * (0.2 + i * 0.3), ty = y + (h - 38) * 0.5; tw_rect(ctx, tx - 14, ty + 34, 28, 9, '#F2F2EC'); ctx.fillStyle = '#2A3A3C'; ctx.font = '800 7px ui-sans-serif, sans-serif'; ctx.textAlign = 'center'; ctx.fillText('S-' + (17 + i + Math.round(y / 100)), tx, ty + 41); }   /* each tank's label */
    for (const vx of [x + 30, x + w - 40]){ tw_rect(ctx, vx, y + 12, 18, 14, '#3A4A4C'); ctx.fillStyle = '#6A7E80'; for (let q = 0; q < 3; q++) ctx.fillRect(vx + 2, y + 14 + q * 4, 14, 2); }   /* roof vents */
    for (let q = 0; q < 6; q++){ const dx = x + 20 + ilR(b, q) * (w - 40), dy = y + h - 30 - ((t * 20 + q * 17) % 22); fillCircle(ctx, dx, dy, 1.4, 'rgba(200,250,250,.6)'); }     /* condensation running down the glass */
    ctx.strokeStyle = '#2A6A5A'; ctx.lineWidth = 4; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(x + w / 2 + 44, y + h - 4); ctx.bezierCurveTo(x + w / 2 + 70, y + h + 20, x + w / 2 + 30, y + h + 40, x + w / 2 + 90, y + h + 46); ctx.stroke(); ctx.lineCap = 'butt';     /* a hose out of the door */
    fillCircle(ctx, x + w / 2 + 90, y + h + 46, 3.4, '#C8D0D2'); lkOV(ctx, x + w / 2 + 100, y + h + 50, 12, 5, 'rgba(70,184,192,.5)');
  } else if (k === 'pump'){
    ilGauge(ctx, x + w * 0.5, y + 40, 9, t, 0); ilGauge(ctx, x + w * 0.5 + 24, y + 40, 7, t, 2);
    ilWheel(ctx, x + 30, y + h - 60, 10, '#C8402A'); ilWheel(ctx, x + w - 30, y + h - 60, 10, '#C8402A');
    ctx.fillStyle = '#F0C830'; ctx.beginPath(); ctx.moveTo(x + w - 60, y + 20); ctx.lineTo(x + w - 48, y + 42); ctx.lineTo(x + w - 72, y + 42); ctx.closePath(); ctx.fill(); ctx.fillStyle = '#14161C'; ctx.fillRect(x + w - 61, y + 27, 2, 8); ctx.fillRect(x + w - 61, y + 37, 2, 2);   /* the caution sign */
  } else if (k === 'pool'){
    fillCircle(ctx, x + 18, y + h - 18, 9, '#E8682A'); fillCircle(ctx, x + 18, y + h - 18, 5, '#9AA2A4'); for (let q = 0; q < 4; q++){ const a = q * Math.PI / 2 + 0.4; tw_rect(ctx, x + 18 + Math.cos(a) * 7 - 1.6, y + h - 18 + Math.sin(a) * 7 - 1.6, 3.2, 3.2, '#F2F2EC'); }   /* a ring buoy on the rim */
    ilSign(ctx, x + w / 2 - 34, y + h - 12, 68, 12, '#F2F2EC', '#2A6A5A', 'HOLDING ' + (b.x > 2000 ? 'B' : 'A'));
    const fp = (t * 0.25 + ilR(b, 1)) % 1; if (fp < 0.3){ const fx = x + 40 + ilR(b, Math.floor(t * 0.25)) * (w - 80), fy = y + 40 + ilR(b, Math.floor(t * 0.25) + 7) * (h - 80), up = Math.sin(fp / 0.3 * Math.PI);     /* now and then a fin breaks the water */
      ctx.fillStyle = 'rgba(30,40,50,' + (0.8 * up).toFixed(2) + ')'; ctx.beginPath(); ctx.moveTo(fx - 8, fy); ctx.lineTo(fx + 2, fy - 12 * up); ctx.lineTo(fx + 8, fy); ctx.closePath(); ctx.fill(); ctx.strokeStyle = 'rgba(255,255,255,' + (0.6 * up).toFixed(2) + ')'; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.ellipse(fx, fy, 14, 4, 0, 0, TAU); ctx.stroke(); }
  } else if (k === 'lab'){
    const dx = x + w - 100, dy = y + 60; fillCircle(ctx, dx, dy, 22, '#5A6466'); fillCircle(ctx, dx, dy, 19, '#E8ECEE'); ctx.strokeStyle = '#9AA2A4'; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.arc(dx, dy, 12, 0, TAU); ctx.stroke();     /* the dish, turned to the sky */
    tw_ln(ctx, [dx, dy, dx + 10, dy - 10], 2, '#5A6466'); fillCircle(ctx, dx + 10, dy - 10, 3, '#3A4244');
    for (let i = 0; i < 4; i++){ const px = x + 30 + i * 46, py = y + 150; tw_rect(ctx, px, py, 40, 28, '#26343C'); ctx.strokeStyle = '#6A8A9A'; ctx.lineWidth = 1; for (let q = 1; q < 4; q++){ ctx.beginPath(); ctx.moveTo(px + q * 10, py); ctx.lineTo(px + q * 10, py + 28); ctx.stroke(); } ctx.beginPath(); ctx.moveTo(px, py + 14); ctx.lineTo(px + 40, py + 14); ctx.stroke(); }   /* solar panels */
    ilSign(ctx, x + w * 0.2, y + h - 52, 150, 14, '#2A8A7A', '#F2F2EC', 'MARINE RESEARCH');
    tw_rect(ctx, x + w * 0.42 - 6, y + h + 2, 72, 12, '#5A4A3A'); ctx.fillStyle = '#4A3A2A'; for (let q = 0; q < 8; q++) ctx.fillRect(x + w * 0.42 - 4 + q * 9, y + h + 4, 5, 8);           /* the door mat */
  } else if (k === 'gen'){
    for (let q = 0; q < 2; q++){ const fx = x - 26 + q * 14, fy = y + h + 6; tw_rr(ctx, fx, fy, 12, 16, 2, '#C8402A'); tw_rect(ctx, fx + 3, fy - 3, 6, 4, '#3A3A3A'); tw_rect(ctx, fx + 2, fy + 5, 8, 4, '#F2F2EC'); }     /* fuel cans */
    ctx.fillStyle = 'rgba(20,20,20,.3)'; ctx.beginPath(); ctx.ellipse(x + w + 14, y + 24, 20, 10, 0, 0, TAU); ctx.fill(); tw_rect(ctx, x + w - 4, y + 18, 10, 12, '#3A4244');            /* exhaust and its soot */
    for (let q = 0; q < 3; q++){ const ph = (t * 0.6 + q / 3) % 1; ctx.fillStyle = 'rgba(80,80,80,' + (0.35 * (1 - ph)).toFixed(2) + ')'; ctx.beginPath(); ctx.arc(x + w + 8 + ph * 20, y + 22 - ph * 10, 4 + ph * 8, 0, TAU); ctx.fill(); }
  } else if (k === 'heli'){
    for (const [ax, ay] of [[x + 20, y - 18], [x + w - 20, y - 18], [x + 20, y + h + 18], [x + w - 20, y + h + 18]]){ ctx.strokeStyle = '#E8C84A'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(cx + (ax - cx) * 0.4, cy + (ay - cy) * 0.5); ctx.stroke(); fillCircle(ctx, ax, ay, 3.4, '#5A6264'); }    /* tie-downs to the pad */
    for (const sd of [-1, 1]) tw_rect(ctx, x + w * 0.38 - 5, cy + sd * h * 0.42 - 3 + sd * 6, 10, 6, '#E8C84A');                                                                   /* chocks */
  } else if (k === 'booth'){
    tw_ln(ctx, [x + w - 16, y + 6, x + w - 16, y - 30], 2, '#5A6466'); fillCircle(ctx, x + w - 16, y - 30, 3, Math.sin(t * 4) > 0 ? '#FF5A4A' : '#5A2A22');
    ilCable(ctx, [x + 20, y + h, x + 10, y + h + 30, x - 40, y + h + 50]);
  } else if (k === 'basinwall'){
    for (let q = 0; q < 2; q++){ const px = x + (w > h ? 40 + ilR(b, q) * (w - 80) : w / 2), py = y + (w > h ? h / 2 : 30 + ilR(b, q) * (h - 60));       /* cracks, with the sea seeping through */
      ctx.strokeStyle = '#2A3436'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(px - 6, py - 8); ctx.lineTo(px, py); ctx.lineTo(px - 3, py + 6); ctx.lineTo(px + 4, py + 10); ctx.stroke();
      ctx.strokeStyle = 'rgba(90,220,220,.55)'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px + (w > h ? 0 : 12), py + (w > h ? 14 : 0)); ctx.stroke(); }
    ctx.fillStyle = 'rgba(60,110,60,.55)'; for (let q = 0; q < 5; q++) ctx.fillRect(x + ilR(b, q + 20) * (w - 6), y + ilR(b, q + 30) * (h - 6), 5, 3);     /* moss */
  } else if (k === 'tank'){
    for (let q = 0; q < 8; q++){ const a = -0.8 + ilR(b, q) * 1.6, d = w * (0.6 + ilR(b, q + 9) * 0.3); ctx.fillStyle = 'rgba(210,250,250,.7)'; ctx.beginPath(); const gx = cx + Math.cos(a) * d, gy = cy + Math.sin(a) * d; ctx.moveTo(gx, gy); ctx.lineTo(gx + 6, gy + 2); ctx.lineTo(gx + 2, gy + 6); ctx.closePath(); ctx.fill(); }     /* glass on the floor */
    tw_rect(ctx, cx - 18, cy + w / 2 - 2, 36, 10, '#F2F2EC'); ctx.fillStyle = '#C8402A'; ctx.font = '800 8px ui-sans-serif, sans-serif'; ctx.textAlign = 'center'; ctx.fillText(b.x < 2000 ? (b.y < 400 ? 'Z-01' : 'Z-03') : (b.y < 400 ? 'Z-02' : 'Z-04'), cx, cy + w / 2 + 6);
    for (let q = 0; q < 2; q++){ const ca = 2.2 + q * 0.5, sx = cx + Math.cos(ca) * w / 2, sy = cy + Math.sin(ca) * w / 2, sw = Math.sin(t * 2 + q) * 4; ctx.strokeStyle = '#1A2224'; ctx.lineWidth = 2.4; ctx.beginPath(); ctx.moveTo(sx, sy); ctx.quadraticCurveTo(sx - 10 + sw, sy + 12, sx - 6 + sw, sy + 22); ctx.stroke(); if (Math.sin(t * 9 + q * 3) > 0.7){ fillCircle(ctx, sx - 6 + sw, sy + 22, 2, '#FFF6A0'); csGlow(ctx, sx - 6 + sw, sy + 22, 8, '#FFF6A0', 0.5); } }   /* torn cables, sparking */
  } else if (k === 'fence'){
    if (w > 600){ const hx = x + w - 120; ctx.strokeStyle = '#8A9294'; ctx.lineWidth = 1.4; ctx.beginPath(); for (let q = 0; q < 6; q++){ ctx.moveTo(hx + q * 6, y + h / 2); ctx.quadraticCurveTo(hx + q * 6 + 4, y + h + 10, hx + q * 6 - 2, y + h + 16); } ctx.stroke(); }       /* a stretch pulled loose, curling */
    ilSign(ctx, x + 40, y - 6, 46, 12, '#C8402A', '#F2F2EC', 'NO ENTRY');
  }
}

/* ---------------------------------------------------------------- the ground */
/* is (x, y) clear of every prop and pipe by m? (so nothing is dropped on top of one) */
function ilClear(x, y, m){
  for (let i = 0; i < IL.all.length; i++){ const b = IL.all[i]; if (x > b.x - m && x < b.x + b.w + m && y > b.y - m && y < b.y + b.h + m) return false; }
  for (let i = 0; i < IL_PIPES.length; i++){ const p = IL_PIPES[i]; for (let k = 0; k < p.length - 2; k += 2){ const ax = Math.min(p[k], p[k + 2]), bx = Math.max(p[k], p[k + 2]), ay = Math.min(p[k + 1], p[k + 3]), by = Math.max(p[k + 1], p[k + 3]); if (x > ax - m && x < bx + m && y > ay - m && y < by + m) return false; } }
  return true;
}
function ilGroundDetail(ctx, x0, y0, x1, y1, t){
  const gx0 = Math.floor(x0 / 140) * 140, gy0 = Math.floor(y0 / 140) * 140;
  for (let gx = gx0; gx < x1 + 140; gx += 140) for (let gy = gy0; gy < y1 + 140; gy += 140){
    if (gx < 210 || gx > 3980 || gy < 120 || gy > 2990) continue;
    const r = csR(gx * 11.3 + gy * 3.7 + 5), r2 = csR(gx * 2.9 + gy * 13.1 + 8), px = gx + 15 + r * 110, py = gy + 15 + r2 * 110;
    if (isleWet(px, py) || !ilClear(px, py, 34)) continue;
    if (py < 940){                                                                                                    /* the lab's floor */
      if (px < 380 || px > 3820 || (px > ISLE_BASIN.x - 60 && px < ISLE_BASIN.x + ISLE_BASIN.w + 60 && py < ISLE_BASIN.y + ISLE_BASIN.h + 60)) continue;
      if (r < 0.25){ ctx.fillStyle = 'rgba(30,30,34,.22)'; ctx.beginPath(); ctx.ellipse(px, py, 18 + r2 * 14, 9 + r * 10, r2 * 3, 0, TAU); ctx.fill(); ctx.fillStyle = 'rgba(120,90,160,.12)'; ctx.beginPath(); ctx.ellipse(px - 3, py - 2, 8, 4, r2 * 3, 0, TAU); ctx.fill(); }    /* an oil stain */
      else if (r < 0.45){ ctx.fillStyle = 'rgba(70,150,170,.35)'; ctx.beginPath(); ctx.ellipse(px, py, 22 + r2 * 16, 10 + r * 8, r2, 0, TAU); ctx.fill(); ctx.fillStyle = 'rgba(255,255,255,.35)'; ctx.beginPath(); ctx.ellipse(px - 6, py - 2, 7, 1.6, r2, 0, TAU); ctx.fill(); }    /* a puddle */
      else if (r < 0.55){ for (let q = 0; q < 2; q++){ const cx2 = px + q * 18; ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.fillRect(cx2 - 5, py - 3, 13, 12); ctx.fillStyle = '#E8682A'; ctx.beginPath(); ctx.moveTo(cx2, py - 12); ctx.lineTo(cx2 + 6, py + 6); ctx.lineTo(cx2 - 6, py + 6); ctx.closePath(); ctx.fill(); ctx.fillStyle = '#F2F2EC'; ctx.fillRect(cx2 - 3.4, py - 3, 6.8, 2.4); ctx.fillStyle = '#2A2A2A'; ctx.fillRect(cx2 - 8, py + 5, 16, 3); } }    /* cones */
      else if (r < 0.66){ tw_rect(ctx, px - 16, py - 12, 34, 26, 'rgba(0,0,0,.25)'); tw_rect(ctx, px - 18, py - 14, 34, 26, '#6A7E80'); for (let q = 0; q < 6; q++){ const jx = px - 13 + (q % 3) * 10, jy = py - 9 + Math.floor(q / 3) * 11; fillCircle(ctx, jx, jy, 4, '#2A3A3C'); fillCircle(ctx, jx, jy, 3, q % 2 ? 'rgba(122,240,184,.7)' : 'rgba(200,230,230,.7)'); } }    /* a crate of specimen jars */
      continue;
    }
    if (py < 1420){                                                                                                   /* the mangrove mud: breathing roots and puddles */
      if (r < 0.5) for (let q = 0; q < 9; q++){ const qx = px + csR(gx + q * 7) * 40 - 20, qy = py + csR(gy + q * 11) * 30 - 15; fillCircle(ctx, qx, qy, 2.2, '#4A3A24'); fillCircle(ctx, qx - 0.6, qy - 0.6, 1, '#8A7448'); }
      else if (r < 0.7){ ctx.fillStyle = 'rgba(110,96,60,.7)'; ctx.beginPath(); ctx.ellipse(px, py, 20, 9, r2, 0, TAU); ctx.fill(); ctx.fillStyle = 'rgba(180,200,190,.35)'; ctx.beginPath(); ctx.ellipse(px - 4, py - 2, 8, 2, r2, 0, TAU); ctx.fill(); }
      continue;
    }
    const nearWater = isleWet(px, py + 60) || isleWet(px, py - 60) || isleWet(px + 60, py) || isleWet(px - 60, py);
    if (nearWater && r < 0.45){                                                                                       /* kelp washed up along the waterline */
      ctx.strokeStyle = '#3E5A2A'; ctx.lineWidth = 4; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(px - 26, py); ctx.bezierCurveTo(px - 10, py - 10, px + 4, py + 8, px + 24, py - 2); ctx.stroke();
      ctx.strokeStyle = '#5A7A34'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(px - 18, py + 6); ctx.quadraticCurveTo(px, py + 12, px + 16, py + 6); ctx.stroke(); ctx.lineCap = 'butt';
      for (let q = 0; q < 3; q++) fillCircle(ctx, px - 14 + q * 14, py - 1 + (q % 2) * 4, 2.4, '#6A8A3A');
    } else if (r < 0.12){                                                                                             /* a piece of driftwood */
      ctx.save(); ctx.translate(px, py); ctx.rotate(r2 * 3); tw_rr(ctx, -22, -4, 44, 8, 4, '#A8987E'); ctx.strokeStyle = '#7A6A54'; ctx.lineWidth = 0.8; ctx.beginPath(); ctx.moveTo(-18, -1); ctx.lineTo(16, 0); ctx.moveTo(-14, 2); ctx.lineTo(10, 2); ctx.stroke(); tw_ln(ctx, [6, -3, 12, -12], 3, '#A8987E'); ctx.restore();
    } else if (r < 0.18){                                                                                             /* a bottle */
      ctx.save(); ctx.translate(px, py); ctx.rotate(r2 * 6); tw_rr(ctx, -9, -4, 16, 8, 3, 'rgba(60,140,90,.75)'); tw_rect(ctx, 7, -1.6, 6, 3.2, 'rgba(60,140,90,.85)'); tw_rect(ctx, -6, -2.6, 8, 1.4, 'rgba(255,255,255,.5)'); tw_rect(ctx, 12, -2, 2, 4, '#8A6A44'); ctx.restore();
    } else if (r < 0.24){                                                                                             /* turtle tracks, down to the sea */
      ctx.fillStyle = 'rgba(150,126,80,.45)'; for (let q = 0; q < 7; q++){ const ty = py - 30 + q * 10; ctx.fillRect(px - 12, ty, 6, 3); ctx.fillRect(px + 6, ty + 5, 6, 3); } ctx.fillStyle = 'rgba(150,126,80,.25)'; ctx.fillRect(px - 2, py - 30, 4, 70);
    } else if (r < 0.28){                                                                                             /* a frayed end of rope */
      ctx.strokeStyle = '#C8A870'; ctx.lineWidth = 2.4; ctx.beginPath(); ctx.moveTo(px - 20, py); ctx.bezierCurveTo(px - 8, py - 12, px + 4, py + 10, px + 16, py); ctx.stroke(); ctx.lineWidth = 1; for (let q = -1; q <= 1; q++){ ctx.beginPath(); ctx.moveTo(px + 16, py); ctx.lineTo(px + 22, py + q * 3); ctx.stroke(); }
    } else if (r < 0.32){                                                                                             /* a crab's burrow, with the sand balls it threw out */
      fillCircle(ctx, px, py, 4, '#7A6A44'); for (let q = 0; q < 10; q++){ const a = q * 0.63, d = 8 + (q % 3) * 4; fillCircle(ctx, px + Math.cos(a) * d, py + Math.sin(a) * d * 0.7, 1.6, '#C8B480'); }
    }
  }
}

/* ---------------------------------------------------------------- what moves: fish in the shallows, and gulls passing over */
function ilLiveDetail(ctx, x0, y0, x1, y1, t){
  const gx0 = Math.floor(x0 / 260) * 260, gy0 = Math.floor(y0 / 260) * 260;
  for (let gx = gx0; gx < x1 + 260; gx += 260) for (let gy = gy0; gy < y1 + 260; gy += 260){
    const r = csR(gx * 5.1 + gy * 9.3 + 2); if (r > 0.55) continue;
    const ax = gx + 130, ay = gy + 130, sp = 0.3 + r * 0.4, a = t * sp + r * 20, fx = ax + Math.cos(a) * 70, fy = ay + Math.sin(a * 1.3) * 40;
    if (!isleWet(fx, fy)) continue;
    const ang = Math.atan2(Math.cos(a * 1.3) * 1.3 * 40, -Math.sin(a) * 70);
    for (let k = 0; k < (r < 0.2 ? 3 : 1); k++){                                                                      /* a small fish, or a little shoal */
      const ox = fx - Math.cos(ang) * k * 14 + Math.sin(ang) * (k % 2 ? 8 : -8) * (k ? 1 : 0), oy = fy - Math.sin(ang) * k * 14 - Math.cos(ang) * (k % 2 ? 8 : -8) * (k ? 1 : 0);
      ctx.save(); ctx.translate(ox, oy); ctx.rotate(ang); ctx.fillStyle = 'rgba(20,60,70,.32)'; ctx.beginPath(); ctx.ellipse(0, 0, 8, 3, 0, 0, TAU); ctx.fill();
      ctx.beginPath(); ctx.moveTo(-6, 0); ctx.lineTo(-11, -3 + Math.sin(t * 12 + k) * 1.4); ctx.lineTo(-11, 3 + Math.sin(t * 12 + k) * 1.4); ctx.closePath(); ctx.fill(); ctx.restore();
    }
  }
  for (let i = 0; i < 2; i++){                                                                                        /* gulls' shadows crossing the island */
    const p = ((t * 0.018 + i * 0.5) % 1), sx = -200 + p * (ARENA_W + 400), sy = 400 + i * 1300 + Math.sin(t * 0.3 + i) * 200, flap = Math.sin(t * 6 + i) * 4;
    if (sx < x0 - 60 || sx > x1 + 60 || sy < y0 - 60 || sy > y1 + 60) continue;
    ctx.strokeStyle = 'rgba(10,30,40,.22)'; ctx.lineWidth = 4; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(sx - 18, sy - 6 - flap); ctx.quadraticCurveTo(sx - 8, sy - 8, sx, sy); ctx.quadraticCurveTo(sx + 8, sy - 8, sx + 18, sy - 6 - flap); ctx.stroke(); ctx.lineCap = 'butt';
  }
}
