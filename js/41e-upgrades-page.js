'use strict';
/* =============================================================================================================================
   41e-upgrades-page.js  --  THE UPGRADES TAB, REBUILT. It was one long list of 24 rows. Now:
   GROUPS  A row of chips (Combat, Body, Loot & XP, Cards, Sea, Ants, and All) shows one group at a time; a dot on a chip says something in it can be
     bought now, and "Affordable" keeps only what she can pay for.
   ROWS  Each upgrade is a ring that fills as it levels (round the icon), its name and level, what it gives now and what the next level gives with its
     price, and Buy / Buy 5 / Max. Buy keeps the hold-to-keep-buying of 43-input.js (it still carries data-buy). A bought row pops, and an upgrade that
     reaches its top level gets a gold MAXED badge and a little chime. A locked upgrade (the Sea ones until Chapter 3, the ants until 100,000,000 score)
     is a dark silhouette with what unlocks it (and a progress bar toward the ant colony).
   YOUR BONUSES  A panel at the top adds up everything bought. The numbers are not typed in: they come from running recalcStats() with and without the upgrades
     (upgStats, the same idea as trinketStats in 41b), so they are the game's own; an upgrade that changes no stat (the ants, Lucky Deck, Second Wind...)
     is listed with its own text.
   BUY ALL I CAN  Spends gold on the cheapest next level of any unlocked upgrade, again and again, until nothing more is affordable. It asks first, with the list of what it will buy.
   Costs and effects are untouched (META and metaCost in 01-core.js). Replaces upgradesTabHTML (41-qol.js); wraps showShop and handleAction.
   ============================================================================================================================= */
const UPG_GROUPS = [
  { id: 'combat', name: 'Combat',   color: '#E8764A', ids: ['hooves', 'instinct', 'reach', 'thunder'] },
  { id: 'body',   name: 'Body',     color: '#7FD16A', ids: ['hide', 'regen', 'strides', 'wind', 'steady', 'steadyeyes'] },
  { id: 'loot',   name: 'Loot & XP', color: '#F2C84A', ids: ['prospect', 'learner', 'magnet'] },
  { id: 'cards',  name: 'Cards',    color: '#B98BFF', ids: ['deck', 'starcharm', 'luckypaws'] },
  { id: 'sea',    name: 'Sea',      color: '#4AB8E8', ids: ['swimlegs', 'ripkick', 'brine'] },
  { id: 'ants',   name: 'Ants',     color: '#C98A3A', ids: ['antcap', 'anthp', 'antblast', 'antdmg', 'antrespawn'] }
];
const upgPage = { group: 'combat', afford: false, confirm: null, note: '', snap: null, pop: {}, maxedNow: [], sumSig: '', sumHTML: '' };
function upgGroupOf(id){ for (let i = 0; i < UPG_GROUPS.length; i++) if (UPG_GROUPS[i].ids.indexOf(id) >= 0) return UPG_GROUPS[i]; return UPG_GROUPS[0]; }
function upgLocked(m){ return !!(m.requires && !Save.data[m.requires]); }
function upgCanBuy(m){ return !upgLocked(m) && metaLevel(m.id) < m.max && Save.data.gold >= metaCost(m, metaLevel(m.id)); }
function upgCostMany(m, n){ let lv = metaLevel(m.id), sum = 0; for (let k = 0; k < n; k++) sum += metaCost(m, lv + k); return sum; }

