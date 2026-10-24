'use strict';
/* =============================================================================================================================
   44zz-campus.js  --  LONGNECK UNIVERSITY: the rules. (The district, rooms and people are in 44zze-campus-town.js, the study sessions in
   44zzf-campus-study.js, the questions in 44zza / 44zzb, the lectures and books in 44zzc / 44zzd, the painting in 44zzg-campus-art.js,
   44zzh-campus-rooms.js and 44zzi-campus-pics.js.)

   A CAMPUS off the Town Square (it opens after Chapter 1). There is no pass: what limits her is STUDY ENERGY, a number that refills at
   midnight (townDayKey) to a maximum of 10, plus one for every rank above Fresher, plus one for each Study Lamp she has bought (up to 5).
   Energy can also be topped up in the Campus Cafe (drinks and snacks for gold or gems, food from the satchel).
   FOUR THINGS TO DO, each paid for in energy: a lecture (2), reading a book (1), homework (1) and an exam (3).
   EIGHT FACULTIES, each opening after a chapter. Each is a skill with levels 1 to 15 that cost 10 + 18 ln(l + 1) xp each; every level gives a
   little and levels 5, 10 and 15 give a bigger bonus, exactly as at the gym. What they give (all in a run, none of them the gym's):
     Giraffe Studies (Ch 1) xp gain · Earth & Weather (Ch 2) dodge chance · Biology (Ch 3) drop luck · Chemistry (Ch 4) free rerolls ·
     Maths (Ch 6) gold gain · Physics (Ch 7) card cooldowns · Space (Ch 8) boss damage · History & Geography (Ch 10) pickup range.
   The faculty's tier (level 0-4 tier 1, 5-9 tier 2, 10-15 tier 3) sets how hard its questions are, and the three exams of a faculty (Bachelor,
   Master, Doctorate) need level 5, 10 and 15. A passed exam is a degree step; the Doctorate is the faculty's badge.
   RANK is the sum of every faculty's level: Fresher, Student (a mortarboard), Scholar (loafers), Graduate, Professor, Chancellor (each of the
   last three a coat colour). Rank also gives the SMART GIRAFFE perks in a run: a chance of a fourth card to choose from at every level-up, a
   chance of a free card level ("Eureka!"), and at Chancellor one more card slot.
   Saved in Save.data.town.uni = { day, en, lamps, bought, fac: { id: { l, xp } }, deg: { id: 0-3 }, badge: { id: 1 }, rk: { n: 1 }, seen: { qid: n },
   read: { bookId: n }, lec: { lectureId: n }, facts: { id: 1 }, buff: { xp, flash, key }, n: { sessions, exams, passed, hw, books, lectures, correct, wrong } }
   (every part is optional: older saves load fine).
   Hooks: applyCityStats, hurtPlayer, haste, damageEnemy, startRun, rollOffer, chooseCard, maxCards, townEnter.
   ============================================================================================================================= */
