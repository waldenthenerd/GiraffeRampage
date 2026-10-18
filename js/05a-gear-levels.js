'use strict';
/* =============================================================================================================================
   05a-gear-levels.js  --  GEAR LEVELS, STAT PREVIEW AND CRATE PITY. The data side of the gear revamp (no drawing, no HTML).
   A piece starts at level 1. A duplicate from a crate raises it one level, up to level 5 (stored as the number of upgrades, 0 to 4, in
   Save.data.gearLv, beside Save.data.gear and never inside it). Each level adds 10% to what the piece itself gives (not to its set bonus);
   a weapon also hits 6% harder per level. gearStatsFor() and gearDelta() answer "what would this loadout give?" without touching the
   save or the live stats, which is what the Gear page's compare panel shows. Crate pity (Save.data.cratePity) counts the opens since the
   last good drop: a Supply Crate gives rare or better on its 10th open without one, a Prime Crate epic or better on its 8th.
   ============================================================================================================================= */
const GEAR_LV_MAX = 5;
const GEAR_LV_MUL = 0.10;                                       /* each level adds this much to a piece's own numbers */
const GEAR_WEAPON_LV_DMG = 0.06;                                /* and this much to a weapon's damage */
const GEAR_MULT_KEYS = { hasteMul: 1, kickKb: 1 };              /* stats a piece multiplies (s.x *= 0.94), scaled as a power, not a sum */
const GEAR_INT_KEYS = { bonusRerolls: 1 };                      /* whole-number stats, never scaled */
const CRATE_PITY = { normal: { every: 10, floor: 'rare' }, rare: { every: 8, floor: 'epic' } };

function gearLevelScale(level){ return 1 + GEAR_LV_MUL * (Math.max(1, Math.min(GEAR_LV_MAX, level | 0)) - 1); }
function gearLevel(id){
  if (typeof GEAR_INDEX === 'undefined' || !GEAR_INDEX[id] || !gearOwned(id)) return 1;
  const lv = Save.data && Save.data.gearLv && Save.data.gearLv[id];
  return 1 + Math.max(0, Math.min(GEAR_LV_MAX - 1, lv | 0));
}
function gearLevelUp(id){
  if (!GEAR_INDEX[id] || !gearOwned(id) || !Save.data) return false;
  const lv = gearLevel(id);
  if (lv >= GEAR_LV_MAX) return false;
  if (!Save.data.gearLv || typeof Save.data.gearLv !== 'object' || Array.isArray(Save.data.gearLv)) Save.data.gearLv = {};
  Save.data.gearLv[id] = lv;                                    /* upgrades = level - 1, and the new level is lv + 1 */
  Save.write();
  recalcStats();
  return true;
}

/* every piece's own effect is scaled by its level: wrap each apply() once, at load */
Object.keys(GEAR_INDEX).forEach(function(id){
  const p = GEAR_INDEX[id]; if (!p.apply) return;
  const orig = p.apply;
  p.apply = function(s){
    const before = {};
    for (const k in s) if (typeof s[k] === 'number') before[k] = s[k];
    orig.call(this, s);
    const sc = gearLevelScale(gearLevel(p.id));
    if (sc === 1) return;
    for (const k in before){
      if (GEAR_INT_KEYS[k] || typeof s[k] !== 'number' || s[k] === before[k]) continue;
      const v = GEAR_MULT_KEYS[k] ? before[k] * Math.pow(s[k] / before[k], sc) : before[k] + (s[k] - before[k]) * sc;
      s[k] = Math.round(v * 1e6) / 1e6;
    }
  };
});

/* a weapon at its level: a copy (WEAPONS itself is never changed) with the extra damage */
function weaponAtLevel(w, level){
  if (!w || level <= 1) return w;
  return Object.assign({}, w, { dmg: Math.round(w.dmg * (1 + GEAR_WEAPON_LV_DMG * (level - 1)) * 100) / 100 });
}
(function(){
  const eq = equippedWeapon;
  equippedWeapon = function(){
    const w = eq(), id = gearEquipped('weapon');
    return id && GEAR_INDEX[id] ? weaponAtLevel(w, gearLevel(id)) : w;
  };
})();

