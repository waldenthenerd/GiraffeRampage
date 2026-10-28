'use strict';
/* The look of the minigames for Chapters 7-13 (rules in 44h-minigames-b.js; helpers in 44f-minigames.js; see 44i for the idea). */
/* ========================= 44j. MINIGAME ART 7-13 ========================= */

/* ---- 7. Asteroid Slalom ---- */
function artSpaceBg(c, W, H, s, R){
  const gr = c.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, '#04050E'); gr.addColorStop(1, '#0B1233'); c.fillStyle = gr; c.fillRect(0, 0, W, H);
  const neb = [['120,60,200', 0.2], ['40,160,200', 0.16], ['220,80,150', 0.14], ['60,90,230', 0.18]];
  for (let i = 0; i < 9; i++){ const n = neb[i % 4], x = R() * W, y = R() * H, r = (150 + R() * 260) * s; const g2 = c.createRadialGradient(x, y, 0, x, y, r); g2.addColorStop(0, 'rgba(' + n[0] + ',' + n[1] + ')'); g2.addColorStop(1, 'rgba(' + n[0] + ',0)'); c.fillStyle = g2; c.fillRect(x - r, y - r, r * 2, r * 2); }
  const px = W * 0.84, py = H * 0.2, pr = 52 * s;                       /* a ringed planet */
  c.save(); c.translate(px, py); c.rotate(-0.35);
  c.strokeStyle = 'rgba(210,190,150,.5)'; c.lineWidth = 9 * s; c.beginPath(); c.ellipse(0, 0, pr * 1.9, pr * 0.5, 0, Math.PI, TAU); c.stroke();
  const pg = c.createRadialGradient(-pr * 0.4, -pr * 0.4, 2, 0, 0, pr); pg.addColorStop(0, '#E8C890'); pg.addColorStop(0.7, '#B8844A'); pg.addColorStop(1, '#4A2C18'); c.fillStyle = pg; c.beginPath(); c.arc(0, 0, pr, 0, TAU); c.fill();
  c.strokeStyle = 'rgba(120,70,30,.4)'; c.lineWidth = 3 * s; for (let k = -2; k <= 2; k++){ c.beginPath(); c.ellipse(0, k * pr * 0.28, pr * 0.95, pr * 0.08, 0, 0, TAU); c.stroke(); }
  c.strokeStyle = 'rgba(210,190,150,.55)'; c.lineWidth = 9 * s; c.beginPath(); c.ellipse(0, 0, pr * 1.9, pr * 0.5, 0, 0, Math.PI); c.stroke(); c.restore();
}
function artStarTile(c, W, H, s, R){ c.clearRect(0, 0, W, H); for (let i = 0; i < 90; i++){ const a = 0.3 + R() * 0.7; c.fillStyle = 'rgba(' + (R() < 0.2 ? '170,200,255' : '255,255,255') + ',' + a + ')'; const r = 0.6 + R() * 1.6; c.fillRect(R() * W, R() * H, r, r); } }
MINI[7].draw = function(ctx, m, g){
  const s = g.s, W = g.W, H = g.H, t = G.time, p = m.p;
  miniLayer(ctx, m, g, 'space', artSpaceBg);
  const tile = miniBg(m, g, 'stars', artStarTile, W, H);
  [0.25, 0.5, 1].forEach(function(sp, i){ const oy = (t * 38 * sp * (1 + m.time / 90)) % H; ctx.globalAlpha = 0.45 + i * 0.25; ctx.drawImage(tile.cv, 0, oy, W, H); ctx.drawImage(tile.cv, 0, oy - H, W, H); });
  ctx.globalAlpha = 1;
  m.cells.forEach(function(c){
    const pulse = 0.6 + 0.4 * Math.sin(t * 6 + c.x);
    miniGlow(ctx, c.x, c.y, 44 * s, '90,255,150', 0.38 * pulse);
    ctx.save(); ctx.translate(c.x, c.y); ctx.rotate(Math.sin(t * 2 + c.x) * 0.25);
    ctx.fillStyle = '#1F3B2A'; ctx.fillRect(-12 * s, -17 * s, 24 * s, 34 * s);
    const bg = ctx.createLinearGradient(-10 * s, 0, 10 * s, 0); bg.addColorStop(0, '#2FB868'); bg.addColorStop(0.5, '#8CFFB8'); bg.addColorStop(1, '#2FB868'); ctx.fillStyle = bg; ctx.fillRect(-10 * s, -15 * s, 20 * s, 30 * s);
    ctx.fillStyle = '#C8D8E0'; ctx.fillRect(-5 * s, -21 * s, 10 * s, 6 * s);
    ctx.fillStyle = 'rgba(255,255,255,' + pulse + ')'; ctx.beginPath(); ctx.moveTo(2 * s, -9 * s); ctx.lineTo(-5 * s, 2 * s); ctx.lineTo(0, 2 * s); ctx.lineTo(-3 * s, 11 * s); ctx.lineTo(6 * s, -1 * s); ctx.lineTo(1 * s, -1 * s); ctx.closePath(); ctx.fill();
    ctx.restore();
  });
  m.rocks.forEach(function(r){
    ctx.save(); ctx.translate(r.x, r.y); ctx.rotate(r.rot);
    const rg = ctx.createRadialGradient(-r.r * 0.4, -r.r * 0.4, 2, 0, 0, r.r * 1.15); rg.addColorStop(0, '#B8AC9C'); rg.addColorStop(0.55, '#7C7266'); rg.addColorStop(1, '#2E2924');
    ctx.fillStyle = rg; ctx.strokeStyle = '#1E1A16'; ctx.lineWidth = 2; ctx.beginPath();
    r.pts.forEach(function(d, i){ const a = i * TAU / r.pts.length; ctx.lineTo(Math.cos(a) * d, Math.sin(a) * d); }); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = 'rgba(20,16,12,.38)'; [[0.25, 0.1, 0.3], [-0.3, 0.3, 0.2], [0.05, -0.35, 0.18]].forEach(function(q){ ctx.beginPath(); ctx.arc(q[0] * r.r, q[1] * r.r, q[2] * r.r, 0, TAU); ctx.fill(); });
    ctx.strokeStyle = 'rgba(230,220,200,.35)'; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.arc(-r.r * 0.1, -r.r * 0.1, r.r * 0.82, 3.6, 5.0); ctx.stroke();
    ctx.restore();
  });
  /* the ship */
  m.focus = { x: p.x, y: p.y };
  if (Math.floor(t * 60) % 2 === 0) miniBurst(m, p.x + rand(-3, 3), p.y + 24 * s, 1, Math.random() < 0.5 ? '#FFB347' : '#FFE9A0', { ang: Math.PI / 2, spread: 0.5, speed: 150, r: 4, life: 0.4, g: 0 });
  ctx.save(); ctx.translate(p.x, p.y); ctx.scale(s * 1.25, s * 1.25);
  if (m.inv > 0 && Math.floor(t * 14) % 2) ctx.globalAlpha = 0.5;
  const fl = 12 + Math.sin(t * 40) * 5;
  const fg = ctx.createLinearGradient(0, 16, 0, 16 + fl * 2); fg.addColorStop(0, 'rgba(255,240,170,.95)'); fg.addColorStop(0.5, 'rgba(255,150,50,.7)'); fg.addColorStop(1, 'rgba(255,80,20,0)');
  ctx.fillStyle = fg; ctx.beginPath(); ctx.moveTo(-7, 16); ctx.quadraticCurveTo(0, 16 + fl * 2.4, 7, 16); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#B03A2E'; ctx.beginPath(); ctx.moveTo(-14, 14); ctx.lineTo(-27, 26); ctx.lineTo(-24, 6); ctx.lineTo(-11, -4); ctx.closePath(); ctx.moveTo(14, 14); ctx.lineTo(27, 26); ctx.lineTo(24, 6); ctx.lineTo(11, -4); ctx.closePath(); ctx.fill();
  const hg = ctx.createLinearGradient(-14, 0, 14, 0); hg.addColorStop(0, '#8E9AAE'); hg.addColorStop(0.5, '#E4EAF4'); hg.addColorStop(1, '#8E9AAE');
  ctx.fillStyle = hg; ctx.beginPath(); ctx.moveTo(0, -30); ctx.quadraticCurveTo(15, -8, 14, 16); ctx.lineTo(6, 10); ctx.lineTo(-6, 10); ctx.lineTo(-14, 16); ctx.quadraticCurveTo(-15, -8, 0, -30); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = '#5A6678'; ctx.lineWidth = 1.2; ctx.stroke();
  ctx.fillStyle = '#4A5668'; ctx.fillRect(-4, 4, 8, 10);
  const cg = ctx.createRadialGradient(-3, -9, 1, 0, -5, 11); cg.addColorStop(0, 'rgba(210,240,255,.95)'); cg.addColorStop(1, 'rgba(70,140,200,.9)'); ctx.fillStyle = cg; ctx.beginPath(); ctx.arc(0, -5, 10, 0, TAU); ctx.fill();
  const cl = giraffeColours(), hat = accEquipped('hat');
  ctx.fillStyle = cl.coat; ctx.beginPath(); ctx.arc(0, -4, 6.4, 0, TAU); ctx.fill(); ctx.fillStyle = cl.dark; ctx.beginPath(); ctx.ellipse(0, -9, 3.2, 3.8, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = '#20140C'; ctx.beginPath(); ctx.arc(-3.4, -5, 1, 0, TAU); ctx.arc(3.4, -5, 1, 0, TAU); ctx.fill();
  if (hat){ ctx.save(); ctx.translate(0, -2); ctx.rotate(-Math.PI / 2); drawHatOnHeadTop(ctx, hat.id, t); ctx.restore(); }
  ctx.strokeStyle = 'rgba(255,255,255,.7)'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.arc(0, -5, 10, 3.6, 4.6); ctx.stroke();
  ctx.restore();
  if (m.inv > 0){ ctx.strokeStyle = 'rgba(120,220,255,' + (0.35 + 0.3 * Math.sin(t * 20)) + ')'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(p.x, p.y, 38 * s, 0, TAU); ctx.stroke(); miniGlow(ctx, p.x, p.y, 44 * s, '90,200,255', 0.2); }
};

/* ---- 8. Low-Gravity Bounce ---- */
function artMoonBg(c, W, H, s, R){
  c.fillStyle = '#04050C'; c.fillRect(0, 0, W, H);
  for (let i = 0; i < 160; i++){ c.fillStyle = 'rgba(255,255,255,' + (0.25 + R() * 0.7) + ')'; const r = 0.6 + R() * 1.5; c.fillRect(R() * W, R() * H * 0.85, r, r); }
  const ex = W * 0.8, ey = H * 0.27, er = 62 * s;                      /* Earth */
  const ag = c.createRadialGradient(ex, ey, er * 0.9, ex, ey, er * 1.7); ag.addColorStop(0, 'rgba(110,170,255,.5)'); ag.addColorStop(1, 'rgba(110,170,255,0)'); c.fillStyle = ag; c.fillRect(ex - er * 2, ey - er * 2, er * 4, er * 4);
  c.save(); c.beginPath(); c.arc(ex, ey, er, 0, TAU); c.clip();
  const og = c.createRadialGradient(ex - er * 0.3, ey - er * 0.3, 2, ex, ey, er); og.addColorStop(0, '#5AA2E8'); og.addColorStop(1, '#1B4E96'); c.fillStyle = og; c.fillRect(ex - er, ey - er, er * 2, er * 2);
  c.fillStyle = '#4C9A56'; [[-0.3, -0.2, 0.34, 0.2], [0.3, 0.25, 0.28, 0.3], [-0.1, 0.5, 0.2, 0.12], [0.45, -0.3, 0.16, 0.2]].forEach(function(q){ c.beginPath(); c.ellipse(ex + q[0] * er, ey + q[1] * er, q[2] * er, q[3] * er, 0.5, 0, TAU); c.fill(); });
  c.fillStyle = 'rgba(255,255,255,.65)'; for (let k = 0; k < 12; k++){ c.beginPath(); c.ellipse(ex + (R() - 0.5) * er * 1.6, ey + (R() - 0.5) * er * 1.6, (0.12 + R() * 0.2) * er, (0.04 + R() * 0.05) * er, R() * 3, 0, TAU); c.fill(); }
  const sg = c.createLinearGradient(ex - er, ey, ex + er, ey); sg.addColorStop(0.5, 'rgba(0,0,10,0)'); sg.addColorStop(1, 'rgba(0,0,10,.7)'); c.fillStyle = sg; c.fillRect(ex - er, ey - er, er * 2, er * 2);
  c.restore();
  const gy = H * 0.82;                                                  /* far hills */
  c.fillStyle = '#5E6068'; c.beginPath(); c.moveTo(0, gy + 30 * s); for (let x = 0; x <= W; x += 28) c.lineTo(x, gy + 30 * s - (14 + R() * 34) * s * (0.6 + 0.4 * Math.sin(x * 0.01))); c.lineTo(W, gy + 40 * s); c.closePath(); c.fill();
  const fg = c.createLinearGradient(0, gy, 0, H); fg.addColorStop(0, '#A8ABB4'); fg.addColorStop(1, '#6C6F7A'); c.fillStyle = fg; c.fillRect(0, gy + 28 * s, W, H - gy);
  for (let i = 0; i < 12; i++){                                         /* craters with a lit rim */
    const x = R() * W, y = gy + 40 * s + R() * (H - gy - 40 * s), rx = (24 + R() * 54) * s, ry = rx * 0.26;
    c.fillStyle = 'rgba(40,42,52,.4)'; c.beginPath(); c.ellipse(x, y, rx, ry, 0, 0, TAU); c.fill();
    c.strokeStyle = 'rgba(240,242,250,.55)'; c.lineWidth = 2; c.beginPath(); c.ellipse(x, y, rx, ry, 0, Math.PI, TAU); c.stroke();
    c.strokeStyle = 'rgba(20,22,30,.5)'; c.beginPath(); c.ellipse(x, y, rx, ry, 0, 0, Math.PI); c.stroke();
  }
  for (let i = 0; i < 40; i++){ c.fillStyle = 'rgba(70,72,84,' + (0.3 + R() * 0.4) + ')'; c.beginPath(); c.ellipse(R() * W, gy + 36 * s + R() * (H - gy), (2 + R() * 6) * s, (1 + R() * 3) * s, 0, 0, TAU); c.fill(); }
}
MINI[8].draw = function(ctx, m, g){
  const s = g.s, W = g.W, H = g.H, t = G.time, p = m.p, gy = H * 0.82;
  miniLayer(ctx, m, g, 'moon', artMoonBg);
  m.met.forEach(function(q){
    if (q.warn > 0){
      const a = 0.35 + 0.35 * Math.sin(t * 22);
      ctx.fillStyle = 'rgba(255,90,60,' + a * 0.25 + ')'; ctx.beginPath(); ctx.ellipse(q.x, gy + 40 * s, 40 * s, 10 * s, 0, 0, TAU); ctx.fill();
      ctx.strokeStyle = 'rgba(255,100,60,' + a + ')'; ctx.lineWidth = 2; ctx.setLineDash([8, 8]); ctx.beginPath(); ctx.moveTo(q.x, 56 * s); ctx.lineTo(q.x, gy + 36 * s); ctx.stroke(); ctx.setLineDash([]);
      miniText(ctx, '!', q.x, 84 * s, 24 * s, '#FF7A4A'); return;
    }
    const tg = ctx.createLinearGradient(0, q.y - 120 * s, 0, q.y); tg.addColorStop(0, 'rgba(255,120,40,0)'); tg.addColorStop(1, 'rgba(255,190,90,.8)');
    ctx.fillStyle = tg; ctx.beginPath(); ctx.moveTo(q.x - 16 * s, q.y - 120 * s); ctx.lineTo(q.x + 16 * s, q.y - 120 * s); ctx.lineTo(q.x + 10 * s, q.y); ctx.lineTo(q.x - 10 * s, q.y); ctx.closePath(); ctx.fill();
    miniGlow(ctx, q.x, q.y, 40 * s, '255,150,60', 0.5);
    const mg = ctx.createRadialGradient(q.x - 6 * s, q.y - 6 * s, 2, q.x, q.y, 22 * s); mg.addColorStop(0, '#B0A090'); mg.addColorStop(1, '#3A3028');
    ctx.fillStyle = mg; ctx.beginPath(); ctx.arc(q.x, q.y, 20 * s, 0, TAU); ctx.fill();
    ctx.fillStyle = '#FFB060'; ctx.beginPath(); ctx.arc(q.x, q.y + 6 * s, 12 * s, 0, Math.PI); ctx.fill();
  });
  m.rocks.forEach(function(r){
    const a = r.life < 1.5 ? 0.4 + 0.6 * Math.abs(Math.sin(t * 10)) : 1, bob = Math.sin(t * 2.4 + r.x) * 4 * s;
    ctx.globalAlpha = a;
    miniGlow(ctx, r.x, r.y + bob, 36 * s, '140,225,255', 0.4);
    ctx.fillStyle = 'rgba(0,0,0,.22)'; ctx.beginPath(); ctx.ellipse(r.x, gy + 44 * s, 14 * s * clamp(1 - (gy - r.y) / (600 * s), 0.3, 1), 4 * s, 0, 0, TAU); ctx.fill();
    const cg = ctx.createLinearGradient(r.x - 14 * s, r.y, r.x + 14 * s, r.y);
    cg.addColorStop(0, '#4FB8E8'); cg.addColorStop(0.5, '#C8F2FF'); cg.addColorStop(1, '#3A9AD0');
    ctx.fillStyle = cg; ctx.beginPath(); ctx.moveTo(r.x, r.y - 20 * s + bob); ctx.lineTo(r.x + 14 * s, r.y - 4 * s + bob); ctx.lineTo(r.x + 9 * s, r.y + 17 * s + bob); ctx.lineTo(r.x - 10 * s, r.y + 16 * s + bob); ctx.lineTo(r.x - 15 * s, r.y - 5 * s + bob); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,.7)'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(r.x, r.y - 20 * s + bob); ctx.lineTo(r.x - 2 * s, r.y + 16 * s + bob); ctx.moveTo(r.x - 15 * s, r.y - 5 * s + bob); ctx.lineTo(r.x + 14 * s, r.y - 4 * s + bob); ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,' + (0.4 + 0.5 * Math.sin(t * 7 + r.x)) + ')'; accStar(ctx, r.x + 12 * s, r.y - 16 * s + bob, 5 * s, 4);
    ctx.globalAlpha = 1;
  });
  const sc = 0.95 * s;
  ctx.fillStyle = 'rgba(0,0,0,.28)'; ctx.beginPath(); ctx.ellipse(p.x, gy + 40 * sc, 28 * sc * clamp(1 - (gy - p.y) / (700 * s), 0.35, 1), 6 * sc, 0, 0, TAU); ctx.fill();
  m.focus = { x: p.x, y: p.y - 30 * sc };
  drawSideGiraffe(ctx, p.x, p.y, sc, { flip: p.face < 0, air: p.y < gy - 4, ph: 0, rot: clamp(p.vy / 4000, -0.15, 0.2) * p.face, alpha: m.inv > 0 && Math.floor(t * 14) % 2 ? 0.5 : 1 });
  if (m.big > 0){ ctx.strokeStyle = 'rgba(255,255,255,' + m.big + ')'; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(p.x, gy + 38 * sc, (0.5 - m.big) * 160 * s + 20 * s, 8 * s, 0, 0, TAU); ctx.stroke(); }
};

