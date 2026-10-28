'use strict';
/* =============================================================================================================================
   41a-gear-page.js  --  THE GEAR PAGE, REDONE. gearTabHTML() (41-qol.js) is replaced by a paper doll: a live picture of the giraffe wearing
   her gear (drawn by the game's own drawPlayer(), so what you see is what plays), a button for each slot, the pieces for the chosen slot as
   drawn icons (the ones you have not found are dark silhouettes), a side panel with her build, and the crates and trinkets below.
   Pointing at a piece (or tapping it) tries it on in the picture without equipping it. A second view, "Sets", shows each set as three
   tiles with its bonus. Hats and boots are not here: they stay on the Coat colors screen (the picture shows the ones she wears).
   Needs 05a (levels), 33a-33d (art and icons). State: gearPage { slot, selected, hover, view }; the live picture: gearPreview.
   ============================================================================================================================= */
const gearPage = { slot: 'cape', selected: null, hover: null, view: 'doll' };
const gearPreview = { id: 0, raf: 0, frames: 0, kickT: -1, last: 0, lastDraw: 0, trail: [], trailT: 0 };
const GEAR_SLOT_NAME = { cape: 'Capes', weapon: 'Weapons', armor: 'Armor' };

function gaDesc(p){ return p.desc || (p.weapon ? WEAPONS[p.weapon].blurb : ''); }
function gaPiecesOf(slot){
  const out = [];
  GEAR_SETS.forEach(function(s){ if (s.pieces[slot]) out.push(GEAR_INDEX[s.id + ':' + slot]); });
  return out.sort(function(a, b){ const oa = gearOwned(a.id) ? 0 : 1, ob = gearOwned(b.id) ? 0 : 1; return oa - ob || RARITY_ORDER[a.rarity] - RARITY_ORDER[b.rarity]; });
}
function gaFx(id){ return typeof GEAR_FX !== 'undefined' ? GEAR_FX[id] || null : null; }
/* what the picture shows: what she wears, with the piece being pointed at or selected swapped in */
function gearTryon(){
  const id = gearPage.hover || gearPage.selected;
  return id && GEAR_INDEX[id] && gearOwned(id) ? id : null;
}
function gearShownLoadout(){
  const lo = { cape: gearEquipped('cape'), weapon: gearEquipped('weapon'), armor: gearEquipped('armor') }, t = gearTryon();
  if (t) lo[GEAR_INDEX[t].slot] = t;
  return lo;
}

