'use strict';
/* =============================================================================================================================
   41c-wheel-page.js  --  THE PRIZE WHEELS, REVAMPED, AND THE SPOTTED WHEEL. The Wheel tab used to be one flat disc with a legend. Now it has two
   wheels to pick between (two cards at the top, each with its key count and how the key is earned), a painted wheel with icons on its slices, a
   prize list with the chance of each prize and whether the trinket is new to her, and Spin 1 / 5 / 10 buttons (like the gear crates).
   THE PRIZE WHEEL  Unchanged odds (WHEEL_SEGMENTS, 05-gear.js): a key for 50,000,000 score in one run, at most one every 30 minutes.
   THE SPOTTED WHEEL  Takes a Spotted key, earned the same way at ten times the score (500,000,000, its own 30-minute cooldown). 20% Red Rampage,
     3% the Spotted Paw trinket (05-gear.js), 12% Peaceful Lune, 250,000 or 1,000,000 gold, 1,500 or 4,500 gems, 200 food, or a free Spotted
     Crate (one gear piece, opened with the crate code in 05a-gear-levels.js, so duplicates level up as usual). A trinket she already owns pays
     gold instead (SPOTTED_WHEELS refund). Spotted keys are Save.data.spottedKeys / lastSpottedKeyAt (01-core.js).
   SPINNING  The reward of every spin is decided and saved the moment the keys are spent; the animation is only for show (as before). Spin 5 and
     Spin 10 decide all their prizes at once, turn the wheel once to the best one, and list everything won underneath.
   Replaces wheelTabHTML, spinWheelUI and revealWheelResult (11-ants.js) and wraps checkWheelKey and handleAction; the old 'spin-wheel' action
   (43-input.js) still spins once on the wheel that is showing.
   ============================================================================================================================= */
