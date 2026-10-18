'use strict';
/* Minigame polish: ambient life, parallax, a colour grade per scene, squash / stretch / trails / footprints, a nicer intro, the top bar. */
/* ========================= 44l. MINIGAMES: VISUAL POLISH ========================= */
/* Nothing here changes how a minigame plays. It wraps the drawing: each MINI[n].draw gets a camera push-in during the intro, the ambient
   layers and the colour grade; miniLayer() gets a gentle parallax; the two giraffe drawers get squash, stretch, afterimages and
   footprints; miniIntro() eases in; miniHud() replaces the plain bar. Per-minigame state lives in m.pol. */

const POL_ICON = { 1: 'x-drop', 2: 'x-flare', 3: 'x-lotus', 4: 'x-riptide', 5: 'x-tree', 6: 'x-home', 7: 'x-fuel', 8: 'x-moon', 9: 'x-bubbles', 10: 'x-barrel',
  11: 'x-bulb', 12: 'x-cog', 13: 'x-burrow' };

function polRh(i, k){ const v = Math.sin(i * 127.1 + k * 311.7) * 43758.5453; return v - Math.floor(v); }

/* ---- ambient life: each kind draws its whole set from the clock alone, so nothing needs storing ---- */
let _polM = null;
const POL_KIND = {
  motes: function(c, W, H, s, t, rgb){                                   /* pollen, dust, spores drifting */
    for (let i = 0; i < 26; i++){
      const x = (polRh(i, 1) * W + t * (5 + polRh(i, 2) * 9) * s) % W, y = polRh(i, 3) * H + Math.sin(t * 0.4 + i) * 14 * s;
      const a = 0.12 + 0.22 * (0.5 + 0.5 * Math.sin(t * 0.9 + i * 1.7));
      c.fillStyle = 'rgba(' + rgb + ',' + a.toFixed(3) + ')'; c.beginPath(); c.arc(x, y, (0.8 + polRh(i, 4) * 1.8) * s, 0, TAU); c.fill();
    }
  },
  snow: function(c, W, H, s, t){
    c.fillStyle = 'rgba(255,255,255,.6)';
    for (let i = 0; i < 64; i++){
      const y = (polRh(i, 1) * H + t * (28 + polRh(i, 2) * 40) * s) % H, x = (polRh(i, 3) * W + Math.sin(t * 0.7 + i) * 18 * s + t * 8 * s + W) % W;
      c.globalAlpha = 0.35 + polRh(i, 5) * 0.4; c.beginPath(); c.arc(x, y, (1 + polRh(i, 4) * 2) * s, 0, TAU); c.fill();
    }
    c.globalAlpha = 1;
  },
  embers: function(c, W, H, s, t, rgb){
    for (let i = 0; i < 36; i++){
      const p = (t * (0.08 + polRh(i, 1) * 0.1) + polRh(i, 2)) % 1, x = polRh(i, 3) * W + Math.sin(t * 1.3 + i) * 22 * s, y = H * (1.03 - p * 1.1);
      const a = (1 - p) * (0.45 + 0.4 * Math.sin(t * 9 + i * 3));
      c.fillStyle = 'rgba(' + rgb + ',' + Math.max(0, a).toFixed(3) + ')'; c.beginPath(); c.arc(x, y, (1 + polRh(i, 4) * 2.2) * s * (1 - p * 0.5), 0, TAU); c.fill();
    }
  },
  bubbles: function(c, W, H, s, t, rgb){
    c.lineWidth = 1.4 * s;
    for (let i = 0; i < 14; i++){
      const p = (t * (0.07 + polRh(i, 1) * 0.07) + polRh(i, 2)) % 1, x = polRh(i, 3) * W + Math.sin(t * 0.8 + i) * 12 * s, y = H * (1.04 - p * 1.1);
      c.strokeStyle = 'rgba(' + rgb + ',' + (0.4 * (1 - p)).toFixed(3) + ')'; c.beginPath(); c.arc(x, y, (3 + polRh(i, 4) * 7) * s, 0, TAU); c.stroke();
    }
  },
  fireflies: function(c, W, H, s, t, rgb){
    for (let i = 0; i < 11; i++){
      const x = polRh(i, 1) * W + Math.sin(t * 0.4 + i * 2) * 60 * s, y = H * (0.12 + polRh(i, 2) * 0.76) + Math.cos(t * 0.5 + i) * 40 * s;
      const a = Math.max(0, Math.sin(t * 1.7 + i * 2.3));
      if (a < 0.05) continue;
      miniGlow(c, x, y, 12 * s, rgb, (0.55 * a).toFixed(3));
      c.fillStyle = 'rgba(255,255,230,' + a.toFixed(3) + ')'; c.beginPath(); c.arc(x, y, 1.6 * s, 0, TAU); c.fill();
    }
  },
  leaves: function(c, W, H, s, t, col){
    c.fillStyle = col;
    for (let i = 0; i < 12; i++){
      const x = polRh(i, 1) * W + Math.sin(t * 0.9 + i) * 40 * s, y = (polRh(i, 2) * H + t * (22 + polRh(i, 3) * 18) * s) % (H + 30) - 15;
      c.save(); c.translate(x, y); c.rotate(t * (0.6 + polRh(i, 4)) + i); c.globalAlpha = 0.75; c.beginPath(); c.ellipse(0, 0, 6 * s, 2.8 * s, 0, 0, TAU); c.fill(); c.restore();
    }
  },
  birds: function(c, W, H, s, t, col){
    c.strokeStyle = col; c.lineWidth = 1.8 * s; c.lineCap = 'round'; c.lineJoin = 'round'; c.globalAlpha = 0.65;
    for (let i = 0; i < 4; i++){
      const x = ((t * (30 + polRh(i, 1) * 10) * s + i * 90 * s) % (W + 140 * s)) - 70 * s, y = H * (0.1 + 0.035 * i) + Math.sin(t * 1.2 + i) * 8 * s;
      const f = Math.sin(t * 9 + i * 2) * 4.5 * s;
      c.beginPath(); c.moveTo(x - 8 * s, y - f); c.lineTo(x, y); c.lineTo(x + 8 * s, y - f); c.stroke();
    }
    c.globalAlpha = 1;
  },
  fish: function(c, W, H, s, t){
    c.fillStyle = 'rgba(8,24,18,.2)';
    for (let i = 0; i < 4; i++){
      const x = ((t * (14 + polRh(i, 1) * 10) * s + polRh(i, 2) * W) % (W + 90 * s)) - 45 * s, y = H * (0.25 + polRh(i, 3) * 0.6), w = Math.sin(t * 5 + i) * 3 * s;
      c.beginPath(); c.ellipse(x, y, 12 * s, 4.2 * s, 0, 0, TAU); c.fill();
      c.beginPath(); c.moveTo(x - 10 * s, y); c.lineTo(x - 19 * s, y - 5 * s + w); c.lineTo(x - 19 * s, y + 5 * s + w); c.closePath(); c.fill();
    }
  },
  streak: function(c, W, H, s, t){                                        /* a shooting star every few seconds */
    const per = 4.5, k = Math.floor(t / per), u = (t % per) / 0.7;
    if (u >= 1) return;
    const x0 = W * (0.2 + 0.7 * polRh(k, 5)), y0 = H * (0.06 + 0.3 * polRh(k, 6));
    const hx = x0 - u * 280 * s, hy = y0 + u * 130 * s;
    const gr = c.createLinearGradient(hx, hy, hx + 70 * s, hy - 32 * s);
    gr.addColorStop(0, 'rgba(255,255,255,' + (0.9 * (1 - u)).toFixed(3) + ')'); gr.addColorStop(1, 'rgba(255,255,255,0)');
    c.strokeStyle = gr; c.lineWidth = 2 * s; c.lineCap = 'round'; c.beginPath(); c.moveTo(hx, hy); c.lineTo(hx + 70 * s, hy - 32 * s); c.stroke();
  },
  sand: function(c, W, H, s, t){
    c.strokeStyle = 'rgba(245,220,175,.14)'; c.lineWidth = 1.6 * s; c.lineCap = 'round';
    for (let i = 0; i < 22; i++){
      const x = (polRh(i, 1) * W + t * (180 + polRh(i, 2) * 120) * s) % (W + 100) - 50, y = polRh(i, 3) * H, l = (20 + polRh(i, 4) * 30) * s;
      c.beginPath(); c.moveTo(x, y); c.lineTo(x + l, y + l * 0.08); c.stroke();
    }
  },
  glyphs: function(c, W, H, s, t){
    c.font = Math.round(12 * s) + 'px ui-monospace, Consolas, monospace'; c.textAlign = 'center';
    for (let i = 0; i < 28; i++){
      const p = (t * (0.04 + polRh(i, 1) * 0.05) + polRh(i, 2)) % 1, x = polRh(i, 3) * W, y = H * (1.04 - p * 1.1);
      c.fillStyle = 'rgba(120,255,170,' + (0.2 * Math.sin(p * Math.PI)).toFixed(3) + ')';
      c.fillText(polRh(i, 4) < 0.5 ? '0' : '1', x, y);
    }
  },
  speedh: function(c, W, H, s, t){                                         /* wind or speed streaks, running right to left */
    c.strokeStyle = 'rgba(255,255,255,.12)'; c.lineWidth = 1.6 * s; c.lineCap = 'round';
    for (let i = 0; i < 9; i++){
      const sp = (900 + polRh(i, 1) * 500) * s, x = W + 140 * s - ((t * sp + polRh(i, 2) * W) % (W + 280 * s)), y = H * (0.12 + polRh(i, 3) * 0.78), l = (60 + polRh(i, 4) * 80) * s;
      c.beginPath(); c.moveTo(x, y); c.lineTo(x + l, y); c.stroke();
    }
  },
  speedv: function(c, W, H, s, t){
    const f = _polM && _polM.boost > 0 ? 2.4 : 1;
    c.strokeStyle = 'rgba(255,240,210,' + (0.09 * f).toFixed(3) + ')'; c.lineWidth = 1.6 * s; c.lineCap = 'round';
    for (let i = 0; i < 12; i++){
      const sp = (800 + polRh(i, 1) * 500) * s * f, y = ((t * sp + polRh(i, 2) * H) % (H + 200 * s)) - 100 * s, x = polRh(i, 3) * W, l = (50 + polRh(i, 4) * 60) * s * f;
      c.beginPath(); c.moveTo(x, y); c.lineTo(x, y + l); c.stroke();
    }
  }
};
const POL_AMB = {
  1: { back: ['birds:#2A2018'], front: ['motes:255,232,160'] },
  2: { front: ['snow'] },
  3: { back: ['fish'], front: ['fireflies:220,255,140', 'motes:200,255,200'] },
  4: { back: ['birds:#FFFFFF'], front: ['speedh', 'motes:255,255,255'] },
  5: { front: ['leaves:#6E9A2E', 'fireflies:255,240,150'] },
  6: { front: ['speedh', 'motes:255,200,150', 'birds:#1E1A2A'] },
  7: { back: ['streak'], front: ['motes:170,190,255'] },
  8: { back: ['streak'], front: ['motes:230,235,255'] },
  9: { front: ['bubbles:170,255,120', 'motes:200,255,140'] },
  10: { front: ['embers:255,150,60'] },
  11: { front: ['fireflies:120,230,255', 'motes:140,200,255'] },
  12: { back: ['glyphs'], front: ['motes:120,255,170'] },
  13: { front: ['sand', 'speedv'] }
};
function miniAmbient(ctx, m, g, layer){
  const set = POL_AMB[m.ch]; if (!set || !set[layer]) return;
  const fx = typeof fxLevelNow === 'function' ? fxLevelNow() : 2;                 /* the effects level (Settings, or lowered by the slow-device governor) */
  if (fx < 1) return;
  _polM = m;
  const t = G.time, n = fx < 2 ? 1 : set[layer].length; ctx.save();
  for (let i = 0; i < n; i++){
    const spec = set[layer][i], ci = spec.indexOf(':'), name = ci > 0 ? spec.slice(0, ci) : spec, arg = ci > 0 ? spec.slice(ci + 1) : '';
    const f = POL_KIND[name]; if (f) f(ctx, g.W, g.H, g.s, t, arg);
  }
  ctx.restore();
}

