'use strict';
/* Light, weather and depth. */
/* ========================= 28b. ATMOSPHERE: light, weather, depth ========================= */
/* Everything here is drawn in screen space after the world, and only reads game state.
   Settings.fxLevel: 0 low (off), 1 medium (tint, night, weather), 2 high (adds the foreground layer). */
const ATMOS = {
  1:  { cycle: true, base: [255, 244, 214, 0],    accent: '#F2B33D', fog: [240, 220, 170], fogA: 0.07, weather: 'dust' },
  2:  { cycle: true, base: [190, 215, 255, 0.07], accent: '#A8D8FF', fog: [230, 240, 255], fogA: 0.12, weather: 'snow' },
  3:  { cycle: true, base: [120, 160, 90, 0.10],  accent: '#B6D870', fog: [130, 170, 110], fogA: 0.14, weather: 'drizzle' },
  4:  { base: [30, 110, 170, 0.16],               accent: '#7FD0FF', fog: [70, 150, 200],  fogA: 0.10, weather: 'plankton' },
  5:  { base: [40, 110, 50, 0.12],                accent: '#8FE04A', fog: [110, 160, 110], fogA: 0.10, weather: 'rain' },
  6:  { cycle: true, base: [255, 170, 120, 0.05], accent: '#F2A060', fog: [160, 150, 150], fogA: 0.10, weather: 'ash' },
  7:  { base: [14, 22, 50, 0.14],                 accent: '#8FB8FF', fog: [120, 140, 180], fogA: 0.06, weather: 'glints' },
  8:  { base: [6, 8, 28, 0.18], night: 0.2,       accent: '#C9D3E8', fog: null,            fogA: 0,    weather: 'glints' },
  9:  { base: [255, 200, 70, 0.12],               accent: '#FFD23F', fog: [230, 190, 80],  fogA: 0.12, weather: 'spores' },
  10: { base: [255, 70, 20, 0.14],                accent: '#FF7A2A', fog: [200, 60, 30],   fogA: 0.10, weather: 'embers' },
  11: { cycle: true, base: [190, 120, 255, 0.08], accent: '#D8A8FF', fog: [200, 150, 255], fogA: 0.10, weather: 'glints' },
  12: { base: [10, 24, 50, 0.10], night: 0.3,     accent: '#7FE8FF', fog: [90, 120, 150],  fogA: 0.08, weather: 'dust' },
  13: { base: [255, 120, 60, 0.10],               accent: '#FF9A5A', fog: [220, 120, 70],  fogA: 0.12, weather: 'storm' },
  14: { base: [150, 214, 255, 0.10],              accent: '#9FE8FF', fog: [200, 236, 255], fogA: 0.12, weather: 'snow' },          /* inside a dome: cold, still, a little snow that should not be there */
  15: { base: [255, 236, 190, 0.07],              accent: '#FFE49A', fog: [200, 200, 220], fogA: 0.05, weather: 'glints' }          /* an office tower at night: warm lamps, cool air, a few motes in the light */
};
const BIOME_CHAPTER = { savanna: 1, snow: 2, swamp: 3, ocean: 4, jungle: 5, city: 6, space: 7, moon: 8, venus: 9, area51: 12, mars: 13, dome: 14, tower: 15 };
/* type: streak (a line along its motion), dot, glow (soft additive point) */
const WEATHER_KINDS = {
  dust:     { n: 34,  type: 'streak', vx: 90,   vy: 6,    len: [14, 34], col: '230,210,160', a: 0.20 },
  snow:     { n: 110, type: 'dot',    vx: 30,   vy: 55,   size: [1.2, 3.2], col: '255,255,255', a: 0.8 },
  drizzle:  { n: 70,  type: 'streak', vx: -60,  vy: 520,  len: [9, 16],  col: '170,200,230', a: 0.28 },
  rain:     { n: 150, type: 'streak', vx: -140, vy: 760,  len: [14, 26], col: '190,215,240', a: 0.32 },
  plankton: { n: 46,  type: 'glow',   vx: 8,    vy: -14,  size: [1, 2.4], col: '150,230,255', a: 0.5 },
  ash:      { n: 66,  type: 'dot',    vx: 40,   vy: 34,   size: [1, 2.2], col: '70,66,64', a: 0.55 },
  glints:   { n: 38,  type: 'glow',   vx: 6,    vy: -6,   size: [1, 3],   col: 'accent', a: 0.7, twinkle: true },
  spores:   { n: 52,  type: 'glow',   vx: 14,   vy: -20,  size: [2, 4],   col: '210,230,110', a: 0.45 },
  embers:   { n: 58,  type: 'glow',   vx: 24,   vy: -70,  size: [1.2, 3], col: '255,140,50', a: 0.85 },
  storm:    { n: 86,  type: 'streak', vx: 520,  vy: 40,   len: [30, 80], col: '230,150,100', a: 0.20 }
};
function atmosChapter(){
  if (G.attract || G.state === 'menu' || G.state === 'help' || G.state === 'shop') return BIOME_CHAPTER[G.biome] || 1;
  return clamp(G.chapter | 0 || 1, 1, TOTAL_CHAPTERS);
}
/* what the player chose in Settings, and what is actually running: the slow-device governor (js/44c-perf.js) can hold it lower for a while */
function fxLevelSetting(){ return typeof Settings.fxLevel === 'number' ? Settings.fxLevel : 2; }
function fxLevelNow(){ const v = fxLevelSetting(); return typeof Perf !== 'undefined' && Perf.fx < v ? Perf.fx : v; }

