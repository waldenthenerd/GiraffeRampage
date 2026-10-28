'use strict';
/* DEVELOPER PANEL -- testing only. NOT part of the published game. */
/* ========================= DEV PANEL (js/45b-dev-panel.js) ========================= */
/* This whole file can be deleted (and its <script> tag removed from index.html) and the game runs exactly the same: nothing
   else depends on it. The hosted site has its own secure admin panel, so this file must NOT be shipped there. See
   LOVABLE-DO-NOT-INCLUDE-DEV-PANEL.md. Everything the panel does is in here: opening it (click the E in the title five
   times), the code prompt, the panel screen, every debug-* action, and unlockAllCombos(). */

/* ---- cheat: unlock every card combo ---- */
function unlockAllCombos(){
  if (!Save.data.combos) Save.data.combos = {};
  const ps = allComboPairs(); for (let i = 0; i < ps.length; i++) Save.data.combos[comboKeyOf(ps[i][0], ps[i][1])] = 1;
  Save.data.fusions = Math.max(1, Save.data.fusions | 0); Save.write(); return ps.length;
}

/* ---- hidden developer panel: click the E in the menu's own title five
   times -> code -> gold/gems/chapter/wave cheats ----
   Not meant to be secure (the code is fixed and this is client-side JS
   anyone can read); it exists purely so testing doesn't require grinding
   through the same early waves and gold every time. Tucked into a single
   letter of the title, rather than bound to a key, so it isn't something a
   player can trigger by accident while actually playing. */
