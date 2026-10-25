'use strict';
/* Longneck Town, fourth part: panels that look like what they are, the bakery and the garage, and what people say. */
/* ========================= 44zd. TOWN PANELS AND TALK ========================= */
/* Every place with a screen of its own has its own look instead of the general menu panel: the notice board is cork with pinned notes and
   wanted posters, the hall is dark wood and brass, the scoreboard is neon on black, the journal is a ruled notebook, the map is a tram
   line, the bakery is a chalkboard, the garage a blueprint, Mission Control a green screen. They are the same overlay as every other menu
   (setOverlay), with a class on the panel (.tp .tp-board and so on, in css/polish.css). The functions replace the ones in 44x-town-ui.js.
   What people say is built by townLine(): their own lines, what suits the time of day, the weather, how well she knows them and how far
   she has got, and it never gives the same line twice in a row. */
function townPanelT(theme, html, opts){
  opts = opts || {};
  Town.panel = true; Town.near = null;
  setOverlay('<div class="panel tp tp-' + theme + '" style="max-width:' + (opts.w || 560) + 'px">' + html +
    '<div class="tp-foot"><button class="tbtn" data-a="town-close">' + (opts.back || 'Back to town') + '</button></div></div>');
}
function townPaintCreatures(list){                             /* list: [{ canvas, ch, type }] */
  list.forEach(function(o){
    const cv = document.querySelector('canvas[data-pt="' + o.id + '"]'); if (!cv) return;
    const c = cv.getContext('2d'), W = cv.width, H = cv.height; c.clearRect(0, 0, W, H);
    try {
      const def = bestiaryTable(o.ch)[o.type], k = Math.min(W, H) * 0.34 / Math.max(10, def.r);
      c.save(); c.translate(W / 2, H * 0.55); c.scale(k, k);
      drawEnemy(c, { portrait: true, def: def, type: o.type, x: 0, y: 0, r: def.r, ang: 0, flash: 0, state: 'idle', anim: 0.6, hp: 1, maxHp: 1, big: def.big, kx: 0, ky: 0, stunT: 0, burnT: 0, slowT: 0, slowMul: 1 });
      c.restore();
    } catch (e) {}
  });
}

/* ---- the notice board: cork, pins and wanted posters ---- */
function townShowBoard(){
  const open = TOWN_NPC_LIST.map(townErrandFor).filter(function(e){ return e && townErrandAvailable(e) && townErrState(e.id) < 2; });
  const tilt = ['-3deg', '2deg', '-1.5deg', '3deg', '-2deg', '1deg'], paper = ['#FFF6C8', '#FFE3E8', '#E3F2FF', '#EAFBD8', '#FFF0D0'];
  let notes = '';
  open.slice(0, 10).forEach(function(e, i){
    const w = TOWN_NPCS[e.npc];
    notes += '<div class="note" style="--r:' + tilt[i % tilt.length] + ';--p:' + paper[i % paper.length] + '"><i class="pin"></i><b>' + T(e.title) + '</b><span>' + w.name + (w.d !== 'roam' && TOWN_DIST[w.d] ? ', ' + TOWN_DIST[w.d].name : '') + '</span>' +
      '<em>' + (townErrState(e.id) === 1 ? (townErrandReady(e) ? 'Ready to hand in!' : 'On the go') : 'Wants help') + '</em></div>';
  });
  if (!open.length) notes += '<div class="note" style="--r:-2deg;--p:#FFF6C8"><i class="pin"></i><b>Nothing pinned</b><span>Come back when the herd needs you.</span></div>';
  const rows = [], bd = bestiaryData().creatures;
  Object.keys(bd).forEach(function(k){ const n = bd[k] | 0; if (n > 0) rows.push({ k: k, n: n }); });
  rows.sort(function(a, c){ return c.n - a.n; });
  let wanted = '', paint = [];
  rows.slice(0, 4).forEach(function(r, i){
    const p = r.k.split(':'), ch = +p[0];
    let nm = p[1]; try { nm = bestiaryName(ch, p[1]).title; } catch (e) {}
    wanted += '<div class="wanted" style="--r:' + tilt[(i + 3) % tilt.length] + '"><i class="pin"></i><div class="wtag">WANTED</div><canvas width="112" height="84" data-pt="w' + i + '"></canvas><b>' + nm + '</b><span>beaten ' + fmt(r.n) + (r.n === 1 ? ' time' : ' times') + '</span></div>';
    paint.push({ id: 'w' + i, ch: ch, type: p[1] });
  });
  if (!rows.length) wanted = '<div class="wanted"><i class="pin"></i><div class="wtag">WANTED</div><b>Nobody yet</b><span>No sightings. Go and meet some creatures.</span></div>';
  const dl = townDaily();
  townPanelT('board', '<div class="tp-title">NOTICE BOARD</div><div class="cork"><div class="cork-row">' + notes + '</div><div class="cork-row">' + wanted + '</div>' +
    '<div class="note small" style="--r:1.5deg;--p:#E3F2FF"><i class="pin"></i><b>Today</b><span>' + dl.got.length + ' of ' + dl.dig.length + ' glimmers dug' + (dl.dot ? ' · Dot found' : ' · Dot is hiding') + '</span></div></div>', { w: 640 });
  townPaintCreatures(paint);
}

