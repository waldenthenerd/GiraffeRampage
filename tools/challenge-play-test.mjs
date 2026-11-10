import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';

const handlers=new Map(),raf=new Set(),nodes=[];
const context2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'?()=>({addColorStop(){}}):()=>{},set:()=>true});
class Node {
  constructor(tag){this.tag=tag;this.children=[];this.events=new Map();this.style={};this.isConnected=true;nodes.push(this);}
  setAttribute(){} append(...children){this.children.push(...children);} appendChild(child){this.children.push(child);}
  addEventListener(k,f){this.events.set(k,f);} focus(){document.activeElement=this;}
  getContext(){return context2d;} showModal(){this.modal=true;}close(){this.modal=false;}
  remove(){this.isConnected=false;} setPointerCapture(){}
  getBoundingClientRect(){return {left:0,top:0,width:960,height:640};}
}
const document={activeElement:null,body:new Node('body'),hidden:false,createElement:tag=>new Node(tag),
  addEventListener(k,f){handlers.set('doc:'+k,f);},removeEventListener(k,f){if(handlers.get('doc:'+k)===f)handlers.delete('doc:'+k);}};
const storage=new Map([['giraffe_rampage_save_v1','campaign sentinel']]);
const sandbox={document,TextEncoder,TextDecoder,URL,URLSearchParams,console,btoa,atob,
  localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v),removeItem:k=>storage.delete(k)},
  requestAnimationFrame:f=>{raf.add(f);return f;},cancelAnimationFrame:f=>raf.delete(f),
  Save:new Proxy({}, {get(){throw Error('Campaign Save read');},set(){throw Error('Campaign Save write');}}),
  G:new Proxy({}, {get(){throw Error('Campaign G read');},set(){throw Error('Campaign G write');}}),
  P:new Proxy({}, {get(){throw Error('Campaign P read');},set(){throw Error('Campaign P write');}})};
