'use strict';
/* =============================================================================================================================
   02d-ground-sounds.js  --  WHAT THE GROUND SOUNDS LIKE. 02c gave every biome one footstep. This gives the ground she is really standing on its
   own sound, and lets the weather change it:
     mud      a wet squelch and suck, with a pop as the hoof comes up (the bogs, the jungle mud, and the whole of Murkfen)
     snow     a crunch: a squeak of the top crust, then the give underneath (Frostreach; a blizzard muffles it)
     ice      a hard tick and a short slide hiss
     metal    a ringing clank with a low thud under it (the Moon and Mars, where she walks on plating, and the space centre)
     shallow  a splash with droplets, in a pond or an oil slick
     dust     a dry scuff (the savanna, the Changed Savannah, the desert); sand and ash have their own grain
     leaf     a rustle on the jungle floor; asphalt a harder knock in the city; hot rock in the Inferno; cinders on Venus
   WEATHER: rain turns a dry ground damp (a squelch under any dust or leaf and the odd drip), a downpour turns it to mud-and-splash, a blizzard muffles
   snow and adds a hiss, a sandstorm adds grit, acid rain a sizzle.
   IMPACTS: when her head lands in a lunge (36n) the ground answers: a splat in mud, a poof in snow, a clang on metal, a splash in water, a thud in dust,
   with a few droplets or flakes thrown up.
   SFX.foot is replaced; Mix.fv (how fast she is going) and Mix.lr (which foot) are used as before. Everything is made on the same bus as the old step, so
   the Effects volume and Mute apply. Purely sound (and a few particles): nothing here changes how she moves.
   ============================================================================================================================= */
