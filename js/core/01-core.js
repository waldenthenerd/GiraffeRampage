'use strict';
/* Utilities, audio synthesis, spatial grid, save/meta data, global game state. */
/* ========================= 1. UTILITIES ========================= */
const TAU = Math.PI * 2;
const rand  = (a, b) => a + Math.random() * (b - a);
const randi = (a, b) => Math.floor(a + Math.random() * (b - a + 1));
const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
const hyp = (x, y) => Math.sqrt(x * x + y * y);       /* the distance of (x, y) from the origin; Math.hypot does the same about ten times slower, which adds up with hundreds of creatures a frame */
const lerp  = (a, b, t) => a + (b - a) * t;
const pick  = a => a[Math.floor(Math.random() * a.length)];
/* Whole numbers with thousands separators, and big ones compacted (12.3k, 4.5M, 1.2B) so they never overflow a label. */
const fmt   = n => {
  n = Math.round(n);
  const a = Math.abs(n);
  if (a < 10000) return n.toLocaleString('en-US');
  const s = n < 0 ? '-' : '';
  if (a < 999950) return s + (Math.round(a / 100) / 10) + 'k';
  if (a < 999950000) return s + (Math.round(a / 1e5) / 10) + 'M';
  return s + (Math.round(a / 1e8) / 10) + 'B';
};
const fmtFull = n => Math.round(n).toLocaleString('en-US');       /* the exact number, where precision matters */
function angDiff(a, b){ let d = a - b; while (d > Math.PI) d -= TAU; while (d < -Math.PI) d += TAU; return d; }
function approach(v, t, d){ return v < t ? Math.min(t, v + d) : Math.max(t, v - d); }

const ARENA_W = 4200, ARENA_H = 3150, ARENA_K = ARENA_W / 2800;      /* the arena is 1.5x as wide and tall as it used to be: ARENA_K scales anything that was laid out for the old size */
const MAX_PARTICLES = 420, MAX_ENEMIES = 200, MAX_TEXTS = 52;

