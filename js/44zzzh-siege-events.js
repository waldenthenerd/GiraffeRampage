'use strict';
/* Chapter 15, the Siege: the night's set pieces, the supply crates, the scars the town collects, the bosses' attacks on the buildings, and the radio (the town itself is in js/44zzzd-siege-town.js,
   the buildings' health in js/44zzze-siege-defense.js, the militia in js/44zzzf-siege-militia.js). */
/* ========================= EVENTS, CRATES, SCARS AND THE RADIO ========================= */
/* EVENTS: eight of the ordinary waves are set pieces (SIEGE_EVENTS, by the chapter's own wave number): a Blackout (the lamps go out, a dark ring closes in round her and searchlights sweep
   the streets, with more Spotter Drones in the mix), the Hatch (the glimmer comes up out of the Burrows hatch in the Square, and the crowd is mostly maggots and gnawers), Flyers (only
   the drones, from every side, and the posts have the better angle) and Two fronts (the machines come from the west and the east edge of town in turn). The wave's own table is built
   by buildSiegeWave (js/30e-chapter-siege.js); the set piece reshapes what it made and moves where it arrives (towerSpawnPoint).
   CRATES: each district has a supply crate she can walk over once a wave (SG_CRATES): sandbags in the Market (a building and the posts mended), ammunition at the Harbor (the militia fire
   twice as fast for 25 seconds), a medic in the Park (her health and every giraffe of the militia), floodlights on the Rooftops (everything slowed for 9 seconds) and a missile strike at the
   Launchpad (it lands on the boss, or the thickest part of the crowd). SCARS: the blasts leave craters and scorch on the ground, never on a building, and the houses black and crack and
   start to burn as the night goes on, so the town at wave 25 does not look like the town at wave 1. BOSSES: the Scrap Walker is a hunter and its stomps crack the buildings, the Brood
   Queen puts acid on one, the Hive Carrier bombs one, the Ram's crash into a wall hurts what is near, and the Warden jams the militia's rifles when it changes gear. RADIO: sgSay queues
   lines from the militia's captain, the Elder in the Burrows, Mission Control and the Warden; they show at the foot of the screen, one at a time, and the game goes on behind them. */
const SG_HATCH = { x: 1400 + 1180, y: 1050 + 520 };
const SIEGE_EVENTS = {
  6:  { id: 'night',  name: 'Blackout', line: 'Blackout: the lamps are out, stay near the glow', say: ['The lamps are out. Stay where the militia can see you.'] },
  8:  { id: 'hatch',  name: 'The Hatch', line: 'The glimmer is coming up the Burrows hatch', say: ['The Burrows hatch! Eyes on the Square!'] },
  12: { id: 'flyers', name: 'Drones', line: 'Drones from every side, and the posts have the angle', say: ['Drones overhead. Let the posts take the high ones.'] },
  14: { id: 'fronts', name: 'Two fronts', line: 'They come from the west and the east at once', say: ['Both ends of the road at once. Pick a side and hold it.'] },
  17: { id: 'hatch',  name: 'The Hatch', line: 'The hatch is open again', say: ['It is the hatch again. It keeps pushing up.'] },
  19: { id: 'flyers', name: 'Drones', line: 'The sky fills with drones', say: ['More drones. Count the posts that still have a clear shot.'] },
  21: { id: 'fronts', name: 'Two fronts', line: 'West and east, and nowhere to stand between', say: ['Two fronts again. Do not let them pinch the Square.'] },
  23: { id: 'night',  name: 'Blackout', line: 'The last blackout: the searchlights are sweeping', say: ['Lights out again. They are using the dark.'] }
};
const SG_CRATES = [
  { id: 'market',  x: 2090, y: 590,  name: 'Sandbags',    col: '#E8C84A', tip: 'Sandbags: the worst-hit building and every post mended' },
  { id: 'harbor',  x: 900,  y: 1760, name: 'Ammunition',  col: '#FF9A5A', tip: 'Ammunition: the militia fire twice as fast' },
  { id: 'park',    x: 3500, y: 1240, name: 'Medic',       col: '#8AE890', tip: 'The medic: you and every militia giraffe patched up' },
  { id: 'roofs',   x: 3500, y: 520,  name: 'Floodlights', col: '#9AD8FF', tip: 'Floodlights: everything slowed' },
  { id: 'launch',  x: 3500, y: 2625, name: 'Missile',     col: '#FF5A4A', tip: 'Missile strike inbound' }
];
const SG_LIGHTS = [{ x: 1000, y: 320 }, { x: 3600, y: 320 }, { x: 2100, y: 2800 }, { x: 360, y: 2760 }];       /* the searchlights' towers */
const SG_WHO = { fern: ['Captain Fern', '#F2D488'], elder: ['The Elder', '#C8B0F0'], mc: ['Mission Control', '#8AD0F0'], warden: ['The Warden', '#FF6A5A'] };
const SG_SCAR_MAX = 150;

