/* Gear icons (plan Task 5). Params: size=64|128 (sheet). Run: node tools/qa-cloud.mjs tools/scenarios/gear-icons.js --shot x.png --wait 25000 */
GR.handleAction('splash-go');
var out = { errs: [] }; window.addEventListener('error', function(e){ out.errs.push(e.message); });
try {
  var ids = Object.keys(GEAR_INDEX); out.n = ids.length;
  Save.data.gear = {}; Save.data.gearLv = {};
  var d0 = gearIcon._draws | 0, bad = [];
  ids.forEach(function(id){ var u = gearIcon(id, 64); if (typeof u !== 'string' || u.indexOf('data:image/png') !== 0) bad.push(id); });
  out.bad = bad;
  var firstDraws = gearIcon._draws - d0; ids.forEach(function(id){ gearIcon(id, 64); }); out.cached = (gearIcon._draws - d0) === firstDraws;
  grantGear('herdhide:cape'); out.differs = gearIcon('herdhide:cape', 64) !== gearIcon('herdhide:cape', 64, { locked: true });
  out.lvDiffers = gearIcon('herdhide:cape', 64, { level: 4 }) !== gearIcon('herdhide:cape', 64, { level: 1 });
  out.badId = gearIcon('nope', 64) === '';
  var f = gearFrame('legendary'); out.frame = !!(f.border && f.glow && f.bg && f.bg.length === 2) && gearFrame('zzz').border === gearFrame('common').border;
  var size = parseInt(QA.params.size || '64', 10), cv = document.createElement('div'); cv.style.cssText = 'position:fixed;left:0;top:0;z-index:99999;background:#241B15;width:1200px;padding:6px;font:11px sans-serif;color:#fff';
  ['cape', 'weapon', 'armor'].forEach(function(slot){
    var row = document.createElement('div'); row.style.cssText = 'display:flex;flex-wrap:wrap;margin-bottom:4px';
    GEAR_SETS.forEach(function(s, i){
      var id = s.id + ':' + slot, fr = gearFrame(s.rarity);
      [false, true].forEach(function(lock){
        var im = new Image(); im.src = gearIcon(id, size, { locked: lock, level: lock ? 1 : 1 + (i % 5) }); im.style.cssText = 'width:' + size + 'px;height:' + size + 'px;margin:1px;border:2px solid ' + fr.border + ';background:linear-gradient(' + fr.bg[0] + ',' + fr.bg[1] + ');border-radius:6px';
        row.appendChild(im);
      });
    });
    cv.appendChild(row);
  });
  document.body.appendChild(cv);
} catch (e) { out.errs.push('threw: ' + e.message + ' ' + (e.stack || '').split('\n')[1]); }
out.pass = !!(out.n === GEAR_SETS.length * 3 && out.bad && !out.bad.length && out.cached && out.differs && out.lvDiffers && out.badId && out.frame && !out.errs.length);
QA.done(out);
