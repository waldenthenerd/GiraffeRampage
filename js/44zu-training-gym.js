'use strict';
/* =============================================================================================================================
   44zu-training-gym.js  --  LONGNECK FITNESS: the training gym on Market Street (art is in 44zv-gym-art.js).

   THE BUILDING. Market Street is longer (it ends in the gym, the biggest building in town) and the gym front leads inside (in_gym, a long room
   with a front desk, the Gains Board and ten machines in five zones).
   PASSES. A day pass is bought at the desk and lasts until midnight (townDayKey, local time); tomorrow it must be bought again. Five tiers:
   Basic 20k, Plus 80k, Pro 240k, Longneck 600k, Legend 2M gold. Each tier is locked behind a chapter (1, 3, 6, 9, 12), includes every lower tier's
   machines, and can be upgraded from a lower pass for the difference. Passes are what is expensive, so the day is worth filling.
   WORKOUTS. Each machine trains one skill. A set is eight reps; every rep is a short minigame, and no type is used by more than two machines:
   sweep (Free Weights: stop the marker in the green), pulse (Rowing: press as the ring closes), hold (Yoga: hold, let go in the zone), dial (Bench Press,
   Pull-up Tower: press once in each green wedge as the needle goes round), rhythm (Treadmill, Spin Bike: tap four beats as they reach the ring), combo (Punch Bag, Sparring
   Ring: hit the J / K / L punches in order, or tap the buttons) and balance (Sauna: hold to rise, let go to sink, stay in the moving band). Perfect = 2 xp, good = 1 (a streak of 3 perfects
   adds 1). The machine and the giraffe animate on every rep. Levels go to 15 and each costs 12 + 26 ln(level + 1) xp, so they get harder, but
   more and more gently. Every level gives a little; levels 5, 10 and 15 each give a bigger bonus on top. Skills (applied through applyCityStats):
   Strength (attack), Stride (speed), Heavy Press (crit damage), Sharp Jab (crit chance), Stamina (health), Flexibility (kick reach),
   Grit (damage taken), Haste (attack speed), Mastery (all damage), Recovery (regeneration).
   RANK. The sum of all levels is the gym rank: Newcomer, Regular (Sweatband), Athlete (Trainers), Bruiser (Boxing Boots), Champion (Champion's
   Laurel), Longneck Legend (the Gold Medal coat colour).
   Saved in Save.data.town.gym = { pass, day, sk: { id: { l, xp } }, reps, spent, rk: { n: 1 } } (all optional, older saves load fine).
   Hooks: updateTown, townDrawPlayer, townDynamic, townDrawHud, townUse, townNearest, handleTownAction, townEnter, applyCityStats.
   ============================================================================================================================= */
const GYM_PASSES = [
  { id: 'basic', name: 'Basic Pass', short: 'BASIC', price: 20000, ch: 1, col: '#4DB8FF' },
  { id: 'plus', name: 'Plus Pass', short: 'PLUS', price: 80000, ch: 3, col: '#6BE08A' },
  { id: 'pro', name: 'Pro Pass', short: 'PRO', price: 240000, ch: 6, col: '#FFC83D' },
  { id: 'longneck', name: 'Longneck Pass', short: 'LONGNECK', price: 600000, ch: 9, col: '#FF8A3D' },
  { id: 'legend', name: 'Legend Pass', short: 'LEGEND', price: 2000000, ch: 12, col: '#E85DFF' }
];
const GYM_MAX = 15;
/* per: the bonus for every level; ms: the extra bonus at levels 5, 10 and 15; fmt: how it is shown */
const GYM_SKILLS = [
  { id: 'free', name: 'Strength', mach: 'Free Weights', tier: 1, pat: 'sweep', diff: 0, x: 1230, w: 210, h: 190, dx: 0, lbl: 'Attack power', key: 'kickDmgMul', per: 0.012, ms: [0.03, 0.06, 0.10], fmt: 'pct' },
  { id: 'tread', name: 'Stride', mach: 'Treadmill', tier: 1, pat: 'rhythm', diff: 0, x: 1500, w: 230, h: 200, dx: -62, lbl: 'Move speed', key: 'speedMul', per: 0.006, ms: [0.02, 0.04, 0.06], fmt: 'pct' },
  { id: 'bench', name: 'Heavy Press', mach: 'Bench Press', tier: 2, pat: 'dial', diff: 1, x: 1900, w: 240, h: 170, dx: 0, lbl: 'Crit damage', key: 'critMul', per: 0.02, ms: [0.05, 0.1, 0.15], fmt: 'pts' },
  { id: 'bag', name: 'Sharp Jab', mach: 'Punch Bag', tier: 2, pat: 'combo', diff: 1, x: 2200, w: 170, h: 270, dx: -120, lbl: 'Crit chance', key: 'crit', per: 0.002, ms: [0.01, 0.02, 0.03], fmt: 'pct' },
  { id: 'row', name: 'Stamina', mach: 'Rowing Machine', tier: 3, pat: 'pulse', diff: 2, x: 2620, w: 280, h: 160, dx: 0, lbl: 'Max health', key: 'maxHpAdd', per: 1.5, ms: [5, 10, 20], fmt: 'add' },
  { id: 'yoga', name: 'Flexibility', mach: 'Yoga Mats', tier: 3, pat: 'hold', diff: 2, x: 2930, w: 260, h: 110, dx: -64, lbl: 'Kick reach', key: 'kickRangeMul', per: 0.006, ms: [0.02, 0.04, 0.06], fmt: 'pct' },
  { id: 'pull', name: 'Grit', mach: 'Pull-up Tower', tier: 4, pat: 'dial', diff: 3, x: 3300, w: 220, h: 370, dx: 0, lbl: 'Damage taken', key: 'dr', per: 0.002, ms: [0.01, 0.015, 0.025], fmt: 'pctdown' },
  { id: 'bike', name: 'Haste', mach: 'Spin Bike', tier: 4, pat: 'rhythm', diff: 3, x: 3560, w: 190, h: 190, dx: -50, lbl: 'Attack speed', key: 'hasteMul', per: 0.005, ms: [0.02, 0.03, 0.05], fmt: 'pct' },
  { id: 'ring', name: 'Mastery', mach: 'Sparring Ring', tier: 5, pat: 'combo', diff: 4, x: 4000, w: 360, h: 200, dx: -100, lbl: 'All damage', key: 'allDmgMul', per: 0.008, ms: [0.03, 0.05, 0.08], fmt: 'pct' },
  { id: 'sauna', name: 'Recovery', mach: 'Sauna', tier: 5, pat: 'balance', diff: 4, x: 4400, w: 270, h: 300, dx: -20, lbl: 'Health regen', key: 'regen', per: 0.04, ms: [0.15, 0.3, 0.5], fmt: 'regen' }
];
const GYM_BY_ID = {}; GYM_SKILLS.forEach(function(s){ GYM_BY_ID[s.id] = s; });
const GYM_RANKS = [
  { n: 'Newcomer', at: 0 }, { n: 'Regular', at: 8, acc: 'sweatband' }, { n: 'Athlete', at: 24, acc: 'trainers' },
  { n: 'Bruiser', at: 48, acc: 'boxboots' }, { n: 'Champion', at: 80, acc: 'laurel' }, { n: 'Longneck Legend', at: 120, swatch: 'gym_gold' }
];
const GYM_W = 4650;
const GYM_SETS = 8;

