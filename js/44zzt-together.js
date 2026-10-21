'use strict';
/* Play together: two giraffes on one screen, just for fun. */
/* ========================= 44zzt. PLAY TOGETHER ========================= */
/* A "Play together" button on the main menu starts one of two games for two giraffes on one device:
     ARENA  the real creatures of a chapter's backdrop come in rounds; the two giraffes fight them side by side. A giraffe that is knocked down is
            helped up by standing next to her friend for two seconds. There is no wave 25 and no boss, and a round gets a little harder each time.
     YARD   a kick-about: a field, a ball and two goals, first to five.
   Nothing is kept. The real save is put to one side for the length of the game (Save.data is a fresh, empty save, with only the coat colours and
   hats copied over so she looks like herself), Save.write does nothing, and the real save comes back untouched when the game ends: no points, no
   gold, no experience, no cards, no best wave, no bestiary entries, no achievements.
   HOW IT USES THE RUN. A normal run is started (so the backdrop, scenery, light, weather, creatures and effects are all the real ones) and these
   things are taken over: the world update is called as usual, but the giraffe's own update, kick, waves, experience and game over are replaced
   (updatePlayer, doKick, updateWaves, gainXP, gameOver). The two giraffes are Co.pl[0] and Co.pl[1]. P (the run's giraffe) stays as a "shell" at
   the middle between them, so the camera follows the pair and creatures' aim lands between them. Whatever needs P to be the giraffe (a kick, a hit
   from a creature or a shot, drawing her) is done with coSwap(): the per-giraffe fields of P and of the record trade places for the length of
   the call, so the whole of doKick, hurtPlayer and drawPlayer work for either giraffe without being rewritten.
   Controls: giraffe 1 is WASD (the keys in Settings) with Space, or the mouse button, to kick; giraffe 2 is the arrow keys with Enter. Gamepads:
   with two, the first drives giraffe 1 and the second giraffe 2; with one, it drives giraffe 2. Auto-kick in Settings kicks for both. */
const CO_SW = ['x', 'y', 'vx', 'vy', 'face', 'aim', 'walk', 'hp', 'maxHp', 'invuln', 'hurtT', 'kickCd', 'kickAnim', 'dead', 'rage', 'regenAcc'];
const CO_CHAPTERS = [1, 2, 3, 5];                   /* the backdrops that need nothing special (no water, buildings or space) */
const CO_ROUND_WAVES = [1, 2, 3, 4, 6, 7, 8, 9];     /* the waves of the chapter a round is built from (no boss waves) */
/* without cards or experience the pair are weaker than a real run's giraffe: a third as many creatures, with a third of the health and a third of the damage */
const CO_EASE = 3;
const CO_P2 = { name: 'Blue', coat: '#8FB4E0', spot: '#3E5C96', dark: '#6C92C4' };
const CO_YARD = { w: 1700, h: 960, goal: 280, win: 5 };
const Co = {
  on: false, mode: '', chapter: 1, pl: [], real: null, cur: null, drawing: 0, t: 0,
  round: 0, queue: [], spawnT: 0, calm: 0, over: false, pick: 1,
  ball: null, score: [0, 0], goalT: 0, winT: 0, yard: null,
  mid: { x: 0, y: 0 }
};

/* the later the chapter, the tougher its creatures, and the pair have no cards: so they start a little tougher themselves */
function coHpBase(){ return 120 + 30 * (Co.chapter - 1); }
function coDmgMul(){ return 1 + 0.25 * (Co.chapter - 1) + 0.07 * Math.max(0, Co.round - 1); }
function coRec(i){
  return { idx: i, name: i ? CO_P2.name : 'Gold', x: 0, y: 0, vx: 0, vy: 0, face: 0, aim: 0, walk: 0, hp: 120, maxHp: 120, invuln: 0, hurtT: 0,
    kickCd: 0, kickAnim: 0, dead: false, rage: 0, regenAcc: 0, down: false, reviveT: 0, padStart: false };
}
function coSwap(r){ for (let i = 0; i < CO_SW.length; i++){ const f = CO_SW[i], t = P[f]; P[f] = r[f]; r[f] = t; } }
/* run fn with giraffe r standing in for P */
function coAs(r, fn){ const was = Co.cur; coSwap(r); Co.cur = r; try { return fn(); } finally { Co.cur = was; coSwap(r); } }

/* ---------------- a game that keeps nothing ---------------- */
function coRealSave(){ return Co.real || Save.data; }
function coMakeFresh(real){
  const f = freshSave();
  ['skinCol', 'spotCol', 'patCol', 'gearCol', 'mini', 'town', 'wardSeen'].forEach(function(k){ if (real && real[k] !== undefined) f[k] = JSON.parse(JSON.stringify(real[k])); });
  f.hintsSeen = {}; Object.keys(HINTS).forEach(function(k){ f.hintsSeen[k] = 1; });                  /* no first-time hints over the game */
  for (let i = 1; i <= TOTAL_CHAPTERS; i++) if (real && real['chapter' + i + 'Complete']) f['chapter' + i + 'Complete'] = true;      /* the coat colours she has earned stay available */
  return f;
}
function coChapters(){ const real = coRealSave(), out = []; for (let i = 0; i < CO_CHAPTERS.length; i++){ const c = CO_CHAPTERS[i]; if (c <= 1 || (real && real['chapter' + (c - 1) + 'Complete'])) out.push(c); } return out; }

