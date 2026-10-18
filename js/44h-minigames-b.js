'use strict';
/* Minigames for Chapters 7-13 (see 44f-minigames.js for how they are registered and run). */
/* ========================= 44h. MINIGAMES 7-13 ========================= */

/* ---- 7. Asteroid slalom (Space Center) ---- */
function rockShape(r){ const pts = [], n = 9; for (let i = 0; i < n; i++) pts.push(r * (0.72 + Math.random() * 0.4)); return pts; }
registerMini({
  ch: 7, id: 'slalom', name: 'Asteroid Slalom', unit: 'fuel cells', dur: 40, goal: 12,
  blurb: 'The way off the planet runs through a field of rock.\nFly the ship, weave through the asteroids, and grab the fuel cells.',
  hint: 'Fly with WASD or the arrow keys, or hold the mouse button to steer toward the pointer.\nThree hits and the ship is done.',
  touchHint: 'Hold your finger down: the ship follows it.\nThree hits and the ship is done.',
  init: function(m, g){
    m.p = { x: g.W / 2, y: g.H * 0.78 }; m.rocks = []; m.cells = []; m.nr = 0.4; m.nc = 1.2; m.lives = 3; m.inv = 0; m.stars = miniBackdropSeed(70, g.W, g.H);
  },
  update: function(m, dt, g){
    const s = g.s, p = m.p, st = miniSteer(m, p.x, p.y), t = G.time;
    if (m.inv > 0) m.inv -= dt;
    p.x = clamp(p.x + st.x * 400 * s * dt, 30 * s, g.W - 30 * s); p.y = clamp(p.y + st.y * 400 * s * dt, g.H * 0.28, g.H - 36 * s);
    m.nr -= dt; m.nc -= dt;
    const heat = 1 + m.time / 80;
    if (m.nr <= 0){ m.nr = rand(0.3, 0.6) / heat; const r = rand(14, 34) * s; m.rocks.push({ x: rand(0, g.W), y: -40, r: r, vx: rand(-45, 45) * s, vy: rand(170, 300) * s * heat, rot: 0, vr: rand(-2, 2), pts: rockShape(r) }); }
    if (m.nc <= 0){ m.nc = rand(1.1, 1.9); m.cells.push({ x: rand(40 * s, g.W - 40 * s), y: -30, vy: 190 * s }); }
    for (let i = m.rocks.length - 1; i >= 0; i--){
      const r = m.rocks[i]; r.x += r.vx * dt; r.y += r.vy * dt; r.rot += r.vr * dt;
      if (r.y > g.H + 60) { m.rocks.splice(i, 1); continue; }
      if (Math.hypot(r.x - p.x, r.y - p.y) < r.r * 0.85 + 14 * s && m.inv <= 0){ miniHurt(m, p.x, p.y - 30 * s, 'Hit!'); r.y = g.H + 100; }
    }
    for (let i = m.cells.length - 1; i >= 0; i--){
      const c = m.cells[i]; c.y += c.vy * dt;
      if (c.y > g.H + 40){ m.cells.splice(i, 1); continue; }
      if (Math.hypot(c.x - p.x, c.y - p.y) < 30 * s){ m.cells.splice(i, 1); m.score++; SFX.pickupS(); miniPop(m, c.x, c.y - 22 * s, '+1', '#9AFFB0'); }
    }
  },
});