/* ---- 9. Acid-Rain Shelter ---- */
function artAcidBg(c, W, H, s, R){
  const gr = c.createLinearGradient(0, 0, W, H); gr.addColorStop(0, '#8A5A22'); gr.addColorStop(0.5, '#B8803A'); gr.addColorStop(1, '#7A4C1E'); c.fillStyle = gr; c.fillRect(0, 0, W, H);
  for (let i = 0; i < 70; i++){ c.fillStyle = R() < 0.5 ? 'rgba(60,34,12,.22)' : 'rgba(230,180,100,.16)'; c.beginPath(); c.ellipse(R() * W, R() * H, (30 + R() * 110) * s, (10 + R() * 40) * s, R() * 3, 0, TAU); c.fill(); }
  c.lineCap = 'round';
  for (let i = 0; i < 26; i++){                                         /* cracked ground, glowing faintly */
    let x = R() * W, y = R() * H, a = R() * TAU;
    for (let k = 0; k < 7; k++){
      const nx = x + Math.cos(a) * (22 + R() * 34) * s, ny = y + Math.sin(a) * (22 + R() * 34) * s;
      c.strokeStyle = 'rgba(30,16,6,.7)'; c.lineWidth = 2.2; c.beginPath(); c.moveTo(x, y); c.lineTo(nx, ny); c.stroke();
      c.strokeStyle = 'rgba(210,230,80,.28)'; c.lineWidth = 1; c.beginPath(); c.moveTo(x, y); c.lineTo(nx, ny); c.stroke();
      x = nx; y = ny; a += (R() - 0.5) * 0.9;
    }
  }
  for (let i = 0; i < 30; i++){ const x = R() * W, y = R() * H, r = (6 + R() * 16) * s; c.fillStyle = 'rgba(0,0,0,.25)'; c.beginPath(); c.ellipse(x + 3, y + 4, r, r * 0.7, 0, 0, TAU); c.fill(); const rg = c.createRadialGradient(x - r * 0.3, y - r * 0.3, 1, x, y, r); rg.addColorStop(0, '#8E6A44'); rg.addColorStop(1, '#4A3220'); c.fillStyle = rg; c.beginPath(); c.ellipse(x, y, r, r * 0.8, 0, 0, TAU); c.fill(); }
}
MINI[9].draw = function(ctx, m, g){
  const s = g.s, W = g.W, H = g.H, t = G.time, p = m.p;
  miniLayer(ctx, m, g, 'acid', artAcidBg);
  const pud = m.pud || (m.pud = []);
  m.drops.forEach(function(d){ if (d.t >= d.warn && !d.pd){ d.pd = true; pud.push({ x: d.x, y: d.y, r: d.r * 0.8, t: t }); if (pud.length > 14) pud.shift(); miniRing(m, d.x, d.y, 'rgba(190,255,90,.9)', d.r * 1.15, 0.5); miniBurst(m, d.x, d.y, 8, '#C8F05A', { speed: 160, r: 3.4, life: 0.5, up: 90 }); } });
  for (let i = pud.length - 1; i >= 0; i--){
    const q = pud[i], k = (t - q.t) / 4.5; if (k >= 1){ pud.splice(i, 1); continue; }
    const a = 1 - k; const pg = ctx.createRadialGradient(q.x, q.y, 1, q.x, q.y, q.r); pg.addColorStop(0, 'rgba(210,255,90,' + a * 0.8 + ')'); pg.addColorStop(0.7, 'rgba(120,200,40,' + a * 0.6 + ')'); pg.addColorStop(1, 'rgba(60,110,20,0)');
    ctx.fillStyle = pg; ctx.beginPath(); ctx.arc(q.x, q.y, q.r, 0, TAU); ctx.fill();
    if (Math.random() < 0.12) miniBurst(m, q.x + rand(-q.r, q.r) * 0.6, q.y + rand(-q.r, q.r) * 0.6, 1, 'rgba(230,255,170,.7)', { speed: 14, g: -40, r: 5, life: 1.2, glow: false });
  }
  m.drops.forEach(function(d){
    if (d.t >= d.warn) return;
    const k = d.t / d.warn, pulse = 0.55 + 0.45 * Math.sin(t * 18);
    ctx.fillStyle = 'rgba(255,60,40,' + (0.1 + 0.2 * k) + ')'; ctx.beginPath(); ctx.arc(d.x, d.y, d.r, 0, TAU); ctx.fill();
    ctx.save(); ctx.beginPath(); ctx.arc(d.x, d.y, d.r, 0, TAU); ctx.clip(); ctx.strokeStyle = 'rgba(255,90,60,' + (0.25 * pulse) + ')'; ctx.lineWidth = 3; for (let q = -d.r * 2; q < d.r * 2; q += 14 * s){ ctx.beginPath(); ctx.moveTo(d.x + q, d.y - d.r); ctx.lineTo(d.x + q + d.r, d.y + d.r); ctx.stroke(); } ctx.restore();
    ctx.strokeStyle = 'rgba(255,90,60,' + pulse + ')'; ctx.lineWidth = 3.2; ctx.beginPath(); ctx.arc(d.x, d.y, d.r, 0, TAU); ctx.stroke();
    ctx.strokeStyle = 'rgba(255,230,160,.8)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(d.x, d.y, d.r * (1 - k), 0, TAU); ctx.stroke();
    miniText(ctx, '!', d.x, d.y + 8 * s, 22 * s, '#FFD0A0');
  });
  m.shel.forEach(function(q){
    miniShadow(ctx, q.x + 8, q.y + 11, q.r * 1.02, q.r * 0.82, 0.32);
    const bg = ctx.createRadialGradient(q.x - q.r * 0.35, q.y - q.r * 0.35, 3, q.x, q.y, q.r); bg.addColorStop(0, '#B8BED0'); bg.addColorStop(0.7, '#6A7288'); bg.addColorStop(1, '#3A4052');
    ctx.fillStyle = bg; ctx.beginPath(); ctx.arc(q.x, q.y, q.r, 0, TAU); ctx.fill();
    ctx.strokeStyle = '#2A2F3E'; ctx.lineWidth = 2.4; ctx.beginPath(); for (let k = 0; k < 8; k++){ const a = k * TAU / 8; ctx.moveTo(q.x, q.y); ctx.lineTo(q.x + Math.cos(a) * q.r, q.y + Math.sin(a) * q.r); } ctx.stroke();
    ctx.beginPath(); ctx.arc(q.x, q.y, q.r * 0.62, 0, TAU); ctx.stroke();
    ctx.fillStyle = 'rgba(180,230,255,.28)'; ctx.beginPath(); ctx.arc(q.x, q.y, q.r * 0.3, 0, TAU); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.45)'; ctx.beginPath(); ctx.ellipse(q.x - q.r * 0.3, q.y - q.r * 0.38, q.r * 0.3, q.r * 0.12, -0.7, 0, TAU); ctx.fill();
    for (let k = 0; k < 8; k++){ const a = k * TAU / 8 + 0.4; ctx.fillStyle = (Math.floor(t * 2) + k) % 3 === 0 ? '#FFE15A' : '#5A4A1A'; ctx.beginPath(); ctx.arc(q.x + Math.cos(a) * q.r * 0.9, q.y + Math.sin(a) * q.r * 0.9, 2.4 * s, 0, TAU); ctx.fill(); }
  });
  m.cry.forEach(function(c){
    const a = c.life < 2 ? 0.4 + 0.6 * Math.abs(Math.sin(t * 9)) : 1;
    ctx.globalAlpha = a; miniGlow(ctx, c.x, c.y, 42 * s, '255,230,120', 0.45);
    ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.beginPath(); ctx.ellipse(c.x + 4, c.y + 18 * s, 13 * s, 5 * s, 0, 0, TAU); ctx.fill();
    const cg = ctx.createLinearGradient(c.x - 12 * s, c.y, c.x + 12 * s, c.y); cg.addColorStop(0, '#E8B820'); cg.addColorStop(0.5, '#FFF0A0'); cg.addColorStop(1, '#D89A10');
    ctx.fillStyle = cg; ctx.beginPath(); ctx.moveTo(c.x, c.y - 22 * s); ctx.lineTo(c.x + 12 * s, c.y - 4 * s); ctx.lineTo(c.x + 7 * s, c.y + 16 * s); ctx.lineTo(c.x - 7 * s, c.y + 16 * s); ctx.lineTo(c.x - 12 * s, c.y - 4 * s); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,.8)'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(c.x, c.y - 22 * s); ctx.lineTo(c.x, c.y + 16 * s); ctx.moveTo(c.x - 12 * s, c.y - 4 * s); ctx.lineTo(c.x + 12 * s, c.y - 4 * s); ctx.stroke();
    ctx.globalAlpha = 1;
  });
  m.focus = { x: p.x, y: p.y };
  if (p.moving && Math.floor(t * 30) % 4 === 0) miniDust(m, p.x - Math.cos(p.ang) * 24 * s, p.y - Math.sin(p.ang) * 24 * s, 'rgba(230,190,120,.5)');
  drawTopGiraffe(ctx, p.x, p.y, p.ang, 0.9 * s, p.ph, { moving: p.moving, alpha: m.inv > 0 && Math.floor(t * 14) % 2 ? 0.5 : 1 });
  ctx.strokeStyle = 'rgba(210,255,120,.4)'; ctx.lineWidth = 1.5; ctx.beginPath();
  m.rain.forEach(function(u){ const y = (u.y + t * 460) % H, x = (u.x - t * 70 + W * 2) % W; ctx.moveTo(x, y); ctx.lineTo(x - 5, y + 16 * s); }); ctx.stroke();
  const hz = ctx.createLinearGradient(0, 0, 0, H); hz.addColorStop(0, 'rgba(240,210,90,.22)'); hz.addColorStop(1, 'rgba(200,120,30,.05)'); ctx.fillStyle = hz; ctx.fillRect(0, 0, W, H);
  const fl = Math.sin(t * 0.9) * Math.sin(t * 2.3); if (fl > 0.93){ ctx.fillStyle = 'rgba(255,255,220,' + (fl - 0.93) * 4 + ')'; ctx.fillRect(0, 0, W, H); }
};