/* the starting stats of a run with no shop perks and no cards: the same keys as recalcStats() builds, so gear can be applied to it */
function gearBaseStats(){
  return {
    speedMul: 1, kickDmgMul: 1, kickRangeMul: 1, kickArc: 0, kickKb: 1, kickWave: false,
    hasteMul: 1, maxHpAdd: 0, dr: 0, crit: 0.05, critMul: 2.0, xpMul: 1, goldMul: 1,
    pickupMul: 1, dropMul: 1, regen: 0, reflect: 0, rageMax: 0, ragePer: 0.008, invulnMul: 1,
    allDmgMul: 1, bleedMul: 1, bonusRerolls: 0, weaponEcho: 0,
    slowPotency: 0, slowDurMul: 1, freezeBonus: 0, chainBonus: 0, chainFalloffBonus: 0,
    swimSpeedMul: 1, splashChance: 0, splashRadiusMul: 1, oceanDr: 0
  };
}
/* stats and weapon for a loadout { cape, weapon, armor } (ids or null); the save and the live stats are left alone */
function gearStatsFor(loadout){
  const keep = Save.data.equipped, s = gearBaseStats();
  Save.data.equipped = { cape: loadout.cape || null, weapon: loadout.weapon || null, armor: loadout.armor || null };
  try {
    applyGear(s);
    const wid = Save.data.equipped.weapon, wp = wid && GEAR_INDEX[wid] && GEAR_INDEX[wid].weapon ? WEAPONS[GEAR_INDEX[wid].weapon] : DEFAULT_WEAPON;
    return { stats: s, weapon: wid && GEAR_INDEX[wid] ? weaponAtLevel(wp, gearLevel(wid)) : wp };
  } finally { Save.data.equipped = keep; }
}

/* how the Gear page names and formats each stat; lowerBetter: a smaller number is the good direction */
const GEAR_STAT_LABELS = {
  maxHpAdd: { label: 'Max health', fmt: 'flat' }, dr: { label: 'Damage taken', fmt: 'pctless' }, speedMul: { label: 'Move speed', fmt: 'pctmul' },
  hasteMul: { label: 'Attack time', fmt: 'pctmul', lowerBetter: true }, kickDmgMul: { label: 'Kick damage', fmt: 'pctmul' }, allDmgMul: { label: 'All damage', fmt: 'pctmul' },
  kickRangeMul: { label: 'Reach', fmt: 'pctmul' }, kickKb: { label: 'Knockback', fmt: 'pctmul' }, crit: { label: 'Crit chance', fmt: 'pct' }, critMul: { label: 'Crit damage', fmt: 'pctmul' },
  regen: { label: 'Regeneration', fmt: 'sec' }, pickupMul: { label: 'Pickup range', fmt: 'pctmul' }, dropMul: { label: 'Drops', fmt: 'pctmul' }, xpMul: { label: 'XP gained', fmt: 'pctmul' },
  goldMul: { label: 'Gold gained', fmt: 'pctmul' }, reflect: { label: 'Reflected damage', fmt: 'pct' }, bleedMul: { label: 'Bleed damage', fmt: 'pctmul' },
  slowPotency: { label: 'Slow strength', fmt: 'pct' }, slowDurMul: { label: 'Slow time', fmt: 'pctmul' }, freezeBonus: { label: 'Freeze chance', fmt: 'pct' },
  chainBonus: { label: 'Chain jumps', fmt: 'flat' }, chainFalloffBonus: { label: 'Chain strength', fmt: 'pct' }, bonusRerolls: { label: 'Rerolls', fmt: 'flat' },
  swimSpeedMul: { label: 'Swim speed', fmt: 'pctmul' }, splashChance: { label: 'Splash chance', fmt: 'pct' }, splashRadiusMul: { label: 'Splash size', fmt: 'pctmul' },
  oceanDr: { label: 'Sea damage taken', fmt: 'pctless' }, invulnMul: { label: 'Time after a hit', fmt: 'pctmul' }, weaponEcho: { label: 'Weapon echo', fmt: 'pct' },
  w_dmg: { label: 'Weapon damage', fmt: 'flat' }, w_cd: { label: 'Time between kicks', fmt: 'secs', lowerBetter: true }, w_range: { label: 'Weapon range', fmt: 'flat' },
  w_arc: { label: 'Swing arc', fmt: 'deg' }, w_kb: { label: 'Weapon knockback', fmt: 'flat' }
};
/* what swapping `id` (or nothing) into `slot` changes against what is worn now; the last entry is the set progress */
function gearDelta(slot, id){
  const cur = Object.assign({ cape: null, weapon: null, armor: null }, Save.data.equipped), alt = Object.assign({}, cur);
  alt[slot] = id || null;
  const A = gearStatsFor(cur), B = gearStatsFor(alt), out = [];
  function add(key, from, to){
    if (Math.abs(to - from) < 1e-9) return;
    const lb = GEAR_STAT_LABELS[key] && GEAR_STAT_LABELS[key].lowerBetter;
    out.push({ key: key, label: GEAR_STAT_LABELS[key] ? GEAR_STAT_LABELS[key].label : key, from: from, to: to, better: lb ? to < from : to > from });
  }
  Object.keys(A.stats).forEach(function(k){ if (typeof A.stats[k] === 'number') add(k, A.stats[k], B.stats[k]); });
  ['dmg', 'cd', 'range', 'arc', 'kb'].forEach(function(k){ add('w_' + k, A.weapon[k], B.weapon[k]); });
  const p = id ? GEAR_INDEX[id] : null;
  if (p){
    const before = setWornCount(p.setId), curId = cur[slot], sameBefore = curId && GEAR_INDEX[curId] && GEAR_INDEX[curId].setId === p.setId ? 1 : 0, after = before - sameBefore + 1;
    out.push({ key: 'set', label: SETMAP[p.setId].name + ' set', from: before, to: after, better: after >= before, setDesc: SETMAP[p.setId].setDesc, completes: after === 3 && before < 3 });
  }
  return out;
}

