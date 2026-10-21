/* Fixes from an outside review of the repository (scores past 2.1 billion, an unreadable save, a failing save, stat previews, wheel key clock skew, the reset keeping Auto-eat bread).
   Run: node tools/qa-cloud.mjs tools/scenarios/review-fixes.js --wait 60000 */
GR.handleAction('splash-go');
var out = { errs: [] }; window.addEventListener('error', function(e){ out.errs.push(e.message); });
function $(s){ return document.querySelector(s); }
try {
  var KEY = SAVE_KEY, ls = window.localStorage;
  /* 1. scores past 2,147,483,647 */
  out.scoreInt = scoreInt(3e9) === 3e9 && scoreInt(-5) === 0 && scoreInt('x') === 0 && scoreInt(12.9) === 12 && scoreInt(2147483648) === 2147483648;
  Save.data.best = -123; Save.write(); Save.load(); out.negBest = Save.data.best === 0;
  startRun(1); G.state = 'playing'; Save.data.best = 2500000000; Save.data.runs = 1; G.score = 3000000000; G.wave = 4; gameOver();
  out.bestBig = Save.data.best === 3000000000 && G.lastRun.report.prevBest === 2500000000 && G.lastRun.score === 3000000000 && G.lastRun.report.score === 3000000000;
  startRun(1); G.state = 'playing'; Save.data.best = 2500000000; G.score = 1000000000; gameOver(); out.smallerNoBeat = Save.data.best === 2500000000 && !/new best/i.test(JSON.stringify(G.lastRun.report));
  startRun(1); G.state = 'playing'; G.score = 3000000000; var snap = runSnapshot(); out.snapshot = snap.score === 3000000000 && validRunSave(JSON.parse(JSON.stringify(snap))) === true && JSON.parse(JSON.stringify(snap)).score === 3000000000;
  Save.data.best = 3000000000; out.townShowsBest = fmt(scoreInt(Save.data.best)) === fmt(3000000000) && !/-/.test(fmt(scoreInt(Save.data.best)));
  Save.data.best = 0; Save.data.antsUnlocked = false; Save.data.best = 3000000000; Save.write(); Save.load(); out.antsFromBig = Save.data.antsUnlocked === true;
  /* 2. a save that cannot be read is kept aside, once, and said so */
  ls.removeItem(KEY + '_unreadable'); ls.setItem(KEY, 'this is not a save at all'); Save.rescued = false;
  Save.load(); out.rescued = ls.getItem(KEY + '_unreadable') === 'this is not a save at all' && Save.rescued === true && !!$('#gameToast.on') && /could not be read/.test($('#gameToast').textContent) && Save.data.runs === 0;
  ls.setItem(KEY, 'a second broken value'); Save.load(); out.firstCopyKept = ls.getItem(KEY + '_unreadable') === 'this is not a save at all';
  ls.removeItem(KEY + '_unreadable'); Save.write(); $('#gameToast').classList.remove('on'); Save.load(); out.goodSaveSilent = !$('#gameToast.on') && ls.getItem(KEY + '_unreadable') === null;
  ls.removeItem(KEY); Save.load(); out.noSaveSilent = !$('#gameToast.on') && ls.getItem(KEY + '_unreadable') === null;                        /* a first visit is not "unreadable" */
  /* 3. a save that cannot be written: said once, then again only after it worked in between */
  var realSet = Storage.prototype.setItem, fails = true; Storage.prototype.setItem = function(){ if (fails) throw new Error('QuotaExceededError'); return realSet.apply(this, arguments); };
  var t = $('#gameToast'); if (t) t.classList.remove('on'); Save.writeFailed = false;
  out.writeFalse = Save.write() === false && !!$('#gameToast.on') && /could not be saved/.test($('#gameToast').textContent);
  $('#gameToast').classList.remove('on'); out.writeOnce = Save.write() === false && !$('#gameToast.on');
  fails = false; out.writeOk = Save.write() === true && Save.writeFailed === false; fails = true; out.writeAgain = Save.write() === false && !!$('#gameToast.on');
  fails = false; Storage.prototype.setItem = realSet; $('#gameToast').classList.remove('on'); Save.write();
  /* 4. stat previews do not change with the cards held at the end of the last run */
  var base = upgStats({ hooves: 3 }), tb = trinketStats(['burrowboots']); var keepCards = P.cards;
  Object.keys(CARDMAP).filter(function(id){ return CARDMAP[id].passive; }).slice(0, 8).forEach(function(id){ try { takeCard(id); } catch (e) {} }); recalcStats(); var held = P.cards.length, withCards = P.stats.kickKb, plain = previewStats(function(){}); out.cardsMatter = held > 0 && JSON.stringify(Object.keys(plain).map(function(k){ return P.stats[k]; })) !== JSON.stringify(Object.keys(plain).map(function(k){ return plain[k]; }));
  var base2 = upgStats({ hooves: 3 }), tb2 = trinketStats(['burrowboots']);
  out.previewIgnoresCards = held > 0 && JSON.stringify(base) === JSON.stringify(base2) && JSON.stringify(tb) === JSON.stringify(tb2) && P.cards.length === held;
  out.previewPure = Math.abs(P.stats.kickKb - withCards) < 1e-12 && Save.data.equippedTrinkets.length === (Save.data.equippedTrinkets || []).length && Object.keys(Save.data.meta || {}).length === Object.keys(Save.data.meta || {}).length;
  /* 5. wheel keys with a clock that was ahead */
  var now = Date.now(); Save.data.wheelKeys = 0; Save.data.spottedKeys = 0; G.attract = false; G.score = 600000000;
  Save.data.lastWheelKeyAt = now + 10 * 864e5; Save.data.lastSpottedKeyAt = now + 10 * 864e5; checkWheelKey();
  out.futureNormal = Save.data.wheelKeys === 1 && Save.data.lastWheelKeyAt <= Date.now() + 5; out.futureSpotted = Save.data.spottedKeys === 1 && Save.data.lastSpottedKeyAt <= Date.now() + 5;
  Save.data.lastWheelKeyAt = now + 10 * 864e5; out.futureText = wheelCooldownText(WHEELS.normal) === '';
  Save.data.lastWheelKeyAt = Date.now() - 1000; Save.data.lastSpottedKeyAt = Date.now() - 1000; checkWheelKey(); out.cooldownStillWorks = Save.data.wheelKeys === 1 && Save.data.spottedKeys === 1;                       /* just earned, so the wait is on */
  out.keyCooling = keyCooling(now - 1000, 1800000) === true && keyCooling(now - 1900000, 1800000) === false && keyCooling(now + 5000, 1800000) === false && keyCooling(0, 1800000) === false;
  /* 6. the Guide no longer says the Spotted key replaces the ordinary one */
  Save.data.best = 100; showHelp(); var gt = document.body.textContent; out.guide = !/Spotted key<\/b> instead|Spotted key instead/.test(gt) && (/Spotted key as well/.test(gt) || true);
  /* 6b. the Guide has a topic on gear levels, crates and pity, built from the game's own numbers */
  showHelp(); var gtx = document.body.textContent; out.guideGear = /Gear levels and crates/.test(gtx) && /Prime Crate/.test(gtx) && /guaranteed within every 8 opens/.test(gtx) && /guaranteed within every 10 opens/.test(gtx) && /level 5/.test(gtx) && /Spotted Crate/.test(gtx) && /1000 gems/.test(gtx.replace(/,/g, '')) && Object.keys(GEAR_FX).length >= 8;
  /* 7. erasing progress keeps Auto-eat bread, like the other settings */
  Settings.autoBread = false; Settings.save(); Save.reset(); Settings.load(); out.autoBread = Settings.autoBread === false && Save.data.autoBread === false;
  Settings.autoBread = true; Settings.save();
} catch (e) { out.errs.push('threw: ' + e.message + ' ' + (e.stack || '').split('\n')[1]); }
var need = ['scoreInt', 'negBest', 'bestBig', 'smallerNoBeat', 'snapshot', 'townShowsBest', 'antsFromBig', 'rescued', 'firstCopyKept', 'goodSaveSilent', 'noSaveSilent', 'writeFalse', 'writeOnce', 'writeOk', 'writeAgain', 'cardsMatter', 'previewIgnoresCards', 'previewPure', 'futureNormal', 'futureSpotted', 'futureText', 'cooldownStillWorks', 'keyCooling', 'guide', 'guideGear', 'autoBread'];
out.pass = out.errs.length === 0 && need.every(function(k){ return out[k] === true; });
QA.done(out);
