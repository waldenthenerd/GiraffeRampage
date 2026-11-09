/* The Challenge Workshop add-on (js/addons/50a-50c, written by Codex): off it leaves no trace, on it gives the workshop; DOM actions and campaign isolation.
   Run: node tools/qa-cloud.mjs tools/scenarios/challenge-builder.js --wait 60000 [--shot workshop.png]; also --touch at 390x844 and 844x390. */
GR.handleAction('splash-go');
var addonOff = { listed: addonsList().some(function(a){ return a.id === 'challenges'; }) && !addonOn('challenges') };
GR.showMenu(); addonOff.noButton = !document.querySelector('[data-a="challenge-open"]');
addonOff.noGuide = GUIDE_TOPICS.filter(function(t){ return t.id === 'challenges'; }).every(function(t){ return !t.show(); });
GR.handleAction('challenge-open'); addonOff.noOpen = !document.querySelector('#challengeBuilder') && !document.getElementById('cbStyle');
/* sharing is by code only: a challenge in the page's address does nothing */
history.replaceState(null,'',location.pathname+location.search+'#challenge='+encodeURIComponent(GRChallengeData.encode(GRChallengeData.templates[1].level)));
GR.showMenu(); addonOff.noLinkOffer = !document.getElementById('cbLinkOffer') && !document.querySelector('#challengeBuilder');
history.replaceState(null,'',location.pathname+location.search);
addonSet('challenges', true);
(function(){
  var out={failed:[]},check=function(name,value){if(!value)out.failed.push(name);};
  var libraryKey='giraffe_rampage_challenges_v1',previous=localStorage.getItem(libraryKey);
  var campaign=JSON.stringify(Save.data),stored=localStorage.getItem(GRSave.key),state=G.state;
  function find(q){return document.querySelector('#challengeBuilder '+q);}
  function click(a){var b=find('[data-cb="'+a+'"]');if(!b)throw Error('Missing action '+a);b.click();}
  function edit(path,value,inputOnly){var el=find('[data-path="'+path+'"]');el.value=value;el.dispatchEvent(new Event(inputOnly?'input':'change',{bubbles:true}));}
  function importLevel(l){find('#cbCode').value=GRChallengeData.encode(l);click('import');}
  /* the Copy button packs after a short wait (timers do not run in this test page), so the scenario makes the same code the same way */
  function await_share(){var v=GRChallengeData.validate(JSON.parse(JSON.stringify(GRChallengeUI.level())));find('#cbCode').value=GRChallengeData.shareCode(v);}
  function returnToBuilder(){var b=Array.from(document.querySelectorAll('#challengePlay button')).find(function(n){return n.textContent==='Back to builder';});if(!b)throw Error('No play return button');b.click();}
  try{
    GR.showMenu();document.querySelector('[data-a="challenge-open"]').click();
    check('menu opens modal',document.querySelector('#challengeBuilder').open);
    check('original game style classes',find('h1').classList.contains('display')&&find('.cb-card').classList.contains('slab')&&Array.from(document.querySelectorAll('#challengeBuilder button')).every(function(b){return b.classList.contains('btn');}));
    addonSet('challenges',false);check('off closes the workshop',!document.querySelector('#challengeBuilder').open);GR.showMenu();check('off hides the button',!document.querySelector('[data-a="challenge-open"]'));
    addonSet('challenges',true);GR.showMenu();document.querySelector('[data-a="challenge-open"]').click();check('on again reopens',document.querySelector('#challengeBuilder').open);
    /* tabs: one section at a time */
    click('tab-waves');check('tab shows waves only',find('[data-tab="waves"].cb-card').offsetParent!==null&&find('[data-tab="recipe"].cb-card').offsetParent===null);
    click('tab-arena');check('arena tab shows the canvas',find('#cbCanvas').offsetParent!==null);
    /* drag to move with the Select tool, then Undo */
    (function(){
      var cv=find('#cbCanvas');find('#cbTemplates').value=String(GRChallengeData.templates.findIndex(function(t){return t.name==='Dusk garden';}));click('template');
      click('tool-select');cv=find('#cbCanvas');var r=cv.getBoundingClientRect(),sx=r.width/960,sy=r.height/640;
      var ev=function(type,x,y){cv.dispatchEvent(new PointerEvent(type,{bubbles:true,pointerId:7,clientX:r.left+x*sx,clientY:r.top+y*sy,isPrimary:true}));};
      var before=Array.from(document.querySelectorAll('#challengeBuilder .cb-object-list span')).length;
      var first=document.querySelector('#challengeBuilder [data-cb="select-0"]').textContent;
      var m=/\((\d+), (\d+)\)/.exec(first),ox=+m[1],oy=+m[2];
      ev('pointerdown',ox+5,oy+5);ev('pointermove',ox+5+100,oy+5);ev('pointerup',ox+5+100,oy+5);
      var after=document.querySelector('#challengeBuilder [data-cb="select-0"]').textContent;
      check('drag moves an object, snapped to the grid',after.indexOf('('+(Math.round((ox+100)/40)*40)+', '+(Math.round(oy/40)*40)+')')>=0);
      click('undo');check('undo puts a dragged object back',document.querySelector('#challengeBuilder [data-cb="select-0"]').textContent===first);
      click('tool-wall');
    })();
    /* drafts: saving again after an edit updates the same draft */
    (function(){
      localStorage.setItem(libraryKey,'[]');click('save');edit('title','Edited name');click('save');
      var list=GRChallengeData.listDrafts();check('saving after an edit updates the draft',list.length===1&&list[0].title==='Edited name');
      click('save-copy');check('save as copy adds one',GRChallengeData.listDrafts().length===2);
      localStorage.setItem(libraryKey,'[]');click('tab-recipe');
    })();
    check('share requires local clear',find('[data-cb="copy"]').disabled);
    importLevel(GRChallengeData.defaults());
    var original=find('[data-path="title"]').value;
    edit('title','A giraffe made this',true);click('undo');check('undo recipe edit',find('[data-path="title"]').value===original);
    click('redo');check('redo recipe edit',find('[data-path="title"]').value==='A giraffe made this');
    click('add-wave');check('add wave',document.querySelectorAll('#challengeBuilder .cb-wave').length===2);
    click('dup-0');check('duplicate wave',document.querySelectorAll('#challengeBuilder .cb-wave').length===3);
    click('down-0');click('up-1');click('delwave-2');click('undo');check('undo wave removal',document.querySelectorAll('#challengeBuilder .cb-wave').length===3);
    click('group-0');check('enemy groups',document.querySelectorAll('#challengeBuilder .cb-wave')[0].querySelectorAll('.cb-group').length===2);
    click('tool-wall');find('#cbX').value='160';find('#cbY').value='160';find('#cbWidth').value='40';find('#cbHeight').value='40';click('place');check('coordinate placement',find('.cb-object-list').textContent.includes('wall (160, 160)'));
    click('undo');check('undo placement',!find('.cb-object-list').textContent.includes('wall (160, 160)'));click('redo');
    find('#cbTemplates').value='0';click('template');check('template loads',find('[data-path="title"]').value===GRChallengeData.templates[0].level.title);
    var before=find('[data-path="title"]').value;find('#cbCode').value='GRC1:broken';click('import');
    check('bad import preserves editor',find('[data-path="title"]').value===before&&find('#cbNotice').classList.contains('cb-error'));
    var level=GRChallengeData.defaults();level.title='UI survival check';level.seed=4294967295;level.objective={type:'survive',target:1};level.waves[0].enemies[0].count=1;
    importLevel(level);check('import exact seed',Number(find('[data-path="seed"]').value)===4294967295);
    edit('appearance.time','night');edit('appearance.weather','drizzle');edit('appearance.detail','2');edit('modifiers.playerSpeed','1.4');edit('modifiers.attackRate','1.5');
    check('import is not trusted proof',find('[data-cb="copy"]').disabled);
    click('save');check('draft saved',find('#cbDrafts').textContent.includes(level.title));
    click('play');check('play opens isolated modal',!!document.querySelector('#challengePlay')&& !document.querySelector('#challengeBuilder').open);
    var result=GRChallengePlay.advance(1.1);check('survival win',result.ended&&result.result.won);returnToBuilder();
    check('return opens builder',document.querySelector('#challengeBuilder').open);
    check('exact local clear unlocks sharing',!find('[data-cb="copy"]').disabled);
    check('no link buttons',!find('[data-cb="link"]')&&!find('[data-cb="hash"]'));
    await_share();var code=find('#cbCode').value,shared=GRChallengeData.decode(code);check('shared recipe roundtrip',shared.seed===4294967295);
    check('share code is GR3-packed and smaller',/^GRC3:/.test(code)&&code.length<GRChallengeData.encode(shared).length);
    check('environment and balance options roundtrip',shared.appearance.time==='night'&&shared.appearance.weather==='drizzle'&&shared.appearance.detail===2&&shared.modifiers.playerSpeed===1.4&&shared.modifiers.attackRate===1.5);
    edit('title','Uncommitted input edit',true);check('input immediately revokes proof before blur',find('[data-cb="copy"]').disabled);
    click('play');GRChallengePlay.advance(1.1);returnToBuilder();await_share();
    check('new share code after the edit',GRChallengeData.decode(find('#cbCode').value).title==='Uncommitted input edit');
    find('#cbCode').value='https://example.test/#challenge='+encodeURIComponent(find('#cbCode').value);click('import');check('a link is refused',find('#cbNotice').classList.contains('cb-error')&&/share code/.test(find('#cbNotice').textContent));
    click('add-wave');check('wave edit revokes proof',find('[data-cb="copy"]').disabled);
    importLevel(GRChallengeData.defaults());edit('title','UI object editing');click('tool-tree');find('#cbWidth').value='120';find('#cbHeight').value='80';find('#cbX').value='920';find('#cbY').value='600';click('place');
    check('placement dimensions clamp inside arena',find('.cb-object-list').textContent.includes('tree (840, 560)'));
    click('select-0');find('#cbX').value='720';find('#cbY').value='440';find('#cbWidth').value='160';click('apply');click('clone');click('save');
    var objectDraft=GRChallengeData.decode(GRChallengeData.listDrafts().find(function(d){return d.title==='UI object editing';}).code);
    check('move resize duplicate persist',objectDraft.objects.length===2&&objectDraft.objects[0].x===720&&objectDraft.objects[0].w===160&&objectDraft.objects[1].x===760);
    var gridButton=find('[data-cb="grid"]'),gridWas=gridButton.getAttribute('aria-pressed');click('grid');check('editor-only grid toggles',gridButton.getAttribute('aria-pressed')!==gridWas);
    ['courtyard','slalom','fire'].forEach(function(name){
      click('layout-'+name);check('validated decorated layout '+name,find('.cb-object-list').textContent.includes('banner')&&find('#cbNotice').textContent.includes('Applied layout recipe'));
      edit('title','Layout check '+name,true);click('save');
      var layout=GRChallengeData.decode(GRChallengeData.listDrafts().find(function(d){return d.title==='Layout check '+name;}).code);
      check('layout and scenery persist '+name,layout.objects.some(function(o){return o.kind==='heal';})&&layout.objects.some(function(o){return o.kind==='tree';})&&layout.objects.some(function(o){return o.kind==='banner';})&&layout.objects.every(function(o){return o.w<=320&&o.h<=320;}));
    });
    click('preset-swarm');click('preset-ambush');click('preset-finale');check('wave recipes append',document.querySelectorAll('#challengeBuilder .cb-wave').length===4);
    var customLevel=GRChallengeData.defaults();customLevel.title='UI custom object';customLevel.objective={type:'survive',target:1};customLevel.waves[0].enemies[0].count=1;importLevel(customLevel);
    edit('arena.theme','forest');edit('appearance.palette','custom');edit('appearance.colors.ground','#bb8866');edit('appearance.colors.accent','#eeddbb');edit('appearance.colors.foliage','#668844');
    click('asset-new');edit('customAssets.0.name','Golden lantern');click('asset-add');edit('customAssets.0.parts.1.color','#ffdd88');edit('customAssets.0.parts.1.rotation','30');edit('customAssets.0.parts.1.opacity','0.6');edit('customAssets.0.parts.1.stroke','#654321');edit('customAssets.0.parts.1.strokeWidth','2');
    check('two-layer custom maker',document.querySelectorAll('#challengeBuilder .cb-part').length===2&&!!find('#cbMakerCanvas'));
    check('designer has full-width section',!find('#cbMaker').closest('.cb-columns')&&find('#cbMaker').closest('.cb-card').classList.contains('slab'));
    var solid=find('[data-path="customAssets.0.solid"]');solid.checked=true;solid.dispatchEvent(new Event('change',{bubbles:true}));
    click('tool-custom');find('#cbX').value='80';find('#cbY').value='80';find('#cbWidth').value='80';find('#cbHeight').value='120';click('place');
    check('named solid object placement',find('.cb-object-list').textContent.includes('Golden lantern [solid]'));
    click('select-0');find('#cbWidth').value='120';click('apply');click('clone');
    find('#cbX').value='480';find('#cbY').value='320';find('#cbWidth').value='40';find('#cbHeight').value='40';click('place');check('custom solid spawn guard',find('#cbNotice').textContent.includes('breathing room'));
    click('asset-delete');check('in-use asset deletion refused',find('#cbNotice').textContent.includes('in use')&&!!find('[data-path="customAssets.0.name"]'));
    click('play');GRChallengePlay.advance(1.1);returnToBuilder();await_share();
    var customShared=GRChallengeData.decode(find('#cbCode').value);
    check('custom art biome palette roundtrip',customShared.arena.theme==='forest'&&customShared.appearance.palette==='custom'&&customShared.appearance.colors.ground==='#bb8866'&&customShared.customAssets[0].name==='Golden lantern'&&customShared.customAssets[0].parts.length===2&&customShared.customAssets[0].parts[1].rotation===30&&customShared.objects.length===2&&customShared.objects[0].w===120&&customShared.objects[1].asset===customShared.customAssets[0].id);
    check('layer fill and outline roundtrip',customShared.customAssets[0].parts[1].opacity===0.6&&customShared.customAssets[0].parts[1].stroke==='#654321'&&customShared.customAssets[0].parts[1].strokeWidth===2&&customShared.customAssets[0].parts[0].opacity===1&&customShared.customAssets[0].parts[0].strokeWidth===0);
    var checkerButton=find('[data-cb="checker"]'),checkerWas=checkerButton.getAttribute('aria-pressed');click('checker');check('checkerboard is editor-only',checkerButton.getAttribute('aria-pressed')!==checkerWas&&!find('[data-cb="copy"]').disabled);
    edit('customAssets.0.parts.1.color','#ffcc77',true);check('shape edit revokes sharing proof',find('[data-cb="copy"]').disabled);click('undo');check('shape undo keeps proof revoked',find('[data-cb="copy"]').disabled);
    ['center','mirror','duplicate'].forEach(function(action){click('play');GRChallengePlay.advance(1.1);returnToBuilder();check('clear ready before '+action,!find('[data-cb="copy"]').disabled);click('asset-'+action+'-1');check(action+' revokes clear',find('[data-cb="copy"]').disabled);});
    edit('customAssets.0.parts.1.w','101',true);check('inline validity reports bad shape',find('#cbValidation').classList.contains('cb-error')&&find('#cbValidation').textContent.length>10);edit('customAssets.0.parts.1.w','50',true);check('inline validity recovers',!find('#cbValidation').classList.contains('cb-error'));
    click('biome-colors');var forestColors=GRChallengePlay.getPalette({arena:{theme:'forest'},appearance:{palette:'biome'}});check('biome colours copied from biome not custom palette',find('[data-path="appearance.palette"]').value==='custom'&&find('[data-path="appearance.colors.ground"]').value===forestColors.ground);
    ['lantern','crate','crystal'].forEach(function(kind){click('asset-starter-'+kind);check(kind+' starter added',find('#cbMakerCanvas')&& !find('#cbValidation').classList.contains('cb-error'));});
    edit('title','UI detail actions',true);click('save');var detailDraft=GRChallengeData.decode(GRChallengeData.listDrafts().find(function(d){return d.title==='UI detail actions';}).code);
    check('layer actions and starter designs persist',detailDraft.customAssets.length===4&&detailDraft.customAssets[0].parts.length===3&&detailDraft.customAssets[0].parts[1].x===25&&detailDraft.customAssets[0].parts[1].y===25&&detailDraft.customAssets[0].parts[1].rotation===-30&&detailDraft.customAssets.some(function(a){return a.name==='Timber crate'&&a.solid;}));
    check('share status says what to do',/share code/.test(find('#cbShareInfo').textContent));
    check('enemy stats and wave summary visible',find('.cb-roster').textContent.includes('HP')&&find('#cbWaveSummary0').textContent.includes('enemies'));
    check('campaign state isolated',JSON.stringify(Save.data)===campaign&&localStorage.getItem(GRSave.key)===stored&&G.state===state);
    var r=document.querySelector('#challengeBuilder').getBoundingClientRect();check('fits viewport',r.width<=innerWidth+1&&r.height<=innerHeight+1);
    check('enemy speed labelled honestly',find('[data-path="modifiers.speed"]').parentNode.textContent.includes('Enemy speed'));
    /* the options added after the first version: start, objective, kit, modifiers, new objects, layouts, wave timing, elites, spacing, random entrances */
    importLevel(GRChallengeData.defaults());edit('title','UI new options');
    edit('arena.theme','cave');edit('arena.start','northeast');check('start position chosen',GRChallengeUI.level().arena.start==='northeast');
    check('new tools listed',['water','boost','crate','spikes'].every(function(k){return !!find('[data-cb="tool-'+k+'"]');}));
    click('tool-crate');find('#cbX').value='160';find('#cbY').value='160';find('#cbWidth').value='80';find('#cbHeight').value='80';click('place');check('crate placed',find('.cb-object-list').textContent.includes('crate (160, 160)'));
    click('tool-spikes');find('#cbX').value='800';find('#cbY').value='80';find('#cbWidth').value='80';find('#cbHeight').value='80';click('place');check('spikes refused on the moved start',find('#cbNotice').textContent.includes('breathing room'));
    edit('objective.type','hunt');edit('objective.target','3');edit('objective.limit','60');check('hunt and time limit described',/Defeat 3/.test(find('#cbGoal').textContent)&&/Time limit: 60/.test(find('#cbGoal').textContent));
    edit('loadout','ranger');edit('modifiers.regen','2');edit('modifiers.playerHp','1.5');check('kit text uses the new multipliers',/120 HP/.test(find('#cbKit').textContent)&&/heals 2 HP/.test(find('#cbKit').textContent));
    edit('appearance.weather','storm');edit('appearance.time','dawn');
    var elite=find('[data-path="waves.0.enemies.0.elite"]');elite.checked=true;elite.dispatchEvent(new Event('change',{bubbles:true}));
    edit('waves.0.enemies.0.stagger','0.5');edit('waves.0.enemies.0.spawn','random');
    click('add-wave');edit('waves.1.after','timer');check('wave summary names elites, spacing, random edges and the timer',/elite/.test(find('#cbWaveSummary0').textContent)&&/one every 0.5s/.test(find('#cbWaveSummary0').textContent)&&/any edge/.test(find('#cbWaveSummary0').textContent)&&/after the wave before it began/.test(find('#cbWaveSummary1').textContent));
    click('save');var opts=GRChallengeData.decode(GRChallengeData.listDrafts().find(function(d){return d.title==='UI new options';}).code);
    check('new options persist',opts.arena.theme==='cave'&&opts.arena.start==='northeast'&&opts.objective.type==='hunt'&&opts.objective.limit===60&&opts.loadout==='ranger'&&opts.modifiers.regen===2&&opts.appearance.weather==='storm'&&opts.waves[0].enemies[0].elite===true&&opts.waves[0].enemies[0].stagger===0.5&&opts.waves[1].after==='timer'&&opts.objects.some(function(o){return o.kind==='crate';}));
    click('play');var hunted=GRChallengePlay.advance(60);check('hunt playtest ends',hunted.ended);returnToBuilder();
    ['moat','crates','gauntlet'].forEach(function(name){click('layout-'+name);check('new layout '+name,find('#cbNotice').textContent.includes('Applied layout recipe'));});
    var wavesBefore=document.querySelectorAll('#challengeBuilder .cb-wave').length;click('preset-trickle');click('preset-surround');click('preset-guard');check('new wave presets append',document.querySelectorAll('#challengeBuilder .cb-wave').length===wavesBefore+3);
    if(QA.params.view==='options'){find('#cbTemplates').value=String(GRChallengeData.templates.findIndex(function(t){return t.name===(QA.params.t||'Crate yard');}));click('template');click('tab-arena');find('#cbCanvas').scrollIntoView({block:'center'});}
    if(QA.params.view==='showcase'){
      var decorated=GRChallengeData.templates.findIndex(function(t){return t.level.objects.some(function(o){return o.kind==='tree'||o.kind==='banner';});});
      find('#cbTemplates').value=String(Math.max(0,decorated));click('template');document.querySelector('#challengeBuilder').scrollTop=0;
    }
    if(QA.params.view==='custom'){
      var customTemplate=GRChallengeData.templates.findIndex(function(t){return (t.level.customAssets||[]).some(function(a){return a.parts.length>=2;});});
      find('#cbTemplates').value=String(Math.max(0,customTemplate));click('template');find('#cbMaker').open=true;find('#cbMaker').scrollIntoView({block:'start'});
    }
  }catch(e){out.failed.push('threw: '+e.message+' '+(e.stack||'').split('\n')[1]);}
  finally{
    if(window.GRChallengePlay)GRChallengePlay.stop();
    if(previous===null)localStorage.removeItem(libraryKey);else localStorage.setItem(libraryKey,previous);
    if(!document.querySelector('#challengeBuilder')?.open)GRChallengeUI.open();
  }
  out.addonOff=addonOff;Object.keys(addonOff).forEach(function(k){if(!addonOff[k])out.failed.push('add-on off: '+k);});
  out.pass=!out.failed.length;QA.done(out);
})();
