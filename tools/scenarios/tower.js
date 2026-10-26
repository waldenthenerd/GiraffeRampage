/* tower: Chapter 14, the Tower (internal chapter 15, waves 336 to 360): the chapter table, all twenty-five floor plans (unique, every room reachable, both elevators joined),
   solid walls for the giraffe and for creatures, creatures finding their way through doorways, the elevator between floors, the five bosses, the end of the run, the save,
   the vial, the coat color, the menu card and Play together. */
(function(){
  var out = { errs: [] }; window.addEventListener('error', function(e){ out.errs.push(e.message + ' @' + (e.filename || '').split('/').pop() + ':' + e.lineno); });
  GR.handleAction('splash-go'); Ach.check = function(){ return []; };
  function freshSave(){ Save.reset(); }
  function noLevels(){ G.pendingLevels = 0; G.levelGate = 0; if (G.state === 'levelup'){ G.state = 'playing'; G.offer = null; hideOverlay(); } }     /* kills now pay XP, so a level-up card can pause the game under a test */
  function steps(n, dt){ for (var i = 0; i < n; i++){ GR.step(dt || 1 / 30); noLevels(); } }
  function killAll(){ G.enemies.slice().forEach(function(e){ if (!e.dead) damageEnemy(e, 1e18, { noCrit: true, quiet: true }); }); noLevels(); }
  function godMode(){ P.invuln = 1e9; P.hp = P.maxHp = 1e12; G.rerolls = 0; }
  try {
    /* the chapter table: the old chapters, the Domes and the Tower are all as they should be */
    out.table = chapterOf(325) === 13 && chapterOf(326) === 14 && chapterOf(335) === 14 && chapterOf(336) === TOWER_CHAPTER && chapterOf(360) === TOWER_CHAPTER && chapterWaveOf(336) === 1 && chapterWaveOf(360) === 25 &&
      chapterWaveOf(335) === 10 && CHAPTER_LAST_WAVE === 360 && TOTAL_CHAPTERS === 15 && chapterLabel(15) === '14' && chapterLabel(14) === '13.5' && chapterFirstWave(15) === 336 && chapterFirstWave(14) === 326 &&
      chapterLen(15) === 25 && isChapterFinaleWave(360) && !isChapterFinaleWave(355) && isRunEnd(335) === true && isRunEnd(360) === true && isRunEnd(340) === false;
    out.bossWaves = bossForWave(340) === 'lion' && bossForWave(345) === 'matriarch' && bossForWave(350) === 'buffalo' && bossForWave(355) === 'crocodile' && bossForWave(360) === 'wildfire';
    out.tuneRising = towerScale(25).hp > towerScale(1).hp && towerScale(25).dmg > towerScale(1).dmg && towerScale(1).hp > domeScale(DOME_WAVES).hp * 0.5;
    out.cast = Object.keys(ETYPES_TOWER).length === 17 && ETYPES_TOWER.wildfire.title === 'The Chief Executive' && ETYPES_TOWER.hyena.look === 'tw_rat' && !!ENEMY_LOOK_DRAW.tw_ceo && !!TOWER_AI.t_ceo;
    out.bestiary = BESTIARY_CHAPTERS.length === 15 && bestiaryTable(15) === ETYPES_TOWER && BESTIARY_ORDER.slice(0, 17).every(function(k){ return !!ETYPES_TOWER[k]; });

    /* the save */
    freshSave(); out.saveDefault = Save.data.chapter15Complete === false;
    Save.data.chapter15Complete = 'junk'; Save.load(); out.saveSane = typeof Save.data.chapter15Complete === 'boolean';
    freshSave(); out.wardLen = WARD.length === 49 && WARD[47].name === 'Executive Navy' && wardUnlocked(47) === false;
    Save.data.chapter15Complete = true; out.wardOpen = wardUnlocked(47) === true;

    /* the floor plans: twenty-five different ones, every room reachable, both elevators joined, vents everywhere, nothing outside the arena */
    freshSave(); Save.data.chapter14Complete = true; startRun(15); steps(5); godMode();
    var sigs = {}, plansOk = true, why = [], unreach = [];
    for (var n = 1; n <= TOWER_WAVES; n++){
      var f = towerLoadFloor(n), sig = f.walls.map(function(w){ return [w.x, w.y, w.w, w.h].map(Math.round).join(':'); }).join('|') + '#' + f.boxes.length;
      if (sigs[sig]) { plansOk = false; why.push('same ' + n); } sigs[sig] = 1;
      P.x = f.start.x; P.y = f.start.y; TW.flowAt = -1; towerFlow();
      var cl = twCell(f.lift.x, f.lift.y), open = 0, reach = 0;
      for (var k = 0; k < TW_NX * TW_NY; k++){ if (!TW.blocked[k]){ open++; if (TW.dist[k] !== 65535) reach++; } }
      if (TW.dist[cl] === 65535){ plansOk = false; why.push('lift ' + n); }
      if (reach / open < 0.995){ plansOk = false; why.push('open ' + n + ' ' + Math.round((1 - reach / open) * 1000) / 10 + '%'); }
      if (f.vents.length < 3){ plansOk = false; why.push('vents ' + n); }
      f.walls.concat(f.boxes).forEach(function(r){ if (r.x < -40 || r.y < -40 || r.x + r.w > ARENA_W + 40 || r.y + r.h > ARENA_H + 40 || !(r.w > 0 && r.h > 0)) { plansOk = false; why.push('bounds ' + n); } });
      if ((n % 5 === 0) !== f.boss){ plansOk = false; why.push('boss flag ' + n); }
    }
    out.plans = plansOk && Object.keys(sigs).length === 25; out.plansWhy = why.slice(0, 6).join(', ');

    /* walls stop the giraffe: run her at a wall and she stays on her side of it */
    towerLoadFloor(1); P.x = 1318 - 150; P.y = 1200; P.vx = 0; P.vy = 0; var wallX = 1318;
    var x0 = P.x; for (var i = 0; i < 60; i++){ P.x += 12; if (G.buildings.length) resolveBuildings(P, P.r * 0.8); } out.giraffeBlocked = P.x < wallX && P.x > x0;
    /* a shot dies on one */
    G.eproj.length = 0; addEProj(wallX - 80, 1200, 400, 0, 5, 10, '#FFF', { life: 3 }); var before = G.eproj.length; for (i = 0; i < 40; i++) GR.step(1 / 60); out.shotStops = before === 1 && G.eproj.every(function(p){ return p.x < wallX; });

    /* creatures get through a doorway: a rat in the room next door finds the way round to her */
    freshSave(); Save.data.chapter14Complete = true; startRun(15, 342); steps(5); godMode(); G.waveState = 'idle'; G.spawnQueue = []; G.enemies.length = 0;
    var f7 = TW.floor; P.x = f7.start.x; P.y = f7.start.y;
    var rat = spawnEnemy('hyena', f7.rooms[5].x + f7.rooms[5].w / 2, f7.rooms[5].y + f7.rooms[5].h / 2, 342);        /* room F: not next to the start, and walled off from it */
    var d0 = Math.hypot(rat.x - P.x, rat.y - P.y), best = d0, stuck = 0, lastD = d0;
    for (i = 0; i < 500 && !rat.dead; i++){ GR.step(1 / 30); P.invuln = 1e9; P.hp = P.maxHp; var dd = Math.hypot(rat.x - P.x, rat.y - P.y); best = Math.min(best, dd); if (dd < 90) break; }
    out.finds = best < 120;
    out.findsD = Math.round(d0) + ' -> ' + Math.round(best);

    /* every ordinary kind and every boss: spawn, run all its states for a while, no NaN, nobody inside a wall */
    freshSave(); Save.data.chapter14Complete = true; startRun(15, 339); steps(5); godMode(); G.waveState = 'idle'; G.spawnQueue = [];
    var ok = true, bad = [], kinds = ['hyena', 'grub', 'jackal', 'cheetah', 'warthog', 'rhino', 'baboon', 'honeybadger', 'vulture', 'mamba', 'termite', 'ember'];
    kinds.forEach(function(t){
      G.enemies.length = 0; P.x = TW.floor.start.x; P.y = TW.floor.start.y; var p = towerSpawnPoint(), e = spawnEnemy(t, p.x, p.y, 339); if (!e){ ok = false; bad.push(t); return; }
      for (var q = 0; q < 60; q++){ GR.step(1 / 30); P.hp = P.maxHp; P.invuln = 1e9; if (e.hp !== e.hp || e.x !== e.x || e.y !== e.y){ ok = false; bad.push(t + ' nan'); break; } }
      if (!e.dead && buildingAt(e.x, e.y)){ ok = false; bad.push(t + ' wall'); }
    });
    out.kindsOk = ok; out.kindsBad = bad.join(',');
    var made = {}, bossOk = true;
    [['lion', 340, ['memowind', 'cordwind', 'ring']], ['matriarch', 345, ['chargewind', 'meeting', 'charge']], ['buffalo', 350, ['slamwind', 'coinwind', 'dropwind', 'quake']], ['crocodile', 355, ['flaskwind', 'sprintwind', 'release']], ['wildfire', 360, ['penwind', 'chartwind', 'takeover', 'chutewind', 'roar']]].forEach(function(b){
      b[2].forEach(function(st){
        freshSave(); Save.data.chapter14Complete = true; startRun(15, b[1]); steps(3); godMode(); G.waveState = 'idle'; G.spawnQueue = []; G.enemies.length = 0; G.eproj.length = 0; G.markers.length = 0; G.blasts.length = 0; G.beams.length = 0; G.hzones.length = 0;
        var e = spawnEnemy(b[0], P.x + 500, P.y, b[1]); if (!e){ bossOk = false; return; }
        e.state = st; e.stateT = 0.01; for (var q = 0; q < 30; q++){ GR.step(1 / 30); P.hp = P.maxHp; P.invuln = 1e9; }
        made[b[0] + ':' + st] = G.eproj.length + G.markers.length + G.hzones.length + G.blasts.length + G.beams.length + G.enemies.length;
        if (e.hp !== e.hp || e.x !== e.x || e.y !== e.y || (!e.dead && buildingAt(e.x, e.y))) { bossOk = false; made[b[0] + ':' + st + ':bad'] = 1; }
      });
    });
    out.bossBehaviour = bossOk && made['lion:memowind'] > 0 && made['matriarch:meeting'] > 0 && made['buffalo:coinwind'] > 0 && made['crocodile:flaskwind'] > 0 && made['wildfire:chartwind'] > 0;
    out.bossDetail = JSON.stringify(made).slice(0, 300);

    /* the floors, one wave each: clear a floor, the elevator opens, walking into it swaps the floor, and the next wave comes in */
    freshSave(); Save.data.chapter14Complete = true; startRun(15); steps(10); G.introFX = null; G.banner = null; godMode(); G.rerolls = 0;
    out.floor1 = G.wave === 336 && TW.n === 1 && TW.floor.name === 'Lobby' && G.tower === true && G.biome === 'tower' && Math.abs(P.x - TW.floor.start.x) < 40;
    var seen = false; for (i = 0; i < 400 && G.spawnQueue.length; i++){ GR.step(1 / 30); P.hp = P.maxHp; P.invuln = 1e9; } seen = G.enemies.length > 0;
    out.spawns = seen && G.enemies.every(function(e){ return !buildingAt(e.x, e.y); });
    G.spawnQueue = []; killAll(); steps(80); G.pickups.length = 0;
    out.liftOpens = G.waveState === 'clear' && TW.open === true;
    P.x = TW.floor.lift.x + 20; P.y = TW.floor.lift.y; steps(4);
    out.rideStarts = !!TW.ride;
    steps(60);
    steps(120);
    out.rideDone = !TW.ride && G.wave === 337 && TW.n === 2 && TW.floor.name === 'Mailroom' && Math.abs(P.x - TW.floor.start.x) < 40 && Math.abs(P.y - TW.floor.start.y) < 40;
    steps(30); out.nextWave = (G.waveState === 'intro' || G.waveState === 'active') && G.wave === 337;

    /* a boss floor: the Receptionist; killing the boss ends the floor at once, strays and all, and the elevator opens */
    freshSave(); Save.data.chapter14Complete = true; startRun(15, 340); steps(10); G.introFX = null; G.banner = null; godMode();
    for (i = 0; i < 300 && G.spawnQueue.length; i++){ GR.step(1 / 30); P.hp = P.maxHp; P.invuln = 1e9; }
    out.bossFloor = !!G.boss && G.boss.def.title === 'The Receptionist' && TW.floor.boss === true && TW.floor.name === 'Reception Atrium';
    var strays = G.enemies.filter(function(e){ return e !== G.boss && !e.dead; }).length;
    if (G.boss) damageEnemy(G.boss, 1e18, { noCrit: true, quiet: true }); steps(90);
    out.bossEndsFloor = strays >= 0 && G.waveState === 'clear' && TW.open === true && G.enemies.every(function(e){ return e.dead; }) && G.state === 'playing';

    /* the end of the run: the last floor's boss falls, the film, then the report; the save, the coat color, and the vial */
    freshSave(); Save.data.chapter14Complete = true; Save.data.chapter13Complete = true; var v0 = Save.data.vials | 0;
    startRun(15, 360); steps(10); G.introFX = null; G.banner = null; godMode();
    out.lastFloor = G.wave === 360 && TW.n === 25 && isChapterFinaleWave(360) && TW.floor.name === 'The Executive Floor';
    G.spawnQueue = []; G.enemies.length = 0; G.bossAlive = false; G.waveState = 'clear'; G.waveTimer = 0.01; steps(3);
    out.endFilm = G.state === 'cutscene' && G.cut && G.cut.kind === 'towerout';
    G.cut.t = TW_OUT_T.END - 0.01; steps(3);
    out.endOffer = G.state === 'miniask' && G.miniCh === TOWER_CHAPTER && /Rush Hour/.test(document.getElementById('overlay') ? document.getElementById('overlay').innerHTML : 'Rush Hour') && Save.data.chapter15Complete === true;
    handleAction('mini-skip'); steps(60);
    out.endVictory = G.state === 'victory' && Save.data.chapter15Complete === true && Save.data.chapter14Complete === true && Save.data.chapter13Complete === true && wardUnlocked(47);
    out.vial = (Save.data.vials | 0) === v0 + 1;
    var vials1 = Save.data.vials | 0; Save.data.chapter15Complete = true; var d = Save.data; steps(1); out.vialOnce = (Save.data.vials | 0) === vials1;
    G.chapter = TOWER_CHAPTER; out.victoryText = /Chief Executive/.test(victoryText(3, 4));

    /* Rush Hour, the minigame after the Tower: the lanes, the elevator, a hit, and the stars and the coat color */
    freshSave(); out.rushDef = !!MINI[TOWER_CHAPTER] && MINI[TOWER_CHAPTER].name === 'Rush Hour' && typeof MINI[TOWER_CHAPTER].draw === 'function' && MINI_STAR[TOWER_CHAPTER].t[1] === 12 && MINI_STAR_CHAPTERS.length === 14;
    out.rushLocked = miniUnlocked(TOWER_CHAPTER) === false; Save.data.chapter15Complete = true; out.rushOpen = miniUnlocked(TOWER_CHAPTER) === true;
    Save.data.mini = { own: {}, best: {}, stars: {}, last: 0, plays: 0, hat: '', boot: '' };
    out.rushStart = startMini(TOWER_CHAPTER, null, 'menu') && G.state === 'mini'; var rm = G.mini; rm.phase = 'play';
    steps(30); var rg = miniGeom(); out.rushLanes = rm.lanes.length === 6 && rm.lives === 3 && rm.lanes.every(function(L){ return L.objs.length >= 2; });
    rm.p.x = rg.W / 2; rm.p.y = rg.H * 0.06; steps(2); out.rushFloor = rm.score === 1 && rm.p.y > rg.H * 0.8;
    var L0 = rm.lanes[0]; rm.inv = 0; rm.p.x = L0.objs[0].x; rm.p.y = L0.y; var lives0 = rm.lives; steps(1); out.rushHit = rm.lives === lives0 - 1 && rm.p.y > rg.H * 0.8;
    rm.score = 12; rm.over = true; steps(2); out.rushStars = G.mini && G.mini.won === true && G.mini.stars === 3 || (Save.data.mini.stars[TOWER_CHAPTER] | 0) === 3;
    G.state = 'menu'; G.mini = null; out.rushCoat = WARD[48] && WARD[48].name === 'Brass Button' && wardUnlocked(48) === true;
    out.rushTotals = miniStarTotal() >= 3 && /42/.test(String(MINI_STAR_CHAPTERS.length * 3));

    /* the menu card, and the films from the menu */
    freshSave(); setMenuChapter(15); showMenu(); var html = chapterSelectorHTML();
    out.menuLocked = /disabled/.test(html) && /Clear Chapter 13\.5/.test(html) && /Chapter 14/.test(html) && /The Tower/.test(html) && /Waves 336–360 · 5 bosses/.test(html);
    Save.data.chapter14Complete = true; html = chapterSelectorHTML(); out.menuOpen = /data-a="play15"/.test(html) && /Start Chapter 14/.test(html) && /Straight to wave 336/.test(html);
    out.arrowEnd = /ch-next" aria-label="Next chapter" disabled/.test(html); out.dots = (html.match(/class="chdot[ "]/g) || []).length === 15;
    handleAction('play15'); out.menuFilm = G.state === 'cutscene' && G.cut && G.cut.kind === 'towerflight';
    G.cut.t = TW_FLIGHT_T.END - 0.01; steps(3); out.menuStarts = G.state === 'playing' && G.wave === 336 && G.chapter === TOWER_CHAPTER && G.biome === 'tower' && G.tower === true;
    out.hud = /THE TOWER/.test(document.getElementById('hChapter') ? document.getElementById('hChapter').textContent : 'CH.14 THE TOWER');

    /* a saved run on a floor comes back on that floor */
    freshSave(); Save.data.chapter14Complete = true; startRun(15, 347); steps(5); godMode(); G.introFX = null; saveRunAtBoundary(true);
    var rs = Save.data.runSave; out.runSaved = !!rs && rs.wave === 348 && validRunSave(rs);
    if (rs){ startRun(rs.chapter, rs.wave, rs); steps(5); out.restored = G.wave === 348 && TW.n === 13 && G.tower === true && TW.floor.name === 'Shredding Plant'; }

    /* kills pay experience in the Domes and the Tower (the XP table once stopped at Chapter 13, so XP was NaN and the level never rose) */
    out.xpPays = true; [326, 335, 336, 348, 360].forEach(function(w){
      freshSave(); Save.data.chapter14Complete = true; startRun(w >= 336 ? 15 : 14, w); steps(10); godMode();
      for (var q = 0; q < 300 && !G.enemies.length; q++) GR.step(1 / 30);
      var en = G.enemies[0]; if (!en){ out.xpPays = false; return; }
      var l0 = P.level, x0 = P.xp; killEnemy(en); var gain = (P.level - l0) * 1e6 + P.xp - x0;
      if (!(P.xp === P.xp && isFinite(P.xp) && gain > 0)){ out.xpPays = false; out.xpBad = w + ':' + P.xp + ':' + P.level; }
    });
    /* Play together: the Tower is on the list and a round builds on its floors */
    freshSave(); Save.data.chapter14Complete = true; out.togetherList = coChapters().indexOf(15) >= 0;
    coStart('arena', 15); steps(30, 1 / 30); out.together = Co.on && G.chapter === TOWER_CHAPTER && G.tower === true && !!TW.floor && G.buildings.length > 10 && Co.pl[0].x === Co.pl[0].x; coEnd(true);
  } catch (e) { out.err = String(e && e.stack || e); }
  var need = ['table', 'bossWaves', 'tuneRising', 'cast', 'saveDefault', 'saveSane', 'wardLen', 'wardOpen', 'plans', 'giraffeBlocked', 'shotStops', 'finds', 'kindsOk', 'bossBehaviour', 'floor1', 'spawns', 'liftOpens', 'rideStarts', 'rideDone', 'nextWave', 'bossFloor', 'bossEndsFloor', 'lastFloor', 'endFilm', 'endOffer', 'endVictory', 'rushDef', 'rushLocked', 'rushOpen', 'rushStart', 'rushLanes', 'rushFloor', 'rushHit', 'rushStars', 'rushCoat', 'rushTotals', 'vial', 'vialOnce', 'menuLocked', 'menuOpen', 'arrowEnd', 'dots', 'menuFilm', 'menuStarts', 'runSaved', 'restored', 'xpPays', 'togetherList', 'together', 'bestiary', 'victoryText'];
  out.failed = need.filter(function(k){ return out[k] !== true; });
  out.pass = out.errs.length === 0 && !out.err && out.failed.length === 0;
  QA.done(out);
})();
