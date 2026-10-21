'use strict';
/* Fishing, grown: 35 kinds, sizes, a fish book, tackle, and casting from a boat. */
/* ========================= 44zzv. FISHING ========================= */
/* The pier game of js/44zg-town-activities.js (cast, wait, reel when the marker is in the green) is rebuilt here and used in two places: the end of the pier,
   and from a boat at sea (press F, or the Cast button, when the boat is nearly still).
   35 KINDS in five groups of the FISH BOOK: the pier (the first 13), the shallows, the reef, the deep, and three that only come in a certain weather
   (storm, fog, rain). At sea what bites depends on the water under the boat (shallows, reef, open water or deep), the time of day and the weather; a few
   come only at night or in one kind of weather. Every catch has a size in centimetres (the biggest of each kind is kept), and pays gold by kind and size.
   RARITY follows the odds weight: common, uncommon, rare, legendary.
   TACKLE is free: it is unlocked by completing a group of the book, and the best she has unlocked is used (and can be changed in the fishing panel).
     rods   Cane rod (the pier page)  wider green zone;     Golden rod (the whole book)  widest zone
     lines  Braided line (the shallows page)  a longer bite;  Deep reel (the deep page)  longest bite and a slower marker
     baits  Shrimp (the reef page)  more uncommon and rarer fish;  Glow lure (the three weather fish)  many more rare and legendary ones
   BRINE'S ORDER: each week one named fish is asked for; catching it pays gems.
   Save: Save.data.town.fish { id: count } (as before), .fishBook { id: biggest cm }, .tackle { rod, line, bait }, .fishOrder { w, id, done }.
   While the sea panel is open G.state is 'fishing' and the boat does not move. */