/* ---- the set pieces ---- */
const siegeEvBaseBuild = buildSiegeWave;
buildSiegeWave = function(w, isBoss){
  const q = siegeEvBaseBuild.apply(this, arguments), ev = isBoss ? null : SIEGE_EVENTS[chapterWaveOf(w)];
  if (!ev) return q;
  if (ev.id === 'flyers'){ q.length = Math.ceil(q.length * 0.8); for (let i = 0; i < q.length; i++) q[i].type = Math.random() < 0.6 ? 'jackal' : 'vulture'; }
  else if (ev.id === 'night'){ for (let i = 0; i < q.length; i++) if (Math.random() < 0.3) q[i].type = 'vulture'; }
  else if (ev.id === 'hatch'){ for (let i = 0; i < q.length; i++){ const r = Math.random(); q[i].type = r < 0.45 ? 'grub' : r < 0.6 ? 'termite' : r < 0.7 ? 'mamba' : q[i].type; } }
  return q;
};
function sgEv(){ return G.sg && G.chapter === SIEGE_CHAPTER && (G.waveState === 'active' || G.waveState === 'intro') ? G.sg.ev : null; }
const siegeEvBaseSpawn = towerSpawnPoint;
towerSpawnPoint = function(){
  const ev = sgEv();
  if (ev === 'hatch'){
    const a = Math.random() * TAU, p = towerOpenNear(SG_HATCH.x + Math.cos(a) * rand(50, 90), SG_HATCH.y + Math.sin(a) * rand(50, 90));
    burstParticles(p.x, p.y, 4, '#BFE86A', 100, 3, { glow: true }); return p;
  }
  if (ev === 'fronts' && TW.floor && TW.floor.vents.length){
    const west = (G.sg.side = (G.sg.side | 0) ^ 1) === 1, vs = TW.floor.vents.filter(function(v){ return west ? v.x < 1500 : v.x > 2700; });
    if (vs.length){ const v = vs[Math.floor(Math.random() * vs.length)]; return towerOpenNear(v.x + rand(-50, 50), v.y + rand(-50, 50)); }
  }
  return siegeEvBaseSpawn.apply(this, arguments);
};
const siegeEvBaseStartWave = startWave;
startWave = function(n){
  const r = siegeEvBaseStartWave.apply(this, arguments);
  if (chapterOf(n) === SIEGE_CHAPTER && G.sg && !G.attract) siegeEventStart(n);
  return r;
};
function siegeEventStart(n){
  const cw = chapterWaveOf(n), ev = SIEGE_EVENTS[cw], sg = G.sg;
  sg.ev = ev ? ev.id : null; sg.fast = 0; sg.flood = 0; sg.jam = 0; sg.side = 0;
  sg.caches.forEach(function(c){ c.ready = true; });
  const bn = G.bannerHold || G.banner; if (ev && bn) bn.sub = ev.line;
  if (ev) sgSay(ev.say.map(function(t){ return ['fern', t]; }));
  if (cw === 1) sgSay([['fern', 'Posts are manned. The herd is sealed down in the Burrows, so there is nobody in the streets but us.'], ['fern', 'Five buildings matter: the Hall, the Library, the Trading Post, the Lighthouse and Mission Control. Do not let them fall.']]);
  if (cw === 25) sgSay([['warden', 'SUBJECT LOCATED. LONGNECK TOWN WILL BE CLEARED.'], ['fern', 'Not today.']]);
}
/* what is said when a wave is cleared */
const SG_STORY = {
  1:  [['fern', 'Supply crates are in every district: sandbags in the Market, ammunition at the Harbor, a medic in the Park, floodlights on the Rooftops, a missile at the Launchpad. They refill every wave.']],
  5:  [['fern', 'That Walker was put together out of human scrap. Look for the red eye on the machines.'], ['elder', 'The glimmer is seeping into the Burrows from below, dear. Watch the hatch in the Square.']],
  10: [['mc', 'We traced their signal. Every machine is calling home to the same place, deep under the waterhole.'], ['fern', 'And the glimmer in those mutants was pumped into them, not grown. Somebody made them.']],
  15: [['fern', 'If a post falls my girls fight on foot. Walk over any that go down and they will get right back up.'], ['elder', 'The little ones keep asking if it is thunder. We tell them yes.']],
  20: [['mc', 'Hive Carrier down. One more heavy signature is inbound, and it is bigger than anything yet.'], ['fern', 'They are not here for the town. They are here for her.']]
};
const siegeEvBaseClear = waveClearFX;
waveClearFX = function(){
  const r = siegeEvBaseClear.apply(this, arguments);
  if (G.chapter === SIEGE_CHAPTER && G.biome === 'siege' && G.sg && !G.attract){ const s = SG_STORY[chapterWaveOf(G.wave)]; if (s) sgSay(s); }
  return r;
};
const siegeEvBaseDefInit = siegeDefenseInit;
siegeDefenseInit = function(){
  siegeEvBaseDefInit.apply(this, arguments);
  const sg = G.sg; sg.scars = []; sg.ev = null; sg.nightA = 0; sg.fast = 0; sg.flood = 0; sg.jam = 0; sg.side = 0; sg.story = []; sg.line = null; sg.tipped = false;
  sg.caches = SG_CRATES.map(function(c){ const p = towerOpenNear(c.x, c.y); return { id: c.id, x: p.x, y: p.y, name: c.name, col: c.col, tip: c.tip, ready: true, flash: 0 }; });
};

