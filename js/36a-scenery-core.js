'use strict';
/* Scenery system: large ground patches, themed props and landmarks, ground decals, ambient life and light gameplay terrain, per chapter. */
/* ========================= SCENERY ========================= */
/* Each chapter registers a definition with sceneryRegister([chapters], def). The core scatters everything at the start of a run
   (buildScenery, called from startRun after the buildings exist), draws it right after the base ground (drawScenery), draws the
   "over" layer of ambient life above the creatures (drawSceneryOver), and applies terrain effects each frame (sceneryUpdate).

   def = {
     patches:   [{ fill: '#RRGGBB', alpha: 0.2, count: 12, rMin: 160, rMax: 380, squash: 0.65 }],            // big soft color blotches under everything
     decals:    [{ id, count: 90, draw(ctx, d, t) }],                                                       // flat marks on the ground; ctx is translated to d.x, d.y and scaled/rotated by d.s / d.rot
     props:     [{ id, count: 60, r: 26, gap: 40, s: [0.8, 1.4], rot: false, draw(ctx, p, t) }],           // themed objects, y-sorted with the landmarks; r = footprint radius
     landmarks: [{ id, count: 3, r: 150, gap: 700, s: [1, 1.2], draw(ctx, p, t) }],                          // a few huge features that give orientation
     terrain:   [{ id, kind: 'slow'|'ice'|'push'|'hurt', mul: 0.7, count: 6, rMin: 90, rMax: 160, squash: 0.7,
                   draw(ctx, z, t),  hint: 'Deep mud slows you and the creatures' }],                      // gameplay terrain, kept sparse
     ambient:   [{ id, count: 12, layer: 'under'|'over', init(a), update(a, dt, t), draw(ctx, a, t) }]      // moving life; a.x / a.y are world coordinates
   }
   Draw callbacks run with the context already translated to the object's position (and scaled by p.s), use p.seed (0..1) for
   per-object variety, never Math.random() (it would flicker), and must stay cheap: there can be 150+ objects in an arena.
   p.rot is a fixed random angle (only applied when the def says rot: true). t is G.time. */
const SCEN_DEFS = {};
const SCEN = { ch: 0, patches: [], decals: [], props: [], zones: [], amb: [], hints: {} };
function sceneryRegister(chapters, def){ for (let i = 0; i < chapters.length; i++) SCEN_DEFS[chapters[i]] = def; }

/* small helpers the chapter files can use */
function scShadow(ctx, rx, ry, a){
  if (typeof softShadow === 'function'){ softShadow(ctx, 0, ry * 0.35, rx, ry, a === undefined ? 0.22 : a, ry * 1.2); return; }       /* soft, sun-aware (36i-lighting.js) */
  ctx.fillStyle = 'rgba(14,10,6,' + (a === undefined ? 0.22 : a) + ')'; ctx.beginPath(); ctx.ellipse(0, ry * 0.35, rx, ry, 0, 0, TAU); ctx.fill();
}
function scSway(t, p, amt){ return Math.sin(t * 1.3 + p.seed * 12.57) * (amt === undefined ? 1 : amt); }
function scRnd(seed, k){ const v = Math.sin(seed * 127.1 + k * 311.7) * 43758.5453; return v - Math.floor(v); }       /* a stable 0..1 number from a seed and an index */

const SCEN_QUALITY = [0.5, 0.8, 1];
function scenQ(){ return SCEN_QUALITY[Math.max(0, Math.min(2, fxLevelNow()))]; }

