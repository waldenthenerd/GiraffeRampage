'use strict';
/* Fishing, grown: 35 kinds, sizes, a fish book, tackle, and casting from a boat. */
/* ========================= 44zzv. FISHING ========================= */
/* The pier game of js/44zg-town-activities.js (cast, wait, reel when the marker is in the green) is rebuilt here and used in two places: the end of the pier,
   and from a boat at sea (press F, or the Cast button, when the boat is nearly still).
   35 KINDS in five groups of the FISH BOOK: the pier (the first 13), the shallows, the reef, the deep, and three that only come in a certain weather
   (storm, fog, rain). At sea what bites depends on the water under the boat (shallows, reef, open water or deep), the time of day and the weather; a few
   come only at night or in one kind of weather. Every catch has a size in centimetres (the biggest of each kind is kept), and pays gold by kind and size.
   RARITY follows the odds weight: common, uncommon, rare, legendary.
   TACKLE is free: it is unlocked by how many kinds of fish she has caught, and each piece is put on when it unlocks (and can be changed in the fishing panel).
     rods   Cane rod (5 kinds)  wider green zone;     Golden rod (all 35)  widest zone
     lines  Braided line (10)  a longer bite;  Deep reel (20)  longest bite and a slower marker
     baits  Shrimp (15)  more uncommon and rarer fish;  Glow lure (28)  many more rare and legendary ones
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
/* what a catch pays: coin * v * FISH_PAY * (0.7 to 1.3 by size). A clean fight (the line never went red) pays a quarter more and leaves a scale extra. Raised from 0.6 when the fight made a catch take about twice as long. */
const FISH_PAY = 0.96, CLEAN_PEAK = 0.85;
const FISH_RARITY = ['common', 'uncommon', 'rare', 'legendary'], FISH_RCOL = ['#BFD8E0', '#8FE0A0', '#8FB4F2', '#F2B33D'];
function fishRarity(f){ return f.r >= 15 ? 0 : f.r >= 8 ? 1 : f.r >= 3 ? 2 : 3; }
/* tackle is unlocked by how many kinds of fish she has caught: `need` is that number */
const FISH_RODS = [{ n: 'Plain rod', z: 1 }, { n: 'Cane rod', z: 1.15, need: 5 }, { n: 'Golden rod', z: 1.4, need: FISH.length }];
const FISH_LINES = [{ n: 'Thin line', win: 5.5, sp: 1 }, { n: 'Braided line', win: 7.5, sp: 1, need: 10 }, { n: 'Deep reel', win: 10, sp: 0.85, need: 20 }];
const FISH_BAITS = [{ n: 'No bait', m: [1, 1, 1, 1] }, { n: 'Shrimp', m: [1, 1.6, 1.6, 1.6], need: 15 }, { n: 'Glow lure', m: [1, 1.2, 2.2, 2.2], need: 28 }];

/* ---- what she has caught ---- */
function fishBook(){ const t = townData(); if (!t.fishBook || typeof t.fishBook !== 'object' || Array.isArray(t.fishBook)) t.fishBook = {}; return t.fishBook; }
function fishGroupDone(g){ const log = fishLog(); return FISH.every(function(f){ return (g === 'all' || f.h === g) ? log[f.id] > 0 : true; }); }
function fishGroupCount(g){ const log = fishLog(); let n = 0, all = 0; FISH.forEach(function(f){ if (f.h === g){ all++; if (log[f.id] > 0) n++; } }); return [n, all]; }
function fishKinds(){ const log = fishLog(); return FISH.filter(function(f){ return log[f.id] > 0; }).length; }
function fishUnlocked(list, i){ return !list[i].need || fishKinds() >= list[i].need; }
function fishTackle(){
  const t = townData(); if (!t.tackle || typeof t.tackle !== 'object' || Array.isArray(t.tackle)) t.tackle = {};
  const k = t.tackle;
  [['rod', FISH_RODS], ['line', FISH_LINES], ['bait', FISH_BAITS]].forEach(function(p){
    let i = k[p[0]] | 0; if (i < 0 || i >= p[1].length || !fishUnlocked(p[1], i)) i = 0; k[p[0]] = i;
  });
  return { rod: FISH_RODS[k.rod], line: FISH_LINES[k.line], bait: FISH_BAITS[k.bait], k: k };
}