let debugEClicks = 0, debugELastClick = 0;
function clickDebugE(){
  const t = G.time;
  if (t - debugELastClick > 2.5) debugEClicks = 0;
  debugELastClick = t;
  debugEClicks++;
  if (debugEClicks >= 5 && G.state !== 'debugcode' && G.state !== 'debugpanel'){
    debugEClicks = 0;
    showDebugCode();
  }
}
function showDebugCode(){
  if (G.state !== 'debugcode' && G.state !== 'debugpanel') G.debugPrev = G.state;
  G.state = 'debugcode';
  setOverlay(
    '<div class="panel slab" style="max-width:380px">' +
      '<h2 class="head">Developer Access</h2>' +
      '<p class="sub" id="debugCodeMsg">Enter the code.</p>' +
      '<input id="debugCodeInput" type="text" inputmode="numeric" autocomplete="off" spellcheck="false" ' +
        'style="width:100%;box-sizing:border-box;padding:12px;font-size:20px;text-align:center;' +
        'letter-spacing:.4em;background:var(--soil);border:1px solid var(--bark2);border-radius:4px;' +
        'color:var(--bone);margin:4px 0 14px" placeholder="\u2022\u2022\u2022\u2022" maxlength="8">' +
      '<div class="menucol" style="margin-top:0;width:100%">' +
        '<button class="btn" data-a="debug-submit">Unlock</button>' +
        '<button class="btn ghost" data-a="debug-cancel">Cancel</button>' +
      '</div>' +
    '</div>');
  const inp = document.getElementById('debugCodeInput');
  if (inp){
    inp.focus();
    inp.addEventListener('keydown', function(ev){
      ev.stopPropagation();
      if (ev.key === 'Enter') handleAction('debug-submit');
    });
  }
}
function submitDebugCode(){
  const inp = document.getElementById('debugCodeInput');
  const val = inp ? inp.value.trim() : '';
  if (val === '1391'){
    SFX.buy();
    showDebugPanel();
  } else {
    SFX.deny();
    const msg = document.getElementById('debugCodeMsg');
    if (msg) msg.textContent = 'Not it. Try again.';
    if (inp){ inp.value = ''; inp.focus(); }
  }
}
function showDebugPanel(){
  G.state = 'debugpanel';
  setOverlay(
    '<div class="panel slab" style="max-width:460px">' +
      '<h2 class="head">Developer Panel</h2>' +
      '<p class="sub">Gold: <b>' + fmt(Save.data.gold) + '</b> &nbsp; Gems: <b>' + fmt(Save.data.gems) + '</b></p>' +
      '<div class="kv"><div>Add gold<small>Adds to your banked total right away.</small></div>' +
        '<div style="display:flex;gap:8px;align-items:center">' +
        '<input id="debugGoldAmt" type="number" value="1000" min="0" step="100" ' +
          'style="width:90px;padding:7px;background:var(--soil);border:1px solid var(--bark2);' +
          'border-radius:4px;color:var(--bone);font-size:14px">' +
        '<button class="btn sm" data-a="debug-addgold">Add</button></div></div>' +
      '<div class="kv"><div>Add gems<small>Adds to your banked total right away.</small></div>' +
        '<div style="display:flex;gap:8px;align-items:center">' +
        '<input id="debugGemAmt" type="number" value="100" min="0" step="10" ' +
          'style="width:90px;padding:7px;background:var(--soil);border:1px solid var(--bark2);' +
          'border-radius:4px;color:var(--bone);font-size:14px">' +
        '<button class="btn sm" data-a="debug-addgems">Add</button></div></div>' +
      '<div class="menucol" style="margin-top:14px;width:100%">' +
        '<button class="btn" data-a="debug-dr-start">Dev Test Run<small>Chapter 1 with no enemies. Switch XP off, take any card or combo at any level, spawn any enemy, jump to any wave. Nothing is banked</small></button>' +
      '</div>' +
      '<div style="margin-top:18px">' +
        '<div class="ds" style="margin-bottom:8px">Jump straight into a chapter, skipping the normal unlock requirement:</div>' +
        '<div class="menucol" style="margin-top:0;width:100%">' +
          '<button class="btn ghost" data-a="debug-play1">Start Chapter 1 \u2014 Savanna</button>' +
          '<button class="btn ghost" data-a="debug-play2">Start Chapter 2 \u2014 Frostreach</button>' +
          '<button class="btn ghost" data-a="debug-play3">Start Chapter 3 \u2014 Murkfen</button>' +
          '<button class="btn ghost" data-a="debug-play4">Start Chapter 4 \u2014 The Deep</button>' +
          '<button class="btn ghost" data-a="debug-play5">Start Chapter 5 \u2014 The Canopy</button>' +
          '<button class="btn ghost" data-a="debug-play6">Start Chapter 6 \u2014 Houston</button>' +
          '<button class="btn ghost" data-a="debug-play7">Start Chapter 7 \u2014 Space Center</button>' +
          '<button class="btn ghost" data-a="debug-play8">Start Chapter 8 \u2014 The Moon</button>' +
          '<button class="btn ghost" data-a="debug-play9">Start Chapter 9 \u2014 Venus</button>' +
          '<button class="btn ghost" data-a="debug-play10">Start Chapter 10 \u2014 The Inferno</button>' +
          '<button class="btn ghost" data-a="debug-play11">Start Chapter 11 \u2014 The Changed Savannah</button>' +
          '<button class="btn ghost" data-a="debug-play12">Start Chapter 12 \u2014 Area 51</button>' +
          '<button class="btn ghost" data-a="debug-play13">Start Chapter 13 \u2014 Mars</button>' +
          '<button class="btn ghost" data-a="debug-play14">Start Chapter 13.5 \u2014 the Domes</button>' +
          '<button class="btn ghost" data-a="debug-play15">Start Chapter 14 \u2014 the Tower</button>' +
          '<button class="btn ghost" data-a="debug-play16">Start Chapter 15 \u2014 the Siege</button>' +
          '<button class="btn ghost" data-a="debug-cutscene-siegeflight">Play the siege arrival film<small>The helicopter brings her home to a town under attack. Keys 1\u20133 jump between its scenes</small></button>' +
          '<button class="btn ghost" data-a="debug-cutscene-siegeout">Play the morning after film<small>The end of Chapter 15: the wreck, the hatch, the drone. Keys 1\u20133 jump between its scenes</small></button>' +
          '<button class="btn ghost" data-a="debug-cutscene-towerflight">Play the tower arrival film<small>The helicopter comes in over New York. Keys 1\u20134 jump between its scenes</small></button>' +
          '<button class="btn ghost" data-a="debug-cutscene-towerout">Play the escape from the tower film<small>The end of Chapter 14: the vial, the paraglider, the helicopter. Keys 1\u20134 jump between its scenes</small></button>' +
          '<button class="btn ghost" data-a="debug-cutscene-domeflight">Play the dome flight film<small>The town helicopter over the mirrored domes. Keys 1\u20134 jump between its scenes</small></button>' +
          '<button class="btn ghost" data-a="debug-cutscene-domeout">Play the escape to New York film<small>The end of Chapter 13.5. Keys 1\u20134 jump between its scenes</small></button>' +
          '<button class="btn ghost" data-a="debug-cutscene">Play the ending cutscene<small>Chapter 7 film: the Moon landing. Keys 1\u20138 jump between its scenes; Esc leaves</small></button>' +
          '<button class="btn ghost" data-a="debug-cutscene-venus">Play the Venus cutscene<small>Chapter 8 film: the stolen ship. Keys 1\u20136 jump between its scenes; Esc leaves</small></button>' +
          '<button class="btn ghost" data-a="debug-cutscene-home">Play the homecoming film<small>The flight home to the Underground Giraffe City. Keys 1\u20138 jump between its scenes; Esc leaves</small></button>' +
          '<button class="btn ghost" data-a="debug-cutscene-a51">Play the Area 51 film<small>Chapter 11\u2019s finale: the jet flight and the parachute jump into Area 51. Keys 1\u20136 jump between its scenes; Esc leaves</small></button>' +
          '<button class="btn ghost" data-a="debug-cutscene-mars">Play the Mars trip film<small>The end of Chapter 12: the Mutation Vial, and the SP-1 flies to Mars. Keys 1\u20133 jump between its scenes</small></button>' +
          '<button class="btn ghost" data-a="debug-cutscene-mships">Play the Marine ships film<small>After wave 15 of Chapter 13: Marine ships come down on the plain</small></button>' +
          '<button class="btn ghost" data-a="debug-cutscene-marshome">Play the Mars fly-home film<small>The end of Chapter 13: the SP-1 flies home. Keys 1\u20133 jump between its scenes</small></button>' +
        '</div>' +
      '</div>' +
      '<div class="kv"><div>Play a chapter-transition film<small>The short film at the end of chapter N (1–6 or 9). Esc leaves.</small></div>' +
        '<div style="display:flex;gap:8px;align-items:center">' +
        '<input id="debugShortNum" type="number" value="1" min="1" max="9" ' +
          'style="width:70px;padding:7px;background:var(--soil);border:1px solid var(--bark2);' +
          'border-radius:4px;color:var(--bone);font-size:14px">' +
        '<button class="btn sm" data-a="debug-cutscene-short">Play</button></div></div>' +
      '<div class="kv"><div>Jump to a specific wave<small>Starts a fresh run at that exact wave (1\u2013' + CHAPTER_LAST_WAVE + ').</small></div>' +
        '<div style="display:flex;gap:8px;align-items:center">' +
        '<input id="debugWaveNum" type="number" value="1" min="1" max="' + CHAPTER_LAST_WAVE + '" ' +
          'style="width:70px;padding:7px;background:var(--soil);border:1px solid var(--bark2);' +
          'border-radius:4px;color:var(--bone);font-size:14px">' +
        '<button class="btn sm" data-a="debug-wave">Go</button></div></div>' +
      '<div class="menucol" style="margin-top:16px;width:100%">' +
        '<button class="btn ghost" data-a="debug-unlockall">Mark all chapters complete</button>' +
        '<button class="btn ghost" data-a="debug-venus">Venus: unlock it and give 300 sulfur + 300 basalt</button>' +
        '<button class="btn ghost" data-a="debug-enginepart">Give the spaceship engine part (unlocks the Spaceplane tab)</button>' +
        '<button class="btn ghost" data-a="debug-buildship">Spaceplane: unlock Venus and build it, ready to fly</button>' +
        '<button class="btn ghost" data-a="debug-lab">Lab and squad: finish Chapter 13, max the ant colony, unlock the ant colony, give 3 more vials and Mars resources</button>' +
        '<button class="btn ghost" data-a="debug-mars">Mars: unlock it (the vial) and give 600 iron, sulfur and basalt and 300 argon</button>' +
        '<button class="btn ghost" data-a="debug-city">City: open it and give 500 grubs, food and a pile of everything</button>' +
        '<button class="btn ghost" data-a="debug-combos">Card Fusion: unlock every combo (' + comboCount() + ' of ' + allComboPairs().length + ' unlocked)</button>' +
        '<button class="btn ghost" data-a="debug-scout">Venus: start a Scout for Resources trip</button>' +
        '<button class="btn ghost" data-a="debug-ants">Unlock ant colony</button>' +
        '<button class="btn ghost" data-a="debug-food">Add 10 food</button>' +
        '<button class="btn ghost" data-a="debug-wheelkey">Add 1 wheel key</button>' +
        '<button class="btn ghost" data-a="debug-spottedkey">Add 10 Spotted keys</button>' +
        '<button class="btn ghost" data-a="debug-bestiary">Reveal the whole bestiary</button>' +
        '<button class="btn ghost" data-a="debug-gym-max">Gym: max every skill, earn every rank, unlock today\u2019s Legend pass</button>' +
        '<button class="btn ghost" data-a="debug-uni-max">University: max every faculty and earn every rank</button>' +
        '<button class="btn ghost" data-a="debug-forage">Reset the foraging cooldown</button>' +
        '<button class="btn ghost" data-a="debug-mini-cd">Reset the minigame cooldown</button>' +
        '<button class="btn ghost" data-a="debug-mini-own">Own every hat and boot</button>' +
        '<button class="btn ghost" data-a="debug-mini-colours">Unlock every minigame color (three stars in all 13)</button>' +
        '<button class="btn ghost" data-a="debug-town-open">Longneck Town: open every place (marks chapters 4, 6 and 8 complete and flies her home)</button>' +
        '<button class="btn ghost" data-a="debug-town-find">Longneck Town: find every item (' + townFoundTotal() + ' of ' + TOWN_ITEMS.length + ' found)</button>' +
        '<button class="btn ghost" data-a="debug-town-friends">Longneck Town: make everyone a best friend</button>' +
        '<button class="btn ghost" data-a="debug-town-errands">Longneck Town: finish every errand (no rewards)</button>' +
        '<button class="btn ghost" data-a="debug-town-reset">Longneck Town: reset the town (finds, friends, errands, daily spots)</button>' +
        '<button class="btn ghost" data-a="debug-town-car">Longneck Town: give the car and 100,000 gold</button>' +
        '<button class="btn ghost" data-a="debug-town-plane">Longneck Town: give the plane and 100,000 gold</button>' +
        '<button class="btn ghost" data-a="debug-town-fleet">Longneck Town: own every plane and car</button>' +
        '<button class="btn ghost" data-a="debug-town-bread">Longneck Town: fill the satchel with bread</button>' +
        '<button class="btn ghost" data-a="debug-mini-unlock">Unlock every minigame (marks all 13 chapters complete)</button>' +
        '<button class="btn ghost" data-a="debug-trinket-redrampage">Give Red Rampage trinket' + (trinketOwned('redrampage') ? ' (owned)' : '') + '</button>' +
        '<button class="btn ghost" data-a="debug-trinket-limehelmet">Give Lime Helmet trinket' + (trinketOwned('limehelmet') ? ' (owned)' : '') + '</button>' +
        '<button class="btn" data-a="debug-close">Close</button>' +
      '</div>' +
    '</div>');
}
/* Returns the overlay to whatever it was showing before E x5 interrupted
   it -- the run in progress, the pause menu, a level-up choice still
   waiting to be made, or the menu as a catch-all. */