/* ---- 10. Cool-Down Relay ---- */
function artLavaBg(c, W, H, s, R){
  c.fillStyle = '#2A1F1C'; c.fillRect(0, 0, W, H);
  for (let i = 0; i < 80; i++){ c.fillStyle = R() < 0.5 ? 'rgba(10,6,4,.4)' : 'rgba(90,70,60,.2)'; c.beginPath(); c.ellipse(R() * W, R() * H, (16 + R() * 60) * s, (8 + R() * 28) * s, R() * 3, 0, TAU); c.fill(); }
  c.lineCap = 'round';
  for (let i = 0; i < 40; i++){
    let x = R() * W, y = R() * H, a = R() * TAU;
    for (let k = 0; k < 5; k++){ const nx = x + Math.cos(a) * (14 + R() * 24) * s, ny = y + Math.sin(a) * (14 + R() * 24) * s; c.strokeStyle = 'rgba(255,110,30,.45)'; c.lineWidth = 3; c.beginPath(); c.moveTo(x, y); c.lineTo(nx, ny); c.stroke(); c.strokeStyle = 'rgba(0,0,0,.6)'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(x, y); c.lineTo(nx, ny); c.stroke(); x = nx; y = ny; a += (R() - 0.5); }
  }
  for (let i = 0; i < 60; i++){ const x = R() * W, y = R() * H, r = (4 + R() * 12) * s; const rg = c.createRadialGradient(x - r * 0.3, y - r * 0.3, 1, x, y, r); rg.addColorStop(0, '#6A5C54'); rg.addColorStop(1, '#241C18'); c.fillStyle = rg; c.beginPath(); c.ellipse(x, y, r, r * 0.8, R() * 3, 0, TAU); c.fill(); }
}
MINI[10].draw = function(ctx, m, g){
  const s = g.s, W = g.W, H = g.H, t = G.time, p = m.p, L = m.riverL, Rr = m.riverR;
  miniLayer(ctx, m, g, 'lava', artLavaBg);
  /* the river of lava: a moving crust over a bright core */
  const lg = ctx.createLinearGradient(L, 0, Rr, 0); lg.addColorStop(0, '#C23E10'); lg.addColorStop(0.5, '#FF8A1E'); lg.addColorStop(1, '#C23E10');
  ctx.fillStyle = lg; ctx.fillRect(L, 0, Rr - L, H);
  ctx.save(); ctx.beginPath(); ctx.rect(L, 0, Rr - L, H); ctx.clip();
  for (let k = 0; k < 22; k++){ const x = L + ((k * 61) % (Rr - L)), y = ((k * 97 + t * (24 + (k % 4) * 10)) % (H + 100)) - 50, w = (26 + (k % 5) * 12) * s; ctx.fillStyle = 'rgba(70,16,4,' + (0.35 + (k % 3) * 0.1) + ')'; ctx.beginPath(); ctx.ellipse(x, y, w, w * 0.45, 0.5 + k, 0, TAU); ctx.fill(); ctx.strokeStyle = 'rgba(255,220,100,.55)'; ctx.lineWidth = 2; ctx.stroke(); }
  for (let k = 0; k < 12; k++){ const ph = ((t * 0.7 + k * 0.37) % 1), x = L + ((k * 83) % (Rr - L)), y = (k * 131) % H; ctx.strokeStyle = 'rgba(255,240,150,' + (0.7 * (1 - ph)) + ')'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(x, y, 3 + ph * 14 * s, 0, TAU); ctx.stroke(); }
  ctx.restore();
  miniGlow(ctx, (L + Rr) / 2, H / 2, Math.max(W, H) * 0.7, '255,100,20', 0.12);
  ctx.strokeStyle = 'rgba(255,150,60,.25)'; ctx.lineWidth = 2; ctx.beginPath();                        /* heat shimmer */
  for (let k = 0; k < 4; k++){ const x = L + (k + 0.5) * (Rr - L) / 4; ctx.moveTo(x, 0); for (let y = 0; y <= H; y += 18) ctx.lineTo(x + Math.sin(y * 0.05 + t * 3 + k) * 6 * s, y); } ctx.stroke();
  /* the well and the fire pit */
  const wx = L - 70 * s, wy = H * 0.55, fx = Rr + 70 * s;
  ctx.fillStyle = 'rgba(0,0,0,.4)'; ctx.beginPath(); ctx.ellipse(wx + 6, wy + 8, 60 * s, 52 * s, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = '#7A7268'; ctx.beginPath(); ctx.arc(wx, wy, 52 * s, 0, TAU); ctx.fill();
  for (let k = 0; k < 14; k++){ const a = k * TAU / 14; ctx.fillStyle = k % 2 ? '#928A7E' : '#6A625A'; ctx.beginPath(); ctx.ellipse(wx + Math.cos(a) * 44 * s, wy + Math.sin(a) * 44 * s, 11 * s, 7 * s, a, 0, TAU); ctx.fill(); }
  const wg = ctx.createRadialGradient(wx - 8, wy - 8, 2, wx, wy, 34 * s); wg.addColorStop(0, '#7CC6EE'); wg.addColorStop(1, '#2A6EA8'); ctx.fillStyle = wg; ctx.beginPath(); ctx.arc(wx, wy, 34 * s, 0, TAU); ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,.5)'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.arc(wx, wy, 10 * s + ((t * 8) % 18) * s, 0, TAU); ctx.stroke();
  miniText(ctx, 'WELL', wx, wy + 78 * s, 15 * s, '#BFE8FF');
  ctx.fillStyle = 'rgba(0,0,0,.4)'; ctx.beginPath(); ctx.ellipse(fx + 6, wy + 8, 62 * s, 54 * s, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = '#4A423C'; ctx.beginPath(); ctx.arc(fx, wy, 54 * s, 0, TAU); ctx.fill();
  for (let k = 0; k < 12; k++){ const a = k * TAU / 12; ctx.fillStyle = k % 2 ? '#6A625A' : '#3E3834'; ctx.beginPath(); ctx.ellipse(fx + Math.cos(a) * 46 * s, wy + Math.sin(a) * 46 * s, 11 * s, 7 * s, a, 0, TAU); ctx.fill(); }
  ctx.fillStyle = '#1A1210'; ctx.beginPath(); ctx.arc(fx, wy, 34 * s, 0, TAU); ctx.fill();
  ctx.strokeStyle = '#3A2414'; ctx.lineWidth = 7 * s; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(fx - 22 * s, wy + 10 * s); ctx.lineTo(fx + 22 * s, wy - 10 * s); ctx.moveTo(fx - 20 * s, wy - 12 * s); ctx.lineTo(fx + 20 * s, wy + 12 * s); ctx.stroke(); ctx.lineCap = 'butt';
  miniGlow(ctx, fx, wy, 110 * s, '255,120,30', 0.4);
  for (let k = 0; k < 6; k++){ const a = k * 1.05, fl = (30 + 16 * Math.sin(t * 8 + k * 2)) * s, bx = fx + Math.cos(a) * 14 * s, by = wy + Math.sin(a) * 10 * s; const fg = ctx.createLinearGradient(0, by, 0, by - fl); fg.addColorStop(0, '#FFE070'); fg.addColorStop(0.5, '#FF7A1E'); fg.addColorStop(1, 'rgba(220,40,10,0)'); ctx.fillStyle = fg; ctx.beginPath(); ctx.moveTo(bx - 9 * s, by); ctx.quadraticCurveTo(bx + Math.sin(t * 6 + k) * 4 * s, by - fl * 0.6, bx, by - fl); ctx.quadraticCurveTo(bx + 5 * s, by - fl * 0.5, bx + 9 * s, by); ctx.closePath(); ctx.fill(); }
  miniText(ctx, 'FIRE', fx, wy + 80 * s, 15 * s, '#FFD0A0');
  if (Math.random() < 0.3) miniBurst(m, fx + rand(-20, 20) * s, wy, 1, '#FFB347', { ang: -Math.PI / 2, spread: 1, speed: 80, r: 2.2, life: 0.9, g: -30 });
  /* stones */
  m.stones.forEach(function(q){
    const r = m.stoneR;
    ctx.fillStyle = 'rgba(0,0,0,.4)'; ctx.beginPath(); ctx.ellipse(q.x + 4, q.y + 7, r, r * 0.9, 0, 0, TAU); ctx.fill();
    miniGlow(ctx, q.x, q.y, r * 1.5, '255,120,30', 0.3);
    const sg = ctx.createRadialGradient(q.x - r * 0.35, q.y - r * 0.4, 2, q.x, q.y, r); sg.addColorStop(0, '#9A8E84'); sg.addColorStop(0.7, '#5E544C'); sg.addColorStop(1, '#2C2622');
    ctx.fillStyle = sg; ctx.beginPath(); ctx.arc(q.x, q.y, r, 0, TAU); ctx.fill();
    ctx.strokeStyle = 'rgba(255,140,60,.55)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(q.x, q.y, r - 1, 0.4, 2.3); ctx.stroke();
    ctx.strokeStyle = 'rgba(20,14,10,.55)'; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(q.x - r * 0.4, q.y - r * 0.1); ctx.lineTo(q.x, q.y + r * 0.15); ctx.lineTo(q.x + r * 0.3, q.y - r * 0.4); ctx.moveTo(q.x, q.y + r * 0.15); ctx.lineTo(q.x + r * 0.1, q.y + r * 0.6); ctx.stroke();
  });
  m.focus = { x: p.x, y: p.y };
  if (p.moving && Math.floor(t * 30) % 4 === 0) miniDust(m, p.x - Math.cos(p.ang) * 24 * s, p.y - Math.sin(p.ang) * 24 * s, 'rgba(255,170,90,.4)');
  drawTopGiraffe(ctx, p.x, p.y, p.ang, 0.9 * s, p.ph, { moving: p.moving, alpha: p.stun > 0 && Math.floor(t * 14) % 2 ? 0.5 : 1 });
  if (m.carry.on){                                                    /* the bucket on her back, with its water draining away */
    const k = clamp(m.carry.t / 11, 0, 1), bx = p.x - 4 * s, by = p.y - 24 * s;
    ctx.fillStyle = '#7A4A20'; ctx.beginPath(); ctx.moveTo(bx - 9 * s, by - 9 * s); ctx.lineTo(bx + 9 * s, by - 9 * s); ctx.lineTo(bx + 7 * s, by + 8 * s); ctx.lineTo(bx - 7 * s, by + 8 * s); ctx.closePath(); ctx.fill();
    ctx.fillStyle = k > 0.3 ? '#4FB5F0' : '#FF9A4A'; ctx.fillRect(bx - 7.5 * s, by - 9 * s + (1 - k) * 16 * s, 15 * s, k * 16 * s);
    ctx.strokeStyle = '#D8D0C0'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.arc(bx, by - 9 * s, 9 * s, Math.PI, TAU); ctx.stroke();
    if (k < 0.5 && Math.floor(t * 10) % 3 === 0) miniDust(m, bx, by - 14 * s, 'rgba(255,255,255,.55)');
  }
  const ig = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.3, W / 2, H / 2, Math.max(W, H) * 0.7); ig.addColorStop(0, 'rgba(255,100,20,0)'); ig.addColorStop(1, 'rgba(30,6,0,.35)'); ctx.fillStyle = ig; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = '#FFB347';                                          /* embers rising */
  for (let k = 0; k < 26; k++){ const x = (k * 53.7 + Math.sin(t * 0.8 + k) * 20) % W, y = H - ((t * (30 + (k % 5) * 14) + k * 61) % (H + 20)); ctx.globalAlpha = 0.35 + (k % 3) * 0.2; ctx.fillRect(x, y, 2.2 * s, 2.2 * s); }
  ctx.globalAlpha = 1;
};

