'use strict';
/* Ground textures and the render pass. */
/* ========================= 25. GROUND TEXTURE ========================= */
let groundPattern = null, groundPatternSnow = null, groundPatternSwamp = null, groundPatternOcean = null, groundPatternJungle = null;
function buildGround(){
  const c = document.createElement('canvas');
  c.width = 128; c.height = 128;
  const g = c.getContext('2d');
  if (!g) return;
  g.fillStyle = '#7F6C45'; g.fillRect(0, 0, 128, 128);
  for (let i = 0; i < 150; i++){
    const x = Math.random() * 128, y = Math.random() * 128;
    g.fillStyle = ['#8D7A4E', '#71603D', '#9A8757', '#6A5A39'][(Math.random() * 4) | 0];
    g.fillRect(x, y, 2 + Math.random() * 5, 1 + Math.random() * 3);
  }
  g.strokeStyle = 'rgba(178,158,108,.45)'; g.lineWidth = 1;
  for (let i = 0; i < 40; i++){
    const x = Math.random() * 128, y = Math.random() * 128;
    g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.random() * 5 - 2.5, y - 4 - Math.random() * 5); g.stroke();
  }
  const ctx = CTX;
  if (ctx && ctx.createPattern) groundPattern = ctx.createPattern(c, 'repeat');
}

function buildGroundSnow(){
  const c = document.createElement('canvas');
  c.width = 128; c.height = 128;
  const g = c.getContext('2d');
  if (!g) return;
  g.fillStyle = '#C3D6E0'; g.fillRect(0, 0, 128, 128);
  for (let i = 0; i < 150; i++){
    const x = Math.random() * 128, y = Math.random() * 128;
    g.fillStyle = ['#B4CAD6', '#D6E8F0', '#A6BFCC', '#E0EEF4'][(Math.random() * 4) | 0];
    g.fillRect(x, y, 2 + Math.random() * 5, 1 + Math.random() * 3);
  }
  g.strokeStyle = 'rgba(150,180,196,.4)'; g.lineWidth = 1;
  for (let i = 0; i < 30; i++){
    const x = Math.random() * 128, y = Math.random() * 128;
    g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.random() * 5 - 2.5, y - 4 - Math.random() * 5); g.stroke();
  }
  const ctx = CTX;
  if (ctx && ctx.createPattern) groundPatternSnow = ctx.createPattern(c, 'repeat');
}

function buildGroundSwamp(){
  const c = document.createElement('canvas');
  c.width = 128; c.height = 128;
  const g = c.getContext('2d');
  if (!g) return;
  g.fillStyle = '#3E4A2C'; g.fillRect(0, 0, 128, 128);
  for (let i = 0; i < 150; i++){
    const x = Math.random() * 128, y = Math.random() * 128;
    g.fillStyle = ['#4A5A34', '#2E3820', '#566B3A', '#26301C'][(Math.random() * 4) | 0];
    g.fillRect(x, y, 2 + Math.random() * 5, 1 + Math.random() * 3);
  }
  g.strokeStyle = 'rgba(120,140,80,.4)'; g.lineWidth = 1;
  for (let i = 0; i < 34; i++){
    const x = Math.random() * 128, y = Math.random() * 128;
    g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.random() * 5 - 2.5, y - 4 - Math.random() * 5); g.stroke();
  }
  const ctx = CTX;
  if (ctx && ctx.createPattern) groundPatternSwamp = ctx.createPattern(c, 'repeat');
}

function buildGroundOcean(){
  const c = document.createElement('canvas');
  c.width = 128; c.height = 128;
  const g = c.getContext('2d');
  if (!g) return;
  g.fillStyle = '#0F3A52'; g.fillRect(0, 0, 128, 128);
  for (let i = 0; i < 150; i++){
    const x = Math.random() * 128, y = Math.random() * 128;
    g.fillStyle = ['#1C4E6E', '#0A2A3C', '#2A5E7E', '#123448'][(Math.random() * 4) | 0];
    g.fillRect(x, y, 2 + Math.random() * 5, 1 + Math.random() * 3);
  }
  g.strokeStyle = 'rgba(180,220,230,.32)'; g.lineWidth = 1;
  for (let i = 0; i < 30; i++){
    const x = Math.random() * 128, y = Math.random() * 128, w = 5 + Math.random() * 6;
    g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + w * 0.5, y - 3, x + w, y); g.stroke();
  }
  const ctx = CTX;
  if (ctx && ctx.createPattern) groundPatternOcean = ctx.createPattern(c, 'repeat');
}

function buildDecor(){
  G.decor = [];
  for (let i = 0; i < Math.round(130 * ARENA_K * ARENA_K); i++){
    G.decor.push({ x: rand(40, ARENA_W - 40), y: rand(40, ARENA_H - 40),
      type: Math.random() < 0.18 ? 'rock' : Math.random() < 0.28 ? 'tree' : 'tuft',
      s: rand(0.7, 1.5), rot: Math.random() * TAU });
  }
  G.water = { x: ARENA_W * rand(0.25, 0.75), y: ARENA_H * rand(0.25, 0.75), r: rand(120, 190) };
}