/* time of day: in the "cycle" chapters the 25 waves run dawn, day, dusk, night */
function atmosState(ch){
  const A = ATMOS[ch] || ATMOS[1];
  const layers = [];
  if (A.base[3] > 0) layers.push({ rgb: A.base, a: A.base[3] });
  let dark = A.night || 0;
  if (A.cycle && !G.attract){
    const cw = G.wave > 0 ? chapterWaveOf(G.wave) : 3, f = clamp((cw - 1) / (chapterLen(chapterOf(G.wave)) - 1), 0, 1);
    if (f < 0.15) layers.push({ rgb: [255, 170, 110], a: 0.14 * (1 - f / 0.15) });
    else if (f > 0.55 && f <= 0.8) layers.push({ rgb: [255, 115, 70], a: 0.17 * ((f - 0.55) / 0.25) });
    else if (f > 0.8) layers.push({ rgb: [255, 115, 70], a: 0.17 * (1 - (f - 0.8) / 0.2) });
    if (f > 0.7) dark = Math.max(dark, 0.46 * clamp((f - 0.7) / 0.22, 0, 1));
  }
  if (A.weather === 'rain') layers.push({ rgb: [70, 80, 100], a: 0.07 });
  return { layers: layers, dark: dark, accent: A.accent, fog: A.fog, fogA: A.fogA, weather: A.weather };
}

