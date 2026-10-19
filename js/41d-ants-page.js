'use strict';
/* =============================================================================================================================
   41d-ants-page.js  --  THE ANTS TAB AS A CUTAWAY OF THE ANTHILL. It used to be a list of plain rows. Now the top is the surface (the mound, in the
   look of the colony's Venus upgrade, with a worker carrying a leaf in), and below it, cut into the soil, are the chambers joined by tunnels: the
   food store (what she has, how to make more, the foraging minigame), a chamber for each kind of ant with the ants she has hired wandering in it
   (drawn with the same drawAnt() as in a run), and, once the dust alliance is possible, a deeper layer with a room for each dust alien.
   HIRING  Hire 1, 5 or 10 at a time: the price rises 1.3x for each ant of that type up to the 16th (antCost in 11-ants.js), so a batch costs the
     sum of its steps (antCostMany); a batch is all or nothing, like the gear crates, and cannot go past the cap. The old hire-<type> actions
     still hire one.
   THE PICTURES  Three small canvases and the surface strip are drawn by one loop (about 24 frames a second, only while the tab is showing, and a
     single still frame when Visual effects is off). The ants walk about in their own chamber at their own pace; the positions are kept in
     antsPage.sim, as fractions of the chamber, so hiring one does not make the others jump.
   Replaces antsTabHTML (11-ants.js; the locked view is still that file's text) and wraps showShop and handleAction. The dust squad section of
   26-dust-squad.js is not used any more: the deep layer here has the same hiring (hireSquad) in rooms.
   ============================================================================================================================= */
