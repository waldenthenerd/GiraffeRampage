'use strict';
/* Longneck Town, ninth part: sound, daily routines, weather, the aurora, and night flying. */
/* ========================= 44zi. ATMOSPHERE ========================= */
/* 1 SOUND. The town has an ambience bed per street and per room (made from the layers of 02b-ambience.js: wind, water, rumble, hiss, hum, and
      small one-shots), footsteps that change with the floor, a car engine, and thunder. It follows Settings.ambVol and the mute.
   2 ROUTINES. Seven of the herd keep hours: they work where they usually are, lunch at the cafe (12:00 to 13:30), gather by the fountain
      in the evening (18:00 to 21:00) and are away from 21:00 to 06:30. The others (the shopkeepers, Marina, Nova, Ossi, Dot) are where they are.
   3 WEATHER. Every four minutes the weather is drawn from a clock the same for everybody: clear, rain, a storm (rain, a darker sky, lightning
      and thunder) or fog. On clear nights the Rooftops and the Launchpad sometimes have an aurora.
   4 NIGHT FLYING. At night the lighthouse in the Harbor throws a beam, the runway lights glow and a row of lights flashes toward it, four
      approach lights show whether she is high (white) or low (red), and a marshal waves his wands. */

/* ---- 1 sound ---- */
const TOWN_AMB = {
  default: { wind: 0.035, windF: 500, chirp: ['bird', 5, 11] },
  square: { wind: 0.03, windF: 520, water: 0.035, chirp: ['bird', 4, 9] },
  market: { wind: 0.06, windF: 380, chirp: ['clink', 3, 8] },
  park: { wind: 0.035, windF: 540, chirp: ['bird', 2.5, 6] },
  harbour: { water: 0.11, wind: 0.04, windF: 420, chirp: ['gull', 5, 11] },
  roofs: { wind: 0.09, windF: 430, chirp: ['ping', 9, 16] },
  launch: { hum: 0.04, wind: 0.04, windF: 600, chirp: ['radio', 7, 14] },
  runway: { wind: 0.06, windF: 360, chirp: ['cricket', 4, 9] },
  burrows: { rumble: 0.03, water: 0.045, chirp: ['drip', 1.2, 3.5] },
  indoor: { hum: 0.012 },
  in_bakery: { hiss: 0.018, hum: 0.01, chirp: ['crackle', 0.6, 2] },
  in_cafe: { wind: 0.03, windF: 300, chirp: ['clink', 2, 6] },
  in_library: { hum: 0.008, chirp: ['page', 6, 14] },
  in_garage: { hum: 0.03, chirp: ['clank', 3, 8] },
  in_arcade: { hum: 0.03, chirp: ['blip', 0.6, 2] },
  in_house1: { chirp: ['crackle', 0.5, 1.8] }, in_house2: { chirp: ['crackle', 0.5, 1.8] },
  in_hangar: { wind: 0.02, windF: 300, hum: 0.015, chirp: ['clank', 5, 12] }
};
function townStepSound(D){                                                          /* one footstep; 44zzo-town-sound.js gives every floor its own */
  if (D.indoor){ SFX.tone('triangle', 150 + Math.random() * 40, 90, 0.06, 0.035, 0, 0, SFX.eventGain); SFX.burst(0.04, 0.02, 900, 500, 0.8, 0, 'lowpass', SFX.eventGain); }
  else if (D.cave){ SFX.tone('sine', 110, 70, 0.08, 0.04, 0, 0, SFX.eventGain); SFX.burst(0.05, 0.03, 1200, 600, 0.8, 0, 'bandpass', SFX.eventGain); }
  else if (Town.d === 'park' || Town.d === 'runway') SFX.burst(0.05, 0.022, 900, 400, 0.7, 0, 'lowpass', SFX.eventGain);
  else SFX.burst(0.035, 0.035, 1800 + Math.random() * 700, 1000, 0.9, 0, 'bandpass', SFX.eventGain);
}
const TownSound = { chirpT: 2, stepT: 0, engT: 0, lightT: 6, flash: 0, fogK: 0 };
function townChirp(kind){
  const B = Amb.bus, s = SFX;
  switch (kind){
    case 'gull': { const f = 1500 + Math.random() * 400; s.tone('sine', f, f * 0.62, 0.22, 0.05, 0, 0, B); s.tone('sine', f * 0.9, f * 0.55, 0.26, 0.04, 0.2, 0, B); break; }
    case 'clink': { const f = 2100 + Math.random() * 600; s.tone('sine', f, f * 0.92, 0.12, 0.035, 0, 0, B); s.tone('sine', f * 1.5, f * 1.4, 0.08, 0.02, 0.03, 0, B); break; }
    case 'radio': { s.tone('square', 1800, 1800, 0.05, 0.015, 0, 0, B); s.tone('square', 1800, 1800, 0.05, 0.015, 0.12, 0, B); if (Math.random() < 0.5) s.tone('square', 1400, 1400, 0.1, 0.015, 0.26, 0, B); break; }
    case 'drip': { const f = 700 + Math.random() * 500; s.tone('sine', f, f * 0.3, 0.1, 0.05, 0, 0, B); s.tone('sine', f * 0.5, f * 0.15, 0.14, 0.025, 0.12, 0, B); break; }
    case 'crackle': s.burst(0.03 + Math.random() * 0.04, 0.045, 2800 + Math.random() * 2000, 1200, 1.2, 0, 'bandpass', B); break;
    case 'page': s.burst(0.12, 0.03, 3200, 1800, 0.8, 0, 'highpass', B); break;
    case 'clank': s.tone('square', 190, 120, 0.09, 0.03, 0, 0, B); s.burst(0.08, 0.04, 2200, 800, 1.2, 0, 'bandpass', B); break;
    case 'blip': { const f = 500 + Math.random() * 1200; s.tone('square', f, f * 1.3, 0.06, 0.012, 0, 0, B); break; }
    default: Amb.chirp(kind);
  }
}
function townThunder(delay){
  setTimeout(function(){ try { SFX.burst(1.3, 0.22, 240, 55, 0.6, 0, 'lowpass', SFX.eventGain); SFX.tone('sine', 70, 38, 0.9, 0.2, 0.05, 0, SFX.eventGain); } catch (e) {} }, delay);
}
(function(){
  const au = Amb.update;
  Amb.update = function(dt){
    au.call(this, dt);
    const flying = G.state === 'fly' && typeof Fly !== 'undefined' && Fly.on;
    if (!(G.state === 'town' || flying || (Town.on && typeof townVisible === 'function' && townVisible()))) return;
    if (!this.built || !SFX.ctx) return;
    const c = SFX.ctx, now = c.currentTime, av = typeof Settings.ambVol === 'number' ? Settings.ambVol : 1;
    const D = TOWN_DIST[Town.d] || TOWN_DIST.square;
    let prof = flying ? { wind: 0.05 + clamp(Fly.v / 330, 0, 1) * 0.1, windF: 420 + Fly.v, hum: 0.02 + Fly.thr * 0.05 } : (TOWN_AMB[D.id] || (D.indoor ? TOWN_AMB.indoor : TOWN_AMB.default));
    const lv = { wind: prof.wind || 0, water: prof.water || 0, rumble: prof.rumble || 0, hiss: prof.hiss || 0, hum: prof.hum || 0 };
    const wx = townWeatherType();
    if (!D.indoor && !D.cave){
      if (wx === 'rain'){ lv.hiss += 0.06; lv.wind += 0.02; } else if (wx === 'storm'){ lv.hiss += 0.1; lv.wind += 0.07; } else if (wx === 'fog'){ lv.wind *= 0.6; lv.hum += 0.01; }
    } else if (D.indoor && (wx === 'rain' || wx === 'storm')) lv.hiss += 0.02;
    this.bus.gain.setTargetAtTime(0.95 * av, now, 0.4);
    for (const k in lv) if (this.L[k]) this.L[k].g.gain.setTargetAtTime(lv[k], now, 0.8);
    if (prof.windF && this.L.wind) this.L.wind.fl.frequency.setTargetAtTime(prof.windF, now, 1.5);
    if (prof.chirp && av > 0 && !flying){
      TownSound.chirpT -= dt;
      if (TownSound.chirpT <= 0){ TownSound.chirpT = rand(prof.chirp[1], prof.chirp[2]); townChirp(prof.chirp[0]); }
    }
  };
  const tick = Feedback.tick;
  Feedback.tick = function(dt){
    tick.call(this, dt);
    if (G.state !== 'town' || !Town.on || Town.hold || Town.panel || Town.ride) return;
    const v = Math.abs(Town.vx), D = TOWN_DIST[Town.d];
    if (Town.car){
      TownSound.engT -= dt;
      if (TownSound.engT <= 0){ TownSound.engT = 0.14; try { SFX.tone('sawtooth', 52 + v * 0.1, 52 + v * 0.1, 0.16, 0.022 + Math.min(0.03, v * 0.00008), 0, 0, SFX.eventGain); } catch (e) {} }
    } else if (Town.wheels){
      if (v > 30){ TownSound.stepT -= dt; if (TownSound.stepT <= 0){ TownSound.stepT = 0.16; try { SFX.burst(0.12, 0.012 + Math.min(0.03, v * 0.0001), 500 + v * 2, 260, 0.8, 0, 'lowpass', SFX.eventGain); } catch (e) {} } }
    } else if (v > 40){
      TownSound.stepT -= dt * (v / 235);
      if (TownSound.stepT <= 0){
        TownSound.stepT = 0.34;
        try { townStepSound(D);         } catch (e) {}
      }
    }
  };
})();

