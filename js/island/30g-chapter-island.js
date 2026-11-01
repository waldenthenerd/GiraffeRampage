'use strict';
/* Chapter 17 (internal chapter 18): the Island Lab. Twenty-five waves, 411 to 435, a boss every fifth wave. */
/* ========================= CHAPTER 17: THE ISLAND LAB ========================= */
/* The map in the fort's bunker had one place circled in red: a speck far out at sea. She crosses in the fishing boat (a film, js/films/27e-film-island.js) and wades ashore on an
   island where a scientist has been changing sea creatures in tanks. There are no soldiers and no machines here, only the mutants: crabs, eels, jellies, urchins, shrimp and
   worse, and the island itself (js/island/44zzzt-island-map.js) is half water, so they hide in the shallows and she wades slower through them. The twelve ordinary kinds and five
   bosses sit in the Bestiary's usual slots (ISLE_KIT, like FORT_KIT); their art is in js/art/35o-art-island.js and their behaviors in js/island/44zzzu-island-ai.js.
   The numbers are tuned by hand and are the ones to change if it is too hard or too easy: ISLE_MUL is the strength of the table, isleScale takes it from ISLE_TUNE.hp0 to hp1 (and
   the same for damage) times Chapter 13's last wave, hpX and dmgX are a further plain multiplier on each, and player is how much harder the creatures hit her. It starts a little
   above where Fort Shortneck ends and climbs from there. */
const ISLE_MUL = { common: { hp: 30, dmg: 7.0, spd: 1.6, val: 25 }, boss: { hp: 24, dmg: 5.8, spd: 1.4, val: 20 } };
const ISLE_TUNE = { hp0: 6.2, hp1: 9.2, dmg0: 3.7, dmg1: 5.4, count0: 108, countStep: 4.6, hpX: 1.65, dmgX: 1.75, player: 1.5 };
function isleScale(cw){
  const k = clamp((cw - 1) / (ISLE_WAVES - 1), 0, 1), b = enemyScale(WAVES_PER_CHAPTER);
  return { hp: b.hp * ISLE_TUNE.hpX * (ISLE_TUNE.hp0 + (ISLE_TUNE.hp1 - ISLE_TUNE.hp0) * k), dmg: b.dmg * ISLE_TUNE.dmgX * ISLE_TUNE.player * (ISLE_TUNE.dmg0 + (ISLE_TUNE.dmg1 - ISLE_TUNE.dmg0) * k), spd: b.spd };
}
/* Who is who: the sea's own colours (Chapter 4's blues and teals, coral reds, sand) with a sickly lab green somewhere on each, a tag, a tube or a glow, so it reads as made, not born.
   hpMul, spdMul and rMul trim each kind against the Savanna cast it stands in for. swim: it is quicker in the water and slower on the sand. */
