'use strict';
/* Pacing and presentation: the title splash, one-time hints, fades, boss entrances, wave-clear beat, number count-ups,
   text size, and the kick's wind-up. */
/* ========================= 38b. FEEDBACK AND PACING ========================= */
/* Hooks: Feedback.tick(rawDt) from step(), drawFeedbackOverlays(ctx) from drawScreenFX, overlayPolish(...) from setOverlay,
   hideOverlay() fades out here via overlayLeave(). Settings it reads: calmFlash, textScale (see 10-settings.js). */

/* ---- a fade in from dark, for the moments where the whole picture changes ---- */
function screenFadeIn(d){ if (G.attract && G.state !== 'menu') return; G.fadeIn = { t: 0, dur: d || 0.4 }; }
function drawFade(ctx){
  const f = G.fadeIn; if (!f) return;
  const a = 1 - f.t / f.dur;
  if (a <= 0){ G.fadeIn = null; return; }
  ctx.fillStyle = 'rgba(8,6,5,' + (a * a).toFixed(3) + ')'; ctx.fillRect(0, 0, G.W, G.H);
}

/* ---- the title splash: one tap, which also wakes the audio so the menu music is there from the start ---- */
function showSplash(){
  G.state = 'menu'; G.attract = true; G.subScreen = ''; G.splash = true;
  HUD.classList.remove('on'); PAUSEBTN.classList.remove('on'); TOUCH.classList.remove('on');
  setOverlay(
    '<button class="splashbtn" data-a="splash-go">' +
      '<span class="marquee display">GIRAFFE<br>RAMPAGE</span>' +
      '<span class="splashprompt">' + (Input.hasTouch ? 'Tap to begin' : 'Click or press any key') + '</span>' +
    '</button>', true);
}
function splashGo(){
  if (!G.splash) return;
  G.splash = false;
  try { SFX.init(); SFX.resume(); } catch (e) {}
  SFX.click();
  if (!Settings.inputMode){ showInputChoice(); return; }       /* the first time: how is she playing? */
  showMenu();
}
/* asked once, then kept in Settings (changed under Controls there): it decides every control tip and whether the touch buttons show */
function showInputChoice(){
  G.state = 'menu'; G.attract = true; G.subScreen = 'inputchoice';
  const guess = inputAuto() ? 'touch' : 'mouse';
  setOverlay(
    '<div class="panel slab" style="max-width:460px">' +
      '<h2 class="head">How are you playing?</h2>' +
      '<p class="sub">The tips and buttons on screen will match. You can change this any time in Settings.</p>' +
      '<div class="menucol" style="width:100%;margin-top:12px">' +
        '<button class="btn' + (guess === 'touch' ? '' : ' ghost') + '" data-a="input-touch">Touch screen' + (guess === 'touch' ? ' (this looks like it)' : '') + '</button>' +
        '<button class="btn' + (guess === 'mouse' ? '' : ' ghost') + '" data-a="input-mouse">Keyboard and mouse' + (guess === 'mouse' ? ' (this looks like it)' : '') + '</button>' +
      '</div>' +
    '</div>');
}

/* ---- one-time hints: a short note the first time something happens, never again ---- */
const HINTS = {
  move:    { touch: 'Drag on the left of the screen to move. Your giraffe kicks on its own.', key: 'Move with the movement keys and aim with the mouse. Your giraffe kicks on its own.' },
  cards:   { any: 'Every level gives a card. Take the same card again to level it up; at level 5 it transforms.' },
  combo:   { any: 'A combo merges two maxed cards into one new power. Level it twice more for a special upgrade.' },
  lowhp:   { any: 'Low health. Hearts drop from enemies, and a cleared wave pulls every drop to you.' },
  boss:    { any: 'A boss. Keep moving, and watch the ground: red marks show where it is about to strike.' },
  cleared: { any: 'Wave cleared. Everything that dropped is pulled to you before the next one.' }
};
const Hint = {
  el: null, hideT: 0, wait: 0,
  seen(id){ return !!(Save.data.hintsSeen && Save.data.hintsSeen[id]); },
  show(id){
    if (this.seen(id) || this.hideT > 0) return false;
    const H = HINTS[id]; if (!H) return false;
    const text = Input.hasTouch ? (H.touch || H.any) : (H.key || H.any);
    if (!this.el){ this.el = document.createElement('div'); this.el.id = 'hint'; document.body.appendChild(this.el); }
    this.el.textContent = text; this.el.className = 'on';
    this.hideT = 6;
    if (!Save.data.hintsSeen) Save.data.hintsSeen = {};
    Save.data.hintsSeen[id] = 1; Save.write();
    return true;
  },
  tick(dt){
    /* a hint belongs to the moment it was shown for: it goes at once when a menu, pause or film takes the screen */
    if (this.hideT > 0 && G.state !== 'playing' && G.state !== 'levelup' && G.state !== 'transform'){ this.hideT = 0; if (this.el) this.el.className = ''; return; }
    if (this.hideT > 0){
      this.hideT -= dt;
      if (this.hideT <= 0 && this.el) this.el.className = '';
      return;
    }
    if (G.attract || G.splash) return;
    const s = G.state;
    if (s === 'playing'){
      if (G.bossIntro) return;                         /* nothing talks over a boss entrance */
      if (G.runTime > 2.5 && G.runTime < 40 && !G.introFX && this.show('move')) return;
      if (P.hp > 0 && P.hp / P.maxHp < 0.35 && this.show('lowhp')) return;
      if (G.bossAlive && G.boss && !G.bossIntro && this.show('boss')) return;
      if (G.waveState === 'clear' && G.runTime > 10 && this.show('cleared')) return;
    } else if (s === 'levelup'){
      if (G.offer && G.offer.some(function(o){ return o.def && o.def.combo; }) && this.show('combo')) return;
      if (this.show('cards')) return;
    }
  }
};

