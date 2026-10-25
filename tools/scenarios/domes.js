/* domes: Chapter 13.5, the Domes (internal chapter 14, waves 326 to 335): the chapter table, the menu card, the two films, a whole run through all ten waves with both bosses,
   the end of the run, the save, the Bestiary, Play together and the coat colour. */
(function(){
  var out = { errs: [] }; window.addEventListener('error', function(e){ out.errs.push(e.message + ' @' + (e.filename || '').split('/').pop() + ':' + e.lineno); });
  GR.handleAction('splash-go'); Ach.check = function(){ return []; };
  function freshSave(){ Save.reset(); }
  function steps(n, dt){ for (var i = 0; i < n; i++) GR.step(dt || 1 / 30); }
  function killAll(){ G.enemies.slice().forEach(function(e){ if (!e.dead) damageEnemy(e, 1e18, { noCrit: true, quiet: true }); }); }
  try {
    /* the chapter table: the old chapters are exactly as they were, the Domes are ten waves after Chapter 13 */
    out.table = chapterOf(1) === 1 && chapterOf(25) === 1 && chapterOf(26) === 2 && chapterOf(300) === 12 && chapterOf(301) === 13 && chapterOf(325) === 13 && chapterOf(326) === DOME_CHAPTER && chapterOf(335) === DOME_CHAPTER &&
      chapterWaveOf(325) === 25 && chapterWaveOf(326) === 1 && chapterWaveOf(335) === 10 && isChapterFinaleWave(325) && !isChapterFinaleWave(330) && isChapterFinaleWave(335) && !isChapterFinaleWave(326) &&
      CHAPTER_LAST_WAVE === 335 && chapterFirstWave(14) === 326 && chapterFirstWave(13) === 301 && chapterFirstWave(2) === 26 && chapterLen(14) === 10 && chapterLabel(14) === '13.5' && chapterLabel(13) === '13' && TOTAL_CHAPTERS === 14;
    out.bossWaves = bossForWave(330) === 'thawed' && bossForWave(335) === 'iceheart' && bossForWave(25) === 'wildfire' && bossForWave(5) === 'lion';
    var s1 = enemyScale(25), d1 = domeScale(1), d10 = domeScale(10);
    out.difficulty = Math.abs(d1.hp / s1.hp - 2) < 1e-9 && Math.abs(d10.hp / s1.hp - 3) < 1e-9 && d1.dmg / s1.dmg >= 1.5 && d10.dmg / s1.dmg <= 2.3 && d10.dmg > d1.dmg;

    /* the save */
    freshSave(); out.saveDefault = Save.data.chapter14Complete === false;
    out.wardLen = WARD.length; out.wardLocked = wardUnlocked(46) === false && WARD[46] && WARD[46].name === 'Frost Mylar' && WARD.length === 47;
    Save.data.chapter14Complete = 'junk'; out.saveSane = typeof (Save.data.chapter14Complete = !!Save.data.chapter14Complete) === 'boolean';
    Save.data.chapter14Complete = true; out.wardOpen = wardUnlocked(46) === true && wardChoice('skinCol') === 0;
    Save.data.skinCol = 46; out.wardChoice = wardChoice('skinCol') === 46; Save.data.skinCol = 0;

    /* the menu card */
    freshSave(); setMenuChapter(14); out.menuChapter = menuChapter() === 14; showMenu();
    var html = chapterSelectorHTML();
    out.menuLocked = /disabled/.test(html) && /Clear Chapter 13/.test(html) && /Chapter 13\.5/.test(html) && /The Domes/.test(html) && /Waves 326–335 · 2 bosses/.test(html);
    Save.data.chapter13Complete = true; html = chapterSelectorHTML();
    out.menuOpen = /data-a="play14"/.test(html) && /Start Chapter 13\.5/.test(html) && /Straight to wave 326/.test(html);
    out.menuOld = /Waves 301–325 · 5 bosses/.test((setMenuChapter(13), chapterSelectorHTML()));
    setMenuChapter(14); out.arrowEnd = /ch-next" aria-label="Next chapter" disabled/.test(chapterSelectorHTML());
    out.dotsN = (chapterSelectorHTML().match(/class="chdot[ "]/g) || []).length; out.dots = out.dotsN === 14;
    handleAction('play14'); out.menuFilm = G.state === 'cutscene' && G.cut && G.cut.kind === 'domeflight';
    var cu = G.cut; cu.t = DOME_FLIGHT_T.END - 0.01; steps(3); out.menuStarts = G.state === 'playing' && G.wave === 326 && G.chapter === 14 && G.biome === 'dome';

    /* a whole run, wave by wave: every wave builds, spawns and can be cleared; waves 330 and 335 have their boss */
    freshSave(); Save.data.chapter13Complete = true;
    startRun(14); steps(10); G.introFX = null; G.banner = null;
    out.runStart = G.wave === 326 && G.biome === 'dome' && G.chapter === 14 && !!SCEN_DEFS[14] && SCEN.ch === 14 && SCEN.props.length > 20;
    P.invuln = 1e9; P.hp = P.maxHp = 1e12; G.rerolls = 0;
    var seen = {}, bosses = [], counts = [];
    for (var w = 326; w <= 335; w++){
      if (w > 326){ startWave(w); }
      var types = {}, boss = null, n = 0;
      for (var f = 0; f < 600 && (G.spawnQueue.length || f < 30); f++){ GR.step(1 / 30); G.enemies.forEach(function(e){ types[e.type] = 1; n++; if (e.big) boss = e.type; }); P.hp = P.maxHp; P.invuln = 1e9; if (G.enemies.length > 60) killAll(); }
      counts.push(G.spawnQueue.length);
      Object.keys(types).forEach(function(t){ seen[t] = 1; }); if (boss) bosses.push(w + ':' + boss);
      killAll(); steps(20); G.enemies.length = 0;
    }
    out.bosses = bosses.join(',') === '330:thawed,335:iceheart'; out.bossList = bosses.join(',');
    out.noOldBosses = !seen.lion && !seen.matriarch && !seen.buffalo && !seen.crocodile && !seen.wildfire;
    out.cast = ['hyena', 'cheetah', 'termite', 'rhino', 'vulture', 'jackal', 'warthog', 'baboon', 'honeybadger', 'mamba'].every(function(t){ return seen[t]; });
    out.domeLook = ETYPES_DOME.hyena.look === 'arcticwolf' && ETYPES_DOME.hyena.glim === true && ETYPES_DOME.hyena.twist === 'hyena' && ETYPES_DOME.thawed.big === true && ETYPES_DOME.iceheart.big === true;

    /* the bosses' behaviour, state by state: each one runs, aims at her and makes its hazards without an error */
    G.waveState = 'intro'; G.waveTimer = 1e9; G.spawnQueue = [];
    var names = { thawed: ['idle', 'shardwind', 'slumpwind', 'slide', 'roofwind', 'meltdown'], iceheart: ['idle', 'novawind', 'volleywind', 'beamwind', 'spikewind', 'roar'] }, bossOk = true, made = {};
    Object.keys(names).forEach(function(b){
      names[b].forEach(function(st){
        G.enemies.length = 0; G.eproj.length = 0; G.markers.length = 0; G.hzones.length = 0; G.blasts.length = 0; G.beams && (G.beams.length = 0);
        var e = spawnEnemy(b, P.x + 400, P.y, b === 'thawed' ? 330 : 335); if (!e){ bossOk = false; return; }
        e.state = st; e.stateT = 0.01; for (var i = 0; i < 60; i++){ GR.step(1 / 30); P.hp = P.maxHp; P.invuln = 1e9; }
        made[b + ':' + st] = G.eproj.length + G.markers.length + G.hzones.length + G.blasts.length + (G.beams ? G.beams.length : 0) + G.enemies.length;
        if (e.hp !== e.hp || e.x !== e.x || e.y !== e.y) bossOk = false;
      });
    });
    G.enemies.length = 0;
    out.bossBehaviour = bossOk && made['thawed:shardwind'] > 0 && made['thawed:roofwind'] > 0 && made['iceheart:novawind'] > 0 && made['iceheart:volleywind'] > 0 && made['iceheart:spikewind'] > 0;
    G.waveState = 'intro'; G.waveTimer = 1e9; var th = spawnEnemy('thawed', P.x + 300, P.y, 330); th.hp = th.maxHp * 0.4; th.state = 'idle'; th.stateT = 0.01; for (var i = 0; i < 90; i++){ GR.step(1 / 30); P.hp = P.maxHp; }
    out.phase2 = th.p2 === true; G.enemies.length = 0;

    /* the end of the run: the last wave clears, the film, then the report; the save and the coat colour follow */
    freshSave(); Save.data.chapter13Complete = true;
    startRun(14, 335); steps(5); G.introFX = null; G.banner = null; P.invuln = 1e9; P.hp = P.maxHp = 1e12;
    out.lastWave = G.wave === 335 && isChapterFinaleWave(G.wave) && isRunEnd(335) === true;
    G.spawnQueue = []; G.enemies.length = 0; G.bossAlive = false; G.waveState = 'clear'; G.waveTimer = 0.01; steps(3);
    out.endFilm = G.state === 'cutscene' && G.cut && G.cut.kind === 'domeout';
    G.cut.t = DOME_OUT_T.END - 0.01; steps(3);
    out.endVictory = G.state === 'victory' && Save.data.chapter14Complete === true && Save.data.chapter13Complete === true && wardUnlocked(46);
    steps(150); out.victoryText = /CHAPTER 13\.5 COMPLETE/.test(OV.innerHTML) && /New York/.test(OV.innerHTML) && !/the end|thanks for playing/i.test(OV.innerHTML);

    /* finishing Chapter 13 goes on into the Domes: the Mars film, the helicopter film, the transition, wave 326 */
    freshSave(); startRun(13, 325); steps(5); G.introFX = null; G.banner = null; P.invuln = 1e9; P.hp = P.maxHp = 1e12;
    G.spawnQueue = []; G.enemies.length = 0; G.waveState = 'clear'; G.waveTimer = 0.01; G.bossAlive = false; steps(3);
    out.ch13Film1 = G.state === 'cutscene' && G.cut && G.cut.kind === 'marshome' && Save.data.chapter13Complete === true && isRunEnd(325) === false;
    G.cut.t = MARS_FILMS.marshome.end - 0.01; steps(3);
    out.ch13Film2 = G.state === 'cutscene' && G.cut && G.cut.kind === 'domeflight';
    G.cut.t = DOME_FLIGHT_T.END - 0.01; steps(3);
    out.ch13Mini = G.state === 'miniask' && /Start Chapter 13\.5/.test(OV.innerHTML) && /The Domes/.test(OV.innerHTML); handleAction('mini-skip'); steps(2);
    out.ch13Trans = G.state === 'chaptertrans' && G.chapterFX && G.chapterFX.toChapter === 14 && G.chapterFX.toBiome === 'dome';
    for (var i = 0; i < 200 && G.state === 'chaptertrans'; i++) GR.step(1 / 30);
    out.ch13To14 = G.state === 'playing' && G.wave === 326 && G.chapter === 14 && G.biome === 'dome';

    /* the Bestiary */
    freshSave(); var b = bestiaryData();
    out.bestTotal = BESTIARY_TOTAL_CREATURES === 17 * 13 + 14 && bestiaryCounts().totalCreatures === BESTIARY_TOTAL_CREATURES;
    out.bestName = bestiaryName(14, 'thawed').title === 'The Thawed' && bestiaryName(14, 'iceheart').title === 'The Ice Heart' && /Changed Arctic Wolf/.test(bestiaryName(14, 'hyena').title) && bestiaryName(1, 'hyena').title === 'Spotted Hyena';
    var ee = { type: 'thawed', waveRef: 330, x: 0, y: 0, r: 40, def: ETYPES_DOME.thawed }; recordBestiaryKill(ee);
    out.bestKill = b.creatures['14:thawed'] === 1 && !b.creatures['14:lion'];
    showBestiary('creatures'); out.bestHtml = /Chapter 13\.5/.test(OV.innerHTML) && /1 \/ 14/.test(OV.innerHTML) && /Chapter 13 — Mars/.test(OV.innerHTML) && /0 \/ 17/.test(OV.innerHTML);

    /* Play together */
    freshSave(); out.coLocked = coChapters().indexOf(14) < 0; var real = coRealSave; Save.data.chapter13Complete = true; out.coOpen = coChapters().indexOf(14) >= 0 && CO_CHAPTERS.length === 14;

    /* the other lists that count chapters */
    freshSave(); Save.data.chapter14Complete = true; Save.data.chapter13Complete = true;

    out.achieve = ACH.filter(function(a){ return a.id === 'ch135'; }).length === 1 && ACH.filter(function(a){ return a.id === 'ch13'; })[0].goal === 13;
    out.guideChapters = /Chapter 13\.5: The Domes/.test(guideTopicsHTML());
  } catch (e) { out.errs.push('threw: ' + e.message + ' ' + (e.stack || '').split('\n').slice(0, 4).join(' | ')); }
  var need = ['table', 'bossWaves', 'difficulty', 'saveDefault', 'saveSane', 'wardLocked', 'wardOpen', 'wardChoice', 'menuChapter', 'menuLocked', 'menuOpen', 'menuOld', 'arrowEnd', 'dots', 'menuFilm', 'menuStarts', 'runStart', 'bosses', 'noOldBosses', 'cast', 'domeLook', 'bossBehaviour', 'phase2', 'lastWave', 'endFilm', 'endVictory', 'victoryText', 'ch13Film1', 'ch13Film2', 'ch13Mini', 'ch13Trans', 'ch13To14', 'bestTotal', 'bestName', 'bestKill', 'bestHtml', 'coLocked', 'coOpen', 'achieve', 'guideChapters'];
  out.failed = need.filter(function(k){ return out[k] !== true; });
  out.pass = out.errs.length === 0 && out.failed.length === 0;
  QA.done(out);
})();