/* ---- 8. Low-gravity bounce (The Moon) ---- */
registerMini({
  ch: 8, id: 'bounce', name: 'Low-Gravity Bounce', unit: 'moon rocks', dur: 36, goal: 22,
  blurb: 'One-sixth gravity, and nothing to do but bounce.\nBounce into the glowing moon rocks, and keep clear of the falling meteors.',
  hint: 'Move with A and D or the left and right arrows, or hold the mouse button toward the pointer.\nHold Space or W as you land for a much bigger bounce.',
  touchHint: 'Hold your finger on one side to drift that way.\nTap and hold as you land for a much bigger bounce.',
  init: function(m, g){
    m.p = { x: g.W / 2, y: g.H * 0.82, vy: -300 * g.s, face: 1, stun: 0, ph: 0 };
    m.rocks = []; m.met = []; m.nr = 0.3; m.nm = 2; m.lives = 3; m.inv = 0; m.stars = miniBackdropSeed(50, g.W, g.H * 0.8); m.big = 0;
  },
  update: function(m, dt, g){
    const s = g.s, p = m.p, gy = g.H * 0.82;
    if (m.inv > 0) m.inv -= dt;
    if (p.stun > 0) p.stun -= dt;
    else {
      const st = miniSteer(m, p.x, gy);
      let dx = st.x; if (!dx && m.in.ptr) dx = clamp((m.in.px - p.x) / (60 * s), -1, 1);
      p.x = clamp(p.x + dx * 340 * s * dt, 30 * s, g.W - 30 * s); if (dx) p.face = dx > 0 ? 1 : -1;
    }
    p.vy += 520 * s * dt; p.y += p.vy * dt;
    if (p.y >= gy){
      p.y = gy; const big = (m.in.jump || miniJumpBuffered(m, 0.15)) && p.stun <= 0;       /* a press just before landing counts too */
      p.vy = -(big ? 745 : 600) * s; m.big = big ? 0.5 : 0;
      SFX.splash(); if (big) SFX.whoosh();
      miniRing(m, p.x, gy + 38 * s, 'rgba(235,235,245,.85)', (big ? 90 : 56) * s, 0.5, 0.2);
      miniBurst(m, p.x, gy + 36 * s, big ? 10 : 6, 'rgba(205,205,218,.75)', { ang: -Math.PI / 2, spread: 2.8, speed: 100, r: 4, life: 0.7, g: 140, glow: false });
    }
    if (m.big > 0) m.big -= dt;
    m.nr -= dt; m.nm -= dt;
    if (m.nr <= 0 && m.rocks.length < 6){ m.nr = rand(0.55, 1.0); m.rocks.push({ x: rand(50 * s, g.W - 50 * s), y: gy - rand(70, 500) * s, life: 6 }); }
    if (m.nm <= 0){ m.nm = rand(1.5, 2.8); m.met.push({ x: rand(50 * s, g.W - 50 * s), y: -30, warn: 0.9 }); }
    for (let i = m.rocks.length - 1; i >= 0; i--){
      const r = m.rocks[i]; r.life -= dt;
      if (r.life <= 0){ m.rocks.splice(i, 1); continue; }
      if (Math.hypot(r.x - p.x, r.y - (p.y - 38 * s * 0.8)) < 44 * s){ m.rocks.splice(i, 1); m.score++; SFX.pickupS(); miniPop(m, r.x, r.y - 24 * s, '+1', '#BFE8FF'); }
    }
    for (let i = m.met.length - 1; i >= 0; i--){
      const q = m.met[i];
      if (q.warn > 0){ q.warn -= dt; continue; }
      q.y += 900 * s * dt;
      if (q.y > gy + 20){ m.met.splice(i, 1); addShake(5); continue; }
      if (m.inv <= 0 && Math.hypot(q.x - p.x, q.y - (p.y - 30 * s)) < 46 * s){ if (miniHurt(m, p.x, p.y - 80 * s, 'Meteor!')) p.stun = 0.9; m.met.splice(i, 1); }
    }
  },
});