/* ---- the numbers ---- */
function gymData(){ const t = townData(); if (!t.gym || typeof t.gym !== 'object' || Array.isArray(t.gym)) t.gym = { pass: 0, day: '', sk: {}, reps: 0, spent: 0, rk: {} }; const g = t.gym; if (!g.sk || typeof g.sk !== 'object') g.sk = {}; if (!g.rk || typeof g.rk !== 'object') g.rk = {}; return g; }       /* a gym that is a number or a list (a damaged save) starts again instead of throwing */
function gymTier(){ const d = gymData(); return d.day === townDayKey() ? (d.pass | 0) : 0; }
function gymSkill(id){ const d = gymData(); if (!d.sk[id]) d.sk[id] = { l: 0, xp: 0 }; return d.sk[id]; }
function gymNeed(l){ return 12 + Math.round(26 * Math.log(l + 1)); }                       /* xp to go from level l to l + 1 */
function gymBonus(S, l){ let v = S.per * l; for (let i = 0; i < 3; i++) if (l >= 5 * (i + 1)) v += S.ms[i]; return v; }
function gymBonusText(S, l){
  const v = gymBonus(S, l);
  switch (S.fmt){
    case 'pct': return '+' + (v * 100).toFixed(1).replace(/\.0$/, '') + '% ' + S.lbl.toLowerCase();
    case 'pts': return '+' + (v * 100).toFixed(0) + ' crit damage points';
    case 'add': return '+' + (Math.round(v * 10) / 10) + ' max health';
    case 'pctdown': return '-' + (v * 100).toFixed(1).replace(/\.0$/, '') + '% damage taken';
    case 'regen': return '+' + (Math.round(v * 100) / 100) + ' health a second';
  }
  return '';
}
function gymTotal(){ let n = 0; GYM_SKILLS.forEach(function(S){ n += gymSkill(S.id).l; }); return n; }
function gymRankIndex(){ const n = gymTotal(); let r = 0; GYM_RANKS.forEach(function(k, i){ if (n >= k.at) r = i; }); return r; }
function gymApply(s){
  GYM_SKILLS.forEach(function(S){ const l = gymSkill(S.id).l; if (!l) return; const v = gymBonus(S, l);
    if (S.key === 'dr') s.dr += v; else s[S.key] += v; });
}
(function(){
  const a = applyCityStats;
  applyCityStats = function(s){ a(s); try { gymApply(s); } catch (e) {} };
})();

function gymAddXp(id, xp){
  const S = GYM_BY_ID[id], k = gymSkill(id), out = { up: 0, milestone: 0 };
  if (k.l >= GYM_MAX) return out;
  k.xp += xp;
  while (k.l < GYM_MAX && k.xp >= gymNeed(k.l)){
    k.xp -= gymNeed(k.l); k.l++; out.up++;
    if (k.l % 5 === 0){ out.milestone = k.l; townToast(S.name + ' level ' + k.l + ': a big bonus!  ' + gymBonusText(S, k.l), '#FFE9A0'); SFX.transform(); townBurst(Town.x, TG - 120, GYM_PASSES[S.tier - 1].col, 22); }
    else { townToast(S.name + ' level ' + k.l + '  ' + gymBonusText(S, k.l), '#BFFF9A'); SFX.level(); }
  }
  if (k.l >= GYM_MAX) k.xp = 0;
  const d = gymData(); d.reps = (d.reps | 0) + 1; Save.write();
  if (out.up){ try { recalcStats(); } catch (e) {} gymCheckRank(); }
  return out;
}
function gymCheckRank(){
  const d = gymData(), n = gymTotal();
  GYM_RANKS.forEach(function(r, i){
    if (!i || n < r.at || d.rk[i]) return; d.rk[i] = 1;
    let txt = 'Gym rank: ' + r.n + '!';
    if (r.acc) txt += '  ' + townPay({ acc: r.acc });
    if (r.swatch){ townData().found[r.swatch] = 1; txt += '  New coat colour: Gold Medal'; Save.write(); }
    townToast(txt, '#FFE9A0'); SFX.transform();
  });
}

/* ---- the passes ---- */
function gymPrice(i){ const cur = gymTier(); return GYM_PASSES[i].price - (cur ? GYM_PASSES[cur - 1].price : 0); }
function gymBuy(i){
  const p = GYM_PASSES[i], cur = gymTier();
  if (!townDoneCh(p.ch)){ SFX.deny(); townToast('The ' + p.name + ' opens after Chapter ' + p.ch + '.', '#FFB89A'); return false; }
  if (cur >= i + 1) return false;
  const cost = gymPrice(i);
  if ((Save.data.gold | 0) < cost){ SFX.deny(); townToast('Not enough gold for the ' + p.name + '.', '#FFB89A'); return false; }
  Save.data.gold -= cost; const d = gymData(); d.pass = i + 1; d.day = townDayKey(); d.spent = (d.spent | 0) + cost; Save.write(); SFX.buy();
  townToast(p.name + ' bought. It lasts until midnight.', '#BFFF9A'); return true;
}

/* ---- the street and the room ---- */
(function(){
  const M = TOWN_DIST.market;
  M.w = 4200;
  M.b.push({ id: 'gym', kind: 'gym_front', x: 3700, w: 720, h: 360, label: 'Longneck Fitness', act: 'house', to: 'in_gym' });
  M.p.push({ k: 'lamp', x: 3260 }, { k: 'bench', x: 3330 }, { k: 'bush', x: 3290 }, { k: 'lamp', x: 4120 }, { k: 'barrel', x: 4060 });
  M.L.push({ x: 3260, y: 360, r: 110 }, { x: 3700, y: 200, r: 260 }, { x: 4120, y: 360, r: 110 });
  M.dig.push(3400);
  TOWN_ROOM.gym = { wall: '#E6E8EE', wains: '#2B3040', stripe: null, floor: '#4A4F5C', beam: '#1E2230' };
  const door = [{ id: 'door', kind: 'door', x: 110, w: 100, h: 130, label: 'Out', act: 'out' },
    { id: 'desk', kind: 'gm_desk', x: 500, w: 330, h: 124, label: 'The front desk', act: 'gym-desk' },
    { id: 'gains', kind: 'gm_board', x: 860, w: 220, h: 250, label: 'The Gains Board', act: 'gym-board' }];
  GYM_SKILLS.forEach(function(S){ door.push({ id: 'm_' + S.id, kind: 'gm_' + S.id, x: S.x, w: S.w, h: S.h, label: S.mach, act: 'gym-train', m: S.id }); });
  const L = []; for (let x = 300; x < GYM_W; x += 360) L.push({ x: x, y: 70, r: 190 });
  townRoomDef('in_gym', 'Longneck Fitness', 'gym', GYM_W, 190, { b: door, p: [], L: L, npcs: [] });
  TOWN_IN_IDS.push('in_gym'); TOWN_ROOM_PARENT.in_gym = 'market';
})();