/* ---------- buying ---------- */
function upgBuyMany(id, n){                                                                /* n levels of one upgrade, all or nothing */
  const m = METAMAP[id], lv = m ? metaLevel(id) : 0;
  if (!m || !(n >= 1) || upgLocked(m) || lv + n > m.max || Save.data.gold < upgCostMany(m, n)){ SFX.deny(); return false; }
  Save.data.gold -= upgCostMany(m, n); Save.data.meta[id] = lv + n; Save.write(); recalcStats(); SFX.buy(); return true;
}
/* the cheapest next level of any unlocked upgrade, over and over, until nothing more can be paid for: {add: {id: levels}, spent, n} */
function upgPlanAll(){
  let gold = Save.data.gold; const add = {}, lvl = {}; let spent = 0, n = 0;
  META.forEach(function(m){ lvl[m.id] = metaLevel(m.id); });
  for (let guard = 0; guard < 600; guard++){
    let best = null, bc = Infinity;
    META.forEach(function(m){ if (upgLocked(m) || lvl[m.id] >= m.max) return; const c = metaCost(m, lvl[m.id]); if (c <= gold && c < bc){ best = m; bc = c; } });
    if (!best) break;
    gold -= bc; spent += bc; lvl[best.id]++; add[best.id] = (add[best.id] || 0) + 1; n++;
  }
  return { add: add, spent: spent, n: n };
}
function upgBuyAll(){
  const p = upgPlanAll(); if (!p.n){ SFX.deny(); return null; }
  Object.keys(p.add).forEach(function(id){ Save.data.meta[id] = metaLevel(id) + p.add[id]; });
  Save.data.gold -= p.spent; Save.write(); recalcStats(); SFX.buy(); return p;
}

/* ---------- the total of everything bought ---------- */
function upgStats(meta){
  const keep = Save.data.meta, hp = P.hp, mhp = P.maxHp, out = {};
  Save.data.meta = meta;
  try { recalcStats(); const s = P.stats; Object.keys(GEAR_STAT_LABELS).forEach(function(k){ if (typeof s[k] === 'number') out[k] = s[k]; }); }
  finally { Save.data.meta = keep; recalcStats(); P.hp = hp; P.maxHp = mhp; }
  return out;
}
function upgSummaryHTML(){
  const lv = {}; let owned = 0, levels = 0;
  META.forEach(function(m){ const l = metaLevel(m.id); if (l > 0){ lv[m.id] = l; owned++; levels += l; } });
  const sig = JSON.stringify(lv) + '|' + JSON.stringify(Save.data.equippedTrinkets || []) + JSON.stringify(Save.data.equipped || {});
  if (sig !== upgPage.sumSig){
    let chips = '';
    if (owned){
      const all = upgStats(lv), rows = trinketDiff(upgStats({}), all); chips = trinketChips(rows);
      Object.keys(lv).forEach(function(id){                                                /* an upgrade that changes no stat is listed with its own words */
        const w = Object.assign({}, lv); delete w[id];
        if (!trinketDiff(upgStats(w), all).length) chips += '<span class="tchip sp">' + METAMAP[id].desc(lv[id]) + '</span>';
      });
    }
    upgPage.sumSig = sig;
    upgPage.sumHTML = '<details class="upsum"' + (innerWidth > 760 ? ' open' : '') + '><summary><b>Your permanent bonuses</b><span>' + owned + ' of ' + META.length + ' upgrades · ' + levels + ' levels</span></summary>' +
      (owned ? '<div class="tchips">' + chips + '</div>' : '<p class="gnote" style="margin:6px 0 0">Nothing bought yet. Your first upgrade appears here.</p>') + '</details>';
  }
  return upgPage.sumHTML;
}

