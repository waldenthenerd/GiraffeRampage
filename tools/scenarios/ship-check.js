/* ship-check: the browser half of lovable.md section 9, for the package that goes to Lovable (no developer panel). Run it against the built package:
   QA_ROOT=dist/pkg node tools/qa-cloud.mjs tools/scenarios/ship-check.js --wait 120000 */
(function(){
  var out = { errs: [] }; window.addEventListener('error', function(e){ out.errs.push(e.message); });
  try {
    out.noDevPanel = typeof clickDebugE === 'undefined' && typeof showDebugPanel === 'undefined' && typeof devBegin === 'undefined' && !document.getElementById('devRunBtn');
    out.grOk = typeof window.GR === 'object' && typeof GR.G.state === 'string' && !!GR.P && !!GR.Save;
    out.grsave = typeof window.GRSave === 'object' && GRSave.decode(GRSave.encode({ a: 1 })).a === 1;
    GR.handleAction('splash-go');
    out.menu = GR.G.state === 'menu';
    /* save round trip: the stored value is a packed JSON string literal */
    Save.data.gold = 4321; Save.write();
    var raw = localStorage.getItem('giraffe_rampage_save_v1'); out.packed = /^"GR2:/.test(raw);
    out.gr3 = GRSave.flush() === true && /^"GR3:/.test(localStorage.getItem('giraffe_rampage_save_v1'));     /* the repack to GR3 a few seconds after a write */
    Save.data.gold = 0; Save.load(); out.reload = Save.data.gold === 4321;
    /* an old plain-JSON save */
    localStorage.setItem('giraffe_rampage_save_v1', '{"gold":777}'); Save.load(); out.oldSave = Save.data.gold === 777;
    Save.write(); out.repacked = /^"GR2:/.test(localStorage.getItem('giraffe_rampage_save_v1'));
    /* a brand new save: the Guide says nothing about later chapters */
    localStorage.removeItem('giraffe_rampage_save_v1'); Save.load(); Save.data.gold = 0;
    GR.showHelp(); var guide = (document.getElementById('overlay') || {}).textContent || '';
    out.guideLen = guide.length; out.guideHits = (guide.match(/.{30}(Venus|Mars|ant colony|Underground Giraffe City|spaceplane|dust squad|lab).{30}/gi) || []).slice(0, 6);   /* lovable.md section 9, item 9: nothing about the late game */
    out.guideClean = guide.length > 200 && out.guideHits.length === 0;
    /* a run in each chapter starts and steps without errors; the town and the gear page open */
    var bad = [];
    [1, 4, 6, 9, 11, 13].forEach(function(ch){ try { GR.startRun(ch); GR.G.introFX = null; for (var i = 0; i < 40; i++){ GR.P.invuln = 99; GR.step(1 / 60); } } catch (e) { bad.push('ch' + ch + ': ' + e.message); } });
    out.runs = bad.length === 0; if (bad.length) out.bad = bad;
    GR.showMenu(); GR.G.state = 'menu'; grantGear(Object.keys(GEAR_INDEX)[0]); GR.showShop('gear'); out.gearPage = !!document.querySelector('.ttile') && !!document.getElementById('gearPreview');
    out.noPanelAction = (function(){ try { GR.handleAction('debug-addgold'); return true; } catch (e) { return false; } })() && !/Developer Panel/.test((document.getElementById('overlay') || {}).textContent || '');
    out.pass = out.noDevPanel && out.grOk && out.grsave && out.menu && out.packed && out.gr3 && out.reload && out.oldSave && out.repacked && out.guideClean && out.runs && out.gearPage && out.noPanelAction && out.errs.length === 0;
  } catch (e) { out.err = String(e && e.stack || e); }
  QA.done(out);
})();
