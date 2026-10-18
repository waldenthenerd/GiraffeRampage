/* The Gear page's side panel is a fixed-size scroll window: pointing at gear never makes the page grow or shift. Run: node tools/qa-cloud.mjs tools/scenarios/gear-side.js --wait 30000 [--shot x.png --params "show=long"] [--w 390 --h 844] */
GR.handleAction('splash-go');
(function(){
var out = { errs: [] }; window.addEventListener('error', function(e){ out.errs.push(e.message); });
try {
  Save.data.gear = {}; Save.data.gearLv = {}; Save.data.equipped = { cape: null, weapon: null, armor: null }; Save.data.gems = 500;
  ['herdhide:cape', 'herdhide:armor', 'herdhide:weapon', 'sunforged:armor', 'worldspire:weapon', 'worldspire:armor', 'stoneplate:armor'].forEach(function(id){ grantGear(id); });
  Save.data.gearLv['worldspire:armor'] = 4; equipGear('herdhide:cape'); equipGear('herdhide:armor'); recalcStats();
  gearPage.view = 'doll'; gearPage.slot = 'armor'; gearPage.selected = null; gearPage.hover = null; showShop('gear');
  var side = document.getElementById('gearSide'), pick = document.querySelector('.gpick'), box = function(n){ return Math.round(n.getBoundingClientRect().height); };
  var h0 = box(side), top0 = Math.round(pick.getBoundingClientRect().top), docH0 = document.getElementById('overlay').scrollHeight;
  var heights = [h0], tops = [top0];
  ['sunforged:armor', 'worldspire:armor', 'stoneplate:armor', 'herdhide:armor', null].forEach(function(id){
    gearPage.hover = id; gearSyncSelection(); heights.push(box(document.getElementById('gearSide'))); tops.push(Math.round(document.querySelector('.gpick').getBoundingClientRect().top)); });
  out.heights = heights; out.tops = tops;
  out.sameHeight = heights.every(function(h){ return Math.abs(h - h0) <= 1; });
  out.noShift = tops.every(function(t){ return Math.abs(t - top0) <= 1; }) && document.getElementById('overlay').scrollHeight === docH0;
  /* a long panel scrolls inside its window */
  gearPage.hover = 'worldspire:armor'; gearSyncSelection();
  var inner = document.querySelector('#gearSide .gcmp'); var cs = getComputedStyle(inner);
  out.scrolls = (cs.overflowY === 'auto' || cs.overflowY === 'scroll') && inner.scrollHeight > inner.clientHeight && inner.getBoundingClientRect().height <= box(side) + 1;
  gearSideFlags(); out.fadeOn = side.classList.contains('more') || document.getElementById('gearSide').classList.contains('more');
  inner.scrollTop = 40; out.scrolled = inner.scrollTop > 0;
  inner.scrollTop = inner.scrollHeight; inner.dispatchEvent(new Event('scroll')); gearSideFlags(); out.fadeOff = !document.getElementById('gearSide').classList.contains('more'); inner.scrollTop = 40; gearSideFlags();
  /* the pointer can move onto the panel (to scroll it, or press Equip) without it disappearing */
  var eq = document.querySelector('#gearSide [data-equip]'); gearPage.hover = 'worldspire:armor'; gearSyncSelection(); eq = document.querySelector('#gearSide [data-equip]');
  (eq || inner).dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));
  out.keepsHover = gearPage.hover === 'worldspire:armor' && !!document.querySelector('#gearSide .gcmp');
  document.querySelector('.gview').dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));
  out.graceFirst = gearPage.hover === 'worldspire:armor' && gearPage.clearT > 0;           /* not cleared at once: a moment to reach the panel */
  (eq || inner).dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));            /* arriving on the panel cancels the clearing */
  out.staysOnPanel = gearPage.clearT === 0 && gearPage.hover === 'worldspire:armor';
  document.querySelector('.gview').dispatchEvent(new MouseEvent('mouseover', { bubbles: true })); var tid = gearPage.clearT; clearTimeout(tid); gearHoverClear();      /* leaving for good: the grace period runs out */
  out.clearsAway = gearPage.hover === null && !!document.querySelector('#gearSide .gbuild');
  out.fadeBuild = !document.getElementById('gearSide').classList.contains('more');
  out.buildFits = Math.round(document.getElementById('gearSide').getBoundingClientRect().height) === h0;
  /* the build panel fits too, and a very short panel is not stretched ugly */
  if (QA.params.show === 'long'){ gearPage.hover = 'worldspire:armor'; gearSyncSelection(); }
} catch (e) { out.errs.push('threw: ' + e.message + ' ' + (e.stack || '').split('\n')[1]); }
var keys = ['sameHeight', 'noShift', 'scrolls', 'scrolled', 'keepsHover', 'graceFirst', 'staysOnPanel', 'clearsAway', 'buildFits', 'fadeOn', 'fadeOff', 'fadeBuild'];
out.failed = keys.filter(function(k){ return !out[k]; }); out.pass = !out.failed.length && !out.errs.length;
QA.done(out);
})();
