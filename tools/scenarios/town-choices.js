/* town-choices: two things in reach in Longneck Town (js/town/44zzzzb-town-choices.js and the prompts in 44w-town-engine.js). Standing between the
   corner table and the jukebox in Penny's Café, the nearest gets the gold prompt and the other the blue one; Q uses the second (the jukebox opens),
   a tap on the blue prompt does too, E still uses the first; with only one thing near there is no second prompt; a person in front of a door makes
   two prompts (the door and the person); the dig spot, walker and fountain hiders put everything back. Picture: --params "view=cafe" or "view=street". */
(function(){
  var out = { failed: [], errs: [] }, check = function(k, v){ if (!v) out.failed.push(k); };
  window.addEventListener('error', function(e){ out.errs.push(e.message); });
  GR.handleAction('splash-go'); Ach.check = function(){ return []; };
  var view = QA.params.view || '';
  var frames = function(n){ for (var i = 0; i < n; i++) GR.step(1 / 30); GR.render(); };
  var press = function(code){ Input.keys[code] = true; frames(1); Input.keys[code] = false; frames(1); };
  try {
    Save.reset(); var td = townData(); td.tips.controls = 1;
    G.state = 'menu'; townEnter('in_cafe', 683, 1); Town.fixHour = 12; Town.walkers = []; Town.bannerT = 0; frames(20);
    out.near = Town.near && Town.near.label; out.near2 = Town.near2 && Town.near2.label;
    var ids = [Town.near && Town.near.b && Town.near.b.id, Town.near2 && Town.near2.b && Town.near2.b.id].sort().join();
    check('twoInCafe', ids === 'jukebox,table2' && Town.near2For === Town.near);
    check('twoPrompts', !!Town.ui.prompt && !!Town.ui.prompt2 && Town.ui.prompt2.x !== Town.ui.prompt.x);
    if (view === 'cafe'){ QA.done(out); return; }
    var second = Town.near2.b.act;
    press('KeyQ'); out.afterQ = second;
    check('qUsesSecond', second === 'jukebox' ? !!document.querySelector('.tp-juke') : !!document.getElementById('townDlg'));
    townClosePanel(); if (typeof townCloseDialog === 'function') townCloseDialog(); Town.panel = false; frames(3);
    /* a tap on the blue prompt */
    var R = Town.ui.prompt2; if (R){ Input.sx = R.x + R.w / 2; Input.sy = R.y + R.h / 2; Input.mdown = true; frames(1); Input.mdown = false; frames(1); }
    check('tapSecond', second === 'jukebox' ? !!document.querySelector('.tp-juke') : true);
    townClosePanel(); if (typeof townCloseDialog === 'function') townCloseDialog(); Town.panel = false; frames(3);
    /* only one thing near: no second prompt */
    Town.x = 920; frames(4); out.alone = Town.near && Town.near.label;
    check('oneOnly', !!Town.near && !Town.near2 && !Town.ui.prompt2);
    /* a person standing at a door: both */
    var D = null, door = null, n = null;
    TOWN_IDS.some(function(id){ if (!TOWN_DIST[id].open()) return false; townGo(id, 900, 1); Town.walkers = []; frames(2); D = TOWN_DIST[id]; door = D.b.filter(function(b){ return b.to; })[0]; n = Town.npcs[0]; return !!(n && door); });
    out.street = { d: Town.d, npcs: Town.npcs.length, door: !!door };
    check('foundStreet', !!(n && door));
    if (n && door){ n.x = door.x + 10; n.tx = n.x; n.home = n.x; n.def.habit = 'stand'; Town.x = door.x + 5; frames(3);
      out.door = [Town.near && Town.near.label, Town.near2 && Town.near2.label];
      check('doorAndPerson', !!Town.near && !!Town.near2 && ((Town.near.k === 'npc') !== (Town.near2.k === 'npc'))); }
    if (view === 'street'){ QA.done(out); return; }
    /* the hiders put everything back */
    var nb = D.b.length, nn = Town.npcs.length; townNearest(D, townInput()); check('restored', D.b.length === nb && Town.npcs.length === nn);
    var w = { hid: 0 }, und = townHideChoice({ k: 'walker', w: w }, D); und(); check('walkerBack', w.hid === 0);
    var got = townDaily().got.slice(), u2 = townHideChoice({ k: 'dig', i: 99 }, D); u2(); check('digBack', townDaily().got.join() === got.join());
  } catch (e){ out.errs.push(String(e && e.stack || e)); }
  out.pass = !out.failed.length && !out.errs.length;
  QA.done(out);
})();
