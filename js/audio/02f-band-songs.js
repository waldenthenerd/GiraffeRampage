'use strict';
/* The band's songbook: drum grooves, bass lines, chord patterns, arpeggios, and one song for every place the music can be.
   Loaded after 02e-band-voices.js; played by 02g-band-play.js.

   How a song is written:
   - bpm, key (the MIDI note of the home key, 40-55), mode (a scale from MUSIC_SCALES or 'mixo'), swing (0 straight, 1 a full shuffle);
   - the band: groove (a drum family below), bass [instrument, line], comp [instrument, pattern] (the chords: a guitar strum, piano,
     a reggae skank, power chords...), pad (held chords), arp [instrument, pattern], lead (plays the hook), counter (answers it and holds
     the chord's guide tones), verse (plays the verse tune);
   - prog: chords per section in Roman numerals from the home key (i minor, I major, b for flat, 7 / maj7 / sus4 / dim / 9 after),
     one per bar, or two in a bar as 'IV:V';
   - hook: the chorus tune, two bars of eighth notes: scale steps 1-7, '>' an octave up, '<' down, '#' or 'b' after for a sharp or flat,
     '-' holds the note, '.' rests, '3,4' two sixteenths in one eighth. riff (bosses): a low two-bar figure the band locks to.
     Anything not written (the verse tune, the bridge tune, a boss's chorus) is composed from the song's name, so it is the same every
     time and different for every song;
   - calm: no big drums or risers (menus, nights, films); boss: a boss song (a short intro, a riff, a hard cut in);
   - mix: per-part level / pan / room changes; room: how much reverb; form: the section order outside a run. */

/* the drum families: four energy levels (0 sparse ... 3 everything), a fill for the end of a section (the last half bar), a short lick
   for the end of a phrase, which drum rolls into a big section, and what marks the start of one (a crash, a taiko...).
   Letters: k kick, s snare, h hat, o open hat, r ride, c crash, t m l toms (high, mid, low), p clap, T taiko, i timpani (tuned to the
   chord), K deep electronic kick; perc (its own part, off to one side): z shaker, j tambourine, g G conga high and low, x slap,
   b bongo, w rim, q cowbell, B woodblock. Velocity: X loud, x normal, o ghost. */