(function(){
  const PLATED = { moon: 1, mars: 1, space: 1 };
  /* what she is standing on, right now: { g: ground, wet: 0 to 1, snow: 0 to 1, sand: 0 to 1, acid: 0 to 1 } */
  function groundNow(){
    const bio = G.biome, o = { g: 'dust', wet: 0, snow: 0, sand: 0, acid: 0, pond: false };
    switch (bio){
      case 'snow': o.g = 'snow'; break;
      case 'swamp': o.g = 'mud'; break;
      case 'jungle': o.g = 'leaf'; break;
      case 'city': o.g = 'asphalt'; break;
      case 'moon': case 'mars': case 'space': case 'dome': case 'tower': o.g = 'metal'; break;
      case 'venus': o.g = 'cinder'; break;
      case 'inferno': o.g = 'rock'; break;
      case 'area51': o.g = 'sand'; break;
      case 'ocean': o.g = 'shallow'; break;
      default: o.g = G.chapter === 10 ? 'rock' : 'dust';
    }
    try {
      if (typeof SCEN !== 'undefined' && SCEN.zones && SCEN.zones.length){
        const z = sceneryZoneAt(P.x, P.y, -P.r * 0.3), id = z && z.def && z.def.id;
        if (id === 'ar_ice' || id === 'sv_glassice') o.g = 'ice';
        else if (id === 'jg_mud' || id === 'sc_mud' || id === 'sw_bog' || id === 'sw_marsh') o.g = 'mud';
        else if (id === 'ct_puddle') { o.g = 'shallow'; o.pond = true; }
      }
      const w = G.water;
      if (w && typeof WATER_BIOMES !== 'undefined' && WATER_BIOMES[bio]){ const dx = (P.x - w.x) / w.r, dy = (P.y - w.y) / (w.r * 0.74); if (dx * dx + dy * dy < 0.9){ o.g = 'shallow'; o.pond = true; } }
    } catch (e) {}
    /* the weather */
    try {
      const A = typeof Atmos !== 'undefined' && Atmos.state ? Atmos.state.weather : '', E = typeof WxE !== 'undefined' && WxE.cur ? WxE.cur.weather : '', k = typeof WxE !== 'undefined' ? WxE.k : 0;
      const rainBase = A === 'rain' || A === 'drizzle' || A === 'downpour' ? 0.6 : 0;
      o.wet = Math.max(rainBase, E === 'downpour' ? k : 0);
      if (E === 'acid' || A === 'acid') o.acid = Math.max(E === 'acid' ? k : 0, A === 'acid' ? 0.7 : 0);
      o.snow = Math.max(A === 'snow' || A === 'blizzard' ? 0.6 : 0, E === 'blizzard' ? k : 0);
      o.sand = Math.max(E === 'sandstorm' ? k : 0, A === 'sandstorm' ? 0.7 : 0);
    } catch (e) {}
    return o;
  }
  window.groundNow = groundNow;

  const N = function(s, b, dur, vol, f0, f1, q, type, delay){ s.burst(dur, vol, f0, f1, q, delay || 0, type, b); };
  const T = function(s, b, wave, f0, f1, dur, vol, delay){ s.tone(wave, f0, f1, dur, vol, delay || 0, 0, b); };

  /* one footfall; v is the loudness for how fast and which foot */
  const STEPS = {
    mud:     function(s, b, v, o){ N(s, b, 0.12, 0.13 * v, 420, 140, 0.9, 'lowpass'); T(s, b, 'sine', 180 * v, 90, 0.1, 0.05 * v); N(s, b, 0.05, 0.07 * v, 1200, 500, 1.4, 'bandpass', 0.11); T(s, b, 'sine', 260, 520, 0.05, 0.03 * v, 0.12); },      /* the squelch, and the pop as it comes up */
    snow:    function(s, b, v, o){ const m = 1 - 0.5 * o.snow; N(s, b, 0.05, 0.09 * v * m, 3800 * v, 2400, 1.6, 'bandpass'); N(s, b, 0.09, 0.08 * v * m, 1500, 600, 0.9, 'bandpass', 0.03); if (o.snow > 0.3) N(s, b, 0.2, 0.03 * o.snow, 5000, 3000, 0.5, 'highpass'); },
    ice:     function(s, b, v, o){ T(s, b, 'triangle', 1900 * v, 1300, 0.03, 0.04 * v); N(s, b, 0.04, 0.08 * v, 5200, 3200, 1.8, 'bandpass'); N(s, b, 0.16, 0.025 * v, 4500, 2500, 0.6, 'highpass', 0.03); },
    metal:   function(s, b, v, o){ const f = 520 + Math.random() * 90; T(s, b, 'square', f * v, f * 0.93, 0.05, 0.035 * v); T(s, b, 'triangle', f * 1.5, f * 1.42, 0.09, 0.02 * v, 0.01); N(s, b, 0.05, 0.08 * v, 3800, 1800, 1.8, 'bandpass'); T(s, b, 'sine', 95, 60, 0.07, 0.07 * v); },
    shallow: function(s, b, v, o){ N(s, b, 0.14, 0.12 * v, 1800, 500, 0.8, 'bandpass'); N(s, b, 0.05, 0.08 * v, 4500, 2500, 1.2, 'highpass', 0.03); for (let i = 0; i < 3; i++) T(s, b, 'sine', 900 + Math.random() * 1200, 400, 0.05, 0.02 * v, 0.04 + i * 0.05); },
    dust:    function(s, b, v, o){ N(s, b, 0.06, 0.09 * v, 900, 300, 0.8, 'lowpass'); T(s, b, 'sine', 110 * v, 70, 0.06, 0.06 * v); N(s, b, 0.05, 0.03 * v, 2400, 1500, 0.7, 'highpass', 0.02); },
    sand:    function(s, b, v, o){ N(s, b, 0.09, 0.08 * v, 2400, 1100, 0.6, 'highpass'); N(s, b, 0.05, 0.05 * v, 700, 300, 0.8, 'lowpass'); },
    leaf:    function(s, b, v, o){ N(s, b, 0.09, 0.08 * v, 2600, 1100, 0.7, 'bandpass'); T(s, b, 'sine', 120 * v, 70, 0.06, 0.04 * v); N(s, b, 0.05, 0.04 * v, 4800, 3000, 1, 'highpass', 0.04); },
    asphalt: function(s, b, v, o){ N(s, b, 0.035, 0.09 * v, 2500, 1200, 0.9, 'highpass'); T(s, b, 'sine', 220 * v, 120, 0.04, 0.05 * v); },
    cinder:  function(s, b, v, o){ N(s, b, 0.06, 0.1 * v, 1800, 700, 1.2, 'bandpass'); T(s, b, 'sine', 90 * v, 60, 0.05, 0.05 * v); N(s, b, 0.03, 0.04 * v, 5000, 3200, 1.6, 'highpass', 0.03); },
    rock:    function(s, b, v, o){ T(s, b, 'sine', 140 * v, 80, 0.06, 0.07 * v); N(s, b, 0.04, 0.08 * v, 1400, 600, 1.2, 'bandpass'); N(s, b, 0.03, 0.03 * v, 4200, 2600, 1.4, 'highpass', 0.02); }
  };
  const foot = SFX.foot;
  SFX.foot = function(){
    const v = (0.5 + 0.5 * Mix.fv) * (Mix.lr ? 1.06 : 0.94), b = this.abilityGain, o = groundNow();
    const fn = STEPS[o.g]; if (!fn){ return foot.apply(this, arguments); }
    fn(this, b, v, o);
    /* the weather on top */
    if (o.g !== 'mud' && o.g !== 'shallow' && o.wet > 0.15){                          /* damp ground: a squelch under the step, a drip after */
      N(this, b, 0.08, 0.06 * v * o.wet, 700, 250, 0.9, 'lowpass', 0.02);
      if (Math.random() < 0.5 * o.wet) T(this, b, 'sine', 900 + Math.random() * 500, 420, 0.04, 0.025 * o.wet, 0.1);
      if (o.wet > 0.7) N(this, b, 0.1, 0.05 * o.wet, 1800, 600, 0.8, 'bandpass', 0.01);                              /* a downpour: it splashes */
    }
    if (o.sand > 0.15 && o.g !== 'snow') N(this, b, 0.1, 0.04 * o.sand * v, 3600, 2200, 0.6, 'highpass');              /* grit */
    if (o.acid > 0.15) N(this, b, 0.12, 0.04 * o.acid, 4800, 2800, 0.9, 'highpass', 0.02);                              /* a sizzle */
    /* a few droplets where she splashes */
    if (o.g === 'shallow' && fxLevelNow() > 0 && Math.hypot(P.vx, P.vy) > 45){
      const bx = P.x - Math.cos(P.face) * 12, by = P.y - Math.sin(P.face) * 12 + 12;
      for (let i = 0; i < 4; i++){ const a = -Math.PI * (0.15 + Math.random() * 0.7), s = rand(40, 90); addParticle(bx + rand(-6, 6), by, Math.cos(a) * s, Math.sin(a) * s - 20, rand(1.6, 2.6), rand(0.3, 0.5), 'rgba(205,232,250,0.85)', { drag: 1.6 }); }
      addParticle(bx, by + 2, 0, 0, 9, 0.45, 'rgba(205,232,250,0.55)', { shape: 'wake', drag: 0, shrink: false });
    }
  };

  /* the ground answers when her head lands in a lunge (36n-neck-stretch.js calls this) */
  const IMPACT = {
    mud:     function(s, b, o){ N(s, b, 0.22, 0.22, 600, 160, 0.8, 'lowpass'); T(s, b, 'sine', 120, 50, 0.2, 0.16); N(s, b, 0.08, 0.1, 1400, 600, 1.2, 'bandpass', 0.1); },
    snow:    function(s, b, o){ N(s, b, 0.2, 0.14, 1800, 500, 0.6, 'lowpass'); N(s, b, 0.12, 0.06, 5200, 3200, 0.7, 'highpass', 0.02); T(s, b, 'sine', 100, 55, 0.14, 0.1); },
    ice:     function(s, b, o){ N(s, b, 0.05, 0.16, 5200, 2600, 1.8, 'bandpass'); T(s, b, 'triangle', 2200, 900, 0.18, 0.06); T(s, b, 'sine', 130, 70, 0.12, 0.1); },
    metal:   function(s, b, o){ T(s, b, 'square', 420, 360, 0.18, 0.06); T(s, b, 'triangle', 640, 590, 0.35, 0.05); T(s, b, 'sine', 80, 40, 0.2, 0.16); N(s, b, 0.06, 0.14, 4200, 2000, 1.6, 'bandpass'); },
    shallow: function(s, b, o){ N(s, b, 0.3, 0.2, 2000, 400, 0.7, 'bandpass'); T(s, b, 'sine', 160, 60, 0.18, 0.12); for (let i = 0; i < 6; i++) T(s, b, 'sine', 800 + Math.random() * 1500, 350, 0.05, 0.03, 0.05 + i * 0.04); },
    dust:    function(s, b, o){ T(s, b, 'sine', 110, 45, 0.18, 0.18); N(s, b, 0.16, 0.12, 900, 250, 0.7, 'lowpass'); N(s, b, 0.08, 0.04, 2600, 1500, 0.7, 'highpass', 0.02); }
  };
  IMPACT.leaf = IMPACT.dust; IMPACT.sand = IMPACT.dust; IMPACT.asphalt = IMPACT.metal; IMPACT.cinder = IMPACT.dust; IMPACT.rock = IMPACT.metal;
  SFX.groundImpact = function(){
    if (!this.ctx || this.muted) return;
    const o = groundNow(), b = this.abilityGain, fn = IMPACT[o.g] || IMPACT.dust;
    try { fn(this, b, o); } catch (e) {}
    if (o.wet > 0.3 && o.g !== 'mud' && o.g !== 'shallow') N(this, b, 0.14, 0.07 * o.wet, 1200, 400, 0.8, 'bandpass', 0.03);
    return o;
  };
  /* her head lands: the ground answers (sound and, in water and snow, a few things thrown up) */
  window.groundStateNow = groundNow;                      /* for gear effects that care about water (js/36p-gear-fx.js) */
  const ns = window.neckStretchLanded;
  window.neckStretchLanded = function(){
    const o = SFX.groundImpact(); if (ns) ns();
    if (!o || fxLevelNow() <= 0) return;
    const by = P.y + 12;
    if (o.g === 'shallow'){ for (let i = 0; i < 10; i++){ const a = -Math.PI * Math.random(), s = rand(60, 140); addParticle(P.x + rand(-14, 14), by, Math.cos(a) * s, Math.sin(a) * s - 40, rand(2, 3.4), rand(0.35, 0.6), 'rgba(205,232,250,0.85)', { drag: 1.4 }); } }
    else if (o.g === 'snow'){ for (let i = 0; i < 10; i++){ const a = Math.random() * TAU, s = rand(30, 90); addParticle(P.x + Math.cos(a) * 10, by, Math.cos(a) * s, Math.sin(a) * s * 0.5 - 30, rand(2, 3.6), rand(0.4, 0.7), 'rgba(245,250,255,0.85)', { drag: 2.2, shrink: false }); } }
    else if (o.g === 'mud'){ for (let i = 0; i < 8; i++){ const a = -Math.PI * Math.random(), s = rand(50, 120); addParticle(P.x + rand(-12, 12), by, Math.cos(a) * s, Math.sin(a) * s - 30, rand(2, 3.6), rand(0.4, 0.6), 'rgba(80,68,40,0.9)', { drag: 1.5 }); } }
  };
})();
