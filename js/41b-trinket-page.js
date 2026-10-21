'use strict';
/* =============================================================================================================================
   41b-trinket-page.js  --  THE TRINKETS, ON THE GEAR PAGE. They used to be a column of plain text cards with a ten-pixel icon. Now each trinket
   is a framed tile with a big icon in its own colour (unfound ones are dark silhouettes), a tap wears or removes it on the spot (no page redraw,
   a small pop and a sound), and a panel beside the tiles (a window of fixed size, like the gear one) says what the trinket does in numbers.
   The numbers are not typed in: they come from running recalcStats() with and without the trinket (trinketStats), so they are always what the game
   really does, including Red Rampage's boost to whatever gear she wears and the Lime Helmet's cut to damage taken. Pointing at a tile (or tapping it)
   shows "if you wear it / if you take it off" as before-and-after rows, and the total of everything worn when nothing is picked. The Lime Helmet is
   also tried on in the picture of her while you point at it. Replaces trinketsHTML (41-qol.js); the heading is made by 41a-gear-page.js.
   ============================================================================================================================= */
const trinketPage = { sel: null, hover: null, clearT: 0 };
const TR_SPECIAL = { redrampage: 'Gear effects ×1.4', peacefullune: 'Press T: slow the world' };

/* her stats with exactly this list of trinkets worn; everything else (gear, cards, perks) as it is now */
function trinketStats(list){
  const keepList = Save.data.equippedTrinkets, hp = P.hp, mhp = P.maxHp, out = {};
  Save.data.equippedTrinkets = list.slice();
  try {
    recalcStats();
    const s = P.stats;
    Object.keys(GEAR_STAT_LABELS).forEach(function(k){ if (typeof s[k] === 'number') out[k] = s[k]; });
    out.dr = 1 - (1 - s.dr) * (list.indexOf('limehelmet') >= 0 ? 0.93 : 1);            /* the Lime Helmet's cut is taken off the damage, not kept in the stats */
  } finally { Save.data.equippedTrinkets = keepList; recalcStats(); P.hp = hp; P.maxHp = mhp; }
  return out;
}
function trinketWorn(){ return (Save.data.equippedTrinkets || []).filter(function(id){ return TRINKETS[id] && trinketOwned(id); }); }
/* what changes between two stat sets: [{key, label, from, to, better}] */
function trinketDiff(A, B){
  const rows = [];
  Object.keys(A).forEach(function(k){
    if (Math.abs(B[k] - A[k]) < 1e-9) return;
    const lb = GEAR_STAT_LABELS[k] && GEAR_STAT_LABELS[k].lowerBetter;
    rows.push({ key: k, label: GEAR_STAT_LABELS[k].label, from: A[k], to: B[k], better: lb ? B[k] < A[k] : B[k] > A[k] });
  });
  return rows;
}
function trinketChange(key, from, to){                                                 /* the change itself: "Pickup range +20%", "Damage taken −7%" */
  const f = GEAR_STAT_LABELS[key].fmt, d = to - from, r = function(x, n){ const m = Math.pow(10, n || 0); return Math.round(x * m) / m; }, sg = function(x){ return (x > 0 ? '+' : '−') + Math.abs(x); };
  if (f === 'pctless') return (d > 0 ? '−' : '+') + r(Math.abs(d) * 100, 1) + '%';
  if (f === 'sec') return sg(r(d, 2)) + '/s';
  if (f === 'flat') return sg(r(d, 1));
  return sg(r(d * 100, 1)) + '%';
}
function trinketChips(rows, id){
  const chips = rows.map(function(r){ return '<span class="tchip ' + (r.better ? 'up' : 'down') + '">' + r.label + ' <b>' + trinketChange(r.key, r.from, r.to) + '</b></span>'; });
  if (id && TR_SPECIAL[id]) chips.push('<span class="tchip sp">' + TR_SPECIAL[id] + '</span>');
  return chips.join('');
}

