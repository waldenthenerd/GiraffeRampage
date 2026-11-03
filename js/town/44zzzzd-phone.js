'use strict';
/* ========================= 44zzzzd. THE PEEP PHONE AND THE EARBUDS ========================= */
/* The phone (bought at Volt & Co., js/town/44zzzzc-gadgets.js) opens in town with P or the Phone button. It is an interface and makes no sound: its Music app
   chooses a record from the jukebox's list (every song she has heard), and the EARBUDS are what play it. Apps by tier:
     1  Music, Mail, News, Blocks (falling blocks)      2  + Run (start a run from anywhere in town) and Photo      3  + Neck Snake and Scores
   Earbuds (Pods) play the chosen song in town; Pods Plus also in the menus and in runs, over the chapter's music (the song's loudness follows the run as it
   does for the chapter's own music); Pods Max can shuffle through every record she has heard. They are off in films and minigames, where the music is the
   picture's, and the café jukebox wins while it plays. The games run on their own timer while their canvas is on screen and stop when it is not. */
const PH = { game: null, raf: 0, shuf: { id: '', at: 0 } };

/* ---- what plays ---- */
function phHeardList(){ const h = jbHeard(); return jbCatalog().filter(function(r){ return h[r.id] && BAND_SONGS[r.id]; }); }
function phSongNow(){
  const g = gadData(); if (!gadOn('buds')) return '';
  if (g.mode === 'shuffle' && gadTier('buds') >= 3){
    const list = phHeardList(), now = performance.now();
    if (list.length && (!PH.shuf.id || now > PH.shuf.at || !list.some(function(r){ return r.id === PH.shuf.id; }))){
      let n = list[Math.floor(Math.random() * list.length)].id; if (list.length > 1 && n === PH.shuf.id) n = list[(list.findIndex(function(r){ return r.id === n; }) + 1) % list.length].id;
      PH.shuf.id = n; PH.shuf.at = now + 100000;
    }
    return PH.shuf.id;
  }
  return g.song && BAND_SONGS[g.song] && jbHeard()[g.song] ? g.song : '';
}
function phBudsPlay(){                                 /* may the earbuds be playing right now? */
  if (!gadOn('buds')) return false;
  const s = G.state, tier = gadTier('buds');
  if (typeof Jukebox !== 'undefined' && Jukebox.on) return false;
  if (G.attract || ['cutscene', 'mini', 'miniask', 'fly', 'forage', 'scout', 'mscout', 'chaptertrans', 'transform'].indexOf(s) >= 0) return false;
  if (s === 'town') return true;
  return tier >= 2 && ['menu', 'shop', 'help', 'bestiary', 'playing', 'paused', 'levelup'].indexOf(s) >= 0;
}
(function(){
  const base = Music.refresh;
  Music.refresh = function(){
    base.apply(this, arguments);
    if (!phBudsPlay()) return;
    const song = phSongNow(); if (!song) return;
    const w = this.want, run = G.state === 'playing' || G.state === 'paused' || G.state === 'levelup';
    w.theme = song; w.shift = 0; if (!run){ w.lvl = 1; w.run = false; w.rest = false; }
  };
})();

