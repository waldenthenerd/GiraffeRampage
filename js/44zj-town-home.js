'use strict';
/* Longneck Town, ninth part: Her Home comes alive. */
/* ========================= 44zj. HER HOME, DETAILED AND LIVED IN ========================= */
/* 1 A FULLER ROOM: a window onto the weather, a clock that keeps the real time, pendant lights, coat hooks and a mat, floor boards, a bed,
     and a little shelf of souvenirs that grows with what she has done in town.
   2 THINGS TO DO: sit on the sofa, the armchair or the hammock; lie down in the bed; pet the cat, talk to the parrot, feed the goldfish
     (the first time each day gives a few gems); switch the lamp on and off; water the plant; look out of the window.
   3 THE PET IS ALIVE: it is drawn live each frame (tail, blinks, swimming) rather than painted into the room. */
const HOME_BED_X = 1205;
const HOME_PARROT = ['Hello!', 'Nice neck!', 'Where is my cracker?', 'Squawk. Good morning.', 'Tall! So tall!', 'Longneck! Longneck!', 'Is it dinner?', 'Wibble.'];
function homeDay(){ try { return townDaily().d; } catch (e) { return ''; } }
function homeMisc(){ const h = homeData(); if (typeof h.lampOff !== 'number') h.lampOff = 0; if (typeof h.wat !== 'string') h.wat = ''; if (typeof h.petd !== 'string') h.petd = ''; return h; }
function homeSouv(){
  let m = '';
  try {
    const t = townData();
    m += Object.keys(planeFleet().owned || {}).length ? 'p' : '';
    m += townCarOwned() ? 'c' : '';
    m += Object.keys(fishLog()).length ? 'f' : '';
    m += (t.n && (t.n.eaten | 0) > 0) ? 'b' : '';
    m += Object.keys(t.done || {}).length ? 's' : '';
  } catch (e) {}
  return m;
}
function homeWatered(){ return homeMisc().wat === homeDay(); }