/* ---- fish scales: every catch leaves some, and the gear bench in the tackle shop turns them into gear levels (js/44zzw-tackle-shop.js) ---- */
const FISH_SCALES = [1, 2, 5, 12];                                      /* per catch, by rarity (common to legendary); a new record adds 1 */
function fishScaleGain(f){ return FISH_SCALES[fishRarity(f)]; }
function fishScaleN(){ const t = townData(); return Math.max(0, Math.floor(+t.scales || 0)); }       /* read raw: a save that has never fished gets no key */
function fishScalesAdd(n){ const t = townData(); t.scales = fishScaleN() + Math.max(0, n | 0); }

/* ---- what bites ---- */
/* where: 'pier', or 'shallows' | 'reef' | 'water' | 'deep' at sea */
const FISH_MIX = { shallows: { shallows: 1, special: 0.4 }, reef: { reef: 1, shallows: 0.15, special: 0.4 }, water: { shallows: 0.6, reef: 0.15, deep: 0.25, special: 0.4 }, deep: { deep: 1, special: 0.4 } };
function fishPool(where, bait){
  const night = typeof townIsNight === 'function' && townIsNight(), wx = typeof townWeatherType === 'function' ? townWeatherType() : 'clear', rain = typeof Town !== 'undefined' && Town.rainK > 0.4;
  const cond = fishCond(where), mix = where === 'pier' ? null : (FISH_MIX[where] || FISH_MIX.water), bm = (bait || FISH_BAITS[0]).m, out = [];
  FISH.forEach(function(f){
    if (f.night && !night) return;
    if (f.wx && f.wx !== wx) return;
    let w = f.wx ? 10 : f.r;
    if (where === 'pier'){ if (f.h !== 'pier') return; } else { w *= mix[f.h] || 0; }
    if (!(w > 0)) return;
    if (rain && f.v >= 3) w *= 1.5;
    w *= bm[fishRarity(f)];
    const q = fishRarity(f); if (q >= 2) w *= cond.rare; else if (q === 1) w *= 1 + (cond.rare - 1) / 2;      /* dusk, storms and the good spots bring the better fish (js/44zzy-fishing-fight.js) */
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
  return Math.round(lo + (hi - lo) * Math.min(1, Math.pow(Math.random(), 1.6) * (1 + (rodZ - 1) * 0.3) * fishCond(fishHab()).size));
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
const Fg = { where: 'pier', phase: 'idle', iv: 0, sea: false, fish: null, clock: 0, a: null, side: false, rodU: 0, rodOn: false };
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
  Fg.rodOn = true; Fg.phase = 'idle'; if (!Fg.a || Fg.a.k === 'cast') Fg.a = null; Fg.fish = null;
  const o = fishOrder(), of = FISH.filter(function(f){ return f.id === o.id; })[0];
  const html = '<div class="tp-title">' + FISH_HABNAME[fishHab()] + '</div>' + fishCatchHTML(Fg.last) + '<div class="fishmsg" id="fishMsg">' + (msg || 'Cast a line.') + '</div>' + fishCondHTML() +
    '<div class="fishbar" id="fishBar" style="display:none"><div class="fzone" id="fishZone"></div><i id="fishMark"></i></div>' + fishFightHTML() +
    '<div class="chalkrow"><button class="chalk" data-a="fish-cast" id="fishCast">' + (Fg.last || Fg.recastAt ? 'Cast again' : 'Cast') + '</button><button class="chalk" data-a="fish-reel" id="fishReel" style="display:none">Reel in!</button></div>' +
    fishTackleHTML() +
    '<div class="chalkrow fbrow"><button class="chalk" data-a="fish-book">Fish book · ' + fishKinds() + ' of ' + FISH.length + '</button><button class="chalk" data-a="fish-auto">Auto-recast: ' + (fishAutoOn() ? 'on' : 'off') + '</button></div>' +
    '<div class="fishlog">' + fishRows() + '</div>' +
    '<p class="tnote">Brine’s order this week: a <b>' + of.name + '</b>' + (o.done ? ' (done)' : ' · 8 gems') + (townIsNight() ? ' · the moon jelly is out' : '') + '</p>';
  if (Fg.sea){
    setOverlay('<div class="panel tp tp-fish" style="max-width:340px">' + html + '<div class="tp-foot"><button class="tbtn" data-a="fish-sea-close">Back to the boat</button></div></div>');
  } else townPanelT('fish', html, { w: 340 });
  OV.classList.remove('fighting'); fishPaintCard();
  OV.classList.add('side'); Fg.side = true;                      /* a sidebar (a bottom sheet on a narrow screen), so the water and the fish stay in view */
}
townShowFishing = function(msg){ Fg.sea = false; fishPanel(msg); };

function fishCast(){
  if (Fg.phase !== 'idle') return;
  const k = fishTackle(), fish = fishPickAt(fishHab(), k.bait);
  Fg.fish = fish; Fg.phase = 'wait'; Fg.t = 0; Fg.wait = (1 + Math.random() * 2.2) * fishCond(fishHab()).wait; Fg.k = k; Fg.last = null; Fg.recastAt = 0; fishSound('cast');
  document.getElementById('fishMsg').textContent = 'The float drifts...'; document.getElementById('fishCast').style.display = 'none';
  SFX.click();
  Fg.a = { k: 'cast', t: Fg.clock };
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
    Fg.phase = 'bite'; Fg.biteAt = Fg.clock; Fg.t = 0; Fg.zone = 0.18 + Math.random() * 0.5;
    Fg.w = clamp((0.28 - Math.min(f.v, 22) * 0.012) * k.rod.z, 0.1, 0.5); Fg.speed = Math.min(4.2, 1.4 + f.v * 0.12) * k.line.sp * (1 - 0.12 * intel());
    Fg.w = Math.min(0.5, Fg.w * (1 + 0.15 * intel()));
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
function fishResult(win, why){
  if (Fg.phase === 'idle') return;
  clearInterval(Fg.iv); Fg.iv = 0; Fg.phase = 'idle';
  const f = Fg.fish, k = Fg.k; let msg;
  if (win){
    const log = fishLog(), book = fishBook(), first = !(log[f.id] > 0), had = FISH_RODS.map(function(r, i){ return fishUnlocked(FISH_RODS, i); }).concat(FISH_LINES.map(function(r, i){ return fishUnlocked(FISH_LINES, i); }), FISH_BAITS.map(function(r, i){ return fishUnlocked(FISH_BAITS, i); }));
    const len = fishRollLen(f, k.rod.z), rec = !(book[f.id] >= len); if (rec) book[f.id] = len;
    log[f.id] = (log[f.id] | 0) + 1;
    const frac = (len - f.len[0]) / Math.max(1, f.len[1] - f.len[0]), clean = typeof Fg.peak === 'number' && Fg.peak <= CLEAN_PEAK, gold = Math.round(townCoin() * f.v * FISH_PAY * (0.7 + 0.6 * frac) * (clean ? 1.25 : 1));
    const pay = { gold: gold }; if (first) pay.gems = 5;
    const o = fishOrder(); let ordered = false;
    if (o.id === f.id && !o.done){ o.done = true; ordered = true; pay.gems = (pay.gems | 0) + 8; const t = townData(); t.n.fishOrders = (t.n.fishOrders | 0) + 1; }
    townPay(pay);
    const scl = Math.round((fishScaleGain(f) + (rec && !first ? 1 : 0) + (clean ? 1 : 0)) * fishCond(fishHab()).scales); fishScalesAdd(scl);
    Fg.last = { clean: clean, secs: Fg.ft || 0, f: f, len: len, rec: rec && !first, first: first, gold: gold, scl: scl, gems: pay.gems | 0, best: book[f.id] | 0, ordered: ordered };
    Fg.a = { k: 'leap', t: Fg.clock, f: f, len: len, rec: rec || first };
    msg = 'You caught a ' + f.name + ', ' + len + ' cm! +' + fmt(gold) + ' gold' + (first ? ' and 5 gems for a new kind' : '') + (rec && !first ? ' · a new record' : '') + (clean ? ' · a clean fight' : '') + '. +' + scl + ' scale' + (scl === 1 ? '' : 's') + '.';
    if (ordered) msg += ' That was Brine’s order: +8 gems!';
    /* new tackle: unlocked by the page she has just completed, and put on */
    const now = [FISH_RODS, FISH_LINES, FISH_BAITS], names = [], kk = fishTackle().k; let at = 0;
    ['rod', 'line', 'bait'].forEach(function(key, ki){ const list = now[ki]; for (let i = 0; i < list.length; i++){ if (fishUnlocked(list, i) && !had[at + i]){ kk[key] = i; names.push(list[i].n); } } at += list.length; });
    if (names.length) msg += ' New tackle, and it is on: ' + names.join(', ') + '!';
    const t2 = townData(); t2.n.fishCaught = (t2.n.fishCaught | 0) + 1; if (clean) t2.n.fishClean = (t2.n.fishClean | 0) + 1;
    if (FISH.every(function(x){ return log[x.id] > 0; }) && !t2.n.fishAll){ t2.n.fishAll = 1; townPay({ gems: 100 }); msg += ' Every kind caught: +100 gems!'; SFX.transform(); } else fishSound('catch', f);
  } else { msg = why || 'It got away.'; Fg.last = null; fishSound('lost'); Fg.a = { k: 'lost', t: Fg.clock, f: f }; }
  Save.write();
  fishPanel(msg);
  fishAfterResult();
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
    '<span style="color:' + FISH_RCOL[q] + '">' + FISH_RARITY[q] + '</span><small>' + (n ? 'Biggest ' + best + ' cm · caught ' + n + ' · ' + fishBehave(f).n : hint) + '</small></div>';
}
function showFishBook(){
  Fg.side = false;
  const tk = fishTackle(), kinds = fishKinds();
  const gear = [['Cane rod', FISH_RODS[1]], ['Braided line', FISH_LINES[1]], ['Shrimp bait', FISH_BAITS[1]], ['Deep reel', FISH_LINES[2]], ['Glow lure', FISH_BAITS[2]], ['Golden rod', FISH_RODS[2]]];
  let body = '<h3 class="thead">Tackle <small>free, unlocked by how many kinds you have caught</small></h3><div class="fgrid">' + gear.map(function(g){
    const on = kinds >= g[1].need;
    return '<div class="fcard' + (on ? ' got' : '') + '"><b>' + g[0] + '</b><span style="color:' + (on ? '#8FE0A0' : '#BFD8E0') + '">' + (on ? 'yours' : kinds + ' of ' + g[1].need + ' kinds') + '</span></div>';
  }).join('') + '</div>';
  FISH_GROUPS.forEach(function(g){
    const c = fishGroupCount(g[0]);
    body += '<h3 class="thead">' + g[1] + ' <small>' + c[0] + ' of ' + c[1] + (c[0] === c[1] ? ' \u2713' : '') + '</small></h3><div class="fgrid">' +
      FISH.filter(function(f){ return f.h === g[0]; }).map(fishCardHTML).join('') + '</div>';
  });
  const html = '<div class="panel slab fishbook"><h2 class="head">Fish book</h2><p class="sub">' + kinds + ' of ' + FISH.length + ' kinds caught \u00b7 tackle in use: ' + tk.rod.n + ', ' + tk.line.n + ', ' + tk.bait.n + (kinds >= FISH.length ? ' \u00b7 the whole book is done' : '') + '</p><div class="tscroll">' + body + '</div>' +
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
  Fg.a = null; Fg.side = false;
  if (Fg.iv){ clearInterval(Fg.iv); Fg.iv = 0; } Fg.phase = 'idle';
  G.state = 'sail'; G.subScreen = ''; Fg.sea = false; hideOverlay();
}
(function(){
  KEY_ACTIONS.push(['cast', 'Cast a line (at sea)']); DEFAULT_KEYS.cast = 'KeyF';
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


/* ---- seeing it: the line, the float, the bite and the fish coming out of the water ---- */
/* At the pier (drawn in the street's own coordinates, from the giraffe's head out over the water) and from a boat (drawn over the sea, to the side of the boat, seen from above).
   Fg.clock is the game's own time (it moves with every step), Fg.a is what is happening: cast (the line flies out), then the float rests on the water and rings spread from it;
   a bite (Fg.phase 'bite') makes it dip and splash; leap (a catch: the fish comes up out of the water in an arc and is held up, with its name and length); lost (a splash and a tail). */
const FISH_ICON = {};
function fishIcon(f){ let c = FISH_ICON[f.id]; if (!c){ c = document.createElement('canvas'); c.width = 84; c.height = 48; fishPaint(c, f, true); FISH_ICON[f.id] = c; } return c; }
const FISH_ANIM = { cast: 0.95, leap: 2.3, lost: 0.9 };       /* a cast: she winds up (to 0.35 s), flicks the rod and lets go (0.4 s), and the float flies out (to 0.95 s) */
function fishAnimOn(){ return Fg.phase !== 'idle' || (Fg.a && Fg.clock - Fg.a.t < FISH_ANIM[Fg.a.k]); }
/* what she is doing with the rod, from the state of the game: back is how far it is swung back (1 at the top of a wind-up, below 0 in the flick forward), bend how much it bows */
function fishPose(){
  const a = Fg.a, now = Fg.clock, age = a ? now - a.t : 99; let back = 0, bend = 0.12;
  if (a && a.k === 'cast' && age < FISH_ANIM.cast){
    if (age < 0.35){ const w = age / 0.35; back = w * w * (3 - 2 * w); bend = 0.12 + 0.2 * w; }
    else if (age < 0.5){ const w = (age - 0.35) / 0.15; back = 1 - 1.4 * w; bend = 0.7; }
    else { const w = (age - 0.5) / 0.45; back = -0.4 * (1 - w * w * (3 - 2 * w)); bend = 0.3 * (1 - w) + 0.12; }
  } else if (Fg.phase === 'fight'){ const bt = now - (Fg.biteAt || now); back = 0.2 + 0.5 * (Fg.hold ? 1 : 0.2) * (0.6 + 0.4 * Math.sin(bt * 7)) + 0.4 * (Fg.pull || 0); bend = 0.35 + 0.5 * (Fg.ten || 0); }
  else if (Fg.phase === 'bite'){ const bt = now - (Fg.biteAt || now); back = 0.1 + 0.1 * Math.sin(bt * 18); bend = 0.35 + 0.35 * Math.abs(Math.sin(bt * 9)); }
  else if (a && a.k === 'leap' && age < FISH_ANIM.leap){ back = age < 1.0 ? 0.85 * Math.sin(age / 1.0 * Math.PI * 0.5) : 0.85 * (1 - clamp((age - 1.0) / 1.2, 0, 1)); bend = 0.65 * (1 - clamp((age - 1.0) / 1.2, 0, 1)) + 0.1; }
  else if (a && a.k === 'lost' && age < FISH_ANIM.lost){ back = -0.3 * (1 - age / 0.5 > 0 ? 1 - age / 0.5 : 0); bend = 0.1; }
  else if (Fg.phase === 'wait') bend = 0.14 + 0.03 * Math.sin(now * 2.6);
  return { back: back, bend: bend };
}
/* which side of the boat she fishes over (the one away from the sidebar), as +1 (her right) or -1 (her left) */
function fishSideSign(){
  const nx = Math.cos(Sea.h + Math.PI / 2), ny = Math.sin(Sea.h + Math.PI / 2);
  return (G.W < 700 ? ny > 0 : nx > 0) ? -1 : 1;
}
/* the rod at the pier, held out from her mouth: p.rodFrom is the mouth and p.rod the tip, p.bend how much it bows */
function fishDrawRod(ctx, p){
  if (!p.rodFrom) return;
  const dx = p.rod[0] - p.rodFrom[0], dy = p.rod[1] - p.rodFrom[1], len = Math.sqrt(dx * dx + dy * dy) || 1; let nx = -dy / len, ny = dx / len; if (ny < 0){ nx = -nx; ny = -ny; }
  const qx = (p.rod[0] + p.rodFrom[0]) / 2 + nx * (p.bend || 0) * len * 0.3, qy = (p.rod[1] + p.rodFrom[1]) / 2 + ny * (p.bend || 0) * len * 0.3;
  ctx.save(); ctx.lineCap = 'round';
  ctx.strokeStyle = '#6A4A2A'; ctx.lineWidth = 3.4 * p.k; ctx.beginPath(); ctx.moveTo(p.rodFrom[0], p.rodFrom[1]); ctx.quadraticCurveTo(qx, qy, p.rod[0], p.rod[1]); ctx.stroke();
  ctx.strokeStyle = '#B8935A'; ctx.lineWidth = 1.6 * p.k; ctx.beginPath(); ctx.moveTo((p.rodFrom[0] + qx) / 2, (p.rodFrom[1] + qy) / 2); ctx.quadraticCurveTo((qx + p.rod[0]) / 2, (qy + p.rod[1]) / 2, p.rod[0], p.rod[1]); ctx.stroke();
  ctx.fillStyle = '#3A3A44'; ctx.beginPath(); ctx.arc(p.rodFrom[0] + (qx - p.rodFrom[0]) * 0.3, p.rodFrom[1] + (qy - p.rodFrom[1]) * 0.3 + 4 * p.k, 4 * p.k, 0, TAU); ctx.fill();
  ctx.restore();
}
/* one picture of the whole thing: p is { rod: [x, y] (where the line leaves the rod), rest: [x, y] (the float on the water), hold: [x, y] (where a caught fish is held up),
   k: pixels per unit (1 at the pier), flat: how flattened the rings are (a side view: 0.3, from above: 1), arc: how high a leap goes } */
function fishDrawAnim(ctx, p){
  if (!fishAnimOn()){ if (Fg.rodOn) fishDrawRod(ctx, p); return; }
  const a = Fg.a, now = Fg.clock, k = p.k, lerp2 = function(u, v, e){ return [u[0] + (v[0] - u[0]) * e, u[1] + (v[1] - u[1]) * e]; };
  let fl = p.rest.slice(), taut = 0.6, floatOn = true, e;
  const age = a ? now - a.t : 99;
  if (a && a.k === 'cast' && age < FISH_ANIM.cast){ e = clamp((age - 0.4) / 0.55, 0, 1); fl = lerp2(p.rod, p.rest, e); fl[1] -= Math.sin(e * Math.PI) * 60 * k * p.arc; taut = e > 0 ? 0.9 : 0.4; }
  else if (Fg.phase === 'bite' || Fg.phase === 'fight'){ const bt = now - (Fg.biteAt || now); fl[1] += Math.sin(bt * 26) * 2.4 * k + Math.abs(Math.sin(bt * 5)) * 7 * k; fl[0] += Math.sin(bt * 17) * 3 * k; taut = 0.97; }
  else if (Fg.phase === 'wait'){ fl[1] += Math.sin(now * 2.6) * 1.8 * k; taut = 0.75; }
  else floatOn = false;
  if (a && a.k === 'leap' && age < FISH_ANIM.leap || a && a.k === 'lost' && age < FISH_ANIM.lost) taut = 0.9;
  ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  /* rings on the water round the float */
  if (Fg.phase !== 'idle' || (a && a.k !== 'cast') ){
    const fast = Fg.phase === 'bite' ? 3.2 : 1;
    for (let i = 0; i < 3; i++){ const ph = (now * 0.8 * fast + i / 3) % 1; ctx.globalAlpha = (1 - ph) * 0.55; ctx.strokeStyle = '#E8FBFF'; ctx.lineWidth = 1.6 * k; ctx.beginPath(); ctx.ellipse(p.rest[0], p.rest[1] + 3 * k, (6 + 26 * ph) * k, (6 + 26 * ph) * k * p.flat, 0, 0, TAU); ctx.stroke(); }
    ctx.globalAlpha = 1;
  }
  /* the rod and the line: it hangs a little when slack and is straight when a fish pulls */
  fishDrawRod(ctx, p);
  const held = a && a.k === 'leap' && age > 1.0, tip = held ? p.hold : fl;
  if (floatOn || held || (a && a.k === 'leap') || (a && a.k === 'lost')){
    const mx = (p.rod[0] + tip[0]) / 2, my = (p.rod[1] + tip[1]) / 2 + (1 - taut) * 46 * k * p.arc;
    ctx.strokeStyle = 'rgba(245,250,255,.85)'; ctx.lineWidth = 1.3 * k; ctx.beginPath(); ctx.moveTo(p.rod[0], p.rod[1]); ctx.quadraticCurveTo(mx, my, tip[0], tip[1]); ctx.stroke();
  }
  /* the float */
  if (floatOn && !(a && a.k === 'leap' && age < FISH_ANIM.leap)){
    ctx.fillStyle = '#F4F4F0'; ctx.beginPath(); ctx.arc(fl[0], fl[1], 4.6 * k, 0, TAU); ctx.fill();
    ctx.fillStyle = '#D5352B'; ctx.beginPath(); ctx.arc(fl[0], fl[1] - 1.4 * k, 4.6 * k, Math.PI, 0); ctx.fill();
  }
  /* the fish out of the water: up in an arc, then held on the line (with a swing), then back in */
  if (a && a.k === 'leap' && age < FISH_ANIM.leap){
    const f = a.f, ic = fishIcon(f), w = clamp(60 + a.len * 0.5, 74, 170) * k * (p.flat < 1 ? 0.8 : 0.7), h = w * 48 / 84;
    let pos, ang, sc = 1;
    if (age < 1.0){ e = age / 1.0; pos = lerp2(p.rest, p.hold, e * e * (3 - 2 * e)); pos[1] -= Math.sin(e * Math.PI) * 120 * k * p.arc; ang = (e - 0.5) * 1.6 * p.dir; if (p.flat >= 1) sc = 1 + Math.sin(e * Math.PI) * 0.45; }
    else { const u = age - 1.0; pos = [p.hold[0] + Math.sin(u * 6) * 6 * k * (1 - Math.min(1, u / 1.3)), p.hold[1] + Math.abs(Math.sin(u * 3)) * 3 * k]; ang = Math.sin(u * 6) * 0.12 * (1 - Math.min(1, u / 1.3)); if (u > 1.0) ctx.globalAlpha = clamp(1 - (u - 1.0) / 0.3, 0, 1); }
    if (p.flat >= 1){ ctx.globalAlpha *= 0.28; ctx.fillStyle = '#05121C'; ctx.beginPath(); ctx.ellipse(pos[0] + 6 * k, pos[1] + 14 * k * sc, w * 0.4, h * 0.25, 0, 0, TAU); ctx.fill(); ctx.globalAlpha = age > 2.0 ? clamp(1 - (age - 2.0) / 0.3, 0, 1) : 1; }
    ctx.save(); ctx.translate(pos[0], pos[1]); ctx.rotate(ang * (p.flat >= 1 ? 1 : 1)); if (p.dir < 0 && p.flat < 1) ctx.scale(-1, 1); ctx.scale(sc, sc);
    ctx.drawImage(ic, -w / 2, -h / 2, w, h); ctx.restore(); ctx.globalAlpha = 1;
    /* the drops it throws up as it leaves the water, and a tag once it is held */
    if (age < 0.9) for (let i = 0; i < 12; i++){ const an = i * 0.78 + 0.4, v = (50 + (i % 4) * 26) * k, tt = age; const x = p.rest[0] + Math.cos(an) * v * tt * 0.9, y = p.rest[1] - Math.abs(Math.sin(an)) * v * tt * 1.4 * p.arc + 260 * k * tt * tt * 0.5 * p.arc; ctx.globalAlpha = clamp(1 - tt / 0.9, 0, 1); ctx.fillStyle = '#DFF6FF'; ctx.beginPath(); ctx.arc(x, y, (2.8 - tt * 2) * k, 0, TAU); ctx.fill(); }
    ctx.globalAlpha = 1;
    if (age > 1.0 && age < 2.0){
      const txt = f.name + ', ' + a.len + ' cm' + (a.rec ? '  ★' : '');
      ctx.font = '700 ' + Math.round(15 * Math.max(1, k * 0.9)) + 'px system-ui,sans-serif'; ctx.textAlign = 'center'; ctx.lineWidth = 4; ctx.strokeStyle = 'rgba(8,20,30,.85)'; ctx.fillStyle = '#FFF3C4';
      ctx.globalAlpha = age > 1.8 ? clamp(1 - (age - 1.8) / 0.2, 0, 1) : 1;
      ctx.strokeText(txt, pos[0], pos[1] - h * 0.9 - 8 * k); ctx.fillText(txt, pos[0], pos[1] - h * 0.9 - 8 * k); ctx.globalAlpha = 1;
    }
  }
  /* it got away: a splash and a dark shape darting off */
  if (a && a.k === 'lost' && age < FISH_ANIM.lost){
    ctx.globalAlpha = clamp(1 - age / FISH_ANIM.lost, 0, 1) * 0.8;
    const d = age * 140 * k * p.dir, ic = fishIcon(a.f);
    ctx.save(); ctx.translate(p.rest[0] - d, p.rest[1] + 6 * k); ctx.scale(0.5 * k * (p.dir || 1), 0.5 * k * p.flat + 0.001); ctx.globalAlpha *= 0.55; ctx.drawImage(ic, -42, -24, 84, 48); ctx.restore();
    ctx.globalAlpha = clamp(1 - age / 0.5, 0, 1); ctx.strokeStyle = '#DFF6FF'; ctx.lineWidth = 2 * k; ctx.beginPath(); ctx.ellipse(p.rest[0], p.rest[1], 10 * k + age * 60 * k, (10 * k + age * 60 * k) * p.flat, 0, 0, TAU); ctx.stroke();
  }
  ctx.restore();
}
function fishPierGeo(){
  const f = Town.face < 0 ? -1 : 1, x = Town.x, q = fishPose(), hd = Fg.head && Fg.clock - Fg.head.t < 0.5 ? Fg.head : null, from = hd ? [hd.x + f * 8, hd.y + 4] : [x + f * 46, TG - 146], th = -f * q.back * 0.9, c = Math.cos(th), sn = Math.sin(th);
  const vx = f * 58, vy = -58, rod = [from[0] + vx * c - vy * sn, from[1] + vx * sn + vy * c];
  return { rodFrom: from, rod: rod, rest: [x + f * 168, TG - 30], hold: [rod[0], rod[1] + 46], k: 1.15, flat: 0.28, arc: 1, dir: f, bend: q.bend };
}
function fishSeaGeo(){
  const W = G.W, H = G.H, z = clamp(H / 520, 0.8, 1.7), cx = W / 2, cy = H / 2, s = fishSideSign();
  const nx = s * Math.cos(Sea.h + Math.PI / 2), ny = s * Math.sin(Sea.h + Math.PI / 2);
  const rod = (Fg.rodU > 0 && seaRiderTip) ? seaRiderTip.slice() : [cx + nx * 26 * z, cy + ny * 26 * z];     /* the end of the rod she holds (drawn with the boat) */
  return { rodFrom: null, rod: rod, rest: [cx + nx * 120 * z, cy + ny * 120 * z], hold: [rod[0] + nx * 22 * z, rod[1] + ny * 22 * z], k: z, flat: 1, arc: 0.7, dir: nx < 0 ? -1 : 1 };
}
(function(){
  const dyn = townDynamic;
  townDynamic = function(ctx, D, t, dark){
    dyn.apply(this, arguments);
    if (!Town.panel) Fg.rodOn = false;
  };
  /* at the pier she moves herself: her neck swings back as she casts and heaves on a fish, and the rod, line and fish are drawn with her (over her head), not behind her */
  const dp = townDrawPlayer;
  townDrawPlayer = function(ctx, t){
    const pier = !Fg.sea && Town.d === 'harbour' && Town.on;
    const mine = pier && Town.panel && Fg.rodOn && !Town.car && !Town.seat && !Town.gym;
    if (!mine) dp.apply(this, arguments);
    else {
      const q = fishPose(), idle = 0.06 * Math.sin(t * 1.3) + 0.14 * Math.pow(Math.max(0, Math.sin(t * 0.37)), 6);
      const hd = townGiraffe(ctx, Town.x, TG, { s: 1.5, flip: Town.face < 0, ph: Town.ph, moving: false, reach: Math.max(-0.15, idle + 0.35 * q.back), lean: -5 * q.back, t: t });
      Fg.head = { x: hd.x, y: hd.y, t: Fg.clock };
    }
    if (pier && (fishAnimOn() || Fg.rodOn)) fishDrawAnim(ctx, fishPierGeo());
  };
  const rn = render;
  render = function(){
    if (Sea.on && G.state === 'fishing'){ const ctx = CTX; if (!ctx) return; ctx.setTransform(G.dpr, 0, 0, G.dpr, 0, 0); ctx.globalAlpha = 1; ctx.fillStyle = STAGE_BG; ctx.fillRect(0, 0, G.W, G.H); renderSea(ctx); fishDrawAnim(ctx, fishSeaGeo()); return; }
    return rn.apply(this, arguments);
  };
  const st = step;
  step = function(dt){
    Fg.clock += Math.min(dt, 0.1);
    if (Sea.on && G.state === 'fishing'){ const d = Math.min(dt, 0.05); Sea.t += d; G.time += d; }      /* the sea's own clock only runs while she sails: keep the rain, waves and the boat's bob going while she fishes */
    const up = Fg.sea && G.state === 'fishing'; Fg.rodU = clamp(Fg.rodU + (up ? Math.min(dt, 0.1) / 0.4 : -Math.min(dt, 0.1) / 0.3), 0, 1);
    return st(dt);
  };
  /* from a boat she holds the rod in her mouth and swings her neck to cast over the side */
  const srp = seaRiderPose;
  seaRiderPose = function(t){
    const p = srp(t), u = Fg.rodU; if (!(u > 0.001)) return p;
    const e = u * u * (3 - 2 * u), s = fishSideSign(), q = fishPose();
    p.a = p.a * (1 - e) + s * (1.1 + 0.7 * q.back + 0.05 * Math.sin(t * 1.3)) * e; p.L += 2 * e;
    p.rod = { len: 46 * e, da: -s * 0.55 + s * 1.3 * q.back, bend: q.bend, s: s };
    return p;
  };
  const dh = townDynamic && typeof townDialogHeight === 'function' ? townDialogHeight : null;
  if (dh) townDialogHeight = function(){ return Town.panel && Fg.side && G.W < 700 ? Math.round(G.H * 0.44) : dh.apply(this, arguments); };
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
