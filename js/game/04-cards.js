'use strict';
/* The card registry: every card and its forms. */
/* ========================= 15. CARD REGISTRY ========================= */
/* Every card: id, name, icon, rarity, type, stats(level) and three forms.
   forms[0] is the base, forms[1] unlocks at level 5, forms[2] at level 10. */
const CARDS = [

/* ---------------------------------------------------------------- 1 */
{
  id: 'neck_whip', icon: '@t-x-whip', rarity: 'common', type: 'weapon',
  forms: [
    { lv:1,  name:'Neck Whip',   icon:'@t-x-whip', color:'#C98A3C',
      desc:'Your neck sweeps a wide circle around you, battering everything it touches.' },
    { lv:5,  name:'Tornado Mane', icon:'@t-tornado', color:'#8FD3E8',
      desc:'Two arms of spinning wind. Drags enemies inward and sets them shredding.' },
    { lv:10, name:'Cyclone King', icon:'@t-x-badge', color:'#F2B33D',
      desc:'Three colossal arms, a vortex that swallows the screen, and a storm that never stops grinding.' }
  ],
  stats(L){
    const t = L >= 10 ? 2 : L >= 5 ? 1 : 0;
    const tm = [1, 1.25, 1.65][t];
    return {
      arms: [1, 2, 3][t],
      len: (72 + 7 * L) * [1, 1.22, 1.5][t],
      dmg: (14 + 5.5 * L) * [1, 1.2, 1.55][t],
      spin: (2.0 + 0.1 * L) + [0, 0.5, 1.0][t],
      thick: (15 + 1.1 * L) * tm,
      hitcd: Math.max(0.18, 0.44 - 0.014 * L),
      pull: [0, 130, 260][t],
      burn: [0, 0.3, 0.6][t] * (14 + 5.5 * L),
      kb: [180, 90, 60][t]
    };
  },
  init(i){ i.ang = 0; },
  update(inst, dt){
    const s = inst.s;
    inst.ang += s.spin * dt / Math.max(0.35, haste());
    if (inst.ang > TAU){ inst.ang -= TAU; sfx('whoosh', 0.4); }
    const near = enemiesNear(P.x, P.y, s.len + 60);
    for (let a = 0; a < s.arms; a++){
      const ang = inst.ang + a * TAU / s.arms;
      const dx = Math.cos(ang), dy = Math.sin(ang);
      for (let i = 0; i < near.length; i++){
        const e = near[i];
        if (e.dead) continue;
        const rx = e.x - P.x, ry = e.y - P.y;
        const proj = rx * dx + ry * dy;
        if (proj < -e.r || proj > s.len + e.r) continue;
        if (Math.abs(-rx * dy + ry * dx) > s.thick + e.r) continue;
        if (!canHit(e, 'nw', s.hitcd)) continue;
        damageEnemy(e, s.dmg, { kb: s.kb, kbAngle: ang + Math.PI / 2, color:'#FFD98A', burn: s.burn, burnT: 2.4, quiet: true });
        if (Math.random() < 0.4) coneParticles(e.x, e.y, ang + Math.PI / 2, 2, inst.form.color, 150, 3, 0.7);
      }
    }
    if (s.pull){
      const pull = enemiesNear(P.x, P.y, s.len * 1.3, _q2);
      for (let i = 0; i < pull.length; i++){
        const e = pull[i];
        if (e.dead || e.big) continue;
        const a = Math.atan2(P.y - e.y, P.x - e.x);
        e.kx += Math.cos(a) * s.pull * dt * e.kbRes;
        e.ky += Math.sin(a) * s.pull * dt * e.kbRes;
      }
    }
    if (inst.tier > 0 && Math.random() < dt * 22){
      const a = Math.random() * TAU, d = rand(s.len * 0.4, s.len);
      addParticle(P.x + Math.cos(a) * d, P.y + Math.sin(a) * d,
        Math.cos(a + 1.5) * 90, Math.sin(a + 1.5) * 90, rand(2, 5), 0.4, inst.form.color, { glow:true, drag:1.4 });
    }
  },
  drawOver(inst, ctx){
    const s = inst.s, c = inst.form.color;
    const base = inst.tier ? c : '#D9A55C';
    /* Each blade starts a short distance clear of the player's own body so
       that two or three arms read as distinct limbs radiating outward,
       rather than fusing through the center into one lens-shaped blob. */
    const r0 = Math.max(20, s.thick * 0.5);
    const bow = -s.len * 0.15;
    for (let a = 0; a < s.arms; a++){
      const ang = inst.ang + a * TAU / s.arms;
      const ox = P.x + Math.cos(ang) * r0, oy = P.y + Math.sin(ang) * r0;
      const ex = P.x + Math.cos(ang) * s.len, ey = P.y + Math.sin(ang) * s.len;

      ctx.globalAlpha = 0.22;
      taperedLimb(ctx, ox, oy, ex, ey, bow, s.thick * 1.5, s.thick * 0.55, c);
      ctx.globalAlpha = 1;

      const mid = taperedLimb(ctx, ox, oy, ex, ey, bow, s.thick * 0.95, s.thick * 0.3, base);

      ctx.globalAlpha = 0.32;
      taperedLimb(ctx, ox, oy, ex, ey, bow, s.thick * 0.26, s.thick * 0.08, '#FFF3CC');
      ctx.globalAlpha = 1;

      if (inst.tier === 0){
        /* base form: a literal neck, so it carries the coat's own spots and
           ends in a rounded hoof-like knuckle */
        for (let k = 2; k < mid.length - 1; k += 3){
          const [mx, my, mang] = mid[k];
          const sz = s.thick * (0.2 - k * 0.01);
          if (sz <= 0.6) continue;
          ctx.save(); ctx.translate(mx, my); ctx.rotate(mang);
          ctx.fillStyle = '#8A5A24';
          ctx.beginPath(); ctx.ellipse(0, 0, sz * 1.3, sz, 0, 0, TAU); ctx.fill();
          ctx.restore();
        }
        const tip = mid[mid.length - 1];
        fillCircle(ctx, tip[0], tip[1], s.thick * 0.42, '#E0B571');
        fillCircle(ctx, tip[0] - Math.cos(tip[2]) * s.thick * 0.12,
                         tip[1] - Math.sin(tip[2]) * s.thick * 0.12, s.thick * 0.18, '#4A2E12');
        fillCircle(ctx, tip[0] + Math.cos(tip[2] + 1.3) * s.thick * 0.15,
                         tip[1] + Math.sin(tip[2] + 1.3) * s.thick * 0.1, s.thick * 0.09, 'rgba(255,255,255,.5)');
      } else {
        /* evolved forms: wind, so streaks along the blade and a small
           vortex glyph spinning at the tip instead of a fleshy knuckle */
        ctx.strokeStyle = 'rgba(255,255,255,.4)'; ctx.lineWidth = 1.6;
        for (let k = 1; k < mid.length - 2; k += 2){
          const [mx, my, mang] = mid[k];
          const half = s.thick * 0.28;
          ctx.beginPath();
          ctx.moveTo(mx - Math.cos(mang) * half, my - Math.sin(mang) * half);
          ctx.lineTo(mx + Math.cos(mang) * half, my + Math.sin(mang) * half);
          ctx.stroke();
        }
        const tip = mid[mid.length - 1];
        ctx.save(); ctx.translate(tip[0], tip[1]); ctx.rotate(G.time * 8 * (a % 2 === 0 ? 1 : -1));
        ctx.strokeStyle = inst.tier === 2 ? '#FFF3CC' : '#EAF7FF';
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let sp = 0; sp <= 14; sp++){
          const tt = sp / 14, rr = s.thick * 0.55 * tt, aa = tt * Math.PI * 2.6;
          const px = Math.cos(aa) * rr, py = Math.sin(aa) * rr;
          if (sp === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
        }
        ctx.stroke();
        ctx.restore();
        if (inst.tier === 2) ringPath(ctx, tip[0], tip[1], s.thick * 0.75, 2, '#FFF3CC', 0.5);
      }
    }
    if (inst.tier){
      ringPath(ctx, P.x, P.y, s.len * 1.02, 2, c, 0.18 + 0.1 * Math.sin(G.time * 6));
      if (inst.tier === 2) ringPath(ctx, P.x, P.y, s.len * 0.62, 2, '#FFF3CC', 0.16);
    }
  }
},

/* ---------------------------------------------------------------- 2 */
{
  id: 'hoof_quake', icon: '@t-x-hoofcrack', rarity: 'common', type: 'weapon',
  forms: [
    { lv:1,  name:'Hoof Quake',        icon:'@t-x-hoofcrack', color:'#C98A3C',
      desc:'Slam both front hooves down. A shockwave rolls out and knocks the herd flat.' },
    { lv:5,  name:'Seismic Stampede',  icon:'@t-x-quake', color:'#E08A4A',
      desc:'Two waves, one after the other. Anything caught is stunned where it stands.' },
    { lv:10, name:'Continental Drift', icon:'@t-x-drift', color:'#F2B33D',
      desc:'Three waves crack the ground open. The fissures burn for as long as they stay open.' }
  ],
  stats(L){
    const t = L >= 10 ? 2 : L >= 5 ? 1 : 0;
    return {
      cd: Math.max(1.25, 3.4 - 0.17 * L),
      dmg: (26 + 11 * L) * [1, 1.2, 1.5][t],
      rad: (104 + 15 * L) * [1, 1.18, 1.45][t],
      rings: [1, 2, 3][t],
      stun: [0, 0.4, 0.75][t],
      fissure: t === 2,
      kb: 330 + 14 * L
    };
  },
  init(i){ i.t = 1.0; i.queue = []; },
  update(inst, dt){
    const s = inst.s;
    inst.t -= dt;
    for (let i = inst.queue.length - 1; i >= 0; i--){
      inst.queue[i].t -= dt;
      if (inst.queue[i].t <= 0){ this.fire(inst, s); inst.queue.splice(i, 1); }
    }
    if (inst.t <= 0){
      inst.t = s.cd * haste();
      this.fire(inst, s);
      for (let k = 1; k < s.rings; k++) inst.queue.push({ t: 0.22 * k });
    }
  },
  fire(inst, s){
    addShock(P.x, P.y, s.rad, 0.48, s.dmg, inst.form.color,
      { width: 14 + s.rad * 0.05, kb: s.kb, stun: s.stun });
    abilityShake(6);
    sfx('boom', 0.1);
    for (let i = 0; i < 10; i++){
      const a = Math.random() * TAU;
      addParticle(P.x + Math.cos(a) * 16, P.y + Math.sin(a) * 16,
        Math.cos(a) * rand(100, 260), Math.sin(a) * rand(100, 260), rand(3, 7), rand(0.3, 0.55), '#8A6A46', { shape:'rock' });
    }
    if (s.fissure){
      for (let i = 0; i < 3; i++){
        const a = Math.random() * TAU, d = rand(30, s.rad * 0.8);
        addZone(P.x + Math.cos(a) * d, P.y + Math.sin(a) * d, 52, 4.2, s.dmg * 0.4, '#E0742A', { grow:true });
      }
    }
  }
},

/* ---------------------------------------------------------------- 3 */
{
  id: 'spit', icon: '@t-x-drop:#A8D24A', rarity: 'common', type: 'weapon',
  forms: [
    { lv:1,  name:'Spit Barrage',  icon:'@t-x-drop:#A8D24A', color:'#A8D24A',
      desc:'Hawk up a glob of bile at the nearest thing that deserves it.' },
    { lv:5,  name:'Acid Monsoon',  icon:'@t-x-monsoon', color:'#8FE04A',
      desc:'More globs, and every hit leaves a pool of acid eating the ground.' },
    { lv:10, name:'Venom Typhoon', icon:'@t-x-typhoon', color:'#B6FF5C',
      desc:'Homing venom that punches through the front rank and drowns the rest in poison.' }
  ],
  stats(L){
    const t = L >= 10 ? 2 : L >= 5 ? 1 : 0;
    return {
      cd: Math.max(0.3, 1.15 - 0.07 * L),
      count: 1 + Math.floor((L - 1) / 3) + [0, 1, 2][t],
      dmg: (18 + 7.5 * L) * [1, 1.2, 1.5][t],
      spd: 520 + 12 * L,
      pierce: [0, 0, 2][t],
      homing: [0, 0, 5.5][t],
      pool: t > 0 ? { r: 46 + 3 * L, dur: 3.0, dps: (18 + 7.5 * L) * [0, 0.42, 0.72][t] } : null,
      rad: 4.5 + 0.45 * L
    };
  },
  init(i){ i.t = 0.4; },
  update(inst, dt){
    const s = inst.s;
    inst.t -= dt;
    if (inst.t > 0) return;
    const tgt = nearestEnemy(P.x, P.y, 760);
    if (!tgt){ inst.t = 0.18; return; }
    inst.t = s.cd * haste();
    const base = Math.atan2(tgt.y - P.y, tgt.x - P.x);
    for (let i = 0; i < s.count; i++){
      const spread = s.count > 1 ? (i - (s.count - 1) / 2) * 0.17 : 0;
      const a = base + spread + rand(-0.03, 0.03);
      addProj(P.x + Math.cos(a) * 24, P.y + Math.sin(a) * 24,
        Math.cos(a) * s.spd, Math.sin(a) * s.spd, s.rad, s.dmg, inst.form.color,
        { pierce: s.pierce, homing: s.homing, pool: s.pool, life: 1.7, kind:'spit' });
    }
    sfx('spit', 0.06);
  }
},

/* ---------------------------------------------------------------- 4 */
{
  id: 'thorn_halo', icon: '@t-x-grass', rarity: 'rare', type: 'weapon',
  forms: [
    { lv:1,  name:'Thorn Halo',   icon:'@t-x-thornhalo', color:'#7E9B4E',
      desc:'Acacia thorns snagged in your coat, orbiting and cutting whatever brushes past.' },
    { lv:5,  name:'Acacia Storm', icon:'@t-x-tree', color:'#9BC45C',
      desc:'A second ring spins the other way. Cuts leave enemies bleeding out.' },
    { lv:10, name:'Thornado',     icon:'@t-x-thornado', color:'#C7F06A',
      desc:'The rings breathe in and out, sweeping the whole floor and tearing deep wounds.' }
  ],
  stats(L){
    const t = L >= 10 ? 2 : L >= 5 ? 1 : 0;
    return {
      count: 2 + Math.floor(L / 2) + [0, 1, 2][t],
      rings: [1, 2, 2][t],
      rad: (84 + 5 * L) * [1, 1.1, 1.3][t],
      spin: 2.0 + 0.09 * L,
      dmg: (12 + 5.2 * L) * [1, 1.25, 1.6][t],
      hitcd: Math.max(0.24, 0.58 - 0.016 * L),
      bleed: [0, 0.34, 0.7][t] * (12 + 5.2 * L),
      pulse: t === 2,
      size: 7 + 0.5 * L
    };
  },
  init(i){ i.ang = 0; i.sndT = 1.0; },
  update(inst, dt){
    const s = inst.s;
    inst.ang += s.spin * dt / Math.max(0.35, haste());
    inst.sndT -= dt;
    if (inst.sndT <= 0){ inst.sndT = 1.3 / Math.max(0.35, haste()); sfx('rustle', 0.5); }
    const pulse = s.pulse ? 1 + 0.42 * Math.sin(G.time * 2.1) : 1;
    inst.pulse = pulse;
    for (let ring = 0; ring < s.rings; ring++){
      const dir = ring === 0 ? 1 : -1;
      const rr = s.rad * (ring === 0 ? 1 : 0.58) * pulse;
      const n = ring === 0 ? s.count : Math.max(2, s.count - 1);
      for (let i = 0; i < n; i++){
        const a = inst.ang * dir + i * TAU / n;
        const tx = P.x + Math.cos(a) * rr, ty = P.y + Math.sin(a) * rr;
        const near = enemiesNear(tx, ty, s.size + 30);
        for (let k = 0; k < near.length; k++){
          const e = near[k];
          if (e.dead) continue;
          const dx = e.x - tx, dy = e.y - ty;
          if (dx * dx + dy * dy > (e.r + s.size) * (e.r + s.size)) continue;
          if (!canHit(e, 'th' + ring, s.hitcd)) continue;
          damageEnemy(e, s.dmg, { kb: 120, sx: tx, sy: ty, color:'#CFE8A0', burn: s.bleed, burnT: 2.0, quiet: true });
        }
      }
    }
  },
  drawOver(inst, ctx){
    const s = inst.s, c = inst.form.color, pulse = inst.pulse || 1;
    for (let ring = 0; ring < s.rings; ring++){
      const dir = ring === 0 ? 1 : -1;
      const rr = s.rad * (ring === 0 ? 1 : 0.58) * pulse;
      const n = ring === 0 ? s.count : Math.max(2, s.count - 1);
      for (let i = 0; i < n; i++){
        const a = inst.ang * dir + i * TAU / n;
        const tx = P.x + Math.cos(a) * rr, ty = P.y + Math.sin(a) * rr;
        ctx.save(); ctx.translate(tx, ty); ctx.rotate(a + G.time * 5 * dir);
        ctx.fillStyle = c;
        ctx.beginPath();
        ctx.moveTo(0, -s.size * 1.5); ctx.lineTo(s.size * 0.7, s.size * 0.8); ctx.lineTo(-s.size * 0.7, s.size * 0.8);
        ctx.closePath(); ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,.38)';
        ctx.beginPath(); ctx.moveTo(0, -s.size * 1.5); ctx.lineTo(s.size * 0.24, s.size * 0.2); ctx.lineTo(-s.size * 0.24, s.size * 0.2);
        ctx.closePath(); ctx.fill();
        ctx.restore();
      }
      if (inst.tier) ringPath(ctx, P.x, P.y, rr, 1.5, c, 0.14);
    }
  }
},

