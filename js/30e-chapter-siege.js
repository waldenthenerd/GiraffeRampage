'use strict';
/* Chapter 15 (internal chapter 16): the Siege of Longneck Town. Twenty-five waves, 361 to 385, a boss every fifth wave. */
/* ========================= CHAPTER 15: THE SIEGE ========================= */
/* The humans have found out she is looking, and their machines come for her home. Longneck Town is the battlefield, the whole of it (js/44zzzd-siege-town.js): six
   districts laid out in one arena, five key buildings to protect, and a militia of friendly giraffes at posts and barricades. The enemies are the humans' robots
   and the creatures the glimmer has changed: no humans appear, and the town's own herd is hiding in the Burrows.
   The twelve ordinary kinds and five bosses sit in the Bestiary's usual slots (SIEGE_KIT, like TOWER_KIT). The numbers are tuned by hand and are the ones to change
   if it is too hard or too easy: SIEGE_MUL is the strength of the table, siegeScale takes it from SIEGE_TUNE.hp0 to hp1 (and the same for damage) times Chapter 13's last
   wave, which puts the first wave where the Tower's last one was. SIEGE_TUNE.hard scales both together, split evenly between health and damage like the Domes. */
const SIEGE_MUL = { common: { hp: 30, dmg: 7.0, spd: 1.6, val: 20 }, boss: { hp: 24, dmg: 5.8, spd: 1.4, val: 16 } };
const SIEGE_TUNE = { hp0: 3.2, hp1: 5.0, dmg0: 1.9, dmg1: 3.0, count0: 70, countStep: 3.4, hard: 1 };
const SIEGE_HARD = Math.sqrt(SIEGE_TUNE.hard);
function siegeScale(cw){
  const k = clamp((cw - 1) / (SIEGE_WAVES - 1), 0, 1), b = enemyScale(WAVES_PER_CHAPTER);
  return { hp: b.hp * SIEGE_HARD * (SIEGE_TUNE.hp0 + (SIEGE_TUNE.hp1 - SIEGE_TUNE.hp0) * k), dmg: b.dmg * SIEGE_HARD * (SIEGE_TUNE.dmg0 + (SIEGE_TUNE.dmg1 - SIEGE_TUNE.dmg0) * k), spd: b.spd };
}
/* Which kinds are machines and which are mutants: a machine is bolted together out of what the humans had (scrap panels, lenses, a red eye), a mutant is an animal with
   the glimmer grown through it. The art is in js/35k-art-siege.js. hpMul, spdMul and rMul trim each kind against the Savanna cast it stands in for. */
