/* Every piece, slot and rarity, against empty/full/near-complete/trinket/levelled loadouts. */
GR.handleAction('splash-go');
(function(){
  Save.data = freshSave(); P.cards = []; G.attract = false; GearFx.auroraT = 0;
  var out={ failed:[], cases:0, mismatches:[], absoluteDifferences:[] }, check=function(k,v){ if(!v)out.failed.push(k); };
  Object.keys(GEAR_INDEX).forEach(grantGear);
  Object.keys(TRINKETS).forEach(function(id){Save.data.gear['trinket:'+id]=1;});
  var setups=['empty','full','two','trinket','level'].concat(Object.keys(TRINKETS).map(function(id){return 'trinket:'+id;}));
  function actual(lo){ Save.data.equipped=Object.assign({},lo); recalcStats(); return {stats:Object.assign({},P.stats),weapon:Object.assign({},P.weapon)}; }
  setups.forEach(function(setup){Object.keys(GEAR_INDEX).forEach(function(id){
    var p=GEAR_INDEX[id], cur={cape:null,weapon:null,armor:null}; Save.data.gearLv={}; Save.data.equippedTrinkets=[];
    if(setup==='full'||setup==='trinket') GEAR_SLOTS.forEach(function(sl){cur[sl]='herdhide:'+sl;});
    if(setup==='two') GEAR_SLOTS.forEach(function(sl){if(sl!==p.slot)cur[sl]=p.setId+':'+sl;});
    if(setup==='trinket') Save.data.equippedTrinkets=['redrampage','burrowboots','limehelmet'];
    if(setup.indexOf('trinket:')===0) Save.data.equippedTrinkets=[setup.slice(8)];
    if(setup==='level') Save.data.gearLv[id]=3;
    Save.data.equipped=cur; var rows=gearDelta(p.slot,id), alt=Object.assign({},cur); alt[p.slot]=id;
    var a=actual(cur),b=actual(alt); Save.data.equipped=cur;
    rows.filter(function(r){return r.key!=='set';}).forEach(function(r){
      var av=r.key.indexOf('w_')===0?a.weapon[r.key.slice(2)]:a.stats[r.key], bv=r.key.indexOf('w_')===0?b.weapon[r.key.slice(2)]:b.stats[r.key];
      if(Math.abs((bv-av)-(r.to-r.from))>0.00001) out.mismatches.push({setup:setup,id:id,key:r.key,from:r.from,to:r.to,actualFrom:av,actualTo:bv});
      if(Math.abs(av-r.from)>0.00001||Math.abs(bv-r.to)>0.00001) out.absoluteDifferences.push({setup:setup,id:id,key:r.key,from:r.from,to:r.to,actualFrom:av,actualTo:bv});
    });
    var html=gearComparePanel(p.slot,id); check('no unchanged complete-set line '+id,!/3\/3 → 3\/3/.test(html));
    if(setup==='two') check('set completion '+id,rows.some(function(r){return r.key==='set'&&r.from===2&&r.to===3&&r.completes;}));
    out.cases++;
  });});
  check('no untriaged delta mismatch',out.mismatches.every(function(m){return m.setup==='trinket:irongauntlet'&&m.key==='kickKb';}));
  Save.data.equipped={cape:null,weapon:null,armor:null};Save.data.equippedTrinkets=[];Save.data.gearLv={};
  gearPage.slot='armor';gearPage.selected=null;gearPage.hover=null;showShop('gear');
  gearPage.hover='worldspire:armor';gearSyncSelection();check('hover shows panel',!!document.querySelector('#gearSide .gcmp'));
  gearHoverClear();check('leaving returns build',!!document.querySelector('#gearSide .gbuild'));
  gearPage.selected='worldspire:armor';gearSyncSelection();
  var before=document.querySelector('#gearSide').textContent;gearLevelUp('worldspire:armor');gearSyncSelection();
  check('level redraw updates panel',document.querySelector('#gearSide').textContent!==before);
  gearPage.selected=null;gearPage.hover=QA.params.piece||'worldspire:armor';gearSyncSelection();gearPreviewDraw(document.getElementById('gearPreview'),1000);
  if(QA.params.view==='offset'){
    GEAR_SLOTS.forEach(function(sl){Save.data.equipped[sl]='herdhide:'+sl;});Save.data.equippedTrinkets=['redrampage','burrowboots'];recalcStats();
    gearPage.slot='cape';gearPage.hover='thornweave:cape';showShop('gear');gearSyncSelection();gearPreviewDraw(document.getElementById('gearPreview'),1000);
  }
  out.mismatches=out.mismatches.slice(0,20);out.absoluteDifferenceCount=out.absoluteDifferences.length;out.absoluteDifferences=out.absoluteDifferences.slice(0,8);
  out.pass=!out.failed.length;QA.done(out);
})();
