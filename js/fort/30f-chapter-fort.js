'use strict';
/* Chapter 16 (internal chapter 17): Fort Shortneck, the counter attack. Twenty-five waves, 386 to 410, a boss every fifth wave. */
/* ========================= CHAPTER 16: FORT SHORTNECK ========================= */
/* The signal the machines called home to comes from a fort on the ridge above the waterhole. She goes over its wall (a film, js/films/27d-film-fort.js) and tears it apart: every
   building, vehicle, fuel tank and searchlight is a point of chaos (js/fort/44zzzl-fort-chaos.js), the map is the compound (js/fort/44zzzk-fort-map.js), and the soldiers, machines and
   glimmer-fed mutants inside are the new creatures (art in js/art/35n-art-fort.js, behaviors in js/fort/44zzzm-fort-ai.js). The twelve ordinary kinds and five bosses sit in the
   Bestiary's usual slots (FORT_KIT, like SIEGE_KIT). The numbers are tuned by hand and are the ones to change if it is too hard or too easy: FORT_MUL is the strength of the table,
   fortScale takes it from FORT_TUNE.hp0 to hp1 (and the same for damage) times Chapter 13's last wave, hpX and dmgX are a further plain multiplier on each, and player is how much
   harder the creatures hit her. The owners asked for it to be harder than the Siege (hpX 1.5, dmgX 1.5), so the table starts a little stronger and ends a good deal stronger. */
const FORT_MUL = { common: { hp: 30, dmg: 7.0, spd: 1.6, val: 24 }, boss: { hp: 24, dmg: 5.8, spd: 1.4, val: 19 } };
const FORT_TUNE = { hp0: 3.6, hp1: 5.9, dmg0: 2.1, dmg1: 3.5, count0: 104, countStep: 4.6, hpX: 1.65, dmgX: 1.75, player: 1.5 };
function fortScale(cw){
  const k = clamp((cw - 1) / (COUNTER_WAVES - 1), 0, 1), b = enemyScale(WAVES_PER_CHAPTER);
  return { hp: b.hp * FORT_TUNE.hpX * (FORT_TUNE.hp0 + (FORT_TUNE.hp1 - FORT_TUNE.hp0) * k), dmg: b.dmg * FORT_TUNE.dmgX * FORT_TUNE.player * (FORT_TUNE.dmg0 + (FORT_TUNE.dmg1 - FORT_TUNE.dmg0) * k), spd: b.spd };
}
/* Who is who: soldiers and their machines in olive and steel, the medic in white, the Pyro in orange, and the bosses. hpMul, spdMul and rMul trim each kind against the Savanna
   cast it stands in for. */
