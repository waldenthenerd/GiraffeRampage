'use strict';
/* Scenery detail: every prop, landmark, ground mark and terrain patch is built of many small parts. */
/* The chapter files (js/scenery/36c ... 36n) draw each object with a few big shapes. This file wraps those drawings and adds a layer of small parts on top: leaves and blades,
   bark and grain, cracks and lichen and pebbles, bolts and seams and rust, facets and glints, embers and soot, grains and ripples. The parts come from nine families chosen by the
   object's name, are placed on the object itself (its own drawing is read once into a small mask, so parts sit on its real shape and take the colour under them), and are laid out ONCE
   per object (a short display list kept on it, seeded by the object's own seed so every object differs), so a frame only replays the list. Off when effects are off; fewer parts when
   they are set low (scenQ). Ambient life and the soft ground patches are not touched. */
const SD = { masks: {}, ch: -1, off: false, frame: -1, ms: 0 };
const SD_FAMILIES = [                                                       /* the first pattern that matches an object's id picks its family */
  ['tree', /tree|acacia|cypress|conifer|baobab|joshua|buttress|giant|withered|_root|petribao|cathedral/],
  ['plant', /shrub|bush|sage|fern|_leaf|brom|orchid|flowers|grass|reeds|lilies|vines|weed|twigs|litter|leaves|motes/],
  ['crystal', /crystal|icicle|berg|_ice|glass|geode|frost|spire|obelisk|chunk|frozenpond|speck|glints|stalag|flake/],
  ['fire', /fumarole|_vent|sulfur|acid|lava|ember|spark|crust|cooled|magma|_plate|basalt|_seam|scorch|charcoal|_ash|sinkhole|steam|wisp/],
  ['wood', /_log|stump|knees|boat|_hull|_ship|ribs|ribcage|bones|bonefrag|fishbone|giantlog/],
  ['coral', /kelp|brain|tubes|shells|reef|ripple|_pits|oc_pebbles|oc_trail|cur_|_fan\b/],
  ['soft', /_mud|_bog|marsh|deepdust|deepash|drift|dune|gravel|puddle|_pan\b|riverbed|tangle|ashmound|_mound|scum|dustring|ashdune|gust|slide|grit/],
  ['machine', /solar|tank|spool|crate|barrier|flood|dish|sprinkler|lander|gantry|radar|dumpster|hydrant|lamp|planter|fence|sign|drums|debris|containers|rover|flag|cable|pipe|_pod|rubble|burnt|overpass|tower|stencil|tyre|survey|worn|skid|_oil|_patch|channel|drain|wreck/]
];
function sdFamily(id){ for (let i = 0; i < SD_FAMILIES.length; i++) if (SD_FAMILIES[i][1].test(id)) return SD_FAMILIES[i][0]; return 'rock'; }
function sdHash(s){ let h = 2166136261; for (let i = 0; i < s.length; i++){ h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
function sdRng(id, seed){ let h = (sdHash(id) ^ Math.floor(seed * 4294967296)) >>> 0; return function(){ h = (h + 0x6D2B79F5) | 0; let t = Math.imul(h ^ h >>> 15, 1 | h); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function sdRgb(c, t, a){                                                    /* a colour [r,g,b] lightened (t > 0) or darkened (t < 0), as a CSS string */
  const k = t >= 0 ? 255 : 0, u = Math.abs(t);
  return 'rgba(' + Math.round(c[0] + (k - c[0]) * u) + ',' + Math.round(c[1] + (k - c[1]) * u) + ',' + Math.round(c[2] + (k - c[2]) * u) + ',' + (a === undefined ? 1 : a) + ')';
}

/* the shape and colours of an object, read once from its own drawing */
function sdMask(o, kind){
  const key = kind + o.id; let M = SD.masks[key]; if (M !== undefined) return M;
  M = null;
  try {
    const K = kind === 'decal' ? 44 : kind === 'zone' ? 130 : Math.min(o.r || 24, 230), H = Math.ceil(K * 1.5 + 10), res = H > 160 ? 1 : H > 80 ? 2 : 3, N = H * 2 * res;
    const cv = document.createElement('canvas'); cv.width = cv.height = N; const c = cv.getContext('2d', { willReadFrequently: true }); c.setTransform(res, 0, 0, res, N / 2, N / 2);
    const fake = kind === 'zone' ? { x: 0, y: 0, rx: 120, ry: 120 * (o.squash || 0.7), rot: 0, seed: 0.5, def: o, kind: o.kind, tick: 0 } : { x: 0, y: 0, s: 1, rot: 0, seed: 0.5, def: o, r: o.r || K, tall: false, fade: 1 };
    (o._sdBase || o.draw).call(o, c, fake, 0);
    const px = c.getImageData(0, 0, N, N).data, g = new Uint8Array(N * N); let n = 0;
    for (let i = 0; i < g.length; i++) if (px[i * 4 + 3] > 60){ g[i] = 1; n++; }
    M = n > 20 ? { g: g, px: px, N: N, res: res, K: K } : null;
    if (M){
      let r0 = 0, g0 = 0, b0 = 0, k0 = 0; for (let i = 0; i < g.length; i += 7) if (g[i]){ r0 += px[i * 4]; g0 += px[i * 4 + 1]; b0 += px[i * 4 + 2]; k0++; } M.avg = k0 ? [r0 / k0, g0 / k0, b0 / k0] : [128, 128, 128];
    }
    if (M){                                                           /* where the object is: centre, size, direction of its long side, and the foot of it */
      let sx = 0, sy = 0, x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
      for (let i = 0; i < g.length; i++) if (g[i]){ const x = (i % N - N / 2) / res, y = (Math.floor(i / N) - N / 2) / res; sx += x; sy += y; if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
      const cx = sx / n, cy = sy / n; let cxx = 0, cyy = 0, cxy = 0, fx = 0, fn = 0;
      for (let i = 0; i < g.length; i++) if (g[i]){ const x = (i % N - N / 2) / res - cx, y = (Math.floor(i / N) - N / 2) / res - cy; cxx += x * x; cyy += y * y; cxy += x * y; const yy = Math.floor(i / N) / res - N / 2 / res; if (yy > y1 - Math.max(2, (y1 - y0) * 0.12)){ fx += i % N / res - N / 2 / res; fn++; } }
      const th = 0.5 * Math.atan2(2 * cxy, cxx - cyy), l1 = (cxx + cyy) / 2 + Math.sqrt(Math.pow((cxx - cyy) / 2, 2) + cxy * cxy), l2 = (cxx + cyy) / 2 - Math.sqrt(Math.pow((cxx - cyy) / 2, 2) + cxy * cxy);
      M.geo = { cx: cx, cy: cy, rad: Math.sqrt(n / res / res / Math.PI), ang: th, a: 2 * Math.sqrt(l1 / n), b: 2 * Math.sqrt(Math.max(l2, 1) / n), x0: x0, x1: x1, y0: y0, y1: y1, w: x1 - x0, h: y1 - y0, bx: fn ? fx / fn : cx, by: y1 };
    }
  } catch (err){ M = null; }
  SD.masks[key] = M; return M;
}

/* the helper every family uses: points on the object, colours under them, in the object's own units */
function sdCtx(o, kind, p, M, R){
  const zone = kind === 'zone', fx = zone ? 120 / p.rx : 1, fy = zone ? 120 * (o.squash || 0.7) / p.ry : 1, K = zone ? Math.max(p.rx, p.ry) : M.K, u = 1.2 + Math.min(0.4, (zone ? 22 : K) / 300);                 /* the parts stay small whatever the object's size: bigger objects get more of them */
  const S = { water: /puddle|pond|marsh|bog|slide|ripple|pan\b|riverbed|mud/.test(o.id), ops: [], u: u, K: K, q: scenQ(), R: R, zone: zone, rx: zone ? p.rx : K, ry: zone ? p.ry : K, big: kind === 'landmark', decal: kind === 'decal' };
  S.ok = function(x, y){ const m = M, ix = Math.round(x * fx * m.res + m.N / 2), iy = Math.round(y * fy * m.res + m.N / 2); return ix >= 0 && iy >= 0 && ix < m.N && iy < m.N && m.g[iy * m.N + ix] === 1; };
  S.col = function(x, y){                                                    /* the colour under a point (or the nearest part of the object that has colour) */
    const m = M, bx = Math.round(x * fx * m.res + m.N / 2), by = Math.round(y * fy * m.res + m.N / 2);
    for (let r = 0; r < 9; r += 2) for (let k = 0; k < (r ? 4 : 1); k++){
      const ix = bx + (k === 0 ? r : k === 1 ? -r : 0), iy = by + (k === 2 ? r : k === 3 ? -r : 0);
      if (ix < 0 || iy < 0 || ix >= m.N || iy >= m.N) continue; const i = (iy * m.N + ix) * 4; if (m.px[i + 3] > 90) return [m.px[i], m.px[i + 1], m.px[i + 2]];
    }
    return m.avg;
  };
  const gm = zone ? { cx: 0, cy: 0, rad: (p.rx + p.ry) / 2 * 0.8, ang: 0, a: p.rx * 0.9, b: p.ry * 0.9, x0: -p.rx, x1: p.rx, y0: -p.ry, y1: p.ry, w: p.rx * 2, h: p.ry * 2, bx: 0, by: p.ry } : M.geo;
  S.g = gm;
  if (zone) S.ok = function(x, y){ return (x * x) / (p.rx * p.rx) + (y * y) / (p.ry * p.ry) < 1; };
  S.ray = function(a, f){ let r = 0; const st = u * 1.2, mx = Math.max(gm.a, gm.b, gm.rad) * 2.2; while (r < mx && S.ok(gm.cx + Math.cos(a) * (r + st), gm.cy + Math.sin(a) * (r + st))) r += st; return [gm.cx + Math.cos(a) * r * (f || 1), gm.cy + Math.sin(a) * r * (f || 1), r]; };
  S.pt = function(f){ for (let t = 0; t < 14; t++){ const a = R() * TAU, r = Math.sqrt(R()) * (f || 1); const x = Math.cos(a) * r * S.rx, y = Math.sin(a) * r * S.ry * (zone ? 1 : 1); if (zone || S.ok(x, y)) return [x, y]; } return null; };
  S.edge = function(){ for (let t = 0; t < 24; t++){ const a = R() * TAU, r = 0.7 + R() * 0.5, x = Math.cos(a) * r * S.rx, y = Math.sin(a) * r * S.ry; if (zone){ if (r < 1) return [x, y]; continue; } if (S.ok(x, y) && !(S.ok(x + 3 * u, y) && S.ok(x - 3 * u, y) && S.ok(x, y + 3 * u) && S.ok(x, y - 3 * u))) return [x, y, a]; } return S.pt(0.9); };
  S.n = function(base){ return Math.max(1, Math.round(base * 1.5 * Math.pow(Math.max(0.6, S.K / 22), 1.15) * S.q * (S.big ? 0.9 : 1) * (S.decal ? 0.8 : 1))); };
  S.c = function(x, y, r, col){ S.ops.push([0, x, y, r, col]); };
  S.l = function(x0, y0, x1, y1, w, col){ S.ops.push([1, x0, y0, x1, y1, w, col]); };
  S.t = function(x1, y1, x2, y2, x3, y3, col){ S.ops.push([2, x1, y1, x2, y2, x3, y3, col]); };
  S.e = function(x, y, rx, ry, rot, col){ S.ops.push([3, x, y, rx, ry, rot, col]); };
  S.sp = function(x, y, r, col){ S.ops.push([4, x, y, r, col, R() * TAU]); };
  S.pf = function(x, y, r, col){ S.ops.push([5, x, y, r, col, R()]); };
  return S;
}
const SD_GEN = {
  /* foliage: rings of small leaves laid out radially over the canopy, each with a light edge, then twigs and dew */
  tree(S, R){
    const u = S.u, g = S.g, rho = g.rad, rings = rho > 90 ? [0.25, 0.45, 0.62, 0.78, 0.92] : [0.3, 0.62, 0.9];
    const lu = u * (1 + rho / 160);
    for (let k = 0; k < rings.length; k++){
      const rr = rho * rings[k], m = Math.min(70, Math.max(5, Math.round(TAU * rr / (4.6 * lu) * S.q))), off = R() * TAU;
      for (let j = 0; j < m; j++){
        const a = off + j * TAU / m + (R() - 0.5) * 0.3, x = g.cx + Math.cos(a) * rr, y = g.cy + Math.sin(a) * rr; if (!S.ok(x, y)) continue;
        const c = S.col(x, y), lit = (Math.cos(a) + Math.sin(a)) < 0 ? 0.16 : -0.2;
        S.e(x, y, 2.9 * lu, 1.35 * lu, a, sdRgb(c, lit, 0.85)); S.e(x - 0.4 * lu, y - 0.45 * lu, 1.6 * lu, 0.6 * lu, a, sdRgb(c, lit + 0.22, 0.7));
        if (j % 3 === 0) S.l(x - Math.cos(a) * 1.6 * lu, y - Math.sin(a) * 1.6 * lu, x + Math.cos(a) * 1.8 * lu, y + Math.sin(a) * 1.8 * lu, 0.4 * lu, sdRgb(c, -0.5, 0.45));
      }
    }
    for (let i = 0; i < S.n(5); i++){ const e = S.ray(R() * TAU, 0.9); if (e[2] < 4) continue; const c = S.col(e[0] * 0.7 + g.cx * 0.3, e[1] * 0.7 + g.cy * 0.3); S.l(g.cx, g.cy, e[0], e[1], 0.8 * u, sdRgb(c, -0.55, 0.5)); }
    for (let i = 0; i < S.n(4); i++){ const p = S.pt(0.85); if (p) S.sp(p[0], p[1], 0.7 * u, 'rgba(255,255,255,.9)'); }
  },
  /* grass and flowers: a fan of blades from the foot, in two tones, with seed heads; broad plants get a rosette of leaves instead */
  plant(S, R){
    const u = S.u, g = S.g;
    if (g.h < g.w * 0.8){ SD_GEN.tree(S, R); return; }
    const n = Math.min(26, S.n(12)), bx = g.bx, by = g.by - 0.5 * u;
    for (let i = 0; i < n; i++){
      const f = i / Math.max(1, n - 1), a = -Math.PI / 2 + (f - 0.5) * 1.0 + (R() - 0.5) * 0.2, L = g.h * (0.5 + R() * 0.45), bend = (R() - 0.5) * 0.5;
      const mx = bx + Math.cos(a) * L * 0.55, my = by + Math.sin(a) * L * 0.55, ex = mx + Math.cos(a + bend) * L * 0.5, ey = my + Math.sin(a + bend) * L * 0.5, c = S.col(mx, my);
      const tone = i % 2 ? 0.22 : -0.18;
      S.l(bx + (f - 0.5) * 3 * u, by, mx, my, 1.05 * u, sdRgb(c, tone, 0.9)); S.l(mx, my, ex, ey, 0.75 * u, sdRgb(c, tone * 1.2, 0.9));
      if (i % 3 === 0) S.e(ex, ey, 0.9 * u, 1.9 * u, a + bend + Math.PI / 2, sdRgb(c, 0.5, 0.9));
    }
    for (let i = 0; i < S.n(3); i++) S.sp(bx + (R() - 0.5) * g.w * 0.8, by - R() * g.h * 0.8, 0.7 * u, 'rgba(255,255,255,.9)');
    S.e(bx, by + 0.6 * u, g.w * 0.42, 1.4 * u, 0, 'rgba(20,16,8,.28)');
  },
  /* stone and ice: the outline is read by rays from the middle and cut into facets, lit from the upper left, with cracks and moss and pebbles */
  rock(S, R){
    const u = S.u, g = S.g, m = Math.max(6, Math.min(10, Math.round(g.rad / 5))), off = R() * TAU, E = [];
    for (let i = 0; i < m; i++) E.push(S.ray(off + i * TAU / m + (R() - 0.5) * 0.3, 1));
    const cx = g.cx + (R() - 0.5) * g.rad * 0.2, cy = g.cy + (R() - 0.5) * g.rad * 0.2;
    for (let i = 0; i < m; i++){
      const A = E[i], B = E[(i + 1) % m], mid = Math.atan2((A[1] + B[1]) / 2 - cy, (A[0] + B[0]) / 2 - cx), lit = -(Math.cos(mid) + Math.sin(mid)) / 1.414;
      S.t(cx, cy, A[0] * 0.96, A[1] * 0.96, B[0] * 0.96, B[1] * 0.96, lit > 0 ? 'rgba(255,255,255,' + (0.06 + 0.17 * lit) + ')' : 'rgba(0,0,0,' + (0.05 - 0.2 * lit) + ')');
      S.l(cx, cy, A[0] * 0.9, A[1] * 0.9, 0.5 * u, 'rgba(0,0,0,.12)');
      if (lit > 0.3) S.l(A[0] * 0.94, A[1] * 0.94, B[0] * 0.94, B[1] * 0.94, 0.7 * u, 'rgba(255,255,255,.22)');
    }
    for (let i = 0; i < S.n(3); i++){ const e = E[Math.floor(R() * m)]; let x = e[0] * 0.8, y = e[1] * 0.8; const pts = [x, y]; for (let j = 0; j < 3; j++){ x += (R() - 0.5) * 6 * u; y += (R() - 0.5) * 6 * u; if (!S.ok(x, y)) break; pts.push(x, y); } for (let j = 0; j + 3 < pts.length; j += 2) S.l(pts[j], pts[j + 1], pts[j + 2], pts[j + 3], 0.55 * u, 'rgba(0,0,0,.45)'); }
    for (let i = 0; i < S.n(4); i++){ const e = E[Math.floor(R() * m)], a = Math.atan2(e[1] - cy, e[0] - cx); for (let j = 0; j < 3; j++) S.c(e[0] * 0.85 + (R() - 0.5) * 3 * u, e[1] * 0.85 + (R() - 0.5) * 3 * u, (0.5 + R() * 0.6) * u, sdRgb(S.col(e[0] * 0.85, e[1] * 0.85), 0.3, 0.6)); S.e(e[0] + Math.cos(a) * 3.4 * u, e[1] + Math.sin(a) * 3.4 * u, 1.3 * u, 0.9 * u, a, 'rgba(70,60,50,.55)'); }
    for (let i = 0; i < S.n(2); i++){ const e = E[Math.floor(R() * m)]; S.sp(e[0] * 0.5, e[1] * 0.5, 0.8 * u, 'rgba(255,255,255,.8)'); }
  },
  /* logs, stumps and bones: bark rings across the length, growth rings and a cut face at the ends, grain along it, knots */
  wood(S, R){
    const u = S.u, g = S.g, ca = Math.cos(g.ang), sa = Math.sin(g.ang), A = g.a * 1.05, B = Math.max(g.b, 2 * u);
    for (let x = -A * 0.9; x < A * 0.9; x += 3.6 * u){
      const px = g.cx + ca * x, py = g.cy + sa * x, w = B * 0.9, x0 = px - sa * w, y0 = py + ca * w, x1 = px + sa * w, y1 = py - ca * w;
      if (S.ok(x0 * 0.9 + px * 0.1, y0 * 0.9 + py * 0.1) && S.ok(x1 * 0.9 + px * 0.1, y1 * 0.9 + py * 0.1)) S.l(x0, y0, x1, y1, 0.5 * u, 'rgba(0,0,0,.28)');
    }
    for (const sd of [-1, 1]) for (let k = 0; k < 3; k++){ const o = (k - 1) * B * 0.5; S.l(g.cx - ca * A * 0.85 - sa * o, g.cy - sa * A * 0.85 + ca * o, g.cx + ca * A * 0.85 - sa * o, g.cy + sa * A * 0.85 + ca * o, 0.4 * u, k === 1 ? 'rgba(255,255,255,.14)' : 'rgba(0,0,0,.2)'); if (sd > 0) break; }
    const ex = g.cx + ca * A * 0.95, ey = g.cy + sa * A * 0.95;
    if (S.ok(ex, ey)) for (let k = 0; k < 3; k++) S.ops.push([6, ex, ey, B * (0.8 - k * 0.25), B * (0.8 - k * 0.25), 'rgba(0,0,0,' + (0.38 - k * 0.08) + ')']);
    for (let i = 0; i < S.n(2); i++){ const p = S.pt(0.7); if (!p) continue; const c = S.col(p[0], p[1]); S.c(p[0], p[1], 1.5 * u, sdRgb(c, -0.45, 0.8)); S.c(p[0], p[1], 0.85 * u, sdRgb(c, -0.05, 0.9)); S.c(p[0], p[1], 0.3 * u, sdRgb(c, -0.55, 0.9)); }
    for (let i = 0; i < S.n(5); i++){ const e = S.edge(); if (e) S.e(e[0], e[1], 1.5 * u, 0.7 * u, R() * 3, 'rgba(255,255,255,.25)'); }
    for (let i = 0; i < S.n(3); i++){ const p = S.pt(0.9); if (p) S.c(p[0], p[1], 0.9 * u, 'rgba(120,150,70,.6)'); }
  },
  /* man-made things: panel seams along the object's own axes with rivets in rows, vents, a hazard strip, rust, lamps */
  machine(S, R){
    const u = S.u, g = S.g, ca = Math.cos(g.ang), sa = Math.sin(g.ang), A = g.a * 1.1, B = g.b * 1.1, sp = Math.max(8 * u, Math.max(A, B) / 2.4);
    const P = function(s, t){ return [g.cx + ca * s - sa * t, g.cy + sa * s + ca * t]; };
    for (let s = -Math.floor(A / sp) * sp; s <= A; s += sp){ const a = P(s, -B), b = P(s, B); S.l(a[0], a[1], b[0], b[1], 0.55 * u, 'rgba(10,12,18,.32)'); for (let t = -B; t <= B; t += 4 * u){ const q = P(s, t); if (S.ok(q[0], q[1])) S.c(q[0], q[1], 0.5 * u, 'rgba(225,228,235,.85)'); } }
    for (let t = -Math.floor(B / sp) * sp; t <= B; t += sp){ const a = P(-A, t), b = P(A, t); S.l(a[0], a[1], b[0], b[1], 0.55 * u, 'rgba(10,12,18,.28)'); }
    for (let s = -A; s < A; s += 5 * u){ const q = P(s, -B * 0.85), r = P(s + 2.5 * u, -B * 0.85 + 2 * u), w = P(s + 5 * u, -B * 0.85); if (S.ok(q[0], q[1]) && S.ok(w[0], w[1])) S.t(q[0], q[1], r[0], r[1], w[0], w[1], 'rgba(232,200,74,.55)'); }
    for (let i = 0; i < S.n(3); i++){ const p = S.pt(0.7); if (p) for (let j = 0; j < 4; j++) S.l(p[0] - 2 * u, p[1] + (j - 1.5) * 1.1 * u, p[0] + 2 * u, p[1] + (j - 1.5) * 1.1 * u, 0.45 * u, 'rgba(10,12,18,.55)'); }
    for (let i = 0; i < S.n(5); i++){ const p = S.pt(0.9); if (p){ S.c(p[0], p[1], (0.9 + R() * 1.3) * u, 'rgba(150,80,40,.34)'); S.c(p[0] + 0.6 * u, p[1] + 0.4 * u, 0.5 * u, 'rgba(110,60,30,.42)'); } }
    const l = S.pt(0.6); if (l) S.sp(l[0], l[1], 0.9 * u, 'rgba(255,90,70,.95)');
    const l2 = S.pt(0.6); if (l2) S.sp(l2[0], l2[1], 0.9 * u, 'rgba(110,255,170,.95)');
  },
  /* crystal and ice: facets cut from the middle like stone, then shards at the edge and glints */
  crystal(S, R){
    SD_GEN.rock(S, R); const u = S.u;
    for (let i = 0; i < S.n(5); i++){ const e = S.edge(); if (!e) continue; const a = Math.atan2(e[1] - S.g.cy, e[0] - S.g.cx), c = S.col(e[0], e[1]), L = (2.6 + R() * 3) * u; S.t(e[0] - Math.sin(a) * 1 * u, e[1] + Math.cos(a) * 1 * u, e[0] + Math.cos(a) * L, e[1] + Math.sin(a) * L, e[0] + Math.sin(a) * 1 * u, e[1] - Math.cos(a) * 1 * u, sdRgb(c, 0.5, 0.85)); }
    for (let i = 0; i < S.n(3); i++){ const p = S.pt(0.9); if (p) S.sp(p[0], p[1], 1.1 * u, 'rgba(255,255,255,.95)'); }
  },
  /* ground: strata across mounds and drifts, grains, pebble clusters, and ripples where it is wet */
  soft(S, R){
    const u = S.u, g = S.g;
    for (let k = 0; k < 3; k++){ const f = 0.35 + k * 0.25; S.ops.push([6, g.cx, g.cy, g.a * f, g.b * f, 'rgba(0,0,0,' + (0.2 - k * 0.04) + ')']); }
    for (let i = 0; i < S.n(22); i++){ const p = S.pt(1); if (!p) continue; const c = S.col(p[0], p[1]); S.c(p[0], p[1], (0.35 + R() * 0.5) * u, sdRgb(c, R() < 0.5 ? 0.4 : -0.35, 0.7)); }
    for (let i = 0; i < S.n(4); i++){ const e = S.edge(); if (!e) continue; const c = S.col(e[0], e[1]); for (let j = 0; j < 3; j++) S.e(e[0] + (R() - 0.5) * 4 * u, e[1] + (R() - 0.5) * 4 * u, (0.8 + R() * 0.8) * u, 0.6 * u, R() * 3, sdRgb(c, -0.3, 0.7)); }
    if (S.water){ for (let i = 0; i < S.n(3); i++){ const p = S.pt(0.8); if (!p) continue; const c = S.col(p[0], p[1]); for (let j = 0; j < 2; j++) S.ops.push([6, p[0], p[1], (2 + j * 1.6) * u, (0.9 + j * 0.5) * u, sdRgb(c, 0.4, 0.45 - j * 0.15)]); } for (let i = 0; i < S.n(2); i++){ const p = S.pt(0.8); if (p) S.sp(p[0], p[1], 0.9 * u, 'rgba(255,255,255,.8)'); } }
  },
  /* fire and hot ground: glowing cracks that run from the middle to the edge, embers on them, soot and smoke */
  fire(S, R){
    const u = S.u, g = S.g;
    for (let i = 0; i < Math.max(3, Math.round(S.n(3))); i++){ const e = S.ray(R() * TAU, 0.95); if (e[2] < 4) continue; let x = g.cx, y = g.cy; const pts = [x, y], n = 4, dx = (e[0] - x) / n, dy = (e[1] - y) / n; for (let j = 1; j <= n; j++){ x += dx + (R() - 0.5) * 3 * u; y += dy + (R() - 0.5) * 3 * u; pts.push(x, y); } for (let j = 0; j + 3 < pts.length; j += 2) S.l(pts[j], pts[j + 1], pts[j + 2], pts[j + 3], 0.75 * u, 'rgba(255,170,60,.85)'); S.sp(pts[pts.length - 2], pts[pts.length - 1], 0.8 * u, 'rgba(255,220,120,.95)'); }
    for (let i = 0; i < S.n(8); i++){ const p = S.pt(0.95); if (p) S.sp(p[0], p[1], (0.5 + R() * 0.6) * u, i % 3 ? 'rgba(255,170,60,.95)' : 'rgba(255,90,40,.95)'); }
    for (let i = 0; i < S.n(5); i++){ const p = S.pt(0.9); if (p) S.c(p[0], p[1], (0.9 + R() * 1.2) * u, 'rgba(18,10,8,.4)'); }
    for (let i = 0; i < S.n(2); i++){ const p = S.pt(0.6); if (p) S.pf(p[0], p[1], 2.2 * u, 'rgba(210,205,200,.5)'); }
  },
  /* reefs and sea things: polyps in rings, tube mouths, bubbles */
  coral(S, R){
    const u = S.u, g = S.g;
    for (let k = 1; k <= 3; k++){ const rr = g.rad * k * 0.28, m = Math.max(4, Math.round(TAU * rr / (3.4 * u) * S.q)); for (let j = 0; j < m; j++){ const a = j * TAU / m + k, x = g.cx + Math.cos(a) * rr, y = g.cy + Math.sin(a) * rr; if (!S.ok(x, y)) continue; const c = S.col(x, y); S.c(x, y, 1.1 * u, sdRgb(c, 0.4, 0.85)); S.c(x, y, 0.5 * u, sdRgb(c, -0.55, 0.9)); } }
    for (let i = 0; i < S.n(3); i++){ const p = S.pt(0.8); if (!p) continue; const c = S.col(p[0], p[1]); S.c(p[0], p[1], 2 * u, sdRgb(c, -0.4, 0.7)); S.c(p[0], p[1], 1.2 * u, sdRgb(c, -0.7, 0.9)); }
    for (let i = 0; i < S.n(3); i++){ const p = S.pt(0.8); if (p) S.pf(p[0], p[1], 1.1 * u, 'rgba(225,248,252,.8)'); }
  }
};
function sdGen(o, kind, p){
  const M = sdMask(o, kind); if (!M) return null;
  const R = sdRng(o.id, p.seed === undefined ? 0.5 : p.seed), S = sdCtx(o, kind, p, M, R), fam = o.sdFam || (o.sdFam = sdFamily(o.id));
  SD_GEN[fam](S, R);
  return S.ops.length ? S.ops : null;
}
function sdDraw(ctx, ops, t){
  ctx.lineCap = 'round';
  for (let i = 0; i < ops.length; i++){
    const q = ops[i];
    switch (q[0]){
      case 0: ctx.fillStyle = q[4]; ctx.beginPath(); ctx.arc(q[1], q[2], q[3], 0, TAU); ctx.fill(); break;
      case 1: ctx.strokeStyle = q[6]; ctx.lineWidth = q[5]; ctx.beginPath(); ctx.moveTo(q[1], q[2]); ctx.lineTo(q[3], q[4]); ctx.stroke(); break;
      case 2: ctx.fillStyle = q[7]; ctx.beginPath(); ctx.moveTo(q[1], q[2]); ctx.lineTo(q[3], q[4]); ctx.lineTo(q[5], q[6]); ctx.closePath(); ctx.fill(); break;
      case 3: ctx.fillStyle = q[6]; ctx.beginPath(); ctx.ellipse(q[1], q[2], q[3], q[4], q[5], 0, TAU); ctx.fill(); break;
      case 4: { const a = 0.35 + 0.65 * Math.max(0, Math.sin(t * 2.2 + q[5])); ctx.globalAlpha = a; ctx.fillStyle = q[4]; ctx.beginPath(); ctx.arc(q[1], q[2], q[3] * (0.7 + 0.3 * a), 0, TAU); ctx.fill(); ctx.globalAlpha = 1; break; }
      case 5: { const ph = (t * 0.4 + q[5]) % 1; ctx.globalAlpha = 0.6 * (1 - ph); ctx.fillStyle = q[4]; ctx.beginPath(); ctx.arc(q[1] + Math.sin(ph * 5 + q[5] * 9) * q[3] * 0.4, q[2] - ph * q[3] * 3, q[3] * (0.6 + ph), 0, TAU); ctx.fill(); ctx.globalAlpha = 1; break; }
      case 6: ctx.strokeStyle = q[5]; ctx.lineWidth = 0.6; ctx.beginPath(); ctx.ellipse(q[1], q[2], q[3], q[4], 0, 0, TAU); ctx.stroke(); break;
    }
  }
  ctx.lineCap = 'butt';
}
/* wrap every drawing of every chapter's definitions (a definition is shared by the chapters that use it, so each is wrapped once) */
(function(){
  const seen = new Set();
  function wrap(list, kind){
    if (!list) return;
    for (let i = 0; i < list.length; i++){
      const o = list[i]; if (o._sdBase || !o.draw) continue;
      const base = o.draw; o._sdBase = base;
      o.draw = function(ctx, p, t){
        base.call(this, ctx, p, t);
        if (SD.off || fxLevelNow() <= 0) return;
        let ops = p._sd;
        if (ops === undefined){                                       /* laid out the first time it is seen, a few milliseconds a frame at most */
          if (SD.frame !== G.time){ SD.frame = G.time; SD.ms = 0; }
          if (SD.ms > 3) return;
          const t0 = performance.now(); ops = p._sd = sdGen(o, kind, p); SD.ms += performance.now() - t0;
        }
        if (ops) sdDraw(ctx, ops, t);
      };
    }
  }
  for (const ch in SCEN_DEFS){
    const d = SCEN_DEFS[ch]; if (seen.has(d)) continue; seen.add(d);
    wrap(d.props, 'prop'); wrap(d.landmarks, 'landmark'); wrap(d.decals, 'decal'); wrap(d.terrain, 'zone');
  }
  const build = buildScenery;
  buildScenery = function(){ if (SD.ch !== (G.chapter | 0)){ SD.masks = {}; SD.ch = G.chapter | 0; } return build.apply(this, arguments); };       /* masks are only kept for the chapter being played */
})();
