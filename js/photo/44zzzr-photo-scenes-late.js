'use strict';
/* =============================================================================================================================
   44zzzr-photo-scenes-late.js  --  FIVE MORE BACKDROPS FOR THE PHOTO STUDIO, for the chapters after Mars: the Domes (13.5), the Tower (14), the Siege (15),
   Fort Shortneck (16), and her Camp by the fire. They are added at the end of PHOTO_SCENES (js/photo/44o-photo-scenes.js), as that file asks, so every
   photo code made before them keeps its meaning; the backdrop number of a code is 5 bits, so there is room up to 32.
   ============================================================================================================================= */
(function(){
  PHOTO_SCENES.push(
    /* 21. Chapter 13.5: the Domes */
    function(c, W, H, R, T){
      T.sky(['#9CB8D8', '#C9DCEE', '#EAF2FA']);
      T.glow(W * 0.7, H * 0.2, 240, '255,255,255', 0.5);
      T.hills('#B4C6DA', T.gy - 56, 10, 3, 14);
      [[0.2, 150, 0.8], [0.55, 230, 1], [0.86, 130, 0.7]].forEach(function(d){
        const x = W * d[0], r = d[1], by = T.gy - 4;
        c.fillStyle = 'rgba(210,230,250,.34)'; c.beginPath(); c.arc(x, by, r, Math.PI, 0); c.closePath(); c.fill();
        c.strokeStyle = 'rgba(245,250,255,.8)'; c.lineWidth = 2.4; c.beginPath(); c.arc(x, by, r, Math.PI, 0); c.stroke();
        c.lineWidth = 1.2; c.strokeStyle = 'rgba(230,242,255,.55)';
        for (let k = 1; k < 5; k++){ c.beginPath(); c.ellipse(x, by, r * k / 5, r, 0, Math.PI, 0); c.stroke(); }
        for (let k = 1; k < 4; k++){ c.beginPath(); c.ellipse(x, by, r, r * k / 4, 0, Math.PI, 0); c.stroke(); }
        c.fillStyle = 'rgba(255,255,255,.35)'; c.beginPath(); c.ellipse(x - r * 0.35, by - r * 0.55, r * 0.18, r * 0.07, -0.5, 0, TAU); c.fill();
      });
      T.ground('#DCE8F4'); T.flecks('255,255,255', 0.5, 80, T.gy + 4, H); T.flecks('150,175,210', 0.2, 50, T.gy + 4, H);
      c.fillStyle = 'rgba(160,185,220,.35)'; for (let i = 0; i < 6; i++){ c.beginPath(); c.ellipse(R() * W, T.gy + 12 + R() * (H - T.gy - 20), 40 + R() * 40, 5, 0, 0, TAU); c.fill(); }
      for (let i = 0; i < 40; i++){ c.fillStyle = 'rgba(255,255,255,' + (0.4 + R() * 0.5).toFixed(2) + ')'; c.fillRect(R() * W, R() * T.gy, 2, 2); }
    },
    /* 22. Chapter 14: the Tower */
    function(c, W, H, R, T){
      T.sky(['#1C2848', '#5A5E8C', '#E89A72']);
      T.glow(W * 0.28, T.gy - 20, 320, '255,190,120', 0.5);
      for (let i = 0; i < 12; i++){ const w = 50 + R() * 44, h = 120 + R() * 180, x = i * 84 - 20 + R() * 20; c.fillStyle = i % 2 ? '#262C48' : '#303656'; c.fillRect(x, T.gy - h, w, h); T.windows(x, T.gy - h, w, h, 'rgba(255,214,130,.75)', 0.4); }
      const tx = W * 0.62, tw = 130, th = T.gy - 20;                                      /* the Tower itself: tall glass, a crown, a beacon */
      const g = c.createLinearGradient(tx - tw / 2, 0, tx + tw / 2, 0); g.addColorStop(0, '#2A3A5E'); g.addColorStop(0.5, '#4A6A94'); g.addColorStop(1, '#223250');
      c.fillStyle = g; c.fillRect(tx - tw / 2, 20, tw, th); c.fillRect(tx - tw / 2 + 24, 6, tw - 48, 20); c.fillRect(tx - 4, -20, 8, 30);
      c.strokeStyle = 'rgba(190,220,255,.3)'; c.lineWidth = 1; for (let yy = 40; yy < th; yy += 22){ c.beginPath(); c.moveTo(tx - tw / 2, yy); c.lineTo(tx + tw / 2, yy); c.stroke(); }
      for (let xx = tx - tw / 2 + 26; xx < tx + tw / 2; xx += 26){ c.beginPath(); c.moveTo(xx, 20); c.lineTo(xx, th + 20); c.stroke(); }
      T.windows(tx - tw / 2, 20, tw, th, 'rgba(255,230,160,.8)', 0.35);
      T.glow(tx, -10, 40, '255,70,60', 0.9);
      T.ground('#2A2E3C'); c.fillStyle = 'rgba(255,200,130,.12)'; c.fillRect(0, T.gy, W, 6); T.flecks('255,210,140', 0.16, 60, T.gy + 4, H);
      c.fillStyle = 'rgba(255,200,130,.5)'; for (let i = 0; i < 6; i++) c.fillRect(i * 170 + 40, T.gy + 28 + (i % 2) * 14, 70, 4);
    },
    /* 23. Chapter 15: the Siege */
    function(c, W, H, R, T){
      T.sky(['#3A2A30', '#8A4A38', '#E88A44']);
      T.glow(W * 0.5, T.gy - 40, 380, '255,150,70', 0.55);
      for (let i = 0; i < 5; i++){ c.fillStyle = 'rgba(40,30,34,' + (0.22 + R() * 0.2).toFixed(2) + ')'; c.beginPath(); c.ellipse(W * (0.1 + i * 0.2 + R() * 0.06), 70 + R() * 130, 120 + R() * 80, 30 + R() * 22, 0, 0, TAU); c.fill(); }
      for (let i = 0; i < 8; i++){                                                         /* the town's roofs, one broken */
        const w = 80 + R() * 50, h = 60 + R() * 60, x = i * 126 - 10 + R() * 14;
        c.fillStyle = '#2E2024'; c.fillRect(x, T.gy - h, w, h);
        c.beginPath(); c.moveTo(x - 8, T.gy - h); c.lineTo(x + w / 2 + (i % 3 ? 0 : 14), T.gy - h - 34 - (i % 3 ? 0 : 10)); c.lineTo(x + w + 8, T.gy - h); c.fill();
        if (i % 3 === 0){ T.glow(x + w / 2, T.gy - h - 10, 26, '255,140,50', 0.7); }
        T.windows(x, T.gy - h, w, h, 'rgba(255,170,80,.55)', 0.25);
      }
      T.ground('#4A3A32'); T.flecks('255,190,120', 0.14, 60, T.gy + 4, H); T.flecks('20,10,10', 0.2, 60, T.gy + 4, H);
      c.fillStyle = '#5E4430'; for (let i = 0; i < 6; i++){ const x = 40 + i * 160 + R() * 20; c.save(); c.translate(x, T.gy + 20); c.rotate(-0.1 + (i % 2) * 0.2); c.fillRect(-30, -5, 60, 8); c.fillRect(-26, -13, 6, 14); c.fillRect(20, -13, 6, 14); c.restore(); }
      for (let i = 0; i < 18; i++) T.glow(R() * W, R() * T.gy, 6, '255,170,70', 0.7);
    },
    /* 24. Chapter 16: Fort Shortneck */
    function(c, W, H, R, T){
      T.sky(['#0C1018', '#1E2838', '#3A4658']);
      T.stars(60, 0.7, T.gy * 0.6);
      c.fillStyle = '#2A323E'; c.fillRect(0, T.gy - 150, W, 150);                           /* the wall: slabs, a walkway, a gate */
      c.strokeStyle = 'rgba(0,0,0,.35)'; c.lineWidth = 2; for (let xx = 0; xx < W; xx += 120){ c.beginPath(); c.moveTo(xx, T.gy - 150); c.lineTo(xx, T.gy); c.stroke(); }
      c.fillStyle = '#3A4452'; c.fillRect(0, T.gy - 160, W, 12); for (let xx = 8; xx < W; xx += 38) c.fillRect(xx, T.gy - 176, 22, 16);
      c.fillStyle = '#1A2028'; c.fillRect(W * 0.42, T.gy - 120, 150, 120); c.fillStyle = '#10151B'; for (let xx = W * 0.42 + 10; xx < W * 0.42 + 140; xx += 14) c.fillRect(xx, T.gy - 116, 4, 112);
      [[0.1, 1], [0.9, -1]].forEach(function(t){                                           /* watchtowers with searchlights */
        const x = W * t[0]; c.fillStyle = '#323C4A'; c.fillRect(x - 28, T.gy - 290, 56, 140); c.fillStyle = '#3E4A5A'; c.fillRect(x - 38, T.gy - 304, 76, 18);
        c.fillStyle = '#FFE9A0'; c.fillRect(x - 10, T.gy - 262, 20, 12);
        const g = c.createLinearGradient(x, T.gy - 296, x + t[1] * -280, T.gy - 20); g.addColorStop(0, 'rgba(255,250,210,.5)'); g.addColorStop(1, 'rgba(255,250,210,0)');
        c.fillStyle = g; c.beginPath(); c.moveTo(x, T.gy - 296); c.lineTo(x - t[1] * 150 - 70, T.gy + 20); c.lineTo(x - t[1] * 150 + 90, T.gy + 20); c.closePath(); c.fill();
      });
      T.ground('#262C34'); T.flecks('200,210,225', 0.12, 60, T.gy + 4, H);
      c.fillStyle = 'rgba(255,200,60,.8)'; for (let i = 0; i < 10; i++) c.fillRect(i * 100 + 20, T.gy + 14, 40, 5);        /* hazard stripes */
      c.fillStyle = 'rgba(20,20,20,.9)'; for (let i = 0; i < 10; i++) c.fillRect(i * 100 + 60, T.gy + 14, 40, 5);
    },
    /* 25. Her Camp */
    function(c, W, H, R, T){
      T.sky(['#10182A', '#243448', '#3A4A58']);
      T.stars(90, 0.9, T.gy * 0.7);
      c.fillStyle = '#F4E8B8'; c.beginPath(); c.arc(W * 0.82, 90, 34, 0, TAU); c.fill(); c.fillStyle = '#10182A'; c.beginPath(); c.arc(W * 0.82 + 14, 80, 30, 0, TAU); c.fill();
      T.hills('#1C2A34', T.gy - 90, 22, 1, 14); T.hills('#16221C', T.gy - 40, 14, 4, 12);
      c.fillStyle = '#1E3022'; for (let i = 0; i < 12; i++){ const x = i * 86 + R() * 30, h = 70 + R() * 60; c.beginPath(); c.moveTo(x - 24, T.gy - 20); c.lineTo(x, T.gy - 20 - h); c.lineTo(x + 24, T.gy - 20); c.fill(); }
      T.glow(W * 0.62, T.gy - 20, 340, '255,160,70', 0.5);
      T.ground('#3C3226'); T.flecks('255,190,110', 0.16, 70, T.gy + 4, H);
      const tx = W * 0.14; c.fillStyle = '#B4864A'; c.beginPath(); c.moveTo(tx - 90, T.gy + 6); c.lineTo(tx, T.gy - 120); c.lineTo(tx + 90, T.gy + 6); c.fill();
      c.fillStyle = '#8E6736'; c.beginPath(); c.moveTo(tx, T.gy - 120); c.lineTo(tx + 30, T.gy + 6); c.lineTo(tx + 90, T.gy + 6); c.fill(); c.fillStyle = '#2A1E12'; c.beginPath(); c.moveTo(tx - 22, T.gy + 6); c.lineTo(tx, T.gy - 50); c.lineTo(tx + 14, T.gy + 6); c.fill();
      const fx = W * 0.66, fy = T.gy + 26;                                                 /* the fire */
      c.fillStyle = '#6A6E72'; for (let i = 0; i < 8; i++){ const an = i / 8 * TAU; c.beginPath(); c.ellipse(fx + Math.cos(an) * 40, fy + Math.sin(an) * 9, 9, 6, 0, 0, TAU); c.fill(); }
      c.strokeStyle = '#5A3A1C'; c.lineWidth = 9; c.lineCap = 'round'; c.beginPath(); c.moveTo(fx - 32, fy - 4); c.lineTo(fx + 32, fy - 18); c.moveTo(fx - 32, fy - 18); c.lineTo(fx + 32, fy - 4); c.stroke();
      c.fillStyle = '#FF7A22'; c.beginPath(); c.moveTo(fx, fy - 96); c.bezierCurveTo(fx + 30, fy - 50, fx + 32, fy - 14, fx, fy - 10); c.bezierCurveTo(fx - 32, fy - 14, fx - 30, fy - 50, fx, fy - 96); c.fill();
      c.fillStyle = '#FFC24A'; c.beginPath(); c.moveTo(fx, fy - 62); c.bezierCurveTo(fx + 16, fy - 36, fx + 16, fy - 14, fx, fy - 12); c.bezierCurveTo(fx - 16, fy - 14, fx - 16, fy - 36, fx, fy - 62); c.fill();
      for (let i = 0; i < 14; i++) T.glow(fx + (R() - 0.5) * 90, fy - 70 - R() * 150, 5, '255,190,90', 0.9);
    }
  );
  ['The Domes', 'The Tower', 'The Siege', 'Fort Shortneck', 'Her Camp'].forEach(function(nm, i){ PHOTO_BG.push(nm); PHOTO_SUN.push([[0.7, 0.2], [0.28, 0.8], [0.5, 0.85], [0.5, -0.4], [0.66, 0.9]][i]); });
})();