function coStart(mode, chapter){
  if (Co.on) coEnd(true);
  const list = coChapters();
  Co.mode = mode === 'yard' ? 'yard' : 'arena';
  Co.chapter = mode === 'yard' ? 1 : (list.indexOf(chapter) >= 0 ? chapter : 1);
  Co.real = Save.data; Co.on = true;
  Save.data = coMakeFresh(Co.real);
  startRun(Co.chapter);
  G.introFX = null; G.banner = null; G.bannerHold = null; G.waveState = 'idle'; G.spawnQueue = []; G.wave = (Co.chapter - 1) * WAVES_PER_CHAPTER + 1;
  G.revives = 0; G.rerolls = 0; G.pendingLevels = 0; G.levelGate = 0; G.offer = null; G.attract = false;
  G.enemies.length = 0; G.pickups.length = 0;
  Co.t = 0; Co.round = 0; Co.queue = []; Co.spawnT = 0; Co.calm = 0; Co.over = false; Co.cur = null; Co.drawing = 0;
  Co.score = [0, 0]; Co.goalT = 0; Co.winT = 0; Co.ball = null; Co.yard = null;
  Co.pl = [coRec(0), coRec(1)];
  const cx = ARENA_W / 2, cy = ARENA_H / 2;
  Co.pl[0].x = cx - 60; Co.pl[1].x = cx + 60; Co.pl[0].y = Co.pl[1].y = cy; Co.pl[0].face = 0; Co.pl[1].face = Math.PI; Co.pl[0].aim = 0; Co.pl[1].aim = Math.PI;
  Co.pl.forEach(function(r){ r.maxHp = r.hp = coHpBase(); r.invuln = 1; });
  if (Co.mode === 'yard'){
    Co.yard = { x0: cx - CO_YARD.w / 2, x1: cx + CO_YARD.w / 2, y0: cy - CO_YARD.h / 2, y1: cy + CO_YARD.h / 2, cy: cy };
    Co.pl[0].x = Co.yard.x0 + CO_YARD.w * 0.3; Co.pl[1].x = Co.yard.x1 - CO_YARD.w * 0.3;
    coBallReset(0);
    banner('KICK-ABOUT', 'First to ' + CO_YARD.win + ' goals', '#F2B33D', 2.0);
  } else {
    coNextRound();
  }
  coShell();
  HUD.classList.remove('on'); PAUSEBTN.classList.remove('on'); TOUCH.classList.remove('on');
}
/* back to the real save and the menu */
function coEnd(quiet){
  if (!Co.on) return;
  Co.on = false; Co.cur = null; Co.drawing = 0;
  if (Co.real){ Save.data = Co.real; Co.real = null; }
  resetWorld(); G.state = 'menu'; G.attract = true; G.subScreen = ''; G.deathFX = null; G.slowmo = null; G.banner = null; G.hitstop = 0;
  P.x = ARENA_W / 2; P.y = ARENA_H / 2; P.vx = P.vy = 0; P.invuln = 0; P.hurtT = 0; P.dead = false; P.kickCd = 0; P.kickAnim = 0;
  try { recalcStats(); P.hp = P.maxHp; } catch (e) {}
  Co.pl = []; Co.ball = null; Co.queue = [];
  if (!quiet) showMenu();
}

/* ---------------- input ---------------- */
function coPads(){
  const out = [];
  try { const g = navigator.getGamepads ? navigator.getGamepads() : []; for (let i = 0; i < g.length; i++) if (g[i] && g[i].connected) out.push(g[i]); } catch (e) {}
  return out;
}
function coInput(i, pads){
  const k = Input.keys; let x, y, kick;
  if (i === 0){
    x = (k[keyOf('right')] ? 1 : 0) - (k[keyOf('left')] ? 1 : 0); y = (k[keyOf('down')] ? 1 : 0) - (k[keyOf('up')] ? 1 : 0);
    kick = !!(k[keyOf('kick')] || Input.mdown);
  } else {
    x = (k.ArrowRight ? 1 : 0) - (k.ArrowLeft ? 1 : 0); y = (k.ArrowDown ? 1 : 0) - (k.ArrowUp ? 1 : 0);
    kick = !!(k.Enter || k.NumpadEnter || k.ShiftRight || k.Numpad0);
  }
  const gp = pads.length >= 2 ? pads[i] : (i === 1 ? pads[0] : null);
  if (gp){
    const dz = function(v){ return Math.abs(v) < 0.22 ? 0 : v; }, b = function(n){ const q = gp.buttons[n]; return !!(q && (q.pressed || q.value > 0.5)); };
    x += dz(gp.axes[0] || 0) + (b(15) ? 1 : 0) - (b(14) ? 1 : 0); y += dz(gp.axes[1] || 0) + (b(13) ? 1 : 0) - (b(12) ? 1 : 0);
    if (b(0) || b(5) || b(7)) kick = true;
  }
  const m = hyp(x, y);
  if (m > 1){ x /= m; y /= m; }
  return { x: x, y: y, m: Math.min(1, m), kick: kick };
}
/* the kick while standing in for P: the swing finds its own target */
function coKickNow(r){
  if (P.kickCd > 0) return false;
  if (Co.mode === 'yard' && Co.ball){ const bd = hyp(Co.ball.x - P.x, Co.ball.y - P.y); if (bd < 190) P.aim = Math.atan2(Co.ball.y - P.y, Co.ball.x - P.x); }
  const had = P.kickAnim; doKick();
  if (Co.mode === 'yard' && Co.ball && P.kickAnim > had) coBallKick(r);
  return true;
}

