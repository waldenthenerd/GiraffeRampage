/* minimap: js/ui/44zzzj-minimap.js, the corner map.
   Settings: on by default on a computer and off on a phone (Input.hasTouch), an explicit choice wins either way, size and zoom are sanitized and saved, erasing progress keeps them.
   Drawing: in every chapter (1 to 16, with a Tower floor and the Siege town) at the smallest and biggest size and at zoom 1x and 4x it draws without an error and in the corner; creatures show as
   dots, a boss as a bigger one, and a boss off the zoomed map as an arrow on the edge; the Tower's map changes with its floor; a Siege key building changes colour with its health; it is not drawn on a
   phone unless opted in, and not while the demo (attract) runs. The pictures are in the pull request. */
(function(){
  var out = { errs: [] }; window.addEventListener('error', function(e){ out.errs.push(e.message); });
  GR.handleAction('splash-go'); Ach.check = function(){ return []; };
  try {
    Save.reset(); Save.data.chapter14Complete = true; Settings.load();
    var was = Input.hasTouch;
    Input.hasTouch = false; out.deskOn = mmOn() === true; Input.hasTouch = true; out.phoneOff = mmOn() === false; Settings.minimap = 'on'; out.phoneOptIn = mmOn() === true; Settings.minimap = 'off'; Input.hasTouch = false; out.deskOff = mmOn() === false;
    Settings.minimap = 'auto'; Input.hasTouch = was;
    Settings.mmSize = 7; Settings.mmZoom = -3; Settings.save(); Settings.load(); out.clamp = Settings.mmSize === 1 && Settings.mmZoom === 0;
    Save.data.minimap = 'weird'; Save.data.mmSize = 'x'; Settings.load(); out.sane = Settings.minimap === 'auto' && Settings.mmSize === 0.4;
    Settings.minimap = 'off'; Settings.mmSize = 0.9; Settings.mmZoom = 0.5; Settings.save(); Save.reset(); Settings.load(); out.keeps = Settings.minimap === 'off' && Math.abs(Settings.mmSize - 0.9) < 1e-9;
    Settings.minimap = 'on'; Settings.mmSize = 0.4; Settings.mmZoom = 0;
    var first = { 1: 1, 2: 26, 3: 51, 4: 76, 5: 101, 6: 126, 7: 151, 8: 176, 9: 201, 10: 226, 11: 251, 12: 276, 13: 301, 14: 326, 15: 336, 16: 361 }, bad = [], cvs = document.createElement('canvas'); cvs.width = 1280; cvs.height = 720; var c = cvs.getContext('2d');
    Input.hasTouch = false;
    Object.keys(first).forEach(function(ch){
      Save.data.chapter14Complete = true; Save.data.chapter15Complete = true;
      try { startRun(+ch, first[ch]); for (var i = 0; i < 4; i++) GR.step(1 / 30); } catch (e){ bad.push(ch + ' start: ' + e.message); return; }
      P.invuln = 1e9; G.pendingLevels = 0;
      [[0, 0], [1, 0], [1, 1], [0, 1]].forEach(function(sz){ Settings.mmSize = sz[0]; Settings.mmZoom = sz[1]; c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, 1280, 720); try { G.W = 1280; G.H = 720; mmDraw(c); } catch (e){ bad.push(ch + ' draw: ' + e.message); } });
    });
    out.bad = bad;
    /* creatures, a boss, an arrow */
    startRun(1, 1); for (var s = 0; s < 4; s++) GR.step(1 / 30); G.W = 1280; G.H = 720; G.enemies.length = 0; Settings.mmSize = 1; Settings.mmZoom = 0; G.state = 'playing'; P.x = 2100; P.y = 1575; G.camX = P.x; G.camY = P.y;
    function box(){ var mw = mmSizePx(), mh = Math.round(mw * ARENA_H / ARENA_W); return { x: 1280 - mw - 14, y: 720 - mh - 14, w: mw, h: mh }; }
    function count(r, g, b, tol){ var B = box(), d = c.getImageData(B.x, B.y, B.w, B.h).data, n = 0; for (var i = 0; i < d.length; i += 4) if (Math.abs(d[i] - r) < tol && Math.abs(d[i + 1] - g) < tol && Math.abs(d[i + 2] - b) < tol) n++; return n; }
    function paint(){ c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = '#000'; c.fillRect(0, 0, 1280, 720); mmDraw(c); }
    paint(); var none = count(228, 38, 26, 12);
    for (var k = 0; k < 40; k++){ var e = spawnEnemy('hyena', 600 + k * 70, 600 + (k % 5) * 300, 1); if (e) e.hp = e.maxHp = 1e12; }
    paint(); var dotsRed = count(255, 90, 68, 40); out.dots = dotsRed > 20;
    var boss = spawnEnemy('lion', 3600, 2700, 5); if (boss){ boss.hp = boss.maxHp = 1e12; } paint(); var bossRed = count(228, 38, 26, 12); out.boss = bossRed > none + 5;
    Settings.mmZoom = 1; P.x = 600; P.y = 600; G.camX = 600; G.camY = 600; paint(); var arrow = count(228, 38, 26, 12); out.arrow = arrow > 5;       /* the boss is off the zoomed map */
    out.cornerOnly = (function(){ var d = c.getImageData(0, 0, 640, 300).data, n = 0; for (var i = 0; i < d.length; i += 4) if (d[i] || d[i + 1] || d[i + 2]) n++; return n === 0; })();
    /* the Tower: a different floor draws a different map */
    startRun(15, 340); for (s = 0; s < 4; s++) GR.step(1 / 30); G.W = 1280; G.H = 720; Settings.mmZoom = 0; G.enemies.length = 0; G.state = 'playing'; paint(); var d1 = c.getImageData(box().x, box().y, box().w, box().h).data;
    var n1 = TW.n; startRun(15, 345); for (s = 0; s < 4; s++) GR.step(1 / 30); G.W = 1280; G.H = 720; G.enemies.length = 0; G.state = 'playing'; paint(); var d2 = c.getImageData(box().x, box().y, box().w, box().h).data, diff = 0; for (var q = 0; q < d1.length; q += 4) if (d1[q] !== d2[q] || d1[q + 1] !== d2[q + 1]) diff++;
    out.towerFloors = TW.n !== n1 && diff > 200;
    /* the Siege: a key building changes colour with its health */
    startRun(16, 361); for (s = 0; s < 4; s++) GR.step(1 / 30); G.W = 1280; G.H = 720; G.enemies.length = 0; G.state = 'playing'; P.invuln = 1e9;
    var keys = Object.keys(SGB), kb = SGB[keys[0]]; kb.hp = SIEGE_BLD.max; paint(); var g1 = count(88, 200, 74, 30); kb.hp = SIEGE_BLD.max * 0.2; paint(); var g2 = count(88, 200, 74, 30), r2 = count(240, 96, 58, 30);
    out.siegeHealth = g1 > g2 && r2 > 0; out.siegeKeys = keys.length >= 5;
    /* a phone without the opt-in draws nothing, and nothing in the demo */
    Input.hasTouch = true; Settings.minimap = 'auto'; G.state = 'playing'; G.attract = false; out.phoneNone = !(mmOn());
    Input.hasTouch = false; Settings.minimap = 'on'; G.attract = true; var hit = 0, orig = mmDraw; mmDraw = function(){ hit++; }; drawScreenFX(c); G.attract = false; drawScreenFX(c); mmDraw = orig; out.attractNone = hit === 1;
    Input.hasTouch = was;
  } catch (err){ out.err = String(err && err.stack || err); }
  out.pass = out.errs.length === 0 && !out.err && out.deskOn && out.phoneOff && out.phoneOptIn && out.deskOff && out.clamp && out.sane && out.keeps && out.bad.length === 0 && out.dots && out.boss && out.arrow && out.cornerOnly && out.towerFloors && out.siegeHealth && out.siegeKeys && out.phoneNone && out.attractNone;
  QA.done(out);
})();
