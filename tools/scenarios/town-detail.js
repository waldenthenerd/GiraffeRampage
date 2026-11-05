/* town-detail: nothing hangs across a window, and the town's small life works. For every room whose back wall has windows (townWinXs, with
   TOWN_WIN_AT naming the places in rooms whose walls are busy), the room is painted twice without windows: once whole and once without its wall
   things (townRoomProps: the signs, shelves, boards, pictures and racks). Where the two differ is a wall thing; it may not cover more than a sliver of
   any window's glass. Also: the park's big wheel turns in the behind slot (so Mim's cottage and the flower cart stand in front of it), the FOR SALE
   signs stand on a post, pigeons and gulls lift off when she walks up and come back later, they are gone after dark, and a cat sleeps in the bakery.
   Picture: --params "view=birds" (the Square with its pigeons), "view=cat" (the bakery). */
(function(){
  var out = { failed: [], errs: [], worst: {} }, check = function(k, v){ if (!v) out.failed.push(k); };
  window.addEventListener('error', function(e){ out.errs.push(e.message); });
  GR.handleAction('splash-go'); Ach.check = function(){ return []; };
  var view = QA.params.view || '';
  try {
    Save.data.gold = 1e9; for (var c = 1; c <= 18; c++) Save.data['chapter' + c + 'Complete'] = true;
    /* ---- no wall thing across a window ---- */
    var paint = function(D){ var L = townLayerCanvas(D.w, 600, 1, townPaintField, D); return L.cv.getContext('2d').getImageData(0, 0, L.cv.width, 600).data; };
    var NOWIN = { home: 1, arcade: 1, ilight: 1, gym: 1 }, rooms = 0, bad = [];
    Object.keys(TOWN_DIST).forEach(function(id){
      var D = TOWN_DIST[id]; if (!D.indoor || NOWIN[D.room] || (window.UNI_ROOMS && UNI_ROOMS[D.room])) return;
      var xs = townWinXs(D); if (!xs.length) return;
      window.TOWN_WIN_OFF = true; var full = paint(D), rp = townRoomProps; townRoomProps = function(){};
      var bare; try { bare = paint(D); } finally { townRoomProps = rp; window.TOWN_WIN_OFF = false; }
      rooms++;
      xs.forEach(function(wx, i){
        if (D.room === 'garage' && i % 2) return;                                                       /* the garage skips every other window */
        var n = 0, tot = 0;
        for (var y = 84; y < 196; y += 2) for (var x = Math.round(wx) + 2; x < wx + 76; x += 2){
          var k = (y * D.w + x) * 4; tot++;
          if (Math.max(Math.abs(full[k] - bare[k]), Math.abs(full[k + 1] - bare[k + 1]), Math.abs(full[k + 2] - bare[k + 2])) > 40) n++;
        }
        var f = n / tot; out.worst[id + '@' + Math.round(wx)] = +f.toFixed(3);
        if (f > 0.08) bad.push(id + '@' + Math.round(wx) + ':' + f.toFixed(2));
      });
    });
    out.roomsChecked = rooms; out.covered = bad;
    check('roomsChecked', rooms >= 15); check('windowsClear', bad.length === 0);
    /* a window list can name a room's places, and an empty one means no windows */
    check('winAt', townWinXs(TOWN_DIST.in_tailor).length === 0 && townWinXs(TOWN_DIST.in_cafe).join() === '220,487');
    /* ---- the big wheel turns behind the cottage ---- */
    check('parkBehind', TOWN_DIST.park.behind === true && typeof townFerris === 'function');
    var calls = 0, tf = townFerris; townFerris = function(){ calls++; return tf.apply(this, arguments); };
    var hold = document.createElement('canvas').getContext('2d');
    townDynamicBehind(hold, TOWN_DIST.park, 1, 0); var inBehind = calls; townDynamic(hold, TOWN_DIST.park, 1, 0);
    townFerris = tf; check('wheelInBehindSlot', inBehind === 1 && calls === 1);
    check('forSale', typeof townForSale === 'function');
    /* ---- birds: up when she comes, back later; roosting after dark ---- */
    G.state = 'menu'; Town.fixHour = 12; Town.fixWeather = 'clear'; townEnter('square', 200, 1); for (var i = 0; i < 10; i++) GR.step(1 / 30);
    Town._birds = {}; var drawn = 0, tb = townBird; townBird = function(){ drawn++; return tb.apply(this, arguments); };
    Town.x = 300; Town.camX = 400; townDynamic(hold, TOWN_DIST.square, 50, 0); out.birdsDrawn = drawn; check('birdsPeck', drawn >= 3 && Town._birds.square0 && Town._birds.square0.up < 0);
    Town.x = 880; townDynamic(hold, TOWN_DIST.square, 60, 0); check('birdsLift', Town._birds.square0.up === 60);
    drawn = 0; Town.x = 300; townDynamic(hold, TOWN_DIST.square, 66, 0); var away = drawn;
    townDynamic(hold, TOWN_DIST.square, 74, 0); townDynamic(hold, TOWN_DIST.square, 80, 0); check('birdsBack', Town._birds.square0.up < 0 && away < 8);
    drawn = 0; townDynamic(hold, TOWN_DIST.square, 90, 0.9); check('birdsRoost', drawn === 0);
    townBird = tb;
    /* ---- a cat asleep in the bakery ---- */
    var cats = 0, tc = townCat; townCat = function(){ cats++; return tc.apply(this, arguments); };
    townDynamic(hold, TOWN_DIST.in_bakery, 5, 0); townDynamic(hold, TOWN_DIST.square, 5, 0); townCat = tc;
    check('cat', cats === 1);
    if (view === 'birds'){ Town._birds = {}; townEnter('square', 640, 1); Town.walkers = []; for (var j = 0; j < 20; j++) GR.step(1 / 30); Town.x = 640; Town.camX = 420; GR.render(); }
    if (view === 'cat'){ townEnter('in_bakery', 900, 1); Town.walkers = []; for (var q = 0; q < 20; q++) GR.step(1 / 30); GR.render(); }
  } catch (e) { out.errs.push(String(e && e.stack || e)); }
  out.pass = !out.failed.length && !out.errs.length;
  QA.done(out);
})();
