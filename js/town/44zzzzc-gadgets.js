'use strict';
/* ========================= 44zzzzc. GADGETS AND VOLT & CO. ========================= */
/* An electronics store on Market Street (Volt & Co., between the Library and Crumb's Bakery) sells gadgets. Each family has tiers, and a tier opens with a chapter:
     phone  the Peep Phone, an interface in town (js/town/44zzzzd-phone.js: Music, Mail, News and games; later Run, Photo and Scores). It makes no sound by itself.
     buds   earbuds. They are what plays the song chosen on the phone: in town (Pods), in the menus and in runs too (Pods Plus), and shuffled (Pods Max).
     cam    camera kits for the Photo booth (js/town/44zzzzf-gadget-gear.js): three more frames, then three more filters.
     lamp   a torch and night goggles: the giraffe's own light reaches further in the dark of a run (js/render/36-atmosphere.js asks gadLightK).
   Save.data.gad = { own:{phone,buds,cam,lamp: tier 0 to 3}, on:{buds,lamp: 1 | 0}, song:'', mode:'one'|'shuffle', hi:{blocks,snake}, mail:{read:{},got:{}},
     news:{d,base,q,done,got}, meal:'', ate:{} }  (older saves have none: gadData() makes it, every field checked). The shop, the café menu, the mail and the
   newspaper are the town's chapter rewards: what is on sale, in the menu, in the post and in the paper grows with the chapters she has finished. */
const GAD_FAMS = ['phone', 'buds', 'cam', 'lamp'];
/* need: the chapter to finish first (internal numbers: 14 is the Domes, 15 the Tower, 16 the Siege); cost: coin = that many coins' worth of gold (townCoin) */
const GAD_ITEMS = [
  { id: 'phone1', fam: 'phone', tier: 1, name: 'Peep Phone', need: 2, cost: { coin: 10 }, blurb: 'Music, Mail and News in one pocket, and a little blocks game. It plays nothing by itself: for sound you need earbuds.' },
  { id: 'phone2', fam: 'phone', tier: 2, name: 'Peep Phone Plus', need: 6, cost: { coin: 30 }, blurb: 'Adds the Run app, to start a run from anywhere in town, and the Photo app.' },
  { id: 'phone3', fam: 'phone', tier: 3, name: 'Peep Phone Pro', need: 11, cost: { gems: 250 }, blurb: 'Adds Neck Snake and the Scores app.' },
  { id: 'buds1', fam: 'buds', tier: 1, name: 'Pods', need: 3, cost: { coin: 12 }, blurb: 'Earbuds. They play the song chosen on the phone while she walks around town.' },
  { id: 'buds2', fam: 'buds', tier: 2, name: 'Pods Plus', need: 8, cost: { coin: 40 }, blurb: 'Better ones: the song also plays in the menus and in runs, over the chapter’s own music. Warnings still come through.' },
  { id: 'buds3', fam: 'buds', tier: 3, name: 'Pods Max', need: 13, cost: { gems: 300 }, blurb: 'Adds shuffle: the phone plays through every record she has heard.' },
  { id: 'cam1', fam: 'cam', tier: 1, name: 'Frame Kit', need: 4, cost: { coin: 20 }, blurb: 'For the Photo booth: three more frames (Gold, Hearts and Circuit).' },
  { id: 'cam2', fam: 'cam', tier: 2, name: 'Studio Pro Camera', need: 9, cost: { gems: 200 }, blurb: 'For the Photo booth: three more filters (Neon, Thermal and Dream).' },
  { id: 'lamp1', fam: 'lamp', tier: 1, name: 'Torch', need: 5, cost: { coin: 8 }, blurb: 'In the dark of a run her own light reaches about a third further.' },
  { id: 'lamp2', fam: 'lamp', tier: 2, name: 'Night Goggles', need: 12, cost: { gems: 220 }, blurb: 'Her light reaches nearly twice as far, and the night is a good deal paler.' }
];
const GAD_BY_ID = {}; GAD_ITEMS.forEach(function(it){ GAD_BY_ID[it.id] = it; });
const GAD_ACT = {}, GAD_LABEL = {};                    /* what a building's door does (act -> function(b)) and what its prompt says (act -> text) */
function gadObj(v){ return v && typeof v === 'object' && !Array.isArray(v) ? v : {}; }
function gadData(){
  const d = Save.data; if (!d) return { own: {}, on: {}, song: '', mode: 'one', hi: {}, mail: { read: {}, got: {} }, news: { d: '', base: {}, q: 0, done: 0, got: 0 }, meal: '', ate: {} };
  let g = d.gad; if (!g || typeof g !== 'object' || Array.isArray(g)) g = d.gad = {};
  g.own = gadObj(g.own); g.on = gadObj(g.on); g.hi = gadObj(g.hi); g.ate = gadObj(g.ate);
  GAD_FAMS.forEach(function(f){ g.own[f] = Math.max(0, Math.min(3, g.own[f] | 0)); if (g.on[f] !== 0 && g.on[f] !== 1) g.on[f] = 1; });
  g.hi.blocks = Math.max(0, g.hi.blocks | 0); g.hi.snake = Math.max(0, g.hi.snake | 0);
  g.song = typeof g.song === 'string' && /^[a-z0-9]{1,16}$/.test(g.song) ? g.song : '';
  g.mode = g.mode === 'shuffle' ? 'shuffle' : 'one';
  g.mail = gadObj(g.mail); g.mail.read = gadObj(g.mail.read); g.mail.got = gadObj(g.mail.got);
  g.news = gadObj(g.news); if (typeof g.news.d !== 'string') g.news.d = ''; g.news.base = gadObj(g.news.base); g.news.q = Math.max(0, g.news.q | 0); g.news.done = g.news.done ? 1 : 0; g.news.got = Math.max(0, g.news.got | 0);
  g.meal = typeof g.meal === 'string' && /^[a-z0-9]{1,16}$/.test(g.meal) ? g.meal : '';
  return g;
}
function gadTier(f){ return gadData().own[f] | 0; }
function gadOwn(f){ return gadTier(f) > 0; }
function gadOn(f){ return gadOwn(f) && gadData().on[f] === 1; }
function gadPhone(){ return gadTier('phone'); }
function gadPrice(it){ return { gold: it.cost.coin ? it.cost.coin * townCoin() : 0, gems: it.cost.gems | 0 }; }
function gadPriceText(it){ const p = gadPrice(it); return p.gold ? fmt(p.gold) + ' gold' : p.gems + ' gems'; }
function gadCanBuy(it){
  if (gadTier(it.fam) !== it.tier - 1 || !townDoneCh(it.need)) return false;
  const p = gadPrice(it); return goldInt(Save.data.gold) >= p.gold && (Save.data.gems | 0) >= p.gems;
}
function gadBuy(id){
  const it = GAD_BY_ID[id]; if (!it || !gadCanBuy(it)) return false;
  const p = gadPrice(it), d = Save.data;
  d.gold = goldInt(d.gold) - p.gold; d.gems = (d.gems | 0) - p.gems;
  const g = gadData(); g.own[it.fam] = it.tier; g.on[it.fam] = 1; Save.write(); return true;
}
function gadChapterName(n){ return typeof BESTIARY_CHAPTERS !== 'undefined' && BESTIARY_CHAPTERS[n - 1] ? 'Chapter ' + chapterLabel(n) + ' (' + BESTIARY_CHAPTERS[n - 1] + ')' : 'Chapter ' + n; }

