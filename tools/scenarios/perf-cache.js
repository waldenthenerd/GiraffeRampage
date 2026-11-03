/* perf-cache: the shadow cache draws the same shadow as the live code, and the culled draw loops still draw what is on the screen.
   Shadow: the live softShadow and the cached one are drawn side by side for a range of sizes and sun directions and the pixels compared. */
(function(){
  var res = {}, errs = [];
  GR.handleAction('splash-go');
  GR.startRun(1); G.introFX = null;
  for (var i = 0; i < 60; i++){ P.invuln = 99; GR.step(1/60); }
  res.cacheThere = typeof ShadowCache === 'object' && softShadow === ShadowCache.draw;
  /* 1. cached shadow vs live shadow */
  var base = null;
  (function(){ var s = ShadowCache; base = null; })();
  function paint(fn, w, h){
    var cv = document.createElement('canvas'); cv.width = w; cv.height = h; var c = cv.getContext('2d', { willReadFrequently: true });
    c.setTransform(G.dpr * G.zoom, 0, 0, G.dpr * G.zoom, 0, 0); fn(c); return c.getImageData(0, 0, w, h).data;
  }
  /* the live version: the same two ellipses as 36i-lighting.js, written out here */
  function live(ctx, x, y, rx, ry, a, h){
    var off = (h === undefined ? ry : h) * Light.shLen * 0.9, ox = Light.shx * off, oy = Light.shy * off * 0.6, sa = a * Light.shA;
    ctx.fillStyle = 'rgba(' + Light.shRGB + ',' + (sa * 0.4).toFixed(3) + ')';
    ctx.beginPath(); ctx.ellipse(x + ox, y + oy, rx * 1.3, ry * 1.3, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = 'rgba(' + Light.shRGB + ',' + sa.toFixed(3) + ')';
    ctx.beginPath(); ctx.ellipse(x + ox * 0.4, y + oy * 0.4, rx, ry, 0, 0, TAU); ctx.fill();
  }
  Light.on = true;
  var worst = 0, cases = 0, bad = 0;
  [[10, 5, 0.42, 5], [22, 11, 0.42, 11], [26, 12, 0.32, 14], [44, 30, 0.42, 24], [8.3, 4.1, 0.3, 4], [60, 20, 0.22, 24]].forEach(function(c){
    [[0.6, 0.5], [-0.7, 0.3], [0, 1], [0.2, -0.4]].forEach(function(d){
      Light.shx = d[0]; Light.shy = d[1]; ShadowCache.clear();
      var W = Math.ceil(240 * G.dpr * G.zoom), A = paint(function(cc){ live(cc, 100, 100, c[0], c[1], c[2], c[3]); }, W, W), B = paint(function(cc){ ShadowCache.draw(cc, 100, 100, c[0], c[1], c[2], c[3]); }, W, W);
      /* compare 4 x 4 pixel blocks: a half pixel shift moves the edge pixels a little but not the picture */
      var mx = 0, sa = 0, sb = 0, by, bx, yy, xx, ta, tb;
      for (by = 0; by + 4 <= W; by += 4) for (bx = 0; bx + 4 <= W; bx += 4){
        ta = 0; tb = 0;
        for (yy = 0; yy < 4; yy++) for (xx = 0; xx < 4; xx++){ var q = ((by + yy) * W + bx + xx) * 4 + 3; ta += A[q]; tb += B[q]; }
        mx = Math.max(mx, Math.abs(ta - tb) / 16); sa += ta; sb += tb;
      }
      worst = Math.max(worst, Math.round(mx * 10) / 10); cases++; if (mx > 12 || Math.abs(sa - sb) > sa * 0.06){ bad++; (res.badCases = res.badCases || []).push([c.join(','), d.join(','), Math.round(mx * 10) / 10, Math.round((sb / sa - 1) * 1000) / 10 + '%']); }
    });
  });
  res.shadow = { cases: cases, worstAlphaDiff: worst, bad: bad, built: ShadowCache.stats.built };
  /* 2. the cache is reused, not rebuilt, and stays small */
  ShadowCache.clear(); var b0 = ShadowCache.stats.built, cc = document.createElement('canvas').getContext('2d');
  for (i = 0; i < 300; i++) ShadowCache.draw(cc, 50, 50, 12, 6, 0.4, 6);
  res.reused = ShadowCache.stats.built - b0 === 1;
  /* 3. culling: a particle and a number on the screen are drawn, ones far away are not */
  GR.step(1/60);
  var n = 0, proto = CanvasRenderingContext2D.prototype, of = proto.fillText, os = proto.strokeText;
  proto.fillText = function(){ n++; return of.apply(this, arguments); };
  G.texts.length = 0;
  addText(P.x + 10, P.y - 40, 'near', '#fff', 16, false); addText(P.x + 5000, P.y + 5000, 'far', '#fff', 16, false);
  var cv2 = document.createElement('canvas'); cv2.width = 400; cv2.height = 400;
  render(); /* sets the camera */
  n = 0; drawTexts(cv2.getContext('2d'));
  proto.fillText = of;
  res.textsDrawn = n;
  /* particles: count arcs */
  var pa = proto.arc, arcs = 0; proto.arc = function(){ arcs++; return pa.apply(this, arguments); };
  G.particles.length = 0;
  addParticle(P.x + 20, P.y, 0, 0, 3, 5, '#ff0000', {}); addParticle(P.x + 9000, P.y, 0, 0, 3, 5, '#ff0000', {});
  render(); arcs = 0; drawParticles(cv2.getContext('2d')); proto.arc = pa;
  res.particleArcs = arcs;
  /* 5. creature pictures: the cached picture matches the live drawing, and the remembered entry follows the state and the chapter */
  GR.startRun(1); G.introFX = null; for (i = 0; i < 20; i++){ P.invuln = 99; GR.step(1/60); }
  G.enemies.length = 0; Light.on = true;
  function spin(){ var t = performance.now(); while (performance.now() - t < 13); }       /* the creature pictures are made a few milliseconds per 12 ms window */
  var kinds = ['hyena', 'jackal', 'baboon', 'rhino', 'cheetah', 'warthog'].filter(function(k){ return ETYPES[k]; });
  var sprOk = 0, sprBad = [], sprTried = 0;
  kinds.forEach(function(k){
    var e = spawnEnemy(k, 0, 0, 3); e.x = 120; e.y = 120; e.ang = 0.4; e.flash = 0; e.anim = 3.5 * TAU / 16;       /* the middle of one of the 16 phases the pictures are made at */
    var cvA = document.createElement('canvas'), cvB = document.createElement('canvas'); cvA.width = cvA.height = cvB.width = cvB.height = 240;
    var ca = cvA.getContext('2d', { willReadFrequently: true }), cb = cvB.getContext('2d', { willReadFrequently: true });
    var d0 = EnemySprite.stats.drawn, tries = 0;
    while (EnemySprite.stats.drawn === d0 && tries++ < 80){ ca.clearRect(0, 0, 240, 240); ca.setTransform(G.dpr * G.zoom, 0, 0, G.dpr * G.zoom, 0, 0); drawEnemy(ca, e); spin(); }
    ca.setTransform(1, 0, 0, 1, 0, 0); ca.clearRect(0, 0, 240, 240); ca.setTransform(G.dpr * G.zoom, 0, 0, G.dpr * G.zoom, 0, 0);
    var d1 = EnemySprite.stats.drawn; drawEnemy(ca, e); var cached = EnemySprite.stats.drawn > d1;
    EnemySprite.on = false; cb.setTransform(G.dpr * G.zoom, 0, 0, G.dpr * G.zoom, 0, 0); drawEnemy(cb, e); EnemySprite.on = true;
    sprTried++;
    if (!cached){ sprBad.push(k + ': not cached'); return; }
    var A = ca.getImageData(0, 0, 240, 240).data, B = cb.getImageData(0, 0, 240, 240).data, mx = 0, W5 = 240;
    for (var by = 0; by + 4 <= W5; by += 4) for (var bx = 0; bx + 4 <= W5; bx += 4){ var ta = 0, tb = 0; for (var yy = 0; yy < 4; yy++) for (var xx = 0; xx < 4; xx++){ var q = ((by + yy) * W5 + bx + xx) * 4 + 3; ta += A[q]; tb += B[q]; } mx = Math.max(mx, Math.abs(ta - tb) / 16); }
    if (mx > 60) sprBad.push(k + ': differs ' + Math.round(mx)); else sprOk++;
  });
  res.sprites = { tried: sprTried, ok: sprOk, bad: sprBad };
  /* 5b. kinds cached by a rule (SPRITE_RULES in 44t): each is cached, and its picture matches the live drawing (a clock kind with its
     clock at phase / 6, as the picture was painted); a fading one is drawn fainter at a lower visibility */
  var ruled = [[6, 'vulture', null], [7, 'baboon', null], [8, 'mamba', { vis: 1 }], [8, 'termite', { state: 'sealed', stateT: 1.7 }], [8, 'cheetah', { z: 0 }], [8, 'ember', { fuse: 2.2 }],
    [8, 'turret', { life: 9 }], [9, 'grub', null], [10, 'hyena', null], [10, 'sword', null], [11, 'honeybadger', { glimHeat: 0.7 }], [12, 'mamba', { vis: 1 }], [13, 'honeybadger', { rage: 0.5 }], [13, 'baboon', { z: 0 }],
    [6, 'ember', null], [7, 'grub', null], [7, 'ember', null], [8, 'baboon', { healTgtT: 0 }], [8, 'baboon', { healTgtT: 0.5 }], [9, 'baboon', { healTgtT: 0 }], [9, 'cheetah', { z: 0 }], [9, 'ember', { fuse: 2.2 }],
    [10, 'cheetah', { z: 0 }], [10, 'ember', { fuse: 2.2 }]];
  var rOk = 0, rBad = [];
  ruled.forEach(function(rc){
    try { GR.startRun(rc[0], chapterFirstWave(rc[0]) + 5); } catch (er){ rBad.push(rc.slice(0, 2).join(' ') + ': start'); return; }
    G.enemies.length = 0; var e = spawnEnemy(rc[1], 0, 0, G.wave); if (!e){ rBad.push(rc.slice(0, 2).join(' ') + ': no spawn'); return; }
    var R = spriteRule(e.def, e.type); if (!R){ rBad.push(rc.slice(0, 2).join(' ') + ': no rule for ' + e.def.look); return; }
    e.x = 120; e.y = 120; e.ang = 0.4; e.flash = 0; e.ph = 0; if (rc[2]) Object.keys(rc[2]).forEach(function(k){ e[k] = rc[2][k]; });
    var A0 = 3.5 * TAU / 16; e.anim = A0; if (R.clock) G.time = A0 / 6;
    var cvA = document.createElement('canvas'), cvB = document.createElement('canvas'); cvA.width = cvA.height = cvB.width = cvB.height = 240;
    var ca = cvA.getContext('2d', { willReadFrequently: true }), cb = cvB.getContext('2d', { willReadFrequently: true }), s5 = G.dpr * G.zoom;
    var d0 = EnemySprite.stats.drawn, tries = 0;
    while (EnemySprite.stats.drawn === d0 && tries++ < 80){ ca.setTransform(1, 0, 0, 1, 0, 0); ca.clearRect(0, 0, 240, 240); ca.setTransform(s5, 0, 0, s5, 0, 0); drawEnemy(ca, e); spin(); }
    if (EnemySprite.stats.drawn === d0){ rBad.push(rc.slice(0, 2).join(' ') + ': not cached (' + (EnemySprite.report()['c' + G.chapter + ' ' + e.type + ' ' + e.state] || 'wait') + ')'); return; }
    ca.setTransform(1, 0, 0, 1, 0, 0); ca.clearRect(0, 0, 240, 240); ca.setTransform(s5, 0, 0, s5, 0, 0); drawEnemy(ca, e);
    EnemySprite.on = false; cb.setTransform(s5, 0, 0, s5, 0, 0); drawEnemy(cb, e); EnemySprite.on = true;
    var A = ca.getImageData(0, 0, 240, 240).data, B = cb.getImageData(0, 0, 240, 240).data, mx = 0;
    for (var by = 0; by + 4 <= 240; by += 4) for (var bx = 0; bx + 4 <= 240; bx += 4){ var ta = 0, tb = 0; for (var yy = 0; yy < 4; yy++) for (var xx = 0; xx < 4; xx++){ var q = ((by + yy) * 240 + bx + xx) * 4 + 3; ta += A[q]; tb += B[q]; } mx = Math.max(mx, Math.abs(ta - tb) / 16); }
    if (mx > 60){ rBad.push(rc.slice(0, 2).join(' ') + ': differs ' + Math.round(mx)); return; }
    if (R.alpha){ var sum = function(d){ var t = 0; for (var i = 3; i < d.length; i += 4) t += d[i]; return t; }, full = sum(A); e.vis = 0.4; ca.setTransform(1, 0, 0, 1, 0, 0); ca.clearRect(0, 0, 240, 240); ca.setTransform(s5, 0, 0, s5, 0, 0); drawEnemy(ca, e);
      var faint = sum(ca.getImageData(0, 0, 240, 240).data); if (!(faint < full * 0.6)){ rBad.push(rc.slice(0, 2).join(' ') + ': not fainter'); return; } }
    rOk++;
  });
  res.ruled = { tried: ruled.length, ok: rOk, bad: rBad };
  var e1 = spawnEnemy('hyena', 0, 0, 3), cv5 = document.createElement('canvas').getContext('2d');
  for (i = 0; i < 40; i++){ drawEnemy(cv5, e1); spin(); }
  var ent1 = e1._sk && e1._sk.ent; e1.state = 'wind'; for (i = 0; i < 40; i++){ drawEnemy(cv5, e1); spin(); }
  var ent2 = e1._sk && e1._sk.ent; var chWas = G.chapter; G.chapter = chWas === 2 ? 3 : 2; for (i = 0; i < 40; i++){ drawEnemy(cv5, e1); spin(); }
  var ent3 = e1._sk && e1._sk.ent; G.chapter = chWas; e1.state = 'idle'; for (i = 0; i < 40; i++){ drawEnemy(cv5, e1); spin(); }
  res.skFollows = !!ent1 && !!ent2 && ent1 !== ent2 && ent3 !== ent2 && e1._sk.ent === ent1;
  EnemySprite.clear(); for (i = 0; i < 40; i++){ drawEnemy(cv5, e1); spin(); }
  res.skClears = e1._sk.ent !== ent1 && !!e1._sk.ent;
  /* 4. the backdrop behind full-screen pages runs at 30 frames a second, a run at the screen's rate (120 frames of 16.7 ms = 2 seconds) */
  var realStep = window.step, steps = 0; window.step = function(){ steps++; };
  function stepsIn(state){ G.state = state; steps = 0; G.stateWas = state; lastTS = 0; accDt = 0; for (var f = 0; f < 120; f++) frame(1000 + f * 16.667); return steps; }
  res.stepsPlaying = stepsIn('playing'); res.stepsMenu = stepsIn('menu'); res.stepsShop = stepsIn('shop'); res.stepsHelp = stepsIn('help'); res.stepsPaused = stepsIn('paused');
  window.step = realStep;
  var thr = [res.stepsMenu, res.stepsShop, res.stepsHelp, res.stepsPaused].every(function(n){ return n >= 55 && n <= 65; }) && res.stepsPlaying >= 110;
  QA.done({ res: res, pass: thr && res.sprites.ok === res.sprites.tried && res.ruled.ok === res.ruled.tried && res.skFollows && res.skClears && res.cacheThere && res.shadow.worstAlphaDiff <= 12 && res.shadow.bad === 0 && res.reused && res.textsDrawn === 1 && res.particleArcs === 1 });
})();