function scenPlacer(){
  const placed = [];
  return function(r, gap, margin, tries){
    const cx = ARENA_W / 2, cy = ARENA_H / 2, clearR = 230 + r;                               /* keep the spawn point clear */
    for (let k = 0; k < (tries || 24); k++){
      const x = rand(margin, ARENA_W - margin), y = rand(margin, ARENA_H - margin);
      if (hyp(x - cx, y - cy) < clearR) continue;
      if (G.water && hyp(x - G.water.x, y - G.water.y) < G.water.r * 1.25 + r) continue;       /* keep clear of the waterhole */
      if (G.buildings && G.buildings.length && (buildingAt(x, y) || buildingAt(x + r, y) || buildingAt(x - r, y) || buildingAt(x, y + r) || buildingAt(x, y - r))) continue;
      let ok = true;
      for (let i = 0; i < placed.length; i++){ const o = placed[i], d = r + o.r + Math.max(gap, o.gap) * 0.5; if ((x - o.x) * (x - o.x) + (y - o.y) * (y - o.y) < d * d){ ok = false; break; } }
      if (!ok) continue;
      placed.push({ x: x, y: y, r: r, gap: gap }); return { x: x, y: y };
    }
    return null;
  };
}
/* the same color at zero alpha (fading to transparent black would leave a dark ring around every patch) */
function scenFade(c){
  if (typeof c === 'string' && c.charAt(0) === '#' && c.length === 7) return 'rgba(' + parseInt(c.substr(1, 2), 16) + ',' + parseInt(c.substr(3, 2), 16) + ',' + parseInt(c.substr(5, 2), 16) + ',0)';
  const m = /^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/.exec(c || '');
  return m ? 'rgba(' + m[1] + ',' + m[2] + ',' + m[3] + ',0)' : 'rgba(128,128,128,0)';
}
function scenPatchSprite(fill, r, squash){
  const w = Math.max(32, Math.round(r)), h = Math.max(24, Math.round(r * squash)), c = document.createElement('canvas');
  c.width = w * 2; c.height = h * 2;
  const g = c.getContext('2d'); if (!g) return null;
  for (let i = 0; i < 5; i++){                                                                    /* a few overlapping soft lobes make an irregular patch */
    const px = w + (i ? Math.cos(i * 1.9) * w * 0.35 : 0), py = h + (i ? Math.sin(i * 2.7) * h * 0.35 : 0), pr = w * (i ? 0.55 : 0.8);
    const gr = g.createRadialGradient(px, py, 0, px, py, pr);
    gr.addColorStop(0, fill); gr.addColorStop(0.6, fill); gr.addColorStop(1, scenFade(fill));
    g.globalAlpha = i ? 0.55 : 0.85; g.fillStyle = gr;
    g.save(); g.translate(px, py); g.scale(1, h / w); g.translate(-px, -py);
    g.beginPath(); g.arc(px, py, pr, 0, TAU); g.fill(); g.restore();
  }
  return c;
}

