'use strict';
/* Chapter 15, the Siege: the five key buildings and what happens to them (the town itself is in js/44zzzd-siege-town.js). */
/* ========================= PROTECTING THE TOWN ========================= */
/* Each key building has 100 points. A creature that passes close to a standing one hits it (SIEGE_HIT says how hard, by kind) and goes on; the "hunters" (SIEGE_HUNTERS: the Dozer,
   Sapper, Gnawer and Ram always, a share of the others) do not go for the giraffe at all until she is close: they walk the building's own flow field (siegeField, the same kind
   of map the Tower uses to find her) to the nearest building, hit it three times, and move on to the next. A building at 25 points or less is WRECKED: smoking, and left alone by
   every creature. It is never destroyed, and the militia mend 30 points between waves, so nothing is ever lost for good. A wave in which no building was wrecked is HELD, and
   pays a bonus; every wave held at the end earns the chest, and all 25 is the trophy. State lives in SGB (by building key), reset for each run. */
const SIEGE_BLD = { max: 100, wreck: 25, repair: 30, hitCd: 1.5, reach: 46, hunterHits: 3, hunterCd: 0.9, hunterNear: 300 };
const SIEGE_HIT = { hyena: 1.5, grub: 0.5, jackal: 1, cheetah: 2, warthog: 5, vulture: 1, rhino: 4, baboon: 2, honeybadger: 18, mamba: 1.5, ember: 3, termite: 2, lion: 8, matriarch: 3, buffalo: 15, crocodile: 6, wildfire: 10 };
const SIEGE_HUNTERS = { warthog: 1, honeybadger: 1, termite: 1, buffalo: 1, rhino: 0.7, ember: 0.5, jackal: 0.3, vulture: 0.3, baboon: 0.25, mamba: 0.2, hyena: 0.15, cheetah: 0.15 };
const SGB = {};
const SIEGE_SHORT = { hall: 'HALL', library: 'LIBRARY', post: 'POST', lighthouse: 'LIGHT', mission: 'MISSION' };       /* the names on the row at the top of the screen */
function siegeDefenseInit(){
  Object.keys(SGB).forEach(function(k){ delete SGB[k]; });
  SG.keyList.forEach(function(b){ SGB[b.key] = { b: b, hp: SIEGE_BLD.max, wrecked: false, flash: 0, alert: 0, hurt: 0, smokeT: 0, name: (SG.plan.keys[b.key] || {}).name || b.key, field: null }; });
  G.sg = { held: 0, waves: 0, dip: false, flawless: true, texts: {} };
  SG.keyList.forEach(function(b){ SGB[b.key].field = siegeField(b); });
}
/* how many steps every open cell is from this building: the way a hunter finds it round the other buildings */
function siegeField(b){
  const N = TW_NX * TW_NY, dist = new Uint16Array(N); dist.fill(65535); const bl = TW.blocked, q = new Int32Array(N); let h = 0, t = 0;
  const i0 = Math.max(0, ((b.x - 2 * TW_NAV) / TW_NAV) | 0), i1 = Math.min(TW_NX - 1, ((b.x + b.w + 2 * TW_NAV) / TW_NAV) | 0), j0 = Math.max(0, ((b.y - 2 * TW_NAV) / TW_NAV) | 0), j1 = Math.min(TW_NY - 1, ((b.y + b.h + 2 * TW_NAV) / TW_NAV) | 0);
  for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++){ const c = j * TW_NX + i; if (!bl[c]){ dist[c] = 0; q[t++] = c; } }
  while (h < t){
    const c = q[h++], i = c % TW_NX, j = (c / TW_NX) | 0, dc = dist[c] + 1;
    for (let k = 0; k < 8; k++){
      const a = i + TW_NB[k][0], d = j + TW_NB[k][1]; if (a < 0 || d < 0 || a >= TW_NX || d >= TW_NY) continue;
      const m = d * TW_NX + a; if (bl[m] || dist[m] <= dc) continue;
      if (k >= 4 && (bl[j * TW_NX + a] || bl[d * TW_NX + i])) continue;
      dist[m] = dc; q[t++] = m;
    }
  }
  return dist;
}
function siegeRectDist(b, x, y){ const dx = Math.max(b.x - x, 0, x - (b.x + b.w)), dy = Math.max(b.y - y, 0, y - (b.y + b.h)); return Math.sqrt(dx * dx + dy * dy); }

