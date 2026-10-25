'use strict';
/* Minigame rewards: stars, the wheel's odds, the best score, pickup streaks, the celebration, the stingers and the collection screen. */
/* ========================= 44k. MINIGAMES: REWARDS ========================= */
/* Three stars per minigame: one for winning, two harder targets above it (MINI_STAR). Each star level pays 20 gems the first time.
   More stars improve the wheel: the rare hats get likelier and a duplicate is rolled again. Save.data.mini.stars = { ch: 0..3 }. */

/* t = the score needed for the 2nd and 3rd star; lab = what the HUD shows by each star; val = what is measured (default: the score) */
const MINI_STAR = {
  1:  { t: [10, 13], lab: ['8', '10', '13'] },
  2:  { t: [16, 20], lab: ['12', '16', '20'] },
  3:  { t: [42, 52], lab: ['32', '42', '52'] },
  4:  { t: [13, 17], lab: ['10', '13', '17'] },
  5:  { t: [60, 75], lab: ['45', '60', '75'] },
  6:  { t: [58, 72], lab: ['44', '58', '72'] },
  7:  { t: [16, 20], lab: ['12', '16', '20'] },
  8:  { t: [29, 36], lab: ['22', '29', '36'] },
  9:  { t: [16, 20], lab: ['12', '16', '20'] },
  10: { t: [4, 5],   lab: ['3', '4', '5'] },
  11: { t: [9, 11],  lab: ['7', '9', '11'] },
  12: { t: [20, 35], lab: ['Solve', '40 s', '25 s'], val: function(m){ return 60 - m.time; }, still: true },      /* solved in under 40 s / 25 s */
  13: { t: [1650, 1750], lab: ['Survive', '1650 m', '1750 m'], still: true }
};
const MINI_STAR_GEMS = 20;
const MINI_RARE_ODDS = [0.05, 0.07, 0.10, 0.15];                                /* the rare hats' share of a spin, by stars (0 = lost) */

function miniStarVal(m){ const d = MINI_STAR[m.ch]; return d && d.val ? d.val(m) : m.score; }
/* 0 if she did not win; otherwise 1, plus one for each harder target reached */
function miniStarsOf(m){
  if (!m.won) return 0;
  const d = MINI_STAR[m.ch]; if (!d) return 1;
  const v = miniStarVal(m);
  return 1 + (v >= d.t[0] ? 1 : 0) + (v >= d.t[1] ? 1 : 0);
}
function miniStarTotal(){ const s = miniData().stars; let n = 0; for (let ch = 1; ch <= MAIN_CHAPTERS; ch++) n += Math.min(3, s[ch] | 0); return n; }
function miniStarText(n, big){ return '<span style="color:#FFD84D">' + '★'.repeat(n) + '</span><span style="opacity:.3">' + '★'.repeat(3 - n) + '</span>'; }

/* the wheel's slices for a given number of stars: same items, the rare hats' share grows */
function miniSlicesFor(stars){
  const rare = MINI_RARE_ODDS[Math.max(0, Math.min(3, stars | 0))], rest = 1 - rare;
  const hatP = rest * ACC_ODDS.hat / (ACC_ODDS.hat + ACC_ODDS.boot) / ACC.hats.length;
  const bootP = rest * ACC_ODDS.boot / (ACC_ODDS.hat + ACC_ODDS.boot) / ACC.boots.length;
  const out = []; let at = 0;
  ACC_ITEMS.forEach(function(it){
    if (it.town) return;                                            /* the town's own hats and boots are not on the wheel (44y) */
    const p = it.rare ? rare / ACC.rare.length : it.kind === 'boot' ? bootP : hatP;
    out.push({ item: it, a0: at, a1: at + p }); at += p;
  });
  out[out.length - 1].a1 = 1;
  return out;
}

