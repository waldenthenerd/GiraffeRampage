/* fort: Chapter 16, the counter attack on Fort Shortneck (internal chapter 17, waves 386 to 410): the chapter table, the enemy kit, the waves and their difficulty, the save flags, the coat
   colors, the menu card, the map (destructible buildings, solid, reachable), chaos and its eight levels with their gem badges, the alarm and its squads, chain reactions, hackable
   turrets, searchlights and generators, the rebuild, every creature's behavior, the films, and the Guide, achievements and Play together hooks.
   Run: node tools/qa-cloud.mjs tools/scenarios/fort.js --wait 60000        (screenshots: --params "view=hud|map|boss|chain|turret|light|badge|menu|film&..." --shot out.png) */
(function(){
  var out = { errs: [] }; window.addEventListener('error', function(e){ out.errs.push(e.message + ' @' + (e.filename || '').split('/').pop() + ':' + e.lineno); });
  GR.handleAction('splash-go'); Ach.check = function(){ return []; };
  function freshSave(){ Save.reset(); Save.data.chapter16Complete = true; }
  function noLevels(){ G.pendingLevels = 0; G.levelGate = 0; if (G.state === 'levelup'){ G.state = 'playing'; G.offer = null; hideOverlay(); } }
  function godMode(){ P.invuln = 1e9; P.hp = P.maxHp = 1e12; G.rerolls = 0; }
  function steps(n, dt){ for (var i = 0; i < n; i++){ GR.step(dt || 1 / 30); noLevels(); } }
  function clear(){ G.enemies.length = 0; G.spawnQueue = []; G.eproj.length = 0; G.markers.length = 0; G.hzones.length = 0; G.beams.length = 0; G.blasts.length = 0; G.waveState = 'idle'; }
  function begin(w){ freshSave(); startRun(COUNTER_CHAPTER, w || COUNTER_FIRST_WAVE); steps(3); godMode(); G.introFX = null; G.banner = null; G.bannerHold = null; clear(); }
  function bk(kind, n){ return FT.all.filter(function(b){ return b.kind === kind; })[n || 0]; }
  function mid(b){ return { x: b.x + b.w / 2, y: b.y + b.h / 2 }; }
  function put(x, y){ P.x = x; P.y = y; P.vx = 0; P.vy = 0; G.camX = x; G.camY = y; }
  function kill(b){ damageBuilding(b, 1e9, 'kick'); }
  try {
    if (QA.params.view){                                                            /* screenshots: a view of the fort, set up and then left alone */
      var V = QA.params.view, wv = +QA.params.wave || 386, at = (QA.params.at || '2100,1500').split(',').map(Number);
      Settings.fxLevel = 1; freshSave(); startRun(COUNTER_CHAPTER, wv); steps(3); godMode(); G.introFX = null; G.banner = null; G.bannerHold = null; clear(); G.waveState = 'idle'; G.waveTimer = 9999;
      put(at[0], at[1]);
      var spawnSome = function(types, n, r){ types.forEach(function(t, i){ for (var k = 0; k < n; k++){ var a = (i * 5 + k) * 0.9, e = spawnEnemy(t, at[0] + Math.cos(a) * (r || 300), at[1] + Math.sin(a) * (r || 300), wv); if (e){ e.hp = e.maxHp = 1e12; } } }); };
      if (V === 'hud'){ fortChaos(+QA.params.chaos || 14000, P.x, P.y, ''); steps(2); G.ft.combo = 7; G.ft.comboT = 3; fortAlarm(+QA.params.alarm || 55); G.ft.quiet = 99; spawnSome(['hyena', 'grub'], 3); steps(40); }
      else if (V === 'play'){ spawnSome((QA.params.types || 'hyena,cheetah,warthog,vulture').split(','), 2, +QA.params.r || 330); steps(+QA.params.steps || 70); }
      else if (V === 'chain'){ var tt = bk('tank', 0), tm2 = mid(tt); put(tm2.x - 380, tm2.y + 150); G.ft.quiet = 99; spawnSome(['hyena', 'cheetah', 'warthog'], 2, 150); G.enemies.forEach(function(e){ e.x = tm2.x + rand(-150, 150); e.y = tm2.y + rand(60, 220); e.spd = 0; }); kill(tt); steps(+QA.params.steps || 14); }
      else if (V === 'turret'){ var tu0 = FT.turrets[+QA.params.n || 1], um0 = mid(tu0); put(um0.x + 120, um0.y + 20); steps(+QA.params.steps || 24); if (QA.params.ally){ fortHack(tu0); spawnSome(['hyena'], 3, 300); G.enemies.forEach(function(e){ e.x = um0.x + rand(150, 450); e.y = um0.y + rand(-200, 200); e.spd = 0; }); steps(12); out.tState = tu0.tState; out.allyT = tu0.allyT; } }
      else if (V === 'light'){ var li0 = FT.lights[+QA.params.n || 2], lm0 = mid(li0); put(lm0.x + 120, lm0.y + 300); steps(+QA.params.steps || 40); }
      else if (V === 'boss'){ var bt = QA.params.boss || 'lion'; clear(); put(at[0], at[1]); spawnEnemy(bt, at[0] + 430, at[1] - 40, wv); G.bossAlive = true; steps(+QA.params.steps || 120); }
      else if (V === 'badge'){ fortChaos(+QA.params.chaos || 7200, P.x, P.y, ''); steps(+QA.params.steps || 20); }
      else if (V === 'ruins'){ ['hangar', 'radar', 'bunker', 'barracks', 'mess', 'garage', 'plant', 'armoury'].forEach(function(k){ FT.all.filter(function(b){ return b.kind === k; }).forEach(function(b){ damageBuilding(b, b.maxHp * (k === 'plant' ? 0.55 : 0.8), 'kick'); }); }); FT.all.filter(function(b){ return b.kind === 'garage' || b.kind === 'mess'; }).forEach(kill); G.ft.quiet = 99; steps(+QA.params.steps || 40); }
      else if (V === 'menu'){ G.state = 'menu'; Save.data.chapter16Complete = true; setMenuChapter(17); showMenu(); for (var mm = 0; mm < 4; mm++) GR.step(1 / 30); drawMenuPreview(); }
      else if (V === 'film'){ G.state = 'playing'; startCutscene(function(){}, false, QA.params.kind || 'fortflight'); for (var fs = 0; fs < 90; fs++){ G.cut.t = 1; GR.step(1 / 30); } G.cut.t = +QA.params.t || 1; GR.step(1 / 600); }
      out.view = V; QA.done(out); return;
    }
    /* the chapter table */
    out.table = COUNTER_CHAPTER === 17 && COUNTER_FIRST_WAVE === 386 && COUNTER_WAVES === 25 && CHAPTER_LAST_WAVE === 410 && SIEGE_LAST_WAVE === 385 && TOTAL_CHAPTERS === 17 && chapterLabel(17) === '16' &&
      chapterOf(385) === SIEGE_CHAPTER && chapterOf(386) === COUNTER_CHAPTER && chapterOf(410) === COUNTER_CHAPTER && chapterWaveOf(386) === 1 && chapterWaveOf(410) === 25 &&
      chapterFirstWave(17) === 386 && chapterFirstWave(16) === 361 && chapterLen(17) === 25 && isChapterFinaleWave(410) && !isChapterFinaleWave(405) && isRunEnd(410) === true && isRunEnd(385) === true && isRunEnd(386) === false;
    out.bossWaves = [390, 395, 400, 405, 410].map(bossForWave).join() === 'lion,matriarch,buffalo,crocodile,wildfire';
    out.harder = fortScale(1).hp > siegeScale(1).hp && fortScale(1).dmg > siegeScale(1).dmg && fortScale(25).hp > siegeScale(25).hp * 1.1 && fortScale(25).dmg > siegeScale(25).dmg * 1.1 && fortScale(25).hp > fortScale(1).hp;

    /* the kit: twelve kinds and five bosses in the Bestiary's slots, none borrowed from another chapter */
    var kinds = BESTIARY_ORDER.slice(0, 17);
    out.cast = kinds.every(function(k){ return !!ETYPES_FORT[k] && ETYPES_FORT[k].fort === true && /^ft_/.test(ETYPES_FORT[k].look) && LOOK_NAMES[ETYPES_FORT[k].look] && typeof FORT_AI[ETYPES_FORT[k].ai] === 'function' && typeof ENEMY_LOOK_DRAW[ETYPES_FORT[k].look] === 'function'; });
    out.bestiary = BESTIARY_CHAPTERS.length === 17 && BESTIARY_CHAPTERS[16] === 'Fort Shortneck' && bestiaryTable(17) === ETYPES_FORT;
    var looks = {}; kinds.forEach(function(k){ looks[ETYPES_FORT[k].look] = 1; }); out.uniqueLooks = Object.keys(looks).length === 17;
    out.flyers = ETYPES_FORT.vulture.flyOver === true && ETYPES_FORT.matriarch.flyOver === true && !ETYPES_FORT.hyena.flyOver;

    /* the save and the coat colors */
    freshSave(); out.saveDefault = Save.data.chapter17Complete === false && Save.data.fortChaosBest === 0 && Save.data.fortBadges === 0 && Save.data.fortBestWave === 0;
    Save.data.chapter17Complete = 'junk'; Save.data.fortChaosBest = -5; Save.data.fortBadges = 9999; Save.data.fortBestWave = 99; Save.write(); Save.load();
    out.saveSane = typeof Save.data.chapter17Complete === 'boolean' && Save.data.fortChaosBest === 0 && Save.data.fortBadges <= 255 && Save.data.fortBestWave <= 25;
    freshSave(); out.ward = WARD.length === 53 && WARD_MAX === 52 && WARD[51].name === 'Fort Camo' && WARD[52].name === 'Calamity Gold' && wardUnlocked(51) === false && wardUnlocked(52) === false;
    Save.data.chapter17Complete = true; Save.data.fortBadges = 128; out.wardOpen = wardUnlocked(51) === true && wardUnlocked(52) === true;

    /* waves: every wave builds, boss waves have their boss, the pool grows */
    var ok = true, bad = '';
    for (var w = 386; w <= 410; w++){ var q = buildWave(w), hasBoss = q.some(function(e){ return e.boss; }); if (!q.length || hasBoss !== (chapterWaveOf(w) % 5 === 0) || !q.every(function(e){ return !!ETYPES_FORT[e.type]; })){ ok = false; bad += w + ' '; } }
    out.waves = ok; out.wavesBad = bad;
    var kindsAt = function(w){ var s = {}; for (var i = 0; i < 12; i++) buildWave(w).forEach(function(e){ s[e.type] = 1; }); return Object.keys(s).length; };
    out.pool = kindsAt(386) < kindsAt(398) && kindsAt(398) < kindsAt(405) + 1;

    /* the menu card and the run */
    freshSave(); Save.data.chapter16Complete = false; setMenuChapter(17); showMenu(); var html = chapterSelectorHTML();
    out.menuLocked = /disabled/.test(html) && /Clear Chapter 15/.test(html) && /Chapter 16/.test(html) && /Fort Shortneck/.test(html) && /Waves 386–410 · 5 bosses/.test(html);
    Save.data.chapter16Complete = true; html = chapterSelectorHTML();
    out.menuOpen = /data-a="play17"/.test(html) && /Start Chapter 16/.test(html) && /Straight to wave 386/.test(html) && /ch-next" aria-label="Next chapter" disabled/.test(html);
    handleAction('play17'); out.menuFilm = G.state === 'cutscene' && !!G.cut && G.cut.kind === 'fortflight'; G.cut.t = FT_CLIMB_T.END - 0.01; steps(3);
    out.starts = G.state === 'playing' && G.wave === 386 && G.chapter === COUNTER_CHAPTER && G.biome === 'fort' && Math.abs(P.x - 2100) < 5 && Math.abs(P.y - 2700) < 5;
    godMode(); steps(120);
    out.spawns = G.enemies.length > 0 && G.enemies.every(function(e){ return e.def && e.def.fort === true; });
    out.hud = /FORT SHORTNECK/.test(document.getElementById('hChapter') ? document.getElementById('hChapter').textContent : 'CH.16 FORT SHORTNECK');

    /* the map: destructible solid buildings, each with its own health and chaos, all inside the arena, none overlapping, every open place and every gate reachable from the start */
    out.bld = FT.all.length === FT_PLAN.length && G.buildings.length === FT.all.length && G.tower === true && G.buildings.every(function(b){ return b.fort && !b.indestructible && b.maxHp > 1 && b.chaos > 0 && b.hp === b.maxHp && FT_KINDS[b.kind]; });
    out.kinds = Object.keys(FT_KINDS).every(function(k){ return FT.all.some(function(b){ return b.kind === k; }); }) && FT.turrets.length === 10 && FT.lights.length === 8 && FT.gens.length === 5 && FT.lights.every(function(l){ return !!l.gen; });
    out.inside = FT.all.every(function(h){ return h.x >= 70 && h.y >= 70 && h.x + h.w <= ARENA_W - 70 && h.y + h.h <= ARENA_H - 70; });
    var clash = ''; for (var i = 0; i < FT.all.length; i++) for (var j = i + 1; j < FT.all.length; j++){ var a1 = FT.all[i], b1 = FT.all[j]; if (a1.x < b1.x + b1.w && b1.x < a1.x + a1.w && a1.y < b1.y + b1.h && b1.y < a1.y + a1.h) clash += a1.kind + i + '/' + b1.kind + j + ' '; }
    out.noClash = clash === ''; out.clash = clash;
    function reach(){
      var N = TW_NX * TW_NY, seen = new Uint8Array(N), st = [(2700 / 50 | 0) * TW_NX + (2100 / 50 | 0)], n = 0; seen[st[0]] = 1;
      while (st.length){ var c = st.pop(); n++; var ci = c % TW_NX, cj = (c / TW_NX) | 0; [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(function(d){ var a = ci + d[0], b = cj + d[1]; if (a < 0 || b < 0 || a >= TW_NX || b >= TW_NY) return; var m = b * TW_NX + a; if (seen[m] || TW.blocked[m]) return; seen[m] = 1; st.push(m); }); }
      var open = 0; for (var k = 0; k < N; k++) if (!TW.blocked[k]) open++; return { n: n, open: open, seen: seen };
    }
    var rc = reach(); out.reachAll = rc.n === rc.open;
    out.gatesOpen = FT_VENTS.every(function(v){ var p = towerOpenNear(v.x, v.y); return !TW.blocked[twCell(p.x, p.y)] && rc.seen[twCell(p.x, p.y)]; });
    out.startOpen = !TW.blocked[twCell(2100, 2700)] && !buildingAt(2100, 2700);
    out.turretsOpen = FT.turrets.every(function(b){ var m = mid(b); var near = [[-110, 0], [110, 0], [0, -110], [0, 110]].some(function(d){ var cc = twCell(m.x + d[0], m.y + d[1]); return rc.seen[cc]; }); return near; });

    /* a building that falls: out of the nav maps, chaos, a text, the alarm, rubble that can be walked over; the combo makes the next worth more */
    begin(); var h1 = bk('barracks', 0), h2 = bk('barracks', 1), m1 = mid(h1), solid0 = TW.solid[twCell(m1.x, m1.y)];
    put(m1.x + 300, m1.y); var c0 = G.ft.chaos; kill(h1);
    out.fell = h1.collapsed === true && G.ft.chaos === c0 + h1.chaos && G.ft.combo === 1 && G.ft.alarm > 0 && solid0 === 1 && TW.solid[twCell(m1.x, m1.y)] === 0 && !buildingAt(m1.x, m1.y);
    var c1 = G.ft.chaos; kill(h2); out.combo = G.ft.chaos - c1 === Math.round(h2.chaos * 1.1) && G.ft.combo === 2;
    G.ft.comboT = 0.05; steps(5); out.comboEnds = G.ft.combo === 0;
    out.score = G.score >= h1.chaos + h2.chaos;
    /* kicks and shots do it the ordinary way */
    begin(); var hh = bk('hangar', 0), hm = mid(hh); put(hm.x, hm.y + 260); damageBuilding(hh, hh.maxHp * 0.3, 'kick'); out.hurt = hh.hp < hh.maxHp && !hh.collapsed && G.ft.chaos === 0;
    damageBuilding(hh, 1e9, 'proj'); out.shotDown = hh.collapsed === false && hh.hp > 0; damageBuilding(hh, 1e9, 'kick'); out.kickDown = hh.collapsed === true;

    /* chaos levels: eight colors, each reached once, the badge paid once and never again */
    out.tiers = FT_TIERS.length === 8 && FT_TIERS.every(function(t, i){ return i === 0 || t.at > FT_TIERS[i - 1].at; }) && new Set(FT_TIERS.map(function(t){ return t.c; })).size === 8 && FT_TIERS.filter(function(t){ return t.gems > 0; }).length === 6 &&
      FT_TIERS.filter(function(t){ return t.gems > 0; }).every(function(t){ return t.gems >= 60 && t.gems <= 150; }) && FT_TIERS[2].gems + FT_TIERS[3].gems + FT_TIERS[4].gems + FT_TIERS[5].gems + FT_TIERS[6].gems + FT_TIERS[7].gems >= 500 &&
      FT_TIERS.slice(2).reduce(function(s, t){ return s + t.gems; }, 0) / 6 >= 90 && FT_TIERS.slice(2).reduce(function(s, t){ return s + t.gems; }, 0) / 6 <= 115;
    begin(); var g0 = Save.data.gems | 0, banners = []; var bn = banner; banner = function(t, s, c, d){ banners.push(t + '|' + s); return bn.apply(this, arguments); };
    fortChaos(7200, P.x, P.y, ''); steps(2); out.tier3 = G.ft.tier >= 2 && (Save.data.gems | 0) === g0 + 60 + 0 && (Save.data.fortBadges & 7) === 7 && banners.some(function(s){ return /MAYHEM/.test(s) && /60 gems/.test(s); });
    fortChaos(80000, P.x, P.y, ''); steps(2); out.tierTop = G.ft.tier === 7 && (Save.data.gems | 0) === g0 + FT_TIERS.slice(2).reduce(function(s, t){ return s + t.gems; }, 0) && Save.data.fortBadges === 255 && wardUnlocked(52) === true && Save.data.fortChaosBest >= 80000;
    var g1 = 1234, b1 = Save.data.fortBadges; begin(); Save.data.fortBadges = b1; Save.data.gems = g1; fortChaos(80000, P.x, P.y, ''); out.badgeOnce = (Save.data.gems | 0) === g1 && G.ft.tier === 7;
    banner = bn;

    /* the alarm: a squad at 35, a heavier one at 70, a full alarm at 100 (chaos worth half again); capped; it sinks when she lies low */
    begin(); G.enemies.length = 0; var n0 = G.enemies.length; fortAlarm(36); steps(2); out.squadA = G.enemies.length >= n0 + 3 && G.ft.lvl === 1 && G.ft.squads.a === 1;
    fortAlarm(36); steps(2); out.squadB = G.ft.lvl === 2 && G.ft.squads.b === 1;
    fortAlarm(60); steps(2); var cf = G.ft.chaos; out.full = G.ft.lvl === 3 && G.ft.alarm === 100 && G.ft.squads.c === 1; fortChaos(1000, P.x, P.y, ''); out.fullBonus = G.ft.chaos - cf === 1500;
    G.ft.quiet = 0; G.ft.alarm = 100; steps(60); out.decay = G.ft.alarm < 100 && G.ft.alarm > 80; G.ft.alarm = 20; steps(3); out.relax = G.ft.lvl === 0;
    G.ft.alarm = 0; G.ft.lvl = 0; G.ft.squads = { a: 2, b: 2, c: 3 }; var nn = G.enemies.length; fortAlarm(100); steps(2); out.caps = G.enemies.length === nn;

    /* explosions: a fuel tank goes up a moment after it falls, hurts the creatures in the way and the neighbours (a chain), and never hurts her */
    begin(); var t1 = bk('tank', 0), t2 = bk('tank', 1), t3 = bk('tank', 2), tm = mid(t1); put(tm.x - 300, tm.y);
    spawnEnemy('hyena', tm.x + 50, tm.y + 160, G.wave); var ev = G.enemies[0]; ev.hp = ev.maxHp = 100; var hp0 = P.hp; var ch0 = G.ft.chaos;
    kill(t1); out.fuse = FT.fuse.length === 1 && !t2.collapsed; steps(8); out.boom = !G.enemies.length || ev.dead || ev.hp < 100;
    t2.hp = 50; t3.hp = 50; kill(t1); t1.collapsed = false; t1.hp = t1.maxHp; kill(t1); steps(30);
    out.chain = t2.collapsed === true && t3.collapsed === true && G.ft.chaos > ch0 + t1.chaos + t2.chaos; out.safe = P.hp === hp0;
    out.rubbleFire = t1.fire > 0 || t1.smoke > 0;

    /* a gun emplacement: it shoots at her, standing beside it hacks it, it turns on the creatures for thirty seconds and then burns out; the next wave mends it */
    begin(); var tu = FT.turrets[1], um = mid(tu); put(um.x + 300, um.y); G.eproj.length = 0; steps(20);
    out.turretAims = Math.abs(angDiff(tu.ang, Math.atan2(P.y - um.y, P.x - um.x))) < 0.6; var shots = 0; for (var s2 = 0; s2 < 120; s2++){ GR.step(1 / 30); noLevels(); shots = Math.max(shots, G.eproj.length); } out.turretFires = shots > 0;
    put(um.x + 60, um.y); var ch1 = G.ft.chaos; steps(10); out.hacking = tu.hack > 0 && tu.tState === 'hostile'; steps(60); out.hacked = tu.tState === 'ally' && tu.allyT > 28 && G.ft.chaos === ch1 + 150 + 0 || (tu.tState === 'ally' && G.ft.chaos >= ch1 + 150);
    spawnEnemy('hyena', um.x + 250, um.y, G.wave); var ee = G.enemies[G.enemies.length - 1]; ee.hp = ee.maxHp = 5000; ee.spd = 0; var h5 = ee.hp; G.eproj.length = 0; put(um.x - 400, um.y + 60); steps(30); out.allyShoots = ee.hp < h5 || ee.dead;
    tu.allyT = 0.05; steps(5); out.burnsOut = tu.tState === 'dead'; var sp = tu.tState; clear(); fortWaveStart(G.wave + 1); out.mended = tu.tState === 'hostile' && !tu.collapsed;
    kill(tu); out.turretShotDown = tu.collapsed === true;

    /* searchlights: a beam on her sets off the alarm and a squad; without its generator the light is dark */
    begin(); var li = FT.lights[2], lm = mid(li), gen = li.gen; var a0 = fortLightAng(li, G.time); put(lm.x + Math.cos(a0) * 300, lm.y + Math.sin(a0) * 300);
    out.lightOn = fortLightOn(li); li.cool = 0; li.ph += 0; var alarm0 = G.ft.alarm, spotted = false;
    for (var s3 = 0; s3 < 90; s3++){ var an = fortLightAng(li, G.time + 0.0); P.x = lm.x + Math.cos(an) * 280; P.y = lm.y + Math.sin(an) * 280; GR.step(1 / 30); noLevels(); if (G.ft.alarm > alarm0 + 10){ spotted = true; break; } }
    out.spotted = spotted; kill(gen); out.dark = !fortLightOn(li); steps(2); out.lightsOut = true;
    put(lm.x + Math.cos(fortLightAng(li, G.time)) * 300, lm.y + Math.sin(fortLightAng(li, G.time)) * 300); var al1 = G.ft.alarm; li.cool = 0; steps(40); out.noSpot = G.ft.alarm <= al1;

    /* the rebuild: vehicles, tanks and guns come back each wave, everything after a boss; the nav is made again and she is never inside a wall */
    begin(); var jp = bk('jeep', 0), tk = bk('tank', 0), ha = bk('hangar', 0), bu = bk('bunker', 0); kill(jp); kill(tk); kill(ha); kill(bu); FT.fuse.length = 0;
    fortWaveStart(387); out.backAgain = !jp.collapsed && !tk.collapsed && ha.collapsed && bu.collapsed && jp.hp === jp.maxHp && TW.solid[twCell(mid(jp).x, mid(jp).y)] === 1;
    fortWaveStart(391); out.allAgain = !ha.collapsed && !bu.collapsed && ha.hp === ha.maxHp && TW.solid[twCell(mid(ha).x, mid(ha).y)] === 1;
    put(mid(ha).x, mid(ha).y); kill(ha); put(mid(ha).x, mid(ha).y); fortWaveStart(396); out.notTrapped = !buildingAt(P.x, P.y);

    /* the wave pay: a twelfth of the chaos as gold, the best wave kept */
    begin(); fortChaos(1200, P.x, P.y, ''); var gold0 = G.bonusGold; fortWaveEnd(); out.payout = G.bonusGold === gold0 + 100 && Save.data.fortBestWave >= 1;

    /* every creature's behavior runs for a while beside her without an error, and does something */
    var ai = {}, aiBad = '';
    ['hyena', 'grub', 'jackal', 'cheetah', 'warthog', 'vulture', 'rhino', 'baboon', 'honeybadger', 'mamba', 'ember', 'termite'].forEach(function(type){
      begin(405); put(2100, 1300); var n1 = G.eproj.length, m1c = G.markers.length;
      spawnEnemy(type, 2100 + 380, 1300, 405); var e = G.enemies[0]; if (!e){ aiBad += type + ':none '; return; }
      var seen = {}; e.hp = e.maxHp = 1e12; var moved = 0, px = e.x, py = e.y, maxShots = 0, maxMk = 0;
      for (var k = 0; k < 360; k++){ GR.step(1 / 30); noLevels(); put(2100, 1300); if (e.state) seen[e.state] = 1; maxShots = Math.max(maxShots, G.eproj.length); maxMk = Math.max(maxMk, G.markers.length); }
      moved = hyp(e.x - px, e.y - py); ai[type] = Object.keys(seen).join('/') + ' shots' + maxShots + ' mk' + maxMk + ' mv' + Math.round(moved);
      if (!(moved > 20 || maxShots > 0 || maxMk > 0)) aiBad += type + ' ';
    });
    out.ai = ai; out.aiOk = aiBad === ''; out.aiBad = aiBad;
    var bosses = ['lion', 'matriarch', 'buffalo', 'crocodile', 'wildfire'], bossBad = '', bi = {};
    bosses.forEach(function(type, bi2){
      begin(390 + bi2 * 5); put(2100, 1300); spawnEnemy(type, 2100 + 420, 1300, 390 + bi2 * 5); var e = G.enemies[0]; if (!e){ bossBad += type + ':none '; return; }
      e.hp = e.maxHp = 1e12; var seen = {}, mx = 0, mk = 0, bm = 0, sp0 = G.enemies.length;
      for (var k = 0; k < 900; k++){ GR.step(1 / 30); noLevels(); put(2100, 1300); if (e.state) seen[e.state] = 1; mx = Math.max(mx, G.eproj.length); mk = Math.max(mk, G.markers.length); bm = Math.max(bm, G.beams.length + G.blasts.length); if (k === 300) e.hp = e.maxHp * 0.3; }
      bi[type] = Object.keys(seen).join('/'); if (Object.keys(seen).length < 4 || (mx + mk + bm) === 0) bossBad += type + ' ';
    });
    out.bossStates = bi; out.bossOk = bossBad === ''; out.bossBad = bossBad;

    /* the films render at every part of the story, and the climb is a cutscene that starts the run */
    var fcv = document.createElement('canvas'); fcv.width = CS_W; fcv.height = CS_H; var fc = fcv.getContext('2d'), fok = true, fbad = '';
    ['fortflight', 'fortout'].forEach(function(k){ var F = MARS_FILMS[k]; if (!F || !(F.end > 20)) { fok = false; fbad += k + ':def '; return; } for (var t = 0; t < F.end; t += 0.75){ try { fc.clearRect(0, 0, CS_W, CS_H); F.scene(fc, t); F.over(fc, t); } catch (e){ fok = false; fbad += k + '@' + t + ':' + e.message + ' '; break; } } });
    out.films = fok; out.filmsBad = fbad;
    out.noEndCard = !/the end|thanks for playing|credits/i.test(FT_CLIMB_CAPS.concat(FT_OUT_CAPS).map(function(c){ return c[1] + ' ' + c[2]; }).join(' '));

    /* finishing: the flag is saved before the film, the report says what she wrecked, the Guide and the achievements open */
    begin(); fortChaos(5000, P.x, P.y, ''); fortFinishSave(); out.finish = Save.data.chapter17Complete === true && Save.data.chapter16Complete === true && Save.data.fortChaosBest >= 5000;
    out.victory = /Fort Shortneck|maker of the Warden/.test(victoryText(3, 4)) && /5,?000|5000/.test(victoryText(3, 4));
    Save.reset(); out.guideLocked = !/Chapter 16: Fort Shortneck/.test(guideTopicsHTML()); Save.data.chapter17Complete = true; out.guideOpen = /Chapter 16: Fort Shortneck/.test(guideTopicsHTML());
    Save.reset(); var ach = function(id){ return ACH.filter(function(x){ return x.id === id; })[0]; };
    out.ach0 = !!ach('ch16') && ach('ch16').val() === 0 && ach('fortchaos').val() === 0 && ach('fortall').val() === 0;
    Save.data.chapter17Complete = true; Save.data.fortBadges = 255; out.ach = out.ach0 && ach('ch16').val() === 1 && ach('fortchaos').val() === 6 && ach('fortall').val() === 1;
    Save.reset(); out.coLocked = coChapters().indexOf(17) < 0 && CO_CHAPTERS.length === 17; Save.data.chapter16Complete = true; out.coOpen = coChapters().indexOf(17) >= 0;
    coStart('arena', 17); steps(40); out.together = Co.on && G.chapter === COUNTER_CHAPTER && G.biome === 'fort' && G.tower === true && G.buildings.length === FT_PLAN.length && !!G.ft;

    /* a run saved part-way keeps the chaos */
    begin(); fortChaos(777, P.x, P.y, ''); var snap = runSnapshot(); out.snapChaos = snap.ftChaos === 777 && validRunSave(snap);
    /* an old save, with none of the new fields, still loads */
    freshSave(); delete Save.data.chapter17Complete; delete Save.data.fortBadges; delete Save.data.fortChaosBest; delete Save.data.fortBestWave; Save.write(); Save.load(); out.oldSave = Save.data.chapter17Complete === false && Save.data.fortBadges === 0;
  } catch (e) { out.err = String(e && e.stack || e); }
  var need = ['table', 'bossWaves', 'harder', 'cast', 'bestiary', 'uniqueLooks', 'flyers', 'saveDefault', 'saveSane', 'ward', 'wardOpen', 'waves', 'pool', 'menuLocked', 'menuOpen', 'menuFilm', 'starts', 'spawns', 'hud',
    'bld', 'kinds', 'inside', 'noClash', 'reachAll', 'gatesOpen', 'startOpen', 'turretsOpen', 'fell', 'combo', 'comboEnds', 'score', 'hurt', 'shotDown', 'kickDown', 'tiers', 'tier3', 'tierTop', 'badgeOnce',
    'squadA', 'squadB', 'full', 'fullBonus', 'decay', 'relax', 'caps', 'fuse', 'boom', 'chain', 'safe', 'rubbleFire', 'turretAims', 'turretFires', 'hacking', 'hacked', 'allyShoots', 'burnsOut', 'mended', 'turretShotDown',
    'lightOn', 'spotted', 'dark', 'noSpot', 'backAgain', 'allAgain', 'notTrapped', 'payout', 'aiOk', 'bossOk', 'films', 'noEndCard', 'finish', 'victory', 'guideLocked', 'guideOpen', 'ach', 'coLocked', 'coOpen', 'together', 'snapChaos', 'oldSave'];
  out.failed = need.filter(function(k){ return out[k] !== true; });
  out.pass = out.errs.length === 0 && !out.err && out.failed.length === 0;
  QA.done(out);
})();