/* ========================= 2. AUDIO (fully synthesized) ========================= */
const SFX = {
  ctx: null, master: null, abilityGain: null, eventGain: null, noise: null, muted: false, ready: false,
  init(){
    if (this.ready) return;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) { this.ready = true; return; }
    try {
      this.ctx = new AC();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.30;
      /* a gentle high-pass (no sub-bass mud) and a limiter in front of the speakers: a crowd of hits, a boss and the music
         together used to pile up and clip; now they are held just under the ceiling instead of distorting */
      try {
        const hp = this.ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 26; hp.Q.value = 0.5;
        const lim = this.ctx.createDynamicsCompressor();
        lim.threshold.value = -9; lim.knee.value = 8; lim.ratio.value = 14; lim.attack.value = 0.003; lim.release.value = 0.2;
        this.master.connect(hp); hp.connect(lim); lim.connect(this.ctx.destination);
        this.limiter = lim;
      } catch (e) { this.master.connect(this.ctx.destination); }
      /* Two buses feeding the same master fader: abilities (kicks, card
         effects, pickups, UI) fire constantly during play and are trimmed
         down so they sit underneath the game's own texture; events (wave
         start, level up, boss arrival, transformations, victory/death)
         are the moments meant to cut through, so they pass through at
         full strength. */
      this.abilityGain = this.ctx.createGain();
      this.abilityGain.gain.value = 0.55;
      this.abilityGain.connect(this.master);
      this.eventGain = this.ctx.createGain();
      this.eventGain.gain.value = 1.0;
      this.eventGain.connect(this.master);
      this.setFx(typeof Settings !== 'undefined' && typeof Settings.sfxVol === 'number' ? Settings.sfxVol : 1);
      const len = Math.floor(this.ctx.sampleRate * 0.5);
      const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
      this.noise = buf;
    } catch (e) { this.ctx = null; }
    this.ready = true;
  },
  resume(){ if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume(); },
  setFx(v){ if (this.abilityGain){ this.abilityGain.gain.value = 0.55 * v; this.eventGain.gain.value = v; } },
  setMuted(m){ this.muted = m; if (this.master) this.master.gain.value = m ? 0 : 0.30; },
  /* one-shot oscillator with an envelope. bus defaults to the event bus so
     any call site that forgets to pass one keeps today's full volume
     rather than silently going quiet. */
  /* where the sound being played comes from: SFX.at(x, y) is set by sfx(name, ms, x, y) for the length of one call, and
     every voice made in it is panned left/right by that spot and made quieter with distance (only at Medium/High effects) */
  voices: 0, pos: null,
  at(x, y){ this.pos = { x: x, y: y, nodes: null }; },
  route(bus){
    const p = this.pos;
    if (!p || !this.ctx || !this.ctx.createStereoPanner || (typeof fxLevelNow === 'function' && fxLevelNow() <= 0)) return bus;
    if (!p.nodes) p.nodes = new Map();                    /* one panner per bus for the length of one sound */
    let n = p.nodes.get(bus);
    if (!n){
      const dx = p.x - P.x, dy = p.y - P.y, half = Math.max(200, G.W / Math.max(0.3, G.zoom || 1) / 2);
      const pan = Math.max(-1, Math.min(1, dx / half)) * 0.75, d = Math.hypot(dx, dy);
      n = this.ctx.createGain(); n.gain.value = Math.max(0.3, Math.min(1, 1 - Math.max(0, d - 220) / 1200));
      const sp = this.ctx.createStereoPanner(); sp.pan.value = pan;
      n.connect(sp); sp.connect(bus); p.nodes.set(bus, n);
    }
    return n;
  },
  tone(type, f0, f1, dur, vol, delay, detune, bus){
    if (!this.ctx || this.muted || this.voices > (bus === this.abilityGain ? 56 : 110)) return;       /* a crowd cannot starve the big moments */
    const t = this.ctx.currentTime + (delay || 0);
    const o = this.ctx.createOscillator(), g = this.ctx.createGain();
    this.voices++; const self = this; o.onended = function(){ self.voices--; };
    o.type = type;
    o.frequency.setValueAtTime(f0, t);
    if (f1 && f1 !== f0) o.frequency.exponentialRampToValueAtTime(Math.max(1, f1), t + dur);
    if (detune) o.detune.value = detune;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + Math.min(0.012, dur * 0.3));
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(this.route(bus || this.eventGain));
    o.start(t); o.stop(t + dur + 0.02);
  },
  /* filtered noise burst. Same bus-defaulting rule as tone(). */
  burst(dur, vol, f0, f1, q, delay, type, bus){
    if (!this.ctx || this.muted || !this.noise || this.voices > (bus === this.abilityGain ? 56 : 110)) return;
    const t = this.ctx.currentTime + (delay || 0);
    const s = this.ctx.createBufferSource(); s.buffer = this.noise;
    this.voices++; const self = this; s.onended = function(){ self.voices--; };
    const bp = this.ctx.createBiquadFilter();
    bp.type = type || 'bandpass'; bp.Q.value = q || 1;
    bp.frequency.setValueAtTime(f0, t);
    if (f1) bp.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + dur);
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(bp); bp.connect(g); g.connect(this.route(bus || this.eventGain));
    s.start(t); s.stop(t + dur + 0.02);
  },
  /* ---- ability tier: frequent, in-combat, kept meaningfully quieter ---- */
  kick(){ const b = this.abilityGain; this.tone('sine', 230, 52, 0.17, 0.5, 0, 0, b); this.burst(0.09, 0.30, 2400, 380, 0.7, 0, 'bandpass', b); this.tone('triangle', 420, 160, 0.07, 0.16, 0, 0, b); },
  /* hits, crits and kills each detune a little at random so a crowd of them does not sound like one sample on repeat */
  hit(){ this.tone('square', 560, 300, 0.045, 0.075, 0, (Math.random() - 0.5) * 360, this.abilityGain); },
  crit(){ const b = this.abilityGain, d = (Math.random() - 0.5) * 240; this.tone('square', 980, 520, 0.07, 0.11, 0, d, b); this.tone('triangle', 1960, 1500, 0.09, 0.05, 0.015, d, b); this.burst(0.06, 0.12, 5200, 1800, 1.4, 0, 'bandpass', b); },
  kill(){ const b = this.abilityGain, d = (Math.random() - 0.5) * 420; this.burst(0.15, 0.20, 1500 * (0.85 + Math.random() * 0.3), 190, 0.6, 0, 'bandpass', b); this.tone('sawtooth', 190, 68, 0.13, 0.11, 0, d, b); },
  hurt(){ const b = this.abilityGain; this.tone('sawtooth', 190, 62, 0.28, 0.30, 0, 0, b); this.burst(0.18, 0.17, 700, 140, 0.8, 0, 'bandpass', b); },
  boom(){ const b = this.abilityGain; this.tone('sine', 150, 34, 0.42, 0.44, 0, 0, b); this.burst(0.34, 0.28, 900, 90, 0.5, 0, 'bandpass', b); },
  zap(){ const b = this.abilityGain; this.burst(0.1, 0.20, 6500, 1500, 2.2, 0, 'bandpass', b); this.tone('square', 1500, 420, 0.08, 0.09, 0, 0, b); },
  spit(){ const b = this.abilityGain; this.tone('triangle', 700, 300, 0.07, 0.10, 0, 0, b); this.burst(0.05, 0.08, 3200, 1200, 1.2, 0, 'bandpass', b); },
  whoosh(){ this.burst(0.28, 0.16, 420, 2600, 0.5, 0, 'bandpass', this.abilityGain); },
  rustle(){ this.burst(0.09, 0.12, 3600, 1900, 1.8, 0, 'bandpass', this.abilityGain); },
  freeze(){ const b = this.abilityGain; this.tone('sine', 1500, 640, 0.14, 0.12, 0, 0, b); this.burst(0.08, 0.08, 4200, 2200, 1.6, 0, 'bandpass', b); },
  splash(){ this.burst(0.16, 0.16, 1100, 260, 0.9, 0, 'lowpass', this.abilityGain); },
  pickupS(){ const b = this.abilityGain; this.tone('sine', 880, 1500, 0.1, 0.18, 0, 0, b); this.tone('sine', 1320, 1900, 0.08, 0.10, 0.05, 0, b); },
  coin(){ const b = this.abilityGain; this.tone('square', 1180, 1180, 0.05, 0.1, 0, 0, b); this.tone('square', 1760, 1760, 0.12, 0.09, 0.06, 0, b); },
  click(){ this.tone('square', 660, 660, 0.035, 0.07, 0, 0, this.abilityGain); },
  buy(){ const b = this.abilityGain; this.tone('square', 784, 784, 0.06, 0.1, 0, 0, b); this.tone('square', 1175, 1175, 0.16, 0.09, 0.06, 0, b); this.burst(0.2, 0.08, 4000, 1200, 1.5, 0, 'bandpass', b); },
  deny(){ this.tone('square', 170, 120, 0.16, 0.13, 0, 0, this.abilityGain); },
  /* ---- event tier: rare, meaningful, left at full strength ---- */
  level(){ [523, 659, 784, 1047].forEach((f, i) => this.tone('triangle', f, f, 0.24, 0.20, i * 0.075, 0, this.eventGain)); },
  transform(){
    const b = this.eventGain;
    [262, 330, 392, 523, 659, 784, 1047].forEach((f, i) => this.tone('sawtooth', f, f * 1.5, 0.75, 0.13, i * 0.055, 0, b));
    this.burst(1.0, 0.24, 240, 7000, 0.5, 0, 'bandpass', b);
    this.tone('sine', 60, 210, 0.9, 0.35, 0, 0, b);
  },
  wave(){ const b = this.eventGain; this.tone('sawtooth', 138, 138, 0.42, 0.17, 0, 0, b); this.tone('sawtooth', 207, 207, 0.42, 0.13, 0.03, 0, b); this.tone('sawtooth', 276, 276, 0.6, 0.11, 0.24, 0, b); },
  boss(){ const b = this.eventGain; this.tone('sawtooth', 82, 62, 1.5, 0.30, 0, 0, b); this.tone('sawtooth', 124, 92, 1.4, 0.18, 0.06, 0, b); this.burst(1.3, 0.22, 340, 70, 0.6, 0, 'bandpass', b); },
  over(){ const b = this.eventGain; [523, 440, 349, 262, 196].forEach((f, i) => this.tone('triangle', f, f * 0.94, 0.5, 0.20, i * 0.19, 0, b)); }
};