/* ---- parallax: a full-screen backdrop drifts a little against the action, and breathes ---- */
const POL_PARALLAX = { 2: 1, 3: 1, 7: 1, 8: 1, 9: 1, 10: 1, 11: 1 };         /* the backdrops with nothing the game measures against */
miniLayer = function(ctx, m, g, key, paint, w, h, x, y){
  const e = miniBg(m, g, key, paint, w, h);
  if (POL_PARALLAX[m.ch] && !w && !h && !x && !y){
    const P = m.pol || (m.pol = {}), f = m.focus || { x: g.W / 2, y: g.H / 2 };
    P.px = (P.px || 0) + ((f.x - g.W / 2) / g.W - (P.px || 0)) * 0.06;
    P.py = (P.py || 0) + ((f.y - g.H / 2) / g.H - (P.py || 0)) * 0.06;
    const ox = -P.px * g.W * 0.02 + Math.sin(G.time * 0.17) * g.W * 0.004, oy = -P.py * g.H * 0.02 + Math.cos(G.time * 0.13) * g.H * 0.004;
    ctx.drawImage(e.cv, -g.W * 0.015 + ox, -g.H * 0.015 + oy, g.W * 1.03, g.H * 1.03);
  } else ctx.drawImage(e.cv, x || 0, y || 0, e.w, e.h);
  miniAmbient(ctx, m, g, 'back');
};