function restoreFromDebug(){
  const prev = G.debugPrev;
  if (prev === 'playing') resumeGame();
  else if (prev === 'paused') showPause();
  else if (prev === 'levelup') renderLevelUp();
  else if (prev === 'shop') showShop();
  else if (prev === 'help') showHelp();
  else if (prev === 'dead') showDeath();
  else if (prev === 'victory') showVictory();
  else if (prev === 'bestiary') showBestiary();
  else showMenu();
}

/* ---- the actions behind the panel's buttons (called from handleAction in 43-input.js for any action starting 'debug-') ---- */
function handleDebugAction(a){
  if (a.indexOf('debug-dr-') === 0){ devRunAction(a); return; }
  switch (a){
    case 'debug-cutscene-home': SFX.click(); startCutscene(function(){ showDebugPanel(); }, true, 'home'); break;
    case 'debug-cutscene-short': { const n = Math.round(+(document.getElementById('debugShortNum') || {}).value) || 1; if (!SH_FILMS[n]) break; SFX.click(); startCutscene(function(){ showDebugPanel(); }, true, 'sh' + n); break; }
    case 'debug-cutscene-mars': SFX.click(); startCutscene(function(){ showDebugPanel(); }, true, 'mars'); break;
    case 'debug-cutscene-mships': SFX.click(); startCutscene(function(){ showDebugPanel(); }, true, 'mships'); break;
    case 'debug-cutscene-marshome': SFX.click(); startCutscene(function(){ showDebugPanel(); }, true, 'marshome'); break;
    case 'debug-play13': SFX.click(); startRun(13); break;
    case 'debug-play14': SFX.click(); startRun(DOME_CHAPTER); break;
    case 'debug-play15': SFX.click(); startRun(TOWER_CHAPTER); break;
    case 'debug-play16': SFX.click(); startRun(SIEGE_CHAPTER); break;
    case 'debug-cutscene-towerflight': SFX.click(); startCutscene(function(){ showDebugPanel(); }, true, 'towerflight'); break;
    case 'debug-cutscene-towerout': SFX.click(); startCutscene(function(){ showDebugPanel(); }, true, 'towerout'); break;
    case 'debug-cutscene-siegeflight': SFX.click(); startCutscene(function(){ showDebugPanel(); }, true, 'siegeflight'); break;
    case 'debug-cutscene-siegeout': SFX.click(); startCutscene(function(){ showDebugPanel(); }, true, 'siegeout'); break;
    case 'debug-cutscene-domeflight': SFX.click(); startCutscene(function(){ showDebugPanel(); }, true, 'domeflight'); break;
    case 'debug-cutscene-domeout': SFX.click(); startCutscene(function(){ showDebugPanel(); }, true, 'domeout'); break;
    case 'debug-lab': { const d = Save.data; d.chapter12Complete = true; d.mutationVial = true; d.chapter13Complete = true; d.antsUnlocked = true; d.chapter8Complete = true; d.vials = (d.vials | 0) + 3; if (!d.venusUp) d.venusUp = {}; ['hab1', 'hab2', 'hab3', 'col1', 'col2', 'col3'].forEach(k => { d.venusUp[k] = 1; }); d.iron = (d.iron | 0) + 3000; d.argon = (d.argon | 0) + 1500; d.sulfur = (d.sulfur | 0) + 1500; d.basalt = (d.basalt | 0) + 1500; Save.write(); SFX.buy(); showDebugPanel(); break; }
    case 'debug-combos': unlockAllCombos(); SFX.buy(); showDebugPanel(); break;
    case 'debug-mars': Save.data.chapter12Complete = true; Save.data.mutationVial = true; Save.data.iron = (Save.data.iron | 0) + 600; Save.data.argon = (Save.data.argon | 0) + 300; Save.data.sulfur = (Save.data.sulfur | 0) + 600; Save.data.basalt = (Save.data.basalt | 0) + 600; Save.write(); SFX.buy(); showDebugPanel(); break;
    case 'debug-cutscene-a51': SFX.click(); startCutscene(function(){ showDebugPanel(); }, true, 'a51'); break;
    case 'debug-enginepart': Save.data.enginePart = true; Save.write(); SFX.buy(); showDebugPanel(); break;
    case 'debug-buildship': Save.data.chapter8Complete = true; Save.data.enginePart = true; Save.data.spaceplane = SHIP_STAGES.length; Save.write(); SFX.buy(); showDebugPanel(); break;
    case 'debug-trinket-redrampage':
    case 'debug-trinket-limehelmet': {
      const id = a.slice('debug-trinket-'.length);
      grantTrinket(id);
      if (!trinketEquipped(id)) Save.data.equippedTrinkets.push(id);
      Save.write(); recalcStats(); SFX.buy(); showDebugPanel();
      break;
    }
    case 'debug-ants': Save.data.antsUnlocked = true; Save.write(); SFX.buy(); showDebugPanel(); break;
    case 'debug-food': Save.data.food = Math.round((Save.data.food + 10) * 10) / 10; Save.write(); SFX.buy(); showDebugPanel(); break;
    case 'debug-spottedkey': Save.data.spottedKeys = (Save.data.spottedKeys | 0) + 10; Save.write(); SFX.buy(); showDebugPanel(); break;
    case 'debug-wheelkey': Save.data.wheelKeys = (Save.data.wheelKeys | 0) + 1; Save.write(); SFX.buy(); showDebugPanel(); break;
    case 'debug-forage': Save.data.lastForageAt = 0; Save.write(); SFX.buy(); showDebugPanel(); break;
    case 'debug-mini-cd': miniData().last = 0; Save.write(); SFX.buy(); showDebugPanel(); break;
    case 'debug-mini-own': { const md = miniData(); ACC_ITEMS.forEach(function(it){ md.own[it.id] = md.own[it.id] || 1; }); Save.write(); SFX.buy(); showDebugPanel(); break; }
    case 'debug-town-open': { [4, 6, 8].forEach(function(n){ Save.data['chapter' + n + 'Complete'] = true; }); Save.data.homecoming = true; Save.write(); SFX.buy(); showDebugPanel(); break; }
    case 'debug-town-find': { const t = townData(); TOWN_ITEMS.forEach(function(it){ t.found[it.id] = 1; }); TOWN_IDS.forEach(function(id){ t.done[id] = 1; }); Save.write(); SFX.buy(); showDebugPanel(); break; }
    case 'debug-town-friends': { const t = townData(); TOWN_NPC_LIST.forEach(function(id){ t.bond[id] = 30; t.n['r_' + id] = 3; townGrantGift(id); }); Save.write(); SFX.buy(); showDebugPanel(); break; }
    case 'debug-town-errands': { const t = townData(); TOWN_ERRANDS.forEach(function(e){ t.err[e.id] = 2; }); Save.write(); SFX.buy(); showDebugPanel(); break; }
    case 'debug-town-car': { townCarData().own = 1; Save.data.gold = (Save.data.gold | 0) + 100000; Save.write(); SFX.buy(); showDebugPanel(); break; }
    case 'debug-town-plane': { planeData().own = 1; Save.data.gold = (Save.data.gold | 0) + 100000; Save.write(); SFX.buy(); showDebugPanel(); break; }
    case 'debug-town-fleet': { PLANES.forEach(function(p){ planeFleet().owned[p.id] = 1; }); CARS.forEach(function(c){ carFleet().owned[c.id] = 1; }); planeData().own = 1; townCarData().own = 1; Save.write(); SFX.buy(); showDebugPanel(); break; }
    case 'debug-town-bread': { townData().n.loaves = BREAD_CAP; Save.write(); SFX.buy(); showDebugPanel(); break; }
    case 'debug-town-reset': { Save.data.town = {}; Save.write(); SFX.buy(); showDebugPanel(); break; }
    case 'debug-mini-colours': { const md = miniData(); for (let n = 1; n <= 13; n++) md.stars[n] = 3; Save.write(); SFX.buy(); showDebugPanel(); break; }
    case 'debug-mini-unlock': for (let n = 1; n <= 13; n++) Save.data['chapter' + n + 'Complete'] = true; Save.write(); SFX.buy(); showDebugPanel(); break;
    case 'debug-gym-max': {
      const d = gymData(); d.day = townDayKey(); d.pass = GYM_PASSES.length;
      GYM_SKILLS.forEach(function(S){ const k = gymSkill(S.id); k.l = GYM_MAX; k.xp = 0; });
      try { recalcStats(); } catch (e) {} gymCheckRank(); Save.write(); SFX.buy(); showDebugPanel(); break;
    }
    case 'debug-uni-max': {
      UNI_FAC.forEach(function(F){ const k = uniFac(F.id); k.l = UNI_MAX; k.xp = 0; });
      try { recalcStats(); } catch (e) {} uniCheckRank(); Save.write(); SFX.buy(); showDebugPanel(); break;
    }
    case 'debug-bestiary': {
      const b = bestiaryData();
      for (let ch = 1; ch <= BESTIARY_CHAPTERS.length; ch++) for (let i = 0; i < BESTIARY_ORDER.length; i++){ const k = ch + ':' + BESTIARY_ORDER[i]; if (!b.creatures[k]) b.creatures[k] = 1; }
      for (let i = 0; i < CARDS.length; i++) b.cards[CARDS[i].id] = 10;
      Save.write(); SFX.buy(); showDebugPanel();
      break;
    }
    case 'debug-e': clickDebugE(); break;
    case 'debug-submit': submitDebugCode(); break;
    case 'debug-cancel': SFX.click(); restoreFromDebug(); break;
    case 'debug-close': SFX.click(); restoreFromDebug(); break;
    case 'debug-addgold': {
      const el = document.getElementById('debugGoldAmt');
      const amt = Math.max(0, Math.round(parseFloat(el && el.value) || 0));
      Save.data.gold += amt; Save.write(); SFX.buy(); showDebugPanel();
      break;
    }
    case 'debug-addgems': {
      const el = document.getElementById('debugGemAmt');
      const amt = Math.max(0, Math.round(parseFloat(el && el.value) || 0));
      Save.data.gems += amt; Save.write(); SFX.buy(); showDebugPanel();
      break;
    }
    case 'debug-play1': SFX.click(); startRun(1); break;
    case 'debug-play2': SFX.click(); startRun(2); break;
    case 'debug-play3': SFX.click(); startRun(3); break;
    case 'debug-play4': SFX.click(); startRun(4); break;
    case 'debug-play5': SFX.click(); startRun(5); break;
    case 'debug-play6': SFX.click(); startRun(6); break;
    case 'debug-play7': SFX.click(); startRun(7); break;
    case 'debug-play8': SFX.click(); startRun(8); break;
    case 'debug-play9': SFX.click(); startRun(9); break;
    case 'debug-play10': SFX.click(); startRun(10); break;
    case 'debug-play11': SFX.click(); startRun(11); break;
    case 'debug-play12': SFX.click(); startRun(12); break;
    case 'debug-city': Save.data.chapter8Complete = true; Save.data.enginePart = true; Save.data.homecoming = true; Save.data.grubs = (Save.data.grubs | 0) + 500; Save.data.food = (+Save.data.food || 0) + 60; Save.data.gold += 50000000; Save.data.gems = (Save.data.gems | 0) + 100000; Save.data.sulfur = (Save.data.sulfur | 0) + 1000; Save.data.basalt = (Save.data.basalt | 0) + 1000; Save.write(); SFX.buy(); showDebugPanel(); break;
    case 'debug-cutscene': SFX.click(); startCutscene(function(){ showDebugPanel(); }, true); break;
    case 'debug-cutscene-venus': SFX.click(); startCutscene(function(){ showDebugPanel(); }, true, 'venus'); break;
    case 'debug-wave': {
      const el = document.getElementById('debugWaveNum');
      const n = Math.max(1, Math.round(parseFloat(el && el.value) || 1));
      SFX.click(); startRun(1, n);
      break;
    }
    case 'debug-venus': Save.data.chapter8Complete = true; Save.data.sulfur = (Save.data.sulfur | 0) + 300; Save.data.basalt = (Save.data.basalt | 0) + 300; Save.write(); SFX.buy(); showDebugPanel(); break;
    case 'debug-scout': Save.data.chapter8Complete = true; Save.write(); startScout(); break;
    case 'debug-unlockall':
      for (let n = 1; n <= TOTAL_CHAPTERS; n++) Save.data['chapter' + n + 'Complete'] = true;        /* every chapter, the Domes, the Tower and the Siege included */
      Save.write(); SFX.buy(); showDebugPanel();
      break;
  }
}

