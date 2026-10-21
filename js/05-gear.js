'use strict';
/* Weapons, gear sets, ownership and equipping, trinkets, prize wheel, crates. */
/* ========================= 30b. WEAPONS ========================= */
/* Weapons replace the kick entirely. Each is a different rhythm rather than
   just a bigger number: arc width, cadence, reach and on-hit behaviour all
   change. `arcs` lets one swing land in several directions at once. */
const DEFAULT_WEAPON = {
  id: 'hooves', name: 'Bare Hooves', color: '#FFE6A3',
  cd: 0.40, dmg: 30, range: 104, arc: 1.55, kb: 470, arcs: [0],
  blurb: 'The plain two-legged kick you started with.'
};

const WEAPONS = {
  hooves: Object.assign({}, DEFAULT_WEAPON, { blurb: 'The plain two-legged kick, properly reinforced as gear.' }),
  spurs: {
    id: 'spurs', name: 'Thornweave Spurs', color: '#C7F06A',
    cd: 0.25, dmg: 18, range: 96, arc: 1.45, kb: 210, arcs: [0],
    bleed: 0.55, bleedT: 2.4,
    blurb: 'Fast, shallow cuts that leave everything bleeding out.'
  },
  stone: {
    id: 'stone', name: 'Stoneshod Hooves', color: '#D8CFC2',
    cd: 0.68, dmg: 64, range: 112, arc: 1.95, kb: 820, arcs: [0],
    shock: { rad: 128, dmgMul: 0.5, kb: 300 },
    blurb: 'Slow, enormous, and the ground cracks where it lands.'
  },
  icefangs: {
    id: 'icefangs', name: 'Icicle Fangs', color: '#8FE0FF',
    cd: 0.30, dmg: 20, range: 92, arc: 1.5, kb: 240, arcs: [0],
    slow: 0.5, slowT: 1.6,
    blurb: 'Quick bites that leave frost in the wound, slowing anything they touch.'
  },
  lance: {
    id: 'lance', name: 'Acacia Lance', color: '#9BC45C',
    cd: 0.46, dmg: 54, range: 210, arc: 0.55, kb: 540, arcs: [0],
    stun: 0.3,
    blurb: 'A narrow, precise thrust that pins whatever it hits in place.'
  },
  twin: {
    id: 'twin', name: 'Twin Tails', color: '#A8E6F0',
    cd: 0.36, dmg: 29, range: 102, arc: 1.5, kb: 430, arcs: [0, Math.PI],
    blurb: 'Strikes forward and backward on the same beat.'
  },
  glaciermaul: {
    id: 'glaciermaul', name: 'Glacier Maul', color: '#B7E8FF',
    cd: 0.74, dmg: 70, range: 116, arc: 1.9, kb: 900, arcs: [0],
    shock: { rad: 150, dmgMul: 0.55, kb: 360 },
    freezeChance: 0.3, freezeT: 0.9,
    blurb: 'Slower than stone and twice as cold. It sometimes freezes solid.'
  },
  sunspear: {
    id: 'sunspear', name: 'Sunforged Spear', color: '#FFD166',
    cd: 0.44, dmg: 46, range: 124, arc: 1.65, kb: 520, arcs: [0],
    projectile: { dmgMul: 0.85, speed: 660, pierce: 1, rad: 7 },
    blurb: 'Every swing throws a lance of hot light along the same line.'
  },
  aurora: {
    id: 'aurora', name: 'Aurora Fang', color: '#8FFFD1',
    cd: 0.42, dmg: 42, range: 118, arc: 1.5, kb: 460, arcs: [0],
    chain: { count: 3, range: 220, falloff: 0.82 },
    blurb: 'Every strike arcs to nearby enemies in a ribbon of cold light.'
  },
  starbreaker: {
    id: 'starbreaker', name: 'Starbreaker', color: '#FFD84D',
    cd: 0.52, dmg: 60, range: 132, arc: TAU, kb: 580, arcs: [0], spin: true,
    shock: { rad: 150, dmgMul: 0.55, kb: 340 },
    meteor: { chance: 0.24, dmgMul: 1.5, rad: 120 },
    blurb: 'A full spinning sweep that sometimes calls a star down with it.'
  },
  tideshellclub: {
    id: 'tideshellclub', name: 'Tideshell Club', color: '#6FA8C9',
    cd: 0.50, dmg: 34, range: 100, arc: 1.6, kb: 380, arcs: [0],
    slow: 0.35, slowT: 1.3,
    blurb: 'A heavy tideshell club, slick with brine -- every hit leaves footing unsteady.'
  },
  riptide: {
    id: 'riptide', name: 'Riptide Trident', color: '#3E8FBF',
    cd: 0.46, dmg: 50, range: 200, arc: 0.6, kb: 500, arcs: [0],
    stun: 0.3,
    blurb: 'A three-pronged thrust that drags the tide in behind it, briefly pinning whatever it catches.'
  },
  abyssal: {
    id: 'abyssal', name: 'Abyssal Anglerfang', color: '#3EFFC8',
    cd: 0.42, dmg: 44, range: 118, arc: 1.5, kb: 460, arcs: [0],
    freezeChance: 0.24, freezeT: 0.7,
    projectile: { dmgMul: 0.7, speed: 600, pierce: 1, rad: 6 },
    blurb: 'Each bite carries a jolt of bio-electric current, and flings a glowing lure-orb along the same line.'
  },
  vinelash: {
    id: 'vinelash', name: 'Vinelash', color: '#5FA83C',
    cd: 0.34, dmg: 24, range: 118, arc: 1.3, kb: 300, arcs: [0],
    bleed: 0.4, bleedT: 2.2, slow: 0.2, slowT: 0.8,
    blurb: 'A whip of thorned liana -- it cuts, and it tangles.'
  },
  jaguarfang: {
    id: 'jaguarfang', name: 'Jaguar Fangs', color: '#D9A441',
    cd: 0.30, dmg: 30, range: 104, arc: 1.2, kb: 360, arcs: [-0.45, 0.45],
    bleed: 0.5, bleedT: 2.0,
    blurb: 'Two raking swipes in one, the way a jaguar actually strikes.'
  },
  leviathan: {
    id: 'leviathan', name: 'Leviathan\u2019s Maw', color: '#6FE0FF',
    cd: 0.56, dmg: 66, range: 130, arc: TAU, kb: 620, arcs: [0], spin: true,
    shock: { rad: 160, dmgMul: 0.6, kb: 380 },
    pull: { rad: 220, force: 260 },
    blurb: 'A full spinning strike that drags the tide itself inward, hauling anything nearby into range.'
  },
  embers: {
    id: 'embers', name: 'Emberspurs', color: '#FF8A4A',
    cd: 0.32, dmg: 24, range: 96, arc: 1.5, kb: 230, arcs: [0],
    bleed: 0.6, bleedT: 3.0,
    blurb: 'Glowing spurs that leave everything they cut smouldering.'
  },
  rebar: {
    id: 'rebar', name: 'Rebar Kickers', color: '#B9BEC6',
    cd: 0.34, dmg: 26, range: 100, arc: 1.6, kb: 400, arcs: [0],
    blurb: 'Steel bars strapped to the hooves. Quick, and they shove hard.'
  },
  regolith: {
    id: 'regolith', name: 'Regolith Hammer', color: '#C9CCD6',
    cd: 0.62, dmg: 56, range: 110, arc: 1.85, kb: 760, arcs: [0],
    shock: { rad: 140, dmgMul: 0.5, kb: 320 },
    blurb: 'A moon-dust slam: slow, and the ground ripples out around it.'
  },
  ironclad: {
    id: 'ironclad', name: 'Ironclad Hooves', color: '#C0643A',
    cd: 0.5, dmg: 50, range: 112, arc: 1.7, kb: 640, arcs: [0],
    stun: 0.3,
    blurb: 'Red-iron horseshoes that ring like a bell and rattle what they hit.'
  },
  tranq: {
    id: 'tranq', name: 'Tranq Prod', color: '#7CFFB0',
    cd: 0.38, dmg: 32, range: 118, arc: 1.5, kb: 300, arcs: [0],
    chain: { count: 2, range: 180, falloff: 0.78 }, slow: 0.4, slowT: 1.8,
    blurb: 'A quiet jab that arcs to a second target and leaves both groggy.'
  },
  worldspire: {
    id: 'worldspire', name: 'Worldspire', color: '#FF6BD6',
    cd: 0.46, dmg: 74, range: 150, arc: TAU, kb: 620, arcs: [0], spin: true,
    shock: { rad: 190, dmgMul: 0.65, kb: 380 },
    chain: { count: 3, range: 240, falloff: 0.85 },
    meteor: { chance: 0.2, dmgMul: 1.6, rad: 130 },
    blurb: 'The first spire: a full sweep that arcs on to the rest of the herd and sometimes drops a star.'
  }
};