/* ---- 2 routines ---- */
const TOWN_KEEPERS = ['mayor', 'tilly', 'barnaby', 'penny', 'rio', 'gus', 'skye'];
function townApplyRoutines(){
  const D = TOWN_DIST[Town.d]; if (!D || !Town.on) return;
  Town.npcs = Town.npcs.filter(function(n){ if (TOWN_KEEPERS.indexOf(n.id) < 0) return true; const s = townNpcSlot(n.id); return s && s.d === Town.d; });
  TOWN_KEEPERS.forEach(function(id){
    const s = townNpcSlot(id); if (!s || s.d !== Town.d) return;
    const ex = Town.npcs.filter(function(n){ return n.id === id; })[0];
    if (ex){ if (Math.abs(ex.home - s.x) > 1){ ex.home = s.x; ex.tx = s.x; ex.x = s.x; } return; }
    Town.npcs.push({ id: id, def: TOWN_NPCS[id], x: s.x, home: s.x, dir: Math.random() < 0.5 ? 1 : -1, ph: 0, t: Math.random() * 9, tx: s.x, wait: Math.random() * 3, moving: false, reach: 0, seed: townHash(id) % 97 });
  });
}
let _routineSig = '';
(function(){
  const sn = townSpawnNpcs, uT = updateTown;
  townSpawnNpcs = function(){ sn.apply(this, arguments); townApplyRoutines(); _routineSig = TOWN_KEEPERS.map(function(i){ const s = townNpcSlot(i); return s ? s.d + s.x : '-'; }).join(); };
  let chk = 0;
  updateTown = function(dt, frozen){
    if (Town.on && (chk -= dt) <= 0){
      chk = 3;
      const sig = TOWN_KEEPERS.map(function(i){ const s = townNpcSlot(i); return s ? s.d + s.x : '-'; }).join();
      if (sig !== _routineSig){ _routineSig = sig; townApplyRoutines(); }
    }
    return uT.call(this, dt, frozen);
  };
})();

