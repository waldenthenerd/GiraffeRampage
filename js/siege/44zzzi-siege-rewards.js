'use strict';
/* Chapter 15, the Siege: what holding the town pays, and what it builds (the town is in js/siege/44zzzd-siege-town.js, the set pieces in js/siege/44zzzh-siege-events.js). */
/* ========================= STREAKS, RANKS AND BOONS ========================= */
/* STREAKS: each key building counts the waves in a row in which it was never wrecked (G.sg.streak). Its best streak is kept for good (Save.data.siegeBld), and two rewards are paid once
   each: at ten (SG_REWARD tier 1) a permanent gift that belongs to that building, and at twenty-five (tier 2) a hundred gems. The gifts: the Herd Hall, the coat color Hall Crimson;
   the Library, one more card reroll in every run; the Trading Post, five percent off Upgrades; the Lighthouse, sixty gems; Mission Control, fifteen more health to start every run.
   RANKS: the twenty militia giraffes have names (SG_NAMES) and keep their record by name (Save.data.siegeMil: kills and waves survived). The rank is worked out from kills plus six a wave
   (SG_RANKS): a higher rank fires faster, takes less from a hit, and, from Lieutenant, gets up once a wave after going down. She is promoted on the spot and the name shows when the giraffe is near.
   BOONS: after wave 10 and again after wave 20 two boon crates come in at the Square (SG_BOONS); she walks onto one to take it, and the other goes. The pool for the first is the first four,
   for the second the last four. They stay for the rest of the run (G.sg.boons, saved with it). */
const SG_NAMES = ['Ivy', 'Willow', 'Maple', 'Juniper', 'Clover', 'Hazel', 'Briar', 'Sorrel', 'Rowan', 'Tansy', 'Bracken', 'Yarrow', 'Alder', 'Basil', 'Sage', 'Thistle', 'Moss', 'Aspen', 'Dill', 'Poppy'];
const SG_RANKS = [{ n: 'Private', at: 0, rel: 1, hp: 1, rev: false }, { n: 'Corporal', at: 40, rel: 0.92, hp: 1, rev: false }, { n: 'Sergeant', at: 150, rel: 0.85, hp: 1.2, rev: false },
  { n: 'Lieutenant', at: 400, rel: 0.78, hp: 1.3, rev: true }, { n: 'Captain', at: 900, rel: 0.7, hp: 1.5, rev: true }];
const SG_BOONS = {
  repair: { name: 'Mason crews', desc: 'Buildings mend 45 between waves, not 30', pool: 0 },
  drill:  { name: 'Drill sergeants', desc: 'The militia fire a fifth faster', pool: 0 },
  posts:  { name: 'Doubled sandbags', desc: 'Posts wear down 30% slower', pool: 0 },
  hospital: { name: 'Field hospital', desc: 'The militia heal 3 a second on their own', pool: 0 },
  jam:    { name: 'Radio hardening', desc: 'The Warden’s jamming lasts half as long', pool: 1 },
  walls:  { name: 'Reinforced walls', desc: 'Buildings take a quarter less damage', pool: 1 },
  rifle:  { name: 'Heavy rounds', desc: 'Rifles hit bosses four times as hard', pool: 1 },
  chest:  { name: 'War chest', desc: '+300 gold and +10 gems, now', pool: 1 }
};
const SG_BLD_KEYS = ['hall', 'library', 'post', 'lighthouse', 'mission'];
const SG_REWARD = {
  hall: 'the coat color Hall Crimson', library: 'one more card reroll in every run', post: '5% off every Upgrade', lighthouse: '60 gems', mission: '15 more health at the start of every run'
};
function sgHas(id){ return !!(G.sg && G.sg.boons && G.sg.boons.indexOf(id) >= 0); }
function sgBldRec(key){ const d = Save.data; if (!d.siegeBld) d.siegeBld = sanitizeSiegeBld(null); return d.siegeBld[key] || (d.siegeBld[key] = { b: 0, t: 0 }); }
function sgMilRec(name){ const d = Save.data; if (!d.siegeMil) d.siegeMil = {}; return d.siegeMil[name] || (d.siegeMil[name] = { k: 0, w: 0 }); }
function sgRankIdx(name){ const r = sgMilRec(name), x = r.k + 6 * r.w; let i = 0; for (let k = 0; k < SG_RANKS.length; k++) if (x >= SG_RANKS[k].at) i = k; return i; }
function sgRankOf(m){ return SG_RANKS[m.name ? sgRankIdx(m.name) : 0]; }