/* ---- the shop ---- */
function gadShowStore(){
  const g = gadData(), gold = goldInt(Save.data.gold), gems = Save.data.gems | 0;
  let html = '<div class="tp-title">VOLT &amp; CO.</div><div class="gd-purse">' + fmt(gold) + ' gold  ·  ' + fmt(gems) + ' gems</div>';
  GAD_FAMS.forEach(function(f){
    const items = GAD_ITEMS.filter(function(i){ return i.fam === f; }), own = g.own[f];
    html += '<div class="gd-fam"><b>' + { phone: 'PHONES', buds: 'EARBUDS', cam: 'CAMERA', lamp: 'LIGHTS' }[f] + '</b></div>';
    items.forEach(function(it){
      const have = own >= it.tier, next = own === it.tier - 1, open = townDoneCh(it.need), can = gadCanBuy(it);
      html += '<div class="gd-row' + (have ? ' have' : '') + (!have && !next ? ' far' : '') + '"><span class="gd-ico gd-' + f + '"></span><span class="gd-n"><b>' + it.name + '</b><small>' + it.blurb + '</small>' +
        (!have && next && !open ? '<em>Finish ' + gadChapterName(it.need) + ' to unlock</em>' : !have && !next ? '<em>Needs the one before it</em>' : '') + '</span>' +
        (have ? '<span class="gd-b gd-own">Owned</span>' : next && open ? '<button class="gd-b" data-a="town-gad-buy-' + it.id + '"' + (can ? '' : ' disabled') + '>' + gadPriceText(it) + '</button>' : '<span class="gd-b gd-lock">' + (next ? 'Locked' : '—') + '</span>') + '</div>';
    });
    if (own && (f === 'buds' || f === 'lamp')) html += '<div class="gd-eq"><button class="tbtn" data-a="town-gad-eq-' + f + '">' + (f === 'buds' ? 'Earbuds' : 'Light') + ': <b>' + (g.on[f] === 1 ? 'ON' : 'OFF') + '</b></button></div>';
  });
  html += '<div class="tnote">New gadgets come in as she finishes chapters. Press P in town, or tap Phone, to use the phone.</div>';
  townPanelT('electro', html, { w: 660 });
}
(function(){
  const h = handleTownAction;
  handleTownAction = function(a){
    let m = /^town-gad-buy-(\w+)$/.exec(a);
    if (m){ if (gadBuy(m[1])){ SFX.level(); const it = GAD_BY_ID[m[1]]; townToast('You bought the ' + it.name + '.', '#BFFF9A'); try { Music.refresh(); } catch (e) {} } else SFX.deny(); gadShowStore(); return true; }
    m = /^town-gad-eq-(\w+)$/.exec(a);
    if (m && gadOwn(m[1])){ const g = gadData(); g.on[m[1]] = g.on[m[1]] === 1 ? 0 : 1; Save.write(); SFX.click(); try { Music.refresh(); } catch (e) {} gadShowStore(); return true; }
    return h(a);
  };
  const tu = townUse;
  townUse = function(o){
    if (o && o.k === 'b' && GAD_ACT[o.b.act] && !(o.b.gate && !o.b.gate())){ SFX.click(); GAD_ACT[o.b.act](o.b); return; }
    return tu.apply(this, arguments);
  };
  const rl = townRelabel;
  townRelabel = function(o, D){ rl(o, D); if (o.k === 'b' && GAD_LABEL[o.b.act] && !o.b.to) o.label = typeof GAD_LABEL[o.b.act] === 'function' ? GAD_LABEL[o.b.act](o.b) : GAD_LABEL[o.b.act]; };
})();
GAD_ACT.gadgets = function(){ gadShowStore(); };
GAD_LABEL.gadgets = 'Look at the gadgets';
GAD_ACT.tv = function(b){
  const pick = ['A wall of screens, all showing the same savannah documentary. A giraffe is eating a tree. You feel seen.', 'The screens flicker through the news, a cooking show and a very slow race between two tortoises.', 'Every screen says VOLT & CO. in a different colour. One says it upside down.'];
  const t = townData(); t.n.tvs = (t.n.tvs | 0) + 1; townSay({ name: b.label, text: pick[(t.n.tvs - 1) % pick.length] }, []);
};
GAD_LABEL.tv = 'Watch the screens';