const SPOTTED_KEY_SCORE = WHEEL_SCORE_THRESHOLD * 10, SPOTTED_KEY_COOLDOWN_MS = WHEEL_KEY_COOLDOWN_MS;
/* weight is the chance in percent (they add up to 100); rank orders the prizes so a batch turns the wheel to its best; refund is the gold for a trinket already owned */
const SPOTTED_SEGMENTS = [
  { id: 'redrampage',   label: 'Red Rampage',      weight: 20, color: '#D42020', kind: 'trinket', refund: 250000 },
  { id: 'gems_l',       label: '1,500 Gems',       weight: 16, color: '#3E9AD0', kind: 'gems',  amount: 1500 },
  { id: 'gold_l',       label: '250,000 Gold',     weight: 14, color: '#C9A23A', kind: 'gold',  amount: 250000 },
  { id: 'spotcrate',    label: 'Spotted Crate',    weight: 12, color: '#B8794A', kind: 'crate' },
  { id: 'spottedpaw',   label: 'Spotted Paw',      weight: 3,  color: '#F29A2E', kind: 'trinket', refund: 1000000 },
  { id: 'peacefullune', label: 'Peaceful Lune',    weight: 12, color: '#8FAEE8', kind: 'trinket', refund: 250000 },
  { id: 'gems_xl',      label: '4,500 Gems',       weight: 9,  color: '#6FD0F0', kind: 'gems',  amount: 4500 },
  { id: 'food',         label: '200 Food',         weight: 6,  color: '#7FB85A', kind: 'food',  amount: 200 },
  { id: 'gold_xl',      label: '1,000,000 Gold',   weight: 8,  color: '#F0CF5A', kind: 'gold',  amount: 1000000 }
];
/* what each prize looks like on the wheel and in the list: icon, rank (higher = better), and a line about it */
const WHEEL_VIEW = {
  redrampage:   { icon: '@t-flame',   rank: 9, note: 'Trinket: every piece of gear 1.4× stronger' },
  spottedpaw:   { icon: '@t-paw',     rank: 10, note: 'Trinket: damage +7%, crit +3%, gold +10%' },
  peacefullune: { icon: '@t-x-moon',  rank: 5, note: 'Trinket: press T to slow the world' },
  gold_small:   { icon: '@t-coin',   rank: 2 }, gold_large: { icon: '@t-coin', rank: 3 },
  gems_small:   { icon: '@t-x-gem',   rank: 2 }, gems_large: { icon: '@t-x-gem', rank: 3 },
  gems_l:       { icon: '@t-x-gem',   rank: 4 }, gems_xl:    { icon: '@t-x-gem', rank: 6 },
  gold_l:       { icon: '@t-coin',   rank: 4 }, gold_xl:    { icon: '@t-coin', rank: 7 },
  spotcrate:    { icon: '@t-x-gift',  rank: 8, note: 'One free gear piece from the best crate' },
  food:         { icon: '@t-apple',   rank: 3, note: 'For the ants and the Spotted Crate' }
};
const WHEELS = {
  normal:  { id: 'normal',  name: 'Prize wheel',   keyName: 'key',         field: 'wheelKeys',   at: 'lastWheelKeyAt',   score: WHEEL_SCORE_THRESHOLD, cd: WHEEL_KEY_COOLDOWN_MS, segs: WHEEL_SEGMENTS, dupe: 25000, color: '#E8C24A', rim: '#6B4A2A', stud: '#E8C24A', spots: false,
             blurb: 'Gold, gems, and the Peaceful Lune. One in fifty is a Red Rampage.' },
  spotted: { id: 'spotted', name: 'Spotted wheel', keyName: 'Spotted key', field: 'spottedKeys', at: 'lastSpottedKeyAt', score: SPOTTED_KEY_SCORE,     cd: SPOTTED_KEY_COOLDOWN_MS, segs: SPOTTED_SEGMENTS, dupe: 250000, color: '#F29A2E', rim: '#8A5A2B', stud: '#F3E3C0', spots: true,
             blurb: 'Much better prizes: one spin in five is a Red Rampage, and there is a trinket found nowhere else.' }
};
const wheelPage = { id: 'normal', batch: null, n: 1 };
const WRARITY = { common: '#A9997F', rare: '#7E9B4E', epic: '#9A5BD6', legendary: '#FFD84D', mythical: '#FF6BD6' };
function wico(i){ return ico(i + ':#FFFFFF'); }                                             /* white on the coloured slice, whatever the icon's usual colour */
function wheelView(seg){ return WHEEL_VIEW[seg.id] || { icon: '@t-x-gift', rank: 1 }; }
function wheelCur(){ return WHEELS[wheelPage.id] || WHEELS.normal; }
function wheelKeysOf(W){ return Save.data[W.field] | 0; }

/* ---------- earning the Spotted key ---------- */
(function(){
  const base = checkWheelKey;
  checkWheelKey = function(){
    base.apply(this, arguments);
    if (G.attract || G.score < SPOTTED_KEY_SCORE) return;
    const now = Date.now();
    if (Save.data.lastSpottedKeyAt && now - Save.data.lastSpottedKeyAt < SPOTTED_KEY_COOLDOWN_MS) return;
    Save.data.lastSpottedKeyAt = now;
    Save.data.spottedKeys = (Save.data.spottedKeys | 0) + 1;
    Save.write();
    banner('SPOTTED KEY EARNED', 'Spin the Spotted wheel at the trading post.', '#F29A2E', 3.8);
    SFX.level();
  };
})();