/* ---- the radio ---- */
function sgSay(lines){ if (!G.sg || !G.sg.story) return; for (let i = 0; i < lines.length; i++) G.sg.story.push({ who: lines[i][0], text: lines[i][1], t: 0, dur: 2.4 + lines[i][1].length * 0.05 }); }
function sgStoryTick(dt){
  const sg = G.sg; if (sg.line){ sg.line.t += dt; if (sg.line.t >= sg.line.dur) sg.line = null; }
  if (!sg.line && sg.story.length && !G.bossIntro && !G.banner) sg.line = sg.story.shift();
}
function sgDrawStory(ctx){
  const L = G.sg.line; if (!L) return;
  const W = G.W, H = G.H, w = Math.min(W - 24, 660), portrait = W < 700 && H > W, x = W / 2 - w / 2, who = SG_WHO[L.who] || ['Radio', '#FFF6D8'];
  const a = clamp(Math.min(L.t / 0.25, (L.dur - L.t) / 0.4, 1), 0, 1), n = Math.min(L.text.length, Math.floor(L.t * 55));
  ctx.save(); ctx.globalAlpha = a; ctx.font = '600 15px ui-sans-serif, "Segoe UI", Roboto, sans-serif'; ctx.textAlign = 'left';
  const words = L.text.slice(0, n).split(' '), full = L.text.split(' ');                                                      /* lay out the whole line first so the panel does not grow as it types */
  const wrap = function(ws){ const out = []; let c = ''; for (let i = 0; i < ws.length; i++){ const t = c ? c + ' ' + ws[i] : ws[i]; if (ctx.measureText(t).width > w - 28 && c){ out.push(c); c = ws[i]; } else c = t; } if (c) out.push(c); return out; };
  const total = wrap(full).length, shown = wrap(words);
  const h = 30 + total * 20, y = H - h - (portrait ? 210 : 74);
  ctx.fillStyle = 'rgba(14,12,16,.82)'; ctx.fillRect(x, y, w, h); ctx.fillStyle = who[1]; ctx.fillRect(x, y, 4, h);
  ctx.font = '800 12px ui-sans-serif, "Segoe UI", Roboto, sans-serif'; ctx.fillText(who[0].toUpperCase(), x + 14, y + 17);
  ctx.font = '600 15px ui-sans-serif, "Segoe UI", Roboto, sans-serif'; ctx.fillStyle = '#FFF6D8';
  for (let i = 0; i < shown.length; i++) ctx.fillText(shown[i], x + 14, y + 38 + i * 20);
  ctx.restore();
}