/* ---- 9. Acid-rain shelter (Venus) ---- */
registerMini({
  ch: 9, id: 'acid', name: 'Acid-Rain Shelter', unit: 'crystals', dur: 40, goal: 12,
  blurb: 'The clouds of Venus come down as acid.\nRun between the shelters, dash out for the crystals, and stay out of the red circles.',
  hint: 'Move with WASD or the arrow keys, or hold the mouse button toward the pointer.\nA red circle is where acid is about to land. Shelters are safe.',
  touchHint: 'Drag your finger: she walks toward it.\nA red circle is where acid is about to land. Shelters are safe.',
  init: function(m, g){
    const s = g.s;
    m.p = { x: g.W / 2, y: g.H * 0.6, ang: -1.57, ph: 0, moving: false };
    m.shel = [[0.2, 0.35], [0.8, 0.35], [0.5, 0.58], [0.25, 0.8], [0.75, 0.8]].map(function(a){ return { x: g.W * a[0], y: g.H * a[1], r: 56 * s }; });
    m.drops = []; m.cry = []; m.nd = 0.8; m.nc = 0.5; m.lives = 3; m.inv = 0; m.rain = miniBackdropSeed(60, g.W, g.H);
  },
  update: function(m, dt, g){
    const s = g.s, p = m.p, st = miniSteer(m, p.x, p.y);
    if (m.inv > 0) m.inv -= dt;
    p.x = clamp(p.x + st.x * 250 * s * dt, 28 * s, g.W - 28 * s); p.y = clamp(p.y + st.y * 250 * s * dt, 80 * s, g.H - 30 * s);
    p.moving = !!(st.x || st.y); if (p.moving){ p.ang = Math.atan2(st.y, st.x); p.ph += dt * 11; }
    const sheltered = m.shel.some(function(q){ return Math.hypot(q.x - p.x, q.y - p.y) < q.r - 8 * s; });
    m.nd -= dt; m.nc -= dt;
    if (m.nd <= 0){
      m.nd = Math.max(0.2, 0.6 - m.time * 0.01);
      const near = Math.random() < 0.55;
      m.drops.push({ x: near ? clamp(p.x + rand(-170, 170) * s, 40, g.W - 40) : rand(40, g.W - 40), y: near ? clamp(p.y + rand(-170, 170) * s, 90 * s, g.H - 40) : rand(90 * s, g.H - 40), r: rand(46, 74) * s, t: 0, warn: 0.8 });
    }
    if (m.nc <= 0 && m.cry.length < 2){
      m.nc = rand(1.0, 2.0);
      for (let k = 0; k < 20; k++){
        const x = rand(50 * s, g.W - 50 * s), y = rand(100 * s, g.H - 50 * s);
        if (m.shel.every(function(q){ return Math.hypot(q.x - x, q.y - y) > q.r + 30 * s; })){ m.cry.push({ x: x, y: y, life: 8 }); break; }
      }
    }
    for (let i = m.drops.length - 1; i >= 0; i--){
      const d = m.drops[i]; d.t += dt;
      if (d.t >= d.warn && !d.hit){
        d.hit = true; SFX.splash();
        if (!sheltered && Math.hypot(d.x - p.x, d.y - p.y) < d.r) miniHurt(m, p.x, p.y - 40 * s, 'Acid!');
      }
      if (d.t > d.warn + 0.45) m.drops.splice(i, 1);
    }
    for (let i = m.cry.length - 1; i >= 0; i--){
      const c = m.cry[i]; c.life -= dt;
      if (c.life <= 0){ m.cry.splice(i, 1); continue; }
      if (Math.hypot(c.x - p.x, c.y - p.y) < 36 * s){ m.cry.splice(i, 1); m.score++; SFX.pickupS(); miniPop(m, c.x, c.y - 24 * s, '+1', '#FFE9A0'); }
    }
  },
});

