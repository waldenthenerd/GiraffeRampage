'use strict';
/* Longneck Town: talking, errands, friendships, and the panels (journal, map, notice board...). */
/* ========================= 44x. TOWN UI ========================= */
/* A conversation is a card at the bottom of the screen (#townDlg): the speaker's face, what they say, and up to five choices (keys
   1-5, or Enter / Space for the first). Panels use the game's own overlay (setOverlay) so they look like the rest of the menus.
   Friendship (bond) points: +1 for the first chat of the day, +2 or +6 for a gift (6 when it is the one she likes best, once a
   day each), +10 for an errand. Levels at 5, 15 and 30 points; the friend level pays 15 gems and the best friend level gives her
   own hat or boots (TOWN_NPCS.*.gift). */
function T(s){ return String(s).replace(/'/g, '’'); }
let _dlg = null, _dlgOpen = false, _dlgTimer = 0, _dlgFull = '', _dlgChoices = [];
function townDialogOpen(){ return _dlgOpen; }
function townDialogHeight(){ return _dlgOpen && _dlg ? _dlg.offsetHeight + 12 : 0; }
function townDlgEl(){
  if (_dlg) return _dlg;
  const d = document.createElement('div');
  d.id = 'townDlg';
  d.innerHTML = '<div class="tdl-card"><canvas class="tdl-face" width="76" height="76"></canvas><div class="tdl-body"><div class="tdl-name"></div><div class="tdl-text"></div><div class="tdl-choices"></div></div></div>';
  ['pointerdown', 'mousedown', 'touchstart'].forEach(function(ev){ d.addEventListener(ev, function(e){ e.stopPropagation(); }); });
  d.addEventListener('click', function(e){
    e.stopPropagation();
    const b = e.target.closest && e.target.closest('button[data-c]');
    if (b){ townPick(+b.getAttribute('data-c')); return; }
    if (_dlgTimer) townDlgFinish();
  });
  document.body.appendChild(d); _dlg = d;
  return d;
}
function townDlgFinish(){
  if (!_dlg) return;
  if (_dlgTimer){ clearInterval(_dlgTimer); _dlgTimer = 0; }
  _dlg.querySelector('.tdl-text').textContent = _dlgFull;
  _dlg.querySelector('.tdl-choices').style.visibility = 'visible';
}
function townFace(cv, npc){
  const c = cv.getContext('2d'); c.clearRect(0, 0, 76, 76);
  c.fillStyle = 'rgba(255,255,255,.07)'; c.beginPath(); c.arc(38, 38, 36, 0, TAU); c.fill();
  if (!npc || !npc.look) return;
  const lk = npc.look; c.save(); c.beginPath(); c.arc(38, 38, 36, 0, TAU); c.clip();
  const s = 2.0;
  townGiraffe(c, 38 - 27 * s, 48 + 92 * s, { s: s, look: lk, reach: 0, t: 0, seed: 0 });
  c.restore();
}
/* speaker: { name, text, npc? (a TOWN_NPCS entry, for the face) }; choices: [{ label, fn, disabled }] (none: one OK that closes) */
function townSay(speaker, choices){
  const d = townDlgEl();
  Town.hold = true;
  if (!choices || !choices.length) choices = [{ label: 'OK', fn: function(){ townCloseDialog(); } }];
  _dlgChoices = choices; _dlgOpen = true;
  d.querySelector('.tdl-name').textContent = speaker.name || '';
  townFace(d.querySelector('.tdl-face'), speaker.npc || null);
  d.querySelector('.tdl-face').style.display = speaker.npc ? 'block' : 'none';
  const ch = d.querySelector('.tdl-choices'); ch.innerHTML = '';
  choices.forEach(function(c, i){
    const b = document.createElement('button'); b.className = 'btn sm' + (i ? ' ghost' : ''); b.setAttribute('data-c', i); b.disabled = !!c.disabled;
    b.textContent = (i + 1) + '. ' + c.label; ch.appendChild(b);
  });
  _dlgFull = T(speaker.text);
  const tx = d.querySelector('.tdl-text'); tx.textContent = '';
  if (_dlgTimer) clearInterval(_dlgTimer);
  ch.style.visibility = 'hidden';
  let n = 0;
  _dlgTimer = setInterval(function(){
    n += 2; tx.textContent = _dlgFull.slice(0, n);
    if (n >= _dlgFull.length) townDlgFinish();
  }, 18);
  d.className = 'on';
}
function townPick(i){
  const c = _dlgChoices[i]; if (!c || c.disabled) return;
  SFX.click();
  if (c.fn) c.fn();
}
function townCloseDialog(quiet){
  if (_dlgTimer){ clearInterval(_dlgTimer); _dlgTimer = 0; }
  _dlgOpen = false; _dlgChoices = [];
  if (_dlg) _dlg.className = '';
  if (!quiet){ Town.hold = false; Town.talkNpc = ''; }
}
window.addEventListener('keydown', function(e){
  if (!_dlgOpen || e.repeat) return;
  if (e.code === 'Escape'){ townCloseDialog(); e.preventDefault(); e.stopPropagation(); return; }
  if (e.code === 'Space' || e.code === 'Enter' || e.code === 'NumpadEnter' || e.code === 'KeyE'){
    e.preventDefault(); e.stopPropagation();
    if (_dlgTimer){ townDlgFinish(); return; }
    townPick(0); return;
  }
  const m = /^(?:Digit|Numpad)([1-5])$/.exec(e.code);
  if (m){ e.preventDefault(); e.stopPropagation(); if (_dlgTimer) townDlgFinish(); townPick(+m[1] - 1); }
}, true);

/* ---- friendship ---- */
function townAddBond(id, n){
  const t = townData(), before = townBondLevel(id);
  t.bond[id] = Math.min(60, townBond(id) + n);
  const after = townBondLevel(id), def = TOWN_NPCS[id];
  for (let l = before + 1; l <= after; l++){
    if (t.n['r_' + id] >= l) continue;
    t.n['r_' + id] = l;
    if (l === 2){ townPay({ gems: 15 }); townToast(def.name + ' is now a friend. +15 gems.', '#BFFF9A'); SFX.level(); }
    else if (l === 3){ const m = townGrantGift(id); townToast(def.name + ' is your best friend! Her gift: ' + m + '.', '#FFE9A0'); SFX.transform(); }
    else townToast('You know ' + def.name + ' a little better.', '#E8D8B0');
  }
  Save.write();
}

/* ---- what they say ---- */
function townPick1(a){ return a[Math.floor(Math.random() * a.length)]; }
function townLookLine(def){
  const md = miniData(), hat = accEquipped('hat'), boot = accEquipped('boot'), skin = wardChoice('skinCol'), spot = wardChoice('spotCol');
  const out = [];
  if (hat && def.look.hat === hat.id) out.push('Oh, we have the same hat! Great minds.');
  if (hat) out.push('That ' + hat.name.toLowerCase() + ' suits you.');
  if (hat && (md.hatCol | 0) && WARD[md.hatCol]) out.push('A ' + WARD[md.hatCol].name.toLowerCase() + ' ' + hat.name.toLowerCase() + '. Bold. I like it.');
  if (boot) out.push('Those ' + boot.name.toLowerCase() + ' are very you.');
  if (skin && WARD[skin]) out.push(WARD[skin].name + ' looks wonderful on you.');
  if (spot && WARD[spot]) out.push('Those ' + WARD[spot].name.toLowerCase() + ' spots really pop.');
  if (!out.length) out.push('Plain and classic. Nothing wrong with that, though the wardrobe is full of ideas.');
  return townPick1(out);
}
function townHint(forNpc){
  const pool = TOWN_ITEMS.filter(function(it){ return !townFound(it.id) && townOpen(it.d); });
  if (!pool.length) return null;
  const own = pool.filter(function(it){ return forNpc && it.d === TOWN_NPCS[forNpc].d; }), src = own.length && Math.random() < 0.7 ? own : pool;
  const it = townPick1(src), what = { coin: 'a coin', star: 'a little star', gem: 'a gem', hat: 'a hat', boot: 'a pair of boots', swatch: 'a colour swatch', track: 'some creature tracks' }[it.t];
  const where = it.d === Town.d ? 'around here' : 'in ' + TOWN_DIST[it.d].name;
  return 'I heard there is ' + what + ' ' + where + ', ' + it.note + '.';
}
function townBuildingTalk(b){
  const nm = b.label;
  let text;
  switch (b.act){
    case 'hall': townShowHall(); return;
    case 'board': townShowBoard(); return;
    case 'scores': townShowScores(); return;
    case 'library': townShowLibrary(); return;
    case 'mission': townShowMission(); return;
    case 'cafe': text = townHint('penny') || 'The café is humming. The gossip is that you have found everything. Impressive.'; break;
    case 'shack': text = townPick1(['Rods, nets, bait and a very old cat who is not for sale.', 'A sign says: GONE FISHING. A second sign says: BACK SOON. A third is just a drawing of a fish.', 'It smells of rope and the sea. Marina is out on the pier.']); break;
    case 'lamp': Town.lit = !Town.lit; text = Town.lit ? 'You climb up and light the big lamp. The beam sweeps across the water.' : 'You put the lamp out. The harbour goes dark.'; SFX.level(); break;
    case 'garden': text = townPick1(['Tomatoes, sunflowers and one extremely proud cactus. The greenhouse is warm and quiet.', 'Skye waters the plants by launching little rockets of water. It mostly works.']); break;
    case 'shed': text = townPick1(['The shed is stuffed with dishes, wires and a radio that only plays the weather. Tonight: more of the same.', 'A hand-written note: DO NOT TOUCH THE GREEN ONE.']); break;
    case 'scope': text = townIsNight() ? 'You put an eye to the telescope. The stars are so crisp you could reach out and take one. (You can, if you stretch.)' : 'You look through the telescope. The sky is a flat bright blue. Come back after dark.'; break;
    case 'farm': text = 'The grubs wriggle in their troughs, fat and content. You have ' + fmt(Save.data.grubs | 0) + ' grubs in your pockets.'; break;
    default: text = nm + ' is closed for now.';
  }
  townSay({ name: nm, text: text }, []);
}

/* ---- talking to someone ---- */
function townTalk(id){
  const def = TOWN_NPCS[id], t = townData(), today = townDayKey();
  Town.talkNpc = id; Town.hold = true; SFX.click();
  const first = t.talk[id] !== today;
  t.talk[id] = today;
  if (first && id !== 'dot') townAddBond(id, 1);
  Save.write();
  if (id === 'dot'){ townDot(def); return; }
  const night = townIsNight() && !TOWN_DIST[Town.d].cave, rain = Town.rainK > 0.4;
  townNpcMenu(id, townLine(id) + (first && (id === 'tilly' || Math.random() < 0.3) ? ' ' + townLookLine(def) : ''));
}
function townDot(def){
  const dl = townDaily(), first = !dl.dot;
  let text = townPick1(def.say);
  if (first){
    dl.dot = 1; dl.n = (dl.n | 0) + 1;
    const m = townPay({ gems: 8, coin: 2 }); townAddBond('dot', 3);
    text += ' (Found her! ' + m + '.)'; SFX.level(); townBurst(Town.x, TG - 100, '#FFD36B', 16);
    townToast('You found Dot! ' + m, '#FFD36B');
  }
  townSay({ name: def.name, text: text, npc: def }, [{ label: 'Goodbye', fn: function(){ townCloseDialog(); } }]);
}
function townNpcMenu(id, text){
  const def = TOWN_NPCS[id], t = townData(), today = townDayKey(), ch = [];
  const er = townErrandFor(id);
  if (er && townErrandAvailable(er)){
    const st = townErrState(er.id);
    if (st === 0) ch.push({ label: 'Errand: ' + er.title, fn: function(){ townOfferErrand(id, er); } });
    else if (townErrandReady(er)) ch.push({ label: 'Hand in: ' + er.title, fn: function(){ townFinishErrand(id, er); } });
    else ch.push({ label: 'About: ' + er.title, fn: function(){ townErrandProgress(id, er); } });
  }
  ch.push({ label: 'Any news?', fn: function(){
    const h = townHint(id), line = Math.random() < 0.3 || !h ? townLine(id) : h;
    townNpcMenu(id, line);
  } });
  const cost = 3 * townCoin(), gifted = t.gift[id] === today;
  if (id === 'dewey') ch.push({ label: 'I\u2019m stuck', fn: function(){ townNpcMenu(id, townHintExact()); } });
  ch.push({ label: gifted ? 'Gift given today' : 'Give a gift (' + fmt(cost) + ' gold)', disabled: gifted || (Save.data.gold | 0) < cost, fn: function(){ townGiftMenu(id); } });
  ch.push({ label: 'Goodbye', fn: function(){ townCloseDialog(); } });
  townSay({ name: def.name + '  ·  ' + TOWN_BOND_NAMES[townBondLevel(id)], text: text, npc: def }, ch);
}
function townGiftMenu(id){
  const def = TOWN_NPCS[id], cost = 3 * townCoin(), ch = [];
  TOWN_GIFTS.forEach(function(g){
    ch.push({ label: g[1], fn: function(){
      if ((Save.data.gold | 0) < cost){ SFX.deny(); return; }
      Save.data.gold -= cost; townData().gift[id] = townDayKey();
      const fav = def.fav === g[0], pts = fav ? 6 : 2;
      townAddBond(id, pts); SFX.coin(); townBurst(Town.x + Town.face * 60, TG - 120, '#F29AC0', 12);
      const reply = fav ? townPick1(TOWN_REPLY.fav) : townPick1(TOWN_REPLY.gift);
      townNpcMenu(id, reply + (fav ? ' (+' + pts + ' friendship)' : ' (+' + pts + ')'));
    } });
  });
  ch.push({ label: 'Never mind', fn: function(){ townNpcMenu(id, townPick1(def.say)); } });
  townSay({ name: def.name, text: 'A gift costs ' + fmt(cost) + ' gold. What would you like to give?', npc: def }, ch);
}
function townOfferErrand(id, er){
  const def = TOWN_NPCS[id];
  townSay({ name: def.name, text: er.title + '. ' + er.offer, npc: def }, [
    { label: 'I’ll do it', fn: function(){ townData().err[er.id] = 1; Save.write(); SFX.level(); townToast('New errand: ' + er.title, '#FFE9A0'); townNpcMenu(id, townPick1(TOWN_REPLY.accept)); } },
    { label: 'Maybe later', fn: function(){ townNpcMenu(id, townPick1(TOWN_REPLY.later)); } }
  ]);
}
function townErrandProgress(id, er){
  const def = TOWN_NPCS[id];
  townSay({ name: def.name, text: townPick1(TOWN_REPLY.progress) + ' \u201c' + er.title + '\u201d: ' + townNeedText(er) + '.', npc: def }, [{ label: 'Back', fn: function(){ townNpcMenu(id, townLine(id)); } }]);
}
function townFinishErrand(id, er){
  const def = TOWN_NPCS[id], nd = townNeed(er), d = Save.data;
  if (nd.give){
    if (nd.curr === 'gold') d.gold = Math.max(0, (d.gold | 0) - nd.max);
    else if (nd.curr === 'gems') d.gems = Math.max(0, (d.gems | 0) - nd.max);
    else d.grubs = Math.max(0, (d.grubs | 0) - nd.max);
  }
  townData().err[er.id] = 2;
  const m = townPay(er.r); townAddBond(id, 10);
  SFX.level(); townBurst(Town.x, TG - 120, '#FFE9A0', 18);
  townToast('Errand done: ' + er.title + '. ' + m, '#BFFF9A');
  Save.write();
  const nx = townErrandFor(id);
  townNpcMenu(id, er.done + ' (+ ' + m + ')' + (nx ? ' I might have something else for you.' : ''));
}

/* ---- panels ---- */
function townPanel(title, body, wide){
  Town.panel = true; Town.near = null;
  setOverlay('<div class="panel slab' + (wide ? ' wide' : '') + '" style="max-width:' + (wide ? 640 : 520) + 'px"><h2 class="head">' + title + '</h2>' + body +
    '<div class="row" style="margin-top:14px"><button class="btn sm" data-a="town-close">Back to town</button></div></div>');
}
function townClosePanel(){
  Town.panel = false; hideOverlay(); Town.hold = false;
}
function townBar(a, b){ return '<span class="tbar"><i style="width:' + Math.round(100 * Math.min(1, a / Math.max(1, b))) + '%"></i></span>'; }
function townShowMenu(){
  townPanel('Longneck Town', '<p class="sub">' + townFoundTotal() + ' of ' + TOWN_ITEMS.length + ' things found.</p><div class="menucol" style="width:100%">' +
    '<button class="btn" data-a="town-close">Keep exploring</button>' +
    '<button class="btn ghost" data-a="town-journal">Journal</button><button class="btn ghost" data-a="town-map">Map and tram</button>' +
    '<button class="btn ghost" data-a="town-exit">Back to the main menu</button></div>');
}
let _tjTab = 'errands';
function townShowJournal(tab){
  if (tab) _tjTab = tab;
  const tabs = [['errands', 'Errands'], ['finds', 'Finds'], ['friends', 'Friends'], ['tracks', 'Tracks']];
  let th = '<div class="tabs">';
  tabs.forEach(function(x){ th += '<button class="tab' + (x[0] === _tjTab ? ' on' : '') + '" data-a="town-jt-' + x[0] + '">' + x[1] + '</button>'; });
  th += '</div>';
  let b = '';
  const t = townData();
  if (_tjTab === 'errands'){
    const act = TOWN_ERRANDS.filter(function(e){ return townErrState(e.id) === 1; }), done = TOWN_ERRANDS.filter(function(e){ return townErrState(e.id) === 2; }).length;
    b += '<p class="sub">' + done + ' of ' + TOWN_ERRANDS.length + ' errands done.</p>';
    if (!act.length) b += '<p class="sub">Nothing on the go. Talk to the herd and ask for an errand, or look at the notice board in the square.</p>';
    act.forEach(function(e){
      const nd = townNeed(e), ready = townErrandReady(e), who = TOWN_NPCS[e.npc];
      b += '<div class="tjrow"><b>' + T(e.title) + '</b> <span class="tjwho">for ' + who.name + (who.d !== 'roam' ? ' in ' + TOWN_DIST[who.d].name : '') + '</span><div class="tjtxt">' + T(e.offer) + '</div>' +
        '<div class="tjneed' + (ready ? ' ok' : '') + '">' + townNeedText(e) + (ready ? '  — ready to hand in' : '') + '</div>' + townBar(nd.cur, nd.max) + '</div>';
    });
    const open = TOWN_NPC_LIST.map(townErrandFor).filter(function(e){ return e && townErrState(e.id) === 0 && townErrandAvailable(e); });
    if (open.length){ b += '<div class="sub" style="margin-top:10px;font-weight:700;color:var(--sun)">Waiting to be asked</div>'; open.forEach(function(e){ const w = TOWN_NPCS[e.npc]; b += '<div class="tjline">' + w.name + (w.d !== 'roam' ? ' (' + TOWN_DIST[w.d].name + ')' : '') + ' has an errand.</div>'; }); }
  } else if (_tjTab === 'finds'){
    const dl = townDaily();
    b += '<p class="sub">' + townFoundTotal() + ' of ' + TOWN_ITEMS.length + ' found. Today: ' + dl.got.length + ' of ' + dl.dig.length + ' glimmers dug' + (dl.dot ? ', and Dot found' : ', and Dot is hiding somewhere') + '.</p>';
    TOWN_IDS.forEach(function(id){
      const D = TOWN_DIST[id], open = D.open(), all = townItemsIn(id).length, got = townFoundIn(id);
      b += '<div class="tjrow' + (open ? '' : ' locked') + '"><b>' + D.name + '</b> <span class="tjwho">' + (open ? got + ' of ' + all + (t.done[id] ? '  — all found' : '') : 'Opens after: ' + D.need) + '</span>' + (open ? townBar(got, all) : '') + '</div>';
    });
    b += '<div class="sub" style="margin-top:10px">Coat colours found: ';
    WARD_TOWN.forEach(function(w, i){ const f = townFound(w[2]); b += '<span class="dotsw" title="' + (f ? w[0] : 'Not found yet') + '" style="background:' + (f ? w[1] : 'rgba(255,255,255,.12)') + '"></span>'; });
    b += '</div>';
  } else if (_tjTab === 'friends'){
    TOWN_NPC_LIST.forEach(function(id){
      const d = TOWN_NPCS[id], l = townBondLevel(id), p = townBond(id), nx = TOWN_BOND_AT[Math.min(3, l + 1)];
      b += '<div class="tjrow"><b>' + d.name + '</b> <span class="tjwho">' + TOWN_BOND_NAMES[l] + (d.d !== 'roam' && townOpen(d.d) ? ' · ' + TOWN_DIST[d.d].name : '') + '</span>' +
        townBar(Math.min(p, 30), 30) + '<div class="tjtxt">' + (l >= 3 ? 'Best friends. Their gift is yours.' : p + ' of ' + nx + ' to the next level' + (l >= 1 ? ' · likes ' + TOWN_GIFTS.filter(function(g){ return g[0] === d.fav; })[0][1].toLowerCase() : '')) + '</div></div>';
    });
  } else {
    const trk = TOWN_ITEMS.filter(function(it){ return it.t === 'track'; });
    b += '<p class="sub">Footprints she has found. A creature she has met shows its picture.</p><div class="trkgrid">';
    trk.forEach(function(it, i){
      const got = townFound(it.id), seen = got && (bestiaryData().creatures[it.ch + ':' + it.type] | 0) > 0;
      b += '<div class="trk' + (got ? '' : ' locked') + '"><canvas width="84" height="68" data-trk="' + i + '"></canvas><div class="trkn">' + (got ? (seen ? TOWN_TRACK_NAME(it) : 'Unknown creature') : 'Not found') + '</div><div class="trkd">' + TOWN_DIST[it.d].name + '</div></div>';
    });
    b += '</div>';
  }
  townPanel('Journal', th + b, true);
  if (_tjTab === 'tracks') townPaintTracks();
}
function townPaintTracks(){
  const cs = document.querySelectorAll('canvas[data-trk]'), trk = TOWN_ITEMS.filter(function(it){ return it.t === 'track'; });
  for (let i = 0; i < cs.length; i++){
    const it = trk[+cs[i].getAttribute('data-trk')]; if (!it) continue;
    const c = cs[i].getContext('2d'); c.clearRect(0, 0, 84, 68);
    const got = townFound(it.id), seen = got && (bestiaryData().creatures[it.ch + ':' + it.type] | 0) > 0;
    if (!got){ c.fillStyle = 'rgba(255,255,255,.25)'; c.font = 'bold 28px system-ui'; c.textAlign = 'center'; c.fillText('?', 42, 44); continue; }
    if (!seen){ c.fillStyle = '#6A4A32'; c.beginPath(); c.ellipse(42, 42, 14, 11, 0, 0, TAU); c.fill(); [[-14, -8], [-5, -17], [5, -17], [14, -7]].forEach(function(p){ c.beginPath(); c.ellipse(42 + p[0], 40 + p[1], 5, 6.4, 0, 0, TAU); c.fill(); }); continue; }
    try {
      const def = bestiaryTable(it.ch)[it.type], k = 26 / Math.max(10, def.r);
      c.save(); c.translate(42, 36); c.scale(k, k);
      drawEnemy(c, { portrait: true, def: def, type: it.type, x: 0, y: 0, r: def.r, ang: 0, flash: 0, state: 'idle', anim: 0.6, hp: 1, maxHp: 1, big: def.big, kx: 0, ky: 0, stunT: 0, burnT: 0, slowT: 0, slowMul: 1 });
      c.restore();
    } catch (e) {}
  }
}
function townShowMap(){
  let b = '<p class="sub">Walk off the end of a street, or take the tram.</p><div class="tjmap">';
  TOWN_IDS.forEach(function(id){
    const D = TOWN_DIST[id], open = D.open(), cur = id === Town.d, all = townItemsIn(id).length;
    b += '<div class="tjrow' + (open ? '' : ' locked') + (cur ? ' cur' : '') + '"><b>' + D.name + '</b><span class="tjwho">' + (open ? townFoundIn(id) + ' of ' + all + ' found' : 'Opens after: ' + D.need) + '</span>' +
      '<button class="btn sm' + (open && !cur ? '' : ' ghost') + '" data-a="town-go-' + id + '"' + (open && !cur ? '' : ' disabled') + '>' + (cur ? 'You are here' : open ? 'Go' : 'Closed') + '</button></div>';
  });
  townPanel('Map and tram', b + '</div>');
}
function townShowHall(){
  const d = Save.data;
  let tr = '<div class="trophies">';
  for (let c = 1; c <= 13; c++){ const done = townDoneCh(c); tr += '<span class="troph' + (done ? ' on' : '') + '" title="' + (done ? CHAPTER_INFO[c - 1].name : 'Chapter ' + c + ' not finished') + '" style="' + (done ? 'background:' + WARD[c].c : '') + '">' + c + '</span>'; }
  tr += '</div>';
  townPanel('Herd Hall', '<p class="sub">The hall keeps the herd’s records: a pennant on the square for every chapter, and these.</p>' + tr +
    '<ul class="helplist"><li>Best run: <b>' + fmt(scoreInt(d.best)) + '</b> points, wave <b>' + (d.bestWave | 0) + '</b></li><li>Runs: <b>' + (d.runs | 0) + '</b> · kills: <b>' + fmt(d.totalKills | 0) + '</b></li>' +
    '<li>Chapters finished: <b>' + townChaptersDone() + ' of 13</b>' + (d.chaptersComplete ? ' · whole journeys: <b>' + d.chaptersComplete + '</b>' : '') + '</li>' +
    '<li>Minigame stars: <b>' + (typeof miniStarTotal === 'function' ? miniStarTotal() : 0) + ' of 39</b> · hats and boots: <b>' + accOwnedCount() + ' of ' + ACC_ITEMS.length + '</b></li>' +
    '<li>Photos in the album: <b>' + photoAlbum().length + ' of ' + PHOTO_ALBUM_MAX + '</b></li><li>Things found in town: <b>' + townFoundTotal() + ' of ' + TOWN_ITEMS.length + '</b></li>' +
    '<li>Best friends: <b>' + TOWN_NPC_LIST.filter(function(i){ return townBondLevel(i) >= 3; }).length + ' of ' + TOWN_NPC_LIST.length + '</b></li></ul>');
}
function townShowBoard(){
  let b = '<div class="sub" style="font-weight:700;color:var(--sun)">Errands waiting</div>';
  const open = TOWN_NPC_LIST.map(townErrandFor).filter(function(e){ return e && townErrandAvailable(e) && townErrState(e.id) < 2; });
  if (!open.length) b += '<p class="sub">Nothing pinned up right now.</p>';
  open.forEach(function(e){ const w = TOWN_NPCS[e.npc]; b += '<div class="tjline"><b>' + T(e.title) + '</b> — ' + w.name + (w.d !== 'roam' ? ', ' + TOWN_DIST[w.d].name : ', somewhere') + (townErrState(e.id) === 1 ? ' (on the go)' : '') + '</div>'; });
  /* the wanted board: the creatures she has beaten most */
  const rows = [], bd = bestiaryData().creatures;
  Object.keys(bd).forEach(function(k){ const n = bd[k] | 0; if (n > 0) rows.push({ k: k, n: n }); });
  rows.sort(function(a, c){ return c.n - a.n; });
  b += '<div class="sub" style="margin-top:12px;font-weight:700;color:var(--sun)">Most wanted: the ones you have beaten most</div>';
  if (!rows.length) b += '<p class="sub">No sightings yet. Go and meet some creatures.</p>';
  rows.slice(0, 5).forEach(function(r){
    const p = r.k.split(':'), ch = +p[0];
    let name = p[1];
    try { name = bestiaryName(ch, p[1]).title + ' (' + BESTIARY_CHAPTERS[ch - 1] + ')'; } catch (e) {}
    b += '<div class="tjline"><b>' + name + '</b> — beaten ' + fmt(r.n) + (r.n === 1 ? ' time' : ' times') + '</div>';
  });
  const dl = townDaily();
  b += '<p class="sub" style="margin-top:10px">Today: ' + dl.got.length + ' of ' + dl.dig.length + ' glimmering spots dug' + (dl.dot ? ', Dot found' : '') + '.</p>';
  townPanel('Notice board', b);
}
function townShowScores(){
  let rows = '';
  const md = miniData();
  for (let ch = 1; ch <= TOTAL_CHAPTERS; ch++){
    const m = MINI[ch]; if (!m) continue;
    const un = miniUnlocked(ch), s = md.stars[ch] | 0, best = md.best[ch] | 0;
    rows += '<div class="tjrow' + (un ? '' : ' locked') + '"><b>' + m.name + '</b><span class="tjwho">' + (un ? (best ? 'Best ' + best : 'Not played') + ' · ' + '★'.repeat(s) + '☆'.repeat(3 - s) : 'Finish Chapter ' + ch) + '</span>' +
      '<button class="btn sm' + (un ? '' : ' ghost') + '" data-a="town-mini-' + ch + '"' + (un ? '' : ' disabled') + '>Play</button></div>';
  }
  townPanel('High scores', '<p class="sub">One play every two minutes: <b data-mini-cd>' + miniCdText() + '</b></p>' + rows, true);
}
function townShowLibrary(){
  townPanel('Library', '<p class="sub">Shelves floor to ceiling. The librarian is somewhere up the ladder.</p><div class="menucol" style="width:100%">' +
    '<button class="btn" data-a="town-lib-bestiary">Bestiary<small>' + (bestiaryCounts().creatures + bestiaryCounts().cards) + ' of ' + (BESTIARY_TOTAL_CREATURES + CARDS.length) + ' discovered</small></button>' +
    '<button class="btn ghost" data-a="town-lib-guide">Guide<small>How it all works</small></button>' +
    '<button class="btn ghost" data-a="town-lib-album">The album<small>' + photoAlbum().length + ' of ' + PHOTO_ALBUM_MAX + ' photos</small></button></div>');
}
function townShowMission(){
  const ship = typeof shipUnlocked === 'function' && venusUnlocked() && shipUnlocked();
  const row = function(a, name, sub, ok, lock){ return '<button class="btn' + (ok ? '' : ' ghost') + '" data-a="' + a + '"' + (ok ? '' : ' disabled') + '>' + name + '<small>' + (ok ? sub : lock) + '</small></button>'; };
  townPanel('Mission Control', '<p class="sub">Screens flicker with other worlds. Each console is a door to a place she has been.</p><div class="menucol" style="width:100%">' +
    row('town-mi-venus', 'Venus outpost', ship ? 'Scouting, upgrades and the spaceplane' : 'Scouting and upgrades', venusUnlocked(), 'Not reached yet') +
    row('town-mi-mars', 'Mars outpost', 'Scouting and upgrades', marsUnlocked(), 'Not reached yet') +
    row('town-mi-lab', 'The giraffe lab', 'Mutations and the dust squad', labUnlocked(), 'Not reached yet') + '</div>');
}

/* ---- actions from the panels ---- */
function handleTownAction(a){
  if (a === 'town-enter'){ SFX.click(); townEnter(townData().last); return true; }
  if (a === 'town-close'){ SFX.click(); townClosePanel(); return true; }
  if (a === 'town-exit'){ SFX.click(); townClosePanel(); townExit(); return true; }
  if (a === 'town-journal'){ SFX.click(); townShowJournal(); return true; }
  if (a === 'town-map'){ SFX.click(); townShowMap(); return true; }
  let m = /^town-jt-(\w+)$/.exec(a);
  if (m){ SFX.click(); townShowJournal(m[1]); return true; }
  m = /^town-go-(\w+)$/.exec(a);
  if (m){ if (TOWN_DIST[m[1]] && townOpen(m[1])){ townClosePanel(); if (typeof townRide === 'function') townRide(m[1]); else townGo(m[1]); } else SFX.deny(); return true; }
  m = /^town-mini-(\d+)$/.exec(a);
  if (m){ const ch = +m[1]; if (!miniUnlocked(ch)){ SFX.deny(); return true; } townClosePanel(); townLeaveFor(function(){ if (!startMini(ch, null, 'menu')){ townResume(); } }); return true; }
  if (a === 'town-lib-bestiary'){ townClosePanel(); townLeaveFor(function(){ SFX.click(); showBestiary(); }); return true; }
  if (a === 'town-lib-guide'){ townClosePanel(); townLeaveFor(function(){ SFX.click(); showHelp(); }); return true; }
  if (a === 'town-lib-album'){ townClosePanel(); townLeaveFor(function(){ SFX.click(); showBook(); }); return true; }
  if (a === 'town-mi-venus'){ townClosePanel(); townLeaveFor(function(){ SFX.click(); showVenus(); }); return true; }
  if (a === 'town-mi-mars'){ townClosePanel(); townLeaveFor(function(){ SFX.click(); showMars(); }); return true; }
  if (a === 'town-mi-lab'){ townClosePanel(); townLeaveFor(function(){ SFX.click(); labLast = null; showLab(); }); return true; }
  return false;
}

/* ---- the main menu button and the guide page ---- */
function townButtonHTML(){
  return '<button class="btn ghost" data-a="town-enter">Longneck Town<small>' + townFoundTotal() + ' of ' + TOWN_ITEMS.length + ' things found · ' + townOpenCount() + ' of ' + TOWN_IDS.length + ' places open</small></button>';
}
(function(){
  const i = GUIDE_TOPICS.findIndex(function(t){ return t.id === 'wardrobe'; });
  GUIDE_TOPICS.splice(i + 1, 0, { id: 'town', title: 'Longneck Town', show: function(){ return true; }, html: function(){
    let h = '<p>A town to walk through between runs, from the <b>Longneck Town</b> button on the main menu. It scrolls sideways; the street is one long line of places.</p><ul class="helplist">' +
      '<li><b>Walk</b> with the move keys. <b>Hold up</b> to stretch her neck: some things hang too high to reach any other way. On a touch screen, hold a finger on the street to walk, and hold it above her head to stretch.</li>' +
      '<li><b>Use things</b> with <b>E</b>, Enter or Space, or tap the prompt that appears. <b>J</b> opens the journal, <b>M</b> the map and tram, Escape the menu.</li>' +
      '<li>Doors lead to screens you already know: the tailor is the wardrobe, the trading post is the post, the arcade holds the minigames, and so on. Closing one brings you back to the town.</li>' +
      '<li><b>Things to find</b>: coins, stars, gems, lost hats and boots, creature tracks and five hidden coat colours. The journal counts what is found in each place, and finding everything in one pays a bonus. Each day three spots in the town glimmer: stand on one and press E to dig it up. Dot, the smallest giraffe, hides somewhere new each day.</li>' +
      '<li><b>The herd</b> have errands, and each one you finish makes you better friends. Chat once a day, or give a gift (they each like one best). At the friend level they give gems, and at the best friend level a hat or boots.</li>' +
      '<li>The town has a day and night (a day is twelve minutes) and some rain. Some errands want you there after dark.</li>';
    const open = townOpenCount();
    h += '<li><b>' + open + ' of ' + TOWN_IDS.length + ' places are open.</b> ' + (open < TOWN_IDS.length ? 'The others open as you progress; the street has a sign at its end that says what it wants.' : 'Everything is open.') + '</li>';
    return h + '</ul>';
  } });
})();
