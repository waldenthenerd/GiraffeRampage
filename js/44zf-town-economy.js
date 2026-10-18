'use strict';
/* Longneck Town, sixth part: more to spend gold on. */
/* ========================= 44zf. FLEET, OVEN, HOME AND GALLERY ========================= */
/* 1 PLANES. Four planes, each with its own stall and rotation speeds, cruise, top speed, climb, how sharply the elevator answers and how
      much the rings pay. Save.data.town.plane = { own, col (unused now), owned:{id:1}, sel:'id', cols:{id:n} }. The stats are copied into
      FV (44ze) at take-off. Sold at Wingnut Aviation.
   2 CARS. Four cars with their own town speed and Chapter 6 speed. Save.data.town.car = { own, col, owned:{id:1}, sel:'id' }. Sold at the garage.
   3 THE OVEN. Save.data.town.n.oven is 0 to 3: the satchel holds 30, 40, 50, 60 loaves and a loaf heals 5%, 6%, 7%, 8%.
   4 HER HOME. A house at the far end of Willow Park. Eight slots (rug, sofa, art, lamp, plant, shelf, window, pet), each with a few things
      to buy. Save.data.town.home = { own:{'slot:i':1}, set:{slot:i} }. The room is painted from it (the layer's signature changes).
   5 THE GALLERY. Six frames on the wall of Herd Hall. Each can hold any photo from her album. Save.data.town.gal = [code or '' x6]. */
const PLANES = [
  { id: 'sparrow', name: 'Sparrow', price: 60000, stall: 135, rotate: 165, cruise: 250, max: 335, climb: 1.0, agile: 1.0, rings: 1.0, blurb: 'Forgiving, steady, a good first plane.' },
  { id: 'skylark', name: 'Skylark', price: 140000, stall: 115, rotate: 150, cruise: 285, max: 395, climb: 1.12, agile: 1.0, rings: 1.25, blurb: 'Faster, and it stalls later. Rings pay more.' },
  { id: 'aerobat', name: 'Aerobat', price: 220000, stall: 125, rotate: 155, cruise: 300, max: 415, climb: 1.4, agile: 1.55, rings: 1.45, blurb: 'Answers the elevator at once. Twitchy, quick, thrilling.' },
  { id: 'hauler', name: 'Cargo Hauler', price: 320000, stall: 150, rotate: 185, cruise: 225, max: 295, climb: 0.8, agile: 0.75, rings: 2.3, blurb: 'Slow, heavy and long-legged. Rings pay more than double.' }
];
const PLANE_BY_ID = {}; PLANES.forEach(function(p){ PLANE_BY_ID[p.id] = p; });
const CARS = [
  { id: 'runabout', name: 'Runabout', price: 24000, town: 2.2, run: 1.45, blurb: 'The honest little open-top.' },
  { id: 'coupe', name: 'Coupe', price: 52000, town: 2.7, run: 1.6, blurb: 'Low, sleek and fast on the flat.' },
  { id: 'jeep', name: 'Rally Jeep', price: 85000, town: 2.4, run: 1.75, blurb: 'Not the fastest in town, but the best in Houston.' },
  { id: 'hotrod', name: 'Hot Rod', price: 150000, town: 3.3, run: 1.85, blurb: 'Flames on the sides. It would be rude not to.' }
];
const CAR_BY_ID = {}; CARS.forEach(function(c){ CAR_BY_ID[c.id] = c; });
Object.assign(FV, { climb: 1, agile: 1, rings: 1 });