(function(){
  /* what the first 13 are like, and the 22 new kinds. h: where, c: colour, k: shape, len: [smallest, biggest] cm; r: how often; v: what it is worth */
  const OLD = {
    sardine: { h: 'pier', c: '#A9C6D8', k: 'slim', len: [12, 20] }, mackerel: { h: 'pier', c: '#4F8FA8', k: 'slim', s: '#1F3C4C', len: [25, 40] }, herring: { h: 'pier', c: '#B8C8D4', k: 'slim', len: [18, 30] },
    trout: { h: 'pier', c: '#9BBF7A', k: 'fish', s: '#C9604A', len: [30, 55] }, pike: { h: 'pier', c: '#6F8F4E', k: 'slim', s: '#3E5A2A', len: [50, 100] }, eel: { h: 'pier', c: '#5B6B4A', k: 'long', len: [60, 110] },
    boot: { h: 'pier', c: '#7A5A3A', k: 'boot', len: [20, 35] }, seahorse: { h: 'pier', c: '#E8A838', k: 'horse', len: [8, 15] }, puffer: { h: 'pier', c: '#D8C080', k: 'round', s: '#8A6A2A', len: [20, 35] },
    squid: { h: 'pier', c: '#D88A9A', k: 'squid', len: [25, 50] }, sword: { h: 'pier', c: '#4A6A9A', k: 'slim', s: '#C0C8D8', len: [150, 300] }, carp: { h: 'pier', c: '#F0B820', k: 'fish', s: '#FFE080', len: [40, 80] },
    jelly: { h: 'pier', c: '#BFA8F0', k: 'jelly', len: [15, 30] }
  };
  const NEW = [
    { id: 'minnow', name: 'Silver Minnow', v: 1, r: 22, h: 'shallows', c: '#CFD8E0', k: 'slim', len: [5, 9] }, { id: 'goby', name: 'Sand Goby', v: 1.2, r: 20, h: 'shallows', c: '#C8B080', k: 'fish', s: '#8A7040', len: [8, 14] },
    { id: 'flounder', name: 'Flounder', v: 2.5, r: 12, h: 'shallows', c: '#A88A60', k: 'flat', s: '#6A5436', len: [25, 45] }, { id: 'bass', name: 'Sea Bass', v: 3, r: 10, h: 'shallows', c: '#8AA0A8', k: 'fish', s: '#5A7078', len: [35, 60] },
    { id: 'hermit', name: 'Hermit Crab', v: 3, r: 8, h: 'shallows', c: '#E07A4A', k: 'crab', len: [6, 12] }, { id: 'ray', name: 'Little Ray', v: 4, r: 6, h: 'shallows', c: '#7A9AB8', k: 'flat', s: '#DDE8F0', len: [40, 70] },
    { id: 'clown', name: 'Clownfish', v: 4, r: 10, h: 'reef', c: '#F08A2A', k: 'fish', s: '#FFFFFF', len: [7, 11] }, { id: 'butterfly', name: 'Butterflyfish', v: 4.5, r: 8, h: 'reef', c: '#F4E070', k: 'round', s: '#2A2A30', len: [12, 20] },
    { id: 'angel', name: 'Angelfish', v: 4, r: 9, h: 'reef', c: '#4A8AD8', k: 'round', s: '#F2D04A', len: [15, 28] }, { id: 'parrot', name: 'Parrotfish', v: 5, r: 8, h: 'reef', c: '#3AB89A', k: 'fish', s: '#F26AA0', len: [30, 60] },
    { id: 'lion', name: 'Lionfish', v: 7, r: 4, h: 'reef', c: '#B8503A', k: 'fish', s: '#F2E0C8', len: [20, 38] }, { id: 'moray', name: 'Moray Eel', v: 8, r: 3, h: 'reef', c: '#7A8A3A', k: 'long', s: '#D8C84A', len: [80, 180] },
    { id: 'tuna', name: 'Bluefin Tuna', v: 9, r: 8, h: 'deep', c: '#2A4A8A', k: 'slim', s: '#C0C8D0', len: [120, 220] }, { id: 'sunfish', name: 'Ocean Sunfish', v: 10, r: 3, h: 'deep', c: '#9AA8B0', k: 'round', len: [150, 250] },
    { id: 'angler', name: 'Anglerfish', v: 12, r: 4, h: 'deep', c: '#4A3A52', k: 'round', s: '#FFE9A0', night: true, len: [30, 60] }, { id: 'marlin', name: 'Blue Marlin', v: 14, r: 3, h: 'deep', c: '#2A6AC8', k: 'slim', s: '#C8D8F0', len: [200, 350] },
    { id: 'hammer', name: 'Hammerhead', v: 16, r: 2.5, h: 'deep', c: '#7A8896', k: 'shark', len: [250, 400] }, { id: 'oarfish', name: 'Oarfish', v: 18, r: 1.5, h: 'deep', c: '#D0D8E0', k: 'long', s: '#E04A4A', len: [300, 500] },
    { id: 'coelacanth', name: 'Coelacanth', v: 30, r: 0.6, h: 'deep', c: '#3A5A8A', k: 'fish', s: '#C8D8F0', len: [120, 180] },
    { id: 'rainwrasse', name: 'Rainbow Wrasse', v: 12, r: 9, h: 'special', c: '#F26AA0', k: 'fish', s: '#6AE0F2', wx: 'rain', len: [20, 35] }, { id: 'ghostkoi', name: 'Ghost Koi', v: 22, r: 6, h: 'special', c: '#E8F0F8', k: 'fish', s: '#9AB8D8', wx: 'fog', len: [50, 90] },
    { id: 'stormray', name: 'Storm Ray', v: 25, r: 5, h: 'special', c: '#3A4A6A', k: 'flat', s: '#F2E04A', wx: 'storm', len: [150, 250] }
  ];
  FISH.forEach(function(f){ const o = OLD[f.id]; if (o) Object.keys(o).forEach(function(k){ f[k] = o[k]; }); });
  NEW.forEach(function(f){ FISH.push(f); });
})();
const FISH_GROUPS = [['pier', 'The pier'], ['shallows', 'The shallows'], ['reef', 'The reef'], ['deep', 'The deep'], ['special', 'Weather fish']];
const FISH_RARITY = ['common', 'uncommon', 'rare', 'legendary'], FISH_RCOL = ['#BFD8E0', '#8FE0A0', '#8FB4F2', '#F2B33D'];
function fishRarity(f){ return f.r >= 15 ? 0 : f.r >= 8 ? 1 : f.r >= 3 ? 2 : 3; }
const FISH_RODS = [{ n: 'Plain rod', z: 1 }, { n: 'Cane rod', z: 1.15, need: 'pier' }, { n: 'Golden rod', z: 1.4, need: 'all' }];
const FISH_LINES = [{ n: 'Thin line', win: 5.5, sp: 1 }, { n: 'Braided line', win: 7.5, sp: 1, need: 'shallows' }, { n: 'Deep reel', win: 10, sp: 0.85, need: 'deep' }];
const FISH_BAITS = [{ n: 'No bait', m: [1, 1, 1, 1] }, { n: 'Shrimp', m: [1, 1.6, 1.6, 1.6], need: 'reef' }, { n: 'Glow lure', m: [1, 1.2, 2.2, 2.2], need: 'special' }];