const UNI_MAX = 15;
/* per: the bonus for every level; ms: the extra bonus at levels 5, 10 and 15; fmt: how it is shown */
const UNI_FAC = [
  { id: 'giraffe', name: 'Giraffe Studies', short: 'GIRAFFE', ch: 1, col: '#E8B648', key: 'xpMul', per: 0.009, ms: [0.03, 0.05, 0.08], fmt: 'pct', lbl: 'XP gain', prof: 'longshanks', blurb: 'Necks, spots, savannas and everything about being tall.' },
  { id: 'earth', name: 'Earth & Weather', short: 'EARTH', ch: 2, col: '#6BB8E8', key: 'dodge', per: 0.004, ms: [0.01, 0.02, 0.03], fmt: 'pct', lbl: 'Dodge chance', prof: 'fern', blurb: 'Wind, rain, rocks, oceans and why the sky does what it does.' },
  { id: 'bio', name: 'Biology', short: 'BIOLOGY', ch: 3, col: '#6BD88A', key: 'dropMul', per: 0.012, ms: [0.03, 0.05, 0.08], fmt: 'pct', lbl: 'Drop luck', prof: 'fern', blurb: 'Cells, plants, bodies and the strange lives of animals.' },
  { id: 'chem', name: 'Chemistry', short: 'CHEMISTRY', ch: 4, col: '#B58AE8', key: 'rerolls', per: 0, ms: [0, 0, 0], fmt: 'rerolls', lbl: 'Free rerolls', prof: 'orbit', blurb: 'Atoms, elements, reactions and what everything is made of.' },
  { id: 'maths', name: 'Maths', short: 'MATHS', ch: 6, col: '#F2A23C', key: 'goldMul', per: 0.012, ms: [0.03, 0.06, 0.10], fmt: 'pct', lbl: 'Gold gain', prof: 'chalk', blurb: 'Numbers, shapes, patterns and sums that behave.' },
  { id: 'phys', name: 'Physics', short: 'PHYSICS', ch: 7, col: '#FF6A6A', key: 'cdRed', per: 0.005, ms: [0.01, 0.02, 0.03], fmt: 'pctdown', lbl: 'Card cooldowns', prof: 'orbit', blurb: 'Forces, light, sound, energy and how the world moves.' },
  { id: 'space', name: 'Space', short: 'SPACE', ch: 8, col: '#7A8AFF', key: 'bossDmg', per: 0.012, ms: [0.04, 0.08, 0.12], fmt: 'pct', lbl: 'Boss damage', prof: 'orbit', blurb: 'Planets, stars, rockets and the long way up.' },
  { id: 'geo', name: 'History & Geography', short: 'HISTORY', ch: 10, col: '#E8D070', key: 'pickupMul', per: 0.015, ms: [0.05, 0.08, 0.12], fmt: 'pct', lbl: 'Pickup range', prof: 'quill', blurb: 'Maps, countries, old empires and how people got here.' }
];
const UNI_BY_ID = {}; UNI_FAC.forEach(function(f){ UNI_BY_ID[f.id] = f; });
const UNI_ACT = { read: { name: 'Reading', cost: 1 }, hw: { name: 'Homework', cost: 1 }, lec: { name: 'Lecture', cost: 2 }, exam: { name: 'Exam', cost: 3 } };
const UNI_DEG = ['', 'Bachelor', 'Master', 'Doctorate'];
const UNI_DEG_GEMS = [0, 25, 70, 160];
const UNI_RANKS = [
  { n: 'Fresher', at: 0, perk: 'The first day.' },
  { n: 'Student', at: 8, acc: 'mortarboard', perk: '+1 study energy' },
  { n: 'Scholar', at: 24, acc: 'loafers', perk: '+1 study energy, 25% chance of a fourth card at level-up' },
  { n: 'Graduate', at: 48, swatch: 'uni_grad', perk: '+1 study energy, 35% fourth card, 8% Eureka' },
  { n: 'Professor', at: 80, swatch: 'uni_prof', perk: '+1 study energy, 50% fourth card, 12% Eureka' },
  { n: 'Chancellor', at: 120, swatch: 'uni_chan', perk: '+1 study energy, 65% fourth card, 16% Eureka, one more card slot' }
];
const UNI_EXTRA_CHOICE = [0, 0, 0.25, 0.35, 0.5, 0.65];       /* by rank index: the chance of a fourth card at a level-up */
const UNI_EUREKA = [0, 0, 0, 0.08, 0.12, 0.16];                /* and of a free level for a card she owns */
const UNI_EN_BASE = 10, UNI_LAMP_MAX = 5;

/* ---- the numbers ---- */
function uniData(){
  const t = townData(); if (!t.uni || typeof t.uni !== 'object' || Array.isArray(t.uni)) t.uni = {};
  const u = t.uni;
  ['fac', 'deg', 'badge', 'rk', 'seen', 'read', 'lec', 'facts', 'buff', 'n'].forEach(function(k){ if (!u[k] || typeof u[k] !== 'object' || Array.isArray(u[k])) u[k] = {}; });
  if (typeof u.day !== 'string') u.day = ''; u.lamps = Math.max(0, Math.min(UNI_LAMP_MAX, u.lamps | 0)); u.bought = Math.max(0, u.bought | 0);
  return u;
}
function uniFac(id){ const u = uniData(); let k = u.fac[id]; if (!k || typeof k !== 'object') k = u.fac[id] = { l: 0, xp: 0 }; k.l = Math.max(0, Math.min(UNI_MAX, k.l | 0)); k.xp = Math.max(0, +k.xp || 0); return k; }
function uniOpen(F){ return townDoneCh(F.ch); }
function uniNeed(l){ return 10 + Math.round(18 * Math.log(l + 1)); }                        /* xp to go from level l to l + 1 */
function uniTier(id){ const l = uniFac(id).l; return l >= 10 ? 3 : l >= 5 ? 2 : 1; }
function uniBonus(F, l){
  if (F.fmt === 'rerolls') return Math.floor(l / 3);
  let v = F.per * l; for (let i = 0; i < 3; i++) if (l >= 5 * (i + 1)) v += F.ms[i]; return v;
}
function uniBonusText(F, l){
  const v = uniBonus(F, l);
  if (F.fmt === 'rerolls') return v ? '+' + v + ' free reroll' + (v > 1 ? 's' : '') + ' each run' : '';
  const p = (v * 100).toFixed(1).replace(/\.0$/, '');
  if (F.id === 'phys') return '-' + p + '% card cooldowns';
  if (F.id === 'space') return '+' + p + '% damage to bosses';
  if (F.id === 'earth') return p + '% chance to dodge a hit';
  return '+' + p + '% ' + F.lbl.toLowerCase();
}
function uniTotal(){ let n = 0; UNI_FAC.forEach(function(F){ n += uniFac(F.id).l; }); return n; }
function uniRankIndex(){ const n = uniTotal(); let r = 0; UNI_RANKS.forEach(function(k, i){ if (n >= k.at) r = i; }); return r; }
function uniIQ(){ return 100 + uniTotal(); }
/* Intelligence: the average faculty level, 0 to 1 (15 in every faculty). Read raw, so asking never writes to a fresh save. It is a stat, not a setting:
   fewer falls off boards and bikes, a slightly kinder fishing bar and fight, and a little less screen shake. */