/* ---- 11. Echo Crystals ---- */
function artCaveBg(c, W, H, s, R){
  const gr = c.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, '#0C0820'); gr.addColorStop(0.6, '#241846'); gr.addColorStop(1, '#3A2A62'); c.fillStyle = gr; c.fillRect(0, 0, W, H);
  for (let i = 0; i < 8; i++){ const x = R() * W, y = R() * H * 0.7, r = (90 + R() * 160) * s; const g2 = c.createRadialGradient(x, y, 0, x, y, r); g2.addColorStop(0, 'rgba(130,90,220,.18)'); g2.addColorStop(1, 'rgba(130,90,220,0)'); c.fillStyle = g2; c.fillRect(x - r, y - r, r * 2, r * 2); }
  c.fillStyle = '#07050F';                                              /* stalactites */
  for (let layer = 0; layer < 2; layer++){ c.globalAlpha = layer ? 1 : 0.6; let x = -10; while (x < W + 20){ const w = (26 + R() * 50) * s, h = (30 + R() * 90) * s * (layer ? 1 : 0.7); c.beginPath(); c.moveTo(x, 0); c.lineTo(x + w, 0); c.lineTo(x + w * 0.55, h); c.closePath(); c.fill(); x += w * 0.75; } }
  c.globalAlpha = 1;
  const cols = ['#B58CFF', '#6AD0FF', '#FF8AB8', '#8CFFB8'];
  for (let i = 0; i < 26; i++){ const x = R() * W, y = H * 0.72 + R() * H * 0.28, h = (8 + R() * 22) * s, col = cols[i % 4]; c.fillStyle = col; c.globalAlpha = 0.5; c.beginPath(); c.moveTo(x, y); c.lineTo(x + h * 0.25, y - h); c.lineTo(x + h * 0.5, y); c.closePath(); c.fill(); }
  c.globalAlpha = 1;
  const fg = c.createLinearGradient(0, H * 0.72, 0, H); fg.addColorStop(0, '#1C1336'); fg.addColorStop(1, '#0C0818'); c.fillStyle = fg; c.fillRect(0, H * 0.74, W, H * 0.26);
}
MINI[11].draw = function(ctx, m, g){
  const s = g.s, W = g.W, H = g.H, t = G.time, pos = echoPos(g);
  miniLayer(ctx, m, g, 'cave', artCaveBg);
  if (m.lit !== m._litSeen){ m._litSeen = m.lit; if (m.lit >= 0){ miniRing(m, pos[m.lit].x, pos[m.lit].y + 30 * s, ECHO_COL[m.lit], 120 * s, 0.7); miniBurst(m, pos[m.lit].x, pos[m.lit].y - 20 * s, 12, ECHO_COL[m.lit], { speed: 190, r: 3.6, life: 0.8, up: 120, g: 120 }); } }
  const fy = H * 0.74;
  ctx.fillStyle = 'rgba(255,255,255,.06)'; for (let k = 0; k < 30; k++){ const x = (k * 71 + Math.sin(t * 0.3 + k) * 30 + t * 6) % W, y = (k * 47 + Math.cos(t * 0.4 + k) * 25) % (H * 0.7); ctx.beginPath(); ctx.arc(x, y, (1 + (k % 3)) * s, 0, TAU); ctx.fill(); }
  for (let i = 0; i < 5; i++){
    const c = pos[i], on = m.lit === i, col = ECHO_COL[i], r = 40 * s, pulse = on ? 1 : 0.3 + 0.12 * Math.sin(t * 2 + i);
    ctx.fillStyle = col; ctx.globalAlpha = on ? 0.5 : 0.12; ctx.beginPath(); ctx.ellipse(c.x, c.y + r * 1.15, r * (on ? 2.6 : 1.5), r * 0.55, 0, 0, TAU); ctx.fill(); ctx.globalAlpha = 1;
    if (on){ const bm = ctx.createLinearGradient(0, c.y - r * 3.5, 0, c.y); bm.addColorStop(0, 'rgba(255,255,255,0)'); bm.addColorStop(1, 'rgba(255,255,255,.35)'); ctx.fillStyle = bm; ctx.beginPath(); ctx.moveTo(c.x - r * 0.6, c.y); ctx.lineTo(c.x - r * 1.4, c.y - r * 3.5); ctx.lineTo(c.x + r * 1.4, c.y - r * 3.5); ctx.lineTo(c.x + r * 0.6, c.y); ctx.closePath(); ctx.fill(); }
    miniGlow(ctx, c.x, c.y - r * 0.2, r * (on ? 3.2 : 1.8), hexRgb(col), on ? 0.55 : 0.16);
    ctx.save(); ctx.translate(c.x, c.y);
    [[-0.9, 0.5, 0.45, -0.25], [0.95, 0.55, 0.38, 0.3]].forEach(function(q){ ctx.fillStyle = col; ctx.globalAlpha = 0.55; ctx.beginPath(); ctx.moveTo(q[0] * r, r * 1.05); ctx.lineTo(q[0] * r + q[3] * r, r * 1.05 - r * q[1] * 1.7); ctx.lineTo(q[0] * r + r * 0.28, r * 1.05); ctx.closePath(); ctx.fill(); ctx.globalAlpha = 1; });
    const pts = [[0, -r * 1.55], [r * 0.78, -r * 0.35], [r * 0.58, r * 1.1], [-r * 0.58, r * 1.1], [-r * 0.78, -r * 0.35]];
    ctx.fillStyle = shade(col, on ? 0.55 : -0.35); ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]); for (let k = 1; k < 5; k++) ctx.lineTo(pts[k][0], pts[k][1]); ctx.closePath(); ctx.fill();
    ctx.fillStyle = shade(col, on ? 0.8 : 0.0); ctx.beginPath(); ctx.moveTo(0, -r * 1.55); ctx.lineTo(-r * 0.78, -r * 0.35); ctx.lineTo(-r * 0.58, r * 1.1); ctx.lineTo(-r * 0.05, r * 1.1); ctx.lineTo(0, -r * 0.35); ctx.closePath(); ctx.fill();
    ctx.fillStyle = shade(col, on ? 0.2 : -0.5); ctx.beginPath(); ctx.moveTo(0, -r * 0.35); ctx.lineTo(r * 0.78, -r * 0.35); ctx.lineTo(r * 0.58, r * 1.1); ctx.lineTo(-r * 0.05, r * 1.1); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = on ? '#FFFFFF' : 'rgba(255,255,255,.35)'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]); for (let k = 1; k < 5; k++) ctx.lineTo(pts[k][0], pts[k][1]); ctx.closePath(); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, -r * 0.35); ctx.lineTo(-r * 0.78, -r * 0.35); ctx.moveTo(0, -r * 0.35); ctx.lineTo(r * 0.78, -r * 0.35); ctx.moveTo(0, -r * 0.35); ctx.lineTo(-r * 0.05, r * 1.1); ctx.stroke();
    ctx.restore();
    ctx.save(); ctx.globalAlpha = on ? 0.3 : 0.1; ctx.translate(c.x, c.y + r * 2.3); ctx.scale(1, -0.4); ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(0, -r * 1.55 + r); ctx.lineTo(r * 0.7, -r * 0.2 + r); ctx.lineTo(r * 0.5, r * 1.1 + r); ctx.lineTo(-r * 0.5, r * 1.1 + r); ctx.lineTo(-r * 0.7, -r * 0.2 + r); ctx.closePath(); ctx.fill(); ctx.restore();
    miniText(ctx, String(i + 1), c.x, c.y + r * 2.3 + 22 * s, 15 * s, on ? '#FFFFFF' : '#CFC0F0');
  }
  miniText(ctx, m.msg, W / 2, H * 0.2, 26 * s, '#FFFFFF');
  const bw = 22 * s; for (let i = 0; i < m.len; i++){ ctx.fillStyle = i < (m.mode === 'input' ? m.idx : 0) ? '#BFFF9A' : 'rgba(255,255,255,.3)'; ctx.fillRect(W / 2 - m.len * bw / 2 + i * bw + 2, H * 0.2 + 20 * s, bw - 4, 7 * s); }
  m.focus = { x: Input.sx, y: Input.sy };
  drawSideGiraffe(ctx, W * 0.12, fy - 2, 0.75 * s, { ph: 0, lean: Math.sin(t * 1.5) * 2 });
};
function hexRgb(h){ const c = colRGB(h); return c[0] + ',' + c[1] + ',' + c[2]; }

