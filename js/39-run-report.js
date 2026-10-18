'use strict';
/* Run report, tooltips, key bindings, kick trails. */
/* ========================= 34c. RUN REPORT, TOOLTIPS, KEY BINDINGS, KICK TRAILS ========================= */
/* ---- who dealt the damage: every damageEnemy call is credited to dmgSrc (a card id, 'kick', 'ants', ...) ---- */
function srcInfo(id, cards){
  if (CARDMAP[id]){
    const def = CARDMAP[id], row = cards && cards.filter(function(c){ return c[0] === id; })[0], lv = row ? row[1] : 1, f = cardForm(def, lv);
    return { name: f.name, icon: f.icon, col: f.color };
  }
  const T = { kick: ['Your kick', '@t-x-hoof', '#E8A060'], ants: ['Ant colony', '@t-bug', '#C0C94A'], allies: ['Dust allies', '@t-paw', '#C98A4A'], squad: ['Dust squad', '@t-paw', '#F2B33D'], burn: ['Burning', '@t-flame', '#FF7A2A'], other: ['Other', '@t-x-help', '#A89E90'] };
  const t = T[id] || T.other; return { name: t[0], icon: t[1], col: t[2] };
}
function enemyDisplayName(e){
  try { return bestiaryName(chapterOf(e.waveRef || G.wave || 1), e.type).title; } catch (err) { return String(e.type || 'Something'); }
}
function noteKiller(sx, sy){
  let name = null;
  if (sx !== undefined){
    const near = enemiesNear(sx, sy, 130); let best = null, bd = 1e9;
    for (let i = 0; i < near.length; i++){ const e = near[i]; if (e.dead || e.ally) continue; const d = Math.hypot(e.x - sx, e.y - sy) - e.r; if (d < bd){ bd = d; best = e; } }
    if (best) name = enemyDisplayName(best);
  }
  P.killedBy = name || 'The wild';
}
function runReport(prevBest, prevBestWave){
  const cards = []; for (let i = 0; i < P.cards.length; i++) cards.push([P.cards[i].def.id, P.cards[i].level]);
  return { dmg: Object.assign({}, G.runDmg || {}), xp: G.runXp | 0, taken: Math.round(G.runTaken || 0), level: P.level | 0, killedBy: P.killedBy || null,
    cards: cards, prevBest: prevBest | 0, prevBestWave: prevBestWave | 0, score: G.score | 0, wave: G.wave | 0 };
}
function runReportHTML(r, died){
  const R = r.report; if (!R) return '';
  const total = Object.keys(R.dmg).reduce(function(a, k){ return a + R.dmg[k]; }, 0);
  let out = '<div class="runreport">';
  out += '<div class="rr-head">Run report</div><div class="rr-stats">' +
    '<span>Level <b>' + R.level + '</b></span><span>XP earned <b>' + fmt(R.xp) + '</b></span><span>Damage dealt <b>' + fmt(total) + '</b></span><span>Damage taken <b>' + fmt(R.taken) + '</b></span></div>';
  if (died && R.killedBy) out += '<div class="rr-line">Taken down by <b>' + R.killedBy + '</b>.</div>';
  if (R.score > R.prevBest && R.prevBest > 0) out += '<div class="rr-line good">New best score! The old record was ' + fmt(R.prevBest) + '.</div>';
  else if (R.prevBest > 0) out += '<div class="rr-line">Your best is ' + fmt(R.prevBest) + ' points (wave ' + R.prevBestWave + '). This run was ' + Math.round(R.score / R.prevBest * 100) + '% of it.</div>';
  else out += '<div class="rr-line good">That is your first scored run.</div>';
  const rows = Object.keys(R.dmg).map(function(k){ return [k, R.dmg[k]]; }).sort(function(a, b){ return b[1] - a[1]; }).slice(0, 8);
  if (rows.length && total > 0){
    out += '<div class="rr-sub">Damage by source</div>';
    for (let i = 0; i < rows.length; i++){
      const si = srcInfo(rows[i][0], R.cards), pc = rows[i][1] / total * 100;
      out += '<div class="rr-row"><span class="rr-ic">' + ico(si.icon) + '</span><span class="rr-nm">' + si.name + '</span>' +
        '<span class="rr-bar"><i style="width:' + Math.max(2, pc).toFixed(1) + '%;background:' + si.col + '"></i></span><span class="rr-pc">' + (pc >= 10 ? Math.round(pc) : pc.toFixed(1)) + '%</span></div>';
    }
  }
  return out + '</div>';
}

