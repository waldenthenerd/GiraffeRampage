'use strict';
/* The look of the minigames for Chapters 1-6. The rules live in 44g-minigames-a.js; each draw() here sets m.focus (where she is on
   the screen, for the paper bag) and paints a pre-rendered backdrop plus the moving parts. Helpers (miniBg, miniGlow, miniShadow,
   miniBurst...) are in 44f-minigames.js. */
/* ========================= 44i. MINIGAME ART 1-6 ========================= */
function artBlade(c, x, y, h, w, col){ c.strokeStyle = col; c.lineWidth = w; c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + w * 1.5, y - h * 0.6, x + w * 2.4, y - h); c.stroke(); }
function artCanopy(c, x, y, r, R, dark, mid, light){                 /* a round treetop seen from above, with its shadow */
  c.fillStyle = 'rgba(30,20,6,.28)'; c.beginPath(); c.ellipse(x + r * 0.35, y + r * 0.45, r * 1.05, r * 0.8, 0, 0, TAU); c.fill();
  for (let k = 0; k < 9; k++){ const a = k * TAU / 9 + R(), d = r * 0.55 * R(); c.fillStyle = dark; c.beginPath(); c.arc(x + Math.cos(a) * d, y + Math.sin(a) * d, r * (0.55 + R() * 0.25), 0, TAU); c.fill(); }
  for (let k = 0; k < 8; k++){ const a = k * TAU / 8 + R(), d = r * 0.5 * R(); c.fillStyle = mid; c.beginPath(); c.arc(x + Math.cos(a) * d - r * 0.08, y + Math.sin(a) * d - r * 0.1, r * (0.35 + R() * 0.2), 0, TAU); c.fill(); }
  for (let k = 0; k < 6; k++){ const a = R() * TAU, d = r * 0.4 * R(); c.fillStyle = light; c.beginPath(); c.arc(x + Math.cos(a) * d - r * 0.18, y + Math.sin(a) * d - r * 0.22, r * (0.14 + R() * 0.12), 0, TAU); c.fill(); }
}

