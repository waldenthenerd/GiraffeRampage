'use strict';
/* A picture cache for the creatures. */
/* ========================= 44t. ENEMY SPRITE CACHE ========================= */
/* Every creature is vector art, redrawn from scratch for every creature on every frame; with a big crowd that is the main cost.
   Here a creature's drawing is rendered once into a small offscreen canvas per animation phase (16 per cycle) and the picture is
   drawn instead (drawEnemy in 35h-draw-enemy.js calls EnemySprite.draw before it falls back to drawEnemyBody).

   It is only used when it is provably the same picture. Before a kind of creature is cached, it is PROBED: its drawing is run
   into scratch canvases and
     - every property it reads of the creature must be one of SAFE_READ (not its position, angle, health, timers...);
     - it must not call Math.random, add particles or text, or use a blend mode other than source-over (a glow would change);
     - its animation must loop exactly after 1 to 10 turns (2 PI each; many drawings mix speeds, so the loop is longer than one turn),
       so the pictures (16 per turn) repeat without a jump;
     - it must look the same at another G.time, so it does not depend on the clock.
   Anything that fails any of those is left on the live path for good (and EnemySprite.report() says why). Also never cached:
   bosses (e.big), a creature that is flashing from a hit (the white flash is blended into its colours), and portraits.
   The key is: chapter, effects level, state, size (to 0.5) and the screen scale, so nothing stale is ever drawn after a change.
   The picture is cropped to what was actually drawn. If a drawing touches the edge of its box it is not cached. The total is
   capped (SPRITE_BUDGET pixels); when it is reached the cache is emptied and refills as needed. */