/* ---- the workout: state and rules ---- */
function gymMach(b){ return GYM_BY_ID[b.m]; }
function gymBldg(id){ return TOWN_DIST.in_gym.b.find(function(x){ return x.m === id; }); }
function gymTrain(b){
  const S = gymMach(b), tier = gymTier();
  if (!tier){ SFX.deny(); townSay({ name: 'The ' + S.mach, text: 'You need a day pass to use the machines. The front desk by the door sells them.' }, []); return; }
  if (tier < S.tier){ SFX.deny(); townSay({ name: 'The ' + S.mach, text: 'This one is in the ' + GYM_PASSES[S.tier - 1].short + ' zone. Your ' + GYM_PASSES[tier - 1].name + ' does not cover it. You can upgrade at the front desk for the difference.' }, []); return; }
  const k = gymSkill(S.id);
  if (k.l >= GYM_MAX){ townSay({ name: 'The ' + S.mach, text: S.name + ' is at the top: level ' + GYM_MAX + '. There is nothing left to gain here. (You can still use it for fun.)' }, [{ label: 'Train anyway', fn: function(){ townCloseDialog(); gymStart(b); } }, { label: 'Leave it', fn: function(){ townCloseDialog(); } }]); return; }
  gymStart(b);
}
function gymStart(b){
  const S = gymMach(b);
  Town.gym = { m: S.id, b: b, phase: 'ready', t: 0, rep: 0, sets: (Town.gym && Town.gym.m === S.id ? Town.gym.sets : 0), xp: 0, streak: 0, best: 0, perfect: 0, good: 0, miss: 0, anim: { t: 9, k: 0 }, fb: null, banner: null, held: true, leaveR: null, setXp: 0 };
  Town.x = b.x + S.dx; Town.face = 1; Town.vx = 0; Town.reach = 0; Town.autoX = undefined; Town.near = null;
  SFX.click();
}
function gymQuit(msg){
  const g = Town.gym; if (!g) return;
  Town.gym = null;
  if (msg) townToast(msg, '#FFB89A');
}
function gymLevelNow(g){ return gymSkill(g.m).l; }
/* the timed, moving games (the treadmill and bike beats, the bench and pull-up dials, the punch strings, the sauna balance) start the next rep at once: only the first one of a visit says "Get set..." */
const GYM_CONT = { rhythm: 1, dial: 1, balance: 1, combo: 1 };
function gymRepInit(g){
  const S = GYM_BY_ID[g.m], lv = gymLevelNow(g), df = S.diff;
  g.phase = 'rep'; g.t = 0; g.fb = null;
  if (S.pat === 'sweep'){ g.mk = Math.random() < 0.5 ? 0 : 1; g.dir = g.mk ? -1 : 1; g.c = 0.22 + Math.random() * 0.56; g.hw = clamp(0.19 - 0.006 * lv - 0.012 * df, 0.05, 0.19); g.sp = 0.75 + 0.03 * lv + 0.1 * df; }
  else if (S.pat === 'pulse'){ g.r = 1; g.T = clamp(1.35 - 0.025 * lv - 0.06 * df, 0.6, 1.35); }
  else if (S.pat === 'hold'){ g.fill = 0; g.on = false; g.F = clamp(1.8 - 0.03 * lv - 0.08 * df, 0.9, 1.8); g.c = 0.6 + Math.random() * 0.3; g.hw = clamp(0.12 - 0.003 * lv - 0.008 * df, 0.045, 0.12); }
  else if (S.pat === 'dial'){                                                          /* a needle goes round a dial: press once in each of the two green wedges */
    const c1 = Math.random(), c2 = (c1 + 0.3 + Math.random() * 0.4) % 1;
    g.sp = 0.5 + 0.02 * lv + 0.06 * df; g.hw = clamp(0.075 - 0.002 * lv - 0.005 * df, 0.03, 0.075); g.wedges = [{ c: c1, res: -1 }, { c: c2, res: -1 }]; g.ang = Math.random(); g.a0 = g.ang; g.T = 2.6 / g.sp; g.pts = 0;
  }
  else if (S.pat === 'rhythm'){ const b = clamp(0.62 - 0.01 * lv - 0.02 * df, 0.36, 0.62); g.beat = b; g.notes = [0, 1, 2, 3].map(function(i){ return { at: 0.9 + i * b, res: -1 }; }); g.span = 0.9 + 3 * b + 0.45; g.pts = 0; g.flash = []; }
  else if (S.pat === 'combo'){ const n = 3 + (lv >= 8 ? 1 : 0) + (df >= 4 && lv >= 4 ? 1 : 0); g.seq = []; for (let i = 0; i < n; i++) g.seq.push(Math.floor(Math.random() * 3)); g.step = 0; g.T = Math.max(1.9, 1.5 + n * 0.55 - 0.035 * lv - 0.06 * df); }
  else { g.bm = 0.5; g.vel = 0; g.in = 0; g.W = 4.6; g.hw = clamp(0.17 - 0.004 * lv - 0.01 * df, 0.07, 0.17); g.ph = Math.random() * 6; g.spd = 0.8 + 0.03 * lv + 0.08 * df; }
  g.live = 0; g.pulse = 0;
}
function gymScore(g, res){                                                                      /* res: 2 perfect, 1 good, 0 miss */
  const S = GYM_BY_ID[g.m]; let xp = res;
  if (res === 2){ g.perfect++; g.streak++; if (g.streak >= 3) xp++; } else if (res === 1){ g.good++; g.streak = 0; } else { g.miss++; g.streak = 0; }
  g.best = Math.max(g.best, g.streak);
  g.fb = { txt: res === 2 ? (g.streak >= 3 ? 'PERFECT x' + g.streak + '!' : 'PERFECT!') : res === 1 ? 'Good' : 'Miss', col: res === 2 ? '#FFE27A' : res === 1 ? '#BFFF9A' : '#FF8A7A', t: 0 };
  g.anim = { t: 0, k: res === 2 ? 1 : res === 1 ? 0.7 : 0.22 };
  g.setXp += xp;
  if (res) { try { SFX.pick(); } catch (e) {} townBurst(Town.x + 14, TG - 150, res === 2 ? '#FFE27A' : '#BFFF9A', res === 2 ? 10 : 5); } else { try { SFX.deny(); } catch (e) {} }
  if (xp){ const o = gymAddXp(g.m, xp); if (o.up && gymSkill(g.m).l >= GYM_MAX) g.banner = { txt: S.name + ' is maxed out!', t: 0 }; else if (o.milestone) g.banner = { txt: S.name + ' level ' + o.milestone + '  -  big bonus!', t: 0 }; else if (o.up) g.banner = { txt: S.name + ' level ' + gymSkill(g.m).l, t: 0 }; }
  g.phase = 'result'; g.t = 0;
}
function gymStep(dt){
  const g = Town.gym, S = GYM_BY_ID[g.m], k = Input.keys;
  const held = !!(k.KeyE || k.Space || k.Enter || k.NumpadEnter || Input.mdown || Input.padBtn);
  const pressed = held && !g.held, released = !held && g.held; g.held = held;
  g.t += dt; g.anim.t += dt;
  if (g.fb) g.fb.t += dt; if (g.banner){ g.banner.t += dt; if (g.banner.t > 2.2) g.banner = null; }
  if (gymTier() < S.tier){ gymQuit('Your pass has run out.'); return; }
  if (townAny(['ArrowLeft', 'ArrowRight', 'KeyA', 'KeyD'])){ gymQuit(); return; }
  if (pressed && g.leaveR && townInRect(g.leaveR, Input.sx, Input.sy)){ gymQuit(); return; }
  switch (g.phase){
    case 'ready':
      if (g.t > 0.9) gymRepInit(g);
      break;
    case 'rep':
      if (S.pat === 'sweep'){
        g.mk += g.dir * g.sp * dt; if (g.mk > 1){ g.mk = 1; g.dir = -1; } else if (g.mk < 0){ g.mk = 0; g.dir = 1; }
        if (pressed){ const d = Math.abs(g.mk - g.c); gymScore(g, d < g.hw * 0.35 ? 2 : d < g.hw ? 1 : 0); }
        else if (g.t > 5) gymScore(g, 0);
      } else if (S.pat === 'pulse'){
        g.r -= dt / g.T;
        if (pressed){ const d = Math.abs(g.r - 0.22); gymScore(g, d < 0.05 ? 2 : d < 0.12 ? 1 : 0); }
        else if (g.r < 0.04) gymScore(g, 0);
      } else if (S.pat === 'hold'){
        if (!g.on && pressed){ g.on = true; g.fill = 0; }
        if (g.on){
          g.fill += dt / g.F; g.live = g.fill * 0.6;
          if (released){ const d = Math.abs(g.fill - g.c); gymScore(g, d < g.hw * 0.4 ? 2 : d < g.hw ? 1 : 0); }
          else if (g.fill > 1.04) gymScore(g, 0);
        } else if (g.t > 8) gymScore(g, 0);
      } else if (S.pat === 'dial'){                                                    /* the needle goes round: one press in each green wedge, before it has been round 2.6 times */
        g.ang = (g.a0 + g.t * g.sp) % 1; g.pulse = Math.max(0, g.pulse - dt * 4); g.live = g.pulse * 0.85;
        if (pressed){
          let best = null, bd = 9; g.wedges.forEach(function(w){ if (w.res < 0){ let d = Math.abs(g.ang - w.c); d = Math.min(d, 1 - d); if (d < bd){ bd = d; best = w; } } });
          if (best && bd < 0.2){ best.res = bd < g.hw * 0.4 ? 2 : bd < g.hw ? 1 : 0; g.pts += best.res; g.pulse = 1; best.t = 0; try { best.res ? SFX.click() : SFX.deny(); } catch (e) {} }
        }
        g.wedges.forEach(function(w){ if (w.t !== undefined) w.t += dt; });
        if (g.wedges.every(function(w){ return w.res >= 0; }) || g.t > g.T){ g.wedges.forEach(function(w){ if (w.res < 0) w.res = 0; }); gymScore(g, g.pts >= 3 ? 2 : g.pts >= 2 ? 1 : 0); }
      } else if (S.pat === 'rhythm'){                                                  /* four beats scroll in; tap each as it reaches the line */
        g.pulse = Math.max(0, g.pulse - dt * 4); g.live = g.pulse * 0.8;
        if (pressed){
          let best = null, bd = 9; g.notes.forEach(function(n){ if (n.res < 0 && Math.abs(n.at - g.t) < bd){ bd = Math.abs(n.at - g.t); best = n; } });
          if (best && bd < 0.26){ best.res = bd < 0.07 ? 2 : bd < 0.16 ? 1 : 0; g.pts += best.res; g.pulse = 1; g.flash.push({ x: best.at, t: 0, r: best.res }); try { SFX.click(); } catch (e) {} }
        }
        g.notes.forEach(function(n){ if (n.res < 0 && g.t > n.at + 0.26){ n.res = 0; g.flash.push({ x: n.at, t: 0, r: 0 }); } });
        g.flash.forEach(function(f){ f.t += dt; });
        if (g.t >= g.span){ g.notes.forEach(function(n){ if (n.res < 0) n.res = 0; }); const full = g.notes.length * 2; gymScore(g, g.pts >= full - 1 ? 2 : g.pts >= full * 0.5 ? 1 : 0); }
      } else if (S.pat === 'combo'){                                                   /* a string of punches: press the matching button in order, fast */
        g.pulse = Math.max(0, g.pulse - dt * 4); g.live = g.pulse * 0.8;
        const keys = [['KeyJ', 'Digit1', 'Numpad1'], ['KeyK', 'Digit2', 'Numpad2'], ['KeyL', 'Digit3', 'Numpad3']]; g.kp = g.kp || {};
        let pick = -1;
        keys.forEach(function(ks, i){ const dn = !!(k[ks[0]] || k[ks[1]] || k[ks[2]]); if (dn && !g.kp[i]) pick = i; g.kp[i] = dn; });
        if (pressed && g.btns) g.btns.forEach(function(b, i){ if (townInRect(b, Input.sx, Input.sy)) pick = i; });
        if (pick >= 0){
          if (pick === g.seq[g.step]){ g.step++; g.pulse = 1; try { SFX.click(); } catch (e) {} if (g.step >= g.seq.length) gymScore(g, g.t < g.T * 0.6 ? 2 : 1); }
          else gymScore(g, 0);
        } else if (g.t > g.T) gymScore(g, 0);
      } else {                                                                         /* balance: hold to rise, let go to sink; stay inside the moving band */
        const c = 0.5 + 0.27 * Math.sin(g.t * g.spd + g.ph);
        g.vel += ((held ? 1.7 : -1.5) - g.vel * 1.4) * dt; g.bm = clamp(g.bm + g.vel * dt * 0.45, 0, 1); if (g.bm <= 0 || g.bm >= 1) g.vel *= 0.3;
        g.bc = c; if (Math.abs(g.bm - c) < g.hw) g.in += dt; g.live = g.bm * 0.5;
        if (g.t >= g.W){ const f = g.in / g.W; gymScore(g, f >= 0.78 ? 2 : f >= 0.5 ? 1 : 0); }
      }
      break;
    case 'result':
      if (g.t > 0.75){ g.rep++; if (g.rep >= GYM_SETS){ g.phase = 'rest'; g.t = 0; g.sets++; const d = townData(); d.n.gymSets = (d.n.gymSets | 0) + 1; Save.write(); } else if (GYM_CONT[S.pat]) gymRepInit(g); else { g.phase = 'ready'; g.t = 0.5; } }
      break;
    case 'rest':
      if (pressed && g.t > 0.5){ g.rep = 0; g.perfect = g.good = g.miss = 0; g.setXp = 0; g.streak = 0; if (GYM_CONT[S.pat]) gymRepInit(g); else { g.phase = 'ready'; g.t = 0; } }
      break;
  }
}
function gymLift(g){ const a = g.anim; let v = a.t > 0.7 ? 0 : a.k * Math.sin(Math.PI * clamp(a.t / 0.7, 0, 1)); if (g.phase === 'rep') v = Math.max(v, g.live || 0); return v; }

