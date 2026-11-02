'use strict';
/* The arranger: plays the songbook (02f-band-songs.js) on the band's instruments (02e-band-voices.js), and takes over the music's
   sequencer (Music.pump in 02-music.js); Music.refresh still decides WHICH song should be playing, and this file decides how.
   - A song is in sections: intro, verse, a pre-chorus that climbs over a held bass note, chorus, a second verse, a solo, a bridge in
     another key that drops to half time, a breakdown, a last chorus in a third key, and an outro. Outside a run (menus, town, films,
     the shop) the band plays the song's form round and round, about three minutes before it repeats, and every time round the tune,
     the chords and the drums vary a little.
   - In a run the fight picks the next section: quiet between waves (a breakdown), the verse while it is calm, the pre-chorus and the
     chorus as the screen fills up, a solo or the bridge so a long fight does not loop one chorus, the last chorus deep into a chapter.
     The decision is made a bar early, so the band can lead into it: a drum fill, a snare roll and a rising sweep into a chorus, a
     crash on the first beat of it, and the new key's dominant chord before a key change.
   - The parts join as a wave builds: the drums follow how many enemies are out, the bass how close they are; nearly dead, the chords
     and tunes thin out, the mix muffles (02-music.js) and a heartbeat comes in.
   - A boss cuts in on the next beat with a boom; its song has a riff the band locks to, and at half health the last section, faster.
   The melodies are written (the hook) or composed from the song's name (verse, bridge, solos, a boss's chorus): a two-bar motif,
   answered, repeated with ornaments, and brought home; later times round it is turned upside down, moved off the beat, slowed into the
   bridge or packed into the last chorus. A second voice answers the tune, sings under it in thirds, follows it in a canon or doubles it
   an octave up, and the hook moves from instrument to instrument each time the chorus comes back. On the strong beats each note is
   nudged onto the chord. Some songs or sections are in three, five or seven beats.
   The giraffe's tune (BAND_MOTTO), a short phrase on a soprano saxophone, turns up once in every song: in a breakdown, in a boss's
   bridge, or wherever the song says. */
MUSIC_SCALES.mixo = [0, 2, 4, 5, 7, 9, 10];

/* the sections: bars, drum energy (0-3), which parts play, what the tune does, and how the section moves: half (the drums drop to half
   time), poly (a hand drum plays threes against the band's fours), pedal (the bass holds one note under changing chords), canon */
const BAND_SECTIONS = {
  intro:  { bars: 4, e: 0, parts: 'pad arp perc bass solo', mel: 'tease' },
  verse:  { bars: 8, e: 1, parts: 'drums perc bass comp pad', mel: 'verse' },
  verse2: { bars: 8, e: 1, parts: 'drums perc bass comp pad arp lead2', mel: 'verse', canon: true },
  pre:    { bars: 4, e: 1, parts: 'drums perc bass comp pad arp', mel: 'pre', pedal: 7 },
  chorus: { bars: 8, e: 2, parts: 'drums perc bass comp pad arp lead counter lead2', mel: 'hook' },
  solo:   { bars: 8, e: 2, parts: 'drums perc bass comp pad solo', mel: 'solo', poly: true },
  bridge: { bars: 8, e: 1, parts: 'drums perc bass comp pad arp lead lead2 counter', mel: 'bridge', half: true, poly: true },
  break:  { bars: 4, e: 0, parts: 'perc bass pad arp solo', mel: 'echo' },
  final:  { bars: 8, e: 3, parts: 'drums perc bass comp pad arp lead counter lead2', mel: 'hook' },
  outro:  { bars: 4, e: 0, parts: 'pad bass comp arp lead', mel: 'outro' }
};
const BAND_BOSS_SECTIONS = {
  intro:  { bars: 2, e: 2, parts: 'drums bass comp', mel: 'riff' },
  verse:  { bars: 8, e: 2, parts: 'drums perc bass comp pad lead', mel: 'riff' },
  verse2: { bars: 8, e: 2, parts: 'drums perc bass comp pad arp lead', mel: 'riff', half: true },
  chorus: { bars: 8, e: 3, parts: 'drums perc bass comp pad arp lead counter lead2', mel: 'hook' },
  solo:   { bars: 8, e: 3, parts: 'drums perc bass comp pad solo', mel: 'solo', poly: true },
  bridge: { bars: 4, e: 1, parts: 'drums bass pad arp lead counter solo', mel: 'bridge', poly: true },
  break:  { bars: 4, e: 1, parts: 'drums bass pad comp', mel: 'riff' },
  final:  { bars: 8, e: 3, parts: 'drums perc bass comp pad arp lead counter lead2', mel: 'hook' }
};
(function(){ for (const T of [BAND_SECTIONS, BAND_BOSS_SECTIONS]) for (const k in T) T[k].set = new Set(T[k].parts.split(' ')); })();
const BAND_FORM = ['intro', 'verse', 'pre', 'chorus', 'verse2', 'pre', 'chorus', 'solo', 'bridge', 'break', 'final', 'outro'];
const BAND_FORM_CALM = ['intro', 'verse', 'chorus', 'verse2', 'break', 'chorus', 'solo', 'bridge', 'chorus', 'outro'];
const BAND_FORM_BOSS = ['intro', 'verse', 'chorus', 'verse2', 'bridge', 'chorus', 'solo', 'chorus'];
/* bars in three, seven and five: the notes are written on a bar of four beats (16 sixteenths) and each sixteenth of the shorter or
   longer bar takes one of them. The drums, bass and chords keep the downbeat and the backbeat (a waltz is "boom, chick, chick"); the
   tunes keep their first beat and their ending. -1 is a rest */
const BAND_METERS = (function(){
  const beats = function(list){ const o = []; list.forEach(function(b){ for (let k = 0; k < 4; k++) o.push(b < 0 ? -1 : b * 4 + k); }); return o; };
  const seven = [0, 1, 2, 3, 4, 5, 8, 9, 10, 11, 12, 13, 14, 15];             /* 7/8, counted 3 + 4 */
  return { 12: { rhy: beats([0, 1, 3]), mel: beats([0, 2, 3]) }, 14: { rhy: seven, mel: seven }, 20: { rhy: beats([0, 1, 2, 3, 3]), mel: beats([0, 1, 2, 3, -1]) } };
})();
const BAND_MEL_PARTS = { lead: 1, lead2: 1, counter: 1, solo: 1, arp: 1 };
/* where each instrument likes its tunes to sit: the middle of its tune, as a MIDI note (a flute or a glockenspiel high, a horn lower) */
const BAND_REG = { flute: 76, panflute: 76, whistle: 74, glock: 80, musicbox: 80, chip: 78, chip25: 70, glass: 74, xylo: 80, kalimba: 72, marimba: 67, vibes: 70,
  steel: 70, dist: 67, saw: 69, square: 70, theremin: 70, brass: 65, horn: 62, sax: 65, reed: 67, violin: 74, strings: 67, piano: 67, epiano: 67,
  choir: 65, bell: 72, harp: 67, egtr: 65, banjo: 67, uke: 67, nylon: 65, gtr: 65, organ: 65, pluckSyn: 70, supersaw: 67,
  soprano: 72, harmonica: 72, sitar: 65, dulcimer: 72, cello: 55, accordion: 67, brassSec: 65, ensemble: 67, ooh: 64 };