/* ---- the crates ---- */
function sgHeroes(){ return (typeof Co !== 'undefined' && Co.on && Co.pl) ? Co.pl.filter(function(h){ return !h.down; }) : [P]; }
function sgCrateTake(c, hero){
  const sg = G.sg; let done = true;
  if (c.id === 'market'){
    let low = null; for (const k in SGB){ if (!low || SGB[k].hp < low.hp) low = SGB[k]; }
    if (low){ low.hp = Math.min(SIEGE_BLD.max, low.hp + 30); if (low.hp > SIEGE_BLD.wreck) low.wrecked = false; addText(low.b.x + low.b.w / 2, low.b.y - 18, low.name + ' patched up', '#BFF0A0', 16, true); }
    SGM.posts.forEach(function(p){ p.hp = Math.min(MIL.postHp, p.hp + 25); if (p.abandoned && p.hp > MIL.abandon){ p.abandoned = false; p.men.forEach(function(m){ if (m.state === 'foot') m.state = 'post'; }); } });
  } else if (c.id === 'harbor'){ sg.fast = 25; }
  else if (c.id === 'park'){
    sgHeroes().forEach(function(h){ h.hp = Math.min(h.maxHp, h.hp + h.maxHp * 0.4); });
    SGM.men.forEach(function(m){ milHeal(m, MIL.hp); });
  } else if (c.id === 'roofs'){ sg.flood = 9; }
  else {                                                                                                                         /* the missile: on the boss, or where the crowd is thickest */
    const es = G.enemies.filter(function(e){ return !e.dead && !e.untarg && e.def && e.def.siege; });
    if (!es.length){ addText(hero.x, hero.y - 70, 'Nothing to hit yet', '#FFD8C8', 15, false); return; }
    let tgt = G.bossAlive && G.boss && !G.boss.dead ? G.boss : null, best = -1;
    if (!tgt){ for (let i = 0; i < es.length && i < 70; i++){ let n = 0; for (let k = 0; k < es.length && k < 70; k++) if (hyp(es[i].x - es[k].x, es[i].y - es[k].y) < 260) n++; if (n > best){ best = n; tgt = es[i]; } } }
    const tx = tgt.x, ty = tgt.y;
    addMarker(tx, ty, 280, 1.0, '#FF5A4A', function(m){
      addShock(m.x, m.y, 320, 0.5, 0, '#FFB070', { width: 16, filled: true }); burstParticles(m.x, m.y, 26, '#FFB070', 320, 6, { glow: true }); addShake(14); sfx('boom', 0.2, m.x, m.y);
      sgScar(m.x, m.y, 150, 'crater');
      const near = enemiesNear(m.x, m.y, 340, []);
      for (let i = 0; i < near.length; i++){ const e = near[i]; if (e.dead || e.untarg || !e.def || !e.def.siege || hyp(e.x - m.x, e.y - m.y) > 280 + e.r) continue; damageEnemy(e, e.big ? e.maxHp * 0.1 : e.hp * 2 + 1, { noCrit: true, quiet: true, color: '#FFB070' }); }
    });
    sfx('whoosh', 0.2); addText(tx, ty - 60, 'Missile inbound!', '#FF8A6A', 18, true);
  }
  c.ready = false; c.flash = 1;
  if (c.id !== 'launch') sfx('pickupS', 0.15, c.x, c.y);
  burstParticles(c.x, c.y, 12, c.col, 200, 4, { glow: true }); addText(c.x, c.y - 50, c.tip, c.col, 16, true);
}
function sgDrawCrate(ctx, c, t){
  const pulse = 0.5 + 0.5 * Math.sin(t * 4 + c.x);
  ctx.fillStyle = 'rgba(0,0,0,.3)'; ctx.fillRect(c.x - 16, c.y - 12, 36, 32);
  if (!c.ready){ ctx.fillStyle = '#5E5A54'; ctx.fillRect(c.x - 18, c.y - 18, 36, 32); ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.fillRect(c.x - 18, c.y - 18, 36, 32); return; }
  ctx.strokeStyle = c.col; ctx.lineWidth = 3; ctx.globalAlpha = 0.35 + 0.4 * pulse; ctx.beginPath(); ctx.arc(c.x, c.y, 38 + 5 * pulse, 0, TAU); ctx.stroke(); ctx.globalAlpha = 1;
  ctx.fillStyle = '#7A5C36'; ctx.fillRect(c.x - 18, c.y - 18, 36, 32); ctx.fillStyle = '#9A7848'; ctx.fillRect(c.x - 18, c.y - 18, 36, 8);
  ctx.fillStyle = c.col; ctx.fillRect(c.x - 4, c.y - 14, 8, 24); ctx.fillRect(c.x - 12, c.y - 6, 24, 8);
  ctx.font = '800 12px ui-sans-serif, "Segoe UI", Roboto, sans-serif'; ctx.textAlign = 'center'; ctx.fillStyle = c.col; ctx.fillText(c.name.toUpperCase(), c.x, c.y - 28);
}