/* ---- card tooltips and the stats panel ---- */
function cardStatLines(def, lv){
  const s = def.stats(lv), out = [];
  for (let i = 0; i < DELTA_ORDER.length && out.length < 6; i++){
    const k = DELTA_ORDER[i];
    if (typeof s[k] !== 'number' || !STAT_LABEL[k] || (def.hideStats && def.hideStats.indexOf(k) >= 0)) continue;
    out.push([STAT_LABEL[k], fmtStat(def, k, s[k])]);
  }
  return out;
}
function cardTipHTML(inst){
  const f = inst.form, def = inst.def, nxt = inst.level >= 10 ? null : (inst.level < 5 ? 5 : 10);
  let h = '<div class="tip-n" style="color:' + f.color + '">' + ico(f.icon, f.color) + ' ' + f.name + '</div>' +
    '<div class="tip-s">' + (def.combo ? 'Combo card' : def.rarity.charAt(0).toUpperCase() + def.rarity.slice(1) + ' ' + def.type) + ' · level ' + inst.level + (inst.level >= 10 ? ' (final form)' : '') + '</div>' +
    '<div class="tip-d">' + f.desc + '</div>';
  const lines = cardStatLines(def, inst.level);
  for (let i = 0; i < lines.length; i++) h += '<div class="tip-l"><span>' + lines[i][0] + '</span><b>' + lines[i][1] + '</b></div>';
  const dealt = G.runDmg && G.runDmg[def.id] | 0;
  if (dealt) h += '<div class="tip-l"><span>Damage dealt this run</span><b>' + fmt(dealt) + '</b></div>';
  if (nxt && !def.combo) h += '<div class="tip-s" style="margin-top:4px">Transforms at level ' + nxt + '.</div>';
  if (def.combo) h += '<div class="tip-s" style="margin-top:4px">' + (inst.level >= 3 ? 'Special upgrade active: ' + def.cfg.capName + '.' : 'Level 3 special upgrade: ' + def.cfg.capName + '.') + '</div>';
  return h;
}
let tipEl = null, tipHold = null;
function showTip(html, x, y){
  if (!tipEl){ tipEl = document.createElement('div'); tipEl.id = 'tip'; document.body.appendChild(tipEl); }
  tipEl.innerHTML = html; tipEl.style.display = 'block';
  const w = tipEl.offsetWidth, h = tipEl.offsetHeight;
  tipEl.style.left = clamp(x - w / 2, 6, window.innerWidth - w - 6) + 'px';
  tipEl.style.top = clamp(y + 22, 6, window.innerHeight - h - 6) + 'px';
}
function hideTip(){ if (tipEl) tipEl.style.display = 'none'; if (tipHold){ clearTimeout(tipHold); tipHold = null; } }
function bindTips(){
  const box = document.getElementById('loadout'); if (!box) return;
  const chipAt = function(e){ const c = e.target.closest && e.target.closest('.chip'); return c && c.dataset.ci !== undefined ? P.cards[+c.dataset.ci] : null; };
  box.addEventListener('mouseover', function(e){ const inst = chipAt(e); if (inst){ const r = e.target.closest('.chip').getBoundingClientRect(); showTip(cardTipHTML(inst), r.left + r.width / 2, r.bottom); } });
  box.addEventListener('mouseout', hideTip);
  box.addEventListener('touchstart', function(e){
    const inst = chipAt(e); if (!inst) return;
    const r = e.target.closest('.chip').getBoundingClientRect();
    hideTip(); tipHold = setTimeout(function(){ showTip(cardTipHTML(inst), r.left + r.width / 2, r.bottom); tipHold = setTimeout(hideTip, 2600); }, 320);
  }, { passive: true });
  box.addEventListener('touchend', function(){ if (tipHold && !(tipEl && tipEl.style.display === 'block')){ clearTimeout(tipHold); tipHold = null; } });
}
function statsRowsHTML(){
  const s = P.stats, row = function(a, b){ return '<div class="st-row"><span>' + a + '</span><b>' + b + '</b></div>'; };
  const pc = function(v){ return Math.round(v * 100) + '%'; }, x = function(v){ return '×' + (Math.round(v * 100) / 100); };
  const mins = Math.floor(G.runTime / 60), secs = Math.floor(G.runTime % 60);
  return '<div class="st-grid">' +
    row('Damage', x((s.kickDmgMul || 1) * (s.allDmgMul || 1))) + row('Attack speed', x(1 / Math.max(0.05, haste()))) + row('Move speed', x(s.speedMul || 1)) +
    row('Max health', Math.round(P.maxHp)) + row('Regeneration', (Math.round((s.regen || 0) * 10) / 10) + ' / s') + row('Damage reduction', pc(s.dr || 0)) +
    row('Critical chance', pc(s.crit || 0)) + row('Critical damage', x(s.critMul || 1)) + row('Kick range', x(s.kickRangeMul || 1)) +
    row('Pickup range', x(s.pickupMul || 1)) + row('Experience', x(s.xpMul || 1)) + row('Gold', x(s.goldMul || 1)) + row('Drop rate', x(s.dropMul || 1)) +
    row('Level', P.level + ' (' + Math.round(P.xp) + ' / ' + P.xpNext + ' XP)') + row('Rerolls left', G.rerolls | 0) + row('Wave / kills', G.wave + ' / ' + fmt(G.kills)) +
    row('Score', fmt(G.score)) + row('Time', mins + 'm ' + (secs < 10 ? '0' : '') + secs + 's') + '</div>';
}
function showStats(){
  G.state = 'paused'; G.subScreen = 'stats';
  let cards = '';
  for (let i = 0; i < P.cards.length; i++){
    const c = P.cards[i]; if (c.hidden) continue; const dealt = (G.runDmg && G.runDmg[c.def.id]) | 0, lines = cardStatLines(c.def, c.level).slice(0, 4);
    cards += '<div class="shoprow"><div class="ic">' + ico(c.form.icon, c.form.color) + '</div><div class="txt"><div class="nm">' + c.form.name + ' <span style="opacity:.7;font-size:12px">level ' + c.level + '</span></div>' +
      '<div class="ds">' + c.form.desc + '</div><div class="ds">' + lines.map(function(l){ return l[0] + ' ' + l[1]; }).join(' · ') + (dealt ? ' · dealt ' + fmt(dealt) : '') + '</div></div></div>';
  }
  setOverlay(
    '<div class="panel slab wide" style="max-width:640px"><h2 class="head">Stats</h2><p class="sub">Your giraffe right now, and what each card is doing.</p>' +
    statsRowsHTML() + '<div class="shoplist" style="margin-top:12px">' + (cards || '<p class="sub">No cards yet.</p>') + '</div>' +
    '<div class="row" style="margin-top:16px"><button class="btn sm" data-a="stats-back">Back</button></div></div>');
}