function buildScenery(){
  SCEN.ch = G.chapter | 0; SCEN.patches = []; SCEN.decals = []; SCEN.props = []; SCEN.zones = []; SCEN.amb = []; SCEN.hints = {};
  G.terrain = null;
  const def = SCEN_DEFS[SCEN.ch]; if (!def) return;
  const q = scenQ(), place = scenPlacer();
  const mk = function(base, src){ return { x: base.x, y: base.y, s: Array.isArray(src.s) ? rand(src.s[0], src.s[1]) : (src.s || 1), rot: Math.random() * TAU, seed: Math.random(), def: src }; };
  /* landmarks first so they get the best spots, then terrain, props, patches, decals */
  const lms = def.landmarks || [];
  for (let i = 0; i < lms.length; i++){ const L = lms[i], n = Math.max(1, Math.round(L.count * (q < 1 ? 0.7 : 1)));
    for (let k = 0; k < n; k++){ const at = place(L.r, L.gap === undefined ? 600 : L.gap, 120, 60) || place(L.r, 200, 120, 60); if (at){ const p = mk(at, L); p.r = L.r; SCEN.props.push(p); } } }
  const tr = def.terrain || [];
  for (let i = 0; i < tr.length; i++){ const T = tr[i], n = Math.max(0, Math.round(T.count * (q < 1 ? 0.6 : 1)));
    for (let k = 0; k < n; k++){ const rr = rand(T.rMin, T.rMax), at = place(rr * 0.9, 260, 100, 40); if (at) SCEN.zones.push({ x: at.x, y: at.y, rx: rr, ry: rr * (T.squash || 0.7), rot: rand(-0.5, 0.5), seed: Math.random(), def: T, kind: T.kind, tick: 0 }); } }
  const pr = def.props || [];
  for (let i = 0; i < pr.length; i++){ const P0 = pr[i], n = Math.round(P0.count * q);
    for (let k = 0; k < n; k++){ const at = place(P0.r || 20, P0.gap === undefined ? 30 : P0.gap, 60, 14); if (at){ const p = mk(at, P0); p.r = P0.r || 20; SCEN.props.push(p); } } }
  SCEN.props.sort(function(a, b){ return a.y - b.y; });
  const pa = def.patches || [];
  for (let i = 0; i < pa.length; i++){ const A = pa[i], n = Math.round(A.count * q);
    for (let k = 0; k < n; k++){ const r = rand(A.rMin, A.rMax), sq = A.squash || 0.65, spr = scenPatchSprite(A.fill, r * 0.5, sq);
      if (spr) SCEN.patches.push({ x: rand(0, ARENA_W), y: rand(0, ARENA_H), rx: r, ry: r * sq, a: A.alpha === undefined ? 0.2 : A.alpha, spr: spr, rot: rand(-0.4, 0.4) }); } }
  const de = def.decals || [];
  for (let i = 0; i < de.length; i++){ const D = de[i], n = Math.round(D.count * q);
    for (let k = 0; k < n; k++) SCEN.decals.push({ x: rand(40, ARENA_W - 40), y: rand(40, ARENA_H - 40), s: Array.isArray(D.s) ? rand(D.s[0], D.s[1]) : (D.s || 1), rot: Math.random() * TAU, seed: Math.random(), def: D }); }
  const am = def.ambient || [];
  const aq = q >= 1 ? 1 : q >= 0.8 ? 0.5 : 0;
  for (let i = 0; i < am.length; i++){ const M = am[i], n = Math.round(M.count * aq);
    for (let k = 0; k < n; k++){ const a = { x: rand(0, ARENA_W), y: rand(0, ARENA_H), seed: Math.random(), def: M, vx: 0, vy: 0, ph: Math.random() * TAU }; if (M.init) M.init(a); SCEN.amb.push(a); } }
}

function sceneryVisible(o, x0, y0, vw, vh, m){ return o.x > x0 - m && o.x < x0 + vw + m && o.y > y0 - m && o.y < y0 + vh + m; }

function drawScenery(ctx, cx, cy, vw, vh){
  if (!SCEN.ch) return;
  const x0 = cx - vw / 2, y0 = cy - vh / 2, t = G.time;
  let i;
  for (i = 0; i < SCEN.patches.length; i++){
    const p = SCEN.patches[i]; if (!sceneryVisible(p, x0, y0, vw, vh, p.rx)) continue;
    ctx.globalAlpha = p.a; ctx.drawImage(p.spr, p.x - p.rx, p.y - p.ry, p.rx * 2, p.ry * 2); ctx.globalAlpha = 1;
  }
  for (i = 0; i < SCEN.zones.length; i++){
    const z = SCEN.zones[i]; if (!sceneryVisible(z, x0, y0, vw, vh, z.rx + 40)) continue;
    ctx.save(); ctx.translate(z.x, z.y); ctx.rotate(z.rot); z.def.draw(ctx, z, t); ctx.restore();
  }
  for (i = 0; i < SCEN.decals.length; i++){
    const d = SCEN.decals[i]; if (!sceneryVisible(d, x0, y0, vw, vh, 60)) continue;
    ctx.save(); ctx.translate(d.x, d.y); ctx.rotate(d.rot); ctx.scale(d.s, d.s); d.def.draw(ctx, d, t); ctx.restore();
  }
  for (i = 0; i < SCEN.amb.length; i++){
    const a = SCEN.amb[i]; if (a.def.layer === 'over' || !sceneryVisible(a, x0, y0, vw, vh, 120)) continue;
    ctx.save(); ctx.translate(a.x, a.y); a.def.draw(ctx, a, t); ctx.restore();
  }
  const sorted = fxLevelNow() > 0;                         /* tall props are painted with the creatures instead (36k-water-depth.js) */
  for (i = 0; i < SCEN.props.length; i++){
    const p = SCEN.props[i]; if ((sorted && p.tall) || !sceneryVisible(p, x0, y0, vw, vh, p.r * p.s + 140)) continue;
    ctx.save(); ctx.translate(p.x, p.y); if (p.def.rot) ctx.rotate(p.rot); ctx.scale(p.s, p.s); p.def.draw(ctx, p, t); ctx.restore();
  }
}
function drawSceneryOver(ctx){
  if (!SCEN.ch || !SCEN.amb.length) return;
  const cx = G.camX, cy = G.camY, vw = G.W / G.zoom, vh = G.H / G.zoom, x0 = cx - vw / 2, y0 = cy - vh / 2, t = G.time;
  for (let i = 0; i < SCEN.amb.length; i++){
    const a = SCEN.amb[i]; if (a.def.layer !== 'over' || !sceneryVisible(a, x0, y0, vw, vh, 120)) continue;
    ctx.save(); ctx.translate(a.x, a.y); a.def.draw(ctx, a, t); ctx.restore();
  }
}

