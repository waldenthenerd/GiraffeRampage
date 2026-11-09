'use strict';
/* ADD-ON "Challenge Workshop", part 3 of 3 (see js/addons/50a-addon-challenge-data.js): the workshop dialog (recipe, arena builder, custom-object
   maker, wave director, playtest and sharing), its stylesheet (put in the page the first time it opens, so with the add-on off nothing of it is
   there), and the add-on's way in: a main-menu button, the "challenge-open" action and a Guide topic, each only while the add-on is on.
   Challenge Workshop is separate from the campaign, its saves and its progression. */
const CB_CSS = ".cb-dialog canvas.cb-tool-ico{display:inline-block;aspect-ratio:1;border:0;background:none;width:22px;height:22px;vertical-align:-6px;margin-right:6px}.cb-dialog .cb-group{grid-template-columns:44px 1fr 80px 1fr auto}.cb-dialog canvas.cb-mini{aspect-ratio:1;border-width:1px;width:44px;height:44px;border:1px solid var(--bark2);border-radius:4px;background:var(--soil);align-self:end}.cb-dialog canvas.cb-face{display:block;aspect-ratio:1;border-width:1px;float:left;width:44px;height:44px;margin:0 10px 4px 0;border:1px solid var(--bark2);border-radius:4px;background:var(--soil)}.cb-roster p{overflow:hidden;min-height:46px}@media(max-width:700px){.cb-dialog .cb-group{grid-template-columns:44px 1fr 70px}}\n@media(max-height:520px){#challengePlay{padding:8px 12px!important}#challengePlay h2{font-size:18px;margin:0 0 2px}#challengePlay>p{display:none}#challengePlay>section{margin:2px 0 4px!important}#challengePlay canvas{max-height:calc(100dvh - 128px)!important}#challengePlay>div button{min-height:36px!important}}.cb-status{display:flex;flex-wrap:wrap;gap:8px;margin:8px 0}.cb-status>p{flex:1 1 280px;margin:0!important}.cb-dialog[data-tab]:not([data-tab=recipe]) .cb-intro,.cb-dialog[data-tab]:not([data-tab=recipe]) .cb-eyebrow{display:none}@media(min-width:960px){.cb-dialog[data-tab=arena] .cb-card[data-tab=arena]{display:grid!important;grid-template-columns:minmax(0,1fr) 300px;column-gap:18px;align-items:start}.cb-dialog[data-tab=arena] .cb-card[data-tab=arena]>*{grid-column:2}.cb-dialog[data-tab=arena] .cb-card[data-tab=arena]>#cbCanvas{grid-column:1;grid-row:1/span 30;max-height:calc(94dvh - 290px)}.cb-dialog[data-tab=arena] .cb-card[data-tab=arena] .cb-coords{grid-template-columns:1fr 1fr}}.cb-tabs{display:flex;flex-wrap:wrap;gap:8px;margin:12px 0 4px}.cb-tabs .btn{margin:0}.cb-dialog[data-tab] .cb-columns{display:block}.cb-dialog[data-tab] .cb-card[data-tab]{display:none}.cb-dialog[data-tab=recipe] .cb-card[data-tab=recipe],.cb-dialog[data-tab=arena] .cb-card[data-tab=arena],.cb-dialog[data-tab=designs] .cb-card[data-tab=designs],.cb-dialog[data-tab=waves] .cb-card[data-tab=waves],.cb-dialog[data-tab=share] .cb-card[data-tab=share]{display:block}.cb-dialog[data-tab=arena] #cbCanvas{max-height:58vh;width:auto;max-width:100%;display:block;margin:0 auto}\n/* Workshop layout; colours, typography and buttons belong to the original game. */\n.cb-dialog{box-sizing:border-box;width:min(1180px,96vw);max-width:1180px;max-height:94dvh;margin:auto;padding:24px;border:1px solid var(--bark2);border-top:3px solid var(--hide);border-radius:6px;background:var(--night);color:var(--bone);font:inherit;line-height:1.5;overflow:auto;touch-action:pan-y;box-shadow:0 16px 70px #0009}\n.cb-dialog::backdrop{background:rgba(12,9,8,.86)}\n.cb-dialog *{box-sizing:border-box}\n.cb-dialog h1.display{font-size:34px;line-height:1.02;margin:4px 0;color:var(--sun)}\n.cb-dialog h2.display{font-size:23px;line-height:1.08;margin:0 0 16px;color:var(--bone)}\n.cb-dialog h3{margin:0;font-size:16px;color:var(--sun)}\n.cb-head{display:flex;align-items:center;justify-content:space-between;gap:12px;border-bottom:1px solid var(--bark2);padding-bottom:16px}\n.cb-eyebrow{font-size:10px;letter-spacing:.12em;color:var(--hide);font-weight:700}\n.cb-intro{max-width:800px;color:var(--dust);font-size:14px}\n.cb-dialog p{margin:10px 0}\n.cb-columns{display:grid;grid-template-columns:1fr 1fr;gap:16px}\n.cb-card.slab{border-radius:6px;padding:18px;margin-bottom:16px}\n.cb-columns .cb-card{min-width:0}\n.cb-fields{display:grid;grid-template-columns:1fr 1fr;gap:12px}\n.cb-dialog label{display:flex;flex-direction:column;gap:5px;font-size:13px;color:var(--bone);min-width:0}\n.cb-wide{grid-column:1/-1}\n.cb-dialog input,.cb-dialog select,.cb-dialog textarea{font:inherit;font-size:14px;line-height:1.4;width:100%;min-height:42px;padding:8px 10px;border:1px solid var(--bark2);border-radius:3px;color:var(--bone);background:var(--night);user-select:text}\n.cb-dialog textarea{resize:vertical}\n.cb-dialog input:focus-visible,.cb-dialog select:focus-visible,.cb-dialog textarea:focus-visible,.cb-dialog canvas:focus-visible{outline:2px solid var(--bone);outline-offset:2px;border-color:var(--hide)}\n.cb-dialog input[type=checkbox]{min-height:22px;width:22px;accent-color:var(--hide)}\n.cb-dialog input[type=color]{padding:3px;cursor:pointer}\n.cb-dialog .cb-check{flex-direction:row;align-items:center;gap:9px}\n.cb-dialog .btn{width:auto;min-height:42px;white-space:normal}\n.cb-dialog .cb-primary{font-size:16px}\n.cb-dialog .btn[aria-pressed=true]{background:var(--bark2);border-color:var(--hide);color:var(--sun)}\n.cb-toolbar,.cb-tools,.cb-wave-head{display:flex;flex-wrap:wrap;gap:8px;align-items:center}\n.cb-toolbar{margin:12px 0}\n.cb-template{flex:1;min-width:150px;max-width:260px}\n.cb-help{font-size:12px;color:var(--dust)}\n.cb-summary{font-size:12px;padding:9px 12px;border:1px solid var(--bark2);border-left:3px solid var(--hide);background:var(--soil);color:var(--dust)}\n.cb-tools{margin-bottom:12px}\n.cb-dialog canvas{display:block;width:100%;height:auto;aspect-ratio:3/2;border:2px solid var(--bark2);border-radius:3px;touch-action:none}\n.cb-coords{display:flex;flex-wrap:wrap;align-items:end;gap:8px;margin-top:10px}.cb-coords label{width:80px;flex:1;min-width:62px}\n.cb-wave{padding:14px;border:1px solid var(--bark2);background:var(--night);border-radius:4px;margin:12px 0}\n.cb-wave-head{margin-bottom:12px}.cb-wave-head h3{flex:1}.cb-wave>label{max-width:150px}\n.cb-group{display:grid;grid-template-columns:1fr 80px 1fr auto;align-items:end;gap:10px;margin:12px 0}.cb-group .btn{max-width:100px}\n.cb-draft{display:flex;align-items:center;gap:8px;padding:10px 0;border-bottom:1px solid var(--bark2)}.cb-draft span{flex:1;overflow-wrap:anywhere}\n.cb-object-list{display:flex;flex-wrap:wrap;gap:6px;max-height:140px;overflow:auto}\n.cb-object-list span{font-size:12px;display:flex;gap:4px;align-items:center;border:1px solid var(--bark2);border-radius:3px;padding:4px;color:var(--dust)}\n.cb-object-list .btn{min-height:32px;padding:4px;font-size:11px}\n.cb-selected{border-color:var(--hide)!important;background:var(--bark)}\n.cb-dialog details{border-top:1px solid var(--bark2);padding-top:10px;margin:8px 0}\n.cb-dialog summary{cursor:pointer;color:var(--sun);font-size:13px;padding:4px 0;min-height:32px}\n.cb-dialog summary:focus-visible{outline:2px solid var(--bone);outline-offset:2px}\n.cb-dialog details>.cb-fields{margin-top:10px}\n.cb-roster{display:grid;grid-template-columns:1fr 1fr;gap:4px 14px;font-size:12px;color:var(--dust)}\n.cb-roster b{color:var(--bone)}\n.cb-dialog #cbMakerCanvas{width:240px;max-width:100%;height:auto;aspect-ratio:4/3;margin:10px auto;border-color:var(--hide)}\n.cb-part{padding:12px;border:1px solid var(--bark2);border-radius:4px;margin:10px 0;background:var(--night)}\n.cb-part .cb-fields{grid-template-columns:1fr 1fr}.cb-part .cb-wave-head b{flex:1;color:var(--sun);font-size:13px}\n.cb-maker-top{display:grid;grid-template-columns:240px minmax(0,1fr);align-items:center;gap:20px}\n.cb-parts-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:0 14px}\n#cbNotice:not(:empty){padding:12px;border:1px solid var(--hide);background:var(--bark);border-radius:4px;margin:12px 0;color:var(--bone);overflow-wrap:anywhere}\n#cbNotice.cb-error{border-color:var(--blood);background:var(--soil);color:var(--bone)}\n#cbProof{color:var(--sun)}#cbCode{overflow-wrap:anywhere;font:13px/1.5 ui-monospace,monospace}\n#cbValidation{padding:8px 12px;border-left:3px solid var(--hide);font-size:12px;color:var(--dust);background:var(--soil)}\n#cbValidation.cb-error{border-color:var(--blood);color:var(--bone)}\n.cb-swatches{display:flex;flex-wrap:wrap;gap:8px;margin:12px 0}\n.cb-swatches span{display:flex;gap:5px;align-items:center;font-size:11px;color:var(--dust)}\n.cb-swatches i{display:inline-block;width:22px;height:22px;border:1px solid var(--dust);border-radius:3px}\n@media(max-width:700px){\n  .cb-dialog{width:100vw;max-width:100vw;max-height:100dvh;height:100dvh;border-radius:0;padding:16px}\n  .cb-dialog h1.display{font-size:27px}.cb-dialog h2.display{font-size:22px}\n  .cb-columns{grid-template-columns:1fr;gap:0}.cb-card.slab{padding:14px}.cb-fields{gap:10px}\n  .cb-maker-top,.cb-parts-grid{grid-template-columns:1fr}.cb-maker-top{gap:8px}\n  .cb-dialog .btn{min-height:44px}.cb-group{grid-template-columns:1fr 70px;gap:8px}.cb-group .btn{max-width:none}\n  .cb-wave-head{gap:6px}.cb-wave-head h3{flex-basis:100%}.cb-toolbar>.btn{flex-grow:1}\n  .cb-toolbar .cb-template{max-width:none;flex-basis:100%}.cb-coords{flex-wrap:wrap}\n  .cb-object-list .btn{min-height:44px}.cb-dialog input,.cb-dialog select,.cb-dialog textarea{font-size:16px;min-height:44px}\n  .cb-eyebrow{font-size:10px;letter-spacing:.08em}.cb-head>.btn{flex:none}\n}\n";
function cbStyle(){ if (document.getElementById('cbStyle')) return; const s = document.createElement('style'); s.id = 'cbStyle'; s.textContent = CB_CSS; document.head.appendChild(s); }
var GRChallengeUI = (function(){
  let level, dialog, tool='wall', undo=[], redo=[], proof='', oldFocus, lastResult=null;
  let grid=true,checker=true,selected=-1,px=160,py=160,pw=40,ph=40,maker=0;
  let ghost=null,hover=-1;
  let tab='recipe',draftId=null,drag=null,cursor={x:480,y:320},padLoop=0,padPrev=[],padRep=0,padDir=false;
  const TABS=[['recipe','1. Recipe'],['arena','2. Arena'],['designs','Designs'],['waves','3. Waves'],['share','4. Play & share']];
  const D=()=>window.GRChallengeData;
  const clone=x=>JSON.parse(JSON.stringify(x));
  const esc=x=>String(x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const options=(values,current)=>values.map(v=>'<option value="'+esc(v)+'"'+(v===current?' selected':'')+'>'+esc(v)+'</option>').join('');
  const button=(action,text,extra='')=>'<button type="button" data-cb="'+action+'" '+(extra.includes('class="')?extra.replace('class="','class="btn sm '):'class="btn ghost sm" '+extra)+'>'+text+'</button>';
  const ROLES={chaser:'A hyena. Steady pursuer that finds its way round walls; herds the player toward hazards.',runner:'A cheetah. Fast and fragile; use another entrance for a flank.',brute:'A rhino. Slow and durable; leave room to circle.',spitter:'A baboon. Keeps its distance and throws; walls provide cover.',
    flyer:'A vulture. Flies straight over walls and hazards, and can be hit over a wall too.',charger:'A warthog. Stops, stamps, then dashes along a line it shows you first; sidestep it.',splitter:'A termite. Bursts into three fast grubs when beaten.',badger:'A honey badger. Tough, and heals itself if left alone for two seconds.'};
  function remember(){undo.push(clone(level));if(undo.length>60)undo.shift();redo=[];proof='';lastResult=null;}
  function note(text,bad=false){const n=dialog.querySelector('#cbNotice');n.textContent=text;n.classList.toggle('cb-error',bad);}
  function validate(){return D().validate(level);}
  function setLevel(next){remember();level=clone(next);selected=-1;render();}
  function update(path,value){let o=level;const keys=path.split('.');keys.slice(0,-1).forEach(k=>o=o[k]);if(o[keys[keys.length-1]]===value)return;remember();o[keys[keys.length-1]]=value;updateSummary();paint();paintMaker();}
  function summary(){
    const n=level.waves.reduce((a,w)=>a+w.enemies.reduce((b,g)=>b+g.count,0),0);
    return level.waves.length+' waves · '+n+' enemies · '+level.objects.length+'/48 objects · fixed '+level.loadout+' kit';
  }
  function updateSummary(){
    dialog.querySelector('#cbSummary').textContent=summary();
    dialog.querySelector('#cbBudget').textContent=budget();
    dialog.querySelector('#cbKit').textContent=kitDescription();
    dialog.querySelector('#cbGoal').textContent=goalDescription();
    let valid=true,reason='',codeLength=0;try{codeLength=D().encode(validate()).length;}catch(e){valid=false;reason=e.message;}
    dialog.querySelector('#cbValidation').textContent=valid?'Recipe checks pass. A playtest is still needed to check the fun and pacing.':reason;
    dialog.querySelector('#cbValidation').classList.toggle('cb-error',!valid);
    dialog.querySelector('#cbShareInfo').textContent=valid?'Share recipe: '+codeLength.toLocaleString()+' characters · '+(proof===D().fingerprint(level)?'export ready':'clear this exact recipe to export')+'.':'Sharing unavailable: finish the recipe checks above.';
    dialog.querySelector('#cbToolHelp').textContent=toolHelp();
    dialog.querySelector('#cbObjectInfo').textContent=objectInfo();
    dialog.querySelector('#cbBiomeHelp').textContent=biomeHelp();
    level.waves.forEach((w,i)=>{const n=dialog.querySelector('#cbWaveSummary'+i);if(n)n.textContent=waveDescription(w);});
    drawSwatches();portraits();
    const roster=dialog.querySelector('.cb-roster');
    if(roster&&window.GRChallengePlay.getEnemy){roster.replaceChildren();Object.entries(ROLES).forEach(([kind,role])=>{const e=window.GRChallengePlay.getEnemy(kind),p=document.createElement('p'),pic=document.createElement('canvas');pic.width=pic.height=56;pic.className='cb-face';p.append(pic);try{window.GRChallengePlay.portrait(pic.getContext('2d'),kind,28,28,54,1);}catch(err){}p.append(document.createTextNode(kind+' · '+Math.round(e.hp*level.modifiers.enemyHp)+' HP · '+Math.round(e.speed*level.modifiers.speed)+' speed · '+e.damage+' damage per hit. '+role));roster.append(p);});}
    const verified=valid&&proof===D().fingerprint(level);
    dialog.querySelector('#cbProof').textContent=verified?'Cleared locally — this exact recipe is ready to share.':'Play and clear this exact recipe to unlock sharing. Changes reset the local clear.';
    dialog.querySelectorAll('[data-cb="copy"],[data-cb="link"]').forEach(b=>b.disabled=!verified);
    dialog.querySelector('[data-cb="undo"]').disabled=!undo.length;
    dialog.querySelector('[data-cb="redo"]').disabled=!redo.length;
  }
  function biomeHelp(){return {savanna:'Sun-baked soil, dry grasses and warm acacia greens.',arctic:'Pale snow and ice under a cool sky.',moon:'Dusty stone and crater-like ground marks.',forest:'A leafy floor, scattered leaves and deep woodland greens.',desert:'Warm dunes, ripples and sparse dry growth.',swamp:'Damp mossy soil and puddle-like ground patches.',volcanic:'Dark stone with glowing cracks and hot earth accents.'}[level.arena.theme]+' Biome and palette change the scenery, not enemy statistics.';}
  function toolHelp(){return {wall:'Wall: blocks movement and attacks over the whole grid area it covers, right up to the edges of its outline. Leave routes wide enough for both sides.',hazard:'Hazard: damages the player on contact; it does not block movement.',coin:'Coin: a challenge-only pickup that counts toward collection objectives; no campaign gold.',exit:'Exit: reach this marker to finish an escape challenge. Use exactly one.',heal:'Heal: restores 25% of maximum health, capped at full health. It waits until you are hurt.',tree:'Tree: decorative scenery. You and enemies can move through it.',rock:'Rock: decorative scenery, not a wall. Use the wall tool for cover.',banner:'Banner: a decorative landmark with no collision.',custom:'Custom: place your chosen design. Solid designs block their full rectangular box; decorative designs do not.',select:'Select: tap an object or its row, then edit coordinates or size. Selection itself does not change your recipe.',erase:'Erase: tap a placed object to remove it. Undo restores it.'}[tool];}
  function objectInfo(){const o=level.objects[selected];if(!o)return 'No object selected. Select a placed item to inspect or edit it.';return objectLabel(o)+' · '+o.w+' × '+o.h+' at '+o.x+', '+o.y+' · '+(D().isSolid(level,o)?'Solid: movement and attacks are blocked over its whole grid area.':['coin','heal','exit'].includes(o.kind)?'Reachable interactive pickup / objective.':'Non-blocking '+(o.kind==='hazard'?'damaging floor.':'decoration.'));}
  function drawSwatches(){
    const host=dialog.querySelector('#cbSwatches');if(!host)return;host.replaceChildren();const colors=window.GRChallengePlay.getPalette(level);
    Object.entries(colors).forEach(([name,color])=>{const sw=document.createElement('span'),chip=document.createElement('i');chip.style.backgroundColor=color;sw.append(chip,document.createTextNode(name+' '+color));host.append(sw);});
  }
  function budget(){
    const weights={chaser:1,runner:1.2,brute:3.5,spitter:1.5,flyer:1.3,charger:2.6,splitter:2.4,badger:3};
    const n=level.waves.reduce((a,w)=>a+w.enemies.reduce((b,g)=>b+g.count*weights[g.kind],0),0)*level.modifiers.enemyHp*level.modifiers.speed;
    return 'Enemy budget: '+Math.round(n)+' weighted points ('+(n<25?'light':n<80?'mixed':'heavy')+'). Rough composition estimate only—not a difficulty rating. Walls, timing and your kit can change the challenge.';
  }
  function kitDescription(){
    const k=window.GRChallengePlay.getKit(level.loadout);
    return 'Fixed kit: '+k.hp+' HP · '+Math.round(k.speed*(level.modifiers.playerSpeed||1))+' movement · '+k.damage+' damage · '+k.range+' reach · attack every '+(k.cooldown/(level.modifiers.attackRate||1)).toFixed(2)+'s. Auto-attacks hit nearby enemies; walls block attacks. No campaign bonuses.';
  }
  function goalDescription(){return {clear:'Clear all waves. Leave open routes so enemies can reach the central start.',survive:'Survive '+level.objective.target+' seconds. After the last wave, the clock keeps running.',collect:'Collect '+level.objective.target+' coins. Place that many reachable coin pickups, not just decorations.',exit:'Reach exactly one placed exit. The validator checks for a route around walls, but you still have to survive it.'}[level.objective.type];}
  function field(label,path,value,type='text',extra=''){
    return '<label>'+label+'<input data-path="'+path+'" type="'+type+'" value="'+esc(value)+'" '+extra+'></label>';
  }
  function select(label,path,values,value){return '<label>'+label+'<select data-path="'+path+'">'+options(values,value)+'</select></label>';}
  function objectLabel(o){const a=o.kind==='custom'?level.customAssets.find(v=>v.id===o.asset):null;return a?a.name+(a.solid?' [solid]':' [decorative]'):o.kind;}
  function waveDescription(w){return w.enemies.reduce((n,g)=>n+g.count,0)+' enemies · '+w.delay+'s delay · '+w.enemies.map(g=>g.count+' '+g.kind+' from '+g.spawn).join('; ');}
  function render(){
    const openDetails=Array.from(dialog.querySelectorAll('details[open]')).map(d=>d.id||d.querySelector('summary')?.textContent);
    level.appearance=level.appearance||{time:'day',weather:'clear',detail:1};
    level.appearance.palette=level.appearance.palette||'biome';
    level.appearance.colors=level.appearance.colors||{ground:'#a89958',accent:'#c9b979',foliage:'#6a7944'};
    level.customAssets=level.customAssets||[];maker=Math.max(0,Math.min(maker,level.customAssets.length-1));
    if(level.modifiers.playerSpeed===undefined)level.modifiers.playerSpeed=1;
    if(level.modifiers.attackRate===undefined)level.modifiers.attackRate=1;
    const chosen=dialog.querySelector('#cbTemplates')?.value||'0';
    dialog.innerHTML='<header class="cb-head"><div><span class="cb-eyebrow">CREATE · CLEAR · SHARE</span><h1 id="cbTitle">Challenge Workshop</h1></div>'+button('close','Close','aria-label="Close challenge workshop"')+'</header>'+
      '<p class="cb-intro">Build a little rampage. Give it a twist. Dare a friend to beat it. It has its own arena, creatures and fixed kits; your campaign gear, progress and rewards stay untouched.</p>'+
      '<div id="cbNotice" role="status" aria-live="polite"></div>'+
      '<nav class="cb-toolbar" aria-label="Workshop actions">'+button('new','New level')+'<label class="cb-template">Start from a recipe<select id="cbTemplates">'+D().templates.map((t,i)=>'<option value="'+i+'">'+esc(t.name)+'</option>').join('')+'</select></label>'+button('template','Use recipe')+button('save','Save draft')+button('save-copy','Save as copy')+button('undo','Undo')+button('redo','Redo')+'</nav>'+
      '<nav class="cb-tabs" role="tablist" aria-label="Workshop sections">'+TABS.map(t=>'<button type="button" role="tab" data-cb="tab-'+t[0]+'" class="btn sm'+(tab===t[0]?'':' ghost')+'" aria-selected="'+(tab===t[0])+'">'+t[1]+'</button>').join('')+'</nav>'+'<div class="cb-status"><p id="cbSummary" class="cb-summary"></p><p id="cbValidation" role="status" aria-live="polite"></p></div><div class="cb-columns"><section class="cb-card" aria-labelledby="cbRecipe"><h2 id="cbRecipe">1. Your recipe</h2><div class="cb-fields">'+
      field('Level name','title',level.title,'text','maxlength="60"')+field('Creator','author',level.author,'text','maxlength="32"')+
      '<label class="cb-wide">Opening message<textarea data-path="description" maxlength="280" rows="2">'+esc(level.description)+'</textarea></label>'+
      field('Seed','seed',level.seed,'number','min="0" max="4294967295" step="1"')+select('Arena','arena.theme',['savanna','arctic','moon','forest','desert','swamp','volcanic'],level.arena.theme)+
      '<details class="cb-wide"><summary>Environment, colours & scenery</summary><div class="cb-fields">'+select('Light','appearance.time',['day','sunset','night'],level.appearance.time)+select('Weather','appearance.weather',['clear','drizzle','snow'],level.appearance.weather)+select('Scenery detail','appearance.detail',[0,1,2],level.appearance.detail)+select('Colour palette','appearance.palette',['biome','autumn','pastel','dusk','custom'],level.appearance.palette)+field('Custom ground','appearance.colors.ground',level.appearance.colors.ground,'color')+field('Custom accent','appearance.colors.accent',level.appearance.colors.accent,'color')+field('Custom foliage','appearance.colors.foliage',level.appearance.colors.foliage,'color')+'</div><div id="cbSwatches" class="cb-swatches"></div>'+button('biome-colors','Use biome colours as custom')+'<p id="cbBiomeHelp" class="cb-help"></p><p class="cb-help">Choose custom palette to use your three colours. The Workshop menus keep the game’s original brown and gold.</p></details>'+
      select('Objective','objective.type',['clear','survive','collect','exit'],level.objective.type)+field('Target (seconds / coins)','objective.target',level.objective.target,'number','min="1" max="300"')+
      select('Starting kit','loadout',['balanced','swift','tank'],level.loadout)+'<details class="cb-wide"><summary>Combat modifiers</summary><div class="cb-fields">'+field('Enemy speed multiplier','modifiers.speed',level.modifiers.speed,'number','min="0.5" max="2" step="0.1"')+
      field('Enemy health multiplier','modifiers.enemyHp',level.modifiers.enemyHp,'number','min="0.5" max="3" step="0.1"')+
      field('Player speed multiplier','modifiers.playerSpeed',level.modifiers.playerSpeed,'number','min="0.5" max="2" step="0.1"')+field('Attack rate multiplier','modifiers.attackRate',level.modifiers.attackRate,'number','min="0.5" max="2" step="0.1"')+
      '<label class="cb-check"><input type="checkbox" data-path="modifiers.darkness" '+(level.modifiers.darkness?'checked':'')+'> Limited visibility</label></div></details></div>'+
      '<p id="cbKit" class="cb-help"></p><p id="cbGoal" class="cb-help"></p><p class="cb-help">All runs have a five-minute limit. Weather and scenery are cosmetic; limited visibility changes how much you can see.</p></section>'+
      '<section class="cb-card" aria-labelledby="cbArena"><h2 id="cbArena">2. Shape the arena</h2><div class="cb-tools" role="group" aria-label="Placement tool">'+['wall','hazard','coin','exit','heal','tree','rock','banner','custom','select','erase'].map(t=>button('tool-'+t,t,'aria-pressed="'+(tool===t)+'"')).join('')+'</div>'+
      (level.customAssets.length?'<label>Custom object to place<select id="cbAssetPicker">'+level.customAssets.map((a,i)=>'<option value="'+i+'"'+(maker===i?' selected':'')+'>'+esc(a.name)+'</option>').join('')+'</select></label>':'')+
      '<p id="cbToolHelp" class="cb-help"></p>'+
      '<canvas id="cbCanvas" width="960" height="640" tabindex="0" role="img" aria-label="Level arena. Tap to place the selected object. Keyboard users can use coordinate fields below."></canvas>'+
      '<div class="cb-coords"><label>X<input id="cbX" data-editor="x" type="number" value="'+px+'" min="0" max="920" step="40"></label><label>Y<input id="cbY" data-editor="y" type="number" value="'+py+'" min="0" max="600" step="40"></label><label>Width<input id="cbWidth" data-editor="w" type="number" value="'+pw+'" min="40" max="320" step="40"></label><label>Height<input id="cbHeight" data-editor="h" type="number" value="'+ph+'" min="40" max="320" step="40"></label></div><div class="cb-toolbar">'+button('place','Place at coordinates')+button('apply','Move / resize selected',selected<0?'disabled':'')+button('clone','Duplicate selected',selected<0?'disabled':'')+button('grid','Grid '+(grid?'on':'off'),'aria-pressed="'+grid+'"')+'</div>'+
      '<p id="cbObjectInfo" class="cb-help"></p><details><summary>Layout recipes (replace arena objects)</summary><div class="cb-toolbar">'+button('layout-courtyard','Courtyard')+button('layout-slalom','Slalom')+button('layout-fire','Ring of fire')+'</div></details>'+
      '<p class="cb-help">Tap to place on a 40-unit grid. Select an object to move, resize or duplicate it. Gold marker = player start. Trees, rocks and banners are decorative, not walls. Heal pickups restore 25% health. Keep entrances clear.</p><div class="cb-object-list">'+level.objects.map((o,i)=>'<span class="'+(selected===i?'cb-selected':'')+'">'+button('select-'+i,esc(objectLabel(o))+' ('+o.x+', '+o.y+')','aria-pressed="'+(selected===i)+'"')+button('object-'+i,'Remove','aria-label="Remove '+esc(objectLabel(o))+' at '+o.x+', '+o.y+'"')+'</span>').join('')+'</div></section></div><section class="cb-card" aria-label="Custom object designer">'+makerHTML()+'</section>'+
      '<section class="cb-card" aria-labelledby="cbWaves"><h2 id="cbWaves">3. Direct the waves</h2><p id="cbBudget" class="cb-help"></p><p class="cb-help">Each delay is measured after the preceding wave is cleared. Maximum 12 waves, four groups each and 240 enemies total.</p><div class="cb-toolbar">Quick wave: '+button('preset-swarm','Swarm')+button('preset-ambush','Ambush')+button('preset-finale','Brute finale')+'</div><details><summary>Meet the enemies</summary><div class="cb-roster">'+Object.entries(ROLES).map(([k,r])=>'<p><b>'+k+'</b> · '+r+'</p>').join('')+'</div></details>'+level.waves.map(waveHTML).join('')+button('add-wave','Add wave',''+(level.waves.length>=12?'disabled':''))+'</section>'+
      '<section class="cb-card cb-launch"><h2>4. Clear it. Then share it.</h2><p id="cbProof"></p><p id="cbShareInfo" class="cb-help"></p><p class="cb-help">A local clear is a design check, not tamper-proof online verification. Imported codes never carry trusted completion claims. No campaign currency is awarded.</p><div class="cb-toolbar">'+button('play','Playtest level','class="cb-primary"')+button('copy','Get share code')+button('link','Get share link')+'</div><label>Share code or link<textarea id="cbCode" rows="3" maxlength="40000" spellcheck="false" placeholder="Paste a GRC1: code or challenge link to import. Exported codes also appear here if copying is unavailable."></textarea></label><div class="cb-toolbar">'+button('import','Import / remix')+button('hash','Read level from this page’s link')+'</div></section>'+
      '<section class="cb-card"><h2>Saved recipes</h2><p class="cb-help">Up to 24 drafts, stored only in this browser, separate from your campaign save. Export a cleared recipe for a portable backup. Drafts do not sync to the cloud.</p><div id="cbDrafts"></div></section>';
    dialog.querySelectorAll('h1,h2').forEach(h=>h.classList.add('display'));
    dialog.querySelectorAll('.cb-card').forEach((s,i)=>{s.classList.add('slab');s.dataset.tab=['recipe','arena','designs','waves','share','share'][i]||'share';});
    dialog.dataset.tab=tab;if(tab==='designs'){const m=dialog.querySelector('#cbMaker');if(m)m.open=true;}
    dialog.querySelectorAll('details').forEach(d=>d.open=openDetails.includes(d.id||d.querySelector('summary')?.textContent));
    dialog.querySelector('#cbTemplates').value=chosen;
    wireCanvas(dialog.querySelector('#cbCanvas'));
    draftList();updateSummary();paint();paintMaker();toolIcons();
  }
  function makerHTML(){
    const asset=level.customAssets[maker],base='customAssets.'+maker;
    let html='<details id="cbMaker"><summary>Custom object maker · '+level.customAssets.length+'/8 designs</summary><p class="cb-help">Draw with coloured shapes; no scripts or uploaded files. Each design can be placed many times. Coordinates run from 0 to 100. Layers paint in order: the last layer is on top. Rotated parts are clipped inside their instance.</p><div class="cb-toolbar">'+button('asset-new','New design',level.customAssets.length>=8?'disabled':'')+button('asset-delete','Delete design',asset?'':'disabled')+button('asset-starter-lantern','Lantern starter',level.customAssets.length>=8?'disabled':'')+button('asset-starter-crate','Crate starter',level.customAssets.length>=8?'disabled':'')+button('asset-starter-crystal','Crystal starter',level.customAssets.length>=8?'disabled':'')+'</div>';
    if(!asset)return html+'<p class="cb-help">Create a design, add up to 12 shape layers, then choose the custom placement tool.</p></details>';
    html+='<div class="cb-maker-top"><div><canvas id="cbMakerCanvas" width="240" height="180" aria-label="Custom design preview"></canvas>'+button('checker','Checkerboard '+(checker?'on':'off'),'aria-pressed="'+checker+'"')+'</div><div><div class="cb-fields">'+field('Design name',base+'.name',asset.name,'text','maxlength="32"')+'<label class="cb-check"><input type="checkbox" data-path="'+base+'.solid" '+(asset.solid?'checked':'')+'> Solid — full rectangular bounds block movement</label></div><p class="cb-help">Solid designs block movement and attacks using their entire rectangular placement box, including empty-looking corners. Decorative designs do not block anything. Checkerboard is an editor-only transparency aid.</p></div></div><div class="cb-parts-grid">';
    html+=asset.parts.map((part,i)=>{
      const p=base+'.parts.'+i;
      return '<div class="cb-part"><div class="cb-wave-head"><b>Layer '+(i+1)+' · '+esc(part.shape)+'</b>'+button('asset-up-'+i,'↑','aria-label="Move layer '+(i+1)+' earlier (behind)" '+(i?'':'disabled'))+button('asset-down-'+i,'↓','aria-label="Move layer '+(i+1)+' later (in front)" '+(i<asset.parts.length-1?'':'disabled'))+button('asset-remove-'+i,'Remove',asset.parts.length>1?'':'disabled')+'</div><div class="cb-fields">'+select('Shape',p+'.shape',['rect','ellipse','triangle'],part.shape)+field('Fill colour',p+'.color',part.color,'color')+field('X',p+'.x',part.x,'number','min="0" max="99"')+field('Y',p+'.y',part.y,'number','min="0" max="99"')+field('Width',p+'.w',part.w,'number','min="1" max="100"')+field('Height',p+'.h',part.h,'number','min="1" max="100"')+field('Rotation (degrees)',p+'.rotation',part.rotation??0,'number','min="-180" max="180"')+field('Opacity',p+'.opacity',part.opacity??1,'number','min="0" max="1" step="0.05"')+field('Outline colour',p+'.stroke',part.stroke||'#3a2b20','color')+field('Outline width',p+'.strokeWidth',part.strokeWidth??0,'number','min="0" max="6" step="0.5"')+'</div><div class="cb-toolbar">'+button('asset-duplicate-'+i,'Duplicate')+button('asset-center-'+i,'Center')+button('asset-mirror-'+i,'Mirror horizontally')+'</div></div>';
    }).join('');
    return html+'</div>'+button('asset-add','Add shape layer',asset.parts.length>=12?'disabled':'')+'</details>';
  }
  function paintMaker(){
    const canvas=dialog.querySelector('#cbMakerCanvas'),asset=level.customAssets[maker];if(!canvas||!asset)return;
    const c=canvas.getContext('2d');c.clearRect(0,0,240,180);c.fillStyle='#14100E';c.fillRect(0,0,240,180);
    if(checker)for(let y=0;y<180;y+=12)for(let x=0;x<240;x+=12){c.fillStyle=(x/12+y/12)%2?'#3A2B20':'#241B15';c.fillRect(x,y,12,12);}
    try{window.GRChallengePlay.paintCustom(c,asset,40,10,160,160);}catch(e){note('This shape is not valid yet. Keep its size positive and inside 0–100.',true);}
  }
  function waveHTML(w,i){
    return '<div class="cb-wave"><div class="cb-wave-head"><h3>Wave '+(i+1)+'</h3>'+button('up-'+i,'↑','aria-label="Move wave '+(i+1)+' earlier" '+(!i?'disabled':''))+button('down-'+i,'↓','aria-label="Move wave '+(i+1)+' later" '+(i===level.waves.length-1?'disabled':''))+button('dup-'+i,'Duplicate',level.waves.length>=12?'disabled':'')+button('delwave-'+i,'Remove',level.waves.length<=1?'disabled':'')+'</div><p id="cbWaveSummary'+i+'" class="cb-help"></p>'+
      field('Delay in seconds','waves.'+i+'.delay',w.delay,'number','min="0" max="30"')+w.enemies.map((g,j)=>'<div class="cb-group"><canvas class="cb-mini" data-w="'+i+'" data-g="'+j+'" width="88" height="88" aria-hidden="true"></canvas>'+select('Enemy','waves.'+i+'.enemies.'+j+'.kind',D().kinds,g.kind)+field('Count','waves.'+i+'.enemies.'+j+'.count',g.count,'number','min="1" max="30"')+select('Entrance','waves.'+i+'.enemies.'+j+'.spawn',['north','east','south','west'],g.spawn)+button('delgroup-'+i+'-'+j,'Remove group',w.enemies.length<=1?'disabled':'')+'</div>').join('')+button('group-'+i,'Add enemy group',w.enemies.length>=4?'disabled':'')+'</div>';
  }
  function paint(){
    const canvas=dialog.querySelector('#cbCanvas');if(!canvas)return;const c=canvas.getContext('2d');
    try{window.GRChallengePlay.paintArena(c,level,{grid:grid,time:0,cache:true});}catch(e){note('Finish the current shape or colour edit to refresh the arena preview.',true);}
    const object=level.objects[selected];if(object){c.strokeStyle='#EFE6D4';c.lineWidth=3;c.setLineDash([7,4]);c.strokeRect(object.x,object.y,object.w,object.h);c.setLineDash([]);
      if(tool==='select'){c.fillStyle='#F2B33D';c.strokeStyle='#241B15';c.lineWidth=2;c.fillRect(object.x+object.w-12,object.y+object.h-12,14,14);c.strokeRect(object.x+object.w-12,object.y+object.h-12,14,14);}}
    if(ghost&&!drag){
      if(tool==='erase'||tool==='select'){const o=level.objects[hover];if(o&&hover!==selected){c.strokeStyle=tool==='erase'?'#e0604a':'#efe6d4aa';c.lineWidth=3;c.setLineDash(tool==='erase'?[]:[4,4]);c.strokeRect(o.x-2,o.y-2,o.w+4,o.h+4);c.setLineDash([]);
        if(tool==='erase'){c.strokeStyle='#e0604a';c.beginPath();c.moveTo(o.x+6,o.y+6);c.lineTo(o.x+o.w-6,o.y+o.h-6);c.moveTo(o.x+o.w-6,o.y+6);c.lineTo(o.x+6,o.y+o.h-6);c.stroke();}}}
      else{
        const asset=tool==='custom'?(level.customAssets[maker]||{}).id:null,o={kind:tool,x:Math.max(0,Math.min(960-pw,ghost.x)),y:Math.max(0,Math.min(640-ph,ghost.y)),w:pw,h:ph};if(asset)o.asset=asset;
        if(tool!=='custom'||asset){
          const ok=startClear(o)&&level.objects.length<48;
          c.save();c.globalAlpha=.55;try{window.GRChallengePlay.paintObject(c,level,o);}catch(e){}c.restore();
          c.strokeStyle=ok?'#efe6d4':'#e0604a';c.lineWidth=2;c.setLineDash([6,4]);c.strokeRect(o.x,o.y,o.w,o.h);c.setLineDash([]);
          if(!ok){c.fillStyle='#e0604a33';c.fillRect(o.x,o.y,o.w,o.h);c.fillStyle='#241b15e0';c.fillRect(o.x,o.y-20,150,18);c.fillStyle='#ffd8cc';c.font='bold 12px sans-serif';c.textAlign='left';c.fillText(level.objects.length>=48?'Arena is full (48)':'Too close to the start',o.x+5,o.y-7);}
        }
      }
    }
    if(document.activeElement===canvas){c.strokeStyle='#F2B33D';c.lineWidth=3;c.strokeRect(cursor.x+2,cursor.y+2,Math.max(36,pw-4),Math.max(36,ph-4));}
    c.beginPath();c.arc(480,320,22,0,Math.PI*2);c.fillStyle='#F2B33D';c.fill();c.strokeStyle='#3A2B20';c.lineWidth=3;c.stroke();
    c.fillStyle='#7A4A21';[[470,314],[483,308],[485,323],[473,327]].forEach(p=>c.fillRect(p[0],p[1],5,5));
    c.fillStyle='#241B15';c.textAlign='center';c.font='bold 18px sans-serif';c.fillText('START',480,362);
  }
  function dimensions(){
    const read=(id,fallback)=>{const n=Number(dialog.querySelector(id).value);if(!Number.isFinite(n))throw Error('Enter numeric placement dimensions.');return n;};
    px=read('#cbX',px);py=read('#cbY',py);pw=Math.max(40,Math.min(320,Math.round(read('#cbWidth',pw)/40)*40));ph=Math.max(40,Math.min(320,Math.round(read('#cbHeight',ph)/40)*40));
  }
  function geometry(kind,x,y,asset){
    const o={kind:kind,x:Math.max(0,Math.min(960-pw,Math.floor(x/40)*40)),y:Math.max(0,Math.min(640-ph,Math.floor(y/40)*40)),w:pw,h:ph};
    if(kind==='custom'){const a=asset||level.customAssets[maker]?.id;if(!a)throw Error('Create a custom design first.');o.asset=a;}
    if((D().isSolid(level,o)||kind==='hazard')&&o.x<504&&o.x+o.w>456&&o.y<344&&o.y+o.h>296)throw Error('Leave breathing room around the player start.');return o;
  }
  function place(x,y){
    const gx=Math.max(0,Math.min(920,Math.floor(x/40)*40)),gy=Math.max(0,Math.min(600,Math.floor(y/40)*40));
    dimensions();
    if(tool==='select'){const i=level.objects.map(o=>gx>=o.x&&gx<o.x+o.w&&gy>=o.y&&gy<o.y+o.h).lastIndexOf(true);if(i>=0)selectObject(i);return;}
    if(tool==='erase'){
      const i=level.objects.findLastIndex?level.objects.findLastIndex(o=>gx>=o.x&&gx<o.x+o.w&&gy>=o.y&&gy<o.y+o.h):level.objects.map(o=>gx>=o.x&&gx<o.x+o.w&&gy>=o.y&&gy<o.y+o.h).lastIndexOf(true);
      if(i<0)return;remember();level.objects.splice(i,1);
    }else{
      if(level.objects.length>=48){note('The arena holds at most 48 objects. Erase something first.',true);return;}
      const o=geometry(tool,x,y);
      remember();if(tool==='exit')level.objects=level.objects.filter(o=>o.kind!=='exit');
      level.objects=level.objects.filter(p=>!(p.x===o.x&&p.y===o.y));level.objects.push(o);selected=level.objects.length-1;px=o.x;py=o.y;
    }
    render();
  }
  /* each tool button shows a small picture of what it places, painted with the arena's own painter in this recipe's biome */
  function toolIcons(){
    dialog.querySelectorAll('[data-cb^="tool-"]').forEach(b=>{
      const kind=b.dataset.cb.slice(5);if(b.querySelector('canvas'))return;
      const cv=document.createElement('canvas');cv.width=44;cv.height=44;cv.className='cb-tool-ico';cv.setAttribute('aria-hidden','true');b.prepend(cv);
      const c=cv.getContext('2d');if(!c)return;c.scale(44/96,44/96);
      try{
        if(kind==='select'){c.fillStyle='#efe6d4';c.beginPath();c.moveTo(30,14);c.lineTo(30,78);c.lineTo(46,62);c.lineTo(58,86);c.lineTo(68,80);c.lineTo(56,58);c.lineTo(78,58);c.closePath();c.fill();c.strokeStyle='#241b15';c.lineWidth=4;c.stroke();}
        else if(kind==='erase'){c.save();c.translate(48,48);c.rotate(-.6);c.fillStyle='#e8a0a0';c.fillRect(-30,-16,34,32);c.fillStyle='#efe6d4';c.fillRect(4,-16,26,32);c.strokeStyle='#241b15';c.lineWidth=4;c.strokeRect(-30,-16,60,32);c.restore();}
        else{const o={kind,x:8,y:8,w:80,h:80};if(kind==='coin'||kind==='heal'){o.x=24;o.y=24;o.w=48;o.h=48;}if(kind==='wall'){o.y=28;o.h=40;}
          if(kind==='custom'){const a=level.customAssets[maker];if(a)o.asset=a.id;else{c.strokeStyle='#efe6d4';c.lineWidth=4;c.setLineDash([8,6]);c.strokeRect(14,14,68,68);c.setLineDash([]);c.fillStyle='#efe6d4';c.font='bold 40px sans-serif';c.textAlign='center';c.fillText('+',48,62);return;}}
          window.GRChallengePlay.paintObject(c,level,o);}
      }catch(e){}
    });
  }
  function portraits(){
    dialog.querySelectorAll('canvas.cb-mini').forEach(cv=>{
      const g=level.waves[+cv.dataset.w]&&level.waves[+cv.dataset.w].enemies[+cv.dataset.g];if(!g)return;
      const c=cv.getContext('2d');if(!c)return;c.clearRect(0,0,cv.width,cv.height);window.GRChallengePlay.portrait(c,g.kind,cv.width/2,cv.height/2,cv.width*.95,1);
    });
  }
  function canvasPoint(cv,e){const r=cv.getBoundingClientRect();return {x:(e.clientX-r.left)*960/r.width,y:(e.clientY-r.top)*640/r.height};}
  function hitObject(pt){for(let i=level.objects.length-1;i>=0;i--){const o=level.objects[i];if(pt.x>=o.x&&pt.x<o.x+o.w&&pt.y>=o.y&&pt.y<o.y+o.h)return i;}return -1;}
  function nearCorner(o,pt){return o&&pt.x>o.x+o.w-18&&pt.x<o.x+o.w+6&&pt.y>o.y+o.h-18&&pt.y<o.y+o.h+6;}
  function startClear(o){return !((D().isSolid(level,o)||o.kind==='hazard')&&o.x<504&&o.x+o.w>456&&o.y<344&&o.y+o.h>296);}
  function wireCanvas(cv){
    cv.addEventListener('pointerdown',e=>{
      e.preventDefault();const pt=canvasPoint(cv,e);cursor={x:Math.floor(pt.x/40)*40,y:Math.floor(pt.y/40)*40};
      if(tool==='select'){
        const sel=level.objects[selected],i=nearCorner(sel,pt)?selected:hitObject(pt);
        if(i>=0){const o=level.objects[i];let okBefore=true;try{D().validate(level);}catch(err){okBefore=false;}
          drag={i,size:i===selected&&nearCorner(o,pt),dx:pt.x-o.x,dy:pt.y-o.y,orig:clone(o),pid:e.pointerId,moved:false,okBefore};selected=i;try{cv.setPointerCapture(e.pointerId);}catch(err){}paint();return;}
      }
      try{place(pt.x,pt.y);}catch(err){note(err.message,true);}
    });
    cv.addEventListener('pointermove',e=>{
      const pt=canvasPoint(cv,e);
      if(!drag||drag.pid!==e.pointerId){
        cv.style.cursor=tool==='select'?(nearCorner(level.objects[selected],pt)?'nwse-resize':hitObject(pt)>=0?'move':'default'):tool==='erase'?'not-allowed':'crosshair';
        if(e.pointerType!=='touch'){const g={x:Math.floor(pt.x/40)*40,y:Math.floor(pt.y/40)*40},h=hitObject(pt);
          if(!ghost||ghost.x!==g.x||ghost.y!==g.y||h!==hover){ghost=g;hover=h;paint();}}
        return;
      }
      const o=level.objects[drag.i];
      if(drag.size){o.w=Math.max(40,Math.min(320,960-o.x,Math.round((pt.x-o.x)/40)*40));o.h=Math.max(40,Math.min(320,640-o.y,Math.round((pt.y-o.y)/40)*40));}
      else{o.x=Math.max(0,Math.min(960-o.w,Math.round((pt.x-drag.dx)/40)*40));o.y=Math.max(0,Math.min(640-o.h,Math.round((pt.y-drag.dy)/40)*40));}
      drag.moved=drag.moved||o.x!==drag.orig.x||o.y!==drag.orig.y||o.w!==drag.orig.w||o.h!==drag.orig.h;paint();
    });
    const drop=e=>{
      if(!drag||drag.pid!==e.pointerId)return;const d=drag;drag=null;const o=level.objects[d.i];
      if(!d.moved){selectObject(d.i);return;}
      let why='';if(!startClear(o))why='Leave breathing room around the player start.';
      else if(d.okBefore){try{D().validate(level);}catch(err){why=err.message;}}
      const now=clone(o);Object.assign(o,d.orig);
      if(why){note(why+' The object went back where it was.',true);paint();return;}
      remember();Object.assign(level.objects[d.i],now);px=now.x;py=now.y;pw=now.w;ph=now.h;render();note((d.size?'Resized ':'Moved ')+objectLabel(now)+'. Undo puts it back.');
    };
    cv.addEventListener('pointerup',drop);cv.addEventListener('pointercancel',e=>{if(drag&&drag.pid===e.pointerId){Object.assign(level.objects[drag.i],drag.orig);drag=null;paint();}});
    cv.addEventListener('keydown',e=>{
      const k=e.key,mv={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]}[k];
      if(mv){e.preventDefault();cursor.x=Math.max(0,Math.min(920,cursor.x+mv[0]*40));cursor.y=Math.max(0,Math.min(600,cursor.y+mv[1]*40));paint();}
      else if(k==='Enter'||k===' '){e.preventDefault();try{place(cursor.x+1,cursor.y+1);}catch(err){note(err.message,true);}dialog.querySelector('#cbCanvas').focus();}
    });
    cv.addEventListener('focus',paint);cv.addEventListener('blur',paint);
    cv.addEventListener('pointerleave',()=>{if(ghost||hover>=0){ghost=null;hover=-1;paint();}});
  }
  function selectObject(i){selected=i;const o=level.objects[i];px=o.x;py=o.y;pw=o.w;ph=o.h;if(o.kind==='custom')maker=level.customAssets.findIndex(a=>a.id===o.asset);render();}
  function layoutPreset(name){
    const shapes={courtyard:[[160,160,80,240],[720,160,80,240],[320,120,320,40],[320,480,320,40]],slalom:[[240,80,80,280],[560,280,80,280]],fire:[[240,160,160,40],[560,160,160,40],[240,440,160,40],[560,440,160,40]]};
    const candidate=clone(level);candidate.objects=shapes[name].map(r=>({kind:name==='fire'?'hazard':'wall',x:r[0],y:r[1],w:r[2],h:r[3]}));
    candidate.objects.push({kind:'banner',x:80,y:80,w:40,h:80},{kind:'tree',x:800,y:480,w:80,h:80},{kind:'heal',x:80,y:480,w:40,h:40});
    if(candidate.objective.type==='collect'){
      if(candidate.objective.target>30)throw Error('For a layout recipe, lower the collection target to 30 or fewer first.');
      for(let i=0;i<candidate.objective.target;i++)candidate.objects.push({kind:'coin',x:40+(i%15)*40,y:40+Math.floor(i/15)*40,w:40,h:40});
    }
    if(candidate.objective.type==='exit')candidate.objects.push({kind:'exit',x:840,y:280,w:80,h:80});
    setLevel(D().validate(candidate));note('Applied layout recipe. Use Undo to restore your previous arena.');
  }
  function draftList(){
    const list=dialog.querySelector('#cbDrafts');list.replaceChildren();
    let drafts;try{drafts=D().listDrafts();}catch(e){note(e.message,true);return;}
    if(!drafts.length){list.textContent='No saved recipes yet.';return;}
    drafts.forEach(d=>{const row=document.createElement('div');row.className='cb-draft';const title=document.createElement('span');title.textContent=d.title;row.append(title);
      [['Open',()=>{try{setLevel(D().decode(d.code));draftId=/^d[a-z0-9]{6,20}$/.test(d.id)?d.id:null;note('Opened draft. Saving updates it. Clear this recipe to enable sharing.');}catch(e){note(e.message,true);}}],['Delete',()=>{if(window.confirm('Delete this local draft?')){try{D().removeDraft(d.id);draftList();}catch(e){note(e.message,true);}}}]].forEach(([text,fn])=>{const b=document.createElement('button');b.type='button';b.className='btn ghost sm';b.textContent=text;b.onclick=fn;row.append(b);});list.append(row);});
  }
  function importCode(code){
    const next=D().decode(code);setLevel(next);draftId=null;note('Imported “'+next.title+'” by '+(next.author||'an unnamed creator')+'. Edit it to remix; a new local clear is needed before sharing.');
  }
  async function share(link){
    const valid=validate();if(proof!==D().fingerprint(valid))throw Error('Clear this exact recipe before sharing.');
    const code=D().encode(valid),url=new URL(window.location.href);url.hash='challenge='+encodeURIComponent(code);
    const value=link?url.href:code;dialog.querySelector('#cbCode').value=value;
    try{await navigator.clipboard.writeText(value);note((link?'Share link':'Challenge code')+' copied.');}
    catch(e){dialog.querySelector('#cbCode').focus();dialog.querySelector('#cbCode').select();note('Ready below. Select and copy the text to share.');}
  }
  function showAgain(){if(dialog&&!dialog.open){dialog.showModal();dialog.querySelector('[data-cb="play"]').focus();}}
  function play(){
    const valid=validate(),fp=D().fingerprint(valid);dialog.close();
    try{window.GRChallengePlay.start(valid,{
      onFinish(result){lastResult=result;if(result.won&&result.fingerprint===fp)proof=fp;},
      onQuit(){showAgain();updateSummary();note(lastResult?(lastResult.won?'Cleared! ':'Try again! ')+Number(lastResult.time||0).toFixed(1)+' seconds · '+(lastResult.kills||0)+' defeated · '+(lastResult.coins||0)+' coins.':'Back in the workshop. Your recipe is unchanged.');}
    });}catch(e){showAgain();throw e;}
  }
  function action(a){
    try{
      if(a==='close'){close();return;}
      if(a.startsWith('tab-')){showTab(a.slice(4));return;}
      if(a==='new'){if(window.confirm('Start a new level? Save a draft first if you want to keep this recipe.')){setLevel(D().defaults());draftId=null;}return;}
      if(a==='template'){setLevel(D().templates[Number(dialog.querySelector('#cbTemplates').value)].level);draftId=null;note('Recipe loaded. Make it your own.');return;}
      if(a==='save'){const had=draftId;draftId=draftId||D().newDraftId();D().saveDraft(validate(),draftId);draftList();note(had?'Draft updated in this browser.':'Saved as a new draft in this browser.');return;}
      if(a==='save-copy'){draftId=D().newDraftId();D().saveDraft(validate(),draftId);draftList();note('Saved as a new copy. Saving again now updates the copy.');return;}
      if(a==='undo'){if(undo.length){redo.push(clone(level));level=undo.pop();proof='';render();}return;}
      if(a==='redo'){if(redo.length){undo.push(clone(level));level=redo.pop();proof='';render();}return;}
      if(a==='play'){play();return;}
      if(a==='copy'||a==='link'){share(a==='link').catch(e=>note(e.message,true));return;}
      if(a==='import'){importCode(dialog.querySelector('#cbCode').value);return;}
      if(a==='hash'){if(!window.location.hash.includes('challenge='))throw Error('This page link has no challenge code. Paste a friend’s code above.');importCode(window.location.href);return;}
      if(a==='checker'){checker=!checker;const b=dialog.querySelector('[data-cb="checker"]');b.textContent='Checkerboard '+(checker?'on':'off');b.setAttribute('aria-pressed',String(checker));paintMaker();return;}
      if(a==='biome-colors'){const candidate=clone(level);candidate.appearance.palette='biome';const colors=window.GRChallengePlay.getPalette(candidate);remember();level.appearance.colors=colors;level.appearance.palette='custom';render();return;}
      if(a.startsWith('asset-')){
        const asset=level.customAssets[maker];
        if(a==='asset-new'||a.startsWith('asset-starter-')){
          if(level.customAssets.length>=8)throw Error('Use at most eight custom designs.');
          let n=1;while(level.customAssets.some(v=>v.id==='design'+n))n++;
          const shape=(s,x,y,w,h,color,rotation=0,opacity=1,strokeWidth=0)=>({shape:s,x,y,w,h,color,rotation,opacity,stroke:'#3a2b20',strokeWidth});
          const starters={
            lantern:{name:'Hanging lantern',solid:false,parts:[shape('rect',25,28,50,60,'#7a4a21',0,1,2),shape('ellipse',33,35,34,42,'#f2b33d',0,.8,1),shape('rect',45,5,10,25,'#3a2b20')]},
            crate:{name:'Timber crate',solid:true,parts:[shape('rect',8,12,84,80,'#c98a3c',0,1,3),shape('rect',18,22,64,60,'#7a4a21',0,1,2),shape('rect',45,12,10,80,'#c98a3c',40,1,1)]},
            crystal:{name:'Glowing crystal',solid:false,parts:[shape('triangle',8,15,64,80,'#9a5bd6',-12,.9,2),shape('triangle',40,25,50,65,'#c5a1ec',16,.7,1),shape('triangle',30,20,24,55,'#efe6d4',0,.4)]}
          };
          const design=a==='asset-new'?{name:'My object '+n,solid:false,parts:[shape('ellipse',10,30,80,60,'#C98A3C')]}:starters[a.slice(14)];
          if(!design)throw Error('Unknown starter design.');remember();level.customAssets.push(Object.assign({id:'design'+n},clone(design)));maker=level.customAssets.length-1;
        }else{
          if(!asset)throw Error('Create a design first.');
          if(a==='asset-delete'){
            if(level.objects.some(o=>o.kind==='custom'&&o.asset===asset.id))throw Error('This design is in use. Remove its placed objects before deleting it. Your design is unchanged.');
            remember();level.customAssets.splice(maker,1);maker=0;
          }else if(a==='asset-add'){
            if(asset.parts.length>=12)throw Error('A custom design holds at most 12 shape layers.');
            remember();asset.parts.push({shape:'triangle',x:25,y:5,w:50,h:50,color:'#F2B33D',rotation:0});
          }else{
            const p=a.split('-'),i=Number(p[2]);if(!asset.parts[i])throw Error('Choose a shape layer.');
            if(p[1]==='remove'){if(asset.parts.length<=1)throw Error('Keep at least one shape layer.');remember();asset.parts.splice(i,1);}
            else if(p[1]==='duplicate'){if(asset.parts.length>=12)throw Error('Use at most 12 shape layers.');remember();asset.parts.splice(i+1,0,clone(asset.parts[i]));}
            else if(p[1]==='center'){remember();asset.parts[i].x=(100-asset.parts[i].w)/2;asset.parts[i].y=(100-asset.parts[i].h)/2;}
            else if(p[1]==='mirror'){remember();asset.parts[i].x=100-asset.parts[i].x-asset.parts[i].w;asset.parts[i].rotation=-(asset.parts[i].rotation||0);}
            else{const j=i+(p[1]==='up'?-1:1);if(j<0||j>=asset.parts.length)return;remember();[asset.parts[i],asset.parts[j]]=[asset.parts[j],asset.parts[i]];}
          }
        }
        render();dialog.querySelector('#cbMaker').open=true;return;
      }
      if(a==='grid'){grid=!grid;const b=dialog.querySelector('[data-cb="grid"]');b.textContent='Grid '+(grid?'on':'off');b.setAttribute('aria-pressed',String(grid));paint();return;}
      if(a.startsWith('layout-')){layoutPreset(a.slice(7));return;}
      if(a.startsWith('preset-')){
        if(level.waves.length>=12)throw Error('The recipe already has 12 waves. Remove one first.');
        const preset={swarm:{delay:2,enemies:[{kind:'chaser',count:12,spawn:'north'}]},ambush:{delay:1,enemies:[{kind:'runner',count:4,spawn:'east'},{kind:'spitter',count:2,spawn:'west'}]},finale:{delay:3,enemies:[{kind:'brute',count:2,spawn:'south'},{kind:'chaser',count:4,spawn:'north'}]}}[a.slice(7)];
        const total=level.waves.reduce((n,w)=>n+w.enemies.reduce((m,g)=>m+g.count,0),0)+preset.enemies.reduce((n,g)=>n+g.count,0);if(total>240)throw Error('That preset would exceed the 240-enemy budget.');
        remember();level.waves.push(clone(preset));render();return;
      }
      if(a==='apply'||a==='clone'){
        if(!level.objects[selected])throw Error('Select an arena object first.');dimensions();
        const old=level.objects[selected],o=geometry(old.kind,px,py,old.asset);
        if(a==='clone'){
          if(old.kind==='exit')throw Error('Use one exit per arena. Move it instead.');
          if(level.objects.length>=48)throw Error('Remove an object before duplicating.');
          o.x=Math.max(0,Math.min(960-o.w,o.x+40));o.y=Math.max(0,Math.min(640-o.h,o.y+40));
          geometry(o.kind,o.x,o.y,o.asset);remember();level.objects.push(o);selected=level.objects.length-1;
        }else{remember();level.objects[selected]=o;}
        px=o.x;py=o.y;render();return;
      }
      if(a==='place'){const x=Number(dialog.querySelector('#cbX').value),y=Number(dialog.querySelector('#cbY').value);if(!Number.isFinite(x)||!Number.isFinite(y))throw Error('Enter numeric coordinates.');place(x,y);return;}
      if(a.startsWith('tool-')){tool=a.slice(5);dialog.querySelectorAll('[data-cb^="tool-"]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.cb==='tool-'+tool)));updateSummary();return;}
      const p=a.split('-'),i=Number(p[1]),j=Number(p[2]);
      if(p[0]==='select'){selectObject(i);return;}
      if(p[0]==='object'){remember();level.objects.splice(i,1);selected=-1;}
      else if(a==='add-wave'&&level.waves.length<12){remember();level.waves.push({delay:2,enemies:[{kind:'chaser',count:5,spawn:'north'}]});}
      else if(p[0]==='dup'&&level.waves.length<12){remember();level.waves.splice(i+1,0,clone(level.waves[i]));}
      else if(p[0]==='delwave'&&level.waves.length>1){remember();level.waves.splice(i,1);}
      else if(p[0]==='group'&&level.waves[i].enemies.length<4){remember();level.waves[i].enemies.push({kind:'runner',count:3,spawn:'east'});}
      else if(p[0]==='delgroup'&&level.waves[i].enemies.length>1){remember();level.waves[i].enemies.splice(j,1);}
      else if((p[0]==='up'&&i>0)||(p[0]==='down'&&i<level.waves.length-1)){remember();const k=i+(p[0]==='up'?-1:1);[level.waves[i],level.waves[k]]=[level.waves[k],level.waves[i]];}
      else return;render();
    }catch(e){note(e.message||'That recipe could not be loaded.',true);}
  }
  function showTab(t){
    if(!TABS.some(x=>x[0]===t))return;tab=t;dialog.dataset.tab=t;
    dialog.querySelectorAll('[data-cb^="tab-"]').forEach(b=>{const on=b.dataset.cb==='tab-'+t;b.classList.toggle('ghost',!on);b.setAttribute('aria-selected',String(on));});
    if(t==='designs'){const m=dialog.querySelector('#cbMaker');if(m)m.open=true;}
    if(t==='arena')paint();
  }
  /* a controller in the workshop: the stick or D-pad moves between controls (or the cursor on the focused arena), left and right change a list or a number,
     A presses (or places on the arena), B closes, LB and RB change tab */
  function padTick(){
    if(!dialog||!dialog.open){padLoop=0;return;}
    padLoop=requestAnimationFrame(padTick);
    if(document.getElementById('challengePlay'))return;
    let gp=null;try{for(const g of (navigator.getGamepads?navigator.getGamepads():[]))if(g&&g.connected){gp=g;break;}}catch(e){}
    if(!gp)return;
    const b=i=>!!(gp.buttons[i]&&(gp.buttons[i].pressed||gp.buttons[i].value>.5)),edge=i=>b(i)&&!padPrev[i];
    const ax=Math.abs(gp.axes[0]||0)>.5?Math.sign(gp.axes[0]):0,ay=Math.abs(gp.axes[1]||0)>.5?Math.sign(gp.axes[1]):0;
    const mx=(b(15)?1:0)-(b(14)?1:0)||ax,my=!mx?((b(13)?1:0)-(b(12)?1:0)||ay):0,cur=document.activeElement;
    if(mx||my){padRep-=1/60;if(!padDir||padRep<=0){padRep=padDir?.13:.38;padDir=true;padMove(cur,mx,my);}}else{padDir=false;padRep=0;}
    if(edge(0)){if(cur&&cur.id==='cbCanvas'){try{place(cursor.x+1,cursor.y+1);}catch(e){note(e.message,true);}dialog.querySelector('#cbCanvas').focus();}else if(cur&&dialog.contains(cur)&&(cur.tagName==='BUTTON'||cur.tagName==='SUMMARY'||cur.type==='checkbox'))cur.click();else padMove(null,0,1);}
    if(edge(1))close();
    if(edge(4)||edge(5)){const i=TABS.findIndex(t=>t[0]===tab);showTab(TABS[(i+(edge(5)?1:TABS.length-1))%TABS.length][0]);}
    padPrev=gp.buttons.map(x=>!!x.pressed);
  }
  function padMove(cur,mx,my){
    if(cur&&cur.id==='cbCanvas'){cursor.x=Math.max(0,Math.min(920,cursor.x+mx*40));cursor.y=Math.max(0,Math.min(600,cursor.y+my*40));paint();return;}
    if(cur&&mx&&cur.tagName==='SELECT'){cur.selectedIndex=Math.max(0,Math.min(cur.options.length-1,cur.selectedIndex+mx));cur.dispatchEvent(new Event('change',{bubbles:true}));return;}
    if(cur&&mx&&cur.type==='number'){const st=Number(cur.step)||1,v=Number(cur.value)+mx*st,lo=cur.min===''?-1e9:Number(cur.min),hi=cur.max===''?1e9:Number(cur.max);cur.value=String(Math.round(Math.max(lo,Math.min(hi,v))*1000)/1000);cur.dispatchEvent(new Event('change',{bubbles:true}));return;}
    const list=Array.from(dialog.querySelectorAll('button,input,select,textarea,summary,canvas[tabindex]')).filter(el=>!el.disabled&&el.getClientRects().length&&el.getBoundingClientRect().width>0);
    if(!list.length)return;
    if(!cur||!dialog.contains(cur)||list.indexOf(cur)<0){list[0].focus();return;}
    const cr=cur.getBoundingClientRect(),cx=cr.left+cr.width/2,cy=cr.top+cr.height/2;let best=null,bs=1e9;
    for(const el of list){if(el===cur)continue;const r=el.getBoundingClientRect(),ex=r.left+r.width/2-cx,ey=r.top+r.height/2-cy,along=ex*mx+ey*my;if(along<=2)continue;const sc=along+Math.abs(ex*my-ey*mx)*2.2;if(sc<bs){bs=sc;best=el;}}
    if(best){best.focus();try{best.scrollIntoView({block:'nearest'});}catch(e){}}
  }
  function open(){
    if(dialog?.open)return;cbStyle();oldFocus=document.activeElement;
    if(!level)level=clone((D().templates.find(t=>t.level.objects.some(o=>o.kind==='tree'||o.kind==='banner'))||{level:D().defaults()}).level);
    if(!dialog){
      dialog=document.createElement('dialog');dialog.id='challengeBuilder';dialog.className='cb-dialog';dialog.setAttribute('aria-labelledby','cbTitle');document.body.append(dialog);
      dialog.addEventListener('click',e=>{const b=e.target.closest('[data-cb]');if(b){e.preventDefault();action(b.dataset.cb);}});
      const edit=e=>{const el=e.target;if(el.id==='cbAssetPicker'){maker=Number(el.value);render();return;}if(!el.dataset.path)return;update(el.dataset.path,el.type==='checkbox'?el.checked:el.type==='number'||el.dataset.path==='appearance.detail'?Number(el.value):el.value);};
      dialog.addEventListener('input',edit);dialog.addEventListener('change',edit);
      dialog.addEventListener('cancel',e=>{e.preventDefault();close();});
      dialog.addEventListener('keydown',e=>{e.stopPropagation();});dialog.addEventListener('keyup',e=>{e.stopPropagation();});
    }
    render();dialog.showModal();dialog.querySelector('[data-cb="close"]').focus();
    if(!padLoop)padLoop=requestAnimationFrame(padTick);
    if(window.location.hash.includes('challenge='))note('This link includes a challenge. Choose “Read level from this page’s link” to review it. Nothing runs automatically.');
  }
  function close(){if(dialog){dialog.close();oldFocus?.focus();}}
  return {open,close,importFromHash(){open();action('hash');},isOpen(){return !!(dialog&&dialog.open);},tab(t){if(t)showTab(t);return tab;}};
})();
window.GRChallengeUI=GRChallengeUI;
/* the offer shown for a challenge link while the add-on is off */
function challengeLinkOffer(){
  const d = document.createElement('dialog'); d.id = 'cbLinkOffer'; d.className = 'panel slab';
  d.style.cssText = 'max-width:440px;width:calc(100% - 32px);padding:22px;color:var(--bone);font:inherit';
  d.innerHTML = '<h2 class="head" style="margin-top:0">A challenge for you</h2><p class="sub">This link carries a level made in the <b>Challenge Workshop</b>, an add-on that is switched off. Switch it on to look at the level? Nothing plays by itself, and it never touches your progress.</p>' +
    '<div class="row" style="justify-content:flex-end;gap:10px;margin-top:14px"><button type="button" class="btn sm ghost" data-x="no">Not now</button><button type="button" class="btn sm" data-x="yes">Switch it on and open</button></div>';
  document.body.appendChild(d);
  d.addEventListener('click', function(e){
    const b = e.target.closest('[data-x]'); if (!b) return;
    d.close(); d.remove();
    if (b.dataset.x === 'yes'){ addonSet('challenges', true); SFX.click(); GRChallengeUI.importFromHash(); }
  });
  d.addEventListener('cancel', function(){ d.remove(); });
  d.showModal();
}
/* the way in, only while the add-on is on: with it off the menu, the actions and the Guide are exactly as before */
(function(){
  const baseTownButton = townButtonHTML;
  townButtonHTML = function(){
    const h = baseTownButton.apply(this, arguments);
    return addonOn('challenges') ? h + '<button class="btn ghost" data-a="challenge-open">Challenge Workshop<small>Build a level · clear it · share a code</small></button>' : h;
  };
  const baseAction = handleAction;
  handleAction = function(a){
    if (a === 'challenge-open'){ if (addonOn('challenges')){ SFX.click(); GRChallengeUI.open(); } else SFX.deny(); return; }
    return baseAction.apply(this, arguments);
  };
  /* a playtest gets its own music: the biome's song, harder while a brute or a badger is out, quieter when paused, then the win or loss tune */
  const baseMusic = Music.refresh;
  Music.refresh = function(){
    const r = baseMusic.apply(this, arguments);
    const m = addonOn('challenges') && GRChallengePlay.mood ? GRChallengePlay.mood() : null;
    if (m && this.want){ this.want.theme = m.ended ? (m.won ? 'victory' : 'defeat') : m.theme; this.want.lvl = m.ended ? (m.won ? 1 : 0) : m.paused ? 0 : m.boss ? 2 : 1; this.want.shift = 0; this.want.dense = false; }
    return r;
  };
  /* while the workshop or a playtest is open the game's own controller handling stands aside (the workshop reads the controller itself) */
  const basePoll = Pad.poll;
  Pad.poll = function(){
    if (addonOn('challenges') && (GRChallengeUI.isOpen() || document.getElementById('challengePlay'))){
      try { const gps = navigator.getGamepads ? navigator.getGamepads() : []; let gp = null; for (let i = 0; i < gps.length; i++) if (gps[i] && gps[i].connected){ gp = gps[i]; break; } this.prev = gp ? gp.buttons.map(function(x){ return !!x.pressed; }) : []; } catch (e) {}
      return;
    }
    return basePoll.apply(this, arguments);
  };
  /* someone opened a challenge link: with the add-on on, the workshop opens on it (nothing plays by itself); with it off, the game offers to switch it on */
  let linkSeen = false;
  const baseMenu = showMenu;
  showMenu = function(){
    const r = baseMenu.apply(this, arguments);
    try {
      if (!linkSeen && !G.splash && /[#&]challenge=GRC1/.test(window.location.hash)){
        linkSeen = true;
        if (addonOn('challenges')) GRChallengeUI.importFromHash(); else challengeLinkOffer();
      }
    } catch (e) {}
    return r;
  };
  GUIDE_TOPICS.push({ id: 'challenges', title: 'Challenge Workshop', show: function(){ return addonOn('challenges'); }, html: function(){
    return '<p>Open Challenge Workshop from the main menu to build a separate, small arena challenge. Choose waves, place objects, set an objective and pick a fixed starting kit. These challenges do not use campaign equipment and cannot award campaign progress.</p><p>Save drafts in this browser, or clear the exact recipe to copy a share code or link. Friends with the add-on on can paste it into Import / remix. A local clear is not online anti-cheat verification. Editing a recipe resets its sharing check. Drafts do not travel with cloud saves.</p><p>It is an add-on: switch it on or off on the Add-ons page.</p>';
  } });
})();
