/* Six more gear sets and the mythical tier. Run: node tools/qa-cloud.mjs tools/scenarios/gear-more.js --wait 60000 [--params "sheet=capes|weapons|armor|crate"] [--shot x.png] */
GR.handleAction('splash-go');
var out = { errs: [] }; window.addEventListener('error', function(e){ out.errs.push(e.message); });
var NEW = ['cinder', 'rooftop', 'moondust', 'rustwalker', 'sitezero', 'worldspire'];
try {
  var by = {}; GEAR_SETS.forEach(function(s){ by[s.rarity] = (by[s.rarity] || 0) + 1; });
  out.counts = JSON.stringify(by); out.sets = GEAR_SETS.length; out.pieces = Object.keys(GEAR_INDEX).length;
  out.countsOk = by.common === 8 && by.rare === 7 && by.epic === 4 && by.legendary === 2 && by.mythical === 1 && out.sets === 22 && out.pieces === 66;
  out.newOk = NEW.every(function(id){ var s = SETMAP[id]; return s && GEAR_SLOTS.every(function(sl){ return s.pieces[sl] && s.pieces[sl].name && s.pieces[sl].desc; }) && WEAPONS[s.pieces.weapon.weapon]; });
  out.rank = RARITY_ORDER.mythical === 4 && RANGE_RARITY_MUL.mythical === 2 && WEAPONS.worldspire && WEAPONS.worldspire.range === 208;
  /* odds: 0.02% normal, 0.1% prime, each crate still sums to 100 */
  var sum = function(w){ return Object.keys(w).reduce(function(a, k){ return a + w[k]; }, 0); };
  out.odds = CRATES.normal.weights.mythical === 0.02 && CRATES.rare.weights.mythical === 0.1 && Math.abs(sum(CRATES.normal.weights) - 100) < 1e-9 && Math.abs(sum(CRATES.rare.weights) - 100) < 1e-9 && CRATES.normal.weights.legendary === 1 && CRATES.rare.weights.legendary === 6;
  var mr = Math.random;
  Math.random = function(){ return 0.99985; }; var a1 = rollRarity(CRATES.normal.weights), a2 = rollRarity(CRATES.rare.weights);
  Math.random = function(){ return 0.9997; }; var b1 = rollRarity(CRATES.normal.weights), b2 = rollRarity(CRATES.rare.weights);
  Math.random = mr; out.edges = a1 === 'mythical' && a2 === 'mythical' && b1 === 'legendary' && b2 === 'mythical';
  var n = 2000000, cn = 0, cr = 0; for (var i = 0; i < n; i++){ if (rollRarity(CRATES.normal.weights) === 'mythical') cn++; if (rollRarity(CRATES.rare.weights) === 'mythical') cr++; }
  out.mc = [cn, cr]; out.mcOk = cn > 250 && cn < 600 && cr > 1700 && cr < 2300;           /* expected 400 and 2000 */
  /* art exists for every new piece, and drawPlayer takes each one without throwing */
  out.art = NEW.every(function(id){ return typeof CAPE_DESIGNS[id] === 'function' && typeof ARMOR_DESIGNS[id] === 'function' && !!WEAPON_ART[SETMAP[id].pieces.weapon.weapon]; });
  /* icons for all 66 */
  out.icons = Object.keys(GEAR_INDEX).every(function(id){ return gearIcon(id, 48).indexOf('data:image/png') === 0; });
  out.frame = gearFrame('mythical').border !== gearFrame('common').border && !!gearFrame('mythical').bg;
  /* crates: a forced mythical roll gives a mythical piece; all three owned -> duplicates level up */
  Save.data.gear = {}; Save.data.gearLv = {}; Save.data.cratePity = {}; Save.data.equipped = { cape: null, weapon: null, armor: null }; Save.data.gems = 5000;
  var rr = rollRarity; rollRarity = function(){ return 'mythical'; };
  var got = []; for (i = 0; i < 3; i++){ var r = openCrate('rare'); got.push(r && r.piece.setId + ':' + r.rarity + ':' + !!r.dupe); }
  var r4 = openCrate('rare'); rollRarity = rr;
  out.crate = got.every(function(g){ return g.indexOf('worldspire:mythical:false') === 0; }) && r4 && r4.dupe === true && r4.levelUp === 2 && r4.rarity === 'mythical';
  /* the crate card prints the odds */
  Save.data.gems = 500; showShop('gear'); var txt = OV.textContent; out.oddsText = /Mythical 0\.02%/.test(txt) && /Mythical 0\.1%/.test(txt);
  /* mythical effects */
  out.fx = !!GEAR_FX['worldspire:cape'] && !!GEAR_FX['worldspire:weapon'] && !!GEAR_FX['worldspire:armor'];
  out.setBonus = SETMAP.worldspire.setDesc.length > 10;
  out.stronger = (function(){ var p = gearStatsFor({ cape: 'worldspire:cape', armor: 'worldspire:armor', weapon: 'worldspire:weapon' }), q = gearStatsFor({ cape: 'leviathan:cape', armor: 'leviathan:armor', weapon: 'leviathan:weapon' }); return p.stats.dr > q.stats.dr && p.stats.allDmgMul > q.stats.allDmgMul && p.weapon.dmg > q.weapon.dmg; })();
  /* contact sheet of the new art */
  var which = QA.params.sheet;
  if (which){
    var cols = 4, rows = 2, cv = document.createElement('canvas'); cv.width = cols * 300; cv.height = rows * 170; cv.style.cssText = 'position:fixed;left:0;top:0;z-index:99999'; document.body.appendChild(cv);
    var c = cv.getContext('2d'); c.fillStyle = '#7C8F55'; c.fillRect(0, 0, cv.width, cv.height);
    GR.startRun(1); G.introFX = null; for (i = 0; i < 20; i++) GR.step(1 / 60);
    var cells = []; NEW.forEach(function(id){ cells.push([id, 0]); if (which === 'weapons') cells.push([id, 1]); });
    cells.slice(parseInt(QA.params.page || '0', 10) * 8, parseInt(QA.params.page || '0', 10) * 8 + 8).forEach(function(cell, idx){
      var id = cell[0], set = SETMAP[id]; Save.data.gearLv = {}; GEAR_SLOTS.forEach(function(sl){ grantGear(set.id + ':' + sl); });
      Save.data.equipped = { cape: null, weapon: null, armor: null };
      if (which === 'capes') equipGear(id + ':cape'); if (which === 'weapons') equipGear(id + ':weapon'); if (which === 'armor') equipGear(id + ':armor');
      if (which === 'all'){ GEAR_SLOTS.forEach(function(sl){ equipGear(id + ':' + sl); }); }
      recalcStats(); P.invuln = 0; P.vx = which === 'capes' ? 80 : 0; P.vy = 0; P.aim = which === 'capes' ? 0.25 : 0; P.face = P.aim; P.x = 0; P.y = 0; P.walk = 1; G.time = 3 + idx * 0.3;
      P.kickAnim = cell[1] ? 0.3 * 0.73 : 0; GF.neck.ext = 0; GF.neck.bend = 0; NS.ghosts.length = 0; if (cell[1]){ var pr = neckProfile(0.27); GF.neck.ext = pr.k * NS_REACH; GF.neck.bend = pr.w * 30; }
      var col = idx % cols, row = Math.floor(idx / cols), sc = which === 'weapons' ? 1.3 : 2.2;
      c.save(); c.beginPath(); c.rect(col * 300, row * 170, 300, 170); c.clip(); c.translate(col * 300 + (which === 'weapons' ? 62 : 150), row * 170 + 92); c.scale(sc, sc); drawPlayer(c); c.restore();
      c.fillStyle = '#fff'; c.font = '12px sans-serif'; c.fillText(set.name + ' · ' + (which === 'all' ? 'all three' : which === 'weapons' ? set.pieces.weapon.name + (cell[1] ? ' (strike)' : '') : set.pieces[which === 'capes' ? 'cape' : 'armor'].name), col * 300 + 8, row * 170 + 16);
    });
    P.kickAnim = 0;
  }
} catch (e) { out.errs.push('threw: ' + e.message + ' ' + (e.stack || '').split('\n')[1]); }
var keys = ['countsOk', 'newOk', 'rank', 'odds', 'edges', 'mcOk', 'art', 'icons', 'frame', 'crate', 'oddsText', 'fx', 'setBonus', 'stronger'];
out.failed = keys.filter(function(k){ return !out[k]; }); out.pass = !out.failed.length && !out.errs.length;
QA.done(out);
