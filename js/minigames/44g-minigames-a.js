'use strict';
/* Minigames for Chapters 1-6. Each is registered with registerMini() (44f-minigames.js): init(m, g), update(m, dt, g), draw(ctx, m, g)
   with g = { W, H, s }. m.score counts toward m.goal; set m.over = true to end it; m.lives > 0 shows hearts. */
/* ========================= 44g. MINIGAMES 1-6 ========================= */
function miniHurt(m, x, y, txt){
  if (m.inv > 0) return false;
  m.lives--; m.inv = 1.4;
  SFX.hurt(); addShake(8); screenFlash('#CF4433', 0.25, 0.25);
  miniPop(m, x, y, txt || 'Ouch!', '#FF8A7A');
  if (m.lives <= 0) m.over = true;
  return true;
}
function miniBackdropSeed(n, w, h){ const a = []; for (let i = 0; i < n; i++) a.push({ x: Math.random() * w, y: Math.random() * h, r: Math.random() }); return a; }

/* ---- 1. Watering hole dash (Savanna) ---- */
registerMini({
  ch: 1, id: 'water', name: 'Watering Hole Dash', unit: 'calves watered', dur: 40, goal: 8,
  blurb: 'The calves are thirsty and the pond is far.\nFill up at the pond, carry the water to a thirsty calf, and keep clear of the hyenas.',
  hint: 'Move with WASD or the arrow keys, or hold the mouse button to walk toward the pointer.\nStand in the pond to fill up (three sips at most).',
  touchHint: 'Drag your finger: she walks toward it.\nStand in the pond to fill up (three sips at most).',
  init: function(m, g){
    const s = g.s;
    m.p = { x: g.W * 0.5, y: g.H * 0.62, ang: 0, ph: 0, water: 0, fill: 0, stun: 0, moving: false };
    m.pond = { x: g.W * 0.17, y: g.H * 0.6, rx: 105 * s, ry: 72 * s };
    m.calves = [];
    for (let i = 0; i < 3; i++) m.calves.push({ x: g.W * 0.72 + (i % 2) * 44 * s, y: g.H * (0.32 + i * 0.21), need: i !== 1, next: 2 + i, happy: 0 });
    m.hy = [{ x: g.W * 0.5, y: g.H * 0.12, flee: 0 }, { x: g.W * 0.55, y: g.H * 0.95, flee: 0 }];
    m.tufts = miniBackdropSeed(46, g.W, g.H);
  },
  update: function(m, dt, g){
    const s = g.s, p = m.p, st = miniSteer(m, p.x, p.y);
    if (p.stun > 0) p.stun -= dt;
    else {
      p.x += st.x * 250 * s * dt; p.y += st.y * 250 * s * dt;
      p.moving = !!(st.x || st.y);
      if (p.moving){ p.ang = Math.atan2(st.y, st.x); p.ph += dt * 11; }
    }
    p.x = clamp(p.x, 30 * s, g.W - 30 * s); p.y = clamp(p.y, 80 * s, g.H - 40 * s);
    const dx = (p.x - m.pond.x) / m.pond.rx, dy = (p.y - m.pond.y) / m.pond.ry;
    if (dx * dx + dy * dy < 1.15 && p.water < 3 && p.stun <= 0){
      p.fill += dt;
      if (p.fill >= 0.35){ p.fill = 0; p.water++; SFX.splash(); miniPop(m, p.x, p.y - 40 * s, 'Water ' + p.water + '/3', '#9AE8FF'); }
    } else p.fill = 0;
    for (let i = 0; i < m.calves.length; i++){
      const c = m.calves[i];
      if (c.happy > 0) c.happy -= dt;
      if (c.need){
        if (p.water > 0 && Math.hypot(c.x - p.x, c.y - p.y) < 58 * s){
          p.water--; m.score++; c.need = false; c.next = rand(1.6, 3.4); c.happy = 1.2;
          SFX.pickupS(); miniPop(m, c.x, c.y - 30 * s, '+1', '#BFFF9A');
        }
      } else { c.next -= dt; if (c.next <= 0) c.need = true; }
    }
    for (let i = 0; i < m.hy.length; i++){
      const h = m.hy[i];
      let tx = p.x - h.x, ty = p.y - h.y;
      const d = Math.hypot(tx, ty) || 1;
      if (h.flee > 0){ h.flee -= dt; h.x -= tx / d * 170 * s * dt; h.y -= ty / d * 170 * s * dt; }
      else {
        const sp = (72 + m.time * 1.3) * s;
        h.x += tx / d * sp * dt; h.y += ty / d * sp * dt;
        if (d < 32 * s && p.stun <= 0){ p.stun = 0.7; if (p.water) miniPop(m, p.x, p.y - 36 * s, 'Water spilled!', '#FF8A7A'); p.water = 0; h.flee = 3.5; SFX.hurt(); addShake(6); }
      }
      h.x = clamp(h.x, -20, g.W + 20); h.y = clamp(h.y, 50 * s, g.H + 20);
    }
  },
});

