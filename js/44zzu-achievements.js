'use strict';
/* Achievements and the trophy wall. */
/* ========================= 44zzu. ACHIEVEMENTS ========================= */
/* About sixty goals, each worked out from what the save already holds (kills, runs, best wave, gear, the Bestiary, the town...), so nothing has to be
   counted by hand across the game and an old save earns what it has already done. Each one pays a few gems, once.
   Save.data.ach = { done: { id: time } }. The goals are looked at when the menu opens and, at most every 1.5 seconds, whenever the save is written
   (a run ending, a purchase, a find). A "Trophies" button on the main menu opens the wall: every medal, earned or not, with how far along it is.
   Nothing is counted while two giraffes play together (js/44zzt-together.js): that game keeps nothing. */
const ACH = [];
const ACH_CATS = [['run', 'On the run'], ['coll', 'Collections'], ['town', 'Longneck Town'], ['more', 'Everything else']];
(function(){
  const num = function(f){ try { const v = +f(); return isFinite(v) ? v : 0; } catch (e) { return 0; } };
  const D = function(){ return Save.data || {}; };
  const keys = function(o){ return o && typeof o === 'object' ? Object.keys(o) : []; };
  /* the goals only READ the save: the helpers that make a missing part of it on first use (townData, miniData, bestiaryData...) are not used, so looking at the goals never adds anything to a save */
  const tw = function(){ let o = D().town; for (let i = 0; i < arguments.length; i++) o = o && typeof o === 'object' ? o[arguments[i]] : undefined; return o; };
  const tn = function(k){ return (tw('n', k) | 0); };
  const mini = function(k){ const m = D().mini; return m && typeof m === 'object' ? m[k] : undefined; };
  function add(id, cat, name, desc, goal, gems, val){ ACH.push({ id: id, cat: cat, name: name, desc: desc, goal: goal, gems: gems, val: function(){ return num(val); } }); }
  const cleared = function(){ let n = 0; for (let i = 1; i <= TOTAL_CHAPTERS; i++) if (D()['chapter' + i + 'Complete']) n++; return n; };
  const gearPieces = function(){ return keys(D().gear).filter(function(k){ return k.indexOf('trinket:') !== 0 && D().gear[k]; }).length; };
  const trinkets = function(){ return keys(D().gear).filter(function(k){ return k.indexOf('trinket:') === 0 && D().gear[k]; }).length; };
  const metaTotal = function(){ let n = 0; keys(D().meta).forEach(function(k){ n += D().meta[k] | 0; }); return n; };
  const stars = function(){ let n = 0; const s = mini('stars'); keys(s).forEach(function(k){ n += s[k] | 0; }); return n; };
  const hats = function(){ const o = mini('own'); return ACC_ITEMS.filter(function(it){ return o && o[it.id]; }).length; };
  const colors = function(){ let n = 0; for (let i = 1; i <= WARD_MAX; i++) if (wardUnlocked(i)) n++; return n; };
  const films = function(){ return filmList().filter(function(f){ return f.un; }).length; };
  const friends = function(){ const b = tw('bond'); return keys(b).filter(function(k){ return (b[k] | 0) > 0; }).length; };
  const errands = function(){ const e = tw('err'); return keys(e).filter(function(k){ return (e[k] | 0) >= 2; }).length; };
  const degrees = function(){ let n = 0; const d = tw('uni', 'deg'); keys(d).forEach(function(k){ n += d[k] | 0; }); return n; };
  const books = function(){ const r = tw('uni', 'read'); return keys(r).filter(function(k){ return (r[k] | 0) > 0; }).length; };
  const gymRank = function(){ let n = 0; const sk = tw('gym', 'sk'); keys(sk).forEach(function(k){ n += (sk[k] && sk[k].l) | 0; }); let r = 0; GYM_RANKS.forEach(function(k, i){ if (n >= k.at) r = i; }); return r; };
  const creatures = function(){ const c = D().bestiary && D().bestiary.creatures; let n = 0; if (c) for (let ch = 1; ch <= BESTIARY_CHAPTERS.length; ch++) for (let i = 0; i < BESTIARY_ORDER.length; i++) if (c[ch + ':' + BESTIARY_ORDER[i]]) n++; return n; };
  const cardsSeen = function(){ const c = D().bestiary && D().bestiary.cards; return c ? CARDS.filter(function(cd){ return c[cd.id]; }).length : 0; };
  const antTotal = function(){ let n = 0; const a = D().ants; keys(a).forEach(function(k){ n += a[k] | 0; }); return n; };
  const cityBuilt = function(){ const c = D().city; return keys(c).filter(function(k){ return (c[k] | 0) > 0; }).length; };
  const R = 'run', C = 'coll', W = 'town', M = 'more';

  /* on the run */
  add('kills100', R, 'First Hundred', 'Kick 100 creatures', 100, 3, function(){ return scoreInt(D().totalKills); });
  add('kills1k', R, 'Thousand Hooves', 'Kick 1,000 creatures', 1000, 5, function(){ return scoreInt(D().totalKills); });
  add('kills10k', R, 'Stampede', 'Kick 10,000 creatures', 10000, 10, function(){ return scoreInt(D().totalKills); });
  add('kills100k', R, 'Force of Nature', 'Kick 100,000 creatures', 100000, 25, function(){ return scoreInt(D().totalKills); });
  add('runs1', R, 'Out of the Gate', 'Finish a run', 1, 2, function(){ return scoreInt(D().runs); });
  add('runs10', R, 'Regular', 'Finish 10 runs', 10, 4, function(){ return scoreInt(D().runs); });
  add('runs50', R, 'Seasoned', 'Finish 50 runs', 50, 8, function(){ return scoreInt(D().runs); });
  add('runs200', R, 'Lifer', 'Finish 200 runs', 200, 20, function(){ return scoreInt(D().runs); });
  add('score10k', R, 'Getting Warm', 'Score 10,000 points in one run', 10000, 3, function(){ return scoreInt(D().best); });
  add('score1m', R, 'Seven Figures', 'Score 1,000,000 points in one run', 1e6, 10, function(){ return scoreInt(D().best); });
  add('score100m', R, 'Big Numbers', 'Score 100,000,000 points in one run', 1e8, 25, function(){ return scoreInt(D().best); });
  add('wave10', R, 'Double Digits', 'Reach wave 10', 10, 3, function(){ return D().bestWave | 0; });
  add('wave50', R, 'Halfway Up the Neck', 'Reach wave 50', 50, 8, function(){ return D().bestWave | 0; });
  add('wave100', R, 'Triple Digits', 'Reach wave 100', 100, 15, function(){ return D().bestWave | 0; });
  add('wave250', R, 'Far From Home', 'Reach wave 250', 250, 25, function(){ return D().bestWave | 0; });
  add('ch1', R, 'Savanna Done', 'Clear a chapter', 1, 5, cleared);
  add('ch5', R, 'Halfway There', 'Clear 5 chapters', 5, 10, cleared);
  add('ch10', R, 'Ten Down', 'Clear 10 chapters', 10, 20, cleared);
  add('ch13', R, 'The Whole Journey', 'Clear all ' + MAIN_CHAPTERS + ' chapters', MAIN_CHAPTERS, 40, function(){ return Math.min(MAIN_CHAPTERS, cleared()); });
  add('ch135', R, 'Under the Mylar', 'Clear Chapter 13.5, the Domes', 1, 25, function(){ return D().chapter14Complete ? 1 : 0; });
  add('ch14', R, 'Top Floor', 'Clear Chapter 14, the Tower', 1, 40, function(){ return D().chapter15Complete ? 1 : 0; });
  add('home', R, 'Home Again', 'Fly the spaceplane home', 1, 20, function(){ return D().homecoming ? 1 : 0; });
  add('gold1m', R, 'Gold Hoarder', 'Hold 1,000,000 gold at once', 1e6, 10, function(){ return goldInt(D().gold); });
  add('gems500', R, 'Gem Cache', 'Hold 500 gems at once', 500, 10, function(){ return scoreInt(D().gems); });

  /* collections */
  add('crate1', C, 'Crack It Open', 'Open a crate', 1, 2, function(){ return scoreInt(D().cratesOpened); });
  add('crate50', C, 'Crate Fan', 'Open 50 crates', 50, 8, function(){ return scoreInt(D().cratesOpened); });
  add('crate250', C, 'Crate Crazy', 'Open 250 crates', 250, 20, function(){ return scoreInt(D().cratesOpened); });
  add('gear10', C, 'Well Dressed', 'Own 10 pieces of gear', 10, 5, gearPieces);
  add('gear30', C, 'Walking Wardrobe', 'Own 30 pieces of gear', 30, 15, gearPieces);
  add('trinket1', C, 'Lucky Charm', 'Find a trinket', 1, 3, trinkets);
  add('trinketAll', C, 'Trinket Hoard', 'Find every trinket', Object.keys(TRINKETS).length, 25, trinkets);
  add('best50', C, 'Field Guide', 'Meet 50 kinds of creature', 50, 5, creatures);
  add('best150', C, 'Naturalist', 'Meet 150 kinds of creature', 150, 15, creatures);
  add('bestAll', C, 'Every Last One', 'Meet every creature in the Bestiary', BESTIARY_TOTAL_CREATURES, 30, creatures);
  add('cards10', C, 'Card Shark', 'Discover 10 cards', 10, 5, cardsSeen);
  add('cardsAll', C, 'Full Deck', 'Discover every card', CARDS.length, 15, cardsSeen);
  add('combo1', C, 'Best of Both', 'Unlock a card combo', 1, 4, comboCount);
  add('combo10', C, 'Mix Master', 'Unlock 10 card combos', 10, 12, comboCount);
  add('fuse10', C, 'Fusion Fan', 'Use the Fusion Machine 10 times', 10, 10, function(){ return D().fusions | 0; });
  add('meta30', C, 'Upgrade Habit', 'Buy 30 trading-post upgrades', 30, 5, metaTotal);
  add('meta150', C, 'Fully Loaded', 'Buy 150 trading-post upgrades', 150, 15, metaTotal);
  add('mini1', C, 'Just a Game', 'Play a minigame', 1, 2, function(){ return mini('plays') | 0; });
  add('mini25', C, 'Arcade Regular', 'Play 25 minigames', 25, 8, function(){ return mini('plays') | 0; });
  add('hats10', C, 'Hat Rack', 'Win 10 hats and boots', 10, 5, hats);
  add('hats40', C, 'Shoe Closet', 'Win 40 hats and boots', 40, 15, hats);
  add('stars20', C, 'Star Player', 'Earn 20 minigame stars', 20, 8, stars);
  add('colours10', C, 'Colorful', 'Unlock 10 coat colors', 10, 5, colors);
  add('colours30', C, 'Rainbow Coat', 'Unlock 30 coat colors', 30, 15, colors);
  add('photo1', C, 'Say Cheese', 'Keep a photo in the album', 1, 2, function(){ return keys(D().album).length; });
  add('photo24', C, 'Photographer', 'Keep 24 photos in the album', 24, 8, function(){ return keys(D().album).length; });
  add('photo48', C, 'Full Album', 'Fill the album with 48 photos', 48, 15, function(){ return keys(D().album).length; });
  add('films8', C, 'Film Buff', 'Unlock 8 films', 8, 5, films);

  /* Longneck Town */
  add('found10', W, 'Treasure Spotter', 'Find 10 things in town', 10, 4, function(){ return keys(tw('found')).length; });
  add('found50', W, 'Sharp Eyes', 'Find 50 things in town', 50, 10, function(){ return keys(tw('found')).length; });
  add('found100', W, 'Nothing Left Unturned', 'Find 100 things in town', 100, 25, function(){ return keys(tw('found')).length; });
  add('vis4', W, 'Out and About', 'Visit 4 places in town', 4, 3, function(){ return keys(tw('vis')).length; });
  add('vis8', W, 'Local Legend', 'Visit 8 places in town', 8, 8, function(){ return keys(tw('vis')).length; });
  add('bond3', W, 'Making Friends', 'Get to know 3 townsfolk', 3, 4, friends);
  add('bond16', W, 'Everyone’s Friend', 'Get to know all 16 townsfolk', 16, 20, friends);
  add('err5', W, 'Helping Hoof', 'Finish 5 errands', 5, 6, errands);
  add('err20', W, 'Odd-Job Giraffe', 'Finish 20 errands', 20, 15, errands);
  add('loaf25', W, 'Baker', 'Bake 25 loaves of bread', 25, 4, function(){ return tn('loaves'); });
  add('oven3', W, 'Master Baker', 'Upgrade the oven all the way', 3, 6, function(){ return Math.min(3, tn('oven')); });
  add('sail1', W, 'All Aboard', 'Set sail', 1, 3, function(){ return tn('sails'); });
  add('sail25', W, 'Old Sea Dog', 'Set sail 25 times', 25, 10, function(){ return tn('sails'); });
  add('boats4', W, 'Harbor Master', 'Own all four boats', 4, 12, function(){ return keys(tw('sea', 'own')).length; });
  add('fish5', W, 'Angler', 'Catch 5 kinds of fish', 5, 6, function(){ return keys(tw('fish')).length; });
  add('fishAll', W, 'Master Angler', 'Catch every kind of fish', FISH.length, 15, function(){ return keys(tw('fish')).length; });
  add('rings20', W, 'Ring Master', 'Fly through 20 rings', 20, 6, function(){ return tn('rings'); });
  add('gym3', W, 'Pumped', 'Reach the third gym rank', 3, 8, gymRank);
  add('gymMax', W, 'Gym Champion', 'Reach the top gym rank', GYM_RANKS.length - 1, 15, gymRank);
  add('deg1', W, 'Graduate', 'Earn a degree', 1, 6, degrees);
  add('deg5', W, 'Professor', 'Earn 5 degrees', 5, 15, degrees);
  add('books12', W, 'Bookworm', 'Read 12 library books', 12, 8, books);
  add('booksAll', W, 'Library Ghost', 'Read every library book', UNI_BOOKS.length, 20, books);
  add('ship4', W, 'Spaceplane Built', 'Finish building the spaceplane', SHIP_STAGES.length, 15, function(){ return D().spaceplane | 0; });

  /* everything else */
  add('gag1', M, 'Pointless', 'Watch her do something completely pointless', 1, 2, function(){ return scoreInt(D().gagsDone); });
  add('gag25', M, 'Professional Nuisance', 'Watch her do 25 pointless things', 25, 5, function(){ return scoreInt(D().gagsDone); });
  add('gag100', M, 'Chaos Gremlin', 'Watch her do 100 pointless things', 100, 10, function(){ return scoreInt(D().gagsDone); });
  add('ants1', M, 'Colony', 'Find the ants', 1, 5, function(){ return D().antsUnlocked ? 1 : 0; });
  add('ants100', M, 'Ant Farm', 'Own 100 ants', 100, 8, antTotal);
  add('city5', M, 'City Builder', 'Build 5 things in the Giraffe City', 5, 8, cityBuilt);
  add('venus5', M, 'Hot Stuff', 'Buy 5 Venus outpost upgrades', 5, 6, function(){ return keys(D().venusUp).length; });
  add('mars5', M, 'Red Planet', 'Buy 5 Mars outpost upgrades', 5, 6, function(){ return keys(D().marsUp).length; });
  add('mut1', M, 'Mutant', 'Use the lab', 1, 6, function(){ return D().mutUses | 0; });
})();

