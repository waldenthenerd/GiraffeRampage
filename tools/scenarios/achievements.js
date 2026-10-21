/* achievements: the trophies (js/44zzu-achievements.js). Every goal is readable on any save, a fresh save earns nothing, a goal pays its gems once, a save that has done
   a lot earns it all at once with one message, an odd value in the save is tidied on load, the wall lists every goal, and nothing is counted while two giraffes play. */
(function(){
  var out = { errs: [] }; window.addEventListener('error', function(e){ out.errs.push(e.message + ' @' + (e.filename || '').split('/').pop() + ':' + e.lineno); });
  GR.handleAction('splash-go');
  try {
    var ids = {}, dup = 0, bad = [];
    ACH.forEach(function(a){ if (ids[a.id]) dup++; ids[a.id] = 1; var v = a.val(); if (typeof v !== 'number' || !isFinite(v) || !(a.goal > 0) || !(a.gems > 0) || !a.name || !a.desc) bad.push(a.id); });
    out.listOk = ACH.length >= 55 && dup === 0 && bad.length === 0; out.n = ACH.length; out.bad = bad;
    out.freshNothing = Ach.check().length === 0 && Ach.count() === 0;

    /* one goal, paid once */
    var g0 = Save.data.gems; Save.data.totalKills = 150; var got = Ach.check();
    out.one = got.length === 1 && got[0].id === 'kills100' && Save.data.gems === g0 + 3 && Ach.isDone('kills100');
    out.toast = !!document.getElementById('achToast') && document.getElementById('achToast').classList.contains('on') && /First Hundred/.test(document.getElementById('achToast').textContent);
    out.once = Ach.check().length === 0 && Save.data.gems === g0 + 3;
    Save.data.ach = {}; Save.data.gems = g0; Save.data.totalKills = 0;

    /* a save that has done a lot */
    var d = Save.data;
    d.totalKills = 2e5; d.runs = 300; d.best = 3e8; d.bestWave = 325; for (var c = 1; c <= 13; c++) d['chapter' + c + 'Complete'] = true; d.homecoming = true; d.gold = 2e6; d.gems = 600; d.cratesOpened = 300;
    Object.keys(GEAR_INDEX).slice(0, 40).forEach(function(k){ d.gear[k] = 1; }); Object.keys(TRINKETS).forEach(function(k){ d.gear['trinket:' + k] = 1; });
    var b = bestiaryData(); for (var ch = 1; ch <= BESTIARY_CHAPTERS.length; ch++) BESTIARY_ORDER.forEach(function(t){ b.creatures[ch + ':' + t] = 3; }); CARDS.forEach(function(cd){ b.cards[cd.id] = 1; });
    d.fusions = 12; Object.keys(META_BY_ID_SAFE()).forEach(function(k){ d.meta[k] = 6; });
    var m = miniData(); m.plays = 40; for (var s = 1; s <= 13; s++) m.stars[s] = 3; ACC_ITEMS.forEach(function(it){ m.own[it.id] = 1; });
    d.album = []; for (var p = 0; p < 48; p++) d.album.push({ c: 'x' + p, t: p });
    var t = townData(); for (var f = 0; f < 100; f++) t.found['f' + f] = 1; for (var v = 0; v < 9; v++) t.vis['v' + v] = 1; TOWN_NPC_LIST.forEach(function(id){ t.bond[id] = 5; });
    for (var e = 0; e < 25; e++) t.err['e' + e] = 2; t.n.loaves = 40; t.n.oven = 3; t.n.sails = 30; t.n.rings = 25;
    var sd = seaData(); BOATS.forEach(function(bt){ sd.own[bt.id] = 1; }); FISH.forEach(function(fi){ fishLog()[fi.id] = 1; });
    d.spaceplane = SHIP_STAGES.length; d.antsUnlocked = true; d.ants = { soldier: 60, distractor: 40, shooter: 10 }; for (var i = 0; i < 6; i++){ d.city['c' + i] = 1; d.venusUp['v' + i] = 1; d.marsUp['m' + i] = 1; } d.mutUses = 2;
    allComboPairs().slice(0, 12).forEach(function(pr){ d.combos[comboKeyOf(pr[0], pr[1])] = 1; });
    for (var w = 0; w < WARD_TOWN.length; w++) t.found[WARD_TOWN[w][2]] = 1;
    GYM_SKILLS.forEach(function(S){ gymSkill(S.id).l = 40; });
    UNI_FAC.forEach(function(F){ uniData().deg[F.id] = 3; }); UNI_BOOKS.forEach(function(bk){ uniData().read[bk.id] = 1; });
    var before = Save.data.gems, toasts = Ach.queue.length + (Ach.showing ? 1 : 0); Ach.queue.length = 0;
    var big = Ach.check();
    out.many = big.length >= 45; out.bigEarned = big.length; out.missing = ACH.filter(function(a){ return !Ach.isDone(a.id); }).map(function(a){ return a.id; });
    out.gemsPaid = Save.data.gems === before + big.reduce(function(s, a){ return s + a.gems; }, 0);
    out.oneMessage = Ach.queue.length + (Ach.showing ? 1 : 0) >= 1 && Ach.queue.length <= 1 && /trophies earned/.test((Ach.queue[0] || [''])[0] || document.getElementById('achToast').textContent);

    /* the wall and the menu button */
    Input.hasTouch = false; showMenu(); var btn = document.querySelector('[data-a="ach-open"]');
    out.btn = !!btn && new RegExp(Ach.count() + ' of ' + ACH.length).test(btn.textContent);
    handleAction('ach-open'); out.wall = G.subScreen === 'trophies' && ACH.every(function(a){ return OV.innerHTML.indexOf(a.name) >= 0; }) && /thead/.test(OV.innerHTML);
    handleAction('ach-back'); out.back = G.state === 'menu';

    /* the save: odd values are tidied on load, a good one is kept */
    var good = JSON.stringify(Save.data.ach);
    Save.data.ach = [1]; Save.write(); Save.load(); out.arr = !Array.isArray(Save.data.ach) && typeof Save.data.ach === 'object';
    Save.data.ach = { done: { a: 5, b: 'x', c: -3, d: null } }; Save.write(); Save.load(); out.tidy = JSON.stringify(Save.data.ach.done) === '{"a":5}';
    var ok = JSON.stringify({ done: { kills100: 123 } }); Save.data.ach = JSON.parse(ok); Save.write(); Save.load(); out.keep = JSON.stringify(Save.data.ach) === ok;
    localStorage.removeItem(SAVE_KEY); Save.load(); out.freshHas = typeof Save.data.ach === 'object' && Object.keys(Save.data.ach.done || {}).length === 0 && JSON.stringify(DEFAULT_SAVE.ach) === '{}';

    /* nothing is counted while two giraffes play */
    Save.data.totalKills = 1e6; Co.on = true; var inCo = Ach.check(); Co.on = false; out.noCoCount = inCo.length === 0 && Ach.count() === 0;
  } catch (e) { out.errs.push('threw: ' + e.message + ' ' + (e.stack || '').split('\n').slice(0, 3).join(' | ')); }
  function META_BY_ID_SAFE(){ var o = {}; META.forEach(function(x){ o[x.id] = 1; }); return o; }
  var need = ['listOk', 'freshNothing', 'one', 'toast', 'once', 'many', 'gemsPaid', 'oneMessage', 'btn', 'wall', 'back', 'arr', 'tidy', 'keep', 'freshHas', 'noCoCount'];
  out.pass = out.errs.length === 0 && need.every(function(k){ return out[k] === true; });
  QA.done(out);
})();