/* ---- what she has caught ---- */
function fishBook(){ const t = townData(); if (!t.fishBook || typeof t.fishBook !== 'object' || Array.isArray(t.fishBook)) t.fishBook = {}; return t.fishBook; }
function fishGroupDone(g){ const log = fishLog(); return FISH.every(function(f){ return (g === 'all' || f.h === g) ? log[f.id] > 0 : true; }); }
function fishGroupCount(g){ const log = fishLog(); let n = 0, all = 0; FISH.forEach(function(f){ if (f.h === g){ all++; if (log[f.id] > 0) n++; } }); return [n, all]; }
function fishKinds(){ const log = fishLog(); return FISH.filter(function(f){ return log[f.id] > 0; }).length; }
function fishUnlocked(list, i){ return !list[i].need || fishGroupDone(list[i].need); }
function fishTackle(){
  const t = townData(); if (!t.tackle || typeof t.tackle !== 'object' || Array.isArray(t.tackle)) t.tackle = {};
  const k = t.tackle;
  [['rod', FISH_RODS], ['line', FISH_LINES], ['bait', FISH_BAITS]].forEach(function(p){
    let i = k[p[0]] | 0; if (i < 0 || i >= p[1].length || !fishUnlocked(p[1], i)) i = 0; k[p[0]] = i;
  });
  return { rod: FISH_RODS[k.rod], line: FISH_LINES[k.line], bait: FISH_BAITS[k.bait], k: k };
}

/* ---- what bites ---- */
/* where: 'pier', or 'shallows' | 'reef' | 'water' | 'deep' at sea */
const FISH_MIX = { shallows: { shallows: 1, special: 0.4 }, reef: { reef: 1, shallows: 0.15, special: 0.4 }, water: { shallows: 0.6, reef: 0.15, deep: 0.25, special: 0.4 }, deep: { deep: 1, special: 0.4 } };
function fishPool(where, bait){
  const night = typeof townIsNight === 'function' && townIsNight(), wx = typeof townWeatherType === 'function' ? townWeatherType() : 'clear', rain = typeof Town !== 'undefined' && Town.rainK > 0.4;
  const mix = where === 'pier' ? null : (FISH_MIX[where] || FISH_MIX.water), bm = (bait || FISH_BAITS[0]).m, out = [];
  FISH.forEach(function(f){
    if (f.night && !night) return;
    if (f.wx && f.wx !== wx) return;
    let w = f.wx ? 10 : f.r;
    if (where === 'pier'){ if (f.h !== 'pier') return; } else { w *= mix[f.h] || 0; }
    if (!(w > 0)) return;
    if (rain && f.v >= 3) w *= 1.5;
    w *= bm[fishRarity(f)];
    out.push({ f: f, w: w });
  });
  return out;
}
function fishPickAt(where, bait){
  const pool = fishPool(where, bait); let tot = 0; pool.forEach(function(p){ tot += p.w; });
  let x = Math.random() * tot;
  for (let i = 0; i < pool.length; i++){ x -= pool[i].w; if (x <= 0) return pool[i].f; }
  return pool[0].f;
}
fishPick = function(){ return fishPickAt('pier', fishTackle().bait); };      /* the old name still works */
function fishRollLen(f, rodZ){
  const lo = f.len[0], hi = f.len[1];
  return Math.round(lo + (hi - lo) * Math.min(1, Math.pow(Math.random(), 1.6) * (1 + (rodZ - 1) * 0.3)));
}

/* ---- Brine's order: one named fish a week ---- */
function fishOrder(){
  const t = townData(), w = Math.floor(Date.now() / (7 * 86400000));
  if (!t.fishOrder || typeof t.fishOrder !== 'object' || Array.isArray(t.fishOrder) || t.fishOrder.w !== w){
    const r = miniRng(townHash('fishorder' + w)), pool = FISH.filter(function(f){ const q = fishRarity(f); return q >= 1 && q <= 2 && f.h !== 'special' && !f.night; });
    t.fishOrder = { w: w, id: pool[Math.floor(r() * pool.length)].id, done: false };
  }
  return t.fishOrder;
}

