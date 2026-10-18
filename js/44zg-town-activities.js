'use strict';
/* Longneck Town, seventh part: things to do in places that were only places. */
/* ========================= 44zg. ACTIVITIES ========================= */
/* 1 THE CAFE SHIFT: at the bar she can work a short shift (25 s): an order appears, press the right item. Only the first three shifts
      of a day pay (Save.data.town.n.cafeD / cafeN). Her score pays gold, and gems for a very good one.
   2 THE WEEKLY TOURNAMENT: each week one of the unlocked minigames is the featured one. The herd's names have scores for it that are
      the same for everyone in that week; hers is the best she has scored in it this week (Save.data.town.tour = { w, ch, best, got }).
      Her rank pays gems, claimed once a week.
   3 FISHING: from the end of the pier (Harbour). Cast, then press Reel when the marker is in the green. Twelve kinds, one only at night.
      Save.data.town.fish = { id: count }. A first catch of a kind pays gems; catching every kind pays a bonus once.
   4 THE POST BOX in the square: one letter a day from one of the herd (more likely from a friend), with a small gift
      (Save.data.town.mail = { d, from, text, gift, got, log:[] }). Reading it also warms the friendship by a point. */
function townDayStamp(){ return townDayKey(); }
function townWeekKey(){ return Math.floor(Date.now() / 604800000); }

/* ---- the cafe shift ---- */
const CAFE_ITEMS = [['tea', 'Tea'], ['bun', 'Bun'], ['cake', 'Cake'], ['soup', 'Soup'], ['juice', 'Juice'], ['toast', 'Toast']];
let _cg = null;
function _cgStop(){ if (_cg && _cg.iv){ clearInterval(_cg.iv); _cg.iv = 0; } }
function townShowCafeGame(){
  _cgStop();
  const t = townData(), today = townDayKey();
  if (t.n.cafeD !== today){ t.n.cafeD = today; t.n.cafeN = 0; }
  _cg = { left: 25, score: 0, miss: 0, order: CAFE_ITEMS[Math.floor(Math.random() * CAFE_ITEMS.length)][0], iv: 0, over: false, paid: (t.n.cafeN | 0) < 3 };
  let btns = '';
  CAFE_ITEMS.forEach(function(it){ btns += '<button class="chalk" data-a="town-cg-' + it[0] + '">' + it[1] + '</button>'; });
  townPanelT('bakery', '<div class="tp-title">A SHIFT AT THE BAR</div><div class="menuboard"><div class="mb"><span>Customer wants</span><b id="cgOrder"></b></div></div>' +
    '<div class="chalkrow" style="flex-wrap:wrap">' + btns + '</div><div class="stock"><span id="cgTime"></span> · served <b id="cgScore">0</b> · mistakes <b id="cgMiss">0</b></div>' +
    '<p class="tnote">' + (_cg.paid ? 'This shift pays.' : 'You have worked three shifts today. This one is for fun.') + '</p>', { w: 520 });
  const upd = function(){
    const o = document.getElementById('cgOrder'); if (!o || !_cg) { _cgStop(); return; }
    o.textContent = (CAFE_ITEMS.filter(function(i){ return i[0] === _cg.order; })[0] || ['', ''])[1];
    document.getElementById('cgTime').textContent = Math.max(0, _cg.left).toFixed(1) + ' s'; document.getElementById('cgScore').textContent = _cg.score; document.getElementById('cgMiss').textContent = _cg.miss;
  };
  upd();
  _cg.iv = setInterval(function(){
    if (!_cg || _cg.over) return;
    _cg.left -= 0.1; upd();
    if (_cg.left <= 0) townCafeEnd();
  }, 100);
}
function townCafeEnd(){
  if (!_cg || _cg.over) return;
  _cg.over = true; _cgStop();
  const t = townData(), s = _cg.score, gold = _cg.paid ? Math.round(townCoin() * 0.15 * s) : 0, gems = _cg.paid ? (s >= 18 ? 12 : s >= 12 ? 6 : s >= 7 ? 2 : 0) : 0;
  if (_cg.paid){ t.n.cafeN = (t.n.cafeN | 0) + 1; townPay({ gold: gold, gems: gems }); }
  Save.write();
  townPanelT('bakery', '<div class="tp-title">SHIFT OVER</div><div class="stock">You served <b>' + s + '</b>' + (_cg.miss ? ' (and mixed up ' + _cg.miss + ')' : '') + '.</div>' +
    '<p>' + (_cg.paid ? 'Tips: <b>' + fmt(gold) + ' gold</b>' + (gems ? ' and <b>' + gems + ' gems</b>' : '') + '.' : 'No tips today, but everyone is happy.') + '</p>' +
    '<div class="chalkrow"><button class="chalk" data-a="town-cg-again">Another shift</button></div>', { w: 480 });
  SFX.level();
}
function townCafeServe(id){
  if (!_cg || _cg.over) return;
  if (id === _cg.order){ _cg.score++; SFX.coin(); _cg.left = Math.min(30, _cg.left + 0.5); }
  else { _cg.miss++; _cg.left -= 1.5; SFX.deny(); }
  let n = _cg.order; while (n === _cg.order) n = CAFE_ITEMS[Math.floor(Math.random() * CAFE_ITEMS.length)][0];
  _cg.order = n;
}