/* ---- the permanent gifts ---- */
const sgBaseMetaCost = metaCost;
metaCost = function(m, lvl){ const c = sgBaseMetaCost.apply(this, arguments), r = Save.data && Save.data.siegeBld && Save.data.siegeBld.post; return r && r.t >= 1 ? Math.round(c * 0.95) : c; };
const sgBaseStartRun = startRun;
startRun = function(){
  const r = sgBaseStartRun.apply(this, arguments), b = Save.data && Save.data.siegeBld;
  if (b && b.library && b.library.t >= 1) G.rerolls += 1;
  if (b && b.mission && b.mission.t >= 1){ P.bonusHp = (P.bonusHp || 0) + 15; recalcStats(); P.hp = P.maxHp; }
  return r;
};
function sgGrant(key, tier){
  const d = Save.data, name = (SGB[key] && SGB[key].name) || key;
  if (tier === 1){
    if (key === 'lighthouse') d.gems = (d.gems | 0) + 60;
    banner(name.toUpperCase() + ' HELD TEN IN A ROW', 'Reward: ' + SG_REWARD[key], '#F2D488', 3.2);
  } else { d.gems = (d.gems | 0) + 100; banner(name.toUpperCase() + ' UNBROKEN', 'Held twenty-five in a row: +100 gems', '#F2D488', 3.2); }
  SFX.level(); screenFlash('#F2D488', 0.18, 0.4);
}
/* a wave is over: extend every building's streak, or end it, and pay what is owed */
function siegeRewardsWave(){
  const sg = G.sg, cw = chapterWaveOf(G.wave); if (!sg || G.attract) return;
  SG_BLD_KEYS.forEach(function(key){
    const s = SGB[key]; if (!s) return;
    if (sg.wrk[key] || s.wrecked){ sg.streak[key] = 0; return; }
    const n = sg.streak[key] = (sg.streak[key] | 0) + 1, rec = sgBldRec(key);
    if (n > rec.b) rec.b = n;
    if (n === 5 || n === 15) addText(s.b.x + s.b.w / 2, s.b.y - 44, s.name + ': ' + n + ' waves unbroken', '#F2D488', 16, true);
    if (n >= 10 && rec.t < 1){ rec.t = 1; sgGrant(key, 1); }
    if (n >= 25 && rec.t < 2){ rec.t = 2; sgGrant(key, 2); }
  });
  SGM.men.forEach(function(m){ if (m.state !== 'down') sgMilRec(m.name).w++; });
  Save.write();
}

/* ---- the militia ---- */
const sgBaseMilInit = siegeMilitiaInit;
siegeMilitiaInit = function(){
  sgBaseMilInit.apply(this, arguments);
  SGM.men.forEach(function(m, i){ m.name = SG_NAMES[i % SG_NAMES.length]; m.rank = sgRankIdx(m.name); m.usedRev = false; m.kills = 0; });
};
function sgPromote(m){
  const i = sgRankIdx(m.name); if (i <= m.rank) return;
  m.rank = i; addText(m.x, m.y - 46, m.name + ' is now a ' + SG_RANKS[i].n + '!', '#F2D488', 16, true); sfx('pickupS', 0.12, m.x, m.y); burstParticles(m.x, m.y, 10, '#F2D488', 160, 3, { glow: true });
}
const sgBaseMilShot = milShot;
milShot = function(m, e){
  const big = e.big; sgBaseMilShot.apply(this, arguments);
  if (big && !e.dead && sgHas('rifle')){ dmgSrc = 'militia'; damageEnemy(e, e.maxHp * 0.009, { noCrit: true, quiet: true, color: '#FFE9A0' }); }
  if (e.dead && m.name){ sgMilRec(m.name).k++; m.kills++; sgPromote(m); }
};
const sgBaseMilHurt = milHurt;
milHurt = function(m, amt){
  const rk = sgRankOf(m), was = m.state; sgBaseMilHurt.call(this, m, amt / rk.hp);
  if (rk.rev && was !== 'down' && m.state === 'down' && !m.usedRev){ m.usedRev = true; m.state = m.post.abandoned ? 'foot' : 'post'; m.hp = 40; addText(m.x, m.y - 30, m.name + ' gets back up!', '#BFF0A0', 14, true); }
};
const sgBasePostHurt = siegePostHurt;
siegePostHurt = function(post, amt){ return sgBasePostHurt.call(this, post, sgHas('posts') ? amt * 0.7 : amt); };