/* ---- the game itself (the same on the pier and on a boat) ---- */
const Fg = { where: 'pier', phase: 'idle', iv: 0, sea: false, fish: null };
function fishHab(){
  if (!Fg.sea) return 'pier';
  const t = seaTypeAt(Sea.x, Sea.y);
  return t === SEA_SHALLOW ? 'shallows' : t === SEA_REEF ? 'reef' : t === SEA_DEEP ? 'deep' : 'water';
}
const FISH_HABNAME = { pier: 'THE END OF THE PIER', shallows: 'OUT AT SEA · the shallows', reef: 'OUT AT SEA · over the reef', water: 'OUT AT SEA · open water', deep: 'OUT AT SEA · the deep' };
function fishRows(){ const log = fishLog(); let rows = ''; FISH_GROUPS.forEach(function(g){ const c = fishGroupCount(g[0]); rows += '<span class="fsh' + (c[0] === c[1] ? ' on' : '') + '">' + g[1] + ' ' + c[0] + '/' + c[1] + '</span>'; }); return rows; }
function fishTackleHTML(){
  const k = fishTackle();
  function btn(kind, list, cur){
    let n = 0; for (let i = 0; i < list.length; i++) if (fishUnlocked(list, i)) n++;
    return '<button class="chalk" data-a="fish-tk-' + kind + '"' + (n < 2 ? ' disabled' : '') + '>' + list[cur].n + (n > 1 ? ' ▸' : '') + '</button>';
  }
  return '<div class="chalkrow fishtk">' + btn('rod', FISH_RODS, k.k.rod) + btn('line', FISH_LINES, k.k.line) + btn('bait', FISH_BAITS, k.k.bait) + '</div>';
}
function fishPanel(msg){
  if (Fg.iv){ clearInterval(Fg.iv); Fg.iv = 0; }
  Fg.phase = 'idle'; Fg.fish = null;
  const o = fishOrder(), of = FISH.filter(function(f){ return f.id === o.id; })[0];
  const html = '<div class="tp-title">' + FISH_HABNAME[fishHab()] + '</div><div class="fishmsg" id="fishMsg">' + (msg || 'Cast a line.') + '</div>' +
    '<div class="fishbar" id="fishBar" style="display:none"><div class="fzone" id="fishZone"></div><i id="fishMark"></i></div>' +
    '<div class="chalkrow"><button class="chalk" data-a="fish-cast" id="fishCast">Cast</button><button class="chalk" data-a="fish-reel" id="fishReel" style="display:none">Reel in!</button></div>' +
    fishTackleHTML() +
    '<div class="chalkrow"><button class="chalk" data-a="fish-book">Fish book · ' + fishKinds() + ' of ' + FISH.length + '</button></div>' +
    '<div class="fishlog">' + fishRows() + '</div>' +
    '<p class="tnote">Brine’s order this week: a <b>' + of.name + '</b>' + (o.done ? ' (done)' : ' · 8 gems') + (townIsNight() ? ' · the moon jelly is out' : '') + '</p>';
  if (Fg.sea){
    setOverlay('<div class="panel tp tp-fish" style="max-width:600px">' + html + '<div class="tp-foot"><button class="tbtn" data-a="fish-sea-close">Back to the boat</button></div></div>');
  } else townPanelT('fish', html, { w: 600 });
}
townShowFishing = function(msg){ Fg.sea = false; fishPanel(msg); };