/* ========================= 26. RENDER ========================= */
function drawGround(ctx, cx, cy, vw, vh){
  if (G.biome === 'jungle'){ drawGroundJungle(ctx, cx, cy, vw, vh); return; }
  if (G.biome === 'city'){ drawGroundCity(ctx, cx, cy, vw, vh); return; }
  if (G.biome === 'space'){ drawGroundSpace(ctx, cx, cy, vw, vh); return; }
  if (G.biome === 'moon'){ drawGroundMoon(ctx, cx, cy, vw, vh); return; }
  if (G.biome === 'venus'){ drawGroundVenus(ctx, cx, cy, vw, vh); return; }
  if (G.biome === 'area51'){ drawGroundArea51(ctx, cx, cy, vw, vh); return; }
  if (G.biome === 'mars'){ drawGroundMars(ctx, cx, cy, vw, vh); return; }
  const snow = G.biome === 'snow', swamp = G.biome === 'swamp', ocean = G.biome === 'ocean';
  const x0 = cx - vw / 2, y0 = cy - vh / 2;
  const pattern = ocean ? groundPatternOcean : swamp ? groundPatternSwamp : snow ? groundPatternSnow : groundPattern;
  const fallback = ocean ? '#0F3A52' : swamp ? '#3E4A2C' : snow ? '#C3D6E0' : '#7F6C45';
  ctx.fillStyle = pattern || fallback;
  ctx.fillRect(x0 - 40, y0 - 40, vw + 80, vh + 80);
  /* watering hole -- frozen over in chapter 2, a stagnant bog pool in chapter
     3, a darker trench glinting with bioluminescence in chapter 4's open water */
  const w = G.water;
  if (w && w.x > x0 - w.r - 60 && w.x < x0 + vw + w.r + 60 && w.y > y0 - w.r - 60 && w.y < y0 + vh + w.r + 60){
    if (snow){
      ctx.fillStyle = '#8FB8CC';
      ctx.beginPath(); ctx.ellipse(w.x, w.y, w.r * 1.12, w.r * 0.86, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = '#BEE0EE';
      ctx.beginPath(); ctx.ellipse(w.x, w.y, w.r, w.r * 0.74, 0, 0, TAU); ctx.fill();
      ctx.strokeStyle = 'rgba(150,190,210,.5)'; ctx.lineWidth = 1.4;
      for (let i = 0; i < 5; i++){
        ctx.beginPath();
        ctx.moveTo(w.x - w.r * 0.6 + i * w.r * 0.28, w.y - w.r * 0.3);
        ctx.lineTo(w.x - w.r * 0.4 + i * w.r * 0.26, w.y + w.r * 0.35);
        ctx.stroke();
      }
      ctx.fillStyle = 'rgba(255,255,255,.24)';
      ctx.beginPath(); ctx.ellipse(w.x - w.r * 0.2, w.y - w.r * 0.2, w.r * 0.5, w.r * 0.24, -0.4, 0, TAU); ctx.fill();
    } else if (swamp){
      ctx.fillStyle = '#2E3820';
      ctx.beginPath(); ctx.ellipse(w.x, w.y, w.r * 1.12, w.r * 0.86, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = '#141C10';
      ctx.beginPath(); ctx.ellipse(w.x, w.y, w.r, w.r * 0.74, 0, 0, TAU); ctx.fill();
      /* a scatter of lily pads and the odd rising bubble */
      ctx.fillStyle = '#3E4A22';
      const pads = [[-0.42, -0.1, 0.22], [0.18, 0.22, 0.16], [0.4, -0.32, 0.13], [-0.1, 0.36, 0.17]];
      for (let i = 0; i < pads.length; i++){
        const pd = pads[i];
        ctx.beginPath(); ctx.ellipse(w.x + pd[0] * w.r, w.y + pd[1] * w.r * 0.74, w.r * pd[2], w.r * pd[2] * 0.62, 0.3, 0, TAU); ctx.fill();
      }
      ctx.fillStyle = 'rgba(154,203,94,.16)';
      ctx.beginPath(); ctx.ellipse(w.x - w.r * 0.2, w.y - w.r * 0.2, w.r * 0.5, w.r * 0.24, -0.4, 0, TAU); ctx.fill();
      ctx.fillStyle = 'rgba(180,214,110,.4)';
      for (let i = 0; i < 4; i++){
        const a = (i / 4) * TAU + G.time * 0.3;
        fillCircle(ctx, w.x + Math.cos(a) * w.r * 0.5, w.y + Math.sin(a) * w.r * 0.36, 2 + Math.sin(G.time * 3 + i) * 0.8, 'rgba(180,214,110,.4)');
      }
    } else if (ocean){
      ctx.fillStyle = '#082436';
      ctx.beginPath(); ctx.ellipse(w.x, w.y, w.r * 1.12, w.r * 0.86, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = '#04141E';
      ctx.beginPath(); ctx.ellipse(w.x, w.y, w.r, w.r * 0.74, 0, 0, TAU); ctx.fill();
      /* a deeper trench -- something down there glints back */
      ctx.fillStyle = 'rgba(46,214,200,.14)';
      ctx.beginPath(); ctx.ellipse(w.x - w.r * 0.2, w.y - w.r * 0.2, w.r * 0.5, w.r * 0.24, -0.4, 0, TAU); ctx.fill();
      for (let i = 0; i < 5; i++){
        const a = (i / 5) * TAU + G.time * 0.22;
        const tw = 0.4 + 0.6 * Math.max(0, Math.sin(G.time * 2.4 + i * 1.7));
        ctx.globalAlpha = tw;
        fillCircle(ctx, w.x + Math.cos(a) * w.r * 0.55, w.y + Math.sin(a) * w.r * 0.4, 1.6, '#8FFFEA');
        ctx.globalAlpha = 1;
      }
    } else {
      ctx.fillStyle = '#4A5F4A';
      ctx.beginPath(); ctx.ellipse(w.x, w.y, w.r * 1.12, w.r * 0.86, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = '#2E4A55';
      ctx.beginPath(); ctx.ellipse(w.x, w.y, w.r, w.r * 0.74, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = 'rgba(160,200,215,.14)';
      ctx.beginPath(); ctx.ellipse(w.x - w.r * 0.2, w.y - w.r * 0.2, w.r * 0.5, w.r * 0.24, -0.4, 0, TAU); ctx.fill();
    }
  }
  /* decor */
  const dl = G.decor;
  for (let i = 0; i < dl.length; i++){
    const d = dl[i];
    if (d.x < x0 - 60 || d.x > x0 + vw + 60 || d.y < y0 - 60 || d.y > y0 + vh + 60) continue;
    if (d.type === 'rock'){
      ctx.fillStyle = 'rgba(0,0,0,.2)';
      ctx.beginPath(); ctx.ellipse(d.x + 3, d.y + 4, 13 * d.s, 8 * d.s, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = ocean ? '#1E4A5C' : swamp ? '#4A5A38' : snow ? '#8C9CA4' : '#7D7268';
      ctx.beginPath(); ctx.ellipse(d.x, d.y, 12 * d.s, 8 * d.s, d.rot, 0, TAU); ctx.fill();
      if (ocean){
        /* coral crust: a few small bright nubs instead of a plain highlight */
        ctx.fillStyle = '#FF8FA8';
        fillCircle(ctx, d.x - 4 * d.s, d.y - 3 * d.s, 1.8 * d.s, '#FF8FA8');
        ctx.fillStyle = '#FFC96B';
        fillCircle(ctx, d.x + 3 * d.s, d.y - 1 * d.s, 1.5 * d.s, '#FFC96B');
        ctx.fillStyle = '#8FFFEA';
        fillCircle(ctx, d.x, d.y + 3 * d.s, 1.4 * d.s, '#8FFFEA');
      } else {
        ctx.fillStyle = swamp ? '#6E8248' : snow ? '#E8F3F8' : '#93887C';
        ctx.beginPath(); ctx.ellipse(d.x - 2 * d.s, d.y - 2 * d.s, 6 * d.s, 4 * d.s, d.rot, 0, TAU); ctx.fill();
      }
    } else if (d.type === 'tree'){
      ctx.fillStyle = 'rgba(0,0,0,.24)';
      ctx.beginPath(); ctx.ellipse(d.x + 9, d.y + 8, 34 * d.s, 20 * d.s, 0, 0, TAU); ctx.fill();
      if (snow){
        ctx.fillStyle = '#2E4A42';
        ctx.beginPath(); ctx.moveTo(d.x, d.y - 30 * d.s); ctx.lineTo(d.x - 20 * d.s, d.y + 8 * d.s); ctx.lineTo(d.x + 20 * d.s, d.y + 8 * d.s); ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#3A5C50';
        ctx.beginPath(); ctx.moveTo(d.x, d.y - 20 * d.s); ctx.lineTo(d.x - 15 * d.s, d.y + 12 * d.s); ctx.lineTo(d.x + 15 * d.s, d.y + 12 * d.s); ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#EAF6FA';
        ctx.beginPath(); ctx.moveTo(d.x, d.y - 30 * d.s); ctx.lineTo(d.x - 9 * d.s, d.y - 10 * d.s); ctx.lineTo(d.x + 9 * d.s, d.y - 10 * d.s); ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#3C2C1E';
        ctx.beginPath(); ctx.ellipse(d.x, d.y + 12 * d.s, 3.4 * d.s, 3 * d.s, 0, 0, TAU); ctx.fill();
      } else if (swamp){
        /* a gnarled, half-dead mangrove: bare twisted trunk, sparse branches, drooping moss */
        ctx.strokeStyle = '#241E14'; ctx.lineWidth = 3.4 * d.s; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(d.x, d.y + 10 * d.s); ctx.lineTo(d.x - 3 * d.s, d.y - 22 * d.s); ctx.stroke();
        ctx.lineWidth = 2 * d.s;
        ctx.beginPath(); ctx.moveTo(d.x - 3 * d.s, d.y - 8 * d.s); ctx.lineTo(d.x - 16 * d.s, d.y - 20 * d.s); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(d.x - 4 * d.s, d.y - 16 * d.s); ctx.lineTo(d.x + 13 * d.s, d.y - 26 * d.s); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(d.x - 3 * d.s, d.y - 22 * d.s); ctx.lineTo(d.x + 3 * d.s, d.y - 32 * d.s); ctx.stroke();
        ctx.fillStyle = '#3E4A22';
        fillCircle(ctx, d.x - 16 * d.s, d.y - 21 * d.s, 6 * d.s, '#3E4A22');
        fillCircle(ctx, d.x + 13 * d.s, d.y - 27 * d.s, 5 * d.s, '#465326');
        fillCircle(ctx, d.x + 3 * d.s, d.y - 33 * d.s, 4.4 * d.s, '#3E4A22');
        /* hanging moss strands */
        ctx.strokeStyle = 'rgba(120,140,80,.55)'; ctx.lineWidth = 1.2;
        for (let k = 0; k < 3; k++){
          const bx = d.x - 12 * d.s + k * 12 * d.s, by = d.y - 18 * d.s + (k % 2) * 8 * d.s;
          ctx.beginPath(); ctx.moveTo(bx, by);
          ctx.quadraticCurveTo(bx + 2 * d.s, by + 8 * d.s, bx - 1 * d.s, by + 15 * d.s);
          ctx.stroke();
        }
        ctx.fillStyle = '#241E14';
        ctx.beginPath(); ctx.ellipse(d.x, d.y + 11 * d.s, 3.6 * d.s, 3 * d.s, 0, 0, TAU); ctx.fill();
      } else if (ocean){
        /* a kelp cluster: tall swaying fronds rising from a holdfast */
        const sway = Math.sin(G.time * 0.9 + d.rot) * 5;
        ctx.strokeStyle = '#1E6B4A'; ctx.lineWidth = 2.6 * d.s; ctx.lineCap = 'round';
        for (let k = -1; k <= 1; k++){
          const bx = d.x + k * 5 * d.s;
          ctx.beginPath();
          ctx.moveTo(bx, d.y + 8 * d.s);
          ctx.quadraticCurveTo(bx + sway * (0.5 + k * 0.2), d.y - 14 * d.s, bx + sway * (1 + k * 0.3), d.y - 30 * d.s - Math.abs(k) * 4 * d.s);
          ctx.stroke();
        }
        ctx.fillStyle = '#2A8560';
        for (let k = -1; k <= 1; k++){
          const bx = d.x + k * 5 * d.s + sway * (1 + k * 0.3);
          fillCircle(ctx, bx, d.y - 30 * d.s - Math.abs(k) * 4 * d.s, 3.4 * d.s, '#2A8560');
        }
        ctx.fillStyle = '#0E3624';
        ctx.beginPath(); ctx.ellipse(d.x, d.y + 9 * d.s, 4.4 * d.s, 3 * d.s, 0, 0, TAU); ctx.fill();
      } else {
        ctx.fillStyle = '#4E6135';
        ctx.beginPath(); ctx.ellipse(d.x, d.y, 32 * d.s, 18 * d.s, 0, 0, TAU); ctx.fill();
        ctx.fillStyle = '#5E7440';
        ctx.beginPath(); ctx.ellipse(d.x - 8 * d.s, d.y - 5 * d.s, 20 * d.s, 11 * d.s, 0, 0, TAU); ctx.fill();
        ctx.fillStyle = '#3C2C1E';
        ctx.beginPath(); ctx.ellipse(d.x, d.y + 2, 4 * d.s, 3 * d.s, 0, 0, TAU); ctx.fill();
      }
    } else if (ocean){
      /* a small anemone / seaweed tuft, tentacles swaying with a bright tip */
      const sway = Math.sin(G.time * 1.4 + d.rot) * 2.4;
      ctx.strokeStyle = 'rgba(60,160,190,.7)'; ctx.lineWidth = 1.5;
      ctx.beginPath();
      for (let k = -2; k <= 2; k++){
        ctx.moveTo(d.x + k * 2.6 * d.s, d.y);
        ctx.lineTo(d.x + k * 3.2 * d.s + sway, d.y - (11 + Math.abs(k) * -1.6) * d.s);
      }
      ctx.stroke();
      ctx.fillStyle = '#FF9FC2';
      fillCircle(ctx, d.x + sway, d.y - 11 * d.s, 2 * d.s, '#FF9FC2');
    } else if (swamp){
      /* reeds and cattails instead of grass tufts */
      ctx.strokeStyle = 'rgba(90,110,56,.75)'; ctx.lineWidth = 1.5;
      ctx.beginPath();
      for (let k = -2; k <= 2; k++){
        const bend = Math.sin(d.rot + k) * 3;
        ctx.moveTo(d.x + k * 2.8 * d.s, d.y);
        ctx.lineTo(d.x + k * 3.4 * d.s + bend, d.y - (13 + Math.abs(k) * -2) * d.s);
      }
      ctx.stroke();
      ctx.fillStyle = '#5A4A2A';
      fillCircle(ctx, d.x - 2.8 * d.s + Math.sin(d.rot - 2) * 3, d.y - 13 * d.s, 2.6 * d.s, '#5A4A2A');
      fillCircle(ctx, d.x + 2.8 * d.s + Math.sin(d.rot + 2) * 3, d.y - 9 * d.s, 2.2 * d.s, '#5A4A2A');
    } else {
      ctx.strokeStyle = snow ? 'rgba(210,230,238,.7)' : 'rgba(148,132,86,.55)'; ctx.lineWidth = 1.6;
      ctx.beginPath();
      for (let k = -2; k <= 2; k++){
        ctx.moveTo(d.x + k * 2.5 * d.s, d.y);
        ctx.lineTo(d.x + k * 4 * d.s + Math.sin(d.rot + k) * 3, d.y - (9 + Math.abs(k) * -2) * d.s);
      }
      ctx.stroke();
    }
  }
  /* arena edge */
  ctx.strokeStyle = 'rgba(30,22,16,.85)'; ctx.lineWidth = 10;
  ctx.strokeRect(-5, -5, ARENA_W + 10, ARENA_H + 10);
  ctx.strokeStyle = ocean ? '#081820' : swamp ? '#1E2814' : snow ? '#2A3A42' : '#3A2B20'; ctx.lineWidth = 4;
  ctx.strokeRect(0, 0, ARENA_W, ARENA_H);
  ctx.fillStyle = ocean ? '#050D12' : swamp ? '#0C120A' : snow ? '#0F171B' : '#1B1410';
  const pad = 400;
  if (x0 < 0) ctx.fillRect(x0 - pad, y0 - pad, -x0 + pad, vh + pad * 2);
  if (y0 < 0) ctx.fillRect(x0 - pad, y0 - pad, vw + pad * 2, -y0 + pad);
  if (x0 + vw > ARENA_W) ctx.fillRect(ARENA_W, y0 - pad, x0 + vw - ARENA_W + pad, vh + pad * 2);
  if (y0 + vh > ARENA_H) ctx.fillRect(x0 - pad, ARENA_H, vw + pad * 2, y0 + vh - ARENA_H + pad);

  /* ambient falling snow, purely decorative */
  if (snow){
    if (!G.snowflakes) buildSnowflakes();
    ctx.fillStyle = 'rgba(255,255,255,.75)';
    for (let i = 0; i < G.snowflakes.length; i++){
      const f = G.snowflakes[i];
      const px = ((f.x + cx * f.par) % (vw + 80)) + x0 - 40;
      const py = (f.y + G.time * f.spd) % (vh + 80) + y0 - 40;
      ctx.beginPath(); ctx.arc(px, py, f.r, 0, TAU); ctx.fill();
    }
  }
  /* ambient marsh-gas fireflies, purely decorative */
  if (swamp){
    if (!G.swampMotes) buildSwampMotes();
    for (let i = 0; i < G.swampMotes.length; i++){
      const f = G.swampMotes[i];
      const px = ((f.x + cx * f.par) % (vw + 80)) + x0 - 40;
      const py = (f.y + G.time * f.spd) % (vh + 80) + y0 - 40;
      const glow = 0.5 + 0.5 * Math.sin(G.time * 2 + f.ph);
      ctx.fillStyle = 'rgba(180,214,110,' + (0.3 + glow * 0.45).toFixed(2) + ')';
      ctx.beginPath(); ctx.arc(px, py, f.r * (0.75 + glow * 0.5), 0, TAU); ctx.fill();
    }
  }
  /* ambient rising bubbles, purely decorative -- these actually rise, unlike
     the falling snow and the drifting swamp motes, since the whole arena
     is now underwater rather than just weather passing over dry ground */
  if (ocean){
    if (!G.oceanBubbles) buildOceanBubbles();
    ctx.strokeStyle = 'rgba(220,245,250,.5)'; ctx.fillStyle = 'rgba(220,245,250,.22)';
    for (let i = 0; i < G.oceanBubbles.length; i++){
      const f = G.oceanBubbles[i];
      const wob = Math.sin(G.time * 1.6 + f.ph) * 10;
      const px = ((f.x + wob + cx * f.par) % (vw + 80)) + x0 - 40;
      const py = (vh + 80) - ((G.time * f.spd + f.y) % (vh + 80)) + y0 - 40;
      ctx.beginPath(); ctx.arc(px, py, f.r, 0, TAU); ctx.fill(); ctx.stroke();
    }
  }
}

/* ---- Chapter 5: the Amazon rainforest floor, seen from above ---- */
function buildGroundJungle(){
  const c = document.createElement('canvas');
  c.width = 128; c.height = 128;
  const g = c.getContext('2d');
  if (!g) return;
  g.fillStyle = '#2A3A1C'; g.fillRect(0, 0, 128, 128);
  /* leaf litter: a scatter of small fallen leaves in browns and greens */
  for (let i = 0; i < 110; i++){
    const x = Math.random() * 128, y = Math.random() * 128;
    g.fillStyle = ['#3A4A22', '#4A3A1E', '#22301A', '#5A4A26', '#34461E'][(Math.random() * 5) | 0];
    g.save(); g.translate(x, y); g.rotate(Math.random() * TAU);
    g.beginPath(); g.ellipse(0, 0, 3 + Math.random() * 3, 1.3 + Math.random() * 1.2, 0, 0, TAU); g.fill();
    g.restore();
  }
  const ctx = CTX;
  if (ctx && ctx.createPattern) groundPatternJungle = ctx.createPattern(c, 'repeat');
}
function buildJungleLeaves(){
  G.jungleLeaves = [];
  for (let i = 0; i < 40; i++)
    G.jungleLeaves.push({ x: rand(0, 1600), y: rand(0, 900), s: rand(2.4, 4.4), spd: rand(14, 34),
      par: rand(0.05, 0.2), ph: Math.random() * TAU, c: ['#5FA83C', '#8AB83A', '#C9A23A', '#3E8A2E'][(Math.random() * 4) | 0] });
}
function drawGroundJungle(ctx, cx, cy, vw, vh){
  const x0 = cx - vw / 2, y0 = cy - vh / 2;
  ctx.fillStyle = groundPatternJungle || '#2A3A1C';
  ctx.fillRect(x0 - 40, y0 - 40, vw + 80, vh + 80);
  /* a black-water river pool with giant Victoria lily pads */
  const w = G.water;
  if (w && w.x > x0 - w.r - 60 && w.x < x0 + vw + w.r + 60 && w.y > y0 - w.r - 60 && w.y < y0 + vh + w.r + 60){
    ctx.fillStyle = '#1E2A14';
    ctx.beginPath(); ctx.ellipse(w.x, w.y, w.r * 1.12, w.r * 0.86, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = '#2A1E12';
    ctx.beginPath(); ctx.ellipse(w.x, w.y, w.r, w.r * 0.74, 0, 0, TAU); ctx.fill();
    const pads = [[-0.4, -0.15, 0.3], [0.25, 0.2, 0.24], [0.42, -0.35, 0.17], [-0.15, 0.4, 0.2]];
    for (let i = 0; i < pads.length; i++){
      const pd = pads[i], px = w.x + pd[0] * w.r, py = w.y + pd[1] * w.r * 0.74, pr = w.r * pd[2];
      ctx.fillStyle = '#6A2A1E';                       /* the upturned red rim */
      ctx.beginPath(); ctx.arc(px, py, pr, 0, TAU); ctx.fill();
      ctx.fillStyle = '#4E8A2E';
      ctx.beginPath(); ctx.arc(px, py, pr * 0.86, 0, TAU); ctx.fill();
      ctx.strokeStyle = 'rgba(30,60,20,.5)'; ctx.lineWidth = 1;
      ctx.beginPath();
      for (let k = 0; k < 8; k++){ const a = k * TAU / 8; ctx.moveTo(px, py); ctx.lineTo(px + Math.cos(a) * pr * 0.84, py + Math.sin(a) * pr * 0.84); }
      ctx.stroke();
    }
    fillCircle(ctx, w.x + w.r * 0.25, w.y + w.r * 0.2 * 0.74, w.r * 0.07, '#F4E8F0');   /* a single white bloom */
  }
  const dl = G.decor;
  for (let i = 0; i < dl.length; i++){
    const d = dl[i];
    if (d.x < x0 - 80 || d.x > x0 + vw + 80 || d.y < y0 - 80 || d.y > y0 + vh + 80) continue;
    if (d.type === 'rock'){
      /* a moss-swallowed boulder with an orchid growing on top */
      ctx.fillStyle = 'rgba(0,0,0,.25)';
      ctx.beginPath(); ctx.ellipse(d.x + 3, d.y + 4, 13 * d.s, 8 * d.s, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = '#4A5238';
      ctx.beginPath(); ctx.ellipse(d.x, d.y, 12 * d.s, 8 * d.s, d.rot, 0, TAU); ctx.fill();
      ctx.fillStyle = '#4E7A2A';
      ctx.beginPath(); ctx.ellipse(d.x - 2 * d.s, d.y - 2 * d.s, 9 * d.s, 5.5 * d.s, d.rot, 0, TAU); ctx.fill();
      for (let k = 0; k < 5; k++){
        const a = k * TAU / 5 + d.rot;
        fillCircle(ctx, d.x + Math.cos(a) * 2.6 * d.s, d.y - 2 * d.s + Math.sin(a) * 2.6 * d.s, 1.8 * d.s, '#E07AC8');
      }
      fillCircle(ctx, d.x, d.y - 2 * d.s, 1.2 * d.s, '#FFE24A');
    } else if (d.type === 'tree'){
      /* a kapok crown from above: layered canopy clumps with buttress roots peeking out */
      ctx.fillStyle = 'rgba(0,0,0,.3)';
      ctx.beginPath(); ctx.ellipse(d.x + 10, d.y + 10, 40 * d.s, 26 * d.s, 0, 0, TAU); ctx.fill();
      ctx.strokeStyle = '#4A3420'; ctx.lineWidth = 3.4 * d.s; ctx.lineCap = 'round';
      for (let k = 0; k < 5; k++){
        const a = k * TAU / 5 + d.rot;
        ctx.beginPath(); ctx.moveTo(d.x, d.y); ctx.lineTo(d.x + Math.cos(a) * 30 * d.s, d.y + Math.sin(a) * 22 * d.s); ctx.stroke();
      }
      ctx.lineCap = 'butt';
      const clumps = [[0, 0, 26], [-16, -8, 16], [15, -10, 15], [-12, 11, 15], [14, 10, 16], [0, -18, 12]];
      for (let k = 0; k < clumps.length; k++){
        const cl = clumps[k];
        ctx.fillStyle = k % 2 ? '#2E6A22' : '#3A7E2A';
        ctx.beginPath(); ctx.arc(d.x + cl[0] * d.s, d.y + cl[1] * d.s * 0.8, cl[2] * d.s, 0, TAU); ctx.fill();
      }
      ctx.fillStyle = 'rgba(160,220,110,.22)';
      ctx.beginPath(); ctx.arc(d.x - 6 * d.s, d.y - 6 * d.s, 14 * d.s, 0, TAU); ctx.fill();
      if (i % 3 === 0){   /* some trees are in flower */
        fillCircle(ctx, d.x + 8 * d.s, d.y - 4 * d.s, 2.6 * d.s, '#F26A3A');
        fillCircle(ctx, d.x - 10 * d.s, d.y + 6 * d.s, 2.2 * d.s, '#F26A3A');
      }
    } else {
      /* a fern: fronds radiating from the centre, each with little leaflets */
      const sway = Math.sin(G.time * 1.1 + d.rot) * 0.08;
      ctx.strokeStyle = '#4E9A32'; ctx.lineWidth = 1.3;
      for (let k = 0; k < 5; k++){
        const a = k * TAU / 5 + d.rot + sway, L = 13 * d.s;
        const ex = d.x + Math.cos(a) * L, ey = d.y + Math.sin(a) * L;
        ctx.beginPath(); ctx.moveTo(d.x, d.y); ctx.lineTo(ex, ey); ctx.stroke();
        for (let j = 1; j <= 3; j++){
          const t = j / 4, bx = d.x + Math.cos(a) * L * t, by = d.y + Math.sin(a) * L * t;
          ctx.beginPath();
          ctx.moveTo(bx, by); ctx.lineTo(bx + Math.cos(a + 0.9) * 4 * d.s, by + Math.sin(a + 0.9) * 4 * d.s);
          ctx.moveTo(bx, by); ctx.lineTo(bx + Math.cos(a - 0.9) * 4 * d.s, by + Math.sin(a - 0.9) * 4 * d.s);
          ctx.stroke();
        }
      }
    }
  }
  /* arena edge: dense, near-black undergrowth */
  ctx.strokeStyle = 'rgba(10,18,6,.9)'; ctx.lineWidth = 10;
  ctx.strokeRect(-5, -5, ARENA_W + 10, ARENA_H + 10);
  ctx.strokeStyle = '#14200C'; ctx.lineWidth = 4;
  ctx.strokeRect(0, 0, ARENA_W, ARENA_H);
  ctx.fillStyle = '#080E05';
  const pad = 400;
  if (x0 < 0) ctx.fillRect(x0 - pad, y0 - pad, -x0 + pad, vh + pad * 2);
  if (y0 < 0) ctx.fillRect(x0 - pad, y0 - pad, vw + pad * 2, -y0 + pad);
  if (x0 + vw > ARENA_W) ctx.fillRect(ARENA_W, y0 - pad, x0 + vw - ARENA_W + pad, vh + pad * 2);
  if (y0 + vh > ARENA_H) ctx.fillRect(x0 - pad, ARENA_H, vw + pad * 2, y0 + vh - ARENA_H + pad);
  /* ambient: leaves spiralling down from the canopy */
  if (!G.jungleLeaves) buildJungleLeaves();
  for (let i = 0; i < G.jungleLeaves.length; i++){
    const f = G.jungleLeaves[i];
    const px = ((f.x + Math.sin(G.time * 0.9 + f.ph) * 18 + cx * f.par) % (vw + 80)) + x0 - 40;
    const py = (f.y + G.time * f.spd) % (vh + 80) + y0 - 40;
    ctx.save(); ctx.translate(px, py); ctx.rotate(G.time * 1.3 + f.ph);
    ctx.fillStyle = f.c; ctx.globalAlpha = 0.8;
    ctx.beginPath(); ctx.ellipse(0, 0, f.s, f.s * 0.45, 0, 0, TAU); ctx.fill();
    ctx.restore();
  }
  ctx.globalAlpha = 1;
}
function buildSnowflakes(){
  G.snowflakes = [];
  for (let i = 0; i < 70; i++)
    G.snowflakes.push({ x: rand(0, 1600), y: rand(0, 900), r: rand(1, 2.6), spd: rand(28, 70), par: rand(0.05, 0.2) });
}
function buildSwampMotes(){
  G.swampMotes = [];
  for (let i = 0; i < 46; i++)
    G.swampMotes.push({ x: rand(0, 1600), y: rand(0, 900), r: rand(1.4, 3), spd: rand(10, 26), par: rand(0.05, 0.2), ph: Math.random() * TAU });
}
function buildOceanBubbles(){
  G.oceanBubbles = [];
  for (let i = 0; i < 60; i++)
    G.oceanBubbles.push({ x: rand(0, 1600), y: rand(0, 900), r: rand(1.2, 3.4), spd: rand(24, 60), par: rand(0.05, 0.2), ph: Math.random() * TAU });
}

/* The part of the world the camera can see, plus a margin for shake and for things drawn bigger than their position (set by render() in 37-frame-transitions.js).
   The draw loops below skip what is outside it: a particle, number or pickup that is off the screen costs a canvas call for nothing. */
const VIEW = { x0: 0, x1: 0, y0: 0, y1: 0 };
function viewBounds(m){
  const hw = G.W / G.zoom / 2 + m, hh = G.H / G.zoom / 2 + m;
  VIEW.x0 = G.camX - hw; VIEW.x1 = G.camX + hw; VIEW.y0 = G.camY - hh; VIEW.y1 = G.camY + hh;
  return VIEW;
}

function drawZones(ctx){
  const zs = G.zones;
  for (let i = 0; i < zs.length; i++){
    const z = zs[i];
    const a = clamp(z.life / Math.min(0.6, z.max), 0, 1);
    const rr = z.grow ? z.r0 : z.r;
    softBlob(ctx, z.x, z.y, rr, z.color, 0.115 * a);
    ringPath(ctx, z.x, z.y, rr, 2, z.color, 0.24 * a);
    if (Math.random() < 0.12){
      const ang = Math.random() * TAU, d = Math.random() * rr;
      addParticle(z.x + Math.cos(ang) * d, z.y + Math.sin(ang) * d, rand(-10, 10), -rand(12, 34), rand(1.5, 3), 0.45, z.color, { glow:true, drag:1 });
    }
  }
}

function drawShocks(ctx){
  const ss = G.shocks;
  for (let i = 0; i < ss.length; i++){
    const s = ss[i];
    const a = clamp(s.life / s.max, 0, 1);
    if (s.filled) softBlob(ctx, s.x, s.y, s.r, s.color, 0.16 * a);
    ringPath(ctx, s.x, s.y, s.r, s.width * a + 2, s.color, 0.55 * a);
    ringPath(ctx, s.x, s.y, s.r, Math.max(1, s.width * a * 0.3), '#FFFFFF', 0.4 * a);
  }
}

function drawPickups(ctx){
  const ps = G.pickups, v = viewBounds(60);
  for (let i = 0; i < ps.length; i++){
    const p = ps[i];
    if (p.x < v.x0 || p.x > v.x1 || p.y < v.y0 || p.y > v.y1) continue;
    const bob = Math.sin(p.bob) * 3;
    const fade = p.life < 3 ? (Math.sin(p.life * 14) > 0 ? 1 : 0.3) : 1;
    ctx.globalAlpha = fade;
    ctx.fillStyle = 'rgba(0,0,0,.28)';
    ctx.beginPath(); ctx.ellipse(p.x, p.y + 8, 9, 4, 0, 0, TAU); ctx.fill();
    if (p.type === 'heart'){
      ctx.fillStyle = '#E8604A';
      ctx.beginPath();
      ctx.arc(p.x - 4, p.y + bob - 2, 4.6, 0, TAU); ctx.arc(p.x + 4, p.y + bob - 2, 4.6, 0, TAU);
      ctx.moveTo(p.x - 8.4, p.y + bob); ctx.lineTo(p.x, p.y + bob + 10); ctx.lineTo(p.x + 8.4, p.y + bob);
      ctx.fill();
      fillCircle(ctx, p.x - 3, p.y + bob - 4, 1.6, 'rgba(255,255,255,.65)');
    } else if (p.type === 'gold'){
      ctx.fillStyle = '#F2B33D';
      ctx.beginPath(); ctx.ellipse(p.x, p.y + bob, 8, 6.4, 0.4, 0, TAU); ctx.fill();
      ctx.fillStyle = '#FFE08A';
      ctx.beginPath(); ctx.ellipse(p.x - 2, p.y + bob - 2, 3.4, 2.4, 0.4, 0, TAU); ctx.fill();
    } else if (p.type === 'sulfur' || p.type === 'basalt'){
      venusPickupGlyph(ctx, p, bob);
    } else if (p.type === 'iron'){
      marsIronGlyph(ctx, p.x, p.y + bob, 1);
    } else if (p.type === 'grub'){
      softBlob(ctx, p.x, p.y + bob, 12, '#E8D8A0', 0.22);
      for (let k = 0; k < 3; k++){ ctx.fillStyle = k === 0 ? '#EBD9A4' : '#E2CE96'; ctx.beginPath(); ctx.ellipse(p.x - 5 + k * 5.2, p.y + bob + Math.sin(p.bob * 2 + k) * 1.3, 4.6 - k * 0.5, 3.6 - k * 0.4, 0, 0, TAU); ctx.fill(); }
      fillCircle(ctx, p.x + 6.4, p.y + bob, 2.2, '#8A6A3A');
    } else if (p.type === 'gem'){
      softBlob(ctx, p.x, p.y + bob, 13, '#5FD8FF', 0.22);
      ctx.fillStyle = '#3FBCE8';
      ctx.beginPath();
      ctx.moveTo(p.x, p.y + bob - 9); ctx.lineTo(p.x + 6, p.y + bob - 1);
      ctx.lineTo(p.x, p.y + bob + 9); ctx.lineTo(p.x - 6, p.y + bob - 1);
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#BEF0FF';
      ctx.beginPath();
      ctx.moveTo(p.x, p.y + bob - 9); ctx.lineTo(p.x + 2.6, p.y + bob - 1);
      ctx.lineTo(p.x, p.y + bob + 3); ctx.lineTo(p.x - 2.6, p.y + bob - 1);
      ctx.closePath(); ctx.fill();
    } else {
      const r = 9 + Math.sin(p.bob * 2) * 1.6;
      softBlob(ctx, p.x, p.y + bob, r * 1.9, '#FFF3CC', 0.28);
      fillCircle(ctx, p.x, p.y + bob, r, '#FFD166');
      fillCircle(ctx, p.x, p.y + bob, r * 0.55, '#FFFBEF');
    }
    ctx.globalAlpha = 1;
  }
}

function drawProjectiles(ctx){
  const ps = G.projectiles, v = viewBounds(80);
  for (let i = 0; i < ps.length; i++){
    const p = ps[i];
    if (p.x < v.x0 || p.x > v.x1 || p.y < v.y0 || p.y > v.y1) continue;
    softBlob(ctx, p.x, p.y, p.r * 2.1, p.color, 0.22);
    if (fxLevelNow() > 0){                                           /* a fading streak behind the shot */
      ctx.strokeStyle = p.color; ctx.lineWidth = Math.max(1.5, p.r * 0.9); ctx.lineCap = 'round'; ctx.globalAlpha = 0.28;
      ctx.beginPath(); ctx.moveTo(p.x - p.vx * 0.045, p.y - p.vy * 0.045); ctx.lineTo(p.x, p.y); ctx.stroke();
      ctx.lineCap = 'butt'; ctx.globalAlpha = 1;
    }
    ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(Math.atan2(p.vy, p.vx));
    if (p.kind === 'thorn'){
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.moveTo(p.r * 2.1, 0); ctx.lineTo(-p.r * 0.9, -p.r * 0.8); ctx.lineTo(-p.r * 0.3, 0); ctx.lineTo(-p.r * 0.9, p.r * 0.8);
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,.5)';
      ctx.beginPath(); ctx.moveTo(p.r * 1.4, 0); ctx.lineTo(-p.r * 0.1, -p.r * 0.25); ctx.lineTo(-p.r * 0.1, p.r * 0.25);
      ctx.closePath(); ctx.fill();
    } else if (p.kind === 'sun'){
      ctx.fillStyle = p.color;
      ctx.beginPath(); ctx.arc(0, 0, p.r * 1.15, 0, TAU); ctx.fill();
      ctx.strokeStyle = p.color; ctx.lineWidth = 1.4; ctx.globalAlpha = 0.8;
      for (let k = 0; k < 4; k++){
        const b = k * Math.PI / 2 + p.rot;
        ctx.beginPath(); ctx.moveTo(Math.cos(b) * p.r * 1.3, Math.sin(b) * p.r * 1.3); ctx.lineTo(Math.cos(b) * p.r * 2.2, Math.sin(b) * p.r * 2.2); ctx.stroke();
      }
      ctx.globalAlpha = 1;
      ctx.fillStyle = '#FFFBEF';
      ctx.beginPath(); ctx.arc(0, 0, p.r * 0.5, 0, TAU); ctx.fill();
    } else {
      ctx.fillStyle = p.color;
      ctx.beginPath(); ctx.ellipse(0, 0, p.r * 1.7, p.r, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,.55)';
      ctx.beginPath(); ctx.ellipse(p.r * 0.3, -p.r * 0.25, p.r * 0.55, p.r * 0.32, 0, 0, TAU); ctx.fill();
    }
    ctx.restore();
  }
  const es = G.eproj;
  for (let i = 0; i < es.length; i++){
    const p = es[i];
    if (p.x < v.x0 || p.x > v.x1 || p.y < v.y0 || p.y > v.y1) continue;
    if (p.tracer){                                           /* a streak, like a rifle round */
      const sp = hyp(p.vx, p.vy) || 1, tl = 0.045;
      ctx.strokeStyle = p.color; ctx.lineWidth = p.r * 0.9; ctx.lineCap = 'round'; ctx.globalAlpha = 0.9;
      ctx.beginPath(); ctx.moveTo(p.x - p.vx * tl, p.y - p.vy * tl); ctx.lineTo(p.x, p.y); ctx.stroke(); ctx.lineCap = 'butt';
      ctx.strokeStyle = '#FFFFFF'; ctx.lineWidth = p.r * 0.35; ctx.beginPath(); ctx.moveTo(p.x - p.vx * tl * 0.5, p.y - p.vy * tl * 0.5); ctx.lineTo(p.x, p.y); ctx.stroke(); ctx.globalAlpha = 1;
      continue;
    }
    if (p.missile){                                          /* a homing rocket with a flame */
      const a = Math.atan2(p.vy, p.vx);
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(a);
      csGlow(ctx, -8, 0, 12, '#FF8A3A', 0.8); lkTRI(ctx, -6, -2.4, -16 - Math.sin(G.time * 40) * 3, 0, -6, 2.4, '#FFD070');
      ctx.fillStyle = '#C8CCD6'; ctx.fillRect(-6, -2.8, 12, 5.6); ctx.fillStyle = '#FF5A3A'; ctx.beginPath(); ctx.moveTo(6, -2.8); ctx.lineTo(11, 0); ctx.lineTo(6, 2.8); ctx.closePath(); ctx.fill();
      ctx.restore(); continue;
    }
    ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot);
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.moveTo(0, -p.r * 1.6); ctx.lineTo(p.r, 0); ctx.lineTo(0, p.r * 1.6); ctx.lineTo(-p.r, 0);
    ctx.closePath(); ctx.fill();
    ctx.restore();
    softBlob(ctx, p.x, p.y, p.r * 2, '#B9A0D6', 0.2);
  }
}

function drawBolts(ctx){
  const bl = G.bolts;
  for (let i = 0; i < bl.length; i++){
    const b = bl[i];
    const a = b.life / b.max;
    for (let pass = 0; pass < 2; pass++){
      ctx.strokeStyle = pass === 0 ? b.color : '#FFFFFF';
      ctx.lineWidth = pass === 0 ? b.width * 2.4 : b.width * 0.7;
      ctx.globalAlpha = (pass === 0 ? 0.42 : 0.95) * a;
      ctx.beginPath();
      for (let k = 0; k < b.pts.length - 1; k++){
        const p0 = b.pts[k], p1 = b.pts[k + 1];
        ctx.moveTo(p0.x, p0.y);
        const segs = 4;
        for (let s = 1; s <= segs; s++){
          const t = s / segs;
          const jx = s === segs ? 0 : rand(-11, 11), jy = s === segs ? 0 : rand(-11, 11);
          ctx.lineTo(lerp(p0.x, p1.x, t) + jx, lerp(p0.y, p1.y, t) + jy);
        }
      }
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }
}

function drawSwipes(ctx){
  const sw = G.swipes;
  for (let i = 0; i < sw.length; i++){
    const s = sw[i];
    const k = s.t / s.dur;
    const a = (1 - k) * 0.8;
    const spread = s.arc * 0.5;
    const from = s.a - spread + s.arc * k * 0.55;
    const to = from + s.arc * 0.75;
    ctx.globalAlpha = a;
    ctx.strokeStyle = s.color || '#FFE6A3';
    ctx.lineWidth = 12 * (1 - k * 0.5);
    ctx.beginPath(); ctx.arc(s.x, s.y, s.range * (0.62 + k * 0.4), from, to); ctx.stroke();
    ctx.strokeStyle = 'rgba(255,255,255,.8)';
    ctx.lineWidth = 3.5 * (1 - k * 0.5);
    ctx.beginPath(); ctx.arc(s.x, s.y, s.range * (0.62 + k * 0.4), from, to); ctx.stroke();
    ctx.globalAlpha = 1;
  }
}

function drawParticles(ctx){
  const ps = G.particles, v = viewBounds(70);
  for (let i = 0; i < ps.length; i++){
    const p = ps[i];
    if (p.x < v.x0 || p.x > v.x1 || p.y < v.y0 || p.y > v.y1) continue;
    const a = clamp(p.life / p.max, 0, 1);
    const r = p.shrink ? p.r * (0.35 + a * 0.65) : p.r;
    ctx.globalAlpha = p.glow ? a : a * 0.9;
    if (p.shape === 'rock'){
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot);
      ctx.fillStyle = p.color; ctx.fillRect(-r, -r * 0.7, r * 2, r * 1.4);
      ctx.restore();
    } else if (p.shape === 'diamond'){
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot);
      ctx.fillStyle = p.color; ctx.beginPath(); ctx.moveTo(0, -r * 1.4); ctx.lineTo(r, 0); ctx.lineTo(0, r * 1.4); ctx.lineTo(-r, 0); ctx.closePath(); ctx.fill();
      ctx.restore();
    } else if (p.shape === 'ring'){
      ctx.strokeStyle = p.color; ctx.lineWidth = Math.max(1.2, r * 0.4);
      ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, TAU); ctx.stroke();
    } else if (p.shape === 'streak'){                         /* a spark: a short bright line along its motion, glowing */
      const sp = hyp(p.vx, p.vy) || 1, L = Math.min(26, 3 + sp * 0.045) * (0.4 + a * 0.6);
      ctx.strokeStyle = p.color; ctx.lineWidth = Math.max(1, r * 0.55); ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x - p.vx / sp * L, p.y - p.vy / sp * L); ctx.stroke();
      ctx.lineCap = 'butt';
    } else if (p.shape === 'wake'){                           /* a ring on the water, spreading and fading */
      const k = 1 - a;
      ctx.strokeStyle = p.color; ctx.lineWidth = 1.5; ctx.globalAlpha = a * 0.65;
      ctx.beginPath(); ctx.ellipse(p.x, p.y, p.r * (0.5 + k * 2), p.r * (0.5 + k * 2) * 0.5, 0, 0, TAU); ctx.stroke();
    } else if (p.shape === 'puff'){                           /* a soft smoke or dust puff that swells as it fades */
      ctx.fillStyle = p.color; ctx.globalAlpha = a * 0.5;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r * (1.1 + (1 - a) * 1.5), 0, TAU); ctx.fill();
    } else if (p.shape === 'flash'){                          /* an impact flash: a bright core that snaps out */
      ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = p.color; ctx.globalAlpha = a;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r * (0.6 + (1 - a) * 1.1), 0, TAU); ctx.fill();
      ctx.globalCompositeOperation = 'source-over';
    } else {
      ctx.fillStyle = p.color;
      ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, TAU); ctx.fill();
    }
    ctx.globalAlpha = 1;
  }
}

