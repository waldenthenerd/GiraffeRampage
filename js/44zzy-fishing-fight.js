'use strict';
/* Fishing, third part: a real fight, fish that fight in their own ways, conditions and fishing spots, a catch card, mounted fish at home, and easier recasting. */
/* ========================= 44zzy. THE FIGHT, THE WATER AND THE CATCH ========================= */
/* 1 THE FIGHT   The bite is still the first test (press when the marker is in the green: that hooks it). Then comes the fight (Fg.phase 'fight'): hold the Reel
                 button, Space or Enter to wind in; the fish pulls, and the line's tension (Fg.ten) climbs while she winds and while it pulls and falls when she lets go.
                 Over 1 for a third of a second and the line snaps; the fish (Fg.prog) comes in only while she winds. Rod and line give her room: a better rod
                 winds faster and a better line takes more strain. fishTick(dt) runs it (a test calls that by hand).
   2 BEHAVIOR   Each kind pulls in its own way (FISH_BEHAVE): steady, darting, long runs, deep dives, thrashing, or hardly at all (the boot).
   3 SOUND       Whoosh and splash on a cast, a thump on a bite, reel clicks that speed up, a warning when the line is near snapping, and a fanfare by rarity.
   5 CONDITIONS  Dawn and dusk, rain, storms, fog, midday and night change how fast they bite, how rare and how big (fishCond); the panel says so.
   6 SPOTS       Each day seven spots mark the sea (fishSpots, from the date): shoals, wrecks, reef edges and one hot spot. They shimmer on the water and show on the
                 sea chart; casting inside one changes the odds (SPOT_KINDS).
   8 MOUNTS      The four best catches are mounted on the wall of her home, in a plaque with the length (painted into the cached room, like 44zzm).
   9 THE CARD    After a catch the panel shows the fish with its size, record and what it paid. 10 EASIER: "Cast again" (Space, Enter or F), an auto-recast switch
                 (town.fishAuto), and a way from the Fish book to the tackle shop. */

/* ---- 2 how each fish fights ---- */
const FISH_BEHAVE = {
  steady:  { n: 'pulls steadily', str: 1, hook: 1 },
  darter:  { n: 'darts and dashes', str: 0.95, hook: 1.25 },
  runner:  { n: 'makes long runs', str: 1.1, hook: 1 },
  diver:   { n: 'dives hard', str: 1.25, hook: 0.9 },
  thrasher:{ n: 'thrashes about', str: 1.05, hook: 1.15 },
  limp:    { n: 'hardly fights', str: 0.3, hook: 0.8 }
};
const FISH_HOW = {
  sardine: 'darter', mackerel: 'steady', herring: 'darter', trout: 'runner', pike: 'runner', eel: 'thrasher', boot: 'limp', seahorse: 'steady', puffer: 'thrasher', squid: 'darter', sword: 'runner', carp: 'diver', jelly: 'limp',
  minnow: 'darter', goby: 'darter', flounder: 'steady', bass: 'runner', hermit: 'steady', ray: 'diver',
  clown: 'darter', butterfly: 'darter', angel: 'steady', parrot: 'thrasher', lion: 'steady', moray: 'thrasher',
  tuna: 'runner', sunfish: 'diver', angler: 'diver', marlin: 'runner', hammer: 'thrasher', oarfish: 'diver', coelacanth: 'diver',
  rainwrasse: 'darter', ghostkoi: 'runner', stormray: 'thrasher'
};
function fishBehave(f){ return FISH_BEHAVE[FISH_HOW[f && f.id]] || FISH_BEHAVE.steady; }
function fishPullAt(kind, t){                                  /* how hard it pulls at time t, 0 to 1 */
  switch (kind){
    case 'darter': return Math.sin(t * 6.5) > 0.7 ? 0.95 : 0.12;
    case 'runner': return (t % 3.4) < 2.4 ? 0.14 : 0.9;
    case 'diver': return 0.5 + 0.4 * Math.sin(t * 0.8);
    case 'thrasher': return 0.15 + 0.8 * Math.abs(Math.sin(t * 3.3) * Math.sin(t * 1.1 + 1));
    case 'limp': return 0.05;
    default: return 0.28 + 0.12 * Math.sin(t * 1.7);
  }
}

