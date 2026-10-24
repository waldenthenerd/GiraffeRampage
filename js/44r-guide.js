'use strict';
/* The guide: replaces the old How to Play page. */
/* ========================= 44r. THE GUIDE ========================= */
/* A list of topics, each a fold-out section. A topic only exists once what it explains has been unlocked in this save (GUIDE_TOPICS,
   each with a show() test), so reading the guide never gives away something she has not found yet. Nothing here refers to a locked
   feature, not even as a hint. To document a new feature, add a topic with the same test the game uses to unlock it.
   showHelp() (from 41-qol.js) is replaced, so every place that opens "How to play" opens this. The quick settings of the old page are kept at the end. */
function guideKey(a){ return '<b>' + keyName(keyOf(a)) + '</b>'; }
function guideDone(ch){ return !!(Save.data && Save.data['chapter' + ch + 'Complete']); }
function guideAnts(){ return !!(Save.data && Save.data.antsUnlocked); }
function guideFilms(){ try { return filmList().some(function(f){ return f.un; }); } catch (e) { return false; } }
function guideTrinket(id){ try { return trinketOwned(id); } catch (e) { return false; } }

const GUIDE_TOPICS = [
  { id: 'basics', title: 'The basics', show: function(){ return true; }, html: function(){
    const t = Input.hasTouch;
    return '<p>Survive the waves. You are a giraffe with a very long neck, and everything in the wild wants to stop you.</p><ul class="helplist">' +
      (t ? '<li><b>Move</b> with the joystick that appears wherever you touch the left side of the screen.</li>'
         : '<li><b>Move</b> with ' + guideKey('up') + guideKey('left') + guideKey('down') + guideKey('right') + ' or the arrow keys. Keys can be changed in Settings.</li>') +
      (t ? '<li><b>Kick</b> the nearest threat automatically: leave auto-kick on, or tap the KICK button yourself.</li>'
         : '<li><b>Kick</b> toward your cursor. Hold the mouse button, or leave auto-kick on and it fires itself.</li>') +
      (t ? '<li><b>Pick a card</b> by tapping it.</li>' : '<li><b>Pick a card</b> with the mouse or keys 1, 2 and 3. Press ' + guideKey('reroll') + ' to reroll.</li>') +
      (t ? '<li><b>Pause</b> with the button in the top-right corner.</li>'
         : '<li><b>Pause</b> with Escape or ' + guideKey('pause') + '. Mute with ' + guideKey('mute') + '. See the stats with ' + guideKey('stats') + '.</li>') +
      '<li>Your health is the bar at the top. Hearts that drop from enemies heal you.</li></ul>';
  } },
  { id: 'runs', title: 'Runs, waves and chapters', show: function(){ return true; }, html: function(){
    return '<p>A <b>run</b> is one attempt. Enemies come in waves, and every chapter is ' + WAVES_PER_CHAPTER + ' waves long. Every fifth wave is a boss. Clear a chapter and the next one opens.</p>' +
      '<ul class="helplist">' +
      '<li>The window in the middle of the menu picks the chapter. Chapter 1 starts at wave one. Starting a later chapter you have opened goes straight to its first wave, with no cards to begin with.</li>' +
      '<li>When you fall, 0.2% of your score is banked as gold. Spend it at the trading post. A run can be as short or as long as you like: the score is what you take with you.</li>' +
      '<li>If a run was left part-way through, the top of the main menu shows <b>Continue your run</b>.</li>' +
      '<li>When everything in a wave has arrived and only a few enemies are left, <b>Call the next wave</b> (the button, or ' + guideKey('nextwave') + ') ends the wave now. The ones left follow into the next wave, and the wave pays its smaller \u201Csurvived\u201D reward. It is not offered during a boss or on a chapter\u2019s last wave.</li>' +
      '<li>The Second Wind upgrade lets you get back up at 30% health, a limited number of times per run.</li></ul>';
  } },
  { id: 'cards', title: 'Cards and levelling up', show: function(){ return true; }, html: function(){
    return '<p>Enemies drop experience. Every level gives you a choice of <b>three cards</b>, and each card is a weapon or an ability.</p><ul class="helplist">' +
      '<li>Take a card you already have and it <b>levels up</b>. At level 5 it becomes something else entirely, and at level 10 it becomes something worse for everyone near you. The diamonds on a card mark those levels.</li>' +
      '<li>You can hold ' + maxCards() + ' cards at once. Once your slots are full you can still take cards you already own.</li>' +
      '<li><b>Reroll</b> swaps the three offered cards. You start each run with ' + (2 + metaLevel('luckypaws')) + ' rerolls, and they can be raised in the upgrades.</li>' +
      '<li>Cards come in four rarities: common, rare, epic and legendary. The rarer ones are stronger, and appear less often.</li>' +
      '<li>Every card you take is recorded in the Bestiary.</li></ul>';
  } },
  { id: 'pickups', title: 'Drops', show: function(){ return true; }, html: function(){
    return '<ul class="helplist"><li><b>Hearts</b> heal you.</li><li><b>Gold</b> adds to what you bank at the end of the run.</li>' +
      '<li><b>Gems</b> are kept after the run. They buy gear crates at the trading post.</li>' +
      '<li>Walk over them to pick them up. The Savanna Magnet upgrade, and some gear, makes pickups come to you from further away.</li></ul>';
  } },
  { id: 'post', title: 'The trading post', show: function(){ return true; }, html: function(){
    let h = '<p>Everything you earn is spent here, between runs.</p><ul class="helplist">' +
      '<li><b>Upgrades</b> are permanent and paid for with gold. They apply to every run from then on. Some have several levels, and you can buy as many as you can afford.</li>' +
      '<li><b>Gear</b> is paid for with gems. Open a crate to find a piece of gear. Wear all three pieces of one set to get the set bonus. <b>Trinkets</b> can all be worn at once.</li>' +
      '<li><b>Wheel:</b> reach ' + WHEEL_SCORE_THRESHOLD.toLocaleString('en-US') + ' points in a single run to earn a key (at most one every 30 minutes). Spend it on the prize wheel for gold, gems or a rare trinket. A score of ' + SPOTTED_KEY_SCORE.toLocaleString('en-US') + ' in a run earns a <b>Spotted key</b> as well (and the ordinary key too, if its 30-minute wait is over), for the Spotted wheel: far better prizes, and a trinket found nowhere else. With several keys you can spin 5 or 10 at once.</li>';
    if (guideAnts()) h += '<li><b>Ants</b> are hired with food. See the ant colony below.</li>';
    if (cityUnlocked()) h += '<li><b>City</b> is the market of the underground giraffe city. See below.</li>';
    return h + '</ul>';
  } },
  { id: 'gear', title: 'Gear levels and crates', show: function(){ return true; }, html: function(){
    const pity = function(k){ const p = CRATE_PITY[k]; return p ? p.floor + ' or better is guaranteed within every ' + p.every + ' opens' : 'there is no guarantee: its odds are the point'; };
    const myth = function(k){ return CRATES[k].weights.mythical + '%'; };
    const fx = Object.keys(GEAR_FX).map(function(k){ return GEAR_FX[k].name; });
    return '<p>Gear comes from crates, bought with gems at the trading post. Open one, or five or ten at a time.</p><ul class="helplist">' +
      '<li>The <b>' + CRATES.normal.name + '</b> costs ' + CRATES.normal.cost + ' gems (' + pity('normal') + '; mythical ' + myth('normal') + '). The <b>' + CRATES.rare.name + '</b> costs ' + CRATES.rare.cost + ' gems (' + pity('rare') + '; mythical ' + myth('rare') + ').</li>' +
      '<li>The <b>' + CRATES.spotted.name + '</b> costs ' + CRATES.spotted.cost + ' gems <i>and</i> ' + CRATES.spotted.food + ' food, and ' + pity('spotted') + ' (mythical ' + myth('spotted') + '). Food comes from foraging.</li>' +
      '<li><b>Duplicates level a piece up.</b> Opening a piece you already own raises it one level, up to level ' + GEAR_LV_MAX + '. Each level makes the piece\u2019s own bonuses ' + Math.round(GEAR_LV_MUL * 100) + '% stronger (a weapon\u2019s damage ' + Math.round(GEAR_WEAPON_LV_DMG * 100) + '%). A duplicate of a piece already at the top level gives some gems back.</li>' +
      '<li>Wear all three pieces of one set (cape, weapon, armour) for the set bonus. <b>Trinkets</b> are separate, and all of them can be worn at once.</li>' +
      '<li>Some pieces also have a <b>playstyle effect</b> (' + fx.length + ' in all: ' + fx.join(', ') + ') that changes how you play, not just the numbers. It is shown on the piece, marked with a star.</li></ul>';
  } },
  { id: 'speed', title: 'Speed mode', show: function(){ return true; }, html: function(){
    return '<p>The slider beside Start on the main menu makes time run faster for the whole run. It is fixed once a run starts.</p><ul class="helplist">' +
      '<li><b>Speed</b> runs at ' + SPEED_MODE_MUL + '×: you, enemies and ants all move faster and waves are shorter, with the same number of enemies.</li>' +
      '<li><b>Hyperspeed</b> runs at ' + HYPER_MODE_MUL + '×, and each wave’s enemies arrive much closer together.</li>' +
      '<li><b>Ultrafast</b> runs at ' + ULTRA_MODE_MUL + '×, enemies far off screen hurry in at 4×, and each wave comes in just 2 to 5 short bursts.</li>' +
      '<li>There are no bonus rewards for speed. It is only a different way to play.</li></ul>';
  } },
  { id: 'bestiary', title: 'The Bestiary', show: function(){ return true; }, html: function(){
    const c = bestiaryCounts();
    return '<p>Defeat a creature or take a card to record it. You have found ' + c.creatures + ' of ' + c.totalCreatures + ' creatures and ' + c.cards + ' of ' + c.totalCards + ' cards.</p>' +
      '<ul class="helplist"><li>Undiscovered creatures show as dark shapes. A card’s later forms are only shown once you have reached them.</li>' +
      '<li>Creatures you have discovered can be placed in your photos.</li></ul>';
  } },
  { id: 'forage', title: 'Foraging', show: function(){ return true; }, html: function(){
    return '<p>A short break from the wild: stretch her neck toward the cursor (or your finger) to catch the leaves falling from an acacia tree. ' +
      'One round is ' + FORAGE_LEAVES + ' leaves, and every leaf is a unit of food.</p><ul class="helplist">' +
      '<li>Once you start a round, foraging has a 15 minute wait before you can go again, and it is not refunded if you stop early.</li>' +
      (guideAnts() ? '<li>Food is what hires ants at the trading post, and the city sells things for it too.</li>' : '<li>Food is kept for later.</li>') + '</ul>';
  } },
  { id: 'chapters', title: 'The chapters you have opened', show: function(){ return true; }, html: function(){
    let h = '<ul class="helplist">';
    for (let ch = 1; ch <= TOTAL_CHAPTERS; ch++){
      if (!chapterUnlocked(ch)) continue;
      const i = CHAPTER_INFO[ch - 1];
      h += '<li><b>Chapter ' + ch + ': ' + i.name + '.</b> ' + i.desc + (guideDone(ch) ? ' <span class="gtag">cleared</span>' : '') + '</li>';
    }
    return h + '</ul>';
  } },
  { id: 'minis', title: 'Minigames', show: function(){ return true; }, html: function(){
    return '<p>When you finish a chapter, a popup offers a minigame before the next chapter starts. They are also on the main menu once you have opened them.</p><ul class="helplist">' +
      '<li>Each one is a short challenge with a goal. Win it for one star, and reach the two harder targets for the second and third.</li>' +
      '<li>Every minigame you finish spins the <b>wheel</b>: 65% a hat, 30% boots, 5% a rare hat. More stars make the rare hats likelier, and from two stars a duplicate is rolled again. A duplicate pays gems.</li>' +
      '<li>Your best score is kept whether you win or lose, and the first time you reach each star pays gems.</li>' +
      '<li>Three stars in a minigame unlocks its own coat color.</li>' +
      '<li>There is one play every two minutes, shared by all of them.</li>' +
      '<li>The <b>Collection</b> shows every hat and boot, and what you have found.</li></ul>';
  } },
  { id: 'wardrobe', title: 'Coat colors, outfits and photos', show: function(){ return true; }, html: function(){
    return '<ul class="helplist">' +
      '<li>Every chapter you finish gives a coat color and a spot pattern. Skin, spots, pattern and gear accent are chosen separately.</li>' +
      '<li>Hats and boots won in the minigames can be worn, and recoloured with any color you have unlocked.</li>' +
      '<li>Up to six <b>outfits</b> can be saved and worn again.</li>' +
      '<li>The <b>Photo</b> button takes pictures: pick a scene and a pose, then add effects and creatures you have discovered, and drag them where you want them. Up to 48 photos can be kept in the album, and any photo can be shared as a code that a friend can open and edit. Creatures a friend has not discovered yet are left out of a shared photo, but her colors, hat and boots stay.</li></ul>';
  } },
  { id: 'films', title: 'Films', show: guideFilms, html: function(){
    return '<p>Story scenes you have seen are kept in the Films list on the main menu, and can be replayed there at any time.</p>';
  } },
  { id: 'slow', title: 'Slowing time', show: function(){ return guideTrinket('peacefullune'); }, html: function(){
    return '<p>The Peaceful Lune trinket slows time for 8 seconds when you press ' + guideKey('slow') + ' during a run. It then needs 30 seconds before it can be used again.</p>';
  } },
  { id: 'ants', title: 'The ant colony', show: guideAnts, html: function(){
    return '<p>An anthill now sits at the center of the arena in every run, and the ants you hire fight beside you.</p><ul class="helplist">' +
      '<li>Hire ants at the trading post with food. There are three kinds: the <b>Soldier</b> charges and bites, the <b>Distractor</b> draws enemies off you and bursts when it falls, and the <b>Shooter</b> spits acid from a distance.</li>' +
      '<li>Hired ants are permanent. Each kind returns from the anthill 15 seconds after it falls, as long as fewer are out than you own.</li>' +
      '<li>Food comes from foraging, and can also be made from gold and gems at the trading post.</li>' +
      '<li>Ants grow stronger as the waves go on, and upgrades make them tougher and bigger in number.</li>' +
      (typeof engineersUnlocked === 'function' && engineersUnlocked() ? '<li>The <b>Engineer</b> is different: it drives about in a rover, keeps well away from enemies, and stops to <b>build turrets</b> that shoot anything near them. Half as many fit in the hill. If an enemy gets close it drops the job and runs, leaving a half-built turret that is very weak until an engineer comes back to finish it, so protect them while they work. There is no limit to the number of turrets, but enemies will go for them.</li>' : '') + '</ul>';
  } },
  { id: 'venus', title: 'The Venus outpost and scouting', show: function(){ return venusUnlocked(); }, html: function(){
    let h = '<p>The wreck of the pod is now a base. It has two new materials, <b>sulfur</b> and <b>basalt</b>, and you cannot find gems here, so everything the outpost sells is paid for in them.</p>' +
      '<h4>Scouting</h4><ul class="helplist">' +
      '<li>Press <b>Scout for Resources</b>. A trip lasts 2½ minutes. Walk out onto the burning plain and pick up sulfur and basalt, or <b>kick rubble open</b> for more. There are six kinds of rubble, and the rarer ones further from the pod hold the most.</li>' +
      '<li><b>Heat</b> builds whenever you are away from the pod, and faster over lava. At full heat you start losing health.</li>' +
      '<li>The pod cools you down and <b>banks what you carry</b>. Anything you are still carrying when the trip ends is lost, so go back often.</li>' +
      '<li>Every now and then a lone Space Marine comes looking for you, and very rarely something much bigger.</li></ul>' +
      '<h4>The workshop</h4><ul class="helplist">' +
      '<li><b>Habitat:</b> a room, then a bigger one, then a dome. Each makes heat build slower, and you can see them grow.</li>' +
      '<li><b>Ant colony:</b> rooms for more ants and tougher ants' + (guideAnts() ? '.' : ', once you have ants.') + '</li>' +
      '<li><b>Forge:</b> trinkets made from what you bring back. Equip them from the Gear tab at the trading post.</li>' +
      '<li><b>Makeshift Rover:</b> press ' + guideKey('rover') + ' (or tap ROVER) to climb aboard. It is faster and builds no heat on Venus, and in every chapter it carries you faster, pulls pickups in and soaks up hits until it is destroyed.</li>' +
      '<li><b>Deflector Module:</b> each level starts every chapter with a level of the Deflector Pulse card already in your hand.</li></ul>';
    return h;
  } },
  { id: 'ship', title: 'The spaceplane', show: function(){ return typeof shipUnlocked === 'function' && venusUnlocked() && shipUnlocked(); }, html: function(){
    return '<p>With the engine part you found, a way home is possible. At the Venus outpost you can build a spaceplane in four stages: the hull frame, the wings and heat tiles, the engine core, and fuel and cockpit.</p>' +
      '<ul class="helplist"><li>Each stage is paid for in sulfur, basalt, gems and gold. Sulfur and basalt are the scarce ones, and stages are built in order.</li>' +
      '<li>When the last stage is finished, she can fly home.</li></ul>';
  } },
  { id: 'city', title: 'The underground giraffe city', show: function(){ return cityUnlocked(); }, html: function(){
    return '<p>Now that she has flown home, a new tab at the trading post opens the market of the underground city.</p><ul class="helplist">' +
      '<li><b>Grubs</b> are a new currency that drops from enemies. Spend them in the Ant Academy' + (guideAnts() ? ' to make your ants tougher, faster and more numerous, and to give them special abilities.' : '.') + '</li>' +
      '<li>The <b>Cavern Market</b> sells permanent stat upgrades for every other currency you have collected.</li>' +
      '<li>It also sells <b>trinkets</b>, and the <b>Deep Library</b> adds a new card to the ones you can be offered.</li>' +
      '<li>The <b>Fusion Workshop</b> sells the Card Fusion Machine, the biggest purchase in the city.</li>' +
      '<li>Chapter 11 opens once she is home.</li></ul>';
  } },
  { id: 'fusion', title: 'The Card Fusion Machine', show: function(){ return cityLevel('c_fusion') > 0; }, html: function(){
    return '<p>Pick two cards of the same rarity and pay once to unlock their combo. The Starfall Horn pairs with any card.</p><ul class="helplist">' +
      '<li>In a run, once you hold both cards at level 10, the combo can be offered when you level up.</li>' +
      '<li>Taking it hides the two cards (they keep every effect they had), adds an ability of its own with three levels, and frees a card slot.</li>' +
      '<li>The first combo is free. The machine is opened from the main menu.</li></ul>';
  } },
  { id: 'mars', title: 'The Mars outpost and scouting', show: function(){ return marsUnlocked(); }, html: function(){
    return '<p>The SP-1 sits on the red plain where it landed. Mars adds <b>iron</b> to the materials, and a fourth, <b>argon</b>, that needs a machine to collect.</p>' +
      '<h4>Scouting</h4><ul class="helplist">' +
      '<li>Press <b>Scout Mars</b>. A trip lasts 2½ minutes. Bring back iron, sulfur and basalt: pick them up, or kick rubble open.</li>' +
      '<li>The <b>cold</b> builds whenever you are away from the base, and faster inside dust storms. At full cold you start losing health.</li>' +
      '<li>The base warms you up and <b>banks what you carry</b>. Anything still carried when the trip ends is lost.</li>' +
      '<li>Space Marines can turn up. They go for whichever is nearer, you or a wire.</li></ul>' +
      '<h4>The workshop</h4><ul class="helplist">' +
      '<li><b>Habitat:</b> a tent, a hab module and a biodome slow the cold and warm you faster.</li>' +
      '<li><b>Machines</b> work for you while you scout: an iron drill, a basalt sifter, a sulfur pump, a solar generator that speeds them up, and an argon condenser. Each hangs on a <b>wire</b> to the base. <b>Mars mice chew wires and Marines cut them</b>: watch for the red “!” marks, and walk over a broken wire to mend it. A broken wire stops its machine.</li>' +
      '<li>The <b>Atmospheric Collector</b> gathers argon as you walk, on scouting trips and in Chapter 13.</li>' +
      '<li><b>Mars Forge</b> trinkets, a better rover (Rover Mk II), and a new card (Dust Devils) are also built here.</li></ul>';
  } },
  { id: 'lab', title: 'The giraffe lab', show: function(){ return labUnlocked(); }, html: function(){
    return '<p>In the underground city there is a lab built around the Mutation Vial.</p><ul class="helplist">' +
      '<li><b>Each vial can be used once.</b> It changes her for good with one of fifteen mutations, picked at random, and you can never get the same one twice.</li>' +
      '<li>Mutations come in three tiers: Rare (60%), Epic (30%) and Legendary (10%), while any of that tier is left. The rarer the mutation, the stronger it is.</li>' +
      '<li>The first vial is the one she found. More vials are still out there.</li></ul>';
  } },
  { id: 'squad', title: 'The dust squad', show: function(){ return typeof squadAvailable === 'function' && squadAvailable(); }, html: function(){
    return '<p>With the dust aliens as allies, up to five can join her squad.</p><ul class="helplist">' +
      '<li>Hire them at the trading post (in the Ants tab) with iron, argon, sulfur and basalt. They live in rooms built into the anthill.</li>' +
      '<li>In a run, press keys ' + guideKey('squad1') + ' to ' + guideKey('squad5') + ' (or click the right-hand panel) to call one in. It fights the nearest enemy until it falls.</li>' +
      '<li>A fallen squad member needs 40 seconds before it can be called again. Each one has ten times her health, and her armour does not help it.</li></ul>';
  } }
];

