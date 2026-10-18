'use strict';
/* Longneck Town, eighth part: smaller comforts. */
/* ========================= 44zh. QUALITY OF LIFE ========================= */
/* 1 WHAT IS LEFT: the HUD says what is still to find in this street (or room): "(left: 2 coins, 1 gem)", or "(all found)".
   2 A HINT WHEN STUCK: Dewey in the library, and the Finds page of the journal, name one thing she has not found with exactly where.
   3 THE GEAR PAGE: a journal page listing the town-only hats, boots and colours, found or not, and how each is earned.
   4 TOUCH: bigger buttons when a touch screen is in use, and a tap on a person or a door walks her there (and uses it on arrival). */
const TOWN_TYPE_NAMES = { coin: ['coin', 'coins'], star: ['star', 'stars'], gem: ['gem', 'gems'], hat: ['hat', 'hats'], boot: ['boots', 'pairs of boots'], swatch: ['colour', 'colours'], track: ['track', 'tracks'] };
function townLeftIn(D){
  const list = D.indoor ? townInItems(D.id) : townItemsIn(D.id);
  const left = {}; let n = 0;
  list.forEach(function(it){ if (!townFound(it.id)){ left[it.t] = (left[it.t] | 0) + 1; n++; } });
  return { n: n, by: left, total: list.length };
}
function townLeftText(D){
  const l = townLeftIn(D);
  if (!l.total) return '';
  if (!l.n) return ' · all found';
  const keys = Object.keys(l.by), parts = keys.slice(0, 2).map(function(k){ const nm = TOWN_TYPE_NAMES[k] || [k, k + 's']; return l.by[k] + ' ' + nm[l.by[k] === 1 ? 0 : 1]; });
  const more = keys.slice(2).reduce(function(a, k){ return a + l.by[k]; }, 0);
  return ' \u00b7 left: ' + parts.join(', ') + (more ? ' +' + more : '');
}
function townHintExact(){
  const order = [Town.d].concat(TOWN_IDS.filter(function(i){ return i !== Town.d; }));
  for (let k = 0; k < order.length; k++){
    const id = order[k]; if (!townOpen(id)) continue;
    const it = TOWN_ITEMS.filter(function(x){ return x.d === id && !townFound(x.id); })[0];
    if (it){
      const what = { coin: 'a coin', star: 'a little star', gem: 'a gem', hat: 'a hat', boot: 'a pair of boots', swatch: 'a coat colour', track: 'some tracks' }[it.t];
      const high = it.h >= 60 ? ' You will need to stretch your neck for it.' : '';
      const where = it.in && TOWN_DIST[it.in] ? 'inside ' + TOWN_DIST[it.in].name + ' (' + TOWN_DIST[it.d].name + ')' : 'in ' + TOWN_DIST[it.d].name;
      return 'There is ' + what + ' ' + where + ': ' + it.note + '.' + high;
    }
  }
  return 'You have found everything that is lying about. Everyone is very impressed.';
}
function townShowGear(){
  const list = ACC.townHats.concat(ACC.townBoots);
  const src = function(it){
    const f = TOWN_ITEMS.filter(function(x){ return x.acc === it.id; })[0];
    if (f) return 'Found in ' + TOWN_DIST[f.d].name + (f.in ? ' (' + TOWN_DIST[f.in].name + ')' : '') + ': ' + f.note + '.';
    const g = TOWN_NPC_LIST.filter(function(id){ return TOWN_GIFT_OF[id] && TOWN_GIFT_OF[id].acc === it.id; })[0];
    return g ? 'Best-friend gift from ' + TOWN_NPCS[g].name + '.' : (typeof TOWN_SPECIAL_SRC !== 'undefined' && TOWN_SPECIAL_SRC[it.id]) || '';
  };
  let h = '<p class="jt">' + list.filter(function(i){ return accOwned(i.id); }).length + ' of ' + list.length + ' hats and boots, and ' + WARD_TOWN.filter(function(w){ return townFound(w[2]); }).length + ' of ' + WARD_TOWN.length + ' colours.</p><div class="gearlist">';
  list.forEach(function(it){
    const own = accOwned(it.id);
    h += '<div class="gr' + (own ? ' on' : '') + '"><canvas width="56" height="56" data-gear="' + it.id + '"></canvas><div><b>' + (own ? it.name : '? ? ?') + '</b><span>' + src(it) + '</span></div></div>';
  });
  WARD_TOWN.forEach(function(w){
    const f = townFound(w[2]), isGift = /^gift_/.test(w[2]);
    const who = isGift ? TOWN_NPCS[w[2].slice(5)] : null, item = !isGift ? TOWN_ITEM_BY_ID[w[2]] : null;
    h += '<div class="gr' + (f ? ' on' : '') + '"><span class="dotsw big" style="background:' + (f ? w[1] : 'rgba(0,0,0,.15)') + '"></span><div><b>' + (f ? w[0] : '? ? ?') + '</b><span>' +
      (typeof TOWN_SPECIAL_SRC !== 'undefined' && TOWN_SPECIAL_SRC[w[2]] ? TOWN_SPECIAL_SRC[w[2]] : isGift ? 'Best-friend gift from ' + (who ? who.name : 'a friend') + '.' : item ? 'Found in ' + TOWN_DIST[item.d].name + ': ' + item.note + '.' : '') + '</span></div></div>';
  });
  h += '</div>';
  let th = '<div class="jtabs">';
  [['errands', 'Errands'], ['finds', 'Finds'], ['friends', 'Friends'], ['tracks', 'Tracks'], ['gear', 'Gear']].forEach(function(x){ th += '<button class="jtab' + (x[0] === 'gear' ? ' on' : '') + '" data-a="town-jt-' + x[0] + '">' + x[1] + '</button>'; });
  townPanelT('journal', th + '</div><div class="jpage">' + h + '</div>', { w: 640 });
  document.querySelectorAll('canvas[data-gear]').forEach(function(cv){
    const it = ACC_BY_ID[cv.getAttribute('data-gear')]; if (!it) return;
    const q = cv.getContext('2d');
    if (accOwned(it.id)) drawAccIcon(q, it, 28, it.kind === 'boot' ? 26 : 30, it.kind === 'boot' ? 1.5 : 1.4, 0);
    else { q.globalAlpha = 0.35; drawAccIcon(q, it, 28, it.kind === 'boot' ? 26 : 30, it.kind === 'boot' ? 1.5 : 1.4, 0); q.globalCompositeOperation = 'source-in'; q.fillStyle = '#2A1E12'; q.fillRect(0, 0, 56, 56); }
  });
}
/* ---- touch: tap a person or a door and she walks there ---- */
let _qolPtr = false;
function townAutoMx(){
  if (Town.autoX === undefined) return 0;
  const dx = Town.autoX - Town.x;
  if (Math.abs(dx) < 26){ return 0; }
  return dx > 0 ? 1 : -1;
}
(function(){
  const uT = updateTown, tE = townEnter, tj = townShowJournal;
  townEnter = function(){ document.body.classList.toggle('touch', !!Input.hasTouch); Town.autoX = undefined; return tE.apply(this, arguments); };
  updateTown = function(dt, frozen){
    let tapped = null;
    const down = !!Input.mdown;
    if (Town.on && G.state === 'town' && !Town.hold && !Town.panel && !frozen){
      if (down && !_qolPtr){
        const sx = Input.sx, sy = Input.sy, onUI = Town.ui.btns.some(function(b){ return townInRect(b, sx, sy); }) || townInRect(Town.ui.prompt, sx, sy);
        if (!onUI){
          const V = townView(), wx = Town.camX + sx / V.sc, D = TOWN_DIST[Town.d];
          let best = null, bd = 90;
          const pick = function(x, o){ const d = Math.abs(x - wx); if (d < bd){ bd = d; best = o; } };
          Town.npcs.forEach(function(n){ pick(n.x, { x: n.x }); });
          (Town.walkers || []).forEach(function(w){ if (w.hid <= 0) pick(w.x, { x: w.x }); });
          D.b.forEach(function(b){ if (b.act || b.to) pick(b.x, { x: b.x, door: true }); });
          if (best) Town.autoX = best.x;
        }
      }
    }
    _qolPtr = down;
    if (Town.autoX !== undefined && (Town.hold || Town.panel || G.state !== 'town')) Town.autoX = undefined;
    const r = uT.call(this, dt, frozen);
    if (Town.autoX !== undefined && Town.on && G.state === 'town'){
      if (Math.abs(Town.autoX - Town.x) < 30){ const near = Town.near; Town.autoX = undefined; if (near && !Town.hold && !Town.panel) townUse(near); }
    }
    return r;
  };
  townShowJournal = function(tab){
    if (tab === 'gear'){ townShowGear(); return; }
    tj.apply(this, arguments);
    const tabs = document.querySelector('.tp-journal .jtabs'); if (!tabs) return;
    const b = document.createElement('button'); b.className = 'jtab'; b.setAttribute('data-a', 'town-jt-gear'); b.textContent = 'Gear'; tabs.appendChild(b);
    if (typeof _tjTab2 !== 'undefined' && _tjTab2 === 'finds'){
      const pg = document.querySelector('.tp-journal .jpage');
      if (pg){ const hb = document.createElement('button'); hb.className = 'tbtn'; hb.style.margin = '10px 0 0'; hb.setAttribute('data-a', 'town-hint'); hb.textContent = 'I’m stuck: give me a hint'; pg.appendChild(hb); }
    }
  };
  const h = handleTownAction;
  handleTownAction = function(a){
    if (a === 'town-jt-gear'){ SFX.click(); townShowGear(); return true; }
    if (a === 'town-hint'){ SFX.click(); const txt = townHintExact(); townClosePanel(); townSay({ name: 'A hint', text: txt }, []); return true; }
    return h(a);
  };
})();