function intel(){
  const t = (typeof Save !== 'undefined' && Save.data) ? Save.data.town : null, f = t && t.uni && t.uni.fac; if (!f || typeof f !== 'object') return 0;
  let n = 0; UNI_FAC.forEach(function(F){ const k = f[F.id]; n += k && typeof k === 'object' ? Math.max(0, Math.min(UNI_MAX, k.l | 0)) : 0; });
  return n / (UNI_FAC.length * UNI_MAX);
}
function intelPct(){ return Math.round(intel() * 100); }
function uniEnergyMax(){ return UNI_EN_BASE + uniRankIndex() + uniData().lamps; }
function uniEnergy(){                                                                    /* today's energy: it refills at midnight, and never past the most, unless a drink put it there */
  const u = uniData(), today = townDayKey();
  if (u.day !== today){ u.day = today; u.bought = 0; u.en = Math.max(uniEnergyMax(), typeof u.en === 'number' ? Math.min(u.en, uniEnergyMax() * 2) : 0); }
  if (typeof u.en !== 'number' || !isFinite(u.en)) u.en = uniEnergyMax();
  u.en = Math.max(0, Math.min(uniEnergyMax() * 2, Math.round(u.en)));
  return u.en;
}
function uniSpend(n){ const u = uniData(); if (uniEnergy() < n) return false; u.en -= n; Save.write(); return true; }
function uniGainEnergy(n){ const u = uniData(); uniEnergy(); u.en = Math.min(uniEnergyMax() * 2, u.en + n); Save.write(); }

/* ---- xp, levels, rank ---- */
function uniAddXp(id, xp){
  const F = UNI_BY_ID[id], k = uniFac(id), out = { up: 0, milestone: 0, xp: 0 };
  if (!F || k.l >= UNI_MAX || xp <= 0) return out;
  const u = uniData(); let m = 1;
  if (u.buff.xp > 0) m += 0.25;                                                           /* a highlighter or a coffee */
  if (u.buff.flash > 0) m += 0.0;
  xp = Math.max(1, Math.round(xp * m)); out.xp = xp;
  k.xp += xp;
  while (k.l < UNI_MAX && k.xp >= uniNeed(k.l)){
    k.xp -= uniNeed(k.l); k.l++; out.up++;
    if (k.l % 5 === 0) out.milestone = k.l;
  }
  if (k.l >= UNI_MAX) k.xp = 0;
  Save.write();
  if (out.up){ try { recalcStats(); } catch (e) {} uniCheckRank(); }
  return out;
}
function uniCheckRank(){
  const u = uniData(), n = uniTotal(), msgs = [];
  UNI_RANKS.forEach(function(r, i){
    if (!i || n < r.at || u.rk[i]) return; u.rk[i] = 1;
    let txt = 'University rank: ' + r.n + '!';
    if (r.acc) txt += '  ' + townPay({ acc: r.acc });
    if (r.swatch){ townData().found[r.swatch] = 1; txt += '  New coat colour: ' + WARD[UNI_SWATCH[r.swatch]].name; }
    Save.write(); msgs.push(txt);
    if (typeof townToast === 'function') townToast(txt, '#FFE9A0'); try { SFX.transform(); } catch (e) {}
  });
  return msgs;
}
function uniApply(s){
  s.dodge = s.dodge || 0; s.bossDmg = s.bossDmg || 0; s.cdRed = s.cdRed || 0;
  UNI_FAC.forEach(function(F){
    const l = uniFac(F.id).l; if (!l || F.fmt === 'rerolls') return; const v = uniBonus(F, l);
    s[F.key] = (s[F.key] || 0) + v;
  });
  if (uniRankIndex() >= 5) s.uniSlot = 1;
}
function uniRerolls(){ return Math.floor(uniFac('chem').l / 3); }
(function(){
  const a = applyCityStats;
  applyCityStats = function(s){ a(s); try { uniApply(s); } catch (e) {} };
})();

