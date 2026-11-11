/* The band (js/audio/02e-band-voices.js, 02f-band-songs.js, 02g-band-play.js): every song reads and plays sensible notes for
   seventy bars, every place has a song of its own, a run's music follows the fight (verse, chorus with a lead-in, breakdown between
   waves, heartbeat when nearly dead), a boss cuts in on the next beat and its last section comes at half health, the tune varies
   each time round, the stems follow the enemies, the voice cap holds, and a few songs render to sound without clipping.
   And the bigger band: the giraffe's tune in every song, three keys, coloured chords the second time, bars in three, five and seven,
   a pre-chorus over a pedal, a half-time bridge with threes against fours, solos that trade and build, the hook passed round, a
   second voice that answers and harmonises, a canon, and the new instruments. */
(function(){
  var out = { failed: [] }, check = function(k, v){ if (!v) out.failed.push(k); };
  var uniq = function(v, i, a){ return a.indexOf(v) === i; };
  SFX.init(); Music.refresh();
  var oc = new OfflineAudioContext(2, 4410, 44100), R = bandRig(oc, oc.destination);

  /* every song: its tunes are two bars, its band exists, and seventy bars of it are all real notes and drums */
  var themes = Object.keys(MUSIC_THEMES).concat(Object.keys(BAND_SONGS)).filter(uniq), bad = [];
  themes.forEach(function(th){
    var song = bandSong(th), src = BAND_SONGS[th];
    ['hook', 'verseM', 'bridgeM'].forEach(function(k){ if (!song[k] || song[k].length !== 32 || !song[k].some(Boolean)) bad.push(th + ' ' + k); });
    if (src){
      if (!BAND_GROOVES[src.groove]) bad.push(th + ' groove');
      var insts = [src.lead, src.counter, src.verse, src.pad, src.bass && src.bass[0], src.comp && src.comp[0], src.arp && src.arp[0], src.solo, src.trade, src.lead2, src.drone, src.motto].concat(src.hookBy || []);
      if (src.secs) Object.keys(src.secs).forEach(function(k){ var o = src.secs[k]; insts.push(o.pad, o.lead, o.drone, o.bass && o.bass[0], o.comp && o.comp[0], o.arp && o.arp[0]); if (!BAND_SECTIONS[k]) bad.push(th + ' secs ' + k); });
      insts.forEach(function(i){ if (i && !BAND_DRAWN[i] && !BAND_LIVE[i]) bad.push(th + ' inst ' + i); });
      if (src.meter && !BAND_METERS[src.meter]) bad.push(th + ' meter'); if (src.meters) Object.keys(src.meters).forEach(function(k){ if (!BAND_METERS[src.meters[k]]) bad.push(th + ' meter ' + k); });
      if (src.bass && !BAND_BASS[src.bass[1]] && src.bass[1] !== 'walk') bad.push(th + ' bass ' + src.bass[1]);
      if (src.comp && !BAND_COMP[src.comp[1]]) bad.push(th + ' comp ' + src.comp[1]);
      if (src.arp && !BAND_ARP[src.arp[1]]) bad.push(th + ' arp ' + src.arp[1]);
      if (src.hook && bandParseMel(src.hook).filter(Boolean).length < 4) bad.push(th + ' hook');
    }
    var S = bandState(), seen = {}, motto = 0;
    for (var b = 0; b < 100; b++){
      bandBar(R, S, { theme: th, lvl: 1, tempo: 1, shift: 0 }, { run: false, I: 0.5 }, b * 2);
      seen[S.secName] = 1;
      if (S.ev.length !== S.n) bad.push(th + ' bar length');
      S.ev.forEach(function(L){ L.forEach(function(e){
        if (e.p === 'solo' && e.ins === song.mottoInst && S.secName === song.mottoIn) motto++;
        if (e.dk){ if (!BAND_DRUMS[e.dk]) bad.push(th + ' drum ' + e.dk); return; }
        if (e.fx) return;
        if (!BAND_DRAWN[e.ins] && !BAND_LIVE[e.ins]) bad.push(th + ' plays ' + e.ins);
        (Array.isArray(e.m) ? e.m : [e.m]).forEach(function(m){ if (!isFinite(m) || m < 24 || m > 100) bad.push(th + ' ' + e.p + ' note ' + m); });
        if (!(e.len > 0) || !isFinite(e.v)) bad.push(th + ' ' + e.p + ' length');
      }); });
    }
    song.form.forEach(function(sec){ if (!seen[sec]) bad.push(th + ' never plays ' + sec); });
    if (motto < 6) bad.push(th + ' no giraffe tune');
  });
  out.songs = themes.length; out.bad = bad.filter(uniq).slice(0, 12);
  check('songsRead', !bad.length);
  check('chapters', MUSIC_BY_CHAPTER.slice(1).every(function(t){ return !!BAND_SONGS[t]; }) && !!BAND_SONGS.marswar && !!BAND_SONGS.islelab);
  var bosses = 0; for (var ch = 1; ch <= 18; ch++) if (BAND_SONGS['boss' + ch] && MUSIC_THEMES['boss' + ch]) bosses++;
  out.bosses = bosses; check('bosses', bosses === 18);
  check('screens', ['menu', 'town', 'townnight', 'burrow', 'shop', 'lab', 'victory', 'defeat', 'minigame', 'film', 'film51', 'filmhome', 'filmvenus', 'filmmars', 'filmwar'].every(function(t){ return !!BAND_SONGS[t]; }));
  /* the chapters sound different from each other: no two share their drums, their lead and their chord instrument */
  var sig = MUSIC_BY_CHAPTER.slice(1).map(function(t){ var s = BAND_SONGS[t]; return s.groove + '/' + s.lead + '/' + s.comp[0]; });
  check('chaptersDiffer', sig.filter(uniq).length === sig.length);
  /* a song is long: its form outside a run is at least 48 bars before it comes round */
  var short = themes.filter(function(t){ var s = bandSong(t); return !BAND_SONGS[t] || s.boss || BAND_SONGS[t].form ? false : s.form.reduce(function(a, k){ return a + s.sections[k].bars; }, 0) < 48; });
  check('longForm', !short.length); out.short = short;

  /* a run: calm is the verse, a big fight brings the chorus (a bar early the drums roll and the riser starts), the end of a wave a
     breakdown, and nearly dead a heartbeat */
  var S = bandState(), seq = [], flags = [];
  var run = function(n, w){ for (var i = 0; i < n; i++){ bandBar(R, S, { theme: 'savanna', lvl: 1, tempo: 1, shift: 0 }, Object.assign({ run: true, I: 0.2 }, w), 0); seq.push(S.secName); var f = {}; S.ev.forEach(function(L){ L.forEach(function(e){ if (e.fx) f[e.fx] = 1; if (e.dk === 'heart') f.heart = 1; if (e.dk === 'taiko' && L === S.ev[0]) f.hit = 1; }); }); flags.push(f); } };
  run(12, { I: 0.45 }); check('runVerse', seq.indexOf('verse') >= 0);
  var at = seq.length; run(6, { I: 0.92 });
  var ci = seq.indexOf('chorus', at); check('runChorus', ci >= 0 && ci - at <= 5);
  check('riserBeforeChorus', ci > 0 && !!flags[ci - 1].riser && !!flags[ci - 1].rev);
  check('crashOnChorus', ci >= 0 && !!flags[ci].hit);
  at = seq.length; run(5, { I: 0.92, rest: true }); check('runBreak', seq.indexOf('break', at) >= 0 && seq.indexOf('break', at) - at <= 4);
  run(2, { I: 0.5, low: 0.9 }); check('heartbeat', !!flags[flags.length - 1].heart);
  run(1, { I: 0.5, low: 0 }); check('noHeart', !flags[flags.length - 1].heart);
  /* a long fight does not loop one chorus: after two comes the bridge */
  var S2 = bandState(), s2 = []; for (var i = 0; i < 40; i++){ bandBar(R, S2, { theme: 'city', lvl: 1, tempo: 1, shift: 0 }, { run: true, I: 0.95 }, 0); s2.push(S2.secName); }
  check('bridgeInFight', s2.indexOf('bridge') > 0);
  out.runSeq = seq.join(' ');

  /* the tune varies: the same chorus played a second time is not note for note the first, but it starts the same */
  var S3 = bandState(), lead = {};
  for (var b = 0; b < 120; b++){
    bandBar(R, S3, { theme: 'menu', lvl: 0, tempo: 1, shift: 0 }, { run: false }, 0);
    if (S3.secName !== 'chorus') continue;
    var k = S3.cnt.chorus + ':' + S3.secBar; lead[k] = S3.ev.map(function(L){ return L.filter(function(e){ return e.p === 'lead'; }).map(function(e){ return e.m; }).join(','); }).join('|');
  }
  /* the second time the hook is on another instrument (another register), but it is the same tune: the same steps between its notes */
  var steps = function(str){ var m = str.split(/[|,]/).filter(Boolean).map(Number); return m.slice(1).map(function(v, i){ return v - m[i]; }).join(); };
  var same0 = lead['1:0'] && lead['2:0'] && steps(lead['1:0']) === steps(lead['2:0']), diff = false;
  for (var bb = 0; bb < 8; bb++) if (lead['1:' + bb] !== lead['2:' + bb]) diff = true;
  check('hookReturns', !!same0); check('variesNextTime', diff);
  /* the form: a pre-chorus, a solo and an outro; the bridge and the last chorus in other keys (three keys in all), the last one higher */
  var S4 = bandState(), keys = {}, allKeys = {}, hooks = {}, secBars = {};
  for (var b4 = 0; b4 < 76; b4++){
    bandBar(R, S4, { theme: 'savanna', lvl: 1, tempo: 1, shift: 0 }, { run: false }, 0);
    keys[S4.secName] = S4.key; allKeys[S4.key] = 1;
    var nm = S4.secName + S4.cnt[S4.secName]; (secBars[nm] = secBars[nm] || []).push(S4.ev.map(function(L){ return L.slice(); }));
    S4.ev.forEach(function(L){ L.forEach(function(e){ if (e.p === 'lead' && S4.secName === 'chorus') hooks[S4.cnt.chorus] = e.ins; }); });
  }
  out.keys = keys;
  check('finalKeyUp', keys.final > keys.chorus);
  check('threeKeys', Object.keys(allKeys).length >= 3 && keys.bridge !== keys.chorus);
  check('formParts', !!secBars.pre1 && !!secBars.solo1 && !!secBars.outro1);
  /* the hook passed round: flute the first chorus, kalimba the second */
  out.hooks = hooks; check('hookPassed', hooks[1] === 'flute' && hooks[2] === 'kalimba');
  /* the pre-chorus's bass holds one note while the chords move */
  var pedalOk = (secBars.pre1 || []).every(function(bar){ var pcs = {}; bar.forEach(function(L){ L.forEach(function(e){ if (e.p === 'bass') pcs[e.m % 12] = 1; }); }); return Object.keys(pcs).length === 1; });
  check('pedal', !!secBars.pre1 && pedalOk);
  /* the solo trades between marimba and flute in two-bar turns and gets busier */
  var soloN = function(bar){ var n = 0, who = {}; bar.forEach(function(L){ L.forEach(function(e){ if (e.p === 'solo'){ n++; who[e.ins] = 1; } }); }); return { n: n, who: Object.keys(who).join() }; };
  var sb = (secBars.solo1 || []).map(soloN); out.solo = sb.map(function(x){ return x.who + ':' + x.n; }).join(' ');
  check('soloTrades', sb.length === 8 && sb[0].who === 'marimba' && sb[2].who === 'flute' && sb[5].n + sb[6].n > sb[0].n + sb[1].n);
  /* the bridge is in three (savanna's bridge is a 6/8 sway): twelve sixteenths to the bar */
  check('bridgeInThree', (secBars.bridge1 || []).every(function(bar){ return bar.length === 12; }) && (secBars.chorus1 || [[]])[0].length === 16);
  /* the second voice answers in the first chorus and harmonises in the second */
  var l2 = function(nm){ var n = 0; (secBars[nm] || []).forEach(function(bar){ bar.forEach(function(L){ L.forEach(function(e){ if (e.p === 'lead2') n++; }); }); }); return n; };
  out.lead2 = [l2('chorus1'), l2('chorus2')]; check('secondVoice', l2('chorus1') > 0 && l2('chorus2') > l2('chorus1'));
  /* threes against fours in the solo: the hand drum every third sixteenth, across the bar lines */
  var polyAt = []; (secBars.solo1 || []).forEach(function(bar, bi){ bar.forEach(function(L, i){ L.forEach(function(e){ if (e.dk === 'bongo') polyAt.push(bi * 16 + i); }); }); });
  check('polyrhythm', polyAt.length > 30 && polyAt.every(function(v, i){ return !i || (v - polyAt[i - 1]) % 3 === 0; }));
  /* the chords are coloured the second time round (not in the eight-bit song) */
  var col = Object.keys(BAND_SONGS).filter(function(t){ var s = bandSong(t); return s.progs2.chorus && JSON.stringify(s.progs2.chorus) !== JSON.stringify(s.progs.chorus); });
  out.coloured = col.length; check('reharm', col.length >= 40 && !bandSong('minigame').progs2.chorus);
  /* a calm song's second verse has a canon: the second voice a beat behind */
  var S5 = bandState(), canon = 0; for (var b5 = 0; b5 < 40; b5++){ bandBar(R, S5, { theme: 'menu', lvl: 0, tempo: 1, shift: 0 }, { run: false }, 0); if (S5.secName === 'verse2') S5.ev.forEach(function(L){ L.forEach(function(e){ if (e.p === 'lead2') canon++; }); }); }
  check('canon', canon > 4);
  /* bars in three, seven and five */
  var lenOf = function(th){ var S6 = bandState(); bandBar(R, S6, { theme: th, lvl: 1, tempo: 1, shift: 0 }, { run: false }, 0); return S6.ev.length; };
  out.meters = [lenOf('frost'), lenOf('islelab'), lenOf('boss12'), lenOf('city')]; check('meters', out.meters.join() === '12,14,20,16');
  /* the giraffe's tune: its own song, and between waves in a run (the first break) */
  check('longneck', !!BAND_SONGS.longneck && BAND_SONGS.longneck.hook === BAND_MOTTO.call && bandSong('longneck').mottoInst === 'soprano');
  var S7 = bandState(), runMotto = 0; for (var b7 = 0; b7 < 10; b7++){ bandBar(R, S7, { theme: 'jungle', lvl: 1, tempo: 1, shift: 0 }, { run: true, I: b7 < 5 ? 0.45 : 0.2, rest: b7 >= 5 }, 0); S7.ev.forEach(function(L){ L.forEach(function(e){ if (e.p === 'solo' && e.ins === 'soprano') runMotto++; }); }); }
  check('mottoInRun', runMotto >= 6);

  /* a boss cuts in on the next beat with a boom, and at half health its last section comes */
  var M = Music;
  if (M.R){
    M.S = bandState(); M.cur = null; M.step = 0; M.pos = 0;
    M.want = { theme: 'savanna', lvl: 1, tempo: 1, shift: 0, run: true, I: 0.5, dense: false };
    var t = 1; for (var s = 0; s < 21; s++){ M.bandTick(t); t += 0.1; }               /* a bar and five sixteenths of the chapter's song */
    M.want.theme = 'boss1'; M.want.lvl = 2;
    var cutAt = -1; for (var s5 = 0; s5 < 8; s5++){ M.bandTick(t); t += 0.1; if (M.S.theme === 'boss1' && cutAt < 0) cutAt = s5; }
    var boom = M.S.ev && M.S.ev[0].some(function(e){ return e.dk === 'boom'; });
    out.cutAt = cutAt; check('bossCut', cutAt >= 0 && cutAt <= 3); check('bossBoom', !!boom);
    M.want.lvl = 3; var fin = -1; for (var s6 = 0; s6 < 16 * 6; s6++){ M.bandTick(t); t += 0.1; if (M.S.secName === 'final' && fin < 0) fin = s6; }
    check('bossFinal', fin >= 0);
    M.want.theme = 'savanna'; M.want.lvl = 1; for (var s7 = 0; s7 < 32; s7++){ M.bandTick(t); t += 0.1; }
    check('afterBossCalm', M.S.theme === 'savanna' && M.S.secName === 'break');
  } else check('liveRig', false);

  /* the voice cap: a band out of voices skips the arpeggio but keeps the kick */
  var ends = []; for (var v = 0; v < 40; v++) ends.push(1e9);
  var fake = { offline: false, ends: ends, cap: 10, c: { currentTime: 0 }, part: {} }, threw = false;
  try { bandNote(fake, 'arp', 'marimba', 60, 0, 1, 1); bandHit(fake, 'perc', 'shaker', 0, 1); } catch (e) { threw = true; }
  check('voiceCap', !threw && fake.voices === 40);

  /* the stems: enemies close bring the bass up, a crowd the drums, and low health thins the chords */
  GR.startRun(1); G.enemies.length = 0; G.waveState = 'active';
  for (var n = 0; n < 30; n++) G.enemies.push({ x: P.x + 60 + n, y: P.y, dead: false });
  for (var f2 = 0; f2 < 240; f2++) Music.updateStems(true);
  var st = Music.stems; out.stems = { near: +st.near.toFixed(2), spike: +st.spike.toFixed(2), I: +st.I.toFixed(2) };
  check('stemsFollow', st.near > 0.8 && st.I > 0.6 && Music.S.gate.drums > 0.8 && Music.S.gate.bass > 0.9);
  P.hp = P.maxHp * 0.1; for (var f3 = 0; f3 < 120; f3++) Music.updateStems(true);
  check('lowThins', st.low > 0.8 && Music.S.gate.comp < 0.5);
  G.enemies.length = 0; P.hp = P.maxHp;
  /* the three chapters that had none now have a boss song */
  G.state = 'playing'; G.attract = false; G.bossAlive = true; G.boss = null;
  var got = []; [16, 17, 18].forEach(function(c){ G.chapter = c; Music.refresh(); got.push(Music.want.theme); });
  G.bossAlive = false; out.bossThemes = got;
  check('newBossThemes', got.join() === 'boss16,boss17,boss18');

  /* a few songs drawn to sound: real sound, no clipping, nothing broken */
  var jobs = [['savanna', 'chorus'], ['inferno', 'chorus'], ['minigame', 'chorus'], ['boss10', 'chorus'], ['moon', 'verse'], ['longneck', 'chorus'], ['city', 'chorus'], ['swamp', 'solo'], ['venus', 'solo'], ['jungle', 'break'], ['frost', 'bridge']], res = {};
  /* all at once: each song is set up in turn (so each gets the random numbers it always got) and the browser renders them side by side */
  Promise.all(jobs.map(function(jb){
    return Band.render({ theme: jb[0], bars: 4, at: function(b){ return b === 0 ? { jump: jb[1] } : {}; } }).then(function(buf){
      var pk = 0, s = 0, nan = 0, d;
      for (var c = 0; c < 2; c++){ d = buf.getChannelData(c); for (var j = 0; j < d.length; j++){ var a = Math.abs(d[j]); if (a !== a) nan++; else { if (a > pk) pk = a; s += a * a; } } }
      var rms = Math.sqrt(s / (2 * buf.length));
      res[jb[0]] = { len: +buf.duration.toFixed(1), pk: +pk.toFixed(3), rmsDb: +(20 * Math.log10(rms + 1e-9)).toFixed(1), ok: !nan && pk < 0.98 && rms > 0.001 };
    }, function(e){ res[jb[0]] = { err: String(e) }; });
  })).then(function(){
    out.render = {}; jobs.forEach(function(jb){ out.render[jb[0]] = res[jb[0]]; });
    check('renders', jobs.every(function(jb){ return res[jb[0]] && res[jb[0]].ok; }));
    out.pass = !out.failed.length; QA.done(out);
  });
})();
