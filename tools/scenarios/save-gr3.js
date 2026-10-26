/* GR3 save packing (js/01b-savepack.js): a known-answer test that pins the format, round trips, the fast-then-repack write path, damage handling and the old formats.
   Run: node tools/qa-cloud.mjs tools/scenarios/save-gr3.js --wait 90000 */
GR.handleAction('splash-go');
var out = { errs: [] }; window.addEventListener('error', function(e){ out.errs.push(e.message); });
try {
  var KEY = GRSave.key;
  /* 1. the golden code: this exact object has always packed to exactly this text. If this fails the model changed, and every GR3 save in the wild would stop loading. */
  var gold = { gold: 123456, best: 98765, gear: { 'herdhide:cape': 1, 'sunforged:weapon': 1 }, ach: { first_kill: 1761400000000 }, name: 'Glimmer ’ é 😀', list: [1, 2.5, -3, null, true, false] };
  var GOLDEN = 'GR3:MV{sY#nq++&5#=KLK$Z#4OE7(ILkW@_F^H(:{[c2a|8=T)2_[sLy\'aQK@i%.Hvr`8Do)0V;l|dr@{l|:B25>`-=c6R*L,';
  out.golden = GRSave.encode(gold) === GOLDEN;
  out.goldenReads = JSON.stringify(GRSave.decode(GOLDEN)) === JSON.stringify(gold);
  out.alphabet = /^GR3:[#-\[\]-~]+$/.test(GOLDEN);                                                       /* printable ASCII, no quote and no backslash: safe inside a JSON string */
  /* 2. a big save made from the game's own tables round trips and is much smaller than GR2 */
  var d = JSON.parse(JSON.stringify(Save.data)), r = 7;
  function rnd(){ r = (r * 1103515245 + 12345) & 0x7fffffff; return r / 0x7fffffff; }
  META.forEach(function(m){ d.meta[m.id] = 1 + Math.floor(rnd() * 9); });
  GEAR_SETS.forEach(function(s){ ['cape', 'weapon', 'armor'].forEach(function(p){ d.gear[s.id + ':' + p] = 1; d.gearLv[s.id + ':' + p] = 1 + Math.floor(rnd() * 9); }); });
  ACH.forEach(function(a){ d.ach[a.id] = 1650000000000 + Math.floor(rnd() * 1e11); });
  d.gold = 48213977; d.best = 912345; d.name = 'x\u0000\n\t"\\';
  var big = GRSave.encode(d), fast = GRPack.encodeFast(d);
  out.sizes = { json: JSON.stringify(d).length, gr2: fast.length, gr3: big.length };
  out.bigGr3 = big.indexOf('GR3:') === 0;
  out.bigRound = JSON.stringify(GRSave.decode(big)) === JSON.stringify(d);
  out.smaller = big.length < fast.length * 0.7;
  /* 3. the write path: Save.write stores GR2 at once, flush() repacks the same text as GR3, load reads it back */
  Save.data = Object.assign(Save.data, JSON.parse(JSON.stringify(d))); Save.write();
  out.writeIsFast = /^"GR2:/.test(localStorage.getItem(KEY));
  var before = JSON.stringify(Save.data);
  out.flushed = GRSave.flush() === true;
  var raw = localStorage.getItem(KEY);
  out.nowGr3 = /^"GR3:/.test(raw) && raw.length < before.length * 0.5;
  Save.load(); out.loadGr3 = GRSave.read().gold === 48213977;
  out.loadedSame = out.loadGr3 && Save.data.gold === 48213977 && Save.data.meta[META[0].id] === d.meta[META[0].id] && Save.data.ach[ACH[3].id] === d.ach[ACH[3].id];
  /* a flush with nothing new, or after another writer, leaves storage alone */
  out.flushIdle = GRSave.flush() === false;
  Save.write(); localStorage.setItem(KEY, '{"gold":5}'); out.flushStale = GRSave.flush() === false && localStorage.getItem(KEY) === '{"gold":5}';
  /* 4. old formats still read */
  out.readsGr2 = GRSave.decode(fast).gold === 48213977 && GRSave.decode(JSON.stringify(fast)).gold === 48213977;
  out.readsPlain = GRSave.decode('{"gold":777}').gold === 777;
  /* 5. damage: a changed character, a cut-off code and a lying length all give null, quickly, and a damaged stored save is kept aside, not lost */
  var t0 = performance.now();
  var flip = big.slice(0, 40) + (big.charAt(40) === 'A' ? 'B' : 'A') + big.slice(41);
  out.flipNull = GRSave.decode(flip) === null;
  out.cutNull = GRSave.decode(big.slice(0, big.length - 30)) === null;
  out.lieNull = GRSave.decode('GR3:~~~~~~~~~~') === null && GRSave.decode('GR3:') === null && GRSave.decode('GR3:é') === null;
  out.fast = performance.now() - t0 < 6000;
  localStorage.removeItem(KEY + '_unreadable'); localStorage.setItem(KEY, JSON.stringify(flip)); Save.load();
  out.keptAside = Save.rescued === true && localStorage.getItem(KEY + '_unreadable') === JSON.stringify(flip);
  localStorage.removeItem(KEY + '_unreadable');
  /* 6. the model's tables are not kept after a call (memory): repeated encodes give the same text */
  out.stable = GRSave.encode(gold) === GOLDEN && GRSave.encode(gold) === GOLDEN;
} catch (e) { out.errs.push('threw: ' + e.message + ' ' + (e.stack || '').split('\n')[1]); }
out.pass = !!(out.golden && out.goldenReads && out.alphabet && out.bigGr3 && out.bigRound && out.smaller && out.writeIsFast && out.flushed && out.nowGr3 && out.loadedSame && out.flushIdle && out.flushStale &&
  out.readsGr2 && out.readsPlain && out.flipNull && out.cutNull && out.lieNull && out.fast && out.keptAside && out.stable && !out.errs.length);
QA.done(out);