/* ---------------------------------------------------------------- 5 */
{
  id: 'sun_beam', icon: '@t-x-sun', rarity: 'epic', type: 'weapon',
  forms: [
    { lv:1,  name:'Sun Beam',      icon:'@t-x-sun', color:'#F2B33D',
      desc:'Focus the midday sun through your eyes into a sweeping line of heat.' },
    { lv:5,  name:'Solar Lance',   icon:'@t-x-lance', color:'#FFD166',
      desc:'Two beams, opposite each other, wider and hotter. They sweep the arena clean.' },
    { lv:10, name:'Supernova Ray', icon:'@t-sun-electricity', color:'#FFF3CC',
      desc:'Four beams, and the ground they cross keeps burning long after they pass.' }
  ],
  stats(L){
    const t = L >= 10 ? 2 : L >= 5 ? 1 : 0;
    return {
      cd: Math.max(1.8, 5.6 - 0.24 * L),
      dur: 1.3 + 0.13 * L,
      beams: [1, 2, 4][t],
      dps: (44 + 21 * L) * [1, 1.15, 1.4][t],
      width: (12 + 1.8 * L) * [1, 1.2, 1.4][t],
      sweep: 1.25 + 0.05 * L,
      tick: 0.2,
      scorch: t === 2,
      len: 980
    };
  },
  init(i){ i.t = 2.0; i.active = 0; i.ang = 0; i.scorchT = 0; },
  update(inst, dt){
    const s = inst.s;
    if (inst.active > 0){
      inst.active -= dt;
      inst.ang += s.sweep * dt;
      inst.scorchT -= dt;
      for (let b = 0; b < s.beams; b++){
        const ang = inst.ang + b * TAU / s.beams;
        const dx = Math.cos(ang), dy = Math.sin(ang);
        const list = G.enemies;
        for (let i = 0; i < list.length; i++){
          const e = list[i];
          if (e.dead) continue;
          const rx = e.x - P.x, ry = e.y - P.y;
          const proj = rx * dx + ry * dy;
          if (proj < 0 || proj > s.len) continue;
          if (Math.abs(-rx * dy + ry * dx) > s.width * 0.5 + e.r) continue;
          if (!canHit(e, 'sb', s.tick)) continue;
          damageEnemy(e, s.dps * s.tick, { color:'#FFF1C2', burn: s.dps * 0.22, burnT: 1.6, quiet: true });
          if (Math.random() < 0.5) coneParticles(e.x, e.y, ang, 2, '#FFE6A3', 160, 3, 0.9);
        }
        if (s.scorch && inst.scorchT <= 0){
          const d = rand(80, s.len * 0.55);
          addZone(P.x + dx * d, P.y + dy * d, 40, 2.6, s.dps * 0.3, '#F2B33D', { grow: true });
        }
      }
      if (s.scorch && inst.scorchT <= 0) inst.scorchT = 0.3;
      if (inst.active <= 0) inst.t = s.cd * haste();
      return;
    }
    inst.t -= dt;
    if (inst.t <= 0){
      inst.active = s.dur;
      const tgt = nearestEnemy(P.x, P.y, 900);
      inst.ang = tgt ? Math.atan2(tgt.y - P.y, tgt.x - P.x) : P.aim;
      sfx('zap', 0.1);
      SFX.whoosh();
      screenFlash(inst.form.color, 0.1, 0.18);
    }
  },
  drawOver(inst, ctx){
    if (inst.active <= 0) return;
    const s = inst.s;
    const fade = clamp(inst.active / 0.25, 0, 1) * clamp((s.dur - inst.active) / 0.12, 0, 1);
    for (let b = 0; b < s.beams; b++){
      const ang = inst.ang + b * TAU / s.beams;
      const ex = P.x + Math.cos(ang) * s.len, ey = P.y + Math.sin(ang) * s.len;
      ctx.lineCap = 'round';
      ctx.globalAlpha = 0.20 * fade; ctx.strokeStyle = inst.form.color; ctx.lineWidth = s.width * 2.1;
      ctx.beginPath(); ctx.moveTo(P.x, P.y); ctx.lineTo(ex, ey); ctx.stroke();
      ctx.globalAlpha = 0.65 * fade; ctx.lineWidth = s.width;
      ctx.beginPath(); ctx.moveTo(P.x, P.y); ctx.lineTo(ex, ey); ctx.stroke();
      ctx.globalAlpha = fade; ctx.strokeStyle = '#FFFBEF'; ctx.lineWidth = s.width * 0.32;
      ctx.beginPath(); ctx.moveTo(P.x, P.y); ctx.lineTo(ex, ey); ctx.stroke();
      ctx.globalAlpha = 1; ctx.lineCap = 'butt';
    }
    softBlob(ctx, P.x, P.y, s.width * 1.7, '#FFF3CC', 0.5 * fade);
  }
},