/* ---- scars ---- */
function sgScar(x, y, r, kind){
  const sg = G.sg; if (!sg || !sg.scars || x < 60 || y < 60 || x > ARENA_W - 60 || y > ARENA_H - 60) return;
  if (TW.solid && TW.solid[twCell(x, y)]) return;                                           /* never on a roof */
  for (let i = sg.scars.length - 1; i >= Math.max(0, sg.scars.length - 24); i--){ const s = sg.scars[i]; if (hyp(s.x - x, s.y - y) < r * 0.5) return; }
  sg.scars.push({ x: x, y: y, r: Math.max(18, Math.min(110, r)), k: kind || 'scorch', a: Math.random() * TAU });
  if (sg.scars.length > SG_SCAR_MAX) sg.scars.shift();
}
const siegeEvBaseBlast = hostileBlast;
hostileBlast = function(x, y, r){ if (G.sg && G.chapter === SIEGE_CHAPTER && G.biome === 'siege') sgScar(x, y, r * 0.55, r > 150 ? 'crater' : 'scorch'); return siegeEvBaseBlast.apply(this, arguments); };
const siegeEvBaseWreck = siegeWreck;
siegeWreck = function(s){ siegeEvBaseWreck.apply(this, arguments); const b = s.b; for (let i = 0; i < 5; i++) sgScar(b.x + (i / 4) * b.w, b.y + b.h + 40 + (i % 2) * 30, 50, 'scorch'); };
function sgDrawScars(ctx, x0, y0, x1, y1){
  const ss = G.sg.scars;
  for (let i = 0; i < ss.length; i++){
    const s = ss[i]; if (s.x + s.r < x0 || s.x - s.r > x1 || s.y + s.r < y0 || s.y - s.r > y1) continue;
    ctx.fillStyle = 'rgba(18,14,12,.46)'; ctx.beginPath(); ctx.ellipse(s.x, s.y, s.r, s.r * 0.78, s.a, 0, TAU); ctx.fill();
    ctx.fillStyle = 'rgba(10,8,8,.5)'; ctx.beginPath(); ctx.ellipse(s.x, s.y, s.r * 0.6, s.r * 0.46, s.a, 0, TAU); ctx.fill();
    if (s.k === 'crater'){ ctx.strokeStyle = 'rgba(150,134,110,.55)'; ctx.lineWidth = 4; ctx.beginPath(); ctx.ellipse(s.x, s.y, s.r * 0.78, s.r * 0.6, s.a, 0, TAU); ctx.stroke(); ctx.fillStyle = 'rgba(40,34,28,.55)'; ctx.beginPath(); ctx.ellipse(s.x, s.y, s.r * 0.4, s.r * 0.3, s.a, 0, TAU); ctx.fill(); }
    else { ctx.strokeStyle = 'rgba(8,6,6,.4)'; ctx.lineWidth = 3; ctx.beginPath(); for (let k = 0; k < 5; k++){ const a = s.a + k * 1.26; ctx.moveTo(s.x + Math.cos(a) * s.r * 0.5, s.y + Math.sin(a) * s.r * 0.4); ctx.lineTo(s.x + Math.cos(a) * s.r * 1.05, s.y + Math.sin(a) * s.r * 0.85); } ctx.stroke(); }
  }
}
/* the houses black and crack as the night goes on, and some of them burn */
function sgDrawWear(ctx, x0, y0, x1, y1){
  const cw = chapterWaveOf(G.wave), prog = clamp((cw - 2) / 22, 0, 1); if (prog <= 0) return;
  const hs = (SG.plan || (SG.plan = siegeLayout())).houses;
  for (let i = 0; i < hs.length; i++){
    const b = hs[i]; if (sgHit(b, x0, y0, x1, y1, 20)) continue;
    const h = csR(i + 34000), wear = prog * (0.35 + 0.65 * h);
    ctx.fillStyle = 'rgba(16,12,10,' + (wear * 0.55).toFixed(3) + ')'; ctx.fillRect(b.x, b.y, b.w, b.h);
    if (wear > 0.28){
      ctx.strokeStyle = 'rgba(14,10,8,.6)'; ctx.lineWidth = 2.5; ctx.beginPath(); const n = Math.min(6, Math.round(wear * 8));
      for (let k = 0; k < n; k++){ const px = b.x + (0.1 + 0.8 * csR(i * 9 + k + 34100)) * b.w, py = b.y + (0.1 + 0.6 * csR(i * 9 + k + 34200)) * b.h; ctx.moveTo(px, py); ctx.lineTo(px + 16 * (csR(k + i) - 0.5), py + 14); ctx.lineTo(px + 8 * (csR(k + 3 + i) - 0.5), py + 28); }
      ctx.stroke();
    }
    if (wear > 0.45){ ctx.fillStyle = '#6E665A'; for (let k = 0; k < Math.round(wear * 6); k++){ const rx = b.x + csR(i * 7 + k + 34300) * b.w, s = 5 + csR(i + k + 34400) * 8; ctx.fillRect(rx, b.y + b.h + 4 + csR(k + 34500) * 8, s, s * 0.7); } }
  }
}
function sgFires(dt){
  if (fxLevelNow() <= 0) return;
  const cw = chapterWaveOf(G.wave); if (cw < 8) return;
  const hs = (SG.plan || (SG.plan = siegeLayout())).houses, vr = hyp(G.W / G.zoom, G.H / G.zoom) * 0.5 + 80;
  for (let i = 0; i < hs.length; i++){
    const h = csR(i + 34000); if (h < 0.78 || cw < 8 + (h - 0.78) * 60) continue;
    const b = hs[i], cx = b.x + b.w / 2, cy = b.y + b.h / 2; if (Math.abs(cx - G.camX) > vr + b.w / 2 || Math.abs(cy - G.camY) > vr + b.h / 2) continue;
    if (Math.random() < dt * 5){ const px = b.x + Math.random() * b.w, py = b.y + Math.random() * b.h * 0.8; addParticle(px, py, rand(-8, 8), -rand(30, 60), rand(5, 9), rand(0.5, 0.9), '#FF8A3A', { glow: true, drag: 1 }); }
    if (Math.random() < dt * 2.5) addParticle(b.x + Math.random() * b.w, b.y + Math.random() * b.h * 0.6, rand(-8, 8), -rand(25, 50), rand(9, 15), rand(1.2, 1.9), 'rgba(50,44,40,.45)', { drag: 0.6 });
  }
}
const siegeEvBaseGround = drawGroundSiege;
drawGroundSiege = function(ctx, cx, cy, vw, vh){
  siegeEvBaseGround.apply(this, arguments);
  if (!G.sg || !G.sg.caches) return;
  const x0 = cx - vw / 2, y0 = cy - vh / 2, x1 = x0 + vw, y1 = y0 + vh;
  sgDrawScars(ctx, x0, y0, x1, y1); sgDrawWear(ctx, x0, y0, x1, y1);
  for (let i = 0; i < G.sg.caches.length; i++){ const c = G.sg.caches[i]; if (c.x < x0 - 60 || c.x > x1 + 60 || c.y < y0 - 60 || c.y > y1 + 60) continue; sgDrawCrate(ctx, c, G.time); }
};