/* ========================= 30c. GEAR SETS ========================= */
/* Three slots. Twenty-two sets: 8 common, 7 rare, 4 epic, 2 legendary and 1 mythical (only from crates, at 0.02% and 0.1%).
   Wearing all three pieces of one set adds a set bonus on top. */
const GEAR_SETS = [
  {
    id: 'herdhide', name: 'Herdhide', rarity: 'common', color: '#C2A279',
    setDesc: 'Move speed +8%',
    setApply(s){ s.speedMul += 0.08; },
    pieces: {
      cape:   { name: 'Herdhide Cloak',  desc: 'Max health +10',        apply(s){ s.maxHpAdd += 10; } },
      weapon: { name: 'Bare Hooves',     desc: 'The standard kick',     weapon: 'hooves' },
      armor:  { name: 'Herdhide Vest',   desc: 'Damage taken -4%',      apply(s){ s.dr += 0.04; } }
    }
  },
  {
    id: 'thornweave', name: 'Thornweave', rarity: 'common', color: '#9BC45C',
    setDesc: 'Bleed damage from any source +40%',
    setApply(s){ s.bleedMul += 0.40; },
    pieces: {
      cape:   { name: 'Thornweave Shawl',  desc: 'Attack speed +4%',   apply(s){ s.hasteMul *= 0.96; } },
      weapon: { name: 'Thornweave Spurs',  desc: 'Fast cuts, applies bleed', weapon: 'spurs' },
      armor:  { name: 'Thornweave Mail',   desc: 'Damage taken -3%, pickup range +10%', apply(s){ s.dr += 0.03; s.pickupMul += 0.10; } }
    }
  },
  {
    id: 'stoneplate', name: 'Stoneplate', rarity: 'common', color: '#ADABA8',
    setDesc: 'Max health +20 and knockback +25%',
    setApply(s){ s.maxHpAdd += 20; s.kickKb *= 1.25; },
    pieces: {
      cape:   { name: 'Stoneplate Drape', desc: 'Max health +16',      apply(s){ s.maxHpAdd += 16; } },
      weapon: { name: 'Stoneshod Hooves', desc: 'Slow, huge, cracks the ground', weapon: 'stone' },
      armor:  { name: 'Stoneplate Barding', desc: 'Damage taken -8%',  apply(s){ s.dr += 0.08; } }
    }
  },
  {
    id: 'frostbite', name: 'Frostbite', rarity: 'common', color: '#8FE0FF',
    setDesc: 'Slow effects last 50% longer and slow 15% harder',
    setApply(s){ s.slowPotency += 0.15; s.slowDurMul += 0.50; },
    pieces: {
      cape:   { name: 'Frostbite Ruff',   desc: 'Pickup range +12%',     apply(s){ s.pickupMul += 0.12; } },
      weapon: { name: 'Icicle Fangs',     desc: 'Fast bites that slow on hit', weapon: 'icefangs' },
      armor:  { name: 'Frostbite Hide',   desc: 'Damage taken -4%, move speed +3%', apply(s){ s.dr += 0.04; s.speedMul += 0.03; } }
    }
  },
  {
    id: 'acacia', name: 'Acacia Warden', rarity: 'rare', color: '#7E9B4E',
    setDesc: 'Weapon damage +14% and weapon range +10%',
    setApply(s){ s.kickDmgMul += 0.14; s.kickRangeMul += 0.10; },
    pieces: {
      cape:   { name: 'Warden\u2019s Mantle', desc: 'Weapon range +8%',    apply(s){ s.kickRangeMul += 0.08; } },
      weapon: { name: 'Acacia Lance',         desc: 'Long, narrow thrust', weapon: 'lance' },
      armor:  { name: 'Warden\u2019s Bark',   desc: 'Damage taken -7%, regenerate 0.4/s', apply(s){ s.dr += 0.07; s.regen += 0.4; } }
    }
  },
  {
    id: 'twinsoul', name: 'Twinsoul', rarity: 'rare', color: '#8FD3E8',
    setDesc: 'Attack speed +12%',
    setApply(s){ s.hasteMul *= 0.88; },
    pieces: {
      cape:   { name: 'Twinsoul Wrap',   desc: 'Attack speed +6%',     apply(s){ s.hasteMul *= 0.94; } },
      weapon: { name: 'Twin Tails',      desc: 'Hits front and back at once', weapon: 'twin' },
      armor:  { name: 'Twinsoul Harness', desc: 'Damage taken -5%, move speed +4%', apply(s){ s.dr += 0.05; s.speedMul += 0.04; } }
    }
  },
  {
    id: 'glacierguard', name: 'Glacier Guard', rarity: 'rare', color: '#B7E8FF',
    setDesc: 'Damage taken -8% and freeze chance +15%',
    setApply(s){ s.dr += 0.08; s.freezeBonus += 0.15; },
    pieces: {
      cape:   { name: 'Glacier Mantle',  desc: 'Max health +24',        apply(s){ s.maxHpAdd += 24; } },
      weapon: { name: 'Glacier Maul',    desc: 'Heavy, slow, sometimes freezes solid', weapon: 'glaciermaul' },
      armor:  { name: 'Glacier Plate',   desc: 'Damage taken -9%, regenerate 0.5/s', apply(s){ s.dr += 0.09; s.regen += 0.5; } }
    }
  },
  {
    id: 'sunforged', name: 'Sunforged', rarity: 'epic', color: '#F2B33D',
    setDesc: 'Critical chance +10% and critical damage +30%',
    setApply(s){ s.crit += 0.10; s.critMul += 0.30; },
    pieces: {
      cape:   { name: 'Sunforged Banner', desc: 'Critical chance +5%',  apply(s){ s.crit += 0.05; } },
      weapon: { name: 'Sunforged Spear',  desc: 'Swings throw a lance of light', weapon: 'sunspear' },
      armor:  { name: 'Sunforged Plate',  desc: 'Damage taken -10%, max health +20', apply(s){ s.dr += 0.10; s.maxHpAdd += 20; } }
    }
  },
  {
    id: 'aurora', name: 'Aurora', rarity: 'epic', color: '#8FFFD1',
    setDesc: 'Weapon chains reach one more enemy and lose 15% less damage per jump',
    setApply(s){ s.chainBonus += 1; s.chainFalloffBonus += 0.15; },
    pieces: {
      cape:   { name: 'Aurora Veil',   desc: 'Experience gained +8%, pickup range +14%', apply(s){ s.xpMul += 0.08; s.pickupMul += 0.14; } },
      weapon: { name: 'Aurora Fang',   desc: 'Strikes arc between nearby enemies', weapon: 'aurora' },
      armor:  { name: 'Aurora Wrap',   desc: 'Damage taken -9%, attack speed +6%', apply(s){ s.dr += 0.09; s.hasteMul *= 0.94; } }
    }
  },
  {
    id: 'starborn', name: 'Starborn', rarity: 'legendary', color: '#FFD84D',
    setDesc: 'All damage +15%, one extra reroll, and experience +10%',
    setApply(s){ s.allDmgMul += 0.15; s.bonusRerolls += 1; s.xpMul += 0.10; },
    pieces: {
      cape:   { name: 'Mantle of Falling Stars', desc: 'All damage +6%, pickup range +20%', apply(s){ s.allDmgMul += 0.06; s.pickupMul += 0.20; } },
      weapon: { name: 'Starbreaker',             desc: 'Full spin, cracks ground, calls stars', weapon: 'starbreaker' },
      armor:  { name: 'Starborn Aegis',          desc: 'Damage taken -12%, regenerate 0.8/s', apply(s){ s.dr += 0.12; s.regen += 0.8; } }
    }
  },
  {
    id: 'tideshell', name: 'Tideshell', rarity: 'common', color: '#6FA8C9',
    setDesc: 'Move speed +6% and pickup range +10%',
    setApply(s){ s.speedMul += 0.06; s.pickupMul += 0.10; },
    pieces: {
      cape:   { name: 'Tideshell Wrap',  desc: 'Max health +12',       apply(s){ s.maxHpAdd += 12; } },
      weapon: { name: 'Tideshell Club',  desc: 'Heavy, waterlogged, slows on hit', weapon: 'tideshellclub' },
      armor:  { name: 'Tideshell Plate', desc: 'Damage taken -5%, move speed +3%', apply(s){ s.dr += 0.05; s.speedMul += 0.03; } }
    }
  },
  {
    id: 'riptide', name: 'Riptide', rarity: 'rare', color: '#3E8FBF',
    setDesc: 'Splash stun chance +20% and splash radius +25%',
    setApply(s){ s.splashChance += 0.20; s.splashRadiusMul += 0.25; },
    pieces: {
      cape:   { name: 'Riptide Cloak', desc: 'Weapon range +8%',        apply(s){ s.kickRangeMul += 0.08; } },
      weapon: { name: 'Riptide Trident', desc: 'Long thrust that briefly pins its target', weapon: 'riptide' },
      armor:  { name: 'Riptide Scale', desc: 'Damage taken -7%, regenerate 0.4/s', apply(s){ s.dr += 0.07; s.regen += 0.4; } }
    }
  },
  {
    id: 'abyssal', name: 'Abyssal', rarity: 'epic', color: '#3EFFC8',
    setDesc: 'Critical chance +8% and stun-on-hit chance +12%',
    setApply(s){ s.crit += 0.08; s.freezeBonus += 0.12; },
    pieces: {
      cape:   { name: 'Abyssal Veil',     desc: 'Experience gained +8%, pickup range +12%', apply(s){ s.xpMul += 0.08; s.pickupMul += 0.12; } },
      weapon: { name: 'Abyssal Anglerfang', desc: 'Bio-electric bite that flings a lure-orb', weapon: 'abyssal' },
      armor:  { name: 'Abyssal Carapace', desc: 'Damage taken -9%, attack speed +6%', apply(s){ s.dr += 0.09; s.hasteMul *= 0.94; } }
    }
  },
  {
    id: 'canopy', name: 'Canopy', rarity: 'common', color: '#5FA83C',
    setDesc: 'Regenerate 0.5/s and max health +15',
    setApply(s){ s.regen += 0.5; s.maxHpAdd += 15; },
    pieces: {
      cape:   { name: 'Canopy Leafcloak', desc: 'Max health +10, pickup range +8%', apply(s){ s.maxHpAdd += 10; s.pickupMul += 0.08; } },
      weapon: { name: 'Vinelash',         desc: 'Thorned whip that bleeds and slows', weapon: 'vinelash' },
      armor:  { name: 'Canopy Weave',     desc: 'Damage taken -5%, regenerate 0.3/s', apply(s){ s.dr += 0.05; s.regen += 0.3; } }
    }
  },
  {
    id: 'jaguar', name: 'Jaguarhide', rarity: 'rare', color: '#D9A441',
    setDesc: 'Critical chance +7% and critical damage +30%',
    setApply(s){ s.crit += 0.07; s.critMul += 0.3; },
    pieces: {
      cape:   { name: 'Jaguarhide Mantle', desc: 'Move speed +5%, critical chance +3%', apply(s){ s.speedMul += 0.05; s.crit += 0.03; } },
      weapon: { name: 'Jaguar Fangs',      desc: 'Twin raking swipes that bleed', weapon: 'jaguarfang' },
      armor:  { name: 'Jaguarhide Vest',   desc: 'Damage taken -7%, attack speed +5%', apply(s){ s.dr += 0.07; s.hasteMul *= 0.95; } }
    }
  },
  {
    id: 'leviathan', name: 'Leviathan', rarity: 'legendary', color: '#6FE0FF',
    setDesc: 'All damage +12% and weapon knockback +30%',
    setApply(s){ s.allDmgMul += 0.12; s.kickKb *= 1.30; },
    pieces: {
      cape:   { name: 'Leviathan\u2019s Shroud', desc: 'All damage +6%, max health +24', apply(s){ s.allDmgMul += 0.06; s.maxHpAdd += 24; } },
      weapon: { name: 'Leviathan\u2019s Maw',    desc: 'Full spin that drags the tide inward with it', weapon: 'leviathan' },
      armor:  { name: 'Leviathan Scale',         desc: 'Damage taken -12%, regenerate 0.7/s', apply(s){ s.dr += 0.12; s.regen += 0.7; } }
    }
  },
  {
    id: 'cinder', name: 'Cinderhide', rarity: 'common', color: '#C0502A',
    setDesc: 'Damage taken -6% and regeneration +0.4/s',
    setApply(s){ s.dr += 0.06; s.regen += 0.4; },
    pieces: {
      cape:   { name: 'Ashen Mantle',   desc: 'Max health +8, move speed +3%',        apply(s){ s.maxHpAdd += 8; s.speedMul += 0.03; } },
      weapon: { name: 'Emberspurs',     desc: 'Fast cuts that leave burns',           weapon: 'embers' },
      armor:  { name: 'Cinderplate',    desc: 'Damage taken -4%, regenerate 0.3/s',   apply(s){ s.dr += 0.04; s.regen += 0.3; } }
    }
  },
  {
    id: 'rooftop', name: 'Rooftop Runner', rarity: 'common', color: '#8E96A3',
    setDesc: 'Move speed +10%',
    setApply(s){ s.speedMul += 0.10; },
    pieces: {
      cape:   { name: 'Runner\u2019s Windbreaker', desc: 'Move speed +4%, pickup range +10%', apply(s){ s.speedMul += 0.04; s.pickupMul += 0.10; } },
      weapon: { name: 'Rebar Kickers',   desc: 'Quick kicks that shove hard',          weapon: 'rebar' },
      armor:  { name: 'Hi-Vis Vest',     desc: 'Damage taken -4%, max health +8',      apply(s){ s.dr += 0.04; s.maxHpAdd += 8; } }
    }
  },
  {
    id: 'moondust', name: 'Moondust', rarity: 'rare', color: '#C9CCD6',
    setDesc: 'Move speed +8% and pickup range +25%',
    setApply(s){ s.speedMul += 0.08; s.pickupMul += 0.25; },
    pieces: {
      cape:   { name: 'Moondust Cloak',   desc: 'Move speed +5%, pickup range +12%',  apply(s){ s.speedMul += 0.05; s.pickupMul += 0.12; } },
      weapon: { name: 'Regolith Hammer',  desc: 'Slow slam, the ground ripples out',  weapon: 'regolith' },
      armor:  { name: 'Pressure Plate',   desc: 'Damage taken -7%, max health +14',   apply(s){ s.dr += 0.07; s.maxHpAdd += 14; } }
    }
  },
  {
    id: 'rustwalker', name: 'Rustwalker', rarity: 'rare', color: '#C0643A',
    setDesc: 'Max health +20 and all damage +6%',
    setApply(s){ s.maxHpAdd += 20; s.allDmgMul += 0.06; },
    pieces: {
      cape:   { name: 'Rust-Red Shawl',   desc: 'Max health +12, regenerate 0.3/s',   apply(s){ s.maxHpAdd += 12; s.regen += 0.3; } },
      weapon: { name: 'Ironclad Hooves',  desc: 'Heavy kicks that rattle what they hit', weapon: 'ironclad' },
      armor:  { name: 'Ironbound Plate',  desc: 'Damage taken -7%, all damage +3%',   apply(s){ s.dr += 0.07; s.allDmgMul += 0.03; } }
    }
  },
  {
    id: 'sitezero', name: 'Site Zero', rarity: 'epic', color: '#7CFFB0',
    setDesc: 'Crit chance +10% and crit damage +25%',
    setApply(s){ s.crit += 0.10; s.critMul += 0.25; },
    pieces: {
      cape:   { name: 'Black-Ops Cape',     desc: 'Crit chance +5%, move speed +4%',  apply(s){ s.crit += 0.05; s.speedMul += 0.04; } },
      weapon: { name: 'Tranq Prod',         desc: 'Arcs to a second target and slows both', weapon: 'tranq' },
      armor:  { name: 'Night-Vision Rig',   desc: 'Damage taken -9%, crit chance +3%, pickup range +15%', apply(s){ s.dr += 0.09; s.crit += 0.03; s.pickupMul += 0.15; } }
    }
  },
  {
    id: 'worldspire', name: 'Worldspire', rarity: 'mythical', color: '#FF6BD6',
    setDesc: 'All damage +20%, move speed +10%, experience +15% and one extra reroll',
    setApply(s){ s.allDmgMul += 0.20; s.speedMul += 0.10; s.xpMul += 0.15; s.bonusRerolls += 1; },
    pieces: {
      cape:   { name: 'Mantle of the First Dawn', desc: 'All damage +8%, move speed +6%, experience +8%', apply(s){ s.allDmgMul += 0.08; s.speedMul += 0.06; s.xpMul += 0.08; } },
      weapon: { name: 'Worldspire',               desc: 'Full spin, arcs to the herd, calls stars', weapon: 'worldspire' },
      armor:  { name: 'Aegis of Ages',            desc: 'Damage taken -15%, regenerate 1/s, max health +30', apply(s){ s.dr += 0.15; s.regen += 1.0; s.maxHpAdd += 30; } }
    }
  }
];