/* ---- 2. Ice slide (Frostreach) ---- */
registerMini({
  ch: 2, id: 'ice', name: 'Ice Slide', unit: 'berries', dur: 35, goal: 12,
  blurb: 'A frozen lake, and she cannot stop sliding.\nSteer to pick up the frozen berries. Cracks cost you two seconds.',
  hint: 'Steer with WASD or the arrow keys, or hold the mouse button to pull toward the pointer.\nThere are no brakes. Plan ahead.',
  touchHint: 'Hold your finger down: she is pulled toward it.\nThere are no brakes. Plan ahead.',
  init: function(m, g){
    const s = g.s;
    m.p = { x: g.W / 2, y: g.H * 0.6, vx: 0, vy: 0, ang: -1.57, stun: 0 };
    m.berries = []; m.holes = [];
    const place = function(r){
      for (let k = 0; k < 40; k++){
        const x = rand(60 * s, g.W - 60 * s), y = rand(100 * s, g.H - 60 * s);
        if (Math.hypot(x - m.p.x, y - m.p.y) > 140 * s) return { x: x, y: y, r: r };
      }
      return { x: g.W * 0.3, y: g.H * 0.3, r: r };
    };
    for (let i = 0; i < 4; i++) m.holes.push(place(30 * s));
    for (let i = 0; i < 6; i++) m.berries.push(place(14 * s));
    m.sparks = miniBackdropSeed(40, g.W, g.H);
  },
  update: function(m, dt, g){
    const s = g.s, p = m.p, st = miniSteer(m, p.x, p.y);
    if (p.stun > 0){ p.stun -= dt; }
    else { p.vx += st.x * 780 * s * dt; p.vy += st.y * 780 * s * dt; }
    const fr = Math.pow(0.5, dt);                     /* ice: very little friction */
    p.vx *= fr; p.vy *= fr;
    const sp = Math.hypot(p.vx, p.vy), mx = 470 * s;
    if (sp > mx){ p.vx *= mx / sp; p.vy *= mx / sp; }
    p.x += p.vx * dt; p.y += p.vy * dt;
    const L = 28 * s, R = g.W - 28 * s, T = 78 * s, B = g.H - 28 * s;
    if (p.x < L){ p.x = L; p.vx = Math.abs(p.vx) * 0.7; } if (p.x > R){ p.x = R; p.vx = -Math.abs(p.vx) * 0.7; }
    if (p.y < T){ p.y = T; p.vy = Math.abs(p.vy) * 0.7; } if (p.y > B){ p.y = B; p.vy = -Math.abs(p.vy) * 0.7; }
    if (sp > 30) p.ang = Math.atan2(p.vy, p.vx);
    for (let i = 0; i < m.berries.length; i++){
      const b = m.berries[i];
      if (Math.hypot(b.x - p.x, b.y - p.y) < b.r + 22 * s){
        m.score++; SFX.pickupS(); miniPop(m, b.x, b.y - 20 * s, '+1', '#FFB0C0');
        for (let k = 0; k < 40; k++){
          const x = rand(60 * s, g.W - 60 * s), y = rand(100 * s, g.H - 60 * s);
          if (Math.hypot(x - p.x, y - p.y) > 160 * s && m.holes.every(function(h){ return Math.hypot(h.x - x, h.y - y) > 60 * s; })){ b.x = x; b.y = y; break; }
        }
      }
    }
    for (let i = 0; i < m.holes.length; i++){
      const h = m.holes[i];
      if (p.stun <= 0 && Math.hypot(h.x - p.x, h.y - p.y) < h.r + 6 * s){
        m.time += 2; p.stun = 0.7; const a = Math.atan2(p.y - h.y, p.x - h.x); p.vx = Math.cos(a) * 260 * s; p.vy = Math.sin(a) * 260 * s;
        SFX.freeze(); addShake(6); miniPop(m, p.x, p.y - 36 * s, '-2 seconds', '#9AE8FF');
      }
    }
  },
});