/* ---------------- the two giraffes ---------------- */
function coBounds(){
  if (Co.mode === 'yard' && Co.yard) return { x0: Co.yard.x0 - 110, x1: Co.yard.x1 + 110, y0: Co.yard.y0 - 50, y1: Co.yard.y1 + 50 };
  return { x0: 26, x1: ARENA_W - 26, y0: 26, y1: ARENA_H - 26 };
}
function coMove(r, inp, dt){
  const s = P.stats, spd = 216 * s.speedMul, accel = (inp.m > 0 ? 14 : 11) * dt, bd = coBounds();
  P.vx = lerp(P.vx, inp.x * spd, Math.min(1, accel)); P.vy = lerp(P.vy, inp.y * spd, Math.min(1, accel));
  P.x = clamp(P.x + P.vx * dt, bd.x0, bd.x1); P.y = clamp(P.y + P.vy * dt, bd.y0, bd.y1);
  if (G.buildings && G.buildings.length) resolveBuildings(P, P.r * 0.8);
  const moving = hyp(P.vx, P.vy);
  P.walk += dt * (2.5 + moving * 0.034);
  if (moving > 12) P.face = Math.atan2(P.vy, P.vx);
  const t = Co.mode === 'arena' ? nearestEnemy(P.x, P.y, 640) : null;
  if (t) P.aim = Math.atan2(t.y - P.y, t.x - P.x); else if (moving > 12) P.aim = P.face;
  if (P.kickCd > 0) P.kickCd -= dt;
  if (P.kickAnim > 0) P.kickAnim -= dt;
  if (P.invuln > 0) P.invuln -= dt;
  if (P.hurtT > 0) P.hurtT -= dt;
}
function coStepGiraffe(r, dt, pads){
  const inp = coInput(r.idx, pads);
  coAs(r, function(){
    coMove(r, inp, dt);
    let kick = inp.kick;
    if (!kick && Settings.autoKick && Co.mode === 'arena'){ const t = nearestEnemy(P.x, P.y, 150); if (t) kick = true; }
    if (kick) coKickNow(r);
  });
}
function coRevive(r, hpFrac){
  r.down = false; r.dead = false; r.hp = Math.max(1, Math.round(r.maxHp * hpFrac)); r.reviveT = 0; r.invuln = 2; r.hurtT = 0;
  addShock(r.x, r.y, 220, 0.5, 0, '#8FE0A0', { width: 14, kb: 360 });
  burstParticles(r.x, r.y, 14, '#8FE0A0', 200, 4, { glow: true }); addText(r.x, r.y - 40, 'Back up!', '#8FE0A0', 17, false); sfx('wave', 0.2);
}
function coDown(r){
  r.down = true; r.dead = true; r.hp = 0; r.vx = r.vy = 0; r.reviveT = 0; r.hurtT = 1;
  burstParticles(r.x, r.y, 12, '#CF4433', 220, 4); addText(r.x, r.y - 40, 'Down! Help her up', '#FFB89A', 16, false);
}
function coHelp(dt){
  const a = Co.pl[0], b = Co.pl[1];
  [[a, b], [b, a]].forEach(function(p){
    const dn = p[0], up = p[1]; if (!dn.down) return;
    if (!up.down && hyp(dn.x - up.x, dn.y - up.y) < 84){ dn.reviveT += dt; if (dn.reviveT >= 2) coRevive(dn, 0.5); } else dn.reviveT = Math.max(0, dn.reviveT - dt * 0.5);
  });
}
/* a creature touching a giraffe, or a shot reaching her: the hit is dealt by the real hurtPlayer, with her standing in for P */
function coHits(){
  const es = G.enemies, ep = G.eproj;
  Co.pl.forEach(function(r){
    if (r.down) return;
    coAs(r, function(){
      if (P.invuln <= 0){
        const near = enemiesNear(P.x, P.y, 140);
        for (let i = 0; i < near.length; i++){
          const e = near[i]; if (e.dead || e.untarg || (e.def && e.def.turret) || e.atkCd > 0) continue;
          const dx = P.x - e.x, dy = P.y - e.y, rr = e.r + P.r;
          if (dx * dx + dy * dy < rr * rr){
            e.atkCd = 0.75; hurtPlayer(e.dmg * (e.state === 'dash' ? 1.25 : 1), e.x, e.y);
            const a = Math.atan2(dy, dx); e.kx -= Math.cos(a) * 200 * e.kbRes; e.ky -= Math.sin(a) * 200 * e.kbRes;
            break;
          }
        }
      }
      for (let i = ep.length - 1; i >= 0; i--){
        const p = ep[i], dx = P.x - p.x, dy = P.y - p.y, rr = P.r + p.r;
        if (dx * dx + dy * dy < rr * rr && P.invuln <= 0){ hurtPlayer(p.dmg, p.x, p.y); burstParticles(p.x, p.y, 6, p.color, 180, 3); ep.splice(i, 1); }
      }
    });
    if (r.hp <= 0 && !r.down) coDown(r);
  });
}
/* the middle of the pair is where P stands, and they cannot wander further apart than the screen shows */
function coShell(){
  const a = Co.pl[0], b = Co.pl[1], lx = G.W / G.zoom * 0.84, ly = G.H / G.zoom * 0.8;
  let mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
  a.x = mx + clamp(a.x - mx, -lx / 2, lx / 2); b.x = mx + clamp(b.x - mx, -lx / 2, lx / 2);
  a.y = my + clamp(a.y - my, -ly / 2, ly / 2); b.y = my + clamp(b.y - my, -ly / 2, ly / 2);
  mx = (a.x + b.x) / 2; my = (a.y + b.y) / 2;
  Co.mid.x = mx; Co.mid.y = my; P.x = mx; P.y = my; P.vx = P.vy = 0; P.invuln = 99; P.hp = P.maxHp; P.dead = false;
}

