'use strict';
/* Run lifecycle and the HUD. */
/* ========================= 35. RUN LIFECYCLE ========================= */
function resetWorld(){
  G.enemies.length = 0; G.projectiles.length = 0; G.eproj.length = 0;
  G.particles.length = 0; G.texts.length = 0; G.zones.length = 0;
  G.shocks.length = 0; G.pickups.length = 0; G.swipes.length = 0;
  G.bolts.length = 0; _timers.length = 0;
  G.markers.length = 0; G.beams.length = 0; G.blasts.length = 0; G.hzones.length = 0; G.arcs.length = 0; G.pulses.length = 0;
  G.ants = []; G.antTimers = null; G.buildings = []; G.rocket = null; G.allies = [];
  G.banner = null; G.flash = null; G.shake = 0; G.shakeBias = 0; G.hitstop = 0; G.fxDecals = []; G.bossIntro = null; G.fadeIn = null;
  if (typeof P !== 'undefined') P.magnetT = 0;
  G.transformFX = null; G.chapterFX = null; G.bossAlive = false; G.boss = null;
  P.cards.length = 0;
}

let wakeLock = null;
function keepAwake(){ try { if (Input.hasTouch && navigator.wakeLock && (!wakeLock || wakeLock.released)) navigator.wakeLock.request('screen').then(function(l){ wakeLock = l; }).catch(function(){}); } catch (e) {} }
function startRun(startChapter, waveOverride, snap){
  const forcedWave = waveOverride ? clamp(Math.round(waveOverride), 1, CHAPTER_LAST_WAVE) : null;
  const chapter = forcedWave ? chapterOf(forcedWave) : clamp(Math.round(startChapter) || 1, 1, TOTAL_CHAPTERS);
  SFX.init(); SFX.resume(); keepAwake();
  resetWorld();
  gfxReset(); GearFx.lastTime = 0;
  G.attract = false; G.deathFX = null; G.slowmo = null; G.reviveFX = null; G.introFX = null; G.bannerHold = null;
  G.splash = false; screenFadeIn(0.5);
  G.time = 0; G.runTime = 0; G.score = 0; G.kills = 0; G.bonusGold = 0;
  G.runDmg = {}; G.runXp = 0; G.runTaken = 0; P.killedBy = null;
  G.wave = 0; G.chapter = chapter; G.biome = biomeForChapter(chapter);
  G.pendingLevels = 0; G.levelGate = 0; G.offer = null; G.runGems = 0; G.runSulfur = 0; G.runBasalt = 0; G.runGrubs = 0; G.runIron = 0; G.runArgon = 0; G.marsWalk = 0; G.marsShipsSeen = false; G.timeSlowT = 0;
  G.runSpeed = !!Settings.speedMode;   /* fixed for the whole run */
  G.runSpeedLevel = G.runSpeed ? clamp(Settings.speedLevel | 0, 1, 3) : 0;
  G.rerolls = 2 + metaLevel('luckypaws');
  G.waveState = 'idle'; G.spawnQueue = []; G.spawnTimer = 0;
  G.waveOver = 0; G.hunt = 0; G.huntWarned = false;
  G.revives = metaLevel('wind');
  P.x = ARENA_W / 2; P.y = ARENA_H / 2; P.vx = 0; P.vy = 0;
  P.level = 1; P.xp = 0; P.xpNext = xpForLevel(1);
  P.kickCd = 0; P.kickAnim = 0; P.invuln = 1.2; P.hurtT = 0; P.slowCd = 0;
  P.rage = 0; P.dead = false; P.regenAcc = 0; P.walk = 0; P.bonusHp = 0;
  P.maxHp = 120; P.hp = 120;
  recalcStats();
  G.rerolls += (P.stats.bonusRerolls | 0);
  P.hp = P.maxHp;
  roverInit();
  squadInit();
  grantStartCards();
  if (snap) restoreRun(snap); else Save.data.runSave = null;
  buildDecor();
  G.buildings = []; G.rocket = null;
  if (G.biome === 'city') buildCityBuildings();
  else if (G.biome === 'space') buildSpaceCenter();
  else if (G.biome === 'moon') buildMoon();
    else if (G.biome === 'venus') buildVenusWorld();
    else if (G.biome === 'area51') buildArea51World();
    else if (G.biome === 'mars') buildMarsWorld();
    else if (G.biome === 'dome') buildDomeWorld();
  buildScenery();
  G.state = 'playing';
  if (forcedWave && chapterOf(forcedWave) === 13 && chapterWaveOf(forcedWave) > MARS_SWITCH_WAVE) G.marsShipsSeen = true;
  /* Lucky Deck's free starting card only applies to a chapter-1 start --
     jumping straight into a later chapter always begins with an empty loadout. */
  /* Lucky Deck used to hand over one fixed random card with no say in the
     matter. A free level lets the player see the normal 3-card offer (and
     still reroll it with any banked rerolls) for real odds and a real
     choice, right as the run begins. */
  if (!snap && chapter === 1 && metaLevel('deck') >= 5){
    G.pendingLevels++;
    addText(P.x, P.y - 50, 'Lucky Deck: a free level to spend', '#F2B33D', 17, true);
  }
  G.noSnap = !!snap;
  startIntroFX(chapter);
  startWave(forcedWave || chapterFirstWave(chapter));
  G.noSnap = false;
  hideOverlay();
  HUD.classList.add('on');
  if (Input.hasTouch){ TOUCH.classList.add('on'); PAUSEBTN.classList.add('on'); }
  resetLoadoutHUD();
}

