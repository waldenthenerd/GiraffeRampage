'use strict';
/* Longneck Town: walking around, finding things, the clock and the weather. */
/* ========================= 44w. TOWN ENGINE ========================= */
/* G.state is 'town' while she walks. The buildings open the game's own screens (wardrobe, trading post, minigames...); while one is
   open G.townReturn is true and showMenu() brings her back here instead of to the main menu (see the wrapper at the end). The town is
   still drawn behind those screens. The street scrolls sideways; she walks with the move keys (or a held finger / mouse button toward
   where it points), stretches her neck with up (or a finger above her), and uses things with E, Enter or Space (or taps the prompt). */
const Town = {
  on: false, d: 'square', x: 1000, face: 1, vx: 0, ph: 0, reach: 0, camX: 0, t: 0, hold: false, near: null, bump: 0,
  pops: [], fx: [], npcs: [], toasts: [], bannerT: 0, layers: null, layerKey: '', rainK: 0, lit: false, ui: { btns: [], prompt: null }, talkNpc: '', panel: false,
  secT: 0, digSpots: [], prev: {}, tipT: 0, lift: 0
};
const TOWN_WALK = 235;
function townVisible(){ return Town.on && (G.state === 'town' || (G.townReturn && (G.state === 'help' || G.state === 'shop' || G.state === 'bestiary' || G.state === 'menu'))); }

