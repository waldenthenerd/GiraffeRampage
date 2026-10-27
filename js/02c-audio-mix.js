'use strict';
/* Sound design on top of the synth in 01-core.js and the music in 02-music.js: a reverb that follows the place, a hit sound for every
   element, a death sound for every kind of creature, boss voices, footsteps, and music stingers. Loaded after 02b-ambience.js. */
/* ========================= 2d. AUDIO MIX ========================= */
/* Everything here is synthesised on the same audio context and goes through the same buses, so the Effects volume, the mute
   switch and the limiter in 01-core.js all still apply. Reverb and stereo placement are skipped at effects level Low. */

/* what each place sounds like: [how much reverb, how dark it is (low-pass Hz)] */
const MIX_ENV = {
  1: [0.10, 7500],      /* open savanna: barely any */
  2: [0.17, 6000],      /* snow valley: a thin echo */
  3: [0.15, 3200],      /* swamp: damp and dull */
  4: [0.32, 1300],      /* the deep: underwater, dark and wet */
  5: [0.17, 4200],      /* jungle */
  6: [0.24, 6000],      /* streets: slap-back off the buildings */
  7: [0.12, 6500],      /* space center */
  8: [0.04, 3000],      /* the moon: almost no air to ring in */
  9: [0.19, 3000],      /* Venus */
  10: [0.24, 2600],     /* the Inferno: a cavern of fire */
  11: [0.20, 9000],     /* the Changed Savannah: shimmer */
  12: [0.30, 4800],     /* Area 51: a hangar */
  13: [0.08, 4200],     /* Mars: thin air */
  14: [0.30, 5200],     /* a dome: a big cold hall */
  15: [0.18, 6200],     /* an office tower: carpet and glass */
  16: [0.22, 5600]      /* a town street under attack: stone, open sky */
};
const MIX_FOOT_BIOME = ['savanna', 'snow', 'swamp', 'ocean', 'jungle', 'city', 'space', 'moon', 'venus', 'area51', 'mars'];

/* far-off calls that drift in now and then, per chapter (every 20-45 seconds, quiet, from one side) */
const MIX_FAR = { 1: 'hyena', 2: 'howl', 3: 'owl', 4: 'whale', 5: 'macaw', 6: 'siren', 7: 'radio', 9: 'quake', 10: 'quake', 11: 'chime', 12: 'radio' };