/* ---- the permanent furnishing, painted into the room ---- */
function homePaintBase(c){
  const W = 1300;
  /* floor boards and a skirting board */
  tRect(c, 'rgba(60,40,20,.25)', 0, TG - 4, W, 6);
  c.strokeStyle = 'rgba(40,26,12,.22)'; c.lineWidth = 1.5;
  [14, 30, 46].forEach(function(o){ c.beginPath(); c.moveTo(0, TG + o); c.lineTo(W, TG + o); c.stroke(); });
  for (let x = 40, r = 0; x < W; x += 118, r++){ [14, 30, 46].forEach(function(o, k){ const xx = x + ((k + r) % 2) * 59; c.beginPath(); c.moveTo(xx, TG + o - (k ? 16 : 14)); c.lineTo(xx, TG + o); c.stroke(); }); }
  /* the window onto the street */
  tRect(c, '#6A4A2C', 198, 86, 106, 134);
  const g = c.createLinearGradient(0, 94, 0, 216); g.addColorStop(0, '#8FD0F2'); g.addColorStop(1, '#D8F0FF'); c.fillStyle = g; c.fillRect(204, 94, 94, 122);
  tPoly(c, '#7FB06D', [204, 216, 232, 178, 262, 200, 298, 168, 298, 216]); tRect(c, '#B5543C', 262, 160, 24, 18); tPoly(c, '#8F4A36', [258, 160, 274, 148, 290, 160]);
  tCircle(c, 'rgba(255,255,255,.8)', 236, 118, 8); tCircle(c, 'rgba(255,255,255,.8)', 246, 122, 10);
  tRect(c, '#6A4A2C', 248, 94, 4, 122); tRect(c, '#6A4A2C', 204, 150, 94, 4);
  tRect(c, '#8A6A44', 192, 218, 118, 8);
  /* the clock */
  tCircle(c, '#5A3B22', 400, 112, 26); tCircle(c, '#FBF3DC', 400, 112, 22);
  c.fillStyle = '#3E2A18'; for (let i = 0; i < 12; i++){ const a = i / 12 * TAU; c.fillRect(400 + Math.sin(a) * 18 - 1, 112 - Math.cos(a) * 18 - 1, 2, 2); }
  /* coat hooks and a scarf by the door, and a mat */
  tRect(c, '#5A3B22', 636, 100, 90, 8); [654, 681, 708].forEach(function(x){ tRect(c, '#C9A24A', x - 2, 108, 4, 10); });
  tRound(c, '#C9503C', 649, 116, 12, 54, 4); tRect(c, '#F2D79A', 649, 150, 12, 5);
  tRound(c, '#3E6A8A', 676, 118, 26, 38, 6);
  tRound(c, '#6A5A3A', 72, TG + 12, 78, 20, 6); tRect(c, 'rgba(255,255,255,.18)', 82, TG + 17, 58, 3);
  /* a souvenir shelf */
  const sv = homeSouv();
  tRect(c, '#5A3B22', 1000, 150, 84, 6); tRect(c, '#3E2A18', 1006, 156, 6, 8); tRect(c, '#3E2A18', 1072, 156, 6, 8);
  let sx = 1012;
  if (sv.indexOf('p') >= 0){ tEll(c, '#E8E8F2', sx + 8, 138, 12, 4); tRect(c, '#C9503C', sx + 8, 130, 3, 8); tRect(c, '#E8E8F2', sx + 2, 134, 12, 2); sx += 24; }
  if (sv.indexOf('c') >= 0){ tRound(c, '#D5352B', sx, 138, 20, 8, 3); tCircle(c, '#222', sx + 4, 148, 3); tCircle(c, '#222', sx + 16, 148, 3); sx += 24; }
  if (sv.indexOf('f') >= 0){ tEll(c, '#FF8A2A', sx + 8, 142, 9, 5); tPoly(c, '#FF8A2A', [sx + 15, 142, sx + 22, 136, sx + 22, 148]); sx += 26; }
  if (sv.indexOf('b') >= 0){ tRound(c, '#C98A44', sx, 136, 20, 12, 6); tRect(c, '#A66A2C', sx + 4, 138, 3, 6); tRect(c, '#A66A2C', sx + 11, 138, 3, 6); sx += 24; }
  if (sv.indexOf('s') >= 0){ tCircle(c, '#FFD84D', sx + 8, 140, 8); c.fillStyle = '#C9962F'; c.fillRect(sx + 6, 148, 4, 2); }
  /* the bed: headboard on the left, a thick blanket */
  const bx = HOME_BED_X;
  tRect(c, '#4A3624', bx - 66, TG - 100, 12, 106); tRect(c, '#4A3624', bx + 56, TG - 46, 10, 52);
  tRect(c, '#6A4A2C', bx - 60, TG - 34, 122, 14); tRect(c, '#4A3624', bx - 56, TG - 20, 6, 24); tRect(c, '#4A3624', bx + 52, TG - 20, 6, 24);
  tRound(c, '#F4F1E8', bx - 56, TG - 50, 114, 18, 8); tRound(c, '#FBFBF2', bx - 54, TG - 62, 34, 16, 8);
  /* pendant lights */
  /* (the room already hangs its own lights) */
}

