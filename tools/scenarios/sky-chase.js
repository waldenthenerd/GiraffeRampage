/* sky-chase: Chapter 17.5, the Air Chase (js/sky/). The chapter is the 19th, labelled 17.5, ten waves numbered 436 to 445, open after Chapter 17; its menu
   button plays the opening film and then the sky shooter. Steering, the three guns (J, K, L move her; the gun she is at fires by itself, the door guns
   sideways), the aiming line's key, her gear on the hull, the waves and the upgrade picks, the Grey Escort and the White Bird's three phases, being shot
   down and trying again from the checkpoint, the ending (the save, the film, the minigame offer, the results), the coat colors, the achievements, the
   Guide, the Films list, the Bestiary page, the minigame Sky Patrol, the wreck in the Harbor, and an old save.
   Run: node tools/qa-cloud.mjs tools/scenarios/sky-chase.js --wait 60000
   Pictures: --params "view=play&wave=4" ("&n=900&safe=1": a long stretch, not shot down) | "view=sea" (one of each thing on the water; "&set=2" the boats and animals, "&ph=" a moment of the whale's dive) | add "&gun=left|right" (her head out of that door), "&hull=0.2" (smoke) | "view=grey" | "view=white&phase=1|2|3" | "view=perk" | "view=down" | "view=menu" | "view=film&kind=skyin|skyout&t=9"
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
      if (V === 'play'){ skyStart(+QA.params.wave || 1); if (QA.params.safe) Sky.inv = 1e9; steps(+QA.params.n || 150); Sky.hull = Sky.max; if (QA.params.safe) Sky.inv = 0; }
      else if (V === 'sea'){ skyStart(+QA.params.wave || 3); Sky.q = []; steps(4); Sky.en = []; var mv = function(k, x, y, h, sd){ return { k: k, x: G.W * x, y: G.H * y, a: 0, v: 0, r: 40, seed: sd, h: h, want: h, spd: 0.001, ph: QA.params.ph ? +QA.params.ph : 9 }; };
        Sky.objs = QA.params.set === '2' ? [mv('trawler', 0.3, 0.3, 0.3, 1.1), mv('sail', 0.7, 0.28, 2.6, 2.4), mv('speed', 0.55, 0.55, -1.2, 3.3), mv('whale', 0.2, 0.72, 0.2, 4.4), mv('dolphins', 0.8, 0.7, 3.4, 5.5)]
          : [mv('ship', 0.28, 0.3, Math.PI / 2, 2.2), { k: 'rock', x: G.W * 0.74, y: G.H * 0.26, a: 0.4, v: 0, r: 52, seed: 5.1 }, { k: 'buoy', x: G.W * 0.58, y: G.H * 0.5, a: 0, v: 0, r: 30, seed: 3.3 }, { k: 'isle', x: G.W * 0.18, y: G.H * 0.74, a: 0.2, v: 0, r: 46, seed: 7.7 }];
        Sky.ws = 'clear'; Sky.wt = 99; var sv = SKY_TUNE.scroll; SKY_TUNE.scroll = 0; steps(40); SKY_TUNE.scroll = sv; }
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
      if (QA.params.gun && Sky.on){ skyGoGun(QA.params.gun); steps(20); }
      if (QA.params.hull && Sky.on){ Sky.hull = Sky.max * +QA.params.hull; steps(40); }
      GR.render(); QA.done({ view: V, errs: out.errs, state: G.state, wave: Sky.wave, en: Sky.en.length }); return;
    }
    if (QA.part(1)){
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
    /* each shot as it is fired (a shot that hits a drone at once is gone before it could be looked at), and one that is not a critical hit (one in twenty is, by chance) */
    var fired = [], baseFire = skyFire; skyFire = function(){ var n = Sky.shots.length; baseFire.apply(this, arguments); fired = fired.concat(Sky.shots.slice(n)); };
    function plain(){ return fired.filter(function(b){ return !b.crit; })[0]; }
    fired = []; steps(8); var r0 = plain(), d0 = r0 ? r0.dmg : 0; tap('KeyK'); steps(16); fired = []; steps(8); var n0 = plain(); skyFire = baseFire;
    check('doorHarder', Sky.gun === 'nose' && !!r0 && !!n0 && d0 > n0.dmg * 1.2);
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
    }
    if (QA.part(2)){
    /* ---- the detail layer (js/sky/44zzzzm-sky-detail.js) ---- */
    skyStart(3); steps(10); Sky.q = []; Sky.en = []; Sky.ws = 'intro'; Sky.wt = 1e9;               /* a wave that never ends, so nothing waits on an upgrade pick */
    var tops = 0, heads = [], tg = drawTopGiraffe, dh = skyDoorHead;                           /* she is never drawn standing on top; only her head, out of the door she shoots from */
    drawTopGiraffe = function(){ tops++; return tg.apply(this, arguments); }; skyDoorHead = function(c, r, sd, k){ if (k > 0.02) heads.push(sd); return dh.apply(this, arguments); };
    heads = []; GR.render(); var noseHeads = heads.length; skyGoGun('left'); steps(20); heads = []; GR.render(); var leftHeads = heads.slice(); skyGoGun('right'); steps(20); heads = []; GR.render(); var rightHeads = heads.slice();
    var mc = document.createElement('canvas'); mc.width = 400; mc.height = 400; try { drawMenuPreview(mc.getContext('2d'), 400, 400, 1); } catch (e) {}
    drawTopGiraffe = tg; skyDoorHead = dh;
    out.heads = [noseHeads, leftHeads.join(), rightHeads.join()].join('|'); check('noTopGiraffe', tops === 0); check('headAtDoor', noseHeads === 0 && leftHeads.join() === '-1' && rightHeads.join() === '1');
    var dc = document.createElement('canvas').getContext('2d'), drawBad = '';                  /* every thing on the sea draws, small and large */
    ['ship', 'trawler', 'sail', 'speed', 'whale', 'dolphins', 'rock', 'buoy', 'isle', 'fog'].forEach(function(k){ [0.6, 1.4].forEach(function(z){ [0, 3, 9, 11].forEach(function(ph){ try { skyDrawObj(dc, { k: k, x: 200, y: 200, a: 0.3, v: 1, r: 50, seed: 4.2, h: 1, ph: ph }, z); } catch (e) { drawBad += k + ':' + e.message + ' '; } }); }); });
    try { skyDrawSea(dc, 800, 600); skyDrawHeli(dc); } catch (e) { drawBad += 'sea:' + e.message; }
    check('detailDraw', drawBad === ''); out.detailBad = drawBad;
    Sky.objs = []; for (var so = 0; so < 30; so++) skySeaObj(Math.random() * G.H);              /* nothing on the sea on top of something else */
    var clashes = 0; Sky.objs.forEach(function(a, i){ Sky.objs.forEach(function(b, j){ if (j > i && skyObjsClash(a, b, skyS())) clashes++; }); });
    check('seaApart', clashes === 0); out.seaClashes = clashes;
    check('oneSpeed', Sky.objs.every(function(o){ return o.k === 'fog' || o.v === 1; }));          /* rocks and islands all scroll with the water, so they never drift together */
    /* boats steer round things: a ship aimed straight at a rock, and two boats head on; neither ever gets inside the other */
    var ss = skyS(), sv = SKY_TUNE.scroll; SKY_TUNE.scroll = 0; Sky.en = []; Sky.q = []; Sky.eb = [];
    var rk = { k: 'rock', x: 640, y: 300, a: 0, v: 1, r: 50, seed: 2 }, sh = { k: 'ship', x: 640, y: -200, a: 0, v: 1, r: 40, seed: 1, h: Math.PI / 2, want: Math.PI / 2, spd: 60, ph: 0 };
    Sky.objs = [rk, sh]; var minD = 1e9; for (var st = 0; st < 600; st++){ GR.step(1 / 30); minD = Math.min(minD, Math.hypot(sh.x - rk.x, sh.y - rk.y)); }
    check('shipAvoidsRock', minD >= (skyObjCore(rk) + skyObjCore(sh)) * ss * 0.98 && sh.y > rk.y); out.shipRock = Math.round(minD) + '/' + Math.round((skyObjCore(rk) + skyObjCore(sh)) * ss);
    var b1 = { k: 'trawler', x: 200, y: 300, a: 0, v: 1, r: 40, seed: 1, h: 0, want: 0, spd: 40, ph: 0 }, b2 = { k: 'sail', x: 1000, y: 300, a: 0, v: 1, r: 40, seed: 2, h: Math.PI, want: Math.PI, spd: 40, ph: 0 };
    Sky.objs = [b1, b2]; var minB = 1e9; for (var st2 = 0; st2 < 600; st2++){ GR.step(1 / 30); minB = Math.min(minB, Math.hypot(b1.x - b2.x, b1.y - b2.y)); }
    check('boatsAvoid', minB >= (skyObjCore(b1) + skyObjCore(b2)) * ss * 0.98 && b1.x > b2.x); out.boats = Math.round(minB) + '/' + Math.round((skyObjCore(b1) + skyObjCore(b2)) * ss);
    SKY_TUNE.scroll = sv;
    Sky.dbits = []; Sky.gun = 'right'; Sky.sw = 0; skyFire(); var brass = Sky.dbits.filter(function(b){ return b.k === 'brass'; }).length;
    var dr = skyEnemy('rotor'); dr.x = 300; dr.y = 200; dr.hp = 0; skyKill(dr); var bits = Sky.dbits.filter(function(b){ return b.k !== 'brass'; }).length;
    var fx0 = Sky.fx.length; steps(60); check('bits', brass === 1 && bits >= 4 && Sky.dbits.filter(function(b){ return b.k !== 'brass'; }).length === 0 && fx0 >= 0);                 /* the pieces fall and are gone (the gun keeps throwing brass) */
    Sky.hull = Sky.max * 0.1; Sky.inv = 99; var sm0 = Sky.fx.filter(function(f){ return f.smoke; }).length; Sky.en = []; Sky.q = []; steps(60); check('hurtSmoke', Sky.fx.filter(function(f){ return f.smoke; }).length > sm0);
    /* a minute of real play with the sea filling up as it goes: no two things on the water ever inside each other */
    skyStart(4); Sky.inv = 1e9; Sky.q = []; Sky.en = []; Sky.ws = 'intro'; Sky.wt = 1e9; var worst = 1e9, seen = {};
    for (var pl = 0; pl < 1800; pl++){ GR.step(1 / 30); if (pl % 5) continue; Sky.objs.forEach(function(a, i){ seen[a.k] = 1; Sky.objs.forEach(function(b, j){ if (j > i && a.k !== 'fog' && b.k !== 'fog') worst = Math.min(worst, Math.hypot(a.x - b.x, a.y - b.y) - (skyObjCore(a) + skyObjCore(b)) * skyS()); }); }); }
    check('seaNoCollide', worst > -1.5); out.seaWorst = Math.round(worst); out.seaSeen = Object.keys(seen).sort().join(',');
    skyQuit();
    /* ---- an old save ---- */
    var old = JSON.parse(JSON.stringify(Save.data)); ['chapter19Complete', 'skyBestWave', 'skyEscorts', 'skyClean', 'skyAim', 'skyRuns'].forEach(function(k){ delete old[k]; });
    localStorage.setItem(SAVE_KEY, JSON.stringify(old)); Save.load();
    check('oldSave', Save.data.chapter19Complete === false && Save.data.skyAim === true && Save.data.skyBestWave === 0 && Save.data.skyRuns === 0);
    }
  } catch (e) { out.errs.push(String(e && e.stack || e)); }
  out.pass = !out.failed.length && !out.errs.length;
  QA.done(out);
})();
