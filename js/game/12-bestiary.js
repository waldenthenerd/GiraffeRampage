'use strict';
/* Bestiary. */
/* ========================= BESTIARY ========================= */
/* A record of every creature (per chapter) and every card the
   player has come across. Creatures are logged on their first defeat,
   cards the first time one is taken; a card's later forms only reveal
   themselves once that level has actually been reached. Undiscovered
   creatures show as a dark silhouette of their real artwork -- a hint of
   the shape, but no name. */
const BESTIARY_ORDER = ['hyena', 'jackal', 'cheetah', 'warthog', 'rhino', 'baboon', 'honeybadger', 'vulture', 'mamba',
  'termite', 'grub', 'ember', 'lion', 'matriarch', 'buffalo', 'crocodile', 'wildfire',
  'thawed', 'iceheart'];                  /* Chapter 13.5's two bosses: added at the end (photo codes point into this list), and a chapter without them simply skips them */
const BESTIARY_CHAPTERS = ['Savanna', 'Frostreach', 'Murkfen', 'The Deep', 'The Canopy', 'Houston', 'Space Center', 'The Moon', 'Venus', 'The Inferno', 'The Changed Savannah', 'Area 51', 'Mars', 'The Domes', 'The Tower', 'The Siege', 'Fort Shortneck'];
const CH1_NAMES = {
  hyena: 'Spotted Hyena', jackal: 'Jackal', cheetah: 'Cheetah', warthog: 'Warthog', rhino: 'Rhino', baboon: 'Baboon',
  honeybadger: 'Honey Badger', vulture: 'Vulture', mamba: 'Black Mamba', termite: 'Termite', grub: 'Termite Grub',
  ember: 'Ember', lion: 'Lion', matriarch: 'Elephant', buffalo: 'Cape Buffalo', crocodile: 'Nile Crocodile', wildfire: 'Living Wildfire'
};
const LOOK_NAMES = {
  arcticwolf: 'Arctic Wolf', lynx: 'Lynx', muskox: 'Muskox', arctichare: 'Arctic Hare', leveret: 'Leveret', gyrfalcon: 'Gyrfalcon',
  arcticfox: 'Arctic Fox', caribou: 'Caribou', ermine: 'Ermine', wolverine: 'Wolverine', lemming: 'Lemming', owlet: 'Snowy Owlet',
  polarbear: 'Polar Bear', walrus: 'Walrus', moose: 'Moose', narwhal: 'Narwhal', snowyowl: 'Snowy Owl',
  nutria: 'Nutria', bobcat: 'Bobcat', feralhog: 'Feral Hog', bullfrog: 'Bullfrog', tadpole: 'Tadpole', heron: 'Great Blue Heron',
  otter: 'River Otter', beaver: 'Beaver', raccoon: 'Raccoon', opossum: 'Opossum', cottonmouth: 'Cottonmouth', mosquito: 'Mosquito',
  panther: 'Florida Panther', blackbear: 'Black Bear', snapper: 'Alligator Snapping Turtle', alligator: 'American Alligator', mosquitoqueen: 'Giant Mosquito',
  barracuda: 'Barracuda', sailfish: 'Sailfish', hammerhead: 'Hammerhead Shark', jellyfish: 'Jellyfish', jellylet: 'Baby Jellyfish', pelican: 'Pelican',
  dolphin: 'Dolphin', swordfish: 'Swordfish', octopus: 'Octopus', crab: 'King Crab', seasnake: 'Sea Krait', lanternfish: 'Lanternfish',
  greatwhite: 'Great White Shark', whale: 'Humpback Whale', orca: 'Orca', giantsquid: 'Giant Squid', anglerfish: 'Anglerfish',
  peccary: 'White-lipped Peccary', jaguar: 'Jaguar', tapir: 'Tapir', leafcutter: 'Leafcutter Ant', ant: 'Worker Ant', harpy: 'Harpy Eagle',
  ocelot: 'Ocelot', capybara: 'Capybara', howler: 'Howler Monkey', anteater: 'Giant Anteater', dartfrog: 'Poison Dart Frog', froglet: 'Golden Froglet',
  shadowjag: 'Black Jaguar', harpyqueen: 'Harpy Eagle', armadillo: 'Giant Armadillo', anaconda: 'Green Anaconda', venomqueen: 'Golden Poison Frog',
  streetdog: 'Stray Dog', coyote: 'Urban Coyote', alleycat: 'Alley Cat', ninebanded: 'Nine-banded Armadillo', lighttank: 'Light Tank',
  grackle: 'Great-tailed Grackle', k9: 'K9 Unit', helicopter: 'Helicopter', rat: 'Sewer Rat', pigeonflock: 'Pigeon Flock', pigeon: 'Pigeon',
  drone: 'Military Drone', rottweiler: 'Rottweiler', gunship: 'Attack Gunship', abrams: 'M1 Abrams Tank', sewergator: 'Alligator', a10: 'A-10 Warthog',
  quadbot: 'Quadruped Robot', scoutrover: 'Scout Rover', hoverbike: 'Hover Bike Drone', crawlerbot: 'Assault Crawler', hovertank: 'Hover Tank',
  quadcopter: 'Quadcopter', sentrywalker: 'Sentry Walker', reaperdrone: 'Reaper Drone', snakebot: 'Serpent Robot', swarmcarrier: 'Swarm Carrier',
  microdrone: 'Micro Drone', plasmaorb: 'Plasma Drone', titanmech: 'Assault Mech', stealthbomber: 'Stealth Bomber', railgunner: 'Railgun Tank',
  siegewalker: 'Siege Walker', skyfortress: 'Flying Fortress',
  rifleman: 'Marine Rifleman', jumptrooper: 'Jump Trooper', riottrooper: 'Riot Trooper', droppod: 'Drop Pod', attackdrone: 'Attack Drone', marksman: 'Marksman',
  grenadier: 'Grenadier', engineer: 'Combat Engineer', medic: 'Field Medic', heavygunner: 'Heavy Gunner', shadowop: 'Shadow Operative', breacher: 'Breacher',
  sergeant: 'Drill Sergeant', spotter: 'Orbital Spotter', colossus: 'Colossus Exosuit', warden: 'Gravity Warden', admiral: 'Fleet Admiral',
  shocktrooper: 'Shock Trooper', lancer: 'Vanguard Lancer', siegebreaker: 'Siege Breaker', cinderbrawler: 'Cinder Brawler', spearfiend: 'Spear Fiend',
  cinderimp: 'Cinder Imp', magmahopper: 'Magma Hopper', slagram: 'Slag Ram', magmacocoon: 'Magma Cocoon', cindergnat: 'Cinder Gnat', spikecharger: 'Spike Charger',
  bladewhirl: 'Blade Whirl', slagslinger: 'Slag Slinger', sootshaman: 'Soot Shaman', magmamaw: 'Magma Maw', smokeserpent: 'Smoke Serpent', blastbeetle: 'Blast Beetle', infernoblade: 'Inferno Blade',
  tyrant: 'Magma Tyrant', magmamother: 'Mother Magma', rampager: 'Obsidian Rampager', leviathan: 'Lava Leviathan', sovereign: 'Inferno Sovereign',
  glim_hyena: 'Packhowl Hyena', glim_cheetah: 'Afterimage Cheetah', glim_rhino: 'Quake Rhino', glim_termite: 'Mound Termite', glim_grub: 'Glow Grub', glim_vulture: 'Gale Vulture',
  glim_jackal: 'Shadow Jackal', glim_warthog: 'Tusk Warthog', glim_baboon: 'Boulder Baboon', glim_honeybadger: 'Rage Badger', glim_mamba: 'Venom Mamba', glim_ember: 'Wisp Ember',
  glim_lion: 'Glimmer Lion', glim_matriarch: 'Glimmer Elephant', glim_buffalo: 'Glimmer Buffalo', glim_crocodile: 'Glimmer Crocodile', glim_wildfire: 'Glimmer Wildfire',
  a51_guard: 'Security Guard', a51_jumper: 'Jetpack Trooper', a51_riot: 'Riot Guard', a51_pod: 'Airdrop Pod', a51_drone: 'Security Drone', a51_lancer: 'Stun Lancer',
  a51_shock: 'Taser Trooper', a51_engineer: 'Base Engineer', a51_medic: 'Base Medic', a51_sledge: 'Sledge Trooper', a51_ghost: 'Black Ops Agent', a51_demo: 'Demolitions Soldier',
  a51_colonel: 'Security Colonel', a51_major: 'Air Controller', a51_walker: 'Prototype Exosuit', a51_warden: 'Gravity Prototype', a51_general: 'Base General',
  a51_blade: 'Knife Trooper', a51_turret: 'Sentry Gun',
  dust_scuttler: 'Dust Scuttler', dust_skink: 'Sand Skink', dust_strider: 'Dune Strider', dust_beetle: 'Bulwark Beetle', dust_crusher: 'Rock Crusher', dust_leaper: 'Sand Leaper',
  dust_raker: 'Rust Raker', dust_devil: 'Dust Devil', dust_worm: 'Dune Worm', dust_brood: 'Brood Mother', dust_mite: 'Dust Mite', dust_spore: 'Spore Puff',
  dust_alpha: 'Dune Alpha', dust_matron: 'Hive Matron', dust_titan: 'Dust Titan', mars_warden: 'Gravity Warden', mars_admiral: 'Fleet Marshal',
  cinderspitter: 'Cinder Spitter', flareleaper: 'Flare Leaper', obsidianbrute: 'Obsidian Brute', magmaegg: 'Magma Egg', firewisp: 'Fire Wisp', ashseer: 'Ash Seer',
  magmalobber: 'Magma Lobber', forgetender: 'Forge-Tender', emberpriest: 'Ember Priest', pyrecrusher: 'Pyre Crusher', smokewraith: 'Smoke Wraith', sporeimp: 'Spore Imp',
  dome_thawed: 'Polar Bear, half melted', dome_iceheart: 'Crystal Colossus',
  pyrax: 'Fire Warlord', pyreseer: 'Fire Seer', magmacolossus: 'Magma Colossus', maelstrom: 'Living Maelstrom', infernoqueen: 'Inferno Queen'
};
let BESTIARY_TOTAL_CREATURES = 17 * 13;                       /* worked out again, exactly, once every chapter's table exists (js/chapters/30a-chapter-domes.js) */
function bestiaryTable(ch){ return [ETYPES, ETYPES_FROST, ETYPES_SWAMP, ETYPES_OCEAN, ETYPES_JUNGLE, ETYPES_CITY, ETYPES_SPACE, ETYPES_MARINE, ETYPES_VENUS, ETYPES_INFERNO, ETYPES_GLIM, ETYPES_A51, ETYPES_MARS_BEST, ETYPES_DOME, typeof ETYPES_TOWER === 'undefined' ? {} : ETYPES_TOWER, typeof ETYPES_SIEGE === 'undefined' ? {} : ETYPES_SIEGE, typeof ETYPES_FORT === 'undefined' ? {} : ETYPES_FORT][ch - 1]; }
function bestiaryName(ch, type){
  const def = bestiaryTable(ch)[type];
  const species = ch === 1 ? CH1_NAMES[type] : ch === DOME_CHAPTER && !def.big ? 'Changed ' + (LOOK_NAMES[def.look] || type) : (LOOK_NAMES[def.look] || type);
  return def.big && def.title ? { title: def.title, species: species } : { title: species, species: null };
}
function bestiaryData(){
  if (!Save.data.bestiary || typeof Save.data.bestiary !== 'object') Save.data.bestiary = { creatures: {}, cards: {} };
  if (!Save.data.bestiary.creatures) Save.data.bestiary.creatures = {};
  if (!Save.data.bestiary.cards) Save.data.bestiary.cards = {};
  return Save.data.bestiary;
}
function bestiaryCounts(){
  const b = bestiaryData();
  let creatures = 0;
  for (let ch = 1; ch <= BESTIARY_CHAPTERS.length; ch++) for (let i = 0; i < BESTIARY_ORDER.length; i++) if (b.creatures[ch + ':' + BESTIARY_ORDER[i]]) creatures++;
  let cards = 0;
  for (let i = 0; i < CARDS.length; i++) if (b.cards[CARDS[i].id]) cards++;
  return { creatures: creatures, cards: cards, totalCreatures: BESTIARY_TOTAL_CREATURES, totalCards: CARDS.length };
}
/* several discoveries at once stack upward instead of printing over each other */
function bestiaryToastLift(){
  let n = 0;
  for (let i = 0; i < G.texts.length; i++) if (G.texts[i].txt.indexOf('New in Bestiary') === 0) n++;
  return n * 20;
}
function recordBestiaryKill(e){
  if (G.attract || !e || !e.type) return;
  const ch = chapterOf(e.waveRef || G.wave || 1);
  if (!bestiaryTable(ch)[e.type] || e.type === 'sword' || (e.def && e.def.marine && !e.def.alien && ch >= 9 && ch <= 10) || (ch === 13 && e.def && e.def.marine && !e.big)) return;     /* the Marines fighting alongside them are already in Chapter 8's page */
  const b = bestiaryData(), key = ch + ':' + e.type;
  const first = !b.creatures[key];
  b.creatures[key] = (b.creatures[key] | 0) + 1;
  if (first){
    addText(e.x, e.y - e.r - 16 - bestiaryToastLift(), 'New in Bestiary: ' + bestiaryName(ch, e.type).title, '#E8C24A', 15, true);
    Save.write();
  }
}
function recordBestiaryCard(inst){
  if (G.attract || !inst || !inst.def) return;
  const b = bestiaryData(), id = inst.def.id, prev = b.cards[id] | 0;
  if (inst.level <= prev) return;
  b.cards[id] = inst.level;
  if (!prev) addText(P.x, P.y - 64 - bestiaryToastLift(), 'New in Bestiary: ' + inst.def.forms[0].name, '#E8C24A', 15, true);
  Save.write();
}

