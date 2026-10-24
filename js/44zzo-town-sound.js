'use strict';
/* =============================================================================================================================
   44zzo-town-sound.js  --  THE TOWN'S SOUND, FINISHED. 44zi gave every street and some rooms an ambience bed and two kinds of footstep.
   This adds:
     FOOTSTEPS   one for every floor she can walk on (townStepSound wrapper): paving, planks (hollow, in the harbour), grass, gravel and metal on
                 the roofs, concrete, dirt, sand, the campus lawn and path, carpet in the library and hall, tile in the café and the exam hall,
                 rubber in the gym, bare boards at home
     DOOR SOUNDS a shop bell going in (a two-note ding; the café and bakery a bright one, the library and the university a soft one), a creak at
                 a house door, a thud and a squeak at the gym, a gentle click coming out (townEnter wrapper)
     ROOM BEDS   the rooms 44zi left silent: the tailor (a sewing machine, scissors), the Herd Hall (a clock), the Photo Booth (a camera whirr),
                 the farm and isle rooms (hens, cows, waves, a bell-buoy), the gym (weights clanking, a treadmill hum), and the six rooms of the
                 university (the lecture's chalk, the library's hush and pages, the homework hall's pencils, the exam hall's tick, the café's
                 murmur), and the campus street (a bell tower, bicycle bells, birds)
   Every sound is made on the same audio context as the rest, through the ambience bus, so the Effects volume, the Ambience volume and Mute
   all apply to it.
   ============================================================================================================================= */