/* ---- weather: screen-space particles that drift with the wind and the camera ---- */
function makeWeather(){ return { list: [], key: '', camX: null, camY: null, t: 0 }; }
function weatherSync(Wx, key, density, W, H, acc){
  const full = key + '|' + density;
  if (Wx.key === full) return;
  Wx.key = full; Wx.list.length = 0;
  const K = WEATHER_KINDS[key]; if (!K || density <= 0) return;
  const n = Math.round(K.n * density);
  for (let i = 0; i < n; i++) Wx.list.push({ x: Math.random() * W, y: Math.random() * H, z: 0.5 + Math.random() * 0.5, ph: Math.random() * TAU, l: Math.random(), s: Math.random() });
}
function weatherUpdate(Wx, key, dt, W, H, camX, camY, zoom){
  const K = WEATHER_KINDS[key]; if (!K) return;
  Wx.t += dt;
  const gust = 0.75 + 0.25 * Math.sin(Wx.t * 0.21) + 0.2 * Math.max(0, Math.sin(Wx.t * 0.47 + 1.3));
  let dx = 0, dy = 0;
  if (Wx.camX !== null){ dx = (camX - Wx.camX) * zoom; dy = (camY - Wx.camY) * zoom; }
  Wx.camX = camX; Wx.camY = camY;
  if (Math.abs(dx) > 400 || Math.abs(dy) > 400){ dx = 0; dy = 0; }
  const L = Wx.list;
  for (let i = 0; i < L.length; i++){
    const p = L[i];
    const wob = K.type === 'streak' ? 0 : Math.sin(Wx.t * 0.9 + p.ph) * 14;
    p.x += (K.vx * gust * p.z + wob) * dt - dx * p.z * 0.7;
    p.y += (K.vy * (K.type === 'streak' ? 1 : (0.6 + p.z * 0.4))) * dt - dy * p.z * 0.7;
    if (p.x < -60) p.x += W + 120; else if (p.x > W + 60) p.x -= W + 120;
    if (p.y < -90) p.y += H + 180; else if (p.y > H + 90) p.y -= H + 180;
  }
}
function weatherDraw(ctx, Wx, key, accent, t, fade, frac){                                    /* frac: how much of the weather is in the sky (0 to 1); an event builds from a few drops to the full fall */
  const K = WEATHER_KINDS[key], L = Wx.list; if (!K || !L.length) return;
  if (fade === undefined) fade = 1;
  const N = frac === undefined || frac >= 1 ? L.length : Math.max(1, Math.ceil(L.length * frac));
  if (fade <= 0.01) return;
  const col = K.col === 'accent' ? hexToRgbStr(accent) : K.col;
  ctx.save();
  if (K.type === 'streak'){
    for (let pass = 0; pass < 2; pass++){
      ctx.strokeStyle = 'rgba(' + col + ',' + (K.a * (pass ? 1 : 0.55) * fade).toFixed(3) + ')';
      ctx.lineWidth = pass ? 1.6 : 1;
      ctx.beginPath();
      for (let i = pass; i < N; i += 2){
        const p = L[i], len = K.len[0] + (K.len[1] - K.len[0]) * p.l, sp = hyp(K.vx, K.vy) || 1, ux = K.vx / sp, uy = K.vy / sp;
        ctx.moveTo(p.x, p.y); ctx.lineTo(p.x - ux * len * p.z, p.y - uy * len * p.z);
      }
      ctx.stroke();
    }
  } else if (K.type === 'dot'){
    ctx.fillStyle = 'rgba(' + col + ',' + K.a + ')';
    for (let i = 0; i < N; i++){
      const p = L[i], r = (K.size[0] + (K.size[1] - K.size[0]) * p.s) * p.z;
      ctx.globalAlpha = (0.45 + 0.55 * p.z) * fade;
      ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, TAU); ctx.fill();
    }
  } else {
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < N; i++){
      const p = L[i], r = (K.size[0] + (K.size[1] - K.size[0]) * p.s) * p.z, tw = (K.twinkle ? 0.35 + 0.65 * Math.abs(Math.sin(t * 1.6 + p.ph)) : 1) * fade;
      ctx.fillStyle = 'rgba(' + col + ',' + (K.a * 0.18 * tw).toFixed(3) + ')'; ctx.beginPath(); ctx.arc(p.x, p.y, r * 3.2, 0, TAU); ctx.fill();
      ctx.fillStyle = 'rgba(' + col + ',' + (K.a * 0.85 * tw).toFixed(3) + ')'; ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, TAU); ctx.fill();
    }
  }
  ctx.restore();
}
function hexToRgbStr(h){ const n = parseInt(String(h).replace('#', ''), 16) || 0xFFFFFF; return ((n >> 16) & 255) + ',' + ((n >> 8) & 255) + ',' + (n & 255); }

/* ---- depth: slow fog banks and out-of-focus foreground grass that move faster than the ground ---- */
const fogSprites = {};
function fogSprite(rgb){
  const k = rgb.join(',');
  if (fogSprites[k]) return fogSprites[k];
  const c = document.createElement('canvas'); c.width = c.height = 128;
  const x = c.getContext('2d'), g = x.createRadialGradient(64, 64, 4, 64, 64, 64);
  g.addColorStop(0, 'rgba(' + k + ',1)'); g.addColorStop(1, 'rgba(' + k + ',0)');
  x.fillStyle = g; x.fillRect(0, 0, 128, 128);
  return (fogSprites[k] = c);
}
const FOG_BANKS = []; for (let i = 0; i < 9; i++) FOG_BANKS.push({ u: (i * 0.618) % 1, v: ((i * 0.37) % 1), r: 190 + (i * 53) % 150, sp: 6 + (i * 7) % 12, ph: i * 1.7 });
function drawForeground(ctx, S, cx, cy, fx, t, wind){
  const W = G.W, H = G.H;
  if (S.fog && S.fogA > 0){
    const spr = fogSprite(S.fog);
    for (let i = 0; i < FOG_BANKS.length; i++){
      const f = FOG_BANKS[i], span = W + 700;
      let x = ((f.u * span + t * f.sp * wind - cx * G.zoom * 0.45) % span + span) % span - 350;
      let y = f.v * H + Math.sin(t * 0.12 + f.ph) * 30 - (cy * G.zoom * 0.3 % 40);
      ctx.globalAlpha = S.fogA * (0.7 + 0.3 * Math.sin(t * 0.3 + f.ph));
      ctx.drawImage(spr, x - f.r, y - f.r * 0.6, f.r * 2, f.r * 1.2);
    }
    ctx.globalAlpha = 1;
  }
}