const Ach = {
  last: 0, busy: false, queue: [],
  /* what is earned: read only (a save that never earned anything stays { ach: {} }) */
  done(){ const a = Save.data && Save.data.ach; return a && a.done && typeof a.done === 'object' && !Array.isArray(a.done) ? a.done : {}; },
  data(){ const d = Save.data; if (!d.ach || typeof d.ach !== 'object' || Array.isArray(d.ach)) d.ach = {}; if (!d.ach.done || typeof d.ach.done !== 'object' || Array.isArray(d.ach.done)) d.ach.done = {}; return d.ach; },
  isDone(id){ return !!this.done()[id]; },
  count(){ let n = 0; for (let i = 0; i < ACH.length; i++) if (this.isDone(ACH[i].id)) n++; return n; },
  gems(){ let n = 0; for (let i = 0; i < ACH.length; i++) if (this.isDone(ACH[i].id)) n += ACH[i].gems; return n; },
  /* look at every goal not yet earned; earn those that are met */
  check(){
    if (this.busy || !Save.data || (typeof Co !== 'undefined' && Co.on)) return [];
    this.busy = true;
    const got = [];
    try {
      for (let i = 0; i < ACH.length; i++){
        const a = ACH[i]; if (this.isDone(a.id)) continue;
        if (a.val() >= a.goal){ this.data().done[a.id] = Date.now(); Save.data.gems = scoreInt(Save.data.gems) + a.gems; got.push(a); }
      }
    } finally { this.busy = false; }
    if (got.length){ this.busy = true; try { Save.write(); } finally { this.busy = false; } this.announce(got); }
    return got;
  },
  announce(got){
    const gems = got.reduce(function(s, a){ return s + a.gems; }, 0);
    if (got.length > 2) this.toast('★ ' + got.length + ' trophies earned  (+' + gems + ' gems)', 'Open the Trophies page on the main menu to see them');
    else got.forEach(function(a){ Ach.toast('★ ' + a.name, a.desc + '  (+' + a.gems + ' gems)'); });
    try { SFX.level(); } catch (e) {}
  },
  toast(title, sub){
    this.queue.push([title, sub]);
    if (!this.showing) this.next();
  },
  next(){
    const q = this.queue.shift(); if (!q){ this.showing = false; return; }
    this.showing = true;
    try {
      let el = document.getElementById('achToast');
      if (!el){ el = document.createElement('div'); el.id = 'achToast'; el.setAttribute('role', 'status'); document.body.appendChild(el); }
      el.innerHTML = '<b></b><span></span>'; el.firstChild.textContent = q[0]; el.lastChild.textContent = q[1]; el.classList.add('on');
      setTimeout(function(){ el.classList.remove('on'); setTimeout(function(){ Ach.next(); }, 350); }, 3600);
    } catch (e) { this.showing = false; }
  }
};