/* ---------------- the arena: rounds ---------------- */
function coNextRound(){
  Co.round++;
  const k = (Co.round - 1) % CO_ROUND_WAVES.length, cyc = Math.floor((Co.round - 1) / CO_ROUND_WAVES.length);
  const w = (Co.chapter - 1) * WAVES_PER_CHAPTER + CO_ROUND_WAVES[k];
  G.wave = w; G.chapter = Co.chapter;
  /* the chapter's own mix of creatures, but only a few at first (a later chapter's wave is far bigger than two giraffes without cards can take): five and two more every round, then a third of that (CO_EASE) */
  let q = buildWave(w).filter(function(s){ return !s.boss && !s.ally; }).slice(0, Math.max(2, Math.round((5 + 2 * Co.round) / CO_EASE)));
  Co.cyc = cyc;
  Co.queue = q; Co.spawnT = 0; Co.calm = 0;
  P.stats.allDmgMul = coDmgMul();                                         /* they get a little stronger every round, so the rounds can */
  Co.pl.forEach(function(r){
    r.maxHp = coHpBase() + 10 * (Co.round - 1);
    if (r.down) coRevive(r, 0.6); else r.hp = Math.min(r.maxHp, r.hp + r.maxHp * 0.35);
  });
  banner('ROUND ' + Co.round, q.length + ' coming' + (cyc ? ' · a tougher lot' : ''), '#F2B33D', 2.0);
  SFX.wave();
}
function coArenaStep(dt){
  Co.spawnT += dt;
  let guard = 0;
  while (Co.queue.length && Co.queue[0].t <= Co.spawnT && guard++ < 10){
    const p = spawnPoint(), e = spawnEnemy(Co.queue[0].type, p.x, p.y, G.wave);
    if (!e) break;
    Co.queue.shift();
    e.hp = e.hp / CO_EASE * (1 + 0.2 * (Co.cyc || 0)); e.maxHp = e.hp; e.dmg /= CO_EASE;
    burstParticles(p.x, p.y, 5, '#6B5B45', 120, 3);
  }
  if (!Co.queue.length){
    Co.calm += dt;
    if (G.enemies.length === 0 ? Co.calm > 2.2 : Co.calm > 16) coNextRound();
  }
}
function coBothDown(){
  Co.over = true; G.state = 'paused'; G.subScreen = 'coover';
  setOverlay('<div class="panel slab" style="max-width:430px"><h2 class="head">Both giraffes are down</h2>' +
    '<p class="sub">You got to round ' + Co.round + ' together. Nothing was spent and nothing was won; it was just for fun.</p>' +
    '<div class="menucol" style="margin-top:0;width:100%"><button class="btn" data-a="co-again">Go again</button>' +
    '<button class="btn ghost" data-a="co-quit">Back to the menu</button></div></div>');
}

