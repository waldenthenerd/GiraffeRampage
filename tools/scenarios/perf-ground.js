/* perf-ground: the ground and scenery tiles (js/44ca-ground-cache.js). At full effects the ground is live; at Medium or after the governor's first step
   it comes from tiles, with far fewer canvas calls, for every biome, and a change of world makes new tiles. Run: node tools/qa-cloud.mjs tools/scenarios/perf-ground.js --wait 240000 */
(function(){
  GR.handleAction('splash-go');
  var out = { errs: [], rows: {} }; window.addEventListener('error', function(e){ out.errs.push(e.message); });
  var proto = CanvasRenderingContext2D.prototype, n = 0;
  ['fill', 'stroke', 'fillRect', 'strokeRect', 'drawImage'].forEach(function(k){ var o = proto[k]; proto[k] = function(){ n++; return o.apply(this, arguments); }; });
  Settings.autoPerf = false;                                       /* the governor would change the level under the test */
  var fx = 2; window.fxLevelNow = function(){ return fx; };
  function calls(){ GR.step(1 / 60); n = 0; for (var i = 0; i < 10; i++){ P.invuln = 99; GR.step(1 / 60); } return Math.round(n / 10); }
  var ok = true, sumL = 0, sumT = 0;
  [1, 3, 5, 6, 9, 12, 13].forEach(function(ch){
    GR.startRun(ch); G.introFX = null; G.enemies.length = 0;
    for (var i = 0; i < 40; i++){ P.invuln = 99; GR.step(1 / 60); }
    G.enemies.length = 0; fx = 2; var b0 = GroundCache.builds, live = calls(), noTiles = GroundCache.builds === b0;
    fx = 1; for (i = 0; i < 12; i++) GR.step(1 / 60); G.enemies.length = 0;
    var h0 = GroundCache.hits, s0 = SceneryCache.hits, tiled = calls(), used = GroundCache.hits > h0 && SceneryCache.hits > s0;
    out.rows['ch' + ch] = { live: live, tiled: tiled, noTilesAtFull: noTiles, tilesUsed: used };
    if (!noTiles || !used || tiled > live * 1.1) ok = false;          /* flat grounds gain little; none may get worse by more than noise */
    sumL += live; sumT += tiled;
  });
  /* a new run makes new tiles: the old ones are never shown for it */
  fx = 1; GR.startRun(1); G.introFX = null; for (var i = 0; i < 15; i++) GR.step(1 / 60); var sigA = groundCacheSig();
  GR.startRun(5); G.introFX = null; for (i = 0; i < 15; i++) GR.step(1 / 60); out.sigChanges = sigA !== groundCacheSig();
  /* the same chapter again is a new world (new positions, same counts): it must not reuse the old tiles */
  var gB = groundCacheSig(), sB = sceneryCacheSig(); GR.startRun(5); G.introFX = null; for (i = 0; i < 15; i++) GR.step(1 / 60);
  out.newWorldNewTiles = gB !== groundCacheSig() && sB !== sceneryCacheSig();
  /* what moves is kept out of the scenery tiles: ferns sway, rocks do not */
  var fern = SCEN.props.filter(function(p){ return p.def.id === 'jg_fern'; })[0], rock = SCEN.props.filter(function(p){ return p.def.id !== 'jg_fern'; })[0];
  out.fernMoves = !fern || sceneryStill('prop', fern) === false;
  out.someStill = !!rock && SCEN.props.some(function(p){ return sceneryStill('prop', p); });
  out.tilesCapped = GroundCache.map.size <= GroundCache.max && SceneryCache.map.size <= SceneryCache.max;
  out.sumLive = sumL; out.sumTiled = sumT;
  out.pass = ok && sumT < sumL * 0.85 && out.sigChanges && out.newWorldNewTiles && out.fernMoves && out.someStill && out.tilesCapped && out.errs.length === 0;
  QA.done(out);
})();
