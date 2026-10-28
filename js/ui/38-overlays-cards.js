'use strict';
/* DOM handles, card presentation, offer generation, overlay helper. */
/* ========================= 31. DOM HANDLES ========================= */
const stage = document.getElementById('stage');
/* an opaque canvas: the browser does not have to blend the game with the page behind it, which is a free saving on weak devices.
   render() paints the page color (STAGE_BG, the same as --night in the stylesheet) first, so nothing looks different */
const STAGE_BG = '#14100E';
const CTX = stage ? (stage.getContext('2d', { alpha: false }) || stage.getContext('2d')) : null;
const OV = document.getElementById('overlay');
const HUD = document.getElementById('hud');
const TOUCH = document.getElementById('touch');
const JOY = document.getElementById('joy');
const KICKBTN = document.getElementById('kickbtn');
const SLOWBTN = document.getElementById('slowbtn');
const PAUSEBTN = document.getElementById('pausebtn');
const el = id => document.getElementById(id);

/* ========================= 32. CARD PRESENTATION ========================= */
const STAT_LABEL = {
  dmg:'Damage', dps:'Damage per second', hp:'Max health', count:'Projectiles', chains:'Jumps',
  arms:'Arms', rings:'Rings', beams:'Beams', maxMines:'Mines at once', rad:'Blast radius',
  range:'Weapon range', len:'Reach', width:'Width', cd:'Cooldown', dur:'Duration',
  echo:'Extra strikes',
  haste:'Attack speed', crit:'Critical chance', critMul:'Critical damage', dr:'Damage reduction',
  xp:'Experience', gold:'Gold earned', pickup:'Pickup range', spd:'Move speed', trail:'Trail damage',
  aura:'Aura damage', blast:'Burst damage', chance:'Burst chance', regen:'Health per second',
  reflect:'Damage reflected', drop:'Drop rate', nugget:'Nugget chance', pierce:'Pierce',
  stun:'Stun', bleed:'Bleed', thick:'Sweep width', spin:'Spin speed', jump:'Jump range',
  strikes:'Sky strikes', size:'Thorn size', pull:'Pull strength', meteors:'Falling stars'
};
const DELTA_ORDER = ['dmg','dps','hp','count','meteors','echo','chains','arms','rings','beams','maxMines','strikes',
  'rad','len','range','width','thick','cd','dur','haste','crit','critMul','dr','regen','reflect',
  'xp','gold','pickup','drop','nugget','spd','trail','aura','blast','chance','pierce','stun','bleed','spin','jump','pull','size'];
const SECONDS = { cd:1, dur:1, stun:1 };

function fmtStat(def, k, v){
  if (def.pct && def.pct.indexOf(k) >= 0) return Math.round(v * 100) + '%';
  if (SECONDS[k]) return (Math.round(v * 100) / 100) + 's';
  return Math.abs(v) < 10 ? (Math.round(v * 10) / 10) : Math.round(v);
}
function deltaLines(def, lv){
  if (lv >= 10) return [];
  const a = def.stats(lv), b = def.stats(lv + 1);
  const out = [];
  for (let i = 0; i < DELTA_ORDER.length && out.length < 3; i++){
    const k = DELTA_ORDER[i];
    if (typeof a[k] !== 'number' || typeof b[k] !== 'number') continue;
    if (Math.abs(a[k] - b[k]) < 1e-6) continue;
    if (!STAT_LABEL[k] || (def.hideStats && def.hideStats.indexOf(k) >= 0)) continue;
    out.push(STAT_LABEL[k] + ' ' + fmtStat(def, k, a[k]) + ' \u2192 ' + fmtStat(def, k, b[k]));
  }
  return out;
}
function pipsHTML(lv, nextLv){
  let h = '<div class="pips">';
  for (let i = 1; i <= 10; i++){
    const gate = (i === 5 || i === 10);
    const on = i <= lv;
    const isNext = gate && nextLv === i;
    h += '<span class="pip' + (gate ? ' gate' : '') + (on ? ' on' : '') + (isNext ? ' next' : '') + '"></span>';
  }
  return h + '</div>';
}
function rarityClass(rarity){
  if (rarity === 'combo') return 'evolve';
  return rarity === 'legendary' ? 'legendary' : rarity === 'epic' ? 'epic' : rarity === 'rare' ? 'rare' : '';
}
function rarityLabel(def, lv, isNew){
  if (def.combo) return isNew ? { cls: 'evolve', txt: 'New combo card' } : lv + 1 >= 3 ? { cls: 'evolve', txt: 'Special upgrade' } : { cls: 'evolve', txt: 'Combo level ' + lv + ' to ' + (lv + 1) };
  if (isNew) return { cls: rarityClass(def.rarity), txt: 'New ' + def.rarity + ' card' };
  if (lv + 1 === 5 || lv + 1 === 10) return { cls: 'evolve', txt: lv + 1 === 10 ? 'Final transformation' : 'Transforms now' };
  return { cls: rarityClass(def.rarity), txt: 'Level ' + lv + ' to ' + (lv + 1) };
}