let bestiaryTab = 'creatures';
function showBestiary(tab){
  if (tab) bestiaryTab = tab;
  G.state = 'bestiary'; G.attract = true;
  const n = bestiaryCounts();
  const content = bestiaryTab === 'cards' ? bestiaryCardsHTML() : bestiaryCreaturesHTML();
  setOverlay(
    '<div class="panel slab">' +
      '<h2 class="head">Bestiary</h2>' +
      '<p class="sub">Defeat a creature or take a card to record it here. ' +
        n.creatures + ' of ' + n.totalCreatures + ' creatures and ' + n.cards + ' of ' + n.totalCards + ' cards discovered.</p>' +
      '<div class="tabs">' +
        '<button class="tab' + (bestiaryTab === 'creatures' ? ' on' : '') + '" data-a="bst-creatures">Creatures</button>' +
        '<button class="tab' + (bestiaryTab === 'cards' ? ' on' : '') + '" data-a="bst-cards">Cards</button>' +
      '</div>' +
      content +
      '<div class="row stickyback" style="margin-top:20px"><button class="btn sm" data-a="menu">Back to menu</button></div>' +
    '</div>');
  if (bestiaryTab === 'creatures') paintBestiaryPortraits();
}
function bestiaryCreaturesHTML(){
  const b = bestiaryData();
  let out = '';
  for (let ch = 1; ch <= BESTIARY_CHAPTERS.length; ch++){
    const table = bestiaryTable(ch);
    let found = 0, cells = '', shown = 0;
    for (let i = 0; i < BESTIARY_ORDER.length; i++){
      const type = BESTIARY_ORDER[i], def = table[type]; if (!def) continue;
      shown++;
      const kills = b.creatures[ch + ':' + type] | 0, known = kills > 0;
      if (known) found++;
      if (!known) continue;                                                     /* an unseen creature is not drawn at all: a strip below counts them, so a fresh page is short and shows nothing of what is coming */
      const nm = bestiaryName(ch, type);
      cells +=
        '<div class="bst-entry' + (def.big ? ' boss' : '') + '">' +
          '<canvas class="bst-pic" width="160" height="160" data-bch="' + ch + '" data-btype="' + type + '" data-bknown="1"></canvas>' +
          '<div class="bst-name">' + nm.title + '</div>' +
          '<div class="bst-sub">' + (nm.species ? nm.species + ' \u00b7 ' : '') + (def.big ? 'Boss \u00b7 ' : '') + 'Defeated ' + fmt(kills) + '</div>' +
        '</div>';
    }
    if (!found){                                                               /* a chapter with nothing found is one line, so a fresh page does not run on for sixteen empty blocks */
      out += '<div class="bst-none"><b>Chapter ' + chapterLabel(ch) + ' \u2014 ' + BESTIARY_CHAPTERS[ch - 1] + '</b><span>0 / ' + shown + '</span></div>';
      continue;
    }
    if (shown > found) cells += '<div class="bst-more">' + (shown - found) + ' undiscovered</div>';
    out += '<h3 class="gh">Chapter ' + chapterLabel(ch) + ' \u2014 ' + BESTIARY_CHAPTERS[ch - 1] +
      '<small style="font-weight:400;color:var(--dust);font-size:12px"> \u2014 ' + found + ' / ' + shown + '</small></h3>' +
      '<div class="bst-grid">' + cells + '</div>';
  }
  return out;
}
function bestiaryCardsHTML(){
  const b = bestiaryData();
  let cells = '', unseen = 0;
  for (let i = 0; i < CARDS.length; i++){
    const def = CARDS[i], best = b.cards[def.id] | 0, known = best > 0;
    if (!known){ unseen++; continue; }                                        /* cards not yet taken are only counted, in one strip at the end */
    let forms = '';
    if (known){
      for (let k = 0; k < def.forms.length; k++){
        const f = def.forms[k], seen = best >= f.lv;
        forms += '<div class="bst-form' + (seen ? '' : ' unknown') + '">' +
          (seen ? '<b>' + ico(f.icon, f.color) + ' ' + f.name + '</b> <span class="bst-lv">Lv ' + f.lv + '</span><div>' + f.desc + '</div>'
                : '<b>???</b> <span class="bst-lv">Reach level ' + f.lv + ' to reveal</span>') +
        '</div>';
      }
    }
    cells +=
      '<div class="bst-card' + (known ? '' : ' unknown') + '">' +
        '<div class="bst-cardhead"><span class="bst-cardicon">' + (known ? ico(def.forms[0].icon) : '?') + '</span>' +
          '<div><div class="bst-name" style="text-align:left">' + (known ? def.forms[0].name : '???') + '</div>' +
          '<div class="bst-sub" style="text-align:left">' + (known
            ? def.rarity.charAt(0).toUpperCase() + def.rarity.slice(1) + ' ' + def.type + ' \u00b7 best level ' + best
            : 'Undiscovered \u2014 take this card in a run to record it') + '</div></div></div>' +
        forms +
      '</div>';
  }
  if (unseen) cells += '<div class="bst-more">' + unseen + ' undiscovered' + (unseen === CARDS.length ? ' \u2014 take a card in a run to record it' : '') + '</div>';
  return '<div class="bst-cards">' + cells + '</div>';
}
/* Each portrait is the creature's real in-game drawing, facing right,
   scaled to fit its box. Undiscovered ones are then filled in solid dark. */