/* ---- a colour grade for each scene: light, haze and a mood ---- */
const POL_GRADE = {
  1:  { ops: [['soft-light', '255,170,70', 0.5, 'full'], ['screen', '255,200,120', 0.16, 'tr']], rays: '255,230,170' },
  2:  { ops: [['soft-light', '110,170,255', 0.45, 'full'], ['screen', '150,220,255', 0.1, 'top']] },
  3:  { ops: [['soft-light', '70,160,110', 0.5, 'full'], ['multiply', '150,190,160', 0.25, 'bottom']], fog: '190,230,200' },
  4:  { ops: [['soft-light', '60,170,255', 0.35, 'full'], ['screen', '255,240,200', 0.12, 'tr']], rays: '255,250,220' },
  5:  { ops: [['soft-light', '80,200,90', 0.45, 'full']], dapple: '235,255,170' },
  6:  { ops: [['soft-light', '255,110,160', 0.5, 'full'], ['multiply', '255,190,150', 0.35, 'top']] },
  7:  { ops: [['soft-light', '110,90,255', 0.4, 'full']] },
  8:  { ops: [['soft-light', '170,200,255', 0.35, 'full'], ['multiply', '120,130,170', 0.2, 'top']] },
  9:  { ops: [['soft-light', '210,230,60', 0.5, 'full']], fog: '200,230,90' },
  10: { ops: [['soft-light', '255,80,30', 0.5, 'full'], ['screen', '255,110,40', 0.22, 'bottom']] },
  11: { ops: [['multiply', '90,110,160', 0.35, 'full']], spot: true },
  12: { ops: [['soft-light', '40,255,140', 0.35, 'full']], scan: true },
  13: { ops: [['soft-light', '255,150,60', 0.55, 'full'], ['screen', '255,210,150', 0.1, 'top']] }
};
function miniGrade(ctx, m, g){
  const d = POL_GRADE[m.ch]; if (!d) return;
  const fx = typeof fxLevelNow === 'function' ? fxLevelNow() : 2;
  if (fx < 1) return;
  const W = g.W, H = g.H, s = g.s, t = G.time;
  ctx.save();
  for (let i = 0; i < d.ops.length; i++){
    const o = d.ops[i], col = 'rgba(' + o[1] + ',' + o[2] + ')';
    ctx.globalCompositeOperation = o[0];
    let fill;
    if (o[3] === 'full') fill = 'rgba(' + o[1] + ',' + o[2] + ')';
    else if (o[3] === 'tr'){ fill = ctx.createRadialGradient(W, 0, 0, W, 0, Math.hypot(W, H) * 0.85); fill.addColorStop(0, 'rgba(' + o[1] + ',' + o[2] + ')'); fill.addColorStop(1, 'rgba(' + o[1] + ',0)'); }
    else { fill = ctx.createLinearGradient(0, o[3] === 'top' ? 0 : H, 0, o[3] === 'top' ? H * 0.6 : H * 0.4); fill.addColorStop(0, 'rgba(' + o[1] + ',' + o[2] + ')'); fill.addColorStop(1, 'rgba(' + o[1] + ',0)'); }
    ctx.fillStyle = fill; ctx.fillRect(0, 0, W, H);
  }
  if (fx < 2){ ctx.restore(); return; }                                    /* Medium keeps the colour grade; the shafts, haze and glints are for High */
  ctx.globalCompositeOperation = 'screen';
  if (d.rays){                                                          /* slanting shafts of light */
    for (let i = 0; i < 4; i++){
      const x0 = W * (0.5 + 0.13 * i) + Math.sin(t * 0.2 + i) * 18 * s, wd = (34 + i * 12) * s;
      const gr = ctx.createLinearGradient(x0, 0, x0 - W * 0.3, H);
      gr.addColorStop(0, 'rgba(' + d.rays + ',' + (0.1 + 0.03 * Math.sin(t * 0.7 + i)).toFixed(3) + ')'); gr.addColorStop(1, 'rgba(' + d.rays + ',0)');
      ctx.fillStyle = gr; ctx.beginPath(); ctx.moveTo(x0, 0); ctx.lineTo(x0 + wd, 0); ctx.lineTo(x0 + wd - W * 0.3, H); ctx.lineTo(x0 - W * 0.3, H); ctx.closePath(); ctx.fill();
    }
  }
  if (d.dapple){                                                         /* light through leaves, moving */
    for (let i = 0; i < 9; i++){
      const x = polRh(i, 1) * W + Math.sin(t * 0.3 + i) * 30 * s, y = polRh(i, 2) * H + Math.cos(t * 0.25 + i * 2) * 20 * s;
      miniGlow(ctx, x, y, (50 + polRh(i, 3) * 40) * s, d.dapple, (0.07 + 0.03 * Math.sin(t * 0.8 + i)).toFixed(3));
    }
  }
  ctx.globalCompositeOperation = 'source-over';
  if (d.fog){                                                            /* slow bands of haze */
    for (let i = 0; i < 3; i++){
      const y = H * (0.5 + 0.17 * i), ox = Math.sin(t * 0.1 + i * 2) * W * 0.06;
      const gr = ctx.createLinearGradient(0, y - 60 * s, 0, y + 60 * s);
      gr.addColorStop(0, 'rgba(' + d.fog + ',0)'); gr.addColorStop(0.5, 'rgba(' + d.fog + ',0.11)'); gr.addColorStop(1, 'rgba(' + d.fog + ',0)');
      ctx.fillStyle = gr; ctx.fillRect(-W * 0.1 + ox, y - 60 * s, W * 1.2, 120 * s);
    }
  }
  if (d.scan){
    ctx.fillStyle = 'rgba(0,30,10,.1)';
    for (let y = 0; y < H; y += 4 * s + 1) ctx.fillRect(0, y, W, Math.max(1, s));
    const by = (t * 90 * s) % (H + 80 * s) - 40 * s, gr = ctx.createLinearGradient(0, by - 30 * s, 0, by + 30 * s);
    gr.addColorStop(0, 'rgba(120,255,170,0)'); gr.addColorStop(0.5, 'rgba(120,255,170,.07)'); gr.addColorStop(1, 'rgba(120,255,170,0)');
    ctx.fillStyle = gr; ctx.fillRect(0, by - 30 * s, W, 60 * s);
  }
  if (d.spot){                                                           /* the cave: dark, with her light around her */
    const f = m.focus || { x: W / 2, y: H / 2 }, r0 = Math.min(W, H) * 0.18, r1 = Math.hypot(W, H) * 0.62;
    const gr = ctx.createRadialGradient(f.x, f.y, r0, f.x, f.y, r1); gr.addColorStop(0, 'rgba(0,0,12,0)'); gr.addColorStop(1, 'rgba(0,0,12,.55)');
    ctx.fillStyle = gr; ctx.fillRect(0, 0, W, H);
  }
  ctx.restore();
}