/* ========================= 3. SPATIAL GRID ========================= */
const Grid = {
  cell: 120, map: new Map(), pool: [],
  /* a cell's key is a number, not text, and the lists are reused from one frame to the next: the grid is rebuilt every frame and queried by
     every creature, so text keys and fresh arrays made a lot of garbage. (Cells beyond -64 are clamped; the arena is 35 cells wide.) */
  build(list){
    const m = this.map, pool = this.pool, c = this.cell;
    m.forEach(function(a){ a.length = 0; pool.push(a); });
    m.clear();
    for (let i = 0; i < list.length; i++){
      const e = list[i];
      const k = (((e.x / c) | 0) + 64) * 1024 + ((e.y / c) | 0) + 64;
      let a = m.get(k);
      if (a === undefined){ a = pool.length ? pool.pop() : []; m.set(k, a); }
      a.push(e);
    }
  },
  query(x, y, r, out){
    out.length = 0;
    const c = this.cell, m = this.map;
    const x0 = Math.max(-64, ((x - r) / c) | 0), x1 = Math.min(900, ((x + r) / c) | 0);
    const y0 = Math.max(-64, ((y - r) / c) | 0), y1 = Math.min(900, ((y + r) / c) | 0);
    for (let i = x0; i <= x1; i++)
      for (let j = y0; j <= y1; j++){
        const a = m.get((i + 64) * 1024 + j + 64);
        if (a !== undefined) for (let k = 0; k < a.length; k++) out.push(a[k]);
      }
    return out;
  }
};
const _q = [], _q2 = [];

