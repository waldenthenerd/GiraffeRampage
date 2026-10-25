'use strict';
/* Chapter 14 (internal chapter 15): the Tower. Twenty-five waves, 336 to 360, one floor each, with a boss on every fifth floor. */
/* ========================= CHAPTER 14: THE TOWER ========================= */
/* In New York the trail ends at the headquarters of the company that paid for the domes. The giraffe goes up through it floor by floor, in a lift, and on every
   floor the walls are solid: small rooms joined by doorways (js/30c-tower-floors.js). What lives in the building is all new: office machines and lab animals that
   the glimmer has got into. The twelve ordinary kinds and five bosses sit in the Bestiary's usual slots (TOWER_KIT, like DUST_KIT on Mars). The numbers are tuned by
   hand and are the ones to change if it is too hard or too easy: TOWER_MUL is the strength of the table, towerScale takes it from TOWER_TUNE.hp0 to hp1 (and the same
   for damage) times Chapter 13's last wave. */
const TOWER_MUL = { common: { hp: 30, dmg: 7.0, spd: 1.6, val: 18 }, boss: { hp: 22, dmg: 5.6, spd: 1.4, val: 14 } };
const TOWER_TUNE = { hp0: 1.5, hp1: 3.0, dmg0: 1.1, dmg1: 1.9, count0: 66, countStep: 3.2 };
function towerScale(cw){
  const k = clamp((cw - 1) / (TOWER_WAVES - 1), 0, 1), b = enemyScale(WAVES_PER_CHAPTER);
  return { hp: b.hp * (TOWER_TUNE.hp0 + (TOWER_TUNE.hp1 - TOWER_TUNE.hp0) * k), dmg: b.dmg * (TOWER_TUNE.dmg0 + (TOWER_TUNE.dmg1 - TOWER_TUNE.dmg0) * k), spd: b.spd };
}
const TOWER_KIT = {
  hyena:       { look: 'tw_rat',       ai: 't_rat',       color: '#8A7A72', dark: '#3A2E2A', pale: '#E8CFC0', blood: '#7A3A3A', rMul: 0.95, hpMul: 0.8,  spdMul: 1.1,  name: 'Scrap Rat' },
  grub:        { look: 'tw_mite',      ai: 'chase',        color: '#B8BCC4', dark: '#4A4E5A', pale: '#F0F2F8', blood: '#8A8E9A', rMul: 0.65, hpMul: 0.45, spdMul: 1.35, name: 'Staple Mite' },
  jackal:      { look: 'tw_courier',   ai: 't_courier',   color: '#E8B83A', dark: '#5A4A18', pale: '#FFF0B0', blood: '#A08A28', rMul: 0.9,  hpMul: 0.7,  spdMul: 1.2,  name: 'Courier Drone' },
  cheetah:     { look: 'tw_roller',    ai: 't_roller',    color: '#3E5A8A', dark: '#1A2840', pale: '#8AB0E8', blood: '#2A4068', rMul: 1.0,  hpMul: 0.85, spdMul: 1.0,  name: 'Swivel Charger' },
  warthog:     { look: 'tw_copier',    ai: 't_copier',    color: '#C8C8C0', dark: '#4A4A48', pale: '#FFFFF8', blood: '#6A6A66', rMul: 1.2,  hpMul: 1.7,  spdMul: 0.7,  name: 'Copier Brute' },
  rhino:       { look: 'tw_safe',      ai: 't_safe',      color: '#5A5E66', dark: '#1E2024', pale: '#A8AEBA', blood: '#3A3E46', rMul: 1.25, hpMul: 1.5,  spdMul: 0.75, name: 'Safe Slammer' },
  baboon:      { look: 'tw_intern',    ai: 't_intern',    color: '#7A9A6A', dark: '#2E4A28', pale: '#D8F0C0', blood: '#4A7A3A', rMul: 1.0,  hpMul: 0.9,  spdMul: 1.0,  name: 'Mutated Intern' },
  honeybadger: { look: 'tw_shredder',  ai: 't_shredder',  color: '#8A5A4A', dark: '#2E1A14', pale: '#FFC8A8', blood: '#6A2E22', rMul: 1.0,  hpMul: 1.1,  spdMul: 1.0,  name: 'Paper Shredder' },
  vulture:     { look: 'tw_cam',       ai: 't_cam',       color: '#4A4E58', dark: '#14161C', pale: '#9AA0AE', blood: '#2E323A', rMul: 0.95, hpMul: 0.65, spdMul: 1.0,  name: 'Watching Orb' },
  mamba:       { look: 'tw_cable',     ai: 't_cable',     color: '#2E3238', dark: '#0E1014', pale: '#5A6070', blood: '#1E2228', rMul: 1.05, hpMul: 1.1,  spdMul: 1.0,  name: 'Cable Serpent' },
  termite:     { look: 'tw_hive',      ai: 't_hive',      color: '#6A7280', dark: '#242830', pale: '#B0BAC8', blood: '#3E444E', rMul: 1.3,  hpMul: 1.6,  spdMul: 0.6,  name: 'Server Hive' },
  ember:       { look: 'tw_battery',   ai: 't_battery',   color: '#8AD84A', dark: '#2E5A14', pale: '#EFFFB0', blood: '#5AA02A', rMul: 0.9,  hpMul: 0.55, spdMul: 0.75, name: 'Spark Battery' },
  lion:        { look: 'tw_reception', ai: 't_reception', color: '#B89A6A', dark: '#4A3820', pale: '#F0E0B8', blood: '#7A5A2E', title: 'The Receptionist', name: 'The Receptionist', r: 52 },
  matriarch:   { look: 'tw_manager',   ai: 't_manager',   color: '#4A4E7A', dark: '#16183A', pale: '#A8ACE8', blood: '#2E3260', title: 'The Floor Manager', name: 'The Floor Manager', r: 56 },
  buffalo:     { look: 'tw_vault',     ai: 't_vault',     color: '#6A6E78', dark: '#22262E', pale: '#C8D0E0', blood: '#3E424C', title: 'The Vault', name: 'The Vault', r: 66 },
  crocodile:   { look: 'tw_scientist', ai: 't_scientist', color: '#7AB86A', dark: '#244A1E', pale: '#E8FFD0', blood: '#4A9A3A', title: 'The Chief Scientist', name: 'The Chief Scientist', r: 54 },
  wildfire:    { look: 'tw_ceo',       ai: 't_ceo',       color: '#2A2E46', dark: '#0A0C18', pale: '#E8C84A', blood: '#B8982A', title: 'The Chief Executive', name: 'The Chief Executive', r: 62 }
};
const ETYPES_TOWER = {};
Object.keys(ETYPES).forEach(id => {
  const k = TOWER_KIT[id]; if (!k) return;
  const base = ETYPES[id], big = !!base.big, mul = big ? TOWER_MUL.boss : TOWER_MUL.common;
  ETYPES_TOWER[id] = Object.assign({}, base, { hp: base.hp * mul.hp * (k.hpMul || 1), dmg: base.dmg * mul.dmg, spd: base.spd * mul.spd * (k.spdMul || 1), val: Math.round(base.val * mul.val),
    r: k.r || base.r * (k.rMul || 1), color: k.color, dark: k.dark, pale: k.pale, blood: k.blood, look: k.look, title: big ? k.title : undefined, tower: true, splitInto: undefined, splitCount: undefined,
    ai: k.ai, kbRes: big ? base.kbRes : Math.max(base.kbRes || 0, 0.1) });
  if (!big && (id === 'vulture' || id === 'jackal')) ETYPES_TOWER[id].flyer = true;
});
Object.keys(TOWER_KIT).forEach(id => { LOOK_NAMES[TOWER_KIT[id].look] = TOWER_KIT[id].name; });

