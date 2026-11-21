/* render-speed: the changes that make the game cheaper to draw where the canvas is drawn by the CPU (Firefox on Linux, found with a Firefox profile): the giraffe's rim blur is kept to her
   outline, the colour grade uses hard-light at 0.37 strength instead of soft-light, the ground tiles are copied unscaled onto whole pixels and live in CPU memory, the dark screen edge is a cached bitmap, the cloud and fog sprites, the light sprites and the ground patches live in CPU memory, the slow-device governor also
   watches the menu and moves two steps when frames are very slow, and Settings has a Sharpness choice (Auto, 75%, 50%) that is saved and loaded like the other settings.
   Run: node tools/qa-cloud.mjs tools/scenarios/render-speed.js --wait 90000 [--w 1280 --h 720 --scale 1] [--touch --w 390 --h 844] */
GR.handleAction('splash-go'); Ach.check = function(){ return []; };
var out = { errs: [] }; window.addEventListener('error', function(e){ out.errs.push(e.message); });
function steps(n){ for (var i = 0; i < n; i++) GR.step(1 / 30); }
try {
  Settings.autoPerf = false; Perf.reset();                      /* the governor would lower the effects on a slow machine and switch the rim off */
  /* 1. the rim: while she is drawn on a world with a strong rim, only a handful of fills and strokes carry the blur */
  GR.startRun(10); G.introFX = null; steps(60);
  var proto = CanvasRenderingContext2D.prototype, blurred = 0, counting = false, saved = {};
  ['fill', 'stroke'].forEach(function(k){ saved[k] = proto[k]; proto[k] = function(){ if (counting && this.shadowBlur > 0) blurred++; return saved[k].apply(this, arguments); }; });
  var most = 0, dp = drawPlayer; drawPlayer = function(){ counting = true; blurred = 0; try { return dp.apply(this, arguments); } finally { counting = false; most = Math.max(most, blurred); } };
  GR.step(1 / 60); GR.render();                 /* GR.render always draws, even when CI draws only some frames */
  out.rimBlurred = most;                                       /* per drawing of her */
  out.rimKept = most >= 4;                                     /* her outline still gets it */
  out.rimFew = most <= 12;                                     /* was 30 or so: hooves, tail ball, armor, cape, mane, ears and every spot each blurred their own */
  drawPlayer = dp; ['fill', 'stroke'].forEach(function(k){ proto[k] = saved[k]; });

  /* 2. the grade: no soft-light is laid over the frame, hard-light is */
  var ops = {}, ds = Object.getOwnPropertyDescriptor(proto, 'globalCompositeOperation');
  Object.defineProperty(proto, 'globalCompositeOperation', { configurable: true, get: function(){ return ds.get.call(this); }, set: function(v){ ops[v] = (ops[v] || 0) + 1; ds.set.call(this, v); } });
  GR.step(1 / 60); GR.render();                 /* GR.render always draws, even when CI draws only some frames */
  Object.defineProperty(proto, 'globalCompositeOperation', ds);
  out.gradeOps = ops;
  out.noSoftLight = !ops['soft-light'];
  out.hardLight = (ops['hard-light'] | 0) >= 1;
  out.gradeConst = GRADE_OP === 'hard-light' && GRADE_K === 0.37;

  /* 3. the ground tiles: kept in memory the CPU can read, and drawn without smoothing */
  GR.handleAction('menu'); try { showMenu(); } catch (e) {}
  for (var i = 0; i < 40 && !GroundCache.map.size; i++) steps(5);
  steps(20);
  var tile = GroundCache.map.size ? GroundCache.map.values().next().value : null;
  var att = tile && tile.getContext('2d').getContextAttributes ? tile.getContext('2d').getContextAttributes() : null;
  out.tilesMade = !!tile;
  out.tilesCpu = !!(att && att.willReadFrequently === true);
  var blits = [], di = proto.drawImage;
  proto.drawImage = function(src){
    if (src && src.width >= 300 && src.width === src.height && this.canvas && this.canvas.id === 'stage'){ var m = this.getTransform(); blits.push({ n: arguments.length, id: m.a === 1 && m.d === 1 && m.b === 0 && m.c === 0, x: arguments[1], y: arguments[2] }); }
    return di.apply(this, arguments);
  };
  steps(6); GR.render(); proto.drawImage = di;
  out.tileBlits = blits.length;
  out.tilesUnscaled = blits.length > 0 && blits.every(function(b){ return b.n === 3 && b.id && b.x === Math.round(b.x) && b.y === Math.round(b.y); });   /* whole pixels, no scaling: nothing for the browser to smooth */

  /* 3b. the dark screen edge is a bitmap the size of the canvas, copied 1:1, and looks like the gradient it came from; the cloud and fog sprites, the light sprites and the ground patches live in CPU memory */
  var vcopies = 0; proto.drawImage = function(src){ if (src === vigCv && this.canvas && this.canvas.id === 'stage') vcopies++; return di.apply(this, arguments); };
  GR.render(); proto.drawImage = di;
  out.vignetteCopied = vcopies === 1 && !!vigCv && vigCv.width === stage.width && vigCv.height === stage.height;
  var vd = vigCv.getContext('2d').getImageData(0, 0, vigCv.width, vigCv.height).data, cx = (vigCv.width >> 1), cy = (vigCv.height >> 1);
  out.vignetteShape = vd[(cy * vigCv.width + cx) * 4 + 3] < 4 && vd[3] > 90 && vd[3] < 125;           /* clear in the middle, about .42 of 255 at the corner */
  var cpu = function(cv){ return !!cv && cv.getContext('2d').getContextAttributes().willReadFrequently === true; };
  out.spritesCpu = cpu(fogSprite([10, 20, 30])) && cpu(lightSprite([200, 150, 90]));
  var pat = SCEN.patches.length ? SCEN.patches[0].spr : null;
  out.cachesCpu = !pat || cpu(pat);                                   /* the ground patches too: drawn onto the screen again and again and never changed, so kept where the CPU can read them */

  /* 4. the governor: it counts the menu, decides sooner when frames are slow, and steps two at a time when they are very slow */
  var saveState = G.state, saveAtt = G.attract; Settings.autoPerf = true;
  Perf.reset(); Perf.sinceChange = 99; G.state = 'menu'; G.attract = true;
  for (i = 0; i < 29; i++) Perf.cost(50, 1 / 30);
  out.noEarlyStep = Perf.idx === 0;                            /* 29 frames of 50 ms are not yet a second and a half of work */
  Perf.cost(50, 1 / 30);
  out.menuTwoSteps = Perf.idx === 2;
  out.menuScaled = Perf.scale < 1 && G.dpr <= Math.min(window.devicePixelRatio || 1, 2) * 0.7 + 1e-6;
  Perf.reset(); Perf.sinceChange = 99;
  for (i = 0; i < 120; i++) Perf.cost(5, 1 / 30);
  out.cheapStays = Perf.idx === 0;
  Perf.reset(); Perf.sinceChange = 99; G.state = 'shop';
  for (i = 0; i < 120; i++) Perf.cost(60, 1 / 30);
  out.shopNotCounted = Perf.idx === 0;
  Perf.reset(); Perf.sinceChange = 99; G.state = 'menu';
  for (i = 0; i < 90; i++) Perf.cost(25, 1 / 30);
  out.slowOneStep = Perf.idx === 1;                            /* just over the line: one step, as before */
  Perf.reset(); G.state = saveState; G.attract = saveAtt;

  /* 5. Settings: Sharpness */
  var dpr0 = Math.min(window.devicePixelRatio || 1, 2);
  Settings.autoPerf = false; Perf.reset();
  Settings.sharp = 0; resize(); var w0 = stage.width;
  GR.handleAction('s-sharp'); out.sharp1 = Settings.sharp === 1 && Math.abs(G.dpr - dpr0 * 0.75) < 1e-6 && stage.width === Math.round(G.W * G.dpr);
  GR.handleAction('s-sharp'); out.sharp2 = Settings.sharp === 2 && Math.abs(G.dpr - dpr0 * 0.5) < 1e-6 && stage.width < w0;
  Settings.save(); out.saved = Save.data.sharp === 2;
  Settings.sharp = 0; Settings.load(); out.loaded = Settings.sharp === 2;
  delete Save.data.sharp; Settings.load(); out.oldSave = Settings.sharp === 0;
  Save.data.sharp = 7; Settings.load(); out.junkSaved = Settings.sharp === 0;
  GR.handleAction('s-sharp'); GR.handleAction('s-sharp'); GR.handleAction('s-sharp');
  out.cycles = Settings.sharp === 0 && stage.width === w0;
  showSettings(); out.settingsRow = !!document.querySelector('[data-a="s-sharp"]');
  Settings.sharp = 0; Settings.autoPerf = true; Settings.save(); resize();

  var need = ['rimKept', 'rimFew', 'noSoftLight', 'hardLight', 'gradeConst', 'tilesMade', 'tilesCpu', 'tilesUnscaled', 'vignetteCopied', 'vignetteShape', 'spritesCpu', 'cachesCpu', 'noEarlyStep', 'menuTwoSteps', 'menuScaled', 'cheapStays', 'shopNotCounted', 'slowOneStep',
              'sharp1', 'sharp2', 'saved', 'loaded', 'oldSave', 'junkSaved', 'cycles', 'settingsRow'];
  out.pass = out.errs.length === 0 && need.every(function(k){ return out[k] === true; });
  out.failed = need.filter(function(k){ return out[k] !== true; });
  QA.done(out);
} catch (e) { out.err = String(e && e.stack || e); out.pass = false; QA.done(out); }