function gameOver(){
  if (G.state === 'dead' || G.state === 'victory') return;
  P.dead = true;
  G.state = 'dead';
  gfxClearAurora(); recalcStats();
  const gm = P.stats.goldMul;
  const base = Math.floor(G.score * 0.002);
  const bonus = Math.floor(G.bonusGold);
  const earned = Math.max(1, Math.floor((base + bonus) * gm));
  const d = Save.data;
  const prevBest = scoreInt(d.best), prevBestWave = d.bestWave | 0;
  d.gold += earned;
  d.runs = (d.runs | 0) + 1; d.runSave = null;
  d.totalKills = (d.totalKills | 0) + G.kills;
  d.gems = (d.gems | 0) + (G.runGems | 0);
  d.sulfur = (d.sulfur | 0) + (G.runSulfur | 0); d.basalt = (d.basalt | 0) + (G.runBasalt | 0); d.grubs = (d.grubs | 0) + (G.runGrubs | 0); d.iron = (d.iron | 0) + (G.runIron | 0); d.argon = (d.argon | 0) + (G.runArgon | 0);
  if (G.score > scoreInt(d.best)) d.best = G.score;
  if (G.wave > (d.bestWave | 0)) d.bestWave = G.wave;
  Save.write();
  G.lastRun = { report: runReport(prevBest, prevBestWave), wave: G.wave, kills: G.kills, score: G.score, gold: earned, base: base, bonus: bonus, mult: gm, time: G.runTime, gems: G.runGems | 0, sulfur: G.runSulfur | 0, basalt: G.runBasalt | 0, grubs: G.runGrubs | 0, iron: G.runIron | 0, argon: G.runArgon | 0 };
  screenFlash('#CF4433', 0.55, 0.9);
  addShake(24);
  SFX.over();
  vibrate([40, 40, 80]);
  burstParticles(P.x, P.y, 36, '#CF4433', 380, 7);
  G.deathFX = { t: 0, dur: 2.2 }; startSlowmo(1.5, 0.22, 0.1);
  setTimeoutish(showDeath, 0.8);
}

/* Reaching the end of wave 25 with Wildfire dead closes out the chapter.
   This pays out like a death (same 1%-of-score formula) but with a
   completion bonus on top, and never overwrites a death's own stats. */
function chapterComplete(){
  if (G.state === 'victory' || G.state === 'dead') return;
  G.state = 'victory';
  gfxClearAurora(); recalcStats();
  const gm = P.stats.goldMul;
  const COMPLETION_MUL = 1.5;
  const base = Math.floor(G.score * 0.002);
  const bonus = Math.floor(G.bonusGold);
  const earned = Math.max(1, Math.floor((base + bonus) * gm * COMPLETION_MUL));
  const d = Save.data;
  const prevBest = scoreInt(d.best), prevBestWave = d.bestWave | 0;
  d.gold += earned;
  d.runs = (d.runs | 0) + 1; d.runSave = null;
  d.totalKills = (d.totalKills | 0) + G.kills;
  d.gems = (d.gems | 0) + (G.runGems | 0);
  d.sulfur = (d.sulfur | 0) + (G.runSulfur | 0); d.basalt = (d.basalt | 0) + (G.runBasalt | 0); d.grubs = (d.grubs | 0) + (G.runGrubs | 0); d.iron = (d.iron | 0) + (G.runIron | 0); d.argon = (d.argon | 0) + (G.runArgon | 0);
  d.chaptersComplete = (d.chaptersComplete | 0) + 1;
  const hadPart = !!d.enginePart; if (G.wave >= 175) d.chapter7Complete = true; if (G.wave >= 200) d.chapter8Complete = true; if (G.wave >= 225) d.chapter9Complete = true; if (G.wave >= 250){ d.chapter10Complete = true; d.enginePart = true; } if (G.wave >= 275) d.chapter11Complete = true; if (G.wave >= 300){ d.chapter12Complete = true; d.mutationVial = true; } if (G.wave >= WAVES_PER_CHAPTER * MAIN_CHAPTERS) d.chapter13Complete = true; if (G.wave >= CHAPTER_LAST_WAVE) d.chapter14Complete = true; G.vialNew = false; G.enginePartNew = !hadPart && G.wave === 250;     /* finishing a chapter completes it and every one before it */     /* the Inferno's reward: a spaceship engine part */   /* finishing the last chapter counts every chapter before it */
  if (G.score > scoreInt(d.best)) d.best = G.score;
  if (G.wave > (d.bestWave | 0)) d.bestWave = G.wave;
  Save.write();
  G.lastRun = { report: runReport(prevBest, prevBestWave), wave: G.wave, kills: G.kills, score: G.score, gold: earned, base: base, bonus: bonus, mult: gm * COMPLETION_MUL, time: G.runTime, gems: G.runGems | 0, sulfur: G.runSulfur | 0, basalt: G.runBasalt | 0, grubs: G.runGrubs | 0, iron: G.runIron | 0, argon: G.runArgon | 0 };
  screenFlash('#FFD84D', 0.6, 1.0);
  addShake(20);
  SFX.transform();
  burstParticles(P.x, P.y, 50, '#FFD84D', 340, 7, { glow: true });
  burstParticles(P.x, P.y, 30, '#FFFFFF', 260, 5, { glow: true });
  setTimeoutish(showVictory, 1.3);   /* Chapter 9 is the last chapter for now: straight to the results screen */
}

