'use strict';
/* ========================= 44zzzz. THE JUKEBOX AND THE SONG CARD ========================= */
/* Every song of the band (js/audio/02f-band-songs.js) is remembered the first time it plays (Save.data.songsHeard), and the jukebox in
   Penny's Café (Market Street) plays any song heard so far: the chapters, the bosses, the town, the screens and the films, each with
   where it is heard, and the ones not heard yet as a blank record with a clue. It plays while she is in the café and stops when she
   leaves. The giraffe's tune is a part of the songs, not a record of its own, so 'longneck' is not on it.
   The song card: when the music changes outside a fight (the menus, the town, the shops, the end of a run), the song's name and where it
   belongs show for a few seconds in a corner (Settings.songNames turns it off). */

/* ---- the records, in the order the jukebox lists them ---- */
function jbCatalog(){
  if (jbCatalog.list) return jbCatalog.list;
  const L = [], ch = function(c){ return 'Chapter ' + chapterLabel(c) + ' · ' + BESTIARY_CHAPTERS[c - 1]; };
  for (let c = 1; c < MUSIC_BY_CHAPTER.length; c++){
    L.push({ id: MUSIC_BY_CHAPTER[c], g: 'Chapters', where: ch(c) });
    if (MUSIC_BY_CHAPTER[c] === 'mars') L.push({ id: 'marswar', g: 'Chapters', where: ch(c) + ', the war' });
    if (MUSIC_BY_CHAPTER[c] === 'isle') L.push({ id: 'islelab', g: 'Chapters', where: ch(c) + ', inside the lab' });
  }
  for (let c = 1; c < MUSIC_BY_CHAPTER.length; c++) L.push({ id: 'boss' + c, g: 'Bosses', where: 'The boss of ' + ch(c) });
  L.push({ id: 'town', g: 'Longneck Town', where: 'Longneck Town by day' }, { id: 'townnight', g: 'Longneck Town', where: 'Longneck Town at night' }, { id: 'burrow', g: 'Longneck Town', where: 'The Burrows' });
  L.push({ id: 'menu', g: 'Menus and screens', where: 'The main menu' }, { id: 'shop', g: 'Menus and screens', where: 'The shops' }, { id: 'lab', g: 'Menus and screens', where: 'The lab' },
    { id: 'victory', g: 'Menus and screens', where: 'A chapter won' }, { id: 'defeat', g: 'Menus and screens', where: 'A run lost' }, { id: 'minigame', g: 'Menus and screens', where: 'The minigames' });
  L.push({ id: 'film', g: 'Films', where: 'The opening film' }, { id: 'film51', g: 'Films', where: 'The Area 51 films' }, { id: 'filmhome', g: 'Films', where: 'The flights home' },
    { id: 'filmvenus', g: 'Films', where: 'The Venus films' }, { id: 'filmmars', g: 'Films', where: 'The Mars films' }, { id: 'filmwar', g: 'Films', where: 'The battle films' });
  return (jbCatalog.list = L.filter(function(r){ return BAND_SONGS[r.id] && r.id !== 'longneck'; }));
}
function jbWhere(id){ const r = jbCatalog().find(function(x){ return x.id === id; }); return r ? r.where : ''; }
/* the songs heard so far. An older save, from before songs were remembered, starts with what its progress must have played */
function jbHeard(){
  const d = Save.data; if (!d) return {};
  if (!d.songsHeard){
    const h = { menu: 1 };
    for (let c = 1; c < MUSIC_BY_CHAPTER.length; c++) if (d['chapter' + c + 'Complete']){ h[MUSIC_BY_CHAPTER[c]] = 1; h['boss' + c] = 1; h.victory = 1; }
    if ((d.runs | 0) > 0){ h[MUSIC_BY_CHAPTER[1]] = 1; h.defeat = 1; }
    if (d.town && typeof d.town === 'object' && Object.keys(d.town).length) h.town = 1;
    d.songsHeard = h;
  }
  return d.songsHeard;
}
function jbHeardCount(){ const h = jbHeard(); return jbCatalog().filter(function(r){ return h[r.id]; }).length; }
/* a song starts playing for real (not a recording for the music lab or a test): remember it, and show its card */
function jbOnSong(theme){
  if (!BAND_SONGS[theme] || theme === 'longneck') return;
  const h = jbHeard();
  if (!h[theme] && jbCatalog().some(function(r){ return r.id === theme; })){ h[theme] = 1; try { Save.write(); } catch (e) {} if (Town.on && Town.d === 'in_cafe') Jukebox.fresh = true; }
  songCard(theme);
}
const bandBarBeforeJukebox = bandBar;
bandBar = function(R, S, cur){
  const was = S.theme;
  bandBarBeforeJukebox.apply(this, arguments);
  if (!R.offline && S.theme !== was) jbOnSong(S.theme);
};

