'use strict';
/* Longneck Town, fourteenth part: boats, the open sea, and Driftwood Cove, a small island town. */
/* ========================= 44zq. THE SEA ========================= */
/* 1 THE DEALERSHIP: Saltwind Boats at the Harbor sells four boats (skiff, launch, trawler, speedboat) and a mooring beside it launches them.
   2 SAILING (G.state 'sail'): a top-down sea of 6000 x 6000 units. A and D turn, W and S are the throttle (S goes below zero to reverse).
     Depth is a noise field with islands blended in: deep water, open water, shallows (slow the boat), sand, grass, forest, rocks and reefs
     (both bump and stop it). Foam, waves, seaweed, coral, palms and a lighthouse are drawn on top; floating barrels pay gold or gems, glinting
     shoals give a fish. Rain, fog and storms (the town's weather clock) change the picture and the handling.
   3 THE MAP: a corner map reveals the sea around the boat as it sails and is kept between trips (Save.data.town.sea.map: one character per
     100 units, 60 x 60).
   4 DRIFTWOOD COVE (district 'isle', not in TOWN_IDS): dock beside its pier at the island's south shore. Brine sells fish and Pearl sells crab.
     In a run, G eats a fish (heals 15% over 15 s, 45 s cooldown) and H eats a crab (a shell: damage taken x0.6 for 30 s, 60 s cooldown).
   Save.data.town.sea = { own: {id:1}, sel, map, fish, crab }. */
const SEA_W = 6000, SEA_C = 15, SEA_N = SEA_W / SEA_C, SEA_MAP_C = 100, SEA_MAP_N = SEA_W / SEA_MAP_C;
const BOATS = [
  { id: 'skiff', name: 'Rowing Skiff', price: 18000, vmax: 95, acc: 0.7, turn: 1.7, loot: 34, col: '#B8864E', desc: 'Slow and nimble. A good place to start.' },
  { id: 'launch', name: 'Motor Launch', price: 48000, vmax: 150, acc: 0.9, turn: 1.35, loot: 38, col: '#E8E8F0', desc: 'A steady motor and a little cabin.' },
  { id: 'trawler', name: 'Fishing Trawler', price: 105000, vmax: 125, acc: 0.5, turn: 0.95, loot: 70, col: '#C9503C', desc: 'Heavy, with a wide reach for loot and shoals.' },
  { id: 'speedboat', name: 'Speedboat', price: 190000, vmax: 255, acc: 1.3, turn: 1.9, loot: 34, col: '#4DA0D8', desc: 'Very fast. Mind the reefs.' }
];
const BOAT_BY_ID = {}; BOATS.forEach(function(b){ BOAT_BY_ID[b.id] = b; });
const Sea = { on: false, x: 0, y: 0, h: 0, v: 0, thr: 0, t: 0, shake: 0, trail: [], loot: [], shoals: [], seen: null, seenN: 0, saveT: 0, dockT: 0, bump: 0, from: 'harbour', pop: null, prev: {} };
const Fish = { cd: 0, on: 0 }, Crab = { cd: 0, on: 0 };

/* ---- the save ---- */
function seaData(){
  const t = townData();
  if (!t.sea || typeof t.sea !== 'object' || Array.isArray(t.sea)) t.sea = {};
  const s = t.sea;
  if (!s.own || typeof s.own !== 'object') s.own = {};
  if (typeof s.sel !== 'string' || !BOAT_BY_ID[s.sel] || !s.own[s.sel]) s.sel = Object.keys(s.own).filter(function(k){ return BOAT_BY_ID[k]; })[0] || '';
  s.fish = Math.max(0, Math.min(typeof seaCap === 'function' ? seaCap('fish') : 10, s.fish | 0)); s.crab = Math.max(0, Math.min(typeof seaCap === 'function' ? seaCap('crab') : 10, s.crab | 0));
  if (typeof s.map !== 'string') s.map = '';
  return s;
}
function boatOwned(){ return !!seaData().sel; }
function boatSel(){ return BOAT_BY_ID[seaData().sel] || BOATS[0]; }
function boatBuy(id){
  const b = BOAT_BY_ID[id], s = seaData(); if (!b || s.own[id]) return false;
  if (goldInt(Save.data.gold) < b.price){ SFX.deny(); return false; }
  Save.data.gold -= b.price; s.own[id] = 1; s.sel = id; Save.write(); SFX.buy(); SFX.level(); return true;
}

/* ---- the terrain: islands in a noise sea ---- */
function seaHash(a, b, s){ const n = Math.sin(a * 127.1 + b * 311.7 + s * 74.7) * 43758.5453; return n - Math.floor(n); }
function seaNoise(x, y, s){
  const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi, u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
  return seaHash(xi, yi, s) * (1 - u) * (1 - v) + seaHash(xi + 1, yi, s) * u * (1 - v) + seaHash(xi, yi + 1, s) * (1 - u) * v + seaHash(xi + 1, yi + 1, s) * u * v;
}
function seaFbm(x, y, s){ return seaNoise(x * 0.0035, y * 0.0035, s) * 0.5 + seaNoise(x * 0.009, y * 0.009, s + 3) * 0.3 + seaNoise(x * 0.022, y * 0.022, s + 7) * 0.2; }
const SEA_BLOBS = [
  { x: -1400, y: 3000, r: 2400 }, { x: 150, y: 900, r: 560 }, { x: 120, y: 5300, r: 650 },                  /* the mainland (a broad coast the town sits on), with two headlands */
  { x: 3700, y: 2500, r: 640 },                                                                              /* the island with the village */
  { x: 1700, y: 1300, r: 170 }, { x: 2300, y: 4200, r: 230 }, { x: 4700, y: 1000, r: 210 }, { x: 5100, y: 4300, r: 270 },
  { x: 3000, y: 5200, r: 160 }, { x: 1200, y: 4700, r: 190 }, { x: 4300, y: 3800, r: 140 }, { x: 2600, y: 1900, r: 130 }, { x: 5300, y: 2100, r: 150 }
];
const SEA_V = new Float32Array(SEA_N * SEA_N).fill(99), SEA_T = new Uint8Array(SEA_N * SEA_N);
const SEA_DEEP = 0, SEA_WATER = 1, SEA_SHALLOW = 2, SEA_SAND = 3, SEA_GRASS = 4, SEA_FOREST = 5, SEA_ROCK = 6, SEA_REEF = 7;
/* the open ocean at the map's edge grows deeper and darker over SEA_DEEP_BAND units: 0 in the shallows, 1 at the very edge */
const SEA_DEEP_BAND = 640, SEA_EDGE_LAND = 220;
function seaDeepF(x, y){ const e = Math.min(x, y, SEA_W - x, SEA_W - y); if (e >= SEA_DEEP_BAND) return 0; const f = Math.max(0, 1 - e / SEA_DEEP_BAND); return f * f * (3 - 2 * f); }
function seaLevel(x, y){
  const base = -0.28 - 0.34 * seaNoise(x * 0.0016, y * 0.0016, 11);
  let land = -9;
  for (let i = 0; i < SEA_BLOBS.length; i++){
    const b = SEA_BLOBS[i], dx = x - b.x, dy = y - b.y, d = Math.hypot(dx, dy) + (seaFbm(x, y, 5 + i) - 0.5) * b.r * 0.55;
    const q = 1 - d / b.r; if (q > -0.35) land = Math.max(land, q * 2.4);
  }
  const v = Math.max(base, land), f = seaDeepF(x, y);
  let w = f > 0 && v < 0 ? v * (1 - f) - f : v;                  /* all water, shallows and reefs too, sinks into the abyss toward the edge */
  const e = Math.min(x, y, SEA_W - x, SEA_W - y);
  if (e < SEA_EDGE_LAND){ const g = 1 - e / SEA_EDGE_LAND, k = g * g * (3 - 2 * g); w = w * (1 - k) - k; }     /* and even the land slips under in the last stretch, so the map ends in open water everywhere */
  return w;
}
let SEA_DOCKS = null;
function seaCell(cx, cy){
  if (cx < 0 || cy < 0 || cx >= SEA_N || cy >= SEA_N) return SEA_DEEP;                           /* past the edge is open water: you can sail out into the deep */
  const i = cy * SEA_N + cx;
  if (SEA_V[i] !== 99) return SEA_T[i];
  const x = cx * SEA_C + SEA_C / 2, y = cy * SEA_C + SEA_C / 2, v = seaLevel(x, y);
  let t;
  if (v < -0.4) t = SEA_DEEP; else if (v < -0.12) t = SEA_WATER; else if (v < 0.0) t = SEA_SHALLOW; else if (v < 0.12) t = SEA_SAND; else if (v < 0.55) t = SEA_GRASS; else t = SEA_FOREST;
  const nearDock = SEA_DOCKS && Object.keys(SEA_DOCKS).some(function(k){ return Math.hypot(x - SEA_DOCKS[k].wx, y - SEA_DOCKS[k].wy) < 320; });
  if (!nearDock){
    if (v < -0.15 && v > -0.55 && seaNoise(x * 0.008, y * 0.008, 9) > 0.8) t = SEA_REEF;
    else if (v > -0.1 && v < 0.0 && seaNoise(x * 0.05, y * 0.05, 3) > 0.8) t = SEA_ROCK;
  }
  SEA_V[i] = v; SEA_T[i] = t; return t;
}
function seaTypeAt(x, y){ return seaCell(Math.floor(x / SEA_C), Math.floor(y / SEA_C)); }
function seaBlocked(x, y){ const t = seaTypeAt(x, y); return t >= SEA_SAND; }
function seaFindDocks(){
  const o = {};
  let x = 1400; while (x > 0 && seaLevel(x, 3000) < 0.0) x -= 10;                                             /* the harbor: the mainland's east coast */
  o.harbour = { px: x, py: 3000, wx: x + 150, wy: 3000, ang: 0, name: 'Harbor' };
  let y = 2500; while (y < SEA_W && seaLevel(3700, y) > 0.0) y += 10;                                           /* the island: its south shore */
  o.isle = { px: 3700, py: y, wx: 3700, wy: y + 150, ang: Math.PI / 2, name: 'Driftwood Cove' };
  return o;
}
SEA_DOCKS = seaFindDocks();

/* ---- loot and shoals ---- */
function seaScatter(){
  const r = miniRng(townHash('sea' + Date.now()));
  Sea.loot = []; Sea.shoals = [];
  for (let tries = 0; tries < 400 && Sea.loot.length < 40; tries++){
    const x = 150 + r() * (SEA_W - 300), y = 150 + r() * (SEA_W - 300), t = seaTypeAt(x, y);
    if (t !== SEA_DEEP && t !== SEA_WATER) continue;
    Sea.loot.push({ x: x, y: y, k: r() < 0.25 ? 'gem' : 'gold', got: false, ph: r() * 6 });
  }
  for (let tries = 0; tries < 400 && Sea.shoals.length < 14; tries++){
    const x = 150 + r() * (SEA_W - 300), y = 150 + r() * (SEA_W - 300), t = seaTypeAt(x, y);
    if (t !== SEA_WATER && t !== SEA_SHALLOW) continue;
    Sea.shoals.push({ x: x, y: y, got: false, ph: r() * 6 });
  }
}