/* ---- Herd Hall: brass and dark wood ---- */
function townShowHall(){
  const d = Save.data;
  let cups = '';
  for (let c = 1; c <= TOTAL_CHAPTERS; c++){ const done = townDoneCh(c); cups += '<span class="cup' + (done ? ' on' : '') + '" title="' + (done ? CHAPTER_INFO[c - 1].name : 'Chapter ' + chapterLabel(c) + ' is not finished') + '" style="' + (done ? '--c:' + WARD[c === DOME_CHAPTER ? 46 : c].c : '') + '"><i></i><b>' + chapterLabel(c) + '</b></span>'; }
  const row = function(a, b){ return '<div class="rec"><span>' + a + '</span><b>' + b + '</b></div>'; };
  townPanelT('hall', '<div class="tp-title">HERD HALL</div><div class="shelf">' + cups + '</div><div class="plaque">' +
    row('Best run', fmt(scoreInt(d.best)) + ' points, wave ' + (d.bestWave | 0)) + row('Runs', (d.runs | 0) + '  ·  ' + fmt(d.totalKills | 0) + ' kills') +
    row('Chapters finished', townChaptersDone() + ' of 13' + (d.chaptersComplete ? '  ·  whole journeys: ' + d.chaptersComplete : '')) +
    row('Minigame stars', (typeof miniStarTotal === 'function' ? miniStarTotal() : 0) + ' of 39') + row('Hats and boots', accOwnedCount() + ' of ' + ACC_ITEMS.length) +
    row('Photos in the album', photoAlbum().length + ' of ' + PHOTO_ALBUM_MAX) + row('Found in town', townFoundTotal() + ' of ' + TOWN_ITEMS.length) +
    row('Best friends', TOWN_NPC_LIST.filter(function(i){ return townBondLevel(i) >= 3; }).length + ' of ' + TOWN_NPC_LIST.length) + '</div>', { w: 640 });
}

/* ---- the arcade board: neon ---- */
function townShowScores(){
  const md = miniData();
  let rows = '';
  for (let ch = 1; ch <= TOTAL_CHAPTERS; ch++){
    const m = MINI[ch]; if (!m) continue;
    const un = miniUnlocked(ch), s = md.stars[ch] | 0, best = md.best[ch] | 0;
    rows += '<div class="hs' + (un ? '' : ' off') + '"><span class="hn">' + String(ch).padStart(2, '0') + '</span><span class="hg">' + m.name + '</span><span class="hv">' + (un ? (best ? String(best).padStart(5, '0') : '-----') : 'LOCKED') + '</span>' +
      '<span class="hst">' + '★'.repeat(s) + '<u>' + '★'.repeat(3 - s) + '</u></span><button class="neon" data-a="town-mini-' + ch + '"' + (un ? '' : ' disabled') + '>PLAY</button></div>';
  }
  townPanelT('scores', '<div class="tp-title">HIGH SCORES</div><div class="hsrows">' + rows + '</div><div class="hsfoot">NEXT GAME IN <b data-mini-cd>' + miniCdText() + '</b></div>', { w: 640 });
}

