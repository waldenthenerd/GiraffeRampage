/* ==========================================================================================================================
   44zx-farm-isle-detail.js  --  Hayfield Village (the farm) and Driftwood Cove (the isle): the small parts.
   Pure drawing, painted once into the cached layers, like 44zw-town-detail.js, whose small painters (townDetailKit) and tables
   (TOWN_WALL_TEXTURE, TOWN_WALL_BOX, TOWN_BUILD_EXTRAS) it uses. Adds, by kind: wall materials and extras for the barn, corn stand, hen
   coop, farmhouse, hay bales, cottage, fish stall, crab shack, lighthouse and Saltwind Boats; extras for each prop (the strip, corn, scarecrow,
   fence, wind pump, palms, pier, nets, barrels); the ground (dirt, sand), and the far hills, fields, sea and boats behind.
   ========================================================================================================================== */
(function(){
  const K = townDetailKit, hash = K.hash, ln = K.ln, dot = K.dot, glow = K.glow, leafBlob = K.leafBlob, tiles = K.tiles, rope = K.rope;
  const THEMES = { farm: 1, isle: 1 };
  const tri = function(c, col, x1, y1, x2, y2, x3, y3){ c.fillStyle = col; c.beginPath(); c.moveTo(x1, y1); c.lineTo(x2, y2); c.lineTo(x3, y3); c.closePath(); c.fill(); };
  const rr = function(c, col, x, y, w, h, r){ c.fillStyle = col; c.beginPath(); c.roundRect(x, y, w, h, r); c.fill(); };

  /* ---------- walls ---------- */
  const weather = function(c, x, y, w, h, seed){                                        /* weathered paint: pale patches, rust streaks, dirt at the foot */
    const r = miniRng(seed + 11);
    for (let i = 0; i < Math.round(w * h / 1400); i++){ c.fillStyle = 'rgba(255,240,220,.1)'; c.fillRect(x + r() * w, y + r() * h * 0.8, 3 + r() * 9, 2 + r() * 5); }
    for (let i = 0; i < Math.round(w / 40); i++){ c.fillStyle = 'rgba(120,50,20,.14)'; c.fillRect(x + r() * w, y + 6 + r() * h * 0.3, 1.6, 10 + r() * 34); }
  };
  TOWN_WALL_TEXTURE.fm_barn = function(c, x, y, w, h, s){ K.boards(c, x, y, w, h, 17, true, s); weather(c, x, y, w, h, s); };
  TOWN_WALL_TEXTURE.fm_house = function(c, x, y, w, h, s){ K.boards(c, x, y, w, h, 9, false, s); };
  TOWN_WALL_TEXTURE.is_house = function(c, x, y, w, h, s){ K.boards(c, x, y, w, h, 10, false, s); };
  TOWN_WALL_TEXTURE.is_crab = function(c, x, y, w, h, s){ K.boards(c, x, y, w, h, 11, true, s); weather(c, x, y, w, h, s); };
  TOWN_WALL_TEXTURE.fm_coop = function(c, x, y, w, h, s){ K.boards(c, x, y, w, h, 9, false, s); };
  TOWN_WALL_TEXTURE.sw_shop = function(c, x, y, w, h, s){ K.boards(c, x, y, w, h, 12, false, s); };
  TOWN_WALL_BOX.fm_coop = function(b){ return { h: 66 }; };

  /* ---------- buildings: farm ---------- */
  const cat = function(c, x, y){                                                      /* a cat sitting, seen from the side */
    c.fillStyle = '#4A4A52'; c.beginPath(); c.ellipse(x, y - 6, 7, 6, 0, 0, TAU); c.fill(); c.beginPath(); c.arc(x + 6, y - 13, 4.6, 0, TAU); c.fill();
    tri(c, '#4A4A52', x + 3, y - 16, x + 4, y - 22, x + 7, y - 17); tri(c, '#4A4A52', x + 7, y - 17, x + 10, y - 22, x + 10, y - 15);
    c.strokeStyle = '#4A4A52'; c.lineWidth = 2.2; c.lineCap = 'round'; c.beginPath(); c.moveTo(x - 6, y - 3); c.quadraticCurveTo(x - 16, y - 2, x - 14, y - 12); c.stroke(); dot(c, '#F2E27A', x + 7.4, y - 13.4, 0.9);
  };
  const milkCan = function(c, x, y){ rr(c, '#C9CDD9', x - 7, y - 24, 14, 24, 3); c.fillStyle = '#9AA0AA'; c.fillRect(x - 8, y - 20, 16, 2); c.fillRect(x - 8, y - 6, 16, 2); rr(c, '#B8BCC8', x - 5, y - 28, 10, 5, 2); c.fillStyle = 'rgba(255,255,255,.4)'; c.fillRect(x - 5, y - 22, 2, 18); ln(c, '#7A7F8A', 1.6, x - 7, y - 16, x - 11, y - 12); ln(c, '#7A7F8A', 1.6, x + 7, y - 16, x + 11, y - 12); };
  TOWN_BUILD_EXTRAS.fm_barn = function(c, D, b, g){
    const x = b.x, W = b.w, h = b.h, x0 = g.x0, top = TG - h;
    g.doors.push([x - 56, x + 56]); K.foundation(c, g); K.drainpipe(c, g);
    c.strokeStyle = 'rgba(0,0,0,.28)'; c.lineWidth = 1; for (let i = 1; i < 6; i++){ const px = x - 46 + i * 15.3; c.beginPath(); c.moveTo(px, TG - 134); c.lineTo(px, TG); c.stroke(); }
    [-1, 1].forEach(function(sd){ for (let k = 0; k < 2; k++){ const yy = TG - 108 + k * 80; c.fillStyle = '#22201E'; c.fillRect(sd > 0 ? x + 2 : x - 44, yy, 42, 5); dot(c, '#6A6560', sd > 0 ? x + 36 : x - 38, yy + 2.5, 1.4); dot(c, '#6A6560', sd > 0 ? x + 24 : x - 26, yy + 2.5, 1.4); } dot(c, '#2A2420', x + sd * 9, TG - 66, 4); c.strokeStyle = '#9A9285'; c.lineWidth = 1.4; c.beginPath(); c.arc(x + sd * 9, TG - 66, 4, 0, TAU); c.stroke(); });
    c.fillStyle = '#7A6A58'; c.fillRect(x - 4, TG - 90, 8, 12); dot(c, '#C9CDD9', x, TG - 80, 2);
    for (let i = 0; i < 9; i++) ln(c, '#E0C060', 1.3, x - 22 + i * 5, top + 62, x - 24 + i * 5 + (i % 2) * 3, top + 70 + (i % 3) * 3);                                      /* hay poking from the loft */
    c.fillStyle = '#E8D8A0'; c.fillRect(x - 24, top + 52, 48, 6); c.fillStyle = 'rgba(0,0,0,.18)'; c.fillRect(x - 22, top + 58, 44, 3);
    ln(c, '#4A3624', 3, x, top - 80, x + 40, top - 80); ln(c, '#4A3624', 1.4, x + 36, top - 80, x + 36, top - 56); c.strokeStyle = '#4A3624'; c.lineWidth = 2; c.beginPath(); c.arc(x + 36, top - 52, 3.4, 0, Math.PI); c.stroke(); dot(c, '#3A3A44', x + 36, top - 82, 3);
    ln(c, '#3A3A44', 2, x - 56, top - 40, x - 56, top - 66); ln(c, '#3A3A44', 1.4, x - 66, top - 56, x - 46, top - 56); tri(c, '#3A3A44', x - 56, top - 74, x - 44, top - 70, x - 56, top - 66);
    [x0 + 20, x0 + W - 20].forEach(function(lx){ ln(c, '#2E2A26', 1.4, lx, top + 100, lx, top + 112); rr(c, '#FFE49A', lx - 4, top + 112, 8, 11, 2); c.fillStyle = '#2E2A26'; c.fillRect(lx - 5, top + 110, 10, 3); c.fillRect(lx - 5, top + 123, 10, 2); glow(c, lx, top + 118, 28, '255,210,120', 0.3); });
    for (let i = 0; i < 4; i++){ ln(c, '#7A5A3A', 1.6, x0 + 30 + i * 4, TG - 4, x0 + 38 + i * 3, TG - 70); } for (let i = 0; i < 3; i++) ln(c, '#7A5A3A', 1.6, x0 + 28 + i * 4 - 10 + 24, TG - 70, x0 + 30 + i * 4 + 26 - 10 + 24, TG - 76);
    milkCan(c, x0 + W - 28, TG); milkCan(c, x0 + W - 46, TG);
    rr(c, '#B79C6A', x0 + 4, TG - 26, 24, 26, 6); ln(c, 'rgba(70,50,20,.5)', 1, x0 + 8, TG - 18, x0 + 24, TG - 18);
    c.fillStyle = '#7A5A3A'; c.fillRect(x0 + W - 110, TG - 16, 52, 14); c.fillStyle = '#4A86B0'; c.fillRect(x0 + W - 108, TG - 14, 48, 5); ln(c, 'rgba(255,255,255,.4)', 1, x0 + W - 104, TG - 12, x0 + W - 80, TG - 12);
    cat(c, x0 + W - 40, top + 14);
    for (let i = 0; i < 3; i++){ const bx = x0 + 60 + i * 52; c.fillStyle = '#2A2A34'; c.beginPath(); c.moveTo(bx, top - 6); c.lineTo(bx + 6, top - 2); c.lineTo(bx + 12, top - 6); c.lineTo(bx + 6, top - 4); c.closePath(); c.fill(); }
  };
  TOWN_BUILD_EXTRAS.fm_stand = function(c, D, b, g){
    const x = b.x, W = b.w, x0 = g.x0;
    for (let i = 1; i < 8; i++) ln(c, 'rgba(0,0,0,.22)', 1.2, x0, TG - 60 + i * 7, x0 + W, TG - 60 + i * 7);
    c.fillStyle = 'rgba(255,255,255,.15)'; c.fillRect(x0 - 6, TG - 68, W + 12, 2);
    for (let i = 0; i < 10; i++){ const bx = x0 - 6 + i * (W + 12) / 9.5, col = ['#F2C230', '#FFF6E0', '#6BBB45'][i % 3]; tri(c, col, bx, TG - 126, bx + 12, TG - 126, bx + 6, TG - 112); }
    ln(c, '#5A4A32', 1, x0 - 6, TG - 126, x0 + W + 6, TG - 126);
    for (let i = 0; i < 4; i++){ const cx = x0 + 30 + i * 42; for (let k = 0; k < 3; k++){ c.fillStyle = 'rgba(160,110,0,.5)'; for (let j = 0; j < 3; j++) c.fillRect(cx - 9 + k * 8, TG - 102 + j * 4, 1.4, 1.4); } for (let k = 0; k < 6; k++) ln(c, '#B88A52', 1, cx - 16, TG - 88 + k * 4, cx + 16, TG - 88 + k * 4); }
    for (let i = 0; i < 4; i++){ const hx = x0 + 40 + i * 30; ln(c, '#C9B060', 1.4, hx, TG - 126, hx, TG - 112); tri(c, '#E8D060', hx - 4, TG - 112, hx + 4, TG - 112, hx, TG - 90); ln(c, '#8AAE4A', 1.2, hx - 3, TG - 112, hx - 6, TG - 100); ln(c, '#8AAE4A', 1.2, hx + 3, TG - 112, hx + 6, TG - 100); }
    rr(c, '#22302A', x0 + W - 52, TG - 100, 46, 34, 3); c.strokeStyle = '#8A6642'; c.lineWidth = 2.4; c.strokeRect(x0 + W - 52, TG - 100, 46, 34); c.fillStyle = 'rgba(255,255,255,.8)'; c.font = 'bold 9px system-ui,sans-serif'; c.textAlign = 'center'; c.fillText('FRESH', x0 + W - 29, TG - 88); c.fillText('3 gold', x0 + W - 29, TG - 74);
    for (let i = 0; i < 2; i++){ rr(c, '#9A7550', x0 - 30 + i * 8, TG - 28 - i * 22, 30, 24, 2); c.strokeStyle = '#5E4430'; c.lineWidth = 1.2; c.strokeRect(x0 - 30 + i * 8, TG - 28 - i * 22, 30, 24); for (let k = 0; k < 3; k++) tri(c, '#F2C230', x0 - 24 + i * 8 + k * 7, TG - 28 - i * 22, x0 - 20 + i * 8 + k * 7, TG - 28 - i * 22, x0 - 22 + i * 8 + k * 7, TG - 38 - i * 22); }
    for (let i = 0; i < 10; i++){ const sx = x0 + 6 + i * (W - 10) / 9; ln(c, '#D9C26A', 1.2, sx, TG, sx + 3, TG - 5); }
    c.fillStyle = '#5A3B22'; c.fillRect(x0 + W / 2 - 3, TG - 74, 6, 8); c.fillStyle = '#C9CDD9'; c.fillRect(x0 + W / 2 - 14, TG - 78, 28, 3); ln(c, '#7A7F8A', 1.4, x0 + W / 2, TG - 78, x0 + W / 2 - 12, TG - 70); ln(c, '#7A7F8A', 1.4, x0 + W / 2, TG - 78, x0 + W / 2 + 12, TG - 70);
    rr(c, '#C9772E', x0 + 8, TG - 82, 14, 10, 3); dot(c, '#FFD84D', x0 + 15, TG - 78, 2);
  };
  TOWN_BUILD_EXTRAS.fm_coop = function(c, D, b, g){
    const x = b.x, W = b.w, x0 = g.x0;
    K.foundation(c, g);
    rr(c, '#6A4A32', x - 15, TG - 46, 30, 3, 1); rr(c, '#3A2A1E', x - 12, TG - 40, 24, 40, 3); ln(c, '#8A6642', 2, x - 6, TG - 2, x + 24, TG - 14); for (let i = 0; i < 4; i++) ln(c, '#5E4430', 1.4, x + 2 + i * 6, TG - 6 - i * 2.4, x + 2 + i * 6, TG - 3 - i * 2.4);
    c.strokeStyle = 'rgba(180,185,200,.8)'; c.lineWidth = 0.8; for (let j = 0; j < 8; j++) for (let i = 0; i < 6; i++){ const wx = x + 20 + i * 7 + (j % 2) * 3.5, wy = TG - 50 + j * 6; c.beginPath(); c.moveTo(wx, wy); c.lineTo(wx + 3.5, wy + 3); c.lineTo(wx, wy + 6); c.stroke(); }
    for (let i = 0; i < 12; i++){ const sx = x - 10 + hash(i) * 26; ln(c, '#D9C26A', 1.4, sx, TG - 2, sx + 4, TG - 6); }
    rr(c, '#E8D8B0', x0 + 8, TG - 28, 24, 16, 3); c.fillStyle = '#C9A24A'; for (let i = 0; i < 6; i++) c.fillRect(x0 + 10 + i * 3.4, TG - 26, 2.4, 11); ln(c, '#7A5A3A', 2, x0 + 6, TG - 12, x0 + 34, TG - 12);
    [[x0 + 10, TG - 48], [x0 + 28, TG - 52]].forEach(function(f){ c.fillStyle = '#F4F1E8'; c.beginPath(); c.ellipse(f[0], f[1], 2.6, 4.6, 0.5, 0, TAU); c.fill(); });
    rr(c, '#C9772E', x0 + W - 22, TG - 62, 8, 8, 2); rr(c, '#7A5A3A', x0 + W / 2 - 20, TG - 98, 40, 12, 2); c.fillStyle = '#FFF6E0'; c.font = 'bold 8px system-ui,sans-serif'; c.textAlign = 'center'; c.fillText('EGGS', x0 + W / 2, TG - 89);
    ln(c, '#5E4430', 1.2, x0 + W / 2 - 14, TG - 86, x0 + W / 2 - 14, TG - 80); ln(c, '#5E4430', 1.2, x0 + W / 2 + 14, TG - 86, x0 + W / 2 + 14, TG - 80);
  };
  TOWN_BUILD_EXTRAS.fm_house = function(c, D, b, g){
    const x = b.x, W = b.w, h = b.h, x0 = g.x0, top = TG - h;
    g.doors.push([x0 + W - 70, x0 + W - 22]); K.foundation(c, g); K.drainpipe(c, g);
    const wx = x0 + 20, wy = TG - 92;
    c.fillStyle = 'rgba(255,255,255,.28)'; c.beginPath(); c.moveTo(wx + 5, wy + 5); c.lineTo(wx + 24, wy + 5); c.lineTo(wx + 5, wy + 38); c.closePath(); c.fill();
    c.fillStyle = 'rgba(210,90,90,.5)'; c.fillRect(wx + 5, wy + 5, 8, 24); c.fillRect(wx + 28, wy + 5, 8, 24);
    c.fillStyle = '#3E6E52'; [wx - 12, wx + 49].forEach(function(sx){ c.fillRect(sx, wy - 2, 10, 50); c.fillStyle = 'rgba(0,0,0,.28)'; for (let yy = wy; yy < wy + 48; yy += 4) c.fillRect(sx + 1.5, yy, 7, 1); c.fillStyle = '#3E6E52'; });
    c.fillStyle = '#C9BFAC'; c.fillRect(wx - 4, wy + 48, 54, 4); c.fillStyle = '#6A4A32'; c.fillRect(wx - 2, wy + 52, 50, 7);
    for (let i = 0; i < 7; i++){ ln(c, '#3E7A3A', 1.4, wx + 2 + i * 7, wy + 52, wx + 2 + i * 7, wy + 46); dot(c, ['#F29AC0', '#FFD84D', '#FFFFFF', '#FF8A5A'][i % 4], wx + 2 + i * 7, wy + 45, 2.8); }
    const dx = x0 + W - 66;
    c.strokeStyle = 'rgba(0,0,0,.3)'; c.lineWidth = 1.2; c.strokeRect(dx + 6, TG - 78, 12, 30); c.strokeRect(dx + 22, TG - 78, 12, 30); c.strokeRect(dx + 6, TG - 42, 12, 34); c.strokeRect(dx + 22, TG - 42, 12, 34);
    c.fillStyle = '#9A9285'; c.fillRect(dx - 6, TG - 5, 52, 5); c.fillStyle = '#B5AC9C'; c.fillRect(dx - 6, TG - 5, 52, 1.4); rr(c, '#7A3B2A', dx + 2, TG - 2, 36, 2, 1);
    c.strokeStyle = '#3E7A3A'; c.lineWidth = 3; c.beginPath(); c.arc(dx + 20, TG - 62, 7, 0, TAU); c.stroke(); for (let i = 0; i < 5; i++) dot(c, '#D5352B', dx + 20 + Math.cos(i * 1.26) * 7, TG - 62 + Math.sin(i * 1.26) * 7, 1.6);
    ln(c, '#2E2A26', 1.4, dx + 50, TG - 92, dx + 50, TG - 84); rr(c, '#FFE49A', dx + 46, TG - 84, 8, 11, 2); glow(c, dx + 50, TG - 78, 24, '255,210,120', 0.3);
    for (let xx = x0 - 8; xx < x0 + 52; xx += 12){ ln(c, '#F4F1E8', 2.4, xx + 2, TG - 8, xx + 2, TG - 34); } ln(c, '#F4F1E8', 3, x0 - 8, TG - 34, x0 + 52, TG - 34);
    for (let i = 0; i < 6; i++){ c.fillStyle = ['#C9503C', '#F2C230', '#4D9AE8', '#7AB87A', '#F29AC0', '#FFFFFF'][i]; c.fillRect(x0 - 6 + i * 9, TG - 33, 9, 14); ln(c, 'rgba(0,0,0,.3)', 0.8, x0 - 6 + i * 9, TG - 33, x0 - 6 + i * 9 + 9, TG - 19); }
    ln(c, '#6A4A32', 3, x0 + 56, TG - 6, x0 + 62, TG - 28); ln(c, '#6A4A32', 3, x0 + 74, TG - 6, x0 + 68, TG - 28); ln(c, '#6A4A32', 3, x0 + 58, TG - 24, x0 + 74, TG - 24);
    K.bricks(c, x0 + W - 52, top - 52, 22, 40, 6, 11, 3);
    for (let i = 0; i < 4; i++) K.glow(c, x0 + W - 41 + i * 5, top - 62 - i * 18, 12 + i * 4, '225,225,230', 0.4 - i * 0.07);
    ln(c, '#6A4A32', 2, x0 + W + 8, TG - 4, x0 + W + 8, TG - 30); rr(c, '#6A6F78', x0 + W + 2, TG - 38, 14, 10, 3); ln(c, '#C9CDD9', 1, x0 + W + 4, TG - 33, x0 + W + 14, TG - 33);
    K.pot(c, x0 + W + 28, TG, 0.9, 7);
  };
  TOWN_BUILD_EXTRAS.fm_bales = function(c, D, b, g){
    const W = b.w, x0 = g.x0;
    for (let row = 0; row < 3; row++) for (let k = 0; k < 3 - (row > 1 ? 1 : 0); k++){ const bx = x0 + k * 48 + (row % 2) * 12, by = TG - 32 * (row + 1); c.save(); c.beginPath(); c.rect(bx, by, 48, 32); c.clip();
      for (let i = 0; i < 14; i++) ln(c, i % 3 ? 'rgba(255,240,150,.55)' : 'rgba(150,110,30,.5)', 1, bx + hash(row * 9 + k * 3 + i) * 46, by + 2, bx + hash(row * 9 + k * 3 + i) * 46 + 6 * (i % 2 ? 1 : -1), by + 30); c.restore(); }
    for (let i = 0; i < 12; i++) ln(c, '#E0C060', 1.3, x0 + 4 + i * 12, TG, x0 + 8 + i * 12, TG - 5);
    ln(c, '#6A4A32', 2, x0 + W - 20, TG - 20, x0 + W - 6, TG - 70); for (let i = 0; i < 3; i++) ln(c, '#6A4A32', 1.6, x0 + W - 12 + i * 3, TG - 52 - i * 2, x0 + W - 6 + i * 3, TG - 70);
  };
  /* ---------- buildings: isle ---------- */
  const shutters = function(c, wx, wy, ww, wh, col){ [wx - 9, wx + ww + 1].forEach(function(sx){ c.fillStyle = col; c.fillRect(sx, wy - 2, 8, wh + 4); c.fillStyle = 'rgba(0,0,0,.28)'; for (let yy = wy; yy < wy + wh + 2; yy += 4) c.fillRect(sx + 1, yy, 6, 1); c.fillStyle = 'rgba(255,255,255,.2)'; c.fillRect(sx, wy - 2, 1.4, wh + 4); }); };
  const shellGarland = function(c, x1, x2, y, n){ c.strokeStyle = 'rgba(60,40,20,.7)'; c.lineWidth = 1; c.beginPath(); c.moveTo(x1, y); c.quadraticCurveTo((x1 + x2) / 2, y + 14, x2, y); c.stroke(); for (let i = 0; i <= n; i++){ const t = i / n, sx = x1 + (x2 - x1) * t, sy = y + 14 * 2 * t * (1 - t) + 2; c.fillStyle = ['#F4E8D8', '#F2B8A0', '#E8D8B0'][i % 3]; c.beginPath(); c.arc(sx, sy + 3, 3, 0, Math.PI * 2); c.fill(); ln(c, 'rgba(120,80,50,.5)', 0.8, sx, sy, sx, sy + 3); } };
  TOWN_BUILD_EXTRAS.is_house = function(c, D, b, g){
    const x = b.x, W = b.w, h = b.h, x0 = g.x0, top = TG - h;
    g.doors.push([x0 + W - 70, x0 + W - 22]); K.foundation(c, g); K.drainpipe(c, g);
    shutters(c, x0 + 20, TG - 88, 46, 46, '#2F6A8A'); c.fillStyle = 'rgba(255,255,255,.28)'; c.beginPath(); c.moveTo(x0 + 25, TG - 83); c.lineTo(x0 + 42, TG - 83); c.lineTo(x0 + 25, TG - 52); c.closePath(); c.fill();
    c.fillStyle = '#C9BFAC'; c.fillRect(x0 + 16, TG - 40, 54, 4); K.pot(c, x0 + 30, TG - 40, 0.8, 21); K.pot(c, x0 + 54, TG - 40, 0.8, 22);
    const dx = x0 + W - 66; c.strokeStyle = 'rgba(0,0,0,.3)'; c.lineWidth = 1.2; c.strokeRect(dx + 6, TG - 76, 28, 28); c.strokeRect(dx + 6, TG - 42, 28, 34);
    c.fillStyle = '#9A9285'; c.fillRect(dx - 6, TG - 5, 52, 5); c.fillStyle = '#B5AC9C'; c.fillRect(dx - 6, TG - 5, 52, 1.4); rr(c, '#2F6A8A', dx + 4, TG - 2, 32, 2, 1);
    shellGarland(c, x0 + 6, x0 + W - 6, top + 14, 9);
    K.bricks(c, x0 + 22, top - 54, 20, 36, 6, 10, 5); c.fillStyle = '#5A3A2E'; c.fillRect(x0 + 19, top - 58, 26, 5);
    c.fillStyle = '#F4F1E8'; c.beginPath(); c.arc(x, top - 22, 9, 0, TAU); c.fill(); c.strokeStyle = '#2F6A8A'; c.lineWidth = 3; c.stroke(); ln(c, '#2F6A8A', 1.4, x - 9, top - 22, x + 9, top - 22); ln(c, '#2F6A8A', 1.4, x, top - 31, x, top - 13);
    c.strokeStyle = '#6A5A44'; c.lineWidth = 2.4; c.beginPath(); c.arc(x0 + W - 16, TG - 60, 7, 0, TAU); c.moveTo(x0 + W - 16, TG - 53); c.lineTo(x0 + W - 16, TG - 30); c.moveTo(x0 + W - 24, TG - 44); c.lineTo(x0 + W - 8, TG - 44); c.stroke();
    rr(c, '#7A5A32', x0 + W + 4, TG - 30, 22, 30, 5); ln(c, '#3A2A1E', 1.4, x0 + W + 4, TG - 20, x0 + W + 26, TG - 20); ln(c, '#3A2A1E', 1.4, x0 + W + 4, TG - 9, x0 + W + 26, TG - 9); c.fillStyle = '#4A86B0'; c.fillRect(x0 + W + 6, TG - 30, 18, 3);
  };
  TOWN_BUILD_EXTRAS.is_fish = function(c, D, b, g){
    const x = b.x, W = b.w, h = b.h, x0 = g.x0;
    for (let i = 1; i < 8; i++) ln(c, 'rgba(0,0,0,.22)', 1.2, x0, TG - 60 + i * 7, x0 + W, TG - 60 + i * 7); for (let i = 1; i < 9; i++) ln(c, 'rgba(0,0,0,.12)', 1, x0 + i * W / 9, TG - 60, x0 + i * W / 9, TG);
    ln(c, '#3A2A1E', 2, x0 + 10, TG - h + 40, x0 + W - 10, TG - h + 40); for (let i = 0; i < 6; i++){ const fx = x0 + 24 + i * 32; ln(c, '#6A5848', 1, fx, TG - h + 40, fx, TG - h + 54); c.fillStyle = ['#9FB8D0', '#E89A5A', '#B8C8D8'][i % 3]; c.beginPath(); c.ellipse(fx, TG - h + 66, 4, 12, 0, 0, TAU); c.fill(); tri(c, '#7A9AB8', fx - 3, TG - h + 76, fx + 3, TG - h + 76, fx, TG - h + 84); dot(c, '#111', fx - 1, TG - h + 58, 1); }
    for (let i = 0; i < 5; i++){ const fx = x0 + 30 + i * 38; c.fillStyle = 'rgba(255,255,255,.4)'; c.fillRect(fx - 10, TG - 68, 20, 1.4); ln(c, 'rgba(0,0,0,.25)', 0.8, fx - 4, TG - 76, fx - 4, TG - 72); ln(c, 'rgba(0,0,0,.25)', 0.8, fx + 2, TG - 77, fx + 2, TG - 73); }
    c.fillStyle = 'rgba(190,230,255,.55)'; for (let i = 0; i < 28; i++) c.fillRect(x0 + 10 + hash(i) * (W - 20), TG - 71 + hash(i + 4) * 8, 3, 2);
    rr(c, '#F4F1E8', x0 + W - 40, TG - 20, 24, 20, 3); c.strokeStyle = '#7A9AB8'; c.lineWidth = 2; c.strokeRect(x0 + W - 40, TG - 20, 24, 20); for (let i = 0; i < 3; i++){ c.fillStyle = ['#9FB8D0', '#E89A5A', '#F2C230'][i]; c.beginPath(); c.ellipse(x0 + W - 34 + i * 7, TG - 22, 3, 6, 0.4, 0, TAU); c.fill(); }
    for (let i = 0; i < 3; i++){ c.fillStyle = '#F4F1E8'; c.fillRect(x0 + 16 + i * 22, TG - 54, 16, 9); ln(c, 'rgba(0,0,0,.4)', 1, x0 + 18 + i * 22, TG - 50, x0 + 30 + i * 22, TG - 50); }
    cat(c, x0 + W + 14, TG); c.fillStyle = '#E8EAF0'; c.beginPath(); c.ellipse(x0 + 14, TG - h - 6, 7, 4, 0, 0, TAU); c.fill(); tri(c, '#E8EAF0', x0 + 20, TG - h - 7, x0 + 28, TG - h - 5, x0 + 20, TG - h - 3); dot(c, '#E8A24A', x0 + 28, TG - h - 5, 1); ln(c, '#E8A24A', 1.6, x0 + 12, TG - h - 2, x0 + 12, TG - h + 2);
    ln(c, '#2E2A26', 1.4, x0 + W - 6, TG - h + 20, x0 + W - 6, TG - h + 30); rr(c, '#FFE49A', x0 + W - 10, TG - h + 30, 8, 11, 2); glow(c, x0 + W - 6, TG - h + 36, 26, '255,210,120', 0.28);
  };
  TOWN_BUILD_EXTRAS.is_crab = function(c, D, b, g){
    const x = b.x, W = b.w, h = b.h, x0 = g.x0, top = TG - h;
    g.doors.push([x0 + W - 84, x0 + W - 22]); K.foundation(c, g); K.drainpipe(c, g);
    shutters(c, x0 + 20, TG - 86, 70, 56, '#7A2A1E');
    c.fillStyle = '#C9BFAC'; c.fillRect(x0 + 14, TG - 28, 82, 4);
    for (let i = 0; i < 3; i++){ const bx = x0 + 110 + i * 0; c.strokeStyle = '#6A5A44'; c.lineWidth = 1.6; c.strokeRect(bx - 4 + i * 20, TG - 28, 26, 28); for (let k = 1; k < 4; k++){ ln(c, '#8A7A5E', 1, bx - 4 + i * 20 + k * 6.5, TG - 28, bx - 4 + i * 20 + k * 6.5, TG); ln(c, '#8A7A5E', 1, bx - 4 + i * 20, TG - 28 + k * 7, bx + 22 + i * 20, TG - 28 + k * 7); } }
    ln(c, '#6A5A44', 1.6, x0 + 6, top + 6, x0 + 6, top + 28); for (let i = 0; i < 3; i++){ ln(c, '#6A5848', 1, x0 + 14 + i * 22, top + 4, x0 + 14 + i * 22, top + 14); dot(c, ['#D5352B', '#F4F1E8', '#F2C230'][i], x0 + 14 + i * 22, top + 20, 6); c.fillStyle = 'rgba(0,0,0,.2)'; c.fillRect(x0 + 8 + i * 22, top + 19, 12, 2); }
    rr(c, '#3A3A44', x0 + W + 8, TG - 22, 26, 22, 4); c.fillStyle = '#6A6F78'; c.fillRect(x0 + W + 6, TG - 24, 30, 4); ln(c, '#6A6F78', 2, x0 + W + 10, TG - 22, x0 + W + 6, TG - 30); ln(c, '#6A6F78', 2, x0 + W + 32, TG - 22, x0 + W + 36, TG - 30);
    for (let i = 0; i < 4; i++) K.glow(c, x0 + W + 18 + i * 3, TG - 36 - i * 16, 8 + i * 4, '235,235,240', 0.45 - i * 0.08);
    shellGarland(c, x0 + 6, x0 + W - 6, top + 30, 10);
    ln(c, '#2E2A26', 1.4, x0 + W - 10, top + 44, x0 + W - 10, top + 54); rr(c, '#FFE49A', x0 + W - 14, top + 54, 8, 11, 2); glow(c, x0 + W - 10, top + 60, 26, '255,210,120', 0.28);
  };
  TOWN_BUILD_EXTRAS.is_light = function(c, D, b, g){
    const x = b.x, W = b.w, h = b.h, x0 = g.x0, top = TG - h;
    c.save(); c.beginPath(); c.moveTo(x0 + 10, TG); c.lineTo(x0 + 28, top + 40); c.lineTo(x0 + W - 28, top + 40); c.lineTo(x0 + W - 10, TG); c.closePath(); c.clip();
    for (let yy = top + 46; yy < TG; yy += 14){ ln(c, 'rgba(60,40,30,.16)', 1, x0, yy, x0 + W, yy); for (let xx = x0 + ((yy / 14) % 2) * 10; xx < x0 + W; xx += 20) ln(c, 'rgba(60,40,30,.12)', 1, xx, yy, xx, yy + 14); }
    const gr = c.createLinearGradient(x0, 0, x0 + W, 0); gr.addColorStop(0, 'rgba(255,255,255,.16)'); gr.addColorStop(0.5, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(0,0,0,.24)'); c.fillStyle = gr; c.fillRect(x0, top + 40, W, h); c.restore();
    rr(c, '#3A2A1E', x - 12, TG - 38, 24, 38, [12, 12, 0, 0]); rr(c, '#6A4A32', x - 9, TG - 35, 18, 35, [9, 9, 0, 0]); dot(c, '#E9C46A', x + 5, TG - 18, 1.6); ln(c, 'rgba(0,0,0,.3)', 1, x, TG - 35, x, TG);
    for (let i = 0; i < 3; i++){ const wy = TG - 120 - i * 80; c.fillStyle = '#2A3A4A'; c.beginPath(); c.roundRect(x - 5, wy, 10, 18, [5, 5, 1, 1]); c.fill(); c.fillStyle = 'rgba(255,255,255,.3)'; c.fillRect(x - 3, wy + 2, 2, 12); c.fillStyle = '#B5AC9C'; c.fillRect(x - 7, wy + 18, 14, 3); }
    for (let xx = x0 + 16; xx < x0 + W - 14; xx += 7) ln(c, '#3A3A44', 1.2, xx, top + 30, xx, top + 42);
    ln(c, '#3A3A44', 2, x0 + 14, top + 30, x0 + W - 14, top + 30);
    ln(c, 'rgba(60,70,90,.7)', 1.2, x - 10, top - 6, x - 10, top + 32); ln(c, 'rgba(60,70,90,.7)', 1.2, x + 10, top - 6, x + 10, top + 32); ln(c, 'rgba(60,70,90,.7)', 1.2, x, top - 6, x, top + 32);
    [-1, 1].forEach(function(sd){ const bg = c.createLinearGradient(x, 0, x + sd * 320, 0); bg.addColorStop(0, 'rgba(255,248,200,.34)'); bg.addColorStop(1, 'rgba(255,248,200,0)'); c.fillStyle = bg; c.beginPath(); c.moveTo(x, top + 14); c.lineTo(x + sd * 320, top - 10); c.lineTo(x + sd * 320, top + 38); c.closePath(); c.fill(); });
    glow(c, x, top + 14, 44, '255,245,170', 0.45); ln(c, '#3A3A44', 2, x, top - 40, x, top - 56); dot(c, '#3A3A44', x, top - 58, 3); ln(c, '#3A3A44', 1.6, x - 8, top - 52, x + 8, top - 52);
    [[x - 60, 26, 15], [x + 56, 30, 17]].forEach(function(rk){ c.fillStyle = '#6A6A74'; c.beginPath(); c.ellipse(rk[0], TG - 1, rk[1], rk[2], 0, Math.PI, TAU); c.fill(); c.fillStyle = 'rgba(255,255,255,.22)'; c.beginPath(); c.ellipse(rk[0] - 6, TG - 1 - rk[2] * 0.6, rk[1] * 0.4, rk[2] * 0.3, 0, 0, TAU); c.fill(); });
  };
  TOWN_BUILD_EXTRAS.sw_shop = function(c, D, b, g){
    const x = b.x, W = b.w, h = b.h, x0 = g.x0, top = TG - h;
    g.doors.push([x0 + W - 80, x0 + W - 16]); K.foundation(c, g); K.drainpipe(c, g);
    for (let i = 0; i < 2; i++){ const px = x0 + 36 + i * 52, py = TG - 84; c.strokeStyle = '#B79C6A'; c.lineWidth = 4; c.beginPath(); c.arc(px, py, 19.5, 0, TAU); c.stroke(); c.strokeStyle = 'rgba(70,50,20,.5)'; c.lineWidth = 1; for (let k = 0; k < 20; k++){ const a = k * TAU / 20; c.beginPath(); c.moveTo(px + Math.cos(a) * 17.5, py + Math.sin(a) * 17.5); c.lineTo(px + Math.cos(a + 0.3) * 21.5, py + Math.sin(a + 0.3) * 21.5); c.stroke(); }
      c.strokeStyle = '#2F5F94'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(px - 13, py); c.lineTo(px + 13, py); c.moveTo(px, py - 13); c.lineTo(px, py + 13); c.stroke();
      c.fillStyle = '#F4F1E8'; tri(c, '#F4F1E8', px - 6, py + 8, px + 6, py + 8, px, py - 6); tri(c, '#E8D8B0', px + 1, py + 8, px + 10, py + 8, px + 1, py - 2); c.fillStyle = '#6A4A32'; c.fillRect(px - 8, py + 8, 16, 3); }
    const cols = ['#D5352B', '#F2C230', '#2F5F94', '#F4F1E8', '#2F8A5A', '#D5352B', '#F2C230', '#2F5F94']; for (let i = 0; i < 12; i++){ const fx = x0 - 10 + i * (W + 20) / 11.2; tri(c, cols[i % 8], fx, top - 6 + Math.abs(Math.sin(i)) * 3, fx + 12, top - 8 + Math.abs(Math.sin(i)) * 3, fx + 6, top + 10 + Math.abs(Math.sin(i)) * 3); }
    ln(c, '#3A2A1E', 1, x0 - 10, top - 6, x0 + W + 10, top - 8);
    c.strokeStyle = '#FFFFFF'; c.lineWidth = 3; c.beginPath(); c.arc(x0 + W - 112, TG - 40, 12, 0, TAU); c.stroke(); c.strokeStyle = '#D5352B'; c.setLineDash([5, 5]); c.beginPath(); c.arc(x0 + W - 112, TG - 40, 12, 0, TAU); c.stroke(); c.setLineDash([]);
    const dx = x0 + W - 74; c.strokeStyle = 'rgba(255,255,255,.4)'; c.lineWidth = 1.4; c.strokeRect(dx + 6, TG - 90 + 6, 28, 32); ln(c, 'rgba(255,255,255,.4)', 1.4, dx + 20, TG - 84, dx + 20, TG - 52); c.fillStyle = '#9A9285'; c.fillRect(dx - 6, TG - 5, 64, 5); c.fillStyle = '#B5AC9C'; c.fillRect(dx - 6, TG - 5, 64, 1.4);
    rope(c, x0 + 16, TG - 8, 12); ln(c, '#6A4A32', 3, x0 + 40, TG - 4, x0 + 40, TG - 52); tri(c, '#F4F1E8', x0 + 41, TG - 50, x0 + 41, TG - 22, x0 + 66, TG - 22); tri(c, '#E8D8B0', x0 + 39, TG - 44, x0 + 39, TG - 22, x0 + 26, TG - 22); rr(c, '#8A4B3A', x0 + 22, TG - 22, 50, 8, 3);
    ln(c, '#6A5848', 2, x + 20, top - 40, x + 20, top - 90); tri(c, '#D5352B', x + 21, top - 90, x + 44, top - 83, x + 21, top - 76); dot(c, '#F4F1E8', x + 30, top - 83, 2.4);
  };

  /* ---------- props ---------- */
  const PROPX = {};
  PROPX.fm_strip = function(c, D, p){
    const x = p.x, len = p.len;
    c.fillStyle = 'rgba(30,25,15,.16)'; for (let k = 0; k < 8; k++){ c.beginPath(); c.ellipse(x + 100 + hash(k) * (len - 200), TG + 18 + hash(k + 5) * 30, 26 + hash(k + 2) * 40, 1.8, 0, 0, TAU); c.fill(); }
    c.fillStyle = 'rgba(0,0,0,.12)'; c.beginPath(); c.ellipse(x + 320, TG + 40, 18, 5, 0, 0, TAU); c.fill();
    for (let k = 0; k < 2; k++){ const nx = x + 80 + k * 50; c.fillStyle = 'rgba(255,255,255,.7)'; c.font = 'bold 22px system-ui,sans-serif'; c.textAlign = 'center'; c.fillText(k ? '9' : '0', nx, TG + 46); }
    for (let k = x + 30; k < x + 140; k += 14) c.fillRect(k, TG + 30, 8, 22);
    for (let k = x + 400; k < x + len - 200; k += 380){ c.strokeStyle = '#6A6F78'; c.lineWidth = 1.6; c.beginPath(); c.arc(k, TG + 44, 3, 0, TAU); c.stroke(); ln(c, '#6A6F78', 1, k, TG + 41, k - 8, TG + 36); }
    for (let k = x; k <= x + len; k += 60){ dot(c, '#FFD84D', k, TG + 8, 1.5); glow(c, k, TG + 8, 12, '255,230,150', 0.3); }
    for (let k = 0; k < 120; k++){ const gx = x + hash(k) * len; ln(c, hash(k + 1) < 0.5 ? '#6E9A4A' : '#8AAE5A', 1, gx, TG + 56, gx + (hash(k + 2) - 0.5) * 3, TG + 50); }
    c.strokeStyle = 'rgba(40,30,15,.14)'; c.lineWidth = 2; for (let k = 0; k < 3; k++){ c.beginPath(); c.moveTo(x + 200, TG + 14 + k * 10); c.lineTo(x + len - 160, TG + 14 + k * 10); c.stroke(); }
  };
  PROPX.fm_pole = function(c, D, p){
    const x = p.x; c.fillStyle = '#4A3624'; c.fillRect(x - 3, TG - 110, 6, 110); ln(c, 'rgba(255,255,255,.2)', 1, x - 1.5, TG - 110, x - 1.5, TG);
    c.fillStyle = '#5A3B22'; c.fillRect(x - 22, TG - 104, 44, 5); c.fillRect(x - 15, TG - 88, 30, 4);
    [-18, -8, 8, 18].forEach(function(o){ rr(c, '#6BA5B8', x + o - 2, TG - 110, 4, 6, 2); }); ln(c, '#2E2E36', 1, x - 18, TG - 106, x - 80, TG - 98); ln(c, '#2E2E36', 1, x + 18, TG - 106, x + 80, TG - 98); ln(c, '#2E2E36', 1, x - 8, TG - 106, x - 60, TG - 96);
    ln(c, '#4A3624', 2, x - 4, TG - 60, x - 12, TG - 56); for (let i = 0; i < 5; i++) ln(c, '#7A7F8A', 1.2, x - 3, TG - 100 + i * 3, x - 8, TG - 100 + i * 3);
    c.fillStyle = '#2A2A34'; c.beginPath(); c.ellipse(x + 16, TG - 108, 4, 3, 0, 0, TAU); c.fill(); dot(c, '#2A2A34', x + 20, TG - 111, 2.4); tri(c, '#E8A24A', x + 22, TG - 111, x + 26, TG - 110, x + 22, TG - 109);
  };
  PROPX.fm_corn = function(c, D, p){
    const x = p.x;
    for (let i = 0; i < (p.n || 4) * 12; i++){
      const cx = x + i * 18 + FILM_R(i + 800) * 8, h = 70 + FILM_R(i + 810) * 36, d = i % 2 ? 0 : 6, top = TG + d - h;
      c.fillStyle = 'rgba(70,50,20,.35)'; c.beginPath(); c.ellipse(cx, TG + d + 1, 6, 2, 0, 0, TAU); c.fill();
      c.strokeStyle = '#3E7A2A'; c.lineWidth = 1; for (let k = 0; k < 5; k++){ c.beginPath(); c.moveTo(cx, top + 2); c.lineTo(cx + (k - 2) * 3.4, top - 8 - (k % 2) * 3); c.stroke(); }
      c.strokeStyle = 'rgba(30,70,20,.5)'; c.lineWidth = 0.8; c.beginPath(); c.moveTo(cx, TG + d - h * 0.4); c.lineTo(cx - 17, TG + d - h * 0.5); c.moveTo(cx, TG + d - h * 0.6); c.lineTo(cx + 17, TG + d - h * 0.8); c.stroke();
      c.strokeStyle = '#8AAE4A'; c.lineWidth = 2.4; c.beginPath(); c.moveTo(cx + 2, TG + d - h * 0.5); c.lineTo(cx + 2, TG + d - h * 0.62); c.stroke();
      c.strokeStyle = 'rgba(190,150,40,.55)'; c.lineWidth = 0.8; for (let k = 1; k < 4; k++){ c.beginPath(); c.moveTo(cx - 1, TG + d - h * 0.52 - k * 3); c.lineTo(cx + 5, TG + d - h * 0.52 - k * 3); c.stroke(); }
      ln(c, '#C9503C', 0.9, cx + 2, TG + d - h * 0.64, cx + 6, TG + d - h * 0.7);
    }
  };
  PROPX.fm_scarecrow = function(c, D, p){
    const x = p.x;
    ln(c, '#E8C070', 1.4, x - 34, TG - 88, x - 44, TG - 78); ln(c, '#E8C070', 1.4, x + 34, TG - 88, x + 44, TG - 78); for (let i = 0; i < 6; i++) ln(c, '#E8C070', 1.2, x - 34 + (i % 3) * 3, TG - 88, x - 40 + (i % 3) * 3 - 4, TG - 76 + i);
    c.strokeStyle = 'rgba(40,24,12,.5)'; c.lineWidth = 1; c.setLineDash([3, 2]); c.strokeRect(x - 13, TG - 90, 26, 20); c.setLineDash([]); rr(c, '#C9503C', x - 8, TG - 82, 8, 8, 1); rr(c, '#E8D060', x + 2, TG - 78, 7, 7, 1);
    dot(c, '#2A1E14', x - 4, TG - 120, 1.4); dot(c, '#2A1E14', x + 4, TG - 120, 1.4); c.strokeStyle = '#2A1E14'; c.lineWidth = 1; c.beginPath(); c.moveTo(x - 4, TG - 114); c.lineTo(x - 2, TG - 113); c.lineTo(x, TG - 114); c.lineTo(x + 2, TG - 113); c.lineTo(x + 4, TG - 114); c.stroke();
    ln(c, '#C9503C', 2, x - 16, TG - 128, x + 16, TG - 128); for (let i = 0; i < 5; i++) ln(c, '#E8C070', 1.2, x - 14 + i * 6, TG - 100, x - 16 + i * 6, TG - 92);
    c.fillStyle = '#2A2A34'; c.beginPath(); c.ellipse(x + 38, TG - 92, 5, 3.4, 0, 0, TAU); c.fill(); dot(c, '#2A2A34', x + 42, TG - 96, 2.8); tri(c, '#E8A24A', x + 44, TG - 96, x + 48, TG - 95, x + 44, TG - 94);
    for (let i = 0; i < 5; i++) ln(c, '#D9C26A', 1.2, x - 8 + i * 4, TG, x - 6 + i * 4, TG - 6);
  };
  PROPX.fm_fence = function(c, D, p){
    const x = p.x, n = (p.n || 3) * 3;
    for (let i = 0; i <= n; i++){ const px = x + i * 30; tri(c, '#7A5230', px - 1, TG - 46, px + 7, TG - 46, px + 3, TG - 52); ln(c, 'rgba(0,0,0,.3)', 1, px + 3, TG - 44, px + 3, TG); dot(c, '#2E2A26', px + 3, TG - 38, 0.9); dot(c, '#2E2A26', px + 3, TG - 22, 0.9); }
    for (let k = 0; k < 2; k++) for (let i = 0; i < 12; i++) ln(c, 'rgba(60,35,15,.3)', 1, x + 4 + i * 22, TG - 36 + k * 16, x + 18 + i * 22, TG - 36 + k * 16 + (i % 2 ? 1 : -1));
    for (let i = 0; i < n * 3; i++){ const gx = x + hash(i * 1.7) * (n * 30); ln(c, '#6E9A4A', 1.2, gx, TG, gx + 2, TG - 7); }
    for (let i = 0; i < 3; i++) dot(c, ['#FFD84D', '#FFFFFF', '#F29AC0'][i], x + 40 + i * 70, TG - 6, 1.8);
  };
  PROPX.fm_windpump = function(c, D, p){
    const x = p.x;
    for (let i = 0; i < 8; i++){ const yy = TG - 150 + i * 19; ln(c, '#4A4F58', 1.2, x - 3 - i * 2.2, yy, x + 3 + i * 2.2, yy + 19); ln(c, '#4A4F58', 1.2, x + 3 + i * 2.2, yy, x - 3 - i * 2.2, yy + 19); ln(c, '#4A4F58', 1.4, x - 3 - i * 2.2, yy, x + 3 + i * 2.2, yy); }
    ln(c, '#4A4F58', 1.6, x + 3, TG - 160, x + 60, TG - 168); tri(c, '#C9503C', x + 60, TG - 176, x + 90, TG - 170, x + 60, TG - 162); dot(c, '#3A3A44', x + 64, TG - 169, 1.6);
    ln(c, '#6A6F78', 2.4, x + 12, TG - 150, x + 12, TG - 30); c.fillStyle = '#6A6F78'; c.fillRect(x + 8, TG - 42, 12, 4);
    rr(c, '#8A93A8', x + 22, TG - 40, 44, 40, 3); for (let i = 0; i < 5; i++) ln(c, 'rgba(0,0,0,.2)', 1, x + 22, TG - 34 + i * 8, x + 66, TG - 34 + i * 8);
    c.fillStyle = '#4A86B0'; c.fillRect(x + 26, TG - 14, 36, 8); ln(c, 'rgba(255,255,255,.5)', 1, x + 28, TG - 12, x + 54, TG - 12); ln(c, 'rgba(255,255,255,.3)', 1, x + 34, TG - 9, x + 58, TG - 9);
    for (let i = 0; i < 4; i++){ dot(c, '#5A5E68', x + 26 + i * 12, TG - 36, 1.2); } ln(c, '#7A5A3A', 2, x + 70, TG - 4, x + 90, TG - 30); c.fillStyle = '#8A93A8'; c.fillRect(x + 62, TG - 12, 6, 3);
    for (let i = 0; i < 8; i++) ln(c, '#6E9A4A', 1.2, x - 24 + i * 6, TG, x - 26 + i * 6, TG - 6);
  };
  PROPX.is_water = function(c, D, p){
    const x = p.x, len = p.len;
    c.strokeStyle = 'rgba(255,255,255,.38)'; c.lineWidth = 1.2; for (let i = 0; i < 22; i++){ const wx = x + 10 + hash(i) * (len - 40), wy = TG + 12 + hash(i + 7) * 80; c.beginPath(); c.arc(wx, wy, 7 + hash(i + 3) * 8, Math.PI * 1.1, Math.PI * 1.9); c.stroke(); }
    c.fillStyle = 'rgba(20,50,80,.2)'; for (let i = 0; i < 7; i++){ const fx = x + 20 + hash(i * 3) * (len - 60), fy = TG + 50 + hash(i) * 40; c.beginPath(); c.ellipse(fx, fy, 9, 3.4, 0, 0, TAU); c.fill(); tri(c, 'rgba(20,50,80,.2)', fx + 8, fy, fx + 14, fy - 3, fx + 14, fy + 3); }
    c.fillStyle = 'rgba(255,255,255,.12)'; for (let i = 0; i < 6; i++) c.fillRect(x + 20 + i * (len / 6), TG + 20, 2, 70);
    for (let q = 40; q < len + 20; q += 90){ c.fillStyle = 'rgba(90,100,60,.45)'; c.fillRect(x + q - 1, TG + 12, 11, 12); for (let k = 0; k < 4; k++) dot(c, '#E8E4D6', x + q + 1 + (k % 2) * 6, TG + 30 + k * 7, 1.4); ln(c, 'rgba(20,50,80,.35)', 1, x + q - 4, TG + 58, x + q + 13, TG + 58); }
    const L = len + 470;
    for (let i = 0; i < Math.floor(L / 22); i++){ dot(c, 'rgba(20,12,6,.6)', x + i * 22 + 10, TG + 1, 0.9); dot(c, 'rgba(20,12,6,.6)', x + i * 22 + 10, TG + 11, 0.9); }
    for (let i = 0; i < 12; i++) ln(c, 'rgba(255,240,200,.18)', 1, x + 10 + hash(i) * L, TG - 1, x + 26 + hash(i) * L, TG - 1);
    [x + 40, x + len - 10].forEach(function(px){ c.fillStyle = '#4A3624'; c.fillRect(px - 5, TG - 36, 10, 24); c.fillStyle = '#6A4A32'; c.beginPath(); c.arc(px, TG - 36, 5, Math.PI, TAU); c.fill(); rope(c, px, TG - 22, 8); });
    ln(c, '#6A4A32', 1.8, x + 180, TG - 2, x + 196, TG - 54); ln(c, '#2E2E36', 0.8, x + 196, TG - 54, x + 230, TG - 20); rr(c, '#C9503C', x + 250, TG - 14, 12, 14, 2); ln(c, '#8A8A92', 1.4, x + 250, TG - 14, x + 262, TG - 14);
    c.fillStyle = 'rgba(40,30,15,.2)'; c.fillRect(x + L - 60, TG - 2, 48, 4); ln(c, '#8A93A8', 2, x + len - 40, TG + 14, x + len - 40, TG + 52); for (let k = 0; k < 4; k++) ln(c, '#8A93A8', 1.6, x + len - 46, TG + 20 + k * 10, x + len - 34, TG + 20 + k * 10);
    glow(c, x + len - 10, TG - 48, 18, '255,210,120', 0.35); dot(c, '#FFE49A', x + len - 10, TG - 48, 2.4);
  };
  PROPX.is_palm = function(c, D, p){
    const x = p.x;
    for (let i = 0; i < 9; i++){ const t = (i + 1) / 10, tx = x + 14 * Math.sin(t * 1.6) * 1.1, ty = TG - 150 * t; ln(c, 'rgba(50,30,10,.4)', 1.4, tx - 4, ty, tx + 4, ty - 2); }
    ln(c, 'rgba(255,255,255,.18)', 1.6, x - 2, TG, x + 4, TG - 140);
    c.fillStyle = '#6A4A28'; c.beginPath(); c.moveTo(x - 12, TG); c.quadraticCurveTo(x - 4, TG - 8, x - 4, TG - 22); c.lineTo(x + 5, TG - 22); c.quadraticCurveTo(x + 6, TG - 8, x + 14, TG); c.fill();
    for (let i = 0; i < 6; i++){ const a = -2.6 + i * 0.5, ex = x + 4 + Math.cos(a) * 66, ey = TG - 150 + Math.sin(a) * 30 - 14 + 14;
      for (let k = 1; k < 11; k++){ const t = k / 11, bx = x + 4 + Math.cos(a) * 66 * t, by = TG - 150 + (Math.sin(a) * 30 * t - 14 * Math.sin(Math.PI * t) + 0); c.strokeStyle = k % 2 ? '#3E8A3A' : '#4C9A44'; c.lineWidth = 2; c.beginPath(); c.moveTo(bx, by); c.lineTo(bx + (a > -1.5 ? 1 : -1) * 1 + 3, by + 11 - k * 0.5); c.moveTo(bx, by); c.lineTo(bx - 3, by + 11 - k * 0.5); c.stroke(); } }
    for (let i = 0; i < 4; i++) dot(c, ['#8A5A24', '#6A4A18'][i % 2], x - 2 + i * 4, TG - 140 + (i % 2) * 4, 4.2);
    c.fillStyle = 'rgba(255,255,255,.2)'; for (let i = 0; i < 4; i++) c.fillRect(x - 2 + i * 4, TG - 143 + (i % 2) * 4, 2, 2);
    c.fillStyle = 'rgba(60,45,20,.25)'; c.beginPath(); c.ellipse(x + 6, TG + 3, 40, 5, 0, 0, TAU); c.fill(); dot(c, '#8A5A24', x + 30, TG - 2, 4); c.strokeStyle = '#4C9A44'; c.lineWidth = 2.4; c.beginPath(); c.moveTo(x - 50, TG + 1); c.quadraticCurveTo(x - 30, TG - 8, x - 10, TG + 1); c.stroke();
  };
  PROPX.is_nets = function(c, D, p){
    const x = p.x;
    for (let j = 0; j < 8; j++) for (let i = 0; i < 12; i++){ const nx = x - 56 + i * 9.4 + (j % 2) * 4, ny = TG - 84 + j * 10; dot(c, 'rgba(110,85,45,.7)', nx, ny, 1); }
    for (let i = 0; i < 6; i++){ dot(c, ['#D5352B', '#F2C230', '#F4F1E8'][i % 3], x - 44 + i * 18, TG - 18 + (i % 2) * 3, 4.6); ln(c, 'rgba(255,255,255,.5)', 1, x - 46 + i * 18, TG - 20 + (i % 2) * 3, x - 43 + i * 18, TG - 22 + (i % 2) * 3); }
    for (let i = 0; i < 3; i++){ const fx = x - 30 + i * 30; c.fillStyle = '#8FA8B8'; c.beginPath(); c.ellipse(fx, TG - 50 + i * 3, 8, 3.2, 0, 0, TAU); c.fill(); tri(c, '#7A9AB8', fx + 7, TG - 50 + i * 3, fx + 13, TG - 53 + i * 3, fx + 13, TG - 47 + i * 3); dot(c, '#111', fx - 4, TG - 51 + i * 3, 0.9); }
    ln(c, '#6A5848', 1.2, x - 56, TG - 86, x + 56, TG - 86); rope(c, x + 74, TG - 6, 11); rr(c, '#8A5A32', x + 92, TG - 20, 18, 20, 3); ln(c, '#3A2A1E', 1.4, x + 92, TG - 12, x + 110, TG - 12);
  };
  PROPX.is_barrels = function(c, D, p){
    const x = p.x;
    for (let i = 0; i < 3; i++){ const bx = x - 50 + i * 34; c.save(); c.beginPath(); c.roundRect(bx, TG - 46, 30, 46, 8); c.clip(); for (let k = 1; k < 5; k++) ln(c, 'rgba(0,0,0,.25)', 1, bx + k * 6, TG - 46, bx + k * 6, TG);
      const bg = c.createLinearGradient(bx, 0, bx + 30, 0); bg.addColorStop(0, 'rgba(255,255,255,.2)'); bg.addColorStop(0.55, 'rgba(0,0,0,0)'); bg.addColorStop(1, 'rgba(0,0,0,.3)'); c.fillStyle = bg; c.fillRect(bx, TG - 46, 30, 46); c.restore();
      c.fillStyle = 'rgba(255,255,255,.2)'; c.fillRect(bx, TG - 36, 30, 1); c.fillRect(bx, TG - 14, 30, 1); dot(c, '#2E2A26', bx + 4, TG - 34, 1); dot(c, '#2E2A26', bx + 26, TG - 34, 1); }
    c.fillStyle = '#8FA8B8'; c.beginPath(); c.ellipse(x - 20, TG - 50, 4, 8, 0.2, 0, TAU); c.fill(); tri(c, '#7A9AB8', x - 22, TG - 56, x - 14, TG - 60, x - 16, TG - 52);
    c.fillStyle = '#F4F1E8'; c.beginPath(); c.ellipse(x + 14, TG - 52, 6, 4, 0, 0, TAU); c.fill(); dot(c, '#F4F1E8', x + 19, TG - 56, 3); tri(c, '#E8A24A', x + 21, TG - 56, x + 26, TG - 55, x + 21, TG - 54); dot(c, '#111', x + 20, TG - 57, 0.8); ln(c, '#E8A24A', 1.2, x + 12, TG - 48, x + 12, TG - 45);
    rr(c, '#6A6F78', x + 66, TG - 20, 18, 20, 3); ln(c, '#9AA0AA', 1.6, x + 68, TG - 20, x + 82, TG - 28);
  };
  const _tProp = townProp;
  townProp = function(c, D, p, P, r){
    if (!THEMES[D.theme]) return _tProp(c, D, p, P, r);
    groundOnce(c, D);
    _tProp(c, D, p, P, r);
    const f = PROPX[p.k]; if (f){ c.save(); f(c, D, p); c.restore(); }
  };

  /* ---------- the ground ---------- */
  let fieldD = null, groundDone = true;
  function groundOnce(c, D){ if (groundDone || fieldD !== D) return; groundDone = true; paintGround(c, D); }
  function paintGround(c, D){
    const W = D.w, r = miniRng(D.w * 3 + D.id.length * 7);
    if (D.theme === 'farm'){
      for (let k = 0; k < 2; k++){ c.strokeStyle = 'rgba(70,45,15,.26)'; c.lineWidth = 2; c.beginPath(); c.moveTo(0, TG + 10 + k * 14); for (let x = 0; x <= W; x += 30) c.lineTo(x, TG + 10 + k * 14 + Math.sin(x * 0.05 + k) * 1.4); c.stroke(); }
      for (let i = 0; i < Math.round(W / 3); i++){ const px = r() * W, py = TG + 2 + r() * 96; c.fillStyle = ['rgba(120,90,50,.55)', 'rgba(200,175,120,.55)', 'rgba(90,65,35,.5)'][i % 3]; c.beginPath(); c.ellipse(px, py, 1 + r() * 2.4, 0.8 + r() * 1.4, 0, 0, TAU); c.fill(); }
      for (let i = 0; i < Math.round(W / 16); i++){ const gx = r() * W, gy = TG + 40 + r() * 58; for (let k = -1; k <= 1; k++) ln(c, ['#8A9A4A', '#A8A858', '#7A8A3A'][i % 3], 1.1, gx + k * 1.8, gy, gx + k * 3.4, gy - 4 - r() * 5); }
      for (let i = 0; i < Math.round(W / 70); i++){ const sx = r() * W, sy = TG + 6 + r() * 90; ln(c, '#D9C26A', 1.3, sx, sy, sx + 8, sy - 2); ln(c, '#D9C26A', 1.3, sx + 2, sy + 2, sx + 10, sy); }
      for (let i = 0; i < 4; i++){ const px = 500 + r() * (W - 800), py = TG + 56 + r() * 30; c.fillStyle = 'rgba(100,150,200,.32)'; c.beginPath(); c.ellipse(px, py, 26 + r() * 20, 4, 0, 0, TAU); c.fill(); c.fillStyle = 'rgba(255,255,255,.3)'; c.fillRect(px - 10, py - 1, 12, 1); }
      for (let i = 0; i < 24; i++){ const hx = 1700 + r() * 1300, hy = TG + 8 + r() * 28; c.fillStyle = 'rgba(70,45,15,.35)'; c.beginPath(); c.arc(hx, hy, 2, Math.PI, TAU); c.fill(); c.fillRect(hx - 2, hy, 1, 2); c.fillRect(hx + 1, hy, 1, 2); }
      for (let i = 0; i < 18; i++){ const fx = r() * W, fy = TG + 60 + r() * 34; ln(c, '#4E8A32', 1, fx, fy, fx, fy - 7); dot(c, ['#F2C230', '#FFFFFF', '#F29AC0'][i % 3], fx, fy - 8, 1.7); }
    } else {
      for (let i = 0; i < Math.round(W / 40); i++){ const sx = r() * W, sy = TG + 4 + r() * 94; c.strokeStyle = 'rgba(130,100,40,.28)'; c.lineWidth = 1; c.beginPath(); c.arc(sx, sy, 6 + r() * 12, 0.2, 2.4); c.stroke(); }
      for (let i = 0; i < Math.round(W / 3); i++){ const px = r() * W, py = TG + 2 + r() * 96; c.fillStyle = ['rgba(150,120,60,.45)', 'rgba(240,225,170,.6)', 'rgba(120,90,40,.4)'][i % 3]; c.beginPath(); c.ellipse(px, py, 0.8 + r() * 1.8, 0.7 + r() * 1.2, 0, 0, TAU); c.fill(); }
      for (let i = 0; i < 30; i++){ const sx = r() * W, sy = TG + 44 + r() * 50, a = r() * TAU; if (i % 3 === 0){ c.fillStyle = '#F4E8D8'; c.beginPath(); c.arc(sx, sy, 3, 0, TAU); c.fill(); c.strokeStyle = 'rgba(160,110,80,.6)'; c.lineWidth = 0.8; c.beginPath(); c.arc(sx, sy, 1.6, 0, 4); c.stroke(); } else if (i % 3 === 1){ for (let k = 0; k < 5; k++) tri(c, '#E8885A', sx + Math.cos(a + k * 1.256) * 1, sy + Math.sin(a + k * 1.256) * 1, sx + Math.cos(a + k * 1.256 - 0.3) * 4, sy + Math.sin(a + k * 1.256 - 0.3) * 4, sx + Math.cos(a + k * 1.256 + 0.3) * 4, sy + Math.sin(a + k * 1.256 + 0.3) * 4); } else { c.fillStyle = '#F2B8A0'; c.beginPath(); c.moveTo(sx, sy); c.lineTo(sx + 4, sy + 2); c.lineTo(sx + 1, sy + 5); c.closePath(); c.fill(); } }
      for (let i = 0; i < 6; i++){ const dx = 500 + r() * (W - 700), dy = TG + 50 + r() * 40; ln(c, '#8A6A44', 3, dx, dy, dx + 30 + r() * 20, dy + (r() - 0.5) * 6); ln(c, 'rgba(255,255,255,.25)', 1, dx, dy - 1, dx + 20, dy - 1); }
      for (let i = 0; i < 40; i++){ const gx = 440 + r() * (W - 440), gy = TG + 8 + r() * 86; for (let k = -1; k <= 1; k++) ln(c, ['#8AA05A', '#A8B070'][i % 2], 1.1, gx + k * 1.6, gy, gx + k * 3.6, gy - 5 - r() * 6); }
      for (let i = 0; i < 10; i++){ const fx = 440 + r() * (W - 440), fy = TG + 56 + r() * 36; c.strokeStyle = 'rgba(100,70,30,.3)'; c.lineWidth = 1; c.beginPath(); c.ellipse(fx, fy, 2, 3.4, 0.3, 0, TAU); c.stroke(); c.beginPath(); c.ellipse(fx + 6, fy + 5, 2, 3.4, 0.3, 0, TAU); c.stroke(); }
      for (let i = 0; i < 18; i++){ const cx = 450 + r() * (W - 460), cy = TG + 50 + r() * 44; dot(c, '#D5352B', cx, cy, 2); ln(c, '#D5352B', 1, cx - 3, cy - 1, cx - 5, cy - 3); ln(c, '#D5352B', 1, cx + 3, cy - 1, cx + 5, cy - 3); }
    }
  }
  const _tField = townPaintField;
  townPaintField = function(c, D, W, H, R){
    if (D.indoor || !THEMES[D.theme]) return _tField(c, D, W, H, R);
    fieldD = D; groundDone = false;
    try { _tField(c, D, W, H, R); groundOnce(c, D); } finally { fieldD = null; groundDone = true; }
  };
  const _tBuilding = townBuilding;
  townBuilding = function(c, D, b, P, r){ if (THEMES[D.theme]) groundOnce(c, D); return _tBuilding(c, D, b, P, r); };

  /* ---------- the backdrops ---------- */
  const ridge1 = function(x){ return TG - 150 - 30 * Math.abs(Math.sin(x * 0.0042 + 0.8)) - 14 * Math.sin(x * 0.013); };
  const ridge2 = function(x){ return TG - 90 - 26 * Math.abs(Math.sin(x * 0.0061 + 2.1)) - 10 * Math.sin(x * 0.021); };
  const _tFar = townPaintFar;
  townPaintFar = function(c, D, W, H, R){
    _tFar(c, D, W, H, R);
    if (D.indoor) return;
    const r = miniRng(D.w * 11 + 5);
    if (D.theme === 'farm'){
      for (let x = 0; x < W; x += 36){ const a = ridge1(x) + 7, b2 = Math.min(ridge2(x), a + 40);                       /* a quilt of fields on the far hill */
        c.fillStyle = ['rgba(150,170,90,.5)', 'rgba(205,190,100,.5)', 'rgba(110,150,80,.5)', 'rgba(170,150,90,.4)'][Math.floor(r() * 4)]; c.beginPath(); c.moveTo(x, a); c.lineTo(x + 34, a + 3); c.lineTo(x + 34, b2 + 6); c.lineTo(x, b2); c.closePath(); c.fill();
        if (r() < 0.5) ln(c, 'rgba(50,90,40,.45)', 1.4, x, a, x, b2); }
      for (let x = 0; x < W; x += 20 + r() * 20){ const s = 0.6 + r() * 0.8; c.fillStyle = 'rgba(60,100,60,.8)'; c.beginPath(); c.arc(x, ridge1(x) - 2 * s, 3.4 * s, 0, TAU); c.fill(); }
      for (let x = 0; x < W; x += 26 + r() * 26){ const s = 0.7 + r() * 0.8, y = ridge2(x); c.fillStyle = 'rgba(70,115,60,.9)'; c.beginPath(); c.arc(x, y - 3 * s, 4.4 * s, 0, TAU); c.arc(x + 3 * s, y - 2 * s, 3.4 * s, 0, TAU); c.fill(); c.fillStyle = 'rgba(255,255,255,.15)'; c.beginPath(); c.arc(x - 1 * s, y - 4 * s, 1.8 * s, 0, TAU); c.fill(); }
      for (let i = 0; i < 4; i++){ const x = 300 + i * W / 4 + r() * 200, y = ridge1(x) + 2; ln(c, '#B8BCC8', 1.6, x, y, x, y - 22); for (let k = 0; k < 4; k++){ const a = k * Math.PI / 2 + i; ln(c, '#B8BCC8', 1.4, x, y - 22, x + Math.cos(a) * 11, y - 22 + Math.sin(a) * 11); } dot(c, '#9AA0AA', x, y - 22, 1.6); }
      for (let i = 0; i < 6; i++){ c.fillStyle = 'rgba(255,255,255,.14)'; c.beginPath(); c.ellipse(r() * W, TG - 150 + r() * 60, 60 + r() * 80, 6, 0, 0, TAU); c.fill(); }
    } else if (D.theme === 'isle'){
      for (let y = TG - 108; y < TG; y += 9){ c.fillStyle = r() < 0.5 ? 'rgba(255,255,255,.2)' : 'rgba(20,70,110,.1)'; c.fillRect(r() * W, y, 20 + r() * 50, 1.4); }
      for (let i = 0; i < 80; i++){ const wx = r() * W, wy = TG - 104 + r() * 96; c.strokeStyle = 'rgba(255,255,255,' + (0.2 + r() * 0.3) + ')'; c.lineWidth = 1; c.beginPath(); c.arc(wx, wy, 2.4 + r() * 3.4, Math.PI * 1.1, Math.PI * 1.9); c.stroke(); }
      for (let i = 0; i < 50; i++) dot(c, 'rgba(255,255,230,.6)', r() * W, TG - 104 + r() * 60, 0.9);
      const g = c.createLinearGradient(0, TG - 110, 0, TG); g.addColorStop(0, 'rgba(255,255,255,.22)'); g.addColorStop(0.3, 'rgba(255,255,255,0)'); g.addColorStop(1, 'rgba(0,40,80,.12)'); c.fillStyle = g; c.fillRect(0, TG - 110, W, 112);
      for (let k = 0; k < 5; k++){ const px = 930 + k * 50 + r() * 14, py = TG - 124 + Math.sin(k) * 4; ln(c, '#4A6A5A', 1.4, px, py + 14, px + 1, py); c.strokeStyle = '#3E7A60'; c.lineWidth = 1.4; for (let q = 0; q < 5; q++){ c.beginPath(); c.moveTo(px + 1, py); c.lineTo(px + 1 + Math.cos(q * 1.4) * 9, py + Math.sin(q * 1.4) * 4 + 3); c.stroke(); } }
      for (let i = 0; i < 4; i++){ const bx = 120 + r() * (W - 240), by = TG - 70 + r() * 40; c.fillStyle = 'rgba(255,255,255,.7)'; c.beginPath(); c.arc(bx, by, 2, 0, TAU); c.fill(); }
      for (let i = 0; i < 5; i++){ const bx = 100 + r() * (W - 200), by = TG - 140 - r() * 40; c.strokeStyle = 'rgba(70,80,100,.6)'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(bx - 6, by + 2); c.quadraticCurveTo(bx - 3, by - 3, bx, by); c.quadraticCurveTo(bx + 3, by - 3, bx + 6, by + 2); c.stroke(); }
    }
  };
  const _tMid = townPaintMid;
  townPaintMid = function(c, D, W, H, R){
    _tMid(c, D, W, H, R);
    if (D.indoor) return;
    if (D.theme === 'farm'){
      const r = miniRng(D.w * 17 + 9);
      for (let k = 0; k < 14; k++){ const x = k * (W / 13), w = W / 13 + 4, m = k % 3;
        for (let row = 0; row < 5; row++) for (let i = 0; i < Math.floor(w / 13); i++){ const tx = x + 6 + i * 13 + (row % 2) * 6 - row * 1.6, ty = TG - 52 + row * 11;
          if (m === 0){ c.strokeStyle = '#3E7A2A'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(tx, ty); c.lineTo(tx - 3, ty - 6); c.moveTo(tx, ty); c.lineTo(tx + 3, ty - 6); c.moveTo(tx, ty); c.lineTo(tx, ty - 7); c.stroke(); }
          else if (m === 1){ ln(c, '#8A7A2A', 1, tx, ty, tx, ty - 8); c.fillStyle = '#E8C84A'; c.fillRect(tx - 1.2, ty - 12, 2.4, 5); ln(c, '#C9A02A', 0.7, tx, ty - 12, tx - 1.4, ty - 15); ln(c, '#C9A02A', 0.7, tx, ty - 12, tx + 1.4, ty - 15); }
          else { dot(c, '#3E7A2A', tx, ty - 3, 4); dot(c, '#5E9A3A', tx - 0.8, ty - 4, 2.6); } } }
      for (let k = 0; k < 6; k++){
        const x = 120 + k * (W / 6) + FILM_R(k + 900) * 120, s = 0.5 + FILM_R(k + 910) * 0.3, by = TG - 56;
        c.save(); c.beginPath(); c.rect(x, by - 44 * s, 60 * s, 44 * s); c.clip(); for (let i = 0; i < 8; i++) ln(c, 'rgba(0,0,0,.2)', 1, x + i * 8 * s, by - 44 * s, x + i * 8 * s, by); c.restore();
        c.strokeStyle = '#F4F1E8'; c.lineWidth = 1.4 * s; c.strokeRect(x + 22 * s, by - 24 * s, 16 * s, 24 * s); ln(c, '#F4F1E8', 1.2 * s, x + 22 * s, by - 24 * s, x + 38 * s, by); ln(c, '#F4F1E8', 1.2 * s, x + 38 * s, by - 24 * s, x + 22 * s, by);
        c.fillStyle = '#F4F1E8'; c.fillRect(x + 25 * s, by - 40 * s, 10 * s, 8 * s); c.fillStyle = '#2A1E14'; c.fillRect(x + 26.4 * s, by - 38.6 * s, 7 * s, 5 * s);
        tiles(c, [x - 6 * s, by - 44 * s, x + 30 * s, by - 74 * s, x + 66 * s, by - 44 * s], k + 3);
        const sx = x + 70 * s; c.fillStyle = 'rgba(0,0,0,.14)'; c.fillRect(sx + 9 * s, by - 60 * s, 5 * s, 60 * s); for (let i = 1; i < 5; i++) ln(c, 'rgba(0,0,0,.25)', 1, sx, by - 60 * s + i * 12 * s, sx + 14 * s, by - 60 * s + i * 12 * s); c.fillStyle = '#9AA0AA'; c.beginPath(); c.arc(sx + 7 * s, by - 60 * s, 7 * s, Math.PI, TAU); c.fill(); ln(c, '#6A6F78', 1, sx + 7 * s, by - 67 * s, sx + 7 * s, by - 72 * s);
        for (let i = 0; i < 5; i++) ln(c, 'rgba(130,90,20,.6)', 1, x - 54 * s + i * 3.4 * s, TG - 60, x - 40 * s + i * 2.6 * s, TG - 60 - 8 * s);
        leafBlob(c, x + 130 * s, TG - 80 * s - 20, 20 * s, k + 40, '#3E6A2E', '#6AA24A', '#2A4E22'); ln(c, '#4A3624', 1.4, x + 130 * s, TG - 80 * s - 4, x + 130 * s, TG - 80 * s + 22 * s);
        for (let i = 0; i < 6; i++){ const fx = x - 20 * s + i * 14 * s; ln(c, '#7A5A3A', 1, fx, TG - 48, fx, TG - 58); } ln(c, '#7A5A3A', 1, x - 20 * s, TG - 56, x + 56 * s, TG - 56);
      }
    } else if (D.theme === 'isle'){
      const r = miniRng(D.w * 19 + 4);
      for (let k = 0; k < 7; k++){ const x = 200 + k * 330 + FILM_R(k + 1200) * 90;
        c.fillStyle = 'rgba(0,0,0,.12)'; c.beginPath(); c.ellipse(x + 15, TG - 82, 24, 3, 0, 0, TAU); c.fill();
        tri(c, '#E8E2D0', x + 17, TG - 100, x + 17, TG - 128, x + 36, TG - 100); tri(c, '#D8D0BA', x + 13, TG - 98, x + 13, TG - 118, x - 2, TG - 98);
        ln(c, 'rgba(0,0,0,.2)', 1, x + 17, TG - 104, x + 31, TG - 104); ln(c, 'rgba(0,0,0,.2)', 1, x + 17, TG - 112, x + 26, TG - 112);
        ln(c, '#6A4A32', 1.6, x + 15, TG - 132, x + 15, TG - 92); tri(c, k % 2 ? '#D5352B' : '#2F8A5A', x + 15, TG - 132, x + 24, TG - 130, x + 15, TG - 127);
        c.fillStyle = '#F4F1E8'; c.fillRect(x - 4, TG - 92, 38, 5); c.fillStyle = k % 2 ? '#2F5F94' : '#D5352B'; c.fillRect(x - 4, TG - 90, 38, 1.6); dot(c, '#3A2A1E', x + 8, TG - 90, 1); dot(c, '#3A2A1E', x + 18, TG - 90, 1);
        c.strokeStyle = 'rgba(255,255,255,.4)'; c.lineWidth = 1; c.beginPath(); c.moveTo(x - 8, TG - 84); c.quadraticCurveTo(x + 15, TG - 80, x + 38, TG - 84); c.stroke(); }
      for (let x = 440; x <= W + 30; x += 30){ const y = TG - 40 - 10 * Math.abs(Math.sin(x * 0.01)); ln(c, 'rgba(255,255,255,.7)', 2, x - 30, y + 1, x, y + 1); if (x % 90 === 0) for (let k = -1; k <= 1; k++) ln(c, '#8AA05A', 1.2, x + k * 2, y + 2, x + k * 4, y - 6); }
      for (let i = 0; i < 4; i++){ const x = 520 + r() * (W - 700), y = TG - 40 - 10 * Math.abs(Math.sin(x * 0.01)); ln(c, '#7A5A38', 3, x, y + 2, x + 3, y - 30); c.strokeStyle = '#3E8A3A'; c.lineWidth = 1.6; for (let q = 0; q < 6; q++){ c.beginPath(); c.moveTo(x + 3, y - 30); c.quadraticCurveTo(x + 3 + Math.cos(q * 1.1 - 2.4) * 10, y - 34 + Math.sin(q * 1.1 - 2.4) * 6, x + 3 + Math.cos(q * 1.1 - 2.4) * 18, y - 28 + Math.sin(q * 1.1 - 2.4) * 8); c.stroke(); } }
      for (let i = 0; i < 12; i++){ const x = 460 + r() * (W - 480), y = TG - 38 - 8 * Math.abs(Math.sin(x * 0.01)); c.fillStyle = '#E8DCC0'; c.beginPath(); c.ellipse(x, y + 6, 2.4, 1.6, 0, 0, TAU); c.fill(); }
    }
  };
})();