/* ---- the map memory ---- */
let SEA_MAPCV = null;
function seaMapColour(i){
  const x = (i % SEA_MAP_N) * SEA_MAP_C + SEA_MAP_C / 2, y = Math.floor(i / SEA_MAP_N) * SEA_MAP_C + SEA_MAP_C / 2, t = seaTypeAt(x, y);
  return ['#1C4E86', '#2E78B8', '#6FC0D8', '#E8D8A0', '#6AA84A', '#3E7A3A', '#7A7A82', '#C9628C'][t];
}
function seaMapLoad(){
  Sea.seen = new Uint8Array(SEA_MAP_N * SEA_MAP_N);
  const s = seaData().map; for (let i = 0; i < s.length && i < Sea.seen.length; i++) Sea.seen[i] = s.charAt(i) === '1' ? 1 : 0;
  SEA_MAPCV = document.createElement('canvas'); SEA_MAPCV.width = SEA_MAP_N; SEA_MAPCV.height = SEA_MAP_N;
  const g = SEA_MAPCV.getContext('2d'); g.fillStyle = '#0E0A08'; g.fillRect(0, 0, SEA_MAP_N, SEA_MAP_N);
  for (let i = 0; i < Sea.seen.length; i++) if (Sea.seen[i]){ g.fillStyle = seaMapColour(i); g.fillRect(i % SEA_MAP_N, Math.floor(i / SEA_MAP_N), 1, 1); }
}
function seaMapReveal(){
  if (!Sea.seen) return;
  const w = typeof townWeatherType === 'function' ? townWeatherType() : 'clear', rad = w === 'fog' ? 1 : w === 'storm' ? 2 : 3;
  const cx = Math.floor(Sea.x / SEA_MAP_C), cy = Math.floor(Sea.y / SEA_MAP_C), g = SEA_MAPCV.getContext('2d');
  const land = rad * 2 + 1;                                                    /* she cannot sail onto the shore, so the land is charted from twice as far: 7 cells in clear weather, 5 in a storm, 3 in fog */
  for (let dy = -land; dy <= land; dy++) for (let dx = -land; dx <= land; dx++){
    const d2 = dx * dx + dy * dy; if (d2 > land * land + 1) continue;
    const X = cx + dx, Y = cy + dy; if (X < 0 || Y < 0 || X >= SEA_MAP_N || Y >= SEA_MAP_N) continue;
    const i = Y * SEA_MAP_N + X;
    if (d2 > rad * rad + 1){ const ty = seaTypeAt(X * SEA_MAP_C + SEA_MAP_C / 2, Y * SEA_MAP_C + SEA_MAP_C / 2); if (ty < SEA_SAND || ty > SEA_ROCK) continue; }       /* beyond the water's range only land is seen */
    if (!Sea.seen[i]){ Sea.seen[i] = 1; Sea.seenN++; g.fillStyle = seaMapColour(i); g.fillRect(X, Y, 1, 1); }
  }
}
function seaMapSave(){
  if (!Sea.seen) return;
  let s = ''; for (let i = 0; i < Sea.seen.length; i++) s += Sea.seen[i] ? '1' : '0';
  const d = seaData(); if (d.map !== s){ d.map = s; Save.write(); }
}

/* ---- drawing the sea ---- */
/* The sea is painted smooth: the depth/height field is sampled bilinearly into a small picture (one sample every few screen pixels), colored
   through a gradient table in the palette of the ocean chapter, with soft wave ridges, caustics in the shallows and foam along the shore,
   then scaled up with smoothing. Trees, coral, rocks and shells are vector shapes drawn over it. */
const SEA_LUT = (function(){
  const n = 512, a = new Uint8ClampedArray(n * 3);
  const hex = function(h){ return [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)]; };
  const mix = function(c1, c2, k){ k = Math.max(0, Math.min(1, k)); return [c1[0] + (c2[0] - c1[0]) * k, c1[1] + (c2[1] - c1[1]) * k, c1[2] + (c2[2] - c1[2]) * k]; };
  for (let i = 0; i < n; i++){
    const v = i / (n - 1) * 2 - 1; let c;
    if (v < -0.8) c = mix(hex('#16406A'), hex('#0C2450'), (-0.8 - v) / 0.2);
    else if (v < -0.12) c = mix(hex('#16406A'), hex('#3A82B8'), (v + 0.8) / 0.68);
    else if (v < 0) c = mix(hex('#5CB8D4'), hex('#A4E4DC'), (v + 0.12) / 0.12);
    else if (v < 0.035) c = hex('#D2C48E');
    else if (v < 0.13) c = mix(hex('#EEE0AA'), hex('#E2D092'), (v - 0.035) / 0.095);
    else if (v < 0.55) c = mix(hex('#82BC5C'), hex('#5E9E42'), (v - 0.13) / 0.42);
    else c = mix(hex('#4E8E3E'), hex('#3A7434'), (v - 0.55) / 0.8);
    a[i * 3] = c[0]; a[i * 3 + 1] = c[1]; a[i * 3 + 2] = c[2];
  }
  return a;
})();
let SEA_OFF = null, SEA_OFFD = null;
function seaVAt(ix, iy){
  if (ix < 0 || iy < 0 || ix >= SEA_N || iy >= SEA_N){ const v = seaVAt(Math.max(0, Math.min(SEA_N - 1, ix)), Math.max(0, Math.min(SEA_N - 1, iy))); return -1; }   /* past the edge: the abyss */
  const i = iy * SEA_N + ix; if (SEA_V[i] === 99) seaCell(ix, iy); return SEA_V[i];
}
function seaDrawTerrain(ctx, W, H, z, camX, camY, t, weather){
  const step = Math.max(4, Math.round(W / 250)), sw = Math.ceil(W / step) + 1, sh = Math.ceil(H / step) + 1;
  if (!SEA_OFF || SEA_OFF.width !== sw || SEA_OFF.height !== sh){ SEA_OFF = document.createElement('canvas'); SEA_OFF.width = sw; SEA_OFF.height = sh; SEA_OFFD = SEA_OFF.getContext('2d').createImageData(sw, sh); }
  const px = SEA_OFFD.data, swell = weather === 'storm' ? 1.6 : weather === 'rain' ? 1.2 : 1, inv = 1 / (z * SEA_C), ox = camX - W / 2 / z, oy = camY - H / 2 / z, wk = 0.5 * 255;
  let o = 0;
  for (let j = 0; j < sh; j++){
    const wy = oy + j * step / z, gy = wy / SEA_C - 0.5, iy = Math.floor(gy), fy = gy - iy;
    for (let i = 0; i < sw; i++){
      const wx = ox + i * step / z, gx = wx / SEA_C - 0.5, ix = Math.floor(gx), fx = gx - ix;
      const v = seaVAt(ix, iy) * (1 - fx) * (1 - fy) + seaVAt(ix + 1, iy) * fx * (1 - fy) + seaVAt(ix, iy + 1) * (1 - fx) * fy + seaVAt(ix + 1, iy + 1) * fx * fy;
      let li = Math.floor((v + 1) * 255.5); li = li < 0 ? 0 : li > 511 ? 511 : li; li *= 3;
      let r = SEA_LUT[li], g = SEA_LUT[li + 1], b = SEA_LUT[li + 2];
      if (v < 0){
        const w = Math.sin(wx * 0.031 + wy * 0.021 + t * 1.1 * swell) * Math.sin(wx * 0.012 - wy * 0.019 - t * 0.7);
        if (w > 0.45){ const a = (w - 0.45) * 46 * (v < -0.6 ? 0.4 : 1); r += a; g += a; b += a; }
        if (v > -0.12){ const c = Math.max(0, Math.sin(wx * 0.085 + t * 1.3) * Math.sin(wy * 0.09 - t)) * 26; r += c; g += c; b += c * 0.8; }
        if (v > -0.05){ const f = (1 - Math.min(1, (0 - v) / 0.05)) * (0.55 + 0.45 * Math.sin(t * 1.8 + wx * 0.06 + wy * 0.05)); r += (255 - r) * f * 0.75; g += (255 - g) * f * 0.75; b += (255 - b) * f * 0.75; }
      } else if (v < 0.03){ const f = (1 - v / 0.03) * 0.5; r += (255 - r) * f; g += (255 - g) * f; b += (255 - b) * f; }
      px[o] = r; px[o + 1] = g; px[o + 2] = b; px[o + 3] = 255; o += 4;
    }
  }
  SEA_OFF.getContext('2d').putImageData(SEA_OFFD, 0, 0);
  ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(SEA_OFF, 0, 0, sw, sh, 0, 0, sw * step, sh * step);
  /* vector detail over it */
  const cs = SEA_C * z, x0 = Math.floor(ox / SEA_C) - 1, y0 = Math.floor(oy / SEA_C) - 1, nx = Math.ceil(W / cs) + 3, ny = Math.ceil(H / cs) + 3;
  for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++){
    const cx = x0 + i, cy = y0 + j, ty = seaCell(cx, cy), r = seaHash(cx, cy, 1);
    if (cx < 0 || cy < 0 || cx >= SEA_N || cy >= SEA_N) continue;
    const v = SEA_V[cy * SEA_N + cx], sx = (cx * SEA_C - camX) * z + W / 2, sy = (cy * SEA_C - camY) * z + H / 2, mx = sx + cs * (0.2 + r * 0.6), my = sy + cs * (0.2 + seaHash(cx, cy, 2) * 0.6);
    if (ty <= SEA_WATER){
      if (r > 0.9){ ctx.strokeStyle = 'rgba(255,255,255,' + (0.22 + 0.15 * Math.sin(t * 1.4 + r * 9)).toFixed(2) + ')'; ctx.lineWidth = 1.6 * z; ctx.lineCap = 'round'; ctx.beginPath(); ctx.arc(mx, my, 7 * z, 3.6, 5.8); ctx.stroke(); }
    } else if (ty === SEA_SHALLOW){
      if (r > 0.86){ ctx.strokeStyle = 'rgba(30,110,70,.6)'; ctx.lineWidth = 1.5 * z; ctx.lineCap = 'round'; for (let k = 0; k < 3; k++){ ctx.beginPath(); ctx.moveTo(mx + k * 3 * z, my + 8 * z); ctx.quadraticCurveTo(mx + k * 3 * z + Math.sin(t * 1.5 + r * 5 + k) * 3 * z, my, mx + k * 3 * z, my - 8 * z); ctx.stroke(); } }
    } else if (ty === SEA_SAND){
      if (r > 0.97) tCircle(ctx, '#F2A0B8', mx, my, 2.2 * z); else if (r > 0.78){ ctx.fillStyle = 'rgba(150,120,60,.3)'; ctx.beginPath(); ctx.arc(mx, my, 1.4 * z, 0, TAU); ctx.fill(); }
    } else if (ty === SEA_GRASS){
      if (r > 0.55){ ctx.strokeStyle = 'rgba(30,80,20,.45)'; ctx.lineWidth = 1.3 * z; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(mx, my + 5 * z); ctx.lineTo(mx - 2 * z, my - 3 * z); ctx.moveTo(mx + 2 * z, my + 5 * z); ctx.lineTo(mx + 4 * z, my - 4 * z); ctx.stroke(); }
      if (r > 0.94) tCircle(ctx, ['#FFD84D', '#FF8A5A', '#FFFFFF'][Math.floor(r * 100) % 3], mx, my, 2.2 * z);
    } else if (ty === SEA_FOREST){
      if (r > 0.25){ const rr = (9 + r * 8) * z; tCircle(ctx, 'rgba(10,40,10,.28)', mx + 3 * z, my + 4 * z, rr); tCircle(ctx, '#2F6A2C', mx, my, rr); tCircle(ctx, '#3E8A38', mx - rr * 0.18, my - rr * 0.2, rr * 0.7); tCircle(ctx, 'rgba(255,255,255,.14)', mx - rr * 0.3, my - rr * 0.35, rr * 0.3); }
    } else if (ty === SEA_ROCK){
      const rr = 8 * z; tCircle(ctx, 'rgba(0,0,0,.2)', mx + 2 * z, my + 3 * z, rr * 1.1); tPoly(ctx, '#6E6E78', [mx - rr, my + rr * 0.6, mx - rr * 0.4, my - rr, mx + rr * 0.7, my - rr * 0.7, mx + rr, my + rr * 0.5]); tPoly(ctx, '#A8A8B2', [mx - rr * 0.4, my - rr, mx + rr * 0.7, my - rr * 0.7, mx + rr * 0.1, my]);
    } else if (ty === SEA_REEF){
      for (let k = 0; k < 3; k++){ const rr = seaHash(cx, cy, 20 + k); tCircle(ctx, 'rgba(0,0,0,.15)', sx + cs * (0.2 + rr * 0.6) + 1.5, sy + cs * (0.2 + seaHash(cx, cy, 30 + k) * 0.6) + 2, cs * (0.2 + rr * 0.12)); tCircle(ctx, ['#E86A8A', '#F2A04A', '#B58CFF'][k], sx + cs * (0.2 + rr * 0.6), sy + cs * (0.2 + seaHash(cx, cy, 30 + k) * 0.6), cs * (0.2 + rr * 0.12)); }
    }
  }
}
function seaWorldToScreen(wx, wy, W, H, z, camX, camY){ return { x: (wx - camX) * z + W / 2, y: (wy - camY) * z + H / 2 }; }
function seaDrawBoat(ctx, x, y, ang, kind, t, scale, wob){
  const B = BOAT_BY_ID[kind] || BOATS[0], s = scale || 1;
  ctx.save(); ctx.translate(x, y); ctx.rotate(ang + (wob || 0)); ctx.scale(s, s);
  ctx.fillStyle = 'rgba(0,0,0,.2)'; ctx.beginPath(); ctx.ellipse(3, 4, 34, 15, 0, 0, TAU); ctx.fill();
  switch (kind){
    case 'launch':
      ctx.fillStyle = '#E8E8F0'; ctx.beginPath(); ctx.moveTo(40, 0); ctx.quadraticCurveTo(30, -17, -10, -17); ctx.lineTo(-34, -15); ctx.lineTo(-34, 15); ctx.lineTo(-10, 17); ctx.quadraticCurveTo(30, 17, 40, 0); ctx.fill();
      ctx.fillStyle = '#2F5F94'; ctx.fillRect(-34, -3, 70, 6); ctx.fillStyle = '#C9CDD9'; ctx.fillRect(-26, -10, 28, 20); ctx.fillStyle = '#9FD8F2'; ctx.fillRect(-4, -8, 6, 16);
      break;
    case 'trawler':
      ctx.fillStyle = '#C9503C'; ctx.beginPath(); ctx.moveTo(48, 0); ctx.quadraticCurveTo(38, -22, 0, -22); ctx.lineTo(-44, -20); ctx.lineTo(-44, 20); ctx.lineTo(0, 22); ctx.quadraticCurveTo(38, 22, 48, 0); ctx.fill();
      ctx.fillStyle = '#F4F1E8'; ctx.fillRect(-20, -14, 26, 28); ctx.fillStyle = '#2A2A34'; ctx.fillRect(-4, -10, 6, 20);
      ctx.strokeStyle = '#3A3A44'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-40, -14); ctx.lineTo(-24, -14); ctx.moveTo(-40, 14); ctx.lineTo(-24, 14); ctx.stroke(); ctx.fillStyle = '#3A3A44'; ctx.fillRect(-42, -3, 12, 6);
      break;
    case 'speedboat':
      ctx.fillStyle = '#4DA0D8'; ctx.beginPath(); ctx.moveTo(46, 0); ctx.quadraticCurveTo(24, -13, -8, -13); ctx.lineTo(-34, -10); ctx.lineTo(-34, 10); ctx.lineTo(-8, 13); ctx.quadraticCurveTo(24, 13, 46, 0); ctx.fill();
      ctx.fillStyle = '#F4F1E8'; ctx.fillRect(-30, -2.4, 70, 4.8); ctx.fillStyle = '#D5352B'; ctx.fillRect(-30, -5, 8, 10); ctx.fillStyle = '#2A2A34'; ctx.fillRect(-36, -4, 5, 8);
      break;
    default:
      ctx.fillStyle = '#B8864E'; ctx.beginPath(); ctx.moveTo(34, 0); ctx.quadraticCurveTo(22, -14, -6, -14); ctx.lineTo(-26, -11); ctx.lineTo(-26, 11); ctx.lineTo(-6, 14); ctx.quadraticCurveTo(22, 14, 34, 0); ctx.fill();
      ctx.fillStyle = '#8A5A32'; ctx.fillRect(-18, -12, 4, 24); ctx.fillRect(2, -12, 4, 24);
      ctx.strokeStyle = '#6A4A28'; ctx.lineWidth = 2.4; ctx.beginPath(); ctx.moveTo(-8, -10); ctx.lineTo(-24, -26 + Math.sin(t * 4) * 3); ctx.moveTo(-8, 10); ctx.lineTo(-24, 26 - Math.sin(t * 4) * 3); ctx.stroke();
  }
  ctx.restore();
}
/* her, from above (drawn by the caller after the boat's fittings, in the boat's own space, so no rail or seat crosses her), in the same style as the giraffe on land
   (js/art/33-giraffe-art.js): her chosen coat, spot color and pattern, no outline, the same head (a coat head, a dark muzzle, ossicones with knobs, ears) and small dark eyes.
   Her neck is a bent line from the shoulder to the head and it moves by itself: she sways her head and now and then looks about, so she is not stuck to the boat.
   seaRiderPose(t) says where the head is (a: the neck's angle, 0 is straight ahead and positive is to the boat's right; L: its length) and, when she holds a rod
   (js/sea/44zzv-fishing.js), { len, da (the rod's angle from the head's), bend, s (the side) }. The end of the rod is kept in seaRiderTip, in screen pixels, for the line. */