/* ---- her: squash and stretch, afterimages, footprints, landing puffs ---- */
const POL_DUST = { 3: 'rgba(190,225,255,.7)', 4: 'rgba(210,240,255,.8)', 5: 'rgba(225,205,165,.6)', 6: 'rgba(200,190,180,.6)', 8: 'rgba(225,228,240,.65)' };
const POL_PRINT = { 1: ['print', 'rgba(70,45,20,.35)'], 2: ['scratch', 'rgba(255,255,255,.55)'], 3: ['ripple', 'rgba(210,240,255,.7)'], 9: ['ripple', 'rgba(190,255,120,.6)'],
  10: ['print', 'rgba(30,18,12,.4)'], 13: ['print', 'rgba(110,70,30,.35)'] };
function polState(m){
  if (m.pol && m.pol.init) return m.pol;
  const P = m.pol || (m.pol = {}); P.init = true; P.dec = []; P.side = { t: -9 }; P.top = { t: -9 }; return P;
}
const _polSide = drawSideGiraffe, _polTop = drawTopGiraffe;
function polTrailDraw(ctx, list, fn, now){
  for (let i = 0; i < list.length; i++){
    const g = list[i], age = now - g.t; if (age > 0.24 || age < 0.015) continue;
    const o = {}; for (const k in g.o) o[k] = g.o[k]; o.alpha = 0.3 * (1 - age / 0.24) * (g.o.alpha === undefined ? 1 : g.o.alpha);
    fn(ctx, g.x, g.y, g.sc, o);
  }
}
drawSideGiraffe = function(ctx, x, y, sc, o){
  const m = G.mini;
  if (!m || G.state !== 'mini' || m.phase === 'cele' || m.phase === 'done') return _polSide(ctx, x, y, sc, o);
  const P = polState(m), st = P.side, now = G.time, g = miniGeom(), dt = now - st.t;
  let vx = st.vx || 0, vy = st.vy || 0;
  if (dt > 0.3 || st.t < 0){ st.sq = 0; st.vx = st.vy = vx = vy = 0; st.trail = []; st.push = -9; }
  else if (dt > 0.002){
    vx = (x - st.x) / dt; vy = (y - st.y) / dt;
    if (st.vy > 260 * g.s && vy < 90 * g.s && (m.ch === 4 || m.ch === 6 || m.ch === 8)){       /* a landing */
      st.sq = 1; const fy = y + 37 * sc;
      miniBurst(m, x - 4 * sc, fy, 7, POL_DUST[m.ch] || 'rgba(225,205,165,.6)', { ang: -Math.PI / 2, spread: 2.6, speed: 90, g: 60, r: 4, life: 0.5, glow: false });
      if (m.ch === 4) miniRing(m, x, fy, '#D8F2FF', 36 * g.s, 0.5, 0.35);
    }
    st.vx = vx; st.vy = vy; st.sq = Math.max(0, (st.sq || 0) - dt * 6);
  }
  if (dt > 0.002 || st.t < 0){ st.x = x; st.y = y; st.t = now; }
  const speed = Math.hypot(vx, vy);
  /* afterimages when she moves fast (not for the games where the world, not she, scrolls) */
  const hi = typeof fxLevelNow !== 'function' || fxLevelNow() >= 2;
  if (hi && speed > 380 * g.s && m.phase === 'play' && now - st.push > 0.04){ st.push = now; st.trail.push({ x: x, y: y, sc: sc, o: o || {}, t: now }); if (st.trail.length > 8) st.trail.shift(); }
  if (st.trail && st.trail.length) polTrailDraw(ctx, st.trail, _polSide, now);
  const squashy = m.ch === 4 || m.ch === 6 || m.ch === 8;
  let sy = 1, sx = 1;
  if (squashy){
    sy = 1 + clamp(Math.abs(vy) / 1500, 0, 0.14) - 0.2 * (st.sq || 0);
    sx = 1 / Math.max(0.75, sy);
  }
  if (sx === 1 && sy === 1) return _polSide(ctx, x, y, sc, o);
  const fy = y + 37 * sc;
  ctx.save(); ctx.translate(x, fy); ctx.scale(sx, sy); ctx.translate(-x, -fy);
  _polSide(ctx, x, y, sc, o);
  ctx.restore();
};
drawTopGiraffe = function(ctx, x, y, ang, sc, ph, o){
  const m = G.mini;
  if (!m || G.state !== 'mini' || m.phase === 'cele' || m.phase === 'done') return _polTop(ctx, x, y, ang, sc, ph, o);
  const P = polState(m), st = P.top, now = G.time, g = miniGeom(), dt = now - st.t;
  let vx = 0, vy = 0;
  if (dt > 0.3 || st.t < 0){ st.trail = []; st.push = -9; st.dist = 0; }
  else if (dt > 0.002){ vx = (x - st.x) / dt; vy = (y - st.y) / dt; }
  if (dt > 0.002 || st.t < 0){ st.x = x; st.y = y; st.t = now; }
  const speed = Math.hypot(vx, vy);
  /* footprints, scratches or ripples, placed as she moves */
  const kind = POL_PRINT[m.ch];
  if (kind && m.phase === 'play' && speed > 60 * g.s){
    st.dist = (st.dist || 0) + speed * Math.min(dt, 0.1);
    if (st.dist > 30 * g.s){ st.dist = 0; st.n = (st.n || 0) + 1; P.dec.push({ x: x, y: y, t: now, a: ang, k: kind[0], c: kind[1], side: st.n % 2 ? 1 : -1 }); if (P.dec.length > 36) P.dec.shift(); }
  }
  if ((typeof fxLevelNow !== 'function' || fxLevelNow() >= 2) && speed > 300 * g.s && m.phase === 'play' && now - st.push > 0.045){ st.push = now; st.trail.push({ x: x, y: y, sc: sc, o: o || {}, t: now, ang: ang, ph: ph }); if (st.trail.length > 7) st.trail.shift(); }
  if (st.trail && st.trail.length){
    for (let i = 0; i < st.trail.length; i++){
      const gh = st.trail[i], age = now - gh.t; if (age > 0.22 || age < 0.015) continue;
      const oo = {}; for (const k in gh.o) oo[k] = gh.o[k]; oo.alpha = 0.26 * (1 - age / 0.22);
      _polTop(ctx, gh.x, gh.y, gh.ang, gh.sc, gh.ph, oo);
    }
  }
  const k = clamp(speed / 3200, 0, 0.1);                                  /* a touch longer along her heading when she is quick */
  if (k < 0.01) return _polTop(ctx, x, y, ang, sc, ph, o);
  ctx.save(); ctx.translate(x, y); ctx.rotate(ang); ctx.scale(1 + k, 1 - k * 0.6); ctx.rotate(-ang); ctx.translate(-x, -y);
  _polTop(ctx, x, y, ang, sc, ph, o);
  ctx.restore();
};
function polDecals(ctx, m, g){
  const P = m.pol; if (!P || !P.dec || !P.dec.length) return;
  const now = G.time, s = g.s;
  for (let i = P.dec.length - 1; i >= 0; i--){
    const d = P.dec[i], age = now - d.t, life = d.k === 'ripple' ? 1.1 : 2.6;
    if (age > life){ P.dec.splice(i, 1); continue; }
    const f = 1 - age / life;
    ctx.save(); ctx.translate(d.x, d.y); ctx.rotate(d.a);
    ctx.globalAlpha = f;
    if (d.k === 'print'){ ctx.fillStyle = d.c; ctx.beginPath(); ctx.ellipse(-4 * s, d.side * 9 * s, 4.6 * s, 2.8 * s, 0, 0, TAU); ctx.fill(); }
    else if (d.k === 'scratch'){ ctx.strokeStyle = d.c; ctx.lineWidth = 1.4 * s; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-14 * s, d.side * 8 * s); ctx.lineTo(-30 * s, d.side * 8.6 * s); ctx.stroke(); }
    else { ctx.strokeStyle = d.c; ctx.lineWidth = 1.8 * s * f + 0.5; ctx.beginPath(); const r = (5 + (1 - f) * 24) * s; ctx.ellipse(0, 0, r, r * 0.55, 0, 0, TAU); ctx.stroke(); }
    ctx.restore();
  }
}

