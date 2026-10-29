'use strict';
/* Chapter 16, Fort Shortneck: the detail layer for the map (the fort is in js/fort/44zzzk-fort-map.js). */
/* Every building was a few big shapes; this adds the many small parts that make it a place: window frames with sills and curtains, doors with steps and awnings, roof vents, fans, hatches,
   skylights and air-conditioning units, pipes with flanges and valves, cables, stencils, rivets and weld seams, lamps, sandbags, crates and drums, rain streaks and patched roofing. Each kind has its own
   (ftDetail, called by ftDrawBuilding before the damage is painted over it); a hurt building shows its parts through the soot. Everything is placed from the building's own number (csR), so it is
   the same every frame and the same on every run. The ground gets stains, tracks, cracks, drains, drums, tents and cable runs (ftGroundDetail, drawn with the cached ground), and a building that
   has fallen is a better ruin (ftRuinDetail): broken wall stubs, twisted girders and kind-specific wreckage. */
function fdR(b, i){ return csR(b.idx * 97.3 + i * 13.7); }
function fdBox(ctx, x, y, w, h, c){ ctx.fillStyle = c; ctx.fillRect(x, y, w, h); }
function fdRivetRow(ctx, x, y, w, n, c){ ctx.fillStyle = c || 'rgba(20,20,16,.55)'; for (let i = 0; i < n; i++) ctx.fillRect(x + (w - 3) * i / Math.max(1, n - 1), y, 3, 3); }
function fdVent(ctx, x, y, w, h, n){ fdBox(ctx, x, y, w, h, '#2A2C26'); ctx.fillStyle = '#5A5E54'; for (let i = 0; i < n; i++) ctx.fillRect(x + 2, y + 2 + i * (h - 4) / n, w - 4, (h - 4) / n * 0.5); fdBox(ctx, x, y, w, 1.5, 'rgba(255,255,255,.2)'); }
function fdFan(ctx, x, y, r, t, on){
  fillCircle(ctx, x, y, r + 3, '#2A2C26'); fillCircle(ctx, x, y, r + 1, '#5A5E54'); fillCircle(ctx, x, y, r - 1, '#14161C');
  ctx.save(); ctx.translate(x, y); ctx.rotate(on === false ? 0.4 : t * 6 + x); ctx.fillStyle = '#8A909C'; for (let k = 0; k < 5; k++){ ctx.rotate(TAU / 5); ctx.beginPath(); ctx.ellipse(r * 0.5, 0, r * 0.5, r * 0.16, 0, 0, TAU); ctx.fill(); } ctx.restore();
  fillCircle(ctx, x, y, r * 0.2, '#C8CCD4'); ctx.strokeStyle = 'rgba(200,204,212,.5)'; ctx.lineWidth = 0.8; ctx.beginPath(); ctx.arc(x, y, r - 1, 0, TAU); ctx.stroke();
}
function fdAC(ctx, x, y, w, h, t){
  fdBox(ctx, x + 3, y + 4, w, h, 'rgba(0,0,0,.28)'); fdBox(ctx, x, y, w, h, '#B4B8BC'); fdBox(ctx, x, y, w, 2, 'rgba(255,255,255,.55)'); fdBox(ctx, x, y + h - 2, w, 2, 'rgba(0,0,0,.2)');
  fdFan(ctx, x + h * 0.5, y + h * 0.5, h * 0.3, t, true); for (let i = 0; i < 4; i++) fdBox(ctx, x + w * 0.6, y + 4 + i * (h - 8) / 4, w * 0.32, 1.6, '#6A6E74'); fillCircle(ctx, x + w - 4, y + 4, 1.6, '#7AF0B0');
}
function fdPipe(ctx, pts, w, c, flange){
  ctx.lineJoin = 'round'; ctx.strokeStyle = 'rgba(0,0,0,.4)'; ctx.lineWidth = w + 2; ctx.beginPath(); for (let i = 0; i < pts.length; i += 2) i ? ctx.lineTo(pts[i], pts[i + 1]) : ctx.moveTo(pts[i], pts[i + 1]); ctx.stroke();
  ctx.strokeStyle = c; ctx.lineWidth = w; ctx.stroke(); ctx.strokeStyle = 'rgba(255,255,255,.3)'; ctx.lineWidth = w * 0.25; ctx.stroke(); ctx.lineJoin = 'miter';
  for (let i = 2; i < pts.length - 2; i += 2) fillCircle(ctx, pts[i], pts[i + 1], w * 0.7, tw_sh(c, 0.3));
  if (flange) for (let i = 0; i < pts.length - 2; i += 2){ const mx = (pts[i] + pts[i + 2]) / 2, my = (pts[i + 1] + pts[i + 3]) / 2; fillCircle(ctx, mx, my, w * 0.75, '#8A909C'); fillCircle(ctx, mx, my, w * 0.4, c); }
}
function fdHatch(ctx, x, y, s, c){ fdBox(ctx, x - 1, y - 1, s + 2, s + 2, 'rgba(0,0,0,.35)'); fdBox(ctx, x, y, s, s, c || '#6A6E62'); fdBox(ctx, x + 2, y + 2, s - 4, s - 4, tw_li(c || '#6A6E62', 0.12)); fdBox(ctx, x + s * 0.3, y + s * 0.45, s * 0.4, 2, '#2A2C26'); fillCircle(ctx, x + 3, y + 3, 1, '#C8CCD4'); fillCircle(ctx, x + s - 3, y + s - 3, 1, '#C8CCD4'); }
function fdSky(ctx, x, y, w, h){ fdBox(ctx, x - 2, y - 2, w + 4, h + 4, '#3A3E36'); fdBox(ctx, x, y, w, h, 'rgba(150,200,226,.8)'); fdBox(ctx, x + w / 2 - 1, y, 2, h, '#3A3E36'); fdBox(ctx, x, y + h / 2 - 1, w, 2, '#3A3E36'); ctx.fillStyle = 'rgba(255,255,255,.4)'; ctx.beginPath(); ctx.moveTo(x + 2, y + h - 2); ctx.lineTo(x + w * 0.4, y + 2); ctx.lineTo(x + w * 0.55, y + 2); ctx.lineTo(x + 4 + w * 0.15, y + h - 2); ctx.fill(); }
function fdWin(ctx, x, y, w, h, lit, curtain){
  fdBox(ctx, x - 2, y - 2, w + 4, h + 4, '#1E201A'); fdBox(ctx, x, y, w, h, lit ? '#F6E2A0' : '#4A5668'); fdBox(ctx, x + w / 2 - 0.7, y, 1.4, h, '#1E201A'); fdBox(ctx, x, y + h * 0.45, w, 1.2, '#1E201A');
  if (curtain){ fdBox(ctx, x, y, w * 0.28, h, curtain); fdBox(ctx, x + w * 0.72, y, w * 0.28, h, curtain); }
  fdBox(ctx, x - 3, y + h + 2, w + 6, 2.4, '#B8B8A8'); fdBox(ctx, x, y, w, 2, 'rgba(255,255,255,.25)');
}
function fdDoor(ctx, x, y, w, h, c){ fdBox(ctx, x - 2, y - 2, w + 4, h + 3, '#1E201A'); fdBox(ctx, x, y, w, h, c || '#4A4C3E'); fdBox(ctx, x + 3, y + 3, w - 6, h * 0.4, 'rgba(0,0,0,.25)'); fdBox(ctx, x + 4, y + 4, w - 8, h * 0.35, 'rgba(150,200,226,.55)'); fillCircle(ctx, x + w - 4, y + h * 0.6, 1.4, '#E8C84A'); fdBox(ctx, x - 4, y + h + 1, w + 8, 3, '#A8A898'); fdBox(ctx, x - 2, y + h + 4, w + 4, 3, '#8A8A7A'); }
function fdLamp(ctx, x, y, r){ fdBox(ctx, x - 2, y - 2, 4, 4, '#2A2C26'); fillCircle(ctx, x, y, r || 2.2, '#FFF2B0'); ctx.fillStyle = 'rgba(255,230,160,.18)'; ctx.beginPath(); ctx.arc(x, y, (r || 2.2) * 4, 0, TAU); ctx.fill(); }
function fdBags(ctx, x, y, n, vert){ for (let i = 0; i < n; i++){ const bx = vert ? x : x + i * 15, by = vert ? y + i * 9 : y; ctx.fillStyle = i % 2 ? '#B8A878' : '#C4B484'; ctx.beginPath(); ctx.ellipse(bx + 8, by + 4, 8, 4.4, 0, 0, TAU); ctx.fill(); ctx.strokeStyle = 'rgba(60,46,24,.5)'; ctx.lineWidth = 0.8; ctx.stroke(); fdBox(ctx, bx + 4, by + 3.6, 8, 0.8, 'rgba(60,46,24,.35)'); } }
function fdCrate(ctx, x, y, s, c){ fdBox(ctx, x + 2, y + 3, s, s, 'rgba(0,0,0,.28)'); fdBox(ctx, x, y, s, s, c || '#A88A52'); ctx.strokeStyle = '#6E5630'; ctx.lineWidth = 1; ctx.strokeRect(x + 0.5, y + 0.5, s - 1, s - 1); ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + s, y + s); ctx.moveTo(x + s, y); ctx.lineTo(x, y + s); ctx.stroke(); fdBox(ctx, x + s * 0.3, y + s * 0.4, s * 0.4, s * 0.2, 'rgba(240,230,200,.5)'); }
function fdDrum(ctx, x, y, r, c){ fillCircle(ctx, x + 2, y + 3, r, 'rgba(0,0,0,.3)'); fillCircle(ctx, x, y, r, tw_sh(c, 0.3)); fillCircle(ctx, x, y, r * 0.86, c); ctx.strokeStyle = 'rgba(0,0,0,.35)'; ctx.lineWidth = 0.9; ctx.beginPath(); ctx.arc(x, y, r * 0.62, 0, TAU); ctx.stroke(); fillCircle(ctx, x - r * 0.3, y - r * 0.2, r * 0.18, '#C8CCD4'); fillCircle(ctx, x + r * 0.28, y + r * 0.25, r * 0.14, '#2A2C26'); }
function fdCable(ctx, x1, y1, x2, y2, sag, c){ ctx.strokeStyle = 'rgba(0,0,0,.4)'; ctx.lineWidth = 3.2; ctx.beginPath(); ctx.moveTo(x1, y1); ctx.quadraticCurveTo((x1 + x2) / 2, (y1 + y2) / 2 + sag, x2, y2); ctx.stroke(); ctx.strokeStyle = c || '#1E1E1A'; ctx.lineWidth = 2; ctx.stroke(); }
function fdStencil(ctx, text, x, y, size, a){ ctx.font = '800 ' + size + 'px ui-sans-serif, sans-serif'; ctx.textAlign = 'center'; ctx.fillStyle = 'rgba(240,236,220,' + (a || 0.45) + ')'; ctx.fillText(text, x, y); }
function fdStreaks(ctx, b, front, seed){ ctx.strokeStyle = 'rgba(20,24,16,.1)'; ctx.lineWidth = 1.4; ctx.beginPath(); const n = Math.max(3, Math.round(b.w / 46)); for (let i = 0; i < n; i++){ const x = b.x + 12 + fdR(b, seed + i) * (b.w - 24), y0 = b.y + 6, y1 = b.y + Math.max(20, (b.h - front) * (0.4 + fdR(b, seed + i + 40) * 0.5)); ctx.moveTo(x, y0); ctx.lineTo(x + (fdR(b, seed + i + 80) - 0.5) * 6, y1); } ctx.stroke(); }
function fdPatches(ctx, b, front, n, seed){ for (let i = 0; i < n; i++){ const w = 30 + fdR(b, seed + i) * 50, h = 18 + fdR(b, seed + i + 30) * 30, x = b.x + 14 + fdR(b, seed + i + 60) * Math.max(1, b.w - w - 28), y = b.y + 12 + fdR(b, seed + i + 90) * Math.max(1, b.h - front - h - 24); ctx.fillStyle = i % 2 ? 'rgba(255,255,255,.07)' : 'rgba(0,0,0,.09)'; ctx.fillRect(x, y, w, h); ctx.strokeStyle = 'rgba(0,0,0,.18)'; ctx.lineWidth = 1; ctx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1); fdRivetRow(ctx, x + 3, y + 3, w - 6, Math.max(2, Math.round(w / 12)), 'rgba(20,20,16,.45)'); } }
/* the parapet round a roof: a lighter lip along the top and sides, corner brackets, and a gutter with a downpipe */
function fdEdge(ctx, b, front){
  const f = b.h - front; fdBox(ctx, b.x, b.y, b.w, 3, 'rgba(255,255,255,.2)'); fdBox(ctx, b.x, b.y, 3, f, 'rgba(255,255,255,.12)'); fdBox(ctx, b.x + b.w - 3, b.y, 3, f, 'rgba(0,0,0,.18)');
  for (const [x, y] of [[b.x, b.y], [b.x + b.w - 8, b.y], [b.x, b.y + f - 8], [b.x + b.w - 8, b.y + f - 8]]){ fdBox(ctx, x, y, 8, 8, 'rgba(0,0,0,.25)'); fdBox(ctx, x + 1, y + 1, 6, 6, 'rgba(255,255,255,.1)'); }
  fdBox(ctx, b.x + b.w - 9, b.y + 10, 3, f - 18, 'rgba(40,44,36,.7)'); fdBox(ctx, b.x + b.w - 10, b.y + f - 10, 5, 3, 'rgba(40,44,36,.9)');
}
function fdAnt(ctx, x, y, h, t){ ctx.strokeStyle = '#C8CCD4'; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + h * 0.15, y - h); ctx.stroke(); fillCircle(ctx, x, y, 3, '#4A4E56'); fillCircle(ctx, x + h * 0.15, y - h, 2, Math.sin(t * 4 + x) > 0 ? '#FF5A4A' : '#5A2A22'); }

