'use strict';
/* =============================================================================================================================
   44zzzs-minigames-late.js  --  THE MINIGAMES AFTER THE THREE LATER CHAPTERS THAT HAD NONE: Slide Dome (after 13.5, the Domes), Sandbag Run (after Chapter 15,
   the Siege) and Searchlight Sneak (after Chapter 16, Fort Shortneck). They are registered like Rush Hour (js/minigames/44zzzb-minigame-rush.js): the popup after
   the chapter, three stars in MINI_STAR, a hat or boots from the wheel, and a coat color for three stars (WARD 53 to 55, wardUnlocked in js/ui/44e-wardrobe.js).
   The three chapters end a run (the Domes, the Siege and the Fort are each played on their own), so the popup's way on is "See the results" (miniEndsRun).
   ============================================================================================================================= */
MINI_STAR[DOME_CHAPTER] = { t: [16, 20], lab: ['12', '16', '20'] };
MINI_STAR[SIEGE_CHAPTER] = { t: [18, 22], lab: ['14', '18', '22'] };
MINI_STAR[COUNTER_CHAPTER] = { t: [13, 16], lab: ['10', '13', '16'] };
MINI_STAR_CHAPTERS.push(DOME_CHAPTER, SIEGE_CHAPTER, COUNTER_CHAPTER);
WARD.push({ name: 'Dome Opal', c: '#B8E4E8' }, { name: 'Sandbag Tan', c: '#C8B078' }, { name: 'Hazard Yellow', c: '#F0C830' });          /* 53 to 55 */
function miniEndsRun(ch){ return ch === TOWER_CHAPTER || ch === DOME_CHAPTER || ch === SIEGE_CHAPTER || ch === COUNTER_CHAPTER; }

