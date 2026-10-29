/* enemy-motion: js/game/44zzw-enemy-motion.js, how creatures move, react and fall.
   Gait: a creature that stands still (stunned) advances its animation much more slowly than one that runs, and a hurried one faster. Hit: a blow sets a short recoil with the direction
   of the blow. Death: a killed creature leaves a fallen picture that lasts a moment and then goes (and never more than the cap). Draw: every state and every death style draws without
   an error, a portrait is drawn exactly as before, and the sprite cache still takes the pictures while a creature is recoiling. */
(function(){
  var out = { errs: [] }; window.addEventListener('error', function(e){ out.errs.push(e.message); });
  GR.handleAction('splash-go'); Ach.check = function(){ return []; };
  try {
    Save.reset(); startRun(1, 1); for (var i = 0; i < 5; i++) GR.step(1 / 30); P.invuln = 1e9; P.hp = P.maxHp = 1e12; G.waveState = 'idle'; G.spawnQueue = []; G.enemies.length = 0; G.pendingLevels = 0;
    /* gait */
    function mk(type, x, y){ var e = spawnEnemy(type, x, y, 1); if (e) e.hp = e.maxHp = 1e12; return e; }
    var run = mk('hyena', P.x + 300, P.y), still = mk('hyena', P.x - 300, P.y); still.stunT = 99;
    var a0 = run.anim, b0 = still.anim, i2;
    for (i2 = 0; i2 < 30; i2++) GR.step(1 / 30);
    var runGait = run.gaitK, dRun = run.anim - a0, dStill = still.anim - b0;
    out.gait = { run: +dRun.toFixed(2), still: +dStill.toFixed(2) };
    out.gaitOk = dRun > 3 && dStill < dRun * 0.4 && runGait >= 0.88 && runGait <= 1.12;
    /* hit */
    G.enemies.length = 0; var h = mk('rhino', P.x + 200, P.y);
    GR.step(1 / 30); damageEnemy(h, 5, { kb: 100, kbAngle: 1.2 });
    out.hit = h.hitT > 0 && Math.abs(h.hitA - 1.2) < 1e-9; for (i2 = 0; i2 < 12; i2++) GR.step(1 / 30); out.hitEnds = h.hitT <= 0;
    /* turn: the picture follows the heading a moment late */
    h.stunT = 99; h._va = 0; h.ang = 2; var before = h._va; GR.step(1 / 30); out.turn = h._va > before && h._va < h.ang;
    /* draw: every state, a hit, a wind-up, a stun, on a canvas */
    var cv = document.createElement('canvas'); cv.width = cv.height = 300; var c = cv.getContext('2d');
    var states = ['idle', 'wind', 'lunge', 'dash', 'stompwind', 'chargewind', 'slam', 'crouch', 'stun', 'burn'], bad = [];
    ['hyena', 'lion', 'cheetah', 'vulture', 'mamba'].forEach(function(t){
      var e = mk(t, 150, 150); e._f = 1; e._va = 0.3; e._lag = 0.4; e.ph = 1; e._stt = 0.2;
      states.forEach(function(s){ e.state = s; e.hitT = s === 'idle' ? 0.1 : 0; e.stunT = s === 'stun' ? 1 : 0; c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, 300, 300); try { drawEnemy(c, e); } catch (err){ bad.push(t + '/' + s + ': ' + err.message); } });
    });
    out.drawBad = bad;
    /* a portrait is drawn exactly as before the motion layer */
    var def = ETYPES.hyena, pe = { portrait: true, def: def, type: 'hyena', x: 100, y: 100, r: def.r, ang: 0, flash: 0, state: 'idle', anim: 1.2, hp: 1, maxHp: 1, big: false, kx: 0, ky: 0, stunT: 0, burnT: 0, slowT: 0, slowMul: 1 };
    var c2 = document.createElement('canvas'); c2.width = c2.height = 200; var x2 = c2.getContext('2d'), c3 = document.createElement('canvas'); c3.width = c3.height = 200; var x3 = c3.getContext('2d');
    drawEnemy(x2, pe); em_draw(x3, pe);
    var d2 = x2.getImageData(0, 0, 200, 200).data, d3 = x3.getImageData(0, 0, 200, 200).data, same = true; for (var q = 0; q < d2.length; q++) if (d2[q] !== d3[q]){ same = false; break; }
    out.portraitSame = same;
    /* death: each style leaves a fallen picture that goes */
    G.enemies.length = 0; EM.corpses.length = 0;
    var kinds = ['hyena', 'wolf'].filter(function(k){ return ETYPES[k]; });
    var k1 = mk('hyena', P.x + 120, P.y); damageEnemy(k1, 1e15, { noCrit: true, quiet: true });
    out.corpse = EM.corpses.length === 1 && EM.corpses[0].life > 0.3;
    var styles = ['flesh', 'ice', 'goo', 'bubbles', 'metal', 'fire', 'ichor'], sb = [];
    styles.forEach(function(s){ var cc = { e: Object.assign({}, k1, { dead: false, flash: 0 }), st: s, t: 0.2, life: 0.42, hx: 1, hy: 0, tilt: 1, t0: G.time }; [0, 0.5, 0.99].forEach(function(f){ cc.t = f * cc.life; c.setTransform(1, 0, 0, 1, 0, 0); try { emCorpse(c, cc); } catch (err){ sb.push(s + ': ' + err.message); } }); });
    out.styleBad = sb;
    for (i2 = 0; i2 < 30; i2++) GR.step(1 / 30);
    out.corpseGone = EM.corpses.length === 0;
    for (i2 = 0; i2 < 40; i2++){ var e3 = mk('hyena', P.x + 100 + i2, P.y); if (e3) damageEnemy(e3, 1e15, { noCrit: true, quiet: true }); }
    out.cap = EM.corpses.length <= EM.cap;
    /* the cache still takes pictures */
    EnemySprite.clear(); G.enemies.length = 0; var cs = mk('jackal', 150, 150); cs._f = 1; cs._va = 0; cs._lag = 0; cs.ph = 0; cs._stt = 0;
    var s0 = EnemySprite.stats.drawn; cs.hitT = 0.1; cs.hitA = 1; for (i2 = 0; i2 < 120; i2++){ cs.anim = i2 * 0.1; c.setTransform(1, 0, 0, 1, 0, 0); drawEnemy(c, cs); }
    out.cacheDrawn = EnemySprite.stats.drawn - s0;
    /* the time: 300 creatures drawn */
    G.enemies.length = 0; var many = []; for (i2 = 0; i2 < 300; i2++){ var m = mk(['hyena', 'jackal', 'cheetah'][i2 % 3], 100 + (i2 % 20) * 8, 100 + Math.floor(i2 / 20) * 8); if (!m) continue; m._f = 1; m._va = 0.2; m._lag = 0.1; m.ph = i2; m._stt = 1; m.anim = i2 * 0.3; many.push(m); }
    for (i2 = 0; i2 < 30; i2++) many.forEach(function(m){ drawEnemy(c, m); });               /* warm the cache */
    var best = 1e9, bestPlain = 1e9, t0;
    for (var rep = 0; rep < 5; rep++){
      t0 = performance.now(); for (i2 = 0; i2 < 10; i2++) many.forEach(function(m){ drawEnemy(c, m); }); best = Math.min(best, (performance.now() - t0) / 10);
      t0 = performance.now(); for (i2 = 0; i2 < 10; i2++) many.forEach(function(m){ em_draw(c, m); }); bestPlain = Math.min(bestPlain, (performance.now() - t0) / 10);
    }
    out.msPerFrame300 = +best.toFixed(2); out.msPerFrame300Plain = +bestPlain.toFixed(2); out.cacheLive = JSON.stringify(EnemySprite.stats.liveBy);
  } catch (err){ out.err = String(err && err.stack || err); }
  out.pass = out.errs.length === 0 && !out.err && out.gaitOk && out.hit && out.hitEnds && out.turn && out.drawBad.length === 0 && out.portraitSame && out.corpse && out.styleBad.length === 0 && out.corpseGone && out.cap && out.cacheDrawn >= 10 && out.msPerFrame300 - out.msPerFrame300Plain < 8;
  QA.done(out);
})();