/* ---------------------------------------------------------------- 6 */
{
  id: 'stampede', icon: '@t-x-stampede', rarity: 'epic', type: 'weapon',
  forms: [
    { lv:1,  name:'Stampede',            icon:'@t-x-stampede', color:'#D8C39B',
      desc:'Call ghost giraffes out of the heat haze. They trample straight through the field.' },
    { lv:5,  name:'Thundering Herd',     icon:'@t-x-herd', color:'#EBD9B4',
      desc:'A bigger herd, and the dust they kick up bogs down anything left standing.' },
    { lv:10, name:'Ancestral Migration', icon:'@t-x-migration', color:'#FFF3CC',
      desc:'Every giraffe that ever lived runs with you. They hunt, and nothing they hit gets up quickly.' }
  ],
  stats(L){
    const t = L >= 10 ? 2 : L >= 5 ? 1 : 0;
    return {
      cd: Math.max(2.4, 7.2 - 0.38 * L),
      count: 2 + Math.floor(L / 2) + [0, 1, 3][t],
      dmg: (34 + 16 * L) * [1, 1.2, 1.5][t],
      spd: 700 + 16 * L,
      width: (26 + 2 * L) * [1, 1.15, 1.35][t],
      dust: t > 0,
      stun: [0, 0.25, 0.6][t],
      seek: t === 2 ? 1.5 : 0,
      kb: 420
    };
  },
  init(i){ i.t = 2.2; i.runners = []; i.dustT = 0; },
  update(inst, dt){
    const s = inst.s;
    inst.t -= dt;
    if (inst.t <= 0){
      inst.t = s.cd * haste();
      const base = Math.random() * TAU;
      for (let i = 0; i < s.count; i++){
        const a = base + rand(-0.35, 0.35);
        const off = (i - (s.count - 1) / 2) * s.width * 1.5;
        const px = -Math.sin(a) * off, py = Math.cos(a) * off;
        inst.runners.push({
          x: P.x - Math.cos(a) * 760 + px, y: P.y - Math.sin(a) * 760 + py,
          a: a, life: 2.4, hit: new Set(), t: 0
        });
      }
      SFX.whoosh(); sfx('boom', 0.2); abilityShake(5);
    }
    for (let i = inst.runners.length - 1; i >= 0; i--){
      const r = inst.runners[i];
      r.life -= dt; r.t += dt;
      if (s.seek){
        const tgt = nearestEnemy(r.x, r.y, 420);
        if (tgt){
          const want = Math.atan2(tgt.y - r.y, tgt.x - r.x);
          r.a += clamp(angDiff(want, r.a), -s.seek * dt, s.seek * dt);
        }
      }
      r.x += Math.cos(r.a) * s.spd * dt;
      r.y += Math.sin(r.a) * s.spd * dt;
      const near = enemiesNear(r.x, r.y, s.width + 40);
      for (let k = 0; k < near.length; k++){
        const e = near[k];
        if (e.dead || r.hit.has(e)) continue;
        const dx = e.x - r.x, dy = e.y - r.y;
        if (dx * dx + dy * dy > (s.width + e.r) * (s.width + e.r)) continue;
        r.hit.add(e);
        damageEnemy(e, s.dmg, { kb: s.kb, kbAngle: r.a, color:'#FFE8BE', stun: s.stun });
        coneParticles(e.x, e.y, r.a, 5, '#D8C39B', 240, 4, 0.6);
      }
      if (s.dust){
        r.dust = (r.dust === undefined ? 0 : r.dust) - dt;
        if (r.dust <= 0){
          r.dust = 0.22;
          addZone(r.x, r.y, 42, 1.5, s.dmg * 0.12, '#A9997F', { slow: 0.55, grow: true });
        }
      }
      if (Math.random() < dt * 30)
        addParticle(r.x, r.y, Math.cos(r.a + Math.PI) * 80 + rand(-40, 40), Math.sin(r.a + Math.PI) * 80 + rand(-40, 40),
          rand(4, 9), rand(0.3, 0.6), '#B9A886', { drag: 1.5 });
      if (r.life <= 0 || r.x < -400 || r.y < -400 || r.x > ARENA_W + 400 || r.y > ARENA_H + 400) inst.runners.splice(i, 1);
    }
  },
  drawOver(inst, ctx){
    const s = inst.s, c = inst.form.color;
    for (let i = 0; i < inst.runners.length; i++){
      const r = inst.runners[i];
      const a = clamp(r.life / 0.4, 0, 1) * 0.85;
      ctx.save(); ctx.translate(r.x, r.y); ctx.rotate(r.a); ctx.globalAlpha = a;
      /* motion streaks */
      ctx.strokeStyle = c; ctx.lineWidth = 3; ctx.globalAlpha = a * 0.35;
      for (let k = -2; k <= 2; k++){ ctx.beginPath(); ctx.moveTo(-70, k * 11); ctx.lineTo(-18, k * 9); ctx.stroke(); }
      ctx.globalAlpha = a;
      ctx.fillStyle = c;
      ctx.beginPath(); ctx.ellipse(0, 0, s.width * 0.95, s.width * 0.55, 0, 0, TAU); ctx.fill();
      ctx.beginPath(); ctx.ellipse(s.width * 0.85, -s.width * 0.42, s.width * 0.42, s.width * 0.2, -0.5, 0, TAU); ctx.fill();
      fillCircle(ctx, s.width * 1.15, -s.width * 0.72, s.width * 0.22, c);
      ctx.globalAlpha = 1; ctx.restore();
    }
  }
},