/* ---- live drawing: the pets, the window sky, the lamp's glow ---- */
function homeLampPos(){
  const i = homeSet('lamp'); if (!i) return null;
  const x = HOME_SLOTS.lamp.x;
  return [null, { x: x, y: TG - 156 }, { x: x, y: 94 }, { x: x, y: 120 }][i];
}
function homeDrawCat(c, x, y, t, happy, sitting){
  const tail = Math.sin(t * (happy ? 7 : 2)) * (happy ? 10 : 4);
  c.strokeStyle = '#E8A838'; c.lineWidth = 4; c.lineCap = 'round'; c.beginPath(); c.moveTo(x - 16, y - 8); c.quadraticCurveTo(x - 34, y - 14, x - 28 + tail * 0.3, y - 30 - tail); c.stroke();
  tEll(c, '#E8A838', x, y - 12, 19, 12); tEll(c, '#F7D58A', x + 4, y - 7, 10, 6);
  tCircle(c, '#E8A838', x + 14, y - 26, 10);
  tPoly(c, '#E8A838', [x + 6, y - 32, x + 9, y - 44, x + 14, y - 33]); tPoly(c, '#E8A838', [x + 15, y - 33, x + 20, y - 44, x + 22, y - 32]);
  c.strokeStyle = '#3A2410'; c.lineWidth = 1.6;
  const blink = Math.sin(t * 0.7) > 0.97;
  if (happy || blink){ c.beginPath(); c.arc(x + 11, y - 27, 2.4, 0.2, Math.PI - 0.2); c.arc(x + 19, y - 27, 2.4, 0.2, Math.PI - 0.2); c.stroke(); }
  else { tCircle(c, '#2A1A0A', x + 11, y - 27, 1.8); tCircle(c, '#2A1A0A', x + 19, y - 27, 1.8); }
  tPoly(c, '#E88A8A', [x + 14, y - 22, x + 17, y - 22, x + 15.5, y - 20]);
}
function homeDrawParrot(c, x, t, talk){
  tRect(c, '#5A3B22', x - 2, TG - 100, 4, 100); tRect(c, '#5A3B22', x - 20, TG - 100, 40, 4);
  const bob = Math.sin(t * 2.4) * 1.5, ty = TG - 122 + bob;
  tPoly(c, '#2E8A4A', [x - 6, ty + 10, x - 10, ty + 40, x - 2, ty + 36]);
  tEll(c, '#D5352B', x, ty, 10, 16); tEll(c, '#F2C230', x + 2, ty + 4, 6, 9);
  tCircle(c, '#D5352B', x + 4, ty - 18, 8);
  const o = talk ? Math.abs(Math.sin(t * 20)) * 3 : 0;
  tPoly(c, '#F2C230', [x + 10, ty - 20, x + 19, ty - 15 + o * 0.3, x + 10, ty - 13]);
  if (talk) tPoly(c, '#F2C230', [x + 10, ty - 14, x + 18, ty - 12 + o, x + 10, ty - 11]);
  tCircle(c, '#FFF', x + 5, ty - 20, 2.4); tCircle(c, '#111', x + 5.5, ty - 20, 1.2);
}
function homeDrawFish(c, x, t, food){
  tRound(c, 'rgba(160,220,255,.5)', x - 24, TG - 62, 48, 50, 18);
  tRound(c, 'rgba(90,170,230,.35)', x - 22, TG - 46, 44, 32, 14);
  const fx = x + Math.sin(t * 0.9) * 12, fy = TG - 34 + Math.sin(t * 1.7) * 4, d = Math.cos(t * 0.9) >= 0 ? 1 : -1;
  tEll(c, '#FF8A2A', fx, fy, 8, 4.5); tPoly(c, '#FF8A2A', [fx - d * 7, fy, fx - d * 14, fy - 6, fx - d * 14, fy + 6]); tCircle(c, '#111', fx + d * 4, fy - 1, 1);
  c.fillStyle = 'rgba(255,255,255,.7)'; for (let k = 0; k < 2; k++){ const by = TG - 20 - ((t * 14 + k * 20) % 30); c.beginPath(); c.arc(x - 12 + k * 22, by, 1.6, 0, TAU); c.fill(); }
  if (food > 0){ c.fillStyle = '#C9A24A'; for (let k = 0; k < 6; k++) c.fillRect(x - 14 + k * 5, TG - 64 + (1 - food) * 40 + (k % 2) * 5, 2, 2); }
  tRect(c, '#8A6A44', x - 28, TG - 14, 56, 6);
}
(function(){
  /* the pet is painted live now, so the cached room leaves it out */
  _homeFx.pet = [null, null, null, null];
  const bp = townBuildingX;
  townBuildingX = function(c, D, b, P, r){ if (b.kind === 'homebed') return true; return bp(c, D, b, P, r); };
  const dx = townDynX;
  townDynX = function(ctx, D, t, dark){
    dx(ctx, D, t, dark);
    if (D.id !== 'in_myhome') return;
    /* the window: night and rain over the painted day */
    if (townIsNight()){
      ctx.fillStyle = 'rgba(8,14,48,.72)'; ctx.fillRect(204, 94, 94, 122);
      ctx.fillStyle = '#FFF'; for (let i = 0; i < 9; i++) ctx.fillRect(210 + (i * 37) % 82, 100 + (i * 23) % 60, 2, 2);
      tCircle(ctx, '#EEF2FF', 276, 114, 7);
    } else if (townRainNow()){
      ctx.fillStyle = 'rgba(70,80,100,.4)'; ctx.fillRect(204, 94, 94, 122);
    }
    if (townRainNow()){
      ctx.strokeStyle = 'rgba(210,230,255,.7)'; ctx.lineWidth = 1.4;
      for (let i = 0; i < 12; i++){ const px = 208 + (i * 29) % 88, py = 96 + ((t * 120 + i * 37) % 118); ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px - 2, py + 8); ctx.stroke(); }
    }
    /* the clock hands tell the real time */
    const d = new Date(), hr = (d.getHours() % 12) + d.getMinutes() / 60;
    ctx.strokeStyle = '#2A1A0A'; ctx.lineCap = 'round';
    ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(400, 112); ctx.lineTo(400 + Math.sin(hr / 12 * TAU) * 11, 112 - Math.cos(hr / 12 * TAU) * 11); ctx.stroke();
    ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(400, 112); ctx.lineTo(400 + Math.sin(d.getMinutes() / 60 * TAU) * 16, 112 - Math.cos(d.getMinutes() / 60 * TAU) * 16); ctx.stroke();
    /* the lamp's glow */
    const lp = homeLampPos(), h = homeMisc();
    if (lp && !h.lampOff){
      const gr = ctx.createRadialGradient(lp.x, lp.y, 4, lp.x, lp.y, 190); gr.addColorStop(0, 'rgba(255,225,140,.42)'); gr.addColorStop(1, 'rgba(255,225,140,0)');
      ctx.fillStyle = gr; ctx.fillRect(lp.x - 190, lp.y - 190, 380, 380);
    }
    /* the pet */
    const pi = homeSet('pet'), px = HOME_SLOTS.pet.x, rec = Town.petT !== undefined && Town.t - Town.petT < 2.2;
    if (pi === 1){
      const onSofa = Town.seat && Town.seat.kind === 'sofa';
      if (onSofa) homeDrawCat(ctx, Town.seat.x - Town.seat.face * 58, TG - 44, t, true);
      else homeDrawCat(ctx, px, TG, t, rec);
    } else if (pi === 2) homeDrawParrot(ctx, px, t, rec);
    else if (pi === 3) homeDrawFish(ctx, px, t, rec ? Math.max(0, 1 - (Town.t - Town.petT) / 2.2) : 0);
    /* a little watered flower on the plant */
    if (homeSet('plant') && homeWatered()){
      const x = HOME_SLOTS.plant.x;
      [[-16, -86], [10, -96], [-2, -70]].forEach(function(o){ tCircle(ctx, '#FF9ECB', x + o[0], TG + o[1], 4); tCircle(ctx, '#FFE24D', x + o[0], TG + o[1], 1.6); });
    }
  };
  const rp2 = townRoomProps;
  townRoomProps = function(c, D, K, r){
    if (D.room === 'home') homePaintBase(c);
    rp2(c, D, K, r);
  };
  /* the room's cache key follows what the room now shows */
  TOWN_DIST.in_myhome.sig = function(){ return homeSig() + '|' + homeSouv() + '|' + (homeMisc().lampOff ? 'o' : 'l'); };
  TOWN_DIST.in_myhome.b.push({ id: 'bed', kind: 'homebed', x: HOME_BED_X, w: 150, h: 0, label: 'The bed', act: 'decor', slot: 'bed' });
  /* the prompts */
  const nr = townNearest;
  townNearest = function(D, inp){
    const o = nr(D, inp);
    if (o && o.k === 'b' && D.id === 'in_myhome' && o.b.act === 'decor'){
      const s = o.b.slot, i = s === 'bed' ? 1 : homeSet(s);
      const verb = homeVerb(s, i); if (verb) o.label = verb;
    }
    return o;
  };
})();
function homeVerb(slot, i){
  if (slot === 'bed') return 'Lie down in the bed';
  if (!i) return null;
  switch (slot){
    case 'sofa': return 'Sit on the ' + ['', 'sofa', 'armchair', 'hammock'][i];
    case 'pet': return ['', 'Pet the cat', 'Talk to the parrot', 'Feed the goldfish'][i];
    case 'lamp': return 'Use the lamp';
    case 'plant': return 'Look after the plant';
    case 'window': return 'Look out of the window';
    case 'art': return 'Look at the picture';
    case 'shelf': return 'Look at the shelf';
    case 'rug': return 'Look at the rug';
  }
  return null;
}

