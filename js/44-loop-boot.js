'use strict';
/* The main loop, resize, and the boot function. */
/* ========================= 38. LOOP ========================= */
let lastTS = 0, accDt = 0;
function frame(ts){
  window.requestAnimationFrame(frame);
  if (!lastTS) lastTS = ts;
  let dt = (ts - lastTS) / 1000;
  lastTS = ts;
  if (!(dt > 0)) dt = 0;
  /* a 120 or 144 Hz screen calls this twice as often as the game needs: the time is carried over, so it does no more than
     about 100 updates and draws a second (60 on a 120 Hz screen, 72 on a 144 Hz one) */
  accDt += dt;
  if (accDt < 0.0095) return;
  dt = accDt; accDt = 0;
  if (dt > 0.06) dt = 0.06;
  step(dt);
}

/* Speed mode: while a run is going, game time passes SPEED_MODE_MUL times
   faster than the clock on the wall. Everything that advances with the game's
   time step speeds up together -- the giraffe, enemies, ants, projectiles,
   cooldowns, the wave timers and the spawn schedule -- so a wave has exactly
   the same enemies, just arriving over a shorter stretch of real time.
   Scaling here (rather than inside each system) means nothing can be missed.
   Real-clock features (foraging and wheel-key cooldowns) are not part of it,
   and there are no bonus rewards: gold still comes purely from score. */
const SPEED_MODE_MUL = 1.1, HYPER_MODE_MUL = 1.3, ULTRA_MODE_MUL = 1.6, HYPER_CLUSTER = 0.55;
/* Hyperspeed is speed mode turned up: time runs 1.3x, and each wave's enemies are also bunched into 55% of the usual spawn schedule */
function runSpeedMul(){ return G.runSpeedLevel === 3 ? ULTRA_MODE_MUL : G.runSpeedLevel === 2 ? HYPER_MODE_MUL : SPEED_MODE_MUL; }
function gameDt(dt, state){
  if (!G.runSpeed) return dt;   /* the mode the run STARTED with, not the live setting */
  return (state === 'playing' || state === 'transform' || state === 'chaptertrans' || state === 'dead') ? dt * runSpeedMul() : dt;
}
function step(dt){
  try { Pad.poll(dt); } catch (e) {}
  const s = G.state, rawDt = dt;
  dt = gameDt(dt, s) * timeScale(rawDt);
  if (G.deathFX){ G.deathFX.t += rawDt; if (G.deathFX.t > G.deathFX.dur + 1) G.deathFX = null; }
  if (G.reviveFX){ G.reviveFX.t += rawDt; if (G.reviveFX.t >= G.reviveFX.dur) G.reviveFX = null; }
  if (G.introFX){ if (s === 'playing') G.introFX.t += rawDt; if (G.introFX.t >= G.introFX.dur) G.introFX = null; }
  else if (G.bannerHold && s === 'playing'){ G.bannerHold.wait -= rawDt; if (G.bannerHold.wait <= 0){ const h = G.bannerHold; G.bannerHold = null; banner(h.title, h.sub, h.color, h.dur); } }
  if (s === 'playing') update(dt);
  else if (s === 'transform') updateTransform(dt);
  else if (s === 'chaptertrans') updateChapterTrans(dt);
  else if (s === 'forage') updateForage(dt);
  else if (s === 'mini') updateMini(rawDt);
  else if (s === 'scout') updateScout(dt);
  else if (s === 'mscout') updateMScout(dt);
  else if (s === 'cutscene') updateCutscene(dt);
  else if (s === 'menu' || s === 'shop' || s === 'help') update(dt);
  else {
    G.time += dt;
    updateTimers(dt);
    updateParticles(dt);
    if (G.banner){ G.banner.t += dt; if (G.banner.t >= G.banner.dur) G.banner = null; }
    if (G.flash){ G.flash.t += dt; if (G.flash.t >= G.flash.dur) G.flash = null; }
    if (G.shake > 0) G.shake = Math.max(0, G.shake - dt * 46);
  }
  refreshRoverBtn();
  if (s !== 'paused' && s !== 'cutscene') { try { Atmos.update(dt); } catch (e) {} }
  render();
  updateSquadHUD();
  try { Music.refresh(); } catch (e) {}
  try { Feedback.tick(rawDt); } catch (e) {}
  if (s === 'playing' || s === 'levelup' || s === 'transform' || s === 'chaptertrans' || s === 'paused') updateHUD();
  refreshForageLabels();
  if (G.state === 'menu') drawMenuPreview();
}

/* ========================= 39. RESIZE & BOOT ========================= */
function resize(){
  const w = Math.max(280, window.innerWidth), h = Math.max(320, window.innerHeight);
  G.dpr = Math.min(window.devicePixelRatio || 1, 2) * (typeof Perf !== 'undefined' ? Perf.scale : 1);      /* the slow-device governor can lower the sharpness (js/44c-perf.js) */
  G.W = w; G.H = h;
  if (stage){
    stage.width = Math.round(w * G.dpr);
    stage.height = Math.round(h * G.dpr);
    stage.style.width = w + 'px';
    stage.style.height = h + 'px';
  }
  let z = clamp(h / 760, 0.6, 1.3);
  if (w / z < 520) z = w / 520;
  G.zoom = z;
  buildGradients();
}

function boot(){
  Save.load();
  Settings.load();
  resize();
  window.addEventListener('resize', resize);
  window.addEventListener('orientationchange', function(){ setTimeout(resize, 120); });
  if ('ontouchstart' in window || (navigator.maxTouchPoints | 0) > 0) Input.hasTouch = true;
  buildGround();
  buildGroundSnow();
  buildGroundSwamp();
  buildGroundOcean();
  buildGroundJungle();
  buildGroundCity();
  buildGroundSpace();
  buildGroundMoon();
  buildGroundVenus();
  buildGroundArea51();
  buildGroundMars();
  bindSpeedSlider();
  applyTextScale();
  bindInput();
  bindTips();
  startAttract();
  showSplash();                       /* one tap, which also wakes the audio; the menu follows */
  window.requestAnimationFrame(frame);
}