let seaRiderTip = null;
function seaRiderPose(t){
  const look = Math.pow(Math.max(0, Math.sin(t * 0.37)), 6) * (Math.sin(t * 0.11) > 0 ? 1 : -1);
  return { a: 0.26 * Math.sin(t * 1.1) + 0.55 * look, L: 22 + 1.6 * Math.sin(t * 1.7), rod: null };
}
function seaDrawRider(ctx, t){
  const cl = typeof giraffeColours === 'function' ? giraffeColours() : { coat: '#D6A44F', spot: '#8A5A24', dark: '#A8762F' };
  const dark = cl.dark || cl.spot, pat = typeof giraffePattern === 'function' ? giraffePattern() : 0, P = seaRiderPose(t || 0);
  ctx.lineCap = 'round';
  ctx.strokeStyle = dark; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-16, 0); ctx.quadraticCurveTo(-21, 3, -23, 6); ctx.stroke(); ctx.fillStyle = cl.spot; ctx.beginPath(); ctx.arc(-23, 6.4, 1.8, 0, TAU); ctx.fill();
  ctx.fillStyle = cl.coat; ctx.beginPath(); ctx.ellipse(-5, 0, 12.5, 8.6, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = cl.spot;
  [[-9, -2.8, 2.9, 2.3], [-2, 3, 2.6, 2.1], [-11, 3.8, 2, 1.7], [2, -3.2, 1.8, 1.5]].forEach(function(q){ if (typeof wardSpot === 'function') wardSpot(ctx, pat, q[0], q[1], q[2], q[3], 0); else { ctx.beginPath(); ctx.ellipse(q[0], q[1], q[2], q[3], 0, 0, TAU); ctx.fill(); } });
  /* the neck: from the shoulder, in a gentle curve, to the head */
  const bx = 3, hx = bx + P.L * Math.cos(P.a), hy = P.L * Math.sin(P.a), cx = bx + P.L * 0.55 * Math.cos(P.a * 0.35), cy = P.L * 0.55 * Math.sin(P.a * 0.35);
  ctx.strokeStyle = cl.coat; ctx.lineWidth = 6.6; ctx.beginPath(); ctx.moveTo(bx, 0); ctx.quadraticCurveTo(cx, cy, hx, hy); ctx.stroke();
  ctx.strokeStyle = dark; ctx.lineWidth = 1.3; ctx.beginPath(); ctx.moveTo(bx, 0); ctx.quadraticCurveTo(cx, cy, hx, hy); ctx.stroke();
  ctx.fillStyle = cl.spot;
  [0.3, 0.6].forEach(function(u){ const x = (1 - u) * (1 - u) * bx + 2 * u * (1 - u) * cx + u * u * hx, y = 2 * u * (1 - u) * cy + u * u * hy; ctx.beginPath(); ctx.arc(x, y + 1.2, 1.5, 0, TAU); ctx.fill(); });
  /* the head, as drawn on land, a little smaller than the body */
  ctx.save(); ctx.translate(hx, hy); ctx.rotate(P.a); ctx.scale(0.92, 0.92);
  ctx.fillStyle = cl.coat; ctx.beginPath(); ctx.ellipse(2, 0, 11, 7.6, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = dark; ctx.beginPath(); ctx.ellipse(10, 0, 5.4, 4.4, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = '#2B1D12'; ctx.beginPath(); ctx.arc(13, -1.8, 1.1, 0, TAU); ctx.arc(13, 1.8, 1.1, 0, TAU); ctx.fill();
  ctx.strokeStyle = dark; ctx.lineWidth = 2.6; ctx.beginPath(); ctx.moveTo(-3, -4.6); ctx.lineTo(-6, -8.6); ctx.moveTo(-3, 4.6); ctx.lineTo(-6, 8.6); ctx.stroke();
  ctx.fillStyle = '#4A2E12'; ctx.beginPath(); ctx.arc(-6.4, -9, 2.3, 0, TAU); ctx.arc(-6.4, 9, 2.3, 0, TAU); ctx.fill();
  ctx.fillStyle = cl.coat; ctx.beginPath(); ctx.ellipse(-6, -7.5, 4.4, 2.3, -0.7, 0, TAU); ctx.ellipse(-6, 7.5, 4.4, 2.3, 0.7, 0, TAU); ctx.fill();
  ctx.fillStyle = '#2B1D12'; ctx.beginPath(); ctx.arc(5.2, -4.6, 1.3, 0, TAU); ctx.arc(5.2, 4.6, 1.3, 0, TAU); ctx.fill();
  ctx.restore();
  /* a rod held in her mouth: it bends with the fish, and its end is where the line starts */
  if (P.rod && P.rod.len > 1){
    const mx = hx + Math.cos(P.a) * 11.5, my = hy + Math.sin(P.a) * 11.5, ang = P.a + P.rod.da, len = P.rod.len;
    const tx = mx + len * Math.cos(ang), ty = my + len * Math.sin(ang), bend = P.rod.bend * len * 0.3 * P.rod.s;
    const qx = (mx + tx) / 2 - Math.sin(ang) * bend, qy = (my + ty) / 2 + Math.cos(ang) * bend;
    ctx.strokeStyle = '#6A4A2A'; ctx.lineWidth = 2.4; ctx.beginPath(); ctx.moveTo(mx, my); ctx.quadraticCurveTo(qx, qy, tx, ty); ctx.stroke();
    ctx.strokeStyle = '#B8935A'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(mx + (qx - mx) * 0.5, my + (qy - my) * 0.5); ctx.quadraticCurveTo((qx + tx) / 2, (qy + ty) / 2, tx, ty); ctx.stroke();
    ctx.fillStyle = '#3A3A44'; ctx.beginPath(); ctx.arc(mx + (qx - mx) * 0.3, my + (qy - my) * 0.3 + 1.4, 2.2, 0, TAU); ctx.fill();
    try { const m = ctx.getTransform(), pt = m.transformPoint(new DOMPoint(tx, ty)); seaRiderTip = [pt.x / (G.dpr || 1), pt.y / (G.dpr || 1)]; } catch (e) { seaRiderTip = null; }
  }
}
function seaDrawFeatures(ctx, W, H, z, camX, camY, t){
  const sc = function(wx, wy){ return seaWorldToScreen(wx, wy, W, H, z, camX, camY); }, vw = W / z / 2 + 160, vh = H / z / 2 + 160;
  Object.keys(SEA_DOCKS).forEach(function(k){
    const d = SEA_DOCKS[k]; if (Math.abs(d.px - camX) > vw + 100 || Math.abs(d.py - camY) > vh + 100) return;
    ctx.save(); const p = sc(d.px, d.py); ctx.translate(p.x, p.y); ctx.rotate(d.ang); ctx.scale(z, z);
    ctx.fillStyle = 'rgba(0,0,0,.18)'; ctx.fillRect(-24, -14, 150, 36);
    ctx.fillStyle = '#8A6A44'; ctx.fillRect(-30, -12, 130, 24); ctx.strokeStyle = 'rgba(40,24,10,.5)'; ctx.lineWidth = 1; for (let i = -28; i < 100; i += 9){ ctx.beginPath(); ctx.moveTo(i, -12); ctx.lineTo(i, 12); ctx.stroke(); }
    ctx.fillStyle = '#4A3624'; for (let i = 0; i < 4; i++){ ctx.fillRect(i * 34 - 28, -15, 6, 6); ctx.fillRect(i * 34 - 28, 9, 6, 6); }
    ctx.fillStyle = '#D5352B'; ctx.fillRect(96, -10, 5, 20);
    ctx.restore();
    ctx.fillStyle = '#FFF6E0'; ctx.font = '700 ' + Math.round(12 * z) + 'px system-ui'; ctx.textAlign = 'center';
    const lp = sc(d.wx + Math.cos(d.ang) * 20 - Math.sin(d.ang) * 54, d.wy + Math.sin(d.ang) * 20 + Math.cos(d.ang) * 54); ctx.fillText(d.name, lp.x, lp.y);
  });
  /* the village on the island: roofs seen from above, and the lighthouse */
  const d = SEA_DOCKS.isle;
  for (let i = 0; i < 9; i++){
    const hx = d.px + (i - 4) * 46 + (i % 2) * 8, hy = d.py - 70 - (i % 3) * 34, p = sc(hx, hy);
    if (p.x < -60 || p.x > W + 60 || p.y < -60 || p.y > H + 60) continue;
    ctx.fillStyle = 'rgba(0,0,0,.2)'; ctx.fillRect(p.x - 14 * z + 3, p.y - 12 * z + 3, 30 * z, 26 * z);
    ctx.fillStyle = ['#C9503C', '#B5603A', '#8A4A3A'][i % 3]; ctx.fillRect(p.x - 15 * z, p.y - 13 * z, 30 * z, 26 * z);
    ctx.fillStyle = 'rgba(0,0,0,.18)'; ctx.fillRect(p.x, p.y - 13 * z, 15 * z, 26 * z); ctx.fillStyle = '#E8D8B0'; ctx.fillRect(p.x - 2 * z, p.y - 13 * z, 4 * z, 26 * z);
  }
  const lh = sc(d.px + 260, d.py - 160);
  if (lh.x > -80 && lh.x < W + 80 && lh.y > -80 && lh.y < H + 80){
    tCircle(ctx, 'rgba(0,0,0,.2)', lh.x + 4, lh.y + 4, 26 * z); tCircle(ctx, '#F4F1E8', lh.x, lh.y, 24 * z); tCircle(ctx, '#D5352B', lh.x, lh.y, 16 * z); tCircle(ctx, '#FFE9A0', lh.x, lh.y, 7 * z);
    const a = t * 1.2; ctx.strokeStyle = 'rgba(255,240,160,.45)'; ctx.lineWidth = 4 * z; ctx.beginPath(); ctx.moveTo(lh.x, lh.y); ctx.lineTo(lh.x + Math.cos(a) * 130 * z, lh.y + Math.sin(a) * 130 * z); ctx.stroke();
  }
  /* loot and shoals */
  Sea.loot.forEach(function(l){
    if (l.got || Math.abs(l.x - camX) > vw || Math.abs(l.y - camY) > vh) return;
    const p = sc(l.x, l.y + Math.sin(t * 1.6 + l.ph) * 3), r = 11 * z;
    tCircle(ctx, 'rgba(0,0,0,.2)', p.x + 2, p.y + 3, r);
    if (l.k === 'gem'){ tPoly(ctx, '#7AE8FF', [p.x, p.y - r, p.x + r, p.y, p.x, p.y + r, p.x - r, p.y]); tPoly(ctx, '#CFF6FF', [p.x, p.y - r, p.x + r * 0.4, p.y, p.x, p.y]); }
    else { tCircle(ctx, '#8A5A32', p.x, p.y, r); ctx.strokeStyle = '#3A2A1E'; ctx.lineWidth = 2 * z; ctx.beginPath(); ctx.arc(p.x, p.y, r * 0.6, 0, TAU); ctx.stroke(); ctx.beginPath(); ctx.moveTo(p.x - r, p.y); ctx.lineTo(p.x + r, p.y); ctx.stroke(); }
  });
  Sea.shoals.forEach(function(s){
    if (s.got || Math.abs(s.x - camX) > vw || Math.abs(s.y - camY) > vh) return;
    for (let k = 0; k < 7; k++){
      const a = t * 0.8 + k * 0.9 + s.ph, rr = 14 + (k % 3) * 8, p = sc(s.x + Math.cos(a) * rr, s.y + Math.sin(a) * rr * 0.7);
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(a + Math.PI / 2); ctx.fillStyle = 'rgba(20,50,80,.55)'; ctx.beginPath(); ctx.ellipse(0, 0, 3.2 * z, 8 * z, 0, 0, TAU); ctx.fill(); ctx.restore();
    }
    const gl = 0.4 + 0.4 * Math.sin(t * 4 + s.ph), p0 = sc(s.x, s.y); ctx.fillStyle = 'rgba(255,255,255,' + gl.toFixed(2) + ')'; ctx.fillRect(p0.x - 1.5, p0.y - 14 * z, 3, 3);
  });
}
function seaDrawMap(ctx, W, H, s){
  if (!SEA_MAPCV) return;
  const ms = Math.min(150 * s, W * 0.3), mx = W - ms - 12, my = H - ms - 12;
  ctx.fillStyle = 'rgba(14,10,8,.7)'; ctx.beginPath(); ctx.roundRect(mx - 6, my - 18 * s, ms + 12, ms + 24 * s, 8); ctx.fill(); ctx.strokeStyle = 'rgba(242,179,61,.5)'; ctx.lineWidth = 1.2; ctx.stroke();
  ctx.fillStyle = '#E8D8B0'; ctx.font = '600 ' + Math.round(10.5 * s) + 'px system-ui,sans-serif'; ctx.textAlign = 'left'; ctx.fillText('SEA CHART  ·  ' + Math.round(Sea.seenN / (SEA_MAP_N * SEA_MAP_N) * 100) + '%', mx, my - 5 * s);
  ctx.imageSmoothingEnabled = false; ctx.drawImage(SEA_MAPCV, mx, my, ms, ms); ctx.imageSmoothingEnabled = true;
  const k = ms / SEA_W;
  Object.keys(SEA_DOCKS).forEach(function(n){ const d = SEA_DOCKS[n], ci = Math.floor(d.px / SEA_MAP_C) + Math.floor(d.py / SEA_MAP_C) * SEA_MAP_N; if (Sea.seen[ci]){ ctx.fillStyle = '#FFD84D'; ctx.fillRect(mx + d.px * k - 2, my + d.py * k - 2, 4, 4); } });
  const bx = mx + Sea.x * k, by = my + Sea.y * k;
  ctx.save(); ctx.translate(bx, by); ctx.rotate(Sea.h); ctx.fillStyle = '#FFFFFF'; ctx.beginPath(); ctx.moveTo(6, 0); ctx.lineTo(-4, -3.6); ctx.lineTo(-4, 3.6); ctx.closePath(); ctx.fill(); ctx.restore();
}
function renderSea(ctx){
  const W = G.W, H = G.H, h = townHour(), dark = townDark(h), weather = typeof townWeatherType === 'function' ? townWeatherType() : 'clear';
  const z = clamp(H / 520, 0.8, 1.7), s = clamp(Math.min(H / 600, W / 800), 0.8, 1.2);
  const shx = Sea.shake > 0 ? (Math.random() - 0.5) * 8 * Sea.shake : 0, shy = Sea.shake > 0 ? (Math.random() - 0.5) * 8 * Sea.shake : 0;
  ctx.save(); ctx.translate(shx, shy);
  const camX = Sea.x, camY = Sea.y, B = boatSel();
  seaDrawTerrain(ctx, W, H, z, camX, camY, Sea.t, weather);
  seaDrawFeatures(ctx, W, H, z, camX, camY, Sea.t);
  /* the wake, then the boat */
  Sea.trail.forEach(function(p){ const a = 1 - p.age / 2.2; if (a <= 0) return; const q = seaWorldToScreen(p.x, p.y, W, H, z, camX, camY); ctx.fillStyle = 'rgba(255,255,255,' + (a * 0.45).toFixed(2) + ')'; ctx.beginPath(); ctx.arc(q.x, q.y, (3 + p.age * 5) * z, 0, TAU); ctx.fill(); });
  const bp = seaWorldToScreen(Sea.x, Sea.y, W, H, z, camX, camY);
  seaDrawBoat(ctx, bp.x, bp.y, Sea.h, B.id, Sea.t, z, Math.sin(Sea.t * 2.3) * 0.03 * (weather === 'storm' ? 3 : 1));
  if (Sea.pop){ ctx.globalAlpha = 1 - Sea.pop.t / 1.3; miniText(ctx, Sea.pop.txt, bp.x, bp.y - 40 * z - Sea.pop.t * 30, 16 * s, '#FFE9A0'); ctx.globalAlpha = 1; }
  ctx.restore();
  /* the weather and the hour over the whole picture */
  if (dark > 0.02){ ctx.fillStyle = 'rgba(8,16,50,' + (dark * 0.5).toFixed(3) + ')'; ctx.fillRect(0, 0, W, H); }
  if (weather === 'rain' || weather === 'storm'){
    ctx.fillStyle = 'rgba(30,40,60,' + (weather === 'storm' ? 0.3 : 0.15) + ')'; ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = 'rgba(210,225,245,.45)'; ctx.lineWidth = 1.4; ctx.beginPath();
    for (let i = 0; i < (weather === 'storm' ? 110 : 60); i++){ const x = ((i * 137 + Sea.t * 420) % (W + 60)) - 30, y = ((i * 91 + Sea.t * 760) % (H + 60)) - 30; ctx.moveTo(x, y); ctx.lineTo(x - 7, y + 17); }
    ctx.stroke();
    if (weather === 'storm' && Math.sin(Sea.t * 0.7) > 0.985){ ctx.fillStyle = 'rgba(255,255,255,.35)'; ctx.fillRect(0, 0, W, H); }
  } else if (weather === 'fog'){
    const g = ctx.createRadialGradient(bp.x, bp.y, 80 * z, bp.x, bp.y, 330 * z); g.addColorStop(0, 'rgba(225,232,240,0)'); g.addColorStop(1, 'rgba(225,232,240,.92)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  }
  /* the instruments */
  ctx.fillStyle = 'rgba(14,10,8,.55)'; ctx.beginPath(); ctx.roundRect(10, 10, Math.min(W - 20, 320 * s), 54 * s, 10); ctx.fill();
  miniText(ctx, B.name, 22, 36 * s, 19 * s, '#FFE9A0', 'left');
  miniText(ctx, SEA_DOCKS && Sea.nearDock ? 'Slow right down to dock at ' + Sea.nearDock : (weather === 'clear' ? 'Calm seas' : weather === 'fog' ? 'Fog: short sight' : weather === 'rain' ? 'Rain' : 'Storm: heavy swell'), 22, 55 * s, 12.5 * s, '#E8D8B0', 'left', false);
  const gx = 14, gy = H - 54 * s, gw = 150 * s;
  ctx.fillStyle = 'rgba(14,10,8,.62)'; ctx.beginPath(); ctx.roundRect(gx - 4, gy - 16, gw + 8, 30 * s + 8, 6); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,.14)'; ctx.fillRect(gx, gy, gw, 10 * s);
  ctx.fillStyle = Sea.thr < 0 ? '#FF9A6A' : '#6BE08A'; if (Sea.thr >= 0) ctx.fillRect(gx + gw * 0.25, gy, gw * 0.75 * Sea.thr, 10 * s); else ctx.fillRect(gx + gw * 0.25 + gw * 0.25 * Sea.thr / 0.35, gy, -gw * 0.25 * Sea.thr / 0.35, 10 * s);
  ctx.fillStyle = '#FFF6E0'; ctx.fillRect(gx + gw * 0.25 - 1, gy - 3, 2, 10 * s + 6);
  ctx.fillStyle = '#E8D8B0'; ctx.font = '600 11px system-ui,sans-serif'; ctx.textAlign = 'left'; ctx.fillText('THROTTLE  ' + Math.round(Sea.thr * 100) + '%   SPEED  ' + Math.round(Math.abs(Sea.v) / 4), gx, gy - 4);
  ctx.save(); ctx.translate(W - 44 * s, 62 * s); ctx.fillStyle = 'rgba(14,10,8,.6)'; ctx.beginPath(); ctx.arc(0, 0, 26 * s, 0, TAU); ctx.fill(); ctx.strokeStyle = 'rgba(242,179,61,.5)'; ctx.stroke();
  ctx.fillStyle = '#E8D8B0'; ctx.font = '700 10px system-ui'; ctx.textAlign = 'center'; ctx.fillText('N', 0, -14 * s); ctx.rotate(Sea.h + Math.PI / 2); ctx.fillStyle = '#FF6A5A'; ctx.beginPath(); ctx.moveTo(0, -18 * s); ctx.lineTo(-5 * s, 4 * s); ctx.lineTo(5 * s, 4 * s); ctx.fill(); ctx.restore();
  seaDrawMap(ctx, W, H, s);
  if (Sea.t < 9) miniText(ctx, Input.hasTouch ? 'Hold a finger where you want to sail.' : 'W / S: throttle  ·  A / D: turn  ·  Slow down by a dock to land  ·  Esc: back to the harbor', W / 2, H - 16 * s, 13 * s, '#FFF6E0', 'center', false);
  drawFade(ctx);
}

/* ---- sailing ---- */
function seaStart(from){
  if (!boatOwned()) return;
  const d = SEA_DOCKS[from];
  Town.car = false; Town.hold = false; Town.panel = false; if (typeof townCloseDialog === 'function') townCloseDialog(true);
  Sea.on = true; Sea.from = from; Sea.x = d.wx + Math.cos(d.ang) * 70; Sea.y = d.wy + Math.sin(d.ang) * 70; Sea.h = d.ang; Sea.v = 0; Sea.thr = 0; Sea.t = 0; Sea.shake = 0; Sea.trail = []; Sea.dockT = -2; Sea.pop = null; Sea.nearDock = '';
  seaScatter(); seaMapLoad(); Sea.seenN = 0; for (let i = 0; i < Sea.seen.length; i++) if (Sea.seen[i]) Sea.seenN++;
  const t = townData(); t.n.sails = (t.n.sails | 0) + 1; Save.write();
  G.state = 'sail'; G.attract = false; G.subScreen = ''; G.townReturn = false;
  HUD.classList.remove('on'); TOUCH.classList.remove('on'); PAUSEBTN.classList.remove('on'); hideOverlay();
  Input.sx = G.W / 2; Input.sy = G.H / 2;
  SFX.level(); screenFadeIn(0.5);
}
function seaArrive(where){
  if (!Sea.on) return;
  Sea.on = false; seaMapSave();
  const t = townData(); t.n.seaDock = (t.n.seaDock | 0) + 1; Save.write();
  if (where === 'isle') townEnter('isle', 260, 1); else townEnter('harbour', 1100, 1);
}
function updateSea(dt){
  dt = Math.min(dt, 0.05); Sea.t += dt; G.time += dt;
  if (Sea.shake > 0) Sea.shake = Math.max(0, Sea.shake - dt * 1.5);
  const B = boatSel(), k = Input.keys, any = function(a){ for (let i = 0; i < a.length; i++) if (k[a[i]]) return true; return false; };
  const weather = typeof townWeatherType === 'function' ? townWeatherType() : 'clear';
  let turnIn = (any(['KeyD', 'ArrowRight', keyOf('right')]) ? 1 : 0) - (any(['KeyA', 'ArrowLeft', keyOf('left')]) ? 1 : 0);
  let thrIn = (any(['KeyW', 'ArrowUp', keyOf('up')]) ? 1 : 0) - (any(['KeyS', 'ArrowDown', keyOf('down')]) ? 1 : 0);
  if (Input.padOn){ if (Math.abs(Input.padX) > 0.25) turnIn += Input.padX; if (Math.abs(Input.padY) > 0.25) thrIn -= Input.padY; }
  if (Input.mdown && !turnIn && !thrIn){                                       /* a held finger sails toward it */
    const dx = Input.sx - G.W / 2, dy = Input.sy - G.H / 2, want = Math.atan2(dy, dx);
    let da = want - Sea.h; while (da > Math.PI) da -= TAU; while (da < -Math.PI) da += TAU;
    turnIn = clamp(da * 2, -1, 1); thrIn = 1;
  }
  turnIn = clamp(turnIn, -1, 1); thrIn = clamp(thrIn, -1, 1);
  Sea.thr = clamp(Sea.thr + thrIn * dt * 0.7, -0.35, 1);
  if (!thrIn && Math.abs(Sea.thr) < 0.03) Sea.thr = 0;
  const here = seaTypeAt(Sea.x, Sea.y), shMul = here === SEA_SHALLOW ? 0.55 : 1, wMul = weather === 'storm' ? 0.82 : weather === 'rain' ? 0.94 : 1;
  const target = Sea.thr * B.vmax * wMul * shMul;
  Sea.v += (target - Sea.v) * Math.min(1, dt * B.acc * 1.4);
  const steer = B.turn * (0.3 + 0.7 * Math.min(1, Math.abs(Sea.v) / (B.vmax * 0.35))) * (Sea.v < -2 ? -1 : 1);
  Sea.h += turnIn * steer * dt;
  const nx = Sea.x + Math.cos(Sea.h) * Sea.v * dt, ny = Sea.y + Math.sin(Sea.h) * Sea.v * dt;
  const ax = nx + Math.cos(Sea.h) * 22, ay = ny + Math.sin(Sea.h) * 22;
  if (seaBlocked(nx, ny) || seaBlocked(ax, ay)){
    if (Sea.bump <= 0 && Math.abs(Sea.v) > 25){ Sea.shake = Math.min(1, Math.abs(Sea.v) / 160); try { SFX.tone('square', 110, 60, 0.15, 0.1, 0, 0); } catch (e) {} Sea.pop = { x: Sea.x, y: Sea.y, t: 0, txt: 'bump!' }; }
    Sea.bump = 0.35; Sea.v *= -0.25; Sea.thr = Math.min(Sea.thr, 0.05);
  } else { Sea.x = nx; Sea.y = ny; }
  if (Sea.bump > 0) Sea.bump -= dt;
  /* the wake */
  if (Math.abs(Sea.v) > 12){ Sea.trail.push({ x: Sea.x - Math.cos(Sea.h) * 30, y: Sea.y - Math.sin(Sea.h) * 30, age: 0 }); }
  for (let i = Sea.trail.length - 1; i >= 0; i--){ Sea.trail[i].age += dt; if (Sea.trail[i].age > 2.2) Sea.trail.splice(i, 1); }
  if (Sea.trail.length > 90) Sea.trail.splice(0, Sea.trail.length - 90);
  /* engine and sea sounds */
  Sea.engT = (Sea.engT || 0) - dt; if (Sea.engT <= 0){ Sea.engT = 0.18; try { SFX.tone('sawtooth', 55 + Math.abs(Sea.v) * 0.25, 55 + Math.abs(Sea.v) * 0.25, 0.2, 0.02, 0, 0); } catch (e) {} }
  /* loot and shoals */
  const reach = B.loot, t = townData(), sd = seaData();
  Sea.loot.forEach(function(l){
    if (l.got || Math.hypot(l.x - Sea.x, l.y - Sea.y) > reach) return;
    l.got = true; t.n.seaLoot = (t.n.seaLoot | 0) + 1;
    const msg = townPay(l.k === 'gem' ? { gems: 6 } : { coin: 1 + Math.floor(Math.random() * 3) });
    Sea.pop = { x: l.x, y: l.y, t: 0, txt: '+ ' + msg }; try { SFX.coin(); } catch (e) {}
  });
  Sea.shoals.forEach(function(sh){
    if (sh.got || Math.hypot(sh.x - Sea.x, sh.y - Sea.y) > reach + 8) return;
    sh.got = true;
    if (sd.fish < seaCap('fish')){ sd.fish++; Sea.pop = { x: sh.x, y: sh.y, t: 0, txt: 'a fish!' }; } else Sea.pop = { x: sh.x, y: sh.y, t: 0, txt: 'a fish (you are full)' };
    Save.write(); try { SFX.pick(); } catch (e) {}
  });
  if (Sea.pop){ Sea.pop.t += dt; if (Sea.pop.t > 1.3) Sea.pop = null; }
  /* the map grows, and is saved now and then */
  seaMapReveal(); Sea.saveT += dt; if (Sea.saveT > 6){ Sea.saveT = 0; seaMapSave(); }
  /* docking: slow down beside a dock */
  Sea.nearDock = '';
  Object.keys(SEA_DOCKS).forEach(function(n){
    const d = SEA_DOCKS[n];
    if (Math.hypot(Sea.x - d.wx, Sea.y - d.wy) < 80){
      Sea.nearDock = d.name;
      if (Math.abs(Sea.v) < 28 && Sea.t > 2){ Sea.dockT += dt; if (Sea.dockT > 0.8) seaArrive(n); } else Sea.dockT = Math.min(Sea.dockT, 0);
    }
  });
  if (!Sea.nearDock) Sea.dockT = 0;
}
(function(){
  const st = step, rn = render;
  step = function(dt){ if (Sea.on && G.state === 'sail') updateSea(dt); return st(dt); };
  render = function(){
    if (Sea.on && G.state === 'sail'){ const ctx = CTX; if (!ctx) return; ctx.setTransform(G.dpr, 0, 0, G.dpr, 0, 0); ctx.globalAlpha = 1; ctx.fillStyle = STAGE_BG; ctx.fillRect(0, 0, G.W, G.H); renderSea(ctx); return; }
    return rn.apply(this, arguments);
  };
  window.addEventListener('keydown', function(e){
    if (e.code === 'Escape' && Sea.on && G.state === 'sail'){ e.preventDefault(); e.stopPropagation(); seaArrive('harbour'); }
  }, true);
})();

/* ---- fish and crab in a run ---- */
(function(){
  KEY_ACTIONS.push(['fish', 'Eat fish'], ['crab', 'Eat crab']); DEFAULT_KEYS.fish = 'KeyG'; DEFAULT_KEYS.crab = 'KeyH';
  const FISH_CD = 45, FISH_DUR = 15, CRAB_CD = 60, CRAB_DUR = 30;
  const hp = hurtPlayer;
  hurtPlayer = function(amount, sx, sy){ return hp.call(this, Crab.on > 0 ? amount * 0.6 : amount, sx, sy); };
  function ready(S, stock){ return G.state === 'playing' && !G.attract && !P.dead && P.hp > 0 && S.cd <= 0 && stock > 0; }
  function useFish(manual){
    const d = seaData(); if (!ready(Fish, d.fish) || P.hp >= P.maxHp){ if (manual) SFX.deny(); return false; }
    d.fish--; Fish.cd = FISH_CD; Fish.on = FISH_DUR; const t = townData(); t.n.fishEaten = (t.n.fishEaten | 0) + 1; Save.write();
    addText(P.x, P.y - 46, 'fish: healing', '#9FE8FF', 14, false); try { SFX.pick(); } catch (e) {} return true;
  }
  function useCrab(manual){
    const d = seaData(); if (!ready(Crab, d.crab)){ if (manual) SFX.deny(); return false; }
    d.crab--; Crab.cd = CRAB_CD; Crab.on = CRAB_DUR; const t = townData(); t.n.crabEaten = (t.n.crabEaten | 0) + 1; Save.write();
    addText(P.x, P.y - 46, 'crab: shell up', '#FFB89A', 14, false); try { SFX.level(); } catch (e) {} return true;
  }
  const svgFish = '<svg class="bi" viewBox="0 0 44 28" width="32" height="22"><ellipse cx="18" cy="14" rx="15" ry="9" fill="#4DA0D8"/><path d="M30 14 L42 5 L40 14 L42 23Z" fill="#2F78A8"/><circle cx="9" cy="12" r="2" fill="#fff"/><path d="M14 8 Q20 14 14 20" stroke="#9FD8F2" stroke-width="2" fill="none"/></svg>';
  const svgCrab = '<svg class="bi" viewBox="0 0 44 32" width="32" height="24"><ellipse cx="22" cy="19" rx="13" ry="9" fill="#D5352B"/><circle cx="14" cy="9" r="5" fill="#E85D4A"/><circle cx="30" cy="9" r="5" fill="#E85D4A"/><path d="M10 22 L3 28 M16 26 L12 31 M28 26 L32 31 M34 22 L41 28" stroke="#A82820" stroke-width="2.4"/><circle cx="18" cy="14" r="1.8" fill="#fff"/><circle cx="26" cy="14" r="1.8" fill="#fff"/></svg>';
  function makeItem(id, S, stockFn, cdMax, svg, color, useFn, keyId, bottom){
    let btn = null, last = '', shown = false;
    return function(dt, playing){
      if (playing){ if (S.cd > 0) S.cd = Math.max(0, S.cd - dt); if (S.on > 0) S.on = Math.max(0, S.on - dt); }
      const n = stockFn(), want = playing && (n > 0 || S.cd > 0);
      if (want !== shown){
        if (!btn){
          btn = document.createElement('button'); btn.id = id; btn.type = 'button'; btn.className = '';
          btn.style.bottom = bottom + 'px'; btn.style.borderColor = color;
          ['pointerdown', 'mousedown', 'touchstart'].forEach(function(ev){ btn.addEventListener(ev, function(e){ e.stopPropagation(); }); });
          btn.addEventListener('click', function(e){ e.stopPropagation(); useFn(true); });
          document.body.appendChild(btn);
        }
        shown = want; btn.className = want ? 'on' : '';
      }
      if (want && btn){
        const left = Math.ceil(S.cd), pct = Math.round(Math.max(0, S.cd) / cdMax * 50) * 2, on = Math.ceil(S.on), key = n + '|' + left + '|' + pct + '|' + on + '|' + (Input.hasTouch ? 't' : keyName(keyOf(keyId)));
        if (key !== last){
          btn.innerHTML = svg + '<span class="bt"><b>x' + n + '</b>' + (on > 0 ? '<i>active ' + on + 's</i>' : left > 0 ? '<i>' + left + 's</i>' : (Input.hasTouch ? '' : '<i>' + keyName(keyOf(keyId)) + '</i>')) + '</span><span class="bcd" style="width:' + pct + '%"></span>';
          last = key;
        }
        btn.classList.toggle('cool', left > 0 && on <= 0); btn.classList.toggle('boost', on > 0);
      }
    };
  }
  const tickFish = makeItem('fishBtn', Fish, function(){ return seaData().fish; }, FISH_CD, svgFish, 'rgba(77,160,216,.7)', useFish, 'fish', 128);
  const tickCrab = makeItem('crabBtn', Crab, function(){ return seaData().crab; }, CRAB_CD, svgCrab, 'rgba(213,53,43,.7)', useCrab, 'crab', 186);
  const tick = Feedback.tick;
  Feedback.tick = function(dt){
    tick.call(this, dt);
    const playing = G.state === 'playing' && !G.attract;
    if (playing && Fish.on > 0 && P.hp > 0) P.hp = Math.min(P.maxHp, P.hp + P.maxHp * 0.01 * dt);
    tickFish(dt, playing); tickCrab(dt, playing);
  };
  window.addEventListener('keydown', function(e){
    if (e.repeat || G.rebinding) return;
    const a = document.activeElement; if (a && (a.tagName === 'INPUT' || a.tagName === 'TEXTAREA' || a.tagName === 'SELECT')) return;
    if (G.state !== 'playing') return;
    if (e.code === keyOf('fish') && useFish(true)) e.preventDefault();
    else if (e.code === keyOf('crab') && useCrab(true)) e.preventDefault();
  });
  const sr = startRun;
  startRun = function(){ Fish.cd = Fish.on = Crab.cd = Crab.on = 0; return sr.apply(this, arguments); };
})();

/* ---- the harbor: the dealership and the mooring ---- */
(function(){
  const H = TOWN_DIST.harbour;
  H.p = H.p.filter(function(p){ return !(p.k === 'lamp' && p.x === 1400); });
  const it = TOWN_ITEM_BY_ID.hb_c3; if (it) it.note = 'above the Saltwind Boats sign';
  H.b.push({ id: 'boatshop', kind: 'sw_shop', x: 1350, w: 230, h: 175, label: 'Saltwind Boats', act: 'boatshop' });
  H.b.push({ id: 'mooring', kind: 'sw_mooring', x: 1150, w: 110, h: 0, label: 'The mooring', act: 'sail' });
  TOWN_PAL.isle = { far: '#9CCBE0', mid: '#E8D8A0', ground: '#DCCB90', path: '#C9B07A', line: 'rgba(80,60,20,.18)', walls: ['#E8D8B0', '#9FD8F2', '#F2A08A'], roofs: ['#C9503C', '#3E6A8A'] };
  TOWN_DIST.isle = { id: 'isle', name: 'Driftwood Cove', w: 2400, spawn: 260, theme: 'isle', left: null, right: null, open: function(){ return true; }, need: '',
    b: [
      { id: 'ipier', kind: 'sw_mooring', x: 230, w: 160, h: 0, label: 'The pier', act: 'sail' },
      { id: 'ihouse1', kind: 'is_house', x: 620, w: 170, h: 130, label: 'A cottage', act: 'isle-house' },
      { id: 'ifish', kind: 'is_fish', x: 1020, w: 220, h: 150, label: 'Brine’s Fish Stall', act: 'fishshop' },
      { id: 'icrab', kind: 'is_crab', x: 1480, w: 230, h: 160, label: 'Claw & Order Crab Shack', act: 'crabshop' },
      { id: 'ilight', kind: 'is_light', x: 1960, w: 120, h: 360, label: 'The cove lighthouse', act: 'isle-light' }
    ],
    p: [{ k: 'is_water', x: 0, len: 420 }, { k: 'is_palm', x: 520 }, { k: 'is_palm', x: 800 }, { k: 'is_nets', x: 1250 }, { k: 'is_palm', x: 1700 }, { k: 'is_barrels', x: 1760 }, { k: 'is_palm', x: 2250 }],
    L: [{ x: 1020, y: 400, r: 120 }, { x: 1480, y: 400, r: 130 }, { x: 1960, y: 150, r: 200 }], npcs: ['brine', 'pearl'], dig: [] };
  TOWN_NPCS.brine = { id: 'brine', name: 'Brine', d: 'isle', x: 1090, range: 50, habit: 'stand', fav: 'book', look: { coat: '#9AB8D0', spot: '#3A5A7A', pat: 4, hat: 'sailor', s: 1.1 }, gift: { acc: 'captain' },
    say: ['Caught this morning. Ask the fish; they’ll tell you.', 'A fish a day keeps you in one piece. Eat it in a run and you’ll mend.', 'Tides come in, tides go out. Prices stay put.', 'You sail a straight line, for a giraffe.'],
    night: ['The lighthouse keeps me company.'], rain: ['Best fish come after rain.'] };
  TOWN_NPCS.pearl = { id: 'pearl', name: 'Pearl', d: 'isle', x: 1560, range: 50, habit: 'stand', fav: 'flowers', look: { coat: '#F2B8A0', spot: '#B04A32', pat: 1, hat: 'flowers', s: 1.02 }, gift: { acc: 'pearlhat' },
    say: ['Crab is armor you can eat. Don’t ask me how that works.', 'Mind the claws. Mine, and theirs.', 'A shell’s a shell. Wear it well.', 'The reefs are pretty. Don’t stare at them from a boat.'],
    night: ['Lantern’s lit. Come in.'], rain: ['Crabs love a drizzle.'] };
  TOWN_NPC_LIST.push('brine', 'pearl');
  TOWN_GIFT_OF.brine = { acc: 'captain' }; TOWN_GIFT_OF.pearl = { acc: 'pearlhat' };
  TOWN_LINES.brine = { day: ['Fresh from the cove.'], dusk: ['Last catch of the day.'], night: ['Closed. Mostly.'], new: ['New face! Fish?'], friend: ['You’re a good customer. And a very tall one.'], best: ['Take the cap. It was my father’s. It deserves a good head.'], chap: [[4, 'The Deep? I’ve fished the edge of it. Never looked in.']] };
  TOWN_LINES.pearl = { day: ['Crab’s fresh.'], dusk: ['Sunset’s the best time for crab.'], night: ['Moonlight and claws.'], new: ['Welcome, sailor!'], friend: ['You always bring good weather.'], best: ['It’s a pearl. A hat pearl. Wear it.'], chap: [[4, 'I hear there are crabs the size of cars down there.']] };
  TOWN_ERRANDS.push(
    { id: 'sea1', npc: 'brine', title: 'Land ho', offer: 'Sail a boat out from the harbor and dock at the cove.', done: 'The sea took to you. Good.', need: { k: 'stat', key: 'seaDock', n: 1 }, r: { coin: 3 } },
    { id: 'sea2', npc: 'brine', title: 'Fish for supper', offer: 'Buy a fish and eat it in a run. Just once.', done: 'Better, isn’t it?', need: { k: 'stat', key: 'fishEaten', n: 1 }, r: { gems: 20 } },
    { id: 'sea3', npc: 'pearl', title: 'Shell shock', offer: 'Eat a crab in a run. You’ll feel it.', done: 'Armored and smug.', need: { k: 'stat', key: 'crabEaten', n: 1 }, r: { gems: 20 } },
    { id: 'sea4', npc: 'pearl', title: 'Treasure hunter', offer: 'Fish ten barrels and gems out of the sea.', done: 'The sea gives, you took.', need: { k: 'stat', key: 'seaLoot', n: 10 }, r: { gems: 40 } });
  TOWN_ERRANDS.forEach(function(e){ TOWN_ERR_BY_ID[e.id] = e; });
  [{ id: 'captain', name: 'Captain’s Cap', c: '#2F4F8A' }, { id: 'pearlhat', name: 'Pearl Cloche', c: '#F4F1E8' }].forEach(function(o){
    const h = { id: o.id, name: o.name, c: o.c, kind: 'hat', rare: false, p: 0, town: true };
    if (ACC_ITEMS.length < 62){ ACC.townHats.push(h); ACC_ITEMS.push(h); ACC_BY_ID[o.id] = h; }
  });
  TOWN_HAT_SIDE.captain = function(c){ c.fillStyle = '#2F4F8A'; c.beginPath(); c.moveTo(-9, 0); c.lineTo(-8, -9); c.quadraticCurveTo(0, -13, 9, -9); c.lineTo(10, 0); c.closePath(); c.fill(); c.fillStyle = '#F4F1E8'; c.fillRect(-9, -4, 19, 3); c.fillStyle = '#F2C230'; c.beginPath(); c.arc(0.5, -7, 2, 0, TAU); c.fill(); c.fillStyle = '#1A2A4A'; c.beginPath(); c.ellipse(11, 0.4, 7, 1.8, 0.1, 0, TAU); c.fill(); };
  TOWN_HAT_TOP.captain = function(c){ c.fillStyle = '#2F4F8A'; c.beginPath(); c.arc(0, 0, 9, 0, TAU); c.fill(); c.fillStyle = '#F4F1E8'; c.beginPath(); c.arc(0, 0, 5, 0, TAU); c.fill(); c.fillStyle = '#F2C230'; c.beginPath(); c.arc(0, 0, 2, 0, TAU); c.fill(); };
  TOWN_HAT_SIDE.pearlhat = function(c){ c.fillStyle = '#F4F1E8'; c.beginPath(); c.moveTo(-9, 0); c.quadraticCurveTo(-8, -12, 2, -11); c.quadraticCurveTo(10, -10, 10, 0); c.closePath(); c.fill(); c.fillStyle = '#D8CFC0'; c.fillRect(-9, -2.4, 19, 2.4); c.fillStyle = '#FFFFFF'; c.beginPath(); c.arc(-1, -8, 2.4, 0, TAU); c.fill(); c.strokeStyle = '#D8CFC0'; c.lineWidth = 1; c.beginPath(); c.arc(-1, -8, 2.4, 0, TAU); c.stroke(); };
  TOWN_HAT_TOP.pearlhat = function(c){ c.fillStyle = '#F4F1E8'; c.beginPath(); c.arc(0, 0, 9, 0, TAU); c.fill(); c.fillStyle = '#FFFFFF'; c.beginPath(); c.arc(-2, -2, 3, 0, TAU); c.fill(); c.strokeStyle = '#D8CFC0'; c.beginPath(); c.arc(0, 0, 9, 0, TAU); c.stroke(); };

  /* the painting */
  const pfar = townPaintFar, pmid = townPaintMid, px = townPropX, bx = townBuildingX;
  townPaintFar = function(c, D, W, H, R){
    if (D.theme !== 'isle') return pfar(c, D, W, H, R);
    c.fillStyle = '#8FBFD8'; c.fillRect(0, TG - 110, W, 130);
    c.fillStyle = '#6FA8C8'; for (let y = TG - 100; y < TG; y += 14){ c.fillRect(0, y, W, 2); }
    c.fillStyle = '#7FA8A0'; c.beginPath(); c.moveTo(900, TG - 108); c.quadraticCurveTo(1000, TG - 150, 1160, TG - 108); c.closePath(); c.fill();
  };
  townPaintMid = function(c, D, W, H, R){
    if (D.theme !== 'isle') return pmid(c, D, W, H, R);
    for (let k = 0; k < 7; k++){ const x = 200 + k * 330 + FILM_R(k + 1200) * 90; c.fillStyle = '#F4F1E8'; c.beginPath(); c.moveTo(x, TG - 96); c.lineTo(x + 30, TG - 96); c.lineTo(x + 15, TG - 130); c.closePath(); c.fill(); c.fillStyle = '#6A4A32'; c.fillRect(x - 4, TG - 92, 38, 5); }
    c.fillStyle = '#D8C68A'; c.beginPath(); c.moveTo(440, TG - 40); for (let x = 440; x <= W + 30; x += 30) c.lineTo(x, TG - 40 - 10 * Math.abs(Math.sin(x * 0.01))); c.lineTo(W, TG + 10); c.lineTo(440, TG + 10); c.closePath(); c.fill();
  };
  townPropX = function(c, D, p, P, r){
    const x = p.x;
    switch (p.k){
      case 'is_water':
        tRect(c, '#3A86C4', x, TG - 4, p.len, 120); c.fillStyle = 'rgba(255,255,255,.3)'; for (let i = 0; i < 18; i++) c.fillRect(x + 10 + (i * 53) % (p.len - 30), TG + 8 + (i * 37) % 80, 26, 3);
        for (let q = 40; q < p.len + 20; q += 90){ tRect(c, '#4A3624', x + q, TG + 12, 9, 70); tRect(c, 'rgba(255,255,255,.25)', x + q - 4, TG + 56 + (q % 3), 17, 3); }
        tRect(c, '#8A6A44', x, TG - 2, p.len + 470, 16); tRect(c, '#6A4A2C', x, TG + 12, p.len + 470, 4); for (let i = 0; i < Math.floor((p.len + 470) / 14); i++) tRect(c, 'rgba(40,24,10,.35)', x + i * 14, TG - 2, 1.4, 14); tRect(c, '#4A3624', x, TG - 14, 8, 30); tRect(c, '#4A3624', x + 160, TG - 14, 8, 30);
        return true;
      case 'is_palm':
        c.strokeStyle = '#7A5A38'; c.lineWidth = 9; c.lineCap = 'round'; c.beginPath(); c.moveTo(x, TG); c.quadraticCurveTo(x + 14, TG - 80, x + 4, TG - 150); c.stroke();
        c.strokeStyle = '#3E8A3A'; c.lineWidth = 7; for (let i = 0; i < 6; i++){ const a = -2.6 + i * 0.5; c.beginPath(); c.moveTo(x + 4, TG - 150); c.quadraticCurveTo(x + 4 + Math.cos(a) * 40, TG - 150 + Math.sin(a) * 30 - 14, x + 4 + Math.cos(a) * 66, TG - 150 + Math.sin(a) * 26 + 14); c.stroke(); }
        tCircle(c, '#8A5A24', x + 1, TG - 146, 5); tCircle(c, '#8A5A24', x + 9, TG - 144, 5);
        return true;
      case 'is_nets':
        tRect(c, '#5A3B22', x - 60, TG - 90, 5, 90); tRect(c, '#5A3B22', x + 55, TG - 90, 5, 90); c.strokeStyle = '#B8A070'; c.lineWidth = 1.3;
        for (let i = 0; i < 8; i++){ c.beginPath(); c.moveTo(x - 56 + i * 16, TG - 86); c.lineTo(x - 54 + i * 16, TG - 20); c.stroke(); } for (let j = 0; j < 5; j++){ c.beginPath(); c.moveTo(x - 56, TG - 84 + j * 14); c.lineTo(x + 56, TG - 82 + j * 14); c.stroke(); }
        tCircle(c, '#D5352B', x - 40, TG - 40, 7); tCircle(c, '#F2C230', x + 10, TG - 30, 7);
        return true;
      case 'is_barrels':
        for (let i = 0; i < 3; i++){ tRound(c, '#8A5A32', x - 50 + i * 34, TG - 46, 30, 46, 8); tRect(c, '#3A2A1E', x - 50 + i * 34, TG - 36, 30, 3); tRect(c, '#3A2A1E', x - 50 + i * 34, TG - 14, 30, 3); }
        return true;
    }
    return px(c, D, p, P, r);
  };
  townBuildingX = function(c, D, b, P, r){
    const x = b.x, W = b.w, h = b.h, x0 = x - W / 2;
    switch (b.kind){
      case 'sw_mooring': return true;
      case 'sw_shop':
        c.save();
        tEll(c, 'rgba(0,0,0,.18)', x, TG + 5, W / 2 + 10, 7);
        tRect(c, '#F4F1E8', x0, TG - h, W, h); tRect(c, '#2F5F94', x0, TG - h, W, 22); tRect(c, '#2F5F94', x0, TG - 26, W, 26); tRect(c, 'rgba(0,0,0,.1)', x0, TG - h + 22, W, 5);
        tPoly(c, '#2F5F94', [x0 - 12, TG - h, x, TG - h - 40, x0 + W + 12, TG - h]);
        tAwning(c, x0 + 6, TG - h + 40, W - 12, 28, '#F4F1E8', '#2F5F94');
        for (let i = 0; i < 2; i++){ tCircle(c, '#3A2A1E', x0 + 36 + i * 52, TG - 84, 17); tCircle(c, '#9FD8F2', x0 + 36 + i * 52, TG - 84, 13); tCircle(c, 'rgba(255,255,255,.5)', x0 + 31 + i * 52, TG - 89, 4); }
        tRect(c, '#3A2A1E', x0 + W - 74, TG - 96, 52, 96); tRect(c, '#9FD8F2', x0 + W - 68, TG - 90, 40, 44); tCircle(c, '#E9C46A', x0 + W - 32, TG - 40, 3);
        tSign(c, 'SALTWIND BOATS', x, TG - h - 18, 210, '#1E3A5A', '#FFF6E0');
        ctx_anchor(c, x0 + W - 18, TG - h + 4);
        c.restore(); return true;
      case 'is_fish':
        c.save();
        tRect(c, '#8A6642', x0, TG - 60, W, 60); tRect(c, '#5A3B22', x0 + 4, TG - h, 6, h - 56); tRect(c, '#5A3B22', x0 + W - 10, TG - h, 6, h - 56);
        tAwning(c, x0 - 6, TG - h, W + 12, 30, '#4DA0D8', '#F4F1E8');
        tRect(c, '#E8EAF0', x0 + 8, TG - 72, W - 16, 16);
        for (let i = 0; i < 5; i++){ const fx = x0 + 30 + i * 38; tEll(c, ['#9FB8D0', '#E89A5A', '#B8C8D8', '#F2C230', '#6AB8D8'][i], fx, TG - 74, 15, 6); tPoly(c, '#7A9AB8', [fx + 13, TG - 74, fx + 22, TG - 80, fx + 22, TG - 68]); tCircle(c, '#111', fx - 8, TG - 76, 1.4); }
        tSign(c, b.label, x, TG - h - 18, 220, '#1E3A5A', '#FFF6E0');
        c.restore(); return true;
      case 'is_crab':
        c.save();
        tRect(c, '#C98A5A', x0, TG - h, W, h); tRect(c, 'rgba(0,0,0,.12)', x0, TG - h, W, 6); for (let i = 1; i < 8; i++) tRect(c, 'rgba(0,0,0,.1)', x0 + i * W / 8, TG - h, 2, h);
        tPoly(c, '#D5352B', [x0 - 12, TG - h, x, TG - h - 46, x0 + W + 12, TG - h]);
        tRect(c, '#F4F1E8', x0 + 20, TG - 86, 70, 56); tRect(c, '#FFE9A8', x0 + 25, TG - 81, 60, 46); tRect(c, '#5A3B22', x0 + 54, TG - 81, 3, 46);
        tRect(c, '#3A2A1E', x0 + W - 80, TG - 100, 54, 100); tCircle(c, '#E9C46A', x0 + W - 34, TG - 46, 3);
        tCircle(c, '#D5352B', x0 + W - 50, TG - h + 28, 17); tCircle(c, '#E85D4A', x0 + W - 64, TG - h + 14, 7); tCircle(c, '#E85D4A', x0 + W - 36, TG - h + 14, 7);
        tSign(c, b.label, x, TG - h - 26, 250, '#7A2A1E', '#FFF6E0');
        c.restore(); return true;
      case 'is_house':
        c.save();
        tRect(c, '#E8D8B0', x0, TG - h, W, h); tPoly(c, '#3E6A8A', [x0 - 12, TG - h, x, TG - h - 54, x0 + W + 12, TG - h]);
        tRect(c, '#5A3B22', x0 + 20, TG - 88, 46, 46); tRect(c, '#BFE0F4', x0 + 25, TG - 83, 36, 36); tRect(c, '#5A3B22', x0 + 41, TG - 83, 3, 36);
        tRound(c, '#6A3A2E', x0 + W - 66, TG - 84, 40, 84, 6); tCircle(c, '#E9C46A', x0 + W - 36, TG - 42, 3);
        c.restore(); return true;
      case 'is_light':
        c.save();
        tPoly(c, '#F4F1E8', [x0 + 10, TG, x0 + 28, TG - h + 40, x0 + W - 28, TG - h + 40, x0 + W - 10, TG]); for (let i = 0; i < 4; i++) tPoly(c, '#D5352B', [x0 + 14 + i * 1.5, TG - 40 - i * 80, x0 + 22 + i * 1.5, TG - 70 - i * 80, x0 + W - 22 - i * 1.5, TG - 70 - i * 80, x0 + W - 14 - i * 1.5, TG - 40 - i * 80]);
        tRect(c, '#3A3A44', x0 + 14, TG - h + 30, W - 28, 12); tRect(c, '#BFE8F8', x0 + 30, TG - h - 6, W - 60, 38); tPoly(c, '#D5352B', [x0 + 24, TG - h - 6, x, TG - h - 40, x0 + W - 24, TG - h - 6]);
        c.restore(); return true;
    }
    return bx(c, D, b, P, r);
  };
  function ctx_anchor(c, x, y){ c.strokeStyle = '#1E3A5A'; c.lineWidth = 3; c.beginPath(); c.arc(x, y + 6, 5, 0, TAU); c.moveTo(x, y + 11); c.lineTo(x, y + 36); c.moveTo(x - 9, y + 20); c.lineTo(x + 9, y + 20); c.moveTo(x - 10, y + 30); c.quadraticCurveTo(x, y + 40, x + 10, y + 30); c.stroke(); }

  /* what the doors do */
  const tu = townUse, nr = townNearest, hta = handleTownAction;
  townUse = function(o){
    if (o.k === 'b'){
      const b = o.b;
      if (b.act === 'boatshop'){ townShowBoatShop(); return; }
      if (b.act === 'sail'){
        if (!boatOwned()){ townSay({ name: 'The mooring', text: 'A mooring post and a bit of rope. No boat yet: Saltwind Boats is next door.' }, []); SFX.deny(); }
        else seaStart(Town.d === 'isle' ? 'isle' : 'harbour');
        return;
      }
      if (b.act === 'fishshop'){ townShowFishShop(); return; }
      if (b.act === 'crabshop'){ townShowCrabShop(); return; }
      if (b.act === 'isle-house'){ townSay({ name: 'A cottage', text: 'Shells on the windowsill, a hammock on the porch and a smell of salt. Nobody is in, but the door is open.' }, []); return; }
      if (b.act === 'isle-light'){ townSay({ name: 'The cove lighthouse', text: 'It turns slowly all night, for the boats. You can see the harbor on the far shore from the top. Probably.' }, []); return; }
    }
    tu(o);
  };
  townNearest = function(D, inp){
    let o = nr(D, inp);
    if (o && o.k === 'b'){
      const m = { boatshop: 'Look at the boats', sail: boatOwned() ? 'Set sail' : 'Look at the mooring', fishshop: 'Buy fish', crabshop: 'Buy crab', 'isle-house': 'Look at the cottage', 'isle-light': 'Look up' };
      if (m[o.b.act]) o.label = m[o.b.act];
    }
    return o;
  };
  handleTownAction = function(a){
    let m = /^town-sea-buy-(\w+)$/.exec(a);
    if (m){ if (boatBuy(m[1])) townToast('A new boat: ' + BOAT_BY_ID[m[1]].name + '.', '#BFFF9A'); townShowBoatShop(); return true; }
    m = /^town-sea-sel-(\w+)$/.exec(a);
    if (m){ const s = seaData(); if (s.own[m[1]]){ s.sel = m[1]; Save.write(); SFX.pick(); } townShowBoatShop(); return true; }
    m = /^town-sea-fish-(\d+)$/.exec(a);
    if (m){ seaBuy('fish', +m[1]); townShowFishShop(); return true; }
    m = /^town-sea-crab-(\d+)$/.exec(a);
    if (m){ seaBuy('crab', +m[1]); townShowCrabShop(); return true; }
    return hta(a);
  };
})();
function seaPrice(kind){ return Math.max(kind === 'fish' ? 80 : 110, Math.round(townCoin() * (kind === 'fish' ? 0.7 : 0.95))); }
function seaBuy(kind, n){
  const s = seaData(), room = seaCap(kind) - s[kind], want = Math.min(n, room), cost = seaPrice(kind) * want;
  if (want <= 0){ SFX.deny(); townToast('You are carrying all the ' + kind + ' you can.', '#FFB89A'); return false; }
  if (goldInt(Save.data.gold) < cost){ SFX.deny(); return false; }
  Save.data.gold -= cost; s[kind] += want; Save.write(); SFX.buy(); return true;
}
function townShowBoatShop(){
  const s = seaData(), gold = goldInt(Save.data.gold);
  let h = '<div class="tp-title">SALTWIND BOATS</div><p class="bp">Four boats, from a rowing skiff to a speedboat. Sail from the mooring beside the shop: W and S for the throttle, A and D to turn.</p><div class="boatgrid">';
  BOATS.forEach(function(b){
    const own = !!s.own[b.id], on = s.sel === b.id;
    h += '<div class="boatcard' + (on ? ' on' : '') + '"><canvas width="150" height="76" data-boat="' + b.id + '"></canvas><b>' + b.name + '</b><span>' + b.desc + '</span>' +
      '<div class="bstats"><i style="width:' + Math.round(b.vmax / 255 * 100) + '%"></i></div><small>speed &nbsp; turn ' + b.turn.toFixed(1) + '</small>' +
      (on ? '<em>in use</em>' : own ? '<button class="tbtn" data-a="town-sea-sel-' + b.id + '">Use</button>' : '<button class="bpbtn" data-a="town-sea-buy-' + b.id + '"' + (gold >= b.price ? '' : ' disabled') + '>Buy<small>' + fmt(b.price) + ' gold</small></button>') + '</div>';
  });
  h += '</div><div class="stock">' + fmt(gold) + ' gold</div>';
  townPanelT('garage', h, { w: 720 });
  document.querySelectorAll('canvas[data-boat]').forEach(function(cv){ const g = cv.getContext('2d'); g.fillStyle = '#2E78B8'; g.fillRect(0, 0, 150, 76); g.fillStyle = 'rgba(255,255,255,.2)'; for (let i = 0; i < 6; i++) g.fillRect(8 + i * 24, 10 + (i * 17) % 50, 14, 2); seaDrawBoat(g, 75, 38, -0.2, cv.getAttribute('data-boat'), 0, 1.15, 0); });
}
function seaShop(kind, title, blurb, effect){
  const s = seaData(), price = seaPrice(kind), gold = goldInt(Save.data.gold), room = seaCap(kind) - s[kind];
  const btn = function(n){ const c = price * Math.min(n, Math.max(1, room)); return '<button class="bpbtn" data-a="town-sea-' + kind + '-' + n + '"' + (room <= 0 || gold < price * Math.min(n, room) ? ' disabled' : '') + '>Buy ' + n + '<small>' + fmt(c) + ' gold</small></button>'; };
  townPanelT('bakery', '<div class="tp-title">' + title + '</div><p class="bp">' + blurb + '</p>' +
    '<div class="spec"><div><span>In your satchel</span><b>' + s[kind] + ' of 10</b></div><div><span>Price</span><b>' + fmt(price) + ' gold each</b></div><div><span>' + effect[0] + '</span><b>' + effect[1] + '</b></div><div><span>Key in a run</span><b>' + keyName(keyOf(kind)) + '</b></div></div>' +
    '<div class="bprow">' + btn(1) + btn(5) + btn(seaCap(kind)) + '</div><div class="stock">' + fmt(gold) + ' gold</div>', { w: 580 });
}
function townShowFishShop(){ seaShop('fish', 'BRINE’S FISH STALL', 'Fresh from the cove. Eat one in a run and it heals you steadily for a while. Sail through glinting shoals at sea for free ones.', ['Heals', '15% over 15 s (cooldown 45 s)']); }
function townShowCrabShop(){ seaShop('crab', 'CLAW & ORDER CRAB SHACK', 'Crab you wear on the inside. Eat one in a run and hits hurt a good deal less for half a minute.', ['Shell', '-40% damage for 30 s (cooldown 60 s)']); }

(function(){
  const t = GUIDE_TOPICS.find(function(x){ return x.id === 'town'; });
  if (t){ const base = t.html; t.html = function(){ return base().replace('</ul>', '<li><b>Saltwind Boats</b> at the Harbor sells four boats. Sail from the mooring beside it: <b>W and S</b> are the throttle (S below zero reverses), <b>A and D</b> turn. Shallows slow the boat, rocks and reefs stop it. Barrels and gems float about, glinting shoals give a fish, and the sea chart in the corner remembers everything you have sailed past. Dock beside the pier at <b>Driftwood Cove</b> (slow right down): Brine sells <b>fish</b> (<b>' + keyName(keyOf('fish')) + '</b> in a run heals over time) and Pearl sells <b>crab</b> (<b>' + keyName(keyOf('crab')) + '</b> cuts damage taken for 30 seconds).</li></ul>'); }; }
})();
