/* The phone pass (css/phone.css, the chapter title in js/render/36-atmosphere.js). Run as a phone: node tools/qa-cloud.mjs tools/scenarios/phone-pass.js --touch --w 390 --h 844 --wait 90000 [--shot x.png --params "screen=upgrades|bestiary|settings|wardrobe|photo|fusion|wheel|ants"]; add --h 390 --w 844 for the landscape checks (they are skipped in portrait). */
GR.handleAction('splash-go');
var out = { errs: [] }; window.addEventListener('error', function(e){ out.errs.push(e.message); });
function px(sel, prop){ var el = document.querySelector(sel); return el ? parseFloat(getComputedStyle(el)[prop]) : NaN; }
function all(sel){ return [].slice.call(document.querySelectorAll(sel)); }
function noSideScroll(){ return document.documentElement.scrollWidth <= innerWidth + 1; }
try {
  var screen = (QA.params && QA.params.screen) || '', land = innerWidth > innerHeight;
  out.coarse = matchMedia('(pointer:coarse)').matches; out.vw = innerWidth;
  ['debug-unlockall', 'debug-venus', 'debug-mars', 'debug-city', 'debug-lab', 'debug-ants', 'debug-combos', 'debug-mini-own', 'debug-bestiary'].forEach(function(a){ try { GR.handleAction(a); } catch (e) {} });
  Save.data.gold = 5e7; Save.data.gems = 9000; Save.data.food = 30; Save.data.wheelKeys = 3; Save.data.spottedKeys = 12; Save.data.antsUnlocked = true; Save.data.ants = { soldier: 5, distractor: 3, shooter: 6 };
  var screens = { settings: function(){ showSettings(); }, upgrades: function(){ showShop('upgrades'); }, gear: function(){ showShop('gear'); }, ants: function(){ showShop('ants'); }, wheel: function(){ showShop('wheel'); },
    bestiary: function(){ showBestiary(); }, fusion: function(){ showFusionMachine(); }, wardrobe: function(){ showWardrobe(); }, photo: function(){ showPhoto(); }, menu: function(){ showMenu(); } };
  out.noSideScroll = Object.keys(screens).every(function(k){ screens[k](); return noSideScroll(); });
  /* finger-sized controls (needs --touch) */
  screens.settings(); out.sliders = all('input[type=range]').length > 0 && all('input[type=range]').every(function(e){ return e.getBoundingClientRect().height >= 34; });
  screens.wardrobe(); out.swatches = all('.swatch:not(.pat)').filter(function(e){ return !e.closest('.dots'); }).every(function(e){ return e.getBoundingClientRect().width >= 38; });
  screens.photo(); out.chips = all('.pchip').length > 5 && all('.pchip').every(function(e){ return e.getBoundingClientRect().height >= 38; });
  screens.upgrades(); out.upChips = all('.upchip').length > 3 && all('.upchip').every(function(e){ return e.getBoundingClientRect().height >= 38; }) && all('.upbtns .btn').every(function(e){ return e.getBoundingClientRect().height >= 38; });
  screens.gear(); out.gview = all('.gview-b').every(function(e){ return e.getBoundingClientRect().height >= 38; });
  /* nothing under 11px in the places that had it */
  function floor11(sel){ var l = all(sel); return l.length === 0 || l.every(function(e){ return parseFloat(getComputedStyle(e).fontSize) >= 10.99; }); }
  screens.gear(); out.gearText = floor11('.gsn small, .gtr small, .gp small');
  screens.ants(); out.antsText = floor11('.afbtns .btn small, .arbtns .btn small, .afforage .btn small, .afs small');
  screens.wheel(); out.wheelText = floor11('.wbtns .btn small, .upbtns .btn small, .uptop .btn small');
  startRun(1); for (var i = 0; i < 20; i++) GR.step(1 / 60); out.hudText = floor11('.bar span');
  /* upgrades (rebuilt in 41e): the Buy, Buy 5 and Max buttons of a row share one line */
  screens.upgrades(); var ub = all('.upbtns')[0], ubs = ub ? [].slice.call(ub.querySelectorAll('.btn')) : [];
  out.buyRow = ubs.length >= 2 && ubs.every(function(b){ return Math.abs(b.getBoundingClientRect().top - ubs[0].getBoundingClientRect().top) < 3; });
  /* fusion rows are unchanged: the Choose button stays beside the name */
  screens.fusion(); var row = document.querySelector('.shoprow'), nm = row && row.querySelector('.nm'), ch = row && row.querySelector('.btn');
  out.fusionRow = !!ch && !!nm && Math.abs(ch.getBoundingClientRect().top - nm.getBoundingClientRect().top) < 40;
  /* bestiary: three to a row on a phone */
  screens.bestiary(); var gc = getComputedStyle(document.querySelector('.bst-grid')).gridTemplateColumns.split(' ').length; out.bestiary3 = innerWidth > 520 || gc === 3;
  /* the chapter title never runs off a narrow screen: a long name shrinks, a long line splits in two */
  var cv = document.createElement('canvas'); cv.width = innerWidth; cv.height = innerHeight; var c = cv.getContext('2d'), widest = 0, drawn = 0, ft = c.fillText.bind(c), st = c.strokeText.bind(c);
  c.fillText = function(t, x, y){ drawn++; widest = Math.max(widest, c.measureText(t).width); return ft(t, x, y); };
  var keepFX = G.introFX, keepW = G.W, keepH = G.H; G.W = innerWidth; G.H = innerHeight;
  G.introFX = { t: 2, dur: 4, ch: 12, name: 'The Underground Giraffe City', desc: 'Something has been digging under the savanna for a very long time and it is finally ready to show you.', accent: '#F2B33D' };
  drawIntroFX(c); out.titleFits = drawn >= 3 && widest <= innerWidth - 8; out.titleW = Math.round(widest); G.introFX = keepFX; G.W = keepW; G.H = keepH;
  /* in a run: the bread, corn, fish and crab buttons, Call the next wave, KICK, SLOW, ROVER, pause and the health bars share the screen, whichever side the joystick is on: no two may overlap */
  (function(){
    ['debug-unlockall', 'debug-ants'].forEach(function(a){ try { GR.handleAction(a); } catch (e) {} });
    townData().n.loaves = 5; Save.data.antsUnlocked = true; var bid = Object.keys(BOAT_BY_ID)[0]; seaData().own = {}; seaData().own[bid] = 1; seaData().sel = bid; seaData().fish = 4; seaData().crab = 3; farmData().corn = 3;
    startRun(1); G.state = 'playing'; Input.hasTouch = true; var realCan = canCallNextWave; canCallNextWave = function(){ return true; };
    ['slowbtn', 'roverbtn'].forEach(function(id){ document.getElementById(id).classList.add('on'); });
    var ids = ['kickbtn', 'slowbtn', 'roverbtn', 'pausebtn', 'breadBtn', 'cornBtn', 'fishBtn', 'crabBtn', 'nextWaveBtn', 'bars', 'loadout'], allHits = [], shown = 0;
    [false, true].forEach(function(left){
      Settings.touchLeft = left; applyTouchLayout(); for (var i = 0; i < 4; i++){ GR.step(1 / 30); try { Feedback.tick(0.1); } catch (e) {} }
      var R = {}; ids.forEach(function(id){ var e = document.getElementById(id); if (!e) return; var cs = getComputedStyle(e), r = e.getBoundingClientRect(); if (cs.display !== 'none' && cs.visibility !== 'hidden' && +cs.opacity > 0.05 && r.width > 0 && r.height > 0) R[id] = r; });
      shown = Math.max(shown, Object.keys(R).length);
      for (var a = 0; a < ids.length; a++) for (var b = a + 1; b < ids.length; b++){ var p = R[ids[a]], q = R[ids[b]]; if (p && q && p.left < q.right - 1 && q.left < p.right - 1 && p.top < q.bottom - 1 && q.top < p.bottom - 1) allHits.push((left ? 'lefty ' : 'righty ') + ids[a] + '/' + ids[b]); }
      /* nothing runs off the screen either */
      Object.keys(R).forEach(function(id){ var r = R[id]; if (r.left < -1 || r.top < -1 || r.right > innerWidth + 1 || r.bottom > innerHeight + 1) allHits.push((left ? 'lefty ' : 'righty ') + id + ' off screen'); });
    });
    canCallNextWave = realCan; Settings.touchLeft = false; applyTouchLayout(); out.runHud = allHits.length === 0 && shown >= 8; out.runHudHits = allHits.join(', ');
  })();
  /* in town: the Journal, Map and Menu buttons (and Car, with a car) are finger sized, stay on the screen and do not overlap each other or the "Tap: ..." prompt */
  (function(){
    var hits = [], realCar = townCarOwned, shown = 0; Input.hasTouch = true; townCarOwned = function(){ return true; };
    [false, true].forEach(function(withPrompt){
      G.state = 'menu'; townEnter('square'); Town.bannerT = 0; Town.near = null; for (var i = 0; i < 6; i++) GR.step(1 / 30);
      if (withPrompt){ Town.near = { label: 'Make a wish' }; GR.step(1 / 60); Town.near = { label: 'Make a wish' }; render(); }
      var B = Town.ui.btns.slice(), P2 = withPrompt ? Town.ui.prompt : null; shown = Math.max(shown, B.length);
      B.forEach(function(b){ if (b.w < 38 || b.h < 38) hits.push(b.id + ' too small ' + Math.round(b.w) + 'x' + Math.round(b.h)); if (b.x < 0 || b.y < 0 || b.x + b.w > innerWidth || b.y + b.h > innerHeight) hits.push(b.id + ' off screen'); });
      for (var a = 0; a < B.length; a++) for (var c = a + 1; c < B.length; c++){ var p = B[a], q = B[c]; if (p.x < q.x + q.w - 1 && q.x < p.x + p.w - 1 && p.y < q.y + q.h - 1 && q.y < p.y + p.h - 1) hits.push(p.id + ' overlaps ' + q.id); }
      if (P2){ if (P2.h < 38) hits.push('prompt too short'); if (P2.x < 0 || P2.x + P2.w > innerWidth) hits.push('prompt off screen'); B.forEach(function(b){ if (P2.x < b.x + b.w && b.x < P2.x + P2.w && P2.y < b.y + b.h && b.y < P2.y + P2.h) hits.push('prompt overlaps ' + b.id); }); }
    });
    townCarOwned = realCar; G.state = 'menu'; Town.on = false; out.townHud = hits.length === 0 && shown >= 4; out.townHudHits = hits.join(', ');
  })();
  /* at sea: a finger held on the screen steers and the boat moves (js/core/43-input.js has to treat 'sail' like the town), and it does not drift back to the dock by itself */
  (function(){
    var sd = seaData(), realSel = sd.sel, st = document.getElementById('stage'), rc = st.getBoundingClientRect();
    function touch(type, x, y){
      var t = new Touch({ identifier: 7, target: st, clientX: rc.left + x, clientY: rc.top + y });
      st.dispatchEvent(new TouchEvent(type, { changedTouches: type === 'touchend' ? [t] : [t], touches: type === 'touchend' ? [] : [t], bubbles: true, cancelable: true }));
    }
    sd.sel = 'skiff'; G.state = 'menu'; Input.hasTouch = true; seaStart('harbour');
    var x0 = Sea.x, y0 = Sea.y, down;
    touch('touchstart', G.W * 0.85, G.H * 0.5); down = Input.mdown === true;
    for (var i = 0; i < 240; i++) GR.step(1 / 30);
    var moved = Math.hypot(Sea.x - x0, Sea.y - y0), still = G.state === 'sail' && Sea.on;
    touch('touchend', G.W * 0.85, G.H * 0.5);
    out.sail = down && Input.mdown === false && moved > 60 && still; out.sailInfo = 'down ' + down + ' moved ' + Math.round(moved) + ' state ' + G.state;
    Sea.on = false; G.state = 'menu'; sd.sel = realSel;
  })();
  /* landscape: the wheel cards are one line each and the wheel is on the first screen */
  if (land){ screens.wheel(); var cd = document.querySelector('.wpick .wcard'); out.landCards = cd.getBoundingClientRect().height < 60; out.landWheel = document.querySelector('.wwheel').getBoundingClientRect().top < innerHeight * 0.8; }
  if (screen && screens[screen]){ G.state = 'shop'; screens[screen](); }
} catch (e) { out.errs.push('threw: ' + e.message + ' ' + (e.stack || '').split('\n')[1]); }
var need = ['noSideScroll', 'sliders', 'swatches', 'chips', 'upChips', 'gview', 'gearText', 'antsText', 'wheelText', 'hudText', 'buyRow', 'fusionRow', 'bestiary3', 'titleFits', 'runHud', 'townHud', 'sail'];
if (innerWidth > innerHeight) need = need.concat(['landCards', 'landWheel']);
out.pass = out.errs.length === 0 && out.coarse === true && need.every(function(k){ return out[k] === true; });
QA.done(out);