/* ---- the song card ---- */
function songCard(theme){
  if (typeof Settings !== 'undefined' && Settings.songNames === false) return;
  const s = G.state;
  if (['playing', 'paused', 'levelup', 'transform', 'chaptertrans', 'cutscene', 'mini', 'miniask', 'scout', 'mscout', 'forage', 'fly'].indexOf(s) >= 0 && !G.attract) return;   /* not in a fight, a film or a minigame */
  if (Settings.muted || !(Settings.musicVol > 0)) return;
  if (typeof Town !== 'undefined' && Town.on && Town.panel) return;          /* a town panel is open (the jukebox's own list says what is playing) */
  const song = BAND_SONGS[theme]; if (!song) return;
  const now = performance.now(); songCard.seen = songCard.seen || {};
  if (now - (songCard.seen[theme] || -1e9) < 90000) return;                   /* back and forth between two screens: once is enough */
  songCard.seen[theme] = now;
  try {
    let el = document.getElementById('songCard');
    if (!el){ el = document.createElement('div'); el.id = 'songCard'; el.setAttribute('aria-live', 'polite'); document.body.appendChild(el); }
    el.innerHTML = '<i>♪</i><span><b></b><small></small></span>';
    el.querySelector('b').textContent = song.name; el.querySelector('small').textContent = jbWhere(theme) || (theme === 'longneck' ? 'The giraffe’s tune' : '');
    el.classList.add('on');
    clearTimeout(songCard.t); songCard.t = setTimeout(function(){ el.classList.remove('on'); }, 4200);
  } catch (e) {}
}