const antsPage = { id: 0, raf: 0, last: 0, sim: {}, cvs: [], t: 0 };
function antCostMany(type, n){
  const have = (Save.data.ants && Save.data.ants[type]) | 0; let sum = 0;
  for (let k = 0; k < n; k++) sum += Math.round(Math.pow(1.3, Math.min(ANT_COST_CAP, have + k)) * 10) / 10;
  return Math.round(sum * 10) / 10;
}
function antCanHire(type, n){
  const have = (Save.data.ants && Save.data.ants[type]) | 0;
  return !!ANT_TYPES[type] && !!Save.data.antsUnlocked && have + n <= antMax() && Save.data.food + 1e-9 >= antCostMany(type, n);
}
function hireAntMany(type, n){
  if (!(n >= 1) || !antCanHire(type, n)){ SFX.deny(); return false; }
  const c = antCostMany(type, n);
  Save.data.food = Math.round((Save.data.food - c) * 10) / 10;
  Save.data.ants[type] = ((Save.data.ants[type] | 0) + n);
  Save.write(); SFX.buy(); return true;
}
function antsStatsHTML(type){
  const T = ANT_TYPES[type], pw = antHpMul(), dm = antDmgMul(), r = function(x){ return Math.round(x); };
  const chips = [['Health', r(T.hp * pw)]];
  if (T.dmg) chips.push(['Bite', r(T.dmg * dm)]);
  if (T.blast) chips.push(['Blast', r(T.blast * antBlastMul())]);
  chips.push(['Speed', r(T.spd * antSpdMul())]);
  if (T.range) chips.push(['Range', T.range]);
  return '<div class="arstats">' + chips.map(function(c){ return '<span>' + c[0] + ' <b>' + c[1] + '</b></span>'; }).join('') + '</div>';
}
function antsRoomHTML(type){
  const T = ANT_TYPES[type], n = (Save.data.ants[type] | 0), cap = antMax(), maxed = n >= cap;
  const btns = [1, 5, 10].map(function(k){
    const ok = antCanHire(type, k);
    return '<button class="btn sm' + (k === 1 ? '' : ' ghost crm') + (ok ? (k === 1 ? '' : ' ok') : ' ghost') + '" data-a="ant-hire-' + type + '-' + k + '"' + (ok ? '' : ' disabled') + '>Hire ' + k +
      '<small>' + (n + k > cap ? 'no room' : antCostMany(type, k) + ' food') + '</small></button>';
  }).join('');
  return '<article class="aproom" style="--ac:' + T.color + '"><div class="arhead"><b>' + T.name + '</b><span class="arcount">' + n + ' / ' + cap + '</span></div>' +
    '<canvas class="arcv" data-ant="' + type + '"></canvas><p class="ards">' + T.desc + '</p>' + antsStatsHTML(type) +
    '<div class="arbar" title="' + n + ' of ' + cap + ' hired"><u style="width:' + Math.min(100, n / cap * 100).toFixed(1) + '%"></u></div>' +
    (maxed ? '<div class="arfull">Chamber full</div>' : '<div class="arbtns">' + btns + '</div>') + '</article>';
}
function antsFoodHTML(){
  const canFood = Save.data.gold >= FOOD_GOLD && (Save.data.gems | 0) >= FOOD_GEMS, afford = foodAffordable(), note = foodNote; foodNote = '';
  return '<section class="apfood"><div class="afbig"><span class="afic">' + ico('@t-apple') + '</span><div><small>Food store</small><b>' + Save.data.food.toFixed(1) + '</b></div></div>' +
    '<div class="afmake"><div class="afnote">' + (note ? '<b>' + note + '</b> ' : '') + 'Every ant costs food. Each extra ant of a kind costs 1.3× the last. You can make <b>' + afford + '</b> more right now.</div>' +
      '<div class="afbtns"><button class="btn sm' + (canFood ? '' : ' ghost') + '" data-a="ant-food"' + (canFood ? '' : ' disabled') + '>Make 1<small>' + fmt(FOOD_GOLD) + ' gold + ' + FOOD_GEMS + ' gems</small></button>' +
        '<button class="btn sm ghost crm' + (canFood ? ' ok' : '') + '" data-a="ant-food-5"' + (canFood ? '' : ' disabled') + '>Make 5<small>' + fmt(FOOD_GOLD * 5) + ' gold + ' + FOOD_GEMS * 5 + ' gems</small></button>' +
        '<span class="afx"><input id="foodAmt" type="number" min="1" step="1" value="' + Math.max(1, Math.min(afford, 10) || 10) + '" aria-label="How much food to make"><button class="btn sm ghost' + (canFood ? ' ok' : '') + '" data-a="ant-food-x"' + (canFood ? '' : ' disabled') + '>Make</button></span></div></div>' +
    '<div class="afforage"><div class="afs">' + ico('@t-x-grass') + '<span>Forage under the acacia<small>Catch falling leaves: 1 food each. Once every 15 minutes.</small></span></div>' + forageButtonHTML('btn sm') + '</div></section>';
}
function antsDeepHTML(){
  if (!Save.data.chapter13Complete) return '';
  if (!squadAvailable()){
    return '<div class="apdeep locked"><h4>The dust alliance</h4><p class="sub" style="margin:0">The dust aliens will fight beside you, but they only live in a fully built colony. Build the <b>Deep Colony</b> at the Venus outpost (and unlock the ant colony) to give them rooms below the anthill.</p></div>';
  }
  const rooms = SQUAD_SLOTS.map(function(s, i){
    const k = DUST_KIT[s.type], hired = squadHired(i), c = squadCost(i), can = canPay(c);
    return '<article class="aproom sq' + (hired ? ' hired' : '') + '" style="--ac:' + k.color + '"><div class="arhead"><b>' + s.name + '</b><span class="arcount">Key ' + (i + 1) + '</span></div>' +
      '<canvas class="arsq" data-sq="' + s.type + '" width="64" height="64"></canvas>' +
      (hired ? '<div class="arfull">In the squad</div>' : '<div class="arbtns"><button class="btn sm' + (can ? '' : ' ghost') + '" data-a="squad-hire-' + i + '"' + (can ? '' : ' disabled') + '>Hire<small>' + costText(c) + '</small></button></div>') + '</article>';
  }).join('');
  return '<div class="aptuns one"><i></i></div><div class="apdeep"><h4>The dust alliance</h4><p class="sub" style="margin:0 0 8px">Up to five dust aliens join the squad. In a run, ' + (Input.hasTouch ? 'tap them in the squad strip on the right edge' : 'keys <b>1–5</b>') +
    ' call them in; each has ten times your health (armour does not help it) and needs ' + SQUAD_CD + ' seconds before it can be called again if it falls.</p><div class="aprooms sq5">' + rooms + '</div></div>';
}
const _antsLockedHTML = antsTabHTML;
antsTabHTML = function(){
  if (!Save.data.antsUnlocked) return _antsLockedHTML.apply(this, arguments);
  return '<div class="antpg"><div class="apsurf"><canvas id="antSurface"></canvas><div class="apsl"><b>The colony</b><small>Hired ants are permanent. Each kind comes out of the anthill every ' + Math.round(antRespawnTime() * 10) / 10 + ' seconds until all you own are out.</small></div></div>' +
    '<div class="apsoil"><div class="aptuns one"><i></i></div>' + antsFoodHTML() + '<div class="aptuns"><i></i><i></i><i></i></div>' +
    '<div class="aprooms">' + ANT_ORDER.map(antsRoomHTML).join('') + '</div>' + antsDeepHTML() + '</div></div>';
};