/* ---------- Slide Dome: the floor of a dome is ice, and she slides. Gather the glimmer shards, and keep clear of the frost wisps. ---------- */
registerMini({
  ch: DOME_CHAPTER, id: 'slide', name: 'Slide Dome', unit: 'shards', dur: 45, goal: 12,
  blurb: 'The floor of a dome is solid ice, and the glimmer shards that fell from the roof are lying all over it.\nGather them before the wisps find you.',
  hint: 'Move with WASD or the arrow keys, or hold the mouse button to slide toward the pointer.\nThe ice keeps you going a little after you let go.',
  touchHint: 'Drag your finger: she slides toward it.\nThe ice keeps her going a little after you let go.',
  goalText: 'Goal: gather 12 shards in 45 seconds',
  init: function(m, g){
    m.p = { x: g.W / 2, y: g.H * 0.55, vx: 0, vy: 0, ph: 0, moving: false }; m.lives = 3; m.inv = 0; m.shards = []; m.wisps = [];
    const R = miniRng(77), place = function(){ return { x: g.W * (0.1 + R() * 0.8), y: g.H * (0.16 + R() * 0.72), ph: R() * 6 }; };
    m.place = place; for (let i = 0; i < 3; i++) m.shards.push(place());
    for (let i = 0; i < 3; i++){ const a = R() * TAU; m.wisps.push({ x: g.W * (0.15 + R() * 0.7), y: g.H * (0.2 + R() * 0.3), vx: Math.cos(a) * 95 * g.s, vy: Math.sin(a) * 95 * g.s, ph: R() * 6 }); }
  },
  update: function(m, dt, g){
    const s = g.s, p = m.p, st = miniSteer(m, p.x, p.y);
    if (m.inv > 0) m.inv -= dt;
    const k = Math.min(1, dt * 2.1); p.vx += (st.x * 240 * s - p.vx) * k; p.vy += (st.y * 240 * s - p.vy) * k;
    p.x = clamp(p.x + p.vx * dt, 24 * s, g.W - 24 * s); p.y = clamp(p.y + p.vy * dt, g.H * 0.08, g.H * 0.94);
    p.moving = Math.hypot(p.vx, p.vy) > 20 * s; if (p.moving) p.ph += dt * 11;
    for (let i = 0; i < m.shards.length; i++){
      const q = m.shards[i]; q.ph += dt * 4;
      if (Math.hypot(q.x - p.x, q.y - p.y) < 28 * s){ m.score++; SFX.coin && SFX.coin(); miniPop(m, q.x, q.y - 10 * s, '+1', '#BFF4FF'); m.shards[i] = m.place(); if (m.score % 4 === 0 && m.wisps.length < 7){ const w0 = m.wisps[0]; m.wisps.push({ x: g.W * (m.score % 8 ? 0.1 : 0.9), y: g.H * 0.1, vx: 100 * s, vy: 70 * s, ph: 0 }); } }
    }
    for (let i = 0; i < m.wisps.length; i++){
      const w = m.wisps[i]; w.x += w.vx * dt; w.y += w.vy * dt; w.ph += dt * 6;
      if (w.x < 20 * s || w.x > g.W - 20 * s){ w.vx = -w.vx; w.x = clamp(w.x, 20 * s, g.W - 20 * s); }
      if (w.y < g.H * 0.08 || w.y > g.H * 0.94){ w.vy = -w.vy; w.y = clamp(w.y, g.H * 0.08, g.H * 0.94); }
      if (m.inv <= 0 && Math.hypot(w.x - p.x, w.y - p.y) < 24 * s){ miniHurt(m, p.x, p.y - 30 * s, 'Brrr!'); p.vx = (p.x - w.x) * 6; p.vy = (p.y - w.y) * 6; }
    }
  }
});
function slideFloor(c, w, h, s, rng){
  const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#CFE4F2'); g.addColorStop(1, '#E8F3FB'); c.fillStyle = g; c.fillRect(0, 0, w, h);
  c.strokeStyle = 'rgba(120,160,200,.3)'; c.lineWidth = 2; for (let x = 0; x < w; x += 140 * s){ c.beginPath(); c.moveTo(x, 0); c.lineTo(x - 60 * s, h); c.stroke(); } for (let y = 0; y < h; y += 110 * s){ c.beginPath(); c.moveTo(0, y); c.lineTo(w, y + 24 * s); c.stroke(); }
  for (let k = 0; k < 26; k++){ c.strokeStyle = 'rgba(255,255,255,' + (0.25 + rng() * 0.3).toFixed(2) + ')'; c.lineWidth = 1.5; const x = rng() * w, y = rng() * h; c.beginPath(); c.moveTo(x, y); c.lineTo(x + (20 + rng() * 40) * s, y + (rng() - 0.5) * 14 * s); c.stroke(); }
  c.strokeStyle = 'rgba(150,185,215,.7)'; c.lineWidth = 10 * s; c.strokeRect(5 * s, h * 0.06, w - 10 * s, h * 0.9);
}
MINI[DOME_CHAPTER].draw = function(ctx, m, g){
  const s = g.s, W = g.W, H = g.H, t = G.time, p = m.p;
  const tile = miniBg(m, g, 'slide', slideFloor, W, H); ctx.drawImage(tile.cv, 0, 0, W, H);
  m.shards.forEach(function(q){
    const b = Math.sin(q.ph) * 2 * s; miniGlow(ctx, q.x, q.y, 26 * s, '170,235,255', 0.5);
    ctx.fillStyle = '#7ADCF4'; ctx.beginPath(); ctx.moveTo(q.x, q.y - 14 * s + b); ctx.lineTo(q.x + 8 * s, q.y + b); ctx.lineTo(q.x, q.y + 14 * s + b); ctx.lineTo(q.x - 8 * s, q.y + b); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#E8FBFF'; ctx.beginPath(); ctx.moveTo(q.x, q.y - 14 * s + b); ctx.lineTo(q.x + 3 * s, q.y + b); ctx.lineTo(q.x, q.y + 2 * s + b); ctx.closePath(); ctx.fill();
  });
  m.wisps.forEach(function(w){
    miniGlow(ctx, w.x, w.y, 34 * s, '150,200,255', 0.45); ctx.fillStyle = 'rgba(230,242,255,.92)'; ctx.beginPath(); ctx.arc(w.x, w.y, 14 * s, 0, TAU); ctx.fill();
    ctx.fillStyle = 'rgba(200,225,255,.7)'; for (let k = 0; k < 5; k++){ const a = w.ph + k * TAU / 5; ctx.beginPath(); ctx.moveTo(w.x + Math.cos(a) * 12 * s, w.y + Math.sin(a) * 12 * s); ctx.lineTo(w.x + Math.cos(a) * 24 * s, w.y + Math.sin(a) * 24 * s); ctx.lineTo(w.x + Math.cos(a + 0.4) * 12 * s, w.y + Math.sin(a + 0.4) * 12 * s); ctx.fill(); }
    ctx.fillStyle = '#2A4A7A'; ctx.fillRect(w.x - 6 * s, w.y - 3 * s, 3 * s, 3 * s); ctx.fillRect(w.x + 3 * s, w.y - 3 * s, 3 * s, 3 * s);
  });
  m.focus = { x: p.x, y: p.y };
  drawTopGiraffe(ctx, p.x, p.y, Math.atan2(p.vy, p.vx || 0.001), 0.78 * s, p.ph, { moving: p.moving, alpha: m.inv > 0 && Math.floor(t * 14) % 2 ? 0.5 : 1 });
};