/* ---- hurting a building ---- */
function siegeHurt(key, amt, src){
  const s = SGB[key]; if (!s || s.wrecked || !(amt > 0)) return;
  const k = 1 + 0.02 * (chapterWaveOf(G.wave) - 1);                       /* the machines get better at it as the night goes on */
  s.hp = Math.max(0, s.hp - amt * k); s.flash = 0.2; s.alert = 3; s.hurt = G.time;
  const b = s.b, cx = clamp(src ? src.x : b.x + b.w / 2, b.x, b.x + b.w), cy = clamp(src ? src.y : b.y + b.h / 2, b.y, b.y + b.h);
  burstParticles(cx, cy, 5, '#C8B8A0', 120, 3, {}); sfx('rustle', 0.2, cx, cy);
  if (!G.sg.texts[key] || G.time - G.sg.texts[key] > 9){ G.sg.texts[key] = G.time; addText(b.x + b.w / 2, b.y - 16, s.name + ' under attack!', '#FF8A6A', 17, true); }
  if (s.hp <= SIEGE_BLD.wreck) siegeWreck(s);
}
function siegeWreck(s){
  s.wrecked = true; G.sg.dip = true; G.sg.flawless = false;
  const b = s.b, cx = b.x + b.w / 2, cy = b.y + b.h / 2;
  for (let i = 0; i < 4; i++) burstParticles(b.x + Math.random() * b.w, b.y + Math.random() * b.h, 8, '#8A8478', 200, 6, {});
  addShock(cx, cy, Math.max(b.w, b.h) * 0.6, 0.4, 0, '#E8723A', { width: 14, filled: true }); addShake(8); sfx('boom', 0.14, cx, cy);
  addText(cx, b.y - 22, s.name + ' is wrecked!', '#FF5A4A', 20, true);
}

