/* The band (js/audio/02e-band-voices.js, 02f-band-songs.js, 02g-band-play.js): every song reads and plays sensible notes for
   seventy bars, every place has a song of its own, a run's music follows the fight (verse, chorus with a lead-in, breakdown between
   waves, heartbeat when nearly dead), a boss cuts in on the next beat and its last section comes at half health, the tune varies
   each time round, the stems follow the enemies, the voice cap holds, and a few songs render to sound without clipping. */
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
      [src.lead, src.counter, src.verse, src.pad, src.bass && src.bass[0], src.comp && src.comp[0], src.arp && src.arp[0]].forEach(function(i){ if (i && !BAND_DRAWN[i] && !BAND_LIVE[i]) bad.push(th + ' inst ' + i); });
      if (src.bass && !BAND_BASS[src.bass[1]] && src.bass[1] !== 'walk') bad.push(th + ' bass ' + src.bass[1]);
      if (src.comp && !BAND_COMP[src.comp[1]]) bad.push(th + ' comp ' + src.comp[1]);
      if (src.arp && !BAND_ARP[src.arp[1]]) bad.push(th + ' arp ' + src.arp[1]);
      if (src.hook && bandParseMel(src.hook).filter(Boolean).length < 4) bad.push(th + ' hook');
    }
    var S = bandState(), seen = {};
    for (var b = 0; b < 70; b++){
      bandBar(R, S, { theme: th, lvl: 1, tempo: 1, shift: 0 }, { run: false, I: 0.5 }, b * 2);
      seen[S.secName] = 1;
      S.ev.forEach(function(L){ L.forEach(function(e){
        if (e.dk){ if (!BAND_DRUMS[e.dk]) bad.push(th + ' drum ' + e.dk); return; }
        if (e.fx) return;
        if (!BAND_DRAWN[e.ins] && !BAND_LIVE[e.ins]) bad.push(th + ' plays ' + e.ins);
        (Array.isArray(e.m) ? e.m : [e.m]).forEach(function(m){ if (!isFinite(m) || m < 24 || m > 100) bad.push(th + ' ' + e.p + ' note ' + m); });
        if (!(e.len > 0) || !isFinite(e.v)) bad.push(th + ' ' + e.p + ' length');
      }); });
    }
    song.form.forEach(function(sec){ if (!seen[sec]) bad.push(th + ' never plays ' + sec); });
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
  var same0 = lead['1:0'] && lead['1:0'] === lead['2:0'], diff = false;
  for (var bb = 0; bb < 8; bb++) if (lead['1:' + bb] !== lead['2:' + bb]) diff = true;
  check('hookReturns', !!same0); check('variesNextTime', diff);
  /* the last chorus is a key higher */
  var S4 = bandState(), keys = {}; for (var b4 = 0; b4 < 60; b4++){ bandBar(R, S4, { theme: 'savanna', lvl: 1, tempo: 1, shift: 0 }, { run: false }, 0); keys[S4.secName] = S4.key; }
  check('finalKeyUp', keys.final === keys.chorus + 1);

  /* a boss cuts in on the next beat with a boom, and at half health its last section comes */
  var M = Music;
  if (M.R){
    M.S = bandState(); M.cur = null; M.step = 0;
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
  var jobs = [['savanna', 'chorus'], ['inferno', 'chorus'], ['minigame', 'chorus'], ['boss10', 'chorus'], ['moon', 'verse']], res = {};
  (function next(i){
    if (i >= jobs.length){
      out.render = res;
      check('renders', Object.keys(res).every(function(k){ return res[k].ok; }));
      out.pass = !out.failed.length; QA.done(out); return;
    }
    Band.render({ theme: jobs[i][0], bars: 4, at: function(b){ return b === 0 ? { jump: jobs[i][1] } : {}; } }).then(function(buf){
      var pk = 0, s = 0, nan = 0, d;
      for (var c = 0; c < 2; c++){ d = buf.getChannelData(c); for (var j = 0; j < d.length; j++){ var a = Math.abs(d[j]); if (a !== a) nan++; else { if (a > pk) pk = a; s += a * a; } } }
      var rms = Math.sqrt(s / (2 * buf.length));
      res[jobs[i][0]] = { pk: +pk.toFixed(3), rmsDb: +(20 * Math.log10(rms + 1e-9)).toFixed(1), ok: !nan && pk < 0.98 && rms > 0.001 };
      next(i + 1);
    }, function(e){ res[jobs[i][0]] = { err: String(e) }; next(i + 1); });
  })(0);
})();
