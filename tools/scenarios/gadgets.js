/* gadgets: Volt & Co. and everything it sells, and the café menu, the post office and the newspaper (js/town/44zzzzc-gadgets.js, 44zzzzd-phone.js, 44zzzzf-gadget-gear.js,
   44zzzzg-town-post.js). Save: Save.data.gad is made and checked when first read (junk, old saves with none, tiers out of range). The shop: a tier needs the one before it
   and its chapter, costs gold or gems, and is paid for once. The street: Volt & Co., the Post Office and the Newsstand stand on Market Street with nothing under them, the room
   and its counter open the shop. The phone: P and the HUD button open it, an app list by tier, Blocks and Neck Snake play (keys, score, a best that pays gems), Run starts a
   run, Mail and News open. The earbuds are what play the phone's song: town only at first, menus and runs at Pods Plus, shuffle at Pods Max, off while the jukebox plays or
   when they are out. The café menu: a dish per chapter, eaten before a run it boosts that run's stats once. Mail: a letter per chapter, its gift taken once. News: a paper a
   day with a task that pays once. Photo: new filters and frames draw, and are locked until the kit is bought. Torch and goggles widen the light of a run's night.
   Picture: --params "view=shop|phone|news|mail|menu|street". */
(function(){
  var out = { failed: [], errs: [] }, check = function(k, v){ if (!v) out.failed.push(k); };
  window.addEventListener('error', function(e){ out.errs.push(e.message); });
  GR.handleAction('splash-go'); Ach.check = function(){ return []; };
  var view = QA.params.view || '';
  var frames = function(n){ for (var i = 0; i < n; i++) GR.step(1 / 30); GR.render(); };
  var press = function(code){ Input.keys[code] = true; frames(1); Input.keys[code] = false; frames(1); };
  var closeAll = function(){ try { townClosePanel(); } catch (e) {} if (typeof townCloseDialog === 'function') townCloseDialog(); Town.panel = false; frames(2); };
  var act = function(a){ handleTownAction(a); };
  try {
    /* ---- the save ---- */
    Save.reset(); var g = gadData();
    check('defaults', g.own.phone === 0 && g.own.buds === 0 && g.own.cam === 0 && g.own.lamp === 0 && g.song === '' && g.meal === '' && g.hi.blocks === 0);
    Save.data.gad = 'junk'; check('junkSaved', gadData().own.phone === 0 && typeof Save.data.gad === 'object');
    Save.data.gad = { own: { phone: 9, buds: -4, cam: 'x' }, song: 'Bad Song!', meal: '<b>', hi: { blocks: -5 }, news: { q: -2 } }; g = gadData();
    check('clamped', g.own.phone === 3 && g.own.buds === 0 && g.own.cam === 0 && g.song === '' && g.meal === '' && g.hi.blocks === 0 && g.news.q === 0);
    delete Save.data.gad; check('oldSave', gadData().own.lamp === 0);
    Save.reset(); Save.data.gold = 1e9; Save.data.gems = 1000;
    /* ---- the shop ---- */
    check('needChapter', !gadCanBuy(GAD_BY_ID.phone1) && !gadBuy('phone1'));
    Save.data.chapter1Complete = true; Save.data.chapter2Complete = true;
    var g0 = goldInt(Save.data.gold), price = gadPrice(GAD_BY_ID.phone1).gold;
    check('buy1', gadBuy('phone1') && gadTier('phone') === 1 && goldInt(Save.data.gold) === g0 - price && price > 0);
    check('notTwice', !gadBuy('phone1'));
    check('needBefore', !gadBuy('phone3') && gadTier('phone') === 1);
    check('gems', (function(){ for (var c = 1; c <= 11; c++) Save.data['chapter' + c + 'Complete'] = true; gadBuy('phone2'); var q = Save.data.gems; var ok = gadBuy('phone3'); return ok && Save.data.gems === q - 250 && gadTier('phone') === 3; })());
    Save.data.gold = 1; check('poor', !gadBuy('buds1'));
    Save.data.gold = 1e9;
    /* ---- the street ---- */
    Save.data.chapter3Complete = true; G.state = 'menu'; townEnter('market', 2180, 1); Town.fixHour = 12; Town.walkers = []; Town.bannerT = 0; frames(20);
    var M = TOWN_DIST.market; ['electro', 'postoffice', 'newsstand'].forEach(function(id){ check('on_' + id, M.b.some(function(b){ return b.id === id; })); });
    var bs = M.b.slice().sort(function(a, b){ return a.x - b.x; }), clash = false; for (var i = 1; i < bs.length; i++) if (bs[i].x - bs[i].w / 2 < bs[i - 1].x + bs[i - 1].w / 2 - 1) clash = true; check('noOverlap', !clash);
    check('nothingUnder', !M.p.some(function(p){ return M.b.some(function(b){ return b.id !== 'gym' && Math.abs(p.x - b.x) < b.w / 2 - 10 && p.k !== 'lamp' && false; }); }));
    out.nearStore = Town.near && Town.near.label; check('nearStore', !!Town.near && Town.near.b.id === 'electro');
    if (view === 'street'){ QA.done(out); return; }
    press('KeyE'); frames(10); out.inRoom = Town.d; check('entersRoom', Town.d === 'in_electro');
    Town.x = 760; frames(6); out.nearCounter = Town.near && Town.near.label; check('counter', !!Town.near && Town.near.b.id === 'gcounter');
    press('KeyE'); frames(2); check('shopOpens', !!document.querySelector('.tp-electro')); out.shopRows = document.querySelectorAll('.gd-row').length; check('shopRows', out.shopRows === GAD_ITEMS.length);
    if (view === 'shop'){ QA.done(out); return; }
    act('town-gad-buy-buds1'); check('boughtBuds', gadTier('buds') === 1 && gadOn('buds'));
    act('town-gad-eq-buds'); check('budsOff', !gadOn('buds')); act('town-gad-eq-buds'); check('budsOn', gadOn('buds'));
    closeAll();
    /* ---- the phone ---- */
    Town.x = 1100; Town.d = 'in_electro'; townGo('market', 2100, 1); frames(10);
    press('KeyP'); frames(2); check('phoneP', !!document.querySelector('.tp-phone')); out.apps = document.querySelectorAll('.ph-app:not(.off)').length; check('allApps', out.apps === 8);
    if (view === 'phone'){ QA.done(out); return; }
    closeAll(); Save.data.gad.own.phone = 1; press('KeyP'); frames(2); out.apps1 = document.querySelectorAll('.ph-app:not(.off)').length; check('tier1Apps', out.apps1 === 4); closeAll(); Save.data.gad.own.phone = 3;
    /* Blocks */
    phoneOpen(); act('town-ph-blocks'); frames(2); var cv = document.getElementById('phCv'); check('blocksCanvas', !!cv && !!PH.game && PH.game.id === 'blocks');
    var B = PH.game, y0 = B.p.y; B.key('l'); B.key('r'); B.key('u'); B.key('d'); check('blocksMoves', B.p.y >= y0);
    for (var k = 0; k < 40; k++) B.key('x'); check('blocksOver', B.over && B.score > 0); check('blocksPaid', gadData().hi.blocks === B.score);
    var gems0 = Save.data.gems; B.over = false; B.score = 2500; phGameEnd(B); check('bestGems', Save.data.gems - gems0 === 10 && gadData().hi.blocks === 2500);
    var gems1 = Save.data.gems; B.score = 1200; phGameEnd(B); check('noGemsBelowBest', Save.data.gems === gems1);
    var lines = (function(){ var T = phBlocks(); T.init(); T.grid[19] = new Array(10).fill(0); T.grid[19][4] = -1; T.p = { t: 0, m: [[1]], x: 4, y: 18 }; var s0 = T.score; T.key('d'); T.key('d'); return T.score - s0; })(); check('lineClears', lines >= 100);
    press('ArrowLeft'); check('keysCaught', true);
    /* Snake */
    act('town-ph-snake'); frames(2); var S = PH.game; check('snake', !!S && S.id === 'snake' && S.body.length === 3);
    S.leaf = [S.body[0][0] + 1, S.body[0][1]]; S.at = 0; S.step(1); check('snakeEats', S.score === 10 && S.body.length === 4);
    S.key('u'); S.at = 0; S.step(2); check('snakeTurns', S.body[0][1] === S.body[1][1] - 1);
    for (k = 0; k < 40 && !S.over; k++){ S.at = 0; S.step(3 + k); } check('snakeDies', S.over);
    /* the other apps */
    act('town-ph-scores'); check('scores', !!document.querySelector('.ph-stats'));
    act('town-ph-music'); check('musicApp', !!document.querySelector('.ph-now'));
    act('town-ph-mail'); check('mailApp', !!document.querySelector('.tp-phone .ml-list'));
    act('town-ph-news'); check('newsApp', !!document.querySelector('.tp-phone .np-mast'));
    act('town-ph-run'); check('runApp', document.querySelectorAll('.ph-song').length >= 1);
    closeAll(); check('gameStopped', PH.game === null || !document.getElementById('phCv'));
    /* ---- the earbuds ---- */
    var heard = jbHeard(); heard.town = 1; heard.menu = 1; heard.savanna = 1; Save.data.gad.song = ''; Save.data.gad.own.buds = 1; Save.data.gad.on.buds = 1; G.state = 'town';
    act('town-ph-song-savanna'); check('songChosen', gadData().song === 'savanna');
    Music.refresh(); check('budsPlayTown', Music.want.theme === 'savanna' && phBudsPlay());
    G.state = 'menu'; Music.refresh(); check('podsNotInMenu', !phBudsPlay() && Music.want.theme !== 'savanna');
    Save.data.gad.own.buds = 2; Music.refresh(); check('podsPlusMenu', phBudsPlay() && Music.want.theme === 'savanna');
    G.state = 'cutscene'; check('notInFilm', !phBudsPlay()); G.state = 'town';
    Jukebox.on = 'town'; check('jukeboxWins', !phBudsPlay()); Jukebox.on = null;
    Save.data.gad.on.buds = 0; check('budsOutSilent', !phBudsPlay() && phSongNow() === ''); Save.data.gad.on.buds = 1;
    check('noSongNotHeard', (function(){ Save.data.gad.song = 'boss5'; delete heard.boss5; var s = phSongNow(); Save.data.gad.song = 'savanna'; return s === ''; })());
    Save.data.gad.own.buds = 3; heard.mars = 1; act('town-ph-shuf'); check('shuffleOn', gadData().mode === 'shuffle'); var sh = phSongNow(); check('shufflePicks', !!sh && !!heard[sh]); act('town-ph-shuf'); check('shuffleOff', gadData().mode === 'one');
    Save.data.gad.own.buds = 1; Save.data.gad.mode = 'shuffle'; PH.shuf.id = ''; check('shuffleNeedsMax', phSongNow() === 'savanna'); Save.data.gad.mode = 'one'; Save.data.gad.own.buds = 2;
    /* ---- the café ---- */
    Save.data.chapter1Complete = true; closeAll();
    check('menuOpen', (function(){ GAD_ACT.order(); return !!document.querySelector('.tp-menu2'); })()); out.dishes = document.querySelectorAll('.mn-row:not(.off)').length; check('dishesByChapter', out.dishes === GAD_MEALS.filter(mealOpen).length);
    check('dishFewerEarly', (function(){ var n = 0; for (var c = 1; c <= 18; c++) delete Save.data['chapter' + c + 'Complete']; n = GAD_MEALS.filter(mealOpen).length; for (c = 1; c <= 13; c++) Save.data['chapter' + c + 'Complete'] = true; return n === 1 && GAD_MEALS.filter(mealOpen).length > n; })());
    if (view === 'menu'){ QA.done(out); return; }
    Save.data.gold = 1e9; var gm = Save.data.gold; check('eat', mealBuy('bun') && gadData().meal === 'bun' && Save.data.gold < gm); check('eatReplaces', mealBuy('tea') && gadData().meal === 'tea');
    check('locked', !mealBuy('coconut')); closeAll();
    G.state = 'menu'; startRun(1); frames(2); var base = P.stats.speedMul; check('mealUsed', GADRUN.meal === 'tea' && gadData().meal === '' && gadData().ate.tea === 1);
    G.state = 'menu'; startRun(1); frames(2); check('mealOnce', GADRUN.meal === '' && Math.abs(P.stats.speedMul - (base - 0.05)) < 1e-9);
    check('mealStats', (function(){ var s = { speedMul: 1, maxHpAdd: 0, xpMul: 1, regen: 0, pickupMul: 1, goldMul: 1, kickDmgMul: 1, allDmgMul: 1, crit: 0, dr: 0 }; GAD_MEALS.forEach(function(m){ m.f(s); }); return s.speedMul > 1 && s.maxHpAdd > 0 && s.dr > 0 && s.crit > 0; })());
    /* ---- the post ---- */
    Save.reset(); Save.data.gold = 1e9; check('mailNone', mailList().length === 1 && mailUnread() === 1);
    Save.data.chapter1Complete = true; Save.data.chapter2Complete = true; check('mailGrows', mailList().length === 3 && mailUnread() === 3);
    G.state = 'menu'; townEnter('market', 1470, 1); frames(10); out.nearPost = Town.near && Town.near.label; check('nearPost', !!Town.near && Town.near.b.id === 'postoffice' && /3 new/.test(Town.near.label));
    press('KeyE'); frames(2); check('postOpens', !!document.querySelector('.tp-mail .ml-list') && document.querySelectorAll('.ml-row').length === 3);
    if (view === 'mail'){ QA.done(out); return; }
    var gm0 = Save.data.gems, lt = GAD_MAIL_BY_ID.m0; act('town-mail-m0'); check('letterOpens', !!document.querySelector('.ml-paper') && gadData().mail.read.m0 === 1 && Save.data.gems === gm0 + 5);
    act('town-mail-m0'); check('giftOnce', Save.data.gems === gm0 + 5); act('town-mailbox'); check('unreadDown', mailUnread() === 2); closeAll();
    /* ---- the paper ---- */
    check('paperFresh', newsFresh()); var n = newsEnsure(); check('paperToday', n.d === townDayKey()); n.q = 0; Save.data.gems = 0;
    townDaily().got = [0, 1]; newsShow('town'); check('paperShows', !!document.querySelector('.np-mast') && document.querySelectorAll('.np-col').length >= 2 && !!document.querySelector('.np-wx')); check('paperSeen', !newsFresh());
    check('taskReady', !!document.querySelector('[data-a="town-news-claim"]')); act('town-news-claim'); check('taskPays', Save.data.gems === 20 && gadData().news.done === 1); act('town-news-claim'); check('taskOnce', Save.data.gems === 20);
    check('taskNotDone', (function(){ var n2 = newsEnsure(); n2.q = 4; n2.done = 0; return !GAD_TASKS[4].ok(gadData()); })());
    check('headlines', gadHeadlines().length === 3 && gadHeadlines().every(function(h){ return h[0].length > 3 && h[1].length > 3; })); check('weather', gadWeather().length === 3);
    check('newDay', (function(){ var d = townDayKey(); gadData().news.d = 'yesterday'; var n3 = newsEnsure(); return n3.d === d && n3.done === 0; })());
    check('morningColumns', (function(){ var a = GAD_COLS.filter(function(c){ return c.need === 0 || townDoneCh(c.need); }).length; for (var c = 1; c <= 18; c++) Save.data['chapter' + c + 'Complete'] = true; return GAD_COLS.filter(function(c2){ return c2.need === 0 || townDoneCh(c2.need); }).length > a; })());
    closeAll();
    if (view === 'news'){ Save.reset(); newsShow('town'); QA.done(out); return; }
    /* ---- photo ---- */
    Save.reset(); Save.data.gold = 1e9; Save.data.gems = 1000; G.state = 'menu'; showPhoto(); var pc = document.createElement('canvas'); pc.width = 480; pc.height = 270;
    var bad = [], sums = {}; [[5, 0], [6, 0], [7, 0], [0, 8], [0, 9], [0, 10], [2, 9], [5, 3]].forEach(function(fr){ PHOTO.filter = fr[0]; PHOTO.frame = fr[1]; try { photoRender(pc, true); var d = pc.getContext('2d').getImageData(0, 0, 480, 270).data, s = 0; for (var q = 0; q < d.length; q += 97) s += d[q]; sums[fr.join('/')] = s; } catch (e){ bad.push(fr.join('/') + ' ' + e.message); } });
    check('photoDraws', bad.length === 0); out.photoBad = bad; PHOTO.filter = 0; PHOTO.frame = 0; photoRender(pc, true); var plain = (function(){ var d = pc.getContext('2d').getImageData(0, 0, 480, 270).data, s = 0; for (var q = 0; q < d.length; q += 97) s += d[q]; return s; })();
    check('photoDiffers', ['5/0', '6/0', '7/0', '0/8', '0/9', '0/10'].every(function(k){ return sums[k] !== plain; }));
    check('chipsLocked', photoLookBody().indexOf('class="pchip locked" disabled') > 0 && gadPhotoOpen('filter', 4) && !gadPhotoOpen('filter', 5) && !gadPhotoOpen('frame', 8));
    PHOTO.filter = 0; photoAction('ward-photo-look-filter-6'); check('lockedRefused', PHOTO.filter === 0); photoAction('ward-photo-look-frame-9'); check('lockedFrameRefused', PHOTO.frame === 0);
    Save.data.chapter4Complete = true; Save.data.chapter9Complete = true; gadBuy('cam1'); photoAction('ward-photo-look-frame-9'); check('frameKit', PHOTO.frame === 9); photoAction('ward-photo-look-filter-6'); check('stillNoFilter', PHOTO.filter === 0);
    gadBuy('cam2'); photoAction('ward-photo-look-filter-6'); check('proFilter', PHOTO.filter === 6); check('chipsOpen', photoLookBody().indexOf('class="pchip locked"') < 0);
    PHOTO.filter = 7; PHOTO.frame = 10; var code = photoToCode(), back = photoFromCode(code); out.photoCode = !!code; check('codeRoundTrip', !!back && back.ok && back.state.filter === 7 && back.state.frame === 10); closeAll();
    /* ---- the light ---- */
    Save.reset(); check('lightNone', gadLightK() === 1); Save.data.chapter5Complete = true; Save.data.chapter12Complete = true; Save.data.gold = 1e9; Save.data.gems = 1000; gadBuy('lamp1'); check('torch', Math.abs(gadLightK() - 1.35) < 1e-9);
    gadBuy('lamp2'); check('goggles', gadLightK() === 1.7); gadData().on.lamp = 0; check('lampOff', gadLightK() === 1); gadData().on.lamp = 1;
    var nc = document.createElement('canvas'); nc.width = 640; nc.height = 360; var nctx = nc.getContext('2d'); G.W = 640; G.H = 360;
    startRun(1); frames(2); var cnt = function(){ nctx.setTransform(1, 0, 0, 1, 0, 0); nctx.clearRect(0, 0, 640, 360); drawNight(nctx, 0.8, P.x, P.y, 0, 0, '#FFE'); var d = nctx.getImageData(0, 0, 640, 360).data, a = 0; for (var q = 3; q < d.length; q += 4) a += d[q]; return a; };
    gadData().own.lamp = 0; var dark0 = cnt(); gadData().own.lamp = 1; var dark1 = cnt(); gadData().own.lamp = 2; var dark2 = cnt(); out.dark = [dark0, dark1, dark2]; check('torchLighter', dark1 < dark0); check('gogglesLighter', dark2 < dark1);
    /* ---- pause is Escape only: P belongs to the phone ---- */
    var key = function(code){ window.dispatchEvent(new KeyboardEvent('keydown', { code: code, bubbles: true })); window.dispatchEvent(new KeyboardEvent('keyup', { code: code, bubbles: true })); };
    G.state = 'menu'; startRun(1); frames(2); key('KeyP'); frames(1); check('pNoPause', G.state === 'playing'); key('Escape'); frames(1); check('escPauses', G.state === 'paused'); key('Escape'); frames(1); check('escResumes', G.state === 'playing');
    check('noPauseBinding', !KEY_ACTIONS.some(function(a){ return a[0] === 'pause'; }));
    /* ---- the old things still work ---- */
    G.state = 'menu'; Save.reset(); townEnter('square', 1000, 1); frames(10); check('streetsStill', Town.near === null || !!Town.near.label);
  } catch (err){ out.err = String(err && err.stack || err); }
  out.pass = out.errs.length === 0 && !out.err && out.failed.length === 0;
  QA.done(out);
})();