/* ---------- deciding what a spin wins ---------- */
function wheelRoll(W){
  const total = W.segs.reduce(function(a, x){ return a + x.weight; }, 0); let r = Math.random() * total;
  for (let i = 0; i < W.segs.length; i++){ if (r < W.segs[i].weight) return W.segs[i]; r -= W.segs[i].weight; }
  return W.segs[W.segs.length - 1];
}
/* a free Spotted Crate: the gems and food it costs are put in the purse for an instant, so the ordinary crate code runs unchanged */
function wheelFreeCrate(){
  const c = CRATES.spotted, g0 = Save.data.gems, f0 = Save.data.food;
  Save.data.gems += c.cost; Save.data.food = (+Save.data.food || 0) + c.food;
  const res = openCrate('spotted');
  if (!res){ Save.data.gems = g0; Save.data.food = f0; }
  return res;
}
/* pay out one segment: {seg, label, gold, gems, food, isNew, duplicate, crate} (gold, gems and food are everything credited, refunds included) */
function wheelPay(W, seg){
  const out = { seg: seg, label: seg.label, gold: 0, gems: 0, food: 0, isNew: false, duplicate: false, refund: 0, crate: null };
  if (seg.kind === 'trinket'){
    if (grantTrinket(seg.id)){ out.isNew = true; }
    else { out.duplicate = true; out.refund = seg.refund || W.dupe; out.gold = out.refund; Save.data.gold += out.refund; out.label = TRINKETS[seg.id].name + ' (already owned — ' + fmt(out.refund) + ' gold instead)'; }
  } else if (seg.kind === 'gold'){ out.gold = seg.amount; Save.data.gold += seg.amount; }
  else if (seg.kind === 'gems'){ out.gems = seg.amount; Save.data.gems += seg.amount; }
  else if (seg.kind === 'food'){ out.food = seg.amount; Save.data.food = (+Save.data.food || 0) + seg.amount; }
  else if (seg.kind === 'crate'){ out.crate = wheelFreeCrate(); if (out.crate && out.crate.dupe && !out.crate.levelUp) out.gems += out.crate.refund; }
  return out;
}
/* spend n keys on wheel W and decide every prize (nothing is drawn here); null if she cannot */
function wheelSpendKeys(W, n){
  if (!(n >= 1) || wheelKeysOf(W) < n) return null;
  Save.data[W.field] = wheelKeysOf(W) - n;
  const list = [];
  for (let i = 0; i < n; i++) list.push(wheelPay(W, wheelRoll(W)));
  Save.write();
  return list;
}
function wheelBest(list){
  return list.reduce(function(b, r){ const k = wheelView(r.seg).rank + (r.isNew ? 5 : 0) - (r.duplicate ? 4 : 0) + (r.crate ? RARITY_ORDER[r.crate.rarity] : 0); return k > b.k ? { k: k, r: r } : b; }, { k: -99, r: list[0] }).r;
}

/* ---------- drawing the wheel ---------- */
function wheelLayout(W){
  const total = W.segs.reduce(function(a, x){ return a + x.weight; }, 0); let cum = 0;
  return W.segs.map(function(seg){ const a0 = cum / total * 360; cum += seg.weight; const a1 = cum / total * 360; return { seg: seg, a0: a0, a1: a1, mid: (a0 + a1) / 2 }; });
}
function wpt(a, r){ const t = a * Math.PI / 180; return (r * Math.sin(t)).toFixed(2) + ',' + (-r * Math.cos(t)).toFixed(2); }
function wheelDiscHTML(W){
  const L = wheelLayout(W), R = 92;
  let svg = '<svg viewBox="-100 -100 200 200" aria-hidden="true"><defs><radialGradient id="wsheen" cx="50%" cy="38%" r="70%"><stop offset="0" stop-color="#fff" stop-opacity=".22"/><stop offset=".6" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".28"/></radialGradient>' +
    (W.spots ? '<pattern id="wspots" width="30" height="30" patternUnits="userSpaceOnUse"><ellipse cx="7" cy="8" rx="4.2" ry="3.2" fill="#3A1F0A" opacity=".2"/><ellipse cx="21" cy="20" rx="5" ry="3.6" fill="#3A1F0A" opacity=".2"/><ellipse cx="24" cy="6" rx="2.4" ry="2" fill="#3A1F0A" opacity=".16"/></pattern>' : '') + '</defs>';
  L.forEach(function(s){ svg += '<path d="M0,0 L' + wpt(s.a0, R) + ' A' + R + ',' + R + ' 0 ' + (s.a1 - s.a0 > 180 ? 1 : 0) + ' 1 ' + wpt(s.a1, R) + ' Z" fill="' + s.seg.color + '" stroke="#24170E" stroke-width="1"/>'; });
  if (W.spots) svg += '<circle r="' + R + '" fill="url(#wspots)"/>';
  svg += '<circle r="' + R + '" fill="url(#wsheen)"/><circle r="96" fill="none" stroke="' + W.rim + '" stroke-width="8"/><circle r="92" fill="none" stroke="rgba(0,0,0,.45)" stroke-width="1"/>';
  for (let i = 0; i < 24; i++) svg += '<circle cx="' + (96 * Math.sin(i * Math.PI / 12)).toFixed(2) + '" cy="' + (-96 * Math.cos(i * Math.PI / 12)).toFixed(2) + '" r="1.5" fill="' + W.stud + '"/>';
  svg += '</svg>';
  const icons = L.map(function(s){
    const small = s.a1 - s.a0 < 20;
    return '<span class="wic' + (small ? ' sm' : '') + '" style="transform:translate(-50%,-50%) rotate(' + s.mid.toFixed(1) + 'deg) translateY(calc(var(--ws) * ' + (small ? '-0.385' : '-0.33') + '))">' + wico(wheelView(s.seg).icon) + '</span>';
  }).join('');
  return svg + icons;
}