/* ---- the journal: a notebook ---- */
let _tjTab2 = 'errands';
function townShowJournal(tab){
  if (tab) _tjTab2 = tab;
  const tabs = [['errands', 'Errands'], ['finds', 'Finds'], ['friends', 'Friends'], ['tracks', 'Tracks']];
  let th = '<div class="jtabs">'; tabs.forEach(function(x){ th += '<button class="jtab' + (x[0] === _tjTab2 ? ' on' : '') + '" data-a="town-jt-' + x[0] + '">' + x[1] + '</button>'; }); th += '</div>';
  const t = townData(); let b = '', paint = [];
  const bar = function(a, m){ return '<span class="ink-bar"><i style="width:' + Math.round(100 * Math.min(1, a / Math.max(1, m))) + '%"></i></span>'; };
  if (_tjTab2 === 'errands'){
    const act = TOWN_ERRANDS.filter(function(e){ return townErrState(e.id) === 1; }), done = TOWN_ERRANDS.filter(function(e){ return townErrState(e.id) === 2; }).length;
    b += '<p class="jh">' + done + ' of ' + TOWN_ERRANDS.length + ' errands done</p>';
    if (!act.length) b += '<p class="jt">Nothing on the go. Ask around, or look at the notice board in the square.</p>';
    act.forEach(function(e){
      const nd = townNeed(e), ready = townErrandReady(e), w = TOWN_NPCS[e.npc];
      b += '<div class="je"><b>' + T(e.title) + '</b> <span class="jw">for ' + w.name + (w.d !== 'roam' && TOWN_DIST[w.d] ? ', ' + TOWN_DIST[w.d].name : '') + '</span><div class="jt">' + T(e.offer) + '</div><div class="jn' + (ready ? ' ok' : '') + '">' + townNeedText(e) + (ready ? ' — ready to hand in' : '') + '</div>' + bar(nd.cur, nd.max) + '</div>';
    });
    const wait = TOWN_NPC_LIST.map(townErrandFor).filter(function(e){ return e && townErrState(e.id) === 0 && townErrandAvailable(e); });
    if (wait.length){ b += '<p class="jh">Waiting to be asked</p>'; wait.forEach(function(e){ const w = TOWN_NPCS[e.npc]; b += '<div class="jt">' + w.name + (w.d !== 'roam' && TOWN_DIST[w.d] ? ' (' + TOWN_DIST[w.d].name + ')' : '') + ' has an errand.</div>'; }); }
  } else if (_tjTab2 === 'finds'){
    const dl = townDaily();
    b += '<p class="jh">' + townFoundTotal() + ' of ' + TOWN_ITEMS.length + ' found</p><p class="jt">Today: ' + dl.got.length + ' of ' + dl.dig.length + ' glimmers dug' + (dl.dot ? ', and Dot found.' : ', and Dot is hiding somewhere.') + '</p>';
    TOWN_IDS.forEach(function(id){
      const D = TOWN_DIST[id], open = D.open(), all = townItemsIn(id).length, got = townFoundIn(id);
      b += '<div class="je' + (open ? '' : ' locked') + '"><b>' + D.name + '</b> <span class="jw">' + (open ? got + ' of ' + all + (t.done[id] ? ' — all found' : '') : 'opens after: ' + D.need) + '</span>' + (open ? bar(got, all) : '') + '</div>';
    });
    b += '<p class="jt">Colours: ';
    WARD_TOWN.forEach(function(w){ const f = townFound(w[2]); b += '<span class="dotsw" title="' + (f ? w[0] : 'Not found yet') + '" style="background:' + (f ? w[1] : 'rgba(0,0,0,.12)') + '"></span>'; });
    b += '</p><p class="jt">Town hats and boots: ';
    ACC.townHats.concat(ACC.townBoots).forEach(function(it){ b += '<span class="dotsw" title="' + (accOwned(it.id) ? it.name : 'Not found yet') + '" style="background:' + (accOwned(it.id) ? it.c : 'rgba(0,0,0,.12)') + '"></span>'; });
    b += '</p>';
  } else if (_tjTab2 === 'friends'){
    TOWN_NPC_LIST.forEach(function(id){
      const d = TOWN_NPCS[id], l = townBondLevel(id), p = townBond(id), nx = TOWN_BOND_AT[Math.min(3, l + 1)];
      b += '<div class="je"><b>' + d.name + '</b> <span class="jw">' + TOWN_BOND_NAMES[l] + (d.d !== 'roam' && TOWN_DIST[d.d] && townOpen(d.d) ? ' · ' + TOWN_DIST[d.d].name : '') + '</span>' + bar(Math.min(p, 30), 30) +
        '<div class="jt">Best friend gift: <b>' + townGiftName(id) + '</b><br>' + (l >= 3 ? 'Best friends.' : p + ' of ' + nx + ' to the next level' + (l >= 1 ? ' · likes ' + TOWN_GIFTS.filter(function(g){ return g[0] === d.fav; })[0][1].toLowerCase() : '')) + '</div></div>';
    });
  } else {
    const trk = TOWN_ITEMS.filter(function(it){ return it.t === 'track'; });
    b += '<p class="jt">Footprints she has found. A creature she has met shows its picture.</p><div class="trkgrid">';
    trk.forEach(function(it, i){
      const got = townFound(it.id), seen = got && (bestiaryData().creatures[it.ch + ':' + it.type] | 0) > 0;
      b += '<div class="trk' + (got ? '' : ' locked') + '"><canvas width="92" height="72" data-pt="k' + i + '"></canvas><div class="trkn">' + (got ? (seen ? TOWN_TRACK_NAME(it) : 'Unknown creature') : 'Not found') + '</div><div class="trkd">' + TOWN_DIST[it.d].name + '</div></div>';
      if (seen) paint.push({ id: 'k' + i, ch: it.ch, type: it.type });
    });
    b += '</div>';
  }
  townPanelT('journal', th + '<div class="jpage">' + b + '</div>', { w: 640 });
  townPaintCreatures(paint);
  if (_tjTab2 === 'tracks'){                                    /* the paw print for the ones not yet seen */
    document.querySelectorAll('canvas[data-pt^="k"]').forEach(function(cv, i){
      const it = TOWN_ITEMS.filter(function(x){ return x.t === 'track'; })[i]; if (!it || !townFound(it.id) || paint.some(function(p){ return p.id === 'k' + i; })) return;
      const c = cv.getContext('2d'); c.fillStyle = '#6A4A32'; c.beginPath(); c.ellipse(46, 46, 14, 11, 0, 0, TAU); c.fill();
      [[-14, -8], [-5, -17], [5, -17], [14, -7]].forEach(function(p){ c.beginPath(); c.ellipse(46 + p[0], 44 + p[1], 5, 6.4, 0, 0, TAU); c.fill(); });
    });
  }
}

