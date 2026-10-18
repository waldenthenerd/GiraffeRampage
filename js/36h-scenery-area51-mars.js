'use strict';
/* Scenery definitions: area51-mars (see js/36a-scenery-core.js for the format). Chapter 12 Area 51 and chapter 13 Mars.
   Everything lives inside one function so it adds no globals. The scenery core only knows about G.buildings (empty in these two
   chapters), so the runway, hangars, hatch and the Mars base are kept clear here: every object checks its spot the first time it is drawn. */
(function(){
  /* ---------- shared drawing helpers ---------- */
  function E(ctx, x, y, rx, ry, c, rot){ ctx.fillStyle = c; ctx.beginPath(); ctx.ellipse(x, y, rx, ry, rot || 0, 0, TAU); ctx.fill(); }
  function blob(ctx, R, sq, ox, oy, s, k0, n){                                  /* an irregular rock outline (path only) */
    ctx.beginPath();
    for (let i = 0; i < n; i++){
      const a = i / n * TAU + 0.3, r = R * (0.72 + 0.4 * scRnd(s, i + k0));
      if (i) ctx.lineTo(ox + Math.cos(a) * r, oy + Math.sin(a) * r * sq); else ctx.moveTo(ox + Math.cos(a) * r, oy + Math.sin(a) * r * sq);
    }
    ctx.closePath();
  }
  function rockFill(ctx, c, R, sq, ox, oy, s, k0, n){ blob(ctx, R, sq, ox, oy, s, k0, n); ctx.fillStyle = c; ctx.fill(); }
  function hideWrap(fn, rr, isZone){                                           /* skip objects that land on fixed base structures */
    return function(ctx, o, t){
      if (o.hide === undefined){
        o.hide = o.sceneBlocked(o.x, o.y, rr || o.r || (isZone ? o.rx * 0.6 : 30));
        if (o.hide && isZone){ o.rx = 0.01; o.ry = 0.01; }
      }
      if (!o.hide) fn(ctx, o, t);
    };
  }
  let blockedFn = function(){ return false; };
  function wrap(fn, rr, isZone){
    const inner = hideWrap(fn, rr, isZone);
    return function(ctx, o, t){ if (o.sceneBlocked === undefined) o.sceneBlocked = blockedFn; inner(ctx, o, t); };
  }
  /* all zones are checked once, right when the run is built (the first ambient init), so no blocked zone ever slows anyone */
  let zoneKey = null;
  function fixZones(){
    if (zoneKey === SCEN.zones) return; zoneKey = SCEN.zones;
    for (let i = 0; i < SCEN.zones.length; i++){ const z = SCEN.zones[i]; if (blockedFn(z.x, z.y, z.rx * 0.6)){ z.hide = true; z.rx = 0.01; z.ry = 0.01; } }
  }
  const DASH_A = [14, 10], DASH_B = [10, 12], DASH_C = [4, 5], NODASH = [];

  /* ===================================================== CHAPTER 12: AREA 51 ===================================================== */
  const A5_HANG = [[840, 540, 190, 115], [2100, 480, 220, 125], [3360, 570, 180, 110]];
  function a5Blocked(x, y, r){
    if (y > 2300 - r && y < 2530 + r && x > 200 - r && x < 4000 + r) return true;                      /* the runway */
    for (let i = 0; i < 3; i++){ const h = A5_HANG[i]; if (Math.abs(x - h[0]) < h[2] + r + 24 && Math.abs(y - h[1]) < h[3] + r + 34) return true; }
    const dx = x - 2100, dy = y - 1455; return dx * dx + dy * dy < (180 + r) * (180 + r);              /* the glowing hatch */
  }

  const area51 = {
    patches: [
      { fill: '#A98B5A', alpha: 0.2, count: 11, rMin: 220, rMax: 430, squash: 0.62 },              /* hardpan */
      { fill: '#DBC694', alpha: 0.2, count: 10, rMin: 200, rMax: 400, squash: 0.6 },               /* pale alkali flat */
      { fill: '#8E8460', alpha: 0.14, count: 8, rMin: 180, rMax: 340, squash: 0.7 },               /* scrub-stained ground */
      { fill: '#B7945F', alpha: 0.16, count: 8, rMin: 240, rMax: 420, squash: 0.5 }                /* oxidised dirt */
    ],
    props: [
      { id: 'a5_joshua', count: 22, r: 24, gap: 90, s: [0.85, 1.35], rot: false, draw: wrap(function(ctx, p, t){
          const s = p.seed, sw = scSway(t, p, 0.5), n = 3 + (s > 0.55 ? 1 : 0);
          scShadow(ctx, 24, 11, 0.2);
          ctx.strokeStyle = '#5A5236'; ctx.lineWidth = 4.5; ctx.lineCap = 'round'; ctx.beginPath();
          for (let k = 0; k < n; k++){ const a = k * 2.0 + s * 6; ctx.moveTo(0, 0); ctx.lineTo(Math.cos(a) * 17 + sw, Math.sin(a) * 13 - 2); }
          ctx.stroke();
          for (let k = 0; k < n; k++){ const a = k * 2.0 + s * 6, x = Math.cos(a) * 17 + sw, y = Math.sin(a) * 13 - 2;
            E(ctx, x, y, 10, 8.5, '#5C6840'); E(ctx, x - 1.5, y - 2, 6, 4.6, '#7C8A58'); }
          ctx.strokeStyle = '#47512F'; ctx.lineWidth = 1.4; ctx.beginPath();
          for (let k = 0; k < n; k++){ const a = k * 2.0 + s * 6, x = Math.cos(a) * 17 + sw, y = Math.sin(a) * 13 - 2;
            for (let j = 0; j < 4; j++){ const b = j * 1.57 + k; ctx.moveTo(x, y); ctx.lineTo(x + Math.cos(b) * 13, y + Math.sin(b) * 11); } }
          ctx.stroke();
        }) },
      { id: 'a5_sage', count: 44, r: 16, gap: 36, s: [0.8, 1.5], rot: false, draw: wrap(function(ctx, p){
          const s = p.seed;
          scShadow(ctx, 18, 8, 0.16);
          E(ctx, -7, 1, 9, 6, '#7B7F62'); E(ctx, 7, 2, 10, 6.5, '#757A5A'); E(ctx, 0, -3 + s * 2, 9.5, 6.5, '#8C906F');
          E(ctx, -2, -5, 5, 3, '#A4A683');
          ctx.fillStyle = '#6A6A4C'; ctx.fillRect(-9 + s * 4, 4, 2, 2); ctx.fillRect(5 - s * 3, 5, 2, 2);
        }) },
      { id: 'a5_rock', count: 28, r: 20, gap: 40, s: [0.7, 1.5], rot: true, draw: wrap(function(ctx, p){
          const s = p.seed, R = 15;
          scShadow(ctx, R * 1.25, R * 0.7, 0.2);
          rockFill(ctx, '#7C6440', R, 0.78, 1.5, 2, s, 0, 7);
          rockFill(ctx, '#A38A5C', R * 0.9, 0.74, -0.5, -0.5, s, 0, 7);
          rockFill(ctx, '#BDA473', R * 0.58, 0.64, -3, -4, s, 3, 6);
          rockFill(ctx, '#D1BA8E', R * 0.28, 0.5, -4.5, -6, s, 5, 5);
          if (s > 0.5){ ctx.strokeStyle = 'rgba(80,62,34,.5)'; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(1, -1); ctx.lineTo(7, 4); ctx.stroke(); }
        }) },
      { id: 'a5_drums', count: 12, r: 22, gap: 60, s: [0.9, 1.15], rot: true, draw: wrap(function(ctx, p){
          const s = p.seed;
          scShadow(ctx, 26, 11, 0.24);
          E(ctx, -9, -4, 9.5, 9.5, '#7C5638'); E(ctx, -9, -4, 6.5, 6.5, '#966A46');
          E(ctx, 9, 1, 9.5, 9.5, s > 0.5 ? '#6C6E50' : '#7C5638'); E(ctx, 9, 1, 6.5, 6.5, s > 0.5 ? '#838562' : '#966A46');
          ctx.fillStyle = '#6A4A2C'; ctx.fillRect(-4, 8, 17, 8.5); ctx.fillStyle = '#8A6644'; ctx.fillRect(-4, 8, 17, 3);
          ctx.strokeStyle = 'rgba(54,36,20,.6)'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(-9, -4, 9.5, 0, TAU); ctx.stroke();
        }) },
      { id: 'a5_barrier', count: 16, r: 30, gap: 60, s: [0.9, 1.1], rot: true, draw: wrap(function(ctx, p){
          scShadow(ctx, 38, 9, 0.24);
          ctx.fillStyle = '#9C998C'; ctx.fillRect(-32, -8, 64, 16);
          ctx.fillStyle = '#B6B3A4'; ctx.fillRect(-32, -8, 64, 5);
          ctx.fillStyle = '#C2813F'; ctx.beginPath();
          for (let k = 0; k < 4; k++){ const x = -28 + k * 15; ctx.moveTo(x, -3); ctx.lineTo(x + 8, -3); ctx.lineTo(x + 3, 8); ctx.lineTo(x - 5, 8); ctx.closePath(); }
          ctx.fill();
          ctx.strokeStyle = '#6E6A5C'; ctx.lineWidth = 1.5; ctx.strokeRect(-32, -8, 64, 16);
        }) },
      { id: 'a5_fence', count: 14, r: 44, gap: 60, s: [0.9, 1.2], rot: true, draw: wrap(function(ctx, p){
          const s = p.seed, lean = (s - 0.5) * 5;
          scShadow(ctx, 52, 7, 0.14);
          ctx.strokeStyle = 'rgba(214,218,206,.55)'; ctx.lineWidth = 1.6;
          ctx.beginPath(); ctx.moveTo(-48, 0); ctx.quadraticCurveTo(-10, 5 + lean, 48, -1 + lean); ctx.moveTo(-48, -8); ctx.quadraticCurveTo(-8, -3, 48, -9 + lean); ctx.stroke();
          ctx.strokeStyle = 'rgba(90,92,84,.5)'; ctx.lineWidth = 1; ctx.beginPath();
          for (let k = -4; k <= 3; k++){ ctx.moveTo(k * 12, -8); ctx.lineTo(k * 12 + 12, 0); ctx.moveTo(k * 12 + 12, -8); ctx.lineTo(k * 12, 0); }
          ctx.stroke();
          ctx.fillStyle = '#5E605A'; ctx.fillRect(-50, -11, 5, 14); ctx.fillRect(-2 + lean, -10, 5, 13); ctx.fillRect(45, -11, 5, 14);
        }) },
      { id: 'a5_sign', count: 10, r: 18, gap: 80, s: [0.9, 1.1], rot: true, draw: wrap(function(ctx, p){
          scShadow(ctx, 20, 7, 0.2);
          ctx.fillStyle = '#5C5E58'; ctx.fillRect(-12, 4, 3, 8); ctx.fillRect(9, 4, 3, 8);
          ctx.fillStyle = '#D9D3BE'; ctx.fillRect(-18, -12, 36, 18);
          ctx.fillStyle = '#A8553C'; ctx.fillRect(-18, -12, 36, 5);
          ctx.fillStyle = '#6E6A60'; ctx.fillRect(-13, -2, 26, 2); ctx.fillRect(-13, 1.5, 18, 2);
          ctx.strokeStyle = '#6E6A5C'; ctx.lineWidth = 1.3; ctx.strokeRect(-18, -12, 36, 18);
        }) },
      { id: 'a5_debris', count: 7, r: 26, gap: 160, s: [0.8, 1.3], rot: true, draw: wrap(function(ctx, p){
          const s = p.seed;
          scShadow(ctx, 30, 12, 0.2);
          E(ctx, 0, 2, 28, 15, 'rgba(60,44,30,.35)', 0.2);                                      /* scorch ring */
          ctx.fillStyle = '#9EA3A2'; ctx.beginPath(); ctx.moveTo(-22, 4); ctx.quadraticCurveTo(-4, -16 - s * 6, 20, -6); ctx.lineTo(16, 6); ctx.quadraticCurveTo(-4, -4, -20, 10); ctx.closePath(); ctx.fill();
          ctx.fillStyle = '#C3C6C2'; ctx.beginPath(); ctx.moveTo(-18, 3); ctx.quadraticCurveTo(-4, -12, 14, -5); ctx.lineTo(10, -2); ctx.quadraticCurveTo(-4, -7, -17, 6); ctx.closePath(); ctx.fill();
          ctx.fillStyle = '#7C8284'; ctx.fillRect(14, 8, 10, 4); ctx.fillRect(-26, -2, 6, 3);
          ctx.fillStyle = '#E2E4E0'; ctx.fillRect(-8, -7, 3, 1.5);
        }) }
    ],
    landmarks: [
      { id: 'a5_dish', count: 2, r: 130, gap: 900, s: [1, 1.15], rot: false, draw: wrap(function(ctx, p, t){
          const a = t * 0.12 + p.seed * 6;
          E(ctx, 34, 36, 126, 70, 'rgba(24,16,8,.26)', 0.1);                                     /* shadow */
          ctx.fillStyle = '#8A8B82'; ctx.fillRect(-70, -50, 140, 100);                          /* concrete pad */
          ctx.fillStyle = '#A2A398'; ctx.fillRect(-70, -50, 140, 12);
          ctx.strokeStyle = '#5E5F58'; ctx.lineWidth = 3; ctx.strokeRect(-70, -50, 140, 100);
          E(ctx, 0, 0, 62, 62, '#6C6E6A'); E(ctx, 0, 0, 56, 56, '#C7CAC4'); E(ctx, -4, -4, 40, 40, '#DDDFD8');
          ctx.strokeStyle = '#8D908A'; ctx.lineWidth = 2; ctx.beginPath();
          for (let k = 0; k < 8; k++){ const b = k * TAU / 8; ctx.moveTo(0, 0); ctx.lineTo(Math.cos(b) * 56, Math.sin(b) * 56); }
          ctx.stroke();
          ctx.strokeStyle = '#5A5C58'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(a) * 62, Math.sin(a) * 62); ctx.stroke();
          E(ctx, 0, 0, 7, 7, '#4A4C48');
        }) },
      { id: 'a5_butte', count: 2, r: 150, gap: 900, s: [0.95, 1.2], rot: false, draw: wrap(function(ctx, p){
          const s = p.seed;
          E(ctx, 62, 52, 190, 106, 'rgba(34,22,10,.26)', 0.35);
          rockFill(ctx, '#7B6238', 138, 0.78, 0, 0, s, 0, 9);
          rockFill(ctx, '#9A8050', 118, 0.76, -6, -8, s, 4, 9);
          rockFill(ctx, '#B79C69', 92, 0.72, -12, -16, s, 8, 8);
          rockFill(ctx, '#C9B07E', 62, 0.66, -16, -22, s, 12, 7);
          ctx.strokeStyle = 'rgba(70,52,26,.45)'; ctx.lineWidth = 3; ctx.beginPath();
          ctx.moveTo(-90, 20); ctx.quadraticCurveTo(-20, 38, 70, 16); ctx.moveTo(-70, 48); ctx.quadraticCurveTo(0, 60, 66, 40); ctx.stroke();
        }) },
      { id: 'a5_containers', count: 3, r: 100, gap: 700, s: [0.95, 1.1], rot: true, draw: wrap(function(ctx, p){
          const s = p.seed, cols = ['#6F7A5E', '#8A6A4A', '#7C8590'];
          E(ctx, 14, 16, 102, 52, 'rgba(24,16,8,.22)');
          for (let k = 0; k < 3; k++){ const x = -72 + k * 4, y = -44 + k * 32, c = cols[(k + ((s * 3) | 0)) % 3], w = 120 - k * 14;
            ctx.fillStyle = c; ctx.fillRect(x, y, w, 26);
            ctx.fillStyle = 'rgba(255,255,255,.14)'; ctx.fillRect(x, y, w, 5);
            ctx.strokeStyle = 'rgba(30,24,16,.4)'; ctx.lineWidth = 1.3; ctx.beginPath();
            for (let j = 1; j < 8; j++){ ctx.moveTo(x + j * w / 8, y + 5); ctx.lineTo(x + j * w / 8, y + 26); }
            ctx.stroke(); ctx.strokeRect(x, y, w, 26); }
        }) }
    ],
    decals: [
      { id: 'a5_tyre', count: 40, s: [0.9, 1.5], draw: wrap(function(ctx, d){
          const w = 60 + d.seed * 30;
          ctx.strokeStyle = 'rgba(86,64,36,.2)'; ctx.lineWidth = 3; ctx.lineCap = 'butt';
          ctx.beginPath();
          ctx.moveTo(-w * 2, -5); ctx.quadraticCurveTo(-w, 6, 0, -2); ctx.quadraticCurveTo(w, -8, w * 2, 4);
          ctx.moveTo(-w * 2, 7); ctx.quadraticCurveTo(-w, 18, 0, 10); ctx.quadraticCurveTo(w, 4, w * 2, 16);
          ctx.stroke();
        }, 140) },
      { id: 'a5_crack', count: 26, s: [0.8, 1.6], draw: wrap(function(ctx, d){
          ctx.strokeStyle = 'rgba(92,70,40,.3)'; ctx.lineWidth = 1.5; ctx.beginPath();
          for (let k = 0; k < 5; k++){ const a = k * 1.3 + d.seed * 5, l = 22 + scRnd(d.seed, k) * 26; ctx.moveTo(0, 0); ctx.lineTo(Math.cos(a) * l * 0.5 + 4, Math.sin(a) * l * 0.5); ctx.lineTo(Math.cos(a + 0.4) * l, Math.sin(a + 0.4) * l); }
          ctx.stroke();
        }, 60) },
      { id: 'a5_scorch', count: 16, s: [0.7, 1.4], draw: wrap(function(ctx, d){
          E(ctx, 0, 0, 34, 20, 'rgba(60,42,26,.16)', 0.3);
          E(ctx, 3, 1, 20, 11, 'rgba(46,32,20,.2)', 0.3);
        }, 50) },
      { id: 'a5_stencil', count: 14, s: [1, 1.2], draw: wrap(function(ctx){
          ctx.fillStyle = 'rgba(232,226,200,.22)';
          ctx.fillRect(-36, -4, 18, 8); ctx.fillRect(-9, -4, 18, 8); ctx.fillRect(18, -4, 18, 8);
          ctx.fillRect(-36, 12, 72, 3);
        }, 60) },
      { id: 'a5_ripple', count: 50, s: [0.8, 1.6], draw: wrap(function(ctx, d){
          ctx.strokeStyle = 'rgba(122,96,56,.22)'; ctx.lineWidth = 2; ctx.beginPath();
          ctx.moveTo(-28, 0); ctx.quadraticCurveTo(0, -9, 28, 0); ctx.moveTo(-18, 9); ctx.quadraticCurveTo(0, 2, 20, 9); ctx.stroke();
        }, 50) }
    ],
    ambient: [
      { id: 'a5_weed', count: 8, layer: 'under',
        init: function(a){ fixZones(); a.vx = 34 + a.seed * 30; },
        update: function(a, dt, t){ a.x += a.vx * dt; a.y += Math.sin(t * 0.9 + a.ph) * 16 * dt; },
        draw: function(ctx, a, t){
          const hop = Math.abs(Math.sin(t * 2.6 + a.ph)) * 5;
          E(ctx, 3, 6, 9, 4, 'rgba(40,28,14,.2)');
          ctx.translate(0, -hop); ctx.rotate(a.x * 0.045);
          ctx.strokeStyle = '#85693C'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(0, 0, 9, 0, TAU);
          ctx.moveTo(-9, 0); ctx.quadraticCurveTo(0, -7, 9, 1); ctx.moveTo(0, -9); ctx.quadraticCurveTo(7, 0, 0, 9); ctx.moveTo(-6, -6); ctx.lineTo(6, 6); ctx.stroke();
        } },
      { id: 'a5_devil', count: 4, layer: 'under',
        init: function(a){ a.dir = a.seed * TAU; },
        update: function(a, dt, t){ a.dir += Math.sin(t * 0.3 + a.ph) * 0.35 * dt; a.x += Math.cos(a.dir) * 26 * dt; a.y += Math.sin(a.dir) * 18 * dt; },
        draw: function(ctx, a, t){
          for (let k = 0; k < 5; k++){ const h = k / 5, w = 9 + h * 28;
            ctx.globalAlpha = 0.11 * (1 - h * 0.45); E(ctx, Math.sin(t * 2.4 + k * 1.3 + a.ph) * 7 * h, -h * 74, w, w * 0.38, '#F1E2B8'); }
        } },
      { id: 'a5_vulture', count: 4, layer: 'over',
        init: function(a){ a.cx = Math.max(500, Math.min(ARENA_W - 500, a.x)); a.cy = Math.max(400, Math.min(ARENA_H - 400, a.y)); a.R = 150 + a.seed * 180; a.ang = a.ph; a.w = (0.1 + a.seed * 0.08) * (a.seed > 0.5 ? 1 : -1); a.hd = 0; a.x = a.cx + Math.cos(a.ang) * a.R; a.y = a.cy + Math.sin(a.ang) * a.R * 0.7; },
        update: function(a, dt){ a.ang += a.w * dt; a.x = a.cx + Math.cos(a.ang) * a.R; a.y = a.cy + Math.sin(a.ang) * a.R * 0.7; a.hd = Math.atan2(Math.cos(a.ang) * 0.7, -Math.sin(a.ang)) + (a.w < 0 ? Math.PI : 0); },
        draw: function(ctx, a, t){
          E(ctx, 30, 52, 15, 6, 'rgba(30,20,10,.14)');
          ctx.rotate(a.hd);
          const f = 0.85 + 0.15 * Math.sin(t * 1.7 + a.ph);
          ctx.strokeStyle = '#3A3126'; ctx.lineWidth = 3; ctx.lineCap = 'round'; ctx.beginPath();
          ctx.moveTo(-9, -17 * f); ctx.lineTo(1, -3); ctx.lineTo(1, 3); ctx.lineTo(-9, 17 * f); ctx.stroke();
          E(ctx, 0, 0, 7, 3.2, '#2E271E'); E(ctx, 7, 0, 2.4, 2.2, '#8A5A4A');
        } }
    ],
    terrain: [
      { id: 'a5_dune', kind: 'slow', mul: 0.74, count: 5, rMin: 100, rMax: 160, squash: 0.62, hint: 'Soft sand slows you and the soldiers',
        draw: wrap(function(ctx, z){
          E(ctx, 0, 0, z.rx, z.ry, 'rgba(226,206,158,.4)');
          E(ctx, -z.rx * 0.08, -z.ry * 0.12, z.rx * 0.78, z.ry * 0.7, 'rgba(238,222,178,.3)');
          ctx.strokeStyle = 'rgba(146,114,68,.55)'; ctx.lineWidth = 2.5; ctx.setLineDash(DASH_A); ctx.beginPath(); ctx.ellipse(0, 0, z.rx, z.ry, 0, 0, TAU); ctx.stroke(); ctx.setLineDash(NODASH);
          ctx.lineWidth = 2.2; ctx.strokeStyle = 'rgba(146,114,68,.5)'; ctx.beginPath();
          for (let k = 0; k < 4; k++){ const y = (k - 1.5) * z.ry * 0.38, w = z.rx * (0.78 - Math.abs(k - 1.5) * 0.18); ctx.moveTo(-w, y); ctx.quadraticCurveTo(0, y - 13, w, y); }
          ctx.stroke();
        }, 0, true) },
      { id: 'a5_gust', kind: 'push', dir: 0.5, force: 55, count: 4, rMin: 100, rMax: 140, squash: 0.58, hint: 'A hot gust shoves you along',
        draw: wrap(function(ctx, z, t){
          ctx.rotate(0.5 - z.rot);
          E(ctx, 0, 0, z.rx, z.ry, 'rgba(255,248,226,.12)');
          ctx.strokeStyle = 'rgba(255,248,226,.5)'; ctx.lineWidth = 2; ctx.setLineDash(DASH_B); ctx.beginPath(); ctx.ellipse(0, 0, z.rx, z.ry, 0, 0, TAU); ctx.stroke(); ctx.setLineDash(NODASH);
          ctx.strokeStyle = 'rgba(255,250,232,.62)'; ctx.lineWidth = 2.4; ctx.lineCap = 'round'; ctx.beginPath();
          for (let k = 0; k < 5; k++){
            const y = (k - 2) * z.ry * 0.36, span = z.rx * 2.1, x = ((t * 62 + k * 83 + z.seed * 300) % span) - z.rx * 1.05;
            const e = 1 - (x * x) / (z.rx * z.rx * 1.1); if (e <= 0.1) continue;
            const l = z.rx * 0.5 * e; ctx.moveTo(x, y); ctx.lineTo(x + l, y); ctx.lineTo(x + l - 6, y - 5); ctx.moveTo(x + l, y); ctx.lineTo(x + l - 6, y + 5);
          }
          ctx.stroke();
        }, 0, true) }
    ]
  };

  /* ===================================================== CHAPTER 13: MARS ===================================================== */
  function mrBlocked(x, y, r){ const dx = x - 1260, dy = y - 945; return dx * dx + dy * dy < (270 + r) * (270 + r); }   /* the SP-1 and her habitat */

  const mars = {
    patches: [
      { fill: '#7C3220', alpha: 0.2, count: 12, rMin: 260, rMax: 460, squash: 0.3 },                /* iron-oxide striations */
      { fill: '#DDBBA8', alpha: 0.15, count: 7, rMin: 140, rMax: 260, squash: 0.7 },               /* ice-dust frost */
      { fill: '#C9803C', alpha: 0.14, count: 8, rMin: 200, rMax: 380, squash: 0.55 },              /* ochre dust */
      { fill: '#5A3430', alpha: 0.2, count: 8, rMin: 180, rMax: 340, squash: 0.6 }                 /* dark basalt sand */
    ],
    props: [
      { id: 'mr_ridge', count: 32, r: 24, gap: 50, s: [0.7, 1.5], rot: true, draw: wrap(function(ctx, p){
          const s = p.seed, R = 17;
          scShadow(ctx, R * 1.3, R * 0.7, 0.26);
          rockFill(ctx, '#6E3322', R, 0.72, 0, 0, s, 0, 6);
          rockFill(ctx, '#935240', R * 0.7, 0.62, -3, -3, s, 2, 5);
          ctx.strokeStyle = '#C8896C'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(-8, -6); ctx.lineTo(1, -8); ctx.lineTo(7, -3); ctx.stroke();
          ctx.strokeStyle = 'rgba(40,14,8,.4)'; ctx.beginPath(); ctx.moveTo(-6, 2); ctx.lineTo(9, 4); ctx.stroke();
        }) },
      { id: 'mr_boulders', count: 14, r: 34, gap: 90, s: [0.8, 1.3], rot: false, draw: wrap(function(ctx, p){
          const s = p.seed;
          scShadow(ctx, 38, 14, 0.26);
          for (let k = 0; k < 4; k++){ const x = (scRnd(s, k) - 0.5) * 40, y = (scRnd(s, k + 9) - 0.5) * 22, r = 8 + scRnd(s, k + 4) * 9;
            E(ctx, x + 2, y + 3, r, r * 0.8, 'rgba(30,10,6,.26)'); rockFill(ctx, '#64302A', r, 0.82, x, y, s, k, 6); rockFill(ctx, '#8B4C3E', r * 0.55, 0.7, x - r * 0.25, y - r * 0.28, s, k + 3, 5); }
        }) },
      { id: 'mr_ventifact', count: 18, r: 26, gap: 70, s: [0.8, 1.35], rot: true, draw: wrap(function(ctx, p){
          const s = p.seed;
          E(ctx, 20, 4, 22, 5.5, 'rgba(214,140,100,.6)', 0.05);                                 /* the drift behind it */
          scShadow(ctx, 20, 8, 0.26);
          ctx.fillStyle = '#5A2B22'; ctx.beginPath(); ctx.moveTo(-18, 0); ctx.quadraticCurveTo(-6, -11 - s * 3, 10, -6); ctx.lineTo(20, -1); ctx.lineTo(12, 7 + s * 2); ctx.quadraticCurveTo(-6, 11, -18, 0); ctx.fill();
          ctx.fillStyle = '#85463A'; ctx.beginPath(); ctx.moveTo(-14, -1); ctx.quadraticCurveTo(-4, -8, 8, -5); ctx.lineTo(14, -1); ctx.quadraticCurveTo(0, -2, -14, 3); ctx.closePath(); ctx.fill();
          ctx.strokeStyle = 'rgba(30,10,6,.45)'; ctx.lineWidth = 1.2; ctx.beginPath();
          ctx.moveTo(-8, 3); ctx.lineTo(10, 4); ctx.moveTo(-4, 6); ctx.lineTo(6, 6.5); ctx.stroke();
        }) },
      { id: 'mr_cairn', count: 6, r: 18, gap: 140, s: [0.9, 1.2], rot: false, draw: wrap(function(ctx, p){
          scShadow(ctx, 20, 8, 0.28);
          E(ctx, 0, 2, 15, 12, '#5E3A34'); E(ctx, -1, 0, 10, 8, '#7A524A'); E(ctx, -1.5, -2, 5.5, 4.5, '#9A6C60');
          E(ctx, -2.5, -3.5, 2.2, 1.6, '#C99C8C');
        }) },
      { id: 'mr_frost', count: 16, r: 30, gap: 70, s: [0.8, 1.4], rot: true, draw: wrap(function(ctx, p){
          const s = p.seed;
          E(ctx, -12, 1, 15, 7, 'rgba(230,204,192,.26)', 0.3);
          E(ctx, 9, 3, 18, 8, 'rgba(230,204,192,.26)', -0.2);
          E(ctx, -1, -4, 13, 6, 'rgba(238,216,206,.3)', 0.1);
          ctx.fillStyle = 'rgba(250,236,228,.5)';
          for (let k = 0; k < 4; k++) ctx.fillRect(-18 + scRnd(s, k) * 34, -6 + scRnd(s, k + 5) * 12, 3, 2);
        }) },
      { id: 'mr_wreck', count: 5, r: 30, gap: 200, s: [0.9, 1.25], rot: true, draw: wrap(function(ctx, p){
          const s = p.seed;
          scShadow(ctx, 34, 12, 0.26);
          E(ctx, -16, 5, 12, 9, '#6C737E'); E(ctx, -16, 5, 8.5, 6, '#8D95A0');                  /* a landing-gear foot pad */
          ctx.strokeStyle = '#7F8792'; ctx.lineWidth = 4; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-16, 5); ctx.lineTo(0, -8); ctx.lineTo(14 + s * 6, -3); ctx.stroke();
          ctx.strokeStyle = '#B2B8C2'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(-14, 3); ctx.lineTo(0, -9); ctx.stroke();
          ctx.fillStyle = '#7A808A'; ctx.beginPath(); ctx.moveTo(8, 4); ctx.lineTo(26, 0); ctx.lineTo(24, 11); ctx.lineTo(10, 12); ctx.closePath(); ctx.fill();
          ctx.fillStyle = '#C48B6C'; ctx.beginPath(); ctx.ellipse(18, 10, 12, 4, 0, 0, TAU); ctx.fill();
        }) },
      { id: 'mr_drift', count: 22, r: 22, gap: 40, s: [0.8, 1.6], rot: true, draw: wrap(function(ctx, p){
          E(ctx, 0, 1, 26, 8, 'rgba(60,20,12,.16)');
          E(ctx, -2, -1, 24, 6.5, '#BE6A44'); E(ctx, -5, -3, 15, 3.4, '#D8885E');
        }) }
    ],
    landmarks: [
      { id: 'mr_mesa', count: 2, r: 170, gap: 900, s: [0.95, 1.2], rot: false, draw: wrap(function(ctx, p){
          const s = p.seed;
          E(ctx, 70, 56, 205, 110, 'rgba(26,8,4,.3)', 0.35);
          rockFill(ctx, '#5C2A1E', 150, 0.8, 0, 0, s, 0, 9);
          rockFill(ctx, '#79392A', 128, 0.77, -6, -9, s, 4, 9);
          rockFill(ctx, '#A05A3E', 102, 0.72, -12, -18, s, 8, 8);
          rockFill(ctx, '#B87050', 70, 0.66, -16, -24, s, 12, 7);
          ctx.strokeStyle = 'rgba(60,20,12,.5)'; ctx.lineWidth = 3; ctx.beginPath();
          ctx.moveTo(-100, 22); ctx.quadraticCurveTo(-20, 42, 76, 18); ctx.moveTo(-76, 52); ctx.quadraticCurveTo(0, 64, 70, 44);
          ctx.moveTo(-34, -22); ctx.lineTo(-20, -2); ctx.lineTo(-26, 12); ctx.stroke();
        }) },
      { id: 'mr_ship', count: 1, r: 150, gap: 900, s: [1, 1.1], rot: true, draw: wrap(function(ctx, p){
          const s = p.seed;
          E(ctx, 14, 26, 170, 54, 'rgba(26,8,4,.3)');
          E(ctx, 0, 0, 160, 50, '#5A4A46'); E(ctx, -6, -9, 140, 36, '#7E6E68'); E(ctx, -14, -16, 100, 18, '#968680');
          ctx.strokeStyle = 'rgba(40,24,20,.55)'; ctx.lineWidth = 2.5; ctx.beginPath();
          for (let k = -4; k <= 4; k++){ ctx.moveTo(k * 28, -38); ctx.lineTo(k * 28 + 6, 34); }
          ctx.stroke();
          ctx.fillStyle = '#463834'; ctx.beginPath(); ctx.moveTo(110, -30); ctx.lineTo(176, -58); ctx.lineTo(154, -14); ctx.closePath(); ctx.fill();   /* a broken fin */
          ctx.fillStyle = '#2A1C18'; ctx.beginPath(); ctx.moveTo(-160, -8); ctx.lineTo(-130, -20); ctx.lineTo(-142, -2); ctx.lineTo(-128, 14); ctx.lineTo(-160, 12); ctx.closePath(); ctx.fill();
          E(ctx, 10, 18, 160, 38, 'rgba(176,92,58,.94)', -0.04); E(ctx, 0, 26, 122, 14, '#CC7B52', -0.04);   /* the drift burying her */
          E(ctx, -40, 14, 26 + s * 6, 10, '#B0593A');
        }) },
      { id: 'mr_spires', count: 2, r: 100, gap: 700, s: [0.95, 1.2], rot: false, draw: wrap(function(ctx, p){
          const s = p.seed;
          for (let k = 0; k < 4; k++){ const x = -56 + k * 38 + (scRnd(s, k) - 0.5) * 24, y = (scRnd(s, k + 7) - 0.5) * 60, r = 17 + scRnd(s, k + 3) * 11;
            E(ctx, x + 22, y + 16, r * 1.4, r * 0.7, 'rgba(26,8,4,.28)', 0.5);
            E(ctx, x, y, r * 1.12, r * 0.95, '#52261C'); E(ctx, x - 2, y - 4, r * 0.9, r * 0.74, '#7C4032'); E(ctx, x - 4, y - 7, r * 0.5, r * 0.4, '#A66652'); }
        }) }
    ],
    decals: [
      { id: 'mr_rover', count: 28, s: [0.9, 1.5], draw: wrap(function(ctx, d){
          const w = 70 + d.seed * 40;
          ctx.strokeStyle = 'rgba(60,20,12,.2)'; ctx.lineWidth = 4; ctx.setLineDash(DASH_C); ctx.beginPath();
          ctx.moveTo(-w * 2, -9); ctx.quadraticCurveTo(-w, 2, 0, -5); ctx.quadraticCurveTo(w, -11, w * 2, 1);
          ctx.moveTo(-w * 2, 9); ctx.quadraticCurveTo(-w, 20, 0, 12); ctx.quadraticCurveTo(w, 6, w * 2, 17);
          ctx.stroke(); ctx.setLineDash(NODASH);
        }, 160) },
      { id: 'mr_channel', count: 14, s: [0.9, 1.5], draw: wrap(function(ctx, d){
          ctx.lineCap = 'round';
          ctx.strokeStyle = 'rgba(70,24,14,.2)'; ctx.lineWidth = 9; ctx.beginPath();
          ctx.moveTo(-170, 10); ctx.bezierCurveTo(-90, -40, -30, 50, 40, 6); ctx.bezierCurveTo(90, -20, 130, 20, 180, -6); ctx.stroke();
          ctx.strokeStyle = 'rgba(214,150,114,.25)'; ctx.lineWidth = 2.5; ctx.beginPath();
          ctx.moveTo(-170, 3); ctx.bezierCurveTo(-90, -47, -30, 43, 40, -1); ctx.bezierCurveTo(90, -27, 130, 13, 180, -13); ctx.stroke();
        }, 190) },
      { id: 'mr_pit', count: 30, s: [0.7, 1.4], draw: wrap(function(ctx, d){
          E(ctx, 0, 0, 13, 9, 'rgba(60,18,10,.34)'); E(ctx, 1, 1, 9, 6, 'rgba(36,10,6,.3)');
          ctx.strokeStyle = 'rgba(230,160,124,.3)'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.ellipse(0, 0, 13, 9, 0, 3.4, 5.6); ctx.stroke();
        }, 40) },
      { id: 'mr_ripple', count: 50, s: [0.8, 1.6], draw: wrap(function(ctx){
          ctx.strokeStyle = 'rgba(80,28,16,.24)'; ctx.lineWidth = 2; ctx.beginPath();
          ctx.moveTo(-30, 0); ctx.quadraticCurveTo(0, -9, 30, 0); ctx.moveTo(-18, 9); ctx.quadraticCurveTo(0, 2, 22, 9); ctx.stroke();
        }, 50) },
      { id: 'mr_grit', count: 40, s: [0.8, 1.4], draw: wrap(function(ctx, d){
          ctx.fillStyle = 'rgba(70,26,16,.38)';
          for (let k = 0; k < 5; k++) ctx.fillRect((scRnd(d.seed, k) - 0.5) * 34, (scRnd(d.seed, k + 5) - 0.5) * 20, 2.5, 2);
        }, 40) }
    ],
    ambient: [
      { id: 'mr_devil', count: 5, layer: 'under',
        init: function(a){ fixZones(); a.dir = a.seed * TAU; },
        update: function(a, dt, t){ a.dir += Math.sin(t * 0.25 + a.ph) * 0.3 * dt; a.x += Math.cos(a.dir) * 30 * dt; a.y += Math.sin(a.dir) * 20 * dt; },
        draw: function(ctx, a, t){
          for (let k = 0; k < 6; k++){ const h = k / 6, w = 8 + h * 36;
            ctx.globalAlpha = 0.14 * (1 - h * 0.5); E(ctx, Math.sin(t * 2.2 + k * 1.2 + a.ph) * 9 * h, -h * 92, w, w * 0.4, k % 2 ? '#E9B590' : '#D8946C'); }
          ctx.globalAlpha = 0.18; E(ctx, 0, 2, 9, 4, '#5C2616');
        } },
      { id: 'mr_sheet', count: 6, layer: 'under',
        init: function(a){ a.vx = 14 + a.seed * 14; a.w = 170 + a.seed * 120; },
        update: function(a, dt, t){ a.x += a.vx * dt; a.y += Math.sin(t * 0.2 + a.ph) * 5 * dt; },
        draw: function(ctx, a, t){
          ctx.globalAlpha = 0.045 + 0.03 * Math.sin(t * 0.5 + a.ph);
          E(ctx, 0, 0, a.w, a.w * 0.3, '#EEC4A4', -0.1); E(ctx, a.w * 0.2, a.w * 0.08, a.w * 0.6, a.w * 0.16, '#F4D4B8', -0.1);
        } }
    ],
    terrain: [
      { id: 'mr_drift', kind: 'slow', mul: 0.72, count: 5, rMin: 100, rMax: 150, squash: 0.65, hint: 'Deep dust slows you and the aliens',
        draw: wrap(function(ctx, z){
          E(ctx, 0, 0, z.rx, z.ry, 'rgba(216,138,96,.42)');
          E(ctx, -z.rx * 0.1, -z.ry * 0.12, z.rx * 0.74, z.ry * 0.66, 'rgba(236,170,128,.34)');
          ctx.strokeStyle = 'rgba(70,24,12,.5)'; ctx.lineWidth = 2.5; ctx.setLineDash(DASH_A); ctx.beginPath(); ctx.ellipse(0, 0, z.rx, z.ry, 0, 0, TAU); ctx.stroke(); ctx.setLineDash(NODASH);
          ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(244,196,160,.5)'; ctx.beginPath();
          for (let k = 0; k < 4; k++){ const y = (k - 1.5) * z.ry * 0.38, w = z.rx * (0.76 - Math.abs(k - 1.5) * 0.18); ctx.moveTo(-w, y); ctx.quadraticCurveTo(0, y - 12, w, y); }
          ctx.stroke();
        }, 0, true) },
      { id: 'mr_gust', kind: 'push', dir: 0.3, force: 60, count: 5, rMin: 100, rMax: 140, squash: 0.58, hint: 'A dust gust pushes you along',
        draw: wrap(function(ctx, z, t){
          ctx.rotate(0.3 - z.rot);
          E(ctx, 0, 0, z.rx, z.ry, 'rgba(246,206,176,.12)');
          ctx.strokeStyle = 'rgba(250,222,198,.5)'; ctx.lineWidth = 2; ctx.setLineDash(DASH_B); ctx.beginPath(); ctx.ellipse(0, 0, z.rx, z.ry, 0, 0, TAU); ctx.stroke(); ctx.setLineDash(NODASH);
          ctx.strokeStyle = 'rgba(252,230,210,.62)'; ctx.lineWidth = 2.4; ctx.lineCap = 'round'; ctx.beginPath();
          for (let k = 0; k < 5; k++){
            const y = (k - 2) * z.ry * 0.36, span = z.rx * 2.1, x = ((t * 66 + k * 79 + z.seed * 300) % span) - z.rx * 1.05;
            const e = 1 - (x * x) / (z.rx * z.rx * 1.1); if (e <= 0.1) continue;
            const l = z.rx * 0.5 * e; ctx.moveTo(x, y); ctx.lineTo(x + l, y); ctx.lineTo(x + l - 6, y - 5); ctx.moveTo(x + l, y); ctx.lineTo(x + l - 6, y + 5);
          }
          ctx.stroke();
        }, 0, true) }
    ]
  };

  /* every object is wrapped with the blocked test of its own chapter */
  function arm(def, fn){
    const lists = [def.props, def.landmarks, def.decals, def.terrain];
    for (let i = 0; i < lists.length; i++) for (let k = 0; k < lists[i].length; k++){
      const d = lists[i][k], orig = d.draw;
      d.draw = function(ctx, o, t){ if (o.sceneBlocked === undefined) o.sceneBlocked = fn; orig(ctx, o, t); };
    }
    for (let k = 0; k < def.ambient.length; k++){ const m = def.ambient[k], oi = m.init; m.init = function(a){ blockedFn = fn; if (oi) oi(a); fixZones(); }; }
  }
  arm(area51, a5Blocked);
  arm(mars, mrBlocked);
  sceneryRegister([12], area51);
  sceneryRegister([13], mars);
})();