/* ---- wrappers: update, drawing the player, the live machine parts, the HUD ---- */
(function(){
  const uT = updateTown, tE = townEnter, dp = townDrawPlayer, dyn = townDynamic, hud = townDrawHud;
  townEnter = function(){ Town.gym = null; return tE.apply(this, arguments); };
  updateTown = function(dt, frozen){
    if (Town.gym && (!Town.on || G.state !== 'town' || Town.d !== 'in_gym')) Town.gym = null;
    if (!Town.gym) return uT.call(this, dt, frozen);
    if (!frozen && !Town.hold && !Town.panel) gymStep(Math.min(dt, 0.05));
    return uT.call(this, dt, true);
  };
  window.addEventListener('keydown', function(e){ if (Town.gym && e.code === 'Escape'){ e.preventDefault(); e.stopImmediatePropagation(); gymQuit(); } }, true);

  townDrawPlayer = function(ctx, t){
    const g = Town.gym;
    if (!g) return dp(ctx, t);
    const S = GYM_BY_ID[g.m], b = g.b, u = gymLift(g), x0 = b.x - b.w / 2, W = b.w, sw = Math.sin(t * 1.6) * 0.012, L = gymSkill(g.m).l;
    gymAura(ctx, Town.x, TG - 70, L, t);
    const base = { s: 1.5, flip: false, t: t, ph: 0, bob: Math.sin(t * 2.4) * 0.3 };
    switch (g.m){
      case 'free': {
        const hd = townGiraffe(ctx, b.x, TG, Object.assign(base, { reach: -0.15 + 0.95 * u }));
        gymBarbell(ctx, hd.x, hd.y - 26 - L * 0.6, L);
        break;
      }
      case 'bench': {
        townGiraffe(ctx, b.x, TG - 62, Object.assign(base, { sit: true, lie: true, reach: -0.4, dip: 20, lean: 4, bob: 0 }));
        const bar = TG - 118 - u * 54, cl = typeof giraffeColours === 'function' ? giraffeColours() : { coat: '#E8B648' };
        ivLine(ctx, cl.coat, 6, b.x - 10, TG - 88, b.x - 12 + u * 3, bar); ivLine(ctx, cl.coat, 6, b.x + 10, TG - 88, b.x + 12 - u * 2, bar);
        gymBarbell(ctx, b.x, bar, L);
        break;
      }
      case 'tread': townGiraffe(ctx, b.x - 62, TG - 30, Object.assign(base, { moving: true, ph: t * (10 + L * 1.2), reach: 0.05 + u * 0.25 })); break;
      case 'bag': townGiraffe(ctx, b.x - 120, TG - 6, Object.assign(base, { lean: 10 * u, reach: 0.12 + 0.5 * u })); break;
      case 'row': {
        const sx = x0 + W - 150 - u * 90 + 40;
        townGiraffe(ctx, sx - 4, TG - 62, Object.assign(base, { sit: true, lean: -u * 8, reach: 0.1 - u * 0.2 }));
        break;
      }
      case 'yoga': townGiraffe(ctx, b.x - 64, TG - 9, Object.assign(base, { reach: -0.4 + 1.4 * Math.max(u, 0.15 + 0.1 * Math.sin(t * 1.4)), bob: 0 })); break;
      case 'pull': {
        townGiraffe(ctx, b.x, TG - 30 - 62 * u, Object.assign(base, { air: true, reach: 1, bob: 0 }));
        { const pr = 6 + L * 0.9; for (let k = 0; k < 1 + Math.floor(L / 5); k++){ ivLine(ctx, '#8A8E98', 2, b.x - 24, TG - 38 - 62 * u, b.x - 24, TG - 26 - 62 * u + 14 + k * 6); tCircle(ctx, ['#3A3F4A', '#D5352B', '#FFD84D', '#E8E4DC'][k % 4], b.x - 24, TG - 22 - 62 * u + 14 + k * 10 + pr * 0.5, pr - k * 1.4); } }
        tRect(ctx, '#C9CDD9', b.x - 40, TG - 364, 80, 6); tRect(ctx, '#D5352B', b.x - 20, TG - 366, 40, 10);
        break;
      }
      case 'bike': townGiraffe(ctx, x0 + 46, TG - 122, Object.assign(base, { sit: true, lean: 8 + u * 3, reach: 0.08 })); break;
      case 'ring': townGiraffe(ctx, b.x - 100, TG - 40, Object.assign(base, { lean: 12 * u, reach: 0.1 + 0.5 * u })); break;
      case 'sauna': townGiraffe(ctx, x0 + 90, TG - 78, Object.assign(base, { sit: true, reach: 0.02 + 0.06 * Math.sin(t * 1.2), bob: 0 })); break;
    }
    if (g.m === 'sauna' || g.m === 'tread' || g.m === 'row'){ if (Math.random() < 0.18 && Town.fx.length < 80) Town.fx.push({ x: Town.x + 20 + Math.random() * 30, y: TG - 190 - Math.random() * 30, vx: 10, vy: 20, t: 0, life: 0.6, col: '#BFE8FF', r: 2.2 }); }
  };

  townDynamic = function(ctx, D, t, dark){
    dyn(ctx, D, t, dark);
    if (D.id !== 'in_gym') return;
    const tier = gymTier(), g = Town.gym;
    GYM_SKILLS.forEach(function(S){
      const b = gymBldg(S.id), act = !!g && g.m === S.id, u = act ? gymLift(g) : 0;
      gymMachineDraw(ctx, b, S.id, act, t, u, gymSkill(S.id).l);
      if (tier < S.tier){
        const x0 = b.x - b.w / 2, col = GYM_PASSES[S.tier - 1].col;
        tRect(ctx, 'rgba(10,12,22,.5)', x0 - 6, TG - b.h - 8, b.w + 12, b.h + 8);
        const cy = TG - Math.min(b.h, 200) / 2 - 20;
        tRound(ctx, '#12141C', b.x - 52, cy - 34, 104, 62, 8); ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.beginPath(); ctx.roundRect(b.x - 52, cy - 34, 104, 62, 8); ctx.stroke();
        tRound(ctx, col, b.x - 9, cy - 22, 18, 16, 3); ctx.strokeStyle = col; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(b.x, cy - 22, 7, Math.PI, 0); ctx.stroke();
        ivText(ctx, GYM_PASSES[S.tier - 1].short, b.x, cy + 6, 13, col); ivText(ctx, 'PASS', b.x, cy + 21, 11, '#C9CDD9', '600');
      }
    });
    /* Brick, who runs the desk */
    const near = Math.abs(Town.x - 730) < 260;
    const hd = townGiraffe(ctx, 730, TG, { s: 1.6, flip: true, t: t, look: { coat: '#C98A5A', spot: '#7A4A2A', pat: 2, hat: 'sweatband', boot: 'trainers' }, reach: 0.12, bob: Math.abs(Math.sin(t * 1.4)) * 1.5, seed: 5 });
    miniText(ctx, 'Brick', 730, hd.y - 36, 14, '#FFF6E0');
    if (near && !Town.gym && gymTier() === 0 && Math.sin(t * 2.2) > 0){ miniText(ctx, 'Passes at the desk!', 730, hd.y - 56, 12, '#FFD84D'); }
  };

  townDrawHud = function(ctx, D, h){
    hud(ctx, D, h);
    if (D.id === 'in_gym' && !Town.gym){
      const s = clamp(Math.min(G.H / 700, G.W / 760), 0.8, 1.2), tier = gymTier(), tx = tier ? GYM_PASSES[tier - 1].name + '  ·  until midnight' : 'No pass today', col = tier ? GYM_PASSES[tier - 1].col : '#FF8A7A';
      ctx.fillStyle = 'rgba(14,10,8,.55)'; ctx.beginPath(); ctx.roundRect(G.W / 2 - 150 * s, 10, 300 * s, 28 * s, 8); ctx.fill(); ctx.strokeStyle = col; ctx.lineWidth = 1.4; ctx.stroke();
      miniText(ctx, tx, G.W / 2, 29 * s, 13 * s, col, 'center');
    }
    if (Town.gym) gymHud(ctx);
  };
})();