/* ---------------------------------------------------------------- 7 */
{
  id: 'dung_mine', icon: '@t-x-mine', rarity: 'rare', type: 'weapon',
  forms: [
    { lv:1,  name:'Tail Mine',          icon:'@t-x-mine', color:'#8A6A46',
      desc:'Leave something behind you. It goes off when the wrong animal steps near.' },
    { lv:5,  name:'Fermented Fury',     icon:'@t-x-brew', color:'#9FBF52',
      desc:'It has been sitting in the sun. The blast leaves a cloud that keeps working.' },
    { lv:10, name:'Methane Cataclysm',  icon:'@t-flame', color:'#FF8A3D',
      desc:'Every blast sets off the next one. A single step can level the whole field.' }
  ],
  stats(L){
    const t = L >= 10 ? 2 : L >= 5 ? 1 : 0;
    return {
      cd: Math.max(0.85, 2.5 - 0.13 * L),
      dmg: (32 + 15 * L) * [1, 1.22, 1.55][t],
      rad: (76 + 9 * L) * [1, 1.15, 1.4][t],
      maxMines: 3 + Math.floor(L / 2) + [0, 1, 3][t],
      fuse: 9,
      cloud: t > 0 ? { dur: 3.2, dps: (32 + 15 * L) * [0, 0.3, 0.55][t] } : null,
      chain: t === 2,
      trigger: 0.55
    };
  },
  init(i){ i.t = 0.8; i.mines = []; },
  update(inst, dt){
    const s = inst.s;
    inst.t -= dt;
    if (inst.t <= 0){
      inst.t = s.cd * haste();
      inst.mines.push({ x: P.x - P.vx * 0.06, y: P.y - P.vy * 0.06, t: s.fuse, arm: 0.35, pop: 0 });
      if (inst.mines.length > s.maxMines) inst.mines.shift();
    }
    /* Walk a snapshot: an explosion can chain-detonate other mines, which
       mutates inst.mines underneath a plain index loop. */
    const list = inst.mines.slice();
    for (let i = 0; i < list.length; i++){
      const m = list[i];
      const idx = inst.mines.indexOf(m);
      if (idx < 0) continue;                       /* already taken out by a chain */
      m.t -= dt; m.arm -= dt; m.pop += dt;
      let blow = m.t <= 0;
      if (!blow && m.arm <= 0){
        const near = enemiesNear(m.x, m.y, s.rad * s.trigger);
        for (let k = 0; k < near.length; k++){
          const e = near[k];
          if (e.dead) continue;
          const dx = e.x - m.x, dy = e.y - m.y, rr = s.rad * s.trigger + e.r;
          if (dx * dx + dy * dy < rr * rr){ blow = true; break; }
        }
      }
      if (blow){
        inst.mines.splice(inst.mines.indexOf(m), 1);
        this.explode(inst, s, m.x, m.y, 0);
      }
    }
  },
  explode(inst, s, x, y, depth){
    addShock(x, y, s.rad, 0.34, s.dmg, inst.form.color, { width: 16, kb: 340, filled: true });
    burstParticles(x, y, 16, inst.form.color, 300, 6);
    burstParticles(x, y, 8, '#FFD08A', 220, 4, { glow: true });
    abilityShake(5); sfx('boom', 0.09);
    if (s.cloud) addZone(x, y, s.rad * 0.78, s.cloud.dur, s.cloud.dps, '#9FBF52', { grow: true });
    if (s.chain && depth < 4){
      /* Pull every mine in range out of the list BEFORE recursing. Exploding
         while iterating lets the recursive call splice indices out from under
         this loop, which walks it off the end of the array. */
      const chained = [];
      for (let i = inst.mines.length - 1; i >= 0; i--){
        const m = inst.mines[i];
        if (!m) continue;
        const dx = m.x - x, dy = m.y - y;
        if (dx * dx + dy * dy < (s.rad * 1.4) * (s.rad * 1.4)){
          inst.mines.splice(i, 1);
          chained.push(m);
        }
      }
      for (let i = 0; i < chained.length; i++) this.explode(inst, s, chained[i].x, chained[i].y, depth + 1);
    }
  },
  drawUnder(inst, ctx){
    const s = inst.s;
    for (let i = 0; i < inst.mines.length; i++){
      const m = inst.mines[i];
      const pulse = 0.5 + 0.5 * Math.sin(m.pop * 7);
      softBlob(ctx, m.x, m.y, s.rad * s.trigger, inst.form.color, 0.07 + 0.05 * pulse);
      ctx.fillStyle = inst.tier === 2 ? '#6B3A1E' : '#6B4A2C';
      ctx.beginPath(); ctx.ellipse(m.x, m.y, 12, 9, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = inst.form.color;
      ctx.beginPath(); ctx.ellipse(m.x - 2, m.y - 3, 7, 5, 0.4, 0, TAU); ctx.fill();
      fillCircle(ctx, m.x + 4, m.y - 6, 2 + pulse * 1.6, m.arm > 0 ? '#7E9B4E' : '#FF6A4A');
    }
  }
},

/* ---------------------------------------------------------------- 8 */
{
  id: 'lightning', icon: '@t-x-tongue', rarity: 'epic', type: 'weapon',
  forms: [
    { lv:1,  name:'Lightning Tongue',   icon:'@t-x-tongue', color:'#9AD8FF',
      desc:'Forty centimetres of prehensile tongue, now carrying a static charge that jumps between targets.' },
    { lv:5,  name:'Storm Tongue',       icon:'@t-cloud-storm', color:'#BFE9FF',
      desc:'Longer arcs, more jumps, and everything it touches seizes up.' },
    { lv:10, name:'Savanna Judgment',  icon:'@t-x-judgement', color:'#FFFFFF',
      desc:'The sky picks its own targets. Bolts fall while the chain keeps running.' }
  ],
  stats(L){
    const t = L >= 10 ? 2 : L >= 5 ? 1 : 0;
    return {
      cd: Math.max(0.7, 2.9 - 0.16 * L),
      dmg: (22 + 10 * L) * [1, 1.25, 1.6][t],
      chains: 2 + Math.floor(L / 2) + [0, 2, 4][t],
      range: 250 + 14 * L,
      jump: 190 + 8 * L,
      stun: [0, 0.3, 0.5][t],
      strikes: [0, 0, 3][t],
      falloff: [0.86, 0.92, 1][t]
    };
  },
  init(i){ i.t = 1.4; },
  update(inst, dt){
    const s = inst.s;
    inst.t -= dt;
    if (inst.t > 0) return;
    const first = nearestEnemy(P.x, P.y, s.range);
    if (!first){ inst.t = 0.2; return; }
    inst.t = s.cd * haste();
    const seen = new Set();
    let cur = first, cx = P.x, cy = P.y, dmg = s.dmg;
    const pts = [{ x: P.x, y: P.y - 12 }];
    for (let i = 0; i <= s.chains && cur; i++){
      seen.add(cur);
      pts.push({ x: cur.x, y: cur.y });
      damageEnemy(cur, dmg, { color:'#DFF3FF', stun: s.stun, kb: 60, sx: cx, sy: cy });
      burstParticles(cur.x, cur.y, 4, '#DFF3FF', 170, 3, { glow: true });
      cx = cur.x; cy = cur.y; dmg *= s.falloff;
      cur = nearestEnemy(cx, cy, s.jump, seen);
    }
    G.bolts.push({ pts: pts, life: 0.24, max: 0.24, color: inst.form.color, width: 3 + inst.level * 0.22 });
    if (s.strikes){
      for (let i = 0; i < s.strikes; i++){
        const t2 = nearestEnemy(P.x + rand(-300, 300), P.y + rand(-300, 300), 420, seen);
        if (!t2) break;
        seen.add(t2);
        addShock(t2.x, t2.y, 74, 0.3, s.dmg * 1.15, '#FFFFFF', { width: 12, kb: 180, stun: s.stun });
        G.bolts.push({ pts: [{ x: t2.x + rand(-30, 30), y: t2.y - 600 }, { x: t2.x, y: t2.y }], life: 0.26, max: 0.26, color:'#FFFFFF', width: 5 });
      }
      screenFlash('#CFEAFF', 0.12, 0.16);
    }
    sfx('zap', 0.07);
  }
},

/* ---------------------------------------------------------------- 9 (passive) */
{
  id: 'weaponry', icon: '@t-x-drill', rarity: 'common', type: 'passive',
  forms: [
    { lv:1,  name:'Weapon Drill',   icon:'@t-x-drill', color:'#C98A3C',
      desc:'Drill the same strike a thousand times. Whatever you are holding hits harder and reaches further.' },
    { lv:5,  name:'Master of Arms', icon:'@t-sword', color:'#E0A24A',
      desc:'Your swing widens into a sweep and lands a second follow-up strike on every attack.' },
    { lv:10, name:'Living Armory', icon:'@t-shield-star', color:'#F2B33D',
      desc:'Every strike tears a shockwave forward, and the follow-up comes twice more.' }
  ],
  stats(L){
    const t = L >= 10 ? 2 : L >= 5 ? 1 : 0;
    return {
      dmg: 0.11 * L,
      range: 0.07 * L,
      haste: Math.min(0.34, 0.03 * L + [0, 0.03, 0.08][t]),
      arc: [0, 2.7, 3.3][t],
      kb: [1, 1.5, 1.9][t],
      echo: [0, 1, 3][t],
      wave: t === 2
    };
  },
  passive(inst, s){
    const v = inst.s;
    s.kickDmgMul += v.dmg;
    s.kickRangeMul += v.range;
    s.hasteMul *= (1 - v.haste);
    /* a weapon that already sweeps all the way round keeps its own arc */
    if (v.arc) s.kickArc = Math.max(s.kickArc, v.arc);
    s.kickKb *= v.kb;
    s.weaponEcho = Math.max(s.weaponEcho, v.echo);
    if (v.wave) s.kickWave = true;
  }
},

/* ---------------------------------------------------------------- 10 (passive) */
{
  id: 'speed', icon: '@t-wind', rarity: 'common', type: 'passive',
  forms: [
    { lv:1,  name:'Savanna Speed', icon:'@t-wind', color:'#8FD3E8',
      desc:'Longer stride, quicker turn. You cover ground the herd cannot.' },
    { lv:5,  name:'Gazelle Grace', icon:'@t-x-gazelle', color:'#A8E6F0',
      desc:'You move fast enough to hurt. The dust behind you scours anything that follows.' },
    { lv:10, name:'Windrunner',    icon:'@t-x-windrun', color:'#D6F5FF',
      desc:'Your wake becomes a cyclone — it drags, slows and grinds down the whole chase.' }
  ],
  stats(L){
    const t = L >= 10 ? 2 : L >= 5 ? 1 : 0;
    return { spd: 0.055 * L + [0, 0.06, 0.14][t], trail: [0, 14 + 5 * L, 34 + 11 * L][t], slow: [0, 0, 0.6][t], rad: [0, 26, 44][t] };
  },
  passive(inst, s){ s.speedMul += inst.s.spd; },
  init(i){ i.t = 0; },
  update(inst, dt){
    const v = inst.s;
    if (!v.trail) return;
    inst.t -= dt;
    const moving = (P.vx * P.vx + P.vy * P.vy) > 900;
    if (inst.t <= 0 && moving){
      inst.t = 0.14;
      addZone(P.x, P.y, v.rad, 1.5, v.trail, inst.form.color, { slow: v.slow || 0, grow: true });
    }
  }
},

/* ---------------------------------------------------------------- 11 (passive) */
{
  id: 'iron_hide', icon: '@t-x-shield', rarity: 'common', type: 'passive',
  forms: [
    { lv:1,  name:'Iron Hide',       icon:'@t-shield-chevron', color:'#A9B7C4',
      desc:'Thicker skin, more of it. Bigger health pool and less damage taken.' },
    { lv:5,  name:'Rhino Plate',     icon:'@t-x-rhino', color:'#C7D8E8',
      desc:'Armor that answers back — a chunk of every hit is returned as a blast.' },
    { lv:10, name:'Living Fortress', icon:'@t-x-castle', color:'#EFE6D4',
      desc:'Nothing gets through cleanly. Hits are paid back in full, and you mend as you walk.' }
  ],
  stats(L){
    const t = L >= 10 ? 2 : L >= 5 ? 1 : 0;
    return { hp: 15 * L + [0, 20, 60][t], dr: Math.min(0.34, 0.026 * L + [0, 0.04, 0.09][t]), reflect: [0, 0.45, 1.05][t], regen: [0, 0, 2.2][t] };
  },
  passive(inst, s){
    const v = inst.s;
    s.maxHpAdd += v.hp; s.dr = Math.min(0.55, s.dr + v.dr);
    s.reflect += v.reflect; s.regen += v.regen;
  }
},

/* ---------------------------------------------------------------- 12 (passive) */
{
  id: 'feast', icon: '@t-x-bird', rarity: 'rare', type: 'passive',
  forms: [
    { lv:1,  name:'Vulture\u2019s Feast', icon:'@t-x-bird', color:'#B58AC4',
      desc:'Scavengers follow you. Drops are more common and pull in from further away.' },
    { lv:5,  name:'Carrion Bloom',        icon:'@t-x-flower', color:'#C79AD6',
      desc:'Corpses burst. Kills have a good chance to detonate into the crowd.' },
    { lv:10, name:'Circle of Life',       icon:'@t-x-cycle', color:'#9A5BD6',
      desc:'Every death feeds you — bigger bursts, and the blast mends your own wounds.' }
  ],
  stats(L){
    const t = L >= 10 ? 2 : L >= 5 ? 1 : 0;
    return { pickup: 0.22 * L, drop: 0.14 * L, xp: 0.035 * L,
      chance: [0, 0.26, 0.5][t], blast: [0, 34 + 12 * L, 80 + 26 * L][t], brad: [0, 84, 130][t], heal: [0, 0, 2.5][t] };
  },
  passive(inst, s){
    const v = inst.s;
    s.pickupMul += v.pickup; s.dropMul += v.drop; s.xpMul += v.xp;
  },
  onKill(inst, e){
    const v = inst.s;
    if (!v.chance || Math.random() > v.chance) return;
    addShock(e.x, e.y, v.brad, 0.3, v.blast, inst.form.color, { width: 13, kb: 200, filled: true });
    burstParticles(e.x, e.y, 10, inst.form.color, 230, 5, { glow: true });
    sfx('boom', 0.15);
    if (v.heal && P.hp < P.maxHp){
      P.hp = Math.min(P.maxHp, P.hp + v.heal);
      if (Math.random() < 0.3) addText(P.x, P.y - 40, '+' + v.heal, '#7EE08A', 13, false);
    }
  }
},

/* ---------------------------------------------------------------- 13 (passive) */
{
  id: 'frenzy', icon: '@t-x-horn', rarity: 'rare', type: 'passive',
  forms: [
    { lv:1,  name:'Frenzy Horn',        icon:'@t-x-horn', color:'#E0745A',
      desc:'Ossicones humming with adrenaline. Everything you own fires faster.' },
    { lv:5,  name:'Blood Rhythm',       icon:'@t-x-blood', color:'#E8604A',
      desc:'Kills stack momentum. The longer you keep killing, the faster you get.' },
    { lv:10, name:'Berserker Ossicone', icon:'@t-x-ossicone', color:'#FF5A3C',
      desc:'Momentum caps far higher, and your strikes land critical hits far more often.' }
  ],
  stats(L){
    const t = L >= 10 ? 2 : L >= 5 ? 1 : 0;
    return { haste: Math.min(0.46, 0.042 * L + [0, 0.03, 0.08][t]),
      rageMax: [0, 24, 55][t], ragePer: 0.008, crit: [0, 0.04, 0.15][t], critMul: [0, 0.15, 0.6][t] };
  },
  passive(inst, s){
    const v = inst.s;
    s.hasteMul *= (1 - v.haste);
    s.crit += v.crit; s.critMul += v.critMul;
    s.rageMax = Math.max(s.rageMax, v.rageMax);
    s.ragePer = v.ragePer;
  },
  onKill(inst){ if (inst.s.rageMax) P.rage = Math.min(inst.s.rageMax, P.rage + 1); }
},

/* ---------------------------------------------------------------- 14 (passive) */
{
  id: 'fleece', icon: '@t-coin', rarity: 'epic', type: 'passive',
  forms: [
    { lv:1,  name:'Golden Fleece', icon:'@t-x-fleece', color:'#F2B33D',
      desc:'Your coat catches the light and the loot. More experience, more gold from the run.' },
    { lv:5,  name:'Midas Mane',    icon:'@t-x-mane', color:'#FFD166',
      desc:'Dead animals drop nuggets. The savanna starts paying for itself.' },
    { lv:10, name:'Sun Crown',     icon:'@t-x-suncrown', color:'#FFF3CC',
      desc:'You burn like the noon sun — nearby enemies cook, and the gold never stops falling.' }
  ],
  stats(L){
    const t = L >= 10 ? 2 : L >= 5 ? 1 : 0;
    return { xp: 0.075 * L, gold: 0.1 * L, pickup: 0.09 * L,
      nugget: [0, 0.13, 0.28][t], aura: [0, 0, 16 + 6 * L][t], arad: [0, 0, 140][t] };
  },
  passive(inst, s){
    const v = inst.s;
    s.xpMul += v.xp; s.goldMul += v.gold; s.pickupMul += v.pickup;
  },
  init(i){ i.t = 0; },
  update(inst, dt){
    const v = inst.s;
    if (!v.aura) return;
    inst.t -= dt;
    if (inst.t > 0) return;
    inst.t = 0.4;
    const near = enemiesNear(P.x, P.y, v.arad);
    for (let i = 0; i < near.length; i++){
      const e = near[i];
      if (e.dead) continue;
      const dx = e.x - P.x, dy = e.y - P.y;
      if (dx * dx + dy * dy > v.arad * v.arad) continue;
      damageEnemy(e, v.aura, { color:'#FFE6A3', noCrit: true, quiet: true, silent: Math.random() > 0.35 });
    }
  },
  drawUnder(inst, ctx){
    if (!inst.s.aura) return;
    const pulse = 0.09 + 0.05 * Math.sin(G.time * 3);
    softBlob(ctx, P.x, P.y, inst.s.arad, '#F2B33D', pulse);
    ringPath(ctx, P.x, P.y, inst.s.arad, 2, '#FFD166', 0.22);
  },
  onKill(inst, e){
    if (inst.s.nugget && Math.random() < inst.s.nugget) addPickup(e.x, e.y, 'gold');
  }
},

/* ---------------------------------------------------------------- 15 (legendary) */
{
  id: 'starfall', icon: '@t-x-starhorn', rarity: 'legendary', type: 'weapon',
  forms: [
    { lv:1,  name:'Starfall Horn',        icon:'@t-x-starhorn', color:'#FFD84D',
      desc:'Point your ossicones at the sky and pull a falling star down wherever the herd is thickest.' },
    { lv:5,  name:'Comet Mane',           icon:'@t-meteor', color:'#FF8A4A',
      desc:'The stars fall faster and hotter, and leave the ground burning where they land.' },
    { lv:10, name:'Celestial Reckoning',  icon:'@t-x-reckoning', color:'#C9A0FF',
      desc:'The whole sky answers. Stars fall almost without pause, and starlight itself sears anything nearby.' }
  ],
  stats(L){
    const t = L >= 10 ? 2 : L >= 5 ? 1 : 0;
    return {
      cd: Math.max(1.15, 3.6 - 0.18 * L) * [1, 0.78, 0.6][t],
      meteors: 1 + Math.floor(L / 3) + [0, 1, 3][t],
      dmg: (46 + 20 * L) * [1, 1.25, 1.6][t],
      rad: (86 + 5 * L) * [1, 1.15, 1.35][t],
      warn: 0.8,
      crater: t > 0,
      craterDur: 3.0,
      craterDps: (46 + 20 * L) * [0, 0.3, 0.5][t],
      aura: t === 2 ? (26 + 5 * L) : 0,
      auraRad: 150,
      kb: 260
    };
  },
  init(i){ i.t = 1.1; i.warnings = []; i.auraT = 0; },
  update(inst, dt){
    const s = inst.s;
    for (let i = inst.warnings.length - 1; i >= 0; i--){
      const w = inst.warnings[i];
      w.t -= dt;
      if (w.t <= 0){
        addShock(w.x, w.y, s.rad, 0.4, s.dmg, inst.form.color, { width: s.rad * 0.5, kb: s.kb, filled: true });
        burstParticles(w.x, w.y, 20, inst.form.color, 280, 6, { glow: true });
        burstParticles(w.x, w.y, 10, '#FFFFFF', 200, 4, { glow: true });
        abilityShake(7); sfx('boom', 0.12); screenFlash(inst.form.color, 0.08, 0.16);
        if (s.crater) addZone(w.x, w.y, s.rad * 0.7, s.craterDur, s.craterDps, inst.form.color, { grow: true });
        inst.warnings.splice(i, 1);
      }
    }
    inst.t -= dt;
    if (inst.t <= 0){
      inst.t = s.cd * haste();
      for (let k = 0; k < s.meteors; k++){
        const tgt = nearestEnemy(P.x, P.y, 760);
        let x, y;
        if (tgt && Math.random() < 0.72){ x = tgt.x + rand(-46, 46); y = tgt.y + rand(-46, 46); }
        else { const a = Math.random() * TAU, d = rand(90, 400); x = P.x + Math.cos(a) * d; y = P.y + Math.sin(a) * d; }
        inst.warnings.push({ x: x, y: y, t: s.warn, max: s.warn });
      }
      sfx('whoosh', 0.15);
    }
    if (s.aura){
      inst.auraT -= dt;
      if (inst.auraT <= 0){
        inst.auraT = 0.4;
        const near = enemiesNear(P.x, P.y, s.auraRad);
        for (let i = 0; i < near.length; i++){
          const e = near[i];
          if (e.dead) continue;
          const dx = e.x - P.x, dy = e.y - P.y;
          if (dx * dx + dy * dy > s.auraRad * s.auraRad) continue;
          damageEnemy(e, s.aura, { noCrit: true, quiet: true, color: '#E9DCFF', silent: Math.random() > 0.35 });
        }
      }
    }
  },
  drawUnder(inst, ctx){
    const s = inst.s;
    for (let i = 0; i < inst.warnings.length; i++){
      const w = inst.warnings[i];
      const k = 1 - w.t / w.max;
      ringPath(ctx, w.x, w.y, s.rad * (0.3 + k * 0.7), 3, inst.form.color, 0.5 + 0.3 * Math.sin(G.time * 20));
      softBlob(ctx, w.x, w.y, s.rad * 0.25, inst.form.color, 0.12);
      const fx = w.x - 46 * (1 - k), fy = w.y - 230 * (1 - k);
      ctx.strokeStyle = inst.form.color; ctx.lineWidth = 2; ctx.globalAlpha = 0.7;
      ctx.beginPath(); ctx.moveTo(fx, fy); ctx.lineTo(w.x, w.y); ctx.stroke();
      ctx.globalAlpha = 1;
      fillCircle(ctx, fx, fy, 3, '#FFFFFF');
    }
    if (s.aura){
      softBlob(ctx, P.x, P.y, s.auraRad, inst.form.color, 0.06 + 0.03 * Math.sin(G.time * 3));
      ringPath(ctx, P.x, P.y, s.auraRad, 1.5, '#E9DCFF', 0.18);
    }
  }
},

/* ---------------------------------------------------------------- 16 */
{
  id: 'thorn_crown', icon: '@t-x-thorncrown', rarity: 'epic', type: 'weapon',
  forms: [
    { lv:1,  name:'Thorn Crown',     icon:'@t-crown', color:'#6FA83C',
      desc:'A ring of hooked acacia thorns tears loose from your mane and bursts outward in every direction.' },
    { lv:5,  name:'Briarweave Crown', icon:'@t-x-briar', color:'#A8D95C',
      desc:'Every thorn trails living bramble. Wherever one lands, thorny vines keep tearing at the ground.' },
    { lv:10, name:'Bramble Monarch',  icon:'@t-x-monarch', color:'#F0DFA0',
      desc:'The crown fires twice in quick succession, and the second volley punches clean through the herd.' }
  ],
  stats(L){
    const t = L >= 10 ? 2 : L >= 5 ? 1 : 0;
    return {
      cd: Math.max(1.5, 3.4 - 0.14 * L),
      count: 2 * (6 + Math.floor(L / 3) + [0, 2, 4][t]),
      dmg: (12 + 5 * L) * [1, 1.25, 1.6][t],
      spd: 320 + 6 * L,
      pierce: [0, 1, 3][t],
      life: [0.95, 1.25, 1.55][t],
      pool: t > 0 ? { r: 38 + 2.2 * L, dur: 2.6, dps: (12 + 5 * L) * [0, 0.3, 0.5][t] } : null,
      r: (5 + 0.15 * L) * 1.25,
      volleys: t === 2 ? 2 : 1
    };
  },
  init(i){ i.t = 1.0; i.queue = []; },
  update(inst, dt){
    const s = inst.s;
    for (let i = inst.queue.length - 1; i >= 0; i--){
      inst.queue[i].t -= dt;
      if (inst.queue[i].t <= 0){ this.fire(inst, s, inst.queue[i].off); inst.queue.splice(i, 1); }
    }
    inst.t -= dt;
    if (inst.t <= 0){
      inst.t = s.cd * haste();
      this.fire(inst, s, 0);
      if (s.volleys > 1) inst.queue.push({ t: 0.26, off: Math.PI / s.count });
    }
  },
  fire(inst, s, off){
    const base = Math.random() * TAU;
    for (let i = 0; i < s.count; i++){
      const a = base + off + i * TAU / s.count;
      addProj(P.x + Math.cos(a) * 22, P.y + Math.sin(a) * 22,
        Math.cos(a) * s.spd, Math.sin(a) * s.spd, s.r, s.dmg, inst.form.color,
        { pierce: s.pierce, life: s.life, pool: s.pool, kind: 'thorn' });
    }
    burstParticles(P.x, P.y, Math.min(14, s.count), inst.form.color, 160, 3);
    sfx('spit', 0.08);
  }
},

/* ---------------------------------------------------------------- 17 */
{
  id: 'sunfire_flies', icon: '@t-x-fly', rarity: 'epic', type: 'weapon',
  forms: [
    { lv:1,  name:'Sunfire Flies', icon:'@t-x-fly', color:'#FF9F5A',
      desc:'Two loyal fireflies orbit you, darting off to sting the nearest thing that gets too close.' },
    { lv:5,  name:'Solar Swarm',   icon:'@t-x-swarm', color:'#FFC98A',
      desc:'More fireflies join the swarm, and every sting leaves a smouldering scorch behind.' },
    { lv:10, name:'Ember Constellation', icon:'@t-stars', color:'#FFF0C2',
      desc:'The swarm ignites into a living constellation. Its light arcs between enemies like captured lightning.' }
  ],
  stats(L){
    const t = L >= 10 ? 2 : L >= 5 ? 1 : 0;
    return {
      count: 1 + Math.floor(L / 4) + [0, 1, 2][t],
      orbit: 54 + 0.8 * L,
      orbitSpd: 1.5,
      cd: Math.max(0.65, 1.5 - 0.07 * L),
      dmg: (11 + 4.5 * L) * [1, 1.25, 1.55][t],
      spd: 460 + 8 * L,
      range: 560 + 8 * L,
      jump: 200 + 6 * L,
      homing: 6.5,
      burn: t > 0 ? (11 + 4.5 * L) * 0.26 : 0,
      chain: t === 2 ? 3 + Math.floor(L / 5) : 0,
      fall: 0.82,
      r: 4.5 + 0.12 * L
    };
  },
  init(i){ i.flies = []; i.ang = 0; },
  update(inst, dt){
    const s = inst.s;
    inst.ang += s.orbitSpd * dt / Math.max(0.35, haste());
    while (inst.flies.length < s.count) inst.flies.push({ t: rand(0, s.cd), x: P.x, y: P.y });
    if (inst.flies.length > s.count) inst.flies.length = s.count;
    for (let i = 0; i < inst.flies.length; i++){
      const f = inst.flies[i];
      const a = inst.ang + i * TAU / inst.flies.length;
      f.x = P.x + Math.cos(a) * s.orbit;
      f.y = P.y + Math.sin(a) * s.orbit;
      f.t -= dt;
      if (f.t > 0) continue;
      const tgt = nearestEnemy(f.x, f.y, s.range);
      if (!tgt){ f.t = 0.15; continue; }
      f.t = s.cd * haste();
      if (s.chain){
        const seen = new Set();
        let cur = tgt, cx = f.x, cy = f.y, dmg = s.dmg;
        const pts = [{ x: f.x, y: f.y }];
        for (let k = 0; k <= s.chain && cur; k++){
          seen.add(cur);
          pts.push({ x: cur.x, y: cur.y });
          damageEnemy(cur, dmg, { color:'#FFF3B0', kb: 40, sx: cx, sy: cy, burn: s.burn });
          burstParticles(cur.x, cur.y, 3, '#FFF3B0', 140, 3, { glow: true });
          cx = cur.x; cy = cur.y; dmg *= s.fall;
          cur = nearestEnemy(cx, cy, s.jump, seen);
        }
        G.bolts.push({ pts: pts, life: 0.2, max: 0.2, color: inst.form.color, width: 2.4 });
        sfx('zap', 0.09);
      } else {
        const a2 = Math.atan2(tgt.y - f.y, tgt.x - f.x);
        addProj(f.x, f.y, Math.cos(a2) * s.spd, Math.sin(a2) * s.spd, s.r, s.dmg, inst.form.color,
          { homing: s.homing, life: 1.3, kind: 'sun', burn: s.burn });
        sfx('zap', 0.12);
      }
    }
  },
  drawOver(inst, ctx){
    const s = inst.s, c = inst.form.color;
    for (let i = 0; i < inst.flies.length; i++){
      const f = inst.flies[i];
      if (f.x === undefined) continue;
      const pulse = 0.6 + 0.4 * Math.sin(G.time * 6 + i * 2);
      softBlob(ctx, f.x, f.y, s.r * 3, c, 0.18 * pulse);
      ctx.save(); ctx.translate(f.x, f.y); ctx.rotate(G.time * 4 + i);
      ctx.fillStyle = 'rgba(255,255,255,.5)';
      ctx.beginPath(); ctx.ellipse(-s.r * 0.9, 0, s.r * 0.8, s.r * 0.35, 0.4, 0, TAU); ctx.fill();
      ctx.beginPath(); ctx.ellipse(s.r * 0.9, 0, s.r * 0.8, s.r * 0.35, -0.4, 0, TAU); ctx.fill();
      ctx.restore();
      fillCircle(ctx, f.x, f.y, s.r, c);
      fillCircle(ctx, f.x, f.y, s.r * 0.45, '#FFFBEF');
    }
  }
},

/* ---------------------------------------------------------------- 18 (epic, Chapter 8 and later) */
{
  id: 'deflector', icon: '@t-x-hexpulse', rarity: 'epic', type: 'passive', minChapter: 8,
  forms: [
    { lv:1,  name:'Deflector Pulse', icon:'@t-x-hexpulse', color:'#8FE8FF',
      desc:'Every few seconds a pulse rolls out from you and shoves every enemy bullet, missile and glob of spit away from you.' },
    { lv:5,  name:'Aegis Pulse',     icon:'@t-x-hexaegis', color:'#B8FFE8',
      desc:'The pulses come faster and reach further, and nothing they touch ever finds you again.' },
    { lv:10, name:'Bulwark Field',   icon:'@t-x-hexbulwark', color:'#FFFFFF',
      desc:'A pulse every second or two, and a second one right behind it. Almost nothing fired at you gets through.' }
  ],
  stats(L){
    const t = L >= 10 ? 2 : L >= 5 ? 1 : 0;
    return { cd: [2.9, 2.6, 2.3, 2.0, 1.7, 1.5, 1.3, 1.1, 0.95, 0.8][L - 1], rad: (200 + 24 * L) * [1, 1.12, 1.12][t], twin: t === 2 };
  },
  init(i){ i.t = 0.5; },
  update(inst, dt){
    inst.t -= dt;
    if (inst.t > 0) return;
    inst.t = inst.s.cd * haste();
    firePulse(inst.s.rad, inst.form && inst.form.color);
    if (inst.s.twin) setTimeoutish(() => firePulse(inst.s.rad * 0.92, '#FFFFFF'), 0.28);
  }
}
];