/* ---- the street: Volt & Co. between the Library and the Bakery, the Post Office and the Newsstand (js/town/44zzzzg-town-post.js) ---- */
(function(){
  const M = TOWN_DIST.market; if (!M) return;
  const clear = function(x0, x1){                       /* take what stood where a new building goes off the street (props, lights, glimmering spots) */
    M.p = M.p.filter(function(p){ return !(p.x > x0 && p.x < x1); }); M.L = M.L.filter(function(l){ return !(l.x > x0 && l.x < x1); });
    M.dig = M.dig.map(function(x){ return x > x0 && x < x1 ? x1 + 30 : x; });
  };
  clear(2030, 2330); clear(1340, 1600);
  M.b.push({ id: 'electro', kind: 'electro', x: 2180, w: 300, h: 220, label: 'Volt & Co.', act: 'electro', to: 'in_electro' },
    { id: 'postoffice', kind: 'postoffice', x: 1470, w: 260, h: 200, label: 'Post Office', act: 'postoffice' },
    { id: 'newsstand', kind: 'newsstand', x: 3170, w: 140, h: 130, label: 'Newsstand', act: 'news' });
  M.p.push({ k: 'lamp', x: 2020 }, { k: 'lamp', x: 1330 }, { k: 'bench', x: 2345 });
  M.L.push({ x: 2020, y: 360, r: 110 }, { x: 2180, y: 400, r: 130 }, { x: 1470, y: 400, r: 120 }, { x: 3170, y: 400, r: 100 });
  const room = townRoomDef('in_electro', 'Volt & Co.', 'electro', 1400, 190, { b: [{ id: 'door', kind: 'door', x: 110, w: 100, h: 130, label: 'Out', act: 'out' },
      { id: 'gshelf1', kind: 'gshelf', x: 420, w: 200, h: 250, label: 'The gadget shelf', act: 'gadgets' },
      { id: 'gcounter', kind: 'gcounter', x: 760, w: 320, h: 110, label: 'The counter', act: 'gadgets' },
      { id: 'tvwall', kind: 'tvwall', x: 1180, w: 300, h: 250, label: 'The wall of screens', act: 'tv' }],
    p: [{ k: 'plant', x: 250 }, { k: 'plant', x: 1330 }], L: [{ x: 420, y: 80, r: 150 }, { x: 760, y: 80, r: 170 }, { x: 1180, y: 80, r: 170 }], npcs: ['volt'] });
  TOWN_ROOM_PARENT.in_electro = 'market';
  window.UNI_ROOMS = window.UNI_ROOMS || {}; window.UNI_ROOMS.electro = 1;       /* no windows on its back wall */
  TOWN_ROOM.electro = { wall: '#1F2A38', wains: '#2E3E54', stripe: 'rgba(80,200,220,.06)', floor: '#3A4252', beam: '#101822' };
  Object.assign(TOWN_NPCS, { volt: { id: 'volt', name: 'Volt', d: 'in_electro', x: 840, range: 70, habit: 'tinker', fav: 'book', look: { coat: '#9ADBE8', spot: '#2A6A8A', pat: 3, hat: 'beanie', s: 1.05 }, gift: { gems: 60, coin: 8 },
    say: ['Everything here has a battery. Almost everything.', 'A phone, a pair of earbuds and a good song. That is all a giraffe needs.', 'I can fix anything with a cable. Not necks. Only cables.'], night: ['The screens never really switch off.'], rain: ['Keep the gadgets dry, please.'] } });
  TOWN_NPC_LIST.push('volt');
})();

