'use strict';
/* Weather events (storms, blizzards, meteor showers...), lightning, rain ripples, and the sky at dusk and night. */
/* ========================= WEATHER EVENTS ========================= */
/* The base weather of each chapter lives in 36-atmosphere.js. On top of it, every so often a short event rolls through:
   a second weather layer fades in, the light shifts, and some events add lightning. Purely visual: nothing here touches
   gameplay, and every alpha is kept low enough that creatures and shots stay easy to read.
   Settings.fxLevel 0 turns all of it off, 1 runs it at 60% density. */
Object.assign(WEATHER_KINDS, {
  sandstorm:  { n: 90,  type: 'streak', vx: 640,  vy: 60,   len: [40, 110], col: '225,190,140', a: 0.22 },
  blizzard:   { n: 190, type: 'streak', vx: 520,  vy: 120,  len: [18, 46],  col: '245,250,255', a: 0.42 },
  downpour:   { n: 230, type: 'streak', vx: -220, vy: 980,  len: [18, 34],  col: '185,210,235', a: 0.36 },
  acid:       { n: 160, type: 'streak', vx: -90,  vy: 700,  len: [14, 26],  col: '190,235,90',  a: 0.38 },
  meteor:     { n: 9,   type: 'streak', vx: 900,  vy: 520,  len: [90, 190], col: '255,236,190', a: 0.8 },
  bloom:      { n: 120, type: 'glow',   vx: 10,   vy: -12,  size: [1.6, 4],   col: '80,255,220',  a: 0.6 },
  ashstorm:   { n: 140, type: 'streak', vx: 360,  vy: 120,  len: [14, 40],  col: '84,72,68',    a: 0.5 },
  emberstorm: { n: 120, type: 'glow',   vx: 60,   vy: -110, size: [1.6, 3.8], col: '255,150,60',  a: 0.9 },
  sporecloud: { n: 120, type: 'glow',   vx: 22,   vy: -26,  size: [2, 4.5],   col: '220,240,110', a: 0.5 },
  auroraglow: { n: 80,  type: 'glow',   vx: 12,   vy: -8,   size: [1.4, 3.6], col: '200,150,255', a: 0.7, twinkle: true },
  fireflies:  { n: 26,  type: 'glow',   vx: 9,    vy: -7,   size: [1.8, 3.4], col: '255,232,120', a: 0.95, twinkle: true },
  sparkles:   { n: 34,  type: 'glow',   vx: 7,    vy: -9,   size: [1.4, 3],   col: '215,170,255', a: 0.9, twinkle: true },
  stars:      { n: 64,  type: 'glow',   vx: 0,    vy: 0,    size: [0.8, 1.9], col: '235,242,255', a: 0.8, twinkle: true }
});
const RAINY = { rain: 1, drizzle: 1, downpour: 1, acid: 1 };

