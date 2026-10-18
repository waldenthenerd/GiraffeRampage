'use strict';
/* =============================================================================================================================
   44zt-sea-deep.js  --  THE DEEP: the sea's border is open, dark ocean, with sharks. A shark bite sinks the boat.

   44zq-sea.js has no wall at the edge of the map: the water deepens toward every edge (seaDeepF, seaLevel and the colour table there; land stays
   land), past the edge is open water, and you may sail right out into it. This file puts the danger there. When the boat is in the deep
   (seaDeepF > 0.4) shadows rise under it, turn into sharks, stalk it, lunge, and bite. Sharks only live in deep water (seaDeepF > 0.3 and the
   water itself deeper than -0.5, never over shallows, reefs or beaches) and give up when the boat leaves it. One bite destroys the boat: a short
   cutscene follows (the shark breaches over the boat, planks scatter, she floats on a life ring, a rescue boat comes in from the open sea, takes
   her aboard and tows her home to the Harbour). The boat itself is salvaged, so it is never lost for good, but the repair costs 5% of its price
   (as much as she has, never more). Sailing 120 units past the map's edge is the same as a bite. Fast boats can outrun a stalking shark
   (stalk 170) but not a lunge (340). Skip the scene with any key or a click after two seconds. Esc does the same while it plays.
   Hooks: updateSea, seaDrawFeatures, seaDrawBoat, renderSea, seaMapColour, seaStart (all wrapped).
   ============================================================================================================================= */
