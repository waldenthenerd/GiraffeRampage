/* perf-bench: a heavy late-game scene, with the time of each stage of the frame (milliseconds per frame, inclusive) and the canvas calls.
   Software rendering makes the milliseconds large, so compare runs of this same scenario, not the numbers with a real device.
   params: ch (chapter, default 6), wave (default 20), n (frames, default 240), en (extra enemies, default 120), fx (0-2), warm (warm-up frames, default 400), ab=shadow (alternate the shadow cache on and off) */
(function(){
  var ch = +(QA.params.ch || 6), wave = +(QA.params.wave || 20), N = +(QA.params.n || 240), EN = QA.params.en === undefined ? 120 : +QA.params.en, WARM = +(QA.params.warm || 400);
  var times = {}, calls = {}, byStage = {}, cur = null, total = 0;
  function wrap(nm){
    var f = window[nm]; if (typeof f !== 'function' || f._pb) return;
    var w = function(){
      var t = performance.now(), prev = cur; cur = nm;
      try { return f.apply(this, arguments); } finally { var d = performance.now() - t; times[nm] = (times[nm] || 0) + d; cur = prev; }
    };
    w._pb = 1; try { window[nm] = w; } catch (e) {}
  }
  var names = Object.keys(window).filter(function(k){ return /^(draw|render|update)[A-Z0-9_]/.test(k) && typeof window[k] === 'function'; });
  names.concat(['update', 'render', 'step']).forEach(wrap);
  var proto = CanvasRenderingContext2D.prototype;
  ['fill', 'stroke', 'fillRect', 'strokeRect', 'drawImage', 'fillText', 'strokeText', 'createRadialGradient', 'createLinearGradient', 'clip', 'getImageData'].forEach(function(k){
    var o = proto[k]; proto[k] = function(){ calls[k] = (calls[k] || 0) + 1; if (cur){ var q = byStage[cur] || (byStage[cur] = {}); q[k] = (q[k] || 0) + 1; } if (this.shadowBlur > 0) calls.shadowed = (calls.shadowed || 0) + 1; return o.apply(this, arguments); };
  });
  if (QA.params.fx){ var _fx = +QA.params.fx; window.fxLevelNow = function(){ return _fx; }; }
  GR.handleAction('splash-go');
  GR.startRun(ch, (ch - 1) * 25 + wave); G.introFX = null;
  function keepAlive(){ P.invuln = 99; P.hp = P.maxHp; if (G.state === 'levelup') G.state = 'playing'; }
  for (var i = 0; i < 120; i++){ keepAlive(); GR.step(1/60); }
  var types = Object.keys(ETYPES).filter(function(k){ return !ETYPES[k].boss; }).slice(0, 12);
  for (i = 0; i < EN; i++){ var a = Math.random() * 6.28, r = 120 + Math.random() * 700; try { spawnEnemy(types[i % types.length], P.x + Math.cos(a) * r, P.y + Math.sin(a) * r, G.wave); } catch (e) {} }
  for (i = 0; i < WARM; i++){ keepAlive(); GR.step(1/60); }
  var sp0 = typeof EnemySprite !== 'undefined' ? JSON.parse(JSON.stringify(EnemySprite.stats)) : null;
  times = {}; calls = {}; byStage = {};
  if (QA.params.ab === 'shadow'){
    var ab = { on: [], off: [] };
    for (var blk = 0; blk < 8; blk++){
      var mode = blk % 2 ? 'off' : 'on'; ShadowCache.on = mode === 'on'; calls = {};
      var t1 = performance.now(); for (i = 0; i < 40; i++){ keepAlive(); GR.step(1/60); } ab[mode].push((performance.now() - t1) / 40);
    }
    ShadowCache.on = true;
    var avg = function(a){ return +(a.reduce(function(x, y){ return x + y; }, 0) / a.length).toFixed(2); };
    return QA.done({ shadowOnMs: avg(ab.on), shadowOffMs: avg(ab.off), enemies: G.enemies.length, raw: ab });
  }
  var fr = [], t0 = performance.now(), mem = performance.memory, alloc = 0, lastHeap = mem ? mem.usedJSHeapSize : 0, gcs = 0;
  for (i = 0; i < N; i++){
    keepAlive(); var s = performance.now(); GR.step(1/60); fr.push(performance.now() - s);
    if (mem){ var hp = mem.usedJSHeapSize; if (hp >= lastHeap) alloc += hp - lastHeap; else gcs++; lastHeap = hp; }
  }
  total = performance.now() - t0; fr.sort(function(a, b){ return a - b; });
  var rows = Object.keys(times).map(function(k){ return [k, +(times[k] / N).toFixed(2)]; }).sort(function(a, b){ return b[1] - a[1]; }).slice(0, 22);
  var cl = {}; Object.keys(calls).forEach(function(k){ cl[k] = Math.round(calls[k] / N); });
  QA.done({ ch: ch, wave: G.wave, enemies: G.enemies.length, particles: G.particles ? G.particles.length : (typeof particles !== 'undefined' ? particles.length : -1),
    avgMs: +(total / N).toFixed(2), allocKBperFrame: mem ? Math.round(alloc / N / 102.4) / 10 : null, gcs: gcs, p95: +fr[Math.floor(N * .95)].toFixed(2), max: +fr[N - 1].toFixed(2), stages: rows, callsPerFrame: cl, callsByStage: Object.keys(byStage).map(function(k){ var o = byStage[k], t = 0; Object.keys(o).forEach(function(j){ o[j] = Math.round(o[j] / N); t += o[j]; }); return [k, t, o]; }).sort(function(a, b){ return b[1] - a[1]; }).slice(0, 12),
    shadows: typeof ShadowCache !== 'undefined' ? { stats: ShadowCache.stats, size: ShadowCache.size() } : null,
    sprites: typeof EnemySprite !== 'undefined' ? { before: sp0, stats: EnemySprite.stats, why: EnemySprite.report(), mp: +EnemySprite.megapixels().toFixed(1) } : null });
})();
