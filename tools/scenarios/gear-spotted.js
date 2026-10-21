/* Spotted Crates: 1000 gems + 50 food, 2% mythical, better epic and legendary odds. Run: node tools/qa-cloud.mjs tools/scenarios/gear-spotted.js --wait 60000 [--shot x.png --params "view=card|reveal"] */
GR.handleAction('splash-go'); Ach.check = function(){ return []; };      /* a trophy for the first crate would add gems to the exact counts below */
var out = { errs: [] }; window.addEventListener('error', function(e){ out.errs.push(e.message); });
function reset(){ Save.data.gear = {}; Save.data.gearLv = {}; Save.data.cratePity = {}; Save.data.equipped = { cape: null, weapon: null, armor: null }; Save.data.cratesOpened = 0; }
try {
  var C = CRATES.spotted, P1 = CRATES.rare, N = CRATES.normal;
  out.def = !!C && C.cost === 1000 && C.food === 50 && C.name === 'Spotted Crate';
  var sum = Object.keys(C.weights).reduce(function(a, k){ return a + C.weights[k]; }, 0);
  out.odds = !!C && C.weights.mythical === 2 && Math.abs(sum - 100) < 1e-9 && C.weights.epic > P1.weights.epic && C.weights.legendary > P1.weights.legendary && C.weights.epic > N.weights.epic && C.weights.legendary > N.weights.legendary && C.weights.mythical > P1.weights.mythical;
  var mr = Math.random;
  Math.random = function(){ return 0.985; }; var m1 = rollRarity(C.weights);
  Math.random = function(){ return 0.975; }; var m2 = rollRarity(C.weights);
  Math.random = mr; out.edges = m1 === 'mythical' && m2 === 'legendary';
  var n = 200000, cm = 0, ce = 0, cl = 0; for (var i = 0; i < n; i++){ var r = rollRarity(C.weights); if (r === 'mythical') cm++; else if (r === 'epic') ce++; else if (r === 'legendary') cl++; }
  out.mc = [cm, ce, cl]; out.mcOk = cm > 3700 && cm < 4300 && ce > 70000 && ce < 74000 && cl > 46500 && cl < 49500;     /* expected 4000, 72000, 48000 */
  /* it needs both: gems and food. Nothing is spent when it cannot be opened. */
  reset(); Save.data.gems = 5000; Save.data.food = 49.9; var g0 = Save.data.gems, f0 = Save.data.food;
  out.noFood = openCrate('spotted') === null && Save.data.gems === g0 && Save.data.food === f0 && Object.keys(Save.data.gear).length === 0;
  Save.data.gems = 999; Save.data.food = 80; out.noGems = openCrate('spotted') === null && Save.data.gems === 999 && Save.data.food === 80;
  Save.data.gems = 2500; Save.data.food = 80.5; var rr = rollRarity; rollRarity = function(){ return 'mythical'; };
  var res = openCrate('spotted'); rollRarity = rr;
  out.opens = !!res && res.rarity === 'mythical' && Save.data.gems === 1500 && Math.abs(Save.data.food - 30.5) < 1e-9 && res.piece.setId === 'worldspire';
  out.noPity = !('spotted' in (Save.data.cratePity || {})) || Save.data.cratePity.spotted === undefined || true;
  /* exactly 50 food and 1000 gems is enough */
  Save.data.gems = 1000; Save.data.food = 50; reset(); out.exact = !!openCrate('spotted') && Save.data.gems === 0 && Save.data.food === 0;
  /* the page: a card for each of the three crates, with the cost and the odds; nothing breaks with no food */
  reset(); Save.data.gems = 1200; Save.data.food = 20; showShop('gear'); var txt = OV.textContent;
  out.card = /Spotted Crate/.test(txt) && /1,?000 gems/.test(txt) && /50 food/.test(txt) && /Mythical 2%/.test(txt);
  out.three = document.querySelectorAll('.crate').length === 3;
  var btn = document.querySelector('[data-crate="spotted"]'); out.disabledNoFood = !!btn && btn.disabled === true;
  Save.data.food = 60; showShop('gear'); btn = document.querySelector('[data-crate="spotted"]'); out.enabled = !!btn && btn.disabled === false;
  /* buying through the real button path: spends once, even if clicked twice quickly */
  reset(); Save.data.gems = 1000; Save.data.food = 50; rollRarity = function(){ return 'epic'; }; showShop('gear'); buyCrate('spotted'); buyCrate('spotted');
  out.buyOnce = Save.data.gems === 0 && Save.data.food === 0 && Object.keys(Save.data.gear).length === 1 && gearReveal.active === true; gearRevealEnd(); rollRarity = rr;
  /* the other crates are untouched */
  reset(); Save.data.gems = 100; Save.data.food = 0; rollRarity = function(){ return 'common'; }; var rn = openCrate('normal'); rollRarity = rr; out.othersOk = !!rn && Save.data.gems === 75 && Save.data.food === 0 && cratePityCount('normal') >= 1;
  /* the odds show in a screenshot */
  if (QA.params.view){ reset(); Save.data.gems = 4000; Save.data.food = 120; showShop('gear'); var crEl = document.querySelector('.crates'); if (crEl && crEl.scrollIntoView) crEl.scrollIntoView({ block: 'center' });
    if (QA.params.view === 'reveal'){ rollRarity = function(){ return 'mythical'; }; buyCrate('spotted'); gearRevealSkip(); rollRarity = rr; } }
} catch (e) { out.errs.push('threw: ' + e.message + ' ' + (e.stack || '').split('\n')[1]); }
var keys = ['def', 'odds', 'edges', 'mcOk', 'noFood', 'noGems', 'opens', 'exact', 'card', 'three', 'disabledNoFood', 'enabled', 'buyOnce', 'othersOk'];
out.failed = keys.filter(function(k){ return !out[k]; }); out.pass = !out.failed.length && !out.errs.length;
QA.done(out);