/* ---- the HUD during a workout ---- */
function gymHud(ctx){
  const g = Town.gym, S = GYM_BY_ID[g.m], W = G.W, H = G.H, s = clamp(Math.min(H / 700, W / 760), 0.8, 1.2), P = GYM_PASSES[S.tier - 1], k = gymSkill(S.id), need = gymNeed(k.l);
  /* the top card */
  const cw = Math.min(380 * s, W - 20), cx = W / 2 - cw / 2, cy = 124 * s;
  ctx.fillStyle = 'rgba(14,16,26,.82)'; ctx.beginPath(); ctx.roundRect(cx, cy, cw, 74 * s, 12); ctx.fill(); ctx.strokeStyle = P.col; ctx.lineWidth = 2; ctx.stroke();
  miniText(ctx, S.mach.toUpperCase(), W / 2, cy + 22 * s, 16 * s, P.col, 'center');
  miniText(ctx, S.name + '  Lv ' + k.l + (k.l >= GYM_MAX ? ' (max)' : '') + '   ·   ' + (k.l ? gymBonusText(S, k.l) : 'no bonus yet'), W / 2, cy + 40 * s, 12 * s, '#E8E8F0', 'center', false);
  if (k.l < GYM_MAX){ ctx.fillStyle = 'rgba(255,255,255,.14)'; ctx.fillRect(cx + 16 * s, cy + 52 * s, cw - 32 * s, 10 * s); ctx.fillStyle = P.col; ctx.fillRect(cx + 16 * s, cy + 52 * s, (cw - 32 * s) * clamp(k.xp / need, 0, 1), 10 * s); miniText(ctx, k.xp + ' / ' + need + ' xp', W / 2, cy + 61 * s, 9.5 * s, '#0E1220', 'center'); }
  /* the set pips and the leave button */
  for (let i = 0; i < GYM_SETS; i++){ ctx.fillStyle = i < g.rep || (g.phase === 'result' && i === g.rep) ? P.col : 'rgba(255,255,255,.22)'; ctx.beginPath(); ctx.arc(W / 2 - (GYM_SETS - 1) * 8 * s + i * 16 * s, cy + 90 * s, 4.4 * s, 0, TAU); ctx.fill(); }
  const lw = 130 * s, lh = 28 * s, lx = W - lw - 14, ly = 92 * s;
  ctx.fillStyle = 'rgba(14,10,8,.62)'; ctx.beginPath(); ctx.roundRect(lx, ly, lw, lh, 8); ctx.fill(); ctx.strokeStyle = 'rgba(242,179,61,.5)'; ctx.lineWidth = 1.2; ctx.stroke();
  miniText(ctx, Input.hasTouch ? 'Leave' : 'Leave  Esc', lx + lw / 2, ly + lh / 2 + 4.5 * s, 12.5 * s, '#FFF6E0', 'center'); g.leaveR = { x: lx, y: ly, w: lw, h: lh };
  /* the gauge */
  const gx = W / 2, gy = H - 118 * s;
  if (g.phase === 'ready'){ miniText(ctx, 'Get set...', gx, gy, 26 * s, '#FFF6E0', 'center'); miniText(ctx, ({ sweep: 'Press when the marker is in the green', pulse: 'Press as the ring closes on the circle', hold: 'Hold, and let go in the green', dial: 'Press once as the needle crosses each green wedge', rhythm: 'Tap each beat as it reaches the ring', combo: 'Hit the punches in order: J, K, L (or tap them)', balance: 'Hold to rise, let go to sink: stay in the green' })[S.pat], gx, gy + 26 * s, 13 * s, '#C9CDD9', 'center', false); }
  else if (g.phase === 'rep' || g.phase === 'result'){
    if (S.pat === 'sweep'){
      const bw = Math.min(460 * s, W - 40), bh = 26 * s, bx = gx - bw / 2;
      ctx.fillStyle = 'rgba(14,16,26,.85)'; ctx.beginPath(); ctx.roundRect(bx - 6, gy - bh / 2 - 6, bw + 12, bh + 12, 10); ctx.fill();
      ctx.fillStyle = '#2A3040'; ctx.fillRect(bx, gy - bh / 2, bw, bh);
      ctx.fillStyle = 'rgba(107,224,138,.55)'; ctx.fillRect(bx + (g.c - g.hw) * bw, gy - bh / 2, g.hw * 2 * bw, bh); ctx.fillStyle = '#BFFF9A'; ctx.fillRect(bx + (g.c - g.hw * 0.35) * bw, gy - bh / 2, g.hw * 0.7 * bw, bh);
      const mx = bx + g.mk * bw; ctx.fillStyle = '#FFF'; ctx.fillRect(mx - 3, gy - bh / 2 - 8, 6, bh + 16); ctx.fillStyle = P.col; ctx.beginPath(); ctx.moveTo(mx - 9, gy - bh / 2 - 12); ctx.lineTo(mx + 9, gy - bh / 2 - 12); ctx.lineTo(mx, gy - bh / 2 - 2); ctx.fill();
      if (g.phase === 'rep'){ ctx.fillStyle = 'rgba(255,255,255,.16)'; ctx.fillRect(bx, gy + bh / 2 + 8 * s, bw, 4 * s); ctx.fillStyle = 'rgba(255,255,255,.55)'; ctx.fillRect(bx, gy + bh / 2 + 8 * s, bw * clamp(1 - g.t / 5, 0, 1), 4 * s); }
    } else if (S.pat === 'pulse'){
      const R0 = 26 * s, PX = Math.min(W - 110 * s, W / 2 + 230 * s), cy2 = H * 0.56;
      ctx.fillStyle = 'rgba(14,16,26,.7)'; ctx.beginPath(); ctx.arc(PX, cy2, R0 + 118 * s, 0, TAU); ctx.fill(); ctx.strokeStyle = 'rgba(255,255,255,.12)'; ctx.lineWidth = 1.5; ctx.stroke();
      ctx.strokeStyle = 'rgba(107,224,138,.9)'; ctx.lineWidth = 4 * s; ctx.beginPath(); ctx.arc(PX, cy2, R0, 0, TAU); ctx.stroke(); ctx.strokeStyle = 'rgba(191,255,154,.5)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(PX, cy2, R0 + 7 * s, 0, TAU); ctx.stroke();
      if (g.phase === 'rep'){ ctx.strokeStyle = P.col; ctx.lineWidth = 5 * s; ctx.beginPath(); ctx.arc(PX, cy2, R0 + Math.max(0, g.r - 0.22) * 113 * s, 0, TAU); ctx.stroke(); miniText(ctx, 'NOW', PX, cy2 + 5 * s, 11 * s, 'rgba(255,255,255,.55)', 'center', false); }
    } else if (S.pat === 'hold'){
      const bw = Math.min(460 * s, W - 40), bh = 26 * s, bx = gx - bw / 2;
      ctx.fillStyle = 'rgba(14,16,26,.85)'; ctx.beginPath(); ctx.roundRect(bx - 6, gy - bh / 2 - 6, bw + 12, bh + 12, 10); ctx.fill();
      ctx.fillStyle = '#2A3040'; ctx.fillRect(bx, gy - bh / 2, bw, bh);
      ctx.fillStyle = 'rgba(107,224,138,.55)'; ctx.fillRect(bx + (g.c - g.hw) * bw, gy - bh / 2, g.hw * 2 * bw, bh); ctx.fillStyle = '#BFFF9A'; ctx.fillRect(bx + (g.c - g.hw * 0.4) * bw, gy - bh / 2, g.hw * 0.8 * bw, bh);
      ctx.fillStyle = g.on ? P.col : 'rgba(255,255,255,.2)'; ctx.fillRect(bx, gy - bh / 2, Math.min(1, g.fill) * bw, bh * 0.5);
      if (!g.on){ miniText(ctx, 'Hold ' + (Input.hasTouch ? 'a finger' : 'E / Space / click') + ' to start', gx, gy + bh + 8 * s, 12 * s, '#C9CDD9', 'center', false); if (g.phase === 'rep'){ ctx.fillStyle = 'rgba(255,255,255,.5)'; ctx.fillRect(bx, gy + bh / 2 + 6 * s, bw * clamp(1 - g.t / 8, 0, 1), 4 * s); } }
    } else if (S.pat === 'dial'){
      const R = 62 * s, PX = Math.min(W - 112 * s, W / 2 + 230 * s), cy4 = H * 0.56, tl = clamp(g.t / g.T, 0, 1);
      ctx.fillStyle = 'rgba(14,16,26,.85)'; ctx.beginPath(); ctx.arc(PX, cy4, R + 22 * s, 0, TAU); ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,.14)'; ctx.lineWidth = 12 * s; ctx.beginPath(); ctx.arc(PX, cy4, R, 0, TAU); ctx.stroke();
      g.wedges.forEach(function(w){ const a0 = (w.c - g.hw) * TAU - Math.PI / 2, a1 = (w.c + g.hw) * TAU - Math.PI / 2; ctx.lineWidth = 12 * s; ctx.strokeStyle = w.res < 0 ? 'rgba(107,224,138,.9)' : w.res === 2 ? '#FFE27A' : w.res === 1 ? '#BFFF9A' : '#7A4A4A'; ctx.beginPath(); ctx.arc(PX, cy4, R, a0, a1); ctx.stroke(); if (w.res < 0){ ctx.strokeStyle = '#E8FFE0'; ctx.lineWidth = 4 * s; ctx.beginPath(); ctx.arc(PX, cy4, R, (w.c - g.hw * 0.4) * TAU - Math.PI / 2, (w.c + g.hw * 0.4) * TAU - Math.PI / 2); ctx.stroke(); } });
      const na = g.ang * TAU - Math.PI / 2; ctx.strokeStyle = '#FFF'; ctx.lineWidth = 4 * s; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(PX, cy4); ctx.lineTo(PX + Math.cos(na) * (R + 8 * s), cy4 + Math.sin(na) * (R + 8 * s)); ctx.stroke(); tCircle(ctx, P.col, PX, cy4, 7 * s);
      ctx.strokeStyle = P.col; ctx.lineWidth = 3 * s; ctx.beginPath(); ctx.arc(PX, cy4, R + 16 * s, -Math.PI / 2, -Math.PI / 2 + (1 - tl) * TAU); ctx.stroke();
      miniText(ctx, g.wedges.filter(function(w){ return w.res >= 0; }).length + ' / 2', PX, cy4 + R + 44 * s, 13 * s, '#E8E8F0', 'center', false);
    } else if (S.pat === 'rhythm'){
      const bw = Math.min(520 * s, W - 40), bh = 54 * s, bx = gx - bw / 2, x0t = bx + 40 * s, x1t = bx + bw - 40 * s, cy3 = gy - 4 * s, px = x0t + clamp(g.t / g.span, 0, 1) * (x1t - x0t);
      ctx.fillStyle = 'rgba(14,16,26,.85)'; ctx.beginPath(); ctx.roundRect(bx - 6, cy3 - bh / 2 - 6, bw + 12, bh + 12, 12); ctx.fill();
      ctx.fillStyle = '#232838'; ctx.fillRect(bx, cy3 - bh / 2, bw, bh);
      ctx.strokeStyle = 'rgba(255,255,255,.12)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x0t, cy3); ctx.lineTo(x1t, cy3); ctx.stroke();
      g.notes.forEach(function(n){ const x = x0t + (n.at / g.span) * (x1t - x0t); ctx.strokeStyle = n.res < 0 ? 'rgba(107,224,138,.9)' : 'rgba(0,0,0,0)'; ctx.lineWidth = 3 * s; ctx.beginPath(); ctx.arc(x, cy3, 19 * s, 0, TAU); ctx.stroke(); ctx.fillStyle = n.res < 0 ? P.col : n.res === 2 ? '#FFE27A' : n.res === 1 ? '#BFFF9A' : '#7A4A4A'; ctx.beginPath(); ctx.arc(x, cy3, 12 * s, 0, TAU); ctx.fill(); ctx.strokeStyle = 'rgba(255,255,255,.7)'; ctx.lineWidth = 2; ctx.stroke(); });
      ctx.fillStyle = '#FFF'; ctx.fillRect(px - 2, cy3 - bh / 2 + 2, 4, bh - 4); ctx.fillStyle = P.col; ctx.beginPath(); ctx.moveTo(px - 8, cy3 - bh / 2 - 4); ctx.lineTo(px + 8, cy3 - bh / 2 - 4); ctx.lineTo(px, cy3 - bh / 2 + 6); ctx.fill();
      g.flash.forEach(function(f){ if (f.t > 0.4) return; const x = x0t + (f.x / g.span) * (x1t - x0t); ctx.globalAlpha = 1 - f.t / 0.4; ctx.strokeStyle = f.r === 2 ? '#FFE27A' : f.r === 1 ? '#BFFF9A' : '#FF8A7A'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(x, cy3, (19 + f.t * 40) * s, 0, TAU); ctx.stroke(); ctx.globalAlpha = 1; });
    } else if (S.pat === 'combo'){
      const n = g.seq.length, bsz = 74 * s, gap = 14 * s, tw = 3 * bsz + 2 * gap, gxc = Math.min(W - 150 * s, gx + 250 * s), bx0 = gxc - tw / 2, by0 = gy - bsz / 2 + 4 * s, names = ['JAB', 'HOOK', 'UPPERCUT'], keys = ['J', 'K', 'L'], cols = ['#4DB8FF', '#FFC83D', '#FF6A5A'];
      g.btns = [];
      for (let i = 0; i < 3; i++){ const x = bx0 + i * (bsz + gap); g.btns.push({ x: x, y: by0, w: bsz, h: bsz }); ctx.fillStyle = 'rgba(14,16,26,.9)'; ctx.beginPath(); ctx.roundRect(x, by0, bsz, bsz, 12); ctx.fill(); ctx.strokeStyle = cols[i]; ctx.lineWidth = 3; ctx.stroke(); miniText(ctx, keys[i], x + bsz / 2, by0 + 34 * s, 26 * s, cols[i], 'center'); miniText(ctx, names[i], x + bsz / 2, by0 + bsz - 14 * s, 10.5 * s, '#E8E8F0', 'center', false); }
      const sw = 34 * s, sx0 = gxc - (n * sw + (n - 1) * 8 * s) / 2, sy0 = by0 - 54 * s;
      ctx.fillStyle = 'rgba(14,16,26,.85)'; ctx.beginPath(); ctx.roundRect(sx0 - 12 * s, sy0 - 8 * s, n * sw + (n - 1) * 8 * s + 24 * s, sw + 16 * s, 10); ctx.fill();
      for (let i = 0; i < n; i++){ const x = sx0 + i * (sw + 8 * s), done = i < g.step; ctx.fillStyle = done ? 'rgba(255,255,255,.18)' : cols[g.seq[i]]; ctx.beginPath(); ctx.roundRect(x, sy0, sw, sw, 7); ctx.fill(); if (i === g.step && g.phase === 'rep'){ ctx.strokeStyle = '#FFF'; ctx.lineWidth = 3; ctx.stroke(); } miniText(ctx, keys[g.seq[i]], x + sw / 2, sy0 + sw / 2 + 6 * s, 17 * s, done ? 'rgba(255,255,255,.4)' : '#12141C', 'center'); }
      if (g.phase === 'rep'){ const tl = clamp(1 - g.t / g.T, 0, 1); ctx.fillStyle = 'rgba(255,255,255,.5)'; ctx.fillRect(sx0 - 12 * s, sy0 + sw + 10 * s, (n * sw + (n - 1) * 8 * s + 24 * s) * tl, 4 * s); }
    } else {
      const bw = Math.min(460 * s, W - 40), bh = 28 * s, bx = gx - bw / 2, mx = bx + g.bm * bw, bc = g.bc === undefined ? 0.5 : g.bc, tl = clamp(g.t / g.W, 0, 1);
      ctx.fillStyle = 'rgba(14,16,26,.85)'; ctx.beginPath(); ctx.roundRect(bx - 6, gy - bh / 2 - 6, bw + 12, bh + 28 * s, 10); ctx.fill();
      ctx.fillStyle = '#2A3040'; ctx.fillRect(bx, gy - bh / 2, bw, bh);
      const inb = Math.abs(g.bm - bc) < g.hw; ctx.fillStyle = inb ? 'rgba(107,224,138,.75)' : 'rgba(107,224,138,.4)'; ctx.fillRect(bx + (bc - g.hw) * bw, gy - bh / 2, g.hw * 2 * bw, bh);
      ctx.fillStyle = '#FFF'; ctx.fillRect(mx - 4, gy - bh / 2 - 6, 8, bh + 12); ctx.fillStyle = P.col; ctx.beginPath(); ctx.arc(mx, gy, 7 * s, 0, TAU); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,.18)'; ctx.fillRect(bx, gy + bh / 2 + 6 * s, bw, 4 * s); ctx.fillStyle = P.col; ctx.fillRect(bx, gy + bh / 2 + 6 * s, bw * tl, 4 * s);
    }
  }
  if (g.fb && g.fb.t < 0.9){ ctx.globalAlpha = 1 - g.fb.t / 0.9; miniText(ctx, g.fb.txt, gx, gy - 48 * s - g.fb.t * 22, 26 * s, g.fb.col, 'center'); ctx.globalAlpha = 1; }
  if (g.banner){ ctx.globalAlpha = Math.min(1, (2.2 - g.banner.t) * 2, g.banner.t * 4); miniText(ctx, g.banner.txt, W / 2, H * 0.52, 30 * s, '#FFE9A0', 'center'); ctx.globalAlpha = 1; }
  if (g.phase === 'rest'){
    const rw = Math.min(420 * s, W - 30), rh = 150 * s, rx = W / 2 - rw / 2, ry = H * 0.4;
    ctx.fillStyle = 'rgba(14,16,26,.9)'; ctx.beginPath(); ctx.roundRect(rx, ry, rw, rh, 14); ctx.fill(); ctx.strokeStyle = P.col; ctx.lineWidth = 2.5; ctx.stroke();
    miniText(ctx, 'SET ' + g.sets + ' DONE', W / 2, ry + 34 * s, 22 * s, P.col, 'center');
    miniText(ctx, g.perfect + ' perfect   ·   ' + g.good + ' good   ·   ' + g.miss + ' missed', W / 2, ry + 62 * s, 14 * s, '#E8E8F0', 'center', false);
    miniText(ctx, '+' + g.setXp + ' xp   ·   best streak ' + g.best, W / 2, ry + 86 * s, 14 * s, '#FFE9A0', 'center', false);
    miniText(ctx, (Input.hasTouch ? 'Tap' : 'E / click') + ': another set   ·   ' + (Input.hasTouch ? 'Leave button' : 'Esc') + ': finish', W / 2, ry + 122 * s, 12.5 * s, '#C9CDD9', 'center', false);
  }
}

