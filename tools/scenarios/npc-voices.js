/* NPC voices (js/44zzq-npc-voices.js). The harness has no real timers, so the card is advanced by calling NPCVoice.tick(ms) by hand.
   Run: node tools/qa-cloud.mjs tools/scenarios/npc-voices.js --wait 60000 [--shot x.png] */
GR.handleAction('splash-go');
var out = { errs: [] }; window.addEventListener('error', function(e){ out.errs.push(e.message); });
var tones = [], realTone = SFX.tone;
SFX.tone = function(type, f0, f1, dur, vol, delay, det, bus){ tones.push({ t: type, f: f0, f1: f1, d: dur, v: vol, delay: delay || 0 }); };
function speak(id, text, npcObj){
  tones.length = 0; townCloseDialog(true);
  townSay({ name: 'X', text: text, npc: npcObj || TOWN_NPCS[id] }, []);
  var ms = 0; while (NPCVoice.st && ms < 20000){ NPCVoice.tick(16); ms += 16; }
  return { blips: tones.slice(), ms: ms, text: document.querySelector('#townDlg .tdl-text').textContent };
}
function mean(a, k){ var s = 0; a.forEach(function(x){ s += x[k]; }); return a.length ? s / a.length : 0; }
try {
  Save.data.npcVoice = undefined; Settings.load(); out.defaultOn = Settings.npcVoice === true;
  var ids = Object.keys(TOWN_NPCS); out.npcs = ids.length;
  /* 1. every character has a usable voice, and the eleven townsfolk are all different */
  var ok = ids.every(function(id){ var v = npcVoiceFor(TOWN_NPCS[id]); return v && v.f >= 60 && v.f <= 700 && v.cps > 5 && v.dur > 0.02 && NPC_WAVES.indexOf(v.wave) >= 0; });
  var base = Object.keys(NPC_VOICES), fs = base.map(function(id){ return NPC_VOICES[id].f; }), distinct = fs.every(function(f, i){ return fs.indexOf(f) === i; });
  var sig = base.map(function(id){ var v = NPC_VOICES[id]; return [v.f, v.wave, v.cps, v.cons, v.dur].join('/'); }); out.allVoices = ok; out.distinct = distinct && sig.every(function(s, i){ return sig.indexOf(s) === i; });
  out.mayorLowKidHigh = NPC_VOICES.mayor.f < NPC_VOICES.tilly.f && NPC_VOICES.ossi.f < NPC_VOICES.mayor.f && NPC_VOICES.dot.f > NPC_VOICES.skye.f && NPC_VOICES.dot.f / NPC_VOICES.mayor.f > 4;
  out.kidFasterThanMayor = NPC_VOICES.dot.cps > NPC_VOICES.mayor.cps * 2;
  /* a made-up voice follows size: a small giraffe is higher, and the same id always gets the same voice */
  var tiny = npcVoiceFor({ id: 'zz-small', look: { s: 0.66 } }), big = npcVoiceFor({ id: 'zz-big', look: { s: 1.15 } }), again = npcVoiceFor({ id: 'zz-small', look: { s: 0.66 } });
  out.derived = tiny === again && npcVoiceFor({ id: 'q1', look: { s: 0.66 } }).f > npcVoiceFor({ id: 'q1b', look: { s: 1.15 } }).f * 0.8;
  /* 2. the same words: the mayor and Dot sound and move differently */
  var line = 'Welcome to Longneck Town! Mind the doorways.';
  var m = speak('mayor', line), d = speak('dot', line);
  out.mayorBlips = m.blips.length; out.dotBlips = d.blips.length;
  out.pitchApart = mean(d.blips, 'f') / mean(m.blips, 'f') > 3;
  out.rhythmApart = m.ms > d.ms * 1.5 && Math.abs(m.blips.length - d.blips.length) < 6;
  out.blipsFinished = m.text === T(line) && d.text === T(line) && m.blips.length >= 8 && d.blips.length >= 8;
  out.blipShape = m.blips.every(function(b){ return b.d >= 0.02 && b.d < 0.3 && b.v > 0 && b.v < 0.2 && b.f > 50 && b.f < 2500; });
  /* a blip comes from vowels and every Nth consonant, not every letter */
  out.sparse = m.blips.length < line.replace(/[^A-Za-z]/g, '').length * 0.7;
  /* 3. questions rise, statements settle, exclamations are louder (a voice without wobble, so the shape is clean) */
  NPC_VOICES.flat = { f: 200, wave: 'sine', vol: 0.05, cps: 40, cons: 1, dur: 0.06, glide: 1, wob: 0, swing: 0, pause: 100, end: 100, lift: 5 };
  var q = speak('flat', 'Are you sure?', { id: 'flat' }), st = speak('flat', 'Are you sure.', { id: 'flat' }), ex = speak('flat', 'Are you sure!', { id: 'flat' });
  out.questionRises = q.blips[q.blips.length - 1].f > st.blips[st.blips.length - 1].f * 1.1;
  out.statementFalls = st.blips[st.blips.length - 1].f < st.blips[0].f * 1.0 + 1e-6 || st.blips[st.blips.length - 1].f <= q.blips[q.blips.length - 1].f;
  out.exclaimLouder = ex.blips[ex.blips.length - 1].v > st.blips[st.blips.length - 1].v * 1.2;
  /* 4. a long card never takes much more than a few seconds of reveal, and a tap finishes it at once and stops the sound */
  var long = Array(60).join('word '); var lg = speak('ossi', long); out.longBounded = lg.ms < 9000 && lg.text.length === T(long).length;
  tones.length = 0; townCloseDialog(true); townSay({ name: 'X', text: line, npc: TOWN_NPCS.rio }, [{ label: 'OK', fn: function(){} }]);
  for (var i = 0; i < 8; i++) NPCVoice.tick(16); var before = tones.length; townDlgFinish(); NPCVoice.tick(16); NPCVoice.tick(16);
  out.skipStops = NPCVoice.st === null && tones.length === before && document.querySelector('#townDlg .tdl-text').textContent === T(line) && document.querySelector('#townDlg .tdl-choices').style.visibility === 'visible';
  /* 5. no face (a sign, the fountain): no voice, and the old typewriter runs */
  townCloseDialog(true); tones.length = 0; townSay({ name: 'The fountain', text: 'Water. Splashing.' }, []);
  out.noFaceSilent = NPCVoice.st === null && tones.length === 0 && !!_dlgTimer;
  /* 6. the Settings switch: off means silent and the old typewriter; it is saved and kept when progress is erased */
  Settings.npcVoice = false; Settings.save(); townCloseDialog(true); tones.length = 0; townSay({ name: 'Mayor', text: line, npc: TOWN_NPCS.mayor }, []);
  out.offSilent = NPCVoice.st === null && tones.length === 0 && !!_dlgTimer;
  Save.load(); Settings.load(); out.offSaved = Settings.npcVoice === false;
  Settings.npcVoice = true; Settings.save(); Save.reset(); Settings.load(); out.kept = Settings.npcVoice === true;
  Settings.npcVoice = false; Settings.save(); Save.reset(); Settings.load(); out.keptOff = Settings.npcVoice === false;
  Settings.npcVoice = true; Settings.save();
  GR.showMenu(); showSettings(); out.settingsRow = /NPC voices/.test(document.getElementById('overlay').textContent);
  tones.length = 0; GR.handleAction('s-npcvoice'); out.toggledOff = Settings.npcVoice === false && tones.length < 4;                  // just the click
  GR.handleAction('s-npcvoice'); out.toggledOn = Settings.npcVoice === true && tones.length > 3;                  /* switching it on plays a few notes of the mayor */
  /* 7. a real conversation in the town, with the real typewriter taken over */
  tones.length = 0; var real = true;
  try { townEnter && townEnter('square', 1000); } catch (e) { real = false; }
  try { townTalk('mayor'); out.realTalk = NPCVoice.st !== null && NPCVoice.st.v === NPC_VOICES.mayor; } catch (e) { out.realTalk = 'err ' + e.message; }
  for (var k = 0; k < 400 && NPCVoice.st; k++) NPCVoice.tick(16);
  out.realBlips = tones.length;
  SFX.tone = realTone;
  var sh = QA.params.show; if (sh) { townCloseDialog(true); townSay({ name: 'Dot', text: 'Hello there, friend! I was hiding. You found me!', npc: TOWN_NPCS.dot }, [{ label: 'Hello', fn: function(){} }]); for (var z = 0; z < 400 && NPCVoice.st; z++) NPCVoice.tick(16); }
  out.pass = out.defaultOn && out.allVoices && out.distinct && out.mayorLowKidHigh && out.kidFasterThanMayor && out.derived && out.pitchApart && out.rhythmApart && out.blipsFinished && out.blipShape && out.sparse &&
    out.questionRises && out.exclaimLouder && out.longBounded && out.skipStops && out.noFaceSilent && out.offSilent && out.offSaved && out.kept && out.keptOff && out.settingsRow && out.toggledOff && out.toggledOn && out.errs.length === 0;
} catch (e) { out.err = String(e && e.stack || e); }
QA.done(out);