const FD_KIND = {
  hangar(ctx, b, t, f){
    const x = b.x, y = b.y, w = b.w, h = b.h; fdEdge(ctx, b, f); fdPatches(ctx, b, f, 6, 0); fdStreaks(ctx, b, f, 20);
    for (let i = 1; i < 7; i++){ const px = x + i * w / 7; fdBox(ctx, px - 1, y + 4, 2, h - f - 8, 'rgba(0,0,0,.22)'); fdRivetRow(ctx, px - 1, y + 8, 3, 1); for (let k = 0; k < 8; k++) fdBox(ctx, px - 1, y + 14 + k * (h - f - 30) / 8, 3, 3, 'rgba(20,20,16,.5)'); }
    for (let i = 0; i < 5; i++) fdSky(ctx, x + 60 + i * 90, y + 24, 54, 22);                                                                                    /* skylights along the ridge */
    for (let i = 0; i < 4; i++) fdFan(ctx, x + 90 + i * 120, y + 120, 12, t, true);                                                                              /* roof fans */
    fdVent(ctx, x + 40, y + 190, 60, 26, 5); fdVent(ctx, x + w - 110, y + 190, 60, 26, 5); fdAC(ctx, x + w - 90, y + 140, 54, 34, t);
    fdPipe(ctx, [x + 60, y + 230, x + 200, y + 230, x + 200, y + 250], 5, '#7A7E72', true); fdAnt(ctx, x + 40, y + 120, 70, t);
    ctx.strokeStyle = 'rgba(20,24,12,.2)'; ctx.lineWidth = 1; for (let i = 0; i < 8; i++){ ctx.beginPath(); ctx.moveTo(x + 20 + i * 62, y + 10); ctx.lineTo(x + 20 + i * 62 + 28, y + h - f - 10); ctx.stroke(); }          /* netting seams */
    const dx = x + w * 0.25, dw = w * 0.5, dy = y + h - f + 8; for (let i = 0; i < 12; i++) fdBox(ctx, dx + 2, dy + 2 + i * 2.4, dw - 4, 1, 'rgba(255,255,255,.07)');           /* the door's slats */
    for (const px of [dx, dx + dw]) { fdBox(ctx, px - 4, y + h - f, 8, f, '#3A3E34'); fdRivetRow(ctx, px - 3, y + h - f + 4, 6, 1); }
    fdDoor(ctx, x + 18, y + h - f + 4, 22, f - 8, '#3E4234'); fdLamp(ctx, x + 56, y + h - f + 6); fdLamp(ctx, x + w - 56, y + h - f + 6);
    fdStencil(ctx, 'A-17', x + 90, y + 100, 26, 0.3); fdBox(ctx, x + 10, y + h - 4, 80, 3, '#E8C84A');
    for (let i = 0; i < 3; i++) fdDrum(ctx, x + w + 14, y + 40 + i * 26, 10, i % 2 ? '#3A5A9A' : '#7A3A2A');                                                       /* drums by the wall */
  },
  radar(ctx, b, t){
    const cx = b.x + b.w / 2, cy = b.y + b.h / 2, r = b.w / 2;
    for (let k = 0; k < 24; k++){ const a = k * TAU / 24; fillCircle(ctx, cx + Math.cos(a) * (r - 5), cy + Math.sin(a) * (r - 5), 1.8, '#C8CCD4'); }
    ctx.strokeStyle = '#2E3028'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(cx, cy, r - 12, 0, TAU); ctx.stroke(); for (let k = 0; k < 24; k++){ const a = k * TAU / 24; ctx.moveTo(cx + Math.cos(a) * (r - 12), cy + Math.sin(a) * (r - 12)); ctx.lineTo(cx + Math.cos(a) * (r - 18), cy + Math.sin(a) * (r - 18)); } ctx.stroke();   /* the catwalk ring and its posts */
    for (let k = 0; k < 12; k++){ const a = k * TAU / 12 + 0.26; ctx.strokeStyle = 'rgba(80,86,96,.7)'; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(cx + Math.cos(a) * 12, cy + Math.sin(a) * 12); ctx.lineTo(cx + Math.cos(a) * (r * 0.38), cy + Math.sin(a) * (r * 0.38)); ctx.stroke(); }   /* dish struts */
    for (const [dx, dy] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]){ const px = cx + dx * (r + 8), py = cy + dy * (r + 8); fdBox(ctx, px - 5, py - 5, 10, 10, '#4A4E40'); ctx.strokeStyle = '#E8C84A'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(px - 5, py - 5); ctx.lineTo(px + 5, py + 5); ctx.stroke(); dt_bolt(ctx, px, py, 1.4, '#C8CCD4'); }   /* the plinth corners */
    for (let k = 0; k < 8; k++){ const a = k * TAU / 8; const on = Math.sin(t * 3 + k) > 0; fillCircle(ctx, cx + Math.cos(a) * (r - 22), cy + Math.sin(a) * (r - 22), 2.4, on ? '#FF5A4A' : '#5A2A22'); }
    fdBox(ctx, b.x - 14, b.y + b.h - 26, 20, 24, '#5A5E50'); fdVent(ctx, b.x - 12, b.y + b.h - 22, 16, 12, 3); fdCable(ctx, b.x + 4, b.y + b.h - 14, cx - r * 0.3, cy + r * 0.7, 14, '#1E1E1A');   /* a power cabinet and its cable */
    fdStencil(ctx, 'RADAR 3', cx, b.y + b.h + 16, 18, 0.35);
  },
  comms(ctx, b, t){
    const x = b.x, y = b.y, w = b.w, h = b.h, cx = x + w / 2, cy = y + h / 2;
    ctx.strokeStyle = '#2E3028'; ctx.lineWidth = 2; for (let k = 1; k < 4; k++){ const o = 14 + k * 9; ctx.strokeRect(x + o - 6, y + o - 6, w - 2 * o + 12, h - 2 * o + 12); }
    for (let k = 0; k < 4; k++){ const a = k * TAU / 4 + 0.78; ctx.strokeStyle = 'rgba(200,204,212,.5)'; ctx.lineWidth = 0.9; ctx.setLineDash([5, 4]); ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(a) * 100, cy + Math.sin(a) * 100); ctx.stroke(); ctx.setLineDash([]); fdBox(ctx, cx + Math.cos(a) * 100 - 3, cy + Math.sin(a) * 100 - 3, 6, 6, '#6A6E62'); }   /* guy wires to their anchors */
    for (let k = 0; k < 6; k++){ fdBox(ctx, x + 20 + k * 12, y + h - 22, 6, 3, '#C8CCD4'); }
    dt_bolts(ctx, [x + 4, y + 4, x + w - 4, y + 4, x + 4, y + h - 4, x + w - 4, y + h - 4], 1, 1.6);
    fdBox(ctx, x + w - 26, y + 12, 16, 10, '#C8CCD4'); fillCircle(ctx, x + w - 18, y + 17, 4, '#8A909C'); fdBox(ctx, x + 10, y + h - 14, 12, 8, '#2A2C26'); dt_led(ctx, x + 16, y + h - 10, 1.8, '#6AFFB0', Math.sin(t * 5) > -0.3);
  },
  bunker(ctx, b, t, f){
    const x = b.x, y = b.y, w = b.w, h = b.h; fdEdge(ctx, b, f); fdPatches(ctx, b, f, 7, 0); fdStreaks(ctx, b, f, 30);
    for (let i = 0; i < 10; i++){ fdBox(ctx, x + 36 + i * 84, y + 56, 2, h - f - 90, 'rgba(0,0,0,.18)'); } for (let j = 0; j < 4; j++) fdBox(ctx, x + 34, y + 80 + j * 62, w - 68, 2, 'rgba(0,0,0,.16)');
    for (let i = 0; i < 10; i++) for (let j = 0; j < 4; j++) dt_bolt(ctx, x + 36 + i * 84, y + 80 + j * 62, 1.6, 'rgba(210,214,200,.6)');
    for (const px of [x + 120, x + w - 190]){ for (let i = 0; i < 5; i++) for (let j = 0; j < 3; j++){ fdBox(ctx, px + i * 18, y + 150 + j * 14, 16, 12, '#1E3A6A'); fdBox(ctx, px + i * 18, y + 150 + j * 14, 16, 1.2, 'rgba(160,200,255,.6)'); } fdBox(ctx, px - 3, y + 147, 96, 2, '#8A909C'); }   /* the solar arrays */
    for (const [vx, vy] of [[x + 300, y + 40], [x + 330, y + 40], [x + w - 350, y + 40]]){ fillCircle(ctx, vx, vy, 9, '#2A2C26'); fillCircle(ctx, vx, vy, 6.6, '#5A5E54'); fillCircle(ctx, vx, vy, 3, '#14161C'); }   /* vent stacks */
    fdFan(ctx, x + w - 140, y + 70, 14, t, true); fdAC(ctx, x + 40, y + 60, 56, 34, t); fdAnt(ctx, x + w - 60, y + 60, 70, t); fdAnt(ctx, x + w - 90, y + 62, 54, t); fdPipe(ctx, [x + 120, y + 100, x + 220, y + 100, x + 220, y + 130], 6, '#7A7E72', true);
    fdHatch(ctx, x + 440, y + 60, 40, '#6E7064'); fdBox(ctx, x + 430, y + 54, 4, 52, '#C8CCD4'); fdBox(ctx, x + 484, y + 54, 4, 52, '#C8CCD4'); ctx.strokeStyle = '#C8CCD4'; ctx.lineWidth = 1.6; ctx.strokeRect(x + 430, y + 54, 58, 52);   /* a stair hatch with its railing */
    const dx = x + w / 2 - 56, dy = y + 94; for (let i = 0; i < 6; i++) dt_bolt(ctx, dx + 2 + i * 22, dy + 4, 1.8, '#C8CCD4'); fillCircle(ctx, dx + 56, dy + 41, 12, '#8A909C'); fillCircle(ctx, dx + 56, dy + 41, 9, '#5A5E54'); for (let k = 0; k < 4; k++){ ctx.strokeStyle = '#C8CCD4'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(dx + 56, dy + 41); ctx.lineTo(dx + 56 + Math.cos(k * 1.57) * 9, dy + 41 + Math.sin(k * 1.57) * 9); ctx.stroke(); }   /* the blast door's wheel */
    fdLamp(ctx, dx - 14, dy + 8); fdLamp(ctx, dx + 126, dy + 8); fdStencil(ctx, 'CP-1', x + 80, y + h - f - 40, 22, 0.28);
    for (let i = 0; i < 9; i++){ fdWin(ctx, x + w * (i + 1) / 10 - 9, y + h - f + 8, 18, f - 16, i !== 4, i % 2 ? '#5A6A9A' : null); }                              /* the windows get frames and curtains */
    fdBags(ctx, x + 14, y + h + 16, 9, false); fdBags(ctx, x + w - 150, y + h + 16, 9, false); fdBox(ctx, x + w / 2 - 16, y + h, 32, 30, '#A8A898'); for (let i = 0; i < 4; i++) fdBox(ctx, x + w / 2 - 16 + i * 2, y + h + 6 + i * 6, 32 - i * 4, 2, 'rgba(0,0,0,.25)');   /* sandbags and steps */
    for (let i = 0; i < 3; i++){ fdBox(ctx, x + 520 + i * 28, y + h - f - 28, 20, 14, '#5A5E50'); fdBox(ctx, x + 520 + i * 28, y + h - f - 28, 20, 2, 'rgba(255,255,255,.3)'); }
  },
  heli(ctx, b, t){
    const x = b.x, y = b.y, w = b.w, h = b.h, cx = x + w * 0.4, cy = y + h / 2;
    for (let k = 0; k < 4; k++){ const a = k * TAU / 4 + 0.5; ctx.strokeStyle = 'rgba(24,28,36,.85)'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(a) * w * 0.52, cy + Math.sin(a) * w * 0.52); ctx.stroke(); fd_tip(ctx, cx, cy, a, w * 0.52, 5); }
    for (const sd of [-1, 1]){ fdBox(ctx, x + 10, y + h / 2 + sd * 26 - 1, 80, 2.6, '#14161C'); fdBox(ctx, x + 30, y + h / 2 + sd * 20, 3, 14, '#14161C'); fdBox(ctx, x + 70, y + h / 2 + sd * 20, 3, 14, '#14161C'); }
    for (let k = 0; k < 5; k++) fdBox(ctx, x + 24 + k * 14, y + h / 2 - 12, 1.4, 24, 'rgba(0,0,0,.2)'); dt_bolts(ctx, [30, -8, 44, -8, 58, -8, 30, 8, 44, 8, 58, 8], 1, 1.1, '#8A909C'); for (let i = 0; i < 6; i += 2) ;
    fdStencil(ctx, '07', x + w * 0.62, y + h / 2 + 4, 12, 0.5); dt_led(ctx, x + w * 0.96, y + h / 2 - 12, 2, FD_NAV_R, Math.sin(t * 3) > 0); ctx.strokeStyle = '#C8402A'; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(x + 4, y + h - 8); ctx.lineTo(x + 40, y + h - 20); ctx.moveTo(x + w - 4, y + 8); ctx.lineTo(x + w - 40, y + 20); ctx.stroke();   /* tie-down straps */
    fdBox(ctx, x + 4, y + h - 10, 8, 4, '#C8402A'); fdBox(ctx, x + w - 12, y + 6, 8, 4, '#C8402A');
  },
  armoury(ctx, b, t, f){
    const x = b.x, y = b.y, w = b.w, h = b.h; fdEdge(ctx, b, f); fdPatches(ctx, b, f, 5, 0); fdStreaks(ctx, b, f, 25);
    for (let i = 0; i < 4; i++){ const px = x + 30 + i * (w - 60) / 4; for (let k = 0; k < 8; k++) fdBox(ctx, px + 4, y + 36 + k * 22, (w - 60) / 4 - 22, 2, 'rgba(0,0,0,.3)'); fdRivetRow(ctx, px + 4, y + 32, (w - 60) / 4 - 22, 5); fdRivetRow(ctx, px + 4, y + h - f - 44, (w - 60) / 4 - 22, 5); }
    for (let i = 0; i < 3; i++) fdVent(ctx, x + 60 + i * 160, y + 14, 50, 14, 4); fdAC(ctx, x + w - 90, y + 20, 56, 34, t); fdAnt(ctx, x + 40, y + 60, 60, t);
    for (let i = 0; i < 3; i++){ const dx = x + 60 + i * (w - 120) / 3, dw = (w - 120) / 3 - 18; for (let k = 0; k < 7; k++) fdBox(ctx, dx + 2, y + h - f + 8 + k * 3.4, dw - 4, 1, 'rgba(255,255,255,.1)'); fdBox(ctx, dx, y + h - f + 4, dw, 3, '#E8C84A'); }   /* roller doors */
    for (const [px, py] of [[x - 4, y + h - f - 6], [x + w - 12, y + h - f - 6]]) fdBags(ctx, px, py, 2, true);
    for (let i = 0; i < 3; i++) fdCrate(ctx, x + w + 6 + (i % 2) * 24, y + 150 + i * 22, 20, i % 2 ? '#7A6A3A' : '#8A7A4A'); fdLamp(ctx, x + 30, y + h - f + 8); fdLamp(ctx, x + w - 30, y + h - f + 8);
    fdStencil(ctx, 'ARMS', x + w / 2, y + 100, 34, 0.18); ctx.strokeStyle = 'rgba(200,204,212,.5)'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(x - 30, y + h + 6); ctx.lineTo(x + w + 30, y + h + 6); ctx.stroke(); for (let i = 0; i < 15; i++) fdBox(ctx, x - 30 + i * 41, y + h + 2, 2, 10, '#8A909C');   /* the fence */
  },
  tank(ctx, b, t){
    const cx = b.x + b.w / 2, cy = b.y + b.h / 2, r = b.w / 2;
    ctx.strokeStyle = 'rgba(0,0,0,.28)'; ctx.lineWidth = 1.2; for (const k of [0.84, 0.68, 0.5]){ ctx.beginPath(); ctx.arc(cx, cy, r * k, 0, TAU); ctx.stroke(); } ctx.beginPath(); for (let k = 0; k < 12; k++){ const a = k * TAU / 12 + 0.2; ctx.moveTo(cx + Math.cos(a) * r * 0.5, cy + Math.sin(a) * r * 0.5); ctx.lineTo(cx + Math.cos(a) * r * 0.9, cy + Math.sin(a) * r * 0.9); } ctx.stroke();
    for (let k = 0; k < 24; k++){ const a = k * TAU / 24; dt_bolt(ctx, cx + Math.cos(a) * (r - 8), cy + Math.sin(a) * (r - 8), 1.5, '#C8CCD4'); }
    fdHatch(ctx, cx - 36, cy + 14, 22, '#8A909C'); fillCircle(ctx, cx + 22, cy + 22, 9, '#2A2C26'); fillCircle(ctx, cx + 22, cy + 22, 7, '#E8E8E0'); ctx.strokeStyle = '#2A2C26'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(cx + 22, cy + 22); ctx.lineTo(cx + 26, cy + 18); ctx.stroke();   /* a gauge */
    fdPipe(ctx, [cx - r * 0.2, cy - r * 0.2, cx - r * 0.9, cy - r * 0.9], 4, '#6A5A3A', false); fillCircle(ctx, cx - r * 0.9, cy - r * 0.9, 5, '#8A909C'); for (let k = 0; k < 4; k++){ const a = k * 1.57; ctx.strokeStyle = '#C84A2A'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(cx - r * 0.9, cy - r * 0.9); ctx.lineTo(cx - r * 0.9 + Math.cos(a) * 5, cy - r * 0.9 + Math.sin(a) * 5); ctx.stroke(); }   /* the filler pipe and its valve wheel */
    ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, r - 3, 0, TAU); ctx.clip(); ctx.fillStyle = 'rgba(20,16,10,.25)'; ctx.beginPath(); ctx.ellipse(cx + 24, cy + 40, 30, 12, 0.3, 0, TAU); ctx.fill(); ctx.restore();
    ctx.fillStyle = '#E8C84A'; ctx.beginPath(); ctx.moveTo(cx + 34, cy - 30); ctx.lineTo(cx + 44, cy - 16); ctx.lineTo(cx + 24, cy - 16); ctx.closePath(); ctx.fill(); fdBox(ctx, cx + 33, cy - 27, 2, 6, '#1E1E22'); fillCircle(ctx, cx + 34, cy - 18.6, 1, '#1E1E22');   /* a warning diamond */
  },
  ammo(ctx, b, t){
    const x = b.x, y = b.y, w = b.w, h = b.h; for (let i = 0; i < 9; i++){ const bx = x + 14 + fdR(b, i) * (w - 40), by = y + 14 + fdR(b, i + 20) * (h - 70); ctx.fillStyle = i % 2 ? 'rgba(70,90,40,.35)' : 'rgba(40,52,24,.35)'; ctx.beginPath(); ctx.ellipse(bx, by, 14 + fdR(b, i + 40) * 12, 7 + fdR(b, i + 60) * 6, fdR(b, i + 80), 0, TAU); ctx.fill(); }   /* grass and camouflage over the mound */
    for (let i = 0; i < 3; i++){ fillCircle(ctx, x + 40 + i * 110, y + 30, 8, '#2A2C26'); fillCircle(ctx, x + 40 + i * 110, y + 30, 5.6, '#5A5E54'); fillCircle(ctx, x + 40 + i * 110, y + 30, 2.4, '#14161C'); }
    fdBags(ctx, x + 10, y + h - 24, 4, false); fdBags(ctx, x + w - 78, y + h - 24, 4, false); fdLamp(ctx, x + w / 2 - 52, y + h - 56); fdLamp(ctx, x + w / 2 + 52, y + h - 56);
    ctx.strokeStyle = 'rgba(20,16,10,.3)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x + w / 2 - 20, y + h); ctx.lineTo(x + w / 2 - 30, y + h + 24); ctx.moveTo(x + w / 2 + 20, y + h); ctx.lineTo(x + w / 2 + 26, y + h + 24); ctx.stroke();   /* tyre tracks to the door */
    for (let i = 0; i < 2; i++) fdCrate(ctx, x + w + 4, y + 20 + i * 24, 20, '#7A6A3A'); fdStencil(ctx, 'AMMO', x + w / 2, y + 84, 22, 0.3);
  },
  barracks(ctx, b, t, f){
    const x = b.x, y = b.y, w = b.w, h = b.h; fdEdge(ctx, b, f); fdStreaks(ctx, b, f, 10);
    for (let j = 0; j < 7; j++){ const yy = y + 8 + j * (h - f - 14) / 7; for (let i = 0; i < w / 36; i++) fdBox(ctx, x + 6 + i * 36, yy, 34, 1.2, 'rgba(255,255,255,.07)'); }
    fdAC(ctx, x + 30, y + 24, 46, 28, t); fdVent(ctx, x + 130, y + 28, 36, 18, 4); fillCircle(ctx, x + w * 0.72 + 12, y + 30, 8, '#2A2C26'); fillCircle(ctx, x + w * 0.72 + 12, y + 30, 5, '#14161C'); fdAnt(ctx, x + w - 60, y + 70, 54, t);
    fdPipe(ctx, [x + 90, y + 100, x + 90, y + 130, x + 150, y + 130], 4, '#7A7E72', false); fdHatch(ctx, x + w - 120, y + 110, 24, '#6A6E5A');
    for (let i = 0; i < Math.max(3, Math.round(w / 90)); i++){ const gap = w / (Math.max(3, Math.round(w / 90)) + 1), wx = x + gap * (i + 1) - 10; fdWin(ctx, wx, y + h - f + 5, 20, f - 11, i % 3 !== 1, i % 2 ? '#7A4A3A' : '#4A5A7A'); fdBox(ctx, wx - 6, y + h - f + 4, 4, f - 9, '#3A3E32'); fdBox(ctx, wx + 22, y + h - f + 4, 4, f - 9, '#3A3E32'); }   /* shutters */
    fdDoor(ctx, x + w / 2 - 14, y + h - f + 2, 28, f - 4, '#3E4234'); fdBox(ctx, x + w / 2 - 22, y + h - 4, 44, 3, '#8A8A7A'); fdBox(ctx, x + w / 2 - 20, y + h - 1, 40, 3, '#A8A898');
    fdStencil(ctx, 'B-' + (1 + (b.idx % 4)), x + 40, y + h - f - 10, 18, 0.3); fdLamp(ctx, x + w / 2 - 28, y + h - f + 4); fdLamp(ctx, x + w / 2 + 28, y + h - f + 4);
    ctx.strokeStyle = '#8A8A7A'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x + w + 6, y + 10); ctx.lineTo(x + w + 6, y + 70); ctx.moveTo(x + w + 40, y + 10); ctx.lineTo(x + w + 40, y + 70); ctx.stroke(); ctx.strokeStyle = 'rgba(40,40,30,.6)'; ctx.beginPath(); ctx.moveTo(x + w + 6, y + 20); ctx.quadraticCurveTo(x + w + 24, y + 28, x + w + 40, y + 20); ctx.stroke();
    for (let i = 0; i < 4; i++) fdBox(ctx, x + w + 10 + i * 8, y + 22 + (i % 2) * 2, 6, 12, ['#E8E8D8', '#6A8A4A', '#C8C8B8', '#8A9A6A'][i]);                    /* laundry on the line */
    fdCrate(ctx, x + w - 40, y + h + 6, 16, '#7A6A3A'); fdDrum(ctx, x + w - 14, y + h + 14, 8, '#3A5A9A'); fdBox(ctx, x + 18, y + h + 6, 28, 8, '#6A4A2A'); fdBox(ctx, x + 18, y + h + 14, 3, 4, '#2A2A22'); fdBox(ctx, x + 43, y + h + 14, 3, 4, '#2A2A22');   /* a bench */
  },
  mess(ctx, b, t, f){
    const x = b.x, y = b.y, w = b.w, h = b.h; fdEdge(ctx, b, f); fdStreaks(ctx, b, f, 12); fdPatches(ctx, b, f, 3, 0);
    for (let i = 0; i < 3; i++) fdFan(ctx, x + 80 + i * 70, y + 70, 14, t, true);
    for (let i = 0; i < 3; i++){ fdBox(ctx, x + 60 + i * 70, y + 100, 40, 14, '#6A6E74'); fdVent(ctx, x + 64 + i * 70, y + 102, 32, 10, 3); }
    fdSky(ctx, x + 330, y + 30, 80, 30); fdSky(ctx, x + 330, y + 90, 80, 30); fdPipe(ctx, [x + 440, y + 40, x + 440, y + 120, x + 500, y + 120], 6, '#8A8E92', true); fdAC(ctx, x + 420, y + 150, 56, 34, t); fdAnt(ctx, x + w - 40, y + 60, 50, t);
    for (let i = 0; i < 6; i++){ const gap = w / 7, wx = x + gap * (i + 1) - 10; fdWin(ctx, wx, y + h - f + 5, 20, f - 11, true, i % 2 ? '#C8402A' : '#E8E8D8'); }
    fdDoor(ctx, x + w / 2 - 14, y + h - f + 2, 28, f - 4, '#4A4234'); ctx.fillStyle = '#D8483A'; for (let i = 0; i < 8; i++){ ctx.fillStyle = i % 2 ? '#D8483A' : '#F4EEE0'; ctx.fillRect(x + w / 2 + 30 + i * 6, y + h - f - 2, 6, 14); } fdBox(ctx, x + w / 2 + 30, y + h - f + 12, 48, 3, 'rgba(0,0,0,.25)');   /* the serving window's awning */
    for (let i = 0; i < 2; i++){ fdBox(ctx, x + w + 6, y + 40 + i * 50, 34, 26, '#2E5A34'); fdBox(ctx, x + w + 6, y + 40 + i * 50, 34, 5, '#3E7A46'); fdBox(ctx, x + w + 8, y + 52 + i * 50, 30, 1.4, 'rgba(0,0,0,.3)'); }   /* dumpsters */
    for (let i = 0; i < 2; i++){ fdBox(ctx, x + 40 + i * 70, y + h + 8, 44, 6, '#8A6A3A'); fdBox(ctx, x + 40 + i * 70, y + h + 14, 3, 6, '#2A2A22'); fdBox(ctx, x + 81 + i * 70, y + h + 14, 3, 6, '#2A2A22'); fdBox(ctx, x + 40 + i * 70, y + h + 22, 44, 5, '#7A5A2A'); }   /* picnic tables */
    for (let i = 0; i < 2; i++) fdDrum(ctx, x + w - 60 + i * 20, y + h + 14, 9, '#C8C8C0'); fdStencil(ctx, 'MESS', x + 80, y + h - f - 12, 20, 0.3); fdLamp(ctx, x + w / 2 - 28, y + h - f + 4);
  },
  garage(ctx, b, t, f){
    const x = b.x, y = b.y, w = b.w, h = b.h; fdEdge(ctx, b, f); fdStreaks(ctx, b, f, 14); fdPatches(ctx, b, f, 3, 0);
    for (let i = 0; i < 2; i++) fdSky(ctx, x + 40 + i * 140, y + 30, 70, 26); fdAC(ctx, x + w - 100, y + 24, 56, 34, t); fdVent(ctx, x + 40, y + 120, 40, 20, 4); fdPipe(ctx, [x + 130, y + 130, x + 220, y + 130, x + 220, y + 100], 4, '#7A7E72', true);
    for (let i = 0; i < 3; i++){ const dx = x + 20 + i * (w - 40) / 3, dw = (w - 40) / 3 - 14; for (let k = 0; k < 6; k++) fdBox(ctx, dx + 2, y + h - f + 7 + k * 6, dw - 4, 1, 'rgba(255,255,255,.1)'); fdBox(ctx, dx + dw / 2 - 6, y + h - f + 6, 12, 4, '#1E1E1A'); fdBox(ctx, dx + dw / 2 - 10, y + h - f + 36, 20, 3, '#E8C84A'); fdLamp(ctx, dx + dw / 2, y + h - f - 2); }
    ctx.strokeStyle = 'rgba(244,244,236,.4)'; ctx.lineWidth = 3; ctx.beginPath(); for (let i = 0; i < 3; i++){ const dx = x + 20 + i * (w - 40) / 3; ctx.moveTo(dx, y + h + 2); ctx.lineTo(dx, y + h + 42); ctx.moveTo(dx + (w - 40) / 3 - 14, y + h + 2); ctx.lineTo(dx + (w - 40) / 3 - 14, y + h + 42); } ctx.stroke();   /* bay lines */
    for (let i = 0; i < 3; i++) fdDrum(ctx, x - 16, y + 30 + i * 22, 8, i % 2 ? '#3A5A9A' : '#7A3A2A'); for (let i = 0; i < 3; i++){ fillCircle(ctx, x + w + 14, y + h - 14 - i * 6, 11, '#1A1C22'); fillCircle(ctx, x + w + 14, y + h - 14 - i * 6, 5, '#3A3C44'); }   /* a stack of tyres */
    fdStencil(ctx, 'MOTOR POOL', x + w / 2, y + h - f - 12, 16, 0.3);
  },
  gate(ctx, b, t, f){
    const x = b.x, y = b.y, w = b.w, h = b.h; fdEdge(ctx, b, f); fdAC(ctx, x + w - 56, y + 70, 40, 26, t); fdAnt(ctx, x + 30, y + 80, 50, t); fdBags(ctx, x - 4, y + h + 4, 4, false); fdBags(ctx, x + w - 60, y + h + 4, 4, false);
    fdWin(ctx, x + 24, y + 22, w - 48, 24, true, null); fdBox(ctx, x + 20, y + 54, w - 40, 2, 'rgba(0,0,0,.3)'); fdBox(ctx, x + 14, y + 8, 22, 8, '#E8C84A'); fdStencil(ctx, 'HALT', x + w / 2, y + 100, 20, 0.45);
    const left = x + w / 2 < ARENA_W / 2; fdBox(ctx, left ? x + w : x - 90, y + h - 24, 90, 8, '#F4F0E0'); for (let i = 0; i < 5; i++) fdBox(ctx, (left ? x + w : x - 90) + i * 18 + 6, y + h - 24, 9, 8, '#D8483A'); fdBox(ctx, left ? x + w - 2 : x - 10, y + h - 30, 12, 20, '#4A4E40'); fillCircle(ctx, left ? x + w + 4 : x - 4, y + h - 20, 3, '#FF5A4A');   /* the barrier arm */
    fdBox(ctx, left ? x + w + 10 : x - 70, y + h + 8, 60, 10, '#3A3A34'); for (let i = 0; i < 10; i++) tw_poly(ctx, [(left ? x + w + 12 : x - 68) + i * 6, y + h + 8, (left ? x + w + 15 : x - 65) + i * 6, y + h + 2, (left ? x + w + 18 : x - 62) + i * 6, y + h + 8], '#C8CCD4');   /* a spike strip */
  },
  plant(ctx, b, t, f){
    const x = b.x, y = b.y, w = b.w, h = b.h; fdEdge(ctx, b, f); fdPatches(ctx, b, f, 5, 0);
    for (let i = 0; i < 8; i++) for (let j = 0; j < 3; j++) fdRivetRow(ctx, x + 20 + i * 120, y + 24 + j * 120, 100, 4, 'rgba(10,30,22,.5)');
    for (let i = 0; i < 6; i++) fdFan(ctx, x + 80 + i * 150, y + 40, 16, t, true);
    fdPipe(ctx, [x + 200, y + 190, x + 200, y + 140, x + 500, y + 140, x + 500, y + 190], 8, '#4A8A74', true); fdPipe(ctx, [x + 500, y + 230, x + 500, y + 280, x + 800, y + 280, x + 800, y + 230], 8, '#7A8A84', true); fdPipe(ctx, [x + 120, y + 250, x + 120, y + 330, x + 400, y + 330], 6, '#B8863A', true);
    for (let i = 0; i < 8; i++){ const gx = x + 60 + i * 56, gy = y + 346; fillCircle(ctx, gx, gy, 9, '#10201A'); fillCircle(ctx, gx, gy, 7, '#E8F0EC'); ctx.strokeStyle = '#C84A2A'; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(gx, gy); ctx.lineTo(gx + Math.cos(t * 0.6 + i) * 5, gy + Math.sin(t * 0.6 + i) * 5); ctx.stroke(); }   /* pressure gauges */
    for (let i = 0; i < 3; i++){ const cx = x + 780 + i * 66, cy = y + 330; fillCircle(ctx, cx, cy, 26, '#10201A'); fillCircle(ctx, cx, cy, 22, '#2E4A3E'); fillCircle(ctx, cx, cy, 14, 'rgba(122,255,200,' + (0.4 + 0.2 * Math.sin(t * 2 + i)) + ')'); ctx.strokeStyle = 'rgba(200,236,224,.5)'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(cx, cy, 22, 0, TAU); ctx.stroke(); }   /* storage drums */
    for (let k = 0; k < 14; k++){ const sx = x + 230 + fdR(b, k) * 560, sy = y + 160 + fdR(b, k + 30) * 60; tw_poly(ctx, [sx, sy, sx + 3, sy - 12 - fdR(b, k + 60) * 8, sx + 6, sy], '#9AF0C8'); tw_poly(ctx, [sx + 1.4, sy, sx + 3, sy - 8, sx + 4.6, sy], '#E8FFF4'); }   /* glimmer crystals growing where the pipes leak */
    for (let i = 0; i < 4; i++){ fdBox(ctx, x + w - 40, y + 30 + i * 60, 22, 40, '#2E4A3E'); fdBox(ctx, x + w - 40, y + 30 + i * 60, 22, 4, 'rgba(255,255,255,.3)'); dt_led(ctx, x + w - 29, y + 50 + i * 60, 3, i % 2 ? '#7AFFC8' : FD_NAV_R, Math.sin(t * 3 + i) > -0.4); }
    fdStencil(ctx, 'GLIMMER PLANT', x + w / 2, y + h - f - 14, 22, 0.28); for (let i = 0; i < 4; i++) fdWin(ctx, x + 80 + i * 240, y + h - f + 8, 24, f - 18, true, null);
  },
  gen(ctx, b, t){
    const x = b.x, y = b.y, w = b.w, h = b.h; fdRivetRow(ctx, x + 6, y + 6, w - 12, 6, 'rgba(20,20,16,.5)'); fdRivetRow(ctx, x + 6, y + h - 9, w - 12, 6, 'rgba(20,20,16,.5)');
    fdBox(ctx, x + w * 0.58, y + 6, 4, h - 12, 'rgba(0,0,0,.3)'); fdBox(ctx, x + w * 0.62, y + h - 18, 22, 10, '#2A2C26'); for (let i = 0; i < 3; i++) fdBox(ctx, x + w * 0.64 + i * 6, y + h - 16, 3, 6, i === 1 ? '#7AF0B0' : '#E8C84A');
    fillCircle(ctx, x + w - 12, y + 14, 4, '#8A909C'); fillCircle(ctx, x + w - 12, y + 14, 2, '#2A2C26'); fdPipe(ctx, [x + w - 4, y + h * 0.5, x + w + 14, y + h * 0.5, x + w + 14, y + h * 0.2], 4, '#4A4E56', false);
    fdCable(ctx, x + 6, y + h - 4, x - 22, y + h + 18, 8, '#1E1E1A'); fdBox(ctx, x + 4, y + h * 0.5 - 6, 3, 12, '#C8CCD4'); fdStencil(ctx, '5kW', x + w * 0.3, y + h - 12, 11, 0.5);
    if (Math.sin(t * 7 + b.idx) > 0.3){ ctx.fillStyle = 'rgba(160,160,150,.35)'; ctx.beginPath(); ctx.arc(x + w + 16, y + h * 0.15 - (t * 8 % 10), 3, 0, TAU); ctx.fill(); }
  },
  light(ctx, b, t){
    const cx = b.x + b.w / 2, cy = b.y + b.h / 2; for (let k = 0; k < 8; k++){ const a = k * TAU / 8; fdBox(ctx, cx + Math.cos(a) * 28 - 2, cy + Math.sin(a) * 28 - 2, 4, 4, '#8A909C'); }
    ctx.strokeStyle = '#2E3028'; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.arc(cx, cy, 22, 0, TAU); ctx.stroke(); ctx.strokeStyle = 'rgba(200,204,212,.5)'; ctx.beginPath(); ctx.arc(cx, cy, 18, 0, TAU); ctx.stroke();
    fdBox(ctx, b.x + 6, cy - 2, 6, 4, '#C8CCD4'); fdBox(ctx, b.x + b.w - 12, cy - 2, 6, 4, '#C8CCD4'); fdCable(ctx, cx + 8, b.y + b.h - 6, cx + 30, b.y + b.h + 20, 8, '#1E1E1A');
    const a = b.gen && b.gen.collapsed ? 0 : fortLightAng(b, t); if (!(b.gen && b.gen.collapsed)){ fdBox(ctx, cx + Math.cos(a) * 8 - 3, cy + Math.sin(a) * 8 - 6, 6, 12, 'rgba(0,0,0,.3)'); }
  },
  flag(ctx, b, t){
    const cx = b.x + b.w / 2, cy = b.y + b.h / 2; for (let k = 0; k < 14; k++){ const a = k * TAU / 14; fillCircle(ctx, cx + Math.cos(a) * 28, cy + Math.sin(a) * 28, 3.2, k % 2 ? '#8A8A7A' : '#6A6A5A'); }
    for (let k = 0; k < 6; k++) dt_bolt(ctx, cx + Math.cos(k * 1.047) * 14, cy + Math.sin(k * 1.047) * 14, 1.3, '#C8CCD4'); ctx.strokeStyle = '#C8B07A'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + 18, cy + 20); ctx.stroke(); fdBox(ctx, cx + 16, cy + 19, 5, 4, '#8A909C'); fdBox(ctx, cx - 10, cy + 26, 20, 5, '#B8B8A8'); fdBox(ctx, cx - 6, cy + 27, 12, 1.4, '#3A3A30');
  },
  depot(ctx, b, t, f){
    const x = b.x, y = b.y, w = b.w, h = b.h; fdEdge(ctx, b, f); fdStreaks(ctx, b, f, 16);
    for (let i = 0; i < 3; i++) fdSky(ctx, x + 40 + i * 150, y + 24, 60, 24); fdAC(ctx, x + w - 90, y + 26, 56, 34, t); fdVent(ctx, x + 40, y + h - f - 44, 60, 26, 5); fdAnt(ctx, x + w - 40, y + 110, 54, t);
    for (let i = 0; i < 3; i++){ const dx = x + 50 + i * 150; fdBox(ctx, dx, y + h - f + 4, 90, f - 8, '#2A2C26'); for (let k = 0; k < 6; k++) fdBox(ctx, dx + 2, y + h - f + 6 + k * 3.8, 86, 1, 'rgba(255,255,255,.12)'); fdBox(ctx, dx, y + h - f + 2, 90, 3, '#E8C84A'); fdLamp(ctx, dx + 45, y + h - f - 2); }
    for (let i = 0; i < 4; i++) fdCrate(ctx, x + w + 8 + (i % 2) * 22, y + 40 + Math.floor(i / 2) * 24, 18, i % 2 ? '#7A6A3A' : '#A88A52'); fdBox(ctx, x - 40, y + h - 40, 34, 20, '#E8A83A'); fdBox(ctx, x - 40, y + h - 40, 34, 4, 'rgba(255,255,255,.4)'); fillCircle(ctx, x - 34, y + h - 18, 4, '#1E1E22'); fillCircle(ctx, x - 12, y + h - 18, 4, '#1E1E22');   /* a forklift */
    fdStencil(ctx, 'SUPPLY', x + w / 2, y + 130, 28, 0.2);
  },
  jeep(ctx, b, t){ fdVeh(ctx, b, 'jeep'); }, truck(ctx, b, t){ fdVeh(ctx, b, 'truck'); }, apc(ctx, b, t){ fdVeh(ctx, b, 'apc'); },
  turret(ctx, b, t){
    const cx = b.x + b.w / 2, cy = b.y + b.h / 2; for (let k = 0; k < 12; k++){ const a = k * TAU / 12 + 0.26; ctx.strokeStyle = 'rgba(60,46,24,.55)'; ctx.lineWidth = 0.9; ctx.beginPath(); ctx.moveTo(cx + Math.cos(a) * 29, cy + Math.sin(a) * 29); ctx.lineTo(cx + Math.cos(a) * 37, cy + Math.sin(a) * 37); ctx.stroke(); }
    for (let k = 0; k < 8; k++) dt_bolt(ctx, cx + Math.cos(k * 0.785) * 19, cy + Math.sin(k * 0.785) * 19, 1.1, '#C8CCD4'); for (let k = 0; k < 5; k++){ const a = k * 1.3 + 0.4; fdBox(ctx, cx + Math.cos(a) * 44 - 1.5, cy + Math.sin(a) * 44 - 1, 3, 2, FD_BRASS); }
    fdCrate(ctx, cx - 56, cy + 22, 14, '#5A6A3A'); fdBox(ctx, cx + 44, cy - 30, 8, 12, '#4A4E40'); fdBox(ctx, cx + 45, cy - 28, 6, 2, '#E8C84A');
  }
};
/* a parked vehicle: wheel hubs, lamps, a tarp or a turret, stencils, mud */
function fdVeh(ctx, b, kind){
  const x = b.x, y = b.y, w = b.w, h = b.h; ctx.fillStyle = 'rgba(70,54,30,.4)'; for (let i = 0; i < 5; i++){ ctx.beginPath(); ctx.ellipse(x + 6 + fdR(b, i) * (w - 12), y + 8 + fdR(b, i + 10) * (h - 16), 5 + fdR(b, i + 20) * 4, 2.4, 0, 0, TAU); ctx.fill(); }
  for (const sd of [-1, 1]) for (const f of [0.14, 0.5, 0.86]){ if (kind !== 'truck' && f === 0.5) continue; fillCircle(ctx, x + w * f, y + (sd < 0 ? 1 : h - 1), 3.4, '#4A4E58'); fillCircle(ctx, x + w * f, y + (sd < 0 ? 1 : h - 1), 1.4, '#C8CCD4'); }
  for (const sd of [-1, 1]){ fillCircle(ctx, x + w - 3, y + h / 2 + sd * (h * 0.3), 2, '#FFF2B0'); fillCircle(ctx, x + 3, y + h / 2 + sd * (h * 0.3), 1.6, '#C8402A'); }
  fdBox(ctx, x + w - 12, y + h / 2 - 4, 8, 8, 'rgba(0,0,0,.2)'); for (let k = 0; k < 3; k++) fdBox(ctx, x + w - 11, y + h / 2 - 3 + k * 2.6, 6, 0.8, 'rgba(255,255,255,.4)');
  if (kind === 'truck'){ ctx.strokeStyle = 'rgba(0,0,0,.3)'; ctx.lineWidth = 1; for (let k = 0; k < 8; k++){ ctx.beginPath(); ctx.moveTo(x + 8 + k * w * 0.075, y + 12); ctx.lineTo(x + 8 + k * w * 0.075 + 4, y + h - 12); ctx.stroke(); } fdBox(ctx, x + 4, y + 8, w * 0.62, 2, 'rgba(255,255,255,.2)'); fdStencil(ctx, 'US-' + (11 + b.idx % 9), x + w * 0.34, y + h / 2 + 4, 10, 0.5); }
  else if (kind === 'jeep'){ fdStencil(ctx, '4' + (b.idx % 9), x + 36, y + h / 2 + 3, 9, 0.5); fdBox(ctx, x + 6, y + 6, 4, h - 12, '#2A2C26'); fdBox(ctx, x + w * 0.5 - 5, y + h / 2 - 8, 10, 2, '#C8CCD4'); }
  else { fdBox(ctx, x + 10, y + h - 14, 24, 4, '#1E1E1A'); fillCircle(ctx, x + 14, y + 16, 3, '#8A909C'); fdStencil(ctx, 'C-' + (3 + b.idx % 9), x + w * 0.24, y + h / 2 + 3, 10, 0.5); }
}
function ftDetail(ctx, b, t){
  const fn = FD_KIND[b.kind]; if (!fn) return;
  const f = { hangar: 40, bunker: 50, armoury: 44, barracks: 34, mess: 34, depot: 34, garage: 46, plant: 46, gate: 32 }[b.kind] || 0;
  fn(ctx, b, t, f);
}