/* ========================= DEV TEST RUN ========================= */
/* A sandbox run: Chapter 1 with no enemies, a small DEV button (or the ` key) that opens a control window while it plays, and
   in that window: XP on/off, invincibility, any card or combo at any level, any enemy in any amount, a jump to any wave, and so
   on. Nothing it does is banked: no gold, gems, best score or run save is written, and the player's own Continue save is kept.
   It works by wrapping a few game functions below (gainXP, hurtPlayer, updateWaves, gameOver, saveRunNow, saveRunAtBoundary),
   so the rest of the game has no idea it exists, and it is gone with this file. */
const DEV_WAVE_MAX = CHAPTER_LAST_WAVE;
function devOn(){ return !!(G.dev && G.dev.on); }
function devUI(){ if (!G.devUI) G.devUI = { card: 'weaponry', cardLv: 10, combo: '', comboLv: 3, ech: 1, etype: '', eside: 'alien', ecount: 5, ewave: 1, gch: 1, gwave: 1, xp: 500, lv: 1, open: {}, msg: '' }; return G.devUI; }

let G_devRawXP = null;
/* ---- the hooks (each one does nothing unless a test run is active) ---- */
(function(){
  const _gainXP = gainXP, _hurt = hurtPlayer, _waves = updateWaves, _over = gameOver, _save = saveRunNow, _bound = (typeof saveRunAtBoundary === 'function') ? saveRunAtBoundary : null;
  G_devRawXP = _gainXP;
  gainXP = function(n){ if (devOn() && G.dev.noXp) return; _gainXP(n); };
  hurtPlayer = function(a, sx, sy){ if (devOn() && G.dev.god) return; _hurt(a, sx, sy); };
  saveRunNow = function(){ if (devOn()) return; _save(); };
  if (_bound) saveRunAtBoundary = function(k){ if (devOn()) return; _bound(k); };
  updateWaves = function(dt){
    const d = G.dev;
    if (d && d.on){
      if (d.god && !P.dead && P.hp < P.maxHp) P.hp = P.maxHp;
      if (d.freeze) for (let i = 0; i < G.enemies.length; i++){ const e = G.enemies[i]; e.stunT = Math.max(e.stunT || 0, 0.5); }
      if (!d.auto) return;                                                                  /* no waves: only what the panel spawns */
      if (G.waveState === 'clear' && G.waveTimer - dt <= 0 && (isRunEnd(G.wave) || isChapterFinaleWave(G.wave))){
        d.auto = false; G.waveState = 'idle'; G.spawnQueue = [];                           /* the end of a chapter would play films and bank a win: stop here instead */
        banner('TEST RUN', 'End of the chapter. Waves are paused.', '#F2B33D', 2.2);
        return;
      }
    }
    _waves(dt);
  };
  gameOver = function(){
    if (devOn()){
      if (P.hp > 0){ devEnd(); return; }                                                    /* "Give up" from the pause menu: leave without banking */
      P.dead = false; P.hp = P.maxHp; P.invuln = 2.5;                                       /* a real death: just get back up */
      addText(P.x, P.y - 50, 'Test run: back up', '#7EE08A', 18, true);
      return;
    }
    _over();
  };
})();