/* ---- the jukebox: what it is playing, and the music while she is in the café ---- */
const Jukebox = { on: null, fresh: false };
const musicBeforeJukebox = Music.refresh;
Music.refresh = function(){
  musicBeforeJukebox.apply(this, arguments);
  if (!Jukebox.on) return;
  const inCafe = typeof Town !== 'undefined' && Town.on && Town.d === 'in_cafe' && /^(town|townnight|burrow)$/.test(this.want.theme);
  if (!inCafe){ if (!(Town.on && Town.d === 'in_cafe')) Jukebox.on = null; return; }      /* she left: the record stops */
  const w = this.want; w.theme = Jukebox.on; w.lvl = 1; w.shift = 0; w.run = false; w.rest = false;
};
function jukeboxPlay(id){
  if (!id){ Jukebox.on = null; SFX.click(); townShowJukebox(); return; }
  if (!jbHeard()[id]){ SFX.deny(); return; }
  Jukebox.on = id; SFX.pick();
  try { Music.refresh(); } catch (e) {}
  townShowJukebox();
}
function townShowJukebox(){
  const h = jbHeard(), L = jbCatalog(), n = jbHeardCount();
  let html = '<div class="tp-title">JUKEBOX</div><div class="jb-count">' + n + ' of ' + L.length + ' records' + (n >= L.length ? ' — every one!' : '') + '</div>' +
    '<div class="jb-bar"><i style="width:' + Math.round(n / L.length * 100) + '%"></i></div>';
  let g = '';
  L.forEach(function(r, i){
    if (r.g !== g){ g = r.g; html += '<div class="jb-g">' + g + '</div>'; }
    const got = !!h[r.id], playing = Jukebox.on === r.id;
    html += '<div class="jb-r' + (got ? '' : ' off') + (playing ? ' on' : '') + '"><span class="jb-disc"></span><span class="jb-n"><b>' + (got ? BAND_SONGS[r.id].name : '? ? ?') + '</b><small>' + (got ? r.where : 'Not heard yet — ' + r.where.charAt(0).toLowerCase() + r.where.slice(1)) + '</small></span>' +
      (got ? '<button class="jb-p" data-a="town-juke-' + i + '">' + (playing ? '♪ On' : 'Play') + '</button>' : '<span class="jb-p jb-lock">—</span>') + '</div>';
  });
  html += '<div class="tnote">A song joins the jukebox the first time she hears it. It plays while she is in the café.</div>';
  html += Jukebox.on ? '<div class="tp-foot" style="margin-top:8px"><button class="tbtn" data-a="town-juke-stop">Stop the record</button></div>' : '';
  townPanelT('juke', html, { w: 600 });
  Jukebox.fresh = false;
}
(function(){
  const h = handleTownAction;
  handleTownAction = function(a){
    if (a === 'town-juke-stop'){ jukeboxPlay(null); return true; }
    const m = /^town-juke-(\d+)$/.exec(a);
    if (m){ const r = jbCatalog()[+m[1]]; if (r) jukeboxPlay(r.id); return true; }
    return h(a);
  };
  /* the jukebox stands between the corner table and the bar, under the menu board */
  const cafe = TOWN_DIST.in_cafe;
  if (cafe && !cafe.b.some(function(b){ return b.id === 'jukebox'; })) cafe.b.push({ id: 'jukebox', kind: 'jukebox', x: 745, w: 76, h: 150, label: 'The jukebox', act: 'jukebox' });
  const tu = townUse;
  townUse = function(o){ if (o && o.k === 'b' && o.b.act === 'jukebox'){ SFX.click(); townShowJukebox(); return; } return tu.apply(this, arguments); };
  const rl = townRelabel;
  townRelabel = function(o, D){ rl(o, D); if (o.k === 'b' && o.b.act === 'jukebox') o.label = 'Play the jukebox' + (Jukebox.fresh ? ' (a new record!)' : ''); };
  /* the cabinet: painted once with the room (a wooden arch, the glass dome, the grille, the record rack behind the glass) */
  IV_KINDS.jukebox = function(c, D, b){
    const x = b.x, W = b.w, H = b.h, top = TG - H;
    ivShadow(c, x, W + 12);
    tRect(c, '#4A2A18', x - W / 2, top + 30, W, H - 30);                                           /* the body stands on the floor */
    c.fillStyle = '#6A3A1E'; c.beginPath(); c.moveTo(x - W / 2, top + 32); c.arc(x, top + 32, W / 2, Math.PI, 0); c.closePath(); c.fill();   /* the arch */
    c.fillStyle = '#2A1810'; c.beginPath(); c.moveTo(x - W / 2 + 8, top + 34); c.arc(x, top + 34, W / 2 - 8, Math.PI, 0); c.closePath(); c.fill();
    tRect(c, '#1A1418', x - W / 2 + 10, top + 44, W - 20, 34);                                     /* the window onto the records */
    for (let i = 0; i < 6; i++) tRect(c, i % 2 ? '#3A3440' : '#2A2430', x - W / 2 + 14 + i * 8, top + 48, 6, 26);
    tRect(c, '#C9A24A', x - W / 2 + 6, top + 82, W - 12, 6);                                      /* chrome trim and the grille */
    tRound(c, '#3A2214', x - W / 2 + 10, top + 94, W - 20, H - 116, 6);
    c.strokeStyle = 'rgba(201,162,74,.55)'; c.lineWidth = 2; for (let y = top + 100; y < TG - 26; y += 7){ c.beginPath(); c.moveTo(x - W / 2 + 14, y); c.lineTo(x + W / 2 - 14, y); c.stroke(); }
    tRect(c, '#C9A24A', x - W / 2 - 2, TG - 14, W + 4, 6); tRect(c, '#2A1810', x - W / 2 + 4, TG - 8, 10, 8); tRect(c, '#2A1810', x + W / 2 - 14, TG - 8, 10, 8);   /* the plinth and feet */
    tCircle(c, '#E8C96A', x - 14, top + 92 + 0.5, 3); tCircle(c, '#E8C96A', x + 14, top + 92 + 0.5, 3);
  };
  /* what moves: the bubble tubes glow and climb up the sides, and notes rise while a record plays */
  const dy = townDynamic;
  townDynamic = function(ctx, D, t, dark){
    dy.apply(this, arguments);
    if (D.id !== 'in_cafe') return;
    const x = 745, W = 76, H = 150, top = TG - H, on = !!Jukebox.on;
    const hue = function(k){ return ['#FF5A7A', '#FFB84D', '#7AE0FF', '#B48CFF'][(Math.floor(t * (on ? 1.6 : 0.4)) + k) % 4]; };
    ctx.save();
    ctx.globalAlpha = on ? 0.95 : 0.6;
    [-1, 1].forEach(function(sd, k){
      const tx = x + sd * (W / 2 - 4);
      ctx.fillStyle = hue(k); ctx.fillRect(tx - 3, top + 34, 6, H - 50);
      for (let i = 0; i < 4; i++){ const a = (t * (on ? 0.7 : 0.25) + i * 0.25 + k * 0.1) % 1; tCircle(ctx, 'rgba(255,255,255,.75)', tx, TG - 18 - a * (H - 56), 1.8); }
    });
    ctx.fillStyle = hue(2); ctx.globalAlpha = on ? 0.55 + 0.25 * Math.sin(t * 6) : 0.3; ctx.beginPath(); ctx.arc(x, top + 32, W / 2 - 2, Math.PI, 0); ctx.lineTo(x + W / 2 - 8, top + 34); ctx.arc(x, top + 34, W / 2 - 8, 0, Math.PI, true); ctx.closePath(); ctx.fill();
    if (on){
      ctx.globalAlpha = 1;
      for (let i = 0; i < 3; i++){
        const a = (t * 0.35 + i / 3) % 1, nx = x + 18 + Math.sin(a * 6 + i) * 14 + a * 40, ny = top + 10 - a * 90;
        ctx.globalAlpha = Math.min(1, (1 - a) * 1.6); ctx.fillStyle = '#FFE9A8'; ctx.font = 'bold ' + (16 + i * 2) + 'px system-ui'; ctx.textAlign = 'center'; ctx.fillText(i % 2 ? '♫' : '♪', nx, ny);
      }
    }
    ctx.restore();
  };
})();