/* ---------------- the yard ---------------- */
function coBallReset(dir){
  const y = Co.yard; Co.ball = { x: (y.x0 + y.x1) / 2, y: y.cy, vx: dir * 60, vy: 0, r: 24, spin: 0 };
}
function coBallKick(r){
  const b = Co.ball, wp = P.weapon || DEFAULT_WEAPON, range = wp.range * P.stats.kickRangeMul + b.r;
  const dx = b.x - P.x, dy = b.y - P.y, d = hyp(dx, dy);
  if (d > range) return;
  const a = Math.atan2(dy, dx);
  if (Math.abs(angDiff(a, P.aim)) > 1.1 && d > 60) return;
  const sp = 760 + hyp(P.vx, P.vy) * 0.8;
  b.vx = Math.cos(a) * sp; b.vy = Math.sin(a) * sp; sfx('kick', 0.1);
  burstParticles(b.x, b.y, 8, '#FFFFFF', 220, 3.5, { glow: true });
}
function coYardStep(dt){
  const y = Co.yard, b = Co.ball;
  if (Co.winT > 0){ Co.winT -= dt; if (Co.winT <= 0){ Co.score = [0, 0]; coBallReset(0); Co.pl[0].x = y.x0 + CO_YARD.w * 0.3; Co.pl[1].x = y.x1 - CO_YARD.w * 0.3; Co.pl[0].y = Co.pl[1].y = y.cy; banner('NEW MATCH', 'First to ' + CO_YARD.win, '#F2B33D', 1.6); } return; }
  if (Co.goalT > 0){ Co.goalT -= dt; if (Co.goalT <= 0) coBallReset(0); return; }
  b.vx *= Math.pow(0.45, dt); b.vy *= Math.pow(0.45, dt);
  const sp = hyp(b.vx, b.vy); if (sp > 1100){ b.vx *= 1100 / sp; b.vy *= 1100 / sp; }
  b.x += b.vx * dt; b.y += b.vy * dt; b.spin += (b.vx > 0 ? 1 : -1) * sp * dt * 0.02;
  Co.pl.forEach(function(r){                                                   /* a giraffe running into the ball pushes it along */
    const dx = b.x - r.x, dy = b.y - r.y, d = hyp(dx, dy), rr = b.r + 22;
    if (d < rr && d > 0.01){ const nx = dx / d, ny = dy / d; b.x = r.x + nx * rr; b.y = r.y + ny * rr; const push = Math.max(0, r.vx * nx + r.vy * ny) * 1.2 + 80; b.vx += nx * push * 0.5; b.vy += ny * push * 0.5; }
  });
  const gh = CO_YARD.goal / 2;
  if (b.y < y.y0 + b.r){ b.y = y.y0 + b.r; b.vy = Math.abs(b.vy) * 0.8; }
  if (b.y > y.y1 - b.r){ b.y = y.y1 - b.r; b.vy = -Math.abs(b.vy) * 0.8; }
  const inMouth = Math.abs(b.y - y.cy) < gh;
  if (b.x < y.x0 - b.r * 0.4 && inMouth){ coGoal(1); return; }
  if (b.x > y.x1 + b.r * 0.4 && inMouth){ coGoal(0); return; }
  if (!inMouth){ if (b.x < y.x0 + b.r){ b.x = y.x0 + b.r; b.vx = Math.abs(b.vx) * 0.8; } if (b.x > y.x1 - b.r){ b.x = y.x1 - b.r; b.vx = -Math.abs(b.vx) * 0.8; } }
  else { if (b.x < y.x0 - 90){ b.x = y.x0 - 90; b.vx = Math.abs(b.vx) * 0.5; } if (b.x > y.x1 + 90){ b.x = y.x1 + 90; b.vx = -Math.abs(b.vx) * 0.5; } }
}
function coGoal(team){
  Co.score[team]++; Co.goalT = 1.6; Co.ball.vx = Co.ball.vy = 0;
  const win = Co.score[team] >= CO_YARD.win;
  burstParticles(Co.ball.x, Co.ball.y, 30, team ? '#8FB4E0' : '#F2B33D', 320, 5, { glow: true }); SFX.level(); screenFlash(team ? '#8FB4E0' : '#F2B33D', 0.3, 0.5);
  if (win){ Co.winT = 4; Co.goalT = 0; banner((team ? 'BLUE' : 'GOLD') + ' WINS', Co.score[0] + ' : ' + Co.score[1], team ? '#8FB4E0' : '#F2B33D', 3.4); }
  else banner('GOAL!', (team ? 'Blue' : 'Gold') + ' scores   ' + Co.score[0] + ' : ' + Co.score[1], team ? '#8FB4E0' : '#F2B33D', 1.4);
}

