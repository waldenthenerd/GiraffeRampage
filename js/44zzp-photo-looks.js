'use strict';
/* =============================================================================================================================
   44zzp-photo-looks.js  --  THE PHOTO STUDIO'S LOOK AND LIGHT. A new "Look and light" tab (PHOTO.tab 'look') in the studio of 44n, and twelve
   stickers in the Effects tab. All of it is part of the picture: it is saved with it, in the album and in a shared photo code (44p, code version 5;
   a photo that uses none of these keeps its old version 4 code).
     FILTERS   Sepia (warm brown, faded, with a vignette), Noir (black and white, hard contrast, grain, a heavy vignette), Glitch (the colours split
               apart, slices of the picture slip sideways, scan lines) and Painterly (the picture broken into flat colours with brush strokes on top).
               They are made from a fixed seed, so the same photo always glitches and paints the same way.
     FRAMES    Wooden, Polaroid, Film strip, Savanna leaves, Frost, Neon and Stars. The frame is drawn after the filter, so it stays in colour.
     TIME OF DAY  a slider for the hour (every half hour). It tints and darkens the backdrop and the figures, adds stars and a moon at night and a glow
               on the horizon at dawn and dusk, and moves the light the shadows come from. "The backdrop's own light" puts it back. The indoor Studio
               backdrop has no sky, so it has no hour.
     FREEZE    every creature in the picture can be frozen in a block of ice, to hold a pose for the shot.
   photoRender is wrapped (this file loads after 44n, 44o and 44p, so it is the outermost): the picture is drawn as before onto a spare canvas, then
   graded, filtered and framed onto the real one. Selection rings are drawn last, so they are never filtered.
   ============================================================================================================================= */
