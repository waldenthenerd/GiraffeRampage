/* sky-chase: Chapter 17.5, the Air Chase (js/sky/). The chapter is the 19th, labelled 17.5, ten waves numbered 436 to 445, open after Chapter 17; its menu
   button plays the opening film and then the sky shooter. Steering, the three guns (J, K, L move her; the gun she is at fires by itself, the door guns
   sideways), the aiming line's key, her gear on the hull, the waves and the upgrade picks, the Grey Escort and the White Bird's three phases, being shot
   down and trying again from the checkpoint, the ending (the save, the film, the minigame offer, the results), the coat colors, the achievements, the
   Guide, the Films list, the Bestiary page, the minigame Sky Patrol, the wreck in the Harbor, and an old save.
   Run: node tools/qa-cloud.mjs tools/scenarios/sky-chase.js --wait 60000
   Pictures: --params "view=play&wave=4" | "view=grey" | "view=white&phase=1|2|3" | "view=perk" | "view=down" | "view=menu" | "view=film&kind=skyin|skyout&t=9"
             | "view=bestiary" | "view=mini" | "view=wreck" | "view=results" (with --shot out.png) */
(function(){
  var out = { failed: [], errs: [] }, check = function(k, v){ if (!v) out.failed.push(k); };
  window.addEventListener('error', function(e){ out.errs.push(e.message + ' @' + e.lineno); });
  GR.handleAction('splash-go'); Ach.check = function(){ return []; };
  var V = QA.params.view || '', K = Input.keys;
  var steps = function(n){ for (var i = 0; i < n; i++) GR.step(1 / 30); };
  var tap = function(code){ K[code] = true; steps(2); K[code] = false; steps(1); };
  var clearWave = function(){ Sky.q.forEach(function(it){ it.t = 0; }); steps(2); Sky.en.forEach(function(e){ if (!e.dead){ e.hp = 0; skyKill(e); } }); for (var i = 0; i < 160 && Sky.on && Sky.ws !== 'clear' && !Sky.hold; i++){ Sky.en.forEach(function(e){ if (!e.dead && !(e.ditch > 0)){ e.hp = 0; skyKill(e); } }); steps(1); } };
  try {
    if (V){
      Save.data.chapter18Complete = true; Save.data.gold = 1e6;
      if (V === 'play'){ skyStart(+QA.params.wave || 1); steps(+QA.params.n || 150); Sky.hull = Sky.max; }
      else if (V === 'grey'){ skyStart(5); steps(240); Sky.hull = Sky.max; }
      else if (V === 'white'){ skyStart(10); steps(120); var w = Sky.en.filter(function(e){ return e.k === 'white'; })[0]; var ph = +QA.params.phase || 1; if (w){ w.hp = w.maxHp * (ph === 1 ? 0.9 : ph === 2 ? 0.5 : 0.2); } steps(150); Sky.hull = Sky.max; tap('KeyJ'); steps(6); }
      else if (V === 'perk'){ skyStart(2); clearWave(); steps(60); }
      else if (V === 'down'){ skyStart(3); steps(60); Sky.inv = 0; Sky.hull = 1; skyHurt(50); steps(80); }
      else if (V === 'menu'){ setMenuChapter(SKY_CHAPTER); showMenu(); steps(10); }
      else if (V === 'film'){ G.state = 'menu'; startCutscene(function(){}, false, QA.params.kind || 'skyin'); for (var fs = 0; fs < 30; fs++){ G.cut.t = 1; GR.step(1 / 30); } G.cut.t = +QA.params.t || 1; GR.step(1 / 600); }
      else if (V === 'bestiary'){ G.state = 'menu'; G.attract = false; Object.keys(ETYPES_SKY).forEach(function(k){ skyBestiary(k, { x: 0, y: 0 }); }); showBestiary('creatures'); steps(4); [OV].concat(Array.prototype.slice.call(OV.querySelectorAll('*'))).forEach(function(el){ if (el.scrollHeight > el.clientHeight + 10) el.scrollTop = 1e6; }); }
      else if (V === 'mini'){ Save.data.chapter19Complete = true; Save.data.mini = { own: {}, best: {}, stars: {}, last: 0, plays: 0, hat: '', boot: '' }; startMini(SKY_CHAPTER, null, 'menu'); G.mini.phase = 'play'; steps(150); }
      else if (V === 'wreck'){ for (var cc = 1; cc <= 19; cc++) Save.data['chapter' + cc + 'Complete'] = true; G.state = 'menu'; Town.fixHour = 17; Town.fixWeather = 'clear'; townEnter('harbour', +QA.params.x || 1760, 1); Town.walkers = []; steps(30); }
      else if (V === 'results'){ Sky.result = { gold: 31200, gems: 150, first: true, kills: 212, escorts: '8 of 8', clean: false }; skyResults(); steps(10); }
      GR.render(); QA.done({ view: V, errs: out.errs, state: G.state, wave: Sky.wave, en: Sky.en.length }); return;
    }
    /* ---- the chapter in the list ---- */
    check('total', TOTAL_CHAPTERS === 19 && SKY_CHAPTER === 19 && chapterLabel(19) === '17.5' && chapterLen(19) === 10 && chapterFirstWave(19) === 436);
    check('bestiaryTable', bestiaryTable(19) === ETYPES_SKY && BESTIARY_CHAPTERS[18] === 'The Air Chase' && Object.keys(ETYPES_SKY).length === 8);
    check('looks', Object.keys(ETYPES_SKY).every(function(k){ return typeof ENEMY_LOOK_DRAW[ETYPES_SKY[k].look] === 'function' && LOOK_NAMES[ETYPES_SKY[k].look]; }));
    Save.data.chapter18Complete = false; check('locked', !chapterUnlocked(19));
    Save.data.chapter18Complete = true; check('open', chapterUnlocked(19));
    setMenuChapter(19); showMenu(); var mh = document.getElementById('overlay') ? document.getElementById('overlay').innerHTML : document.body.innerHTML;
    check('menuCard', /The Air Chase/.test(mh) && /data-a="play19"/.test(mh) && /Waves 436/.test(mh) && /sky shooter/.test(mh));
    /* ---- the button: the opening film, then the sky ---- */
    GR.handleAction('play19'); check('filmIn', G.state === 'cutscene' && G.cut && G.cut.kind === 'skyin');
    endCutscene(); check('starts', Sky.on && G.state === 'sky' && Sky.wave === 1);
    /* ---- her gear counts on the hull ---- */
    var keep = recalcStats; recalcStats = function(){ keep(); P.stats.maxHpAdd = 40; P.stats.dr = 0.5; };
    skyStart(1); recalcStats = keep; check('gearHull', Sky.max === 140);
    Sky.inv = 0; var h0 = Sky.hull; skyHurt(20); check('gearDr', Math.abs((h0 - Sky.hull) - 10) < 0.01);
    /* ---- steering ---- */
    skyStart(1); var x0 = Sky.x; K.KeyD = true; steps(10); K.KeyD = false; check('steer', Sky.x > x0 + 50);
    var y0 = Sky.y; K.ArrowUp = true; steps(10); K.ArrowUp = false; check('steerUp', Sky.y < y0 - 50);
    /* ---- the three guns ---- */
    steps(60); Sky.shots.length = 0; steps(8); check('noseFires', Sky.shots.length > 0 && Sky.shots.every(function(b){ return b.vy < 0 && b.vx === 0; }));
    tap('KeyJ'); check('toLeft', Sky.gun === 'left' && Sky.sw > 0); Sky.shots.length = 0; steps(3); check('swapPause', Sky.shots.length === 0);
    steps(14); check('leftFires', Sky.shots.length > 0 && Sky.shots.every(function(b){ return b.vx < 0 && b.vy === 0; }));
    tap('KeyL'); steps(16); Sky.shots.length = 0; steps(8); check('rightFires', Sky.gun === 'right' && Sky.shots.length > 0 && Sky.shots.every(function(b){ return b.vx > 0; }));
    var d0 = Sky.shots[0] ? Sky.shots[0].dmg : 0; tap('KeyK'); steps(16); Sky.shots.length = 0; steps(8); check('doorHarder', Sky.gun === 'nose' && Sky.shots[0] && d0 > Sky.shots[0].dmg * 1.2);
    var a0 = Save.data.skyAim; tap('KeyI'); check('aimKey', Save.data.skyAim === !a0); tap('KeyI'); check('aimBack', Save.data.skyAim === a0);
    check('keys', DEFAULT_KEYS.skyLeft === 'KeyJ' && DEFAULT_KEYS.skyNose === 'KeyK' && DEFAULT_KEYS.skyRight === 'KeyL' && KEY_ACTIONS.some(function(a){ return a[0] === 'skyAim'; }));
    /* ---- a wave, and the upgrade after wave 2 ---- */
    skyStart(1); steps(70); check('spawns', Sky.en.length > 0 && Sky.en.every(function(e){ return e.k === 'rotor'; }));
    clearWave(); steps(60); check('wave2', Sky.wave === 2 && !Sky.hold);
    clearWave(); steps(60); check('perkOffer', Sky.hold === 'perk' && Sky.offer && Sky.offer.length === 3 && /sky-perk-/.test(document.getElementById('overlay') ? document.getElementById('overlay').innerHTML : document.body.innerHTML));
    var pk = Sky.offer[0].id; GR.handleAction('sky-perk-' + pk); check('perkTaken', !Sky.hold && Sky.wave === 3 && (Sky.perks[pk] | 0) === 1);
    /* ---- wave 4 has escorts, which break off if left alone ---- */
    skyStart(4); for (var q = 0; q < 900 && !Sky.en.some(function(e){ return e.k === 'gunship'; }); q++){ Sky.hull = Sky.max; steps(1); }
    var gs = Sky.en.filter(function(e){ return e.k === 'gunship'; })[0]; check('gunship', !!gs && Sky.escSeen === 1);
    if (gs){ gs.t = 99; for (var q2 = 0; q2 < 200 && Sky.en.indexOf(gs) >= 0; q2++){ Sky.hull = Sky.max; steps(1); } check('breaksOff', Sky.en.indexOf(gs) < 0 && Sky.escDown === 0); }
    /* ---- the Grey Escort and the White Bird ---- */
    skyStart(5); steps(100); var greys = Sky.en.filter(function(e){ return e.k === 'grey'; }); check('grey', greys.length === 2 && greys[0].side !== greys[1].side && greys.every(function(e){ return e.boss; }));
    clearWave(); steps(60); check('ckpt', Sky.ckpt === 6);
    skyStart(10); steps(80); var wb = Sky.en.filter(function(e){ return e.k === 'white'; })[0]; check('white', !!wb && wb.boss);
    if (wb){
      Sky.hull = Sky.max; steps(30); var p1 = wb.phase; wb.hp = wb.maxHp * 0.5; Sky.hull = Sky.max; steps(30); var p2 = wb.phase; wb.hp = wb.maxHp * 0.2; Sky.hull = Sky.max; steps(30); var p3 = wb.phase;
      check('phases', p1 === 1 && p2 === 2 && p3 === 3);
      Sky.bossHit = false; wb.hp = 0; skyKill(wb); check('ditches', wb.ditch > 0 && !wb.dead);
    }
    /* ---- shot down: try again from the checkpoint ---- */
    skyStart(3); steps(40); Sky.inv = 0; Sky.hull = 1; skyHurt(50); steps(80); check('down', Sky.hold === 'down' && /sky-retry/.test(document.body.innerHTML));
    GR.handleAction('sky-retry'); check('retry', Sky.on && Sky.wave === 1 && Sky.hull === Sky.max && !Sky.hold);
    skyStart(7); steps(20); Sky.inv = 0; Sky.hull = 1; skyHurt(50); steps(80); GR.handleAction('sky-retry'); check('retryCkpt', Sky.wave === 6);
    /* ---- pause ---- */
    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'Escape', key: 'Escape', bubbles: true })); check('pause', Sky.hold === 'pause');
    var tt = Sky.t; steps(10); check('paused', Sky.t === tt);
    GR.handleAction('sky-resume'); check('resume', !Sky.hold);
    /* ---- the end: the save, the film, the minigame offer, the results ---- */
    Save.data.chapter19Complete = false; var gems0 = Save.data.gems | 0, gold0 = goldInt(Save.data.gold);
    skyStart(10); steps(80); Sky.escSeen = 2; Sky.escDown = 2; Sky.bossHit = false; clearWave(); steps(200);
    check('finishSave', Save.data.chapter19Complete && (Save.data.gems | 0) >= gems0 + 150 && goldInt(Save.data.gold) > gold0 && Save.data.skyEscorts && Save.data.skyClean);
    check('filmOut', G.state === 'cutscene' && G.cut && G.cut.kind === 'skyout');
    endCutscene(); check('miniOffer', G.state === 'miniask' || G.subScreen === 'skyresult');
    if (G.state === 'miniask') GR.handleAction('mini-skip');
    check('results', G.subScreen === 'skyresult' && /The White Bird is down/.test(document.body.innerHTML));
    GR.handleAction('sky-done'); check('backToMenu', G.state === 'menu');
    /* ---- what it adds around the game ---- */
    check('ward', WARD[58] && WARD[58].name === 'Sky Ace' && WARD[59] && WARD[59].name === 'Cloud Nine' && WARD_MAX === 59 && wardUnlocked(58));
    Save.data.chapter19Complete = false; check('wardLocked', !wardUnlocked(58)); Save.data.chapter19Complete = true;
    check('ach', ['ch175', 'skyclean', 'skyesc'].every(function(id){ return ACH.some(function(a){ return a.id === id && a.val() >= a.goal; }); }));
    check('guide', GUIDE_TOPICS.some(function(t){ return t.id === 'sky' && /door/.test(t.html()); }));
    G.attract = false; skyBestiary('hyena', { x: 0, y: 0 }); check('bestiaryPage', /Chapter 17\.5 \u2014 The Air Chase/.test(bestiaryCreaturesHTML()) || /Chapter 17\.5 — The Air Chase/.test(bestiaryCreaturesHTML()));
    check('films', filmList().filter(function(f){ return (f.kind === 'skyin' || f.kind === 'skyout') && f.un; }).length === 2);
    var bad = 0; ['skyin', 'skyout'].forEach(function(k){ (k === 'skyin' ? SKY_IN_CAPS : SKY_OUT_CAPS).forEach(function(c){ if (/the end|thanks for playing|credits/i.test(c[1] + ' ' + c[2])) bad++; }); }); check('noEndCard', bad === 0);
    check('mini', MINI[SKY_CHAPTER] && MINI[SKY_CHAPTER].id === 'skypatrol' && MINI_STAR[SKY_CHAPTER] && MINI_STAR_CHAPTERS.indexOf(SKY_CHAPTER) >= 0 && miniEndsRun(SKY_CHAPTER) && miniUnlocked(SKY_CHAPTER));
    Save.data.mini = { own: {}, best: {}, stars: {}, last: 0, plays: 0, hat: '', boot: '' }; startMini(SKY_CHAPTER, null, 'menu'); G.mini.phase = 'play';
    for (var mm = 0; mm < 120; mm++){ K.KeyA = mm % 40 < 20; K.KeyD = !K.KeyA; GR.step(1 / 30); } K.KeyA = K.KeyD = false; check('miniPlays', G.mini && G.mini.score > 0);
    G.mini = null; G.state = 'menu';
    check('wreck', TOWN_DIST.harbour.p.some(function(p){ return p.k === 'skywreck'; }));
    /* ---- the phone's run list and startRun go to the chase ---- */
    G.state = 'menu'; startRun(SKY_CHAPTER); check('startRun', G.state === 'cutscene' && G.cut.kind === 'skyin'); endCutscene(); skyQuit();
    /* ---- an old save ---- */
    var old = JSON.parse(JSON.stringify(Save.data)); ['chapter19Complete', 'skyBestWave', 'skyEscorts', 'skyClean', 'skyAim', 'skyRuns'].forEach(function(k){ delete old[k]; });
    localStorage.setItem(SAVE_KEY, JSON.stringify(old)); Save.load();
    check('oldSave', Save.data.chapter19Complete === false && Save.data.skyAim === true && Save.data.skyBestWave === 0 && Save.data.skyRuns === 0);
  } catch (e) { out.errs.push(String(e && e.stack || e)); }
  out.pass = !out.failed.length && !out.errs.length;
  QA.done(out);
})();