/* ---- 3. Lily-pad hop (Murkfen) ---- */
function lilyRow(m, r){
  while (m.rows.length <= r){
    const i = m.rows.length, row = [];
    let safe = m.safe;
    if (i > 0) safe = clamp(m.safe + pick([-1, -1, 0, 1, 1]), 0, 4);
    for (let c = 0; c < 5; c++) row.push({ on: i === 0 || c === safe || c === m.safe || Math.random() < 0.5, stand: 0, sunk: 0 });
    m.safe = safe; m.rows.push(row);
  }
}
registerMini({
  ch: 3, id: 'lily', name: 'Lily-Pad Hop', unit: 'rows', dur: 45, goal: 32,
  blurb: 'The bog is full of lily pads, and they do not stay afloat for long.\nHop up the pond. A pad sinks if you stand on it too long.',
  hint: 'Hop with A and D (or the left and right arrows) to move sideways, and W, Up or Space to go forward.\nClick the left, middle or right of the screen to hop left, forward or right.',
  touchHint: 'Tap the left, middle or right of the screen to hop left, forward or right.\nA pad sinks if you stand on it too long.',
  init: function(m, g){
    m.rows = []; m.safe = 2; lilyRow(m, 12);
    m.c = 2; m.r = 0; m.fc = 2; m.fr = 0; m.hop = 1; m.from = { c: 2, r: 0 }; m.to = { c: 2, r: 0 };
    m.cam = 0; m.lives = 3; m.inv = 0; m.fall = 0; m.reeds = miniBackdropSeed(24, 1, 1);
  },
  update: function(m, dt, g){
    if (m.inv > 0) m.inv -= dt;
    const I = m.in;
    lilyRow(m, m.r + 14);
    for (let r = 0; r < m.rows.length; r++) for (let c = 0; c < 5; c++){
      const pd = m.rows[r][c];
      if (pd.sunk > 0){ pd.sunk -= dt; if (pd.sunk <= 0){ pd.on = true; pd.stand = 0; } }
    }
    if (m.fall > 0){ m.fall -= dt; if (m.fall <= 0){ m.hop = 1; } return; }
    let dir = null;
    if (I.pL) dir = 'l'; else if (I.pR) dir = 'r'; else if (I.pU) dir = 'u';
    else if (I.pClick){ const k = I.px / g.W; dir = k < 0.33 ? 'l' : k > 0.67 ? 'r' : 'u'; }
    else if (I.pAct && !I.ptr) dir = 'u';
    if (m.hop < 1){
      if (dir) m.queued = { dir: dir, t: m.time };                              /* a press in mid-hop is kept and used on landing */
      m.hop = Math.min(1, m.hop + dt / 0.2);
      m.fc = lerp(m.from.c, m.to.c, m.hop); m.fr = lerp(m.from.r, m.to.r, m.hop);
      if (m.hop >= 1){
        m.c = m.to.c; m.r = m.to.r; m.fc = m.c; m.fr = m.r;
        const pd = m.rows[m.r][m.c];
        if (!pd.on){ lilyFall(m, g); }
        else { SFX.splash(); m.landAt = G.time; if (m.r > m.score){ m.score = m.r; SFX.click(); } }
      }
    } else {
      if (!dir && m.queued && m.time - m.queued.t < 0.25) dir = m.queued.dir;
      m.queued = null;
      if (dir){
        const nc = m.c + (dir === 'l' ? -1 : dir === 'r' ? 1 : 0), nr = m.r + (dir === 'u' ? 1 : 0);
        if (nc >= 0 && nc <= 4){ m.from = { c: m.c, r: m.r }; m.to = { c: nc, r: nr }; m.hop = 0; SFX.whoosh(); }
      }
      const pd = m.rows[m.r][m.c];
      pd.stand += dt;
      if (pd.stand > 1.15){ pd.on = false; pd.sunk = 3.2; pd.stand = 0; lilyFall(m, g); }
    }
    m.cam += (m.fr - m.cam) * Math.min(1, dt * 5);
  },
});
function lilyFall(m, g){
  m.lives--; m.inv = 1.2; m.fall = 0.45;
  SFX.splash(); addShake(6); screenFlash('#3EA0C0', 0.2, 0.25);
  /* climb back out onto the pad she hopped from, or the nearest one that is afloat */
  let best = null;
  for (let dr = 0; dr <= 3 && !best; dr++) for (let dc = 0; dc <= 4 && !best; dc++){
    const r = Math.max(0, m.r - dr);
    [m.c - dc, m.c + dc].forEach(function(c){ if (!best && c >= 0 && c <= 4 && m.rows[r][c].on) best = { c: c, r: r }; });
  }
  if (!best){ best = { c: m.c, r: Math.max(0, m.r - 1) }; m.rows[best.r][best.c].on = true; }
  m.c = best.c; m.r = best.r; m.fc = m.c; m.fr = m.r; m.hop = 1; m.rows[m.r][m.c].stand = 0;
  if (m.lives <= 0) m.over = true;
}