/* the Bestiary's total again, now that this chapter's table exists too */
BESTIARY_TOTAL_CREATURES = BESTIARY_CHAPTERS.reduce(function(n, _, i){ const t = bestiaryTable(i + 1); return n + BESTIARY_ORDER.filter(function(k){ return !!t[k]; }).length; }, 0);

const WAVE_FLAVOUR_TOWER = [
  'The lobby lights flicker', 'Something chitters in the mailroom', 'Staples everywhere', 'Open plan, open season', '',
  'The cafeteria has gone quiet', 'Chairs roll on their own', 'A copier groans awake', 'Every desk has a camera', '',
  'Cables twitch under the floor', 'The server hall is warm', 'Shredders hum behind the glass', 'Interns, but wrong', '',
  'The lab doors are propped open', 'Batteries swell in the walls', 'Something grows in the ducts', 'Every light is red', '',
  'The carpet is thick up here', 'Quiet, expensive, dangerous', 'The board is in session', 'Nobody is on the stairs', ''
];
const BOSS_INTRO_TOWER = {
  lion: 'The Receptionist rings her bell, and the doors lock',
  matriarch: 'The Floor Manager calls an urgent meeting',
  buffalo: 'The Vault door swings open on its own',
  crocodile: 'The Chief Scientist lets out the whole experiment',
  wildfire: 'The Chief Executive stands up from behind the desk'
};

