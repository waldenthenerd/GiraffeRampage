/* Trinket UI (js/41b-trinket-page.js). Run: node tools/qa-cloud.mjs tools/scenarios/trinket-ui.js --wait 60000 [--shot x.png --w 390 --h 844 --scale 2 --params "show=pick|worn|none|locked|helmet"] */
GR.handleAction('splash-go');
var out = { errs: [] }; window.addEventListener('error', function(e){ out.errs.push(e.message); });
try {
  Save.data.gear = Save.data.gear || {}; Save.data.equippedTrinkets = [];
  var ids = Object.keys(TRINKETS); ids.forEach(function(id, i){ if (i % 3 !== 2) grantTrinket(id); });
  showShop('gear');
  out.tiles = document.querySelectorAll('.ttile').length; out.owned = document.querySelectorAll('.ttile:not(.locked)').length; out.locked = document.querySelectorAll('.ttile.locked').length;
  out.tilesOk = out.tiles === ids.length && out.locked === ids.filter(function(id){ return !trinketOwned(id); }).length;
  /* 1. the numbers are the game's: each chip total equals what recalcStats gives with it worn */
  recalcStats(); var base = P.stats.speedMul, baseXp = P.stats.xpMul;
  var solo = trinketStats(['burrowboots']); out.statsReal = Math.abs(solo.speedMul - (base + 0.06)) < 1e-9 && Math.abs(solo.xpMul - (baseXp + 0.06)) < 1e-9;
  var lime = trinketStats(['limehelmet']); out.limeCut = Math.abs(lime.dr - 0.07) < 1e-9;
  out.statsRestored = Save.data.equippedTrinkets.length === 0 && P.stats.speedMul === base;
  /* 2. tapping wears it in place (no page redraw), taps again to take it off */
  var grid0 = document.getElementById('trinketGrid'), hp0 = P.hp;
  GR.handleAction('trinket-tap-burrowboots');
  out.worn = trinketEquipped('burrowboots') && document.getElementById('trinketGrid') === grid0 && !!document.querySelector('.ttile.on[data-th="burrowboots"]');
  out.statsNow = Math.abs(P.stats.speedMul - (base + 0.06)) < 1e-9;
  out.panelWorn = /Worn/.test(document.getElementById('trinketSide').textContent) && /Move speed/.test(document.getElementById('trinketSide').textContent);
  out.count = /1 worn/.test(document.getElementById('trCount').textContent);
  GR.handleAction('trinket-tap-burrowboots'); out.off = !trinketEquipped('burrowboots') && !document.querySelector('.ttile.on');
  /* 3. pointing at one shows what wearing it would change, and changes nothing */
  trinketPage.sel = null; trinketPage.hover = 'echochime'; trinketSync(); var txt = document.getElementById('trinketSide').textContent;
  out.tryOn = /If you wear it/.test(txt) && /Reach/.test(txt) && /Crit chance/.test(txt);
  out.tryOnPure = Save.data.equippedTrinkets.length === 0 && P.stats.speedMul === base && P.hp === hp0;
  /* 4. a locked one shows where to find it, and cannot be worn */
  var lockedId = ids.filter(function(id){ return !trinketOwned(id); })[0]; trinketPage.hover = lockedId; trinketSync();
  out.lockedPanel = /Not found yet/.test(document.getElementById('trinketSide').textContent) && !/Tap to wear/.test(document.getElementById('trinketSide').textContent);
  GR.handleAction('trinket-tap-' + lockedId); out.lockedNoWear = !trinketEquipped(lockedId);
  /* 5. nothing picked: the total of what is worn; Red Rampage and the Lune carry their own note */
  trinketPage.hover = null; trinketPage.sel = null; grantTrinket('forgeheart'); grantTrinket('dustveil'); toggleTrinket('forgeheart'); toggleTrinket('dustveil'); trinketSync();
  var tot = document.getElementById('trinketSide').textContent; out.total = /Worn trinkets/.test(tot) && /Kick damage/.test(tot) && /Damage taken/.test(tot);
  grantTrinket('redrampage'); grantTrinket('peacefullune'); trinketPage.hover = 'peacefullune'; trinketSync(); out.lune = /Press T/.test(document.getElementById('trinketSide').textContent);
  trinketPage.hover = 'redrampage'; trinketSync(); out.rampage = /Gear effects/.test(document.getElementById('trinketSide').textContent);
  /* 6. the Lime Helmet shows on her in the picture while pointed at, and the real list is restored */
  grantTrinket('limehelmet'); Save.data.equippedTrinkets = []; trinketPage.hover = 'limehelmet'; out.shownList = JSON.stringify(trinketShownList()) === '["limehelmet"]';
  var cv = document.getElementById('gearPreview'); if (cv) gearPreviewDraw(cv, 1000); out.restored = Save.data.equippedTrinkets.length === 0;
  /* 7. an old save with trinkets still loads and shows the same worn list */
  Save.data.equippedTrinkets = ['lanternoil', 'echochime']; showShop('gear'); out.oldSave = document.querySelectorAll('.ttile.on').length === 2;
  /* 8. the pictures: params show=... */
  var sh = QA.params.show; trinketPage.hover = null; trinketPage.sel = null; Save.data.equippedTrinkets = ['lanternoil', 'echochime', 'forgeheart'];
  if (sh === 'pick'){ trinketPage.sel = 'echochime'; } else if (sh === 'locked'){ trinketPage.sel = lockedId; } else if (sh === 'helmet'){ Save.data.equippedTrinkets = []; trinketPage.hover = 'limehelmet'; }
  else if (sh === 'none'){ Save.data.equippedTrinkets = []; } else if (sh === 'sets'){ gearPage.view = 'sets'; }
  showShop('gear'); var hd = document.getElementById('trinketGrid'); if (hd) hd.scrollIntoView({ block: 'center' });
  out.pass = out.tilesOk && out.statsReal && out.limeCut && out.statsRestored && out.worn && out.statsNow && out.panelWorn && out.count && out.off && out.tryOn && out.tryOnPure && out.lockedPanel && out.lockedNoWear && out.total && out.lune && out.rampage && out.shownList && out.restored && out.oldSave && out.errs.length === 0;
} catch (e) { out.err = String(e && e.stack || e); }
QA.done(out);