/* ---- the phone ---- */
const PH_APPS = [
  { id: 'music', name: 'Music', t: 1, col: '#FF5A7A', glyph: '♪' }, { id: 'mail', name: 'Mail', t: 1, col: '#4DB0FF', glyph: '✉' }, { id: 'news', name: 'News', t: 1, col: '#FFD84D', glyph: '▤' },
  { id: 'blocks', name: 'Blocks', t: 1, col: '#7AE0A0', glyph: '▦' }, { id: 'run', name: 'Run', t: 2, col: '#FF8A3D', glyph: '▶' }, { id: 'photo', name: 'Photo', t: 2, col: '#B48CFF', glyph: '◉' },
  { id: 'snake', name: 'Neck Snake', t: 3, col: '#9AD84D', glyph: '§' }, { id: 'scores', name: 'Scores', t: 3, col: '#7AE8FF', glyph: '★' }
];
function phoneOpen(){
  if (!Town.on || G.state !== 'town' || Town.panel) return;
  if (!gadPhone()){ townToast('Buy a phone at Volt & Co. on Market Street.', '#E8D8B0'); SFX.deny(); return; }
  SFX.click(); phHome();
}
function phFrame(title, body, back){
  PH.game = null;
  townPanelT('phone', '<div class="ph-bar"><span>' + title + '</span><span>' + (gadOn('buds') ? '🎧' : '') + '</span></div><div class="ph-screen">' + body + '</div>' +
    (back === false ? '' : '<div class="ph-home"><button class="tbtn" data-a="town-phone">' + (back || 'Home') + '</button></div>'), { w: 420, back: 'Put the phone away' });
}
function phHome(){
  const t = gadPhone();
  let h = '<div class="ph-grid">';
  PH_APPS.forEach(function(a){
    const on = t >= a.t, badge = a.id === 'mail' && typeof mailUnread === 'function' ? mailUnread() : a.id === 'news' && typeof newsFresh === 'function' && newsFresh() ? 1 : 0;
    h += '<button class="ph-app' + (on ? '' : ' off') + '" data-a="town-ph-' + a.id + '"' + (on ? '' : ' disabled') + '><i style="background:' + a.col + '">' + a.glyph + '</i><span>' + a.name + '</span>' + (badge && on ? '<b>' + badge + '</b>' : '') + '</button>';
  });
  h += '</div><div class="ph-hint">' + (t < 3 ? 'A better phone adds more apps.' : 'Every app.') + '  ' + (gadOwn('buds') ? (gadOn('buds') ? 'Earbuds in.' : 'Earbuds out.') : 'No earbuds yet: the Music app needs them to play.') + '</div>';
  phFrame('Peep Phone', h, false);
}
function phMusic(){
  const g = gadData(), list = phHeardList(), cur = phSongNow(), buds = gadOwn('buds');
  let h = '<div class="ph-now">' + (cur ? '<b>♪ ' + BAND_SONGS[cur].name + '</b><small>' + jbWhere(cur) + '</small>' : '<b>Nothing playing</b><small>' + (buds ? 'Pick a record below.' : 'Pick a record, then buy earbuds at Volt & Co.') + '</small>') + '</div>';
  h += '<div class="ph-row"><button class="tbtn" data-a="town-ph-buds"' + (buds ? '' : ' disabled') + '>Earbuds: <b>' + (!buds ? 'none' : gadOn('buds') ? 'IN' : 'OUT') + '</b></button>' +
    (gadTier('buds') >= 3 ? '<button class="tbtn" data-a="town-ph-shuf">Shuffle: <b>' + (g.mode === 'shuffle' ? 'ON' : 'OFF') + '</b></button>' : '') + '</div>';
  h += '<div class="ph-list">';
  let gp = '';
  list.forEach(function(r){
    if (r.g !== gp){ gp = r.g; h += '<div class="jb-g">' + gp + '</div>'; }
    h += '<button class="ph-song' + (g.song === r.id && g.mode !== 'shuffle' ? ' on' : '') + '" data-a="town-ph-song-' + r.id + '"><span>' + BAND_SONGS[r.id].name + '</span><small>' + r.where + '</small></button>';
  });
  if (!list.length) h += '<div class="tnote">No records heard yet. Songs join this list the first time she hears them.</div>';
  h += '</div><div class="ph-hint">' + (gadTier('buds') >= 2 ? 'Pods Plus: plays in the menus and runs too.' : buds ? 'Pods: plays in town. Better earbuds play in runs.' : '') + '</div>';
  phFrame('Music', h);
}
function phRun(){
  let h = '<div class="ph-list">';
  for (let c = 1; c <= TOTAL_CHAPTERS; c++){
    if (!chapterUnlocked(c)) continue;
    h += '<button class="ph-song" data-a="town-ph-go-' + c + '"><span>Chapter ' + chapterLabel(c) + '</span><small>' + (BESTIARY_CHAPTERS[c - 1] || '') + '</small></button>';
  }
  h += '</div><div class="ph-hint">Starts a run right now. She comes back to town afterwards.</div>';
  phFrame('Run', h);
}
function phScores(){
  const d = Save.data, g = gadData(), L = [['Runs', d.runs | 0], ['Best wave', d.bestWave | 0], ['Best score', fmt(scoreInt(d.best))], ['Creatures kicked', fmt(scoreInt(d.totalKills))], ['Chapters finished', townChaptersDone()],
    ['Records heard', jbHeardCount() + ' of ' + jbCatalog().length], ['Blocks best', g.hi.blocks], ['Neck Snake best', g.hi.snake]];
  phFrame('Scores', '<div class="ph-stats">' + L.map(function(r){ return '<div><span>' + r[0] + '</span><b>' + r[1] + '</b></div>'; }).join('') + '</div>');
}