/* ---- the tram map ---- */
function townShowMap(){
  const st = function(id, cls){
    const D = TOWN_DIST[id], open = D.open(), cur = id === Town.d || (TOWN_DIST[Town.d] && TOWN_ROOM_PARENT[Town.d] === id), got = townFoundIn(id), all = townItemsIn(id).length;
    return '<button class="stn ' + (cls || '') + (open ? '' : ' off') + (cur ? ' here' : '') + '" data-a="town-go-' + id + '"' + (open && id !== Town.d ? '' : ' disabled') + '><i></i>' +
      '<span class="sn">' + D.name + '</span><span class="ss">' + (open ? got + '/' + all : 'closed') + '</span></button>';
  };
  townPanelT('map', '<div class="tp-title">TRAM LINE 1</div><div class="tmap"><div class="line"></div>' +
    TOWN_ORDER.map(function(id, i){ return st(id, i % 2 ? 'dn' : 'up'); }).join('') + '</div>' +
    '<div class="tbranch"><div class="bline"></div>' + st('burrows', 'dn') + '</div>' +
    '<p class="tnote">Choose a stop. ' + (townOpenCount() < TOWN_IDS.length ? 'Closed stops open as the journey goes on.' : 'Every stop is open.') + '</p>', { w: 700 });
}