/* ---- every minigame's draw: push-in during the intro, then ambience, grade and the GO flash ---- */
MINI.forEach(function(def){
  if (!def || !def.draw) return;
  const base = def.draw;
  def.draw = function(ctx, m, g){
    const P = polState(m), W = g.W, H = g.H;
    ctx.save();
    if (m.phase === 'intro'){                                             /* the camera settles in as the card arrives */
      const k = clamp(m.t / 1.6, 0, 1), z = 1.07 - 0.07 * (1 - Math.pow(1 - k, 3));
      ctx.translate(W / 2, H / 2); ctx.scale(z, z); ctx.translate(-W / 2, -H / 2);
    }
    _polM = m;
    base.call(def, ctx, m, g);
    polDecals(ctx, m, g);
    ctx.restore();
    miniAmbient(ctx, m, g, 'front');
    miniGrade(ctx, m, g);
    if (m.phase === 'play' && m.time < 0.8){                              /* GO! */
      const u = m.time / 0.8;
      ctx.globalAlpha = 1 - u * u; miniText(ctx, 'GO!', W / 2, H * 0.42, (54 + 60 * u) * g.s, '#FFE27A'); ctx.globalAlpha = 1;
    }
  };
});

/* ---- the how-to-play card eases in, with a line drawn under the title ---- */
const _polIntro = miniIntro;
miniIntro = function(ctx, m, g){
  const s = Math.max(g.s, 0.8), k = clamp((m.t || 0) / 0.5, 0, 1), e = 1 - Math.pow(1 - k, 3);
  ctx.save(); ctx.globalAlpha = Math.min(1, k * 1.4); ctx.translate(0, (1 - e) * 26 * s);
  _polIntro(ctx, m, g);
  const ty = Math.max(34, g.H * 0.08) + 40 * s + 12 * s, half = Math.min(g.W * 0.26, 210 * s) * clamp(((m.t || 0) - 0.15) / 0.55, 0, 1);
  const gr = ctx.createLinearGradient(g.W / 2 - half, 0, g.W / 2 + half, 0);
  gr.addColorStop(0, 'rgba(255,216,77,0)'); gr.addColorStop(0.5, 'rgba(255,216,77,.95)'); gr.addColorStop(1, 'rgba(255,216,77,0)');
  ctx.fillStyle = gr; ctx.fillRect(g.W / 2 - half, ty, half * 2, 2.5 * s);
  ctx.restore();
};

