'use strict';
/* Extra sounds (card pick, wave clear, heartbeat, heavy thump), a per-chapter ambient bed that follows the weather, and gamepad rumble. */
/* ========================= 2c. AMBIENCE AND FEEDBACK SOUNDS ========================= */
/* Everything is synthesised on the same audio context as SFX and Music, routed through SFX.eventGain so the Effects volume
   and the mute switch already apply. Amb.update(dt) runs once per frame from step(). */
Object.assign(SFX, {
  /* a heavy hit: a low thump under the usual click */
  thump(){ const b = this.abilityGain; this.tone('sine', 110, 38, 0.2, 0.42, 0, (Math.random() - 0.5) * 120, b); this.burst(0.09, 0.14, 380, 90, 0.7, 0, 'lowpass', b); },
  /* picking a card: a bright two-note lift and a little sparkle */
  pick(){ const b = this.abilityGain; this.tone('triangle', 660, 990, 0.12, 0.2, 0, 0, b); this.tone('triangle', 990, 1480, 0.16, 0.16, 0.07, 0, b); this.burst(0.18, 0.07, 6800, 2600, 1.6, 0.04, 'bandpass', b); },
  /* a wave is cleared: a short rising chord, calmer than the level-up fanfare */
  clear(){ const b = this.eventGain; [392, 494, 587, 784].forEach((f, i) => this.tone('sine', f, f, 0.34, 0.15, i * 0.07, 0, b)); this.tone('triangle', 196, 196, 0.5, 0.12, 0, 0, b); this.burst(0.5, 0.06, 5200, 1800, 1.2, 0.1, 'bandpass', b); },
  /* lub-dub, for when she is close to dead */
  beat(){ const b = this.abilityGain; this.tone('sine', 72, 40, 0.15, 0.5, 0, 0, b); this.tone('sine', 64, 36, 0.17, 0.4, 0.17, 0, b); },
  /* a big thing arrives */
  stomp(){ const b = this.eventGain; this.tone('sine', 90, 30, 0.5, 0.5, 0, 0, b); this.burst(0.4, 0.25, 500, 60, 0.6, 0, 'lowpass', b); }
});

/* what each chapter sounds like when nothing is happening. Levels are gains on filtered noise (0 is off).
   chirp: a one-shot sound at random intervals (seconds) */
const AMB_PROFILES = {
  1:  { wind: 0.05, windF: 520, chirp: { kind: 'cricket', every: [4, 9] } },
  2:  { wind: 0.12, windF: 760 },
  3:  { water: 0.05, rumble: 0.02, chirp: { kind: 'frog', every: [5, 11] } },
  4:  { water: 0.11, rumble: 0.04, chirp: { kind: 'bubble', every: [1.5, 4] } },
  5:  { hiss: 0.04, water: 0.03, chirp: { kind: 'bird', every: [3, 8] } },
  6:  { rumble: 0.06, wind: 0.03, windF: 420, chirp: { kind: 'ping', every: [8, 16] } },
  7:  { hum: 0.04, wind: 0.02, windF: 600 },
  8:  { hum: 0.03 },
  9:  { rumble: 0.07, hiss: 0.03, wind: 0.04, windF: 380 },
  10: { rumble: 0.09, hiss: 0.02, chirp: { kind: 'pop', every: [0.6, 2.2] } },
  11: { wind: 0.04, windF: 640, hum: 0.02, chirp: { kind: 'sparkle', every: [2.5, 6] } },
  12: { wind: 0.05, windF: 480, hum: 0.03 },
  13: { wind: 0.09, windF: 260, rumble: 0.02 },
  14: { wind: 0.03, windF: 700, hum: 0.04, chirp: { kind: 'sparkle', every: [3, 7] } },
  15: { wind: 0.02, windF: 500, hum: 0.06, chirp: { kind: 'pop', every: [4, 9] } }
};
/* weather adds to the bed: [layer, extra gain at full strength] */
const AMB_WEATHER = {
  rain: [['hiss', 0.07]], drizzle: [['hiss', 0.04]], downpour: [['hiss', 0.1], ['wind', 0.04]], acid: [['hiss', 0.07]],
  storm: [['wind', 0.1]], sandstorm: [['wind', 0.1]], blizzard: [['wind', 0.13]], ashstorm: [['wind', 0.08], ['rumble', 0.03]],
  dust: [['wind', 0.03]], emberstorm: [['rumble', 0.04], ['hiss', 0.02]]
};