/* ---- sitting and lying ---- */
function homeSeat(kind, x, face){
  Town.seat = { kind: kind, x: x, face: face, t: 0 };
  Town.x = x; Town.face = face; Town.vx = 0; Town.autoX = undefined;
  SFX.pick();
  townToast(kind === 'bed' ? 'She lies down. Press E, or any way, to get up.' : 'She sits down. Press E, or move, to get up.', '#E8D8B0');
}
function homeStand(){
  const s = Town.seat; if (!s) return;
  Town.seat = null; Town.reach = 0;
  if (s.kind === 'bed' && s.t > 6) { townToast('Well rested.', '#BFFF9A'); townBurst(Town.x, TG - 80, '#FFE9A0', 6); }
  SFX.click();
}
(function(){
  const uT = updateTown, tE = townEnter, dp = townDrawPlayer, tu = townUse;
  townEnter = function(){ Town.seat = null; return tE.apply(this, arguments); };
  updateTown = function(dt, frozen){
    if (Town.seat && (!Town.on || Town.d !== 'in_myhome' || G.state !== 'town')) Town.seat = null;
    if (!Town.seat) return uT.call(this, dt, frozen);
    const inp = townInput(), s = Town.seat;
    s.t += Math.min(dt, 0.05);
    if (!Town.hold && !Town.panel && !frozen){
      const onPrompt = townInRect(Town.ui.prompt, inp.cx, inp.cy);
      if (inp.act || Math.abs(inp.mx) > 0.2 || inp.down || (inp.click && !Town.ui.btns.some(function(b){ return townInRect(b, inp.cx, inp.cy); }))) { homeStand(); return uT.call(this, dt, true); }
      Town.reach += ((s.kind === 'bed' ? -0.4 : inp.up ? 1 : 0) - Town.reach) * Math.min(1, dt * 7);
      if (onPrompt && inp.click){ homeStand(); return uT.call(this, dt, true); }
    }
    const r = uT.call(this, dt, true);
    if (Town.seat && !Town.hold && !Town.panel) Town.near = { k: 'stand', label: Town.seat.kind === 'bed' ? 'Get up' : 'Stand up' };
    return r;
  };
  townDrawPlayer = function(ctx, t){
    const s = Town.seat;
    if (!s) return dp(ctx, t);
    const lie = s.kind === 'bed', ham = s.kind === 'hammock';
    const o = { s: 1.5, flip: s.face < 0, sit: true, lie: lie, reach: lie ? -0.4 : Town.reach, t: t, bob: Math.sin(s.t * 1.8) * (lie ? 0.5 : 0.25), dip: lie ? 20 : 0, lean: lie ? 4 : 0, ph: 0, moving: false };
    const gy = lie ? TG - 28 : ham ? TG - 34 : s.kind === 'sofa' ? TG - 6 : TG - 4;
    townGiraffe(ctx, s.x, gy, o);
    if (lie){
      const bx = s.x;
      tRound(ctx, '#6C8EC0', bx - 40, TG - 66, 100, 34, 10);
      ctx.fillStyle = '#9EB8DA'; for (let k = 0; k < 4; k++) ctx.fillRect(bx - 20 + k * 22, TG - 66, 8, 34);
      ctx.fillStyle = 'rgba(255,255,255,.85)'; ctx.font = 'bold 18px system-ui'; ctx.textAlign = 'center';
      for (let k = 0; k < 3; k++){ const u = (s.t * 0.6 + k / 3) % 1; ctx.globalAlpha = 1 - u; ctx.fillText('Z', bx - 62 + k * 10, TG - 120 - u * 50); }
      ctx.globalAlpha = 1;
    }
  };
  townUse = function(o){
    if (o.k === 'stand'){ homeStand(); return; }
    if (o.k === 'b' && o.b.act === 'decor' && Town.d === 'in_myhome'){ homeInteract(o.b.slot); return; }
    tu(o);
  };
})();

