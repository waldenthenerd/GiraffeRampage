/* perf-calls: canvas 2D calls per frame, by render stage (hardware independent, so it carries over to slow devices).
   params: ch (chapter), n (frames), gear=1 (equip a mythical loadout first), menu=1 (measure the menu/attract instead) */
(function(){
  var ch = +(QA.params.ch || 1), N = +(QA.params.n || 240);
  var proto = CanvasRenderingContext2D.prototype, cnt = { total: 0 }, stage = 'other', byStage = {}, shadow = 0, fillArea = 0;
  Object.getOwnPropertyNames(proto).forEach(function(k){
    var d = Object.getOwnPropertyDescriptor(proto, k);
    if (typeof d.value !== 'function' || /^(save|restore|translate|rotate|scale|setTransform|transform|resetTransform|beginPath|closePath|moveTo|lineTo|quadraticCurveTo|bezierCurveTo|arc|arcTo|ellipse|rect|roundRect|setLineDash|getLineDash|addColorStop|clip|measureText|createRadialGradient|createLinearGradient|createPattern|getContextAttributes|isPointInPath|drawFocusIfNeeded)$/.test(k) && !/^(fill|stroke|fillRect|strokeRect|clearRect|drawImage|fillText|strokeText|putImageData|getImageData)$/.test(k)) return;
    var orig = d.value;
    /* count the calls that actually put pixels down or read them back; path building is noise */
    if (/^(fill|stroke|fillRect|strokeRect|clearRect|drawImage|fillText|strokeText|putImageData|getImageData|createRadialGradient|createLinearGradient|createPattern|clip|measureText)$/.test(k))
      proto[k] = function(){ cnt.total++; byStage[stage] = (byStage[stage] || 0) + 1; if (k === 'getImageData') byStage.__getImageData = (byStage.__getImageData || 0) + 1; if (this.shadowBlur > 0){ shadow++; var m = (new Error().stack.split('\n')[2] || '').match(/([\w-]+\.js:\d+)/); var key = '@' + (m ? m[1] : '?'); byStage[key] = (byStage[key] || 0) + 1; } return orig.apply(this, arguments); };
  });
  var STAGES = ['drawGround', 'drawGroundJungle', 'drawScenery', 'drawForeground', 'drawParticles', 'drawPlayer', 'drawEnemy', 'drawNight', 'drawDecals', 'drawHUDFx', 'updateHUD', 'drawGearFx', 'drawScreenFX', 'drawTexts', 'drawWeather', 'drawLighting'];
  STAGES.concat(Object.keys(window).filter(function(k){ return /^(draw|render)[A-Z]/.test(k) && typeof window[k] === 'function'; })).filter(function(v, i, a){ return a.indexOf(v) === i; }).forEach(function(nm){
    var f = window[nm]; if (typeof f !== 'function' || f._pc) return;
    var w = function(){ var prev = stage; stage = nm; try { return f.apply(this, arguments); } finally { stage = prev; } }; w._pc = 1;
    try { window[nm] = w; } catch (e) {}
  });
  if (QA.params.fx){ var _fx = +QA.params.fx; window.fxLevelNow = function(){ return _fx; }; }
  if (QA.params.nocache) window.groundCacheOn = function(){ return false; };
  GR.handleAction('splash-go');
  if (QA.params.menu){ for (var i = 0; i < 30; i++) GR.step(1/60); byStage = {}; cnt.total = 0; shadow = 0; for (i = 0; i < N; i++) GR.step(1/60); }
  else {
    if (QA.params.gear){ Save.data.equipped = { cape: null, weapon: null, armor: null }; Save.data.gear = Save.data.gear || {}; Save.data.gearLv = {};
      ['worldspire:cape', 'worldspire:weapon', 'worldspire:armor'].forEach(function(id){ grantGear(id); Save.data.gearLv[id] = 5; Save.data.equipped[GEAR_INDEX[id].slot] = id; }); recalcStats && recalcStats(); }
    GR.startRun(ch); G.introFX = null;
    for (var i = 0; i < 150; i++){ P.invuln = 99; P.hp = P.maxHp; if (G.state === 'levelup') G.state = 'playing'; GR.step(1/60); }
    byStage = {}; cnt.total = 0; shadow = 0;
    for (i = 0; i < N; i++){ P.invuln = 99; P.hp = P.maxHp; if (G.state === 'levelup') G.state = 'playing'; GR.step(1/60); }
  }
  var rows = Object.keys(byStage).map(function(k){ return [k, Math.round(byStage[k] / N)]; }).sort(function(a, b){ return b[1] - a[1]; }).slice(0, 40);
  QA.done({ gc: typeof GroundCache !== 'undefined' ? { builds: GroundCache.builds, hits: GroundCache.hits, live: GroundCache.live, tiles: GroundCache.map.size, sbuilds: SceneryCache.builds, shits: SceneryCache.hits, slive: SceneryCache.live } : null, callsPerFrame: Math.round(cnt.total / N), shadowCallsPerFrame: Math.round(shadow / N), enemies: G.enemies && G.enemies.length, state: G.state, top: rows.map(function(r){ return r[0] + '=' + r[1]; }) });
})();
