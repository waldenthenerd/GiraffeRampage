/* A save from before the gear revamp (no gearLv, no cratePity, a stale equipped id) loads and the Gear page opens. Run: node tools/qa-cloud.mjs tools/scenarios/gear-oldsave.js --wait 25000 */
GR.handleAction('splash-go');
var out = { errs: [] }; window.addEventListener('error', function(e){ out.errs.push(e.message); });
try {
  var old = { gold: 500, gems: 80, meta: {}, gear: { 'herdhide:cape': 1, 'herdhide:armor': 1, 'herdhide:weapon': 1, 'spurs:weapon': 1 }, equipped: { cape: 'herdhide:cape', weapon: 'ghost:weapon', armor: 'herdhide:armor' }, equippedTrinkets: [], best: 1234, runs: 3 };
  localStorage.setItem(GRSave.key, JSON.stringify(GRSave.encode(old)));
  Save.load(); recalcStats();
  out.keys = !!Save.data.gearLv && !!Save.data.cratePity && Object.keys(Save.data.gearLv).length === 0;
  out.staleDropped = Save.data.equipped.weapon === null;                       /* an id that is not real gear is unequipped, as before */
  out.kept = Save.data.equipped.cape === 'herdhide:cape' && Save.data.equipped.armor === 'herdhide:armor' && Save.data.best === 1234;
  out.levels = gearLevel('herdhide:cape') === 1 && P.stats.maxHpAdd === 10 && Math.abs(P.stats.dr - 0.04) < 1e-9;
  out.art = P.capeSet === 'herdhide' && P.capeLevel === 1 && P.armorInfo.setId === 'herdhide';
  showShop('gear'); var cv = document.getElementById('gearPreview'); out.page = !!cv; gearPreviewDraw(cv, performance.now());
  out.tabs = ['upgrades', 'ants', 'wheel'].every(function(t){ showShop(t); return !!document.querySelector('.tabs'); });
  showShop('gear'); gearPage.view = 'sets'; showShop('gear'); out.sets = document.querySelectorAll('.gtile').length === 48; gearPage.view = 'doll';
  Save.write(); var back = GRSave.read(); out.roundTrip = !!back && back.gearLv && back.best === 1234;
  out.bridge = typeof window.GR === 'object' && typeof GRSave.decode === 'function';
} catch (e) { out.errs.push('threw: ' + e.message + ' ' + (e.stack || '').split('\n')[1]); }
out.pass = !!(out.keys && out.staleDropped && out.kept && out.levels && out.art && out.page && out.tabs && out.sets && out.roundTrip && out.bridge && !out.errs.length);
QA.done(out);