(function(){
  const bus = function(){ return SFX.eventGain; };
  const rnd = function(a, b){ return a + Math.random() * (b - a); };

  /* ---------- footsteps ---------- */
  const STEP = {
    paving:  function(s, B){ s.burst(0.035, 0.035, 1800 + Math.random() * 700, 1000, 0.9, 0, 'bandpass', B); },
    planks:  function(s, B){ s.tone('triangle', 210 + Math.random() * 40, 120, 0.07, 0.05, 0, 0, B); s.burst(0.05, 0.03, 700, 300, 1.2, 0, 'bandpass', B); },
    grass:   function(s, B){ s.burst(0.06, 0.02, 900, 400, 0.7, 0, 'lowpass', B); s.burst(0.04, 0.012, 3600, 2400, 0.6, 0.02, 'highpass', B); },
    gravel:  function(s, B){ for (let i = 0; i < 3; i++) s.burst(0.025, 0.026, 2600 + Math.random() * 1200, 1600, 0.9, i * 0.02, 'bandpass', B); },
    metal:   function(s, B){ s.tone('square', 260 + Math.random() * 50, 200, 0.05, 0.018, 0, 0, B); s.burst(0.05, 0.03, 3000, 1800, 1.6, 0, 'bandpass', B); },
    concrete:function(s, B){ s.burst(0.03, 0.04, 1300, 800, 1, 0, 'bandpass', B); s.tone('sine', 120, 80, 0.04, 0.02, 0, 0, B); },
    dirt:    function(s, B){ s.burst(0.06, 0.03, 700, 300, 0.8, 0, 'lowpass', B); },
    sand:    function(s, B){ s.burst(0.09, 0.02, 2000, 1000, 0.5, 0, 'highpass', B); },
    carpet:  function(s, B){ s.burst(0.05, 0.015, 600, 250, 0.6, 0, 'lowpass', B); },
    tile:    function(s, B){ s.tone('sine', 1500 + Math.random() * 300, 900, 0.03, 0.02, 0, 0, B); s.burst(0.02, 0.04, 3200, 2000, 1.4, 0, 'bandpass', B); },
    rubber:  function(s, B){ s.tone('sine', 900 + Math.random() * 200, 1500, 0.04, 0.012, 0, 0, B); s.burst(0.04, 0.025, 1100, 500, 0.8, 0, 'bandpass', B); },
    boards:  function(s, B){ s.tone('triangle', 150 + Math.random() * 40, 90, 0.06, 0.035, 0, 0, B); s.burst(0.04, 0.02, 900, 500, 0.8, 0, 'lowpass', B); }
  };
  const FLOOR = { square: 'paving', market: 'paving', park: 'grass', harbour: 'planks', roofs: 'metal', launch: 'concrete', burrows: 'dirt', runway: 'concrete', campus: 'paving', farm: 'dirt', isle: 'sand',
    in_library: 'carpet', in_hall: 'carpet', in_house1: 'carpet', in_house2: 'carpet', in_tailor: 'carpet', in_myhome: 'boards', in_cafe: 'tile', in_bakery: 'tile', in_garage: 'concrete', in_hangar: 'concrete', in_arcade: 'carpet', in_studio: 'concrete',
    in_gym: 'rubber', in_uhall: 'carpet', in_ulecture: 'carpet', in_ulibrary: 'carpet', in_uhw: 'boards', in_uexam: 'tile', in_ucafe: 'tile',
    in_fstand: 'boards', in_barn: 'dirt', in_coop: 'dirt', in_fhouse: 'boards', in_icottage: 'boards', in_ifish: 'tile', in_icrab: 'tile', in_ilight: 'concrete', in_tackle: 'boards' };
  const ts = townStepSound;
  townStepSound = function(D){
    const k = FLOOR[D.id]; if (!k){ return ts(D); }
    STEP[k](SFX, bus());
  };

  /* ---------- door sounds ---------- */
  const DOOR = { in_cafe: 'bright', in_bakery: 'bright', in_tailor: 'bright', in_garage: 'bell', in_arcade: 'blip', in_studio: 'bell', in_hall: 'soft', in_library: 'soft', in_ulibrary: 'soft', in_uhall: 'soft', in_ulecture: 'soft', in_uhw: 'soft', in_uexam: 'soft', in_ucafe: 'bright',
    in_house1: 'creak', in_house2: 'creak', in_myhome: 'creak', in_fhouse: 'creak', in_icottage: 'creak', in_barn: 'creak', in_coop: 'creak', in_fstand: 'bell', in_ifish: 'bell', in_icrab: 'bell', in_tackle: 'bell', in_ilight: 'creak', in_hangar: 'clank', in_gym: 'gym' };
  function doorIn(kind){
    const s = SFX, B = bus(); if (!s.ctx || s.muted) return;
    switch (kind){
      case 'bright': s.tone('sine', 1568, 1560, 0.5, 0.05, 0, 0, B); s.tone('sine', 2093, 2085, 0.6, 0.04, 0.12, 0, B); s.tone('sine', 3136, 3120, 0.3, 0.012, 0.12, 0, B); break;
      case 'bell':   s.tone('sine', 1175, 1170, 0.45, 0.05, 0, 0, B); s.tone('sine', 1568, 1560, 0.5, 0.04, 0.14, 0, B); break;
      case 'soft':   s.tone('sine', 523, 520, 0.5, 0.03, 0, 0, B); s.tone('sine', 659, 655, 0.6, 0.025, 0.16, 0, B); s.burst(0.06, 0.012, 500, 250, 0.6, 0, 'lowpass', B); break;
      case 'creak':  s.tone('sawtooth', 190, 120, 0.3, 0.02, 0, 0, B); s.tone('sawtooth', 120, 210, 0.25, 0.018, 0.18, 0, B); s.burst(0.06, 0.02, 600, 300, 0.8, 0.4, 'lowpass', B); break;
      case 'blip':   [880, 1175, 1568].forEach(function(f, i){ s.tone('square', f, f, 0.07, 0.014, i * 0.07, 0, B); }); break;
      case 'clank':  s.tone('square', 150, 90, 0.2, 0.03, 0, 0, B); s.burst(0.15, 0.05, 1800, 500, 1.2, 0, 'bandpass', B); break;
      case 'gym':    s.tone('sine', 90, 50, 0.2, 0.08, 0, 0, B); s.tone('sine', 1100, 1500, 0.06, 0.02, 0.2, 0, B); s.burst(0.12, 0.03, 4200, 2600, 1.4, 0.04, 'bandpass', B); break;
    }
  }
  const te = townEnter;
  townEnter = function(id, x, face){
    const was = Town.on && Town.d && TOWN_DIST[Town.d] ? Town.d : null, wasIn = was && TOWN_DIST[was].indoor;
    te.apply(this, arguments);
    try {
      if (!Town.on || Town.d !== id) return;
      const D = TOWN_DIST[id];
      if (D.indoor && !wasIn && was) doorIn(DOOR[id] || 'soft');
      else if (!D.indoor && wasIn){ SFX.tone('sine', 700, 520, 0.05, 0.02, 0, 0, bus()); SFX.burst(0.04, 0.02, 800, 400, 0.8, 0, 'lowpass', bus()); }
    } catch (e) {}
  };

  /* ---------- ambience for the rooms and streets that had none ---------- */
  Object.assign(TOWN_AMB, {
    campus: { wind: 0.03, windF: 520, chirp: ['bellcycle', 4, 10] },
    in_tailor: { hum: 0.01, chirp: ['sew', 3, 8] },
    in_hall: { hum: 0.006, chirp: ['tick', 1.0, 1.0] },
    in_studio: { hum: 0.018, chirp: ['camera', 6, 14] },
    in_myhome: { chirp: ['tick', 1.0, 1.0] },
    in_gym: { hum: 0.03, chirp: ['clank', 2, 6] },
    in_fstand: { wind: 0.02, windF: 360, chirp: ['cluck', 5, 11] },
    in_barn: { wind: 0.03, windF: 300, chirp: ['moo', 9, 18] },
    in_coop: { chirp: ['cluck', 1.5, 4] },
    in_fhouse: { chirp: ['crackle', 0.5, 1.8] },
    in_icottage: { water: 0.04, chirp: ['wave', 4, 9] },
    in_ifish: { water: 0.05, chirp: ['wave', 3, 7] },
    in_icrab: { water: 0.04, chirp: ['clink', 4, 9] },
    in_tackle: { water: 0.035, chirp: ['clink', 5, 11] },
    in_ilight: { wind: 0.06, windF: 380, water: 0.04, chirp: ['buoy', 7, 14] },
    in_uhall: { hum: 0.006, chirp: ['page', 7, 15] },
    in_ulecture: { hum: 0.008, chirp: ['chalk', 3, 8] },
    in_ulibrary: { hum: 0.005, chirp: ['page', 3, 8] },
    in_uhw: { chirp: ['pencil', 1.5, 4] },
    in_uexam: { hum: 0.006, chirp: ['tick', 1.0, 1.0] },
    in_ucafe: { wind: 0.025, windF: 280, chirp: ['murmur', 3, 7] }
  });
  const tc = townChirp;
  townChirp = function(kind){
    const s = SFX, B = Amb.bus; if (!s.ctx || !B) return tc(kind);
    switch (kind){
      case 'tick': s.tone('square', 2400, 2400, 0.012, 0.012, 0, 0, B); break;
      case 'chalk': s.burst(0.22, 0.03, 4200, 3000, 1, 0, 'highpass', B); s.burst(0.12, 0.02, 3600, 2800, 1, 0.26, 'highpass', B); break;
      case 'pencil': s.burst(0.1, 0.018, 3400, 2400, 1.2, 0, 'bandpass', B); break;
      case 'murmur': { const f = rnd(300, 520); s.tone('sawtooth', f, f * 0.85, 0.6, 0.006, 0, 0, B); s.tone('sawtooth', f * 1.26, f, 0.5, 0.005, 0.1, 0, B); s.burst(0.5, 0.012, 900, 500, 0.5, 0.05, 'bandpass', B); break; }
      case 'sew': for (let i = 0; i < 9; i++) s.tone('square', 900 + (i % 2) * 90, 900, 0.015, 0.008, i * 0.04, 0, B); break;
      case 'camera': s.burst(0.04, 0.03, 5000, 3000, 1.6, 0, 'bandpass', B); s.burst(0.05, 0.03, 4000, 2200, 1.6, 0.08, 'bandpass', B); break;
      case 'cluck': { const f = rnd(420, 560); s.tone('triangle', f, f * 0.7, 0.07, 0.03, 0, 0, B); s.tone('triangle', f * 1.1, f * 0.75, 0.07, 0.03, 0.1, 0, B); if (Math.random() < 0.5) s.tone('triangle', f, f * 0.7, 0.08, 0.025, 0.22, 0, B); break; }
      case 'moo': s.tone('sawtooth', 130, 105, 0.9, 0.025, 0, 0, B); s.tone('sine', 138, 100, 0.9, 0.03, 0.05, 0, B); break;
      case 'wave': s.burst(1.1, 0.03, 700, 260, 0.6, 0, 'lowpass', B); break;
      case 'buoy': s.tone('sine', 392, 388, 0.9, 0.04, 0, 0, B); s.tone('sine', 588, 580, 0.7, 0.015, 0.02, 0, B); break;
      case 'bellcycle': if (Math.random() < 0.6){ s.tone('sine', 2600, 2580, 0.18, 0.03, 0, 0, B); s.tone('sine', 2600, 2580, 0.18, 0.03, 0.14, 0, B); } else { const f = 392; s.tone('sine', f, f, 1.4, 0.045, 0, 0, B); s.tone('sine', f * 2, f * 2, 1.0, 0.02, 0, 0, B); s.tone('sine', f * 3, f * 3, 0.6, 0.008, 0, 0, B); } break;
      default: return tc(kind);
    }
  };
})();