const EnemySprite = (function(){
  const MAX_CYCLES = 10, SPRITE_BUDGET = 18e6;
  const frames = function(k){ return Math.min(160, 16 * k); };       /* pictures per loop: 16 for every turn of the animation */
  const SAFE_READ = { def: 1, type: 1, r: 1, anim: 1, state: 1, flash: 1, big: 1, portrait: 1 };
  const ccDesc = Object.getOwnPropertyDescriptor(CanvasRenderingContext2D.prototype, 'globalCompositeOperation');
  let maps = new WeakMap(), px = 0, probeA = null, probeB = null, scratchSize = 0;
  const stats = { drawn: 0, live: 0, built: 0, bad: 0, why: {}, liveBy: { portrait: 0, big: 0, flash: 0, off: 0, kind: 0, edge: 0, wait: 0 } };
  let on = true;
  /* new pictures are made a few per frame at most (a creature that has to wait is simply drawn live that frame), so filling the cache never causes a hitch */
  const BUILDS_PER_FRAME = 3;
  let budgetAt = 0, budgetLeft = BUILDS_PER_FRAME;
  function canBuild(){
    const now = performance.now();
    if (now - budgetAt > 12){ budgetAt = now; budgetLeft = BUILDS_PER_FRAME; }
    if (budgetLeft <= 0) return false;
    budgetLeft--; return true;
  }

  function guarded(cv){
    const c = cv.getContext('2d', { willReadFrequently: true });
    c._bad = false;
    Object.defineProperty(c, 'globalCompositeOperation', { configurable: true, get: function(){ return ccDesc.get.call(c); }, set: function(v){ if (v !== 'source-over') c._bad = true; ccDesc.set.call(c, v); } });
    return c;
  }
  function canvas(size){
    const cv = document.createElement('canvas'); cv.width = cv.height = size;
    return guarded(cv);
  }
  /* run the drawing once into context c (size x size px, the creature at its centre) at animation phase anim; returns what happened */
  function paint(c, def, type, state, r, anim, sc, size, spy, cols){
    c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, size, size);
    c.setTransform(sc, 0, 0, sc, size / 2, size / 2);
    c._bad = false;
    const base = { def: def, type: type, r: r, anim: anim, state: state, flash: 0, big: false, portrait: false, x: 0, y: 0, ang: 0 };
    const te = spy ? new Proxy(base, { get: function(t, k){ if (typeof k === 'string' && !SAFE_READ[k]) spy.reads[k] = 1; return t[k]; }, has: function(t, k){ if (typeof k === 'string' && !SAFE_READ[k]) spy.reads[k] = 1; return k in t; } }) : base;
    const rnd = Math.random, np = G.particles.length, nt = G.texts ? G.texts.length : 0;
    let calls = 0;
    Math.random = function(){ calls++; return rnd(); };
    try { drawEnemyBody(c, te, cols ? cols.body : def.color, cols ? cols.dk : def.dark, Math.sin(anim) * (r * 0.06), state === 'wind', def); }
    finally { Math.random = rnd; }
    const side = G.particles.length !== np || (G.texts && G.texts.length !== nt);
    if (G.particles.length > np) G.particles.length = np;
    if (G.texts && G.texts.length > nt) G.texts.length = nt;
    c.setTransform(1, 0, 0, 1, 0, 0);
    return { random: calls > 0, side: side, blend: c._bad };
  }
  function same(ca, cb, size){
    const a = ca.getImageData(0, 0, size, size).data, b = cb.getImageData(0, 0, size, size).data;
    let n = 0, diff = 0;
    for (let i = 0; i < a.length; i += 4){
      if (a[i + 3] < 8 && b[i + 3] < 8) continue;
      n++;
      if (Math.abs(a[i] - b[i]) + Math.abs(a[i + 1] - b[i + 1]) + Math.abs(a[i + 2] - b[i + 2]) + Math.abs(a[i + 3] - b[i + 3]) > 90) diff++;
    }
    return n === 0 || diff / n < 0.02;
  }
  function probe(def, type, state, r){
    const size = Math.ceil((r * 2.2 + 24) * 2);
    if (size > 400) return 'too big';
    if (!probeA || scratchSize < size){ probeA = canvas(size); probeB = canvas(size); scratchSize = size; }
    const A = probeA, B = probeB, spy = { reads: {} };
    const t0 = G.time, a0 = 0.7;
    const f1 = paint(A, def, type, state, r, a0, 1, size, spy);
    if (f1.random) return 'uses random';
    if (f1.side) return 'adds particles or text';
    if (f1.blend) return 'blend mode';
    const keys = Object.keys(spy.reads);
    if (keys.length) return 'reads ' + keys.slice(0, 4).join(',');
    G.time = t0 + 0.43;
    try { paint(B, def, type, state, r, a0, 1, size, null); } finally { G.time = t0; }
    if (!same(A, B, size)) return 'depends on the clock';
    for (let k = 1; k <= MAX_CYCLES; k++){
      paint(B, def, type, state, r, a0 + k * TAU, 1, size, null);
      if (same(A, B, size)) return k;
    }
    return 'does not loop';
  }
  function build(def, type, state, r, idx, sc, cycles, F, cols){
    const size = Math.ceil((r * 2.2 + 24) * 2 * sc);
    if (size > 900) return null;
    const c = canvas(size);
    const anim = (idx + 0.5) * TAU * cycles / F;
    const res = paint(c, def, type, state, r, anim, sc, size, null, cols);
    if (res.random || res.side || res.blend) return null;
    const d = c.getImageData(0, 0, size, size).data;
    let x0 = size, y0 = size, x1 = -1, y1 = -1;
    for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) if (d[(y * size + x) * 4 + 3] > 6){ if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
    if (x1 < 0) return { cv: null, x: 0, y: 0, w: 0, h: 0 };
    if (x0 <= 0 || y0 <= 0 || x1 >= size - 1 || y1 >= size - 1) return null;         /* touches the edge of the box: it may be cut */
    const w = x1 - x0 + 1, h = y1 - y0 + 1, out = document.createElement('canvas');
    out.width = w; out.height = h;
    out.getContext('2d').drawImage(c.canvas, x0, y0, w, h, 0, 0, w, h);
    px += w * h; stats.built++;
    return { cv: out, x: (x0 - size / 2) / sc, y: (y0 - size / 2) / sc, w: w / sc, h: h / sc };
  }
  function draw(ctx, e, d){
    if (!on || e.portrait || e.big || !d || !(e.anim === e.anim)){ stats.live++; stats.liveBy[!on ? 'off' : e.portrait ? 'portrait' : 'big']++; return false; }
    const sc = Math.min(2.5, Math.max(0.75, Math.round(G.zoom * G.dpr * 6) / 4));      /* made at 1.5 times the screen's scale (up to 2.5), so drawing them smaller keeps the edges crisp */
    const rq = Math.max(1, Math.round(e.r * 2));
    const key = (G.chapter | 0) + '|' + fxLevelNow() + '|' + e.type + '|' + e.state + '|' + rq + '|' + sc;
    let per = maps.get(d);
    if (!per){ per = new Map(); maps.set(d, per); }
    let ent = per.get(key);
    if (!ent){
      if (!canBuild()){ stats.live++; stats.liveBy.wait++; return false; }
      const why = probe(d, e.type, e.state, rq / 2);
      ent = { ok: typeof why === 'number', k: typeof why === 'number' ? why : 1, frames: new Array(typeof why === 'number' ? frames(why) : 0), fl: {} };
      if (typeof why !== 'number'){ stats.bad++; stats.why['c' + (G.chapter | 0) + ' ' + e.type + ' ' + e.state] = why; }
      per.set(key, ent);
    }
    if (!ent.ok){ stats.live++; stats.liveBy.kind++; return false; }
    /* a creature that is flashing from a hit has its colours blended toward white (the player's Hit flash setting); that is a second,
       coarser set of pictures (8 per loop; the flash is over in a fraction of a second) */
    const hf = e.flash > 0 ? Settings.hitFlash : 0;
    const span = TAU * ent.k, ph = ((e.anim % span) + span) % span;
    let arr = ent.frames, F = arr.length, cols = null;
    if (hf > 0){
      const q = Math.round(hf * 20) / 20;
      arr = ent.fl[q] || (ent.fl[q] = new Array(8)); F = 8;
      cols = { body: q >= 1 ? '#FFFFFF' : blendHex(d.color, '#FFFFFF', q), dk: q >= 1 ? '#FFD9C4' : blendHex(d.dark, '#FFD9C4', q) };
    }
    const idx = Math.min(F - 1, Math.floor(ph / span * F));
    let f = arr[idx];
    if (f === undefined){
      if (px > SPRITE_BUDGET){ maps = new WeakMap(); px = 0; per = new Map(); maps.set(d, per); per.set(key, ent); ent.frames = new Array(ent.frames.length); ent.fl = {}; arr = hf > 0 ? (ent.fl[Math.round(hf * 20) / 20] = new Array(8)) : ent.frames; }
      if (!canBuild()){ stats.live++; stats.liveBy.wait++; return false; }
      f = arr[idx] = build(d, e.type, e.state, rq / 2, idx, sc, ent.k, F, cols);
    }
    if (f === null){ ent.ok = false; stats.bad++; stats.live++; stats.liveBy.edge++; return false; }
    if (f.cv) ctx.drawImage(f.cv, f.x, f.y, f.w, f.h);
    stats.drawn++;
    return true;
  }
  return {
    draw: draw, stats: stats,
    get on(){ return on; }, set on(v){ on = !!v; },
    clear: function(){ maps = new WeakMap(); px = 0; },
    megapixels: function(){ return px / 1e6; },
    /* for testing and for the stats panel: which kinds of creature are cached, and why not */
    report: function(){ return JSON.parse(JSON.stringify(stats.why)); }
  };
})();