/* ---- planes ---- */
function planeFleet(){
  const p = planeData();
  if (!p.owned || typeof p.owned !== 'object' || Array.isArray(p.owned)) p.owned = {};
  if (!p.cols || typeof p.cols !== 'object' || Array.isArray(p.cols)) p.cols = {};
  if (p.own && !p.owned.sparrow && !Object.keys(p.owned).length) p.owned.sparrow = 1;            /* a save from before there was more than one */
  if (!p.sel || !PLANE_BY_ID[p.sel] || !p.owned[p.sel]) p.sel = p.owned.sparrow ? 'sparrow' : (Object.keys(p.owned)[0] || 'sparrow');
  return p;
}
function planeOwned(){ return Object.keys(planeFleet().owned).length > 0; }
function planeSel(){ return PLANE_BY_ID[planeFleet().sel] || PLANES[0]; }
function planeColour(){ const p = planeFleet(), c = (p.cols[p.sel] === undefined ? p.col : p.cols[p.sel]) | 0; return c >= 1 && c <= WARD_MAX && wardUnlocked(c) ? WARD[c].c : '#E8B648'; }
function planeBuy(id){
  id = id || 'sparrow'; const P = PLANE_BY_ID[id], p = planeFleet(); if (!P || p.owned[id]) return false;
  if ((Save.data.gold | 0) < P.price){ SFX.deny(); return false; }
  Save.data.gold -= P.price; p.owned[id] = 1; p.own = 1; p.sel = id; Save.write(); SFX.buy(); SFX.level(); return true;
}
function planePaint(n){ const p = planeFleet(); if (n === 0 || (n >= 1 && n <= WARD_MAX && wardUnlocked(n))){ p.cols[p.sel] = n; Save.write(); return true; } return false; }
function flyStatsFor(id){ const P = PLANE_BY_ID[id] || PLANES[0]; return { stall: P.stall, rotate: P.rotate, cruise: P.cruise, max: P.max, climb: P.climb, agile: P.agile, rings: P.rings }; }
(function(){
  const ft = flyTakeoff, fp = flyPlane;
  flyTakeoff = function(){ Object.assign(FV, flyStatsFor(planeFleet().sel)); return ft.apply(this, arguments); };
  /* each plane has its own look on top of the body: stripes, a pod, a longer nose */
  flyPlane = function(ctx, x, y, o){
    o = o || {};
    fp(ctx, x, y, o);
    const kind = o.kind || (o.rider === false && o.col ? 'sparrow' : planeFleet().sel);
    if (kind === 'sparrow') return;
    const col = o.col || planeColour(), dk = wardShade(col, 0.68);
    ctx.save(); ctx.translate(x, y); ctx.rotate(o.bank || 0); ctx.scale(o.flipScale !== undefined ? o.flipScale : (o.flip ? -1 : 1), 1); if (o.s) ctx.scale(o.s, o.s);
    if (kind === 'skylark'){
      ctx.fillStyle = '#FFFFFF'; ctx.fillRect(-48, 4, 100, 3); ctx.fillStyle = dk; ctx.fillRect(-48, 8, 100, 2);
      ctx.fillStyle = '#C9CDD9'; ctx.beginPath(); ctx.moveTo(68, 2); ctx.lineTo(90, 8); ctx.lineTo(68, 14); ctx.closePath(); ctx.fill();
    } else if (kind === 'aerobat'){
      ctx.fillStyle = '#D5352B'; ctx.fillRect(-24, 8, 62, 4); ctx.fillStyle = '#FFFFFF'; ctx.fillRect(-24, 12, 62, 2); ctx.fillStyle = '#D5352B'; ctx.beginPath(); ctx.moveTo(-76, -34); ctx.lineTo(-92, -34); ctx.lineTo(-84, -20); ctx.closePath(); ctx.fill();
      if (o.prop !== undefined || o.rider !== false){ ctx.strokeStyle = 'rgba(255,255,255,.35)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-98, 10); ctx.lineTo(-130, 14); ctx.stroke(); }
    } else if (kind === 'hauler'){
      ctx.fillStyle = '#8A93A8'; ctx.beginPath(); ctx.roundRect(-34, 26, 74, 20, 8); ctx.fill(); ctx.fillStyle = '#6A7388'; ctx.fillRect(-34, 34, 74, 3);
      ctx.fillStyle = '#F2C230'; ctx.fillRect(-26, 28, 12, 4);
      ctx.strokeStyle = '#3A3A44'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-44, 6); ctx.lineTo(-44, -10); ctx.stroke();
    }
    ctx.restore();
  };
})();
function townShowHangar(){
  const p = planeFleet(), gold = Save.data.gold | 0, cur = p.sel;
  let cards = '';
  PLANES.forEach(function(P){
    const own = !!p.owned[P.id], on = own && cur === P.id;
    cards += '<div class="vcard' + (on ? ' on' : '') + '"><canvas width="190" height="96" data-pl="' + P.id + '"></canvas><b>' + P.name + '</b><span class="vb">' + P.blurb + '</span>' +
      '<span class="vs">stalls ' + P.stall + ' · rotates ' + P.rotate + ' · cruise ' + P.cruise + '<br>rings pay ×' + P.rings + '</span>' +
      (own ? (on ? '<button class="bpbtn" disabled>Flying this one</button>' : '<button class="bpbtn" data-a="town-selplane-' + P.id + '">Fly this one</button>')
           : '<button class="bpbtn" data-a="town-buyplane-' + P.id + '"' + (gold >= P.price ? '' : ' disabled') + '>Buy<small>' + fmt(P.price) + ' gold</small></button>') + '</div>';
  });
  let sw = '<div class="paint"><button class="swt' + (!p.cols[cur] ? ' on' : '') + '" data-a="town-planepaint-0" title="Sunshine yellow" style="background:#E8B648"></button>';
  for (let n = 1; n <= WARD_MAX; n++){ if (!wardUnlocked(n)) continue; sw += '<button class="swt' + (p.cols[cur] === n ? ' on' : '') + '" data-a="town-planepaint-' + n + '" title="' + WARD[n].name + '" style="background:' + WARD[n].c + '"></button>'; }
  sw += '</div>';
  townPanelT('garage', '<div class="tp-title">WINGNUT AVIATION</div><div class="vgrid">' + cards + '</div>' + (planeOwned() ? '<p class="bp">Paint for the ' + PLANE_BY_ID[cur].name + ':</p>' + sw : '<p class="bp">Pick a plane. They all fit a neck.</p>') +
    '<p class="bp">Take off from anywhere on the runway. Right and left: throttle. Up and down: elevator. F: turn round. Esc: leave the flight.</p>', { w: 720 });
  document.querySelectorAll('canvas[data-pl]').forEach(function(cv){
    const id = cv.getAttribute('data-pl'), g = cv.getContext('2d'), own = !!p.owned[id];
    flyPlane(g, 95, 54, { kind: id, col: own && p.cols[id] ? WARD[p.cols[id]].c : '#E8B648', prop: 0.3, s: 0.95, t: 0, rider: false });
  });
}