/* ---- the bosses and the buildings ---- */
function sgCollateral(x, y, r, amt){ for (const key in SGB){ const s = SGB[key]; if (!s.wrecked && siegeRectDist(s.b, x, y) <= r) siegeHurt(key, amt, { x: x, y: y }); } }
function sgStandingByDist(e){ const out = []; for (const key in SGB){ const s = SGB[key]; if (!s.wrecked) out.push(s); } return out.sort(function(a, b){ return siegeRectDist(a.b, e.x, e.y) - siegeRectDist(b.b, e.x, e.y); }); }
function sgAcidOn(e){                                                                         /* the Brood Queen: acid on the nearest standing building (two once she is at half) */
  const t = sgStandingByDist(e).slice(0, e.p2 ? 2 : 1);
  t.forEach(function(s, i){
    const b = s.b, key = b.key;
    addMarker(b.x + b.w / 2, b.y + b.h / 2, 110, 1.0 + i * 0.2, '#BFFF6A', function(m){ hostileZone(m.x, m.y, 110, 5, e.dmg * 0.12, '#9AE86A'); siegeHurt(key, 9, { x: m.x, y: m.y }); sgScar(m.x, m.y + b.h / 2 + 50, 50, 'scorch'); });
    addText(b.x + b.w / 2, b.y - 40, 'Acid on the ' + s.name + '!', '#BFFF6A', 17, true);
  });
}
function sgBombRun(e){                                                                        /* the Hive Carrier: a bomb on the nearest standing building */
  const s = sgStandingByDist(e)[0]; if (!s) return;
  const b = s.b, key = b.key, dm = e.dmg * 0.5;
  addMarker(b.x + b.w / 2, b.y + b.h / 2, 120, 0.9, '#FF5A4A', function(m){ hostileBlast(m.x, m.y, 120, dm, '#FFB070', { shake: 8, column: true }); siegeHurt(key, 14, { x: m.x, y: m.y }); });
  addText(b.x + b.w / 2, b.y - 40, 'Bombing run on the ' + s.name + '!', '#FF8A6A', 17, true);
}
function siegeJam(sec){ if (!G.sg) return; G.sg.jam = sec; addText(P.x, P.y - 110, 'The Warden jams the militia radios!', '#FF8A6A', 18, true); screenFlash('#8AD0F0', 0.12, 0.3); }

