'use strict';
/* The Dome films (Chapter 13.5). */
/* ========================= THE DOME FILMS ========================= */
/* Two films in the same format as the Mars films (MARS_FILMS: end, starts, scene, over, cues): the helicopter from Longneck Town over the mirrored domes
   (after the Chapter 13 films, or when 13.5 is started from the menu), and the escape from the domes to New York City (the end of Chapter 13.5).
   Every frame is a pure function of time. */
/* the town helicopter, side on, nose to the right: a dark green pod with a glass nose, a tail boom with a fin and a tail rotor, skids, and a main rotor on a mast.
   o = { x, y (the middle of the body), s, t, rot, spin (0 to 1: how fast the rotors turn), pilot (the giraffe in the cockpit), light } */
function domeHeli(ctx, o){
  const s = o.s || 1, t = o.t || 0, spin = o.spin === undefined ? 1 : o.spin, pal = o.pal || {}, GREEN = pal.g || '#35543A', GREEN_D = pal.gd || '#223A28', GREEN_L = pal.gl || '#4A7050', GLASS = '#BCE4F0', INK = pal.ink || '#1A2A1E', BAND = pal.band || '#E8C23A';
  const nose = () => { ctx.beginPath(); ctx.moveTo(10, -30); ctx.quadraticCurveTo(52, -34, 76, -6); ctx.quadraticCurveTo(74, 18, 40, 24); ctx.lineTo(10, 24); ctx.closePath(); };
  ctx.save(); ctx.translate(o.x, o.y); ctx.rotate(o.rot || 0); ctx.scale(s, s);
  /* skids, behind the body: two struts bolted under the belly, a runner with an upturned toe, and a cross tube */
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.strokeStyle = INK; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(-42, 34); ctx.lineTo(-52, 62); ctx.moveTo(32, 38); ctx.lineTo(42, 62); ctx.stroke();
  ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(-80, 56); ctx.quadraticCurveTo(-78, 65, -68, 65); ctx.lineTo(64, 65); ctx.quadraticCurveTo(80, 65, 88, 50); ctx.stroke();
  ctx.strokeStyle = '#4A5A4E'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(-66, 63); ctx.lineTo(62, 63); ctx.stroke();
  ctx.strokeStyle = INK; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-47, 48); ctx.lineTo(-47, 60); ctx.moveTo(37, 52); ctx.lineTo(37, 61); ctx.stroke();      /* the cross-tube clamps */
  fillCircle(ctx, -42, 36, 3.2, '#8A948C'); fillCircle(ctx, 32, 40, 3.2, '#8A948C');                                                                     /* the bolts */
  ctx.lineCap = 'butt'; ctx.lineJoin = 'miter';
  /* tail boom, fin, stabiliser */
  ctx.fillStyle = GREEN; ctx.beginPath(); ctx.moveTo(-40, -16); ctx.lineTo(-196, -26); ctx.lineTo(-196, -12); ctx.lineTo(-40, 14); ctx.closePath(); ctx.fill();
  ctx.fillStyle = GREEN_D; ctx.beginPath(); ctx.moveTo(-40, 2); ctx.lineTo(-196, -16); ctx.lineTo(-196, -12); ctx.lineTo(-40, 14); ctx.closePath(); ctx.fill();
  ctx.fillStyle = GREEN_L; ctx.beginPath(); ctx.moveTo(-40, -16); ctx.lineTo(-196, -26); ctx.lineTo(-196, -23); ctx.lineTo(-40, -11); ctx.closePath(); ctx.fill();                  /* the sun on top of the boom */
  ctx.strokeStyle = '#162418'; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(-40, -2); ctx.lineTo(-196, -19); ctx.stroke();                                              /* the strake */
  for (let k = 0; k < 9; k++){ const bx = -52 - k * 15; fillCircle(ctx, bx, -14 - (k * 15 + 12) * 0.064 + 3, 1.1, '#6E8A74'); }                                              /* rivets */
  ctx.fillStyle = BAND; ctx.beginPath(); ctx.moveTo(-120, -22); ctx.lineTo(-136, -23); ctx.lineTo(-136, -4); ctx.lineTo(-120, -2); ctx.closePath(); ctx.fill();      /* the town's yellow band */
  ctx.fillStyle = '#B8921E'; ctx.beginPath(); ctx.moveTo(-136, -23); ctx.lineTo(-139, -23.4); ctx.lineTo(-139, -4); ctx.lineTo(-136, -4); ctx.closePath(); ctx.fill();
  ctx.fillStyle = GREEN; ctx.beginPath(); ctx.moveTo(-178, -24); ctx.lineTo(-206, -70); ctx.lineTo(-190, -72); ctx.lineTo(-162, -26); ctx.closePath(); ctx.fill();
  ctx.fillStyle = GREEN_D; ctx.beginPath(); ctx.moveTo(-170, -24); ctx.lineTo(-198, -68); ctx.lineTo(-190, -72); ctx.lineTo(-162, -26); ctx.closePath(); ctx.fill();
  ctx.fillStyle = GREEN_L; ctx.beginPath(); ctx.moveTo(-178, -24); ctx.lineTo(-206, -70); ctx.lineTo(-203, -70); ctx.lineTo(-174, -25); ctx.closePath(); ctx.fill();
  ctx.fillStyle = GREEN_D; ctx.beginPath(); ctx.moveTo(-170, -12); ctx.lineTo(-190, 4); ctx.lineTo(-178, 6); ctx.lineTo(-156, -10); ctx.closePath(); ctx.fill();                  /* the stabiliser */
  ctx.strokeStyle = BAND; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-197, -60); ctx.lineTo(-191, -68); ctx.stroke();                                              /* the fin tip */
  /* tail rotor, on a gearbox at the top of the fin */
  const ta = t * 38 * spin;
  fillRoundBox(ctx, -203, -60, 10, 14, 3, '#121C14');
  ctx.fillStyle = '#10181288'; ctx.beginPath(); ctx.ellipse(-198, -54, 4 + 3 * (1 - spin), 26, 0, 0, TAU); ctx.fill();
  ctx.strokeStyle = '#141E16'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(-198, -54 - Math.cos(ta) * 24); ctx.lineTo(-198, -54 + Math.cos(ta) * 24); ctx.stroke();
  fillCircle(ctx, -198, -54, 4.4, '#C8D0C0'); fillCircle(ctx, -198, -54, 1.6, '#5A645C');
  /* the body */
  ctx.fillStyle = GREEN_D; ctx.beginPath(); ctx.ellipse(0, 6, 76, 42, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = GREEN; ctx.beginPath(); ctx.ellipse(0, 0, 76, 40, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = GREEN_L; ctx.beginPath(); ctx.ellipse(-8, -14, 56, 14, -0.06, 0, TAU); ctx.fill();
  ctx.fillStyle = GREEN_D; ctx.beginPath(); ctx.ellipse(-4, 24, 66, 14, 0, 0, TAU); ctx.fill();                                      /* the darker belly */
  ctx.strokeStyle = '#162418'; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(-70, 14); ctx.quadraticCurveTo(-30, 17, 10, 17); ctx.stroke();                                  /* a waist panel line */
  ctx.fillStyle = GREEN_D; ctx.beginPath(); ctx.moveTo(-36, -36); ctx.quadraticCurveTo(-16, -62, 16, -52); ctx.lineTo(26, -34); ctx.closePath(); ctx.fill();      /* the engine hump */
  ctx.fillStyle = GREEN; ctx.beginPath(); ctx.moveTo(-32, -36); ctx.quadraticCurveTo(-14, -57, 12, -49); ctx.lineTo(20, -36); ctx.closePath(); ctx.fill();
  ctx.fillStyle = GREEN_L; ctx.beginPath(); ctx.moveTo(-30, -38); ctx.quadraticCurveTo(-14, -56, 8, -50); ctx.lineTo(8, -47); ctx.quadraticCurveTo(-12, -52, -28, -35); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = INK; ctx.lineWidth = 2; for (let k = 0; k < 4; k++){ ctx.beginPath(); ctx.moveTo(-24 + k * 9, -45 + k * 1.6); ctx.lineTo(-20 + k * 9, -38); ctx.stroke(); }   /* the intake grille */
  ctx.fillStyle = '#10181A'; ctx.beginPath(); ctx.moveTo(-34, -42); ctx.lineTo(-46, -46); ctx.lineTo(-46, -39); ctx.lineTo(-34, -36); ctx.closePath(); ctx.fill();                  /* the exhaust stub */
  ctx.fillStyle = '#3A3A36'; ctx.beginPath(); ctx.ellipse(-46, -42.5, 1.8, 3.6, 0, 0, TAU); ctx.fill();
  ctx.strokeStyle = '#0E1610'; ctx.lineWidth = 1.3; ctx.beginPath(); ctx.moveTo(-18, -52); ctx.lineTo(-30, -84); ctx.stroke(); fillCircle(ctx, -30, -84, 2, Math.sin(t * 5) > 0 ? '#FF5A4A' : '#5A1A14');   /* the antenna */
  /* the side door: a frame, a window and a handle */
  ctx.strokeStyle = '#162418'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-34, -18); ctx.lineTo(-34, 30); ctx.moveTo(-4, -22); ctx.lineTo(-4, 34); ctx.stroke();
  const dg = ctx.createLinearGradient(-32, -18, -6, 4); dg.addColorStop(0, '#9CC8D6'); dg.addColorStop(1, '#456A7A');
  ctx.fillStyle = dg; ctx.beginPath(); ctx.moveTo(-31, -15); ctx.lineTo(-8, -17); ctx.lineTo(-8, 3); ctx.lineTo(-31, 3); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = '#162418'; ctx.lineWidth = 2; ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,.4)'; ctx.beginPath(); ctx.moveTo(-28, -13); ctx.lineTo(-20, -14); ctx.lineTo(-25, 1); ctx.lineTo(-28, 1); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#C8D0C0'; ctx.fillRect(-31, 9, 8, 3); ctx.fillStyle = '#6A7468'; ctx.fillRect(-31, 11.2, 8, 0.8);                                                    /* a door handle */
  fillCircle(ctx, -19, 26, 6.4, BAND); fillCircle(ctx, -19, 26, 4.6, GREEN_D); fillCircle(ctx, -19, 26, 1.8, BAND);                                              /* the town's badge */
  for (let k = 0; k < 6; k++) fillCircle(ctx, 8 + k * 8, 28 - k * 0.5 - (k > 3 ? (k - 3) * 2 : 0), 1, '#6E8A74');                                                            /* rivets */
  /* the glass nose and the cockpit */
  const gg = ctx.createLinearGradient(20, -34, 70, 22); gg.addColorStop(0, '#E4F8FF'); gg.addColorStop(0.5, GLASS); gg.addColorStop(1, '#6EA6BC');
  ctx.fillStyle = gg; nose(); ctx.fill();
  ctx.save(); nose(); ctx.clip();
  ctx.fillStyle = '#2A3A30'; ctx.beginPath(); ctx.moveTo(8, -6); ctx.quadraticCurveTo(16, -10, 22, 0); ctx.lineTo(24, 24); ctx.lineTo(8, 24); ctx.closePath(); ctx.fill();         /* the seat back, behind her */
  if (o.pilot){                                                                                                                    /* the giraffe, her neck bent forward under the glass */
    csGiraffe(ctx, { x: 6, y: 52, s: 0.44, face: 1, neck: 0.55, head: 0.35, crouch: 14, bare: true, boots: false });
  }
  ctx.fillStyle = '#1E2A22'; ctx.beginPath(); ctx.moveTo(30, 14); ctx.quadraticCurveTo(60, 8, 80, 12); ctx.lineTo(80, 30); ctx.lineTo(30, 30); ctx.closePath(); ctx.fill();            /* the dashboard */
  ctx.fillStyle = '#6AE0A0'; ctx.fillRect(44, 14.4, 4, 2); ctx.fillStyle = '#FFC24A'; ctx.fillRect(52, 13.8, 4, 2); ctx.fillStyle = '#FF6A5A'; ctx.fillRect(60, 13.2, 3, 2);
  ctx.fillStyle = 'rgba(255,255,255,.5)'; ctx.beginPath(); ctx.moveTo(14, -28); ctx.lineTo(32, -32); ctx.lineTo(24, 8); ctx.lineTo(14, 8); ctx.closePath(); ctx.fill();                  /* a reflection */
  ctx.fillStyle = 'rgba(255,255,255,.28)'; ctx.beginPath(); ctx.moveTo(40, -26); ctx.lineTo(48, -26); ctx.lineTo(40, -2); ctx.lineTo(36, -2); ctx.closePath(); ctx.fill();
  ctx.restore();
  ctx.strokeStyle = INK; ctx.lineWidth = 3.4; ctx.lineJoin = 'round'; nose(); ctx.stroke(); ctx.lineJoin = 'miter';
  ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(34, -33); ctx.lineTo(30, 24); ctx.moveTo(10, -6); ctx.quadraticCurveTo(44, -8, 75, -4); ctx.stroke();                                  /* the window posts */
  ctx.fillStyle = '#6A8470'; ctx.beginPath(); ctx.moveTo(6, -34); ctx.quadraticCurveTo(40, -42, 52, -36); ctx.lineTo(52, -33); ctx.quadraticCurveTo(40, -37, 6, -29); ctx.closePath(); ctx.fill();   /* the brow above the glass */
  /* lights: the landing light on the nose, the red beacon on the tail */
  if (o.light !== false){ const on = Math.sin(t * 7) > 0; fillCircle(ctx, 72, 16, 4.6, '#3A3A30'); fillCircle(ctx, 72, 16, 3.2, on ? '#FFF2B0' : '#7A7A58'); fillCircle(ctx, -196, -19, 3, on ? '#FF4A3A' : '#5A1A14'); }
  /* the main rotor: a mast, a swashplate, a hub with blade grips, a soft disc when it is fast and two long blades with yellow tips when it is slow */
  ctx.fillStyle = '#1A2A1E'; ctx.fillRect(-5, -60, 10, 14); ctx.fillStyle = '#2A3A2E'; ctx.fillRect(-9, -50, 18, 4); ctx.strokeStyle = '#6A7A6E'; ctx.lineWidth = 1.4;
  ctx.beginPath(); ctx.moveTo(-7, -50); ctx.lineTo(-12, -62); ctx.moveTo(7, -50); ctx.lineTo(12, -62); ctx.stroke();                                                                  /* pitch links */
  const ra = t * 30 * spin, bl = Math.cos(ra) * 214;
  ctx.fillStyle = 'rgba(20,30,24,' + (0.16 * spin) + ')'; ctx.beginPath(); ctx.ellipse(0, -62, 216, 9 + 3 * spin, 0, 0, TAU); ctx.fill();
  if (spin > 0.5){ ctx.strokeStyle = 'rgba(232,194,58,' + (0.3 * spin) + ')'; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(0, -62, 214, 8 + 3 * spin, 0, 0, TAU); ctx.stroke(); }
  const by = Math.sin(ra) * 4;
  ctx.lineCap = 'round'; ctx.strokeStyle = '#121C14'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(-bl, -62 + by); ctx.lineTo(bl, -62 - by); ctx.stroke();
  ctx.strokeStyle = BAND; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(-bl, -62 + by); ctx.lineTo(-bl * 0.88, -62 + by * 0.88); ctx.moveTo(bl, -62 - by); ctx.lineTo(bl * 0.88, -62 - by * 0.88); ctx.stroke();
  ctx.strokeStyle = '#2A3A2E'; ctx.lineWidth = 9; ctx.beginPath(); ctx.moveTo(-bl * 0.1, -62 + by * 0.1); ctx.lineTo(bl * 0.1, -62 - by * 0.1); ctx.stroke(); ctx.lineCap = 'butt';           /* the blade grips */
  fillCircle(ctx, 0, -62, 7, '#10181A'); fillCircle(ctx, 0, -62, 3, '#5A6A5E');
  ctx.restore();
}
/* a filled rounded box, for small hardware */
function fillRoundBox(ctx, x, y, w, h, r, col){
  ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y); ctx.quadraticCurveTo(x + w, y, x + w, y + r); ctx.lineTo(x + w, y + h - r); ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h); ctx.quadraticCurveTo(x, y + h, x, y + h - r); ctx.lineTo(x, y + r); ctx.quadraticCurveTo(x, y, x + r, y); ctx.closePath(); ctx.fill();
}
/* a mirrored dome, side on: a concrete footing, a steel ring with rivets, a hemisphere wrapped in mylar (a silver skin that throws the sun back in bright streaks), ribs, an airlock with a door,
   vent stacks and a mast that stand on the skin, and floodlights.
   o = { peel (0 to 1: a torn patch of foil curled back to show the frost and the cold glow behind it), warn (0 to 1: the whole dome glowing from inside), crack } */
