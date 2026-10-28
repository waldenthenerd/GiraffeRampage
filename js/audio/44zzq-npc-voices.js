'use strict';
/* =============================================================================================================================
   44zzq-npc-voices.js  --  BABBLE. While a townsperson speaks in a dialogue card, each letter that appears can make a short pitched blip, the way
   classic role-playing games do, and every character has their own voice: Mayor Lofty is low and stately and takes his time, Dot is high and
   quick, Elder Ossi is deep and wobbly, Skye chatters in staccato. Nothing is recorded: each blip is one oscillator note from the same
   SFX.tone() everything else uses, on the same bus as the town's sounds (SFX.eventGain), so the Effects volume, Sound and mute all apply.
   HOW A VOICE WORKS  A voice (NPC_VOICES, or one made from the character's id and size for everyone not listed: small giraffes are higher) is
     f      the base pitch in Hz           wave   the oscillator shape            vol  loudness
     cps    letters per second (the rhythm; the card never takes longer than about 4.5 seconds, and a tap still skips to the end)
     cons   a blip on every Nth consonant, besides every vowel (so words fall into syllables: "Mayor" is two, "Longneck" is two)
     dur    how long a blip lasts           glide  the pitch's slide inside a blip (below 1 falls, above 1 rises)
     wob    random pitch wander, in semitones, per blip       swing  alternate long and short blips (0 = even)
     pause  extra wait after a comma or colon, ms     end  extra wait after . ? or !, ms     lift  how far a question rises at its end, in semitones
   Vowels pick the pitch (a, e, i, o, u each sit on their own step above or below the base), so the same words always sound the same for the same
   person. A question rises at its end, a full stop falls a little, and an exclamation is louder. The typewriter in 44x-town-ui.js is taken over
   for the speaker (townSay is wrapped), and falls back to it, unchanged and silent, when "NPC voices" is off in Settings or the speaker has no face
   (a sign, the fountain, "A passer-by"). A tap or key still finishes the card at once (townDlgFinish clears the same timer).
   ============================================================================================================================= */