/* ---------------- one frame ---------------- */
(function(){
  const up = update;
  update = function(dt){
    if (!Co.on || G.state !== 'playing') return up(dt);
    Co.t += dt;
    if (Co.over){ coBothDown(); return; }                                     /* the game-over screen was closed by Escape: it comes back */
    const pads = coPads();
    Co.pl.forEach(function(r){ if (!r.down) coStepGiraffe(r, dt, pads); });
    coHelp(dt); coHits();
    coShell();
    G.pendingLevels = 0; HUD.classList.remove('on'); PAUSEBTN.classList.remove('on');
    up(dt);
    coShell();
    if (Co.mode === 'arena') coArenaStep(dt); else coYardStep(dt);
    if (Co.pl[0].down && Co.pl[1].down && !Co.over) coBothDown();
  };

  /* the run's own giraffe, kick, waves, experience and ending do nothing while two giraffes play */
  const upl = updatePlayer; updatePlayer = function(dt){ if (Co.on) return; return upl.apply(this, arguments); };
  const uw = updateWaves; updateWaves = function(dt){ if (Co.on) return; return uw.apply(this, arguments); };
  const gx = gainXP; gainXP = function(){ if (Co.on) return; return gx.apply(this, arguments); };
  const go = gameOver; gameOver = function(){ if (Co.on) return; return go.apply(this, arguments); };
  const dk = doKick; doKick = function(){ if (Co.on && !Co.cur) return; return dk.apply(this, arguments); };
  const rb = recordBestiaryKill; recordBestiaryKill = function(){ if (Co.on) return; return rb.apply(this, arguments); };       /* no "new in the Bestiary" for something nothing keeps */
  const ap = addPickup; addPickup = function(){ if (Co.on) return; return ap.apply(this, arguments); };                   /* nothing drops */
  const rs = recalcStats;
  recalcStats = function(){                                                  /* the stats are rebuilt from scratch: the pair's health and the round's strength must survive that */
    if (!Co.on) return rs.apply(this, arguments);
    const mh = P.maxHp, h = P.hp, r = rs.apply(this, arguments);
    P.maxHp = mh; P.hp = h; P.stats.allDmgMul = coDmgMul();
    return r;
  };
  const sw = Save.write; Save.write = function(){ if (Co.on) return; return sw.apply(this, arguments); };
  /* a hit meant for P: from a hazard or a creature at the middle of the pair, it goes to the giraffe it is next to, or nowhere */
  const hp = hurtPlayer;
  hurtPlayer = function(amount, sx, sy){
    if (!Co.on || Co.cur) return hp.apply(this, arguments);
    if (sx === undefined) return;
    let best = null, bd = 150;
    for (let i = 0; i < Co.pl.length; i++){ const r = Co.pl[i]; if (r.down) continue; const d = hyp(r.x - sx, r.y - sy); if (d < bd){ bd = d; best = r; } }
    if (!best) return;
    const r = best; coAs(r, function(){ hp(amount, sx, sy); }); if (r.hp <= 0 && !r.down) coDown(r);
  };
  /* creatures go for whichever giraffe is nearest */
  const aat = antAggroTarget;
  antAggroTarget = function(e){
    if (!Co.on) return aat.apply(this, arguments);
    let best = null, bd = 1e9;
    for (let i = 0; i < Co.pl.length; i++){ const r = Co.pl[i]; if (r.down) continue; const d = hyp(r.x - e.x, r.y - e.y); if (d < bd){ bd = d; best = r; } }
    return best;
  };
  const sp = showPause;
  showPause = function(){
    if (!Co.on) return sp.apply(this, arguments);
    if (Co.over) return;
    G.state = 'paused'; G.subScreen = '';
    setOverlay('<div class="panel slab" style="max-width:430px"><h2 class="head">Paused</h2>' +
      '<p class="sub">' + (Co.mode === 'yard' ? 'Kick-about. Gold ' + Co.score[0] + ', Blue ' + Co.score[1] + '.' : 'Round ' + Co.round + '. Nothing here is kept.') + '</p>' +
      '<div class="menucol" style="margin-top:0;width:100%"><button class="btn" data-a="resume">Back to it</button>' +
      '<button class="btn ghost" data-a="t-mute-live">Sound: ' + (Settings.muted ? 'off' : 'on') + '</button>' +
      '<button class="btn ghost" data-a="co-quit">Leave to the menu</button></div></div>');
  };
})();