/* ---- 6 spots on the sea, new each day ---- */
const SPOT_KINDS = {
  shoal: { n: 'A shoal', say: 'they bite fast here', wait: 0.4, rare: 1, size: 1, scales: 1, col: '#BFF2FF' },
  wreck: { n: 'A wreck', say: 'better fish hide here', wait: 0.8, rare: 2, size: 1.1, scales: 1, col: '#FFD9A0' },
  edge:  { n: 'A reef edge', say: 'bigger fish, a few rare ones', wait: 0.7, rare: 1.4, size: 1.2, scales: 1, col: '#C9F5B0' },
  hot:   { n: 'THE HOT SPOT', say: 'fast, big, rare and double scales', wait: 0.4, rare: 2.5, size: 1.3, scales: 2, col: '#FFE06A' }
};
const SPOT_R = 130;
function fishDay(){ return typeof Fg.fixDay === 'number' ? Fg.fixDay : Math.floor(Date.now() / 86400000); }
let _fishSpots = null;
function fishSpots(){
  const d = fishDay(); if (_fishSpots && _fishSpots.d === d) return _fishSpots.list;
  const r = miniRng(townHash('fishspots' + d)), list = [], kinds = ['hot', 'shoal', 'shoal', 'wreck', 'wreck', 'edge', 'edge'];
  const wet = function(x, y){ const t = seaTypeAt(x, y); return t === SEA_DEEP || t === SEA_WATER || t === SEA_SHALLOW || t === SEA_REEF; };
  kinds.forEach(function(k){
    for (let tries = 0; tries < 600; tries++){
      const x = 700 + r() * (SEA_W - 1400), y = 700 + r() * (SEA_W - 1400);
      if (!wet(x, y) || !wet(x + 90, y) || !wet(x - 90, y) || !wet(x, y + 90) || !wet(x, y - 90)) continue;
      if (list.some(function(o){ return Math.abs(o.x - x) + Math.abs(o.y - y) < 700; })) continue;
      if (k === 'edge' && [seaTypeAt(x + 90, y), seaTypeAt(x - 90, y), seaTypeAt(x, y + 90), seaTypeAt(x, y - 90)].every(function(t){ return t === seaTypeAt(x, y); })) continue;
      list.push({ k: k, x: Math.round(x), y: Math.round(y) }); return;
    }
  });
  _fishSpots = { d: d, list: list }; return list;
}
function fishSpotAt(x, y){
  const list = fishSpots(); let best = null, bd = SPOT_R;
  list.forEach(function(s){ const d = Math.sqrt((s.x - x) * (s.x - x) + (s.y - y) * (s.y - y)); if (d < bd){ bd = d; best = s; } });
  return best;
}

/* ---- 5 conditions ---- */
function fishCond(where){
  const c = { wait: 1, rare: 1, size: 1, pull: 1, scales: 1, text: [], spot: null };
  try {
    const h = townHour(), wx = townWeatherType();
    if ((h >= 5 && h < 8) || (h >= 17 && h < 20)){ c.wait *= 0.6; c.rare *= 1.25; c.text.push(h < 12 ? 'Dawn: the fish are biting' : 'Dusk: the fish are biting'); }
    else if (h >= 10 && h < 15 && wx === 'clear'){ c.wait *= 1.3; c.text.push('Bright midday: slow bites'); }
    else if (townIsNight()){ c.rare *= 1.15; c.text.push('Night: the shy ones come up'); }
    if (wx === 'rain'){ c.wait *= 0.7; c.text.push('Rain: they bite fast'); }
    else if (wx === 'storm'){ c.wait *= 0.8; c.size *= 1.25; c.pull *= 1.3; c.rare *= 1.3; c.text.push('Storm: bigger fish, and they fight harder'); }
    else if (wx === 'fog'){ c.rare *= 1.2; c.wait *= 1.1; c.text.push('Fog: odd fish about'); }
  } catch (e) {}
  if (where && where !== 'pier' && typeof Sea !== 'undefined'){
    const sp = fishSpotAt(Sea.x, Sea.y);
    if (sp){ const K = SPOT_KINDS[sp.k]; c.spot = sp; c.wait *= K.wait; c.rare *= K.rare; c.size *= K.size; c.scales *= K.scales; c.text.unshift(K.n + ': ' + K.say); }
  }
  c.msg = c.text.join(' · ');
  return c;
}
function fishCondHTML(){ const c = fishCond(fishHab()); return c.msg ? '<p class="fishcond' + (c.spot ? ' spot' : '') + '">' + c.msg + '</p>' : ''; }