/* ---------- Sandbag Run: the wall is cracking in five places. Fetch a bag from the pile and plug a crack before it gives way. ---------- */
const SANDBAG_SLOTS = 5;
registerMini({
  ch: SIEGE_CHAPTER, id: 'sandbag', name: 'Sandbag Run', unit: 'cracks plugged', dur: 50, goal: 14,
  blurb: 'The barricade is cracking, and the cannons are not finished with it.\nFetch sandbags from the pile and plug every crack before the wall gives way.',
  hint: 'Move with WASD or the arrow keys, or hold the mouse button to walk toward the pointer.\nWalk onto the pile for a bag, then onto a glowing crack to plug it.',
  touchHint: 'Drag your finger: she walks toward it.\nWalk onto the pile for a bag, then onto a glowing crack to plug it.',
  goalText: 'Goal: plug 14 cracks in 50 seconds',
  init: function(m, g){
    m.p = { x: g.W / 2, y: g.H * 0.8, ph: 0, moving: false }; m.lives = 3; m.inv = 0; m.carry = false; m.crack = []; m.spawnT = 1;
    for (let i = 0; i < SANDBAG_SLOTS; i++) m.crack.push(0);                                   /* seconds a crack has been open, 0 for sound */
  },
  update: function(m, dt, g){
    const s = g.s, p = m.p, st = miniSteer(m, p.x, p.y);
    p.x = clamp(p.x + st.x * 240 * s * dt, 22 * s, g.W - 22 * s); p.y = clamp(p.y + st.y * 240 * s * dt, g.H * 0.2, g.H * 0.95);
    p.moving = !!(st.x || st.y); if (p.moving) p.ph += dt * 13;
    const slotX = function(i){ return g.W * (0.12 + i * 0.19); };
    if (!m.carry && Math.hypot(p.x - g.W / 2, p.y - g.H * 0.9) < 44 * s){ m.carry = true; miniPop(m, p.x, p.y - 34 * s, 'Got a bag', '#E8D8A0'); }
    m.spawnT -= dt;
    if (m.spawnT <= 0){
      const open = m.crack.filter(function(v){ return v > 0; }).length, free = []; m.crack.forEach(function(v, i){ if (!v) free.push(i); });
      if (free.length && open < 3) m.crack[free[Math.floor(Math.random() * free.length)]] = 0.001;
      m.spawnT = Math.max(1.1, 2.6 - m.time * 0.026);
    }
    for (let i = 0; i < SANDBAG_SLOTS; i++){
      if (!m.crack[i]) continue;
      m.crack[i] += dt;
      if (m.carry && Math.abs(p.x - slotX(i)) < 44 * s && p.y < g.H * 0.36){ m.crack[i] = 0; m.carry = false; m.score++; SFX.level && SFX.level(); miniPop(m, slotX(i), g.H * 0.22, 'Plugged!', '#BFFF9A'); continue; }
      if (m.crack[i] > 8){ m.crack[i] = 0; m.lives--; SFX.hurt(); addShake(8); screenFlash('#CF4433', 0.25, 0.25); miniPop(m, slotX(i), g.H * 0.24, 'The wall gave!', '#FF8A7A'); if (m.lives <= 0) m.over = true; }
    }
  }
});
function sandbagGround(c, w, h, s, rng){
  const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#8A6A50'); g.addColorStop(1, '#6A5040'); c.fillStyle = g; c.fillRect(0, 0, w, h);
  for (let k = 0; k < 90; k++){ c.fillStyle = 'rgba(' + (rng() < 0.5 ? '40,24,16' : '200,160,110') + ',' + (0.08 + rng() * 0.1).toFixed(2) + ')'; c.fillRect(rng() * w, h * 0.26 + rng() * h * 0.74, (3 + rng() * 9) * s, 2 * s); }
}
MINI[SIEGE_CHAPTER].draw = function(ctx, m, g){
  const s = g.s, W = g.W, H = g.H, t = G.time, p = m.p;
  const tile = miniBg(m, g, 'sandbag', sandbagGround, W, H); ctx.drawImage(tile.cv, 0, 0, W, H);
  ctx.fillStyle = '#4A4440'; ctx.fillRect(0, 0, W, H * 0.26); ctx.fillStyle = '#5E5650'; for (let r = 0; r < 4; r++) for (let x = (r % 2) * 30 * s - 30 * s; x < W; x += 60 * s) ctx.fillRect(x + 2 * s, r * H * 0.0625 + 2 * s, 56 * s, H * 0.0625 - 4 * s);
  ctx.fillStyle = '#2E2A28'; ctx.fillRect(0, H * 0.26, W, 6 * s);
  for (let i = 0; i < SANDBAG_SLOTS; i++){
    const x = W * (0.12 + i * 0.19), v = m.crack[i];
    if (v){ const u = Math.min(1, v / 8), pulse = 0.5 + 0.5 * Math.sin(t * (6 + u * 10)); miniGlow(ctx, x, H * 0.14, 60 * s, '255,' + Math.round(180 - u * 120) + ',70', 0.35 + u * 0.35 * pulse);
      ctx.fillStyle = '#1A1412'; ctx.beginPath(); ctx.moveTo(x - 4 * s, 0); ctx.lineTo(x + 8 * s, H * 0.07); ctx.lineTo(x - 6 * s, H * 0.14); ctx.lineTo(x + 6 * s, H * 0.21); ctx.lineTo(x - 2 * s, H * 0.26); ctx.lineTo(x - 14 * s, H * 0.2); ctx.lineTo(x - 2 * s, H * 0.13); ctx.lineTo(x - 14 * s, H * 0.07); ctx.closePath(); ctx.fill();
      ctx.fillStyle = 'rgba(255,' + Math.round(170 - u * 110) + ',60,' + (0.4 + 0.4 * pulse).toFixed(2) + ')'; ctx.fillRect(x - 3 * s, H * 0.05, 4 * s, H * 0.15); }
  }
  const px = W / 2, py = H * 0.9; ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.beginPath(); ctx.ellipse(px, py + 14 * s, 50 * s, 12 * s, 0, 0, TAU); ctx.fill();
  [[-26, 0], [0, 0], [26, 0], [-13, -13], [13, -13]].forEach(function(b){ ctx.fillStyle = '#C8B078'; ctx.beginPath(); ctx.ellipse(px + b[0] * s, py + b[1] * s, 15 * s, 9 * s, 0, 0, TAU); ctx.fill(); ctx.fillStyle = '#A89058'; ctx.fillRect(px + (b[0] - 6) * s, py + (b[1] - 1) * s, 12 * s, 2 * s); });
  m.focus = { x: p.x, y: p.y };
  drawTopGiraffe(ctx, p.x, p.y, -Math.PI / 2, 0.78 * s, p.ph, { moving: p.moving });
  if (m.carry){ ctx.fillStyle = '#C8B078'; ctx.beginPath(); ctx.ellipse(p.x, p.y - 26 * s, 14 * s, 8 * s, 0, 0, TAU); ctx.fill(); ctx.fillStyle = '#A89058'; ctx.fillRect(p.x - 6 * s, p.y - 27 * s, 12 * s, 2 * s); }
};