/* ---- the run: dodge, cooldowns, boss damage, rerolls, a fourth card, Eureka ---- */
(function(){
  const hp = hurtPlayer, hs = haste, de = damageEnemy, sr = startRun, ro = rollOffer, cc = chooseCard, mc = maxCards;
  hurtPlayer = function(amount, sx, sy){
    const s = P.stats;
    if (s && s.dodge > 0 && G.state === 'playing' && !G.attract && !P.dead && Math.random() < s.dodge){
      if (!(G.uniDodgeT > G.time - 0.5)){ G.uniDodgeT = G.time; addText(P.x, P.y - 52, 'Dodged!', '#9BE8FF', 16, true); try { sfx('whoosh', 0.1); } catch (e) {} burstParticles(P.x, P.y, 6, '#9BE8FF', 140, 3, { glow: true }); }
      return;
    }
    return hp.call(this, amount, sx, sy);
  };
  haste = function(){ const s = P.stats; return hs() * (s && s.cdRed > 0 ? (1 - Math.min(0.5, s.cdRed)) : 1); };
  damageEnemy = function(e, amount, opts){
    const s = P.stats;
    if (e && e.big && s && s.bossDmg > 0) amount *= 1 + s.bossDmg;
    return de.call(this, e, amount, opts);
  };
  startRun = function(ch, wave, snap){
    const r = sr.apply(this, arguments);
    if (!snap && !G.attract){
      const n = uniRerolls(); if (n > 0) G.rerolls += n;
    }
    return r;
  };
  rollOffer = function(){
    const out = ro.apply(this, arguments), p = UNI_EXTRA_CHOICE[uniRankIndex()];
    if (p > 0 && !G.attract && Math.random() < p){
      const more = ro.apply(this, arguments);
      for (let i = 0; i < more.length; i++){
        const o = more[i];
        if (!out.some(function(x){ return (x.def && o.def && x.def.id === o.def.id) || (x.special && x.special === o.special); })){ o.bright = true; out.push(o); break; }
      }
    }
    return out;
  };
  chooseCard = function(i){
    const o = G.state === 'levelup' && G.offer ? G.offer[i] : null;
    const r = cc.apply(this, arguments);
    if (o && !o.special && !G.attract){
      const p = UNI_EUREKA[uniRankIndex()];
      if (p > 0 && Math.random() < p){
        const pool = P.cards.filter(function(c){ return !c.hidden && !c.def.combo && c.level < 10; });
        if (pool.length){ const c = pool[Math.floor(Math.random() * pool.length)]; takeCard(c.def.id); addText(P.x, P.y - 70, 'Eureka! ' + c.def.name + ' +1', '#FFE27A', 20, true); try { SFX.level(); } catch (e) {} }
      }
    }
    return r;
  };
  maxCards = function(){ const s = P.stats; return mc() + (s && s.uniSlot ? 1 : 0); };
})();

/* ---- the gym's Haste (Spin Bike) now speeds attacks up: its bonus used to be added to hasteMul, which slows them ---- */
(function(){
  if (typeof gymApply !== 'function' || typeof GYM_SKILLS === 'undefined') return;
  gymApply = function(s){
    GYM_SKILLS.forEach(function(S){
      const l = gymSkill(S.id).l; if (!l) return; const v = gymBonus(S, l);
      if (S.key === 'dr') s.dr += v; else if (S.key === 'hasteMul') s.hasteMul *= (1 - v); else s[S.key] += v;
    });
  };
})();

/* ---- the swatches (coat colours) and the accessories that ranks give ---- */
const UNI_SWATCH = {};
(function(){
  [['Graduate Gown', '#2B2F4A', 'uni_grad'], ['Professor Tweed', '#8A7458', 'uni_prof'], ['Chancellor Crimson', '#8E1F3A', 'uni_chan']].forEach(function(w){ WARD_TOWN.push(w); WARD.push({ name: w[0], c: w[1] }); UNI_SWATCH[w[2]] = WARD.length - 1; });
})();

/* ---- the smart giraffe: an IQ chip over the bars in a run (the study cap and her rank), shown once she has studied anything ---- */
(function(){
  const uh = updateHUD;
  updateHUD = function(){
    uh();
    try {
      const n = uniTotal(); let e = document.getElementById('hIQ');
      if (!e){ const bars = document.getElementById('bars'), lo = document.getElementById('loadout'); if (!bars) return; e = document.createElement('div'); e.id = 'hIQ'; e.className = 'uni-iq'; bars.insertBefore(e, lo); }
      const t = n ? 'IQ ' + uniIQ() + '  \u00b7  ' + UNI_RANKS[uniRankIndex()].n : '';
      if (e._t !== t){ e._t = t; e.textContent = t; e.style.display = t ? 'flex' : 'none'; }
    } catch (err) {}
  };
})();