/* ========================= 4. SAVE / META ========================= */
const SAVE_KEY = 'giraffe_rampage_save_v1';
const DEFAULT_SAVE = { inputMode: '', gold: 0, gems: 0, meta: {}, gear: {}, equipped: { cape: null, weapon: null, armor: null }, equippedTrinkets: [],
  best: 0, bestWave: 0, runs: 0, totalKills: 0, chaptersComplete: 0, chapter1Complete: false, chapter2Complete: false, chapter3Complete: false, chapter4Complete: false, chapter5Complete: false, chapter6Complete: false, chapter7Complete: false, chapter8Complete: false, chapter9Complete: false, chapter10Complete: false, enginePart: false, spaceplane: 0, homecoming: false, grubs: 0, city: {}, chapter11Complete: false, chapter12Complete: false, chapter13Complete: false, chapter14Complete: false, chapter15Complete: false, chapter16Complete: false, siegeHeldBest: 0, siegeFlawless: false, siegeBld: {}, chapter17Complete: false, fortChaosBest: 0, fortBadges: 0, fortBestWave: 0, siegeMil: {}, mutationVial: false, iron: 0, argon: 0, marsUp: {}, mutations: {}, mutUses: 0, vials: 0, vialGiven: false, squad: {}, sulfur: 0, basalt: 0, venusUp: {}, antsUnlocked: false, food: 0, ants: null, cratesOpened: 0,
  wheelKeys: 0, lastWheelKeyAt: 0, spottedKeys: 0, lastSpottedKeyAt: 0, runSave: null, combos: {}, fusions: 0, mastered: {}, comboClaims: {}, bestiary: null, lastForageAt: 0, menuChapter: 1,
  muted: false, autoKick: true, aimMode: 'cursor', ach: {}, gagsDone: 0 };

/* a save's own copy of the defaults. DEFAULT_SAVE holds lists and objects (combos, city, squad...); copying it with Object.assign alone would hand every save the same ones, so
   progress made by a player who started fresh would be written into DEFAULT_SAVE itself and survive "Erase all progress". */
function freshSave(){ return JSON.parse(JSON.stringify(DEFAULT_SAVE)); }