/* ---------------- drawing ---------------- */
(function(){
  const cols = giraffeColours, pat = giraffePattern, acc = giraffeAccent, eq = accEquipped;
  giraffeColours = function(){ return Co.drawing === 2 ? CO_P2 : cols.apply(this, arguments); };
  giraffePattern = function(){ return Co.drawing === 2 ? 0 : pat.apply(this, arguments); };
  giraffeAccent = function(){ return Co.drawing === 2 ? null : acc.apply(this, arguments); };
  accEquipped = function(){ return Co.drawing === 2 ? null : eq.apply(this, arguments); };

  const dp = drawPlayer;
  drawPlayer = function(ctx){
    if (!Co.on || !Co.pl.length) return dp(ctx);
    const order = Co.pl.slice().sort(function(a, b){ return a.y - b.y; });
    for (let i = 0; i < order.length; i++){
      const r = order[i];
      Co.drawing = r.idx + 1;
      coSwap(r);
      try { if (r.down) ctx.globalAlpha = 0.55; dp(ctx); } finally { ctx.globalAlpha = 1; coSwap(r); Co.drawing = 0; }
      coTag(ctx, r);
    }
  };
  /* the name and the health, over her head */
  function coTag(ctx, r){
    const x = r.x, y = r.y - 58, w = 46, col = r.idx ? CO_P2.coat : '#F2B33D';
    ctx.save();
    ctx.fillStyle = 'rgba(18,13,10,.72)'; ctx.fillRect(x - w / 2 - 1, y - 1, w + 2, 8);
    ctx.fillStyle = '#3A2B20'; ctx.fillRect(x - w / 2, y, w, 6);
    ctx.fillStyle = r.down ? '#8A8F99' : col; ctx.fillRect(x - w / 2, y, w * clamp(r.hp / r.maxHp, 0, 1), 6);
    ctx.font = '800 11px ui-sans-serif, "Segoe UI", Roboto, sans-serif'; ctx.textAlign = 'center'; ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(12,9,8,.85)';
    const lab = r.down ? 'Help her up' : r.name; ctx.strokeText(lab, x, y - 4); ctx.fillStyle = r.down ? '#FFB89A' : col; ctx.fillText(lab, x, y - 4);
    if (r.down && r.reviveT > 0){ ctx.fillStyle = '#8FE0A0'; ctx.fillRect(x - w / 2, y + 9, w * clamp(r.reviveT / 2, 0, 1), 4); }
    ctx.restore();
  }

  /* the yard's grass, lines, goals and ball sit under the creatures and giraffes */
  const dpk = drawPickups;
  drawPickups = function(ctx){
    dpk.apply(this, arguments);
    if (Co.on && Co.mode === 'yard' && Co.yard) coDrawYard(ctx);
  };
  function coDrawYard(ctx){
    const y = Co.yard, w = y.x1 - y.x0, h = y.y1 - y.y0, gh = CO_YARD.goal;
    ctx.save();
    ctx.fillStyle = 'rgba(70,150,60,.28)'; ctx.fillRect(y.x0, y.y0, w, h);
    ctx.fillStyle = 'rgba(255,255,255,.06)'; for (let i = 0; i < 10; i += 2) ctx.fillRect(y.x0 + w / 10 * i, y.y0, w / 10, h);
    ctx.strokeStyle = 'rgba(255,255,255,.7)'; ctx.lineWidth = 5; ctx.strokeRect(y.x0, y.y0, w, h);
    ctx.beginPath(); ctx.moveTo((y.x0 + y.x1) / 2, y.y0); ctx.lineTo((y.x0 + y.x1) / 2, y.y1); ctx.stroke();
    ctx.beginPath(); ctx.arc((y.x0 + y.x1) / 2, y.cy, 130, 0, TAU); ctx.stroke();
    [[y.x0, -1, '#F2B33D'], [y.x1, 1, '#8FB4E0']].forEach(function(g){
      ctx.fillStyle = 'rgba(255,255,255,.1)'; ctx.fillRect(g[1] < 0 ? g[0] - 90 : g[0], y.cy - gh / 2, 90, gh);
      ctx.strokeStyle = g[2]; ctx.lineWidth = 9; ctx.strokeRect(g[1] < 0 ? g[0] - 90 : g[0], y.cy - gh / 2, 90, gh);
    });
    const b = Co.ball;
    if (b){
      softShadow(ctx, b.x, b.y + 16, 22, 9, 0.3, 10);
      ctx.translate(b.x, b.y); ctx.rotate(b.spin);
      ctx.fillStyle = '#F4F4F0'; ctx.beginPath(); ctx.arc(0, 0, b.r, 0, TAU); ctx.fill();
      ctx.fillStyle = '#2A2A2E'; ctx.beginPath(); for (let i = 0; i < 5; i++){ const a = i / 5 * TAU - Math.PI / 2; ctx.lineTo(Math.cos(a) * b.r * 0.42, Math.sin(a) * b.r * 0.42); } ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#2A2A2E'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(0, 0, b.r, 0, TAU); ctx.stroke();
    }
    ctx.restore();
  }

  /* the screen over it all: who is who, and what to do */
  const rn = render;
  render = function(){
    rn.apply(this, arguments);
    if (!Co.on || !CTX || !Co.pl.length || (G.state !== 'playing' && G.state !== 'paused')) return;
    const ctx = CTX; ctx.setTransform(G.dpr, 0, 0, G.dpr, 0, 0); ctx.globalAlpha = 1;
    const small = G.W < 760;
    ctx.save(); ctx.textBaseline = 'alphabetic';
    ctx.font = '800 ' + (small ? 12 : 14) + 'px ui-sans-serif, "Segoe UI", Roboto, sans-serif'; ctx.textAlign = 'center'; ctx.lineWidth = 4; ctx.strokeStyle = 'rgba(12,9,8,.85)'; ctx.fillStyle = '#F6EAD0';
    const head = Co.mode === 'yard' ? 'Gold ' + Co.score[0] + '  :  ' + Co.score[1] + ' Blue' : 'Round ' + Co.round + '   ·   just for fun, nothing is kept';
    ctx.strokeText(head, G.W / 2, 26); ctx.fillText(head, G.W / 2, 26);
    ctx.font = '700 ' + (small ? 10 : 12) + 'px ui-sans-serif, "Segoe UI", Roboto, sans-serif'; ctx.textAlign = 'left';
    const hint1 = 'GOLD: ' + keyName(keyOf('up')) + keyName(keyOf('left')) + keyName(keyOf('down')) + keyName(keyOf('right')) + ' + ' + keyName(keyOf('kick')), hint2 = 'BLUE: arrows + Enter';
    ctx.strokeText(hint1, 14, G.H - 16); ctx.fillStyle = '#F2B33D'; ctx.fillText(hint1, 14, G.H - 16);
    ctx.textAlign = 'right'; ctx.strokeText(hint2, G.W - 14, G.H - 16); ctx.fillStyle = CO_P2.coat; ctx.fillText(hint2, G.W - 14, G.H - 16);
    ctx.restore();
  };
})();