/* ---- a boss walks in: the camera drifts toward it, time slows for a moment, a name card slides across ---- */
function startBossIntro(e){
  if (G.attract || !e || !e.def) return false;
  G.bossIntro = { t: 0, dur: 2.6, boss: e, name: String(e.def.title || 'Boss'), sub: 'Kill it before it kills you' };
  startSlowmo(1.0, 0.35, 0);
  SFX.stomp();
  if (typeof Mix !== 'undefined') Mix.roarAt(e);                  /* its own voice, panned to where it stands */
  return true;
}
/* how far the camera has drifted toward the boss (0..1); render() reads this */
function bossIntroPull(){
  const b = G.bossIntro; if (!b || !b.boss || b.boss.dead) return 0;
  return 0.3 * Math.sin(Math.PI * clamp(b.t / b.dur, 0, 1));
}
function drawBossIntro(ctx){
  const b = G.bossIntro; if (!b) return;
  const k = clamp(b.t / b.dur, 0, 1), W = G.W, H = G.H;
  const inK = Math.min(1, k / 0.16), outK = k > 0.82 ? (k - 0.82) / 0.18 : 0, a = (1 - outK) * Math.min(1, k / 0.1);
  const bar = H * 0.085 * inK * (1 - outK);
  ctx.fillStyle = '#0A0706'; ctx.fillRect(0, 0, W, bar); ctx.fillRect(0, H - bar, W, bar);
  if (a <= 0.02) return;
  const slide = (1 - Math.min(1, k / 0.22)) * 90, size = Math.min(54, Math.max(26, W * 0.05)), y = H * 0.74;
  ctx.save(); ctx.globalAlpha = a; ctx.textAlign = 'center';
  ctx.font = '700 ' + Math.max(11, size * 0.26) + 'px ui-sans-serif, "Segoe UI", Roboto, sans-serif';
  ctx.lineWidth = 4; ctx.strokeStyle = 'rgba(10,7,6,.9)'; ctx.lineJoin = 'round';
  ctx.strokeText('BOSS', W / 2 - slide, y - size * 0.95);
  ctx.fillStyle = '#FF7A62'; ctx.fillText('BOSS', W / 2 - slide, y - size * 0.95);
  ctx.font = '900 ' + size + 'px "Arial Black", "Helvetica Neue", Impact, sans-serif';
  ctx.lineWidth = 7; ctx.strokeStyle = 'rgba(10,7,6,.92)'; ctx.lineJoin = 'round';
  ctx.strokeText(b.name.toUpperCase(), W / 2 + slide, y); ctx.fillStyle = '#F0E6D2'; ctx.fillText(b.name.toUpperCase(), W / 2 + slide, y);
  const lw = Math.min(300, W * 0.5) * Math.min(1, k / 0.35);
  ctx.fillStyle = '#CF4433'; ctx.fillRect(W / 2 - lw / 2, y + size * 0.22, lw, 3);
  ctx.font = '600 ' + Math.max(12, size * 0.26) + 'px ui-sans-serif, "Segoe UI", Roboto, sans-serif';
  ctx.fillStyle = '#C9BCA4'; ctx.fillText(b.sub, W / 2, y + size * 0.72);
  ctx.restore();
}

/* ---- a wave is cleared: a ring of light, a chime, and every drop on the field is drawn in ---- */
function waveClearFX(){
  if (G.attract) return;
  SFX.clear();
  P.magnetT = 2.4;
  if (fxLevelNow() > 0){
    addParticle(P.x, P.y + 14, 0, 0, 70, 1.1, 'rgba(255,226,150,0.85)', { shape: 'wake', drag: 0, shrink: false });
    for (let i = 0; i < 20; i++){
      const a = Math.random() * TAU, s = rand(50, 200);
      addParticle(P.x, P.y, Math.cos(a) * s, Math.sin(a) * s - 70, rand(2, 4), rand(0.6, 1.1), i % 3 ? '#FFE6A0' : '#FFFFFF', { glow: true, drag: 1.4 });
    }
  }
}

