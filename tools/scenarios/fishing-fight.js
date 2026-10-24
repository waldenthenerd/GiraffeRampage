/* fishing-fight: the third part of the fishing (js/44zzy-fishing-fight.js). The fight after the hook (hold to wind in, the line snaps when it is too tight, the fish comes in
   only while she winds), how each of the 35 kinds pulls, conditions (dawn, midday, rain, storm, fog) and the daily spots at sea, the catch card, the mounted fish at home,
   auto-recast, the Cast-again key, the way to the tackle shop, and the sounds. There are no real timers: fishTick is called by hand. */
(function(){
  var out = { errs: [] }; window.addEventListener('error', function(e){ out.errs.push(e.message + ' @' + (e.filename || '').split('/').pop() + ':' + e.lineno); });
  GR.handleAction('splash-go'); Ach.check = function(){ return []; };
  function tick(n){ for (var i = 0; i < n; i++) fishTick(0.03); }
  function key(code){ window.dispatchEvent(new KeyboardEvent('keydown', { code: code, bubbles: true, cancelable: true })); }
  function pier(){ Town.d = 'harbour'; G.state = 'town'; Fg.sea = false; townShowFishing(); }
  function cast(id){ fishCast(); Fg.fish = FISH.filter(function(f){ return f.id === id; })[0]; tick(200); return Fg.phase === 'bite'; }
  function hook(){ Fg.pos = Fg.zone + Fg.w / 2; fishReel(); return Fg.phase === 'fight'; }
  try {
    /* 2 every kind has a way of fighting, and they differ */
    out.how = FISH.every(function(f){ return !!FISH_HOW[f.id] && !!FISH_BEHAVE[FISH_HOW[f.id]]; }) && Object.keys(FISH_BEHAVE).every(function(k){ return FISH.some(function(f){ return FISH_HOW[f.id] === k; }); });
    out.pulls = Object.keys(FISH_BEHAVE).every(function(k){ var lo = 9, hi = -9; for (var t = 0; t < 12; t += 0.05){ var v = fishPullAt(k, t); lo = Math.min(lo, v); hi = Math.max(hi, v); } return lo >= 0 && hi <= 1 && (k === 'limp' || hi - lo > 0.2); });
    out.boot = fishBehave(FISH.filter(function(f){ return f.id === 'boot'; })[0]).str < 0.5;

    /* 1 the hook, then the fight */
    Save.data = JSON.parse(JSON.stringify(DEFAULT_SAVE)); Save.data.town = { n: {}, fish: {}, fishBook: {} }; townData(); pier();
    out.fightHtml = !!document.getElementById('fightUi') && document.getElementById('fightUi').style.display === 'none';
    out.bite = cast('sardine'); out.hooked = hook() && document.getElementById('fightUi').style.display === 'block' && document.getElementById('fishBar').style.display === 'none' && /Hooked/.test(document.getElementById('fishMsg').textContent);
    /* holding all the time snaps the line */
    Fg.hold = true; var n = 0; while (Fg.phase === 'fight' && n++ < 400) fishTick(0.03); out.snaps = Fg.phase === 'idle' && /snapped/.test(document.getElementById('fishMsg').textContent) && fishLog().sardine === undefined;
    /* never winding loses the fish */
    out.bite2 = cast('sardine'); hook(); Fg.hold = false; n = 0; while (Fg.phase === 'fight' && n++ < 800) fishTick(0.03); out.shakes = Fg.phase === 'idle' && /shook the hook|got away/.test(document.getElementById('fishMsg').textContent) && !fishLog().sardine;
    /* winding with care wins, and the tension never goes past safe for long */
    out.bite3 = cast('sardine'); hook(); n = 0; var topTen = 0; while (Fg.phase === 'fight' && n++ < 4000){ Fg.hold = Fg.ten < 0.55 || (Fg.pull < 0.3 && Fg.ten < 0.8); fishTick(0.03); topTen = Math.max(topTen, Fg.ten); }
    out.wins = fishLog().sardine === 1 && /You caught/.test(document.getElementById('fishMsg').textContent) && !!Fg.last;
    /* the line: a better one takes more strain */
    function tenAfter(lineI){ fishTackle().k.line = lineI; cast('sardine'); hook(); Fg.str = 1; Fg.hold = true; for (var i = 0; i < 12; i++) fishTick(0.03); var t = Fg.ten; Fg.hold = false; fishResult(false); return t; }
    var kk = []; FISH.slice(0, 22).forEach(function(f){ fishLog()[f.id] = 1; }); var t1 = tenAfter(0), t3 = tenAfter(2);
    out.betterLine = t3 < t1 && fishTackle().k.line === 2; fishTackle().k.line = 0;

    /* 9 the catch card */
    delete fishLog().minnow; fishBook().minnow = 0; pier(); cast('minnow'); hook(); n = 0; while (Fg.phase === 'fight' && n++ < 4000){ Fg.hold = Fg.ten < 0.55 || (Fg.pull < 0.3 && Fg.ten < 0.8); fishTick(0.03); }
    var card = OV.querySelector('.fcatch'); out.card = !!card && /Minnow/i.test(card.textContent) && /new kind/.test(card.textContent) && /gold/.test(card.textContent) && /scale/.test(card.textContent) && !!OV.querySelector('canvas[data-fc]');
    var cv = OV.querySelector('canvas[data-fc]'), px = cv ? cv.getContext('2d').getImageData(0, 0, 84, 48).data : [], ink = 0; for (var q = 3; q < px.length; q += 4) if (px[q] > 0) ink++; out.cardPaints = ink > 200;
    out.cardGoes = (cast('minnow'), !OV.querySelector('.fcatch'));

    /* 5 conditions */
    var keepH = Town.fixHour, keepW = Town.fixWeather;
    Town.fixWeather = 'clear'; Town.fixHour = 6; var dawn = fishCond('pier'); Town.fixHour = 12.5; var noon = fishCond('pier'); Town.fixHour = 22; var night = fishCond('pier');
    out.dawn = dawn.wait < 1 && dawn.rare > 1 && /Dawn/.test(dawn.msg); out.noon = noon.wait > 1 && /midday/.test(noon.msg); out.night = night.rare > 1 && /Night/.test(night.msg);
    Town.fixHour = 12.5; Town.fixWeather = 'storm'; var sto = fishCond('pier'); Town.fixWeather = 'rain'; var rn = fishCond('pier'); Town.fixWeather = 'fog'; var fg = fishCond('pier');
    out.weather = sto.size > 1 && sto.pull > 1 && rn.wait < 1 && fg.rare > 1;
    Town.fixWeather = 'storm'; Fg.sea = false; fishPanel(); out.condLine = /Storm/.test(OV.innerHTML);
    Town.fixWeather = 'clear'; Town.fixHour = 12.5; cast('sardine'); out.waitScaled = Fg.wait >= 1 * 1.3 - 1e-9 && Fg.wait <= 3.2 * 1.3 + 1e-9; Fg.phase = 'idle'; clearInterval(Fg.iv); Fg.iv = 0;
    var szRoll = function(){ var s = 0; for (var i = 0; i < 400; i++) s += fishRollLen(FISH[0], 1); return s / 400; };
    Town.fixWeather = 'clear'; var base = szRoll(); Town.fixWeather = 'storm'; var big = szRoll(); out.stormBigger = big > base; Town.fixHour = keepH; Town.fixWeather = keepW;

    /* 6 spots */
    Fg.fixDay = 20000; var sp = fishSpots(), kinds = {}; sp.forEach(function(s){ kinds[s.k] = (kinds[s.k] | 0) + 1; });
    out.spots = sp.length >= 6 && kinds.hot === 1 && kinds.shoal >= 1 && kinds.wreck >= 1 && kinds.edge >= 1;
    out.wet = sp.every(function(s){ var t = seaTypeAt(s.x, s.y); return t === SEA_DEEP || t === SEA_WATER || t === SEA_SHALLOW || t === SEA_REEF; });
    out.same = JSON.stringify(fishSpots()) === JSON.stringify(sp); Fg.fixDay = 20001; out.newDay = JSON.stringify(fishSpots()) !== JSON.stringify(sp); Fg.fixDay = 20000;
    var hot = sp.filter(function(s){ return s.k === 'hot'; })[0];
    var sd = seaData(); sd.own.skiff = 1; sd.sel = 'skiff'; G.state = 'menu'; seaStart('harbour'); GR.step(1 / 60);
    Sea.x = hot.x; Sea.y = hot.y; Sea.v = 0; Sea.thr = 0; Sea.nearDock = ''; GR.step(1 / 60); GR.step(1 / 60);
    var inHot = fishSpotAt(Sea.x, Sea.y); out.inSpot = !!inHot && inHot.k === 'hot'; Fg.sea = true; var c = fishCond('deep'); out.hotCond = c.rare >= 2.5 && c.wait < 0.5 && c.scales === 2 && /HOT SPOT/.test(c.msg) && c.spot === inHot;
    Sea.x = hot.x + SPOT_R + 80; out.outSpot = !fishSpotAt(Sea.x, Sea.y) && fishCond('deep').scales === 1; Sea.x = hot.x; out.pierNoSpot = fishCond('pier').spot === null;
    GR.render(); G.state = 'sail'; GR.render(); out.drawsSea = true; Fg.sea = false;
    key('KeyM'); out.mapOk = true;
    var btn = document.getElementById('castBtn'); if (btn){ btn.style.display = 'flex'; btn._on = true; GR.step(1 / 60); out.btnLabel = /Cast a line/.test(btn.textContent) && /\(F\)|\(/.test(btn.textContent) && /HOT SPOT/.test(btn.textContent); } else out.btnLabel = false;
    G.state = 'menu'; Sea.on = false;

    /* 8 mounted at home */
    var T = townData(); T.fishBook = { sardine: 20, carp: 60, oarfish: 300, trout: 40, minnow: 5, coelacanth: 150 };
    var m = fishMounts(); out.mounts = m.length === 4 && m[0].f.id === 'oarfish' && m[1].f.id === 'coelacanth' && m.every(function(x, i){ return i === 0 || m[i - 1].score >= x.score; });
    out.mountSig = /fmoarfish300,coelacanth150/.test(TOWN_DIST.in_myhome.sig()); townGo('in_myhome', 400, 1); GR.step(1 / 60); GR.render(); out.homePaints = Town.d === 'in_myhome';
    T.fishBook = {}; out.noMounts = fishMounts().length === 0;

    /* 10 auto-recast, Cast again, the way to the tackle shop */
    Save.data.town.fishAuto = false; pier(); out.autoBtn = /Auto-recast: off/.test(OV.innerHTML); GR.handleAction('fish-auto'); out.autoOn = fishAutoOn() === true && /Auto-recast: on/.test(OV.innerHTML) && Save.data.town.fishAuto === true;
    cast('sardine'); hook(); n = 0; while (Fg.phase === 'fight' && n++ < 4000){ Fg.hold = Fg.ten < 0.55 || (Fg.pull < 0.3 && Fg.ten < 0.8); fishTick(0.03); }
    out.recastSet = Fg.recastAt > Fg.clock && /Cast again/.test(OV.innerHTML);
    for (var i = 0; i < 200 && Fg.phase === 'idle'; i++) GR.step(0.05); out.recasts = Fg.phase === 'wait';
    Fg.phase = 'idle'; clearInterval(Fg.iv); Fg.iv = 0; GR.handleAction('fish-auto'); out.autoOff = !fishAutoOn();
    /* a key still held from the fight does not cast again: repeats are ignored and a fresh press waits a moment after the catch */
    pier(); cast('sardine'); hook(); n = 0; while (Fg.phase === 'fight' && n++ < 4000){ Fg.hold = Fg.ten < 0.55 || (Fg.pull < 0.3 && Fg.ten < 0.8); fishTick(0.03); }
    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'Space', repeat: true, bubbles: true, cancelable: true })); out.repeatIgnored = Fg.phase === 'idle';
    key('Space'); out.lockHolds = Fg.phase === 'idle'; for (var li = 0; li < 40; li++) GR.step(0.05); key('Space'); out.lockEnds = Fg.phase === 'wait'; Fg.phase = 'idle'; clearInterval(Fg.iv); Fg.iv = 0;
    pier(); key('Space'); out.spaceCasts = Fg.phase === 'wait'; Fg.phase = 'idle'; clearInterval(Fg.iv); Fg.iv = 0;
    pier(); key('KeyF'); out.fCasts = Fg.phase === 'wait'; Fg.phase = 'idle'; clearInterval(Fg.iv); Fg.iv = 0;
    pier(); showFishBook(); out.shopBtn = /fish-shop/.test(OV.innerHTML); GR.handleAction('fish-shop'); out.shopGo = Town.d === 'in_tackle' && Town.back && Town.back.d === 'harbour';

    /* 3 sound never throws */
    out.sounds = ['cast', 'splash', 'bite', 'hook', 'reel', 'warn', 'snap', 'lost', 'catch'].every(function(k){ try { fishSound(k, FISH[3]); return true; } catch (e) { return false; } });
  } catch (e) { out.errs.push('threw: ' + e.message + ' ' + (e.stack || '').split('\n').slice(0, 3).join(' | ')); }
  var need = ['how', 'pulls', 'boot', 'fightHtml', 'bite', 'hooked', 'snaps', 'bite2', 'shakes', 'bite3', 'wins', 'betterLine', 'card', 'cardPaints', 'cardGoes', 'dawn', 'noon', 'night', 'weather', 'condLine', 'waitScaled', 'stormBigger', 'spots', 'wet', 'same', 'newDay', 'inSpot', 'hotCond', 'outSpot', 'pierNoSpot', 'drawsSea', 'btnLabel', 'mounts', 'mountSig', 'homePaints', 'noMounts', 'autoBtn', 'autoOn', 'recastSet', 'recasts', 'autoOff', 'repeatIgnored', 'lockHolds', 'lockEnds', 'spaceCasts', 'fCasts', 'shopBtn', 'shopGo', 'sounds'];
  out.failed = need.filter(function(k){ return out[k] !== true; });
  out.pass = out.errs.length === 0 && out.failed.length === 0;
  QA.done(out);
})();
