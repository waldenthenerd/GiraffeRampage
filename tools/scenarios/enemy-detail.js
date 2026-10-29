/* enemy-detail: the detail layers (js/art/35l-art-detail.js for Chapters 13.5, 14 and 15 (Chapter 16's creatures are drawn out of small parts to start with), js/art/35m-art-detail-classic.js for Chapters 1 to 13) on every creature.
   Every creature draws without an error in each of its states; the ordinary ones are still taken by the sprite cache (so the extra parts cost nothing per frame), and no creature's live
   drawing is slower than a generous budget. The gallery (tools/enemy-gallery.html?ch=14|15|16|17) shows the pictures. */
(function(){
  var res = { chapters: {} }, errs = [], slow = [], liveBy = {};
  GR.handleAction('splash-go');
  GR.startRun(1); G.introFX = null;
  var cv = document.createElement('canvas'); cv.width = cv.height = 400; var c = cv.getContext('2d');
  var states = ['idle', 'wind', 'dash', 'lunge', 'slam', 'charge', 'chargewind', 'launch', 'bombwind', 'lobwind', 'burn', 'stompwind', 'cannonwind', 'barragewind', 'roar', 'shardwind', 'novawind', 'slump', 'ring', 'meeting'];
  var ordinary = 0, cached = 0, total = 0;
  [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17].forEach(function(ch){
    var table = GR.bestiaryTable(ch), names = Object.keys(table), n = 0;
    names.forEach(function(type){
      var def = table[type], e = { portrait: false, def: def, type: type, x: 0, y: 0, r: def.r, ang: 0, flash: 0, state: 'idle', anim: 1.2, hp: 1, maxHp: 1, big: def.big, kx: 0, ky: 0, stunT: 0, burnT: 0, slowT: 0, slowMul: 1, p2: true, glow: 0.5, phase: 1, open: 0.5 };
      states.forEach(function(st){
        e.state = st;
        for (var k = 0; k < 4; k++){
          e.anim = 0.3 + k * 1.7; c.setTransform(1, 0, 0, 1, 200, 200); c.clearRect(-200, -200, 400, 400);
          try { GR.drawEnemy(c, e); } catch (err){ errs.push(type + '/' + st + ': ' + err.message); }
        }
      });
      /* time of the live drawing (the bosses are always live) */
      e.state = 'idle'; var t0 = performance.now(), reps = def.big ? 120 : 200;
      for (var i = 0; i < reps; i++){ e.anim = i * 0.05; c.setTransform(1, 0, 0, 1, 200, 200); try { drawEnemyBody(c, e, def.color, def.dark, Math.sin(e.anim) * def.r * 0.06, false, def); } catch (err){ errs.push(type + ' live: ' + err.message); break; } }
      var ms = (performance.now() - t0) / reps; if (ms > (def.big ? 4 : 1.5)) slow.push(type + ' ' + ms.toFixed(2) + 'ms');
      if (!def.big && (def.look || '').indexOf('tw_') === 0 || (def.look || '').indexOf('sg_') === 0){ if (!def.big){ ordinary++; } }
      n++;
    });
    res.chapters[ch] = n; total += n;
  });
  /* the sprite cache's verdict on the ordinary Tower and Siege creatures */
  var rep = EnemySprite.report(), bad = [];
  for (var key in rep) if (/(^|\W)(tw_|sg_|ft_)/.test(key) && !/boss/.test(key)) bad.push(key + ': ' + JSON.stringify(rep[key]));
  res.total = total; res.errors = errs.slice(0, 5); res.slow = slow; res.cacheWhy = bad.slice(0, 6);
  QA.done({ res: res, pass: total === 293 && errs.length === 0 && slow.length === 0 });
})();