/* ---------- the pictures ---------- */
function antsFitCanvas(cv){
  const d = Math.min(2, window.devicePixelRatio || 1), r = cv.getBoundingClientRect(), w = Math.max(40, Math.round(r.width || 200)), h = Math.max(40, Math.round(r.height || 100));
  if (cv.width !== Math.round(w * d) || cv.height !== Math.round(h * d)){ cv.width = Math.round(w * d); cv.height = Math.round(h * d); }
  cv._w = w; cv._h = h; cv._d = d;
}
function antsSimStep(type, n, dt, W, H){
  const arr = antsPage.sim[type] = antsPage.sim[type] || [], sp = 26 * ANT_TYPES[type].spd / 150;
  while (arr.length < n){ const i = arr.length; arr.push({ x: 0.14 + ((i * 0.618 + 0.1) % 1) * 0.72, y: 0.3 + ((i * 0.381 + 0.2) % 1) * 0.55, ang: Math.random() * TAU, anim: Math.random() * 6, tx: Math.random(), ty: Math.random(), wait: Math.random() * 1.2 }); }
  if (arr.length > n) arr.length = n;
  arr.forEach(function(a){
    if (a.wait > 0){ a.wait -= dt; a.anim += dt * 1.5; return; }
    const dx = (a.tx - a.x) * W, dy = (a.ty - a.y) * H, d = Math.hypot(dx, dy);
    if (d < 4){ a.wait = 0.5 + Math.random() * 1.8; a.tx = 0.12 + Math.random() * 0.76; a.ty = 0.3 + Math.random() * 0.55; return; }
    const want = Math.atan2(dy, dx); let da = want - a.ang; while (da > Math.PI) da -= TAU; while (da < -Math.PI) da += TAU;
    a.ang += da * Math.min(1, dt * 6);
    a.x += Math.cos(a.ang) * sp * dt / W; a.y += Math.sin(a.ang) * sp * dt / H; a.anim += dt * 12;
    a.x = Math.max(0.06, Math.min(0.94, a.x)); a.y = Math.max(0.22, Math.min(0.9, a.y));
  });
  return arr;
}
function antsDrawRoom(cv, type, dt){
  const c = cv.getContext('2d'); if (!c) return;
  const W = cv._w, H = cv._h, d = cv._d, n = Math.min(9, Save.data.ants[type] | 0), T = ANT_TYPES[type];
  c.setTransform(d, 0, 0, d, 0, 0); c.clearRect(0, 0, W, H);
  const g = c.createRadialGradient(W / 2, H * 0.4, 6, W / 2, H * 0.5, W * 0.62); g.addColorStop(0, '#3A2A1C'); g.addColorStop(1, '#190F09'); c.fillStyle = g; c.fillRect(0, 0, W, H);
  for (let i = 0; i < 14; i++){ const h = Math.sin((type.length + i) * 91.7) * 43758.5, f = h - Math.floor(h), h2 = Math.sin((type.length + i) * 12.9) * 4375.5, f2 = h2 - Math.floor(h2);
    c.fillStyle = 'rgba(' + (90 + (i % 3) * 14) + ',' + (66 + (i % 3) * 8) + ',44,.35)'; c.beginPath(); c.ellipse(f * W, H * 0.55 + f2 * H * 0.45, 2 + (i % 3), 1.4 + (i % 2), 0, 0, TAU); c.fill(); }
  if (n <= 0){
    c.globalAlpha = 0.28; drawAnt(c, { type: type, x: W / 2, y: H / 2, ang: -0.4, anim: 0, r: T.r * 2.1, flash: 0, hp: 1, maxHp: 1 }); c.globalAlpha = 1;
    c.fillStyle = 'rgba(214,201,178,.8)'; c.font = '600 12px system-ui,sans-serif'; c.textAlign = 'center'; c.fillText('Empty chamber', W / 2, H - 10);
    return;
  }
  const ants = antsSimStep(type, n, dt, W, H);
  ants.slice().sort(function(a, b){ return a.y - b.y; }).forEach(function(a){ drawAnt(c, { type: type, x: a.x * W, y: a.y * H, ang: a.ang, anim: a.anim, r: T.r * 2.1, flash: 0, hp: 1, maxHp: 1 }); });
  const extra = (Save.data.ants[type] | 0) - n;
  if (extra > 0){ c.fillStyle = 'rgba(0,0,0,.5)'; c.fillRect(W - 40, 4, 36, 16); c.fillStyle = '#F4E4C4'; c.font = '700 11px system-ui,sans-serif'; c.textAlign = 'center'; c.fillText('+' + extra, W - 22, 16); }
}
function antsDrawSurface(cv, t){
  const c = cv.getContext('2d'); if (!c) return;
  const W = cv._w, H = cv._h, d = cv._d, tier = typeof venusColTier === 'function' ? venusColTier() : 0, pal = COLONY_PALETTE[tier] || COLONY_PALETTE[0], gy = H - 26;
  c.setTransform(d, 0, 0, d, 0, 0);
  const sky = c.createLinearGradient(0, 0, 0, gy); sky.addColorStop(0, '#2E4660'); sky.addColorStop(0.7, '#B98E62'); sky.addColorStop(1, '#E3B878'); c.fillStyle = sky; c.fillRect(0, 0, W, H);
  c.fillStyle = 'rgba(255,240,200,.85)'; c.beginPath(); c.arc(W * 0.14, gy - 34, 13, 0, TAU); c.fill();
  c.fillStyle = 'rgba(255,244,214,.18)'; c.beginPath(); c.arc(W * 0.14, gy - 34, 24, 0, TAU); c.fill();
  c.fillStyle = '#4C6A30'; c.fillRect(0, gy, W, H - gy);                                                              /* the grass */
  c.fillStyle = '#6E9444'; for (let i = 0; i < W; i += 7){ const h = 3 + ((i * 7) % 5); c.fillRect(i, gy - h + 2, 2, h); }
  const mx = W / 2, ring = pal.rings || ['#7A5A36', '#8A6A44', '#9A7A52', '#AA8A62'];                                    /* the mound, in the colony's look */
  for (let i = 0; i < ring.length; i++){ const rw = [92, 72, 52, 32][i], rh = [50, 42, 33, 22][i]; c.fillStyle = ring[i]; c.beginPath(); c.ellipse(mx, gy + 2, rw, rh, 0, Math.PI, TAU); c.fill(); }
  c.fillStyle = '#120B07'; c.beginPath(); c.moveTo(mx - 9, gy + 2); c.quadraticCurveTo(mx - 9, gy - 16, mx, gy - 16); c.quadraticCurveTo(mx + 9, gy - 16, mx + 9, gy + 2); c.fill();
  const u = (t * 0.16) % 1, ax = u < 0.5 ? W * 0.14 + (mx - 14 - W * 0.14) * (u / 0.5) : mx - 14 - (mx - 14 - W * 0.14) * ((u - 0.5) / 0.5);   /* a worker, in with a leaf and back out */
  const goingIn = u < 0.5, bob = Math.sin(t * 14) * 0.8, wx = goingIn ? ax : ax;
  c.fillStyle = '#2A1408'; c.beginPath(); c.ellipse(wx, gy + 4 + bob, 5, 2.6, 0, 0, TAU); c.fill(); c.beginPath(); c.arc(wx + (goingIn ? 5 : -5), gy + 3 + bob, 2.2, 0, TAU); c.fill();
  if (goingIn){ c.fillStyle = '#8AD070'; c.beginPath(); c.ellipse(wx - 1, gy - 3 + bob, 6, 3.2, -0.3, 0, TAU); c.fill(); }
}
function antsLoop(ts){
  const me = antsPage.id; if (!antsPage.cvs.length || !document.body.contains(antsPage.cvs[0])) return;
  const fx = typeof fxLevelNow === 'function' ? fxLevelNow() : 1;
  if (!antsPage.last || ts - antsPage.last >= 41){
    const dt = antsPage.last ? Math.min(0.1, (ts - antsPage.last) / 1000) : 0.05; antsPage.last = ts; antsPage.t += dt;
    antsPage.cvs.forEach(function(cv){ try { if (cv.id === 'antSurface') antsDrawSurface(cv, antsPage.t); else if (cv.dataset.ant) antsDrawRoom(cv, cv.dataset.ant, dt); } catch (e) {} });
  }
  if (fx > 0 && me === antsPage.id) antsPage.raf = requestAnimationFrame(antsLoop);
}
function antsDrawSquadPortraits(){
  document.querySelectorAll('.arsq').forEach(function(cv){
    const type = cv.dataset.sq, def = typeof ETYPES_MARS !== 'undefined' ? ETYPES_MARS[type] : null, c = cv.getContext('2d'); if (!def || !c) return;
    try { c.clearRect(0, 0, 64, 64); c.save(); c.translate(32, 34); const z = 26 / Math.max(14, def.r); c.scale(z, z);
      drawEnemy(c, { portrait: true, def: def, type: type, x: 0, y: 0, r: def.r, ang: 0, flash: 0, state: 'idle', anim: 1, hp: 1, maxHp: 1, big: false, kx: 0, ky: 0, stunT: 0, burnT: 0, slowT: 0, slowMul: 1 }); c.restore(); } catch (e) {}
  });
}
function antsPageStop(){ if (antsPage.raf) cancelAnimationFrame(antsPage.raf); antsPage.raf = 0; antsPage.id++; antsPage.cvs = []; }
function antsPageMount(){
  antsPageStop();
  const list = [].slice.call(document.querySelectorAll('#antSurface, .arcv')); if (!list.length) return;
  list.forEach(antsFitCanvas); antsPage.cvs = list; antsPage.last = 0; antsDrawSquadPortraits();
  antsPage.raf = requestAnimationFrame(antsLoop);
  if (typeof fxLevelNow === 'function' && fxLevelNow() === 0) antsLoop(performance.now());                    /* one still picture */
}
(function(){
  const sh = showShop;
  showShop = function(){
    const r = sh.apply(this, arguments);
    if (shopTab === 'ants' && G.state === 'shop') antsPageMount(); else antsPageStop();
    return r;
  };
  const h = handleAction;
  handleAction = function(a){
    if (typeof a === 'string' && a.indexOf('ant-hire-') === 0){
      const m = /^ant-hire-([a-z]+)-(1|5|10)$/.exec(a); if (m) hireAntMany(m[1], +m[2]); showShop('ants'); return;
    }
    return h.apply(this, arguments);
  };
})();