/* ---- 12. Hack the Grid ---- */
function artGridBg(c, W, H, s, R){
  c.fillStyle = '#071614'; c.fillRect(0, 0, W, H);
  c.lineCap = 'round';
  for (let i = 0; i < 70; i++){                                         /* circuit traces */
    let x = Math.round(R() * W / 18) * 18, y = Math.round(R() * H / 18) * 18, d = (R() * 4) | 0;
    c.strokeStyle = 'rgba(60,200,150,' + (0.08 + R() * 0.12) + ')'; c.lineWidth = 2; c.beginPath(); c.moveTo(x, y);
    for (let k = 0; k < 5; k++){ const l = (2 + (R() * 5 | 0)) * 18; x += [l, 0, -l, 0][d]; y += [0, l, 0, -l][d]; c.lineTo(x, y); d = (d + (R() < 0.5 ? 1 : 3)) % 4; }
    c.stroke(); c.fillStyle = 'rgba(80,230,170,.25)'; c.beginPath(); c.arc(x, y, 3.4, 0, TAU); c.fill();
  }
  for (let i = 0; i < 9; i++){ const x = R() * W, y = R() * H, w = (40 + R() * 70) * s, h = (24 + R() * 40) * s; c.fillStyle = 'rgba(8,36,30,.9)'; c.fillRect(x, y, w, h); c.strokeStyle = 'rgba(80,230,170,.25)'; c.strokeRect(x, y, w, h); c.fillStyle = 'rgba(80,230,170,.25)'; for (let k = 0; k < 6; k++){ c.fillRect(x - 4, y + 4 + k * (h - 8) / 6, 4, 2); c.fillRect(x + w, y + 4 + k * (h - 8) / 6, 4, 2); } }
  c.fillStyle = 'rgba(40,160,120,.07)'; c.font = '900 ' + Math.round(110 * s) + 'px Arial Black, Impact, sans-serif'; c.textAlign = 'center'; c.fillText('AREA 51', W / 2, H * 0.62);
  c.save(); c.beginPath(); c.rect(0, 0, W, H); c.rect(10, 56 * s, W - 20, H - 66 * s); c.clip('evenodd');       /* hazard stripes round the edge */
  c.fillStyle = '#C8A020'; c.fillRect(0, 0, W, H); c.fillStyle = '#12100A'; for (let x = -H; x < W + H; x += 30) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x + 15, 0); c.lineTo(x + 15 - H, H); c.lineTo(x - H, H); c.closePath(); c.fill(); }
  c.restore();
}
MINI[12].draw = function(ctx, m, g){
  const s = g.s, W = g.W, H = g.H, t = G.time, geo = hgGeom(m, g), ts = geo.ts;
  miniLayer(ctx, m, g, 'grid', artGridBg);
  const sy = geo.y0 + m.r0 * ts + ts / 2, ey = geo.y0 + m.r1 * ts + ts / 2, rx = geo.x0 + m.cols * ts + 34 * s;
  /* the generator on the left feeds the first tile */
  ctx.fillStyle = '#10342C'; ctx.fillRect(geo.x0 - 56 * s, sy - 28 * s, 44 * s, 56 * s); ctx.strokeStyle = '#6CFFB0'; ctx.lineWidth = 2; ctx.strokeRect(geo.x0 - 56 * s, sy - 28 * s, 44 * s, 56 * s);
  ctx.fillStyle = '#FFE066'; ctx.beginPath(); ctx.moveTo(geo.x0 - 44 * s, sy - 14 * s); ctx.lineTo(geo.x0 - 30 * s, sy); ctx.lineTo(geo.x0 - 44 * s, sy + 14 * s); ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,160,.8)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(geo.x0 - 12 * s, sy); for (let k = 1; k <= 5; k++) ctx.lineTo(geo.x0 - 12 * s + k * (12 * s) / 5, sy + (k % 2 ? -1 : 1) * 4 * s * (0.5 + Math.sin(t * 30 + k))); ctx.stroke();
  ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.fillRect(geo.x0 - 4, geo.y0 - 4, m.cols * ts + 8, m.rows * ts + 8);
  for (let r = 0; r < m.rows; r++) for (let c = 0; c < m.cols; c++){
    const x = geo.x0 + c * ts, y = geo.y0 + r * ts, cx = x + ts / 2, cy = y + ts / 2, mk = m.tiles[r][c], on = m.pw[r][c], cur = m.cur.c === c && m.cur.r === r;
    const pg = ctx.createLinearGradient(x, y, x + ts, y + ts); pg.addColorStop(0, on ? '#164A3C' : '#143430'); pg.addColorStop(1, on ? '#0C2E26' : '#0A2220');
    ctx.fillStyle = pg; ctx.fillRect(x + 3, y + 3, ts - 6, ts - 6);
    ctx.fillStyle = 'rgba(255,255,255,.08)'; ctx.fillRect(x + 3, y + 3, ts - 6, 3); ctx.fillRect(x + 3, y + 3, 3, ts - 6);
    ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.fillRect(x + 3, y + ts - 6, ts - 6, 3); ctx.fillRect(x + ts - 6, y + 3, 3, ts - 6);
    ctx.fillStyle = 'rgba(120,200,170,.25)'; [[7, 7], [ts - 10, 7], [7, ts - 10], [ts - 10, ts - 10]].forEach(function(q){ ctx.fillRect(x + q[0], y + q[1], 3, 3); });
    if (on) miniGlow(ctx, cx, cy, ts * 0.8, '80,255,170', 0.16);
    const L = ts / 2 - 4, dirs = [[HG_N, 0, -1], [HG_E, 1, 0], [HG_S, 0, 1], [HG_W, -1, 0]];
    ctx.lineCap = 'round';
    dirs.forEach(function(d){
      if (!(mk & d[0])) return;
      if (on){ ctx.strokeStyle = 'rgba(80,255,170,.35)'; ctx.lineWidth = Math.max(9, ts * 0.2); ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + d[1] * L, cy + d[2] * L); ctx.stroke(); }
      ctx.strokeStyle = on ? '#8CFFC8' : '#3F706A'; ctx.lineWidth = Math.max(5, ts * 0.11); ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + d[1] * L, cy + d[2] * L); ctx.stroke();
      if (on){ const u = (t * 1.4 + (r * 3 + c) * 0.13) % 1; ctx.fillStyle = '#FFFFFF'; ctx.beginPath(); ctx.arc(cx + d[1] * L * u, cy + d[2] * L * u, Math.max(2, ts * 0.04), 0, TAU); ctx.fill(); }
    });
    ctx.lineCap = 'butt';
    ctx.fillStyle = on ? '#E8FFF4' : '#6FA098'; ctx.beginPath(); ctx.arc(cx, cy, ts * 0.11, 0, TAU); ctx.fill();
    if (cur){ ctx.strokeStyle = '#FFE066'; ctx.lineWidth = 3; ctx.strokeRect(x + 2, y + 2, ts - 4, ts - 4); ctx.strokeStyle = 'rgba(255,224,102,.4)'; ctx.lineWidth = 6; ctx.strokeRect(x, y, ts, ts); }
  }
  /* the reactor on the right */
  const rr = 26 * s, core = m.solved ? '#8CFFC8' : '#3A6A60';
  ctx.fillStyle = '#10342C'; ctx.beginPath(); ctx.arc(rx, ey, rr + 10 * s, 0, TAU); ctx.fill();
  ctx.strokeStyle = m.solved ? '#8CFFC8' : '#4E8A80'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(rx, ey, rr + 10 * s, 0, TAU); ctx.stroke();
  for (let k = 0; k < 3; k++){ const a = t * (m.solved ? 3 : 0.6) + k * TAU / 3; ctx.strokeStyle = core; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(rx, ey, rr - k * 6 * s, a, a + 2.2); ctx.stroke(); }
  if (m.solved) miniGlow(ctx, rx, ey, 90 * s, '110,255,190', 0.5);
  ctx.fillStyle = core; ctx.beginPath(); ctx.arc(rx, ey, 9 * s + (m.solved ? Math.sin(t * 12) * 2 : 0), 0, TAU); ctx.fill();
  miniText(ctx, 'REACTOR', rx, ey + rr + 28 * s, 12 * s, '#CFFFE4'); miniText(ctx, 'POWER', geo.x0 - 34 * s, sy - 38 * s, 12 * s, '#FFE066');
  m.focus = { x: Input.sx, y: Input.sy };
  ctx.fillStyle = 'rgba(0,0,0,.12)'; for (let y = 0; y < H; y += 4) ctx.fillRect(0, y, W, 1.5);
  ctx.fillStyle = 'rgba(80,255,170,' + (0.03 + 0.02 * Math.sin(t * 2)) + ')'; ctx.fillRect(0, (t * 60) % H, W, 40 * s);
};

