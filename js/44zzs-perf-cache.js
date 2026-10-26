'use strict';
/* Cheaper drawing for slow devices. */
/* ========================= 44zzs. SHADOW CACHE ========================= */
/* softShadow() (36i-lighting.js) is called for every creature, ant, prop and the giraffe on every frame, and each call builds two
   color strings and fills two ellipses. Here the pair of ellipses is painted once into a small offscreen picture per size, offset,
   darkness and sun color (sizes rounded to a quarter pixel, offsets to a half, darkness to a hundredth: nobody can see that), and the picture is drawn instead.
   The picture is made at the screen's scale, so the edges stay as soft as before. The cache is emptied when the sun color or the
   scale changes, and when it grows past SHADOW_MAX pictures. Anything the cache cannot take (a huge shadow, effects off) goes the old way. */
const SHADOW_MAX = 420;
const ShadowCache = (function(){
  const base = softShadow;
  let map = new Map(), forRGB = '', forSc = 0, on = true;
  const stats = { drawn: 0, built: 0, live: 0 };
  function q2(v){ return Math.round(v * 2); }
  function build(rx, ry, ox, oy, sa, sc){
    const bx0 = Math.min(ox - rx * 1.3, ox * 0.4 - rx) - 2, bx1 = Math.max(ox + rx * 1.3, ox * 0.4 + rx) + 2;
    const by0 = Math.min(oy - ry * 1.3, oy * 0.4 - ry) - 2, by1 = Math.max(oy + ry * 1.3, oy * 0.4 + ry) + 2;
    const cv = document.createElement('canvas');
    cv.width = Math.max(2, Math.ceil((bx1 - bx0) * sc)); cv.height = Math.max(2, Math.ceil((by1 - by0) * sc));
    const c = cv.getContext('2d');
    c.setTransform(sc, 0, 0, sc, -bx0 * sc, -by0 * sc);
    c.fillStyle = 'rgba(' + Light.shRGB + ',' + (sa * 0.4).toFixed(3) + ')';
    c.beginPath(); c.ellipse(ox, oy, rx * 1.3, ry * 1.3, 0, 0, TAU); c.fill();
    c.fillStyle = 'rgba(' + Light.shRGB + ',' + sa.toFixed(3) + ')';
    c.beginPath(); c.ellipse(ox * 0.4, oy * 0.4, rx, ry, 0, 0, TAU); c.fill();
    stats.built++;
    return { cv: cv, x: bx0, y: by0, w: cv.width / sc, h: cv.height / sc };
  }
  function draw(ctx, x, y, rx, ry, a, h){
    if (!on || !Light.on || rx > 160 || ry > 160 || !(rx > 0) || !(ry > 0)){ stats.live++; return base(ctx, x, y, rx, ry, a, h); }
    const off = (h === undefined ? ry : h) * Light.shLen * 0.9;
    const sc = Math.max(0.5, Math.min(3, Math.round(G.zoom * G.dpr * 4) / 4));
    if (Light.shRGB !== forRGB || sc !== forSc || map.size > SHADOW_MAX){ map = new Map(); forRGB = Light.shRGB; forSc = sc; }
    const rxq = Math.round(rx * 4), ryq = Math.round(ry * 4), oxq = q2(Light.shx * off), oyq = q2(Light.shy * off * 0.6), saq = Math.round(a * Light.shA * 100);
    if (rxq > 1023 || ryq > 1023 || oxq < -512 || oxq > 511 || oyq < -512 || oyq > 511 || saq > 127 || saq < 0){ stats.live++; return base(ctx, x, y, rx, ry, a, h); }
    const key = (((rxq * 1024 + ryq) * 1024 + oxq + 512) * 1024 + oyq + 512) * 128 + saq;
    let s = map.get(key);
    if (s === undefined){ s = build(rxq / 4, ryq / 4, oxq / 2, oyq / 2, saq / 100, sc); map.set(key, s); }
    ctx.drawImage(s.cv, x + s.x, y + s.y, s.w, s.h);
    stats.drawn++;
  }
  return { draw: draw, stats: stats, get on(){ return on; }, set on(v){ on = !!v; }, size: function(){ return map.size; }, clear: function(){ map = new Map(); } };
})();
softShadow = ShadowCache.draw;

/* The dark rim round the giraffe is a blurred shadow behind every shape she is drawn with, one of the dearest things on the screen.
   Once the slow-device governor has had to lower the sharpness (js/44c-perf.js), the rim goes first. */
(function(){
  const rim = giraffeRim;
  giraffeRim = function(){
    if (typeof Perf !== 'undefined' && Perf.idx >= 2) return null;
    return rim.apply(this, arguments);
  };
})();