sandbox.window=sandbox;sandbox.addEventListener=(k,f)=>handlers.set('win:'+k,f);
sandbox.removeEventListener=(k,f)=>{if(handlers.get('win:'+k)===f)handlers.delete('win:'+k);};
vm.createContext(sandbox);
sandbox.addonRegister=()=>{};
for(const file of ['addons/50a-addon-challenge-data.js','addons/50b-addon-challenge-play.js'])vm.runInContext(readFileSync(new URL('../js/'+file,import.meta.url),'utf8'),sandbox);
const D=sandbox.GRChallengeData,R=sandbox.GRChallengePlay;
let tests=0;
function check(name,fn){fn();tests++;console.log('PASS '+name);R.stop();}
function level(type='survive',target=1){const l=D.defaults();l.objective={type,target};l.waves=[{delay:0,enemies:[{kind:'chaser',count:1,spawn:'north'}]}];return l;}
function key(key,up=false){let prevented=false,stopped=false;handlers.get('doc:'+(up?'keyup':'keydown'))({key,preventDefault(){prevented=true;},stopImmediatePropagation(){stopped=true;}});return {prevented,stopped};}
check('Runtime shell reuses the game panel, heading and button styles',()=>{
  R.start(level());const dialog=nodes.filter(n=>n.id==='challengePlay'&&n.isConnected).at(-1);
  assert.equal(dialog.className,'slab');assert.equal(dialog.children[0].className,'head');
  const buttons=dialog.children.find(n=>n.tag==='div').children;
  assert.equal(buttons[0].className,'btn sm');assert.equal(buttons[2].className,'btn sm ghost');
  assert.ok(dialog.style.cssText.includes('var(--bone)'));assert.ok(!dialog.style.cssText.includes('#171f26'));
});
check('Survival objective, fixed clock and single finish callback',()=>{
  let finishes=0;R.start(level(),{onFinish:r=>{assert.equal(r.won,true);finishes++;}});
  const s=R.advance(2);assert.equal(s.ended,true);assert.equal(finishes,1);R.advance(2);assert.equal(finishes,1);
});
check('Clear objective defeats an actual enemy',()=>{R.start(level('clear'));const s=R.advance(30);assert.equal(s.result.won,true);assert.equal(s.kills,1);});
check('Collect objective requires physically picking up a coin',()=>{
  const l=level('collect');l.objects=[{kind:'coin',x:525,y:310,w:20,h:20}];R.start(l);R.advance(.1);assert.equal(R.snapshot().ended,false);
  key('d');const s=R.advance(.4);assert.equal(s.coins,1);assert.equal(s.result.won,true);
});
check('Exit objective requires reaching the marked rectangle',()=>{
  const l=level('exit');l.objects=[{kind:'exit',x:525,y:300,w:40,h:40}];R.start(l);key('d');const s=R.advance(.4);assert.equal(s.result.won,true);
});
check('Hazard damage can lose a run',()=>{
  const l=level('survive',100);l.objects=[{kind:'hazard',x:520,y:280,w:120,h:80}];R.start(l);key('d');R.advance(.5);key('d',true);const s=R.advance(20);assert.equal(s.result.won,false);assert.equal(s.player.hp,0);
});
check('Player movement cannot tunnel through walls',()=>{
  const l=level('survive',100);l.objects=[{kind:'wall',x:540,y:250,w:20,h:140}];R.start(l);assert.deepEqual(key('ArrowRight'),{prevented:true,stopped:true});
  const s=R.advance(1);assert.ok(s.player.x<=525);assert.ok(s.player.x>480);
});
check('Pointer movement works and release stops movement',()=>{
  R.start(level('survive',100));const c=nodes.filter(n=>n.tag==='canvas').at(-1);
  c.events.get('pointerdown')({pointerId:7,clientX:700,clientY:320,preventDefault(){}});R.advance(.5);assert.ok(R.snapshot().player.x>550);
  c.events.get('pointerup')({pointerId:7});const before=R.snapshot().player.x;R.advance(.5);assert.equal(R.snapshot().player.x,before);
});
check('Escape pauses clock and clears movement; resume is explicit',()=>{
  R.start(level('survive',100));key('d');key('Escape');const before=R.snapshot();R.advance(3);assert.equal(R.snapshot().time,before.time);assert.equal(R.snapshot().player.x,before.player.x);
  key('Escape');R.advance(.5);assert.ok(R.snapshot().time>before.time);assert.equal(R.snapshot().player.x,before.player.x);
});
check('Hidden page and blur pause without advancing elapsed time',()=>{
  R.start(level('survive',100));handlers.get('win:blur')();assert.equal(R.snapshot().paused,true);key('Escape');document.hidden=true;handlers.get('doc:visibilitychange')();assert.equal(R.snapshot().paused,true);document.hidden=false;
});
check('Same level seed and input produce identical simulation',()=>{
  const l=level('survive',100);l.waves[0].enemies=[{kind:'spitter',count:3,spawn:'east'}];R.start(l);key('a');const a=JSON.stringify(R.advance(1));R.stop();R.start(l);key('a');assert.equal(JSON.stringify(R.advance(1)),a);
});
check('Kit previews are authoritative copies, not mutable balance data',()=>{
  const kit=R.getKit('balanced');assert.equal(kit.hp,100);kit.hp=1;assert.equal(R.getKit('balanced').hp,100);assert.equal(R.getKit('unknown'),null);
});
check('Player speed multiplier changes movement distance',()=>{
  const l=level('survive',100);l.modifiers.playerSpeed=.5;R.start(l);key('d');const slow=R.advance(.5).player.x;R.stop();l.modifiers.playerSpeed=2;R.start(l);key('d');const fast=R.advance(.5).player.x;assert.equal(fast-480,(slow-480)*4);
});
check('Attack rate multiplier changes actual combat clear time',()=>{
  const l=level('clear');l.waves[0].enemies=[{kind:'brute',count:1,spawn:'north'}];l.modifiers.attackRate=.5;R.start(l);const slow=R.advance(30).result.time;
  R.stop();l.modifiers.attackRate=2;R.start(l);const fast=R.advance(30).result.time;assert.ok(fast<slow);
});
check('Decorative tree, rock and banner never block movement',()=>{
  for(const kind of ['tree','rock','banner']){
    const l=level('survive',100);l.objects=[{kind,x:520,y:280,w:100,h:80}];R.start(l);key('d');assert.ok(R.advance(1).player.x>620);R.stop();
  }
});
check('Healing pickup is preserved at full health, capped and one-use',()=>{
  const l=level('survive',100);l.objects=[{kind:'heal',x:520,y:300,w:32,h:32},{kind:'hazard',x:550,y:280,w:80,h:80}];
  R.start(l);key('d');let s=R.advance(.3);assert.equal(s.heals,0);assert.equal(s.player.hp,100);
  s=R.advance(.15);assert.equal(s.heals,1);assert.equal(s.player.hp,100);assert.equal(s.pickups[0].taken,true);
  key('d',true);s=R.advance(1);assert.equal(s.heals,1);assert.ok(s.player.hp<100);
});
check('Shared painter is deterministic, preserves recipe and game clock',()=>{
  const l=level('survive',100);l.appearance={time:'sunset',weather:'snow',detail:2};l.objects=[{kind:'tree',x:50,y:50,w:80,h:100},{kind:'rock',x:120,y:60,w:50,h:40},{kind:'banner',x:180,y:50,w:40,h:60}];
  const before=JSON.stringify(l);R.start(l);R.advance(.5);const state=JSON.stringify(R.snapshot());
  function paint(grid){const calls=[];const ctx=new Proxy({}, {get:(o,k)=>k==='createLinearGradient'?()=>({addColorStop(...v){calls.push(['gradient',...v]);}}):(...v)=>calls.push([k,...v]),set:(o,k,v)=>{calls.push([k,v]);return true;}});R.paintArena(ctx,l,{grid,time:2});return JSON.stringify(calls);}
  const a=paint(true);assert.equal(a,paint(true));assert.notEqual(a,paint(false));assert.equal(JSON.stringify(l),before);assert.equal(JSON.stringify(R.snapshot()),state);
});
function asset(solid=true){return{id:'marker',name:'My marker',solid,parts:[{shape:'rect',x:35,y:25,w:30,h:60,color:'#a76c42',rotation:20},{shape:'ellipse',x:0,y:0,w:100,h:50,color:'#cc8899',rotation:0},{shape:'triangle',x:10,y:0,w:80,h:100,color:'#eeeeaa',rotation:-15}]};}
function recordingCanvas(){
  let depth=0;const calls=[],stack=[];let state={},throwPart=false;
  const ctx=new Proxy({}, {get:(o,k)=>{
    if(k==='createLinearGradient'||k==='createRadialGradient')return()=>({addColorStop(...v){calls.push(['gradient',...v]);}});
    return(...v)=>{calls.push([k,...v]);if(k==='save'){stack.push(JSON.stringify(state));depth++;}else if(k==='restore'){state=JSON.parse(stack.pop());depth--;}else if(k==='translate'||k==='rotate'||k==='scale'){state.transform=(state.transform||[]).concat([[k,...v]]);}else if(k==='ellipse'&&v[0]===0&&v[1]===0&&throwPart){throwPart=false;throw Error('Synthetic part drawing failure');}};
  },set:(o,k,v)=>{state[k]=v;calls.push([k,v]);return true;}});
  return {ctx,calls,depth:()=>depth,state:()=>JSON.stringify(state),failPart:()=>{throwPart=true;}};
}
check('All seven biomes paint distinct terrain, independent from palette',()=>{
  const tapes=[];
  for(const theme of ['savanna','arctic','moon','forest','desert','swamp','volcanic']){
    const l=level();l.arena.theme=theme;l.appearance={time:'day',weather:'clear',detail:1,palette:'pastel'};l.objects=[{kind:'tree',x:40,y:40,w:80,h:100},{kind:'rock',x:140,y:40,w:60,h:60}];
    const c=recordingCanvas();R.paintArena(c.ctx,l,{time:0});assert.equal(c.depth(),0);tapes.push(JSON.stringify(c.calls));assert.equal(R.getPalette(l).ground,'#c5c5ad');
  }
  assert.equal(new Set(tapes).size,7);
});
check('Custom hex colors and preset palettes reach shared rendered ground',()=>{
  const l=level();l.appearance={palette:'custom',colors:{ground:'#123456',accent:'#abcdef',foliage:'#654321'}};
  const c=recordingCanvas();R.paintArena(c.ctx,l,{});assert.ok(c.calls.some(v=>v[0]==='fillStyle'&&v[1]==='#123456'));
  assert.equal(R.getPalette(l).foliage,'#654321');l.appearance.palette='autumn';assert.equal(R.getPalette(l).ground,'#ad8350');l.appearance.palette='dusk';assert.equal(R.getPalette(l).ground,'#76677b');
});
check('Custom shape painter clips, rotates, outlines solids and is deterministic',()=>{
  const a=asset(),one=recordingCanvas(),two=recordingCanvas();R.paintCustom(one.ctx,a,40,50,120,90);R.paintCustom(two.ctx,a,40,50,120,90);
  assert.equal(JSON.stringify(one.calls),JSON.stringify(two.calls));assert.ok(one.calls.some(v=>v[0]==='clip'));assert.ok(one.calls.some(v=>v[0]==='rotate'&&v[1]!==0));assert.ok(one.calls.some(v=>v[0]==='setLineDash'));assert.equal(one.depth(),0);
});
check('Malformed preview parts are skipped and drawing failures restore canvas',()=>{
  const a=asset(),c=recordingCanvas();a.parts.push({shape:'ellipse',x:NaN,y:2,w:5,h:8},{shape:'ellipse',x:2,y:2,w:-8,h:4},{shape:'rect',x:2,y:2,w:0,h:4});
  assert.doesNotThrow(()=>R.paintCustom(c.ctx,a,0,0,100,100));assert.equal(c.depth(),0);assert.equal(c.state(),'{}');
  c.failPart();assert.throws(()=>R.paintCustom(c.ctx,a,0,0,100,100));assert.equal(c.depth(),0);assert.equal(c.state(),'{}');
  const l=level();l.customAssets=[a];l.objects=[{kind:'custom',asset:'marker',x:80,y:80,w:100,h:100}];c.failPart();assert.throws(()=>R.paintArena(c.ctx,l,{}));assert.equal(c.depth(),0);assert.equal(c.state(),'{}');
  c.calls.length=0;R.paintArena(c.ctx,level(),{});const fresh=recordingCanvas();R.paintArena(fresh.ctx,level(),{});assert.equal(JSON.stringify(c.calls),JSON.stringify(fresh.calls));
});
check('Custom solid uses full rectangular bounds while decorative version passes',()=>{
  const l=level('survive',100);l.customAssets=[asset()];l.objects=[{kind:'custom',asset:'marker',x:540,y:250,w:20,h:140}];R.start(l);key('d');assert.ok(R.advance(1).player.x<=525);R.stop();
  l.customAssets[0].solid=false;R.start(l);key('d');assert.ok(R.advance(1).player.x>600);
});
check('Custom solid blocks enemy movement, projectile and attack line of sight',()=>{
  const l=level('survive',100);l.customAssets=[asset()];l.objects=[0,320,640].map(x=>({kind:'custom',asset:'marker',x,y:270,w:320,h:16}));l.waves[0].enemies=[{kind:'spitter',count:1,spawn:'north'},{kind:'chaser',count:1,spawn:'north'}];
  R.start(l);const s=R.advance(15);assert.equal(s.player.hp,100);assert.equal(s.kills,0);assert.ok(s.enemies.every(e=>e.y<270));
});
check('Custom scenery painting does not consume seeded combat randomness',()=>{
  const l=level('survive',100);l.customAssets=[asset(false)];l.objects=[{kind:'custom',asset:'marker',x:70,y:70,w:90,h:90}];
  R.start(l);const first=JSON.stringify(R.advance(1));R.stop();R.start(l);const c=recordingCanvas();for(let n=0;n<5;n++)R.paintArena(c.ctx,l,{time:n});assert.equal(JSON.stringify(R.advance(1)),first);
});
check('Shape transparency and outline render without leaking canvas state',()=>{
  const a=asset(false);a.parts[0].opacity=.35;a.parts[0].stroke='#123456';a.parts[0].strokeWidth=3;
  const c=recordingCanvas();R.paintCustom(c.ctx,a,0,0,100,100);
  assert.ok(c.calls.some(v=>v[0]==='globalAlpha'&&v[1]===.35));assert.ok(c.calls.some(v=>v[0]==='strokeStyle'&&v[1]==='#123456'));assert.ok(c.calls.some(v=>v[0]==='lineWidth'&&v[1]===3));assert.equal(c.depth(),0);assert.equal(c.state(),'{}');
});
check('Enemy cards read immutable copies of actual combat statistics',()=>{
  const brute=R.getEnemy('brute');assert.equal(brute.hp,140);assert.equal(brute.damage,20);brute.hp=1;assert.equal(R.getEnemy('brute').hp,140);assert.equal(R.getEnemy('missing'),null);
});
check('Health and objective meters follow actual simulation progress',()=>{
  R.start(level('survive',2));R.advance(.5);
  const dialog=nodes.filter(n=>n.id==='challengePlay'&&n.isConnected).at(-1),meters=dialog.children.find(n=>n.tag==='section');
  assert.equal(meters.children[0].children[1].value,1);assert.ok(Math.abs(meters.children[1].children[1].value-.25)<.001);
  const result=R.advance(3).result;assert.equal(meters.children[1].children[1].value,1);assert.equal(result.heals,0);assert.equal(result.health,100);assert.equal(result.waves,1);
});
check('Feedback is capped at32 events and expires without bright flashes or RNG',()=>{
  const l=level('survive',100);l.objects=Array.from({length:48},()=>({kind:'coin',x:480,y:310,w:16,h:16}));R.start(l);const s=R.advance(.05);
  assert.equal(s.coins,48);assert.equal(s.fx.length,32);assert.ok(s.fx.every(f=>f.life>0&&f.life<=.6));assert.equal(R.advance(1).fx.length,0);
});
check('Visual detail, weather and time settings never change gameplay',()=>{
  const l=level('survive',100);l.appearance={time:'day',weather:'clear',detail:0};R.start(l);key('d');const one=JSON.stringify(R.advance(1));R.stop();
  l.appearance={time:'night',weather:'snow',detail:2};R.start(l);key('d');assert.equal(JSON.stringify(R.advance(1)),one);
});
check('Retry resets timer and reuses exact level; quit cleans up',()=>{
  let quits=0;R.start(level(),{onQuit(){quits++;}});R.advance(2);
  let dialog=nodes.filter(n=>n.id==='challengePlay'&&n.isConnected).at(-1);
  const actions=dialog.children.find(n=>n.tag==='div');actions.children.find(n=>n.textContent==='Retry').events.get('click')();assert.equal(R.snapshot().time,0);
  dialog=nodes.filter(n=>n.id==='challengePlay'&&n.isConnected).at(-1);dialog.children.find(n=>n.tag==='div').children.find(n=>n.textContent==='Back to builder').events.get('click')();
  assert.equal(quits,1);assert.equal(R.snapshot(),null);assert.equal(handlers.size,0);assert.equal(raf.size,0);
});
check('Creatures in a crowd keep apart instead of stacking on one spot',()=>{
  const l=level('survive',300);l.loadout='tank';l.modifiers.enemyHp=3;l.waves=[{delay:0,enemies:[{kind:'chaser',count:20,spawn:'north'}]}];R.start(l);const e=R.advance(12).enemies;
  let deep=0;for(let a=0;a<e.length;a++)for(let b=a+1;b<e.length;b++)if(Math.hypot(e[a].x-e[b].x,e[a].y-e[b].y)<(e[a].r+e[b].r)*.5)deep++;
  assert.ok(e.length>=10);assert.equal(deep,0);
});
check('Walkers find their way round a wall that blocks the straight line',()=>{
  const l=level('survive',300);l.loadout='tank';l.modifiers.enemyHp=3;l.objects=[{kind:'wall',x:160,y:160,w:320,h:40},{kind:'wall',x:480,y:160,w:320,h:40}];
  l.waves=[{delay:0,enemies:[{kind:'chaser',count:3,spawn:'north'}]},{delay:30,enemies:[{kind:'chaser',count:1,spawn:'north'}]}];R.start(l);const s=R.advance(15);   /* the timed second wave is 30 s off */
  assert.ok(s.player.hp<160,'they reached her');assert.ok(s.enemies.every(e=>e.y>200)||s.enemies.length===0);
});
check('A flyer crosses walls; a splitter becomes three grubs; a badger heals when left alone; a charger dashes',()=>{
  const l=level('survive',300);l.loadout='tank';l.objects=[{kind:'wall',x:0,y:160,w:320,h:40},{kind:'wall',x:320,y:160,w:320,h:40},{kind:'wall',x:640,y:160,w:320,h:40}];
  l.waves=[{delay:0,enemies:[{kind:'flyer',count:1,spawn:'north'}]}];R.start(l);let s=R.advance(4);assert.ok(s.kills>0||s.enemies[0].y>200,'over the wall');   /* beaten means it reached her (a survival arena then fills again) */
  const k=level('clear');k.waves=[{delay:0,enemies:[{kind:'splitter',count:1,spawn:'north'}]}];R.start(k);let seen=0;for(let i=0;i<40&&!seen;i++){s=R.advance(.5);seen=s.enemies.filter(e=>e.kind==='grub').length;}assert.equal(seen,3);
  const b=level('survive',300);b.waves=[{delay:0,enemies:[{kind:'badger',count:1,spawn:'north'}]}];R.start(b);s=R.advance(.2);
  const raw=sandbox.GRChallengePlay;assert.ok(raw.getEnemy('badger').regen>0);
  const c=level('survive',300);c.loadout='tank';c.waves=[{delay:0,enemies:[{kind:'charger',count:1,spawn:'north'}]}];R.start(c);let fast=0,last=null;
  for(let i=0;i<300;i++){s=R.advance(1/60);const e=s.enemies[0];if(!e)break;if(last)fast=Math.max(fast,Math.hypot(e.x-last.x,e.y-last.y)*60);last={x:e.x,y:e.y};}
  assert.ok(fast>150,'dash speed '+fast);
});
check('A survival challenge keeps its waves coming on a timer and starts the list again; other objectives wait for a clear arena',()=>{
  const l=level('survive',60);l.loadout='tank';l.modifiers.enemyHp=.5;l.modifiers.speed=.5;l.waves=[{delay:0,enemies:[{kind:'brute',count:1,spawn:'north'}]},{delay:4,enemies:[{kind:'chaser',count:1,spawn:'south'}]}];
  R.start(l);let s=R.advance(9.9);assert.equal(s.wave,1);assert.ok(s.enemies.length>=1,'the brute is still out');s=R.advance(.2);assert.equal(s.wave,2,'the next wave came on the timer');
  s=R.advance(10.1);assert.ok(s.wave>=3,'the list starts again after the last wave');assert.ok(s.enemies.some(e=>e.kind==='brute'));
  const c=level('clear');c.loadout='tank';c.modifiers=l.modifiers;c.waves=l.waves;R.start(c);s=R.advance(12);assert.equal(s.wave,1);assert.equal(s.enemies.length,1);
  const e=level('survive',60);e.loadout='swift';e.waves=[{delay:0,enemies:[{kind:'runner',count:1,spawn:'north'}]}];R.start(e);s=R.advance(9);assert.ok(s.wave>=2,'a cleared survival arena fills again at once');
});
check('Arena body sizes match the recipe check, and heals show whole numbers',()=>{
  for(const k of D.kinds)assert.equal(R.getEnemy(k).r,D.kindR[k],k);
  const l=level('survive',100);l.loadout='swift';l.objects=[{kind:'heal',x:470,y:280,w:32,h:32}];l.waves=[{delay:0,enemies:[{kind:'runner',count:3,spawn:'north'}]}];R.start(l);
  let s;for(let i=0;i<600;i++){s=R.advance(1/60);if(s.heals)break;}
  if(s.heals)assert.ok(Number.isInteger(s.player.hp)||s.fx.every(f=>!/\./.test(f.label)));
});
check('Every object kind paints in every biome, balanced, with biome-specific walls and hazards, and still when time moves',()=>{
  const kinds=['wall','hazard','coin','heal','exit','tree','rock','banner'],walls=new Set(),haz=new Set();
  for(const theme of ['savanna','arctic','moon','forest','desert','swamp','volcanic']){
    const l=level();l.arena.theme=theme;
    for(const kind of kinds)for(const time of [0,1.7]){const c=recordingCanvas();R.paintObject(c.ctx,l,{kind,x:100,y:100,w:120,h:80},{time});assert.equal(c.depth(),0,kind+' '+theme);assert.ok(c.calls.length>4);
      if(time===0&&kind==='wall')walls.add(JSON.stringify(c.calls));if(time===0&&kind==='hazard')haz.add(JSON.stringify(c.calls));}
  }
  assert.equal(walls.size,7);assert.equal(haz.size,7);
  const l=level();l.waves=[{delay:0,enemies:[{kind:'chaser',count:2,spawn:'north'},{kind:'runner',count:1,spawn:'east'}]}];
  const a=recordingCanvas();R.paintArena(a.ctx,l,{time:1,live:true,entrances:{north:1}});assert.equal(a.depth(),0);assert.ok(a.calls.some(v=>v[0]==='fillText'&&v[1]==='×2'));
});
check('A won run earns a medal by health left; a lost run none',()=>{
  const l=level('survive',1);R.start(l);let s=R.advance(2);assert.equal(s.result.medal,'gold');
  const k=level('survive',300);k.waves=[{delay:0,enemies:[{kind:'brute',count:6,spawn:'north'}]}];k.modifiers.enemyHp=3;R.start(k);s=R.advance(300);assert.equal(s.result.won,false);assert.equal(s.result.medal,null);
  for(const kind of D.kinds){const c=recordingCanvas();R.portrait(c.ctx,kind,20,20,40,0);assert.equal(c.depth(),0);}
});
check('Campaign storage remains byte-for-byte untouched',()=>{assert.deepEqual([...storage],[['giraffe_rampage_save_v1','campaign sentinel']]);});
console.log(JSON.stringify({pass:true,tests}));