const BAND_GROOVES = {
  tribal: { crash: 'T', roll: 'g', e: [
    { k: 'x.......x.......', z: 'o.o.o.o.o.o.o.o.' },
    { k: 'X.....x...x.....', g: '....x..x....x.x.', G: '..o.......o.....', z: 'x.o.x.o.x.o.x.o.' },
    { k: 'X.....x...x.....', g: '....x..x.x..x.x.', G: '..x...x...x...x.', z: 'xoxoxoxoxoxoxoxo', p: '....x.......x...' },
    { k: 'X.....x.X.x.....', T: 'X.......X.......', g: '..x.x..x.x..x.xx', G: 'x.x...x...x...x.', z: 'xoxoxoxoxoxoxoxo', p: '....X.......X...' }],
    fill: { t: 'X.x.....', m: '....X.x.', l: '......XX', k: 'X.......' }, lick: { g: 'x.xx', G: '...x' } },
  rock: { crash: 'c', roll: 's', e: [
    { k: 'x.......x.......', h: 'o.o.o.o.o.o.o.o.' },
    { k: 'X.....x.X.......', s: '....X.......X...', h: 'x.o.x.o.x.o.x.o.' },
    { k: 'X.....x.X.x.....', s: '....X.......X...', h: 'X.x.X.x.X.x.X.x.', o: '..............x.' },
    { k: 'X.x...x.X.x...x.', s: '....X.......X..o', r: 'X.x.X.x.X.x.X.x.' }],
    fill: { s: 'X.x.....', t: '....Xx..', m: '......X.', l: '.......X', k: 'X...x...' }, lick: { s: '..xx', k: 'x...' } },
  funk: { crash: 'c', roll: 's', e: [
    { k: 'X.........x.....', h: 'xoxoxoxoxoxoxoxo' },
    { k: 'X..x......x..x..', s: '....X..o.o..X...', h: 'XoxoXoxoXoxoXoxo' },
    { k: 'X..x..x...x..x..', s: '....X..o.o..X..o', h: 'XoxoXoxoXoxoXox.', o: '...............x' },
    { k: 'X..x..x.X.x..x..', s: '.o..X..o.o..X.oo', h: 'XxxxXxxxXxxxXxx.', o: '...............x' }],
    fill: { s: 'XoxoXoXX', k: 'x.....x.' }, lick: { s: 'oxoX' } },
  four: { crash: 'c', roll: 's', kit: { k: 'kick808' }, e: [
    { k: 'x...x...x...x...', o: '..o...o...o...o.' },
    { k: 'X...X...X...X...', p: '....X.......X...', o: '..x...x...x...x.' },
    { k: 'X...X...X...X...', p: '....X.......X...', o: '..x...x...x...x.', h: 'xoxoxoxoxoxoxoxo' },
    { k: 'X...X...X...X...', p: '....X.......X...', s: '....x.......x...', o: '..X...X...X...X.', h: 'xxxxxxxxxxxxxxxx' }],
    fill: { s: 'xxxxXXXX', k: 'X...X...' }, lick: { s: '..xx' } },
  brush: { crash: 'r', roll: 's', kit: { s: 'brush' }, e: [
    { r: 'x...x.o.x...x.o.', h: '....o.......o...' },
    { r: 'X...x.o.X...x.o.', h: '....x.......x...', s: '..o...o...o...o.', k: 'o.......o.......' },
    { r: 'X...x.oXX...x.o.', h: '....x.......x...', s: '..o...x...o..x..', k: 'o.......o..o....' },
    { r: 'X...X.xXX...X.x.', h: '....x.......x...', s: '..o.x.x...o.xx.o', k: 'x.....o.x..o....' }],
    fill: { s: 'x.oxX.ox', t: '......x.' }, lick: { s: 'o.ox' } },
  march: { crash: 'c', roll: 's', kit: { s: 'snareTight' }, e: [
    { s: 'x.o.x.o.x.o.x.o.', k: 'x.......x.......' },
    { s: 'X.oox.o.X.oox.o.', k: 'X.......X.......' },
    { s: 'X.oox.oxX.oox.ox', k: 'X.......X.......', c: 'x...............' },
    { s: 'X.xxX.xxX.xxX.xx', k: 'X...X...X...X...', T: 'X.......X.......', c: 'X.......X.......' }],
    fill: { s: 'xxxxxxXX', k: 'X.......' }, lick: { s: 'xxxx' } },
  metal: { crash: 'c', roll: 's', kit: { k: 'kickRock', s: 'snareBig' }, e: [
    { k: 'X.......X.......', r: 'x...x...x...x...' },
    { k: 'X.x...x.X.x...x.', s: '....X.......X...', h: 'x.x.x.x.x.x.x.x.' },
    { k: 'XxX.XxX.XxX.XxX.', s: '....X.......X...', r: 'X.x.X.x.X.x.X.x.' },
    { k: 'XxXxXxXxXxXxXxXx', s: '....X.......X...', c: 'X...X...X...X...' }],
    fill: { t: 'XxXx....', m: '....XxXx', l: '........', k: 'XxXxXxXx' }, lick: { t: 'XX..', l: '..XX' } },
  reggae: { crash: 'c', roll: 's', e: [
    { w: '........x.......', h: '..o...o...o...o.' },
    { k: '........X.......', w: '........X.......', h: 'x.o.x.o.x.o.x.o.' },
    { k: '........X.......', s: '........X.......', h: 'x.oxx.oxx.oxx.ox', w: '....x.......x...' },
    { k: 'X...X...X...X...', s: '........X.......', h: 'xxxxxxxxxxxxxxxx', o: '..x.......x.....' }],
    fill: { t: 'x.x.....', m: '....x.x.', l: '......Xx' }, lick: { s: '...x' } },
  chip: { crash: 'c', roll: 's', kit: { k: 'chipKick', s: 'chipSnare', h: 'chipHat', o: 'chipHat', c: 'chipCrash' }, e: [
    { k: 'X.......X.......', h: '..x...x...x...x.' },
    { k: 'X.....x.X.......', s: '....X.......X...', h: 'x.x.x.x.x.x.x.x.' },
    { k: 'X.....x.X.x.....', s: '....X.......X.x.', h: 'xxxxxxxxxxxxxxxx' },
    { k: 'X.x...x.X.x...x.', s: '....X..x....X.xx', h: 'XxXxXxXxXxXxXxXx' }],
    fill: { s: 'XxXxXXXX', k: 'X...X...' }, lick: { s: '.xXX' } },
  orch: { crash: 'c', roll: 'i', e: [
    { i: 'x...............' },
    { i: 'X.......x.......', T: 'x...............' },
    { i: 'X.x.....X.x.....', T: 'X.......X.......', s: '............o.oo' },
    { i: 'X.xxX...X.xxX...', T: 'X..x..X.X..x..X.', s: '....X.......X...', c: 'X...............' }],
    fill: { i: 'xxxxXXXX', T: 'X.......' }, lick: { i: 'xxXX' } },
  ambient: { crash: null, roll: 'z', kit: { k: 'kickSoft' }, e: [
    {},
    { k: 'x.........x.....', z: '..o...o...o...o.' },
    { k: 'x.......x.x.....', w: '....x.......x...', z: 'o.o.o.o.o.o.o.o.' },
    { k: 'X.......X.x.....', w: '....x.......x...', z: 'xoxoxoxoxoxoxoxo', j: '....x.......x...' }],
    fill: { z: 'xoxoxxxx' }, lick: {} },
  halftime: { crash: 'c', roll: 's', kit: { k: 'kick808' }, e: [
    { k: 'X...............', h: 'o.o.o.o.o.o.o.o.' },
    { k: 'X.....x...x.....', s: '........X.......', h: 'x.x.x.x.x.x.x.x.' },
    { k: 'X.....x...x..x..', s: '........X.......', p: '........X.......', h: 'xxxxxxxxxxxxxoxo' },
    { k: 'X.x...x...x..x..', s: '........X.....x.', p: '........X.......', h: 'xxxxxxxxxxxxxxxx' }],
    fill: { s: '..x.xxXX', h: 'xxxxxxxx' }, lick: { h: 'xxxx' } },
  latin: { crash: 'c', roll: 'g', e: [
    { z: 'xoxoxoxoxoxoxoxo', G: '..o.......o.....' },
    { k: 'X..x....X..x....', w: 'X..X..X...X.X...', g: '..o.x..x..o.x..x', G: '......x.......x.', z: 'xoxoxoxoxoxoxoxo' },
    { k: 'X..x....X..x....', w: 'X..X..X...X.X...', g: '..o.x..x..o.x..x', G: '......x.......x.', b: 'xoxoxoxoxoxoxoxo', z: 'xoxoxoxoxoxoxoxo' },
    { k: 'X..x..x.X..x..x.', w: 'X..X..X...X.X...', g: '..x.x.xx..x.x.xx', G: '...x..x....x..x.', b: 'XoxoXoxoXoxoXoxo', j: '....x.......x...' }],
    fill: { g: 'x.x.xx..', G: '....xxXX' }, lick: { g: 'xx..', G: '..xx' } },
  shuffle: { crash: 'c', roll: 's', kit: { s: 'brush' }, e: [
    { h: 'x...x...x...x...', k: 'x.......x.......' },
    { k: 'X.....x.X.....x.', s: '....X.......X...', h: 'x.x.x.x.x.x.x.x.' },
    { k: 'X.....x.X.....x.', s: '....X..o....X..o', h: 'x.x.x.x.x.x.x.x.', o: '..............x.' },
    { k: 'X.....x.X.x...x.', s: '....X..o....X..o', r: 'X.x.X.x.X.x.X.x.' }],
    fill: { s: 'x.x.X.x.', t: '......x.', l: '.......x' }, lick: { s: '..ox' } },
  industrial: { crash: 'c', roll: 's', kit: { k: 'kickRock' }, e: [
    { k: 'X.......X.......', B: '..o.......o.....' },
    { k: 'X..x..X...X.....', p: '....X.......X...', h: 'xoxoxoxoxoxoxoxo' },
    { k: 'X..x..X...X..x..', p: '....X.......X...', s: '....x.......x..x', h: 'xxxxxxxxxxxxxxxx', q: '..x.......x.....' },
    { k: 'X..x..X.X.X..x..', p: '....X.......X...', s: '....X..x....X.xx', h: 'XxxxXxxxXxxxXxxx', q: '..x...x...x...x.' }],
    fill: { s: 'XxXxXXXX', k: 'x.x.x.x.' }, lick: { p: '...X' } },
  folk: { crash: 'c', roll: 's', e: [
    { z: 'x.o.x.o.x.o.x.o.' },
    { k: 'X.......X.......', w: '....X.......X...', z: 'xoxoxoxoxoxoxoxo' },
    { k: 'X.....x.X.......', s: '....X.......X...', j: '....X.......X...', z: 'xoxoxoxoxoxoxoxo' },
    { k: 'X.....x.X.x.....', s: '....X.......X...', j: 'xoxoxoxoxoxoxoxo', h: 'x.x.x.x.x.x.x.x.' }],
    fill: { s: 'x.x.x.xx', t: '....x...', l: '......x.' }, lick: { s: '...x' } },
  lounge: { crash: 'r', roll: 'z', kit: { s: 'brush' }, e: [
    { z: 'xoxoxoxoxoxoxoxo' },
    { k: 'X..x....X..x....', w: 'X..X..X...X..X..', z: 'xoxoxoxoxoxoxoxo' },
    { k: 'X..x....X..x....', w: 'X..X..X...X..X..', z: 'xoxoxoxoxoxoxoxo', h: '..x...x...x...x.' },
    { k: 'X..x....X..x....', w: 'X..X..X...X..X..', r: 'X.x.X.x.X.x.X.x.', s: '..o...o...o...o.' }],
    fill: { s: 'o.o.x.xx' }, lick: { w: '..x.' } },
  none: { crash: null, roll: null, e: [{}, {}, {}, {}], fill: {}, lick: {} }
};
const BAND_KIT = { k: 'kick', s: 'snare', h: 'hat', o: 'hatOpen', r: 'ride', c: 'crash', t: 'tomHi', m: 'tomMid', l: 'tomLo', p: 'clap', T: 'taiko', K: 'kick808',
  z: 'shaker', j: 'tamb', g: 'congaHi', G: 'congaLo', x: 'slap', b: 'bongo', w: 'rim', q: 'cowbell', B: 'block' };