/* ---------- the live picture ---------- */
const GA_P_KEYS = ['x', 'y', 'vx', 'vy', 'aim', 'face', 'walk', 'hurtT', 'invuln', 'kickAnim', 'rage', 'dead', 'weapon', 'capeColor', 'armorInfo', 'capeSet', 'capeLevel', 'weaponLevel', 'armorLevel'];
const GA_GF_KEYS = ['blink', 'ear', 'sq', 'breath', 'sway', 'reach', 'pulse', 'power', 'neck', 'land', 'trail', 'trailT'];
function gearPreviewDraw(cv, ts){
  const c = cv.getContext('2d'), W = cv.width, H = cv.height, t = ts / 1000, dt = Math.min(0.1, gearPreview.last ? (ts - gearPreview.last) / 1000 : 0.033);
  gearPreview.last = ts;
  c.clearRect(0, 0, W, H);
  const g = c.createRadialGradient(W * 0.34, H * 0.6, 8, W * 0.34, H * 0.6, W * 0.5); g.addColorStop(0, 'rgba(201,138,60,.26)'); g.addColorStop(1, 'rgba(201,138,60,0)'); c.fillStyle = g; c.fillRect(0, 0, W, H);
  c.fillStyle = 'rgba(0,0,0,.16)'; c.beginPath(); c.ellipse(W * 0.34, H * 0.68, 130, 26, 0, 0, TAU); c.fill();
  const keepTr = Save.data.equippedTrinkets, trTry = typeof trinketShownList === 'function' ? trinketShownList() : null;                 /* pointing at a trinket tries it on (the Lime Helmet shows) */
  const lo = gearShownLoadout(), keepP = {}, keepGF = {}, keepG = { time: G.time, biome: G.biome, chapter: G.chapter }, keepShow = Settings.showGear, keepGhost = NS.ghosts;
  GA_P_KEYS.forEach(function(k){ keepP[k] = P[k]; }); GA_GF_KEYS.forEach(function(k){ keepGF[k] = GF[k]; });
  let ke = -1;
  if (gearPreview.kickT >= 0){ gearPreview.kickT += dt; if (gearPreview.kickT >= 0.30) gearPreview.kickT = -1; else ke = gearPreview.kickT / 0.30; }
  try {
    if (trTry) Save.data.equippedTrinkets = trTry;
    Settings.showGear = true; G.time = t; G.biome = 'savanna'; G.chapter = 1; NS.ghosts = [];
    const cp = lo.cape ? GEAR_INDEX[lo.cape] : null, wp = lo.weapon ? GEAR_INDEX[lo.weapon] : null, ap = lo.armor ? GEAR_INDEX[lo.armor] : null;
    P.x = 0; P.y = 0; P.vx = 0; P.vy = 0; P.aim = 0; P.face = 0; P.walk = 0.5; P.hurtT = 0; P.invuln = 0; P.rage = 0; P.dead = false;
    P.kickAnim = ke >= 0 ? 0.30 - gearPreview.kickT : 0;
    P.capeColor = cp ? cp.color : null; P.capeSet = cp ? cp.setId : null; P.capeLevel = cp ? gearLevel(cp.id) : 1;
    P.weapon = wp && wp.weapon ? weaponAtLevel(WEAPONS[wp.weapon], gearLevel(wp.id)) : DEFAULT_WEAPON; P.weaponLevel = wp ? gearLevel(wp.id) : 1;
    P.armorInfo = ap ? { setId: ap.setId, color: ap.color, rarity: ap.rarity } : null; P.armorLevel = ap ? gearLevel(ap.id) : 1;
    GF.blink = 0; GF.ear = 0; GF.sq = 0; GF.reach = 0; GF.pulse = 0; GF.power = 0; GF.land = 0; GF.breath = Math.sin(t * 2.4) * 0.014; GF.sway = Math.sin(t * 1.3) * 1.6;
    GF.neck = { ext: 0, bend: 0 }; GF.trail = gearPreview.trail; GF.trailT = gearPreview.trailT - dt;
    /* Advance only the picture's afterimages; the run's array and timer are restored below. */
    for (let i = GF.trail.length - 1; i >= 0; i--){ GF.trail[i].age += dt; if (GF.trail[i].age > 0.26) GF.trail.splice(i, 1); }
    if (fxLevelNow() <= 0) GF.trail.length = 0;
    else if (ke >= 0 && GF.trailT <= 0){ GF.trailT = 0.035; GF.trail.push({ x: P.x, y: P.y, f: P.face, age: 0 }); if (GF.trail.length > 6) GF.trail.shift(); }
    gearPreview.trailT = GF.trailT;
    if (ke >= 0){ const pr = neckProfile(ke); GF.neck = { ext: pr.k * NS_REACH, bend: pr.w * 30 }; GF.sq = Math.sin(ke * Math.PI) * 0.1; if (ke > 0.3) GF.land = Math.max(0, 1 - (ke - 0.3) * 3.4); }
    c.save(); c.translate(W * 0.26, H * 0.56); c.scale(1.9, 1.9); drawPlayer(c); c.restore();
  } finally {
    GA_P_KEYS.forEach(function(k){ P[k] = keepP[k]; }); GA_GF_KEYS.forEach(function(k){ GF[k] = keepGF[k]; });
    Save.data.equippedTrinkets = keepTr;
    G.time = keepG.time; G.biome = keepG.biome; G.chapter = keepG.chapter; Settings.showGear = keepShow; NS.ghosts = keepGhost;
  }
  gearPreview.frames++;
}
function gearPreviewStop(){ if (gearPreview.raf) cancelAnimationFrame(gearPreview.raf); gearPreview.raf = 0; gearPreview.id++; }
function gearPreviewMount(){
  gearPreviewStop();
  const cv = document.getElementById('gearPreview'); if (!cv) return;
  const me = gearPreview.id; gearPreview.last = 0; gearPreview.lastDraw = 0; gearPreview.err = null; gearPreview.trail = []; gearPreview.trailT = 0;
  (function loop(ts){
    if (me !== gearPreview.id || !document.body.contains(cv)) return;                         /* left the tab, or the page was drawn again: this loop ends */
    if (!gearPreview.lastDraw || ts - gearPreview.lastDraw >= 32){ gearPreview.lastDraw = ts; try { gearPreviewDraw(cv, ts); } catch (e) { gearPreview.err = e.message; return; } }
    gearPreview.raf = requestAnimationFrame(loop);
  })(performance.now());
}