/* ---- cars ---- */
function carFleet(){
  const c = townCarData();
  if (!c.owned || typeof c.owned !== 'object' || Array.isArray(c.owned)) c.owned = {};
  if (c.own && !Object.keys(c.owned).length) c.owned.runabout = 1;
  if (!c.sel || !CAR_BY_ID[c.sel] || !c.owned[c.sel]) c.sel = c.owned.runabout ? 'runabout' : (Object.keys(c.owned)[0] || 'runabout');
  return c;
}
function townCarOwned(){ return Object.keys(carFleet().owned).length > 0; }
function carSel(){ return CAR_BY_ID[carFleet().sel] || CARS[0]; }
function townCarMul(){ return carSel().town; }
function townCarRunMul(){ return townCarRunActive() ? carSel().run : 1; }
function townCarBuy(id){
  id = id || 'runabout'; const C = CAR_BY_ID[id], c = carFleet(); if (!C || c.owned[id]) return false;
  if ((Save.data.gold | 0) < C.price){ SFX.deny(); return false; }
  Save.data.gold -= C.price; c.owned[id] = 1; c.own = 1; c.sel = id; Save.write(); SFX.buy(); SFX.level(); return true;
}
(function(){
  const cs = townCarSide;
  townCarSide = function(ctx, x, gy, o){
    o = o || {};
    const kind = o.kind || carFleet().sel;
    if (kind === 'coupe'){ ctx.save(); ctx.translate(x, gy); ctx.scale(1, 0.86); cs(ctx, 0, 0, o); ctx.restore(); return; }
    cs(ctx, x, gy, o);
    const dir = o.flip ? -1 : 1;
    ctx.save(); ctx.translate(x, gy); ctx.scale(1.5 * dir, 1.5);
    if (kind === 'jeep'){
      ctx.strokeStyle = '#2A2A34'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-36, -28); ctx.lineTo(-36, -52); ctx.lineTo(0, -52); ctx.lineTo(0, -30); ctx.stroke();
      ctx.fillStyle = '#2A2A34'; ctx.fillRect(-52, -50, 14, 5); ctx.fillStyle = '#F2C230'; ctx.fillRect(38, -34, 8, 4);
    } else if (kind === 'hotrod'){
      ctx.fillStyle = '#FF9A3A'; ctx.beginPath(); ctx.moveTo(-44, -18); ctx.quadraticCurveTo(-20, -22, 4, -16); ctx.quadraticCurveTo(-12, -12, -44, -10); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#FFE24D'; ctx.beginPath(); ctx.moveTo(-40, -16); ctx.quadraticCurveTo(-22, -18, -8, -15); ctx.quadraticCurveTo(-22, -13, -40, -12); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#C9CDD9'; ctx.fillRect(-58, -16, 8, 4); ctx.fillRect(-58, -10, 8, 4);
      if (o.moving && Math.sin((o.t || 0) * 50) > 0){ ctx.fillStyle = '#FF9A3A'; ctx.beginPath(); ctx.moveTo(-58, -14); ctx.lineTo(-74, -12); ctx.lineTo(-58, -8); ctx.closePath(); ctx.fill(); }
    }
    ctx.restore();
  };
})();
function townShowGarage(){
  const c = carFleet(), gold = Save.data.gold | 0, cur = c.sel;
  let cards = '';
  CARS.forEach(function(C){
    const own = !!c.owned[C.id], on = own && cur === C.id;
    cards += '<div class="vcard' + (on ? ' on' : '') + '"><canvas width="190" height="96" data-cr="' + C.id + '"></canvas><b>' + C.name + '</b><span class="vb">' + C.blurb + '</span>' +
      '<span class="vs">town ×' + C.town + ' · Houston +' + Math.round((C.run - 1) * 100) + '%</span>' +
      (own ? (on ? '<button class="bpbtn" disabled>Driving this one</button>' : '<button class="bpbtn" data-a="town-selcar-' + C.id + '">Drive this one</button>')
           : '<button class="bpbtn" data-a="town-buycar-' + C.id + '"' + (gold >= C.price ? '' : ' disabled') + '>Buy<small>' + fmt(C.price) + ' gold</small></button>') + '</div>';
  });
  let sw = '<div class="paint"><button class="swt' + (!c.col ? ' on' : '') + '" data-a="town-carpaint-0" title="Racing red" style="background:#D5352B"></button>';
  for (let n = 1; n <= WARD_MAX; n++){ if (!wardUnlocked(n)) continue; sw += '<button class="swt' + (c.col === n ? ' on' : '') + '" data-a="town-carpaint-' + n + '" title="' + WARD[n].name + '" style="background:' + WARD[n].c + '"></button>'; }
  sw += '</div>';
  townPanelT('garage', '<div class="tp-title">TORQUE MOTORS</div><div class="vgrid">' + cards + '</div>' + (townCarOwned() ? '<p class="bp">Paint (all your cars): press <b>C</b> in town to get in and out.</p>' + sw : '<p class="bp">An open top, and a hole in the roof for the neck. Never underground.</p>'), { w: 720 });
  document.querySelectorAll('canvas[data-cr]').forEach(function(cv){
    const g = cv.getContext('2d'); g.translate(95, 78); g.scale(0.95, 0.95); townCarSide(g, 0, 0, { kind: cv.getAttribute('data-cr'), col: townCarColour(), t: 0, spin: 0 });
  });
}