/* ---- 3 sound ---- */
function fishSound(kind, f){
  try {
    const b = SFX.abilityGain;
    if (kind === 'cast') SFX.whoosh();
    else if (kind === 'splash') SFX.burst(0.22, 0.2, 1900, 500, 0.7, 0, 'lowpass', b);
    else if (kind === 'bite'){ SFX.tone('sine', 150, 55, 0.14, 0.3, 0, 0, b); SFX.burst(0.14, 0.14, 1500, 600, 0.7, 0, 'lowpass', b); }
    else if (kind === 'hook'){ SFX.tone('square', 520, 780, 0.08, 0.1, 0, 0, b); SFX.tone('square', 780, 1040, 0.08, 0.1, 0.07, 0, b); }
    else if (kind === 'reel') SFX.tone('square', 900 + (Fg.prog || 0) * 700, 700 + (Fg.prog || 0) * 500, 0.022, 0.05, 0, 0, b);
    else if (kind === 'warn') SFX.tone('sawtooth', 340, 300, 0.06, 0.09, 0, 0, b);
    else if (kind === 'snap'){ SFX.tone('sawtooth', 1100, 160, 0.22, 0.22, 0, 0, b); SFX.burst(0.12, 0.2, 5000, 1200, 1, 0, 'bandpass', b); }
    else if (kind === 'lost') SFX.deny();
    else if (kind === 'catch'){ const q = f ? fishRarity(f) : 0; if (q >= 2) SFX.transform(); else if (q === 1) SFX.level(); else SFX.coin(); }
  } catch (e) {}
}

