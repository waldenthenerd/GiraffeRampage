/* The Engineer Ant (js/44zzr-engineer-ants.js). Run: node tools/qa-cloud.mjs tools/scenarios/ants-engineer.js --wait 90000 [--shot x.png --w 390 --h 1200 --touch --params "view=bay|locked|field"] */
GR.handleAction('splash-go');
var out = { errs: [] }; window.addEventListener('error', function(e){ out.errs.push(e.message); });
function $(s){ return document.querySelector(s); } function $$(s){ return [].slice.call(document.querySelectorAll(s)); }
try {
  var view = (QA.params && QA.params.view) || 'none';
  var unlock = function(on){ Save.data.antsUnlocked = true; Save.data.chapter8Complete = true; Save.data.chapter9Complete = on; Save.data.venusUp = on ? { rover: 1, col2: 1, col1: 1, forge: 1, hab1: 1, hab2: 1, garage: 1 } : { rover: 1, col2: 1, col1: 1, forge: 1, hab1: 1, hab2: 1 }; Save.data.ants = { soldier: 0, distractor: 0, shooter: 0 }; Save.data.meta = {}; Save.data.food = 100; };
  /* 1. getting it: the Venus upgrade needs the rover, the burrows and Chapter 9 */
  unlock(false); out.lockedAtFirst = engineersUnlocked() === false && antCapFor('engineer') === Math.floor(antMax() / 2) && antCapFor('engineer') >= 1;
  Save.data.sulfur = 5000; Save.data.basalt = 5000; Save.data.chapter9Complete = false;
  out.needCh9 = venusBuyCheck('garage') === 'requires' && venusMissing(VENUS_BY_ID.garage).indexOf('ch9') >= 0 && venusName(VENUS_BY_ID.ch9) === 'Chapter 9 finished';
  Save.data.chapter9Complete = true; out.canBuy = venusBuyCheck('garage') === '' && buyVenus('garage') === true && engineersUnlocked() === true;
  Save.data.venusUp = { rover: 1, col2: 1, forge: 1, hab1: 1, hab2: 1 }; out.needRover = venusBuyCheck('garage') === '' ; delete Save.data.venusUp.rover; out.needRover = out.needRover && venusBuyCheck('garage') === 'requires';
  showVenus && (function(){ unlock(true); Save.data.venusUp = { rover: 1, col2: 1, col1: 1, forge: 1, hab1: 1, hab2: 1 }; Save.data.chapter9Complete = false; try { showVenus('work'); } catch (e) {} out.venusPage = /Engineer Garage/.test(document.body.textContent) && /Chapter 9 finished/.test(document.body.textContent); })();
  /* 2. the cap is half, never under one; the price is double */
  unlock(true); var base = antMax(); out.cap = antCapFor('engineer') === Math.floor(base / 2) && antCapFor('soldier') === base; Save.data.meta.antcap = 1; out.capUp = antMax() === base + 2 && antCapFor('engineer') === Math.floor((base + 2) / 2); Save.data.meta = {}; var CAP = antCapFor('engineer');
  var am = antMax; antMax = function(){ return 1; }; out.capMin = antCapFor('engineer') === 1; antMax = am;
  out.price = antCost('engineer') === 2 && antCost('soldier') === 1 && antCostMany('engineer', 1) === 2 && antCostMany('engineer', 2) === Math.round((1 * 2 + 1.3 * 2) * 10) / 10;
  /* 3. hiring: Hire 1/5/10 through the page code, all or nothing, never past half the cap, and not until it is unlocked */
  out.hire5 = hireAntMany('engineer', 5) === true && Save.data.ants.engineer === 5; Save.data.food = 1000; hireAntMany('engineer', CAP - 5); out.hireCap = Save.data.ants.engineer === CAP && hireAntMany('engineer', 1) === false && Save.data.ants.engineer === CAP;
  var food0 = Save.data.food; Save.data.ants.engineer = 0; Save.data.food = 100; unlock(false); Save.data.ants.engineer = 0; out.hireLocked = hireAntMany('engineer', 1) === false && Save.data.ants.engineer === 0;
  unlock(true); Save.data.ants.engineer = 0; Save.data.food = 3; out.hirePoor = hireAntMany('engineer', 2) === false; Save.data.food = 100;
  /* 4. a run: engineers appear, one at a time on the respawn timer, up to what she owns, and nothing is made without the garage */
  startRun(1); G.state = 'playing'; G.attract = false; G.enemies.length = 0; Save.data.ants.engineer = 3;
  var tick = function(n, dt){ for (var i = 0; i < n; i++){ G.enemies.length = G.enemies.filter(function(e){ return e.keep; }).length ? G.enemies.length : 0; updateAnts(dt || 0.05); } };
  updateAnts(0.05); out.initLists = Array.isArray(G.engineers) && Array.isArray(G.antTurrets) && G.engineers.length === 0;
  G.engTimer = 0; updateAnts(0.05); out.spawn1 = G.engineers.length === 1; G.engTimer = 0; updateAnts(0.05); G.engTimer = 0; updateAnts(0.05); G.engTimer = 0; updateAnts(0.05); out.spawnCap = G.engineers.length === 3;
  var ants0 = G.ants.length; out.notInAnts = G.ants.every(function(a){ return a.type !== 'engineer'; });
  /* 5. building: it drives to a site, builds for the build time, health follows 0.04 + 0.96 p^3, and the turret then shoots */
  G.engineers.length = 3; G.engineers.splice(1); G.antTurrets.length = 0; var eng = G.engineers[0]; eng.cool = 0; eng.state = 'wait'; P.x = ARENA_W / 2; P.y = ARENA_H / 2;
  var guard = 0; while (!G.antTurrets.length && guard++ < 400) updateAnts(0.05);
  var tur = G.antTurrets[0]; out.siteMade = !!tur && !tur.done && eng.state === 'build' && tur.builder === eng && Math.hypot(tur.x - P.x, tur.y - P.y) <= ENG.siteMax + 30 && Math.hypot(tur.x - P.x, tur.y - P.y) >= ENG.siteMin - 30;
  var hp0 = tur.hp; for (var i = 0; i < 20; i++) updateAnts(0.05); var p1 = tur.progress; out.progress = p1 > 0.2 && p1 < 0.5 && Math.abs(tur.progress - 1.0 / engBuildTime() * 1.0) < 0.05;
  out.hpCurve = Math.abs(tur.hp - tur.maxHp * turretHpFrac(tur.progress)) < tur.maxHp * 0.01 && tur.hp > hp0 && turretHpFrac(0.5) < 0.17 && turretHpFrac(0.9) > 0.7 && Math.abs(turretHpFrac(1) - 1) < 1e-9 && Math.abs(turretHpFrac(0) - 0.04) < 1e-9;
  /* 6. abandoning: an enemy inside half the keep-away distance, and the turret stays as it is */
  var foe = spawnEnemy('hyena', eng.x + 120, eng.y, 1); out.foeMade = !!foe; var pr = tur.progress, frac = turretHpFrac(pr);
  updateAnts(0.05);
  out.abandon = eng.state === 'flee' && tur.builder === null && !tur.done && Math.abs(tur.progress - pr) < 0.02 && Math.abs(tur.hp - tur.maxHp * frac) < tur.maxHp * 0.05;
  var d0 = Math.hypot(eng.x - foe.x, eng.y - foe.y); for (var i = 0; i < 10; i++){ foe.x = foe.x; updateAnts(0.05); } out.flees = Math.hypot(eng.x - foe.x, eng.y - foe.y) > d0 + 40;
  /* an enemy only inside the full distance (not the half) does NOT stop a build in progress, but does stop a new one starting */
  foe.dead = true; G.enemies.length = 0; Grid.build(G.enemies); eng.state = 'wait'; eng.cool = 0;
  /* 7. finishing: the same engineer (or another) goes back to the unfinished one before starting a new one */
  guard = 0; while (!tur.done && guard++ < 600) updateAnts(0.05);
  out.finished = tur.done === true && G.antTurrets.length === 1 && tur.hp > tur.maxHp * 0.99;
  /* 8. shooting: a finished turret fires at an enemy in range, the shot is credited to "turrets", and out of range it holds fire */
  G.projectiles.length = 0; var far = spawnEnemy('hyena', tur.x + 900, tur.y, 1); tur.atk = 0; tur.scanT = 0; updateAnts(0.05); updateAnts(0.05); out.holdFire = G.projectiles.length === 0;
  far.dead = true; G.enemies.length = 0; var near = spawnEnemy('hyena', tur.x + 220, tur.y, 1); tur.atk = 0; tur.scanT = 0; for (var i = 0; i < 4; i++) updateAnts(0.05);
  out.shoots = G.projectiles.length >= 1 && G.projectiles[0].src === 'turrets' && Math.abs(G.projectiles[0].dmg - ENG_TURRET.dmg * antPower() * antDmgMul()) < 1e-9 && Math.abs(tur.ang - Math.atan2(near.y - tur.y, near.x - tur.x)) < 0.2;
  out.reportLabel = srcInfo('turrets', []).name === 'Ant turrets';
  /* 9. enemies go for turrets and engineers like other ants (within 150 px) */
  G.enemies.length = 0; var q = spawnEnemy('hyena', tur.x + 90, tur.y + 20, 1); P.x = tur.x + 600; P.y = tur.y; var tg = antAggroTarget(q); out.aggro = tg === tur;
  var q2 = spawnEnemy('hyena', tur.x + 900, tur.y, 1); out.noAggroFar = antAggroTarget(q2) !== tur;
  /* 10. destroyed: touching enemies wear it down and it is removed */
  tur.hp = 1; tur.hurt = 0; tur.scanT = 0; q.x = tur.x; q.y = tur.y; Grid.build(G.enemies); for (var i = 0; i < 4; i++) updateAnts(0.05);
  out.destroyed = tur.dead === true && G.antTurrets.indexOf(tur) < 0;
  /* 11. an unfinished turret is a weak decoy: only a little health, and it never shoots */
  G.enemies.length = 0; var w = engNewTurret(P.x + 300, P.y); engSetProgress(w, 0.3); w.atk = 0; w.scanT = 0; G.projectiles.length = 0; var tgt = spawnEnemy('hyena', w.x + 100, w.y, 1); for (var i = 0; i < 4; i++) updateAnts(0.05);
  out.weakNoFire = G.projectiles.length === 0 && w.hp < w.maxHp * 0.06 && !w.done;
  /* 12. the safety cap: unfinished ones with nobody working go first */
  G.antTurrets.length = 0; for (var i = 0; i < 70; i++){ var d = engNewTurret(100 + i * 5, 100); d.done = true; } for (var i = 0; i < 5; i++) engNewTurret(900 + i * 5, 900); var keep = G.antTurrets.length;
  for (var i = 0; i < 20; i++) engNewTurret(1500 + i * 5, 1500);
  out.cap80 = G.antTurrets.length === ENG.turretCap && G.antTurrets.filter(function(t){ return t.done; }).length === 70 && keep === 75;
  /* 13. a new run starts clean, and old saves with no engineer key work */
  var oldAnts = G.ants; startRun(1); G.state = 'playing'; updateAnts(0.05); out.freshRun = G.engineers.length === 0 && G.antTurrets.length === 0 && G.ants !== oldAnts;
  Save.data.ants = { soldier: 2, distractor: 1, shooter: 1 }; unlock(true); Save.data.ants = { soldier: 2, distractor: 1, shooter: 1 }; var okOld = true; try { showShop('ants'); updateAnts(0.05); } catch (e) { okOld = false; } out.oldSave = okOld && /Engineer Ant/.test(document.body.textContent) && hireAntMany('engineer', 1) === true;
  /* 14. the Ants page: a locked bay, then the open one with its stats, its half cap, and rovers drawn in it */
  unlock(false); showShop('ants'); var lk = $('.aproom.eng.locked'); out.bayLocked = !!lk && /Engineer Garage/.test(lk.textContent) && !lk.querySelector('canvas') && !lk.querySelector('[data-a^="ant-hire-engineer"]');
  unlock(true); Save.data.ants.engineer = 3; showShop('ants'); var bay = $('.aproom.eng'); for (var i = 0; i < 8; i++) antsLoop(1000 + i * 50);
  out.bayOpen = !!bay && !bay.classList.contains('locked') && new RegExp('3 / ' + CAP).test(bay.textContent) && /Turret range/.test(bay.textContent) && /Keeps away/.test(bay.textContent) && /Build time/.test(bay.textContent) && !!bay.querySelector('canvas[data-ant="engineer"]');
  var hb = bay.querySelectorAll('.arbtns .btn'); out.bayButtons = hb.length === 3 && !hb[0].disabled && hb[1].disabled === (3 + 5 > CAP) && hb[2].disabled === (3 + 10 > CAP) && /2 food|2\.6 food|2\.2|food/.test(hb[0].textContent);
  var cv = bay.querySelector('canvas'), dd = cv.getContext('2d').getImageData(0, 0, cv.width, cv.height).data, nz = 0; for (var i = 0; i < dd.length; i += 4 * 41) if (dd[i + 3] > 0) nz++; out.bayDrawn = nz > 120;
  GR.handleAction('ant-hire-engineer-1'); out.bayHire = Save.data.ants.engineer === 4; Save.data.food = 1000; GR.handleAction('ant-hire-engineer-' + (CAP > 8 ? 5 : 1)); GR.handleAction('ant-hire-engineer-5'); var left = CAP - Save.data.ants.engineer; out.bayNoRoom = hireAntMany('engineer', left + 1) === false;
  /* 15. the three upgrades: in the Ants group, locked without the garage, effects as written */
  unlock(false); Save.data.gold = 1e9; var up = ['engspeed', 'engturhp', 'engrange'];
  out.upDefs = up.every(function(id){ return !!METAMAP[id] && UPG_GROUPS.filter(function(g){ return g.id === 'ants'; })[0].ids.indexOf(id) >= 0 && upgLocked(METAMAP[id]); });
  buyUpgrade('engspeed'); buyUpgradeMax('engturhp'); upgBuyMany('engrange', 1); out.upLocked = metaLevel('engspeed') === 0 && metaLevel('engturhp') === 0 && metaLevel('engrange') === 0;
  showShop('upgrades'); GR.handleAction('upg-g-ants'); out.upLockedUi = !!$('.uprow[data-up="engspeed"].locked') && /Engineer Garage/.test($('.uprow[data-up="engspeed"]').textContent);
  unlock(true); Save.data.gold = 1e9; Save.data.meta = {}; var bt0 = engBuildTime(), th0 = turretHpMul(), tr0 = turretRange();
  buyUpgrade('engspeed'); buyUpgrade('engturhp'); upgBuyMany('engrange', 2);
  out.upEffects = metaLevel('engspeed') === 1 && Math.abs(engBuildTime() - bt0 * 0.88) < 1e-9 && Math.abs(turretHpMul() - th0 - 0.15) < 1e-9 && Math.abs(turretRange() - tr0 * 1.16) < 1e-6 && METAMAP.engspeed.desc(2) === 'Turrets are built 23% faster';
  Save.data.meta = {}; Save.data.gold = 1e9; upPlan = upgPlanAll(); out.planUnlocked = !!upPlan.add.engspeed; unlock(false); Save.data.gold = 1e9; out.planLocked = !upgPlanAll().add.engspeed;
  /* 16. drawing: engineers, turrets (built and unbuilt) and shadows draw without trouble */
  unlock(true); startRun(1); G.state = 'playing'; Save.data.ants.engineer = 2; G.engTimer = 0; updateAnts(0.05); G.engTimer = 0; updateAnts(0.05); var t1 = engNewTurret(P.x + 200, P.y); t1.done = true; var t2 = engNewTurret(P.x - 200, P.y); engSetProgress(t2, 0.5);
  var cv2 = document.createElement('canvas'); cv2.width = 600; cv2.height = 400; var c2 = cv2.getContext('2d'); c2.translate(300 - P.x, 200 - P.y); G.camX = P.x; G.camY = P.y; var drew = true; try { drawAntShadows(c2); drawAnts(c2); } catch (e) { drew = false; out.errs.push('draw ' + e.message); }
  var px = c2.getImageData(0, 0, 600, 400).data, cnt = 0; for (var i = 3; i < px.length; i += 4 * 53) if (px[i] > 0) cnt++; out.draws = drew && cnt > 30;
  /* 17. cost of a crowd: 60 turrets and 30 enemies are cheap to update */
  G.antTurrets.length = 0; for (var i = 0; i < 60; i++){ var tt = engNewTurret(200 + (i % 10) * 150, 200 + Math.floor(i / 10) * 150); tt.done = true; } G.enemies.length = 0; for (var i = 0; i < 30; i++) spawnEnemy('hyena', 300 + i * 40, 500 + (i % 5) * 60, 1);
  Grid.build(G.enemies); var t0 = performance.now(); for (var i = 0; i < 100; i++) updateAnts(0.016); var per = (performance.now() - t0) / 100; out.perf = per < 8; out.perfMs = Math.round(per * 100) / 100;
  /* pictures */
  if (view !== 'none'){
    G.state = 'shop'; shopTab = 'ants';
    if (view === 'locked'){ unlock(false); Save.data.ants = { soldier: 4, distractor: 3, shooter: 5 }; Save.data.engineers = 0; }
    else { unlock(true); Save.data.ants = { soldier: 4, distractor: 3, shooter: 5, engineer: 3 }; }
    showShop('ants'); for (var k = 0; k < 40; k++) antsLoop(1000 + k * 45);
    if (view === 'field'){ startRun(1); G.state = 'playing'; Save.data.ants.engineer = 3; G.enemies.length = 0; for (var k = 0; k < 3; k++){ G.engTimer = 0; GR.step(0.05); } for (var k = 0; k < 700; k++){ G.levelGate = 1e9; P.hp = P.maxHp; GR.step(0.05); } }
  }
} catch (e) { out.errs.push('threw: ' + e.message + ' ' + (e.stack || '').split('\n')[1]); }
var need = ['lockedAtFirst', 'needCh9', 'canBuy', 'needRover', 'cap', 'capUp', 'capMin', 'price', 'hire5', 'hireCap', 'hireLocked', 'hirePoor', 'initLists', 'spawn1', 'spawnCap', 'notInAnts', 'siteMade', 'progress', 'hpCurve', 'foeMade', 'abandon', 'flees', 'finished', 'holdFire', 'shoots', 'reportLabel', 'aggro', 'noAggroFar', 'destroyed', 'weakNoFire', 'cap80', 'freshRun', 'oldSave', 'bayLocked', 'bayOpen', 'bayButtons', 'bayDrawn', 'bayHire', 'bayNoRoom', 'upDefs', 'upLocked', 'upLockedUi', 'upEffects', 'planUnlocked', 'planLocked', 'draws', 'perf'];
out.pass = out.errs.length === 0 && need.every(function(k){ return out[k] === true; });
QA.done(out);