/* ---- the games: one canvas, one timer ---- */
function phGameLoop(ts){
  const g = PH.game, cv = document.getElementById('phCv');
  if (!g || !cv || !Town.panel){ PH.game = null; PH.raf = 0; return; }
  g.step(ts || performance.now()); g.draw(cv.getContext('2d'));
  PH.raf = requestAnimationFrame(phGameLoop);
}
function phGameStart(g, title, w, h, keysHtml){
  const hi = gadData().hi;
  phFrame(title, '<div class="ph-gscore"><span id="phSc">0</span><small>Best <b id="phHi">' + hi[g.id] + '</b></small></div><canvas id="phCv" width="' + w + '" height="' + h + '"></canvas><div class="ph-keys">' + keysHtml + '</div>', 'Home');
  PH.game = g; g.init(); cancelAnimationFrame(PH.raf); PH.raf = requestAnimationFrame(phGameLoop);
}
function phGameScore(g){ const el = document.getElementById('phSc'); if (el) el.textContent = g.score; }
function phGameEnd(g){                                 /* a best score pays 5 gems for each thousand points it climbs */
  const hi = gadData().hi, was = hi[g.id];
  if (g.score > was){ hi[g.id] = g.score; const gems = (Math.floor(g.score / 1000) - Math.floor(was / 1000)) * 5; if (gems > 0){ Save.data.gems = (Save.data.gems | 0) + gems; townToast('A new best: ' + g.score + '. +' + gems + ' gems.', '#BFFF9A'); } else townToast('A new best: ' + g.score + '.', '#BFFF9A'); Save.write(); SFX.level(); }
  const el = document.getElementById('phHi'); if (el) el.textContent = hi[g.id];
}
const PH_KEYS = { ArrowLeft: 'l', KeyA: 'l', ArrowRight: 'r', KeyD: 'r', ArrowUp: 'u', KeyW: 'u', ArrowDown: 'd', KeyS: 'd', Space: 'x', Enter: 'x' };
window.addEventListener('keydown', function(e){
  if (!PH.game || !document.getElementById('phCv') || e.code === 'Escape') return;
  const k = PH_KEYS[e.code]; if (!k) return;
  e.preventDefault(); e.stopPropagation(); if (!e.repeat || k === 'd' || k === 'l' || k === 'r') PH.game.key(k);
}, true);

