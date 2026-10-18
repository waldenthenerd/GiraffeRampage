/* perf-run: time GR.step in a run, with plain gear vs a loaded mythical loadout. params: ch (chapter), n (steps) */
(function(){
  var ch = +(QA.params.ch || 1), N = +(QA.params.n || 400);
  GR.handleAction('splash-go');
  var out = {};
  function timeIt(label){
    var t0 = performance.now(), fr = [];
    for (var i = 0; i < N; i++){ var a = performance.now(); GR.step(1/60); fr.push(performance.now() - a); }
    fr.sort(function(a, b){ return a - b; });
    out[label] = { avg: +((performance.now() - t0) / N).toFixed(2), p95: +fr[Math.floor(N * .95)].toFixed(2), max: +fr[N - 1].toFixed(2), en: G.enemies.length };
  }
  GR.startRun(ch); G.introFX = null;
  timeIt('run');
  QA.done(out);
})();
