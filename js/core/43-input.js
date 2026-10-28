'use strict';
/* Input: keyboard, mouse, touch, gamepad. */
/* ========================= 37. INPUT ========================= */
function screenToWorld(sx, sy){
  return { x: (sx - G.W / 2) / G.zoom + G.camX, y: (sy - G.H / 2) / G.zoom + G.camY };
}

function bindInput(){
  window.addEventListener('keydown', function(e){
    if (e.code === 'Tab') return;
    if (G.splash && G.state === 'menu'){ e.preventDefault(); splashGo(); return; }     /* any key on the title splash */
    if (!SFX.ready){ try { SFX.init(); SFX.resume(); } catch (err) {} }               /* wake the audio on the first key, not only the first click */
    if (captureKey(e)) return;
    if (G.state === 'cutscene'){ cutKey(e); e.preventDefault(); return; }
    const inField = e.target && ((e.target.tagName === 'INPUT' && e.target.type !== 'range') || e.target.tagName === 'TEXTAREA');
    if (!inField && Nav.overlayOpen()){
      const dd = { ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0], KeyW: [0, -1], KeyS: [0, 1], KeyA: [-1, 0], KeyD: [1, 0] }[e.code];
      const onRange = !!(document.activeElement && document.activeElement.type === 'range');
      if (dd && !(G.state === 'menu' && dd[1] === 0 && e.code.indexOf('Arrow') === 0) && !(onRange && dd[1] === 0)){ Nav.move(dd[0], dd[1]); e.preventDefault(); return; }
      if (e.code === 'Space' && Nav.click()){ e.preventDefault(); return; }
      if (e.code === 'Escape' && G.state !== 'paused' && G.state !== 'levelup' && Nav.back()){ e.preventDefault(); return; }
    }
    Input.keys[e.code] = true;
    if (G.state === 'menu' && (e.code === 'ArrowLeft' || e.code === 'ArrowRight')){
      handleAction(e.code === 'ArrowLeft' ? 'ch-prev' : 'ch-next');
      e.preventDefault(); return;
    }
    if (['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].indexOf(e.code) >= 0) e.preventDefault();
    if (G.state === 'levelup'){
      if (e.code === 'Digit1') chooseCard(0);
      else if (e.code === 'Digit2') chooseCard(1);
      else if (e.code === 'Digit3') chooseCard(2);
      else if (e.code === 'Digit4') chooseCard(3);
      else if (e.code === keyOf('reroll')) doReroll();
      return;
    }
    if (e.code === keyOf('stats') && !e.repeat){ if (G.state === 'playing'){ showPause(); showStats(); } else if (G.state === 'paused' && G.subScreen === 'stats') showPause(); }
    if (e.code === 'Escape' || e.code === keyOf('pause')){
      if (G.state === 'forage' && G.forage && !G.forage.done) endForage();
      if (G.state === 'mini' && G.mini && G.mini.phase !== 'done') miniEscape();
      if (G.state === 'scout' && G.scout && !G.scout.done) endScout('quit');
      if (G.state === 'mscout' && G.mscout && !G.mscout.done) endMScout('quit');
      if (G.state === 'town' && !(typeof townDialogOpen === 'function' && townDialogOpen()) && !Nav.overlayOpen() && typeof townEscape === 'function') townEscape();
      if (G.state === 'fly' && typeof flyLand === 'function') flyLand();
      if (G.state === 'playing') showPause();
      else if (G.state === 'paused') resumeGame();
    }
    if (e.code === keyOf('mute') && G.state !== 'town'){ Settings.muted = !Settings.muted; SFX.setMuted(Settings.muted); Settings.save(); refreshScreen(); }
    if (e.code === keyOf('kick') && G.state === 'playing') doKick();
    if (e.code === keyOf('slow')) tryTimeSlow();
    if (G.state === 'playing'){ for (let q = 1; q <= 5; q++) if (e.code === keyOf('squad' + q) || e.code === 'Numpad' + q) squadSummon(q - 1); }
    if (e.code === keyOf('rover') && !e.repeat) roverPress();
    if (e.code === 'Enter' && (G.state === 'menu' || G.state === 'dead') && !(document.activeElement && OV.contains(document.activeElement) && document.activeElement.tagName === 'BUTTON')) startRun();
  });
  window.addEventListener('keyup', function(e){ Input.keys[e.code] = false; });
  window.addEventListener('blur', function(){ Input.keys = {}; Input.mdown = false; if (Settings.autoPause && G.state === 'playing') showPause(); });
  document.addEventListener('visibilitychange', function(){ if (document.hidden && Settings.autoPause && G.state === 'playing') showPause(); else if (!document.hidden && G.state === 'playing') keepAwake(); });

  stage.addEventListener('mousemove', function(e){
    const w = screenToWorld(e.clientX, e.clientY);
    Input.mx = w.x; Input.my = w.y; Input.padUsed = false;
    const rc = stage.getBoundingClientRect();
    Input.sx = e.clientX - rc.left; Input.sy = e.clientY - rc.top;   /* screen position, for the foraging minigame */
  });
  stage.addEventListener('mousedown', function(e){
    if (G.state === 'cutscene'){ if (e.button === 0 && cutSkipHit(e.clientX, e.clientY)) endCutscene(); return; }
    if (e.button === 0){ Input.mdown = true; SFX.init(); SFX.resume(); }
  });
  window.addEventListener('mouseup', function(){ Input.mdown = false; });
  stage.addEventListener('contextmenu', function(e){ e.preventDefault(); });

  /* touch */
  let joyId = null, joyOX = 0, joyOY = 0;
  function joyStart(t){
    joyId = t.identifier;
    joyOX = t.clientX; joyOY = t.clientY;
    JOY.style.display = 'block';
    JOY.style.left = (joyOX - 66) + 'px';
    JOY.style.top = (joyOY - 66) + 'px';
    Input.joyActive = true; Input.joyX = 0; Input.joyY = 0;
  }
  function joyMove(t){
    const dx = t.clientX - joyOX, dy = t.clientY - joyOY;
    const d = Math.hypot(dx, dy);
    const rng = 52 * touchScaleNow();
    const m = Math.min(1, d / rng);
    if (d > 0.5){ Input.joyX = (dx / d) * m; Input.joyY = (dy / d) * m; }
    const k = JOY.firstElementChild;
    if (k){ k.style.transform = 'translate(' + (Input.joyX * 52) + 'px,' + (Input.joyY * 52) + 'px)'; }
  }
  function joyEnd(){
    joyId = null; Input.joyActive = false; Input.joyX = 0; Input.joyY = 0;
    JOY.style.display = 'none';
    const k = JOY.firstElementChild;
    if (k) k.style.transform = '';
  }
  function forageTouch(e){
    const t = e.changedTouches[0], rc = stage.getBoundingClientRect();
    if (t){ Input.sx = t.clientX - rc.left; Input.sy = t.clientY - rc.top; }
    if ((G.state === 'mini' || G.state === 'town' || G.state === 'fly' || G.state === 'sail') && e.type === 'touchstart') Input.mdown = true;     /* the minigames, the town and the sea read a held finger as a held button (js/minigames/44f-minigames.js, 44w-town-engine.js, 44zq-sea.js) */
    e.preventDefault();
  }
  stage.addEventListener('touchstart', function(e){
    if (Input.forceMouse) return;                          /* she plays with keyboard and mouse: a tap is left to become a click */
    if (!Settings.inputMode) Input.hasTouch = true;
    SFX.init(); SFX.resume();
    if (G.state === 'cutscene'){ const tc = e.changedTouches && e.changedTouches[0]; if (tc && cutSkipHit(tc.clientX, tc.clientY)) endCutscene(); e.preventDefault(); return; }
    if (G.state === 'forage' || G.state === 'mini' || G.state === 'town' || G.state === 'fly' || G.state === 'sail'){ forageTouch(e); return; }   /* the finger steers the neck; no joystick here */
    if (G.state === 'playing'){ TOUCH.classList.add('on'); PAUSEBTN.classList.add('on'); }
    for (let i = 0; i < e.changedTouches.length; i++){
      const t = e.changedTouches[i];
      if ((Settings.touchLeft ? t.clientX > window.innerWidth * 0.45 : t.clientX < window.innerWidth * 0.55) && joyId === null) joyStart(t);
      else if (G.state === 'playing' && !Settings.autoKick) doKick();
    }
    e.preventDefault();
  }, { passive: false });
  stage.addEventListener('touchmove', function(e){
    if (Input.forceMouse) return;
    if (G.state === 'forage' || G.state === 'mini' || G.state === 'town' || G.state === 'fly' || G.state === 'sail'){ forageTouch(e); return; }
    for (let i = 0; i < e.changedTouches.length; i++){
      const t = e.changedTouches[i];
      if (t.identifier === joyId) joyMove(t);
    }
    e.preventDefault();
  }, { passive: false });
  function endTouch(e){
    if (Input.forceMouse){ if (joyId !== null) joyEnd(); return; }
    if ((G.state === 'mini' || G.state === 'town' || G.state === 'fly' || G.state === 'sail') && (!e.touches || e.touches.length === 0)) Input.mdown = false;
    for (let i = 0; i < e.changedTouches.length; i++)
      if (e.changedTouches[i].identifier === joyId) joyEnd();
  }
  stage.addEventListener('touchend', endTouch);
  stage.addEventListener('touchcancel', endTouch);

  KICKBTN.addEventListener('touchstart', function(e){
    Input.touchKick = true; KICKBTN.classList.add('hit');
    if (G.state === 'playing') doKick();
    e.preventDefault(); e.stopPropagation();
  }, { passive: false });
  KICKBTN.addEventListener('touchend', function(e){
    Input.touchKick = false; KICKBTN.classList.remove('hit');
    e.preventDefault(); e.stopPropagation();
  });
  SLOWBTN.addEventListener('touchstart', function(e){
    SLOWBTN.classList.add('hit');
    tryTimeSlow();
    e.preventDefault(); e.stopPropagation();
  }, { passive: false });
  const ROVERBTN = document.getElementById('roverbtn');
  ROVERBTN.addEventListener('touchstart', function(e){ roverPress(); e.preventDefault(); e.stopPropagation(); }, { passive: false });
  SLOWBTN.addEventListener('touchend', function(e){
    SLOWBTN.classList.remove('hit');
    e.preventDefault(); e.stopPropagation();
  });
  PAUSEBTN.addEventListener('click', function(e){
    e.stopPropagation();
    if (G.state === 'playing') showPause(); else if (G.state === 'paused') resumeGame();
  });

  /* hold a buy button to keep buying; the click that ends a hold is swallowed */
  let holdT = null, holdI = null, holdFired = 0, holdClicking = false;
  function stopHold(){ if (holdT){ clearTimeout(holdT); holdT = null; } if (holdI){ clearInterval(holdI); holdI = null; } }
  OV.addEventListener('pointerdown', function(e){
    Nav.on = false;
    if (!SFX.ready){ try { SFX.init(); SFX.resume(); } catch (err) {} }
    const t = e.target.closest('[data-buy],[data-vbuy],[data-mbuy]');
    if (!t || t.disabled) return;
    const attr = t.hasAttribute('data-buy') ? 'data-buy' : t.hasAttribute('data-vbuy') ? 'data-vbuy' : 'data-mbuy', id = t.getAttribute(attr);
    stopHold();
    holdT = setTimeout(function(){
      holdI = setInterval(function(){
        const el = OV.querySelector('[' + attr + '="' + id + '"]');
        if (!el || el.disabled){ stopHold(); return; }
        holdClicking = true; el.click(); holdClicking = false; holdFired = Date.now();
      }, 120);
    }, 450);
  });
  ['pointerup', 'pointercancel', 'pointerleave'].forEach(function(n){ OV.addEventListener(n, stopHold); });
  OV.addEventListener('click', function(e){ if (!holdClicking && Date.now() - holdFired < 350){ e.stopPropagation(); e.preventDefault(); } }, true);

  OV.addEventListener('click', function(e){
    const t = e.target.closest('[data-a],[data-card],[data-buy],[data-crate],[data-equip],[data-unequip],[data-trinket],[data-vbuy],[data-mbuy],[data-ship],[data-city]');
    if (!t || t.disabled) return;
    SFX.init(); SFX.resume();
    if (t.dataset.card !== undefined){ chooseCard(parseInt(t.dataset.card, 10)); return; }
    if (t.dataset.buy !== undefined){ buyUpgrade(t.dataset.buy); return; }
    if (t.dataset.city !== undefined){ const cid = t.dataset.city; if (buyCityItem(cid)){ SFX.buy(); const it = CITY_BY_ID[cid]; if (it && it.film){ startCutscene(function(){ showShop('city'); }, false, it.film); return; } } else SFX.deny(); showShop('city'); return; }
    if (t.dataset.ship !== undefined){ if (buyShipStage(t.dataset.ship)) SFX.buy(); else SFX.deny(); showVenus('ship'); return; }
    if (t.dataset.vbuy !== undefined){ if (buyVenus(t.dataset.vbuy)) SFX.buy(); else SFX.deny(); showVenus(); return; }
    if (t.dataset.mbuy !== undefined){ if (buyMars(t.dataset.mbuy)) SFX.buy(); else SFX.deny(); showMars(); return; }
    if (t.dataset.crate !== undefined){ buyCrate(t.dataset.crate); return; }
    if (t.dataset.equip !== undefined){
      if (equipGear(t.dataset.equip)) SFX.buy(); else SFX.deny();
      showShop(); return;
    }
    if (t.dataset.unequip !== undefined){
      unequipSlot(t.dataset.unequip); SFX.click(); showShop(); return;
    }
    if (t.dataset.trinket !== undefined){
      if (toggleTrinket(t.dataset.trinket)) SFX.buy(); else SFX.deny();
      showShop(); return;
    }
    handleAction(t.dataset.a);
  });
}

function refreshScreen(){
  if (G.state === 'menu') showMenu();
  else if (G.state === 'shop') (G.subScreen === 'fusionmachine' ? showFusionMachine() : G.labScreen ? showLab() : G.marsScreen ? showMars() : G.venusScreen ? showVenus() : showShop());
  else if (G.state === 'help') (G.subScreen === 'settings' ? showSettings() : G.subScreen === 'gallery' ? showGallery() : showHelp());
  else if (G.state === 'paused') (G.subScreen === 'settings' ? showSettings() : G.subScreen === 'stats' ? showStats() : showPause());
}

/* Best-effort fullscreen for touch devices only -- desktop players clicking
   "Start a run" would not expect the browser chrome to vanish on them.
   Must be called synchronously from within a user gesture (it is, here:
   handleAction runs inside the overlay's own click handler), and must
   never throw or block play if the API is missing or refuses (iOS Safari
   on iPhone has no Fullscreen API at all, for instance). */
function tryFullscreen(){
  if (!Input.hasTouch) return;
  const el = document.documentElement;
  const req = el.requestFullscreen || el.webkitRequestFullscreen || el.mozRequestFullScreen || el.msRequestFullscreen;
  if (!req) return;
  try { const p = req.call(el); if (p && p.catch) p.catch(function(){}); } catch (e) {}
}

function handleAction(a){
  if (a === 'splash-go'){ splashGo(); return; }
  if (a === 'input-touch' || a === 'input-mouse'){ Settings.inputMode = a === 'input-touch' ? 'touch' : 'mouse'; applyInputMode(); Settings.save(); SFX.click(); showMenu(); return; }
  if (a.indexOf('film-') === 0){ SFX.click(); startCutscene(showGallery, false, a.slice(5)); return; }
  if (a.indexOf('buymax-') === 0){ buyUpgradeMax(a.slice(7)); return; }
  if (a === 'bind-reset'){ Settings.keys = {}; G.rebinding = null; Settings.save(); SFX.click(); showSettings(); return; }
  if (a.indexOf('bind-') === 0){ G.rebinding = a.slice(5); SFX.click(); showSettings(); return; }
  if (a === 'stats'){ SFX.click(); showStats(); return; }
  if (a === 'stats-back'){ SFX.click(); showPause(); return; }
  if (a === 'fusion-open' || a === 'fusion-menu'){ SFX.click(); G.fuseSel = []; G.fuseFrom = a === 'fusion-menu' ? 'menu' : ''; showFusionMachine(); return; }
  if (a === 'fusion-back'){ SFX.click(); G.subScreen = ''; if (G.fuseFrom === 'menu'){ G.fuseFrom = ''; showMenu(); } else showShop('city'); return; }
  if (a.indexOf('fuse-pick-') === 0){ const id = a.slice(10); G.fuseSel = G.fuseSel || []; const at = G.fuseSel.indexOf(id); if (at >= 0) G.fuseSel.splice(at, 1); else { if (G.fuseSel.length >= 2) G.fuseSel.shift(); G.fuseSel.push(id); } SFX.click(); showFusionMachine(); return; }
  if (a === 'fuse-do'){ const s = G.fuseSel || []; if (s.length === 2 && unlockCombo(s[0], s[1])){ SFX.buy(); SFX.level(); } else SFX.deny(); showFusionMachine(); return; }
  if (a === 'fuse-tab-machine' || a === 'fuse-tab-codex'){ G.fuseTab = a === 'fuse-tab-codex' ? 'codex' : 'machine'; SFX.click(); showFusionMachine(); return; }
  if (a.indexOf('fuse-filter-') === 0){ G.cxFilter = a.slice(12); SFX.click(); showFusionMachine(); return; }
  if (a.indexOf('fuse-view-') === 0){ const p = a.slice(10).split('~'); if (p.length === 2 && FUSE_INFO[p[0]] && FUSE_INFO[p[1]]){ G.fuseSel = [p[0], p[1]]; G.fuseTab = 'machine'; } SFX.click(); showFusionMachine(); return; }
  if (a.indexOf('fuse-claim-') === 0){ if (claimMilestone(parseInt(a.slice(11), 10))){ SFX.buy(); SFX.level(); } else SFX.deny(); showFusionMachine(); return; }
  if (a === 'wardrobe' || a.indexOf('ward-') === 0){ if (typeof handleWardAction === 'function') handleWardAction(a); return; }       /* coat colors (js/ui/44e-wardrobe.js) */
  if (a.indexOf('mini-') === 0){ if (typeof handleMiniAction === 'function' && handleMiniAction(a)) return; }                        /* minigames (js/minigames/44f-minigames.js) */
  if (a.indexOf('town-') === 0){ if (typeof handleTownAction === 'function' && handleTownAction(a)) return; }                      /* Longneck Town (js/town/44x-town-ui.js) */
  /* actions that start with the testing prefix belong to a separate testing tool that is not part of the published game; without it they simply do nothing */
  if (a.indexOf('debug-') === 0){ if (typeof handleDebugAction === 'function') handleDebugAction(a); return; }
  switch (a){
    case 'continue': { const r = Save.data.runSave; if (!validRunSave(r)){ SFX.deny(); showMenu(); break; } SFX.click(); tryFullscreen(); startRun(null, r.wave, r); break; }
    case 'settings': SFX.click(); showSettings(); break;
    case 'settings-back': SFX.click(); G.rebinding = null; G.subScreen = ''; if (G.state === 'paused') showPause(); else showMenu(); break;
    case 'gallery': SFX.click(); showGallery(); break;
    case 'gallery-back': SFX.click(); G.subScreen = ''; showMenu(); break;
    case 's-mute': Settings.muted = !Settings.muted; SFX.setMuted(Settings.muted); Settings.save(); SFX.click(); showSettings(); break;
    case 's-auto': Settings.autoKick = !Settings.autoKick; Settings.save(); SFX.click(); showSettings(); break;
    case 's-aim': Settings.aimMode = Settings.aimMode === 'cursor' ? 'move' : 'cursor'; Settings.save(); SFX.click(); showSettings(); break;
    case 's-perf': Settings.autoPerf = !Settings.autoPerf; if (!Settings.autoPerf && typeof Perf !== 'undefined') Perf.reset(); Settings.save(); SFX.click(); showSettings(); break;
    case 's-fx': Settings.fxLevel = (fxLevelSetting() + 1) % 3; if (typeof Perf !== 'undefined') Perf.reset(); Settings.save(); SFX.click(); showSettings(); break;
    case 's-gear': Settings.showGear = !Settings.showGear; Settings.save(); SFX.click(); showSettings(); break;
    case 's-npcvoice': Settings.npcVoice = Settings.npcVoice === false; Settings.save(); SFX.click(); if (Settings.npcVoice && typeof NPCVoice !== 'undefined') NPCVoice.demo('mayor'); showSettings(); break;
    case 's-calm': Settings.calmFlash = !Settings.calmFlash; Settings.save(); SFX.click(); showSettings(); break;
    case 's-text': Settings.textScale = ((Settings.textScale | 0) + 1) % 3; applyTextScale(); Settings.save(); SFX.click(); showSettings(); break;
    case 's-bread': Settings.autoBread = Settings.autoBread === false; Settings.save(); SFX.click(); showSettings(); break;
    case 's-autopause': Settings.autoPause = !Settings.autoPause; Settings.save(); SFX.click(); showSettings(); break;
    case 's-input': Settings.inputMode = Input.hasTouch ? 'mouse' : 'touch'; applyInputMode(); Settings.save(); SFX.click(); showSettings(); break;
    case 's-side': Settings.touchLeft = !Settings.touchLeft; applyTouchLayout(); Settings.save(); SFX.click(); showSettings(); break;
    case 'play': SFX.click(); tryFullscreen(); startRun(); break;
    case 'play2': SFX.click(); tryFullscreen(); startRun(2); break;
    case 'play3': SFX.click(); tryFullscreen(); startRun(3); break;
    case 'play4': SFX.click(); tryFullscreen(); startRun(4); break;
    case 'play5': SFX.click(); tryFullscreen(); startRun(5); break;
    case 'play6': SFX.click(); tryFullscreen(); startRun(6); break;
    case 'play7': SFX.click(); tryFullscreen(); startRun(7); break;
    case 'play8': SFX.click(); tryFullscreen(); startRun(8); break;
    case 'play9': SFX.click(); tryFullscreen(); startRun(9); break;
    case 'play10': SFX.click(); tryFullscreen(); startRun(10); break;
    case 'play11': SFX.click(); tryFullscreen(); startRun(11); break;
    case 'play12': SFX.click(); tryFullscreen(); startRun(12); break;
    case 'play13': SFX.click(); tryFullscreen(); startRun(13); break;
    case 'play16': SFX.click(); tryFullscreen(); startCutscene(function(){ startRun(SIEGE_CHAPTER); }, false, 'siegeflight'); break;        /* Chapter 15 opens with the flight home, over the smoke */
    case 'play15': SFX.click(); tryFullscreen(); startCutscene(function(){ startRun(TOWER_CHAPTER); }, false, 'towerflight'); break;        /* Chapter 14 opens with the arrival at the tower */
    case 'play14': SFX.click(); tryFullscreen(); startCutscene(function(){ startRun(DOME_CHAPTER); }, false, 'domeflight'); break;        /* Chapter 13.5 opens with the helicopter film */
    case 'shop': SFX.click(); crateResult = null; showShop(); break;
    case 'venus': SFX.click(); showVenus(); break;
    case 'venus-tab-scout': SFX.click(); showVenus('scout'); break;
    case 'venus-tab-work': SFX.click(); showVenus('work'); break;
    case 'venus-tab-ship': SFX.click(); showVenus('ship'); break;
    case 'ship-launch': SFX.click(); if (!startHomeFlight()) SFX.deny(); break;
    case 'venus-scout': SFX.click(); if (!startScout()) showMenu(); break;
    case 'mars': SFX.click(); showMars(); break;
    case 'lab': SFX.click(); labLast = null; showLab(); break;
    case 'lab-use': { const m = useVial(); if (m){ labLast = m; SFX.level(); } else SFX.deny(); showLab(); break; }
    case 'squad-hire-0': case 'squad-hire-1': case 'squad-hire-2': case 'squad-hire-3': case 'squad-hire-4': hireSquad(+a.slice(11)); showShop('ants'); break;
    case 'mars-tab-scout': SFX.click(); showMars('scout'); break;
    case 'mars-tab-work': SFX.click(); showMars('work'); break;
    case 'mars-scout': SFX.click(); if (!startMScout()) showMenu(); break;
    case 'tab-upgrades': SFX.click(); crateResult = null; showShop('upgrades'); break;
    case 'tab-gear': SFX.click(); showShop('gear'); break;
    case 'tab-ants': SFX.click(); crateResult = null; showShop('ants'); break;
    case 'tab-wheel': SFX.click(); wheelResult = null; showShop('wheel'); break;
    case 'tab-city': SFX.click(); showShop('city'); break;
    case 'city-lift': SFX.click(); if (chapterUnlocked(11)){ tryFullscreen(); startRun(11); } else SFX.deny(); break;
    case 'spin-wheel': spinWheelUI(); break;
    case 'ant-food': makeFood(1); showShop('ants'); break;
    case 'ant-food-5': makeFood(5); showShop('ants'); break;
    case 'ant-food-x': {
      const el = document.getElementById('foodAmt');
      makeFood(Math.max(1, Math.floor(parseFloat(el && el.value) || 1)));
      showShop('ants');
      break;
    }
    case 'hire-soldier': hireAnt('soldier'); showShop('ants'); break;
    case 'hire-distractor': hireAnt('distractor'); showShop('ants'); break;
    case 'hire-shooter': hireAnt('shooter'); showShop('ants'); break;
    case 'menu': SFX.click(); startAttract(); showMenu(); break;
    case 'help': SFX.click(); showHelp(); break;
    case 'ch-prev': if (menuChapter() > 1){ SFX.click(); setMenuChapter(menuChapter() - 1); showMenu(); } break;
    case 'ch-next': if (menuChapter() < TOTAL_CHAPTERS){ SFX.click(); setMenuChapter(menuChapter() + 1); showMenu(); } break;
    case 'forage': SFX.click(); startForage(); break;
    case 'bestiary': SFX.click(); showBestiary(); break;
    case 'bst-creatures': SFX.click(); showBestiary('creatures'); break;
    case 'bst-cards': SFX.click(); showBestiary('cards'); break;
    case 'resume': SFX.click(); resumeGame(); break;
    case 'reroll': doReroll(); break;
    case 'quit': SFX.click(); gameOver(); break;
    case 't-auto': Settings.autoKick = !Settings.autoKick; Settings.save(); showHelp(); SFX.click(); break;
    case 't-aim': Settings.aimMode = Settings.aimMode === 'cursor' ? 'move' : 'cursor'; Settings.save(); showHelp(); SFX.click(); break;
    case 't-mute': Settings.muted = !Settings.muted; SFX.setMuted(Settings.muted); Settings.save(); showHelp(); SFX.click(); break;
    case 't-auto-live': Settings.autoKick = !Settings.autoKick; Settings.save(); showPause(); SFX.click(); break;
    case 't-gear': Settings.showGear = !Settings.showGear; Settings.save(); showHelp(); SFX.click(); break;
    case 'speed-0': case 'speed-1': case 'speed-2': case 'speed-3':
      if (G.state !== 'menu'){ SFX.deny(); break; }
      Settings.speedLevel = +a.slice(6); Settings.speedMode = Settings.speedLevel > 0; Settings.save(); SFX.click(); showMenu();
      break;
    case 't-gear-live': Settings.showGear = !Settings.showGear; Settings.save(); showPause(); SFX.click(); break;
    case 't-mute-live': Settings.muted = !Settings.muted; SFX.setMuted(Settings.muted); Settings.save(); showPause(); SFX.click(); break;
    case 'wipe': SFX.click(); confirmWipe(); break;
    case 'wipe-yes': Save.reset(); Settings.load(); recalcStats(); SFX.buy(); showShop(); break;
    case 'wipe-no': SFX.click(); showShop(); break;
  }
}

function confirmWipe(){
  setOverlay(
    '<div class="panel slab" style="max-width:430px">' +
      '<h2 class="head">Erase all progress</h2>' +
      '<p class="sub">This clears everything: your gold and gems, every upgrade, your gear and trinkets, your ants, the bestiary, your photo album, outfits and accessories, and your Longneck Town progress. Your settings stay. It cannot be undone.</p>' +
      '<div class="row"><button class="btn sm" data-a="wipe-no">Keep my progress</button>' +
      '<button class="btn sm ghost" data-a="wipe-yes">Erase everything</button></div>' +
    '</div>');
}


function buyUpgrade(id){
  const m = METAMAP[id];
  if (!m) return;
  if (m.requires && !Save.data[m.requires]){ SFX.deny(); return; }
  const lv = metaLevel(id);
  if (lv >= m.max){ SFX.deny(); return; }
  const cost = metaCost(m, lv);
  if (Save.data.gold < cost){ SFX.deny(); return; }
  Save.data.gold -= cost;
  Save.data.meta[id] = lv + 1;
  Save.write();
  recalcStats();
  SFX.buy();
  showShop();
}