const NPC_VOICES = {
  mayor:    { f: 104, wave: 'square',   vol: 0.034, cps: 22, cons: 3, dur: 0.095, glide: 0.97, wob: 1.2, swing: 0.15, pause: 240, end: 420, lift: 2 },      /* deep, even, pompous */
  tilly:    { f: 330, wave: 'triangle', vol: 0.06,  cps: 40, cons: 2, dur: 0.06,  glide: 1.04, wob: 3.2, swing: 0.1,  pause: 160, end: 260, lift: 4 },      /* quick and dramatic */
  barnaby:  { f: 188, wave: 'sawtooth', vol: 0.02,  cps: 34, cons: 2, dur: 0.07,  glide: 0.94, wob: 2.0, swing: 0.3,  pause: 190, end: 300, lift: 3 },      /* gruff, hurried, a salesman's lilt */
  penny:    { f: 392, wave: 'sine',     vol: 0.07,  cps: 36, cons: 2, dur: 0.075, glide: 1.02, wob: 2.4, swing: 0,    pause: 170, end: 300, lift: 3 },      /* warm and bright */
  rio:      { f: 158, wave: 'triangle', vol: 0.065, cps: 26, cons: 3, dur: 0.09,  glide: 1.0,  wob: 1.4, swing: 0.1,  pause: 220, end: 380, lift: 2 },      /* easy-going drawl */
  gus:      { f: 262, wave: 'square',   vol: 0.026, cps: 46, cons: 2, dur: 0.05,  glide: 1.0,  wob: 2.6, swing: 0.45, pause: 130, end: 220, lift: 4 },      /* bouncy, swung like a dance */
  marina:   { f: 224, wave: 'sine',     vol: 0.075, cps: 28, cons: 3, dur: 0.11,  glide: 0.98, wob: 2.8, swing: 0.05, pause: 240, end: 400, lift: 3 },      /* slow and rolling */
  skye:     { f: 430, wave: 'square',   vol: 0.02,  cps: 54, cons: 1, dur: 0.038, glide: 1.1,  wob: 3.6, swing: 0.2,  pause: 100, end: 180, lift: 5 },      /* staccato chatter */
  nova:     { f: 296, wave: 'sine',     vol: 0.08,  cps: 20, cons: 4, dur: 0.14,  glide: 1.03, wob: 4.2, swing: 0,    pause: 300, end: 520, lift: 3 },      /* dreamy, drifting */
  ossi:     { f: 86,  wave: 'triangle', vol: 0.085, cps: 16, cons: 4, dur: 0.15,  glide: 0.9,  wob: 3.4, swing: 0.2,  pause: 340, end: 560, lift: 1 },      /* very deep, slow, wobbly */
  dot:      { f: 640, wave: 'square',   vol: 0.018, cps: 58, cons: 1, dur: 0.032, glide: 1.08, wob: 5.0, swing: 0.35, pause: 90,  end: 150, lift: 6 }       /* a very small, very fast, high voice */
};
const NPC_VOWEL = { a: 0, e: 2, i: 4, o: -2, u: -4, y: 3 };
const NPC_WAVES = ['triangle', 'square', 'sine', 'sawtooth'];
const NPC_MAX_SECONDS = 4.5, NPC_GAIN = 1.3;                                                  /* NPC_GAIN: overall loudness of all the voices together */
const _npcVoiceCache = {};
function npcHash(s){ let h = 2166136261; for (let i = 0; i < s.length; i++){ h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return (h >>> 0); }
function npcRand(h, k){ const v = Math.sin((h + k * 7919) * 12.9898) * 43758.5453; return v - Math.floor(v); }
/* the voice of a speaker: the table above, or one made from who they are (their id fixes it; a smaller giraffe has a higher voice) */
function npcVoiceFor(npc){
  if (!npc) return null;
  const id = npc.id || npc.name || '?'; if (_npcVoiceCache[id]) return _npcVoiceCache[id];
  let v = NPC_VOICES[id];
  if (!v){
    const h = npcHash(String(id)), s = npc.look && npc.look.s ? npc.look.s : 1, wave = NPC_WAVES[Math.floor(npcRand(h, 1) * 4)];
    v = { f: Math.max(80, Math.min(680, (210 / Math.pow(s, 2.4)) * (0.72 + npcRand(h, 2) * 0.6))), wave: wave, vol: wave === 'sine' ? 0.07 : wave === 'triangle' ? 0.06 : 0.022,
      cps: 22 + Math.floor(npcRand(h, 3) * 30), cons: 1 + Math.floor(npcRand(h, 4) * 4), dur: 0.04 + npcRand(h, 5) * 0.09, glide: 0.92 + npcRand(h, 6) * 0.18,
      wob: 1 + npcRand(h, 7) * 3.5, swing: npcRand(h, 8) * 0.4, pause: 120 + Math.floor(npcRand(h, 9) * 160), end: 220 + Math.floor(npcRand(h, 10) * 260), lift: 2 + Math.floor(npcRand(h, 11) * 4) };
  }
  return (_npcVoiceCache[id] = v);
}
const NPCVoice = {
  st: null, blips: 0,
  on(){ return Settings.npcVoice !== false; },
  /* one blip of voice v for the letter ch at position i of text, with the sentence shaping applied */
  blip(v, ch, i, text, n){
    let semi = (NPC_VOWEL[ch.toLowerCase()] !== undefined ? NPC_VOWEL[ch.toLowerCase()] : ((ch.charCodeAt(0) % 5) - 2)) + (Math.random() * 2 - 1) * v.wob;
    let vol = v.vol, j = i; while (j < text.length && !/[.?!]/.test(text[j])) j++;
    const left = j - i, term = text[j] || '';
    if (term === '?' && left < 14) semi += v.lift * (1 - left / 14);                         /* a question rises toward its end */
    else if (term === '.' && left < 6) semi -= 1.5 * (1 - left / 6);                         /* a statement settles */
    else if (term === '!' && left < 8) vol *= 1.3;                                           /* an exclamation is louder */
    const f = v.f * Math.pow(2, semi / 12), len = v.dur * (1 + (n % 2 ? v.swing : -v.swing));
    SFX.tone(v.wave, f, f * v.glide, Math.max(0.02, len), vol * NPC_GAIN, 0, 0, SFX.eventGain);
    this.blips++;
  },
  start(speaker){
    if (!speaker || !speaker.npc || !this.on() || !_dlgOpen) { this.st = null; return false; }
    const v = npcVoiceFor(speaker.npc); if (!v) return false;
    if (_dlgTimer) clearInterval(_dlgTimer);
    this.st = { v: v, text: _dlgFull, i: 0, acc: 0, hold: 0, cons: 0, since: 9, n: 0, cps: Math.max(v.cps, _dlgFull.length / NPC_MAX_SECONDS) };
    const self = this;
    _dlgTimer = setInterval(function(){ self.tick(16); }, 16);
    return true;
  },
  /* advance the card by ms: reveal letters at the voice's rhythm, blip on vowels and every Nth consonant, wait at punctuation */
  tick(ms){
    const s = this.st; if (!s || !_dlg) return;
    const tx = _dlg.querySelector('.tdl-text');
    s.hold -= ms; if (s.hold > 0) return;
    s.acc += ms / 1000 * s.cps;
    while (s.acc >= 1 && s.i < s.text.length){
      s.acc -= 1; const ch = s.text[s.i++];
      if (/[A-Za-z]/.test(ch)){
        s.since++; const vowel = /[aeiouyAEIOUY]/.test(ch);
        if (vowel ? s.since >= 2 : (++s.cons % s.v.cons === 0 && s.since >= 3)){ this.blip(s.v, ch, s.i - 1, s.text, s.n++); s.since = 0; }
      } else if (/[,;:]/.test(ch)){ s.hold = s.v.pause; s.since = 9; break; }
      else if (/[.?!]/.test(ch)){ s.hold = s.v.end; s.since = 9; break; }
      else if (ch === ' ') s.since = Math.max(s.since, 1);
    }
    tx.textContent = s.text.slice(0, s.i);
    if (s.i >= s.text.length){ this.st = null; townDlgFinish(); }
  },
  /* a short sample of someone's voice, for the Settings toggle (all the notes are scheduled at once, so no timer is needed) */
  demo(id){
    const npc = (typeof TOWN_NPCS !== 'undefined' && TOWN_NPCS[id]) || { id: id }, v = npcVoiceFor(npc), text = 'Hello there, friend!';
    let t = 0, n = 0;
    for (let i = 0; i < text.length; i++){
      const ch = text[i]; if (!/[aeiouy]/i.test(ch)) continue;
      const semi = NPC_VOWEL[ch.toLowerCase()] + (i > 12 ? v.lift * 0.4 : 0), f = v.f * Math.pow(2, semi / 12);
      SFX.tone(v.wave, f, f * v.glide, v.dur, v.vol * NPC_GAIN, t, 0, SFX.eventGain); t += 0.2 / (v.cps / 30) * (n++ % 2 ? 1 + v.swing : 1 - v.swing);
    }
  }
};
(function(){
  const base = townSay;
  townSay = function(speaker, choices){
    const r = base.apply(this, arguments);
    try { NPCVoice.start(speaker); } catch (e) { NPCVoice.st = null; }
    return r;
  };
  const close = townCloseDialog, fin = townDlgFinish;
  townCloseDialog = function(){ NPCVoice.st = null; return close.apply(this, arguments); };
  townDlgFinish = function(){ NPCVoice.st = null; return fin.apply(this, arguments); };                 /* a tap or key skips: the blips stop with the letters */
})();
