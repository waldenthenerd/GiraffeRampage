/* particles: the particle list (addParticle in js/game/03-combat-core.js, updateParticles in 31-waves-update.js, drawParticles in 32-render.js).
   - the limit follows the effects level (High 420, Medium 280, Low 160) and a full list takes new ones in place of old ones without growing;
   - particles that die go back to the pool and are used again (no new objects in a busy fight), and none that is alive is lost;
   - the dots drawn as one path per color and opacity look the same as dots drawn one at a time, with far fewer fills, and are timed. */
(function(){
  var out = { errs: [] }; window.addEventListener('error', function(e){ out.errs.push(e.message); });
  GR.handleAction('splash-go');
  try {
    GR.startRun(1); G.introFX = null; for (var i = 0; i < 10; i++){ P.invuln = 99; GR.step(1/60); }
    var realFx = window.fxLevelNow, cols = ['#FFD27A', '#FF8A2E', '#EAF9FF', '#9DFBEA', '#E4261A', '#FFFFFF'];
    function fill(n){ for (var k = 0; k < n; k++) addParticle(P.x + (k % 40) * 9 - 180, P.y + Math.floor(k / 40) * 9 - 60, 0, 0, 2 + (k % 4), 0.2 + (k % 10) * 0.1, cols[k % cols.length], k % 3 ? { glow: true } : null); }
    var caps = [];
    [2, 1, 0].forEach(function(f){ window.fxLevelNow = function(){ return f; }; G.particles.length = 0; fill(1000); caps.push(G.particles.length); });
    window.fxLevelNow = realFx;
    out.caps = caps; out.capOk = caps[0] === 420 && caps[1] === 280 && caps[2] === 160;
    /* the pool: dead particles come back and are used again */
    G.particles.length = 0; PART_POOL.length = 0; fill(200);
    var before = G.particles.slice(), alive = before.filter(function(p){ return p.life > 0.25; }).length;
    updateParticles(0.25);
    out.aliveKept = G.particles.length === alive && G.particles.every(function(p){ return p.life > 0; });
    out.pooled = PART_POOL.length === 200 - alive;
    var poolSet = new Set(PART_POOL); fill(50); out.reused = G.particles.slice(-50).filter(function(p){ return poolSet.has(p); }).length === Math.min(50, poolSet.size);
    /* drawing: batched dots against one at a time */
    G.particles.length = 0; fill(400);
    var cv = document.createElement('canvas'); cv.width = 640; cv.height = 360; var c = cv.getContext('2d');
    var fills = 0, of = CanvasRenderingContext2D.prototype.fill;
    CanvasRenderingContext2D.prototype.fill = function(){ fills++; return of.apply(this, arguments); };
    function draw(on){ PART_BATCH.on = on; c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = '#3A4A2A'; c.fillRect(0, 0, 640, 360); c.setTransform(1, 0, 0, 1, 320 - P.x, 180 - P.y); fills = 0; drawParticles(c); var f = fills; return { f: f, d: c.getImageData(0, 0, 640, 360).data }; }
    var A = draw(true), Bd = draw(false), n = 0, diff = 0;
    CanvasRenderingContext2D.prototype.fill = of; PART_BATCH.on = true;
    for (var q = 0; q < A.d.length; q += 4){ var d = Math.abs(A.d[q] - Bd.d[q]) + Math.abs(A.d[q + 1] - Bd.d[q + 1]) + Math.abs(A.d[q + 2] - Bd.d[q + 2]); if (d > 0) n++; if (d > 60) diff++; }
    out.fillsBatched = A.f; out.fillsSingle = Bd.f; out.fewerFills = A.f * 5 < Bd.f;
    out.bigDiffPct = +(diff / (A.d.length / 4) * 100).toFixed(2); out.looksSame = out.bigDiffPct < 1;
    /* timing on the game's own canvas (milliseconds, software drawing: compare the two, not with a device) */
    function time(on){ PART_BATCH.on = on; var t = performance.now(); for (var r = 0; r < 60; r++){ CTX.save(); CTX.setTransform(1, 0, 0, 1, 640 - P.x, 360 - P.y); drawParticles(CTX); CTX.restore(); } return (performance.now() - t) / 60; }
    time(true); time(false); var tb = 0, ts = 0; for (var r = 0; r < 3; r++){ tb += time(true); ts += time(false); }
    PART_BATCH.on = true; out.msBatched = +(tb / 3).toFixed(3); out.msSingle = +(ts / 3).toFixed(3);
    G.particles.length = 0;
  } catch (err){ out.err = String(err && err.stack || err); }
  out.pass = out.errs.length === 0 && !out.err && out.capOk && out.aliveKept && out.pooled && out.reused && out.fewerFills && out.looksSame;
  QA.done(out);
})();