/* ---- every frame ---- */
function siegeEventsTick(dt){
  if (G.state !== 'playing' || !G.sg || !G.sg.caches) return;
  const sg = G.sg;
  if (sg.fast > 0) sg.fast -= dt; if (sg.flood > 0) sg.flood -= dt; if (sg.jam > 0) sg.jam -= dt;
  sg.nightA += ((sgEv() === 'night' ? 1 : 0) - sg.nightA) * Math.min(1, dt * 1.5);
  for (let i = 0; i < SGM.men.length; i++){                                                  /* the ammunition and the jamming act on the militia's reload, after they have counted it down */
    const m = SGM.men[i]; if (m.state === 'down') continue;
    if (sg.jam > 0){ m.reload += dt; if (Math.random() < dt * 3) addParticle(m.x + rand(-10, 10), m.y - 20, 0, -rand(10, 30), rand(2, 3), 0.4, '#9AD8FF', { glow: true }); }
    else if (sg.fast > 0) m.reload -= dt;
  }
  if (sg.flood > 0){ const es = G.enemies; for (let i = 0; i < es.length; i++){ const e = es[i]; if (e.dead || !e.def || !e.def.siege || e.big) continue; e.slowT = Math.max(e.slowT || 0, 0.3); e.slowMul = Math.min(e.slowMul === undefined ? 1 : e.slowMul, 0.5); } }
  const hs = sgHeroes();
  for (let i = 0; i < sg.caches.length; i++){
    const c = sg.caches[i]; if (c.flash > 0) c.flash -= dt;
    if (!c.ready || G.attract) continue;
    for (let h = 0; h < hs.length; h++) if (hyp(hs[h].x - c.x, hs[h].y - c.y) < 46){ sgCrateTake(c, hs[h]); break; }
  }
  sgStoryTick(dt); sgFires(dt);
}
const siegeEvBaseBldUpdate = updateBuildings;
updateBuildings = function(dt){ siegeEvBaseBldUpdate.apply(this, arguments); if (G.biome === 'siege' && G.chapter === SIEGE_CHAPTER) siegeEventsTick(dt); };

