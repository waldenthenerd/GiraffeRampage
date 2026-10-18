'use strict';
/* Card fusion: combos, the machine screen, the film. */
/* ========================= 34d. CARD FUSION ========================= */
/* The Card Fusion Machine (built in the Underground City) lets her fuse two cards of the same rarity into one combo card.
   The two parts stay alive but hidden: they keep doing everything they did, and the combo adds one simple ability of its own.
   Starfall Horn, the only legendary, can be fused with any card. */
const FUSE_INFO = {
  neck_whip:     { tag: 'Whip',    trait: 'nova',    elem: 'knock' },  hoof_quake:    { tag: 'Quake',   trait: 'nova',    elem: 'stun' },
  spit:          { tag: 'Spit',    trait: 'shots',   elem: 'slow' },   weaponry:      { tag: 'Drill',   trait: 'seek',    elem: 'plain' },
  speed:         { tag: 'Gale',    trait: 'trail',   elem: 'knock' },  iron_hide:     { tag: 'Plate',   trait: 'aura',    elem: 'knock' },
  thorn_halo:    { tag: 'Thorn',   trait: 'ring',    elem: 'bleed' },  dung_mine:     { tag: 'Mine',    trait: 'zone',    elem: 'slow' },
  feast:         { tag: 'Carrion', trait: 'harvest', elem: 'plain' },  frenzy:        { tag: 'Frenzy',  trait: 'aura',    elem: 'burn' },
  sun_beam:      { tag: 'Sun',     trait: 'seek',    elem: 'burn' },   stampede:      { tag: 'Herd',    trait: 'trail',   elem: 'knock' },
  lightning:     { tag: 'Storm',   trait: 'chain',   elem: 'stun' },   fleece:        { tag: 'Gold',    trait: 'harvest', elem: 'plain' },
  thorn_crown:   { tag: 'Briar',   trait: 'shots',   elem: 'bleed' },  sunfire_flies: { tag: 'Flare',   trait: 'ring',    elem: 'burn' },
  deflector:     { tag: 'Aegis',   trait: 'nova',    elem: 'knock' },  dust_devils:   { tag: 'Dust',    trait: 'trail',   elem: 'slow' },
  cavern_echo:   { tag: 'Echo',    trait: 'nova',    elem: 'stun' },   starfall:      { tag: 'Star',    trait: 'meteor',  elem: 'burn' }
};
const FUSE_ELEM_ADJ = { burn: 'burning', slow: 'sticky', stun: 'stunning', bleed: 'bleeding', knock: 'thundering', plain: 'plain' };
function fuseElemOpts(el, dmg, col){
  switch (el){
    case 'burn': return { burn: dmg * 0.28, burnT: 2.4 };
    case 'bleed': return { burn: dmg * 0.4, burnT: 3 };
    case 'slow': return { slow: 0.55, slowT: 1.8 };
    case 'stun': return { stun: 0.6 };
    case 'knock': return { kb: 380 };
    default: return {};
  }
}
function fuseProjOpts(el, dmg){ return el === 'burn' || el === 'bleed' ? { burn: dmg * 0.25 } : el === 'knock' ? { kb: 300 } : { pierce: 1 }; }

/* ---- the three-level combo engine ----
   Every combo is its own named ability built from a small kit of behaviours (CBH below), each with its own parameters.
   Levels 1 and 2 make it stronger; level 3 adds the combo's special upgrade (its capstone). */
const CB_CAPS = {
  echo:   'Every use is repeated a moment later at 70% strength, and its constant effects hit 30% harder.',
  swift:  'It recharges about a third faster and its constant effects tick faster.',
  burst:  'Every fourth use is a huge version, 2.4 times as strong. Constant effects add a giant shockwave every 6 seconds.',
  wide:   'It grows: half again as many pieces and a wider reach.',
  heal:   'Every use heals you for 2% of your health.',
  seek:   'Every use also launches two homing bolts.',
  gold:   'Every use also shakes loose a coin.',
  frost:  'Everything it hits is slowed.',
  ignite: 'Everything it hits is set on fire.',
  stun:   'Everything it hits is briefly stunned.'
};
const CB_ICON = { ring: 't-x-ring', nova: 't-x-spiral', volley: 't-sparkles', seek: 't-x-crosshair', pool: 't-x-drop', chain: 't-x-bolt', meteor: 't-x-sun', trail: 't-walk', aura: 't-x-hexpulse', harvest: 't-x-heart',
  beam: 't-x-flare', blades: 't-swords', lash: 't-ripple', mines: 't-x-bubbles', turret: 't-x-hull', deathburst: 't-flame', ward: 't-shield-half', rain: 't-cloud-storm', well: 't-x-globe', ghost: 't-x-lotus',
  retaliate: 't-x-gavel', tithe: 't-coin', boomerang: 't-tornado', comet: 't-meteor', sanctum: 't-x-flower', ram: 't-paw', march: 't-x-horn' };
const CB_ALIAS = { nw: 'neck_whip', hq: 'hoof_quake', sp: 'spit', wp: 'weaponry', sd: 'speed', ih: 'iron_hide', th: 'thorn_halo', dm: 'dung_mine', fe: 'feast', fr: 'frenzy', sb: 'sun_beam', st: 'stampede',
  li: 'lightning', fl: 'fleece', tc: 'thorn_crown', sf: 'sunfire_flies', df: 'deflector', dd: 'dust_devils', ce: 'cavern_echo', ss: 'starfall' };
