'use strict';
/* Scenery definitions: city-space (see js/36a-scenery-core.js for the format). Chapter 6 Houston, chapter 7 Johnson Space Center. */
(function(){
  /* ---------- shared tiny helpers (all local to this file) ---------- */
  function poly(ctx, pts){ ctx.beginPath(); ctx.moveTo(pts[0], pts[1]); for (let i = 2; i < pts.length; i += 2) ctx.lineTo(pts[i], pts[i + 1]); ctx.closePath(); ctx.fill(); }
  function pick(arr, seed, k){ return arr[Math.floor(scRnd(seed, k) * arr.length) % arr.length]; }
  function blob(ctx, x, y, rx, ry, rot, col){ ctx.fillStyle = col; ctx.beginPath(); ctx.ellipse(x, y, rx, ry, rot, 0, TAU); ctx.fill(); }
  /* which way the nearest road runs (cached on the prop): cars and barriers line up with it */
  function roadAngle(p, block){
    if (p.o === undefined){
      const dx = Math.abs(((p.x + block / 2) % block) - block / 2), dy = Math.abs(((p.y + block / 2) % block) - block / 2);
      p.o = (dx < dy ? Math.PI / 2 : 0) + (scRnd(p.seed, 3) - 0.5) * 0.3;
    }
    return p.o;
  }
  /* decals must not lie on top of a building roof */
  function onRoof(d){ if (d.hide === undefined) d.hide = !!buildingAt(d.x, d.y); return d.hide; }
  /* a moving bird seen from above, with its own little ground shadow */
  function drawBird(ctx, a, col, wing, sz){
    const f = 0.35 + 0.65 * Math.abs(Math.sin(G.time * 13 + a.ph));
    ctx.fillStyle = 'rgba(0,0,0,.16)'; ctx.beginPath(); ctx.ellipse(9, 20, 5 * sz, 2.2 * sz, a.h, 0, TAU); ctx.fill();
    ctx.rotate(a.h);
    ctx.fillStyle = wing; ctx.beginPath(); ctx.ellipse(0, 0, 3.2 * sz, 9 * f * sz, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = col; ctx.beginPath(); ctx.ellipse(0, 0, 6 * sz, 3 * sz, 0, 0, TAU); ctx.fill();
    ctx.beginPath(); ctx.arc(5.5 * sz, 0, 2.2 * sz, 0, TAU); ctx.fill();
  }
  function birdInit(a){ a.h = Math.random() * TAU; a.sp = 80 + Math.random() * 60; }
  function birdUpdate(a, dt, t){
    a.h += Math.sin(t * 0.35 + a.ph) * 0.5 * dt;
    a.x += Math.cos(a.h) * a.sp * dt; a.y += Math.sin(a.h) * a.sp * dt;
  }
  /* steam: a vent plate and three soft puffs rising and fading in a loop */
  function drawSteam(ctx, a, t, rim){
    ctx.fillStyle = rim; ctx.fillRect(-8, -4, 16, 8);
    ctx.fillStyle = 'rgba(20,20,22,.55)'; ctx.fillRect(-6, -2.5, 12, 5);
    ctx.fillStyle = '#E6E8EC';
    for (let i = 0; i < 3; i++){
      const ph = (t * 0.45 + a.seed * 3 + i / 3) % 1;
      ctx.globalAlpha = 0.22 * (1 - ph);
      ctx.beginPath(); ctx.arc(Math.sin(ph * 5 + i) * 4 + ph * 8, -ph * 44, 5 + ph * 11, 0, TAU); ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  /* ================================================================ */
  /* CHAPTER 6 : HOUSTON  (asphalt #6A6862)                            */
  /* ================================================================ */
  const CAR_BODY = ['#6C6A66', '#76584A', '#566070', '#82796A', '#4F5A52', '#70625A'];

  sceneryRegister([6], {
    patches: [
      { fill: '#4A4A50', alpha: 0.2, count: 12, rMin: 220, rMax: 460, squash: 0.6 },    /* oil-stained asphalt */
      { fill: '#7C6E58', alpha: 0.14, count: 9, rMin: 200, rMax: 420, squash: 0.65 },   /* dust and dried mud */
      { fill: '#56626E', alpha: 0.14, count: 8, rMin: 220, rMax: 440, squash: 0.65 }    /* damp, cooler concrete */
    ],
    decals: [
      { id: 'ct_skid', count: 60, s: [0.8, 1.5], draw: function(ctx, d){
        if (onRoof(d)) return;
        ctx.strokeStyle = 'rgba(14,14,16,.36)'; ctx.lineWidth = 3; ctx.lineCap = 'round';
        const b = (scRnd(d.seed, 1) - 0.5) * 40;
        ctx.beginPath(); ctx.moveTo(-50, -4); ctx.quadraticCurveTo(0, -4 + b, 50, -4 + b * 1.6); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(-50, 5); ctx.quadraticCurveTo(0, 5 + b, 50, 5 + b * 1.6); ctx.stroke();
        ctx.lineCap = 'butt';
      } },
      { id: 'ct_crack', count: 90, s: [0.8, 1.6], draw: function(ctx, d){
        if (onRoof(d)) return;
        ctx.strokeStyle = 'rgba(18,18,20,.42)'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(-34, 0);
        let x = -34, y = 0;
        for (let k = 0; k < 6; k++){ x += 11 + scRnd(d.seed, k) * 4; y += (scRnd(d.seed, k + 9) - 0.5) * 16; ctx.lineTo(x, y); }
        ctx.moveTo(x - 24, y * 0.6); ctx.lineTo(x - 18, y * 0.6 - 14 - scRnd(d.seed, 20) * 8);
        ctx.stroke();
      } },
      { id: 'ct_oil', count: 40, s: [0.7, 1.4], draw: function(ctx, d){
        if (onRoof(d)) return;
        blob(ctx, 0, 0, 20, 12, 0.3, 'rgba(12,12,16,.3)');
        blob(ctx, 10, 5, 12, 7, -0.4, 'rgba(12,12,16,.26)');
        blob(ctx, -6, -3, 7, 4, 0.2, 'rgba(60,70,90,.2)');
      } },
      { id: 'ct_patch', count: 40, s: [0.9, 1.5], draw: function(ctx, d){
        if (onRoof(d)) return;
        ctx.fillStyle = 'rgba(50,50,54,.5)'; ctx.fillRect(-22, -13, 44, 26);
        ctx.strokeStyle = 'rgba(20,20,22,.4)'; ctx.lineWidth = 1.2; ctx.strokeRect(-22, -13, 44, 26);
      } },
      { id: 'ct_scorch', count: 26, s: [0.8, 1.5], draw: function(ctx, d){
        if (onRoof(d)) return;
        blob(ctx, 0, 0, 26, 19, 0.2, 'rgba(10,8,8,.3)');
        blob(ctx, 0, 0, 13, 9, 0.2, 'rgba(8,6,6,.34)');
        ctx.strokeStyle = 'rgba(10,8,8,.3)'; ctx.lineWidth = 2; ctx.beginPath();
        for (let k = 0; k < 5; k++){ const a = k * 1.26 + d.seed * 3; ctx.moveTo(Math.cos(a) * 20, Math.sin(a) * 15); ctx.lineTo(Math.cos(a) * 36, Math.sin(a) * 27); }
        ctx.stroke();
      } }
    ],
    props: [
      { id: 'ct_wreck', count: 34, r: 24, gap: 90, s: [0.9, 1.15], draw: function(ctx, p){
        const a = roadAngle(p, CITY_BLOCK), col = pick(CAR_BODY, p.seed, 1);
        scShadow(ctx, 23, 12, 0.26);
        ctx.rotate(a);
        ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.fillRect(-18, 7, 8, 4); ctx.fillRect(9, 7, 8, 4); ctx.fillRect(-18, -11, 8, 4); ctx.fillRect(9, -11, 8, 4);   /* wheels */
        ctx.fillStyle = col; ctx.fillRect(-20, -8.5, 40, 17);
        ctx.fillStyle = 'rgba(255,255,255,.1)'; ctx.fillRect(-20, -8.5, 40, 3.5);
        ctx.fillStyle = '#2A2E36'; ctx.fillRect(-7, -6.5, 15, 13);                       /* cabin glass, smashed */
        ctx.fillStyle = 'rgba(0,0,0,.2)'; ctx.fillRect(-4, -5, 9, 10);
        ctx.strokeStyle = 'rgba(190,200,210,.4)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(-6, -5); ctx.lineTo(2, 3); ctx.moveTo(4, -6); ctx.lineTo(0, 1); ctx.stroke();
        if (p.seed > 0.55){ ctx.fillStyle = 'rgba(40,36,34,.6)'; ctx.fillRect(8, -7, 11, 14); }       /* hood torn open */
        ctx.fillStyle = 'rgba(110,60,36,.4)'; ctx.fillRect(-19, -5, 6, 4);                 /* rust */
      } },
      { id: 'ct_burnt', count: 12, r: 26, gap: 120, s: [0.95, 1.15], draw: function(ctx, p){
        const a = roadAngle(p, CITY_BLOCK);
        blob(ctx, 0, 2, 34, 22, 0, 'rgba(14,12,12,.32)');
        ctx.rotate(a);
        ctx.fillStyle = '#34322F'; ctx.fillRect(-20, -8.5, 40, 17);
        ctx.fillStyle = '#242220'; ctx.fillRect(-8, -6.5, 17, 13);
        ctx.fillStyle = 'rgba(120,70,40,.3)'; ctx.fillRect(-19, -7, 12, 5); ctx.fillRect(10, 2, 9, 5);
        ctx.fillStyle = 'rgba(255,255,255,.07)'; ctx.fillRect(-20, -8.5, 40, 2.5);
        ctx.fillStyle = '#1A1918'; ctx.fillRect(-19, 7, 7, 3); ctx.fillRect(11, 7, 7, 3); ctx.fillRect(-19, -10, 7, 3); ctx.fillRect(11, -10, 7, 3);
      } },
      { id: 'ct_dumpster', count: 24, r: 20, gap: 60, s: [0.9, 1.1], rot: true, draw: function(ctx, p){
        const col = pick(['#4E5F4C', '#4A5662', '#5E5648'], p.seed, 2);
        scShadow(ctx, 20, 11, 0.26);
        ctx.fillStyle = col; ctx.fillRect(-17, -9, 34, 18);
        ctx.fillStyle = 'rgba(255,255,255,.14)'; ctx.fillRect(-17, -9, 34, 3);
        ctx.fillStyle = 'rgba(0,0,0,.18)'; ctx.fillRect(-17, 1, 34, 8);
        ctx.strokeStyle = 'rgba(0,0,0,.4)'; ctx.lineWidth = 1.2; ctx.strokeRect(-17, -9, 34, 18);
        ctx.beginPath(); ctx.moveTo(0, -9); ctx.lineTo(0, 9); ctx.stroke();
        ctx.fillStyle = 'rgba(210,205,190,.55)'; ctx.fillRect(7 + scRnd(p.seed, 5) * 5, -4, 4, 3);
      } },
      { id: 'ct_hydrant', count: 22, r: 8, gap: 50, s: [1, 1.3], draw: function(ctx){
        scShadow(ctx, 8, 5, 0.25);
        ctx.fillStyle = '#6A6A68'; ctx.beginPath(); ctx.arc(0, 0, 6.5, 0, TAU); ctx.fill();
        ctx.fillStyle = '#8A4640'; ctx.beginPath(); ctx.arc(0, 0, 5, 0, TAU); ctx.fill();
        ctx.fillStyle = '#A86058'; ctx.beginPath(); ctx.arc(-1.3, -1.3, 2.4, 0, TAU); ctx.fill();
        ctx.fillStyle = '#7A3C36'; ctx.fillRect(-9, -1.6, 18, 3.2);
      } },
      { id: 'ct_lamp', count: 26, r: 10, gap: 120, s: [1, 1.15], draw: function(ctx, p){
        const L = 20 + scRnd(p.seed, 2) * 6;
        ctx.strokeStyle = 'rgba(12,10,8,.26)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(22, 20); ctx.stroke();   /* long pole shadow */
        blob(ctx, 0, 0, 5.5, 5.5, 0, '#4C4C50');
        ctx.strokeStyle = '#7A7A7C'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-L * 0.55, -L * 0.32); ctx.stroke();
        blob(ctx, -L * 0.6, -L * 0.34, 6, 3.5, 0.5, '#A8A8A0');
        blob(ctx, -L * 0.6, -L * 0.34, 2.4, 1.4, 0.5, '#D8D4BC');
      } },
      { id: 'ct_barrier', count: 20, r: 28, gap: 90, s: [0.9, 1.15], rot: true, draw: function(ctx, p){
        if (p.seed < 0.5){                                                                   /* concrete jersey barriers */
          for (let k = -1; k <= 1; k++){
            ctx.fillStyle = 'rgba(0,0,0,.26)'; ctx.fillRect(k * 25 - 11, -3, 24, 10);
            ctx.fillStyle = '#8E8B83'; ctx.fillRect(k * 25 - 12, -5, 24, 9);
            ctx.fillStyle = 'rgba(255,255,255,.16)'; ctx.fillRect(k * 25 - 12, -5, 24, 2.5);
            ctx.fillStyle = 'rgba(150,100,60,.55)'; ctx.fillRect(k * 25 - 3, -4, 5, 7);
          }
        } else {                                                                              /* a sandbag wall */
          for (let k = 0; k < 7; k++){
            const x = -21 + (k % 4) * 14 + (k > 3 ? 7 : 0), y = k > 3 ? 4 : -4;
            blob(ctx, x + 1.5, y + 2.5, 8, 4.5, 0, 'rgba(0,0,0,.24)');
            blob(ctx, x, y, 8, 4.5, 0, k % 2 ? '#8A7C5E' : '#7C6F54');
            blob(ctx, x - 1.5, y - 1.4, 4, 1.6, 0, 'rgba(255,255,255,.14)');
          }
        }
      } },
      { id: 'ct_rubble', count: 26, r: 24, gap: 60, s: [0.8, 1.3], rot: true, draw: function(ctx, p){
        const cols = ['#7E7B74', '#6A6761', '#908C84', '#5C5A56'];
        blob(ctx, 0, 3, 28, 16, 0, 'rgba(60,56,50,.35)');
        for (let k = 0; k < 6; k++){
          const x = (scRnd(p.seed, k) - 0.5) * 34, y = (scRnd(p.seed, k + 7) - 0.5) * 18, s = 5 + scRnd(p.seed, k + 14) * 6, a = scRnd(p.seed, k + 21) * TAU;
          ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.fillRect(x - s * 0.5 + 2, y - s * 0.4 + 2, s, s * 0.8);
          ctx.fillStyle = cols[k % 4];
          poly(ctx, [x + Math.cos(a) * s, y + Math.sin(a) * s * 0.7, x + Math.cos(a + 1.7) * s, y + Math.sin(a + 1.7) * s * 0.7, x + Math.cos(a + 3.5) * s * 0.8, y + Math.sin(a + 3.5) * s * 0.6, x + Math.cos(a + 5) * s, y + Math.sin(a + 5) * s * 0.7]);
        }
        ctx.strokeStyle = 'rgba(110,70,50,.6)'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(-8, -4); ctx.lineTo(10, 3); ctx.stroke();   /* rebar */
      } },
      { id: 'ct_planter', count: 16, r: 18, gap: 70, s: [0.9, 1.1], draw: function(ctx, p){
        scShadow(ctx, 20, 12, 0.24);
        ctx.fillStyle = '#8A867C'; ctx.fillRect(-14, -10, 28, 20);
        ctx.fillStyle = 'rgba(255,255,255,.15)'; ctx.fillRect(-14, -10, 28, 3);
        ctx.fillStyle = '#4B3F30'; ctx.fillRect(-11, -7, 22, 14);
        const sw = scSway(G.time, p, 0.8);
        blob(ctx, sw * 0.5, -1, 11, 8, 0, '#46602E');
        blob(ctx, -3 + sw, -3, 6, 4.5, 0, '#587638');
      } }
    ],
    landmarks: [
      { id: 'ct_tower', count: 2, r: 80, gap: 900, s: [1, 1.15], draw: function(ctx, p){      /* a water tower on legs */
        ctx.fillStyle = 'rgba(10,8,6,.26)';
        poly(ctx, [-38, 10, 38, 10, 150, 78, 74, 78]);
        ctx.strokeStyle = '#4A4640'; ctx.lineWidth = 4;
        ctx.beginPath(); ctx.moveTo(-34, -8); ctx.lineTo(-44, 36); ctx.moveTo(34, -8); ctx.lineTo(44, 36); ctx.stroke();
        blob(ctx, -44, 38, 6, 4, 0, '#3A3834'); blob(ctx, 44, 38, 6, 4, 0, '#3A3834');
        ctx.fillStyle = '#6A5848'; ctx.beginPath(); ctx.ellipse(0, -14, 44, 40, 0, 0, TAU); ctx.fill();
        ctx.fillStyle = '#80705E'; ctx.beginPath(); ctx.ellipse(0, -18, 40, 35, 0, 0, TAU); ctx.fill();
        ctx.strokeStyle = '#5A4A3C'; ctx.lineWidth = 3;
        for (let k = 1; k <= 3; k++){ ctx.beginPath(); ctx.ellipse(0, -18, 40 * k / 3.4, 35 * k / 3.4, 0, 0, TAU); ctx.stroke(); }
        blob(ctx, -12, -30, 16, 9, -0.4, 'rgba(255,255,255,.1)');
        blob(ctx, 0, -18, 4, 4, 0, '#4A3C30');
      } },
      { id: 'ct_overpass', count: 1, r: 190, gap: 1000, s: [1, 1.1], rot: true, draw: function(ctx, p){   /* a collapsed overpass section */
        ctx.fillStyle = 'rgba(8,8,10,.28)'; ctx.fillRect(-170, -26, 190, 78);
        ctx.fillStyle = '#7C7A74'; ctx.fillRect(-180, -38, 200, 74);                    /* the standing deck */
        ctx.fillStyle = 'rgba(255,255,255,.1)'; ctx.fillRect(-180, -38, 200, 5);
        ctx.fillStyle = '#5E5C58'; ctx.fillRect(-180, -38, 200, 5); ctx.fillRect(-180, 31, 200, 5);   /* parapets */
        ctx.strokeStyle = 'rgba(190,170,90,.4)'; ctx.lineWidth = 2; ctx.setLineDash && ctx.setLineDash([14, 12]);
        ctx.beginPath(); ctx.moveTo(-180, -1); ctx.lineTo(20, -1); ctx.stroke(); ctx.setLineDash && ctx.setLineDash([]);
        ctx.fillStyle = '#6A6862'; poly(ctx, [20, -38, 38, -26, 28, -8, 44, 6, 26, 20, 34, 36, 20, 36]);   /* jagged break */
        ctx.fillStyle = '#6A6862'; poly(ctx, [20, -38, 34, -30, 24, -10, 40, 4, 20, 8]);
        ctx.fillStyle = '#5A5854'; poly(ctx, [30, -22, 150, -8, 160, 52, 44, 44]);                     /* the fallen slab, tilted */
        ctx.fillStyle = 'rgba(255,255,255,.08)'; poly(ctx, [30, -22, 150, -8, 148, -2, 32, -14]);
        ctx.strokeStyle = 'rgba(190,170,90,.3)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(40, 14); ctx.lineTo(156, 22); ctx.stroke();
        ctx.fillStyle = '#4A4844'; ctx.fillRect(-120, -48, 18, 12); ctx.fillRect(-120, 36, 18, 12); ctx.fillRect(-30, -48, 18, 12); ctx.fillRect(-30, 36, 18, 12);   /* pier caps */
        ctx.strokeStyle = 'rgba(120,76,52,.7)'; ctx.lineWidth = 1.5; ctx.beginPath();
        ctx.moveTo(26, -10); ctx.lineTo(54, -22); ctx.moveTo(30, 6); ctx.lineTo(60, 2); ctx.moveTo(24, 24); ctx.lineTo(50, 34); ctx.stroke();                 /* rebar */
        const cols = ['#7E7B74', '#6A6761', '#908C84'];
        for (let k = 0; k < 8; k++){ const x = 40 + scRnd(p.seed, k) * 130, y = 30 + scRnd(p.seed, k + 5) * 36, s = 6 + scRnd(p.seed, k + 11) * 6; ctx.fillStyle = cols[k % 3]; ctx.fillRect(x, y, s, s * 0.7); }
      } }
    ],
    terrain: [
      { id: 'ct_puddle', kind: 'slow', mul: 0.75, count: 5, rMin: 95, rMax: 150, squash: 0.62, hint: 'Oil slicks slow you and the creatures',
        draw: function(ctx, z){
          const rx = z.rx, ry = z.ry, k = z.seed;
          ctx.fillStyle = 'rgba(14,14,18,.28)'; ctx.beginPath(); ctx.ellipse(0, 0, rx * 1.04, ry * 1.06, 0, 0, TAU); ctx.fill();
          ctx.globalAlpha = 0.8; ctx.fillStyle = '#2C2E36'; ctx.beginPath(); ctx.ellipse(0, 0, rx * 0.97, ry * 0.95, 0, 0, TAU); ctx.fill();
          blob(ctx, rx * (k - 0.5) * 0.3, ry * 0.1, rx * 0.8, ry * 0.8, 0.2, '#343740'); ctx.globalAlpha = 1;
          ctx.lineWidth = 2.2; ctx.strokeStyle = 'rgba(70,200,190,.38)';                 /* rainbow oil sheen along the edge */
          ctx.beginPath(); ctx.ellipse(0, 0, rx * 0.86, ry * 0.84, 0, 3.7, 5.3); ctx.stroke();
          ctx.strokeStyle = 'rgba(200,90,170,.34)';
          ctx.beginPath(); ctx.ellipse(0, 0, rx * 0.8, ry * 0.78, 0, 3.9, 5.1); ctx.stroke();
          ctx.strokeStyle = 'rgba(220,180,80,.3)';
          ctx.beginPath(); ctx.ellipse(0, 0, rx * 0.74, ry * 0.72, 0, 0.5, 1.9); ctx.stroke();
          ctx.strokeStyle = 'rgba(70,140,230,.3)';
          ctx.beginPath(); ctx.ellipse(0, 0, rx * 0.68, ry * 0.66, 0, 0.7, 1.7); ctx.stroke();
          ctx.lineWidth = 1.6; ctx.strokeStyle = 'rgba(160,180,195,.4)';                   /* wet rim: reads as a puddle at a glance */
          ctx.beginPath(); ctx.ellipse(0, 0, rx, ry, 0, 0, TAU); ctx.stroke();
          blob(ctx, -rx * 0.3, -ry * 0.38, rx * 0.26, ry * 0.12, -0.3, 'rgba(180,205,225,.22)');
        } }
    ],
    ambient: [
      { id: 'ct_pigeon', count: 9, layer: 'over', init: birdInit, update: birdUpdate,
        draw: function(ctx, a){ drawBird(ctx, a, '#8A8E96', '#6E727A', 0.9); } },
      { id: 'ct_trash', count: 10, layer: 'under',
        init: function(a){ a.vx = 22 + Math.random() * 28; a.vy = (Math.random() - 0.5) * 14; },
        update: function(a, dt, t){ a.x += a.vx * dt; a.y += (a.vy + Math.sin(t * 0.8 + a.ph) * 12) * dt; },
        draw: function(ctx, a, t){
          const r = t * 2 + a.ph, sy = 0.4 + 0.6 * Math.abs(Math.sin(t * 3 + a.ph));
          ctx.rotate(r); ctx.scale(1, sy);
          ctx.fillStyle = a.seed > 0.5 ? 'rgba(200,198,188,.7)' : 'rgba(120,128,138,.6)';
          ctx.fillRect(-4, -3, 8, 6);
        } },
      { id: 'ct_steam', count: 8, layer: 'under',
        init: function(a){ a.vx = 0; a.vy = 0; a.x = Math.min(ARENA_W - 40, Math.max(40, Math.round(a.x / CITY_BLOCK) * CITY_BLOCK + (a.seed - 0.5) * 70)); },
        draw: function(ctx, a, t){ drawSteam(ctx, a, t, '#55555A'); } }
    ]
  });

  /* ================================================================ */
  /* CHAPTER 7 : JOHNSON SPACE CENTER  (lawn #5F7F3C)                  */
  /* ================================================================ */
  sceneryRegister([7], {
    patches: [
      { fill: '#4A6C30', alpha: 0.2, count: 14, rMin: 200, rMax: 420, squash: 0.6 },     /* lush, watered turf */
      { fill: '#7E9854', alpha: 0.16, count: 12, rMin: 200, rMax: 420, squash: 0.65 },   /* sun-bleached turf */
      { fill: '#8A9458', alpha: 0.12, count: 8, rMin: 160, rMax: 340, squash: 0.65 }     /* dry straw patches */
    ],
    decals: [
      { id: 'sc_tracks', count: 50, s: [0.8, 1.5], draw: function(ctx, d){
        if (onRoof(d)) return;
        ctx.strokeStyle = 'rgba(40,46,24,.32)'; ctx.lineWidth = 3;
        const b = (scRnd(d.seed, 1) - 0.5) * 24;
        ctx.beginPath(); ctx.moveTo(-60, -5); ctx.quadraticCurveTo(0, -5 + b, 60, -5 + b * 1.5);
        ctx.moveTo(-60, 5); ctx.quadraticCurveTo(0, 5 + b, 60, 5 + b * 1.5); ctx.stroke();
      } },
      { id: 'sc_scorch', count: 22, s: [0.8, 1.5], draw: function(ctx, d){
        if (onRoof(d)) return;
        blob(ctx, 0, 0, 28, 20, 0.3, 'rgba(26,28,18,.3)');
        blob(ctx, 2, 1, 14, 10, 0.3, 'rgba(18,18,12,.34)');
        ctx.strokeStyle = 'rgba(20,22,14,.28)'; ctx.lineWidth = 2; ctx.beginPath();
        for (let k = 0; k < 6; k++){ const a = k * 1.05 + d.seed * 3; ctx.moveTo(Math.cos(a) * 20, Math.sin(a) * 14); ctx.lineTo(Math.cos(a) * 38, Math.sin(a) * 27); }
        ctx.stroke();
      } },
      { id: 'sc_worn', count: 40, s: [0.8, 1.6], draw: function(ctx, d){
        if (onRoof(d)) return;
        blob(ctx, 0, 0, 38, 11, 0.1, 'rgba(160,150,100,.22)');
        blob(ctx, 8, 1, 22, 6, 0.1, 'rgba(176,164,112,.2)');
      } },
      { id: 'sc_cable', count: 30, s: [0.9, 1.6], draw: function(ctx, d){
        if (onRoof(d)) return;
        ctx.fillStyle = 'rgba(40,44,40,.45)'; ctx.fillRect(-46, -3.5, 92, 7);
        ctx.fillStyle = 'rgba(190,190,180,.18)'; ctx.fillRect(-46, -3.5, 92, 1.6);
        ctx.fillStyle = 'rgba(20,22,20,.4)'; for (let k = -40; k <= 40; k += 16) ctx.fillRect(k, -3.5, 2, 7);
      } },
      { id: 'sc_survey', count: 36, s: [0.9, 1.3], draw: function(ctx, d){
        if (onRoof(d)) return;
        ctx.strokeStyle = 'rgba(232,232,220,.5)'; ctx.lineWidth = 2; ctx.beginPath();
        ctx.moveTo(-6, -6); ctx.lineTo(6, 6); ctx.moveTo(6, -6); ctx.lineTo(-6, 6); ctx.stroke();
      } }
    ],
    props: [
      { id: 'sc_solar', count: 20, r: 34, gap: 90, s: [0.9, 1.15], draw: function(ctx, p){      /* free-standing solar rack */
        ctx.fillStyle = 'rgba(8,16,6,.26)'; ctx.fillRect(-28, -10, 60, 34);
        for (let r = 0; r < 2; r++) for (let c = 0; c < 3; c++){
          const x = -29 + c * 20, y = -16 + r * 18;
          ctx.fillStyle = '#2E3C52'; ctx.fillRect(x, y, 19, 16);
          ctx.fillStyle = 'rgba(160,185,220,.28)'; ctx.fillRect(x + 1, y + 1, 17, 3);
          ctx.strokeStyle = 'rgba(160,185,220,.3)'; ctx.lineWidth = 0.8;
          ctx.beginPath(); ctx.moveTo(x + 9.5, y); ctx.lineTo(x + 9.5, y + 16); ctx.moveTo(x, y + 8); ctx.lineTo(x + 19, y + 8); ctx.stroke();
        }
      } },
      { id: 'sc_tank', count: 16, r: 26, gap: 80, s: [0.9, 1.2], rot: true, draw: function(ctx, p){      /* propellant tank on cradles */
        scShadow(ctx, 30, 15, 0.26);
        ctx.fillStyle = '#6A6E6C'; ctx.fillRect(-13, -12, 5, 24); ctx.fillRect(8, -12, 5, 24);
        ctx.fillStyle = '#B2B7B4'; ctx.beginPath(); ctx.ellipse(0, 0, 25, 11, 0, 0, TAU); ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,.28)'; ctx.beginPath(); ctx.ellipse(-2, -4, 20, 3.5, 0, 0, TAU); ctx.fill();
        ctx.strokeStyle = '#7E8486'; ctx.lineWidth = 2; ctx.beginPath();
        ctx.moveTo(-12, -10); ctx.lineTo(-12, 10); ctx.moveTo(0, -11); ctx.lineTo(0, 11); ctx.moveTo(12, -10); ctx.lineTo(12, 10); ctx.stroke();
        ctx.fillStyle = scRnd(p.seed, 1) > 0.5 ? '#6E4640' : '#3E5A6E'; ctx.fillRect(-4, -3, 8, 6);
      } },
      { id: 'sc_spool', count: 20, r: 15, gap: 50, s: [0.9, 1.2], draw: function(ctx, p){      /* cable spool */
        scShadow(ctx, 15, 9, 0.25);
        blob(ctx, 0, 0, 13, 13, 0, '#6E5A40');
        blob(ctx, 0, 0, 9.5, 9.5, 0, '#2C3A32');
        ctx.strokeStyle = '#3E5042'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(0, 0, 6.5, 0, TAU); ctx.stroke();
        blob(ctx, 0, 0, 2.6, 2.6, 0, '#4A3E2C');
        ctx.strokeStyle = 'rgba(44,58,50,.8)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(8, 6); ctx.quadraticCurveTo(20, 14 + scRnd(p.seed, 2) * 8, 30, 8); ctx.stroke();
      } },
      { id: 'sc_crates', count: 24, r: 20, gap: 60, s: [0.9, 1.15], rot: true, draw: function(ctx, p){
        scShadow(ctx, 22, 12, 0.24);
        ctx.fillStyle = '#6E705A'; ctx.fillRect(-16, -10, 20, 18);
        ctx.fillStyle = 'rgba(255,255,255,.14)'; ctx.fillRect(-16, -10, 20, 3);
        ctx.strokeStyle = 'rgba(30,34,24,.5)'; ctx.lineWidth = 1.2; ctx.strokeRect(-16, -10, 20, 18);
        ctx.beginPath(); ctx.moveTo(-16, -10); ctx.lineTo(4, 8); ctx.stroke();
        ctx.fillStyle = '#5E6450'; ctx.fillRect(6, -2, 14, 13);
        ctx.fillStyle = 'rgba(255,255,255,.12)'; ctx.fillRect(6, -2, 14, 3);
        ctx.strokeRect(6, -2, 14, 13);
        if (p.seed > 0.5){ ctx.fillStyle = '#7A7C64'; ctx.fillRect(-9, -18, 14, 9); ctx.strokeRect(-9, -18, 14, 9); }
      } },
      { id: 'sc_barrier', count: 20, r: 26, gap: 80, s: [0.9, 1.15], rot: true, draw: function(ctx){      /* hazard-stripe barrier */
        ctx.fillStyle = 'rgba(0,0,0,.24)'; ctx.fillRect(-22, -2, 46, 9);
        ctx.fillStyle = '#2E2E2C'; ctx.fillRect(-23, -5, 46, 8);
        ctx.fillStyle = '#A8A066';
        for (let k = -20; k < 20; k += 9){ ctx.beginPath(); ctx.moveTo(k, -5); ctx.lineTo(k + 4.5, -5); ctx.lineTo(k + 1.5, 3); ctx.lineTo(k - 3, 3); ctx.closePath(); ctx.fill(); }
        ctx.fillStyle = '#4A4A48'; ctx.fillRect(-20, 3, 4, 6); ctx.fillRect(16, 3, 4, 6);
      } },
      { id: 'sc_flood', count: 18, r: 12, gap: 110, s: [1, 1.15], draw: function(ctx, p){      /* floodlight mast */
        ctx.strokeStyle = 'rgba(10,14,6,.26)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(26, 20); ctx.stroke();
        blob(ctx, 0, 0, 5, 5, 0, '#4A4E52');
        ctx.fillStyle = '#6A6E72'; ctx.fillRect(-2, -14, 4, 14);
        ctx.fillStyle = '#8C9096'; ctx.fillRect(-11, -24, 22, 9);
        ctx.fillStyle = '#D8DCCE'; ctx.fillRect(-9, -22, 5, 5); ctx.fillRect(-2.5, -22, 5, 5); ctx.fillRect(4, -22, 5, 5);
      } },
      { id: 'sc_dish', count: 16, r: 18, gap: 80, s: [0.9, 1.2], draw: function(ctx, p){      /* small ground antenna */
        ctx.fillStyle = 'rgba(8,12,6,.28)'; ctx.beginPath(); ctx.ellipse(6, 7, 14, 11, 0, 0, TAU); ctx.fill();
        blob(ctx, 0, 0, 12, 10, 0.3, '#C4C8CC');
        blob(ctx, -1, -1, 9, 7, 0.3, '#D6D9DC');
        ctx.strokeStyle = '#8E949C'; ctx.lineWidth = 1; ctx.beginPath(); ctx.ellipse(-1, -1, 5, 4, 0.3, 0, TAU); ctx.stroke();
        ctx.strokeStyle = '#6A7078'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(-1, -1); ctx.lineTo(-9, -9); ctx.stroke();
        blob(ctx, -9, -9, 2, 2, 0, '#555B64');
      } },
      { id: 'sc_sprinkler', count: 30, r: 8, gap: 40, s: [0.9, 1.1], draw: function(ctx, p){
        blob(ctx, 0, 0, 19, 14, 0, 'rgba(30,50,20,.16)');
        blob(ctx, 0, 0, 3.2, 3.2, 0, '#4A4E52');
        blob(ctx, -0.6, -0.6, 1.4, 1.4, 0, '#8A9096');
        ctx.strokeStyle = 'rgba(210,225,235,.28)'; ctx.lineWidth = 1; ctx.beginPath();
        for (let k = 0; k < 4; k++){ const a = k * 1.57 + p.seed; ctx.moveTo(Math.cos(a) * 5, Math.sin(a) * 4); ctx.lineTo(Math.cos(a) * 14, Math.sin(a) * 11); }
        ctx.stroke();
      } }
    ],
    landmarks: [
      { id: 'sc_gantry', count: 2, r: 70, gap: 900, s: [1, 1.1], draw: function(ctx, p){      /* a steel gantry tower seen from above */
        ctx.fillStyle = 'rgba(0,0,0,.26)';
        poly(ctx, [-20, 0, 20, 0, 190, 100, 150, 100]);
        ctx.fillStyle = '#5A5F68'; ctx.fillRect(-34, -34, 68, 68);
        ctx.fillStyle = '#8A909A'; ctx.fillRect(-30, -30, 60, 60);
        ctx.fillStyle = '#4A4E56'; ctx.fillRect(-20, -20, 40, 40);
        ctx.fillStyle = '#767C86'; ctx.fillRect(-16, -16, 32, 32);
        ctx.strokeStyle = '#5A5F68'; ctx.lineWidth = 2.2; ctx.beginPath();
        ctx.moveTo(-30, -30); ctx.lineTo(30, 30); ctx.moveTo(30, -30); ctx.lineTo(-30, 30);
        ctx.moveTo(-30, 0); ctx.lineTo(30, 0); ctx.moveTo(0, -30); ctx.lineTo(0, 30); ctx.stroke();
        ctx.strokeStyle = 'rgba(255,255,255,.18)'; ctx.lineWidth = 1.5; ctx.strokeRect(-30, -30, 60, 60);
        blob(ctx, 0, 0, 7, 7, 0, '#C4C8CE');
        blob(ctx, 0, 0, 3, 3, 0, '#B04A40');
        ctx.fillStyle = '#3E4248'; ctx.fillRect(-38, -38, 8, 8); ctx.fillRect(30, -38, 8, 8); ctx.fillRect(-38, 30, 8, 8); ctx.fillRect(30, 30, 8, 8);
      } },
      { id: 'sc_radar', count: 2, r: 100, gap: 900, s: [1, 1.15], draw: function(ctx, p){        /* a big radar dish */
        ctx.fillStyle = 'rgba(0,0,0,.24)'; ctx.beginPath(); ctx.ellipse(18, 22, 82, 66, 0, 0, TAU); ctx.fill();
        ctx.fillStyle = '#6A7078'; ctx.fillRect(-14, -14, 28, 28);
        blob(ctx, 0, 0, 78, 64, 0, '#BEC2C6');
        blob(ctx, -3, -3, 70, 57, 0, '#CDD0D3');
        ctx.strokeStyle = '#9CA2AA'; ctx.lineWidth = 2;
        for (let k = 1; k <= 3; k++){ ctx.beginPath(); ctx.ellipse(-3, -3, 70 * k / 3.4, 57 * k / 3.4, 0, 0, TAU); ctx.stroke(); }
        ctx.beginPath();
        for (let k = 0; k < 8; k++){ const a = k * 0.785; ctx.moveTo(-3 + Math.cos(a) * 12, -3 + Math.sin(a) * 10); ctx.lineTo(-3 + Math.cos(a) * 70, -3 + Math.sin(a) * 57); }
        ctx.stroke();
        ctx.strokeStyle = '#5A6068'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(-3, -3); ctx.lineTo(-52, -44); ctx.stroke();
        blob(ctx, -52, -44, 6, 6, 0, '#4A5058');
        blob(ctx, -3, -3, 9, 9, 0, '#7A8088');
      } }
    ],
    terrain: [
      { id: 'sc_mud', kind: 'slow', mul: 0.72, count: 5, rMin: 90, rMax: 130, squash: 0.65, hint: 'Sprinkler mud slows you and the creatures',
        draw: function(ctx, z){
          const rx = z.rx, ry = z.ry;
          ctx.fillStyle = 'rgba(24,20,10,.4)'; ctx.beginPath(); ctx.ellipse(0, 0, rx * 1.05, ry * 1.06, 0, 0, TAU); ctx.fill();
          ctx.fillStyle = '#5C4F30'; ctx.beginPath(); ctx.ellipse(0, 0, rx, ry, 0, 0, TAU); ctx.fill();
          blob(ctx, rx * 0.15, ry * 0.1, rx * 0.78, ry * 0.76, 0.2, '#4A4028');
          blob(ctx, -rx * 0.35, -ry * 0.2, rx * 0.28, ry * 0.2, 0.3, 'rgba(120,150,150,.35)');         /* standing water */
          blob(ctx, rx * 0.3, ry * 0.3, rx * 0.2, ry * 0.14, -0.2, 'rgba(120,150,150,.3)');
          ctx.strokeStyle = 'rgba(180,210,215,.38)'; ctx.lineWidth = 1.4; ctx.beginPath();
          ctx.ellipse(-rx * 0.35, -ry * 0.2, rx * 0.12, ry * 0.08, 0, 0, TAU);
          ctx.moveTo(rx * 0.3 + rx * 0.08, ry * 0.3); ctx.ellipse(rx * 0.3, ry * 0.3, rx * 0.08, ry * 0.055, 0, 0, TAU); ctx.stroke();
          ctx.strokeStyle = 'rgba(30,24,12,.6)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(0, 0, rx, ry, 0, 0, TAU); ctx.stroke();
        } },
      { id: 'sc_gravel', kind: 'slow', mul: 0.8, count: 3, rMin: 90, rMax: 135, squash: 0.65, hint: 'Loose gravel slows you down',
        draw: function(ctx, z){
          const rx = z.rx, ry = z.ry;
          ctx.fillStyle = '#7E7C72'; ctx.beginPath(); ctx.ellipse(0, 0, rx, ry, 0, 0, TAU); ctx.fill();
          ctx.strokeStyle = 'rgba(240,238,225,.4)'; ctx.lineWidth = 2; ctx.stroke();
          for (let k = 0; k < 16; k++){
            const a = scRnd(z.seed, k) * TAU, d = Math.sqrt(scRnd(z.seed, k + 20)) * 0.88;
            ctx.fillStyle = k % 3 === 0 ? '#B2B0A6' : (k % 3 === 1 ? '#6A685F' : '#9E9C92');
            ctx.fillRect(Math.cos(a) * rx * d - 2, Math.sin(a) * ry * d - 1.6, 4 + (k % 2), 3);
          }
        } }
    ],
    ambient: [
      { id: 'sc_bird', count: 10, layer: 'over', init: birdInit, update: birdUpdate,
        draw: function(ctx, a){ drawBird(ctx, a, '#46505A', '#38424C', 0.95); } },
      { id: 'sc_seed', count: 14, layer: 'under',
        init: function(a){ a.vx = 18 + Math.random() * 26; a.vy = (Math.random() - 0.5) * 10; },
        update: function(a, dt, t){ a.x += a.vx * dt; a.y += (a.vy + Math.sin(t * 1.1 + a.ph) * 10) * dt; },
        draw: function(ctx, a, t){
          const r = Math.sin(t * 1.5 + a.ph) * 1.2;
          ctx.rotate(r);
          ctx.fillStyle = 'rgba(236,240,224,.65)'; ctx.beginPath(); ctx.arc(0, 0, 1.7, 0, TAU); ctx.fill();
          ctx.strokeStyle = 'rgba(236,240,224,.45)'; ctx.lineWidth = 0.9; ctx.beginPath(); ctx.moveTo(-5, 0); ctx.lineTo(5, 0); ctx.moveTo(-3, -3); ctx.lineTo(3, 3); ctx.stroke();
        } },
      { id: 'sc_steam', count: 7, layer: 'under',
        init: function(a){ a.vx = 0; a.vy = 0; a.x = Math.min(ARENA_W - 40, Math.max(40, Math.round(a.x / SPACE_CELL) * SPACE_CELL + (a.seed < 0.5 ? -62 : 62))); },
        draw: function(ctx, a, t){ drawSteam(ctx, a, t, '#6E727A'); } }
    ]
  });
})();