const Mix = {
  built: false, on: false, musicSent: false, h: null, k: null, rs: 0.5, fv: 1, lr: 0, lastStep: 0, walkSeen: 0,
  src: null, gustT: 8, farT: 22,
  /* the sound an enemy makes for a generic effect name: a rifle for a soldier, a spit of plasma for an alien, a charge for a
     heavy beast, and so on (the name comes from the existing call sites; the creature decides what it becomes) */
  variant(name, e){
    const d = e.def || {}, st = typeof deathStyle === 'function' ? deathStyle(e) : 'flesh', mech = st === 'metal' || !!d.marine;
    switch (name){
      case 'spit':   return mech ? 'eRifle' : (st === 'ichor' || st === 'fire' || st === 'ice') ? 'ePlasma' : 'spit';
      case 'whoosh': return e.big ? 'eCharge' : mech ? 'eJet' : 'eDash';
      case 'boom':   return e.big ? 'eSlam' : 'eThud';
      case 'zap':    return 'eZap';
      case 'hit':    return 'eSwing';
      default:       return name;
    }
  },
  build(){
    const c = SFX.ctx; if (!c || this.built || !SFX.master) return;
    this.built = true;
    this.verbIn = c.createGain();
    /* a two-second noise burst that dies away, getting darker as it goes: a room, without any audio file */
    const len = Math.floor(c.sampleRate * 2.0), buf = c.createBuffer(2, len, c.sampleRate);
    for (let ch = 0; ch < 2; ch++){
      const d = buf.getChannelData(ch); let lp = 0;
      for (let i = 0; i < len; i++){
        const tt = i / len, a = 0.5 + 0.45 * tt;
        lp = a * lp + (1 - a) * (Math.random() * 2 - 1);
        d[i] = lp * Math.pow(1 - tt, 2.6) * (i < 48 ? i / 48 : 1);
      }
    }
    this.conv = c.createConvolver(); this.conv.buffer = buf;
    this.wetLp = c.createBiquadFilter(); this.wetLp.type = 'lowpass'; this.wetLp.frequency.value = 6000; this.wetLp.Q.value = 0.5;
    this.wet = c.createGain(); this.wet.gain.value = 0;
    this.conv.connect(this.wetLp); this.wetLp.connect(this.wet); this.wet.connect(SFX.master);
    const tap = function(src, amt){ const g = c.createGain(); g.gain.value = amt; src.connect(g); g.connect(Mix.verbIn); };
    tap(SFX.abilityGain, 0.7); tap(SFX.eventGain, 1.0);
  },
  setOn(on){
    if (on === this.on || !this.built) return;
    this.on = on;
    if (on) this.verbIn.connect(this.conv); else { try { this.verbIn.disconnect(); } catch (e) {} }     /* off: the convolver gets no input and costs nothing */
  },
  update(dt){
    if (!SFX.ctx) return;
    this.build();
    if (!this.built) return;
    const c = SFX.ctx, now = c.currentTime, s = G.state, fx = fxLevelNow();
    this.setOn(fx > 0);
    if (!this.musicSent && Music.lp){
      this.musicSent = true;
      const g = c.createGain(); g.gain.value = 0.5; Music.lp.connect(g); g.connect(this.verbIn);
    }
    /* the place */
    let env;
    if (s === 'cutscene') env = [0.14, 6000];
    else {
      const ch = G.attract || s === 'menu' || s === 'help' ? (typeof atmosChapter === 'function' ? atmosChapter() : 1) : clamp(G.chapter | 0 || 1, 1, TOTAL_CHAPTERS);
      env = MIX_ENV[ch] || MIX_ENV[1];
      if (s === 'shop') env = [0.12, 6500];
    }
    this.wet.gain.setTargetAtTime(env[0] * (fx >= 2 ? 1 : 0.7), now, 0.8);
    this.wetLp.frequency.setTargetAtTime(env[1], now, 0.8);

    const run = s === 'playing' && !G.attract && !P.dead;
    /* the boss turns: half its health gone, and the music has already moved up a gear (02-music.js) */
    const b = G.boss;
    if (run && b && G.bossAlive && b.maxHp && !b.phase2 && b.hp / b.maxHp < 0.5 && b.hp > 0){
      b.phase2 = true; sfx('phase', 0.5, b.x, b.y); Music.sting(0.4, 1.4);
    }
    /* the place's own sounds: gusts of wind that sweep across, and calls from far away */
    if (run && Amb.built && Amb.mul > 0.5 && (Settings.ambVol === undefined || Settings.ambVol > 0)){
      const ch = clamp(G.chapter | 0 || 1, 1, TOTAL_CHAPTERS), prof = AMB_PROFILES[ch] || {};
      let wind = prof.wind || 0;
      const addW = function(key, k){ const w = AMB_WEATHER[key]; if (!w) return; for (let i = 0; i < w.length; i++) if (w[i][0] === 'wind') wind += w[i][1] * k; };
      if (typeof Atmos !== 'undefined' && Atmos.state) addW(Atmos.state.weather, 1);
      if (typeof WxE !== 'undefined' && WxE.cur && WxE.k > 0.01) addW(WxE.cur.weather, WxE.k);
      this.gustT -= dt;
      if (this.gustT <= 0){
        this.gustT = Math.max(3, rand(8, 16) / (1 + wind * 7));
        if (wind > 0.035) this.gust(wind);
      }
      this.farT -= dt;
      if (this.farT <= 0){
        this.farT = rand(20, 45);
        if (MIX_FAR[ch]) this.far(MIX_FAR[ch]);
      }
    }
    /* footsteps: once per leg cycle while she is really moving */
    if (run){
      if (P.walk < this.walkSeen - 1) this.lastStep = Math.floor(P.walk / Math.PI);
      this.walkSeen = P.walk;
      const k = Math.floor(P.walk / Math.PI), mv = Math.hypot(P.vx, P.vy);
      if (k !== this.lastStep){
        this.lastStep = k;
        if (mv > 45){ this.fv = Math.min(1, mv / 260); this.lr ^= 1; sfx('foot', 0.12); }
      }
    }
  },
  /* a gust: filtered wind that rises and falls while it sweeps from one ear to the other */
  gust(strength){
    const c = SFX.ctx, buf = Amb.noise || SFX.noise; if (!c || !buf || !Amb.bus || SFX.muted) return;
    const t = c.currentTime, dur = 2.2 + Math.random() * 0.7, dir = Math.random() < 0.5 ? -1 : 1;
    const src = c.createBufferSource(); src.buffer = buf;
    const bp = c.createBiquadFilter(); bp.type = 'bandpass'; bp.Q.value = 0.8;
    bp.frequency.setValueAtTime(360, t); bp.frequency.linearRampToValueAtTime(900, t + dur * 0.4); bp.frequency.linearRampToValueAtTime(420, t + dur);
    const g = c.createGain(), pk = Math.min(0.2, 0.05 + strength * 1.1);
    g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(pk, t + dur * 0.4); g.gain.linearRampToValueAtTime(0.0001, t + dur);
    src.connect(bp); bp.connect(g);
    if (c.createStereoPanner && fxLevelNow() > 0){
      const sp = c.createStereoPanner(); sp.pan.setValueAtTime(-0.85 * dir, t); sp.pan.linearRampToValueAtTime(0.85 * dir, t + dur);
      g.connect(sp); sp.connect(Amb.bus);
    } else g.connect(Amb.bus);
    src.start(t, Math.random() * Math.max(0, buf.duration - dur - 0.1)); src.stop(t + dur + 0.05);
  },
  /* thunder: the farther the strike, the later it arrives, the lower and softer it is, and the longer it rolls */
  thunder(far, pan){
    const c = SFX.ctx; if (!c || SFX.muted) return;
    const bus = Amb.bus || SFX.eventGain, vol = 1 - 0.55 * far;
    let out = bus;
    if (c.createStereoPanner && fxLevelNow() > 0){ const sp = c.createStereoPanner(); sp.pan.value = clamp(pan, -0.9, 0.9); sp.connect(bus); out = sp; }
    if (far < 0.4) SFX.burst(0.14, 0.24 * vol, 5200, 700, 0.8, 0, 'highpass', out);                         /* a close strike cracks first */
    SFX.burst(0.9 + far * 1.4, 0.32 * vol, 380 - 140 * far, 45, 0.6, 0, 'lowpass', out);
    SFX.tone('sine', 70, 28, 0.9 + far * 1.2, 0.26 * vol, 0, 0, out);
    if (far > 0.35){ SFX.burst(0.9, 0.16 * vol, 260, 40, 0.6, 0.55, 'lowpass', out); SFX.burst(0.9, 0.1 * vol, 220, 40, 0.6, 1.2, 'lowpass', out); }       /* it rolls */
  },
  /* a call from far away: placed well off to one side, quiet, on the ambience bus */
  far(kind){
    const c = SFX.ctx, B = Amb.bus; if (!c || !B || SFX.muted) return;
    const side = Math.random() < 0.5 ? -1 : 1;
    SFX.at(P.x + side * rand(1000, 1500), P.y + rand(-400, 400));
    try {
      const T = function(type, f0, f1, dur, vol, delay){ SFX.tone(type, f0, f1, dur, vol, delay, 0, B); };
      switch (kind){
        case 'hyena': for (let i = 0; i < 5; i++){ const f = 620 - i * 50 + rand(-30, 30); T('triangle', f, f * 0.6, 0.09, 0.05, i * 0.12); } break;
        case 'howl':  T('sine', 330, 520, 0.8, 0.05, 0); T('sine', 520, 380, 1.0, 0.045, 0.8); break;
        case 'owl':   T('sine', 380, 330, 0.26, 0.05, 0); T('sine', 370, 320, 0.3, 0.045, 0.5); break;
        case 'whale': T('sine', 140, 220, 1.4, 0.05, 0); T('sine', 220, 150, 1.6, 0.045, 1.4); break;
        case 'macaw': T('sawtooth', 900, 520, 0.16, 0.025, 0); T('sawtooth', 950, 560, 0.18, 0.025, 0.24); break;
        case 'siren': T('sine', 600, 900, 1.2, 0.03, 0); T('sine', 900, 600, 1.2, 0.03, 1.2); break;
        case 'radio': for (let i = 0; i < 3; i++) T('square', 1200, 1200, 0.04, 0.02, i * 0.16); break;
        case 'quake': SFX.burst(1.8, 0.14, 160, 40, 0.5, 0, 'lowpass', B); break;
        case 'chime': [880, 1320, 1760].forEach(function(f, i){ T('sine', f, f, 0.9, 0.025, i * 0.12); }); break;
      }
    } finally { SFX.pos = null; }
  },
  roarAt(e){
    let h = 7; const t = String(e.type || 'boss');
    for (let i = 0; i < t.length; i++) h = (h * 31 + t.charCodeAt(i)) % 997;
    this.rs = h / 997;
    sfx('roar', 0.5, e.x, e.y);
  }
};