const FORT_KIT = {
  hyena:       { look: 'ft_guard',    ai: 'ft_guard',    color: '#6E7A4A', dark: '#262E16', pale: '#C8D49A', blood: '#8A3A2A', rMul: 0.95, hpMul: 0.8,  spdMul: 1.0,  name: 'Base Guard' },
  grub:        { look: 'ft_cadet',    ai: 'ft_cadet',    color: '#A8B070', dark: '#4A5026', pale: '#E8EEC0', blood: '#8A3A2A', rMul: 0.7,  hpMul: 0.45, spdMul: 1.4,  name: 'Cadet' },
  jackal:      { look: 'ft_hound',    ai: 'ft_hound',    color: '#7A6A58', dark: '#2A2218', pale: '#D8C8A8', blood: '#4A4034', rMul: 0.85, hpMul: 0.65, spdMul: 1.3,  name: 'Guard Hound' },
  cheetah:     { look: 'ft_jeep',     ai: 'ft_jeep',     color: '#8A9060', dark: '#2E3418', pale: '#D8DCA8', blood: '#4A5030', rMul: 1.05, hpMul: 0.9,  spdMul: 1.0,  name: 'Scout Jeep' },
  warthog:     { look: 'ft_riot',     ai: 'ft_riot',     color: '#4A5260', dark: '#14181E', pale: '#9AA6B8', blood: '#8A3A2A', rMul: 1.2,  hpMul: 1.8,  spdMul: 0.65, name: 'Riot Trooper' },
  vulture:     { look: 'ft_copter',   ai: 'ft_copter',   color: '#5A6470', dark: '#181C22', pale: '#B8C4D4', blood: '#2A3038', rMul: 0.95, hpMul: 0.65, spdMul: 1.0,  name: 'Mini Copter' },
  rhino:       { look: 'ft_apc',      ai: 'ft_apc',      color: '#70785A', dark: '#262A18', pale: '#C8D0A0', blood: '#4A5030', rMul: 1.2,  hpMul: 1.6,  spdMul: 0.8,  name: 'APC' },
  baboon:      { look: 'ft_mortar',   ai: 'ft_mortar',   color: '#8A7A58', dark: '#342A18', pale: '#E0D0A8', blood: '#8A3A2A', rMul: 1.0,  hpMul: 0.9,  spdMul: 1.0,  name: 'Mortar Crew' },
  honeybadger: { look: 'ft_grenadier', ai: 'ft_grenadier', color: '#7A6A4A', dark: '#2E2412', pale: '#E8D8A0', blood: '#8A3A2A', rMul: 0.9, hpMul: 1.0, spdMul: 1.05, name: 'Grenadier' },
  mamba:       { look: 'ft_sniper',   ai: 'ft_sniper',   color: '#4A5A44', dark: '#141E12', pale: '#B8D0A8', blood: '#8A3A2A', rMul: 0.95, hpMul: 0.7,  spdMul: 1.0,  name: 'Sniper' },
  ember:       { look: 'ft_pyro',     ai: 'ft_pyro',     color: '#B85A2A', dark: '#4A2010', pale: '#FFC890', blood: '#8A3A2A', rMul: 1.1,  hpMul: 0.8,  spdMul: 0.8,  name: 'Pyro Trooper' },
  termite:     { look: 'ft_medic',    ai: 'ft_medic',    color: '#E4E8EE', dark: '#7A8290', pale: '#6AE08A', blood: '#8A3A2A', rMul: 1.0,  hpMul: 1.0,  spdMul: 0.9,  name: 'Field Medic' },
  lion:        { look: 'ft_sergeant', ai: 'ft_sergeant', color: '#5E6A44', dark: '#1A200E', pale: '#D8E4A8', blood: '#8A3A2A', title: 'Sergeant Ironside', name: 'Sergeant Ironside', r: 58 },
  matriarch:   { look: 'ft_gunship',  ai: 'ft_gunship',  color: '#4A5668', dark: '#10161E', pale: '#A8BCD8', blood: '#2A3038', title: 'The Gunship', name: 'The Gunship', r: 62 },
  buffalo:     { look: 'ft_tank',     ai: 'ft_tank',     color: '#6A7448', dark: '#1E2410', pale: '#C8D49A', blood: '#4A5030', title: 'Old Thunder', name: 'Old Thunder', r: 68 },
  crocodile:   { look: 'ft_colonel',  ai: 'ft_colonel',  color: '#7A5A3A', dark: '#26180C', pale: '#E8C898', blood: '#5A3A1C', title: 'Colonel Mortimer', name: 'Colonel Mortimer', r: 60 },
  wildfire:    { look: 'ft_maker',    ai: 'ft_maker',    color: '#3A4A44', dark: '#0A100E', pale: '#9AF0C8', blood: '#1E6A4A', title: 'The Maker', name: 'The Maker', r: 66 }
};
const ETYPES_FORT = {};
Object.keys(ETYPES).forEach(id => {
  const k = FORT_KIT[id]; if (!k) return;
  const base = ETYPES[id], big = !!base.big, mul = big ? FORT_MUL.boss : FORT_MUL.common;
  ETYPES_FORT[id] = Object.assign({}, base, { hp: base.hp * mul.hp * (k.hpMul || 1), dmg: base.dmg * mul.dmg, spd: base.spd * mul.spd * (k.spdMul || 1), val: Math.round(base.val * mul.val),
    r: k.r || base.r * (k.rMul || 1), color: k.color, dark: k.dark, pale: k.pale, blood: k.blood, look: k.look, title: big ? k.title : undefined, fort: true, splitInto: undefined, splitCount: undefined,
    ai: k.ai, kbRes: big ? base.kbRes : Math.max(base.kbRes || 0, 0.1), onSpawn: function(e){ fortOnSpawn(e); } });
  if (!big && (id === 'vulture')) ETYPES_FORT[id].flyer = true;
  if (id === 'vulture' || id === 'matriarch') ETYPES_FORT[id].flyOver = true;            /* the copter and the gunship pass over the buildings */
});
Object.keys(FORT_KIT).forEach(id => { LOOK_NAMES[FORT_KIT[id].look] = FORT_KIT[id].name; });