/* Every equippable weapon reaches further than having none at all, scaled by
   its set's rarity: common +25%, rare +42%, epic +58%, legendary +75%, mythical +100%, all
   measured against the no-weapon baseline (104). This SETS each weapon's
   range to its tier's target rather than multiplying whatever range it was
   originally designed with -- otherwise a weapon built with unusually long
   or short reach (the Lance, the Spurs) would land far outside the intended
   band once the rarity bonus stacked on top of its own design. */
const RANGE_RARITY_MUL = { common: 1.25, rare: 1.42, epic: 1.58, legendary: 1.75, mythical: 2.0 };
GEAR_SETS.forEach(set => {
  const wp = set.pieces.weapon && WEAPONS[set.pieces.weapon.weapon];
  if (!wp) return;
  const mul = RANGE_RARITY_MUL[set.rarity] || 1;
  wp.baseRange = wp.range;
  wp.range = Math.round(DEFAULT_WEAPON.range * mul);
  wp.rangeBonusPct = Math.round((mul - 1) * 100);
});

const GEAR_SLOTS = ['cape', 'weapon', 'armor'];
const SLOT_LABEL = { cape: 'Cape', weapon: 'Weapon', armor: 'Armor' };
const RARITY_ORDER = { common: 0, rare: 1, epic: 2, legendary: 3, mythical: 4 };