/* ---- the top bar: an icon badge, the name, the score, hearts, the time, the stars and the best score ---- */
function miniHud(ctx, m, g){
  const W = g.W, u = g.s, h1 = 44 * u, def = m.def, play = m.phase === 'play';
  const bg = ctx.createLinearGradient(0, 0, 0, h1); bg.addColorStop(0, 'rgba(20,14,9,.86)'); bg.addColorStop(1, 'rgba(20,14,9,.58)');
  ctx.fillStyle = bg; ctx.fillRect(0, 0, W, h1);
  ctx.fillStyle = 'rgba(255,216,77,.55)'; ctx.fillRect(0, h1 - 1.5, W, 1.5);
  const bx = 28 * u, by = h1 / 2 - 0.5;
  ctx.fillStyle = '#2B1D10'; ctx.beginPath(); ctx.arc(bx, by, 17 * u, 0, TAU); ctx.fill();
  ctx.strokeStyle = '#FFD84D'; ctx.lineWidth = 2; ctx.stroke();
  ctx.save(); ctx.fillStyle = '#FFE9A0'; drawIcon(ctx, '@t-' + (POL_ICON[m.ch] || 'x-medal') + ':#FFE9A0', bx, by, 21 * u, '#FFE9A0'); ctx.restore();
  const fs = Math.round(Math.max(12.5, 19 * u));
  const sc = def.hudText ? def.hudText(m) : m.score + ' / ' + m.goal + ' ' + (def.unit || '');
  ctx.font = 'bold ' + fs + 'px system-ui, "Segoe UI", sans-serif';
  const nw = ctx.measureText(def.name).width, sw = ctx.measureText(sc).width, hearts = m.lives > 0 && play ? miniHeartsText(m.lives) : '';
  const hw = hearts ? ctx.measureText(hearts).width : 0;
  const left = 54 * u, right = 14 * u;
  const showName = left + nw + 16 * u + hw + 16 * u + sw + right < W;
  if (showName) miniText(ctx, def.name, left, by + 7 * u, 19 * u, '#FFE9A0', 'left');
  miniText(ctx, sc, W - right, by + 7 * u, 19 * u, '#FFFFFF', 'right');
  if (hearts) miniText(ctx, hearts, showName ? W / 2 : left, by + 8 * u, 20 * u, '#FF6A5A', showName ? 'center' : 'left');
  /* the time as a rounded bar under the strip */
  if (def.dur){
    const k = clamp(1 - m.time / def.dur, 0, 1), y = h1 + 3 * u, hh = 5 * u, low = k < 0.25;
    ctx.fillStyle = 'rgba(20,14,9,.5)'; ctx.beginPath(); ctx.roundRect(10 * u, y, W - 20 * u, hh, hh / 2); ctx.fill();
    if (k > 0){ ctx.fillStyle = low ? (Math.floor(G.time * 6) % 2 ? '#FF6A5A' : '#FF9A8A') : '#FFD84D'; ctx.beginPath(); ctx.roundRect(10 * u, y, Math.max(hh, (W - 20 * u) * k), hh, hh / 2); ctx.fill(); }
  }
  /* second row: stars on the left, the time left in the middle, the best score on the right */
  if (!play) return;
  const d = typeof MINI_STAR !== 'undefined' ? MINI_STAR[m.ch] : null, y2 = h1 + 28 * u, lit = m.liveStars | 0;
  if (d){
    let x = 12 * u;
    for (let k = 0; k < 3; k++){
      const on = k < lit, lab = d.lab[k];
      ctx.font = 'bold ' + Math.round(Math.max(12.5, 15 * u)) + 'px system-ui, sans-serif'; ctx.textAlign = 'left';
      ctx.strokeStyle = 'rgba(12,9,8,.75)'; ctx.lineWidth = 3; ctx.lineJoin = 'round';
      ctx.fillStyle = on ? '#FFD84D' : 'rgba(255,255,255,.42)';
      const txt = '★ ' + lab;
      ctx.strokeText(txt, x, y2); ctx.fillText(txt, x, y2);
      x += ctx.measureText(txt).width + 14 * u;
    }
  }
  if (def.dur && W > 520){
    const left = Math.max(0, Math.ceil(def.dur - m.time)), low = left <= 5;
    miniText(ctx, left + ' s', W / 2, y2, (low ? 17 + Math.sin(G.time * 10) * 1.2 : 15) * u, low ? '#FF8A7A' : 'rgba(255,255,255,.7)');
  }
  if (m.bestAtStart > 0 || m.newBestShown){
    const nb = m.newBestShown, pulse = nb ? 1 + Math.sin(G.time * 8) * 0.06 : 1;
    miniText(ctx, nb ? 'New best! ' + m.score : 'Best ' + m.bestAtStart, W - right, y2, 15 * u * pulse, nb ? '#FFB347' : 'rgba(255,255,255,.78)', 'right');
  }
}
