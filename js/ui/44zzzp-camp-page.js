'use strict';
/* =============================================================================================================================
   44zzzp-camp-page.js  --  THE CAMP TAB of the trading post (the logic is js/game/44zzzo-camp.js). A little scene of the camp (a tent, a fire and
   a lantern, with the fire burning higher the fuller the store), what is stored (hours of the cap, gold, the crate being worked toward) with
   Collect, the Camp Crates in store with Open 1, 5 or all (the reveal is the gear page's), and the two upgrades in the same rows as the permanent upgrades.
   Until Chapter 2 is cleared the tab is not there. While it is showing, the numbers tick once a second without redrawing the page.
   ============================================================================================================================= */
const campPage = { timer: 0, note: '', found: false };
function campTime(h){                                                                /* 2.5 hours as "2h 30m" */
  const m = Math.max(0, Math.round(h * 60));
  return m >= 60 ? Math.floor(m / 60) + 'h ' + (m % 60 < 10 ? '0' : '') + (m % 60) + 'm' : m + 'm';
}
function campMenuNote(){                                                             /* the line under "Trading post" on the menu: something waiting in the camp */
  if (!campUnlocked()) return '';
  const h = campHours(), c = Save.data.campCrates | 0;
  return h >= 1 || c > 0 ? ' · Camp: ' + (h >= 1 ? campTime(h) + ' stored' : '') + (h >= 1 && c > 0 ? ', ' : '') + (c > 0 ? c + (c === 1 ? ' crate' : ' crates') : '') : '';
}
function campTabDot(){ return campUnlocked() && (campHours() >= 1 || (Save.data.campCrates | 0) > 0) ? '<i class="updot" title="Something is waiting in the camp"></i>' : ''; }
function campSceneHTML(fill){
  const f = Math.max(0.15, Math.min(1, fill)), h = 14 + 22 * f;
  return '<svg class="campscene" viewBox="0 0 320 120" preserveAspectRatio="xMidYMid slice" role="img" aria-label="A tent and a campfire">' +
    '<rect width="320" height="120" fill="#1E2A33"/><circle cx="262" cy="22" r="9" fill="#F4E8B8" opacity=".9"/><circle cx="40" cy="18" r="1.2" fill="#fff"/><circle cx="96" cy="30" r="1" fill="#fff"/><circle cx="150" cy="12" r="1.3" fill="#fff"/><circle cx="214" cy="34" r="1" fill="#fff"/>' +
    '<path d="M0 96 L70 70 L130 90 L200 62 L260 86 L320 72 V120 H0Z" fill="#26343C"/><rect y="98" width="320" height="22" fill="#3C3226"/>' +
    '<path d="M62 98 L104 48 L146 98Z" fill="#B4864A"/><path d="M104 48 L120 98 H146Z" fill="#8E6736"/><path d="M92 98 L104 76 L116 98Z" fill="#2A1E12"/><path d="M104 48 V40 M104 40 L116 44 L104 46" stroke="#D8C8A0" fill="#C8402A" stroke-width="1.5"/>' +
    '<g class="campfire" transform="translate(200 98)"><ellipse rx="26" ry="5" cy="4" fill="rgba(0,0,0,.35)"/><path d="M-16 2 L16 -4 M-16 -4 L16 2" stroke="#5A3A1C" stroke-width="5" stroke-linecap="round"/>' +
    '<path d="M0 ' + (-h).toFixed(1) + ' C10 ' + (-h * 0.55).toFixed(1) + ' 13 -8 0 -2 C-13 -8 -10 ' + (-h * 0.55).toFixed(1) + ' 0 ' + (-h).toFixed(1) + 'Z" fill="#FF8A2A"/>' +
    '<path d="M0 ' + (-h * 0.62).toFixed(1) + ' C6 ' + (-h * 0.35).toFixed(1) + ' 7 -6 0 -3 C-7 -6 -6 ' + (-h * 0.35).toFixed(1) + ' 0 ' + (-h * 0.62).toFixed(1) + 'Z" fill="#FFD66A"/></g>' +
    '<g transform="translate(262 98)"><path d="M0 0 V-30 M0 -30 H10" stroke="#6A4A2A" stroke-width="3"/><rect x="6" y="-28" width="9" height="12" rx="2" fill="#FFC870"/><circle cx="10.5" cy="-22" r="14" fill="#FFC870" opacity=".15"/></g></svg>';
}
function campUpRowHTML(id){
  const U = CAMP_UP[id], nx = campUpNext(id), lv = nx.lv, pct = lv / 5 * 100, maxed = nx.maxed;
  const cls = 'uprow' + (!maxed && !nx.open ? ' locked' : '') + (maxed ? ' ismax' : '') + (!maxed && nx.can ? ' can' : '');
  const ring = '<div class="uring" style="--p:' + pct.toFixed(1) + '%"><span class="uic">' + ico(U.icon) + '</span></div>';
  const btn = maxed ? '' : nx.open ?
    '<div class="upbtns"><button class="btn sm buy' + (nx.can ? '' : ' ghost') + '" data-a="camp-buy-' + id + '" aria-label="Buy ' + U.name + ' level ' + (lv + 1) + ' for ' + fmt(nx.cost) + ' gems"' + (nx.can ? '' : ' disabled') + '>Buy<small>' + fmt(nx.cost) + ' gems</small></button></div>' : '';
  return '<div class="' + cls + '" style="--ac:#6FD0F0" data-camp="' + id + '">' + ring + '<div class="upt"><div class="upn"><b>' + U.name + '</b><em>Level ' + lv + ' / 5</em>' + (maxed ? '<span class="upbadge">MAXED</span>' : '') + '</div>' +
    '<div class="upnow">' + (lv ? '<span class="upnowc">' + U.desc(lv) + '</span>' : '<span class="upnone">Not bought yet</span>') + '</div>' +
    (maxed ? '' : '<div class="upnext">Next: ' + U.desc(lv + 1) + '</div>') +
    (!maxed && !nx.open ? '<div class="uplock">' + ico('@t-x-lock') + '<span>Finish Chapter ' + nx.need + ' to unlock</span></div>' : '') + '</div>' + btn + '</div>';
}
function campTabHTML(){
  if (!campUnlocked()) return '<div class="uppg"><p class="sub">The camp opens when you finish Chapter 2. After that it keeps working while you are away.</p></div>';
  campStart();
  const p = campPending(), cap = campCapHours(), full = p.hours >= cap - 1e-9, stock = Save.data.campCrates | 0, can = p.hours >= 1 / 120;
  const dayTrip = p.hours < cap ? 'Full in ' + campTime(cap - p.hours) : 'Full. It has stopped working until you collect.';
  const crate = CRATES.camp;
  const resNote = campPage.note ? '<p class="campnote">' + campPage.note + '</p>' : '';
  return '<div class="uppg camppg">' + campSceneHTML(p.hours / cap) +
    '<p class="sub" style="margin:8px 0">While she is away the camp works at a fixed rate, up to ' + campTime(cap) + ' of it, and keeps the gold and the crates for you.</p>' +
    '<div class="campstore"><div class="campbar" role="progressbar" aria-valuemin="0" aria-valuemax="' + cap + '" aria-valuenow="' + p.hours.toFixed(2) + '"><i id="campBarFill" class="' + (full ? 'full' : '') + '" style="width:' + Math.min(100, p.hours / cap * 100).toFixed(1) + '%"></i></div>' +
    '<div class="campline"><b id="campHrs">' + campTime(p.hours) + '</b> of ' + campTime(cap) + ' <span id="campFull" class="sub">' + dayTrip + '</span></div>' +
    '<div class="campline"><span class="goldnum" id="campGold">' + fmt(p.gold) + '</span> gold<span class="sub"> waiting · ' + fmt(campGoldPerHour()) + ' an hour</span></div>' +
    '<div class="campline"><span class="sub">Next crate: </span><i class="campbar sm"><i id="campCrBar" style="width:' + (((+Save.data.campProg || 0) + p.hours * campRateMul() / CAMP_CRATE_HOURS) % 1 * 100).toFixed(0) + '%"></i></i><span class="sub" id="campCrTxt"> ' + (p.crates ? '+' + p.crates + ' ready to collect' : '') + '</span></div>' +
    '<div class="row" style="margin-top:8px"><button class="btn buy' + (can ? '' : ' ghost') + '" id="campCollect" data-a="camp-collect"' + (can ? '' : ' disabled') + '>Collect</button></div></div>' + resNote +
    '<div class="campcrates"><div class="cratetop">' + ico('@t-x-box') + '</div><div><div class="nm">' + crate.name + 's in store: <b>' + stock + '</b></div><div class="ds">' + crate.blurb + '</div>' +
    '<div class="odds">' + ['common', 'rare', 'epic', 'legendary', 'mythical'].map(function(r){ return '<span class="o ' + r + '">' + r.charAt(0).toUpperCase() + r.slice(1) + ' ' + crate.weights[r] + '%</span>'; }).join('') + '</div>' +
    '<div class="pity">' + gearPityText('camp') + (trinketOwned('campfire') ? '' : ' A 3% chance in each of finding the Camp Hearth.') + '</div>' +
    '<div class="row" style="margin-top:6px"><button class="btn sm' + (stock ? '' : ' ghost') + '" data-a="camp-open-1"' + (stock ? '' : ' disabled') + '>Open 1</button>' +
    '<button class="btn sm ghost' + (stock >= 5 ? ' ok' : '') + '" data-a="camp-open-5"' + (stock >= 5 ? '' : ' disabled') + '>Open 5</button>' +
    '<button class="btn sm ghost' + (stock >= 2 ? ' ok' : '') + '" data-a="camp-open-all"' + (stock >= 2 ? '' : ' disabled') + '>Open all' + (stock >= 2 ? '<small>' + Math.min(10, stock) + '</small>' : '') + '</button></div></div></div>' +
    '<h4 style="margin:14px 0 6px">Camp upgrades <span class="sub">(gems; each level opens at a chapter)</span></h4>' + campUpRowHTML('rate') + campUpRowHTML('cap') + '</div>';
}
/* the numbers tick without redrawing the page; the timer stops itself when the tab is not showing */
function campTick(){
  if (!(G.state === 'shop' && shopTab === 'camp') || !campUnlocked()){ clearInterval(campPage.timer); campPage.timer = 0; return; }
  const p = campPending(), cap = campCapHours(), el = function(id){ return document.getElementById(id); };
  const fill = el('campBarFill'); if (!fill) return;
  fill.style.width = Math.min(100, p.hours / cap * 100).toFixed(1) + '%'; fill.className = p.hours >= cap - 1e-9 ? 'full' : '';
  el('campHrs').textContent = campTime(p.hours); el('campGold').textContent = fmt(p.gold);
  el('campFull').textContent = p.hours < cap ? 'Full in ' + campTime(cap - p.hours) : 'Full. It has stopped working until you collect.';
  el('campCrBar').style.width = (((+Save.data.campProg || 0) + p.hours * campRateMul() / CAMP_CRATE_HOURS) % 1 * 100).toFixed(0) + '%';
  el('campCrTxt').textContent = p.crates ? ' +' + p.crates + ' ready to collect' : '';
  const b = el('campCollect'); if (b){ const can = p.hours >= 1 / 120; b.disabled = !can; b.classList.toggle('ghost', !can); }
}
(function(){
  const s = showShop;
  showShop = function(tab){
    const r = s.apply(this, arguments);
    if (shopTab === 'camp' && G.state === 'shop' && campUnlocked()){ if (!campPage.timer) campPage.timer = setInterval(campTick, 1000); }
    return r;
  };
  const h = handleAction;
  handleAction = function(a){
    if (typeof a === 'string' && a.indexOf('camp-') === 0 || a === 'tab-camp'){
      if (a === 'tab-camp'){ SFX.click(); crateResult = null; campPage.note = ''; showShop('camp'); return; }
      if (a === 'camp-collect'){
        const r = campCollect();
        if (!r){ SFX.deny(); return; }
        campPage.note = 'Collected ' + campTime(r.hours) + ' of work: ' + fmt(r.gold) + ' gold' + (r.crates ? ' and ' + r.crates + (r.crates === 1 ? ' Camp Crate' : ' Camp Crates') : '') + '.';
        SFX.buy(); showShop('camp'); return;
      }
      if (a.indexOf('camp-buy-') === 0){ const id = a.slice(9); if (campBuy(id)){ SFX.buy(); campPage.note = ''; showShop('camp'); } else SFX.deny(); return; }
      if (a.indexOf('camp-open-') === 0){
        const n = a === 'camp-open-1' ? 1 : a === 'camp-open-5' ? 5 : 10, list = campOpen(n);
        if (!list){ SFX.deny(); return; }
        const t = list.filter(function(r){ return r.trinket; }).length;
        campPage.note = t ? 'The Camp Hearth was in the pile. Wear it on the Trinkets page.' : '';
        crateResult = null; showShop('camp'); gearRevealStart(list.length > 1 ? list : list[0]);
        if (t) SFX.level();
        return;
      }
    }
    return h.apply(this, arguments);
  };
})();
