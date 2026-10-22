/* fishing: the grown fishing of js/44zzv-fishing.js. 35 kinds in five groups, what bites on the pier and in each kind of water (and by weather, night and bait), the
   timing game (a catch, a miss, a bite that is not answered), sizes and records, tackle unlocked free by how many kinds she has caught and put on, Brine's
   weekly order, the fish book, casting from a boat (F, the Cast button, Esc, only when the boat is nearly still), and trophies. There are no real timers here:
   the game is stepped by hand with fishTick. */
(function(){
  var out = { errs: [] }; window.addEventListener('error', function(e){ out.errs.push(e.message + ' @' + (e.filename || '').split('/').pop() + ':' + e.lineno); });
  GR.handleAction('splash-go'); Ach.check = function(){ return []; };
  function tick(n){ for (var i = 0; i < n; i++) fishTick(0.03); }
  function cast(force){ fishCast(); if (force) Fg.fish = FISH.filter(function(f){ return f.id === force; })[0]; tick(120); return Fg.phase === 'bite'; }
  function key(code){ window.dispatchEvent(new KeyboardEvent('keydown', { code: code, bubbles: true, cancelable: true })); }
  try {
    /* the list */
    var ids = {}, dup = 0, bad = []; FISH.forEach(function(f){ if (ids[f.id]) dup++; ids[f.id] = 1; if (!f.h || !f.c || !f.k || !f.len || !(f.len[1] > f.len[0]) || !(f.v > 0) || !(f.r > 0)) bad.push(f.id); });
    out.list = FISH.length === 35 && dup === 0 && bad.length === 0; out.bad = bad;
    out.groups = JSON.stringify(FISH_GROUPS.map(function(g){ return fishGroupCount(g[0])[1]; })) === '[13,6,6,7,3]';
    out.rarities = [0, 1, 2, 3].every(function(q){ return FISH.some(function(f){ return fishRarity(f) === q; }); });

    /* what bites */
    var pier = fishPool('pier'); out.pierOnly = pier.length > 0 && pier.every(function(p){ return p.f.h === 'pier' && !p.f.wx; });
    Town.fixWeather = 'clear';
    function hs(where){ return fishPool(where).map(function(p){ return p.f.h; }); }
    out.shallows = hs('shallows').every(function(h){ return h === 'shallows'; }) && hs('shallows').length > 0;
    out.reef = hs('reef').indexOf('reef') >= 0 && hs('reef').every(function(h){ return h === 'reef' || h === 'shallows'; });
    out.deep = hs('deep').every(function(h){ return h === 'deep'; }) && hs('deep').length > 0;
    out.water = ['shallows', 'reef', 'deep'].every(function(h){ return hs('water').indexOf(h) >= 0; });
    out.noWeatherFish = !fishPool('deep').some(function(p){ return p.f.wx; });
    Town.fixWeather = 'storm'; out.storm = fishPool('deep').some(function(p){ return p.f.id === 'stormray'; }) && !fishPool('pier').some(function(p){ return p.f.id === 'stormray'; }) && !fishPool('deep').some(function(p){ return p.f.id === 'ghostkoi'; });
    Town.fixWeather = 'fog'; out.fog = fishPool('reef').some(function(p){ return p.f.id === 'ghostkoi'; }); Town.fixWeather = 'clear';
    var oneBait = function(b){ var s = 0, r = 0; fishPool('water', b).forEach(function(p){ s += p.w; if (fishRarity(p.f) >= 2) r += p.w; }); return r / s; };
    out.bait = oneBait(FISH_BAITS[2]) > oneBait(FISH_BAITS[1]) && oneBait(FISH_BAITS[1]) > oneBait(FISH_BAITS[0]);
    var many = {}; for (var i = 0; i < 400; i++) many[fishPickAt('shallows').h] = 1; out.picks = Object.keys(many).join() === 'shallows';

    /* the game: a catch */
    var t = townData(); t.n = t.n || {}; var gold0 = Save.data.gold, gems0 = Save.data.gems;
    townShowFishing(); out.panel = /Cast/.test(OV.innerHTML) && /Fish book/.test(OV.innerHTML) && /Brine/.test(OV.innerHTML) && fishTackle().rod.n === 'Plain rod';
    out.side = OV.classList.contains('side') && Fg.side === true;
    var c0 = Fg.clock; GR.step(1 / 60); out.clock = Fg.clock > c0;
    function pixels(geo){ var cv = document.createElement('canvas'); cv.width = 700; cv.height = 600; var cx = cv.getContext('2d'); fishDrawAnim(cx, geo); var d = cx.getImageData(0, 0, 700, 600).data, n = 0; for (var q = 3; q < d.length; q += 4) if (d[q] > 30) n++; return n; }
    var tx = Town.x, tf = Town.face; Town.x = 150; Town.face = 1;
    out.bite = cast('sardine'); out.animBite = Fg.phase === 'bite' && fishAnimOn() && pixels(fishPierGeo()) > 100; Fg.pos = Fg.zone + Fg.w / 2; fishReel();
    out.leap = Fg.a && Fg.a.k === 'leap' && fishAnimOn(); Fg.a.t = Fg.clock - 0.4; out.leapDraws = pixels(fishPierGeo()) > 600; Fg.a.t = Fg.clock - 5; out.leapEnds = !fishAnimOn();
    out.won = fishLog().sardine === 1 && fishBook().sardine >= 12 && fishBook().sardine <= 20 && Save.data.gold > gold0 && Save.data.gems === gems0 + 5 && /Sardine, \d+ cm/.test(document.getElementById('fishMsg').textContent);
    /* a miss and a bite left alone */
    out.bite2 = cast('sardine'); Fg.pos = Fg.zone > 0.5 ? 0 : 1; fishReel(); out.lostAnim = Fg.a && Fg.a.k === 'lost'; Fg.a.t = Fg.clock - 0.3; out.lostDraws = pixels(fishPierGeo()) > 100; Town.x = tx; Town.face = tf;
    out.missed = fishLog().sardine === 1 && /got away/.test(document.getElementById('fishMsg').textContent);
    out.bite3 = cast('sardine'); tick(300); out.timeout = Fg.phase === 'idle' && /got away/.test(document.getElementById('fishMsg').textContent) && fishLog().sardine === 1;
    /* a smaller one does not break the record */
    fishBook().sardine = 20; cast('sardine'); Fg.pos = Fg.zone + Fg.w / 2; fishReel(); out.record = fishBook().sardine === 20 && fishLog().sardine === 2;

    /* tackle, free, unlocked by how many kinds she has caught (5, 10, 15, 20, 28, all 35) */
    var log = fishLog();
    function setKinds(n){ Object.keys(log).forEach(function(k){ delete log[k]; }); FISH.slice(0, n).forEach(function(f){ log[f.id] = 1; }); }
    setKinds(4);
    out.noRodYet = !fishUnlocked(FISH_RODS, 1) && fishTackle().rod.n === 'Plain rod';
    var wPlain; cast('sardine'); wPlain = Fg.w; Fg.pos = Fg.zone + Fg.w / 2; fishReel();
    out.stillPlain = fishKinds() === 4 && fishTackle().rod.n === 'Plain rod';
    cast('carp'); Fg.pos = Fg.zone + Fg.w / 2; fishReel();
    out.newTackle = fishKinds() === 5 && fishTackle().rod.n === 'Cane rod' && /New tackle/.test(document.getElementById('fishMsg').textContent) && /Cane rod/.test(document.getElementById('fishMsg').textContent);
    cast('sardine'); out.rodWider = Math.abs(Fg.w / wPlain - 1.15) < 0.01; Fg.pos = Fg.zone + Fg.w / 2; fishReel();
    setKinds(10);
    out.lineNeed = fishUnlocked(FISH_LINES, 1) && !fishUnlocked(FISH_LINES, 2) && !fishUnlocked(FISH_BAITS, 1);
    fishTackle().k.line = 1; cast('sardine'); out.longerBite = Fg.k.line.win === 7.5;
    while (Fg.phase === 'bite' && Fg.t < 6) fishTick(0.03); out.stillBiting = Fg.phase === 'bite' && Fg.t >= 6; tick(80); out.timedOut = Fg.phase === 'idle';
    fishTackle().k.line = 2; out.lockedLine = fishTackle().line.n === 'Thin line';
    fishTackle().k.bait = 1; out.lockedBait = fishTackle().bait.n === 'No bait';
    setKinds(15); out.shrimp = fishUnlocked(FISH_BAITS, 1) && !fishUnlocked(FISH_LINES, 2);
    setKinds(20); out.deepReelNeed = fishUnlocked(FISH_LINES, 2) && !fishUnlocked(FISH_BAITS, 2);
    setKinds(27); out.noGlowYet = !fishUnlocked(FISH_BAITS, 2); setKinds(28); out.glow = fishUnlocked(FISH_BAITS, 2) && !fishUnlocked(FISH_RODS, 2);
    FISH.forEach(function(f){ log[f.id] = 1; }); out.all = fishKinds() === 35 && fishUnlocked(FISH_RODS, 2) && fishUnlocked(FISH_LINES, 2) && fishUnlocked(FISH_BAITS, 2);
    fishTackle().k.rod = 2; fishTackle().k.line = 2; cast('sardine'); out.golden = Fg.w > 0.2; out.deepReel = Fg.k.line.win === 10; Fg.phase = 'idle'; clearInterval(Fg.iv);
    handleAction('fish-tk-rod'); out.cycles = fishTackle().rod.n === 'Plain rod'; handleAction('fish-tk-rod'); handleAction('fish-tk-rod'); out.cyclesBack = fishTackle().rod.n === 'Golden rod';
    setKinds(12); showFishBook(); out.bookTackle = /Tackle/.test(OV.innerHTML) && /12 of 28 kinds/.test(OV.innerHTML) && OV.querySelectorAll('.fcard.got').length >= 2;
    FISH.forEach(function(f){ log[f.id] = 1; }); townShowFishing();

    /* Brine's order: eight gems, once a week */
    var o = fishOrder(); out.order = !!o.id && o.done === false && fishOrder().id === o.id && FISH.filter(function(f){ return f.id === o.id; })[0].h !== 'special';
    townData().n.fishAll = 1; delete log[o.id]; var g1 = Save.data.gems; cast(o.id); Fg.pos = Fg.zone + Fg.w / 2; fishReel();
    out.orderPaid = Save.data.gems === g1 + 5 + 8 && fishOrder().done === true && townData().n.fishOrders === 1;
    var g2 = Save.data.gems; cast(o.id); Fg.pos = Fg.zone + Fg.w / 2; fishReel(); out.orderOnce = Save.data.gems === g2;

    /* the fish book */
    var l2 = fishLog(); FISH.forEach(function(f){ delete l2[f.id]; }); l2.sardine = 3; fishBook().sardine = 17;
    showFishBook(); out.book = OV.querySelectorAll('.fcard canvas').length === 35 && OV.querySelectorAll('.fcard.got canvas').length === 1 && /Biggest 17 cm/.test(OV.innerHTML) && /\?\?\?\?\?/.test(OV.innerHTML);
    function ink(id){ var cv = OV.querySelector('canvas[data-fb="' + id + '"]'), d = cv.getContext('2d').getImageData(0, 0, cv.width, cv.height).data, n = 0; for (var q = 3; q < d.length; q += 4) if (d[q] > 40) n++; return n; }
    out.paints = FISH.every(function(f){ return ink(f.id) > 80; }); out.paintSample = ink('sardine') + ',' + ink('stormray') + ',' + ink('jelly');
    fishBook().marlin = 250; l2.marlin = 1; showFishBook(); out.bookNew = /Biggest 250 cm/.test(OV.innerHTML);
    handleAction('fish-book-back'); out.bookBack = /Cast a line|Cast/.test(OV.innerHTML) && !!document.getElementById('fishCast');

    /* from a boat */
    var sd = seaData(); sd.own.skiff = 1; sd.sel = 'skiff';
    function spot(type){ for (var y = 300; y < SEA_W - 300; y += 45) for (var x = 300; x < SEA_W - 300; x += 45) if (seaTypeAt(x, y) === type && seaTypeAt(x + 60, y) === type && seaTypeAt(x - 60, y) === type && seaTypeAt(x, y + 60) === type && seaTypeAt(x, y - 60) === type) return { x: x, y: y }; return null; }
    var sp = { shallow: spot(SEA_SHALLOW), reef: spot(SEA_REEF), deep: spot(SEA_DEEP), water: spot(SEA_WATER) }; out.spots = Object.keys(sp).filter(function(k){ return !sp[k]; }).join() || 'all';
    G.state = 'menu'; seaStart('harbour'); GR.step(1 / 60);
    var near = sp.deep || sp.water; Sea.x = near.x; Sea.y = near.y; Sea.v = 100; Sea.thr = 1;
    out.refusedMoving = fishSeaOpen() === false && G.state === 'sail';
    Sea.v = 0; Sea.thr = 0; Sea.nearDock = ''; GR.step(1 / 60); GR.step(1 / 60);
    out.btn = document.getElementById('castBtn') && document.getElementById('castBtn').style.display === 'flex';
    key('KeyF'); out.seaSide = OV.classList.contains('side'); out.opened = G.state === 'fishing' && /OUT AT SEA/.test(OV.innerHTML) && /Back to the boat/.test(OV.innerHTML) && Fg.sea === true;
    GR.render(); out.rendersSea = true;
    /* she holds the rod and her neck moves: the line starts at the end of the rod, and the rod swings back and flicks forward on a cast */
    Fg.rodU = 0; out.neckMoves = Math.abs(seaRiderPose(0.5).a - seaRiderPose(3.1).a) > 0.1 && seaRiderPose(1).rod === null;
    Fg.rodU = 1; Fg.phase = 'idle'; Fg.a = { k: 'cast', t: Fg.clock - 0.3 }; GR.render(); var tipWind = seaRiderTip.slice();
    Fg.a = { k: 'cast', t: Fg.clock - 0.8 }; GR.render(); var tipSet = seaRiderTip.slice(); var geo = fishSeaGeo();
    out.rodSwings = Math.abs(tipWind[0] - tipSet[0]) + Math.abs(tipWind[1] - tipSet[1]) > 20 && geo.rod[0] === tipSet[0] && geo.rod[1] === tipSet[1];
    out.rodPose = seaRiderPose(1).rod && seaRiderPose(1).rod.len > 40; Fg.a = null;
    cast(); fishDrawAnim(CTX, fishSeaGeo()); out.seaAnim = fishAnimOn() && Fg.phase === 'bite'; Fg.pos = Fg.zone + Fg.w / 2; fishReel(); Fg.a.t = Fg.clock - 0.5; GR.render(); out.seaLeapDraws = pixels(fishSeaGeo()) > 300;
    var before = fishLog(); var keep = {}; Object.keys(before).forEach(function(k){ keep[k] = before[k]; });
    cast(); Fg.pos = Fg.zone + Fg.w / 2; fishReel(); out.seaCatch = Object.keys(fishLog()).some(function(k){ return fishLog()[k] !== keep[k]; }) && townData().n.seaCasts >= 1;
    key('Escape'); out.closed = G.state === 'sail' && !Fg.sea && !Fg.iv;
    if (sp.reef){ Sea.x = sp.reef.x; Sea.y = sp.reef.y; Fg.sea = true; out.habReef = fishHab() === 'reef'; }
    if (sp.shallow){ Sea.x = sp.shallow.x; Sea.y = sp.shallow.y; out.habShallow = fishHab() === 'shallows'; }
    if (sp.deep){ Sea.x = sp.deep.x; Sea.y = sp.deep.y; out.habDeep = fishHab() === 'deep'; }
    Fg.sea = false; Sea.on = false; G.state = 'menu';

    /* the tackle shop: a door on the shack, three stations, and taking a piece puts it on */
    var shack = TOWN_DIST.harbour.b.filter(function(b){ return b.id === 'shack'; })[0];
    out.shopDoor = !!shack && shack.to === 'in_tackle' && !!TOWN_DIST.in_tackle && TOWN_ROOM_PARENT.in_tackle === 'harbour' && TOWN_DIST.in_tackle.b.filter(function(b){ return /^tk-/.test(b.act); }).length === 4;
    var ts = freshSave(); Save.data = ts; log = fishLog(); setKinds(12);
    townShowTackle('rod'); out.shopLocked = /Golden rod/.test(OV.innerHTML) && /more kinds/.test(OV.innerHTML) && !/data-a="tk-take-rod-2"/.test(OV.innerHTML) && /data-a="tk-take-rod-1"/.test(OV.innerHTML);
    handleAction('tk-take-rod-2'); out.shopRefuses = fishTackle().k.rod !== 2;
    handleAction('tk-take-rod-1'); out.shopTakes = fishTackle().k.rod === 1 && /In use/.test(OV.innerHTML);
    handleAction('tk-take-line-1'); townShowTackle('line'); out.shopLine = fishTackle().k.line === 1;
    handleAction('tk-take-rod-0'); out.shopSwap = fishTackle().k.rod === 0;
    townShowTackle('bait'); out.shopBait = /Shrimp/.test(OV.innerHTML) && /Glow lure/.test(OV.innerHTML) && /16 more kinds/.test(OV.innerHTML);
    hideOverlay(); Town.panel = false;
    townGo('in_tackle', 190, 1); out.shopRoom = Town.d === 'in_tackle'; GR.step(1 / 60); GR.render(); out.shopPaints = true;

    /* fish scales and the gear bench */
    var sv = freshSave(); Save.data = sv; log = fishLog();
    out.scalesRaw = fishScaleN() === 0 && townData().scales === undefined;
    out.scaleRates = FISH_SCALES.join() === '1,2,5,12' && FISH.every(function(f){ return fishScaleGain(f) >= 1; });
    Town.d = 'harbour'; townShowFishing(); cast('sardine'); Fg.pos = Fg.zone + Fg.w / 2; fishReel(); out.scaleCatch = fishScaleN() >= 1 && /scale/.test(document.getElementById('fishMsg').textContent);
    var gid = Object.keys(GEAR_INDEX).filter(function(i){ return GEAR_INDEX[i].name !== 'Bare Hooves'; })[0];
    townShowBench(); out.benchEmpty = /No gear yet/.test(OV.innerHTML);
    Save.data.gear = Save.data.gear || {}; Save.data.gear[gid] = 1; townData().scales = 5; townShowBench();
    out.benchLocked = /disabled/.test(OV.innerHTML) && benchUp(gid) === false && gearLevel(gid) === 1 && fishScaleN() === 5;
    townData().scales = 10; out.benchBuys = benchUp(gid) === true && gearLevel(gid) === 2 && fishScaleN() === 0;
    townData().scales = 500; benchUp(gid); benchUp(gid); benchUp(gid); out.benchMax = gearLevel(gid) === GEAR_LV_MAX && fishScaleN() === 500 - 22 - 40 - 65 && benchUp(gid) === false;
    out.benchRows = /as good as it gets/.test((townShowBench(), OV.innerHTML));
    hideOverlay(); Town.panel = false;

    /* trophies, and a save that has never fished is not touched by looking */
    var fresh = freshSave(); var keysBefore = JSON.stringify(Object.keys(fresh));
    Save.data = fresh; var A = ['fish20', 'fish35', 'fishBig', 'fishLeg', 'fishOrd3', 'seaCast'].map(function(id){ return ACH.filter(function(a){ return a.id === id; })[0]; });
    out.achs = A.every(function(a){ return !!a && a.val() === 0; }); out.untouched = JSON.stringify(Save.data.town) === undefined;
    var tt = townData(); FISH.forEach(function(f){ tt.fish = tt.fish || {}; tt.fish[f.id] = 1; }); tt.fishBook = { oarfish: 400 }; tt.n.fishOrders = 3; tt.n.seaCasts = 2;
    out.achEarn = A.every(function(a){ return a.val() >= a.goal; });
  } catch (e) { out.errs.push('threw: ' + e.message + ' ' + (e.stack || '').split('\n').slice(0, 3).join(' | ')); }
  var need = ['neckMoves', 'rodSwings', 'rodPose', 'scalesRaw', 'scaleRates', 'scaleCatch', 'benchEmpty', 'benchLocked', 'benchBuys', 'benchMax', 'benchRows', 'shopDoor', 'shopLocked', 'shopRefuses', 'shopTakes', 'shopLine', 'shopSwap', 'shopBait', 'shopRoom', 'shopPaints', 'list', 'groups', 'rarities', 'pierOnly', 'shallows', 'reef', 'deep', 'water', 'noWeatherFish', 'storm', 'fog', 'bait', 'picks', 'panel', 'side', 'clock', 'animBite', 'leap', 'leapDraws', 'leapEnds', 'lostAnim', 'lostDraws', 'bite', 'won', 'bite2', 'missed', 'bite3', 'timeout', 'record', 'noRodYet', 'stillPlain', 'newTackle', 'rodWider', 'lineNeed', 'longerBite', 'stillBiting', 'timedOut', 'lockedLine', 'lockedBait', 'shrimp', 'deepReelNeed', 'noGlowYet', 'glow', 'all', 'deepReel', 'cycles', 'cyclesBack', 'bookTackle', 'order', 'orderPaid', 'orderOnce', 'book', 'paints', 'bookNew', 'bookBack', 'refusedMoving', 'btn', 'opened', 'seaSide', 'seaAnim', 'seaLeapDraws', 'rendersSea', 'seaCatch', 'closed', 'achs', 'achEarn'];
  out.failed = need.filter(function(k){ return out[k] !== true; });
  out.pass = out.errs.length === 0 && out.failed.length === 0;
  QA.done(out);
})();
