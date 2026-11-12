'use strict';
/* =============================================================================================================================
   44zzzzo-sky-plus.js  --  THE AIR CHASE, ITS LOOK AND FEEL (Chapter 17.5). Nothing here changes a rule of the sky shooter
   (js/sky/44zzzzj-sky-chase.js): it wraps its step and its drawing, like the detail layer before it (js/sky/44zzzzm-sky-detail.js), and fills the two
   hooks the shooter leaves for it, skyDrawUnder (over the sea, under the machines) and skyDrawOver (over everything but the interface):
     the hour:    night on the water as the waves go on (skyNight), the moon's path on it, the helicopter's own lamp on the sea ahead of her, and in the
                  last two waves LAB-1's searchlight sweeping about;
     the weather: wave 4's rain squall (dark, streaming rain, lightning now and then) and wave 8's cloud bank across the top of the screen, which the
                  drones come out of (SKY_WX; Sky.wxK eases it in and out);
     the air:     cloud below her going by faster than the sea, more of it above her faster still, and spray off the water down among the Needles;
     the flying:  the helicopter leans into a turn (Sky.bank) and pitches as she climbs and drops (Sky.pitch), with streaks in the air when she moves
                  fast; a hot gun's barrel glows, the gun she is moving to gets a ring closing on its muzzle, and the gun she is at kicks as it fires
                  (Sky.kick), her head at the door with it;
     the sound:   the rotor's thud, louder as the hull goes; ten beeps of alarm when the hull drops under a quarter, with the edges of the screen pulsing red; thunder.
   ============================================================================================================================= */
const skyStartPlus = skyStart;
skyStart = function(){
  const r = skyStartPlus.apply(this, arguments);
  Sky.bank = 0; Sky.pitch = 0; Sky.px = Sky.x; Sky.py = Sky.y; Sky.wxK = 0; Sky.wxWas = ''; Sky.bolt = 0; Sky.boltT = 2.5; Sky.thudT = 0; Sky.alarmT = 0; Sky.alarmN = 0;
  return r;
};
const skyStepPlus = skyStep;
skyStep = function(dt){
  const held = Sky.hold, r = skyStepPlus.apply(this, arguments);
  if (held || Sky.hold || !Sky.on || Sky.px === undefined) return r;
  dt = Math.min(dt, 0.05); const s = skyS(), top = SKY_TUNE.move * s;
  /* how she is flying: leaning into a turn, nose down as she climbs the screen */
  const vx = (Sky.x - Sky.px) / dt, vy = (Sky.y - Sky.py) / dt; Sky.px = Sky.x; Sky.py = Sky.y;
  Sky.bank += (clamp(vx / top, -1, 1) - Sky.bank) * Math.min(1, dt * 7); Sky.pitch += (clamp(vy / top, -1, 1) - Sky.pitch) * Math.min(1, dt * 7);
  /* the weather comes in at the start of its wave and goes when the wave is cleared */
  if (Sky.wx) Sky.wxWas = Sky.wx;
  Sky.wxK = clamp(Sky.wxK + (Sky.wx && Sky.ws !== 'clear' ? 1 : -1) * dt * 0.5, 0, 1);
  if (Sky.wxWas === 'rain' && Sky.wxK > 0.5){ Sky.boltT -= dt; if (Sky.boltT <= 0){ Sky.boltT = 3 + Math.random() * 5; Sky.bolt = 0.35; try { SFX.burst(0.9, 0.12, 300, 60, 0.4, 0.15, 'lowpass'); } catch (e) {} } }
  if (Sky.bolt > 0) Sky.bolt -= dt;
  /* the rotor, and the alarm when the hull is nearly gone */
  const f = clamp(Sky.hull / Sky.max, 0, 1);
  if (!(Sky.down > 0)){
    Sky.thudT -= dt; if (Sky.thudT <= 0){ Sky.thudT = 0.42 + f * 0.2; try { SFX.tone('sine', 78, 46, 0.11, 0.02 + 0.09 * (1 - f), 0, 0); } catch (e) {} }
    if (f < 0.25){ Sky.alarmT -= dt; if (Sky.alarmT <= 0 && (Sky.alarmN | 0) < 10){ Sky.alarmT = 0.8; Sky.alarmN = (Sky.alarmN | 0) + 1; try { SFX.tone('square', 880, 880, 0.09, 0.06, 0, 0); SFX.tone('square', 660, 660, 0.09, 0.06, 0.12, 0); } catch (e) {} } }
    else { Sky.alarmN = 0; Sky.alarmT = 0; }                                                     /* ten beeps, then quiet (the red edges stay); back above a quarter and it may sound again */
  }
  return r;
};

