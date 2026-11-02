'use strict';
/* The arranger: plays the songbook (02f-band-songs.js) on the band's instruments (02e-band-voices.js), and takes over the music's
   sequencer (Music.pump in 02-music.js); Music.refresh still decides WHICH song should be playing, and this file decides how.
   - A song is in sections (intro, verse, chorus, a second verse, bridge, breakdown, a last chorus a key higher), eight bars each.
     Outside a run (menus, town, films, the shop) the band plays the song's form round and round, two to four minutes before it repeats,
     and every time round the tune and the drums vary a little.
   - In a run the fight picks the next section: quiet between waves (a breakdown), the verse while it is calm, the chorus when the screen
     fills up, the bridge so a long fight does not loop one chorus, the last chorus deep into a chapter. The decision is made a bar
     early, so the band can lead into it: a drum fill, a snare roll and a rising sweep into a chorus, a crash on the first beat of it.
   - The parts join as a wave builds: the drums follow how many enemies are out, the bass how close they are; nearly dead, the chords
     and tunes thin out, the mix muffles (02-music.js) and a heartbeat comes in.
   - A boss cuts in on the next beat with a boom; its song has a riff the band locks to, and at half health the last section, faster.
   The melodies are written (the hook) or composed from the song's name (verse, bridge, a boss's chorus): a two-bar motif, answered,
   repeated with ornaments, and brought home; on the strong beats each note is nudged onto the chord. */
MUSIC_SCALES.mixo = [0, 2, 4, 5, 7, 9, 10];

/* the sections: bars, drum energy (0-3), which parts play, and what the tune does */
const BAND_SECTIONS = {
  intro:  { bars: 4, e: 0, parts: 'pad arp perc bass', mel: 'tease' },
  verse:  { bars: 8, e: 1, parts: 'drums perc bass comp pad', mel: 'verse' },
  verse2: { bars: 8, e: 1, parts: 'drums perc bass comp pad arp', mel: 'verse' },
  chorus: { bars: 8, e: 2, parts: 'drums perc bass comp pad arp lead counter', mel: 'hook' },
  bridge: { bars: 8, e: 1, parts: 'drums perc bass comp pad arp lead', mel: 'bridge' },
  break:  { bars: 4, e: 0, parts: 'perc bass pad arp', mel: 'echo' },
  final:  { bars: 8, e: 3, parts: 'drums perc bass comp pad arp lead counter', mel: 'hook', up: true }
};
const BAND_BOSS_SECTIONS = {
  intro:  { bars: 2, e: 2, parts: 'drums bass comp', mel: 'riff' },
  verse:  { bars: 8, e: 2, parts: 'drums perc bass comp pad lead', mel: 'riff' },
  verse2: { bars: 8, e: 2, parts: 'drums perc bass comp pad arp lead', mel: 'riff' },
  chorus: { bars: 8, e: 3, parts: 'drums perc bass comp pad arp lead counter', mel: 'hook' },
  bridge: { bars: 4, e: 1, parts: 'drums bass pad arp lead counter', mel: 'bridge' },
  break:  { bars: 4, e: 1, parts: 'drums bass pad comp', mel: 'riff' },
  final:  { bars: 8, e: 3, parts: 'drums perc bass comp pad arp lead counter', mel: 'hook', up: true }
};
(function(){ for (const T of [BAND_SECTIONS, BAND_BOSS_SECTIONS]) for (const k in T) T[k].set = new Set(T[k].parts.split(' ')); })();
const BAND_FORM = ['intro', 'verse', 'chorus', 'verse2', 'chorus', 'bridge', 'break', 'final'];
const BAND_FORM_CALM = ['intro', 'verse', 'chorus', 'verse2', 'break', 'chorus', 'bridge', 'chorus'];
const BAND_FORM_BOSS = ['intro', 'verse', 'chorus', 'verse2', 'bridge', 'chorus'];
/* where each instrument likes its tunes to sit: the middle of its tune, as a MIDI note (a flute or a glockenspiel high, a horn lower) */
const BAND_REG = { flute: 76, panflute: 76, whistle: 74, glock: 80, musicbox: 80, chip: 78, chip25: 70, glass: 74, xylo: 80, kalimba: 72, marimba: 67, vibes: 70,
  steel: 70, dist: 67, saw: 69, square: 70, theremin: 70, brass: 65, horn: 62, sax: 65, reed: 67, violin: 74, strings: 67, piano: 67, epiano: 67,
  choir: 65, bell: 72, harp: 67, egtr: 65, banjo: 67, uke: 67, nylon: 65, gtr: 65, organ: 65, pluckSyn: 70, supersaw: 67 };
/* the home key note for an instrument's tune (a tune mostly climbs from it, so it sits a third under the middle), moving with the key
   (a key change never drops it an octave) */
function bandTonic(song, key, inst){ const c = (BAND_REG[inst] || 70) - 4, pc = ((song.key % 12) + 12) % 12; let t = c - ((((c - pc) % 12) + 12) % 12); if (c - t > 6) t += 12; return t + (key - song.key); }
const BAND_LEGATO = { flute: 1, panflute: 1, whistle: 1, violin: 1, strings: 1, brass: 1, horn: 1, sax: 1, reed: 1, theremin: 1, choir: 1, glass: 1, dist: 1, saw: 1, square: 1, organ: 1 };