const ISLE_KIT = {
  hyena:       { look: 'il_hermit',   ai: 'il_hermit',   color: '#C8704A', dark: '#4A2416', pale: '#F2C8A8', blood: '#6AC8B8', rMul: 1.0,  hpMul: 0.85, spdMul: 1.0,  name: 'Hermit Squatter' },
  grub:        { look: 'il_shrimp',   ai: 'il_shrimp',   color: '#F08A6A', dark: '#6A2A1C', pale: '#FFD8C8', blood: '#6AC8B8', rMul: 0.65, hpMul: 0.4,  spdMul: 1.45, name: 'Lab Shrimp', swim: true },
  jackal:      { look: 'il_eel',      ai: 'il_eel',      color: '#3A6A5A', dark: '#102A22', pale: '#9AE0C0', blood: '#4AA88A', rMul: 0.85, hpMul: 0.65, spdMul: 1.3,  name: 'Eel Hound', swim: true },
  cheetah:     { look: 'il_urchin',   ai: 'il_urchin',   color: '#4A2A5A', dark: '#1A0C22', pale: '#C89AE0', blood: '#B87AD8', rMul: 0.95, hpMul: 0.85, spdMul: 1.0,  name: 'Urchin Roller' },
  warthog:     { look: 'il_crab',     ai: 'il_crab',     color: '#B8442E', dark: '#4A140C', pale: '#F2A890', blood: '#6AC8B8', rMul: 1.25, hpMul: 1.9,  spdMul: 0.6,  name: 'Crab Tank' },
  vulture:     { look: 'il_jelly',    ai: 'il_jelly',    color: '#B89AE8', dark: '#4A3A7A', pale: '#F0E4FF', blood: '#D8C8FF', rMul: 0.95, hpMul: 0.7,  spdMul: 0.85, name: 'Jelly Drifter' },
  rhino:       { look: 'il_brute',    ai: 'il_brute',    color: '#7A6A5E', dark: '#2A221C', pale: '#D8CCC0', blood: '#8A3A2A', rMul: 1.25, hpMul: 1.7,  spdMul: 0.8,  name: 'Barnacle Brute' },
  baboon:      { look: 'il_octo',     ai: 'il_octo',     color: '#9A4A7A', dark: '#3A142A', pale: '#F0B8D8', blood: '#2A1A2A', rMul: 1.0,  hpMul: 0.9,  spdMul: 0.95, name: 'Ink Spitter', swim: true },
  honeybadger: { look: 'il_mantis',   ai: 'il_mantis',   color: '#3AA87A', dark: '#0E3A28', pale: '#B8F0C8', blood: '#6AC8B8', rMul: 0.9,  hpMul: 1.0,  spdMul: 1.1,  name: 'Mantis Boxer' },
  mamba:       { look: 'il_snake',    ai: 'il_snake',    color: '#E8D8A0', dark: '#2A2A3A', pale: '#FFF8D8', blood: '#8A3A2A', rMul: 0.9,  hpMul: 0.75, spdMul: 1.05, name: 'Sea Snake', swim: true },
  ember:       { look: 'il_puffer',   ai: 'il_puffer',   color: '#E8C05A', dark: '#5A4214', pale: '#FFF0B8', blood: '#E8C05A', rMul: 1.0,  hpMul: 0.8,  spdMul: 0.85, name: 'Puffer Bomber', swim: true },
  termite:     { look: 'il_anemone',  ai: 'il_anemone',  color: '#E86A8A', dark: '#5A1A2A', pale: '#FFC8D8', blood: '#E86A8A', rMul: 1.05, hpMul: 1.1,  spdMul: 0.5,  name: 'Anemone Nurse' },
  lion:        { look: 'il_kingclaw',   ai: 'il_kingclaw',   color: '#C8442A', dark: '#4A120A', pale: '#F8B898', blood: '#6AC8B8', title: 'King Claw', name: 'King Claw', r: 62 },
  matriarch:   { look: 'il_stormjelly', ai: 'il_stormjelly', color: '#8AA8F0', dark: '#2A3A7A', pale: '#E8F0FF', blood: '#C8D8FF', title: 'The Stormjelly', name: 'The Stormjelly', r: 64 },
  buffalo:     { look: 'il_hammer',     ai: 'il_hammer',     color: '#6A7E8A', dark: '#1E2830', pale: '#D8E4EA', blood: '#8A2A2A', title: 'Old Hammerhead', name: 'Old Hammerhead', r: 64, swim: true },
  crocodile:   { look: 'il_leviathan',  ai: 'il_leviathan',  color: '#2E6A6A', dark: '#0A2224', pale: '#8AF0D8', blood: '#4AA88A', title: 'The Leviathan Eel', name: 'The Leviathan Eel', r: 58, swim: true },
  wildfire:    { look: 'il_zero',       ai: 'il_zero',       color: '#5A3A6A', dark: '#160A1E', pale: '#C8F0A8', blood: '#2A1A2A', title: 'Specimen Zero', name: 'Specimen Zero', r: 70 }
};
const ETYPES_ISLE = {};
Object.keys(ETYPES).forEach(id => {
  const k = ISLE_KIT[id]; if (!k) return;
  const base = ETYPES[id], big = !!base.big, mul = big ? ISLE_MUL.boss : ISLE_MUL.common;
  ETYPES_ISLE[id] = Object.assign({}, base, { hp: base.hp * mul.hp * (k.hpMul || 1), dmg: base.dmg * mul.dmg, spd: base.spd * mul.spd * (k.spdMul || 1), val: Math.round(base.val * mul.val),
    r: k.r || base.r * (k.rMul || 1), color: k.color, dark: k.dark, pale: k.pale, blood: k.blood, look: k.look, title: big ? k.title : undefined, isle: true, swim: !!k.swim, splitInto: undefined, splitCount: undefined,
    ai: k.ai, kbRes: big ? base.kbRes : Math.max(base.kbRes || 0, 0.1), onSpawn: function(e){ isleOnSpawn(e); } });
});
ETYPES_ISLE.vulture.flyer = true; ETYPES_ISLE.vulture.flyOver = true; ETYPES_ISLE.matriarch.flyOver = true;      /* the jellies drift over the rocks and the coral */
ETYPES_ISLE.warthog.shieldArc = 1.0;                                                                                /* the Crab Tank: hits on its plated front do a tenth */
ETYPES_ISLE.warthog.kbRes = 0.15;
ETYPES_ISLE.vulture.onDeath = function(e){ if (!e.small) isleJellySplit(e); };                                      /* a Jelly Drifter splits once into two small ones */
Object.keys(ISLE_KIT).forEach(id => { LOOK_NAMES[ISLE_KIT[id].look] = ISLE_KIT[id].name; });