/* ---- 1 the fight ---- */
/* the numbers of the fight: tension rises by `up` a second while she winds and by (pull - 0.2) * `pull` from the fish, falls by `down` when she lets go; a better line divides the rises; `prog` is how fast the fish comes in (times the rod) */
const FIGHT = { win: 1, snapAfter: 0.33, up: 0.7, down: 0.62, pull: 0.9, prog: 0.38, drain: 0.05, maxAmp: 0.9, timeout: 60 };
function fishFightHTML(){
  return '<div class="fightui" id="fightUi" style="display:none"><div class="fgl"><span>Line</span><small>the red end snaps it</small></div>' +
    '<div class="fgbar ten"><i id="fgTen"></i></div><div class="fgl"><span>Fish</span></div><div class="fgbar prog"><i id="fgProg"></i></div><div class="fghint" id="fgHint"></div></div>';
}
function fightStart(){
  const f = Fg.fish, B = fishBehave(f), kind = FISH_HOW[f.id] || 'steady', c = fishCond(fishHab());
  const tn = townData().n, nth = tn.fights | 0; tn.fights = nth + 1;                   /* the first three fights teach: a weaker fish, a calm start, a kinder snap and hints that follow what she does */
  Fg.teach = nth < 3; Fg.grace = Fg.teach ? 1.6 : 0.4;
  Fg.phase = 'fight'; Fg.ft = 0; Fg.prog = 0.15; Fg.ten = 0.3; Fg.peak = 0.3; Fg.snap = 0; Fg.hold = false; Fg.pull = 0; Fg.kind = kind; Fg.click = 0; Fg.warn = 0;
  Fg.str = clamp(0.55 + 0.04 * Math.min(f.v, 24), 0.6, 1.5) * B.str * c.pull * (nth === 0 ? 0.6 : nth === 1 ? 0.8 : 1);
  OV.classList.add('fighting');                              /* the tackle, the book and the log wait: the fight has the sidebar to itself */
  const bar = document.getElementById('fishBar'); if (bar) bar.style.display = 'none';
  const ui = document.getElementById('fightUi'); if (ui) ui.style.display = 'block';
  const rb = document.getElementById('fishReel'); if (rb) rb.textContent = 'Hold to reel';
  const m = document.getElementById('fishMsg'); if (m) m.textContent = 'Hooked! The ' + f.name + ' ' + B.n + '.';
  fishSound('hook'); fightDraw();
}
function fightDraw(){
  const t = document.getElementById('fgTen'), p = document.getElementById('fgProg'); if (!t || !p) return;
  t.style.width = clamp(Fg.ten, 0, 1) * 100 + '%'; t.className = Fg.ten > 0.85 ? 'hot' : Fg.ten > 0.65 ? 'warm' : '';
  p.style.width = clamp(Fg.prog, 0, 1) * 100 + '%';
  const h = document.getElementById('fgHint'); if (!h) return;
  let txt = '';
  if (Fg.teach){
    txt = Fg.ten > 0.85 ? 'LET GO! The line is about to snap!' : (!Fg.hold && Fg.prog < 0.2 && Fg.ft < 4) ? (Input.padUsed ? 'Hold A to wind it in.' : 'Hold the Reel button (or Space) to wind it in.') : Fg.ten > 0.65 ? 'Careful... ease off.' : Fg.hold ? 'Winding in. Keep the line out of the red.' : 'Let it rest, then wind again.';
  } else if (Fg.ten > 0.85) txt = 'Ease off!';
  if (h.textContent !== txt) h.textContent = txt;
  h.className = 'fghint' + (Fg.ten > 0.85 ? ' hot' : '');
}
function fightTick(dt){
  if (!document.getElementById('fgTen')) return;
  const k = Fg.k, lineF = Math.pow(k.line.win / 5.5, 0.35) * (1 + 0.1 * intel()), z = k.rod.z * (1 + 0.1 * intel());
  Fg.ft += dt;
  const pull = clamp(fishPullAt(Fg.kind, Math.max(0, Fg.ft - Fg.grace)) * (Fg.ft < Fg.grace ? 0.25 : 1) * clamp(0.55 + 0.2 * Fg.str, 0.65, FIGHT.maxAmp), 0, 1.1); Fg.pull = pull;       /* a surge never beats letting go by much, so a careful player can always ride it out; the strong ones surge more and tire slowly */
  Fg.ten = clamp(Fg.ten + ((Fg.hold ? FIGHT.up / lineF : -FIGHT.down) + (pull - 0.2) * FIGHT.pull / lineF) * dt, 0, 1.3);
  if (Fg.hold) Fg.prog += FIGHT.prog * Math.sqrt(z) / (0.8 + 0.2 * Fg.str) * (1 - Math.min(0.6, pull * 0.5)) * dt;
  else Fg.prog -= (pull * FIGHT.drain * Fg.str + (Fg.ten < 0.05 ? 0.06 : 0)) * dt;
  Fg.peak = Math.max(Fg.peak, Fg.ten);
  if (Fg.ten >= 1) Fg.snap += dt; else Fg.snap = Math.max(0, Fg.snap - dt);
  Fg.click -= dt; if (Fg.hold && Fg.click <= 0){ fishSound('reel'); Fg.click = 0.13 - 0.06 * clamp(Fg.prog, 0, 1); }
  Fg.warn -= dt; if (Fg.ten > 0.85 && Fg.warn <= 0){ fishSound('warn'); Fg.warn = 0.22; }
  fightDraw();
  if (Fg.snap > FIGHT.snapAfter * (Fg.teach ? 2.4 : 1)){ fishSound('snap'); fishResult(false, 'The line snapped!'); return; }
  if (Fg.prog >= FIGHT.win){ fishResult(true); return; }
  if (Fg.prog <= 0 && Fg.ft > 1){ fishResult(false, 'It shook the hook.'); return; }
  if (Fg.ft > FIGHT.timeout) fishResult(false, 'It got away.');
}
(function(){
  const reel = fishReel;
  fishReel = function(){
    if (Fg.phase !== 'bite') return;
    const ok = Fg.pos >= Fg.zone && Fg.pos <= Fg.zone + Fg.w;
    if (ok) fightStart(); else fishResult(false);
  };
  const tick = fishTick;
  fishTick = function(dt){
    if (Fg.phase === 'fight'){ fightTick(dt); return; }
    const was = Fg.phase; tick(dt);
    if (was === 'wait' && Fg.phase === 'bite'){ Fg.speed *= fishBehave(Fg.fish).hook; Fg.biteAt = Fg.clock; fishSound('bite'); }
  };
  /* holding: the Reel button (pointer, so touch works), Space and Enter */
  document.addEventListener('pointerdown', function(e){ if (Fg.phase === 'fight' && e.target && e.target.closest && e.target.closest('#fishReel')) Fg.hold = true; }, true);
  const rel = function(){ if (Fg.hold) Fg.hold = false; };
  document.addEventListener('pointerup', rel, true); document.addEventListener('pointercancel', rel, true); window.addEventListener('blur', rel);
  window.addEventListener('keydown', function(e){
    if ((e.code === 'Space' || e.code === 'Enter') && Fg.phase === 'fight'){ e.preventDefault(); e.stopPropagation(); Fg.hold = true; }
    else if (!e.repeat && Fg.clock >= (Fg.castLock || 0) && (e.code === 'Space' || e.code === 'Enter' || e.code === keyOf('cast')) && Fg.phase === 'idle' && document.getElementById('fishCast') && document.getElementById('fishCast').style.display !== 'none' && (document.activeElement === document.body || document.activeElement === document.getElementById('fishCast'))){
      if (G.state === 'fishing' || (G.state === 'town' && Town.panel)){ e.preventDefault(); e.stopPropagation(); fishCast(); }
    }
  }, true);
  window.addEventListener('keyup', function(e){ if (e.code === 'Space' || e.code === 'Enter') Fg.hold = false; }, true);
})();