function startAttract(){
  resetWorld();
  G.attract = true;
  G.wave = 3; G.score = 0; G.kills = 0;
  P.x = ARENA_W / 2; P.y = ARENA_H / 2; P.vx = 0; P.vy = 0;
  P.maxHp = 120; P.hp = 120; P.level = 1; P.xp = 0; P.xpNext = xpForLevel(1);
  P.dead = false; P.invuln = 0; P.rage = 0;
  recalcStats();
  takeCard('neck_whip'); takeCard('neck_whip'); takeCard('neck_whip');
  takeCard('thorn_halo'); takeCard('thorn_halo');
  G.pendingLevels = 0;
  buildDecor();
  SCEN.ch = 0;
  G.attractT = 0.6;
  G.wanderT = 0; G.wanderX = P.x; G.wanderY = P.y;
}

function attractInput(){
  G.wanderT -= 1 / 60;
  if (G.wanderT <= 0){
    G.wanderT = rand(1.1, 2.4);
    const t = nearestEnemy(P.x, P.y, 900);
    if (t && Math.random() < 0.6){ G.wanderX = t.x; G.wanderY = t.y; }
    else { G.wanderX = clamp(P.x + rand(-420, 420), 200, ARENA_W - 200); G.wanderY = clamp(P.y + rand(-420, 420), 200, ARENA_H - 200); }
  }
  const dx = G.wanderX - P.x, dy = G.wanderY - P.y;
  const d = Math.hypot(dx, dy);
  if (d < 40) return { x: 0, y: 0, m: 0 };
  return { x: dx / d, y: dy / d, m: 1 };
}
function attractSpawn(dt){
  G.attractT -= dt;
  if (G.attractT <= 0){
    G.attractT = rand(0.6, 1.4);
    if (G.enemies.length < 12){
      const p = spawnPoint();
      spawnEnemy(Math.random() < 0.72 ? 'hyena' : 'cheetah', p.x, p.y, 3);
    }
  }
}

/* ========================= 36. HUD ========================= */
let hudSig = '';
/* The loadout strip is only rebuilt when its signature changes, and an empty
   loadout has the same signature ('') as the "reset" value used to -- so a new
   run never noticed the old chips were stale until the first card was taken.
   Clearing the DOM directly, and using a signature nothing can equal, fixes it. */
function resetLoadoutHUD(){
  hudSig = null;
  const l = document.getElementById('loadout');
  if (l) l.innerHTML = '';
}
/* The HUD is DOM, and a write that changes nothing still makes the browser check styles, so each value below is written only
   when it differs from the last one written (cached per element id). Only updateHUD writes these elements. */