/* flat lookup: "setid:slot" -> piece, with set metadata attached */
const GEAR_INDEX = {};
const SETMAP = {};
GEAR_SETS.forEach(set => {
  SETMAP[set.id] = set;
  GEAR_SLOTS.forEach(slot => {
    const p = set.pieces[slot];
    if (!p) return;
    p.id = set.id + ':' + slot;
    p.slot = slot;
    p.setId = set.id;
    p.rarity = set.rarity;
    p.color = set.color;
    p.setName = set.name;
    GEAR_INDEX[p.id] = p;
  });
});

/* ========================= 30d. OWNERSHIP & EQUIPPING ========================= */
/* These run before Save.load() during the initial recalcStats, so they all
   tolerate a missing save exactly the way metaLevel does. */
function gearOwned(id){ return !!(Save.data && Save.data.gear && Save.data.gear[id]); }
function gearEquipped(slot){ return (Save.data && Save.data.equipped && Save.data.equipped[slot]) || null; }
function grantGear(id){
  if (!Save.data) return false;
  if (!Save.data.gear) Save.data.gear = {};
  if (Save.data.gear[id]) return false;
  Save.data.gear[id] = 1;
  return true;
}
function equipGear(id){
  const p = GEAR_INDEX[id];
  if (!p || !gearOwned(id) || !Save.data) return false;
  if (!Save.data.equipped) Save.data.equipped = {};
  const previous = Save.data.equipped[p.slot]; Save.data.equipped[p.slot] = id;
  if (p.slot === 'cape' && previous !== id && typeof gfxClearAurora === 'function') gfxClearAurora();
  Save.write();
  recalcStats();
  return true;
}
function unequipSlot(slot){
  if (!Save.data || !Save.data.equipped) return;
  Save.data.equipped[slot] = null;
  if (slot === 'cape' && typeof gfxClearAurora === 'function') gfxClearAurora();
  Save.write();
  recalcStats();
}
/* how many pieces of a given set are currently worn */
function setWornCount(setId){
  let n = 0;
  GEAR_SLOTS.forEach(slot => {
    const id = gearEquipped(slot);
    if (id && GEAR_INDEX[id] && GEAR_INDEX[id].setId === setId) n++;
  });
  return n;
}
function activeSetBonus(){
  for (let i = 0; i < GEAR_SETS.length; i++){
    if (setWornCount(GEAR_SETS[i].id) === 3) return GEAR_SETS[i];
  }
  return null;
}
/* Applied inside recalcStats, after shop perks and before cards. */
function applyGear(s){
  /* recalcStats runs once at load time, before this module's consts are
     initialised in some bundling orders; bail out harmlessly if so. */
  if (typeof GEAR_SLOTS === 'undefined' || !GEAR_INDEX) return;
  const before = {};
  for (const k in s) if (typeof s[k] === 'number') before[k] = s[k];
  GEAR_SLOTS.forEach(slot => {
    const id = gearEquipped(slot);
    if (!id) return;
    const p = GEAR_INDEX[id];
    if (p && p.apply) p.apply(s);
  });
  const set = activeSetBonus();
  if (set && set.setApply) set.setApply(s);
  if (typeof trinketEquipped === 'function' && trinketEquipped('redrampage')){
    for (const k in before){
      if (typeof s[k] === 'number' && s[k] !== before[k]) s[k] = before[k] + (s[k] - before[k]) * 1.4;
    }
  }
}

