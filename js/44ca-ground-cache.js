'use strict';
/* =============================================================================================================================
   44ca-ground-cache.js  --  THE GROUND, PAINTED ONCE. Every biome's ground is drawn each frame from scratch: the pattern fill, the pool, and
   every rock, tree, fern and crack in view (from about 90 canvas calls a frame in the savanna to nearly 800 in the jungle). The ground
   does not move, so when the game is short of time it is painted into square tiles (CH world units wide) and each frame only copies the
   tiles that are on screen: a handful of drawImage calls instead of hundreds of fills and strokes.
   It is used while the menu or the attract run is behind the title (nobody is playing that), and when the effects level is Low or
   Medium (the Effects setting), or as soon as the slow-device governor (44c-perf.js) has taken its first step down. At full effects the ground is drawn live, so
   the little things that move on it (fern sway, drifting leaves, glints on the water) still move; in tiles they hold still.
   Tiles are drawn by the ordinary drawGround, so every biome is covered without a line of its own. Each tile is keyed by the biome, the
   decor, the pool, the sharpness and the zoom, so a change of any of them just makes new tiles (the menu preview shows other biomes while the run
   shows one); they are built a few a frame so there is no hitch, and the game draws live until the tiles
   it needs are ready. At most GroundCache.max tiles are kept (least recently used go first).
   ============================================================================================================================= */
const GroundCache = { CH: 512, M: 96, max: 16, perFrame: 3, map: new Map(), builds: 0, hits: 0, live: 0, bytes: 0, maxBytes: 72e6 };
function groundCacheOn(){
  return typeof fxLevelNow === 'function' && (G.attract || G.state === 'menu' || fxLevelNow() <= 1 || (typeof Perf !== 'undefined' && Perf.idx >= 1));
}
function groundCacheClear(){ GroundCache.map.clear(); GroundCache.bytes = 0; }
function groundCacheSig(){
  const w = G.water, d = G.decor;
  return G.biome + '|' + (G.chapter | 0) + '|' + (G.dpr * G.zoom).toFixed(3) + '|' + (d ? d.length : 0) + '|' + (w ? (w.x | 0) + ',' + (w.y | 0) + ',' + (w.r | 0) : '-') + '|' + ARENA_W + 'x' + ARENA_H;
}
const drawGroundLive = drawGround;
drawGround = function(ctx, cx, cy, vw, vh){
  const GC = GroundCache;
  if (!groundCacheOn() || !CTX){ drawGroundLive(ctx, cx, cy, vw, vh); return; }
  const sig = groundCacheSig();
  const CH = GC.CH, k = G.dpr * G.zoom, px = Math.max(64, Math.ceil(CH * k)), s = px / CH;
  const i0 = Math.floor((cx - vw / 2) / CH), i1 = Math.floor((cx + vw / 2) / CH), j0 = Math.floor((cy - vh / 2) / CH), j1 = Math.floor((cy + vh / 2) / CH);
  if ((i1 - i0 + 1) * (j1 - j0 + 1) > GC.max - 2 || px * px * 4 * GC.max > GC.maxBytes * 1.6){ GC.live++; drawGroundLive(ctx, cx, cy, vw, vh); return; }      /* too big a view for the tiles: draw live */
  let built = 0, missing = 0;
  for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++){
    const key = sig + '#' + i + ',' + j;
    if (GC.map.has(key)) continue;
    if (built >= GC.perFrame){ missing++; continue; }
    const cv = document.createElement('canvas'); cv.width = cv.height = px;
    const c = cv.getContext('2d'); if (!c){ missing++; continue; }
    c.setTransform(s, 0, 0, s, -i * CH * s, -j * CH * s);
    try { drawGroundLive(c, i * CH + CH / 2, j * CH + CH / 2, CH + GC.M * 2, CH + GC.M * 2); } catch (e) { missing++; continue; }
    cv._b = px * px * 4; GC.map.set(key, cv); GC.bytes += cv._b; GC.builds++; built++;
  }
  if (missing){ GC.live++; drawGroundLive(ctx, cx, cy, vw, vh); return; }                  /* some tiles are still being made: this frame is drawn live */
  for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++){
    const key = sig + '#' + i + ',' + j, cv = GC.map.get(key);
    GC.map.delete(key); GC.map.set(key, cv);                                                /* most recently used goes last */
    ctx.drawImage(cv, i * CH - 0.5, j * CH - 0.5, CH + 1, CH + 1);                          /* a half unit over each edge, so no hairline shows between tiles */
  }
  GC.hits++;
  while (GC.map.size > GC.max || GC.bytes > GC.maxBytes){ const old = GC.map.keys().next().value; GC.bytes -= GC.map.get(old)._b; GC.map.delete(old); }
};