/* ---------- the page ---------- */
function wheelCooldownText(W){
  const left = (Save.data[W.at] || 0) + W.cd - Date.now();
  return left > 0 ? 'Next key in ' + Math.ceil(left / 60000) + ' min' : '';
}
function wheelCardHTML(W){
  const keys = wheelKeysOf(W), best = Math.max(0, +Save.data.best || 0), pct = Math.min(100, best / W.score * 100), cdt = wheelCooldownText(W);
  return '<button class="wcard' + (W.id === 'spotted' ? ' spotted' : '') + (wheelPage.id === W.id ? ' on' : '') + '" data-a="wheel-pick-' + W.id + '"' + (wheelSpinning ? ' disabled' : '') + ' aria-pressed="' + (wheelPage.id === W.id) + '" style="--wc:' + W.color + '">' +
    '<span class="wcic">' + ico('@t-x-wheel') + '</span><span class="wct"><b>' + W.name + '</b><small>' + W.blurb + '</small></span>' +
    '<span class="wckeys">' + ico('@t-x-key') + '<b>' + fmt(keys) + '</b> ' + W.keyName + (keys === 1 ? '' : 's') + '</span>' +
    '<span class="wcgoal">A ' + W.keyName + ' for ' + fmt(W.score) + ' score in one run' + (cdt ? ' · ' + cdt : '') + '<i class="wcbar"><u style="width:' + pct.toFixed(1) + '%"></u></i></span></button>';
}
function wheelPrizeRowsHTML(W){
  return '<div class="wprizes">' + wheelLayout(W).map(function(s){
    const seg = s.seg, v = wheelView(seg), isT = seg.kind === 'trinket', own = isT && trinketOwned(seg.id), note = v.note || '';
    return '<div class="wprize' + (own ? ' own' : '') + '" style="--c:' + seg.color + '"><span class="wpi">' + wico(v.icon) + '</span>' +
      '<span class="wpt"><b>' + seg.label + '</b>' + (note ? '<small>' + note + '</small>' : '') + '</span>' +
      (isT ? '<em class="wpb' + (own ? '' : ' new') + '">' + (own ? 'Owned' : 'New') + '</em>' : '') +
      '<span class="wpc">' + seg.weight + '%</span><i class="wpbar"><u style="width:' + Math.min(100, seg.weight * 3.2) + '%"></u></i></div>';
  }).join('') + '</div>';
}
function wheelGearLine(res){ return res.dupe ? (res.levelUp ? 'levelled up to +' + (res.levelUp - 1) : 'top level, ' + res.refund + ' gems back') : 'new'; }
function wheelOneHTML(r){
  const W = wheelCur();
  if (r.crate){
    const c = r.crate, p = c.piece;
    return '<div class="crateresult ' + c.rarity + '"><div class="rr">You won a Spotted Crate</div><div class="rn">' + p.name + '</div><div class="rd">' + p.setName + ' · ' + SLOT_LABEL[p.slot] + ' · ' + c.rarity + ' · ' + wheelGearLine(c) + '</div></div>';
  }
  return '<div class="crateresult ' + (r.duplicate ? 'common' : (TRINKETS[r.seg.id] ? 'legendary' : 'rare')) + '"><div class="rr">' + (r.isNew ? 'New trinket!' : 'You won') + '</div><div class="rn">' + r.label + '</div>' +
    (r.isNew ? '<div class="rd">' + TRINKETS[r.seg.id].desc + ' Wear it on the Gear tab.</div>' : '') + '</div>';
}
function wheelBatchHTML(list){
  const tot = { gold: 0, gems: 0, food: 0 }, counts = {}, order = [], trin = [], gear = [];
  list.forEach(function(r){
    tot.gold += r.gold; tot.gems += r.gems; tot.food += r.food;
    if (r.crate) gear.push(r.crate);
    else if (r.seg.kind === 'trinket') trin.push(r);
    else { if (!counts[r.seg.id]){ counts[r.seg.id] = 0; order.push(r.seg); } counts[r.seg.id]++; }
  });
  const sum = [tot.gold ? '+' + fmt(tot.gold) + ' gold' : '', tot.gems ? '+' + fmt(tot.gems) + ' gems' : '', tot.food ? '+' + fmt(tot.food) + ' food' : ''].filter(Boolean).join(' · ');
  const chips = order.map(function(seg){ return '<span class="wchip" style="--c:' + seg.color + '">' + wico(wheelView(seg).icon) + '<b>' + counts[seg.id] + '×</b> ' + seg.label + '</span>'; }).join('') +
    trin.map(function(r){ return '<span class="wchip big' + (r.isNew ? ' new' : '') + '" style="--c:' + r.seg.color + '">' + wico(wheelView(r.seg).icon) + (r.isNew ? '<b>NEW</b> ' : '') + TRINKETS[r.seg.id].name + (r.duplicate ? ' <small>(' + fmt(r.refund) + ' gold)</small>' : '') + '</span>'; }).join('') +
    gear.map(function(c){ return '<span class="wchip gear" style="--c:' + WRARITY[c.rarity] + '">' + wico('@t-x-gift') + '<b>' + c.piece.name + '</b> <small>' + c.rarity + ', ' + wheelGearLine(c) + '</small></span>'; }).join('');
  return '<div class="crateresult ' + (trin.some(function(r){ return r.isNew; }) ? 'legendary' : 'rare') + ' wbatch"><div class="rr">' + list.length + ' spins</div><div class="rn">' + (sum || 'Prizes won') + '</div><div class="wchips">' + chips + '</div></div>';
}
function wheelTabHTML(){
  const W = wheelCur(), keys = wheelKeysOf(W), busy = wheelSpinning;
  const result = wheelResult ? (wheelPage.batch && wheelPage.batch.length > 1 ? wheelBatchHTML(wheelPage.batch) : wheelOneHTML(wheelResult)) : '';
  const btns = [1, 5, 10].map(function(n){
    const ok = keys >= n && !busy;
    return '<button class="btn sm' + (n === 1 ? '' : ' ghost crm') + (ok ? (n === 1 ? '' : ' ok') : ' ghost') + '" ' + (n === 1 ? 'id="wheelSpinBtn" data-a="spin-wheel"' : 'data-a="wheel-spin-' + n + '"') + (ok ? '' : ' disabled') + '>' +
      (n === 1 ? (busy ? 'Spinning…' : 'Spin') : 'Spin ' + n) + '<small>' + n + ' ' + W.keyName + (n === 1 ? '' : 's') + '</small></button>';
  }).join('');
  return '<div class="wheelpg' + (W.id === 'spotted' ? ' spotted' : '') + '" style="--wc:' + W.color + '">' +
    '<div class="wpick">' + wheelCardHTML(WHEELS.normal) + wheelCardHTML(WHEELS.spotted) + '</div>' +
    '<div class="wmain"><div class="wleft">' +
      '<div class="wwheel"><div class="wpointer"></div><div class="wdisc" id="wheelDisc" style="transform:rotate(' + wheelRotation + 'deg)">' + wheelDiscHTML(W) + '</div><div class="whub">' + ico('@t-x-key') + '</div></div>' +
      '<div class="wbtns">' + btns + '</div>' +
      (keys <= 0 && !busy ? '<p class="gnote wnokey">You need ' + (W.id === 'spotted' ? 'a Spotted key' : 'a key') + ' to spin. Reach ' + fmt(W.score) + ' score in a single run.</p>' : '') +
    '</div><div class="wright"><h4 class="wh">' + W.name + ' prizes</h4>' + wheelPrizeRowsHTML(W) + '</div></div>' +
    (result ? '<div class="wresult" id="wheelResult">' + result + '</div>' : '') + '</div>';
}