/* ---------- the page ---------- */
function gearPityText(kind){
  const pc = CRATE_PITY[kind];
  if (!pc) return 'Food: you have ' + (Math.round((+Save.data.food || 0) * 10) / 10) + '. One in ' + Math.round(100 / CRATES[kind].weights.mythical) + ' is a mythical.';
  const left = pc.every - cratePityCount(kind);
  return left <= 1 ? pc.floor.charAt(0).toUpperCase() + pc.floor.slice(1) + ' or better is guaranteed on the next open.' : pc.floor.charAt(0).toUpperCase() + pc.floor.slice(1) + ' or better is guaranteed within ' + left + ' opens.';
}
function gearResultLine(res){
  if (!res.dupe) return gaDesc(res.piece);
  return res.levelUp ? 'You already had it, so it levelled up to +' + (res.levelUp - 1) + '. Its effects are ' + Math.round((gearLevelScale(res.levelUp) - 1) * 100) + '% stronger.' : 'You already own this at its top level. Refunded ' + res.refund + ' gems.';
}
function gearCratesHTML(){
  const gems = Save.data.gems | 0; let crates = '<div class="crates">';
  ['normal', 'rare', 'spotted'].forEach(function(k){
    const c = CRATES[k], food = +Save.data.food || 0, can = gems >= c.cost && (!c.food || food + 1e-9 >= c.food), price = fmt(c.cost) + ' gems' + (c.food ? ' + ' + c.food + ' food' : '');
    crates +=
      '<div class="crate' + (k === 'rare' ? ' prime' : k === 'spotted' ? ' spotted' : '') + '">' +
        '<div class="cratetop">' + ico(k === 'rare' ? '@t-x-gift' : k === 'spotted' ? '@t-x-badge' : '@t-x-box') + '</div>' +
        '<div class="nm">' + c.name + '</div><div class="ds">' + c.blurb + '</div>' +
        '<div class="odds">' + ['common', 'rare', 'epic', 'legendary', 'mythical'].map(function(r){ return '<span class="o ' + r + '">' + r.charAt(0).toUpperCase() + r.slice(1) + ' ' + c.weights[r] + '%</span>'; }).join('') + '</div>' +
        '<div class="pity">' + gearPityText(k) + '</div>' +
        '<button class="btn sm' + (can ? '' : ' ghost') + '" data-crate="' + k + '"' + (can ? '' : ' disabled') + '>' + (can ? 'Open for ' + price : price) + '</button>' +
        '<div class="crmulti">' + [5, 10].map(function(n){
          const ok = gems >= c.cost * n && (!c.food || food + 1e-9 >= c.food * n);
          return '<button class="btn sm ghost crm' + (ok ? ' ok' : '') + '" data-a="gear-buy-' + k + '-' + n + '"' + (ok ? '' : ' disabled') + '>Open ' + n + '<small>' + fmt(c.cost * n) + ' gems' + (c.food ? ' + ' + c.food * n + ' food' : '') + '</small></button>';
        }).join('') + '</div>' +
      '</div>';
  });
  return crates + '</div>';
}
function gearCrateResultHTML(){
  if (!crateResult) return '';
  const p = crateResult.piece;
  return '<div class="crateresult ' + crateResult.rarity + '"><div class="rr">' + (crateResult.dupe ? 'Duplicate' : 'New gear') + '</div><div class="rn">' + p.name + '</div>' +
    '<div class="rd">' + p.setName + ' · ' + SLOT_LABEL[p.slot] + ' · ' + crateResult.rarity + '</div>' +
    '<div class="rd">' + gearResultLine(crateResult) + '</div></div>';
}
function gearSlotsHTML(){
  return '<div class="gslots">' + GEAR_SLOTS.map(function(slot){
    const id = gearEquipped(slot), p = id ? GEAR_INDEX[id] : null, fr = gearFrame(p ? p.rarity : 'common'), lv = p ? gearLevel(id) : 1;
    return '<button class="gslot' + (gearPage.slot === slot ? ' on' : '') + '" data-a="gear-slot-' + slot + '" style="border-color:' + (gearPage.slot === slot ? 'var(--hide)' : fr.border) + '">' +
      (p ? '<img src="' + gearIcon(id, 56, { level: lv }) + '" alt="">' : '<span class="gempty"></span>') +
      '<span class="gsn"><small>' + SLOT_LABEL[slot] + '</small><b>' + (p ? p.name : (slot === 'weapon' ? DEFAULT_WEAPON.name : 'Empty')) + '</b>' + '</span></button>';
  }).join('') + '</div>';
}
function gearBuildHTML(){
  const active = activeSetBonus(), worn = {};
  GEAR_SLOTS.forEach(function(slot){ const id = gearEquipped(slot); if (id && GEAR_INDEX[id]) worn[GEAR_INDEX[id].setId] = (worn[GEAR_INDEX[id].setId] || 0) + 1; });
  const prog = Object.keys(worn).map(function(sid){ return '<span class="gprog' + (worn[sid] === 3 ? ' full' : '') + '">' + SETMAP[sid].name + ' ' + worn[sid] + '/3</span>'; }).join('');
  const tr = (Save.data.equippedTrinkets || []).filter(function(id){ return TRINKETS[id]; });
  return '<div class="gbuild"><h4>Her build</h4>' +
    (active ? '<p class="setactive">' + active.name + ' set complete — ' + active.setDesc + '</p>' : '<p class="sub" style="margin:0 0 6px">No full set yet. Three pieces of one set add its bonus.</p>') +
    (prog ? '<div class="gprogs">' + prog + '</div>' : '') +
    '<div class="gtr">' + (tr.length ? tr.map(function(id){ return '<span title="' + TRINKETS[id].name + '">' + ico(TRINKETS[id].icon) + '</span>'; }).join('') : '<small>No trinkets worn</small>') + '</div>' +
    '<button class="btn sm ghost" data-a="wardrobe">Hats, boots and colors</button></div>';
}
/* the side panel: the comparison when a piece is being pointed at or selected, her build otherwise (the comparison is in 41a below) */
function gearSideHTML(){
  const id = gearPage.hover || gearPage.selected;
  return id && GEAR_INDEX[id] && gearOwned(id) && typeof gearComparePanel === 'function' ? gearComparePanel(GEAR_INDEX[id].slot, id) : gearBuildHTML();
}
function gearPickerHTML(){
  const slot = gearPage.slot, eq = gearEquipped(slot);
  return '<h3 class="gh">' + GEAR_SLOT_NAME[slot] + (eq ? ' <button class="btn sm ghost gtake" data-unequip="' + slot + '">Take off</button>' : '') + '</h3><div class="gpick">' +
    gaPiecesOf(slot).map(function(p){
      const owned = gearOwned(p.id), lv = gearLevel(p.id);
      return (owned ? '<button class="gp ' + p.rarity + (eq === p.id ? ' on' : '') + (gearPage.selected === p.id ? ' sel' : '') + '" data-a="gear-pick-' + p.id + '" data-gh="' + p.id + '">' : '<div class="gp ' + p.rarity + ' locked">') +
        (owned && gaFx(p.id) ? '<span class="gfxb" title="' + gaFx(p.id).name + ': ' + gaFx(p.id).desc + '">\u2726</span>' : '') + '<img src="' + gearIcon(p.id, 72, { locked: !owned, level: lv }) + '" alt="">' +
        '<b>' + (owned ? p.name : '???') + '</b><small>' + (owned ? p.setName + ' · ' + p.rarity : 'not found yet') + '</small>' +
        (eq === p.id ? '<em>Equipped</em>' : '') + (owned ? '</button>' : '</div>');
    }).join('') + '</div>';
}
function gearSetsHTML(){
  const q = gearSearchQuery.trim().toLowerCase();
  const list = GEAR_SETS.slice().sort(function(a, b){ return RARITY_ORDER[a.rarity] - RARITY_ORDER[b.rarity]; }).filter(function(s){
    return !q || s.name.toLowerCase().indexOf(q) >= 0 || GEAR_SLOTS.some(function(sl){ return s.pieces[sl] && s.pieces[sl].name.toLowerCase().indexOf(q) >= 0; });
  });
  const search = '<input id="gearSearch" class="gsearch" type="text" value="' + escAttr(gearSearchQuery) + '" placeholder="Search your gear…" autocomplete="off">';
  return search + (list.length ? list.map(function(set){
    const n = setWornCount(set.id), owned = GEAR_SLOTS.filter(function(sl){ return set.pieces[sl] && gearOwned(set.id + ':' + sl); }).length;
    return '<div class="gset2 ' + set.rarity + '"><div class="gsh"><b>' + set.name + '</b><span class="gsetrarity ' + set.rarity + '">' + set.rarity + '</span><span class="gsetworn">' + n + '/3 worn · ' + owned + '/3 found</span></div>' +
      '<div class="gsb' + (n === 3 ? ' live' : '') + '">Set bonus: ' + set.setDesc + '</div><div class="gtiles">' +
      GEAR_SLOTS.map(function(sl){
        const p = set.pieces[sl]; if (!p) return '';
        const own = gearOwned(p.id), on = gearEquipped(sl) === p.id;
        return (own ? '<button class="gtile' + (on ? ' on' : '') + '" data-a="gear-pick-' + p.id + '" data-view="doll">' : '<div class="gtile locked">') +
          '<img src="' + gearIcon(p.id, 56, { locked: !own, level: gearLevel(p.id) }) + '" alt=""><b>' + (own ? p.name : '???') + '</b><small>' + SLOT_LABEL[sl] + (on ? ' · equipped' : '') + '</small>' + (own ? '</button>' : '</div>');
      }).join('') + '</div></div>';
  }).join('') : '<p class="sub">No gear matches "' + escAttr(gearSearchQuery) + '".</p>');
}
function gearTabHTML(){
  const ownedCount = Object.keys(Save.data.gear || {}).filter(function(k){ return k.indexOf('trinket:') !== 0; }).length;
  if (!ownedCount && gearPage.view !== 'sets'){                                             /* nothing to dress her in yet: the way to the first piece, then the crates */
    const gems = Save.data.gems | 0, cost = CRATES.normal.cost, ok = gems >= cost;
    return '<div class="antlock"><div class="alh">Find your first piece of gear</div>' +
      '<p class="sub">Gear makes her stronger and changes how she looks. It comes out of crates, and crates cost gems, which enemies drop during a run. ' + (ok ? 'You have enough for a crate now.' : 'Play a run, then come back and open one.') + '</p>' +
      '<i class="upbar big"><u style="width:' + Math.min(100, gems / cost * 100).toFixed(1) + '%"></u></i>' +
      '<div class="alp"><span>Gems: <b>' + fmt(gems) + '</b> of ' + fmt(cost) + ' for the first crate</span><span>' + Math.min(100, Math.floor(gems / cost * 100)) + '%</span></div></div>' +
      '<h3 class="gh">Crates</h3>' + gearCratesHTML() + gearCrateResultHTML() + (typeof trinketHeadHTML === 'function' ? trinketHeadHTML() : '<h3 class="gh">Trinkets</h3>') + trinketsHTML();
  }
  const head = '<p class="sub">Gear is bought with gems, which enemies drop during a run. You own ' + ownedCount + ' of ' + Object.keys(GEAR_INDEX).length + ' pieces.' +
    (ownedCount ? '' : ' Nothing yet: collect gems in a run, then open a crate below to find your first piece.') + '</p>' +
    '<div class="gviews"><button class="gview-b' + (gearPage.view === 'doll' ? ' on' : '') + '" data-a="gear-view-doll">Dress her</button><button class="gview-b' + (gearPage.view === 'sets' ? ' on' : '') + '" data-a="gear-view-sets">Sets</button></div>';
  const trinkets = (typeof trinketHeadHTML === 'function' ? trinketHeadHTML() : '<h3 class="gh">Trinkets</h3>') + trinketsHTML();
  if (gearPage.view === 'sets') return head + gearSetsHTML() + gearCratesHTML() + gearCrateResultHTML() + trinkets;
  return head +
    '<div class="gdoll"><div class="gcolL">' + gearSlotsHTML() + '</div>' +
      '<div class="gview"><canvas id="gearPreview" width="440" height="250"></canvas><button class="btn sm ghost gkick" data-a="gear-demo-kick">Kick</button></div>' +
      '<div class="gcolR" id="gearSide">' + gearSideHTML() + '</div></div>' +
    gearPickerHTML() + '<h3 class="gh">Crates</h3>' + gearCratesHTML() + gearCrateResultHTML() + trinkets;
}