/* ---- the stingers ---- */
(function(){
  const bus = function(){ return SFX.eventGain; };
  SFX.miniWin = function(stars){
    const notes = [523, 659, 784, 1047, 1319, 1568];
    const n = 4 + Math.min(2, Math.max(0, stars - 1));
    for (let i = 0; i < n; i++) this.tone('triangle', notes[i], notes[i], 0.2, 0.2, i * 0.085, 0, bus());
    const t = n * 0.085 + 0.02;
    [523, 659, 784, 1047].forEach((f, i) => this.tone('triangle', f, f, 0.9, 0.12, t, i * 3, bus()));
    this.tone('square', 262, 262, 0.5, 0.08, t, 0, bus());
  };
  SFX.miniLose = function(){
    [392, 349, 311, 262].forEach((f, i) => this.tone('triangle', f, f * 0.98, 0.3, 0.18, i * 0.17, 0, bus()));
    this.tone('sawtooth', 131, 98, 0.7, 0.06, 0.6, 0, bus());
  };
  SFX.miniStar = function(k){ const f = [784, 988, 1319][Math.min(2, k)]; this.tone('triangle', f, f, 0.3, 0.2, 0, 0, bus()); this.tone('sine', f * 2, f * 2, 0.4, 0.07, 0.04, 0, bus()); };
  SFX.miniStreak = function(n){                                                    /* a pentatonic climb, one step per pickup in a row */
    const steps = [0, 2, 4, 7, 9, 12, 14, 16, 19, 21, 24], f = 523 * Math.pow(2, steps[Math.min(steps.length - 1, Math.max(0, n - 1))] / 12);
    this.tone('triangle', f, f, 0.12, 0.09, 0, 0, this.abilityGain);
  };
})();

/* ---- while it is played ---- */
/* the last second of a win runs slowly, easing from full speed to about a third */
function miniTimeScale(m){
  const d = m.def;
  if (!d.dur || m.over) return 1;
  const left = d.dur - m.time;
  if (left > 1 || left <= 0) return 1;
  const winning = d.win ? !!d.win(m) : m.score >= m.goal;
  if (!winning) return 1;
  m.slowmo = true;
  return 0.3 + 0.7 * left;
}
function miniPickCount(m){
  const ch = m.ch;
  if (ch === 12 || ch === 13) return 0;
  return ch === 5 ? (m.fruitN | 0) : ch === 6 ? (m.coinN | 0) : m.score;
}
function miniEdge(m, rgb, a, dur){ m.edge = { rgb: rgb, a: a, t: 0, dur: dur || 0.35 }; }
function miniLiveStars(m){
  const d = MINI_STAR[m.ch]; if (!d || d.still) return 0;
  const v = miniStarVal(m);
  return (m.goal > 0 && m.score >= m.goal ? 1 : 0) + (v >= d.t[0] ? 1 : 0) + (v >= d.t[1] ? 1 : 0);
}
function miniJuice(m, dt){
  if (m.edge){ m.edge.t += dt; if (m.edge.t >= m.edge.dur) m.edge = null; }
  const g = miniGeom(), f = m.focus || { x: g.W / 2, y: g.H / 2 };
  /* pickups in a row: an edge flash and a chime that climbs */
  const pc = miniPickCount(m);
  if (pc > m.pickN){
    m.streak = (m.time - m.lastPick <= 1.6) ? m.streak + 1 : 1;
    m.lastPick = m.time; m.pickN = pc;
    SFX.miniStreak(m.streak);
    miniEdge(m, m.streak >= 5 ? '255,216,77' : '140,255,190', Math.min(0.55, 0.22 + m.streak * 0.04), 0.3);
    if (m.streak >= 3 && m.streak % 2 === 1) miniPop(m, f.x, f.y - 64 * g.s, 'x' + m.streak, '#FFD84D');
  } else if (m.streak && m.time - m.lastPick > 1.6) m.streak = 0;
  /* stars reached on the way, and the best score beaten */
  const ls = miniLiveStars(m);
  if (ls > m.liveStars){
    for (let k = m.liveStars; k < ls; k++){
      SFX.miniStar(k);
      miniPop(m, g.W / 2, g.H * 0.3, k === 0 ? 'Goal reached!' : '★'.repeat(k + 1) + ' star!', '#FFD84D');
      miniRing(m, g.W / 2, g.H * 0.3, '#FFD84D', 150 * g.s, 0.7, 0.4);
    }
    miniEdge(m, '255,216,77', 0.6, 0.55);
    m.liveStars = ls;
  }
  if (!m.newBestShown && m.bestAtStart > 0 && m.score > m.bestAtStart){
    m.newBestShown = true;
    SFX.level(); miniPop(m, g.W / 2, g.H * 0.22, 'New best!', '#FFB347');
    miniRing(m, g.W / 2, g.H * 0.22, '#FFB347', 140 * g.s, 0.7, 0.4);
    miniEdge(m, '255,170,70', 0.6, 0.6);
  }
  if (m.slowmo && !m.over) miniEdge(m, '255,216,77', 0.35, 0.2);                       /* a gold glow around the slow last second */
}

