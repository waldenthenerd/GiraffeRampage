/* Kick afterimages belong to the preview, even if opened during a run. */
GR.handleAction('splash-go');
(function(){
  Save.data = freshSave(); recalcStats();
  var out = { failed: [] }, check = function(k, v){ if (!v) out.failed.push(k); };
  Settings.fxLevel = 2; Settings.autoPerf = false;
  grantGear(Object.keys(GEAR_INDEX)[0]);                                        /* a new player sees the first-steps card instead of the doll */
  showShop('gear');
  var cv = document.getElementById('gearPreview'), live = [{ x: 9000, y: 8000, f: 1, age: 0.1 }];
  GF.trail = live; GF.trailT = 0.123;
  var before = JSON.stringify(live), dp = drawPlayer, seen = 0, isolated = true, changed = 0;
  drawPlayer = function(c){
    isolated = isolated && GF.trail !== live;
    seen = Math.max(seen, GF.trail.length);
    var trail = GF.trail, saved = document.createElement('canvas'); saved.width = cv.width; saved.height = cv.height;
    saved.getContext('2d').drawImage(cv, 0, 0);
    dp(c);
    if (trail.length){
      var withTrail = c.getImageData(0, 0, cv.width, cv.height).data;
      c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, cv.width, cv.height); c.drawImage(saved, 0, 0); c.restore();
      GF.trail = []; dp(c); GF.trail = trail;
      var without = c.getImageData(0, 0, cv.width, cv.height).data;
      for (var j = 0; j < withTrail.length; j += 4) if (withTrail[j] !== without[j] || withTrail[j+1] !== without[j+1] || withTrail[j+2] !== without[j+2]) changed++;
      c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, cv.width, cv.height); c.drawImage(saved, 0, 0); c.restore(); dp(c);
    }
  };
  gearPreview.last = 1000;
  GR.handleAction('gear-demo-kick'); check('Kick button starts animation', gearPreview.kickT >= 0);
  try { for (var i = 1; i <= 5; i++) gearPreviewDraw(cv, 1000 + i * 20); }
  finally { drawPlayer = dp; }
  check('preview trail created', seen > 0); check('own array', isolated);
  check('trail pixels', changed > 0);
  check('live array and entries untouched', GF.trail === live && JSON.stringify(live) === before && GF.trailT === 0.123);
  drawPlayer = function(){ throw new Error('test draw failure'); };
  try { gearPreviewDraw(cv, 1120); } catch (e) { check('expected failure', e.message === 'test draw failure'); } finally { drawPlayer = dp; }
  check('restored after throw', GF.trail === live && JSON.stringify(live) === before && GF.trailT === 0.123);
  cv.width = cv.width; gearPreview.kickT = 0.06; gearPreview.last = 1200; gearPreviewDraw(cv, 1220);
  out.seen = seen; out.changedPixels = changed; out.pass = !out.failed.length; QA.done(out);
})();
