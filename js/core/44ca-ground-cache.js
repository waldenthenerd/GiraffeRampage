'use strict';
/* =============================================================================================================================
   44ca-ground-cache.js  --  THE GROUND AND ITS STILL SCENERY, PAINTED ONCE. Every biome's ground is drawn each frame from scratch: the pattern
   fill, the pool, and every rock, tree, fern and crack in view (from about 90 canvas calls a frame in the savanna to nearly 800 in the
   jungle), and the scenery (36a) adds 130 to 360 more. None of that moves, so when the game is short of time it is painted into square
   tiles (CH world units wide) and each frame only copies the tiles that are on screen: a handful of drawImage calls instead of hundreds of
   fills and strokes. There are two layers of tiles: the ground (drawGround) and the scenery that holds still (patches, and the zones, decals
   and props whose drawing does not change with time; each kind is tested once by drawing it at three moments and comparing the pixels).
   Scenery that moves (ambient life, swaying props) and the tall props that are sorted with the creatures stay live.
   Tiles are used while the menu or the attract run is behind the title (nobody is playing that), when the effects level is Low or Medium
   (the Effects setting), and as soon as the slow-device governor (44c-perf.js) has taken its first step down. At full effects everything is
   drawn live, so the fern sway, drifting leaves and glints on the water still move; in tiles they hold still.
   Tiles are drawn by the ordinary functions, so every biome is covered without a line of its own. Each tile is keyed by what it shows (biome,
   decor, pool, scenery, sun, sharpness, zoom), so a change just makes new tiles (the menu preview shows other biomes while the run shows one);
   they are built a few a frame so there is no hitch, and the game draws live until the tiles it needs are ready. At most `max` tiles are kept
   per layer (least recently used go first).
   ============================================================================================================================= */
function tileLayer(max, pad){ return { CH: 512, max: max, pad: pad, perFrame: 3, map: new Map(), builds: 0, hits: 0, live: 0, bytes: 0, maxBytes: 72e6 }; }
const GroundCache = tileLayer(16, 96), SceneryCache = tileLayer(16, 0);       /* pad: the ground's decor is culled 80 units outside the view it is given; the scenery keeps its own margin round each object */
function groundCacheOn(){
  return typeof fxLevelNow === 'function' && (G.attract || G.state === 'menu' || fxLevelNow() <= 1 || (typeof Perf !== 'undefined' && Perf.idx >= 1));
}
/* every new world gets a new number, so tiles of an earlier world with the same counts are never shown for it */
let _wver = 0;
const _buildDecorOrig = buildDecor; buildDecor = function(){ _wver++; return _buildDecorOrig.apply(this, arguments); };
const _buildSceneryOrig = buildScenery; buildScenery = function(){ _wver++; return _buildSceneryOrig.apply(this, arguments); };

/* draw the view from L's tiles, painting missing ones (a few a frame) with paint(ctx, centreX, centreY, width, height); false = draw this frame live */
function tilesDraw(L, sig, ctx, cx, cy, vw, vh, paint){
  const CH = L.CH, k = G.dpr * G.zoom, px = Math.max(64, Math.ceil(CH * k)), s = px / CH;
  const i0 = Math.floor((cx - vw / 2) / CH), i1 = Math.floor((cx + vw / 2) / CH), j0 = Math.floor((cy - vh / 2) / CH), j1 = Math.floor((cy + vh / 2) / CH);
  if ((i1 - i0 + 1) * (j1 - j0 + 1) > L.max - 2 || px * px * 4 * L.max > L.maxBytes * 1.6){ L.live++; return false; }        /* too big a view for the tiles */
  let built = 0, missing = 0;
  for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++){
    const key = sig + '#' + i + ',' + j;
    if (L.map.has(key)) continue;
    if (built >= L.perFrame){ missing++; continue; }
    const cv = document.createElement('canvas'); cv.width = cv.height = px;
    const c = cv.getContext('2d'); if (!c){ missing++; continue; }
    c.setTransform(s, 0, 0, s, -i * CH * s, -j * CH * s);
    try { paint(c, i * CH + CH / 2, j * CH + CH / 2, CH + L.pad * 2, CH + L.pad * 2); } catch (e) { missing++; continue; }
    cv._b = px * px * 4; L.map.set(key, cv); L.bytes += cv._b; L.builds++; built++;
  }
  if (missing){ L.live++; return false; }                                                  /* some tiles are still being made */
  for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++){
    const key = sig + '#' + i + ',' + j, cv = L.map.get(key);
    L.map.delete(key); L.map.set(key, cv);                                                  /* most recently used goes last */
    ctx.drawImage(cv, i * CH - 0.5, j * CH - 0.5, CH + 1, CH + 1);                          /* a half unit over each edge, so no hairline shows between tiles */
  }
  L.hits++;
  while (L.map.size > L.max || L.bytes > L.maxBytes){ const old = L.map.keys().next().value; L.bytes -= L.map.get(old)._b; L.map.delete(old); }
  return true;
}

/* ---------- the ground ---------- */
function groundCacheSig(){
  const w = G.water, d = G.decor;
  return G.biome + '|' + (G.chapter | 0) + '|' + (G.dpr * G.zoom).toFixed(3) + '|' + (d ? d.length : 0) + '|' + (w ? (w.x | 0) + ',' + (w.y | 0) + ',' + (w.r | 0) : '-') + '|' + ARENA_W + 'x' + ARENA_H + '|' + _wver;
}
const drawGroundLive = drawGround;
drawGround = function(ctx, cx, cy, vw, vh){
  if (groundCacheOn() && CTX && tilesDraw(GroundCache, groundCacheSig(), ctx, cx, cy, vw, vh, drawGroundLive)) return;
  drawGroundLive(ctx, cx, cy, vw, vh);
};

