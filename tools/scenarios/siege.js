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
    var cut = SG.keyList.filter(function(b){ var ok = false; for (var d = -1; d <= 1 && !ok; d++) for (var e2 = -1; e2 <= 1 && !ok; e2++){ var px = b.x + b.w / 2 + d * (b.w / 2 + 90), py = b.y + b.h + 90 + e2 * 20; ok = !TW.blocked[(py / TW_NAV | 0) * TW_NX + (px / TW_NAV | 0)] && !!seen[(py / TW_NAV | 0) * TW_NX + (px / TW_NAV | 0)]; } return !ok; });
    out.keysReach = cut.length === 0;
    var open = 0; for (var u = 0; u < seen.length; u++) if (seen[u]) open++; out.openShare = open / (TW_NX * TW_NY) > 0.55;
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
    P.x = 4000; P.y = 100;
    for (var f = 0; f < 1500 && !dz.dead; f++){ G.enemies.slice().forEach(function(e2){ if (e2 !== dz) e2.dead = true; }); GR.step(1 / 30); noLevels(); P.x = 4000; P.y = 100; if (dz.sgDone && dz.sgDone[tk]){ hit3 = true; break; } }
    out.dWalks = d0 > 400 && hit3 && tgt.hp < before - 12; out.dWalksD = d0 + ':' + f + ':' + (tgt ? Math.round(tgt.hp) : '-') + ':' + dz.sgHits;
    G.enemies.length = 0;
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
    /* the picture: --params "view=square|market|harbor|park|roofs|launch|south|hall|lighthouse" */
    var at = { square: [2100, 1700], market: [2100, 600], harbor: [700, 1700], park: [3500, 1600], roofs: [3500, 600], launch: [3500, 2650], south: [2100, 2650], nw: [700, 600], hall: [2100, 1250], lighthouse: [700, 1450], mission: [3400, 2350], post: [2700, 500], library: [1700, 520] };
    if (QA.params.view === 'map'){                                                       /* the whole town on one canvas, laid over the page */
      var cv = document.createElement('canvas'); cv.width = 1400; cv.height = 1050; cv.style.cssText = 'position:fixed;left:0;top:0;width:100vw;height:100vh;z-index:99999;background:#000'; var cx2 = cv.getContext('2d');
      cx2.scale(1400 / ARENA_W, 1050 / ARENA_H); drawGroundSiege(cx2, ARENA_W / 2, ARENA_H / 2, ARENA_W, ARENA_H); document.body.appendChild(cv); QA.done(out); return;
    }
    if (QA.params.view && at[QA.params.view]){ Settings.fxLevel = 1; G.enemies.length = 0; G.spawnQueue = []; G.waveState = 'idle'; P.invuln = 1e9; if (QA.params.damage){ SGB.hall.hp = 45; SGB.library.hp = 12; SGB.library.wrecked = true; SGB.post.hp = 70; SGB.post.alert = 99; SGB.lighthouse.hp = 30; } P.x = at[QA.params.view][0]; P.y = at[QA.params.view][1]; for (var z = 0; z < 8; z++){ G.enemies.length = 0; G.spawnQueue = []; GR.step(1 / 30); } QA.done(out); return; }
    G.wave = 385; out.flags = true;
  } catch (e) { out.err = String(e && e.stack || e); }
  var need = ['table', 'bossWaves', 'tune', 'cast', 'bestiary', 'uniqueLooks', 'saveDefault', 'saveSane', 'wardLen', 'wardOpen', 'waves', 'pool', 'menuLocked', 'menuOpen', 'starts', 'spawns', 'keys5', 'solid', 'inside', 'noOverlap', 'startOpen', 'gatesReach', 'keysReach', 'openShare', 'blocked', 'dStart', 'dHurt', 'dWreck', 'dLeftAlone', 'dPass', 'dCooldown', 'dSapper', 'dHunter', 'dWalks', 'dRepair', 'dHeld', 'dNotHeld', 'dFinale', 'dSave', 'dSave2', 'dDraws'];
  out.failed = need.filter(function(k){ return out[k] !== true; });
  out.pass = out.errs.length === 0 && !out.err && out.failed.length === 0;
  QA.done(out);
})();
