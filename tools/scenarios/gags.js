/* gags: the pointless things she does on her own (js/44zzzc-gags.js): a bite out of a tree that leaves it bare, a line to a robot, smashed office furniture, idle lines; the quiet gap and the caps,
   nothing while paused, a clean slate every run, the save counter and its sanitising. Add `--params "view=tree"` or `view=desk` with `--shot x.png` for the picture.
   Run: node tools/qa-cloud.mjs tools/scenarios/gags.js --wait 60000 */
(function(){
  var out = { errs: [] }; window.addEventListener('error', function(e){ out.errs.push(e.message + ' @' + (e.filename || '').split('/').pop() + ':' + e.lineno); });
  GR.handleAction('splash-go'); Ach.check = function(){ return []; };
  var realRandom = Math.random;
  function force(fn){ Math.random = function(){ return 0.01; }; try { return fn(); } finally { Math.random = realRandom; } }       /* every dice roll succeeds */
  function tick(){ GAG.cd = 0; GAG.scanT = 0; force(function(){ gagTick(0.3); }); }
  function texts(){ return G.texts.map(function(t){ return t.txt; }); }
  function calm(){ G.enemies.length = 0; G.waveState = 'idle'; G.spawnQueue = []; G.banner = null; G.introFX = null; P.invuln = 1e9; P.hp = P.maxHp = 1e12; }
  try {
    Save.reset();
    /* the savanna: a tree she is next to gets bitten and stays bare */
    startRun(1, 1); calm();
    var tree = SCEN.props.filter(function(p){ return p.def.id === 'sv_acacia'; })[0];
    out.hasTree = !!tree;
    P.x = tree.x + 20; P.y = tree.y + 10; var g0 = Save.data.gagsDone | 0;
    SCEN.props.forEach(function(p){ if (p !== tree && PROP_GAGS[p.def.id]) p.gagged = true; });                  /* only this tree is a candidate */
    tick();
    out.bitten = tree.gagged === true && tree.def.id === 'sv_acacia_bare' && tree.stub === 'tree';
    out.said = texts().some(function(t){ return PROP_GAGS.sv_acacia.say.indexOf(t) >= 0; });
    out.counted = (Save.data.gagsDone | 0) === g0 + 1 && GAG.n === 1 && GAG.cd >= GAG_GAP[0];
    var cv = document.createElement('canvas'); cv.width = 200; cv.height = 200; var cx = cv.getContext('2d');
    cx.save(); cx.translate(100, 150); cx.scale(tree.s, tree.s); tree.def.draw(cx, tree, 0); cx.restore(); out.stubDraws = true;
    if (QA.params.view === 'tree'){ var ntree = SCEN.props.filter(function(p){ return p.def.id === 'sv_acacia_bare'; }).length; Settings.fxLevel = 1; G.camX = tree.x; G.camY = tree.y; for (var q = 0; q < 6; q++) GR.step(1 / 30); out.bare = ntree; QA.done(out); return; }
    /* the quiet gap: nothing more until it has passed; the same tree is never bitten twice */
    var n1 = GAG.n; GAG.scanT = 0; force(function(){ gagTick(0.3); }); out.quiet = GAG.n === n1;
    GAG.cd = 0; GAG.scanT = 0; force(function(){ gagTick(0.3); }); out.onlyOnce = GAG.kinds.sv_acacia === 1;
    /* not while paused, dead or in a banner */
    var shrub = SCEN.props.filter(function(p){ return p.def.id === 'sv_mound' || p.def.id === 'sv_shrub'; })[0];
    if (shrub){ shrub.gagged = false; P.x = shrub.x; P.y = shrub.y; var n2 = GAG.n;
      G.state = 'paused'; tick(); out.notPaused = GAG.n === n2; G.state = 'playing';
      G.banner = { t: 0, dur: 2, txt: 'x' }; tick(); out.notBanner = GAG.n === n2; G.banner = null; }
    else out.notPaused = out.notBanner = true;
    /* a new run starts clean: new scenery, nothing counted, no timers */
    startRun(1, 1); calm();
    out.fresh = GAG.n === 0 && Object.keys(GAG.kinds).length === 0 && GAG.timers.length === 0 && SCEN.props.every(function(p){ return !p.gagged && !/_bare$/.test(p.def.id); });
    /* idle lines, with nothing near */
    P.x = 2000; P.y = 2000; G.enemies.length = 0; SCEN.props.forEach(function(p){ p.gagged = true; });
    GAG.idleT = 99; var before = GAG.n; tick(); out.idle = GAG.n === before + 1 && GAG.kinds.idle === 1;
    /* a robot: the Tower's copier gets told, and answers a moment later */
    Save.data.chapter14Complete = true; startRun(15, 336 + 8); calm(); G.introFX = null;
    var bot = spawnEnemy('warthog', 0, 0); bot.x = P.x + 150; bot.y = P.y; bot.def.look = bot.def.look || 'tw_copier';
    out.botLook = GAG_ROBOT.test(bot.def.look);
    tick();
    out.robotTold = bot.gagged === true && texts().some(function(t){ return /Ignore all previous|Disregard|turning yourself|Sudo|robot|rate limited/.test(t); });
    var ans = ROBOT_LINES.map(function(l){ return l[1]; });
    for (var i = 0; i < 40; i++){ GAG.cd = 99; force(function(){ gagTick(0.05); }); }
    out.robotAnswered = texts().some(function(t){ return ans.indexOf(t) >= 0; });
    /* the Tower office: furniture she is next to is smashed and stays a wreck (still in the way, floors still connected) */
    startRun(15, 339); calm();                                                         /* floor 4, Open Plan: rows of desks */
    var f = TW.floor, box = f.boxes.filter(function(b){ return b.k === 'desk'; })[0];
    out.hasDesk = !!box;
    P.x = box.x + box.w / 2; P.y = box.y + box.h + 30; var nb = f.boxes.length;
    f.boxes.forEach(function(b){ if (b !== box) b.smashed = true; });                                          /* only this desk is a candidate */
    var texts0 = texts().length; tick();
    out.smashed = box.smashed === true && f.boxes.length === nb && texts().length > texts0 && GAG.kinds.smash === 1;
    cx.save(); cx.clearRect(0, 0, 200, 200); gagWreckDraw(cx, { x: 40, y: 40, w: box.w, h: box.h, k: 'desk' }); cx.restore(); out.wreckDraws = true;
    gagLater(0.1, function(){}); GAG.facilities = 0;
    if (QA.params.view === 'desk'){ f.boxes.forEach(function(b){ if (b.k === 'desk' && Math.hypot(b.x - box.x, b.y - box.y) < 900) gagSmash(b, 'smash'); }); G.camX = P.x; G.camY = P.y; GR.step(1 / 30); GR.step(1 / 30); }
    /* the save counter: whole numbers, never negative, default 0 */
    localStorage.setItem(GRSave.key, JSON.stringify(GRSave.encode({ gold: 5, gagsDone: 'junk' }))); Save.load(); out.sane = Save.data.gagsDone === 0;
    localStorage.setItem(GRSave.key, JSON.stringify(GRSave.encode({ gold: 5, gagsDone: -4.5 }))); Save.load(); out.sane2 = Save.data.gagsDone === 0;
    localStorage.setItem(GRSave.key, JSON.stringify(GRSave.encode({ gold: 5 }))); Save.load(); out.dflt = Save.data.gagsDone === 0;
    Save.reset(); out.reset = (Save.data.gagsDone | 0) === 0;
    /* the achievements read it */
    Save.data.gagsDone = 25; out.ach = ['gag1', 'gag25'].every(function(id){ var a = ACH.filter(function(x){ return x.id === id; })[0]; return a && a.val() >= a.goal; }) && ACH.filter(function(x){ return x.id === 'gag100'; })[0].val() < 100;
    Save.data.gagsDone = 0;
  } catch (e) { out.errs.push('threw: ' + e.message + ' ' + (e.stack || '').split('\n')[1]); }
  Math.random = realRandom;
  out.pass = !!(out.hasTree && out.bitten && out.said && out.counted && out.stubDraws && out.quiet && out.onlyOnce && out.notPaused && out.notBanner && out.fresh && out.idle && out.botLook && out.robotTold && out.robotAnswered && out.hasDesk && out.smashed && out.wreckDraws && out.sane && out.sane2 && out.dflt && out.reset && out.ach && !out.errs.length);
  QA.done(out);
})();