/* ---- 10. Cool-down relay (The Inferno) ---- */
registerMini({
  ch: 10, id: 'lava', name: 'Cool-Down Relay', unit: 'buckets', dur: 45, goal: 3,
  blurb: 'The fire spreads faster than it can be fought.\nCarry water from the well, across the lava on the drifting stones, to the fire pit. It boils away if you are slow.',
  hint: 'Move with WASD or the arrow keys, or hold the mouse button toward the pointer.\nStand on a stone to ride it. The lava burns, and costs you time.',
  touchHint: 'Drag your finger: she walks toward it.\nStand on a stone to ride it. The lava burns, and costs you time.',
  init: function(m, g){
    const s = g.s;
    m.colX = []; for (let i = 0; i < 5; i++) m.colX.push(g.W / 2 + (i - 2) * 82 * s);
    m.riverL = m.colX[0] - 50 * s; m.riverR = m.colX[4] + 50 * s;
    m.top = 70 * s; m.bot = g.H - 20 * s; m.stoneR = 42 * s; m.stones = [];
    const span = m.bot - m.top, per = 4;
    for (let i = 0; i < 5; i++) for (let j = 0; j < per; j++) m.stones.push({ x: m.colX[i], y: m.top + (j + (i % 2) * 0.5) * span / per, vy: (i % 2 ? 1 : -1) * (62 + i * 14) * s });
    m.p = { x: g.W * 0.08, y: g.H * 0.55, ang: 0, ph: 0, moving: false, lava: 0, stun: 0, last: 0 };
    m.carry = { on: true, t: 11 }; m.drops = 0;
  },
  update: function(m, dt, g){
    const s = g.s, p = m.p, span = m.bot - m.top;
    for (let i = 0; i < m.stones.length; i++){ const q = m.stones[i]; q.y += q.vy * dt; if (q.y > m.bot + 50 * s) q.y -= span + 100 * s; else if (q.y < m.top - 50 * s) q.y += span + 100 * s; }
    if (p.stun > 0) p.stun -= dt;
    let ridden = null;
    if (p.stun <= 0){
      const st = miniSteer(m, p.x, p.y);
      p.x += st.x * 235 * s * dt; p.y += st.y * 235 * s * dt;
      p.moving = !!(st.x || st.y); if (p.moving){ p.ang = Math.atan2(st.y, st.x); p.ph += dt * 11; }
    }
    for (let i = 0; i < m.stones.length; i++){ const q = m.stones[i]; if (Math.hypot(q.x - p.x, q.y - p.y) < m.stoneR - 6 * s){ ridden = q; break; } }
    if (ridden) p.y += ridden.vy * dt;
    p.x = clamp(p.x, 24 * s, g.W - 24 * s); p.y = clamp(p.y, m.top, m.bot);
    const inRiver = p.x > m.riverL && p.x < m.riverR;
    if (inRiver && !ridden && p.stun <= 0){
      p.lava += dt;
      if (p.lava > 0.18){
        p.lava = 0; p.stun = 0.8; m.time += 1.5; SFX.hurt(); addShake(8); miniPop(m, p.x, p.y - 36 * s, '-1.5 seconds', '#FFB070');
        p.x = p.last ? m.riverR + 30 * s : m.riverL - 30 * s;
      }
    } else p.lava = 0;
    if (!inRiver) p.last = p.x > g.W / 2 ? 1 : 0;
    if (p.x <= m.riverL && !m.carry.on){ m.carry.on = true; m.carry.t = 11; SFX.splash(); miniPop(m, p.x, p.y - 40 * s, 'Bucket full', '#9AE8FF'); }
    if (m.carry.on && p.x > m.riverL + 4 * s){
      m.carry.t -= dt;
      if (m.carry.t <= 0){ m.carry.on = false; miniPop(m, p.x, p.y - 40 * s, 'Boiled away!', '#FFB070'); SFX.deny(); }
    }
    if (p.x >= m.riverR && m.carry.on){
      m.carry.on = false; m.score++; SFX.level(); miniPop(m, p.x, p.y - 40 * s, 'Fire out!', '#BFFF9A');
    }
  },
});