/* ---- the oven ---- */
function ovenLevel(){ return clamp(townData().n.oven | 0, 0, 3); }
function breadCap(){ return BREAD_CAP + 10 * ovenLevel(); }
function breadHeal(){ return BREAD_HEAL + 0.01 * ovenLevel(); }
const OVEN_PRICE = [12000, 30000, 70000];
(function(){
  const sb = townShowBakery;
  townShowBakery = function(){
    sb();
    const pnl = document.querySelector('.tp-bakery'); if (!pnl) return;
    const lv = ovenLevel(), foot = pnl.querySelector('.tp-foot'), gold = Save.data.gold | 0;
    const d = document.createElement('div'); d.className = 'ovenrow';
    d.innerHTML = lv >= 3 ? 'The oven is as big as it gets: <b>' + breadCap() + ' loaves, ' + Math.round(breadHeal() * 100) + '% each</b>.'
      : '<button class="chalk" data-a="town-oven"' + (gold >= OVEN_PRICE[lv] ? '' : ' disabled') + '>Bigger oven<small>' + fmt(OVEN_PRICE[lv]) + ' gold: holds ' + (breadCap() + 10) + ', heals ' + Math.round((breadHeal() + 0.01) * 100) + '%</small></button>' +
        '<div class="stock">Oven level ' + lv + ' of 3: holds ' + breadCap() + ', heals ' + Math.round(breadHeal() * 100) + '%</div>';
    pnl.insertBefore(d, foot);
  };
})();