/* ---- the boons ---- */
function sgOfferBoons(){
  const sg = G.sg; if (!sg || sg.pads) return;
  const pool = Object.keys(SG_BOONS).filter(function(k){ return SG_BOONS[k].pool === sg.boons.length && sg.boons.indexOf(k) < 0; });
  if (pool.length < 2) return;
  const a = pool.splice(Math.floor(Math.random() * pool.length), 1)[0], b = pool.splice(Math.floor(Math.random() * pool.length), 1)[0];
  sg.pads = [a, b].map(function(id, i){ const p = towerOpenNear(2100 + (i ? 190 : -190), 1930); return { id: id, x: p.x, y: p.y }; });
  sgSay([['fern', 'Two crates of kit have come in at the Square. Take one; the other goes back.']]);
}
function sgTakeBoon(pad){
  const sg = G.sg, b = SG_BOONS[pad.id]; sg.boons.push(pad.id); sg.pads = null;
  if (pad.id === 'chest'){ G.bonusGold += 300; G.runGems = (G.runGems | 0) + 10; }
  banner(b.name.toUpperCase(), b.desc, '#F2D488', 3); SFX.level(); burstParticles(pad.x, pad.y, 24, '#F2D488', 260, 5, { glow: true }); addShock(pad.x, pad.y, 200, 0.4, 0, '#F2D488');
}
function sgBoonsDue(cw){ return (cw > 10 ? 1 : 0) + (cw > 20 ? 1 : 0); }
function sgWrap(ctx, text, max){ const ws = text.split(' '), out = []; let c = ''; for (let i = 0; i < ws.length; i++){ const t = c ? c + ' ' + ws[i] : ws[i]; if (ctx.measureText(t).width > max && c){ out.push(c); c = ws[i]; } else c = t; } if (c) out.push(c); return out; }
function sgDrawPad(ctx, p, t){
  const b = SG_BOONS[p.id], pulse = 0.5 + 0.5 * Math.sin(t * 4 + p.x);
  ctx.fillStyle = 'rgba(0,0,0,.3)'; ctx.beginPath(); ctx.ellipse(p.x + 4, p.y + 10, 30, 10, 0, 0, TAU); ctx.fill();
  ctx.strokeStyle = '#F2D060'; ctx.lineWidth = 4; ctx.globalAlpha = 0.4 + 0.5 * pulse; ctx.beginPath(); ctx.arc(p.x, p.y, 46 + 5 * pulse, 0, TAU); ctx.stroke(); ctx.globalAlpha = 1;
  ctx.fillStyle = '#5A4A2E'; ctx.fillRect(p.x - 20, p.y - 18, 40, 34); ctx.fillStyle = '#F2D060'; ctx.fillRect(p.x - 20, p.y - 18, 40, 7); ctx.fillRect(p.x - 4, p.y - 12, 8, 28);
  ctx.textAlign = 'center'; ctx.font = '800 15px ui-sans-serif, "Segoe UI", Roboto, sans-serif';
  const nw = ctx.measureText(b.name).width + 14; ctx.fillStyle = 'rgba(14,12,16,.82)'; ctx.fillRect(p.x - nw / 2, p.y - 56, nw, 22); ctx.fillStyle = '#F2D488'; ctx.fillText(b.name, p.x, p.y - 40);
  ctx.font = '600 13px ui-sans-serif, "Segoe UI", Roboto, sans-serif'; const ls = sgWrap(ctx, b.desc, 150), h = ls.length * 17 + 8;
  ctx.fillStyle = 'rgba(14,12,16,.82)'; ctx.fillRect(p.x - 80, p.y + 26, 160, h); ctx.fillStyle = '#FFF6D8'; for (let i = 0; i < ls.length; i++) ctx.fillText(ls[i], p.x, p.y + 42 + i * 17);
}
const sgBaseGround = drawGroundSiege;
drawGroundSiege = function(ctx, cx, cy, vw, vh){
  sgBaseGround.apply(this, arguments);
  if (!G.sg || !G.sg.pads) return;
  const x0 = cx - vw / 2, y0 = cy - vh / 2, x1 = x0 + vw, y1 = y0 + vh;
  for (let i = 0; i < G.sg.pads.length; i++){ const p = G.sg.pads[i]; if (p.x < x0 - 120 || p.x > x1 + 120 || p.y < y0 - 100 || p.y > y1 + 120) continue; sgDrawPad(ctx, p, G.time); }
};

