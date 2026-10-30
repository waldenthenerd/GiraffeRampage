/* camp: the idle Camp (js/game/44zzzo-camp.js, js/ui/44zzzp-camp-page.js). Locked until Chapter 2; stores gold and crate progress at a fixed rate up to a cap; a clock
   set backwards earns nothing; Collect; two gem upgrades opened by chapters; Camp Crates (a Prime Crate's odds and pity, a small chance of the Camp Hearth); saves and old saves; the tab.
   Run: node tools/qa-cloud.mjs tools/scenarios/camp.js --wait 60000 [--shot x.png --w 1280 --h 720 --params "view=page|full|menu|reveal"] */
(function(){
  var out = { errs: [] }; window.addEventListener('error', function(e){ out.errs.push(e.message + ' @' + (e.filename || '').split('/').pop() + ':' + e.lineno); });
  GR.handleAction('splash-go'); Ach.check = function(){ return []; };
  var H = 3600000;
  function fresh(){ Save.reset(); Save.data.chapter2Complete = true; Save.data.best = 1000000; }
  try {
    /* locked until Chapter 2 */
    Save.reset(); out.locked = !campUnlocked() && campHours() === 0 && Save.data.campLast === 0;
    showShop('upgrades'); out.noTab = !document.querySelector('[data-a="tab-camp"]');
    fresh(); out.open = campUnlocked(); showShop('upgrades'); out.tab = !!document.querySelector('[data-a="tab-camp"]');
    out.starts = campStart() && Save.data.campLast > 0 && campHours() < 0.01;

    /* the rate: 0.04% of the best score an hour, never under 60, +30% a level */
    out.rate = campBaseGold() === 400 && campGoldPerHour() === 400;
    Save.data.best = 10; out.minRate = campBaseGold() === 60; Save.data.best = 1000000;
    Save.data.campRate = 2; out.rateLv = campGoldPerHour() === 640; Save.data.campRate = 0;

    /* an hour stored, then the cap (3 hours) and a bigger larder */
    var now = Date.now(); Save.data.campLast = now - 1 * H;
    out.oneHour = Math.abs(campHours(now) - 1) < 1e-6 && campPending(now).gold === 400;
    Save.data.campLast = now - 10 * H; out.cap3 = campHours(now) === 3 && campFull(now);
    Save.data.campCap = 2; out.cap6 = campHours(now) === 6; Save.data.campCap = 0;

    /* a clock that went backwards earns nothing and is pulled back to now */
    Save.data.campLast = now + 5 * H; out.back = campHours(now) === 0 && Save.data.campLast === now;

    /* collect: gold in, crate progress kept, the clock restarted, nothing to take a moment later */
    Save.data.campLast = now - 3 * H; Save.data.campProg = 0; var g0 = Save.data.gold, r1 = campCollect(now);
    out.collect = !!r1 && Save.data.gold === g0 + 1200 && r1.crates === 0 && Math.abs(Save.data.campProg - 0.75) < 1e-9 && Save.data.campLast === now;
    out.again = campCollect(now) === null;
    Save.data.campLast = now - 3 * H; var r2 = campCollect(now);
    out.crateMade = r2.crates === 1 && Save.data.campCrates === 1 && Math.abs(Save.data.campProg - 0.5) < 1e-9;
    Save.data.campRate = 5; Save.data.campLast = now - 3 * H; Save.data.campProg = 0; out.fastCrates = campPending(now).crates === 1 && campPending(now).gold === 3000; Save.data.campRate = 0;

    /* the upgrades: gems, and a chapter for each level; what is stored stays stored */
    fresh(); campStart(); Save.data.gems = 5000;
    out.upLocked = !campBuy('rate') && campUpNext('rate').open === false && Save.data.gems === 5000;
    Save.data.chapter3Complete = true; Save.data.campLast = Date.now() - 2 * H; var gm0 = Save.data.gems;
    out.upBuy = campBuy('rate') && Save.data.campRate === 1 && Save.data.gems === gm0 - 120 && Math.abs(campHours() - 2) < 0.01;
    out.upNext = campUpNext('rate').cost === 240 && campUpNext('rate').need === 5 && !campUpNext('rate').open;
    Save.data.gems = 10; Save.data.chapter4Complete = true; out.upPoor = !campBuy('cap') && Save.data.campCap === 0;
    Save.data.gems = 100000; for (var c = 5; c <= 12; c++) Save.data['chapter' + c + 'Complete'] = true;
    var spent0 = Save.data.gems; while (campBuy('rate')); while (campBuy('cap'));
    out.upMax = Save.data.campRate === 5 && Save.data.campCap === 5 && campCapHours() === 12 && campUpNext('rate').maxed && spent0 - Save.data.gems === 2 * (120 + 240 + 360 + 600 + 900) - 120 * 1;
    out.upTriple = CAMP_UP.rate.gems.join() === '120,240,360,600,900' && CAMP_UP.cap.ch.join() === '4,6,8,10,12' && CAMP_UP.rate.ch.join() === '3,5,7,9,11';

    /* Camp Crates: opened from the store, a Prime Crate's odds and pity, the Camp Hearth by chance */
    fresh(); campStart(); Save.data.campCrates = 3; var gems0 = Save.data.gems, opened0 = Save.data.cratesOpened | 0;
    var one = campOpen(1);
    out.openOne = one && one.length === 1 && !!one[0].piece && Save.data.campCrates === 2 && Save.data.gems === gems0 && (Save.data.cratesOpened | 0) === opened0 + 1 && Save.data.campOpened === 1;
    out.odds = JSON.stringify(CRATES.camp.weights) === JSON.stringify(CRATES.rare.weights) && CRATE_PITY.camp.every === CRATE_PITY.rare.every && CRATE_PITY.camp.floor === 'epic';
    var all = campOpen(10); out.openAll = all.length === 2 && Save.data.campCrates === 0 && campOpen(1) === null;
    Save.data.campCrates = 8; Save.data.cratePity = { camp: 7 }; var pit = campOpen(1)[0]; out.pity = RARITY_ORDER[pit.rarity] >= RARITY_ORDER.epic;
    var rnd = Math.random; Math.random = function(){ return 0.001; }; Save.data.campCrates = 1; var tr = campOpen(1)[0]; Math.random = rnd;
    out.hearthDrop = tr.trinket === true && trinketOwned('campfire');
    Math.random = function(){ return 0.001; }; Save.data.campCrates = 1; var tr2 = campOpen(1)[0]; Math.random = rnd; out.hearthOnce = tr2.trinket === false;
    var hits = 0; Math.random = function(){ return 0.5; }; Save.data.campCrates = 5; Save.data.gear = {}; campOpen(5).forEach(function(x){ if (x.trinket) hits++; }); Math.random = rnd; out.hearthRare = hits === 0;

    /* the Camp Hearth: an hour more, 10% faster, regeneration and experience */
    fresh(); grantTrinket('campfire'); var st0 = trinketStats([]), st1 = trinketStats(['campfire']);
    out.hearthStats = Math.abs(st1.regen - st0.regen - 1.2) < 1e-9 && Math.abs(st1.xpMul - st0.xpMul - 0.06) < 1e-9;
    toggleTrinket('campfire'); out.hearthCamp = campCapHours() === 4 && Math.abs(campRateMul() - 1.1) < 1e-9; toggleTrinket('campfire');
    out.hearthOff = campCapHours() === 3 && campRateMul() === 1;

    /* saves: the new fields default, junk is mended, an old save loads */
    fresh(); Save.data.campLast = 'x'; Save.data.campRate = 99; Save.data.campCap = -4; Save.data.campProg = 7; Save.data.campCrates = -2; Save.write(); Save.load();
    out.sane = Save.data.campLast === 0 && Save.data.campRate === 5 && Save.data.campCap === 0 && Save.data.campProg < 1 && Save.data.campCrates === 0;
    out.defaults = DEFAULT_SAVE.campLast === 0 && DEFAULT_SAVE.campRate === 0 && DEFAULT_SAVE.campCrates === 0;
    fresh(); ['campLast', 'campRate', 'campCap', 'campProg', 'campCrates', 'campOpened'].forEach(function(k){ delete Save.data[k]; }); Save.write(); Save.load();
    out.oldSave = Save.data.campLast === 0 && Save.data.campRate === 0 && Save.data.campCrates === 0 && campHours() < 0.01;

    /* the page: scene, store, crates and both upgrades; Collect, Open and Buy through the real actions */
    fresh(); Save.data.gems = 1000; Save.data.chapter3Complete = true; campStart(); Save.data.campLast = Date.now() - 2.5 * H; Save.data.campCrates = 6; Save.data.campProg = 0.4;
    var V = QA.params.view || '';
    GR.handleAction('tab-camp');
    out.shop = shopTab === 'camp' && !!document.querySelector('.camppg .campscene') && /Camp Crates in store: 6/.test(document.querySelector('.campcrates').textContent) && document.querySelectorAll('[data-camp]').length === 2;
    out.collectBtn = !document.getElementById('campCollect').disabled && /2h 30m/.test(document.getElementById('campHrs').textContent);
    campTick(); out.tick = /1,000|1000/.test(document.getElementById('campGold').textContent);
    var gold0 = Save.data.gold; GR.handleAction('camp-collect'); out.pageCollect = Save.data.gold >= gold0 + 1000 && /Collected 2h 30m/.test(document.querySelector('.campnote').textContent) && document.getElementById('campCollect').disabled;
    var crates0 = Save.data.campCrates; GR.handleAction('camp-open-1'); out.pageOpen = Save.data.campCrates === crates0 - 1 && !!document.getElementById('crateReveal');
    GR.handleAction('gear-reveal-close'); GR.handleAction('gear-reveal-close'); out.revealClosed = !document.getElementById('crateReveal') && shopTab === 'camp';
    GR.handleAction('camp-open-5'); out.pageMany = Save.data.campCrates === crates0 - 6 && !!document.querySelector('#crateReveal .crgrid'); GR.handleAction('gear-reveal-close'); GR.handleAction('gear-reveal-close');
    var gm1 = Save.data.gems; GR.handleAction('camp-buy-rate'); out.pageBuy = Save.data.campRate === 1 && Save.data.gems === gm1 - 120 && /Level 1 \/ 5/.test(document.querySelector('[data-camp="rate"]').textContent);
    out.lockedRow = /Finish Chapter 4/.test(document.querySelector('[data-camp="cap"]').textContent);
    GR.handleAction('tab-gear'); campTick(); out.timerStops = campPage.timer === 0;
    /* the menu line and the tab's dot */
    Save.data.campLast = Date.now() - 2 * H; out.menuNote = /Camp: 2h 00m stored/.test(campMenuNote()) && campTabDot().indexOf('updot') > 0;
    Save.data.campLast = Date.now(); Save.data.campCrates = 0; out.menuQuiet = campMenuNote() === '' && campTabDot() === '';

    /* the animated scene: every moment of the thirty-second round (and the bow round after it) draws without error, and she is where the timeline says */
    var sc = document.createElement('canvas'); sc.width = CAMP_SCENE.W; sc.height = CAMP_SCENE.H; var sx = sc.getContext('2d'), bad = 0;
    for (var tt = 0; tt < 60; tt += 0.25){ try { campSceneDraw(sx, tt, 0.5); } catch (e3){ bad++; out.sceneErr = e3.message; } }
    out.scene = bad === 0 && campSceneAt(4).mode === 'chop' && campSceneAt(9).mode === 'walk' && campSceneAt(14).mode === 'sit' && campSceneAt(22).mode === 'fight' && campSceneAt(30).mode === 'chop' && Math.abs(campSceneAt(30).x - 100) < 1;
    out.sceneLoop = (function(){ var ok = true; for (var u = 0; u < 30; u += 0.5){ var a0 = campSceneAt(u).x, a1 = campSceneAt(u + 0.5).x; if (Math.abs(a1 - a0) > 70) ok = false; } return ok; })();
    var px0 = sx.getImageData(0, 0, 1, 1).data[3]; out.sceneDrawn = px0 === 255;
    /* the pictures */
    if (V === 'page' || V === 'full' || V === 'reveal' || V === 'menu'){
      fresh(); Save.data.gems = 1500; Save.data.chapter3Complete = true; Save.data.chapter4Complete = true; Save.data.campRate = 1; campStart();
      Save.data.campLast = Date.now() - (V === 'full' ? 20 : 2.4) * H; Save.data.campCrates = 4; Save.data.campProg = 0.6; campPage.note = '';
      if (V === 'menu'){ showMenu(); }
      else { GR.handleAction('tab-camp'); if (QA.params.ct){ CAMP_SCENE.fixT = +QA.params.ct; campSceneFrame(0); } if (V === 'reveal'){ GR.handleAction('camp-open-5'); for (var i = 0; i < 30; i++) GR.step(1 / 30); } }
      out.view = V;
    }
  } catch (e) { out.err = String(e && e.stack || e); }
  var need = ['locked', 'noTab', 'open', 'tab', 'starts', 'rate', 'minRate', 'rateLv', 'oneHour', 'cap3', 'cap6', 'back', 'collect', 'again', 'crateMade', 'fastCrates', 'upLocked', 'upBuy', 'upNext', 'upPoor', 'upMax', 'upTriple',
    'openOne', 'odds', 'openAll', 'pity', 'hearthDrop', 'hearthOnce', 'hearthRare', 'hearthStats', 'hearthCamp', 'hearthOff', 'sane', 'defaults', 'oldSave', 'shop', 'collectBtn', 'tick', 'pageCollect', 'pageOpen', 'revealClosed', 'pageMany',
    'pageBuy', 'lockedRow', 'timerStops', 'menuNote', 'menuQuiet', 'scene', 'sceneLoop', 'sceneDrawn'];
  out.failed = need.filter(function(k){ return out[k] !== true; });
  out.pass = out.errs.length === 0 && !out.err && out.failed.length === 0;
  QA.done(out);
})()