/* ---- 11. Echo puzzle (The Changed Savannah) ---- */
const ECHO_COL = ['#FF6A8A', '#FFB84A', '#7FE06A', '#4AC8FF', '#B58CFF'], ECHO_HZ = [330, 392, 440, 523, 659];
registerMini({
  ch: 11, id: 'echo', name: 'Echo Crystals', unit: 'long', goal: 7, dur: 0,
  blurb: 'The crystals that grew over the savannah sing back.\nWatch the order they light up, then play it back. Each round adds one more.',
  hint: 'Click a crystal, or press the number keys 1 to 5 from left to right.\nThree mistakes and the song ends.',
  touchHint: 'Tap the crystals in the same order they lit up.\nThree mistakes and the song ends.',
  goalText: 'Goal: play back an echo seven notes long',
  hudText: function(m){ return 'Longest echo: ' + m.score; },
  init: function(m, g){
    m.seq = []; for (let i = 0; i < 12; i++){ let v; do { v = randi(0, 4); } while (i >= 2 && v === m.seq[i - 1] && v === m.seq[i - 2]); m.seq.push(v); }
    m.len = 3; m.mode = 'wait'; m.idx = 0; m.tm = 0.8; m.lit = -1; m.litT = 0; m.lives = 3; m.msg = 'Listen\u2026';
  },
  update: function(m, dt, g){
    const light = function(i){ m.lit = i; m.litT = 0.42; SFX.tone('triangle', ECHO_HZ[i], ECHO_HZ[i], 0.42, 0.2, 0, 0, SFX.eventGain); };
    if (m.litT > 0){ m.litT -= dt; if (m.litT <= 0) m.lit = -1; }
    if (m.mode === 'wait'){ m.tm -= dt; if (m.tm <= 0){ m.mode = 'show'; m.idx = 0; m.tm = 0.2; m.msg = 'Listen\u2026'; } }
    else if (m.mode === 'show'){
      m.tm -= dt;
      if (m.tm <= 0){
        if (m.idx < m.len){ light(m.seq[m.idx]); m.idx++; m.tm = Math.max(0.42, 0.7 - m.len * 0.03); }
        else { m.mode = 'input'; m.idx = 0; m.msg = 'Your turn'; }
      }
    } else if (m.mode === 'input'){
      let hit = -1;
      if (m.in.digit >= 1 && m.in.digit <= 5) hit = m.in.digit - 1;
      else if (m.in.pClick){
        const pos = echoPos(g);
        for (let i = 0; i < 5; i++) if (Math.hypot(pos[i].x - m.in.px, pos[i].y - m.in.py) < 56 * g.s) hit = i;
      }
      if (hit >= 0){
        light(hit);
        if (hit === m.seq[m.idx]){
          m.idx++;
          if (m.idx >= m.len){
            m.score = m.len; SFX.level(); miniPop(m, g.W / 2, g.H * 0.3, 'Echo ' + m.len + '!', '#BFFF9A');
            if (m.len >= 9){ m.over = true; return; }
            m.len++; m.mode = 'wait'; m.tm = 1.1; m.msg = 'Listen\u2026';
          }
        } else {
          m.lives--; SFX.hurt(); addShake(6); miniPop(m, g.W / 2, g.H * 0.3, 'Wrong note', '#FF8A7A');
          if (m.lives <= 0){ m.over = true; return; }
          m.mode = 'wait'; m.tm = 1.2; m.msg = 'Again\u2026';
        }
      }
    }
  },
});
function echoPos(g){ const out = []; for (let i = 0; i < 5; i++) out.push({ x: g.W / 2 + (i - 2) * Math.min(g.W / 6, 130 * g.s), y: g.H * 0.5 + Math.abs(i - 2) * 24 * g.s }); return out; }