const Amb = {
  built: false, bus: null, L: {}, noise: null, chirpT: 3, hbT: 0.5, mul: 0, key: '',
  build(){
    const c = SFX.ctx; if (!c || this.built) return;
    this.built = true;
    /* three seconds of noise to loop; long enough that the loop is not audible once it is filtered */
    const len = Math.floor(c.sampleRate * 3), buf = c.createBuffer(1, len, c.sampleRate), d = buf.getChannelData(0);
    let b0 = 0, b1 = 0;
    for (let i = 0; i < len; i++){ const w = Math.random() * 2 - 1; b0 = 0.97 * b0 + 0.03 * w; b1 = 0.8 * b1 + 0.2 * w; d[i] = (w * 0.35 + b1 * 0.5 + b0 * 3) * 0.5; }
    this.noise = buf;
    this.bus = c.createGain(); this.bus.gain.value = 0; this.bus.connect(SFX.eventGain);
    const mk = function(type, f, q){
      const src = c.createBufferSource(); src.buffer = buf; src.loop = true; src.playbackRate.value = 0.9 + Math.random() * 0.2;
      const fl = c.createBiquadFilter(); fl.type = type; fl.frequency.value = f; fl.Q.value = q;
      const g = c.createGain(); g.gain.value = 0;
      src.connect(fl); fl.connect(g); g.connect(Amb.bus); src.start(c.currentTime + Math.random());
      return { fl: fl, g: g };
    };
    const slow = function(L, rate, depth, param){          /* a slow oscillator that makes a layer breathe */
      const o = c.createOscillator(), og = c.createGain(); o.frequency.value = rate; og.gain.value = depth;
      o.connect(og); og.connect(param); o.start(); return o;
    };
    this.L.wind = mk('bandpass', 520, 0.7); slow(this.L.wind, 0.11, 160, this.L.wind.fl.frequency);
    this.L.water = mk('lowpass', 420, 0.6); slow(this.L.water, 0.22, 140, this.L.water.fl.frequency);
    this.L.rumble = mk('lowpass', 140, 0.5);
    this.L.hiss = mk('highpass', 3800, 0.5);
    /* the hum: two sines a fifth apart */
    const hum = c.createGain(); hum.gain.value = 0; hum.connect(this.bus);
    [55, 82.5].forEach(function(f){ const o = c.createOscillator(); o.type = 'sine'; o.frequency.value = f; o.connect(hum); o.start(); });
    this.L.hum = { g: hum };
  },
  /* one-shot sounds on top of the bed */
  chirp(kind){
    const B = this.bus, t = SFX;
    if (kind === 'cricket'){ for (let i = 0; i < 4; i++) t.tone('square', 4300, 4300, 0.03, 0.018, i * 0.055, 0, B); }
    else if (kind === 'bird'){ const f = 1700 + Math.random() * 1400; t.tone('sine', f, f * 1.5, 0.09, 0.05, 0, 0, B); t.tone('sine', f * 1.3, f * 1.8, 0.1, 0.045, 0.12, 0, B); if (Math.random() < 0.5) t.tone('sine', f * 1.1, f * 1.6, 0.08, 0.04, 0.26, 0, B); }
    else if (kind === 'frog'){ t.tone('sine', 170, 230, 0.1, 0.07, 0, 0, B); t.tone('sine', 180, 250, 0.12, 0.07, 0.16, 0, B); }
    else if (kind === 'bubble'){ const f = 280 + Math.random() * 300; t.tone('sine', f, f * 2.6, 0.09, 0.05, 0, 0, B); }
    else if (kind === 'pop'){ t.burst(0.04 + Math.random() * 0.04, 0.05, 2600 + Math.random() * 2400, 900, 1.2, 0, 'bandpass', B); }
    else if (kind === 'ping'){ t.tone('sine', 760, 740, 0.7, 0.025, 0, 0, B); }
    else if (kind === 'sparkle'){ const f = 2400 + Math.random() * 1800; t.tone('sine', f, f * 1.3, 0.16, 0.03, 0, 0, B); t.tone('sine', f * 1.5, f * 1.7, 0.12, 0.02, 0.06, 0, B); }
  },
  update(dt){
    if (!SFX.ctx) return;
    this.build();
    if (!this.built) return;
    const c = SFX.ctx, now = c.currentTime, s = G.state;
    const inRun = (s === 'playing' || s === 'levelup' || s === 'transform' || s === 'chaptertrans') && !G.attract;
    /* louder in play, a soft bed under the menu, quiet while paused, none in films and shops */
    const want = inRun ? 1 : s === 'paused' ? 0.35 : (s === 'menu' || s === 'help') ? 0.3 : 0;
    this.mul += (want - this.mul) * Math.min(1, dt * 2);
    const av = typeof Settings.ambVol === 'number' ? Settings.ambVol : 1;          /* the Ambience volume setting */
    this.bus.gain.setTargetAtTime(this.mul * av, now, 0.4);
    const ch = G.attract || s === 'menu' || s === 'help' ? (typeof atmosChapter === 'function' ? atmosChapter() : 1) : clamp(G.chapter | 0 || 1, 1, TOTAL_CHAPTERS);
    const prof = AMB_PROFILES[ch] || AMB_PROFILES[1];
    const lv = { wind: prof.wind || 0, water: prof.water || 0, rumble: prof.rumble || 0, hiss: prof.hiss || 0, hum: prof.hum || 0 };
    /* the weather that is actually falling right now */
    const add = function(key, k){ const w = AMB_WEATHER[key]; if (!w) return; for (let i = 0; i < w.length; i++) lv[w[i][0]] += w[i][1] * k; };
    if (typeof Atmos !== 'undefined' && Atmos.state) add(Atmos.state.weather, 1);
    if (typeof WxE !== 'undefined' && WxE.cur && WxE.k > 0.01) add(WxE.cur.weather, WxE.k);
    const L = this.L;
    for (const k in lv) if (L[k]) L[k].g.gain.setTargetAtTime(lv[k], now, 0.8);
    if (prof.windF) L.wind.fl.frequency.setTargetAtTime(prof.windF, now, 1.5);
    /* one-shots */
    if (this.mul > 0.1 && prof.chirp && av > 0){
      this.chirpT -= dt;
      if (this.chirpT <= 0){ this.chirpT = rand(prof.chirp.every[0], prof.chirp.every[1]); this.chirp(prof.chirp.kind); }
    }
    /* a heartbeat when she is nearly dead */
    if (s === 'playing' && !G.attract && P.hp > 0 && P.hp / P.maxHp < 0.3){
      this.hbT -= dt;
      if (this.hbT <= 0){ SFX.beat(); this.hbT = lerp(0.5, 1.0, P.hp / P.maxHp / 0.3); }
    } else this.hbT = 0.4;
  }
};

/* ---- a controller rumbles with the screen ---- */
function padRumble(strong, weak, ms){
  if (!Input.padOn || !navigator.getGamepads) return;
  try {
    const gps = navigator.getGamepads();
    for (let i = 0; i < gps.length; i++){
      const gp = gps[i];
      if (gp && gp.connected && gp.vibrationActuator && gp.vibrationActuator.playEffect)
        gp.vibrationActuator.playEffect('dual-rumble', { duration: ms, strongMagnitude: strong, weakMagnitude: weak });
    }
  } catch (e) {}
}