function fishCast(){
  if (Fg.phase !== 'idle') return;
  const k = fishTackle(), fish = fishPickAt(fishHab(), k.bait);
  Fg.fish = fish; Fg.phase = 'wait'; Fg.t = 0; Fg.wait = 1 + Math.random() * 2.2; Fg.k = k;
  document.getElementById('fishMsg').textContent = 'The float drifts...'; document.getElementById('fishCast').style.display = 'none';
  SFX.click();
  if (Fg.sea){ const t = townData(); t.n.seaCasts = (t.n.seaCasts | 0) + 1; }
  Fg.iv = setInterval(function(){ if (!document.getElementById('fishMsg')){ clearInterval(Fg.iv); Fg.iv = 0; Fg.phase = 'idle'; return; } fishTick(0.03); }, 30);
}
/* one step of the wait, the bite and the marker (a test calls this by hand: there are no real timers there) */
function fishTick(dt){
  if (Fg.phase === 'idle') return;
  const mk = document.getElementById('fishMark'); if (!mk) return;
  Fg.t += dt;
  const f = Fg.fish, k = Fg.k;
  if (Fg.phase === 'wait' && Fg.t > Fg.wait){
    Fg.phase = 'bite'; Fg.t = 0; Fg.zone = 0.18 + Math.random() * 0.5;
    Fg.w = clamp((0.28 - Math.min(f.v, 22) * 0.012) * k.rod.z, 0.1, 0.5); Fg.speed = Math.min(4.2, 1.4 + f.v * 0.12) * k.line.sp;
    if (Fg.zone + Fg.w > 0.98) Fg.zone = 0.98 - Fg.w;
    document.getElementById('fishMsg').textContent = 'A bite! Reel when the marker is in the green.';
    document.getElementById('fishBar').style.display = 'block'; document.getElementById('fishReel').style.display = 'inline-block';
    const z = document.getElementById('fishZone'); z.style.left = (Fg.zone * 100) + '%'; z.style.width = (Fg.w * 100) + '%';
    try { SFX.tone('triangle', 660, 660, 0.12, 0.08, 0, 0); } catch (e) {}
  }
  if (Fg.phase === 'bite'){
    Fg.pos = 0.5 + 0.5 * Math.sin(Fg.t * Fg.speed * 2.2); mk.style.left = (Fg.pos * 100) + '%';
    if (Fg.t > k.line.win) fishResult(false);
  }
}
function fishReel(){ if (Fg.phase === 'bite'){ const ok = Fg.pos >= Fg.zone && Fg.pos <= Fg.zone + Fg.w; fishResult(ok); } }
function fishResult(win){
  if (Fg.phase === 'idle') return;
  clearInterval(Fg.iv); Fg.iv = 0; Fg.phase = 'idle';
  const f = Fg.fish, k = Fg.k; let msg;
  if (win){
    const log = fishLog(), book = fishBook(), first = !(log[f.id] > 0), had = FISH_RODS.map(function(r, i){ return fishUnlocked(FISH_RODS, i); }).concat(FISH_LINES.map(function(r, i){ return fishUnlocked(FISH_LINES, i); }), FISH_BAITS.map(function(r, i){ return fishUnlocked(FISH_BAITS, i); }));
    const len = fishRollLen(f, k.rod.z), rec = !(book[f.id] >= len); if (rec) book[f.id] = len;
    log[f.id] = (log[f.id] | 0) + 1;
    const frac = (len - f.len[0]) / Math.max(1, f.len[1] - f.len[0]), gold = Math.round(townCoin() * f.v * 0.6 * (0.7 + 0.6 * frac));
    const pay = { gold: gold }; if (first) pay.gems = 5;
    const o = fishOrder(); let ordered = false;
    if (o.id === f.id && !o.done){ o.done = true; ordered = true; pay.gems = (pay.gems | 0) + 8; const t = townData(); t.n.fishOrders = (t.n.fishOrders | 0) + 1; }
    townPay(pay);
    msg = 'You caught a ' + f.name + ', ' + len + ' cm! +' + fmt(gold) + ' gold' + (first ? ' and 5 gems for a new kind' : '') + (rec && !first ? ' · a new record' : '') + '.';
    if (ordered) msg += ' That was Brine’s order: +8 gems!';
    /* new tackle: unlocked by the page she has just completed, and put on */
    const now = [FISH_RODS, FISH_LINES, FISH_BAITS], names = [], kk = fishTackle().k; let at = 0;
    ['rod', 'line', 'bait'].forEach(function(key, ki){ const list = now[ki]; for (let i = 0; i < list.length; i++){ if (fishUnlocked(list, i) && !had[at + i]){ kk[key] = i; names.push(list[i].n); } } at += list.length; });
    if (names.length) msg += ' New tackle, and it is on: ' + names.join(', ') + '!';
    const t2 = townData();
    if (FISH.every(function(x){ return log[x.id] > 0; }) && !t2.n.fishAll){ t2.n.fishAll = 1; townPay({ gems: 100 }); msg += ' Every kind caught: +100 gems!'; SFX.transform(); } else SFX.level();
  } else { msg = 'It got away.'; SFX.deny(); }
  Save.write();
  fishPanel(msg);
}
townFishCast = fishCast; townFishResult = fishResult;