/* ---- rebindable keys ---- */
const KEY_ACTIONS = [['up', 'Move up'], ['down', 'Move down'], ['left', 'Move left'], ['right', 'Move right'], ['kick', 'Kick'], ['pause', 'Pause'], ['slow', 'Slow time'], ['rover', 'Rover'],
  ['stats', 'Stats panel'], ['mute', 'Mute'], ['reroll', 'Reroll cards'], ['squad1', 'Call alien 1'], ['squad2', 'Call alien 2'], ['squad3', 'Call alien 3'], ['squad4', 'Call alien 4'], ['squad5', 'Call alien 5'], ['nextwave', 'Call the next wave'], ['bread', 'Eat bread']];
const DEFAULT_KEYS = { up: 'KeyW', down: 'KeyS', left: 'KeyA', right: 'KeyD', kick: 'Space', pause: 'KeyP', slow: 'KeyT', rover: 'KeyE', stats: 'KeyC', mute: 'KeyM', reroll: 'KeyR',
  squad1: 'Digit1', squad2: 'Digit2', squad3: 'Digit3', squad4: 'Digit4', squad5: 'Digit5', nextwave: 'KeyN', bread: 'KeyB' };
const KEY_BLOCKED = /^(Escape|Tab|Enter|NumpadEnter|Arrow\w+|F\d+|Backspace|ContextMenu|Meta\w*|OS\w*|Alt\w*|Control\w*|Shift\w*|CapsLock)$/;
function keyOf(a){ const k = Settings.keys && Settings.keys[a]; return typeof k === 'string' && k ? k : DEFAULT_KEYS[a]; }
function keyName(code){
  if (!code) return '?';
  if (code === 'Space') return 'Space';
  const m = /^(?:Key|Digit)(.)$/.exec(code); if (m) return m[1];
  const n = /^Numpad(.+)$/.exec(code); if (n) return 'Num ' + n[1];
  const names = { Semicolon: ';', Comma: ',', Period: '.', Slash: '/', Backslash: '\\', BracketLeft: '[', BracketRight: ']', Quote: '\'', Minus: '-', Equal: '=', Backquote: '`' };
  return names[code] || code;
}
function sanitizeKeys(k){
  const out = {};
  if (k && typeof k === 'object' && !Array.isArray(k)) for (let i = 0; i < KEY_ACTIONS.length; i++){ const a = KEY_ACTIONS[i][0], v = k[a]; if (typeof v === 'string' && v.length < 24 && !KEY_BLOCKED.test(v)) out[a] = v; }
  return out;
}
function keysSectionHTML(){
  let rows = '';
  for (let i = 0; i < KEY_ACTIONS.length; i++){
    const a = KEY_ACTIONS[i][0], listening = G.rebinding === a, custom = Settings.keys && Settings.keys[a];
    rows += '<div class="kv"><div>' + KEY_ACTIONS[i][1] + (a === 'up' ? '<small>The arrow keys always work as well.</small>' : '') + '</div>' +
      '<button class="toggle' + (listening ? ' on' : '') + '" data-a="bind-' + a + '">' + (listening ? 'Press a key…' : keyName(keyOf(a)) + (custom ? ' *' : '')) + '</button></div>';
  }
  return rows + '<div class="kv"><div>Reset keys<small>Back to the defaults. * marks a changed key. Esc cancels while choosing.</small></div><button class="toggle" data-a="bind-reset">Reset</button></div>';
}
/* returns true when the key press was used up by the rebinding prompt */
function captureKey(e){
  if (!G.rebinding) return false;
  e.preventDefault(); e.stopPropagation();
  if (e.code === 'Escape'){ G.rebinding = null; showSettings(); return true; }
  if (KEY_BLOCKED.test(e.code)) return true;
  const a = G.rebinding; G.rebinding = null;
  if (!Settings.keys) Settings.keys = {};
  for (let i = 0; i < KEY_ACTIONS.length; i++){ const o = KEY_ACTIONS[i][0]; if (o !== a && keyOf(o) === e.code) Settings.keys[o] = keyOf(a); }      /* the two actions swap keys */
  Settings.keys[a] = e.code; Settings.save(); SFX.click(); showSettings();
  return true;
}