/* ---- what element a hit is made of, from the card that dealt it and the effect it carries ---- */
function soundElem(opts){
  if (opts && opts.burn) return 'burn';
  if (opts && opts.slow) return 'slow';
  if (opts && opts.stun) return 'stun';
  try {
    const f = FUSE_INFO[dmgSrc]; if (f) return f.elem;
    const d = CARDMAP[dmgSrc]; if (d && d.combo && d.cfg) return d.cfg.el || 'plain';
  } catch (e) {}
  return 'plain';
}
function sfxHit(e, crit, opts){
  Mix.h = { el: soundElem(opts), frost: !!(e.def && e.def.frost) };
  sfx(crit ? 'critOf' : 'hitOf', crit ? 0.05 : 0.035, e.x, e.y);
}
function sfxKill(e){
  Mix.k = { style: typeof deathStyle === 'function' ? deathStyle(e) : 'flesh', r: e.r || 15 };
  sfx('killOf', 0.05, e.x, e.y);
}

Object.assign(SFX, {
  hitOf(){ const h = Mix.h; if (!h || h.el === 'plain') this.hit(); else this.hitEl(h.el, h.frost); },
  critOf(){ const h = Mix.h; this.crit(); if (h && h.el !== 'plain') this.hitEl(h.el, h.frost); },
  /* one timbre per element, so a fire card does not sound like a lightning card */
  hitEl(el, frost){
    const b = this.abilityGain, d = (Math.random() - 0.5) * 300;
    switch (el){
      case 'burn':  this.burst(0.09, 0.12, 4200, 1400, 0.9, 0, 'highpass', b); this.tone('sawtooth', 330, 130, 0.07, 0.07, 0, d, b); break;
      case 'slow':
        if (frost){ this.tone('sine', 2300, 1500, 0.09, 0.08, 0, d, b); this.tone('sine', 3400, 2700, 0.06, 0.04, 0.02, 0, b); }
        else { this.tone('sine', 520 + Math.random() * 120, 230, 0.09, 0.12, 0, d, b); this.burst(0.07, 0.09, 900, 260, 0.9, 0, 'lowpass', b); }
        break;
      case 'stun':  this.burst(0.07, 0.13, 6200, 1800, 2.2, 0, 'bandpass', b); this.tone('square', 1400, 520, 0.05, 0.06, 0, d, b); break;
      case 'knock': this.tone('sine', 190, 70, 0.1, 0.2, 0, d * 0.3, b); this.burst(0.06, 0.1, 500, 140, 0.8, 0, 'lowpass', b); break;
      case 'bleed': this.burst(0.09, 0.11, 1000, 320, 1, 0, 'lowpass', b); this.tone('triangle', 330, 170, 0.08, 0.08, 0, d, b); break;
      default: this.hit();
    }
  },
  /* a creature falls: what it was made of and how big it was decide the sound */
  killOf(){
    const k = Mix.k || { style: 'flesh', r: 15 }, b = this.abilityGain, d = (Math.random() - 0.5) * 300;
    const f = Math.max(0.55, Math.min(1.5, 15 / Math.max(6, k.r))), big = k.r >= 24;
    switch (k.style){
      case 'metal':
        this.burst(0.12, 0.2, 5200, 1100, 0.8, 0, 'highpass', b); this.tone('square', 240 * f, 90 * f, 0.1, 0.1, 0, d, b); this.tone('sine', 1900 * f, 1500 * f, 0.07, 0.05, 0.02, 0, b); break;
      case 'fire':
        this.burst(0.18, 0.2, 3800, 900, 0.7, 0, 'highpass', b); this.burst(0.2, 0.2, 500, 100, 0.6, 0, 'lowpass', b); this.tone('sawtooth', 260 * f, 70 * f, 0.15, 0.09, 0, d, b); break;
      case 'ice':
        for (let i = 0; i < 3; i++) this.tone('sine', 2400 + Math.random() * 1800, 1800 + Math.random() * 900, 0.07, 0.06, i * 0.035, 0, b);
        this.burst(0.1, 0.12, 7000, 3000, 1.2, 0, 'highpass', b); break;
      case 'goo':
        this.tone('sine', 300 * f, 80 * f, 0.2, 0.14, 0, d, b); this.burst(0.15, 0.16, 700, 160, 0.9, 0, 'lowpass', b); break;
      case 'bubbles':
        for (let i = 0; i < 3; i++){ const q = (350 + Math.random() * 350) * f; this.tone('sine', q, q * 2.4, 0.08, 0.07, i * 0.05, 0, b); }
        this.burst(0.1, 0.08, 1200, 300, 0.8, 0, 'lowpass', b); break;
      case 'ichor':
        this.tone('sine', 950 * f, 190 * f, 0.2, 0.1, 0, d, b); this.tone('sine', 1420 * f, 280 * f, 0.16, 0.06, 0.01, d, b); this.burst(0.1, 0.09, 5500, 2200, 1.4, 0.02, 'bandpass', b); break;
      default:                                                       /* flesh: a squeak, the usual crunch, or a heavy thud */
        if (k.r < 12){ this.tone('triangle', 900 * f, 480 * f, 0.08, 0.1, 0, d, b); this.burst(0.06, 0.1, 2400, 700, 0.8, 0, 'bandpass', b); }
        else if (!big) this.kill();
    }
    if (big){ this.tone('sine', 125, 46, 0.26, 0.3, 0, d * 0.3, b); this.burst(0.22, 0.2, 600, 110, 0.6, 0, 'lowpass', b); }
  },
  /* a boss comes apart: a long fall, a sub-bass boom, and a run of notes dropping away */
  bossDie(){
    const b = this.eventGain;
    this.tone('sawtooth', 170, 34, 1.5, 0.3, 0, 0, b); this.tone('sine', 62, 26, 1.3, 0.5, 0, 0, b); this.burst(1.3, 0.28, 1400, 70, 0.5, 0, 'lowpass', b);
    [1180, 880, 660, 495, 370].forEach((f, i) => this.tone('triangle', f, f * 0.97, 0.22, 0.1, 0.3 + i * 0.1, 0, b));
    this.burst(0.5, 0.1, 6000, 2000, 1, 0.35, 'bandpass', b);
  },
  /* a boss's voice on arrival: a rasp that falls, with a wobble and a mouth-shaped filter; each boss type has its own pitch */
  roar(){
    const c = this.ctx; if (!c || this.muted) return;
    const s = Mix.rs, f0 = 70 + s * 70, t = c.currentTime, dur = 1.1;
    const o = c.createOscillator(), g = c.createGain(), lfo = c.createOscillator(), lg = c.createGain(), fl = c.createBiquadFilter();
    o.type = 'sawtooth'; o.frequency.setValueAtTime(f0 * 1.5, t); o.frequency.exponentialRampToValueAtTime(f0 * 0.55, t + dur);
    lfo.frequency.value = 14 + s * 10; lg.gain.value = f0 * 0.12; lfo.connect(lg); lg.connect(o.frequency);
    fl.type = 'bandpass'; fl.Q.value = 2.2; fl.frequency.setValueAtTime(500 + s * 400, t); fl.frequency.exponentialRampToValueAtTime(220, t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.38, t + 0.12); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(fl); fl.connect(g); g.connect(this.route(this.eventGain));
    o.start(t); lfo.start(t); o.stop(t + dur + 0.05); lfo.stop(t + dur + 0.05);
    this.burst(0.7, 0.14, 1100, 260, 1.4, 0.05, 'bandpass', this.eventGain);
  },
  /* the boss is half gone: a rising growl */
  phase(){
    const b = this.eventGain;
    this.tone('sawtooth', 90, 190, 0.7, 0.22, 0, 0, b); this.tone('sawtooth', 135, 285, 0.7, 0.14, 0.02, 0, b); this.burst(0.8, 0.18, 200, 3200, 0.6, 0, 'bandpass', b);
  },
  /* ---- enemy attacks: each kind of attacker has its own voice, placed where it stands ---- */
  /* a soldier's rifle: a sharp crack and a short tail */
  eRifle(){ const b = this.abilityGain, d = (Math.random() - 0.5) * 200; this.burst(0.04, 0.15, 5500, 2000, 0.8, 0, 'highpass', b); this.tone('square', 900, 300, 0.05, 0.08, 0, d, b); this.burst(0.09, 0.06, 900, 250, 0.7, 0.02, 'lowpass', b); },
  /* an alien's shot: a wet, glassy blorp */
  ePlasma(){ const b = this.abilityGain, d = (Math.random() - 0.5) * 200; this.tone('sawtooth', 1100, 400, 0.12, 0.08, 0, d, b); this.tone('sine', 1650, 600, 0.1, 0.05, 0.01, d, b); this.burst(0.08, 0.06, 3000, 900, 2, 0, 'bandpass', b); },
  /* a quick lunge */
  eDash(){ const b = this.abilityGain; this.burst(0.16, 0.13, 900, 3500, 0.9, 0, 'bandpass', b); this.tone('sine', 300, 700, 0.1, 0.05, 0, 0, b); },
  /* a heavy animal builds up its charge: a low rising rumble */
  eCharge(){ const b = this.abilityGain; this.tone('sawtooth', 70, 125, 0.38, 0.16, 0, 0, b); this.burst(0.36, 0.2, 200, 650, 0.7, 0, 'lowpass', b); },
  /* a machine's thrust */
  eJet(){ const b = this.abilityGain; this.burst(0.25, 0.14, 1200, 300, 0.8, 0, 'bandpass', b); this.tone('square', 160, 90, 0.2, 0.06, 0, 0, b); },
  /* a big thing hits the ground */
  eSlam(){ const b = this.eventGain; this.tone('sine', 95, 30, 0.45, 0.3, 0, 0, b); this.burst(0.4, 0.24, 700, 80, 0.6, 0, 'lowpass', b); this.tone('sawtooth', 140, 50, 0.3, 0.1, 0, 0, b); },
  eThud(){ const b = this.abilityGain; this.tone('sine', 140, 55, 0.18, 0.22, 0, 0, b); this.burst(0.15, 0.14, 600, 120, 0.7, 0, 'lowpass', b); },
  /* an alien discharge: low and buzzing, not like her own lightning */
  eZap(){ const b = this.abilityGain; this.tone('sawtooth', 220, 110, 0.14, 0.1, 0, 0, b); this.burst(0.14, 0.14, 3800, 900, 3, 0, 'bandpass', b); this.tone('sine', 1100, 1000, 0.12, 0.04, 0.02, 0, b); },
  /* a melee blow landing */
  eSwing(){ const b = this.abilityGain; this.burst(0.08, 0.16, 1400, 400, 0.9, 0, 'bandpass', b); this.tone('triangle', 240, 100, 0.08, 0.12, 0, 0, b); },
  /* a ground blast going off */
  eBlast(){ const b = this.abilityGain; this.tone('sine', 130, 38, 0.34, 0.36, 0, 0, b); this.burst(0.3, 0.26, 900, 110, 0.6, 0, 'lowpass', b); this.burst(0.05, 0.1, 4500, 1500, 0.9, 0, 'highpass', b); },
  /* a beam firing: a sweep upward */
  eBeam(){ const b = this.abilityGain; this.tone('sawtooth', 300, 1800, 0.25, 0.09, 0, 0, b); this.burst(0.25, 0.1, 2000, 5000, 1.2, 0, 'bandpass', b); },
  /* one footfall, by the ground she is on; quiet, and softer the slower she goes */
  foot(){
    const b = this.abilityGain, v = (0.5 + 0.5 * Mix.fv) * (Mix.lr ? 1.06 : 0.94), bio = G.biome;
    const L = function(x){ return x * v; };
    switch (bio){
      case 'snow': case 'dome': case 'tower': case 'siege':   this.burst(0.07, L(0.10), 3000 * v, 1500, 1, 0, 'bandpass', b); break;
      case 'swamp':  this.burst(0.1, L(0.10), 500, 180, 0.9, 0, 'lowpass', b); this.tone('sine', 200 * v, 110, 0.08, L(0.04), 0, 0, b); break;
      case 'ocean':  this.burst(0.12, L(0.08), 1200, 400, 0.8, 0, 'lowpass', b); break;
      case 'jungle': this.burst(0.08, L(0.08), 2200, 900, 0.8, 0, 'bandpass', b); this.tone('sine', 120 * v, 70, 0.06, L(0.04), 0, 0, b); break;
      case 'city':   this.burst(0.035, L(0.09), 2500, 1200, 0.9, 0, 'highpass', b); this.tone('sine', 220 * v, 120, 0.04, L(0.05), 0, 0, b); break;
      case 'space': case 'area51': this.tone('square', 520 * v, 480, 0.03, L(0.03), 0, 0, b); this.burst(0.04, L(0.07), 4000, 1800, 1, 0, 'highpass', b); break;
      case 'moon':   this.burst(0.09, L(0.06), 600, 200, 0.7, 0, 'lowpass', b); break;
      case 'venus':  this.burst(0.06, L(0.10), 1800, 700, 1.2, 0, 'bandpass', b); this.tone('sine', 90 * v, 60, 0.05, L(0.05), 0, 0, b); break;
      case 'mars':   this.burst(0.07, L(0.08), 1000, 300, 0.8, 0, 'lowpass', b); break;
      default:       this.burst(0.06, L(0.09), 900, 300, 0.8, 0, 'lowpass', b); this.tone('sine', 110 * v, 70, 0.06, L(0.06), 0, 0, b);
    }
  }
});