/* ========================= 30f. TRINKETS ========================= */
/* A fourth, separate equip category from cape/weapon/armor: any number of
   owned trinkets can be worn at once, each contributing its own effect.
   Currently only won from the prize wheel. Ownership is tracked in the same
   Save.data.gear map as regular gear, under a "trinket:" prefixed key so it
   can never collide with a "setid:slot" gear key. */
const TRINKETS = {
  lanternoil: { id: 'lanternoil', name: 'Lantern Oil', icon: '@t-lamp-2', color: '#FFC870', desc: 'Pickup range +20% and drops 10% more common.', source: 'Bought in the Underground Giraffe City.' },
  echochime: { id: 'echochime', name: 'Echo Chime', icon: '@t-bell', color: '#7AE8D0', desc: 'Kick range +10% and critical chance +3%.', source: 'Bought in the Underground Giraffe City.' },
  mosswreath: { id: 'mosswreath', name: 'Moss Wreath', icon: '@t-x-wreath', color: '#8AD070', desc: 'Regenerate 1.5 health per second.', source: 'Bought in the Underground Giraffe City.' },
  burrowboots: { id: 'burrowboots', name: 'Burrow Boots', icon: '@t-shoe', color: '#C8A070', desc: 'Move 6% faster and gain 6% more experience.', source: 'Bought in the Underground Giraffe City.' },
  limehelmet: { id: 'limehelmet', name: 'Lime Helmet', icon: '@t-x-helmet', color: '#9BE04A',
    desc: 'Damage taken from enemies \u22127%. Not amplified by Red Rampage.',
    source: 'A 1-in-1000 drop from any enemy you defeat. Can only be found once.' },
  peacefullune: { id: 'peacefullune', name: 'Peaceful Lune', icon: '@t-x-moon', color: '#8FAEE8',
    desc: 'Press T to slow the world by 80% for 8 seconds. 30-second cooldown.' },
  redrampage: { id: 'redrampage', name: 'Red Rampage', icon: '@t-flame', color: '#D42020',
    desc: 'Multiplies the effect of every equipped piece of gear by 1.4\u00d7, set bonuses included.' },
  /* forged at the Venus workshop from sulfur and basalt */
  sulfurlantern: { id: 'sulfurlantern', name: 'Sulfur Lantern', icon: '@t-x-lantern', color: '#F2D43A',
    desc: 'Pickup range +25% and drops 15% more common.', source: 'Forged at the Venus workshop.' },
  basaltplate: { id: 'basaltplate', name: 'Basalt Plate', icon: '@t-x-plate', color: '#8A93B8',
    desc: 'Damage taken \u22126%.', source: 'Forged at the Venus workshop.' },
  ventbellows: { id: 'ventbellows', name: 'Vent Bellows', icon: '@t-x-bellows', color: '#FF8A3A',
    desc: 'Regenerate 1 health per second and move 4% faster.', source: 'Forged at the Venus workshop.' },
  forgeheart: { id: 'forgeheart', name: 'Forge Heart', icon: '@t-x-forgeheart', color: '#FF5A2A',
    desc: 'Kick damage +12%, critical chance +4%, experience +5%.', source: 'Forged at the Venus workshop.' },
  /* forged at the Mars forge from iron, sulfur, basalt and argon */
  irongauntlet: { id: 'irongauntlet', name: 'Iron Gauntlet', icon: '@t-x-gauntlet', color: '#C8643A',
    desc: 'Kick damage +14% and kick knockback +10%.', source: 'Forged at the Mars forge.' },
  argonlamp: { id: 'argonlamp', name: 'Argon Lamp', icon: '@t-x-bulb', color: '#B880FF',
    desc: 'Pickup range +20% and regenerate 1.2 health per second.', source: 'Forged at the Mars forge.' },
  dustveil: { id: 'dustveil', name: 'Dust Veil', icon: '@t-x-cloud', color: '#E8A070',
    desc: 'Damage taken −8%, move 5% faster and gain 6% more experience.', source: 'Forged at the Mars forge.' },
  /* the 3% prize of the Spotted prize wheel (41c-wheel-page.js) */
  spottedpaw: { id: 'spottedpaw', name: 'Spotted Paw', icon: '@t-paw', color: '#F29A2E',
    desc: 'All damage +7%, critical chance +3% and gold gained +10%.', source: 'A 3% prize on the Spotted wheel. Spotted keys come from a score of 500,000,000.' },
  /* a 12% prize of the Spotted wheel: the sturdy one, to go with the Paw's damage */
  goldenossicone: { id: 'goldenossicone', name: 'Golden Ossicone', icon: '@t-x-ossicone', color: '#E8C068',
    desc: 'Max health +20, regenerate 1 health per second and gain 8% more experience.', source: 'A 12% prize on the Spotted wheel. Spotted keys come from a score of 500,000,000.' }
};
function trinketOwned(id){ return !!(Save.data && Save.data.gear && Save.data.gear['trinket:' + id]); }
function trinketEquipped(id){ return !!(Save.data && Save.data.equippedTrinkets && Save.data.equippedTrinkets.indexOf(id) >= 0); }
function grantTrinket(id){
  if (!Save.data) return false;
  if (!Save.data.gear) Save.data.gear = {};
  const key = 'trinket:' + id;
  if (Save.data.gear[key]) return false;
  Save.data.gear[key] = 1;
  return true;
}
function toggleTrinket(id){
  if (!TRINKETS[id] || !trinketOwned(id) || !Save.data) return false;
  if (!Array.isArray(Save.data.equippedTrinkets)) Save.data.equippedTrinkets = [];
  const i = Save.data.equippedTrinkets.indexOf(id);
  if (i >= 0) Save.data.equippedTrinkets.splice(i, 1); else Save.data.equippedTrinkets.push(id);
  Save.write();
  recalcStats();
  return true;
}

