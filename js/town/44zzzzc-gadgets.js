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
  const pb = townBuilding;
  townBuilding = function(c, D, b, P, r){
    if (b.kind !== 'electro') return pb(c, D, b, P, r);
    const x = b.x, W = b.w, h = b.h, x0 = x - W / 2, top = TG - h;
    c.save();
    tRect(c, '#27384A', x0, top, W, h); tRect(c, '#1A2634', x0, top, W, 14); tRect(c, '#0E1722', x0 - 6, top - 14, W + 12, 18);
    for (let i = 0; i < 8; i++) tRect(c, i % 2 ? '#2F7A8A' : '#F2C230', x0 + 6 + i * ((W - 12) / 8), top + 34, (W - 12) / 8, 18);            /* the striped awning, in teal and yellow */
    tRect(c, 'rgba(0,0,0,.2)', x0 + 6, top + 52, W - 12, 5);
    tWin(c, D, x0 + 22, top + 74, 150, 100, '#1A2A3C');                                                                                                  /* the window: a wall of little screens */
    const cols = ['#4DD8FF', '#FF6AA8', '#FFD84D', '#7AF0A0', '#B48CFF', '#FF9A4D'];
    for (let i = 0; i < 6; i++){ const sx = x0 + 28 + (i % 3) * 46, sy = top + 80 + Math.floor(i / 3) * 44; tRect(c, '#0A1018', sx, sy, 42, 38); tRect(c, cols[i], sx + 3, sy + 3, 36, 28); tRect(c, 'rgba(255,255,255,.35)', sx + 3, sy + 3, 36, 5); tRect(c, '#0A1018', sx + 12, sy + 32, 18, 3); }
    tDoor(c, x0 + W - 58, 54, 100, '#1A2A3C'); tRect(c, '#4DD8FF', x0 + W - 80, TG - 86, 4, 70);
    tRound(c, '#0E1722', x0 + 14, top - 40, 160, 34, 6); c.save(); c.shadowColor = '#4DD8FF'; c.shadowBlur = 12; tSign(c, 'VOLT & CO.', x0 + 94, top - 23, 150, '#0E1722', '#7AE8FF'); c.restore();
    c.strokeStyle = '#FFD84D'; c.lineWidth = 3; c.beginPath(); c.moveTo(x + 50, top - 14); c.lineTo(x + 66, top - 40); c.lineTo(x + 58, top - 40); c.lineTo(x + 70, top - 64); c.stroke();   /* a lightning bolt on the roof */
    c.restore();
  };
  const ivk = IV_KINDS;
  ivk.gcounter = function(c, D, b){
    const x0 = b.x - b.w / 2, W = b.w;
    ivShadow(c, b.x, W + 20);
    tRect(c, '#34485E', x0, TG - 100, W, 100); tRect(c, 'rgba(255,255,255,.08)', x0, TG - 100, W, 4); tRect(c, '#1A2634', x0, TG - 10, W, 10);
    tRound(c, '#52687E', x0 - 10, TG - 112, W + 20, 14, 4);
    for (let i = 0; i < 5; i++){ const px = x0 + 14 + i * ((W - 28) / 5); tRect(c, '#0E1722', px, TG - 88, (W - 28) / 5 - 8, 62); tRect(c, ['#4DD8FF', '#FF6AA8', '#FFD84D', '#7AF0A0', '#B48CFF'][i], px + 4, TG - 82, (W - 28) / 5 - 16, 8); }
    tRect(c, '#C9CDD9', x0 + 30, TG - 140, 8, 28); tRound(c, '#0E1722', x0 + 10, TG - 188, 48, 52, 5); tRect(c, '#4DD8FF', x0 + 14, TG - 184, 40, 38);                        /* the till screen */
    tRound(c, '#E8F0F4', x0 + W - 110, TG - 138, 38, 26, 4); tRect(c, '#2A3A4A', x0 + W - 106, TG - 134, 30, 14); tCircle(c, '#FF6A6A', x0 + W - 91, TG - 120, 2.5);                    /* a boxed gadget */
    tRound(c, '#E8F0F4', x0 + W - 66, TG - 134, 44, 22, 4); tRect(c, '#FFD84D', x0 + W - 62, TG - 130, 36, 8);
  };
  ivk.gshelf = function(c, D, b){
    const x0 = b.x - b.w / 2, W = b.w, top = TG - b.h;
    ivShadow(c, b.x, W + 10);
    tRect(c, '#3A4A60', x0, top, W, b.h); tRect(c, '#1A2634', x0, top, W, 8); tRect(c, '#1A2634', x0, TG - 10, W, 10);
    for (let r = 0; r < 4; r++){ const y = top + 44 + r * 54; tRect(c, '#52687E', x0 + 4, y, W - 8, 5);
      for (let k = 0; k < 4; k++){ const bx = x0 + 12 + k * ((W - 24) / 4), col = ['#E8F0F4', '#FFD84D', '#7AE8FF', '#FF9AB8'][(r + k) % 4]; tRound(c, col, bx, y - 34, (W - 24) / 4 - 8, 34, 4); tRect(c, 'rgba(0,0,0,.2)', bx + 4, y - 26, (W - 24) / 4 - 16, 6); tRect(c, 'rgba(0,0,0,.14)', bx + 4, y - 14, (W - 24) / 4 - 22, 4); } }
    ivText(c, 'GADGETS', b.x, top + 26, 16, '#7AE8FF');
  };
  ivk.tvwall = function(c, D, b){
    const x0 = b.x - b.w / 2, W = b.w, top = TG - b.h;
    ivShadow(c, b.x, W);
    tRect(c, '#1A2634', x0, top + 30, W, b.h - 30); tRect(c, '#101822', x0, TG - 10, W, 10);
    const cols = ['#4DD8FF', '#FF6AA8', '#FFD84D', '#7AF0A0', '#B48CFF', '#FF9A4D'];
    for (let i = 0; i < 6; i++){ const sx = x0 + 14 + (i % 3) * 92, sy = top + 44 + Math.floor(i / 3) * 96; tRect(c, '#0A1018', sx, sy, 86, 88); tRect(c, cols[(i * 2) % 6], sx + 5, sy + 5, 76, 66); tRect(c, 'rgba(255,255,255,.25)', sx + 5, sy + 5, 76, 10); tRect(c, '#0A1018', sx + 30, sy + 76, 26, 5); }
  };
  IV_ROOMS.electro = function(c, D){
    const W = D.w;
    for (let x = 40; x < W; x += 56) tRect(c, 'rgba(80,200,220,.07)', x, 40, 2, TG - 130);                       /* cable trunking down the wall */
    tRect(c, '#0E1722', 0, 40, W, 10); tRect(c, '#4DD8FF', 0, 48, W, 2);
    c.save(); c.shadowColor = '#4DD8FF'; c.shadowBlur = 16; tRound(c, '#0E1722', W / 2 - 150, 70, 300, 56, 8); ivText(c, 'VOLT & CO.', W / 2, 108, 34, '#7AE8FF'); c.restore();
    [[200, '#FF6AA8'], [640, '#FFD84D'], [1000, '#7AF0A0']].forEach(function(p){ tRect(c, '#0A1018', p[0], 150, 60, 80); tRect(c, p[1], p[0] + 4, 154, 52, 60); ivText(c, 'SALE', p[0] + 30, 222, 14, '#E8F0F4'); });
    tRect(c, '#52687E', 0, TG - 100, W, 6); tRect(c, 'rgba(255,255,255,.07)', 0, TG - 94, W, 4);
  };
})();