/* ---- 1. Watering Hole Dash ---- */
function artWaterBg(c, W, H, s, R){
  const gr = c.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, '#B8AC60'); gr.addColorStop(0.5, '#CDBB6C'); gr.addColorStop(1, '#B3A058'); c.fillStyle = gr; c.fillRect(0, 0, W, H);
  for (let i = 0; i < 90; i++){ c.fillStyle = R() < 0.5 ? 'rgba(150,120,60,.14)' : 'rgba(235,215,140,.16)'; c.beginPath(); c.ellipse(R() * W, R() * H, (30 + R() * 110) * s, (14 + R() * 50) * s, R() * 3, 0, TAU); c.fill(); }
  c.strokeStyle = 'rgba(140,108,62,.38)'; c.lineWidth = 46 * s; c.lineCap = 'round';                /* the track the herd walks to the water */
  c.beginPath(); c.moveTo(W * 0.2, H * 0.62); c.bezierCurveTo(W * 0.38, H * 0.48, W * 0.55, H * 0.7, W * 0.75, H * 0.45); c.stroke();
  c.strokeStyle = 'rgba(110,80,44,.25)'; c.lineWidth = 3; c.beginPath(); c.moveTo(W * 0.2, H * 0.62 - 20 * s); c.bezierCurveTo(W * 0.38, H * 0.48 - 20 * s, W * 0.55, H * 0.7 - 20 * s, W * 0.75, H * 0.45 - 20 * s); c.stroke();
  for (let i = 0; i < 70; i++){ c.fillStyle = 'rgba(95,70,40,' + (0.2 + R() * 0.25) + ')'; c.beginPath(); c.ellipse(R() * W, R() * H, (2 + R() * 5) * s, (1.5 + R() * 3) * s, R() * 3, 0, TAU); c.fill(); }
  const cols = ['#7E8C3A', '#9B9B46', '#6D7A31', '#B7A957', '#8E9440'];
  for (let i = 0; i < 230; i++){ const x = R() * W, y = R() * H, col = cols[(R() * cols.length) | 0]; for (let k = 0; k < 4; k++) artBlade(c, x + k * 2.4 * s, y, (7 + R() * 8) * s, 1.4, col); }
  const tr = [[0.06, 0.1, 54], [0.94, 0.12, 62], [0.5, 0.05, 40], [0.04, 0.9, 50], [0.96, 0.9, 58]];      /* acacias at the edges */
  tr.forEach(function(t){ artCanopy(c, W * t[0], H * t[1], t[2] * s, R, '#4F6B2E', '#628236', '#7FA145'); });
}
function artReeds(ctx, x, y, s, t, k){
  ctx.strokeStyle = '#4D6B2A'; ctx.lineWidth = 2.2; ctx.lineCap = 'round';
  for (let i = 0; i < 4; i++){ const sw = Math.sin(t * 1.6 + k + i) * 3 * s, h = (24 + i * 5) * s; ctx.beginPath(); ctx.moveTo(x + i * 3.5 * s, y); ctx.quadraticCurveTo(x + i * 3.5 * s + sw, y - h * 0.5, x + i * 3.5 * s + sw * 1.8 + 3 * s, y - h); ctx.stroke(); }
  ctx.fillStyle = '#6B4A22'; ctx.beginPath(); ctx.ellipse(x + 3.5 * s + Math.sin(t * 1.6 + k) * 5 * s, y - 31 * s, 2.4 * s, 6 * s, 0, 0, TAU); ctx.fill();
}
function artCalf(ctx, c, s, t){
  const x = c.x, y = c.y;
  miniShadow(ctx, x + 2 * s, y + 10 * s, 24 * s, 9 * s, 0.26);
  ctx.save(); ctx.translate(x, y); ctx.scale(s * 1.15, s * 1.15);
  ctx.fillStyle = '#8F6A32'; [[-9, -8], [-9, 8], [9, -8], [9, 8]].forEach(function(l, i){ ctx.beginPath(); ctx.ellipse(l[0] + Math.sin(t * 2 + i) * 0.8, l[1], 4.2, 2.6, 0, 0, TAU); ctx.fill(); });
  ctx.strokeStyle = '#7A5622'; ctx.lineWidth = 2.4; ctx.lineCap = 'round'; const tw = Math.sin(t * 5 + x) * 5;
  ctx.beginPath(); ctx.moveTo(16, 0); ctx.quadraticCurveTo(23, tw * 0.6, 27, tw); ctx.stroke();
  ctx.fillStyle = '#C79B4E'; ctx.beginPath(); ctx.ellipse(0, 0, 18, 11, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = '#E4BD72'; ctx.beginPath(); ctx.ellipse(-1, -2.5, 14, 6.5, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = '#8A5A24'; [[-6, -3, 3], [3, 2, 2.6], [8, -4, 2.2], [-1, 5, 2.2], [-11, 3, 2]].forEach(function(p){ ctx.beginPath(); ctx.ellipse(p[0], p[1], p[2], p[2] * 0.8, 0.4, 0, TAU); ctx.fill(); });
  ctx.fillStyle = '#D2A55A'; ctx.beginPath(); ctx.ellipse(-16, 0, 8, 5.5, 0, 0, TAU); ctx.fill();
  ctx.beginPath(); ctx.ellipse(-24, 0, 8.5, 6.2, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = '#E8C891'; ctx.beginPath(); ctx.ellipse(-30, 0, 4.6, 3.6, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = '#B88A44'; ctx.beginPath(); ctx.ellipse(-22, -7, 4, 2.2, -0.5, 0, TAU); ctx.ellipse(-22, 7, 4, 2.2, 0.5, 0, TAU); ctx.fill();
  ctx.fillStyle = '#20140C'; ctx.beginPath(); ctx.arc(-26, -3.4, 1.3, 0, TAU); ctx.arc(-26, 3.4, 1.3, 0, TAU); ctx.arc(-33, -1, 0.8, 0, TAU); ctx.arc(-33, 1, 0.8, 0, TAU); ctx.fill();
  ctx.restore();
}
function artHyena(ctx, h, tx, ty, s, t){
  const a = Math.atan2(ty - h.y, tx - h.x) + (h.flee > 0 ? Math.PI : 0), run = Math.sin(t * 14 + h.x * 0.05);
  miniShadow(ctx, h.x + 3, h.y + 11 * s, 26 * s, 8 * s, 0.26);
  ctx.save(); ctx.translate(h.x, h.y); ctx.rotate(a); ctx.scale(s * 1.1, s * 1.1);
  ctx.fillStyle = '#5E5042'; [[8, -9, run], [8, 9, -run], [-9, -9, -run], [-9, 9, run]].forEach(function(l){ ctx.beginPath(); ctx.ellipse(l[0] + l[2] * 4, l[1], 5, 2.6, 0, 0, TAU); ctx.fill(); });
  ctx.strokeStyle = '#3E3228'; ctx.lineWidth = 4; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-17, 0); ctx.quadraticCurveTo(-26, run * 6, -30, run * 9); ctx.stroke();
  ctx.fillStyle = '#85735E'; ctx.beginPath(); ctx.ellipse(0, 0, 20, 10.5, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = '#4A3C30'; ctx.beginPath(); ctx.moveTo(10, -7); for (let k = 0; k < 6; k++) ctx.lineTo(8 - k * 3.6, k % 2 ? -4 : -10); ctx.lineTo(-10, -4); ctx.lineTo(-10, 4); for (let k = 5; k >= 0; k--) ctx.lineTo(8 - k * 3.6, k % 2 ? 4 : 10); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#3A2E24'; [[-6, -3], [2, 3], [8, -2], [-12, 3]].forEach(function(p){ ctx.beginPath(); ctx.arc(p[0], p[1], 2.4, 0, TAU); ctx.fill(); });
  ctx.fillStyle = '#9A866E'; ctx.beginPath(); ctx.ellipse(20, 0, 8, 6.4, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = '#2E241B'; ctx.beginPath(); ctx.ellipse(27, 0, 4.4, 3.4, 0, 0, TAU); ctx.fill(); ctx.beginPath(); ctx.ellipse(16, -7, 3.4, 4.2, -0.4, 0, TAU); ctx.ellipse(16, 7, 3.4, 4.2, 0.4, 0, TAU); ctx.fill();
  ctx.fillStyle = h.flee > 0 ? '#F0E0B0' : '#FF5A3C'; ctx.beginPath(); ctx.arc(21, -3.6, 1.5, 0, TAU); ctx.arc(21, 3.6, 1.5, 0, TAU); ctx.fill();
  ctx.restore();
}
MINI[1].draw = function(ctx, m, g){
  const s = g.s, W = g.W, H = g.H, t = G.time, pd = m.pond, p = m.p;
  miniLayer(ctx, m, g, 'water', artWaterBg);
  /* the pond: a trampled mud rim, deep water in the middle, light on the surface, reeds and lilies round the edge */
  ctx.fillStyle = '#8A6A3E'; ctx.beginPath(); ctx.ellipse(pd.x, pd.y + 4, pd.rx + 16 * s, pd.ry + 14 * s, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = '#A07D4A'; ctx.beginPath(); ctx.ellipse(pd.x, pd.y + 2, pd.rx + 9 * s, pd.ry + 7 * s, 0, 0, TAU); ctx.fill();
  ctx.strokeStyle = 'rgba(70,48,22,.45)'; ctx.lineWidth = 1.4; ctx.beginPath();
  for (let k = 0; k < 18; k++){ const a = k * TAU / 18, r0 = 1.0 + 0.02 * Math.sin(k * 3); ctx.moveTo(pd.x + Math.cos(a) * (pd.rx + 2 * s) * r0, pd.y + Math.sin(a) * (pd.ry + 2 * s)); ctx.lineTo(pd.x + Math.cos(a + 0.06) * (pd.rx + 14 * s), pd.y + Math.sin(a + 0.06) * (pd.ry + 11 * s)); }
  ctx.stroke();
  const wg = ctx.createRadialGradient(pd.x - pd.rx * 0.2, pd.y - pd.ry * 0.25, 4, pd.x, pd.y, pd.rx);
  wg.addColorStop(0, '#7CC6EE'); wg.addColorStop(0.6, '#3F8CC4'); wg.addColorStop(1, '#27669A');
  ctx.fillStyle = wg; ctx.beginPath(); ctx.ellipse(pd.x, pd.y, pd.rx, pd.ry, 0, 0, TAU); ctx.fill();
  ctx.save(); ctx.beginPath(); ctx.ellipse(pd.x, pd.y, pd.rx, pd.ry, 0, 0, TAU); ctx.clip();
  ctx.strokeStyle = 'rgba(255,255,255,.5)'; ctx.lineWidth = 1.6;
  for (let k = 0; k < 4; k++){ const ph = (t * 0.45 + k * 0.25) % 1; ctx.globalAlpha = 1 - ph; ctx.beginPath(); ctx.ellipse(pd.x + Math.sin(k * 2) * pd.rx * 0.3, pd.y + Math.cos(k * 3) * pd.ry * 0.25, pd.rx * 0.9 * ph, pd.ry * 0.9 * ph, 0, 0, TAU); ctx.stroke(); }
  ctx.globalAlpha = 0.55; ctx.fillStyle = '#FFFFFF';
  for (let k = 0; k < 7; k++){ const sx = pd.x + Math.sin(t * 0.7 + k * 1.9) * pd.rx * 0.7, sy = pd.y + Math.cos(t * 0.5 + k * 2.3) * pd.ry * 0.6; ctx.fillRect(sx, sy, 5 * s, 1.6); }
  ctx.restore(); ctx.globalAlpha = 1;
  [[-0.95, -0.2], [-0.7, 0.8], [0.85, 0.6], [0.3, -0.95], [-0.2, 0.98]].forEach(function(q, i){ artReeds(ctx, pd.x + q[0] * (pd.rx + 6 * s), pd.y + q[1] * (pd.ry + 4 * s), s, t, i); });
  ctx.fillStyle = '#4F9A3A'; ctx.beginPath(); ctx.ellipse(pd.x + pd.rx * 0.45, pd.y + pd.ry * 0.4, 13 * s, 8 * s, 0.3, 0.3, TAU - 0.3); ctx.fill();
  ctx.fillStyle = '#F6A8C6'; ctx.beginPath(); ctx.arc(pd.x + pd.rx * 0.45, pd.y + pd.ry * 0.38, 4 * s, 0, TAU); ctx.fill();
  m.calves.forEach(function(c){ artCalf(ctx, c, s, t); });
  m.hy.forEach(function(h){ artHyena(ctx, h, p.x, p.y, s, t); });
  m.focus = { x: p.x, y: p.y };
  if (p.moving && Math.floor(t * 30) % 3 === 0) miniDust(m, p.x - Math.cos(p.ang) * 26 * s, p.y - Math.sin(p.ang) * 26 * s);
  drawTopGiraffe(ctx, p.x, p.y, p.ang, 0.9 * s, p.ph, { moving: p.moving, alpha: p.stun > 0 && Math.floor(t * 14) % 2 ? 0.5 : 1 });
  for (let k = 0; k < p.water; k++){
    const bx = p.x - 18 * s + k * 18 * s, by = p.y - 50 * s + Math.sin(t * 5 + k) * 1.5;
    ctx.fillStyle = '#4FA8EC'; ctx.beginPath(); ctx.moveTo(bx, by - 9 * s); ctx.quadraticCurveTo(bx + 7 * s, by + 1, bx, by + 6 * s); ctx.quadraticCurveTo(bx - 7 * s, by + 1, bx, by - 9 * s); ctx.fill();
    ctx.strokeStyle = '#FFFFFF'; ctx.lineWidth = 1.2; ctx.stroke();
  }
  if (p.fill > 0){ ctx.strokeStyle = 'rgba(190,235,255,.8)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(p.x, p.y, 22 * s + p.fill * 40 * s, 0, TAU); ctx.stroke(); }
  m.calves.forEach(function(c){
    if (c.need){
      const b = Math.sin(t * 5 + c.y) * 3 * s;
      ctx.fillStyle = 'rgba(255,255,255,.94)'; ctx.beginPath(); ctx.arc(c.x - 14 * s, c.y - 38 * s + b, 15 * s, 0, TAU); ctx.fill(); ctx.strokeStyle = '#B8C8D8'; ctx.lineWidth = 1.5; ctx.stroke();
      ctx.fillStyle = '#3F9BE0'; ctx.beginPath(); ctx.moveTo(c.x - 14 * s, c.y - 50 * s + b); ctx.quadraticCurveTo(c.x - 5 * s, c.y - 36 * s + b, c.x - 14 * s, c.y - 29 * s + b); ctx.quadraticCurveTo(c.x - 23 * s, c.y - 36 * s + b, c.x - 14 * s, c.y - 50 * s + b); ctx.fill();
    } else if (c.happy > 0) miniText(ctx, '♥', c.x - 14 * s, c.y - 30 * s - (1.2 - c.happy) * 14 * s, 22 * s, '#FF6A8A');
  });
  const lg = ctx.createLinearGradient(0, 0, W, H); lg.addColorStop(0, 'rgba(255,230,160,.16)'); lg.addColorStop(0.5, 'rgba(255,230,160,0)'); lg.addColorStop(1, 'rgba(60,30,10,.12)');
  ctx.fillStyle = lg; ctx.fillRect(0, 0, W, H);
};

/* ---- 2. Ice Slide ---- */
function artIceBg(c, W, H, s, R){
  const gr = c.createLinearGradient(0, 0, W, H); gr.addColorStop(0, '#D9F0FB'); gr.addColorStop(0.5, '#B7DDF2'); gr.addColorStop(1, '#8EC4E4'); c.fillStyle = gr; c.fillRect(0, 0, W, H);
  for (let i = 0; i < 40; i++){                                       /* plates of ice, slightly different in tint */
    const x = R() * W, y = R() * H, w = (60 + R() * 160) * s, h = (40 + R() * 110) * s, a = R() * 3;
    c.save(); c.translate(x, y); c.rotate(a); c.fillStyle = R() < 0.5 ? 'rgba(255,255,255,.14)' : 'rgba(40,110,170,.09)'; c.fillRect(-w / 2, -h / 2, w, h);
    c.strokeStyle = 'rgba(255,255,255,.35)'; c.lineWidth = 1; c.strokeRect(-w / 2, -h / 2, w, h); c.restore();
  }
  c.lineCap = 'round';
  for (let i = 0; i < 16; i++){                                       /* cracks, with branches */
    let x = R() * W, y = R() * H, a = R() * TAU;
    for (let seg = 0; seg < 9; seg++){
      const nx = x + Math.cos(a) * (26 + R() * 30) * s, ny = y + Math.sin(a) * (26 + R() * 30) * s;
      c.strokeStyle = 'rgba(255,255,255,.7)'; c.lineWidth = 1.4; c.beginPath(); c.moveTo(x, y); c.lineTo(nx, ny); c.stroke();
      c.strokeStyle = 'rgba(30,90,140,.35)'; c.lineWidth = 1; c.beginPath(); c.moveTo(x + 1, y + 1); c.lineTo(nx + 1, ny + 1); c.stroke();
      if (R() < 0.3){ const b = a + (R() < 0.5 ? 1 : -1) * (0.6 + R() * 0.6); c.strokeStyle = 'rgba(255,255,255,.5)'; c.beginPath(); c.moveTo(nx, ny); c.lineTo(nx + Math.cos(b) * 34 * s, ny + Math.sin(b) * 34 * s); c.stroke(); }
      x = nx; y = ny; a += (R() - 0.5) * 0.7;
    }
  }
  for (let i = 0; i < 160; i++){ c.fillStyle = 'rgba(255,255,255,' + (0.2 + R() * 0.4) + ')'; c.beginPath(); c.arc(R() * W, R() * H, (0.8 + R() * 1.6) * s, 0, TAU); c.fill(); }
  for (let k = 0; k < 4; k++){                                        /* drifts along the edges */
    for (let i = 0; i < 26; i++){
      const t = i / 26, x = k === 0 ? t * W : k === 1 ? W : k === 2 ? t * W : 0, y = k === 0 ? 0 : k === 1 ? t * H : k === 2 ? H : t * H;
      c.fillStyle = 'rgba(255,255,255,.92)'; c.beginPath(); c.ellipse(x, y, (28 + R() * 26) * s, (18 + R() * 16) * s, R() * 3, 0, TAU); c.fill();
      c.fillStyle = 'rgba(160,200,230,.5)'; c.beginPath(); c.ellipse(x + (k === 3 ? 6 : k === 1 ? -6 : 0), y + (k === 0 ? 8 : k === 2 ? -8 : 0), (20 + R() * 16) * s, (10 + R() * 8) * s, R() * 3, 0, TAU); c.fill();
    }
  }
}
MINI[2].draw = function(ctx, m, g){
  const s = g.s, W = g.W, H = g.H, t = G.time, p = m.p;
  miniLayer(ctx, m, g, 'ice', artIceBg);
  /* skid marks, drawn from where she has been */
  const tr = m.trail || (m.trail = []);
  if (!tr.length || Math.hypot(tr[tr.length - 1].x - p.x, tr[tr.length - 1].y - p.y) > 9) tr.push({ x: p.x, y: p.y, t: t });
  while (tr.length && t - tr[0].t > 2.2) tr.shift();
  ctx.lineCap = 'round';
  for (let i = 1; i < tr.length; i++){ const a = 1 - (t - tr[i].t) / 2.2; if (Math.hypot(tr[i].x - tr[i - 1].x, tr[i].y - tr[i - 1].y) > 90 * s) continue; ctx.strokeStyle = 'rgba(255,255,255,' + (a * 0.55) + ')'; ctx.lineWidth = 3.4 * s; ctx.beginPath(); ctx.moveTo(tr[i - 1].x, tr[i - 1].y); ctx.lineTo(tr[i].x, tr[i].y); ctx.stroke(); }
  m.holes.forEach(function(h){
    ctx.fillStyle = 'rgba(30,60,90,.22)'; ctx.beginPath(); ctx.arc(h.x + 3, h.y + 4, h.r + 7 * s, 0, TAU); ctx.fill();
    const wg = ctx.createRadialGradient(h.x, h.y, 2, h.x, h.y, h.r); wg.addColorStop(0, '#0C2A46'); wg.addColorStop(1, '#2E78AE');
    ctx.fillStyle = wg; ctx.beginPath(); ctx.arc(h.x, h.y, h.r, 0, TAU); ctx.fill();
    ctx.fillStyle = '#EAF6FF'; ctx.beginPath();                        /* a jagged rim of broken ice */
    for (let k = 0; k < 14; k++){ const a = k * TAU / 14, r1 = h.r + (k % 2 ? 4 : 11) * s; ctx.lineTo(h.x + Math.cos(a) * r1, h.y + Math.sin(a) * r1); }
    for (let k = 13; k >= 0; k--){ const a = k * TAU / 14; ctx.lineTo(h.x + Math.cos(a) * h.r, h.y + Math.sin(a) * h.r); }
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(190,235,255,' + (0.35 + 0.3 * Math.sin(t * 3 + h.x)) + ')'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(h.x, h.y, h.r * (0.35 + 0.35 * ((t * 0.6 + h.y * 0.01) % 1)), 0, TAU); ctx.stroke();
  });
  m.berries.forEach(function(b){
    miniShadow(ctx, b.x + 2, b.y + b.r * 1.1, b.r * 1.5, b.r * 0.5, 0.2);
    ctx.fillStyle = '#4E8A3A'; ctx.beginPath(); ctx.ellipse(b.x - b.r * 0.4, b.y - b.r * 0.9, b.r * 0.8, b.r * 0.4, -0.6, 0, TAU); ctx.ellipse(b.x + b.r * 0.5, b.y - b.r * 0.85, b.r * 0.7, b.r * 0.35, 0.6, 0, TAU); ctx.fill();
    [[-0.7, 0.1, 0.8], [0.7, 0.15, 0.78], [0, -0.35, 0.9]].forEach(function(q){
      const bx = b.x + q[0] * b.r, by = b.y + q[1] * b.r, br = b.r * q[2] * 0.85;
      const bg = ctx.createRadialGradient(bx - br * 0.3, by - br * 0.35, 1, bx, by, br); bg.addColorStop(0, '#FF8FA6'); bg.addColorStop(1, '#C42A4A');
      ctx.fillStyle = bg; ctx.beginPath(); ctx.arc(bx, by, br, 0, TAU); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,.75)'; ctx.beginPath(); ctx.arc(bx - br * 0.35, by - br * 0.4, br * 0.28, 0, TAU); ctx.fill();
    });
    const sp = 0.5 + 0.5 * Math.sin(t * 4 + b.x); ctx.strokeStyle = 'rgba(255,255,255,' + sp + ')'; ctx.lineWidth = 1.4; ctx.beginPath();
    ctx.moveTo(b.x + b.r * 1.5, b.y - b.r * 1.4 - 4); ctx.lineTo(b.x + b.r * 1.5, b.y - b.r * 1.4 + 4); ctx.moveTo(b.x + b.r * 1.5 - 4, b.y - b.r * 1.4); ctx.lineTo(b.x + b.r * 1.5 + 4, b.y - b.r * 1.4); ctx.stroke();
  });
  m.focus = { x: p.x, y: p.y };
  drawTopGiraffe(ctx, p.x, p.y, p.ang, 0.9 * s, Math.hypot(p.vx, p.vy) * 0.005 * t * 6, { alpha: p.stun > 0 && Math.floor(t * 14) % 2 ? 0.5 : 1 });
  ctx.fillStyle = 'rgba(255,255,255,.85)';                             /* snow drifting down */
  for (let k = 0; k < 60; k++){ const x = (k * 137.5 + t * (12 + (k % 5) * 4) + Math.sin(t + k) * 18) % W, y = (k * 71.3 + t * (28 + (k % 4) * 9)) % H; ctx.globalAlpha = 0.5 + (k % 3) * 0.16; ctx.beginPath(); ctx.arc(x, y, (1.2 + (k % 3)) * s, 0, TAU); ctx.fill(); }
  ctx.globalAlpha = 1;
  const ig = ctx.createLinearGradient(0, 0, 0, H); ig.addColorStop(0, 'rgba(255,255,255,.1)'); ig.addColorStop(1, 'rgba(20,70,120,.16)'); ctx.fillStyle = ig; ctx.fillRect(0, 0, W, H);
};

/* ---- 3. Lily-Pad Hop ---- */
function artLilyBg(c, W, H, s, R){
  const gr = c.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, '#1F3B33'); gr.addColorStop(1, '#2F5C46'); c.fillStyle = gr; c.fillRect(0, 0, W, H);
  for (let i = 0; i < 50; i++){ c.fillStyle = R() < 0.5 ? 'rgba(10,30,24,.28)' : 'rgba(110,180,130,.1)'; c.beginPath(); c.ellipse(R() * W, R() * H, (30 + R() * 100) * s, (14 + R() * 40) * s, R() * 3, 0, TAU); c.fill(); }
  for (let side = 0; side < 2; side++){                              /* the banks: mud, stones, reeds */
    const x0 = side ? W : 0, dir = side ? -1 : 1;
    c.fillStyle = '#3A3B22'; c.beginPath(); c.moveTo(x0, 0); for (let y = 0; y <= H; y += 24) c.lineTo(x0 + dir * (W * 0.05 + R() * W * 0.04), y); c.lineTo(x0, H); c.closePath(); c.fill();
    c.fillStyle = '#4A5230'; c.beginPath(); c.moveTo(x0, 0); for (let y = 0; y <= H; y += 24) c.lineTo(x0 + dir * (W * 0.02 + R() * W * 0.03), y); c.lineTo(x0, H); c.closePath(); c.fill();
    for (let i = 0; i < 14; i++){ const y = R() * H, x = x0 + dir * (W * 0.05 + R() * W * 0.035); c.fillStyle = '#6F7068'; c.beginPath(); c.ellipse(x, y, (8 + R() * 10) * s, (6 + R() * 7) * s, R() * 3, 0, TAU); c.fill(); c.fillStyle = 'rgba(255,255,255,.14)'; c.beginPath(); c.ellipse(x - 2, y - 2, 4 * s, 2.5 * s, 0, 0, TAU); c.fill(); }
    for (let i = 0; i < 26; i++){ const y = R() * H, x = x0 + dir * (W * 0.035 + R() * W * 0.05); c.strokeStyle = R() < 0.5 ? '#5C7A32' : '#7F9A42'; c.lineWidth = 2; for (let k = 0; k < 3; k++){ c.beginPath(); c.moveTo(x + k * 3, y); c.quadraticCurveTo(x + k * 3 + dir * 4, y - 14 * s, x + k * 3 + dir * 10, y - (26 + R() * 14) * s); c.stroke(); } if (R() < 0.35){ c.fillStyle = '#6B4A22'; c.beginPath(); c.ellipse(x + 3 + dir * 5, y - 30 * s, 2.5 * s, 7 * s, 0, 0, TAU); c.fill(); } }
  }
}
MINI[3].draw = function(ctx, m, g){
  const s = g.s, W = g.W, H = g.H, t = G.time;
  miniLayer(ctx, m, g, 'lily', artLilyBg);
  const rowH = Math.min(H * 0.12, 90 * s), colW = Math.min(W / 6.2, 96 * s), x0 = W / 2 - colW * 2, baseY = H * 0.78;
  const sy = function(r){ return baseY - (r - m.cam) * rowH; };
  ctx.lineWidth = 1.6;                                                /* light moving on the bottom */
  for (let i = 0; i < 10; i++){ const y = ((i * 83 + t * 18) % (H + 40)) - 20; ctx.strokeStyle = 'rgba(190,255,210,' + (0.05 + 0.04 * Math.sin(t + i)) + ')'; ctx.beginPath(); for (let x = 0; x <= W; x += 30) ctx.lineTo(x, y + Math.sin(x * 0.02 + t * 1.2 + i) * 8 * s); ctx.stroke(); }
  for (let k = 0; k < 3; k++){ const fx = (t * (22 + k * 9) + k * 380) % (W + 160) - 80, fy = H * (0.25 + 0.25 * k) + Math.sin(t * 0.8 + k) * 20; ctx.fillStyle = 'rgba(8,24,18,.4)'; ctx.beginPath(); ctx.ellipse(fx, fy, 26 * s, 8 * s, Math.sin(t + k) * 0.1, 0, TAU); ctx.fill(); ctx.beginPath(); ctx.moveTo(fx - 24 * s, fy); ctx.lineTo(fx - 38 * s, fy - 7 * s); ctx.lineTo(fx - 38 * s, fy + 7 * s); ctx.fill(); }
  const r0 = Math.max(0, Math.floor(m.cam - 3)), r1 = Math.min(m.rows.length - 1, Math.ceil(m.cam + 9));
  for (let r = r0; r <= r1; r++) for (let c = 0; c < 5; c++){
    const pd = m.rows[r][c], x = x0 + c * colW, y = sy(r), bob = Math.sin(t * 1.8 + r * 1.3 + c * 0.7) * 1.8 * s;
    if (!pd.on){
      if (pd.sunk > 0 && pd.sunk > 2.2){ ctx.strokeStyle = 'rgba(190,255,220,' + ((pd.sunk - 2.2)) * 0.5 + ')'; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(x, y, 34 * s * (1.4 - (pd.sunk - 2.2)), 20 * s * (1.4 - (pd.sunk - 2.2)), 0, 0, TAU); ctx.stroke(); }
      continue;
    }
    const k = clamp(pd.stand / 1.15, 0, 1), sh = (r * 7 + c * 3) % 5, rr = 1 - k * 0.12;
    miniShadow(ctx, x + 4, y + 7 + bob, 36 * s, 19 * s, 0.3);
    const lg = ctx.createRadialGradient(x - 8 * s, y - 6 * s + bob, 3, x, y + bob, 36 * s);
    lg.addColorStop(0, k > 0.6 ? '#C9C45A' : '#7FD25A'); lg.addColorStop(1, k > 0.6 ? '#7A7424' : '#2F7A32');
    ctx.fillStyle = lg; ctx.beginPath(); ctx.ellipse(x, y + bob, 35 * s * rr, 20 * s * rr, 0, 0.28, TAU - 0.28); ctx.lineTo(x, y + bob); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(20,70,24,.55)'; ctx.lineWidth = 1.2; ctx.stroke();
    ctx.strokeStyle = 'rgba(210,255,170,.35)'; ctx.beginPath();
    for (let v = 0; v < 7; v++){ const a = 0.5 + v * 0.8; ctx.moveTo(x, y + bob); ctx.lineTo(x + Math.cos(a) * 30 * s * rr, y + bob + Math.sin(a) * 17 * s * rr); }
    ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,.22)'; ctx.beginPath(); ctx.ellipse(x - 10 * s, y - 6 * s + bob, 11 * s, 4 * s, -0.3, 0, TAU); ctx.fill();
    if (sh === 0 && k < 0.2){                                         /* a lotus flower on some pads */
      for (let q = 0; q < 8; q++){ const a = q * TAU / 8; ctx.fillStyle = q % 2 ? '#F9B7D3' : '#F58FB8'; ctx.beginPath(); ctx.ellipse(x + 14 * s + Math.cos(a) * 6 * s, y - 6 * s + bob + Math.sin(a) * 3.4 * s, 5.4 * s, 2.4 * s, a, 0, TAU); ctx.fill(); }
      ctx.fillStyle = '#FFE15A'; ctx.beginPath(); ctx.arc(x + 14 * s, y - 6 * s + bob, 2.6 * s, 0, TAU); ctx.fill();
    }
  }
  if (m.landAt && t - m.landAt < 0.7){ const k = (t - m.landAt) / 0.7, lx = x0 + m.fc * colW, ly = sy(m.fr); ctx.strokeStyle = 'rgba(210,255,230,' + (0.8 * (1 - k)) + ')'; ctx.lineWidth = 2.4 * (1 - k) + 0.6; ctx.beginPath(); ctx.ellipse(lx, ly + 6 * s, 20 * s + k * 50 * s, 10 * s + k * 26 * s, 0, 0, TAU); ctx.stroke(); }
  for (let k = 0; k < 2; k++){                                        /* dragonflies */
    const fx = (t * (60 + k * 25) + k * 500) % (W + 100) - 50, fy = H * (0.2 + k * 0.4) + Math.sin(t * 3 + k) * 22;
    ctx.strokeStyle = '#36D7C8'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(fx - 9, fy); ctx.lineTo(fx + 9, fy); ctx.stroke();
    ctx.fillStyle = 'rgba(220,255,255,.6)'; const fl = Math.sin(t * 40 + k) * 4; ctx.beginPath(); ctx.ellipse(fx - 1, fy - 3 - fl, 6, 2, -0.3, 0, TAU); ctx.ellipse(fx - 1, fy + 3 + fl, 6, 2, 0.3, 0, TAU); ctx.fill();
  }
  const px = x0 + m.fc * colW, py = sy(m.fr) - Math.sin(clamp(m.hop, 0, 1) * Math.PI) * 26 * s;
  m.focus = { x: px, y: py };
  if (m.fall > 0){
    ctx.strokeStyle = 'rgba(255,255,255,.8)'; ctx.lineWidth = 2.4; ctx.beginPath(); ctx.arc(px, py, (0.45 - m.fall) * 120 * s + 10 * s, 0, TAU); ctx.stroke();
    for (let k = 0; k < 6; k++){ const a = k * 1.05, d = (0.45 - m.fall) * 70 * s; ctx.fillStyle = 'rgba(200,240,255,.8)'; ctx.beginPath(); ctx.arc(px + Math.cos(a) * d, py - Math.abs(Math.sin(a)) * d * 0.7, 3 * s, 0, TAU); ctx.fill(); }
  } else drawTopGiraffe(ctx, px, py - 6 * s, -Math.PI / 2, 0.62 * s, t * 6, { neck: 26, alpha: m.inv > 0 && Math.floor(t * 14) % 2 ? 0.5 : 1 });
  ctx.fillStyle = 'rgba(255,255,255,.04)'; ctx.fillRect(0, 0, W, H);
};

/* ---- 4. Tide Surf ---- */
function artSurfSky(c, W, H, s, R){
  const sky = c.createLinearGradient(0, 0, 0, H * 0.72); sky.addColorStop(0, '#4FA9E0'); sky.addColorStop(0.55, '#9ADCF2'); sky.addColorStop(1, '#F7F0C4'); c.fillStyle = sky; c.fillRect(0, 0, W, H);
  const sx = W * 0.78, sy = H * 0.2;
  const sg = c.createRadialGradient(sx, sy, 4, sx, sy, 190 * s); sg.addColorStop(0, 'rgba(255,250,200,.95)'); sg.addColorStop(0.25, 'rgba(255,240,170,.5)'); sg.addColorStop(1, 'rgba(255,240,170,0)'); c.fillStyle = sg; c.fillRect(0, 0, W, H);
  c.fillStyle = '#FFF8D0'; c.beginPath(); c.arc(sx, sy, 34 * s, 0, TAU); c.fill();
  c.strokeStyle = 'rgba(255,250,210,.12)'; c.lineWidth = 14 * s; for (let k = 0; k < 7; k++){ const a = 1.7 + k * 0.28; c.beginPath(); c.moveTo(sx, sy); c.lineTo(sx + Math.cos(a) * W, sy + Math.sin(a) * W); c.stroke(); }
}
function artSurfIslands(c, W, H, s, R){                               /* a strip twice as wide as the screen, scrolled slowly */
  const base = H * 0.66;
  for (let i = 0; i < 5; i++){
    const x = i * W * 0.4 + R() * 90, w = (120 + R() * 140) * s, h = (24 + R() * 30) * s;
    c.fillStyle = 'rgba(70,120,140,.45)'; c.beginPath(); c.ellipse(x, base, w, h, 0, Math.PI, TAU); c.fill();
    c.fillStyle = 'rgba(40,110,80,.7)'; c.beginPath(); c.ellipse(x, base, w * 0.8, h * 0.8, 0, Math.PI, TAU); c.fill();
    for (let p = 0; p < 4; p++){ const px = x + (p - 1.5) * 18 * s, ph = (30 + R() * 22) * s; c.strokeStyle = '#2C5A3A'; c.lineWidth = 2.6; c.beginPath(); c.moveTo(px, base - h * 0.6); c.quadraticCurveTo(px + 5, base - h * 0.6 - ph * 0.6, px + 2, base - h * 0.6 - ph); c.stroke(); c.fillStyle = '#2E7A46'; for (let l = 0; l < 5; l++){ const a = -2.8 + l * 0.55; c.beginPath(); c.ellipse(px + 2 + Math.cos(a) * 9 * s, base - h * 0.6 - ph + Math.sin(a) * 6 * s, 10 * s, 2.6 * s, a, 0, TAU); c.fill(); } }
  }
}
MINI[4].draw = function(ctx, m, g){
  const s = g.s, W = g.W, H = g.H, t = G.time;
  miniLayer(ctx, m, g, 'surfsky', artSurfSky);
  const isl = miniBg(m, g, 'isl', artSurfIslands, W * 2, H), off = (m.sx * 0.06) % isl.w;
  ctx.drawImage(isl.cv, -off, 0, isl.w, isl.h); ctx.drawImage(isl.cv, isl.w - off, 0, isl.w, isl.h);
  ctx.fillStyle = 'rgba(255,255,255,.85)';
  for (let k = 0; k < 7; k++){ const x = ((k * 230 - m.sx * 0.12 * (0.6 + (k % 3) * 0.3)) % (W + 240) + W + 240) % (W + 240) - 120, y = (54 + (k * 53) % 90) * s; for (let q = 0; q < 4; q++){ ctx.globalAlpha = 0.5 + q * 0.1; ctx.beginPath(); ctx.ellipse(x + q * 22 * s - 30 * s, y - (q % 2) * 6 * s, 30 * s, 12 * s, 0, 0, TAU); ctx.fill(); } }
  ctx.globalAlpha = 1;
  const step = 8;
  const body = ctx.createLinearGradient(0, H * 0.58, 0, H); body.addColorStop(0, '#46B6DC'); body.addColorStop(0.5, '#1E83BC'); body.addColorStop(1, '#0E4C80');
  const back = ctx.createLinearGradient(0, H * 0.58, 0, H); back.addColorStop(0, '#2C93C6'); back.addColorStop(1, '#0A3B66');
  const fillWave = function(off2, fill, fac){
    ctx.fillStyle = fill; ctx.beginPath(); ctx.moveTo(0, H);
    for (let x = 0; x <= W + step; x += step) ctx.lineTo(x, surfY(g, x + m.sx * fac, t + off2) + off2 * 26 * s);
    ctx.lineTo(W, H); ctx.closePath(); ctx.fill();
  };
  fillWave(0.7, back, 0.8);
  ctx.save();                                                         /* sun glitter on the far swell */
  ctx.globalAlpha = 0.5; ctx.fillStyle = '#FFFBD0';
  for (let k = 0; k < 24; k++){ const gx = W * 0.62 + Math.sin(k * 5.1 + t * 2) * W * 0.16, gy = H * 0.68 + (k % 6) * 12 * s; ctx.fillRect(gx, gy, 10 * s * (0.4 + 0.6 * Math.abs(Math.sin(t * 3 + k))), 2); }
  ctx.restore(); ctx.globalAlpha = 1;
  /* things in the water that are under the surface of the front swell */
  m.obs.forEach(function(o){
    const x = o.x - m.sx, y = surfY(g, o.x, t);
    if (x < -50 || x > W + 50) return;
    if (o.k === 'mine'){
      ctx.strokeStyle = 'rgba(30,30,36,.8)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x, y + 4); ctx.quadraticCurveTo(x + 6, y + 40 * s, x, y + 90 * s); ctx.stroke();
      ctx.save(); ctx.translate(x, y - 8 * s); ctx.rotate(Math.sin(t * 2 + o.ph) * 0.18);
      const mg = ctx.createRadialGradient(-4 * s, -5 * s, 2, 0, 0, 17 * s); mg.addColorStop(0, '#6A727E'); mg.addColorStop(1, '#1E2228');
      ctx.fillStyle = mg; ctx.strokeStyle = '#1E2228'; ctx.lineWidth = 4;
      for (let k = 0; k < 8; k++){ const a = k * TAU / 8; ctx.beginPath(); ctx.moveTo(Math.cos(a) * 14 * s, Math.sin(a) * 14 * s); ctx.lineTo(Math.cos(a) * 23 * s, Math.sin(a) * 23 * s); ctx.stroke(); ctx.fillStyle = '#7A828E'; ctx.beginPath(); ctx.arc(Math.cos(a) * 23 * s, Math.sin(a) * 23 * s, 2.2 * s, 0, TAU); ctx.fill(); }
      ctx.fillStyle = mg; ctx.beginPath(); ctx.arc(0, 0, 16 * s, 0, TAU); ctx.fill();
      const bl = 0.4 + 0.6 * Math.abs(Math.sin(t * 5 + o.ph)); ctx.fillStyle = 'rgba(255,60,50,' + bl + ')'; ctx.beginPath(); ctx.arc(0, -4 * s, 4.4 * s, 0, TAU); ctx.fill(); miniGlow(ctx, 0, -4 * s, 16 * s, '255,70,50', 0.35 * bl);
      ctx.restore();
    } else if (!o.got){
      const yy = y - o.h + Math.sin(t * 3 + o.x) * 4 * s;
      miniGlow(ctx, x, yy, 30 * s, '255,190,225', 0.45);
      ctx.fillStyle = '#FFB3D1'; ctx.beginPath(); ctx.moveTo(x - 15 * s, yy + 7 * s); ctx.quadraticCurveTo(x - 17 * s, yy - 14 * s, x, yy - 15 * s); ctx.quadraticCurveTo(x + 17 * s, yy - 14 * s, x + 15 * s, yy + 7 * s); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#D9588E'; ctx.lineWidth = 1.6; ctx.beginPath(); for (let k = -3; k <= 3; k++){ ctx.moveTo(x, yy + 7 * s); ctx.lineTo(x + k * 5.4 * s, yy - 13 * s + Math.abs(k) * 1.4 * s); } ctx.stroke();
      ctx.fillStyle = '#F2D2B4'; ctx.fillRect(x - 6 * s, yy + 7 * s, 12 * s, 4 * s);
      ctx.fillStyle = 'rgba(255,255,255,' + (0.4 + 0.5 * Math.sin(t * 6 + o.x)) + ')'; accStar(ctx, x + 12 * s, yy - 14 * s, 4 * s, 4);
    }
  });
  fillWave(0, body, 1);
  ctx.strokeStyle = 'rgba(255,255,255,.9)'; ctx.lineWidth = 3.4 * s; ctx.beginPath();
  for (let x = 0; x <= W + step; x += step){ const y = surfY(g, x + m.sx, t); if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y); } ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,.75)';
  for (let x = 0; x < W; x += 34 * s){ const y = surfY(g, x + m.sx, t); ctx.beginPath(); ctx.ellipse(x, y + 2, 9 * s, 3.4 * s, 0, 0, TAU); ctx.fill(); }
  ctx.fillStyle = 'rgba(255,255,255,.18)';
  for (let k = 0; k < 14; k++){ const x = ((k * 190 - m.sx * 0.9) % (W + 200) + W + 200) % (W + 200) - 100; ctx.beginPath(); ctx.ellipse(x, H * 0.82 + (k % 4) * 22 * s, 36 * s, 5 * s, 0, 0, TAU); ctx.fill(); }
  const gx = W * 0.26, px = m.sx + gx, sy = surfY(g, px, t), sl = Math.atan2(surfY(g, px + 20, t) - surfY(g, px - 20, t), 40);
  const sc = 1.0 * s, by = sy - m.h;
  if (G.time - (m.spT || 0) > 0.04 && m.h < 4 * s){ m.spT = G.time; miniBurst(m, gx - 30 * s, sy + 2, 2, '#EAF8FF', { ang: Math.PI * 1.1, spread: 0.9, speed: 120, r: 3, life: 0.5, g: 360 }); }
  ctx.save(); ctx.translate(gx, by); ctx.rotate(sl);
  const bg = ctx.createLinearGradient(-46 * s, 0, 46 * s, 0); bg.addColorStop(0, '#E8892A'); bg.addColorStop(0.5, '#FFC24A'); bg.addColorStop(1, '#E8892A');
  ctx.fillStyle = bg; ctx.beginPath(); ctx.moveTo(-48 * s, 4 * s); ctx.quadraticCurveTo(-10 * s, 10 * s, 52 * s, 1 * s); ctx.quadraticCurveTo(10 * s, -4 * s, -48 * s, 4 * s); ctx.fill();
  ctx.strokeStyle = '#FFF'; ctx.lineWidth = 2.4 * s; ctx.beginPath(); ctx.moveTo(-40 * s, 4 * s); ctx.lineTo(46 * s, 1.6 * s); ctx.stroke();
  ctx.restore();
  m.focus = { x: gx, y: by - 30 * sc };
  drawSideGiraffe(ctx, gx, by - 38 * sc, sc, { ph: 0, air: m.h > 4 * s, rot: sl * 0.5, alpha: m.inv > 0 && Math.floor(t * 14) % 2 ? 0.5 : 1 });
};

/* ---- 5. Vine Swing ---- */
function artJungleLayer(c, W, H, s, R){
  c.clearRect(0, 0, W, H);
  for (let i = 0; i < 9; i++){
    const x = i * W / 9 + R() * 30 * s, w = (22 + R() * 22) * s;
    const g2 = c.createLinearGradient(x, 0, x + w, 0); g2.addColorStop(0, '#2B1F12'); g2.addColorStop(0.5, '#5A4326'); g2.addColorStop(1, '#2B1F12');
    c.fillStyle = g2; c.fillRect(x, 0, w, H);
    c.strokeStyle = 'rgba(20,12,4,.45)'; c.lineWidth = 1.4; for (let k = 0; k < 9; k++){ const yy = R() * H; c.beginPath(); c.moveTo(x + R() * w, yy); c.lineTo(x + R() * w, yy + 30 * s); c.stroke(); }
    c.fillStyle = '#2E6B2E'; for (let k = 0; k < 16; k++){ c.beginPath(); c.ellipse(x + w / 2 + (R() - 0.5) * 120 * s, R() * H * 0.28, (26 + R() * 30) * s, (12 + R() * 16) * s, R() * 3, 0, TAU); c.fill(); }
    c.strokeStyle = '#3F8A3A'; c.lineWidth = 3; for (let k = 0; k < 3; k++){ const lx = x + R() * w * 3 - w; c.beginPath(); c.moveTo(lx, 0); c.quadraticCurveTo(lx + 14 * s, H * 0.3, lx - 6 * s, H * (0.45 + R() * 0.3)); c.stroke(); }
  }
}
MINI[5].draw = function(ctx, m, g){
  const s = g.s, W = g.W, H = g.H, t = G.time, p = m.p, cam = m.cam;
  const gr = ctx.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, '#0F3A22'); gr.addColorStop(0.55, '#2C7A3E'); gr.addColorStop(1, '#4BA24E'); ctx.fillStyle = gr; ctx.fillRect(0, 0, W, H);
  const far = miniBg(m, g, 'jfar', artJungleLayer, W * 1.3, H), near = miniBg(m, g, 'jnear', function(c, w, h, s2, R){ artJungleLayer(c, w, h, s2 * 1.35, R); }, W * 1.6, H);
  ctx.globalAlpha = 0.55; let o = (cam * 0.18) % far.w; ctx.drawImage(far.cv, -o, 0, far.w, far.h); ctx.drawImage(far.cv, far.w - o, 0, far.w, far.h);
  ctx.globalAlpha = 0.9; o = (cam * 0.42) % near.w; ctx.drawImage(near.cv, -o, 0, near.w, near.h); ctx.drawImage(near.cv, near.w - o, 0, near.w, near.h); ctx.globalAlpha = 1;
  ctx.fillStyle = 'rgba(255,250,190,.07)';                            /* shafts of sun through the canopy */
  for (let k = 0; k < 5; k++){ const x = ((k * 330 - cam * 0.3) % (W + 300) + W + 300) % (W + 300) - 150; ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x + 70 * s, 0); ctx.lineTo(x + 240 * s, H); ctx.lineTo(x + 120 * s, H); ctx.closePath(); ctx.fill(); }
  const mg = ctx.createLinearGradient(0, H * 0.55, 0, H); mg.addColorStop(0, 'rgba(200,240,210,0)'); mg.addColorStop(1, 'rgba(200,240,210,.35)'); ctx.fillStyle = mg; ctx.fillRect(0, H * 0.55, W, H * 0.45);
  const wg = ctx.createLinearGradient(0, H * 0.9, 0, H); wg.addColorStop(0, '#2F8AA8'); wg.addColorStop(1, '#144A64'); ctx.fillStyle = wg; ctx.fillRect(0, H * 0.9, W, H * 0.1);
  ctx.strokeStyle = 'rgba(255,255,255,.4)'; ctx.lineWidth = 1.4; for (let k = 0; k < 12; k++){ const x = ((k * 140 - cam * 0.9) % W + W) % W; ctx.beginPath(); ctx.ellipse(x, H * 0.93 + (k % 3) * 8, 26 * s, 3, 0, 0, TAU); ctx.stroke(); }
  const ce = (Math.floor(t / 7) % 2) * 200; if (ce >= 0){ const ex = ((t * 30 + 300) % (W + 200)) - 60; ctx.fillStyle = '#C9D84A'; ctx.beginPath(); ctx.arc(ex, H * 0.915, 4, 0, TAU); ctx.arc(ex + 14, H * 0.915, 4, 0, TAU); ctx.fill(); ctx.fillStyle = '#1A1A1A'; ctx.fillRect(ex - 1, H * 0.912, 2, 6); ctx.fillRect(ex + 13, H * 0.912, 2, 6); }
  for (let i = 0; i < m.anch.length; i++){
    const a = m.anch[i], x = a.x - cam;
    if (x < -100 || x > W + 100) continue;
    ctx.strokeStyle = '#3F7A2A'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, a.y); ctx.stroke();
    ctx.strokeStyle = '#6FC24A'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x - 1, 0); ctx.lineTo(x - 1, a.y); ctx.stroke();
    ctx.fillStyle = '#5FBF45';
    for (let k = 0; k < 4; k++){ const ly = a.y * (0.2 + k * 0.22); ctx.beginPath(); ctx.ellipse(x + (k % 2 ? 8 : -8) * s, ly, 9 * s, 4.4 * s, k % 2 ? 0.5 : -0.5, 0, TAU); ctx.fill(); }
    ctx.fillStyle = '#8EE060'; ctx.beginPath(); ctx.ellipse(x, a.y + 3, 10 * s, 6 * s, 0.4, 0, TAU); ctx.fill();
  }
  m.fruit.forEach(function(f){
    if (f.got) return; const x = f.x - cam; if (x < -40 || x > W + 40) return;
    const bob = Math.sin(t * 2 + f.x) * 4 * s;
    miniGlow(ctx, x, f.y + bob, 30 * s, '255,200,80', 0.3);
    ctx.strokeStyle = '#4E7A2A'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x, f.y + bob - 12 * s); ctx.lineTo(x + 2, f.y + bob - 26 * s); ctx.stroke();
    const fg = ctx.createRadialGradient(x - 4 * s, f.y + bob - 4 * s, 2, x, f.y + bob, 15 * s); fg.addColorStop(0, '#FFD05A'); fg.addColorStop(0.6, '#FF8A2A'); fg.addColorStop(1, '#C94A12');
    ctx.fillStyle = fg; ctx.beginPath(); ctx.arc(x, f.y + bob, 14 * s, 0, TAU); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.55)'; ctx.beginPath(); ctx.ellipse(x - 5 * s, f.y + bob - 5 * s, 4 * s, 2.4 * s, -0.7, 0, TAU); ctx.fill();
    ctx.fillStyle = '#4E9A2A'; ctx.beginPath(); ctx.ellipse(x + 3 * s, f.y + bob - 14 * s, 7 * s, 3 * s, -0.5, 0, TAU); ctx.fill();
  });
  const sc = 0.8 * s, hang = p.att >= 0;
  if (hang){
    const a = m.anch[p.att];
    ctx.strokeStyle = '#2E5A22'; ctx.lineWidth = 6.5; ctx.beginPath(); ctx.moveTo(a.x - cam, a.y); ctx.lineTo(p.x - cam, p.y - 40 * sc); ctx.stroke();
    ctx.strokeStyle = '#78D24E'; ctx.lineWidth = 3.4; ctx.beginPath(); ctx.moveTo(a.x - cam, a.y); ctx.lineTo(p.x - cam, p.y - 40 * sc); ctx.stroke();
  }
  m.focus = { x: p.x - cam, y: p.y };
  miniShadow(ctx, p.x - cam, H * 0.9, 30 * s * clamp(1.2 - (H * 0.9 - p.y) / (H * 0.9), 0.3, 1), 7 * s, 0.15);
  drawSideGiraffe(ctx, p.x - cam, p.y, sc, { air: true, rot: hang ? -p.th * 0.5 : clamp(p.vy / 1500, -0.4, 0.5), lean: 4 });
  ctx.fillStyle = 'rgba(20,70,25,.7)';                                /* leaves framing the corners */
  for (let k = 0; k < 7; k++){ ctx.beginPath(); ctx.ellipse(k * 40 * s, -4, 60 * s, 26 * s, 0.3 + k * 0.1, 0, TAU); ctx.fill(); ctx.beginPath(); ctx.ellipse(W - k * 40 * s, -4, 60 * s, 26 * s, -0.3 - k * 0.1, 0, TAU); ctx.fill(); }
};