/* ---- the control window ---- */
const DEV_IN = 'padding:6px;background:var(--soil);border:1px solid var(--bark2);border-radius:4px;color:var(--bone);font-size:14px;';
function devNum(id, v, lo, hi, w){ return '<input id="' + id + '" type="number" value="' + v + '" min="' + lo + '" max="' + hi + '" style="' + DEV_IN + 'width:' + (w || 70) + 'px">'; }
function devSel(id, opts, v, w){
  return '<select id="' + id + '" style="' + DEV_IN + 'max-width:' + (w || 230) + 'px">' + opts.map(function(o){ return '<option value="' + o[0] + '"' + (String(o[0]) === String(v) ? ' selected' : '') + '>' + o[1] + '</option>'; }).join('') + '</select>';
}
function devBtn(a, label, ghost){ return '<button class="btn sm' + (ghost ? ' ghost' : '') + '" data-a="debug-dr-' + a + '">' + label + '</button>'; }
function devRow(label, small, ctl){ return '<div class="kv"><div>' + label + (small ? '<small>' + small + '</small>' : '') + '</div><div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;justify-content:flex-end">' + ctl + '</div></div>'; }
function devSec(id, title, body, openDefault){
  const u = devUI(), open = u.open[id] === undefined ? !!openDefault : !!u.open[id];
  return '<details data-sec="' + id + '"' + (open ? ' open' : '') + ' style="margin-top:12px;border-top:1px solid var(--bark2);padding-top:8px"><summary style="cursor:pointer;font-weight:700;padding:4px 0">' + title + '</summary>' + body + '</details>';
}
function devTableFor(ch, side){
  switch (ch){
    case 1: return ETYPES; case 2: return ETYPES_FROST; case 3: return ETYPES_SWAMP; case 4: return ETYPES_OCEAN; case 5: return ETYPES_JUNGLE;
    case 6: return ETYPES_CITY; case 7: return ETYPES_SPACE; case 8: return ETYPES_MARINE;
    case 9: return side === 'marine' ? ETYPES_VENUS_MARINE : ETYPES_VENUS;
    case 10: return ETYPES_INFERNO; case 11: return ETYPES_GLIM; case 12: return ETYPES_A51; case 14: return ETYPES_DOME;
    default: return side === 'marine' ? ETYPES_MARS_MARINE : ETYPES_MARS;
  }
}
const DEV_CHAPTERS = ['1 Savanna', '2 Frostreach', '3 Murkfen', '4 The Deep', '5 The Canopy', '6 Houston', '7 Space Center', '8 The Moon', '9 Venus', '10 The Inferno', '11 The Changed Savannah', '12 Area 51', '13 Mars', '13.5 The Domes'];
function devRead(){
  const u = devUI(), g = function(id){ return document.getElementById(id); };
  if (!g('dvCard')) return;
  const num = function(id, d, lo, hi){ const e = g(id); const v = e ? Math.round(parseFloat(e.value)) : NaN; return isFinite(v) ? Math.max(lo, Math.min(hi, v)) : d; };
  const str = function(id, d){ const e = g(id); return e ? e.value : d; };
  u.card = str('dvCard', u.card); u.cardLv = num('dvCardLv', u.cardLv, 1, 10); u.combo = str('dvCombo', u.combo); u.comboLv = num('dvComboLv', u.comboLv, 1, 3);
  u.ech = num('dvECh', u.ech, 1, TOTAL_CHAPTERS); u.etype = str('dvEType', u.etype); u.eside = str('dvESide', u.eside); u.ecount = num('dvECount', u.ecount, 1, MAX_ENEMIES); u.ewave = num('dvEWave', u.ewave, 1, WAVES_PER_CHAPTER);
  u.gch = num('dvGCh', u.gch, 1, TOTAL_CHAPTERS); u.gwave = num('dvGWave', u.gwave, 1, WAVES_PER_CHAPTER); u.xp = num('dvXp', u.xp, 0, 1e9); u.lv = num('dvLv', u.lv, 1, 40);
  OV.querySelectorAll('details[data-sec]').forEach(function(d){ u.open[d.getAttribute('data-sec')] = d.open; });
}
function showDevRun(msg){
  const u = devUI(), d = G.dev || {};
  if (msg !== undefined) u.msg = msg;
  if (G.state !== 'debugpanel') G.debugPrev = G.state === 'playing' || G.state === 'paused' ? G.state : 'playing';
  G.state = 'debugpanel'; G.devRunPanel = true;
  devBtnSync();
  const cardOpts = CARDS.map(function(c){
    const held = P.cards.filter(function(i){ return i.def.id === c.id; })[0];
    return [c.id, c.name + ' (' + c.rarity + ')' + (held ? (held.hidden ? ' — inside a combo' : ' — held, level ' + held.level) : '')];
  });
  const pairs = allComboPairs(), comboOpts = [];
  for (let i = 0; i < pairs.length; i++){
    const def = comboDefFor(pairs[i][0], pairs[i][1]); if (!def) continue;
    const have = P.cards.filter(function(c){ return c.def === def; })[0];
    comboOpts.push([pairs[i][0] + '|' + pairs[i][1], def.forms[0].name + ' — ' + CARDMAP[pairs[i][0]].name + ' + ' + CARDMAP[pairs[i][1]].name + (have ? ' (held, level ' + have.level + ')' : '')]);
  }
  if (!u.combo && comboOpts.length) u.combo = comboOpts[0][0];
  const tbl = devTableFor(u.ech, u.eside), typeOpts = Object.keys(tbl).filter(function(k){ return tbl[k] && typeof tbl[k] === 'object' && tbl[k].hp; }).map(function(k){ const t = tbl[k]; return [k, (t.title || k) + (t.big ? ' (boss)' : '') + ' [' + k + ']']; });
  if (!typeOpts.some(function(o){ return o[0] === u.etype; })) u.etype = typeOpts.length ? typeOpts[0][0] : '';
  const chOpts = DEV_CHAPTERS.map(function(n, i){ return [i + 1, n]; }), cw = chapterWaveOf(G.wave || 1);
  const onoff = function(v){ return v ? '<b style="color:#9BE04A">ON</b>' : '<b style="color:#FF7A6A">OFF</b>'; };
  const html =
    '<div class="panel slab" style="max-width:560px">' +
      '<h2 class="head">Dev Test Run</h2>' +
      '<p class="sub">Wave <b>' + G.wave + '</b> (chapter ' + G.chapter + ', wave ' + cw + ' of ' + WAVES_PER_CHAPTER + ') &middot; level <b>' + P.level + '</b> &middot; <b>' + G.enemies.length + '</b> enemies &middot; nothing here is banked</p>' +
      (u.msg ? '<p class="sub" style="color:#F2B33D">' + u.msg + '</p>' : '') +
      '<div class="menucol" style="margin-top:0;width:100%">' +
        '<button class="btn" data-a="debug-close">Back to the test run</button>' +
      '</div>' +
      devSec('tog', 'Switches',
        devRow('XP gain', 'Kills and pickups give no XP while this is off.', onoff(!d.noXp) + devBtn('xp', d.noXp ? 'Turn XP on' : 'Turn XP off')) +
        devRow('Invincible', 'Nothing can hurt her; health stays full.', onoff(d.god) + devBtn('god', d.god ? 'Turn off' : 'Turn on')) +
        devRow('Waves', 'Off: nothing spawns by itself. On: this wave plays out normally and the next ones follow.', onoff(d.auto) + devBtn('auto', d.auto ? 'Stop the waves' : 'Run this wave')) +
        devRow('Freeze enemies', 'Keeps every enemy stunned in place.', onoff(d.freeze) + devBtn('freeze', d.freeze ? 'Unfreeze' : 'Freeze')), true) +
      devSec('wave', 'Go to a wave (keeps your cards)',
        devRow('Chapter and wave', 'The chapter’s scenery, enemies and music are rebuilt.', devSel('dvGCh', chOpts, u.gch, 190) + devNum('dvGWave', u.gwave, 1, WAVES_PER_CHAPTER, 60) + devBtn('go', 'Go')) +
        '<div class="row" style="margin-top:8px;gap:6px;flex-wrap:wrap">' + devBtn('prev', '− 1 wave', true) + devBtn('next', '+ 1 wave', true) + devBtn('restart', 'Restart this wave', true) +
          devBtn('wv5', 'Boss wave 5', true) + devBtn('wv10', 'Boss 10', true) + devBtn('wv15', 'Boss 15', true) + devBtn('wv20', 'Boss 20', true) + devBtn('wv25', 'Finale 25', true) + '</div>', true) +
      devSec('card', 'Cards',
        devRow('Card', 'Any card, any level from 1 to 10 (5 and 10 change its form). The 7-card limit does not apply.', devSel('dvCard', cardOpts, u.card, 250) + devNum('dvCardLv', u.cardLv, 1, 10, 56) + devBtn('cardset', 'Set') + devBtn('cardremove', 'Remove', true)) +
        '<div class="row" style="margin-top:8px;gap:6px;flex-wrap:wrap">' + devBtn('cardmax', 'Every card to level 10', true) + devBtn('cardsclear', 'Remove every card', true) + '</div>', true) +
      devSec('combo', 'Combo cards',
        devRow('Combo', 'Any of the ' + comboOpts.length + ' combos at level 1, 2 or 3. Its two cards are given at level 10 if you do not have them. Unlock state does not matter.', devSel('dvCombo', comboOpts, u.combo, 260) + devNum('dvComboLv', u.comboLv, 1, 3, 56) + devBtn('combo', 'Give')), false) +
      devSec('enemy', 'Spawn enemies',
        devRow('Chapter', 'Whose enemies to pick from. They work best after going to that chapter’s wave.', devSel('dvECh', chOpts, u.ech, 190)) +
        ((u.ech === 9 || u.ech === 13) ? devRow('Side', u.ech === 9 ? 'Venus mixes aliens and Marines.' : 'Mars: the dust aliens, or the Marines of the war waves.', devSel('dvESide', [['alien', u.ech === 9 ? 'Aliens' : 'Dust aliens'], ['marine', 'Marines']], u.eside, 150)) : '') +
        devRow('Enemy', '', devSel('dvEType', typeOpts, u.etype, 250)) +
        devRow('How many, and how tough', 'Toughness is the wave number within the chapter (1 to 25). Up to ' + MAX_ENEMIES + ' enemies exist at once.', devNum('dvECount', u.ecount, 1, MAX_ENEMIES, 64) + devNum('dvEWave', u.ewave, 1, WAVES_PER_CHAPTER, 56) + devBtn('spawn', 'Spawn')) +
        '<div class="row" style="margin-top:8px;gap:6px;flex-wrap:wrap">' + devBtn('killall', 'Kill every enemy', true) + devBtn('clear', 'Remove every enemy', true) + '</div>', false) +
      devSec('player', 'Player',
        devRow('Give XP', 'Works even with XP gain off.', devNum('dvXp', u.xp, 0, 1e9, 90) + devBtn('addxp', 'Give')) +
        devRow('Level-ups', 'Opens the normal three-card choice that many times.', devNum('dvLv', u.lv, 1, 40, 56) + devBtn('levelup', 'Level up')) +
        '<div class="row" style="margin-top:8px;gap:6px;flex-wrap:wrap">' + devBtn('heal', 'Full health', true) + devBtn('rerolls', '+10 rerolls', true) + devBtn('center', 'To the middle of the map', true) + '</div>', false) +
      '<div class="menucol" style="margin-top:16px;width:100%">' +
        '<button class="btn" data-a="debug-close">Back to the test run</button>' +
        '<button class="btn ghost" data-a="debug-dr-end">End the test run (back to the menu, nothing saved)</button>' +
      '</div>' +
    '</div>';
  setOverlay(html);
  ['dvECh', 'dvESide'].forEach(function(id){
    const s = document.getElementById(id);
    if (s) s.addEventListener('change', function(){ devRead(); showDevRun(''); });
  });
  OV.querySelectorAll('input').forEach(function(i){ i.addEventListener('keydown', function(ev){ ev.stopPropagation(); if (ev.key === 'Escape'){ ev.preventDefault(); restoreFromDebug(); } }); });
}