/* name, behaviours [[kind, params]], what it does, the level-3 upgrade's name, the level-3 upgrade's kind */
const CB_RAW = {
  /* commons */
  'nw+hq': ['Whiplash Tremor', [['lash', { n: 4, pull: 1, el: 'stun', dm: 1.1 }]], 'Four lashes snare the nearest enemies, drag them to your hooves and slam them down, stunned.', 'Fault Line', 'echo'],
  'nw+sp': ['Acid Lash', [['beam', { n: 2, el: 'bleed', w: 7 }]], 'Your neck flicks two acid lines at the nearest enemies, cutting everything between you and them and leaving bleeding wounds.', 'Caustic Crack', 'burst'],
  'nw+wp': ['Cleaver Coil', [['blades', { n: 2, len: 1.35, sp: 3.2 }]], 'Two long blades sweep around you on chains, cutting everything that wanders close.', 'Whirling Edge', 'wide'],
  'nw+sd': ['Sonic Crack', [['nova', { rings: 3, el: 'knock', kb: 520, dm: 0.5, cd: 0.8 }]], 'The crack of your neck bursts out as a rapid triple shockwave that knocks the crowd back.', 'Mach Cascade', 'swift'],
  'nw+ih': ['Barbed Rebuke', [['retaliate', { kind: 'lash', n: 5, el: 'knock' }]], 'When you take a hit your hide lashes back: five whip strikes land on the nearest enemies.', 'Hide of Thorns', 'heal'],
  'hq+sp': ['Gooquake', [['seek', { n: 3, explode: 78, el: 'stun', dm: 1.5, homing: 5 }]], 'Three goo bombs arc toward the nearest enemies and burst on landing in a stunning quake.', 'Aftershock Goo', 'echo'],
  'hq+wp': ['Anvil Drop', [['meteor', { n: 2, rm: 0.75, el: 'stun', dm: 1.2 }]], 'Heavy anvils drop on enemies near you and stun everything under them.', 'Forge Storm', 'burst'],
  'hq+sd': ['Fault Run', [['trail', { iv: 0.2, r: 1.3, dur: 3, el: 'stun', dm: 1.1 }]], 'Running cracks the ground behind you into a trail of fault lines that hurt what follows.', 'Rolling Thunder', 'wide'],
  'hq+ih': ['Bedrock Ward', [['ward', { r: 1.5, heal: 0.006, cd: 0.7 }]], 'A solid pulse flattens every enemy projectile around you and heals you a little for each one.', 'Tectonic Plate', 'heal'],
  'sp+wp': ['Spit Sentry', [['turret', { life: 7, rate: 0.4, el: 'slow', dm: 1.3 }]], 'You spit up a small turret that fires slowing globs at the nearest enemy. Up to three stand at once.', 'Twin Barrels', 'echo'],
  'sp+sd': ['Slick Streak', [['trail', { iv: 0.14, r: 1.7, dur: 2.2, el: 'slow' }]], 'Run and you leave a slick of sticky spit that slows everything that follows.', 'Oil Slick', 'wide'],
  'sp+ih': ['Acid Plating', [['aura', { el: 'bleed', tick: 0.3, dm: 0.7 }]], 'Corrosive plates coat your hide: enemies that crowd you take bleeding damage.', 'Total Corrosion', 'swift'],
  'wp+sd': ['Blade Dance', [['ram', { el: 'plain', dm: 1.0 }]], 'While you run, anything you barrel through is cut and thrown aside.', 'Blur', 'swift'],
  'wp+ih': ['Armoured Edge', [['blades', { n: 3, len: 0.8, sp: 2, el: 'knock' }]], 'Three short armoured blades patrol close to you and shove enemies back.', 'Fortress Spin', 'wide'],
  'sd+ih': ['Decoy Plate', [['ghost', { delay: 1.4, el: 'knock', rm: 1.0 }]], 'You leave a steel afterimage that explodes shortly after, shoving enemies away.', 'Twin Decoys', 'echo'],
  /* rares */
  'th+dm': ['Thornmine', [['mines', { cluster: true, el: 'bleed' }]], 'You drop mines that burst into a ring of thorns when something steps on them.', 'Barbed Field', 'burst'],
  'th+fe': ['Carrion Briar', [['deathburst', { kind: 'volley', chance: 0.3, n: 6, el: 'bleed' }]], 'Fallen enemies sometimes sprout a ring of thorns.', 'Feast of Thorns', 'heal'],
  'th+fr': ['Thorn Frenzy', [['ring', { twin: true, sp: 3.6, shoot: 1.8, el: 'bleed', dm: 0.8 }]], 'Two counter-spinning rings of thorn orbs, each firing a thorn at the nearest enemy.', 'Whirling Thicket', 'wide'],
  'dm+fe': ['Compost Heap', [['deathburst', { kind: 'pool', chance: 0.6, el: 'bleed', dm: 1.4 }]], 'Dead enemies often rot into toxic pools that keep hurting whatever walks through.', 'Rot Bloom', 'wide'],
  'dm+fr': ['Hair-Trigger', [['mines', { cd: 0.35, small: true, el: 'burn', dm: 1.4 }]], 'You drop small mines at a frantic pace, quick to arm and quick to blow.', 'Minefield Mania', 'swift'],
  'fe+fr': ['Feeding Frenzy', [['harvest', { chance: 0.5, heal: 0.015, every: 8 }], ['aura', { el: 'bleed', tick: 0.5, dm: 0.6 }]], 'A frenzied aura bites at anything close, kills often heal you, and every eighth kill sets off a shockwave.', 'Bloodlust', 'heal'],
  /* epics */
  'sb+st': ['Dawn Charge', [['volley', { shape: 'fan', pierce: 3, el: 'burn' }]], 'A fan of piercing sunbeams charges out ahead of the herd.', 'High Noon', 'burst'],
  'sb+li': ['Plasma Arc', [['chain', { jumps: 6, el: 'burn', range: 360 }]], 'A burning bolt jumps from enemy to enemy and sets each one alight.', 'Solar Flare', 'echo'],
  'sb+fl': ['Gilded Ray', [['beam', { n: 2, w: 8, el: 'burn' }], ['tithe', { chance: 0.12 }]], 'Two golden rays pierce the nearest enemies, and kills sometimes drop a coin.', 'Midas Beam', 'gold'],
  'sb+tc': ['Sunlit Briar', [['volley', { shape: 'spiral', el: 'burn', pierce: 1 }]], 'A spiral of burning thorns winds outward from you.', 'Corona Thorns', 'wide'],
  'sb+sf': ['Solar Swarm', [['seek', { n: 5, dm: 0.45, homing: 9, el: 'burn' }]], 'Five sun-sparks each hunt a different enemy.', 'Swarm Eclipse', 'swift'],
  'sb+df': ['Prism Shield', [['ward', { r: 1.7, reflect: true, el: 'burn' }]], 'A glassy pulse catches enemy projectiles around you and sends them back as burning light.', 'Solar Mirror', 'heal'],
  'sb+dd': ['Sun Devil', [['comet', { R: 150, el: 'burn', leave: true, dm: 1.5 }]], 'A blazing whirlwind circles you on a wide path and leaves embers behind it.', 'Inferno Vortex', 'wide'],
  'sb+ce': ['Dawn Chorus', [['nova', { rings: 2, el: 'burn', rm: 1.3, dm: 0.6 }]], 'Sunlight rings outward from you twice, one wave behind the other.', 'Sunrise Peal', 'echo'],
  'st+li': ['Thunder Herd', [['boomerang', { n: 3, el: 'stun' }]], 'Three charged discs thunder out and come back to you, stunning whatever they cross.', 'Storm Front', 'wide'],
  'st+fl': ['Golden Herd', [['trail', { iv: 0.18, r: 1.1, dur: 2.6, dm: 0.7 }], ['tithe', { chance: 0.08 }]], 'Your hoofprints turn golden and hurt what follows, and kills sometimes drop a coin.', 'Gold Rush', 'gold'],
  'st+tc': ['Horned Charge', [['ram', { el: 'bleed', dm: 1.5 }]], 'Run into enemies at speed and your thorn crown gores them.', 'Gore', 'swift'],
  'st+sf': ['Ember Stampede', [['march', { n: 6, el: 'burn' }]], 'A line of burning hoofbeats thunders out toward the nearest enemy.', 'Wildfire Run', 'burst'],
  'st+df': ['Shield Wall', [['sanctum', { dur: 5, heal: 0.012, el: 'knock' }]], 'You plant a wall of light on the ground: stand inside to heal while it batters enemies.', 'Phalanx', 'wide'],
  'st+dd': ['Sand Vortex', [['well', { dur: 3, el: 'slow' }]], 'A whirling vortex forms on the nearest enemy, dragging everything near into a slow, grinding spin.', 'Maelstrom', 'wide'],
  'st+ce': ['Echoing Hooves', [['ghost', { delay: 0.9, nm: 3, el: 'stun', dm: 0.55 }]], 'Your hoofbeats leave echoes behind you that go off a moment later.', 'Resonance', 'echo'],
  'li+fl': ['Live Wire', [['chain', { jumps: 4, el: 'stun' }], ['tithe', { chance: 0.1 }]], 'Chain lightning, and struck-down enemies sometimes drop a coin.', 'Jackpot', 'gold'],
  'li+tc': ['Spiked Bolt', [['chain', { jumps: 5, fork: true, el: 'bleed' }]], 'The lightning forks into thorn bolts at the first enemy it hits.', 'Bramble Storm', 'echo'],
  'li+sf': ['Spark Orbs', [['ring', { sp: 4.2, nm: 0.6, el: 'stun', shoot: 1.0 }]], 'Crackling orbs spin around you, snapping a bolt at the nearest enemy.', 'Tesla Cage', 'wide'],
  'li+df': ['Storm Guard', [['aura', { el: 'stun', tick: 0.8, dm: 0.6, eproj: true }]], 'A static aura stuns anything that gets close and swats enemy shots out of the air.', 'Static Dome', 'swift'],
  'li+dd': ['Storm Devils', [['rain', { n: 6, el: 'stun', rm: 0.6 }]], 'Little lightning strikes crash down at random spots around you.', 'Cyclone Storm', 'burst'],
  'li+ce': ['Thunderclap', [['nova', { rings: 2, el: 'stun', kb: 700, dm: 0.6, rm: 1.4 }]], 'A deafening double clap that stuns the crowd.', 'Peal of Doom', 'burst'],
  'fl+tc': ['Golden Thorns', [['volley', { shape: 'ring', el: 'bleed', pierce: 2 }], ['tithe', { chance: 0.1 }]], 'Gilded thorns burst out in a ring, and kills sometimes turn into coins.', 'Gilded Crown', 'gold'],
  'fl+sf': ['Gold Fireflies', [['seek', { n: 3, dm: 0.7, homing: 7 }], ['tithe', { chance: 0.1 }]], 'Three golden fireflies seek out enemies, and kills sometimes pay out a coin.', 'Glow Hoard', 'gold'],
  'fl+df': ['Treasure Guard', [['ward', { r: 1.4, heal: 0.01, coin: true }]], 'Enemy shots caught near you turn into coins and heal you a little.', 'Vault', 'heal'],
  'fl+dd': ['Gilded Whirl', [['pool', { where: 'scatter', n: 3, el: 'plain' }], ['tithe', { chance: 0.08 }]], 'Gold dust whirlwinds touch down around you, hurting what they cover.', 'Dust Fortune', 'gold'],
  'fl+ce': ['Compound Interest', [['harvest', { chance: 0.2, gold: 1.5, heal: 0.004, every: 15 }], ['rain', { n: 3, rm: 0.5, el: 'plain', dm: 0.9 }]], 'Little coin-shaped strikes patter down around you, kills pay a little extra, and every fifteenth kill sets off a shockwave.', 'Dividend', 'gold'],
  'tc+sf': ['Flare Briar', [['beam', { sweep: true, n: 5, el: 'burn', w: 5, dm: 1.4 }]], 'A sweeping fan of thorn-lit beams fires around the nearest enemy.', 'Wildfire Sweep', 'echo'],
  'tc+df': ['Crown Aegis', [['retaliate', { kind: 'volley', n: 10, el: 'bleed' }]], 'When you are hit, your crown bursts a ring of thorns.', 'Aegis Spikes', 'heal'],
  'tc+dd': ['Briar Whirl', [['comet', { R: 110, el: 'bleed', sp: 2.6 }]], 'A whirl of thorns circles you in a tight, fast loop, hitting anything it crosses.', 'Thorn Typhoon', 'wide'],
  'tc+ce': ['Echoing Spines', [['volley', { shape: 'rear', pierce: 3, el: 'bleed' }]], 'Thorns fire out behind you in a fan and keep going through enemies.', 'Reverb', 'echo'],
  'sf+df': ['Firefly Sanctuary', [['sanctum', { dur: 5, heal: 0.014, el: 'burn' }]], 'Fireflies gather in a warm pool of light: stand inside to heal while enemies in it burn.', 'Hearthlight', 'heal'],
  'sf+dd': ['Firewhirl', [['well', { el: 'burn', dur: 2.5, dm: 1.9 }]], 'A fiery vortex drags the nearest crowd in and burns them.', 'Firestorm', 'burst'],
  'sf+ce': ['Glow Pulse', [['nova', { rings: 3, el: 'burn', rm: 0.9, dm: 0.5 }]], 'Three soft pulses of firefly light ripple outward.', 'Lightbringer', 'wide'],
  'df+dd': ['Reflecting Gale', [['aura', { push: 900, eproj: true, el: 'knock', dm: 0.9 }]], 'A constant gale around you shoves enemies away and bats aside enemy shots.', 'Hurricane Wall', 'wide'],
  'df+ce': ['Sonic Barrier', [['ward', { r: 2.2, cd: 1.0, el: 'knock' }]], 'A sonic wave clears enemy shots out to a long range.', 'Perfect Silence', 'heal'],
  'dd+ce': ['Howling Vortex', [['nova', { pull: true, rings: 2, el: 'slow', rm: 1.1 }]], 'A howl that draws enemies in toward you, slowed.', 'Eye of the Storm', 'burst'],
  /* starfall pairs */
  'ss+nw': ['Comet Lash', [['lash', { n: 5, el: 'burn', dm: 1.3 }]], 'Falling-star lashes streak down on the five nearest enemies.', 'Starstrike', 'echo'],
  'ss+hq': ['Impact Crater', [['meteor', { n: 1, rm: 2, el: 'stun', dm: 2, cd: 1.6 }]], 'A huge star slams down on the crowd and leaves it stunned.', 'Extinction', 'burst'],
  'ss+sp': ['Stardust Spit', [['pool', { where: 'near', n: 3, el: 'burn' }]], 'You spit three pools of burning stardust at the nearest enemies.', 'Nebula', 'wide'],
  'ss+wp': ['Starforged Edge', [['blades', { n: 3, len: 1.2, sp: 4, el: 'burn' }]], 'Three blades of starmetal whirl around you, setting everything alight.', 'Supernova Spin', 'swift'],
  'ss+sd': ['Shooting Star', [['trail', { el: 'burn', iv: 0.1, dm: 1.0, r: 1.2 }]], 'Running trails fire behind you like a comet tail.', 'Comet Tail', 'wide'],
  'ss+ih': ['Meteoric Armour', [['retaliate', { kind: 'meteor', n: 3, el: 'burn' }]], 'When you are hit, stars fall on the enemies around you.', 'Impact Armour', 'heal'],
  'ss+th': ['Constellation', [['ring', { twin: true, nm: 1.5, sp: 1.4, el: 'burn' }]], 'Two slow-turning rings of star-orbs, one inside the other.', 'Zodiac', 'wide'],
  'ss+dm': ['Star Mines', [['mines', { rm: 1.2, el: 'burn' }]], 'Mines made of fallen stars: large, hot and slow to forget.', 'Black Hole Mine', 'burst'],
  'ss+fe': ['Cosmic Feast', [['harvest', { chance: 0.6, heal: 0.02, every: 10, drop: 'nova' }]], 'Kills usually heal you, sometimes drop a nova pickup, and every tenth sets off a shockwave.', 'Stellar Appetite', 'heal'],
  'ss+fr': ['Starstorm Frenzy', [['rain', { n: 8, rm: 0.55, el: 'burn' }]], 'A frenzied rain of little meteors falls around you.', 'Meteor Shower', 'swift'],
  'ss+sb': ['Twin Suns', [['beam', { n: 3, w: 10, el: 'burn', dm: 1.4 }]], 'Three wide beams of starlight reach the nearest enemies.', 'Binary Star', 'echo'],
  'ss+st': ['Astral Herd', [['boomerang', { n: 4, el: 'burn' }]], 'Four star-discs gallop out and return, burning everything on their path.', 'Cavalcade', 'wide'],
  'ss+li': ['Cosmic Storm', [['chain', { jumps: 8, fork: true, el: 'burn' }]], 'A long forking chain of cosmic lightning.', 'Aurora', 'echo'],
  'ss+fl': ['Gold Meteor', [['meteor', { n: 2, el: 'plain' }], ['tithe', { chance: 0.12 }]], 'Golden meteors crash on the crowd, and kills often drop coins.', 'Treasure Fall', 'gold'],
  'ss+tc': ['Crown of Stars', [['volley', { shape: 'spiral', pierce: 2, el: 'burn', big: true }]], 'A spiral of piercing star-thorns.', 'Diadem', 'burst'],
  'ss+sf': ['Starlight Swarm', [['seek', { n: 6, dm: 0.4, homing: 10, el: 'burn' }]], 'Six little stars each hunt their own enemy.', 'Firmament', 'seek'],
  'ss+df': ['Orbital Aegis', [['ring', { nm: 0.7, sp: 1.0, big: true, el: 'knock' }]], 'Large slow orbs circle you like moons, shoving back anything they touch.', 'Event Horizon', 'wide'],
  'ss+dd': ['Meteor Walk', [['march', { n: 8, el: 'burn', rm: 0.8, dm: 2.4 }]], 'A long line of falling stars marches toward the nearest enemy.', 'Skyfall', 'burst'],
  'ss+ce': ['Cosmic Chime', [['nova', { rings: 4, el: 'burn', rm: 0.7, dm: 0.5 }]], 'Four quick chimes of burning light ripple outward.', 'Celestial Choir', 'echo']
};
const CB_TABLE = {};
Object.keys(CB_RAW).forEach(function(k){ const p = k.split('+'); CB_TABLE[comboKeyOf(CB_ALIAS[p[0]], CB_ALIAS[p[1]])] = CB_RAW[k]; });
/* each combo's own level-3 upgrade: what it does to that combo's first behaviour (text, parameter changes) */
const CB_CAP2_RAW = {
  'nw+hq': ['Eight lashes instead of four.', { n: 8 }],
  'nw+sp': ['Four wider acid lines instead of two.', { n: 4, w: 11 }],
  'nw+wp': ['Four chained blades instead of two.', { n: 4 }],
  'nw+sd': ['Five rings of shockwave instead of three.', { rings: 5 }],
  'nw+ih': ['Nine lashes strike back instead of five.', { n: 9 }],
  'hq+sp': ['Five goo bombs with much bigger bursts.', { n: 5, explode: 120 }],
  'hq+wp': ['Four anvils drop at once.', { n: 4 }],
  'hq+sd': ['The fault lines are wider and last much longer.', { dur: 5, r: 2 }],
  'hq+ih': ['The pulse reaches farther and heals twice as much.', { r: 2.4, heal: 0.012 }],
  'sp+wp': ['Turrets last longer and fire twice as fast.', { life: 11, rate: 0.25 }],
  'sp+sd': ['The slick is far wider and lingers.', { dur: 4, r: 2.4 }],
  'sp+ih': ['It corrodes twice as fast and hits harder.', { tick: 0.15, dm: 1.2 }],
  'wp+sd': ['Running through enemies cuts twice as hard.', { dm: 2 }],
  'wp+ih': ['Five longer blades instead of three.', { n: 5, len: 1.1 }],
  'sd+ih': ['Three decoys at a time, with bigger blasts.', { nm: 3, rm: 1.4 }],
  'th+dm': ['Each mine bursts into twelve thorns instead of six.', { cl: 12 }],
  'th+fe': ['Fallen enemies sprout ten thorns far more often.', { chance: 0.55, n: 10 }],
  'th+fr': ['More orbs, and they fire nearly twice as often.', { nm: 1.6, shoot: 0.9 }],
  'dm+fe': ['Nearly every kill leaves a bigger pool.', { chance: 0.85, rm: 1.5 }],
  'dm+fr': ['Mines drop at nearly double the pace.', { cd: 0.18 }],
  'fe+fr': ['Every fourth kill sets off a shockwave, and kills heal double.', { every: 4, heal: 0.03 }],
  'sb+st': ['The fan is wider-reaching and pierces six enemies.', { pierce: 6, nm: 1.6 }],
  'sb+li': ['The bolt jumps ten times and forks.', { jumps: 10, fork: true }],
  'sb+fl': ['Four golden rays instead of two.', { n: 4 }],
  'sb+tc': ['A double spiral that pierces.', { nm: 2, pierce: 3 }],
  'sb+sf': ['Nine sun-sparks that turn faster.', { n: 9, homing: 14 }],
  'sb+df': ['Catches shots from farther away and heals you.', { r: 2.4, heal: 0.01 }],
  'sb+dd': ['The whirlwind swings out wider and hits more than twice as hard.', { R: 190, dm: 2.2 }],
  'sb+ce': ['Four rings of sunlight instead of two.', { rings: 4 }],
  'st+li': ['Six charged discs instead of three.', { n: 6 }],
  'st+fl': ['Golden hoofprints hit harder and last longer.', { dm: 1.5, dur: 4 }],
  'st+tc': ['Your gore is far deadlier.', { dm: 2.6 }],
  'st+sf': ['Eleven burning hoofbeats instead of six.', { n: 11 }],
  'st+df': ['The wall lasts nearly twice as long and heals twice as much.', { dur: 9, heal: 0.025 }],
  'st+dd': ['The vortex lasts longer and is wider.', { dur: 5, rm: 1.5 }],
  'st+ce': ['Five echoes instead of three.', { nm: 5 }],
  'li+fl': ['The bolt jumps eight times.', { jumps: 8 }],
  'li+tc': ['The bolt jumps nine times and keeps forking.', { jumps: 9 }],
  'li+sf': ['The orbs fire nearly twice as fast and there are more.', { nm: 1.1, shoot: 0.5 }],
  'li+df': ['The static aura pulses twice as fast and stuns harder.', { tick: 0.4, dm: 1.1 }],
  'li+dd': ['Twelve strikes instead of six.', { n: 12 }],
  'li+ce': ['Three claps, much wider.', { rings: 3, rm: 1.8 }],
  'fl+tc': ['Many more gilded thorns.', { nm: 1.7 }],
  'fl+sf': ['Six golden fireflies instead of three.', { n: 6 }],
  'fl+df': ['Catches more shots, and heals twice as much.', { r: 2, heal: 0.02 }],
  'fl+dd': ['Six whirlwinds instead of three.', { n: 6 }],
  'fl+ce': ['A shockwave every seventh kill, and far more coin.', { every: 7, gold: 3 }],
  'tc+sf': ['Nine beams in the sweep instead of five.', { n: 9 }],
  'tc+df': ['Eighteen thorns burst out instead of ten.', { n: 18 }],
  'tc+dd': ['A wider, hungrier whirl.', { R: 150, dm: 1.8 }],
  'tc+ce': ['Twice as many spines fly out behind you.', { nm: 2 }],
  'sf+df': ['The sanctuary lasts nearly twice as long and is wider.', { dur: 9, rm: 1.5 }],
  'sf+dd': ['The fiery vortex lasts longer and burns far harder.', { dur: 4.5, dm: 2.4 }],
  'sf+ce': ['Five pulses instead of three.', { rings: 5 }],
  'df+dd': ['The gale blows twice as hard and reaches farther.', { push: 1600, rm: 1.3 }],
  'df+ce': ['The sonic wave reaches much farther.', { r: 3.2 }],
  'dd+ce': ['Three howls, much wider.', { rings: 3, rm: 1.5 }],
  'ss+nw': ['Nine lashes instead of five.', { n: 9 }],
  'ss+hq': ['Two much bigger stars instead of one.', { n: 2, rm: 2.6 }],
  'ss+sp': ['Five pools instead of three, lasting longer.', { n: 5, dur: 5 }],
  'ss+wp': ['Five starmetal blades instead of three.', { n: 5 }],
  'ss+sd': ['The comet tail hits harder and lasts longer.', { dm: 1.8, dur: 4 }],
  'ss+ih': ['Seven stars fall instead of three.', { n: 7 }],
  'ss+th': ['Twice as many orbs in each ring.', { nm: 2 }],
  'ss+dm': ['Mines are much larger and drop faster.', { rm: 1.8, cd: 0.6 }],
  'ss+fe': ['Every fifth kill sets off a shockwave, and kills heal more.', { every: 5, heal: 0.035 }],
  'ss+fr': ['Fourteen meteors instead of eight.', { n: 14 }],
  'ss+sb': ['Five wider beams instead of three.', { n: 5, w: 14 }],
  'ss+st': ['Seven star-discs instead of four.', { n: 7 }],
  'ss+li': ['The chain jumps thirteen times.', { jumps: 13 }],
  'ss+fl': ['Four golden meteors instead of two.', { n: 4 }],
  'ss+tc': ['A double spiral of star-thorns that pierces five.', { nm: 2, pierce: 5 }],
  'ss+sf': ['Eleven stars instead of six.', { n: 11 }],
  'ss+df': ['More moons, on a wider path.', { nm: 1.6, rm: 1.3 }],
  'ss+dd': ['Fourteen falling stars march out instead of eight.', { n: 14 }],
  'ss+ce': ['Seven chimes instead of four.', { rings: 7 }]
};
const CB_CAP2 = {};
Object.keys(CB_CAP2_RAW).forEach(function(k){ const p = k.split('+'); CB_CAP2[comboKeyOf(CB_ALIAS[p[0]], CB_ALIAS[p[1]])] = CB_CAP2_RAW[k]; });

