/* perf-ab: ms per GR.step in a held-alive run, a few chapters. Reports median / p95 / max and how many frames took over 33 ms. */
(function(){
  GR.handleAction('splash-go');
  var out = {};
  function stat(fr){
    fr = fr.slice().sort(function(x, y){ return x - y; }); var n = fr.length;
    return { med: +fr[n >> 1].toFixed(2), p95: +fr[Math.floor(n * .95)].toFixed(2), max: +fr[n - 1].toFixed(1), over33: fr.filter(function(v){ return v > 33; }).length };
  }
  [1, 5, 9].forEach(function(ch){
    GR.startRun(ch); G.introFX = null;
    for (var i = 0; i < 150; i++){ P.invuln = 99; P.hp = P.maxHp; GR.step(1/60); }
    var fr = [];
    for (i = 0; i < 420; i++){ P.invuln = 99; P.hp = P.maxHp; if (G.state === 'levelup'){ G.state = 'playing'; } var a = performance.now(); GR.step(1/60); fr.push(performance.now() - a); }
    var r = stat(fr); r.en = G.enemies.length; r.st = G.state; out['ch' + ch] = r;
  });
  QA.done(out);
})();