/* ---------- compare before equipping ---------- */
function gearFmtVal(key, v){
  const f = GEAR_STAT_LABELS[key] ? GEAR_STAT_LABELS[key].fmt : 'flat', r = function(x, d){ const m = Math.pow(10, d || 0); return Math.round(x * m) / m; };
  if (f === 'pctless') return (v > 0 ? '\u2212' : '') + r(v * 100, 1) + '%';                 /* a cut to damage taken: 0% to \u22126% */
  if (f === 'pct') return r(v * 100, 1) + '%';
  if (f === 'pctmul') return (v >= 1 ? '+' : '') + r((v - 1) * 100, 1) + '%';
  if (f === 'sec') return r(v, 2) + '/s';
  if (f === 'secs') return r(v, 2) + 's';
  if (f === 'deg') return r(v * 180 / Math.PI) + '°';
  return String(r(v, 1));
}
function gearComparePanel(slot, id){
  const p = GEAR_INDEX[id]; if (!p) return gearBuildHTML();
  const lv = gearLevel(id), on = gearEquipped(slot) === id, rows = on ? [] : gearDelta(slot, id);
  let html = '<div class="gcmp ' + p.rarity + '"><h4>' + p.name + (lv > 1 ? ' <span class="glv">+' + (lv - 1) + '</span>' : '') + '</h4>' +
    '<div class="gsub">' + p.setName + ' · ' + p.rarity + ' · ' + SLOT_LABEL[slot] + '</div><p class="gdesc">' + gaDesc(p) + '</p>' +
    (gaFx(id) ? '<div class="gfx"><b>\u2726 ' + gaFx(id).name + '</b> ' + gaFx(id).desc + '</div>' : '');
  const setRow = rows.filter(function(r){ return r.key === 'set'; })[0], stat = rows.filter(function(r){ return r.key !== 'set'; });
  if (on) html += '<p class="gnote">Equipped now.</p>';
  else if (!stat.length) html += '<p class="gnote">No change to her stats.</p>';
  else html += '<div class="grows">' + stat.map(function(r){ return '<div class="grow ' + (r.better ? 'up' : 'down') + '"><span>' + r.label + '</span><b>' + gearFmtVal(r.key, r.from) + ' → ' + gearFmtVal(r.key, r.to) + '</b></div>'; }).join('') + '</div>';
  if (setRow) html += '<div class="gcset' + (setRow.completes ? ' done' : '') + '">' + setRow.label + ' ' + setRow.from + '/3 → ' + setRow.to + '/3' + (setRow.completes ? '<br><b>Completes it: ' + setRow.setDesc + '</b>' : '') + '</div>';
  if (lv > 1) html += '<p class="gnote">Level ' + lv + ': its effects are ' + Math.round((gearLevelScale(lv) - 1) * 100) + '% stronger.</p>';
  if (!on) html += '<button class="btn sm" data-equip="' + id + '">Equip</button>';
  return html + '</div>';
}