/* ---- the tournament ---- */
function townTour(){
  const t = townData(), w = townWeekKey(), open = [];
  for (let c = 1; c <= TOTAL_CHAPTERS; c++) if (MINI[c] && miniUnlocked(c)) open.push(c);
  if (!open.length) return null;
  const ch = open[w % open.length];
  if (!t.tour || t.tour.w !== w || t.tour.ch !== ch) t.tour = { w: w, ch: ch, best: 0, got: 0 };
  const goal = MINI[ch].goal > 0 ? MINI[ch].goal : 20, r = miniRng(townHash('tour' + w + ':' + ch));
  const names = TOWN_NPC_LIST.slice().sort(function(a, b){ return townHash(a + w) - townHash(b + w); }).slice(0, 7);
  const herd = names.map(function(id){ return { name: TOWN_NPCS[id].name, score: Math.round(goal * (0.35 + r() * 1.35)) }; });
  const mine = { name: 'You', score: t.tour.best | 0, you: true };
  const all = herd.concat([mine]).sort(function(a, b){ return b.score - a.score; });
  const rank = all.indexOf(mine) + 1;
  return { w: w, ch: ch, all: all, rank: rank, t: t.tour, daysLeft: Math.ceil(7 - ((Date.now() / 86400000) % 7)) };
}
function townTourRecord(ch, score){
  try { const i = townTour(); if (i && i.ch === ch && score > (i.t.best | 0)){ i.t.best = score | 0; Save.write(); } } catch (e) {}
}
(function(){
  const em = endMini;
  endMini = function(abandon){
    const m = G.mini, r = em.apply(this, arguments);
    if (m && !abandon && !m.abandon) townTourRecord(m.ch, m.score | 0);
    return r;
  };
})();
function townShowTour(){
  const i = townTour();
  if (!i){ townPanelT('scores', '<div class="tp-title">TOURNAMENT</div><p>No minigame is awake yet. Finish a chapter and its cabinet lights up.</p>', { w: 520 }); return; }
  let rows = '';
  i.all.forEach(function(e, k){ rows += '<div class="hs' + (e.you ? ' you' : '') + '"><span class="hn">' + (k + 1) + '</span><span class="hg">' + e.name + '</span><span class="hv">' + String(e.score).padStart(5, '0') + '</span><span></span><span></span></div>'; });
  const reward = i.rank === 1 ? 40 : i.rank === 2 ? 25 : i.rank === 3 ? 15 : 5, claimed = i.t.got === 1, played = (i.t.best | 0) > 0;
  townPanelT('scores', '<div class="tp-title">WEEKLY TOURNAMENT</div><p class="hsfoot" style="margin:0 0 8px">THIS WEEK: <b>' + MINI[i.ch].name + '</b> · about ' + i.daysLeft + ' days left</p><div class="hsrows">' + rows + '</div>' +
    '<div class="hsfoot">' + (!played ? 'PLAY IT TO ENTER' : claimed ? 'PRIZE CLAIMED' : 'YOU ARE ' + i.rank + (i.rank === 1 ? 'ST' : i.rank === 2 ? 'ND' : i.rank === 3 ? 'RD' : 'TH') + ': ' + reward + ' GEMS') + '</div>' +
    '<div class="row" style="margin-top:8px;justify-content:center"><button class="neon" data-a="town-mini-' + i.ch + '">PLAY IT</button>' + (played && !claimed ? '<button class="neon" data-a="town-tourclaim">CLAIM</button>' : '') + '</div>', { w: 600 });
}
(function(){
  const ss = townShowScores;
  townShowScores = function(){
    ss();
    const f = document.querySelector('.tp-scores .hsfoot'); if (!f) return;
    const b = document.createElement('button'); b.className = 'neon'; b.setAttribute('data-a', 'town-tour'); b.textContent = 'WEEKLY TOURNAMENT'; b.style.margin = '8px auto 0'; b.style.display = 'block';
    f.parentNode.insertBefore(b, f.nextSibling);
  };
})();