/* ---------- Searchlight Sneak: two searchlights sweep the yard, and the terminals that open the gate have to be hacked from close by. ---------- */
const SNEAK_SPOTS = [[0.14, 0.34], [0.86, 0.34], [0.3, 0.62], [0.7, 0.62], [0.5, 0.45], [0.14, 0.8], [0.86, 0.8]];
registerMini({
  ch: COUNTER_CHAPTER, id: 'sneak', name: 'Searchlight Sneak', unit: 'terminals hacked', dur: 50, goal: 10,
  blurb: 'Fort Shortneck has two searchlights and a lot to hide.\nCreep from terminal to terminal, hack each one, and stay out of the light.',
  hint: 'Move with WASD or the arrow keys, or hold the mouse button to walk toward the pointer.\nStand next to the glowing terminal until it opens. The lights turn faster as you go.',
  touchHint: 'Drag your finger: she walks toward it.\nStand next to the glowing terminal until it opens. The lights turn faster as you go.',
  goalText: 'Goal: hack 10 terminals in 50 seconds',
  init: function(m, g){
    m.p = { x: g.W / 2, y: g.H * 0.9, ph: 0, moving: false }; m.lives = 3; m.inv = 0; m.term = 4; m.hack = 0; m.beam = [{ a: 0.9, d: 1 }, { a: 2.2, d: -1 }];
  },
  update: function(m, dt, g){
    const s = g.s, p = m.p, st = miniSteer(m, p.x, p.y);
    if (m.inv > 0) m.inv -= dt;
    p.x = clamp(p.x + st.x * 230 * s * dt, 22 * s, g.W - 22 * s); p.y = clamp(p.y + st.y * 230 * s * dt, g.H * 0.18, g.H * 0.96);
    p.moving = !!(st.x || st.y); if (p.moving) p.ph += dt * 13;
    const sp = 0.55 + m.score * 0.045;
    m.beam.forEach(function(b, i){ b.a += b.d * sp * dt; if (b.a > 2.5 || b.a < 0.64) b.d = -b.d; });
    const T = SNEAK_SPOTS[m.term], tx = g.W * T[0], ty = g.H * T[1];
    if (Math.hypot(p.x - tx, p.y - ty) < 40 * s){ m.hack += dt; if (m.hack >= 1.1){ m.score++; m.hack = 0; SFX.level && SFX.level(); miniPop(m, tx, ty - 26 * s, 'Hacked!', '#9AF0FF'); let n = m.term; while (n === m.term) n = Math.floor(Math.random() * SNEAK_SPOTS.length); m.term = n; } }
    else m.hack = Math.max(0, m.hack - dt * 2);
    if (m.inv <= 0) m.beam.forEach(function(b, i){
      const ox = g.W * (i ? 0.92 : 0.08), oy = g.H * 0.14, ang = Math.atan2(p.y - oy, p.x - ox), d = Math.abs(((ang - b.a + Math.PI * 3) % TAU) - Math.PI);
      if (d < 0.17 && Math.hypot(p.x - ox, p.y - oy) < g.H * 1.1) miniHurt(m, p.x, p.y - 30 * s, 'Spotted!');
    });
  }
});
function sneakYard(c, w, h, s, rng){
  const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#242A34'); g.addColorStop(1, '#303844'); c.fillStyle = g; c.fillRect(0, 0, w, h);
  c.strokeStyle = 'rgba(200,210,225,.08)'; c.lineWidth = 2; for (let x = 0; x < w; x += 100 * s){ c.beginPath(); c.moveTo(x, h * 0.16); c.lineTo(x, h); c.stroke(); } for (let y = h * 0.16; y < h; y += 100 * s){ c.beginPath(); c.moveTo(0, y); c.lineTo(w, y); c.stroke(); }
  c.fillStyle = '#3A4452'; c.fillRect(0, 0, w, h * 0.16); c.fillStyle = 'rgba(255,200,60,.7)'; for (let x = 0; x < w; x += 70 * s) c.fillRect(x, h * 0.16 - 6 * s, 35 * s, 6 * s);
}
MINI[COUNTER_CHAPTER].draw = function(ctx, m, g){
  const s = g.s, W = g.W, H = g.H, t = G.time, p = m.p;
  const tile = miniBg(m, g, 'sneak', sneakYard, W, H); ctx.drawImage(tile.cv, 0, 0, W, H);
  SNEAK_SPOTS.forEach(function(q, i){
    const x = W * q[0], y = H * q[1], on = i === m.term;
    ctx.fillStyle = '#1A1E26'; ctx.fillRect(x - 15 * s, y - 11 * s, 30 * s, 22 * s); ctx.fillStyle = on ? '#6AE8FF' : '#3E4A5A'; ctx.fillRect(x - 11 * s, y - 8 * s, 22 * s, 11 * s);
    if (on){ miniGlow(ctx, x, y, 46 * s, '106,232,255', 0.35 + 0.15 * Math.sin(t * 6)); ctx.strokeStyle = '#9AF0FF'; ctx.lineWidth = 3 * s; ctx.beginPath(); ctx.arc(x, y, 32 * s, -Math.PI / 2, -Math.PI / 2 + TAU * Math.min(1, m.hack / 1.1)); ctx.stroke(); }
  });
  m.beam.forEach(function(b, i){
    const ox = W * (i ? 0.92 : 0.08), oy = H * 0.14, len = H * 1.1, hw = 0.17;
    const gr = ctx.createRadialGradient(ox, oy, 0, ox, oy, len); gr.addColorStop(0, 'rgba(255,248,210,.55)'); gr.addColorStop(1, 'rgba(255,248,210,.08)');
    ctx.fillStyle = gr; ctx.beginPath(); ctx.moveTo(ox, oy); ctx.arc(ox, oy, len, b.a - hw, b.a + hw); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#3E4A5A'; ctx.fillRect(ox - 18 * s, oy - 18 * s, 36 * s, 36 * s); ctx.fillStyle = '#FFF4C0'; ctx.beginPath(); ctx.arc(ox, oy, 10 * s, 0, TAU); ctx.fill();
  });
  m.focus = { x: p.x, y: p.y };
  drawTopGiraffe(ctx, p.x, p.y, -Math.PI / 2, 0.78 * s, p.ph, { moving: p.moving, alpha: m.inv > 0 && Math.floor(t * 14) % 2 ? 0.5 : 1 });
};