function cbCap(inst, kind){ return inst.level >= 3 && inst.def.cfg.cap === kind; }
function cbN(inst, p, base){ return Math.max(1, Math.round(base * (p.nm || 1) * (cbCap(inst, 'wide') ? 1.5 : 1))); }
function cbRad(inst, p, base){ return base * (p.rm || 1) * (cbCap(inst, 'wide') ? 1.4 : 1); }
function cbDmg(inst, p, cont){ return inst.s.dmg * (p.dm || 1) * (cont && cbCap(inst, 'echo') ? 1.3 : 1); }
function cbNear(x, y, r){ return enemiesNear(x, y, r, []); }
function cbTargets(n, range, x, y){
  const out = [], seen = new Set(); x = x === undefined ? P.x : x; y = y === undefined ? P.y : y;
  for (let i = 0; i < n; i++){ const e = nearestEnemy(x, y, range, seen); if (!e) break; seen.add(e); out.push(e); }
  return out;
}
function cbElOpts(inst, p, dmg){
  let o = fuseElemOpts(p.el || inst.def.cfg.el, dmg);
  if (inst.level >= 3){
    const c = inst.def.cfg.cap;
    if (c === 'frost') o = Object.assign({}, o, { slow: 0.55, slowT: 1.8 });
    else if (c === 'ignite') o = Object.assign({}, o, { burn: Math.max(o.burn || 0, dmg * 0.28), burnT: 2.4 });
    else if (c === 'stun') o = Object.assign({}, o, { stun: Math.max(o.stun || 0, 0.5) });
  }
  return o;
}
function cbHit(inst, e, dmg, p, extra){ damageEnemy(e, dmg, Object.assign({ color: inst.def.cfg.col, quiet: true }, cbElOpts(inst, p, dmg), extra || {})); }
function cbFx(inst, x, y, n, spd){
  const cfg = inst.def.cfg;
  for (let i = 0; i < n; i++){
    const a = Math.random() * TAU, s = rand((spd || 180) * 0.35, spd || 180);
    addParticle(x, y, Math.cos(a) * s, Math.sin(a) * s, rand(2.5, 5), rand(0.25, 0.55), i & 1 ? cfg.colB : cfg.colA, { glow: true, shape: cfg.shape });
  }
}
function cbLater(inst, fn, delay){
  setTimeoutish(function(){ if (P.dead || P.cards.indexOf(inst) < 0) return; const prev = dmgSrc; dmgSrc = inst.def.id; fn(); dmgSrc = prev; }, delay);
}
function cbSeek(inst, n, p, k){
  const cfg = inst.def.cfg, seen = new Set(), d = cbDmg(inst, p) * 1.3 * k;
  for (let i = 0; i < n; i++){
    const e = nearestEnemy(P.x, P.y, 640, seen); if (!e) break; seen.add(e);
    const a = Math.atan2(e.y - P.y, e.x - P.x) + rand(-0.5, 0.5), o = Object.assign({ homing: p.homing || 6, life: 1.7 }, fuseProjOpts(p.el || cfg.el, d));
    if (p.explode) o.explode = { r: cbRad(inst, p, p.explode), dmg: d * 0.7 };
    addProj(P.x, P.y, Math.cos(a) * 380, Math.sin(a) * 380, 7, d, cfg.col, o);
  }
}
function cbLine(inst, x, y, a, len, w, d, p){
  const cfg = inst.def.cfg, x2 = x + Math.cos(a) * len, y2 = y + Math.sin(a) * len, near = cbNear((x + x2) / 2, (y + y2) / 2, len / 2 + 70), dx = Math.cos(a), dy = Math.sin(a);
  G.bolts.push({ pts: [{ x: x, y: y }, { x: x2, y: y2 }], life: 0.24, max: 0.24, color: cfg.col, width: w });
  for (let i = 0; i < near.length; i++){
    const e = near[i]; if (e.dead) continue;
    const rx = e.x - x, ry = e.y - y, pr = rx * dx + ry * dy;
    if (pr < -e.r || pr > len + e.r || Math.abs(-rx * dy + ry * dx) > w + e.r) continue;
    cbHit(inst, e, d, p);
  }
  cbFx(inst, x2, y2, 5, 160);
}
function cbShock(inst, x, y, rad, dmg, p, extra){
  const cfg = inst.def.cfg, o = cbElOpts(inst, p, dmg);
  addShock(x, y, rad, 0.4, dmg, cfg.col, Object.assign({ width: 14, kb: o.kb || 240, stun: o.stun || 0, burn: o.burn || 0 }, extra || {}));
  cbFx(inst, x, y, 8, 220);
}
function cbPush(x, y, r, force, dt, skipBig){
  const near = cbNear(x, y, r);
  for (let i = 0; i < near.length; i++){
    const e = near[i]; if (e.dead || (skipBig && e.big)) continue;
    const a = Math.atan2(e.y - y, e.x - x), f = force * dt * e.kbRes;
    e.kx += Math.cos(a) * f; e.ky += Math.sin(a) * f;
  }
}
function cbHeal(frac){ const h = Math.max(1, Math.round(P.maxHp * frac)); P.hp = Math.min(P.maxHp, P.hp + h); addText(P.x, P.y - 40, '+' + h, '#7EE08A', 13, false); }
/* a "use" of the combo, for the level-3 upgrades that react to uses */
function cbEvent(inst){
  if (inst.level < 3) return;
  const c = inst.def.cfg.cap;
  if (c === 'heal') cbHeal(0.02);
  else if (c === 'seek') cbSeek(inst, 2, {}, 1);
  else if (c === 'gold' && G.time - (inst.goldT || 0) > 1.2){ inst.goldT = G.time; addPickup(P.x + rand(-40, 40), P.y + rand(-40, 40), 'gold'); }
}
function cbRun(inst, dt, B, p, i){
  inst.tm[i] -= dt; if (inst.tm[i] > 0) return;
  inst.tm[i] = inst.s.cd * (p.cd || 1) * (cbCap(inst, 'swift') ? 0.65 : 1) * haste();
  if (!nearestEnemy(P.x, P.y, 700)){ inst.tm[i] = 0.25; return; }                      /* nothing to use it on yet */
  inst.nFire++;
  const big = cbCap(inst, 'burst') && inst.nFire % 4 === 0;
  B.fire(inst, big ? 2.4 : 1, p);
  if (big){ abilityShake(7); sfx('boom', 0.1); }
  if (cbCap(inst, 'echo')) cbLater(inst, function(){ B.fire(inst, 0.7, p); }, 0.4);
  cbEvent(inst);
}
const CBH = {
  ring: {
    upd(inst, dt, p){
      inst.ang += dt * (p.sp || 2.4) * (cbCap(inst, 'swift') ? 1.3 : 1);
      const n = cbN(inst, p, inst.s.count), R = cbRad(inst, p, (p.big ? 130 : 66) + inst.s.rad * 0.22), dm = cbDmg(inst, p, true) * (p.big ? 0.9 : 0.6), rings = p.twin ? 2 : 1, ob = p.big ? 20 : 12;
      for (let g = 0; g < rings; g++){
        const rr = R * (g ? 0.62 : 1), dir = g ? -1 : 1, m = g ? Math.max(2, Math.ceil(n / 2)) : n;
        for (let i = 0; i < m; i++){
          const a = dir * inst.ang + i * TAU / m, x = P.x + Math.cos(a) * rr, y = P.y + Math.sin(a) * rr, near = cbNear(x, y, ob + 24);
          for (let k = 0; k < near.length; k++){ const e = near[k]; if (e.dead || Math.hypot(e.x - x, e.y - y) > e.r + ob) continue; if (canHit(e, 'cr' + inst.def.id + g + i, 0.45)) cbHit(inst, e, dm, p, p.big ? { kb: 420 } : null); }
        }
      }
      if (p.shoot){
        inst.shT = (inst.shT || 0) - dt;
        if (inst.shT <= 0){
          inst.shT = p.shoot * haste(); const e = nearestEnemy(P.x, P.y, 520);
          if (e){ const x = P.x + Math.cos(inst.ang) * R, y = P.y + Math.sin(inst.ang) * R, a = Math.atan2(e.y - y, e.x - x), d = dm * 1.4; addProj(x, y, Math.cos(a) * 420, Math.sin(a) * 420, 6, d, inst.def.cfg.col, Object.assign({ life: 1.2, kind: 'thorn' }, fuseProjOpts(p.el || inst.def.cfg.el, d))); }
        }
      }
    },
    draw(inst, ctx, p){
      const cfg = inst.def.cfg, n = cbN(inst, p, inst.s.count), R = cbRad(inst, p, (p.big ? 130 : 66) + inst.s.rad * 0.22), rings = p.twin ? 2 : 1, ob = p.big ? 20 : 12;
      for (let g = 0; g < rings; g++){
        const rr = R * (g ? 0.62 : 1), dir = g ? -1 : 1, m = g ? Math.max(2, Math.ceil(n / 2)) : n;
        for (let i = 0; i < m; i++){ const a = dir * inst.ang + i * TAU / m, x = P.x + Math.cos(a) * rr, y = P.y + Math.sin(a) * rr; softBlob(ctx, x, y, ob * 2, cfg.col, 0.25); fillCircle(ctx, x, y, ob * 0.6, i & 1 ? cfg.colB : cfg.colA); fillCircle(ctx, x, y, ob * 0.28, '#FFFFFF'); }
      }
    }
  },
  nova: { fire(inst, k, p){
    const s = inst.s, R = cbRad(inst, p, s.rad * 2.3) * (k > 1 ? 1.25 : 1), d = cbDmg(inst, p) * 1.2 * k, rings = p.rings || 1;
    for (let r = 0; r < rings; r++){
      const go = function(){ cbShock(inst, P.x, P.y, R * (1 + 0.18 * r), d * (1 - 0.12 * r), p, p.kb ? { kb: p.kb } : {}); if (p.pull) cbPush(P.x, P.y, R * 1.3, -700, 0.5, true); };
      if (r === 0) go(); else cbLater(inst, go, 0.18 * r);
    }
    abilityShake(5 * Math.min(k, 1.6));
  } },
  volley: { fire(inst, k, p){
    const s = inst.s, cfg = inst.def.cfg, sh = p.shape || 'ring', n = Math.round(cbN(inst, p, s.count) * (sh === 'ring' ? 2 : 1.6) * (k > 1 ? 1.4 : 1)), d = cbDmg(inst, p) * 0.7 * k, base = Math.random() * TAU;
    const tgt = nearestEnemy(P.x, P.y, 700), aim = tgt ? Math.atan2(tgt.y - P.y, tgt.x - P.x) : P.face;
    for (let i = 0; i < n; i++){
      let a, sp = p.sp || 340;
      if (sh === 'ring') a = base + i * TAU / n;
      else if (sh === 'fan') a = aim + (i / Math.max(1, n - 1) - 0.5) * 1.5;
      else if (sh === 'rear') a = P.face + Math.PI + (i / Math.max(1, n - 1) - 0.5) * 1.3;
      else { a = base + i * 0.55; sp = 200 + i * (170 / n); }
      const o = Object.assign({ life: p.life || 1.1, kind: 'thorn' }, fuseProjOpts(p.el || cfg.el, d));
      if (p.pierce) o.pierce = (o.pierce || 0) + p.pierce;
      addProj(P.x + Math.cos(a) * 22, P.y + Math.sin(a) * 22, Math.cos(a) * sp, Math.sin(a) * sp, p.big ? 9 : 6, d, cfg.col, o);
    }
    cbFx(inst, P.x, P.y, 6, 200); sfx('spit', 0.08);
  } },
  seek: { fire(inst, k, p){ cbSeek(inst, cbN(inst, p, p.n || 2), p, k); } },
  pool: { fire(inst, k, p){
    const s = inst.s, cfg = inst.def.cfg, n = cbN(inst, p, p.n || 1), r = cbRad(inst, p, s.rad * 0.7) * (k > 1 ? 1.3 : 1), d = cbDmg(inst, p) * 1.1 * k, w = p.where || 'near', tg = cbTargets(n, 560);
    for (let i = 0; i < n; i++){
      let x, y;
      if (w === 'self'){ x = P.x; y = P.y; }
      else if (w === 'ahead'){ x = P.x + Math.cos(P.face) * (150 + i * 90); y = P.y + Math.sin(P.face) * (150 + i * 90); }
      else if (w === 'scatter'){ const a = Math.random() * TAU, dd = rand(80, 300); x = P.x + Math.cos(a) * dd; y = P.y + Math.sin(a) * dd; }
      else { const e = tg[i] || tg[0]; x = e ? e.x : P.x + Math.cos(P.face) * 150; y = e ? e.y : P.y + Math.sin(P.face) * 150; }
      addZone(x, y, r, p.dur || 3.2, d, cfg.col, { grow: true, slow: (p.el || cfg.el) === 'slow' ? 0.55 : 0 });
      cbFx(inst, x, y, 6, 140);
    }
  } },
  chain: { fire(inst, k, p){
    const cfg = inst.def.cfg, seen = new Set(); let cur = nearestEnemy(P.x, P.y, 520), fx = P.x, fy = P.y, d = cbDmg(inst, p) * 1.1 * k;
    const jumps = cbN(inst, p, p.jumps || 4) + (k > 1 ? 2 : 0), first = cur;
    for (let j = 0; j < jumps && cur; j++){
      seen.add(cur); cbHit(inst, cur, d, p); G.bolts.push({ pts: [{ x: fx, y: fy }, { x: cur.x, y: cur.y }], life: 0.2, max: 0.2, color: cfg.col, width: 3 });
      fx = cur.x; fy = cur.y; d *= 0.85; cur = nearestEnemy(fx, fy, p.range || 300, seen);
    }
    if (p.fork && first){ const alt = cbTargets(2, 280, first.x, first.y); for (let i = 0; i < alt.length; i++){ if (alt[i] === first || alt[i].dead) continue; cbHit(inst, alt[i], d, p); G.bolts.push({ pts: [{ x: first.x, y: first.y }, { x: alt[i].x, y: alt[i].y }], life: 0.2, max: 0.2, color: cfg.colB, width: 3 }); } }
    sfx('zap', 0.08);
  } },
  meteor: { fire(inst, k, p){
    const s = inst.s, near = cbNear(P.x, P.y, 620), n = Math.round(cbN(inst, p, p.n || 1) * (k > 1 ? 1.5 : 1));
    for (let i = 0; i < n && near.length; i++){
      const e = near[Math.floor(Math.random() * near.length)]; if (!e || e.dead) continue;
      cbShock(inst, e.x, e.y, cbRad(inst, p, s.rad * 0.9), cbDmg(inst, p) * 1.6 * k, p, { width: 22, filled: true, kb: 300 });
    }
    abilityShake(4);
  } },
  trail: { upd(inst, dt, p){
    inst.tt = (inst.tt || 0) - dt;
    if (inst.tt > 0 || Math.hypot(P.vx, P.vy) < 40) return;
    inst.tt = (p.iv || 0.28) * (cbCap(inst, 'swift') ? 0.7 : 1);
    addZone(P.x, P.y, cbRad(inst, p, 36 * (p.r || 1)), p.dur || 2.4, cbDmg(inst, p, true) * 0.6, inst.def.cfg.col, { slow: (p.el || inst.def.cfg.el) === 'slow' ? 0.55 : 0 });
    if (Math.random() < 0.4) cbFx(inst, P.x, P.y, 2, 90);
  } },
  aura: {
    upd(inst, dt, p){
      const R = cbRad(inst, p, inst.s.rad * 1.1);
      if (p.push) cbPush(P.x, P.y, R, p.push, dt, true);
      if (p.pull) cbPush(P.x, P.y, R, -p.pull, dt, true);
      if (p.eproj){ const es = G.eproj; for (let i = es.length - 1; i >= 0; i--){ const q = es[i]; if (Math.hypot(q.x - P.x, q.y - P.y) < R * 0.8){ cbFx(inst, q.x, q.y, 3, 120); es.splice(i, 1); } } }
      inst.at = (inst.at || 0) - dt; if (inst.at > 0) return;
      inst.at = (p.tick || 0.4) * (cbCap(inst, 'swift') ? 0.7 : 1);
      const near = cbNear(P.x, P.y, R + 30), d = cbDmg(inst, p, true) * 0.3;
      for (let k = 0; k < near.length; k++){ const e = near[k]; if (e.dead || Math.hypot(e.x - P.x, e.y - P.y) > R + e.r) continue; cbHit(inst, e, d, p, { noCrit: true, silent: Math.random() > 0.3 }); }
    },
    draw(inst, ctx, p){ const R = cbRad(inst, p, inst.s.rad * 1.1), cfg = inst.def.cfg; ringPath(ctx, P.x, P.y, R, 2.4, cfg.col, 0.3 + 0.1 * Math.sin(G.time * 4)); softBlob(ctx, P.x, P.y, R, cfg.col, 0.05); }
  },
  harvest: { kill(inst, e, p){
    inst.kills = (inst.kills | 0) + 1;
    if (Math.random() < (p.chance || 0.3)){
      cbHeal2(inst, p, e);
    }
    if (p.every && inst.kills % p.every === 0) cbShock(inst, P.x, P.y, inst.s.rad * 1.6, inst.s.dmg * 1.1, p, {});
  } },
  beam: { fire(inst, k, p){
    const n = cbN(inst, p, p.n || 1), len = cbRad(inst, p, p.len || 430), w = (p.w || 7) * (k > 1 ? 1.5 : 1), d = cbDmg(inst, p) * k;
    if (p.sweep){
      const e = nearestEnemy(P.x, P.y, 640), base = (e ? Math.atan2(e.y - P.y, e.x - P.x) : P.face) - 0.5 * (n - 1) * 0.28;
      for (let j = 0; j < n; j++){ const a = base + j * 0.28; cbLater(inst, function(){ cbLine(inst, P.x, P.y, a, len, w, d, p); }, 0.06 * j); }
      return;
    }
    const t = cbTargets(n, 640);
    for (let i = 0; i < t.length; i++) cbLine(inst, P.x, P.y, Math.atan2(t[i].y - P.y, t[i].x - P.x), len, w, d, p);
  } },
  blades: {
    upd(inst, dt, p){
      inst.ang += dt * (p.sp || 3) * (cbCap(inst, 'swift') ? 1.3 : 1);
      const n = cbN(inst, p, p.n || 2), L = cbRad(inst, p, 95 * (p.len || 1)), d = cbDmg(inst, p, true) * 0.55;
      for (let b = 0; b < n; b++){
        const a = inst.ang + b * TAU / n, ca = Math.cos(a), sa = Math.sin(a);
        for (let seg = 1; seg <= 3; seg++){
          const x = P.x + ca * L * seg / 3, y = P.y + sa * L * seg / 3, near = cbNear(x, y, 36);
          for (let k = 0; k < near.length; k++){ const e = near[k]; if (e.dead || Math.hypot(e.x - x, e.y - y) > e.r + 16) continue; if (canHit(e, 'cb' + inst.def.id + b, 0.35)) cbHit(inst, e, d, p, { kb: 200 }); }
        }
      }
    },
    draw(inst, ctx, p){
      const cfg = inst.def.cfg, n = cbN(inst, p, p.n || 2), L = cbRad(inst, p, 95 * (p.len || 1));
      ctx.lineCap = 'round';
      for (let b = 0; b < n; b++){
        const a = inst.ang + b * TAU / n, x2 = P.x + Math.cos(a) * L, y2 = P.y + Math.sin(a) * L;
        ctx.strokeStyle = b & 1 ? cfg.colB : cfg.colA; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(P.x, P.y); ctx.lineTo(x2, y2); ctx.stroke();
        softBlob(ctx, x2, y2, 22, cfg.col, 0.3); fillCircle(ctx, x2, y2, 7, '#FFFFFF');
      }
    }
  },
  lash: { fire(inst, k, p){
    const cfg = inst.def.cfg, t = cbTargets(cbN(inst, p, p.n || 4), 460), d = cbDmg(inst, p) * 1.1 * k;
    for (let i = 0; i < t.length; i++){
      const e = t[i];
      G.bolts.push({ pts: [{ x: P.x, y: P.y - 20 }, { x: e.x, y: e.y }], life: 0.18, max: 0.18, color: cfg.col, width: 4 });
      cbHit(inst, e, d, p, p.pull ? { kb: 420, kbAngle: Math.atan2(P.y - e.y, P.x - e.x) } : { kb: 300 });
      cbFx(inst, e.x, e.y, 4, 160);
    }
    sfx('zap', 0.08);
  } },
  mines: { fire(inst, k, p){
    inst.o.push({ k: 'mine', x: P.x + rand(-20, 20), y: P.y + rand(0, 24), t: 6, arm: 0.5, p: p, pw: k });
    let c = 0; for (let i = inst.o.length - 1; i >= 0; i--) if (inst.o[i].k === 'mine' && ++c > 12){ inst.o.splice(i, 1); }
  } },
  turret: { fire(inst, k, p){
    inst.o.push({ k: 'turret', x: P.x + rand(-50, 50), y: P.y + rand(-30, 40), t: p.life || 6, cd: 0.3, p: p });
    let c = 0; for (let i = inst.o.length - 1; i >= 0; i--) if (inst.o[i].k === 'turret' && ++c > 3){ inst.o.splice(i, 1); }
  } },
  deathburst: { kill(inst, e, p){
    if (p.need && !(p.need === 'burn' ? e.burnT > 0 : p.need === 'slow' ? e.slowT > 0 : e.stunT > 0)) return;
    if (Math.random() > (p.chance || 0.25)) return;
    const cfg = inst.def.cfg, s = inst.s, d = cbDmg(inst, p) * 0.8;
    if (p.kind === 'volley'){
      const n = cbN(inst, p, p.n || 6), b = Math.random() * TAU;
      for (let i = 0; i < n; i++){ const a = b + i * TAU / n; addProj(e.x, e.y, Math.cos(a) * 320, Math.sin(a) * 320, 6, d * 0.8, cfg.col, Object.assign({ life: 0.9, kind: 'thorn' }, fuseProjOpts(p.el || cfg.el, d))); }
    } else if (p.kind === 'pool') addZone(e.x, e.y, cbRad(inst, p, s.rad * 0.55), 3.4, d * 0.9, cfg.col, { grow: true, slow: (p.el || cfg.el) === 'slow' ? 0.55 : 0 });
    else cbShock(inst, e.x, e.y, cbRad(inst, p, s.rad * 0.9), d * 1.2, p, {});
    cbFx(inst, e.x, e.y, 8, 200);
  } },
  ward: { fire(inst, k, p){
    const cfg = inst.def.cfg, R = cbRad(inst, p, 170 * (p.r || 1)) * (k > 1 ? 1.3 : 1), es = G.eproj; let c = 0;
    for (let i = es.length - 1; i >= 0; i--){
      const q = es[i]; if (Math.hypot(q.x - P.x, q.y - P.y) > R) continue;
      es.splice(i, 1); c++; cbFx(inst, q.x, q.y, 3, 120);
      if (p.reflect) addProj(q.x, q.y, -q.vx * 1.1, -q.vy * 1.1, 6, cbDmg(inst, p) * 1.4 * k, cfg.col, Object.assign({ life: 1.4, kind: 'thorn' }, fuseProjOpts(p.el || cfg.el, cbDmg(inst, p))));
      if (p.coin && c <= 2) addPickup(q.x, q.y, 'gold');
    }
    if (c && p.heal) cbHeal(Math.min(c, 5) * p.heal);
    addShock(P.x, P.y, R, 0.3, cbDmg(inst, p) * 0.5, cfg.col, { width: 6, kb: 120 });
    if (p.el === 'knock' && c === 0) cbPush(P.x, P.y, R * 0.6, 500, 0.4, true);
  } },
  rain: { fire(inst, k, p){
    const n = Math.round(cbN(inst, p, p.n || 5) * (k > 1 ? 1.5 : 1)), near = cbNear(P.x, P.y, 560);
    for (let i = 0; i < n; i++){
      const e = near.length ? near[(Math.random() * near.length) | 0] : null, x = (e ? e.x : P.x) + rand(-34, 34), y = (e ? e.y : P.y) + rand(-34, 34);
      cbLater(inst, function(){ cbShock(inst, x, y, cbRad(inst, p, 70), cbDmg(inst, p) * 0.7 * k, p, { width: 12, filled: true, kb: 200 }); }, 0.07 * i);
    }
    abilityShake(3);
  } },
  well: { fire(inst, k, p){
    const e = nearestEnemy(P.x, P.y, 600); if (!e) return;
    inst.o.push({ k: 'well', x: e.x, y: e.y, t: (p.dur || 3) * (k > 1 ? 1.4 : 1), r: cbRad(inst, p, 150), p: p, tk: 0, pw: k });
    let c = 0; for (let i = inst.o.length - 1; i >= 0; i--) if (inst.o[i].k === 'well' && ++c > 2){ inst.o.splice(i, 1); }
  } },
  ghost: { fire(inst, k, p){
    const n = p.nm || 1;
    for (let i = 0; i < n; i++) cbLater(inst, function(){ inst.o.push({ k: 'ghost', x: P.x, y: P.y, t: p.delay || 1.4, t0: p.delay || 1.4, p: p, pw: k }); }, 0.22 * i);
  } },
  retaliate: { events: true, upd(inst, dt, p){
    inst.rt = (inst.rt || 0) - dt;
    const hp = P.hp;
    if (inst.lastHp !== undefined && hp < inst.lastHp - 0.5 && inst.rt <= 0 && !P.dead){
      inst.rt = 1.2; const cfg = inst.def.cfg, d = cbDmg(inst, p) * 1.2, n = cbN(inst, p, p.n || 5);
      if (p.kind === 'lash'){
        const t = cbTargets(n, 460);
        for (let i = 0; i < t.length; i++){ const e = t[i]; G.bolts.push({ pts: [{ x: P.x, y: P.y - 20 }, { x: e.x, y: e.y }], life: 0.18, max: 0.18, color: cfg.col, width: 4 }); cbHit(inst, e, d, p, { kb: 340 }); }
      } else if (p.kind === 'meteor'){
        const near = cbNear(P.x, P.y, 520);
        for (let i = 0; i < n && near.length; i++){ const e = near[(Math.random() * near.length) | 0]; if (e && !e.dead) cbShock(inst, e.x, e.y, 90, d * 1.4, p, { width: 20, filled: true }); }
      } else {
        const b = Math.random() * TAU;
        for (let i = 0; i < n; i++){ const a = b + i * TAU / n; addProj(P.x, P.y, Math.cos(a) * 340, Math.sin(a) * 340, 6, d * 0.8, cfg.col, Object.assign({ life: 1, kind: 'thorn' }, fuseProjOpts(p.el || cfg.el, d))); }
      }
      cbShock(inst, P.x, P.y, 120, 0, p, { kb: 0 }); abilityShake(3); cbEvent(inst);
    }
    inst.lastHp = hp;
  } },
  tithe: { kill(inst, e, p){ if (Math.random() < (p.chance || 0.1)) addPickup(e.x, e.y, p.drop || 'gold'); } },
  boomerang: { fire(inst, k, p){
    const n = cbN(inst, p, p.n || 3), e = nearestEnemy(P.x, P.y, 640), base = e ? Math.atan2(e.y - P.y, e.x - P.x) : P.face;
    for (let i = 0; i < n; i++) inst.o.push({ k: 'boom', a: base + (i - (n - 1) / 2) * 0.5, d: 0, out: true, p: p, pw: k, id: ++zoneId });
  } },
  comet: {
    upd(inst, dt, p){
      inst.ang += dt * (p.sp || 1.7) * (cbCap(inst, 'swift') ? 1.3 : 1);
      const R = cbRad(inst, p, p.R || 140), x = P.x + Math.cos(inst.ang) * R, y = P.y + Math.sin(inst.ang) * R, d = cbDmg(inst, p, true) * 0.9, near = cbNear(x, y, 60);
      inst.cx = x; inst.cy = y;
      for (let k = 0; k < near.length; k++){ const e = near[k]; if (e.dead || Math.hypot(e.x - x, e.y - y) > e.r + 24) continue; if (canHit(e, 'cc' + inst.def.id, 0.3)) cbHit(inst, e, d, p, { kb: 300 }); }
      inst.lt = (inst.lt || 0) - dt;
      if (inst.lt <= 0){ inst.lt = 0.25; if (p.leave) addZone(x, y, 28, 1.6, d * 0.4, inst.def.cfg.col, {}); cbFx(inst, x, y, 2, 80); }
    },
    draw(inst, ctx){ if (inst.cx === undefined) return; const cfg = inst.def.cfg; softBlob(ctx, inst.cx, inst.cy, 46, cfg.col, 0.4); fillCircle(ctx, inst.cx, inst.cy, 16, cfg.colA); fillCircle(ctx, inst.cx, inst.cy, 8, '#FFFFFF'); }
  },
  sanctum: { fire(inst, k, p){
    inst.o.push({ k: 'sanct', x: P.x, y: P.y, t: p.dur || 5, r: cbRad(inst, p, 120), p: p, tk: 0, pw: k });
    let c = 0; for (let i = inst.o.length - 1; i >= 0; i--) if (inst.o[i].k === 'sanct' && ++c > 2){ inst.o.splice(i, 1); }
  } },
  ram: { upd(inst, dt, p){
    if (Math.hypot(P.vx, P.vy) < 150) return;
    const near = cbNear(P.x, P.y, P.r + 70), d = cbDmg(inst, p, true) * 0.9;
    for (let i = 0; i < near.length; i++){ const e = near[i]; if (e.dead || Math.hypot(e.x - P.x, e.y - P.y) > P.r + e.r + 18) continue; if (canHit(e, 'cbr' + inst.def.id, 0.3)){ cbHit(inst, e, d, p, { kb: 520 }); cbFx(inst, e.x, e.y, 4, 200); } }
  } },
  march: { fire(inst, k, p){
    const e = nearestEnemy(P.x, P.y, 640), a = e ? Math.atan2(e.y - P.y, e.x - P.x) : P.face, n = Math.round(cbN(inst, p, p.n || 5) * (k > 1 ? 1.3 : 1)), ox = P.x, oy = P.y, d = cbDmg(inst, p) * 0.9 * k;
    for (let j = 0; j < n; j++){
      const x = ox + Math.cos(a) * (70 + j * 85), y = oy + Math.sin(a) * (70 + j * 85);
      cbLater(inst, function(){ cbShock(inst, x, y, cbRad(inst, p, 80), d, p, { width: 14, filled: true, kb: 240 }); }, 0.09 * j);
    }
  } }
};
function cbHeal2(inst, p, e){
  if (p.heal) cbHeal(p.heal * (inst.level >= 2 ? 1.2 : 1));
  if (p.gold) G.bonusGold += p.gold * 0.5;
  if (p.drop) addPickup(e.x, e.y, p.drop);
}
/* the objects some behaviours leave on the ground */
const CBO = {
  mine: {
    upd(inst, o, dt){
      o.t -= dt; o.arm -= dt; const p = o.p;
      let go = o.t <= 0;
      if (!go && o.arm <= 0){ const near = cbNear(o.x, o.y, 78); for (let i = 0; i < near.length; i++) if (!near[i].dead){ go = true; break; } }
      if (!go) return false;
      const R = cbRad(inst, p, 60) * (p.small ? 0.7 : 1) * (p.rm || 1) * o.pw, d = cbDmg(inst, p) * 1.4 * o.pw * (p.small ? 0.55 : 1);
      cbShock(inst, o.x, o.y, R * 1.9, d, p, { kb: 260 });
      if (p.cluster){ const cfg = inst.def.cfg, b = Math.random() * TAU, nc = p.cl || 6; for (let i = 0; i < nc; i++){ const a = b + i * TAU / nc; addProj(o.x, o.y, Math.cos(a) * 300, Math.sin(a) * 300, 6, d * 0.7, cfg.col, Object.assign({ life: 0.9, kind: 'thorn' }, fuseProjOpts(p.el || cfg.el, d))); } }
      abilityShake(3); return true;
    },
    draw(inst, o, ctx){ const cfg = inst.def.cfg, on = o.arm <= 0 && Math.sin(G.time * 9) > 0; fillCircle(ctx, o.x, o.y, 9, '#2A2420'); fillCircle(ctx, o.x, o.y, 5, on ? '#FFFFFF' : cfg.col); ringPath(ctx, o.x, o.y, 12, 2, cfg.col, 0.5); }
  },
  turret: {
    upd(inst, o, dt){
      o.t -= dt; o.cd -= dt;
      if (o.cd <= 0){
        const e = nearestEnemy(o.x, o.y, 520), p = o.p, cfg = inst.def.cfg;
        if (e){ o.cd = (p.rate || 0.55) * haste(); const a = Math.atan2(e.y - o.y, e.x - o.x), d = cbDmg(inst, p) * 0.6; o.aim = a; addProj(o.x, o.y, Math.cos(a) * 420, Math.sin(a) * 420, 5, d, cfg.col, Object.assign({ life: 1.1, kind: 'thorn' }, fuseProjOpts(p.el || cfg.el, d))); }
        else o.cd = 0.2;
      }
      return o.t <= 0;
    },
    draw(inst, o, ctx){ const cfg = inst.def.cfg; fillCircle(ctx, o.x, o.y, 11, '#2A2420'); ctx.strokeStyle = cfg.col; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(o.x, o.y); ctx.lineTo(o.x + Math.cos(o.aim || 0) * 18, o.y + Math.sin(o.aim || 0) * 18); ctx.stroke(); fillCircle(ctx, o.x, o.y, 5, cfg.colA); }
  },
  well: {
    upd(inst, o, dt){
      o.t -= dt; o.tk -= dt; cbPush(o.x, o.y, o.r, -520, dt, true);
      if (o.tk <= 0){ o.tk = 0.3; const near = cbNear(o.x, o.y, o.r * 0.8), d = cbDmg(inst, o.p) * 0.45 * o.pw; for (let i = 0; i < near.length; i++){ const e = near[i]; if (!e.dead) cbHit(inst, e, d, o.p, { noCrit: true, silent: Math.random() > 0.3 }); } }
      return o.t <= 0;
    },
    draw(inst, o, ctx){ const cfg = inst.def.cfg, a = Math.min(1, o.t); softBlob(ctx, o.x, o.y, o.r, cfg.col, 0.18 * a); for (let k = 0; k < 3; k++){ ringPath(ctx, o.x, o.y, o.r * (0.3 + 0.25 * k) * (0.9 + 0.1 * Math.sin(G.time * 5 + k)), 3, k & 1 ? cfg.colB : cfg.colA, 0.5 * a); } fillCircle(ctx, o.x, o.y, 8, '#15100C'); }
  },
  ghost: {
    upd(inst, o, dt){
      o.t -= dt; if (o.t > 0) return false;
      cbShock(inst, o.x, o.y, cbRad(inst, o.p, inst.s.rad * 1.5) * o.pw, cbDmg(inst, o.p) * 1.1 * o.pw, o.p, { kb: 460 }); abilityShake(3); return true;
    },
    draw(inst, o, ctx){ const cfg = inst.def.cfg, f = 1 - o.t / o.t0; ctx.globalAlpha = 0.35 + 0.3 * Math.sin(G.time * 12); fillCircle(ctx, o.x, o.y, 22, cfg.col); ctx.globalAlpha = 1; ringPath(ctx, o.x, o.y, 22 + 30 * f, 2, cfg.colA, 0.6); }
  },
  sanct: {
    upd(inst, o, dt){
      o.t -= dt; o.tk -= dt;
      if (o.tk <= 0){ o.tk = 0.4; const near = cbNear(o.x, o.y, o.r + 30), d = cbDmg(inst, o.p) * 0.3; for (let i = 0; i < near.length; i++){ const e = near[i]; if (e.dead || Math.hypot(e.x - o.x, e.y - o.y) > o.r + e.r) continue; cbHit(inst, e, d, o.p, { noCrit: true, silent: Math.random() > 0.3 }); } }
      if (Math.hypot(P.x - o.x, P.y - o.y) < o.r) P.hp = Math.min(P.maxHp, P.hp + P.maxHp * (o.p.heal || 0.012) * dt);
      return o.t <= 0;
    },
    draw(inst, o, ctx){ const cfg = inst.def.cfg, a = Math.min(1, o.t); softBlob(ctx, o.x, o.y, o.r, cfg.col, 0.2 * a); ringPath(ctx, o.x, o.y, o.r, 3, cfg.colA, 0.55 * a); ringPath(ctx, o.x, o.y, o.r * 0.6, 2, cfg.colB, 0.4 * a); }
  },
  boom: {
    upd(inst, o, dt){
      const p = o.p, len = cbRad(inst, p, 260), sp = 440;
      if (o.out){ o.d += sp * dt; if (o.d >= len) o.out = false; } else { o.d -= sp * dt * 1.15; if (o.d <= 12) return true; }
      o.x = P.x + Math.cos(o.a) * o.d; o.y = P.y + Math.sin(o.a) * o.d;
      const near = cbNear(o.x, o.y, 50), d = cbDmg(inst, p) * 0.9 * o.pw;
      for (let i = 0; i < near.length; i++){ const e = near[i]; if (e.dead || Math.hypot(e.x - o.x, e.y - o.y) > e.r + 24) continue; if (canHit(e, 'cbb' + inst.def.id + o.id, 0.4)) cbHit(inst, e, d, p, { kb: 260 }); }
      return false;
    },
    draw(inst, o, ctx){ if (o.x === undefined) return; const cfg = inst.def.cfg; softBlob(ctx, o.x, o.y, 34, cfg.col, 0.35); ctx.strokeStyle = cfg.colA; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(o.x, o.y, 15, G.time * 14, G.time * 14 + 4); ctx.stroke(); fillCircle(ctx, o.x, o.y, 5, '#FFFFFF'); }
  }
};
function cbObjs(inst, dt){
  const os = inst.o;
  for (let i = os.length - 1; i >= 0; i--){ if (CBO[os[i].k].upd(inst, os[i], dt)) os.splice(i, 1); }
}