/* ---- doors, labels and the panels ---- */
(function(){
  const tu = townUse, nr = townNearest, hta = handleTownAction;
  townUse = function(o){
    if (o.k === 'b'){
      const b = o.b;
      if (b.act === 'gym-desk'){ townShowGymDesk(); return; }
      if (b.act === 'gym-board'){ townShowGymBoard(); return; }
      if (b.act === 'gym-train'){ gymTrain(b); return; }
    }
    tu(o);
  };
  townNearest = function(D, inp){
    const o = nr(D, inp);
    if (o && o.k === 'b'){
      if (o.b.act === 'gym-desk') o.label = 'Buy a day pass';
      else if (o.b.act === 'gym-board') o.label = 'Read the Gains Board';
      else if (o.b.act === 'gym-train'){ const S = gymMach(o.b); o.label = gymTier() >= S.tier ? 'Use the ' + S.mach : S.mach + ' (needs the ' + GYM_PASSES[S.tier - 1].short + ' pass)'; }
    }
    return o;
  };
  handleTownAction = function(a){
    const m = /^town-gym-buy-(\d)$/.exec(a);
    if (m){ gymBuy(+m[1]); townShowGymDesk(); return true; }
    if (a === 'town-gym-board'){ townShowGymBoard(); return true; }
    if (a === 'town-gym-desk'){ townShowGymDesk(); return true; }
    return hta(a);
  };
})();
function gymRankBar(){
  const r = gymRankIndex(), n = gymTotal(), cur = GYM_RANKS[r], nxt = GYM_RANKS[r + 1];
  const pct = nxt ? clamp((n - cur.at) / (nxt.at - cur.at), 0, 1) : 1;
  return '<div class="gymrank"><div><span>GYM RANK</span><b>' + cur.n + '</b></div><div class="gr-bar"><i style="width:' + Math.round(pct * 100) + '%"></i></div><div class="gr-sub">' + n + ' levels trained' + (nxt ? '  ·  next: <em>' + nxt.n + '</em> at ' + nxt.at + (nxt.acc ? ' (' + ACC_BY_ID[nxt.acc].name + ')' : nxt.swatch ? ' (Gold Medal coat colour)' : '') : '  ·  the top') + '</div></div>';
}
function townShowGymDesk(){
  const gold = Save.data.gold | 0, cur = gymTier();
  let h = '<div class="tp-title">LONGNECK FITNESS</div><p class="bp">Day passes. Brick’s rule: <b>a pass lasts until midnight</b>, and tomorrow you buy it again. Each pass also covers every zone below it, and you can upgrade for the difference. ' +
    (cur ? 'Today you hold the <b style="color:' + GYM_PASSES[cur - 1].col + '">' + GYM_PASSES[cur - 1].name + '</b>.' : 'You have no pass today.') + '</p>' + gymRankBar() + '<div class="gymcards">';
  GYM_PASSES.forEach(function(p, i){
    const open = townDoneCh(p.ch), have = cur === i + 1, inc = cur > i + 1, cost = gymPrice(i), can = open && !have && !inc && gold >= cost;
    const ms = GYM_SKILLS.filter(function(S){ return S.tier === i + 1; });
    h += '<div class="gymcard' + (have ? ' on' : '') + (open ? '' : ' lock') + '" style="--c:' + p.col + '"><div class="gc-top"><b>' + p.short + '</b><i>PASS</i></div>' +
      '<div class="gc-price">' + fmt(p.price) + '<small>gold / day</small></div><ul class="gc-list">' + ms.map(function(S){ return '<li>' + S.mach + '<em>' + S.name + '</em></li>'; }).join('') + (i ? '<li class="gc-inc">+ every lower zone</li>' : '') + '</ul>' +
      '<div class="gc-gate">' + (open ? 'Unlocked' : 'Finish Chapter ' + p.ch + ' first') + '</div>' +
      (have ? '<div class="gc-state">ACTIVE TODAY</div>' : inc ? '<div class="gc-state dim">INCLUDED</div>' : '<button class="gcbtn" data-a="town-gym-buy-' + i + '"' + (can ? '' : ' disabled') + '>' + (!open ? 'Locked' : cur ? 'Upgrade<small>' + fmt(cost) + ' gold</small>' : 'Buy<small>' + fmt(cost) + ' gold</small>') + '</button>') + '</div>';
  });
  h += '</div><div class="stock">' + fmt(gold) + ' gold</div><div class="gymlink"><button class="tbtn" data-a="town-gym-board">Open the Gains Board</button></div>';
  townPanelT('gym', h, { w: 940 });
}
function townShowGymBoard(){
  const cur = gymTier();
  let h = '<div class="tp-title">GAINS BOARD</div>' + gymRankBar() + '<div class="gymskills">';
  GYM_SKILLS.forEach(function(S){
    const k = gymSkill(S.id), P = GYM_PASSES[S.tier - 1], max = k.l >= GYM_MAX, need = gymNeed(k.l), nextMs = k.l < 5 ? 5 : k.l < 10 ? 10 : k.l < 15 ? 15 : 0;
    h += '<div class="gymskill" style="--c:' + P.col + '"><div class="gs-head"><b>' + S.name + '</b><span>' + S.mach + (cur < S.tier ? ' · needs ' + P.short + '' : '') + '</span><i>Lv ' + k.l + (max ? ' MAX' : '') + '</i></div>' +
      '<div class="gs-bar"><i style="width:' + (max ? 100 : Math.round(clamp(k.xp / need, 0, 1) * 100)) + '%"></i></div>' +
      '<div class="gs-now">' + (k.l ? gymBonusText(S, k.l) : 'no bonus yet') + '</div>' +
      '<div class="gs-ms">' + [5, 10, 15].map(function(L, i){ return '<em class="' + (k.l >= L ? 'got' : '') + '">Lv ' + L + ' +' + (S.fmt === 'add' ? S.ms[i] : S.fmt === 'regen' ? S.ms[i] : (S.ms[i] * 100).toFixed(0).replace(/^0$/, '1') + (S.fmt === 'pts' ? '' : '%')) + '</em>'; }).join('') + '</div>' +
      (max ? '' : '<div class="gs-next">' + (need - k.xp) + ' xp to level ' + (k.l + 1) + (nextMs ? '  ·  big bonus at ' + nextMs : '') + '</div>') + '</div>';
  });
  h += '</div><div class="gymlink"><button class="tbtn" data-a="town-gym-desk">Back to the front desk</button></div>';
  townPanelT('gym', h, { w: 980 });
}

/* ---- the guide ---- */
(function(){
  const t = GUIDE_TOPICS.find(function(x){ return x.id === 'town'; });
  if (t){ const base = t.html; t.html = function(){ return base().replace('</ul>', '<li><b>Longneck Fitness</b>, the big building at the end of Market Street. Buy a <b>day pass</b> at the desk (it lasts until midnight; there are five tiers, each opening after a chapter) and use the machines: ten of them, each trains one skill. A set is eight reps, and every rep is a timing game. Skill levels give permanent bonuses in a run (attack, speed, crits, health, reach and more), with bigger ones at levels 5, 10 and 15. Your total levels make your <b>gym rank</b>, which pays out hats, boots and a coat colour.</li></ul>'); }; }
  Object.assign(TOWN_SPECIAL_SRC, { sweatband: 'Earned at the gym: reach the Regular rank.', trainers: 'Earned at the gym: reach the Athlete rank.', boxboots: 'Earned at the gym: reach the Bruiser rank.', laurel: 'Earned at the gym: reach the Champion rank.', gym_gold: 'Earned at the gym: reach the Longneck Legend rank.' });
})();
