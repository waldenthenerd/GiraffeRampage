/* Keyboard and gamepad on the shop pages (Nav in js/41-qol.js, the focus handlers in 41a/41b, the labels in 41d/41e). Run: node tools/qa-cloud.mjs tools/scenarios/nav-pages.js --wait 60000 [--shot x.png --params "view=upgrades|wheel|ants|trinkets|gear"] */
GR.handleAction('splash-go');
var out = { errs: [], reach: {} }; window.addEventListener('error', function(e){ out.errs.push(e.message); });
function $(s){ return document.querySelector(s); } function $$(s){ return [].slice.call(document.querySelectorAll(s)); }
function lab(el){ return el.tagName.toLowerCase() + (el.id ? '#' + el.id : '') + '[' + (el.getAttribute('data-a') || el.getAttribute('data-buy') || el.getAttribute('data-th') || el.getAttribute('data-gh') || el.className) + ']'; }
/* every control the pad can focus must be reachable from the first one by arrow moves (Nav.move is what the arrows and the D-pad call) */
function reachable(){
  var all = Nav.list(); if (!all.length) return { total: 0, missed: [] };
  var seen = new Set([all[0]]), queue = [all[0]];
  while (queue.length){
    var el = queue.shift();
    [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(function(d){ el.focus(); Nav.move(d[0], d[1]); var n = document.activeElement; if (n && all.indexOf(n) >= 0 && !seen.has(n)){ seen.add(n); queue.push(n); } });
  }
  return { total: all.length, missed: all.filter(function(e){ return !seen.has(e); }).map(lab) };
}
try {
  var view = (QA.params && QA.params.view) || 'none';
  ['debug-unlockall', 'debug-venus', 'debug-mars', 'debug-city', 'debug-lab', 'debug-ants', 'debug-mini-own'].forEach(function(a){ try { GR.handleAction(a); } catch (e) {} });
  Save.data.gold = 5e5; Save.data.gems = 9000; Save.data.food = 30; Save.data.wheelKeys = 3; Save.data.spottedKeys = 12; Save.data.antsUnlocked = true; Save.data.ants = { soldier: 3, distractor: 0, shooter: 2 };
  Save.data.chapter3Complete = true; Save.data.meta = { hooves: 2, hide: 1 }; Save.data.gear = Save.data.gear || {};
  Object.keys(GEAR_INDEX).forEach(function(id, i){ if (i % 2 === 0) grantGear(id); }); Object.keys(TRINKETS).forEach(function(id, i){ if (i % 2 === 0) grantTrinket(id); });
  var pages = { gear: function(){ gearPage.view = 'doll'; showShop('gear'); }, sets: function(){ gearPage.view = 'sets'; showShop('gear'); }, ants: function(){ showShop('ants'); }, wheel: function(){ showShop('wheel'); }, upgrades: function(){ upgPage.group = 'combat'; showShop('upgrades'); } };
  /* 1. everything the pad can press is reachable, and the controls the list used to miss are in it */
  Object.keys(pages).forEach(function(k){ pages[k](); Nav.on = true; var r = reachable(); out.reach[k] = r.total > 4 && r.missed.length === 0 ? true : r.missed.slice(0, 5); });
  out.reachAll = Object.keys(out.reach).every(function(k){ return out.reach[k] === true; });
  pages.upgrades(); out.listSummary = Nav.list().some(function(e){ return e.tagName === 'SUMMARY'; });
  pages.ants(); out.listNumber = Nav.list().some(function(e){ return e.id === 'foodAmt'; });
  /* 2. the bonuses panel opens and closes from the pad (Nav.click on a summary) */
  pages.upgrades(); var det = $('.upsum'), sm = det.querySelector('summary'), was = det.open; sm.focus(); out.summaryClick = Nav.click() === true && det.open !== was && (Nav.click(), det.open === was);
  /* 3. a focus ring on every kind of control (the rule is :focus-visible, so look for a rule that would match) */
  var ringRules = []; [].slice.call(document.styleSheets).forEach(function(sh){ try { [].slice.call(sh.cssRules).forEach(function(r){ if (r.selectorText && /:focus-visible/.test(r.selectorText) && /outline/.test(r.cssText)) ringRules.push(r.selectorText); }); } catch (e) {} });
  var covers = function(el){ return ringRules.some(function(sel){ return sel.split(',').some(function(one){ try { return el.matches(one.replace(/:focus-visible/g, '').trim()); } catch (e) { return false; } }); }); };
  pages.upgrades(); var sample = $$('#overlay button, #overlay summary, #overlay input'); out.ringsUpgrades = sample.length > 10 && sample.every(covers);
  pages.wheel(); out.ringsWheel = $$('#overlay button').every(covers);
  pages.ants(); out.ringsAnts = $$('#overlay button, #overlay input').every(covers);
  pages.gear(); out.ringsGear = $$('#overlay button').every(covers);
  /* 4. focus shows the same panel as pointing: a gear piece (compare panel), a trinket (its numbers), and moving on to the panel keeps it */
  pages.gear(); Nav.on = true; gearPage.hover = null; gearPage.selected = null; var gp = $('.gp[data-gh]'); if (gp){ gp.focus(); out.gearFocus = gearPage.hover === gp.dataset.gh; var eq = $('#gearSide button, #gearSide .btn'); if (eq){ eq.focus(); out.gearKeep = gearPage.hover === gp.dataset.gh; } else out.gearKeep = true; var other = $('.gslot'); other.focus(); out.gearClear = gearPage.hover === null; } else { out.gearFocus = out.gearKeep = out.gearClear = false; }
  showShop('gear'); Nav.on = true; trinketPage.hover = null; trinketPage.sel = null; var tt = $('.ttile:not(.locked)'); tt.focus(); out.trinketFocus = trinketPage.hover === tt.dataset.th && /Tap to|Worn/.test($('#trinketSide').textContent);
  $('.gslot, .gview-b').focus(); out.trinketClear = trinketPage.hover === null;
  /* 5. after the screen is drawn again the focus is not lost: the same button, or the nearest one when it has gone gray */
  pages.upgrades(); Nav.on = true; Save.data.meta = {}; Save.data.gold = 150; showShop('upgrades'); var buy = $('[data-buy="hooves"]'); buy.focus(); out.focusStart = document.activeElement === buy;
  buy.click(); out.focusKept = !!document.activeElement && document.activeElement !== document.body && OV.contains(document.activeElement) && document.activeElement.tagName === 'BUTTON' && !document.activeElement.disabled;
  pages.wheel(); Nav.on = true; Save.data.wheelKeys = 1; Save.data.spottedKeys = 0; wheelPage.id = 'normal'; wheelResult = null; wheelSpinning = false; showShop('wheel'); $('#wheelSpinBtn').focus(); spinWheelUI();
  out.spinGrey = $('#wheelSpinBtn').disabled && document.activeElement !== document.body && OV.contains(document.activeElement);       /* while it turns, focus moved to something live */
  wheelPage.batch = [wheelRoll(WHEELS.normal)].map(function(sg){ return wheelPay(WHEELS.normal, sg); }); Save.data.wheelKeys = 2; revealWheelResult(wheelPage.batch[0]);
  out.spinBack = document.activeElement === $('#wheelSpinBtn');
  /* 6. the repeated buttons say which thing they buy */
  pages.upgrades(); out.ariaUpg = $$('.upbtns .btn').length > 3 && $$('.upbtns .btn').every(function(b){ return /Buy .* (gold|levels)/.test(b.getAttribute('aria-label') || ''); }) && /Hooves/.test($('[data-buy="hooves"]').getAttribute('aria-label'));
  pages.ants(); out.ariaAnts = $$('.arbtns .btn').length >= 3 && $$('.arbtns .btn').every(function(b){ return /^Hire (\d+ .*Ant.* for [\d.]+ food|.+ for .+)$/.test(b.getAttribute('aria-label') || ''); });
  pages.wheel(); out.ariaWheel = $$('.wbtns .btn').length === 3 && $$('.wbtns .btn').every(function(b){ return /^Spin \d+ times?, using \d+ /.test(b.getAttribute('aria-label') || ''); });
  /* 7. other screens' focus behavior is untouched: a first arrow press focuses the first main button */
  showMenu(); Nav.on = true; document.activeElement && document.activeElement.blur(); Nav.move(0, 1); out.menuFirst = !!document.activeElement && OV.contains(document.activeElement);
  if (view !== 'none'){ G.state = 'shop'; Nav.on = true; (pages[view] || pages.upgrades)(); var f = $('.gp[data-gh], .ttile:not(.locked), [data-buy], #wheelSpinBtn, [data-a^="ant-hire"]'); if (f) f.focus(); }
} catch (e) { out.errs.push('threw: ' + e.message + ' ' + (e.stack || '').split('\n')[1]); }
var need = ['reachAll', 'listSummary', 'listNumber', 'summaryClick', 'ringsUpgrades', 'ringsWheel', 'ringsAnts', 'ringsGear', 'gearFocus', 'gearKeep', 'gearClear', 'trinketFocus', 'trinketClear', 'focusStart', 'focusKept', 'spinGrey', 'spinBack', 'ariaUpg', 'ariaAnts', 'ariaWheel', 'menuFirst'];
out.pass = out.errs.length === 0 && need.every(function(k){ return out[k] === true; });
QA.done(out);