/* ---- fishing ---- */
const FISH = [
  { id: 'sardine', name: 'Sardine', v: 1, r: 22 }, { id: 'mackerel', name: 'Mackerel', v: 1.5, r: 18 }, { id: 'herring', name: 'Herring', v: 1.5, r: 14 }, { id: 'trout', name: 'Trout', v: 2.5, r: 12 },
  { id: 'pike', name: 'Pike', v: 3, r: 8 }, { id: 'eel', name: 'Eel', v: 3.5, r: 6 }, { id: 'boot', name: 'Old Boot', v: 0.5, r: 6 }, { id: 'seahorse', name: 'Seahorse', v: 5, r: 4 },
  { id: 'puffer', name: 'Pufferfish', v: 5, r: 3 }, { id: 'squid', name: 'Squid', v: 6, r: 3 }, { id: 'sword', name: 'Swordfish', v: 9, r: 2 }, { id: 'carp', name: 'Golden Carp', v: 15, r: 1 },
  { id: 'jelly', name: 'Moon Jelly', v: 8, r: 3, night: true }
];
let _fs = null;
function fishLog(){ const t = townData(); if (!t.fish || typeof t.fish !== 'object' || Array.isArray(t.fish)) t.fish = {}; return t.fish; }
function fishPick(){
  const night = townIsNight(), pool = FISH.filter(function(f){ return !f.night || night; });
  let tot = 0; pool.forEach(function(f){ tot += f.r * (Town.rainK > 0.4 && f.v >= 3 ? 1.5 : 1); });
  let x = Math.random() * tot;
  for (let i = 0; i < pool.length; i++){ x -= pool[i].r * (Town.rainK > 0.4 && pool[i].v >= 3 ? 1.5 : 1); if (x <= 0) return pool[i]; }
  return pool[0];
}
function townShowFishing(msg){
  if (_fs && _fs.iv){ clearInterval(_fs.iv); }
  const log = fishLog();
  let rows = '';
  FISH.forEach(function(f){ rows += '<span class="fsh' + (log[f.id] ? ' on' : '') + '" title="' + (log[f.id] ? f.name + ' ×' + log[f.id] : (f.night ? 'Only at night' : 'Not caught yet')) + '">' + (log[f.id] ? f.name : '?') + (log[f.id] > 1 ? ' ×' + log[f.id] : '') + '</span>'; });
  townPanelT('fish', '<div class="tp-title">THE END OF THE PIER</div><div class="fishmsg" id="fishMsg">' + (msg || 'Cast a line.') + '</div>' +
    '<div class="fishbar" id="fishBar" style="display:none"><div class="fzone" id="fishZone"></div><i id="fishMark"></i></div>' +
    '<div class="chalkrow"><button class="chalk" data-a="town-fish-cast" id="fishCast">Cast</button><button class="chalk" data-a="town-fish-reel" id="fishReel" style="display:none">Reel in!</button></div>' +
    '<div class="fishlog">' + rows + '</div><p class="tnote">' + Object.keys(log).filter(function(k){ return log[k] > 0; }).length + ' of ' + FISH.length + ' kinds caught' + (townIsNight() ? ' · the moon jelly is out' : '') + '</p>', { w: 560 });
  _fs = { phase: 'idle', iv: 0 };
}
function townFishCast(){
  if (!_fs || _fs.phase !== 'idle') return;
  const fish = fishPick(); _fs.fish = fish; _fs.phase = 'wait'; _fs.t = 0; _fs.wait = 1 + Math.random() * 2.2;
  document.getElementById('fishMsg').textContent = 'The float drifts...'; document.getElementById('fishCast').style.display = 'none';
  SFX.click();
  _fs.iv = setInterval(function(){
    const mk = document.getElementById('fishMark'); if (!_fs || !document.getElementById('fishMsg')){ if (_fs) clearInterval(_fs.iv); return; }
    _fs.t += 0.03;
    if (_fs.phase === 'wait' && _fs.t > _fs.wait){
      _fs.phase = 'bite'; _fs.t = 0; _fs.zone = 0.18 + Math.random() * 0.5; _fs.w = clamp(0.28 - fish.v * 0.012, 0.1, 0.28); _fs.speed = 1.4 + fish.v * 0.12;
      document.getElementById('fishMsg').textContent = 'A bite! Reel when the marker is in the green.';
      document.getElementById('fishBar').style.display = 'block'; document.getElementById('fishReel').style.display = 'inline-block';
      const z = document.getElementById('fishZone'); z.style.left = (_fs.zone * 100) + '%'; z.style.width = (_fs.w * 100) + '%';
      try { SFX.tone('triangle', 660, 660, 0.12, 0.08, 0, 0); } catch (e) {}
    }
    if (_fs.phase === 'bite'){
      _fs.pos = 0.5 + 0.5 * Math.sin(_fs.t * _fs.speed * 2.2); mk.style.left = (_fs.pos * 100) + '%';
      if (_fs.t > 5.5) townFishResult(false);
    }
  }, 30);
}
function townFishResult(win){
  if (!_fs || _fs.phase === 'idle') return;
  clearInterval(_fs.iv); _fs.phase = 'idle';
  const f = _fs.fish; let msg;
  if (win){
    const log = fishLog(), first = !(log[f.id] > 0);
    log[f.id] = (log[f.id] | 0) + 1;
    const gold = Math.round(townCoin() * f.v * 0.6);
    let pay = { gold: gold };
    if (first) pay.gems = 5;
    townPay(pay);
    const t = townData();
    msg = 'You caught a ' + f.name + '! +' + fmt(gold) + ' gold' + (first ? ' and 5 gems for a new kind' : '') + '.';
    if (FISH.every(function(x){ return log[x.id] > 0; }) && !t.n.fishAll){ t.n.fishAll = 1; townPay({ gems: 100 }); msg += ' Every kind caught: +100 gems!'; SFX.transform(); } else SFX.level();
  } else { msg = 'It got away.'; SFX.deny(); }
  Save.write();
  townShowFishing(msg);
}