function domeBuilding(ctx, x, gy, R, t, o){
  o = o || {};
  const ry = R * 0.86, ringH = Math.max(8, R * 0.09), peel = o.peel || 0, warn = o.warn || 0, lw = Math.max(1.2, R * 0.012);
  const sy = (px) => -ry * Math.sqrt(Math.max(0, 1 - (px / R) * (px / R)));                                                               /* the height of the skin at a distance px from the middle */
  ctx.save(); ctx.translate(x, gy);
  ctx.fillStyle = 'rgba(40,24,10,.28)'; ctx.beginPath(); ctx.ellipse(R * 0.14, 2, R * 1.12, R * 0.07, 0, 0, TAU); ctx.fill();            /* its shadow on the ground */
  ctx.fillStyle = '#8E887A'; ctx.fillRect(-R * 1.1, -ringH * 0.4, R * 2.2, ringH * 0.4 + 3); ctx.fillStyle = '#B0AA9A'; ctx.fillRect(-R * 1.1, -ringH * 0.4, R * 2.2, Math.max(1.5, R * 0.01));   /* the concrete footing */
  ctx.save(); ctx.beginPath(); ctx.ellipse(0, 0, R, ry, 0, Math.PI, 0); ctx.closePath(); ctx.clip();
  const g = ctx.createLinearGradient(-R, -ry, R, 0); g.addColorStop(0, '#F4F8FA'); g.addColorStop(0.45, '#C4CFD6'); g.addColorStop(1, '#7E8E9A'); ctx.fillStyle = g; ctx.fillRect(-R, -ry, R * 2, ry);
  for (let k = 0; k < 26; k++){                                                                                                           /* crinkled foil: patches that catch the light differently */
    const a = csR(k + 31000) * Math.PI, rr = csR(k + 31100) * 0.9 * R, px = -Math.cos(a) * rr, py = -Math.sin(a) * rr * 0.86, sz = R * (0.1 + csR(k + 31200) * 0.14), br = csR(k + 31300);
    ctx.fillStyle = br > 0.5 ? 'rgba(255,252,236,' + (0.16 + br * 0.2) + ')' : 'rgba(60,76,92,' + (0.1 + br * 0.14) + ')';
    ctx.beginPath(); ctx.moveTo(px, py - sz); ctx.lineTo(px + sz * 0.8, py + sz * 0.4); ctx.lineTo(px - sz * 0.9, py + sz * 0.6); ctx.closePath(); ctx.fill();
  }
  const rg = ctx.createRadialGradient(-R * 0.36, -ry * 0.58, R * 0.04, -R * 0.1, -ry * 0.3, R * 1.15); rg.addColorStop(0, 'rgba(255,255,255,.5)'); rg.addColorStop(0.35, 'rgba(255,255,255,0)'); rg.addColorStop(1, 'rgba(24,40,58,.4)');
  ctx.fillStyle = rg; ctx.fillRect(-R, -ry, R * 2, ry);                                                                                  /* the round of the dome: a bright shoulder and a dark far edge */
  ctx.strokeStyle = 'rgba(40,58,74,.55)'; ctx.lineWidth = lw;                                                                            /* the ribs and rings of the frame */
  for (let k = 1; k < 7; k++){ ctx.beginPath(); ctx.ellipse(0, 0, R * k / 7, ry, 0, Math.PI, 0); ctx.stroke(); }
  for (let k = 1; k < 5; k++){ ctx.beginPath(); ctx.ellipse(0, 0, R, ry * k / 5, 0, Math.PI, 0); ctx.stroke(); }
  const sw = ((t * 0.22 + R * 0.002) % 1.4) - 0.2;                                                                                       /* a streak of sun sweeping across the foil */
  if (sw > -0.1 && sw < 1.1){ ctx.fillStyle = 'rgba(255,252,220,.42)'; const bx = -R + sw * R * 2; ctx.beginPath(); ctx.moveTo(bx, -ry); ctx.lineTo(bx + R * 0.18, -ry); ctx.lineTo(bx + R * 0.05, 0); ctx.lineTo(bx - R * 0.13, 0); ctx.closePath(); ctx.fill(); }
  if (peel > 0.01){                                                                                                                       /* a torn patch: the foil is curled back around a ragged hole onto frost and a cold glow */
    const fx = -R * 0.34, fy = -ry * 0.5, rw = R * 0.2 * peel, rh = R * 0.15 * peel, pts = [];
    for (let k = 0; k < 12; k++){ const a = k / 12 * TAU, j = 0.74 + 0.4 * csR(k + 31400); pts.push([fx + Math.cos(a) * rw * j, fy + Math.sin(a) * rh * j]); }
    const hp = () => { ctx.beginPath(); pts.forEach((q, i) => i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1])); ctx.closePath(); };
    const hg = ctx.createRadialGradient(fx, fy, rw * 0.5, fx, fy, rw * 2.6); hg.addColorStop(0, 'rgba(150,240,255,.55)'); hg.addColorStop(1, 'rgba(150,240,255,0)'); ctx.fillStyle = hg; ctx.fillRect(fx - rw * 2.7, fy - rw * 2.7, rw * 5.4, rw * 5.4);   /* the cold spills onto the foil */
    ctx.strokeStyle = 'rgba(40,58,74,.5)'; ctx.lineWidth = Math.max(1, lw * 0.8); for (let k = 0; k < 12; k += 2){ const q = pts[k]; ctx.beginPath(); ctx.moveTo(q[0], q[1]); ctx.lineTo(fx + (q[0] - fx) * (2.0 + 0.5 * csR(k + 31450)), fy + (q[1] - fy) * (2.0 + 0.5 * csR(k + 31450))); ctx.stroke(); }   /* creases pulled into the foil */
    hp(); const ig = ctx.createRadialGradient(fx, fy, 0, fx, fy, rw * 1.1); ig.addColorStop(0, '#EAFFFF'); ig.addColorStop(0.45, '#7FDCEE'); ig.addColorStop(1, '#0F3244'); ctx.fillStyle = ig; ctx.fill();
    ctx.save(); hp(); ctx.clip();
    ctx.strokeStyle = 'rgba(255,255,255,.9)'; ctx.lineWidth = Math.max(1, rw * 0.05);                                                      /* frost ferns growing in from the edge */
    for (let k = 0; k < 12; k += 2){ const q = pts[k], mx = fx + (q[0] - fx) * 0.45, my = fy + (q[1] - fy) * 0.45; ctx.beginPath(); ctx.moveTo(q[0], q[1]); ctx.lineTo(mx, my); ctx.stroke();
      for (const sgn of [-1, 1]){ ctx.beginPath(); ctx.moveTo((q[0] + mx) / 2, (q[1] + my) / 2); ctx.lineTo((q[0] + mx) / 2 + sgn * rh * 0.28, (q[1] + my) / 2 + rh * 0.12); ctx.stroke(); } }
    ctx.fillStyle = 'rgba(255,255,255,.55)'; for (let k = 0; k < 9; k++) fillCircle(ctx, fx + (csR(k + 31500) - 0.5) * rw * 1.4, fy + (csR(k + 31510) - 0.5) * rh * 1.4, Math.max(0.8, rw * 0.04), 'rgba(255,255,255,.7)');
    ctx.restore();
    hp(); ctx.strokeStyle = '#17303E'; ctx.lineWidth = Math.max(1.6, lw * 1.4); ctx.lineJoin = 'round'; ctx.stroke();
    for (const k of [6, 8]){                                                                                                       /* flaps of foil, curled back from the torn edge: a bright face and a darker underside */
      const A = pts[k], B = pts[(k + 1) % 12], mx = (A[0] + B[0]) / 2, my = (A[1] + B[1]) / 2, nx = mx - fx, ny = my - fy, nl = Math.hypot(nx, ny) || 1, len = rw * (0.4 + 0.2 * csR(k + 31600));
      const ex = B[0] - A[0], ey = B[1] - A[1], ox = nx / nl, oy = ny / nl, t1x = A[0] + ox * len * 0.62 + ex * 0.12, t1y = A[1] + oy * len * 0.62 - len * 0.12 + ey * 0.12, t2x = B[0] + ox * len * 0.5 - ex * 0.12, t2y = B[1] + oy * len * 0.5 - len * 0.1 - ey * 0.12;
      ctx.fillStyle = '#8F9EAA'; ctx.beginPath(); ctx.moveTo(A[0], A[1]); ctx.lineTo(A[0] + ox * len * 0.22, A[1] + oy * len * 0.22 + len * 0.08); ctx.lineTo(B[0] + ox * len * 0.22, B[1] + oy * len * 0.22 + len * 0.08); ctx.lineTo(B[0], B[1]); ctx.closePath(); ctx.fill();
      const fg2 = ctx.createLinearGradient(A[0], A[1], t1x, t1y); fg2.addColorStop(0, '#F2F6F8'); fg2.addColorStop(1, '#B4C2CC'); ctx.fillStyle = fg2; ctx.beginPath(); ctx.moveTo(A[0], A[1]); ctx.quadraticCurveTo(t1x, t1y - len * 0.1, (t1x + t2x) / 2, (t1y + t2y) / 2 - len * 0.12); ctx.quadraticCurveTo(t2x, t2y - len * 0.1, B[0], B[1]); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = 'rgba(40,58,74,.7)'; ctx.lineWidth = Math.max(1, lw * 0.7); ctx.stroke();
    }
    ctx.lineJoin = 'miter';
  }
  if (warn > 0.01){ const wg = ctx.createRadialGradient(0, -ry * 0.3, R * 0.1, 0, -ry * 0.3, R * 1.1); wg.addColorStop(0, 'rgba(150,245,255,' + (0.8 * warn) + ')'); wg.addColorStop(1, 'rgba(60,170,230,' + (0.15 * warn) + ')'); ctx.fillStyle = wg; ctx.fillRect(-R, -ry, R * 2, ry); }
  if (o.crack){ ctx.strokeStyle = 'rgba(220,255,255,' + Math.min(1, o.crack) + ')'; ctx.lineWidth = Math.max(2, R * 0.02); ctx.lineCap = 'round'; for (let k = 0; k < 6; k++){ const a = Math.PI * (0.18 + k * 0.13); ctx.beginPath(); ctx.moveTo(Math.cos(a) * R * 0.2, -Math.sin(a) * ry * 0.2); ctx.lineTo(Math.cos(a) * R * (0.5 + 0.1 * (k % 2)), -Math.sin(a) * ry * (0.55 + 0.1 * (k % 3))); ctx.stroke(); } ctx.lineCap = 'butt'; }
  ctx.restore();
  ctx.strokeStyle = '#33485A'; ctx.lineWidth = Math.max(2, R * 0.024); ctx.beginPath(); ctx.ellipse(0, 0, R, ry, 0, Math.PI, 0); ctx.stroke();
  /* the steel ring it stands on, with a lip, panel seams and rivets */
  ctx.fillStyle = '#4A5E6E'; ctx.fillRect(-R * 1.04, -ringH, R * 2.08, ringH); ctx.fillStyle = '#6A8090'; ctx.fillRect(-R * 1.04, -ringH, R * 2.08, ringH * 0.3); ctx.fillStyle = '#34444F'; ctx.fillRect(-R * 1.04, -ringH * 0.12, R * 2.08, ringH * 0.12);
  if (R > 50){ const n = Math.round(R / 14); ctx.strokeStyle = 'rgba(20,32,42,.6)'; ctx.lineWidth = 1; for (let k = 1; k < n; k++){ const px = -R * 1.04 + k * R * 2.08 / n; ctx.beginPath(); ctx.moveTo(px, -ringH * 0.7); ctx.lineTo(px, -ringH * 0.12); ctx.stroke(); fillCircle(ctx, px + 3, -ringH * 0.45, Math.max(0.9, R * 0.006), '#A8BCC8'); } }
  /* the airlock: a rounded porch against the skin with a flange, a door with a frosted window, a hazard stripe and a lamp */
  const ax = R * 0.22, aw = R * 0.3, ah = ringH + R * 0.2, ar = aw * 0.34;
  ctx.fillStyle = '#3A4C5A'; ctx.beginPath(); ctx.moveTo(ax - 3, 0); ctx.lineTo(ax - 3, -ah + ar); ctx.quadraticCurveTo(ax - 3, -ah - 3, ax + ar, -ah - 3); ctx.lineTo(ax + aw - ar + 3, -ah - 3); ctx.quadraticCurveTo(ax + aw + 3, -ah - 3, ax + aw + 3, -ah + ar); ctx.lineTo(ax + aw + 3, 0); ctx.closePath(); ctx.fill();   /* the flange */
  const pg = ctx.createLinearGradient(ax, -ah, ax + aw, 0); pg.addColorStop(0, '#8CA2B2'); pg.addColorStop(1, '#52687A');
  ctx.fillStyle = pg; ctx.beginPath(); ctx.moveTo(ax, 0); ctx.lineTo(ax, -ah + ar); ctx.quadraticCurveTo(ax, -ah, ax + ar, -ah); ctx.lineTo(ax + aw - ar, -ah); ctx.quadraticCurveTo(ax + aw, -ah, ax + aw, -ah + ar); ctx.lineTo(ax + aw, 0); ctx.closePath(); ctx.fill();
  const dx0 = ax + aw * 0.18, dw = aw * 0.64, dh = ah * 0.72;
  ctx.fillStyle = '#16222C'; ctx.fillRect(dx0, -dh, dw, dh); ctx.strokeStyle = '#B4C6D2'; ctx.lineWidth = Math.max(1.2, R * 0.01); ctx.strokeRect(dx0, -dh, dw, dh);
  ctx.fillStyle = 'rgba(160,236,255,.8)'; ctx.fillRect(dx0 + dw * 0.2, -dh * 0.86, dw * 0.6, dh * 0.3); ctx.strokeStyle = 'rgba(255,255,255,.85)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(dx0 + dw * 0.3, -dh * 0.8); ctx.lineTo(dx0 + dw * 0.5, -dh * 0.62); ctx.moveTo(dx0 + dw * 0.7, -dh * 0.84); ctx.lineTo(dx0 + dw * 0.55, -dh * 0.6); ctx.stroke();
  ctx.fillStyle = '#C8D4DC'; ctx.fillRect(dx0 + dw * 0.78, -dh * 0.42, Math.max(2, dw * 0.08), Math.max(3, dh * 0.12));
  ctx.save(); ctx.beginPath(); ctx.rect(dx0, -dh * 0.14, dw, dh * 0.14); ctx.clip(); ctx.fillStyle = '#E8C23A'; ctx.fillRect(dx0, -dh * 0.14, dw, dh * 0.14); ctx.fillStyle = '#16222C'; for (let k = -2; k < 10; k++){ ctx.beginPath(); ctx.moveTo(dx0 + k * dw * 0.14, 0); ctx.lineTo(dx0 + k * dw * 0.14 + dw * 0.07, 0); ctx.lineTo(dx0 + k * dw * 0.14 + dw * 0.14, -dh * 0.14); ctx.lineTo(dx0 + k * dw * 0.14 + dw * 0.07, -dh * 0.14); ctx.closePath(); ctx.fill(); } ctx.restore();
  fillCircle(ctx, ax + aw / 2, -ah + ar * 0.5, Math.max(2, R * 0.016), Math.sin(t * 4 + R) > 0 ? '#FF5A4A' : '#6A2A24');
  /* two vent stacks standing on the skin: a flange that follows the curve, a pipe and a hooded cap */
  for (const [vp, vw, vh] of [[-R * 0.62, R * 0.07, R * 0.15], [-R * 0.42, R * 0.05, R * 0.1]]){
    const by = sy(vp), vg = ctx.createLinearGradient(vp - vw, 0, vp + vw, 0); vg.addColorStop(0, '#8CA0B0'); vg.addColorStop(1, '#4A5E6E');
    ctx.fillStyle = '#34444F'; ctx.beginPath(); ctx.ellipse(vp, by + 1, vw * 1.7, vw * 0.55, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = vg; ctx.fillRect(vp - vw, by - vh, vw * 2, vh + 2);
    ctx.fillStyle = '#34444F'; ctx.beginPath(); ctx.ellipse(vp, by + 1, vw * 1.7, vw * 0.55, 0, 0, Math.PI); ctx.fill();
    ctx.fillStyle = '#6A8090'; ctx.beginPath(); ctx.ellipse(vp, by - vh * 0.1, vw * 1.25, vw * 0.4, 0, 0, TAU); ctx.fill();
    ctx.strokeStyle = 'rgba(20,32,42,.6)'; ctx.lineWidth = 1; for (let k = 1; k < 4; k++){ ctx.beginPath(); ctx.moveTo(vp - vw, by - vh * (0.15 + k * 0.17)); ctx.lineTo(vp + vw, by - vh * (0.15 + k * 0.17)); ctx.stroke(); }
    ctx.fillStyle = '#34444F'; ctx.beginPath(); ctx.moveTo(vp - vw * 1.5, by - vh); ctx.lineTo(vp, by - vh - vw * 1.3); ctx.lineTo(vp + vw * 1.5, by - vh); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#6A8090'; ctx.beginPath(); ctx.moveTo(vp - vw * 1.5, by - vh); ctx.lineTo(vp, by - vh - vw * 1.3); ctx.lineTo(vp - vw * 0.2, by - vh); ctx.closePath(); ctx.fill();
    const sa = ((t * 0.6 + R * 0.01 + vp * 0.003) % 1);                                                                                    /* cold steam */
    ctx.globalAlpha = 0.5 * (1 - sa); ctx.fillStyle = '#F4FAFF'; ctx.beginPath(); ctx.ellipse(vp + sa * R * 0.1, by - vh - vw * 1.6 - sa * R * 0.4, vw * 0.9 + sa * R * 0.12, vw * 0.6 + sa * R * 0.08, 0, 0, TAU); ctx.fill(); ctx.globalAlpha = 1;
  }
  /* a mast with a dish and a beacon, standing on the crown */
  { const mx = R * 0.06, mb = sy(mx), mh = R * 0.26;
    ctx.fillStyle = '#34444F'; ctx.beginPath(); ctx.ellipse(mx, mb + 1, R * 0.04, R * 0.014, 0, 0, TAU); ctx.fill();
    ctx.strokeStyle = '#6A8090'; ctx.lineWidth = Math.max(1.5, R * 0.012); ctx.beginPath(); ctx.moveTo(mx, mb); ctx.lineTo(mx, mb - mh); ctx.moveTo(mx - R * 0.05, mb - mh * 0.45); ctx.lineTo(mx, mb - mh * 0.7); ctx.lineTo(mx + R * 0.05, mb - mh * 0.45); ctx.stroke();
    ctx.fillStyle = '#B4C6D2'; ctx.beginPath(); ctx.ellipse(mx + R * 0.045, mb - mh * 0.86, R * 0.05, R * 0.022, -0.5, 0, TAU); ctx.fill(); ctx.strokeStyle = '#34444F'; ctx.lineWidth = 1.2; ctx.stroke();
    fillCircle(ctx, mx, mb - mh, Math.max(1.8, R * 0.014), Math.sin(t * 3 + R) > 0.2 ? '#FF5A4A' : '#6A2A24'); }
  /* floodlights on the ring */
  for (const fp of [-R * 0.86, R * 0.82]){ ctx.fillStyle = '#2A3A46'; ctx.fillRect(fp - R * 0.02, -ringH - R * 0.05, R * 0.04, R * 0.05); ctx.fillStyle = '#34444F'; ctx.fillRect(fp - R * 0.012, -ringH - R * 0.005, R * 0.024, R * 0.012); fillCircle(ctx, fp, -ringH - R * 0.052, Math.max(2, R * 0.022), warn > 0.1 ? '#FFF8C0' : '#C8D8E0'); }
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

/* the view through the tear (binoculars): the frosted inside of a dome, ceiling pipes and icicles, a floor of mist, and the root crystal, a cluster of cold glowing columns. Call inside a clip. */
function domeInterior(ctx, cx, cy, R, t){
  const bg = ctx.createLinearGradient(0, cy - R, 0, cy + R); bg.addColorStop(0, '#0C2432'); bg.addColorStop(0.6, '#1C5068'); bg.addColorStop(1, '#0E3040'); ctx.fillStyle = bg; ctx.fillRect(cx - R, cy - R, R * 2, R * 2);
  ctx.strokeStyle = 'rgba(120,200,224,.35)'; ctx.lineWidth = 2; for (let k = 0; k < 4; k++){ ctx.beginPath(); ctx.moveTo(cx - R, cy - R * 0.72 + k * 7); ctx.lineTo(cx + R, cy - R * 0.72 + k * 7 + (k - 1.5) * 4); ctx.stroke(); }   /* ceiling pipes */
  ctx.fillStyle = 'rgba(180,230,244,.5)'; for (let k = 0; k < 14; k++){ const ix = cx - R + 8 + k * (R * 2 - 16) / 13, il = 12 + csR(k + 31800) * 22; ctx.beginPath(); ctx.moveTo(ix - 3, cy - R * 0.62); ctx.lineTo(ix + 3, cy - R * 0.62); ctx.lineTo(ix, cy - R * 0.62 + il); ctx.closePath(); ctx.fill(); }   /* icicles */
  csGlow(ctx, cx, cy + 20, 140, '#9AF4FF', 0.65);
  const floor = ctx.createLinearGradient(0, cy + 48, 0, cy + R); floor.addColorStop(0, '#8ADCEC'); floor.addColorStop(1, '#14485C'); ctx.fillStyle = floor; ctx.fillRect(cx - R, cy + 48, R * 2, R);
  ctx.strokeStyle = 'rgba(230,250,255,.35)'; ctx.lineWidth = 1; for (let k = 0; k < 4; k++){ ctx.beginPath(); ctx.moveTo(cx - R, cy + 56 + k * 14); ctx.lineTo(cx + R, cy + 56 + k * 14); ctx.stroke(); }
  const cols = [[-46, 52, 18], [-24, 84, 22], [0, 112, 26], [26, 78, 22], [50, 46, 17], [-8, 54, 14]];                                              /* the crystal: a lit face, a shaded face and a faceted tip on each column */
  cols.forEach((c, i) => {
    const bx = cx + c[0], by = cy + 52 - (i === 5 ? 6 : 0), w = c[2], h = c[1], tip = by - h;
    ctx.fillStyle = '#4FC0DC'; ctx.beginPath(); ctx.moveTo(bx - w / 2, by); ctx.lineTo(bx - w / 2, tip + w * 0.5); ctx.lineTo(bx, tip); ctx.lineTo(bx, by); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#1F7C9E'; ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(bx, tip); ctx.lineTo(bx + w / 2, tip + w * 0.5); ctx.lineTo(bx + w / 2, by); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#C8F8FF'; ctx.beginPath(); ctx.moveTo(bx - w / 2, tip + w * 0.5); ctx.lineTo(bx, tip); ctx.lineTo(bx + w / 2, tip + w * 0.5); ctx.lineTo(bx, tip + w * 0.9); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(230,252,255,.8)'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(bx - w / 2 + 3, by - 4); ctx.lineTo(bx - w / 2 + 3, tip + w * 0.6); ctx.stroke();
  });
  ctx.fillStyle = 'rgba(244,252,255,.55)'; for (let k = 0; k < 7; k++){ const sa = ((t * 0.5 + k / 7) % 1); ctx.beginPath(); ctx.ellipse(cx - 60 + k * 20, cy + 70 - sa * 30, 14 + sa * 16, 6 + sa * 6, 0, 0, TAU); ctx.fill(); }   /* the mist along the floor */
  const vg = ctx.createRadialGradient(cx, cy, R * 0.55, cx, cy, R); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(2,10,16,.7)'); ctx.fillStyle = vg; ctx.fillRect(cx - R, cy - R, R * 2, R * 2);
  ctx.strokeStyle = 'rgba(255,255,255,.55)'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(cx - R * 0.9, cy); ctx.lineTo(cx - R * 0.55, cy); ctx.moveTo(cx + R * 0.55, cy); ctx.lineTo(cx + R * 0.9, cy); ctx.moveTo(cx, cy - R * 0.9); ctx.lineTo(cx, cy - R * 0.55); ctx.moveTo(cx, cy + R * 0.55); ctx.lineTo(cx, cy + R * 0.9); ctx.stroke();   /* the sight */
}

/* ---- film 1 (30 s): the helicopter from Longneck Town, the glitter, the domes, the landing ---- */
/* a Longneck Town house: plaster walls with a stone footing, a tiled roof with a chimney, a door with a step, shuttered windows, a lantern */
function domeHouse(ctx, hx, gy, hh, hw, v){
  const wall = ['#9A7656', '#A8845E', '#8E6C4E'][v], wallD = ['#7A5A40', '#86664A', '#745438'][v], roof = ['#A04A3A', '#8A5A3A', '#9A4A44'][v], x0 = hx - hw / 2, top = gy - hh;
  ctx.fillStyle = wall; ctx.fillRect(x0, top, hw, hh); ctx.fillStyle = wallD; ctx.fillRect(x0 + hw - 8, top, 8, hh); ctx.fillStyle = '#6A6258'; ctx.fillRect(x0 - 2, gy - 12, hw + 4, 12);   /* the walls, the shade and the footing */
  ctx.strokeStyle = 'rgba(40,24,12,.25)'; ctx.lineWidth = 1; for (let k = 1; k < 4; k++){ ctx.beginPath(); ctx.moveTo(x0, top + k * (hh - 12) / 4); ctx.lineTo(x0 + hw, top + k * (hh - 12) / 4); ctx.stroke(); }
  ctx.fillStyle = '#5A4A3A'; ctx.fillRect(x0 + hw * 0.7, top - 46, 14, 40); ctx.fillStyle = '#3A2E24'; ctx.fillRect(x0 + hw * 0.7 - 2, top - 50, 18, 6);                                 /* the chimney */
  ctx.fillStyle = roof; ctx.beginPath(); ctx.moveTo(x0 - 12, top + 2); ctx.lineTo(hx, top - 48); ctx.lineTo(x0 + hw + 12, top + 2); ctx.closePath(); ctx.fill();
  ctx.fillStyle = 'rgba(0,0,0,.2)'; ctx.beginPath(); ctx.moveTo(hx, top - 48); ctx.lineTo(x0 + hw + 12, top + 2); ctx.lineTo(hx, top + 2); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(30,10,6,.35)'; ctx.lineWidth = 1.2; for (let k = 1; k < 5; k++){ const yy = top + 2 - k * 10; ctx.beginPath(); ctx.moveTo(x0 - 12 + k * 4.8 * (hw + 24) / 120 * 2.4, yy); ctx.lineTo(x0 + hw + 12 - k * 4.8 * (hw + 24) / 120 * 2.4, yy); ctx.stroke(); }
  ctx.fillStyle = '#4A3424'; ctx.fillRect(x0 - 12, top, hw + 24, 4);
  const dw = 22, dx = x0 + hw * 0.22; ctx.fillStyle = '#3A2A1C'; ctx.fillRect(dx, gy - 46, dw, 46); ctx.fillStyle = '#4E3A28'; ctx.fillRect(dx + 2, gy - 44, dw - 4, 42); ctx.fillStyle = '#C8A050'; fillCircle(ctx, dx + dw - 6, gy - 22, 1.8, '#C8A050'); ctx.fillStyle = '#8A8478'; ctx.fillRect(dx - 3, gy - 2, dw + 6, 4);   /* the door and its step */
  const wx = x0 + hw * 0.58; ctx.fillStyle = '#4A3424'; ctx.fillRect(wx - 3, top + 18, 34, 34); ctx.fillStyle = '#FFE8A0'; ctx.fillRect(wx, top + 21, 28, 28); ctx.strokeStyle = '#4A3424'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(wx + 14, top + 21); ctx.lineTo(wx + 14, top + 49); ctx.moveTo(wx, top + 35); ctx.lineTo(wx + 28, top + 35); ctx.stroke();
  ctx.fillStyle = '#3A5A4A'; ctx.fillRect(wx - 9, top + 18, 6, 34); ctx.fillRect(wx + 31, top + 18, 6, 34); ctx.fillStyle = '#5A4A3A'; ctx.fillRect(wx - 5, top + 52, 38, 4);                      /* shutters and a sill */
  ctx.strokeStyle = '#2A2018'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(dx + dw + 8, gy - 56); ctx.lineTo(dx + dw + 8, gy - 48); ctx.stroke(); fillCircle(ctx, dx + dw + 8, gy - 45, 3, '#FFD070');   /* a lantern */
}
/* the helipad: a concrete disc with a painted ring and H, corner lamps, and a windsock */
function domePad(ctx, px, gy, t, spin){
  ctx.fillStyle = '#4E4E56'; ctx.beginPath(); ctx.ellipse(px, gy + 10, 262, 24, 0, 0, TAU); ctx.fill(); ctx.fillStyle = '#6A6A72'; ctx.beginPath(); ctx.ellipse(px, gy + 6, 250, 20, 0, 0, TAU); ctx.fill();
  ctx.strokeStyle = '#E8E8E4'; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(px, gy + 6, 214, 16, 0, 0, TAU); ctx.stroke();
  ctx.fillStyle = '#F2F2EE'; ctx.font = '700 38px system-ui, sans-serif'; ctx.textAlign = 'center'; ctx.fillText('H', px, gy + 18); ctx.textAlign = 'left';
  for (let k = 0; k < 8; k++){ const a = k / 8 * TAU; fillCircle(ctx, px + Math.cos(a) * 232, gy + 6 + Math.sin(a) * 18, 3.2, Math.sin(t * 4 + k) > 0 ? '#FFD870' : '#8A7A40'); }
  const wx = px - 300, wb = gy + 6;                                                                                                                                  /* the windsock, blown by the rotors */
  ctx.strokeStyle = '#3A3A40'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(wx, wb); ctx.lineTo(wx, wb - 80); ctx.stroke();
  const wv = 0.4 + 0.5 * spin, flap = Math.sin(t * 6) * 3;
  for (let k = 0; k < 4; k++){ ctx.fillStyle = k % 2 ? '#F2F2EE' : '#E85A3A'; const x0 = wx + k * 12 * wv + 2, x1 = wx + (k + 1) * 12 * wv + 2, h0 = 10 - k * 1.8, h1 = 10 - (k + 1) * 1.8; ctx.beginPath(); ctx.moveTo(x0, wb - 80 - h0 + k * 3 * (1 - wv) + flap * k * 0.2); ctx.lineTo(x1, wb - 80 - h1 + (k + 1) * 3 * (1 - wv) + flap * (k + 1) * 0.2); ctx.lineTo(x1, wb - 80 + h1 + (k + 1) * 3 * (1 - wv) + flap * (k + 1) * 0.2); ctx.lineTo(x0, wb - 80 + h0 + k * 3 * (1 - wv) + flap * k * 0.2); ctx.closePath(); ctx.fill(); }
}
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
    for (const h of [[900, 120, 150, 0], [1060, 90, 120, 1], [1200, 150, 130, 2]]) domeHouse(ctx, h[0], gy + lift * 120, h[1], h[2], h[3]);
    domePad(ctx, 560, gy + lift * 120, t, spin);
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
    if (u > 4.4){                                                                    /* binoculars: a round window onto what is behind the tear */
      const a = csSm(4.4, 5.2, u); ctx.globalAlpha = a; ctx.save(); ctx.beginPath(); ctx.arc(1020, 190, 124, 0, TAU); ctx.clip();
      domeInterior(ctx, 1020, 190, 124, t);
      ctx.restore(); ctx.strokeStyle = '#10181A'; ctx.lineWidth = 8; ctx.beginPath(); ctx.arc(1020, 190, 124, 0, TAU); ctx.stroke(); ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(160,180,190,.6)'; ctx.beginPath(); ctx.arc(1020, 190, 119, 0, TAU); ctx.stroke(); ctx.globalAlpha = 1;
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
    const col = i % 2 ? '#1E1830' : '#2A2040', hi = i % 2 ? '#2E2644' : '#3A3058', w = b[2], tall = b[1] > 250;
    ctx.fillStyle = col; ctx.fillRect(x - w / 2, top, w, b[1] * p + 6);
    ctx.fillStyle = hi; ctx.fillRect(x - w / 2, top, 3, b[1] * p + 6);                                                          /* the lit edge */
    if (tall){ ctx.fillStyle = col; ctx.fillRect(x - w * 0.34, top - 26 * p, w * 0.68, 26 * p + 1); ctx.fillRect(x - w * 0.2, top - 46 * p, w * 0.4, 20 * p + 1); ctx.fillStyle = hi; ctx.fillRect(x - w * 0.34, top - 26 * p, 2, 26 * p); }   /* setbacks */
    else { ctx.fillStyle = hi; ctx.fillRect(x - w / 2, top, w, 3); ctx.fillStyle = col; ctx.fillRect(x - w * 0.18, top - 9 * p, w * 0.36, 9 * p + 1); }                                                          /* a rooftop box */
    for (let k = 0; k < 60; k++){ const wx = x - w / 2 + 6 + (k % 6) * (w - 12) / 6, wy = top + 10 + Math.floor(k / 6) * 14; if (wy > gy - 4 || csR(i * 77 + k) < 0.35) continue; ctx.fillStyle = csR(i * 91 + k) > 0.5 ? '#FFE49A' : '#FFC870'; ctx.fillRect(wx, wy, 5, 7); }
    if (tall){ const sx = x, st = top - (i === 5 || i === 10 ? 46 : 26) * p; ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(sx - 6, st); ctx.lineTo(sx, st - 40 * p); ctx.lineTo(sx + 6, st); ctx.closePath(); ctx.fill(); ctx.strokeStyle = '#6A6A80'; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(sx, st - 40 * p); ctx.lineTo(sx, st - 62 * p); ctx.stroke(); fillCircle(ctx, sx, st - 63 * p, 2.4, Math.sin(t * 3 + i) > 0 ? '#FF5A4A' : '#5A1A14'); }
  });
  const wg = ctx.createLinearGradient(0, gy, 0, CS_H); wg.addColorStop(0, '#6A3A5A'); wg.addColorStop(1, '#1C1430'); ctx.fillStyle = wg; ctx.fillRect(0, gy, CS_W, CS_H - gy + 2);
  ctx.strokeStyle = 'rgba(255,200,140,.32)'; ctx.lineWidth = 2; for (let k = 0; k < 9; k++){ const y = gy + 14 + k * 18; ctx.beginPath(); for (let x = 0; x <= CS_W; x += 24) ctx.lineTo(x, y + Math.sin(x * 0.04 + t * 2 + k) * 2); ctx.stroke(); }
  domeLady(ctx, 1080 - sc * 0.1, gy, t);
}
/* the Lady on her island, small and far: a rock, a stepped pedestal, a robed figure with folds, a crown of rays, a tablet in one arm and the torch held high with a flame */
function domeLady(ctx, lx, gy, t){
  const V = '#4E8A78', VD = '#2F5A4E', VL = '#86C4AC';
  ctx.fillStyle = '#3A3040'; ctx.beginPath(); ctx.moveTo(lx - 70, gy + 10); ctx.quadraticCurveTo(lx - 50, gy - 6, lx - 30, gy - 8); ctx.lineTo(lx + 34, gy - 8); ctx.quadraticCurveTo(lx + 56, gy - 4, lx + 74, gy + 10); ctx.closePath(); ctx.fill();   /* the island */
  ctx.fillStyle = '#4A4458'; ctx.fillRect(lx - 34, gy - 18, 68, 12); ctx.fillStyle = '#5E566E'; ctx.fillRect(lx - 34, gy - 18, 68, 3); ctx.fillStyle = '#4A4458'; ctx.fillRect(lx - 24, gy - 40, 48, 22); ctx.fillStyle = '#5E566E'; ctx.fillRect(lx - 24, gy - 40, 48, 3);
  ctx.fillStyle = '#403A4E'; ctx.fillRect(lx - 17, gy - 52, 34, 12); ctx.fillStyle = '#5E566E'; ctx.fillRect(lx - 19, gy - 54, 38, 3);                                                         /* the pedestal in three steps */
  ctx.fillStyle = '#FFC870'; for (const wx of [-14, -4, 6]) ctx.fillRect(lx + wx, gy - 34, 5, 7);                                                                                               /* lit windows in the base */
  ctx.fillStyle = VD; ctx.beginPath(); ctx.moveTo(lx - 12, gy - 54); ctx.lineTo(lx - 9, gy - 100); ctx.lineTo(lx + 9, gy - 100); ctx.lineTo(lx + 14, gy - 54); ctx.closePath(); ctx.fill();            /* the robe */
  ctx.fillStyle = V; ctx.beginPath(); ctx.moveTo(lx - 10, gy - 54); ctx.lineTo(lx - 8, gy - 100); ctx.lineTo(lx + 3, gy - 100); ctx.lineTo(lx + 4, gy - 54); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = VD; ctx.lineWidth = 1.2; for (let k = 0; k < 4; k++){ ctx.beginPath(); ctx.moveTo(lx - 8 + k * 5, gy - 98); ctx.lineTo(lx - 10 + k * 6, gy - 56); ctx.stroke(); }                              /* the folds */
  ctx.fillStyle = V; ctx.beginPath(); ctx.moveTo(lx - 10, gy - 98); ctx.lineTo(lx + 2, gy - 106); ctx.lineTo(lx + 10, gy - 98); ctx.lineTo(lx + 8, gy - 90); ctx.lineTo(lx - 9, gy - 92); ctx.closePath(); ctx.fill();   /* the shoulders and the drape */
  ctx.fillStyle = VD; ctx.fillRect(lx - 3, gy - 110, 6, 6); ctx.fillStyle = V; ctx.beginPath(); ctx.arc(lx, gy - 114, 6.4, 0, TAU); ctx.fill(); ctx.fillStyle = VL; ctx.beginPath(); ctx.arc(lx - 2, gy - 116, 2.6, 0, TAU); ctx.fill();   /* the neck and head */
  ctx.strokeStyle = V; ctx.lineWidth = 2.2; ctx.lineCap = 'round'; for (let k = -3; k <= 3; k++){ ctx.beginPath(); ctx.moveTo(lx + k * 2, gy - 119); ctx.lineTo(lx + k * 5.4, gy - 130 + Math.abs(k) * 1.6); ctx.stroke(); }   /* the crown */
  ctx.lineWidth = 4.6; ctx.strokeStyle = V; ctx.beginPath(); ctx.moveTo(lx + 7, gy - 100); ctx.lineTo(lx + 17, gy - 120); ctx.lineTo(lx + 23, gy - 142); ctx.stroke();                              /* the raised arm, from the shoulder */
  ctx.lineWidth = 3.4; ctx.strokeStyle = VL; ctx.beginPath(); ctx.moveTo(lx + 6, gy - 101); ctx.lineTo(lx + 16, gy - 120); ctx.stroke(); ctx.lineCap = 'butt';
  ctx.fillStyle = VD; ctx.fillRect(lx + 20, gy - 148, 7, 8); ctx.fillStyle = V; ctx.beginPath(); ctx.moveTo(lx + 18, gy - 148); ctx.lineTo(lx + 29, gy - 148); ctx.lineTo(lx + 31, gy - 152); ctx.lineTo(lx + 16, gy - 152); ctx.closePath(); ctx.fill();   /* the torch's hand and rail */
  const fl = 1 + 0.12 * Math.sin(t * 9); csGlow(ctx, lx + 23.5, gy - 160, 26, '#FFD070', 0.6);
  ctx.fillStyle = '#FFB040'; ctx.beginPath(); ctx.moveTo(lx + 17, gy - 152); ctx.quadraticCurveTo(lx + 14, gy - 162 * fl + 4, lx + 23.5, gy - 172 * fl); ctx.quadraticCurveTo(lx + 33, gy - 162 * fl + 4, lx + 30, gy - 152); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#FFF0B0'; ctx.beginPath(); ctx.moveTo(lx + 20, gy - 152); ctx.quadraticCurveTo(lx + 19, gy - 159, lx + 23.5, gy - 164 * fl); ctx.quadraticCurveTo(lx + 28, gy - 159, lx + 27, gy - 152); ctx.closePath(); ctx.fill();
  ctx.fillStyle = VD; ctx.save(); ctx.translate(lx - 12, gy - 86); ctx.rotate(-0.2); ctx.fillRect(-6, -9, 12, 18); ctx.fillStyle = VL; ctx.fillRect(-5, -8, 10, 2); ctx.restore();                  /* the tablet on the other arm */
  ctx.strokeStyle = VD; ctx.lineWidth = 3.6; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(lx - 8, gy - 96); ctx.lineTo(lx - 12, gy - 86); ctx.stroke(); ctx.lineCap = 'butt';
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
