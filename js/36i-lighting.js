'use strict';
/* Lighting: per-chapter colour grade, the sun and soft shadows, light pools around bright things, sun shafts and caustics. */
/* ========================= LIGHTING ========================= */
/* Everything here only reads game state. Settings.fxLevel: 0 turns it all off, 1 keeps the grade, soft shadows and light
   pools, 2 adds sun shafts, caustics and the extra glow passes.
   Light.update(dt, ch, S) runs from Atmos.update; Light.screen(...) runs from Atmos.draw; Light.pools(ctx) runs inside the
   world transform from render(); softShadow(...) replaces the flat black ellipses under creatures and scenery. */
const GRADE = {
  /* tint: soft-light colour laid over the whole frame; vig: tinted vignette; shadow: shadow colour; sun: where the light comes
     from (radians, -PI/2 is straight up the screen); shafts / caustics: light bands; glow: how strongly bright things glow */
  1:  { tint: [255, 186, 104, 0.36], vig: [70, 30, 6, 0.22],   shadow: [34, 22, 10], sun: -2.35, shafts: [255, 238, 176, 0.075], glow: 0.7 },
  2:  { tint: [130, 190, 255, 0.36], vig: [8, 30, 62, 0.24],   shadow: [22, 40, 66], sun: -2.5,  shafts: [235, 246, 255, 0.05],  glow: 0.8 },
  3:  { tint: [130, 190, 80, 0.40],  vig: [10, 30, 6, 0.30],   shadow: [14, 26, 8],  sun: -2.0,  shafts: [200, 240, 150, 0.06],  glow: 1.0 },
  4:  { tint: [30, 140, 220, 0.44],  vig: [0, 20, 48, 0.32],   shadow: [0, 22, 44],  sun: -1.57, shafts: [140, 220, 255, 0.07], caustics: 0.11, glow: 1.2 },
  5:  { tint: [80, 190, 60, 0.38],   vig: [4, 28, 6, 0.32],    shadow: [8, 28, 10],  sun: -2.1,  shafts: [230, 255, 170, 0.10],  glow: 0.9 },
  6:  { tint: [255, 140, 96, 0.28],  vig: [34, 20, 34, 0.26],  shadow: [24, 18, 30], sun: -2.65, glow: 1.2 },
  7:  { tint: [96, 140, 255, 0.32],  vig: [4, 10, 44, 0.30],   shadow: [8, 12, 38],  sun: -2.2,  glow: 1.3 },
  8:  { tint: [140, 160, 255, 0.26], vig: [0, 0, 20, 0.36],    shadow: [2, 4, 22],   sun: -0.9,  glow: 1.5 },
  9:  { tint: [255, 206, 70, 0.40],  vig: [66, 36, 0, 0.30],   shadow: [44, 26, 0],  sun: -2.0,  glow: 1.2, k: 0.62 },
  10: { tint: [255, 84, 28, 0.42],   vig: [76, 10, 0, 0.30],   shadow: [34, 4, 0],   sun: -1.57, glow: 1.7, k: 0.55 },
  11: { tint: [186, 116, 255, 0.36], vig: [32, 6, 54, 0.30],   shadow: [28, 10, 44], sun: -2.3,  shafts: [220, 170, 255, 0.06], glow: 1.2 },
  12: { tint: [80, 190, 230, 0.28],  vig: [0, 16, 32, 0.30],   shadow: [4, 16, 30],  sun: -2.0,  glow: 1.3 },
  13: { tint: [255, 116, 66, 0.36],  vig: [66, 16, 4, 0.32],   shadow: [44, 12, 4],  sun: -2.4,  glow: 1.0 },
  14: { tint: [120, 200, 255, 0.34], vig: [6, 24, 48, 0.30],   shadow: [14, 34, 58], sun: -2.3,  shafts: [255, 246, 200, 0.07], glow: 1.1 },
  15: { tint: [255, 224, 170, 0.20], vig: [10, 8, 24, 0.34],   shadow: [16, 12, 30], sun: -1.9,  glow: 1.0 }
};

