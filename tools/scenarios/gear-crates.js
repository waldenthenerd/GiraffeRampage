/* Crate pity, duplicate level-ups, reveal (plan Tasks 8, 9). Run: node tools/qa-cloud.mjs tools/scenarios/gear-crates.js --wait 25000 [--shot x.png --params "phase=burst|result|shake"] */
GR.handleAction('splash-go');
var out = { errs: [] }; window.addEventListener('error', function(e){ out.errs.push(e.message); });
function reset(){ Save.data.gear = {}; Save.data.gearLv = {}; Save.data.cratePity = {}; Save.data.equipped = { cape: null, weapon: null, armor: null }; Save.data.gems = 1000; Save.data.cratesOpened = 0; }
try {
  var realRoll = rollRarity;
  /* pity: 9 opens without rare+, every roll forced common -> the 10th is rare or better */
  reset(); rollRarity = function(){ return 'common'; };
  Save.data.cratePity = { normal: 9 };
  var r = openCrate('normal');
  out.pityRarity = r && r.rarity; out.pityFlag = !!(r && r.pity); out.pityGood = !!r && RARITY_ORDER[r.rarity] >= RARITY_ORDER.rare; out.pityReset = cratePityCount('normal') === 0;
  /* a normal rare+ drop also resets; a common one bumps */
  Save.data.cratePity = { normal: 4 }; rollRarity = function(){ return 'rare'; }; var r2 = openCrate('normal'); out.rareResets = cratePityCount('normal') === 0 && !r2.pity;
  rollRarity = function(){ return 'common'; }; var before = cratePityCount('normal'); openCrate('normal'); out.commonBumps = cratePityCount('normal') === before + 1;
  /* prime crate pity needs epic after 8 */
  reset(); Save.data.cratePity = { rare: 7 }; var r3 = openCrate('rare'); out.primeEpic = !!r3 && RARITY_ORDER[r3.rarity] >= RARITY_ORDER.epic && !!r3.pity;
  /* pity still gives a good piece when every unowned good piece is owned: it levels one up instead of handing out a common */
  reset(); GEAR_SETS.forEach(function(s){ if (RARITY_ORDER[s.rarity] >= RARITY_ORDER.rare) GEAR_SLOTS.forEach(function(sl){ if (s.pieces[sl]) grantGear(s.id + ':' + sl); }); });
  Save.data.cratePity = { normal: 9 }; var r4 = openCrate('normal'); out.pityDupe = !!r4 && r4.dupe === true && RARITY_ORDER[r4.rarity] >= RARITY_ORDER.rare;
  /* duplicates: level up, no refund until maxed */
  reset(); rollRarity = function(){ return 'common'; };
  var commons = Object.keys(GEAR_INDEX).filter(function(id){ return GEAR_INDEX[id].rarity === 'common'; });
  Object.keys(GEAR_INDEX).forEach(function(id){ grantGear(id); });     /* everything owned: any roll can only be a duplicate */
  var gems0 = Save.data.gems, r5 = openCrate('normal');
  out.dupeLevel = !!r5 && r5.dupe === true && r5.levelUp === 2 && gearLevel(r5.piece.id) === 2;
  out.dupeNoRefund = Save.data.gems === gems0 - CRATES.normal.cost && r5.refund === 0;
  commons.forEach(function(id){ Save.data.gearLv[id] = 4; });         /* all maxed: duplicates refund */
  var g1 = Save.data.gems, r6 = openCrate('normal'); out.maxedRefund = !!r6 && r6.dupe && r6.refund === DUPE_REFUND && Save.data.gems === g1 - CRATES.normal.cost + DUPE_REFUND && !r6.levelUp;
  /* stats: an upgraded piece is stronger */
  reset(); grantGear('herdhide:cape'); var s1 = gearStatsFor({ cape: 'herdhide:cape' }).stats.maxHpAdd; Save.data.gearLv['herdhide:cape'] = 4; out.lvStat = s1 === 10 && gearStatsFor({ cape: 'herdhide:cape' }).stats.maxHpAdd === 14;
  grantGear('stone:weapon'); grantGear('stoneplate:weapon'); var wid = 'stoneplate:weapon'; grantGear(wid); var w1 = gearStatsFor({ weapon: wid }).weapon.dmg; Save.data.gearLv[wid] = 4; var w5 = gearStatsFor({ weapon: wid }).weapon.dmg; out.weaponDmg = Math.abs(w5 / w1 - 1.24) < 0.01;
  rollRarity = realRoll;
  /* reveal: gems spent once, piece granted once, guard against a second open, no leaked timers */
  reset(); rollRarity = function(){ return 'epic'; }; Save.data.gems = 100;
  var ph = QA.params.phase || 'result';
  showShop('gear'); buyCrate('normal'); out.revealActive = !!gearReveal.active; var g2 = Save.data.gems; buyCrate('normal'); out.secondIgnored = Save.data.gems === g2 && Object.keys(Save.data.gear).length === 1;
  out.spentOnce = Save.data.gems === 100 - CRATES.normal.cost;
  if (ph === 'result') gearRevealSkip();
  out.phaseAfterSkip = gearReveal.phase; out.noRegress = (function(){ gearRevealPhase(1); return gearReveal.phase === 2 || ph !== 'result'; })();
  out.hasEl = !!document.getElementById('crateReveal');
  if (ph === 'result'){ out.revealText = (document.querySelector('#crateReveal .crn') || {}).textContent; }
  if (QA.params.close){ gearRevealEnd(); out.closed = !document.getElementById('crateReveal') && !gearReveal.active && gearReveal.timers.length === 0; }
  else { var t = gearReveal.timers.length; out.timers = t; }
  showShop('upgrades'); out.endedOnTabChange = !gearReveal.active && gearReveal.timers.length === 0 && !document.getElementById('crateReveal');
  rollRarity = realRoll;
  /* Visual effects off: one short timer, no sparks */
  var fx0 = Settings.fxLevel; Settings.fxLevel = 0; reset(); rollRarity = function(){ return 'rare'; }; Save.data.gems = 100; showShop('gear'); buyCrate('normal');
  out.fxOff = gearReveal.timers.length === 1 && !document.querySelector('#crateReveal .crsparks'); gearRevealEnd(); Settings.fxLevel = fx0; rollRarity = realRoll;
  if (QA.params.shot){ reset(); rollRarity = function(){ return QA.params.rar || 'legendary'; }; Save.data.gems = 100; showShop('gear'); buyCrate('rare'); if (ph === 'result') gearRevealSkip(); if (ph === 'burst') gearRevealPhase(1); rollRarity = realRoll; }
} catch (e) { out.errs.push('threw: ' + e.message + ' ' + (e.stack || '').split('\n')[1]); }
out.pass = !!(out.pityGood && out.pityFlag && out.pityReset && out.rareResets && out.commonBumps && out.primeEpic && out.pityDupe && out.dupeLevel && out.dupeNoRefund && out.maxedRefund && out.lvStat && out.weaponDmg && out.revealActive && out.secondIgnored && out.spentOnce && out.endedOnTabChange && out.noRegress && out.fxOff && !out.errs.length);
QA.done(out);