/* ---- the creatures ---- */
function siegeOnSpawn(e){
  e.sgHunter = Math.random() < (SIEGE_HUNTERS[e.type] || 0); e.sgDone = {}; e.sgHits = 0; e.sgCd = 0; e.sgTgt = null;
}
function siegePickTarget(e){
  let best = null, bd = 1e9;
  for (const key in SGB){ const s = SGB[key]; if (s.wrecked || e.sgDone[key]) continue; const d = siegeRectDist(s.b, e.x, e.y); if (d < bd){ bd = d; best = s; } }
  return best;
}
function siegeEnemyTick(e, dt){
  if (e.sgCd > 0) e.sgCd -= dt;
  if (e.sgHunter){
    if (!e.sgTgt || e.sgTgt.wrecked || e.sgDone[e.sgTgt.b.key]){ e.sgTgt = siegePickTarget(e); if (!e.sgTgt) e.sgHunter = false; }
  }
  if (e.sgCd > 0) return;
  for (const key in SGB){
    const s = SGB[key]; if (s.wrecked) continue;
    if (siegeRectDist(s.b, e.x, e.y) > e.r + SIEGE_BLD.reach) continue;
    const hit = SIEGE_HIT[e.type] || 1, mine = e.sgHunter && e.sgTgt === s;
    siegeHurt(key, hit, e);
    e.sgCd = mine ? SIEGE_BLD.hunterCd : SIEGE_BLD.hitCd;
    if (e.type === 'honeybadger'){                                      /* the Sapper blows itself up on the wall */
      burstParticles(e.x, e.y, 14, '#FFB070', 220, 5, { glow: true }); addShock(e.x, e.y, 120, 0.3, 0, '#FFB070', { width: 10 });
      damageEnemy(e, 1e15, { noCrit: true, quiet: true }); return;
    }
    if (mine){ e.sgHits++; if (e.sgHits >= SIEGE_BLD.hunterHits){ e.sgDone[key] = 1; e.sgHits = 0; e.sgTgt = null; } }
    return;
  }
}
/* a hunter's way to its building: the next cell down that building's field, or straight at it when it is close; null means "the usual way" */
const siegeBaseSteer = towerSteer;
towerSteer = function(e, tx, ty, dt){
  if (G.biome === 'siege' && e.sgHunter && e.sgTgt && !e.sgTgt.wrecked && !e.def.turret){
    const s = e.sgTgt, pd = hyp(e.x - P.x, e.y - P.y);
    if (pd > SIEGE_BLD.hunterNear){
      if (e.navT > 0){ e.navT -= dt; if (e.navV) return e.navV; }
      e.navT = 0.07 + Math.random() * 0.06;
      const b = s.b, bd = siegeRectDist(b, e.x, e.y);
      let tgx = b.x + b.w / 2, tgy = b.y + b.h / 2;
      if (bd > 70){
        const dist = s.field, bl = TW.blocked; let cur = clamp(e.y / TW_NAV | 0, 0, TW_NY - 1) * TW_NX + clamp(e.x / TW_NAV | 0, 0, TW_NX - 1);
        for (let step = 0; step < 3; step++){
          const i = cur % TW_NX, j = (cur / TW_NX) | 0; let best = -1, bd2 = dist[cur];
          for (let k = 0; k < 8; k++){
            const a = i + TW_NB[k][0], d2 = j + TW_NB[k][1]; if (a < 0 || d2 < 0 || a >= TW_NX || d2 >= TW_NY) continue;
            const m = d2 * TW_NX + a, dm = dist[m]; if (dm >= bd2 || dm === 65535) continue;
            if (k >= 4 && (bl[j * TW_NX + a] || bl[d2 * TW_NX + i])) continue;
            bd2 = dm; best = m;
          }
          if (best < 0) break;
          cur = best; tgx = (cur % TW_NX + 0.5) * TW_NAV; tgy = (((cur / TW_NX) | 0) + 0.5) * TW_NAV;
          if (dist[cur] === 0){ tgx = b.x + b.w / 2; tgy = b.y + b.h / 2; break; }
        }
      }
      const dx = tgx - e.x, dy = tgy - e.y, d = Math.sqrt(dx * dx + dy * dy) || 1;
      return e.navV = [dx / d, dy / d];
    }
  }
  return siegeBaseSteer.apply(this, arguments);
};

