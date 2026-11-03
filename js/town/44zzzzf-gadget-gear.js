'use strict';
/* ========================= 44zzzzf. WHAT THE GADGETS DO OUTSIDE THE TOWN ========================= */
/* Camera (Volt & Co., js/town/44zzzzc-gadgets.js): the Frame Kit adds three frames to the Photo booth (Gold, Hearts, Circuit: places 8 to 10 of the 4-bit
   frame in a photo code) and the Studio Pro Camera three filters (Neon, Thermal, Dream: places 5 to 7 of the 3-bit filter). They are chosen in the
   "Look and light" tab like the others; a picture that uses one still draws and is still read from its code by anybody (only choosing needs the kit).
   Torch and Night Goggles: GADLIGHT.k is how much further her own light reaches in the dark of a run (js/render/36-atmosphere.js, drawNight), and the
   goggles make the night paler and wash it faintly green. */
PHOTO_FILTERS.push('Neon', 'Thermal', 'Dream');
PHOTO_FRAMES.push('Gold', 'Hearts', 'Circuit');
const GAD_PHOTO_NEED = { filter: 2, frame: 1 };          /* the camera tier that opens the new places */
function gadPhotoOpen(kind, i){ return i < (kind === 'filter' ? 5 : 8) || gadTier('cam') >= GAD_PHOTO_NEED[kind]; }
(function(){
  const clamp8 = function(v){ return v < 0 ? 0 : v > 255 ? 255 : v; };
  const soft = function(c, W, H, k){                      /* a blurred copy of the picture: small and stretched back */
    const t = document.createElement('canvas'); t.width = Math.max(8, Math.ceil(W / k)); t.height = Math.max(8, Math.ceil(H / k));
    const g = t.getContext('2d'); g.imageSmoothingEnabled = true; g.drawImage(c.canvas, 0, 0, t.width, t.height); return t;
  };
  const FILTER = {
    5: function(c, W, H){                                 /* neon: deeper colours, hard contrast, a glow */
      const d = c.getImageData(0, 0, W, H), p = d.data;
      for (let i = 0; i < p.length; i += 4){
        const l = p[i] * 0.3 + p[i + 1] * 0.59 + p[i + 2] * 0.11;
        let r = l + (p[i] - l) * 2.3, g = l + (p[i + 1] - l) * 2.3, b = l + (p[i + 2] - l) * 2.3;
        r = (r - 128) * 1.25 + 118; g = (g - 128) * 1.25 + 118; b = (b - 128) * 1.25 + 124;
        p[i] = clamp8(r); p[i + 1] = clamp8(g); p[i + 2] = clamp8(b);
      }
      c.putImageData(d, 0, 0);
      c.save(); c.globalCompositeOperation = 'lighter'; c.globalAlpha = 0.38; c.imageSmoothingEnabled = true; c.drawImage(soft(c, W, H, 12), 0, 0, W, H); c.restore();
      c.fillStyle = 'rgba(70,20,120,.14)'; c.fillRect(0, 0, W, H);
    },
    6: function(c, W, H){                                 /* thermal: the light of every pixel becomes a heat colour */
      const d = c.getImageData(0, 0, W, H), p = d.data, ramp = [[0, 12, 0, 40], [0.25, 60, 0, 140], [0.5, 200, 20, 80], [0.72, 255, 120, 10], [0.9, 255, 230, 60], [1, 255, 255, 230]];
      for (let i = 0; i < p.length; i += 4){
        const l = (p[i] * 0.3 + p[i + 1] * 0.59 + p[i + 2] * 0.11) / 255; let k = 1; while (k < ramp.length - 1 && l > ramp[k][0]) k++;
        const a = ramp[k - 1], b = ramp[k], u = (l - a[0]) / Math.max(0.001, b[0] - a[0]);
        p[i] = a[1] + (b[1] - a[1]) * u; p[i + 1] = a[2] + (b[2] - a[2]) * u; p[i + 2] = a[3] + (b[3] - a[3]) * u;
      }
      c.putImageData(d, 0, 0); c.strokeStyle = 'rgba(255,255,255,.35)'; c.lineWidth = Math.max(1, W / 480); const m = W * 0.06;
      [[m, m, 1, 1], [W - m, m, -1, 1], [m, H - m, 1, -1], [W - m, H - m, -1, -1]].forEach(function(q){ c.beginPath(); c.moveTo(q[0], q[1] + q[3] * m * 0.7); c.lineTo(q[0], q[1]); c.lineTo(q[0] + q[2] * m * 0.7, q[1]); c.stroke(); });
    },
    7: function(c, W, H){                                 /* dream: a soft glow, pastel light and a pale haze at the edges */
      const t = soft(c, W, H, 9);
      c.save(); c.globalCompositeOperation = 'screen'; c.globalAlpha = 0.55; c.imageSmoothingEnabled = true; c.drawImage(t, 0, 0, W, H); c.restore();
      const g = c.createLinearGradient(0, 0, W, H); g.addColorStop(0, 'rgba(255,170,220,.20)'); g.addColorStop(0.5, 'rgba(255,255,255,.04)'); g.addColorStop(1, 'rgba(150,190,255,.22)'); c.fillStyle = g; c.fillRect(0, 0, W, H);
      const v = c.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.3, W / 2, H / 2, Math.max(W, H) * 0.72); v.addColorStop(0, 'rgba(255,255,255,0)'); v.addColorStop(1, 'rgba(255,240,250,.55)'); c.fillStyle = v; c.fillRect(0, 0, W, H);
    }
  };
  const FRAME = {
    8: function(c, W, H){                                 /* gold */
      const b = W * 0.04, g = c.createLinearGradient(0, 0, W, H); g.addColorStop(0, '#F6E08A'); g.addColorStop(0.35, '#C99A2E'); g.addColorStop(0.65, '#F0D060'); g.addColorStop(1, '#9A7020');
      c.fillStyle = g; c.fillRect(0, 0, W, b); c.fillRect(0, H - b, W, b); c.fillRect(0, 0, b, H); c.fillRect(W - b, 0, b, H);
      c.strokeStyle = 'rgba(80,50,0,.6)'; c.lineWidth = 2; c.strokeRect(b, b, W - 2 * b, H - 2 * b); c.strokeStyle = 'rgba(255,250,200,.7)'; c.strokeRect(2, 2, W - 4, H - 4);
      [[b * 1.4, b * 1.4], [W - b * 1.4, b * 1.4], [b * 1.4, H - b * 1.4], [W - b * 1.4, H - b * 1.4]].forEach(function(q){ c.fillStyle = '#7A5410'; c.beginPath(); c.arc(q[0], q[1], b * 0.8, 0, TAU); c.fill(); c.fillStyle = '#F6E08A'; c.beginPath(); c.arc(q[0], q[1], b * 0.55, 0, TAU); c.fill(); });
    },
    9: function(c, W, H){                                 /* hearts */
      const b = W * 0.05; c.fillStyle = '#FFC4DA'; c.fillRect(0, 0, W, b); c.fillRect(0, H - b, W, b); c.fillRect(0, 0, b, H); c.fillRect(W - b, 0, b, H);
      const heart = function(x, y, s, col){ c.fillStyle = col; c.beginPath(); c.moveTo(x, y + s * 0.9); c.bezierCurveTo(x - s * 1.7, y - s * 0.1, x - s * 0.8, y - s * 1.2, x, y - s * 0.4); c.bezierCurveTo(x + s * 0.8, y - s * 1.2, x + s * 1.7, y - s * 0.1, x, y + s * 0.9); c.fill(); };
      const cols = ['#E8456A', '#FF7AA2', '#FFFFFF', '#C2285A']; let i = 0;
      for (let x = b; x < W; x += b * 1.6){ heart(x, b / 2, b * 0.3, cols[i++ % 4]); heart(x, H - b / 2, b * 0.3, cols[i++ % 4]); }
      for (let y = b * 2; y < H - b; y += b * 1.6){ heart(b / 2, y, b * 0.3, cols[i++ % 4]); heart(W - b / 2, y, b * 0.3, cols[i++ % 4]); }
      c.strokeStyle = '#E8456A'; c.lineWidth = 2; c.strokeRect(b, b, W - 2 * b, H - 2 * b);
    },
    10: function(c, W, H){                                /* circuit */
      const b = W * 0.05; c.fillStyle = '#0B2A22'; c.fillRect(0, 0, W, b); c.fillRect(0, H - b, W, b); c.fillRect(0, 0, b, H); c.fillRect(W - b, 0, b, H);
      const R = miniRng(41); c.strokeStyle = '#4DE8C0'; c.fillStyle = '#4DE8C0'; c.lineWidth = Math.max(1.5, W / 400); c.lineCap = 'round';
      for (let i = 0; i < 26; i++){
        const side = i % 4, t = R(), x = side < 2 ? t * W : (side === 2 ? b * 0.5 : W - b * 0.5), y = side < 2 ? (side === 0 ? b * 0.5 : H - b * 0.5) : t * H, a = side < 2 ? [0, 1] : [1, 0], L = b * (0.8 + R() * 1.6);
        c.beginPath(); c.moveTo(x, y); c.lineTo(x + a[0] * L, y + a[1] * L); c.lineTo(x + a[0] * L + (a[1] ? L * 0.6 : 0), y + a[1] * L + (a[0] ? L * 0.6 : 0)); c.stroke();
        c.beginPath(); c.arc(x, y, b * 0.13, 0, TAU); c.fill();
      }
      c.strokeStyle = '#4DE8C0'; c.lineWidth = 2; c.strokeRect(b, b, W - 2 * b, H - 2 * b);
    }
  };
  const render = photoRender;
  photoRender = function(cv, ui){
    const f = PHOTO.filter | 0, fr = PHOTO.frame | 0;
    if (!FILTER[f] && !FRAME[fr]) return render(cv, ui);
    const keepF = PHOTO.filter, keepR = PHOTO.frame;
    try { PHOTO.filter = FILTER[f] ? 0 : keepF; PHOTO.frame = FRAME[fr] ? 0 : keepR; render(cv, false); } finally { PHOTO.filter = keepF; PHOTO.frame = keepR; }
    const c = cv.getContext('2d'), W = cv.width, H = cv.height;
    if (FILTER[f]) try { FILTER[f](c, W, H); } catch (e) {}
    if (FRAME[fr]) try { c.save(); FRAME[fr](c, W, H); c.restore(); } catch (e) {}
    if (ui && PHOTO.sel !== -2){
      const b = photoBounds(PHOTO.sel);
      if (b){ c.save(); c.setLineDash([7, 5]); c.lineWidth = 2.4; c.strokeStyle = '#FFD84D'; c.shadowColor = 'rgba(0,0,0,.6)'; c.shadowBlur = 3; c.beginPath(); c.ellipse(b.x, b.y, b.rx, b.ry, 0, 0, TAU); c.stroke(); c.restore(); }
    }
  };
  /* choosing a place that has not been bought is refused; the chips say so */
  const body = photoLookBody;
  photoLookBody = window.photoLookBody = function(){
    let h = body.apply(this, arguments);
    h = h.replace(/<button class="pchip( on)?" data-a="ward-photo-look-(filter|frame)-(\d+)">/g, function(m0, on, kind, i){
      return gadPhotoOpen(kind, +i) ? m0 : '<button class="pchip locked" disabled title="' + (kind === 'filter' ? 'Needs the Studio Pro Camera from Volt &amp; Co.' : 'Needs the Frame Kit from Volt &amp; Co.') + '" data-a="ward-photo-look-' + kind + '-' + i + '">';
    });
    return h;
  };
  const act = photoAction;
  photoAction = function(a){
    const m = /^ward-photo-look-(filter|frame)-(\d+)$/.exec(a);
    if (m && !gadPhotoOpen(m[1], +m[2])){ SFX.deny(); return true; }
    return act(a);
  };
})();

/* ---- the light in a run ---- */
const GADLIGHT = { k: 1 };
function gadLightK(){ return !gadOn('lamp') ? 1 : gadTier('lamp') >= 2 ? 1.7 : 1.35; }
(function(){
  const dn = drawNight;
  drawNight = function(ctx, darkA){
    const goggles = gadOn('lamp') && gadTier('lamp') >= 2;
    GADLIGHT.k = gadLightK();
    const args = Array.prototype.slice.call(arguments); if (goggles) args[1] = darkA * 0.7;
    dn.apply(this, args);
    if (goggles && darkA > 0.04){ ctx.save(); ctx.fillStyle = 'rgba(70,255,140,' + Math.min(0.07, darkA * 0.1).toFixed(3) + ')'; ctx.fillRect(0, 0, G.W, G.H); ctx.restore(); }
  };
})();