/* ---- the small DEV button, and the ` key ---- */
let devBtnEl = null, devBtnShown = false;
function devBtnSync(){
  const want = devOn() && G.state === 'playing';
  if (want && !devBtnEl){
    devBtnEl = document.createElement('button');
    devBtnEl.id = 'devRunBtn'; devBtnEl.textContent = 'DEV';
    devBtnEl.style.cssText = 'position:fixed;left:50%;bottom:8px;transform:translateX(-50%);z-index:60;padding:6px 14px;font:700 13px system-ui,sans-serif;letter-spacing:.12em;' +
      'background:rgba(20,14,10,.78);color:#F2B33D;border:1px solid #F2B33D;border-radius:6px;cursor:pointer;opacity:.75;display:none';
    devBtnEl.addEventListener('click', function(){ devOpen(); });
    document.body.appendChild(devBtnEl);
  }
  if (devBtnEl && want !== devBtnShown){ devBtnEl.style.display = want ? 'block' : 'none'; devBtnShown = want; }
}
function devOpen(){ if (devOn() && G.state === 'playing'){ G.debugPrev = 'playing'; showDevRun(); } }
setInterval(devBtnSync, 250);
window.addEventListener('keydown', function(e){
  if (e.code === 'Backquote' && devOn() && !e.repeat){
    if (G.state === 'playing'){ e.preventDefault(); devOpen(); }
    else if (G.state === 'debugpanel' && G.devRunPanel){ e.preventDefault(); restoreFromDebug(); }
  }
});