function guideTopicsHTML(){
  let h = '', n = 0;
  GUIDE_TOPICS.forEach(function(t){
    let on = false;
    try { on = !!t.show(); } catch (e) { on = false; }
    if (!on) return;
    n++;
    h += '<details class="gtopic"' + (t.id === 'basics' ? ' open' : '') + ' data-topic="' + t.id + '"><summary>' + t.title + '</summary><div class="gbody">' + t.html() + '</div></details>';
  });
  return h;
}

showHelp = function(){
  G.state = 'help'; G.attract = true; G.subScreen = '';
  const s = Settings, touch = Input.hasTouch;
  const aimRow = touch ? '' :
    '<div class="kv"><div>Aim<small>Point the neck at the cursor, or let it lock onto the closest enemy.</small></div>' +
      '<button class="toggle' + (s.aimMode === 'cursor' ? ' on' : '') + '" data-a="t-aim">' + (s.aimMode === 'cursor' ? 'Cursor' : 'Nearest') + '</button></div>';
  setOverlay(
    '<div class="panel slab wide" style="max-width:720px">' +
      '<h2 class="head">Guide</h2>' +
      '<p class="sub">How the game works, as far as you have got. New topics appear here as you unlock new parts of the game.</p>' +
      '<div class="gtopics">' + guideTopicsHTML() + '</div>' +
      '<h3 class="gh" style="margin-top:22px">Quick settings</h3>' +
      '<div>' +
        '<div class="kv"><div>Auto-kick<small>Kick fires on cooldown without holding a button' + (touch ? '' : '. Kinder on a touchpad') + '.</small></div>' +
          '<button class="toggle' + (s.autoKick ? ' on' : '') + '" data-a="t-auto">' + (s.autoKick ? 'On' : 'Off') + '</button></div>' +
        aimRow +
        '<div class="kv"><div>Sound<small>Everything is synthesized in the browser.</small></div>' +
          '<button class="toggle' + (!s.muted ? ' on' : '') + '" data-a="t-mute">' + (s.muted ? 'Off' : 'On') + '</button></div>' +
        '<div class="kv"><div>Show gear on giraffe<small>Capes, armor and trinkets still work when hidden; this only affects how the giraffe looks.</small></div>' +
          '<button class="toggle' + (s.showGear ? ' on' : '') + '" data-a="t-gear">' + (s.showGear ? 'On' : 'Off') + '</button></div>' +
        musicRowHTML() +
        hitFlashRowHTML() +
      '</div>' +
      '<div class="row" style="margin-top:22px"><button class="btn sm" data-a="menu">Back to menu</button></div>' +
    '</div>');
  wireHitFlashSlider(); wireMusicSlider();
  /* the toggles above redraw this page; keep the folds the player had open */
  if (typeof showHelp._open === 'object' && showHelp._open){
    document.querySelectorAll('.gtopic').forEach(function(d){ d.open = !!showHelp._open[d.getAttribute('data-topic')]; });
  }
  document.querySelectorAll('.gtopic').forEach(function(d){
    d.addEventListener('toggle', function(){ (showHelp._open || (showHelp._open = {}))[d.getAttribute('data-topic')] = d.open; });
  });
};