/* ---- 9 the catch card, 10 easier recasting ---- */
function fishAutoOn(){ const t = Save.data && Save.data.town; return !!(t && t.fishAuto); }
function fishCatchHTML(L){
  if (!L) return '';
  const q = fishRarity(L.f), pills = ['+' + fmt(L.gold) + ' gold', '+' + L.scl + ' scale' + (L.scl === 1 ? '' : 's')];
  if (L.gems) pills.push('+' + L.gems + ' gems');
  if (L.clean) pills.push('clean fight +25%');
  return '<div class="fcatch" style="border-color:' + FISH_RCOL[q] + '"><canvas data-fc="1" width="84" height="48"></canvas><div><b>' + L.f.name + '</b> <span style="color:' + FISH_RCOL[q] + '">' + FISH_RARITY[q] + '</span>' +
    '<div class="fcl">' + L.len + ' cm · ' + (L.first ? 'a new kind!' : L.rec ? 'NEW RECORD' : 'best ' + L.best + ' cm') + '</div><div class="fcp">' + pills.map(function(p){ return '<i>' + p + '</i>'; }).join('') + '</div></div></div>';
}
function fishPaintCard(){ const cv = OV && OV.querySelector('canvas[data-fc]'); if (cv && Fg.last) fishPaint(cv, Fg.last.f, true); }
/* a key still held from winding in must not cast again before she has seen the catch: key repeats never cast, and a fresh press waits out castLock */
function fishAfterResult(){ Fg.castLock = Fg.clock + 1.5; Fg.hold = false; Fg.recastAt = fishAutoOn() && document.getElementById('fishCast') ? Fg.clock + 2.6 : 0; }
(function(){
  const fc = fishCast;
  fishCast = function(){ const was = Fg.phase; fc.apply(this, arguments); if (was === 'idle' && Fg.phase !== 'idle'){ const card = OV.querySelector('.fcatch'); if (card) card.remove(); } };
  townFishCast = fishCast;
  const st = step;
  step = function(dt){
    const r = st(dt);
    /* sounds that go with the cast's flight */
    const a = Fg.a;
    if (a && a.k === 'cast'){ const age = Fg.clock - a.t; if (age >= 0.4 && !a.w){ a.w = 1; fishSound('cast'); } if (age >= 0.95 && !a.s){ a.s = 1; fishSound('splash'); } }
    /* recast by itself */
    if (Fg.recastAt && Fg.clock >= Fg.recastAt){ Fg.recastAt = 0; if (Fg.phase === 'idle' && document.getElementById('fishCast') && fishAutoOn() && (G.state === 'fishing' || (G.state === 'town' && Town.panel))) fishCast(); }
    /* the Cast button at sea says where it is good and which key */
    const b = document.getElementById('castBtn');
    if (b && b._on){ const sp = typeof Sea !== 'undefined' ? fishSpotAt(Sea.x, Sea.y) : null, txt = (sp ? SPOT_KINDS[sp.k].n + ': ' : '') + 'Cast a line' + (Input.hasTouch ? '' : ' (' + (Input.padUsed ? 'A' : keyName(keyOf('cast'))) + ')'); if (b._t !== txt){ b._t = txt; b.textContent = txt; } }
    return r;
  };
  const ha = handleAction;
  handleAction = function(a){
    if (a === 'fish-auto'){ const t = townData(); t.fishAuto = !t.fishAuto; Save.write(); SFX.click(); if (Fg.phase === 'idle') fishPanel(); return; }
    if (a === 'fish-shop'){ SFX.click(); const x = Town.x; hideOverlay(); Town.panel = false; Fg.rodOn = false; Town.back = { d: 'harbour', x: x }; townGo('in_tackle', TOWN_DIST.in_tackle.spawn, 1); return; }
    return ha.apply(this, arguments);
  };
  /* from the Fish book at the pier, a way to the tackle shop */
  const sb = showFishBook;
  showFishBook = function(){ sb.apply(this, arguments); const col = OV.querySelector('.menucol'); if (col && !Fg.sea && Town.d === 'harbour') col.insertAdjacentHTML('afterbegin', '<button class="btn" data-a="fish-shop" style="margin-bottom:6px">Walk to the tackle shop</button>'); };
})();