/* ---------- the page ---------- */
function upgRowHTML(m){
  const g = upgGroupOf(m.id), lv = metaLevel(m.id), maxed = lv >= m.max, locked = upgLocked(m), pct = Math.min(100, lv / m.max * 100);
  const cls = 'uprow' + (locked ? ' locked' : '') + (maxed ? ' ismax' : '') + (upgPage.pop[m.id] ? ' pop' : '') + (!locked && !maxed && upgCanBuy(m) ? ' can' : '');
  const ring = '<div class="uring" style="--p:' + pct.toFixed(1) + '%"><span class="uic">' + ico(m.icon) + '</span></div>';
  if (locked){
    const ant = m.requires === 'antsUnlocked', best = Math.max(0, +Save.data.best || 0), bar = ant ? '<i class="upbar"><u style="width:' + Math.min(100, best / ANT_UNLOCK_SCORE * 100).toFixed(1) + '%"></u></i>' : '';
    return '<div class="' + cls + '" style="--ac:' + g.color + '" data-up="' + m.id + '">' + ring + '<div class="upt"><div class="upn"><b>' + m.name + '</b><em>Locked</em></div>' +
      '<div class="uplock">' + ico('@t-x-lock') + '<span>' + (REQUIRES_LABEL[m.requires] || 'Locked') + (ant ? ' · best run ' + fmt(best) : '') + '</span></div>' + bar + '</div></div>';
  }
  const rem = m.max - lv, n5 = Math.min(5, rem), can1 = upgCanBuy(m), max = maxAffordable(m);
  const btns = maxed ? '' :
    '<div class="upbtns"><button class="btn sm buy' + (can1 ? '' : ' ghost') + '" data-buy="' + m.id + '" aria-label="Buy ' + m.name + ' level ' + (lv + 1) + ' for ' + fmt(metaCost(m, lv)) + ' gold"' + (can1 ? '' : ' disabled') + '>Buy<small>' + fmt(metaCost(m, lv)) + ' gold</small></button>' +
    (rem >= 2 ? '<button class="btn sm ghost' + (Save.data.gold >= upgCostMany(m, n5) ? ' ok' : '') + '" data-a="upg-buy-' + m.id + '-' + n5 + '" aria-label="Buy ' + n5 + ' levels of ' + m.name + ' for ' + fmt(upgCostMany(m, n5)) + ' gold"' + (Save.data.gold >= upgCostMany(m, n5) ? '' : ' disabled') + '>Buy ' + n5 + '<small>' + fmt(upgCostMany(m, n5)) + '</small></button>' : '') +
    (max >= 2 ? '<button class="btn sm ghost ok" data-a="buymax-' + m.id + '" aria-label="Buy ' + max + ' levels of ' + m.name + ' (every level you can afford)" title="Buy every level you can afford">Max<small>' + max + ' levels</small></button>' : '') + '</div>';
  return '<div class="' + cls + '" style="--ac:' + g.color + '" data-up="' + m.id + '">' + ring + '<div class="upt"><div class="upn"><b>' + m.name + '</b><em>Level ' + lv + ' / ' + m.max + '</em>' + (maxed ? '<span class="upbadge">MAXED</span>' : '') + '</div>' +
    '<div class="upnow">' + (lv ? '<span class="upnowc">' + m.desc(lv) + '</span>' : '<span class="upnone">Not bought yet</span>') + '</div>' +
    (maxed ? '' : '<div class="upnext">Next: ' + m.desc(lv + 1) + '</div>') + '</div>' + btns + '</div>';
}
function upgChipsHTML(){
  const all = [{ id: 'all', name: 'All', color: '#F2B33D', ids: META.map(function(m){ return m.id; }) }].concat(UPG_GROUPS);
  return '<div class="upchips">' + all.map(function(g){
    const dot = g.ids.some(function(id){ return upgCanBuy(METAMAP[id]); }), on = upgPage.group === g.id;
    return '<button class="upchip' + (on ? ' on' : '') + '" data-a="upg-g-' + g.id + '" style="--ac:' + g.color + '" aria-pressed="' + on + '">' + g.name + (dot ? '<i class="updot" title="Something here can be bought"></i>' : '') + '</button>';
  }).join('') + '<button class="upchip aff' + (upgPage.afford ? ' on' : '') + '" data-a="upg-aff" aria-pressed="' + upgPage.afford + '">Affordable</button></div>';
}
function upgConfirmHTML(){
  const p = upgPage.confirm; if (!p) return '';
  const lines = Object.keys(p.add).map(function(id){ return '<span class="tchip sp">' + METAMAP[id].name + ' <b>+' + p.add[id] + '</b></span>'; }).join('');
  return '<div class="upconfirm"><h4>Buy all I can</h4><p class="sub" style="margin:0 0 6px">This buys the cheapest next level of any unlocked upgrade, again and again, until your gold runs out: <b>' + p.n + ' levels for ' + fmt(p.spent) + ' gold</b> (you would have ' + fmt(Save.data.gold - p.spent) + ' left).</p>' +
    '<div class="tchips">' + lines + '</div><div class="row" style="margin-top:8px"><button class="btn sm" data-a="upg-all-yes">Buy them</button><button class="btn sm ghost" data-a="upg-all-no">Cancel</button></div></div>';
}
upgradesTabHTML = function(){
  const cur = {}; META.forEach(function(m){ cur[m.id] = metaLevel(m.id); });
  upgPage.pop = {}; upgPage.maxedNow = [];
  if (upgPage.snap) META.forEach(function(m){ if (cur[m.id] > (upgPage.snap[m.id] | 0)){ upgPage.pop[m.id] = 1; if (cur[m.id] >= m.max) upgPage.maxedNow.push(m.id); } });
  upgPage.snap = cur;
  const g = upgPage.group === 'all' ? null : UPG_GROUPS.filter(function(x){ return x.id === upgPage.group; })[0] || UPG_GROUPS[0];
  const ids = g ? g.ids : UPG_GROUPS.reduce(function(a, x){ return a.concat(x.ids); }, []);
  let rows = ids.map(function(id){ return METAMAP[id]; }).filter(Boolean);
  if (upgPage.afford) rows = rows.filter(upgCanBuy);
  const plan = upgPlanAll(), note = upgPage.note; upgPage.note = '';
  return '<div class="uppg"><p class="sub" style="margin:0 0 8px">Permanent upgrades, bought with gold. They apply to every run from here on.</p>' + upgSummaryHTML() +
    '<div class="uptop"><button class="btn sm' + (plan.n ? '' : ' ghost') + '" data-a="upg-all"' + (plan.n ? '' : ' disabled') + '>Buy all I can' + (plan.n ? '<small>' + plan.n + ' levels</small>' : '') + '</button></div>' +
    (note ? '<div class="upnote">' + note + '</div>' : '') + upgConfirmHTML() + upgChipsHTML() +
    '<div class="uplist">' + (rows.length ? rows.map(upgRowHTML).join('') : '<p class="gnote" style="padding:14px 4px">' + (upgPage.afford ? 'Nothing in here is affordable yet.' : 'Nothing here.') + '</p>') + '</div></div>';
};
function upgMaxChime(){
  try { [523, 659, 784, 1047].forEach(function(f, i){ SFX.tone('triangle', f, f, 0.22, 0.09, i * 0.08); }); SFX.tone('sine', 1568, 2093, 0.5, 0.06, 0.34); } catch (e) {}
}
(function(){
  const sh = showShop;
  showShop = function(){
    const r = sh.apply(this, arguments);
    if (shopTab === 'upgrades' && G.state === 'shop'){ if (upgPage.maxedNow.length){ upgMaxChime(); upgPage.maxedNow = []; } }
    else { upgPage.snap = null; upgPage.confirm = null; }
    return r;
  };
  const h = handleAction;
  handleAction = function(a){
    if (typeof a === 'string'){
      if (a.indexOf('upg-g-') === 0){ const id = a.slice(6); if (id === 'all' || UPG_GROUPS.some(function(g){ return g.id === id; })){ upgPage.group = id; SFX.click(); showShop('upgrades'); } return; }
      if (a === 'upg-aff'){ upgPage.afford = !upgPage.afford; SFX.click(); showShop('upgrades'); return; }
      if (a === 'upg-all'){ const p = upgPlanAll(); if (!p.n){ SFX.deny(); return; } upgPage.confirm = p; SFX.click(); showShop('upgrades'); return; }
      if (a === 'upg-all-no'){ upgPage.confirm = null; SFX.click(); showShop('upgrades'); return; }
      if (a === 'upg-all-yes'){ upgPage.confirm = null; const p = upgBuyAll(); if (p) upgPage.note = 'Bought ' + p.n + ' levels for ' + fmt(p.spent) + ' gold.'; showShop('upgrades'); return; }
      const m = /^upg-buy-([a-z]+)-(\d+)$/.exec(a);
      if (m){ upgBuyMany(m[1], +m[2]); showShop('upgrades'); return; }
    }
    return h.apply(this, arguments);
  };
})();