function trinketIconHTML(t, locked){ return '<span class="tic">' + ico(t.icon, t.color) + '</span>'; }
function trinketTilesHTML(){
  const worn = trinketWorn();
  return '<div class="ttiles">' + Object.keys(TRINKETS).map(function(id){
    const t = TRINKETS[id], owned = trinketOwned(id), on = worn.indexOf(id) >= 0;
    const cls = 'ttile' + (owned ? '' : ' locked') + (on ? ' on' : '') + (trinketPage.sel === id ? ' sel' : '');
    return (owned ? '<button class="' + cls + '" data-a="trinket-tap-' + id + '" data-th="' + id + '" aria-pressed="' + on + '" aria-label="' + t.name + (on ? ', worn' : '') + '" style="--tc:' + t.color + '">'
                  : '<div class="' + cls + '" data-th="' + id + '" style="--tc:' + t.color + '">') +
      trinketIconHTML(t) + '<b>' + (owned ? t.name : '???') + '</b><i class="tck" aria-hidden="true">✓</i>' + (owned ? '</button>' : '</div>');
  }).join('') + '</div>';
}
function trinketPanelHTML(){
  const id = trinketPage.hover || trinketPage.sel, worn = trinketWorn();
  if (!id || !TRINKETS[id]){
    const rows = worn.length ? trinketDiff(trinketStats([]), trinketStats(worn)) : [];
    return '<div class="trp"><h4>Worn trinkets</h4>' +
      (worn.length ? '<div class="trwornrow">' + worn.map(function(w){ return '<span style="--tc:' + TRINKETS[w].color + '" title="' + TRINKETS[w].name + '">' + trinketIconHTML(TRINKETS[w]) + '</span>'; }).join('') + '</div>' : '<p class="sub" style="margin:0 0 6px">None worn. Tap a trinket to wear it; any number can be worn at once.</p>') +
      (rows.length ? '<div class="tchips">' + trinketChips(rows) + '</div><p class="gnote">Together, on top of everything else she has.</p>' : (worn.length ? '<p class="gnote">These give no stat change on their own.</p>' : '')) + '</div>';
  }
  const t = TRINKETS[id], owned = trinketOwned(id), on = worn.indexOf(id) >= 0;
  if (!owned) return '<div class="trp locked" style="--tc:' + t.color + '"><div class="trhead">' + trinketIconHTML(t) + '<div><h4>???</h4><div class="gsub">Not found yet</div></div></div><p class="gdesc">' + (t.source || 'Won only from the prize wheel') + '</p></div>';
  const solo = trinketDiff(trinketStats([]), trinketStats([id])), now = trinketStats(worn), alt = trinketStats(on ? worn.filter(function(w){ return w !== id; }) : worn.concat([id])), rows = trinketDiff(now, alt);
  return '<div class="trp" style="--tc:' + t.color + '"><div class="trhead">' + trinketIconHTML(t) + '<div><h4>' + t.name + '</h4><div class="gsub">' + (on ? '<span class="trw">Worn</span> · tap to take off' : 'Tap to wear') + '</div></div></div>' +
    '<div class="tchips">' + trinketChips(solo, id) + '</div><p class="gdesc">' + t.desc + '</p>' +
    (t.source ? '<p class="gnote">' + t.source + '</p>' : '') +
    (rows.length ? '<div class="gnote" style="margin:8px 0 3px">' + (on ? 'If you take it off:' : 'If you wear it:') + '</div><div class="grows">' + rows.map(function(r){ return '<div class="grow ' + (r.better ? 'up' : 'down') + '"><span>' + r.label + '</span><b>' + gearFmtVal(r.key, r.from) + ' → ' + gearFmtVal(r.key, r.to) + '</b></div>'; }).join('') + '</div>' : '') + '</div>';
}
function trinketCountText(){
  const n = trinketWorn().length, all = Object.keys(TRINKETS).length, own = Object.keys(TRINKETS).filter(trinketOwned).length;
  return ' \u2014 ' + n + ' worn · ' + own + ' of ' + all + ' found · any number can be worn at once';
}
function trinketHeadHTML(){ return '<h3 class="gh">Trinkets<small id="trCount" style="font-weight:400;color:var(--dust);font-size:12px">' + trinketCountText() + '</small></h3>'; }
trinketsHTML = function(){
  return '<div class="trwrap"><div class="trside" id="trinketSide">' + trinketPanelHTML() + '</div><div class="trgrid" id="trinketGrid">' + trinketTilesHTML() + '</div></div>';
};