/* ---- a run's save when a chapter's finale is cleared: it points at the start of what comes next, not at the boss again ---- */
function saveRunAtBoundary(keepCards){
  try {
    if (G.attract || G.noSnap || P.dead || typeof runSnapshot !== 'function') return;
    const s = runSnapshot();
    s.wave = G.wave + 1; s.chapter = chapterOf(s.wave);
    if (!keepCards){ s.cards = []; s.level = 1; s.xp = 0; s.xpNext = xpForLevel(1); s.pending = 0; }
    s.hp = P.maxHp;
    if (s.wave <= CHAPTER_LAST_WAVE){ Save.data.runSave = s; Save.write(); }
  } catch (e) {}
}

/* ---- the kick's visual wind-up and follow-through: pull back, snap out, ease home (0 at rest, 1 at full extension) ---- */
function kickReach(){
  if (!(P.kickAnim > 0)) return 0;
  const e = 1 - P.kickAnim / 0.30;
  if (e < 0.12) return -0.3 * Math.sin(e / 0.12 * Math.PI / 2);
  if (e < 0.32){ const u = (e - 0.12) / 0.2; return -0.3 + 1.3 * (1 - Math.pow(1 - u, 3)); }
  return 0.5 + 0.5 * Math.cos(Math.min(1, (e - 0.32) / 0.68) * Math.PI);
}

/* ---- numbers that count up, on result screens ---- */
function parseCompact(txt){
  const m = /^(-?[\d,.]+)\s*([kMB])?$/.exec(String(txt).trim()); if (!m) return null;
  const n = parseFloat(m[1].replace(/,/g, '')); if (isNaN(n)) return null;
  return n * ({ k: 1e3, M: 1e6, B: 1e9 }[m[2]] || 1);
}
let _countRun = 0;
function animateCounters(nodes){
  const run = ++_countRun, items = [];
  for (let i = 0; i < nodes.length; i++){
    const n = nodes[i], full = n.textContent, v = parseCompact(full);
    if (v === null || v < 5) continue;
    items.push({ n: n, full: full, v: v }); n.textContent = '0';
  }
  if (!items.length) return;
  const t0 = performance.now();
  /* a timer, not a frame callback, plus a hard stop: the real numbers always end up on screen even if the page is throttled */
  const finish = function(){ for (let i = 0; i < items.length; i++) items[i].n.textContent = items[i].full; };
  const iv = setInterval(function(){
    if (run !== _countRun){ clearInterval(iv); return; }
    const now = performance.now(); let busy = false;
    for (let i = 0; i < items.length; i++){
      const it = items[i], k = clamp((now - t0 - i * 70) / 800, 0, 1);
      if (k < 1){ busy = true; it.n.textContent = fmt(it.v * (1 - Math.pow(1 - k, 3))); }
      else it.n.textContent = it.full;
    }
    if (!busy) clearInterval(iv);
  }, 40);
  setTimeout(function(){ if (run === _countRun){ clearInterval(iv); finish(); } }, 1200);
}

/* ---- called after every overlay is drawn ---- */
function overlayPolish(entering){
  OV.inert = false;
  if (entering && !(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches)){
    const sums = OV.querySelectorAll('.summary .sum b');
    if (sums.length) animateCounters(sums);
  }
}
/* ---- called when the overlay is closed: it fades out instead of vanishing, and cannot be clicked while it does ---- */
let _leaveT = null;
function overlayLeave(){
  if (_leaveT){ clearTimeout(_leaveT); _leaveT = null; }
  if (!OV.innerHTML){ OV.className = ''; return; }
  OV.className = 'leaving'; OV.inert = true;
  _leaveT = setTimeout(function(){
    _leaveT = null;
    if (OV.className === 'leaving'){ OV.className = ''; OV.innerHTML = ''; OV.inert = false; }
  }, 170);
}

/* ---- text size ---- */
function applyTextScale(){
  const n = Settings.textScale | 0;
  document.body.classList.toggle('ts1', n === 1);
  document.body.classList.toggle('ts2', n === 2);
}

const Feedback = {
  tick(rawDt){
    if (G.fadeIn) G.fadeIn.t += rawDt;
    if (G.bossIntro){
      if (G.state === 'playing') G.bossIntro.t += rawDt;
      if (G.bossIntro.t >= G.bossIntro.dur) G.bossIntro = null;
    }
    Hint.tick(rawDt);
    if (typeof Amb !== 'undefined') Amb.update(rawDt);
    /* the health bar pulses when she is nearly dead */
    const bars = document.getElementById('bars');
    if (bars){
      const low = G.state === 'playing' && !G.attract && P.hp > 0 && P.hp / P.maxHp < 0.3;
      if (low !== Feedback._low){ Feedback._low = low; bars.classList.toggle('lowhp', low); }
    }
  },
  _low: false
};
function drawFeedbackOverlays(ctx){ drawBossIntro(ctx); if (typeof drawEdgeFX === 'function') drawEdgeFX(ctx); drawFade(ctx); }
