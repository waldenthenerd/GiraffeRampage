/* perf-spike: one chapter, held alive; logs every frame over 25 ms with its index and the state. params: ch, n */
(function(){
  var ch = +(QA.params.ch || 5), N = +(QA.params.n || 700);
  GR.handleAction('splash-go');
  var t0 = performance.now(); GR.startRun(ch); G.introFX = null; var start = performance.now() - t0;
  var sp = [];
  for (var i = 0; i < N; i++){ P.invuln = 99; P.hp = P.maxHp; if (G.state === 'levelup') G.state = 'playing'; var a = performance.now(); GR.step(1/60); var d = performance.now() - a; if (d > 25) sp.push(i + ':' + Math.round(d) + ':' + G.enemies.length + ':w' + G.wave); }
  QA.done({ startRunMs: Math.round(start), spikes: sp });
})();
