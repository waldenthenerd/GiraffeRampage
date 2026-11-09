/* Add-ons (js/core/10b-addons.js, js/ui/44zzzzn-addons-page.js): the registry, the switches, the save field, the page, the HUD tag and the run-report line.
   The scenario registers its own throwaway add-ons, so it works whether or not the game ships any.
   Run: node tools/qa-cloud.mjs tools/scenarios/addons.js --wait 60000 [--shot x.png --params "view=page|empty|pause|hud"] */
GR.handleAction('splash-go');
var out = { errs: [] }; window.addEventListener('error', function(e){ out.errs.push(e.message); });
function $(s){ return document.querySelector(s); } function $$(s){ return [].slice.call(document.querySelectorAll(s)); }
try {
  var view = (QA.params && QA.params.view) || 'none';
  out.shipped = ADDONS.map(function(a){ return a.id; });
  /* 1. with no add-ons the page says so, and "Turn all off" is grey */
  var keep = ADDONS.splice(0, ADDONS.length); addonsSync();
  showMenu(); out.menuButton = !!$('[data-a="addons"]') && /Optional/.test($('[data-a="addons"]').textContent);
  showAddons(); out.emptyPage = !!$('.addonempty') && $('[data-a="addons-alloff"]').disabled && $$('.addonrow').length === 0;
  if (view === 'empty'){ QA.done(out); throw 'stop'; }
  keep.forEach(function(a){ ADDONS.push(a); }); addonsSync();
  /* 2. registering: bad ids and twice-registered ids are refused */
  var hooks = { on: 0, off: 0 };
  addonRegister({ id: 'qaon', name: 'QA Switch', tag: 'silly', desc: 'A test add-on that changes a number.', on: function(){ hooks.on++; }, off: function(){ hooks.off++; } });
  addonRegister({ id: 'qarun', name: 'QA Between Runs', tag: 'experimental', when: 'between-runs', desc: 'Only switches from the menu.' });
  addonRegister({ id: 'qalock', name: 'QA Locked', tag: 'extra', needs: function(){ return false; }, lock: 'never', desc: 'Never unlocks.' });
  addonRegister({ id: 'qadev', name: 'QA Developer', dev: true, desc: 'Only for developers.' });
  var bad = 0; ['Bad Id', 'qaon', '', 'x'.repeat(25)].forEach(function(id){ try { addonRegister({ id: id }); } catch (e) { bad++; } });
  out.refused = bad === 4;
  out.devShown = addonsList().some(function(a){ return a.id === 'qadev'; }) === addonsShowDev();
  out.allOffAtStart = !addonOn('qaon') && !addonOn('qarun') && !addonOn('qalock');
  /* 3. the wrapper pattern: off is the original, on is the add-on, and switching ten times leaves it as it was */
  window.qaThing = function(x){ return x + 1; };
  (function(){ var base = qaThing; qaThing = function(x){ if (!addonOn('qaon')) return base.apply(this, arguments); return x + 100; }; })();
  var seq = []; for (var i = 0; i < 10; i++){ addonSet('qaon', i % 2 === 0); seq.push(qaThing(1)); }
  out.wrapper = seq.join(',') === '101,2,101,2,101,2,101,2,101,2' && hooks.on === 5 && hooks.off === 5;
  /* 4. a locked add-on cannot be switched on */
  out.locked = addonSet('qalock', true) === false && !addonOn('qalock');
  /* 5. the page: a row for each, the switch works from a click, the locked one is grey */
  showAddons(); var rows = $$('.addonrow');
  out.pageRows = rows.length === addonsList().length && !!$('[data-a="addon-t-qalock"]').disabled && /Locked/.test($('[data-a="addon-t-qalock"]').textContent);
  $('[data-a="addon-t-qaon"]').click(); out.pageClick = addonOn('qaon') && $('[data-a="addon-t-qaon"]').textContent === 'On' && !$('[data-a="addons-alloff"]').disabled;
  showMenu(); out.menuCount = /1 of \d+ on/.test($('[data-a="addons"]').textContent);
  /* 6. the save: the choice is written, read back, kept on erase; unknown ids are kept and bad entries dropped */
  Save.write(); Save.data.addons = {}; addonsSync(); Save.load(); out.saveRound = Save.data.addons.qaon === 1 && addonOn('qaon');
  var raw = Save.data; raw.addons = { qaon: 1, zzfuture: 1, 'BAD!': 1, qarun: 2, qalock: 0 }; Save.write(); Save.load();
  out.saveClean = Save.data.addons.zzfuture === 1 && Save.data.addons['BAD!'] === undefined && Save.data.addons.qarun === undefined && Save.data.addons.qalock === 0;
  Save.data.gold = 777; Save.reset(); out.eraseKeeps = Save.data.addons.qaon === 1 && Save.data.addons.zzfuture === 1 && Save.data.gold === 0 && addonOn('qaon');
  Save.data.addons = { qaon: 1 }; addonsSync();
  /* 7. an old save with no add-ons field loads with everything off */
  var old = JSON.parse(JSON.stringify(Save.data)); delete old.addons; localStorage.setItem(SAVE_KEY, JSON.stringify(old)); Save.load();
  out.oldSave = typeof Save.data.addons === 'object' && Object.keys(Save.data.addons).length === 0 && !addonOn('qaon');
  addonSet('qaon', true);
  /* 8. in a run: the HUD tag, the between-runs add-on waits, the pause menu has the button, and the run report names the add-on */
  GR.startRun(1); G.introFX = null; for (var s = 0; s < 20; s++) GR.step(1 / 60);
  updateHUD(); out.hudTag = $('#hAddons').textContent === '+1 ADD-ON';
  out.waitsForRun = addonSet('qarun', true) === false && !addonOn('qarun');
  showPause(); out.pauseButton = !!$('[data-a="addons"]');
  GR.handleAction('addons'); out.pausePage = G.state === 'paused' && G.subScreen === 'addons' && !!$('[data-a="addon-t-qarun"]').disabled && /after this run/.test($('[data-a="addon-t-qarun"]').closest('.addonrow').textContent);
  GR.handleAction('addons-back'); out.backToPause = G.state === 'paused' && !!$('[data-a="resume"]');
  var rep = runReport(0, 0); out.reportNames = !!rep.addons && rep.addons.indexOf('QA Switch') >= 0;
  out.reportLine = /Add-ons on: <b>QA Switch<\/b>/.test(runReportHTML({ report: rep }, true));
  addonSet('qaon', false); updateHUD(); out.hudOff = $('#hAddons').textContent === '' && !runReport(0, 0).addons;
  if (view === 'hud' || view === 'pause'){ addonSet('qaon', true); G.state = 'playing'; hideOverlay(); for (var t = 0; t < 30; t++) GR.step(1 / 60); updateHUD(); if (view === 'pause'){ showPause(); GR.handleAction('addons'); } QA.done(out); throw 'stop'; }
  /* 9. "Turn all off" */
  GR.handleAction('quit'); G.state = 'menu'; addonSet('qaon', true); addonSet('qarun', true); showAddons(); $('[data-a="addons-alloff"]').click();
  out.allOff = addonsActive().length === 0 && !!$('[data-a="addons-alloff"]').disabled;
  if (view === 'page'){ addonSet('qaon', true); showMenu(); GR.handleAction('addons'); }
} catch (e) { if (e !== 'stop') out.errs.push('threw: ' + e.message + ' ' + (e.stack || '').split('\n')[1]); }
if (view === 'none' || view === 'page'){
  var need = ['menuButton', 'emptyPage', 'refused', 'devShown', 'allOffAtStart', 'wrapper', 'locked', 'pageRows', 'pageClick', 'menuCount', 'saveRound', 'saveClean', 'eraseKeeps', 'oldSave', 'hudTag', 'waitsForRun', 'pauseButton', 'pausePage', 'backToPause', 'reportNames', 'reportLine', 'hudOff', 'allOff'];
  out.failed = need.filter(function(k){ return out[k] !== true; });
  out.pass = out.errs.length === 0 && out.failed.length === 0;
  QA.done(out);
}