/* ---- the helicopter: banking, recoil, streaks, the guns' glow ---- */
const skyDrawHeliPlus = skyDrawHeli;
skyDrawHeli = function(ctx){
  const s = skyS(), x = Sky.x, y = Sky.y, b = Sky.bank || 0, p = Sky.pitch || 0, k = Sky.kick || 0, mz = skyMuzzle(Sky.gun), v = Math.hypot(b, p), flying = Sky.on && !(Sky.down > 0);
  if (flying && v > 0.55){                                                                    /* streaks in the air behind her when she moves fast */
    ctx.strokeStyle = 'rgba(240,250,255,' + (0.3 * (v - 0.55) / 0.45).toFixed(3) + ')'; ctx.lineWidth = 1.6 * s; ctx.beginPath();
    for (let i = 0; i < 7; i++){ const ox = (skyDHash(i + 40) - 0.5) * 130 * s - b * 34 * s, oy = (skyDHash(i + 70) - 0.5) * 120 * s - p * 34 * s, len = (36 + skyDHash(i + 90) * 54) * s; ctx.moveTo(x + ox, y + oy); ctx.lineTo(x + ox - b / v * len, y + oy - p / v * len); }
    ctx.stroke();
  }
  ctx.save();
  ctx.translate(x - mz.dx * k * 3 * s, y - mz.dy * k * 3 * s); ctx.rotate(b * 0.13); ctx.scale(1 - 0.13 * Math.abs(b), 1 - 0.05 * Math.abs(p)); ctx.translate(-x, -y);
  skyDrawHeliPlus.apply(this, arguments);
  ctx.restore();
  if (!flying) return;
  SKY_GUNS.forEach(function(g){                                                               /* a hot barrel glows, orange to red */
    const h = (Sky.heat && Sky.heat[g]) || 0; if (h <= 0.35) return;
    const m = skyMuzzle(g); fillCircle(ctx, m.x - m.dx * 6 * s, m.y - m.dy * 6 * s, (5 + h * 6) * s, 'rgba(255,' + Math.round(160 - h * 90) + ',60,' + (0.2 + 0.5 * (h - 0.35) / 0.65).toFixed(3) + ')');
  });
  if (Sky.sw > 0 && Sky.swMax){ const u = 1 - Sky.sw / Sky.swMax; ringPath(ctx, mz.x, mz.y, (36 - 24 * u) * s, 2.5 * s, '#FFE27A', 0.35 + 0.6 * u); }      /* the gun she is on her way to */
  else ringPath(ctx, mz.x, mz.y, (8 + k * 3) * s, 1.5 * s, '#FFE27A', 0.55);                                                                                /* the gun she is at */
};
/* her head at the door: a little further out than the detail layer has it, and it kicks back with the gun */
const skyDoorHeadPlus = skyDoorHead;
skyDoorHead = function(ctx, r, sd, k){
  if (k <= 0.02) return skyDoorHeadPlus.apply(this, arguments);
  const live = Sky.on && Sky.gun === (sd < 0 ? 'left' : 'right') && !(Sky.sw > 0), kick = live ? (Sky.kick || 0) : 0;
  ctx.save(); ctx.translate(-kick * r * 0.03, -sd * kick * r * 0.045); ctx.rotate(sd * kick * 0.05);
  skyDoorHeadPlus.call(this, ctx, r, sd, k * 1.3);
  ctx.restore();
};