/* ---------- the crate reveal ----------
   openCrate() has already spent the gems and granted the piece when this starts; the animation is only for show. Phases: 0 the crate shakes
   (0.6s), 1 a burst of light in the piece's rarity color (0.4s), 2 the piece and what it did. A click skips ahead, then closes. At Visual
   effects "off" it goes straight to phase 2 after 0.2s. Every timer is listed in gearReveal.timers and cleared when the reveal ends, which also
   happens whenever the shop is drawn again (leaving the tab, equipping, starting a run). */
const gearReveal = { active: false, el: null, timers: [], phase: 0, res: null, sounded: false, batch: null };
function gearRevealEnd(){
  gearReveal.timers.forEach(clearTimeout); gearReveal.timers.length = 0;
  if (gearReveal.el && gearReveal.el.parentNode) gearReveal.el.parentNode.removeChild(gearReveal.el);
  gearReveal.el = null; gearReveal.active = false; gearReveal.res = null; gearReveal.phase = 0; gearReveal.sounded = false; gearReveal.batch = null;
}
function gearRevealSound(res){
  try {
    const n = { common: 1, rare: 2, epic: 3, legendary: 4, mythical: 5 }[res.rarity] || 1, base = [523, 659, 784, 1047, 1319];
    for (let i = 0; i < n; i++) SFX.tone('triangle', base[i], base[i], 0.24, 0.1, i * 0.09);
    if (res.rarity === 'legendary' || res.rarity === 'mythical') SFX.tone('sine', 1568, 2093, 0.7, 0.07, 0.36);
    if (res.rarity === 'mythical'){ SFX.tone('sine', 784, 2349, 1.1, 0.06, 0.5); SFX.tone('triangle', 1047, 1568, 0.9, 0.05, 0.62); }
  } catch (e) {}
}
function gearRevealPhase(n){
  if (!gearReveal.active || !gearReveal.el || n < gearReveal.phase) return;                   /* phases only move forward: a late timer must not undo a skip */
  gearReveal.phase = n; gearReveal.el.className = 'crevl' + (gearReveal.batch ? ' multi' : ' r-' + gearReveal.res.rarity) + ' ph' + n;
  if (n >= 1 && !gearReveal.sounded){ gearReveal.sounded = true; gearRevealSound(gearReveal.res); }
}
function gearRevealSkip(){ gearRevealPhase(2); }
function gearRevealStart(res){
  if (Array.isArray(res)) return gearRevealStartMany(res);
  gearRevealEnd();
  const fx = typeof fxLevelNow === 'function' ? fxLevelNow() : 1, p = res.piece;
  const k = res.dupe ? (res.levelUp ? 'Level up' : 'Duplicate') : 'New gear';
  const el = document.createElement('button'); el.id = 'crateReveal'; el.setAttribute('data-a', 'gear-reveal-close');
  el.innerHTML = '<div class="crbox">' + ico(RARITY_ORDER[res.rarity] >= 2 ? '@t-x-gift' : '@t-x-box') + '</div><div class="crburst"></div>' +
    (fx > 0 ? '<div class="crsparks">' + [0, 1, 2, 3, 4, 5, 6, 7].map(function(i){ return '<i style="--a:' + i * 45 + 'deg"></i>'; }).join('') + '</div>' : '') +
    '<div class="crcard"><img class="crimg" src="' + gearIcon(p.id, 128, { level: res.levelUp || gearLevel(p.id) }) + '" alt=""><div class="crk">' + k + (res.pity ? ' · pity' : '') + '</div>' +
    '<div class="crn">' + p.name + '</div><div class="crs">' + p.setName + ' · ' + SLOT_LABEL[p.slot] + ' · ' + res.rarity + '</div><div class="crd">' + gearResultLine(res) + '</div>' + (gaFx(p.id) ? '<div class="crfx">\u2726 ' + gaFx(p.id).name + ': ' + gaFx(p.id).desc + '</div>' : '') +
    '<div class="crhint">Click to continue</div></div>';
  OV.appendChild(el);
  gearReveal.el = el; gearReveal.active = true; gearReveal.res = res; gearRevealPhase(0);
  const T = function(ms, f){ gearReveal.timers.push(setTimeout(function(){ if (gearReveal.active && gearReveal.el === el && document.body.contains(el)) f(); }, ms)); };
  if (fx > 0){ T(600, function(){ gearRevealPhase(1); }); T(1000, function(){ gearRevealPhase(2); }); }
  else T(200, function(){ gearRevealPhase(2); });
}
/* Buy 5 or Buy 10: every opening plays at the same time, five to a row (one row for five, two for ten). The sound is the best piece's. */
function gearRevealStartMany(list){
  gearRevealEnd();
  const fx = typeof fxLevelNow === 'function' ? fxLevelNow() : 1;
  let best = list[0], news = 0, ups = 0, refund = 0;
  list.forEach(function(r){ if (RARITY_ORDER[r.rarity] > RARITY_ORDER[best.rarity]) best = r; if (!r.dupe) news++; else if (r.levelUp) ups++; else refund += r.refund; });
  const el = document.createElement('button'); el.id = 'crateReveal'; el.setAttribute('data-a', 'gear-reveal-close');
  el.innerHTML = '<div class="crgrid">' + list.map(function(r, i){
    const p = r.piece, k = r.dupe ? (r.levelUp ? 'Level up +' + (r.levelUp - 1) : 'Refund ' + r.refund) : 'New';
    return '<div class="crc r-' + r.rarity + '" style="--d:' + (i * 0.05).toFixed(2) + 's"><div class="crbox">' + ico(RARITY_ORDER[r.rarity] >= 2 ? '@t-x-gift' : '@t-x-box') + '</div><div class="crburst"></div>' +
      '<div class="crcard"><img class="crimg" src="' + gearIcon(p.id, 96, { level: r.levelUp || gearLevel(p.id) }) + '" alt=""><div class="crk">' + k + '</div>' +
      '<div class="crn">' + p.name + '</div><div class="crs">' + p.setName + ' · ' + SLOT_LABEL[p.slot] + '</div></div></div>';
  }).join('') + '</div>' +
  '<div class="crsum">' + list.length + ' crates: ' + news + ' new' + (ups ? ', ' + ups + ' levelled up' : '') + (refund ? ', ' + refund + ' gems back' : '') + '. Best: <b class="crbest r-' + best.rarity + '">' + best.piece.name + '</b> (' + best.rarity + ')</div>' +
  '<div class="crhint">Click to continue</div>';
  OV.appendChild(el);
  gearReveal.el = el; gearReveal.active = true; gearReveal.res = best; gearReveal.batch = list; gearRevealPhase(0);
  const T = function(ms, f){ gearReveal.timers.push(setTimeout(function(){ if (gearReveal.active && gearReveal.el === el && document.body.contains(el)) f(); }, ms)); };
  if (fx > 0){ T(600, function(){ gearRevealPhase(1); }); T(1000, function(){ gearRevealPhase(2); }); }
  else T(200, function(){ gearRevealPhase(2); });
}
function gearBuyMany(kind, n){                                                              /* n crates at once (5 or 10): all of it affordable, or none of it */
  const c = CRATES[kind];
  if (!c || gearReveal.active || !(n > 1)) return false;
  if ((Save.data.gems | 0) < c.cost * n || (c.food && (+Save.data.food || 0) + 1e-9 < c.food * n)){ SFX.deny(); return false; }
  const list = [];
  for (let i = 0; i < n; i++){ const r = openCrate(kind); if (!r) break; list.push(r); }
  if (!list.length){ SFX.deny(); return false; }
  crateResult = null;
  showShop('gear'); gearRevealStart(list);
  return true;
}
function buyCrate(kind){                                                                    /* replaces 43-input.js: the reveal takes the place of the old redraw-and-sound */
  const c = CRATES[kind];
  if (!c || gearReveal.active) return;
  if ((Save.data.gems | 0) < c.cost || (c.food && (+Save.data.food || 0) + 1e-9 < c.food)){ SFX.deny(); return; }
  const res = openCrate(kind);
  if (!res){ SFX.deny(); return; }
  crateResult = res;
  showShop('gear'); gearRevealStart(res);
}