/* Blocks */
const BLOCKS_SH = [[[1, 1, 1, 1]], [[1, 1], [1, 1]], [[0, 1, 0], [1, 1, 1]], [[1, 0, 0], [1, 1, 1]], [[0, 0, 1], [1, 1, 1]], [[0, 1, 1], [1, 1, 0]], [[1, 1, 0], [0, 1, 1]]];
const BLOCKS_COL = ['#4DD8FF', '#FFD84D', '#B48CFF', '#4D7AFF', '#FF9A4D', '#7AF0A0', '#FF6A6A'];
function phBlocks(){
  const R = 20, C = 10, S = 22;
  const G2 = { id: 'blocks', score: 0, over: false, grid: null, p: null, next: 0, lines: 0, at: 0,
    rot: function(m){ return m[0].map(function(_, i){ return m.map(function(r){ return r[i]; }).reverse(); }); },
    ok: function(m, x, y){ for (let j = 0; j < m.length; j++) for (let i = 0; i < m[j].length; i++) if (m[j][i]){ const xx = x + i, yy = y + j; if (xx < 0 || xx >= C || yy >= R || (yy >= 0 && G2.grid[yy][xx] >= 0)) return false; } return true; },
    spawn: function(){ const t = G2.next; G2.next = Math.floor(Math.random() * 7); G2.p = { t: t, m: BLOCKS_SH[t], x: Math.floor((C - BLOCKS_SH[t][0].length) / 2), y: 0 }; if (!G2.ok(G2.p.m, G2.p.x, G2.p.y)){ G2.over = true; phGameEnd(G2); } },
    init: function(){ G2.grid = []; for (let j = 0; j < R; j++) G2.grid.push(new Array(C).fill(-1)); G2.score = 0; G2.lines = 0; G2.over = false; G2.next = Math.floor(Math.random() * 7); G2.spawn(); G2.at = performance.now() + 700; phGameScore(G2); },
    lock: function(){
      const p = G2.p; p.m.forEach(function(row, j){ row.forEach(function(v, i){ if (v && p.y + j >= 0) G2.grid[p.y + j][p.x + i] = p.t; }); });
      let n = 0; for (let j = R - 1; j >= 0; j--) if (G2.grid[j].every(function(v){ return v >= 0; })){ G2.grid.splice(j, 1); G2.grid.unshift(new Array(C).fill(-1)); n++; j++; }
      if (n){ G2.lines += n; G2.score += [0, 100, 300, 500, 800][n] * (1 + Math.floor(G2.lines / 10)); SFX.pick(); }
      phGameScore(G2); G2.spawn();
    },
    drop: function(){ if (G2.ok(G2.p.m, G2.p.x, G2.p.y + 1)){ G2.p.y++; return true; } G2.lock(); return false; },
    key: function(k){
      if (G2.over){ if (k === 'x') phGameStart(phBlocks(), 'Blocks', 220, 440, PH_BTNS); return; }
      const p = G2.p;
      if (k === 'l' && G2.ok(p.m, p.x - 1, p.y)) p.x--; else if (k === 'r' && G2.ok(p.m, p.x + 1, p.y)) p.x++;
      else if (k === 'u'){ const m = G2.rot(p.m); for (const dx of [0, -1, 1, -2, 2]) if (G2.ok(m, p.x + dx, p.y)){ p.m = m; p.x += dx; break; } }
      else if (k === 'd'){ if (G2.drop()) G2.score++; phGameScore(G2); G2.at = performance.now() + 120; }
      else if (k === 'x'){ let n = 0; while (G2.ok(p.m, p.x, p.y + 1)){ p.y++; n++; } G2.score += n * 2; G2.lock(); G2.at = performance.now() + 300; }
    },
    step: function(ts){ if (G2.over) return; if (ts >= G2.at){ G2.drop(); G2.at = ts + Math.max(90, 700 - Math.floor(G2.lines / 10) * 70); } },
    draw: function(c){
      c.fillStyle = '#0A1018'; c.fillRect(0, 0, C * S, R * S); c.strokeStyle = 'rgba(255,255,255,.05)'; c.lineWidth = 1;
      for (let i = 1; i < C; i++){ c.beginPath(); c.moveTo(i * S + 0.5, 0); c.lineTo(i * S + 0.5, R * S); c.stroke(); } for (let j = 1; j < R; j++){ c.beginPath(); c.moveTo(0, j * S + 0.5); c.lineTo(C * S, j * S + 0.5); c.stroke(); }
      const cell = function(x, y, t){ c.fillStyle = BLOCKS_COL[t]; c.fillRect(x * S + 1, y * S + 1, S - 2, S - 2); c.fillStyle = 'rgba(255,255,255,.3)'; c.fillRect(x * S + 1, y * S + 1, S - 2, 4); };
      for (let j = 0; j < R; j++) for (let i = 0; i < C; i++) if (G2.grid[j][i] >= 0) cell(i, j, G2.grid[j][i]);
      if (G2.p && !G2.over){ let gy = G2.p.y; while (G2.ok(G2.p.m, G2.p.x, gy + 1)) gy++; G2.p.m.forEach(function(row, j){ row.forEach(function(v, i){ if (v){ c.fillStyle = 'rgba(255,255,255,.12)'; c.fillRect((G2.p.x + i) * S + 1, (gy + j) * S + 1, S - 2, S - 2); } }); });
        G2.p.m.forEach(function(row, j){ row.forEach(function(v, i){ if (v) cell(G2.p.x + i, G2.p.y + j, G2.p.t); }); }); }
      if (G2.over){ c.fillStyle = 'rgba(0,0,0,.7)'; c.fillRect(0, 150, C * S, 120); c.fillStyle = '#FFE9A0'; c.font = 'bold 24px system-ui'; c.textAlign = 'center'; c.fillText('GAME OVER', C * S / 2, 200); c.font = '14px system-ui'; c.fillText('Score ' + G2.score + ' · press Space or Again', C * S / 2, 230); }
    } };
  return G2;
}
const PH_BTNS = '<button data-a="town-gk-l">◀</button><button data-a="town-gk-u">⟳</button><button data-a="town-gk-d">▼</button><button data-a="town-gk-r">▶</button><button data-a="town-gk-x">⤓</button>';
const PH_PAD = '<button data-a="town-gk-l">◀</button><button data-a="town-gk-u">▲</button><button data-a="town-gk-d">▼</button><button data-a="town-gk-r">▶</button>';