/* ---- 4. Tide surf (The Deep) ---- */
function surfY(g, x, t){ return g.H * 0.68 + Math.sin(x * 0.011 + t * 1.4) * 12 * g.s + Math.sin(x * 0.0045 - t * 0.8) * 18 * g.s; }
registerMini({
  ch: 4, id: 'surf', name: 'Tide Surf', unit: 'shells', dur: 38, goal: 10,
  blurb: 'A long swell, a board, and a lot of loose mines.\nJump the mines, and leap for the shells.',
  hint: 'Jump with Space, W or the Up arrow, or click.\nShells float at different heights, so time your jumps.',
  touchHint: 'Tap anywhere to jump.\nShells float at different heights, so time your jumps.',
  init: function(m, g){
    m.sx = 0; m.h = 0; m.vh = 0; m.obs = []; m.nextX = 760 * g.s; m.lives = 3; m.inv = 0; m.clouds = miniBackdropSeed(8, g.W, g.H * 0.4);
  },
  update: function(m, dt, g){
    const s = g.s, t = G.time;
    if (m.inv > 0) m.inv -= dt;
    const speed = (290 + m.time * 3) * s;
    m.sx += speed * dt;
    if (miniJumpBuffered(m, 0.12) && m.h <= 3 * s){ m.vh = 660 * s; miniJumpUse(m); SFX.whoosh(); }       /* a press just before landing still jumps */
    m.vh -= 1750 * s * dt; m.h += m.vh * dt;
    if (m.h <= 0){ m.h = 0; if (m.vh < 0) m.vh = 0; }
    while (m.nextX < m.sx + g.W * 1.3){
      if (Math.random() < 0.55) m.obs.push({ x: m.nextX, k: 'mine', ph: Math.random() * 6 });
      else m.obs.push({ x: m.nextX, k: 'shell', h: rand(34, 190) * s, got: false });
      m.nextX += rand(190, 360) * s;
    }
    const px = m.sx + g.W * 0.26;
    for (let i = m.obs.length - 1; i >= 0; i--){
      const o = m.obs[i];
      if (o.x < m.sx - 80) { m.obs.splice(i, 1); continue; }
      if (Math.abs(o.x - px) > 30 * s) continue;
      if (o.k === 'mine'){ if (m.h < 34 * s && m.inv <= 0){ miniHurt(m, g.W * 0.26, surfY(g, px, t) - 60 * s, 'Boom!'); addShake(10); } }
      else if (!o.got && Math.abs(o.h - (m.h + 36 * s)) < 42 * s){ o.got = true; m.score++; SFX.pickupS(); miniPop(m, g.W * 0.26 + 30 * s, surfY(g, px, t) - m.h - 70 * s, '+1', '#FFD0E8'); }
    }
  },
});