/* ---- the celebration, between the end of the game and the result ---- */
function miniCeleStart(m){
  m.phase = 'cele'; m.ct = 0; m.conf = []; m.starShown = 0; m.skipOk = false;
  m.celeDur = m.won ? Math.max(2.4, 0.9 + m.stars * 0.5 + 1.1) : 1.3;
  m.slowmo = false; m.edge = null;
  if (m.won){
    SFX.miniWin(m.stars);
    try { Music.sting(0.2, 2.4); } catch (e) {}
    screenFlash('#FFF6D0', 0.6, 0.35);
    miniConfetti(m, 110);
  } else {
    SFX.miniLose();
    try { Music.sting(0.25, 1.6); } catch (e) {}
  }
}
function miniConfetti(m, n){
  const g = miniGeom(), cols = ['#FF5A5A', '#FFD84D', '#5ADBFF', '#8AFF7A', '#FF8AE0', '#FFFFFF', '#FFA24D'];
  for (let i = 0; i < n && m.conf.length < 220; i++)
    m.conf.push({ x: rand(0, g.W), y: rand(-g.H * 0.3, -10), vx: rand(-70, 70), vy: rand(120, 300), r: rand(0, TAU), vr: rand(-9, 9), w: rand(6, 12) * g.s, h: rand(3, 7) * g.s, c: pick(cols), sw: rand(0, TAU) });
}
function miniCeleUpdate(m, dt){
  m.ct += dt;
  if (m.won){
    if (m.ct < 1.6 && Math.random() < dt * 40) miniConfetti(m, 1);
    const want = Math.min(m.stars, Math.floor((m.ct - 0.5) / 0.5) + 1);
    while (m.starShown < want){
      const g = miniGeom();
      SFX.miniStar(m.starShown);
      miniRing(m, g.W / 2 + (m.starShown - 1) * 70 * g.s, g.H * 0.2, '#FFD84D', 70 * g.s, 0.6, 0.5);
      miniBurst(m, g.W / 2 + (m.starShown - 1) * 70 * g.s, g.H * 0.2, 14, '#FFE27A', { speed: 220, r: 3.6, life: 0.7 });
      m.starShown++;
    }
  }
  for (let i = m.conf.length - 1; i >= 0; i--){
    const p = m.conf[i];
    p.sw += dt * 5; p.x += (p.vx + Math.sin(p.sw) * 40) * dt; p.y += p.vy * dt; p.r += p.vr * dt;
    if (p.y > G.H + 20) m.conf.splice(i, 1);
  }
  if (m.ct > 0.7 && (m.in.pAct || m.in.pClick || m.in.pJump)) m.ct = Math.max(m.ct, m.celeDur);
  if (m.ct >= m.celeDur) miniCeleDone(m);
}
function miniCeleDone(m){
  if (m.phase !== 'cele') return;
  m.phase = 'done'; m.conf = null;
  showMiniResult();
}

