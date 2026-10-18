'use strict';
/* Procedural background music: themes and the sequencer. */
/* ========================= 2b. MUSIC (procedural, no audio files) ========================= */
/* A small step sequencer on the same audio context as SFX. Each theme is a key,
   scale and chord loop; the layers (pad, bass, arp, lead, drums) switch on with an
   intensity level: 0 calm (menus), 1 in a run, 2 while a boss is alive. */
const MUSIC_SCALES = { dorian:[0,2,3,5,7,9,10], minor:[0,2,3,5,7,8,10], phrygian:[0,1,3,5,7,8,10], lydian:[0,2,4,6,7,9,11], pent:[0,2,4,7,9], mpent:[0,3,5,7,10], harm:[0,2,3,5,7,8,11], major:[0,2,4,5,7,9,11] };
const MUSIC_THEMES = {
  menu:     { bpm: 84,  root: 50, scale: 'pent',     prog: [0,5,3,7],   minor: false, bass: 'triangle', lead: 'triangle', drum: 'tribal' },
  savanna:  { bpm: 102, root: 50, scale: 'dorian',   prog: [0,0,5,3],   minor: true,  bass: 'triangle', lead: 'triangle', drum: 'tribal' },
  frost:    { bpm: 78,  root: 57, scale: 'minor',    prog: [0,8,3,10],  minor: true,  bass: 'sine',     lead: 'sine',     drum: 'soft' },
  swamp:    { bpm: 72,  root: 43, scale: 'phrygian', prog: [0,1,0,10],  minor: true,  bass: 'square',   lead: 'triangle', drum: 'tribal' },
  ocean:    { bpm: 86,  root: 52, scale: 'lydian',   prog: [0,2,7,4],   minor: false, bass: 'sine',     lead: 'sine',     drum: 'soft' },
  jungle:   { bpm: 114, root: 45, scale: 'mpent',    prog: [0,3,5,3],   minor: true,  bass: 'triangle', lead: 'triangle', drum: 'tribal' },
  city:     { bpm: 108, root: 46, scale: 'minor',    prog: [0,8,5,10],  minor: true,  bass: 'sawtooth', lead: 'square',   drum: 'beat' },
  space:    { bpm: 90,  root: 48, scale: 'dorian',   prog: [0,7,5,3],   minor: true,  bass: 'sine',     lead: 'sine',     drum: 'soft' },
  moon:     { bpm: 66,  root: 41, scale: 'pent',     prog: [0,3,7,5],   minor: false, bass: 'sine',     lead: 'sine',     drum: 'soft' },
  venus:    { bpm: 92,  root: 44, scale: 'phrygian', prog: [0,1,5,1],   minor: true,  bass: 'sawtooth', lead: 'triangle', drum: 'beat' },
  inferno:  { bpm: 120, root: 40, scale: 'harm',     prog: [0,1,0,8],   minor: true,  bass: 'sawtooth', lead: 'square',   drum: 'heavy' },
  glimmer:  { bpm: 96,  root: 55, scale: 'lydian',   prog: [0,4,2,7],   minor: false, bass: 'triangle', lead: 'sine',     drum: 'soft' },
  area51:   { bpm: 100, root: 45, scale: 'minor',    prog: [0,0,3,1],   minor: true,  bass: 'square',   lead: 'square',   drum: 'beat' },
  mars:     { bpm: 94,  root: 47, scale: 'dorian',   prog: [0,3,0,10],  minor: true,  bass: 'sawtooth', lead: 'triangle', drum: 'beat' },
  marswar:  { bpm: 118, root: 45, scale: 'harm',     prog: [0,0,3,1],   minor: true,  bass: 'sawtooth', lead: 'square',   drum: 'beat' },
  /* the minigames: bright and quick */
  minigame: { bpm: 124, root: 52, scale: 'pent',   prog: [0,5,3,7],   minor: false, bass: 'triangle', lead: 'square',   drum: 'beat' },
  /* Longneck Town */
  town:      { bpm: 92,  root: 53, scale: 'major', prog: [0,5,3,7], minor: false, bass: 'triangle', lead: 'triangle', drum: 'soft' },
  townnight: { bpm: 70,  root: 50, scale: 'pent',  prog: [0,3,5,7], minor: false, bass: 'sine',     lead: 'sine',     drum: 'soft' },
  burrow:    { bpm: 62,  root: 45, scale: 'mpent', prog: [0,5,7,3], minor: true,  bass: 'sine',     lead: 'triangle', drum: 'soft' },
  /* screens */
  lab:     { bpm: 70,  root: 48, scale: 'mpent',    prog: [0,5,7,3],   minor: false, bass: 'sine',     lead: 'sine',     drum: 'soft' },
  shop:     { bpm: 98,  root: 52, scale: 'major',    prog: [0,5,7,5],   minor: false, bass: 'triangle', lead: 'triangle', drum: 'soft' },
  victory:  { bpm: 112, root: 50, scale: 'major',    prog: [0,5,7,0],   minor: false, bass: 'triangle', lead: 'triangle', drum: 'beat' },
  defeat:   { bpm: 58,  root: 45, scale: 'minor',    prog: [0,8,5,7],   minor: true,  bass: 'sine',     lead: 'sine',     drum: 'soft' },
  /* films */
  film:     { bpm: 72,  root: 43, scale: 'dorian',   prog: [0,5,3,7],   minor: true,  bass: 'sine',     lead: 'triangle', drum: 'soft' },
  film51:   { bpm: 88,  root: 41, scale: 'phrygian', prog: [0,1,0,6],   minor: true,  bass: 'square',   lead: 'square',   drum: 'soft' },
  filmhome: { bpm: 80,  root: 52, scale: 'major',    prog: [0,5,7,0],   minor: false, bass: 'triangle', lead: 'sine',     drum: 'soft' },
  filmvenus:{ bpm: 84,  root: 44, scale: 'harm',     prog: [0,1,0,8],   minor: true,  bass: 'sawtooth', lead: 'triangle', drum: 'soft' },
  filmmars: { bpm: 82,  root: 47, scale: 'dorian',   prog: [0,3,0,10],  minor: true,  bass: 'sine',     lead: 'triangle', drum: 'soft' },
  filmwar:  { bpm: 100, root: 40, scale: 'harm',     prog: [0,0,1,0],   minor: true,  bass: 'sawtooth', lead: 'square',   drum: 'tribal' },
  /* one boss theme per chapter, harder and faster than the chapter's own */
  boss1:  { bpm: 128, root: 45, scale: 'minor',    prog: [0,0,8,7],   minor: true, bass: 'sawtooth', lead: 'square',   drum: 'heavy', boss: true },
  boss2:  { bpm: 120, root: 52, scale: 'phrygian', prog: [0,1,0,8],   minor: true, bass: 'sawtooth', lead: 'triangle', drum: 'heavy', boss: true },
  boss3:  { bpm: 108, root: 40, scale: 'harm',     prog: [0,0,1,0],   minor: true, bass: 'square',   lead: 'square',   drum: 'heavy', boss: true },
  boss4:  { bpm: 124, root: 43, scale: 'minor',    prog: [0,10,8,7],  minor: true, bass: 'sawtooth', lead: 'sine',     drum: 'heavy', boss: true },
  boss5:  { bpm: 136, root: 47, scale: 'mpent',    prog: [0,3,0,5],   minor: true, bass: 'sawtooth', lead: 'triangle', drum: 'heavy', boss: true },
  boss6:  { bpm: 132, root: 44, scale: 'dorian',   prog: [0,0,3,10],  minor: true, bass: 'sawtooth', lead: 'square',   drum: 'heavy', boss: true },
  boss7:  { bpm: 126, root: 46, scale: 'phrygian', prog: [0,1,3,1],   minor: true, bass: 'sawtooth', lead: 'square',   drum: 'heavy', boss: true },
  boss8:  { bpm: 118, root: 41, scale: 'harm',     prog: [0,8,0,7],   minor: true, bass: 'sawtooth', lead: 'sine',     drum: 'heavy', boss: true },
  boss9:  { bpm: 130, root: 42, scale: 'phrygian', prog: [0,1,0,6],   minor: true, bass: 'sawtooth', lead: 'triangle', drum: 'heavy', boss: true },
  boss10: { bpm: 144, root: 38, scale: 'harm',     prog: [0,1,0,1],   minor: true, bass: 'sawtooth', lead: 'square',   drum: 'heavy', boss: true },
  boss11: { bpm: 124, root: 50, scale: 'minor',    prog: [0,3,8,7],   minor: true, bass: 'sawtooth', lead: 'sine',     drum: 'heavy', boss: true },
  boss12: { bpm: 132, root: 43, scale: 'minor',    prog: [0,6,0,5],   minor: true, bass: 'square',   lead: 'square',   drum: 'heavy', boss: true },
  boss13: { bpm: 128, root: 45, scale: 'harm',     prog: [0,0,3,8],   minor: true, bass: 'sawtooth', lead: 'square',   drum: 'heavy', boss: true }
};
const MUSIC_BY_CHAPTER = [null, 'savanna', 'frost', 'swamp', 'ocean', 'jungle', 'city', 'space', 'moon', 'venus', 'inferno', 'glimmer', 'area51', 'mars'];
const Music = {
  gain: null, timer: null, step: 0, nextT: 0, cur: null, want: { theme: 'menu', lvl: 0, tempo: 1 }, duck: 1, started: false,
  vol(){ return typeof Settings.musicVol === 'number' ? Settings.musicVol : 0.6; },
  hash(n){ n = (n ^ 61) ^ (n >>> 16); n = n + (n << 3); n = n ^ (n >>> 4); n = Math.imul(n, 0x27d4eb2d); n = n ^ (n >>> 15); return (n >>> 0) / 4294967296; },
  start(){
    if (this.started || !SFX.ctx) return;
    this.started = true;
    this.gain = SFX.ctx.createGain();
    this.gain.gain.value = 0;
    /* a low-pass in front of the master: wide open normally, closed down to a dull thud when she is nearly dead */
    this.lp = SFX.ctx.createBiquadFilter(); this.lp.type = 'lowpass'; this.lp.frequency.value = 18000; this.lp.Q.value = 0.5;
    /* a gain between the music and the filter dips and swells back when the theme changes, so a new theme fades in */
    this.xf = SFX.ctx.createGain(); this.xf.gain.value = 1;
    this.gain.connect(this.xf); this.xf.connect(this.lp); this.lp.connect(SFX.master);
    this.nextT = SFX.ctx.currentTime + 0.15;
    const self = this;
    this.timer = setInterval(function(){ self.pump(); }, 90);
    document.addEventListener('visibilitychange', function(){
      if (!SFX.ctx) return;
      if (document.hidden) SFX.ctx.suspend(); else SFX.ctx.resume();
    });
  },
  /* decide what should be playing from the game state; called every frame */
  refresh(){
    if (!SFX.ctx) return;
    this.start();
    const s = G.state;
    let theme = 'menu', lvl = 0, duck = 1, dense = false, shift = 0;
    const chap = G.chapter | 0, chTheme = MUSIC_BY_CHAPTER[chap] || 'savanna';
    if (s === 'playing' && !G.attract){
      theme = (G.chapter === 13 && chapterWaveOf(G.wave) > MARS_SWITCH_WAVE) ? 'marswar' : chTheme; lvl = 1;
      dense = chapterWaveOf(G.wave) >= 13;
      if (G.bossAlive){
        theme = 'boss' + chap; if (!MUSIC_THEMES[theme]) theme = chTheme; lvl = (G.wave % WAVES_PER_CHAPTER === 0) ? 3 : 2;
        if (G.boss && G.boss.maxHp && G.boss.hp / G.boss.maxHp < 0.5) lvl = 3;       /* the boss is half gone: the whole band comes in */
      } else {
        const cwv = chapterWaveOf(G.wave);                                            /* the key climbs through the chapter, five waves at a time */
        shift = [0, 2, 3, 5, 7][Math.min(4, Math.floor((cwv - 1) / 5))];
      }
    }
    else if (s === 'paused' || s === 'levelup'){
      theme = (G.bossAlive && MUSIC_THEMES['boss' + chap]) ? 'boss' + chap : chTheme; lvl = 1; duck = s === 'paused' ? 0.35 : 0.7;
    }
    else if (s === 'transform' || s === 'chaptertrans'){ theme = chTheme; lvl = 1; }
    else if (s === 'cutscene' && G.cut){
      const K = G.cut.kind, shn = shChapterOf(K);
      theme = shn ? (MUSIC_BY_CHAPTER[shn + 1] || chTheme) : K === 'a51' ? 'film51' : K === 'home' ? 'filmhome' : K === 'venus' ? 'filmvenus'
            : K === 'marshome' || K === 'fusion' ? 'filmhome' : K === 'mships' ? 'filmwar' : MARS_FILMS[K] ? 'filmmars' : 'film';
      lvl = (!shn && G.cut.t > 14) ? 1 : 0;
    }
    else if (s === 'cutscene'){ theme = 'film'; lvl = 0; }
    else if (s === 'scout'){ theme = 'venus'; lvl = 1; }
    else if (s === 'mscout'){ theme = 'mars'; lvl = 1; }
    else if (s === 'forage'){ theme = 'savanna'; lvl = 1; }
    else if (s === 'mini'){                                                              /* its own loop, in a different key for each minigame */
      const mm = G.mini; theme = 'minigame'; lvl = 1;
      if (mm){
        shift = [0, 2, 3, 5, 7][mm.ch % 5];
        if (mm.phase === 'intro') lvl = 0;
        else if (mm.phase === 'cele' || mm.phase === 'done'){ theme = mm.won ? 'victory' : 'defeat'; lvl = mm.won ? 1 : 0; shift = 0; }
        else if (mm.def && mm.def.dur && mm.def.dur - mm.time < 8) lvl = 2;               /* the last seconds: the band hardens */
      }
    }
    else if (s === 'miniask'){ theme = chTheme; lvl = 0; }
    else if (s === 'town' || s === 'fly' || (G.townReturn && Town.on && s !== 'shop' && s !== 'help' && s !== 'bestiary' && s !== 'menu')){      /* Longneck Town: a gentle walking tune, quieter and slower after dark, and its own in the Burrows */
      const cave = typeof TOWN_DIST !== 'undefined' && TOWN_DIST[Town.d] && TOWN_DIST[Town.d].cave;
      theme = cave ? 'burrow' : townIsNight() ? 'townnight' : 'town'; lvl = 0;
      shift = [0, 2, 3, 5, 7, 4, 9][Math.max(0, TOWN_IDS.indexOf(Town.d)) % 7];
    }
    else if (s === 'victory'){ theme = 'victory'; lvl = 1; }
    else if (s === 'dead'){ theme = 'defeat'; lvl = 0; }
    else if (G.labScreen) theme = 'lab';
    else if (G.venusScreen) theme = 'venus';
    else if (G.marsScreen) theme = 'mars';
    else if (s === 'shop') theme = 'shop';
    this.want.theme = theme; this.want.lvl = lvl; this.want.dense = dense; this.want.shift = shift;
    this.want.tempo = (s === 'playing' && !G.attract) ? [1, 1.08, 1.16, 1.24][G.runSpeedLevel | 0] || 1 : 1;
    /* nearly dead: the mix muffles and ducks a little, and opens up again as she recovers */
    const low = (s === 'playing' && !G.attract && P.hp > 0 && P.hp / P.maxHp < 0.3) ? 1 - P.hp / P.maxHp / 0.3 : 0;
    /* a stinger (level-up, wave clear, boss...) pulls the music down for a moment, quickly, and lets it back up slowly */
    const stung = SFX.ctx.currentTime < (this.stUntil || 0);
    const v = (SFX.muted || Settings.muted) ? 0 : this.vol() * 0.55 * duck * (1 - 0.3 * low) * (stung ? this.stDepth : 1);
    this.gain.gain.setTargetAtTime(v, SFX.ctx.currentTime, stung ? 0.05 : 0.25);
    if (this.lp) this.lp.frequency.setTargetAtTime(18000 - 17000 * Math.pow(low, 0.7), SFX.ctx.currentTime, 0.3);
  },
  pump(){
    const c = SFX.ctx;
    if (!c || !this.gain || c.state !== 'running') return;
    if (this.nextT < c.currentTime - 0.5) this.nextT = c.currentTime + 0.05;   /* fell behind (tab was asleep) */
    let guard = 0;
    while (this.nextT < c.currentTime + 0.3 && guard++ < 64){
      if (this.step % 16 === 0 || !this.cur){
        const prev = this.cur;
        this.cur = { theme: this.want.theme, lvl: this.want.lvl, tempo: this.want.tempo, dense: this.want.dense, shift: this.want.shift | 0 };
        if (prev && prev.theme !== this.cur.theme && this.xf){            /* a new theme: dip, then swell back in over a couple of seconds */
          const g = this.xf.gain, tt = Math.max(c.currentTime, this.nextT);
          g.cancelScheduledValues(tt - 0.01); g.setValueAtTime(0.35, tt); g.linearRampToValueAtTime(1, tt + 2.2);
        }
      }
      const th = MUSIC_THEMES[this.cur.theme] || MUSIC_THEMES.menu;
      const bpm = th.bpm * (this.cur.lvl === 3 ? 1.07 : 1) * this.cur.tempo;
      if (this.vol() > 0 && !SFX.muted && !Settings.muted) this.playStep(this.step, this.nextT, th, this.cur.lvl, bpm, this.cur.theme);
      this.nextT += 60 / bpm / 4;
      this.step++;
    }
  },
  /* pull the music down to `depth` (0..1) for `dur` seconds: used under the level-up and wave-clear fanfares and boss arrivals */
  sting(depth, dur){ if (!SFX.ctx) return; this.stDepth = depth; this.stUntil = SFX.ctx.currentTime + dur; },
  mtof(m){ return 440 * Math.pow(2, (m - 69) / 12); },
  note(wave, m, t, dur, vol){
    const c = SFX.ctx, o = c.createOscillator(), g = c.createGain();
    o.type = wave; o.frequency.value = this.mtof(m);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(vol, t + Math.min(0.02, dur * 0.3));
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(this.gain);
    o.start(t); o.stop(t + dur + 0.03);
  },
  swell(wave, m, t, dur, vol){
    const c = SFX.ctx, o = c.createOscillator(), g = c.createGain();
    o.type = wave; o.frequency.value = this.mtof(m);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(vol, t + dur * 0.35);
    g.gain.linearRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(this.gain);
    o.start(t); o.stop(t + dur + 0.03);
  },
  drum(kind, t, vol){
    const c = SFX.ctx, g = this.gain;
    if (kind === 'kick'){
      const o = c.createOscillator(), e = c.createGain();
      o.frequency.setValueAtTime(130, t); o.frequency.exponentialRampToValueAtTime(42, t + 0.14);
      e.gain.setValueAtTime(vol, t); e.gain.exponentialRampToValueAtTime(0.0001, t + 0.2);
      o.connect(e); e.connect(g); o.start(t); o.stop(t + 0.22);
    } else if (kind === 'tom'){
      const o = c.createOscillator(), e = c.createGain();
      o.frequency.setValueAtTime(210, t); o.frequency.exponentialRampToValueAtTime(95, t + 0.16);
      e.gain.setValueAtTime(vol, t); e.gain.exponentialRampToValueAtTime(0.0001, t + 0.22);
      o.connect(e); e.connect(g); o.start(t); o.stop(t + 0.24);
    } else {
      const s = c.createBufferSource(); s.buffer = SFX.noise;
      const f = c.createBiquadFilter(), e = c.createGain();
      f.type = kind === 'snare' ? 'bandpass' : 'highpass'; f.frequency.value = kind === 'snare' ? 1800 : 7000; f.Q.value = 0.8;
      const d = kind === 'snare' ? 0.13 : 0.04;
      e.gain.setValueAtTime(vol, t); e.gain.exponentialRampToValueAtTime(0.0001, t + d);
      s.connect(f); f.connect(e); e.connect(g); s.start(t); s.stop(t + d + 0.02);
    }
  },
  playStep(step, t, th, lvl, bpm, key){
    /* sixteen bars now, not eight: A, A again, B (the chords start from a different place and the lead sits higher), A */
    const bar16 = Math.floor(step / 16) % 16, bar = bar16 % 8, i = step % 16, sect = bar16 >= 8 && bar16 < 12 ? 1 : 0;
    const hard = lvl >= 2, own = !!th.boss;
    const sc = MUSIC_SCALES[hard && !own && th.scale !== 'phrygian' && th.scale !== 'harm' ? 'harm' : th.scale];
    const chord = th.prog[(sect ? bar + 2 : bar) % 4] + (hard && !own ? -1 : 0);
    const root = th.root + chord + ((this.cur && this.cur.shift) | 0);
    const tri = th.minor || hard ? [0, 3, 7] : [0, 4, 7];
    const barLen = 60 / bpm * 4;
    const seed = (key.length * 977 + key.charCodeAt(0) * 131) + bar16 * 16 + i;
    const r = this.hash(seed);
    /* pad: one soft chord per bar */
    if (i === 0){
      for (let k = 0; k < 3; k++) this.swell('sine', root + 12 + tri[k], t, barLen * 1.05, lvl === 0 ? 0.06 : 0.04);
      if (sect && lvl >= 1) this.swell('sine', root + 24 + tri[0], t, barLen * 1.05, 0.025);       /* the B section adds a high voice */
    }
    /* bass */
    const bassOn = lvl === 0 ? (i === 0 || i === 8) : lvl === 1 ? (sect ? (i === 0 || i === 3 || i === 8 || i === 10) : (i === 0 || i === 6 || i === 8 || i === 11)) : (i % 2 === 0);
    const dense = !!(this.cur && this.cur.dense);
    if (bassOn){
      const bw = hard ? 'sawtooth' : th.bass;
      this.note(bw, root - 12 + (i === 8 || i === 11 ? 7 * (lvl === 1 ? 0 : 0) : 0), t, 60 / bpm * (hard ? 0.45 : 0.8), hard ? 0.11 : 0.15);
      if (lvl === 3 && i % 4 === 0) this.note('square', root, t, 60 / bpm * 0.3, 0.05);
    }
    /* arp (all levels) and lead (levels 1-2) */
    if (i % 2 === 0){
      const tone = tri[Math.floor(this.hash(seed + 7) * 3)];
      const oct = r < (sect ? 0.55 : 0.25) ? 24 : 12;
      if (lvl === 0 ? (i % 4 === 0 || r < 0.3) : true) this.note(th.lead, root + oct + tone, t, 60 / bpm * 0.5, lvl === 0 ? 0.05 : 0.065);
    }
    if (lvl >= 1 && i % 2 === 1 && r < (lvl === 3 ? 0.7 : lvl === 2 ? 0.5 : dense ? 0.42 : 0.28)){
      const deg = sc[Math.floor(this.hash(seed + 31) * sc.length)];
      this.note(th.lead, root + 24 + deg, t, 60 / bpm * 0.4, 0.05);
    }
    /* drums */
    const style = hard ? 'heavy' : th.drum;
    if (lvl === 3 && i === 0 && bar % 4 === 0) this.drum('snare', t, 0.3);
    if (lvl === 0){
      if (style === 'tribal' && (i === 0 || i === 8)) this.drum('tom', t, 0.18);
      if (i % 4 === 2) this.drum('hat', t, 0.025);
      return;
    }
    if (style === 'tribal'){
      if (i === 0 || i === 6 || i === 10) this.drum('kick', t, 0.5);
      if (i === 4 || i === 12 || i === 14) this.drum('tom', t, 0.22);
      if (i % 2 === 0) this.drum('hat', t, 0.03);
    } else if (style === 'soft'){
      if (i === 0 || i === 10) this.drum('kick', t, 0.32);
      if (i % 4 === 2) this.drum('hat', t, 0.03);
    } else if (style === 'beat'){
      if (i % 4 === 0) this.drum('kick', t, 0.5);
      if (i === 4 || i === 12) this.drum('snare', t, 0.18);
      if (i % 2 === 0) this.drum('hat', t, 0.035);
    } else {
      if (i === 0 || i === 3 || i === 6 || i === 8 || i === 11) this.drum('kick', t, 0.55);
      if (i === 4 || i === 12) this.drum('snare', t, 0.22);
      this.drum('hat', t, 0.03);
    }
  }
};
const P = {
  x: ARENA_W / 2, y: ARENA_H / 2, vx: 0, vy: 0, r: 20,
  hp: 100, maxHp: 100, level: 1, xp: 0, xpNext: 50,
  aim: 0, face: 0, kickCd: 0, kickAnim: 0, walk: 0, hurtT: 0, invuln: 0, slowCd: 0,
  cards: [], stats: null, rage: 0, regenAcc: 0, dead: false
};