/* ========================= 30g. PRIZE WHEEL ========================= */
/* Reaching 50,000,000 score in a run earns a key, at most once every real
   30 minutes (tracked by wall-clock time, not run time, so it isn't reset
   by starting a new run). Keys bank up and are spent at the trading post. */
const WHEEL_SCORE_THRESHOLD = 50000000;
const WHEEL_KEY_COOLDOWN_MS = 30 * 60 * 1000;
const WHEEL_SEGMENTS = [
  { id: 'redrampage',   label: 'Red Rampage',    weight: 2,  color: '#D42020', kind: 'trinket' },
  { id: 'peacefullune', label: 'Peaceful Lune',  weight: 30, color: '#8FAEE8', kind: 'trinket' },
  { id: 'gold_small',   label: '25,000 Gold',    weight: 20, color: '#C9A23A', kind: 'gold',  amount: 25000 },
  { id: 'gold_large',   label: '100,000 Gold',   weight: 10, color: '#E8C24A', kind: 'gold',  amount: 100000 },
  { id: 'gems_small',   label: '150 Gems',       weight: 25, color: '#4AA8D8', kind: 'gems',  amount: 150 },
  { id: 'gems_large',   label: '450 Gems',       weight: 13, color: '#6FD0F0', kind: 'gems',  amount: 450 }
];
/* is a key still cooling down? A time in the future (a clock that was ahead, or a save from a device whose clock was) counts as over, not as days of waiting */
function keyCooling(last, cd){ const now = Date.now(); return !!last && last <= now && now - last < cd; }
function checkWheelKey(){
  if (G.attract || G.score < WHEEL_SCORE_THRESHOLD) return;
  const now = Date.now();
  if (keyCooling(Save.data.lastWheelKeyAt, WHEEL_KEY_COOLDOWN_MS)) return;
  Save.data.lastWheelKeyAt = now;
  Save.data.wheelKeys = (Save.data.wheelKeys | 0) + 1;
  Save.write();
  banner('WHEEL KEY EARNED', 'Spin the prize wheel at the trading post.', '#E8C24A', 3.6);
  SFX.level();
}
function rollWheelSegment(){
  const total = WHEEL_SEGMENTS.reduce((a, x) => a + x.weight, 0);
  let r = Math.random() * total;
  for (let i = 0; i < WHEEL_SEGMENTS.length; i++){
    if (r < WHEEL_SEGMENTS[i].weight) return WHEEL_SEGMENTS[i];
    r -= WHEEL_SEGMENTS[i].weight;
  }
  return WHEEL_SEGMENTS[WHEEL_SEGMENTS.length - 1];
}
/* Pure data: spends a key, resolves the reward, and returns what happened.
   Kept separate from the spin animation so the outcome is decided (and
   saved) the instant the wheel is spent, whether or not the visual finishes. */