const SIEGE_KIT = {
  hyena:       { look: 'sg_patrol',   ai: 'chase',  color: '#7C8694', dark: '#2A3038', pale: '#D6DEE8', blood: '#4A5564', rMul: 0.95, hpMul: 0.8,  spdMul: 1.1,  name: 'Patrol Bot' },
  grub:        { look: 'sg_maggot',   ai: 'chase',  color: '#BFE86A', dark: '#4A6A1A', pale: '#F2FFC0', blood: '#8AC83A', rMul: 0.65, hpMul: 0.45, spdMul: 1.35, name: 'Glimmer Maggot' },
  jackal:      { look: 'sg_skitter',  ai: 'chase',  color: '#C8A04A', dark: '#52401A', pale: '#FFE9A8', blood: '#8A6E2A', rMul: 0.85, hpMul: 0.65, spdMul: 1.25, name: 'Skitter Drone' },
  cheetah:     { look: 'sg_raptor',   ai: 'chase',  color: '#5A7A9A', dark: '#1A2A3E', pale: '#A8C8E8', blood: '#34506E', rMul: 1.0,  hpMul: 0.85, spdMul: 1.0,  name: 'Raptor Bot' },
  warthog:     { look: 'sg_dozer',    ai: 'chase',  color: '#C8A02A', dark: '#52400A', pale: '#FFE680', blood: '#7A6212', rMul: 1.25, hpMul: 1.8,  spdMul: 0.65, name: 'Dozer Bot' },
  vulture:     { look: 'sg_spotter',  ai: 'chase',  color: '#4A5260', dark: '#14181E', pale: '#9AA6B8', blood: '#2A3040', rMul: 0.95, hpMul: 0.65, spdMul: 1.0,  name: 'Spotter Drone' },
  rhino:       { look: 'sg_hornback', ai: 'chase',  color: '#7A9A6A', dark: '#2A4220', pale: '#C8F0A8', blood: '#4A7A3A', rMul: 1.3,  hpMul: 1.5,  spdMul: 0.8,  name: 'Glimmerhorn' },
  baboon:      { look: 'sg_hurler',   ai: 'chase',  color: '#8A7AA8', dark: '#342A4E', pale: '#DCCCF8', blood: '#5E4E7E', rMul: 1.0,  hpMul: 0.9,  spdMul: 1.0,  name: 'Rockhurler' },
  honeybadger: { look: 'sg_sapper',   ai: 'chase',  color: '#B8503A', dark: '#4A1A10', pale: '#FFB8A0', blood: '#7A2A1A', rMul: 0.9,  hpMul: 1.0,  spdMul: 1.05, name: 'Sapper Bot' },
  mamba:       { look: 'sg_glassfang', ai: 'chase', color: '#6AD8C8', dark: '#12504A', pale: '#C8FFF4', blood: '#2E9A8A', rMul: 1.05, hpMul: 1.1,  spdMul: 1.0,  name: 'Glassfang' },
  ember:       { look: 'sg_torch',    ai: 'chase',  color: '#E8723A', dark: '#5A2410', pale: '#FFD0A0', blood: '#A8481E', rMul: 0.95, hpMul: 0.6,  spdMul: 0.8,  name: 'Torch Bot' },
  termite:     { look: 'sg_gnawer',   ai: 'chase',  color: '#A8B84A', dark: '#3E4A12', pale: '#EEF8A8', blood: '#6E7E22', rMul: 1.0,  hpMul: 1.0,  spdMul: 0.9,  name: 'Gnawer' },
  lion:        { look: 'sg_walker',   ai: 'chase',  color: '#8A8E96', dark: '#24262C', pale: '#D8DCE4', blood: '#4A4E56', title: 'The Scrap Walker', name: 'The Scrap Walker', r: 56 },
  matriarch:   { look: 'sg_queen',    ai: 'chase',  color: '#9AE86A', dark: '#2E5A14', pale: '#E8FFC0', blood: '#5AA02A', title: 'The Brood Queen', name: 'The Brood Queen', r: 58 },
  buffalo:     { look: 'sg_ram',      ai: 'chase',  color: '#B8863A', dark: '#44300E', pale: '#F0D08A', blood: '#6E4E1A', title: 'The Battering Ram', name: 'The Battering Ram', r: 66 },
  crocodile:   { look: 'sg_carrier',  ai: 'chase',  color: '#5E6E86', dark: '#181E2A', pale: '#B0C0DC', blood: '#343E52', title: 'The Hive Carrier', name: 'The Hive Carrier', r: 60 },
  wildfire:    { look: 'sg_warden',   ai: 'chase',  color: '#3A4252', dark: '#0C0E14', pale: '#FF5A4A', blood: '#6A1E18', title: 'The Warden', name: 'The Warden', r: 64 }
};
const ETYPES_SIEGE = {};
Object.keys(ETYPES).forEach(id => {
  const k = SIEGE_KIT[id]; if (!k) return;
  const base = ETYPES[id], big = !!base.big, mul = big ? SIEGE_MUL.boss : SIEGE_MUL.common;
  ETYPES_SIEGE[id] = Object.assign({}, base, { hp: base.hp * mul.hp * (k.hpMul || 1), dmg: base.dmg * mul.dmg, spd: base.spd * mul.spd * (k.spdMul || 1), val: Math.round(base.val * mul.val),
    r: k.r || base.r * (k.rMul || 1), color: k.color, dark: k.dark, pale: k.pale, blood: k.blood, look: k.look, title: big ? k.title : undefined, siege: true, splitInto: undefined, splitCount: undefined,
    ai: k.ai, kbRes: big ? base.kbRes : Math.max(base.kbRes || 0, 0.1) });
  if (!big && (id === 'vulture' || id === 'jackal')) ETYPES_SIEGE[id].flyer = true;
});
Object.keys(SIEGE_KIT).forEach(id => { LOOK_NAMES[SIEGE_KIT[id].look] = SIEGE_KIT[id].name; });