/* ---- night: a dark layer with holes punched where there is light ---- */
let litCv = null, litCtx = null;
function drawNight(ctx, darkA, cx, cy, ox, oy, accent){
  const W = G.W, H = G.H, s = 0.5, w = Math.ceil(W * s), h = Math.ceil(H * s);
  if (!litCv){ litCv = document.createElement('canvas'); litCtx = litCv.getContext('2d'); }
  if (litCv.width !== w || litCv.height !== h){ litCv.width = w; litCv.height = h; }
  const c = litCtx;
  c.setTransform(1, 0, 0, 1, 0, 0); c.globalCompositeOperation = 'source-over'; c.clearRect(0, 0, w, h);
  c.fillStyle = 'rgba(8,14,44,' + darkA.toFixed(3) + ')'; c.fillRect(0, 0, w, h);
  c.globalCompositeOperation = 'destination-out';
  const k = G.zoom * s, glows = [];
  const hole = function(x, y, r, a){
    const sx = ((x - cx) * G.zoom + W / 2 + ox) * s, sy = ((y - cy) * G.zoom + H / 2 + oy) * s, rr = r * k;
    if (sx < -rr || sx > w + rr || sy < -rr || sy > h + rr) return;
    const g = c.createRadialGradient(sx, sy, rr * 0.12, sx, sy, rr);
    g.addColorStop(0, 'rgba(0,0,0,' + a + ')'); g.addColorStop(1, 'rgba(0,0,0,0)');
    c.fillStyle = g; c.fillRect(sx - rr, sy - rr, rr * 2, rr * 2);
  };
  hole(P.x, P.y, 330, 0.96);
  let lights = 0;
  const pr = G.projectiles || [];
  for (let i = 0; i < pr.length && lights < 26; i++){ hole(pr[i].x, pr[i].y, 70 + pr[i].r * 4, 0.75); glows.push(pr[i]); lights++; }
  const es = G.enemies;
  for (let i = 0; i < es.length && lights < 40; i++){
    const e = es[i];
    if (e.burnT > 0){ hole(e.x, e.y, 90, 0.7); lights++; }
    else if (e.big){ hole(e.x, e.y, 200, 0.55); lights++; }
  }
  const pk = G.pickups || [];
  for (let i = 0; i < pk.length && lights < 56; i++){ hole(pk[i].x, pk[i].y, 54, 0.6); lights++; }
  ctx.drawImage(litCv, 0, 0, W, H);
  /* warm glow around the giraffe and its lights */
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  const px = (P.x - cx) * G.zoom + W / 2 + ox, py = (P.y - cy) * G.zoom + H / 2 + oy, pg = ctx.createRadialGradient(px, py, 6, px, py, 240 * G.zoom);
  pg.addColorStop(0, 'rgba(255,200,120,' + (0.13 * darkA / 0.46).toFixed(3) + ')'); pg.addColorStop(1, 'rgba(255,200,120,0)');
  ctx.fillStyle = pg; ctx.fillRect(px - 260 * G.zoom, py - 260 * G.zoom, 520 * G.zoom, 520 * G.zoom);
  ctx.restore();
}