/* the Bestiary's total again, now that this chapter's table exists too */
BESTIARY_TOTAL_CREATURES = BESTIARY_CHAPTERS.reduce(function(n, _, i){ const t = bestiaryTable(i + 1); return n + BESTIARY_ORDER.filter(function(k){ return !!t[k]; }).length; }, 0);

const WAVE_FLAVOUR_FORT = [
  'Over the wall', 'Searchlights find the yard', 'The motor pool wakes up', 'Dogs on the gravel', '',
  'Riot shields in the mess hall', 'Copters over the barracks', 'The armoury doors are open', 'Mortars, somewhere', '',
  'The fuel depot is lit', 'Rifles on the roofs', 'Flames in the corridor', 'Medics behind the lines', '',
  'The gate is locked from inside', 'Every light is on', 'Reinforcements by the truckload', 'The command bunker is calling', '',
  'The plant is running hot', 'Glimmer in the pipes', 'Nobody leaves the fort', 'The last wall', ''
];
const BOSS_INTRO_FORT = {
  lion: 'Sergeant Ironside holds the parade ground',
  matriarch: 'The Gunship lifts off the helipad',
  buffalo: 'Old Thunder rolls out of the motor pool',
  crocodile: 'Colonel Mortimer climbs into his walker',
  wildfire: 'The Maker comes up out of the plant'
};

/* a fort wave: the twelve kinds in a slow build-up, the soldiers first and the machines thickening later */
function buildFortWave(w, isBoss){
  const cw = chapterWaveOf(w), q = [], pool = [], add = (t, wt) => { if (wt > 0) pool.push({ t: t, w: wt }); }, g = cw * 0.1;
  let budget = FORT_TUNE.count0 + FORT_TUNE.countStep * (cw - 1);
  if (isBoss) budget = Math.round(budget * 0.5);
  if (cw <= 2) budget = Math.round(budget * 0.7);
  budget = Math.max(2, Math.round(budget * WAVE_COUNT_MUL));
  add('hyena', 10); add('grub', cw >= 2 ? 3.4 + g : 0); add('jackal', cw >= 3 ? 3.4 + g : 0); add('cheetah', cw >= 4 ? 3.2 + g : 0);
  add('warthog', cw >= 6 ? 2.4 + g * 0.5 : 0); add('vulture', cw >= 7 ? 3 + g * 0.6 : 0); add('rhino', cw >= 8 ? 2.4 + g * 0.5 : 0); add('baboon', cw >= 9 ? 2.8 + g * 0.5 : 0);
  add('honeybadger', cw >= 11 ? 2.8 + g * 0.5 : 0); add('mamba', cw >= 12 ? 2.6 + g * 0.5 : 0); add('ember', cw >= 14 ? 2.4 + g * 0.5 : 0); add('termite', cw >= 16 ? 2.4 + g * 0.5 : 0);
  let total = 0; for (let i = 0; i < pool.length; i++) total += pool[i].w;
  const gap = Math.max(0.1, (0.5 - w * 0.0012) * 0.8);
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

/* the behaviors of the soldiers, machines and bosses, filled in by js/fort/44zzzm-fort-ai.js; each is called like a Marine behavior: (e, dt, ux, uy, d) -> [mvx, mvy] */
const FORT_AI = {};
/* a creature of the fort comes in: marked, so the chaos code can tell its own from a squad's */
function fortOnSpawn(e){ e.ft = true; }
