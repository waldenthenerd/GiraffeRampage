/* Buy 5 and buy 10 on every crate: one reveal with all the openings at once, 5 to a row. Run: node tools/qa-cloud.mjs tools/scenarios/gear-batch.js --wait 60000 [--shot x.png --params "view=ten|five|shake|phone"] */
GR.handleAction('splash-go');
var out = { errs: [] }; window.addEventListener('error', function(e){ out.errs.push(e.message); });
function reset(){ Save.data.gear = {}; Save.data.gearLv = {}; Save.data.cratePity = {}; Save.data.equipped = { cape: null, weapon: null, armor: null }; Save.data.cratesOpened = 0; }
function rowsOf(sel){ var tops = {}; [].slice.call(document.querySelectorAll(sel)).forEach(function(n){ tops[Math.round(n.getBoundingClientRect().top)] = 1; }); return Object.keys(tops).length; }
try {
  var rr = rollRarity;
  /* ten Supply Crates: 250 gems, ten cells, two rows of five */
  reset(); Save.data.gems = 1000; showShop('gear'); var ok = gearBuyMany('normal', 10);
  out.ten = ok === true && Save.data.gems === 750 && Save.data.cratesOpened === 10 && gearReveal.active === true && Array.isArray(gearReveal.batch) && gearReveal.batch.length === 10;
  var cells = document.querySelectorAll('#crateReveal .crc'); out.tenCells = cells.length === 10;
  var cols = getComputedStyle(document.querySelector('#crateReveal .crgrid')).gridTemplateColumns.split(' ').length; out.five = cols === 5;
  out.twoRows = rowsOf('#crateReveal .crc') === 2;
  out.names = [].slice.call(cells).every(function(c, i){ return c.textContent.indexOf(gearReveal.batch[i].piece.name) >= 0; });
  gearRevealSkip(); out.allShown = [].slice.call(document.querySelectorAll('#crateReveal .crcard')).every(function(c){ return getComputedStyle(c).display !== 'none'; });
  out.summary = /10/.test((document.querySelector('#crateReveal .crsum') || {}).textContent || '');
  var again = gearBuyMany('normal', 5); out.guard = again === false && Save.data.gems === 750;
  showShop('upgrades'); out.ended = !gearReveal.active && gearReveal.timers.length === 0 && !document.getElementById('crateReveal');
  /* five: one row of five */
  reset(); Save.data.gems = 1000; showShop('gear'); gearBuyMany('normal', 5); out.fiveOk = Save.data.gems === 875 && document.querySelectorAll('#crateReveal .crc').length === 5 && rowsOf('#crateReveal .crc') === 1; gearRevealEnd();
  /* every crate kind: prices, food too */
  reset(); Save.data.gems = 100000; Save.data.food = 600; showShop('gear'); gearBuyMany('rare', 10); out.prime = Save.data.gems === 100000 - 700; gearRevealEnd();
  gearBuyMany('spotted', 10); out.spotted = Save.data.gems === 100000 - 700 - 10000 && Math.abs(Save.data.food - 100) < 1e-9; gearRevealEnd();
  Save.data.gems = 20000; Save.data.food = 249; out.noFood = gearBuyMany('spotted', 5) === false && Save.data.gems === 20000 && Save.data.food === 249;
  /* can't afford a whole batch: nothing spent; the buttons say so */
  reset(); Save.data.gems = 130; showShop('gear'); var b5 = document.querySelector('[data-a="gear-buy-normal-5"]'), b10 = document.querySelector('[data-a="gear-buy-normal-10"]');
  out.buttons = !!b5 && !!b10 && b5.disabled === false && b10.disabled === true && /125 gems/.test(b5.textContent) && /250 gems/.test(b10.textContent);
  out.short = gearBuyMany('normal', 10) === false && Save.data.gems === 130 && Object.keys(Save.data.gear).length === 0;
  out.single = !!document.querySelector('[data-crate="normal"]') && !!document.querySelector('[data-crate="spotted"]') && document.querySelectorAll('[data-a^="gear-buy-"]').length === 6;
  /* pity runs through a batch: ten commons in a row, the tenth is rare or better */
  reset(); Save.data.gems = 1000; rollRarity = function(){ return 'common'; }; gearBuyMany('normal', 10); rollRarity = rr;
  var b = gearReveal.batch; out.pity = b.length === 10 && b[9].pity === true && RARITY_ORDER[b[9].rarity] >= RARITY_ORDER.rare && b.slice(0, 9).every(function(r){ return !r.pity; }) && cratePityCount('normal') === 0; gearRevealEnd();
  /* duplicates inside a batch level up; refunds add to the gems */
  reset(); Object.keys(GEAR_INDEX).forEach(function(id){ grantGear(id); }); Save.data.gems = 250; rollRarity = function(){ return 'common'; }; gearBuyMany('normal', 10); rollRarity = rr;
  var lv = gearReveal.batch.filter(function(r){ return r.levelUp; }).length; out.dupes = gearReveal.batch.every(function(r){ return r.dupe; }) && lv === 10 && Save.data.gems === 0; gearRevealEnd();
  /* Visual effects off: one short timer */
  var fx0 = Settings.fxLevel; Settings.fxLevel = 0; reset(); Save.data.gems = 300; showShop('gear'); gearBuyMany('normal', 10); out.fxOff = gearReveal.timers.length === 1; gearRevealEnd(); Settings.fxLevel = fx0;
  /* the screenshots */
  if (QA.params.view){ reset(); Save.data.gems = 3000; Save.data.food = 100; var n = QA.params.view === 'five' ? 5 : 10; showShop('gear');
    var kind = QA.params.kind || 'rare'; if (QA.params.force){ var seq = QA.params.force.split(','), q = 0; rollRarity = function(){ return seq[q++ % seq.length]; }; }
    gearBuyMany(kind, n); rollRarity = rr; if (QA.params.phase !== 'shake') gearRevealSkip(); }
} catch (e) { out.errs.push('threw: ' + e.message + ' ' + (e.stack || '').split('\n')[1]); }
var keys = ['ten', 'tenCells', 'five', 'twoRows', 'names', 'allShown', 'summary', 'guard', 'ended', 'fiveOk', 'prime', 'spotted', 'noFood', 'buttons', 'short', 'single', 'pity', 'dupes', 'fxOff'];
out.failed = keys.filter(function(k){ return !out[k]; }); out.pass = !out.failed.length && !out.errs.length;
QA.done(out);