/* ---- under the machines: night on the water, the moon's path, her lamp, the cloud below, spray down low ---- */
function skyEll(ctx, x, y, rx, ry, col, rot){ ctx.fillStyle = col; ctx.beginPath(); ctx.ellipse(x, y, rx, ry, rot || 0, 0, TAU); ctx.fill(); }
skyDrawUnder = function(ctx){
  const W = G.W, H = G.H, s = skyS(), n = skyNight(), sc = Sky.scroll, t = Sky.t;
  if (n > 0){
    ctx.fillStyle = 'rgba(8,10,34,' + (0.3 * n).toFixed(3) + ')'; ctx.fillRect(0, 0, W, H);
    for (let i = 0; i < 36; i++){                                                              /* the moon on the water: a broken path of light, wider toward her */
      const y = ((i * 97.3 + sc * 0.9) % (H + 20)) - 10, x = W * 0.72 + (skyDHash(i) - 0.5) * W * 0.18 * (0.4 + y / H), a = (0.2 + 0.3 * Math.abs(Math.sin(t * 3 + i))) * n;
      ctx.fillStyle = 'rgba(210,225,255,' + a.toFixed(3) + ')'; ctx.fillRect(x, y, (10 + skyDHash(i + 5) * 22) * s, 1.6 * s);
    }
    if (Sky.on && !(Sky.down > 0)){                                                            /* her own lamp, a pool of light on the sea ahead */
      const lx = Sky.x + (Sky.bank || 0) * 40 * s, ly = Sky.y - 190 * s;
      for (let k = 3; k >= 1; k--) skyEll(ctx, lx, ly, 46 * s * k, 70 * s * k, 'rgba(255,244,210,' + (0.055 * n).toFixed(3) + ')');
    }
  }
  const cloud = n > 0.5 ? '170,180,210' : '255,240,228';
  for (let k = 0; k < 3; k++){                                                                 /* cloud below her: nearer than the sea, so it goes by faster; each puff has its shadow on the water */
    const per = H * 2.2 + k * 130, run = k * 911 + sc * 1.45, y = (run % per) - H * 0.5, lap = Math.floor(run / per), x = W * skyDHash(k * 13 + lap * 7 + 3), R = (90 + skyDHash(k + lap) * 80) * s;
    if (y < -R * 2 || y > H + R * 2) continue;
    skyEll(ctx, x + 40 * s, y + 60 * s, R * 1.5, R * 0.7, 'rgba(6,12,30,.1)');
    for (let q = 0; q < 4; q++) skyEll(ctx, x + (q - 1.5) * R * 0.5, y + (q % 2 ? -1 : 1) * R * 0.14, R * (0.9 - q * 0.1), R * (0.42 - q * 0.04), 'rgba(' + cloud + ',' + (0.06 + q * 0.02).toFixed(3) + ')');
  }
  const low = Sky.lowK || 0;
  if (low > 0.05 && Sky.on && !(Sky.down > 0)){                                                /* down among the Needles the rotor tears spray off the water, streaming back */
    for (let k = 0; k < 16; k++){ const a = (t * 1.6 + k / 16) % 1, sx = Sky.x + (skyDHash(k + 200) - 0.5) * 120 * s * (0.4 + a), sy = Sky.y + 30 * s + a * 240 * s; skyEll(ctx, sx, sy, (5 + a * 14) * s, (3 + a * 7) * s, 'rgba(240,250,255,' + (0.3 * low * (1 - a)).toFixed(3) + ')'); }
  }
};