/* ---- the post box ---- */
function townMailToday(){
  const t = townData(), today = townDayKey();
  if (!t.mail || typeof t.mail !== 'object' || Array.isArray(t.mail)) t.mail = { log: [] };
  const m = t.mail;
  if (!Array.isArray(m.log)) m.log = [];
  if (m.d !== today){
    const r = miniRng(townHash(today + 'mail')), pool = [];
    TOWN_NPC_LIST.forEach(function(id){ if (id === 'dot') return; const w = 1 + townBondLevel(id) * 2; for (let i = 0; i < w; i++) pool.push(id); });
    const from = pool[Math.floor(r() * pool.length)], def = TOWN_NPCS[from];
    const opening = ['Dear friend,', 'Hello there,', 'Dear neighbour,', 'To the tall one,', 'Just a note,'][Math.floor(r() * 5)];
    const kind = r(), gift = kind < 0.4 ? { gold: Math.round(townCoin() * (2 + Math.floor(r() * 3))) } : kind < 0.7 ? { gems: 5 + Math.floor(r() * 8) } : kind < 0.92 ? { bread: 2 + Math.floor(r() * 3) } : { flower: 1 };
    m.d = today; m.from = from; m.gift = gift; m.got = false;
    m.text = opening + ' ' + (def.say[Math.floor(r() * def.say.length)] || 'Lovely day.') + ' ' + ['Come and see me.', 'Hope this finds you well.', 'Mind the neck.', 'Yours, with love.'][Math.floor(r() * 4)];
  }
  return m;
}
function townShowMail(){
  const m = townMailToday(), def = TOWN_NPCS[m.from];
  const giftTxt = m.gift.gold ? fmt(m.gift.gold) + ' gold' : m.gift.gems ? m.gift.gems + ' gems' : m.gift.bread ? m.gift.bread + ' loaves of bread' : 'a pressed flower (and a warm feeling)';
  let old = '';
  m.log.slice().reverse().slice(0, 5).forEach(function(l){ old += '<div class="oldl"><b>' + l.from + '</b>: ' + T(l.text) + '</div>'; });
  townPanelT('mail', '<div class="tp-title">TODAY’S POST</div><div class="letter"><div class="stamp"></div><p>' + T(m.text) + '</p><p class="sig">— ' + def.name + '</p>' +
    (m.got ? '<p class="lg">Already read. (It had ' + giftTxt + '.)</p>' : '<p class="lg">There is something in the envelope: <b>' + giftTxt + '</b>.</p><button class="chalk" data-a="town-mail-open">Take it</button>') + '</div>' +
    (old ? '<div class="oldmail"><div class="tnote">Earlier letters</div>' + old + '</div>' : ''), { w: 520 });
}
function townMailTake(){
  const m = townMailToday(); if (m.got) return;
  m.got = true;
  if (m.gift.gold) townPay({ gold: m.gift.gold });
  else if (m.gift.gems) townPay({ gems: m.gift.gems });
  else if (m.gift.bread){ const t = townData(); t.n.loaves = Math.min(typeof breadCap === 'function' ? breadCap() : BREAD_CAP, breadStock() + m.gift.bread); }
  townAddBond(m.from, m.gift.flower ? 2 : 1);
  m.log.push({ from: TOWN_NPCS[m.from].name, text: m.text }); if (m.log.length > 10) m.log.shift();
  Save.write(); SFX.level();
}