/* the home key note for an instrument's tune (a tune mostly climbs from it, so it sits a third under the middle), moving with the key
   (a key change never drops it an octave) */
function bandTonic(song, key, inst){ const c = (BAND_REG[inst] || 70) - 4, pc = ((song.key % 12) + 12) % 12; let t = c - ((((c - pc) % 12) + 12) % 12); if (c - t > 6) t += 12; return t + (key - song.key); }
const BAND_LEGATO = { flute: 1, panflute: 1, whistle: 1, violin: 1, strings: 1, brass: 1, horn: 1, sax: 1, reed: 1, theremin: 1, choir: 1, glass: 1, dist: 1, saw: 1, square: 1, organ: 1,
  soprano: 1, harmonica: 1, cello: 1, accordion: 1, ooh: 1, ensemble: 1, brassSec: 1 };

/* ---------------------------------------------------------------- reading the songbook */
const BAND_ROMAN = { I: 0, II: 2, III: 4, IV: 5, V: 7, VI: 9, VII: 11 };
/* one chord: a Roman numeral, then 7 / maj7 / 6 / 9 / sus4 / sus2 / dim / +, then /3 /5 /7 for that chord note in the bass */
function bandParseChord(tok){
  const m = /^([b#]?)(VII|VI|V|IV|III|II|I|vii|vi|v|iv|iii|ii|i)(.*)$/.exec(tok);
  if (!m) return { r: 0, t: [0, 4, 7] };
  const r = BAND_ROMAN[m[2].toUpperCase()] + (m[1] === 'b' ? -1 : m[1] === '#' ? 1 : 0), minor = m[2] !== m[2].toUpperCase();
  let suf = m[3], sl = null; const si = suf.indexOf('/'); if (si >= 0){ sl = suf.slice(si + 1); suf = suf.slice(0, si); }
  let t = minor ? [0, 3, 7] : [0, 4, 7];
  if (/dim|°/.test(suf)) t = [0, 3, 6];
  else if (/\+/.test(suf)) t = [0, 4, 8];
  if (/sus4/.test(suf)) t = [0, 5, 7]; else if (/sus2/.test(suf)) t = [0, 2, 7];
  if (/maj7/.test(suf)) t.push(11); else if (/dim7/.test(suf)) t.push(9); else if (/7/.test(suf)) t.push(10);
  if (/6/.test(suf)) t.push(9);
  if (/9/.test(suf)){ if (t.length < 4) t.push(10); t.push(14); }
  const ch = { r: r, t: t };
  if (sl) ch.b = sl === '3' ? t[1] : sl === '5' ? t[2] : sl === '7' ? (t[3] || 10) : 0;
  return ch;
}
/* a progression: one token per bar, 'IV:V' for two chords in one bar; or the old themes' list of semitones */
function bandParseProg(p, minor){
  if (Array.isArray(p)) return p.map(function(n){ return [{ r: n, t: minor ? [0, 3, 7] : [0, 4, 7] }]; });
  return p.trim().split(/\s+/).map(function(bar){ return bar.split(':').map(bandParseChord); });
}
/* the same progression played a second time, with more colour: a chord that leads into the next one (its own dominant seventh), a
   passing diminished chord between two a step apart, a suspended chord that resolves, the minor four borrowed into a major key, a
   bass line that steps down under a held chord, and (lvl 2) sevenths on the plain chords */
function bandReharm(bars, minor, rnd, lvl){
  const out = bars.map(function(b){ return b.map(function(c){ return { r: c.r, t: c.t.slice(), b: c.b }; }); });
  const tri = function(c){ return c.t.length === 3 && (c.t[1] === 3 || c.t[1] === 4) && c.t[2] === 7; };
  for (let i = 0; i < out.length; i++){
    const b = out[i]; if (b.length > 1) continue;
    const c = b[0], nx = out[(i + 1) % out.length][0], step = ((nx.r - c.r) % 12 + 12) % 12, r = rnd(), pc = ((c.r % 12) + 12) % 12;
    if (!minor && pc === 0 && tri(c) && c.t[1] === 4 && ((nx.r % 12) + 12) % 12 === 9 && r < 0.6) out[i] = [c, { r: c.r, t: c.t.slice(), b: 11 }];
    else if (step && nx.t[2] === 7 && r < 0.4){
      const dr = ((nx.r + 7) % 12 + 12) % 12;
      out[i] = dr === pc ? [{ r: c.r, t: [0, 4, 7, 10], b: c.b }] : [c, { r: dr, t: [0, 4, 7, 10] }];
    }
    else if (step === 2 && r < 0.62) out[i] = [c, { r: c.r + 1, t: [0, 3, 6, 9] }];
    else if (tri(c) && r < 0.8) out[i] = [{ r: c.r, t: [0, 5, 7], b: c.b }, c];
    else if (!minor && pc === 5 && tri(c) && c.t[1] === 4) out[i] = [c, { r: 5, t: [0, 3, 7] }];
  }
  if (lvl >= 2) out.forEach(function(b){ b.forEach(function(c){ if (tri(c) && !c.b) c.t.push(c.t[1] === 3 ? 10 : (((c.r % 12) + 12) % 12 === 7 ? 10 : 11)); }); });
  return out;
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
function bandPickCell(rnd, dens){
  let tot = 0; const w = BAND_CELL_W[0].map(function(a, i){ const v = a + (BAND_CELL_W[1][i] - a) * dens; tot += v; return v; });
  let r = rnd() * tot; for (let i = 0; i < w.length; i++){ r -= w[i]; if (r <= 0) return BAND_CELLS[i]; } return BAND_CELLS[0];
}
function bandGenMotif(rnd, o){
  const pick = function(){ return bandPickCell(rnd, o.dens); };
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
const BAND_SEC_NAMES = ['intro', 'verse', 'verse2', 'pre', 'chorus', 'solo', 'bridge', 'break', 'final', 'outro'];
function bandSong(theme){
  if (BAND_CACHE[theme]) return BAND_CACHE[theme];
  const src = BAND_SONGS[theme] || bandFromTheme(theme, MUSIC_THEMES[theme] || MUSIC_THEMES.menu);
  const sc = MUSIC_SCALES[src.mode] || MUSIC_SCALES.minor, minor = sc[2] === 3;
  const S = Object.assign({ swing: 0, room: 1 }, src);
  S.theme = theme; S.scale = sc; S.minor = minor; S.G = BAND_GROOVES[src.groove] || BAND_GROOVES.rock;
  const dv = src.boss ? { verse: sc[1] === 1 ? 'i i bII i' : 'i i i i', chorus: 'bVI bVII i i', bridge: 'iv iv bVI V' }
    : minor ? { verse: 'i bVI bIII bVII', chorus: 'bVI bVII i i', bridge: 'iv iv bVI bVII', pre: 'iv bVI bVIIsus4 bVII', outro: 'bVI bVI i i' }
    : { verse: 'I V vi IV', chorus: 'IV V I vi', bridge: 'ii ii IV V', pre: 'ii IV Vsus4 V', outro: 'IV IV I I' };
  const pr = Object.assign({}, dv, src.prog || {});
  S.progs = {}; S.progs2 = {};
  for (const k of BAND_SEC_NAMES)
    S.progs[k] = bandParseProg(pr[k] || (k === 'final' ? pr.chorus : k === 'bridge' ? pr.bridge : k === 'pre' ? (dv.pre || pr.verse) : k === 'outro' ? (dv.outro || pr.verse) : pr.verse), minor);
  const rnd = bandRng(bandSeed(theme + ':' + (src.name || theme)));
  /* the second time round: the same chords with more colour (none for the eight-bit songs) */
  const lvl = src.harm === undefined ? 1 : src.harm;
  if (lvl > 0) for (const k of ['verse', 'verse2', 'chorus']) S.progs2[k] = bandReharm(S.progs[k], minor, bandRng(bandSeed(theme + k)), lvl);
  if (lvl > 0) S.progs2.final = bandReharm(S.progs.final, minor, bandRng(bandSeed(theme + 'final')), lvl + 1);
  S.hook = src.hook ? bandParseMel(src.hook) : bandGenMotif(rnd, { dens: src.boss ? 0.75 : 0.55, avoid: src.avoid, legato: BAND_LEGATO[src.lead] });
  S.verseM = bandGenMotif(rnd, { dens: 0.35, avoid: src.avoid, legato: BAND_LEGATO[src.verse || src.counter] });
  S.bridgeM = bandGenMotif(rnd, { dens: 0.6, avoid: src.avoid, hi: 2, legato: BAND_LEGATO[src.lead] });
  S.riffM = src.riff ? bandParseMel(src.riff) : null;
  S.seq = [1, 2, -1, 3][Math.floor(rnd() * 4)];
  S.form = src.form || (src.boss ? BAND_FORM_BOSS : src.calm ? BAND_FORM_CALM : BAND_FORM);
  S.sections = src.boss ? BAND_BOSS_SECTIONS : BAND_SECTIONS;
  S.bLo = src.bassLo || 36;
  /* the keys it visits: the bridge moves somewhere new, the last chorus up one or two; a song can name its own (keys) */
  const pk = function(list){ return list[Math.floor(rnd() * list.length)]; };
  S.mods = Object.assign({ bridge: src.boss ? 0 : src.calm ? pk([0, 5, -3]) : minor ? pk([3, 5, -2]) : pk([5, -2, 3, 2]), final: src.boss ? 0 : pk([1, 2, 2]) }, src.keys || {});
  /* who plays what: the solo (and who trades with it), the second tune, and who takes the hook each time the chorus comes back */
  S.solo = src.solo || src.verse || src.lead;
  S.lead2 = src.lead2 || src.counter || src.lead;
  S.hookBy = (src.hookBy || [src.lead, src.verse || src.counter]).filter(function(v, i, a){ return v && a.indexOf(v) === i; });
  /* the giraffe's tune: on what, and in which section (the first one of these the form has) */
  S.mottoInst = src.motto || 'soprano';
  S.mottoIn = src.mottoIn || (src.boss ? ['bridge'] : ['break', 'bridge', 'intro']).find(function(k){ return S.form.indexOf(k) >= 0; }) || S.form[0];
  S.motto = { call: bandParseMel(BAND_MOTTO.call), answer: bandParseMel(BAND_MOTTO.answer) };
  S.meter = src.meter || 16; S.meters = src.meters || {};
  return (BAND_CACHE[theme] = S);
}
/* an instrument for this section: a song can swap any of its band for one section (secs: { chorus: { comp: [...] } }) */
function bandInst(song, sec, k){ const o = song.secs && song.secs[sec]; return o && o[k] !== undefined ? o[k] : song[k]; }
/* queue up the notes this song will draw, so they are ready before they are needed */
function bandQueueWarm(song, more){
  const Q = BandBank.queue; if (!more) Q.length = 0;
  const gv = song.G, kit = function(k){ return (gv.kit && gv.kit[k]) || BAND_KIT[k]; };
  for (let e = 0; e < 4; e++) for (const k in gv.e[e]) if (k !== 'i') Q.push('d:' + kit(k));
  if (gv.crash && gv.crash !== 'i') Q.push('d:' + kit(gv.crash));
  if (gv.poly) Q.push('d:' + kit(gv.poly));
  Q.push('d:crashRev');
  const range = function(inst, lo, hi){ if (inst && BAND_DRAWN[inst]) for (let m = lo; m <= hi; m++) Q.push('i:' + inst + '@' + m); };
  const bands = [song].concat(song.secs ? Object.keys(song.secs).map(function(k){ return song.secs[k]; }) : []);
  bands.forEach(function(b){
    range(b.bass && b.bass[0], song.bLo - 2, song.bLo + 16);
    range(b.comp && b.comp[0], 50, 76);
    range(b.arp && b.arp[0], 62, 88);
  });
  [song.lead, song.verse, song.counter, song.solo, song.trade, song.lead2].concat(song.hookBy).forEach(function(i){ if (!i) return; const t = bandTonic(song, song.key, i); range(i, t - 5, t + 16); });
}

/* ---------------------------------------------------------------- the song's state, bar by bar */
function bandState(){ return { theme: '', song: null, ev: null, gate: {}, mute: null, solo: null, cnt: {}, bars: 0, lvl: 0, secName: null, secBar: 0, secLen: 0, pending: null, formI: 0, chorusRun: 0, n: 16, map: null, carry: [], pp: 0 }; }
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
/* the bass note of a chord: its root, or the chord note a slash chord puts under it */
function bandBassRoot(song, key, ch){ const b = song.bLo; return b + ((((key + ch.r + (ch.b || 0) - b) % 12) + 12) % 12); }
/* how a two-bar motif is played in each of the four phrases of an eight-bar section: as written, answered (moved up or down the
   scale), as written with ornaments, and brought home on the key note. dev develops it further on later times round:
   'inv' the answer upside down, 'disp' the third phrase an eighth late, 'dim' the third phrase at double speed, 'hold' a long last note */
function bandPhrase(song, M, ph, half, vari, dev){
  let bar = M.slice(half * 16, half * 16 + 16).map(function(s){ return s && { d: s.d, a: s.a, len: s.len }; });
  if (ph === 1){
    if (dev === 'inv'){ const p0 = (M.find(Boolean) || { d: 0 }).d; bar.forEach(function(s){ if (s){ s.d = p0 - (s.d - p0) + 2; s.a = 0; } }); }
    else bar.forEach(function(s){ if (s){ s.d += song.seq; s.a = 0; } });
    if (half === 1){ for (let i = 15; i >= 0; i--) if (bar[i]){ bar[i].d = bar[i].d > 3 ? 4 : 1; break; } }
  } else if (ph === 2 && dev === 'disp'){
    const sh = new Array(16).fill(null); for (let i = 0; i < 14; i++) if (bar[i]){ sh[i + 2] = bar[i]; bar[i].len = Math.min(bar[i].len, 14 - i); } bar = sh;
  } else if (ph === 2 && dev === 'dim'){
    const dm = new Array(16).fill(null);
    for (let i = 0; i < 32; i++){ const s = M[i]; if (!s) continue; const p = Math.floor(i / 2); if (!dm[p]) dm[p] = { d: s.d + (half ? 2 : 0), a: s.a, len: Math.max(1, s.len / 2) }; }
    bar = dm;
  } else if (ph === 2 && vari > 0){
    let n = 0;
    for (let i = 0; i < 16 && n < 2; i++){
      const s = bar[i]; if (!s || s.len < 4 || s.len % 2) continue;
      const h = s.len / 2; if (bar[i + h]) continue;
      s.len = h; bar[i + h] = { d: s.d + ((vari + i) % 2 ? 1 : -1), a: 0, len: h }; n++; i += h;
    }
  } else if (ph === 3 && half === 1){
    let j = -1; for (let i = 15; i >= 0; i--) if (bar[i]){ j = i; break; }
    if (dev === 'hold'){ for (let i = 4; i < 16; i++) if (bar[i]){ j = i; break; } for (let i = j + 1; i < 16; i++) bar[i] = null; }
    if (j >= 0){ const p = bar[j]; p.d = dev === 'hold' ? 7 : p.d >= 4 ? 7 : 0; p.a = 0; p.len = 16 - j; }
  }
  return bar;
}
/* the hook slowed to half speed: one bar of it fills two (the bridge and the outro grow out of the chorus this way) */
function bandAug(M, half){ const out = new Array(16).fill(null); for (let i = 0; i < 8; i++){ const s = M[half * 8 + i]; if (s) out[i * 2] = { d: s.d, a: s.a, len: Math.min(16 - i * 2, s.len * 2) }; } return out; }
/* one bar of a solo, made up as it goes: sparse and low at first, busier and higher each bar, a breath at the end of every two bars,
   the hook quoted at the halfway point, a run of sixteenths near the end, and a long high note to finish */
function bandSoloBar(song, S, k, rnd){
  if (k === 4) return song.hook.slice(0, 16).map(function(s){ return s && { d: s.d + 2, a: 0, len: s.len }; });
  const out = new Array(16).fill(null), dens = Math.min(1, 0.2 + k * 0.13), lo = -1 + Math.floor(k / 3), hi = 5 + k;
  let d = S.soloD === undefined ? 2 : S.soloD, dir = S.soloDir || 1;
  const beats = k === 7 ? 2 : k % 2 ? 3 : 4;
  for (let b = 0; b < beats; b++){
    const run = k >= 5 && rnd() < 0.4, cell = run ? BAND_CELLS[7] : bandPickCell(rnd, dens);
    for (const c of cell){
      const r = rnd(), st = run ? 1 : r < 0.15 ? 0 : r < 0.75 ? 1 : r < 0.92 ? 2 : 3 + Math.floor(rnd() * 2);
      if (!run && rnd() < 0.3) dir = -dir; if (run) dir = k >= 6 ? 1 : dir;
      if (d >= hi) dir = -1; if (d <= lo) dir = 1;
      d += st * dir;
      out[b * 4 + c[0]] = { d: d, a: 0, len: c[1] };
    }
  }
  if (k === 7) out[8] = { d: 7, a: 0, len: 8 };
  S.soloD = d; S.soloDir = dir;
  return out;
}

/* the start of a bar: which section, which chords, and every note of the bar, ready for bandStep */
function bandBar(R, S, cur, w, t){
  const theme = cur.theme;
  if (S.theme !== theme){
    const prevBoss = S.song && S.song.boss, wasRun = S.wasRun;
    S.theme = theme; S.song = bandSong(theme); S.cnt = {}; S.prevV = null; S.lastC = 0; S.secName = null; S.pending = null; S.chorusRun = 0; S.carry = [];
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
    if (S.secName === 'solo') S.soloD = undefined;
  }
  S.bars++;
  /* what comes next is decided a bar early, so this bar can lead into it */
  let trans = null;
  if (S.secBar === S.secLen - 1){ S.pending = bandNext(S, w); trans = S.pending; }
  else if (S.secBar % 4 === 3){ const j = bandJump(S, w); if (j){ S.pending = j; trans = j; } }
  S.key = song.key + (cur.shift | 0) + (song.mods[S.secName] || 0);
  S.n = song.meters[S.secName] || song.meter || 16;
  S.map = S.n !== 16 && BAND_METERS[S.n] ? BAND_METERS[S.n] : null; if (!S.map) S.n = 16;
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
      if ((cur === 'chorus' || cur === 'final') && S.chorusRun >= 2) return ((c.bridge || 0) + (c.solo || 0)) % 2 ? 'solo' : 'bridge';
      if ((cur === 'verse' || cur === 'verse2') && I < 0.86) return 'pre';
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
  if ((cur === 'verse' || cur === 'verse2' || cur === 'pre') && I >= 0.72) return 'chorus';
  return null;
}
/* every note of one bar. The notes are written on a bar of sixteen sixteenths and, for a bar in three, five or seven, moved onto it
   at the end */
function bandEvents(S, song, sec, cur, w, trans, newSec){
  const ev = []; for (let i = 0; i < 16; i++) ev.push([]);
  const add = function(e){ if (e.st >= 16) S.carry.push(Object.assign({}, e, { st: e.st - 16 })); else if (e.st >= 0) ev[e.st].push(e); };
  const carried = S.carry; S.carry = []; carried.forEach(add);
  const rnd = bandRng(bandSeed(song.theme) + S.bars * 7919);
  const hum = function(v){ return v * (0.9 + 0.16 * rnd()); };
  const jit = function(){ return (rnd() - 0.5) * 0.01; };
  const key = S.key, has = function(p){ return sec.set.has(p); }, sn = S.secName;
  const inst = function(k){ return bandInst(song, sn, k); };
  const vari = (S.cnt[sn] || 1) - 1;
  const prog = ((vari % 2 === 1 || sn === 'final') && song.progs2[sn]) || song.progs[sn] || song.progs.verse;
  let pbar = prog[S.secBar % prog.length];
  /* the next bar's first chord, and its key: a key change is led into by the new key's dominant seventh on the last half bar */
  const last = S.secBar + 1 >= S.secLen, nsec = last ? (trans || S.pending || sn) : sn;
  const nprog = last ? (song.progs[nsec] || prog) : prog;
  let nch = (last ? nprog[0] : nprog[(S.secBar + 1) % nprog.length])[0];
  const nkey = last ? song.key + (cur.shift | 0) + (song.mods[nsec] || 0) : key;
  if (nkey !== key){
    const d = nkey - key; nch = { r: nch.r + d, t: nch.t, b: nch.b };
    pbar = [pbar[0], { r: (((nch.r + 7) % 12) + 12) % 12, t: [0, 4, 7, 10] }];
  }
  const chAt = function(st){ return pbar.length > 1 && st >= 8 ? pbar[1] : pbar[0]; };
  const calm = song.calm || cur.lvl === 0;
  let e = sec.e;
  if (w.run && !song.boss){ if ((sn === 'verse' || sn === 'verse2' || sn === 'pre') && (w.I || 0) > 0.55) e = 2; if (sn === 'chorus' && (w.I || 0) > 0.88) e = 3; }
  if (calm) e = Math.min(e, 1);
  const riser = !calm && !!trans && (trans === 'chorus' || trans === 'final') && trans !== sn && sn !== 'final';     /* a lead-in to a big section */
  const fill = !!trans && e >= 1;
  const halfTime = !!sec.half && !calm;

  /* the chords: one voicing per chord, moving smoothly from the last */
  const halves = pbar.length > 1 ? [0, 8] : [0];
  const V = halves.map(function(h){ return bandVoice(S, key, chAt(h), song.compLo || 52); });
  const vAt = function(st){ return V[pbar.length > 1 && st >= 8 ? 1 : 0]; };

  /* pad: the held chord; a drone (a didgeridoo, a sitar's drone) on the key note under it */
  const padI = inst('pad');
  if (padI && has('pad')) halves.forEach(function(h, k){
    const v = V[k].map(function(m){ return padI === 'glass' ? m + 12 : m; });
    add({ st: h, p: 'pad', ins: padI, m: v, len: pbar.length > 1 ? 8 : 16, v: calm ? 0.9 : 0.75 });
  });
  const drone = inst('drone');
  if (drone && has('pad') && S.secBar % 2 === 0){ let m = key; while (m > 45) m -= 12; while (m < 33) m += 12; add({ st: 0, p: 'pad', ins: drone, m: m, len: 32, v: 0.8 }); }

  /* comp: the chord pattern, on guitar, piano, kalimba, power chords, a brass section... */
  const compB = inst('comp');
  if (compB && has('comp')){
    const ci = compB[0], pats = BAND_COMP[compB[1]] || BAND_COMP.block, pat = pats[(S.secBar + vari) % pats.length];
    const short = /stab|skank|ska|pulse16/.test(compB[1]), power = ci === 'power';
    for (let i = 0; i < 16; i++){
      const c = pat[i]; if (c === '.' || c === '-') continue;
      let j = i + 1; while (j < 16 && pat[j] === '-') j++;
      let nx = i + 1; while (nx < 16 && pat[nx] === '.') nx++;
      const ring = Math.min(8, (pat[i + 1] === '-' ? j : nx) - i), v = vAt(i), ch = chAt(i), br = bandBassRoot(song, key, ch);
      const len = short ? 1 : Math.max(1, ring);
      if (power){ const pal = c === 'p' || c === 'm'; add({ st: i, p: 'comp', ins: ci, m: br + 12, len: pal ? 1 : len, v: hum(pal ? 0.7 : 1), o: { bright: pal ? 0.4 : 1 } }); continue; }
      if (c === 'D' || c === 'X' || c === 'x'){
        const notes = c === 'D' ? [br + 12].concat(v) : v;
        add({ st: i, p: 'comp', ins: ci, m: notes, len: len, v: hum(c === 'x' ? 0.72 : 0.95), o: c === 'D' ? { strum: 0.011 } : null, j: jit() });
      } else if (c === 'u'){
        add({ st: i, p: 'comp', ins: ci, m: v.slice(-3), len: len, v: hum(0.55), o: { strum: -0.008 }, j: jit() });
      } else if (c === 'm'){
        add({ st: i, p: 'comp', ins: ci, m: v, len: 0.4, v: hum(0.3), o: { damp: 0.01 } });
      } else if (c === 'P'){ add({ st: i, p: 'comp', ins: ci, m: v, len: len, v: hum(1) }); }
      else {
        const lc = c.toLowerCase(), idx = 'abcde'.indexOf(lc); if (idx < 0) continue;
        const m = idx === 4 ? v[0] + 12 : idx < v.length ? v[idx] : v[idx % v.length] + 12;
        add({ st: i, p: 'comp', ins: ci, m: m, len: Math.max(2, ring), v: hum(c === lc ? 0.8 : 1), j: jit() });
      }
    }
  }

  /* bass; over a pedal it holds one note (the dominant under a pre-chorus) while the chords move */
  const riffing = sec.mel === 'riff' && song.riffM;
  const bassB = inst('bass'), pedal = sec.pedal !== undefined && nkey === key ? { r: sec.pedal, t: [0, 4, 7] } : null;
  if (bassB && has('bass')){
    const bi = bassB[0], st = bassB[1];
    if (riffing){
      const bar = song.riffM.slice((S.secBar % 2) * 16, (S.secBar % 2) * 16 + 16);
      for (let i = 0; i < 16; i++){ const s = bar[i]; if (!s) continue; let m = key + bandDeg(song, s.d) + s.a; while (m > song.bLo + 16) m -= 12; while (m < song.bLo - 2) m += 12; add({ st: i, p: 'bass', ins: bi, m: m, len: s.len, v: hum(0.95) }); }
    } else if (st === 'walk' && !pedal){
      for (let b = 0; b < 4; b++){
        const ch = chAt(b * 4), r = bandBassRoot(song, key, ch); let m;
        if (b === 0) m = r; else if (b === 1) m = r + ch.t[(S.secBar % 2) ? 2 : 1]; else if (b === 2) m = r + (ch.t[2] === 7 ? 7 : ch.t[2]) + ((S.secBar + vari) % 2 ? 2 : 0);
        else { const nr = bandBassRoot(song, key, nch); m = nr === r ? r - 2 : (S.secBar % 2 ? nr - 1 : nr + 1); }
        while (m > song.bLo + 17) m -= 12; while (m < song.bLo - 3) m += 12;
        add({ st: b * 4, p: 'bass', ins: bi, m: m, len: 3.6, v: hum(b === 0 ? 1 : 0.85) });
      }
    } else {
      const pats = BAND_BASS[st] || BAND_BASS.pulse, pat = pats[S.secBar % pats.length];
      for (let i = 0; i < 16; i++){
        const c = pat[i]; if (c === '.' || c === '-') continue;
        if (riser && i >= 12) break;                                           /* the bass drops out for the last beat before a big section */
        let j = i + 1; while (j < 16 && pat[j] === '-') j++;
        const ch = pedal || chAt(i), r = bandBassRoot(song, key, ch), lc = c.toLowerCase(), ghost = c !== c.toUpperCase();
        let m = r;
        if (pedal) m = lc === 'o' ? r + 12 : r;
        else if (lc === 'o') m = r + 12; else if (c === '5') m = r + 7; else if (c === '3') m = r + ch.t[1]; else if (c === '7') m = r + (ch.t[3] || 10);
        else if (c === '6') m = r + 9; else if (c === '2') m = r + 2;
        else if (c === 'A'){ const nr = bandBassRoot(song, key, nch); m = nr === r ? r + 7 : nr - 1; if (m > song.bLo + 14) m -= 12; }
        add({ st: i, p: 'bass', ins: bi, m: m, len: ghost ? 1 : Math.max(1, (j - i) * 0.95), v: hum(ghost ? 0.55 : i % 4 === 0 ? 1 : 0.85) });
      }
    }
  }

  /* arpeggio, an octave over the chord */
  const arpB = inst('arp');
  if (arpB && has('arp')){
    const ai = arpB[0], pat = BAND_ARP[arpB[1]] || BAND_ARP.up8;
    for (let i = 0; i < 16; i++){
      const v = vAt(i), top = v[v.length - 1] < 72 ? 12 : 0;
      let m;
      if (pat === '*'){ if (rnd() < 0.35) continue; m = v[Math.floor(rnd() * v.length)] + top + (rnd() < 0.3 ? 12 : 0); }
      else { const c = pat[i]; if (c === '.') continue; const idx = 'abcdefg'.indexOf(c); if (idx < 0) continue; m = (idx < 4 ? (idx < v.length ? v[idx] : v[idx % v.length] + 12) : v[(idx - 4) % v.length] + 12) + top; }
      let nx = i + 1; while (nx < 16 && pat !== '*' && pat[nx] === '.') nx++;
      add({ st: i, p: 'arp', ins: ai, m: m, len: Math.min(4, nx - i), v: hum(i % 4 === 0 ? 0.75 : 0.58), j: jit() });
    }
  }

  /* the tunes */
  const mel = sec.mel, ph = Math.floor(S.secBar / 2) % 4, half = S.secBar % 2;
  /* a bar of tune on an instrument: base, its home note (an instrument's own, or another's so a harmony sits under the tune) */
  const melodyAt = function(M, ins, part, lift, vel, phr, o){
    o = o || {};
    const bar = phr || bandPhrase(song, M, ph, half, vari, o.dev), base = bandTonic(song, key, o.baseOf || ins) + (lift || 0), sh = o.shift || 0;
    for (let i = 0; i < 16; i++){
      const s = bar[i]; if (!s) continue;
      let m = base + bandDeg(song, s.d) + s.a;
      if (i % 8 === 0 || s.len >= 4) m = bandFit(m, bandPcs(key, chAt(i)), chAt(i));          /* on the strong beats and the long notes */
      while (m > 93) m -= 12; while (m < 40) m += 12;                       /* a wandering tune folds back into a playable range */
      add({ st: i + sh, p: part, ins: ins, m: m, len: s.len, v: hum(vel * (i % 8 === 0 ? 1 : 0.86)), j: jit() });
    }
    return bar;
  };
  const leadI = inst('lead'), counterI = inst('counter'), lead2I = inst('lead2'), verseI = inst('verse');
  /* the giraffe's tune: every other time its section comes round (the first, the third...), the soprano plays the call and its answer */
  const motto = sn === song.mottoIn && (S.cnt[sn] || 1) % 2 === 1 && S.secBar < 4;
  if (motto){
    const M = S.secBar < 2 ? song.motto.call : song.motto.answer;
    melodyAt(null, song.mottoInst, 'solo', 0, 0.95, M.slice(half * 16, half * 16 + 16).map(function(s){ return s && { d: s.d, a: s.a, len: s.len }; }));
  }
  let leadBar = null, hookI = leadI;
  if (mel === 'hook' && has('lead') && leadI){
    /* each time the chorus comes back the hook moves to another instrument; the last chorus is the lead's again, and later times
       round the tune is developed: turned upside down, moved off the beat, packed tight, a long note to end on */
    const fin = sn === 'final', by = fin ? leadI : (song.secs && song.secs[sn] && song.secs[sn].lead) || song.hookBy[vari % song.hookBy.length] || leadI;
    const dev = fin ? (ph === 2 ? 'dim' : 'hold') : vari >= 2 ? ['inv', 'disp'][vari % 2] : null;
    hookI = by; leadBar = melodyAt(song.hook, by, 'lead', fin && vari % 2 ? 12 : 0, 0.95, null, { dev: dev });
    if (fin && has('lead2')) melodyAt(null, by, 'lead2', 12, 0.5, leadBar);                     /* doubled an octave up */
  }
  else if (mel === 'bridge' && has('lead') && leadI && !motto){
    /* the bridge grows out of the hook, slowed to half speed, and answers it with its own line */
    leadBar = ph % 2 === 0 ? melodyAt(null, leadI, 'lead', 0, 0.85, bandAug(song.hook, half)) : melodyAt(song.bridgeM, leadI, 'lead', 0, 0.85);
  }
  else if (mel === 'verse' && (verseI || counterI)){
    const vb = melodyAt(song.verseM, verseI || counterI, 'counter', 0, 0.82, null, { dev: vari % 2 === 1 ? 'inv' : null });
    if (sec.canon && has('lead2') && lead2I && (calm || !w.run)) melodyAt(null, lead2I, 'lead2', 0, 0.5, vb, { shift: 4 });   /* a canon a beat behind */
  }
  else if (mel === 'pre' && (verseI || counterI)){
    /* the pre-chorus climbs: the verse's first bar, a step higher each bar */
    const b = bandPhrase(song, song.verseM, 0, 0, 0).map(function(s){ return s && { d: s.d + S.secBar, a: 0, len: s.len }; });
    melodyAt(null, verseI || counterI, 'counter', 0, 0.8 + 0.05 * S.secBar, b);
  }
  else if (mel === 'solo' && has('solo')){
    const who = song.trade && Math.floor(S.secBar / 2) % 2 ? song.trade : song.solo;              /* two players trade two-bar turns */
    melodyAt(null, who, 'solo', 0, 0.9, bandSoloBar(song, S, S.secBar, rnd));
  }
  else if (mel === 'riff' && song.riffM && has('lead')){ const b = song.riffM.slice(half * 16, half * 16 + 16); melodyAt(null, leadI, 'lead', -12, 0.9, b); }
  else if (mel === 'outro' && has('lead') && leadI){
    if (S.secBar < 2) melodyAt(null, leadI, 'lead', 0, 0.7, bandAug(song.hook, half));
    else if (S.secBar === 2) melodyAt(null, leadI, 'lead', 0, 0.6, [{ d: 0, a: 0, len: 16 }].concat(new Array(15).fill(null)));
  }
  else if (!motto && ((mel === 'echo' && half === 1) || (mel === 'tease' && S.secBar === S.secLen - 1))){
    const b = new Array(16).fill(null); for (let i = 0; i < 8; i++) if (song.hook[i]) b[i + 8] = song.hook[i];
    melodyAt(null, verseI || leadI, 'counter', 0, 0.55, b);
  }
  /* the second voice over a chorus or a bridge: the first time it answers the tune where the tune holds a note, the second time it
     sings under it in thirds */
  if (leadBar && has('lead2') && lead2I && sn !== 'final'){
    if (vari % 2 === 1 && mel === 'hook') melodyAt(null, lead2I, 'lead2', 0, 0.55, leadBar.map(function(s){ return s && { d: s.d - 2, a: 0, len: s.len }; }), { baseOf: hookI });
    else {
      let from = -1, to = 16;
      for (let i = 0; i < 16; i++){ const s = leadBar[i]; if (!s) continue; let nx = i + 1; while (nx < 16 && !leadBar[nx]) nx++; const free = s.len >= 4 ? i + 2 : i + s.len; if (nx - free >= 6){ from = free; to = nx; break; } }
      if (from >= 0){
        const head = song.hook.slice(0, 16).filter(Boolean).slice(0, 3), b = new Array(16).fill(null);
        head.forEach(function(s, k){ if (from + k * 2 < to) b[from + k * 2] = { d: s.d - 2, a: 0, len: 2 }; });
        melodyAt(null, lead2I, 'lead2', 0, 0.6, b);
      }
    }
  }
  /* the counter-line: in a chorus it holds the chord's guide tones (the third and the seventh, moving as little as they can); in the
     last chorus it sings the tune a third below */
  if (has('counter') && counterI && (mel === 'hook' || mel === 'bridge')){
    if (sn === 'final' && leadBar){
      const b = leadBar.map(function(s){ return s && { d: s.d - 2, a: 0, len: s.len }; });
      melodyAt(null, counterI, 'counter', 0, 0.6, b);
    } else {
      const lo = bandTonic(song, key, leadI || counterI) - 9;            /* under the tune */
      const ring = !!BAND_DRAWN[counterI];                                 /* a struck instrument strikes its note every half bar */
      (ring ? [0, 8] : halves).forEach(function(h){
        const ch = chAt(h), tones = ch.t.length > 3 ? [ch.t[1], ch.t[3]] : [ch.t[1], ch.t[2]];
        let best = null, bd = 1e9; const prev = S.lastC || lo + 7;
        for (const tt of tones) for (let o = -12; o <= 24; o += 12){ const m = key + ch.r + tt + o; if (m < lo || m > lo + 14) continue; const d = Math.abs(m - prev); if (d < bd){ bd = d; best = m; } }
        if (best === null) return;
        S.lastC = best;
        add({ st: h, p: 'counter', ins: counterI, m: best, len: ring || pbar.length > 1 ? 8 : 16, v: hum(ring ? 0.8 : 0.45) });
      });
    }
  }

  /* drums; at half time the kick and snare drop to half speed (the snare on the third beat) and the hand drums carry on */
  const gv = song.G, kit = function(k){ return (gv.kit && gv.kit[k]) || BAND_KIT[k]; };
  const hit = function(k, i, v, to){
    const part = BAND_PERC_KEYS.indexOf(k) >= 0 ? 'perc' : 'drums';
    if (part === 'drums' && !has('drums')) return; if (part === 'perc' && !has('perc') && !has('drums')) return;
    const e2 = k === 'i' ? { st: i, p: 'drums', ins: 'timp', m: (function(){ const r = bandBassRoot(song, key, chAt(i)); return r + 12 > 52 ? r : r + 12; })(), len: 6, v: hum(v) } : { st: i, p: part, dk: kit(k), v: hum(v) };
    if (to) to[i].push(e2); else add(e2);
  };
  const vel = function(c){ return c === 'X' ? 1 : c === 'x' ? 0.72 : c === 'o' ? 0.42 : 0; };
  const ei = Math.max(0, Math.min(3, e));
  let pat = gv.e[ei];
  if (halfTime){ const H = BAND_GROOVES.halftime.e[ei], P = {}; for (const k in pat) if (BAND_PERC_KEYS.indexOf(k) >= 0 || k === 'T' || k === 'i') P[k] = pat[k]; for (const k in H) P[k] = H[k]; pat = P; }
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

  /* the bar in its meter: a bar in three, five or seven takes its sixteenths from the bar of sixteen */
  const N = S.n, M = S.map; let out = ev;
  if (M){
    out = [];
    for (let j = 0; j < N; j++){
      const L = []; out.push(L);
      const sr = M.rhy[j], sm = M.mel[j];
      if (sr >= 0) ev[sr].forEach(function(x){ if (!BAND_MEL_PARTS[x.p]) L.push(x.p === 'pad' || x.len > N - j ? Object.assign({}, x, { len: x.p === 'pad' ? x.len * N / 16 : Math.max(1, Math.min(x.len, N - j + 2)) }) : x); });
      if (sm >= 0) ev[sm].forEach(function(x){ if (BAND_MEL_PARTS[x.p]) L.push(x.len > N - j + 2 ? Object.assign({}, x, { len: Math.max(1, N - j) }) : x); });
    }
  }
  S.ev = out;
  /* threes against fours: in a solo or a bridge a hand drum strikes every third sixteenth, running on across the bar lines */
  if (sec.poly && !calm && e >= 1){ const pk = gv.poly || 'B'; for (let j = 0; j < N; j++) if ((S.pp + j) % 3 === 0) hit(pk, j, (S.pp + j) % 12 === 0 ? 0.62 : 0.4, out); }
  S.pp = (S.pp + N) % 3;
  /* nearly dead: a heartbeat under everything */
  if ((w.low || 0) > 0.5 && w.run){ const v = 0.45 + 0.5 * w.low; out[0].push({ st: 0, p: 'perc', dk: 'heart', v: v }); out[N >> 1].push({ st: N >> 1, p: 'perc', dk: 'heart', v: v }); }
}
/* play one sixteenth of the bar */
function bandStep(R, S, i, t, sd){
  const evs = S.ev && S.ev[i]; if (!evs || !S.song) return;
  const sw = ((S.map ? S.map.rhy[i] : i) % 4 === 2 ? S.song.swing * 0.667 : 0) * sd;
  for (let k = 0; k < evs.length; k++){
    const e = evs[k];
    if (S.mute && S.mute[e.p]) continue;
    if (S.solo && S.solo !== e.p) continue;
    if (S.gate[e.p] !== undefined && S.gate[e.p] < 0.03) continue;
    const tt = t + sw + (e.j || 0);
    if (e.dk) bandHit(R, e.p, e.dk, tt, e.v);
    else if (e.fx === 'riser') bandRiser(R, t, S.n * sd, e.v);
    else if (e.fx === 'rev') bandHit(R, 'fx', 'crashRev', t + S.n * sd - 1.18, e.v);
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
  const f = { drums: on ? 0.6 + 0.4 * Math.max(st.spike, st.I) : 1, bass: on ? 0.65 + 0.35 * st.near : 1, perc: 1, comp: thin, pad: 1, arp: thin,
    lead: on ? 0.7 + 0.3 * thin : 1, lead2: thin, counter: thin, solo: on ? 0.75 + 0.25 * thin : 1, fx: 1 };
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
/* one sixteenth: a new bar (and maybe a new song) on the first, then the notes of that step. A bar is as long as its meter */
Music.bandTick = function(t){
  const S = this.S, w = this.want, c = SFX.ctx;
  let i = this.cur ? (this.pos | 0) : 0;
  if (i >= (S.n || 16)) i = 0;
  if (i !== 0 && i % 4 === 0 && w.theme !== S.theme && w.run && bandSong(w.theme).boss) i = 0;   /* a boss: the band cuts to it on the next beat */
  if (i === 0){
    const prev = this.cur;
    this.cur = { theme: w.theme, lvl: w.lvl, tempo: w.tempo, dense: w.dense, shift: w.shift | 0 };
    if (prev && prev.theme !== this.cur.theme && this.xf && !(w.run && bandSong(this.cur.theme).boss)){      /* a new song: dip, then swell back in */
      const g = this.xf.gain, tt = Math.max(c ? c.currentTime : 0, t);
      g.cancelScheduledValues(tt - 0.01); g.setValueAtTime(0.35, tt); g.linearRampToValueAtTime(1, tt + 2.2);
    }
    bandBar(this.R, S, this.cur, w, t);
  }
  const bpm = S.song.bpm * (this.cur.lvl === 3 ? 1.07 : 1) * (this.cur.tempo || 1), sd = 60 / bpm / 4;
  if (this.vol() > 0 && !SFX.muted && !Settings.muted) bandStep(this.R, S, i, t, sd);
  this.nextT = t + sd;
  this.pos = i + 1;
  this.step++;
};

/* ---------------------------------------------------------------- drawing a song into a file (the music lab and the tests) */
const Band = {
  song: bandSong,
  motto: BAND_MOTTO,
  /* jump the live band to a section at the next bar */
  jump(sec){ if (Music.S) Music.S.pending = sec; },
  /* render bars of music offline. opt: { bars, theme, lvl, I, rest, low, run, shift, mute, solo } or opt.at(bar) giving those per bar;
     returns a promise of an AudioBuffer (stereo, 44.1 kHz) */
  render(opt){
    const sr = opt.sr || 44100, ws = []; let room = 0.05;
    for (let b = 0; b < opt.bars; b++){
      const w = Object.assign({ lvl: 1, run: false, I: 0.5, tempo: 1, shift: 0 }, opt, opt.at ? opt.at(b) : {});
      const song = bandSong(w.theme); ws.push(w); room += 20 * 15 / (song.bpm * (w.lvl === 3 ? 1.07 : 1) * w.tempo);      /* room for the longest bar */
    }
    const oc = new OfflineAudioContext(2, Math.ceil((room + 3) * sr), sr);
    const out = oc.createGain(); out.gain.value = opt.gain || 0.6 * 0.55 * 0.3;          /* where the music sits in the game: volume 60%, the music bus, the master */
    const lim = oc.createDynamicsCompressor(); lim.threshold.value = -9; lim.knee.value = 8; lim.ratio.value = 14; lim.attack.value = 0.003; lim.release.value = 0.2;
    out.connect(lim); lim.connect(oc.destination);                              /* and the same limiter in front of the speakers (01-core.js) */
    const R = bandRig(oc, out), S = bandState(); S.mute = opt.mute || null; S.solo = opt.solo || null;
    let t = 0.05;
    ws.forEach(function(w){
      const bpm = bandSong(w.theme).bpm * (w.lvl === 3 ? 1.07 : 1) * w.tempo, sd = 60 / bpm / 4;
      if (w.fd) for (const p in w.fd) R.part[p].fd.gain.setValueAtTime(w.fd[p], t);
      bandBar(R, S, { theme: w.theme, lvl: w.lvl, tempo: w.tempo, shift: w.shift }, w, t);
      if (w.jump) S.pending = w.jump;                                         /* go to a section from the next bar */
      if (opt.onBar) opt.onBar(S, { w: w, bpm: bpm, t: t });
      for (let i = 0; i < S.n; i++) bandStep(R, S, i, t + i * sd, sd);
      t += S.n * sd;
    });
    const end = Math.min(oc.length, Math.ceil((t + 3) * sr));
    return oc.startRendering().then(function(buf){
      if (end >= buf.length) return buf;
      const cut = new AudioBuffer({ length: end, numberOfChannels: 2, sampleRate: sr });
      for (let c = 0; c < 2; c++) cut.copyToChannel(buf.getChannelData(c).subarray(0, end), c);
      return cut;
    });
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
