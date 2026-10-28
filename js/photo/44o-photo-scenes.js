'use strict';
/* More backdrops for the photo studio: one for each chapter, and a few extras. The first five (Golden savanna, Snowfield, Night sky,
   Neon city, Studio) are in 44n-photo-studio.js. */
/* ========================= 44o. PHOTO SCENES ========================= */
/* Each scene is painted once per redraw into the 960 x 540 picture, with the ground starting at 84% of the height (where she stands).
   PHOTO_BG, PHOTO_SUN and photoBackdrop() are extended here: scene n (n >= 5) is PHOTO_SCENES[n - 5]. Keep the textures faint. */
function photoTools(c, W, H, R){
  const gy = H * 0.84;
  const T = {
    gy: gy,
    sky: function(stops, y1){ const g = c.createLinearGradient(0, 0, 0, y1 || gy); stops.forEach(function(s, i){ g.addColorStop(i / (stops.length - 1), s); }); c.fillStyle = g; c.fillRect(0, 0, W, H); },
    ground: function(col, y){ c.fillStyle = col; c.fillRect(0, y || gy, W, H - (y || gy)); },
    hills: function(col, base, amp, ph, step){
      c.fillStyle = col; c.beginPath(); c.moveTo(0, H);
      for (let x = 0; x <= W + (step || 12); x += (step || 12)) c.lineTo(x, base + Math.sin(x * 0.006 + ph) * amp + Math.sin(x * 0.017 + ph * 2) * amp * 0.35);
      c.lineTo(W, H); c.closePath(); c.fill();
    },
    glow: function(x, y, r, rgb, a){ const g = c.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, 'rgba(' + rgb + ',' + a + ')'); g.addColorStop(1, 'rgba(' + rgb + ',0)'); c.fillStyle = g; c.fillRect(x - r, y - r, r * 2, r * 2); },
    disc: function(x, y, r, col){ c.fillStyle = col; c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill(); },
    flecks: function(rgb, a, n, y0, y1){ c.fillStyle = 'rgba(' + rgb + ',' + a + ')'; for (let i = 0; i < n; i++) c.fillRect(R() * W, y0 + R() * (y1 - y0), 2 + R() * 5, 1.2); },
    tufts: function(rgb, a, n, y0, y1){
      c.strokeStyle = 'rgba(' + rgb + ',' + a + ')'; c.lineWidth = 1.4; c.lineCap = 'round';
      for (let i = 0; i < n; i++){ const x = R() * W, y = y0 + R() * (y1 - y0), h = 5 + R() * 7; c.beginPath(); c.moveTo(x, y); c.lineTo(x - 3, y - h); c.moveTo(x, y); c.lineTo(x, y - h * 1.15); c.moveTo(x, y); c.lineTo(x + 3, y - h * 0.9); c.stroke(); }
    },
    trunk: function(x, y, h, w, col){ c.fillStyle = col; c.beginPath(); c.moveTo(x - w / 2, y); c.lineTo(x - w * 0.32, y - h); c.lineTo(x + w * 0.32, y - h); c.lineTo(x + w / 2, y); c.closePath(); c.fill(); },
    stars: function(n, a, maxY){ c.fillStyle = '#FFFFFF'; for (let i = 0; i < n; i++){ c.globalAlpha = (a || 1) * (0.3 + R() * 0.7); c.beginPath(); c.arc(R() * W, R() * (maxY || gy), 0.6 + R() * 1.5, 0, TAU); c.fill(); } c.globalAlpha = 1; },
    cloud: function(x, y, s, col){ c.fillStyle = col; [[0, 0, 26], [24, -8, 22], [-24, -4, 20], [46, 2, 17], [-46, 4, 15]].forEach(function(p){ c.beginPath(); c.arc(x + p[0] * s, y + p[1] * s, p[2] * s, 0, TAU); c.fill(); }); },
    rain: function(n, rgb, a){ c.strokeStyle = 'rgba(' + rgb + ',' + a + ')'; c.lineWidth = 1.3; for (let i = 0; i < n; i++){ const x = R() * W, y = R() * gy; c.beginPath(); c.moveTo(x, y); c.lineTo(x - 5, y + 16); c.stroke(); } },
    windows: function(x, y, w, h, col, p){ c.fillStyle = col; for (let yy = y + 8; yy < y + h - 8; yy += 16) for (let xx = x + 7; xx < x + w - 7; xx += 13) if (R() < p) c.fillRect(xx, yy, 6, 8); }
  };
  return T;
}