const CARDMAP = {};
CARDS.forEach(c => { CARDMAP[c.id] = c; c.name = c.forms[0].name; c.icon = c.forms[0].icon; });
/* stats stored as fractions are shown as percentages on the card face */
CARDMAP.weaponry.pct  = ['range', 'dmg', 'haste'];
CARDMAP.speed.pct     = ['spd'];
CARDMAP.iron_hide.pct = ['dr'];
CARDMAP.feast.pct     = ['pickup', 'drop', 'xp', 'chance'];
CARDMAP.frenzy.pct    = ['haste', 'crit', 'critMul'];
CARDMAP.fleece.pct    = ['xp', 'gold', 'pickup', 'nugget'];

function cardForm(def, lv){
  let f = def.forms[0];
  for (let i = 0; i < def.forms.length; i++) if (lv >= def.forms[i].lv) f = def.forms[i];
  return f;
}
function cardTier(lv){ return lv >= 10 ? 2 : lv >= 5 ? 1 : 0; }
function ownedCard(id){
  for (let i = 0; i < P.cards.length; i++) if (P.cards[i].def.id === id && !P.cards[i].hidden) return P.cards[i];
  return null;
}
function refreshInst(inst){
  inst.s = inst.def.stats(inst.level);
  inst.tier = cardTier(inst.level);
  inst.form = cardForm(inst.def, inst.level);
}
/* Returns {inst, transformed:boolean} */
function takeCard(id){
  let inst = ownedCard(id);
  let transformed = false;
  if (inst){
    if (inst.level >= 10) return { inst: inst, transformed: false };
    const before = inst.tier;
    inst.level++;
    refreshInst(inst);
    if (inst.level >= 10 && !G.attract) markMastered(id);                          /* counts toward the fusion machine's mastery discount */
    transformed = inst.tier > before;
  } else {
    const def = CARDMAP[id];
    inst = { def: def, level: 1, ang: 0, t: 0, tier: 0 };
    if (def.init) def.init(inst);
    refreshInst(inst);
    P.cards.push(inst);
  }
  recalcStats();
  recordBestiaryCard(inst);
  return { inst: inst, transformed: transformed };
}