/* Neck Snake */
function phSnake(){
  const C = 20, R = 14, S = 18;
  const G2 = { id: 'snake', score: 0, over: false, body: null, dir: [1, 0], nd: [1, 0], leaf: null, at: 0,
    put: function(){ do { G2.leaf = [Math.floor(Math.random() * C), Math.floor(Math.random() * R)]; } while (G2.body.some(function(b){ return b[0] === G2.leaf[0] && b[1] === G2.leaf[1]; })); },
    init: function(){ G2.body = [[6, 7], [5, 7], [4, 7]]; G2.dir = [1, 0]; G2.nd = [1, 0]; G2.score = 0; G2.over = false; G2.put(); G2.at = performance.now() + 220; phGameScore(G2); },
    key: function(k){
      if (G2.over){ if (k === 'x') phGameStart(phSnake(), 'Neck Snake', C * S, R * S, PH_PAD); return; }
      const d = { l: [-1, 0], r: [1, 0], u: [0, -1], d: [0, 1] }[k]; if (d && !(d[0] === -G2.dir[0] && d[1] === -G2.dir[1])) G2.nd = d;
    },
    step: function(ts){
      if (G2.over || ts < G2.at) return;
      G2.dir = G2.nd; const h = G2.body[0], n = [h[0] + G2.dir[0], h[1] + G2.dir[1]];
      if (n[0] < 0 || n[0] >= C || n[1] < 0 || n[1] >= R || G2.body.some(function(b, i){ return i < G2.body.length - 1 && b[0] === n[0] && b[1] === n[1]; })){ G2.over = true; phGameEnd(G2); return; }
      G2.body.unshift(n);
      if (n[0] === G2.leaf[0] && n[1] === G2.leaf[1]){ G2.score += 10; SFX.pick(); G2.put(); phGameScore(G2); } else G2.body.pop();
      G2.at = ts + Math.max(60, 150 - G2.body.length * 2);
    },
    draw: function(c){
      c.fillStyle = '#0F1A12'; c.fillRect(0, 0, C * S, R * S);
      for (let j = 0; j < R; j++) for (let i = 0; i < C; i++) if ((i + j) % 2) { c.fillStyle = 'rgba(255,255,255,.03)'; c.fillRect(i * S, j * S, S, S); }
      c.fillStyle = '#6BBB45'; c.beginPath(); c.arc(G2.leaf[0] * S + S / 2, G2.leaf[1] * S + S / 2, S * 0.38, 0, TAU); c.fill();
      G2.body.forEach(function(b, i){ c.fillStyle = i ? (i % 2 ? '#E8B84A' : '#D9A030') : '#F2C65A'; c.fillRect(b[0] * S + 1, b[1] * S + 1, S - 2, S - 2); if (i % 3 === 1){ c.fillStyle = '#8A5A22'; c.fillRect(b[0] * S + 5, b[1] * S + 5, 6, 6); } });
      const h = G2.body[0]; c.fillStyle = '#2A1A0A'; c.fillRect(h[0] * S + 4, h[1] * S + 4, 3, 3); c.fillRect(h[0] * S + 11, h[1] * S + 4, 3, 3);
      if (G2.over){ c.fillStyle = 'rgba(0,0,0,.7)'; c.fillRect(0, 90, C * S, 72); c.fillStyle = '#FFE9A0'; c.font = 'bold 22px system-ui'; c.textAlign = 'center'; c.fillText('NECK TIED IN A KNOT', C * S / 2, 122); c.font = '13px system-ui'; c.fillText('Score ' + G2.score + ' · Space for again', C * S / 2, 146); }
    } };
  return G2;
}