/* ---- the fish book ---- */
function fishPaint(cv, f, known){
  const c = cv.getContext('2d'), W = cv.width, H = cv.height; c.clearRect(0, 0, W, H);
  const col = known ? f.c : '#1E222C', st = known ? (f.s || f.c) : '#1E222C', dk = known ? f.c : '#1E222C';
  c.save(); c.translate(W / 2, H / 2); c.lineCap = 'round'; c.lineJoin = 'round';
  const body = function(rx, ry){ c.fillStyle = col; c.beginPath(); c.ellipse(0, 0, rx, ry, 0, 0, TAU); c.fill(); };
  const tail = function(x, h){ c.fillStyle = st === col ? col : st; c.beginPath(); c.moveTo(x, 0); c.lineTo(x - h * 0.8, -h); c.lineTo(x - h * 0.8, h); c.closePath(); c.fill(); };
  const eye = function(x, r){ if (!known) return; c.fillStyle = '#fff'; c.beginPath(); c.arc(x, -1, r, 0, TAU); c.fill(); c.fillStyle = '#111'; c.beginPath(); c.arc(x + r * 0.2, -1, r * 0.5, 0, TAU); c.fill(); };
  const bands = function(n, rx, ry){ if (!known || !f.s) return; c.fillStyle = f.s; for (let i = 0; i < n; i++){ const x = -rx * 0.4 + i * rx * 0.5; c.beginPath(); c.ellipse(x, 0, rx * 0.07, ry * 0.9, 0, 0, TAU); c.fill(); } };
  switch (f.k){
    case 'slim': tail(-24, 7); body(22, 6.5); if (known && f.s){ c.fillStyle = f.s; c.beginPath(); c.ellipse(0, 3, 20, 2.4, 0, 0, TAU); c.fill(); } if (f.id === 'sword' || f.id === 'marlin'){ c.strokeStyle = st; c.lineWidth = 2.2; c.beginPath(); c.moveTo(22, 0); c.lineTo(34, 0); c.stroke(); } eye(15, 2); break;
    case 'long': c.strokeStyle = col; c.lineWidth = 7; c.beginPath(); c.moveTo(-32, 6); c.bezierCurveTo(-18, -12, -4, 14, 10, -2); c.bezierCurveTo(18, -10, 26, -2, 32, 0); c.stroke(); if (known && f.s){ c.strokeStyle = f.s; c.lineWidth = 1.6; c.beginPath(); c.moveTo(-30, 6); c.bezierCurveTo(-18, -12, -4, 14, 10, -2); c.stroke(); } eye(30, 1.8); break;
    case 'flat': c.fillStyle = col; c.beginPath(); c.ellipse(0, 0, 22, 14, 0, 0, TAU); c.fill(); c.strokeStyle = col; c.lineWidth = 2.2; c.beginPath(); c.moveTo(-20, 0); c.lineTo(-34, 4); c.stroke(); if (known && f.s){ c.fillStyle = f.s; c.beginPath(); c.arc(-4, -3, 2.4, 0, TAU); c.arc(6, 4, 2, 0, TAU); c.arc(8, -5, 1.6, 0, TAU); c.fill(); } eye(12, 2); break;
    case 'round': body(15, 14); c.fillStyle = col; c.beginPath(); c.moveTo(-14, 0); c.lineTo(-26, -8); c.lineTo(-26, 8); c.closePath(); c.fill(); bands(3, 20, 14); if (f.id === 'puffer' && known){ c.strokeStyle = f.s; c.lineWidth = 1.4; for (let i = 0; i < 8; i++){ const a = i / 8 * TAU; c.beginPath(); c.moveTo(Math.cos(a) * 15, Math.sin(a) * 14); c.lineTo(Math.cos(a) * 20, Math.sin(a) * 19); c.stroke(); } } if (f.id === 'angler' && known){ c.strokeStyle = '#8A7AA0'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(6, -13); c.quadraticCurveTo(16, -26, 22, -16); c.stroke(); c.fillStyle = f.s; c.beginPath(); c.arc(22, -16, 3.4, 0, TAU); c.fill(); } eye(8, 2.4); break;
    case 'squid': c.fillStyle = col; c.beginPath(); c.ellipse(8, 0, 17, 9, 0, 0, TAU); c.fill(); c.strokeStyle = col; c.lineWidth = 2.2; for (let i = -2; i <= 2; i++){ c.beginPath(); c.moveTo(-6, i * 2.4); c.quadraticCurveTo(-18, i * 5, -30, i * 4 + 3); c.stroke(); } eye(14, 2); break;
    case 'jelly': c.fillStyle = col; c.globalAlpha = known ? 0.85 : 1; c.beginPath(); c.arc(0, -3, 17, Math.PI, 0); c.closePath(); c.fill(); c.globalAlpha = 1; c.strokeStyle = col; c.lineWidth = 1.8; for (let i = -3; i <= 3; i++){ c.beginPath(); c.moveTo(i * 4.6, -2); c.quadraticCurveTo(i * 4.6 + 3, 8, i * 4.6 - 1, 18); c.stroke(); } break;
    case 'horse': c.strokeStyle = col; c.lineWidth = 7; c.beginPath(); c.moveTo(2, -16); c.quadraticCurveTo(14, -8, 6, 4); c.quadraticCurveTo(-4, 14, 6, 20); c.stroke(); c.lineWidth = 4; c.beginPath(); c.moveTo(2, -17); c.lineTo(-10, -14); c.stroke(); eye(2, 1.6); break;
    case 'boot': c.fillStyle = col; c.beginPath(); c.moveTo(-10, -18); c.lineTo(4, -18); c.lineTo(4, 2); c.lineTo(22, 8); c.lineTo(22, 18); c.lineTo(-10, 18); c.closePath(); c.fill(); if (known){ c.fillStyle = '#4A3420'; c.fillRect(-10, 12, 32, 6); } break;
    case 'crab': c.fillStyle = col; c.beginPath(); c.ellipse(0, 4, 14, 9, 0, 0, TAU); c.fill(); c.strokeStyle = col; c.lineWidth = 3; for (let i = -1; i <= 1; i++){ c.beginPath(); c.moveTo(i * 8, 8); c.lineTo(i * 12, 18); c.stroke(); } c.beginPath(); c.moveTo(-12, 0); c.lineTo(-22, -10); c.moveTo(12, 0); c.lineTo(22, -10); c.stroke(); eye(-4, 1.8); eye(4, 1.8); break;
    case 'shark': tail(-26, 9); body(26, 7); c.fillStyle = col; c.beginPath(); c.moveTo(-2, -6); c.lineTo(6, -17); c.lineTo(10, -6); c.closePath(); c.fill(); c.fillRect(20, -11, 6, 22); eye(24, 1.6); break;
    default: tail(-20, 9); c.fillStyle = col; body(20, 10); c.fillStyle = st; if (f.s && known){ c.beginPath(); c.moveTo(-6, -9); c.quadraticCurveTo(2, -17, 10, -9); c.closePath(); c.fill(); } bands(f.id === 'clown' ? 2 : 0, 22, 10); eye(12, 2.4);
  }
  c.restore();
}
function fishCardHTML(f){
  const log = fishLog(), n = log[f.id] | 0, best = fishBook()[f.id] | 0, q = fishRarity(f);
  const hint = f.night ? 'Only at night' : f.wx ? 'Only in ' + f.wx : (f.h === 'pier' ? 'At the pier' : f.h === 'shallows' ? 'In the shallows, from a boat' : f.h === 'reef' ? 'Over reefs, from a boat' : f.h === 'deep' ? 'In deep water, from a boat' : 'From a boat, in the right weather');
  return '<div class="fcard' + (n ? ' got' : '') + '"><canvas data-fb="' + f.id + '" width="84" height="48"></canvas><b>' + (n ? f.name : '?????') + '</b>' +
    '<span style="color:' + FISH_RCOL[q] + '">' + FISH_RARITY[q] + '</span><small>' + (n ? 'Biggest ' + best + ' cm · caught ' + n : hint) + '</small></div>';
}
function showFishBook(){
  const tk = fishTackle();
  let body = '';
  FISH_GROUPS.forEach(function(g){
    const c = fishGroupCount(g[0]), gift = g[0] === 'pier' ? 'Cane rod' : g[0] === 'shallows' ? 'Braided line' : g[0] === 'reef' ? 'Shrimp bait' : g[0] === 'deep' ? 'Deep reel' : 'Glow lure';
    body += '<h3 class="thead">' + g[1] + ' <small>' + c[0] + ' of ' + c[1] + ' · complete it for: ' + gift + (c[0] === c[1] ? ' ✓' : '') + '</small></h3><div class="fgrid">' +
      FISH.filter(function(f){ return f.h === g[0]; }).map(fishCardHTML).join('') + '</div>';
  });
  const html = '<div class="panel slab fishbook"><h2 class="head">Fish book</h2><p class="sub">' + fishKinds() + ' of ' + FISH.length + ' kinds caught · tackle in use: ' + tk.rod.n + ', ' + tk.line.n + ', ' + tk.bait.n +
    (fishGroupDone('all') ? ' · the whole book is done (the Golden rod is yours)' : ' · finish the whole book for the Golden rod') + '</p><div class="tscroll">' + body + '</div>' +
    '<div class="menucol" style="margin-top:10px;width:100%"><button class="btn ghost" data-a="fish-book-back">Back</button></div></div>';
  setOverlay(html);
  FISH.forEach(function(f){ const cv = OV.querySelector('canvas[data-fb="' + f.id + '"]'); if (cv) fishPaint(cv, f, (fishLog()[f.id] | 0) > 0); });
}

