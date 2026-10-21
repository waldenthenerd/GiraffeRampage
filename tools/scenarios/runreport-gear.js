/* Gear damage keeps its own label in the real end-of-run report. */
GR.handleAction('splash-go');
(function(){
  var out = { failed: [] }, check = function(k, v){ if (!v) out.failed.push(k); };
  GR.startRun(1); G.introFX = null;
  G.runDmg = {};
  spawnEnemy('hyena', P.x + 200, P.y, G.wave);
  var e = G.enemies[G.enemies.length - 1], prev = dmgSrc;
  e.hp = e.maxHp = 1000;
  try { dmgSrc = 'gear'; damageEnemy(e, 100, {}); dmgSrc = 'kick'; damageEnemy(e, 50, {}); }
  finally { dmgSrc = prev; }
  check('gear credited', G.runDmg.gear > 0);
  check('kick credited', G.runDmg.kick > 0);
  gameOver(); showDeath();
  out.rows = [].map.call(document.querySelectorAll('.rr-nm'), function(n){ return n.textContent; });
  check('gear label', out.rows.indexOf('Gear effects') >= 0);
  check('kick unchanged', out.rows.indexOf('Your kick') >= 0);
  var names = { ants: 'Ant colony', allies: 'Dust allies', squad: 'Dust squad', burn: 'Burning', turrets: 'Ant turrets', other: 'Other' };
  Object.keys(names).forEach(function(k){ check(k + ' unchanged', srcInfo(k).name === names[k]); });
  check('unknown fallback', srcInfo('unknown-source').name === 'Other');
  check('card unchanged', srcInfo(CARDS[0].id, [[CARDS[0].id, 1]]).name === cardForm(CARDS[0], 1).name);
  out.pass = !out.failed.length; QA.done(out);
})();
