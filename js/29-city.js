'use strict';
/* The Underground Giraffe City. */
/* ========================= THE UNDERGROUND GIRAFFE CITY (a trading post tab) ========================= */
/* Once she has flown home the City opens its market to her: upgrades for the ant colony paid in GRUBS (a new currency that drops from enemies once the
   City is found), trinkets, permanent stat upgrades paid in every other currency in the game, and a new card. Everything here is a row in CITY_ITEMS. */
const CITY_CUR = [['gold', 'gold', '#FFD27A'], ['gems', 'gems', '#7AD8FF'], ['basalt', 'basalt', '#AEB8E0'], ['sulfur', 'sulfur', '#F2D43A'], ['food', 'food', '#9AE08A'], ['grubs', 'grubs', '#E8D8A0'], ['iron', 'iron', '#E8785A'], ['argon', 'argon', '#B880FF']];
const GRUB_DROP = 0.04;                                                              /* chance an ordinary kill drops a grub once the City is found (bosses drop 5-8) */
const CITY_ITEMS = [
  /* ---- the Ant Academy: grubs, mostly ---- */
  { id: 'c_anthp',   grp: 'Ant Academy', icon: '@t-x-carapace', name: 'Thicker Shells',    desc: 'Every ant has 12% more health per level.',                 max: 10, cost: { grubs: 12 },             grow: 1.45 },
  { id: 'c_antdmg',  grp: 'Ant Academy', icon: '@t-x-mandible', name: 'Sharper Mandibles', desc: 'Every ant hits 12% harder per level.',               max: 10, cost: { grubs: 14 },             grow: 1.45 },
  { id: 'c_antspd',  grp: 'Ant Academy', icon: '@t-run', name: 'Quick Legs',         desc: 'Ants move 5% faster per level.',                          max: 8,  cost: { grubs: 10 },             grow: 1.4 },
  { id: 'c_antrate', grp: 'Ant Academy', icon: '@t-x-egg', name: 'Faster Hatching',    desc: 'Fallen ants return 6% sooner per level.',                 max: 8,  cost: { grubs: 16, food: 2 },    grow: 1.4 },
  { id: 'c_antcap',  grp: 'Ant Academy', icon: '@t-mountain', name: 'A Bigger Hill',    desc: 'Room for 2 more ants per level.',                          max: 5,  cost: { grubs: 40, food: 3 },    grow: 1.6 },
  { id: 'c_acid',    grp: 'Ant Academy', icon: '@t-flask-2', name: 'Explosive Acid',     desc: 'ABILITY (Shooter Ant). Its acid bursts where it lands, hurting everything nearby, and leaves a burning pool behind. Each level makes the burst and the pool bigger.', max: 4, cost: { grubs: 90, sulfur: 40 }, grow: 1.7 },
  { id: 'c_venom',   grp: 'Ant Academy', icon: '@t-skull', name: 'Venom Bite',       desc: 'ABILITY (Soldier Ant). Its bite poisons: the enemy keeps taking damage for a few seconds. Each level hurts more and lasts longer.', max: 4, cost: { grubs: 70, basalt: 30 }, grow: 1.6 },
  { id: 'c_sticky',  grp: 'Ant Academy', icon: '@t-x-drop:#E8A838', name: 'Sticky Blast',       desc: 'ABILITY (Distractor Ant). When it bursts, everything caught in the blast is slowed to half speed. Each level lasts longer.', max: 3, cost: { grubs: 60, gems: 500 }, grow: 1.6 },
  /* ---- trinkets ---- */
  { id: 't_lanternoil',  grp: 'Trinkets', icon: '@t-lamp-2', name: 'Lantern Oil',    trinket: 'lanternoil',  desc: 'Pickup range +20% and drops 10% more common.',          max: 1, cost: { gold: 2000000, sulfur: 120 } },
  { id: 't_echochime',   grp: 'Trinkets', icon: '@t-bell', name: 'Echo Chime',     trinket: 'echochime',   desc: 'Kick range +10% and critical chance +3%.',              max: 1, cost: { gems: 6000, basalt: 120 } },
  { id: 't_mosswreath',  grp: 'Trinkets', icon: '@t-x-wreath', name: 'Moss Wreath',    trinket: 'mosswreath',  desc: 'Regenerate 1.5 health per second.',                      max: 1, cost: { food: 20, gems: 3000 } },
  { id: 't_burrowboots', grp: 'Trinkets', icon: '@t-shoe', name: 'Burrow Boots',   trinket: 'burrowboots', desc: 'Move 6% faster and gain 6% more experience.',            max: 1, cost: { gold: 3000000, basalt: 80, grubs: 40 } },
  /* ---- the Cavern Market: permanent stats ---- */
  { id: 'c_dmg',  grp: 'Cavern Market', icon: '@t-x-anvil', name: 'Deep Forge',        desc: 'Weapon damage +4% per level.',        max: 10, cost: { gold: 300000, basalt: 20 }, grow: 1.5 },
  { id: 'c_hp',   grp: 'Cavern Market', icon: '@t-shield-half', name: 'Cavern Hide',    desc: 'Start every run with 12 more health per level.', max: 10, cost: { gems: 800, sulfur: 15 }, grow: 1.4 },
  { id: 'c_spd',  grp: 'Cavern Market', icon: '@t-x-echostep', name: 'Echo Step',         desc: 'Move speed +2% per level.',            max: 8,  cost: { gold: 400000, sulfur: 20 }, grow: 1.5 },
  { id: 'c_xp',   grp: 'Cavern Market', icon: '@t-x-book', name: 'Lantern Library',   desc: 'Experience gained +4% per level.',     max: 10, cost: { gems: 600, food: 3 }, grow: 1.4 },
  { id: 'c_gold', grp: 'Cavern Market', icon: '@t-x-ledger', name: 'Guild Ledger',      desc: 'Gold earned +5% per level.',           max: 10, cost: { gems: 700, basalt: 12 }, grow: 1.4 },
  { id: 'c_neck', grp: 'Cavern Market', icon: '@t-x-neckbrace', name: 'Neck Stabilizer',   desc: 'A cavern-smith\u2019s brace for the neck. Screen shake is halved, on top of Steady Eyes.', max: 1, cost: { gems: 3000, basalt: 40 } },
  /* ---- the Deep Library: a new card ---- */
  { id: 'c_card', grp: 'The Deep Library', icon: '@t-ear', name: 'Cavern Echo (card)', desc: 'Adds the epic card Cavern Echo to the cards you can be offered in a run: a call from the deep that drags the herd in, then crashes down on them.', max: 1, cost: { gold: 5000000, gems: 20000, basalt: 200, sulfur: 200, grubs: 150 } },
  /* ---- the Fusion Workshop: the biggest purchase in the City ---- */
  { id: 'c_fusion', grp: 'The Fusion Workshop', icon: '@t-x-fusion', name: 'Card Fusion Machine', film: 'fusion', desc: 'Build a machine that unlocks combo cards. Pick two cards of the same rarity and pay once to unlock their combo; Starfall Horn pairs with any card. In a run, once you hold both cards at level 10, the combo can be offered at level-up. It hides the two cards (their effects stay) and adds a new ability of its own with three levels, freeing a card slot. Every combo is different, and the codex rewards collecting them. The first combo is free.', max: 1, cost: { gold: 15000000, gems: 60000, basalt: 600, sulfur: 600, grubs: 450, food: 40, iron: 1500, argon: 700 } }
];
const CITY_BY_ID = {}; CITY_ITEMS.forEach(it => { CITY_BY_ID[it.id] = it; });
function cityUnlocked(){ return !!(Save.data && Save.data.homecoming); }
function cityLevel(id){ return Math.max(0, ((Save.data && Save.data.city && Save.data.city[id]) | 0)); }
function cityHave(k){ return +Save.data[k] || 0; }
function cityNum(k, v){ return k === 'food' ? String(Math.round(v * 10) / 10) : fmt(v); }          /* food comes in tenths; the rest are whole numbers */
function cityCost(it, lv){ const out = {}; for (const k of Object.keys(it.cost)) out[k] = k === 'food' ? Math.round(it.cost[k] * Math.pow(it.grow || 1, lv) * 10) / 10 : Math.ceil(it.cost[k] * Math.pow(it.grow || 1, lv)); return out; }
function cityLacking(it){ const c = cityCost(it, cityLevel(it.id)), out = []; for (const k of Object.keys(c)) if (cityHave(k) + 1e-9 < c[k]) out.push(k); return out; }
/* why an item cannot be bought right now: 'locked' (City not found), 'max', 'poor', or null */
function cityBuyCheck(id){
  const it = CITY_BY_ID[id]; if (!it) return 'locked';
  if (!cityUnlocked()) return 'locked';
  if (cityLevel(id) >= it.max) return 'max';
  return cityLacking(it).length ? 'poor' : null;
}
function buyCityItem(id){
  if (cityBuyCheck(id)) return false;
  const it = CITY_BY_ID[id], d = Save.data, lv = cityLevel(id), c = cityCost(it, lv);
  for (const k of Object.keys(c)){ if (k === 'food') d.food = Math.round(((+d.food || 0) - c[k]) * 10) / 10; else d[k] = Math.round((+d[k] || 0) - c[k]); }
  if (!d.city || typeof d.city !== 'object') d.city = {};
  d.city[id] = lv + 1;
  if (it.trinket) grantTrinket(it.trinket);
  Save.write(); recalcStats(); return true;
}
function cityCostHTML(it){
  const lv = cityLevel(it.id), c = cityCost(it, lv); let out = '';
  for (const cur of CITY_CUR){ if (c[cur[0]] === undefined) continue; const lack = cityHave(cur[0]) + 1e-9 < c[cur[0]]; out += (out ? ' \u00B7 ' : '') + '<span style="color:' + (lack ? '#FF7A6A' : cur[2]) + '">' + cityNum(cur[0], c[cur[0]]) + ' ' + cur[1] + '</span>'; }
  return out;
}
function cityTabHTML(){
  let out = '<p class="sub">The Underground Giraffe City has taken you in, and its market is open to you. Ants are trained here with <b>grubs</b> (they drop from enemies now that you are home); everything else costs the metals, gems, gold and food you have been gathering.</p>';
  out += '<div class="sub" style="margin:2px 0 8px">You have: ' + CITY_CUR.map(c => '<span style="color:' + c[2] + '">' + cityNum(c[0], cityHave(c[0])) + ' ' + c[1] + '</span>').join(' \u00B7 ') + '</div>';
  let grp = '';
  for (const it of CITY_ITEMS){
    if (it.grp !== grp){ grp = it.grp; out += '<h3 class="grphead" style="margin:16px 0 4px;color:var(--gold)">' + grp + '</h3>'; }
    const lv = cityLevel(it.id), maxed = lv >= it.max, why = cityBuyCheck(it.id);
    out += '<div class="shoprow" data-crow="' + it.id + '"><div class="ic">' + ico(it.icon) + '</div><div class="txt"><div class="nm">' + it.name + (it.max > 1 ? ' <span style="opacity:.7;font-size:12px">level ' + lv + '/' + it.max + '</span>' : '') + (maxed ? ' \u2714' : '') + '</div>' +
      '<div class="ds">' + it.desc + '</div>' + (maxed ? '' : '<div class="ds">' + cityCostHTML(it) + '</div>') + '</div>' +
      (maxed ? '<div class="maxed">' + (it.max > 1 ? 'Maxed' : 'Owned') + '</div>' : '<button class="btn sm buy' + (why ? ' ghost' : '') + '" data-city="' + it.id + '"' + (why ? ' disabled' : '') + '>' + (lv > 0 ? 'Upgrade' : it.max > 1 ? 'Learn' : 'Buy') + '</button>') + '</div>';
  }
  if (cityLevel('c_fusion') > 0) out += '<div class="row" style="margin-top:18px"><button class="btn" data-a="fusion-open">Open the Card Fusion Machine<small>' + Object.keys(Save.data.combos || {}).length + ' combos unlocked</small></button></div>';
  if (chapterUnlocked(11)) out += '<div class="row" style="margin-top:18px"><button class="btn" data-a="city-lift">Take the elevator up to the savannah (Chapter 11)</button></div>';
  return out;
}
/* ---- what the purchases do ---- */
function antSpdMul(){ return 1 + 0.05 * cityLevel('c_antspd'); }
function acidBurst(){ const L = cityLevel('c_acid'); return L > 0 ? { L: L, r: 46 + 14 * L, dmgMul: 0.9 + 0.25 * L, poolR: 40 + 9 * L, poolDur: 3 + 0.9 * L, poolDps: 0.35 + 0.12 * L } : null; }
function venomBite(){ const L = cityLevel('c_venom'); return L > 0 ? { L: L, dps: 0.18 + 0.07 * L, dur: 2.6 + 0.6 * L } : null; }
function stickyBlast(){ const L = cityLevel('c_sticky'); return L > 0 ? { L: L, dur: 2 + 1.1 * L } : null; }
function applyCityStats(s){
  s.kickDmgMul += 0.04 * cityLevel('c_dmg'); s.maxHpAdd += 12 * cityLevel('c_hp'); s.speedMul += 0.02 * cityLevel('c_spd'); s.xpMul += 0.04 * cityLevel('c_xp'); s.goldMul += 0.05 * cityLevel('c_gold');
  if (trinketEquipped('lanternoil')){ s.pickupMul += 0.20; s.dropMul += 0.10; }
  if (trinketEquipped('echochime')){ s.kickRangeMul += 0.10; s.crit += 0.03; }
  if (trinketEquipped('mosswreath')) s.regen += 1.5;
  if (trinketEquipped('burrowboots')){ s.speedMul += 0.06; s.xpMul += 0.06; }
}
/* ---- the new card: Cavern Echo. It breathes the herd in, then brings the cavern down on them ---- */
CARDS.push({
  id: 'cavern_echo', icon: '@t-bell', rarity: 'epic', type: 'weapon', cityCard: true,
  forms: [
    { lv: 1,  name: 'Cavern Echo',          icon: '@t-ear', color: '#7AE8D0', desc: 'A deep call drags every nearby enemy towards you, then the echo crashes down on them all.' },
    { lv: 5,  name: 'Resounding Deep',      icon: '@t-wave-sine', color: '#9AF0E0', desc: 'A longer, stronger pull, a wider crash, and everything it hits is stunned for a moment.' },
    { lv: 10, name: 'Voice of the Underworld', icon: '@t-speakerphone', color: '#D8FFF4', desc: 'The call comes round again and the echo answers twice. Little that hears it gets up.' }
  ],
  stats(L){
    const t = L >= 10 ? 2 : L >= 5 ? 1 : 0;
    return { cd: Math.max(2.2, 5.0 - 0.28 * L), dmg: (40 + 14 * L) * [1, 1.25, 1.6][t], rad: (170 + 18 * L) * [1, 1.15, 1.35][t], pull: (1700 + 110 * L) * [1, 1.2, 1.4][t], stun: [0.35, 0.6, 0.9][t], beats: t === 2 ? 2 : 1 };
  },
  init(i){ i.t = 1.2; i.inhale = 0; i.queue = []; },
  update(inst, dt){
    const s = inst.s;
    for (let i = inst.queue.length - 1; i >= 0; i--){ inst.queue[i] -= dt; if (inst.queue[i] <= 0){ this.crash(inst, s, 0.88); inst.queue.splice(i, 1); } }
    if (inst.inhale > 0){
      inst.inhale -= dt;
      const near = enemiesNear(P.x, P.y, s.rad * 1.25, []);
      for (let i = 0; i < near.length; i++){ const e = near[i]; if (e.dead || e.big) continue; const a = Math.atan2(P.y - e.y, P.x - e.x); e.kx += Math.cos(a) * s.pull * dt * e.kbRes; e.ky += Math.sin(a) * s.pull * dt * e.kbRes; }
      if (Math.random() < dt * 40){ const a = Math.random() * TAU, d = s.rad * rand(0.6, 1.1); addParticle(P.x + Math.cos(a) * d, P.y + Math.sin(a) * d, -Math.cos(a) * 240, -Math.sin(a) * 240, rand(2, 4), 0.4, inst.form.color, { glow: true }); }
      if (inst.inhale <= 0){ this.crash(inst, s, 1); if (s.beats > 1) inst.queue.push(0.3); }
      return;
    }
    inst.t -= dt;
    if (inst.t <= 0){ inst.t = s.cd * haste(); inst.inhale = 0.55; sfx('whoosh', 0.1); }
  },
  crash(inst, s, k){
    addShock(P.x, P.y, s.rad * k, 0.5, s.dmg, inst.form.color, { width: 18, kb: 260, stun: s.stun });
    abilityShake(8); sfx('boom', 0.12); burstParticles(P.x, P.y, 16, inst.form.color, 260, 5, { glow: true });
  }
});
{ const c = CARDS[CARDS.length - 1]; CARDMAP[c.id] = c; c.name = c.forms[0].name; c.icon = c.forms[0].icon; }          /* CARDMAP was built before this card existed */

