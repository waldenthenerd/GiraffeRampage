/* perf-gearpage: cost of opening the Gear tab cold (icons), warm, and one preview frame. */
(function(){
  GR.handleAction('splash-go');
  Save.data.gear = Save.data.gear || {}; Object.keys(GEAR_INDEX).forEach(function(id){ grantGear(id); });
  var out = {};
  var t = performance.now(); gearIconInvalidate(); gearIcon._draws = 0;
  GR.handleAction('open-shop'); try { showShop('gear'); } catch (e) { out.err = e.message; }
  out.coldOpenMs = Math.round(performance.now() - t); out.iconDraws = gearIcon._draws;
  t = performance.now(); showShop('gear'); out.warmOpenMs = Math.round(performance.now() - t);
  var cv = document.getElementById('gearPreview'); var fr = [];
  if (cv){ for (var i = 0; i < 40; i++){ var a = performance.now(); gearPreviewDraw(cv, 1000 + i * 33); fr.push(performance.now() - a); } fr.sort(function(x, y){ return x - y; }); out.previewMedMs = +fr[20].toFixed(2); out.previewMaxMs = +fr[39].toFixed(1); }
  out.animEls = document.querySelectorAll('.gp.mythical:not(.locked)').length;
  QA.done(out);
})();