/* ---- Mission Control: green screens ---- */
function townShowMission(){
  const ship = typeof shipUnlocked === 'function' && venusUnlocked() && shipUnlocked();
  const row = function(a, name, sub, ok, lock){ return '<button class="term' + (ok ? '' : ' off') + '" data-a="' + a + '"' + (ok ? '' : ' disabled') + '><b>&gt; ' + name + '</b><span>' + (ok ? sub : lock) + '</span></button>'; };
  townPanelT('mission', '<div class="tp-title">MISSION CONTROL</div><div class="termwrap">' +
    row('town-mi-venus', 'VENUS OUTPOST', ship ? 'scouting, upgrades, the spaceplane' : 'scouting and upgrades', venusUnlocked(), 'no signal') +
    row('town-mi-mars', 'MARS OUTPOST', 'scouting and upgrades', marsUnlocked(), 'no signal') +
    row('town-mi-lab', 'THE GIRAFFE LAB', 'mutations and the dust squad', labUnlocked(), 'no signal') + '</div><p class="tnote term-n">_ select a console</p>', { w: 560 });
}
function townShowLibrary(){
  townPanelT('library', '<div class="tp-title">THE LIBRARY</div><div class="books">' +
    '<button class="libbook b1" data-a="town-lib-bestiary"><span>Bestiary</span><small>' + (bestiaryCounts().creatures + bestiaryCounts().cards) + ' of ' + (BESTIARY_TOTAL_CREATURES + CARDS.length) + '</small></button>' +
    '<button class="libbook b2" data-a="town-lib-guide"><span>Guide</span><small>How it all works</small></button>' +
    '<button class="libbook b3" data-a="town-lib-album"><span>Album</span><small>' + photoAlbum().length + ' of ' + PHOTO_ALBUM_MAX + '</small></button></div>', { w: 520 });
}
function townShowMenu(){
  townPanelT('menu', '<div class="tp-title">LONGNECK TOWN</div><div class="planks">' +
    '<button class="plank" data-a="town-close">Keep exploring</button><button class="plank" data-a="town-journal">Journal</button><button class="plank" data-a="town-map">Tram map</button>' +
    '<button class="plank last" data-a="town-exit">Back to the main menu</button></div><p class="tnote">' + townFoundTotal() + ' of ' + TOWN_ITEMS.length + ' things found</p>', { w: 460 });
}

/* ---- the bakery ---- */
function townShowBakery(){
  const have = breadStock(), price = breadPrice(), gold = goldInt(Save.data.gold), room = breadCap() - have;
  const buy = function(n){ const cost = n * price, can = gold >= cost && room >= n; return '<button class="chalk" data-a="town-bread-' + n + '"' + (can ? '' : ' disabled') + '>' + n + (n === 1 ? ' loaf' : ' loaves') + '<small>' + fmt(cost) + ' gold</small></button>'; };
  townPanelT('bakery', '<div class="tp-title">CRUMB’S BAKERY</div><canvas id="loafCv" width="150" height="90"></canvas>' +
    '<div class="menuboard"><div class="mb"><span>Fresh loaf</span><b>' + fmt(price) + ' gold</b></div>' +
    '<p>Heals <b>' + Math.round(breadHeal() * 100) + '%</b> of her health. Once every <b>15 seconds</b>, in a run.</p>' +
    '<p>In a run, press <b>' + keyName(keyOf('bread')) + '</b>, or the Bread button. With auto on, one is eaten whenever she is under three quarters health.</p></div>' +
    '<div class="stock">In her satchel: <b>' + have + '</b> of ' + breadCap() + '  ·  ' + fmt(gold) + ' gold</div>' +
    '<div class="chalkrow">' + buy(1) + buy(5) + buy(10) + '</div>' +
    '<button class="chalk toggle" data-a="town-autobread">Eat automatically: <b>' + (Settings.autoBread !== false ? 'ON' : 'OFF') + '</b></button>', { w: 520 });
  const cv = document.getElementById('loafCv');
  if (cv){
    const c = cv.getContext('2d'); c.translate(75, 54);
    c.fillStyle = 'rgba(0,0,0,.25)'; c.beginPath(); c.ellipse(0, 26, 52, 8, 0, 0, TAU); c.fill();
    c.fillStyle = '#B8742E'; c.beginPath(); c.ellipse(0, 6, 56, 28, 0, 0, TAU); c.fill();
    c.fillStyle = '#D9A05A'; c.beginPath(); c.ellipse(0, 0, 52, 24, 0, 0, TAU); c.fill();
    c.strokeStyle = '#F2D9A0'; c.lineWidth = 5; c.lineCap = 'round'; for (let i = -1; i <= 1; i++){ c.beginPath(); c.moveTo(i * 24 - 10, -12); c.lineTo(i * 24 + 8, 6); c.stroke(); }
  }
}
/* ---- the garage ---- */