/* a score as a whole number that is never negative: `x | 0` wraps past 2,147,483,647 into a negative one, and scores in the late game go beyond that */
/* the Siege's two permanent records (js/siege/44zzzi-siege-rewards.js): for each key building its best unbroken run of waves (b) and the reward tier it has paid out (t), and for each militia giraffe by name her kills (k) and waves survived (w) */
function sanitizeSiegeBld(src){
  const out = {}; src = src && typeof src === 'object' ? src : {};
  ['hall', 'library', 'post', 'lighthouse', 'mission'].forEach(function(k){ const v = src[k] && typeof src[k] === 'object' ? src[k] : {}; out[k] = { b: Math.min(25, scoreInt(v.b)), t: Math.min(2, scoreInt(v.t)) }; });
  return out;
}
function sanitizeSiegeMil(src){
  const out = {}; src = src && typeof src === 'object' ? src : {}; let n = 0;
  Object.keys(src).forEach(function(name){ if (n >= 24 || typeof name !== 'string' || name.length > 16) return; const v = src[name] && typeof src[name] === 'object' ? src[name] : {}; out[name] = { k: Math.min(1e6, scoreInt(v.k)), w: Math.min(1e5, scoreInt(v.w)) }; n++; });
  return out;
}
function scoreInt(v){ v = Math.floor(+v || 0); return v > 0 ? v : 0; }
/* gold the same way: the town, the sea, the farm and the spaceplane add to and take from it, and `| 0` would turn a bank past 2,147,483,647 negative */
function goldInt(v){ v = Math.floor(+v || 0); return v > 0 ? v : 0; }
/* a short message across the top of the screen (a save that could not be read or written); click it to dismiss */
function gameToast(msg, ms){
  try {
    let el = document.getElementById('gameToast');
    if (!el){ el = document.createElement('div'); el.id = 'gameToast'; el.setAttribute('role', 'alert'); el.addEventListener('click', function(){ el.classList.remove('on'); }); document.body.appendChild(el); }
    el.textContent = msg; el.classList.add('on');
    clearTimeout(gameToast.t); gameToast.t = setTimeout(function(){ el.classList.remove('on'); }, ms || 9000);
  } catch (e) {}
}
const Save = {
  data: null, writeFailed: false, rescued: false,
  load(){
    let d = null, raw = null;
    try { raw = window.localStorage.getItem(SAVE_KEY); if (raw) d = GRPack.decode(raw); } catch (e) { d = null; }      /* packed (js/core/01b-savepack.js) or an older plain JSON save */
    if (!d || typeof d !== 'object' || Array.isArray(d)){
      d = null;                                                                   /* a damaged or foreign save is ignored, not half-used... */
      if (raw){                                                                   /* ...but the next write would overwrite it for good, so keep the raw text aside first (the first copy is kept, never replaced) */
        try { if (window.localStorage.getItem(SAVE_KEY + '_unreadable') === null) window.localStorage.setItem(SAVE_KEY + '_unreadable', raw); this.rescued = true; } catch (e) {}
        gameToast('Your saved game could not be read, so a fresh one was started. The old data has been kept aside in this browser (' + SAVE_KEY + '_unreadable) in case it can be recovered.', 14000);
      }
    }
    this.data = Object.assign(freshSave(), d || {});
    this.data.best = scoreInt(this.data.best);
    ['bestWave', 'runs', 'totalKills', 'chaptersComplete', 'cratesOpened'].forEach(function(k){ Save.data[k] = scoreInt(Save.data[k]); });          /* counts are whole numbers, never negative or text */
    for (let c = 1; c <= 10; c++) this.data['chapter' + c + 'Complete'] = !!this.data['chapter' + c + 'Complete'];
    if (!this.data.hintsSeen || typeof this.data.hintsSeen !== 'object' || Array.isArray(this.data.hintsSeen)) this.data.hintsSeen = {};
    if (this.data.inputMode !== 'touch' && this.data.inputMode !== 'mouse') this.data.inputMode = '';      /* how she plays, asked once: '' means not asked yet */
    if (!this.data.ach || typeof this.data.ach !== 'object' || Array.isArray(this.data.ach)) this.data.ach = {};                 /* trophies (js/ui/44zzu-achievements.js): { done: { id: time } } */
    if (this.data.ach.done !== undefined){
      if (!this.data.ach.done || typeof this.data.ach.done !== 'object' || Array.isArray(this.data.ach.done)) this.data.ach.done = {};
      for (const k of Object.keys(this.data.ach.done)) if (!(this.data.ach.done[k] > 0)) delete this.data.ach.done[k];
    }
    if (!this.data.meta || typeof this.data.meta !== 'object') this.data.meta = {};
    if (!this.data.gear || typeof this.data.gear !== 'object') this.data.gear = {};
    if (!this.data.equipped || typeof this.data.equipped !== 'object' || Array.isArray(this.data.equipped)) this.data.equipped = { cape: null, weapon: null, armor: null };
    ['cape', 'weapon', 'armor'].forEach(function(slot){                          /* an equipped item that is not a real piece of gear is unequipped */
      const v = Save.data.equipped[slot];
      if (v !== null && v !== undefined && !(typeof v === 'string' && (typeof GEAR_INDEX === 'undefined' || GEAR_INDEX[v]))) Save.data.equipped[slot] = null;
    });
    this.data.gold = Math.max(0, Math.floor(this.data.gold) || 0);
    this.data.gems = Math.max(0, Math.floor(this.data.gems) || 0);
    if (!this.data.ants || typeof this.data.ants !== 'object' || Array.isArray(this.data.ants)) this.data.ants = { soldier: 0, distractor: 0, shooter: 0 };
    for (const k of Object.keys(this.data.ants)) this.data.ants[k] = Math.min(1e6, scoreInt(this.data.ants[k]));      /* how many of each kind of ant */
    this.data.food = Math.max(0, Math.round((+this.data.food || 0) * 10) / 10);
    if (scoreInt(this.data.best) >= ANT_UNLOCK_SCORE) this.data.antsUnlocked = true;
    /* Saves from before this flag existed: someone who has won at least once and has reached the very last wave has
       finished Chapter 7 (the flag is only ever set by winning it), so don't make them do it again. */
    if (!this.data.chapter7Complete && (this.data.chaptersComplete | 0) > 0 && (this.data.bestWave | 0) >= WAVES_PER_CHAPTER * 7) this.data.chapter7Complete = true;
    if (!Array.isArray(this.data.equippedTrinkets)) this.data.equippedTrinkets = [];
    if (!this.data.bestiary || typeof this.data.bestiary !== 'object') this.data.bestiary = { creatures: {}, cards: {} };
    this.data.sulfur = Math.max(0, Math.floor(+this.data.sulfur) || 0); this.data.basalt = Math.max(0, Math.floor(+this.data.basalt) || 0);
    if (!this.data.venusUp || typeof this.data.venusUp !== 'object') this.data.venusUp = {};
    this.data.spaceplane = Math.max(0, Math.min(4, Math.floor(+this.data.spaceplane) || 0)); this.data.homecoming = !!this.data.homecoming; this.data.enginePart = !!this.data.enginePart;
    this.data.grubs = Math.max(0, Math.floor(+this.data.grubs) || 0); this.data.chapter11Complete = !!this.data.chapter11Complete;
    this.data.chapter12Complete = !!this.data.chapter12Complete; this.data.mutationVial = !!this.data.mutationVial;
    this.data.chapter13Complete = !!this.data.chapter13Complete; this.data.chapter14Complete = !!this.data.chapter14Complete; this.data.chapter15Complete = !!this.data.chapter15Complete; this.data.chapter16Complete = !!this.data.chapter16Complete; this.data.siegeHeldBest = clamp(scoreInt(this.data.siegeHeldBest), 0, 25); this.data.siegeFlawless = !!this.data.siegeFlawless; this.data.siegeBld = sanitizeSiegeBld(this.data.siegeBld); this.data.siegeMil = sanitizeSiegeMil(this.data.siegeMil); this.data.chapter17Complete = !!this.data.chapter17Complete; this.data.fortChaosBest = clamp(scoreInt(this.data.fortChaosBest), 0, 99999999); this.data.fortBadges = clamp(scoreInt(this.data.fortBadges), 0, 255); this.data.fortBestWave = clamp(scoreInt(this.data.fortBestWave), 0, 25);       /* chapter14 is Chapter 13.5, the Domes; chapter15 is Chapter 14, the Tower; chapter16 is Chapter 15, the Siege */
    this.data.iron = Math.max(0, Math.floor(+this.data.iron) || 0); this.data.argon = Math.max(0, Math.floor(+this.data.argon) || 0);
    if (!this.data.marsUp || typeof this.data.marsUp !== 'object' || Array.isArray(this.data.marsUp)) this.data.marsUp = {};
    if (!this.data.mutations || typeof this.data.mutations !== 'object' || Array.isArray(this.data.mutations)) this.data.mutations = {};
    if (!this.data.squad || typeof this.data.squad !== 'object' || Array.isArray(this.data.squad)) this.data.squad = {};
    this.data.mutUses = Math.max(0, Math.floor(+this.data.mutUses) || 0); this.data.vials = Math.max(0, Math.floor(+this.data.vials) || 0); this.data.vialGiven = !!this.data.vialGiven;
    if (!this.data.city || typeof this.data.city !== 'object' || Array.isArray(this.data.city)) this.data.city = {};
    for (const k of Object.keys(this.data.city)) this.data.city[k] = Math.max(0, Math.min(99, Math.floor(+this.data.city[k]) || 0));
    if (this.data.runSave && !validRunSave(this.data.runSave)) this.data.runSave = null;
    if (!this.data.combos || typeof this.data.combos !== 'object' || Array.isArray(this.data.combos)) this.data.combos = {};
    if (!this.data.mastered || typeof this.data.mastered !== 'object' || Array.isArray(this.data.mastered)) this.data.mastered = {};
    if (!this.data.comboClaims || typeof this.data.comboClaims !== 'object' || Array.isArray(this.data.comboClaims)) this.data.comboClaims = {};
    this.data.fusions = Math.max(0, Math.floor(+this.data.fusions) || 0);
    this.data.wheelKeys = Math.max(0, Math.round(+this.data.wheelKeys || 0));
    this.data.lastWheelKeyAt = +this.data.lastWheelKeyAt || 0;
    this.data.spottedKeys = Math.max(0, Math.round(+this.data.spottedKeys || 0));
    this.data.lastSpottedKeyAt = +this.data.lastSpottedKeyAt || 0;
    this.data.gagsDone = scoreInt(this.data.gagsDone);                           /* pointless things she has done (js/town/44zzzc-gags.js) */
    return this.data;
  },
  write(){                                                                        /* a JSON string holding the packed save (GR2 now, repacked as GR3 a moment later: js/core/01b-savepack.js) */
    try { const raw = JSON.stringify(GRPack.encodeFast(this.data)); window.localStorage.setItem(SAVE_KEY, raw); GRPack.wrote(raw); this.writeFailed = false; return true; }
    catch (e) {                                                                   /* full or blocked storage: say so once, not on every write, and again if it fails after it had worked */
      if (!this.writeFailed){ this.writeFailed = true; gameToast('Your progress could not be saved: this browser is blocking or has run out of storage for the game. Free some space or allow site data, or what you do now will be lost when you close it.', 12000); }
      return false;
    }
  },
  reset(){
    /* erasing progress keeps the player's own settings: volumes, controls, accessibility */
    const keep = {}, old = this.data || {};
    ['muted', 'autoKick', 'aimMode', 'showGear', 'hitFlash', 'musicVol', 'sfxVol', 'ambVol', 'levelGap', 'autoPerf', 'autoPause', 'touchLeft', 'touchScale', 'fxLevel', 'keys', 'speedMode', 'speedLevel', 'calmFlash', 'npcVoice', 'textScale', 'autoBread', 'inputMode', 'minimap', 'mmSize', 'mmZoom'].forEach(function(k){ if (old[k] !== undefined) keep[k] = old[k]; });
    this.data = Object.assign(freshSave(), { meta: {}, gear: {}, equipped: { cape: null, weapon: null, armor: null }, equippedTrinkets: [], ants: { soldier: 0, distractor: 0, shooter: 0 }, bestiary: { creatures: {}, cards: {} }, venusUp: {}, hintsSeen: {} }, keep);
    this.write();
  }
};