/* ---- each frame, each wave ---- */
function siegeTick(dt){
  if (G.state !== 'playing' || !G.sg) return;
  for (const key in SGB){
    const s = SGB[key];
    if (s.flash > 0) s.flash -= dt; if (s.alert > 0) s.alert -= dt;
    s.smokeT -= dt;
    if (s.smokeT <= 0 && fxLevelNow() > 0){
      const b = s.b, pc = s.hp / SIEGE_BLD.max;
      if (s.wrecked){ s.smokeT = 0.12; addParticle(b.x + Math.random() * b.w, b.y + Math.random() * b.h * 0.8, rand(-10, 10), -rand(30, 60), rand(10, 18), rand(1.2, 2), 'rgba(50,44,40,.5)', { drag: 0.6 }); if (Math.random() < 0.5) addParticle(b.x + Math.random() * b.w, b.y + Math.random() * b.h * 0.8, rand(-8, 8), -rand(20, 50), rand(4, 8), 0.6, '#FF8A3A', { glow: true, drag: 1 }); }
      else if (pc < 0.6){ s.smokeT = 0.3 + pc; addParticle(b.x + Math.random() * b.w, b.y + Math.random() * b.h * 0.7, rand(-8, 8), -rand(24, 44), rand(7, 12), rand(0.9, 1.5), 'rgba(80,76,72,.4)', { drag: 0.6 }); }
      else s.smokeT = 1;
    }
  }
  const es = G.enemies;
  for (let i = 0; i < es.length; i++){ const e = es[i]; if (e.dead || !e.def || !e.def.siege || e.untarg) continue; siegeEnemyTick(e, dt); }
}
function siegeWaveStart(n){
  if (!G.sg) return;
  G.sg.dip = false;
  if (n > SIEGE_FIRST_WAVE){
    let mended = false;
    for (const key in SGB){ const s = SGB[key]; const was = s.wrecked; s.hp = Math.min(SIEGE_BLD.max, s.hp + SIEGE_BLD.repair); if (s.hp > SIEGE_BLD.wreck) s.wrecked = false; if (was && !s.wrecked) addText(s.b.x + s.b.w / 2, s.b.y - 18, s.name + ' is back on its feet', '#BFF0A0', 16, false); mended = true; }
    if (mended && !G.attract) addText(P.x, P.y - 84, 'The militia mend the town', '#BFF0A0', 15, false);
  }
}
function siegeWaveEnd(){
  if (!G.sg || G.attract) return;
  const cw = chapterWaveOf(G.wave), all = Object.keys(SGB), standing = all.every(function(k){ return !SGB[k].wrecked; }), held = !G.sg.dip && standing;
  if (held){
    G.sg.held++; const gold = 150 + 10 * cw; G.bonusGold += gold; G.runGems = (G.runGems | 0) + 3;
    addText(P.x, P.y - 84, 'Town held  +' + fmt(gold) + ' gold', '#BFF0A0', 18, true);
  } else addText(P.x, P.y - 84, 'The town took a beating', '#FFB070', 16, false);
  G.sg.waves++;
  if (isChapterFinaleWave(G.wave)){
    const chest = 40 * G.sg.held; if (chest > 0){ G.bonusGold += chest; addText(P.x, P.y - 110, 'The town remembers: ' + G.sg.held + ' of 25 waves held  +' + fmt(chest), '#FFE49A', 17, true); }
    const d = Save.data; if (d){ d.siegeHeldBest = Math.max(d.siegeHeldBest | 0, G.sg.held); if (G.sg.held >= SIEGE_WAVES) d.siegeFlawless = true; Save.write(); }
  }
}
const siegeBaseStartWave = startWave;
startWave = function(n){ if (chapterOf(n) === SIEGE_CHAPTER) siegeWaveStart(n); return siegeBaseStartWave.apply(this, arguments); };
const siegeBaseWaveClear = waveClearFX;
waveClearFX = function(){ if (G.chapter === SIEGE_CHAPTER && G.biome === 'siege') siegeWaveEnd(); return siegeBaseWaveClear.apply(this, arguments); };
const siegeBaseBldUpdate = updateBuildings;
updateBuildings = function(dt){ siegeBaseBldUpdate.apply(this, arguments); if (G.biome === 'siege' && G.chapter === SIEGE_CHAPTER) siegeTick(dt); };