const BAND_PERC_KEYS = 'zjgGxbwqB';

/* bass lines, one per bar (more than one: they take turns). R root, O octave up, 5 fifth, 3 third, 7 seventh, 6 sixth, 2 a step up,
   A an approach note into the next chord; lower case: short and soft; '-' hold; '.' rest. 'walk' and 'riff' are played by rule */
const BAND_BASS = {
  pulse:  ['R.....R.R...5.A.', 'R.....R.R.O.5...'],
  root8:  ['R.R.R.R.R.R.R.R.'],
  gallop: ['R.rrR.rrR.rrR.rr'],
  funk:   ['R..o..R.r.R..O.A', 'R..R..o.R..O.5..'],
  reggae: ['R-.R..5.--R..3..', 'R-.R..5.--O..5.A'],
  tribal: ['R.....R...5.....', 'R.....R...O...A.'],
  sub:    ['R---------------'],
  half:   ['R-------5-------'],
  march:  ['R...5...R...5...'],
  boogie: ['R.3.5.6.7.6.5.3.'],
  octave: ['R.O.R.O.R.O.R.O.'],
  chip:   ['RORO5O5ORORO5OA.'],
  synco:  ['R..R..R...R.R...', 'R..R..R...R.5.A.'],
  bossa:  ['R--5R--5R--5R--A'],
  calypso:['R..R..5.R..R..A.']
};
/* chord patterns, one per bar. X x a whole chord (loud, normal), D a strum down, u a strum up (the top notes), m a muted chuck,
   P p a power chord (open, palm-muted), a-e one note of the chord (a the lowest; e the lowest an octave up) for broken chords */