/* ---- when to look ---- */
(function(){
  const sw = Save.write;
  Save.write = function(){
    const r = sw.apply(this, arguments);
    if (!Ach.busy && typeof Date !== 'undefined'){ const now = Date.now(); if (now - Ach.last > 1500){ Ach.last = now; Ach.check(); } }
    return r;
  };
  const sm = showMenu;
  showMenu = function(){
    const r = sm.apply(this, arguments);
    Ach.check();
    if (G.state === 'menu' && typeof OV !== 'undefined'){
      const guide = OV.querySelector('[data-a="help"]');
      if (guide && !OV.querySelector('[data-a="ach-open"]')) guide.insertAdjacentHTML('beforebegin', '<button class="btn ghost" data-a="ach-open">Trophies<small>' + Ach.count() + ' of ' + ACH.length + ' earned</small></button>');
    }
    return r;
  };
  const ha = handleAction;
  handleAction = function(a){
    if (typeof a === 'string' && a.indexOf('ach-') === 0){
      if (a === 'ach-open'){ SFX.click(); showTrophies(); return; }
      if (a === 'ach-back'){ SFX.click(); G.subScreen = ''; showMenu(); return; }
    }
    return ha.apply(this, arguments);
  };
})();

/* ---- the wall ---- */
function trophyHTML(a){
  const done = Ach.isDone(a.id), v = Math.min(a.val(), a.goal), pct = Math.round(v / a.goal * 100);
  const when = done ? new Date(Ach.done()[a.id]).toLocaleDateString() : '';
  return '<div class="trophy' + (done ? ' got' : '') + '"><div class="tmedal">' + (done ? '★' : '☆') + '</div><div class="tbody"><b>' + a.name + '</b><span>' + a.desc + '</span>' +
    (done ? '<small>Earned' + (when ? ' ' + when : '') + ' · ' + a.gems + ' gems</small>'
          : '<div class="tbar"><i style="width:' + pct + '%"></i></div><small>' + fmt(v) + ' of ' + fmt(a.goal) + ' · ' + a.gems + ' gems</small>') + '</div></div>';
}
function showTrophies(){
  G.state = 'help'; G.attract = true; G.subScreen = 'trophies';
  let body = '';
  ACH_CATS.forEach(function(c){
    const list = ACH.filter(function(a){ return a.cat === c[0]; }), n = list.filter(function(a){ return Ach.isDone(a.id); }).length;
    body += '<h3 class="thead">' + c[1] + ' <small>' + n + ' of ' + list.length + '</small></h3><div class="tgrid">' + list.map(trophyHTML).join('') + '</div>';
  });
  setOverlay('<div class="panel slab trophywall"><h2 class="head">Trophies</h2><p class="sub">' + Ach.count() + ' of ' + ACH.length + ' earned · ' + fmt(Ach.gems()) + ' gems from trophies</p>' +
    '<div class="tscroll">' + body + '</div><div class="menucol" style="margin-top:10px;width:100%"><button class="btn ghost" data-a="ach-back">Back</button></div></div>');
}