const PHOTO_SCENES = [
  /* 5. Chapter 3: Murkfen */
  function(c, W, H, R, T){
    T.sky(['#6B7F5C', '#A9B88A', '#C8CFA0']);
    T.glow(W * 0.5, H * 0.3, 260, '240,245,190', 0.35);
    T.hills('#56694A', T.gy - 70, 14, 2, 14); T.hills('#46583C', T.gy - 34, 12, 5, 12);
    for (let i = 0; i < 6; i++){                                             /* dead trees with bare branches */
      const x = W * (0.06 + i * 0.18 + R() * 0.05), h = 120 + R() * 90;
      T.trunk(x, T.gy - 6, h, 12, '#2E2418');
      c.strokeStyle = '#2E2418'; c.lineWidth = 4; c.lineCap = 'round';
      for (let k = 0; k < 3; k++){ const by = T.gy - h * (0.5 + k * 0.17), d = k % 2 ? 1 : -1; c.beginPath(); c.moveTo(x, by); c.quadraticCurveTo(x + d * 24, by - 14, x + d * (36 + R() * 18), by - 30); c.stroke(); }
    }
    T.ground('#3A4A32'); T.flecks('160,190,120', 0.14, 70, T.gy + 4, H);
    c.fillStyle = 'rgba(86,120,70,.5)';                                       /* lily pads */
    for (let i = 0; i < 9; i++){ c.beginPath(); c.ellipse(R() * W, T.gy + 14 + R() * (H - T.gy - 22), 16 + R() * 10, 5 + R() * 3, 0, 0, TAU); c.fill(); }
    T.tufts('120,150,80', 0.5, 36, T.gy + 6, H - 4);
    for (let b = 0; b < 3; b++){ const g = c.createLinearGradient(0, T.gy - 90 + b * 34, 0, T.gy - 40 + b * 34); g.addColorStop(0, 'rgba(210,225,190,0)'); g.addColorStop(0.5, 'rgba(210,225,190,.22)'); g.addColorStop(1, 'rgba(210,225,190,0)'); c.fillStyle = g; c.fillRect(0, T.gy - 90 + b * 34, W, 50); }
    for (let i = 0; i < 12; i++) T.glow(R() * W, T.gy - 20 - R() * 140, 12, '230,255,140', 0.8);
  },
  /* 6. Chapter 4: The Deep */
  function(c, W, H, R, T){
    T.sky(['#54C0E0', '#1D74B0', '#0A2E5C'], H);
    c.globalCompositeOperation = 'screen';
    for (let i = 0; i < 5; i++){ const x = W * (0.1 + i * 0.2), g = c.createLinearGradient(x, 0, x - 120, H); g.addColorStop(0, 'rgba(200,245,255,.28)'); g.addColorStop(1, 'rgba(200,245,255,0)'); c.fillStyle = g; c.beginPath(); c.moveTo(x, 0); c.lineTo(x + 50, 0); c.lineTo(x - 70, H); c.lineTo(x - 170, H); c.closePath(); c.fill(); }
    c.globalCompositeOperation = 'source-over';
    T.hills('#0E4A7A', T.gy - 70, 16, 1, 14);
    c.fillStyle = '#0B3A66'; for (let i = 0; i < 5; i++){ const x = R() * W, h = 40 + R() * 70; c.beginPath(); c.moveTo(x - 30, T.gy - 20); c.quadraticCurveTo(x, T.gy - h, x + 30, T.gy - 20); c.fill(); }
    T.ground('#D9C58E');
    c.strokeStyle = 'rgba(160,130,70,.3)'; c.lineWidth = 1.5;                 /* ripples in the sand */
    for (let i = 0; i < 18; i++){ const x = R() * W, y = T.gy + 6 + R() * (H - T.gy - 12), l = 30 + R() * 60; c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + l / 2, y - 4, x + l, y); c.stroke(); }
    T.flecks('255,245,210', 0.3, 60, T.gy + 4, H);
    c.lineCap = 'round';
    for (let i = 0; i < 9; i++){                                              /* seaweed */
      const x = R() * W, h = 50 + R() * 70; c.strokeStyle = i % 2 ? '#2FA860' : '#1E8A4C'; c.lineWidth = 5;
      c.beginPath(); c.moveTo(x, T.gy + 6); c.bezierCurveTo(x - 16, T.gy - h * 0.4, x + 16, T.gy - h * 0.7, x, T.gy - h); c.stroke();
    }
    c.fillStyle = 'rgba(8,30,60,.4)'; for (let i = 0; i < 5; i++){ const x = R() * W, y = R() * T.gy * 0.7 + 30; c.beginPath(); c.ellipse(x, y, 14, 5, 0, 0, TAU); c.fill(); c.beginPath(); c.moveTo(x - 12, y); c.lineTo(x - 21, y - 5); c.lineTo(x - 21, y + 5); c.closePath(); c.fill(); }
    c.strokeStyle = 'rgba(220,245,255,.7)'; c.lineWidth = 1.6; for (let i = 0; i < 22; i++){ c.beginPath(); c.arc(R() * W, R() * T.gy, 2 + R() * 6, 0, TAU); c.stroke(); }
  },
  /* 7. Chapter 5: The Canopy */
  function(c, W, H, R, T){
    T.sky(['#2C6A34', '#4C9A48', '#8CC464']);
    for (let i = 0; i < 7; i++){ T.disc(R() * W, R() * T.gy * 0.7, 50 + R() * 60, 'rgba(34,92,40,.55)'); }
    c.globalCompositeOperation = 'screen';
    for (let i = 0; i < 4; i++){ const x = W * (0.2 + i * 0.22), g = c.createLinearGradient(x, 0, x - 90, H); g.addColorStop(0, 'rgba(255,250,170,.3)'); g.addColorStop(1, 'rgba(255,250,170,0)'); c.fillStyle = g; c.beginPath(); c.moveTo(x, 0); c.lineTo(x + 46, 0); c.lineTo(x - 50, H); c.lineTo(x - 130, H); c.closePath(); c.fill(); }
    c.globalCompositeOperation = 'source-over';
    for (let i = 0; i < 6; i++){
      const x = W * (0.05 + i * 0.19 + R() * 0.04), w = 30 + R() * 22;
      T.trunk(x, T.gy + 10, T.gy + 20, w, i % 2 ? '#4A3220' : '#5A3C26');
      c.strokeStyle = 'rgba(30,18,8,.35)'; c.lineWidth = 2; for (let k = 0; k < 5; k++){ const yy = R() * T.gy; c.beginPath(); c.moveTo(x - w * 0.3, yy); c.lineTo(x + w * 0.1, yy + 18); c.stroke(); }
      c.strokeStyle = '#2E7A36'; c.lineWidth = 3;                              /* a hanging vine */
      c.beginPath(); c.moveTo(x + w * 0.4, R() * 80); c.bezierCurveTo(x + 40, 140, x - 10, 220, x + 24, 300); c.stroke();
    }
    T.ground('#3A5A26'); T.flecks('190,220,120', 0.16, 70, T.gy + 4, H); T.tufts('120,190,80', 0.45, 34, T.gy + 6, H - 4);
    c.fillStyle = '#1F5A2A';                                                    /* ferns */
    for (let i = 0; i < 5; i++){ const x = R() * W, y = T.gy + 4; for (let k = -3; k <= 3; k++){ c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + k * 12, y - 36 - Math.abs(k) * -4, x + k * 20, y - 14 + Math.abs(k) * 6); c.lineTo(x + k * 18, y - 8); c.closePath(); c.fill(); } }
  },
  /* 8. Chapter 6: Houston */
  function(c, W, H, R, T){
    T.sky(['#2E3E78', '#E27A5A', '#FFC77A']);
    T.glow(W * 0.3, T.gy - 20, 240, '255,200,120', 0.55);
    T.disc(W * 0.3, T.gy - 40, 38, 'rgba(255,230,170,.9)');
    for (let i = 0; i < 13; i++){
      const w = 44 + R() * 60, h = 100 + R() * 200, x = i * (W / 12) - 20;
      c.fillStyle = 'rgb(' + Math.round(38 + R() * 20) + ',' + Math.round(40 + R() * 20) + ',' + Math.round(64 + R() * 24) + ')'; c.fillRect(x, T.gy - h, w, h);
      c.fillStyle = 'rgba(0,0,0,.18)'; c.fillRect(x + w * 0.7, T.gy - h, w * 0.3, h);
      T.windows(x, T.gy - h, w, h, 'rgba(255,214,120,.7)', 0.4);
      if (R() < 0.4){ c.fillStyle = '#333B5C'; c.fillRect(x + w / 2 - 1, T.gy - h - 22, 2, 22); T.glow(x + w / 2, T.gy - h - 22, 9, '255,60,60', 0.9); }
    }
    T.ground('#2B2B36'); c.fillStyle = 'rgba(255,255,255,.1)';
    for (let x = -10; x < W + 60; x += 110) c.fillRect(x, T.gy + (H - T.gy) * 0.5, 54, 3);
    c.fillRect(0, T.gy + 2, W, 3); T.flecks('200,200,220', 0.1, 50, T.gy + 6, H);
  },
  /* 9. Chapter 7: Space Center */
  function(c, W, H, R, T){
    T.sky(['#3C86D8', '#8FC4F0', '#DCEBFA']);
    T.cloud(W * 0.2, 90, 1.1, 'rgba(255,255,255,.85)'); T.cloud(W * 0.62, 60, 0.8, 'rgba(255,255,255,.8)'); T.cloud(W * 0.88, 130, 1, 'rgba(255,255,255,.7)');
    T.hills('#B7C9A0', T.gy - 38, 8, 1, 14);
    const px = W * 0.76;                                                        /* the rocket and its tower */
    c.fillStyle = '#F4F4F2'; c.beginPath(); c.moveTo(px - 22, T.gy); c.lineTo(px - 22, T.gy - 190); c.quadraticCurveTo(px, T.gy - 262, px + 22, T.gy - 190); c.lineTo(px + 22, T.gy); c.closePath(); c.fill();
    c.fillStyle = '#D93A2E'; c.beginPath(); c.moveTo(px - 22, T.gy - 190); c.quadraticCurveTo(px, T.gy - 262, px + 22, T.gy - 190); c.closePath(); c.fill();
    c.fillStyle = '#C9D2DE'; c.fillRect(px - 22, T.gy - 120, 44, 6); c.fillStyle = '#5A8CC8'; c.beginPath(); c.arc(px, T.gy - 160, 7, 0, TAU); c.fill();
    c.fillStyle = '#D93A2E'; c.beginPath(); c.moveTo(px - 22, T.gy); c.lineTo(px - 44, T.gy + 4); c.lineTo(px - 22, T.gy - 50); c.closePath(); c.fill(); c.beginPath(); c.moveTo(px + 22, T.gy); c.lineTo(px + 44, T.gy + 4); c.lineTo(px + 22, T.gy - 50); c.closePath(); c.fill();
    c.strokeStyle = '#7A8494'; c.lineWidth = 3; const tx = px + 64;                 /* gantry */
    c.strokeRect(tx, T.gy - 230, 22, 230); for (let y = T.gy - 230; y < T.gy; y += 28){ c.beginPath(); c.moveTo(tx, y); c.lineTo(tx + 22, y + 28); c.moveTo(tx + 22, y); c.lineTo(tx, y + 28); c.stroke(); }
    c.fillRect(px + 22, T.gy - 150, 42, 4);
    T.ground('#B8B6AE'); c.fillStyle = '#E8B52A';
    for (let x = -20; x < W + 40; x += 60){ c.beginPath(); c.moveTo(x, T.gy + 6); c.lineTo(x + 24, T.gy + 6); c.lineTo(x + 10, T.gy + 20); c.lineTo(x - 14, T.gy + 20); c.closePath(); c.fill(); }
    c.fillStyle = 'rgba(0,0,0,.06)'; for (let x = 0; x < W; x += 140) c.fillRect(x, T.gy, 2, H - T.gy);
    T.flecks('90,90,90', 0.12, 60, T.gy + 4, H);
  },
  /* 10. Chapter 8: The Moon */
  function(c, W, H, R, T){
    T.sky(['#000006', '#0A0C1C', '#14182E']);
    T.stars(170, 1, T.gy);
    T.disc(W * 0.78, H * 0.22, 54, '#2F72C8');                                  /* the Earth */
    c.fillStyle = '#3FA45A'; c.beginPath(); c.ellipse(W * 0.76, H * 0.2, 20, 14, 0.4, 0, TAU); c.fill(); c.beginPath(); c.ellipse(W * 0.8, H * 0.27, 12, 8, -0.3, 0, TAU); c.fill();
    c.fillStyle = 'rgba(255,255,255,.6)'; c.beginPath(); c.ellipse(W * 0.75, H * 0.16, 22, 5, 0.2, 0, TAU); c.fill();
    const sh = c.createRadialGradient(W * 0.74, H * 0.2, 20, W * 0.8, H * 0.24, 62); sh.addColorStop(0, 'rgba(0,0,0,0)'); sh.addColorStop(1, 'rgba(0,0,10,.55)'); c.fillStyle = sh; c.beginPath(); c.arc(W * 0.78, H * 0.22, 54, 0, TAU); c.fill();
    T.hills('#6E6E78', T.gy - 52, 12, 2, 14); T.hills('#868690', T.gy - 20, 8, 4, 12);
    T.ground('#9A9AA4');
    for (let i = 0; i < 9; i++){ const x = R() * W, y = T.gy + 10 + R() * (H - T.gy - 18), rx = 18 + R() * 30; c.fillStyle = 'rgba(70,70,82,.5)'; c.beginPath(); c.ellipse(x, y, rx, rx * 0.34, 0, 0, TAU); c.fill(); c.strokeStyle = 'rgba(210,210,220,.35)'; c.lineWidth = 1.4; c.beginPath(); c.ellipse(x, y - 1, rx, rx * 0.34, 0, Math.PI * 1.05, Math.PI * 1.95); c.stroke(); }
    T.flecks('230,230,240', 0.16, 70, T.gy + 4, H); T.flecks('60,60,70', 0.14, 60, T.gy + 4, H);
    c.strokeStyle = '#D8D8E0'; c.lineWidth = 3; c.beginPath(); c.moveTo(W * 0.12, T.gy + 6); c.lineTo(W * 0.12, T.gy - 80); c.stroke();  /* a flag */
    c.fillStyle = '#E8E8F0'; c.fillRect(W * 0.12, T.gy - 80, 46, 28); c.fillStyle = '#D93A3A'; for (let k = 0; k < 4; k++) c.fillRect(W * 0.12, T.gy - 80 + k * 8, 46, 4);
  },
  /* 11. Chapter 9: Venus */
  function(c, W, H, R, T){
    T.sky(['#8A4A18', '#D88A2C', '#F2CB6A']);
    c.globalAlpha = 0.35; c.fillStyle = '#FFE9A0';
    for (let i = 0; i < 5; i++){ const y = 40 + i * 70; c.beginPath(); c.moveTo(0, y); for (let x = 0; x <= W; x += 20) c.lineTo(x, y + Math.sin(x * 0.012 + i) * 12); c.lineTo(W, y + 24); for (let x = W; x >= 0; x -= 20) c.lineTo(x, y + 24 + Math.sin(x * 0.012 + i + 1) * 10); c.closePath(); c.fill(); }
    c.globalAlpha = 1;
    T.glow(W * 0.5, 10, 300, '255,230,140', 0.5);
    for (let i = 0; i < 4; i++){                                                /* volcanoes with a glow */
      const x = W * (0.12 + i * 0.26 + R() * 0.04), h = 90 + R() * 70;
      c.fillStyle = '#4A2A14'; c.beginPath(); c.moveTo(x - 90, T.gy - 20); c.lineTo(x - 18, T.gy - h); c.lineTo(x + 18, T.gy - h); c.lineTo(x + 90, T.gy - 20); c.closePath(); c.fill();
      T.glow(x, T.gy - h, 34, '255,120,40', 0.9);
    }
    T.ground('#B07A28'); T.flecks('255,226,150', 0.16, 70, T.gy + 4, H); T.flecks('70,40,10', 0.14, 60, T.gy + 4, H);
    c.strokeStyle = 'rgba(70,40,10,.45)'; c.lineWidth = 1.6;                    /* cracks */
    for (let i = 0; i < 10; i++){ let x = R() * W, y = T.gy + 8 + R() * (H - T.gy - 14); c.beginPath(); c.moveTo(x, y); for (let k = 0; k < 4; k++){ x += (R() - 0.3) * 24; y += (R() - 0.5) * 8; c.lineTo(x, y); } c.stroke(); }
    c.fillStyle = 'rgba(255,240,150,.5)'; for (let i = 0; i < 26; i++){ c.beginPath(); c.arc(R() * W, R() * T.gy, 1 + R() * 2.2, 0, TAU); c.fill(); }
  },
  /* 12. Chapter 10: The Inferno */
  function(c, W, H, R, T){
    T.sky(['#140404', '#5A1208', '#C8400E']);
    T.glow(W * 0.5, T.gy, 380, '255,120,30', 0.6);
    c.fillStyle = '#240A06';
    for (let i = 0; i < 9; i++){ const x = R() * W, h = 70 + R() * 150, w = 24 + R() * 26; c.beginPath(); c.moveTo(x - w, T.gy); c.lineTo(x - w * 0.2, T.gy - h); c.lineTo(x + w * 0.3, T.gy - h * 0.7); c.lineTo(x + w, T.gy); c.closePath(); c.fill(); }
    T.hills('#2E100A', T.gy - 22, 8, 3, 12);
    T.ground('#30120C');
    c.lineCap = 'round'; c.lineWidth = 5;                                         /* lava cracks */
    for (let i = 0; i < 9; i++){ let x = R() * W, y = T.gy + 8 + R() * (H - T.gy - 14); c.strokeStyle = i % 2 ? '#FF7A1A' : '#FFB030'; c.shadowColor = 'rgba(255,120,30,.9)'; c.shadowBlur = 10; c.beginPath(); c.moveTo(x, y); for (let k = 0; k < 5; k++){ x += 16 + R() * 26; y += (R() - 0.5) * 10; c.lineTo(x, y); } c.stroke(); }
    c.shadowBlur = 0; T.flecks('255,140,60', 0.2, 60, T.gy + 4, H);
    for (let i = 0; i < 34; i++){ c.fillStyle = 'rgba(255,' + Math.round(130 + R() * 90) + ',60,' + (0.4 + R() * 0.5).toFixed(2) + ')'; c.beginPath(); c.arc(R() * W, R() * T.gy, 1 + R() * 2.2, 0, TAU); c.fill(); }
  },
  /* 13. Chapter 11: The Changed Savannah */
  function(c, W, H, R, T){
    T.sky(['#1B1448', '#6A2E8C', '#E0709C']);
    T.stars(70, 0.8, T.gy * 0.6);
    T.disc(W * 0.24, H * 0.2, 40, '#F4D6FF'); T.disc(W * 0.31, H * 0.13, 17, '#8FE8D8');
    T.glow(W * 0.24, H * 0.2, 150, '230,170,255', 0.35);
    T.hills('#3A1E5C', T.gy - 62, 16, 1, 14); T.hills('#2A1646', T.gy - 26, 12, 4, 12);
    for (let i = 0; i < 3; i++){                                                  /* twisted acacias with glowing leaves */
      const x = W * (0.2 + i * 0.3 + R() * 0.05); T.trunk(x, T.gy - 8, 92, 9, '#1A0E2A');
      c.strokeStyle = '#1A0E2A'; c.lineWidth = 5; c.beginPath(); c.moveTo(x, T.gy - 84); c.quadraticCurveTo(x - 30, T.gy - 110, x - 56, T.gy - 104); c.stroke();
      c.fillStyle = '#E04A9A'; c.beginPath(); c.ellipse(x, T.gy - 100, 70, 15, 0, 0, TAU); c.fill();
      c.fillStyle = 'rgba(255,170,220,.6)'; c.beginPath(); c.ellipse(x - 12, T.gy - 104, 38, 7, 0, 0, TAU); c.fill();
    }
    T.ground('#2A1840'); T.flecks('200,150,255', 0.14, 70, T.gy + 4, H);
    T.tufts('60,230,200', 0.7, 24, T.gy + 6, H - 4); T.tufts('255,110,190', 0.7, 24, T.gy + 6, H - 4);
    for (let i = 0; i < 12; i++) T.glow(R() * W, T.gy - R() * 120, 10, i % 2 ? '120,255,220' : '255,140,210', 0.8);
  },
  /* 14. Chapter 12: Area 51 */
  function(c, W, H, R, T){
    T.sky(['#04061A', '#0E1A40', '#2A3560']);
    T.stars(120, 1, T.gy);
    T.hills('#1A1E34', T.gy - 50, 14, 2, 14);
    c.fillStyle = '#4A5062'; c.beginPath(); c.moveTo(W * 0.1, T.gy); c.lineTo(W * 0.1, T.gy - 74); c.quadraticCurveTo(W * 0.22, T.gy - 130, W * 0.34, T.gy - 74); c.lineTo(W * 0.34, T.gy); c.closePath(); c.fill();
    c.fillStyle = '#2A2E3C'; c.fillRect(W * 0.18, T.gy - 52, W * 0.08, 52);
    T.glow(W * 0.22, T.gy - 30, 60, '255,230,150', 0.4);
    const ux = W * 0.72, uy = H * 0.26;                                          /* a hovering saucer with its light */
    c.globalCompositeOperation = 'screen';
    const bm = c.createLinearGradient(0, uy + 10, 0, T.gy); bm.addColorStop(0, 'rgba(160,255,200,.45)'); bm.addColorStop(1, 'rgba(160,255,200,.04)');
    c.fillStyle = bm; c.beginPath(); c.moveTo(ux - 22, uy + 10); c.lineTo(ux + 22, uy + 10); c.lineTo(ux + 80, T.gy); c.lineTo(ux - 80, T.gy); c.closePath(); c.fill();
    c.globalCompositeOperation = 'source-over';
    c.fillStyle = '#9AA8B8'; c.beginPath(); c.ellipse(ux, uy, 56, 14, 0, 0, TAU); c.fill();
    c.fillStyle = '#6FE6B0'; c.beginPath(); c.ellipse(ux, uy - 8, 24, 14, 0, Math.PI, 0); c.fill();
    c.fillStyle = '#E8F4FF'; for (let k = -2; k <= 2; k++){ c.beginPath(); c.arc(ux + k * 18, uy + 2, 2.4, 0, TAU); c.fill(); }
    T.ground('#2E2C34'); T.flecks('160,160,190', 0.14, 60, T.gy + 4, H);
    c.strokeStyle = 'rgba(190,200,220,.55)'; c.lineWidth = 2;                    /* the fence */
    for (let x = 0; x < W; x += 24){ c.beginPath(); c.moveTo(x, T.gy + 8); c.lineTo(x, T.gy - 26); c.stroke(); }
    c.beginPath(); c.moveTo(0, T.gy - 20); c.lineTo(W, T.gy - 20); c.moveTo(0, T.gy - 4); c.lineTo(W, T.gy - 4); c.stroke();
  },
  /* 15. Chapter 13: Mars */
  function(c, W, H, R, T){
    T.sky(['#6C3A2A', '#C8704A', '#F0B88A']);
    T.disc(W * 0.2, H * 0.18, 14, '#E8D6C4'); T.disc(W * 0.28, H * 0.12, 7, '#D8C6B4');
    T.glow(W * 0.8, T.gy - 40, 220, '255,220,170', 0.5); T.disc(W * 0.8, T.gy - 40, 20, 'rgba(255,240,215,.9)');
    T.hills('#8A4630', T.gy - 78, 24, 1, 14); T.hills('#9A4F34', T.gy - 38, 16, 4, 12);
    T.ground('#A85A3A'); T.flecks('255,205,160', 0.16, 80, T.gy + 4, H); T.flecks('80,30,16', 0.14, 70, T.gy + 4, H);
    for (let i = 0; i < 8; i++){ const x = R() * W, y = T.gy + 6 + R() * (H - T.gy - 14), r = 8 + R() * 16; c.fillStyle = '#6E3322'; c.beginPath(); c.ellipse(x, y, r, r * 0.7, 0, Math.PI, 0); c.fill(); c.fillStyle = 'rgba(0,0,0,.18)'; c.beginPath(); c.ellipse(x + r * 0.4, y, r * 0.7, r * 0.3, 0, 0, TAU); c.fill(); }
    const rx = W * 0.14, ry = T.gy + 4;                                           /* a small rover */
    c.fillStyle = '#D8D8DC'; c.fillRect(rx - 24, ry - 22, 48, 14); c.fillStyle = '#7A7A84'; c.fillRect(rx - 4, ry - 36, 3, 14); c.fillStyle = '#C9D2DE'; c.fillRect(rx - 10, ry - 40, 20, 6);
    c.fillStyle = '#2A2A30'; [-18, 0, 18].forEach(function(dx){ c.beginPath(); c.arc(rx + dx, ry - 4, 6, 0, TAU); c.fill(); });
    c.fillStyle = 'rgba(255,220,180,.18)'; for (let i = 0; i < 5; i++){ c.beginPath(); c.ellipse(R() * W, T.gy - 10 - R() * 50, 60 + R() * 60, 7, 0, 0, TAU); c.fill(); }
  },
  /* 16. Sunny meadow */
  function(c, W, H, R, T){
    T.sky(['#4AA6F0', '#9ED2F8', '#E8F6FF']);
    T.cloud(W * 0.22, 100, 1.2, 'rgba(255,255,255,.92)'); T.cloud(W * 0.64, 70, 0.9, 'rgba(255,255,255,.88)'); T.cloud(W * 0.9, 140, 0.8, 'rgba(255,255,255,.8)');
    T.disc(W * 0.84, 80, 34, '#FFE76A'); T.glow(W * 0.84, 80, 140, '255,240,140', 0.45);
    T.hills('#7CC25A', T.gy - 62, 20, 1, 14); T.hills('#5DAE42', T.gy - 26, 14, 4, 12);
    T.trunk(W * 0.16, T.gy - 6, 80, 14, '#6A4426');
    T.disc(W * 0.16, T.gy - 100, 52, '#3E9A3A'); T.disc(W * 0.16 - 28, T.gy - 82, 34, '#4DAE46'); T.disc(W * 0.16 + 30, T.gy - 84, 32, '#3A8E36');
    T.ground('#58A83C'); T.flecks('200,240,150', 0.18, 70, T.gy + 4, H); T.tufts('36,110,30', 0.45, 36, T.gy + 6, H - 4);
    const cols = ['#FFFFFF', '#FF7AA8', '#FFD84D', '#B58AFF'];
    for (let i = 0; i < 30; i++){ c.fillStyle = cols[i % 4]; c.beginPath(); c.arc(R() * W, T.gy + 8 + R() * (H - T.gy - 14), 2.4, 0, TAU); c.fill(); }
  },
  /* 17. Beach sunset */
  function(c, W, H, R, T){
    T.sky(['#3A2A78', '#E0507A', '#FFB060'], T.gy - 70);
    T.disc(W * 0.5, T.gy - 80, 46, '#FFE9A0'); T.glow(W * 0.5, T.gy - 80, 230, '255,190,110', 0.55);
    const sea = c.createLinearGradient(0, T.gy - 70, 0, T.gy); sea.addColorStop(0, '#E8749A'); sea.addColorStop(1, '#4A3A8A'); c.fillStyle = sea; c.fillRect(0, T.gy - 70, W, 70);
    c.fillStyle = 'rgba(255,230,160,.5)'; for (let i = 0; i < 10; i++){ const y = T.gy - 66 + i * 6.5, w = 12 + i * 9; c.fillRect(W * 0.5 - w / 2 + Math.sin(i * 2) * 4, y, w, 2); }
    T.ground('#E8CE98'); T.flecks('255,250,225', 0.3, 80, T.gy + 4, H); T.flecks('150,110,60', 0.14, 50, T.gy + 4, H);
    c.strokeStyle = 'rgba(255,255,255,.55)'; c.lineWidth = 3; c.beginPath(); c.moveTo(0, T.gy + 1); for (let x = 0; x <= W; x += 20) c.lineTo(x, T.gy + 1 + Math.sin(x * 0.05) * 2); c.stroke();
    [[W * 0.1, 1], [W * 0.88, -1]].forEach(function(p){                          /* palms */
      const x = p[0], d = p[1]; c.strokeStyle = '#5A3A22'; c.lineWidth = 9; c.lineCap = 'round';
      c.beginPath(); c.moveTo(x, T.gy + 8); c.quadraticCurveTo(x + d * 18, T.gy - 80, x + d * 6, T.gy - 160); c.stroke();
      c.fillStyle = '#1F5A38'; const tx = x + d * 6, ty = T.gy - 160;
      for (let k = 0; k < 6; k++){ const a = -Math.PI / 2 + (k - 2.5) * 0.55; c.beginPath(); c.moveTo(tx, ty); c.quadraticCurveTo(tx + Math.cos(a) * 44, ty + Math.sin(a) * 44 - 16, tx + Math.cos(a) * 80, ty + Math.sin(a) * 60 + 18); c.quadraticCurveTo(tx + Math.cos(a) * 44, ty + Math.sin(a) * 44 + 4, tx, ty); c.fill(); }
    });
  },
  /* 18. Rainy day */
  function(c, W, H, R, T){
    T.sky(['#5E6A78', '#8E9AA6', '#B8C2CA']);
    T.cloud(W * 0.2, 70, 1.5, 'rgba(90,98,110,.8)'); T.cloud(W * 0.55, 50, 1.7, 'rgba(80,88,100,.8)'); T.cloud(W * 0.88, 90, 1.4, 'rgba(96,104,116,.8)');
    T.hills('#5E7A66', T.gy - 60, 18, 2, 14); T.hills('#4A6654', T.gy - 26, 12, 5, 12);
    for (let i = 0; i < 4; i++){ const x = W * (0.12 + i * 0.26), h = 100 + R() * 40; T.trunk(x, T.gy - 4, h, 12, '#3A2E22'); T.disc(x, T.gy - h - 14, 40, '#3E6A48'); T.disc(x + 26, T.gy - h + 4, 28, '#376040'); }
    T.ground('#4A5A46'); T.flecks('160,190,170', 0.14, 70, T.gy + 4, H); T.tufts('90,130,90', 0.5, 28, T.gy + 6, H - 4);
    c.fillStyle = 'rgba(150,185,215,.5)';                                        /* puddles */
    for (let i = 0; i < 6; i++){ const x = R() * W, y = T.gy + 12 + R() * (H - T.gy - 20); c.beginPath(); c.ellipse(x, y, 30 + R() * 30, 6 + R() * 3, 0, 0, TAU); c.fill(); c.strokeStyle = 'rgba(255,255,255,.5)'; c.lineWidth = 1.2; c.beginPath(); c.ellipse(x + 6, y, 9, 2.6, 0, 0, TAU); c.stroke(); }
    T.rain(150, '220,235,255', 0.5);
  },
  /* 19. Mountain peak */
  function(c, W, H, R, T){
    T.sky(['#3E78C8', '#8EBCEA', '#E2F0FC']);
    T.cloud(W * 0.3, 130, 1.1, 'rgba(255,255,255,.85)'); T.cloud(W * 0.8, 100, 0.9, 'rgba(255,255,255,.8)');
    [[0.2, 280, '#8A9BB0'], [0.55, 340, '#7C8EA6'], [0.85, 250, '#93A4B8']].forEach(function(p){
      const x = W * p[0], h = p[1];
      c.fillStyle = p[2]; c.beginPath(); c.moveTo(x - 210, T.gy - 30); c.lineTo(x, T.gy - h); c.lineTo(x + 210, T.gy - 30); c.closePath(); c.fill();
      c.fillStyle = '#FFFFFF'; c.beginPath(); c.moveTo(x, T.gy - h); c.lineTo(x + 48, T.gy - h + 74); c.lineTo(x + 18, T.gy - h + 62); c.lineTo(x - 8, T.gy - h + 84); c.lineTo(x - 34, T.gy - h + 60); c.lineTo(x - 52, T.gy - h + 74); c.closePath(); c.fill();
      c.fillStyle = 'rgba(40,60,90,.18)'; c.beginPath(); c.moveTo(x, T.gy - h); c.lineTo(x + 210, T.gy - 30); c.lineTo(x + 40, T.gy - 30); c.closePath(); c.fill();
    });
    T.hills('#6E8A5E', T.gy - 30, 12, 3, 12);
    T.ground('#8A8478'); T.flecks('230,225,215', 0.18, 70, T.gy + 4, H); T.flecks('60,56,50', 0.14, 70, T.gy + 4, H);
    for (let i = 0; i < 6; i++){ const x = R() * W, y = T.gy + 8 + R() * (H - T.gy - 14), r = 6 + R() * 12; c.fillStyle = '#6A665C'; c.beginPath(); c.ellipse(x, y, r, r * 0.6, 0, Math.PI, 0); c.fill(); }
    for (let i = 0; i < 5; i++){ const x = R() * W, h = 40 + R() * 30; T.trunk(x, T.gy - 2, 10, 5, '#4A3220'); c.fillStyle = '#2E5A3E'; c.beginPath(); c.moveTo(x, T.gy - 8 - h); c.lineTo(x + h * 0.32, T.gy - 8); c.lineTo(x - h * 0.32, T.gy - 8); c.closePath(); c.fill(); }
  },
  /* 20. Autumn forest */
  function(c, W, H, R, T){
    T.sky(['#F0A850', '#F8D090', '#FCEBC8']);
    T.glow(W * 0.3, T.gy - 60, 260, '255,230,170', 0.5);
    const leaf = ['#D8541A', '#E8861E', '#F0B232', '#B83A14'];
    for (let i = 0; i < 7; i++){
      const x = W * (0.04 + i * 0.16 + R() * 0.04), h = 110 + R() * 70;
      T.trunk(x, T.gy - 4, h, 16, '#5A3A22');
      for (let k = 0; k < 4; k++) T.disc(x + (R() - 0.5) * 60, T.gy - h - 10 + (R() - 0.5) * 40, 32 + R() * 24, leaf[(i + k) % 4]);
    }
    T.ground('#8A5A2C'); T.flecks('255,220,150', 0.18, 70, T.gy + 4, H); T.flecks('60,30,10', 0.14, 60, T.gy + 4, H);
    for (let i = 0; i < 46; i++){ c.fillStyle = leaf[i % 4]; c.save(); c.translate(R() * W, T.gy + 6 + R() * (H - T.gy - 12)); c.rotate(R() * TAU); c.beginPath(); c.ellipse(0, 0, 6, 3, 0, 0, TAU); c.fill(); c.restore(); }
    for (let i = 0; i < 10; i++){ c.fillStyle = leaf[i % 4]; c.save(); c.translate(R() * W, R() * T.gy); c.rotate(R() * TAU); c.beginPath(); c.ellipse(0, 0, 6, 3, 0, 0, TAU); c.fill(); c.restore(); }
  }
];
const PHOTO_SCENE_NAMES = ['Murkfen', 'The Deep', 'The Canopy', 'Houston', 'Space Center', 'The Moon', 'Venus', 'The Inferno', 'The Changed Savannah', 'Area 51', 'Mars',
  'Sunny meadow', 'Beach sunset', 'Rainy day', 'Mountain peak', 'Autumn forest'];
/* where the light is in each scene, as fractions of the picture (see photoShadow in 44n) */
const PHOTO_SCENE_SUN = [[0.5, 0.2], [0.5, -0.4], [0.4, -0.1], [0.3, 0.4], [0.5, 0.0], [0.78, 0.2], [0.5, 0.0], [0.5, 0.95], [0.25, 0.2], [0.72, 0.26], [0.8, 0.34],
  [0.84, 0.15], [0.5, 0.52], [0.5, -0.4], [0.5, -0.2], [0.3, 0.45]];
(function(){
  const base = photoBackdrop;
  PHOTO_SCENE_NAMES.forEach(function(nm, i){ PHOTO_BG.push(nm); PHOTO_SUN.push(PHOTO_SCENE_SUN[i]); });
  photoBackdrop = function(c, W, H, n){
    if (n < 5 || !PHOTO_SCENES[n - 5]) return base(c, W, H, n);
    c.save();
    try { const R = miniRng(900 + n * 17); PHOTO_SCENES[n - 5](c, W, H, R, photoTools(c, W, H, R)); } finally { c.restore(); }
  };
})();