/* ---- 3 weather and sky ---- */
function townWeatherType(){
  if (typeof Town.fixWeather === 'string') return Town.fixWeather;                       /* set by tests */
  const w = Math.floor(Date.now() / 240000), r = miniRng(w * 7919 + 13)();
  return r < 0.14 ? 'rain' : r < 0.2 ? 'storm' : r < 0.3 ? 'fog' : 'clear';
}
function townRainNow(){ const k = townWeatherType(); return k === 'rain' || k === 'storm'; }
function townAuroraNow(D){
  if (!D || D.indoor || D.cave) return false;
  if (['roofs', 'launch', 'park'].indexOf(D.id) < 0) return false;
  if (townDark(townHour()) < 0.55 || townWeatherType() !== 'clear') return false;
  return miniRng(Math.floor(Date.now() / 240000) * 31 + 7)() < 0.5 || Town.fixAurora === true;
}
function townWeatherFX(ctx, D, W, H, h){
  if (D.indoor || D.cave) return;
  const wx = townWeatherType(), dt = 1 / 60;
  TownSound.fogK += ((wx === 'fog' ? 1 : 0) - TownSound.fogK) * Math.min(1, dt * 0.8);
  if (TownSound.fogK > 0.02){
    const a = TownSound.fogK, g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, 'rgba(225,230,236,' + (0.5 * a).toFixed(3) + ')'); g.addColorStop(0.55, 'rgba(225,230,236,' + (0.42 * a).toFixed(3) + ')'); g.addColorStop(1, 'rgba(225,230,236,' + (0.58 * a).toFixed(3) + ')');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    if (fxLevelNow() > 0){ ctx.fillStyle = 'rgba(240,244,248,' + (0.14 * a).toFixed(3) + ')'; for (let i = 0; i < 5; i++){ const y = H * (0.45 + i * 0.1), x = ((Town.t * (8 + i * 3) + i * 220) % (W + 500)) - 250; ctx.beginPath(); ctx.ellipse(x, y, 260, 34, 0, 0, TAU); ctx.fill(); } }
  }
  if (wx === 'storm'){
    ctx.fillStyle = 'rgba(14,20,36,0.2)'; ctx.fillRect(0, 0, W, H);
    TownSound.lightT -= dt;
    if (TownSound.lightT <= 0){ TownSound.lightT = 4 + Math.random() * 8; TownSound.flash = 1; TownSound.bolt = { x: W * (0.15 + Math.random() * 0.7), seed: Math.random() * 99 }; townThunder(300 + Math.random() * 1200); }
    if (TownSound.flash > 0){
      const f = TownSound.flash; TownSound.flash = Math.max(0, f - dt * 3.2);
      if (!Settings.calmFlash){ ctx.fillStyle = 'rgba(235,240,255,' + (0.45 * f).toFixed(3) + ')'; ctx.fillRect(0, 0, W, H); }
      if (TownSound.bolt && f > 0.35){ ctx.strokeStyle = 'rgba(255,255,255,' + f.toFixed(2) + ')'; ctx.lineWidth = 2.6; ctx.beginPath(); let x = TownSound.bolt.x, y = 0; ctx.moveTo(x, y); const r = miniRng(Math.floor(TownSound.bolt.seed * 1000)); while (y < H * 0.62){ y += 22 + r() * 22; x += (r() - 0.5) * 46; ctx.lineTo(x, y); } ctx.stroke(); }
    }
    if (fxLevelNow() > 0){ ctx.strokeStyle = 'rgba(200,220,255,.45)'; ctx.lineWidth = 1.2; ctx.beginPath(); for (let i = 0; i < 70; i++){ const x = (i * 83.1 + Town.t * 260) % (W + 80) - 40, y = ((i * 47.3 + Town.t * 820) % (H + 60)) - 30; ctx.moveTo(x, y); ctx.lineTo(x - 11, y + 22); } ctx.stroke(); }
  }
}
(function(){
  const sky = townDrawSky;
  townDrawSky = function(ctx, W, H, h, D){
    sky(ctx, W, H, h, D);
    if (!D || !D.id || !townAuroraNow(D)) return;
    const a = clamp((townDark(h) - 0.5) * 2, 0, 1), t = Town.t;
    ctx.save();
    for (let k = 0; k < 4; k++){
      const x0 = W * (0.08 + k * 0.24) + Math.sin(t * 0.15 + k) * 40, w = W * 0.3;
      const g = ctx.createLinearGradient(0, H * 0.04, 0, H * 0.52); g.addColorStop(0, 'rgba(90,255,170,0)'); g.addColorStop(0.35, 'rgba(90,255,170,' + (0.32 * a).toFixed(3) + ')'); g.addColorStop(0.75, 'rgba(150,100,255,' + (0.2 * a).toFixed(3) + ')'); g.addColorStop(1, 'rgba(150,100,255,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(x0, H * 0.5);
      for (let s = 0; s <= 12; s++){ const px = x0 + (s / 12) * w, py = H * (0.14 + 0.06 * Math.sin(t * 0.5 + k * 1.7 + s * 0.6)); ctx.lineTo(px, py); }
      ctx.lineTo(x0 + w, H * 0.5); ctx.closePath(); ctx.fill();
    }
    ctx.restore();
  };
})();

/* ---- 4 night flying ---- */
function flyNightFX(ctx, cam, vw, t, dark){
  const R0 = Fly.regions[0].x0, gy = FLY_GROUND;
  /* the lighthouse: a slow beam */
  if (dark > 0.25){
    const open = TOWN_IDS.filter(townOpen).filter(function(id){ return id !== 'runway'; }), i = open.indexOf('harbour');
    if (i >= 0){
      const R = Fly.regions[0], step = (R.w - FLY_RUNWAY_LEN - 400) / Math.max(1, open.length), lx = R.x0 + FLY_RUNWAY_LEN + 200 + i * step + step / 2, ly = gy - 148;
      if (lx > cam - 500 && lx < cam + vw + 500){
        ctx.save(); ctx.translate(lx, ly); ctx.rotate(t * 0.7);
        const g = ctx.createLinearGradient(0, 0, 520, 0); g.addColorStop(0, 'rgba(255,244,190,' + (0.55 * dark).toFixed(2) + ')'); g.addColorStop(1, 'rgba(255,244,190,0)');
        ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(520, -46); ctx.lineTo(520, 46); ctx.closePath(); ctx.fill(); ctx.restore();
        tCircle(ctx, '#FFF2B0', lx, ly, 6);
      }
    }
  }
  /* the runway: brighter lights, a flashing run of them leading in, and the glide-slope lights */
  const end = R0 + FLY_RUNWAY_LEN, near = Math.abs(Fly.x - (R0 + FLY_RUNWAY_LEN / 2)) < 1900;
  if (near){
    if (dark > 0.25){
      for (let x = R0 + 20; x < end; x += 70){ const g = ctx.createRadialGradient(x, gy + 8, 1, x, gy + 8, 22); g.addColorStop(0, 'rgba(255,200,80,' + (0.7 * dark).toFixed(2) + ')'); g.addColorStop(1, 'rgba(255,200,80,0)'); ctx.fillStyle = g; ctx.fillRect(x - 22, gy - 14, 44, 44); }
      const k = Math.floor(t * 9) % 9;
      for (let i = 0; i < 9; i++){ const x = end + 40 + i * 52, on = i === k; tCircle(ctx, on ? '#FFFFFF' : '#8A7A50', x, gy + 4, on ? 4.2 : 2.4); if (on){ const g = ctx.createRadialGradient(x, gy + 4, 1, x, gy + 4, 28); g.addColorStop(0, 'rgba(255,255,255,.7)'); g.addColorStop(1, 'rgba(255,255,255,0)'); ctx.fillStyle = g; ctx.fillRect(x - 28, gy - 24, 56, 56); } }
    }
    const tx = end, dist = Math.max(60, Math.abs(Fly.x - tx)), alt = Math.max(0, gy - 46 - Fly.y), slope = alt / dist;
    const whites = slope > 0.17 ? 4 : slope > 0.13 ? 3 : slope > 0.09 ? 2 : slope > 0.05 ? 1 : 0;
    for (let i = 0; i < 4; i++){ const on = i < whites, x = tx + 6 + i * 12; tCircle(ctx, on ? '#FFFFFF' : '#FF4A3C', x, gy - 8, 3.4); }
    miniText(ctx, 'glide slope', tx + 30, gy - 20, 9, '#E8D8B0', 'center', false);
    /* the marshal, with two glowing wands, when she is low and near */
    if (dark > 0.3 && Math.abs(Fly.x - R0) < 1500){
      const mx = R0 + 520, wv = Math.sin(t * 5) * 0.7;
      townGiraffe(ctx, mx, gy + 2, { s: 0.8, look: { coat: '#E8C070', spot: '#8A5A24', pat: 0, hat: '', s: 1 }, flip: false, reach: 0.4, t: t, seed: 9 });
      ctx.strokeStyle = '#FF8A3A'; ctx.lineWidth = 3; ctx.lineCap = 'round';
      [[-1, 0], [1, 0.6]].forEach(function(w){ ctx.beginPath(); ctx.moveTo(mx + 6, gy - 82); ctx.lineTo(mx + 6 + w[0] * 26 * Math.cos(wv + w[1]), gy - 100 - 20 * Math.abs(Math.sin(wv + w[1]))); ctx.stroke(); });
    }
  }
}

/* the guide page mentions what the later updates added */
(function(){
  const t = GUIDE_TOPICS.find(function(x){ return x.id === 'town'; }); if (!t) return;
  const base = t.html;
  t.html = function(){
    return base().replace('</ul>', '<li><b>More to spend on:</b> four planes and four cars (each stalls, cruises and climbs differently; the Cargo Hauler pays most for rings), a bigger oven for the bakery, and <b>Her Home</b> at the far end of Willow Park with eight slots to furnish. Photos from the album can hang in the six frames in Herd Hall.</li>' +
      '<li><b>More to do:</b> work a shift at the caf\u00e9 bar, enter the weekly tournament on the arcade board, fish from the end of the pier, and check the post box in the square for the day\u2019s letter.</li>' +
      '<li><b>Finding things:</b> the top of the screen says what is left in a street. Dewey in the library, or the Finds page of the journal, will give a hint when you are stuck, and the Gear page lists the town-only hats, boots and colors. On a touch screen, tap a person or a door and she walks there.</li>' +
      '<li><b>The town keeps hours:</b> some of the herd lunch at the caf\u00e9, gather by the fountain in the evening and go home at night. It also has rain, storms, fog and, some clear nights on the Rooftops and Launchpad, an aurora.</li></ul>');
  };
})();
