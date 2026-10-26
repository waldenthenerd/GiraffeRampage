'use strict';
/* =============================================================================================================================
   36o-cloud-fronts.js  --  WEATHER THAT ARRIVES. 36j chooses the next weather event 16 seconds ahead (WxE.pend) and eases it in over 14
   seconds; this file gives that wait a sky. A bank of clouds drifts across the screen, thickening as the front nears (WxE.front, 0 to 1),
   dimming the ground under their shadows and tinting it in the color of what is coming (gray for rain, tan for a sandstorm, white for a
   blizzard, green for acid). Rain, snow and the rest then build from a few drops to a full fall, and ease off again while the clouds linger.
   In the calm between events a few thin, pale clouds still drift (the chapters with an open sky only), so the sky is never quite still.
   Drawn as soft shadows over the ground, at the Visual effects setting "medium" and "high" (off = nothing). Purely visual.
   ============================================================================================================================= */
(function(){
  const SKYLESS = { 7: 1, 8: 1 };                                       /* the space center and the moon have no clouds */
  const AMBIENT = { 1: 1, 2: 1, 3: 1, 5: 1, 6: 1, 11: 1, 12: 1 };        /* the chapters with an open sky, for the thin calm-weather clouds */
  const CL = { list: [], sprites: [], t: 0, ch: 0, wind: 1, rgb: [70, 80, 100], want: 0, amb: 0 };
  function sprite(seed){
    const W = 260, H = 160, cv = document.createElement('canvas'); cv.width = W; cv.height = H; const g = cv.getContext('2d'), r = miniRng(seed * 977 + 5);
    for (let i = 0; i < 11; i++){
      const rad = 24 + r() * 26, x = rad + 2 + r() * (W - 2 * rad - 4), y = rad * 0.8 + 2 + r() * (H - rad * 1.6 - 4), gr = g.createRadialGradient(x, y, 2, x, y, rad);
      gr.addColorStop(0, 'rgba(255,255,255,.55)'); gr.addColorStop(0.55, 'rgba(255,255,255,.22)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
      g.fillStyle = gr; g.beginPath(); g.arc(x, y, rad, 0, Math.PI * 2); g.fill();
    }
    return cv;
  }
  function tinted(sp, rgb, key){                                          /* the sprite in the front's color, kept for reuse */
    sp._t = sp._t || {}; if (sp._t[key]) return sp._t[key];
    const c = document.createElement('canvas'); c.width = sp.width; c.height = sp.height; const g = c.getContext('2d');
    g.drawImage(sp, 0, 0); g.globalCompositeOperation = 'source-in'; g.fillStyle = 'rgb(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ')'; g.fillRect(0, 0, c.width, c.height);
    sp._t[key] = c; return c;
  }
  function seed(W, H){
    CL.sprites = [sprite(1), sprite(2), sprite(3)];
    CL.list.length = 0;
    for (let i = 0; i < 9; i++) CL.list.push({ x: Math.random() * (W + 600) - 300, y: Math.random() * (H + 200) - 100, s: 1.1 + Math.random() * 1.5, sp: Math.floor(Math.random() * 3), v: 0.7 + Math.random() * 0.6, thin: i % 3 === 0 });
  }
  const upd = WxE.update, drw = WxE.draw;
  WxE.update = function(dt, ch, S){
    upd.call(this, dt, ch, S);
    const fx = fxLevelNow();
    if (fx <= 0 || SKYLESS[ch]){ CL.want = 0; CL.amb = 0; return; }
    CL.t += dt; CL.ch = ch;
    const ev = this.cur || this.pend;
    if (ev){ CL.rgb = ev.tint ? [Math.round(ev.tint[0] * 0.5 + 25), Math.round(ev.tint[1] * 0.5 + 28), Math.round(ev.tint[2] * 0.5 + 34)] : [70, 80, 100]; CL.wind = (WEATHER_KINDS[ev.weather] && WEATHER_KINDS[ev.weather].vx < 0) ? -1 : 1; CL.kind = ev.weather; }
    CL.want = this.front;
    CL.amb += (((AMBIENT[ch] && !this.front) ? 1 : 0) - CL.amb) * Math.min(1, dt * 0.4);
    /* the front, as it comes in, also dims the day a little and tints it: the weather's own tint and darkness at half strength */
    if (this.pend && !this.cur && this.front > 0.01){ S.layers.push({ rgb: this.pend.tint, a: this.pend.tint[3] * this.front * 0.45 }); S.dark = Math.max(S.dark, this.pend.dark * this.front * 0.5); }
    else if (!this.cur && this.front > 0.01){ S.layers.push({ rgb: CL.rgb, a: 0.05 * this.front }); }
  };
  WxE.draw = function(ctx, t, S){
    const fx = fxLevelNow();
    if (fx > 0 && !SKYLESS[CL.ch] && (CL.want > 0.01 || CL.amb > 0.01)){
      if (!CL.sprites.length) seed(G.W, G.H);
      const W = G.W, H = G.H, dt = 1 / 60, wind = 14 * CL.wind * (0.5 + CL.want * 1.2);
      ctx.save();
      CL.list.forEach(function(c){
        c.x += wind * c.v * dt * 2.2;                                           /* the drift (a frame's worth: the sky is slow) */
        const sw = 260 * c.s, sh = 160 * c.s;
        if (CL.wind > 0 && c.x > W + 300) c.x = -sw - 100; else if (CL.wind < 0 && c.x < -sw - 300) c.x = W + 100;
        const sx = c.x - (G.camX || 0) * 0.25 % (W + 600), sy = c.y - (G.camY || 0) * 0.2 % (H + 200);
        const px = ((sx % (W + 600)) + (W + 600)) % (W + 600) - 300, py = ((sy % (H + 200)) + (H + 200)) % (H + 200) - 100;
        ctx.globalAlpha = c.thin ? Math.min(0.4, CL.amb * 0.12 + CL.want * 0.22) : Math.min(0.5, CL.want * 0.34 + CL.amb * 0.05);
        if (ctx.globalAlpha < 0.004) return;
        const spr = tinted(CL.sprites[c.sp], CL.want > 0.02 ? CL.rgb : [40, 50, 70], CL.want > 0.02 ? CL.rgb.join() : 'amb');
        ctx.drawImage(spr, px, py, sw, sh);
      });
      ctx.restore();
    }
    drw.call(this, ctx, t, S);
  };
})();
