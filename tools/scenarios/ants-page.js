/* The ants tab as an anthill cutaway (js/41d-ants-page.js). Run: node tools/qa-cloud.mjs tools/scenarios/ants-page.js --wait 60000 [--shot x.png --w 390 --h 844 --scale 2 --params "view=full|empty|locked|deep|lockeddeep"] */
GR.handleAction('splash-go');
var out = { errs: [] }; window.addEventListener('error', function(e){ out.errs.push(e.message); });
try {
  var view = (QA.params && QA.params.view) || 'none';
  Save.data.antsUnlocked = true; Save.data.ants = { soldier: 3, distractor: 0, shooter: 12 }; Save.data.food = 40; Save.data.gold = 1e6; Save.data.gems = 5000;
  showShop('ants');
  out.page = !!document.querySelector('.antpg') && document.querySelectorAll('.aproom').length === 4 && !!document.getElementById('antSurface') && document.querySelectorAll('canvas.arcv').length === 3;
  out.food = /40\.0/.test(document.querySelector('.apfood').textContent) && !!document.querySelector('[data-forage-btn]') && !!document.getElementById('foodAmt');
  /* costs: a batch is the sum of its steps and the price stops rising at the 16th */
  Save.data.ants.soldier = 0; var c1 = antCostMany('soldier', 1), c5 = antCostMany('soldier', 5), s5 = 0; for (var i = 0; i < 5; i++) s5 += Math.round(Math.pow(1.3, i) * 10) / 10;
  out.cost = c1 === 1 && Math.abs(c5 - Math.round(s5 * 10) / 10) < 1e-9;
  Save.data.ants.soldier = 15; var c3 = antCostMany('soldier', 3), p16 = Math.round(Math.pow(1.3, 16) * 10) / 10; out.capPrice = Math.abs(c3 - Math.round((Math.round(Math.pow(1.3, 15) * 10) / 10 + p16 + p16) * 10) / 10) < 1e-9;
  Save.data.ants.soldier = 0;
  /* hiring: all or nothing, never past the cap, one at a time still works */
  Save.data.food = 3; out.poor = hireAntMany('soldier', 5) === false && Save.data.ants.soldier === 0 && Save.data.food === 3;
  Save.data.food = 40; var before = Save.data.food; out.hire5 = hireAntMany('soldier', 5) === true && Save.data.ants.soldier === 5 && Math.abs(before - Save.data.food - antCostMany.call(null, 'soldier', 0) - c5) < 1e-6;
  Save.data.ants.shooter = antMax() - 2; Save.data.food = 500; out.capBlock = hireAntMany('shooter', 5) === false && Save.data.ants.shooter === antMax() - 2 && hireAntMany('shooter', 2) === true && Save.data.ants.shooter === antMax();
  GR.handleAction('hire-soldier'); out.oldHire = Save.data.ants.soldier === 6;
  Save.data.ants.distractor = 0; Save.data.food = 50; GR.handleAction('ant-hire-distractor-10'); out.act10 = Save.data.ants.distractor === 10 && !!document.querySelector('.antpg') && /Chamber full/.test(document.querySelectorAll('.aproom')[1].textContent);
  GR.handleAction('ant-hire-distractor-1'); out.act1 = Save.data.ants.distractor === 10;
  GR.handleAction('ant-hire-bogus-5'); out.bogus = Save.data.ants.distractor === 10 && !!document.querySelector('.antpg');
  /* the buttons follow what she can afford */
  Save.data.ants = { soldier: 0, distractor: 0, shooter: 0 }; Save.data.food = 10; showShop('ants');
  var b = document.querySelectorAll('.aproom')[0].querySelectorAll('.btn'); out.buttons = b.length === 3 && !b[0].disabled && !b[1].disabled && b[2].disabled;
  /* the pictures draw: the three chambers and the surface, with ants in them */
  var cvs = [].slice.call(document.querySelectorAll('#antSurface, .arcv')); out.canvases = cvs.length === 4 && cvs.every(function(c){ return c.width > 40 && c.height > 40; });
  Save.data.ants = { soldier: 6, distractor: 3, shooter: 9 }; showShop('ants'); for (var q = 0; q < 6; q++) antsLoop(1000 + q * 50);
  var px = function(cv){ var d = cv.getContext('2d').getImageData(0, 0, cv.width, cv.height).data, n = 0; for (var i = 0; i < d.length; i += 4 * 37) if (d[i + 3] > 0) n++; return n; };
  out.drawn = [].slice.call(document.querySelectorAll('canvas.arcv')).every(function(c){ return px(c) > 50; });
  out.sim = antsPage.sim.soldier.length === 6 && antsPage.sim.shooter.length === 9;
  /* the locked view is unchanged and no loop is left running */
  Save.data.antsUnlocked = false; showShop('ants'); out.locked = /still underground/.test(document.querySelector('.panel').textContent) && !document.querySelector('.antpg') && antsPage.cvs.length === 0;
  Save.data.antsUnlocked = true; showShop('wheel'); out.stops = antsPage.cvs.length === 0 && antsPage.raf === 0;
  /* the deep layer */
  Save.data.chapter13Complete = false; showShop('ants'); out.noDeep = !document.querySelector('.apdeep');
  Save.data.chapter13Complete = true; showShop('ants'); out.lockedDeep = !!document.querySelector('.apdeep.locked') && /Deep Colony/.test(document.querySelector('.apdeep').textContent);
  if (typeof squadAvailable === 'function'){ var sa = squadAvailable; squadAvailable = function(){ return true; }; Save.data.squad = { 0: 1 }; showShop('ants');
    out.five = document.querySelectorAll('.aproom.sq').length === 5 && document.querySelectorAll('.aproom.sq.hired').length === 1 && document.querySelectorAll('.arsq').length === 5;
    out.portrait = px(document.querySelector('.arsq')) > 20; squadAvailable = sa; }
  /* old save, no ants object problems */
  Save.data.chapter13Complete = false; Save.data.squad = {};
  if (view !== 'none'){
    Save.data.antsUnlocked = view !== 'locked'; Save.data.food = 23.4;
    Save.data.ants = view === 'empty' ? { soldier: 0, distractor: 0, shooter: 0 } : { soldier: 7, distractor: 4, shooter: 10 };
    if (view === 'deep' || view === 'lockeddeep'){ Save.data.chapter13Complete = true; if (view === 'deep'){ window.squadAvailable = function(){ return true; }; squadAvailable = window.squadAvailable; Save.data.squad = { 1: 1, 3: 1 }; } }
    G.state = 'shop'; shopTab = 'ants'; showShop('ants');
    if (typeof antsLoop === 'function') for (var k = 0; k < 40; k++) antsLoop(1000 + k * 45);
  }
} catch (e) { out.errs.push('threw: ' + e.message + ' ' + (e.stack || '').split('\n')[1]); }
out.pass = out.errs.length === 0 && ['page', 'food', 'cost', 'capPrice', 'poor', 'hire5', 'capBlock', 'oldHire', 'act10', 'act1', 'bogus', 'buttons', 'canvases', 'drawn', 'sim', 'locked', 'stops', 'noDeep', 'lockedDeep', 'five', 'portrait'].every(function(k){ return out[k] === true; });
QA.done(out);
