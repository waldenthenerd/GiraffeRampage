/* jukebox: the jukebox in Penny's Café and the song card (js/town/44zzzz-jukebox.js). A song is remembered the first time it plays for real (not
   when it is drawn offline), an older save is given the songs its progress must have played, the save keeps only clean names, every band song
   but the giraffe's own is a record, the jukebox stands in the café and opens its panel, a heard record plays while she is in the café and
   stops when she leaves, a record not heard cannot play, and the song card shows a song's name (once, and not when Song names is off).
   Pictures: --params "view=room" (the café with the jukebox playing) or "view=panel" (the jukebox's list). */
(function(){
  var out = { failed: [], errs: [] }, check = function(k, v){ if (!v) out.failed.push(k); };
  window.addEventListener('error', function(e){ out.errs.push(e.message); });
  GR.handleAction('splash-go'); Ach.check = function(){ return []; };
  var view = QA.params.view || '';
  try {
    Save.reset(); SFX.init(); Music.refresh();
    /* a fresh save: only the menu; the catalogue is every song but the giraffe's tune */
    check('freshMenu', jbHeard().menu === 1 && jbHeardCount() === 1);
    var L = jbCatalog(), ids = L.map(function(r){ return r.id; });
    out.records = L.length;
    check('catalog', ids.indexOf('longneck') < 0 && Object.keys(BAND_SONGS).every(function(k){ return k === 'longneck' || ids.indexOf(k) >= 0; }) && ids.every(function(k){ return !!BAND_SONGS[k]; }));
    /* heard live: remembered; drawn offline: not */
    var c = SFX.ctx; bandBar(Music.R, bandState(), { theme: 'jungle', lvl: 1, tempo: 1, shift: 0 }, { run: true, I: 0.4 }, c.currentTime + 1);
    check('heardLive', jbHeard().jungle === 1);
    var oc = new OfflineAudioContext(2, 4410, 44100); bandBar(bandRig(oc, oc.destination), bandState(), { theme: 'boss7', lvl: 1, tempo: 1, shift: 0 }, { run: false }, 0);
    check('notOffline', !jbHeard().boss7);
    /* the save keeps clean names; an older save (no list) gets what its progress played */
    Save.data.songsHeard = { jungle: 1, 'bad key!': 1, frost: 0, savanna: true }; Save.write(); Save.load();
    out.loaded = Object.keys(Save.data.songsHeard).sort().join();
    check('saveClean', out.loaded === 'jungle,savanna');
    Save.data.songsHeard = undefined; Save.data.chapter3Complete = true; Save.data.runs = 2; Save.write(); Save.load();
    var h = jbHeard(); check('oldSaveSeeded', h.swamp === 1 && h.boss3 === 1 && h.victory === 1 && h.savanna === 1 && h.menu === 1 && !h.boss4);
    /* the café: the jukebox is there and opens its list */
    var jb = TOWN_DIST.in_cafe.b.filter(function(b){ return b.id === 'jukebox'; })[0];
    check('inCafe', !!jb && jb.kind === 'jukebox' && !!IV_KINDS.jukebox);
    G.state = 'menu'; townEnter('in_cafe', 745, 1); Town.fixHour = 12; for (var i = 0; i < 20; i++) GR.step(1 / 30);
    townUse({ k: 'b', b: jb });
    var panel = document.querySelector('.tp-juke'); check('panel', !!panel && panel.querySelectorAll('.jb-r').length === L.length && panel.querySelectorAll('.jb-r.off').length === L.length - jbHeardCount());
    /* a heard record plays in the café; one not heard does not */
    var iSw = ids.indexOf('swamp'), iB9 = ids.indexOf('boss9');
    handleTownAction('town-juke-' + iB9); check('lockedWontPlay', Jukebox.on === null);
    handleTownAction('town-juke-' + iSw); Music.refresh(); out.want = Music.want.theme;
    check('plays', Jukebox.on === 'swamp' && Music.want.theme === 'swamp' && !!document.querySelector('.tp-juke .jb-r.on'));
    if (view === 'room'){ townClosePanel(); Town.x = 600; Town.walkers = []; Town.bannerT = 0; for (var j = 0; j < 90; j++) GR.step(1 / 30); songCard.seen = {}; songCard('swamp'); GR.render(); QA.done(out); return; }
    if (view === 'panel'){ QA.done(out); return; }
    townClosePanel();
    townGo('market', 1200, 1); Music.refresh(); check('stopsOutside', Jukebox.on === null && Music.want.theme !== 'swamp');
    /* the song card: a name, once; not when it is turned off */
    G.state = 'menu'; Settings.songNames = true; songCard.seen = {}; songCard('town');
    var el = document.getElementById('songCard'); out.card = el && el.textContent;
    check('card', !!el && el.classList.contains('on') && /Main Street/.test(el.textContent) && /Longneck Town/.test(el.textContent));
    el.classList.remove('on'); songCard('town'); check('cardOnce', !el.classList.contains('on'));
    Settings.songNames = false; songCard('shop'); check('cardOff', !el.classList.contains('on')); Settings.songNames = true;
    G.state = 'playing'; G.attract = false; songCard('frost'); check('noCardInFight', !el.classList.contains('on'));
  } catch (e){ out.errs.push(String(e && e.stack || e)); }
  out.pass = !out.failed.length && !out.errs.length;
  QA.done(out);
})();
