import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const storage = new Map();
const localStorage = { getItem: k => storage.get(k) ?? null, setItem: (k,v) => storage.set(k,String(v)) };
const ctx = vm.createContext({ addonRegister: () => {}, window: {}, TextEncoder, TextDecoder, Uint8Array, URL, URLSearchParams, btoa, atob, localStorage });
ctx.window.localStorage = localStorage; ctx.self = ctx.window;
for (const f of ['../js/core/01b-savepack.js', '../js/addons/50a-addon-challenge-data.js']) vm.runInContext(fs.readFileSync(new URL(f, import.meta.url), 'utf8'), ctx);
if (!ctx.window.GRSave && ctx.GRSave) ctx.window.GRSave = ctx.GRSave;
const D = ctx.window.GRChallengeData;
let checks = 0;
function check(name, fn) { fn(); checks++; console.log('PASS ' + name); }
function clone(value) { return JSON.parse(JSON.stringify(value)); }
check('default recipe round trip', () => assert.deepEqual(clone(D.decode(D.encode(D.defaults()))), clone(D.defaults())));
check('Unicode text round trip', () => { const l = D.defaults(); l.title = '長頸鹿 🦒'; assert.equal(D.decode(D.encode(l)).title, l.title); });
check('share links are refused, with a pointer to the code', () => assert.throws(() => D.decode('https://example.test/play#challenge=' + encodeURIComponent(D.encode(D.defaults()))), /share code/));
check('GR3 share code round trip, smaller than the plain code, across line breaks', () => { for (const t of D.templates) { const c = D.shareCode(t.level); assert.ok(c.startsWith('GRC3:'), t.name); assert.ok(c.length < D.encode(t.level).length * .75, t.name + ' ' + c.length + '/' + D.encode(t.level).length); assert.deepEqual(clone(D.decode(c)), clone(t.level)); assert.deepEqual(clone(D.decode(c.slice(0, 40) + '\n' + c.slice(40))), clone(t.level)); } });
check('damaged or foreign GR3 share codes are refused', () => { const c = D.shareCode(D.templates[5].level); for (const bad of [c.slice(0, -3), c.slice(0, 20) + (c[20] === 'a' ? 'b' : 'a') + c.slice(21), 'GRC3:' + 'x'.repeat(60), 'GRC3:ab"c', 'GRC3:'+ ctx.window.GRSave.encode({ v: 1, title: 'not a recipe' }).slice(4)]) assert.throws(() => D.decode(bad)); });
check('corruption rejected', () => { const c = D.encode(D.defaults()); assert.throws(() => D.decode(c.slice(0,-5) + 'aaaaa')); });
check('unknown version rejected', () => { const l=D.defaults(); l.v=2; assert.throws(() => D.validate(l)); });
check('malformed and oversize codes rejected', () => { for(const s of ['', 'GRC1:bad', 'x'.repeat(24001), 'javascript:alert(1)']) assert.throws(() => D.decode(s)); });
check('seed reproducibility', () => { const a=D.seeded(4),b=D.seeded(4),c=D.seeded(5); const values=Array.from({length:30},()=>a()); assert.deepEqual(values,Array.from({length:30},()=>b())); assert.notDeepEqual(values,Array.from({length:30},()=>c())); assert(values.every(v=>v>=0&&v<1)); });
check('non-finite and negative values rejected', () => { for(const seed of [NaN,Infinity,-1,1.5,4294967296]) {const l=D.defaults();l.seed=seed;assert.throws(()=>D.validate(l));} });
check('population budget enforced', () => { const l=D.defaults(); l.waves=Array.from({length:9},()=>({delay:0,enemies:[{kind:'brute',count:30,spawn:'north'}]}));assert.throws(()=>D.validate(l)); });
check('spawn safety enforced', () => { const l=D.defaults();l.objects=[{kind:'wall',x:470,y:310,w:32,h:32}];assert.throws(()=>D.validate(l)); });
check('arena bounds enforced', () => {const l=D.defaults();l.objects=[{kind:'wall',x:920,y:10,w:100,h:40}];assert.throws(()=>D.validate(l));});
check('collect requires enough coins', () => {const l=D.defaults();l.objective={type:'collect',target:2};assert.throws(()=>D.validate(l));});
check('exit requires exactly one exit', () => {const l=D.defaults();l.objective={type:'exit',target:1};assert.throws(()=>D.validate(l));});
check('wall cannot cover collectible', () => {const l=D.defaults();l.objects=[{kind:'wall',x:80,y:80,w:80,h:80},{kind:'coin',x:100,y:100,w:20,h:20}];assert.throws(()=>D.validate(l));});
check('sealed coin rejected by clearance flood fill', () => {const l=D.defaults();l.objects=[{kind:'coin',x:60,y:60,w:24,h:24},{kind:'wall',x:0,y:120,w:160,h:20},{kind:'wall',x:140,y:0,w:20,h:120}];assert.throws(()=>D.validate(l));});
check('sealed exit rejected by clearance flood fill', () => {const l=D.defaults();l.objective={type:'exit',target:1};l.objects=[{kind:'exit',x:60,y:60,w:32,h:32},{kind:'wall',x:0,y:120,w:160,h:20},{kind:'wall',x:140,y:0,w:20,h:120}];assert.throws(()=>D.validate(l));});
check('passage with player clearance accepted', () => {const l=D.defaults();l.objects=[{kind:'coin',x:60,y:60,w:24,h:24},{kind:'wall',x:0,y:120,w:80,h:20},{kind:'wall',x:140,y:0,w:20,h:120}];assert.doesNotThrow(()=>D.validate(l));});
check('too narrow passage rejected', () => {const l=D.defaults();l.objects=[{kind:'coin',x:60,y:60,w:24,h:24},{kind:'wall',x:0,y:120,w:120,h:20},{kind:'wall',x:140,y:0,w:20,h:120}];assert.throws(()=>D.validate(l));});
check('hazard cannot cover player spawn', () => {const l=D.defaults();l.objects=[{kind:'hazard',x:450,y:290,w:64,h:64}];assert.throws(()=>D.validate(l));});
check('unknown fields stripped', () => {const l=D.defaults();l.verification=true;l.modifiers.cheat=true;const v=D.validate(l);assert(!('verification' in v));assert(!('cheat' in v.modifiers));});
check('validation returns independent recipe', () => {const l=D.defaults();const v=D.validate(l);v.waves[0].enemies[0].count=8;assert.equal(l.waves[0].enemies[0].count,5);});
check('all templates are valid', () => {assert(D.templates.length>=5);D.templates.forEach(t=>D.decode(D.encode(t.level)));});
check('old recipes acquire appearance and balance defaults', () => {const l=D.defaults();delete l.appearance;delete l.modifiers.playerSpeed;delete l.modifiers.attackRate;delete l.customAssets;const v=D.validate(l);assert.deepEqual(clone(v.appearance),clone(D.defaults().appearance));assert.equal(v.modifiers.playerSpeed,1);assert.equal(v.modifiers.attackRate,1);assert.deepEqual(clone(v.customAssets),[]);});
check('old checksum-valid codes remain readable', () => {
  const l=D.defaults();delete l.appearance;delete l.modifiers.playerSpeed;delete l.modifiers.attackRate;
  const json=JSON.stringify(l);let h=2166136261;for(let i=0;i<json.length;i++){h^=json.charCodeAt(i);h=Math.imul(h,16777619);}
  const code='GRC1:'+(h>>>0).toString(16).padStart(8,'0')+':'+Buffer.from(json).toString('base64url');
  assert.equal(D.decode(code).appearance.time,'day');assert.equal(D.decode(code).modifiers.attackRate,1);
});
check('appearance and tuning round trip', () => {const l=D.defaults();l.appearance={time:'night',weather:'snow',detail:2};l.modifiers.playerSpeed=.5;l.modifiers.attackRate=2;assert.deepEqual(clone(D.decode(D.encode(l))),clone(D.validate(l)));});
check('appearance and tuning malformed values rejected', () => {for(const [field,value] of [['time','noon'],['weather','hail'],['detail',3],['detail',1.5]]){const l=D.defaults();l.appearance[field]=value;assert.throws(()=>D.validate(l));}for(const field of ['playerSpeed','attackRate'])for(const n of [null,NaN,.49,2.01,'1']){const l=D.defaults();l.modifiers[field]=n;assert.throws(()=>D.validate(l));}});
check('decorations do not block player spawn or pickups', () => {const l=D.defaults();l.objects=[{kind:'tree',x:440,y:280,w:80,h:80},{kind:'rock',x:60,y:60,w:80,h:80},{kind:'banner',x:60,y:60,w:32,h:32},{kind:'coin',x:60,y:60,w:24,h:24}];assert.doesNotThrow(()=>D.validate(l));});
check('heal pickups round trip', () => {const l=D.defaults();l.objects=[{kind:'heal',x:80,y:80,w:32,h:32}];assert.equal(D.decode(D.encode(l)).objects[0].kind,'heal');});
check('sealed heal rejected', () => {const l=D.defaults();l.objects=[{kind:'heal',x:60,y:60,w:24,h:24},{kind:'wall',x:0,y:120,w:160,h:20},{kind:'wall',x:140,y:0,w:20,h:120}];assert.throws(()=>D.validate(l));});
check('heal cannot overlap walls', () => {const l=D.defaults();l.objects=[{kind:'heal',x:60,y:60,w:32,h:32},{kind:'wall',x:60,y:60,w:80,h:80}];assert.throws(()=>D.validate(l));});
check('decorated templates cover every new appearance option', () => {assert(D.templates.length>=8);for(const time of ['day','sunset','night'])assert(D.templates.some(t=>t.level.appearance.time===time));for(const weather of ['clear','drizzle','snow'])assert(D.templates.some(t=>t.level.appearance.weather===weather));});
check('maximal decorated code stays under import limit', () => {const l=D.defaults();l.title='🦒'.repeat(30);l.author='🦒'.repeat(16);l.description='🦒'.repeat(140);l.waves=Array.from({length:12},()=>({delay:30,enemies:Array.from({length:4},()=>({kind:'spitter',count:5,spawn:'south'}))}));l.objects=Array.from({length:48},()=>({kind:'tree',x:123.4567890123,y:123.4567890123,w:123.4567890123,h:123.4567890123}));const code=D.encode(l);assert(code.length<24000);assert.equal(D.decode(code).objects.length,48);});
function customLevel(solid=false) {const l=D.defaults();l.customAssets=[{id:'arch',name:'My arch',solid,parts:[{shape:'rect',x:10,y:10,w:80,h:80,color:'#AABBCC'}]}];l.objects=[{kind:'custom',asset:'arch',x:80,y:80,w:64,h:64}];return l;}
check('all seven biomes supported', () => {for(const theme of ['savanna','arctic','moon','forest','desert','swamp','volcanic']){const l=D.defaults();l.arena.theme=theme;assert.equal(D.decode(D.encode(l)).arena.theme,theme);}});
check('palettes and custom colours round trip', () => {for(const palette of ['biome','autumn','pastel','dusk','custom']){const l=D.defaults();l.appearance.palette=palette;l.appearance.colors.ground='#ABCDEF';assert.equal(D.decode(D.encode(l)).appearance.colors.ground,'#abcdef');assert.equal(D.decode(D.encode(l)).appearance.palette,palette);}});
check('unsafe palette colours rejected', () => {for(const color of ['red','#abc','#abcd1234','url(javascript:alert(1))','<script>','#000000;opacity:0',null]){const l=D.defaults();l.appearance.colors.ground=color;assert.throws(()=>D.validate(l));}});
check('custom object round trip and defaults', () => {const l=customLevel();delete l.customAssets[0].solid;const v=D.decode(D.encode(l));assert.equal(v.customAssets[0].solid,false);assert.equal(v.customAssets[0].parts[0].rotation,0);assert.equal(v.customAssets[0].parts[0].color,'#aabbcc');assert.equal(v.objects[0].asset,'arch');});
check('custom shape outline and transparency defaults', () => {const part=D.validate(customLevel()).customAssets[0].parts[0];assert.equal(part.opacity,1);assert.equal(part.stroke,'#3a2b20');assert.equal(part.strokeWidth,0);});
check('extended custom shape round trip', () => {const l=customLevel();Object.assign(l.customAssets[0].parts[0],{opacity:.35,stroke:'#ABCDEF',strokeWidth:2.5});const p=D.decode(D.encode(l)).customAssets[0].parts[0];assert.equal(p.opacity,.35);assert.equal(p.stroke,'#abcdef');assert.equal(p.strokeWidth,2.5);});
check('custom shape transparency and outline bounds', () => {for(const [field,values] of [['opacity',[-.01,1.01,NaN,Infinity,null,'1']],['strokeWidth',[-.01,6.01,NaN,Infinity,null,'1']],['stroke',['#abc','red','url(javascript:alert(1))',null]]])for(const value of values){const l=customLevel();l.customAssets[0].parts[0][field]=value;assert.throws(()=>D.validate(l));}for(const [opacity,strokeWidth] of [[0,0],[1,6]]){const l=customLevel();Object.assign(l.customAssets[0].parts[0],{opacity,strokeWidth});assert.doesNotThrow(()=>D.validate(l));}});
check('old checksum-valid custom shapes acquire new defaults', () => {const l=customLevel();const json=JSON.stringify(l);let h=2166136261;for(let i=0;i<json.length;i++){h^=json.charCodeAt(i);h=Math.imul(h,16777619);}const code='GRC1:'+(h>>>0).toString(16).padStart(8,'0')+':'+Buffer.from(json).toString('base64url');const p=D.decode(code).customAssets[0].parts[0];assert.equal(p.opacity,1);assert.equal(p.strokeWidth,0);assert.equal(p.stroke,'#3a2b20');});
check('custom solid rectangles share collision semantics', () => {const l=customLevel(true),v=D.validate(l);assert.equal(D.isSolid(v,v.objects[0]),true);assert.equal(D.isSolid(v,{kind:'wall'}),true);assert.equal(D.isSolid(v,{kind:'tree'}),false);l.customAssets[0].solid=false;assert.equal(D.isSolid(D.validate(l),l.objects[0]),false);});
check('solid custom object cannot cover spawn', () => {const l=customLevel(true);l.objects[0].x=460;l.objects[0].y=300;assert.throws(()=>D.validate(l));l.customAssets[0].solid=false;assert.doesNotThrow(()=>D.validate(l));});
check('solid custom object cannot cover pickups', () => {const l=customLevel(true);l.objects.push({kind:'heal',x:90,y:90,w:24,h:24});assert.throws(()=>D.validate(l));l.customAssets[0].solid=false;assert.doesNotThrow(()=>D.validate(l));});
check('solid custom enclosure blocks reachability', () => {const l=customLevel(true);l.objects=[{kind:'coin',x:60,y:60,w:24,h:24},{kind:'custom',asset:'arch',x:0,y:120,w:160,h:20},{kind:'custom',asset:'arch',x:140,y:0,w:20,h:120}];assert.throws(()=>D.validate(l));l.customAssets[0].solid=false;assert.doesNotThrow(()=>D.validate(l));});
check('custom references must exist', () => {const l=customLevel();l.objects[0].asset='missing';assert.throws(()=>D.validate(l));});
check('custom IDs strictly validated and unique', () => {for(const id of ['Bad ID','123','<script>','x'.repeat(17)]){const l=customLevel();l.customAssets[0].id=id;assert.throws(()=>D.validate(l));}const l=customLevel();l.customAssets.push(clone(l.customAssets[0]));assert.throws(()=>D.validate(l));});
check('custom shape limits and fields validated', () => {for(const field of ['x','y','w','h','rotation']){const l=customLevel();l.customAssets[0].parts[0][field]=1000;assert.throws(()=>D.validate(l));}for(const field of ['shape','color']){const l=customLevel();l.customAssets[0].parts[0][field]='javascript:alert(1)';assert.throws(()=>D.validate(l));}for(const n of [0,13]){const l=customLevel();l.customAssets[0].parts=Array.from({length:n},()=>clone(l.customAssets[0].parts[0]));assert.throws(()=>D.validate(l));}});
check('custom shape must stay inside canvas', () => {const l=customLevel();l.customAssets[0].parts[0].x=50;assert.throws(()=>D.validate(l));});
check('custom asset count capped at eight', () => {const l=customLevel();l.customAssets=Array.from({length:9},(_,i)=>({...clone(l.customAssets[0]),id:'asset'+i}));assert.throws(()=>D.validate(l));});
check('custom object strips unknown executable fields', () => {const l=customLevel();l.customAssets[0].script='alert(1)';l.customAssets[0].parts[0].onclick='alert(1)';l.objects[0].html='<script>';const v=D.validate(l);assert(!('script' in v.customAssets[0]));assert(!('onclick' in v.customAssets[0].parts[0]));assert(!('html' in v.objects[0]));});
check('oversize custom recipe fails before generating unreadable code', () => {const l=customLevel();l.customAssets=Array.from({length:8},(_,i)=>({id:'custom'+i,name:'x'.repeat(32),solid:false,parts:Array.from({length:12},()=>({shape:'triangle',x:1.1234567890123456,y:1.1234567890123456,w:50.12345678901234,h:50.12345678901234,color:'#ffffff',rotation:179.12345678901234}))}));l.objects=Array.from({length:48},()=>({kind:'custom',asset:'custom0',x:123.4567890123,y:123.4567890123,w:123.4567890123,h:123.4567890123}));assert.throws(()=>D.encode(l),/too large/);});
check('near-limit plain code still reads back', () => {
  let best='';const l=customLevel();
  for(let parts=8;parts<=12;parts++) {
    l.customAssets=Array.from({length:8},(_,i)=>({id:'custom'+i,name:'x'.repeat(32),solid:false,parts:Array.from({length:parts},()=>({shape:'triangle',x:1.1234567890123456,y:1.1234567890123456,w:50.12345678901234,h:50.12345678901234,color:'#ffffff',rotation:179.12345678901234}))}));
    for(let count=0;count<=48;count++) {
      l.objects=Array.from({length:count},()=>({kind:'custom',asset:'custom0',x:123.4567890123,y:123.4567890123,w:123.4567890123,h:123.4567890123}));
      try{const code=D.encode(l);if(code.length>best.length)best=code;}catch(_){break;}
    }
  }
  assert(best.length>23500 && best.length<=24000);
  assert.equal(D.encode(D.decode(best)),best);
});
check('a walled-off entrance is caught while editing, not mid-playtest', () => {const l=D.defaults();l.objects=[0,1,2].map(i=>({kind:'wall',x:i*320,y:0,w:320,h:40}));assert.throws(()=>D.validate(l),/north entrance/);l.waves[0].enemies[0].kind='flyer';assert.doesNotThrow(()=>D.validate(l));l.waves[0].enemies[0].spawn='south';l.waves[0].enemies[0].kind='brute';assert.doesNotThrow(()=>D.validate(l));});
check('the new enemy kinds are accepted', () => {const l=D.defaults();l.waves=[{delay:0,enemies:['flyer','charger','splitter','badger'].map(kind=>({kind,count:2,spawn:'east'}))}];assert.equal(D.validate(l).waves[0].enemies.length,4);const g=D.defaults();g.waves[0].enemies[0].kind='grub';assert.throws(()=>D.validate(g));});
check('library saves without touching campaign key', () => {storage.set('giraffe_rampage_save_v1','untouched');D.saveDraft(D.defaults());assert.equal(D.listDrafts().length,1);assert.equal(storage.get('giraffe_rampage_save_v1'),'untouched');});
check('identical draft replaces itself', () => {D.saveDraft(D.defaults());assert.equal(D.listDrafts().length,1);});
check('library bounded without discarding old drafts', () => {for(let i=1;i<24;i++){const l=D.defaults();l.seed=i;D.saveDraft(l);}const l=D.defaults();l.seed=999;assert.throws(()=>D.saveDraft(l));assert.equal(D.listDrafts().length,24);});
check('remove draft', () => {D.removeDraft(D.listDrafts()[0].id);assert.equal(D.listDrafts().length,23);});
check('a draft kept under its own id is updated, not copied, after an edit', () => {storage.set(D.key,'[]');const id=D.newDraftId(),l=D.defaults();D.saveDraft(l,id);l.title='Renamed';D.saveDraft(l,id);const all=D.listDrafts();assert.equal(all.length,1);assert.equal(all[0].title,'Renamed');assert.equal(all[0].id,id);});
check('corrupt library ignored', () => {storage.set(D.key,'not json');assert.equal(D.listDrafts().length,0);});
check('invalid library entries discarded', () => {storage.set(D.key,JSON.stringify([{code:'oops'},null,{code:D.encode(D.defaults()),updated:1}]));assert.equal(D.listDrafts().length,1);});
check('oversize library refused', () => {storage.set(D.key,' '.repeat(24000*24+1));assert.equal(D.listDrafts().length,0);});
check('best results are kept per exact recipe: best medal, fastest win, wins only, nothing for a loss', () => {
  const fp=D.fingerprint(D.defaults());assert.equal(D.record(fp),null);
  assert.equal(D.saveResult({won:false,fingerprint:fp,medal:null,time:20}),null);assert.equal(D.record(fp),null);
  let r=D.saveResult({won:true,fingerprint:fp,medal:'silver',time:30});assert.equal(r.medal,'silver');assert.equal(r.newMedal,true);assert.equal(r.newTime,true);
  r=D.saveResult({won:true,fingerprint:fp,medal:'bronze',time:20});assert.equal(r.medal,'silver');assert.equal(r.time,20);assert.equal(r.newMedal,false);assert.equal(r.newTime,true);
  r=D.saveResult({won:true,fingerprint:fp,medal:'gold',time:25});assert.equal(r.medal,'gold');assert.equal(r.time,20);assert.equal(r.newMedal,true);assert.equal(r.newTime,false);
  assert.deepEqual(clone(D.record(fp)),{medal:'gold',time:20});assert.equal(D.record('d1234567'),null);assert.equal(D.record('__proto__'),null);
  assert.equal(D.saveResult({won:true,fingerprint:'nope',medal:'gold',time:5}),null);assert.equal(D.saveResult({won:true,fingerprint:fp,medal:'platinum',time:5}),null);
  assert.ok(D.listDrafts().every(d=>/^[a-f0-9]{8}$/.test(d.fingerprint)));assert.equal(storage.get('giraffe_rampage_save_v1'),'untouched');
});
check('damaged or oversize best records are ignored', () => {
  const fp=D.fingerprint(D.defaults());storage.set(D.recordsKey,'not json');assert.equal(D.record(fp),null);
  storage.set(D.recordsKey,JSON.stringify({[fp]:{medal:'gold',time:-1}}));assert.equal(D.record(fp),null);
  storage.set(D.recordsKey,JSON.stringify({[fp]:{medal:'gold',time:'9'}}));assert.equal(D.record(fp),null);
  storage.set(D.recordsKey,' '.repeat(60001));assert.equal(D.record(fp),null);
  storage.set(D.recordsKey,JSON.stringify({junk:1,[fp]:{medal:'bronze',time:9}}));D.saveResult({won:true,fingerprint:fp,medal:'silver',time:12});
  assert.deepEqual(Object.keys(JSON.parse(storage.get(D.recordsKey))),[fp]);assert.deepEqual(clone(D.record(fp)),{medal:'silver',time:9});
  const many={};for(let i=0;i<230;i++)many[(0x10000000+i).toString(16)]={medal:'gold',time:5,updated:i};storage.set(D.recordsKey,JSON.stringify(many));
  D.saveResult({won:true,fingerprint:fp,medal:'gold',time:3});const kept=JSON.parse(storage.get(D.recordsKey));assert.equal(Object.keys(kept).length,200);assert.ok(kept[fp]&&!kept['10000000']);
  storage.delete(D.recordsKey);
});
check('library storage failures reported', () => {const original=localStorage.setItem;localStorage.setItem=()=>{throw new Error('quota');};assert.throws(()=>D.saveDraft(D.defaults()));assert.throws(()=>D.removeDraft('none'));localStorage.setItem=original;});
check('code checksum mutation rejected', () => {const c=D.encode(D.defaults());assert.throws(()=>D.decode(c.replace(/^GRC1:./,'GRC1:f')===c?c.replace(/^GRC1:./,'GRC1:0'):c.replace(/^GRC1:./,'GRC1:f')));});
console.log(JSON.stringify({pass:true,checks}));