/* ---- painting: the shop front, and the room ---- */
(function(){
  const SCR = ['#4DD8FF', '#FF6AA8', '#FFD84D', '#7AF0A0', '#B48CFF', '#FF9A4D'];
  /* one little screen's picture at time t; i picks what it shows (bars, a wave, a video, falling blocks, a radar, a ticker). Painted still into the cached picture (t = 0), then live from townDynamic. */
  const screen = function(c, i, x, y, w, h, t){
    const k = i % 6;
    c.save(); c.beginPath(); c.rect(x, y, w, h); c.clip();
    tRect(c, k === 2 ? '#FFD84D' : k === 5 ? '#FF9A4D' : '#0E1A28', x, y, w, h);
    if (k === 0){ const bw = w / 6; for (let j = 0; j < 6; j++){ const a = 0.2 + 0.7 * Math.abs(Math.sin(t * 2.6 + j * 1.3)); tRect(c, SCR[0], x + j * bw + 2, y + h - a * (h - 4), bw - 4, a * (h - 4)); } }
    else if (k === 1){ c.strokeStyle = SCR[1]; c.lineWidth = 2; c.beginPath(); for (let j = 0; j <= w; j += 3){ const yy = y + h / 2 + Math.sin(j * 0.24 + t * 4) * h * 0.3 * Math.sin(j * 0.06 + 1); j ? c.lineTo(x + j, yy) : c.moveTo(x + j, yy); } c.stroke(); tRect(c, 'rgba(255,255,255,.12)', x, y + h / 2, w, 1); }
    else if (k === 2){ tPoly(c, '#2A1A0A', [x + w * 0.38, y + h * 0.2, x + w * 0.38, y + h * 0.62, x + w * 0.66, y + h * 0.41]); tRect(c, 'rgba(0,0,0,.25)', x + 4, y + h - 7, w - 8, 3); tRect(c, '#C8283C', x + 4, y + h - 7, (w - 8) * ((t * 0.12) % 1), 3); }
    else if (k === 3){ const bw = w / 4, bh = Math.max(4, h * 0.17); for (let j = 0; j < 4; j++){ if (j !== 2) tRect(c, SCR[3], x + j * bw + 1.5, y + h - bh - 1, bw - 3, bh); if (j < 2) tRect(c, '#4AB070', x + j * bw + 1.5, y + h - bh * 2 - 2, bw - 3, bh); }
      tRect(c, '#FFD84D', x + 2 * bw + 1.5, y + 2 + ((t * 0.8) % 1) * (h - bh * 2 - 6), bw - 3, bh); }
    else if (k === 4){ const cx = x + w / 2, cy = y + h / 2, R = Math.min(w, h) * 0.42; c.strokeStyle = 'rgba(180,140,255,.5)'; c.lineWidth = 1; [R, R * 0.6, R * 0.25].forEach(function(r){ c.beginPath(); c.arc(cx, cy, r, 0, TAU); c.stroke(); });
      const a = t * 2.4; c.strokeStyle = '#B48CFF'; c.lineWidth = 2; c.beginPath(); c.moveTo(cx, cy); c.lineTo(cx + Math.cos(a) * R, cy + Math.sin(a) * R); c.stroke(); tCircle(c, '#7AF0A0', cx + R * 0.5, cy - R * 0.3, 2); }
    else { for (let r = 0; r < 3; r++){ const ry = y + 4 + r * (h / 3), off = (t * (14 + r * 7) + r * 11) % w; tRect(c, '#2A1A0A', x + off - w, ry, w * 0.7, 3); tRect(c, '#2A1A0A', x + off, ry, w * 0.4, 3); tRect(c, 'rgba(42,26,10,.5)', x + 3, ry + 6, w * 0.5, 2); } }
    tRect(c, 'rgba(255,255,255,.2)', x, y, w, Math.max(3, h * 0.07));
    c.restore();
  };
  const bezel = function(c, x, y, w, h, i, t){ tRect(c, '#0A1018', x, y, w, h); screen(c, i, x + 3, y + 3, w - 6, h - 10, t); tRect(c, '#243448', x + w / 2 - 9, y + h - 5, 18, 2.5); tCircle(c, '#4DD8FF', x + w - 7, y + h - 4, 1.2); };
  /* the stock: a phone, a case of earbuds, a camera, a torch, a pair of goggles; standing on y = by */
  const icon = function(c, fam, cx, by, col){
    if (fam === 'phone'){ tRound(c, '#12202E', cx - 11, by - 34, 22, 34, 4); tRound(c, col, cx - 9, by - 31, 18, 25, 2); tRect(c, 'rgba(255,255,255,.4)', cx - 9, by - 31, 18, 4); tCircle(c, '#0A1018', cx, by - 3, 1.3); }
    else if (fam === 'buds'){ tRound(c, '#E8F0F4', cx - 14, by - 17, 28, 17, 7); tRect(c, 'rgba(0,0,0,.18)', cx - 14, by - 11, 28, 2); tCircle(c, col, cx, by - 5, 2); tEll(c, '#F4F8FA', cx - 7, by - 21, 3.2, 4.4); tEll(c, '#F4F8FA', cx + 7, by - 21, 3.2, 4.4); tRect(c, '#C9D2DC', cx - 8, by - 19, 2, 3); tRect(c, '#C9D2DC', cx + 6, by - 19, 2, 3); }
    else if (fam === 'cam'){ tRound(c, '#2A3340', cx - 17, by - 22, 34, 22, 4); tRect(c, '#2A3340', cx - 10, by - 27, 12, 6); tRect(c, '#1A222C', cx - 17, by - 14, 7, 14); tCircle(c, '#0A1018', cx + 2, by - 11, 8); tCircle(c, col, cx + 2, by - 11, 5); tCircle(c, 'rgba(255,255,255,.65)', cx, by - 13.5, 1.8); tRect(c, '#E8F0F4', cx + 9, by - 20, 6, 4); }
    else if (fam === 'torch'){ tRound(c, '#12202E', cx - 4, by - 26, 8, 26, 2); tRect(c, col, cx - 4, by - 17, 8, 3); tRect(c, '#C9CDD9', cx - 7, by - 34, 14, 9); tRect(c, '#FFF2B0', cx - 6, by - 36, 12, 3); tCircle(c, '#FF6A6A', cx, by - 8, 1.4); }
    else { tRect(c, '#2A3340', cx - 20, by - 18, 8, 5); tRect(c, '#2A3340', cx + 12, by - 18, 8, 5); tRound(c, '#12202E', cx - 18, by - 24, 36, 18, 6); tCircle(c, '#0A1018', cx - 8, by - 15, 8); tCircle(c, '#0A1018', cx + 8, by - 15, 8); tCircle(c, col, cx - 8, by - 15, 5.4); tCircle(c, col, cx + 8, by - 15, 5.4); tCircle(c, 'rgba(255,255,255,.6)', cx - 10, by - 17, 1.6); tCircle(c, 'rgba(255,255,255,.6)', cx + 6, by - 17, 1.6); }
  };
  const FAM = ['phone', 'buds', 'cam', 'torch', 'goggles'];
  /* what hangs on the pegboard's hooks */
  const peg = function(c, k, hx, hy, col){
    tRect(c, '#9AA8B8', hx - 1, hy, 2, 8); hy += 8;
    if (k === 0){ c.strokeStyle = col; c.lineWidth = 3; c.beginPath(); c.arc(hx, hy + 11, 10, 0, TAU); c.stroke(); c.lineWidth = 2; c.beginPath(); c.arc(hx, hy + 11, 5, 0, TAU); c.stroke(); tRect(c, '#E8F0F4', hx - 3, hy + 21, 6, 7); }
    else if (k === 1){ c.strokeStyle = col; c.lineWidth = 1.6; c.beginPath(); c.moveTo(hx, hy); c.bezierCurveTo(hx - 12, hy + 14, hx - 12, hy + 24, hx - 8, hy + 28); c.moveTo(hx, hy); c.bezierCurveTo(hx + 12, hy + 14, hx + 12, hy + 24, hx + 8, hy + 28); c.stroke(); tCircle(c, '#E8F0F4', hx - 8, hy + 30, 3); tCircle(c, '#E8F0F4', hx + 8, hy + 30, 3); }
    else if (k === 2){ tRound(c, '#E8F0F4', hx - 9, hy, 18, 24, 3); tRect(c, '#C9D2DC', hx - 4, hy + 24, 3, 6); tRect(c, '#C9D2DC', hx + 1, hy + 24, 3, 6); tRect(c, col, hx - 9, hy + 12, 18, 3); }
    else { c.strokeStyle = '#2A3340'; c.lineWidth = 4; c.beginPath(); c.arc(hx, hy + 14, 12, Math.PI, 0); c.stroke(); tRound(c, col, hx - 15, hy + 12, 8, 14, 3); tRound(c, col, hx + 7, hy + 12, 8, 14, 3); }
  };
  const pb = townBuilding;
  townBuilding = function(c, D, b, P, r){
    if (b.kind !== 'electro') return pb(c, D, b, P, r);
    const x = b.x, W = b.w, h = b.h, x0 = x - W / 2, top = TG - h, rb = top - 14, dx = x0 + W - 58;
    c.save();
    tRect(c, '#27384A', x0, top, W, h);
    for (let i = 1; i < 6; i++) tRect(c, 'rgba(0,0,0,.16)', x0 + i * (W / 6), top + 14, 1.5, h - 26);                                                     /* panel seams */
    tRect(c, '#1A2634', x0, top, W, 14); tRect(c, '#0E1722', x0 - 6, rb, W + 12, 18); tRect(c, '#3A506A', x0 - 6, rb, W + 12, 3);                          /* the parapet and its coping */
    tRect(c, '#1A2634', x0, TG - 12, W, 12); tRect(c, 'rgba(255,255,255,.06)', x0, TG - 12, W, 2);                                                         /* the plinth */
    tRect(c, '#4A5C72', x0 + 238, rb - 22, 50, 22); tRect(c, '#5E7390', x0 + 238, rb - 22, 50, 3); tCircle(c, '#2A3644', x0 + 253, rb - 11, 8); tCircle(c, '#4A5C72', x0 + 253, rb - 11, 2.5);
    for (let i = 0; i < 4; i++) tRect(c, '#2A3644', x0 + 267, rb - 18 + i * 4, 17, 2);                                                                      /* the air conditioner on the roof */
    tRect(c, '#8A9AB0', x0 + 184, rb - 48, 2, 48); tRect(c, '#8A9AB0', x0 + 176, rb - 38, 18, 2); tRect(c, '#8A9AB0', x0 + 179, rb - 28, 12, 2); tCircle(c, '#5A1A22', x0 + 185, rb - 50, 3);   /* the aerial; its lamp blinks (townDynamic) */
    c.strokeStyle = '#0A1018'; c.lineWidth = 2; c.beginPath(); c.moveTo(x0 + 185, rb - 24); c.quadraticCurveTo(x0 + 212, rb + 2, x0 + 238, rb - 12); c.stroke();
    c.strokeStyle = '#FFD84D'; c.lineWidth = 4; c.beginPath(); c.moveTo(x0 + 202, rb); c.lineTo(x0 + 218, rb - 26); c.lineTo(x0 + 210, rb - 26); c.lineTo(x0 + 222, rb - 50); c.stroke();   /* a lightning bolt on the roof */
    tRect(c, '#3A506A', x0 + 5, top + 14, 3, h - 26); tRect(c, '#4A5C72', x0 + W - 8, top + 14, 4, h - 26);                                                /* the cable duct and the downpipe */
    for (let y = top + 30; y < TG - 20; y += 38){ tRect(c, '#5E7390', x0 + 4, y, 5, 3); tRect(c, '#6A7E98', x0 + W - 9, y, 6, 3); }
    tAwning(c, x0 + 6, top + 28, W - 12, 18, '#F2C230', '#2F7A8A');                                                                                        /* the awning, scalloped */
    tWin(c, D, x0 + 22, top + 74, 150, 100, '#1A2A3C');                                                                                                     /* the window: a wall of little screens */
    tRect(c, '#52687E', x0 + 20, top + 72, 154, 2); tRect(c, '#52687E', x0 + 20, top + 174, 154, 2); tRect(c, '#52687E', x0 + 20, top + 72, 2, 104); tRect(c, '#52687E', x0 + 172, top + 72, 2, 104);
    for (let i = 0; i < 6; i++) bezel(c, x0 + 28 + (i % 3) * 46, top + 80 + Math.floor(i / 3) * 44, 42, 38, i, 0);
    tCircle(c, '#C8283C', x0 + 164, top + 167, 7); ivText(c, '%', x0 + 164, top + 171, 11, '#FFFFFF');                                                      /* a sale sticker on the glass */
    tRect(c, '#52687E', x0 + 14, top + 176, 166, 6); tRect(c, 'rgba(0,0,0,.25)', x0 + 14, top + 182, 166, 4);                                               /* the sill */
    tRect(c, '#1F2D3C', x0 + 22, top + 188, 150, TG - 12 - (top + 188));
    for (let i = 0; i < 6; i++) tRect(c, '#0E1722', x0 + 34 + i * 22, top + 195, 14, 3);                                                                    /* the vents under the window */
    tRound(c, '#0E1722', dx - 53, TG - 103, 106, 103, 6); tRound(c, '#1A2A3C', dx - 50, TG - 100, 100, 100, 5);                                             /* the glass doors */
    tPoly(c, 'rgba(255,255,255,.12)', [dx - 44, TG - 94, dx - 16, TG - 94, dx - 44, TG - 56]); tPoly(c, 'rgba(255,255,255,.1)', [dx + 6, TG - 94, dx + 30, TG - 94, dx + 6, TG - 62]);
    tRect(c, 'rgba(0,0,0,.4)', dx - 1, TG - 98, 2, 98); tRect(c, '#4DD8FF', dx - 9, TG - 84, 4, 60); tRect(c, '#4DD8FF', dx + 5, TG - 84, 4, 60);
    c.strokeStyle = 'rgba(122,232,255,.8)'; c.lineWidth = 2; [6, 10, 14].forEach(function(rr){ c.beginPath(); c.arc(dx - 26, TG - 58, rr, Math.PI * 1.25, Math.PI * 1.75); c.stroke(); }); tCircle(c, '#7AE8FF', dx - 26, TG - 58, 2);   /* a wi-fi sticker */
    tRound(c, '#0E1722', dx - 36, top + 78, 72, 26, 5); tRect(c, '#4DD8FF', dx - 32, top + 80, 64, 1.5); ivText(c, 'OPEN', dx, top + 98, 16, '#B04870');                  /* the OPEN sign (it hums in townDynamic) */
    tRound(c, '#0E1722', dx - 46, TG - 5, 92, 5, 2); tRect(c, '#2F7A8A', dx - 40, TG - 3, 80, 1.5);                                                          /* the doormat */
    tRound(c, '#0E1722', x0 + 14, top - 40, 160, 34, 6); c.save(); c.shadowColor = '#4DD8FF'; c.shadowBlur = 12; tSign(c, 'VOLT & CO.', x0 + 94, top - 23, 150, '#0E1722', '#7AE8FF'); c.restore();
    c.restore();
  };
  const ivk = IV_KINDS;
  ivk.gcounter = function(c, D, b){
    const x0 = b.x - b.w / 2, W = b.w, cw = (W - 28) / 5 - 8;
    ivShadow(c, b.x, W + 20);
    tRect(c, '#34485E', x0, TG - 100, W, 100); tRect(c, 'rgba(255,255,255,.08)', x0, TG - 100, W, 4); tRect(c, '#1A2634', x0, TG - 10, W, 10);
    tRound(c, '#52687E', x0 - 10, TG - 112, W + 20, 14, 4);
    for (let i = 0; i < 5; i++){ const px = x0 + 14 + i * ((W - 28) / 5);
      tRect(c, '#0E1722', px, TG - 88, cw, 62); tRect(c, '#243448', px, TG - 32, cw, 6); icon(c, FAM[i], px + cw / 2, TG - 32, SCR[i]);                  /* the glass case: one of each, on a cushion */
      tPoly(c, 'rgba(255,255,255,.09)', [px, TG - 88, px + cw * 0.5, TG - 88, px, TG - 40]); tRect(c, 'rgba(122,232,255,.5)', px, TG - 26, cw, 1.5); }
    tRect(c, '#C9CDD9', x0 + 30, TG - 140, 8, 28); tRound(c, '#0E1722', x0 + 10, TG - 188, 48, 52, 5); tRect(c, '#4DD8FF', x0 + 14, TG - 184, 40, 38);                        /* the till screen */
    tRect(c, '#0E1A28', x0 + 18, TG - 180, 32, 30); for (let i = 0; i < 4; i++) tRect(c, i === 3 ? '#7AF0A0' : '#4DD8FF', x0 + 21, TG - 177 + i * 6, i === 3 ? 14 : 26 - i * 5, 3);
    tRect(c, '#E8F0F4', x0 + 20, TG - 118, 28, 5);                                                                                                         /* a receipt tray */
    tCircle(c, '#9AA8B8', x0 + 96, TG - 114, 9); tRect(c, '#0E1722', x0 + 84, TG - 114, 24, 3); tRect(c, '#C9CDD9', x0 + 95, TG - 125, 2, 3);                  /* the service bell */
    tPoly(c, '#F4EEDC', [x0 + 134, TG - 112, x0 + 168, TG - 112, x0 + 164, TG - 146, x0 + 138, TG - 146]); ivText(c, 'ASK', x0 + 151, TG - 131, 9, '#1A2634'); ivText(c, 'VOLT', x0 + 151, TG - 119, 10, '#1A2634');   /* a tent card */
    tRound(c, '#2A3340', x0 + 186, TG - 134, 18, 22, 3); tRect(c, '#4DD8FF', x0 + 189, TG - 131, 12, 6); for (let i = 0; i < 6; i++) tRect(c, '#9AA8B8', x0 + 189 + (i % 3) * 4, TG - 122 + Math.floor(i / 3) * 4, 3, 3);   /* the card reader */
    tRound(c, '#E8F0F4', x0 + W - 110, TG - 138, 38, 26, 4); tRect(c, '#2A3A4A', x0 + W - 106, TG - 134, 30, 14); tCircle(c, '#FF6A6A', x0 + W - 91, TG - 120, 2.5);                    /* a boxed gadget */
    tRound(c, '#E8F0F4', x0 + W - 66, TG - 134, 44, 22, 4); tRect(c, '#FFD84D', x0 + W - 62, TG - 130, 36, 8);
    tRect(c, '#C9CDD9', x0 + W - 20, TG - 120, 8, 8); tRect(c, '#8A9AB0', x0 + W - 18, TG - 123, 4, 3);
  };
  ivk.gshelf = function(c, D, b){
    const x0 = b.x - b.w / 2, W = b.w, top = TG - b.h, step = (W - 24) / 4;
    ivShadow(c, b.x, W + 10);
    tRect(c, '#3A4A60', x0, top, W, b.h); tRect(c, '#1A2634', x0, TG - 10, W, 10); tRect(c, '#2A3A50', x0, top, 4, b.h); tRect(c, '#2A3A50', x0 + W - 4, top, 4, b.h);
    tRect(c, '#0E1722', x0, top, W, 38); tRect(c, '#4DD8FF', x0, top + 36, W, 2);                    /* the sign across the top, so the word has something to stand on */
    const rows = [['phone', 0], ['buds', 1], ['cam', 2], ['torch', 3]];
    for (let r = 0; r < 4; r++){ const y = top + 78 + r * 46; tRect(c, '#52687E', x0 + 4, y, W - 8, 5); tRect(c, 'rgba(122,232,255,.35)', x0 + 4, y + 5, W - 8, 1.5);     /* a rail with a light under it */
      for (let k = 0; k < 4; k++){ const cx = x0 + 12 + k * step + step / 2 - 4, fam = r === 3 ? (k % 2 ? 'goggles' : 'torch') : rows[r][0], col = SCR[(r * 2 + k) % 6];
        icon(c, fam, cx, y, col); tRect(c, '#F4EEDC', cx - 8, y + 6, 16, 6); tRect(c, k % 2 ? '#C8283C' : '#2FA060', cx - 6, y + 8, 5, 2); tRect(c, '#9AA8B8', cx, y + 8, 6, 2); } }          /* the stock, and a price tag under each */
    c.save(); c.shadowColor = '#4DD8FF'; c.shadowBlur = 8; ivText(c, 'GADGETS', b.x, top + 26, 18, '#7AE8FF'); c.restore();
  };
  ivk.tvwall = function(c, D, b){
    const x0 = b.x - b.w / 2, W = b.w, top = TG - b.h;
    ivShadow(c, b.x, W);
    tRect(c, '#1A2634', x0, top + 30, W, b.h - 30); tRect(c, '#101822', x0, TG - 10, W, 10);
    tRect(c, '#2A3A50', x0 + 6, top + 36, W - 12, 3); tRect(c, '#2A3A50', x0 + 6, top + 134, W - 12, 3);                                                    /* the mounting rails */
    for (let i = 0; i < 6; i++) bezel(c, x0 + 14 + (i % 3) * 92, top + 44 + Math.floor(i / 3) * 96, 86, 88, i, 0);
    tRound(c, '#0E1722', x0 + 30, TG - 34, W - 60, 14, 4); for (let i = 0; i < 18; i++) tCircle(c, '#243448', x0 + 42 + i * ((W - 84) / 17), TG - 27, 1.6);   /* a sound bar */
  };
  IV_ROOMS.electro = function(c, D){
    const W = D.w;
    for (let x = 40; x < W; x += 56) tRect(c, 'rgba(80,200,220,.07)', x, 40, 2, TG - 130);                       /* cable trunking down the wall */
    tRect(c, '#0E1722', 0, 40, W, 10); tRect(c, '#4DD8FF', 0, 48, W, 2);
    tRect(c, '#52687E', 280, 52, 1080, 4);                                                                       /* the lighting track, and a spotlight over each fixture */
    [420, 760, 1180].forEach(function(sx){ tRect(c, '#12202E', sx - 7, 56, 14, 10); tPoly(c, '#12202E', [sx - 7, 66, sx + 7, 66, sx + 5, 72, sx - 5, 72]); tRect(c, '#FFF2B0', sx - 4, 72, 8, 2); });
    c.save(); c.shadowColor = '#4DD8FF'; c.shadowBlur = 16; tRound(c, '#0E1722', W / 2 - 150, 78, 300, 56, 8); ivText(c, 'VOLT & CO.', W / 2, 116, 34, '#7AE8FF'); c.restore();
    /* posters: a phone, headphones, a bolt, each with a red banner for its word */
    [[200, '#FF6AA8', 0], [535, '#FFD84D', 1], [960, '#7AF0A0', 2]].forEach(function(p){ const px = p[0];
      tRect(c, '#0A1018', px, 160, 60, 84); tRect(c, p[1], px + 4, 164, 52, 54);
      if (p[2] === 0){ tRound(c, '#12202E', px + 20, 170, 20, 40, 4); tRect(c, 'rgba(255,255,255,.5)', px + 23, 174, 14, 30); }
      else if (p[2] === 1){ c.strokeStyle = '#12202E'; c.lineWidth = 5; c.beginPath(); c.arc(px + 30, 196, 15, Math.PI, 0); c.stroke(); tRound(c, '#12202E', px + 11, 194, 10, 16, 3); tRound(c, '#12202E', px + 39, 194, 10, 16, 3); }
      else { c.strokeStyle = '#12202E'; c.lineWidth = 5; c.beginPath(); c.moveTo(px + 34, 168); c.lineTo(px + 22, 194); c.lineTo(px + 32, 194); c.lineTo(px + 24, 214); c.stroke(); }
      tRect(c, '#C8283C', px + 4, 220, 52, 20); ivText(c, 'SALE', px + 30, 235, 14, '#FFFFFF'); });
    tRect(c, '#2B3C52', 620, 150, 280, 190); tRect(c, '#12202E', 620, 150, 280, 4); tRect(c, '#12202E', 620, 336, 280, 4);                                    /* the pegboard over the counter */
    for (let gx = 632; gx < 900; gx += 14) for (let gy = 166; gy < 330; gy += 14) tCircle(c, 'rgba(255,255,255,.1)', gx, gy, 1.2);
    for (let k = 0; k < 6; k++){ peg(c, k % 4, 646 + k * 44, 160, SCR[k]); peg(c, (k + 2) % 4, 668 + k * 44 - 22, 246, SCR[(k + 3) % 6]); }
    tRect(c, '#A98A5A', 176, 266, 114, 104); tRect(c, '#6A4A2A', 176, 266, 114, 4); tRect(c, '#6A4A2A', 176, 366, 114, 4); tRect(c, '#6A4A2A', 176, 266, 4, 104); tRect(c, '#6A4A2A', 286, 266, 4, 104);   /* a cork board of notices */
    [[186, 278, '#FFFFFF'], [226, 282, '#FFE9A8'], [252, 276, '#FFB8D0'], [190, 326, '#B8E8FF'], [232, 330, '#FFFFFF']].forEach(function(n){ tRect(c, n[2], n[0], n[1], 30, 38); tRect(c, 'rgba(0,0,0,.25)', n[0] + 4, n[1] + 10, 22, 2); tRect(c, 'rgba(0,0,0,.18)', n[0] + 4, n[1] + 17, 18, 2); tRect(c, 'rgba(0,0,0,.18)', n[0] + 4, n[1] + 24, 20, 2); tCircle(c, '#C8283C', n[0] + 15, n[1] + 4, 2.4); });
    tCircle(c, '#0E1722', 330, 150, 27); tCircle(c, '#F4F8FA', 330, 150, 23); for (let i = 0; i < 12; i++){ const a = i / 12 * TAU; tRect(c, '#1A2634', 330 + Math.cos(a) * 19 - 1, 150 + Math.sin(a) * 19 - 1, 2, 2); }   /* the wall clock; its hands move (townDynamic) */
    const lx = 975, lt = TG - 150;                                                                                  /* the charging lockers */
    ivShadow(c, lx, 80); tRect(c, '#2E4258', lx - 36, lt, 72, 150); tRect(c, '#3A506A', lx - 36, lt, 72, 4); tRect(c, '#12202E', lx - 36, TG - 8, 72, 8);
    tRect(c, '#0E1A28', lx - 30, lt + 10, 60, 14); tRect(c, '#4DD8FF', lx - 26, lt + 14, 30, 2); tRect(c, '#7AF0A0', lx - 26, lt + 18, 14, 2);
    for (let i = 0; i < 6; i++){ const bx = lx - 30 + (i % 2) * 31, by = lt + 32 + Math.floor(i / 3) * 0; tRound(c, '#1F3046', bx, lt + 30 + Math.floor(i / 2) * 36, 29, 32, 3); tRect(c, '#5E7390', bx + 22, lt + 44 + Math.floor(i / 2) * 36, 3, 6); tCircle(c, '#3A506A', bx + 6, lt + 36 + Math.floor(i / 2) * 36, 2); }
    const bx = 1372;                                                                                                /* the e-waste bin */
    ivShadow(c, bx, 44); tRect(c, '#2A7A4A', bx - 18, TG - 54, 36, 54); tRect(c, '#1A5A34', bx - 21, TG - 60, 42, 8); tRect(c, 'rgba(255,255,255,.12)', bx - 18, TG - 54, 6, 54);
    tPoly(c, '#F4F8FA', [bx, TG - 42, bx + 8, TG - 28, bx - 8, TG - 28]); tCircle(c, '#2A7A4A', bx, TG - 33, 3);
    tRect(c, '#52687E', 0, TG - 100, W, 6); tRect(c, 'rgba(255,255,255,.07)', 0, TG - 94, W, 4);
    tEll(c, '#1B3A4C', 760, TG + 34, 190, 17); tEll(c, 'rgba(77,216,255,.35)', 760, TG + 34, 176, 13); tEll(c, '#1B3A4C', 760, TG + 34, 168, 11);     /* a rug in front of the counter, with a ring */
    tRect(c, '#E8B820', 880, TG + 52, 160, 8); for (let i = 0; i < 16; i++) tPoly(c, '#12202E', [880 + i * 10, TG + 52, 880 + i * 10 + 5, TG + 52, 880 + i * 10 + 2, TG + 60, 880 + i * 10 - 3, TG + 60]);   /* a cable cover on the floor */
  };
  /* what moves: the screens (the window and the wall), the OPEN sign, the aerial's lamp, the clock and the lockers' lights */
  const dy = townDynamic;
  townDynamic = function(ctx, D, t, dark){
    dy.apply(this, arguments);
    if (D.id === 'market'){
      const b = D.b.find(function(q){ return q.id === 'electro'; }); if (!b) return;
      const x0 = b.x - b.w / 2, top = TG - b.h, dx = x0 + b.w - 58;
      for (let i = 0; i < 6; i++) bezel(ctx, x0 + 28 + (i % 3) * 46, top + 80 + Math.floor(i / 3) * 44, 42, 38, i, t + i * 0.7);
      const fl = Math.sin(t * 40) > 0.97 + 0.02 * Math.sin(t) ? 0.25 : 1;                                       /* now and then the sign stutters */
      if (dark > 0.03){                                                                                          /* after dark the screens and the sign light the pavement */
        ctx.save(); ctx.globalCompositeOperation = 'lighter';
        ctx.fillStyle = 'rgba(120,220,255,' + (dark * 0.1).toFixed(2) + ')'; ctx.fillRect(x0 + 24, top + 76, 146, 96);
        ctx.fillStyle = 'rgba(77,216,255,' + (dark * 0.07).toFixed(2) + ')'; ctx.beginPath(); ctx.moveTo(x0 + 10, TG - 14); ctx.lineTo(x0 + b.w - 10, TG - 14); ctx.lineTo(x0 + b.w + 40, TG + 40); ctx.lineTo(x0 - 30, TG + 40); ctx.closePath(); ctx.fill();
        ctx.restore();
      }
      tRound(ctx, 'rgba(255,106,168,' + (0.2 * fl * (1 + dark)) + ')', dx - 40, top + 74, 80, 34, 9); ivText(ctx, 'OPEN', dx, top + 98, 16, fl > 0.5 ? '#FFB0D0' : '#B04870');
      if (Math.floor(t * 1.2) % 2 === 0){ tCircle(ctx, 'rgba(255,60,60,.35)', x0 + 185, top - 64, 7); tCircle(ctx, '#FF4A4A', x0 + 185, top - 64, 3); }
    } else if (D.id === 'in_electro'){
      const tb = D.b.find(function(q){ return q.id === 'tvwall'; });
      if (tb){ const x0 = tb.x - tb.w / 2, top = TG - tb.h; for (let i = 0; i < 6; i++) bezel(ctx, x0 + 14 + (i % 3) * 92, top + 44 + Math.floor(i / 3) * 96, 86, 88, i, t + i * 0.9); }
      const h = townHour(), a1 = (h % 1) * TAU - Math.PI / 2, a2 = (h % 12) / 12 * TAU - Math.PI / 2;
      ctx.strokeStyle = '#1A2634'; ctx.lineCap = 'round'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(330, 150); ctx.lineTo(330 + Math.cos(a2) * 12, 150 + Math.sin(a2) * 12); ctx.stroke();
      ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(330, 150); ctx.lineTo(330 + Math.cos(a1) * 18, 150 + Math.sin(a1) * 18); ctx.stroke(); tCircle(ctx, '#C8283C', 330, 150, 2); ctx.lineCap = 'butt';
      const lt = TG - 150;
      for (let i = 0; i < 6; i++){ const bx = 975 - 30 + (i % 2) * 31, by = lt + 36 + Math.floor(i / 2) * 36, ph = (Math.floor(t * 0.5 + i * 0.7) % 3); tCircle(ctx, ph === 0 ? '#FFB84D' : '#7AF0A0', bx + 6, by, 2); }
    }
  };
})();