/* the zone a point is in (the one with the strongest effect wins), or null */
function sceneryZoneAt(x, y, extra){
  let best = null;
  for (let i = 0; i < SCEN.zones.length; i++){
    const z = SCEN.zones[i], dx = x - z.x, dy = y - z.y, e = extra || 0;
    if (Math.abs(dx) > z.rx + e || Math.abs(dy) > z.rx + e) continue;
    const c = Math.cos(-z.rot), s = Math.sin(-z.rot), lx = dx * c - dy * s, ly = dx * s + dy * c;
    const a = z.rx + e, b = z.ry + e;
    if ((lx * lx) / (a * a) + (ly * ly) / (b * b) <= 1){ if (!best || (z.def.mul || 1) < (best.def.mul || 1)) best = z; }
  }
  return best;
}

function sceneryUpdate(dt){
  if (!SCEN.ch) return;
  const t = G.time;
  for (let i = 0; i < SCEN.amb.length; i++){
    const a = SCEN.amb[i]; if (a.def.update) a.def.update(a, dt, t);
    if (a.x < -80) a.x += ARENA_W + 160; else if (a.x > ARENA_W + 80) a.x -= ARENA_W + 160;
    if (a.y < -80) a.y += ARENA_H + 160; else if (a.y > ARENA_H + 80) a.y -= ARENA_H + 160;
  }
  /* terrain: the player ... */
  G.terrain = null;
  if (!SCEN.zones.length || P.dead) return;
  const z = sceneryZoneAt(P.x, P.y, -P.r * 0.3);
  if (z){
    const T = z.def;
    G.terrain = { kind: z.kind, spd: z.kind === 'slow' ? (T.mul || 0.7) : 1, accel: z.kind === 'ice' ? (T.accel || 0.16) : 1 };
    if (z.kind === 'push'){
      const ang = T.dir === undefined ? 0 : T.dir, f = T.force || 70;
      P.x = clamp(P.x + Math.cos(ang) * f * dt, 26, ARENA_W - 26); P.y = clamp(P.y + Math.sin(ang) * f * dt, 26, ARENA_H - 26);
    } else if (z.kind === 'hurt'){
      z.tick -= dt;
      if (z.tick <= 0 && G.state === 'playing'){ z.tick = 0.7; hurtPlayer(4 + P.maxHp * (T.dmgFrac || 0.012), P.x, P.y); }
    }
    if (T.hint && !SCEN.hints[T.id] && !G.attract){ SCEN.hints[T.id] = 1; addText(P.x, P.y - 54, T.hint, '#EFE6D4', 15, true); }
  }
  /* ... and the creatures on the ground: mud-like terrain slows them too (a light touch) */
  if (SCEN.zones.some(function(q){ return q.kind === 'slow'; })){
    const es = G.enemies;
    for (let i = 0; i < es.length; i++){
      const e = es[i]; if (e.dead || e.untarg || e.def.fly) continue;
      const q = sceneryZoneAt(e.x, e.y, 0);
      if (q && q.kind === 'slow'){ e.slowT = Math.max(e.slowT, 0.2); e.slowMul = Math.min(e.slowMul, Math.max(q.def.mul || 0.7, 0.6)); e.terrainSlow = true; }
    }
  }
}