/* ---- kick trails: what the swing throws up depends on where you are ---- */
const KICK_TRAIL = {
  savanna: { cols: ['#D8C08A', '#B89A62'], sp: [30, 120], lift: -22, size: [3, 6.5], life: [0.45, 0.9], glow: false, drag: 3 },
  snow:    { cols: ['#FFFFFF', '#CFEBFF'], sp: [40, 150], lift: -30, size: [2, 4.5], life: [0.5, 1.0], glow: true, drag: 2.4 },
  swamp:   { cols: ['#4A5A2A', '#6B7A3A'], sp: [60, 190], lift: 20, size: [3, 6], life: [0.35, 0.7], glow: false, drag: 4 },
  ocean:   { cols: ['#8FD8FF', '#DFF6FF'], sp: [60, 190], lift: -50, size: [2, 4.5], life: [0.4, 0.8], glow: true, drag: 2.2 },
  jungle:  { cols: ['#5FAE3A', '#8FD05A'], sp: [50, 170], lift: -24, size: [2.5, 5], life: [0.5, 0.95], glow: false, drag: 2.6 },
  city:    { cols: ['#FFC060', '#FFFFFF'], sp: [120, 340], lift: 0, size: [1.5, 3], life: [0.18, 0.4], glow: true, drag: 2.2 },
  space:   { cols: ['#FFE090', '#FFFFFF'], sp: [120, 340], lift: 0, size: [1.5, 3], life: [0.18, 0.4], glow: true, drag: 2.2 },
  moon:    { cols: ['#B8BCC8', '#E6E8F0'], sp: [30, 110], lift: -14, size: [2.5, 5], life: [0.9, 1.6], glow: false, drag: 1.2 },
  venus:   { cols: ['#FF8A2A', '#FFD070'], sp: [50, 170], lift: -55, size: [1.8, 4], life: [0.45, 0.95], glow: true, drag: 2 },
  area51:  { cols: ['#7FE8FF', '#FFFFFF'], sp: [100, 300], lift: 0, size: [1.5, 3], life: [0.2, 0.45], glow: true, drag: 2.2 },
  mars:    { cols: ['#C8683A', '#E08A5A'], sp: [40, 150], lift: -18, size: [3, 6.5], life: [0.5, 1.0], glow: false, drag: 2.8 }
};
function kickTrail(a, range, arc){
  const fx = fxLevelNow(); if (fx <= 0) return;
  const T = KICK_TRAIL[G.biome] || KICK_TRAIL.savanna, n = fx >= 2 ? 9 : 4, span = Math.min(arc, 2.6);
  for (let i = 0; i < n; i++){
    const ang = a + (Math.random() - 0.5) * span, rr = range * (0.55 + Math.random() * 0.45), sp = rand(T.sp[0], T.sp[1]);
    addParticle(P.x + Math.cos(ang) * rr, P.y + Math.sin(ang) * rr, Math.cos(ang) * sp * 0.5, Math.sin(ang) * sp * 0.5 + T.lift,
      rand(T.size[0], T.size[1]), rand(T.life[0], T.life[1]), T.cols[i % 2], { glow: T.glow, drag: T.drag });
  }
}