/* a tower wave: the twelve kinds in a slow build-up, thinner than a Chapter 13 wave because the rooms are small */
function buildTowerWave(w, isBoss){
  const cw = chapterWaveOf(w), q = [], pool = [], add = (t, wt) => { if (wt > 0) pool.push({ t: t, w: wt }); }, g = cw * 0.1;
  let budget = TOWER_TUNE.count0 + TOWER_TUNE.countStep * (cw - 1);
  if (isBoss) budget = Math.round(budget * 0.5);
  if (cw <= 2) budget = Math.round(budget * 0.7);
  budget = Math.max(2, Math.round(budget * WAVE_COUNT_MUL));
  add('hyena', 10); add('grub', cw >= 2 ? 3 + g : 0); add('jackal', cw >= 3 ? 3.4 + g : 0); add('cheetah', cw >= 4 ? 3.4 + g : 0);
  add('warthog', cw >= 6 ? 2.4 + g * 0.5 : 0); add('vulture', cw >= 7 ? 3 + g * 0.6 : 0); add('rhino', cw >= 8 ? 2.4 + g * 0.5 : 0); add('baboon', cw >= 9 ? 2.8 + g * 0.5 : 0);
  add('honeybadger', cw >= 11 ? 2.8 + g * 0.5 : 0); add('mamba', cw >= 12 ? 2.8 + g * 0.5 : 0); add('ember', cw >= 14 ? 2.4 + g * 0.5 : 0); add('termite', cw >= 16 ? 1.8 + g * 0.4 : 0);
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

/* ---- behaviours. Each is called like a Marine behaviour from the enemy update's default branch: (e, dt, ux, uy, d) -> [mvx, mvy], e.spdE is its speed.
   ux and uy already point along the way round the walls when she is out of sight (towerSteer in js/30c-tower-floors.js), and every shot dies on a wall, but
   the shooters still check towerSight so they do not waste a volley on a wall. ---- */
function twSight(e){ return towerSight(e.x, e.y, P.x, P.y); }
function twLat(e){ return e.navV ? 0 : 1; }                /* sideways drift is for open floor: on the way round a wall a creature goes straight along the path */
function twFan(e, n, spread, speed, dmgMul, color, r, a0){
  const a = a0 === undefined ? leadAim(e, speed) : a0;
  for (let k = 0; k < n; k++) fireBullet(e, a + (k - (n - 1) / 2) * spread, speed, dmgMul, color, r);
}
function twRing(e, n, speed, dmgMul, color, r, off){ for (let k = 0; k < n; k++) fireBullet(e, k * TAU / n + (off || 0), speed, dmgMul, color, r); }
function twSpawnNear(e, type, n, rad){
  if (G.enemies.length > 200) return;
  for (let k = 0; k < n; k++){ const a = k * TAU / n + Math.random(), p = towerOpenNear(e.x + Math.cos(a) * rad, e.y + Math.sin(a) * rad); spawnEnemy(type, p.x, p.y, e.waveRef); }
}
const TOWER_AI = {
  t_rat(e, dt, ux, uy, d){                                  /* Scrap Rat: weaves in with the pack, then a snapping lunge */
    const spd = e.spdE; e.stateT -= dt;
    if (e.state === 'lunge'){ if (e.stateT <= 0){ e.state = 'idle'; e.stateT = rand(0.9, 1.6); } e.ang = Math.atan2(e.dashVY, e.dashVX); return [e.dashVX, e.dashVY]; }
    if (e.jSeed === undefined) e.jSeed = Math.random() * 10;
    const w = Math.sin(e.anim * 0.9 + e.jSeed) * 0.9; e.ang = Math.atan2(uy, ux);
    if (d < 170 && e.stateT <= 0 && twSight(e)){ e.state = 'lunge'; e.stateT = 0.28; e.dashVX = ux * spd * 3.2; e.dashVY = uy * spd * 3.2; return [e.dashVX, e.dashVY]; }
    return [(ux - uy * w * twLat(e)) * spd, (uy + ux * w * twLat(e)) * spd];
  },
  t_courier(e, dt, ux, uy, d){                              /* Courier Drone: circles at a distance, then delivers itself straight through her */
    const spd = e.spdE; e.stateT -= dt;
    if (e.state === 'dash'){ if (e.stateT <= 0){ e.state = 'idle'; e.stateT = rand(1.4, 2.2); } e.ang = Math.atan2(e.dashVY, e.dashVX); return [e.dashVX, e.dashVY]; }
    e.ang = Math.atan2(uy, ux);
    if (e.state === 'wind'){ if (e.stateT <= 0){ e.state = 'dash'; e.stateT = 0.6; e.dashVX = ux * 780; e.dashVY = uy * 780; sfx('whoosh', 0.14); } return [0, 0]; }
    if (e.dirS === undefined) e.dirS = Math.random() < 0.5 ? 1 : -1;
    const rad = d > 340 ? 1 : d < 250 ? -0.6 : 0;
    if (e.stateT <= 0 && d < 520 && twSight(e)){ e.state = 'wind'; e.stateT = 0.45; }
    const lat = 0.9 * twLat(e); return [ux * spd * rad - uy * spd * lat * e.dirS, uy * spd * rad + ux * spd * lat * e.dirS];
  },
  t_roller(e, dt, ux, uy, d){                               /* Swivel Charger: an office chair that spins up, then rolls flat out, and has a hard time stopping */
    const want = Math.atan2(uy, ux); e.stateT -= dt;
    if (e.state === 'roll'){
      if (Math.random() < dt * 30) addParticle(e.x, e.y, rand(-20, 20), rand(-20, 20), rand(2, 3), 0.25, '#8AB0E8', { drag: 2 });
      if (e.stateT <= 0){ e.state = 'idle'; e.stateT = rand(1.2, 2); }
      e.ang = Math.atan2(e.dashVY, e.dashVX); return [e.dashVX, e.dashVY];
    }
    e.ang = turnTo(e.ang, want, 3 * dt);
    if (e.state === 'wind'){ if (e.stateT <= 0){ e.state = 'roll'; e.stateT = 0.8; e.dashVX = Math.cos(e.ang) * 640; e.dashVY = Math.sin(e.ang) * 640; sfx('whoosh', 0.12); } return [0, 0]; }
    if (e.stateT <= 0 && d < 560 && d > 160 && twSight(e)){ e.state = 'wind'; e.stateT = 0.5; }
    return [ux * e.spdE, uy * e.spdE];
  },
  t_copier(e, dt, ux, uy, d){                               /* Copier Brute: lumbers up and jams, then sprays a fan of paper */
    e.ang = turnTo(e.ang, Math.atan2(uy, ux), 2.6 * dt); e.stateT -= dt;
    if (e.state === 'jam'){ if (e.stateT <= 0){ twFan(e, 5, 0.2, 380, 0.5, '#FFFFF4', 4); sfx('spit', 0.08); e.state = 'idle'; e.stateT = rand(2.2, 3.2); } return [0, 0]; }
    if (e.stateT <= 0 && d < 480 && twSight(e)){ e.state = 'jam'; e.stateT = 0.55; }
    return [ux * e.spdE, uy * e.spdE];
  },
  t_safe(e, dt, ux, uy, d){                                 /* Safe Slammer: walks at her, then drops its whole weight on the spot with a ring of dust */
    e.ang = turnTo(e.ang, Math.atan2(uy, ux), 2.2 * dt); e.stateT -= dt;
    if (e.state === 'slam'){
      if (e.stateT <= 0){ const x = e.x + Math.cos(e.ang) * 70, y = e.y + Math.sin(e.ang) * 70; hostileBlast(x, y, 130, e.dmg, '#C8CCD6', { kb: 90, shake: 8 }); e.state = 'idle'; e.stateT = rand(1.8, 2.8); }
      return [0, 0];
    }
    if (e.stateT <= 0 && d < 200){ e.state = 'slam'; e.stateT = 0.7; const x = e.x + Math.cos(e.ang) * 70, y = e.y + Math.sin(e.ang) * 70; addMarker(x, y, 130, 0.7, '#C8CCD6', null, { owner: e }); }
    return [ux * e.spdE, uy * e.spdE];
  },
  t_intern(e, dt, ux, uy, d){                               /* Mutated Intern: crouches, then jumps clear across the room at her */
    e.stateT -= dt;
    if (e.state === 'leap'){
      if (e.stateT <= 0){ e.state = 'idle'; e.stateT = rand(1.2, 2); hostileBlast(e.x, e.y, 60, e.dmg * 0.8, '#D8F0C0', { source: e }); }
      e.ang = Math.atan2(e.dashVY, e.dashVX); return [e.dashVX, e.dashVY];
    }
    e.ang = Math.atan2(uy, ux);
    if (e.state === 'wind'){ if (e.stateT <= 0){ e.state = 'leap'; e.stateT = 0.42; e.dashVX = ux * 800; e.dashVY = uy * 800; sfx('whoosh', 0.12); } return [0, 0]; }
    if (e.stateT <= 0 && d < 480 && d > 150 && twSight(e)){ e.state = 'wind'; e.stateT = 0.45; }
    return [ux * e.spdE, uy * e.spdE];
  },
  t_shredder(e, dt, ux, uy, d){                             /* Paper Shredder: a quick melee thing that spins its blades when she is close */
    e.ang = turnTo(e.ang, Math.atan2(uy, ux), 4 * dt); e.stateT -= dt;
    if (e.state === 'spin'){
      if (Math.random() < dt * 30) addParticle(e.x, e.y, rand(-60, 60), rand(-60, 60), rand(1.5, 3), 0.3, '#FFFFF0', { drag: 2 });
      if (e.stateT <= 0){ hostileBlast(e.x, e.y, 85, e.dmg * 0.9, '#FFC8A8', { source: e, shake: 4 }); e.state = 'idle'; e.stateT = rand(1.3, 2); }
      return [ux * e.spdE * 0.5, uy * e.spdE * 0.5];
    }
    if (e.stateT <= 0 && d < 120){ e.state = 'spin'; e.stateT = 0.6; }
    return [ux * e.spdE, uy * e.spdE];
  },
  t_cam(e, dt, ux, uy, d){                                  /* Watching Orb: keeps its distance with her in view, stares, and fires a thin red beam */
    e.ang = Math.atan2(uy, ux); e.stateT -= dt;
    if (e.state === 'stare'){
      if (e.stateT <= 0){ const a = Math.atan2(P.y - e.y, P.x - e.x); addBeam(e.x, e.y, e.x + Math.cos(a) * 900, e.y + Math.sin(a) * 900, 22, 0.55, 0.2, e.dmg * 0.9, '#FF5A4A', { owner: e }); e.state = 'idle'; e.stateT = rand(2, 3.2); }
      return [0, 0];
    }
    if (e.stateT <= 0 && d < 620 && twSight(e)){ e.state = 'stare'; e.stateT = 0.5; sfx('whoosh', 0.06); }
    const dir = d > 420 ? 1 : d < 300 ? -0.8 : 0;
    return [ux * e.spdE * dir, uy * e.spdE * dir];
  },
  t_cable(e, dt, ux, uy, d){                                /* Cable Serpent: rears up, weaves in, and whips at her from a little way off */
    e.stateT -= dt;
    if (e.state === 'whip'){ if (e.stateT <= 0){ e.state = 'idle'; e.stateT = rand(1.4, 2.2); hostileBlast(e.x + Math.cos(e.ang) * 70, e.y + Math.sin(e.ang) * 70, 70, e.dmg, '#8A90A0', { source: e }); } return [0, 0]; }
    e.ang = Math.atan2(uy, ux);
    if (e.jSeed === undefined) e.jSeed = Math.random() * 10;
    const w = Math.sin(e.anim * 0.7 + e.jSeed) * 0.8;
    if (e.stateT <= 0 && d < 190){ e.state = 'whip'; e.stateT = 0.45; addMarker(e.x + Math.cos(e.ang) * 70, e.y + Math.sin(e.ang) * 70, 70, 0.45, '#8A90A0', null, { owner: e }); }
    return [(ux - uy * w * twLat(e)) * e.spdE, (uy + ux * w * twLat(e)) * e.spdE];
  },
  t_hive(e, dt, ux, uy, d){                                 /* Server Hive: crawls closer and lets out a few Staple Mites every few seconds */
    e.ang = turnTo(e.ang, Math.atan2(uy, ux), 1.6 * dt); e.stateT -= dt;
    if (e.state === 'vent'){ if (e.stateT <= 0){ twSpawnNear(e, 'grub', 3, e.r + 20); e.state = 'idle'; e.stateT = rand(3.2, 4.4); } return [0, 0]; }
    if (e.stateT <= 0 && d < 900 && G.enemies.length < 160){ e.state = 'vent'; e.stateT = 0.6; }
    return [ux * e.spdE, uy * e.spdE];
  },
  t_battery(e, dt, ux, uy, d){                              /* Spark Battery: swells as it gets close, then goes off */
    e.ang = Math.atan2(uy, ux); e.stateT -= dt;
    if (e.state === 'swell'){
      if (e.stateT <= 0){ hostileBlast(e.x, e.y, 150, e.dmg * 1.1, '#CFFF6A', { source: e, shake: 8 }); burstParticles(e.x, e.y, 14, '#EFFFB0', 240, 5, { glow: true }); damageEnemy(e, 1e15, { noCrit: true, quiet: true }); }
      return [ux * e.spdE * 0.3, uy * e.spdE * 0.3];
    }
    if (d < 120){ e.state = 'swell'; e.stateT = 0.55; addMarker(e.x, e.y, 150, 0.55, '#CFFF6A', null, { owner: e }); }
    return [ux * e.spdE, uy * e.spdE];
  },

  /* ---------- the bosses ---------- */
  t_reception(e, dt, ux, uy, d){                            /* The Receptionist: a reception desk on spider legs. Memos in fans, a bell that rings the whole room and calls for help, and phone cords that whip across the floor */
    e.ang = turnTo(e.ang, Math.atan2(uy, ux), 3 * dt); e.stateT -= dt;
    if (e.pat === undefined){ e.pat = 0; e.p2 = false; e.strafe = Math.random() < 0.5 ? 1 : -1; }
    if (!e.p2 && e.hp < e.maxHp * 0.5){ e.p2 = true; e.state = 'ring'; e.stateT = 0.9; sfx('boom', 0.2); addShake(10); screenFlash('#FFE49A', 0.2, 0.3); }
    const fast = e.p2 ? 0.7 : 1;
    if (e.state === 'idle'){
      const dir = d > 300 ? 1 : d < 190 ? -0.7 : 0.1;
      if (e.stateT <= 0){ const p = e.pat++ % 3; e.state = p === 0 ? 'memowind' : p === 1 ? 'cordwind' : 'ring'; e.stateT = p === 2 ? 0.8 : 0.6; e.shotsLeft = e.p2 ? 3 : 2; }
      return [ux * e.spdE * dir - uy * e.spdE * 0.4 * e.strafe * twLat(e), uy * e.spdE * dir + ux * e.spdE * 0.4 * e.strafe * twLat(e)];
    }
    if (e.state === 'memowind'){
      if (e.stateT <= 0){ twFan(e, e.p2 ? 7 : 5, 0.16, 430, 0.45, '#FFFFF4', 5); sfx('spit', 0.1); e.shotsLeft--; if (e.shotsLeft > 0) e.stateT = 0.5; else { e.state = 'idle'; e.stateT = 1.4 * fast; e.strafe *= -1; } }
      return [0, 0];
    }
    if (e.state === 'cordwind'){
      if (e.stateT <= 0){
        const a = Math.atan2(P.y - e.y, P.x - e.x), n = e.p2 ? 3 : 2;
        for (let k = 0; k < n; k++){ const aa = a + (k - (n - 1) / 2) * 0.6; addBeam(e.x, e.y, e.x + Math.cos(aa) * 1300, e.y + Math.sin(aa) * 1300, 34, 0.8, 0.3, e.dmg * 0.7, '#FFE49A'); }
        sfx('whoosh', 0.2); e.state = 'idle'; e.stateT = 1.7 * fast;
      }
      return [0, 0];
    }
    if (e.state === 'ring'){
      if (e.ringMk === undefined){ e.ringMk = true; addMarker(e.x, e.y, 270, e.stateT, '#FFE49A', null, { owner: e }); }
      if (e.stateT <= 0){ e.ringMk = undefined; hostileBlast(e.x, e.y, 270, e.dmg * 0.7, '#FFE49A', { kb: 140, shake: 10 }); addShock(e.x, e.y, 290, 0.6, 0, '#FFE49A'); sfx('boom', 0.15); twSpawnNear(e, 'hyena', e.p2 ? 5 : 3, e.r + 60); e.state = 'idle'; e.stateT = 1.5 * fast; }
      return [0, 0];
    }
    e.state = 'idle'; e.stateT = 1; return [0, 0];
  },
  t_manager(e, dt, ux, uy, d){                              /* The Floor Manager: charges across the room, and slams into the wall if she steps aside. Calls meetings (marked floor, then a blast) and summons Swivel Chargers */
    e.stateT -= dt;
    if (e.pat === undefined){ e.pat = 0; e.p2 = false; }
    if (!e.p2 && e.hp < e.maxHp * 0.5){ e.p2 = true; e.state = 'meeting'; e.stateT = 0.9; sfx('boom', 0.2); addShake(10); screenFlash('#A8ACE8', 0.2, 0.3); }
    const fast = e.p2 ? 0.7 : 1;
    if (e.state === 'charge'){
      if (e.dashVX === 0 && e.dashVY === 0){ e.dashVX = Math.cos(e.ang) * 760; e.dashVY = Math.sin(e.ang) * 760; sfx('whoosh', 0.2); }
      if (Math.random() < dt * 40) addParticle(e.x, e.y, rand(-30, 30), rand(-30, 30), rand(3, 5), 0.3, '#A8ACE8', { drag: 2 });
      const wall = towerWallAhead(e, Math.cos(e.ang), Math.sin(e.ang), e.r + 36);
      if (e.stateT <= 0 || wall){
        if (wall){ e.state = 'stun'; e.stateT = 1.4; e.dashVX = e.dashVY = 0; hostileBlast(e.x, e.y, 180, e.dmg * 0.6, '#A8ACE8', { kb: 100, shake: 14 }); addShake(14); sfx('boom', 0.2); addText(e.x, e.y - e.r - 20, 'Stunned', '#FFE49A', 18, false); }
        else { e.state = 'idle'; e.stateT = 1.2 * fast; e.dashVX = e.dashVY = 0; }
      }
      return [e.dashVX, e.dashVY];
    }
    if (e.state === 'stun'){ if (e.stateT <= 0){ e.state = 'idle'; e.stateT = 0.8; } return [0, 0]; }
    e.ang = turnTo(e.ang, Math.atan2(uy, ux), 3 * dt);
    if (e.state === 'idle'){
      if (e.stateT <= 0){ const p = e.pat++ % 3; e.state = p === 0 ? 'chargewind' : p === 1 ? 'meeting' : 'chargewind'; e.stateT = p === 1 ? 0.9 : 0.8; if (p === 0 || p === 2){ const a = Math.atan2(P.y - e.y, P.x - e.x); addBeam(e.x, e.y, e.x + Math.cos(a) * 1500, e.y + Math.sin(a) * 1500, 70, 0.8, 0.1, 0, '#A8ACE8', { owner: e }); } }
      return [ux * e.spdE * 0.5, uy * e.spdE * 0.5];
    }
    if (e.state === 'chargewind'){ if (e.stateT <= 0){ e.state = 'charge'; e.stateT = 1.3; e.dashVX = e.dashVY = 0; } return [0, 0]; }
    if (e.state === 'meeting'){
      if (e.meetMk === undefined){
        e.meetMk = true; const n = e.p2 ? 8 : 6, dm = e.dmg * 0.7;
        for (let k = 0; k < n; k++){ const p = towerOpenNear(P.x + (k ? rand(-300, 300) : 0), P.y + (k ? rand(-300, 300) : 0)); addMarker(p.x, p.y, 100, 0.8 + k * 0.1, '#A8ACE8', function(m){ hostileBlast(m.x, m.y, 100, dm, '#C8CCFF', { shake: 6 }); }); }
      }
      if (e.stateT <= 0){ e.meetMk = undefined; twSpawnNear(e, 'cheetah', e.p2 ? 3 : 2, e.r + 50); e.state = 'idle'; e.stateT = 1.6 * fast; }
      return [0, 0];
    }
    e.state = 'idle'; e.stateT = 1; return [0, 0];
  },
  t_vault(e, dt, ux, uy, d){                                /* The Vault: a walking strongroom. Slams the floor, rolls a volley of coins out of its open door, and drops safes from above */
    e.ang = turnTo(e.ang, Math.atan2(uy, ux), 1.8 * dt); e.stateT -= dt;
    if (e.pat === undefined){ e.pat = 0; e.p2 = false; e.open = 0; }
    if (!e.p2 && e.hp < e.maxHp * 0.5){ e.p2 = true; e.state = 'quake'; e.stateT = 0.9; sfx('boom', 0.2); addShake(10); screenFlash('#C8D0E0', 0.2, 0.3); }
    e.open = (e.state === 'coinwind') ? Math.min(1, e.open + dt * 3) : Math.max(0, e.open - dt * 2);
    const fast = e.p2 ? 0.7 : 1;
    if (e.state === 'idle'){
      const dir = d > 280 ? 1 : d < 170 ? -0.5 : 0;
      if (e.stateT <= 0){ const p = e.pat++ % 3; e.state = p === 0 ? 'slamwind' : p === 1 ? 'coinwind' : 'dropwind'; e.stateT = p === 1 ? 0.8 : 0.7; e.shotsLeft = e.p2 ? 3 : 2; }
      return [ux * e.spdE * dir, uy * e.spdE * dir];
    }
    if (e.state === 'slamwind'){
      if (e.stateT === undefined || e.slamMk === undefined){ e.slamMk = true; addMarker(e.x, e.y, 250, e.stateT, '#C8D0E0', null, { owner: e }); }
      if (e.stateT <= 0){ e.slamMk = undefined; hostileBlast(e.x, e.y, 250, e.dmg * 0.8, '#C8D0E0', { kb: 150, shake: 14 }); addShock(e.x, e.y, 280, 0.6, 0, '#C8D0E0'); twRing(e, e.p2 ? 14 : 10, 320, 0.4, '#E8C84A', 5); e.state = 'idle'; e.stateT = 1.6 * fast; }
      return [0, 0];
    }
    if (e.state === 'coinwind'){
      if (e.stateT <= 0){ twFan(e, e.p2 ? 9 : 7, 0.13, 480, 0.4, '#FFD84A', 6); sfx('spit', 0.1); e.shotsLeft--; if (e.shotsLeft > 0) e.stateT = 0.45; else { e.state = 'idle'; e.stateT = 1.5 * fast; } }
      return [0, 0];
    }
    if (e.state === 'dropwind'){
      if (e.stateT <= 0){
        const n = e.p2 ? 7 : 5, dm = e.dmg * 0.75;
        for (let k = 0; k < n; k++){ const p = towerOpenNear(P.x + (k ? rand(-260, 260) : 0), P.y + (k ? rand(-260, 260) : 0)); addMarker(p.x, p.y, 105, 0.8 + k * 0.1, '#C8D0E0', function(m){ hostileBlast(m.x, m.y, 105, dm, '#E0E6F0', { shake: 6, column: true }); }); }
        e.state = 'idle'; e.stateT = 1.7 * fast;
      }
      return [0, 0];
    }
    if (e.state === 'quake'){ if (e.stateT <= 0){ hostileBlast(e.x, e.y, 320, e.dmg, '#C8D0E0', { kb: 200, shake: 16 }); addShock(e.x, e.y, 340, 0.7, 0, '#C8D0E0'); twSpawnNear(e, 'rhino', 2, e.r + 70); e.state = 'idle'; e.stateT = 1; } return [0, 0]; }
    e.state = 'idle'; e.stateT = 1; return [0, 0];
  },
  t_scientist(e, dt, ux, uy, d){                            /* The Chief Scientist: flasks that burst into green gas, a sprint across the room, and a pen full of the experiment */
    e.ang = turnTo(e.ang, Math.atan2(uy, ux), 3 * dt); e.stateT -= dt;
    if (e.pat === undefined){ e.pat = 0; e.p2 = false; e.strafe = Math.random() < 0.5 ? 1 : -1; }
    if (!e.p2 && e.hp < e.maxHp * 0.5){ e.p2 = true; e.state = 'release'; e.stateT = 0.9; sfx('boom', 0.2); addShake(10); screenFlash('#C8FFA0', 0.2, 0.3); }
    const fast = e.p2 ? 0.7 : 1;
    if (e.state === 'sprint'){
      if (e.dashVX === 0 && e.dashVY === 0){ e.dashVX = Math.cos(e.ang) * 640; e.dashVY = Math.sin(e.ang) * 640; sfx('whoosh', 0.15); }
      if (Math.random() < dt * 8) hostileZone(e.x, e.y, 44, 2.8, e.dmg * 0.12, '#8AE86A');
      if (e.stateT <= 0 || towerWallAhead(e, Math.cos(e.ang), Math.sin(e.ang), e.r + 30)){ e.state = 'idle'; e.stateT = 1.3 * fast; e.dashVX = e.dashVY = 0; }
      return [e.dashVX, e.dashVY];
    }
    if (e.state === 'idle'){
      const dir = d > 320 ? 1 : d < 210 ? -0.8 : 0.1;
      if (e.stateT <= 0){ const p = e.pat++ % 3; e.state = p === 0 ? 'flaskwind' : p === 1 ? 'sprintwind' : 'flaskwind'; e.stateT = p === 1 ? 0.7 : 0.6; e.shotsLeft = e.p2 ? 3 : 2; if (p === 1){ const a = Math.atan2(P.y - e.y, P.x - e.x); addBeam(e.x, e.y, e.x + Math.cos(a) * 1200, e.y + Math.sin(a) * 1200, 60, 0.7, 0.1, 0, '#8AE86A', { owner: e }); } }
      return [ux * e.spdE * dir - uy * e.spdE * 0.4 * e.strafe * twLat(e), uy * e.spdE * dir + ux * e.spdE * 0.4 * e.strafe * twLat(e)];
    }
    if (e.state === 'flaskwind'){
      if (e.stateT <= 0){
        const n = e.p2 ? 5 : 3, dm = e.dmg * 0.6;
        for (let k = 0; k < n; k++){ const p = towerOpenNear(P.x + P.vx * 0.4 + (k ? rand(-220, 220) : 0), P.y + P.vy * 0.4 + (k ? rand(-220, 220) : 0)); addMarker(p.x, p.y, 90, 0.7 + k * 0.1, '#8AE86A', function(m){ hostileBlast(m.x, m.y, 90, dm, '#B8FF8A', { shake: 5 }); hostileZone(m.x, m.y, 70, 4, e.dmg * 0.1, '#8AE86A'); }); }
        sfx('spit', 0.1); e.shotsLeft--; if (e.shotsLeft > 0) e.stateT = 0.6; else { e.state = 'idle'; e.stateT = 1.4 * fast; e.strafe *= -1; }
      }
      return [0, 0];
    }
    if (e.state === 'sprintwind'){ if (e.stateT <= 0){ e.state = 'sprint'; e.stateT = 1.1; e.dashVX = e.dashVY = 0; } return [0, 0]; }
    if (e.state === 'release'){ if (e.stateT <= 0){ hostileBlast(e.x, e.y, 240, e.dmg * 0.8, '#B8FF8A', { kb: 160, shake: 12 }); twSpawnNear(e, 'baboon', 3, e.r + 60); e.state = 'idle'; e.stateT = 1; } return [0, 0]; }
    e.state = 'idle'; e.stateT = 1; return [0, 0];
  },
  t_ceo(e, dt, ux, uy, d){                                  /* The Chief Executive: pen-dagger volleys, a stock chart that draws itself across the room in beams, a hostile takeover (security everywhere), and a golden parachute that comes down on her */
    e.ang = turnTo(e.ang, Math.atan2(uy, ux), 2.6 * dt); e.stateT -= dt;
    if (e.pat === undefined){ e.pat = 0; e.phase = 1; e.glow = 0; e.strafe = Math.random() < 0.5 ? 1 : -1; }
    const f = e.hp / e.maxHp, ph = f < 0.25 ? 3 : f < 0.55 ? 2 : 1;
    if (ph !== e.phase){ e.phase = ph; e.state = 'roar'; e.stateT = 1.1; sfx('boom', 0.25); addShake(14); screenFlash('#FFE49A', 0.25, 0.35); }
    e.glow = e.state === 'idle' ? Math.max(0, e.glow - dt * 2) : Math.min(1, e.glow + dt * 3);
    const rate = ph === 3 ? 0.6 : ph === 2 ? 0.8 : 1;
    if (e.state === 'idle'){
      const dir = d > 330 ? 1 : d < 220 ? -0.7 : 0.1;
      if (e.stateT <= 0){ const p = e.pat++ % 4; e.state = ['penwind', 'chartwind', 'takeover', 'chutewind'][p]; e.stateT = p === 2 ? 1 : 0.7; e.shotsLeft = ph === 3 ? 4 : 3; }
      return [ux * e.spdE * dir - uy * e.spdE * 0.3 * e.strafe * twLat(e), uy * e.spdE * dir + ux * e.spdE * 0.3 * e.strafe * twLat(e)];
    }
    if (e.state === 'roar'){ if (e.stateT <= 0){ e.state = 'idle'; e.stateT = 0.8; e.strafe *= -1; } return [0, 0]; }
    if (e.state === 'penwind'){
      if (e.stateT <= 0){ twFan(e, ph === 1 ? 3 : 5, 0.12, 560, 0.45, '#E8C84A', 5); sfx('spit', 0.1); e.shotsLeft--; if (e.shotsLeft > 0) e.stateT = 0.36; else { e.state = 'idle'; e.stateT = 1.4 * rate; } }
      return [ux * e.spdE * 0.2, uy * e.spdE * 0.2];
    }
    if (e.state === 'chartwind'){
      if (e.stateT <= 0){
        const a = Math.atan2(P.y - e.y, P.x - e.x), n = ph === 3 ? 3 : 2;
        for (let k = 0; k < n; k++){ const aa = a + (k - (n - 1) / 2) * 0.5 + (k % 2 ? 0.2 : -0.2); addBeam(e.x, e.y, e.x + Math.cos(aa) * 1400, e.y + Math.sin(aa) * 1400, 38, 0.85, 0.35, e.dmg * 0.7, '#6AE8A0'); }
        sfx('whoosh', 0.2); e.state = 'idle'; e.stateT = 1.8 * rate;
      }
      return [0, 0];
    }
    if (e.state === 'takeover'){
      if (e.tkMk === undefined){ e.tkMk = true; addMarker(e.x, e.y, 300, e.stateT, '#E8C84A', null, { owner: e }); }
      if (e.stateT <= 0){ e.tkMk = undefined; hostileBlast(e.x, e.y, 300, e.dmg * 0.7, '#E8C84A', { kb: 160, shake: 12 }); addShock(e.x, e.y, 320, 0.7, 0, '#E8C84A'); twRing(e, ph === 1 ? 10 : 14, 340, 0.4, '#E8C84A', 5, (e.pat % 2) * 0.2); twSpawnNear(e, ph === 3 ? 'jackal' : 'hyena', ph === 1 ? 3 : 5, e.r + 60); e.state = 'idle'; e.stateT = 1.7 * rate; }
      return [0, 0];
    }
    if (e.state === 'chutewind'){
      if (e.stateT <= 0){
        const n = ph === 1 ? 5 : ph === 2 ? 7 : 9, dm = e.dmg * 0.65;
        for (let k = 0; k < n; k++){ const p = towerOpenNear(P.x + P.vx * 0.5 * (k % 3) + rand(-200, 200), P.y + P.vy * 0.5 * (k % 3) + rand(-200, 200)); addMarker(p.x, p.y, 90, 0.7 + k * 0.08, '#E8C84A', function(m){ hostileBlast(m.x, m.y, 90, dm, '#FFE49A', { column: true, shake: 5 }); }); }
        e.state = 'idle'; e.stateT = 1.5 * rate;
      }
      return [0, 0];
    }
    e.state = 'idle'; e.stateT = 1; return [0, 0];
  }
};