/* ---- 5. Vine swing (The Canopy) ---- */
function vineAnchor(m, g, i){
  while (m.anch.length <= i){
    const k = m.anch.length;
    m.anch.push({ x: (360 + k * 265) * g.s, y: g.H * rand(0.11, 0.2) });
    if (Math.random() < 0.6) m.fruit.push({ x: (360 + k * 265 + 120) * g.s, y: g.H * rand(0.42, 0.62), got: false });
  }
  return m.anch[i];
}
registerMini({
  ch: 5, id: 'vine', name: 'Vine Swing', unit: 'points', dur: 40, goal: 45,
  blurb: 'The canopy is a long way up and the floor is not friendly.\nHold on to a vine to swing, let go to fly, and grab the next one. Fruit is worth extra.',
  hint: 'Hold Space, W or the mouse button to grab the nearest vine ahead. Let go to fly.\nRelease at the top of the swing to go farthest.',
  touchHint: 'Hold your finger down to grab the nearest vine ahead. Let go to fly.\nRelease at the top of the swing to go farthest.',
  goalText: 'Goal: 45 points in 40 seconds (a point every 200 steps, 2 for each fruit)',
  init: function(m, g){
    m.anch = []; m.fruit = []; vineAnchor(m, g, 12);
    m.p = { x: 200 * g.s, y: g.H * 0.45, vx: 250 * g.s, vy: 0, att: -1, len: 0, th: 0, om: 0 };
    m.cam = 0; m.maxX = 0; m.fruitN = 0; m.splash = 0; m.trees = miniBackdropSeed(14, 1, 1);
  },
  update: function(m, dt, g){
    const s = g.s, p = m.p, G0 = 900 * s, hold = m.in.jump;
    vineAnchor(m, g, Math.floor(p.x / (265 * s)) + 8);
    if (p.att < 0){
      if (hold){
        let bi = -1, bd = 1e9;
        for (let i = 0; i < m.anch.length; i++){
          const a = m.anch[i], dx = a.x - p.x, dy = a.y - p.y;
          if (dx < -20 * s || dx > 380 * s || dy > -50 * s) continue;
          const d = Math.hypot(dx, dy);
          if (d < bd && d > 90 * s){ bd = d; bi = i; }
        }
        if (bi >= 0){
          const a = m.anch[bi];
          p.att = bi; p.len = bd; p.th = Math.atan2(p.x - a.x, p.y - a.y);
          p.om = (p.vx * Math.cos(p.th) - p.vy * Math.sin(p.th)) / p.len;
          SFX.rustle();
        }
      }
      p.vy += G0 * dt; p.x += p.vx * dt; p.y += p.vy * dt;
      if (p.y > g.H * 0.9){
        m.time += 1.5; SFX.splash(); miniPop(m, p.x - m.cam, g.H * 0.8, '-1.5 seconds', '#9AE8FF');
        const i = clamp(Math.floor(p.x / (265 * s)), 0, m.anch.length - 1), a = m.anch[Math.min(i + 1, m.anch.length - 1)];
        p.att = Math.min(i + 1, m.anch.length - 1); p.len = 210 * s; p.th = 0.5; p.om = 1.0; p.x = a.x + Math.sin(p.th) * p.len; p.y = a.y + Math.cos(p.th) * p.len;
      }
    } else {
      const a = m.anch[p.att];
      p.om += (-(G0 / p.len) * Math.sin(p.th) + (p.om > 0 ? 0.3 : 0)) * dt;
      p.om *= 1 - 0.08 * dt;
      p.th += p.om * dt;
      p.x = a.x + p.len * Math.sin(p.th); p.y = a.y + p.len * Math.cos(p.th);
      if (!hold){
        p.vx = p.len * Math.cos(p.th) * p.om; p.vy = -p.len * Math.sin(p.th) * p.om; p.att = -1;
        if (p.vx < 120 * s) p.vx = 120 * s;
        SFX.whoosh();
      }
    }
    m.maxX = Math.max(m.maxX, p.x);
    for (let i = 0; i < m.fruit.length; i++){
      const f = m.fruit[i];
      if (!f.got && Math.hypot(f.x - p.x, f.y - p.y) < 40 * s){ f.got = true; m.fruitN++; SFX.pickupS(); miniPop(m, f.x - m.cam, f.y - 24 * s, '+2', '#FFE08A'); }
    }
    m.score = Math.floor(m.maxX / (200 * s)) + m.fruitN * 2;
    m.cam += ((p.x - g.W * 0.3) - m.cam) * Math.min(1, dt * 6);
  },
});

