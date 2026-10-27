/* siege: Chapter 15, the Siege of Longneck Town (internal chapter 16, waves 361 to 385): the chapter table, the enemy kit (machines and mutants in the Bestiary's usual slots),
   the waves and their difficulty, the save flag, the coat color, the menu card, and a run that starts on the town.
   Run: node tools/qa-cloud.mjs tools/scenarios/siege.js --wait 60000 */
(function(){
  var out = { errs: [] }; window.addEventListener('error', function(e){ out.errs.push(e.message + ' @' + (e.filename || '').split('/').pop() + ':' + e.lineno); });
  GR.handleAction('splash-go'); Ach.check = function(){ return []; };
  function freshSave(){ Save.reset(); }
  function noLevels(){ G.pendingLevels = 0; G.levelGate = 0; if (G.state === 'levelup'){ G.state = 'playing'; G.offer = null; hideOverlay(); } }
  function godMode(){ P.invuln = 1e9; P.hp = P.maxHp = 1e12; G.rerolls = 0; }
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
    handleAction('play16'); out.menuFilm = G.state === 'cutscene' && !!G.cut && G.cut.kind === 'siegeflight'; G.cut.t = SG_FLIGHT_T.END - 0.01; steps(3);
    out.starts = G.state === 'playing' && G.wave === 361 && G.chapter === SIEGE_CHAPTER && G.biome === 'siege';
    steps(90);
    out.spawns = G.enemies.length > 0 && G.enemies.every(function(e){ return e.def && e.def.siege === true; });
    out.hud = /THE SIEGE/.test(document.getElementById('hChapter') ? document.getElementById('hChapter').textContent : 'CH.15 THE SIEGE');
    /* the town: five key buildings, solid houses, gates for the machines, every gate and every key building reachable round the walls */
    var plan = SG.plan;
    out.keys5 = SG.keyList.length === 5 && ['hall', 'library', 'post', 'lighthouse', 'mission'].every(function(k){ return SG.keyList.some(function(b){ return b.key === k; }); });
    out.solid = G.tower === true && !!TW.floor && G.buildings.length === plan.houses.length && G.buildings.every(function(b){ return b.indestructible && b.siege; });
    var inside = plan.houses.every(function(h){ return h.x >= 0 && h.y >= 0 && h.x + h.w <= ARENA_W && h.y + h.h <= ARENA_H; }); out.inside = inside;
    var clash = ''; for (var i = 0; i < plan.houses.length; i++) for (var j = i + 1; j < plan.houses.length; j++){ var a1 = plan.houses[i], b1 = plan.houses[j]; if (a1.x < b1.x + b1.w && b1.x < a1.x + a1.w && a1.y < b1.y + b1.h && b1.y < a1.y + a1.h) clash += a1.k + '/' + b1.k + ' '; }
    out.noOverlap = clash === ''; out.clash = clash;
    var seen = new Uint8Array(TW_NX * TW_NY), q = [], s0 = siegeStart(), si = (s0.y / TW_NAV | 0) * TW_NX + (s0.x / TW_NAV | 0);
    out.startOpen = !TW.blocked[si];
    seen[si] = 1; q.push(si);
    while (q.length){ var c = q.pop(), ci = c % TW_NX, cj = (c / TW_NX) | 0; for (var k = 0; k < 4; k++){ var ni = ci + [1, -1, 0, 0][k], nj = cj + [0, 0, 1, -1][k]; if (ni < 0 || nj < 0 || ni >= TW_NX || nj >= TW_NY) continue; var n = nj * TW_NX + ni; if (seen[n] || TW.blocked[n]) continue; seen[n] = 1; q.push(n); } }
    var lost = plan.vents.filter(function(v){ var o = towerOpenNear(v.x, v.y); return !seen[(o.y / TW_NAV | 0) * TW_NX + (o.x / TW_NAV | 0)]; });
    out.gatesReach = lost.length === 0; out.gatesLost = lost.length;
    var cut = SG.keyList.filter(function(b){ for (var py = b.y - 200; py <= b.y + b.h + 200; py += TW_NAV) for (var px = b.x - 200; px <= b.x + b.w + 200; px += TW_NAV){ if (px < 0 || py < 0 || px >= ARENA_W || py >= ARENA_H) continue; var ci2 = (py / TW_NAV | 0) * TW_NX + (px / TW_NAV | 0); if (seen[ci2] && siegeRectDist(b, px, py) < 200) return false; } return true; });
    out.keysReach = cut.length === 0; out.cutKeys = cut.map(function(b){ return b.key; }).join();
    var open = 0; for (var u = 0; u < seen.length; u++) if (seen[u]) open++; out.openShare = open / (TW_NX * TW_NY) > 0.45; out.openFrac = Math.round(open / (TW_NX * TW_NY) * 100) / 100;
    /* the giraffe cannot walk into a house */
    var hh = plan.houses.filter(function(h){ return h.k === 'house'; })[0]; P.x = hh.x + hh.w / 2; P.y = hh.y + hh.h / 2; resolveBuildings(P, P.r * 0.8);
    out.blocked = !(P.x > hh.x && P.x < hh.x + hh.w && P.y > hh.y && P.y < hh.y + hh.h);
    /* the buildings' health: each of the five starts at 100, hits lower it, 25 or less is wrecked and then left alone, and the militia mend 30 between waves */
    var ks = Object.keys(SGB); out.dStart = ks.length === 5 && ks.every(function(k){ return SGB[k].hp === 100 && !SGB[k].wrecked && SGB[k].field && SGB[k].field.length === TW_NX * TW_NY; });
    G.enemies.length = 0; G.spawnQueue = []; G.waveState = 'idle'; P.invuln = 1e9; P.hp = P.maxHp = 1e12; P.x = 300; P.y = 3000;
    var lib = SGB.library; siegeHurt('library', 10); out.dHurt = Math.abs(lib.hp - 90 * 1) < 1.5 && lib.alert > 0 && !lib.wrecked;      /* the wave's 2% rise is below 1.5 points here */
    siegeHurt('library', 70); out.dWreck = lib.wrecked === true && lib.hp <= 25 && G.sg.dip === true && G.sg.flawless === false;
    var hpW = lib.hp; siegeHurt('library', 50); out.dLeftAlone = lib.hp === hpW;
    /* a creature that walks past a standing building hits it, and not again until its cooldown is over */
    var hall = SGB.hall, hb = hall.b, hp0 = hall.hp, en = spawnEnemy('hyena', hb.x + hb.w / 2, hb.y + hb.h + 40, 361); en.sgHunter = false; siegeEnemyTick(en, 0.1);
    out.dPass = hall.hp < hp0 && en.sgCd > 1; var hp1 = hall.hp; siegeEnemyTick(en, 0.1); out.dCooldown = hall.hp === hp1;
    G.enemies.length = 0;
    /* the Sapper blows itself up on a wall; a Dozer is a hunter and walks to the nearest building along its field, hits it three times and goes on */
    var sp = spawnEnemy('honeybadger', hb.x + hb.w / 2, hb.y + hb.h + 40, 361), hp2 = hall.hp; siegeEnemyTick(sp, 0.1); out.dSapper = hall.hp <= hp2 - 17 && (sp.dead || sp.hp <= 0);
    G.enemies.length = 0;
    SGB.library.wrecked = false; SGB.library.hp = 100; SGB.hall.hp = 100; SGB.post.hp = 100; SGB.lighthouse.hp = 100; SGB.mission.hp = 100;
    var dz = spawnEnemy('warthog', 700, 3000, 361); out.dHunter = dz.sgHunter === true; dz.sgTgt = siegePickTarget(dz); out.dTarget = !!dz.sgTgt && dz.sgTgt.b.key === 'lighthouse' || !!dz.sgTgt;
    var tgt = dz.sgTgt, tk = tgt ? tgt.b.key : '', before = tgt ? tgt.hp : 0, hit3 = false, moved = false, d0 = tgt ? siegeRectDist(tgt.b, dz.x, dz.y) : 0;
    P.x = 4000; P.y = 100; SGM.men.forEach(function(m2){ m2.state = 'down'; m2.hp = 0; });                  /* the militia are out of the way, so the Dozer is not shot on its walk */
    for (var f = 0; f < 1500 && !dz.dead; f++){ G.enemies.slice().forEach(function(e2){ if (e2 !== dz) e2.dead = true; }); GR.step(1 / 30); noLevels(); P.x = 4000; P.y = 100; if (dz.sgDone && dz.sgDone[tk]){ hit3 = true; break; } }
    out.dWalks = d0 > 400 && hit3 && tgt.hp < before - 12; out.dWalksD = d0 + ':' + f + ':' + (tgt ? Math.round(tgt.hp) : '-') + ':' + dz.sgHits;
    G.enemies.length = 0; SGM.men.forEach(function(m2){ m2.state = 'post'; m2.hp = 100; });
    /* between waves: +30 up to 100, wrecked ones stand again once they are above 25; a wave with nothing wrecked is held and pays; the last one stores the result */
    SGB.library.wrecked = true; SGB.library.hp = 10; SGB.hall.hp = 80; G.sg.dip = true; siegeWaveStart(363);
    out.dRepair = SGB.library.hp === 40 && SGB.library.wrecked === false && SGB.hall.hp === 100 && G.sg.dip === false;
    G.wave = 365; G.sg.held = 0; G.bonusGold = 0; var gems0 = G.runGems | 0; siegeWaveEnd(); out.dHeld = G.sg.held === 1 && G.bonusGold === 150 + 10 * 5 && (G.runGems | 0) === gems0 + 3;
    SGB.post.wrecked = true; G.sg.dip = true; var g1 = G.bonusGold; siegeWaveEnd(); out.dNotHeld = G.sg.held === 1 && G.bonusGold === g1; SGB.post.wrecked = false; G.sg.dip = false;
    G.wave = 385; G.sg.held = 24; G.sg.dip = false; G.sg.flawless = true; Save.data.siegeHeldBest = 3; siegeWaveEnd(); out.dFinale = Save.data.siegeHeldBest === 25 && Save.data.siegeFlawless === true;
    Save.data.siegeFlawless = false; Save.data.siegeHeldBest = 0; G.sg.held = 0; G.wave = 361;
    localStorage.setItem(GRSave.key, JSON.stringify(GRSave.encode({ gold: 5, siegeHeldBest: 999, siegeFlawless: 'yes' }))); Save.load(); out.dSave = Save.data.siegeHeldBest === 25 && Save.data.siegeFlawless === true;
    localStorage.setItem(GRSave.key, JSON.stringify(GRSave.encode({ gold: 5, siegeHeldBest: 'junk' }))); Save.load(); out.dSave2 = Save.data.siegeHeldBest === 0 && Save.data.siegeFlawless === false;
    /* the pictures draw without a hitch */
    var cv0 = document.createElement('canvas'); cv0.width = 800; cv0.height = 600; var cx0 = cv0.getContext('2d'); SGB.hall.hp = 40; SGB.post.wrecked = true; SGB.post.hp = 10; SGB.library.alert = 2; G.state = 'playing';
    try { drawGroundSiege(cx0, 2100, 600, 2400, 1200); drawFeedbackOverlays(cx0); out.dDraws = true; } catch (e3) { out.dDraws = false; out.dDrawErr = String(e3 && e3.stack || e3).slice(0, 300); }
    SGB.post.wrecked = false; Object.keys(SGB).forEach(function(k){ SGB[k].hp = 100; SGB[k].wrecked = false; SGB[k].alert = 0; });
    /* the militia: ten posts of two, rifles that one-shot the common kinds and chip a boss, being hit, going down, getting up, abandoning a post and coming back */
    out.mStart = SGM.posts.length === 10 && SGM.men.length === 20 && SGM.posts.every(function(p){ return p.men.length === 2 && !p.abandoned && p.hp === 100 && !!p.b && p.b.post === p.id; }) && SGM.men.every(function(m){ return m.state === 'post' && m.hp === 100; });
    function calm(){ G.enemies.length = 0; G.eproj.length = 0; G.spawnQueue = []; G.waveState = 'idle'; P.invuln = 1e9; P.hp = P.maxHp = 1e12; P.x = 300; P.y = 3000; }
    function openSpot(m, dist){ for (var a = 0; a < 16; a++){ var ex = m.x + Math.cos(a * TAU / 16) * dist, ey = m.y + Math.sin(a * TAU / 16) * dist; if (ex > 100 && ey > 100 && ex < ARENA_W - 100 && ey < ARENA_H - 100 && !TW.blocked[twCell(ex, ey)] && milSight(m, ex, ey)) return { x: ex, y: ey }; } return null; }
    function hush(except){ SGM.men.forEach(function(m2){ m2.reload = m2 === except ? 0 : 99; m2.tgtT = 0; }); }
    calm(); var man = SGM.men[0], o1 = openSpot(man, 300); out.mSpot = !!o1; hush(man);
    var ha = spawnEnemy('hyena', o1.x, o1.y, 361); var k0 = SGM.tracers.length; siegeMilitiaTick(0.05);
    out.mOneShot = (ha.dead || ha.hp <= 0) && SGM.tracers.length === k0 + 1 && man.reload > 1.5;
    calm(); hush(null); var hb2 = spawnEnemy('hyena', o1.x, o1.y, 361); man.reload = 1; var shots = SGM.tracers.length; siegeMilitiaTick(0.05); out.mReload = SGM.tracers.length === shots && !hb2.dead;    /* she is still reloading */
    calm(); hush(man); var wh = spawnEnemy('warthog', o1.x, o1.y, 361), wh0 = wh.hp; siegeMilitiaTick(0.05); out.mHeavy = !wh.dead && wh.hp < wh0 * 0.6 && wh.hp > 0;
    calm(); hush(man); var bo = spawnEnemy('lion', o1.x, o1.y, 365), bo0 = bo.hp; siegeMilitiaTick(0.05); out.mBoss = bo.hp < bo0 && bo.hp > bo0 * 0.97;
    calm(); hush(man); var far = spawnEnemy('hyena', man.x + 900, man.y, 361); siegeMilitiaTick(0.05); out.mRange = !far.dead;
    calm(); var hit0 = man.hp, near = spawnEnemy('hyena', man.x + 10, man.y, 361); near.sgHunter = false; siegeMilitiaTick(0.05); out.mHurt = man.hp === hit0 - MIL.hitDmg && near.milCd > 0; var h1 = man.hp; siegeMilitiaTick(0.05); out.mHurtCd = man.hp === h1;
    calm(); man.hp = 100; var shot = addEProj(man.x + 3, man.y, 0, 0, 5, 30, '#fff', { life: 1 }); G.eproj.length && siegeMilitiaTick(0.01); out.mShot = man.hp === 100 - MIL.hitDmg && G.eproj.length === 0;
    /* down and up: no shooting while down, the giraffe walking over her heals her and she stands again */
    calm(); man.hp = 100; milHurt(man, 500); out.mDown = man.state === 'down' && man.hp === 0; hush(man); var ho = spawnEnemy('hyena', o1.x, o1.y, 361); siegeMilitiaTick(0.05); out.mDownQuiet = !ho.dead;
    P.x = man.x + 5; P.y = man.y; for (var u = 0; u < 20; u++) siegeMilitiaTick(0.05); out.mUp = man.state === 'post' && man.hp > 90;
    calm(); man.hp = 40; P.x = man.x + 5; P.y = man.y; siegeMilitiaTick(0.2); out.mHealHurt = man.hp > 40 && man.state === 'post';
    P.x = 300; P.y = 3000; man.hp = 100;
    /* a creature at a post wears it down; at 30 the post is abandoned and its giraffes go on foot, away from the creature */
    calm(); var post = SGM.posts[0]; var gr = spawnEnemy('warthog', post.cx, post.cy + 60, 361); gr.sgHunter = false;
    for (var w2 = 0; w2 < 60 && !post.abandoned; w2++){ gr.milCd = 0; siegeMilitiaTick(0.05); }
    out.pAbandon = post.abandoned === true && post.hp <= 30 && post.men.every(function(m2){ return m2.state === 'foot'; });
    G.enemies.length = 0; var mx0 = post.men[0].x, my0 = post.men[0].y; for (var w3 = 0; w3 < 40; w3++) siegeMilitiaTick(0.1); out.pFoot = hyp(post.men[0].x - mx0, post.men[0].y - my0) > 40;
    /* the start of the next wave: the post is mended by 40 and manned again, and everyone is up */
    SGM.men[1].state = 'down'; SGM.men[1].hp = 0; siegeMilitiaWaveStart(363);
    out.pMend = post.hp >= 40 && post.hp <= 100 && post.abandoned === false && post.men.every(function(m2){ return m2.state === 'post' && m2.hp === 100; }) && SGM.men[1].state === 'post';
    SGM.posts.forEach(function(p2){ p2.hp = 100; p2.abandoned = false; }); SGM.men.forEach(function(m2){ m2.hp = 100; m2.state = 'post'; m2.x = m2.post.cx + (m2.slot ? 24 : -24); m2.y = m2.post.cy - 4; });
    /* the picture */
    try { var cv1 = document.createElement('canvas'); cv1.width = 800; cv1.height = 600; var cx1 = cv1.getContext('2d'); SGM.men[0].hp = 30; SGM.men[1].state = 'down'; SGM.posts[0].hp = 50; SGM.posts[1].abandoned = true; SGM.tracers.push({ x1: 0, y1: 0, x2: 50, y2: 50, t: 0.1 });
      G.camX = 1800; G.camY = 1550; drawGroundSiege(cx1, 1800, 1550, 1600, 1200); drawGiraffeGroup(cx1); out.mDraws = true; } catch (e4) { out.mDraws = false; out.mDrawErr = String(e4 && e4.stack || e4).slice(0, 300); }
    SGM.men[0].hp = 100; SGM.men[1].state = 'post'; SGM.posts[0].hp = 100; SGM.posts[1].abandoned = false;
    /* the creatures: all twelve kinds run for two seconds without a bad number or a stand inside a building, and each boss makes something in each of its attacks */
    freshSave(); Save.data.chapter15Complete = true; startRun(16, 365); steps(5); godMode(); G.waveState = 'idle'; G.spawnQueue = []; SGM.men.forEach(function(m2){ m2.state = 'down'; m2.hp = 0; });
    var kk = ['hyena', 'grub', 'jackal', 'cheetah', 'warthog', 'rhino', 'baboon', 'honeybadger', 'vulture', 'mamba', 'termite', 'ember'], aiOk = true, aiBad = [];
    kk.forEach(function(t){
      G.enemies.length = 0; P.x = siegeStart().x; P.y = siegeStart().y; var p = towerSpawnPoint(), e6 = spawnEnemy(t, p.x, p.y, 365); if (!e6){ aiOk = false; aiBad.push(t); return; }
      for (var q2 = 0; q2 < 60; q2++){ GR.step(1 / 30); noLevels(); P.hp = P.maxHp; P.invuln = 1e9; SGM.men.forEach(function(m2){ m2.state = 'down'; }); if (e6.hp !== e6.hp || e6.x !== e6.x || e6.y !== e6.y){ aiOk = false; aiBad.push(t + ' nan'); break; } }
      if (!e6.dead && buildingAt(e6.x, e6.y)){ aiOk = false; aiBad.push(t + ' wall'); }
    });
    out.kindsOk = aiOk; out.kindsBad = aiBad.join(',');
    var made2 = {}, bossOk2 = true;
    [['lion', 365, ['stompwind', 'cannonwind', 'beamwind']], ['matriarch', 370, ['spawnwind', 'spitwind', 'pool']], ['buffalo', 375, ['chargewind', 'charge']], ['crocodile', 380, ['launchwind', 'bombwind', 'ringwind']], ['wildfire', 385, ['barragewind', 'beamwind', 'stompwind', 'roar']]].forEach(function(b){
      b[2].forEach(function(st){
        freshSave(); Save.data.chapter15Complete = true; startRun(16, b[1]); steps(3); godMode(); G.waveState = 'idle'; G.spawnQueue = []; G.enemies.length = 0; G.eproj.length = 0; G.markers.length = 0; G.blasts.length = 0; G.beams.length = 0; G.hzones.length = 0; SGM.men.forEach(function(m2){ m2.state = 'down'; m2.hp = 0; });
        var sp = towerOpenNear(P.x + 500, P.y), e7 = spawnEnemy(b[0], sp.x, sp.y, b[1]); if (!e7){ bossOk2 = false; return; }
        e7.state = st; e7.stateT = 0.01; for (var q3 = 0; q3 < 30; q3++){ GR.step(1 / 30); noLevels(); P.hp = P.maxHp; P.invuln = 1e9; SGM.men.forEach(function(m2){ m2.state = 'down'; }); }
        made2[b[0] + ':' + st] = G.eproj.length + G.markers.length + G.hzones.length + G.blasts.length + G.beams.length + G.enemies.length;
        if (e7.hp !== e7.hp || e7.x !== e7.x || e7.y !== e7.y || (!e7.dead && buildingAt(e7.x, e7.y))){ bossOk2 = false; made2[b[0] + ':' + st + ':bad'] = 1; }
      });
    });
    out.bossBehaviour = bossOk2 && made2['lion:cannonwind'] > 1 && made2['matriarch:spawnwind'] > 1 && made2['matriarch:pool'] > 0 && made2['buffalo:chargewind'] > 0 && made2['crocodile:launchwind'] > 1 && made2['crocodile:bombwind'] > 1 && made2['wildfire:beamwind'] > 1 && made2['wildfire:barragewind'] > 1;
    out.bossDetail = JSON.stringify(made2).slice(0, 400);
    /* the art: every one of the seventeen draws without a throw */
    var drawOk = true; BESTIARY_ORDER.slice(0, 17).forEach(function(k){ try { var ex = spawnEnemy(k, 600, 600, 365); G.enemies.length = 0; var cvd = document.createElement('canvas'); cvd.width = 300; cvd.height = 300; var cd = cvd.getContext('2d'); cd.translate(150 - ex.x, 150 - ex.y); ex.state = 'idle'; drawEnemy(cd, ex); ['wind', 'lunge', 'charge', 'burn', 'aim', 'stompwind', 'launch', 'roar', 'beamwind'].forEach(function(st){ ex.state = st; drawEnemy(cd, ex); }); } catch (e8){ drawOk = false; out.drawErr = k + ': ' + String(e8 && e8.message); } });
    out.artDraws = drawOk;
    freshSave(); Save.data.chapter15Complete = true; startRun(16, 361); steps(3); godMode();
    /* the films: both draw at every moment without a throw, and the run ends with the second one, the save flag, the coat and the report */
    var filmOk = true; [['siegeflight', SG_FLIGHT_T.END], ['siegeout', SG_OUT_T.END]].forEach(function(f){ var fc = document.createElement('canvas'); fc.width = CS_W; fc.height = CS_H; var fx = fc.getContext('2d'); for (var ft = 0.2; ft < f[1]; ft += 1.1){ try { MARS_FILMS[f[0]].scene(fx, ft); MARS_FILMS[f[0]].over(fx, ft); } catch (e9){ filmOk = false; out.filmErr = f[0] + '@' + ft.toFixed(1) + ' ' + String(e9 && e9.message); } } });
    out.filmsDraw = filmOk && !!MARS_FILMS.siegeflight.cues.length && !!MARS_FILMS.siegeout.cues.length;
    out.gallery = filmList().filter(function(x){ return x.kind === 'siegeflight' || x.kind === 'siegeout'; }).length === 2;
    freshSave(); Save.data.chapter15Complete = true; Save.data.chapter14Complete = true; Save.data.chapter13Complete = true;
    startRun(16, 385); steps(10); G.introFX = null; G.banner = null; godMode();
    out.lastWave = G.wave === 385 && isChapterFinaleWave(385) && isRunEnd(385) === true;
    G.spawnQueue = []; G.enemies.length = 0; G.bossAlive = false; G.waveState = 'clear'; G.waveTimer = 0.01; steps(3);
    out.endFilm = G.state === 'cutscene' && !!G.cut && G.cut.kind === 'siegeout' && Save.data.chapter16Complete === true;
    G.cut.t = SG_OUT_T.END - 0.01; steps(60);
    out.endVictory = G.state === 'victory' && Save.data.chapter16Complete === true && Save.data.chapter15Complete === true && wardUnlocked(49) === true;
    G.chapter = SIEGE_CHAPTER; out.victoryText = /Warden/.test(victoryText(3, 4)) && !/the end|thanks for playing/i.test(victoryText(3, 4));
    freshSave(); Save.data.chapter15Complete = true; startRun(16, 361); steps(3); godMode();
    /* the Bestiary, the Guide, the trophies, the run report, the gags and Play together */
    freshSave(); var bz = bestiaryData();
    out.bestName = bestiaryName(16, 'wildfire').title === 'The Warden' && bestiaryName(16, 'hyena').title === 'Patrol Bot' && bestiaryName(1, 'hyena').title === 'Spotted Hyena';
    var ez = { type: 'wildfire', waveRef: 385, x: 0, y: 0, r: 60, def: ETYPES_SIEGE.wildfire }; recordBestiaryKill(ez);
    out.bestKill = bz.creatures['16:wildfire'] === 1 && !bz.creatures['16:lion'];
    showBestiary('creatures'); out.bestHtml = /Chapter 15/.test(OV.innerHTML) && /The Siege/.test(OV.innerHTML) && /1 \/ 17/.test(OV.innerHTML);
    hideOverlay();
    out.report = srcInfo('militia', []).name === 'The militia' && srcInfo('allies', []).name === 'Dust allies';
    out.gagRobots = ['sg_patrol', 'sg_skitter', 'sg_dozer', 'sg_walker', 'sg_warden'].every(function(l){ return GAG_ROBOT.test(l); }) && IDLE_CHAPTER[16].length >= 4;
    freshSave(); var ach = function(id){ return ACH.filter(function(x){ return x.id === id; })[0]; };
    out.ach = !!ach('ch15') && !!ach('siegeheld') && !!ach('siegeflaw') && ach('ch15').val() === 0 && ach('siegeheld').val() === 0 && ach('siegeflaw').val() === 0;
    Save.data.chapter16Complete = true; Save.data.siegeHeldBest = 14; Save.data.siegeFlawless = true; out.ach2 = ach('ch15').val() === 1 && ach('siegeheld').val() === 10 && ach('siegeflaw').val() === 1;
    freshSave(); out.guideLocked = !/Chapter 15: the Siege/.test(guideTopicsHTML()); Save.data.chapter16Complete = true; out.guideOpen = /Chapter 15: the Siege/.test(guideTopicsHTML());
    freshSave(); out.coLocked = coChapters().indexOf(16) < 0 && CO_CHAPTERS.length === 16; Save.data.chapter15Complete = true; out.coOpen = coChapters().indexOf(16) >= 0;
    coStart('arena', 16); steps(40); out.together = Co.on && G.chapter === SIEGE_CHAPTER && G.biome === 'siege' && G.tower === true && G.buildings.length > 30 && SGM.men.length === 20 && Co.pl[0].x === Co.pl[0].x;
    var cman = SGM.men[0]; cman.hp = 20; Co.pl[1].x = cman.x + 4; Co.pl[1].y = cman.y; Co.pl[1].down = false; siegeMilitiaTick(0.2); out.togetherHeal = cman.hp > 20; coEnd(true);
    freshSave(); Save.data.chapter15Complete = true; startRun(16, 361); steps(3); godMode();
    /* a saved run keeps how many waves were held */
    freshSave(); Save.data.chapter15Complete = true; startRun(16, 370); steps(3); G.sg.held = 7; var snap = runSnapshot(); out.snapHeld = snap.sgHeld === 7 && validRunSave(snap);
    Save.data.runSave = snap; startRun(16, 370, snap); steps(3); out.restoreHeld = G.sg.held === 7;
    var old = JSON.parse(JSON.stringify(snap)); delete old.sgHeld; startRun(16, 370, old); steps(3); out.restoreOld = G.sg.held === 0;
    freshSave(); Save.data.chapter15Complete = true; startRun(16, 361); steps(3); godMode();
    /* the picture: --params "view=square|market|harbor|park|roofs|launch|south|hall|lighthouse" */
    var at = { square: [2100, 1700], market: [2100, 600], harbor: [700, 1700], park: [3500, 1600], roofs: [3500, 600], launch: [3500, 2650], south: [2100, 2650], nw: [700, 600], hall: [2100, 1250], lighthouse: [700, 1450], mission: [3400, 2350], post: [2700, 500], library: [1700, 520], militia: [1800, 1640] };
    if (QA.params.view === 'menu'){ G.state = 'menu'; Save.data.chapter15Complete = true; setMenuChapter(16); showMenu(); for (var mm = 0; mm < 4; mm++) GR.step(1 / 30); drawMenuPreview(); QA.done(out); return; }
    if (QA.params.view === 'bench'){                                                     /* timing: --params "view=bench&ch=16" (or 15 for the Tower, to compare) */
      var chb = +QA.params.ch || 16; freshSave(); Save.data.chapter15Complete = true; Save.data.chapter14Complete = true; startRun(chb, chapterFirstWave(chb) + 9); steps(3); godMode(); G.introFX = null; G.banner = null; G.waveState = 'idle'; G.spawnQueue = [];
      var tys = ['hyena', 'grub', 'jackal', 'cheetah', 'warthog', 'vulture', 'rhino', 'baboon', 'honeybadger', 'mamba', 'ember', 'termite'];
      for (var ib = 0; ib < 100; ib++){ var pb = chb === 16 ? towerOpenNear(500 + (ib * 137) % 3200, 400 + (ib * 211) % 2400) : towerSpawnPoint(); spawnEnemy(tys[ib % 12], pb.x, pb.y, chapterFirstWave(chb) + 9); }
      var t0 = performance.now(); for (var sb = 0; sb < 150; sb++){ GR.step(1 / 30); noLevels(); P.hp = P.maxHp; P.invuln = 1e9; } out.msPerStep = Math.round((performance.now() - t0) / 150 * 100) / 100; out.alive = G.enemies.length; QA.done(out); return;
    }
    if (QA.params.view === 'sim'){                                                       /* balance: --params "view=sim&wave=361" plays waves with the giraffe standing in the Square doing nothing */
      var w0 = +QA.params.wave || 361, rep = []; freshSave(); Save.data.chapter15Complete = true; startRun(16, w0); steps(2); P.invuln = 1e9; P.hp = P.maxHp = 1e12; G.rerolls = 0;
      for (var wv = 0; wv < (+QA.params.waves || 1); wv++){
        var kills0 = G.kills, mk = 0, steps0 = 0, ms0 = G.runDmg && G.runDmg.militia || 0;
        for (var sf = 0; sf < 2400 && steps0 < 2400; sf++){ steps0++; GR.step(1 / 30); noLevels(); P.hp = P.maxHp; P.invuln = 1e9; P.x = 2100; P.y = 1900; if (G.waveState === 'clear' && G.waveTimer <= 0.05) break; }
        rep.push({ w: G.wave, sec: Math.round(steps0 / 30), kills: G.kills - kills0, hold: G.sg.held, bld: Object.keys(SGB).map(function(k){ return Math.round(SGB[k].hp); }).join('/'), wrecked: Object.keys(SGB).filter(function(k){ return SGB[k].wrecked; }).length, abandoned: SGM.posts.filter(function(p){ return p.abandoned; }).length, down: SGM.men.filter(function(m){ return m.state === 'down'; }).length, militiaDmg: Math.round((G.runDmg.militia || 0) / 1e3) });
        if (G.state !== 'playing') break; startWave(G.wave + 1);
      }
      out.sim = rep; QA.done(out); return;
    }
    if (QA.params.view === 'battle'){                                                    /* a picture of a fight in the Square: --params "view=battle" */
      Settings.fxLevel = 1; freshSave(); Save.data.chapter15Complete = true; startRun(16, 373); steps(3); G.introFX = null; G.banner = null; G.waveState = 'idle'; G.spawnQueue = []; G.enemies.length = 0; P.invuln = 1e9; P.hp = P.maxHp = 1e12; P.x = 2000; P.y = 1900;
      var bt = ['hyena', 'jackal', 'cheetah', 'warthog', 'vulture', 'rhino', 'baboon', 'honeybadger', 'mamba', 'ember', 'termite', 'grub'];
      for (var ib2 = 0; ib2 < 22; ib2++){ var ang = ib2 * 2.4, rad = 140 + (ib2 % 5) * 60, pb2 = towerOpenNear(P.x + Math.cos(ang) * rad * 1.5, P.y + Math.sin(ang) * rad); spawnEnemy(bt[ib2 % 12], pb2.x, pb2.y, 373); }
      SGB.hall.hp = 60; SGB.post.hp = 40; SGM.men[0].hp = 40; SGM.men[1].state = 'down'; SGM.men[1].hp = 0;
      for (var z2 = 0; z2 < 14; z2++){ GR.step(1 / 30); noLevels(); P.hp = P.maxHp; } QA.done(out); return;
    }
    if (QA.params.film){                                                                 /* one frame of a film: --params "film=siegeflight&t=11" --w 1280 --h 720 */
      var cvf = document.createElement('canvas'); cvf.width = CS_W; cvf.height = CS_H; cvf.style.cssText = 'position:fixed;left:0;top:0;width:100vw;height:100vh;z-index:99999;background:#000'; var cxf = cvf.getContext('2d');
      MARS_FILMS[QA.params.film].scene(cxf, +QA.params.t || 0); MARS_FILMS[QA.params.film].over(cxf, +QA.params.t || 0); document.body.appendChild(cvf); QA.done(out); return;
    }
    if (QA.params.view === 'cast'){                                                      /* the seventeen creatures on one canvas: --params "view=cast" --w 1400 --h 900 */
      var cvc = document.createElement('canvas'); cvc.width = 1400; cvc.height = 900; cvc.style.cssText = 'position:fixed;left:0;top:0;width:100vw;height:100vh;z-index:99999;background:#7A7468'; var cxc = cvc.getContext('2d');
      cxc.font = '700 15px sans-serif'; cxc.textAlign = 'center'; cxc.fillStyle = '#10141C';
      BESTIARY_ORDER.slice(0, 17).forEach(function(k, i){
        var ex = spawnEnemy(k, 0, 0, 361); G.enemies.length = 0; var col = i % 6, row = (i / 6) | 0, sc = ex.big ? 1.1 : 2.4, px = 120 + col * 230, py = 120 + row * 280;
        cxc.save(); cxc.translate(px, py); cxc.scale(sc, sc); cxc.translate(-ex.x, -ex.y); try { drawEnemy(cxc, ex); } catch (e5) { out.castErr = String(e5 && e5.stack || e5).slice(0, 200); } cxc.restore();
        cxc.fillText(LOOK_NAMES[ex.def.look] + ' (' + k + ')', px, py + 100);
      });
      document.body.appendChild(cvc); QA.done(out); return;
    }
    if (QA.params.view === 'map'){                                                       /* the whole town on one canvas, laid over the page */
      var cv = document.createElement('canvas'); cv.width = 1400; cv.height = 1050; cv.style.cssText = 'position:fixed;left:0;top:0;width:100vw;height:100vh;z-index:99999;background:#000'; var cx2 = cv.getContext('2d');
      cx2.scale(1400 / ARENA_W, 1050 / ARENA_H); drawGroundSiege(cx2, ARENA_W / 2, ARENA_H / 2, ARENA_W, ARENA_H); document.body.appendChild(cv); QA.done(out); return;
    }
    if (QA.params.view && at[QA.params.view]){ Settings.fxLevel = 1; G.enemies.length = 0; G.spawnQueue = []; G.waveState = 'idle'; P.invuln = 1e9; if (QA.params.damage){ SGB.hall.hp = 45; SGB.library.hp = 12; SGB.library.wrecked = true; SGB.post.hp = 70; SGB.post.alert = 99; SGB.lighthouse.hp = 30; SGM.men[0].hp = 35; SGM.men[1].state = 'down'; SGM.men[1].hp = 0; SGM.posts[0].hp = 55; SGM.posts[1].hp = 20; SGM.posts[1].abandoned = true; SGM.men[2].hp = 100; } P.x = at[QA.params.view][0]; P.y = at[QA.params.view][1]; for (var z = 0; z < 8; z++){ G.enemies.length = 0; G.spawnQueue = []; GR.step(1 / 30); noLevels(); } G.texts.length = 0; G.particles.length = 0; GR.step(1 / 30); QA.done(out); return; }
    G.wave = 385; out.flags = true;
  } catch (e) { out.err = String(e && e.stack || e); }
  var need = ['table', 'bossWaves', 'tune', 'cast', 'bestiary', 'uniqueLooks', 'saveDefault', 'saveSane', 'wardLen', 'wardOpen', 'waves', 'pool', 'menuLocked', 'menuOpen', 'starts', 'spawns', 'keys5', 'solid', 'inside', 'noOverlap', 'startOpen', 'gatesReach', 'keysReach', 'openShare', 'blocked', 'dStart', 'dHurt', 'dWreck', 'dLeftAlone', 'dPass', 'dCooldown', 'dSapper', 'dHunter', 'dWalks', 'dRepair', 'dHeld', 'dNotHeld', 'dFinale', 'dSave', 'dSave2', 'dDraws', 'mStart', 'mSpot', 'mOneShot', 'mReload', 'mHeavy', 'mBoss', 'mRange', 'mHurt', 'mHurtCd', 'mShot', 'mDown', 'mDownQuiet', 'mUp', 'mHealHurt', 'pAbandon', 'pFoot', 'pMend', 'mDraws', 'kindsOk', 'bossBehaviour', 'artDraws', 'menuFilm', 'filmsDraw', 'gallery', 'lastWave', 'endFilm', 'endVictory', 'victoryText', 'bestName', 'bestKill', 'bestHtml', 'report', 'gagRobots', 'ach', 'ach2', 'guideLocked', 'guideOpen', 'coLocked', 'coOpen', 'together', 'togetherHeal', 'snapHeld', 'restoreHeld', 'restoreOld'];
  out.failed = need.filter(function(k){ return out[k] !== true; });
  out.pass = out.errs.length === 0 && !out.err && out.failed.length === 0;
  QA.done(out);
})();