const Atmos = {
  wx: makeWeather(), preview: makeWeather(), last: 0,
  update(dt){
    const fx = fxLevelNow();
    if (!G.camX && G.camX !== 0) return;
    const ch = atmosChapter(), S = atmosState(ch);
    this.state = S;
    if (typeof WxE !== 'undefined') WxE.update(dt, ch, S);          /* weather events add layers and darkness to S */
    if (typeof Light !== 'undefined') Light.update(dt, ch, S);
    const dens = [0, 0.55, 1][fx];
    weatherSync(this.wx, S.weather, dens, G.W, G.H);
    weatherUpdate(this.wx, S.weather, dt, G.W, G.H, G.camX, G.camY, G.zoom);
  },
  draw(ctx, cx, cy, ox, oy){
    const fx = fxLevelNow(); if (fx <= 0) return;
    const S = this.state || atmosState(atmosChapter()), t = G.time, wind = 0.75 + 0.25 * Math.sin(this.wx.t * 0.21);
    for (let i = 0; i < S.layers.length; i++){
      const L = S.layers[i]; if (L.a <= 0.004) continue;
      ctx.fillStyle = 'rgba(' + L.rgb[0] + ',' + L.rgb[1] + ',' + L.rgb[2] + ',' + L.a.toFixed(3) + ')'; ctx.fillRect(0, 0, G.W, G.H);
    }
    if (typeof Light !== 'undefined') Light.screen(ctx, cx, cy, ox, oy, S);
    if (S.dark > 0.03) drawNight(ctx, S.dark, cx, cy, ox, oy, S.accent);
    weatherDraw(ctx, this.wx, S.weather, S.accent, t);
    if (typeof WxE !== 'undefined') WxE.draw(ctx, t, S);
    drawForeground(ctx, S, cx, cy, fx, t, wind);
  }
};