/* ---- the dark, the searchlights, and the radio on top ---- */
const siegeEvBaseOverlays = drawFeedbackOverlays;
drawFeedbackOverlays = function(ctx){
  siegeEvBaseOverlays.apply(this, arguments);
  if (G.chapter !== SIEGE_CHAPTER || G.biome !== 'siege' || !G.sg || !G.sg.caches || G.attract) return;
  const sg = G.sg, a = sg.nightA;
  if (a > 0.01){
    const W = G.W, H = G.H, sx = (P.x - G.camX) * G.zoom + W / 2, sy = (P.y - G.camY) * G.zoom + H / 2, R = Math.max(W, H);
    const g = ctx.createRadialGradient(sx, sy, 70 * G.zoom, sx, sy, R * 0.6); g.addColorStop(0, 'rgba(4,6,22,0.12)'); g.addColorStop(0.35, 'rgba(4,6,22,' + (0.62 * a).toFixed(3) + ')'); g.addColorStop(1, 'rgba(4,6,22,' + (0.88 * a).toFixed(3) + ')');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; const t = G.time;
    for (let i = 0; i < SG_LIGHTS.length; i++){                                               /* the searchlights, sweeping */
      const L = SG_LIGHTS[i], lx = (L.x - G.camX) * G.zoom + W / 2, ly = (L.y - G.camY) * G.zoom + H / 2, ang = i * 1.7 + Math.sin(t * 0.5 + i * 2) * 1.1, len = 1100 * G.zoom;
      if (lx < -len || lx > W + len || ly < -len || ly > H + len) continue;
      const gg = ctx.createRadialGradient(lx, ly, 10, lx, ly, len); gg.addColorStop(0, 'rgba(210,230,255,' + (0.32 * a).toFixed(3) + ')'); gg.addColorStop(1, 'rgba(210,230,255,0)');
      ctx.fillStyle = gg; ctx.beginPath(); ctx.moveTo(lx, ly); ctx.arc(lx, ly, len, ang - 0.09, ang + 0.09); ctx.closePath(); ctx.fill();
    }
    for (const key in SGB){                                                                    /* a warm glow on every building worth saving */
      const b = SGB[key].b, bx = (b.x + b.w / 2 - G.camX) * G.zoom + W / 2, by = (b.y + b.h / 2 - G.camY) * G.zoom + H / 2, r = Math.max(b.w, b.h) * G.zoom * 0.9;
      if (bx < -r || bx > W + r || by < -r || by > H + r) continue;
      const gg = ctx.createRadialGradient(bx, by, 6, bx, by, r); gg.addColorStop(0, 'rgba(255,200,110,' + (0.3 * a).toFixed(3) + ')'); gg.addColorStop(1, 'rgba(255,200,110,0)'); ctx.fillStyle = gg; ctx.fillRect(bx - r, by - r, r * 2, r * 2);
    }
    ctx.restore();
  }
  sgDrawStory(ctx);
};