/* ---- the sandbox itself ---- */
function devGoto(w){
  w = clamp(Math.round(w) || 1, 1, DEV_WAVE_MAX);
  const keep = { cards: P.cards.slice(), level: P.level, xp: P.xp, xpNext: P.xpNext, rerolls: G.rerolls, score: G.score, kills: G.kills, time: G.runTime };
  const stash = Save.data.runSave, d = G.dev;
  startRun(chapterOf(w), w);
  Save.data.runSave = stash;                                           /* starting a run clears the Continue save; the player's own stays */
  P.cards.length = 0; for (let i = 0; i < keep.cards.length; i++) P.cards.push(keep.cards[i]);
  P.level = keep.level; P.xp = keep.xp; P.xpNext = keep.xpNext; G.rerolls = keep.rerolls; G.score = keep.score; G.kills = keep.kills; G.runTime = keep.time;
  G.pendingLevels = 0;
  recalcStats(); P.hp = P.maxHp; resetLoadoutHUD();
  if (!d.auto){ G.spawnQueue = []; G.waveState = 'idle'; G.hunt = 0; }
  const u = devUI(); u.gch = chapterOf(w); u.gwave = chapterWaveOf(w);
}
function devBegin(){
  G.dev = { on: true, noXp: false, god: true, auto: false, freeze: false };
  G.devUI = null; G.devRunPanel = false;
  const stash = Save.data.runSave;
  startRun(1);
  Save.data.runSave = stash;
  G.spawnQueue = []; G.waveState = 'idle';
  addText(P.x, P.y - 60, 'Dev test run. Press ` or tap DEV', '#F2B33D', 18, true);
  devBtnSync();
}
function devEnd(){
  G.dev = null; G.devRunPanel = false; devBtnSync();
  HUD.classList.remove('on'); PAUSEBTN.classList.remove('on'); TOUCH.classList.remove('on');
  resetLoadoutHUD(); startAttract(); showMenu();
}
function devFindCard(id){ for (let i = 0; i < P.cards.length; i++) if (P.cards[i].def.id === id) return P.cards[i]; return null; }
function devSetCard(id, lv){
  const def = CARDMAP[id]; if (!def) return null;
  lv = clamp(Math.round(lv) || 1, 1, 10);
  let inst = devFindCard(id);
  if (!inst){
    inst = { def: def, level: 1, ang: 0, t: 0, tier: 0 };
    if (def.init) def.init(inst);
    P.cards.push(inst);
  }
  inst.level = lv; refreshInst(inst);
  return inst;
}
function devAfterCards(){ recalcStats(); resetLoadoutHUD(); P.hp = Math.min(P.hp, P.maxHp); }
function devRemoveCard(inst){
  if (inst.parts){ inst.parts.forEach(function(p){ p.hidden = false; p.fusedInto = null; }); }
  const at = P.cards.indexOf(inst); if (at >= 0) P.cards.splice(at, 1);
}
function devSpawn(){
  const u = devUI(), tbl = devTableFor(u.ech, u.eside);
  if (!tbl[u.etype]) return 'Pick an enemy first.';
  let cw = u.ewave;
  if (u.ech === 13) cw = u.eside === 'marine' ? Math.max(cw, MARS_SWITCH_WAVE + 1) : Math.min(cw, MARS_SWITCH_WAVE);
  const w = chapterFirstWave(u.ech) - 1 + cw, kind = u.ech === 9 ? u.eside : undefined;
  let n = 0, err = '';
  for (let i = 0; i < u.ecount; i++){
    const a = Math.random() * TAU, r = rand(200, 360);
    try {
      const e = spawnEnemy(u.etype, clamp(P.x + Math.cos(a) * r, 40, ARENA_W - 40), clamp(P.y + Math.sin(a) * r, 40, ARENA_H - 40), w, kind);
      if (!e) break; n++;
    } catch (ex){ err = ' (error: ' + ex.message + ')'; break; }
  }
  return 'Spawned ' + n + ' of ' + u.ecount + (n < u.ecount && !err ? ' (enemy limit reached)' : '') + err + '.';
}

