/* Old and damaged sub-saves: the town (sea, gym, farm, home, car, plane), the minigames, the photo album, outfits, the bestiary, ants and the rest of what is set up lazily.
   gear-oldsave covers a gear-era save; this one loads a save whose nested objects have the wrong shape, then opens the screens that read them. Nothing may throw, and
   every repair must leave a usable shape. Run: node tools/qa-cloud.mjs tools/scenarios/oldsave-deep.js --wait 60000 */
GR.handleAction('splash-go');
var out = { errs: [], fails: [] }; window.addEventListener('error', function(e){ out.errs.push(e.message); });
function tryIt(name, f){ try { f(); } catch (e) { out.fails.push(name + ': ' + e.message); } }
var bad = {
  gold: 500, gems: 20, best: '12345', runs: 'x', meta: [], gear: { 'herdhide:cape': 1 }, equipped: { cape: 'nobody:cape', weapon: 7 }, equippedTrinkets: 'x', ants: 'none', antsUnlocked: 1, food: 'lots',
  bestiary: { creatures: 5, cards: [] }, hintsSeen: 5, venusUp: [], city: [], squad: 3, combos: 'all', mastered: null, comboClaims: 1,
  mini: { own: [], best: 'x', stars: null, hat: 5, boot: 'nope', last: 'abc', plays: 'many' },
  album: [{}, { c: 5 }, null, { c: 'GR1:not a real code', t: 'yesterday' }, { c: 'x'.repeat(40) }],
  outfits: { 0: { s: 1, p: 2 } },
  town: { found: [], bond: 5, err: 'x', talk: null, gift: [], daily: 'monday', last: 'nowhere', n: 3,
    sea: { map: 5, own: { 'nope-boat': 1 }, sel: 9, fish: 'many', crab: -4 }, gym: 7, farm: { corn: 'lots', cargo: 5, hauls: 'x' }, home: [], car: 'red', plane: 9, tour: 4, book: 2, camp: 'x', campus: [] },
  autoPerf: 'yes', musicVol: 'loud', fxLevel: 99, keys: 'WASD', textScale: 'big'
};
try {
  localStorage.setItem(SAVE_KEY, JSON.stringify(bad));
  tryIt('load', function(){ Save.load(); Settings.load(); });
  out.loaded = !!Save.data && Save.data.gold === 500 && typeof Save.data.best === 'number' && Array.isArray(Save.data.equippedTrinkets) && typeof Save.data.meta === 'object';
  var d = function(){ return Save.data; };
  /* the lazily made sub-saves come out as usable objects */
  tryIt('town', function(){ var t = townData(); out.town = ['found', 'bond', 'err', 'talk', 'gift', 'vis', 'night', 'done', 'tips', 'n'].every(function(k){ return t[k] && typeof t[k] === 'object' && !Array.isArray(t[k]); }) && typeof t.daily === 'object' && !!TOWN_DIST[t.last]; });
  tryIt('sea', function(){ var s = seaData(); out.sea = typeof s.map === 'string' && typeof s.own === 'object' && s.sel === '' && s.fish === 0 && s.crab === 0; boatOwned(); boatSel(); });
  tryIt('gym', function(){ var g = gymData(); out.gym = typeof g === 'object' && !Array.isArray(g) && typeof g.sk === 'object' && typeof g.rk === 'object'; gymTier(); gymSkill('x'); });
  tryIt('farm', function(){ var f = farmData(); out.farm = f.cargo === null && f.corn === 0 && f.hauls === 0; });
  tryIt('home', function(){ var h = homeData(); out.home = !Array.isArray(h) && typeof h.own === 'object' && typeof h.set === 'object'; homeSet(Object.keys(HOME_SLOTS)[0]); });
  tryIt('car', function(){ var c = townCarData(); out.car = typeof c === 'object' && c !== null; townCarOwned(); townCarColour && townCarColour(); });
  tryIt('plane', function(){ var p = planeData(); out.plane = typeof p === 'object' && p !== null; });
  tryIt('mini', function(){ var m = miniData(); out.mini = typeof m.own === 'object' && !Array.isArray(m.own) && typeof m.best === 'object' && typeof m.stars === 'object' && m.hat === '' && m.boot === '' && m.last === 0 && m.plays === 0; accOwnedCount(); });
  tryIt('album', function(){ var a = photoAlbum(); out.album = Array.isArray(a) && a.every(function(e){ return e && typeof e.c === 'string'; }) && a.length === 2; });
  tryIt('outfits', function(){ var o = outfitList(); out.outfits = Array.isArray(o) && o.length === OUTFIT_SLOTS && o.every(function(x){ return x === null; }); });
  /* the screens that read them open */
  [['menu', function(){ showMenu(); }], ['shop upgrades', function(){ showShop('upgrades'); }], ['shop gear', function(){ showShop('gear'); }], ['shop ants', function(){ showShop('ants'); }], ['shop wheel', function(){ showShop('wheel'); }],
   ['wardrobe', function(){ showWardrobe(); }], ['photo', function(){ showPhoto(); }], ['album', function(){ showPhoto(); photoAlbumHTML(); }], ['minigames', function(){ showMiniMenu(); }], ['collection', function(){ showCollection(); }],
   ['bestiary', function(){ showBestiary(); }], ['stats', function(){ showStats(); }], ['settings', function(){ showSettings(); }], ['help', function(){ showHelp(); }], ['gallery', function(){ showGallery(); }],
   ['fusion', function(){ showFusionMachine(); }], ['book', function(){ showBook(); }]].forEach(function(s){ tryIt('open ' + s[0], s[1]); });
  /* and a run can start and end on it */
  tryIt('run', function(){ startRun(1); G.state = 'playing'; for (var i = 0; i < 30; i++) GR.step(1 / 30); G.score = 1234; gameOver(); });
  out.afterRun = typeof Save.data.best === 'number' && Save.data.best >= 1234;
  /* the town panels that sit on the sea, gym, farm and home data */
  ['townShowBoard', 'townShowHall', 'townShowJournal', 'townShowLibrary', 'townShowMap', 'townShowMenu', 'townShowGarage', 'townShowHangar', 'townShowBakery'].forEach(function(fn){ if (typeof window[fn] === 'function') tryIt(fn, function(){ window[fn](); }); });
  /* an old save written back and read again is stable */
  tryIt('roundtrip', function(){ Save.write(); var again = GRSave.read(); out.roundtrip = !!again && again.gold >= 500 && typeof again.town === 'object'; });
} catch (e) { out.errs.push('threw: ' + e.message + ' ' + (e.stack || '').split('\n')[1]); }
out.noFails = out.fails.length === 0;
var need = ['loaded', 'town', 'sea', 'gym', 'farm', 'home', 'car', 'plane', 'mini', 'album', 'outfits', 'afterRun', 'roundtrip', 'noFails'];
out.pass = out.errs.length === 0 && need.every(function(k){ return out[k] === true; });
QA.done(out);