/* ---- the buttons ---- */
(function(){
  const h = handleTownAction;
  handleTownAction = function(a){
    if (a === 'town-phone'){ SFX.click(); phHome(); return true; }
    let m = /^town-ph-([\w-]+)$/.exec(a);
    if (m){
      const id = m[1];
      if (id === 'music') { SFX.click(); phMusic(); }
      else if (id === 'mail') { SFX.click(); if (typeof mailShow === 'function') mailShow('phone'); }
      else if (id === 'news') { SFX.click(); if (typeof newsShow === 'function') newsShow('phone'); }
      else if (id === 'blocks') { SFX.click(); phGameStart(phBlocks(), 'Blocks', 220, 440, PH_BTNS); }
      else if (id === 'snake') { SFX.click(); phGameStart(phSnake(), 'Neck Snake', 360, 252, PH_PAD); }
      else if (id === 'run') { SFX.click(); phRun(); }
      else if (id === 'photo') { SFX.click(); townLeaveFor(function(){ showPhoto(); }); }
      else if (id === 'scores') { SFX.click(); phScores(); }
      else if (id === 'buds'){ const g = gadData(); if (gadOwn('buds')){ g.on.buds = g.on.buds === 1 ? 0 : 1; Save.write(); SFX.click(); try { Music.refresh(); } catch (e) {} } phMusic(); }
      else if (id === 'shuf'){ const g = gadData(); g.mode = g.mode === 'shuffle' ? 'one' : 'shuffle'; PH.shuf.id = ''; Save.write(); SFX.click(); try { Music.refresh(); } catch (e) {} phMusic(); }
      else if ((m = /^song-(\w+)$/.exec(id))){ if (jbHeard()[m[1]] && BAND_SONGS[m[1]]){ const g = gadData(); g.song = m[1]; g.mode = 'one'; Save.write(); SFX.pick(); try { Music.refresh(); } catch (e) {} } phMusic(); }
      else if ((m = /^go-(\d+)$/.exec(id))){ const c = +m[1]; if (chapterUnlocked(c)) townLeaveFor(function(){ SFX.click(); try { tryFullscreen(); } catch (e) {} startRun(c); }); }
      return true;
    }
    m = /^town-gk-(\w)$/.exec(a);
    if (m){ if (PH.game) PH.game.key(m[1]); return true; }
    return h(a);
  };
})();