/* ---- from a boat ---- */
function fishSeaOk(){ return Sea.on && G.state === 'sail' && !Sea.sunk && boatOwned() && Math.abs(Sea.v) < 36; }
function fishSeaOpen(){
  if (!fishSeaOk()){ try { SFX.deny(); } catch (e) {} return false; }
  const cb = document.getElementById('castBtn'); if (cb){ cb.style.display = 'none'; cb._on = false; }
  Fg.sea = true; G.state = 'fishing'; G.subScreen = ''; Sea.thr = 0; Sea.v = 0;
  fishPanel('Cast a line.'); return true;
}
function fishSeaClose(){
  if (Fg.iv){ clearInterval(Fg.iv); Fg.iv = 0; } Fg.phase = 'idle';
  G.state = 'sail'; G.subScreen = ''; Fg.sea = false; hideOverlay();
}
(function(){
  KEY_ACTIONS.push(['cast', 'Cast a line (at sea)']); DEFAULT_KEYS.cast = 'KeyF';
  const rn = render;
  render = function(){
    if (Sea.on && G.state === 'fishing'){ const ctx = CTX; if (!ctx) return; ctx.setTransform(G.dpr, 0, 0, G.dpr, 0, 0); ctx.globalAlpha = 1; ctx.fillStyle = STAGE_BG; ctx.fillRect(0, 0, G.W, G.H); renderSea(ctx); return; }
    return rn.apply(this, arguments);
  };
  const st = step;
  step = function(dt){
    const r = st(dt);
    const b = document.getElementById('castBtn');
    if (b){ const on = fishSeaOk() && !Sea.nearDock; if (on !== b._on){ b._on = on; b.style.display = on ? 'flex' : 'none'; } }
    return r;
  };
  window.addEventListener('keydown', function(e){
    if (e.code === 'Escape' && G.state === 'fishing'){ e.preventDefault(); e.stopPropagation(); fishSeaClose(); return; }
    if (e.code === keyOf('cast') && Sea.on && G.state === 'sail'){ if (fishSeaOpen()) e.preventDefault(); return; }
    if ((e.code === 'Space' || e.code === 'Enter') && Fg.phase === 'bite' && document.getElementById('fishReel')){ e.preventDefault(); fishReel(); }
  }, true);
  const b = document.createElement('button'); b.id = 'castBtn'; b.type = 'button'; b.textContent = 'Cast a line'; b.style.display = 'none';
  b.addEventListener('click', function(){ fishSeaOpen(); });
  document.body.appendChild(b);
  const ha = handleAction;
  handleAction = function(a){
    if (typeof a === 'string' && a.indexOf('fish-') === 0){
      if (a === 'fish-cast'){ fishCast(); return; }
      if (a === 'fish-reel'){ fishReel(); return; }
      if (a === 'fish-book'){ SFX.click(); showFishBook(); return; }
      if (a === 'fish-book-back'){ SFX.click(); fishPanel(); return; }
      if (a === 'fish-sea-close'){ SFX.click(); fishSeaClose(); return; }
      const m = /^fish-tk-(rod|line|bait)$/.exec(a);
      if (m){
        const list = m[1] === 'rod' ? FISH_RODS : m[1] === 'line' ? FISH_LINES : FISH_BAITS, k = fishTackle().k; let i = k[m[1]] | 0;
        for (let n = 0; n < list.length; n++){ i = (i + 1) % list.length; if (fishUnlocked(list, i)) break; }
        k[m[1]] = i; Save.write(); SFX.click(); fishPanel(); return;
      }
    }
    return ha.apply(this, arguments);
  };
})();

