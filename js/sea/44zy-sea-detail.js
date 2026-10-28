/* ==========================================================================================================================
   44zy-sea-detail.js  --  The open sea, seen from above: the small parts.
   Pure drawing. 44zq-sea.js paints the terrain as a color field with a few vector shapes on top, and the boats, docks, village and
   lighthouse as plain blocks. This file wraps seaDrawTerrain, seaDrawFeatures and seaDrawBoat and adds: sparkle and swell on the water,
   starfish and shells on the shallows and sand, driftwood, crabs, bushes and flowers on the grass, trees in several colors with palms
   near the beach, faceted rocks, coral and fish on the reefs; plank nails, piles, bollards, crates and lanterns on the docks; tiles,
   chimneys and gardens on the village roofs; a sweeping beam on the lighthouse; staves and glints on the loot; and for each boat its
   planking, rails, windows, lights and a bow wave.
   Cost: the terrain pass visits the same cells the original does and draws a few rectangles for about a quarter of them.
   ========================================================================================================================== */
(function(){
  const hs = seaHash;
  const line = function(c, col, lw, x1, y1, x2, y2){ c.strokeStyle = col; c.lineWidth = lw; c.beginPath(); c.moveTo(x1, y1); c.lineTo(x2, y2); c.stroke(); };
  const disc = function(c, col, x, y, r){ c.fillStyle = col; c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill(); };

  /* ---------- the terrain ---------- */
  const _terrain = seaDrawTerrain;
  seaDrawTerrain = function(ctx, W, H, z, camX, camY, t, weather){
    _terrain(ctx, W, H, z, camX, camY, t, weather);
    const cs = SEA_C * z, ox = camX - W / 2 / z, oy = camY - H / 2 / z, x0 = Math.floor(ox / SEA_C) - 1, y0 = Math.floor(oy / SEA_C) - 1, nx = Math.ceil(W / cs) + 3, ny = Math.ceil(H / cs) + 3;
    ctx.lineCap = 'round';
    for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++){
      const cx = x0 + i, cy = y0 + j; if (cx < 0 || cy < 0 || cx >= SEA_N || cy >= SEA_N) continue;
      const ty = seaCell(cx, cy), a = hs(cx, cy, 5), b = hs(cx, cy, 6), d = hs(cx, cy, 7);
      const sx = (cx * SEA_C - camX) * z + W / 2, sy = (cy * SEA_C - camY) * z + H / 2, mx = sx + cs * (0.15 + a * 0.7), my = sy + cs * (0.15 + b * 0.7);
      if (ty <= SEA_WATER){
        if (d > 0.9){ const k = 0.5 + 0.5 * Math.sin(t * 3 + a * 20); ctx.fillStyle = 'rgba(255,255,255,' + (0.18 + k * 0.4).toFixed(2) + ')'; ctx.fillRect(mx, my, 1.8 * z, 1.8 * z); }
        else if (d < 0.025){ ctx.strokeStyle = 'rgba(255,255,255,.22)'; ctx.lineWidth = 1.2 * z; ctx.beginPath(); ctx.arc(mx, my, 5 * z, 3.6, 5.6); ctx.arc(mx + 7 * z, my + 3 * z, 5 * z, 3.6, 5.6); ctx.stroke(); }
        else if (ty === SEA_DEEP && d > 0.86 && d < 0.88){ ctx.strokeStyle = 'rgba(180,220,255,.2)'; ctx.lineWidth = z; ctx.beginPath(); ctx.arc(mx, my - ((t * 6 + a * 30) % 12) * z, 1.6 * z, 0, TAU); ctx.stroke(); }
      } else if (ty === SEA_SHALLOW){
        if (d > 0.82){ ctx.strokeStyle = 'rgba(255,255,255,.3)'; ctx.lineWidth = z; ctx.beginPath(); ctx.arc(mx, my, 4 * z, 0.4, 2.6); ctx.stroke(); }
        else if (d < 0.035){ for (let k = 0; k < 5; k++){ const ang = k * 1.2566 + a * 6; ctx.fillStyle = '#E8885A'; ctx.beginPath(); ctx.moveTo(mx + Math.cos(ang) * z, my + Math.sin(ang) * z); ctx.lineTo(mx + Math.cos(ang - 0.35) * 4.4 * z, my + Math.sin(ang - 0.35) * 4.4 * z); ctx.lineTo(mx + Math.cos(ang + 0.35) * 4.4 * z, my + Math.sin(ang + 0.35) * 4.4 * z); ctx.fill(); } }
        else if (a > 0.9){ ctx.fillStyle = 'rgba(240,235,200,.7)'; ctx.fillRect(mx, my, 1.8 * z, 1.4 * z); ctx.fillRect(mx + 3 * z, my + 2 * z, 1.4 * z, 1.4 * z); }
      } else if (ty === SEA_SAND){
        if (d > 0.9){ disc(ctx, '#F4E8D8', mx, my, 2.2 * z); ctx.strokeStyle = 'rgba(170,120,90,.7)'; ctx.lineWidth = 0.8 * z; ctx.beginPath(); ctx.arc(mx, my, 1.1 * z, 0, 4); ctx.stroke(); }
        else if (d < 0.04){ line(ctx, '#8A6A44', 2.4 * z, mx - 6 * z, my, mx + 6 * z, my + (a - 0.5) * 3 * z); line(ctx, 'rgba(255,255,255,.3)', 0.8 * z, mx - 5 * z, my - z, mx + 4 * z, my - z); }
        else if (a > 0.955){ const w = Math.sin(t * 2 + a * 40) * 2 * z; disc(ctx, '#D5352B', mx + w, my, 1.8 * z); line(ctx, '#D5352B', 0.9 * z, mx + w - 2.4 * z, my - z, mx + w - 4 * z, my - 2.4 * z); line(ctx, '#D5352B', 0.9 * z, mx + w + 2.4 * z, my - z, mx + w + 4 * z, my - 2.4 * z); }
        else if (b > 0.93){ ctx.fillStyle = 'rgba(110,85,40,.22)'; ctx.beginPath(); ctx.ellipse(mx, my, 1.4 * z, 2.2 * z, 0.3, 0, TAU); ctx.fill(); ctx.beginPath(); ctx.ellipse(mx + 4 * z, my + 3 * z, 1.4 * z, 2.2 * z, 0.3, 0, TAU); ctx.fill(); }
      } else if (ty === SEA_GRASS){
        if (d > 0.84){ disc(ctx, 'rgba(10,40,10,.25)', mx + 1.5 * z, my + 2 * z, 5.4 * z); disc(ctx, '#3E7A38', mx, my, 5 * z); disc(ctx, '#4E9A44', mx + 3 * z, my - 1.5 * z, 3.4 * z); disc(ctx, 'rgba(255,255,200,.22)', mx - 1.6 * z, my - 1.8 * z, 1.8 * z); }
        else if (d < 0.07){ ctx.fillStyle = '#8A8A92'; ctx.beginPath(); ctx.ellipse(mx, my, 3.2 * z, 2.2 * z, 0.4, 0, TAU); ctx.fill(); ctx.fillStyle = 'rgba(255,255,255,.3)'; ctx.fillRect(mx - 1.5 * z, my - 1.4 * z, 2 * z, 0.9 * z); }
        else if (a > 0.9){ for (let k = 0; k < 4; k++) disc(ctx, ['#FFD84D', '#FFFFFF', '#F29AC0', '#B58AE8'][k], mx + (k % 2) * 3 * z, my + (k >> 1) * 3 * z, 1.5 * z); }
      } else if (ty === SEA_FOREST){
        const r = hs(cx, cy, 1); if (r <= 0.25) continue;
        const rr = (9 + r * 8) * z, tx = sx + cs * (0.2 + r * 0.6), tyy = sy + cs * (0.2 + hs(cx, cy, 2) * 0.6), hv = hs(cx, cy, 9), v = SEA_V[cy * SEA_N + cx];
        if (v < 0.3 && hv > 0.45){                                                                       /* near the beach: palms */
          disc(ctx, 'rgba(10,40,10,.3)', tx + 3 * z, tyy + 4 * z, rr * 0.8);
          for (let k = 0; k < 7; k++){ const ang = k * 0.8976 + hv * 6; ctx.strokeStyle = k % 2 ? '#2F7A30' : '#3E9A3C'; ctx.lineWidth = 2.4 * z; ctx.beginPath(); ctx.moveTo(tx, tyy); ctx.quadraticCurveTo(tx + Math.cos(ang) * rr * 0.6, tyy + Math.sin(ang) * rr * 0.6 - z, tx + Math.cos(ang) * rr * 1.05, tyy + Math.sin(ang) * rr * 1.05); ctx.stroke(); }
          disc(ctx, '#6A4A18', tx - z, tyy, 1.6 * z); disc(ctx, '#8A5A24', tx + 1.4 * z, tyy + z, 1.6 * z);
        } else {
          if (hv < 0.16){ disc(ctx, 'rgba(150,180,40,.2)', tx, tyy, rr * 0.9); } else if (hv > 0.93){ disc(ctx, 'rgba(210,110,30,.2)', tx, tyy, rr * 0.9); } else if (hv > 0.78){ disc(ctx, 'rgba(10,60,70,.2)', tx, tyy, rr * 0.9); }
          ctx.fillStyle = 'rgba(255,255,200,.24)'; for (let k = 0; k < 4; k++) ctx.fillRect(tx - rr * 0.5 + hs(cx, cy, 20 + k) * rr * 0.7, tyy - rr * 0.7 + hs(cx, cy, 30 + k) * rr * 0.6, 2 * z, 1.4 * z);
          ctx.strokeStyle = 'rgba(10,50,10,.3)'; ctx.lineWidth = z; ctx.beginPath(); ctx.arc(tx, tyy, rr * 0.8, 0.4, 1.5); ctx.stroke();
          if (hv > 0.6 && hv < 0.64) disc(ctx, '#D5352B', tx + rr * 0.3, tyy - rr * 0.2, 1.8 * z);
        }
      } else if (ty === SEA_ROCK){
        const rr = 8 * z; for (let k = 0; k < 3; k++) line(ctx, 'rgba(0,0,0,.28)', 1 * z, mx, my, mx + Math.cos(a * 6 + k * 2.1) * rr * 0.9, my + Math.sin(a * 6 + k * 2.1) * rr * 0.9);
        ctx.fillStyle = 'rgba(80,130,50,.55)'; ctx.beginPath(); ctx.ellipse(mx - 2 * z, my - 3 * z, 3 * z, 1.8 * z, 0.4, 0, TAU); ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,' + (0.35 + 0.2 * Math.sin(t * 2 + a * 9)).toFixed(2) + ')'; ctx.lineWidth = 1.4 * z; ctx.beginPath(); ctx.arc(mx, my, rr * 1.3, 0.3, 2.2); ctx.stroke();
      } else if (ty === SEA_REEF){
        if (d > 0.5){ const px = sx + cs * (0.2 + hs(cx, cy, 20) * 0.6), py = sy + cs * (0.2 + hs(cx, cy, 30) * 0.6); ctx.strokeStyle = 'rgba(255,255,255,.35)'; ctx.lineWidth = z; for (let q = 0; q < 3; q++){ ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px + Math.cos(q * 2.1 + a * 6) * 4 * z, py + Math.sin(q * 2.1 + a * 6) * 4 * z); ctx.stroke(); } disc(ctx, 'rgba(255,255,255,.4)', px - z, py - z, 0.9 * z); }
        if (d < 0.5) continue;
        const fa = t * 0.9 + a * 9, fx = sx + cs * 0.5 + Math.cos(fa) * cs * 0.35, fy = sy + cs * 0.5 + Math.sin(fa) * cs * 0.25; ctx.fillStyle = '#FF9A3C'; ctx.beginPath(); ctx.ellipse(fx, fy, 2.2 * z, 1.2 * z, fa + Math.PI / 2, 0, TAU); ctx.fill();
      }
    }
  };

  /* ---------- docks, village, lighthouse, loot ---------- */
  const _features = seaDrawFeatures;
  seaDrawFeatures = function(ctx, W, H, z, camX, camY, t){
    _features(ctx, W, H, z, camX, camY, t);
    const sc = function(wx, wy){ return seaWorldToScreen(wx, wy, W, H, z, camX, camY); }, vw = W / z / 2 + 160, vh = H / z / 2 + 160;
    Object.keys(SEA_DOCKS).forEach(function(k){
      const d = SEA_DOCKS[k]; if (Math.abs(d.px - camX) > vw + 100 || Math.abs(d.py - camY) > vh + 100) return;
      ctx.save(); const p = sc(d.px, d.py); ctx.translate(p.x, p.y); ctx.rotate(d.ang); ctx.scale(z, z);
      for (let i = -28; i < 100; i += 9){ ctx.fillStyle = 'rgba(255,240,200,.07)'; ctx.fillRect(i + 1, -12, 3, 24); ctx.fillStyle = 'rgba(20,12,6,.55)'; ctx.fillRect(i + 1.4, -9, 1.4, 1.4); ctx.fillRect(i + 1.4, 8, 1.4, 1.4); }
      for (let i = 0; i < 4; i++){ ctx.fillStyle = '#6A4A32'; ctx.beginPath(); ctx.arc(i * 34 - 25, -12, 3.4, 0, TAU); ctx.arc(i * 34 - 25, 12, 3.4, 0, TAU); ctx.fill(); ctx.fillStyle = 'rgba(255,255,255,.25)'; ctx.fillRect(i * 34 - 27, -14, 2, 2); ctx.fillRect(i * 34 - 27, 10, 2, 2); }
      ctx.strokeStyle = 'rgba(255,255,255,.5)'; ctx.lineWidth = 1.4; for (let i = 0; i < 4; i++){ ctx.beginPath(); ctx.arc(i * 34 - 25, -12, 5.2 + Math.sin(t * 2 + i) * 0.6, 0, TAU); ctx.arc(i * 34 - 25, 12, 5.2 + Math.cos(t * 2 + i) * 0.6, 0, TAU); ctx.stroke(); }
      ctx.fillStyle = '#4A3624'; ctx.beginPath(); ctx.arc(94, -8, 3.4, 0, TAU); ctx.arc(94, 8, 3.4, 0, TAU); ctx.fill(); ctx.strokeStyle = '#B79C6A'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.arc(94, -8, 4.4, 0, TAU); ctx.stroke();
      ctx.fillStyle = '#8A6642'; ctx.fillRect(60, -9, 9, 8); ctx.fillRect(70, -9, 7, 7); ctx.strokeStyle = '#5E4430'; ctx.lineWidth = 1; ctx.strokeRect(60, -9, 9, 8); ctx.beginPath(); ctx.moveTo(60, -9); ctx.lineTo(69, -1); ctx.stroke();
      ctx.fillStyle = '#FFE49A'; ctx.beginPath(); ctx.arc(-26, 0, 2.2, 0, TAU); ctx.fill(); const gl = ctx.createRadialGradient(-26, 0, 0, -26, 0, 14); gl.addColorStop(0, 'rgba(255,225,140,.4)'); gl.addColorStop(1, 'rgba(255,225,140,0)'); ctx.fillStyle = gl; ctx.fillRect(-40, -14, 28, 28);
      for (let i = 0; i < 3; i++){ ctx.strokeStyle = '#B79C6A'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(30 + i * 3, 4 + i * 1, 4 - i, 0, TAU); ctx.stroke(); }
      ctx.fillStyle = '#C9CDD9'; ctx.fillRect(40, 3, 6, 4); ctx.fillStyle = '#6A6F78'; ctx.fillRect(41, 4, 4, 2);
      ctx.restore();
    });
    const d = SEA_DOCKS.isle;
    for (let i = 0; i < 9; i++){
      const hx = d.px + (i - 4) * 46 + (i % 2) * 8, hy = d.py - 70 - (i % 3) * 34, p = sc(hx, hy);
      if (p.x < -60 || p.x > W + 60 || p.y < -60 || p.y > H + 60) continue;
      const x = p.x, y = p.y, w = 30 * z, h = 26 * z;
      ctx.fillStyle = 'rgba(255,230,200,.1)'; for (let q = 0; q < 5; q++) ctx.fillRect(x - w / 2, y - h / 2 + q * h / 5, w, 1.2);
      ctx.fillStyle = 'rgba(0,0,0,.2)'; for (let q = 1; q < 5; q++) ctx.fillRect(x - w / 2, y - h / 2 + q * h / 5, w, 1);
      ctx.strokeStyle = 'rgba(40,20,10,.5)'; ctx.lineWidth = 1.2 * z; ctx.strokeRect(x - w / 2, y - h / 2, w, h);
      ctx.fillStyle = '#5A3A2E'; ctx.fillRect(x + 4 * z, y - 9 * z, 5 * z, 5 * z); ctx.fillStyle = 'rgba(0,0,0,.3)'; ctx.fillRect(x + 4.6 * z, y - 8.4 * z, 3.8 * z, 3.8 * z);
      for (let q = 0; q < 3; q++) disc(ctx, 'rgba(235,235,240,' + (0.45 - q * 0.12).toFixed(2) + ')', x + 7 * z + q * 3 * z + Math.sin(t + i) * 2 * z, y - 12 * z - q * 5 * z, (2.6 + q) * z);
      ctx.strokeStyle = '#7A5A3A'; ctx.lineWidth = 1.2 * z; ctx.beginPath(); ctx.rect(x - w / 2 - 6 * z, y - h / 2 - 5 * z, w + 12 * z, h + 24 * z); ctx.stroke();
      for (let q = 0; q < 6; q++){ ctx.fillStyle = '#3E7A38'; ctx.fillRect(x - w / 2 - 4 * z + q * 6 * z, y + h / 2 + 6 * z, 4 * z, 2.4 * z); } ctx.fillStyle = '#C9A872'; ctx.fillRect(x - 2 * z, y + h / 2, 4 * z, 10 * z);
    }
    const lh = sc(d.px + 260, d.py - 160);
    if (lh.x > -140 && lh.x < W + 140 && lh.y > -140 && lh.y < H + 140){
      const a = t * 1.2; ctx.save(); ctx.translate(lh.x, lh.y); ctx.rotate(a);
      const bg = ctx.createLinearGradient(0, 0, 260 * z, 0); bg.addColorStop(0, 'rgba(255,245,170,.5)'); bg.addColorStop(1, 'rgba(255,245,170,0)'); ctx.fillStyle = bg; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(260 * z, -30 * z); ctx.lineTo(260 * z, 30 * z); ctx.closePath(); ctx.fill(); ctx.restore();
      for (let q = 0; q < 12; q++){ const aa = q * TAU / 12; disc(ctx, '#3A3A44', lh.x + Math.cos(aa) * 23 * z, lh.y + Math.sin(aa) * 23 * z, 1.4 * z); }
      ctx.strokeStyle = 'rgba(0,0,0,.25)'; ctx.lineWidth = z; for (let q = 0; q < 8; q++){ ctx.beginPath(); ctx.moveTo(lh.x + Math.cos(q * 0.785) * 8 * z, lh.y + Math.sin(q * 0.785) * 8 * z); ctx.lineTo(lh.x + Math.cos(q * 0.785) * 16 * z, lh.y + Math.sin(q * 0.785) * 16 * z); ctx.stroke(); }
      disc(ctx, 'rgba(255,255,255,.7)', lh.x - 2 * z, lh.y - 2 * z, 2 * z);
    }
    Sea.loot.forEach(function(l){
      if (l.got || Math.abs(l.x - camX) > vw || Math.abs(l.y - camY) > vh) return;
      const p = sc(l.x, l.y + Math.sin(t * 1.6 + l.ph) * 3), r = 11 * z;
      if (l.k === 'gem'){ const k = 0.5 + 0.5 * Math.sin(t * 5 + l.ph); ctx.strokeStyle = 'rgba(255,255,255,' + (0.4 + k * 0.5).toFixed(2) + ')'; ctx.lineWidth = z * 1.4; ctx.beginPath(); ctx.moveTo(p.x - r * 1.5, p.y - r * 0.2); ctx.lineTo(p.x + r * 1.5, p.y - r * 0.2); ctx.moveTo(p.x, p.y - r * 1.6); ctx.lineTo(p.x, p.y + r * 1.2); ctx.stroke(); }
      else { for (let q = 1; q < 5; q++) line(ctx, 'rgba(0,0,0,.25)', z, p.x - r * 0.9 + q * r * 0.36, p.y - r * 0.9, p.x - r * 0.9 + q * r * 0.36, p.y + r * 0.9); ctx.strokeStyle = '#C9A24A'; ctx.lineWidth = 1.6 * z; ctx.beginPath(); ctx.arc(p.x, p.y, r * 0.96, 0, TAU); ctx.stroke(); ctx.strokeStyle = 'rgba(255,255,255,.25)'; ctx.lineWidth = z; ctx.beginPath(); ctx.arc(p.x, p.y, r * 0.8, 3.6, 5); ctx.stroke(); }
      ctx.strokeStyle = 'rgba(255,255,255,.3)'; ctx.lineWidth = z; ctx.beginPath(); ctx.arc(p.x, p.y + 3 * z, r * (1.2 + 0.15 * Math.sin(t * 2 + l.ph)), 0.2, 2.9); ctx.stroke();
    });
    Sea.shoals.forEach(function(s){
      if (s.got || Math.abs(s.x - camX) > vw || Math.abs(s.y - camY) > vh) return;
      const p0 = sc(s.x, s.y); ctx.strokeStyle = 'rgba(255,255,255,' + (0.18 + 0.12 * Math.sin(t * 2 + s.ph)).toFixed(2) + ')'; ctx.lineWidth = 1.2 * z; ctx.beginPath(); ctx.arc(p0.x, p0.y, (30 + 4 * Math.sin(t + s.ph)) * z, 0, TAU); ctx.stroke();
      for (let k = 0; k < 7; k++){ const a = t * 0.8 + k * 0.9 + s.ph, rr = 14 + (k % 3) * 8, p = sc(s.x + Math.cos(a) * rr, s.y + Math.sin(a) * rr * 0.7); ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(a + Math.PI / 2);
        ctx.fillStyle = 'rgba(20,50,80,.5)'; ctx.beginPath(); ctx.moveTo(0, 8 * z); ctx.lineTo(-2.6 * z, 12 * z); ctx.lineTo(2.6 * z, 12 * z); ctx.closePath(); ctx.fill(); ctx.fillStyle = 'rgba(200,230,255,.5)'; ctx.fillRect(-1 * z, -4 * z, 1.4 * z, 4 * z); ctx.restore(); }
    });
  };

  /* ---------- the boats ---------- */
  const BOW = { skiff: 34, launch: 40, trawler: 48, speedboat: 46 };
  const _boat = seaDrawBoat;
  seaDrawBoat = function(ctx, x, y, ang, kind, t, scale, wob){
    const s = scale || 1, bow = BOW[kind] || 34, moving = Sea.on && Math.abs(Sea.v) > 15, sp = Math.min(1, Math.abs(Sea.v) / 160);
    ctx.save(); ctx.translate(x, y); ctx.rotate(ang + (wob || 0)); ctx.scale(s, s);
    ctx.strokeStyle = 'rgba(255,255,255,.14)'; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.ellipse(2, 0, bow + 6 + Math.sin(t * 2) * 1.2, 22 + (kind === 'trawler' ? 6 : 0) + Math.sin(t * 2.2) * 1, 0, 0, TAU); ctx.stroke();
    ctx.restore();
    _boat.apply(this, arguments);
    ctx.save(); ctx.translate(x, y); ctx.rotate(ang + (wob || 0)); ctx.scale(s, s);
    switch (kind){
      case 'launch':
        ctx.strokeStyle = 'rgba(0,0,0,.18)'; ctx.lineWidth = 1; for (let k = -12; k <= 12; k += 6){ ctx.beginPath(); ctx.moveTo(8, k); ctx.lineTo(34, k * 0.6); ctx.stroke(); }
        ctx.fillStyle = '#7AB8D8'; ctx.fillRect(-24, -11, 3, 5); ctx.fillRect(-24, 6, 3, 5); ctx.fillStyle = 'rgba(255,255,255,.5)'; ctx.fillRect(-26, -9, 8, 1.6);
        disc(ctx, '#9AA0AA', -12, 0, 3.6); ctx.strokeStyle = '#6A6F78'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(-12, 0); ctx.lineTo(-6, -4); ctx.stroke();
        for (let k = 0; k < 6; k++){ disc(ctx, '#C9CDD9', 12 + k * 4, -15 + k * 0.8, 1); disc(ctx, '#C9CDD9', 12 + k * 4, 15 - k * 0.8, 1); }
        disc(ctx, '#FF6A5A', 30, -6, 1.8); disc(ctx, '#6BE08A', 30, 6, 1.8); ctx.strokeStyle = '#F2A23C'; ctx.lineWidth = 2.4; ctx.beginPath(); ctx.arc(-30, 12, 3.4, 0, TAU); ctx.stroke();
        ctx.strokeStyle = '#2F5F94'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.rect(-26, -10, 28, 20); ctx.stroke(); break;
      case 'trawler':
        ctx.strokeStyle = 'rgba(0,0,0,.22)'; ctx.lineWidth = 1; for (let k = -16; k <= 16; k += 8){ ctx.beginPath(); ctx.moveTo(8, k); ctx.lineTo(40, k * 0.5); ctx.stroke(); }
        ctx.fillStyle = '#4A5A68'; ctx.fillRect(14, -9, 10, 7); ctx.fillRect(14, 2, 10, 7); ctx.strokeStyle = '#2A3440'; ctx.lineWidth = 1; ctx.strokeRect(14, -9, 10, 7); ctx.strokeRect(14, 2, 10, 7);
        disc(ctx, '#7A7F8A', -34, 0, 8); ctx.strokeStyle = '#3A3A44'; ctx.lineWidth = 1.2; for (let k = 0; k < 8; k++){ ctx.beginPath(); ctx.moveTo(-34, 0); ctx.lineTo(-34 + Math.cos(k * 0.785) * 8, Math.sin(k * 0.785) * 8); ctx.stroke(); } ctx.strokeStyle = '#E8C24A'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.arc(-34, 0, 5, 0, 4.4); ctx.stroke();
        ctx.fillStyle = '#7AB8D8'; ctx.fillRect(-18, -12, 3, 4); ctx.fillRect(-18, 8, 3, 4); ctx.fillRect(2, -12, 3, 4); ctx.fillRect(2, 8, 3, 4);
        ctx.strokeStyle = '#E8C24A'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-8, -15); ctx.lineTo(-8, -26); ctx.lineTo(-30, -26); ctx.stroke(); disc(ctx, '#3A3A44', -30, -26, 2);
        for (let k = 0; k < 8; k++){ disc(ctx, '#C9CDD9', -36 + k * 10, -20 + Math.abs(k - 3.5) * 0.5, 1); disc(ctx, '#C9CDD9', -36 + k * 10, 20 - Math.abs(k - 3.5) * 0.5, 1); }
        disc(ctx, '#FFE49A', 40, 0, 2); ctx.fillStyle = 'rgba(150,70,20,.3)'; ctx.fillRect(-6, 16, 10, 2); ctx.fillRect(20, -19, 8, 2); break;
      case 'speedboat':
        ctx.fillStyle = 'rgba(160,220,255,.7)'; ctx.beginPath(); ctx.moveTo(14, -9); ctx.lineTo(22, -6); ctx.lineTo(22, 6); ctx.lineTo(14, 9); ctx.closePath(); ctx.fill(); ctx.strokeStyle = '#2A2A34'; ctx.lineWidth = 1.2; ctx.stroke(); ctx.fillStyle = 'rgba(255,255,255,.5)'; ctx.fillRect(16, -6, 2, 5);
        ctx.fillStyle = '#1F3F5A'; ctx.fillRect(-24, -9, 8, 6); ctx.fillRect(-24, 3, 8, 6); ctx.fillRect(-12, -9, 8, 6); ctx.fillRect(-12, 3, 8, 6);
        ctx.fillStyle = '#2A2A34'; ctx.fillRect(-36, -5, 7, 10); ctx.strokeStyle = '#6A6F78'; ctx.lineWidth = 1; for (let k = -3; k <= 3; k += 2){ ctx.beginPath(); ctx.moveTo(-35, k); ctx.lineTo(-30, k); ctx.stroke(); }
        ctx.fillStyle = '#F4F1E8'; ctx.font = 'bold 8px system-ui,sans-serif'; ctx.textAlign = 'center'; ctx.fillText('7', 32, 3); disc(ctx, '#FF6A5A', 38, -3, 1.2); disc(ctx, '#6BE08A', 38, 3, 1.2); break;
      default:
        ctx.strokeStyle = 'rgba(70,40,15,.45)'; ctx.lineWidth = 1; for (let k = -8; k <= 8; k += 4){ ctx.beginPath(); ctx.moveTo(-22, k * 1.1); ctx.lineTo(Math.min(24, 30 - Math.abs(k) * 1.6), k * 0.8); ctx.stroke(); }
        ctx.strokeStyle = '#6A4A28'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(34, 0); ctx.quadraticCurveTo(22, -14, -6, -14); ctx.lineTo(-26, -11); ctx.lineTo(-26, 11); ctx.lineTo(-6, 14); ctx.quadraticCurveTo(22, 14, 34, 0); ctx.stroke();
        ctx.strokeStyle = '#D5352B'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(30, -2); ctx.quadraticCurveTo(22, -11, -4, -11.4); ctx.moveTo(30, 2); ctx.quadraticCurveTo(22, 11, -4, 11.4); ctx.stroke();
        disc(ctx, '#2E2A26', -8, -11, 1.6); disc(ctx, '#2E2A26', -8, 11, 1.6); ctx.fillStyle = '#6A4A28'; ctx.fillRect(28, -1, 4, 2); disc(ctx, '#FFE49A', -26, 0, 1.8);
        ctx.strokeStyle = '#B79C6A'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.arc(26, 5, 3, 0, TAU); ctx.stroke();
        { const sw = Math.sin(t * 4) * 3; ctx.fillStyle = '#8A5A32'; ctx.beginPath(); ctx.ellipse(-24, -26 + sw, 2.4, 5, 0.6, 0, TAU); ctx.fill(); ctx.beginPath(); ctx.ellipse(-24, 26 - sw, 2.4, 5, -0.6, 0, TAU); ctx.fill(); }
    }
    seaDrawRider(ctx, t);
    if (moving){
      const a = 0.25 + sp * 0.4; ctx.strokeStyle = 'rgba(255,255,255,' + a.toFixed(2) + ')'; ctx.lineWidth = 2.2; ctx.lineCap = 'round';
      [-1, 1].forEach(function(sd){ ctx.beginPath(); ctx.moveTo(bow - 2, sd * 2); ctx.quadraticCurveTo(bow - 12, sd * 6, bow - 24 - sp * 10, sd * (14 + sp * 4)); ctx.stroke(); });
      ctx.fillStyle = 'rgba(255,255,255,' + (0.5 * sp).toFixed(2) + ')'; for (let k = 0; k < 5; k++) ctx.fillRect(bow - 6 - k * 3, (k % 2 ? 1 : -1) * (4 + k * 2), 1.8, 1.8);
    }
    ctx.restore();
  };
})();