const _hudC = {};
function hudTxt(id, v){ if (_hudC['t' + id] !== v){ _hudC['t' + id] = v; el(id).textContent = v; } }
function hudW(id, v){ if (_hudC['w' + id] !== v){ _hudC['w' + id] = v; el(id).style.width = v; } }
function hudCls(id, v){ if (_hudC['c' + id] !== v){ _hudC['c' + id] = v; el(id).className = v; } }
function updateHUD(){
  const hpP = clamp(P.hp / P.maxHp, 0, 1) * 100;
  const xpP = clamp(P.xp / P.xpNext, 0, 1) * 100;
  hudW('hpfill', hpP.toFixed(1) + '%');
  hudW('xpfill', xpP.toFixed(1) + '%');
  hudTxt('hpTxt', Math.max(0, Math.ceil(P.hp)) + ' / ' + Math.round(P.maxHp));
  hudTxt('xpTxt', 'Level ' + P.level + (G.pendingLevels > 0 && G.levelGate > 0 ? ' \u00b7 ' + G.pendingLevels + ' to pick in ' + Math.ceil(G.levelGate) + 's' : ''));
  hudTxt('hWave', String(G.wave));
  hudTxt('hChapter', G.chapter === DOME_CHAPTER ? 'CH.13.5 THE DOMES' : G.chapter === 13 ? 'CH.13 MARS' : G.chapter === 12 ? 'CH.12 AREA 51' : G.chapter === 11 ? 'CH.11 GLIMMER' : G.chapter === 10 ? 'CH.10 INFERNO' : G.chapter === 9 ? 'CH.9 VENUS' : G.chapter === 8 ? 'CH.8 THE MOON' : G.chapter === 7 ? 'CH.7 SPACE CENTER' : G.chapter === 6 ? 'CH.6 HOUSTON' : G.chapter === 5 ? 'CH.5 THE CANOPY' : G.chapter === 4 ? 'CH.4 THE DEEP' : G.chapter === 3 ? 'CH.3 MURKFEN' : G.chapter === 2 ? 'CH.2 FROSTREACH' : '');
  hudCls('hChapter', 'chaptag' + (G.chapter === DOME_CHAPTER ? ' dome' : G.chapter === 13 ? ' mars' : G.chapter === 12 ? ' a51' : G.chapter === 11 ? ' glim' : G.chapter === 10 ? ' inferno' : G.chapter === 9 ? ' venus' : G.chapter === 8 ? ' moon' : G.chapter === 7 ? ' space' : G.chapter === 6 ? ' city' : G.chapter === 5 ? ' jungle' : G.chapter === 4 ? ' ocean' : G.chapter === 3 ? ' swamp' : G.chapter === 2 ? ' snow' : ''));
  hudTxt('hSpeed', G.runSpeed ? '\u00d7' + runSpeedMul() + (G.runSpeedLevel === 3 ? ' ULTRAFAST' : G.runSpeedLevel === 2 ? ' HYPERSPEED' : ' SPEED') : '');
  /* the score and kill counters roll up to their new value instead of jumping */
  const sc = G._dispScore === undefined || G.score < G._dispScore ? G.score : G._dispScore + (G.score - G._dispScore) * 0.25;
  const kc = G._dispKills === undefined || G.kills < G._dispKills ? G.kills : G._dispKills + (G.kills - G._dispKills) * 0.35;
  G._dispScore = Math.abs(G.score - sc) < 1 ? G.score : sc; G._dispKills = Math.abs(G.kills - kc) < 0.5 ? G.kills : kc;
  hudTxt('hScore', fmt(G._dispScore));
  hudTxt('hKills', fmt(G._dispKills));
  const slowOn = !!(Input.hasTouch && trinketEquipped('peacefullune')), slowCd = P.slowCd > 0;
  if (_hudC.slowOn !== slowOn){ _hudC.slowOn = slowOn; SLOWBTN.classList.toggle('on', slowOn); }
  if (_hudC.slowCd !== slowCd){ _hudC.slowCd = slowCd; SLOWBTN.classList.toggle('cd', slowCd); }

  let sig = '';
  for (let i = 0; i < P.cards.length; i++) sig += P.cards[i].def.id + P.cards[i].level + '|';
  if (sig !== hudSig){
    hudSig = sig;
    let h = '';
    for (let i = 0; i < P.cards.length; i++){
      const c = P.cards[i]; if (c.hidden) continue;
      h += '<div class="chip' + (c.def.combo ? ' fused' : '') + (c.def.rarity === 'legendary' ? ' legend' : '') + (c.tier === 2 ? ' t2' : c.tier === 1 ? ' t1' : '') + '" data-ci="' + i + '">' +
           ico(c.form.icon, c.form.color) + '<em>' + c.level + '</em></div>';
    }
    el('loadout').innerHTML = h;
  }
  if (G.runTime < 11 && G.state === 'playing' && !Input.hasTouch)
    hudTxt('tips', keyName(keyOf('up')) + keyName(keyOf('left')) + keyName(keyOf('down')) + keyName(keyOf('right')) + ' to move. ' + (Settings.autoKick ? 'Auto-kick is on \u2014 aim with the cursor.' : 'Hold the mouse button to kick.') + ' Escape to pause.');
  else hudTxt('tips', '');
}

