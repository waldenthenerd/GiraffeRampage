/* The prize wheels and the Spotted wheel (js/41c-wheel-page.js). Run: node tools/qa-cloud.mjs tools/scenarios/wheel-spotted.js --wait 60000 [--shot x.png --w 390 --h 844 --scale 2 --params "view=normal|spotted|batch|new|nokeys"] */
GR.handleAction('splash-go');
var out = { errs: [] }; window.addEventListener('error', function(e){ out.errs.push(e.message); });
try {
  var view = (QA.params && QA.params.view) || 'none';
  Save.data.gold = 0; Save.data.gems = 0; Save.data.food = 0; Save.data.gear = Save.data.gear || {}; Save.data.wheelKeys = 0; Save.data.spottedKeys = 0;
  /* 1. the Spotted wheel's odds: add up to 100, 20% Red Rampage, 3% the Spotted Paw */
  var sum = SPOTTED_SEGMENTS.reduce(function(a, s){ return a + s.weight; }, 0), seg = function(id){ return SPOTTED_SEGMENTS.filter(function(s){ return s.id === id; })[0]; };
  out.odds = sum === 100 && seg('redrampage').weight === 20 && seg('spottedpaw').weight === 3 && WHEEL_SEGMENTS.reduce(function(a, s){ return a + s.weight; }, 0) === 100;
  /* a million-roll count lands near the odds */
  var cnt = {}, N = 200000; for (var i = 0; i < N; i++){ var s = wheelRoll(WHEELS.spotted); cnt[s.id] = (cnt[s.id] || 0) + 1; }
  out.counted = Math.abs(cnt.redrampage / N - 0.20) < 0.01 && Math.abs(cnt.spottedpaw / N - 0.03) < 0.005;
  /* 2. the key: 10x the score, its own cooldown, the normal key unchanged */
  out.score = SPOTTED_KEY_SCORE === WHEEL_SCORE_THRESHOLD * 10 && SPOTTED_KEY_SCORE === 500000000;
  G.attract = false; Save.data.lastWheelKeyAt = 0; Save.data.lastSpottedKeyAt = 0;
  G.score = 60000000; checkWheelKey(); out.lowScore = (Save.data.wheelKeys | 0) === 1 && (Save.data.spottedKeys | 0) === 0;
  G.score = 500000000; Save.data.lastWheelKeyAt = Date.now(); checkWheelKey(); out.bigScore = (Save.data.spottedKeys | 0) === 1 && (Save.data.wheelKeys | 0) === 1;
  checkWheelKey(); out.cooldown = (Save.data.spottedKeys | 0) === 1;
  /* 3. spending keys: none = nothing happens; the new trinket pays gold when owned */
  out.noKeys = wheelSpendKeys(WHEELS.spotted, 2) === null && Save.data.spottedKeys === 1;
  var realRandom = Math.random;
  function forceSeg(id){ var L = wheelLayout(WHEELS.spotted), w = 0, t = 0; SPOTTED_SEGMENTS.forEach(function(x){ t += x.weight; }); for (var i = 0; i < L.length; i++){ if (L[i].seg.id === id){ w = (L[i].a0 + L[i].a1) / 2 / 360 * t; break; } } return w / t; }
  Math.random = function(){ return forceSeg('spottedpaw'); };
  var r1 = wheelSpendKeys(WHEELS.spotted, 1); Math.random = realRandom;
  out.paw = !!r1 && r1.length === 1 && r1[0].seg.id === 'spottedpaw' && r1[0].isNew && trinketOwned('spottedpaw') && Save.data.spottedKeys === 0;
  Save.data.spottedKeys = 1; Math.random = function(){ return forceSeg('spottedpaw'); }; var r2 = wheelSpendKeys(WHEELS.spotted, 1); Math.random = realRandom;
  out.pawDupe = r2[0].duplicate && r2[0].gold === 1000000 && Save.data.gold === 1000000;
  /* 4. the trinket really does what it says */
  Save.data.equippedTrinkets = []; recalcStats(); var b = { d: P.stats.allDmgMul, c: P.stats.crit, g: P.stats.goldMul };
  var st = trinketStats(['spottedpaw']); out.pawStats = Math.abs(st.allDmgMul - (b.d + 0.07)) < 1e-9 && Math.abs(st.crit - (b.c + 0.03)) < 1e-9 && Math.abs(st.goldMul - (b.g + 0.10)) < 1e-9;
  var st2 = trinketStats(['goldenossicone']); out.ossStats = Math.abs(st2.maxHpAdd - (P.stats.maxHpAdd + 20)) < 1e-9 && Math.abs(st2.regen - (P.stats.regen + 1)) < 1e-9 && Math.abs(st2.xpMul - (P.stats.xpMul + 0.08)) < 1e-9;
  out.noLune = !SPOTTED_SEGMENTS.some(function(s){ return s.id === 'peacefullune'; }) && !!seg('goldenossicone') && seg('goldenossicone').weight === 12;
  /* 5. Spin 10: ten prizes decided and paid at once, ten keys spent, totals add up */
  Save.data.gold = 0; Save.data.gems = 0; Save.data.food = 0; Save.data.spottedKeys = 12;
  var g0 = Save.data.cratesOpened | 0, list = wheelSpendKeys(WHEELS.spotted, 10);
  var tg = 0, tm = 0, tf = 0; list.forEach(function(r){ tg += r.gold; tm += r.gems; tf += r.food; });
  out.ten = list.length === 10 && Save.data.spottedKeys === 2 && Save.data.gold === tg && Save.data.gems >= tm - 0 && Save.data.food >= tf - 1e-9;
  out.crateOk = list.filter(function(r){ return r.crate; }).length === ((Save.data.cratesOpened | 0) - g0);
  /* 6. the crate prize costs nothing: gems and food end where the prizes put them */
  Save.data.gems = 5; Save.data.food = 3; Math.random = function(){ return forceSeg('spotcrate'); }; Save.data.spottedKeys = 1;
  var r3 = wheelSpendKeys(WHEELS.spotted, 1)[0]; Math.random = realRandom;
  out.freeCrate = !!r3.crate && !!r3.crate.piece && Save.data.gems === 5 + r3.gems && Math.abs(Save.data.food - 3) < 1e-9;
  /* 7. the page */
  Save.data.wheelKeys = 7; Save.data.spottedKeys = 12; Save.data.equippedTrinkets = []; delete Save.data.gear['trinket:spottedpaw']; wheelResult = null; wheelPage.id = 'normal'; wheelPage.batch = null; wheelSpinning = false;
  showShop('wheel');
  out.cards = document.querySelectorAll('.wcard').length === 2 && /7/.test(document.querySelector('.wcard').textContent) && /12/.test(document.querySelectorAll('.wcard')[1].textContent);
  out.oldIds = !!document.getElementById('wheelDisc') && !!document.getElementById('wheelSpinBtn') && document.querySelectorAll('#wheelDisc .wic').length === WHEEL_SEGMENTS.length;
  out.rows = document.querySelectorAll('.wprize').length === WHEEL_SEGMENTS.length;
  GR.handleAction('wheel-pick-spotted'); out.pick = wheelPage.id === 'spotted' && document.querySelectorAll('.wprize').length === SPOTTED_SEGMENTS.length && /Spotted Paw/.test(document.querySelector('.wprizes').textContent) && /3%/.test(document.querySelector('.wprizes').textContent);
  out.newBadge = !!document.querySelector('.wpb.new');
  out.buttons = document.querySelectorAll('.wbtns .btn').length === 3 && !document.querySelector('.wbtns .btn:disabled');
  Save.data.spottedKeys = 4; showShop('wheel'); out.tenDisabled = document.querySelectorAll('.wbtns .btn')[2].disabled && document.querySelectorAll('.wbtns .btn')[1].disabled && !document.querySelectorAll('.wbtns .btn')[0].disabled;
  /* 8. spinning from the page: one spin, then five */
  Save.data.spottedKeys = 8; Save.data.gold = 0;
  GR.handleAction('spin-wheel'); out.spinning = wheelSpinning === true && Save.data.spottedKeys === 7 && !!document.getElementById('wheelDisc').style.transition;
  GR.handleAction('spin-wheel'); out.noDouble = Save.data.spottedKeys === 7;
  revealWheelResult(wheelBest(wheelPage.batch || [r3])); out.resultShown = !!document.getElementById('wheelResult') && !wheelSpinning;
  GR.handleAction('wheel-spin-5'); out.five = Save.data.spottedKeys === 2 && wheelSpinning;
  wheelPage.batch = list; revealWheelResult(wheelBest(list)); out.batchShown = /10 spins/.test(document.getElementById('wheelResult').textContent);
  GR.handleAction('tab-wheel'); out.tabClears = !document.getElementById('wheelResult');
  /* 9. the other wheel still works and a plain wheel spin of the old kind is unchanged */
  GR.handleAction('wheel-pick-normal'); Save.data.wheelKeys = 3; var before = Save.data.gold + Save.data.gems; var rn = wheelSpendKeys(WHEELS.normal, 3); out.normalThree = rn.length === 3 && Save.data.wheelKeys === 0;
  var old = spinWheel; out.oldApi = typeof old === 'function' && typeof rollWheelSegment === 'function';
  /* 10. old saves have no Spotted key: it starts at none */
  delete Save.data.spottedKeys; delete Save.data.lastSpottedKeyAt; Save.write(); var back = GRSave.read(); out.oldSave = !back || !back.spottedKeys;
  Save.data.spottedKeys = 0; Save.data.lastSpottedKeyAt = 0;
  /* pictures */
  if (view !== 'none'){
    Save.data.gear = Save.data.gear || {}; wheelSpinning = false;
    if (view === 'nokeys'){ Save.data.wheelKeys = 0; Save.data.spottedKeys = 0; wheelPage.id = 'spotted'; wheelResult = null; }
    else if (view === 'normal'){ Save.data.wheelKeys = 7; Save.data.spottedKeys = 2; wheelPage.id = 'normal'; wheelResult = null; }
    else if (view === 'spotted'){ Save.data.wheelKeys = 2; Save.data.spottedKeys = 14; wheelPage.id = 'spotted'; wheelResult = null; }
    else if (view === 'batch' || view === 'new'){
      Save.data.wheelKeys = 2; Save.data.spottedKeys = 14; wheelPage.id = 'spotted'; delete Save.data.gear['trinket:spottedpaw']; delete Save.data.gear['trinket:redrampage'];
      var rr = wheelSpendKeys(WHEELS.spotted, view === 'batch' ? 10 : 1);
      if (view === 'new'){ Math.random = function(){ return forceSeg('redrampage'); }; delete Save.data.gear['trinket:redrampage']; Save.data.spottedKeys = 5; rr = wheelSpendKeys(WHEELS.spotted, 1); Math.random = realRandom; }
      wheelPage.batch = rr; wheelResult = wheelBest(rr); wheelRotation = 0;
    }
    G.state = 'shop'; shopTab = 'wheel'; showShop('wheel');
  }
} catch (e) { out.errs.push('threw: ' + e.message + ' ' + (e.stack || '').split('\n')[1]); }
out.pass = out.errs.length === 0 && ['odds', 'counted', 'score', 'lowScore', 'bigScore', 'cooldown', 'noKeys', 'paw', 'pawDupe', 'pawStats', 'ossStats', 'noLune', 'ten', 'crateOk', 'freeCrate', 'cards', 'oldIds', 'rows', 'pick', 'newBadge', 'buttons', 'tenDisabled', 'spinning', 'noDouble', 'resultShown', 'five', 'batchShown', 'tabClears', 'normalThree', 'oldApi', 'oldSave'].every(function(k){ return out[k] === true; });
QA.done(out);