/* ---- the clock and the weather ---- */
/* a day is 12 real minutes; it is the same for everyone at the same moment, so the town is never "reset" by closing the game */
function townHour(){ return typeof Town.fixHour === 'number' ? Town.fixHour : (Date.now() % 720000) / 720000 * 24; }      /* fixHour: set by tests */
function townDark(h){ if (h < 5.5) return 1; if (h < 7.2) return 1 - (h - 5.5) / 1.7; if (h < 18) return 0; if (h < 20) return (h - 18) / 2; return 1; }
function townDusk(h){ return Math.max(0, 1 - Math.abs(h - 18.7) / 1.7, 1 - Math.abs(h - 6.4) / 1.3); }
function townIsNight(){ return townDark(townHour()) > 0.6; }
function townRainNow(){ const w = Math.floor(Date.now() / 240000); return miniRng(w * 7919 + 13)() < 0.22; }
function townDayKey(){ const d = new Date(); return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(); }
function townHash(s){ let h = 2166136261; for (let i = 0; i < s.length; i++){ h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
/* today's glimmering spots (three, in districts she can reach) and where Dot is hiding */
function townDaily(){
  const t = townData(), dl = t.daily, key = townDayKey();
  if (dl.d === key && dl.dig.length) return dl;
  const r = miniRng(townHash(key + 'dig')), pool = [];
  TOWN_IDS.forEach(function(id){ if (townOpen(id)) TOWN_DIST[id].dig.forEach(function(x){ pool.push({ d: id, x: x }); }); });
  const dig = [];
  for (let i = 0; i < 3 && pool.length; i++){ const k = Math.floor(r() * pool.length); dig.push(pool.splice(k, 1)[0]); }
  dl.d = key; dl.dig = dig; dl.got = []; dl.dot = 0; Save.write();
  return dl;
}
function townDotSpot(){
  const r = miniRng(townHash(townDayKey() + 'dot')), open = TOWN_IDS.filter(townOpen), d = open[Math.floor(r() * open.length)] || 'square';
  return { d: d, x: 300 + r() * Math.max(100, TOWN_DIST[d].w - 700) };
}

/* ---- going in and out ---- */
function townView(){
  let sc = clamp(G.H / 600, 0.5, 1.7), vw = G.W / sc;
  if (vw < 560){ sc = G.W / 560; vw = 560; }
  return { sc: sc, vw: vw };
}
function townSpawnNpcs(){
  const D = TOWN_DIST[Town.d]; Town.npcs = [];
  const add = function(id, x){
    const def = TOWN_NPCS[id];
    Town.npcs.push({ id: id, def: def, x: x, home: x, dir: Math.random() < 0.5 ? 1 : -1, ph: 0, t: Math.random() * 9, tx: x, wait: Math.random() * 3, moving: false, reach: 0, seed: townHash(id) % 97 });
  };
  D.npcs.forEach(function(id){ add(id, TOWN_NPCS[id].x); });
  const dot = townDotSpot();
  if (dot.d === Town.d && !townDaily().dot) add('dot', dot.x);
}
function townEnter(id, x, face){
  if (!TOWN_DIST[id] || !townOpen(id)) id = 'square';
  const D = TOWN_DIST[id], t = townData();
  Town.on = true; Town.d = id; Town.x = x === undefined ? D.spawn : x; Town.face = face || 1; Town.vx = 0; Town.reach = 0; Town.near = null; Town.hold = false; Town.panel = false;
  Town.talkNpc = ''; Town.pops.length = 0; Town.fx.length = 0; Town.bannerT = 3.2; Town.layerKey = ''; Town.lit = false;
  if (Town.car && (D.cave || D.indoor)){ Town.car = false; townToast(D.cave ? 'Cars cannot go underground, so she leaves it at the manhole.' : 'She parks the car outside.', '#E8D8B0'); }
  const V = townView(); Town.camX = D.w <= V.vw ? -(V.vw - D.w) / 2 : clamp(Town.x - V.vw / 2, 0, D.w - V.vw);
  G.state = 'town'; G.attract = false; G.subScreen = ''; G.townReturn = false;
  HUD.classList.remove('on'); TOUCH.classList.remove('on'); PAUSEBTN.classList.remove('on');
  hideOverlay();
  Input.sx = G.W / 2; Input.sy = G.H * 0.5;
  t.vis[id] = 1; t.last = D.indoor && typeof TOWN_ROOM_PARENT !== 'undefined' ? (TOWN_ROOM_PARENT[id] || 'square') : id; townDaily(); townSpawnNpcs();
  Save.write();
  screenFadeIn(0.45);
}
function townGo(id, x, face){ SFX.click(); townEnter(id, x, face); }
function townResume(){                                    /* back from a building's screen */
  G.townReturn = false; G.state = 'town'; G.attract = false; G.subScreen = ''; Town.hold = false; Town.panel = false; Town.talkNpc = '';
  HUD.classList.remove('on'); TOUCH.classList.remove('on'); PAUSEBTN.classList.remove('on');
  hideOverlay(); Input.sx = G.W / 2; Input.sy = G.H * 0.5;
  townSpawnNpcs();
  screenFadeIn(0.3);
}
function townExit(){                                      /* to the main menu */
  Town.on = false; G.townReturn = false; Town.hold = false; Town.panel = false;
  if (typeof townCloseDialog === 'function') townCloseDialog(true);
  Save.write(); startAttract(); showMenu();
}
/* a building opens one of the game's own screens; showMenu() then brings her back */
function townLeaveFor(fn){
  G.townReturn = true; Town.hold = true; Town.talkNpc = '';
  if (typeof townCloseDialog === 'function') townCloseDialog(true);
  fn();
}

/* ---- rewards and notices ---- */
function townToast(txt, col){ Town.toasts.push({ txt: txt, col: col || '#FFE9A0', t: 0 }); if (Town.toasts.length > 4) Town.toasts.shift(); }
function townPop(x, y, txt, col){ Town.pops.push({ x: x, y: y, txt: txt, col: col || '#FFE9A0', t: 0 }); if (Town.pops.length > 12) Town.pops.shift(); }
function townBurst(x, y, col, n){
  if (fxLevelNow() <= 0) n = Math.min(n, 4);
  for (let i = 0; i < n && Town.fx.length < 90; i++){ const a = Math.random() * TAU, s = 40 + Math.random() * 120; Town.fx.push({ x: x, y: y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 60, t: 0, life: 0.5 + Math.random() * 0.5, col: col, r: 2 + Math.random() * 2.4 }); }
}
/* pay a reward { gold, coin (coins' worth), gems, acc }; returns a short text of what she got */
function townPay(r, x, y){
  const d = Save.data, out = [];
  let gold = (r.gold | 0) + (r.coin ? r.coin * townCoin() : 0);
  if (gold){ d.gold = (d.gold | 0) + gold; out.push(fmt(gold) + ' gold'); }
  if (r.gems){ d.gems = (d.gems | 0) + r.gems; out.push(r.gems + ' gems'); }
  if (r.acc && ACC_BY_ID[r.acc]){
    const pz = { item: ACC_BY_ID[r.acc] }; miniAward(pz);
    out.push(pz.dupe ? 'a spare ' + pz.item.name + ' (+' + pz.gems + ' gems)' : pz.item.name);
  }
  Save.write();
  return out.join(', ');
}
function townCollect(it){
  const t = townData(); if (t.found[it.id]) return;
  t.found[it.id] = 1;
  const cx = it.x, cy = TG - it.h - 10;
  let r = {}, msg = '', col = '#FFE9A0';
  switch (it.t){
    case 'coin': r = { coin: 1 }; break;
    case 'star': r = { coin: 4, gems: 5 }; break;
    case 'gem': r = { gems: 15 }; col = '#9BE8FF'; break;
    case 'hat': case 'boot': r = { acc: it.acc }; break;
    case 'track': r = { coin: 2 }; break;
    case 'swatch': break;
  }
  if (it.t === 'swatch'){ msg = 'New colour: ' + WARD[it.n].name; Save.write(); townToast('New coat colour: ' + WARD[it.n].name + '. Find it in Coat colours.', '#FFE9A0'); SFX.transform(); }
  else {
    msg = townPay(r, cx, cy);
    if (it.t === 'track'){ const nm = TOWN_TRACK_NAME(it); townToast('Tracks: ' + nm + '. They are in your field journal.', '#E8D8B0'); }
    if (it.t === 'hat' || it.t === 'boot') townToast('Found: ' + ACC_BY_ID[it.acc].name, '#FFE9A0');
    (it.t === 'gem' || it.t === 'star') ? SFX.level() : SFX.coin();
  }
  townPop(cx, cy - 18, '+ ' + (msg || ''), col);
  townBurst(cx, cy, col, 14);
  Save.write();
  /* everything in a district found */
  const all = townItemsIn(it.d);
  if (!t.done[it.d] && townFoundIn(it.d) >= all.length){
    t.done[it.d] = 1;
    const m = townPay({ gems: 40, coin: 6 });
    townToast('Everything found in ' + TOWN_DIST[it.d].name + '! ' + m, '#BFFF9A'); SFX.transform();
  }
}
function TOWN_TRACK_NAME(it){ try { const nm = bestiaryName(it.ch, it.type); return nm.title; } catch (e) { return 'a creature'; } }

/* ---- input ---- */
function townAny(a){ for (let i = 0; i < a.length; i++) if (Input.keys[a[i]]) return true; return false; }
function townEdge(name, v){ const e = v && !Town.prev[name]; Town.prev[name] = v; return e; }
function townInput(){
  const I = { mx: 0, up: false, down: false, act: false, jrn: false, map: false, click: false, cx: 0, cy: 0 };
  const l = townAny(['ArrowLeft', 'KeyA', keyOf('left')]), r = townAny(['ArrowRight', 'KeyD', keyOf('right')]);
  I.up = townAny(['ArrowUp', 'KeyW', keyOf('up')]); I.down = townAny(['ArrowDown', 'KeyS', keyOf('down')]);
  I.mx = (r ? 1 : 0) - (l ? 1 : 0);
  if (!I.mx && typeof townAutoMx === 'function') I.mx = townAutoMx();
  if (Input.padOn){ if (Math.abs(Input.padX) > 0.25) I.mx += Input.padX; if (Input.padY < -0.5) I.up = true; if (Input.padY > 0.5) I.down = true; }
  I.act = townEdge('act', !!(Input.keys.KeyE || Input.keys.Enter || Input.keys.NumpadEnter || Input.keys.Space || Input.padBtn));
  I.jrn = townEdge('jrn', !!Input.keys.KeyJ); I.map = townEdge('map', !!Input.keys.KeyM); I.car = townEdge('car', !!Input.keys.KeyC);
  const ptr = !!Input.mdown;
  I.click = townEdge('ptr', ptr); I.ptr = ptr; I.cx = Input.sx; I.cy = Input.sy;
  return I;
}
function townInRect(R, x, y){ return !!R && x >= R.x && x <= R.x + R.w && y >= R.y && y <= R.y + R.h; }

/* ---- the update ---- */
function townHeadPos(){
  const sc = 1.5, hx = 27 + Math.max(0, Town.reach) * 7, hy = -55 - Town.reach * 105, by = TG - (Town.car ? 26 : 37) * sc;
  return { x: Town.x + Town.face * hx * sc, y: by + hy * sc };
}
function townNpcStep(n, dt){
  const d = n.def;
  n.t += dt;
  if (Town.talkNpc === n.id){ n.moving = false; n.dir = Town.x > n.x ? 1 : -1; return; }
  n.bob = 0; n.sit = false;
  let reachT = 0;
  switch (d.habit){
    case 'stroll':
      n.wait -= dt;
      if (n.wait <= 0){ n.tx = n.home + (Math.random() * 2 - 1) * d.range; n.wait = 3 + Math.random() * 5; }
      break;
    case 'stand': { const dx = Town.x - n.x; if (Math.abs(dx) < 300) n.dir = dx > 0 ? 1 : -1; break; }
    case 'dance': n.bob = Math.abs(Math.sin(n.t * 5.5)) * 5; reachT = 0.15 + 0.15 * Math.sin(n.t * 2.7); n.dir = Math.sin(n.t * 0.7) > 0 ? 1 : -1; break;
    case 'fish': n.dir = 1; n.sit = true; reachT = -0.1; break;
    case 'tinker': reachT = 0.55 + 0.45 * Math.sin(n.t * 0.6); n.dir = Math.sin(n.t * 0.35) > 0 ? 1 : -1; break;
    case 'stargaze': reachT = 0.95; n.dir = 1; break;
    case 'sit': n.sit = true; n.dir = -1; break;
    case 'hide': n.bob = Math.max(0, Math.sin(n.t * 3)) * 6; n.dir = Town.x > n.x ? 1 : -1; break;
  }
  const dx = n.tx - n.x;
  if (d.habit === 'stroll' && Math.abs(dx) > 4){ n.dir = dx > 0 ? 1 : -1; n.x += n.dir * 36 * dt; n.moving = true; n.ph += dt * 5; } else n.moving = false;
  n.reach += (reachT - n.reach) * Math.min(1, dt * 3);
}
function townNearest(D, inp){
  let best = null, bd = 1e9;
  const consider = function(o, dx, lim, bias){ const a = Math.abs(dx); if (a < lim && a - (bias || 0) < bd){ bd = a - (bias || 0); best = o; } };
  Town.npcs.forEach(function(n){ consider({ k: 'npc', id: n.id, label: 'Talk to ' + n.def.name }, Town.x - n.x, 88, 40); });
  D.b.forEach(function(b){
    consider({ k: 'b', b: b, label: (b.act === 'map' ? 'Look at the tram map' : b.act === 'board' || b.act === 'scores' || b.act === 'hall' ? 'Look at ' + b.label : 'Go into ' + b.label) }, Town.x - b.x, Math.max(64, Math.min(120, b.w * 0.3)), 0);
  });
  const dl = townDaily();
  dl.dig.forEach(function(s, i){ if (s.d === Town.d && dl.got.indexOf(i) < 0) consider({ k: 'dig', i: i, x: s.x, label: 'Dig the glimmering ground' }, Town.x - s.x, 50, 10); });
  D.p.forEach(function(p){ if (p.k === 'fountain') consider({ k: 'wish', x: p.x, label: 'Make a wish' }, Town.x - p.x, 90, 0); });
  return best;
}
function updateTown(dt, frozen){
  if (!Town.on) return;
  dt = Math.min(dt, 0.05); Town.t += dt;
  const D = TOWN_DIST[Town.d], V = townView(), inp = townInput();
  const hold = frozen || Town.hold || Town.panel;
  Town.npcs.forEach(function(n){ townNpcStep(n, dt); });
  if (Town.bannerT > 0) Town.bannerT -= dt;
  for (let i = Town.toasts.length - 1; i >= 0; i--){ Town.toasts[i].t += dt; if (Town.toasts[i].t > 4.2) Town.toasts.splice(i, 1); }
  for (let i = Town.pops.length - 1; i >= 0; i--){ const p = Town.pops[i]; p.t += dt; if (p.t > 1.5) Town.pops.splice(i, 1); }
  for (let i = Town.fx.length - 1; i >= 0; i--){ const p = Town.fx[i]; p.t += dt; if (p.t >= p.life){ Town.fx.splice(i, 1); continue; } p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 260 * dt; p.vx *= 1 - Math.min(1, 1.5 * dt); }
  Town.rainK += ((townRainNow() && !D.cave ? 1 : 0) - Town.rainK) * Math.min(1, dt * 0.5);
  /* a conversation card at the bottom lifts the street so the speakers stay in view */
  const liftT = typeof townDialogHeight === 'function' ? Math.min(townDialogHeight(), G.H * 0.5) : 0;
  Town.lift += (liftT - Town.lift) * Math.min(1, dt * 10);
  Town.secT -= dt;
  if (Town.secT <= 0){ Town.secT = 1; if (!D.cave && townIsNight()){ const t = townData(); if (!t.night[Town.d]){ t.night[Town.d] = 1; Save.write(); } } }
  /* the camera */
  const want = D.w <= V.vw ? -(V.vw - D.w) / 2 : clamp(Town.x - V.vw / 2 + Town.face * 60, 0, D.w - V.vw);
  Town.camX += (want - Town.camX) * Math.min(1, dt * 6);
  if (hold){ Town.vx *= 0.8; Town.near = null; return; }
  /* walking: keys, a pad, or a held finger / mouse button toward where it points (above her head stretches the neck) */
  let mx = inp.mx, up = inp.up, down = inp.down;
  const onUI = Town.ui.btns.some(function(b){ return townInRect(b, inp.cx, inp.cy); }) || townInRect(Town.ui.prompt, inp.cx, inp.cy);
  if (inp.ptr && !onUI && !mx){
    const gx = (Town.x - Town.camX) * V.sc, dx = inp.cx - gx;
    if (Math.abs(dx) > 28) mx = clamp(dx / 140, -1, 1);
    const headTop = G.H - (TG - 37 * 1.5 - 55 * 1.5 - 20) * V.sc - (600 - TG) * V.sc;
    if (inp.cy < headTop - 30 * V.sc) up = true;
  }
  mx = clamp(mx, -1, 1);
  const target = mx * TOWN_WALK * (Town.car ? townCarMul() : 1);
  Town.vx += (target - Town.vx) * Math.min(1, dt * 9);
  if (Math.abs(Town.vx) > 6) Town.face = Town.vx > 0 ? 1 : -1;
  Town.x += Town.vx * dt; Town.ph += Math.abs(Town.vx) * dt * 0.05;
  Town.reach += ((up ? 1 : down ? -0.4 : 0) - Town.reach) * Math.min(1, dt * 7);
  /* the ends of the street: another district, or a polite wall */
  if (Town.x < 46){
    const nb = D.left && TOWN_DIST[D.left];
    if (nb && nb.open()){ townEnter(nb.id, nb.w - 170, -1); return; }
    Town.x = 46; if (nb && Town.bump <= 0){ townToast(nb.name + ' opens after: ' + nb.need, '#FFB89A'); Town.bump = 2.5; }
  }
  if (Town.x > D.w - 46){
    const nb = D.right && TOWN_DIST[D.right];
    if (nb && nb.open()){ townEnter(nb.id, 170, 1); return; }
    Town.x = D.w - 46; if (nb && Town.bump <= 0){ townToast(nb.name + ' opens after: ' + nb.need, '#FFB89A'); Town.bump = 2.5; }
  }
  if (Town.bump > 0) Town.bump -= dt;
  /* things to find: low ones by walking over them, high ones with the head */
  const head = townHeadPos(), t = townData();
  for (let i = 0; i < TOWN_ITEMS.length; i++){
    const it = TOWN_ITEMS[i]; if ((it.in || it.d) !== Town.d || t.found[it.id]) continue;
    const cy = TG - it.h - 10;
    if (it.h < 60 ? Math.abs(Town.x - it.x) < 40 : Math.hypot(head.x - it.x, head.y - cy) < 42) townCollect(it);
  }
  /* what is in reach */
  Town.near = townNearest(D, inp);
  let target2 = Town.near;
  if (inp.click && Town.ui.prompt && townInRect(Town.ui.prompt, inp.cx, inp.cy) && target2){ townUse(target2); return; }
  if (inp.click && !onUI) { /* a tap on the street only walks (handled above) */ }
  if (inp.act && target2){ townUse(target2); return; }
  if (inp.jrn && typeof townShowJournal === 'function') townShowJournal();
  if (inp.map && typeof townShowMap === 'function') townShowMap();
  if (inp.car && typeof townCarToggle === 'function') townCarToggle();
  if (inp.click){
    for (let i = 0; i < Town.ui.btns.length; i++){ const b = Town.ui.btns[i]; if (townInRect(b, inp.cx, inp.cy)){ townButton(b.id); return; } }
  }
}
function townButton(id){
  SFX.click();
  if (id === 'journal') townShowJournal();
  else if (id === 'map') townShowMap();
  else if (id === 'menu') townShowMenu();
  else if (id === 'car') townCarToggle();
}
function townEscape(){
  if (typeof townDialogOpen === 'function' && townDialogOpen()){ townCloseDialog(); return; }
  if (Town.panel){ townClosePanel(); return; }
  townShowMenu();
}

/* ---- using things ---- */
function townUse(o){
  if (o.k === 'npc'){ townTalk(o.id); return; }
  if (o.k === 'wish'){ townWish(); return; }
  if (o.k === 'dig'){ townDig(o.i); return; }
  const b = o.b;
  if (b.gate && !b.gate()){ townSay({ name: b.label, text: b.gateText || 'It is closed.' }, []); SFX.deny(); return; }
  switch (b.act){
    case 'map': townShowMap(); break;
    case 'wardrobe': townLeaveFor(function(){ SFX.click(); showWardrobe(); }); break;
    case 'shop': townLeaveFor(function(){ SFX.click(); crateResult = null; showShop(); }); break;
    case 'arcade': townLeaveFor(function(){ SFX.click(); showMiniMenu(); }); break;
    case 'photo': townLeaveFor(function(){ SFX.click(); showPhoto(); }); break;
    case 'forage': {
      if (forageReadyIn() > 0){ townSay({ name: b.label, text: 'The acacia is bare for now. The leaves will be back in ' + fmtClock(forageReadyIn()) + '.' }, []); SFX.deny(); break; }
      townLeaveFor(function(){ startForage(); });
      break;
    }
    case 'cavern': townLeaveFor(function(){ SFX.click(); showShop('city'); }); break;
    case 'fusion': townLeaveFor(function(){ SFX.click(); G.fuseSel = []; G.fuseFrom = 'menu'; showFusionMachine(); }); break;
    case 'burrows': townGo('burrows', 260, 1); break;
    case 'exit': townGo('square', 2200, -1); break;
    default: townBuildingTalk(b);
  }
}
function townWish(){
  const t = townData(); t.n.wish = (t.n.wish | 0) + 1; Save.write();
  const lines = ['You toss in a coin and wish for a very tall tree.', 'A coin goes in. The water twinkles.', 'You wish for a day with no rain. Or a day with only rain. Hard to say.',
    'The fountain gurgles. Possibly a yes.', 'You wish the herd well. The water sparkles.'];
  SFX.coin(); townBurst(Town.x + Town.face * 40, TG - 70, '#9BE8FF', 10);
  townSay({ name: 'The fountain', text: lines[(t.n.wish - 1) % lines.length] }, []);
}
function townDig(i){
  const dl = townDaily(); if (dl.got.indexOf(i) >= 0) return;
  dl.got.push(i); dl.n = (dl.n | 0) + 1;
  const r = miniRng(townHash(dl.d + 'p' + i))(), spot = dl.dig[i];
  let reward, label;
  if (r < 0.5){ reward = { coin: 3 }; label = 'a purse of gold'; } else if (r < 0.85){ reward = { gems: 12 + Math.floor(r * 10) }; label = 'some gems'; } else { reward = { gems: 25, coin: 2 }; label = 'a glittering find'; }
  const msg = townPay(reward);
  townPop(spot.x, TG - 30, '+ ' + msg, '#FFE9A0'); townBurst(spot.x, TG - 10, '#FFE9A0', 16); SFX.level();
  townToast('You dug up ' + label + ': ' + msg + '. (' + dl.got.length + ' of ' + dl.dig.length + ' today)', '#FFE9A0');
  Save.write();
}

/* ---- drawing ---- */
function townLayerCanvas(w, h, R, paint, D){
  const cv = document.createElement('canvas'); cv.width = Math.ceil(w * R); cv.height = Math.ceil(h * R);
  const c = cv.getContext('2d'); c.scale(R, R); paint(c, D, w, h, R);
  return { cv: cv, w: w, h: h };
}
function townGetLayers(D, V){
  const R = clamp(V.sc * (G.dpr || 1), 0.55, 1.5), RR = Math.min(R, 4096 / D.w);
  const gates = D.b.map(function(b){ return b.gate && !b.gate() ? 1 : 0; }).join('');
  const key = D.id + '|' + Math.round(RR * 10) + '|' + Math.round(V.vw / 80) + '|' + gates + '|' + (D.sig ? D.sig() : '');
  if (Town.layers && Town.layerKey === key) return Town.layers;
  const fw = D.w * 0.25 + V.vw * 0.75 + 40, mw = D.w * 0.55 + V.vw * 0.45 + 40;
  const L = {
    far: townLayerCanvas(Math.ceil(fw), 600, Math.min(RR, 1), townPaintFar, D),
    mid: townLayerCanvas(Math.ceil(mw), 600, Math.min(RR, 1.1), townPaintMid, D),
    field: townLayerCanvas(D.w, 600, RR, townPaintField, D)
  };
  Town.layers = L; Town.layerKey = key;
  return L;
}
function townDrawSky(ctx, W, H, h, D){
  const sky = D.indoor ? { top: '#3A2A22', bot: '#4A362A' } : D.cave ? { top: '#150E16', bot: '#2A1E2A' } : townSkyAt(h);
  const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, sky.top); g.addColorStop(1, sky.bot);
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  if (D.cave || D.indoor) return;
  const dark = townDark(h);
  if (dark > 0.15){                                                     /* stars */
    const r = miniRng(913);
    for (let i = 0; i < 70; i++){
      const x = r() * W, y = r() * H * 0.62, tw = 0.5 + 0.5 * Math.sin(Town.t * 1.7 + i * 2.1);
      ctx.fillStyle = 'rgba(255,255,240,' + (dark * (0.35 + tw * 0.6)).toFixed(2) + ')'; ctx.fillRect(x, y, i % 5 ? 1.6 : 2.4, i % 5 ? 1.6 : 2.4);
    }
  }
  /* the sun by day, the moon by night, each crossing the sky */
  const dayK = clamp((h - 6) / 12, -0.2, 1.2), nightK = ((h + 6) % 24) / 12 - 0.5;
  const sx = lerp(0.08, 0.92, dayK) * W, sy = H * 0.5 - Math.sin(clamp(dayK, 0, 1) * Math.PI) * H * 0.38;
  if (dayK > -0.1 && dayK < 1.1){ const gl = ctx.createRadialGradient(sx, sy, 4, sx, sy, 90); gl.addColorStop(0, 'rgba(255,240,180,.9)'); gl.addColorStop(1, 'rgba(255,220,120,0)'); ctx.fillStyle = gl; ctx.fillRect(sx - 90, sy - 90, 180, 180); tCircle(ctx, '#FFF2B8', sx, sy, 22); }
  const mk = (h >= 18 ? (h - 18) / 12 : (h + 6) / 12);
  if (mk >= 0 && mk <= 1){ const mx = lerp(0.1, 0.9, mk) * W, my = H * 0.5 - Math.sin(mk * Math.PI) * H * 0.34; tCircle(ctx, '#EEF2FF', mx, my, 17); tCircle(ctx, 'rgba(120,130,170,.35)', mx - 5, my - 3, 5); tCircle(ctx, 'rgba(120,130,170,.3)', mx + 6, my + 5, 3.4); }
  for (let i = 0; i < 4; i++){                                          /* a few slow clouds */
    const cx = ((i * 0.31 + Town.t * 0.004 * (1 + i * 0.3)) % 1.3 - 0.15) * W, cy = H * (0.1 + i * 0.07);
    ctx.fillStyle = 'rgba(255,255,255,' + (0.5 - dark * 0.35 + Town.rainK * 0.25).toFixed(2) + ')';
    tEll(ctx, ctx.fillStyle, cx, cy, 60 + i * 12, 14 + i * 2); tEll(ctx, ctx.fillStyle, cx + 30, cy - 8, 40, 12);
  }
}
function townNpcProp(ctx, n, hd, t){
  const id = n.id, dir = n.dir, x = hd.x, y = hd.y;
  if (n.reach > 0.35 && id !== 'marina') return;
  ctx.save();
  if (id === 'marina'){                                             /* a rod and a line into the water */
    ctx.strokeStyle = '#6A4A32'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x + dir * 12, y + 8); ctx.lineTo(x + dir * 78, y - 34); ctx.stroke();
    ctx.strokeStyle = 'rgba(255,255,255,.7)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x + dir * 78, y - 34); ctx.quadraticCurveTo(x + dir * 86, y + 60, x + dir * 84, TG - 36 + Math.sin(t * 2) * 3); ctx.stroke();
    tCircle(ctx, '#D5352B', x + dir * 84, TG - 36 + Math.sin(t * 2) * 3, 3);
  } else if (id === 'rio'){                                         /* a camera */
    tRound(ctx, '#2A2A34', x + dir * 14 - 11, y + 16, 22, 15, 3); tCircle(ctx, '#7AD8FF', x + dir * 20, y + 24, 4.4);
  } else if (id === 'tilly'){                                       /* a measuring tape */
    ctx.strokeStyle = '#FFE9A8'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x - 10, y + 26); ctx.quadraticCurveTo(x, y + 44, x + 12, y + 28); ctx.stroke();
  } else if (id === 'nova'){                                        /* a little star chart */
    tRound(ctx, '#1F2A5A', x + dir * 16 - 14, y + 26, 28, 20, 3); ctx.fillStyle = '#FFF'; ctx.fillRect(x + dir * 16 - 8, y + 31, 2, 2); ctx.fillRect(x + dir * 16 + 2, y + 36, 2, 2); ctx.fillRect(x + dir * 16 - 2, y + 40, 2, 2);
  } else if (id === 'skye'){                                        /* a wrench */
    ctx.strokeStyle = '#C9CDD9'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x + dir * 12, y + 20); ctx.lineTo(x + dir * 24, y + 6); ctx.stroke(); tCircle(ctx, '#C9CDD9', x + dir * 25, y + 5, 4);
  } else if (id === 'penny'){                                       /* a tray of buns */
    tRound(ctx, '#8A6642', x + dir * 14 - 20, y + 30, 40, 6, 3); for (let i = 0; i < 3; i++) tEll(ctx, '#E9B26A', x + dir * 14 - 12 + i * 12, y + 27, 6, 4.5);
  } else if (id === 'ossi'){                                        /* a walking stick */
    ctx.strokeStyle = '#6A4A32'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x + dir * 22, y + 40); ctx.lineTo(x + dir * 30, TG); ctx.stroke();
  }
  ctx.restore();
}
function townDynamic(ctx, D, t, dark){
  const h = townHour();
  if (D.id === 'square'){
    /* the fountain's jets */
    for (let i = 0; i < 5; i++){ const a = (t * 1.3 + i * 0.4) % 1, ang = -1.2 + i * 0.6; ctx.fillStyle = 'rgba(190,235,255,' + (0.8 - a * 0.6).toFixed(2) + ')'; ctx.beginPath(); ctx.arc(960 + Math.cos(ang) * 20 * a * 2, TG - 130 + Math.sin(ang) * 20 * a - a * a * -26 + a * 30, 3, 0, TAU); ctx.fill(); }
    tEll(ctx, 'rgba(255,255,255,.4)', 960 + Math.sin(t * 2) * 18, TG - 37, 16, 3);
    /* pennants for the chapters she has finished, between the two lamps in front of the hall */
    const x0 = 1120, x1 = 1920, y0 = TG - 166, n = 13;
    ctx.strokeStyle = '#4A3624'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.quadraticCurveTo((x0 + x1) / 2, y0 + 70, x1, y0); ctx.stroke();
    for (let i = 0; i < n; i++){
      if (!townDoneCh(i + 1)) continue;
      const u = (i + 0.7) / (n + 0.4), px = lerp(x0, x1, u), py = y0 + 2 * 35 * u * (1 - u) * 2 + Math.sin(t * 2 + i) * 1.5;
      tPoly(ctx, WARD[i + 1].c, [px - 8, py, px + 8, py, px + Math.sin(t * 3 + i) * 2, py + 22]);
    }
    /* the clock on the hall */
    const d = new Date(), ha = (d.getHours() % 12 + d.getMinutes() / 60) / 12 * TAU - Math.PI / 2, ma = d.getMinutes() / 60 * TAU - Math.PI / 2, cx = 1280, cy = TG - 270 - 22;
    ctx.strokeStyle = '#3A2A1E'; ctx.lineCap = 'round'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(ha) * 11, cy + Math.sin(ha) * 11); ctx.stroke();
    ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(ma) * 16, cy + Math.sin(ma) * 16); ctx.stroke();
  } else if (D.id === 'market'){
    for (let i = 0; i < 4; i++){ const a = (t * 0.5 + i * 0.25) % 1; tCircle(ctx, 'rgba(220,220,230,' + (0.5 - a * 0.5).toFixed(2) + ')', 1084 + a * 24 + i, TG - 215 - a * 60, 5 + a * 9); }
  } else if (D.id === 'park'){
    for (let i = 0; i < 3; i++){ const bx = 1100 + Math.sin(t * 0.6 + i * 2) * 120 + i * 60, by = TG - 80 - Math.sin(t * 1.4 + i) * 20 - i * 20, wf = Math.abs(Math.sin(t * 9 + i)); tEll(ctx, ['#FFB84A', '#F29AC0', '#9BD0FF'][i], bx - 4, by, 4 * wf + 1, 5); tEll(ctx, ['#FFB84A', '#F29AC0', '#9BD0FF'][i], bx + 4, by, 4 * wf + 1, 5); }
    ctx.strokeStyle = 'rgba(255,255,255,.45)'; ctx.lineWidth = 1.4; for (let i = 0; i < 2; i++){ const a = (t * 0.4 + i * 0.5) % 1; ctx.beginPath(); ctx.ellipse(1220 + (i - 0.5) * 60, TG + 22, 24 + a * 40, 4 + a * 7, 0, 0, TAU); ctx.globalAlpha = 1 - a; ctx.stroke(); ctx.globalAlpha = 1; }
  } else if (D.id === 'harbour'){
    ctx.fillStyle = 'rgba(255,255,255,.4)'; for (let i = 0; i < 14; i++){ const x = ((i * 190 + t * 22) % (D.w + 80)) - 40; ctx.fillRect(x, TG - 64 + (i % 5) * 11, 22, 1.6); }
    if (dark > 0.2 || Town.lit){ const a = t * 0.9, bx = 1640, by = TG - 420 + 33; ctx.save(); ctx.translate(bx, by); ctx.rotate(a); const g = ctx.createLinearGradient(0, 0, 420, 0); g.addColorStop(0, 'rgba(255,240,170,.55)'); g.addColorStop(1, 'rgba(255,240,170,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(420, -38); ctx.lineTo(420, 38); ctx.closePath(); ctx.fill(); ctx.restore(); }
  } else if (D.id === 'roofs'){
    [[400, 260], [1980, 338], [1980 + 0, 0]].forEach(function(a, i){ if (!a[1]) return; if (Math.sin(t * 3 + i) > 0) tCircle(ctx, '#FF4A3C', a[0], TG - a[1] - 4, 4.5); });
    for (let i = 0; i < 4; i++){ const a = (t * 0.2 + i * 0.27) % 1; tCircle(ctx, 'rgba(220,220,230,' + (0.4 - a * 0.4).toFixed(2) + ')', 1400 + a * 20, TG - 170 - a * 80, 5 + a * 8); }
  } else if (D.id === 'launch'){
    for (let i = 0; i < 5; i++){ const a = (t * 0.6 + i * 0.2) % 1; tCircle(ctx, 'rgba(235,235,245,' + (0.5 - a * 0.5).toFixed(2) + ')', 1960 + (i - 2) * 22 * a * 2, TG - 6 - a * 18, 10 + a * 18); }
    if (Math.sin(t * 2.4) > 0) tCircle(ctx, '#FF4A3C', 2160, TG - 304, 4.5);
  } else if (D.id === 'burrows'){
    for (let i = 0; i < 12; i++){ const x = (i * 197 + Math.sin(t * 0.3 + i) * 30) % D.w, y = (t * 14 + i * 53) % 480; ctx.fillStyle = 'rgba(255,240,200,' + (0.08 + 0.08 * Math.sin(t + i)).toFixed(2) + ')'; ctx.fillRect(x, y, 2, 2); }
  }
}
function townDrawLights(ctx, D, dark, t){
  const a = D.indoor ? 0.55 : D.cave ? 0.9 : D.fixedDusk ? 0.75 : dark;
  if (a <= 0.03) return;
  ctx.save();
  if (D._win){ ctx.fillStyle = 'rgba(255,214,120,' + (a * 0.85).toFixed(2) + ')'; D._win.forEach(function(w){ ctx.fillRect(w.x, w.y, w.w, w.h); }); }
  if (fxLevelNow() > 0){
    ctx.globalCompositeOperation = 'lighter';
    D.L.forEach(function(l, i){
      const r = l.r * (1 + Math.sin(t * 2 + i) * 0.04), g = ctx.createRadialGradient(l.x, l.y, 4, l.x, l.y, r);
      g.addColorStop(0, 'rgba(255,200,100,' + (a * 0.5).toFixed(2) + ')'); g.addColorStop(1, 'rgba(255,200,100,0)');
      ctx.fillStyle = g; ctx.fillRect(l.x - r, l.y - r, r * 2, r * 2);
    });
  }
  ctx.restore();
}
function townNpcMark(n){
  if (n.id === 'dot') return '';
  const er = townErrandFor(n.id); if (!er || !townErrandAvailable(er)) return '';
  const st = townErrState(er.id);
  return st === 1 ? (townErrandReady(er) ? '?' : '…') : '!';
}
function renderTown(ctx){
  const D = TOWN_DIST[Town.d], V = townView(), W = G.W, H = G.H, h = townHour(), dark = D.cave || D.indoor || D.fixedDusk ? 0 : townDark(h), t = Town.t;
  townDrawSky(ctx, W, H, h, D);
  const L = townGetLayers(D, V), cam = Town.camX;
  ctx.save();
  ctx.translate(0, H - 600 * V.sc - Town.lift); ctx.scale(V.sc, V.sc);
  ctx.save(); ctx.translate(-cam, 0);
  ctx.drawImage(L.far.cv, cam * 0.75, 0, L.far.w, 600);
  ctx.drawImage(L.mid.cv, cam * 0.45, 0, L.mid.w, 600);
  ctx.drawImage(L.field.cv, 0, 0, D.w, 600);
  townDynamic(ctx, D, t, dark);
  /* edge signs: where the street goes on, and what is shut */
  const edge = function(side, nb){
    if (!nb) return;
    const ex = side < 0 ? 70 : D.w - 70, open = nb.open();
    tRect(ctx, '#5A3B22', ex - 3, TG - 96, 6, 96); tRound(ctx, open ? '#2F6A44' : '#6A3A32', ex - 66, TG - 120, 132, 34, 6);
    ctx.fillStyle = '#FFF'; ctx.font = 'bold 15px system-ui,sans-serif'; ctx.textAlign = 'center'; ctx.fillText((side < 0 ? '◀ ' : '') + nb.name + (side > 0 ? ' ▶' : ''), ex, TG - 98);
    if (!open){ ctx.font = '11px system-ui,sans-serif'; ctx.fillStyle = '#FFD0C0'; ctx.fillText('Closed', ex, TG - 80); }
  };
  edge(-1, D.left && TOWN_DIST[D.left]); edge(1, D.right && TOWN_DIST[D.right]);
  /* glimmering ground */
  const dl = townDaily();
  dl.dig.forEach(function(s, i){ if (s.d === Town.d && dl.got.indexOf(i) < 0){ ctx.save(); ctx.translate(s.x, TG + 8); townDigArt(ctx, t, i); ctx.restore(); } });
  /* things to find */
  const tw = townData();
  for (let i = 0; i < TOWN_ITEMS.length; i++){
    const it = TOWN_ITEMS[i]; if ((it.in || it.d) !== Town.d || tw.found[it.id]) continue;
    if (it.x < cam - 40 || it.x > cam + V.vw + 40) continue;
    ctx.save(); ctx.translate(it.x, TG - it.h - 10); townItemArt(ctx, it, t, i * 1.7); ctx.restore();
  }
  /* the herd, then her */
  Town.npcs.forEach(function(n){
    if (n.x < cam - 120 || n.x > cam + V.vw + 120) return;
    const lk = n.def.look, hd = townGiraffe(ctx, n.x, TG, { s: 1.45 * lk.s, look: { coat: lk.coat, spot: lk.spot, pat: lk.pat, hat: lk.hat, boot: lk.boot, hc: lk.hc, bc: lk.bc },
      flip: n.dir < 0, ph: n.ph, moving: n.moving, reach: n.reach, bob: n.bob, sit: n.sit, seed: n.seed, t: t });
    townNpcProp(ctx, n, hd, t);
    const near = Math.abs(Town.x - n.x) < 220;
    const mk = townNpcMark(n);
    if (mk){ ctx.save(); ctx.translate(n.x, hd.y - 34 - Math.abs(Math.sin(t * 3)) * 4); tCircle(ctx, '#FFD84D', 0, 0, 11); ctx.fillStyle = '#3A2A1E'; ctx.font = 'bold 16px system-ui,sans-serif'; ctx.textAlign = 'center'; ctx.fillText(mk, 0, 5.5); ctx.restore(); }
    if (near) miniText(ctx, n.def.name, n.x, hd.y - 52 - (mk ? 14 : 0), 13, '#FFF6E0');
  });
  townDrawPlayer(ctx, t);
  /* the glow of the lights, then the evening tint over the whole street */
  townDrawLights(ctx, D, dark, t);
  for (let i = 0; i < Town.fx.length; i++){ const p = Town.fx[i], a = 1 - p.t / p.life; ctx.globalAlpha = a; tCircle(ctx, p.col, p.x, p.y, p.r); }
  ctx.globalAlpha = 1;
  for (let i = 0; i < Town.pops.length; i++){ const p = Town.pops[i]; ctx.globalAlpha = Math.min(1, (1.5 - p.t) * 1.5); miniText(ctx, p.txt, p.x, p.y - p.t * 34, 15, p.col); }
  ctx.globalAlpha = 1;
  ctx.restore();
  ctx.restore();
  /* tint and weather are over the world, under the interface */
  if (D.indoor){ ctx.fillStyle = 'rgba(46,26,6,.1)'; ctx.fillRect(0, 0, W, H); }
  else if (D.cave){ ctx.fillStyle = 'rgba(6,3,10,.16)'; ctx.fillRect(0, 0, W, H); }
  else {
    if (dark > 0.01){ ctx.fillStyle = 'rgba(10,18,60,' + (dark * 0.5).toFixed(3) + ')'; ctx.fillRect(0, 0, W, H); }
    const dk = townDusk(h); if (dk > 0.01){ ctx.fillStyle = 'rgba(255,120,50,' + (dk * 0.14).toFixed(3) + ')'; ctx.fillRect(0, 0, W, H); }
    if (Town.rainK > 0.02){
      ctx.fillStyle = 'rgba(40,55,80,' + (Town.rainK * 0.22).toFixed(3) + ')'; ctx.fillRect(0, 0, W, H);
      if (fxLevelNow() > 0){
        ctx.strokeStyle = 'rgba(200,220,255,' + (0.5 * Town.rainK).toFixed(2) + ')'; ctx.lineWidth = 1.2; ctx.beginPath();
        const n = fxLevelNow() > 1 ? 90 : 45;
        for (let i = 0; i < n; i++){ const x = (i * 97.3 + t * 40) % (W + 40) - 20, y = ((i * 61.7 + t * 640) % (H + 60)) - 30; ctx.moveTo(x, y); ctx.lineTo(x - 5, y + 16); }
        ctx.stroke();
      }
    }
  }
  if (typeof townWeatherFX === 'function') townWeatherFX(ctx, D, W, H, h);
  townDrawHud(ctx, D, h);
  drawFade(ctx);
}
function townDrawHud(ctx, D, h){
  const W = G.W, H = G.H, s = clamp(Math.min(H / 700, W / 760), 0.8, 1.2);
  Town.ui.btns = []; Town.ui.prompt = null;
  /* the district name and what is found in it */
  const inRoom = !!D.indoor, items = inRoom ? townInItems(D.id).length : townItemsIn(D.id).length, got = inRoom ? townInItems(D.id).filter(function(it){ return townFound(it.id); }).length : townFoundIn(D.id);
  const narrow = W < 600, bw = (narrow ? 70 : 78) * s * (Input.hasTouch ? 1.25 : 1), bh = 34 * s * (Input.hasTouch ? 1.25 : 1), rowY = narrow ? 10 + 54 * s + 8 : 10;
  ctx.fillStyle = 'rgba(14,10,8,.5)'; ctx.beginPath(); ctx.roundRect(10, 10, narrow ? W - 20 : Math.min(360 * s, W - 3 * (bw + 6) - 24), 54 * s, 10); ctx.fill();
  miniText(ctx, D.name, 22, 36 * s, 20 * s, '#FFE9A0', 'left');
  miniText(ctx, (items ? 'Found ' + got + ' of ' + items + townLeftText(D) : (D.indoor ? 'Indoors' : 'Outdoors')) + '  ·  ' + (D.cave ? 'underground' : townDark(h) > 0.6 ? 'night' : townDark(h) > 0.1 ? 'dusk' : 'day') + (Town.rainK > 0.4 ? ', rain' : ''), 22, 55 * s, 12.5 * s, '#E8D8B0', 'left', false);
  /* the places along the street */
  const dots = TOWN_ORDER.concat(['burrows']);
  ctx.save(); const dx0 = 22, dy = narrow ? rowY + bh / 2 : 76 * s + 6;
  dots.forEach(function(id, i){
    const open = townOpen(id), cur = id === D.id;
    ctx.fillStyle = cur ? '#FFD84D' : open ? 'rgba(255,255,255,.7)' : 'rgba(255,255,255,.2)';
    ctx.beginPath(); ctx.arc(dx0 + i * 15 + (i === dots.length - 1 ? 8 : 0), dy, cur ? 5.2 : 3.6, 0, TAU); ctx.fill();
  });
  ctx.restore();
  /* buttons, top right */
  const labels = [['journal', Input.hasTouch ? 'Journal' : 'Journal J'], ['map', Input.hasTouch ? 'Map' : 'Map M'], ['menu', Input.hasTouch ? 'Menu' : 'Menu Esc']];
  if (typeof townCarOwned === 'function' && townCarOwned() && !D.indoor && !D.cave) labels.unshift(['car', Town.car ? 'Get out' : (Input.hasTouch ? 'Car' : 'Car C')]);
  labels.forEach(function(b, i){
    const x = W - 10 - (labels.length - i) * (bw + 6) + 6, y = rowY;
    ctx.fillStyle = 'rgba(14,10,8,.62)'; ctx.beginPath(); ctx.roundRect(x, y, bw, bh, 8); ctx.fill();
    ctx.strokeStyle = 'rgba(242,179,61,.5)'; ctx.lineWidth = 1.2; ctx.stroke();
    ctx.fillStyle = '#FFF6E0'; ctx.font = 'bold ' + Math.round(12.5 * s) + 'px system-ui,sans-serif'; ctx.textAlign = 'center'; ctx.fillText(b[1], x + bw / 2, y + bh / 2 + 4.5);
    Town.ui.btns.push({ id: b[0], x: x, y: y, w: bw, h: bh });
  });
  /* what she has */
  if (narrow) miniText(ctx, fmt(Save.data.gold | 0) + ' gold   ' + fmt(Save.data.gems | 0) + ' gems', W - 22, 36 * s, 13 * s, '#FFE9A0', 'right', false);
  else miniText(ctx, fmt(Save.data.gold | 0) + ' gold   ' + fmt(Save.data.gems | 0) + ' gems', W - 14, 10 + bh + 20 * s, 13 * s, '#FFE9A0', 'right', false);
  /* notices */
  for (let i = 0; i < Town.toasts.length; i++){
    const o = Town.toasts[i], a = Math.min(1, (4.2 - o.t) * 1.5, o.t * 5);
    ctx.globalAlpha = Math.max(0, a); miniText(ctx, o.txt, W / 2, (narrow ? 150 : 112) * s + i * 24 * s, Math.min(15 * s, (W - 20) / Math.max(12, o.txt.length) * 1.9), o.col); ctx.globalAlpha = 1;
  }
  /* the district banner when she arrives */
  if (Town.bannerT > 0){ const a = Math.min(1, Town.bannerT, (3.2 - Town.bannerT) * 3); ctx.globalAlpha = a; miniText(ctx, D.name, W / 2, H * 0.3, 40 * s, '#FFF6E0'); ctx.globalAlpha = 1; }
  /* the prompt for what is in reach */
  if (Town.near && !Town.hold && !Town.panel){
    const label = (Input.hasTouch ? 'Tap: ' : 'E: ') + Town.near.label;
    ctx.font = 'bold ' + Math.round(16 * s) + 'px system-ui,sans-serif';
    const tw = ctx.measureText(label).width + 36 * s, ph = 44 * s * (Input.hasTouch ? 1.25 : 1), px = W / 2 - tw / 2, py = H - 74 * s - (Input.hasTouch ? 20 : 0);
    ctx.fillStyle = 'rgba(14,10,8,.78)'; ctx.beginPath(); ctx.roundRect(px, py, tw, ph, 12); ctx.fill();
    ctx.strokeStyle = '#FFD84D'; ctx.lineWidth = 2; ctx.stroke();
    ctx.fillStyle = '#FFF6E0'; ctx.textAlign = 'center'; ctx.fillText(label, W / 2, py + ph / 2 + 5.5 * s);
    Town.ui.prompt = { x: px, y: py, w: tw, h: ph };
  }
  /* a one-time reminder of the controls */
  if (!townData().tips.controls && Town.t > 1.5){
    ctx.fillStyle = 'rgba(14,10,8,.7)'; ctx.beginPath(); ctx.roundRect(W / 2 - 250 * s, H - 36 * s - 4, 500 * s, 30 * s, 8); ctx.fill();
    miniText(ctx, Input.hasTouch ? 'Hold a finger to walk. Hold it above her head to stretch her neck.' : 'A / D walk  ·  hold W to stretch her neck  ·  E to use things  ·  J journal  ·  M map', W / 2, H - 16 * s, 13 * s, '#E8D8B0', 'center', false);
    Town.tipT += 1 / 60; if (Town.tipT > 14){ townData().tips.controls = 1; Save.write(); }
  }
}

/* ---- joining the game's own loop ---- */
(function(){
  /* update: the town runs from step() (it has its own state), and keeps NPCs and the clock moving behind the game's own screens */
  const st = step;
  step = function(dt){
    if (Town.on){
      const own = G.state === 'town';
      if (own || townVisible()) updateTown(dt, !own);
    }
    st(dt);
  };
  /* draw */
  const rn = render;
  render = function(){
    if (townVisible()){
      const ctx = CTX; if (!ctx) return;
      ctx.setTransform(G.dpr, 0, 0, G.dpr, 0, 0); ctx.globalAlpha = 1; ctx.fillStyle = STAGE_BG; ctx.fillRect(0, 0, G.W, G.H);
      renderTown(ctx);
      return;
    }
    return rn.apply(this, arguments);
  };
  /* back from a building: showMenu() lands here instead of on the main menu */
  const sm = showMenu;
  showMenu = function(){
    if (Town.on && G.townReturn){ townResume(); return; }
    return sm.apply(this, arguments);
  };
  /* starting a run ends the visit */
  const sr = startRun;
  startRun = function(){ Town.on = false; G.townReturn = false; return sr.apply(this, arguments); };
})();
