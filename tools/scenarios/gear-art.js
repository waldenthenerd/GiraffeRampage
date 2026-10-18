/* Gear art: capes (plan Task 2), weapons (Task 3), armor (Task 4). Params: view=capes|weapons|armor, lv=1..5. Draws a contact sheet over the page. */
GR.handleAction('splash-go');
var out = { errs: [] }; window.addEventListener('error', function(e){ out.errs.push(e.message); });
var view = QA.params.view || 'capes', LV = parseInt(QA.params.lv || '1', 10);
function sheet(cols, rows, cw, ch){
  var cv = document.createElement('canvas'); cv.width = cols * cw; cv.height = rows * ch;
  cv.style.cssText = 'position:fixed;left:0;top:0;z-index:99999;background:#7C8F55'; document.body.appendChild(cv);
  var c = cv.getContext('2d'); c.fillStyle = '#7C8F55'; c.fillRect(0, 0, cv.width, cv.height); return c;
}
try {
  GR.startRun(1); G.introFX = null; for (var i = 0; i < 30; i++){ GR.step(1 / 60); P.invuln = 99; }
  var sets = GEAR_SETS.map(function(s){ return s.id; });
  if (view === 'capes'){
    /* check: every set has a design that paints something */
    var bad = [];
    sets.forEach(function(id){
      var cv = document.createElement('canvas'); cv.width = cv.height = 160; var c = cv.getContext('2d');
      var a = 0, tipA = Math.PI, len = 38, bx = 100, by = 80;
      var o = { bx: bx, by: by, tipA: tipA, len: len, spread: 12, px: -Math.sin(a), py: Math.cos(a), ppx: -Math.sin(tipA), ppy: Math.cos(tipA), a: a, moving: 0, color: GEAR_SETS.filter(function(s){ return s.id === id; })[0].color, t: 1, level: 1 };
      o.tx = bx + Math.cos(tipA) * len; o.ty = by + Math.sin(tipA) * len; o.mx = bx + Math.cos(tipA) * len * 0.55; o.my = by + Math.sin(tipA) * len * 0.55;
      var ok = typeof CAPE_DESIGNS[id] === 'function' && capeDraw(c, id, o);
      var d = c.getImageData(0, 0, 160, 160).data, n = 0; for (var k = 3; k < d.length; k += 4) if (d[k] > 10) n++;
      if (!ok || n < 40) bad.push(id + ':' + n);
    });
    out.bad = bad;
    var c = sheet(4, 4, 300, 160);
    sets.forEach(function(id, i){
      var cape = GEAR_INDEX[id + ':cape']; grantGear(cape.id); Save.data.gearLv = Save.data.gearLv || {}; Save.data.gearLv[cape.id] = LV - 1; equipGear(cape.id);
      P.vx = 80; P.vy = 0; P.aim = 0.25; P.face = 0.25; P.x = 0; P.y = 0; P.walk = 1; G.time = 3 + i * 0.3;
      var sc = 2.6, cx = (i % 4) * 300 + 175, cy = Math.floor(i / 4) * 160 + 88;
      c.save(); c.beginPath(); c.rect((i % 4) * 300, Math.floor(i / 4) * 160, 300, 160); c.clip();
      c.translate(cx, cy); c.scale(sc, sc); var sx = P.x, sy = P.y; drawPlayer(c); c.restore();
      c.fillStyle = '#fff'; c.font = '12px sans-serif'; c.fillText(cape.name + (LV > 1 ? ' +' + (LV - 1) : ''), (i % 4) * 300 + 8, Math.floor(i / 4) * 160 + 16);
    });
    out.pass = !bad.length;
  }

  if (view === 'weapons'){
    var pg = parseInt(QA.params.page || '0', 10), ids = sets.filter(function(id){ return GEAR_INDEX[id + ':weapon']; });
    var badw = [];
    ids.forEach(function(sid){
      var wid = GEAR_INDEX[sid + ':weapon'].weapon, art = WEAPON_ART[wid];
      if (!art) { badw.push(wid + ':missing'); return; }
      [0, 1].forEach(function(sw){
        ['hoof', 'body', 'head'].forEach(function(k){
          if (!art[k]) return;
          var cv = document.createElement('canvas'); cv.width = cv.height = 160; var c = cv.getContext('2d'); c.translate(60, 80);
          art[k](c, { e: sw ? 0.27 : -1, swing: sw, t: 1, color: WEAPONS[wid].color, level: 1, side: 1 });
          var d = c.getImageData(0, 0, 160, 160).data, n = 0; for (var q = 3; q < d.length; q += 4) if (d[q] > 10) n++;
          if (n < 25 && !(wid === 'hooves' && !sw)) badw.push(wid + ':' + k + ':' + sw + ':' + n);
        });
      });
    });
    out.bad = badw; out.pass = !badw.length; out.count = ids.length;
    var c2 = sheet(4, 4, 300, 160), sc2 = parseFloat(QA.params.zoom || '1.35');
    ids.slice(pg * 8, pg * 8 + 8).forEach(function(sid, i){
      var piece = GEAR_INDEX[sid + ':weapon']; grantGear(piece.id); Save.data.gearLv = Save.data.gearLv || {}; Save.data.gearLv[piece.id] = LV - 1; equipGear(piece.id);
      [0, 1].forEach(function(pose){
        var cell = i * 2 + pose, col = cell % 4, row = Math.floor(cell / 4);
        P.vx = 0; P.vy = 0; P.aim = 0; P.face = 0; P.x = 0; P.y = 0; P.walk = 1; G.time = 3 + i * 0.3; P.kickAnim = pose ? 0.30 * (1 - 0.27) : 0; NS.prevAnim = P.kickAnim;
        GF.neck.ext = 0; GF.neck.bend = 0; NS.ghosts.length = 0; if (pose){ var pr = neckProfile(0.27); GF.neck.ext = pr.k * NS_REACH; GF.neck.bend = pr.w * 30; }
        c2.save(); c2.beginPath(); c2.rect(col * 300, row * 160, 300, 160); c2.clip(); c2.translate(col * 300 + 70, row * 160 + 84); c2.scale(sc2, sc2); drawPlayer(c2); c2.restore();
        c2.fillStyle = '#fff'; c2.font = '12px sans-serif'; c2.fillText(piece.name + (pose ? ' (strike)' : '') + (LV > 1 ? ' +' + (LV - 1) : ''), col * 300 + 8, row * 160 + 16);
      });
    });
    P.kickAnim = 0;
  }
} catch (e) { out.errs.push('threw: ' + e.message + ' ' + (e.stack || '').split('\n')[1]); }
out.pass = !!out.pass && !out.errs.length;
QA.done(out);