/* ---------- the scenery ---------- */
/* Does this kind of object look the same at any time? Drawn at three moments and compared; asked once per kind. Anything that throws counts as moving. */
const _scStatic = new Map();
let _scProbe = null;
function sceneryStill(kind, o){
  const def = o.def; if (!def) return false;
  const key = kind + ':' + (def.id || '?'); let v = _scStatic.get(key); if (v !== undefined) return v;
  v = true;
  const R = 256, t0 = G.time, K = [0.37, 1.91, 3.4];
  if (!_scProbe){ _scProbe = document.createElement('canvas'); _scProbe.width = _scProbe.height = R * 2; }
  const c = _scProbe.getContext('2d', { willReadFrequently: true }); let ref = null;
  try {
    for (let n = 0; n < K.length && v; n++){
      G.time = K[n]; c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1; c.clearRect(0, 0, R * 2, R * 2); c.save(); c.translate(R, R);
      if (kind === 'zone'){ c.rotate(o.rot); } else if (kind === 'decal'){ c.rotate(o.rot); c.scale(o.s, o.s); } else { if (def.rot) c.rotate(o.rot); c.scale(o.s, o.s); }
      def.draw(c, o, K[n]); c.restore();
      const d = c.getImageData(0, 0, R * 2, R * 2).data;
      if (!ref) ref = new Uint8ClampedArray(d); else for (let i = 0; i < d.length; i += 7) if (d[i] !== ref[i]){ v = false; break; }
    }
  } catch (e) { v = false; }
  G.time = t0;
  _scStatic.set(key, v); return v;
}
/* mode 0: everything (the original), 1: only what holds still, 2: only what moves. Same order and culling as drawScenery. */
function sceneryPass(ctx, x0, y0, vw, vh, mode){
  const t = G.time, sorted = fxLevelNow() > 0; let i;
  const want = function(kind, o){ return mode === 0 || (sceneryStill(kind, o) === (mode === 1)); };
  if (mode !== 2) for (i = 0; i < SCEN.patches.length; i++){
    const p = SCEN.patches[i]; if (!sceneryVisible(p, x0, y0, vw, vh, p.rx)) continue;
    ctx.globalAlpha = p.a; ctx.drawImage(p.spr, p.x - p.rx, p.y - p.ry, p.rx * 2, p.ry * 2); ctx.globalAlpha = 1;
  }
  for (i = 0; i < SCEN.zones.length; i++){
    const z = SCEN.zones[i]; if (!sceneryVisible(z, x0, y0, vw, vh, z.rx + 40) || !want('zone', z)) continue;
    ctx.save(); ctx.translate(z.x, z.y); ctx.rotate(z.rot); z.def.draw(ctx, z, t); ctx.restore();
  }
  for (i = 0; i < SCEN.decals.length; i++){
    const d = SCEN.decals[i]; if (!sceneryVisible(d, x0, y0, vw, vh, 60) || !want('decal', d)) continue;
    ctx.save(); ctx.translate(d.x, d.y); ctx.rotate(d.rot); ctx.scale(d.s, d.s); d.def.draw(ctx, d, t); ctx.restore();
  }
  if (mode !== 1) for (i = 0; i < SCEN.amb.length; i++){
    const a = SCEN.amb[i]; if (a.def.layer === 'over' || !sceneryVisible(a, x0, y0, vw, vh, 120)) continue;
    ctx.save(); ctx.translate(a.x, a.y); a.def.draw(ctx, a, t); ctx.restore();
  }
  for (i = 0; i < SCEN.props.length; i++){
    const p = SCEN.props[i]; if ((sorted && p.tall) || !sceneryVisible(p, x0, y0, vw, vh, p.r * p.s + 140) || !want('prop', p)) continue;
    ctx.save(); ctx.translate(p.x, p.y); if (p.def.rot) ctx.rotate(p.rot); ctx.scale(p.s, p.s); p.def.draw(ctx, p, t); ctx.restore();
  }
}
function sceneryCacheSig(){
  const L = typeof Light !== 'undefined' ? Light : null, sun = L ? (L.on ? 1 : 0) + ',' + (L.shx * 3 | 0) + ',' + (L.shy * 3 | 0) + ',' + (L.shLen * 2 | 0) + ',' + (L.shA * 3 | 0) + ',' + L.shRGB : '-';
  return G.biome + '|' + SCEN.ch + '|' + (G.dpr * G.zoom).toFixed(3) + '|' + SCEN.props.length + ',' + SCEN.decals.length + ',' + SCEN.zones.length + ',' + SCEN.patches.length + '|' + (fxLevelNow() > 0 ? 's' : 'u') + '|' + sun + '|' + ARENA_W + 'x' + ARENA_H + '|' + _wver;
}
const drawSceneryLive = drawScenery;
drawScenery = function(ctx, cx, cy, vw, vh){
  if (!SCEN.ch) return;
  if (groundCacheOn() && CTX && tilesDraw(SceneryCache, sceneryCacheSig(), ctx, cx, cy, vw, vh, function(c, tx, ty, tw, th){ sceneryPass(c, tx - tw / 2, ty - th / 2, tw, th, 1); })){
    sceneryPass(ctx, cx - vw / 2, cy - vh / 2, vw, vh, 2);                                  /* the tiles hold what is still; what moves is drawn on top */
    return;
  }
  drawSceneryLive(ctx, cx, cy, vw, vh);
};
