'use strict';
/* =============================================================================================================================
   44zzzo-camp.js  --  THE CAMP: rewards that build up while she is away. Once Chapter 2 is cleared the camp starts working; it stores gold, and
   crate progress, at a fixed rate for as long as she is gone, up to a cap (3 hours to begin with), and everything is handed over when she
   presses Collect on the Camp tab (js/ui/44zzzp-camp-page.js).
   THE CLOCK  The device clock, with Save.data.campLast as the moment it was last emptied. A clock set backwards earns nothing (campLast is pulled
     back to now); a clock set far ahead is still held by the cap, so cheating gains at most one cap's worth per Collect. Nothing runs in the background:
     the amount is worked out from the clock whenever a page asks.
   THE RATE  Gold an hour is 0.04% of her best score (at least 60), which is a tenth of what a half-hour run at that score pays; each Busier Hands
     level adds 30% of that. A crate is worked toward at one every 4 hours of storage (at the same rate bonus).
   THE UPGRADES  Two tracks of five levels, bought with gems and opened by chapters: Busier Hands (rate) with Chapters 3, 5, 7, 9 and 11, Bigger Larder
     (cap: 4, 6, 8, 10 and 12 hours) with Chapters 4, 6, 8, 10 and 12. The Camp Hearth trinket, from a Camp Crate, adds an hour and 10%.
   THE CAMP CRATE  A Prime Crate's odds and pity (an epic or better within 8), opened from the crates in store, never bought. Each open has a small
     chance of the Camp Hearth until she has it. It goes through openCrate (js/game/05a-gear-levels.js), so the reveal, levelling and refunds are the gear page's.
   ============================================================================================================================= */
const CAMP_CAPS = [3, 4, 6, 8, 10, 12];                                              /* hours stored, by Bigger Larder level */
const CAMP_RATE_STEP = 0.3;                                                          /* each Busier Hands level adds this to the rate */
const CAMP_GOLD_PER_BEST = 0.0004;                                                   /* gold an hour per point of best score */
const CAMP_MIN_GOLD = 60;
const CAMP_CRATE_HOURS = 4;                                                          /* hours of work for one crate */
const CAMP_TRINKET_CHANCE = 0.03;                                                    /* per crate opened, until she has the Camp Hearth */
const CAMP_UP = {
  rate: { id: 'rate', name: 'Busier Hands', icon: '@t-x-pick', gems: [120, 240, 360, 600, 900], ch: [3, 5, 7, 9, 11],
    desc: function(l){ return 'Gold and crate progress +' + Math.round(l * CAMP_RATE_STEP * 100) + '% an hour'; } },
  cap:  { id: 'cap',  name: 'Bigger Larder', icon: '@t-x-box', gems: [120, 240, 360, 600, 900], ch: [4, 6, 8, 10, 12],
    desc: function(l){ return 'Stores up to ' + CAMP_CAPS[l] + ' hours'; } }
};
CRATES.camp = { id: 'camp', name: 'Camp Crate', cost: 0, weights: { common: 31.9, rare: 42, epic: 20, legendary: 6, mythical: 0.1 },
  blurb: 'Packed by the camp while she was away: a Prime Crate’s odds, and a small chance of the Camp Hearth.' };
CRATE_PITY.camp = { every: 8, floor: 'epic' };
TRINKETS.campfire = { id: 'campfire', name: 'Camp Hearth', icon: '@t-x-campfire', color: '#FF9A3C',
  desc: 'Regenerate 1.2 health per second and gain 6% more experience. The Camp stores one hour more and works 10% faster.',
  source: 'A 3% find in a Camp Crate. Camp Crates come from the Camp, unlocked by Chapter 2.' };