/* the Bestiary's total again, now that this chapter's table exists too */
BESTIARY_TOTAL_CREATURES = BESTIARY_CHAPTERS.reduce(function(n, _, i){ const t = bestiaryTable(i + 1); return n + BESTIARY_ORDER.filter(function(k){ return !!t[k]; }).length; }, 0);

const WAVE_FLAVOUR_ISLE = [
  'Wading ashore', 'Something under the surf', 'The shrimp have found you', 'Shells on the sand', '',
  'The tide pools are full', 'Jellies on the wind', 'The reef is moving', 'Ink in the water', '',
  'Under the mangroves', 'Snakes in the roots', 'The tanks are open', 'Every pool is awake', '',
  'Lab lights through the palms', 'The pumps are running', 'Spines on the path', 'The nurses are busy', '',
  'Through the glass houses', 'Alarms in the tank room', 'The floor is flooding', 'Nothing left in the tanks', ''
];
const BOSS_INTRO_ISLE = {
  lion: 'King Claw comes up out of the surf',
  matriarch: 'The Stormjelly rises over the tide pools',
  buffalo: 'Old Hammerhead is in the shallows',
  crocodile: 'The Leviathan Eel uncoils on the reef',
  wildfire: 'Specimen Zero wakes in the tank room'
};

/* an island wave: the twelve kinds in a slow build-up, the small swimmers first and the heavy and the strange thickening later */
function buildIsleWave(w, isBoss){
  const cw = chapterWaveOf(w), q = [], pool = [], add = (t, wt) => { if (wt > 0) pool.push({ t: t, w: wt }); }, g = cw * 0.1;
  let budget = ISLE_TUNE.count0 + ISLE_TUNE.countStep * (cw - 1);
  if (isBoss) budget = Math.round(budget * 0.5);
  if (cw <= 2) budget = Math.round(budget * 0.7);
  budget = Math.max(2, Math.round(budget * WAVE_COUNT_MUL));
  add('hyena', 10); add('grub', cw >= 2 ? 3.6 + g : 0); add('jackal', cw >= 2 ? 3.2 + g : 0); add('warthog', cw >= 4 ? 2.4 + g * 0.5 : 0);
  add('cheetah', cw >= 6 ? 3 + g * 0.5 : 0); add('vulture', cw >= 7 ? 3 + g * 0.6 : 0); add('baboon', cw >= 8 ? 2.8 + g * 0.5 : 0); add('rhino', cw >= 9 ? 2.4 + g * 0.5 : 0);
  add('mamba', cw >= 11 ? 2.8 + g * 0.5 : 0); add('honeybadger', cw >= 12 ? 2.6 + g * 0.5 : 0); add('ember', cw >= 14 ? 2.4 + g * 0.5 : 0); add('termite', cw >= 16 ? 1.8 + g * 0.4 : 0);
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

/* the behaviors of the mutants and bosses, filled in by js/island/44zzzu-island-ai.js; each is called like a Marine behavior: (e, dt, ux, uy, d) -> [mvx, mvy] */
const ISLE_AI = {};
/* a creature of the island comes in: marked, so the water code can tell which of them swim */
function isleOnSpawn(e){ e.il = true; }
/* a Jelly Drifter that dies splits into two small ones, which do not split again */
function isleJellySplit(e){
  for (let i = 0; i < 2; i++){
    const a = (i ? 0 : Math.PI) + rand(-0.4, 0.4), c = spawnEnemy('vulture', e.x + Math.cos(a) * 20, e.y + Math.sin(a) * 20, e.waveRef);
    if (!c) continue;
    c.small = true; c.r = e.r * 0.6; c.maxHp = c.hp = Math.max(1, e.maxHp * 0.3); c.dmg *= 0.6; c.xp *= 0.4; c.kx = Math.cos(a) * 200; c.ky = Math.sin(a) * 200;
  }
}
/* the save at the end of the chapter: every chapter before it is done too */
function isleFinishSave(){
  const d = Save.data; if (!d) return;
  for (let c = 13; c <= ISLE_CHAPTER; c++) d['chapter' + c + 'Complete'] = true;
  if (G.il && !G.il.wet) d.isleDry = true;
  Save.write();
}