/* ---- 6 the spots on the water and on the chart ---- */
(function(){
  const df = seaDrawFeatures;
  seaDrawFeatures = function(ctx, W, H, z, camX, camY, t){
    df.apply(this, arguments);
    const vw = W / z / 2 + 200, vh = H / z / 2 + 200;
    fishSpots().forEach(function(s){
      if (Math.abs(s.x - camX) > vw || Math.abs(s.y - camY) > vh) return;
      const K = SPOT_KINDS[s.k], p = seaWorldToScreen(s.x, s.y, W, H, z, camX, camY), hot = s.k === 'hot';
      ctx.save(); ctx.strokeStyle = K.col; ctx.lineWidth = (hot ? 2.6 : 1.8) * z;
      for (let i = 0; i < 3; i++){ const ph = (t * 0.45 + i / 3) % 1; ctx.globalAlpha = (1 - ph) * (hot ? 0.8 : 0.5); ctx.beginPath(); ctx.ellipse(p.x, p.y, (30 + 100 * ph) * z, (30 + 100 * ph) * z, 0, 0, TAU); ctx.stroke(); }
      ctx.globalAlpha = hot ? 0.9 : 0.7; ctx.fillStyle = K.col;
      for (let i = 0; i < (hot ? 9 : 6); i++){ const a = t * 0.9 + i * 1.7, rr = (32 + (i % 3) * 16) * z; ctx.beginPath(); ctx.ellipse(p.x + Math.cos(a) * rr, p.y + Math.sin(a) * rr, 5 * z, 2.2 * z, a + 1.57, 0, TAU); ctx.fill(); }
      if (hot){ ctx.globalAlpha = 0.18 + 0.1 * Math.sin(t * 3); ctx.fillStyle = '#FFE06A'; ctx.beginPath(); ctx.arc(p.x, p.y, SPOT_R * z * 0.8, 0, TAU); ctx.fill(); }
      ctx.restore();
    });
  };
  const dm = seaDrawMap;
  seaDrawMap = function(ctx, W, H, s){
    dm.apply(this, arguments);
    const ms = Math.min(150 * s, W * 0.3), mx = W - ms - 12, my = H - ms - 12, k = ms / SEA_W;
    fishSpots().forEach(function(sp){ if (!Sea.seen || !Sea.seen[Math.floor(sp.x / SEA_MAP_C) + Math.floor(sp.y / SEA_MAP_C) * SEA_MAP_N]) return;       /* only where the chart has been filled in */
      ctx.fillStyle = SPOT_KINDS[sp.k].col; ctx.beginPath(); ctx.arc(mx + sp.x * k, my + sp.y * k, sp.k === 'hot' ? 3.6 : 2.2, 0, TAU); ctx.fill(); if (sp.k === 'hot'){ ctx.strokeStyle = '#7A5A10'; ctx.lineWidth = 1; ctx.stroke(); } });
  };
})();