/* ---- over the machines: LAB-1's searchlight, the cloud above her, the rain or the cloud bank, the low-hull warning ---- */
skyDrawOver = function(ctx){
  const W = G.W, H = G.H, s = skyS(), n = skyNight(), sc = Sky.scroll, t = Sky.t, wk = Sky.wxK || 0, wx = Sky.wxWas || Sky.wx;
  if (n > 0.9 && Sky.on){                                                                      /* the last two waves: a searchlight hunting for her, from LAB-1 when it is here, from ahead when it is not */
    const wb = Sky.en.filter(function(e){ return e.k === 'white' && !e.dead; })[0], ox = wb ? wb.x : W * 0.5 + Math.sin(t * 0.3) * W * 0.3, oy = wb ? wb.y : -40 * s;
    const tx = W / 2 + Math.sin(t * 0.7) * W * 0.42, ty = H * 0.62 + Math.sin(t * 0.45) * H * 0.2, R = 90 * s;
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = 'rgba(200,225,255,.07)'; ctx.beginPath(); ctx.moveTo(ox, oy); ctx.lineTo(tx - R, ty); ctx.lineTo(tx + R, ty); ctx.closePath(); ctx.fill();
    skyEll(ctx, tx, ty, R, R * 0.7, 'rgba(200,225,255,.1)'); skyEll(ctx, tx, ty, R * 0.6, R * 0.42, 'rgba(220,235,255,.08)');
    ctx.restore();
  }
  const cloud = n > 0.5 ? '160,170,200' : '250,246,240';
  for (let k = 0; k < 3; k++){                                                                 /* cloud above her, close to the eye: big, faint and fast */
    const per = H * 3 + k * 210, run = k * 1409 + sc * 3.1, y = (run % per) - H * 0.7, lap = Math.floor(run / per), x = W * skyDHash(k * 17 + lap * 5 + 60), R = (170 + skyDHash(k + lap + 9) * 120) * s;
    if (y < -R * 1.5 || y > H + R * 1.5) continue;
    for (let q = 0; q < 3; q++) skyEll(ctx, x + (q - 1) * R * 0.6, y + q * R * 0.12, R * (1 - q * 0.14), R * (0.34 - q * 0.05), 'rgba(' + cloud + ',' + (0.07 + q * 0.02).toFixed(3) + ')', -0.2);
  }
  if (wk > 0.01 && wx === 'rain'){                                                             /* the squall: the light goes, the rain streams back past her, and now and then lightning */
    ctx.fillStyle = 'rgba(14,20,34,' + (0.36 * wk).toFixed(3) + ')'; ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = 'rgba(200,220,255,' + (0.4 * wk).toFixed(3) + ')'; ctx.lineWidth = 1.2 * s; ctx.beginPath();
    for (let i = 0; i < 110; i++){ const x = skyDHash(i + 300) * (W + 80) - 20, y = ((i * 61.7 + t * 1500 * s * (0.8 + skyDHash(i + 400) * 0.4)) % (H + 80)) - 40; ctx.moveTo(x, y); ctx.lineTo(x - 9 * s, y + 34 * s); }
    ctx.stroke();
    if (Sky.bolt > 0){ const calm = Settings.calmFlash ? 0.25 : 1; ctx.fillStyle = 'rgba(235,240,255,' + (Math.min(0.5, Sky.bolt * 1.6) * wk * calm).toFixed(3) + ')'; ctx.fillRect(0, 0, W, H); }   /* "Reduce flashes": the same gentle sky as the main game's lightning */
  }
  if (wk > 0.01 && wx === 'cloud'){                                                            /* the cloud bank: thick across the top of the screen, thinning down to where she flies; the drones come out of it */
    for (let row = 0; row < 4; row++){
      const y = H * (0.02 + row * 0.085), R = (150 - row * 14) * s, drift = t * (14 + row * 6) * s, n2 = Math.ceil(W / (R * 0.9)) + 2, a = (0.5 - row * 0.09) * wk;
      for (let i = -1; i < n2; i++){ const x = i * R * 0.9 - (drift % (R * 0.9)), bob = Math.sin(i * 1.9 + row * 2.3) * R * 0.14; skyEll(ctx, x, y + bob, R, R * 0.5, 'rgba(' + cloud + ',' + a.toFixed(3) + ')'); }
    }
  }
  if (Sky.on && !(Sky.down > 0) && Sky.hull < Sky.max * 0.25){                                 /* the hull nearly gone: the edges of the screen pulse red */
    const a = (0.16 + 0.16 * Math.abs(Math.sin(t * 5))).toFixed(3), e = 16 * s; ctx.fillStyle = 'rgba(207,68,51,' + a + ')';
    ctx.fillRect(0, 0, W, e); ctx.fillRect(0, H - e, W, e); ctx.fillRect(0, e, e, H - e * 2); ctx.fillRect(W - e, e, e, H - e * 2);
  }
};