function drawTexts(ctx){
  const ts = G.texts, v = viewBounds(100);
  ctx.textAlign = 'center';
  let lastFont = '';                                       /* setting a font is the slow part: only when it changes */
  for (let i = 0; i < ts.length; i++){
    const t = ts[i];
    if (t.x < v.x0 || t.x > v.x1 || t.y < v.y0 || t.y > v.y1) continue;
    const a = clamp(t.life / t.max, 0, 1);
    const pop = 1 + (1 - t.pop) * (t.crit ? 0.9 : 0.5);
    ctx.globalAlpha = a;
    const fnt = (t.crit ? '900 ' : '700 ') + Math.round(t.size * pop) + 'px ui-sans-serif, "Segoe UI", Roboto, sans-serif';
    if (fnt !== lastFont){ ctx.font = fnt; lastFont = fnt; }
    if (t.crit && t.rot){ ctx.save(); ctx.translate(t.x, t.y); ctx.rotate(t.rot * (1 - t.pop * 0.6)); ctx.translate(-t.x, -t.y); }
    if (t.crit){                                                      /* a critical gets a warm halo behind the number */
      ctx.lineWidth = 8; ctx.strokeStyle = 'rgba(255,150,40,.4)'; ctx.lineJoin = 'round';
      ctx.strokeText(t.txt, t.x, t.y);
    }
    ctx.lineWidth = 3.5; ctx.strokeStyle = t.crit ? 'rgba(96,36,8,.95)' : 'rgba(18,13,10,.85)'; ctx.lineJoin = 'round';
    ctx.strokeText(t.txt, t.x, t.y);
    ctx.fillStyle = t.color;
    ctx.fillText(t.txt, t.x, t.y);
    if (t.crit && t.rot) ctx.restore();
    ctx.globalAlpha = 1;
  }
  ctx.textAlign = 'left';
}