/* ---- the state of a run ---- */
const sgBaseDefInit = siegeDefenseInit;
siegeDefenseInit = function(){
  sgBaseDefInit.apply(this, arguments);
  const sg = G.sg; sg.boons = (G.sgBoonsRestore || []).slice(); G.sgBoonsRestore = null; sg.pads = null; sg.wrk = {};
  sg.streak = {}; const st = G.sgStreakRestore || {}; SG_BLD_KEYS.forEach(function(k){ sg.streak[k] = clamp(scoreInt(st[k]), 0, 25); }); G.sgStreakRestore = null;
};
const sgBaseWreck = siegeWreck;
siegeWreck = function(s){ sgBaseWreck.apply(this, arguments); if (G.sg && G.sg.wrk) G.sg.wrk[s.b.key] = true; };
const sgBaseStartWave = startWave;
startWave = function(n){
  const r = sgBaseStartWave.apply(this, arguments);
  if (chapterOf(n) === SIEGE_CHAPTER && G.sg && !G.attract){
    G.sg.wrk = {}; SGM.men.forEach(function(m){ m.usedRev = false; });
    if (G.sg.boons.length < sgBoonsDue(chapterWaveOf(n))) sgOfferBoons();               /* a run restored after the choice was due, or one she walked past */
  }
  return r;
};
const sgBaseClear = waveClearFX;
waveClearFX = function(){
  const r = sgBaseClear.apply(this, arguments);
  if (G.chapter === SIEGE_CHAPTER && G.biome === 'siege' && G.sg && !G.attract){
    siegeRewardsWave();
    const cw = chapterWaveOf(G.wave); if (cw === 10 || cw === 20) sgOfferBoons();
  }
  return r;
};

/* ---- every frame ---- */
function siegeRewardsTick(dt){
  if (G.state !== 'playing' || !G.sg || !G.sg.boons) return;
  const bm = sgHas('drill') ? 0.8 : 1;
  for (let i = 0; i < SGM.men.length; i++){
    const m = SGM.men[i]; if (m.state === 'down') continue;
    if (!(G.sg.jam > 0)){ const rm = sgRankOf(m).rel * bm; if (rm < 1) m.reload -= dt * (1 / rm - 1); }
    if (sgHas('hospital') && m.hp < MIL.hp) milHeal(m, 3 * dt);
  }
  if (G.sg.pads && !G.attract){
    const hs = sgHeroes();
    for (let i = 0; i < G.sg.pads.length; i++){ const p = G.sg.pads[i]; for (let h = 0; h < hs.length; h++) if (hyp(hs[h].x - p.x, hs[h].y - p.y) < 52){ sgTakeBoon(p); return; } }
  }
}
const sgBaseBldUpdate = updateBuildings;
updateBuildings = function(dt){ sgBaseBldUpdate.apply(this, arguments); if (G.biome === 'siege' && G.chapter === SIEGE_CHAPTER) siegeRewardsTick(dt); };

/* ---- the name above a giraffe who is close, with her rank in chevrons ---- */
const sgBaseOverlays = drawFeedbackOverlays;
drawFeedbackOverlays = function(ctx){
  sgBaseOverlays.apply(this, arguments);
  if (G.chapter !== SIEGE_CHAPTER || G.biome !== 'siege' || !G.sg || !G.sg.boons || G.attract) return;
  ctx.save(); ctx.textAlign = 'center'; ctx.font = '700 12px ui-sans-serif, "Segoe UI", Roboto, sans-serif';
  for (let i = 0; i < SGM.men.length; i++){
    const m = SGM.men[i]; if (!m.name || hyp(m.x - P.x, m.y - P.y) > 300) continue;
    const sx = (m.x - G.camX) * G.zoom + G.W / 2, sy = (m.y - G.camY) * G.zoom + G.H / 2 - 40 * G.zoom, rk = sgRankIdx(m.name), label = m.name + (rk ? ' ' + '▲'.repeat(rk) : '');
    if (sx < 20 || sx > G.W - 20 || sy < 20 || sy > G.H - 20) continue;
    const w = ctx.measureText(label).width + 10; ctx.fillStyle = 'rgba(14,12,16,.7)'; ctx.fillRect(sx - w / 2, sy - 11, w, 16); ctx.fillStyle = m.state === 'down' ? '#FF9A8A' : rk >= 3 ? '#F2D488' : '#FFF6D8'; ctx.fillText(label, sx, sy + 1);
  }
  ctx.restore();
};