const sfxGate = {};
/* x, y (optional): where in the world the sound happens, so it is placed left/right and softens with distance */
const ENEMY_SFX = { spit: 1, whoosh: 1, boom: 1, zap: 1, hit: 1 };        /* the sounds an enemy's own update can make; anything else keeps its usual place */
function sfx(name, ms, x, y){
  const t = G.time;
  /* a sound made while an enemy is being updated comes from that enemy: placed on it, and as its own kind of sound (02c-audio-mix.js) */
  if (x === undefined && typeof Mix !== 'undefined' && Mix.src && ENEMY_SFX[name]){
    const s = Mix.src; x = s.x; y = s.y; name = Mix.variant(name, s);
  }
  if (sfxGate[name] && t - sfxGate[name] < (ms || 0.04)) return;
  sfxGate[name] = t;
  if (x !== undefined) SFX.at(x, y);
  try { SFX[name](); } finally { SFX.pos = null; }
}

function addShake(a, ang){
  if (cityLevel('c_neck') > 0) a *= 0.5;
  G.shake = Math.min(28, G.shake + a); G.shakeMax = Math.max(G.shakeMax, G.shake);
  if (ang !== undefined){ G.shakeAng = ang; G.shakeBias = 0.8; }       /* a hit shoves the picture along its own direction, not at random */
  if (a >= 12) padRumble(0.35, 0.7, 140);
}
/* Shake caused by the player's own abilities (kicks, card effects, ants).
   Steady Eyes trims this by 25% a level; shake from events -- getting hit,
   bosses, transformations, chapter changes -- stays at full strength. */
function abilityShake(a, ang){ addShake(a * (1 - 0.25 * Math.min(3, metaLevel('steadyeyes'))), ang); }
function hitstop(t){ G.hitstop = Math.min(0.085, Math.max(G.hitstop, t)); }
function screenFlash(color, alpha, dur){ G.flash = { color: color, a: Settings.calmFlash ? alpha * 0.3 : alpha, t: 0, dur: dur || 0.22 }; }
/* Light haptic feedback for touch devices only -- desktop browsers either
   lack navigator.vibrate or ignore it, and this must never throw if the
   API is missing, restricted by permissions policy, or simply refuses. */
function vibrate(pattern){
  const ms = Array.isArray(pattern) ? pattern.reduce(function(a, b){ return a + b; }, 0) : (+pattern || 30);
  padRumble(0.5, 0.8, Math.min(400, ms * 2));                  /* a controller gets the same hit as a phone */
  if (!Input.hasTouch || !navigator.vibrate) return;
  try { navigator.vibrate(pattern); } catch (e) {}
}

