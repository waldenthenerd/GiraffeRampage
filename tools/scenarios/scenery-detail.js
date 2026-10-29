/* scenery-detail: the detail layer on the map objects (js/scenery/36o-scenery-detail.js).
   Every definition of every chapter lays out its small parts without an error (a few decals whose drawing has no solid shape are allowed to have none), the parts are a display list laid out once per
   object and then replayed, the drawing is not changed when the layer is switched off, and the cost of a full view of scenery is small: for seven chapters the view is drawn with the layer off and on and the
   difference must stay under 5 ms. Look at it with a screenshot of any chapter (QA-GUIDE: map-detail pictures). */
(function(){
  var out = { errs: [], ch: {} }; window.addEventListener('error', function(e){ out.errs.push(e.message); });
  GR.handleAction('splash-go'); Ach.check = function(){ return []; };
  try {
    Save.reset(); Save.data.chapter14Complete = true;
    var cv = document.createElement('canvas'); cv.width = 1280; cv.height = 720; var c = cv.getContext('2d');
    var first = { 1: 1, 3: 51, 4: 76, 7: 151, 9: 201, 12: 276, 14: 326 }, worst = 0, none = 0, total = 0, bad = [];
    Object.keys(first).forEach(function(ch){
      startRun(+ch, first[ch]); for (var i = 0; i < 5; i++) GR.step(1 / 30); P.invuln = 1e9; G.waveState = 'idle'; G.spawnQueue = []; G.enemies.length = 0; G.pendingLevels = 0; G.introFX = null;
      var best = null, bn = -1; SCEN.props.forEach(function(p, k){ if (k % 5) return; var n = 0; SCEN.props.forEach(function(q){ if (Math.abs(q.x - p.x) < 640 && Math.abs(q.y - p.y) < 360) n++; }); if (n > bn){ bn = n; best = p; } });
      var cx = best ? best.x : P.x, cy = best ? best.y : P.y;
      SD.off = false; for (var w = 0; w < 6; w++){ c.setTransform(1, 0, 0, 1, 640 - cx, 360 - cy); G.time += 0.3; drawScenery(c, cx, cy, 1280, 720); }      /* lays the parts out (a few ms a frame) */
      var bo = 1e9, bn2 = 1e9;
      for (var rep = 0; rep < 4; rep++){
        SD.off = true; var t0 = performance.now(); for (var k2 = 0; k2 < 6; k2++){ c.setTransform(1, 0, 0, 1, 640 - cx, 360 - cy); G.time += 0.05; drawScenery(c, cx, cy, 1280, 720); } bo = Math.min(bo, (performance.now() - t0) / 6);
        SD.off = false; t0 = performance.now(); for (k2 = 0; k2 < 6; k2++){ c.setTransform(1, 0, 0, 1, 640 - cx, 360 - cy); G.time += 0.05; drawScenery(c, cx, cy, 1280, 720); } bn2 = Math.min(bn2, (performance.now() - t0) / 6);
      }
      var lists = 0, nulls = 0; SCEN.props.concat(SCEN.decals).forEach(function(o){ if (o._sd === undefined) return; if (o._sd) lists++; else nulls++; });
      out.ch[ch] = { off: +bo.toFixed(2), on: +bn2.toFixed(2), plus: +(bn2 - bo).toFixed(2), objs: SCEN.props.length + SCEN.decals.length, lists: lists, nulls: nulls };
      worst = Math.max(worst, bn2 - bo); none += nulls; total += lists + nulls;
    });
    SD.off = false;
    out.worstPlus = +worst.toFixed(2);
    /* every definition lays out without an error */
    var seen = new Set(), errs = [], made = 0, all = 0;
    Object.keys(SCEN_DEFS).forEach(function(ch){ var d = SCEN_DEFS[ch]; if (seen.has(d)) return; seen.add(d); G.chapter = +ch;
      [['props', 'prop'], ['landmarks', 'landmark'], ['decals', 'decal'], ['terrain', 'zone']].forEach(function(kv){ (d[kv[0]] || []).forEach(function(o){
        var p = kv[1] === 'zone' ? { x: 0, y: 0, rx: 120, ry: 80, rot: 0, seed: 0.3, def: o } : { x: 0, y: 0, s: 1, rot: 0, seed: 0.3, def: o, r: o.r || 20 };
        all++; try { var ops = sdGen(o, kv[1], p); if (ops) made++; else if (kv[1] !== 'decal') errs.push(o.id + ' made nothing'); } catch (e) { errs.push(o.id + ': ' + e.message); } }); }); });
    out.defs = { all: all, made: made, errs: errs.slice(0, 6) };
    /* off: the drawing is exactly the original */
    startRun(1, 1); for (var s2 = 0; s2 < 3; s2++) GR.step(1 / 30);
    var p0 = SCEN.props[0], c1 = document.createElement('canvas'); c1.width = c1.height = 300; var x1 = c1.getContext('2d'), c2 = document.createElement('canvas'); c2.width = c2.height = 300; var x2 = c2.getContext('2d');
    SD.off = true; x1.setTransform(1, 0, 0, 1, 150, 150); p0.def.draw(x1, p0, 1); x2.setTransform(1, 0, 0, 1, 150, 150); p0.def._sdBase.call(p0.def, x2, p0, 1); SD.off = false;
    var d1 = x1.getImageData(0, 0, 300, 300).data, d2 = x2.getImageData(0, 0, 300, 300).data, same = true; for (var q = 0; q < d1.length; q++) if (d1[q] !== d2[q]){ same = false; break; }
    out.offSame = same;
  } catch (err){ out.err = String(err && err.stack || err); }
  out.pass = out.errs.length === 0 && !out.err && out.worstPlus < 5 && out.defs.errs.length === 0 && out.defs.made >= out.defs.all - 8 && out.offSame;
  QA.done(out);
})();