function spinWheel(){
  if ((Save.data.wheelKeys | 0) <= 0){ SFX.deny(); return null; }
  Save.data.wheelKeys--;
  const seg = rollWheelSegment();
  let label = seg.label, duplicate = false, refund = 0;
  if (seg.kind === 'trinket'){
    if (!grantTrinket(seg.id)){
      duplicate = true; refund = 25000; Save.data.gold += refund;   /* wheel gold rewards are 5x, this refund included */
      label = TRINKETS[seg.id].name + ' (already owned \u2014 ' + fmt(refund) + ' gold instead)';
    }
  } else if (seg.kind === 'gold'){
    Save.data.gold += seg.amount;
  } else if (seg.kind === 'gems'){
    Save.data.gems += seg.amount;
  }
  Save.write();
  return { seg: seg, label: label, duplicate: duplicate, refund: refund };
}
function equippedWeapon(){
  const id = gearEquipped('weapon');
  const p = id ? GEAR_INDEX[id] : null;
  const w = p && p.weapon ? WEAPONS[p.weapon] : null;
  return w || DEFAULT_WEAPON;
}
function equippedCapeColor(){
  const id = gearEquipped('cape');
  const p = id ? GEAR_INDEX[id] : null;
  return p ? p.color : null;
}
function equippedArmorInfo(){
  const id = gearEquipped('armor');
  const p = id ? GEAR_INDEX[id] : null;
  return p ? { setId: p.setId, color: p.color, rarity: p.rarity } : null;
}