/* ---- stingers: the big sounds pull the music down for a moment so they land ---- */
[['level', 0.5, 0.9], ['clear', 0.55, 1.0], ['boss', 0.5, 1.0], ['stomp', 0.3, 1.4], ['transform', 0.4, 1.4], ['wave', 0.65, 0.8]].forEach(function(r){
  const orig = SFX[r[0]]; if (typeof orig !== 'function') return;
  SFX[r[0]] = function(){ Music.sting(r[1], r[2]); return orig.apply(this, arguments); };
});

/* ---- Mix.update runs once a frame, alongside the ambience ---- */
(function(){
  const orig = Amb.update;
  Amb.update = function(dt){ orig.call(this, dt); try { Mix.update(dt); } catch (e) {} };
  /* the little chirps of each place come from somewhere around her, not from the middle of her head */
  const chirp = Amb.chirp;
  Amb.chirp = function(kind){
    SFX.at(P.x + rand(-760, 760), P.y + rand(-420, 420));
    try { chirp.call(this, kind); } finally { SFX.pos = null; }
  };
})();
/* while an enemy is being updated its sounds come from it: Mix.src is set per enemy at the top of the loop in updateEnemies
   (09-enemy-ai.js) and cleared when the loop ends; that file is loaded after this one, so it does the setting itself */