/* ---------------- the menu ---------------- */
function showTogether(){
  G.state = 'help'; G.attract = true; G.subScreen = 'together';
  const list = coChapters(); if (list.indexOf(Co.pick) < 0) Co.pick = 1;
  const at = list.indexOf(Co.pick), info = CHAPTER_INFO[Co.pick - 1];
  setOverlay(
    '<div class="panel slab" style="max-width:560px"><h2 class="head">Play together</h2>' +
    '<p class="sub">Two giraffes, one screen, just for fun. Nothing you do here is kept: no points, no gold, no cards.</p>' +
    '<ul class="plain" style="text-align:left;margin:0 0 12px;padding-left:18px;line-height:1.5">' +
      '<li><b>Gold</b> (player 1): ' + keyName(keyOf('up')) + keyName(keyOf('left')) + keyName(keyOf('down')) + keyName(keyOf('right')) + ' to move, <b>' + keyName(keyOf('kick')) + '</b> or the mouse button to kick.</li>' +
      '<li><b>Blue</b> (player 2): the arrow keys to move, <b>Enter</b> to kick.</li>' +
      '<li>Gamepads work too: with two, the first is Gold and the second is Blue; with one, it plays Blue.</li></ul>' +
    '<div class="menucol" style="margin-top:0;width:100%">' +
      '<div class="chsel" style="margin:0 0 6px;align-items:center"><button class="charrow" data-a="co-ch-prev" aria-label="Previous place"' + (at <= 0 ? ' disabled' : '') + '>❮</button>' +
        '<div style="flex:1;text-align:center"><div class="chname display">' + info.name + '</div><p class="chdesc" style="margin:2px 0 0">' + info.desc + '</p></div>' +
        '<button class="charrow" data-a="co-ch-next" aria-label="Next place"' + (at >= list.length - 1 ? ' disabled' : '') + '>❯</button></div>' +
      '<button class="btn" data-a="co-arena">Arena fight<small>Round after round of this place’s creatures, side by side. Pick your friend up when she goes down.</small></button>' +
      '<button class="btn ghost" data-a="co-yard">Kick-about yard<small>A ball, two goals, first to ' + CO_YARD.win + '.</small></button>' +
      '<button class="btn ghost" data-a="co-back">Back</button></div></div>');
}
function coAction(a){
  switch (a){
    case 'co-open': SFX.click(); showTogether(); return true;
    case 'co-back': SFX.click(); G.subScreen = ''; showMenu(); return true;
    case 'co-ch-prev': case 'co-ch-next': { const l = coChapters(), i = l.indexOf(Co.pick); Co.pick = l[clamp(i + (a === 'co-ch-next' ? 1 : -1), 0, l.length - 1)] || 1; SFX.click(); showTogether(); return true; }
    case 'co-arena': SFX.click(); tryFullscreen(); coStart('arena', Co.pick); return true;
    case 'co-yard': SFX.click(); tryFullscreen(); coStart('yard', 1); return true;
    case 'co-again': SFX.click(); coStart(Co.mode, Co.chapter); return true;
    case 'co-quit': SFX.click(); coEnd(false); return true;
  }
  return false;
}
(function(){
  const ha = handleAction;
  handleAction = function(a){ if (typeof a === 'string' && a.indexOf('co-') === 0 && coAction(a)) return; return ha.apply(this, arguments); };
  const sm = showMenu;
  showMenu = function(){
    const r = sm.apply(this, arguments);
    if (G.state === 'menu' && typeof OV !== 'undefined'){            /* on the left, to balance the right-hand column; shown on every device (a touch screen can still have a keyboard or pads) */
      const left = OV.querySelector('.mside.l');
      if (left && !OV.querySelector('[data-a="co-open"]')) left.insertAdjacentHTML('beforeend', '<button class="btn ghost" data-a="co-open">Play together<small>Two giraffes, one screen, just for fun</small></button>');
    }
    return r;
  };
})();
