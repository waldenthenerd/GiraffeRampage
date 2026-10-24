/* wheels: skateboards and bicycles (js/44zzx-wheels.js). The shop at the far end of the Park and its room, buying, getting on and off, being faster, going indoors, the small chance of a fall,
   the opinions of the people inside, panels and cars taking her off, the photo studio props (and a photo code that carries them), the Guide topic and the key. */
(function(){
  var out = { errs: [] }; window.addEventListener('error', function(e){ out.errs.push(e.message + ' @' + (e.filename || '').split('/').pop() + ':' + e.lineno); });
  GR.handleAction('splash-go'); Ach.check = function(){ return []; }; Town.fixHour = 13; Town.fixWeather = 'clear';
  function run(n){ for (var i = 0; i < n; i++) GR.step(1 / 30); }
  function mount(){ Town.wheels = null; Town.fall = null; key('KeyV'); return !!Town.wheels; }
  function key(code){ window.dispatchEvent(new KeyboardEvent('keydown', { code: code, bubbles: true, cancelable: true })); }
  var realRandom = Math.random;
  try {
    /* the shop */
    Save.data = JSON.parse(JSON.stringify(DEFAULT_SAVE)); Save.data.town = { n: {}, fish: {}, fishBook: {}, vis: {}, found: {}, bond: {}, err: {}, talk: {}, gift: {}, night: {}, done: {}, daily: { d: '', dig: [], got: [], dot: 0, n: 0 }, tips: {}, last: 'square' };
    TOWN_DIST.park.open = function(){ return true; };
    var shop = TOWN_DIST.park.b.filter(function(b){ return b.id === 'wheels'; })[0], room = TOWN_DIST.in_wheels;
    out.shopBuilding = !!shop && shop.to === 'in_wheels' && TOWN_ROOM_PARENT.in_wheels === 'park' && TOWN_DIST.park.w > shop.x + 200 && room.npcs[0] === 'spoke' && !!TOWN_NPCS.spoke && room.b.filter(function(b){ return b.act === 'wheels'; }).length === 3;
    out.fourThings = RIDES.length === 4 && RIDES.filter(function(w){ return w.kind === 'skate'; }).length === 2 && RIDES.filter(function(w){ return w.kind === 'bike'; }).length === 2;
    out.rawRead = wheelsOwned() === false && Save.data.town.wheels === undefined;
    wheelsToggle(); out.refusedUnowned = !Town.wheels;
    Save.data.gold = 100; out.cannotAfford = wheelsBuy('skate') === false && !wheelsOwned() && Save.data.gold === 100;
    Save.data.gold = 50000; out.buys = wheelsBuy('skate') === true && wheelsOwned() && Save.data.gold === 50000 - 3000 && wheelsData().sel === 'skate' && wheelsBuy('skate') === false;
    wheelsBuy('bike'); out.selectsNew = wheelsData().sel === 'bike';
    townGo('in_wheels', 600, 1); run(10); townShowWheels(); out.panel = /SPOKE/.test(OV.innerHTML) && /Racing bike/.test(OV.innerHTML) && /data-a="wh-use-skate"/.test(OV.innerHTML) && /data-a="wh-buy-racer"/.test(OV.innerHTML) && document.querySelectorAll('canvas[data-wh]').length === 4;
    handleAction('wh-use-skate'); out.uses = wheelsData().sel === 'skate'; Save.data.gold = 100; handleAction('wh-buy-racer'); out.noMoneyNoBuy = !wheelsData().owned.racer;
    var cv = document.querySelector('canvas[data-wh="bike"]'), d = cv.getContext('2d').getImageData(0, 0, 190, 96).data, ink = 0; for (var q = 3; q < d.length; q += 4) if (d[q] > 0) ink++; out.cardPaints = ink > 600;
    townClosePanel(); run(2);

    /* getting on, being faster, indoors */
    townGo('park', 3400, 1); run(10); Town.vx = 0;
    var x0 = Town.x; Input.keys.KeyD = true; run(40); var walk = Town.x - x0; Input.keys = {}; run(20);
    wheelsData().sel = 'bike'; key('KeyV'); out.keyMounts = Town.wheels === 'bike';
    x0 = Town.x; Input.keys.KeyA = true; run(40); var ride = x0 - Town.x; Input.keys = {};
    out.faster = ride > walk * 1.4; out.heavy = Math.abs(Town.vx) > 100;
    run(40); key('KeyV'); out.keyDismounts = !Town.wheels;
    Town.x = TOWN_DIST.park.w - 60; key('KeyV'); out.drawsRiding = (GR.render(), true);
    townEnter('in_wheels', 500, 1); out.staysOnIndoors = Town.wheels === 'bike' && Town.d === 'in_wheels';
    Town.wheels = null; Town.car = true; key('KeyV'); out.noWheelsInCar = !Town.wheels; Town.car = false;

    /* a panel, a seat or a car takes her off */
    townGo('park', 3400, 1); run(5); key('KeyV'); out.mounted = !!Town.wheels; townShowWheels(); run(2); out.panelDismounts = !Town.wheels; townClosePanel(); run(2);

    /* a small chance of falling: none standing still, some at speed, and a forced one tumbles and gets up */
    key('KeyV'); Math.random = function(){ return 0; }; run(20); out.noFallStill = !Town.fall && !!Town.wheels;
    Input.keys.KeyD = true; run(45); Math.random = realRandom; out.fallAtSpeed = !!Town.fall || !Town.wheels;
    Input.keys = {}; run(80); out.getsUp = !Town.fall && !Town.wheels;
    out.fallCount = (townData().n.wheelFalls | 0) >= 1;
    key('KeyV'); Math.random = function(){ return 0.9; }; Input.keys.KeyD = true; run(300); Input.keys = {}; Math.random = realRandom; out.rarelyFalls = !Town.fall && Town.wheels === 'bike' && (townData().n.wheelFalls | 0) === 1;
    Town.fixFall = true; Input.keys.KeyD = true; run(10); Input.keys = {}; out.forcedFall = !!Town.fall; GR.render(); run(20); GR.render(); out.fallDraws = true; run(80); out.fallEnds = !Town.fall && !Town.wheels;

    /* opinions indoors, none outdoors, and a calm keeper */
    townGo('park', 3400, 1); run(5); mount(); Town.bubbles = []; Math.random = function(){ return 0.9; }; Input.keys.KeyD = true; run(250); Input.keys = {}; Math.random = realRandom; out.silentOutdoors = !!Town.wheels && !(Town.bubbles && Town.bubbles.length);
    townGo('in_bakery', 400, 1); run(10); Town.bubbles = []; mount(); Town.wcT = 0; Math.random = function(){ return 0.9; }; Input.keys.KeyD = true; run(8); Math.random = realRandom; Input.keys = {};
    out.opinion = !!(Town.bubbles && Town.bubbles.length) && typeof Town.bubbles[0].txt === 'string' && Town.bubbles[0].txt.length > 8;
    GR.render(); out.bubbleDraws = true; run(140); out.bubblesEnd = !(Town.bubbles && Town.bubbles.length) || Town.bubbles.every(function(b){ return b.t < 4.2; });
    out.crumbKnown = WHEELS_SAY.crumb.length >= 2 && (function(){ var seen = {}; for (var i = 0; i < 60; i++){ var n = wheelsPickNpc(); if (!n) return false; } return true; })();
    Town.wheels = null; townGo('in_wheels', 600, 1); run(10); Town.bubbles = []; mount(); Town.wcT = 0; run(60); out.keeperCalm = !!Town.wheels && !(Town.bubbles && Town.bubbles.length);

    /* the photo studio */
    var ids = ['wheels_skate', 'wheels_cruiser', 'wheels_bike', 'wheels_racer'], fxIds = PHOTO_FX.map(function(f){ return f[0]; });
    out.photoFx = ids.every(function(id){ return fxIds.indexOf(id) >= 0 && !!PHOTO_FXDRAW[id]; }) && PHOTO_FX.length <= 64 && ids.every(function(id, i){ return fxIds.indexOf(id) === fxIds.length - 4 + i; });
    out.photoPaints = ids.every(function(id){ var c = document.createElement('canvas'); c.width = 300; c.height = 200; var g = c.getContext('2d'); g.translate(150, 100); PHOTO_FXDRAW[id](g); var dd = g.getImageData(0, 0, 300, 200).data, n = 0; for (var i = 3; i < dd.length; i += 4) if (dd[i] > 0) n++; return n > 800; });
    var pre = photoData(); pre.items = [{ type: 'fx', id: 'wheels_racer', chapter: 0, x: 40, y: 20, scale: 1, flip: false, tilt: 0 }]; var code = photoB64(photoPack(pre)), back = photoUnpack((function(){ var s = atob(code.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice(0, (4 - code.length % 4) % 4)), b = []; for (var i = 0; i < s.length; i++) b.push(s.charCodeAt(i)); return b; })());
    out.photoCode = back.items.length === 1 && back.items[0].id === 'wheels_racer';

    /* the Guide, the key and the save */
    out.guide = /Skateboards and bicycles/.test(guideTopicsHTML()) && /Spoke &amp; Board/.test(guideTopicsHTML());
    out.keyBinding = DEFAULT_KEYS.ride === 'KeyV' && KEY_ACTIONS.some(function(k){ return k[0] === 'ride'; });
    var keepW = Save.data.town.wheels; Save.data.town.wheels = 'junk'; out.junkSave = wheelsOwned() === false && (wheelsData().owned && Object.keys(wheelsData().owned).length === 0); Save.data.town.wheels = keepW;
  } catch (e) { out.errs.push('threw: ' + e.message + ' ' + (e.stack || '').split('\n').slice(0, 3).join(' | ')); }
  Math.random = realRandom;
  var need = ['shopBuilding', 'fourThings', 'rawRead', 'refusedUnowned', 'cannotAfford', 'buys', 'selectsNew', 'panel', 'uses', 'noMoneyNoBuy', 'cardPaints', 'keyMounts', 'faster', 'heavy', 'keyDismounts', 'drawsRiding', 'staysOnIndoors', 'noWheelsInCar', 'mounted', 'panelDismounts', 'noFallStill', 'fallAtSpeed', 'getsUp', 'fallCount', 'rarelyFalls', 'forcedFall', 'fallDraws', 'fallEnds', 'silentOutdoors', 'opinion', 'bubbleDraws', 'bubblesEnd', 'crumbKnown', 'keeperCalm', 'photoFx', 'photoPaints', 'photoCode', 'guide', 'keyBinding', 'junkSave'];
  out.failed = need.filter(function(k){ return out[k] !== true; });
  out.pass = out.errs.length === 0 && out.failed.length === 0;
  QA.done(out);
})();
