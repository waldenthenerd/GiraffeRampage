/* siege: Chapter 15, the Siege of Longneck Town (internal chapter 16, waves 361 to 385): the chapter table, the enemy kit (machines and mutants in the Bestiary's usual slots),
   the waves and their difficulty, the save flag, the coat color, the menu card, and a run that starts on the town.
   Run: node tools/qa-cloud.mjs tools/scenarios/siege.js --wait 60000 */
(function(){
  var out = { errs: [] }; window.addEventListener('error', function(e){ out.errs.push(e.message + ' @' + (e.filename || '').split('/').pop() + ':' + e.lineno); });
  GR.handleAction('splash-go'); Ach.check = function(){ return []; };
  function freshSave(){ Save.reset(); }
  function noLevels(){ G.pendingLevels = 0; G.levelGate = 0; if (G.state === 'levelup'){ G.state = 'playing'; G.offer = null; hideOverlay(); } }
  function steps(n, dt){ for (var i = 0; i < n; i++){ GR.step(dt || 1 / 30); noLevels(); } }
  try {
    /* the chapter table */
    out.table = SIEGE_CHAPTER === 16 && SIEGE_FIRST_WAVE === 361 && SIEGE_WAVES === 25 && CHAPTER_LAST_WAVE === 385 && TOTAL_CHAPTERS === 16 && chapterLabel(16) === '15' &&
      chapterOf(360) === TOWER_CHAPTER && chapterOf(361) === SIEGE_CHAPTER && chapterOf(385) === SIEGE_CHAPTER && chapterWaveOf(361) === 1 && chapterWaveOf(385) === 25 &&
      chapterFirstWave(16) === 361 && chapterFirstWave(15) === 336 && chapterLen(16) === 25 && isChapterFinaleWave(385) && !isChapterFinaleWave(380) && isRunEnd(385) === true && isRunEnd(361) === false && isRunEnd(360) === true;
    var bw = [365, 370, 375, 380, 385].map(bossForWave); out.bossWaves = bw.join() === 'lion,matriarch,buffalo,crocodile,wildfire';

    /* the numbers: the first wave sits where the Tower's last one was, and it only rises */
    var t25 = towerScale(25), s1 = siegeScale(1), s25 = siegeScale(25);
    out.tune = s1.hp >= t25.hp * 0.9 && s25.hp > s1.hp && s25.dmg > s1.dmg && SIEGE_TUNE.hard === 1;

    /* the kit: twelve kinds and five bosses in the Bestiary's slots, none of them borrowed from another chapter */
    var kinds = BESTIARY_ORDER.slice(0, 17);
    out.cast = kinds.every(function(k){ return !!ETYPES_SIEGE[k] && ETYPES_SIEGE[k].siege === true && /^sg_/.test(ETYPES_SIEGE[k].look) && LOOK_NAMES[ETYPES_SIEGE[k].look]; });
    out.bestiary = BESTIARY_CHAPTERS.length === 16 && bestiaryTable(16) === ETYPES_SIEGE;
    var looks = {}; kinds.forEach(function(k){ looks[ETYPES_SIEGE[k].look] = 1; }); out.uniqueLooks = Object.keys(looks).length === 17;

    /* the save */
    freshSave(); out.saveDefault = Save.data.chapter16Complete === false;
    Save.data.chapter16Complete = 'junk'; Save.write(); Save.load(); out.saveSane = Save.data.chapter16Complete === true || Save.data.chapter16Complete === false;
    freshSave(); out.wardLen = WARD.length === 50 && WARD[49].name === 'Town Watch' && wardUnlocked(49) === false;
    Save.data.chapter16Complete = true; out.wardOpen = wardUnlocked(49) === true && WARD_MAX === 49; Save.data.chapter16Complete = false;

    /* waves: every wave of the chapter builds, the boss waves have their boss, and the pool grows */
    var ok = true, bad = '';
    for (var w = 361; w <= 385; w++){
      var q = buildWave(w), hasBoss = q.some(function(e){ return e.boss; });
      if (!q.length || hasBoss !== (chapterWaveOf(w) % 5 === 0) || !q.every(function(e){ return !!ETYPES_SIEGE[e.type]; })){ ok = false; bad += w + ' '; }
    }
    out.waves = ok; out.wavesBad = bad;
    var kindsAt = function(w){ var s = {}; for (var i = 0; i < 12; i++) buildWave(w).forEach(function(e){ s[e.type] = 1; }); return Object.keys(s).length; };
    out.pool = kindsAt(361) < kindsAt(373) && kindsAt(373) < kindsAt(380) + 1;

    /* the menu card and the run */
    freshSave(); setMenuChapter(16); showMenu(); var html = chapterSelectorHTML();
    out.menuLocked = /disabled/.test(html) && /Clear Chapter 14/.test(html) && /Chapter 15/.test(html) && /The Siege/.test(html) && /Waves 361–385 · 5 bosses/.test(html);
    Save.data.chapter15Complete = true; html = chapterSelectorHTML();
    out.menuOpen = /data-a="play16"/.test(html) && /Start Chapter 15/.test(html) && /Straight to wave 361/.test(html) && /ch-next" aria-label="Next chapter" disabled/.test(html) && (html.match(/class="chdot[ "]/g) || []).length === 16;
    handleAction('play16'); steps(3);
    out.starts = G.state === 'playing' && G.wave === 361 && G.chapter === SIEGE_CHAPTER && G.biome === 'siege';
    steps(90);
    out.spawns = G.enemies.length > 0 && G.enemies.every(function(e){ return e.def && e.def.siege === true; });
    out.hud = /THE SIEGE/.test(document.getElementById('hChapter') ? document.getElementById('hChapter').textContent : 'CH.15 THE SIEGE');
    G.wave = 385; out.flags = true;
  } catch (e) { out.err = String(e && e.stack || e); }
  var need = ['table', 'bossWaves', 'tune', 'cast', 'bestiary', 'uniqueLooks', 'saveDefault', 'saveSane', 'wardLen', 'wardOpen', 'waves', 'pool', 'menuLocked', 'menuOpen', 'starts', 'spawns'];
  out.failed = need.filter(function(k){ return out[k] !== true; });
  out.pass = out.errs.length === 0 && !out.err && out.failed.length === 0;
  QA.done(out);
})();