/* ---- the actions of the new panels ---- */
(function(){
  const h = handleTownAction;
  handleTownAction = function(a){
    let m = /^town-bread-(\d+)$/.exec(a);
    if (m){ breadBuy(+m[1]); townShowBakery(); return true; }
    if (a === 'town-autobread'){ Settings.autoBread = Settings.autoBread === false; Settings.save(); SFX.click(); townShowBakery(); return true; }
    if (a === 'town-buycar'){ if (townCarBuy()) townToast('She owns a car. Press C in town to get in.', '#BFFF9A'); townShowGarage(); return true; }
    m = /^town-carpaint-(\d+)$/.exec(a);
    if (m){ if (townCarPaint(+m[1])) SFX.pick(); else SFX.deny(); townShowGarage(); return true; }
    return h(a);
  };
})();

/* ---- what people say ---- */
const TOWN_REPLY = {
  accept: ['Wonderful. Off you go.', 'I knew I could count on you.', 'Take your time, no hurry.', 'Splendid. Come back and tell me how it goes.', 'You’re a star. Truly.', 'Good. I’ll be right here.'],
  later: ['No rush at all.', 'Whenever you’re ready.', 'Of course. It will keep.', 'Another day, then.'],
  gift: ['How thoughtful. Thank you.', 'Oh! For me? That is kind.', 'You shouldn’t have. I’m glad you did.', 'That’s very sweet of you.'],
  fav: ['That is exactly what I wanted! How did you know?', 'My favourite! You really are something.', 'You remembered! I’m a bit teary.'],
  progress: ['How is it going?', 'Any luck?', 'Still at it?', 'Take your time.']
};
const TOWN_LINES = {
  mayor: { day: ['Look at the sky. Not a cloud. Well, a few.', 'The fountain was cleaned this morning. You can tell.'], dusk: ['The lamps are coming on. My favourite moment.'], night: ['The square is empty at this hour. Just us and the owls.'],
    new: ['I don’t believe we’ve properly met. I’m the mayor. It says so on the hat.'], friend: ['You’ve become part of the town. I mean that.', 'I’d re-elect you. Of what, I don’t know.'], best: ['I’ve put your name on a plaque. A small one. Humble.', 'If I could, I’d make you mayor. The hat doesn’t fit anyone else.'],
    chap: [[3, 'Word has travelled from the swamps. People are talking about you.'], [6, 'Houston! I hear the buses are very large there.'], [8, 'The Moon. The Moon! And you came back with all your colours.'], [13, 'You’ve finished everything. The whole town is proud, and a bit nervous.']] },
  tilly: { day: ['That coat, in this light. Mm.', 'I’m hemming a cape for no one in particular.'], dusk: ['Golden light is the best light for fabric.'], new: ['Hello. Don’t mind the pins. Or the measuring.'], friend: ['I’ve a bolt of cloth that is exactly your colour.', 'You’ve got a good eye. Don’t tell the others.'], best: ['I’ve a whole rail set aside for you. Everything on it is yours.', 'I’d dress you for free. Don’t tell the mayor.'],
    chap: [[5, 'A jungle green coat would be so you.'], [10, 'Ember colours suit you. I wouldn’t say it to just anyone.']] },
  barnaby: { day: ['Slow day. Which is the best kind for a shopkeeper. Or the worst.', 'Everything’s for sale except the stall.'], dusk: ['Closing in a minute. Or never. Depends who wanders by.'], night: ['The night market is just me and a lantern.'],
    new: ['Browse! Browsing is free. Everything else, less so.'], friend: ['For you, I’d round down. A little.', 'I put aside something nice. I won’t say what.'], best: ['You’re the only one I’d give a discount. Don’t tell the herd.'], chap: [[2, 'Winter stock came in. You can imagine.'], [9, 'Venus! What’s the exchange rate on sulfur?']] },
  penny: { day: ['Fresh out of the oven, as always.', 'I’m trying a honey and sage loaf. Wish me luck.'], dusk: ['The evening rush. Everyone wants a bun.'], night: ['I bake best at night. Don’t ask why.'], new: ['Hello! You look hungry. Everyone does.'],
    friend: ['I saved you the end of the loaf. The crusty bit.'], best: ['You’re family. There’s always a bun with your name on it.'], chap: [[4, 'Fish buns! Not recommended. I tried.']] },
  rio: { day: ['Light’s good. Hold still and I’ll take you.', 'A good photo needs a good hat.'], dusk: ['Golden hour. Everyone looks good in golden hour.'], night: ['Long exposure. Don’t move for eleven seconds.'], new: ['Hi. Don’t mind the camera. It’s not looking at you. It’s looking past you.'],
    friend: ['You’ve got an eye. Better than mine, some days.'], best: ['I’ve got a whole wall of your best ones. Come and see sometime.'], chap: [[1, 'I’d love a shot of the savanna at dawn.'], [7, 'Space! Can you take a camera next time?']] },
  gus: { day: ['Go on, hit a high score. I dare you.', 'The cabinets are warm. Somebody’s been on them.'], dusk: ['Arcade after dark is the best.'], new: ['Hey! Do you play? You look like you play.'], friend: ['Honestly, you’re the best I’ve seen. Don’t tell the others I said so.'], best: ['If you take my high score I’ll cry. Then I’ll cheer.'],
    chap: [[3, 'Three games in and you’re already doing better than me.'], [8, 'Is it true there’s a game on the Moon?']] },
  marina: { day: ['The fish are shy today. Or smart.', 'The tide comes in, the tide goes out. I sit.'], dusk: ['The boats come home at this hour.'], night: ['I like the harbour after dark. The lighthouse is a friend.'], new: ['Hello. Don’t splash.'], friend: ['I caught a fish and let it go. It was a good one.'], best: ['There’s a boat in the harbour with your name on it. Not literally. Yet.'] },
  skye: { day: ['The wind is just right for antennas.', 'You can see everything from here. Even the arcade queue.'], dusk: ['Sunset. Everything turns orange. Even the washing.'], night: ['Stars from the roof. Not bad.'], new: ['Careful! Don’t step on the cables.'], friend: ['I built you a little aerial. For your hat. It’s a joke.'], best: ['I’d let you touch the green one. I wouldn’t tell anyone else that.'] },
  nova: { day: ['Daytime is boring. The stars are still up there, just hiding.'], dusk: ['First star in ten minutes. I can feel it.'], night: ['Right now, tonight, a star burst. Just then. You missed it.'], new: ['Shh. I’m counting.'], friend: ['I’ve named one after you. It’s a small one. Don’t be offended.'], best: ['I wrote your name on the map. In pencil, because stars move.'],
    chap: [[7, 'You’ve left the planet. I’m a little jealous.'], [9, 'Venus is the morning star, you know. Or the evening one.']] },
  ossi: { day: ['Up top, it’s day. Down here, it’s whatever the lamps say.'], new: ['Hm. A visitor. Mind your head. Oh, you can’t help that.'], friend: ['You’re the first from the surface to stay for tea.'], best: ['If the surface ever gets too loud, you’ve a room down here.'] },
  dot: { day: ['Again! Again!', 'I’m going to hide somewhere new tomorrow.'] },
  crumb: { day: ['Come in, come in. Don’t let the warm out.', 'A loaf a day keeps the neck-ache away.'], dusk: ['Last batch of the day. Smell that.'], night: ['Dough doesn’t care what time it is.'], new: ['Hello! First time? A loaf is cheap and it saves lives. Well. Hit points.'],
    friend: ['I put a bit of honey in yours. Don’t tell the others.'], best: ['For you, always the first loaf from the oven.'] },
  torque: { day: ['I’ve tuned her this morning. She’ll fly.', 'Leave the door open. Smell the oil.'], new: ['Ah. Customer. Or just curious? Either is fine.'], friend: ['I wired a horn that sounds like a giraffe. Don’t ask.'], best: ['You’ve the first test-drive of anything I build. Ever.'] },
  dewey: { day: ['Quiet reading is a gift to yourself.', 'There’s an entry on you. A short one. I’m working on it.'], new: ['Shh. Welcome. Shh.'], friend: ['I saved you the good armchair.'], best: ['The library is as much yours as mine.'] },
  granny: { day: ['I made too many biscuits. I always do.', 'Sit. The kettle’s on.'], new: ['Hello, dear. Not many come in. Mind the cat.'], friend: ['You remind me of someone. A lovely someone.'], best: ['You’re always welcome. Always.'] },
  mim: { day: ['The light through the window is ideal today.', 'I painted a giraffe. Then another. Then a third.'], new: ['Oh! A visitor. I’ll hide the mess.'], friend: ['Would you sit for a painting?'], best: ['I painted you. It’s above the bed. It’s the best thing I’ve done.'] }
};
const TOWN_GENERIC = {
  morning: ['Morning!', 'Up with the sun, then?', 'Early start.'],
  car: ['Is that your car I saw? Very flash.', 'Torque’s proud of that car.'],
  hat: ['{hat}! Very you.', 'I like the {hat}.'],
  found: ['{n} things found? You’re thorough.', 'I hear you’ve found {n} things around town.'],
  bread: ['Have you tried the bakery? Crumb’s loaves are splendid.']
};
function townLine(id){
  const def = TOWN_NPCS[id], L = TOWN_LINES[id] || {}, lvl = townBondLevel(id), h = townHour(), D = TOWN_DIST[Town.d];
  const cave = D && (D.cave || D.indoor), night = !cave && townIsNight(), dusk = !cave && !night && townDark(h) > 0.1, rain = !cave && Town.rainK > 0.4;
  let pool = [];
  const add = function(a, w){ if (a) for (let k = 0; k < (w || 1); k++) pool = pool.concat(a); };
  add(def.say, 1);
  if (night){ add(def.night, 2); add(L.night, 2); } else if (dusk) add(L.dusk, 2); else add(L.day, 1.5 | 0 || 1);
  if (rain){ add(def.rain, 2); add(L.rain, 2); }
  if (lvl === 0) add(L.new, 2); if (lvl >= 2) add(L.friend, 2); if (lvl >= 3) add(L.best, 3);
  const ch = townChaptersDone(); (L.chap || []).forEach(function(c){ if (ch >= c[0]) pool.push(c[1]); });
  const hat = accEquipped('hat'), g = [];
  if (townCarOwned()) g.push(townPick1(TOWN_GENERIC.car));
  if (hat) g.push(townPick1(TOWN_GENERIC.hat).replace('{hat}', hat.name));
  if (townFoundTotal() >= 10) g.push(townPick1(TOWN_GENERIC.found).replace('{n}', townFoundTotal()));
  if (h > 5.5 && h < 9) g.push(townPick1(TOWN_GENERIC.morning));
  if (!breadStock() && Math.random() < 0.5) g.push(townPick1(TOWN_GENERIC.bread));
  if (g.length && Math.random() < 0.3) pool = pool.concat(g);
  if (!pool.length) pool = def.say.slice();
  Town.lastLine = Town.lastLine || {};
  let line = townPick1(pool), tries = 0;
  while (line === Town.lastLine[id] && pool.length > 1 && tries++ < 6) line = townPick1(pool);
  Town.lastLine[id] = line;
  return line;
}
/* the guide page grows with the town */
(function(){
  const t = GUIDE_TOPICS.find(function(x){ return x.id === 'town'; }); if (!t) return;
  const base = t.html;
  t.html = function(){
    return base().replace('</ul>', '<li><b>Inside:</b> many buildings can be entered. The bakery sells <b>bread</b>: in a run, ' + guideKey('bread') + ' (or the Bread button) eats a loaf for 5% health, once every 15 seconds; Settings can have it eaten by itself. The garage sells a <b>car</b>: press <b>C</b> in town to drive (2.2×), and in Chapter 6 (Houston) it makes her 45% faster. It cannot go underground. The arcade has a cabinet for each minigame.</li>' +
      '<li>The <b>tram</b> runs through the square on a timetable. Pick a stop on the map to ride to it.</li>' +
      '<li><b>Hats and boots found in town are found nowhere else</b>: they are not on the prize wheel.</li></ul>');
  };
})();