const BAND_COMP = {
  strum:    ['D...D.u...u.D.u.', 'D...D.u...u.D.uD'],
  strum16:  ['D.muD.muD.muD.mu'],
  calypso:  ['D..u..D.u.D.u.u.'],
  skank:    ['....x.......x...'],
  ska:      ['..x...x...x...x.'],
  stab:     ['.x..x..x..x.x...', 'x..x..x...x..x..'],
  block:    ['X.......X.......'],
  whole:    ['X---------------'],
  pulse8:   ['X.x.x.x.X.x.x.x.'],
  pulse16:  ['Xxxxxxxxxxxxxxxx'],
  charleston:['X.....x.........', '..x.....X.....x.'],
  power8:   ['P.p.p.p.P.p.p.p.'],
  powerGal: ['P.ppP.ppP.ppP.pp'],
  ostinato: ['a.c.b.c.a.c.b.c.', 'a.c.b.e.a.c.b.e.'],
  alberti:  ['acbcacbcacbcacbc'],
  bossa:    ['X..x..x...x..x..', '..x..x..X..x....'],
  sparse:   ['a.......c.......', '....e.......b...'],
  arp:      ['a.b.c.e.c.b.a.b.']
};
/* arpeggios over the chord, an octave above it */
const BAND_ARP = {
  up8: 'a.b.c.e.a.b.c.e.', updown8: 'a.b.c.e.f.e.c.b.', up16: 'abceabceabceabce', down16: 'ecbaecbaecbaecba',
  bounce16: 'abcbabcbabcbabcb', broken: 'a.c.b.e.a.c.b.e.', sparse: 'e.......c.....b.', chip: 'acecacecacecacec', rand16: '*'
};

