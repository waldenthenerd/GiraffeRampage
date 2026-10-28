'use strict';
/* Quality of life: navigation, settings screens, gallery, save/continue, touch layout, developer panel, actions. */
/* ========================= 34b. QUALITY OF LIFE ========================= */
/* ---- keyboard / gamepad menu navigation: focus moves between the overlay's buttons by position ---- */
const Nav = {
  on: false,
  sig(el){
    if (!el || !OV.contains(el)) return null;
    for (let i = 0; i < el.attributes.length; i++){ const a = el.attributes[i]; if (a.name.indexOf('data-') === 0) return '[' + a.name + '="' + String(a.value).replace(/"/g, '\\"') + '"]'; }
    return el.id ? '#' + el.id : null;
  },
  /* put focus back after the screen is drawn again; if that button is gone or has just gone gray (bought the last one, spun the last key), focus the nearest one to where it was */
  restore(sig, rect){
    try { const el = OV.querySelector(sig); if (el && !el.disabled){ el.focus({ preventScroll: true }); return; } } catch (e) {}
    if (!rect) return;
    const L = this.list(); if (!L.length) return;
    const cx = rect.left + rect.width / 2, cy = rect.top + rect.height / 2; let best = null, bd = 1e12;
    for (let i = 0; i < L.length; i++){ const r = L[i].getBoundingClientRect(), d = Math.hypot(r.left + r.width / 2 - cx, r.top + r.height / 2 - cy); if (d < bd){ bd = d; best = L[i]; } }
    if (best) best.focus({ preventScroll: true });
  },
  list(){
    return Array.prototype.filter.call(OV.querySelectorAll('button, input[type=range], input[type=number], summary'), function(el){
      if (el.disabled) return false;
      const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0;
    });
  },
  move(dx, dy){
    const L = this.list(); if (!L.length) return false;
    this.on = true;
    const cur = document.activeElement;
    if (!cur || !OV.contains(cur) || L.indexOf(cur) < 0){
      const first = L.find(function(b){ return b.classList.contains('btn') && !b.classList.contains('ghost'); }) || L[0];
      first.focus({ preventScroll: false }); return true;
    }
    const cr = cur.getBoundingClientRect(), cx = cr.left + cr.width / 2, cy = cr.top + cr.height / 2;
    let best = null, bs = 1e9;
    for (let i = 0; i < L.length; i++){
      const el = L[i]; if (el === cur) continue;
      const r = el.getBoundingClientRect(), ex = r.left + r.width / 2 - cx, ey = r.top + r.height / 2 - cy;
      const along = ex * dx + ey * dy; if (along <= 2) continue;
      const perp = Math.abs(ex * dy - ey * dx), s = along + perp * 2.2;
      if (s < bs){ bs = s; best = el; }
    }
    if (best){ best.focus({ preventScroll: true }); try { best.scrollIntoView({ block: 'nearest' }); } catch (e) {} }
    return true;
  },
  click(){ const a = document.activeElement; if (a && OV.contains(a) && (a.tagName === 'BUTTON' || a.tagName === 'SUMMARY') && !a.disabled){ a.click(); return true; } return false; },
  back(){ const b = OV.querySelector('[data-a="resume"],[data-a="settings-back"],[data-a="gallery-back"],[data-a="menu"],[data-a="mini-back"],[data-a="town-close"],[data-a="fish-book-back"],[data-a="fish-sea-close"],[data-a="back"]'); if (b && !b.disabled){ b.click(); return true; } return false; },
  overlayOpen(){ return OV.className.indexOf('on') >= 0 && G.state !== 'playing' && G.state !== 'cutscene'; }
};

/* ---- gamepad: sticks and buttons feed the same inputs as keyboard and touch ---- */
const Pad = {
  prev: [], kickHeld: false, rep: 0, dirOn: false,
  poll(dt){
    if (!navigator.getGamepads) return;
    let gp = null; const gps = navigator.getGamepads();
    for (let i = 0; i < gps.length; i++){ if (gps[i] && gps[i].connected){ gp = gps[i]; break; } }
    if (!gp){
      if (Input.padOn){ Input.padOn = false; Input.padBtn = false; Input.padX = 0; Input.padY = 0; Input.padAimOn = false; if (this.kickHeld){ this.kickHeld = false; Input.touchKick = false; } }
      return;
    }
    const prev = this.prev, self = this;
    const b = function(i){ const x = gp.buttons[i]; return !!(x && (x.pressed || x.value > 0.5)); };
    const edge = function(i){ return b(i) && !prev[i]; };
    const dz = function(v){ return Math.abs(v) < 0.22 ? 0 : v; };
    const ax = dz(gp.axes[0] || 0), ay = dz(gp.axes[1] || 0), rx = gp.axes[2] || 0, ry = gp.axes[3] || 0;
    const dpx = (b(15) ? 1 : 0) - (b(14) ? 1 : 0), dpy = (b(13) ? 1 : 0) - (b(12) ? 1 : 0);
    let anyBtn = false; for (let i = 0; i < gp.buttons.length; i++) if (b(i)) anyBtn = true;
    if (ax || ay || dpx || dpy || Math.hypot(rx, ry) > 0.3 || anyBtn) Input.padUsed = true;
    const st = G.state;
    Input.padOn = true;
    Input.padBtn = b(0) || b(2);                                       /* the minigames read the main pad buttons as their one button */
    Input.padX = ax || dpx; Input.padY = ay || dpy;
    Input.padAimOn = Math.hypot(rx, ry) > 0.35 && st === 'playing';
    if (Input.padAimOn) Input.padAimAng = Math.atan2(ry, rx);

    if (st === 'playing' || st === 'scout' || st === 'mscout'){
      const kickNow = b(0) || b(7) || b(5);
      if (kickNow && !this.kickHeld){ this.kickHeld = true; Input.touchKick = true; }
      else if (!kickNow && this.kickHeld){ this.kickHeld = false; Input.touchKick = false; }
      if (st === 'playing'){
        if (edge(9)) showPause();
        if (edge(1) || edge(4)) tryTimeSlow();
        if (edge(2)) roverPress();
      } else if (edge(2)) roverPress();
    } else {
      if (this.kickHeld){ this.kickHeld = false; Input.touchKick = false; }
      if (st === 'cutscene'){
        if (edge(0) || edge(1) || edge(9)) endCutscene();
      } else if (Nav.overlayOpen()){
        if (st === 'paused' && edge(9)){ resumeGame(); }
        else {
          const mx = Math.abs(ax || dpx) > 0.5 ? Math.sign(ax || dpx) : 0, my = !mx && Math.abs(ay || dpy) > 0.5 ? Math.sign(ay || dpy) : 0;
          if (mx || my){
            this.rep -= dt;
            if (!this.dirOn || this.rep <= 0){
              const cur = document.activeElement;
              if (mx && cur && cur.type === 'range' && OV.contains(cur)){
                const step = +cur.step || 1; cur.value = String(+cur.value + mx * step * 2);
                cur.dispatchEvent(new Event('input', { bubbles: true })); cur.dispatchEvent(new Event('change', { bubbles: true }));
              } else Nav.move(mx, my);
              this.rep = this.dirOn ? 0.13 : 0.38; this.dirOn = true;
            }
          } else { this.dirOn = false; this.rep = 0; }
          if (edge(0)){ if (!Nav.click()) Nav.move(0, 1); }
          if (edge(1)) Nav.back();
        }
      }
    }
    this.prev = gp.buttons.map(function(x){ return !!x.pressed; });
  }
};

/* ---- hold to keep buying, and a Buy max button for the gold upgrades ---- */
function maxAffordable(m){
  let lv = metaLevel(m.id), gold = Save.data.gold, n = 0;
  while (lv < m.max && n < 30){ const c = metaCost(m, lv); if (gold < c) break; gold -= c; lv++; n++; }
  return n;
}
function buyUpgradeMax(id){
  const m = METAMAP[id];
  if (!m || (m.requires && !Save.data[m.requires])){ SFX.deny(); return; }
  let bought = 0;
  while (bought < 30){
    const lv = metaLevel(id);
    if (lv >= m.max) break;
    const cost = metaCost(m, lv);
    if (Save.data.gold < cost) break;
    Save.data.gold -= cost; Save.data.meta[id] = lv + 1; bought++;
  }
  if (!bought){ SFX.deny(); return; }
  Save.write(); recalcStats(); SFX.buy(); showShop();
}

/* ---- settings ---- */
function sliderRowHTML(id, label, small, pct, min){
  return '<div class="kv" style="width:100%"><div>' + label + '<small>' + small + '</small></div>' +
    '<div style="display:flex;align-items:center;gap:8px"><input id="' + id + '" type="range" min="' + (min || 0) + '" max="100" step="5" value="' + pct + '" style="width:120px">' +
    '<span id="' + id + 'Val" style="min-width:38px;text-align:right">' + pct + '%</span></div></div>';
}
function toggleRowHTML(action, label, small, on, txtOn, txtOff){
  return '<div class="kv"><div>' + label + '<small>' + small + '</small></div>' +
    '<button class="toggle' + (on ? ' on' : '') + '" data-a="' + action + '">' + (on ? (txtOn || 'On') : (txtOff || 'Off')) + '</button></div>';
}
function wireSlider(id, apply, lo){
  const sl = document.getElementById(id); if (!sl) return;
  sl.addEventListener('input', function(){
    const v = clamp((+sl.value || 0) / 100, lo || 0, 1);
    apply(v);
    const l = document.getElementById(id + 'Val'); if (l) l.textContent = Math.round((+sl.value || 0)) + '%';
  });
  sl.addEventListener('change', function(){ Settings.save(); });
}
function showSettings(){
  if (G.state !== 'paused'){ G.state = 'help'; G.attract = true; }
  G.subScreen = 'settings';
  const s = Settings, pct = function(v){ return Math.round(v * 100); };
  setOverlay(
    '<div class="panel slab wide" style="max-width:540px">' +
      '<h2 class="head">Settings</h2>' +
      '<p class="sub">Changes save as you make them.</p>' +
      '<div style="margin-top:6px">' +
        '<div class="sub" style="margin:10px 0 2px;font-weight:700;color:var(--sun)">Sound</div>' +
        toggleRowHTML('s-mute', 'Sound', 'Everything is made in the browser. M also mutes.', !s.muted) +
        sliderRowHTML('setMusic', 'Music volume', 'Background music.', pct(s.musicVol)) +
        sliderRowHTML('setFx', 'Effects volume', 'Kicks, hits, pickups and menus.', pct(s.sfxVol)) +
        sliderRowHTML('setAmb', 'Ambience volume', 'Wind, rain, thunder and the sounds of each place.', pct(s.ambVol)) +
        toggleRowHTML('s-npcvoice', 'NPC voices', 'Townsfolk babble in short blips as they speak, each with a voice of their own.', s.npcVoice !== false) +
        '<div class="sub" style="margin:14px 0 2px;font-weight:700;color:var(--sun)">Play</div>' +
        toggleRowHTML('s-auto', 'Auto-kick', 'Kick fires on cooldown without holding a button.', s.autoKick) +
        toggleRowHTML('s-aim', 'Aiming', 'Aim at the cursor, or at the nearest enemy.', s.aimMode === 'cursor', 'Cursor', 'Nearest') +
        toggleRowHTML('s-gear', 'Show gear on giraffe', 'Only changes how the giraffe looks.', s.showGear, 'Shown', 'Hidden') +
        toggleRowHTML('s-autopause', 'Pause when away', 'Pause the run if the window loses focus.', s.autoPause) +
        toggleRowHTML('s-bread', 'Eat bread by itself', 'Bread from the bakery in Longneck Town heals 5% of health, once every 15 seconds. When this is on, a loaf is eaten automatically when health is below three quarters.', s.autoBread !== false) +
        '<div class="kv" style="width:100%"><div>Level-up delay<small>Seconds of play after a round of card picks before the next one opens. 0 is no delay, the normal setting is 5.</small></div>' +
          '<div style="display:flex;align-items:center;gap:8px"><input id="setGap" type="range" min="0" max="20" step="1" value="' + (s.levelGap | 0) + '" style="width:120px">' +
          '<span id="setGapVal" style="min-width:38px;text-align:right">' + (s.levelGap | 0) + 's</span></div></div>' +
        '<div class="sub" style="margin:14px 0 2px;font-weight:700;color:var(--sun)">Screen</div>' +
        toggleRowHTML('s-fx', 'Visual effects', 'Lighting, weather and depth effects. Turn them down on a slow device.', fxLevelSetting() > 0, ['Low', 'Medium', 'High'][fxLevelSetting()], ['Low', 'Medium', 'High'][fxLevelSetting()]) +
        toggleRowHTML('s-perf', 'Adapt to slow devices', 'If the game cannot keep up, it lowers sharpness and effects by itself, and brings them back when it can.', s.autoPerf !== false) +
        sliderRowHTML('setFlash', 'Hit flash', 'How white enemies flash when struck.', pct(s.hitFlash)) +
        toggleRowHTML('s-calm', 'Reduce flashes', 'Softens full-screen flashes, lightning and bright bursts.', !!s.calmFlash) +
        toggleRowHTML('s-text', 'Text size', 'Makes menus and the HUD larger.', (s.textScale | 0) > 0, ['Normal', 'Large', 'Larger'][s.textScale | 0], 'Normal') +
        '<div class="sub" style="margin:14px 0 2px;font-weight:700;color:var(--sun)">Controls</div>' +
        toggleRowHTML('s-input', 'How you play', 'Touch screen, or keyboard and mouse. The tips and buttons on screen follow this.', !!Input.hasTouch, 'Touch', 'Keyboard & mouse') +
        '<div class="sub" style="margin:14px 0 2px;font-weight:700;color:var(--sun)">Touch controls</div>' +
        toggleRowHTML('s-side', 'Joystick side', 'The joystick takes one half of the screen, the buttons the other.', !s.touchLeft, 'Left', 'Right') +
        sliderRowHTML('setTouch', 'Control size', 'Size of the buttons and joystick. 50% is the normal size, 100% is 30% bigger.', pct(s.touchScale), 50) +
        '<div class="sub" style="margin:14px 0 2px;font-weight:700;color:var(--sun)">Keyboard controls</div>' +
        keysSectionHTML() +
        '<div class="sub" style="margin:14px 0 2px;font-weight:700;color:var(--sun)">Controller and menus</div>' +
        '<ul class="helplist"><li>Controller: <b>left stick</b> moves, <b>right stick</b> aims, <b>A</b> / <b>RT</b> kicks, <b>B</b> slows time, <b>X</b> rover, <b>Start</b> pauses. In menus use the stick or D-pad, <b>A</b> to choose and <b>B</b> to go back.</li>' +
        '<li>Keyboard menus: arrow keys or WASD move between buttons, Enter chooses, Esc goes back.</li></ul>' +
      '</div>' +
      '<div class="row stickyback" style="margin-top:18px"><button class="btn sm" data-a="settings-back">Back</button></div>' +
    '</div>');
  wireSlider('setMusic', function(v){ s.musicVol = v; try { Music.refresh(); } catch (e) {} });
  wireSlider('setFx', function(v){ s.sfxVol = v; SFX.setFx(v); });
  wireSlider('setAmb', function(v){ s.ambVol = v; });
  const gap = document.getElementById('setGap');
  if (gap){
    gap.addEventListener('input', function(){
      s.levelGap = clamp(Math.round(+gap.value || 0), 0, 20);
      const l = document.getElementById('setGapVal'); if (l) l.textContent = s.levelGap + 's';
      if (G.levelGate > s.levelGap) G.levelGate = s.levelGap;                    /* a wait already running is cut down to the new setting */
    });
    gap.addEventListener('change', function(){ Settings.save(); });
  }
  wireSlider('setFlash', function(v){ s.hitFlash = v; });
  wireSlider('setTouch', function(v){ s.touchScale = v; applyTouchLayout(); }, 0.5);
}
function applyTouchLayout(){
  const sc = clamp(Settings.touchScale, 0.5, 1) * 1.0;
  TOUCH.style.setProperty('--ts', String(0.7 + sc * 0.6));        /* 50% -> 1.0x, 100% -> 1.3x */
  TOUCH.classList.toggle('lefty', !!Settings.touchLeft);
  document.body.classList.toggle('lefty', !!Settings.touchLeft);                                  /* the bread, corn, fish and crab buttons move to the other side, away from KICK */
  JOY.style.transform = 'scale(' + (0.7 + sc * 0.6) + ')';
}
function touchScaleNow(){ return 0.7 + clamp(Settings.touchScale, 0.5, 1) * 0.6; }

/* ---- the films gallery ---- */
function filmList(){
  const d = Save.data, L = [];
  const cap = function(s){ return s.charAt(0) + s.slice(1).toLowerCase(); };
  [1, 2, 3, 4, 5, 6].forEach(function(n){ if (SH_FILMS[n]) L.push({ kind: 'sh' + n, title: 'To ' + cap(SH_FILMS[n].title), sub: SH_FILMS[n].sub, un: !!d['chapter' + n + 'Complete'] }); });
  L.push({ kind: 'moon', title: 'Leaving Earth', sub: 'The long climb off the planet.', un: !!d.chapter7Complete });
  L.push({ kind: 'venus', title: 'To Venus', sub: 'Across the dark and down into the clouds.', un: !!d.chapter8Complete });
  if (SH_FILMS[9]) L.push({ kind: 'sh9', title: 'To ' + cap(SH_FILMS[9].title), sub: SH_FILMS[9].sub, un: !!d.chapter9Complete });
  L.push({ kind: 'home', title: 'The Homecoming', sub: 'The spaceplane flies home.', un: !!d.homecoming });
  L.push({ kind: 'a51', title: 'Area 51', sub: 'Down through the Nevada night.', un: !!d.chapter11Complete });
  L.push({ kind: 'mars', title: 'To Mars', sub: 'The vial points off the Earth.', un: !!d.chapter12Complete });
  L.push({ kind: 'mships', title: 'The Marines Arrive', sub: 'Ships come down through the red sky.', un: (d.bestWave | 0) >= 315 });
  L.push({ kind: 'fusion', title: 'The Fusion Machine', sub: 'Building the Card Fusion Machine.', un: cityLevel('c_fusion') > 0 });
  L.push({ kind: 'marshome', title: 'Home from Mars', sub: 'The long way back to the lab.', un: !!d.chapter13Complete });
  L.push({ kind: 'domeflight', title: 'The Mirrored Domes', sub: 'The town helicopter, and a ring of foil-covered domes.', un: !!d.chapter13Complete });
  L.push({ kind: 'domeout', title: 'The Long Flight to New York', sub: 'The domes light up, and the trail goes north.', un: !!d.chapter14Complete });
  L.push({ kind: 'towerflight', title: 'The Tower', sub: 'The helicopter comes in over New York, and the glass tower.', un: !!d.chapter14Complete });
  L.push({ kind: 'towerout', title: 'Out the Top', sub: 'The vial, the paraglider, and a second helicopter.', un: !!d.chapter15Complete });
  L.push({ kind: 'siegeflight', title: 'Smoke Over Longneck Town', sub: 'The helicopter brings her home, and the militia hold the edge of town.', un: !!d.chapter15Complete });
  L.push({ kind: 'siegeout', title: 'The Morning After', sub: 'The Warden, the hatch in the Square, and one small drone going east.', un: !!d.chapter16Complete });
  return L;
}
function galleryButtonHTML(){
  const L = filmList(), n = L.filter(function(f){ return f.un; }).length;
  if (!n) return '';
  return '<button class="btn ghost" data-a="gallery">Films<small>' + n + ' of ' + L.length + ' unlocked</small></button>';
}
function showGallery(){
  G.state = 'help'; G.attract = true; G.subScreen = 'gallery';
  const L = filmList();
  let rows = '';
  for (let i = 0; i < L.length; i++){
    const f = L[i];
    rows += '<div class="shoprow' + (f.un ? '' : ' rowlocked') + '"><div class="ic">' + ico(f.un ? '@t-x-plane' : '@t-x-lock') + '</div>' +
      '<div class="txt"><div class="nm">' + (f.un ? f.title : 'Locked') + '</div><div class="ds">' + (f.un ? f.sub : 'Not seen yet.') + '</div></div>' +
      (f.un ? '<button class="btn sm buy" data-a="film-' + f.kind + '">Watch</button>' : '<div class="reqlock">Locked</div>') + '</div>';
  }
  setOverlay(
    '<div class="panel slab wide" style="max-width:560px">' +
      '<h2 class="head">Films</h2><p class="sub">Replay the cutscenes you have unlocked. ' + (Input.hasTouch ? 'Tap Skip to leave one early.' : 'Esc skips one.') + '</p>' +
      '<div class="shoplist">' + rows + '</div>' +
      '<div class="row" style="margin-top:18px"><button class="btn sm" data-a="gallery-back">Back to menu</button></div>' +
    '</div>');
}

/* ---- saving a run between waves ---- */
function runSnapshot(){
  const cards = [];
  for (let i = 0; i < P.cards.length; i++){ const c = P.cards[i]; if (c.hidden) continue; if (c.parts) cards.push(['@t-x-fusion', c.parts[0].def.id, c.parts[0].level, c.parts[1].def.id, c.parts[1].level, c.level]); else cards.push([c.def.id, c.level]); }
  return { v: 1, wave: G.wave, chapter: G.chapter, score: scoreInt(G.score), kills: G.kills | 0, bonusGold: G.bonusGold || 0, runTime: G.runTime || 0,
    speedLevel: G.runSpeedLevel | 0, rerolls: G.rerolls | 0, revives: G.revives | 0, pending: G.pendingLevels | 0,
    gems: G.runGems | 0, sulfur: G.runSulfur | 0, basalt: G.runBasalt | 0, grubs: G.runGrubs | 0, iron: G.runIron | 0, argon: G.runArgon | 0,
    level: P.level | 0, xp: P.xp || 0, xpNext: P.xpNext || 50, hp: P.hp || 1, marsShips: !!G.marsShipsSeen, sgHeld: G.sg ? G.sg.held | 0 : 0, cards: cards };
}
function saveRunNow(){
  if (G.attract || G.state !== 'playing' || P.dead || G.noSnap) return;
  try { Save.data.runSave = runSnapshot(); Save.write(); } catch (e) {}
}
function validRunSave(r){
  if (!(r && r.v === 1 && r.wave >= 1 && r.wave <= CHAPTER_LAST_WAVE && Array.isArray(r.cards))) return false;
  /* every number the restore uses is made a real, in-range number, so a damaged save cannot put NaN into the run */
  const num = function(k, lo, hi, d){ const v = +r[k]; r[k] = isFinite(v) ? Math.min(hi, Math.max(lo, v)) : d; };
  num('score', 0, 1e12, 0); num('kills', 0, 1e9, 0); num('bonusGold', 0, 1e12, 0); num('runTime', 0, 1e7, 0);
  num('speedLevel', 0, 3, 0); num('rerolls', 0, 99, 0); num('revives', 0, 99, 0); num('pending', 0, 40, 0);
  num('gems', 0, 1e9, 0); num('sulfur', 0, 1e9, 0); num('basalt', 0, 1e9, 0); num('grubs', 0, 1e9, 0); num('iron', 0, 1e9, 0); num('argon', 0, 1e9, 0);
  num('level', 1, 999, 1); num('xp', 0, 1e12, 0); num('xpNext', 1, 1e12, 50); num('hp', 1, 1e6, 1e6);          /* an unreadable health value restores as full health (the restore clamps it to the maximum) */
  r.wave = Math.round(r.wave);
  return true;
}
function restoreRun(r){
  P.cards.length = 0;
  for (let i = 0; i < r.cards.length; i++){
    if (r.cards[i][0] === '@t-x-fusion'){                                    /* a combo card: rebuild its two hidden parts and the combo */
      const ca = CARDMAP[r.cards[i][1]], cb = CARDMAP[r.cards[i][3]]; if (!ca || !cb) continue;
      const mk = function(def, lv){ const q = { def: def, level: Math.max(1, Math.min(10, lv | 0)), ang: 0, t: 0, tier: 0 }; if (def.init) def.init(q); refreshInst(q); P.cards.push(q); return q; };
      const pa = mk(ca, r.cards[i][2]), pb = mk(cb, r.cards[i][4]); if (!comboDefFor(ca.id, cb.id)) continue; const ci = makeComboInst(pa, pb); ci.level = Math.max(1, Math.min(3, r.cards[i][5] | 0 || 1)); refreshInst(ci); P.cards.push(ci); continue;
    }
    const id = r.cards[i][0], lv = Math.max(1, Math.min(10, r.cards[i][1] | 0));
    if (!CARDMAP[id]) continue;
    if (!ownedCard(id) && visibleCards().length >= maxCards()) continue;           /* a damaged save cannot hold more cards than the slots allow */
    for (let k = 0; k < lv; k++) takeCard(id);
  }
  G.score = r.score; G.kills = r.kills; G.bonusGold = r.bonusGold; G.runTime = r.runTime; G.sgHeldRestore = clamp(r.sgHeld | 0, 0, 24);        /* the Siege: how many waves she has held so far (the world is built after this) */
  G.runSpeedLevel = r.speedLevel | 0; G.runSpeed = G.runSpeedLevel > 0;
  G.rerolls = r.rerolls; G.revives = r.revives; G.pendingLevels = r.pending | 0;
  G.runGems = r.gems; G.runSulfur = r.sulfur; G.runBasalt = r.basalt; G.runGrubs = r.grubs; G.runIron = r.iron; G.runArgon = r.argon;
  G.marsShipsSeen = !!r.marsShips;
  P.level = Math.max(1, r.level); P.xp = r.xp; P.xpNext = r.xpNext;
  recalcStats();
  P.hp = Math.min(P.maxHp, Math.max(1, r.hp));
}
function continueButtonHTML(){
  const r = Save.data.runSave;
  if (!validRunSave(r)) return '';
  return '<button class="btn" data-a="continue" style="width:100%;margin:0 0 8px">Continue your run<small>Chapter ' + chapterLabel(r.chapter) + ', wave ' + r.wave + ' · ' + fmt(r.score) + ' points · level ' + r.level + '</small></button>';
}


function showMenu(){
  if (G.state !== 'menu' && G.state !== 'help' && G.state !== 'shop' && G.state !== 'paused') screenFadeIn(0.45);     /* coming back from a run or a film */
  G.splash = false;
  G.state = 'menu'; G.attract = true; G.subScreen = '';
  HUD.classList.remove('on');
  PAUSEBTN.classList.remove('on');
  TOUCH.classList.remove('on');
  const d = Save.data;
  const record = d.runs
    ? 'Best run: ' + fmt(d.best) + ' points, wave ' + d.bestWave + '. ' + fmt(d.totalKills) + ' kills across ' + d.runs + (d.runs === 1 ? ' run.' : ' runs.') +
      (d.chaptersComplete ? ' The full journey cleared ' + d.chaptersComplete + (d.chaptersComplete === 1 ? ' time.' : ' times.') : '')
    : 'No runs yet. The savanna is waiting.';
  setOverlay(
    '<div class="panel menu2">' +
      '<h1 class="marquee display">GIRAFF<span data-a="debug-e" style="cursor:default">E</span><br>RAMPAGE</h1>' +
      '<p class="tagline">Six meters of neck against everything the wild can send. Kick, collect cards, and see how far the journey goes.</p>' +
      continueButtonHTML() +
      '<div class="chwrap">' + chapterSelectorHTML() + '</div>' +
      '<div class="menurow">' +
        '<div class="mside l">' +
        '<button class="btn ghost" data-a="shop">Trading post<small>' + fmt(d.gold) + ' gold banked</small></button>' +
        venusButtonHTML() +
        marsButtonHTML() +
        labButtonHTML() +
        (cityLevel('c_fusion') > 0 ? '<button class="btn ghost" data-a="fusion-menu">Card Fusion Machine<small>' + comboCount() + ' of ' + allComboPairs().length + ' combos unlocked</small></button>' : '') +
        (typeof townButtonHTML === 'function' ? townButtonHTML() : '') +
        '</div><div class="mside r">' +
        '<button class="btn ghost" data-a="bestiary">Bestiary<small>' + (bestiaryCounts().creatures + bestiaryCounts().cards) + ' of ' + (BESTIARY_TOTAL_CREATURES + CARDS.length) + ' discovered</small></button>' +
        forageButtonHTML() +
        (typeof miniButtonHTML === 'function' ? miniButtonHTML() : '') +
        galleryButtonHTML() +
        (typeof wardrobeButtonHTML === 'function' ? wardrobeButtonHTML() : '') +
        '<button class="btn ghost" data-a="help">Guide<small>How to play, and how it all works</small></button>' +
        '<button class="btn ghost" data-a="settings">Settings<small>Sound, screen, touch</small></button>' +
        '</div>' +
      '</div>' +
      '<p class="sub mrecord" style="margin-top:18px;margin-bottom:0">' + record + '</p>' +
    '</div>', true);
  drawMenuPreview();
}

function showHelp(){
  G.state = 'help'; G.attract = true; G.subScreen = '';
  const s = Settings;
  const touch = Input.hasTouch;
  const moveLine = touch
    ? '<li><b>Move</b> with the joystick that appears wherever you touch the left side of the screen.</li>'
    : '<li><b>Move</b> with ' + keyName(keyOf('up')) + keyName(keyOf('left')) + keyName(keyOf('down')) + keyName(keyOf('right')) + ' or the arrow keys. You can change keys in Settings.</li>';
  const kickLine = touch
    ? '<li><b>Kick</b> the nearest threat automatically \u2014 leave auto-kick on, or tap the KICK button yourself.</li>'
    : '<li><b>Kick</b> toward your cursor. Hold the mouse button, or leave auto-kick on and it fires itself.</li>';
  const cardLine = touch
    ? '<li><b>Pick a card</b> by tapping it.</li>'
    : '<li><b>Pick a card</b> with the mouse or keys 1, 2 and 3. Press R to reroll.</li>';
  const pauseLine = touch
    ? '<li><b>Pause</b> with the button in the top-right corner.</li>'
    : '<li><b>Pause</b> with Escape or ' + keyName(keyOf('pause')) + '. Mute with ' + keyName(keyOf('mute')) + '. Stats with ' + keyName(keyOf('stats')) + '.</li>';
  /* Aim mode has no effect once there's touch input -- the kick always locks
     onto the nearest enemy then -- so the toggle is left out rather than
     shown as a control that visibly does nothing. */
  const aimRow = touch ? '' :
    '<div class="kv"><div>Aim<small>Point the neck at the cursor, or let it lock onto the closest enemy.</small></div>' +
      '<button class="toggle' + (s.aimMode === 'cursor' ? ' on' : '') + '" data-a="t-aim">' + (s.aimMode === 'cursor' ? 'Cursor' : 'Nearest') + '</button></div>';
  setOverlay(
    '<div class="panel slab">' +
      '<h2 class="head">How to play</h2>' +
      '<p class="sub">Survive waves. Every level gives you a card. Take the same card five times and it becomes something else entirely; ten times and it becomes something worse for everyone near you.</p>' +
      '<ul class="helplist">' +
        moveLine +
        kickLine +
        cardLine +
        pauseLine +
        '<li>Diamonds on a card mark levels 5 and 10 \u2014 the transformation points.</li>' +
        '<li>Dying banks 0.2% of your score as gold. Spend it at the trading post.</li>' +
        '<li><b>Speed mode</b> (the button beside Start on the main menu) makes time run ' + SPEED_MODE_MUL + '\u00d7 faster: you, enemies and ants all move faster and waves are shorter, with the same number of enemies. No bonus rewards. It is fixed once a run starts. Push the slider to <b>Hyperspeed</b> for ' + HYPER_MODE_MUL + '×, with each wave’s enemies also arriving much closer together. <b>Ultrafast</b> runs at ' + ULTRA_MODE_MUL + '×, enemies far off screen hurry in at 4×, and each wave arrives in just 2 to 5 short bursts.</li>' +
      '</ul>' +
      '<div style="margin-top:20px">' +
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
}
/* The hit-flash slider lives on both the How to Play and pause screens;
   one builder and one wiring function keep the two copies identical. */
function hitFlashRowHTML(){
  const v = Math.round(Settings.hitFlash * 100);
  return '<div class="kv" style="width:100%"><div>Hit flash<small>How white enemies flash when struck.</small></div>' +
    '<div style="display:flex;align-items:center;gap:8px"><input id="hitFlashSlider" type="range" min="0" max="100" step="5" value="' + v + '" style="width:120px">' +
    '<span id="hitFlashVal" style="min-width:38px;text-align:right">' + v + '%</span></div></div>';
}
function musicRowHTML(){
  const v = Math.round(Settings.musicVol * 100);
  return '<div class="kv" style="width:100%"><div>Music<small>Background music, made in the browser. Press M to mute everything.</small></div>' +
    '<div style="display:flex;align-items:center;gap:8px"><input id="musicSlider" type="range" min="0" max="100" step="5" value="' + v + '" style="width:120px">' +
    '<span id="musicVal" style="min-width:38px;text-align:right">' + v + '%</span></div></div>';
}
function wireMusicSlider(){
  const sl = document.getElementById('musicSlider');
  if (!sl) return;
  sl.addEventListener('input', function(){
    Settings.musicVol = clamp((+sl.value || 0) / 100, 0, 1);
    const lbl = document.getElementById('musicVal');
    if (lbl) lbl.textContent = Math.round(Settings.musicVol * 100) + '%';
    try { Music.refresh(); } catch (e) {}
  });
  sl.addEventListener('change', function(){ Settings.save(); });
}function wireHitFlashSlider(){
  const sl = document.getElementById('hitFlashSlider');
  if (!sl) return;
  sl.addEventListener('input', function(){
    Settings.hitFlash = clamp((+sl.value || 0) / 100, 0, 1);
    const lbl = document.getElementById('hitFlashVal');
    if (lbl) lbl.textContent = Math.round(Settings.hitFlash * 100) + '%';
  });
  sl.addEventListener('change', function(){ Settings.save(); });
}

let shopTab = 'upgrades';
let crateResult = null;
let gearSearchQuery = '';
function escAttr(str){ return String(str).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;'); }

function showShop(tab){
  const keepScroll = G.state === 'shop' && OV.classList.contains('on') && (!tab || tab === shopTab) ? OV.scrollTop : 0;   /* a buy redraws the page: stay where the player was */
  G.state = 'shop'; G.attract = true; G.subScreen = ''; G.venusScreen = false; G.marsScreen = false; G.labScreen = false;
  HUD.classList.remove('on');
  if (tab) shopTab = tab;
  if (shopTab === 'city' && !cityUnlocked()) shopTab = 'upgrades';
  setOverlay(
    '<div class="panel slab">' +
      '<div class="goldline">' +
        '<span class="goldnum">' + fmt(Save.data.gold) + '</span><span class="sub" style="margin:0">gold</span>' +
        '<span class="gemnum">' + fmt(Save.data.gems | 0) + '</span><span class="sub" style="margin:0">gems</span>' +
      '</div>' +
      '<h2 class="head">Trading post</h2>' +
      '<div class="tabs">' +
        '<button class="tab' + (shopTab === 'upgrades' ? ' on' : '') + '" data-a="tab-upgrades">Upgrades</button>' +
        '<button class="tab' + (shopTab === 'gear' ? ' on' : '') + '" data-a="tab-gear">Gear</button>' +
        '<button class="tab' + (shopTab === 'ants' ? ' on' : '') + '" data-a="tab-ants">Ants</button>' +
        '<button class="tab' + (shopTab === 'wheel' ? ' on' : '') + '" data-a="tab-wheel">Wheel</button>' +
        (cityUnlocked() ? '<button class="tab' + (shopTab === 'city' ? ' on' : '') + '" data-a="tab-city">City</button>' : '') +
      '</div>' +
      (shopTab === 'city' ? cityTabHTML() : shopTab === 'upgrades' ? upgradesTabHTML() : shopTab === 'ants' ? antsTabHTML() : shopTab === 'wheel' ? wheelTabHTML() : gearTabHTML()) +
      '<div class="row" style="margin-top:20px">' +
        '<button class="btn sm" data-a="play">Start a run</button>' +
        '<button class="btn sm ghost" data-a="menu">Back to menu</button>' +
        '<button class="btn sm ghost" data-a="wipe">Erase all progress</button>' +
      '</div>' +
    '</div>');
  if (keepScroll) OV.scrollTop = keepScroll;
  if (shopTab === 'gear'){
    const inp = document.getElementById('gearSearch');
    if (inp){
      inp.addEventListener('input', function(){
        gearSearchQuery = inp.value;
        const pos = inp.selectionStart;
        showShop('gear');
        const again = document.getElementById('gearSearch');
        if (again){ again.focus(); try { again.setSelectionRange(pos, pos); } catch (e) {} }
      });
    }
  }
}

const REQUIRES_LABEL = { chapter3Complete: 'Finish Chapter 3 to unlock', antsUnlocked: 'Unlock the ant colony first (100,000,000 score in one run)' };
function upgradesTabHTML(){
  let rows = '';
  for (let i = 0; i < META.length; i++){
    const m = META[i];
    const locked = !!(m.requires && !Save.data[m.requires]);
    const lv = metaLevel(m.id);
    const maxed = lv >= m.max;
    const cost = metaCost(m, lv);
    const can = !locked && Save.data.gold >= cost;
    let pip = '<div class="pips">';
    for (let k = 1; k <= m.max; k++) pip += '<span class="pip' + (k <= lv ? ' on' : '') + '"></span>';
    pip += '</div>';
    rows +=
      '<div class="shoprow' + (locked ? ' rowlocked' : '') + '">' +
        '<div class="ic">' + ico(m.icon) + '</div>' +
        '<div class="txt"><div class="nm">' + m.name + '</div>' +
          '<div class="ds">' + (locked ? (REQUIRES_LABEL[m.requires] || 'Locked')
            : (lv ? m.desc(lv) + (maxed ? '' : '. Next: ' + m.desc(lv + 1)) : m.desc(1) + ' at level 1')) + '</div>' + pip +
        '</div>' +
        (locked ? '<div class="reqlock">Locked</div>'
               : maxed ? '<div class="maxed">Maxed</div>'
               : '<button class="btn sm buy' + (can ? '' : ' ghost') + '" data-buy="' + m.id + '"' + (can ? '' : ' disabled') + '>' +
                 (can ? 'Buy for ' + fmt(cost) : fmt(cost) + ' gold') + '</button>') +
        (can && maxAffordable(m) >= 2 ? '<button class="btn sm ghost" data-a="buymax-' + m.id + '" title="Buy every level you can afford">Buy max (' + maxAffordable(m) + ')</button>' : '') +
      '</div>';
  }
  return '<p class="sub">Permanent upgrades, bought with gold. They apply to every run from here on.</p>' +
         '<div class="shoplist">' + rows + '</div>';
}

function trinketsHTML(){
  let out = '<div class="gpieces">';
  Object.keys(TRINKETS).forEach(id => {
    const t = TRINKETS[id];
    const owned = trinketOwned(id), isOn = trinketEquipped(id);
    out +=
      '<div class="gpiece' + (owned ? '' : ' locked') + (isOn ? ' on' : '') + '">' +
        '<div class="gs">' + ico(t.icon) + ' Trinket</div>' +
        '<div class="gn">' + (owned ? t.name : '???') + '</div>' +
        '<div class="gd">' + (owned ? t.desc : (t.source || 'Won only from the prize wheel')) + '</div>' +
        (owned
          ? '<button class="btn sm' + (isOn ? '' : ' ghost') + '" data-trinket="' + id + '">' + (isOn ? 'Unequip' : 'Equip') + '</button>'
          : '') +
      '</div>';
  });
  out += '</div>';
  return out;
}

function renderLevelUp(){
  const cards = G.offer.map(function(o, i){
    if (o.special){
      return '<button class="card evolve" data-card="' + i + '">' +
        '<div class="cicon">' + ico(o.icon, '#F2B33D') + '</div>' +
        '<div class="headwrap"><p class="cname">' + o.name + '</p><div class="ctag evolve">One-off</div></div>' +
        '<p class="cdesc">' + o.desc + '</p><div class="cdelta"></div></button>';
    }
    const def = o.def, inst = o.inst;
    const lv = inst ? inst.level : 0;
    const nextLv = lv + 1;
    const form = cardForm(def, nextLv);
    const tag = rarityLabel(def, lv, !inst);
    const isCombo = !!def.combo;
    const evolving = isCombo ? (!!inst && nextLv === 3) : (nextLv === 5 || nextLv === 10);
    const lines = inst ? deltaLines(def, lv) : [];
    const cls = evolving || isCombo ? 'evolve' : rarityClass(def.rarity);
    let delta = evolving ? (isCombo ? 'Gains its special upgrade: ' + def.cfg.capName + '.' : 'Everything about it changes.') : lines.join('<br>');
    if (isCombo && !inst){                                        /* what taking it costs and frees: the two parts vanish into it */
      const n = visibleCards().length;
      delta = 'Merges ' + def.parts.map(function(id){ return CARDMAP[id].forms[0].name; }).join(' + ') + '. They keep working but leave your list.<br>Card slots used: ' + n + ' to ' + (n - 1) + ' of ' + maxCards() + '.';
    }
    let pips = pipsHTML(lv, nextLv);
    if (isCombo){ pips = '<div class="pips">'; for (let q = 1; q <= 3; q++) pips += '<span class="pip' + (q === 3 ? ' gate' : '') + (q <= lv ? ' on' : '') + (q === 3 && nextLv === 3 ? ' next' : '') + '"></span>'; pips += '</div>'; }
    return '<button class="card ' + cls + '" data-card="' + i + '">' +
      '<div class="cicon">' + ico(form.icon, form.color) + '</div>' +
      '<div class="headwrap"><p class="cname">' + form.name + '</p><div class="ctag ' + tag.cls + '">' + tag.txt + '</div></div>' +
      '<p class="cdesc">' + form.desc + '</p>' +
      '<div class="cdelta">' + delta + '</div>' +
      pips +
      '</button>';
  }).join('');

  const rr = G.rerolls > 0
    ? '<button class="btn sm ghost" data-a="reroll">Reroll these ' + (G.offer && G.offer.length > 3 ? 'four' : 'three') + ' (' + G.rerolls + ' left)</button>'
    : '<button class="btn sm ghost" disabled>No rerolls left</button>';

  setOverlay(
    '<div class="panel" id="lvlwrap">' +
      '<h2 class="lvltitle display">LEVEL ' + P.level + '</h2>' +
      '<p class="lvlsub">' + (Input.hasTouch ? 'Pick one. Tap a card.' : 'Pick one. Keys 1 to ' + (G.offer ? G.offer.length : 3) + '.') + '</p>' +
      '<div class="cards' + (G.offer && G.offer.length > 3 ? ' c4' : '') + '">' + cards + '</div>' +
      '<div id="reroll">' + rr + '</div>' +
    '</div>');
}

function openLevelUp(){
  G.state = 'levelup';
  G.offer = rollOffer();
  renderLevelUp();
  SFX.level();
}
function afterLevelChoice(){
  if (G.pendingLevels > 0) openLevelUp();
  else { G.state = 'playing'; hideOverlay(); G.levelGate = typeof Settings.levelGap === 'number' ? Settings.levelGap : LEVEL_PICK_GAP; }
}
const LEVEL_PICK_GAP = 5;      /* seconds of uninterrupted play after a round of card picks (the default; Settings.levelGap, 0 to 20, overrides it) */
function chooseCard(i){
  if (G.state !== 'levelup' || !G.offer || !G.offer[i]) return;
  const o = G.offer[i];
  G.pendingLevels = Math.max(0, G.pendingLevels - 1);
  hideOverlay();
  SFX.pick();
  let transformed = false, inst = null;
  if (o.special === 'heal'){
    const h = Math.round(P.maxHp * 0.4);
    P.hp = Math.min(P.maxHp, P.hp + h);
    addText(P.x, P.y - 44, '+' + h, '#7EE08A', 20, true);
    sfx('pickupS', 0);
  } else if (o.special === 'vigour'){
    P.bonusHp = (P.bonusHp || 0) + 25;
    recalcStats();                                    /* raising the maximum already heals by the same amount */
    P.hp = Math.min(P.maxHp, P.hp);
    addText(P.x, P.y - 44, '+25 max health', '#7EE08A', 18, true);
    sfx('pickupS', 0);
  } else if (o.special === 'gold'){
    G.bonusGold += 40;
    addText(P.x, P.y - 44, '+40 gold', '#F2B33D', 20, true);
    SFX.coin();
  } else {
    if (o.def.combo && o.inst){                                     /* a combo she already has: up a level, with the special upgrade at 3 */
      inst = o.inst;
      if (upgradeCombo(inst)){
        if (inst.level >= 3){ SFX.transform(); screenFlash(inst.form.color, 0.45, 0.6); addShake(8); burstParticles(P.x, P.y, 30, inst.form.color, 300, 6, { glow: true }); banner('SPECIAL UPGRADE: ' + inst.def.cfg.capName.toUpperCase(), inst.form.name, inst.form.color, 2.6); }
        else { SFX.level(); addText(P.x, P.y - 44, inst.form.name + ' ' + inst.level, inst.form.color, 18, true); }
      }
    } else if (o.def.combo){
      inst = takeCombo(o.def);
      if (inst){ SFX.transform(); screenFlash(inst.form.color, 0.5, 0.7); addShake(10); burstParticles(P.x, P.y, 40, inst.form.color, 320, 6, { glow: true }); addShock(P.x, P.y, 360, 0.6, 0, inst.form.color, { width: 22 }); banner('COMBO: ' + inst.form.name.toUpperCase(), inst.def.parts.map(function(id){ return CARDMAP[id].forms[0].name; }).join(' + '), inst.form.color, 2.6); }
    } else {
      const r = takeCard(o.def.id);
      inst = r.inst; transformed = r.transformed;
      if (!transformed) addText(P.x, P.y - 44, inst.form.name + ' ' + inst.level, inst.form.color, 18, true);
    }
  }
  G.offer = null;
  if (transformed) startTransform(inst);
  else afterLevelChoice();
}
function doReroll(){
  if (G.state !== 'levelup' || G.rerolls <= 0) return;
  G.rerolls--;
  G.offer = rollOffer();
  renderLevelUp();
  SFX.click();
}

function showPause(){
  G.state = 'paused'; G.subScreen = '';
  setOverlay(
    '<div class="panel slab" style="max-width:430px">' +
      '<h2 class="head">Paused</h2>' +
      '<p class="sub">Wave ' + G.wave + ', ' + fmt(G.score) + ' points, ' + fmt(G.kills) + (G.kills === 1 ? ' kill.' : ' kills.') + '</p>' +
      '<div class="menucol" style="margin-top:0;width:100%">' +
        '<button class="btn" data-a="resume">Back to it</button>' +
        '<button class="btn ghost" data-a="stats">Stats and cards<small>What your giraffe and each card is doing</small></button>' +
        '<button class="btn ghost" data-a="settings">Settings<small>Sound, screen, touch, controls</small></button>' +
        '<button class="btn ghost" data-a="t-auto-live">Auto-kick: ' + (Settings.autoKick ? 'on' : 'off') + '</button>' +
        '<button class="btn ghost" data-a="t-mute-live">Sound: ' + (Settings.muted ? 'off' : 'on') + '</button>' +
        '<button class="btn ghost" data-a="t-gear-live">Gear on giraffe: ' + (Settings.showGear ? 'shown' : 'hidden') + '</button>' +
        '<button class="btn ghost" disabled>' + (G.runSpeedLevel === 3 ? 'Ultrafast (' + ULTRA_MODE_MUL : G.runSpeedLevel === 2 ? 'Hyperspeed (' + HYPER_MODE_MUL : 'Speed mode (' + SPEED_MODE_MUL) + '\u00d7): ' + (G.runSpeed ? 'on' : 'off') + '<small>' + (G.runSpeed ? 'Locked in for this run' : 'Choose it on the main menu before a run') + '</small></button>' +
        musicRowHTML() +
        hitFlashRowHTML() +
        '<button class="btn ghost" data-a="quit">Give up and bank the gold</button>' +
      '</div>' +
    '</div>');
  wireHitFlashSlider(); wireMusicSlider();
}
function resumeGame(){ G.subScreen = ''; G.state = 'playing'; hideOverlay(); }

function showDeath(){
  const r = G.lastRun;
  resetLoadoutHUD();
  HUD.classList.remove('on');
  PAUSEBTN.classList.remove('on');
  const mins = Math.floor(r.time / 60), secs = Math.floor(r.time % 60);
  setOverlay(
    '<div class="panel slab">' +
      '<canvas id="deathGir" class="deathgir" width="150" height="110"></canvas>' +
      '<h2 class="deadtitle display">DOWN</h2>' +
      '<p class="sub">You lasted ' + mins + 'm ' + (secs < 10 ? '0' : '') + secs + 's and reached wave ' + r.wave + '.</p>' +
      '<div class="summary">' +
        '<div class="sum"><span>Wave</span><b>' + r.wave + '</b></div>' +
        '<div class="sum"><span>Kills</span><b>' + fmt(r.kills) + '</b></div>' +
        '<div class="sum"><span>Points</span><b>' + fmt(r.score) + '</b></div>' +
        '<div class="sum gold"><span>Gold</span><b>' + fmt(r.gold) + '</b></div>' +
        '<div class="sum gems"><span>Gems</span><b>' + fmt(r.gems | 0) + '</b></div>' +
        (r.sulfur || r.basalt ? '<div class="sum"><span>Sulfur</span><b>' + fmt(r.sulfur | 0) + '</b></div><div class="sum"><span>Basalt</span><b>' + fmt(r.basalt | 0) + '</b></div>' : '') +
        (r.grubs ? '<div class="sum"><span>Grubs</span><b>' + fmt(r.grubs | 0) + '</b></div>' : '') +
        (r.iron || r.argon ? '<div class="sum"><span>Iron</span><b>' + fmt(r.iron | 0) + '</b></div><div class="sum"><span>Argon</span><b>' + fmt(r.argon | 0) + '</b></div>' : '') +
      '</div>' +
      runReportHTML(r, true) +
      '<div class="runmap"><canvas id="runMap" width="480" height="270"></canvas><div class="sub" style="margin:4px 0 0;font-size:12px">Your route: green is where she started, red X is where she fell. Dots are kills, gold rings are bosses and diamonds are elites.</div></div>' +
      '<p class="sub">0.2% of ' + fmt(r.score) + ' points is ' + fmt(r.base) + ' gold' +
        (r.bonus ? ', plus ' + fmt(r.bonus) + ' picked up in the field' : '') +
        (r.mult > 1.001 ? ', multiplied by ' + Math.round(r.mult * 100) + '%' : '') +
        '. Banked: ' + fmt(Save.data.gold) + ' gold.</p>' +
      '<div class="row">' +
        '<button class="btn sm" data-a="play">Run it again</button>' +
        '<button class="btn sm ghost" data-a="shop">Spend the gold</button>' +
        (typeof miniUnlocked === 'function' && miniUnlocked(G.chapter) ? '<button class="btn sm ghost" data-a="mini-menu">Minigame</button>' : '') +
        (venusUnlocked() ? '<button class="btn sm ghost" data-a="venus">Visit the Venus outpost</button>' : '') + (marsUnlocked() ? '<button class="btn sm ghost" data-a="mars">Visit the Mars outpost</button>' : '') +
        '<button class="btn sm ghost" data-a="menu">Main menu</button>' +
      '</div>' +
    '</div>');
}

function victoryText(mins, secs){
  const tm = mins + 'm ' + (secs < 10 ? '0' : '') + secs + 's';
  if (G.chapter >= SIEGE_CHAPTER) return 'The Warden goes down at the edge of Longneck Town, and the siren on the Hall winds to silence. You held the town for ' + tm + ', and ' + ((G.sg && G.sg.held) | 0) + ' of its twenty-five waves without losing a building. The militia are sitting on their sandbags, and the hatch in the Square is lifting a crack. Out on the grass, one small drone with a green light on its belly is slipping away east, toward the waterhole.';
  if (G.chapter >= TOWER_CHAPTER) return 'The Chief Executive folds into the chair behind the desk, and the whole top floor goes quiet except for the elevator chiming somewhere far below. You climbed twenty-five floors in ' + tm + '. In the glass case on the wall, a vial of something green was still turning slowly in the light, and it is in your harness now. There is a window, a paraglider on a rack, and the lights of another building across the dark.';
  if (G.chapter >= DOME_CHAPTER) return 'The Ice Heart breaks apart in a rain of cold light, and the glowing root under the dome goes dark. You held the glass for ' + tm + ' while the mylar rang like a bell all round you. The helicopter is still turning on its pad. Among the wreckage was a shipping label, stamped with a city: New York.';
  if (G.chapter >= 13) return 'Fleet Marshal Dray’s flagship comes apart in the red sky, and the dust aliens melt back into the dunes. You held the Martian plain for ' + tm + ' between two armies. The vial hums in your harness, and there is a long way home.';
  if (G.chapter >= 12) return 'General Mercer goes down, and the klaxons wind to silence across Area 51. You held the base for ' + tm + ' of the Nevada night. Under the hatch in the middle of it, something in a glass case was still glowing green: the thing that changed the animals.';
  if (G.chapter >= 11) return 'The last of the glimmering creatures falls, and the grass stops glittering. You held the savannah for ' + tm + ' of its strangest night. It is quiet now, but whatever changed it has not gone far.';
  return 'The Inferno Sovereign gutters out in a column of ash, and the last of the fire aliens sink back into the lava. You stood for ' + tm + ' in the deep fire of Venus. Among the ashes of its lair lay something that does not belong on Venus at all.';
}
/* the end of Chapter 12: the vial from under the hatch */
function showVictory(){
  const r = G.lastRun;
  resetLoadoutHUD();
  HUD.classList.remove('on');
  PAUSEBTN.classList.remove('on');
  const mins = Math.floor(r.time / 60), secs = Math.floor(r.time % 60);
  setOverlay(
    '<div class="panel slab" style="border-top-color:#FFD84D">' +
      '<h2 class="victorytitle display">CHAPTER ' + chapterLabel(G.chapter) + ' COMPLETE</h2>' +
      '<p class="sub">' + victoryText(mins, secs) + '</p>' +
      '<div class="summary">' +
        '<div class="sum"><span>Wave</span><b>' + r.wave + '</b></div>' +
        '<div class="sum"><span>Kills</span><b>' + fmt(r.kills) + '</b></div>' +
        '<div class="sum"><span>Points</span><b>' + fmt(r.score) + '</b></div>' +
        '<div class="sum gold"><span>Gold</span><b>' + fmt(r.gold) + '</b></div>' +
        '<div class="sum gems"><span>Gems</span><b>' + fmt(r.gems | 0) + '</b></div>' +
        (r.sulfur || r.basalt ? '<div class="sum"><span>Sulfur</span><b>' + fmt(r.sulfur | 0) + '</b></div><div class="sum"><span>Basalt</span><b>' + fmt(r.basalt | 0) + '</b></div>' : '') +
        (r.grubs ? '<div class="sum"><span>Grubs</span><b>' + fmt(r.grubs | 0) + '</b></div>' : '') +
        (r.iron || r.argon ? '<div class="sum"><span>Iron</span><b>' + fmt(r.iron | 0) + '</b></div><div class="sum"><span>Argon</span><b>' + fmt(r.argon | 0) + '</b></div>' : '') +
      '</div>' +
      runReportHTML(r, false) +
      (G.enginePartNew ? '<div class="enginepart"><div class="epicon">' + ico('@t-x-cog') + '</div><div><b>SPACESHIP ENGINE PART FOUND</b><br><span>A scorched engine core, still warm, pulled from the lair of the Inferno Sovereign. Kept safe in your harness. Back at the Venus outpost it might yet be put to use.</span></div></div>' : '') +
      '<p class="sub">0.2% of ' + fmt(r.score) + ' points is ' + fmt(r.base) + ' gold' +
        (r.bonus ? ', plus ' + fmt(r.bonus) + ' picked up in the field' : '') +
        ', with a 50% completion bonus for finishing the chapter' +
        '. Banked: ' + fmt(Save.data.gold) + ' gold.</p>' +
      '<div class="row">' +
        '<button class="btn sm" data-a="play">Run it again</button>' +
        '<button class="btn sm ghost" data-a="shop">Spend the gold</button>' +
        (typeof miniUnlocked === 'function' && miniUnlocked(G.chapter) ? '<button class="btn sm ghost" data-a="mini-menu">Minigame</button>' : '') +
        (venusUnlocked() ? '<button class="btn sm ghost" data-a="venus">Visit the Venus outpost</button>' : '') + (marsUnlocked() ? '<button class="btn sm ghost" data-a="mars">Visit the Mars outpost</button>' : '') +
        '<button class="btn sm ghost" data-a="menu">Main menu</button>' +
      '</div>' +
    '</div>');
}

