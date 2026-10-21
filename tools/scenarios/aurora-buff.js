/* Aurora must stop at unequip, swap and run boundaries; pausing freezes game time. */
GR.handleAction('splash-go');
(function(){
  var out = { failed: [], snapshots: [] }, check = function(k,v){ if(!v) out.failed.push(k); };
  Save.data.equippedTrinkets = []; Save.data.meta = {};
  ['aurora:cape','herdhide:cape'].forEach(grantGear);
  function snap(step){ out.snapshots.push({step:step,t:GearFx.auroraT,xp:P.stats.xpMul,state:G.state}); }
  function activate(){
    GR.startRun(1); G.introFX = null; G.enemies.length = 0; P.invuln = 99;
    equipGear('aurora:cape'); gfxReset(); P.vx=P.vy=0;
    for(var i=0;i<125;i++){ G.time+=1/60; gearFxTick(1/60); }
    check('buff activates',GearFx.auroraT > 5); snap('active');
  }
  activate(); var boosted=P.stats.xpMul;
  showPause(); var frozen=GearFx.auroraT; gearFxTick(1); check('pause freezes timer',GearFx.auroraT===frozen); snap('pause');
  resumeGame(); unequipSlot('cape'); snap('unequipped');
  check('unequip clears timer',GearFx.auroraT===0); check('unequip removes bonus',P.stats.xpMul < boosted);
  equipGear('aurora:cape'); snap('reworn'); check('rewear cannot revive buff',GearFx.auroraT===0);
  activate(); equipGear('herdhide:cape'); snap('swapped'); check('swap clears timer',GearFx.auroraT===0);
  activate(); gameOver(); snap('run ended'); check('death clears timer',GearFx.auroraT===0);
  GR.startRun(1); snap('new run before first tick'); check('start clears timer immediately',GearFx.auroraT===0);
  activate(); chapterComplete(); snap('chapter ended'); check('chapter clears timer',GearFx.auroraT===0);
  activate(); GR.startRun(1); snap('restart while active'); check('restart clears timer',GearFx.auroraT===0);
  showShop('gear'); snap('shop');
  check('shop has no lingering bonus',GearFx.auroraT===0);
  gearPage.slot='cape'; gearPage.hover='herdhide:cape'; gearSyncSelection();
  out.panel = document.querySelector('#gearSide').textContent;
  out.pass=!out.failed.length; QA.done(out);
})();