/* ========================= 33. OFFER GENERATION ========================= */
function rollOffer(){
  const luck = metaLevel('deck') * 0.14;
  const pool = [];
  for (let i = 0; i < CARDS.length; i++){
    const def = CARDS[i];
    const inst = ownedCard(def.id);
    if (inst && inst.level >= 10) continue;
    if (!inst && visibleCards().length >= maxCards()) continue;
    if (!inst && def.minChapter && G.chapter < def.minChapter) continue;       /* some cards only turn up deep in the game */
    if (!inst && def.cityCard && cityLevel('c_card') < 1) continue;            /* and one has to be bought in the City first */
    if (!inst && def.marsCard && !marsHas('m_card')) continue;                  /* and one at the Mars outpost */
    let w = def.rarity === 'common' ? 10 : def.rarity === 'rare' ? 5.5 : def.rarity === 'epic' ? 3 : 0.45;
    if (def.rarity === 'rare' || def.rarity === 'epic') w *= (1 + luck);
    if (def.rarity === 'legendary') w *= (1 + metaLevel('starcharm'));
    if (inst) w *= 1.3;
    if (inst && (inst.level === 4 || inst.level === 9)) w *= 2.8;
    pool.push({ def: def, inst: inst, w: w });
  }
  const combos = comboOffers(); for (let i = 0; i < combos.length; i++) pool.push({ def: combos[i], inst: null, w: 16 });      /* unlocked combos whose parts are both maxed */
  for (let i = 0; i < P.cards.length; i++){ const c = P.cards[i]; if (c.def.combo && !c.hidden && c.level < 3) pool.push({ def: c.def, inst: c, w: c.level === 2 ? 14 : 10 }); }     /* and the combos she already has, up to level 3 */
  const out = [];
  while (out.length < 3 && pool.length){
    let total = 0;
    for (let i = 0; i < pool.length; i++) total += pool[i].w;
    let r = Math.random() * total, idx = 0;
    for (let i = 0; i < pool.length; i++){ r -= pool[i].w; if (r <= 0){ idx = i; break; } }
    out.push(pool[idx]);
    pool.splice(idx, 1);
  }
  const specials = [
    { special:'heal', icon:'@t-x-grass', name:'Field Graze', desc:'Tear into a patch of good grass and recover 40% of your health right now.' },
    { special:'vigour', icon:'@t-x-skin', name:'Second Skin', desc:'Put on condition. Adds 25 to your maximum health for the rest of the run, and heals it too.' },
    { special:'gold', icon:'@t-coin', name:'Buried Hoard', desc:'Hoof up a cache of old coins. Adds 40 gold to whatever this run pays out.' }
  ];
  let si = 0;
  while (out.length < 3 && si < specials.length) out.push(specials[si++]);
  return out;
}

/* ========================= 34. OVERLAY SCREENS ========================= */
let lastOvKey = '';
function setOverlay(html, clear){
  const keep = Nav.on ? Nav.sig(document.activeElement) : null, keepRect = keep && document.activeElement ? document.activeElement.getBoundingClientRect() : null;
  const ovKey = G.state + '|' + (G.subScreen || '') + '|' + (G.venusScreen ? 1 : 0) + (G.marsScreen ? 1 : 0) + (G.labScreen ? 1 : 0) + (clear ? 1 : 0);
  const entering = ovKey !== lastOvKey;
  OV.innerHTML = html;
  OV.className = 'on' + (clear ? ' clear' : '') + (entering ? ' enter' : '');
  lastOvKey = ovKey;
  overlayPolish(entering);
  const onTab = OV.querySelector('.tabs .tab.on'); if (onTab && onTab.scrollIntoView){ try { onTab.scrollIntoView({ block: 'nearest', inline: 'center' }); } catch (e) {} }
  if (keep) Nav.restore(keep, entering ? null : keepRect);                                  /* the same screen drawn again: if that button is gone, the nearest one */
}
function hideOverlay(){ lastOvKey = ''; overlayLeave(); }       /* fades out (44b-feedback.js) */