function comboKeyFor(idA, idB){ return 'combo_' + idA + '_' + idB; }
function cardOrder(id){ for (let i = 0; i < CARDS.length; i++) if (CARDS[i].id === id) return i; return 99; }
const FUSE_SHAPE = { burn: 'diamond', stun: 'diamond', knock: 'rock', slow: 'ring', bleed: 'dot', plain: 'rock' };
function comboDefFor(idA, idB){
  if (cardOrder(idA) > cardOrder(idB)){ const t = idA; idA = idB; idB = t; }
  const key = comboKeyFor(idA, idB); if (CARDMAP[key]) return CARDMAP[key];
  const A = CARDMAP[idA], B = CARDMAP[idB], fa = FUSE_INFO[idA], fb = FUSE_INFO[idB], row = CB_TABLE[comboKeyOf(idA, idB)];
  if (!row) return null;
  const colA = A.forms[0].color, colB = B.forms[0].color, col = csHex(colA, colB, 0.5), bs = row[1];
  const rar = Math.max(fuseRarityIdx(A), fuseRarityIdx(B)), mul = [1, 1.3, 1.7, 2.3][rar];
  const cfg = { col: col, colA: colA, colB: colB, el: (bs[0][1].el || fa.elem), shape: FUSE_SHAPE[fb.elem] || 'dot', cap: row[4], bs: bs, capName: row[3], ability: row[2], name: row[0] };
  const icon = '@' + CB_ICON[bs[0][0]] + ':' + col;
  const c2 = CB_CAP2[comboKeyOf(idA, idB)];
  const bs3 = bs.map(function(b, i){ return i === 0 && c2 ? [b[0], Object.assign({}, b[1], c2[1])] : b; });     /* the behaviours as they are at level 3 */
  cfg.bs3 = bs3; cfg.cap2 = c2 ? c2[0] : '';
  const def = {
    id: key, rarity: 'combo', type: 'combo', combo: true, parts: [idA, idB], cfg: cfg, maxLevel: 3, hideStats: ['rad', 'count'],
    forms: [
      { lv: 1, name: row[0], icon: icon, color: col, desc: row[2] },
      { lv: 2, name: row[0], icon: icon, color: col, desc: row[2] + ' Level 2: stronger and quicker.' },
      { lv: 3, name: row[0], icon: icon, color: col, desc: 'Special upgrade, ' + row[3] + ': ' + (c2 ? c2[0] + ' ' : '') + CB_CAPS[row[4]] }
    ],
    stats(L){ L = Math.max(1, Math.min(3, L | 0)); return { dmg: 64 * mul * [0.85, 1.15, 1.5][L - 1], cd: 3.2 - 0.3 * (L - 1), rad: 120 + 10 * (L - 1), count: [5, 6, 8][L - 1] }; },
    init(inst){
      inst.t = 1.2; inst.ang = Math.random() * TAU; inst.o = []; inst.nFire = 0; inst.evT = 2.5; inst.bigT = 6; inst.kills = 0;
      inst.tm = bs.map(function(){ return 0.6 + Math.random() * 0.8; });
      inst.timer = !bs.some(function(b){ return CBH[b[0]].fire || CBH[b[0]].events; });
    },
    update(inst, dt){
      const L = inst.level >= 3 ? bs3 : bs;
      for (let i = 0; i < L.length; i++){ const B = CBH[L[i][0]], p = L[i][1]; if (B.fire) cbRun(inst, dt, B, p, i); if (B.upd) B.upd(inst, dt, p); }
      cbObjs(inst, dt);
      if (inst.timer && inst.level >= 3){
        inst.evT -= dt; if (inst.evT <= 0){ inst.evT = 2.5; if (nearestEnemy(P.x, P.y, 600)) cbEvent(inst); }
        if (cfg.cap === 'burst'){ inst.bigT -= dt; if (inst.bigT <= 0){ inst.bigT = 6; if (nearestEnemy(P.x, P.y, 600)){ cbShock(inst, P.x, P.y, inst.s.rad * 2.6, inst.s.dmg * 1.6, bs[0][1], { width: 22 }); abilityShake(7); } } }
      }
    },
    drawUnder(inst, ctx){
      const t = G.time, R = 40 + 8 * (inst.seam | 0) + 2.5 * Math.sin(t * 3), w = inst.level >= 3 ? 4.5 : 3, y = P.y + 6;
      ctx.save(); ctx.lineWidth = w; ctx.globalAlpha = inst.level >= 3 ? 0.8 : 0.5;
      ctx.strokeStyle = colA; ctx.beginPath(); ctx.arc(P.x, y, R, t * 1.2, t * 1.2 + Math.PI); ctx.stroke();
      ctx.strokeStyle = colB; ctx.beginPath(); ctx.arc(P.x, y, R, t * 1.2 + Math.PI, t * 1.2 + TAU); ctx.stroke();
      ctx.globalAlpha = 1;
      for (let i = 0; i < 2; i++){ const a = -t * 2 + i * Math.PI; fillCircle(ctx, P.x + Math.cos(a) * (R + 6), y + Math.sin(a) * (R + 6), 3.5, i ? colB : colA); }
      ctx.restore();
    },
    drawOver(inst, ctx){
      const L = inst.level >= 3 ? bs3 : bs;
      for (let i = 0; i < L.length; i++){ const B = CBH[L[i][0]]; if (B.draw) B.draw(inst, ctx, L[i][1]); }
      for (let i = 0; i < inst.o.length; i++){ const o = inst.o[i]; CBO[o.k].draw(inst, o, ctx); }
    },
    onKill(inst, e){ const L = inst.level >= 3 ? bs3 : bs; for (let i = 0; i < L.length; i++){ const B = CBH[L[i][0]]; if (B.kill) B.kill(inst, e, L[i][1]); } }
  };
  CARDMAP[key] = def; return def;
}
function fuseRarityIdx(def){ return { common: 0, rare: 1, epic: 2, legendary: 3 }[def.rarity] | 0; }
function visibleCards(){ return P.cards.filter(function(c){ return !c.hidden; }); }
/* ---- combos are unlocked in the machine for a one-time charge, then offered at level-up once both parts are at level 10 ---- */
function comboKeyOf(idA, idB){ return cardOrder(idA) <= cardOrder(idB) ? idA + '|' + idB : idB + '|' + idA; }
function comboUnlocked(idA, idB){ return !!(Save.data.combos && Save.data.combos[comboKeyOf(idA, idB)]); }
function canFuseIds(idA, idB){
  if (idA === idB || !FUSE_INFO[idA] || !FUSE_INFO[idB]) return false;
  if (idA === 'starfall' || idB === 'starfall') return true;
  return CARDMAP[idA].rarity === CARDMAP[idB].rarity;
}
/* every valid pair, in card order */
function allComboPairs(){
  const ids = Object.keys(FUSE_INFO).sort(function(a, b){ return cardOrder(a) - cardOrder(b); }), out = [];
  for (let i = 0; i < ids.length; i++) for (let j = i + 1; j < ids.length; j++) if (canFuseIds(ids[i], ids[j])) out.push([ids[i], ids[j]]);
  return out;
}
function comboCount(){ let n = 0; const ps = allComboPairs(); for (let i = 0; i < ps.length; i++) if (comboUnlocked(ps[i][0], ps[i][1])) n++; return n; }
/* a card she has taken to level 10 in any run counts toward the discount on every combo it is part of */
function cardMastered(id){ return !!(Save.data.mastered && Save.data.mastered[id]); }
function markMastered(id){ if (!Save.data.mastered) Save.data.mastered = {}; if (!Save.data.mastered[id]){ Save.data.mastered[id] = 1; Save.write(); } }
function comboDiscount(idA, idB){ return 0.15 * ((cardMastered(idA) ? 1 : 0) + (cardMastered(idB) ? 1 : 0)); }
const FUSE_BASE = { gold: 400000, gems: 2500, basalt: 60, sulfur: 60, grubs: 40 };
function comboCost(idA, idB){
  if ((Save.data.fusions | 0) === 0) return null;                                   /* the first combo is free */
  const m = [1, 2.5, 6, 14][Math.max(fuseRarityIdx(CARDMAP[idA]), fuseRarityIdx(CARDMAP[idB]))] * (1 - comboDiscount(idA, idB)), c = {};
  for (const k in FUSE_BASE) c[k] = Math.round(FUSE_BASE[k] * m); return c;
}
function fuseAffordable(c){ if (!c) return true; for (const k in c) if ((Save.data[k] | 0) < c[k]) return false; return true; }
function fuseCostHTML(c){
  if (!c) return '<span style="color:#9BE04A">Free (your first combo)</span>';
  const cols = { gold: '#FFD27A', gems: '#7AD8FF', basalt: '#AEB8E0', sulfur: '#F2D43A', grubs: '#E8D8A0' };
  return Object.keys(c).map(function(k){ return '<span style="color:' + ((Save.data[k] | 0) < c[k] ? '#FF7A6A' : cols[k]) + '">' + fmt(c[k]) + ' ' + k + '</span>'; }).join(' · ');
}
function unlockCombo(idA, idB){
  if (cityLevel('c_fusion') < 1 || !canFuseIds(idA, idB) || comboUnlocked(idA, idB)) return false;
  const c = comboCost(idA, idB); if (!fuseAffordable(c)) return false;
  if (c) for (const k in c) Save.data[k] = (Save.data[k] | 0) - c[k];
  if (!Save.data.combos) Save.data.combos = {};
  Save.data.combos[comboKeyOf(idA, idB)] = 1; Save.data.fusions = (Save.data.fusions | 0) + 1; Save.write();
  return true;
}
const COMBO_MILESTONES = [
  { n: 10, gold: 3000000, gems: 3000 },
  { n: 25, gold: 12000000, gems: 10000, grubs: 150 },
  { n: 50, gold: 40000000, gems: 30000, grubs: 400, basalt: 150, sulfur: 150 },
  { n: 76, gold: 100000000, gems: 100000, grubs: 1000, basalt: 400, sulfur: 400 }
];
function milestoneReady(m){ return comboCount() >= m.n && !(Save.data.comboClaims && Save.data.comboClaims[m.n]); }
function claimMilestone(n){
  const m = COMBO_MILESTONES.filter(function(x){ return x.n === n; })[0]; if (!m || !milestoneReady(m)) return false;
  if (!Save.data.comboClaims) Save.data.comboClaims = {};
  Save.data.comboClaims[n] = 1;
  for (const k in m) if (k !== 'n') Save.data[k] = (Save.data[k] | 0) + m[k];
  Save.write(); return true;
}
function makeComboInst(a, b){
  const def = comboDefFor(a.def.id, b.def.id);
  const inst = { def: def, level: 1, ang: 0, t: 0, tier: 0, parts: [a, b] };
  inst.seam = P.cards.filter(function(c){ return c.def.combo && !c.hidden; }).length;
  if (def.init) def.init(inst); refreshInst(inst);
  a.hidden = true; b.hidden = true; a.fusedInto = inst; b.fusedInto = inst;
  return inst;
}
/* the combos she could be offered right now: unlocked, both parts held at level 10, and not already taken */
function comboOffers(){
  const out = [], have = {}; for (let i = 0; i < P.cards.length; i++) have[P.cards[i].def.id] = true;
  const keys = Object.keys(Save.data.combos || {});
  for (let i = 0; i < keys.length; i++){
    const p = keys[i].split('|'); if (!CARDMAP[p[0]] || !CARDMAP[p[1]]) continue;
    const def = comboDefFor(p[0], p[1]); if (!def || have[def.id]) continue;
    const a = ownedCard(p[0]), b = ownedCard(p[1]);
    if (a && b && a.level >= 10 && b.level >= 10) out.push(def);
  }
  return out;
}
function takeCombo(def){
  const a = ownedCard(def.parts[0]), b = ownedCard(def.parts[1]); if (!a || !b) return null;
  const inst = makeComboInst(a, b); P.cards.push(inst); recalcStats(); resetLoadoutHUD(); return inst;
}
function upgradeCombo(inst){
  if (!inst || inst.level >= 3) return false;
  inst.level++; refreshInst(inst); recalcStats(); return true;
}
/* ---- the machine's own screen (opened from the City tab): the machine, and the codex of every combo ---- */
function fuseSelTags(idA, idB){ return FUSE_INFO[idA].tag + ' + ' + FUSE_INFO[idB].tag; }
function showFusionMachine(){
  G.state = 'shop'; G.attract = true; G.subScreen = 'fusionmachine'; G.venusScreen = false; G.marsScreen = false; G.labScreen = false;
  HUD.classList.remove('on');
  const tab = G.fuseTab === 'codex' ? 'codex' : 'machine', pairs = allComboPairs(), have = comboCount(), total = pairs.length;
  const tabs = '<div class="tabs" style="margin:6px 0 10px"><button class="tab' + (tab === 'machine' ? ' on' : '') + '" data-a="fuse-tab-machine">Machine</button>' +
    '<button class="tab' + (tab === 'codex' ? ' on' : '') + '" data-a="fuse-tab-codex">Codex ' + have + ' / ' + total + '</button></div>';
  const wallet = '<div class="sub" style="margin:2px 0 8px">You have: ' + CITY_CUR.map(function(c){ return '<span style="color:' + c[2] + '">' + cityNum(c[0], cityHave(c[0])) + ' ' + c[1] + '</span>'; }).join(' · ') + '</div>';
  let body = '';
  if (tab === 'machine'){
    const ids = Object.keys(FUSE_INFO).sort(function(a, b){ return cardOrder(a) - cardOrder(b); });
    G.fuseSel = (G.fuseSel || []).filter(function(id){ return FUSE_INFO[id]; }).slice(0, 2);
    const sel = G.fuseSel;
    let rows = '';
    for (let k = 0; k < ids.length; k++){
      const id = ids[k], def = CARDMAP[id], f = def.forms[0], on = sel.indexOf(id) >= 0;
      rows += '<div class="shoprow' + (on ? ' sel' : '') + '"><div class="ic">' + ico(f.icon, f.color) + '</div><div class="txt"><div class="nm">' + f.name + ' <span style="opacity:.7;font-size:12px">' + def.rarity + '</span>' +
        (cardMastered(id) ? ' <span style="color:#F2B33D;font-size:12px" title="You have taken this card to level 10 in a run: 15% off every combo it is part of">★ mastered</span>' : '') + '</div></div>' +
        '<button class="btn sm ' + (on ? '' : 'ghost') + '" data-a="fuse-pick-' + id + '">' + (on ? 'Chosen' : 'Choose') + '</button></div>';
    }
    let foot = '<div class="fusepreview"><div class="ds">Choose two cards to see what they can become.</div></div>', can = false, owned = false;
    if (sel.length === 2){
      if (canFuseIds(sel[0], sel[1])){
        const def = comboDefFor(sel[0], sel[1]), c = comboCost(sel[0], sel[1]), disc = comboDiscount(sel[0], sel[1]), cfg = def.cfg;
        owned = comboUnlocked(sel[0], sel[1]); can = !owned && fuseAffordable(c);
        if (owned){
          foot = '<div class="fusepreview"><b style="color:' + def.forms[0].color + '">' + ico(def.forms[0].icon) + ' ' + def.forms[0].name + '</b><div class="ds">' + def.forms[0].desc + '</div>' +
            '<div class="ds" style="margin-top:6px"><b style="color:var(--sun)">Level 3 special upgrade, ' + cfg.capName + ':</b> ' + CB_CAPS[cfg.cap] + '</div>' +
            '<div class="ds" style="color:#9BE04A;margin-top:6px">Unlocked. It can appear at level-up once you hold both cards at level 10, and it has three levels.</div></div>';
        } else {
          foot = '<div class="fusepreview"><b style="color:' + cfg.col + '">' + ico('@t-x-help', cfg.col) + ' ??? ' + fuseSelTags(sel[0], sel[1]) + '</b>' +
            '<div class="ds">An unknown combo. It looks ' + FUSE_ELEM_ADJ[cfg.el] + '. What it does is revealed the moment you unlock it.</div>' +
            '<div class="ds" style="margin-top:6px">One-time cost: ' + fuseCostHTML(c) + '</div>' +
            (c && disc > 0 ? '<div class="ds" style="color:#F2B33D">Mastery discount: ' + Math.round(disc * 100) + '% off, from taking ' + (disc > 0.2 ? 'both cards' : 'one of these cards') + ' to level 10 in a run.</div>' : '') +
            (can ? '' : '<div class="ds" style="color:#FF7A6A">You cannot afford this yet.</div>') + '</div>';
        }
      } else foot = '<div class="fusepreview"><div class="ds" style="color:#FFB07A">These two cannot be combined. Cards must share a rarity. Starfall Horn is the exception and combines with any card.</div></div>';
    }
    body = '<div class="shoplist">' + rows + '</div>' + foot +
      '<div class="row" style="margin-top:12px"><button class="btn sm" data-a="fuse-do"' + (can ? '' : ' disabled') + '>' + (owned ? 'Already unlocked' : 'Unlock this combo') + '</button><button class="btn sm ghost" data-a="fusion-back">Back to the City</button></div>';
  } else {
    const filt = G.cxFilter === 'locked' || G.cxFilter === 'unlocked' ? G.cxFilter : 'all', pc = Math.round(have / Math.max(1, total) * 100);
    let ms = '';
    for (let i = 0; i < COMBO_MILESTONES.length; i++){
      const m = COMBO_MILESTONES[i], done = !!(Save.data.comboClaims && Save.data.comboClaims[m.n]), ready = milestoneReady(m);
      const rew = Object.keys(m).filter(function(k){ return k !== 'n'; }).map(function(k){ return fmt(m[k]) + ' ' + k; }).join(', ');
      ms += '<div class="shoprow"><div class="ic">' + ico('@t-x-medal', done ? '#9BE04A' : ready ? '#F2B33D' : '#8A8076') + '</div><div class="txt"><div class="nm">' + m.n + ' combos' + (done ? ' <span style="color:#9BE04A;font-size:12px">claimed</span>' : '') + '</div><div class="ds">' + rew + '</div></div>' +
        (done ? '' : '<button class="btn sm ' + (ready ? '' : 'ghost') + '" data-a="fuse-claim-' + m.n + '"' + (ready ? '' : ' disabled') + '>' + (ready ? 'Claim' : (m.n - have) + ' to go') + '</button>') + '</div>';
    }
    let tiles = '';
    for (let i = 0; i < pairs.length; i++){
      const a = pairs[i][0], b = pairs[i][1], un = comboUnlocked(a, b);
      if ((filt === 'locked' && un) || (filt === 'unlocked' && !un)) continue;
      const def = comboDefFor(a, b), f = def.forms[0];
      tiles += '<button class="cxtile' + (un ? ' on' : '') + '" data-a="fuse-view-' + a + '~' + b + '" style="' + (un ? 'border-color:' + f.color : '') + '">' +
        '<span class="cxi">' + (un ? ico(f.icon, f.color) : ico('@t-x-help', '#5A524A')) + '</span><span class="cxn">' + (un ? f.name : '???') + '</span><span class="cxt">' + fuseSelTags(a, b) + '</span></button>';
    }
    body = '<div class="cxbar"><i style="width:' + pc + '%"></i></div><div class="sub" style="margin:4px 0 10px">' + have + ' of ' + total + ' combos unlocked (' + pc + '%). Unlock a combo to learn what it does. Tap a tile to inspect it in the machine.</div>' +
      '<div class="shoplist">' + ms + '</div>' +
      '<div class="row" style="margin:10px 0"><button class="btn sm ' + (filt === 'all' ? '' : 'ghost') + '" data-a="fuse-filter-all">All</button><button class="btn sm ' + (filt === 'unlocked' ? '' : 'ghost') + '" data-a="fuse-filter-unlocked">Unlocked</button><button class="btn sm ' + (filt === 'locked' ? '' : 'ghost') + '" data-a="fuse-filter-locked">Locked</button></div>' +
      '<div class="cxgrid">' + (tiles || '<span class="sub">' + (filt === 'unlocked' ? 'No combos unlocked yet. Open the Machine tab, pick two cards that share a rarity, and unlock them. The first is free.' : filt === 'locked' ? 'Every combo is unlocked. Nothing left to find here.' : 'Nothing here.') + '</span>') + '</div>' +
      '<div class="row" style="margin-top:12px"><button class="btn sm ghost" data-a="fusion-back">Back to the City</button></div>';
  }
  setOverlay(
    '<div class="panel slab wide" style="max-width:680px"><h2 class="head">Card Fusion Machine</h2>' +
    '<p class="sub">Unlock a combo once, for a one-time charge, and it can turn up at level-up when you hold both parts at level 10. Taking it hides the two cards, which keep every effect they had, and frees a card slot. A combo has three levels, and the last one adds a special upgrade. The first combo is free.</p>' +
    wallet + tabs + body + '</div>');
}
/* ---- the film of the giraffe building the machine ---- */
function fusionMachine(ctx, x, y, p, t, fire){
  const a = csSm(0, 0.25, p), b = csSm(0.2, 0.5, p), c = csSm(0.45, 0.75, p), d = csSm(0.7, 1, p);
  ctx.fillStyle = 'rgba(0,0,0,.3)'; ctx.fillRect(x - 190, y - 4, 400, 12);
  ctx.fillStyle = '#4A4458'; ctx.fillRect(x - 180, y - 26 * a, 360, 26 * a);                                    /* the base plate */
  ctx.fillStyle = '#6A6478'; ctx.fillRect(x - 180, y - 26 * a, 360, 6);
  for (const sx of [-1, 1]){                                                                                 /* two card chambers */
    const cx = x + sx * 105, h = 150 * b;
    ctx.fillStyle = '#2A2634'; ctx.fillRect(cx - 52, y - 26 - h, 104, h); ctx.strokeStyle = '#7A748C'; ctx.lineWidth = 4; ctx.strokeRect(cx - 52, y - 26 - h, 104, h);
    if (b > 0.9){ ctx.fillStyle = 'rgba(120,230,255,' + (0.16 + 0.1 * Math.sin(t * 3 + sx) + 0.4 * fire) + ')'; ctx.fillRect(cx - 44, y - 26 - 142, 88, 134); }
  }
  if (c > 0.01){                                                                                             /* the central coil */
    const h = 210 * c; ctx.fillStyle = '#3A3648'; ctx.fillRect(x - 30, y - 26 - h, 60, h); ctx.strokeStyle = '#8A84A0'; ctx.lineWidth = 3; ctx.strokeRect(x - 30, y - 26 - h, 60, h);
    for (let k = 0; k < 7; k++){ const yy = y - 26 - h + 18 + k * 26; if (yy > y - 40) break; ctx.fillStyle = '#B880FF'; ctx.globalAlpha = 0.5 + 0.4 * Math.sin(t * 5 + k); ctx.fillRect(x - 24, yy, 48, 6); ctx.globalAlpha = 1; }
    ctx.strokeStyle = '#7A748C'; ctx.lineWidth = 6; ctx.globalAlpha = c; ctx.beginPath(); ctx.moveTo(x - 52 - 105 + 210, y - 130); ctx.quadraticCurveTo(x - 60, y - 190 * c, x - 30, y - 150); ctx.moveTo(x + 52 + 105 - 210, y - 130); ctx.quadraticCurveTo(x + 60, y - 190 * c, x + 30, y - 150); ctx.stroke(); ctx.globalAlpha = 1;
  }
  if (d > 0.01){
    csGlow(ctx, x, y - 190, 90 + 70 * fire, '#B880FF', 0.35 * d + 0.5 * fire); fillCircle(ctx, x, y - 190, 14 * d, '#E8D0FF');
    ctx.globalAlpha = d; csText(ctx, 'CARD FUSION', x, y - 262, 24, '#E8E0F8', 'center', '800'); ctx.globalAlpha = 1;
  }
}
const FUSION_T = { END: 16 };
function fusionScene(ctx, t){
  hmCityBack(ctx, t);
  [[170, 0.58, 1, 1], [1180, 0.6, 3, -1]].forEach((c, i) => csGiraffe(ctx, Object.assign({ x: c[0], y: 616, s: c[1], face: c[3], walk: t * 1.2 + i, moving: false, neck: 0.28 + 0.1 * Math.sin(t * 0.9 + i), head: 0.1, bare: true, boots: false }, HM_COATS[c[2]])));
  const p = csSm(2.6, 10.6, t), fire = csSm(11.4, 12.2, t) * (1 - csSm(14.6, 15.6, t));
  fusionMachine(ctx, 800, 616, p, t, fire);
  const gx = csLerp(-100, 470, csSm(0, 2.8, t)), working = t > 3 && t < 10.8;
  const hammer = working ? Math.abs(Math.sin(t * 5)) : 0;
  csGiraffe(ctx, { x: gx, y: 616, s: 0.9, face: 1, walk: t * 6, moving: t < 2.8, neck: 0.3 + 0.18 * hammer, head: 0.1 + 0.2 * hammer, bare: true, boots: false });
  if (working && Math.sin(t * 5) > 0.9){ for (let k = 0; k < 4; k++) csGlow(ctx, 640 + k * 6, 560 + k * 4, 16, '#FFE0A0', 0.6); }
  if (t > 11.2){                                                                                             /* two cards go in, one comes out */
    const u = csSm(11.2, 13.2, t), out = csSm(13.2, 14.6, t);
    for (const sx of [-1, 1]){ const cx = csLerp(800 + sx * 330, 800 + sx * 105, u), cy = csLerp(380, 470, u) - 40 * Math.sin(u * Math.PI), a = 1 - csSm(13, 13.4, t); if (a > 0){ ctx.save(); ctx.translate(cx, cy); ctx.rotate(sx * (1 - u) * 0.3); ctx.globalAlpha = a; ctx.fillStyle = sx < 0 ? '#C98A3C' : '#7E9B4E'; ctx.fillRect(-26, -38, 52, 76); ctx.strokeStyle = '#EFE6D4'; ctx.lineWidth = 3; ctx.strokeRect(-26, -38, 52, 76); ctx.restore(); } }
    if (out > 0){ ctx.save(); ctx.translate(800, csLerp(470, 330, out)); ctx.scale(0.8 + 0.5 * out, 0.8 + 0.5 * out); ctx.fillStyle = '#7FE8FF'; ctx.fillRect(-26, -38, 52, 76); ctx.strokeStyle = '#FFFFFF'; ctx.lineWidth = 3; ctx.strokeRect(-26, -38, 52, 76); csGlow(ctx, 0, 0, 80, '#7FE8FF', 0.6); fillCircle(ctx, 0, 0, 10, '#FFFFFF'); ctx.restore(); }
  }
}
const FUSION_CAPS = [[0.8, 'THE FUSION WORKSHOP', 'A quiet corner of the Underground City', 3.0], [4.4, 'CARD FUSION MACHINE', 'Built piece by piece from everything she has gathered', 4.2], [11.4, 'TWO CARDS IN', '', 2.0], [13.6, 'ONE COMES OUT', 'With everything both of them had', 2.4]];
MARS_FILMS.fusion = {
  end: FUSION_T.END, starts: [0, 2.6, 11.2, 0, 0, 0, 0, 0], scene: fusionScene,
  over(ctx, t){
    const v = ctx.createRadialGradient(640, 360, 300, 640, 360, 780); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,.4)'); ctx.fillStyle = v; ctx.fillRect(0, 0, CS_W, CS_H);
    marsFilmCaps(ctx, FUSION_CAPS, t, '#B880FF');
    const f = marsFilmFade([], FUSION_T.END, t); if (f > 0.005){ ctx.fillStyle = 'rgba(0,0,0,' + f + ')'; ctx.fillRect(0, 0, CS_W, CS_H); }
  },
  cues: [[2.8, () => SFX.click()], [4.0, () => SFX.click()], [5.4, () => SFX.click()], [6.8, () => SFX.click()], [8.2, () => SFX.click()], [9.6, () => SFX.click()], [11.2, () => SFX.whoosh()], [12.4, () => SFX.zap()], [13.4, () => SFX.transform()], [14.8, () => SFX.level()]]
};

