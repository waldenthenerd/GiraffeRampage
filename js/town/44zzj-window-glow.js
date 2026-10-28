'use strict';
/* =============================================================================================================================
   44zzj-window-glow.js  --  Lit windows at night only where the glass can be seen.
   Every building records its windows in D._win as it paints them, and the engine used to flood each recorded box with yellow after dark.
   That lit the awnings, columns, signs and props that stand in front of a window, and mullions and curtains too. Now the field painter
   (townPaintField) keeps a copy of each window's pixels at the moment it is recorded and compares it with the finished street: only
   pixels that are still glass get the glow. A window that is mostly covered (less than a fifth of its glass left) gets none.
   The glow itself is drawn by townDrawWindows (44w) straight after the street and before townDynamic (which draws the roaming herd), the herd and the player, so nobody wades through a yellow box.
   ============================================================================================================================= */
(function(){
  const tpf = townPaintField;
  let cur = null;
  const near = function(a, b, i){ return Math.abs(a[i] - b[i]) <= 8 && Math.abs(a[i + 1] - b[i + 1]) <= 8 && Math.abs(a[i + 2] - b[i + 2]) <= 8; };
  function snap(c, w){
    try {
      const t = c.getTransform(); if (t.b || t.c || !t.a || !t.d) return;
      const x = Math.max(0, Math.floor(w.x * t.a + t.e)), y = Math.max(0, Math.floor(w.y * t.d + t.f));
      const ww = Math.min(c.canvas.width - x, Math.ceil(w.w * t.a)), hh = Math.min(c.canvas.height - y, Math.ceil(w.h * t.d));
      if (ww < 1 || hh < 1) return;
      w._s = { x: x, y: y, w: ww, h: hh, d: c.getImageData(x, y, ww, hh).data };
    } catch (e) {}
  }
  function finish(c, list){
    list.forEach(function(w){
      const s = w._s; delete w._s; if (!s) return;
      try {
        const now = c.getImageData(s.x, s.y, s.w, s.h).data, out = c.createImageData ? c.createImageData(s.w, s.h) : null; if (!out) return;
        let n = 0;
        const r = s.w / 2;
        for (let i = 0; i < now.length; i += 4){
          if (w.arch){ const px = (i / 4) % s.w, py = Math.floor(i / 4 / s.w); if (py < r && (px + 0.5 - r) * (px + 0.5 - r) + (py + 0.5 - r) * (py + 0.5 - r) > r * r) continue; }      /* the corners above an arch are wall */
          if (near(now, s.d, i) && now[i + 3] > 200){ out.data[i] = 255; out.data[i + 1] = 214; out.data[i + 2] = 120; out.data[i + 3] = 255; n++; }
        }
        w.cov = n / (s.w * s.h);
        if (n < s.w * s.h * 0.2){ w.hide = true; return; }                       /* covered: no glow */
        const cv = document.createElement('canvas'); cv.width = s.w; cv.height = s.h; const g = cv.getContext('2d'); g.putImageData(out, 0, 0);
        if (w.round || w.poly){                                                  /* a window that is not a box: keep only what is inside its outline */
          g.globalCompositeOperation = 'destination-in'; g.fillStyle = '#000'; g.beginPath();
          if (w.round) g.ellipse(s.w / 2, s.h / 2, s.w / 2, s.h / 2, 0, 0, Math.PI * 2);
          else w.poly.forEach(function(q, k){ if (k) g.lineTo(q[0] * s.w, q[1] * s.h); else g.moveTo(q[0] * s.w, q[1] * s.h); });
          g.fill();
        }
        w.cv = cv;
      } catch (e) {}
    });
  }
  townPaintField = function(c, D, W, H, R){
    cur = c; let arr = [];
    const mk = function(){
      arr = [];
      arr.push = function(){ for (let i = 0; i < arguments.length; i++) snap(cur, arguments[i]); return Array.prototype.push.apply(arr, arguments); };
    };
    mk();
    try { Object.defineProperty(D, '_win', { configurable: true, enumerable: true, get: function(){ return arr; }, set: function(){ mk(); } }); } catch (e) {}
    try { tpf(c, D, W, H, R); }
    finally {
      const list = arr.slice(); Object.defineProperty(D, '_win', { configurable: true, enumerable: true, writable: true, value: list });
      cur = null; finish(c, list);
    }
  };
  /* each window draws only its visible glass; one with no copy (a painter that records outside townPaintField) draws the plain box */
  townDrawWindows = function(ctx, D, dark){
    const a = D.indoor ? 0.55 : D.cave ? 0.9 : D.fixedDusk ? 0.75 : dark;
    if (a <= 0.03 || !D._win) return;
    ctx.save();
    D._win.forEach(function(w){
      if (w.hide) return;
      if (w.cv){ ctx.globalAlpha = a * 0.85; ctx.drawImage(w.cv, w.x, w.y, w.w, w.h); }
      else { ctx.fillStyle = 'rgba(255,214,120,' + (a * 0.85).toFixed(2) + ')'; ctx.fillRect(w.x, w.y, w.w, w.h); }
    });
    ctx.restore();
  };
})();