/* ---------------------------------------------------------------- the songs */
const BAND_SONGS = {
  /* the main menu: the giraffe's own tune, warm and unhurried */
  menu: { name: 'Longneck', bpm: 88, key: 50, mode: 'major', swing: 0.2, calm: true,
    groove: 'folk', bass: ['pbass', 'pulse'], comp: ['nylon', 'ostinato'], pad: 'strings', arp: ['kalimba', 'up8'], lead: 'flute', counter: 'kalimba', verse: 'vibes',
    prog: { verse: 'I vi IV V', chorus: 'IV I V vi', bridge: 'ii V I vi' },
    hook: '5 - 3 5 >1 - 7 5 | 6 - 5 3 2 - - .' },

  /* ---------------- the chapters */
  savanna: { name: 'Long Grass', bpm: 102, key: 50, mode: 'dorian', swing: 0.15,
    groove: 'tribal', bass: ['pbass', 'tribal'], comp: ['kalimba', 'ostinato'], pad: 'warm', arp: ['marimba', 'updown8'], lead: 'flute', counter: 'marimba', verse: 'kalimba',
    prog: { verse: 'i i bVII IV', chorus: 'bIII bVII IV i', bridge: 'v v bVII IV' },
    hook: '1 . 3 4 5 - 4 3 | 4 - 3 1 2 - - .' },
  frost: { name: 'Snow Valley', bpm: 76, key: 45, mode: 'minor',
    groove: 'ambient', bass: ['upright', 'half'], comp: ['piano', 'ostinato'], pad: 'strings', arp: ['musicbox', 'up8'], lead: 'violin', counter: 'glock', verse: 'musicbox',
    prog: { verse: 'i bVI bIII bVII', chorus: 'iv i bVII bIII', bridge: 'bVI bVII i i' }, room: 1.4,
    hook: '5 - - 4 3 - 2 3 | 1 - - - <7 - - .' },
  swamp: { name: 'Bayou Shuffle', bpm: 74, key: 43, mode: 'mixo', swing: 1,
    groove: 'shuffle', bass: ['upright', 'walk'], comp: ['banjo', 'strum'], pad: 'organ', arp: null, lead: 'reed', counter: 'organ', verse: 'banjo',
    prog: { verse: 'I7 I7 IV7 I7', chorus: 'IV7 IV7 I7 I7 V7 IV7 I7 V7', bridge: 'IV7 IV7 I7 I7' },
    hook: '1 . 3b 3 5 . 3 1 | 7 - 5 - 1 - - .', mix: { pad: { lv: 0.6 } } },
  ocean: { name: 'The Deep', bpm: 84, key: 52, mode: 'lydian',
    groove: 'ambient', bass: ['sub', 'half'], comp: ['harp', 'ostinato'], pad: 'choir', arp: ['vibes', 'updown8'], lead: 'glass', counter: 'harp', verse: 'vibes',
    prog: { verse: 'I II I II', chorus: 'vi V II I', bridge: 'iii II I I' }, room: 1.6, echo: 1.5,
    hook: '3 - 4 - 5 . 3 2 | 1 - - - 2 - - .' },
  jungle: { name: 'Canopy Run', bpm: 114, key: 45, mode: 'minor', avoid: [1, 5],
    groove: 'latin', bass: ['pbass', 'funk'], comp: ['marimba', 'alberti'], pad: 'warm', arp: ['xylo', 'up16'], lead: 'panflute', counter: 'marimba', verse: 'xylo',
    prog: { verse: 'i bVII i bVII', chorus: 'bVI bVII i i', bridge: 'iv iv v v' },
    hook: '1 1 3 . 4 . 5 7 | 5 . 4 3 1 - - .' },
  city: { name: 'Night Drive', bpm: 108, key: 46, mode: 'minor',
    groove: 'four', bass: ['synbass', 'octave'], comp: ['epiano', 'stab'], pad: 'supersaw', arp: ['pluckSyn', 'up16'], lead: 'saw', counter: 'square', verse: 'square',
    prog: { verse: 'i7 bVImaj7 bIII bVII', chorus: 'bVI bVII i v', bridge: 'iv iv bVI bVII' },
    hook: '5 . 5 6 5 - 3 . | 4 - 3 - 1 - - .' },
  space: { name: 'Launch Window', bpm: 90, key: 48, mode: 'dorian',
    groove: 'halftime', bass: ['synbass', 'synco'], comp: ['pluckSyn', 'pulse8'], pad: 'glass', arp: ['vibes', 'updown8'], lead: 'square', counter: 'vibes', verse: 'square',
    prog: { verse: 'i7 IV7 i7 IV7', chorus: 'bIIImaj7 IV v7 i7', bridge: 'bVII bVII IV IV' }, echo: 1.5,
    hook: '5 - 4 . 3 . 4 5 | 7 - 6 - 5 - - .' },
  moon: { name: 'Low Gravity', bpm: 66, key: 41, mode: 'major', avoid: [3, 6], calm: true,
    groove: 'none', bass: ['sub', 'sub'], comp: ['musicbox', 'sparse'], pad: 'glass', arp: ['bell', 'sparse'], lead: 'theremin', counter: 'choir', verse: 'musicbox',
    prog: { verse: 'Imaj7 IVmaj7 vi7 IVmaj7', chorus: 'ii7 V I vi', bridge: 'IV IV I I' }, room: 1.8, echo: 1.6, mix: { bass: { lv: 0.6 } },
    hook: '5 - - - 6 - 5 3 | 2 - - - - - 1 -' },
  venus: { name: 'Acid Clouds', bpm: 92, key: 44, mode: 'phrygian',
    groove: 'halftime', bass: ['acid', 'synco'], comp: ['supersaw', 'stab'], pad: 'choir', arp: ['pluckSyn', 'rand16'], lead: 'saw', counter: 'theremin', verse: 'theremin',
    prog: { verse: 'i bII i bII', chorus: 'bVI bVII i bII', bridge: 'iv iv bVI bII' },
    hook: '1 . 2 1 <7 . 1 . | 3 . 2 - 1 - - .' },
  inferno: { name: 'Brimstone', bpm: 120, key: 40, mode: 'harm',
    groove: 'metal', bass: ['pbass', 'gallop'], comp: ['power', 'powerGal'], pad: 'choir', arp: null, lead: 'dist', counter: 'organ', verse: 'dist',
    prog: { verse: 'i i bVI V', chorus: 'i bVI iv V', bridge: 'bII bII i V' },
    hook: '5 . 6 5 4 . 3 . | 2 . 3 . <7 - - .', mix: { comp: { lv: 1.2 } } },
  glimmer: { name: 'Shimmer', bpm: 96, key: 43, mode: 'lydian',
    groove: 'rock', bass: ['pbass', 'pulse'], comp: ['egtr', 'ostinato'], pad: 'glass', arp: ['glock', 'up8'], lead: 'glass', counter: 'glock', verse: 'egtr',
    prog: { verse: 'Imaj7 II vi7 II', chorus: 'vi V II I', bridge: 'iii vi II II' }, room: 1.4, echo: 1.4,
    hook: '1 - 2 3 4 . 3 2 | 3 - - - 5 - - .' },
  area51: { name: 'Hangar Eighteen', bpm: 100, key: 45, mode: 'minor',
    groove: 'industrial', bass: ['synbass', 'funk'], comp: ['clav', 'stab'], pad: 'pad', arp: ['pluckSyn', 'rand16'], lead: 'theremin', counter: 'bell', verse: 'bell',
    prog: { verse: 'i i bVI V', chorus: 'iv bVI V i', bridge: 'bII bII i i' },
    hook: '1 - 5 - 4 3 4 5 | 3 - - - <7# - - .' },
  mars: { name: 'Red Dust', bpm: 94, key: 47, mode: 'dorian',
    groove: 'rock', bass: ['pbass', 'pulse'], comp: ['egtr', 'strum'], pad: 'pad', arp: ['banjo', 'broken'], lead: 'whistle', counter: 'horn', verse: 'egtr',
    prog: { verse: 'i i bVII i', chorus: 'bVI bVII i i', bridge: 'iv iv bVII bVII' },
    hook: '5 - >1 - 7 . 6 5 | 4 - 5 - 1 - - .' },
  marswar: { name: 'War of the Red Planet', bpm: 118, key: 45, mode: 'harm',
    groove: 'orch', bass: ['tuba', 'march'], comp: ['strings', 'pulse8'], pad: 'choir', arp: ['harp', 'up16'], lead: 'brass', counter: 'strings', verse: 'horn',
    prog: { verse: 'i i bVI V', chorus: 'i bVI bIII V', bridge: 'iv iv bVI V' },
    hook: '1 . 1 . 3 - 2 1 | <7 - <5 - 1 - - .' },
  dome: { name: 'Under Glass', bpm: 92, key: 50, mode: 'minor',
    groove: 'orch', bass: ['pizz', 'half'], comp: ['pizz', 'ostinato'], pad: 'strings', arp: ['harp', 'updown8'], lead: 'horn', counter: 'violin', verse: 'harp',
    prog: { verse: 'i iv bVII bIII', chorus: 'bVI bVII i i', bridge: 'iv v bVI V' }, room: 1.4,
    hook: '1 . 2 3 5 - 4 3 | 2 - 1 2 3 - - .' },
  tower: { name: 'Overtime', bpm: 104, key: 45, mode: 'dorian', swing: 0.5,
    groove: 'funk', bass: ['upright', 'walk'], comp: ['epiano', 'charleston'], pad: 'organ', arp: null, lead: 'sax', counter: 'vibes', verse: 'vibes',
    prog: { verse: 'i7 IV7 i7 IV7', chorus: 'bIIImaj7 bVImaj7 ii7 V7', bridge: 'iv7 bVII7 bIIImaj7 bVImaj7' },
    hook: '5 . 7 . >1 7 5 . | 4 . 3 . 1 - - .' },
  siege: { name: 'Hold the Walls', bpm: 118, key: 43, mode: 'dorian',
    groove: 'march', bass: ['pbass', 'march'], comp: ['gtr', 'strum'], pad: 'strings', arp: ['harp', 'broken'], lead: 'whistle', counter: 'horn', verse: 'harp',
    prog: { verse: 'i bVII i bVII', chorus: 'bIII bVII i i', bridge: 'IV IV i i' },
    hook: '1,2 3 1 5 . 4 3 . | 2,3 4 2 1 - - . .' },
  fort: { name: 'Breach', bpm: 126, key: 41, mode: 'minor',
    groove: 'rock', bass: ['pbass', 'root8'], comp: ['power', 'power8'], pad: 'strings', arp: null, lead: 'brass', counter: 'dist', verse: 'dist',
    prog: { verse: 'i i bVI bVII', chorus: 'i bVII bVI V', bridge: 'iv iv bVI V' },
    hook: '1 . 1 3 5 . 4 3 | 4 . 3 . 2 - - .', mix: { comp: { lv: 1.2 } } },
  isle: { name: 'Coconut Telegraph', bpm: 108, key: 50, mode: 'mixo',
    groove: 'latin', bass: ['pbass', 'calypso'], comp: ['uke', 'calypso'], pad: 'organ', arp: ['marimba', 'up8'], lead: 'steel', counter: 'marimba', verse: 'steel',
    prog: { verse: 'I IV I bVII', chorus: 'IV I V I', bridge: 'vi IV V V' },
    hook: '3 . 5 . 6 5 3 . | 2 . 3 2 1 - - .', mix: { pad: { lv: 0.5 } } },
  islelab: { name: 'Containment', bpm: 108, key: 50, mode: 'phrygian',
    groove: 'industrial', bass: ['acid', 'synco'], comp: ['supersaw', 'stab'], pad: 'pad', arp: ['pluckSyn', 'rand16'], lead: 'square', counter: 'steel', verse: 'steel',
    prog: { verse: 'i bII i bII', chorus: 'bVI bVII i bII', bridge: 'iv iv bII bII' },
    hook: '1 2 1 . 3 . 2 1 | <7 - 1 - - - . .' },

  /* ---------------- the bosses: a riff the whole band locks to, and a chorus composed from the song's name */
  boss1:  { name: 'The Pride', boss: true, bpm: 128, key: 45, mode: 'minor', groove: 'tribal', bass: ['pbass', 'gallop'], comp: ['power', 'power8'], pad: 'choir', arp: ['marimba', 'up16'], lead: 'dist', counter: 'brass',
    riff: '1 1,1 3 1 4 3,1 <7 1 | 1 1,1 3 1 5 4 3 2' },
  boss2:  { name: 'Whiteout', boss: true, bpm: 120, key: 52, mode: 'phrygian', groove: 'orch', bass: ['synbass', 'root8'], comp: ['strings', 'pulse16'], pad: 'choir', arp: ['glock', 'up16'], lead: 'violin', counter: 'choir',
    riff: '1 2 1 . 1 2 3 2 | 1 2 1 . <7 . 1 .' },
  boss3:  { name: 'Mire Beast', boss: true, bpm: 108, key: 40, mode: 'harm', swing: 0.8, groove: 'shuffle', bass: ['synbass', 'gallop'], comp: ['banjo', 'strum16'], pad: 'organ', arp: null, lead: 'reed', counter: 'organ',
    riff: '1 . 1 3 . 4 4# 5 | 7 . 6 5 4 3 1 .' },
  boss4:  { name: 'Leviathan', boss: true, bpm: 124, key: 43, mode: 'minor', groove: 'halftime', bass: ['sub', 'synco'], comp: ['harp', 'arp'], pad: 'choir', arp: ['vibes', 'up16'], lead: 'saw', counter: 'choir',
    riff: '1 - 1 5 6 - 5 3 | 4 - 3 1 2 - <7 .' },
  boss5:  { name: 'Canopy King', boss: true, bpm: 136, key: 47, mode: 'minor', avoid: [1, 5], groove: 'latin', bass: ['pbass', 'funk'], comp: ['marimba', 'pulse16'], pad: 'warm', arp: ['xylo', 'up16'], lead: 'saw', counter: 'xylo',
    riff: '1 3 1 4 1 5 4 3 | 1 3 1 4 7 5 4 3' },
  boss6:  { name: 'Gridlock', boss: true, bpm: 132, key: 44, mode: 'dorian', groove: 'four', bass: ['acid', 'octave'], comp: ['supersaw', 'stab'], pad: 'pad', arp: ['pluckSyn', 'up16'], lead: 'saw', counter: 'square',
    riff: '1 . 1 . 3 1 . 4 | . 3 1 . 7 . 1 .' },
  boss7:  { name: 'Countdown', boss: true, bpm: 126, key: 46, mode: 'phrygian', groove: 'halftime', bass: ['synbass', 'synco'], comp: ['pluckSyn', 'pulse16'], pad: 'glass', arp: ['vibes', 'down16'], lead: 'square', counter: 'theremin',
    riff: '1 1 2 1 1 1 3 2 | 1 1 2 1 <7 <7 1 .' },
  boss8:  { name: 'Dark Side', boss: true, bpm: 118, key: 41, mode: 'harm', groove: 'orch', bass: ['sub', 'half'], comp: ['bell', 'sparse'], pad: 'choir', arp: ['musicbox', 'up16'], lead: 'theremin', counter: 'choir',
    riff: '1 - 3 - 2 - <7 - | 1 - 5 - 4 3 2 .' },
  boss9:  { name: 'Sulfur Storm', boss: true, bpm: 130, key: 42, mode: 'phrygian', groove: 'industrial', bass: ['acid', 'gallop'], comp: ['power', 'power8'], pad: 'choir', arp: ['pluckSyn', 'rand16'], lead: 'dist', counter: 'theremin',
    riff: '1 2 1 . 1 2 4 3 | 1 2 1 . 6 5 2 1' },
  boss10: { name: 'Hellmouth', boss: true, bpm: 144, key: 38, mode: 'harm', groove: 'metal', bass: ['pbass', 'gallop'], comp: ['power', 'powerGal'], pad: 'choir', arp: null, lead: 'dist', counter: 'organ',
    riff: '1 1,1 2 1 3 1 2 1 | 1 1,1 6 5 4 3 2 <7', mix: { comp: { lv: 1.2 } } },
  boss11: { name: 'Prism', boss: true, bpm: 124, key: 50, mode: 'minor', groove: 'four', bass: ['synbass', 'octave'], comp: ['supersaw', 'pulse8'], pad: 'glass', arp: ['glock', 'up16'], lead: 'saw', counter: 'glock',
    riff: '1 . 5 . 3 . 5 . | 6 . 5 . 4 . 3 2' },
  boss12: { name: 'Specimen Zero', boss: true, bpm: 132, key: 43, mode: 'minor', groove: 'industrial', bass: ['synbass', 'funk'], comp: ['clav', 'stab'], pad: 'pad', arp: ['pluckSyn', 'rand16'], lead: 'theremin', counter: 'square',
    riff: '1 . 1 2b 1 . 5 4 | 3 . 2b 1 <7 . 1 .' },
  boss13: { name: 'Olympus', boss: true, bpm: 128, key: 45, mode: 'harm', groove: 'rock', bass: ['pbass', 'root8'], comp: ['egtr', 'strum16'], pad: 'pad', arp: ['banjo', 'up16'], lead: 'brass', counter: 'dist',
    riff: '1 . 3 . 2 1 <7 . | 1 . 3 . 5 4 3 2' },
  boss14: { name: 'The Thaw', boss: true, bpm: 122, key: 46, mode: 'phrygian', groove: 'orch', bass: ['tuba', 'march'], comp: ['strings', 'pulse16'], pad: 'choir', arp: ['harp', 'up16'], lead: 'brass', counter: 'choir',
    riff: '1 - 2 1 3 - 2 1 | 4 - 3 2 1 - <7 .' },
  boss15: { name: 'Hostile Takeover', boss: true, bpm: 134, key: 44, mode: 'harm', swing: 0.3, groove: 'funk', bass: ['synbass', 'funk'], comp: ['epiano', 'stab'], pad: 'organ', arp: null, lead: 'sax', counter: 'brass',
    riff: '1 . 3 1 4 . 3 1 | 5 4 3 1 <7 . 1 .' },
  boss16: { name: 'Battering Ram', boss: true, bpm: 128, key: 43, mode: 'minor', groove: 'march', bass: ['pbass', 'gallop'], comp: ['gtr', 'strum16'], pad: 'strings', arp: ['harp', 'up16'], lead: 'brass', counter: 'whistle',
    riff: '1 1 5 1 1 1 6 5 | 4 4 3 1 2 2 <7 .' },
  boss17: { name: 'Lockdown', boss: true, bpm: 140, key: 41, mode: 'minor', groove: 'metal', bass: ['pbass', 'gallop'], comp: ['power', 'powerGal'], pad: 'strings', arp: null, lead: 'dist', counter: 'brass',
    riff: '1 1,1 3 1 1,1 4 3 | 1 1,1 6 5 4 3 2 1', mix: { comp: { lv: 1.2 } } },
  boss18: { name: 'Tidal Mutation', boss: true, bpm: 130, key: 50, mode: 'phrygian', groove: 'latin', bass: ['acid', 'synco'], comp: ['steel', 'pulse16'], pad: 'pad', arp: ['marimba', 'up16'], lead: 'saw', counter: 'steel',
    riff: '1 2 1 3 1 2 1 . | 6 5 2 1 <7 . 1 .' },

  /* ---------------- Longneck Town */
  town: { name: 'Main Street', bpm: 96, key: 41, mode: 'major', swing: 0.25,
    groove: 'folk', bass: ['pbass', 'pulse'], comp: ['gtr', 'strum'], pad: 'organ', arp: ['glock', 'up8'], lead: 'whistle', counter: 'flute', verse: 'uke',
    prog: { verse: 'I IV I V', chorus: 'I vi IV V', bridge: 'ii ii IV V' }, mix: { pad: { lv: 0.5 } },
    hook: '5 . 3 4 5 . >1 . | 6 . 5 4 3 - - .' },
  townnight: { name: 'Lamplight', bpm: 70, key: 50, mode: 'major', swing: 0.3, calm: true,
    groove: 'brush', bass: ['upright', 'half'], comp: ['epiano', 'block'], pad: 'warm', arp: ['musicbox', 'sparse'], lead: 'vibes', counter: 'nylon', verse: 'nylon',
    prog: { verse: 'Imaj7 vi7 ii7 V7', chorus: 'IVmaj7 iii7 ii7 V7', bridge: 'IVmaj7 IVmaj7 Imaj7 Imaj7' },
    hook: '3 - 2 - 1 - 5 . | 6 - 5 - 3 - - .' },
  burrow: { name: 'The Burrows', bpm: 62, key: 45, mode: 'minor', avoid: [1, 5], calm: true,
    groove: 'ambient', bass: ['sub', 'sub'], comp: ['marimba', 'sparse'], pad: 'choir', arp: ['kalimba', 'broken'], lead: 'kalimba', counter: 'bell', verse: 'marimba',
    prog: { verse: 'i i iv i', chorus: 'bVI bVII i i', bridge: 'iv iv bVII bVII' }, room: 1.8, echo: 1.4,
    hook: '1 - 3 - 4 - 3 1 | <7 - - - 1 - - .' },

  /* ---------------- screens */
  lab: { name: 'Lab Notes', bpm: 70, key: 48, mode: 'minor', avoid: [1, 5], calm: true,
    groove: 'ambient', bass: ['sub', 'sub'], comp: ['pluckSyn', 'sparse'], pad: 'glass', arp: ['musicbox', 'rand16'], lead: 'square', counter: 'vibes', verse: 'vibes',
    prog: { verse: 'i iv i bVII', chorus: 'bVI bVII i i' }, echo: 1.5 },
  shop: { name: 'Window Shopping', bpm: 98, key: 52, mode: 'major', calm: true,
    groove: 'lounge', bass: ['upright', 'bossa'], comp: ['nylon', 'bossa'], pad: 'organ', arp: null, lead: 'vibes', counter: 'flute', verse: 'flute',
    prog: { verse: 'Imaj7 ii7 iii7 IVmaj7', chorus: 'IVmaj7 iii7 ii7 V7', bridge: 'vi7 ii7 V7 Imaj7' }, mix: { pad: { lv: 0.45 } },
    hook: '3 . 5 . 6 5 3 . | 2 . 1 . <6 - - .' },
  victory: { name: 'Victory Lap', bpm: 112, key: 50, mode: 'major', form: ['intro', 'chorus', 'verse', 'chorus', 'final'],
    groove: 'march', bass: ['pbass', 'march'], comp: ['piano', 'pulse8'], pad: 'strings', arp: ['glock', 'up8'], lead: 'brass', counter: 'strings', verse: 'horn',
    prog: { verse: 'I IV I V', chorus: 'I IV V I', bridge: 'vi IV V V' },
    hook: '1 . 1 1 5 - - . | 4 3 4 5 >1 - - .' },
  defeat: { name: 'Lie Down', bpm: 58, key: 45, mode: 'minor', calm: true, form: ['intro', 'verse', 'break', 'verse'],
    groove: 'none', bass: ['sub', 'half'], comp: ['piano', 'block'], pad: 'strings', arp: null, lead: 'piano', counter: 'violin', verse: 'piano',
    prog: { verse: 'i bVI iv V', chorus: 'iv i V i' },
    hook: '5 - 4 - 3 - 2 - | 1 - - - - - . .' },
  /* the minigames: eight-bit, quick and bright -- not a band at all */
  minigame: { name: 'Bonus Round', bpm: 124, key: 52, mode: 'major',
    groove: 'chip', bass: ['chipBass', 'chip'], comp: ['chip25', 'stab'], pad: null, arp: ['chip', 'chip'], lead: 'chip', counter: 'chip25', verse: 'chip25',
    prog: { verse: 'I V vi IV', chorus: 'IV V iii vi', bridge: 'ii ii V V' }, room: 0.4, echo: 0.6,
    hook: '1 3 5 3 6 . 5 . | 4 3 2 3 1 - - .' },

  /* ---------------- films: quieter, more like a score */
  film:      { name: 'Once Upon a Savanna', bpm: 72, key: 43, mode: 'dorian', calm: true, groove: 'orch', bass: ['sub', 'half'], comp: ['harp', 'ostinato'], pad: 'strings', arp: null, lead: 'horn', counter: 'flute', verse: 'flute',
    prog: { verse: 'i bVII IV i', chorus: 'bIII bVII IV i' } },
  film51:    { name: 'Classified', bpm: 88, key: 41, mode: 'phrygian', calm: true, groove: 'industrial', bass: ['synbass', 'sub'], comp: ['clav', 'sparse'], pad: 'pad', arp: ['pluckSyn', 'rand16'], lead: 'theremin', counter: 'bell', verse: 'bell',
    prog: { verse: 'i bII i bII', chorus: 'bVI bVII i i' } },
  filmhome:  { name: 'Home Again', bpm: 80, key: 52, mode: 'major', calm: true, groove: 'folk', bass: ['upright', 'half'], comp: ['piano', 'ostinato'], pad: 'strings', arp: ['glock', 'sparse'], lead: 'flute', counter: 'glock', verse: 'piano',
    prog: { verse: 'I V vi IV', chorus: 'IV I V V' } },
  filmvenus: { name: 'Second Sun', bpm: 84, key: 44, mode: 'harm', calm: true, groove: 'orch', bass: ['sub', 'half'], comp: ['harp', 'ostinato'], pad: 'choir', arp: null, lead: 'violin', counter: 'choir', verse: 'harp',
    prog: { verse: 'i bVI iv V', chorus: 'i bII i V' } },
  filmmars:  { name: 'Frontier', bpm: 82, key: 47, mode: 'dorian', calm: true, swing: 0.3, groove: 'folk', bass: ['upright', 'half'], comp: ['nylon', 'strum'], pad: 'warm', arp: null, lead: 'whistle', counter: 'horn', verse: 'nylon',
    prog: { verse: 'i i bVII i', chorus: 'bVI bVII i i' } },
  filmwar:   { name: 'Call to Arms', bpm: 100, key: 40, mode: 'harm', groove: 'orch', bass: ['tuba', 'march'], comp: ['strings', 'pulse8'], pad: 'choir', arp: null, lead: 'brass', counter: 'strings', verse: 'horn',
    prog: { verse: 'i i bVI V', chorus: 'i bVI bIII V' } }
};
/* the three chapters that had no boss theme of their own now have one */
MUSIC_THEMES.boss16 = { bpm: 128, root: 43, scale: 'minor', prog: [0, 3, 5, 4], minor: true, bass: 'sawtooth', lead: 'square', drum: 'heavy', boss: true };
MUSIC_THEMES.boss17 = { bpm: 140, root: 41, scale: 'minor', prog: [0, 3, 5, 4], minor: true, bass: 'sawtooth', lead: 'square', drum: 'heavy', boss: true };
MUSIC_THEMES.boss18 = { bpm: 130, root: 50, scale: 'phrygian', prog: [0, 1, 0, 8], minor: true, bass: 'sawtooth', lead: 'square', drum: 'heavy', boss: true };