/* ---- drawn over the game by renderMini ---- */
function miniRewardsDraw(ctx, m, g){
  const W = g.W, H = g.H, s = g.s;
  if (m.edge){
    const k = 1 - m.edge.t / m.edge.dur;
    if (k > 0){
      const a = m.edge.a * k * (Settings.calmFlash ? 0.3 : 1);
      const gr = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.34, W / 2, H / 2, Math.hypot(W, H) * 0.55);
      gr.addColorStop(0, 'rgba(' + m.edge.rgb + ',0)'); gr.addColorStop(1, 'rgba(' + m.edge.rgb + ',' + a.toFixed(3) + ')');
      ctx.fillStyle = gr; ctx.fillRect(0, 0, W, H);
    }
  }
  if (m.phase === 'play' || m.phase === 'intro'){
    const d = MINI_STAR[m.ch];
    if (typeof miniHud === 'function') return;                                             /* the stars and the best score are part of the bar in 44l */
    if (d && m.phase === 'play'){                                                        /* the three stars and what they need */
      const lit = m.phase === 'play' ? m.liveStars : 0;
      ctx.textBaseline = 'alphabetic';
      for (let k = 0; k < 3; k++){
        const x = 14 * s + k * 92 * s;
        ctx.font = 'bold ' + Math.round(17 * s) + 'px system-ui, sans-serif'; ctx.textAlign = 'left';
        ctx.fillStyle = k < lit ? '#FFD84D' : 'rgba(255,255,255,.4)';
        ctx.strokeStyle = 'rgba(12,9,8,.7)'; ctx.lineWidth = 3; ctx.lineJoin = 'round';
        const star = '★', lab = ' ' + d.lab[k];
        ctx.strokeText(star + lab, x, 76 * s); ctx.fillText(star + lab, x, 76 * s);
      }
    }
    if (m.phase === 'play' && !m.hideBest){
      const showNew = m.newBestShown;
      if (m.bestAtStart > 0 || showNew){
        const pulse = showNew ? 1 + Math.sin(G.time * 8) * 0.06 : 1;
        miniText(ctx, showNew ? 'New best! ' + m.score : 'Best ' + m.bestAtStart, W - 14 * s, 76 * s, 16 * s * pulse, showNew ? '#FFB347' : 'rgba(255,255,255,.8)', 'right');
      }
    }
    return;
  }
  if (m.phase !== 'cele') return;
  /* the celebration */
  const k = Math.min(1, m.ct / 0.4);
  ctx.fillStyle = 'rgba(14,10,6,' + (0.5 * k).toFixed(3) + ')'; ctx.fillRect(0, 0, W, H);
  const sc = 2.3 * s;
  if (m.won){
    const hop = Math.abs(Math.sin(m.ct * 6.2)), h = hop * 62 * s * (m.ct < m.celeDur - 0.3 ? 1 : 0.4);
    const gy = H * 0.66;
    miniShadow(ctx, W / 2, gy + 38 * sc, 34 * sc * (1 - hop * 0.35), 7 * sc * (1 - hop * 0.35), 0.35);
    drawSideGiraffe(ctx, W / 2, gy - h, sc, { air: hop > 0.12, ph: m.ct * 12, moving: hop > 0.12, lean: Math.sin(m.ct * 6.2) * 3 });
    for (let i = 0; i < 3; i++){                                                           /* the stars drop in one by one */
      const x = W / 2 + (i - 1) * 70 * s, y = H * 0.2, on = i < m.starShown;
      ctx.save(); ctx.translate(x, y);
      const pop = on ? 1 + Math.max(0, 0.5 - (m.ct - (0.5 + i * 0.5))) * 1.2 : 1;
      ctx.scale(pop * s * 1.5, pop * s * 1.5);
      ctx.beginPath();
      for (let j = 0; j < 10; j++){ const a = -Math.PI / 2 + j * Math.PI / 5, r = j % 2 ? 11 : 25; ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r); }
      ctx.closePath();
      ctx.fillStyle = on ? '#FFD84D' : 'rgba(255,255,255,.14)'; ctx.fill();
      ctx.lineWidth = 3; ctx.strokeStyle = on ? '#9A6A10' : 'rgba(255,255,255,.3)'; ctx.stroke();
      ctx.restore();
    }
    miniText(ctx, ['Goal reached!', 'Great run!', 'Perfect!'][Math.max(0, m.stars - 1)], W / 2, H * 0.32, 30 * s, '#FFE9A0');
  } else {
    const slump = Math.min(1, m.ct * 2);
    drawSideGiraffe(ctx, W / 2, H * 0.62, sc, { dip: 10 * slump, lean: -6 * slump, air: false });
    miniText(ctx, m.def.loseText || 'Not this time', W / 2, H * 0.3, 30 * s, '#FFD0C0');
  }
  for (let i = 0; i < m.conf.length; i++){
    const p = m.conf[i];
    ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r); ctx.scale(1, Math.cos(p.sw * 1.7)); ctx.fillStyle = p.c; ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h); ctx.restore();
  }
}

/* ---- the result card: stars, the next target, what the stars paid ---- */
function miniStarsHTML(m){
  if (m.abandon) return '';
  const d = MINI_STAR[m.ch];
  const gold = m.stars >= 1 ? '' : 'opacity:.9';
  let h = '<div style="font-size:34px;letter-spacing:6px;margin:2px 0 4px;' + gold + '">' + miniStarText(m.stars) + '</div>';
  if (d){
    const parts = [];
    for (let k = 0; k < 3; k++) parts.push('<span style="' + (k < m.stars ? 'color:#FFD84D' : 'opacity:.6') + '">' + '★'.repeat(k + 1) + ' ' + d.lab[k] + '</span>');
    h += '<p class="sub" style="margin:0 0 4px;font-size:13px">' + parts.join(' &nbsp;·&nbsp; ') + '</p>';
  }
  const odds = Math.round(MINI_RARE_ODDS[m.stars] * 100);
  h += '<p class="sub" style="margin:0 0 2px;font-size:13px">Rare hat chance this spin: <b>' + odds + '%</b>' + (m.stars >= 2 ? ' · duplicates rolled again' : '') +
    (m.starGems ? ' · <b style="color:#9AE8FF">+' + m.starGems + ' gems for new stars</b>' : '') + '</p>';
  if (m.stars >= 3 && m.prevStars < 3 && WARD[13 + m.ch]){                          /* the first time all three stars are won: this minigame's colour */
    const w = WARD[13 + m.ch];
    h += '<p class="sub" style="margin:4px 0 2px;font-size:14px"><span style="display:inline-block;width:14px;height:14px;border-radius:50%;vertical-align:-2px;margin-right:6px;background:' + w.c + ';border:1px solid #fff"></span>' +
      '<b style="color:#FFE9A0">New coat colour: ' + w.name + '.</b> Find it under Coat colours.</p>';
  }
  return h;
}