/* ---- her home: eight slots to furnish ---- */
const HOME_SLOTS = {
  rug: { x: 640, label: 'the rug', opts: [['Bare boards', 0], ['Round rug', 3000], ['Striped runner', 5000], ['Savanna hide', 9000]] },
  sofa: { x: 330, label: 'the seat', opts: [['Nothing', 0], ['Red sofa', 5000], ['Armchair', 3500], ['Hammock', 7000]] },
  art: { x: 560, label: 'the wall art', opts: [['A bare wall', 0], ['A landscape', 2500], ['The starfield', 4000], ['The herd', 8000]] },
  lamp: { x: 920, label: 'the lamp', opts: [['No lamp', 0], ['Floor lamp', 2000], ['Lantern', 3000], ['Neon sign', 6000]] },
  plant: { x: 1100, label: 'the plant', opts: [['No plant', 0], ['A fern', 1500], ['A cactus', 1500], ['A bonsai', 5000]] },
  shelf: { x: 760, label: 'the shelf', opts: [['No shelf', 0], ['Bookshelf', 4000], ['Trophy shelf', 8000], ['Toy shelf', 3000]] },
  window: { x: 220, label: 'the window', opts: [['Plain glass', 0], ['Curtains', 3000], ['Stained glass', 7000], ['Flower box', 2500]] },
  pet: { x: 470, label: 'the pet', opts: [['No pet', 0], ['A cat', 6000], ['A parrot', 6000], ['A goldfish bowl', 4000]] }
};
const HOME_ORDER = ['rug', 'sofa', 'art', 'lamp', 'plant', 'shelf', 'window', 'pet'];
function homeData(){
  const t = townData();
  if (!t.home || typeof t.home !== 'object' || Array.isArray(t.home)) t.home = {};
  if (!t.home.own || typeof t.home.own !== 'object') t.home.own = {};
  if (!t.home.set || typeof t.home.set !== 'object') t.home.set = {};
  return t.home;
}
function homeSet(slot){ const i = homeData().set[slot] | 0; return HOME_SLOTS[slot] && i >= 0 && i < HOME_SLOTS[slot].opts.length ? i : 0; }
function homeBuy(slot, i){
  const S = HOME_SLOTS[slot], h = homeData(); if (!S || !S.opts[i]) return false;
  const key = slot + ':' + i;
  if (i > 0 && !h.own[key]){
    const p = S.opts[i][1]; if ((Save.data.gold | 0) < p){ SFX.deny(); return false; }
    Save.data.gold -= p; h.own[key] = 1; SFX.buy();
  } else SFX.pick();
  h.set[slot] = i; Save.write(); return true;
}
function townShowDecor(slot){
  const S = HOME_SLOTS[slot], h = homeData(), gold = Save.data.gold | 0, cur = homeSet(slot);
  let rows = '';
  S.opts.forEach(function(o, i){
    const own = i === 0 || !!h.own[slot + ':' + i], on = cur === i;
    rows += '<div class="drow' + (on ? ' on' : '') + '"><b>' + o[0] + '</b><span>' + (i === 0 ? 'free' : own ? 'owned' : fmt(o[1]) + ' gold') + '</span>' +
      (on ? '<em>in place</em>' : '<button class="chalk" data-a="town-dset-' + slot + '-' + i + '"' + (own || gold >= o[1] ? '' : ' disabled') + '>' + (own ? 'Use' : 'Buy') + '</button>') + '</div>';
  });
  townPanelT('bakery', '<div class="tp-title">DECORATE: ' + S.label.toUpperCase() + '</div><div class="drows">' + rows + '</div><div class="stock">' + fmt(gold) + ' gold</div>', { w: 520 });
}
const _homeFx = {
  rug: [null, function(c, x){ tEll(c, '#B5547A', x, TG + 30, 130, 22); tEll(c, '#E8B7C9', x, TG + 30, 100, 15); tEll(c, '#B5547A', x, TG + 30, 52, 8); },
    function(c, x){ for (let i = 0; i < 6; i++) tRect(c, i % 2 ? '#E8D8B0' : '#3E7A5A', x - 150 + i * 50, TG + 14, 50, 32); },
    function(c, x){ tEll(c, '#B8864E', x, TG + 30, 150, 24); tEll(c, '#8A5A24', x - 40, TG + 28, 20, 8); tEll(c, '#8A5A24', x + 30, TG + 34, 26, 9); tEll(c, '#8A5A24', x + 80, TG + 26, 16, 6); }],
  sofa: [null, function(c, x){ tRound(c, '#8A3A4A', x - 90, TG - 70, 180, 70, 12); tRound(c, '#A64A5A', x - 76, TG - 48, 152, 38, 8); tRound(c, '#7A2A3A', x - 98, TG - 62, 22, 62, 8); tRound(c, '#7A2A3A', x + 76, TG - 62, 22, 62, 8); },
    function(c, x){ tRound(c, '#4A6A8A', x - 44, TG - 84, 88, 84, 14); tRound(c, '#6A8AAA', x - 34, TG - 50, 68, 42, 8); tRect(c, '#3A2A1E', x - 40, TG - 6, 8, 6); tRect(c, '#3A2A1E', x + 32, TG - 6, 8, 6); },
    function(c, x){ c.strokeStyle = '#8A6642'; c.lineWidth = 3; c.beginPath(); c.moveTo(x - 90, TG - 120); c.quadraticCurveTo(x, TG - 30, x + 90, TG - 120); c.stroke(); c.fillStyle = '#E8D8B0'; c.beginPath(); c.moveTo(x - 80, TG - 112); c.quadraticCurveTo(x, TG - 50, x + 80, TG - 112); c.lineTo(x + 80, TG - 104); c.quadraticCurveTo(x, TG - 40, x - 80, TG - 104); c.fill(); }],
  art: [null, function(c, x){ tRect(c, '#5A3B22', x - 60, 150, 120, 84); tRect(c, '#9FD8F2', x - 54, 156, 108, 72); tPoly(c, '#6BBB45', [x - 54, 228, x - 20, 188, x + 10, 214, x + 30, 196, x + 54, 228]); tCircle(c, '#FFE24D', x + 30, 176, 10); },
    function(c, x){ tRect(c, '#2A2A34', x - 60, 150, 120, 84); tRect(c, '#10183A', x - 54, 156, 108, 72); c.fillStyle = '#FFF'; for (let i = 0; i < 14; i++) c.fillRect(x - 50 + (i * 37) % 100, 160 + (i * 23) % 62, 2, 2); tCircle(c, '#EEF2FF', x + 30, 178, 9); },
    function(c, x){ tRect(c, '#8A6A2A', x - 66, 146, 132, 90); tRect(c, '#F4E3C0', x - 58, 154, 116, 74); for (let i = 0; i < 4; i++){ tRect(c, '#E9B648', x - 40 + i * 24, 196, 8, 24); tCircle(c, '#E9B648', x - 36 + i * 24, 190, 6); tRect(c, '#E9B648', x - 38 + i * 24, 176, 4, 18); } }],
  lamp: [null, function(c, x){ tRect(c, '#3A3A46', x - 3, TG - 150, 6, 150); tPoly(c, '#F2D79A', [x - 22, TG - 140, x + 22, TG - 140, x + 14, TG - 170, x - 14, TG - 170]); tRect(c, '#2A2A34', x - 14, TG - 6, 28, 6); },
    function(c, x){ tRect(c, '#5A3B22', x - 2, 40, 4, 40); tRound(c, '#C9962F', x - 12, 76, 24, 38, 6); tRound(c, '#FFE9A8', x - 8, 82, 16, 26, 4); },
    function(c, x){ tRound(c, '#16102A', x - 54, 100, 108, 40, 8); c.fillStyle = '#FF4D8D'; c.font = 'bold 22px system-ui'; c.textAlign = 'center'; c.fillText('HOME', x, 128); c.strokeStyle = '#4DD8FF'; c.lineWidth = 2; c.strokeRect(x - 52, 102, 104, 36); }],
  plant: [null, function(c, x){ tRound(c, '#8A5A32', x - 16, TG - 30, 32, 30, 5); for (let i = 0; i < 6; i++){ c.strokeStyle = '#3E8A3A'; c.lineWidth = 5; c.lineCap = 'round'; c.beginPath(); c.moveTo(x, TG - 30); c.quadraticCurveTo(x + (i - 2.5) * 18, TG - 76, x + (i - 2.5) * 26, TG - 90 + Math.abs(i - 2.5) * 8); c.stroke(); } },
    function(c, x){ tRound(c, '#C9628C', x - 14, TG - 24, 28, 24, 5); tRound(c, '#4E8A4A', x - 12, TG - 80, 24, 60, 10); tRound(c, '#4E8A4A', x + 8, TG - 64, 16, 10, 5); tRound(c, '#4E8A4A', x - 24, TG - 52, 14, 10, 5); tCircle(c, '#F29AC0', x, TG - 84, 5); },
    function(c, x){ tRound(c, '#2A2A34', x - 22, TG - 20, 44, 20, 5); tRect(c, '#5A3B22', x - 3, TG - 70, 6, 52); c.fillStyle = '#4E8A4A'; [[-16, -78], [8, -86], [0, -62], [-8, -92]].forEach(function(o){ c.beginPath(); c.arc(x + o[0], TG + o[1] + 20, 14, 0, TAU); c.fill(); }); }],
  shelf: [null, function(c, x){ tRect(c, '#5A3B22', x - 60, TG - 200, 120, 190); for (let r = 0; r < 4; r++){ tRect(c, '#3E2A18', x - 60, TG - 200 + r * 48, 120, 4); for (let b = 0; b < 8; b++) tRect(c, ['#6A3A2A', '#2A4A6A', '#5A6A2A', '#7A5A2A'][(b + r) % 4], x - 54 + b * 14, TG - 196 + r * 48 + (b % 3) * 3, 10, 40 - (b % 3) * 3); } },
    function(c, x){ tRect(c, '#4A3A28', x - 56, TG - 130, 112, 120); for (let r = 0; r < 2; r++){ tRect(c, '#C9A24A', x - 56, TG - 130 + r * 56, 112, 4); for (let k = 0; k < 3; k++){ tCircle(c, '#FFD84D', x - 32 + k * 32, TG - 112 + r * 56, 10); tRect(c, '#FFD84D', x - 36 + k * 32, TG - 102 + r * 56, 8, 10); } } },
    function(c, x){ tRect(c, '#6A8AC0', x - 56, TG - 110, 112, 100); tRect(c, '#4A6A9A', x - 56, TG - 110, 112, 4); tRect(c, '#4A6A9A', x - 56, TG - 58, 112, 4); tCircle(c, '#D5352B', x - 30, TG - 74, 10); tRect(c, '#F2C230', x - 6, TG - 92, 20, 18); tCircle(c, '#6BBB45', x + 34, TG - 74, 9); tEll(c, '#F4F1E8', x - 20, TG - 28, 14, 10); tCircle(c, '#E9B648', x + 20, TG - 28, 11); }],
  window: [null, function(c, x){ tRect(c, '#D5352B', x - 14, 90, 22, 130); tRect(c, '#D5352B', x + 52, 90, 22, 130); tRect(c, '#8A6A44', x - 20, 84, 100, 6); },
    function(c, x){ [['#D5352B', 0, 0], ['#F2C230', 26, 0], ['#4DA0D8', 52, 0], ['#6BBB45', 0, 38], ['#E85D9F', 26, 38], ['#9A6AE8', 52, 38]].forEach(function(g){ c.fillStyle = g[0]; c.globalAlpha = 0.75; c.fillRect(x - 3 + g[1], 92 + g[2], 26, 36); }); c.globalAlpha = 1; },
    function(c, x){ tRect(c, '#8A5A32', x - 8, 218, 88, 14); for (let i = 0; i < 5; i++){ c.strokeStyle = '#3E8A3A'; c.lineWidth = 3; c.beginPath(); c.moveTo(x + 4 + i * 16, 218); c.lineTo(x + 4 + i * 16, 202); c.stroke(); tCircle(c, ['#F29AC0', '#FFD84D', '#FFFFFF', '#FF8A5A', '#B58CFF'][i], x + 4 + i * 16, 198, 6); } }],
  pet: [null, function(c, x){ tEll(c, '#E8A838', x, TG - 14, 20, 12); tCircle(c, '#E8A838', x + 14, TG - 24, 10); tPoly(c, '#E8A838', [x + 8, TG - 32, x + 11, TG - 42, x + 15, TG - 32]); tPoly(c, '#E8A838', [x + 16, TG - 32, x + 20, TG - 42, x + 22, TG - 32]); c.strokeStyle = '#E8A838'; c.lineWidth = 4; c.beginPath(); c.moveTo(x - 18, TG - 12); c.quadraticCurveTo(x - 34, TG - 28, x - 26, TG - 38); c.stroke(); },
    function(c, x){ tRect(c, '#5A3B22', x - 2, TG - 100, 4, 100); tRect(c, '#5A3B22', x - 20, TG - 100, 40, 4); tEll(c, '#D5352B', x, TG - 120, 10, 16); tCircle(c, '#6BBB45', x + 4, TG - 138, 8); tPoly(c, '#F2C230', [x + 10, TG - 138, x + 18, TG - 134, x + 10, TG - 130]); },
    function(c, x){ tRound(c, 'rgba(160,220,255,.55)', x - 24, TG - 62, 48, 50, 18); tRect(c, '#8A6A44', x - 28, TG - 14, 56, 6); tEll(c, '#FF8A2A', x - 4, TG - 38, 9, 5); tPoly(c, '#FF8A2A', [x + 4, TG - 38, x + 14, TG - 46, x + 14, TG - 30]); }]
};
function homeSig(){ const h = homeData(); return HOME_ORDER.map(function(s){ return homeSet(s); }).join(''); }
(function(){
  townRoomDef('in_myhome', 'Her Home', 'home', 1300, 190, {
    b: [{ id: 'door', kind: 'door', x: 110, w: 100, h: 130, label: 'Out', act: 'out' }].concat(HOME_ORDER.map(function(s){ return { id: 'ds_' + s, kind: 'decorslot', x: HOME_SLOTS[s].x, w: 120, h: 0, label: HOME_SLOTS[s].label, act: 'decor', slot: s }; })),
    p: [], L: [{ x: 300, y: 80, r: 170 }, { x: 640, y: 80, r: 190 }, { x: 980, y: 80, r: 170 }], npcs: [], sig: homeSig });
  TOWN_IN_IDS.push('in_myhome'); TOWN_ROOM_PARENT.in_myhome = 'park';
  TOWN_ROOM.home = { wall: '#EAD9B8', wains: '#7A5A3C', stripe: 'rgba(120,90,60,.12)', floor: '#8A6A44', beam: '#4A3624' };
  const P = TOWN_DIST.park;
  P.w = 3700;
  P.b.push({ id: 'myhome', kind: 'house', x: 3400, w: 260, h: 215, label: 'Her Home', act: 'house', to: 'in_myhome', tint: '#D8B070' });
  P.p.push({ k: 'flowers', x: 3250 }, { k: 'bush', x: 3560 }, { k: 'lamp', x: 3290 }, { k: 'bench', x: 3180 });
  P.L.push({ x: 3290, y: 360, r: 110 }, { x: 3400, y: 400, r: 130 });
  /* the room's own props: the walls are plain until she furnishes it */
  const rp = townRoomProps;
  townRoomProps = function(c, D, K, r){
    rp(c, D, K, r);
    if (D.room === 'home'){
      HOME_ORDER.forEach(function(s){ const i = homeSet(s), f = _homeFx[s][i]; if (f) f(c, HOME_SLOTS[s].x); });
    }
  };
  /* the gallery: six frames on the wall of Herd Hall */
  const H = TOWN_DIST.in_hall, xs = [250, 440, 620, 800, 980, 1170];
  xs.forEach(function(x, i){ H.b.push({ id: 'frame' + i, kind: 'frame', x: x, w: 140, h: 0, label: 'Frame ' + (i + 1), act: 'frame', idx: i }); });
  H.sig = function(){ return galData().join('|').length + ':' + galData().map(function(c){ return c ? c.length : 0; }).join(','); };
  /* thinner banners, so the pictures fit under them */
})();
function galData(){
  const t = townData();
  if (!Array.isArray(t.gal)) t.gal = [];
  while (t.gal.length < 6) t.gal.push('');
  t.gal.length = 6;
  for (let i = 0; i < 6; i++) if (typeof t.gal[i] !== 'string') t.gal[i] = '';
  return t.gal;
}
function townPhotoThumb(code){
  let th = PHOTO_THUMBS[code];
  if (th) return th;
  const r = photoFromCode(code); if (!r.ok) return null;
  const big = document.createElement('canvas'); big.width = 960; big.height = 540;
  try { photoRenderState(r.state, big); } catch (e) { return null; }
  th = document.createElement('canvas'); th.width = 160; th.height = 90; th.getContext('2d').drawImage(big, 0, 0, 160, 90);
  PHOTO_THUMBS[code] = th; return th;
}
(function(){
  const bx = townBuildingX;
  townBuildingX = function(c, D, b, P, r){
    if (b.kind === 'decorslot') return true;
    if (b.kind === 'frame'){
      const x = b.x, code = galData()[b.idx];
      tRect(c, '#C9A24A', x - 74, 148, 148, 92); tRect(c, '#5A3B22', x - 70, 152, 140, 84);
      const th = code ? townPhotoThumb(code) : null;
      if (th) c.drawImage(th, x - 66, 156, 132, 76);
      else { tRect(c, 'rgba(255,255,255,.08)', x - 66, 156, 132, 76); c.fillStyle = 'rgba(255,255,255,.4)'; c.font = '600 13px system-ui'; c.textAlign = 'center'; c.fillText('empty frame', x, 198); }
      return true;
    }
    return bx(c, D, b, P, r);
  };
  const tu = townUse, nr = townNearest;
  townUse = function(o){
    if (o.k === 'b'){
      const b = o.b;
      if (b.act === 'decor'){ townShowDecor(b.slot); return; }
      if (b.act === 'frame'){ townShowFrame(b.idx); return; }
    }
    tu(o);
  };
  townNearest = function(D, inp){
    const o = nr(D, inp);
    if (o && o.k === 'b'){ if (o.b.act === 'decor') o.label = 'Change ' + o.b.label; else if (o.b.act === 'frame') o.label = 'Change the picture'; }
    return o;
  };
})();
function townShowFrame(idx){
  const a = photoAlbum(), g = galData();
  let h = '<p class="sub" style="margin:0 0 8px">Frame ' + (idx + 1) + ': pick a photo from the album.</p><div class="frgrid">';
  a.forEach(function(e, i){ h += '<button class="frcell' + (g[idx] === e.c ? ' on' : '') + '" data-a="town-fset-' + idx + '-' + i + '"><canvas width="160" height="90" data-gal="' + i + '"></canvas></button>'; });
  if (!a.length) h += '<p class="sub">The album is empty. Take a picture at the photo booth first.</p>';
  h += '</div>' + (g[idx] ? '<button class="tbtn" data-a="town-fclear-' + idx + '">Take it down</button>' : '');
  townPanelT('hall', '<div class="tp-title">THE GALLERY</div>' + h, { w: 640 });
  document.querySelectorAll('canvas[data-gal]').forEach(function(cv){ const e = a[+cv.getAttribute('data-gal')], th = e && townPhotoThumb(e.c); if (th) cv.getContext('2d').drawImage(th, 0, 0); });
}
(function(){
  const h = handleTownAction;
  handleTownAction = function(a){
    let m = /^town-buyplane-(\w+)$/.exec(a);
    if (m){ if (planeBuy(m[1])) townToast('A new plane: ' + PLANE_BY_ID[m[1]].name + '.', '#BFFF9A'); townShowHangar(); return true; }
    m = /^town-selplane-(\w+)$/.exec(a); if (m){ const p = planeFleet(); if (p.owned[m[1]]){ p.sel = m[1]; Save.write(); SFX.pick(); } townShowHangar(); return true; }
    m = /^town-buycar-(\w+)$/.exec(a);
    if (m){ if (townCarBuy(m[1])) townToast('A new car: ' + CAR_BY_ID[m[1]].name + '.', '#BFFF9A'); townShowGarage(); return true; }
    m = /^town-selcar-(\w+)$/.exec(a); if (m){ const c = carFleet(); if (c.owned[m[1]]){ c.sel = m[1]; Save.write(); SFX.pick(); } townShowGarage(); return true; }
    if (a === 'town-buycar'){ if (townCarBuy('runabout')) townToast('She owns a car. Press C in town to get in.', '#BFFF9A'); townShowGarage(); return true; }
    if (a === 'town-oven'){ const lv = ovenLevel(), t = townData(); if (lv < 3 && (Save.data.gold | 0) >= OVEN_PRICE[lv]){ Save.data.gold -= OVEN_PRICE[lv]; t.n.oven = lv + 1; Save.write(); SFX.buy(); } else SFX.deny(); townShowBakery(); return true; }
    m = /^town-dset-(\w+)-(\d+)$/.exec(a);
    if (m){ homeBuy(m[1], +m[2]); townShowDecor(m[1]); TOWN_DIST.in_myhome.sig && (Town.layerKey = ''); return true; }
    m = /^town-fset-(\d)-(\d+)$/.exec(a);
    if (m){ const al = photoAlbum()[+m[2]]; if (al){ galData()[+m[1]] = al.c; Save.write(); SFX.pick(); Town.layerKey = ''; } townShowFrame(+m[1]); return true; }
    m = /^town-fclear-(\d)$/.exec(a);
    if (m){ galData()[+m[1]] = ''; Save.write(); SFX.click(); Town.layerKey = ''; townShowFrame(+m[1]); return true; }
    return h(a);
  };
})();