/* ---- things to do ---- */
const HOME_LOOK = {
  rug: ['', 'A round rug. Your feet like it very much.', 'A striped runner, straight as a ruler.', 'A savanna hide rug. Nobody is quite sure whose.'],
  art: ['', 'A landscape: green hills and a tidy sun.', 'The starfield. If you stare, it starts to look back.', 'The herd, in gold. Everyone has their good side.'],
  shelf: ['', 'A bookshelf. Most of the books have pictures of leaves.', 'A trophy shelf. Several of the trophies are very small, and still yours.', 'A toy shelf. A wooden train, a wooden giraffe, a wooden you.'],
  window: ['', 'The curtains are drawn back. You can see the whole park.', 'Stained glass: red, yellow and blue. The floor turns the colours.', 'A flower box under the sill. The bees visit.']
};
function homeChange(slot){ townCloseDialog(); townShowDecor(slot); }
function homeInteract(slot){
  const h = homeMisc();
  if (slot === 'bed'){ homeSeat('bed', HOME_BED_X, -1); return; }
  const i = homeSet(slot), S = HOME_SLOTS[slot];
  if (!i){ townShowDecor(slot); return; }
  const name = S.opts[i][0];
  const change = { label: 'Change it', fn: function(){ homeChange(slot); } }, back = { label: 'Leave it', fn: function(){ townCloseDialog(); } };
  switch (slot){
    case 'sofa':
      townSay({ name: name, text: i === 3 ? 'A hammock slung across the room. It sways a little.' : 'It looks very comfortable.' }, [
        { label: 'Sit down', fn: function(){ townCloseDialog(); homeSeat(i === 1 ? 'sofa' : i === 2 ? 'armchair' : 'hammock', HOME_SLOTS.sofa.x, 1); } }, change, back]);
      break;
    case 'pet':
      townSay({ name: name, text: ['', 'The cat is sitting very still, pretending not to have noticed you.', 'The parrot looks at you with one eye, then the other.', 'The goldfish swims a lap and looks at you hopefully.'][i] }, [
        { label: ['', 'Pet the cat', 'Talk to the parrot', 'Feed the goldfish'][i], fn: function(){ townCloseDialog(); homePet(i); } }, change, back]);
      break;
    case 'lamp':
      townSay({ name: name, text: h.lampOff ? 'The lamp is off.' : 'The lamp is on. The room glows.' }, [
        { label: h.lampOff ? 'Switch it on' : 'Switch it off', fn: function(){ h.lampOff = h.lampOff ? 0 : 1; Save.write(); SFX.click(); Town.layerKey = ''; townCloseDialog(); } }, change, back]);
      break;
    case 'plant':
      townSay({ name: name, text: homeWatered() ? 'It has been watered today and has put out a flower. It looks smug.' : 'The soil is a little dry.' }, [
        { label: homeWatered() ? 'Admire it' : 'Water it', fn: function(){ townCloseDialog(); if (!homeWatered()){ h.wat = homeDay(); Save.write(); SFX.pick(); townBurst(HOME_SLOTS.plant.x, TG - 70, '#9BE8FF', 10); townToast('You water the plant. A flower opens.', '#BFFF9A'); } } }, change, back]);
      break;
    case 'window':
      townSay({ name: name, text: (townIsNight() ? 'It is night out. ' : 'It is daytime. ') + (townRainNow() ? 'It is raining on the park.' : 'It is dry outside.') + (HOME_LOOK.window[i] ? ' ' + HOME_LOOK.window[i] : '') }, [change, back]);
      break;
    default:
      townSay({ name: name, text: (HOME_LOOK[slot] && HOME_LOOK[slot][i]) || 'It is yours, and it is nice.' }, [change, back]);
  }
}
function homePet(i){
  const h = homeMisc(), px = HOME_SLOTS.pet.x;
  Town.petT = Town.t;
  if (i === 1){ townPop(px + 10, TG - 70, '♥ purr', '#FF9ECB'); townBurst(px + 12, TG - 46, '#FF9ECB', 8); SFX.pick(); }
  else if (i === 2){ const w = HOME_PARROT[Math.floor(Math.random() * HOME_PARROT.length)]; townPop(px + 10, TG - 160, w, '#FFE9A0'); SFX.click(); }
  else { townPop(px, TG - 80, 'blub', '#9BE8FF'); townBurst(px, TG - 40, '#9BE8FF', 8); SFX.pick(); }
  if (h.petd !== homeDay()){
    h.petd = homeDay();
    const m = townPay({ gems: 5 }); townToast('A good start to the day: ' + m + '.', '#BFFF9A');
  }
  Save.write();
}