/* ---- 6. Rooftop Dash ---- */
function artSkyline(c, W, H, s, R){
  c.clearRect(0, 0, W, H);
  const col = ['rgba(92,66,100,.55)', 'rgba(76,52,88,.7)'];
  for (let layer = 0; layer < 2; layer++){
    let x = 0; c.fillStyle = col[layer];
    while (x < W){
      const w = (50 + R() * 90) * s * (layer ? 1 : 0.8), h = (H * (0.18 + R() * 0.42)) * (layer ? 0.8 : 1);
      c.fillRect(x, H - h, w, h);
      if (R() < 0.35){ c.fillRect(x + w * 0.45, H - h - 26 * s, 2.4, 26 * s); c.fillStyle = '#FF4A3A'; c.fillRect(x + w * 0.45 - 1, H - h - 28 * s, 4, 4); c.fillStyle = col[layer]; }
      if (layer && R() < 0.4){ c.fillStyle = 'rgba(255,214,140,.55)'; for (let wy = H - h + 10 * s; wy < H - 10 * s; wy += 16 * s) for (let wx = x + 8 * s; wx < x + w - 10 * s; wx += 14 * s) if (R() < 0.45) c.fillRect(wx, wy, 5 * s, 7 * s); c.fillStyle = col[layer]; }
      x += w + R() * 6 * s;
    }
  }
  const rx = W * 0.55;                                                /* a launch tower: this is Houston */
  c.fillStyle = 'rgba(70,48,82,.85)'; c.fillRect(rx, H * 0.18, 8 * s, H * 0.82); c.fillStyle = 'rgba(210,210,225,.8)'; c.beginPath(); c.moveTo(rx + 18 * s, H * 0.14); c.quadraticCurveTo(rx + 28 * s, H * 0.26, rx + 28 * s, H * 0.42); c.lineTo(rx + 12 * s, H * 0.42); c.quadraticCurveTo(rx + 12 * s, H * 0.26, rx + 18 * s, H * 0.14); c.fill();
}
MINI[6].draw = function(ctx, m, g){
  const s = g.s, W = g.W, H = g.H, cam = m.cam, t = G.time;
  const sky = ctx.createLinearGradient(0, 0, 0, H); sky.addColorStop(0, '#5B3D7A'); sky.addColorStop(0.35, '#D9688A'); sky.addColorStop(0.6, '#F7A860'); sky.addColorStop(1, '#4A3358'); ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H);
  miniGlow(ctx, W * 0.72, H * 0.52, 260 * s, '255,214,140', 0.55);
  ctx.fillStyle = '#FFE9B0'; ctx.beginPath(); ctx.arc(W * 0.72, H * 0.52, 34 * s, 0, TAU); ctx.fill();
  ctx.fillStyle = 'rgba(255,200,170,.35)'; for (let k = 0; k < 5; k++){ const x = ((k * 280 - cam * 0.05) % (W + 300) + W + 300) % (W + 300) - 150; ctx.beginPath(); ctx.ellipse(x, H * (0.18 + (k % 3) * 0.1), 110 * s, 12 * s, 0, 0, TAU); ctx.fill(); }
  const sk = miniBg(m, g, 'sky6', artSkyline, W * 1.6, H), o = (cam * 0.12) % sk.w;
  ctx.drawImage(sk.cv, -o, 0, sk.w, sk.h); ctx.drawImage(sk.cv, sk.w - o, 0, sk.w, sk.h);
  m.roofs.forEach(function(r){
    const x0 = r.x0 - cam, x1 = r.x1 - cam, w = x1 - x0;
    if (x1 < -30 || x0 > W + 30) return;
    const bg = ctx.createLinearGradient(x0, r.y, x0 + w, r.y); bg.addColorStop(0, '#46364E'); bg.addColorStop(1, '#2E2336');
    ctx.fillStyle = bg; ctx.fillRect(x0, r.y, w, H - r.y + 6);
    ctx.fillStyle = 'rgba(120,70,60,.22)'; for (let by = r.y + 12 * s; by < H; by += 14 * s) ctx.fillRect(x0, by, w, 1.5);
    for (let wy = r.y + 26 * s; wy < H; wy += 40 * s) for (let wx = x0 + 18 * s; wx < x1 - 18 * s; wx += 34 * s){
      const h = ((Math.floor(wx - 0) * 7 + Math.floor(wy)) | 0) % 7; ctx.fillStyle = h < 3 ? 'rgba(255,224,150,.8)' : h < 4 ? 'rgba(160,220,255,.7)' : 'rgba(20,14,26,.6)'; ctx.fillRect(wx, wy, 14 * s, 20 * s);
      if (h < 3){ ctx.fillStyle = 'rgba(255,230,160,.1)'; ctx.fillRect(wx - 4, wy - 4, 22 * s, 28 * s); }
    }
    ctx.fillStyle = '#6A5876'; ctx.fillRect(x0 - 3, r.y - 2, w + 6, 10 * s);
    ctx.fillStyle = 'rgba(255,214,170,.55)'; ctx.fillRect(x0 - 3, r.y - 2, w + 6, 2.2);
    if (w > 420 * s){ const sx = x0 + w * 0.18; ctx.fillStyle = '#9A9AA8'; ctx.fillRect(sx, r.y - 22 * s, 8 * s, 22 * s); ctx.fillStyle = '#B8B8C6'; ctx.beginPath(); ctx.ellipse(sx + 4 * s, r.y - 22 * s, 11 * s, 5 * s, 0, 0, TAU); ctx.fill(); }
    if (r.box !== null){
      const bx = r.box - cam;
      ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.fillRect(bx - 18 * s, r.y - 2, 46 * s, 5 * s);
      ctx.fillStyle = '#9AA0AE'; ctx.fillRect(bx - 21 * s, r.y - 32 * s, 42 * s, 32 * s); ctx.fillStyle = '#C4C9D6'; ctx.fillRect(bx - 21 * s, r.y - 32 * s, 42 * s, 5 * s);
      ctx.fillStyle = '#4A505E'; ctx.beginPath(); ctx.arc(bx, r.y - 15 * s, 11 * s, 0, TAU); ctx.fill();
      ctx.strokeStyle = '#C4C9D6'; ctx.lineWidth = 2.6; ctx.beginPath(); for (let k = 0; k < 3; k++){ const a = t * 11 + k * 2.09; ctx.moveTo(bx, r.y - 15 * s); ctx.lineTo(bx + Math.cos(a) * 9 * s, r.y - 15 * s + Math.sin(a) * 9 * s); } ctx.stroke();
    }
    if (r.drone){
      const d = r.drone, dx = d.x - cam, dy = d.y + Math.sin(t * 3 + d.ph) * 10 * s;
      const beam = ctx.createLinearGradient(0, dy, 0, dy + 90 * s); beam.addColorStop(0, 'rgba(255,90,70,.4)'); beam.addColorStop(1, 'rgba(255,90,70,0)');
      ctx.fillStyle = beam; ctx.beginPath(); ctx.moveTo(dx - 6 * s, dy + 6 * s); ctx.lineTo(dx + 6 * s, dy + 6 * s); ctx.lineTo(dx + 30 * s, dy + 90 * s); ctx.lineTo(dx - 30 * s, dy + 90 * s); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#23262E'; ctx.beginPath(); ctx.ellipse(dx, dy, 18 * s, 8 * s, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = '#3E4350'; ctx.beginPath(); ctx.ellipse(dx, dy - 2 * s, 12 * s, 4 * s, 0, 0, TAU); ctx.fill();
      ctx.strokeStyle = '#555B68'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(dx - 16 * s, dy - 2); ctx.lineTo(dx - 28 * s, dy - 9 * s); ctx.moveTo(dx + 16 * s, dy - 2); ctx.lineTo(dx + 28 * s, dy - 9 * s); ctx.stroke();
      ctx.fillStyle = 'rgba(200,205,215,.45)'; ctx.beginPath(); ctx.ellipse(dx - 28 * s, dy - 10 * s, 14 * s, 2.4 * s, 0, 0, TAU); ctx.ellipse(dx + 28 * s, dy - 10 * s, 14 * s, 2.4 * s, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = Math.floor(t * 4) % 2 ? '#FF3A2A' : '#7A1A12'; ctx.beginPath(); ctx.arc(dx, dy + 3 * s, 3.4 * s, 0, TAU); ctx.fill();
    }
  });
  m.coins.forEach(function(c){
    if (c.got) return; const x = c.x - cam; if (x < -20 || x > W + 20) return;
    const wd = Math.abs(Math.cos(t * 5 + c.x * 0.02)) * 10 * s + 1.5;
    miniGlow(ctx, x, c.y, 24 * s, '255,215,90', 0.35);
    ctx.fillStyle = '#FFD84D'; ctx.beginPath(); ctx.ellipse(x, c.y, wd, 10 * s, 0, 0, TAU); ctx.fill(); ctx.strokeStyle = '#B8860B'; ctx.lineWidth = 1.6; ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,.6)'; ctx.fillRect(x - wd * 0.4, c.y - 6 * s, Math.max(1, wd * 0.3), 8 * s);
  });
  const sc = 0.8 * s, gx = W * 0.3;
  m.focus = { x: gx, y: m.y - 30 * s };
  if (m.ground && Math.floor(t * 40) % 4 === 0) miniDust(m, gx - 18 * s, m.y - 2, 'rgba(210,190,170,.5)');
  ctx.strokeStyle = 'rgba(255,255,255,.18)'; ctx.lineWidth = 2; ctx.beginPath(); for (let k = 0; k < 6; k++){ const y = (60 + k * 47) % H, x = ((k * 211 + t * 700) % (W + 200)) - 100; ctx.moveTo(x, y); ctx.lineTo(x + 70 * s, y); } ctx.stroke();
  drawSideGiraffe(ctx, gx, m.y - 38 * sc, sc, { ph: m.x * 0.03, air: !m.ground, moving: true, alpha: m.inv > 0 && Math.floor(t * 14) % 2 ? 0.5 : 1 });
  const fg = ctx.createLinearGradient(0, H * 0.7, 0, H); fg.addColorStop(0, 'rgba(60,30,60,0)'); fg.addColorStop(1, 'rgba(60,30,60,.35)'); ctx.fillStyle = fg; ctx.fillRect(0, H * 0.7, W, H * 0.3);
};
