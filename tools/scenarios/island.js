/* island: Chapter 17, the Island Lab (internal chapter 18, waves 411 to 435): the chapter table, the kit and its art, the waves and their difficulty, the save flags, the coat color and
   pattern, the menu card, the map (the shallows match what is painted, solid props, every open place and every vent reachable), wading, the swimmers and the hiders, every creature's
   and boss's behavior, the scientist on the boss waves, the films, the minigame, the photo codes, the Guide, the achievements, Play together and the ending.
   Run: node tools/qa-cloud.mjs tools/scenarios/island.js --wait 60000        (screenshots: --params "view=play|boss|lab|tank|menu|bestiary|film|glimpse&..." --shot out.png) */
(function(){
  var out = { errs: [] }; window.addEventListener('error', function(e){ out.errs.push(e.message + ' @' + (e.filename || '').split('/').pop() + ':' + e.lineno); });
  GR.handleAction('splash-go'); var realCheck = Ach.check; Ach.check = function(){ return []; };
  function freshSave(){ Save.reset(); Save.data.chapter17Complete = true; }
  function noLevels(){ G.pendingLevels = 0; G.levelGate = 0; if (G.state === 'levelup'){ G.state = 'playing'; G.offer = null; hideOverlay(); } }
  function godMode(){ P.invuln = 1e9; P.hp = P.maxHp = 1e12; G.rerolls = 0; }
  function steps(n, dt){ for (var i = 0; i < n; i++){ GR.step(dt || 1 / 30); noLevels(); } }
  function clear(){ G.enemies.length = 0; G.spawnQueue = []; G.eproj.length = 0; G.markers.length = 0; G.hzones.length = 0; G.beams.length = 0; G.blasts.length = 0; G.waveState = 'idle'; G.waveTimer = 9999; }
  function begin(w){ freshSave(); startRun(ISLE_CHAPTER, w || ISLE_FIRST_WAVE); steps(3); godMode(); G.introFX = null; G.banner = null; G.bannerHold = null; clear(); }
  function put(x, y){ P.x = x; P.y = y; P.vx = 0; P.vy = 0; G.camX = x; G.camY = y; }
  function inWall(x, y, m){ return IL.all.some(function(b){ return x > b.x - (m || 0) && x < b.x + b.w + (m || 0) && y > b.y - (m || 0) && y < b.y + b.h + (m || 0); }); }
  try {
    if (QA.params.view){                                                            /* screenshots: a view of the island, set up and then left alone */
      var V = QA.params.view, wv = +QA.params.wave || 411, at = (QA.params.at || '2130,2700').split(',').map(Number);
      Settings.fxLevel = 1; freshSave(); startRun(ISLE_CHAPTER, wv); steps(3); godMode(); G.introFX = null; G.banner = null; G.bannerHold = null; clear();
      put(at[0], at[1]);
      var spawnSome = function(types, n, r){ types.forEach(function(t, i){ for (var k = 0; k < n; k++){ var a = (i * 5 + k) * 0.9, e = spawnEnemy(t, at[0] + Math.cos(a) * (r || 300), at[1] + Math.sin(a) * (r || 300), wv); if (e){ e.hp = e.maxHp = 1e12; } } }); };
      if (V === 'play'){ spawnSome((QA.params.types || 'hyena,jackal,warthog,vulture,cheetah,termite').split(','), +QA.params.n || 1, +QA.params.r || 260); steps(+QA.params.steps || 50); }
      else if (V === 'boss'){ var bt = QA.params.boss || 'lion'; spawnEnemy(bt, at[0] + 380, at[1] - 40, wv); G.bossAlive = true; G.enemies[0].hp = G.enemies[0].maxHp = 1e12; steps(+QA.params.steps || 90); }
      else if (V === 'glimpse'){ clear(); startWave(+QA.params.wave || 415); G.introFX = null; G.banner = null; G.bannerHold = null; clear(); steps(+QA.params.steps || 30); }
      else if (V === 'lab'){ put(+QA.params.x || 1000, +QA.params.y || 520); steps(20); }
      else if (V === 'tank'){ put(2100, 420); spawnEnemy('wildfire', 2100, 300, 435); G.enemies[0].hp = G.enemies[0].maxHp = 1e12; G.bossAlive = true; steps(+QA.params.steps || 120); }
      else if (V === 'menu'){ G.state = 'menu'; Save.data.chapter17Complete = true; setMenuChapter(18); showMenu(); for (var mm = 0; mm < 4; mm++) GR.step(1 / 30); drawMenuPreview(); }
      else if (V === 'bestiary'){ G.state = 'menu'; Object.keys(ETYPES_ISLE).forEach(function(k){ recordBestiaryKill({ type: k, def: ETYPES_ISLE[k], waveRef: 415, big: !!ETYPES_ISLE[k].big }); }); showBestiary(18); for (var bb = 0; bb < 4; bb++) GR.step(1 / 30); }
      else if (V === 'enter'){ var be = spawnEnemy(QA.params.boss || 'lion', at[0] + 400, at[1] - 300, wv); be.hp = be.maxHp = 1e12; G.bossAlive = true; var es = +QA.params.steps || 40; for (var q1 = 0; q1 < es; q1++){ GR.step(1 / 30); noLevels(); put(at[0], at[1]); } if (QA.params.cam === 'boss'){ G.camX = be.x; G.camY = be.y; } }
      else if (V === 'feed'){ startWave(435); G.introFX = null; G.banner = null; G.bannerHold = null; clear(); G.il.glimpse = null; var bz = spawnEnemy('wildfire', 2100, 400, 435); bz.hp = bz.maxHp = 1e12; G.bossAlive = true; for (var q2 = 0; q2 < (+QA.params.steps || 40); q2++){ GR.step(1 / 30); noLevels(); put(at[0], at[1]); } }
      else if (V === 'watch'){ var si = +QA.params.s || 0, sp = ilSightXY(ISLE_SIGHT[si]); put(+QA.params.x || sp.x + 320, +QA.params.y || sp.y + 160); G.il.sightIn = undefined; G.il.sight = { i: si, t: 0, ph: 'look', x: sp.x, y: sp.y, a: 0, f: 0 }; steps(+QA.params.steps || 20); G.camX = (P.x + sp.x) / 2; G.camY = (P.y + sp.y) / 2; }
      else if (V === 'note'){ var ni = +QA.params.n || 0, N = ISLE_NOTES[ni]; Save.data.isleNotes = 0; put(N.x + 120, N.y + 60); steps(4); if (QA.params.take){ put(N.x, N.y); steps(+QA.params.take); } }
      else if (V === 'touch'){ var pm = IL.all.filter(function(b){ return b.kind === 'palm'; })[+QA.params.p || 0]; put(pm.x + 25, pm.y + 110); steps(2); ilPalmKnock(pm); if (QA.params.wade){ put(at[0], at[1]); var wvx = +QA.params.vx || 200, wvy = +QA.params.vy || 0; for (var q3 = 0; q3 < (+QA.params.steps || 40); q3++){ P.vx = wvx; P.vy = wvy; GR.step(1 / 30); noLevels(); } G.camX = P.x; G.camY = P.y; } else steps(+QA.params.steps || 12); }
      else if (V === 'film'){ G.state = 'playing'; startCutscene(function(){}, false, QA.params.kind || 'islesail'); for (var fs = 0; fs < 90; fs++){ G.cut.t = 1; GR.step(1 / 30); } G.cut.t = +QA.params.t || 1; GR.step(1 / 600); }
      out.view = V; QA.done(out); return;
    }
    /* the chapter table */
    out.table = ISLE_CHAPTER === 18 && ISLE_FIRST_WAVE === 411 && ISLE_WAVES === 25 && CHAPTER_LAST_WAVE === 435 && COUNTER_LAST_WAVE === 410 && TOTAL_CHAPTERS === 19 && chapterLabel(18) === '17' &&
      chapterOf(410) === COUNTER_CHAPTER && chapterOf(411) === ISLE_CHAPTER && chapterOf(435) === ISLE_CHAPTER && chapterWaveOf(411) === 1 && chapterWaveOf(435) === 25 &&
      chapterFirstWave(18) === 411 && chapterFirstWave(17) === 386 && chapterLen(18) === 25 && isChapterFinaleWave(435) && isRunEnd(435) === true && isRunEnd(410) === true && isRunEnd(411) === false;
    out.bossWaves = [415, 420, 425, 430, 435].map(bossForWave).join() === 'lion,matriarch,buffalo,crocodile,wildfire';
    out.harder = isleScale(1).hp >= fortScale(25).hp && isleScale(1).dmg >= fortScale(25).dmg && isleScale(25).hp > isleScale(1).hp * 1.3;
    out.tune = Math.abs(ISLE_TUNE.hpX - 1.65 * 1.33) < 1e-9 && Math.abs(ISLE_TUNE.dmgX - 1.75 * 1.33) < 1e-9;      /* a third harder than the first tuning */

    /* the kit: twelve kinds and five bosses in the Bestiary's slots, all new, each drawn and each with a behavior */
    var kinds = BESTIARY_ORDER.slice(0, 17);
    out.cast = kinds.every(function(k){ var d = ETYPES_ISLE[k]; return !!d && d.isle === true && /^il_/.test(d.look) && LOOK_NAMES[d.look] && typeof ISLE_AI[d.ai] === 'function' && typeof ENEMY_LOOK_DRAW[d.look] === 'function'; });
    out.bestiary = BESTIARY_CHAPTERS.length === 19 && BESTIARY_CHAPTERS[17] === 'The Island Lab' && bestiaryTable(18) === ETYPES_ISLE;
    var looks = {}; kinds.forEach(function(k){ looks[ETYPES_ISLE[k].look] = 1; }); out.uniqueLooks = Object.keys(looks).length === 17;
    out.traits = ETYPES_ISLE.vulture.flyOver === true && ETYPES_ISLE.matriarch.flyOver === true && !ETYPES_ISLE.hyena.flyOver && ETYPES_ISLE.warthog.shieldArc > 0 && ETYPES_ISLE.jackal.swim && ETYPES_ISLE.mamba.swim && !ETYPES_ISLE.warthog.swim;
    /* every picture draws without an error, in every state its behavior uses */
    var acv = document.createElement('canvas'); acv.width = acv.height = 400; var ac = acv.getContext('2d'), artBad = '';
    kinds.forEach(function(k){ var d = ETYPES_ISLE[k]; ['idle', 'lunge', 'wind', 'roll', 'snapwind', 'zapwind', 'ram', 'lobwind', 'punch', 'strike', 'puff', 'heal', 'roar', 'sweep', 'bubble', 'rainwind', 'charge', 'bitewind', 'coil', 'inkwind'].forEach(function(st){
      try { ac.save(); ac.translate(200, 200); ENEMY_LOOK_DRAW[d.look](ac, { type: k, def: d, r: d.r, anim: 1.7, state: st, flash: 0, big: !!d.big, ang: 0, x: 0, y: 0, phase: 2, glow: 0.5 }, d.color, d.dark, 0, false, d); ac.restore(); } catch (e){ ac.restore(); artBad += k + ':' + st + ':' + e.message + ' '; } }); });
    out.art = artBad === ''; out.artBad = artBad;

    /* the save and the coat colors */
    freshSave(); out.saveDefault = Save.data.chapter18Complete === false && Save.data.isleClean === 0 && Save.data.isleDry === false && Save.data.isleNotes === 0;
    Save.data.chapter18Complete = 'junk'; Save.data.isleClean = 9999; Save.data.isleDry = 'x'; Save.data.isleNotes = 'lots'; Save.write(); Save.load();
    out.saveSane = typeof Save.data.chapter18Complete === 'boolean' && Save.data.isleClean <= 31 && Save.data.isleDry === true && Save.data.isleNotes === 0;
    freshSave(); out.ward = WARD.length === 60 && WARD_MAX === 59 && WARD[56].name === 'Kraken Violet' && WARD[57].name === 'Tide Pool' && wardUnlocked(56) === false && wardUnlocked(57) === false && WARD_PAT_MAX === 18 && WARD_PATTERNS[18] === 'Reef scales' && wardPatUnlocked(18) === false;
    Save.data.chapter18Complete = true; out.wardOpen = wardUnlocked(56) === true && wardPatUnlocked(18) === true;

    /* waves: every wave builds, boss waves have their boss, the pool grows */
    var ok = true, bad = '';
    for (var w = 411; w <= 435; w++){ var q = buildWave(w), hasBoss = q.some(function(e){ return e.boss; }); if (!q.length || hasBoss !== (chapterWaveOf(w) % 5 === 0) || !q.every(function(e){ return !!ETYPES_ISLE[e.type]; })){ ok = false; bad += w + ' '; } }
    out.waves = ok; out.wavesBad = bad;
    var kindsAt = function(w){ var s = {}; for (var i = 0; i < 12; i++) buildWave(w).forEach(function(e){ s[e.type] = 1; }); return Object.keys(s).length; };
    out.pool = kindsAt(411) < kindsAt(423) && kindsAt(423) < kindsAt(433) + 1;

    /* the menu card and the run */
    freshSave(); Save.data.chapter17Complete = false; setMenuChapter(18); showMenu(); var html = chapterSelectorHTML();
    out.menuLocked = /disabled/.test(html) && /Clear Chapter 16/.test(html) && /Chapter 17/.test(html) && /The Island Lab/.test(html) && /Waves 411–435 · 5 bosses/.test(html);
    Save.data.chapter17Complete = true; html = chapterSelectorHTML();
    out.menuOpen = /data-a="play18"/.test(html) && /Start Chapter 17/.test(html) && /Straight to wave 411/.test(html) && !/ch-next" aria-label="Next chapter" disabled/.test(html);      /* the Air Chase (17.5) comes after it now */
    handleAction('play18'); out.menuFilm = G.state === 'cutscene' && !!G.cut && G.cut.kind === 'islesail'; G.cut.t = IL_SAIL_T.END - 0.01; steps(3);
    out.starts = G.state === 'playing' && G.wave === 411 && G.chapter === ISLE_CHAPTER && G.biome === 'isle' && Math.abs(P.x - 2130) < 5 && Math.abs(P.y - 2760) < 5;
    godMode(); steps(120);
    out.spawns = G.enemies.length > 0 && G.enemies.every(function(e){ return e.def && e.def.isle === true; });
    out.hud = /THE ISLAND LAB/.test(document.getElementById('hChapter') ? document.getElementById('hChapter').textContent : 'CH.17 THE ISLAND LAB');

    /* the map: solid props, all inside the arena, none overlapping; every open place, every vent and the start reachable */
    out.props = G.buildings.length === IL.all.length && IL.all.length === ISLE_SEA.length + ISLE_PROPS.length && G.tower === true && G.water === null && G.buildings.every(function(b){ return b.isle && b.indestructible; });
    out.inside = IL.all.every(function(h){ return h.x >= 0 && h.y >= 0 && h.x + h.w <= ARENA_W && h.y + h.h <= ARENA_H; });
    var clash = '', pr = IL.all.filter(function(b){ return b.kind !== 'sea' && b.kind !== 'seawall'; });
    for (var i = 0; i < pr.length; i++) for (var j = i + 1; j < pr.length; j++){ var a1 = pr[i], b1 = pr[j]; if (a1.x < b1.x + b1.w && b1.x < a1.x + a1.w && a1.y < b1.y + b1.h && b1.y < a1.y + a1.h) clash += a1.kind + i + '/' + b1.kind + j + ' '; }
    out.noClash = clash === ''; out.clash = clash;
    function reach(sx, sy){
      var N = TW_NX * TW_NY, seen = new Uint8Array(N), st = [twCell(sx, sy)], n = 0; seen[st[0]] = 1;
      while (st.length){ var c = st.pop(); n++; var ci = c % TW_NX, cj = (c / TW_NX) | 0; [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(function(d){ var a = ci + d[0], b = cj + d[1]; if (a < 0 || b < 0 || a >= TW_NX || b >= TW_NY) return; var m = b * TW_NX + a; if (seen[m] || TW.blocked[m]) return; seen[m] = 1; st.push(m); }); }
      var open = 0; for (var k = 0; k < N; k++) if (!TW.blocked[k]) open++; return { n: n, open: open, seen: seen };
    }
    var rc = reach(2130, 2760); out.reachAll = rc.n === rc.open; out.reachN = rc.n + '/' + rc.open;
    out.ventsOpen = ISLE_VENTS.every(function(v){ return !inWall(v.x, v.y, 10) && !TW.blocked[twCell(v.x, v.y)] && rc.seen[twCell(v.x, v.y)]; });
    out.startOpen = !inWall(2130, 2760, 20) && !TW.blocked[twCell(2130, 2760)];
    /* the water is where it is painted: the coasts, a tide pool, the reef, the tank room; the start, the causeways and the lab floor are dry */
    out.wetMap = isleWet(300, 1500) && isleWet(3900, 1500) && isleWet(2000, 2960) && isleWet(1450, 2120) && isleWet(1000, 1680) && isleWet(2100, 400) && !isleWet(2130, 2760) && !isleWet(1600, 1700) && !isleWet(2600, 1700) && !isleWet(1000, 800) && !isleWet(2100, 1200);
    var mcv = document.createElement('canvas'); mcv.width = 4200; mcv.height = 3150; var mx2 = mcv.getContext('2d'), agree = 0, tot = 0;
    for (var yy = 130; yy < 2990; yy += 47) for (var xx = 220; xx < 3990; xx += 53){ if (Math.abs(yy - 160) < 4) continue; var inPath = mx2.isPointInPath(ilWaterPath(), xx, yy) || (xx >= ISLE_BASIN.x && xx <= ISLE_BASIN.x + ISLE_BASIN.w && yy >= ISLE_BASIN.y && yy <= ISLE_BASIN.y + ISLE_BASIN.h); tot++; if (inPath === isleWet(xx, yy)) agree++; }
    out.wetMatches = agree / tot > 0.985; out.wetAgree = (agree / tot).toFixed(4);

    /* wading: slower in the shallows, and the run remembers that she got wet */
    begin(); put(2130, 2760); steps(3); out.dryStart = !G.il.wet && !(G.terrain && G.terrain.kind === 'wade');
    put(1000, 1680); steps(3); out.wade = !!G.terrain && Math.abs(G.terrain.spd - ISLE_WADE) < 1e-6 && G.il.wet === true;
    var ce = spawnEnemy('jackal', 300, 1500, 420), cl = spawnEnemy('jackal', 2130, 2760, 420), cr = spawnEnemy('warthog', 300, 1500, 420);
    out.swimMul = ilWaterMul(ce) > 1 && ilWaterMul(cl) < 1 && ilWaterMul(cr) < 1;

    /* every creature's behavior runs beside her without an error, and does something; the hiders go under in the water */
    Settings.fxLevel = 0; var ai = {}, aiBad = '';
    ['hyena', 'grub', 'jackal', 'cheetah', 'warthog', 'vulture', 'rhino', 'baboon', 'honeybadger', 'mamba', 'ember', 'termite'].forEach(function(type){
      begin(430); var cx = 1000, cy = 1680; put(cx, cy);
      var e = spawnEnemy(type, cx + 380, cy, 430); if (!e){ aiBad += type + ':none '; return; }
      var seen = {}; e.hp = e.maxHp = 1e12; var px = e.x, py = e.y, maxShots = 0, maxMk = 0, moved = 0, hid = false;
      for (var k = 0; k < 90; k++){ GR.step(1 / 12); noLevels(); put(cx + Math.sin(k * 0.2) * 60, cy); if (e.state) seen[e.state] = 1; if (e.hidden) hid = true; maxShots = Math.max(maxShots, G.eproj.length); maxMk = Math.max(maxMk, G.markers.length); moved = Math.max(moved, hyp(e.x - px, e.y - py)); if (e.dead) break; }
      ai[type] = Object.keys(seen).join('/') + ' shots' + maxShots + ' mk' + maxMk + ' mv' + Math.round(moved) + (hid ? ' hid' : '') + (e.dead ? ' dead' : '');
      if (!(moved > 20 || maxShots > 0 || maxMk > 0)) aiBad += type + ' ';
      if ((type === 'jackal' || type === 'mamba') && !hid) aiBad += type + ':nohide ';
    });
    out.ai = ai; out.aiOk = aiBad === ''; out.aiBad = aiBad;
    /* the Crab Tank's plate: a hit on its front does a tenth of one from behind */
    begin(); put(2000, 2700); var cb = spawnEnemy('warthog', 2100, 2700, 420); cb.hp = cb.maxHp = 1e9; cb.ang = Math.PI;
    var h0 = cb.hp; damageEnemy(cb, 1000, { noCrit: true, silent: true }); var front = h0 - cb.hp; cb.ang = 0; h0 = cb.hp; damageEnemy(cb, 1000, { noCrit: true, silent: true }); var back = h0 - cb.hp;
    out.crabPlate = front > 0 && back > front * 5;
    /* a Jelly Drifter splits once */
    begin(); put(2000, 2700); var jl = spawnEnemy('vulture', 2200, 2700, 420); killEnemy(jl, {}); var small = G.enemies.filter(function(e){ return !e.dead && e.type === 'vulture'; });
    out.jellySplit = small.length === 2 && small.every(function(e){ return e.small; }); killEnemy(small[0], {}); out.jellyOnce = G.enemies.filter(function(e){ return !e.dead && e.type === 'vulture'; }).length === 1;
    var bosses = ['lion', 'matriarch', 'buffalo', 'crocodile', 'wildfire'], bossBad = '', bi = {};
    bosses.forEach(function(type, bi2){
      begin(415 + bi2 * 5); var bx = type === 'wildfire' ? 2100 : type === 'buffalo' ? 1300 : 1000, by = type === 'wildfire' ? 420 : type === 'buffalo' ? 1760 : 1680;      /* the shark in open water, where it can dive */ put(bx, by); var e = spawnEnemy(type, bx + 420, by, 415 + bi2 * 5); if (!e){ bossBad += type + ':none '; return; }
      e.hp = e.maxHp = 1e12; var seen = {}, mx = 0, mk = 0, bm = 0, dove = false;
      for (var k = 0; k < (type === 'buffalo' ? 300 : 200); k++){ GR.step(1 / 12); noLevels(); put(bx, by); if (e.state) seen[e.state] = 1; if (e.state === 'dive') dove = true; mx = Math.max(mx, G.eproj.length); mk = Math.max(mk, G.markers.length); bm = Math.max(bm, G.beams.length + G.blasts.length); if (k === 100) e.hp = e.maxHp * 0.3; }
      bi[type] = Object.keys(seen).join('/') + (dove ? ' dove' : ''); if (Object.keys(seen).length < 4 || (mx + mk + bm) === 0) bossBad += type + ' ';
      if (type === 'buffalo' && !dove) bossBad += 'buffalo:nodive ';
      if (type === 'crocodile' && !(e.trail && e.trail.length > 10)) bossBad += 'crocodile:notrail ';
      if (type === 'wildfire' && !(G.il.arms && G.il.arms.length >= 0 && seen.armswind)) bossBad += 'wildfire:noarms ';
    });
    out.bossStates = bi; out.bossOk = bossBad === ''; out.bossBad = bossBad;
    /* the scientist on every boss wave, and a boss beaten without a scratch is remembered */
    begin(414); startWave(415); out.glimpse = !!G.il.glimpse && G.il.glimpse.line === ISLE_GLIMPSE.lion && G.il.bossHit === false; drawFeedbackOverlays(CTX); steps(240); out.glimpseGoes = !G.il.glimpse;
    begin(414); startWave(415); clear(); var kb = spawnEnemy('lion', 1200, 1680, 415); G.bossAlive = true; killEnemy(kb, {}); out.clean = (Save.data.isleClean & 1) === 1;
    begin(419); startWave(420); clear(); var kb2 = spawnEnemy('matriarch', 1200, 1680, 420); G.bossAlive = true; P.invuln = 0; P.hp = P.maxHp = 1e9; hurtPlayer(10, P.x, P.y); killEnemy(kb2, {}); out.notClean = (Save.data.isleClean & 2) === 0;

    /* being watched: every spot the scientist stands on, every note, buoy and camera is on open ground (and the notes can be reached) */
    out.spotsOk = ISLE_SIGHT.every(function(s2){ return s2.k !== 'out' || (!isleWet(s2.x, s2.y) && ilClear(s2.x, s2.y, 30) && rc.seen[twCell(s2.x, s2.y)]); }) &&
      ISLE_NOTES.every(function(N){ return !inWall(N.x, N.y, 20) && !isleWet(N.x, N.y) && !TW.blocked[twCell(N.x, N.y)] && rc.seen[twCell(N.x, N.y)]; }) &&
      ISLE_BUOYS.every(function(a){ return isleWet(a[0], a[1]) && ilClear(a[0], a[1], 30); }) && ISLE_CAMS.every(function(c){ return !inWall(c[0], c[1], 6); });
    /* the scientist shows once on an ordinary wave, ducks away when she comes close, and is gone; not on a boss wave */
    begin(411); startWave(412); G.introFX = null; G.banner = null; G.bannerHold = null; clear(); put(1600, 1400); G.il.sightIn = 0.01; steps(3);
    var sgt = G.il.sight; out.sight = !!sgt;
    if (sgt){ put(sgt.x + 120, sgt.y + 40); steps(3); out.sightDuck = !G.il.sight || G.il.sight.ph === 'duck'; steps(90); out.sightGone = !G.il.sight; }
    startWave(415); out.noSightBoss = G.il.sightIn === undefined; clear();
    /* a door slides shut when she walks up and opens after she has gone; a camera follows her */
    begin(); put(640, 860); steps(30); out.doorShut = ilDoor(1).open < 0.05; put(2130, 2760); steps(150); out.doorOpen = ilDoor(1).open > 0.9;
    put(1288, 1150); steps(40); var cm = G.il.cam[0]; out.camTrack = cm.on === true && Math.abs(angDiff(cm.a, Math.atan2(P.y - 912, P.x - 1288))) < 0.15;
    /* the screens' short word on wave 3 of the chapter */
    begin(411); startWave(413); clear(); out.brief = !!G.il.brief && G.il.brief.line === ISLE_BRIEF[3]; steps(250); out.briefOn = !!G.il.brief && G.il.brief.wait <= 0; drawFeedbackOverlays(CTX); steps(150); out.briefGone = !G.il.brief;
    /* a lab note: walk over it and it is kept, shown on a card and in the Bestiary; five is Field Notes */
    begin(); Save.data.isleNotes = 0; put(ISLE_NOTES[0].x, ISLE_NOTES[0].y); steps(2);
    out.noteTake = (Save.data.isleNotes & 1) === 1 && !!G.il.noteCard; drawFeedbackOverlays(CTX);
    out.noteBest = /Specimen log 04/.test(bestiaryCreaturesHTML()) && /1 \/ 5/.test(bestiaryCreaturesHTML());
    var fnA = ACH.filter(function(x){ return x.id === 'islenotes'; })[0]; out.noteAch = !!fnA && fnA.val() === 1; Save.data.isleNotes = 31; out.noteAch = out.noteAch && fnA.val() === 5;
    /* each boss's entrance: where it comes in, that it cannot be hit meanwhile, and that it roars when it is out; Zero breaks the floor tank, seen on the camera */
    var ent = {}, entBad = '';
    [['lion', 415, 2130, 2700, false], ['matriarch', 420, 2000, 2300, true], ['buffalo', 425, 2130, 2600, true], ['crocodile', 430, 1000, 1700, true], ['wildfire', 435, 2130, 2600, null]].forEach(function(c){
      begin(c[1]); put(c[2], c[3]); var e = spawnEnemy(c[0], 300, 420, c[1]); if (!e){ entBad += c[0] + ':none '; return; } e.hp = e.maxHp = 1e9;
      var ok = !!e.enter && e.untarg === true && damageEnemy(e, 100, {}) === 0, where = Math.round(e.x) + ',' + Math.round(e.y);
      if (c[4] !== null) ok = ok && isleWet(e.x, e.y) === c[4] && hyp(e.x - P.x, e.y - P.y) < 700;
      if (c[0] === 'wildfire') ok = ok && e.x === ISLE_FTANK.x && e.y === ISLE_FTANK.y && !!G.il.feed && !G.il.tankBroke;
      for (var k = 0; k < 150 && e.enter; k++){ GR.step(1 / 30); noLevels(); put(c[2], c[3]); }
      ok = ok && !e.enter && !e.untarg && e.state === 'roar'; if (c[0] === 'wildfire') ok = ok && G.il.tankBroke === true;
      ent[c[0]] = where + (ok ? '' : ' BAD'); if (!ok) entBad += c[0] + ' ';
    });
    out.enter = ent; out.enterOk = entBad === ''; out.enterBad = entBad;
    /* a hidden swimmer warns before it comes up, and waits a moment once it is up */
    begin(420); put(700, 1750); var hd = spawnEnemy('jackal', 1080, 1640, 420); hd.hp = hd.maxHp = 1e9; var told = false, surf = false;
    for (var k2 = 0; k2 < 150; k2++){ GR.step(1 / 30); noLevels(); put(700, 1750); if (hd.tell) told = true; if (hd.surfT > 0) surf = true; }
    out.tell = told && surf;
    /* a palm drops coconuts that hurt what they land on; walking into one shakes it; buoys move and come back; the boat rocks */
    begin(); var palms = IL.all.filter(function(b){ return b.kind === 'palm'; }), pm0 = palms[0]; put(pm0.x + 25, pm0.y + 200); ilPalmKnock(pm0); var shook = pm0.shake > 0.9;
    var nut = G.il.nuts && G.il.nuts[0], vic = nut ? spawnEnemy('hyena', nut.x, nut.y, 420) : null;
    if (vic){ vic.hp = vic.maxHp = 1e9; vic.spd = 0; } steps(30);
    out.coconut = !!nut && G.il.nuts.length >= 2 && shook && pm0.nuts < 4 && !!vic && vic.hp < vic.maxHp;
    var pm1 = palms[1]; put(pm1.x - 25, pm1.y + 25); P.vx = 200; ilTouchTick(1 / 30); out.palmBump = pm1.shake > 0.9;
    steps(2); var bu = G.il.buoys[0]; put(bu.x - 30, bu.y); P.vx = 200; ilTouchTick(1 / 30); out.buoy = hyp(bu.x - bu.ax, bu.y - bu.ay) > 5; put(2130, 2760); steps(240); out.buoyBack = hyp(bu.x - bu.ax, bu.y - bu.ay) < 8;
    var boat = IL.all.filter(function(b){ return b.kind === 'boat'; })[0]; put(boat.x + 100, boat.y - 24); P.vy = 200; ilTouchTick(1 / 30); out.boat = boat.rock > 0.9;
    /* in the shallows a wake; out of them, wet hoofprints */
    begin(); put(700, 1750); for (var k3 = 0; k3 < 30; k3++){ P.vx = 200; P.vy = 0; GR.step(1 / 30); noLevels(); } out.wakeOn = G.il.wake.length > 3;
    put(2130, 2700); for (var k4 = 0; k4 < 40; k4++){ P.vx = 200; P.vy = 0; GR.step(1 / 30); noLevels(); } out.prints = G.il.prints.length > 0;
    /* the music: the lab's theme past the fence, the island's outside it, and no flip-flopping on the line */
    begin(); Music.want.theme = 'isle'; put(2000, 700); Music.refresh(); var mLab = Music.want.theme; Music.want.theme = 'isle'; put(2000, 950); Music.refresh(); var mMid = Music.want.theme;
    Music.want.theme = 'isle'; put(2000, 1200); Music.refresh(); var mOut = Music.want.theme; out.music = mLab === 'islelab' && mMid === 'islelab' && mOut === 'isle' && !!MUSIC_THEMES.islelab;
    /* the floor tank and the cameras draw on the menu's picture too */
    try { ilWatchWorld(CTX, 1700, 100, 2500, 900, 1, false); out.menuDraw = true; } catch (e){ out.menuDraw = String(e); }
    out.chase = IL_OUT_T.D > IL_OUT_T.C && IL_OUT_T.END >= IL_OUT_T.D + 5 && MARS_FILMS.isleout.end === IL_OUT_T.END;

    /* the films render at every part of the story, and say nothing about the end of the game */
    var fcv = document.createElement('canvas'); fcv.width = CS_W; fcv.height = CS_H; var fc = fcv.getContext('2d'), fok = true, fbad = '';
    ['islesail', 'isleout'].forEach(function(k){ var F = MARS_FILMS[k]; if (!F || !(F.end > 20)) { fok = false; fbad += k + ':def '; return; } for (var t = 0; t < F.end; t += 0.75){ try { fc.clearRect(0, 0, CS_W, CS_H); F.scene(fc, t); F.over(fc, t); } catch (e){ fok = false; fbad += k + '@' + t + ':' + e.message + ' '; break; } } });
    out.films = fok; out.filmsBad = fbad;
    out.noEndCard = !/the end|thanks for playing|credits/i.test(IL_SAIL_CAPS.concat(IL_OUT_CAPS).map(function(c){ return c[1] + ' ' + c[2]; }).join(' ') + ' ' + Object.keys(ISLE_GLIMPSE).map(function(k){ return ISLE_GLIMPSE[k]; }).join(' ') + ' ' + Object.keys(ISLE_BRIEF).map(function(k){ return ISLE_BRIEF[k]; }).join(' '));

    /* the minigame: three stars give Tide Pool; an eel bites; a shell counts */
    out.mini = !!MINI[ISLE_CHAPTER] && MINI_STAR[ISLE_CHAPTER].t.length === 2 && MINI_STAR_CHAPTERS.indexOf(ISLE_CHAPTER) >= 0 && miniEndsRun(ISLE_CHAPTER) && miniWardOf(ISLE_CHAPTER) === 57;
    Save.reset(); Save.data.mini = { own: {}, best: {}, stars: {}, last: 0, plays: 0, hat: '', boot: '' }; startMini(ISLE_CHAPTER, null, 'menu'); G.mini.phase = 'play'; var mg = G.mini, mgg = miniGeom ? miniGeom() : null;
    steps(2); var lane = DASH_LANES[0], eel = mg.eels.filter(function(e2){ return e2.lane === 0; })[0], gH = mg.p.y / 0.9;
    mg.p.y = gH * lane; mg.p.x = eel.x + eel.d * 10; mg.inv = 0; var lv = mg.lives; steps(1); out.miniBite = mg.lives < lv;
    mg.inv = 0; mg.p.x = mg.shell.x; mg.p.y = mg.shell.y; var sc0 = mg.score; steps(1); out.miniShell = mg.score === sc0 + 1;
    Save.data.mini.stars[ISLE_CHAPTER] = 3; out.miniWard = wardUnlocked(57) === true; G.mini = null; G.state = 'menu';

    /* photo codes: an island creature and the Reef scales pattern survive the round trip, and an older photo keeps its old format */
    Save.reset(); Save.data.chapter18Complete = true; Save.data.patCol = 18;
    PHOTO.items = [{ t: 'foe', id: 'lion', ch: 18, x: 300, y: 300, s: 1, f: false, r: 0 }, { t: 'foe', id: 'hyena', ch: 17, x: 250, y: 300, s: 1, f: false, r: 0 }, { t: 'foe', id: 'hyena', ch: 4, x: 200, y: 300, s: 1, f: false, r: 0 }];
    var code = photoToCode(), bytes = Array.from(atob(code)).map(function(c){ return c.charCodeAt(0); }), d2 = photoUnpack(bytes);
    out.photo = bytes[0] === 6 && d2.items[0].chapter === 18 && d2.items[1].chapter === 17 && d2.items[2].chapter === 4 && d2.look.pattern === 18;
    PHOTO.items = [{ t: 'foe', id: 'hyena', ch: 16, x: 200, y: 300, s: 1, f: false, r: 0 }]; out.photoOld = atob(photoToCode()).charCodeAt(0) === 4; PHOTO.items = [];
    out.backdrop = PHOTO_BG[26] === 'The Island' && PHOTO_SCENES.length === PHOTO_BG.length - 5;

    /* finishing: the flags, the dry run, the Guide, the achievements, Play together */
    begin(); G.il.wet = false; isleFinishSave(); out.finish = Save.data.chapter18Complete === true && Save.data.chapter17Complete === true && Save.data.chapter14Complete === true && Save.data.isleDry === true;
    begin(); G.il.wet = true; isleFinishSave(); out.finishWet = Save.data.chapter18Complete === true && Save.data.isleDry === false;
    G.chapter = ISLE_CHAPTER; out.victory = /Specimen Zero/.test(victoryText(3, 4)) && !/the end|thanks for playing/i.test(victoryText(3, 4));
    Save.reset(); out.guideLocked = !/Chapter 17: The Island Lab/.test(guideTopicsHTML()); Save.data.chapter18Complete = true; out.guideOpen = /Chapter 17: The Island Lab/.test(guideTopicsHTML());
    Save.reset(); var ach = function(id){ return ACH.filter(function(x){ return x.id === id; })[0]; };
    out.ach0 = !!ach('ch17') && ach('ch17').val() === 0 && ach('isleclean').val() === 0 && ach('isledry').val() === 0;
    Save.data.chapter18Complete = true; Save.data.isleClean = 31; Save.data.isleDry = true; out.ach = out.ach0 && ach('ch17').val() === 1 && ach('isleclean').val() === 5 && ach('isledry').val() === 1;
    Save.reset(); out.coLocked = coChapters().indexOf(18) < 0 && CO_CHAPTERS.length === 18; Save.data.chapter17Complete = true; out.coOpen = coChapters().indexOf(18) >= 0;
    coStart('arena', 18); steps(40); out.together = Co.on && G.chapter === ISLE_CHAPTER && G.biome === 'isle' && G.tower === true && G.buildings.length === IL.all.length; coEnd(true); steps(2);
    out.minimap = typeof ilMmColor === 'function' && ilMmColor({ kind: 'coral' }) !== ilMmColor({ kind: 'sea' }) && MM_GROUND[18] !== undefined;

    /* the last wave: the flag is saved, the film plays, the minigame is offered, and the victory report follows; the films are in the gallery */
    freshSave(); startRun(ISLE_CHAPTER, 435); steps(10); G.introFX = null; G.banner = null; godMode();
    out.lastWave = G.wave === 435 && isChapterFinaleWave(435) && isRunEnd(435) === true;
    G.spawnQueue = []; G.enemies.length = 0; G.bossAlive = false; G.waveState = 'clear'; G.waveTimer = 0.01; steps(3);
    out.endFilm = G.state === 'cutscene' && !!G.cut && G.cut.kind === 'isleout' && Save.data.chapter18Complete === true;
    G.cut.t = IL_OUT_T.END - 0.01; steps(60);
    out.endMini = G.state === 'miniask'; if (G.state === 'miniask'){ GR.handleAction('mini-skip'); steps(60); }
    out.endVictory = G.state === 'victory' && Save.data.chapter18Complete === true && Save.data.chapter17Complete === true && wardUnlocked(56) === true;
    out.gallery = filmList().filter(function(x){ return x.kind === 'islesail' || x.kind === 'isleout'; }).length === 2;
    /* a run saved part-way comes back on the island */
    begin(420); var snap = runSnapshot(); out.snap = validRunSave(snap); startRun(ISLE_CHAPTER, snap.wave, snap); steps(2); out.snapRestore = G.biome === 'isle' && G.chapter === ISLE_CHAPTER && IL.all.length === ISLE_SEA.length + ISLE_PROPS.length && !!G.il;
    Ach.check = realCheck;
  } catch (e) { out.err = String(e && e.stack || e); }
  var need = ['table', 'bossWaves', 'harder', 'cast', 'bestiary', 'uniqueLooks', 'traits', 'art', 'saveDefault', 'saveSane', 'ward', 'wardOpen', 'waves', 'pool', 'menuLocked', 'menuOpen', 'menuFilm', 'starts', 'spawns', 'hud',
    'props', 'inside', 'noClash', 'reachAll', 'ventsOpen', 'startOpen', 'wetMap', 'wetMatches', 'dryStart', 'wade', 'swimMul', 'aiOk', 'crabPlate', 'jellySplit', 'jellyOnce', 'bossOk', 'glimpse', 'glimpseGoes', 'clean', 'notClean',
    'tune', 'spotsOk', 'sight', 'sightDuck', 'sightGone', 'noSightBoss', 'doorShut', 'doorOpen', 'camTrack', 'brief', 'briefOn', 'briefGone', 'noteTake', 'noteBest', 'noteAch',
    'enterOk', 'tell', 'coconut', 'palmBump', 'buoy', 'buoyBack', 'boat', 'wakeOn', 'prints', 'music', 'menuDraw', 'chase',
    'films', 'noEndCard', 'mini', 'miniBite', 'miniShell', 'miniWard', 'photo', 'photoOld', 'backdrop', 'finish', 'finishWet', 'victory', 'guideLocked', 'guideOpen', 'ach', 'coLocked', 'coOpen', 'together', 'minimap',
    'lastWave', 'endFilm', 'endMini', 'endVictory', 'gallery', 'snap', 'snapRestore'];
  out.failed = need.filter(function(k){ return out[k] !== true; });
  out.pass = out.errs.length === 0 && !out.err && out.failed.length === 0;
  QA.done(out);
})();