/* ---- 13. Sandworm Escape ---- */
function artDuneTile(c, W, H, s, R){
  const gr = c.createLinearGradient(0, 0, W, 0); gr.addColorStop(0, '#C45E32'); gr.addColorStop(0.5, '#D2703E'); gr.addColorStop(1, '#BC5630'); c.fillStyle = gr; c.fillRect(0, 0, W, H);
  for (let i = 0; i < 6; i++){                                          /* dune crests: a lit side and a shaded side */
    const y = i * H / 6 + R() * 20 * s, amp = (14 + R() * 22) * s, ph = R() * 6;
    c.fillStyle = 'rgba(255,200,140,.2)'; c.beginPath(); c.moveTo(0, y); for (let x = 0; x <= W; x += 16) c.lineTo(x, y + Math.sin(x * 0.012 + ph) * amp); for (let x = W; x >= 0; x -= 16) c.lineTo(x, y + 18 * s + Math.sin(x * 0.012 + ph) * amp); c.closePath(); c.fill();
    c.fillStyle = 'rgba(90,30,10,.22)'; c.beginPath(); c.moveTo(0, y + 18 * s); for (let x = 0; x <= W; x += 16) c.lineTo(x, y + 18 * s + Math.sin(x * 0.012 + ph) * amp); for (let x = W; x >= 0; x -= 16) c.lineTo(x, y + 44 * s + Math.sin(x * 0.012 + ph) * amp); c.closePath(); c.fill();
  }
  for (let i = 0; i < 18; i++){ const y = (i + 0.5) * H / 18; c.strokeStyle = 'rgba(110,40,16,.35)'; c.lineWidth = 1.6; c.beginPath(); for (let x = 0; x <= W; x += 10) c.lineTo(x, y + Math.sin(x * 0.03 + i * 1.7) * 4 * s); c.stroke(); }
  for (let i = 0; i < 400; i++){ c.fillStyle = R() < 0.5 ? 'rgba(255,220,170,.28)' : 'rgba(80,26,8,.25)'; c.fillRect(R() * W, R() * H, 1.4, 1.4); }
}
MINI[13].draw = function(ctx, m, g){
  const s = g.s, W = g.W, H = g.H, t = G.time, p = m.p;
  const tile = miniBg(m, g, 'dune', artDuneTile, W, H), off = (m.dist * s) % H;
  ctx.drawImage(tile.cv, 0, off, W, H); ctx.drawImage(tile.cv, 0, off - H, W, H);
  const wy = H + 150 * s - (1 - m.gap / 100) * 300 * s * 1.25;           /* the worm comes up out of the sand behind her */
  m.rip.forEach(function(r){ ctx.strokeStyle = 'rgba(255,230,190,' + 0.5 * (1 - r.t / 1.6) + ')'; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(W / 2, wy, 70 * s + r.t * W * 0.5, 22 * s + r.t * 90 * s, 0, 0, TAU); ctx.stroke(); });
  ctx.fillStyle = 'rgba(40,12,4,.35)'; ctx.beginPath(); ctx.ellipse(W / 2, wy + 6, 190 * s, 70 * s, 0, 0, TAU); ctx.fill();
  const bodyY = wy - 20 * s;
  for (let k = 0; k < 7; k++){ const yy = bodyY - k * 34 * s, w = (150 - k * 4) * s, hh = 46 * s; const sg = ctx.createLinearGradient(W / 2 - w, 0, W / 2 + w, 0); sg.addColorStop(0, '#4A2014'); sg.addColorStop(0.45, k % 2 ? '#8A4A34' : '#9A5A40'); sg.addColorStop(1, '#3A180E'); ctx.fillStyle = sg; ctx.beginPath(); ctx.ellipse(W / 2, yy, w, hh, 0, 0, TAU); ctx.fill(); ctx.strokeStyle = 'rgba(20,8,4,.55)'; ctx.lineWidth = 2; ctx.stroke(); }
  const mg = ctx.createRadialGradient(W / 2, wy - 6 * s, 10 * s, W / 2, wy, 130 * s); mg.addColorStop(0, '#120604'); mg.addColorStop(1, '#5A2A1C');
  ctx.fillStyle = '#6A3424'; ctx.beginPath(); ctx.ellipse(W / 2, wy, 148 * s, 112 * s, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = mg; ctx.beginPath(); ctx.ellipse(W / 2, wy, 116 * s, 88 * s, 0, 0, TAU); ctx.fill();
  for (let ring = 0; ring < 3; ring++){ const n = 14 + ring * 4, rx = (112 - ring * 24) * s, ry = (84 - ring * 18) * s, ln = (20 - ring * 4) * s; ctx.fillStyle = ring % 2 ? '#E8D8B8' : '#F6EAD0'; for (let k = 0; k < n; k++){ const a = Math.PI + (k + 0.5) * Math.PI / n * 1; ctx.beginPath(); ctx.moveTo(W / 2 + Math.cos(a - 0.09) * rx, wy + Math.sin(a - 0.09) * ry); ctx.lineTo(W / 2 + Math.cos(a) * (rx - ln), wy + Math.sin(a) * (ry - ln * 0.75)); ctx.lineTo(W / 2 + Math.cos(a + 0.09) * rx, wy + Math.sin(a + 0.09) * ry); ctx.fill(); } }
  if (m.gap < 45 && Math.random() < 0.5) miniBurst(m, W / 2 + rand(-100, 100) * s, wy - 90 * s, 1, 'rgba(230,170,110,.7)', { ang: Math.PI / 2, spread: 0.6, speed: 90, r: 5, life: 0.7, g: 200, glow: false });
  if (m.gap < 30 && !Settings.calmFlash) addShake(2.5);
  m.rocks.forEach(function(r){
    ctx.fillStyle = 'rgba(40,12,4,.35)'; ctx.beginPath(); ctx.ellipse(r.x + r.r * 0.7, r.y + r.r * 0.55, r.r * 1.15, r.r * 0.6, -0.2, 0, TAU); ctx.fill();
    const rg = ctx.createRadialGradient(r.x - r.r * 0.35, r.y - r.r * 0.4, 2, r.x, r.y, r.r * 1.1); rg.addColorStop(0, '#C8906E'); rg.addColorStop(0.6, '#8A5238'); rg.addColorStop(1, '#4A2618');
    ctx.fillStyle = rg; ctx.beginPath(); ctx.arc(r.x, r.y, r.r, 0, TAU); ctx.fill();
    ctx.fillStyle = 'rgba(30,10,4,.3)'; ctx.beginPath(); ctx.arc(r.x + r.r * 0.25, r.y + r.r * 0.2, r.r * 0.32, 0, TAU); ctx.fill();
  });
  m.fl.forEach(function(f){
    miniGlow(ctx, f.x, f.y, 40 * s, '140,225,255', 0.5);
    ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.beginPath(); ctx.ellipse(f.x + 4, f.y + 16 * s, 10 * s, 4 * s, 0, 0, TAU); ctx.fill();
    const fg = ctx.createLinearGradient(f.x - 10 * s, 0, f.x + 10 * s, 0); fg.addColorStop(0, '#2E8AD0'); fg.addColorStop(0.5, '#9AE0FF'); fg.addColorStop(1, '#2E8AD0');
    ctx.fillStyle = fg; ctx.beginPath(); ctx.ellipse(f.x, f.y + 3 * s, 10 * s, 14 * s, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = '#8A6A44'; ctx.fillRect(f.x - 4 * s, f.y - 17 * s, 8 * s, 7 * s); ctx.fillStyle = '#C8A870'; ctx.fillRect(f.x - 5 * s, f.y - 19 * s, 10 * s, 3 * s);
    ctx.fillStyle = 'rgba(255,255,255,' + (0.4 + 0.5 * Math.sin(t * 6 + f.x)) + ')'; accStar(ctx, f.x + 11 * s, f.y - 10 * s, 4 * s, 4);
  });
  m.focus = { x: p.x, y: p.y };
  if (Math.floor(t * 60) % 2 === 0) miniBurst(m, p.x + rand(-6, 6) * s, p.y + 26 * s, 1, m.boost > 0 ? 'rgba(255,240,200,.8)' : 'rgba(230,170,110,.6)', { ang: Math.PI / 2, spread: 1.2, speed: 60 + (m.boost > 0 ? 80 : 0), r: 5, life: 0.7, g: 0, glow: false });
  drawTopGiraffe(ctx, p.x, p.y, -Math.PI / 2, 0.9 * s, p.ph, { moving: true, alpha: m.inv > 0 && Math.floor(t * 14) % 2 ? 0.5 : 1 });
  ctx.strokeStyle = 'rgba(255,225,180,.2)'; ctx.lineWidth = 1.6; ctx.beginPath();                    /* wind-blown sand */
  for (let k = 0; k < 14; k++){ const y = (k * 59 + t * 40) % H, x = ((k * 173 + t * 260) % (W + 200)) - 100; ctx.moveTo(x, y); ctx.lineTo(x + 50 * s, y + 6); } ctx.stroke();
  const bw = Math.min(280 * s, W * 0.5), bx = 14 * s, by = H - 34 * s, k = clamp(m.gap / 100, 0, 1);
  ctx.fillStyle = 'rgba(20,8,4,.7)'; ctx.fillRect(bx - 4, by - 26 * s, bw + 8, 44 * s);
  ctx.fillStyle = 'rgba(255,255,255,.12)'; ctx.fillRect(bx, by, bw, 14 * s);
  const bg = ctx.createLinearGradient(bx, 0, bx + bw, 0); bg.addColorStop(0, k > 0.35 ? '#6FD04A' : '#FF4A2A'); bg.addColorStop(1, k > 0.35 ? '#C8F070' : '#FF9A4A'); ctx.fillStyle = bg; ctx.fillRect(bx, by, bw * k, 14 * s);
  miniText(ctx, 'Distance from the worm', bx, by - 6 * s, 13 * s, '#FFE9C8', 'left');
};