/* crate pity */
function cratePityCount(kind){ return Math.max(0, ((Save.data && Save.data.cratePity && Save.data.cratePity[kind]) | 0)); }
function cratePityBump(kind, gotGood){
  if (!Save.data) return;
  if (!Save.data.cratePity || typeof Save.data.cratePity !== 'object' || Array.isArray(Save.data.cratePity)) Save.data.cratePity = {};
  Save.data.cratePity[kind] = gotGood ? 0 : cratePityCount(kind) + 1;
}
/* saves from before this file: the two maps appear empty, nothing else changes */
(function(){
  const load = Save.load;
  Save.load = function(){
    const d = load.apply(this, arguments);
    if (!d.gearLv || typeof d.gearLv !== 'object' || Array.isArray(d.gearLv)) d.gearLv = {};
    if (!d.cratePity || typeof d.cratePity !== 'object' || Array.isArray(d.cratePity)) d.cratePity = {};
    Object.keys(d.gearLv).forEach(function(k){ d.gearLv[k] = Math.max(0, Math.min(GEAR_LV_MAX - 1, d.gearLv[k] | 0)); });
    return d;
  };
})();

/* ---------- crates: pity, and duplicates that level a piece up ----------
   Replaces openCrate() from 05-gear.js. Returns { piece, dupe, refund, rarity, levelUp, pity } or null when the purchase could not happen.
   The rarity is rolled as before; if this is the open that pity guarantees (Supply Crate: the 10th without a rare or better, Prime Crate: the
   8th without an epic or better) and the roll fell short, it is raised to the floor. A rarity with nothing left to find gives, in order: an
   unowned piece of that floor or better when pity is on, an unowned piece of any rarity otherwise (not for a mythical roll), and then a duplicate. A duplicate raises
   the piece one level (up to 5) and refunds nothing; only a piece already at level 5 refunds DUPE_REFUND gems. */
function openCrate(kind){
  const crate = CRATES[kind];
  if (!crate || !Save.data || (Save.data.gems | 0) < crate.cost) return null;
  if (typeof gearReveal !== 'undefined' && gearReveal.active) return null;                         /* one crate at a time while the reveal plays */
  Save.data.gems -= crate.cost;
  const pc = CRATE_PITY[kind], onPity = !!pc && cratePityCount(kind) + 1 >= pc.every;
  let rarity = rollRarity(crate.weights), pity = false;
  if (onPity && RARITY_ORDER[rarity] < RARITY_ORDER[pc.floor]){ rarity = pc.floor; pity = true; }
  const all = Object.keys(GEAR_INDEX).map(function(id){ return GEAR_INDEX[id]; }), floorN = pc ? RARITY_ORDER[pc.floor] : 0;
  const atRarity = all.filter(function(p){ return p.rarity === rarity; });
  let candidates = atRarity.filter(function(p){ return !gearOwned(p.id); });
  if (!candidates.length && rarity !== 'mythical') candidates = all.filter(function(p){ return !gearOwned(p.id) && (!onPity || RARITY_ORDER[p.rarity] >= floorN); });      /* a mythical roll never turns into something lesser: with the set complete it levels a piece up */
  let piece, dupe = false, refund = 0, levelUp = 0;
  if (candidates.length){
    piece = pick(candidates); grantGear(piece.id);
    if (!gearEquipped(piece.slot)) equipGear(piece.id);                                             /* a piece in an empty slot is worn at once */
  } else {
    const pool = (onPity ? all.filter(function(p){ return RARITY_ORDER[p.rarity] >= floorN; }) : (atRarity.length ? atRarity : all));
    const grow = pool.filter(function(p){ return gearLevel(p.id) < GEAR_LV_MAX; });
    piece = pick(grow.length ? grow : pool); dupe = true;
    if (gearLevelUp(piece.id)) levelUp = gearLevel(piece.id); else { refund = DUPE_REFUND; Save.data.gems += refund; }
  }
  cratePityBump(kind, RARITY_ORDER[piece.rarity] >= (pc ? RARITY_ORDER[pc.floor] : 0) && !!pc);
  Save.data.cratesOpened = (Save.data.cratesOpened | 0) + 1;
  Save.write();
  return { piece: piece, dupe: dupe, refund: refund, rarity: piece.rarity, levelUp: levelUp, pity: pity };
}
