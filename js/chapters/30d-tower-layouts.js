'use strict';
/* Chapter 14, the Tower: the twenty-five floor plans. Pure data and arithmetic, no game globals, so a script can print and check them (tools/scenarios/tower.js does). */
/* ========================= THE TOWER'S FLOOR PLANS ========================= */
/* A floor is the whole arena (28 x 21 cells of 150 px). It is cut into rectangular rooms that tile it exactly; a wall runs along every boundary between two rooms
   except where a door is cut into it (or where a door is "full", which joins the two rooms into one L- or T-shaped space). Furniture is solid too: each room can be given
   a pattern (rows of cubicles, server racks, pillars...) that is laid out inside the room with a clear margin all round, so the doorways and the rim of the room
   are always free and every room can be crossed.
     rooms: { A: [x0, y0, x1, y1, floorKind], ... }                          (cells)
     doors: ['A-B', 'A-B:0.3', 'A-B:0.3:3', 'A-B:0.5:full']                  (where along the shared wall, as a fraction, and how wide, in cells; default 0.5 and 2.6)
     pats:  { A: 'cubicles', ... }                                           (TW_PAT below)
     start, lift: [room, side, position]                                      (a elevator is a 2 x 2 cell space against the wall of that room on that side)  */
const TW_U = 150, TW_COLS = 28, TW_ROWS = 21, TW_WALL = 64, TW_DOOR = 2.6, TW_INSET = 1.9;
function twRnd(seed){ let s = (seed * 9301 + 49297) % 233280; return function(){ s = (s * 9301 + 49297) % 233280; return s / 233280; }; }
/* ---- furniture patterns: each takes the free area of a room (r = { x0, y0, x1, y1 } in cells) and a seeded random, and returns boxes { x, y, w, h, k } in cells ---- */
const TW_PAT = {
  pillars(r){ const o = [], nx = Math.max(1, Math.floor((r.x1 - r.x0) / 4.4)), ny = Math.max(1, Math.floor((r.y1 - r.y0) / 4.4)); for (let i = 0; i < nx; i++) for (let j = 0; j < ny; j++) o.push({ x: r.x0 + (i + 0.5) * (r.x1 - r.x0) / nx - 0.5, y: r.y0 + (j + 0.5) * (r.y1 - r.y0) / ny - 0.5, w: 1, h: 1, k: (i + j) % 2 && nx * ny > 3 ? 'planter' : 'pillar' }); return o; },
  cubicles(r){ const o = [], nx = Math.floor((r.x1 - r.x0 + 1.8) / 5.0), ny = Math.floor((r.y1 - r.y0 + 2.3) / 3.6); if (nx < 1 || ny < 1) return o; const ox = r.x0 + ((r.x1 - r.x0) - (nx * 5.0 - 1.8)) / 2, oy = r.y0 + ((r.y1 - r.y0) - (ny * 3.6 - 2.3)) / 2;
    for (let i = 0; i < nx; i++) for (let j = 0; j < ny; j++) o.push({ x: ox + i * 5.0, y: oy + j * 3.6, w: 3.2, h: 1.3, k: 'desk' }); return o; },
  tables(r){ const o = [], nx = Math.floor((r.x1 - r.x0 + 2.6) / 5.2), ny = Math.floor((r.y1 - r.y0 + 2.4) / 3.9); if (nx < 1 || ny < 1) return o; const ox = r.x0 + ((r.x1 - r.x0) - (nx * 5.2 - 2.6)) / 2, oy = r.y0 + ((r.y1 - r.y0) - (ny * 3.9 - 2.4)) / 2;
    for (let i = 0; i < nx; i++) for (let j = 0; j < ny; j++) o.push({ x: ox + i * 5.2, y: oy + j * 3.9, w: 2.6, h: 1.5, k: 'table' }); return o; },
  racks(r){ const o = [], n = Math.floor((r.x1 - r.x0 + 2.2) / 3.2); if (n < 1) return o; const ox = r.x0 + ((r.x1 - r.x0) - (n * 3.2 - 2.2)) / 2, H = r.y1 - r.y0;
    for (let i = 0; i < n; i++){ if (H >= 13){ const a = (H - 2.4) / 2; o.push({ x: ox + i * 3.2, y: r.y0, w: 1, h: a, k: 'rack' }, { x: ox + i * 3.2, y: r.y0 + a + 2.4, w: 1, h: a, k: 'rack' }); } else o.push({ x: ox + i * 3.2, y: r.y0 + (i % 2) * 1.2, w: 1, h: H - 1.2, k: 'rack' }); } return o; },
  shelves(r){ const o = [], n = Math.floor((r.y1 - r.y0 + 2.1) / 3.0); if (n < 1) return o; const oy = r.y0 + ((r.y1 - r.y0) - (n * 3.0 - 2.1)) / 2, W = r.x1 - r.x0;
    for (let j = 0; j < n; j++){ if (W >= 11){ const a = (W - 2.4) / 2; o.push({ x: r.x0 + (j % 2) * 1.0, y: oy + j * 3.0, w: a - (j % 2) * 1.0, h: 0.9, k: 'shelf' }, { x: r.x0 + a + 2.4, y: oy + j * 3.0, w: a - (1 - j % 2) * 1.0, h: 0.9, k: 'shelf' }); } else o.push({ x: r.x0 + (j % 2) * 1.5, y: oy + j * 3.0, w: W - 1.5, h: 0.9, k: 'shelf' }); } return o; },
  belts(r){ const o = [], n = Math.floor((r.y1 - r.y0 + 2.6) / 3.8); if (n < 1) return o; const oy = r.y0 + ((r.y1 - r.y0) - (n * 3.8 - 2.6)) / 2;
    for (let j = 0; j < n; j++){ let x = r.x0 + (j % 2) * 2.4; while (x + 4 < r.x1){ const L = Math.min(6.5, r.x1 - x); o.push({ x: x, y: oy + j * 3.8, w: L, h: 1.2, k: 'belt' }); x += L + 2.6; } } return o; },
  planters(r){ const o = [], nx = Math.max(1, Math.floor((r.x1 - r.x0) / 5)), ny = Math.max(1, Math.floor((r.y1 - r.y0) / 5)); for (let i = 0; i < nx; i++) for (let j = 0; j < ny; j++) o.push({ x: r.x0 + (i + 0.5) * (r.x1 - r.x0) / nx - 0.8, y: r.y0 + (j + 0.5) * (r.y1 - r.y0) / ny - 0.8, w: 1.6, h: 1.6, k: 'planter' }); return o; },
  sofas(r){ const cx = (r.x0 + r.x1) / 2, cy = (r.y0 + r.y1) / 2; return [{ x: cx - 4.6, y: cy - 2.2, w: 3.2, h: 1.1, k: 'sofa' }, { x: cx + 1.4, y: cy - 2.2, w: 3.2, h: 1.1, k: 'sofa' }, { x: cx - 1.6, y: cy + 1.4, w: 3.2, h: 1.1, k: 'sofa' }]; },
  counters(r){ const W = Math.min(r.x1 - r.x0, 11); return [{ x: r.x0, y: r.y0, w: W, h: 1.1, k: 'counter' }, { x: r.x1 - 1.1, y: r.y0 + 2.4, w: 1.1, h: Math.max(1, Math.min(4.5, r.y1 - r.y0 - 3)), k: 'counter' }]; },
  desks(r){ const o = [], nx = Math.max(1, Math.floor((r.x1 - r.x0 + 2) / 4.4)), ny = Math.max(1, Math.floor((r.y1 - r.y0 + 2) / 3.6)); for (let i = 0; i < nx; i++) for (let j = 0; j < ny; j++) o.push({ x: r.x0 + (i + 0.5) * (r.x1 - r.x0) / nx - 1.2, y: r.y0 + (j + 0.5) * (r.y1 - r.y0) / ny - 0.6, w: 2.4, h: 1.2, k: 'desk' }); return o; },
  longtable(r){ const W = Math.min(r.x1 - r.x0 - 2, 13), H = Math.min(r.y1 - r.y0 - 2, 2.6), cx = (r.x0 + r.x1) / 2, cy = (r.y0 + r.y1) / 2; return [{ x: cx - W / 2, y: cy - H / 2, w: W, h: H, k: 'table' }]; },
  tanks(r){ const o = [], nx = Math.max(1, Math.floor((r.x1 - r.x0) / 5.5)), ny = Math.max(1, Math.floor((r.y1 - r.y0) / 5.5)); for (let i = 0; i < nx; i++) for (let j = 0; j < ny; j++) o.push({ x: r.x0 + (i + 0.5) * (r.x1 - r.x0) / nx - ((i + j) % 2 ? 0.7 : 0.9), y: r.y0 + (j + 0.5) * (r.y1 - r.y0) / ny - ((i + j) % 2 ? 0.7 : 0.9), w: (i + j) % 2 ? 1.4 : 1.8, h: (i + j) % 2 ? 1.4 : 1.8, k: 'tank' }); return o; },
  safes(r){ const o = [], n = Math.floor((r.x1 - r.x0 + 2.4) / 4.6); if (n < 1) return o; const ox = r.x0 + ((r.x1 - r.x0) - (n * 4.6 - 2.4)) / 2, H = r.y1 - r.y0; for (let i = 0; i < n; i++) o.push({ x: ox + i * 4.6, y: r.y0 + (i % 2 ? H * 0.5 : 0), w: i % 3 === 1 ? 1.5 : 2.2, h: H * (i % 3 === 2 ? 0.35 : 0.5) - 1.1, k: 'safe' }); return o; },
  throne(r){ const cx = (r.x0 + r.x1) / 2; return [{ x: cx - 3.5, y: r.y0, w: 7, h: 1.6, k: 'desk' }, { x: r.x0 + 1, y: r.y0 + 5, w: 1, h: 1, k: 'pillar' }, { x: r.x1 - 2, y: r.y0 + 5, w: 1, h: 1, k: 'pillar' }, { x: r.x0 + 1, y: r.y1 - 2, w: 1, h: 1, k: 'pillar' }, { x: r.x1 - 2, y: r.y1 - 2, w: 1, h: 1, k: 'pillar' }]; },
  none(){ return []; }
};
/* ---- the plans ---- */
const TOWER_PLANS = [
  { name: 'Lobby', kind: 'lobby',                                                                   /* 1: three columns, the side ones cut in two */
    rooms: { A: [0, 0, 9, 10], B: [0, 10, 9, 21], C: [9, 0, 19, 21], D: [19, 0, 28, 10], E: [19, 10, 28, 21] },
    doors: ['A-C', 'B-C', 'D-C', 'E-C', 'A-B', 'D-E'], pats: { C: 'pillars', A: 'sofas', E: 'sofas' }, start: ['C', 's', 14], lift: ['D', 'n', 24] },
  { name: 'Mailroom', kind: 'mail',                                                                /* 2: a big sorting hall in the middle, rooms round it */
    rooms: { A: [0, 0, 12, 7], B: [12, 0, 28, 7], C: [0, 7, 7, 21], D: [7, 7, 21, 14], E: [21, 7, 28, 21], F: [7, 14, 21, 21] },
    doors: ['A-B', 'A-C', 'A-D', 'B-E', 'B-D:0.7', 'C-F', 'F-E', 'D-F:0.8'], pats: { D: 'belts', F: 'shelves', A: 'shelves' }, start: ['C', 's', 3.5], lift: ['B', 'n', 24] },
  { name: 'Security Level', kind: 'steel',                                                         /* 3: a ring corridor round four guard rooms */
    rooms: { A: [0, 0, 28, 4], B: [0, 17, 28, 21], C: [0, 4, 4, 17], D: [24, 4, 28, 17], E: [4, 4, 12, 10], F: [12, 4, 24, 10], G: [4, 10, 14, 17], H: [14, 10, 24, 17] },
    doors: ['A-C:0.5:full', 'A-D:0.5:full', 'B-C:0.5:full', 'B-D:0.5:full', 'A-E:0.6', 'A-F:0.5', 'B-G:0.5', 'B-H:0.5', 'C-E:0.5', 'D-F:0.5', 'C-G:0.5', 'D-H:0.5', 'E-F:0.5', 'G-H:0.5'],
    pats: { E: 'desks', F: 'desks', G: 'desks', H: 'desks' }, start: ['B', 's', 4], lift: ['A', 'n', 24] },
  { name: 'Open Plan', kind: 'carpet',                                                              /* 4: one huge cubicle field and three rooms under it */
    rooms: { A: [0, 0, 28, 13], B: [0, 13, 9, 21], C: [9, 13, 19, 21], D: [19, 13, 28, 21] },
    doors: ['A-B:0.5:3', 'A-C:0.5:3.4', 'A-D:0.5:3', 'B-C', 'C-D'], pats: { A: 'cubicles', C: 'tables' }, start: ['B', 's', 4], lift: ['A', 'n', 25] },
  { name: 'Reception Atrium', kind: 'marble',                                                        /* 5, boss: a great hall inside a ring corridor */
    rooms: { A: [4, 3, 24, 18], N: [4, 0, 24, 3], S: [4, 18, 24, 21], W: [0, 0, 4, 21], E: [24, 0, 28, 21] },
    doors: ['A-N:0.5:3.4', 'A-S:0.5:3.4', 'A-W:0.5:3.4', 'A-E:0.5:3.4', 'N-W:0.5:full', 'N-E:0.5:full', 'S-W:0.5:full', 'S-E:0.5:full'], pats: { A: 'pillars' }, start: ['S', 's', 14], lift: ['N', 'n', 14], boss: true },
  { name: 'Cafeteria', kind: 'tile',                                                                /* 6: a dining hall, a kitchen and a cold store */
    rooms: { A: [0, 0, 17, 14], B: [17, 0, 28, 8], C: [17, 8, 28, 14], D: [0, 14, 14, 21], E: [14, 14, 28, 21] },
    doors: ['A-B', 'A-C', 'B-C', 'A-D', 'A-E:0.8', 'C-E', 'D-E'], pats: { A: 'tables', B: 'counters', C: 'shelves', D: 'sofas' }, start: ['D', 's', 3], lift: ['B', 'n', 25] },
  { name: 'Human Resources', kind: 'carpet',                                                        /* 7: twelve small offices in a snake */
    rooms: { A: [0, 0, 7, 7], B: [7, 0, 14, 7], C: [14, 0, 21, 7], D: [21, 0, 28, 7], E: [0, 7, 7, 14], F: [7, 7, 14, 14], G: [14, 7, 21, 14], H: [21, 7, 28, 14], I: [0, 14, 7, 21], J: [7, 14, 14, 21], K: [14, 14, 21, 21], L: [21, 14, 28, 21] },
    doors: ['A-B', 'B-C', 'C-D', 'D-H', 'H-G', 'G-F', 'F-E', 'E-I', 'I-J', 'J-K', 'K-L', 'B-F:0.5', 'G-K:0.5', 'C-G:0.3'], pats: { A: 'desks', C: 'desks', F: 'desks', G: 'sofas', J: 'desks' }, start: ['A', 'n', 3], lift: ['L', 's', 25] },
  { name: 'Print Shop', kind: 'steel',                                                               /* 8: a spine corridor and six workshops */
    rooms: { C: [12, 0, 16, 21], A: [0, 0, 12, 7], B: [0, 7, 12, 14], D: [0, 14, 12, 21], E: [16, 0, 28, 7], F: [16, 7, 28, 14], G: [16, 14, 28, 21] },
    doors: ['A-C', 'B-C', 'D-C', 'E-C', 'F-C', 'G-C', 'A-B:0.2', 'F-G:0.8'], pats: { A: 'belts', B: 'shelves', D: 'belts', E: 'desks', F: 'belts', G: 'shelves' }, start: ['D', 's', 3], lift: ['E', 'n', 25] },
  { name: 'Accounting', kind: 'carpet',                                                              /* 9: stepped rooms of different sizes */
    rooms: { A: [0, 0, 10, 12], B: [10, 0, 28, 6], C: [10, 6, 19, 12], D: [19, 6, 28, 12], E: [0, 12, 13, 21], F: [13, 12, 28, 21] },
    doors: ['A-B:0.5', 'A-C:0.5', 'B-D:0.5', 'C-D', 'A-E', 'C-F:0.8', 'E-F', 'D-F:0.5'], pats: { B: 'desks', E: 'cubicles', F: 'cubicles', A: 'desks' }, start: ['E', 's', 3], lift: ['B', 'n', 26] },
  { name: 'Conference Hall', kind: 'marble',                                                         /* 10, boss: a great hall with one long table, and three rooms beside it */
    rooms: { A: [0, 0, 19, 21], B: [19, 0, 28, 7], C: [19, 7, 28, 14], D: [19, 14, 28, 21] },
    doors: ['A-B:0.5:3', 'A-C:0.5:3.4', 'A-D:0.5:3', 'B-C', 'C-D'], pats: { A: 'longtable', C: 'sofas' }, start: ['D', 'e', 17.5], lift: ['B', 'n', 24], boss: true },
  { name: 'Server Hall', kind: 'server',                                                              /* 11: rows of racks make lanes */
    rooms: { A: [0, 0, 22, 21], B: [22, 0, 28, 10], C: [22, 10, 28, 21] },
    doors: ['A-B:0.5:3', 'A-C:0.5:3', 'B-C'], pats: { A: 'racks' }, start: ['C', 's', 25], lift: ['A', 'n', 3] },
  { name: 'Network Operations', kind: 'server',                                                       /* 12: a core room in a ring of halls */
    rooms: { I: [9, 6, 19, 15], N: [0, 0, 28, 6], S: [0, 15, 28, 21], W: [0, 6, 9, 15], E: [19, 6, 28, 15] },
    doors: ['I-N', 'I-S', 'I-W', 'I-E', 'N-W:0.5:3', 'W-S:0.5:3', 'S-E:0.5:3', 'E-N:0.5:3'], pats: { I: 'racks', N: 'desks', S: 'desks' }, start: ['S', 's', 3.5], lift: ['N', 'n', 25] },
  { name: 'Shredding Plant', kind: 'steel',                                                           /* 13: four long halls, with the doors at alternate ends */
    rooms: { A: [0, 0, 28, 6], B: [0, 6, 28, 11], C: [0, 11, 28, 16], D: [0, 16, 28, 21] },
    doors: ['A-B:0.9:3', 'B-C:0.1:3', 'C-D:0.9:3'], pats: { A: 'belts', B: 'pillars', C: 'belts', D: 'pillars' }, start: ['A', 'w', 3], lift: ['D', 'w', 18.5] },
  { name: 'Training Rooms', kind: 'carpet',                                                          /* 14: a pinwheel round a small hub */
    rooms: { A: [0, 0, 18, 7], B: [18, 0, 28, 14], C: [10, 14, 28, 21], D: [0, 7, 10, 21], H: [10, 7, 18, 14] },
    doors: ['A-B:0.5', 'B-C:0.5', 'C-D:0.5', 'D-A:0.5', 'H-A', 'H-B', 'H-C', 'H-D'], pats: { A: 'tables', C: 'tables', D: 'desks', B: 'desks' }, start: ['D', 's', 4], lift: ['B', 'n', 25] },
  { name: 'Vault Floor', kind: 'vault',                                                              /* 15, boss: deposit rooms either side of a long strongroom */
    rooms: { A: [5, 0, 23, 21], W: [0, 0, 5, 21], E: [23, 0, 28, 21] },
    doors: ['A-W:0.25:3.4', 'A-W:0.75:3.4', 'A-E:0.25:3.4', 'A-E:0.75:3.4'], pats: { A: 'safes', W: 'none' }, start: ['W', 's', 2.5], lift: ['E', 'n', 25.5], boss: true },
  { name: 'Lab Corridor', kind: 'lab',                                                               /* 16: a long corridor with labs on both sides */
    rooms: { C: [0, 8, 28, 13], N1: [0, 0, 9, 8], N2: [9, 0, 19, 8], N3: [19, 0, 28, 8], S1: [0, 13, 9, 21], S2: [9, 13, 19, 21], S3: [19, 13, 28, 21] },
    doors: ['N1-C', 'N2-C', 'N3-C', 'S1-C', 'S2-C', 'S3-C', 'N1-N2:0.5', 'S2-S3:0.5'], pats: { N2: 'tables', S2: 'tanks', N3: 'desks', S3: 'tables' }, start: ['S1', 's', 4], lift: ['N3', 'n', 25] },
  { name: 'Battery Store', kind: 'steel',                                                            /* 17: a ninefold grid, big room in the middle */
    rooms: { A: [0, 0, 8, 7], B: [8, 0, 20, 7], C: [20, 0, 28, 7], D: [0, 7, 8, 14], E: [8, 7, 20, 14], F: [20, 7, 28, 14], G: [0, 14, 8, 21], H: [8, 14, 20, 21], I: [20, 14, 28, 21] },
    doors: ['E-B', 'E-D', 'E-F', 'E-H', 'A-B', 'B-C', 'C-F', 'F-I', 'I-H', 'H-G', 'G-D', 'D-A'], pats: { E: 'shelves', B: 'shelves', H: 'shelves' }, start: ['G', 's', 3.5], lift: ['C', 'n', 24.5] },
  { name: 'Greenhouse Lab', kind: 'lab',                                                             /* 18: four rooms above one large garden hall */
    rooms: { A: [0, 0, 7, 9], B: [7, 0, 14, 9], C: [14, 0, 21, 9], D: [21, 0, 28, 9], E: [0, 9, 28, 21] },
    doors: ['A-E', 'B-E', 'C-E', 'D-E', 'A-B:0.3', 'C-D:0.3'], pats: { E: 'planters', B: 'tables', C: 'tanks' }, start: ['E', 's', 3], lift: ['D', 'n', 25] },
  { name: 'Quarantine', kind: 'lab',                                                                /* 19: sealed rooms: the ring is broken, so the way up goes through them */
    rooms: { O1: [0, 0, 28, 4], O2: [0, 17, 28, 21], O3: [0, 4, 4, 17], O4: [24, 4, 28, 17], I1: [4, 4, 24, 9], I2: [4, 9, 14, 17], I3: [14, 9, 24, 13], I4: [14, 13, 24, 17] },
    doors: ['O2-O3:0.5:2.6', 'O3-I2:0.5', 'I2-I1:0.3', 'I1-I3:0.6', 'I3-I4:0.5', 'I4-O4:0.5', 'O4-O1:0.5:2.6', 'O1-I1:0.3', 'I2-O2:0.6'], pats: { I1: 'tanks', I2: 'tables', I3: 'desks' }, start: ['O2', 's', 3], lift: ['O1', 'n', 25] },
  { name: 'Experiment Hall', kind: 'lab',                                                             /* 20, boss: a great tank hall with a room each side */
    rooms: { A: [6, 0, 28, 21], B: [0, 0, 6, 10], C: [0, 10, 6, 21] },
    doors: ['A-B:0.5:3.4', 'A-C:0.5:3.4', 'B-C'], pats: { A: 'tanks' }, start: ['C', 's', 3], lift: ['A', 'n', 25], boss: true },
  { name: 'Legal Department', kind: 'wood',                                                           /* 21: four tall halls of shelves, doors at alternate ends */
    rooms: { A: [0, 0, 7, 21], B: [7, 0, 14, 21], C: [14, 0, 21, 21], D: [21, 0, 28, 21] },
    doors: ['A-B:0.9:3', 'B-C:0.1:3', 'C-D:0.9:3'], pats: { A: 'shelves', B: 'shelves', C: 'shelves', D: 'desks' }, start: ['A', 'n', 3.5], lift: ['D', 'n', 24.5] },
  { name: 'Boardroom Suites', kind: 'wood',                                                           /* 22: a big boardroom the long way round */
    rooms: { A: [6, 5, 22, 16], N: [0, 0, 28, 5], S: [0, 16, 28, 21], W1: [0, 5, 6, 10], W2: [0, 10, 6, 16], E1: [22, 5, 28, 10], E2: [22, 10, 28, 16] },
    doors: ['A-W2', 'A-E1', 'N-W1', 'W1-W2', 'N-E1', 'E1-E2', 'E2-S', 'W2-S:0.5'], pats: { A: 'longtable', N: 'sofas', S: 'sofas' }, start: ['S', 's', 3], lift: ['N', 'n', 25] },
  { name: 'Executive Gallery', kind: 'marble',                                                         /* 23: a long gallery and six offices off it */
    rooms: { G: [0, 0, 28, 8], O1: [0, 8, 5, 21], O2: [5, 8, 10, 21], O3: [10, 8, 14, 21], O4: [14, 8, 18, 21], O5: [18, 8, 23, 21], O6: [23, 8, 28, 21] },
    doors: ['G-O1', 'G-O2', 'G-O3', 'G-O4', 'G-O5', 'G-O6', 'O3-O4:0.8', 'O1-O2:0.8'], pats: { G: 'planters' }, start: ['O1', 's', 2.5], lift: ['O6', 's', 25.5] },
  { name: 'Penthouse Approach', kind: 'marble',                                                        /* 24: an hourglass: two halls and a waist between them */
    rooms: { T: [0, 0, 28, 7], M: [8, 7, 20, 14], B: [0, 14, 28, 21], LW: [0, 7, 8, 14], RW: [20, 7, 28, 14] },
    doors: ['T-M:0.5:3.4', 'M-B:0.5:3.4', 'T-LW', 'LW-B', 'T-RW', 'RW-B'], pats: { T: 'planters', B: 'planters', M: 'sofas' }, start: ['B', 's', 3], lift: ['T', 'n', 25] },
  { name: 'The Executive Floor', kind: 'penthouse',                                                    /* 25, boss: the corner office, and two rooms to come in through */
    rooms: { A: [0, 0, 28, 15], B: [0, 15, 12, 21], C: [12, 15, 28, 21] },
    doors: ['A-B:0.5:3', 'A-C:0.5:3.4', 'B-C'], pats: { A: 'throne' }, start: ['B', 's', 3], lift: ['A', 'n', 14], boss: true }
];
/* how much of the open floor can be reached from a point on a 50 px map padded by one cell (what the creatures and the giraffe's path-finding use): used to keep the furniture from shutting anything in */
function twReach(rects, sx, sy, lx, ly){
  const NX = 84, NY = 63, N = NX * NY, solid = new Uint8Array(N), blocked = new Uint8Array(N);
  for (let k = 0; k < rects.length; k++){ const r = rects[k], i0 = Math.max(0, Math.floor(r.x / 50)), i1 = Math.min(NX - 1, Math.floor((r.x + r.w) / 50)), j0 = Math.max(0, Math.floor(r.y / 50)), j1 = Math.min(NY - 1, Math.floor((r.y + r.h) / 50));
    for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) if (i * 50 + 50 > r.x && i * 50 < r.x + r.w && j * 50 + 50 > r.y && j * 50 < r.y + r.h) solid[j * NX + i] = 1; }
  for (let j = 0; j < NY; j++) for (let i = 0; i < NX; i++){ let b = 0; for (let dj = -1; dj <= 1 && !b; dj++) for (let di = -1; di <= 1; di++){ const a = i + di, c = j + dj; if (a < 0 || c < 0 || a >= NX || c >= NY || solid[c * NX + a]){ b = 1; break; } } blocked[j * NX + i] = b; }
  const seen = new Uint8Array(N), q = [Math.floor(sy / 50) * NX + Math.floor(sx / 50)]; seen[q[0]] = 1; let open = 0, reach = 0;
  while (q.length){ const c = q.pop(), i = c % NX, j = (c / NX) | 0; for (let k = 0; k < 4; k++){ const a = i + (k === 0 ? 1 : k === 1 ? -1 : 0), b = j + (k === 2 ? 1 : k === 3 ? -1 : 0); if (a < 0 || b < 0 || a >= NX || b >= NY) continue; const m = b * NX + a; if (seen[m] || blocked[m]) continue; seen[m] = 1; q.push(m); } }
  for (let k = 0; k < N; k++) if (!blocked[k]){ open++; if (seen[k]) reach++; }
  return { lost: open - reach, liftOk: !!seen[Math.floor(ly / 50) * NX + Math.floor(lx / 50)] };
}
/* ---- turning a plan into walls, boxes, doors and the two elevators, in pixels ---- */
function twBuildPlan(n){
  const P0 = TOWER_PLANS[Math.max(0, Math.min(TOWER_PLANS.length - 1, n - 1))], U = TW_U, rooms = [], walls = [], boxes = [], doors = [], keys = Object.keys(P0.rooms), rnd = twRnd(n * 977 + 13);
  keys.forEach(k => { const r = P0.rooms[k]; rooms.push({ id: k, x: r[0] * U, y: r[1] * U, w: (r[2] - r[0]) * U, h: (r[3] - r[1]) * U, kind: r[4] || P0.kind, cx0: r[0], cy0: r[1], cx1: r[2], cy1: r[3] }); });
  const T = TW_WALL, wall = (x, y, w, h) => walls.push({ x: x, y: y, w: w, h: h, k: 'wall' });
  /* the outer shell */
  wall(-T / 2, -T / 2, TW_COLS * U + T, T); wall(-T / 2, TW_ROWS * U - T / 2, TW_COLS * U + T, T); wall(-T / 2, -T / 2, T, TW_ROWS * U + T); wall(TW_COLS * U - T / 2, -T / 2, T, TW_ROWS * U + T);
  const dspec = {};                                                                             /* the doors, by pair of rooms */
  (P0.doors || []).forEach(s => { const p = s.split(':'), ab = p[0].split('-'), key = ab[0] < ab[1] ? ab[0] + '-' + ab[1] : ab[1] + '-' + ab[0]; (dspec[key] = dspec[key] || []).push({ t: p[1] === undefined ? 0.5 : +p[1], w: p[2] === 'full' ? 0 : p[2] === undefined ? TW_DOOR : +p[2] }); });
  for (let i = 0; i < keys.length; i++) for (let j = i + 1; j < keys.length; j++){
    const a = P0.rooms[keys[i]], b = P0.rooms[keys[j]], key = keys[i] < keys[j] ? keys[i] + '-' + keys[j] : keys[j] + '-' + keys[i], ds = dspec[key] || [];
    let vert = null, line, o0, o1;
    if (a[2] === b[0] || b[2] === a[0]){ o0 = Math.max(a[1], b[1]); o1 = Math.min(a[3], b[3]); if (o1 > o0){ vert = true; line = a[2] === b[0] ? a[2] : a[0]; } }
    if (vert === null && (a[3] === b[1] || b[3] === a[1])){ o0 = Math.max(a[0], b[0]); o1 = Math.min(a[2], b[2]); if (o1 > o0){ vert = false; line = a[3] === b[1] ? a[3] : a[1]; } }
    if (vert === null) continue;
    let gaps = [], full = false;
    ds.forEach(d => { if (d.w === 0){ full = true; return; } const w = Math.min(d.w, o1 - o0 - 0.6), c = o0 + (o1 - o0) * d.t, g0 = Math.max(o0 + 0.3, Math.min(o1 - 0.3 - w, c - w / 2)); gaps.push([g0, g0 + w]); });
    if (full){ doors.push(vert ? { x: line * U, y: o0 * U, w: 0, h: (o1 - o0) * U, v: true, full: true } : { x: o0 * U, y: line * U, w: (o1 - o0) * U, h: 0, v: false, full: true }); continue; }
    gaps.sort((p, q) => p[0] - q[0]);
    let at = o0;
    gaps.forEach(g => { if (g[0] > at) segWall(vert, line, at, g[0]); at = g[1]; doors.push(vert ? { x: line * U, y: g[0] * U, w: 0, h: (g[1] - g[0]) * U, v: true } : { x: g[0] * U, y: line * U, w: (g[1] - g[0]) * U, h: 0, v: false }); });
    if (at < o1) segWall(vert, line, at, o1);
  }
  function segWall(vert, line, a, b){ if (vert) wall(line * U - T / 2, a * U - T / 2, T, (b - a) * U + T); else wall(a * U - T / 2, line * U - T / 2, (b - a) * U + T, T); }
  /* furniture: laid out inside each room with a clear margin all round, so doorways and the room's rim stay open */
  /* a big room with no furniture of its own gets the pattern that suits the floor (corridors, thin rooms and boss floors stay open) */
  const FILL = { lobby: 'sofas', mail: 'shelves', steel: 'desks', carpet: 'desks', marble: 'sofas', tile: 'tables', server: 'racks', lab: 'tables', vault: 'safes', wood: 'longtable', penthouse: 'sofas' };
  keys.forEach(k => { const r = P0.rooms[k], rw0 = r[2] - r[0], rh0 = r[3] - r[1]; let pat = (P0.pats || {})[k];
    if (!pat && !P0.boss && Math.min(rw0, rh0) >= 6 && rw0 * rh0 >= 48 && Math.max(rw0, rh0) <= 2.6 * Math.min(rw0, rh0)) pat = FILL[r[4] || P0.kind];
    if (!pat || !TW_PAT[pat]) return;
    const ins = Math.min(TW_INSET, Math.max(1.5, (Math.min(rw0, rh0) - 2.4) / 2));                          /* a shallow room (6 cells deep) keeps a slightly smaller margin so it can hold a row of furniture */
    const area = { x0: r[0] + ins, y0: r[1] + ins, x1: r[2] - ins, y1: r[3] - ins }; if (area.x1 - area.x0 < 2.2 || area.y1 - area.y0 < 2.2) return;
    TW_PAT[pat](area, rnd).forEach(b => { b.w = Math.min(b.w, area.x1 - area.x0); b.h = Math.min(b.h, area.y1 - area.y0); b.x = Math.max(area.x0, Math.min(area.x1 - b.w, b.x)); b.y = Math.max(area.y0, Math.min(area.y1 - b.h, b.y));          /* nothing may straddle a wall */
      if (b.w > 0.2 && b.h > 0.2) boxes.push({ x: b.x * U, y: b.y * U, w: b.w * U, h: b.h * U, k: b.k, room: k }); }); });
  /* the elevators come first, so the clutter can keep clear of them */
  const liftSpot = (spec) => { const r = P0.rooms[spec[0]], side = spec[1], pos = spec[2]; let cx, cy;
    if (side === 's'){ cx = pos; cy = r[3] - 1; } else if (side === 'n'){ cx = pos; cy = r[1] + 1; } else if (side === 'w'){ cx = r[0] + 1; cy = pos; } else { cx = r[2] - 1; cy = pos; }
    return { x: (cx - 1) * U - U * 0.6, y: (cy - 1) * U - U * 0.6, w: 3.2 * U, h: 3.2 * U }; };
  const sp0 = liftSpot(P0.start), ep0 = liftSpot(P0.lift), start0 = { x: sp0.x + sp0.w / 2, y: sp0.y + sp0.h / 2 }, exit0 = { x: ep0.x + ep0.w / 2, y: ep0.y + ep0.h / 2 };
  for (let i = boxes.length - 1; i >= 0; i--){ const q = boxes[i]; if ([sp0, ep0].some(z => q.x < z.x + z.w + 0.5 * U && q.x + q.w > z.x - 0.5 * U && q.y < z.y + z.h + 0.5 * U && q.y + q.h > z.y - 0.5 * U)) boxes.splice(i, 1); }     /* nothing from a room's furniture pattern stands on a elevator */
  const base = twReach(walls.concat(boxes), start0.x, start0.y, exit0.x, exit0.y);
  const keep = [sp0, ep0];
  doors.forEach(d => keep.push(d.v ? { x: d.x - 1.5 * U, y: d.y - 0.6 * U, w: 3 * U, h: d.h + 1.2 * U } : { x: d.x - 0.6 * U, y: d.y - 1.5 * U, w: d.w + 1.2 * U, h: 3 * U }));
  const hits = (a, b, m) => a.x < b.x + b.w + m && a.x + a.w > b.x - m && a.y < b.y + b.h + m && a.y + a.h > b.y - m;
  const props = [], KINDS = {
    lobby: ['plant', 'plant', 'cabinet', 'cooler', 'bench'], mail: ['crate', 'crate', 'cabinet', 'printer', 'crate'], steel: ['cabinet', 'crate', 'cooler', 'vending', 'cabinet'],
    carpet: ['cabinet', 'plant', 'printer', 'cooler', 'cabinet', 'bin'], marble: ['plant', 'plant', 'bench', 'cabinet'], tile: ['vending', 'cooler', 'plant', 'bin', 'cabinet'],
    server: ['rack', 'rack', 'cabinet', 'cooler'], lab: ['cabinet', 'cooler', 'plant', 'crate', 'printer'], vault: ['crate', 'crate', 'cabinet', 'safe'], wood: ['bookcase', 'bookcase', 'plant', 'cabinet'],
    penthouse: ['plant', 'bookcase', 'bench', 'cabinet']
  }, SIZE = { cabinet: [0.62, 1.1], bookcase: [0.6, 1.6], plant: [0.8, 0.8], cooler: [0.6, 0.6], printer: [1.0, 0.8], vending: [0.9, 0.8], crate: [0.9, 0.9], bin: [0.5, 0.5], rack: [0.7, 1.4], safe: [0.9, 0.9], bench: [1.0, 2.0] };
  keys.forEach(k => {                                                                      /* things stood against the walls: never near a door or a elevator */
    const r = P0.rooms[k], kind = r[4] || P0.kind, list = KINDS[kind] || KINDS.carpet, x0 = r[0] * U + 0.34 * U, y0 = r[1] * U + 0.34 * U, x1 = r[2] * U - 0.34 * U, y1 = r[3] * U - 0.34 * U;
    const used = {}, ONE = { cooler: 1, vending: 1, printer: 1, safe: 1, plant: 3, bin: 2, bench: 1, rack: 3 };
    for (let side = 0; side < 4; side++){
      const horiz = side < 2, len = horiz ? x1 - x0 : y1 - y0; let prev = '';
      for (let at = 0.9 * U; at < len - 0.9 * U; at += (1.1 + rnd() * 1.6) * U){
        if (rnd() < 0.3) continue;
        const kk = list[Math.floor(rnd() * list.length)]; if (kk === prev || (ONE[kk] && (used[kk] | 0) >= ONE[kk])) continue; const sz = SIZE[kk], along = (horiz ? sz[1] : sz[0]) * U, depth = (horiz ? sz[0] : sz[1]) * U;
        const w = horiz ? along : depth, h = horiz ? depth : along;
        const bx = horiz ? x0 + at : side === 2 ? x0 : x1 - w, by = horiz ? (side === 0 ? y0 : y1 - h) : y0 + at;
        const b = { x: bx, y: by, w: w, h: h, k: kk, room: k, deco: true };
        if (keep.some(q => hits(b, q, 0)) || boxes.some(q => hits(b, q, 0.35 * U)) || bx + w > x1 + 1 || by + h > y1 + 1) continue;
        boxes.push(b); prev = kk; used[kk] = (used[kk] | 0) + 1; const rc = twReach(walls.concat(boxes), start0.x, start0.y, exit0.x, exit0.y);
        if (!rc.liftOk || rc.lost > base.lost){ boxes.pop(); used[kk]--; prev = ''; }                              /* it would shut something in: leave it out */
      }
    }
    /* clutter on the floor: papers, cups, small boxes, cables, scuffs. Pictures only: nothing solid. */
    const n = Math.round((r[2] - r[0]) * (r[3] - r[1]) / 5), rx0 = r[0] * U + 0.5 * U, ry0 = r[1] * U + 0.5 * U, rw = (r[2] - r[0]) * U - U, rh = (r[3] - r[1]) * U - U;
    for (let i = 0; i < n; i++){ const o = { k: ['papers', 'papers', 'cup', 'boxes', 'cable', 'scuff', 'scuff', 'folder'][Math.floor(rnd() * 8)], x: rx0 + rnd() * rw, y: ry0 + rnd() * rh, a: rnd() * 6.2832, s: 0.7 + rnd() * 0.7, room: k };
      if (!boxes.some(q => o.x > q.x - 20 && o.x < q.x + q.w + 20 && o.y > q.y - 20 && o.y < q.y + q.h + 20)) props.push(o); }
  });
  /* the elevators: a 2 x 2 cell space against the wall of a room (the doors are drawn on that wall) */
  const lift = (spec) => { const r = P0.rooms[spec[0]], side = spec[1], pos = spec[2]; let cx, cy;
    if (side === 's'){ cx = pos; cy = r[3] - 1; } else if (side === 'n'){ cx = pos; cy = r[1] + 1; } else if (side === 'w'){ cx = r[0] + 1; cy = pos; } else { cx = r[2] - 1; cy = pos; }
    return { x: cx * U, y: cy * U, w: 2 * U, h: 2 * U, side: side, room: spec[0], zx: (cx - 1) * U, zy: (cy - 1) * U }; };
  const start = lift(P0.start), exit = lift(P0.lift);
  /* spawn vents: two in the corners of every room, away from the elevators */
  const vents = []; rooms.forEach(r => { [[1.1, 1.1], [r.cx1 - r.cx0 - 1.1, r.cy1 - r.cy0 - 1.1]].forEach(o => { const vx = (r.cx0 + o[0]) * U, vy = (r.cy0 + o[1]) * U;
      if (Math.hypot(vx - start.x, vy - start.y) > 420 && Math.hypot(vx - exit.x, vy - exit.y) > 420) vents.push({ x: vx, y: vy, room: r.id }); }); });
  return { n: n, name: P0.name, kind: P0.kind, boss: !!P0.boss, rooms: rooms, walls: walls, boxes: boxes, props: props, doors: doors, start: start, lift: exit, vents: vents };
}