/* ---- trophies for it ---- */
(function(){
  const raw = function(){ let o = Save.data && Save.data.town; for (let i = 0; i < arguments.length; i++) o = o && typeof o === 'object' ? o[arguments[i]] : undefined; return o; };
  const kinds = function(){ const l = raw('fish'); return l ? FISH.filter(function(f){ return l[f.id] > 0; }).length : 0; };
  const add = function(id, name, desc, goal, gems, val){ ACH.push({ id: id, cat: 'town', name: name, desc: desc, goal: goal, gems: gems, val: function(){ try { const v = +val(); return isFinite(v) ? v : 0; } catch (e) { return 0; } } }); };
  const old = ACH.filter(function(a){ return a.id === 'fishAll'; })[0]; if (old){ old.desc = 'Catch 13 kinds of fish'; }
  add('fish20', 'Seasoned Angler', 'Catch 20 kinds of fish', 20, 8, kinds);
  add('fish35', 'The Whole Book', 'Catch all ' + FISH.length + ' kinds of fish', FISH.length, 30, kinds);
  add('fishBig', 'Whopper', 'Land a fish 200 cm long', 200, 8, function(){ const b = raw('fishBook'); let m = 0; if (b) Object.keys(b).forEach(function(k){ m = Math.max(m, b[k] | 0); }); return m; });
  add('fishLeg', 'The One That Did Not Get Away', 'Catch a legendary fish', 1, 12, function(){ const l = raw('fish'); return l ? FISH.filter(function(f){ return fishRarity(f) === 3 && l[f.id] > 0; }).length : 0; });
  add('fishOrd3', 'Brine’s Regular', 'Finish 3 of Brine’s weekly orders', 3, 6, function(){ return raw('n', 'fishOrders') | 0; });
  add('seaCast', 'Line Over the Side', 'Fish from a boat', 1, 4, function(){ return raw('n', 'seaCasts') | 0; });
})();
