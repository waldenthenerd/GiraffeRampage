/* sea-chart: the sea chart fills in around the boat. Water is charted out to 3 cells (100 each) in clear weather, but land (sand, grass, forest, rock) out to 7, because she cannot
   sail onto a shore (5 in a storm and 3 in fog, as water goes 2 and 1). Water beyond the water's range stays dark. */
(function(){
  var out = { errs: [] }; window.addEventListener('error', function(e){ out.errs.push(e.message + ' @' + (e.filename || '').split('/').pop() + ':' + e.lineno); });
  GR.handleAction('splash-go'); Ach.check = function(){ return []; };
  try {
    var sd = seaData(); sd.own.skiff = 1; sd.sel = 'skiff'; sd.map = ''; G.state = 'menu'; seaStart('harbour'); GR.step(1 / 60);
    function cell(x, y){ return Math.floor(x / SEA_MAP_C) + Math.floor(y / SEA_MAP_C) * SEA_MAP_N; }
    /* a spot of water with land exactly 5 to 7 cells away, and water just as far in the other direction */
    var found = null;
    for (var y = 400; y < SEA_W - 400 && !found; y += 100) for (var x = 400; x < SEA_W - 400 && !found; x += 100){
      if (seaTypeAt(x, y) !== SEA_WATER && seaTypeAt(x, y) !== SEA_SHALLOW && seaTypeAt(x, y) !== SEA_DEEP) continue;
      for (var k = 5; k <= 7; k++){ var t = seaTypeAt(x + k * 100 + 50, y); var w2 = seaTypeAt(x - k * 100 - 50, y); if (t >= SEA_SAND && t <= SEA_ROCK && (w2 === SEA_WATER || w2 === SEA_DEEP || w2 === SEA_SHALLOW)){ found = { x: x, y: y, k: k }; break; } }
    }
    out.spot = !!found;
    if (found){
      Town.fixWeather = 'clear'; Sea.x = found.x + 50; Sea.y = found.y + 50; Sea.seen.fill(0); Sea.seenN = 0; seaMapReveal();
      var lx = found.x + 50 + found.k * 100, ly = found.y + 50;
      out.landFar = !!Sea.seen[cell(lx, ly)];                         /* land 5 to 7 cells away is charted */
      out.waterNear = !!Sea.seen[cell(found.x + 150, found.y + 50)] || !!Sea.seen[cell(found.x - 100, found.y + 50)];
      out.waterFarDark = !Sea.seen[cell(found.x + 50 - found.k * 100, found.y + 50)];   /* water that far away is not */
      Town.fixWeather = 'fog'; Sea.seen.fill(0); seaMapReveal(); out.fogShort = !Sea.seen[cell(lx, ly)];
    } else { out.landFar = out.waterNear = out.waterFarDark = out.fogShort = false; }
  } catch (e) { out.errs.push('threw: ' + e.message + ' ' + (e.stack || '').split('\n').slice(0, 3).join(' | ')); }
  var need = ['spot', 'landFar', 'waterNear', 'waterFarDark', 'fogShort'];
  out.failed = need.filter(function(k){ return out[k] !== true; });
  out.pass = out.errs.length === 0 && out.failed.length === 0;
  QA.done(out);
})();