/* the Bestiary's total again, now that this chapter's table exists too */
BESTIARY_TOTAL_CREATURES = BESTIARY_CHAPTERS.reduce(function(n, _, i){ const t = bestiaryTable(i + 1); return n + BESTIARY_ORDER.filter(function(k){ return !!t[k]; }).length; }, 0);

const WAVE_FLAVOUR_SIEGE = [
  'Smoke on the horizon', 'A siren over the rooftops', 'Something rolls up the main road', 'Lenses glint in the dust', '',
  'The Market is closing early', 'Sparks in the Square', 'The glimmer is on the wind', 'Wheels on the cobbles', '',
  'The Harbor lights go out', 'Boots, but not boots', 'Feelers on the lighthouse', 'The militia holds the line', '',
  'Searchlights over the Park', 'They are climbing the rooftops', 'Rockets on the Launchpad', 'Every gate is red', '',
  'The Hall bell is ringing', 'Hold the Square', 'Nowhere left to retreat to', 'The last push', ''
];
const BOSS_INTRO_SIEGE = {
  lion: 'The Scrap Walker stamps down the main road',
  matriarch: 'The Brood Queen rears up out of the glimmer',
  buffalo: 'The Battering Ram has found the Market',
  crocodile: 'The Hive Carrier blots out the sun',
  wildfire: 'The Warden has come for the Hall'
};

/* a siege wave: the twelve kinds in a slow build-up, the machines first and the mutants thickening later */
function buildSiegeWave(w, isBoss){
  const cw = chapterWaveOf(w), q = [], pool = [], add = (t, wt) => { if (wt > 0) pool.push({ t: t, w: wt }); }, g = cw * 0.1;
  let budget = SIEGE_TUNE.count0 + SIEGE_TUNE.countStep * (cw - 1);
  if (isBoss) budget = Math.round(budget * 0.5);
  if (cw <= 2) budget = Math.round(budget * 0.7);
  budget = Math.max(2, Math.round(budget * WAVE_COUNT_MUL));
  add('hyena', 10); add('grub', cw >= 2 ? 3 + g : 0); add('jackal', cw >= 3 ? 3.4 + g : 0); add('cheetah', cw >= 4 ? 3.4 + g : 0);
  add('warthog', cw >= 6 ? 2.4 + g * 0.5 : 0); add('vulture', cw >= 7 ? 3 + g * 0.6 : 0); add('rhino', cw >= 8 ? 2.4 + g * 0.5 : 0); add('baboon', cw >= 9 ? 2.8 + g * 0.5 : 0);
  add('honeybadger', cw >= 11 ? 2.8 + g * 0.5 : 0); add('mamba', cw >= 12 ? 2.8 + g * 0.5 : 0); add('ember', cw >= 14 ? 2.4 + g * 0.5 : 0); add('termite', cw >= 16 ? 2.6 + g * 0.5 : 0);
  let total = 0; for (let i = 0; i < pool.length; i++) total += pool[i].w;
  const gap = Math.max(0.1, (0.52 - w * 0.0012) * 0.8);
  let t = 0.3;
  for (let i = 0; i < budget; i++){
    let r = Math.random() * total, type = pool[0].t;
    for (let k = 0; k < pool.length; k++){ r -= pool[k].w; if (r <= 0){ type = pool[k].t; break; } }
    q.push({ type: type, t: t });
    t += gap * rand(0.55, 1.5);
    if (Math.random() < 0.16) t += rand(0.3, 0.9);
  }
  if (isBoss) q.push({ type: bossForWave(w), t: 1.4, boss: true });
  q.sort((a, b) => a.t - b.t);
  return q;
}

/* the behaviors of the machines and the bosses, filled in by js/44zzze-siege-ai.js; each is called like a Marine behavior: (e, dt, ux, uy, d) -> [mvx, mvy] */
const SIEGE_AI = {};
