'use strict';
/* Longneck Town, thirteenth part: the tram ride, seen from a seat by the window. */
/* ========================= 44zp. THE TRAM RIDE ========================= */
/* Replaces townDrawRide (44zc). The picture is the inside of a carriage: a ceiling with lamps and the route map (the stops lit up as the
   tram passes them), a brass rail with swinging straps, a window with a frame and a sill, and a bench with buttoned upholstery where she
   sits between two other passengers. Through the window the world slides by in four layers (sky and sun or moon, far hills, a skyline of
   houses with lit windows, and poles, trees and a fence flashing past) in the colors of the street she left, shifting to the colors of
   the one she is going to. Rain runs on the glass when it is raining. The ride lasts a little longer than it did (3.4 s). */
(function(){
  const tr = townRide;
  townRide = function(toId){
    tr(toId);
    if (Town.ride) Town.ride.dur = 3.4;
    if (Town.ride){ Town.ride.seed = (Math.random() * 1000) | 0; Town.ride.fromId = Town.d; }
  };
})();
function ivRideCol(a, b, k){ return blendHex(a, b, k); }
function townDrawRide(ctx){
  const R = Town.ride, W = G.W, H = G.H, k = clamp(R.t / R.dur, 0, 1), h = townHour(), sky = townSkyAt(h), dark = townDark(h);
  const from = TOWN_PAL[(TOWN_DIST[R.fromId] || {}).theme] || TOWN_PAL.square, to = TOWN_PAL[(TOWN_DIST[R.to] || {}).theme] || TOWN_PAL.square;
  const mixK = clamp((k - 0.35) / 0.4, 0, 1), pal = {
    far: ivRideCol(from.far, to.far, mixK), mid: ivRideCol(from.mid, to.mid, mixK), ground: ivRideCol(from.ground, to.ground, mixK),
    wall: ivRideCol(from.walls[0], to.walls[0], mixK), wall2: ivRideCol(from.walls[1] || from.walls[0], to.walls[1] || to.walls[0], mixK), roof: ivRideCol(from.roofs[0], to.roofs[0], mixK)
  };
  const speed = 360 + 1100 * Math.sin(k * Math.PI), off = R.t * (200 + speed * 0.5) + (R.seed || 0) * 40;
  const s = Math.min(W / 800, H / 450), sw = Math.sin(R.t * 3.1) * 1.4, jit = Math.sin(R.t * 31) * 0.8 * (speed / 1000);
  /* the window: where the world shows */
  const wx = W * 0.14, wy = H * 0.2, ww = W * 0.72, wh = H * 0.46;
  ctx.fillStyle = '#2A3A32'; ctx.fillRect(0, 0, W, H);
  ctx.save();
  ctx.beginPath(); ctx.rect(wx, wy, ww, wh); ctx.clip();
  const g = ctx.createLinearGradient(0, wy, 0, wy + wh); g.addColorStop(0, sky.top); g.addColorStop(1, sky.bot); ctx.fillStyle = g; ctx.fillRect(wx, wy, ww, wh);
  if (dark > 0.4){ ctx.fillStyle = '#FFF'; for (let i = 0; i < 40; i++){ ctx.globalAlpha = 0.4 + 0.6 * ((i * 37) % 10) / 10; ctx.fillRect(wx + ((i * 97) % 1000) / 1000 * ww, wy + ((i * 53) % 700) / 1000 * wh, 1.6, 1.6); } ctx.globalAlpha = 1; }
  const sunX = wx + ww * (0.15 + 0.7 * ((h % 24) / 24)), sunY = wy + wh * 0.3;
  tCircle(ctx, dark > 0.5 ? '#EEF2FF' : '#FFE9A0', sunX, sunY, 18 * s);
  for (let i = 0; i < 4; i++){ const cx = wx + (((i * 330 - off * 0.04) % (ww + 260)) + ww + 260) % (ww + 260) - 130, cy = wy + wh * (0.12 + (i % 3) * 0.1); ctx.fillStyle = 'rgba(255,255,255,' + (0.5 - dark * 0.3).toFixed(2) + ')'; ctx.beginPath(); ctx.ellipse(cx, cy, 60 * s, 12 * s, 0, 0, TAU); ctx.ellipse(cx + 34 * s, cy - 6 * s, 36 * s, 10 * s, 0, 0, TAU); ctx.fill(); }
  const base = wy + wh * 0.8;
  /* far hills */
  ctx.fillStyle = pal.far; ctx.beginPath(); ctx.moveTo(wx, base);
  for (let x = 0; x <= ww + 20; x += 20){ const wxw = x + off * 0.08; ctx.lineTo(wx + x, base - wh * 0.22 - Math.abs(Math.sin(wxw * 0.006)) * wh * 0.14 - Math.sin(wxw * 0.02) * 6); }
  ctx.lineTo(wx + ww, base); ctx.closePath(); ctx.fill();
  /* the skyline: houses with roofs and lit windows, some trees */
  const step = 110 * s;
  for (let layer = 0; layer < 2; layer++){
    const par = layer ? 0.5 : 0.28, o = (off * par) % (step * 1.0), bY = base + layer * 8 * s;
    for (let i = -2, x = -o - step; x < ww + step; i++, x += step){
      const idx = Math.floor((x + off * par) / step), r = ((idx * 9301 + layer * 4929) % 233280) / 233280, bh = (40 + r * 90 + layer * 20) * s, bw = (70 + r * 30) * s;
      const kind = r > 0.8 ? 2 : r > 0.55 ? 1 : 0, cx = wx + x;
      if (kind === 2){ ctx.fillStyle = pal.mid; ctx.beginPath(); ctx.arc(cx + bw / 2, bY - 22 * s, 24 * s, 0, TAU); ctx.fill(); ctx.fillRect(cx + bw / 2 - 3 * s, bY - 24 * s, 6 * s, 24 * s); continue; }
      ctx.fillStyle = layer ? pal.wall2 : pal.wall; ctx.fillRect(cx, bY - bh, bw, bh);
      ctx.fillStyle = 'rgba(0,0,0,' + (0.16 + layer * 0.08 + dark * 0.2).toFixed(2) + ')'; ctx.fillRect(cx, bY - bh, bw, bh);
      ctx.fillStyle = pal.roof; ctx.beginPath(); ctx.moveTo(cx - 6 * s, bY - bh); ctx.lineTo(cx + bw / 2, bY - bh - (kind ? 34 : 18) * s); ctx.lineTo(cx + bw + 6 * s, bY - bh); ctx.closePath(); ctx.fill();
      for (let wy2 = bY - bh + 10 * s; wy2 < bY - 18 * s; wy2 += 22 * s) for (let wx2 = cx + 10 * s; wx2 < cx + bw - 14 * s; wx2 += 20 * s){
        const lit = ((idx * 31 + Math.floor(wy2) + Math.floor(wx2)) % 7) < 3;
        ctx.fillStyle = dark > 0.3 && lit ? '#FFD870' : 'rgba(200,225,240,.7)'; ctx.fillRect(wx2, wy2, 9 * s, 11 * s);
      }
    }
  }
  /* the ground and the track, with sleepers going by */
  ctx.fillStyle = pal.ground; ctx.fillRect(wx, base, ww, wy + wh - base);
  ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.fillRect(wx, base + 10 * s, ww, 6 * s);
  const sp = 46 * s, so = (off * 1.2) % sp;
  ctx.fillStyle = 'rgba(40,28,18,.7)'; for (let x = -so; x < ww + sp; x += sp) ctx.fillRect(wx + x, base + 22 * s, 24 * s, 7 * s);
  /* near things: poles, trees and a fence flashing past, blurred by speed */
  const near = off * 1.9, nstep = 230 * s, no = near % nstep;
  for (let x = -no - nstep; x < ww + nstep; x += nstep){
    const idx = Math.floor((x + near) / nstep), r = ((idx * 7919) % 1000) / 1000, bl = clamp(speed / 1500, 0, 0.9), cx = wx + x, gy = base + 6 * s;
    ctx.globalAlpha = 1 - bl * 0.35;
    if (r < 0.45){ ctx.fillStyle = '#4A3A2A'; ctx.fillRect(cx, gy - 120 * s, 6 * s, 120 * s); ctx.fillRect(cx - 14 * s, gy - 112 * s, 34 * s, 4 * s); ctx.strokeStyle = 'rgba(30,30,40,.7)'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(cx - 14 * s, gy - 110 * s); ctx.lineTo(cx - 280 * s, gy - 100 * s); ctx.stroke(); }
    else if (r < 0.75){ ctx.fillStyle = '#5A3B22'; ctx.fillRect(cx, gy - 60 * s, 8 * s, 60 * s); ctx.fillStyle = '#3E7A3A'; ctx.beginPath(); ctx.arc(cx + 4 * s, gy - 78 * s, 32 * s, 0, TAU); ctx.fill(); ctx.fillStyle = '#4C8A44'; ctx.beginPath(); ctx.arc(cx - 6 * s, gy - 88 * s, 20 * s, 0, TAU); ctx.fill(); }
    else { ctx.fillStyle = '#8A6642'; for (let q = 0; q < 5; q++) ctx.fillRect(cx + q * 26 * s, gy - 34 * s, 5 * s, 34 * s); ctx.fillRect(cx, gy - 26 * s, 120 * s, 4 * s); ctx.fillRect(cx, gy - 14 * s, 120 * s, 4 * s); }
    ctx.globalAlpha = 1;
  }
  /* speed lines when it is going fast */
  if (speed > 900){ ctx.strokeStyle = 'rgba(255,255,255,.14)'; ctx.lineWidth = 1.4; for (let i = 0; i < 9; i++){ const y = wy + wh * (0.55 + 0.4 * ((i * 37) % 10) / 10), xx = ((i * 137 - off * 3) % (ww + 200) + ww + 200) % (ww + 200); ctx.beginPath(); ctx.moveTo(wx + xx, y); ctx.lineTo(wx + xx - 80 * s, y); ctx.stroke(); } }
  /* rain on the glass, and a slanting glare */
  if (Town.rainK > 0.3){ ctx.strokeStyle = 'rgba(210,230,255,.55)'; ctx.lineWidth = 1.6; for (let i = 0; i < 24; i++){ const rx = wx + ((i * 71 + R.t * 40) % 1000) / 1000 * ww, ry = wy + ((i * 113 + R.t * 220 * (0.6 + (i % 3) * 0.3)) % 1000) / 1000 * wh; ctx.beginPath(); ctx.moveTo(rx, ry); ctx.lineTo(rx - 6, ry + 14); ctx.stroke(); } }
  const gx = wx + ((R.t * 90) % (ww + 200)) - 100; ctx.fillStyle = 'rgba(255,255,255,.07)'; ctx.beginPath(); ctx.moveTo(gx, wy); ctx.lineTo(gx + 50 * s, wy); ctx.lineTo(gx - 40 * s, wy + wh); ctx.lineTo(gx - 90 * s, wy + wh); ctx.closePath(); ctx.fill();
  ctx.restore();
  /* the window frame, the sill and the pillars either side */
  const fr = Math.max(8, 10 * s);
  ctx.fillStyle = '#1E3A2C'; ctx.fillRect(wx - fr, wy - fr, ww + fr * 2, fr); ctx.fillRect(wx - fr, wy + wh, ww + fr * 2, fr); ctx.fillRect(wx - fr, wy - fr, fr, wh + fr * 2); ctx.fillRect(wx + ww, wy - fr, fr, wh + fr * 2);
  ctx.fillStyle = '#C9CDD9'; ctx.fillRect(wx - 2, wy - 2, ww + 4, 2); ctx.fillRect(wx - 2, wy + wh, ww + 4, 2); ctx.fillRect(wx - 2, wy, 2, wh); ctx.fillRect(wx + ww, wy, 2, wh);
  ctx.fillStyle = '#2A2A30'; ctx.fillRect(wx + ww * 0.5 - 2, wy, 4, wh * 0.2);                       /* the sash bar */
  ctx.fillStyle = '#DCD0A8'; ctx.fillRect(wx - fr * 1.6, wy + wh + fr, ww + fr * 3.2, 7 * s);          /* the sill */
  tRound(ctx, '#B5603A', wx + ww * 0.78, wy + wh + fr - 18 * s, 22 * s, 18 * s, 4); ctx.strokeStyle = '#3E8A3A'; ctx.lineWidth = 3; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(wx + ww * 0.78 + 11 * s, wy + wh + fr - 18 * s); ctx.lineTo(wx + ww * 0.78 + 5 * s, wy + wh + fr - 38 * s); ctx.moveTo(wx + ww * 0.78 + 11 * s, wy + wh + fr - 18 * s); ctx.lineTo(wx + ww * 0.78 + 20 * s, wy + wh + fr - 36 * s); ctx.stroke();
  /* walls either side: panelling, a poster each */
  ctx.fillStyle = '#E8DCB8'; ctx.fillRect(0, 0, wx - fr, H * 0.74); ctx.fillRect(wx + ww + fr, 0, W - (wx + ww + fr), H * 0.74);
  ctx.fillStyle = 'rgba(0,0,0,.06)'; for (let x = 0; x < wx - fr; x += 24 * s) ctx.fillRect(x, 0, 2, H * 0.74); for (let x = wx + ww + fr; x < W; x += 24 * s) ctx.fillRect(x, 0, 2, H * 0.74);
  ctx.fillStyle = '#4A6A58'; ctx.fillRect(0, H * 0.5, wx - fr, H * 0.24); ctx.fillRect(wx + ww + fr, H * 0.5, W - (wx + ww + fr), H * 0.24);
  const pw = Math.min(wx - fr - 16, 90 * s);
  if (pw > 30){
    [[8, '#D5352B', 'KEEP', 'CALM'], [W - pw - 8, '#4DA0D8', 'MIND', 'THE GAP']].forEach(function(p){ ctx.fillStyle = '#FFF6E0'; ctx.fillRect(p[0], H * 0.24, pw, H * 0.2); ctx.fillStyle = p[1]; ctx.fillRect(p[0] + 6, H * 0.24 + 6, pw - 12, H * 0.2 - 12); ctx.fillStyle = '#FFF6E0'; ctx.font = '800 ' + Math.max(9, Math.round(11 * s)) + 'px system-ui'; ctx.textAlign = 'center'; ctx.fillText(p[2], p[0] + pw / 2, H * 0.33); ctx.fillText(p[3], p[0] + pw / 2, H * 0.33 + 14 * s); });
  }
  /* the ceiling, its lamps and the route map */
  ctx.fillStyle = '#F1E6C8'; ctx.fillRect(0, 0, W, H * 0.12); ctx.fillStyle = '#2F5A44'; ctx.fillRect(0, H * 0.12, W, H * 0.015);
  for (let i = 0; i < 4; i++){ const lx = W * (0.14 + i * 0.24); ctx.fillStyle = Math.sin(R.t * 40 + i * 3) > 0.95 ? '#FFF6C0' : '#FFEFA0'; ctx.fillRect(lx - 24 * s, H * 0.012, 48 * s, 7 * s); const lg = ctx.createRadialGradient(lx, H * 0.02, 2, lx, H * 0.02, 70 * s); lg.addColorStop(0, 'rgba(255,240,170,.35)'); lg.addColorStop(1, 'rgba(255,240,170,0)'); ctx.fillStyle = lg; ctx.fillRect(lx - 70 * s, 0, 140 * s, 90 * s); }
  const stops = TOWN_ORDER.filter(townOpen), i0 = Math.max(0, stops.indexOf(R.fromId)), i1 = Math.max(0, stops.indexOf(R.to)), mx0 = W * 0.2, mx1 = W * 0.8, my = H * 0.092;
  if (stops.length > 1){
    ctx.strokeStyle = '#2F5A44'; ctx.lineWidth = 4 * s; ctx.beginPath(); ctx.moveTo(mx0, my); ctx.lineTo(mx1, my); ctx.stroke();
    const pos = function(i){ return mx0 + (mx1 - mx0) * i / (stops.length - 1); };
    stops.forEach(function(id, i){
      const lit = i === i1 ? 1 : (i >= Math.min(i0, i1) && i <= Math.max(i0, i1)) ? 0.5 : 0, x = pos(i);
      tCircle(ctx, lit === 1 ? '#FFD84D' : lit ? '#9BE04A' : '#FFF6E0', x, my, 6 * s); ctx.strokeStyle = '#2F5A44'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(x, my, 6 * s, 0, TAU); ctx.stroke();
    });
    const px = lerp(pos(i0), pos(i1), k); tCircle(ctx, '#D5352B', px, my, 4.4 * s);
  }
  /* the brass rail, and straps that swing with the track */
  ctx.strokeStyle = '#C9A24A'; ctx.lineWidth = 4 * s; ctx.beginPath(); ctx.moveTo(0, H * 0.155); ctx.lineTo(W, H * 0.155); ctx.stroke();
  for (let i = 0; i < 6; i++){
    const x = W * (0.1 + i * 0.16), sg = Math.sin(R.t * 3.4 + i * 0.9) * 7 * (0.4 + speed / 1500) * s;
    ctx.strokeStyle = '#1E1E24'; ctx.lineWidth = 3 * s; ctx.beginPath(); ctx.moveTo(x, H * 0.155); ctx.lineTo(x + sg, H * 0.155 + 28 * s); ctx.stroke();
    ctx.strokeStyle = '#C9A24A'; ctx.lineWidth = 3 * s; ctx.beginPath(); ctx.arc(x + sg * 1.2, H * 0.155 + 36 * s, 8 * s, 0, TAU); ctx.stroke();
  }
  /* the bench: a wooden rail, buttoned red upholstery, the floor; the passengers and her */
  ctx.save(); ctx.translate(0, sw + jit);
  ctx.fillStyle = '#5A3B22'; ctx.fillRect(0, H * 0.74, W, H * 0.03);
  ctx.fillStyle = '#7A2A2E'; ctx.fillRect(0, H * 0.77, W, H * 0.2);
  ctx.fillStyle = '#5E1E22'; for (let x = 0; x < W; x += 40 * s) for (let y = H * 0.8; y < H * 0.95; y += 30 * s){ ctx.beginPath(); ctx.arc(x + 20 * s, y, 2.6 * s, 0, TAU); ctx.fill(); }
  ctx.fillStyle = 'rgba(255,255,255,.08)'; ctx.fillRect(0, H * 0.77, W, 5);
  ctx.fillStyle = '#2A2018'; ctx.fillRect(0, H * 0.96, W, H * 0.04);
  const gs = Math.min(2.2, H / 330);
  const looks = (typeof TOWN_WALK_LOOKS !== 'undefined' && TOWN_WALK_LOOKS.length) ? TOWN_WALK_LOOKS : [['#E8C070', '#8A5A24'], ['#9AD0E8', '#2F6B9A'], ['#F2A08A', '#B04A32']];
  [[0.2, 0], [0.8, 1]].forEach(function(p, i){
    const lk = looks[(((R.seed || 0) + i * 3) % looks.length + looks.length) % looks.length];
    townGiraffe(ctx, W * p[0], H * 0.96 + Math.sin(R.t * 14 + i * 2) * 1.2, { s: gs * 0.92, sit: true, flip: i === 1, reach: 0.1 + 0.05 * Math.sin(R.t + i), look: { coat: lk[0], spot: lk[1], pat: 0, hat: i ? 'beanie' : '', s: 1 }, t: Town.t, seed: i + 4 });
  });
  const bob = Math.sin(R.t * 17) * 1.4 + (speed / 1500) * Math.sin(R.t * 31);
  townGiraffe(ctx, W * 0.5, H * 0.97 + bob, { s: gs, sit: true, flip: false, reach: 0.12 + 0.04 * Math.sin(R.t * 2), t: Town.t, ph: 0 });
  ctx.restore();
  /* the stop announcement */
  const arriving = k > 0.78;
  miniText(ctx, arriving ? 'Arriving: ' + TOWN_DIST[R.to].name : 'Next stop: ' + TOWN_DIST[R.to].name, W / 2, H * 0.715, Math.min(22, W / 18), '#FFF6E0');
  miniText(ctx, 'from ' + R.from, W / 2, H * 0.715 + 17, 12, '#C9B890', 'center', false);
  ctx.fillStyle = 'rgba(8,6,5,' + (k > 0.88 ? (k - 0.88) / 0.12 : k < 0.1 ? 1 - k / 0.1 : 0).toFixed(2) + ')'; ctx.fillRect(0, 0, W, H);
}