/* ---- 6. Rooftop dash (Houston) ---- */
function roofBuild(m, g, upTo){
  const s = g.s;
  while (m.roofEnd < upTo){
    const last = m.roofs[m.roofs.length - 1];
    const gap = m.roofs.length ? rand(95, 195) * s : 0, len = rand(320, 560) * s;
    const y = m.roofs.length ? clamp(last.y + rand(-70, 70) * s, g.H * 0.5, g.H * 0.76) : g.H * 0.64;
    const r = { x0: m.roofEnd + gap, x1: m.roofEnd + gap + len, y: y, box: null, drone: null };
    if (m.roofs.length > 1){
      if (Math.random() < 0.55) r.box = r.x0 + len * rand(0.35, 0.75);
      else if (Math.random() < 0.45) r.drone = { x: r.x0 + len * rand(0.3, 0.7), y: y - rand(70, 110) * s, ph: Math.random() * 6 };
    }
    m.roofs.push(r); m.roofEnd = r.x1;
    if (m.roofs.length > 1 && Math.random() < 0.7){
      const cx = r.x0 - gap / 2 - 10 * s;
      for (let k = 0; k < 3; k++) m.coins.push({ x: cx + k * 36 * s, y: Math.min(last.y, y) - (70 + Math.sin(k / 2 * Math.PI) * 60) * s, got: false });
    }
  }
}
registerMini({
  ch: 6, id: 'roof', name: 'Rooftop Dash', unit: 'points', dur: 40, goal: 44,
  blurb: 'Houston is quiet from the rooftops. Mostly.\nRun, jump the gaps, and mind the air conditioners and the drones.',
  hint: 'Jump with Space, W or the Up arrow, or click. Hold for a higher jump.\nThree hits and the run is over.',
  touchHint: 'Tap to jump, and hold for a higher jump.\nThree hits and the run is over.',
  goalText: 'Goal: 44 points in 40 seconds (a point every 260 steps, plus coins)',
  init: function(m, g){
    m.roofs = []; m.coins = []; m.roofEnd = -300 * g.s; roofBuild(m, g, g.W * 4);
    m.x = 60 * g.s; m.y = g.H * 0.64; m.vy = 0; m.ground = true; m.lives = 3; m.inv = 0; m.coinN = 0; m.cam = 0;
  },
  update: function(m, dt, g){
    const s = g.s;
    if (m.inv > 0) m.inv -= dt;
    roofBuild(m, g, m.x + g.W * 2.2);
    const v = (310 + m.time * 2.6) * s;
    m.x += v * dt;
    /* coyote time: she can still jump for a moment after running off a roof, and a jump pressed just before landing is not lost */
    if (m.ground) m.coyote = 0.12; else if (m.coyote > 0) m.coyote -= dt;
    if (miniJumpBuffered(m, 0.12) && (m.ground || m.coyote > 0)){ m.vy = -770 * s; m.ground = false; m.coyote = 0; miniJumpUse(m); SFX.whoosh(); }
    if (!m.in.jump && m.vy < -260 * s) m.vy *= 0.6;
    m.vy += 2000 * s * dt;
    const prevY = m.y; m.y += m.vy * dt;
    let roof = null;
    for (let i = 0; i < m.roofs.length; i++){ const r = m.roofs[i]; if (m.x >= r.x0 && m.x <= r.x1){ roof = r; break; } }
    if (roof && m.y >= roof.y && prevY <= roof.y + 12 * s && m.vy >= 0){ m.y = roof.y; m.vy = 0; m.ground = true; }
    else if (!roof || m.y < roof.y) m.ground = false;
    if (m.y > g.H + 80 * s){
      if (miniHurt(m, g.W * 0.3, g.H * 0.5, 'Fell!') || true){
        let next = null;
        for (let i = 0; i < m.roofs.length; i++) if (m.roofs[i].x0 > m.x){ next = m.roofs[i]; break; }
        if (next){ m.x = next.x0 + 50 * s; m.y = next.y - 4 * s; m.vy = 0; m.ground = true; m.inv = 1.6; }
      }
    }
    for (let i = 0; i < m.roofs.length; i++){
      const r = m.roofs[i];
      if (r.x1 < m.x - 200 * s) continue;
      if (r.box !== null && Math.abs(m.x - r.box) < 26 * s && m.y > r.y - 30 * s) miniHurt(m, g.W * 0.3, g.H * 0.4, 'Bump!');
      if (r.drone){ const d = r.drone; if (Math.hypot(m.x - d.x, (m.y - 30 * s) - (d.y + Math.sin(G.time * 3 + d.ph) * 10 * s)) < 36 * s) miniHurt(m, g.W * 0.3, g.H * 0.4, 'Zap!'); }
    }
    for (let i = 0; i < m.coins.length; i++){
      const c = m.coins[i];
      if (!c.got && Math.hypot(c.x - m.x, c.y - (m.y - 30 * s)) < 38 * s){ c.got = true; m.coinN++; SFX.coin(); miniPop(m, g.W * 0.3 + 30 * s, m.y - 70 * s, '+1', '#FFE08A'); }
    }
    m.score = Math.floor(m.x / (260 * s)) + m.coinN;
    m.cam = m.x - g.W * 0.3;
  },
});