function paintBestiaryPortraits(){
  const cvs = document.querySelectorAll('canvas[data-btype]');
  const keep = G.particles.length;   /* some creatures shed ambient particles when drawn; don't leak them into the scene */
  for (let i = 0; i < cvs.length; i++){
    const cv = cvs[i];
    const def = bestiaryTable(+cv.getAttribute('data-bch'))[cv.getAttribute('data-btype')];
    paintBestiaryPortrait(cv, def, cv.getAttribute('data-btype'), cv.getAttribute('data-bknown') === '1');
  }
  if (G.particles.length > keep) G.particles.length = keep;
}
let BST_ANIM = null;      /* set by the hover animation in 44d-visual-extras.js: the creature's animation clock while it moves */
function paintBestiaryPortrait(cv, def, type, known){
  const c = cv.getContext && cv.getContext('2d');
  if (!c || !def) return;
  const W = cv.width, H = cv.height;
  c.setTransform(1, 0, 0, 1, 0, 0);
  c.clearRect(0, 0, W, H);
  const sc = Math.min(3.2, (W * 0.46) / (def.r * 2.1));
  c.save(); c.translate(W / 2, H / 2); c.scale(sc, sc);
  const e = { portrait: true, def: def, type: type, x: 0, y: 0, r: def.r, ang: 0, flash: 0, state: 'idle', anim: BST_ANIM === null ? 1.2 : BST_ANIM,
    hp: 1, maxHp: 1, big: def.big, kx: 0, ky: 0, stunT: 0, burnT: 0, slowT: 0, slowMul: 1 };
  try { drawEnemy(c, e); } catch (err) {}
  c.restore();
  if (!known){
    c.save(); c.setTransform(1, 0, 0, 1, 0, 0);
    c.globalCompositeOperation = 'source-atop';
    c.fillStyle = '#241A12'; c.fillRect(0, 0, W, H);
    c.restore();
  }
}