(function(){
  const DEEP = 0.4;
  Sea.sharks = []; Sea.deepT = 0; Sea.sunk = null; Sea.deepWarn = 0; Sea.bites = 0;
  const sharkOk = function(x, y){ return seaDeepF(x, y) > 0.3 && seaLevel(x, y) < -0.5; };
  const ease = function(u){ u = Math.max(0, Math.min(1, u)); return 1 - Math.pow(1 - u, 3); };

  const seaStart0 = seaStart;
  seaStart = function(from){ Sea.sharks = []; Sea.deepT = 0; Sea.sunk = null; Sea.bites = 0; Sea.deepWarn = 0; return seaStart0.apply(this, arguments); };

  const mc = seaMapColour;
  seaMapColour = function(i){
    const x = (i % SEA_MAP_N) * SEA_MAP_C + SEA_MAP_C / 2, y = Math.floor(i / SEA_MAP_N) * SEA_MAP_C + SEA_MAP_C / 2, f = seaDeepF(x, y);
    return f > 0.55 && seaTypeAt(x, y) <= SEA_WATER ? '#0A1C3E' : f > DEEP && seaTypeAt(x, y) <= SEA_WATER ? '#123A6E' : mc(i);
  };

  function spawn(){
    for (let tries = 0; tries < 16; tries++){
      const a = Math.random() * TAU, d = 330 + Math.random() * 120, x = Sea.x + Math.cos(a) * d, y = Sea.y + Math.sin(a) * d;
      if (x < 40 || y < 40 || x > SEA_W - 40 || y > SEA_W - 40 || !sharkOk(x, y)) continue;
      Sea.sharks.push({ x: x, y: y, a: Math.atan2(Sea.y - y, Sea.x - x), st: 'stalk', t: 0, ph: Math.random() * 6, tail: 0 });
      return;
    }
  }

  /* ---- the sinking ---- */
  function sink(sx, sy, sa){
    const B = boatSel(), price = B.price | 0, fee = Math.min(Save.data.gold | 0, Math.round(price * 0.05));
    const planks = [];
    for (let i = 0; i < 11; i++){ const a = Math.random() * TAU, sp = 60 + Math.random() * 150; planks.push({ x: Sea.x, y: Sea.y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, a: Math.random() * TAU, va: (Math.random() - 0.5) * 7, l: 12 + Math.random() * 16, c: i % 3 ? B.col : '#6A4A28' }); }
    const toward = Math.atan2(SEA_W / 2 - Sea.y, SEA_W / 2 - Sea.x);
    Sea.sunk = { t: 0, x: Sea.x, y: Sea.y, h: Sea.h, sx: sx, sy: sy, sa: sa, planks: planks, fee: fee, toward: toward, boat: B.name, done: false };
    Sea.thr = 0; Sea.v = 0; Sea.shake = 1; Sea.bites++;
    Sea.sharks.forEach(function(s){ s.st = 'flee'; s.t = 0; s.a = Math.atan2(s.y - Sea.y, s.x - Sea.x); });
    try { SFX.tone('sawtooth', 220, 40, 0.5, 0.2, 0, 0); SFX.tone('square', 90, 40, 0.3, 0.16, 0, 0); } catch (e) {}
  }
  function finishSunk(){
    const S = Sea.sunk; if (!S || S.done) return; S.done = true;
    if (S.fee > 0){ Save.data.gold = Math.max(0, (Save.data.gold | 0) - S.fee); Save.write(); }
    const txt = S.fee > 0 ? 'The ' + S.boat + ' was towed in. Repairs: ' + fmt(S.fee) + ' gold.' : 'The ' + S.boat + ' was towed in. The yard repaired it for free this once.';
    Sea.sunk = null; Sea.sharks = [];
    seaArrive('harbour');
    try { screenFadeIn(0.8); townToast(txt, '#FFE9A0'); } catch (e) {}
  }
  function runSunk(dt){
    const S = Sea.sunk; dt = Math.min(dt, 0.05);
    S.t += dt; Sea.t += dt; G.time += dt;
    if (Sea.shake > 0) Sea.shake = Math.max(0, Sea.shake - dt * 1.2);
    S.planks.forEach(function(p){ const k = Math.pow(0.12, dt); p.x += p.vx * dt; p.y += p.vy * dt; p.vx *= k; p.vy *= k; p.a += p.va * dt; p.va *= k; });
    Sea.sharks.forEach(function(s){ s.tail += dt * 6; s.x += Math.cos(s.a) * 150 * dt; s.y += Math.sin(s.a) * 150 * dt; });
    if (S.t > 3.2) Sea.sharks.length = 0;
    if (S.t > 9.4) finishSunk();
  }
  window.seaSkipSunk = function(){ if (Sea.sunk && Sea.sunk.t > 2 && Sea.sunk.t < 8){ Sea.sunk.t = 8; return true; } return false; };
  window.addEventListener('keydown', function(e){ if (!Sea.sunk) return; e.preventDefault(); e.stopImmediatePropagation(); seaSkipSunk(); }, true);
  window.addEventListener('pointerdown', function(){ if (Sea.sunk) seaSkipSunk(); }, true);

  const us = updateSea;
  updateSea = function(dt){
    if (Sea.sunk){ if (Sea.on && G.state === 'sail') runSunk(dt); return; }
    us(dt);
    if (!Sea.on || G.state !== 'sail') return;
    dt = Math.min(dt, 0.05);
    if (Sea.x < -120 || Sea.y < -120 || Sea.x > SEA_W + 120 || Sea.y > SEA_W + 120){ sink(Sea.x, Sea.y, Sea.h + Math.PI); return; }       /* the open ocean takes anyone who goes that far */
    const f = seaDeepF(Sea.x, Sea.y), deep = f > DEEP && seaLevel(Sea.x, Sea.y) < -0.45;
    if (deep){
      if (Sea.deepT === 0) Sea.deepWarn = 3.2;
      Sea.deepT += dt || 0.001;
      const want = f > 0.8 ? 3 : f > 0.6 ? 2 : 1;
      Sea.spT = (Sea.spT || 0) - dt;
      if (Sea.sharks.length < want && Sea.deepT > 1.2 && Sea.spT <= 0){ spawn(); Sea.spT = 2.5; }
    } else { Sea.deepT = 0; }
    if (Sea.deepWarn > 0) Sea.deepWarn -= dt;
    for (let i = Sea.sharks.length - 1; i >= 0; i--){
      const s = Sea.sharks[i], dx = Sea.x - s.x, dy = Sea.y - s.y, d = Math.hypot(dx, dy), to = Math.atan2(dy, dx);
      s.t += dt; s.tail += dt * (s.st === 'lunge' ? 14 : 7);
      let sp = 170, want = to;
      if (s.st === 'stalk'){
        want = to + Math.sin(s.t * 1.4 + s.ph) * 0.5;
        if (d < 180 && s.t > 1.2){ s.st = 'lunge'; s.t = 0; }
      } else if (s.st === 'lunge'){
        sp = 340; want = to; if (s.t > 1.1){ s.st = 'stalk'; s.t = 0; }
        if (d < 42 && deep){ sink(s.x, s.y, s.a); return; }
      } else { sp = 170; want = to + Math.PI * 0.8; if (s.t > 2.4){ s.st = 'stalk'; s.t = 0; } }
      let da = want - s.a; while (da > Math.PI) da -= TAU; while (da < -Math.PI) da += TAU;
      s.a += clamp(da, -1, 1) * dt * (s.st === 'lunge' ? 5 : 3);
      const nx = s.x + Math.cos(s.a) * sp * dt, ny = s.y + Math.sin(s.a) * sp * dt;
      if (nx > 30 && ny > 30 && nx < SEA_W - 30 && ny < SEA_W - 30 && sharkOk(nx, ny)){ s.x = nx; s.y = ny; }
      else { s.a += 4.5 * dt; if (s.st === 'lunge') s.st = 'stalk'; }
      if (!deep && d > 300 || d > 1100 || !sharkOk(s.x, s.y) && d > 300) Sea.sharks.splice(i, 1);
    }
  };

  /* ---- drawing ---- */
  function drawShark(ctx, s, z, t){
    const lunging = s.st === 'lunge', alpha = s.alpha !== undefined ? s.alpha : lunging ? 1 : s.st === 'flee' ? 0.8 : 0.5, sw = Math.sin(s.tail) * 0.35;
    ctx.save(); ctx.translate(s.sx, s.sy); ctx.rotate(s.a); ctx.scale(z, z); ctx.globalAlpha = alpha;
    ctx.fillStyle = 'rgba(0,10,30,.35)'; ctx.beginPath(); ctx.ellipse(4, 6, 46, 14, 0, 0, TAU); ctx.fill();
    ctx.save(); ctx.rotate(sw * 0.4);
    ctx.fillStyle = '#5E6C7C'; ctx.beginPath(); ctx.moveTo(48, 0); ctx.quadraticCurveTo(20, -17, -22, -8); ctx.lineTo(-36, 0); ctx.lineTo(-22, 8); ctx.quadraticCurveTo(20, 17, 48, 0); ctx.fill();
    ctx.fillStyle = '#E4EAF0'; ctx.beginPath(); ctx.moveTo(44, 2); ctx.quadraticCurveTo(18, 12, -18, 5); ctx.lineTo(-18, 7); ctx.quadraticCurveTo(18, 16, 44, 2); ctx.fill();
    ctx.restore();
    ctx.save(); ctx.translate(-34, 0); ctx.rotate(sw); ctx.fillStyle = '#4E5C6C'; ctx.beginPath(); ctx.moveTo(4, 0); ctx.lineTo(-18, -18); ctx.lineTo(-10, 0); ctx.lineTo(-20, 16); ctx.closePath(); ctx.fill(); ctx.restore();
    ctx.fillStyle = '#4E5C6C'; ctx.beginPath(); ctx.moveTo(18, -10); ctx.lineTo(2, -30); ctx.lineTo(8, -8); ctx.fill(); ctx.beginPath(); ctx.moveTo(18, 10); ctx.lineTo(2, 30); ctx.lineTo(8, 8); ctx.fill();
    ctx.fillStyle = '#46525F'; ctx.beginPath(); ctx.moveTo(8, 0); ctx.lineTo(-8, -3); ctx.lineTo(-4, 3); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#0A0A10'; ctx.beginPath(); ctx.arc(34, -6, 2.2, 0, TAU); ctx.arc(34, 6, 2.2, 0, TAU); ctx.fill();
    if (lunging){ ctx.fillStyle = '#FFF'; ctx.beginPath(); ctx.moveTo(48, -4); ctx.lineTo(54, 0); ctx.lineTo(48, 4); ctx.closePath(); ctx.fill(); }
    ctx.restore();
    ctx.save(); ctx.strokeStyle = 'rgba(255,255,255,' + (lunging ? 0.4 : 0.2) + ')'; ctx.lineWidth = 2 * z; ctx.lineCap = 'round';
    ctx.translate(s.sx, s.sy); ctx.rotate(s.a); ctx.beginPath(); ctx.moveTo(-34 * z, -4 * z); ctx.lineTo(-74 * z, -18 * z); ctx.moveTo(-34 * z, 4 * z); ctx.lineTo(-74 * z, 18 * z); ctx.stroke(); ctx.restore();
  }
  function drawRescue(ctx, x, y, ang, z, aboard, t){
    const cl = typeof giraffeColours === 'function' ? giraffeColours() : { coat: '#E8B648', spot: '#8A5A24' };
    ctx.save(); ctx.translate(x, y); ctx.rotate(ang); ctx.scale(z * 1.15, z * 1.15);
    ctx.fillStyle = 'rgba(0,0,0,.22)'; ctx.beginPath(); ctx.ellipse(3, 5, 44, 17, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = '#2F8A6A'; ctx.beginPath(); ctx.moveTo(46, 0); ctx.quadraticCurveTo(36, -19, 0, -19); ctx.lineTo(-40, -17); ctx.lineTo(-40, 17); ctx.lineTo(0, 19); ctx.quadraticCurveTo(36, 19, 46, 0); ctx.fill();
    ctx.fillStyle = '#F2C230'; ctx.fillRect(-40, -3, 84, 6); ctx.fillStyle = '#F4F1E8'; ctx.fillRect(-26, -12, 24, 24); ctx.fillStyle = '#2A2A34'; ctx.fillRect(-8, -9, 5, 18);
    ctx.fillStyle = '#D5352B'; ctx.beginPath(); ctx.arc(-14, 0, 6, 0, TAU); ctx.fill(); ctx.fillStyle = '#FFF'; ctx.beginPath(); ctx.arc(-14, 0, 3, 0, TAU); ctx.fill();
    ctx.strokeStyle = '#3A3A44'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-38, -12); ctx.lineTo(-30, -12); ctx.moveTo(-38, 12); ctx.lineTo(-30, 12); ctx.stroke();
    if (aboard){ ctx.fillStyle = cl.coat; ctx.beginPath(); ctx.ellipse(14, 0, 8, 6, 0, 0, TAU); ctx.fill(); ctx.fillRect(14, -2.2, 14, 4.4); ctx.beginPath(); ctx.ellipse(30, 0, 6.5, 4.6, 0, 0, TAU); ctx.fill(); ctx.fillStyle = cl.spot; ctx.beginPath(); ctx.arc(11, -2, 2.2, 0, TAU); ctx.arc(18, 2, 1.8, 0, TAU); ctx.fill(); ctx.fillStyle = '#4A2E12'; ctx.beginPath(); ctx.arc(28, -3.6, 1.4, 0, TAU); ctx.arc(28, 3.6, 1.4, 0, TAU); ctx.fill(); }
    ctx.restore();
  }
  function drawRing(ctx, x, y, z, t){
    const cl = typeof giraffeColours === 'function' ? giraffeColours() : { coat: '#E8B648', spot: '#8A5A24' }, bob = Math.sin(t * 2.2) * 2;
    ctx.save(); ctx.translate(x, y + bob); ctx.scale(z, z);
    ctx.fillStyle = 'rgba(0,10,30,.22)'; ctx.beginPath(); ctx.ellipse(2, 4, 24, 20, 0, 0, TAU); ctx.fill();
    for (let i = 0; i < 8; i++){ ctx.strokeStyle = i % 2 ? '#F4F1E8' : '#E8552B'; ctx.lineWidth = 8; ctx.beginPath(); ctx.arc(0, 0, 19, i * TAU / 8, (i + 1) * TAU / 8); ctx.stroke(); }
    ctx.fillStyle = cl.coat; ctx.beginPath(); ctx.ellipse(-3, 0, 9, 7, 0, 0, TAU); ctx.fill(); ctx.fillRect(-3, -2.2, 18, 4.4); ctx.beginPath(); ctx.ellipse(17, 0, 6.5, 4.6, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = cl.spot; ctx.beginPath(); ctx.arc(-6, -2, 2.2, 0, TAU); ctx.arc(1, 2, 1.8, 0, TAU); ctx.fill();
    ctx.fillStyle = '#4A2E12'; ctx.beginPath(); ctx.arc(15, -3.6, 1.4, 0, TAU); ctx.arc(15, 3.6, 1.4, 0, TAU); ctx.fill();
    ctx.restore();
  }
  function drawSunk(ctx, W, H, z, camX, camY, t){
    const S = Sea.sunk, sc = function(x, y){ return seaWorldToScreen(x, y, W, H, z, camX, camY); };
    if (S.t < 1.6){                                                                      /* the splash */
      const p = sc(S.x, S.y);
      for (let k = 0; k < 3; k++){ const u = S.t - k * 0.18; if (u <= 0) continue; ctx.strokeStyle = 'rgba(255,255,255,' + Math.max(0, 0.7 - u * 0.45).toFixed(2) + ')'; ctx.lineWidth = (5 - k) * z; ctx.beginPath(); ctx.arc(p.x, p.y, (14 + u * 90) * z, 0, TAU); ctx.stroke(); }
    }
    S.planks.forEach(function(pl){ const p = sc(pl.x, pl.y + Math.sin(t * 2 + pl.a) * 2); ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(pl.a); ctx.fillStyle = 'rgba(0,10,30,.25)'; ctx.fillRect(-pl.l / 2 * z + 2, -3 * z + 3, pl.l * z, 6 * z); ctx.fillStyle = pl.c; ctx.fillRect(-pl.l / 2 * z, -3 * z, pl.l * z, 6 * z); ctx.restore(); });
    if (S.t < 0.95){                                                                     /* the shark breaches over the boat */
      const m = Math.min(1, S.t / 0.3), p = sc(S.sx + (S.x - S.sx) * m, S.sy + (S.y - S.sy) * m), k = 1 + 0.9 * Math.sin(Math.PI * S.t / 0.95);
      drawShark(ctx, { sx: p.x, sy: p.y, a: Math.atan2(S.y - S.sy, S.x - S.sx), st: 'lunge', tail: S.t * 16, alpha: 1 }, z * k, t);
    }
    const ring = S.t > 0.7 ? sc(S.x, S.y) : null;
    const T0 = 2.4, T1 = 5.2, T2 = 6.2, dirIn = S.toward, startD = 850;
    let rb = null;
    if (S.t >= T0){
      const u = ease((S.t - T0) / (T1 - T0)), d = S.t < T1 ? startD * (1 - u) + 62 * u : 62;
      let ang = dirIn + Math.PI, bx = S.x + Math.cos(dirIn) * d, by = S.y + Math.sin(dirIn) * d;
      if (S.t > T2){                                                                      /* turns about and tows her away, back the way it came */
        const turn = Math.min(1, (S.t - T2) / 0.9), run = Math.pow((S.t - T2) / 3, 1.6) * 760;
        ang = dirIn + Math.PI + (1 - Math.cos(turn * Math.PI)) / 2 * Math.PI;
        bx = S.x + Math.cos(dirIn) * 62 + Math.cos(ang) * run; by = S.y + Math.sin(dirIn) * 62 + Math.sin(ang) * run;
      }
      rb = { x: bx, y: by, ang: ang };
      if (S.t < T1 || S.t > T2){ ctx.strokeStyle = 'rgba(255,255,255,.4)'; ctx.lineWidth = 2.5 * z; ctx.lineCap = 'round'; for (let k = 1; k < 5; k++){ const p2 = sc(bx - Math.cos(ang) * k * 18, by - Math.sin(ang) * k * 18); ctx.beginPath(); ctx.arc(p2.x, p2.y, (3 + k * 1.6) * z, 0, TAU); ctx.stroke(); } }
    }
    if (ring && S.t < T2 - 0.2){
      const u = S.t > T1 ? Math.min(1, (S.t - T1) / 0.9) : 0, bp = rb ? sc(rb.x, rb.y) : ring;
      drawRing(ctx, ring.x + (bp.x - ring.x) * u, ring.y + (bp.y - ring.y) * u, z * (1 - 0.5 * u), t);
    }
    if (rb){ const q = sc(rb.x, rb.y); drawRescue(ctx, q.x, q.y, rb.ang, z, S.t > T2 - 0.2, t); }
  }

  const sb = seaDrawBoat;
  seaDrawBoat = function(){ if (Sea.sunk && Sea.sunk.t > 0.3) return; return sb.apply(this, arguments); };
  const df = seaDrawFeatures;
  seaDrawFeatures = function(ctx, W, H, z, camX, camY, t){
    df.apply(this, arguments);
    Sea.sharks.forEach(function(s){
      const p = seaWorldToScreen(s.x, s.y, W, H, z, camX, camY);
      if (p.x < -140 || p.x > W + 140 || p.y < -140 || p.y > H + 140) return;
      s.sx = p.x; s.sy = p.y; drawShark(ctx, s, z, t);
    });
    if (Sea.sunk) drawSunk(ctx, W, H, z, camX, camY, t);
  };

  const rs = renderSea;
  renderSea = function(ctx){
    rs(ctx);
    if (!Sea.on) return;
    const W = G.W, H = G.H, f = seaDeepF(Sea.x, Sea.y), s = clamp(Math.min(H / 600, W / 800), 0.8, 1.2), S = Sea.sunk;
    if (f > 0.15){                                                                       /* the water darkens in a ring around the view */
      const a = Math.min(0.4, (f - 0.15) * 0.6), g = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.25, W / 2, H / 2, Math.max(W, H) * 0.7);
      g.addColorStop(0, 'rgba(2,8,26,0)'); g.addColorStop(1, 'rgba(2,8,26,' + a.toFixed(2) + ')'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    }
    if (!S && Sea.deepWarn > 0){
      const pulse = 0.6 + 0.4 * Math.sin(Sea.t * 6);
      ctx.globalAlpha = Math.min(1, Sea.deepWarn) * pulse; miniText(ctx, 'THE DEEP  ·  SHARKS', W / 2, 96 * s, 20 * s, '#FF8A7A', 'center'); ctx.globalAlpha = 1;
    }
    if (S){
      const caps = [[0, 'CRUNCH!', '#FF6A5A', 30], [1.3, 'The shark swallowed the boat whole.', '#FFF6E0', 20], [3.2, 'Help!', '#FFE9A0', 26], [4.2, 'A fishing boat has spotted her.', '#FFF6E0', 20], [6.2, 'Hauled aboard, wet and a little embarrassed.', '#FFF6E0', 20], [7.6, 'Home to the Harbour.', '#FFE9A0', 22]];
      let c = caps[0]; caps.forEach(function(k){ if (S.t >= k[0]) c = k; });
      ctx.fillStyle = 'rgba(8,10,20,.55)'; ctx.fillRect(0, H * 0.78, W, 64 * s); miniText(ctx, c[1], W / 2, H * 0.78 + 40 * s, c[3] * s, c[2], 'center');
      if (S.t > 2 && S.t < 8) miniText(ctx, 'press any key to skip', W - 100 * s, H - 14 * s, 11 * s, 'rgba(255,246,224,.6)', 'center', false);
      if (S.t < 0.25){ ctx.fillStyle = 'rgba(255,255,255,' + (0.4 * (1 - S.t / 0.25)).toFixed(2) + ')'; ctx.fillRect(0, 0, W, H); }
      if (S.t > 8){ ctx.fillStyle = 'rgba(0,0,0,' + Math.min(1, (S.t - 8) / 1.2).toFixed(2) + ')'; ctx.fillRect(0, 0, W, H); }
    }
  };
})();