/* ---- 12. Hack-the-grid (Area 51) ---- */
const HG_N = 1, HG_E = 2, HG_S = 4, HG_W = 8;
function hgRot(mask){ return ((mask << 1) | (mask >> 3)) & 15; }
function hgPower(m){
  const pw = []; for (let r = 0; r < m.rows; r++){ pw.push([]); for (let c = 0; c < m.cols; c++) pw[r].push(false); }
  const q = [];
  if (m.tiles[m.r0][0] & HG_W){ pw[m.r0][0] = true; q.push([0, m.r0]); }
  while (q.length){
    const cur = q.pop(), c = cur[0], r = cur[1], mk = m.tiles[r][c];
    const tryN = function(nc, nr, mine, theirs){ if (nc < 0 || nr < 0 || nc >= m.cols || nr >= m.rows || pw[nr][nc]) return; if ((mk & mine) && (m.tiles[nr][nc] & theirs)){ pw[nr][nc] = true; q.push([nc, nr]); } };
    tryN(c + 1, r, HG_E, HG_W); tryN(c - 1, r, HG_W, HG_E); tryN(c, r - 1, HG_N, HG_S); tryN(c, r + 1, HG_S, HG_N);
  }
  return pw;
}
function hgRefresh(m){
  m.pw = hgPower(m); let n = 0;
  for (let r = 0; r < m.rows; r++) for (let c = 0; c < m.cols; c++) if (m.pw[r][c]) n++;
  m.score = n;
  m.solved = !!(m.pw[m.r1][m.cols - 1] && (m.tiles[m.r1][m.cols - 1] & HG_E));
}
registerMini({
  ch: 12, id: 'grid', name: 'Hack the Grid', unit: 'nodes linked', goal: 0, dur: 60,
  blurb: 'Area 51 runs on a power grid, and the grid is scrambled.\nTurn the tiles until the power reaches the reactor on the right.',
  hint: 'Click a tile to turn it. Or move the highlight with the arrow keys and press Space.\nThe lit tiles are the ones the power already reaches.',
  touchHint: 'Tap a tile to turn it.\nThe lit tiles are the ones the power already reaches.',
  goalText: 'Goal: connect the power from the left edge to the reactor on the right, within 60 seconds',
  win: function(m){ return m.solved; },
  hudText: function(m){ return m.score + ' tiles powered'; },
  init: function(m, g){
    m.cols = 6; m.rows = 4; m.tiles = []; m.cur = { c: 0, r: 0 };
    for (let r = 0; r < m.rows; r++){ m.tiles.push([]); for (let c = 0; c < m.cols; c++) m.tiles[r].push(0); }
    let r = randi(0, m.rows - 1), c = 0; m.r0 = r;
    const path = [[0, r]], seen = {}; seen['0,' + r] = 1;
    while (c < m.cols - 1){
      const opts = [[c + 1, r], [c + 1, r], [c + 1, r]];
      if (r > 0 && !seen[c + ',' + (r - 1)]) opts.push([c, r - 1]);
      if (r < m.rows - 1 && !seen[c + ',' + (r + 1)]) opts.push([c, r + 1]);
      const o = pick(opts); c = o[0]; r = o[1]; seen[c + ',' + r] = 1; path.push([c, r]);
    }
    m.r1 = r; m.goal = path.length;
    const dirBit = function(dc, dr){ return dc === 1 ? HG_E : dc === -1 ? HG_W : dr === 1 ? HG_S : HG_N; };
    path.forEach(function(cell, i){
      let mk = 0;
      if (i === 0) mk |= HG_W; else { const a = path[i - 1]; mk |= dirBit(a[0] - cell[0], a[1] - cell[1]); }
      if (i === path.length - 1) mk |= HG_E; else { const b = path[i + 1]; mk |= dirBit(b[0] - cell[0], b[1] - cell[1]); }
      m.tiles[cell[1]][cell[0]] = mk;
    });
    const shapes = [HG_E | HG_W, HG_N | HG_E, HG_N | HG_E | HG_W, HG_N | HG_E, HG_E | HG_W, HG_N | HG_E | HG_S | HG_W];
    for (let rr = 0; rr < m.rows; rr++) for (let cc = 0; cc < m.cols; cc++){
      if (!seen[cc + ',' + rr]) m.tiles[rr][cc] = pick(shapes);
      for (let k = randi(0, 3); k > 0; k--) m.tiles[rr][cc] = hgRot(m.tiles[rr][cc]);
    }
    hgRefresh(m);
    while (m.solved){ const cell = path[randi(1, path.length - 2)]; m.tiles[cell[1]][cell[0]] = hgRot(m.tiles[cell[1]][cell[0]]); hgRefresh(m); }
    m.fin = 0;
  },
  update: function(m, dt, g){
    if (m.fin > 0){ m.fin -= dt; if (m.fin <= 0) m.over = true; return; }
    const I = m.in, geo = hgGeom(m, g);
    let turn = null;
    if (I.pL) m.cur.c = Math.max(0, m.cur.c - 1); if (I.pR) m.cur.c = Math.min(m.cols - 1, m.cur.c + 1);
    if (I.pU) m.cur.r = Math.max(0, m.cur.r - 1); if (I.pD) m.cur.r = Math.min(m.rows - 1, m.cur.r + 1);
    if (I.pClick){
      const c = Math.floor((I.px - geo.x0) / geo.ts), r = Math.floor((I.py - geo.y0) / geo.ts);
      if (c >= 0 && r >= 0 && c < m.cols && r < m.rows){ m.cur = { c: c, r: r }; turn = m.cur; }
    } else if (I.pAct && !I.ptr) turn = m.cur;
    if (turn){
      m.tiles[turn.r][turn.c] = hgRot(m.tiles[turn.r][turn.c]); SFX.tone('square', 420, 420, 0.04, 0.07, 0, 0, SFX.abilityGain);
      hgRefresh(m);
      if (m.solved){ m.fin = 1.0; SFX.level(); miniPop(m, g.W / 2, g.H * 0.2, 'Power restored!', '#BFFF9A'); }
    }
  },
});
function hgGeom(m, g){ const ts = Math.min((g.W - 150 * g.s) / m.cols, (g.H - 130 * g.s) / m.rows, 120 * g.s); return { ts: ts, x0: (g.W - ts * m.cols) / 2, y0: 70 * g.s + (g.H - 90 * g.s - ts * m.rows) / 2 }; }