function campUnlocked(){ return !!(Save.data && Save.data.chapter2Complete); }
function campLevel(id){ return Math.min(5, Math.max(0, (Save.data && Save.data[id === 'rate' ? 'campRate' : 'campCap']) | 0)); }
function campHearth(){ return typeof trinketEquipped === 'function' && trinketEquipped('campfire'); }
function campCapHours(){ return CAMP_CAPS[campLevel('cap')] + (campHearth() ? 1 : 0); }
function campRateMul(){ return 1 + CAMP_RATE_STEP * campLevel('rate') + (campHearth() ? 0.1 : 0); }
function campBaseGold(){ return Math.max(CAMP_MIN_GOLD, Math.round(scoreInt(Save.data.best) * CAMP_GOLD_PER_BEST)); }
function campGoldPerHour(){ return Math.round(campBaseGold() * campRateMul()); }
/* the camp opens the first time anything asks after Chapter 2 */
function campStart(now){
  if (!campUnlocked()) return false;
  if (!Save.data.campLast){ Save.data.campLast = now || Date.now(); Save.write(); }
  return true;
}
/* hours stored right now: nothing for a clock that went backwards (the start is pulled back to now), and never more than the cap */
function campHours(now){
  if (!campStart(now)) return 0;
  now = now || Date.now();
  if (Save.data.campLast > now) Save.data.campLast = now;
  return Math.min(campCapHours(), Math.max(0, (now - Save.data.campLast) / 3600000));
}
function campFull(now){ return campHours(now) >= campCapHours() - 1e-9; }
/* what a Collect would hand over: gold, and the crates the work comes to together with what was already worked toward */
function campPending(now){
  const h = campHours(now), mul = campRateMul(), prog = (+Save.data.campProg || 0) + h * mul / CAMP_CRATE_HOURS;
  return { hours: h, gold: Math.floor(h * campBaseGold() * mul), crates: Math.floor(prog), prog: prog - Math.floor(prog) };
}
/* hand it over and start the clock again; the time past the cap is lost, as the cap says */
function campCollect(now){
  if (!campStart(now)) return null;
  now = now || Date.now();
  const p = campPending(now);
  if (p.hours < 1 / 120){ return null; }                                            /* under half a minute: nothing to take */
  Save.data.gold = goldInt(Save.data.gold + p.gold);
  Save.data.campCrates = Math.min(9999, (Save.data.campCrates | 0) + p.crates); Save.data.campProg = Math.min(0.999, p.prog);
  Save.data.campLast = now;
  Save.write();
  return p;
}
/* upgrades: the next level of a track, whether she may buy it and why not */
function campUpNext(id){
  const U = CAMP_UP[id], l = campLevel(id);
  if (l >= 5) return { maxed: true, lv: l };
  const need = U.ch[l], open = !!Save.data['chapter' + need + 'Complete'], cost = U.gems[l];
  return { maxed: false, lv: l, need: need, open: open, cost: cost, can: open && (Save.data.gems | 0) >= cost };
}
function campBuy(id){
  if (!CAMP_UP[id] || !campStart()) return false;
  const nx = campUpNext(id);
  if (nx.maxed || !nx.can){ return false; }
  const stored = campHours();                                                         /* what is stored stays stored: a bigger larder or a faster hand must not change it */
  Save.data.gems -= nx.cost; Save.data[id === 'rate' ? 'campRate' : 'campCap'] = nx.lv + 1;
  if (stored > 0){ Save.data.campLast = Date.now() - stored * 3600000; }
  Save.write(); return true;
}
/* open n crates from the store (all of it or as many as there are): [{piece, rarity, ..., trinket}] like the gear page's, or null */
function campOpen(n){
  if (!campUnlocked() || (typeof gearReveal !== 'undefined' && gearReveal.active)) return null;
  const list = [];
  for (let i = 0; i < n && (Save.data.campCrates | 0) > 0; i++){
    Save.data.campCrates--;
    const res = openCrate('camp');
    if (!res){ Save.data.campCrates++; break; }
    res.trinket = false;
    if (!trinketOwned('campfire') && Math.random() < CAMP_TRINKET_CHANCE){ grantTrinket('campfire'); res.trinket = true; }
    Save.data.campOpened = (Save.data.campOpened | 0) + 1;
    list.push(res);
  }
  if (!list.length) return null;
  Save.write(); return list;
}
