/* late-polish: what the chapters after 13 were missing. Coat patterns 14 to 17 (one each for the Domes, the Tower, the Siege and Fort Shortneck: locked until the chapter, drawn,
   saved in outfits and carried in a photo code by the escape value), the wardrobe counts, five more photo backdrops (added at the end, so old codes still mean what they did), and
   the minigames after the Domes, the Siege and the Fort (their popups, the way on being "See the results", three stars and the coat colors 53 to 55).
   Run: node tools/qa-cloud.mjs tools/scenarios/late-polish.js --wait 60000 [--shot x.png --params "view=pat|bg|dome|sandbag|sneak"] */
(function(){
  var out = { errs: [] }; window.addEventListener('error', function(e){ out.errs.push(e.message + ' @' + (e.filename || '').split('/').pop() + ':' + e.lineno); });
  GR.handleAction('splash-go'); var realCheck = Ach.check; Ach.check = function(){ return []; };
  function steps(n, dt){ for (var i = 0; i < n; i++){ GR.step(dt || 1 / 30); G.pendingLevels = 0; G.levelGate = 0; } }
  try {
    /* patterns */
    Save.reset(); out.patLocked = !wardPatUnlocked(14) && !wardPatUnlocked(17) && wardPatUnlocked(0) && wardPatCount() === 0;
    Save.data.chapter14Complete = true; Save.data.chapter16Complete = true; out.patOpen = wardPatUnlocked(14) && wardPatUnlocked(16) && !wardPatUnlocked(15) && !wardPatUnlocked(17) && wardPatCount() === 2;
    Save.data.patCol = 16; out.patChoice = wardChoice('patCol') === 16 && giraffePattern() === 16; Save.data.patCol = 15; out.patLockedChoice = wardChoice('patCol') === 0; Save.data.patCol = 99; out.patSane = wardChoice('patCol') === 0; Save.data.patCol = 0;
    var cv = document.createElement('canvas'); cv.width = 60; cv.height = 60; var cx = cv.getContext('2d'), inks = 0;
    for (var pt = 1; pt <= WARD_PAT_MAX; pt++){ cx.clearRect(0, 0, 60, 60); cx.fillStyle = '#fff'; wardSpot(cx, pt, 30, 30, 12, 10, 0.3); var d0 = cx.getImageData(0, 0, 60, 60).data, k = 0; for (var q = 3; q < d0.length; q += 4) if (d0[q]) k++; if (k > 20) inks++; }
    out.patDraw = inks === WARD_PAT_MAX && WARD_PATTERNS.length === 18;
    ['chapter14Complete', 'chapter15Complete', 'chapter16Complete', 'chapter17Complete'].forEach(function(k){ Save.data[k] = true; }); out.patAll = wardPatCount() === 4 && wardPatUnlocked(17) && wardPatUnlocked(15);
    for (var cc = 1; cc <= 13; cc++) Save.data['chapter' + cc + 'Complete'] = true; out.patCount = wardPatCount() === 17;
    out.btn = /of 17 patterns unlocked/.test(wardrobeButtonHTML()) && /colors and /.test(wardrobeButtonHTML()) && !/of 13 colors/.test(wardrobeButtonHTML());
    Save.data.patCol = 17; showWardrobe(); out.pageSwatches = document.querySelectorAll('[data-a^="ward-pat-"]').length === 18 && !document.querySelector('[data-a="ward-pat-17"]').disabled;
    GR.handleAction('ward-pat-14'); out.pick = Save.data.patCol === 14; Save.data.chapter14Complete = false; GR.handleAction('ward-pat-14'); GR.handleAction('ward-pat-17'); out.pickLocked = Save.data.patCol === 17; Save.data.chapter14Complete = true;
    var oc = outfitClean({ s: 0, p: 0, t: 15, g: 0, hat: '', boot: '', hc: 0, bc: 0 }); out.outfit = oc && oc.t === 15; Save.data.chapter15Complete = false; oc = outfitClean({ t: 15 }); out.outfitLocked = oc && oc.t === 0; Save.data.chapter15Complete = true;
    hideOverlay(); G.state = 'menu';

    /* the photo code: patterns up to 13 use 4 bits as before, 15 and up an escape and 3 more bits */
    var base = { v: 1, bg: 23, pose: 0, flip: false, giraffe: { x: 400, y: 300, s: 1 }, items: [], look: { skin: 5, spots: 0, pattern: 16, gear: 0, hat: '', boots: '', hatColour: 0, bootColour: 0 } };
    var u1 = photoUnpack(photoPack(base)); out.codeLate = u1.look.pattern === 16 && u1.bg === 23 && u1.look.skin === 5;
    base.look.pattern = 13; var u2 = photoUnpack(photoPack(base)); out.codeOld = u2.look.pattern === 13 && u2.look.skin === 5;
    base.look.pattern = 14; var u3 = photoUnpack(photoPack(base)); out.code14 = u3.look.pattern === 14;
    base.look.pattern = 17; base.items = [{ type: 'fx', id: PHOTO_FX[0][0], x: 10, y: 20, scale: 1, flip: false, tilt: 0 }]; var u4 = photoUnpack(photoPack(base)); out.codeItems = u4.look.pattern === 17 && u4.items.length === 1 && u4.items[0].x === 10;

    /* the backdrops: five at the end, all drawn */
    out.bgCount = PHOTO_BG.length === 26 && PHOTO_BG[21] === 'The Domes' && PHOTO_BG[25] === 'Her Camp' && PHOTO_SUN.length === PHOTO_BG.length && PHOTO_BG[20] === 'Autumn forest';
    var bc = document.createElement('canvas'); bc.width = 960; bc.height = 540; var bx = bc.getContext('2d'), bgOk = 0;
    for (var bi = 21; bi <= 25; bi++){ bx.clearRect(0, 0, 960, 540); photoBackdrop(bx, 960, 540, bi); var px = bx.getImageData(480, 270, 1, 1).data, py = bx.getImageData(10, 530, 1, 1).data; if (px[3] === 255 && py[3] === 255) bgOk++; }
    out.bgDraw = bgOk === 5;

    /* the minigames: Slide Dome, Sandbag Run, Searchlight Sneak */
    Save.reset(); out.miniDefs = MINI[DOME_CHAPTER].name === 'Slide Dome' && MINI[SIEGE_CHAPTER].name === 'Sandbag Run' && MINI[COUNTER_CHAPTER].name === 'Searchlight Sneak' && [DOME_CHAPTER, SIEGE_CHAPTER, COUNTER_CHAPTER].every(function(c){ return typeof MINI[c].draw === 'function' && MINI_STAR[c].t.length === 2 && MINI_STAR_CHAPTERS.indexOf(c) >= 0; });
    out.miniLocked = !miniUnlocked(DOME_CHAPTER) && !miniUnlocked(SIEGE_CHAPTER); Save.data.chapter14Complete = Save.data.chapter16Complete = Save.data.chapter17Complete = true; out.miniOpen = miniUnlocked(DOME_CHAPTER) && miniUnlocked(SIEGE_CHAPTER) && miniUnlocked(COUNTER_CHAPTER);
    out.endsRun = miniEndsRun(DOME_CHAPTER) && miniEndsRun(SIEGE_CHAPTER) && miniEndsRun(COUNTER_CHAPTER) && miniEndsRun(TOWER_CHAPTER) && !miniEndsRun(13);
    G.attract = false; var offered = miniOffer(SIEGE_CHAPTER, function(){}); out.offer = offered && G.state === 'miniask' && /Sandbag Run/.test(OV.textContent) && /See the results/.test(OV.textContent) && /Chapter 15/.test(OV.textContent); hideOverlay(); G.state = 'menu';
    var md = miniData(); md.last = 0;
    /* Slide Dome */
    out.domeStart = startMini(DOME_CHAPTER, null, 'menu') && G.state === 'mini'; var dm = G.mini; dm.phase = 'play'; md.last = 0; steps(20); var dg = miniGeom();
    out.domeSet = dm.lives === 3 && dm.shards.length === 3 && dm.wisps.length === 3;
    dm.p.x = dm.shards[0].x; dm.p.y = dm.shards[0].y; steps(1); out.domeShard = dm.score === 1 && dm.shards.length === 3;
    dm.inv = 0; var w0 = dm.wisps[0]; dm.p.x = w0.x; dm.p.y = w0.y; var lv = dm.lives; steps(1); out.domeHit = dm.lives === lv - 1;
    dm.score = 20; dm.over = true; steps(2); out.domeStars = (Save.data.mini.stars[DOME_CHAPTER] | 0) === 3 && wardUnlocked(53) && WARD[53].name === 'Dome Opal';
    G.state = 'menu'; G.mini = null;
    /* Sandbag Run */
    Save.data.mini.last = 0; out.sandStart = startMini(SIEGE_CHAPTER, null, 'menu') && G.state === 'mini'; var sm = G.mini; sm.phase = 'play'; steps(40); var sg = miniGeom();
    var open0 = sm.crack.filter(function(v){ return v > 0; }).length; out.sandCracks = open0 >= 1 && sm.crack.length === 5;
    sm.p.x = sg.W / 2; sm.p.y = sg.H * 0.9; steps(1); out.sandBag = sm.carry === true;
    var slot = sm.crack.findIndex(function(v){ return v > 0; }); sm.p.x = sg.W * (0.12 + slot * 0.19); sm.p.y = sg.H * 0.3; steps(1); out.sandPlug = sm.score === 1 && sm.carry === false && sm.crack[slot] === 0;
    sm.crack[slot] = 7.99; steps(3); out.sandBurst = sm.lives === 2;
    sm.score = 24; sm.over = true; steps(2); out.sandStars = (Save.data.mini.stars[SIEGE_CHAPTER] | 0) === 3 && wardUnlocked(54);
    G.state = 'menu'; G.mini = null;
    /* Searchlight Sneak */
    Save.data.mini.last = 0; out.sneakStart = startMini(COUNTER_CHAPTER, null, 'menu') && G.state === 'mini'; var nm = G.mini; nm.phase = 'play'; steps(5); var ng = miniGeom();
    var T = SNEAK_SPOTS[nm.term]; nm.p.x = ng.W * T[0]; nm.p.y = ng.H * T[1]; nm.beam[0].a = 5; nm.beam[1].a = 5; steps(40); out.sneakHack = nm.score === 1;
    nm.inv = 0; nm.beam[0].a = Math.atan2(nm.p.y - ng.H * 0.14, nm.p.x - ng.W * 0.08); nm.beam[0].d = 0; var lv2 = nm.lives; steps(1); out.sneakSpotted = nm.lives === lv2 - 1;
    nm.score = 16; nm.over = true; steps(2); out.sneakStars = (Save.data.mini.stars[COUNTER_CHAPTER] | 0) === 3 && wardUnlocked(55) && WARD[55].name === 'Hazard Yellow';
    G.state = 'menu'; G.mini = null;
    out.starTotals = MINI_STAR_CHAPTERS.length === 17 && miniStarTotal() >= 9;
    var lab = (function(){ Save.reset(); Save.data.chapter14Complete = true; showWardrobe(); var t = (document.querySelector('[data-a="ward-skin-53"]') || {}).title || ''; var t2 = (document.querySelector('[data-a="ward-skin-51"]') || {}).title || ''; hideOverlay(); G.state = 'menu'; return t + '|' + t2; })();
    out.labels = /Get three stars in Slide Dome/.test(lab) && /Finish Chapter 16/.test(lab);

    /* the pictures */
    var V = QA.params.view || '';
    if (V === 'pat'){ Save.reset(); for (var c2 = 1; c2 <= 17; c2++) Save.data['chapter' + c2 + 'Complete'] = true; Save.data.skinCol = 6; Save.data.spotCol = 4; Save.data.patCol = +(QA.params.pat || 16); showWardrobe(); }
    else if (V === 'bg'){ Save.reset(); G.state = 'menu'; PHOTO.bg = +(QA.params.bg || 21); GR.handleAction('ward-photo'); }
    else if (V === 'dome' || V === 'sandbag' || V === 'sneak'){ Save.reset(); Save.data.mini = { own: {}, best: {}, stars: {}, last: 0, plays: 0, hat: '', boot: '' }; startMini(V === 'dome' ? DOME_CHAPTER : V === 'sandbag' ? SIEGE_CHAPTER : COUNTER_CHAPTER, null, 'menu'); G.mini.phase = 'play'; steps(+(QA.params.n || 70)); }
  } catch (e) { out.err = String(e && e.stack || e); }
  var need = ['patLocked', 'patOpen', 'patChoice', 'patLockedChoice', 'patSane', 'patDraw', 'patAll', 'patCount', 'btn', 'pageSwatches', 'pick', 'pickLocked', 'outfit', 'outfitLocked', 'codeLate', 'codeOld', 'code14', 'codeItems',
    'bgCount', 'bgDraw', 'miniDefs', 'miniLocked', 'miniOpen', 'endsRun', 'offer', 'domeStart', 'domeSet', 'domeShard', 'domeHit', 'domeStars', 'sandStart', 'sandCracks', 'sandBag', 'sandPlug', 'sandBurst', 'sandStars', 'sneakStart', 'sneakHack', 'sneakSpotted', 'sneakStars', 'starTotals', 'labels'];
  out.failed = need.filter(function(k){ return out[k] !== true; });
  out.pass = out.errs.length === 0 && !out.err && out.failed.length === 0;
  QA.done(out);
})()