/* things that give off light: colour, radius and where on the prop the light sits */
const PROP_LIGHT = {
  ct_lamp:      { r: 120, c: [255, 214, 140], a: 0.55, dy: -26 },
  sc_flood:     { r: 130, c: [220, 235, 255], a: 0.5,  dy: -16 },
  sv_crystals:  { r: 70,  c: [90, 230, 210],  a: 0.4,  dy: -8 },
  sv_geode:     { r: 56,  c: [200, 130, 255], a: 0.35, dy: -4 },
  vn_fumarole:  { r: 80,  c: [255, 190, 70],  a: 0.4,  dy: -6 },
  oc_vent:      { r: 90,  c: [90, 230, 255],  a: 0.45, dy: -6 },
  in_crust:     { r: 110, c: [255, 100, 30],  a: 0.5,  dy: 0 },
  in_spire:     { r: 70,  c: [255, 110, 40],  a: 0.3,  dy: -14 },
  in_cooled:    { r: 150, c: [255, 90, 30],   a: 0.4,  dy: 0 },
  a5_sign:      { r: 60,  c: [150, 255, 120], a: 0.4,  dy: -10 },
  mn_lander:    { r: 120, c: [255, 240, 200], a: 0.35, dy: -10 }
};
/* hurt zones glow in their own colour so they read from a distance */
const ZONE_LIGHT = { in_lavaseam: [255, 96, 28], vn_acid: [170, 235, 60] };

const _colCache = {};
function colRGB(s){
  if (!s) return [255, 220, 160];
  if (typeof s !== 'string') return s;
  const hit = _colCache[s]; if (hit) return hit;
  let r = 255, g = 220, b = 160, m;
  if (s.charAt(0) === '#'){
    let h = s.slice(1);
    if (h.length === 3) h = h.charAt(0) + h.charAt(0) + h.charAt(1) + h.charAt(1) + h.charAt(2) + h.charAt(2);
    const n = parseInt(h.slice(0, 6), 16);
    if (!isNaN(n)){ r = (n >> 16) & 255; g = (n >> 8) & 255; b = n & 255; }
  } else if ((m = /^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/.exec(s))){ r = +m[1]; g = +m[2]; b = +m[3]; }
  return (_colCache[s] = [r, g, b]);
}

/* a soft round light, white-hot in the middle, cached per (quantised) colour */
const _lightSprites = {};
function lightSprite(rgb){
  const r = rgb[0] >> 4 << 4, g = rgb[1] >> 4 << 4, b = rgb[2] >> 4 << 4, k = (r >> 4 & 15) << 8 | (g >> 4 & 15) << 4 | (b >> 4 & 15);      /* a number, not text: this runs for every light on every frame */
  let c = _lightSprites[k]; if (c) return c;
  c = document.createElement('canvas'); c.width = c.height = 64;
  const x = c.getContext('2d'), gr = x.createRadialGradient(32, 32, 0, 32, 32, 32);
  gr.addColorStop(0, 'rgba(255,255,255,0.95)');
  gr.addColorStop(0.18, 'rgba(' + Math.min(255, r + 70) + ',' + Math.min(255, g + 70) + ',' + Math.min(255, b + 70) + ',0.7)');
  gr.addColorStop(0.5, 'rgba(' + r + ',' + g + ',' + b + ',0.28)');
  gr.addColorStop(1, 'rgba(' + r + ',' + g + ',' + b + ',0)');
  x.fillStyle = gr; x.fillRect(0, 0, 64, 64);
  return (_lightSprites[k] = c);
}