/* dur is in seconds; tint is laid over the screen at full strength; dark darkens the sky a little */
const WX_EVENTS = {
  1:  [{ weather: 'sandstorm', tint: [214, 170, 110, 0.16], dark: 0.03, dur: [20, 30] },
       { weather: 'downpour', tint: [70, 82, 104, 0.16], dark: 0.12, lightning: true, dur: [18, 26] }],
  2:  [{ weather: 'blizzard', tint: [225, 238, 250, 0.20], dark: 0.04, dur: [20, 32] }],
  3:  [{ weather: 'downpour', tint: [60, 90, 60, 0.16], dark: 0.12, lightning: true, dur: [20, 30] },
       { weather: 'sporecloud', tint: [150, 190, 90, 0.10], dark: 0.02, dur: [18, 26] }],
  4:  [{ weather: 'bloom', tint: [40, 230, 200, 0.10], dark: 0, dur: [20, 30] }],
  5:  [{ weather: 'downpour', tint: [40, 80, 50, 0.18], dark: 0.14, lightning: true, dur: [22, 32] }],
  6:  [{ weather: 'downpour', tint: [70, 76, 96, 0.16], dark: 0.1, lightning: true, dur: [18, 28] },
       { weather: 'ashstorm', tint: [110, 100, 98, 0.14], dark: 0.05, dur: [18, 26] }],
  7:  [{ weather: 'meteor', tint: [120, 150, 255, 0.06], dark: 0, dur: [14, 22] }],
  8:  [{ weather: 'meteor', tint: [150, 170, 255, 0.05], dark: 0, dur: [14, 22] }],
  9:  [{ weather: 'acid', tint: [180, 220, 60, 0.16], dark: 0.05, dur: [18, 28] }],
  10: [{ weather: 'ashstorm', tint: [70, 22, 10, 0.2], dark: 0.1, dur: [20, 30] },
       { weather: 'emberstorm', tint: [255, 100, 30, 0.12], dark: 0, dur: [16, 24] }],
  11: [{ weather: 'auroraglow', tint: [170, 110, 255, 0.12], dark: 0.02, dur: [20, 30] },
       { weather: 'sporecloud', tint: [190, 130, 255, 0.10], dark: 0.02, dur: [18, 26] }],
  12: [{ weather: 'sandstorm', tint: [180, 190, 170, 0.14], dark: 0.04, dur: [18, 28] }],
  13: [{ weather: 'sandstorm', tint: [255, 130, 80, 0.2], dark: 0.06, dur: [20, 30] }]
};
/* what appears in the sky as the day wears on: [weather kind, from wave fraction] */
const WX_TOD = { 1: ['fireflies', 0.55], 2: ['stars', 0.6], 3: ['fireflies', 0.55], 6: ['stars', 0.62], 11: ['sparkles', 0.55] };