/* ---------- actions ---------- */
/* a soft fade at the bottom of the side window while there is more below to scroll to */
function gearSideFlags(){
  const side = document.getElementById('gearSide'), p = side && side.firstElementChild;
  if (side) side.classList.toggle('more', !!p && p.scrollHeight - p.scrollTop - p.clientHeight > 4);
}
document.addEventListener('scroll', function(e){ if (e.target && e.target.parentNode && e.target.parentNode.id === 'gearSide') gearSideFlags(); }, true);
function gearSyncSelection(){                                                               /* hover or tap: update the picture's try-on, the side panel and the tile marks without redrawing the page */
  const side = document.getElementById('gearSide'); if (side){ side.innerHTML = gearSideHTML(); gearSideFlags(); }
  const tiles = document.querySelectorAll('.gp[data-gh]');
  for (let i = 0; i < tiles.length; i++) tiles[i].classList.toggle('sel', tiles[i].dataset.gh === gearPage.selected);
}
function gearAction(a){
  if (a.indexOf('gear-slot-') === 0){ const s = a.slice(10); if (GEAR_SLOTS.indexOf(s) < 0) return true; gearPage.slot = s; gearPage.selected = null; gearPage.hover = null; SFX.click(); showShop('gear'); return true; }
  if (a.indexOf('gear-pick-') === 0){
    const id = a.slice(10), p = GEAR_INDEX[id]; if (!p || !gearOwned(id)) { SFX.deny(); return true; }
    SFX.click(); const same = gearPage.selected === id && gearPage.slot === p.slot;
    if (gearPage.view !== 'doll' || gearPage.slot !== p.slot){ gearPage.view = 'doll'; gearPage.slot = p.slot; gearPage.selected = id; gearPage.hover = null; showShop('gear'); return true; }
    gearPage.selected = same ? null : id; gearPage.hover = null; gearSyncSelection(); return true;
  }
  if (a === 'gear-view-doll' || a === 'gear-view-sets'){ gearPage.view = a.slice(10); gearPage.selected = null; gearPage.hover = null; SFX.click(); showShop('gear'); return true; }
  if (a.indexOf('gear-buy-') === 0){ const m = /^gear-buy-([a-z]+)-(5|10)$/.exec(a); if (m && !gearBuyMany(m[1], +m[2])) SFX.deny(); return true; }
  if (a === 'gear-reveal-close'){ if (gearReveal.phase < 2) gearRevealSkip(); else { gearRevealEnd(); SFX.click(); } return true; }
  if (a === 'gear-demo-kick'){ gearPreview.kickT = 0; SFX.click(); return true; }
  return false;
}
(function(){
  const h = handleAction;
  handleAction = function(a){ if (typeof a === 'string' && a.indexOf('gear-') === 0 && gearAction(a)) return; return h.apply(this, arguments); };
  const s = showShop;
  showShop = function(tab){ gearPreviewStop(); gearRevealEnd(); const r = s.apply(this, arguments); if (shopTab === 'gear' && G.state === 'shop' && gearPage.view === 'doll'){ gearPreviewMount(); gearSideFlags(); } return r; };
})();
/* pointing at a piece tries it on in the picture (desktop); a tap selects it (everywhere) */
function gearHoverClear(){ gearPage.clearT = 0; if (gearPage.hover){ gearPage.hover = null; gearSyncSelection(); } }
OV.addEventListener('mouseover', function(e){
  if (shopTab !== 'gear' || G.state !== 'shop') return;
  const t = e.target.closest ? e.target.closest('[data-gh]') : null, id = t ? t.dataset.gh : null, inSide = !!(e.target.closest && e.target.closest('#gearSide'));
  if (gearPage.clearT){ clearTimeout(gearPage.clearT); gearPage.clearT = 0; }
  if (id){ if (id !== gearPage.hover){ gearPage.hover = id; gearSyncSelection(); } return; }
  if (inSide || !gearPage.hover) return;                                                   /* the pointer is on the panel (to scroll it or press Equip): keep the piece */
  gearPage.clearT = setTimeout(gearHoverClear, 350);                                       /* a moment's grace to travel from the tile to the panel */
});
/* keyboard and pad focus does what pointing does: the focused piece is tried on and compared; moving on to the panel (to press Equip) keeps it */
OV.addEventListener('focusin', function(e){
  if (shopTab !== 'gear' || G.state !== 'shop' || !(Nav.on || (e.target.matches && e.target.matches(':focus-visible')))) return;
  const t = e.target.closest ? e.target.closest('[data-gh]') : null, id = t ? t.dataset.gh : null, inSide = !!(e.target.closest && e.target.closest('#gearSide'));
  if (gearPage.clearT){ clearTimeout(gearPage.clearT); gearPage.clearT = 0; }
  if (id){ if (id !== gearPage.hover){ gearPage.hover = id; gearSyncSelection(); } return; }
  if (!inSide && gearPage.hover) gearHoverClear();
});