/* tileable caustic web for the ocean: bright ridges where two warped sine waves cross zero */
let _causticPat = null;
function causticPattern(ctx){
  if (_causticPat !== null) return _causticPat || null;
  try {
    const N = 192, c = document.createElement('canvas'); c.width = c.height = N;
    const x = c.getContext('2d'), im = x.createImageData(N, N), d = im.data;
    for (let j = 0; j < N; j++) for (let i = 0; i < N; i++){
      const u = i / N * TAU, v = j / N * TAU;
      const s = (Math.sin(u * 3 + 1.7 * Math.sin(v * 2)) + Math.sin(v * 3 + 1.7 * Math.sin(u * 2))) * 0.5;
      const w = Math.pow(1 - Math.abs(s), 9), o = (j * N + i) * 4;
      d[o] = 190; d[o + 1] = 245; d[o + 2] = 255; d[o + 3] = Math.min(255, w * 330);
    }
    x.putImageData(im, 0, 0);
    _causticPat = ctx.createPattern(c, 'repeat') || false;
  } catch (e) { _causticPat = false; }
  return _causticPat || null;
}

const Light = {
  on: true, ch: 1, g: GRADE[1], sun: -2.35, shx: 0.7, shy: 0.7, shLen: 1, shA: 1, shRGB: '22,15,8', dark: 0, glowK: 0.7,
  /* where in its day/night cycle this chapter is (0 dawn .. 1 dusk), or null for chapters with a fixed sky */
  todFrac(ch){
    const A = (typeof ATMOS !== 'undefined' && ATMOS[ch]) || null;
    if (!A || !A.cycle || G.attract) return null;
    const cw = G.wave > 0 ? chapterWaveOf(G.wave) : 3;
    return clamp((cw - 1) / (chapterLen(chapterOf(G.wave)) - 1), 0, 1);
  },
  update(dt, ch, S){
    this.on = fxLevelNow() > 0;
    if (!this.on) return;
    const g = GRADE[ch] || GRADE[1];
    this.ch = ch; this.g = g;
    let sunT = g.sun, lenT = 1;
    const f = this.todFrac(ch);
    if (f !== null){                                        /* the sun walks across the sky over the chapter's 25 waves */
      sunT = Math.PI + f * Math.PI;
      lenT = 0.7 + 0.95 * Math.pow(Math.abs(2 * f - 1), 1.5);
    }
    const dd = angDiff(sunT, this.sun), step = Math.max(dt, 0.001) * 0.9;
    this.sun += clamp(dd, -step, step);
    this.shLen += (lenT - this.shLen) * Math.min(1, dt * 1.5);
    this.shx = -Math.cos(this.sun); this.shy = -Math.sin(this.sun);
    this.dark = S ? S.dark || 0 : 0;
    this.shA = clamp(1 - this.dark * 1.3, 0.3, 1);
    this.shRGB = g.shadow[0] + ',' + g.shadow[1] + ',' + g.shadow[2];
    this.glowK = clamp(0.55 + this.dark * 2.4 + (g.glow - 1) * 0.35, 0.4, 1.7);
  },

  /* ---- screen space: grade, tinted vignette, sun shafts, caustics ---- */
  screen(ctx, cx, cy, ox, oy, S){
    if (!this.on) return;
    const W = G.W, H = G.H, g = this.g, fx = fxLevelNow(), t = G.time;
    /* colour grade: soft-light keeps contrast and pushes the palette toward the chapter's mood */
    ctx.save();
    ctx.globalCompositeOperation = 'soft-light';
    ctx.fillStyle = 'rgba(' + g.tint[0] + ',' + g.tint[1] + ',' + g.tint[2] + ',' + (g.tint[3] * (g.k === undefined ? 0.82 : g.k)).toFixed(3) + ')';
    ctx.fillRect(0, 0, W, H);
    /* the sun side is a touch brighter, the far side a touch darker */
    const dx = Math.cos(this.sun) * Math.max(W, H) * 0.6, dy = Math.sin(this.sun) * Math.max(W, H) * 0.6;
    const lg = ctx.createLinearGradient(W / 2 + dx, H / 2 + dy, W / 2 - dx, H / 2 - dy);
    lg.addColorStop(0, 'rgba(255,255,255,0.20)'); lg.addColorStop(0.5, 'rgba(128,128,128,0)'); lg.addColorStop(1, 'rgba(0,0,0,0.20)');
    ctx.fillStyle = lg; ctx.fillRect(0, 0, W, H);
    ctx.restore();
    if (G.state === 'menu') return;                      /* the menu keeps just its own light edge */
    /* a tinted vignette on top of the neutral one */
    const r =hyp(W, H) * 0.5, vg = ctx.createRadialGradient(W / 2, H / 2, r * 0.45, W / 2, H / 2, r);
    vg.addColorStop(0, 'rgba(' + g.vig[0] + ',' + g.vig[1] + ',' + g.vig[2] + ',0)');
    vg.addColorStop(1, 'rgba(' + g.vig[0] + ',' + g.vig[1] + ',' + g.vig[2] + ',' + g.vig[3] + ')');
    ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);
    if (fx < 2) return;
    /* sun shafts: broad soft bands drifting slowly, fainter as the day goes dark */
    const day = clamp(1 - this.dark * 2.4, 0, 1);
    if (g.shafts && day > 0.05){
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      ctx.translate(W / 2, H / 2); ctx.rotate(this.sun + Math.PI / 2 + 0.05);
      const span = hyp(W, H), n = 5;
      for (let i = 0; i < n; i++){
        const ph = i * 1.7, w = 70 + (i * 41) % 90;
        const off = ((i + 0.5) / n - 0.5) * span * 1.15 + Math.sin(t * 0.08 + ph) * 50 - (cx * G.zoom * 0.12) % 140;
        const a = g.shafts[3] * (0.65 + 0.35 * Math.sin(t * 0.35 + ph)) * day;
        const gr = ctx.createLinearGradient(off - w, 0, off + w, 0);
        const col = g.shafts[0] + ',' + g.shafts[1] + ',' + g.shafts[2];
        gr.addColorStop(0, 'rgba(' + col + ',0)'); gr.addColorStop(0.5, 'rgba(' + col + ',' + a.toFixed(3) + ')'); gr.addColorStop(1, 'rgba(' + col + ',0)');
        ctx.fillStyle = gr; ctx.fillRect(off - w, -span, w * 2, span * 2);
      }
      ctx.restore();
    }
    /* underwater caustics: two drifting copies of the web, the second larger and slower */
    if (g.caustics){
      const pat = causticPattern(ctx);
      if (pat){
        ctx.save(); ctx.globalCompositeOperation = 'lighter';
        ctx.fillStyle = pat;
        for (let pass = 0; pass < 2; pass++){
          ctx.save();
          const sc = pass ? 1.55 : 1, sp = pass ? -9 : 14;
          ctx.translate(-(cx * G.zoom * 0.55) % 192 + t * sp, -(cy * G.zoom * 0.55) % 192 + t * sp * 0.6);
          ctx.scale(sc, sc);
          ctx.globalAlpha = g.caustics * (pass ? 0.7 : 1) * (0.8 + 0.2 * Math.sin(t * 0.9 + pass));
          ctx.fillRect(-400, -400, (W + 800) / sc, (H + 800) / sc);
          ctx.restore();
        }
        ctx.restore();
      }
    }
  },

  /* ---- world space: additive light pools around everything that is bright ---- */
  pools(ctx){
    if (!this.on) return;
    const fx = fxLevelNow(), K = this.glowK, t = G.time;
    const cx = G.camX, cy = G.camY, vw = G.W / G.zoom, vh = G.H / G.zoom;
    const x0 = cx - vw / 2 - 120, x1 = cx + vw / 2 + 120, y0 = cy - vh / 2 - 120, y1 = cy + vh / 2 + 120;
    let n = 0; const cap = fx >= 2 ? 90 : 42;
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    const put = function(x, y, r, rgb, a){
      if (n >= cap || a <= 0.01 || x < x0 - r || x > x1 + r || y < y0 - r || y > y1 + r) return;
      n++; ctx.globalAlpha = a > 1 ? 1 : a;
      ctx.drawImage(lightSprite(rgb), x - r, y - r, r * 2, r * 2);
    };
    /* the giraffe carries a little light of its own, which matters most after dark */
    put(P.x, P.y, 170 + this.dark * 120, [255, 214, 150], 0.10 * K + this.dark * 0.35);
    let i;
    const ps = G.projectiles;
    for (i = 0; i < ps.length; i++){ const p = ps[i]; put(p.x, p.y, p.r * 5 + 16, colRGB(p.color), 0.55 * K); }
    const ep = G.eproj;
    for (i = 0; i < ep.length; i++){ const p = ep[i]; put(p.x, p.y, p.r * 4.5 + 12, colRGB(p.color), 0.5 * K); }
    const bl = G.bolts;
    for (i = 0; i < bl.length; i++){
      const b = bl[i], a = b.life / b.max, c = colRGB(b.color);
      for (let k = 0; k < b.pts.length; k++) put(b.pts[k].x, b.pts[k].y, 46, c, 0.5 * a * K);
    }
    const es = G.enemies;
    for (i = 0; i < es.length && n < cap; i++){
      const e = es[i];
      if (e.burnT > 0) put(e.x, e.y, e.r * 2.6 + 24, [255, 140, 50], (0.5 + 0.1 * Math.sin(t * 18 + i)) * K);
      else if (e.big) put(e.x, e.y, e.r * 3.2, colRGB(e.def.color), 0.22 * K);
    }
    const pk = G.pickups;
    for (i = 0; i < pk.length; i++){
      const p = pk[i], c = PICKUP_LIGHT[p.type] || [255, 230, 160];
      put(p.x, p.y, 32 + 4 * Math.sin(t * 5 + p.bob), c, 0.6 * K * (p.life < 3 ? p.life / 3 : 1));
    }
    const zs = G.zones;
    for (i = 0; i < zs.length; i++){ const z = zs[i], rr = z.grow ? z.r0 : z.r; put(z.x, z.y, rr * 1.35, colRGB(z.color), 0.2 * K * Math.min(1, z.life / 0.6)); }
    /* scenery that glows: lamps, vents, lava, crystals */
    if (SCEN.ch){
      const pr = SCEN.props;
      for (i = 0; i < pr.length && n < cap; i++){
        const p = pr[i], L = PROP_LIGHT[p.def.id]; if (!L) continue;
        put(p.x, p.y + L.dy * p.s, L.r * p.s, L.c, L.a * K * (0.85 + 0.15 * Math.sin(t * 2.2 + p.seed * 20)));
      }
      const zn = SCEN.zones;
      for (i = 0; i < zn.length && n < cap; i++){
        const z = zn[i], c = ZONE_LIGHT[z.def.id]; if (!c) continue;
        put(z.x, z.y, z.rx * 1.5, c, 0.4 * K * (0.8 + 0.2 * Math.sin(t * 3 + z.seed * 9)));
      }
    }
    ctx.restore();
  }
};
const PICKUP_LIGHT = { heart: [255, 110, 110], gold: [255, 208, 90], gem: [110, 230, 255], nova: [255, 244, 200], sulfur: [255, 224, 70], basalt: [160, 170, 190], iron: [255, 130, 80], grub: [232, 216, 160] };

/* A soft ground shadow: a wide soft cast shadow thrown away from the sun plus a tight contact shadow at the feet.
   h is how tall the thing is (it sets how far the shadow is thrown). Falls back to a plain ellipse when effects are off. */
function softShadow(ctx, x, y, rx, ry, a, h){
  if (!Light.on){
    ctx.fillStyle = 'rgba(22,15,10,' + a + ')';
    ctx.beginPath(); ctx.ellipse(x, y, rx, ry, 0, 0, TAU); ctx.fill();
    return;
  }
  const off = (h === undefined ? ry : h) * Light.shLen * 0.9, ox = Light.shx * off, oy = Light.shy * off * 0.6, sa = a * Light.shA;
  ctx.fillStyle = 'rgba(' + Light.shRGB + ',' + (sa * 0.4).toFixed(3) + ')';
  ctx.beginPath(); ctx.ellipse(x + ox, y + oy, rx * 1.3, ry * 1.3, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = 'rgba(' + Light.shRGB + ',' + sa.toFixed(3) + ')';
  ctx.beginPath(); ctx.ellipse(x + ox * 0.4, y + oy * 0.4, rx, ry, 0, 0, TAU); ctx.fill();
}