const WxE = {
  t: 0, next: 30, chOf: 0, cur: null, age: 0, dur: 0, k: 0,
  wx: makeWeather(), tod: makeWeather(), todKey: '', todK: 0,
  flash: 0, dbl: 0, boltT: 6, bolt: null, boltA: 0, thunder: 0,
  rip: [], ripAcc: 0, rainy: 0,

  update(dt, ch, S){
    const fx = fxLevelNow();
    if (fx <= 0){ this.cur = null; this.k = 0; this.todK = 0; this.flash = 0; this.rip.length = 0; return; }
    const W = G.W, H = G.H, dens = fx >= 2 ? 1 : 0.6;
    this.t += dt;
    if (this.chOf !== ch){
      this.chOf = ch; this.cur = null; this.k = 0; this.next = this.t + rand(26, 46);
      this.wx.key = ''; this.wx.list.length = 0; this.tod.key = ''; this.tod.list.length = 0;
    }
    /* start, run and end an event */
    const defs = WX_EVENTS[ch];
    if (!this.cur && defs && this.t >= this.next && G.state !== 'paused'){
      this.cur = defs[(Math.random() * defs.length) | 0];
      this.age = 0; this.dur = rand(this.cur.dur[0], this.cur.dur[1]); this.boltT = rand(1.5, 4);
    }
    if (this.cur){
      this.age += dt;
      const target = this.age < this.dur ? 1 : 0;
      this.k = clamp(this.k + (target > this.k ? dt / 3 : -dt / 3), 0, 1);
      if (target === 0 && this.k <= 0){ this.cur = null; this.next = this.t + rand(55, 100); this.wx.key = ''; this.wx.list.length = 0; }
    }
    this.rainy = 0;
    if (this.cur && this.k > 0.01){
      const E = this.cur;
      S.layers.push({ rgb: E.tint, a: E.tint[3] * this.k });
      S.dark = Math.max(S.dark, E.dark * this.k);
      weatherSync(this.wx, E.weather, dens, W, H);
      weatherUpdate(this.wx, E.weather, dt, W, H, G.camX, G.camY, G.zoom);
      if (RAINY[E.weather]) this.rainy = this.k;
      /* lightning */
      if (E.lightning && this.k > 0.5){
        this.boltT -= dt;
        if (this.boltT <= 0){
          this.boltT = rand(5, 11);
          this.flash = 1; this.dbl = Math.random() < 0.5 ? 0.13 : 0;
          this.makeBolt(W, H);
          /* how far away it struck: the later the thunder, the softer and lower it is, and it comes from the side the bolt was on */
          this.thunderFar = Math.random(); this.thunder = 0.2 + this.thunderFar * 2.6; this.thunderPan = (this.bolt[0][0] / W - 0.5) * 1.6;
        }
      }
    }
    if (RAINY[S.weather]) this.rainy = Math.max(this.rainy, 0.5);
    if (this.flash > 0){
      this.flash = Math.max(0, this.flash - dt * 3.4);
      if (this.dbl > 0){ this.dbl -= dt; if (this.dbl <= 0) this.flash = 0.85; }
    }
    if (this.thunder > 0){
      this.thunder -= dt;
      if (this.thunder <= 0 && G.state === 'playing') Mix.thunder(this.thunderFar || 0.5, this.thunderPan || 0);
    }
    /* rain splashes on the ground */
    if (this.rainy > 0.05){
      this.ripAcc += dt * 14 * this.rainy * dens;
      while (this.ripAcc >= 1 && this.rip.length < 44){ this.ripAcc -= 1; this.rip.push({ x: rand(0, W), y: rand(H * 0.12, H), age: 0, r: rand(8, 16) }); }
      this.ripAcc = Math.min(this.ripAcc, 2);
    }
    for (let i = this.rip.length - 1; i >= 0; i--){ const r = this.rip[i]; r.age += dt; if (r.age > 0.65) this.rip.splice(i, 1); }
    /* the sky at dusk and night */
    const T = WX_TOD[ch], f = Light.todFrac(ch);
    let tk = 0;
    if (T && f !== null){ tk = clamp((f - T[1]) / 0.2, 0, 1); weatherSync(this.tod, T[0], dens, W, H); this.todKey = T[0]; }
    else this.todKey = '';
    this.todK += (tk - this.todK) * Math.min(1, dt * 1.2);
    if (this.todK > 0.01 && this.todKey) weatherUpdate(this.tod, this.todKey, dt, W, H, G.camX, G.camY, G.zoom);
  },

  makeBolt(W, H){
    let x = rand(W * 0.15, W * 0.85), y = -10;
    const pts = [[x, y]], end = H * rand(0.4, 0.7);
    while (y < end){ y += rand(26, 50); x += rand(-34, 34); pts.push([x, y]); }
    this.bolt = pts; this.boltA = 1;
  },

  draw(ctx, t, S){
    if (fxLevelNow() <= 0) return;
    if (this.todK > 0.01 && this.todKey) weatherDraw(ctx, this.tod, this.todKey, S.accent, t, this.todK);
    if (this.cur && this.k > 0.01) weatherDraw(ctx, this.wx, this.cur.weather, S.accent, t, this.k);
    if (this.rip.length){
      ctx.save(); ctx.lineWidth = 1.2;
      for (let i = 0; i < this.rip.length; i++){
        const r = this.rip[i], k = r.age / 0.65;
        ctx.strokeStyle = 'rgba(210,228,245,' + (0.4 * (1 - k)).toFixed(3) + ')';
        ctx.beginPath(); ctx.ellipse(r.x, r.y, r.r * (0.3 + k), r.r * (0.3 + k) * 0.45, 0, 0, TAU); ctx.stroke();
      }
      ctx.restore();
    }
    if (this.flash > 0.01){
      const calm = Settings.calmFlash ? 0.25 : 1;           /* "Reduce flashes": the sky still lights up, far more gently */
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      ctx.fillStyle = 'rgba(190,210,255,' + (0.32 * calm * this.flash * this.flash).toFixed(3) + ')';
      ctx.fillRect(0, 0, G.W, G.H);
      if (this.bolt){
        ctx.lineJoin = 'round';
        ctx.strokeStyle = 'rgba(150,180,255,' + (0.5 * this.flash).toFixed(3) + ')'; ctx.lineWidth = 9;
        ctx.beginPath(); for (let i = 0; i < this.bolt.length; i++){ const p = this.bolt[i]; if (i) ctx.lineTo(p[0], p[1]); else ctx.moveTo(p[0], p[1]); } ctx.stroke();
        ctx.strokeStyle = 'rgba(255,255,255,' + (0.9 * this.flash).toFixed(3) + ')'; ctx.lineWidth = 2.4;
        ctx.stroke();
      }
      ctx.restore();
    }
  }
};