/* update the tiles, the panel and the counts in place (no page redraw, so the scroll position stays) */
function trinketSync(pop){
  const side = document.getElementById('trinketSide'); if (side) side.innerHTML = trinketPanelHTML();
  const grid = document.getElementById('trinketGrid');
  if (grid){
    const worn = trinketWorn(), tiles = grid.querySelectorAll('.ttile');
    for (let i = 0; i < tiles.length; i++){
      const id = tiles[i].dataset.th, on = worn.indexOf(id) >= 0;
      tiles[i].classList.toggle('on', on); tiles[i].classList.toggle('sel', trinketPage.sel === id); if (tiles[i].tagName === 'BUTTON') tiles[i].setAttribute('aria-pressed', on);
      if (pop === id){ tiles[i].classList.remove('pop'); void tiles[i].offsetWidth; tiles[i].classList.add('pop'); }
    }
  }
  const cnt = document.getElementById('trCount'); if (cnt) cnt.textContent = trinketCountText();
  if (typeof gearSyncSelection === 'function') gearSyncSelection();                          /* "Her build" shows the worn trinkets too */
}
/* the trinkets she would wear in the picture: the one being pointed at, flipped (only the Lime Helmet shows on her) */
function trinketShownList(){
  const id = trinketPage.hover, worn = trinketWorn(); if (!id || !TRINKETS[id] || !trinketOwned(id)) return null;
  return worn.indexOf(id) >= 0 ? worn.filter(function(w){ return w !== id; }) : worn.concat([id]);
}

(function(){
  const h = handleAction;
  handleAction = function(a){
    if (typeof a === 'string' && a.indexOf('trinket-tap-') === 0){
      const id = a.slice(12);
      if (!TRINKETS[id] || !toggleTrinket(id)){ SFX.deny(); return; }
      trinketPage.sel = id; trinketPage.hover = null; if (trinketEquipped(id)) SFX.buy(); else SFX.click();
      trinketSync(id); return;
    }
    return h.apply(this, arguments);
  };
  const sh = showShop;
  showShop = function(){ trinketPage.hover = null; return sh.apply(this, arguments); };
})();
/* pointing at a tile shows its panel (desktop), with a moment's grace to reach the panel */
OV.addEventListener('mouseover', function(e){
  if (shopTab !== 'gear' || G.state !== 'shop') return;
  const t = e.target.closest ? e.target.closest('[data-th]') : null, id = t ? t.dataset.th : null, inSide = !!(e.target.closest && e.target.closest('#trinketSide'));
  if (trinketPage.clearT){ clearTimeout(trinketPage.clearT); trinketPage.clearT = 0; }
  if (id){ if (id !== trinketPage.hover){ trinketPage.hover = id; trinketSync(); } return; }
  if (inSide || !trinketPage.hover) return;
  trinketPage.clearT = setTimeout(function(){ trinketPage.clearT = 0; if (trinketPage.hover){ trinketPage.hover = null; trinketSync(); } }, 350);
});
/* keyboard and pad focus shows a trinket's panel, like pointing at it */
OV.addEventListener('focusin', function(e){
  if (shopTab !== 'gear' || G.state !== 'shop' || !(Nav.on || (e.target.matches && e.target.matches(':focus-visible')))) return;
  const t = e.target.closest ? e.target.closest('[data-th]') : null, id = t ? t.dataset.th : null;
  if (trinketPage.clearT){ clearTimeout(trinketPage.clearT); trinketPage.clearT = 0; }
  if (id){ if (id !== trinketPage.hover){ trinketPage.hover = id; trinketSync(); } return; }
  if (trinketPage.hover && !(e.target.closest && e.target.closest('#trinketSide'))){ trinketPage.hover = null; trinketSync(); }
});