/* ---- the collection ---- */
function accSilhouette(cv, it){
  const q = cv.getContext('2d'), W = cv.width, H = cv.height;
  const t = document.createElement('canvas'); t.width = W; t.height = H;
  const c = t.getContext('2d');
  drawAccIcon(c, it, W / 2, it.kind === 'boot' ? H * 0.46 : H * 0.52, it.kind === 'boot' ? 1.55 : 1.45, 0);
  c.globalCompositeOperation = 'source-in'; c.fillStyle = it.rare ? '#5A4A1E' : '#3A3028'; c.fillRect(0, 0, W, H);
  q.clearRect(0, 0, W, H); q.drawImage(t, 0, 0);
}
function showCollection(){
  G.state = 'help'; G.attract = true; G.subScreen = 'minicoll';
  const md = miniData();
  const sect = function(title, list){
    let own = 0; list.forEach(function(it){ if (md.own[it.id]) own++; });
    let h = '<div class="sub" style="margin:10px 0 4px;font-weight:700;color:var(--sun)">' + title + ': ' + own + ' of ' + list.length + '</div><div class="coll">';
    list.forEach(function(it){
      const n = md.own[it.id] | 0, worn = md[it.kind === 'boot' ? 'boot' : 'hat'] === it.id;
      h += '<button class="cell' + (n ? '' : ' locked') + (it.rare ? ' rare' : '') + (worn ? ' on' : '') + '" ' + (n ? 'data-a="coll-wear-' + it.id + '"' : 'disabled') +
        ' title="' + (n ? it.name + (worn ? ' (worn)' : ' – click to wear') : (it.rare ? 'A rare hat. Not found yet' : 'Not found yet')) + '">' +
        '<canvas width="56" height="56" data-coll="' + it.id + '"></canvas>' +
        '<span>' + (n ? it.name : '? ? ?') + '</span>' + (n > 1 ? '<i>×' + n + '</i>' : '') + '</button>';
    });
    return h + '</div>';
  };
  setOverlay(
    '<div class="panel slab wide" style="max-width:640px">' +
      '<h2 class="head">Collection</h2>' +
      '<p class="sub">' + accOwnedCount() + ' of ' + ACC_ITEMS.length + ' found. Stars earned: <b>' + miniStarTotal() + ' of ' + MAIN_CHAPTERS * 3 + '</b>. Click one you have to wear it.</p>' +
      (typeof tipOnce === 'function' ? tipOnce('coll', 'The dark shapes are items you have not found yet. Every minigame spin can give one, and rare hats are the gold-edged ones.') : '') +
      '<div class="collwrap">' + sect('Hats', ACC.hats.concat(ACC.rare)) + sect('Boots', ACC.boots) + (ACC.townHats ? sect('Only in Longneck Town', ACC.townHats.concat(ACC.townBoots)) : '') + '</div>' +
      '<div class="row" style="margin-top:12px"><button class="btn sm ghost" data-a="wardrobe">Wardrobe</button><button class="btn sm" data-a="mini-menu">Minigames</button></div>' +
    '</div>');
  paintCollection();
}
function paintCollection(){
  const cs = document.querySelectorAll('canvas[data-coll]'), md = miniData();
  for (let i = 0; i < cs.length; i++){
    const it = ACC_BY_ID[cs[i].getAttribute('data-coll')]; if (!it) continue;
    if (md.own[it.id]){
      const q = cs[i].getContext('2d'); q.clearRect(0, 0, 56, 56);
      drawAccIcon(q, it, 28, it.kind === 'boot' ? 26 : 30, it.kind === 'boot' ? 1.55 : 1.45, 0);
    } else accSilhouette(cs[i], it);
  }
}
function handleCollAction(a){
  if (a === 'mini-collection'){ SFX.click(); showCollection(); return true; }
  const m = /^coll-wear-([a-z0-9]+)$/.exec(a);
  if (m){
    const it = ACC_BY_ID[m[1]];
    if (it && accOwned(it.id)){ accWear(it.kind, it.id); SFX.pick(); showCollection(); }
    else SFX.deny();
    return true;
  }
  return false;
}