/* ---- pictures: scorch and a health bar on the building, a row of five at the top of the screen, and an arrow at the edge for one under attack ---- */
function sgDrawKeyStatus(ctx, b, t){
  const s = SGB[b.key]; if (!s) return;
  const pc = s.hp / SIEGE_BLD.max;
  if (pc < 0.99){
    ctx.fillStyle = 'rgba(20,16,14,' + ((1 - pc) * 0.5).toFixed(3) + ')'; ctx.fillRect(b.x, b.y, b.w, b.h);                                              /* soot */
    ctx.strokeStyle = 'rgba(20,14,10,.7)'; ctx.lineWidth = 3; ctx.beginPath(); const n = Math.round((1 - pc) * 9);
    for (let i = 0; i < n; i++){ const x = b.x + (0.12 + 0.76 * csR(b.x + i * 7)) * b.w, y = b.y + (0.1 + 0.6 * csR(b.y + i * 11)) * b.h; ctx.moveTo(x, y); ctx.lineTo(x + 22 * (csR(i + 5) - 0.5), y + 18); ctx.lineTo(x + 8 * (csR(i + 9) - 0.5), y + 36); }
    ctx.stroke();
  }
  if (s.flash > 0){ ctx.fillStyle = 'rgba(255,200,150,' + (s.flash * 2).toFixed(2) + ')'; ctx.fillRect(b.x, b.y, b.w, b.h); }
  const bw = Math.max(110, b.w * 0.7), bx = b.x + b.w / 2 - bw / 2, by = b.y - 30;                                                                           /* the bar over it */
  ctx.fillStyle = 'rgba(14,12,16,.75)'; ctx.fillRect(bx - 3, by - 3, bw + 6, 16);
  ctx.fillStyle = s.wrecked ? '#6A2A22' : pc > 0.6 ? '#7AD86A' : pc > 0.4 ? '#E8C84A' : '#E8603A'; ctx.fillRect(bx, by, bw * clamp(pc, 0, 1), 10);
  ctx.fillStyle = 'rgba(255,255,255,.7)'; ctx.fillRect(bx + bw * SIEGE_BLD.wreck / SIEGE_BLD.max - 1, by - 3, 2, 16);                                          /* the line below which it is wrecked */
  ctx.font = '800 14px ui-sans-serif, "Segoe UI", Roboto, sans-serif'; ctx.textAlign = 'center'; ctx.fillStyle = s.wrecked ? '#FF8A6A' : '#FFF6D8'; ctx.fillText(s.wrecked ? s.name + ' (wrecked)' : s.name, b.x + b.w / 2, by - 8);
}
const siegeBaseOverlays = drawFeedbackOverlays;
drawFeedbackOverlays = function(ctx){
  siegeBaseOverlays.apply(this, arguments);
  if (G.chapter !== SIEGE_CHAPTER || G.biome !== 'siege' || !G.sg || G.attract) return;
  const keys = Object.keys(SGB), n = keys.length, W = G.W, pw = clamp((W - 24) / n - 4, 56, 104), ph = 22, x0 = W / 2 - (pw + 4) * n / 2 + 2, y0 = W < 700 && G.H > W ? 120 : 64;       /* below the health bars on a phone held upright */
  ctx.save(); ctx.textAlign = 'center'; ctx.font = '800 11px ui-sans-serif, "Segoe UI", Roboto, sans-serif';
  for (let i = 0; i < n; i++){
    const s = SGB[keys[i]], x = x0 + i * (pw + 4), pc = clamp(s.hp / SIEGE_BLD.max, 0, 1), hot = s.alert > 0 && Math.sin(G.time * 12) > 0;
    ctx.fillStyle = hot ? 'rgba(120,30,20,.85)' : 'rgba(14,12,16,.72)'; ctx.fillRect(x, y0, pw, ph);
    ctx.fillStyle = s.wrecked ? '#6A2A22' : pc > 0.6 ? '#6AC85A' : pc > 0.4 ? '#D8B83A' : '#E0583A'; ctx.fillRect(x + 2, y0 + ph - 7, (pw - 4) * pc, 5);
    ctx.fillStyle = s.wrecked ? '#FF8A6A' : '#FFF6D8'; ctx.fillText(SIEGE_SHORT[keys[i]] || keys[i], x + pw / 2, y0 + 12);
  }
  for (let i = 0; i < n; i++){                                                                                                                              /* an arrow at the edge for a building out of sight that is under attack */
    const s = SGB[keys[i]]; if (!(s.alert > 0) || s.wrecked) continue;
    const b = s.b, sx = (b.x + b.w / 2 - G.camX) * G.zoom + G.W / 2, sy = (b.y + b.h / 2 - G.camY) * G.zoom + G.H / 2;
    if (sx > 30 && sx < G.W - 30 && sy > 30 && sy < G.H - 30) continue;
    const a = Math.atan2(sy - G.H / 2, sx - G.W / 2), ex = clamp(G.W / 2 + Math.cos(a) * G.W, 34, G.W - 34), ey = clamp(G.H / 2 + Math.sin(a) * G.H, 100, G.H - 34);
    ctx.save(); ctx.translate(ex, ey); ctx.rotate(a); ctx.globalAlpha = 0.6 + 0.4 * Math.sin(G.time * 10); ctx.fillStyle = '#FF5A4A'; ctx.beginPath(); ctx.moveTo(14, 0); ctx.lineTo(-8, -10); ctx.lineTo(-8, 10); ctx.closePath(); ctx.fill(); ctx.restore();
    ctx.fillStyle = '#FFD8C8'; ctx.fillText(SIEGE_SHORT[keys[i]] || keys[i], clamp(ex, 40, G.W - 40), clamp(ey + 24, 110, G.H - 10));
  }
  ctx.restore();
}