function devRunAction(a){
  const k = a.slice('debug-dr-'.length);
  if (k === 'start'){ SFX.click(); devBegin(); return; }
  if (!devOn()) return;
  const d = G.dev, u = devUI();
  devRead();
  let msg = '';
  switch (k){
    case 'xp': d.noXp = !d.noXp; msg = 'XP gain ' + (d.noXp ? 'off.' : 'on.'); break;
    case 'god': d.god = !d.god; msg = d.god ? 'Invincible.' : 'She can be hurt again. If she goes down she is simply put back on her feet.'; break;
    case 'freeze': d.freeze = !d.freeze; msg = d.freeze ? 'Enemies frozen.' : 'Enemies free.'; break;
    case 'auto':
      d.auto = !d.auto;
      if (d.auto){ if (G.waveState === 'idle' || G.waveState === 'clear') startWave(G.wave); msg = 'This wave is running, and the next ones follow.'; }
      else { G.spawnQueue = []; G.waveState = 'idle'; msg = 'Waves stopped. Enemies already out stay.'; }
      break;
    case 'go': devGoto(chapterFirstWave(u.gch) - 1 + u.gwave); return;
    case 'prev': devGoto(G.wave - 1); return;
    case 'next': devGoto(G.wave + 1); return;
    case 'restart': devGoto(G.wave); return;
    case 'wv5': case 'wv10': case 'wv15': case 'wv20': case 'wv25': devGoto(chapterFirstWave(G.chapter) - 1 + parseInt(k.slice(2), 10)); return;
    case 'cardset': { const i = devSetCard(u.card, u.cardLv); devAfterCards(); msg = i ? CARDMAP[u.card].name + ' set to level ' + i.level + '.' : 'No such card.'; break; }
    case 'cardremove': { const i = devFindCard(u.card); if (i && !i.hidden){ devRemoveCard(i); devAfterCards(); msg = CARDMAP[u.card].name + ' removed.'; } else msg = i ? 'That card is inside a combo. Remove the combo.' : 'You do not hold it.'; break; }
    case 'cardmax': CARDS.forEach(function(c){ devSetCard(c.id, 10); }); devAfterCards(); msg = 'Every card is at level 10.'; break;
    case 'cardsclear': P.cards.length = 0; devAfterCards(); msg = 'All cards removed.'; break;
    case 'combo': {
      const p = u.combo.split('|'), def = comboDefFor(p[0], p[1]);
      if (!def){ msg = 'No such combo.'; break; }
      let inst = P.cards.filter(function(c){ return c.def === def; })[0];
      if (!inst){
        const blocked = p.filter(function(id){ const c = devFindCard(id); return c && c.hidden; })[0];
        if (blocked){ msg = CARDMAP[blocked].name + ' is already inside another combo. Remove that combo first.'; break; }
        devSetCard(p[0], 10); devSetCard(p[1], 10);
        inst = takeCombo(def);
        if (!inst){ msg = 'Could not make that combo.'; break; }
      }
      inst.level = u.comboLv; refreshInst(inst); devAfterCards();
      msg = def.forms[0].name + ' at level ' + inst.level + '.';
      break;
    }
    case 'spawn': msg = devSpawn(); break;
    case 'killall': {
      const list = G.enemies.slice(); dmgSrc = 'other';
      for (let i = 0; i < list.length; i++) if (!list[i].dead) damageEnemy(list[i], 1e12, {});
      msg = 'Killed ' + list.length + '.';
      break;
    }
    case 'clear': { const n = G.enemies.length; G.enemies.length = 0; G.eproj.length = 0; G.bossAlive = false; G.boss = null; G.bossIntro = null; msg = 'Removed ' + n + '.'; break; }
    case 'addxp': G_devRawXP(u.xp); msg = 'Gave ' + fmt(u.xp) + ' XP.'; break;
    case 'levelup': G.pendingLevels += u.lv; G.levelGate = 0; restoreFromDebug(); return;
    case 'heal': P.hp = P.maxHp; msg = 'Full health.'; break;
    case 'rerolls': G.rerolls += 10; msg = 'Rerolls: ' + G.rerolls + '.'; break;
    case 'center': P.x = ARENA_W / 2; P.y = ARENA_H / 2; msg = 'Moved.'; break;
    case 'end': SFX.click(); devEnd(); return;
    default: return;
  }
  SFX.click();
  showDevRun(msg);
}

/* ---- the play-tests reach the panel through window.GR; it is added here so GR stays complete without this file ---- */
if (typeof GR !== 'undefined'){
  GR.showDebugCode = showDebugCode; GR.showDebugPanel = showDebugPanel; GR.submitDebugCode = submitDebugCode;
  GR.clickDebugE = clickDebugE; GR.restoreFromDebug = restoreFromDebug; GR.unlockAllCombos = unlockAllCombos;
  GR.devBegin = devBegin; GR.devRunAction = devRunAction; GR.devOn = devOn;
}