/* ---- slow motion: the last hit lands, a second wind rises ---- */
function startSlowmo(dur, min, freeze){ G.slowmo = { t: 0, dur: dur, min: min, freeze: freeze || 0 }; }
function timeScale(raw){
  const s = G.slowmo;
  if (!s) return 1;
  s.t += raw;
  if (s.t >= s.dur){ G.slowmo = null; return 1; }
  if (s.t < s.freeze) return 0.05;
  const k = clamp((s.t - s.freeze) / Math.max(0.01, s.dur - s.freeze), 0, 1);
  return s.min + (1 - s.min) * k * k;
}
function drawDeathFX(ctx){
  const d = G.deathFX; if (!d) return;
  const k = clamp(d.t / d.dur, 0, 1), e = 1 - Math.pow(1 - k, 2);
  /* color drains away and the edges go dark red */
  ctx.save();
  ctx.globalCompositeOperation = 'saturation'; ctx.globalAlpha = 0.85 * e; ctx.fillStyle = '#808080'; ctx.fillRect(0, 0, G.W, G.H);
  ctx.restore();
  const r = hyp(G.W, G.H) * 0.5, g = ctx.createRadialGradient(G.W / 2, G.H / 2, r * 0.25, G.W / 2, G.H / 2, r);
  g.addColorStop(0, 'rgba(60,8,8,0)'); g.addColorStop(1, 'rgba(60,8,8,' + (0.7 * e).toFixed(3) + ')');
  ctx.fillStyle = g; ctx.fillRect(0, 0, G.W, G.H);
  /* a ring leaves the giraffe */
  const cxp = (P.x - G.camX) * G.zoom * (1 + 0.1 * e) + G.W / 2, cyp = (P.y - G.camY) * G.zoom * (1 + 0.1 * e) + G.H / 2;
  ctx.globalAlpha = (1 - k) * 0.7; ctx.strokeStyle = '#FFD9C4'; ctx.lineWidth = 3 + 8 * (1 - k);
  ctx.beginPath(); ctx.arc(cxp, cyp, 20 + 340 * e, 0, TAU); ctx.stroke(); ctx.globalAlpha = 1;
}
function drawReviveFX(ctx){
  const d = G.reviveFX; if (!d) return;
  const k = clamp(d.t / d.dur, 0, 1), cxp = (P.x - G.camX) * G.zoom + G.W / 2, cyp = (P.y - G.camY) * G.zoom + G.H / 2;
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  const g = ctx.createRadialGradient(cxp, cyp, 4, cxp, cyp, 60 + 420 * k);
  g.addColorStop(0, 'rgba(255,226,150,' + (0.55 * (1 - k)).toFixed(3) + ')'); g.addColorStop(1, 'rgba(255,200,90,0)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, G.W, G.H);
  ctx.strokeStyle = 'rgba(255,236,170,' + (0.5 * (1 - k)).toFixed(3) + ')'; ctx.lineWidth = 6;
  for (let i = 0; i < 12; i++){ const a = i / 12 * TAU + k * 0.8; ctx.beginPath(); ctx.moveTo(cxp + Math.cos(a) * 40, cyp + Math.sin(a) * 40); ctx.lineTo(cxp + Math.cos(a) * (80 + 520 * k), cyp + Math.sin(a) * (80 + 520 * k)); ctx.stroke(); }
  ctx.restore();
}

/* ---- the chapter intro card at the start of a run ---- */
function startIntroFX(ch){
  const info = CHAPTER_INFO[ch - 1] || CHAPTER_INFO[0], A = ATMOS[ch] || ATMOS[1];
  G.introFX = { t: 0, dur: 3.4, ch: ch, name: info.name, desc: info.desc, accent: A.accent };
}
function drawIntroFX(ctx){
  const f = G.introFX; if (!f) return;
  const k = f.t / f.dur, W = G.W, H = G.H;
  const bar = H * 0.11 * Math.min(1, k / 0.12) * (k > 0.88 ? (1 - k) / 0.12 : 1);
  const fade = k < 0.22 ? 1 - k / 0.22 : 0;
  ctx.fillStyle = '#0A0706'; ctx.fillRect(0, 0, W, bar); ctx.fillRect(0, H - bar, W, bar);
  if (fade > 0){ ctx.globalAlpha = fade; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1; }
  const a = k < 0.18 ? k / 0.18 : k > 0.8 ? (1 - k) / 0.2 : 1; if (a <= 0) return;
  ctx.globalAlpha = clamp(a, 0, 1); ctx.textAlign = 'center';
  const size = Math.min(60, Math.max(28, W * 0.056)), y = H * 0.4, slide = (1 - Math.min(1, k / 0.25)) * 36;
  ctx.font = '700 ' + Math.max(12, size * 0.3) + 'px ui-sans-serif, "Segoe UI", Roboto, sans-serif';
  ctx.fillStyle = '#EFE6D4'; ctx.fillText('CHAPTER ' + chapterLabel(f.ch), W / 2 - slide, y - size * 0.9);
  ctx.font = '900 ' + size + 'px "Arial Black", "Helvetica Neue", Impact, sans-serif';
  const nw = ctx.measureText(f.name.toUpperCase()).width, fitSize = nw > W - 36 ? size * (W - 36) / nw : size;          /* a long name on a narrow phone shrinks to fit */
  if (fitSize !== size) ctx.font = '900 ' + fitSize + 'px "Arial Black", "Helvetica Neue", Impact, sans-serif';
  ctx.lineWidth = 8; ctx.strokeStyle = 'rgba(10,7,6,.92)'; ctx.strokeText(f.name.toUpperCase(), W / 2 + slide, y);
  ctx.fillStyle = f.accent; ctx.fillText(f.name.toUpperCase(), W / 2 + slide, y);
  ctx.fillStyle = f.accent; ctx.globalAlpha = clamp(a, 0, 1) * 0.8;
  const lw = Math.min(260, W * 0.4) * Math.min(1, k / 0.3); ctx.fillRect(W / 2 - lw / 2, y + size * 0.28, lw, 3);
  ctx.globalAlpha = clamp(a, 0, 1); ctx.font = '600 ' + Math.max(13, size * 0.28) + 'px ui-sans-serif, "Segoe UI", Roboto, sans-serif';
  ctx.fillStyle = '#EFE6D4';
  const dl = ctx.measureText(f.desc).width > W - 32 ? (function(){ const w = f.desc.split(' '), m = f.desc.length / 2; let at = 0, run = 0; for (let i = 0; i < w.length - 1; i++){ run += w[i].length + 1; if (Math.abs(run - m) < Math.abs(at - m) || !at) at = run; } return [f.desc.slice(0, at).trim(), f.desc.slice(at).trim()]; })() : [f.desc];   /* a long line is split in two on a narrow phone */
  const lh = Math.max(13, size * 0.28) * 1.3; dl.forEach(function(t, i){ ctx.fillText(t, W / 2, y + size * 0.78 + i * lh); });
  ctx.textAlign = 'left'; ctx.globalAlpha = 1;
}
function drawAntShadows(ctx){
  const ants = G.ants; if (!ants) return;
  ctx.fillStyle = 'rgba(22,15,10,.34)';
  const v = viewBounds(60);
  for (let i = 0; i < ants.length; i++){ const a = ants[i]; if (a.x < v.x0 || a.x > v.x1 || a.y < v.y0 || a.y > v.y1) continue; ctx.beginPath(); ctx.ellipse(a.x, a.y + a.r * 0.55, a.r * 1.1, a.r * 0.5, 0, 0, TAU); ctx.fill(); }
}