/* ========================= 30e. CRATES ========================= */
const CRATES = {
  normal: { id:'normal', name:'Supply Crate', cost:25,
    weights: { common: 69.98, rare: 24, epic: 5, legendary: 1, mythical: 0.02 },
    blurb: 'Mostly common gear, with a slim chance of something better, and a one in five thousand chance of a mythical.' },
  rare:   { id:'rare',   name:'Prime Crate',  cost:70,
    weights: { common: 31.9, rare: 42, epic: 20, legendary: 6, mythical: 0.1 },
    blurb: 'Much better odds of rare, epic and legendary gear, and a one in a thousand chance of a mythical.' },
  /* costs food as well as gems (Save.data.food, from foraging and the ant colony): the best odds in the game, with a 2% chance of a mythical */
  spotted:{ id:'spotted', name:'Spotted Crate', cost:1000, food:50,
    weights: { common: 10, rare: 28, epic: 36, legendary: 24, mythical: 2 },
    blurb: 'Hide-wrapped and hard to come by. Epic and legendary gear is common here, and one in fifty is mythical.' }
};
const DUPE_REFUND = 18;

function rollRarity(weights){
  let total = 0;
  for (const k in weights) total += weights[k];
  let r = Math.random() * total;
  for (const k in weights){ r -= weights[k]; if (r <= 0) return k; }
  return 'common';
}
