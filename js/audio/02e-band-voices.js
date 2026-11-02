'use strict';
/* The band's instruments: everything is made from code, there are still no audio files. Loaded after 02d-ground-sounds.js.
   Two kinds of instrument:
   - struck and plucked ones (guitars, harp, banjo, ukulele, plucked bass, marimba, kalimba, steel drum, bells, piano, electric piano
     and every drum) are drawn once into a short sound buffer per note: a plucked string is a delay line that loses a little each time
     round (the Karplus-Strong string), a struck bar is a few ringing sine modes, a drum is shaped noise and a falling tone. After that a
     note costs one buffer player, which keeps a full band cheap;
   - held ones (pads, strings, choir, brass, organ, flute, synth leads and synth bass) are live oscillators with their own envelope,
     filter and vibrato.
   Each part of the band (drums, perc, bass, comp, pad, arp, lead, lead2, counter, solo, fx) has its own fader, its own place left or right, and
   sends into one shared room (a reverb) and an echo that follows the tempo, so it sounds like a band in a room instead of beeps.
   The arranger that plays them is 02g-band-play.js. */

/* ---------------------------------------------------------------- small tools */
/* a seeded random number generator, so a sound or a melody drawn twice comes out the same */
function bandRng(seed){ let s = (seed >>> 0) || 1; return function(){ s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; }; }
function bandSeed(str){ let h = 2166136261; for (let i = 0; i < str.length; i++){ h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
function bandMtof(m){ return 440 * Math.pow(2, (m - 69) / 12); }
/* a filter that stays stable at any frequency (a zero-delay state-variable filter). mode 0 low-pass, 1 band-pass, 2 high-pass */
function bandSvf(fc, q, sr){
  let g = 0, a1 = 0, a2 = 0, a3 = 0, ic1 = 0, ic2 = 0; const k = 1 / q;
  const f = function(v0, mode){ const v3 = v0 - ic2, v1 = a1 * ic1 + a2 * v3, v2 = ic2 + a2 * ic1 + a3 * v3; ic1 = 2 * v1 - ic1; ic2 = 2 * v2 - ic2; return mode === 0 ? v2 : mode === 1 ? v1 : v0 - k * v1 - v2; };
  f.set = function(nf){ g = Math.tan(Math.PI * Math.min(nf, sr * 0.45) / sr); a1 = 1 / (1 + g * (g + k)); a2 = g * a1; a3 = g * a2; };
  f.set(fc);
  return f;
}

/* ---------------------------------------------------------------- drawn sounds: strings, bars, keys */
/* a plucked string. o: dur, bright (0..1, how sharp the pluck is), decay (seconds to die away at 220 Hz), pos (where it is plucked),
   body (a little wooden resonance), blend (how much the string softens each time round: more is darker) */
function bandKS(f, sr, o, rnd){
  const N = Math.floor(sr * o.dur), out = new Float32Array(N), bl = o.blend || 0.5;
  const P = sr / f; let L = Math.floor(P - bl), fr = P - bl - L; if (fr < 0.15){ L--; fr += 1; } if (L < 2) L = 2;
  const C = (1 - fr) / (1 + fr), buf = new Float32Array(L);
  let lp = 0; const a = 0.08 + 0.9 * o.bright;
  for (let i = 0; i < L; i++){ lp += a * ((rnd() * 2 - 1) - lp); buf[i] = lp; }
  if (o.pos){ const pd = Math.max(1, Math.floor(L * o.pos)), cp = buf.slice(); for (let i = 0; i < L; i++) buf[i] = cp[i] - cp[(i + pd) % L]; }
  let mx = 1e-6, mean = 0; for (let i = 0; i < L; i++) mean += buf[i]; mean /= L;
  for (let i = 0; i < L; i++){ buf[i] -= mean; mx = Math.max(mx, Math.abs(buf[i])); }
  for (let i = 0; i < L; i++) buf[i] /= mx;
  const T = o.decay * Math.pow(220 / f, 0.45), damp = Math.pow(0.001, (P / sr) / Math.max(0.05, T));
  let idx = 0, prev = 0, ax = 0, ay = 0;
  const body = o.body ? bandSvf(o.body[0], o.body[1], sr) : null;
  for (let n = 0; n < N; n++){
    const cur = buf[idx], avg = (1 - bl) * cur + bl * prev; prev = cur;
    const y = C * avg + ax - C * ay; ax = avg; ay = y;
    buf[idx] = y * damp; idx++; if (idx >= L) idx = 0;
    out[n] = body ? cur + o.body[2] * body(cur, 1) : cur;
  }
  if (o.twang){ const tw = bandSvf(o.twang[0], o.twang[1], sr); for (let n = 0; n < N; n++) out[n] += o.twang[2] * tw(out[n], 1); }
  /* a sitar's buzzing bridge: the string slaps a curved bridge on one side of its swing, which adds a bright, lopsided buzz */
  if (o.jaw){ const hp = bandSvf(1800, 0.8, sr); for (let n = 0; n < N; n++){ const x = out[n]; out[n] = x + o.jaw * hp(x > 0 ? x * x * 3 : 0, 2); } }
  return out;
}
/* a struck bar, tine, pan or bell: a few sine modes, each dying away at its own rate, and a click for the mallet.
   o.modes: [[ratio, level, decay seconds], ...]; o.click: how loud the mallet is; o.trem: [rate, depth] (a vibraphone's fan) */
function bandModal(f, sr, o, rnd){
  const N = Math.floor(sr * o.dur), out = new Float32Array(N), sc = Math.pow(330 / f, o.tilt === undefined ? 0.3 : o.tilt);
  for (let m = 0; m < o.modes.length; m++){
    const md = o.modes[m], fm = f * md[0]; if (fm >= sr * 0.45) continue;
    const w = 2 * Math.PI * fm / sr, c2 = 2 * Math.cos(w), dk = Math.pow(0.001, 1 / (Math.max(0.02, md[2] * sc) * sr));
    let y1 = 0, y2 = -Math.sin(w), e = md[1];
    for (let n = 0; n < N; n++){ const y = c2 * y1 - y2; y2 = y1; y1 = y; out[n] += e * y; e *= dk; if (e < 1e-5) break; }
  }
  if (o.click){ const hp = bandSvf(Math.min(sr * 0.4, f * 3), 0.8, sr), cn = Math.floor(sr * 0.006); for (let n = 0; n < cn; n++) out[n] += o.click * hp(rnd() * 2 - 1, 1) * (1 - n / cn); }
  const at = Math.floor(sr * (o.att || 0.0015)); for (let n = 0; n < at && n < N; n++) out[n] *= n / at;
  if (o.trem){ const w = 2 * Math.PI * o.trem[0] / sr, c2 = 2 * Math.cos(w); let y1 = 0, y2 = -Math.sin(w); for (let n = 0; n < N; n++){ const y = c2 * y1 - y2; y2 = y1; y1 = y; out[n] *= 1 - o.trem[1] * (0.5 + 0.5 * y); } }
  return out;
}
/* an electric piano: a sine bent by another sine whose pull fades as the note rings (two-operator FM), and a tine's ping on top */
function bandEP(f, sr, o){
  const N = Math.floor(sr * o.dur), out = new Float32Array(N), T = o.decay * Math.pow(220 / f, 0.4);
  const wc = 2 * Math.PI * f / sr, tine = f * 14 < sr * 0.45 ? 2 * Math.PI * f * 14 / sr : 0;
  for (let n = 0; n < N; n++){
    const t = n / sr, I = o.index * Math.exp(-t * 4) + 0.3;
    const y = Math.sin(wc * n + I * Math.sin(wc * n));
    out[n] = (y + (tine ? 0.22 * Math.sin(tine * n) * Math.exp(-t * 28) : 0)) * Math.exp(-t / T) * Math.min(1, n / (sr * 0.002));
  }
  return out;
}
/* a piano: stretched harmonics that die away faster the higher they are, and a little felt thump from the hammer */
function bandPiano(f, sr, o, rnd){
  const N = Math.floor(sr * o.dur), out = new Float32Array(N), B = 0.0004, T = o.decay * Math.pow(220 / f, 0.4);
  for (let h = 1; h <= 10; h++){
    const fh = f * h * Math.sqrt(1 + B * h * h); if (fh >= sr * 0.45) break;
    const w = 2 * Math.PI * fh / sr, c2 = 2 * Math.cos(w), dk = Math.pow(0.001, 1 / (T / Math.pow(h, 0.6) * sr));
    let y1 = 0, y2 = -Math.sin(w), e = Math.pow(1 / h, 1.15) * (h === 1 ? 1 : 0.8);
    for (let n = 0; n < N; n++){ const y = c2 * y1 - y2; y2 = y1; y1 = y; out[n] += e * y; e *= dk; if (e < 1e-5) break; }
  }
  const lp = bandSvf(1200, 0.7, sr), hn = Math.floor(sr * 0.01); for (let n = 0; n < hn; n++) out[n] += 0.3 * lp(rnd() * 2 - 1, 0) * (1 - n / hn);
  const at = Math.floor(sr * 0.002); for (let n = 0; n < at; n++) out[n] *= n / at;
  return out;
}
/* a kettle drum, tuned to the chord: a drum skin's modes and a soft felt thump */
function bandTimp(f, sr, o, rnd){
  const out = bandModal(f, sr, { dur: o.dur, modes: [[1, 1, 1.6], [1.5, 0.55, 1.0], [1.99, 0.35, 0.7], [2.44, 0.2, 0.5], [2.98, 0.12, 0.35]], tilt: 0 }, rnd);
  const lp = bandSvf(260, 0.7, sr), hn = Math.floor(sr * 0.05); for (let n = 0; n < hn; n++) out[n] += 1.4 * lp(rnd() * 2 - 1, 0) * (1 - n / hn);
  return out;
}

/* ---------------------------------------------------------------- drawn sounds: the drum kit */
/* each returns one buffer; o holds the knobs, so one kick recipe makes a punchy rock kick, a soft one and a long electronic boom */
const BAND_DRUM_DRAW = {
  kick(sr, o, rnd){
    const N = Math.floor(sr * o.dur), out = new Float32Array(N), hp = bandSvf(2500, 0.7, sr); let ph = 0;
    for (let n = 0; n < N; n++){
      const t = n / sr, fq = o.f1 + (o.f0 - o.f1) * Math.exp(-t * o.fall);
      ph += 2 * Math.PI * fq / sr;
      let y = Math.sin(ph) * Math.exp(-t / o.decay) + (o.click || 0) * hp(rnd() * 2 - 1, 2) * Math.exp(-t * 500);
      out[n] = o.drive ? Math.tanh(o.drive * y) / Math.tanh(o.drive) : y;
    }
    return out;
  },
  snare(sr, o, rnd){
    const N = Math.floor(sr * o.dur), out = new Float32Array(N), hp = bandSvf(o.hp || 1300, 0.7, sr), lp = bandSvf(o.lp || 9000, 0.7, sr); let p1 = 0, p2 = 0;
    for (let n = 0; n < N; n++){
      const t = n / sr; p1 += 2 * Math.PI * o.t1 / sr * (1 + 0.5 * Math.exp(-t * 60)); p2 += 2 * Math.PI * o.t2 / sr;
      const tone = (Math.sin(p1) + 0.5 * Math.sin(p2)) * Math.exp(-t / o.td) * o.tone;
      const env = o.att ? Math.min(1, t / o.att) : 1;
      out[n] = tone + lp(hp(rnd() * 2 - 1, 2), 0) * Math.exp(-t / o.nd) * env * o.noise;
    }
    return out;
  },
  clap(sr, o, rnd){
    const N = Math.floor(sr * 0.3), out = new Float32Array(N), bp = bandSvf(1150, 1.3, sr);
    for (let n = 0; n < N; n++){
      const t = n / sr; let e = Math.exp(-t / 0.09) * 0.6;
      for (let k = 0; k < 3; k++){ const tk = t - k * 0.011; if (tk >= 0 && tk < 0.011) e = Math.max(e, Math.exp(-tk / 0.004)); }
      out[n] = bp(rnd() * 2 - 1, 1) * e * 2.2;
    }
    return out;
  },
  /* cymbals and hats: six square waves at clangy ratios (as the old drum machines made them) and noise, both thinned to the top end */
  metal(sr, o, rnd){
    const N = Math.floor(sr * o.dur), out = new Float32Array(N), F = [205.3, 304.4, 369.6, 522.7, 540.0, 800.0], ph = [0, 0, 0, 0, 0, 0];
    const bp = bandSvf(o.bp, 1.0, sr), hp = bandSvf(o.hp, 0.7, sr), hp2 = bandSvf(o.hp, 0.7, sr);
    for (let n = 0; n < N; n++){
      const t = n / sr; let sq = 0;
      for (let k = 0; k < 6; k++){ ph[k] += F[k] * (o.mul || 1) / sr; sq += (ph[k] % 1) < 0.5 ? 1 : -1; }
      const env = (o.att ? Math.min(1, t / o.att) : 1) * Math.exp(-t / o.decay);
      out[n] = (hp(bp(sq / 6, 1), 2) * o.ring + hp2(rnd() * 2 - 1, 2) * o.noise) * env;
    }
    if (o.rev) out.reverse();
    return out;
  },
  shaker(sr, o, rnd){
    const N = Math.floor(sr * o.dur), out = new Float32Array(N), bp = bandSvf(o.f, 1.4, sr);
    for (let n = 0; n < N; n++){ const t = n / sr; out[n] = bp(rnd() * 2 - 1, 1) * Math.min(1, t / o.att) * Math.exp(-Math.max(0, t - o.att) / o.decay) * 1.8; }
    return out;
  },
  /* a drum with a pitch: toms, congas, bongos, taiko, a woodblock, a rim click, a heartbeat */
  tom(sr, o, rnd){
    const N = Math.floor(sr * o.dur), out = new Float32Array(N), bp = bandSvf(o.nf || o.f * 3, 1, sr); let ph = 0;
    for (let n = 0; n < N; n++){
      const t = n / sr, fq = o.f * (1 + (o.bend || 0.3) * Math.exp(-t * (o.fall || 25)));
      ph += 2 * Math.PI * fq / sr;
      let y = Math.sin(ph) * Math.exp(-t / o.decay) + (o.n || 0) * bp(rnd() * 2 - 1, 1) * Math.exp(-t / (o.nd || 0.03));
      if (o.f2) y += 0.5 * Math.sin(ph * o.f2) * Math.exp(-t / (o.decay * 0.4));
      if (o.beat2 && t > o.beat2) y += 0.6 * Math.sin(2 * Math.PI * o.f * (t - o.beat2)) * Math.exp(-(t - o.beat2) / o.decay);
      out[n] = o.drive ? Math.tanh(o.drive * y) / Math.tanh(o.drive) : y;
    }
    return out;
  },
  cowbell(sr, o){
    const N = Math.floor(sr * 0.4), out = new Float32Array(N), bp = bandSvf(2600, 2, sr); let a = 0, b = 0;
    for (let n = 0; n < N; n++){ a += 562 / sr; b += 845 / sr; const sq = ((a % 1) < 0.5 ? 1 : -1) + ((b % 1) < 0.5 ? 1 : -1); out[n] = bp(sq * 0.5, 1) * Math.exp(-n / sr / 0.12) * 1.6; }
    return out;
  },
  /* the eight-bit kit: noise from a shift register (a short loop for a metallic hiss, a long one for a snare) and a stepped falling tone */
  chip(sr, o){
    const N = Math.floor(sr * o.dur), out = new Float32Array(N); let reg = 1, acc = 0, v = 1, ph = 0;
    for (let n = 0; n < N; n++){
      const t = n / sr, env = Math.exp(-t / o.decay);
      acc += o.rate / sr; while (acc >= 1){ acc--; const bit = ((reg ^ (reg >> (o.short ? 6 : 1))) & 1); reg = (reg >> 1) | (bit << 14); v = (reg & 1) ? 1 : -1; }
      let y = v * o.noise;
      if (o.f0){ const fq = o.f1 + (o.f0 - o.f1) * Math.exp(-t * o.fall); ph += fq / sr; y += (Math.abs((ph % 1) * 4 - 2) - 1) * o.tone; }
      out[n] = Math.round(y * env * 7) / 7;
    }
    return out;
  }
};
/* the kit: every drum sound the songs can ask for, by name */
const BAND_DRUMS = {
  kick:      ['kick',  { dur: 0.42, f0: 150, f1: 48, fall: 30, decay: 0.16, click: 0.35, drive: 1.6 }, 1.0],
  kickSoft:  ['kick',  { dur: 0.32, f0: 95, f1: 50, fall: 22, decay: 0.12, click: 0.1 }, 0.8],
  kick808:   ['kick',  { dur: 0.9, f0: 120, f1: 46, fall: 14, decay: 0.42, click: 0.2, drive: 1.3 }, 0.7],
  kickRock:  ['kick',  { dur: 0.38, f0: 180, f1: 52, fall: 38, decay: 0.13, click: 0.55, drive: 2.2 }, 1.0],
  snare:     ['snare', { dur: 0.3, t1: 185, t2: 330, td: 0.06, tone: 0.55, nd: 0.11, noise: 0.9 }, 0.85],
  snareTight:['snare', { dur: 0.22, t1: 240, t2: 420, td: 0.04, tone: 0.45, nd: 0.07, noise: 0.95, hp: 2000 }, 0.75],
  snareBig:  ['snare', { dur: 0.6, t1: 170, t2: 300, td: 0.08, tone: 0.5, nd: 0.25, noise: 1.0, lp: 7000 }, 0.9],
  brush:     ['snare', { dur: 0.35, t1: 200, t2: 340, td: 0.03, tone: 0.1, nd: 0.12, noise: 0.8, att: 0.012, hp: 1800, lp: 6000 }, 0.55],
  rim:       ['tom',   { dur: 0.08, f: 1700, bend: 0.1, decay: 0.012, n: 0.6, nf: 3500, nd: 0.006, f2: 2.1 }, 0.6],
  clap:      ['clap',  {}, 0.7],
  hat:       ['metal', { dur: 0.09, bp: 10000, hp: 7000, decay: 0.035, ring: 1.3, noise: 0.5 }, 0.45],
  hatOpen:   ['metal', { dur: 0.5, bp: 10000, hp: 7000, decay: 0.16, ring: 1.2, noise: 0.5 }, 0.38],
  ride:      ['metal', { dur: 1.4, bp: 5200, hp: 3400, decay: 0.45, ring: 1.0, noise: 0.25, mul: 1.4 }, 0.35],
  crash:     ['metal', { dur: 2.0, bp: 7000, hp: 3800, decay: 0.7, ring: 0.8, noise: 0.9, att: 0.004 }, 0.55],
  crashRev:  ['metal', { dur: 1.2, bp: 7000, hp: 3800, decay: 0.5, ring: 0.6, noise: 1.0, rev: true }, 0.4],
  shaker:    ['shaker',{ dur: 0.12, f: 7000, att: 0.014, decay: 0.035 }, 0.4],
  tamb:      ['metal', { dur: 0.25, bp: 9000, hp: 6000, decay: 0.07, ring: 1.4, noise: 0.8, mul: 1.9, att: 0.006 }, 0.4],
  tomHi:     ['tom',   { dur: 0.45, f: 210, decay: 0.16, n: 0.2, nd: 0.02 }, 0.75],
  tomMid:    ['tom',   { dur: 0.5, f: 150, decay: 0.19, n: 0.2, nd: 0.02 }, 0.8],
  tomLo:     ['tom',   { dur: 0.6, f: 100, decay: 0.24, n: 0.2, nd: 0.02 }, 0.85],
  congaHi:   ['tom',   { dur: 0.3, f: 340, bend: 0.25, fall: 60, decay: 0.09, n: 0.25, nf: 2200, nd: 0.008 }, 0.6],
  congaLo:   ['tom',   { dur: 0.35, f: 230, bend: 0.25, fall: 60, decay: 0.12, n: 0.2, nf: 1800, nd: 0.008 }, 0.65],
  slap:      ['tom',   { dur: 0.15, f: 380, bend: 0.2, fall: 80, decay: 0.03, n: 0.9, nf: 2600, nd: 0.025 }, 0.5],
  bongo:     ['tom',   { dur: 0.2, f: 520, bend: 0.2, fall: 80, decay: 0.06, n: 0.25, nf: 3000, nd: 0.006 }, 0.5],
  taiko:     ['tom',   { dur: 1.1, f: 62, bend: 0.5, fall: 18, decay: 0.38, n: 0.7, nf: 300, nd: 0.06, drive: 1.8 }, 1.0],
  block:     ['tom',   { dur: 0.1, f: 1050, bend: 0.05, decay: 0.03, f2: 2.4 }, 0.45],
  cowbell:   ['cowbell', {}, 0.4],
  heart:     ['tom',   { dur: 0.5, f: 52, bend: 0.4, fall: 30, decay: 0.08, beat2: 0.17 }, 0.9],
  boom:      ['kick',  { dur: 1.8, f0: 90, f1: 32, fall: 5, decay: 0.7, click: 0.6, drive: 2.5 }, 1.0],
  chipKick:  ['chip',  { dur: 0.16, rate: 4000, noise: 0.15, f0: 400, f1: 50, fall: 40, tone: 0.9, decay: 0.07 }, 0.7],
  chipSnare: ['chip',  { dur: 0.2, rate: 9000, noise: 0.8, f0: 260, f1: 120, fall: 50, tone: 0.3, decay: 0.07 }, 0.5],
  chipHat:   ['chip',  { dur: 0.06, rate: 22000, noise: 0.7, short: true, decay: 0.02 }, 0.35],
  chipCrash: ['chip',  { dur: 0.7, rate: 15000, noise: 0.7, decay: 0.25 }, 0.35]
};

/* ---------------------------------------------------------------- the instruments */
/* drawn per note: kind (ks string, modal bar, ep, piano, timp), its knobs, a level, and the register it sounds best in */
const BAND_DRAWN = {
  gtr:      ['ks', { dur: 1.8, bright: 0.62, decay: 2.2, pos: 0.18, body: [180, 1.2, 0.35] }, 0.5],
  nylon:    ['ks', { dur: 1.7, bright: 0.38, decay: 1.9, pos: 0.22, body: [140, 1.2, 0.4], blend: 0.55 }, 0.55],
  uke:      ['ks', { dur: 1.0, bright: 0.6, decay: 0.85, pos: 0.25, body: [330, 1.5, 0.35] }, 0.65],
  banjo:    ['ks', { dur: 0.9, bright: 0.95, decay: 0.55, pos: 0.12, twang: [900, 2.5, 0.6] }, 0.4],
  harp:     ['ks', { dur: 2.2, bright: 0.42, decay: 2.4, pos: 0.3, blend: 0.52 }, 0.5],
  pizz:     ['ks', { dur: 0.6, bright: 0.38, decay: 0.32, pos: 0.25, body: [260, 1.0, 0.5], blend: 0.56 }, 0.6],
  egtr:     ['ks', { dur: 1.8, bright: 0.5, decay: 2.6, pos: 0.15 }, 0.45],
  clav:     ['ks', { dur: 0.45, bright: 1.0, decay: 0.3, pos: 0.06, twang: [1500, 2, 0.4] }, 0.4],
  pbass:    ['ks', { dur: 1.3, bright: 0.28, decay: 1.4, pos: 0.2, body: [90, 1.0, 0.6], blend: 0.55 }, 0.85],
  upright:  ['ks', { dur: 1.0, bright: 0.18, decay: 0.8, pos: 0.3, body: [110, 1.2, 0.9], blend: 0.58 }, 0.95],
  sitar:    ['ks', { dur: 2.0, bright: 0.85, decay: 2.0, pos: 0.09, twang: [2300, 4, 0.7], jaw: 0.35 }, 0.95],
  dulcimer: ['ks', { dur: 1.6, bright: 0.8, decay: 1.5, pos: 0.13, body: [520, 1.2, 0.3], twang: [3000, 2, 0.25] }, 0.45],
  marimba:  ['modal', { dur: 1.0, modes: [[1, 1, 0.5], [3.93, 0.4, 0.16], [9.2, 0.1, 0.06]], click: 0.25 }, 0.6],
  xylo:     ['modal', { dur: 0.6, modes: [[1, 1, 0.28], [3.0, 0.45, 0.12], [6.2, 0.15, 0.05]], click: 0.4 }, 0.5],
  kalimba:  ['modal', { dur: 1.4, modes: [[1, 1, 1.0], [5.9, 0.28, 0.22], [12.1, 0.1, 0.08]], click: 0.3 }, 0.55],
  vibes:    ['modal', { dur: 2.2, modes: [[1, 1, 2.0], [4.0, 0.25, 0.7], [10.0, 0.06, 0.25]], click: 0.15, trem: [5.3, 0.3] }, 0.45],
  glock:    ['modal', { dur: 1.6, modes: [[1, 1, 1.4], [2.71, 0.5, 0.6], [5.15, 0.25, 0.3], [8.6, 0.1, 0.15]], click: 0.2, tilt: 0.15 }, 0.32],
  musicbox: ['modal', { dur: 1.4, modes: [[1, 1, 1.1], [4.98, 0.3, 0.25], [9.6, 0.1, 0.08]], click: 0.15, tilt: 0.15 }, 0.35],
  steel:    ['modal', { dur: 1.3, modes: [[1, 1, 0.9], [2, 0.75, 0.7], [3, 0.3, 0.4], [4.07, 0.18, 0.25], [5.1, 0.06, 0.15]], click: 0.1, att: 0.003 }, 0.9],
  bell:     ['modal', { dur: 2.6, modes: [[0.5, 0.5, 2.4], [1, 1, 1.8], [1.19, 0.6, 1.4], [1.56, 0.45, 1.0], [2, 0.35, 0.8], [2.51, 0.25, 0.5], [3.01, 0.12, 0.35]], click: 0.1, tilt: 0.1 }, 0.3],
  epiano:   ['ep', { dur: 1.8, decay: 1.4, index: 1.6 }, 0.38],
  piano:    ['piano', { dur: 2.2, decay: 2.2 }, 0.4],
  timp:     ['timp', { dur: 1.6 }, 0.7]
};
/* played live: oscillators (w: waves, det: detune in cents, mul: octave multiples, amp: their levels), an envelope (a, d, s, r),
   a filter (lp, q, or lpEnv [from, peak, settle, seconds] for a filter that opens and closes like a pluck or a brass bite),
   vowel formants (fm), vibrato (vib [rate, cents, delay]), a slide between notes (glide), breath noise, and drive (an overdriven amp) */
const BAND_LIVE = {
  pad:      { w: ['sawtooth', 'sawtooth'], det: [-8, 8], lp: 1100, q: 0.6, a: 0.45, d: 0.6, s: 0.8, r: 0.9, lv: 0.22 },
  warm:     { w: ['sawtooth', 'triangle'], det: [-6, 5], mul: [1, 2], amp: [1, 0.5], lp: 1500, q: 0.5, a: 0.5, d: 0.6, s: 0.85, r: 1.0, lv: 0.24 },
  glass:    { w: ['sine', 'triangle', 'sine'], mul: [1, 2, 3], amp: [1, 0.35, 0.12], a: 0.3, d: 0.6, s: 0.8, r: 1.2, vib: [4.5, 5, 0.3], lv: 0.16 },
  strings:  { w: ['sawtooth', 'sawtooth', 'sawtooth'], det: [-11, 1, 10], lp: 2600, q: 0.5, a: 0.28, d: 0.5, s: 0.85, r: 0.6, vib: [5.2, 7, 0.25], lv: 0.13 },
  violin:   { w: ['sawtooth', 'sawtooth'], det: [-4, 4], lp: 3400, q: 1.2, a: 0.07, d: 0.3, s: 0.9, r: 0.25, vib: [5.8, 16, 0.14], glide: 0.03, lv: 0.17 },
  choir:    { w: ['sawtooth', 'sawtooth'], det: [-9, 9], fm: [[700, 6, 1], [1150, 7, 0.6], [2700, 8, 0.2]], a: 0.35, d: 0.5, s: 0.9, r: 0.7, vib: [5, 10, 0.2], lv: 0.3 },
  organ:    { pw: 'organ', lp: 4500, a: 0.012, d: 0.1, s: 1, r: 0.08, vib: [6.5, 4, 0], lv: 0.24 },
  brass:    { w: ['sawtooth', 'sawtooth'], det: [-5, 5], lpEnv: [350, 3000, 1500, 0.09], q: 1, a: 0.035, d: 0.2, s: 0.85, r: 0.15, vib: [5.5, 10, 0.25], lv: 0.13 },
  horn:     { w: ['sawtooth', 'triangle'], det: [-4, 4], lpEnv: [250, 1500, 900, 0.12], q: 0.8, a: 0.06, d: 0.3, s: 0.85, r: 0.25, vib: [5, 8, 0.3], lv: 0.16 },
  tuba:     { w: ['sawtooth', 'sine'], lpEnv: [150, 900, 500, 0.08], q: 0.9, a: 0.03, d: 0.2, s: 0.8, r: 0.12, lv: 0.3 },
  flute:    { w: ['sine', 'triangle'], amp: [1, 0.2], breath: 0.07, a: 0.05, d: 0.2, s: 0.9, r: 0.12, vib: [5, 12, 0.18], lv: 0.28 },
  panflute: { w: ['sine', 'sine'], mul: [1, 2], amp: [1, 0.12], breath: 0.16, a: 0.03, d: 0.15, s: 0.8, r: 0.15, vib: [5.5, 10, 0.12], lv: 0.28 },
  whistle:  { w: ['sine'], breath: 0.03, a: 0.02, d: 0.1, s: 0.95, r: 0.08, vib: [6, 18, 0.08], glide: 0.035, lv: 0.3 },
  sax:      { w: ['sawtooth', 'square'], amp: [1, 0.3], bp: [1300, 1.1], lp: 3600, breath: 0.04, a: 0.035, d: 0.2, s: 0.85, r: 0.1, vib: [5, 15, 0.2], glide: 0.02, lv: 0.24 },
  reed:     { w: ['square', 'sawtooth'], amp: [0.6, 0.5], bp: [1600, 1.4], lp: 4200, a: 0.02, d: 0.1, s: 0.9, r: 0.08, vib: [6.5, 22, 0.1], glide: 0.015, lv: 0.24 },
  square:   { w: ['square'], lp: 2600, q: 0.7, a: 0.008, d: 0.15, s: 0.8, r: 0.08, vib: [5.5, 10, 0.2], lv: 0.25 },
  saw:      { w: ['sawtooth', 'sawtooth'], det: [-9, 9], lpEnv: [800, 3600, 2200, 0.15], q: 2, a: 0.01, d: 0.2, s: 0.8, r: 0.12, vib: [5.5, 8, 0.2], lv: 0.3 },
  supersaw: { w: ['sawtooth', 'sawtooth', 'sawtooth'], det: [-16, 0, 15], lp: 3000, q: 0.7, a: 0.02, d: 0.3, s: 0.75, r: 0.3, lv: 0.16 },
  theremin: { w: ['sine', 'sine'], mul: [1, 2], amp: [1, 0.08], a: 0.08, d: 0.2, s: 0.95, r: 0.3, vib: [6.2, 28, 0.05], glide: 0.09, lv: 0.25 },
  dist:     { w: ['sawtooth', 'square'], det: [-7, 7], drive: true, lp: 2800, q: 1, a: 0.008, d: 0.3, s: 0.8, r: 0.12, vib: [5.5, 22, 0.25], glide: 0.02, lv: 0.4 },
  power:    { w: ['sawtooth', 'sawtooth', 'sawtooth'], det: [-6, 4, 6], mul: [1, 1.4983, 2], drive: true, lp: 2300, q: 1, a: 0.005, d: 0.2, s: 0.8, r: 0.07, lv: 0.26 },
  chip:     { pw: 'pulse12', a: 0.002, d: 0.08, s: 0.85, r: 0.03, vib: [6, 10, 0.22], lv: 0.6 },
  chip25:   { pw: 'pulse25', a: 0.002, d: 0.08, s: 0.75, r: 0.03, lv: 0.3 },
  chipBass: { w: ['triangle'], a: 0.002, d: 0.05, s: 0.95, r: 0.02, lv: 0.16 },
  pluckSyn: { w: ['sawtooth', 'square'], det: [-6, 6], lpEnv: [300, 4200, 500, 0.12], q: 3, a: 0.003, d: 0.25, s: 0.15, r: 0.12, lv: 0.2 },
  synbass:  { w: ['sawtooth', 'square'], mul: [1, 0.5], amp: [1, 0.6], lpEnv: [180, 1500, 380, 0.09], q: 4, a: 0.004, d: 0.2, s: 0.85, r: 0.06, lv: 0.26 },
  acid:     { w: ['sawtooth'], lpEnv: [200, 2800, 320, 0.14], q: 12, a: 0.003, d: 0.15, s: 0.8, r: 0.05, glide: 0.04, lv: 0.14 },
  sub:      { w: ['sine', 'triangle'], amp: [1, 0.3], a: 0.012, d: 0.2, s: 0.95, r: 0.1, lv: 0.14 },
  /* the giraffe's own instrument: a B-flat soprano saxophone. A conical reed is bright and a little nasal (two vocal bumps in the
     tone), every note is scooped up from just under the pitch, and the vibrato comes in late, as a player's does */
  soprano:  { w: ['sawtooth', 'square'], amp: [1, 0.16], bp: [[1150, 1.5, 8], [2700, 2.4, 5]], lp: 5200, q: 0.6, breath: 0.05, scoop: 40, a: 0.03, d: 0.18, s: 0.86, r: 0.12, vib: [5.6, 13, 0.24], glide: 0.035, lv: 0.26 },
  harmonica:{ w: ['square', 'sawtooth'], amp: [0.7, 0.45], bp: [[1750, 1.3, 9]], lp: 3800, breath: 0.07, scoop: 25, trem: [5.2, 0.28, 0.3], a: 0.025, d: 0.12, s: 0.9, r: 0.08, vib: [5.2, 8, 0.3], glide: 0.03, lv: 0.19 },
  didge:    { w: ['sawtooth', 'sawtooth'], det: [-5, 5], wah: [0.55, 320, 1250, 5], lp: 1800, breath: 0.04, a: 0.25, d: 0.3, s: 1, r: 0.5, lv: 0.36 },
  talkbass: { w: ['sawtooth', 'square'], mul: [1, 0.5], amp: [1, 0.5], vowel: [[320, 760, 6, 1], [800, 1250, 7, 0.7]], vt: 0.11, lp: 2200, a: 0.004, d: 0.2, s: 0.85, r: 0.06, glide: 0.03, lv: 0.6 },
  brassSec: { w: ['sawtooth', 'sawtooth', 'sawtooth'], det: [-13, 0, 12], lpEnv: [450, 3800, 1700, 0.07], q: 1, a: 0.02, d: 0.15, s: 0.8, r: 0.1, vib: [5.5, 6, 0.3], lv: 0.36 },
  ensemble: { w: ['sawtooth', 'sawtooth', 'sawtooth'], det: [-17, -2, 15], lp: 3000, q: 0.5, a: 0.45, d: 0.6, s: 0.88, r: 0.8, vib: [4.8, 9, 0.35], lv: 0.12 },
  cello:    { w: ['sawtooth', 'sawtooth'], det: [-3, 3], lp: 1900, q: 1.3, bp: [[320, 1, 5]], a: 0.09, d: 0.3, s: 0.9, r: 0.3, vib: [5.2, 14, 0.2], glide: 0.04, lv: 0.2 },
  ooh:      { w: ['sawtooth', 'sawtooth'], det: [-8, 8], fm: [[380, 6, 1], [820, 7, 0.45], [2500, 8, 0.1]], a: 0.45, d: 0.5, s: 0.9, r: 0.8, vib: [4.6, 9, 0.3], lv: 0.32 },
  accordion:{ w: ['sawtooth', 'square', 'sawtooth'], det: [-13, 0, 13], amp: [0.6, 0.35, 0.6], lp: 3400, bp: [[1500, 1, 5]], a: 0.03, d: 0.1, s: 0.95, r: 0.08, lv: 0.24 }
};
/* how much each part matters when the band runs out of voices: the drums' kick and snare, the bass and the tune are the last to go */
const BAND_PRIO = { drums: 2, bass: 2, lead: 2, solo: 2, perc: 0, comp: 1, pad: 1, arp: 0, counter: 1, lead2: 1, fx: 0 };
/* the parts: level, place left (-1) to right (1), how much goes into the room and into the echo */
const BAND_PARTS = {
  drums:   { lv: 0.42, pan: 0,     rv: 0.12, dl: 0 },
  perc:    { lv: 0.45, pan: 0.38,  rv: 0.2,  dl: 0 },
  bass:    { lv: 0.95, pan: 0,     rv: 0.04, dl: 0 },
  comp:    { lv: 0.6,  pan: -0.3,  rv: 0.24, dl: 0 },
  pad:     { lv: 0.5,  pan: 0,     rv: 0.45, dl: 0 },
  arp:     { lv: 0.65, pan: 0.42,  rv: 0.26, dl: 0.22 },
  lead:    { lv: 0.68, pan: 0.06,  rv: 0.28, dl: 0.16 },
  counter: { lv: 0.8,  pan: -0.42, rv: 0.3,  dl: 0.08 },
  lead2:   { lv: 0.6,  pan: -0.24, rv: 0.3,  dl: 0.12 },     /* the second tune: an answer, a harmony, a canon, the octave doubling */
  solo:    { lv: 0.72, pan: 0.14,  rv: 0.34, dl: 0.2 },      /* a solo, and the giraffe's tune */
  fx:     { lv: 0.6,  pan: 0,     rv: 0.4,  dl: 0 }
};

/* ---------------------------------------------------------------- the bank of drawn notes */
/* drawn once and kept (up to BAND_BANK_MAX, the longest unused first out); pitched buffers are drawn at 24 kHz and their silent
   tails cut, which keeps them small */
const BAND_BANK_RATE = 24000, BAND_BANK_MAX = 260;
const BandBank = { map: new Map(), queue: [], drawn: 0 };
function bandDrawBuf(c, key){
  const B = BandBank; let b = B.map.get(key);
  if (b){ B.map.delete(key); B.map.set(key, b); return b; }                 /* used again: it moves to the back of the queue to be dropped */
  const sep = key.indexOf(':'), kind = key.slice(0, sep), name = key.slice(sep + 1);
  let data, rate = BAND_BANK_RATE, lv = 1;
  if (kind === 'd'){
    const d = BAND_DRUMS[name]; if (!d) return null;
    rate = 32000; data = BAND_DRUM_DRAW[d[0]](rate, d[1], bandRng(bandSeed(name))); lv = d[2];
  } else {
    const at = name.lastIndexOf('@'), inst = BAND_DRAWN[name.slice(0, at)], m = +name.slice(at + 1); if (!inst) return null;
    const f = bandMtof(m), o = inst[1], rnd = bandRng(bandSeed(name)), short = Object.assign({}, o, { dur: o.dur * Math.min(1, Math.max(0.45, Math.pow(392 / f, 0.35))) });
    data = inst[0] === 'ks' ? bandKS(f, rate, short, rnd) : inst[0] === 'modal' ? bandModal(f, rate, short, rnd) : inst[0] === 'ep' ? bandEP(f, rate, short) : inst[0] === 'piano' ? bandPiano(f, rate, short, rnd) : bandTimp(f, rate, short, rnd);
    lv = inst[2];
  }
  let pk = 1e-6; for (let i = 0; i < data.length; i++){ const a = Math.abs(data[i]); if (a > pk) pk = a; }
  let N = data.length; while (N > rate * 0.1 && Math.abs(data[N - 1]) < pk * 0.0006) N--;   /* the silent tail is cut off: smaller buffers */
  const fade = Math.min(N, Math.floor(rate * 0.03));
  for (let i = 0; i < fade; i++) data[N - 1 - i] *= i / fade;                 /* no click where the buffer ends */
  const buf = c.createBuffer(1, N, rate), ch = buf.getChannelData(0), k = lv / pk;
  for (let i = 0; i < N; i++) ch[i] = data[i] * k;
  b = { buf: buf, dur: N / rate };
  B.map.set(key, b); B.drawn++;
  while (B.map.size > BAND_BANK_MAX) B.map.delete(B.map.keys().next().value);
  return b;
}
/* the notes a song will want are drawn a few at a time between beats, so the first bar of a new song does not stall on them */
function bandWarm(c, n){
  const Q = BandBank.queue; let k = 0;
  while (Q.length && k < n){ const key = Q.shift(); if (!BandBank.map.has(key)){ bandDrawBuf(c, key); k++; } }
}

/* ---------------------------------------------------------------- the rig: the parts' faders, the room and the echo */
/* the whole band, trimmed to sit where the old music sat under the sound effects */
const BAND_TRIM = 0.35;
function bandRig(c, dest){
  const out = c.createGain(); out.gain.value = BAND_TRIM; out.connect(dest);
  const R = { c: c, out: out, part: {}, voices: 0, ends: [], cap: 64, lastF: {}, offline: typeof OfflineAudioContext !== 'undefined' && c instanceof OfflineAudioContext };
  /* two seconds of noise to loop for breath and risers */
  const nl = Math.floor(c.sampleRate * 2), nb = c.createBuffer(1, nl, c.sampleRate), nd = nb.getChannelData(0), rnd = bandRng(7);
  for (let i = 0; i < nl; i++) nd[i] = rnd() * 2 - 1;
  R.noise = nb;
  R.curve = new Float32Array(1024); for (let i = 0; i < 1024; i++){ const x = i / 511.5 - 1; R.curve[i] = Math.tanh(3 * x) / Math.tanh(3); }
  /* pulse waves for the eight-bit voices, and an organ's drawbars */
  const pulse = function(d){ const n = 48, re = new Float32Array(n), im = new Float32Array(n); for (let k = 1; k < n; k++) re[k] = 2 * Math.sin(Math.PI * k * d) / (Math.PI * k); return c.createPeriodicWave(re, im); };
  const org = (function(){ const H = [0, 1, 0.75, 0.5, 0.3, 0.18, 0.12, 0, 0.1], re = new Float32Array(H.length), im = new Float32Array(H); return c.createPeriodicWave(re, im); })();
  R.waves = { pulse12: pulse(0.125), pulse25: pulse(0.25), organ: org };
  /* the room: a stereo burst of noise that dies away and darkens, so every part sits in the same space */
  const rl = Math.floor(c.sampleRate * 2), rb = c.createBuffer(2, rl, c.sampleRate);
  for (let ch = 0; ch < 2; ch++){
    const d = rb.getChannelData(ch), r2 = bandRng(31 + ch); let lp = 0;
    for (let i = 0; i < rl; i++){ const tt = i / rl, a = 0.35 + 0.6 * tt, u = 1 - tt; lp = a * lp + (1 - a) * (r2() * 2 - 1); d[i] = lp * u * u * u * (i < 96 ? i / 96 : 1) * 0.6; }
  }
  R.verb = c.createConvolver(); R.verb.buffer = rb;
  R.verbIn = c.createGain(); R.verbRet = c.createGain(); R.verbRet.gain.value = 1;
  R.verbIn.connect(R.verb); R.verb.connect(R.verbRet); R.verbRet.connect(out);
  /* the echo: left and right taps that answer each other, darkening as they fade */
  R.dlyIn = c.createGain();
  R.dl = c.createDelay(2); R.dr = c.createDelay(2); R.dl.delayTime.value = 0.42; R.dr.delayTime.value = 0.42;
  const fb = c.createGain(), lp = c.createBiquadFilter(), ret = c.createGain();
  fb.gain.value = 0.36; lp.type = 'lowpass'; lp.frequency.value = 3000; ret.gain.value = 0.7;
  R.dlyIn.connect(R.dl); R.dl.connect(lp); lp.connect(R.dr); R.dr.connect(fb); fb.connect(R.dl);
  if (c.createStereoPanner){
    const pl = c.createStereoPanner(), pr = c.createStereoPanner(); pl.pan.value = -0.7; pr.pan.value = 0.7;
    R.dl.connect(pl); R.dr.connect(pr); pl.connect(ret); pr.connect(ret);
  } else { R.dl.connect(ret); R.dr.connect(ret); }
  ret.connect(out); R.dlyRet = ret;
  for (const p in BAND_PARTS){
    const d = BAND_PARTS[p], lv = c.createGain(), fd = c.createGain(), sv = c.createGain(), sd = c.createGain();
    lv.gain.value = d.lv; fd.gain.value = 1; sv.gain.value = d.rv; sd.gain.value = d.dl;
    lv.connect(fd); let node = fd, pn = null;
    if (c.createStereoPanner){ pn = c.createStereoPanner(); pn.pan.value = d.pan; fd.connect(pn); node = pn; }
    node.connect(out); node.connect(sv); sv.connect(R.verbIn); node.connect(sd); sd.connect(R.dlyIn);
    R.part[p] = { in: lv, lv: lv, fd: fd, pn: pn, sv: sv, sd: sd };
  }
  return R;
}
/* a song can turn parts up or down, move them, and make the room bigger or the echo longer */
function bandMix(R, song, t){
  const mx = song.mix || {}, room = song.room === undefined ? 1 : song.room;
  for (const p in BAND_PARTS){
    const d = BAND_PARTS[p], m = mx[p] || {}, P = R.part[p];
    P.lv.gain.setTargetAtTime(d.lv * (m.lv === undefined ? 1 : m.lv), t, 0.2);
    P.sv.gain.setTargetAtTime(d.rv * room * (m.rv === undefined ? 1 : m.rv), t, 0.2);
    P.sd.gain.setTargetAtTime(d.dl * (song.echo === undefined ? 1 : song.echo) * (m.dl === undefined ? 1 : m.dl), t, 0.2);
    if (P.pn) P.pn.pan.setTargetAtTime(m.pan === undefined ? d.pan : m.pan, t, 0.2);
  }
}
/* the echo follows the tempo: a dotted eighth */
function bandEchoTime(R, bpm, t){ const v = Math.min(1.5, 60 / bpm * 0.75); R.dl.delayTime.setTargetAtTime(v, t, 0.05); R.dr.delayTime.setTargetAtTime(v, t, 0.05); }

/* ---------------------------------------------------------------- playing */
/* how many notes are still sounding: each note leaves the time it ends, and the ones that have ended are dropped as they are counted */
function bandCount(R, end){ R.ends.push(end); }
function bandVoices(R){
  if (R.offline) return 0;
  const now = R.c.currentTime;
  if (R.ends.length > 24 && R.prunedAt !== now){ R.prunedAt = now; let k = 0; for (let i = 0; i < R.ends.length; i++) if (R.ends[i] > now) R.ends[k++] = R.ends[i]; R.ends.length = k; }
  R.voices = R.ends.length; return R.voices;
}
/* one drum hit */
function bandHit(R, part, name, t, vel){
  if (!R.offline && bandVoices(R) > R.cap && !(part === 'drums' && (name.indexOf('kick') >= 0 || name.indexOf('nare') >= 0))) return;
  const b = bandDrawBuf(R.c, 'd:' + name); if (!b) return;
  const s = R.c.createBufferSource(), g = R.c.createGain();
  s.buffer = b.buf; g.gain.value = vel;
  s.connect(g); g.connect(R.part[part].in);
  bandCount(R, t + b.dur); s.start(Math.max(0, t)); s.stop(t + b.dur + 0.05);
  return s;
}
/* one note, or a chord (m an array), on an instrument, for dur seconds */
function bandNote(R, part, inst, m, t, dur, vel, o){
  if (!R.offline && bandVoices(R) > R.cap * (BAND_PRIO[part] === 2 ? 1.25 : BAND_PRIO[part] === 1 ? 0.9 : 0.7)) return;
  if (BAND_DRAWN[inst]){
    const ms = Array.isArray(m) ? m : [m], spread = (o && o.strum) || 0;
    for (let k = 0; k < ms.length; k++){
      const b = bandDrawBuf(R.c, 'i:' + inst + '@' + ms[k]); if (!b) continue;
      const tt = t + (spread > 0 ? k : spread < 0 ? ms.length - 1 - k : 0) * Math.abs(spread);
      const s = R.c.createBufferSource(), g = R.c.createGain();
      s.buffer = b.buf;
      const end = Math.min(b.dur, dur + 0.02);
      g.gain.setValueAtTime(vel, tt);
      if (end < b.dur - 0.05){ g.gain.setValueAtTime(vel, tt + end); g.gain.setTargetAtTime(0, tt + end, (o && o.damp) || 0.035); }
      s.connect(g); g.connect(R.part[part].in);
      bandCount(R, tt + Math.min(b.dur, end + 0.25)); s.start(Math.max(0, tt)); s.stop(tt + Math.min(b.dur, end + 0.25) + 0.02);
    }
    return;
  }
  const L = BAND_LIVE[inst]; if (!L) return;
  bandLive(R, part, L, Array.isArray(m) ? m : [m], t, dur, vel, o);
}
/* a held note or chord on a live instrument: oscillators into one envelope and filter chain */
function bandLive(R, part, L, ms, t, dur, vel, o){
  const c = R.c, g = c.createGain(), end = t + dur, rel = L.r || 0.1, peak = vel * L.lv, stop = end + rel * 1.6 + 0.05;
  let head = g;
  if (L.drive){ const ws = c.createWaveShaper(); ws.curve = R.curve; ws.oversample = 'none'; const pre = c.createGain(); pre.gain.value = 2.5; pre.connect(ws); head = pre; ws.connect(g); }
  let into = head;
  if (L.lp || L.lpEnv){
    const f = c.createBiquadFilter(); f.type = 'lowpass'; f.Q.value = L.q || 0.7; f.connect(into); into = f;
    if (L.lpEnv){ const e = L.lpEnv, k = (o && o.bright) || 1; f.frequency.setValueAtTime(e[0], t); f.frequency.linearRampToValueAtTime(e[1] * k, t + 0.012); f.frequency.setTargetAtTime(e[2] * k, t + 0.012, e[3]); }
    else f.frequency.value = L.lp * ((o && o.bright) || 1);
  }
  if (L.bp){
    /* one bump in the tone ([frequency, width]) or several ([[f, width, how much], ...]): a sax's or a harmonica's vowel */
    const pk = Array.isArray(L.bp[0]) ? L.bp : [[L.bp[0], L.bp[1], 9]];
    for (let k = pk.length - 1; k >= 0; k--){ const f = c.createBiquadFilter(); f.type = 'peaking'; f.frequency.value = pk[k][0]; f.Q.value = pk[k][1]; f.gain.value = pk[k][2] === undefined ? 9 : pk[k][2]; f.connect(into); into = f; }
  }
  if (L.fm || L.vowel){
    /* vowels: a choir's held ones, or a talking bass whose mouth opens from "oo" to "ah" as each note starts */
    const sum = c.createGain(), V = L.fm || L.vowel; sum.gain.value = 1;
    for (let k = 0; k < V.length; k++){
      const f = c.createBiquadFilter(), fg = c.createGain(); f.type = 'bandpass';
      if (L.vowel){ f.frequency.setValueAtTime(V[k][0], t); f.frequency.exponentialRampToValueAtTime(V[k][1], t + (L.vt || 0.1)); f.Q.value = V[k][2]; fg.gain.value = V[k][3] * 2.2; }
      else { f.frequency.value = V[k][0]; f.Q.value = V[k][1]; fg.gain.value = V[k][2] * 2.2; }
      sum.connect(f); f.connect(fg); fg.connect(into);
    }
    into = sum;
  }
  if (L.wah){
    /* a didgeridoo's moving mouth: a narrow band sweeps slowly up and down over the drone, with some of the plain drone under it */
    const w = L.wah, sum = c.createGain(), f = c.createBiquadFilter(), dry = c.createGain(), lfo = c.createOscillator(), dep = c.createGain();
    f.type = 'bandpass'; f.Q.value = w[3]; f.frequency.value = (w[1] + w[2]) / 2; dry.gain.value = 0.35;
    lfo.frequency.value = w[0]; dep.gain.value = (w[2] - w[1]) / 2; lfo.connect(dep); dep.connect(f.frequency);
    sum.connect(f); f.connect(into); sum.connect(dry); dry.connect(into); lfo.start(t); lfo.stop(stop);
    into = sum;
  }
  if (L.trem){
    /* a harmonica player's hand opening and closing round it: the loudness wobbles, coming in a moment after the note */
    const tg = c.createGain(), lfo = c.createOscillator(), dep = c.createGain();
    tg.gain.value = 1; lfo.frequency.value = L.trem[0]; dep.gain.setValueAtTime(0, t); dep.gain.linearRampToValueAtTime(L.trem[1], t + L.trem[2] + 0.15);
    lfo.connect(dep); dep.connect(tg.gain); tg.connect(into); lfo.start(t); lfo.stop(stop);
    into = tg;
  }
  g.connect(R.part[part].in);
  /* the envelope: rise, fall to the held level, and let go at the end */
  const a = Math.min(L.a || 0.01, dur * 0.5), d = L.d || 0.1;
  g.gain.setValueAtTime(0.0001, t);
  g.gain.linearRampToValueAtTime(peak, t + a);
  g.gain.setTargetAtTime(peak * (L.s === undefined ? 0.8 : L.s), t + a, d / 3);
  g.gain.setTargetAtTime(0.0001, end, rel / 3);
  /* vibrato: one slow oscillator bends every oscillator of the note a few cents, starting a moment after the note does */
  let vib = null;
  if (L.vib && dur > 0.15){
    vib = c.createGain(); const lfo = c.createOscillator(); lfo.frequency.value = L.vib[0];
    vib.gain.setValueAtTime(0, t); vib.gain.linearRampToValueAtTime(L.vib[1], t + Math.max(0.01, L.vib[2]) + 0.2);
    lfo.connect(vib); lfo.start(t); lfo.stop(stop);
  }
  const W = L.pw ? [L.pw] : L.w, first = { n: null };
  for (let i = 0; i < ms.length; i++){
    const f0 = bandMtof(ms[i]);
    for (let k = 0; k < W.length; k++){
      const os = c.createOscillator(), ag = c.createGain();
      if (L.pw) os.setPeriodicWave(R.waves[L.pw]); else os.type = W[k];
      const fq = f0 * ((L.mul && L.mul[k]) || 1);
      if (L.glide && ms.length === 1 && R.lastF[part]){
        const from = R.lastF[part] * ((L.mul && L.mul[k]) || 1);
        os.frequency.setValueAtTime(from, t); os.frequency.exponentialRampToValueAtTime(fq, t + L.glide);
      } else os.frequency.setValueAtTime(fq, t);
      const dt = (L.det && L.det[k]) || 0;
      if (L.scoop){ os.detune.setValueAtTime(dt - L.scoop, t); os.detune.linearRampToValueAtTime(dt, t + 0.07); }   /* a reed player's scoop up into the note */
      else if (dt) os.detune.value = dt;
      if (vib) vib.connect(os.detune);
      ag.gain.value = ((L.amp && L.amp[k] !== undefined) ? L.amp[k] : 1) / Math.sqrt(ms.length);
      os.connect(ag); ag.connect(into);
      os.start(t); os.stop(stop);
      if (!first.n){ first.n = os; bandCount(R, stop); }
    }
  }
  if (ms.length === 1) R.lastF[part] = bandMtof(ms[0]);
  /* breath: a little filtered noise under a flute, a whistle or a sax */
  if (L.breath){
    const s = c.createBufferSource(), f = c.createBiquadFilter(), bg = c.createGain();
    s.buffer = R.noise; s.loop = true; f.type = 'bandpass'; f.frequency.value = Math.min(9000, bandMtof(ms[0]) * 2); f.Q.value = 1.2;
    bg.gain.setValueAtTime(0, t); bg.gain.linearRampToValueAtTime(L.breath * 3, t + 0.03); bg.gain.setTargetAtTime(L.breath, t + 0.03, 0.05); bg.gain.setTargetAtTime(0, end, rel / 3);
    s.connect(f); f.connect(bg); bg.connect(into);
    s.start(t, Math.random() * 1.5); s.stop(stop);
  }
}
/* a riser: noise that climbs through a filter over a bar and swells, into the next section */
function bandRiser(R, t, dur, vel){
  const c = R.c, s = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain();
  s.buffer = R.noise; s.loop = true; f.type = 'bandpass'; f.Q.value = 2.2;
  f.frequency.setValueAtTime(350, t); f.frequency.exponentialRampToValueAtTime(7000, t + dur);
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vel, t + dur * 0.97); g.gain.linearRampToValueAtTime(0.0001, t + dur + 0.04);
  s.connect(f); f.connect(g); g.connect(R.part.fx.in);
  bandCount(R, t + dur); s.start(t); s.stop(t + dur + 0.08);
}