/* ---- 8 mounted on the wall at home ---- */
function fishMounts(){
  const b = Save.data && Save.data.town && Save.data.town.fishBook; if (!b) return [];
  return FISH.filter(function(f){ return b[f.id] > 0; }).map(function(f){ return { f: f, len: b[f.id] | 0, score: fishRarity(f) * 10000 + (b[f.id] | 0) }; }).sort(function(a, c){ return c.score - a.score; }).slice(0, 4);
}
(function(){
  const pb = homePaintBase;
  homePaintBase = function(c){
    pb(c);
    try {
      const list = fishMounts(); if (!list.length) return;
      list.forEach(function(m, i){
        const x = 328 + i * 84, y = 250;
        tRect(c, 'rgba(0,0,0,.22)', x + 2, y + 3, 66, 46); tRound(c, '#5A3B22', x - 2, y - 3, 70, 50, 5); tRound(c, '#A8794A', x, y, 66, 44, 4);
        c.drawImage(fishIcon(m.f), x + 7, y + 3, 52, 30); ivText(c, m.len + ' cm', x + 33, y + 41, 9, '#3E2A18'); tCircle(c, '#3A2A1E', x + 5, y + 5, 1.8); tCircle(c, '#3A2A1E', x + 61, y + 5, 1.8);
      });
    } catch (e) {}
  };
  const D = TOWN_DIST.in_myhome;
  if (D && !D._fishWired){ D._fishWired = true; const sg = D.sig; D.sig = function(){ return (sg ? sg.apply(this, arguments) : '') + '|fm' + fishMounts().map(function(m){ return m.f.id + m.len; }).join(','); }; }
})();

/* ---- a controller: A (or a trigger) casts, hooks and, held, winds in; B closes (js/41-qol.js); at sea A or X casts when the boat is still ---- */
(function(){
  const pp = Pad.poll; let pv = { A: false, X: false };
  const pad = function(){ const g = navigator.getGamepads ? navigator.getGamepads() : []; for (let i = 0; i < g.length; i++) if (g[i] && g[i].connected) return g[i]; return null; };
  Pad.poll = function(dt){
    const g = pad(), b = function(i){ const x = g && g.buttons[i]; return !!(x && (x.pressed || x.value > 0.5)); };
    const A = b(0) || b(5) || b(7), X = b(2), edgeA = A && !pv.A, edgeX = X && !pv.X;
    pv = { A: A, X: X };
    const panel = g && document.getElementById('fishCast') && (G.state === 'fishing' || (G.state === 'town' && Town.panel));
    if (panel){
      Input.padUsed = true; Input.padOn = true;
      if (Fg.phase === 'fight'){ Fg.hold = A; return; }
      if (edgeA){
        if (Fg.phase === 'bite') fishReel();
        else if (Fg.phase === 'idle' && Fg.clock >= (Fg.castLock || 0)) fishCast();
        return;
      }
      if (Fg.phase === 'bite' || Fg.phase === 'wait') return;                 /* the menu pad must not click a focused button meanwhile */
    }
    pp.apply(this, arguments);
    if (g && Sea.on && G.state === 'sail' && (edgeA || edgeX) && fishSeaOk() && !Sea.nearDock) fishSeaOpen();
  };
})();