/* ---------------------------------------------------------------- the ground, drawn with the cached ground (nothing here moves) */
function ftGroundDetail(ctx, x0, y0, x1, y1){
  const on = function(x, y, m){ return x > x0 - m && x < x1 + m && y > y0 - m && y < y1 + m; };
  /* oil stains and tyre tracks on the motor pool */
  for (let i = 0; i < 26; i++){ const x = 300 + csR(i + 52000) * 3300, y = 2430 + csR(i + 52100) * 540; if (!on(x, y, 60)) continue; ctx.fillStyle = 'rgba(10,10,14,' + (0.16 + csR(i + 52200) * 0.14).toFixed(2) + ')'; ctx.beginPath(); ctx.ellipse(x, y, 10 + csR(i + 52300) * 26, 5 + csR(i + 52400) * 12, csR(i + 52500) * 3, 0, TAU); ctx.fill(); }
  ctx.strokeStyle = 'rgba(14,14,18,.28)'; ctx.lineWidth = 5; for (let i = 0; i < 10; i++){ const y = 2440 + i * 54, x = 300 + csR(i + 52600) * 2600; if (!on(x + 300, y, 400)) continue; for (const o of [0, 14]){ ctx.beginPath(); ctx.moveTo(x, y + o); ctx.bezierCurveTo(x + 200, y + o + 14, x + 340, y + o - 12, x + 560, y + o + 8); ctx.stroke(); } }
  /* cracks and patched asphalt on the parade ground and the road */
  ctx.strokeStyle = 'rgba(24,26,24,.4)'; ctx.lineWidth = 1.6; for (let i = 0; i < 40; i++){ const px = 1520 + csR(i + 52700) * 1160, py = 720 + csR(i + 52800) * 960; if (!on(px, py, 90)) continue; ctx.beginPath(); ctx.moveTo(px, py); for (let k = 0; k < 4; k++) ctx.lineTo(px + (csR(i * 5 + k + 52900) - 0.4) * 60 * (k + 1), py + (csR(i * 7 + k + 53000) - 0.3) * 50 * (k + 1)); ctx.stroke(); }
  for (let i = 0; i < 8; i++){ const px = 1560 + csR(i + 53100) * 1000, py = 760 + csR(i + 53200) * 880; if (!on(px, py, 80)) continue; ctx.fillStyle = 'rgba(40,42,40,.2)'; ctx.fillRect(px, py, 50 + csR(i + 53300) * 40, 30 + csR(i + 53400) * 30); ctx.strokeStyle = 'rgba(20,20,20,.3)'; ctx.lineWidth = 1; ctx.strokeRect(px + 0.5, py + 0.5, 50 + csR(i + 53300) * 40, 30 + csR(i + 53400) * 30); }
  /* drains, manholes and puddles */
  for (let i = 0; i < 30; i++){ const x = 160 + csR(i + 53500) * 3880, y = 160 + csR(i + 53600) * 2820; if (!on(x, y, 30)) continue;
    if (i % 3 === 0){ ctx.fillStyle = 'rgba(40,42,48,.85)'; ctx.beginPath(); ctx.arc(x, y, 13, 0, TAU); ctx.fill(); ctx.strokeStyle = 'rgba(14,16,18,.8)'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.arc(x, y, 8, 0, TAU); ctx.moveTo(x - 8, y); ctx.lineTo(x + 8, y); ctx.moveTo(x, y - 8); ctx.lineTo(x, y + 8); ctx.stroke(); }
    else if (i % 3 === 1){ ctx.fillStyle = 'rgba(30,32,36,.8)'; ctx.fillRect(x - 17, y - 6, 34, 12); ctx.fillStyle = 'rgba(120,124,132,.7)'; for (let k = 0; k < 6; k++) ctx.fillRect(x - 15 + k * 5.6, y - 4, 3, 8); }
    else { ctx.fillStyle = 'rgba(60,90,120,.3)'; ctx.beginPath(); ctx.ellipse(x, y, 24, 10, csR(i + 53700), 0, TAU); ctx.fill(); ctx.fillStyle = 'rgba(255,255,255,.18)'; ctx.beginPath(); ctx.ellipse(x - 5, y - 2, 9, 3, csR(i + 53700), 0, TAU); ctx.fill(); } }
  /* drums, crates and tyres by the depots and the barracks */
  for (const [px, py, n] of [[3350, 1180, 4], [3790, 1700, 5], [820, 2330, 5], [3300, 1880, 3], [1470, 2380, 4], [2900, 640, 3]]) for (let i = 0; i < n; i++){ const x = px + (i % 3) * 22 + csR(px + i) * 8, y = py + Math.floor(i / 3) * 22; if (!on(x, y, 30)) continue; if (i % 2) fdDrum(ctx, x, y, 9, i % 4 === 1 ? '#3A5A9A' : '#7A3A2A'); else fdCrate(ctx, x - 8, y - 8, 16, '#8A7A4A'); }
  /* tank traps and a few strands of barbed wire at the gate */
  ctx.strokeStyle = '#4A4E40'; ctx.lineWidth = 3; for (const [px, py] of [[1560, 2640], [1620, 2700], [2580, 2640], [2640, 2700], [1500, 2930], [2700, 2930]]){ if (!on(px, py, 30)) continue; for (let k = 0; k < 3; k++){ const a = k * 1.047; ctx.beginPath(); ctx.moveTo(px - Math.cos(a) * 14, py - Math.sin(a) * 14); ctx.lineTo(px + Math.cos(a) * 14, py + Math.sin(a) * 14); ctx.stroke(); } }
  /* tents and a camp fire ring in the barracks yard, a washing line, a few trees of rubbish */
  for (const [tx, ty, c] of [[690, 940, '#5A6A3A'], [690, 1260, '#6A5A3A'], [690, 1580, '#5A6A3A']]){ if (!on(tx, ty, 60)) continue; ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.fillRect(tx - 28, ty - 18, 62, 46); ctx.fillStyle = c; ctx.beginPath(); ctx.moveTo(tx - 28, ty + 24); ctx.lineTo(tx, ty - 22); ctx.lineTo(tx + 28, ty + 24); ctx.closePath(); ctx.fill(); ctx.fillStyle = 'rgba(255,255,255,.14)'; ctx.beginPath(); ctx.moveTo(tx, ty - 22); ctx.lineTo(tx + 28, ty + 24); ctx.lineTo(tx, ty + 24); ctx.closePath(); ctx.fill(); ctx.strokeStyle = 'rgba(0,0,0,.35)'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(tx, ty - 22); ctx.lineTo(tx, ty + 24); ctx.stroke(); fdBox(ctx, tx - 5, ty + 8, 10, 16, '#1E1E1A'); }
  for (const [fx, fy] of [[760, 1100], [760, 1420]]){ if (!on(fx, fy, 40)) continue; for (let k = 0; k < 8; k++){ const a = k * 0.785; fillCircle(ctx, fx + Math.cos(a) * 12, fy + Math.sin(a) * 12, 3.4, '#6A6A5A'); } fillCircle(ctx, fx, fy, 7, '#2A1E14'); fillCircle(ctx, fx, fy, 3.4, 'rgba(255,140,40,.6)'); }
  /* cable runs from the generators to their lights */
  if (typeof FT !== 'undefined' && FT.lights.length){ ctx.strokeStyle = 'rgba(20,20,16,.6)'; ctx.lineWidth = 2.4; for (let i = 0; i < FT.lights.length; i++){ const l = FT.lights[i], g = l.gen; if (!g) continue; const ax = g.x + g.w / 2, ay = g.y + g.h / 2, bx = l.x + l.w / 2, by = l.y + l.h / 2; if (!on((ax + bx) / 2, (ay + by) / 2, Math.abs(ax - bx) + Math.abs(ay - by))) continue; ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(ax + (bx - ax) * 0.5, ay); ctx.lineTo(bx, by); ctx.stroke(); } }
  /* weeds and gravel drifts along the walls, painted arrows on the road, hydrants */
  for (let i = 0; i < 90; i++){ const edge = i % 4, a = 70 + csR(i + 54000) * 4060, wx = edge === 0 ? a : edge === 1 ? a : edge === 2 ? 70 : 4130, wy = edge === 0 ? 76 : edge === 1 ? 3074 : a * 0.75 + 70, d = 4 + csR(i + 54100) * 14; if (!on(wx, wy, 20)) continue; ctx.strokeStyle = i % 2 ? '#5A7A3A' : '#4A6A2E'; ctx.lineWidth = 1.2; ctx.beginPath(); for (let k = 0; k < 4; k++){ const ox = (csR(i * 3 + k + 54200) - 0.5) * 10; ctx.moveTo(wx + ox, wy); ctx.lineTo(wx + ox + (k - 1.5) * 2, wy + (edge === 1 ? -d : d)); } ctx.stroke(); }
  ctx.fillStyle = 'rgba(244,244,236,.45)'; for (const [ax, ay] of [[1000, 2760], [1400, 2760], [2800, 2760], [3300, 2760]]){ if (!on(ax, ay, 40)) continue; ctx.beginPath(); ctx.moveTo(ax - 22, ay + 6); ctx.lineTo(ax + 4, ay + 6); ctx.lineTo(ax + 4, ay + 14); ctx.lineTo(ax + 26, ay); ctx.lineTo(ax + 4, ay - 14); ctx.lineTo(ax + 4, ay - 6); ctx.lineTo(ax - 22, ay - 6); ctx.closePath(); ctx.fill(); }
  for (const [hx, hy] of [[1480, 700], [2720, 700], [1480, 1690], [2720, 1690], [3300, 640]]){ if (!on(hx, hy, 20)) continue; fillCircle(ctx, hx, hy, 6, '#8A2A22'); fillCircle(ctx, hx, hy, 3.4, '#C8402A'); fdBox(ctx, hx - 9, hy - 2, 18, 4, '#8A2A22'); }
}