/* ---------- spinning ---------- */
function wheelSound(r){
  try {
    const k = r.isNew ? 4 : r.crate ? RARITY_ORDER[r.crate.rarity] : wheelView(r.seg).rank >= 7 ? 3 : wheelView(r.seg).rank >= 4 ? 2 : 1;
    gearRevealSound({ rarity: ['common', 'common', 'rare', 'epic', 'legendary', 'mythical'][Math.min(5, k)] });
  } catch (e) {}
}
function wheelSpinN(n){
  if (wheelSpinning) return;
  const W = wheelCur(), list = wheelSpendKeys(W, n);
  if (!list){ SFX.deny(); return; }
  const best = wheelBest(list), s = wheelLayout(W).filter(function(x){ return x.seg === best.seg; })[0];
  wheelSpinning = true; wheelResult = null; wheelPage.batch = null;
  const jitter = (Math.random() - 0.5) * 0.6 * (s.a1 - s.a0);
  const target = wheelRotation - (wheelRotation % 360) + 5 * 360 + (360 - (s.mid + jitter));
  /* draw the wheel at the angle it is resting at, force that frame onto the screen, and only then give it the angle to turn to with a transition
     (setting both in one go leaves nothing to animate between) */
  SFX.click(); showShop('wheel');
  const disc = document.getElementById('wheelDisc');
  if (disc){
    void disc.offsetWidth;
    disc.style.transition = 'transform ' + (WHEEL_SPIN_MS / 1000) + 's cubic-bezier(0.13,0.66,0.24,1)';
    disc.style.transform = 'rotate(' + target + 'deg)';
  }
  wheelRotation = target;
  setTimeout(function(){ wheelPage.batch = list; revealWheelResult(best); }, WHEEL_SPIN_MS);
}
spinWheelUI = function(){ wheelSpinN(1); };
revealWheelResult = function(result){
  wheelSpinning = false; wheelResult = result;
  if (G.state === 'shop' && shopTab === 'wheel'){ showShop('wheel'); wheelSound(result); }
};
(function(){
  const h = handleAction;
  handleAction = function(a){
    if (typeof a === 'string'){
      if (a.indexOf('wheel-pick-') === 0){
        const id = a.slice(11); if (!WHEELS[id] || wheelSpinning) return;
        wheelPage.id = id; wheelPage.batch = null; wheelResult = null; wheelRotation = 0; SFX.click(); showShop('wheel'); return;
      }
      if (a.indexOf('wheel-spin-') === 0){ const n = +a.slice(11); if (n === 5 || n === 10) wheelSpinN(n); return; }
    }
    return h.apply(this, arguments);
  };
})();