/* ---- 13. Sandworm escape (Mars) ---- */
registerMini({
  ch: 13, id: 'worm', name: 'Sandworm Escape', unit: 'metres', dur: 40, goal: 0,
  blurb: 'Something huge is following the vibrations across the dunes.\nKeep running. Rocks slow her down, and water flasks give her a burst of speed.',
  hint: 'Steer with WASD or the arrow keys, or hold the mouse button toward the pointer.\nKeep the worm\u2019s distance bar from running out.',
  touchHint: 'Drag your finger: she runs toward it.\nKeep the worm\u2019s distance bar from running out.',
  goalText: 'Goal: stay ahead of the worm for 40 seconds',
  win: function(m){ return !m.dead; },
  hudText: function(m){ return Math.floor(m.dist / 10) + ' metres'; },
  init: function(m, g){
    m.p = { x: g.W / 2, y: g.H * 0.64, ph: 0 }; m.rocks = []; m.fl = []; m.gap = 70; m.dist = 0; m.boost = 0; m.slow = 0; m.inv = 0; m.nr = 0.2; m.nf = 2.5; m.dead = false; m.rip = [];
  },
  update: function(m, dt, g){
    const s = g.s, p = m.p, st = miniSteer(m, p.x, p.y);
    if (m.inv > 0) m.inv -= dt; if (m.slow > 0) m.slow -= dt; if (m.boost > 0) m.boost -= dt;
    let v = (320 + m.time * 3) * s; if (m.boost > 0) v *= 1.3; if (m.slow > 0) v *= 0.6;
    m.dist += v * dt / s; p.ph += dt * 13;
    p.x = clamp(p.x + st.x * 340 * s * dt, 30 * s, g.W - 30 * s); p.y = clamp(p.y + st.y * 200 * s * dt, g.H * 0.4, g.H * 0.86);
    m.nr -= dt; m.nf -= dt;
    if (m.nr <= 0){ m.nr = rand(0.26, 0.5); m.rocks.push({ x: rand(0, g.W), y: -40, r: rand(18, 34) * s, pts: null }); }
    if (m.nf <= 0){ m.nf = rand(1.8, 2.8); m.fl.push({ x: rand(50 * s, g.W - 50 * s), y: -30 }); }
    for (let i = m.rocks.length - 1; i >= 0; i--){
      const r = m.rocks[i]; r.y += v * dt;
      if (r.y > g.H + 60){ m.rocks.splice(i, 1); continue; }
      if (m.inv <= 0 && Math.hypot(r.x - p.x, r.y - p.y) < r.r + 12 * s){ m.inv = 0.8; m.slow = 0.7; m.gap -= 14; SFX.boom(); addShake(8); miniPop(m, p.x, p.y - 40 * s, 'Rock!', '#FF8A7A'); r.y = g.H + 100; }
    }
    for (let i = m.fl.length - 1; i >= 0; i--){
      const f = m.fl[i]; f.y += v * dt;
      if (f.y > g.H + 40){ m.fl.splice(i, 1); continue; }
      if (Math.hypot(f.x - p.x, f.y - p.y) < 32 * s){ m.fl.splice(i, 1); m.boost = 1.6; m.gap = Math.min(100, m.gap + 20); SFX.pickupS(); miniPop(m, f.x, f.y - 26 * s, 'Burst!', '#9AE8FF'); }
    }
    m.gap -= (3.2 + m.time * 0.05) * dt;
    m.gap = Math.min(100, m.gap);
    m.score = Math.floor(m.dist / 10);
    if (m.gap <= 0){ m.dead = true; m.over = true; SFX.over(); }
    if (Math.random() < dt * 4) m.rip.push({ t: 0 });
    for (let i = m.rip.length - 1; i >= 0; i--){ m.rip[i].t += dt; if (m.rip[i].t > 1.6) m.rip.splice(i, 1); }
  },
});