/* ---------------------------------------------------------------- what is left of a building */
function ftRuinDetail(ctx, b, t){
  const x = b.x, y = b.y, w = b.w, h = b.h, big = w * h > 20000;
  ctx.strokeStyle = 'rgba(14,12,10,.55)'; ctx.lineWidth = 2; ctx.beginPath(); for (let i = 0; i < 5; i++){ const px = x + 8 + fdR(b, i) * (w - 16), py = y + 8 + fdR(b, i + 10) * (h - 16); ctx.moveTo(px, py); ctx.lineTo(px + (fdR(b, i + 20) - 0.5) * 60, py + (fdR(b, i + 30) - 0.5) * 50); } ctx.stroke();                                       /* cracks in the slab */
  const n = Math.min(14, Math.max(4, Math.round(w * h / 3600)));
  for (let i = 0; i < n; i++){ const px = x + 6 + fdR(b, i + 40) * (w - 12), py = y + 6 + fdR(b, i + 60) * (h - 12), a = fdR(b, i + 80) * TAU, l = 10 + fdR(b, i + 100) * 22;
    if (i % 3 === 0){ ctx.strokeStyle = '#4A3A30'; ctx.lineWidth = 2.6; ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px + Math.cos(a) * l, py + Math.sin(a) * l); ctx.lineTo(px + Math.cos(a) * l + Math.cos(a + 1.2) * l * 0.4, py + Math.sin(a) * l + Math.sin(a + 1.2) * l * 0.4); ctx.stroke(); }     /* twisted girders */
    else if (i % 3 === 1){ ctx.fillStyle = 'rgba(60,58,52,.9)'; ctx.fillRect(px, py, l * 0.6, 4 + fdR(b, i + 120) * 8); ctx.fillStyle = 'rgba(255,255,255,.12)'; ctx.fillRect(px, py, l * 0.6, 1.4); }                                                                                              /* wall stubs */
    else { ctx.fillStyle = '#6A5A4A'; ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px + l * 0.5, py + 3); ctx.lineTo(px + l * 0.2, py + 9); ctx.closePath(); ctx.fill(); } }                                                                                                                              /* a slab of roof */
  const k = b.kind;
  if (k === 'tank'){ ctx.strokeStyle = '#5A606C'; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(x + w / 2, y + h / 2, w * 0.4, 0.4, 4.2); ctx.stroke(); ctx.fillStyle = 'rgba(10,8,6,.5)'; ctx.beginPath(); ctx.arc(x + w / 2, y + h / 2, w * 0.3, 0, TAU); ctx.fill(); }
  else if (k === 'jeep' || k === 'truck' || k === 'apc'){ ctx.fillStyle = '#2A2622'; ctx.fillRect(x + 4, y + 6, w - 8, h - 12); ctx.fillStyle = '#5A3A22'; for (let i = 0; i < 5; i++) ctx.fillRect(x + 6 + fdR(b, i + 200) * (w - 20), y + 8 + fdR(b, i + 210) * (h - 20), 7, 4); for (const f of [0.2, 0.8]){ ctx.fillStyle = '#14141A'; ctx.beginPath(); ctx.arc(x + w * f, y + (f < 0.5 ? -2 : h + 2), 4, 0, TAU); ctx.fill(); } }
  else if (k === 'heli'){ ctx.strokeStyle = '#1E2028'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x - 10, y + h * 0.3); ctx.lineTo(x + w + 16, y + h * 0.7); ctx.moveTo(x + w * 0.3, y - 14); ctx.lineTo(x + w * 0.5, y + h + 12); ctx.stroke(); }
  else if (k === 'turret'){ fillCircle(ctx, x + w / 2, y + h / 2, 16, '#2A2822'); ctx.strokeStyle = '#8A909C'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x + w / 2, y + h / 2); ctx.lineTo(x + w / 2 + 34, y + h / 2 - 14); ctx.stroke(); }
  else if (k === 'plant'){ for (let i = 0; i < 9; i++){ const sx = x + 60 + fdR(b, i + 300) * (w - 120), sy = y + 40 + fdR(b, i + 310) * (h - 80); tw_poly(ctx, [sx, sy, sx + 4, sy - 16 - fdR(b, i + 320) * 12, sx + 8, sy], '#9AF0C8'); } ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = 'rgba(122,255,200,' + (0.12 + 0.06 * Math.sin(t * 2)).toFixed(2) + ')'; ctx.fillRect(x, y, w, h); ctx.globalCompositeOperation = 'source-over'; }
  else if (big){ for (let i = 0; i < 3; i++){ ctx.fillStyle = 'rgba(80,74,66,.8)'; ctx.fillRect(x + (i * 0.35) * w + 4, y + 2, 10 + fdR(b, i + 400) * 16, 18 + fdR(b, i + 410) * 24); } }
  if (b.fire > 0 || b.smoke > 4){ const fl = 0.6 + 0.4 * Math.sin(t * 9 + b.idx); for (let i = 0; i < 3; i++){ const fx = x + 10 + fdR(b, i + 500) * (w - 20), fy = y + 10 + fdR(b, i + 510) * (h - 20); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = 'rgba(255,130,40,' + (0.35 * fl).toFixed(2) + ')'; ctx.beginPath(); ctx.arc(fx, fy, 9 + 4 * fl, 0, TAU); ctx.fill(); ctx.globalCompositeOperation = 'source-over'; ctx.fillStyle = '#FFD060'; ctx.beginPath(); ctx.ellipse(fx, fy - 3 * fl, 2.4, 5 * fl, 0, 0, TAU); ctx.fill(); } }
}