/* ---- wiring ---- */
(function(){
  const H = TOWN_DIST.harbour, S = TOWN_DIST.square;
  H.b.push({ id: 'fishspot', kind: 'fishspot', x: 1010, w: 120, h: 0, label: 'The end of the pier', act: 'fish' });
  S.b.push({ id: 'postbox', kind: 'postbox', x: 2030, w: 70, h: 100, label: 'The post box', act: 'mail' });
  const bx = townBuildingX;
  townBuildingX = function(c, D, b, P, r){
    if (b.kind === 'fishspot') return true;
    if (b.kind === 'postbox'){
      const x = b.x;
      tRect(c, '#5A3B22', x - 3, TG - 54, 6, 54); tRound(c, '#C4382F', x - 26, TG - 108, 52, 58, 14); tRect(c, '#8A1F18', x - 22, TG - 90, 44, 5); tRect(c, '#F4F1E8', x - 12, TG - 76, 24, 16);
      c.fillStyle = '#3A2A1E'; c.font = 'bold 9px system-ui'; c.textAlign = 'center'; c.fillText('POST', x, TG - 66);
      return true;
    }
    return bx(c, D, b, P, r);
  };
  const tu = townUse, nr = townNearest, cp = townClosePanel;
  townClosePanel = function(){ _cgStop(); if (_fs && _fs.iv){ clearInterval(_fs.iv); _fs.phase = 'idle'; } cp(); };
  townUse = function(o){
    if (o.k === 'b'){
      const b = o.b;
      if (b.act === 'fish'){ townShowFishing(); return; }
      if (b.act === 'mail'){ townShowMail(); return; }
      if (b.act === 'order'){
        townSay({ name: 'The bar', text: ['The cups clink. Everyone is murmuring. Nobody is in a hurry.', 'A steaming mug appears. You drink it with your head slightly tipped.', 'Someone slides over a warm bun. You eat it slowly.'][Math.floor(Math.random() * 3)] },
          [{ label: 'Work a shift', fn: function(){ townCloseDialog(); townShowCafeGame(); } }, { label: 'Listen in', fn: function(){ townSay({ name: 'Overheard', text: townHint() || 'Everyone is talking about you. Nicely.' }, []); } }, { label: 'Leave it', fn: function(){ townCloseDialog(); } }]);
        return;
      }
    }
    tu(o);
  };
  townNearest = function(D, inp){
    const o = nr(D, inp);
    if (o && o.k === 'b'){
      if (o.b.act === 'fish') o.label = 'Go fishing'; else if (o.b.act === 'mail') o.label = 'Check the post'; else if (o.b.act === 'order') o.label = 'Order something, or work a shift';
    }
    return o;
  };
  const h = handleTownAction;
  handleTownAction = function(a){
    let m = /^town-cg-(\w+)$/.exec(a);
    if (m){ if (m[1] === 'again') townShowCafeGame(); else { townCafeServe(m[1]); } return true; }
    if (a === 'town-tour'){ SFX.click(); townShowTour(); return true; }
    if (a === 'town-tourclaim'){
      const i = townTour();
      if (i && !(i.t.got === 1) && (i.t.best | 0) > 0){ const g = i.rank === 1 ? 40 : i.rank === 2 ? 25 : i.rank === 3 ? 15 : 5; i.t.got = 1; townPay({ gems: g }); townToast('Tournament prize: ' + g + ' gems.', '#BFFF9A'); SFX.level(); }
      townShowTour(); return true;
    }
    if (a === 'town-fish-cast'){ townFishCast(); return true; }
    if (a === 'town-fish-reel'){
      if (_fs && _fs.phase === 'bite'){ const ok = _fs.pos >= _fs.zone && _fs.pos <= _fs.zone + _fs.w; townFishResult(ok); }
      return true;
    }
    if (a === 'town-mail-open'){ townMailTake(); townShowMail(); return true; }
    return h(a);
  };
  /* a mailbox flag: the letter waits */
  const dyx = townDynX;
  townDynX = function(ctx, D, t, dark){
    dyx(ctx, D, t, dark);
    if (D.id === 'square'){ const m = townMailToday(); if (!m.got){ const f = Math.sin(t * 4) * 0.5 + 0.5; tRect(ctx, '#F2C230', 2030 + 20, TG - 100 - f * 4, 12, 8); tRect(ctx, '#8A6A2A', 2030 + 26, TG - 92, 2, 14); } }
  };
})();