/* ---------------------------------------------------------------- reading the songbook */
const BAND_ROMAN = { I: 0, II: 2, III: 4, IV: 5, V: 7, VI: 9, VII: 11 };
function bandParseChord(tok){
  const m = /^([b#]?)(VII|VI|V|IV|III|II|I|vii|vi|v|iv|iii|ii|i)(.*)$/.exec(tok);
  if (!m) return { r: 0, t: [0, 4, 7] };
  const r = BAND_ROMAN[m[2].toUpperCase()] + (m[1] === 'b' ? -1 : m[1] === '#' ? 1 : 0), minor = m[2] !== m[2].toUpperCase(), suf = m[3];
  let t = minor ? [0, 3, 7] : [0, 4, 7];
  if (/dim|°/.test(suf)) t = [0, 3, 6];
  else if (/\+/.test(suf)) t = [0, 4, 8];
  if (/sus4/.test(suf)) t = [0, 5, 7]; else if (/sus2/.test(suf)) t = [0, 2, 7];
  if (/maj7/.test(suf)) t.push(11); else if (/7/.test(suf)) t.push(10);
  if (/6/.test(suf)) t.push(9);
  if (/9/.test(suf)){ if (t.length < 4) t.push(10); t.push(14); }
  return { r: r, t: t };
}
/* a progression: one token per bar, 'IV:V' for two chords in one bar; or the old themes' list of semitones */
function bandParseProg(p, minor){
  if (Array.isArray(p)) return p.map(function(n){ return [{ r: n, t: minor ? [0, 3, 7] : [0, 4, 7] }]; });
  return p.trim().split(/\s+/).map(function(bar){ return bar.split(':').map(bandParseChord); });
}
/* a written tune: two bars on a grid of sixteenths, each slot empty or { d: scale step from the home note, a: sharp/flat, len } */
function bandParseMel(str){
  const out = new Array(32).fill(null), toks = str.replace(/\|/g, ' ').trim().split(/\s+/);
  let pos = 0, last = null;
  for (let i = 0; i < toks.length && pos < 32; i++){
    const parts = toks[i].split(','), sub = 2 / parts.length;
    for (let k = 0; k < parts.length && pos < 32; k++){
      const p = parts[k];
      if (p === '.'){ last = null; }
      else if (p === '-'){ if (last) last.len += sub; }
      else {
        const m = /^([<>]*)(\d)([#b]?)$/.exec(p);
        if (m){
          const oct = (m[1].match(/>/g) || []).length - (m[1].match(/</g) || []).length;
          last = { d: +m[2] - 1 + 7 * oct, a: m[3] === '#' ? 1 : m[3] === 'b' ? -1 : 0, len: sub };
          out[pos] = last;
        }
      }
      pos += sub;
    }
  }
  return out;
}
/* a composed tune: rhythm cells for one bar, the next bar starting the same way and ending on a held note; the pitch walks mostly
   by step with the odd leap, turning back at the edges, and comes to rest on the home chord */
const BAND_CELLS = [[[0, 4]], [[0, 2], [2, 2]], [[0, 3], [3, 1]], [[0, 2]], [[2, 2]], [[0, 1], [1, 1], [2, 2]], [[0, 2], [2, 1], [3, 1]], [[0, 1], [1, 1], [2, 1], [3, 1]], [[1, 3]], [[0, 2], [3, 1]]];
const BAND_CELL_W = [[4, 3, 2, 3, 2, 1, 1, 0, 1, 1], [1, 4, 3, 1, 1, 3, 3, 2, 1, 2]];
function bandGenMotif(rnd, o){
  const pick = function(){
    let tot = 0; const w = BAND_CELL_W[0].map(function(a, i){ const v = a + (BAND_CELL_W[1][i] - a) * o.dens; tot += v; return v; });
    let r = rnd() * tot; for (let i = 0; i < w.length; i++){ r -= w[i]; if (r <= 0) return BAND_CELLS[i]; } return BAND_CELLS[0];
  };
  const b1 = [pick(), pick(), pick(), pick()], b2 = [b1[0], b1[1], pick(), rnd() < 0.6 ? [[0, 4]] : []];
  if (!b2[3].length && !b2[2].some(function(c){ return c[0] + c[1] >= 3; })) b2[2] = [[0, 4]];
  const ons = [];
  [b1, b2].forEach(function(bar, bi){ bar.forEach(function(cell, bt){ cell.forEach(function(c){ ons.push({ pos: bi * 16 + bt * 4 + c[0], len: c[1] }); }); }); });
  const avoid = o.avoid || [], firstHalf = ons.filter(function(n){ return n.pos < 8; }).length;
  let d = [0, 2, 4][Math.floor(rnd() * 3)] + (o.hi || 0), dir = 1;
  const out = new Array(32).fill(null);
  const k2 = ons.findIndex(function(n){ return n.pos >= 16; });
  for (let k = 0; k < ons.length; k++){
    if (k2 > 0 && k >= k2 && k - k2 < firstHalf) d = out[ons[k - k2].pos].d;          /* the second bar begins like the first */
    else if (k > 0){
      const r = rnd(), st = r < 0.12 ? 0 : r < 0.72 ? 1 : r < 0.9 ? 2 : 3 + Math.floor(rnd() * 2);
      if (rnd() < 0.3) dir = -dir;
      if (d > 7) dir = -1; if (d < 0) dir = 1;
      d += st * dir;
    }
    let guard = 0; while (avoid.indexOf(((d % 7) + 7) % 7) >= 0 && guard++ < 3) d += dir || 1;
    out[ons[k].pos] = { d: d, a: 0, len: ons[k].len };
  }
  /* the last note lands on the home chord, and a held instrument holds each note until the next */
  const last = ons[ons.length - 1]; if (last){ const s = out[last.pos], cand = [0, 2, 4, 7]; let best = cand[0]; for (const c of cand) if (Math.abs(c - s.d) < Math.abs(best - s.d)) best = c; s.d = best; }
  if (o.legato) for (let k = 0; k < ons.length - 1; k++){ const s = out[ons[k].pos], gap = ons[k + 1].pos - ons[k].pos; if (gap <= 6) s.len = gap; }
  return out;
}
/* an old theme from MUSIC_THEMES (one added later by another file) still gets a band */
function bandFromTheme(name, th){
  const g = { tribal: 'tribal', soft: 'ambient', beat: 'rock', heavy: 'metal' }[th.drum] || 'rock';
  const mode = th.scale === 'pent' ? 'major' : th.scale === 'mpent' ? 'minor' : th.scale;
  return { name: name, bpm: th.bpm, key: th.root, mode: mode, groove: g, boss: !!th.boss, avoid: th.scale === 'pent' ? [3, 6] : th.scale === 'mpent' ? [1, 5] : null,
    bass: [th.bass === 'sine' ? 'sub' : th.bass === 'triangle' ? 'pbass' : 'synbass', g === 'metal' ? 'gallop' : 'pulse'],
    comp: g === 'metal' ? ['power', 'power8'] : ['epiano', 'block'], pad: 'pad', arp: ['pluckSyn', 'up8'],
    lead: th.lead === 'square' ? 'square' : 'flute', counter: 'vibes', prog: { verse: th.prog, chorus: th.prog.slice(2).concat(th.prog.slice(0, 2)) } };
}
const BAND_CACHE = {};
function bandSong(theme){
  if (BAND_CACHE[theme]) return BAND_CACHE[theme];
  const src = BAND_SONGS[theme] || bandFromTheme(theme, MUSIC_THEMES[theme] || MUSIC_THEMES.menu);
  const sc = MUSIC_SCALES[src.mode] || MUSIC_SCALES.minor, minor = sc[2] === 3;
  const S = Object.assign({ swing: 0, room: 1 }, src);
  S.theme = theme; S.scale = sc; S.minor = minor; S.G = BAND_GROOVES[src.groove] || BAND_GROOVES.rock;
  const dv = src.boss ? { verse: sc[1] === 1 ? 'i i bII i' : 'i i i i', chorus: 'bVI bVII i i', bridge: 'iv iv bVI V' }
    : minor ? { verse: 'i bVI bIII bVII', chorus: 'bVI bVII i i', bridge: 'iv iv bVI bVII' } : { verse: 'I V vi IV', chorus: 'IV V I vi', bridge: 'ii ii IV V' };
  const pr = Object.assign({}, dv, src.prog || {});
  S.progs = {};
  for (const k of ['intro', 'verse', 'verse2', 'chorus', 'bridge', 'break', 'final'])
    S.progs[k] = bandParseProg(pr[k] || (k === 'final' ? pr.chorus : k === 'bridge' ? pr.bridge : pr.verse), minor);
  const rnd = bandRng(bandSeed(theme + ':' + (src.name || theme)));
  S.hook = src.hook ? bandParseMel(src.hook) : bandGenMotif(rnd, { dens: src.boss ? 0.75 : 0.55, avoid: src.avoid, legato: BAND_LEGATO[src.lead] });
  S.verseM = bandGenMotif(rnd, { dens: 0.35, avoid: src.avoid, legato: BAND_LEGATO[src.verse || src.counter] });
  S.bridgeM = bandGenMotif(rnd, { dens: 0.6, avoid: src.avoid, hi: 2, legato: BAND_LEGATO[src.lead] });
  S.riffM = src.riff ? bandParseMel(src.riff) : null;
  S.seq = [1, 2, -1, 3][Math.floor(rnd() * 4)];
  S.form = src.form || (src.boss ? BAND_FORM_BOSS : src.calm ? BAND_FORM_CALM : BAND_FORM);
  S.sections = src.boss ? BAND_BOSS_SECTIONS : BAND_SECTIONS;
  S.bLo = src.bassLo || 36;
  return (BAND_CACHE[theme] = S);
}
/* queue up the notes this song will draw, so they are ready before they are needed */
function bandQueueWarm(song, more){
  const Q = BandBank.queue; if (!more) Q.length = 0;
  const gv = song.G, kit = function(k){ return (gv.kit && gv.kit[k]) || BAND_KIT[k]; };
  for (let e = 0; e < 4; e++) for (const k in gv.e[e]) if (k !== 'i') Q.push('d:' + kit(k));
  if (gv.crash && gv.crash !== 'i') Q.push('d:' + kit(gv.crash));
  Q.push('d:crashRev');
  const range = function(inst, lo, hi){ if (inst && BAND_DRAWN[inst]) for (let m = lo; m <= hi; m++) Q.push('i:' + inst + '@' + m); };
  range(song.bass && song.bass[0], song.bLo - 2, song.bLo + 16);
  range(song.comp && song.comp[0], 50, 76);
  range(song.arp && song.arp[0], 62, 88);
  [song.lead, song.verse, song.counter].forEach(function(i){ if (!i) return; const t = bandTonic(song, song.key, i); range(i, t - 5, t + 16); });
}

/* ---------------------------------------------------------------- the song's state, bar by bar */
function bandState(){ return { theme: '', song: null, ev: null, gate: {}, mute: null, solo: null, cnt: {}, bars: 0, lvl: 0, secName: null, secBar: 0, secLen: 0, pending: null, formI: 0, chorusRun: 0 }; }
function bandDeg(song, d){ const sc = song.scale, k = ((d % 7) + 7) % 7; return 12 * Math.floor(d / 7) + sc[k]; }
/* nudge a note onto the chord if it rubs a semitone against it (a major seventh under the root of a major chord is left: it is sweet) */
function bandFit(m, pcs, ch){
  const pc = ((m % 12) + 12) % 12; if (pcs.indexOf(pc) >= 0) return m;
  if (pcs.indexOf((pc + 11) % 12) >= 0) return m - 1;
  if (pcs.indexOf((pc + 1) % 12) >= 0){ if (ch && ch.t[1] === 4 && (pc + 1) % 12 === pcs[0]) return m; return m + 1; }
  return m;
}
function bandPcs(key, ch){ return ch.t.map(function(t){ return ((key + ch.r + t) % 12 + 12) % 12; }); }
/* a chord voiced close, moving as little as it can from the last one */
function bandVoice(S, key, ch, lo){
  const n = ch.t.length, prev = S.prevV; let best = null, bc = 1e9;
  for (let inv = 0; inv < n; inv++){
    const v = []; let x = key + ch.r + ch.t[inv]; while (x < lo) x += 12; while (x >= lo + 12) x -= 12; v.push(x);
    for (let k = 1; k < n; k++){ let y = key + ch.r + ch.t[(inv + k) % n]; while (y <= v[k - 1]) y += 12; while (y - 12 > v[k - 1]) y -= 12; v.push(y); }
    let cost = 0;
    if (prev && prev.length){ for (let k = 0; k < Math.min(n, prev.length); k++) cost += Math.abs(v[k] - prev[k]); cost += Math.abs(n - prev.length) * 3; }
    else cost = Math.abs(v[0] - lo - 4);
    if (cost < bc){ bc = cost; best = v; }
  }
  S.prevV = best;
  return best;
}
function bandBassRoot(song, key, ch){ const b = song.bLo; return b + ((((key + ch.r - b) % 12) + 12) % 12); }
/* how a two-bar motif is played in each of the four phrases of an eight-bar section: as written, answered (moved up or down the
   scale), as written with ornaments, and brought home on the key note */
function bandPhrase(song, M, ph, half, vari){
  let bar = M.slice(half * 16, half * 16 + 16).map(function(s){ return s && { d: s.d, a: s.a, len: s.len }; });
  if (ph === 1){
    bar.forEach(function(s){ if (s){ s.d += song.seq; s.a = 0; } });
    if (half === 1){ for (let i = 15; i >= 0; i--) if (bar[i]){ bar[i].d = bar[i].d > 3 ? 4 : 1; break; } }
  } else if (ph === 2 && vari > 0){
    let n = 0;
    for (let i = 0; i < 16 && n < 2; i++){
      const s = bar[i]; if (!s || s.len < 4 || s.len % 2) continue;
      const h = s.len / 2; if (bar[i + h]) continue;
      s.len = h; bar[i + h] = { d: s.d + ((vari + i) % 2 ? 1 : -1), a: 0, len: h }; n++; i += h;
    }
  } else if (ph === 3 && half === 1){
    let j = -1; for (let i = 15; i >= 0; i--) if (bar[i]){ j = i; break; }
    if (j >= 0){ const p = bar[j]; p.d = p.d >= 4 ? 7 : 0; p.a = 0; p.len = 16 - j; }
  }
  return bar;
}

/* the start of a bar: which section, which chords, and every note of the bar, ready for bandStep */
function bandBar(R, S, cur, w, t){
  const theme = cur.theme;
  if (S.theme !== theme){
    const prevBoss = S.song && S.song.boss, wasRun = S.wasRun;
    S.theme = theme; S.song = bandSong(theme); S.cnt = {}; S.prevV = null; S.lastC = 0; S.secName = null; S.pending = null; S.chorusRun = 0;
    S.start = S.song.boss ? 'intro' : (w.run && wasRun) ? (prevBoss ? 'break' : 'verse') : 'intro';
    S.formI = Math.max(0, S.song.form.indexOf(S.start));
    S.cut = !!(S.song.boss && w.run && wasRun);
    bandMix(R, S.song, t);
    if (!R.offline) bandQueueWarm(S.song);
  }
  S.wasRun = !!w.run; S.lvl = cur.lvl | 0;
  const song = S.song;
  let newSec = false;
  if (!S.secName){ S.secName = S.start; newSec = true; }
  else if (S.pending){ S.secName = S.pending; S.pending = null; newSec = true; }
  else if (++S.secBar >= S.secLen){ S.secName = bandNext(S, w); newSec = true; }
  const sec = song.sections[S.secName] || song.sections.verse;
  if (newSec){
    S.secBar = 0; S.secLen = sec.bars; S.cnt[S.secName] = (S.cnt[S.secName] || 0) + 1;
    S.chorusRun = (S.secName === 'chorus' || S.secName === 'final') ? S.chorusRun + 1 : 0;
  }
  S.bars++;
  /* what comes next is decided a bar early, so this bar can lead into it */
  let trans = null;
  if (S.secBar === S.secLen - 1){ S.pending = bandNext(S, w); trans = S.pending; }
  else if (S.secBar % 4 === 3){ const j = bandJump(S, w); if (j){ S.pending = j; trans = j; } }
  S.key = song.key + (cur.shift | 0) + (sec.up ? 1 : 0);
  bandEchoTime(R, song.bpm * (cur.tempo || 1), t);
  bandEvents(S, song, sec, cur, w, trans, newSec);
}
/* the next section at the end of one */
function bandNext(S, w){
  const song = S.song, cur = S.secName, c = S.cnt;
  if (S.lvl >= 3 || (S.lvl >= 2 && !song.boss)) return 'final';
  if (w.run && !song.boss){
    const I = w.I || 0;
    if (w.rest) return 'break';
    if (I >= 0.62){
      if ((cur === 'chorus' || cur === 'final') && S.chorusRun >= 2) return 'bridge';
      return I >= 0.86 && w.dense ? 'final' : 'chorus';
    }
    if (I >= 0.3){ if (cur === 'verse') return ((c.verse || 0) + (c.verse2 || 0)) % 3 === 2 ? 'bridge' : 'verse2'; return 'verse'; }
    return 'break';
  }
  S.formI++; if (S.formI >= song.form.length) S.formI = song.loopTo || 1;
  return song.form[S.formI];
}
/* a change of plan at the end of a four-bar phrase: the fight jumped, a wave ended, or a boss is half dead */
function bandJump(S, w){
  const song = S.song, cur = S.secName;
  if ((S.lvl >= 3 || (S.lvl >= 2 && !song.boss)) && cur !== 'final') return 'final';
  if (!w.run || song.boss) return null;
  const I = w.I || 0;
  if (w.rest) return cur !== 'break' && cur !== 'intro' ? 'break' : null;
  if ((cur === 'break' || cur === 'intro') && I >= 0.3) return I >= 0.62 ? 'chorus' : 'verse';
  if ((cur === 'verse' || cur === 'verse2' || cur === 'bridge') && I >= 0.72) return 'chorus';
  return null;
}
/* every note of one bar */
function bandEvents(S, song, sec, cur, w, trans, newSec){
  const ev = S.ev = []; for (let i = 0; i < 16; i++) ev.push([]);
  const add = function(e){ if (e.st >= 0 && e.st < 16) ev[e.st].push(e); };
  const rnd = bandRng(bandSeed(song.theme) + S.bars * 7919);
  const hum = function(v){ return v * (0.9 + 0.16 * rnd()); };
  const jit = function(){ return (rnd() - 0.5) * 0.01; };
  const key = S.key, has = function(p){ return sec.set.has(p); };
  const prog = song.progs[S.secName] || song.progs.verse, pbar = prog[S.secBar % prog.length];
  const chAt = function(st){ return pbar.length > 1 && st >= 8 ? pbar[1] : pbar[0]; };
  const nprog = S.secBar + 1 < S.secLen ? prog : (song.progs[trans || S.pending || S.secName] || prog);
  const nch = (S.secBar + 1 < S.secLen ? nprog[(S.secBar + 1) % nprog.length] : nprog[0])[0];
  const calm = song.calm || cur.lvl === 0;
  const vari = (S.cnt[S.secName] || 1) - 1;
  let e = sec.e;
  if (w.run && !song.boss){ if ((S.secName === 'verse' || S.secName === 'verse2') && (w.I || 0) > 0.55) e = 2; if (S.secName === 'chorus' && (w.I || 0) > 0.88) e = 3; }
  if (calm) e = Math.min(e, 1);
  const riser = !calm && !!trans && (trans === 'chorus' || trans === 'final') && trans !== S.secName && S.secName !== 'final';     /* a lead-in to a big section */
  const fill = !!trans && e >= 1;

  /* the chords: one voicing per chord, moving smoothly from the last */
  const halves = pbar.length > 1 ? [0, 8] : [0];
  const V = halves.map(function(h){ return bandVoice(S, key, chAt(h), song.compLo || 52); });
  const vAt = function(st){ return V[pbar.length > 1 && st >= 8 ? 1 : 0]; };

  /* pad: the held chord */
  if (song.pad && has('pad')) halves.forEach(function(h, k){
    const v = V[k].map(function(m){ return song.pad === 'glass' ? m + 12 : m; });
    add({ st: h, p: 'pad', ins: song.pad, m: v, len: pbar.length > 1 ? 8 : 16, v: calm ? 0.9 : 0.75 });
  });

  /* comp: the chord pattern, on guitar, piano, kalimba, power chords... */
  if (song.comp && has('comp')){
    const inst = song.comp[0], pats = BAND_COMP[song.comp[1]] || BAND_COMP.block, pat = pats[(S.secBar + vari) % pats.length];
    const short = /stab|skank|ska|pulse16/.test(song.comp[1]), power = inst === 'power';
    for (let i = 0; i < 16; i++){
      const c = pat[i]; if (c === '.' || c === '-') continue;
      let j = i + 1; while (j < 16 && pat[j] === '-') j++;
      let nx = i + 1; while (nx < 16 && pat[nx] === '.') nx++;
      const ring = Math.min(8, (pat[i + 1] === '-' ? j : nx) - i), v = vAt(i), ch = chAt(i), br = bandBassRoot(song, key, ch);
      const len = short ? 1 : Math.max(1, ring);
      if (power){ const pal = c === 'p' || c === 'm'; add({ st: i, p: 'comp', ins: inst, m: br + 12, len: pal ? 1 : len, v: hum(pal ? 0.7 : 1), o: { bright: pal ? 0.4 : 1 } }); continue; }
      if (c === 'D' || c === 'X' || c === 'x'){
        const notes = c === 'D' ? [br + 12].concat(v) : v;
        add({ st: i, p: 'comp', ins: inst, m: notes, len: len, v: hum(c === 'x' ? 0.72 : 0.95), o: c === 'D' ? { strum: 0.011 } : null, j: jit() });
      } else if (c === 'u'){
        add({ st: i, p: 'comp', ins: inst, m: v.slice(-3), len: len, v: hum(0.55), o: { strum: -0.008 }, j: jit() });
      } else if (c === 'm'){
        add({ st: i, p: 'comp', ins: inst, m: v, len: 0.4, v: hum(0.3), o: { damp: 0.01 } });
      } else if (c === 'P'){ add({ st: i, p: 'comp', ins: inst, m: v, len: len, v: hum(1) }); }
      else {
        const lc = c.toLowerCase(), idx = 'abcde'.indexOf(lc); if (idx < 0) continue;
        const m = idx === 4 ? v[0] + 12 : idx < v.length ? v[idx] : v[idx % v.length] + 12;
        add({ st: i, p: 'comp', ins: inst, m: m, len: Math.max(2, ring), v: hum(c === lc ? 0.8 : 1), j: jit() });
      }
    }
  }

  /* bass */
  const riffing = sec.mel === 'riff' && song.riffM;
  if (song.bass && has('bass')){
    const inst = song.bass[0], st = song.bass[1];
    if (riffing){
      const bar = song.riffM.slice((S.secBar % 2) * 16, (S.secBar % 2) * 16 + 16);
      for (let i = 0; i < 16; i++){ const s = bar[i]; if (!s) continue; let m = key + bandDeg(song, s.d) + s.a; while (m > song.bLo + 16) m -= 12; while (m < song.bLo - 2) m += 12; add({ st: i, p: 'bass', ins: inst, m: m, len: s.len, v: hum(0.95) }); }
    } else if (st === 'walk'){
      for (let b = 0; b < 4; b++){
        const ch = chAt(b * 4), r = bandBassRoot(song, key, ch); let m;
        if (b === 0) m = r; else if (b === 1) m = r + ch.t[(S.secBar % 2) ? 2 : 1]; else if (b === 2) m = r + (ch.t[2] === 7 ? 7 : ch.t[2]) + ((S.secBar + vari) % 2 ? 2 : 0);
        else { const nr = bandBassRoot(song, key, nch); m = nr === r ? r - 2 : (S.secBar % 2 ? nr - 1 : nr + 1); }
        while (m > song.bLo + 17) m -= 12; while (m < song.bLo - 3) m += 12;
        add({ st: b * 4, p: 'bass', ins: inst, m: m, len: 3.6, v: hum(b === 0 ? 1 : 0.85) });
      }
    } else {
      const pats = BAND_BASS[st] || BAND_BASS.pulse, pat = pats[S.secBar % pats.length];
      for (let i = 0; i < 16; i++){
        const c = pat[i]; if (c === '.' || c === '-') continue;
        if (riser && i >= 12) break;                                           /* the bass drops out for the last beat before a big section */
        let j = i + 1; while (j < 16 && pat[j] === '-') j++;
        const ch = chAt(i), r = bandBassRoot(song, key, ch), lc = c.toLowerCase(), ghost = c !== c.toUpperCase();
        let m = r;
        if (lc === 'o') m = r + 12; else if (c === '5') m = r + 7; else if (c === '3') m = r + ch.t[1]; else if (c === '7') m = r + (ch.t[3] || 10);
        else if (c === '6') m = r + 9; else if (c === '2') m = r + 2;
        else if (c === 'A'){ const nr = bandBassRoot(song, key, nch); m = nr === r ? r + 7 : nr - 1; if (m > song.bLo + 14) m -= 12; }
        add({ st: i, p: 'bass', ins: inst, m: m, len: ghost ? 1 : Math.max(1, (j - i) * 0.95), v: hum(ghost ? 0.55 : i % 4 === 0 ? 1 : 0.85) });
      }
    }
  }

  /* arpeggio, an octave over the chord */
  if (song.arp && has('arp')){
    const inst = song.arp[0], pat = BAND_ARP[song.arp[1]] || BAND_ARP.up8;
    for (let i = 0; i < 16; i++){
      const v = vAt(i), top = v[v.length - 1] < 72 ? 12 : 0;
      let m;
      if (pat === '*'){ if (rnd() < 0.35) continue; m = v[Math.floor(rnd() * v.length)] + top + (rnd() < 0.3 ? 12 : 0); }
      else { const c = pat[i]; if (c === '.') continue; const idx = 'abcdefg'.indexOf(c); if (idx < 0) continue; m = (idx < 4 ? (idx < v.length ? v[idx] : v[idx % v.length] + 12) : v[(idx - 4) % v.length] + 12) + top; }
      let nx = i + 1; while (nx < 16 && pat !== '*' && pat[nx] === '.') nx++;
      add({ st: i, p: 'arp', ins: inst, m: m, len: Math.min(4, nx - i), v: hum(i % 4 === 0 ? 0.75 : 0.58), j: jit() });
    }
  }

  /* the tune */
  const mel = sec.mel, ph = Math.floor(S.secBar / 2) % 4, half = S.secBar % 2;
  const melodyAt = function(M, inst, part, lift, vel, phr){
    const bar = phr || bandPhrase(song, M, ph, half, vari), base = bandTonic(song, key, inst) + (lift || 0);
    for (let i = 0; i < 16; i++){
      const s = bar[i]; if (!s) continue;
      let m = base + bandDeg(song, s.d) + s.a;
      if (i % 8 === 0 || s.len >= 4) m = bandFit(m, bandPcs(key, chAt(i)), chAt(i));          /* on the strong beats and the long notes */
      while (m > 93) m -= 12; while (m < 40) m += 12;                       /* a wandering tune folds back into a playable range */
      add({ st: i, p: part, ins: inst, m: m, len: s.len, v: hum(vel * (i % 8 === 0 ? 1 : 0.86)), j: jit() });
    }
    return bar;
  };
  let leadBar = null;
  if (mel === 'hook' && has('lead') && song.lead) leadBar = melodyAt(song.hook, song.lead, 'lead', S.secName === 'final' && vari % 2 ? 12 : 0, 0.95);
  else if (mel === 'bridge' && has('lead') && song.lead) leadBar = melodyAt(song.bridgeM, song.lead, 'lead', 0, 0.85);
  else if (mel === 'verse' && (song.verse || song.counter)) melodyAt(song.verseM, song.verse || song.counter, 'counter', 0, 0.82);
  else if (mel === 'riff' && song.riffM && has('lead')){ const b = song.riffM.slice(half * 16, half * 16 + 16); melodyAt(null, song.lead, 'lead', -12, 0.9, b); }
  else if ((mel === 'echo' && half === 1) || (mel === 'tease' && S.secBar === S.secLen - 1)){
    const b = new Array(16).fill(null); for (let i = 0; i < 8; i++) if (song.hook[i]) b[i + 8] = song.hook[i];
    melodyAt(null, song.verse || song.lead, 'counter', 0, 0.55, b);
  }
  /* the counter-line: in a chorus it holds the chord's guide tones (the third and the seventh, moving as little as they can); in the
     last chorus it sings the tune a third below */
  if (has('counter') && song.counter && (mel === 'hook' || mel === 'bridge')){
    if (S.secName === 'final' && leadBar){
      const b = leadBar.map(function(s){ return s && { d: s.d - 2, a: 0, len: s.len }; });
      melodyAt(null, song.counter, 'counter', 0, 0.6, b);
    } else {
      const lo = bandTonic(song, key, song.lead || song.counter) - 9;            /* under the tune */
      const ring = !!BAND_DRAWN[song.counter];                                 /* a struck instrument strikes its note every half bar */
      (ring ? [0, 8] : halves).forEach(function(h){
        const ch = chAt(h), tones = ch.t.length > 3 ? [ch.t[1], ch.t[3]] : [ch.t[1], ch.t[2]];
        let best = null, bd = 1e9; const prev = S.lastC || lo + 7;
        for (const tt of tones) for (let o = -12; o <= 24; o += 12){ const m = key + ch.r + tt + o; if (m < lo || m > lo + 14) continue; const d = Math.abs(m - prev); if (d < bd){ bd = d; best = m; } }
        if (best === null) return;
        S.lastC = best;
        add({ st: h, p: 'counter', ins: song.counter, m: best, len: ring || pbar.length > 1 ? 8 : 16, v: hum(ring ? 0.8 : 0.45) });
      });
    }
  }

  /* drums */
  const gv = song.G, kit = function(k){ return (gv.kit && gv.kit[k]) || BAND_KIT[k]; };
  const hit = function(k, i, v){
    const part = BAND_PERC_KEYS.indexOf(k) >= 0 ? 'perc' : 'drums';
    if (part === 'drums' && !has('drums')) return; if (part === 'perc' && !has('perc') && !has('drums')) return;
    if (k === 'i'){ const r = bandBassRoot(song, key, chAt(i)); add({ st: i, p: 'drums', ins: 'timp', m: r + 12 > 52 ? r : r + 12, len: 6, v: hum(v) }); return; }
    add({ st: i, p: part, dk: kit(k), v: hum(v) });
  };
  const vel = function(c){ return c === 'X' ? 1 : c === 'x' ? 0.72 : c === 'o' ? 0.42 : 0; };
  const pat = gv.e[Math.max(0, Math.min(3, e))];
  const lick = !trans && S.secBar % 4 === 3 && e >= 1 && rnd() < 0.8;
  for (const k in pat){
    const s = pat[k];
    for (let i = 0; i < 16; i++){
      const v = vel(s[i]); if (!v) continue;
      const isPerc = BAND_PERC_KEYS.indexOf(k) >= 0;
      if (!isPerc && ((fill && i >= 8) || (riser && i >= 8) || (lick && i >= 12 && k !== 'k' && k !== 'h'))) continue;
      hit(k, i, v * (calm ? 0.8 : 1));
    }
  }
  if (riser && gv.roll){
    for (let i = 8; i < 16; i++) hit(gv.roll, i, 0.3 + 0.7 * (i - 8) / 7);
    add({ st: 0, p: 'fx', fx: 'riser', v: 0.12 });
    add({ st: 0, p: 'fx', fx: 'rev', v: 0.6 });
  } else if (fill){
    for (const k in gv.fill){ const s = gv.fill[k]; for (let i = 0; i < 8; i++){ const v = vel(s[i]); if (v) hit(k, 8 + i, v); } }
  } else if (lick){
    for (const k in gv.lick){ const s = gv.lick[k]; for (let i = 0; i < 4; i++){ const v = vel(s[i]); if (v) hit(k, 12 + i, v); } }
  }
  /* the first beat of a new section: a crash (or a taiko); a boss's first bar: a boom */
  if (newSec && e >= 1 && gv.crash && S.bars > 1){ hit(gv.crash, 0, 0.85); if (pat.k) hit('k', 0, 1); }
  if (S.cut){ S.cut = false; add({ st: 0, p: 'drums', dk: 'boom', v: 1 }); add({ st: 0, p: 'drums', dk: 'crash', v: 0.9 }); }
  /* nearly dead: a heartbeat under everything */
  if ((w.low || 0) > 0.5 && w.run){ const v = 0.45 + 0.5 * w.low; add({ st: 0, p: 'perc', dk: 'heart', v: v }); add({ st: 8, p: 'perc', dk: 'heart', v: v }); }
}
/* play one sixteenth of the bar */
function bandStep(R, S, i, t, sd){
  const evs = S.ev && S.ev[i]; if (!evs || !S.song) return;
  const sw = (i % 4 === 2 ? S.song.swing * 0.667 : 0) * sd;
  for (let k = 0; k < evs.length; k++){
    const e = evs[k];
    if (S.mute && S.mute[e.p]) continue;
    if (S.solo && S.solo !== e.p) continue;
    if (S.gate[e.p] !== undefined && S.gate[e.p] < 0.03) continue;
    const tt = t + sw + (e.j || 0);
    if (e.dk) bandHit(R, e.p, e.dk, tt, e.v);
    else if (e.fx === 'riser') bandRiser(R, t, 16 * sd, e.v);
    else if (e.fx === 'rev') bandHit(R, 'fx', 'crashRev', t + 16 * sd - 1.18, e.v);
    else bandNote(R, e.p, e.ins, e.m, Math.max(t, tt), Math.max(0.05, e.len * sd * 0.95), e.v, e.o);
  }
}

/* ---------------------------------------------------------------- the music engine uses the band */
const bandBaseStart = Music.start;
Music.start = function(){
  const was = this.started;
  bandBaseStart.apply(this, arguments);
  if (!was && this.started && SFX.ctx){ this.R = bandRig(SFX.ctx, this.gain); this.S = bandState(); this.roomOn = true; }
};
/* the stems now feed the band: the drums follow how many enemies are out, the bass how close they are, and the whole fight sets
   the intensity that picks the next section; low health thins the chords and tunes. Outside a run everything is open. */
Music.updateStems = function(on){
  const st = this.stems; this.stemOn = on;
  if (st.I === undefined) st.I = 0.3;
  if (on){
    let near = 0, n = 0; const E = G.enemies;
    for (let i = 0; i < E.length; i++){ const e = E[i]; if (e.dead) continue; n++; const d = Math.hypot(e.x - P.x, e.y - P.y); if (d < 300) near += d < 150 ? 1.6 : 1; }
    const now = performance.now() / 1000; this.killT = this.killT || []; while (this.killT.length && now - this.killT[0] > 6) this.killT.shift();
    if ((G.kills | 0) > (this.lastKills | 0)) for (let k = 0; k < Math.min(5, G.kills - this.lastKills); k++) this.killT.push(now);
    this.lastKills = G.kills | 0;
    st.near += (clamp(near / 6, 0, 1) - st.near) * 0.08;
    st.spike += (clamp((n - 14) / 22 + this.killT.length / 28, 0, 1) - st.spike) * 0.05;
    const hpr = P.maxHp ? P.hp / P.maxHp : 1; st.low += (clamp((0.45 - hpr) / 0.25, 0, 1) - st.low) * 0.1;
    const cwv = typeof chapterWaveOf === 'function' ? chapterWaveOf(G.wave) : 1;
    let tI = G.waveState === 'active' ? clamp(0.2 + 0.5 * st.near + 0.65 * st.spike + 0.12 * Math.min(1, cwv / 25), 0, 1) : 0.1;
    st.I += (tI - st.I) * (tI > st.I ? 0.025 : 0.008);
  }
  const thin = 1 - 0.7 * (on ? st.low : 0);
  const f = { drums: on ? 0.6 + 0.4 * Math.max(st.spike, st.I) : 1, bass: on ? 0.65 + 0.35 * st.near : 1, perc: 1, comp: thin, pad: 1, arp: thin, lead: on ? 0.7 + 0.3 * thin : 1, counter: thin, fx: 1 };
  st.bass = f.bass; st.drums = f.drums; st.lead = f.lead;
  if (this.R && SFX.ctx){ const c = SFX.ctx.currentTime; for (const p in f) this.R.part[p].fd.gain.setTargetAtTime(f[p], c, on ? 0.5 : 0.25); }
  if (this.S) this.S.gate = f;
};
const bandBaseRefresh = Music.refresh;
Music.refresh = function(){
  bandBaseRefresh.apply(this, arguments);
  if (!SFX.ctx) return;
  const s = G.state, w = this.want;
  w.run = (s === 'playing' || s === 'paused' || s === 'levelup') && !G.attract;
  w.rest = w.run && G.waveState !== 'active';
  w.I = this.stems.I || 0; w.low = this.stems.low || 0;
  if (this.force) Object.assign(w, this.force);                                /* the music lab (tools/music-lab.html) holds a song */
  /* in a chapter, the notes of its boss's song are drawn ahead too, so the cut to it does not stall */
  const boss = w.run && !G.bossAlive ? 'boss' + (G.chapter | 0) : null;
  if (boss && boss !== this.warmBoss && BAND_SONGS[boss] && this.S && this.S.song && !this.S.song.boss){ this.warmBoss = boss; bandQueueWarm(bandSong(boss), true); }
  const R = this.R; if (!R) return;
  const fx = typeof fxLevelNow === 'function' ? fxLevelNow() : 2;
  R.cap = (fx <= 0 ? 26 : fx === 1 ? 42 : 64) * (typeof Input !== 'undefined' && Input.hasTouch ? 0.8 : 1);
  const room = fx > 0;                                                         /* effects at Low: the room is switched off and costs nothing */
  if (room !== this.roomOn){ this.roomOn = room; if (room) R.verbIn.connect(R.verb); else { try { R.verbIn.disconnect(); } catch (e) {} } }
};
Music.pump = function(){
  const c = SFX.ctx;
  if (!c || !this.gain || !this.R || c.state !== 'running') return;
  if (this.nextT < c.currentTime - 0.5) this.nextT = c.currentTime + 0.05;   /* fell behind (tab was asleep) */
  const t0 = performance.now(); while (BandBank.queue.length && performance.now() - t0 < 3) bandWarm(c, 1);
  let guard = 0;
  while (this.nextT < c.currentTime + 0.3 && guard++ < 64) this.bandTick(this.nextT);
};
/* one sixteenth: a new bar (and maybe a new song) on the first, then the notes of that step */
Music.bandTick = function(t){
  const S = this.S, w = this.want, c = SFX.ctx;
  let i = this.step % 16;
  if (i !== 0 && i % 4 === 0 && w.theme !== S.theme && w.run && bandSong(w.theme).boss){ this.step += 16 - i; i = 0; }   /* a boss: the band cuts to it on the next beat */
  if (i === 0 || !this.cur){
    const prev = this.cur;
    this.cur = { theme: w.theme, lvl: w.lvl, tempo: w.tempo, dense: w.dense, shift: w.shift | 0 };
    if (prev && prev.theme !== this.cur.theme && this.xf && !(w.run && bandSong(this.cur.theme).boss)){      /* a new song: dip, then swell back in */
      const g = this.xf.gain, tt = Math.max(c ? c.currentTime : 0, t);
      g.cancelScheduledValues(tt - 0.01); g.setValueAtTime(0.35, tt); g.linearRampToValueAtTime(1, tt + 2.2);
    }
    bandBar(this.R, S, this.cur, w, t);
  }
  const bpm = S.song.bpm * (this.cur.lvl === 3 ? 1.07 : 1) * (this.cur.tempo || 1), sd = 60 / bpm / 4;
  if (this.vol() > 0 && !SFX.muted && !Settings.muted) bandStep(this.R, S, this.step % 16, t, sd);
  this.nextT = t + sd;
  this.step++;
};

/* ---------------------------------------------------------------- drawing a song into a file (the music lab and the tests) */
const Band = {
  song: bandSong,
  /* jump the live band to a section at the next bar */
  jump(sec){ if (Music.S) Music.S.pending = sec; },
  /* render bars of music offline. opt: { bars, theme, lvl, I, rest, low, run, shift, mute, solo } or opt.at(bar) giving those per bar;
     returns a promise of an AudioBuffer (stereo, 44.1 kHz) */
  render(opt){
    const sr = opt.sr || 44100, plan = []; let t = 0.05;
    for (let b = 0; b < opt.bars; b++){
      const w = Object.assign({ lvl: 1, run: false, I: 0.5, tempo: 1, shift: 0 }, opt, opt.at ? opt.at(b) : {});
      const song = bandSong(w.theme), bpm = song.bpm * (w.lvl === 3 ? 1.07 : 1) * w.tempo;
      plan.push({ w: w, bpm: bpm, t: t }); t += 240 / bpm;
    }
    const oc = new OfflineAudioContext(2, Math.ceil((t + 3) * sr), sr);
    const out = oc.createGain(); out.gain.value = opt.gain || 0.6 * 0.55 * 0.3;          /* where the music sits in the game: volume 60%, the music bus, the master */
    const lim = oc.createDynamicsCompressor(); lim.threshold.value = -9; lim.knee.value = 8; lim.ratio.value = 14; lim.attack.value = 0.003; lim.release.value = 0.2;
    out.connect(lim); lim.connect(oc.destination);                              /* and the same limiter in front of the speakers (01-core.js) */
    const R = bandRig(oc, out), S = bandState(); S.mute = opt.mute || null; S.solo = opt.solo || null;
    plan.forEach(function(pl){
      const w = pl.w, sd = 60 / pl.bpm / 4;
      if (w.fd) for (const p in w.fd) R.part[p].fd.gain.setValueAtTime(w.fd[p], pl.t);
      bandBar(R, S, { theme: w.theme, lvl: w.lvl, tempo: w.tempo, shift: w.shift }, w, pl.t);
      if (w.jump) S.pending = w.jump;                                         /* go to a section from the next bar */
      if (opt.onBar) opt.onBar(S, pl);
      for (let i = 0; i < 16; i++) bandStep(R, S, i, pl.t + i * sd, sd);
    });
    return oc.startRendering();
  },
  /* an AudioBuffer as a 16-bit WAV file */
  wav(buf){
    const ch = buf.numberOfChannels, n = buf.length, ab = new ArrayBuffer(44 + n * ch * 2), dv = new DataView(ab);
    const str = function(o, s){ for (let i = 0; i < s.length; i++) dv.setUint8(o + i, s.charCodeAt(i)); };
    str(0, 'RIFF'); dv.setUint32(4, 36 + n * ch * 2, true); str(8, 'WAVEfmt '); dv.setUint32(16, 16, true); dv.setUint16(20, 1, true); dv.setUint16(22, ch, true);
    dv.setUint32(24, buf.sampleRate, true); dv.setUint32(28, buf.sampleRate * ch * 2, true); dv.setUint16(32, ch * 2, true); dv.setUint16(34, 16, true); str(36, 'data'); dv.setUint32(40, n * ch * 2, true);
    const data = []; for (let c = 0; c < ch; c++) data.push(buf.getChannelData(c));
    let o = 44; for (let i = 0; i < n; i++) for (let c = 0; c < ch; c++){ const v = Math.max(-1, Math.min(1, data[c][i])); dv.setInt16(o, v < 0 ? v * 0x8000 : v * 0x7fff, true); o += 2; }
    return ab;
  }
};
