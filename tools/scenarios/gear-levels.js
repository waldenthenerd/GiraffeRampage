/* Gear levels, stat preview, deltas, pity (plan Task 1/9). Run: node tools/qa-cloud.mjs tools/scenarios/gear-levels.js --wait 20000 */
GR.handleAction('splash-go');
var out = { errs: [] }; window.addEventListener('error', function(e){ out.errs.push(e.message); });
try {
  Save.data.gear = {}; Save.data.equipped = { cape: null, weapon: null, armor: null }; delete Save.data.gearLv; delete Save.data.cratePity;
  grantGear('herdhide:cape'); grantGear('herdhide:armor');
  out.a = gearLevel('herdhide:cape') === 1;
  out.notOwned = gearLevel('stoneplate:cape') === 1;
  var ups = []; for (var i = 0; i < 5; i++) ups.push(gearLevelUp('herdhide:cape'));
  out.b = ups.join() === 'true,true,true,true,false' && gearLevel('herdhide:cape') === 5;
  out.c = Math.abs(gearLevelScale(5) - 1.4) < 1e-9;
  out.d5 = gearStatsFor({ cape: 'herdhide:cape' }).stats.maxHpAdd;            /* 10 x 1.4 = 14 at level 5 */
  Save.data.gearLv['herdhide:cape'] = 0;
  out.d1 = gearStatsFor({ cape: 'herdhide:cape' }).stats.maxHpAdd;            /* 10 at level 1 */
  var dl = gearDelta('armor', 'herdhide:armor'), dr = dl.filter(function(x){ return x.key === 'dr'; })[0];
  out.e = !!dr && Math.abs((dr.to - dr.from) - 0.04) < 1e-9 && dr.better === true;
  var eq0 = JSON.stringify(Save.data.equipped); gearStatsFor({ armor: 'herdhide:armor' }); out.f = JSON.stringify(Save.data.equipped) === eq0;
  out.g = cratePityCount('normal') === 0; cratePityBump('normal', false); cratePityBump('normal', false); out.g2 = cratePityCount('normal') === 2; cratePityBump('normal', true); out.g3 = cratePityCount('normal') === 0;
  out.badId = gearLevel('nope:cape') === 1 && gearLevelUp('nope:cape') === false;
} catch (e) { out.errs.push('threw: ' + e.message); }
out.pass = !!(out.a && out.notOwned && out.b && out.c && out.d5 === 14 && out.d1 === 10 && out.e && out.f && out.g && out.g2 && out.g3 && out.badId && !out.errs.length);
QA.done(out);