/* Permanent upgrades bought with gold between runs. */
const META = [
  { id:'hooves', icon:'@t-x-hoof', name:'Iron Hooves', max:9, cost:150, mult:1.80,
    desc:l => 'Weapon damage +' + (l * 6) + '%' },
  { id:'hide', icon:'@t-x-shield', name:'Thick Hide', max:9, cost:160, mult:1.80,
    desc:l => 'Start with +' + (l * 7.5) + ' max health' },
  { id:'strides', icon:'@t-walk', name:'Long Strides', max:7, cost:190, mult:1.85,
    desc:l => 'Move speed +' + (l * 2.5) + '%' },
  { id:'prospect', icon:'@t-x-pick', name:'Prospector', max:7, cost:210, mult:1.85,
    desc:l => 'Gold earned +' + (l * 7) + '%' },
  { id:'learner', icon:'@t-brain', name:'Fast Learner', max:7, cost:190, mult:1.85,
    desc:l => 'Experience gained +' + (l * 4.5) + '%' },
  { id:'deck', icon:'@t-x-cards', name:'Lucky Deck', max:6, cost:320, mult:2.00,
    desc:l => 'Rare and epic cards appear ' + (l * 7) + '% more often' + (l >= 5 ? ', and you start each run holding a free card' : '') },
  { id:'instinct', icon:'@t-x-crosshair', name:'Killer Instinct', max:7, cost:190, mult:1.85,
    desc:l => 'Critical chance +' + (l * 2) + '%, critical damage +' + (l * 6) + '%' },
  { id:'magnet', icon:'@t-magnet', name:'Savanna Magnet', max:6, cost:150, mult:1.80,
    desc:l => 'Pickup range +' + (l * 13) + '%, drops ' + (l * 10) + '% more common' },
  { id:'wind', icon:'@t-feather', name:'Second Wind', max:3, cost:900, mult:2.60,
    desc:l => 'Revive ' + l + (l === 1 ? ' time' : ' times') + ' per run at 30% health' },
  { id:'starcharm', icon:'@t-sparkles', name:'Shooting Star Charm', max:3, cost:2600, mult:2.0,
    desc:l => 'Legendary cards appear ' + (l + 1) + '\u00D7 as often' },
  { id:'reach', icon:'@t-x-reach', name:'Extended Reach', max:7, cost:170, mult:1.80,
    desc:l => 'Weapon range +' + (l * 3) + '%' },
  { id:'regen', icon:'@t-x-fork', name:'Iron Stomach', max:6, cost:220, mult:1.85,
    desc:l => 'Regenerate ' + (l * 0.3).toFixed(1) + ' health per second' },
  { id:'luckypaws', icon:'@t-x-clover', name:'Lucky Paws', max:3, cost:700, mult:2.20,
    desc:l => '+' + l + ' reroll' + (l === 1 ? '' : 's') + ' at the start of every run' },
  { id:'thunder', icon:'@t-horseshoe', name:'Thundering Hooves', max:6, cost:150, mult:1.75,
    desc:l => 'Weapon knockback +' + (l * 5) + '%' },
  { id:'steady', icon:'@t-x-ground', name:'Steady Ground', max:5, cost:190, mult:1.80,
    desc:l => 'Invulnerability after being hit lasts ' + (l * 6) + '% longer' },
  { id:'swimlegs', icon:'@t-x-swimleg', name:'Swimmer\u2019s Legs', max:6, cost:250, mult:1.85, requires:'chapter3Complete',
    desc:l => 'Move speed in open water improves by ' + (l * 6) + '%' },
  { id:'ripkick', icon:'@t-x-riptide', name:'Riptide Kick', max:5, cost:280, mult:1.90, requires:'chapter3Complete',
    desc:l => 'Splash stun chance from your kicks +' + (l * 4) + '%' },
  { id:'brine', icon:'@t-x-briney', name:'Brine-Hardened Hide', max:5, cost:260, mult:1.85, requires:'chapter3Complete',
    desc:l => 'Damage taken in open water \u2212' + (l * 4) + '%' },
  { id:'steadyeyes', icon:'@t-eye', name:'Steady Eyes', max:3, cost:220, mult:1.8,
    desc:l => 'Screen shake from your own abilities \u2212' + (l * 25) + '%' },
  { id:'antcap', icon:'@t-bug', name:'Larger Colony', max:3, cost:900, mult:2.0, requires:'antsUnlocked',
    desc:l => 'Each ant type can hold ' + (l * 2) + ' more (max ' + (10 + l * 2) + ' per type)' },
  { id:'anthp', icon:'@t-x-carapace', name:'Hardened Carapace', max:3, cost:700, mult:1.9, requires:'antsUnlocked',
    desc:l => 'All ants have ' + (l * 15) + '% more health' },
  { id:'antblast', icon:'@t-bomb', name:'Volatile Payload', max:3, cost:750, mult:1.9, requires:'antsUnlocked',
    desc:l => 'Distractor ants explode ' + (l * 25) + '% harder and wider' },
  { id:'antdmg', icon:'@t-swords', name:'Ant Ferocity', max:3, cost:800, mult:1.95, requires:'antsUnlocked',
    desc:l => 'Soldier bites and shooter globs deal ' + (l * 15) + '% more damage' },
  { id:'antrespawn', icon:'@t-x-brood', name:'Swift Broodline', max:3, cost:650, mult:1.85, requires:'antsUnlocked',
    desc:l => 'Ants respawn from the hill ' + (l * 15) + '% faster' }
];
const METAMAP = {};
META.forEach(m => METAMAP[m.id] = m);
function metaLevel(id){ return (Save.data && Save.data.meta ? Save.data.meta[id] : 0) | 0; }
function metaCost(m, lvl){ return Math.round(m.cost * Math.pow(m.mult, lvl)); }
/* ========================= 5. GLOBAL STATE ========================= */
const G = {
  state: 'menu',          // menu | shop | help | playing | levelup | transform | paused | dead
  time: 0, runTime: 0,
  wave: 0, score: 0, kills: 0, bonusGold: 0,
  enemies: [], projectiles: [], eproj: [], particles: [], texts: [],
  zones: [], shocks: [], pickups: [], swipes: [], bolts: [], decor: [], markers: [], beams: [], blasts: [], hzones: [], arcs: [], pulses: [],
  spawnQueue: [], spawnTimer: 0, waveState: 'idle', waveTimer: 0,
  banner: null, transformFX: null, pendingLevels: 0, levelGate: 0, offer: null, rerolls: 0,
  shake: 0, shakeMax: 0, flash: null, hitstop: 0,
  camX: 0, camY: 0, zoom: 1, W: 0, H: 0, dpr: 1,
  revives: 0, bossAlive: false, attract: true
};

