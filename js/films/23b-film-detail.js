'use strict';
/* Film detail: the small parts the films before Chapter 13.5 are dressed with. */
/* The films draw each shot with a few big shapes. These helpers add the small things on top of them, in the layer each belongs to: grass,
   stones and cracks on the ground, birds and insects in the air, rivets, panel lines and lamps on machines, windows and aerials on buildings,
   dust, sparks and embers in the light. The scenes call them where they belong (ground details before the giraffe, motes after her), so
   nothing is painted over what should be in front of it. Like the films, every helper is a pure function of its arguments and the time:
   positions come from csR(seed + i), nothing is random. sc is how far the shot has scrolled, so details move with the ground they sit on. */

/* wrap a scrolled x into the band [x0, x0 + span) */
function fdWrap(x, x0, span){ return ((x - x0) % span + span) % span + x0; }
/* grass tufts across a band of ground: n tufts between y0 and y1 (nearer ones lower and bigger), swaying a little */
function fdGrass(ctx, o){
  const n = o.n || 40, seed = o.seed || 0, sc = o.sc || 0, t = o.t || 0, span = o.span || 1500, x0 = o.x0 === undefined ? -110 : o.x0;
  ctx.lineCap = 'round';
  for (let i = 0; i < n; i++){
    const f = csR(seed + i * 3), y = o.y0 + (o.y1 - o.y0) * f, s = (o.s || 1) * (0.55 + f * 0.8), x = fdWrap(csR(seed + i * 3 + 1) * span - sc * (0.6 + f * 0.7), x0, span);
    const blades = 3 + (i % 3), sway = Math.sin(t * 1.6 + i * 1.3) * 2.2 * s;
    ctx.strokeStyle = i % 4 === 0 ? (o.hi || o.col) : o.col; ctx.lineWidth = Math.max(1, 1.5 * s); ctx.beginPath();
    for (let b = 0; b < blades; b++){ const dx = (b - (blades - 1) / 2) * 3 * s, h = (9 + csR(seed + i * 7 + b) * 9) * s; ctx.moveTo(x + dx, y); ctx.quadraticCurveTo(x + dx * 1.6, y - h * 0.6, x + dx * 2.2 + sway, y - h); }
    ctx.stroke();
  }
  ctx.lineCap = 'butt';
}
/* stones and pebbles on the ground: a dark base, a lit top and a cast shadow */
function fdStones(ctx, o){
  const n = o.n || 24, seed = o.seed || 0, sc = o.sc || 0, span = o.span || 1500, x0 = o.x0 === undefined ? -60 : o.x0;
  for (let i = 0; i < n; i++){
    const f = csR(seed + i * 5), y = o.y0 + (o.y1 - o.y0) * f, s = (o.s || 1) * (0.5 + f * 0.9), r = (2 + csR(seed + i * 5 + 2) * 5) * s, x = fdWrap(csR(seed + i * 5 + 1) * span - sc * (0.6 + f * 0.7), x0, span);
    ctx.fillStyle = 'rgba(0,0,0,.18)'; ctx.beginPath(); ctx.ellipse(x + r * 0.5, y + r * 0.3, r * 1.2, r * 0.45, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = o.dk || o.col; ctx.beginPath(); ctx.ellipse(x, y, r, r * 0.62, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = o.col; ctx.beginPath(); ctx.ellipse(x - r * 0.2, y - r * 0.18, r * 0.7, r * 0.38, 0, 0, TAU); ctx.fill();
  }
}
/* fine cracks in hard ground or pavement */
function fdCracks(ctx, o){
  const n = o.n || 10, seed = o.seed || 0, sc = o.sc || 0, span = o.span || 1500, x0 = o.x0 === undefined ? -80 : o.x0;
  ctx.strokeStyle = o.col || 'rgba(0,0,0,.28)'; ctx.lineWidth = o.w || 1.2; ctx.beginPath();
  for (let i = 0; i < n; i++){
    const f = csR(seed + i * 4), y = o.y0 + (o.y1 - o.y0) * f; let x = fdWrap(csR(seed + i * 4 + 1) * span - sc * (o.par || 1), x0, span), yy = y;
    ctx.moveTo(x, yy);
    for (let k = 0; k < 4; k++){ x += 8 + csR(seed + i * 9 + k) * 14; yy += (csR(seed + i * 11 + k) - 0.5) * 7; ctx.lineTo(x, yy); if (k === 1){ ctx.moveTo(x, yy); ctx.lineTo(x + 4, yy + 6); ctx.moveTo(x, yy); } }
  }
  ctx.stroke();
}
/* birds far off in the sky: little flapping V shapes drifting across */
function fdBirds(ctx, o){
  const n = o.n || 5, seed = o.seed || 0, t = o.t || 0, span = o.span || 1600;
  ctx.strokeStyle = o.col || 'rgba(40,30,30,.6)'; ctx.lineCap = 'round';
  for (let i = 0; i < n; i++){
    const s = (o.s || 1) * (0.6 + csR(seed + i * 3) * 0.7), x = fdWrap(csR(seed + i * 3 + 1) * span + t * (o.v || 30) * (0.7 + csR(seed + i) * 0.6), -60, span), y = o.y0 + (o.y1 - o.y0) * csR(seed + i * 3 + 2) + Math.sin(t * 0.7 + i) * 6;
    const fl = Math.sin(t * 9 + i * 2.3) * 4 * s; ctx.lineWidth = Math.max(1, 1.6 * s);
    ctx.beginPath(); ctx.moveTo(x - 8 * s, y - fl); ctx.quadraticCurveTo(x - 4 * s, y - 2 * s - fl * 0.3, x, y); ctx.quadraticCurveTo(x + 4 * s, y - 2 * s - fl * 0.3, x + 8 * s, y - fl); ctx.stroke();
  }
  ctx.lineCap = 'butt';
}
/* motes in the light: dust, pollen, snow, ash or embers, rising (v < 0) or falling (v > 0), each fading in and out */
function fdMotes(ctx, o){
  const n = o.n || 30, seed = o.seed || 0, t = o.t || 0, x0 = o.x0 || 0, x1 = o.x1 === undefined ? CS_W : o.x1, y0 = o.y0 || 0, y1 = o.y1 === undefined ? CS_H : o.y1, v = o.v === undefined ? -0.08 : o.v;
  for (let i = 0; i < n; i++){
    const a = ((t * Math.abs(v) * (0.6 + csR(seed + i) * 0.8) + csR(seed + i * 2)) % 1), y = v < 0 ? y1 - a * (y1 - y0) : y0 + a * (y1 - y0);
    const x = x0 + csR(seed + i * 2 + 1) * (x1 - x0) + Math.sin(t * (0.8 + csR(seed + i * 3)) + i) * (o.wob || 12) - (o.sc || 0) * 0.3;
    ctx.globalAlpha = (o.a || 0.5) * Math.sin(a * Math.PI); fillCircle(ctx, fdWrap(x, x0 - 20, x1 - x0 + 40), y, (o.r || 1.6) * (0.6 + csR(seed + i * 5) * 0.8), o.col || '#FFF0C8');
  }
  ctx.globalAlpha = 1;
}
/* a row of rivets along a line (in the drawing's own space) */
function fdRivets(ctx, x0, y0, x1, y1, n, r, col){
  ctx.fillStyle = col || 'rgba(60,64,76,.55)';
  for (let i = 0; i <= n; i++){ const k = n ? i / n : 0; ctx.beginPath(); ctx.arc(x0 + (x1 - x0) * k, y0 + (y1 - y0) * k, r || 1.1, 0, TAU); ctx.fill(); }
}
/* panel seams: a few short lines (pairs of points) in one stroke */
function fdSeams(ctx, segs, col, w){
  ctx.strokeStyle = col || 'rgba(60,66,80,.35)'; ctx.lineWidth = w || 1; ctx.beginPath();
  for (let i = 0; i < segs.length; i += 4){ ctx.moveTo(segs[i], segs[i + 1]); ctx.lineTo(segs[i + 2], segs[i + 3]); }
  ctx.stroke();
}
/* a little blinking lamp with a soft glow */
function fdLamp(ctx, x, y, r, col, on){
  fillCircle(ctx, x, y, r, on ? col : 'rgba(40,30,30,.7)');
  if (on) csGlow(ctx, x, y, r * 6, col, 0.45);
}
/* an aerial mast with a crossbar and a blinking tip */
function fdAerial(ctx, x, y, h, t, col){
  ctx.strokeStyle = col || '#3A3E48'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y - h); ctx.moveTo(x - h * 0.18, y - h * 0.7); ctx.lineTo(x + h * 0.18, y - h * 0.7); ctx.moveTo(x - h * 0.12, y - h * 0.86); ctx.lineTo(x + h * 0.12, y - h * 0.86); ctx.stroke();
  fdLamp(ctx, x, y - h - 2, 2, '#FF4A3A', Math.sin(t * 3 + x) > 0.2);
}
/* a dish on a post that turns slowly (radar or radio) */
function fdDish(ctx, x, y, s, t, col){
  const a = Math.sin(t * 0.6 + x * 0.01) * 0.6;
  ctx.strokeStyle = col || '#4A4E58'; ctx.lineWidth = 3 * s; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y - 18 * s); ctx.stroke();
  ctx.save(); ctx.translate(x, y - 20 * s); ctx.rotate(-0.5 + a); ctx.fillStyle = '#C8CCD4'; ctx.beginPath(); ctx.ellipse(0, 0, 14 * s, 6 * s, 0, Math.PI, TAU); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = '#7A808C'; ctx.lineWidth = 1.2 * s; ctx.stroke(); ctx.beginPath(); ctx.moveTo(0, -1); ctx.lineTo(0, -12 * s); ctx.stroke(); fillCircle(ctx, 0, -12 * s, 1.6 * s, '#7A808C'); ctx.restore();
}
/* oil drums, standing: n of them from x, alternating colors */
function fdDrums(ctx, x, y, n, s, cols){
  for (let i = 0; i < n; i++){
    const dx = x + i * 17 * s, c = cols[i % cols.length];
    ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.beginPath(); ctx.ellipse(dx + 8 * s, y + 1, 11 * s, 3 * s, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = c; ctx.fillRect(dx, y - 22 * s, 15 * s, 22 * s);
    ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.fillRect(dx, y - 16 * s, 15 * s, 1.6 * s); ctx.fillRect(dx, y - 7 * s, 15 * s, 1.6 * s); ctx.fillRect(dx + 11 * s, y - 22 * s, 4 * s, 22 * s);
    ctx.fillStyle = 'rgba(255,255,255,.22)'; ctx.fillRect(dx + 2 * s, y - 22 * s, 2 * s, 22 * s);
  }
}
/* wooden crates, stacked: [dx, dy, size] in units of s */
function fdCrates(ctx, x, y, list, s, col){
  for (const c of list){
    const w = c[2] * s, cx = x + c[0] * s, cy = y - c[1] * s - w;
    ctx.fillStyle = col || '#8A6A44'; ctx.fillRect(cx, cy, w, w);
    ctx.strokeStyle = 'rgba(40,24,10,.55)'; ctx.lineWidth = 1.4; ctx.strokeRect(cx + 1, cy + 1, w - 2, w - 2);
    ctx.beginPath(); ctx.moveTo(cx + 2, cy + 2); ctx.lineTo(cx + w - 2, cy + w - 2); ctx.moveTo(cx, cy + w * 0.5); ctx.lineTo(cx + w, cy + w * 0.5); ctx.stroke();
    ctx.fillStyle = 'rgba(255,230,180,.18)'; ctx.fillRect(cx, cy, w, 2);
  }
}
/* tyre marks and oil stains on a runway or a road */
function fdSkids(ctx, o){
  const n = o.n || 6, seed = o.seed || 0, sc = o.sc || 0, span = o.span || 1600;
  for (let i = 0; i < n; i++){
    const x = fdWrap(csR(seed + i * 3) * span - sc, -200, span), y = o.y0 + (o.y1 - o.y0) * csR(seed + i * 3 + 1), L = 60 + csR(seed + i * 3 + 2) * 140;
    ctx.fillStyle = 'rgba(20,18,22,.22)'; ctx.fillRect(x, y, L, 2.2); ctx.fillRect(x + 6, y + 6, L * 0.9, 2.2);
    if (i % 2 === 0){ ctx.fillStyle = 'rgba(10,8,14,.18)'; ctx.beginPath(); ctx.ellipse(x + L * 0.6, y + 3, 12 + csR(seed + i) * 10, 3.5, 0, 0, TAU); ctx.fill(); }
  }
}
/* termite mounds or rock spires on the savannah: a lumpy cone with a shadow */
function fdMounds(ctx, o){
  const n = o.n || 3, seed = o.seed || 0, sc = o.sc || 0, span = o.span || 1700;
  for (let i = 0; i < n; i++){
    const f = csR(seed + i * 4), y = o.y0 + (o.y1 - o.y0) * f, s = (o.s || 1) * (0.6 + f * 0.7), x = fdWrap(csR(seed + i * 4 + 1) * span - sc * (0.5 + f * 0.6), -100, span), h = (26 + csR(seed + i * 4 + 2) * 22) * s;
    ctx.fillStyle = 'rgba(0,0,0,.2)'; ctx.beginPath(); ctx.ellipse(x + 10 * s, y + 1, 22 * s, 5 * s, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = o.col; ctx.beginPath(); ctx.moveTo(x - 14 * s, y); ctx.quadraticCurveTo(x - 10 * s, y - h * 0.7, x - 3 * s, y - h); ctx.quadraticCurveTo(x + 2 * s, y - h * 1.04, x + 5 * s, y - h * 0.8); ctx.quadraticCurveTo(x + 12 * s, y - h * 0.4, x + 15 * s, y); ctx.closePath(); ctx.fill();
    ctx.fillStyle = o.hi; ctx.beginPath(); ctx.moveTo(x - 10 * s, y - 2); ctx.quadraticCurveTo(x - 8 * s, y - h * 0.62, x - 3 * s, y - h * 0.94); ctx.lineTo(x - 1 * s, y - h * 0.5); ctx.lineTo(x - 4 * s, y - 2); ctx.closePath(); ctx.fill();
  }
}
/* lit windows on a building face: a grid of small panes, some lit (lit decides by the pane), a few flickering */
function fdWindows(ctx, x, y, w, h, cw, ch, gap, t, seed, lit, dark){
  for (let yy = y; yy + ch <= y + h; yy += ch + gap) for (let xx = x; xx + cw <= x + w; xx += cw + gap){
    const r = csR(seed + xx * 0.37 + yy * 1.7), on = r > 0.45 && !(r > 0.93 && Math.sin(t * 2 + r * 40) > 0.6);
    ctx.fillStyle = on ? lit : dark; ctx.fillRect(xx, yy, cw, ch);
  }
}
/* a heat shimmer or a glow pulse over a hot spot: faint wavering bars */
function fdShimmer(ctx, x, y, w, h, t, a){
  ctx.fillStyle = 'rgba(255,230,190,' + (a || 0.08) + ')';
  for (let k = 0; k < 6; k++){ const yy = y - k * h / 6, ww = w * (1 - k / 8); ctx.fillRect(x - ww / 2 + Math.sin(t * 6 + k * 1.7) * 4, yy, ww, 1.6); }
}