const PHOTO_FILTERS = ['None', 'Sepia', 'Noir', 'Glitch', 'Painterly'];
const PHOTO_FRAMES = ['None', 'Wooden', 'Polaroid', 'Film strip', 'Savanna leaves', 'Frost', 'Neon', 'Stars'];
(function(){
  /* ---------------------------------------------------- stickers ---------------------------------------------------- */
  const add = function(id, name, fn){ if (!PHOTO_FXDRAW[id]){ PHOTO_FX.push([id, name]); PHOTO_FXDRAW[id] = fn; } };
  const txt = function(c, s, x, y, size, fill, stroke){ c.font = 'bold ' + size + 'px system-ui, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; if (stroke){ c.lineWidth = size * 0.18; c.strokeStyle = stroke; c.lineJoin = 'round'; c.strokeText(s, x, y); } c.fillStyle = fill; c.fillText(s, x, y); c.textBaseline = 'alphabetic'; };
  const burst = function(c, n, ro, ri){ c.beginPath(); for (let i = 0; i < n * 2; i++){ const a = i * Math.PI / n - Math.PI / 2, r = i % 2 ? ri : ro; c.lineTo(Math.cos(a) * r, Math.sin(a) * r); } c.closePath(); };
  add('st_wow', 'WOW!', function(c){ burst(c, 11, 62, 44); c.fillStyle = '#FFD84D'; c.fill(); c.lineWidth = 4; c.strokeStyle = '#E8662A'; c.stroke(); txt(c, 'WOW!', 0, 2, 30, '#D5352B', '#FFF6D8'); });
  add('st_hi', 'Speech bubble', function(c){ c.fillStyle = '#FFFFFF'; c.strokeStyle = '#2B3040'; c.lineWidth = 4; c.beginPath(); c.roundRect(-58, -34, 116, 62, 26); c.fill(); c.stroke(); c.beginPath(); c.moveTo(-18, 26); c.lineTo(-30, 52); c.lineTo(4, 28); c.closePath(); c.fill(); c.stroke(); c.fillStyle = '#FFFFFF'; c.fillRect(-26, 24, 28, 6); txt(c, 'Hi!', 0, -2, 34, '#2B3040'); });
  add('st_crown', 'Crown', function(c){ c.fillStyle = '#F2C230'; c.strokeStyle = '#B8860B'; c.lineWidth = 3; c.beginPath(); c.moveTo(-44, 26); c.lineTo(-50, -26); c.lineTo(-24, -2); c.lineTo(0, -34); c.lineTo(24, -2); c.lineTo(50, -26); c.lineTo(44, 26); c.closePath(); c.fill(); c.stroke(); c.fillStyle = '#B8860B'; c.fillRect(-44, 18, 88, 8); [[-50, -26, '#D5352B'], [0, -34, '#4D9AE8'], [50, -26, '#D5352B']].forEach(function(g){ c.fillStyle = g[2]; c.beginPath(); c.arc(g[0], g[1], 6, 0, TAU); c.fill(); }); [-26, 0, 26].forEach(function(x){ c.fillStyle = '#FFF6D8'; c.beginPath(); c.arc(x, 12, 4, 0, TAU); c.fill(); }); });
  add('st_shades', 'Sunglasses', function(c){ c.fillStyle = '#12141C'; c.strokeStyle = '#12141C'; c.lineWidth = 5; c.beginPath(); c.roundRect(-58, -16, 50, 34, 10); c.roundRect(8, -16, 50, 34, 10); c.fill(); c.beginPath(); c.moveTo(-8, -6); c.quadraticCurveTo(0, -14, 8, -6); c.stroke(); c.beginPath(); c.moveTo(-58, -8); c.lineTo(-72, -14); c.moveTo(58, -8); c.lineTo(72, -14); c.stroke(); c.fillStyle = 'rgba(255,255,255,.32)'; c.beginPath(); c.moveTo(-50, -10); c.lineTo(-30, -10); c.lineTo(-44, 8); c.lineTo(-52, 8); c.closePath(); c.fill(); c.beginPath(); c.moveTo(16, -10); c.lineTo(36, -10); c.lineTo(22, 8); c.lineTo(14, 8); c.closePath(); c.fill(); });
  add('st_stache', 'Moustache', function(c){ c.fillStyle = '#3A2410'; c.beginPath(); c.moveTo(0, -8); c.bezierCurveTo(-16, -22, -44, -20, -62, 4); c.bezierCurveTo(-48, 0, -30, 2, -18, 12); c.bezierCurveTo(-8, 16, -2, 8, 0, 4); c.bezierCurveTo(2, 8, 8, 16, 18, 12); c.bezierCurveTo(30, 2, 48, 0, 62, 4); c.bezierCurveTo(44, -20, 16, -22, 0, -8); c.closePath(); c.fill(); c.strokeStyle = 'rgba(255,255,255,.18)'; c.lineWidth = 2; c.beginPath(); c.moveTo(-8, -4); c.quadraticCurveTo(-30, -8, -50, 2); c.stroke(); });
  add('st_love', 'Love', function(c){ c.fillStyle = '#E8456A'; c.strokeStyle = '#8A1F3A'; c.lineWidth = 4; c.beginPath(); c.moveTo(0, 38); c.bezierCurveTo(-72, -4, -38, -58, 0, -22); c.bezierCurveTo(38, -58, 72, -4, 0, 38); c.fill(); c.stroke(); c.fillStyle = 'rgba(255,255,255,.35)'; c.beginPath(); c.ellipse(-24, -22, 12, 7, -0.6, 0, TAU); c.fill(); txt(c, 'LOVE', 0, -2, 20, '#FFFFFF', '#8A1F3A'); });
  add('st_best', 'Best rosette', function(c){ c.fillStyle = '#4D9AE8'; c.beginPath(); c.moveTo(-26, 20); c.lineTo(-40, 66); c.lineTo(-18, 54); c.lineTo(-6, 70); c.lineTo(8, 24); c.closePath(); c.fill(); c.beginPath(); c.moveTo(26, 20); c.lineTo(40, 66); c.lineTo(18, 54); c.lineTo(6, 70); c.lineTo(-8, 24); c.closePath(); c.fill(); burst(c, 16, 52, 44); c.fillStyle = '#F2C230'; c.fill(); c.lineWidth = 3; c.strokeStyle = '#B8860B'; c.stroke(); c.beginPath(); c.arc(0, 0, 33, 0, TAU); c.fillStyle = '#FFE27A'; c.fill(); txt(c, 'BEST', 0, 1, 22, '#8A5A0B'); });
  add('st_new', 'NEW! ribbon', function(c){ c.fillStyle = '#D5352B'; c.beginPath(); c.moveTo(-70, -22); c.lineTo(70, -22); c.lineTo(58, 0); c.lineTo(70, 22); c.lineTo(-70, 22); c.lineTo(-58, 0); c.closePath(); c.fill(); c.fillStyle = 'rgba(0,0,0,.2)'; c.fillRect(-70, 14, 140, 8); c.strokeStyle = '#FFF6D8'; c.lineWidth = 2; c.setLineDash([6, 4]); c.beginPath(); c.moveTo(-58, -16); c.lineTo(58, -16); c.moveTo(-58, 16); c.lineTo(58, 16); c.stroke(); c.setLineDash([]); txt(c, 'NEW!', 0, 1, 26, '#FFFFFF'); });
  add('st_camera', 'Camera', function(c){ c.fillStyle = '#2B3040'; c.beginPath(); c.roundRect(-52, -26, 104, 70, 10); c.fill(); c.fillRect(-20, -38, 40, 16); c.fillStyle = '#C9CDD9'; c.beginPath(); c.arc(0, 8, 26, 0, TAU); c.fill(); c.fillStyle = '#3A8AC8'; c.beginPath(); c.arc(0, 8, 19, 0, TAU); c.fill(); c.fillStyle = 'rgba(255,255,255,.5)'; c.beginPath(); c.ellipse(-7, 1, 7, 4, -0.7, 0, TAU); c.fill(); c.fillStyle = '#FFD84D'; c.fillRect(34, -20, 12, 8); c.fillStyle = '#D5352B'; c.beginPath(); c.arc(-38, -14, 4, 0, TAU); c.fill(); });
  add('st_cool', 'COOL', function(c){ c.fillStyle = '#6A4AC8'; c.beginPath(); c.roundRect(-58, -28, 116, 56, 14); c.fill(); c.strokeStyle = '#FFE27A'; c.lineWidth = 4; c.stroke(); txt(c, 'COOL', 0, 2, 36, '#FFE27A', '#2A1A6A'); [[-50, -24], [50, 22]].forEach(function(s){ c.fillStyle = '#FFFFFF'; c.beginPath(); c.arc(s[0], s[1], 5, 0, TAU); c.fill(); }); });
  add('st_zzz', 'Zzz', function(c){ [[-30, 24, 30], [0, -2, 40], [32, -34, 54]].forEach(function(z){ txt(c, 'Z', z[0], z[1], z[2], '#FFFFFF', '#4D6AA8'); }); });
  add('st_arrow', 'Arrow', function(c){ c.strokeStyle = '#D5352B'; c.lineWidth = 9; c.lineCap = 'round'; c.beginPath(); c.moveTo(-56, 34); c.bezierCurveTo(-60, -30, 10, -48, 44, -10); c.stroke(); c.fillStyle = '#D5352B'; c.beginPath(); c.moveTo(62, 0); c.lineTo(30, -6); c.lineTo(48, -34); c.closePath(); c.fill(); });
  add('st_sparkstar', 'Gold star', function(c){ burst(c, 5, 56, 24); c.fillStyle = '#FFD84D'; c.fill(); c.lineWidth = 4; c.strokeStyle = '#E8A020'; c.lineJoin = 'round'; c.stroke(); c.fillStyle = 'rgba(255,255,255,.55)'; c.beginPath(); c.moveTo(-10, -30); c.lineTo(0, -48); c.lineTo(6, -28); c.closePath(); c.fill(); });

  /* ---------------------------------------------------- time of day ---------------------------------------------------- */
  /* [hour, multiply colour, night strength]; the day runs round (the first row repeats at 24) */
  const TOD = [[0, [66, 78, 138], 1], [4.5, [78, 88, 150], 0.9], [5.5, [255, 176, 150], 0.35], [7, [255, 226, 204], 0.05], [9, [255, 252, 245], 0], [15.5, [255, 250, 238], 0], [17.5, [255, 214, 160], 0], [19, [255, 150, 120], 0.2], [20.5, [150, 110, 160], 0.65], [22, [80, 88, 150], 0.95], [24, [66, 78, 138], 1]];
  function todAt(h){
    for (let i = 0; i < TOD.length - 1; i++){
      const a = TOD[i], b = TOD[i + 1]; if (h >= a[0] && h <= b[0]){
        const t = (h - a[0]) / (b[0] - a[0]), s = t * t * (3 - 2 * t);
        return { m: [a[1][0] + (b[1][0] - a[1][0]) * s, a[1][1] + (b[1][1] - a[1][1]) * s, a[1][2] + (b[1][2] - a[1][2]) * s], night: a[2] + (b[2] - a[2]) * s };
      }
    }
    return { m: [255, 255, 255], night: 0 };
  }
  const hourOf = function(){ return PHOTO.tod >= 0 ? PHOTO.tod / 2 : null; };
  const hasSky = function(){ return PHOTO.bg !== 4; };                           /* the Studio backdrop is indoors */
  /* where the light comes from, as the fractions PHOTO_SUN uses (x across, y down: a bigger y is a lower sun) */
  function sunFrac(h){
    if (h >= 6 && h <= 19){ const t = (h - 6) / 13; return [0.1 + 0.8 * t, 0.62 - Math.sin(Math.PI * t) * 0.5]; }
    const t = ((h < 6 ? h + 24 : h) - 19) / 11; return [0.12 + 0.76 * t, 0.5 - Math.sin(Math.PI * t) * 0.4];            /* the moon, high in the middle of the night */
  }
  let ORIG = null;                                                              /* the backdrop's own sun, before the time of day moves the light */
  function gradeBackdrop(c, W, H){
    const h = hourOf(); if (h === null || !hasSky()) return;
    const T = todAt(h), gy = H * 0.84;
    c.save();
    c.globalCompositeOperation = 'multiply';
    const k = 0.82, m = T.m; c.fillStyle = 'rgb(' + Math.round(255 - (255 - m[0]) * k) + ',' + Math.round(255 - (255 - m[1]) * k) + ',' + Math.round(255 - (255 - m[2]) * k) + ')'; c.fillRect(0, 0, W, H);
    if (ORIG && T.night > 0.2){                                                  /* the backdrop's painted sun must not glow through the night: paint the sky over it */
      const sx = ORIG[0] * W, sy = Math.max(30, ORIG[1] * H), px = c.getImageData(Math.min(W - 1, Math.max(0, Math.round(sx))), 6, 1, 1).data, a0 = Math.min(1, (T.night - 0.2) * 1.4);
      const g = c.createRadialGradient(sx, sy, 10, sx, sy, 190); g.addColorStop(0, 'rgba(' + px[0] + ',' + px[1] + ',' + px[2] + ',' + a0.toFixed(2) + ')'); g.addColorStop(0.7, 'rgba(' + px[0] + ',' + px[1] + ',' + px[2] + ',' + (a0 * 0.7).toFixed(2) + ')'); g.addColorStop(1, 'rgba(' + px[0] + ',' + px[1] + ',' + px[2] + ',0)');
      c.fillStyle = g; c.fillRect(sx - 200, sy - 200, 400, 400);
    }
    c.globalCompositeOperation = 'lighter';
    if (T.night > 0.3){                                                         /* stars and a moon */
      const R = miniRng(4242), a = (T.night - 0.3) / 0.7;
      for (let i = 0; i < 90; i++){ const x = R() * W, y = R() * gy * 0.85, r = 0.6 + R() * 1.5; c.fillStyle = 'rgba(255,255,255,' + (a * (0.35 + R() * 0.55)).toFixed(2) + ')'; c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill(); }
      const mf = sunFrac(h), mx = mf[0] * W, my = Math.max(60, mf[1] * H);
      const g = c.createRadialGradient(mx, my, 4, mx, my, 90); g.addColorStop(0, 'rgba(210,225,255,' + (0.5 * a).toFixed(2) + ')'); g.addColorStop(1, 'rgba(210,225,255,0)'); c.fillStyle = g; c.fillRect(mx - 100, my - 100, 200, 200);
      c.globalCompositeOperation = 'source-over'; c.fillStyle = 'rgba(238,244,255,' + (0.95 * a).toFixed(2) + ')'; c.beginPath(); c.arc(mx, my, 20, 0, TAU); c.fill();
      c.fillStyle = 'rgba(150,170,210,' + (0.45 * a).toFixed(2) + ')'; [[-6, -4, 5], [7, 6, 4], [4, -9, 3]].forEach(function(q){ c.beginPath(); c.arc(mx + q[0], my + q[1], q[2], 0, TAU); c.fill(); });
      c.globalCompositeOperation = 'lighter';
    }
    const dawn = h >= 5 && h <= 8 ? 1 - Math.abs(h - 6.4) / 1.6 : h >= 17 && h <= 21 ? 1 - Math.abs(h - 19) / 2 : 0;       /* a glow on the horizon at dawn and dusk */
    if (dawn > 0){ const g = c.createLinearGradient(0, gy - 190, 0, gy + 10); g.addColorStop(0, 'rgba(255,150,90,0)'); g.addColorStop(0.75, 'rgba(255,' + (h < 12 ? 170 : 120) + ',90,' + (0.38 * dawn).toFixed(2) + ')'); g.addColorStop(1, 'rgba(255,210,140,' + (0.3 * dawn).toFixed(2) + ')'); c.fillStyle = g; c.fillRect(0, gy - 190, W, 200); }
    c.restore();
  }
  function gradeAll(c, W, H){                                                    /* a lighter wash over everything, so she and the creatures sit in the same light */
    const h = hourOf(); if (h === null || !hasSky()) return;
    const T = todAt(h), m = T.m, k = 0.7;
    c.save(); c.globalCompositeOperation = 'multiply'; c.fillStyle = 'rgb(' + Math.round(255 - (255 - m[0]) * k) + ',' + Math.round(255 - (255 - m[1]) * k) + ',' + Math.round(255 - (255 - m[2]) * k) + ')'; c.fillRect(0, 0, W, H); c.restore();
  }
  const bd = photoBackdrop;
  photoBackdrop = function(c, W, H, n){ bd(c, W, H, n); gradeBackdrop(c, W, H); };

  /* ---------------------------------------------------- freeze ---------------------------------------------------- */
  const fd = photoFoeDraw;
  photoFoeDraw = function(c, it){
    fd(c, it);
    if (!PHOTO.freeze) return;
    const def = bestiaryTable(it.ch)[it.id]; if (!def) return;
    const sc = photoFoeScale(def) * it.s, r = def.r * sc, w = r * 1.5, h = r * 1.55, R = miniRng(Math.round(it.x * 7 + it.y));
    c.save(); c.translate(it.x, it.y); c.rotate(it.r || 0);
    const g = c.createLinearGradient(-w, -h, w, h); g.addColorStop(0, 'rgba(210,244,255,.62)'); g.addColorStop(0.5, 'rgba(150,215,245,.4)'); g.addColorStop(1, 'rgba(120,190,235,.55)');
    c.fillStyle = g; c.beginPath(); c.moveTo(-w * 0.9, -h * 0.55); c.lineTo(-w * 0.55, -h); c.lineTo(w * 0.6, -h * 0.95); c.lineTo(w, -h * 0.4); c.lineTo(w * 0.95, h * 0.7); c.lineTo(w * 0.4, h); c.lineTo(-w * 0.7, h * 0.95); c.lineTo(-w, h * 0.3); c.closePath(); c.fill();
    c.lineWidth = 3; c.strokeStyle = 'rgba(235,250,255,.9)'; c.stroke();
    c.fillStyle = 'rgba(255,255,255,.35)'; c.beginPath(); c.moveTo(-w * 0.7, -h * 0.7); c.lineTo(-w * 0.35, -h * 0.85); c.lineTo(-w * 0.5, -h * 0.1); c.lineTo(-w * 0.78, -h * 0.05); c.closePath(); c.fill();
    c.strokeStyle = 'rgba(255,255,255,.6)'; c.lineWidth = 1.4; for (let i = 0; i < 5; i++){ c.beginPath(); let x = (R() - 0.5) * w * 1.4, y = (R() - 0.5) * h * 1.4; c.moveTo(x, y); for (let k = 0; k < 3; k++){ x += (R() - 0.5) * w * 0.5; y += (R() - 0.3) * h * 0.4; c.lineTo(x, y); } c.stroke(); }
    c.fillStyle = 'rgba(235,250,255,.85)'; for (let i = 0; i < 6; i++){ const x = -w * 0.8 + i * w * 0.32, l = h * (0.12 + R() * 0.16); c.beginPath(); c.moveTo(x - 5, h * 0.94); c.lineTo(x + 5, h * 0.94); c.lineTo(x, h * 0.94 + l); c.closePath(); c.fill(); }          /* icicles along the bottom */
    c.restore();
  };

  /* ---------------------------------------------------- filters ---------------------------------------------------- */
  function vignette(c, W, H, a){ const g = c.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.3, W / 2, H / 2, Math.max(W, H) * 0.72); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,' + a + ')'); c.fillStyle = g; c.fillRect(0, 0, W, H); }
  const FILTER = {
    1: function(c, W, H){                                                       /* sepia */
      const d = c.getImageData(0, 0, W, H), p = d.data;
      for (let i = 0; i < p.length; i += 4){ const r = p[i], g = p[i + 1], b = p[i + 2]; p[i] = Math.min(255, r * 0.393 + g * 0.769 + b * 0.189 + 10); p[i + 1] = Math.min(255, r * 0.349 + g * 0.686 + b * 0.168 + 4); p[i + 2] = Math.min(255, r * 0.272 + g * 0.534 + b * 0.131); }
      c.putImageData(d, 0, 0); c.fillStyle = 'rgba(120,80,40,.1)'; c.fillRect(0, 0, W, H); vignette(c, W, H, 0.5);
    },
    2: function(c, W, H){                                                       /* noir */
      const d = c.getImageData(0, 0, W, H), p = d.data, R = miniRng(31);
      for (let i = 0; i < p.length; i += 4){
        let l = (p[i] * 0.3 + p[i + 1] * 0.59 + p[i + 2] * 0.11) / 255; l = l < 0.5 ? 2 * l * l : 1 - 2 * (1 - l) * (1 - l);                        /* a hard S-curve */
        l = l * 255 + (R() - 0.5) * 26; p[i] = p[i + 1] = p[i + 2] = Math.max(0, Math.min(255, l));
      }
      c.putImageData(d, 0, 0); vignette(c, W, H, 0.78);
    },
    3: function(c, W, H){                                                       /* glitch */
      const src = c.getImageData(0, 0, W, H), out = c.createImageData(W, H), s = src.data, o = out.data, R = miniRng(77), k = W / 960, sh = Math.max(2, Math.round(7 * k));
      const bands = []; for (let i = 0; i < 16; i++) bands.push({ y: Math.floor(R() * H), h: Math.floor(4 + R() * 34 * k), dx: Math.round((R() - 0.5) * 70 * k) });
      for (let y = 0; y < H; y++){
        let dx = 0; for (let b = 0; b < bands.length; b++) if (y >= bands[b].y && y < bands[b].y + bands[b].h) dx = bands[b].dx;
        for (let x = 0; x < W; x++){
          const xr = Math.min(W - 1, Math.max(0, x + dx - sh)), xg = Math.min(W - 1, Math.max(0, x + dx)), xb = Math.min(W - 1, Math.max(0, x + dx + sh)), i = (y * W + x) * 4;
          o[i] = s[(y * W + xr) * 4]; o[i + 1] = s[(y * W + xg) * 4 + 1]; o[i + 2] = s[(y * W + xb) * 4 + 2]; o[i + 3] = 255;
          if (y % 3 === 0){ o[i] *= 0.78; o[i + 1] *= 0.78; o[i + 2] *= 0.78; }                                   /* scan lines */
        }
      }
      c.putImageData(out, 0, 0);
      for (let i = 0; i < 7; i++){ c.fillStyle = ['rgba(255,0,110,.35)', 'rgba(0,255,230,.3)', 'rgba(255,255,255,.25)'][i % 3]; c.fillRect(R() * W * 0.7, bands[i].y, W * (0.1 + R() * 0.3), Math.max(2, bands[i].h * 0.35)); }
    },
    4: function(c, W, H){                                                       /* painterly */
      const k = Math.max(2, Math.round(W / 300)), w2 = Math.ceil(W / k), h2 = Math.ceil(H / k), t = document.createElement('canvas'); t.width = w2; t.height = h2;
      const g = t.getContext('2d'); g.imageSmoothingEnabled = true; g.drawImage(c.canvas, 0, 0, w2, h2);
      const d = g.getImageData(0, 0, w2, h2), p = d.data, lv = 9, q = 255 / (lv - 1);
      for (let i = 0; i < p.length; i += 4){ p[i] = Math.round(p[i] / q) * q; p[i + 1] = Math.round(p[i + 1] / q) * q; p[i + 2] = Math.round(p[i + 2] / q) * q; }
      g.putImageData(d, 0, 0);
      c.save(); c.imageSmoothingEnabled = true; c.imageSmoothingQuality = 'high'; c.drawImage(t, 0, 0, W, H); c.restore();
      const R = miniRng(909), n = Math.round(W * H / 420);
      c.lineCap = 'round';
      for (let i = 0; i < n; i++){
        const x = R() * W, y = R() * H, ix = Math.min(w2 - 1, Math.floor(x / k)), iy = Math.min(h2 - 1, Math.floor(y / k)), pi = (iy * w2 + ix) * 4, a = (R() - 0.5) * 1.1 - 0.5, l = k * (3 + R() * 3);
        c.strokeStyle = 'rgba(' + p[pi] + ',' + p[pi + 1] + ',' + p[pi + 2] + ',' + (0.35 + R() * 0.25).toFixed(2) + ')'; c.lineWidth = k * (1.1 + R() * 0.9);
        c.beginPath(); c.moveTo(x - Math.cos(a) * l / 2, y - Math.sin(a) * l / 2); c.lineTo(x + Math.cos(a) * l / 2, y + Math.sin(a) * l / 2); c.stroke();
      }
      c.fillStyle = 'rgba(255,248,230,.07)'; for (let y = 0; y < H; y += 5) c.fillRect(0, y, W, 1); vignette(c, W, H, 0.22);              /* a hint of canvas */
    }
  };

  /* ---------------------------------------------------- frames ---------------------------------------------------- */
  const FRAME = {
    1: function(c, W, H){ const b = Math.round(W * 0.034); const g = c.createLinearGradient(0, 0, W, H); g.addColorStop(0, '#8A5A2E'); g.addColorStop(0.5, '#6A4020'); g.addColorStop(1, '#8A5A2E'); c.fillStyle = g; [[0, 0, W, b], [0, H - b, W, b], [0, 0, b, H], [W - b, 0, b, H]].forEach(function(r){ c.fillRect(r[0], r[1], r[2], r[3]); }); c.strokeStyle = 'rgba(255,220,160,.35)'; c.lineWidth = 2; c.strokeRect(b * 0.3, b * 0.3, W - b * 0.6, H - b * 0.6); c.strokeStyle = 'rgba(0,0,0,.45)'; c.lineWidth = 3; c.strokeRect(b, b, W - 2 * b, H - 2 * b); c.fillStyle = '#E8C060'; [[0, 0], [W - b, 0], [0, H - b], [W - b, H - b]].forEach(function(p){ c.fillRect(p[0], p[1], b, b); }); },
    2: function(c, W, H){ const s = W * 0.03, bot = H * 0.17; c.fillStyle = '#F8F4EA'; c.fillRect(0, 0, W, s); c.fillRect(0, 0, s, H); c.fillRect(W - s, 0, s, H); c.fillRect(0, H - bot, W, bot); c.strokeStyle = 'rgba(0,0,0,.2)'; c.lineWidth = 2; c.strokeRect(s, s, W - 2 * s, H - s - bot); c.fillStyle = '#3A3A44'; c.font = 'italic ' + Math.round(H * 0.07) + 'px "Segoe Script", "Comic Sans MS", cursive'; c.textAlign = 'center'; c.fillText('Giraffe Rampage', W / 2, H - bot * 0.38); c.fillStyle = 'rgba(0,0,0,.05)'; c.fillRect(0, H - bot, W, 2); },
    3: function(c, W, H){ const b = H * 0.1; c.fillStyle = '#14141A'; c.fillRect(0, 0, W, b); c.fillRect(0, H - b, W, b); c.fillStyle = '#F4F1E8'; const hw = b * 0.42, hh = b * 0.5, n = Math.round(W / (b * 0.95)); for (let i = 0; i < n; i++){ const x = (i + 0.5) * W / n; c.beginPath(); c.roundRect(x - hw / 2, b * 0.25, hw, hh, 3); c.fill(); c.beginPath(); c.roundRect(x - hw / 2, H - b * 0.75, hw, hh, 3); c.fill(); } c.fillStyle = '#E8B830'; c.font = 'bold ' + Math.round(b * 0.2) + 'px monospace'; c.textAlign = 'left'; c.fillText('GIRAFFE RAMPAGE  ·  ' + String(100 + (PHOTO.bg | 0) * 3), W * 0.03, b * 0.2 + 3); },
    4: function(c, W, H){ const R = miniRng(12), leaf = function(x, y, a, s, col){ c.save(); c.translate(x, y); c.rotate(a); c.fillStyle = col; c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(s * 0.5, -s * 0.38, s, 0); c.quadraticCurveTo(s * 0.5, s * 0.38, 0, 0); c.fill(); c.strokeStyle = 'rgba(20,50,10,.4)'; c.lineWidth = 1; c.beginPath(); c.moveTo(0, 0); c.lineTo(s * 0.9, 0); c.stroke(); c.restore(); };
      const cols = ['#3E7A3A', '#56933F', '#2E6030', '#6AA84A', '#D9A02E'], b = W * 0.045; c.fillStyle = 'rgba(40,60,20,.55)'; [[0, 0, W, b * 0.5], [0, H - b * 0.5, W, b * 0.5], [0, 0, b * 0.5, H], [W - b * 0.5, 0, b * 0.5, H]].forEach(function(r){ c.fillRect(r[0], r[1], r[2], r[3]); });
      for (let i = 0; i < 150; i++){ const t = R(), side = Math.floor(R() * 4), p = side < 2 ? [t * W, side ? H : 0] : [side === 2 ? 0 : W, t * H], inward = side === 0 ? Math.PI / 2 : side === 1 ? -Math.PI / 2 : side === 2 ? 0 : Math.PI; leaf(p[0], p[1], inward + (R() - 0.5) * 1.8, W * (0.03 + R() * 0.05), cols[Math.floor(R() * cols.length)]); } },
    5: function(c, W, H){ const b = W * 0.05; ['rgba(235,248,255,.8)', 'rgba(200,232,250,.5)'].forEach(function(col, k){ c.fillStyle = col; const e = b * (k ? 1.7 : 1); c.fillRect(0, 0, W, e * 0.6); c.fillRect(0, H - e * 0.6, W, e * 0.6); c.fillRect(0, 0, e * 0.6, H); c.fillRect(W - e * 0.6, 0, e * 0.6, H); }); const R = miniRng(8); c.fillStyle = 'rgba(245,252,255,.92)'; for (let i = 0; i < 46; i++){ const x = R() * W, top = R() < 0.5; const l = 10 + R() * 34; c.beginPath(); c.moveTo(x - 5, top ? 0 : H); c.lineTo(x + 5, top ? 0 : H); c.lineTo(x, top ? l : H - l); c.closePath(); c.fill(); } c.strokeStyle = 'rgba(255,255,255,.9)'; c.lineWidth = 2; for (let i = 0; i < 12; i++){ const x = R() * W, y = R() * H, r = 5 + R() * 8; for (let k = 0; k < 3; k++){ const a = k * Math.PI / 3; c.beginPath(); c.moveTo(x - Math.cos(a) * r, y - Math.sin(a) * r); c.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r); c.stroke(); } } },
    6: function(c, W, H){ const b = Math.round(W * 0.016); c.save(); c.shadowColor = '#FF3AD0'; c.shadowBlur = 18; c.strokeStyle = '#FF7AE8'; c.lineWidth = b; c.strokeRect(b * 2, b * 2, W - b * 4, H - b * 4); c.shadowColor = '#3AF0FF'; c.shadowBlur = 14; c.strokeStyle = '#8AFAFF'; c.lineWidth = b * 0.5; c.strokeRect(b * 4, b * 4, W - b * 8, H - b * 8); c.restore(); c.fillStyle = 'rgba(255,255,255,.9)'; c.fillRect(b * 2 - 1, b * 2 - 1, 3, 3); },
    7: function(c, W, H){ const b = W * 0.05; c.fillStyle = '#0E1230'; c.fillRect(0, 0, W, b); c.fillRect(0, H - b, W, b); c.fillRect(0, 0, b, H); c.fillRect(W - b, 0, b, H); const R = miniRng(19); for (let i = 0; i < 90; i++){ const side = Math.floor(R() * 4), t = R(), x = side < 2 ? t * W : (side === 2 ? R() * b : W - R() * b), y = side >= 2 ? t * H : (side === 0 ? R() * b : H - R() * b), r = 0.8 + R() * 2.2; c.fillStyle = 'rgba(255,255,255,' + (0.5 + R() * 0.5).toFixed(2) + ')'; c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill(); if (r > 2.4){ c.strokeStyle = 'rgba(255,255,255,.6)'; c.lineWidth = 1; c.beginPath(); c.moveTo(x - 5, y); c.lineTo(x + 5, y); c.moveTo(x, y - 5); c.lineTo(x, y + 5); c.stroke(); } } c.strokeStyle = 'rgba(180,200,255,.5)'; c.lineWidth = 2; c.strokeRect(b, b, W - 2 * b, H - 2 * b); }
  };

  /* ---------------------------------------------------- the picture ---------------------------------------------------- */
  const render = photoRender;
  photoRender = function(cv, ui){
    const f = PHOTO.filter | 0, fr = PHOTO.frame | 0, todOn = PHOTO.tod >= 0 && hasSky();
    if (!f && !fr && !todOn) return render(cv, ui);
    const W = cv.width, H = cv.height, A = document.createElement('canvas'); A.width = W; A.height = H;
    const sun = PHOTO_SUN[PHOTO.bg], keep = sun ? sun.slice() : null; ORIG = keep;
    if (todOn && sun){ const sf = sunFrac(PHOTO.tod / 2); sun[0] = sf[0]; sun[1] = sf[1]; }                     /* the shadows fall away from the sun, or the moon */
    try { render(A, false); } finally { if (sun && keep){ sun[0] = keep[0]; sun[1] = keep[1]; } }
    const a = A.getContext('2d');
    gradeAll(a, W, H);
    if (f && FILTER[f]) try { FILTER[f](a, W, H); } catch (e) {}
    if (fr && FRAME[fr]) try { a.save(); FRAME[fr](a, W, H); a.restore(); } catch (e) {}
    const c = cv.getContext('2d'); c.clearRect(0, 0, W, H); c.drawImage(A, 0, 0);
    if (ui && PHOTO.sel !== -2){                                                                                   /* the selection ring, last */
      const b = photoBounds(PHOTO.sel);
      if (b){ c.save(); c.setLineDash([7, 5]); c.lineWidth = 2.4; c.strokeStyle = '#FFD84D'; c.shadowColor = 'rgba(0,0,0,.6)'; c.shadowBlur = 3; c.beginPath(); c.ellipse(b.x, b.y, b.rx, b.ry, 0, 0, TAU); c.stroke(); c.restore(); }
    }
  };

  /* ---------------------------------------------------- the tab ---------------------------------------------------- */
  const hourText = function(t){ const h = Math.floor(t / 2), m = t % 2 ? '30' : '00', ap = h >= 12 ? 'pm' : 'am'; return ((h + 11) % 12 + 1) + ':' + m + ' ' + ap; };
  window.photoLookBody = function(){
    const lab = function(txt){ return '<div class="plabel">' + txt + '</div>'; };
    const chips = function(list, cur, pre){ return '<div class="pchips">' + list.map(function(nm, i){ return '<button class="pchip' + (i === cur ? ' on' : '') + '" data-a="' + pre + i + '">' + nm + '</button>'; }).join('') + '</div>'; };
    const sky = hasSky(), t = PHOTO.tod >= 0 ? PHOTO.tod : 24;
    return lab('Filter') + chips(PHOTO_FILTERS, PHOTO.filter | 0, 'ward-photo-look-filter-') + lab('Frame') + chips(PHOTO_FRAMES, PHOTO.frame | 0, 'ward-photo-look-frame-') +
      lab('Time of day') + (sky ? '<div class="ptod"><input id="photoTod" type="range" min="0" max="47" step="1" value="' + Math.min(47, t) + '"><b id="photoTodText">' + (PHOTO.tod >= 0 ? hourText(PHOTO.tod) : 'the backdrop\'s own light') + '</b>' +
        '<button class="pchip' + (PHOTO.tod < 0 ? ' on' : '') + '" data-a="ward-photo-look-tod-reset">The backdrop\'s own light</button></div>' : '<div class="sub" style="margin:2px 0">The Studio is indoors, so it has no sky to change. Pick another backdrop.</div>') +
      lab('Creatures') + '<div class="pchips"><button class="pchip' + (PHOTO.freeze ? ' on' : '') + '" data-a="ward-photo-look-freeze">Freeze every creature in ice</button></div>' +
      '<div class="sub" style="margin:6px 0 0">Stickers are in the Effects tab. Everything here is saved with the picture and in its photo code.</div>';
  };
  const act = photoAction;
  photoAction = function(a){
    let m = /^ward-photo-look-(filter|frame)-(\d+)$/.exec(a);
    if (m){ PHOTO[m[1]] = Math.min(m[1] === 'filter' ? PHOTO_FILTERS.length - 1 : PHOTO_FRAMES.length - 1, +m[2]); SFX.click(); showPhoto(); return true; }
    if (a === 'ward-photo-look-freeze'){ PHOTO.freeze = !PHOTO.freeze; SFX.click(); showPhoto(); return true; }
    if (a === 'ward-photo-look-tod-reset'){ PHOTO.tod = -1; SFX.click(); showPhoto(); return true; }
    return act(a);
  };
  const sp = showPhoto;
  showPhoto = function(){
    sp.apply(this, arguments);
    const sl = document.getElementById('photoTod'); if (!sl) return;
    sl.addEventListener('input', function(){ PHOTO.tod = +sl.value; const tx = document.getElementById('photoTodText'); if (tx) tx.textContent = hourText(PHOTO.tod); document.querySelectorAll('[data-a="ward-photo-look-tod-reset"]').forEach(function(b){ b.classList.remove('on'); }); photoDraw(); });
  };
})();
