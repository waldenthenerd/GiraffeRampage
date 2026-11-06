'use strict';
/* =============================================================================================================================
   44zzzzm-sky-detail.js  --  THE AIR CHASE, DETAIL LAYER (Chapter 17.5). Wraps the sky shooter's drawing (js/sky/44zzzzj-sky-chase.js) and the
   machines (js/sky/44zzzzi-sky-art.js) with their small parts, in the same layers they are drawn in:
     the sea:    whitecaps that rise and fade, sun glints, cloud shadows sliding over everything on the water, gulls low over it, a floating crate or
                 log now and then, and the helicopter's downwash rippling the water under her;
     the things on it: the cargo ship (a foam V wake and the churn of its screw, a bow wave, corrugated containers, the bridge with its wings and
                 windows, a funnel and its smoke, cranes, a lifeboat, its lights), a jagged rock (surf, a wet rim, kelp, gulls on it), a buoy (cage,
                 stripe, number, a glow when its light is on) and the little island (shallows, broken surf, palms with crowns, a hut and a jetty);
     the machines: skids, wing-tip lights and a tail strobe on every helicopter, the mechanic in the town helicopter's cockpit, and a small part
                 more on each drone (lights, antennas, hazard paint, vents, the lab's mark);
     the fighting: tracer trails, brass thrown from her gun, pieces of a drone falling to the sea with a splash, and smoke and sparks from her
                 helicopter when the hull is low.
     more on the water: fishing boats with their nets and gulls, yachts under sail, speedboats, a whale that surfaces and blows, a pod of dolphins.
   The boats and the animals steer: each has a heading and looks ahead, turns away from a rock, an island, a buoy or another boat in its way, and is
   pushed back out if it ever gets inside one (skyMoveSea). Everything fixed scrolls at the water's one speed, and nothing is put down on another.
   The sea's extras are a pure function of the scroll and the clock (nothing is stored for them); the falling pieces live in Sky.dbits.
   Her helicopter has its roof on: she rides inside, well below the rotor, and only her head and neck show, out of the side door she shoots from.
   ============================================================================================================================= */
function skyDHash(i){ const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); }
/* ---- the sea ---- */
function skyDrawSeaExtras(ctx, W, H, s){
  const sc = Sky.scroll, t = Sky.t, c = skySeaCol();
  for (let i = 0; i < 24; i++){                                                              /* whitecaps: a little cluster of foam that rises and fades */
    const x = skyDHash(i + 500) * W, y = ((skyDHash(i + 520) * (H + 120) + sc * 0.95) % (H + 120)) - 60, p = (t * 0.45 + skyDHash(i + 540)) % 1, a = Math.sin(p * Math.PI);
    if (a < 0.05) continue; ctx.fillStyle = 'rgba(240,250,255,' + (0.32 * a).toFixed(3) + ')';
    for (let q = 0; q < 3; q++){ ctx.beginPath(); ctx.ellipse(x + (q - 1) * 6 * s, y + (q % 2) * 2 * s, (4 + q * 2 + a * 4) * s, (1.4 + a) * s, 0, 0, TAU); ctx.fill(); }
  }
  for (let i = 0; i < 26; i++){                                                              /* sun glints: a four-point twinkle */
    const tw = Math.sin(t * 3.2 + i * 7.3); if (tw < 0.82) continue;
    const x = skyDHash(i + 600) * W, y = ((skyDHash(i + 620) * H * 0.8 + sc * 0.9) % (H + 40)) - 20, R = (3 + (tw - 0.82) * 40) * s;
    ctx.strokeStyle = 'rgba(' + c.glint + ',' + ((tw - 0.82) * 3).toFixed(3) + ')'; ctx.lineWidth = 1.4 * s; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(x - R, y); ctx.lineTo(x + R, y); ctx.stroke(); ctx.lineCap = 'butt';
    fillCircle(ctx, x, y, 1.2 * s, 'rgba(255,250,230,' + ((tw - 0.82) * 4).toFixed(3) + ')');
  }
  for (let k = 0; k < 3; k++){                                                               /* a crate or a log drifting by */
    const y = ((k * 733 + sc * 1.0) % (H * 2.6)) - 80, x = W * (0.15 + skyDHash(k + 700 + Math.floor((k * 733 + sc) / (H * 2.6))) * 0.7); if (y < -40 || y > H + 40) continue;
    if (Sky.objs.some(function(o){ return o.k !== 'fog' && Math.hypot(o.x - x, o.y - y) < (skyObjReach(o) + 20) * s; })) continue;     /* never drifting through a rock or a boat */
    ringPath(ctx, x, y, (14 + Math.sin(t * 2 + k) * 2) * s, 1.4 * s, '#E8F6FF', 0.35);
    ctx.save(); ctx.translate(x, y); ctx.rotate(k + t * 0.1); ctx.scale(s, s);
    if (k % 2){ tw_rr(ctx, -9, -9, 18, 18, 2, '#8A6A44'); ctx.strokeStyle = '#5A4228'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(-9, -3); ctx.lineTo(9, -3); ctx.moveTo(-9, 3); ctx.lineTo(9, 3); ctx.moveTo(-9, -9); ctx.lineTo(9, 9); ctx.stroke(); }
    else { tw_rr(ctx, -18, -4, 36, 8, 4, '#6A5034'); fillCircle(ctx, 18, 0, 4, '#8A6E4C'); fillCircle(ctx, 18, 0, 1.6, '#5A4228'); tw_ln(ctx, [-6, -4, -10, -9], 2, '#6A5034'); }
    ctx.restore();
  }
}
function skyDrawGulls(ctx, W, H, s){
  const t = Sky.t, sc = Sky.scroll;
  for (let f = 0; f < 2; f++){                                                               /* two little flocks, gliding the other way, their shadows on the water */
    const per = H * 1.9, base = (f * 911 + sc * 1.25) % per, y = base - 120, x = W * (0.2 + skyDHash(f + 800 + Math.floor((f * 911 + sc * 1.25) / per)) * 0.6) + Math.sin(t * 0.4 + f) * 40 * s;
    if (y < -80 || y > H + 80) continue;
    for (let b = 0; b < 4; b++){ const bx = x + (b - 1.5) * 22 * s + (b % 2) * 6 * s, by = y + Math.abs(b - 1.5) * 16 * s, fl = Math.sin(t * 7 + b * 1.3) * 5 * s;
      ctx.fillStyle = 'rgba(8,16,28,.22)'; ctx.beginPath(); ctx.ellipse(bx + 18 * s, by + 26 * s, 8 * s, 2.4 * s, 0, 0, TAU); ctx.fill();
      ctx.strokeStyle = '#F4F4EE'; ctx.lineWidth = 2.4 * s; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(bx - 9 * s, by - fl); ctx.quadraticCurveTo(bx - 4 * s, by - 3 * s, bx, by); ctx.quadraticCurveTo(bx + 4 * s, by - 3 * s, bx + 9 * s, by - fl); ctx.stroke(); ctx.lineCap = 'butt';
      fillCircle(ctx, bx, by + 1.5 * s, 1.6 * s, '#E8C24A'); }
  }
}
function skyDrawCloudShadows(ctx, W, H, s){
  const sc = Sky.scroll;
  for (let k = 0; k < 3; k++){
    const per = H * 2.2, R = (180 + k * 60) * s, y = ((k * 1013 + sc * 0.7) % per) - R, x = W * (0.2 + skyDHash(k + 900 + Math.floor((k * 1013 + sc * 0.7) / per)) * 0.6);
    if (y < -R || y > H + R) continue;
    const g = ctx.createRadialGradient(x, y, R * 0.1, x, y, R); g.addColorStop(0, 'rgba(6,12,30,.16)'); g.addColorStop(1, 'rgba(6,12,30,0)'); ctx.fillStyle = g;
    ctx.beginPath(); ctx.ellipse(x, y, R * 1.4, R * 0.8, 0.3, 0, TAU); ctx.fill();
  }
}
function skyDrawDownwash(ctx, s){                                                            /* the rotor's wind on the water under her: rings and spray */
  if (!Sky.on || Sky.down > 0) return;
  const x = Sky.x + 26 * s, y = Sky.y + 40 * s, t = Sky.t;
  for (let k = 0; k < 4; k++){ const a = (t * 1.4 + k / 4) % 1; ctx.strokeStyle = 'rgba(235,250,255,' + (0.32 * (1 - a)).toFixed(3) + ')'; ctx.lineWidth = 1.6 * s; ctx.beginPath(); ctx.ellipse(x, y, (40 + a * 70) * s, (22 + a * 40) * s, 0, 0, TAU); ctx.stroke(); }
  for (let k = 0; k < 14; k++){ const a = (t * 1.1 + k / 14) % 1, ang = k * 2.4 + t * 0.3; fillCircle(ctx, x + Math.cos(ang) * (50 + a * 50) * s, y + Math.sin(ang) * (30 + a * 30) * s, (1 + a) * s, 'rgba(240,250,255,' + (0.4 * (1 - a)).toFixed(3) + ')'); }
}
/* ---- the things on the sea ---- */
function skyDrawShip(ctx, o, s){                                                              /* the cargo ship, in its own frame facing +x, scrolling down the screen */
  const t = Sky.t;
  ctx.save(); ctx.translate(o.x, o.y); ctx.rotate(o.h === undefined ? Math.PI / 2 + Math.sin(o.seed) * 0.2 : o.h); ctx.scale(s, s);
  /* the wake: the churn of its screw straight back, and the two foam lines of the V spreading out */
  for (let k = 0; k < 9; k++){ const a = (t * 0.6 + k / 9) % 1, x = -72 - a * 220; fillCircle(ctx, x, Math.sin(k * 3 + t) * 3 * a, (6 + a * 14), 'rgba(240,250,255,' + (0.28 * (1 - a)).toFixed(3) + ')'); }
  for (const sd of [-1, 1]){ ctx.strokeStyle = 'rgba(240,250,255,.32)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-60, sd * 16); ctx.quadraticCurveTo(-140, sd * 28, -250, sd * 66); ctx.stroke();
    ctx.strokeStyle = 'rgba(240,250,255,.14)'; ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(-70, sd * 18); ctx.quadraticCurveTo(-150, sd * 34, -240, sd * 74); ctx.stroke();
    for (let k = 0; k < 5; k++){ const a = (t * 0.8 + k / 5) % 1; fillCircle(ctx, -70 - a * 170, sd * (18 + a * 44), 2 + a * 2, 'rgba(240,250,255,' + (0.4 * (1 - a)).toFixed(3) + ')'); } }
  /* the bow wave, curling off both sides */
  ctx.fillStyle = 'rgba(240,250,255,.6)'; ctx.beginPath(); ctx.moveTo(52, -19); ctx.quadraticCurveTo(92, -8, 90, 0); ctx.quadraticCurveTo(92, 8, 52, 19); ctx.quadraticCurveTo(82, 4, 82, 0); ctx.quadraticCurveTo(82, -4, 52, -19); ctx.fill();
  ctx.fillStyle = 'rgba(6,12,24,.25)'; ctx.beginPath(); ctx.moveTo(-66, -10); ctx.lineTo(60, -10); ctx.quadraticCurveTo(92, 6, 60, 22); ctx.lineTo(-66, 22); ctx.closePath(); ctx.fill();     /* its shadow */
  /* the hull: dark red, a grey deck inside the rail */
  ctx.fillStyle = '#4A1A16'; ctx.beginPath(); ctx.moveTo(-72, -17); ctx.lineTo(56, -17); ctx.quadraticCurveTo(86, 0, 56, 17); ctx.lineTo(-72, 17); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#7A2A22'; ctx.beginPath(); ctx.moveTo(-70, -15); ctx.lineTo(55, -15); ctx.quadraticCurveTo(82, 0, 55, 15); ctx.lineTo(-70, 15); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#5A625C'; ctx.beginPath(); ctx.moveTo(-68, -12); ctx.lineTo(54, -12); ctx.quadraticCurveTo(76, 0, 54, 12); ctx.lineTo(-68, 12); ctx.closePath(); ctx.fill();
  /* the containers, two rows, each with its ridges */
  const cols = ['#C84A3A', '#3A7AB8', '#E8B83A', '#4A8A4A', '#D87A2A', '#8A8A92'];
  for (let k = 0; k < 6; k++) for (let r = 0; r < 2; r++){ const cx = -44 + k * 15, cy = r ? 0.5 : -11.5, cc = cols[(k * 2 + r + Math.floor(o.seed)) % cols.length];
    tw_rect(ctx, cx, cy, 13.5, 11, cc); ctx.strokeStyle = 'rgba(0,0,0,.22)'; ctx.lineWidth = 0.8; ctx.beginPath(); for (let q = 1; q < 5; q++){ ctx.moveTo(cx + q * 2.7, cy + 0.6); ctx.lineTo(cx + q * 2.7, cy + 10.4); } ctx.stroke(); tw_rect(ctx, cx, cy, 13.5, 1.4, 'rgba(255,255,255,.22)'); }
  /* the cranes between the stacks, their booms laid fore and aft */
  for (const cx of [-46, 46]){ fillCircle(ctx, cx, 0, 3.6, '#E8C24A'); tw_ln(ctx, [cx, 0, cx + (cx < 0 ? 18 : -18), 0], 2.4, '#C8A23A'); }
  /* the bridge at the stern: its wings out over the sides, the windows forward, the funnel and its smoke */
  tw_rr(ctx, -68, -11, 16, 22, 2, '#E8E4D8'); tw_rect(ctx, -58, -21, 5, 42, '#D8D4C8'); tw_rect(ctx, -54, -9, 2, 18, '#2A3A54');
  fillCircle(ctx, -57, -20, 1.6, '#FF4A3A'); fillCircle(ctx, -57, 20, 1.6, '#4AE05A');                                                            /* port and starboard lights */
  tw_rr(ctx, -70, -5, 7, 10, 2, '#2A2A2E'); tw_rect(ctx, -70, -5, 7, 3, '#C84A3A');
  for (let k = 0; k < 5; k++){ const a = (t * 0.5 + k / 5) % 1; fillCircle(ctx, -72 - a * 90, Math.sin(a * 4 + k) * 6 + a * 10, 4 + a * 12, 'rgba(70,66,64,' + (0.4 * (1 - a)).toFixed(3) + ')'); }
  tw_rr(ctx, -66, 13, 10, 5, 2, '#E8682A');                                                                                                   /* the lifeboat */
  fillCircle(ctx, 70, 0, 2, '#2A2E30'); fillCircle(ctx, 62, -4, 1.4, '#2A2E30'); fillCircle(ctx, 62, 4, 1.4, '#2A2E30');                         /* the windlass and its bitts at the bow */
  fillCircle(ctx, 50, 0, 1.8, Math.sin(t * 3 + o.seed) > 0 ? '#FFF4C8' : '#8A8470');                                                             /* the masthead light */
  if (Sky.wave >= 6){ csGlow(ctx, -60, 0, 26, '#FFE0A0', 0.3); csGlow(ctx, 50, 0, 14, '#FFF4C8', 0.35); }                                       /* lit up as it gets dark */
  ctx.restore();
}
function skyDrawRock(ctx, o, s){
  const x = o.x, y = o.y, t = Sky.t, R = o.r * s, n = 9, pts = [];
  for (let i = 0; i < n; i++){ const a = o.a + i * TAU / n, rr = R * (0.62 + skyDHash(o.seed * 10 + i) * 0.38); pts.push([Math.cos(a) * rr, Math.sin(a) * rr * 0.75]); }
  const shape = (k, dx, dy) => { ctx.beginPath(); pts.forEach(function(p, i){ const px = x + dx + p[0] * k, py = y + dy + p[1] * k; if (i) ctx.lineTo(px, py); else ctx.moveTo(px, py); }); ctx.closePath(); };
  for (let q = 0; q < 2; q++){ const a = (t * 0.5 + q * 0.5 + o.seed) % 1; ctx.strokeStyle = 'rgba(240,250,255,' + (0.4 * (1 - a)).toFixed(3) + ')'; ctx.lineWidth = 1.6 * s; shape(1.15 + a * 0.5, 0, 0); ctx.stroke(); }     /* surf rings */
  ctx.fillStyle = 'rgba(240,250,255,.45)'; shape(1.18 + Math.sin(t * 2 + o.seed) * 0.04, 0, 0); ctx.fill();                                        /* the foam round it */
  for (let k = 0; k < 4; k++){ const a = o.a + k * 1.7, kx = x + Math.cos(a) * R * 1.4, ky = y + Math.sin(a) * R; ctx.strokeStyle = 'rgba(40,80,50,.7)'; ctx.lineWidth = 2 * s; ctx.beginPath(); ctx.moveTo(kx, ky);    /* kelp, swaying */
    ctx.quadraticCurveTo(kx + Math.sin(t + k) * 8 * s, ky + 10 * s, kx + Math.sin(t * 0.8 + k) * 4 * s, ky + 20 * s); ctx.stroke(); }
  ctx.fillStyle = '#2A2A2E'; shape(1.04, 0, 0); ctx.fill();                                                                                   /* the wet rim */
  ctx.fillStyle = '#4A4A50'; shape(0.94, 0, 0); ctx.fill();
  ctx.fillStyle = '#6A6A70'; shape(0.6, -R * 0.12, -R * 0.12); ctx.fill(); ctx.fillStyle = '#7E7E84'; shape(0.3, -R * 0.2, -R * 0.2); ctx.fill();          /* the sunlit top */
  for (let k = 0; k < 6; k++) fillCircle(ctx, x + (skyDHash(o.seed + k) - 0.5) * R * 0.9, y + (skyDHash(o.seed + k + 9) - 0.5) * R * 0.6, 1.4 * s, 'rgba(240,240,230,.8)');   /* what the gulls leave */
  for (let k = 0; k < 2; k++){ const gx = x + (k ? 0.2 : -0.25) * R, gy = y - 0.1 * R + k * 4 * s; fillCircle(ctx, gx, gy, 3 * s, '#F4F4EE'); fillCircle(ctx, gx + 2.6 * s, gy, 1.4 * s, '#F4F4EE'); fillCircle(ctx, gx + 3.6 * s, gy, 0.8 * s, '#E8C24A'); }
}
function skyDrawBuoy(ctx, o, s){
  const x = o.x, y = o.y, t = Sky.t, on = Math.sin(t * 3 + o.seed) > 0;
  ctx.fillStyle = 'rgba(240,250,255,.35)'; ctx.beginPath(); ctx.ellipse(x, y + 1 * s, 13 * s, 10 * s, 0, 0, TAU); ctx.fill();
  ringPath(ctx, x, y, 11 * s + Math.sin(t * 2 + o.seed) * 2 * s, 1.5 * s, '#E8F6FF', 0.5);
  ctx.fillStyle = 'rgba(6,12,24,.3)'; ctx.beginPath(); ctx.ellipse(x + 4 * s, y + 6 * s, 8 * s, 4 * s, 0, 0, TAU); ctx.fill();
  fillCircle(ctx, x, y, 8 * s, '#A83A22'); fillCircle(ctx, x, y, 7 * s, '#E84A2A'); ctx.strokeStyle = '#F4F4EE'; ctx.lineWidth = 2.4 * s; ctx.beginPath(); ctx.arc(x, y, 4.6 * s, 0, TAU); ctx.stroke();
  ctx.strokeStyle = '#2A2E30'; ctx.lineWidth = 1.4 * s; ctx.beginPath(); ctx.moveTo(x - 5 * s, y); ctx.lineTo(x + 5 * s, y); ctx.moveTo(x, y - 5 * s); ctx.lineTo(x, y + 5 * s); ctx.stroke();      /* the cage on top */
  if (on){ const g = ctx.createRadialGradient(x, y, 0, x, y, 22 * s); g.addColorStop(0, 'rgba(255,240,160,.5)'); g.addColorStop(1, 'rgba(255,240,160,0)'); ctx.fillStyle = g; ctx.fillRect(x - 22 * s, y - 22 * s, 44 * s, 44 * s); }
  fillCircle(ctx, x, y, 2.4 * s, on ? '#FFF0A0' : '#7A2A1A');
  if (s > 0.7) miniText(ctx, String(1 + Math.floor(o.seed) % 9), x + 11 * s, y - 8 * s, 9 * s, '#F4F4EE');
}
function skyDrawIsle(ctx, o, s){
  const x = o.x, y = o.y, t = Sky.t, r = o.r * 1.6 * s, a = o.a;
  const sh = ctx.createRadialGradient(x, y, r * 0.6, x, y, r * 1.5); sh.addColorStop(0, 'rgba(90,210,200,.55)'); sh.addColorStop(1, 'rgba(90,210,200,0)'); ctx.fillStyle = sh;       /* the shallows */
  ctx.beginPath(); ctx.ellipse(x, y, r * 1.5, r * 1.15, a, 0, TAU); ctx.fill();
  ctx.save(); ctx.translate(x, y); ctx.rotate(a);
  ctx.strokeStyle = 'rgba(245,252,255,.7)'; ctx.lineWidth = 2.4 * s; ctx.setLineDash([14 * s, 8 * s]); ctx.lineDashOffset = -t * 10 * s; ctx.beginPath(); ctx.ellipse(0, 0, r * 1.1, r * 0.8, 0, 0, TAU); ctx.stroke(); ctx.setLineDash([]);   /* broken surf */
  ctx.fillStyle = '#C8B47E'; ctx.beginPath(); ctx.ellipse(0, 0, r * 1.02, r * 0.72, 0, 0, TAU); ctx.fill();                                     /* the wet sand at the edge */
  ctx.fillStyle = '#E8D6A2'; ctx.beginPath(); ctx.ellipse(0, 0, r * 0.96, r * 0.67, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = '#3A6A3A'; ctx.beginPath(); ctx.ellipse(r * 0.05, -r * 0.02, r * 0.66, r * 0.42, 0, 0, TAU); ctx.fill();
  for (let k = 0; k < 5; k++) fillCircle(ctx, (skyDHash(o.seed + k) - 0.5) * r * 1.0, (skyDHash(o.seed + k + 5) - 0.5) * r * 0.5, r * 0.12, '#2E5A30');      /* the trees under the palms */
  tw_ln(ctx, [r * 0.7, r * 0.3, r * 1.25, r * 0.52], 4 * s, '#7A5A3A');                                                                        /* the jetty, and the boat tied to it */
  for (let k = 0; k < 4; k++) tw_ln(ctx, [r * (0.78 + k * 0.13) - 3 * s, r * (0.34 + k * 0.055) + 4 * s, r * (0.78 + k * 0.13) + 3 * s, r * (0.34 + k * 0.055) - 4 * s], 1.2 * s, '#5A4228');
  ctx.save(); ctx.translate(r * 1.18, r * 0.66); ctx.rotate(0.4 + Math.sin(t * 1.3) * 0.05); tw_rr(ctx, -9 * s, -4 * s, 18 * s, 8 * s, 4 * s, '#F4F4EE'); tw_rect(ctx, -6 * s, -2 * s, 8 * s, 4 * s, '#3A7AB8'); ctx.restore();
  tw_rect(ctx, -r * 0.5, r * 0.08, r * 0.24, r * 0.2, '#8A6A44'); tw_poly(ctx, [-r * 0.54, r * 0.08, -r * 0.38, -r * 0.04, -r * 0.22, r * 0.08], '#A88A54');   /* a hut */
  for (let k = 0; k < 3; k++){ const px = Math.cos(o.seed + k * 2) * r * 0.36, py = Math.sin(o.seed + k * 2) * r * 0.22;                             /* palms: a crown of fronds round a trunk top */
    fillCircle(ctx, px + 4 * s, py + 5 * s, 9 * s, 'rgba(10,30,10,.3)');
    for (let q = 0; q < 6; q++){ const fa = q * TAU / 6 + o.seed + Math.sin(t * 1.2 + k) * 0.06; ctx.fillStyle = q % 2 ? '#3A7A3A' : '#2A6A2E'; ctx.beginPath(); ctx.ellipse(px + Math.cos(fa) * 7 * s, py + Math.sin(fa) * 7 * s, 8 * s, 2.6 * s, fa, 0, TAU); ctx.fill(); }
    fillCircle(ctx, px, py, 2.4 * s, '#6A4A2A'); fillCircle(ctx, px + 1.6 * s, py + 1.2 * s, 1.4 * s, '#4A3A22'); }
  ctx.restore();
}
/* ---- what is on the sea, and the boats and animals that move on it ----
   Everything fixed (rocks, islands, buoys) scrolls with the water at one speed, so none of them can drift into another. Boats and animals have their
   own heading and speed on the water, look ahead, and turn away from whatever is in front of them (a rock, an island, a buoy, another boat); if one ever
   gets too close anyway it is pushed back out. Nothing new is put down on top of something already there. */
const SKY_MOVERS = { ship: { spd: 30, core: 74, turn: 0.7 }, trawler: { spd: 22, core: 48, turn: 0.9 }, sail: { spd: 28, core: 34, turn: 1.1 }, speed: { spd: 120, core: 32, turn: 1.8 },
  whale: { spd: 18, core: 52, turn: 0.6 }, dolphins: { spd: 70, core: 40, turn: 1.4 } };
function skyObjCore(o){ const m = SKY_MOVERS[o.k]; return m ? m.core : o.k === 'isle' ? o.r * 1.75 : o.k === 'rock' ? o.r * 1.1 : o.k === 'buoy' ? 16 : 0; }
function skyObjReach(o){ return o.k === 'fog' ? 0 : skyObjCore(o) + (o.k === 'ship' ? 70 : SKY_MOVERS[o.k] ? 30 : 12); }
function skyObjsClash(a, b, s){ return a !== b && a.k !== 'fog' && b.k !== 'fog' && Math.hypot(a.x - b.x, a.y - b.y) < (skyObjReach(a) + skyObjReach(b)) * s; }
const SKY_SEA_KINDS = [['ship', 0.11], ['trawler', 0.09], ['sail', 0.1], ['speed', 0.06], ['rock', 0.19], ['buoy', 0.13], ['isle', 0.1], ['whale', 0.05], ['dolphins', 0.06], ['fog', 0.11]];
const skySeaObjBase = skySeaObj;
skySeaObj = function(){
  const r = skySeaObjBase.apply(this, arguments), o = Sky.objs[Sky.objs.length - 1], s = skyS();
  if (!o) return r;
  let q = Math.random(); for (let i = 0; i < SKY_SEA_KINDS.length; i++){ q -= SKY_SEA_KINDS[i][1]; if (q <= 0 || i === SKY_SEA_KINDS.length - 1){ o.k = SKY_SEA_KINDS[i][0]; break; } }
  if (o.k === 'fog') return r;
  o.v = 1;                                                                                    /* the sea moves as one */
  const m = SKY_MOVERS[o.k];
  if (m){ const across = Math.random() < 0.5; o.h = across ? (Math.random() < 0.5 ? 0 : Math.PI) + (Math.random() - 0.5) * 0.6 : (Math.random() < 0.6 ? Math.PI / 2 : -Math.PI / 2) + (Math.random() - 0.5) * 0.5; o.want = o.h; o.spd = m.spd * (0.8 + Math.random() * 0.4); o.ph = Math.random() * 20; }
  for (let i = 0; i < 16 && Sky.objs.some(function(p){ return skyObjsClash(p, o, s); }); i++){ o.x = Math.random() * G.W; if (i > 7) o.y -= 120 * s; }
  if (Sky.objs.some(function(p){ return skyObjsClash(p, o, s); })) Sky.objs.pop();          /* no room: leave it out this time */
  return r;
};
/* each boat or animal: steer toward where it wants to go unless something is ahead; then turn away from it, the nearer the harder */
function skyMoveSea(dt){
  const s = skyS();
  for (let i = Sky.objs.length - 1; i >= 0; i--){
    const o = Sky.objs[i], m = SKY_MOVERS[o.k]; if (!m) continue;
    const hx = Math.cos(o.h), hy = Math.sin(o.h), look = (140 + o.spd * 1.4) * s; let turn = 0, slow = 1;
    Sky.objs.forEach(function(p){
      if (p === o || p.k === 'fog') return;
      const dx = p.x - o.x, dy = p.y - o.y, d = Math.hypot(dx, dy), room = (skyObjCore(p) + m.core) * s;
      const ahead = dx * hx + dy * hy, side = -dx * hy + dy * hx;                             /* where p is: how far in front, and to which side */
      if (ahead > -room * 0.3 && ahead < look + room && Math.abs(side) < room * 1.25){ const k = 1 - Math.max(0, ahead) / (look + room); turn += (side > 0 ? -1 : 1) * (0.6 + k * 2.4); if (d < room * 1.6) slow = Math.min(slow, 0.5); }
    });
    if (!turn){ let w = o.want - o.h; while (w > Math.PI) w -= TAU; while (w < -Math.PI) w += TAU; turn = clamp(w, -0.4, 0.4); }
    o.h += clamp(turn, -1, 1) * m.turn * dt;
    o.x += Math.cos(o.h) * o.spd * slow * s * dt; o.y += Math.sin(o.h) * o.spd * slow * s * dt; o.ph += dt;
    Sky.objs.forEach(function(p){                                                            /* never inside anything: pushed back out along the line between them */
      if (p === o || p.k === 'fog') return; const dx = o.x - p.x, dy = o.y - p.y, d = Math.hypot(dx, dy) || 1, room = (skyObjCore(p) + m.core) * s;
      if (d < room){ const push = room - d; if (SKY_MOVERS[p.k]){ o.x += dx / d * push / 2; o.y += dy / d * push / 2; p.x -= dx / d * push / 2; p.y -= dy / d * push / 2; } else { o.x += dx / d * push; o.y += dy / d * push; } }
    });
    if (o.y < -500 * s || o.x < -400 * s || o.x > G.W + 400 * s) Sky.objs.splice(i, 1);
  }
}
/* ---- the machines ---- */
const skyHeliTopBase = skyHeliTop;
skyHeliTop = function(ctx, r, pal, o){
  o = o || {}; const L = r * 1.1, Wd = r * 0.46, t = (typeof Sky !== 'undefined' && Sky.t) || 0;
  ctx.strokeStyle = pal.ink; ctx.lineWidth = Math.max(1.4, Wd * 0.12); ctx.lineCap = 'round'; ctx.beginPath();                                       /* the skids, out past the body, and their cross tubes */
  for (const sd of [-1, 1]){ ctx.moveTo(-L * 0.5, sd * Wd * 1.12); ctx.lineTo(L * 0.5, sd * Wd * 1.12); ctx.moveTo(L * 0.5, sd * Wd * 1.12); ctx.lineTo(L * 0.6, sd * Wd * 1.0); }
  ctx.moveTo(-L * 0.3, -Wd * 1.12); ctx.lineTo(-L * 0.3, Wd * 1.12); ctx.moveTo(L * 0.3, -Wd * 1.12); ctx.lineTo(L * 0.3, Wd * 1.12); ctx.stroke(); ctx.lineCap = 'butt';
  skyHeliTopBase.apply(this, arguments);
  fillCircle(ctx, -L * 0.04, -Wd * 1.55, Math.max(1.2, Wd * 0.1), '#FF4A3A'); fillCircle(ctx, -L * 0.04, Wd * 1.55, Math.max(1.2, Wd * 0.1), '#4AE05A');   /* the wing-tip lights */
  if (Math.sin(t * 9 + r) > 0.6) fillCircle(ctx, -L * 1.56, 0, Math.max(1.4, Wd * 0.13), '#FFFFFF');                                               /* the tail strobe */
  ctx.fillStyle = '#1A1E20'; for (const sd of [-1, 1]) ctx.fillRect(-L * 0.42, sd * Wd * 0.42 - Wd * 0.08, L * 0.1, Wd * 0.16);                  /* the exhausts */
  if (pal === SKY_PAL.town){                                                                                                                  /* the mechanic in the cockpit, under the glass: red cap, headset */
    fillCircle(ctx, L * 0.5, Wd * 0.2, Wd * 0.2, '#2E4A7A'); fillCircle(ctx, L * 0.52, Wd * 0.2, Wd * 0.14, '#C8402A');
    ctx.strokeStyle = '#1A1E22'; ctx.lineWidth = Math.max(1, Wd * 0.05); ctx.beginPath(); ctx.arc(L * 0.52, Wd * 0.2, Wd * 0.15, Math.PI * 0.5, Math.PI * 1.5, true); ctx.stroke();
  }
  if (pal === SKY_PAL.white){ for (let k = 0; k < 3; k++) fillCircle(ctx, -L * 0.3 + k * L * 0.16, -Wd * 0.62, Wd * 0.1, '#6AA8BC'); }               /* LAB-1's cabin windows */
  if (pal === SKY_PAL.grey || pal === SKY_PAL.greyB){ for (const sd of [-1, 1]) for (let k = 0; k < 3; k++) fillCircle(ctx, L * 0.22, sd * Wd * (1.32 + k * 0.1), Wd * 0.05, '#E8C24A');   /* rocket noses */
    tw_rect(ctx, -L * 0.26, Wd * 0.62, L * 0.36, Wd * 0.3, '#14181A'); fillCircle(ctx, -L * 0.08, Wd * 0.8, Wd * 0.17, '#4A5A3A'); fillCircle(ctx, -L * 0.06, Wd * 0.78, Wd * 0.08, '#6A7A5A');   /* the hired gunner in the open door, helmet on */
    tw_ln(ctx, [-L * 0.04, Wd * 0.86, -L * 0.04, Wd * 1.3], Math.max(1.4, Wd * 0.08), '#1A1E20'); }
};
/* her head and neck out of a side door (sd -1 the left door, 1 the right), out by k (0 inside, 1 right out), in the helicopter's frame facing +x.
   She rides inside under the roof, well below the rotor: only her head shows, and only at a door she is shooting from. */
function skyDoorHead(ctx, r, sd, k){
  if (k <= 0.02) return;
  const L = r * 1.1, Wd = r * 0.46, cl = giraffeColours(), pat = giraffePattern(), hat = accEquipped('hat'), z = r / 62 * 0.78, nl = 20 * k;
  ctx.save(); ctx.translate(-L * 0.2, sd * Wd * 0.72); ctx.rotate(sd * Math.PI / 2 - sd * 0.18); ctx.scale(z, z);
  ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.beginPath(); ctx.ellipse(nl + 6, 4, 12, 7, 0, 0, TAU); ctx.fill();                                     /* her shadow on the side of the helicopter */
  ctx.fillStyle = cl.coat; ctx.beginPath(); ctx.moveTo(-4, -6); ctx.lineTo(nl, -5); ctx.lineTo(nl, 5); ctx.lineTo(-4, 6); ctx.closePath(); ctx.fill();
  ctx.fillStyle = cl.spot; for (let q = 1; q <= 2; q++) wardSpot(ctx, pat, nl * q / 3, q % 2 ? 2 : -2, 2.6, 2.2, 0);
  ctx.translate(nl, 0);
  ctx.fillStyle = cl.coat; ctx.beginPath(); ctx.ellipse(2, 0, 11, 7.6, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = cl.dark; ctx.beginPath(); ctx.ellipse(10, 0, 5.4, 4.4, 0, 0, TAU); ctx.fill();
  ctx.strokeStyle = cl.dark; ctx.lineWidth = 2.6; ctx.beginPath(); ctx.moveTo(-3, -4.6); ctx.lineTo(-6, -8.6); ctx.moveTo(-3, 4.6); ctx.lineTo(-6, 8.6); ctx.stroke();
  ctx.fillStyle = '#4A2E12'; ctx.beginPath(); ctx.arc(-6.4, -9, 2.3, 0, TAU); ctx.arc(-6.4, 9, 2.3, 0, TAU); ctx.fill();
  if (hat && hat.id !== 'bag') drawHatOnHeadTop(ctx, hat.id, G.time);
  ctx.fillStyle = '#FFF'; ctx.beginPath(); ctx.arc(1, -5.4, 2.2, 0, TAU); ctx.arc(1, 5.4, 2.2, 0, TAU); ctx.fill();
  ctx.fillStyle = '#20140C'; ctx.beginPath(); ctx.arc(2.2, -5.4, 1.2, 0, TAU); ctx.arc(2.2, 5.4, 1.2, 0, TAU); ctx.fill();
  if (hat && hat.id === 'bag') drawHatOnHeadTop(ctx, hat.id, G.time);
  ctx.restore();
}
/* a side door slid back on the closed cabin: the dark doorway and the panel moved toward the tail */
function skyOpenDoor(ctx, r, sd, pal){
  const L = r * 1.1, Wd = r * 0.46, y0 = sd > 0 ? Wd * 0.62 : -Wd * 0.9;
  tw_rect(ctx, -L * 0.3, y0, L * 0.4, Wd * 0.28, '#14181A'); tw_rect(ctx, -L * 0.3, y0 + (sd > 0 ? 0 : Wd * 0.2), L * 0.4, Wd * 0.08, 'rgba(255,170,110,.35)');
  tw_rect(ctx, -L * 0.62, y0 - sd * Wd * 0.04, L * 0.32, Wd * 0.32, pal.gd); tw_rect(ctx, -L * 0.56, y0 + Wd * 0.08 - sd * Wd * 0.04, L * 0.14, Wd * 0.14, '#5A7A86');
}
/* the town helicopter in play: the roof on, the doors open on the side she is at, her head out of it, the door guns, the rotor over it all */
skyDrawHeli = function(ctx){
  const s = skyS(), x = Sky.x, y = Sky.y, r = 62 * s;
  ctx.fillStyle = 'rgba(8,16,28,.3)'; ctx.beginPath(); ctx.ellipse(x + 26 * s, y + 40 * s, r * 0.9, r * 0.5, 0, 0, TAU); ctx.fill();          /* the shadow on the sea */
  const flick = Sky.inv > 0 && Math.floor(Sky.t * 16) % 2;
  ctx.save(); ctx.translate(x, y); ctx.rotate(-Math.PI / 2 + (Sky.down > 0 ? (1.8 - Sky.down) * 2 : 0));
  if (flick) ctx.globalAlpha = 0.6;
  skyHeliTop(ctx, r, SKY_PAL.town, { gun: true, noRotor: true });
  const k = Sky.sw > 0 && Sky.swMax ? 1 - Sky.sw / Sky.swMax : 1, out = function(g){ return (Sky.from === g && Sky.gun !== g ? 1 - k : 0) + (Sky.gun === g ? k : 0); };
  [['left', -1], ['right', 1]].forEach(function(d){ const o = out(d[0]); if (o > 0.02) skyOpenDoor(ctx, r, d[1], SKY_PAL.town); });
  for (const sd of [-1, 1]){ ctx.fillStyle = '#2A3034'; ctx.fillRect(-r * 0.12, sd * r * 0.5 - (sd > 0 ? 0 : r * 0.08), r * 0.18, r * 0.08); }    /* the door guns on their mounts */
  skyDoorHead(ctx, r, -1, out('left')); skyDoorHead(ctx, r, 1, out('right'));
  ctx.globalAlpha = 0.45; skyRotor(ctx, -r * 0.05, 0, r * 1.3, Sky.t * 26, 4, false, true); ctx.globalAlpha = 1;
  ctx.restore();
};
/* each drone: one small part more */
(function(){
  const add = function(k, fn){ const b = SKY_DRAW[k]; SKY_DRAW[k] = function(ctx, e){ b.apply(this, arguments); try { fn(ctx, e, e.r, (e.anim || 0)); } catch (err) {} }; };
  add('sk_rotor', function(ctx, e, r, an){ tw_ln(ctx, [-r * 0.4, -r * 0.16, -r * 0.7, -r * 0.3], 1.2, '#2A3034'); tw_ln(ctx, [-r * 0.4, r * 0.16, -r * 0.7, r * 0.3], 1.2, '#2A3034');      /* antennas */
    fillCircle(ctx, -r * 0.7, -r * 0.3, 1.4, '#FF4A3A'); fillCircle(ctx, -r * 0.7, r * 0.3, 1.4, Math.sin(an * 3) > 0 ? '#4AE05A' : '#1A3A1E'); });
  add('sk_net', function(ctx, e, r, an){ ringPath(ctx, -r * 0.24, 0, r * 0.18, 1.2, SKY_LAB, 0.8); tw_ln(ctx, [r * 0.72, -r * 0.3, r * 0.72, r * 0.3], 1.6, '#6A5A3A'); });
  add('sk_mine', function(ctx, e, r, an){ ctx.strokeStyle = '#1A1A1E'; ctx.lineWidth = Math.max(1, r * 0.08); for (let k = 0; k < 6; k++){ const a = k * TAU / 6 + 0.26; ctx.beginPath(); ctx.arc(0, 0, r * 0.52, a, a + 0.24); ctx.stroke(); } });
  add('sk_laser', function(ctx, e, r, an){ for (let k = 0; k < 3; k++) tw_ln(ctx, [-r * 0.46 + k * r * 0.1, -r * 0.2, -r * 0.46 + k * r * 0.1, r * 0.2], 1, '#3A4248');                /* cooling fins */
    if ((e.charge || 0) > 0){ const g = ctx.createRadialGradient(r * 0.55, 0, 0, r * 0.55, 0, r * 0.7); g.addColorStop(0, 'rgba(255,120,90,.6)'); g.addColorStop(1, 'rgba(255,120,90,0)'); ctx.fillStyle = g; ctx.fillRect(-r * 0.2, -r * 0.8, r * 1.5, r * 1.6); } });
  add('sk_carrier', function(ctx, e, r, an){ for (let k = 0; k < 7; k++) tw_rect(ctx, -r * 0.56 + k * r * 0.16, -r * 0.42, r * 0.08, r * 0.06, k % 2 ? '#1A1A1E' : '#E8C24A');
    for (let k = 0; k < 7; k++) tw_rect(ctx, -r * 0.56 + k * r * 0.16, r * 0.36, r * 0.08, r * 0.06, k % 2 ? '#1A1A1E' : '#E8C24A'); });
})();
/* ---- the fighting ---- */
const skyDrawShotsBase = skyDrawShots;
skyDrawShots = function(ctx){
  const s = skyS();
  ctx.lineCap = 'round';
  Sky.shots.forEach(function(b){ ctx.strokeStyle = 'rgba(255,214,130,.3)'; ctx.lineWidth = 3 * s; ctx.beginPath(); ctx.moveTo(b.x, b.y); ctx.lineTo(b.x - b.vx * 0.04, b.y - b.vy * 0.04); ctx.stroke(); });       /* tracer trails */
  Sky.eb.forEach(function(b){ if (b.net) return; ctx.strokeStyle = 'rgba(255,110,80,.25)'; ctx.lineWidth = b.r * 1.2; ctx.beginPath(); ctx.moveTo(b.x, b.y); ctx.lineTo(b.x - b.vx * 0.06, b.y - b.vy * 0.06); ctx.stroke(); });
  ctx.lineCap = 'butt';
  skyDrawShotsBase.apply(this, arguments);
};
function skyBit(o){ if (!Sky.dbits) Sky.dbits = []; if (Sky.dbits.length < 140) Sky.dbits.push(Object.assign({ t: 0, a: Math.random() * TAU, va: (Math.random() - 0.5) * 18 }, o)); }
const skyFireBase = skyFire;
skyFire = function(){
  const g = Sky.gun, s = skyS(), mz = skyMuzzle(g);
  skyFireBase.apply(this, arguments);
  const ex = g === 'nose' ? Sky.x + 8 * s : Sky.x + (g === 'left' ? -20 : 20) * s, ey = g === 'nose' ? Sky.y - 24 * s : Sky.y + 10 * s;              /* the brass, thrown out of the gun and falling away to the sea */
  skyBit({ k: 'brass', x: ex, y: ey, vx: (g === 'nose' ? 90 : -mz.dx * 40) * s * (0.6 + Math.random() * 0.8), vy: (40 + Math.random() * 60) * s, life: 0.7, sz: 1 });
};
const skyKillBase = skyKill;
skyKill = function(e, by){
  const was = e.dead; skyKillBase.apply(this, arguments);
  if (was || !e.dead || e.k === 'white' || e.k === 'mine') return;
  const s = skyS(), n = e.k === 'gunship' || e.k === 'grey' ? 9 : e.k === 'carrier' ? 7 : 4;
  for (let i = 0; i < n; i++){ const a = Math.random() * TAU, v = (60 + Math.random() * 140) * s;
    skyBit({ k: i === 0 ? 'blade' : 'frag', x: e.x, y: e.y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: 0.9 + Math.random() * 0.6, sz: (e.r / (22 * s)) * (0.6 + Math.random() * 0.6), col: i % 2 ? (e.def && e.def.dark) || '#2A3034' : (e.def && e.def.color) || '#8A9298' }); }
};
const skyStartBase = skyStart;
skyStart = function(){ const r = skyStartBase.apply(this, arguments); Sky.dbits = []; return r; };
const skyStepBase = skyStep;
skyStep = function(dt){
  const r = skyStepBase.apply(this, arguments);
  if (Sky.hold || !Sky.dbits) return r;
  dt = Math.min(dt, 0.05); const s = skyS();
  if (!Sky.down) skyMoveSea(dt);
  Sky.en.forEach(function(e){
    if (e.dead || e.fall > 0) return;
    if (!e.boss && e.hp < e.maxHp * 0.5 && e.r > 20 * s && Math.random() < dt * 5) skyBurst(e.x, e.y, 1, 'rgba(50,46,44,.6)', 20, { smoke: true, life: 0.9, r: 4 });   /* a hurt machine trails smoke */
    if (e.k === 'white' && (e.phase | 0) >= 2 && Math.random() < dt * (e.ditch > 0 ? 14 : 4)) skyBit({ k: 'paper', x: e.x + (Math.random() - 0.5) * e.r * 0.6, y: e.y, vx: (Math.random() - 0.5) * 80 * s, vy: (20 + Math.random() * 60) * s, va: (Math.random() - 0.5) * 6, life: 1.6 + Math.random(), sz: 1 });   /* pages from LAB-1's notes, blowing out */
  });
  for (let i = Sky.dbits.length - 1; i >= 0; i--){ const b = Sky.dbits[i]; b.t += dt; b.x += b.vx * dt; b.y += b.vy * dt + SKY_TUNE.scroll * s * dt * 0.5; b.vx *= 1 - dt * 1.6; b.vy *= 1 - dt * 1.6; b.a += b.va * dt;
    if (b.t >= b.life){ if (b.k !== 'brass' && Sky.fx.length < 260) Sky.fx.push({ ring: true, x: b.x, y: b.y, R: 8 * s * b.sz, t: 0, life: 0.6, col: '235,250,255', thin: true }); Sky.dbits.splice(i, 1); } }
  if (Sky.on && !Sky.down && Sky.hull < Sky.max * 0.35 && Math.random() < dt * (Sky.hull < Sky.max * 0.15 ? 14 : 6)){                              /* a hurt helicopter: smoke from the engine, now and then a spark */
    skyBurst(Sky.x - 12 * s, Sky.y + 30 * s, 1, 'rgba(40,36,34,.85)', 40, { smoke: true, life: 1.3, r: 10 });
    if (Math.random() < 0.3) skyBurst(Sky.x - 12 * s, Sky.y + 30 * s, 2, '#FFC870', 90, { life: 0.3, r: 2 });
  }
  return r;
};
const skyDrawFxBase = skyDrawFx;
skyDrawFx = function(ctx){
  const s = skyS();
  (Sky.dbits || []).forEach(function(b){ const u = b.t / b.life, k = 1 - u * 0.6;                                                              /* the falling pieces get smaller as they drop toward the sea */
    ctx.save(); ctx.translate(b.x, b.y); ctx.rotate(b.a); ctx.scale(s * k, s * k); ctx.globalAlpha = Math.min(1, (1 - u) * 2);
    if (b.k === 'brass'){ ctx.fillStyle = '#E8B848'; ctx.fillRect(-2.4, -1, 4.8, 2); }
    else if (b.k === 'paper'){ ctx.scale(Math.cos(b.t * 9) * 0.8 + 0.2, 1); ctx.fillStyle = '#F8F8F0'; ctx.fillRect(-5, -6.5, 10, 13); ctx.fillStyle = 'rgba(60,70,80,.5)'; for (let q = 0; q < 4; q++) ctx.fillRect(-3.5, -4.5 + q * 3, 7 - (q % 2) * 2, 1); }
    else if (b.k === 'blade'){ ctx.fillStyle = '#2A3034'; ctx.fillRect(-9 * b.sz, -1.4 * b.sz, 18 * b.sz, 2.8 * b.sz); }
    else { ctx.fillStyle = b.col; ctx.beginPath(); ctx.moveTo(-4 * b.sz, -3 * b.sz); ctx.lineTo(4 * b.sz, -2 * b.sz); ctx.lineTo(2 * b.sz, 3 * b.sz); ctx.lineTo(-3 * b.sz, 2 * b.sz); ctx.closePath(); ctx.fill(); }
    ctx.restore(); });
  ctx.globalAlpha = 1;
  const r = skyDrawFxBase.apply(this, arguments);
  const W = G.W, H = G.H, sc = Sky.scroll;                                                    /* thin wisps of cloud whipping past, between her and the sky above */
  for (let k = 0; k < 2; k++){ const per = H * 3.4, y = ((k * 1777 + sc * 2.2) % per) - 200 * s, x = W * (0.25 + skyDHash(k + 990 + Math.floor((k * 1777 + sc * 2.2) / per)) * 0.5); if (y < -200 * s || y > H + 200 * s) continue;
    for (let q = 0; q < 3; q++){ ctx.fillStyle = 'rgba(250,246,240,' + (0.07 + q * 0.02).toFixed(3) + ')'; ctx.beginPath(); ctx.ellipse(x + (q - 1) * 60 * s, y + q * 30 * s, (220 - q * 50) * s, (26 - q * 6) * s, -0.25, 0, TAU); ctx.fill(); } }
  return r;
};
/* ---- the sea and the things on it, in order: water and crests, foam and glints and drifting crates, ships rocks buoys islands, gulls, cloud shadows, her downwash ---- */
const skyDrawObjBase = skyDrawObj;
skyDrawObj = function(ctx, o, s){
  if (o.k === 'ship') return skyDrawShip(ctx, o, s);
  if (o.k === 'rock') return skyDrawRock(ctx, o, s);
  if (o.k === 'buoy') return skyDrawBuoy(ctx, o, s);
  if (o.k === 'isle') return skyDrawIsle(ctx, o, s);
  if (o.k === 'trawler') return skyDrawTrawler(ctx, o, s);
  if (o.k === 'sail') return skyDrawSail(ctx, o, s);
  if (o.k === 'speed') return skyDrawSpeed(ctx, o, s);
  if (o.k === 'whale') return skyDrawWhale(ctx, o, s);
  if (o.k === 'dolphins') return skyDrawDolphins(ctx, o, s);
  return skyDrawObjBase.apply(this, arguments);
};
const skyDrawSeaBase = skyDrawSea;
skyDrawSea = function(ctx, W, H){
  const objs = Sky.objs, s = skyS();
  Sky.objs = []; try { skyDrawSeaBase.call(this, ctx, W, H); } finally { Sky.objs = objs; }
  skyDrawSeaExtras(ctx, W, H, s);
  objs.forEach(function(o){ if (o.k !== 'fog') skyDrawObj(ctx, o, s); });
  skyDrawGulls(ctx, W, H, s);
  skyDrawCloudShadows(ctx, W, H, s);
  skyDrawDownwash(ctx, s);
  if (Sky.on && !Sky.down){ const x = Sky.x + 26 * s, y = Sky.y + 40 * s, a = Sky.t * 26, R = 62 * s * 1.3 * 0.9; ctx.strokeStyle = 'rgba(8,16,28,.16)'; ctx.lineWidth = 4 * s; ctx.beginPath();   /* the blades' shadow, flickering round on the water */
    for (let k = 0; k < 4; k++){ const b = a + k * Math.PI / 2; ctx.moveTo(x, y); ctx.lineTo(x + Math.cos(b) * R, y + Math.sin(b) * R * 0.56); } ctx.stroke(); }
};

/* ---- the boats and the animals, each in its own frame facing +x (its heading) ---- */
function skyWake(ctx, len, w, t, k){                                                         /* a foam V and a churned line, behind (-x) */
  for (let q = 0; q < 7; q++){ const a = (t * 0.8 + q / 7 + k) % 1; fillCircle(ctx, -len * 0.25 - a * len, Math.sin(q * 3 + t) * 2 * a, (3 + a * w * 0.5), 'rgba(240,250,255,' + (0.3 * (1 - a)).toFixed(3) + ')'); }
  ctx.strokeStyle = 'rgba(240,250,255,.3)'; ctx.lineWidth = 2; ctx.beginPath(); for (const sd of [-1, 1]){ ctx.moveTo(-len * 0.2, sd * w * 0.4); ctx.quadraticCurveTo(-len * 0.8, sd * w * 0.8, -len * 1.5, sd * w * 2); } ctx.stroke();
}
function skyDrawTrawler(ctx, o, s){                                                          /* a fishing boat: blue hull, the wheelhouse forward, booms out with their nets dragging, gulls after it */
  const t = Sky.t;
  ctx.save(); ctx.translate(o.x, o.y); ctx.rotate(o.h); ctx.scale(s, s);
  skyWake(ctx, 50, 12, t, o.seed);
  ctx.strokeStyle = 'rgba(220,220,210,.55)'; ctx.lineWidth = 1; ctx.beginPath(); for (const sd of [-1, 1]){ ctx.moveTo(-8, sd * 40); ctx.lineTo(-62, sd * 34); } ctx.stroke();     /* the net lines from the boom ends, and the nets in the water */
  for (const sd of [-1, 1]){ ctx.fillStyle = 'rgba(200,190,150,.4)'; ctx.beginPath(); ctx.ellipse(-70, sd * 34, 10, 5, 0, 0, TAU); ctx.fill();
    ctx.strokeStyle = 'rgba(120,110,80,.5)'; ctx.lineWidth = 0.8; ctx.beginPath(); for (let q = -2; q <= 2; q++){ ctx.moveTo(-78, sd * 34 + q * 2); ctx.lineTo(-62, sd * 34 + q * 2); } ctx.stroke(); fillCircle(ctx, -60, sd * 34, 2, '#E8682A'); }
  tw_ln(ctx, [-8, 0, -8, -40], 2.4, '#5A6068'); tw_ln(ctx, [-8, 0, -8, 40], 2.4, '#5A6068');                                                          /* the booms */
  ctx.fillStyle = 'rgba(6,12,24,.25)'; ctx.beginPath(); ctx.ellipse(4, 6, 44, 13, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = '#1E3A5A'; ctx.beginPath(); ctx.moveTo(-40, -12); ctx.lineTo(24, -12); ctx.quadraticCurveTo(48, 0, 24, 12); ctx.lineTo(-40, 12); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#2E5A8A'; ctx.beginPath(); ctx.moveTo(-38, -10); ctx.lineTo(23, -10); ctx.quadraticCurveTo(43, 0, 23, 10); ctx.lineTo(-38, 10); ctx.closePath(); ctx.fill();
  tw_rect(ctx, -34, -8, 34, 16, '#8A7A62'); for (let q = 0; q < 3; q++) tw_rr(ctx, -32 + q * 10, -6, 8, 6, 1, q % 2 ? '#4A8AB8' : '#E8682A');            /* the deck and its fish boxes */
  tw_rr(ctx, 2, -8, 16, 16, 2, '#F4F4EE'); tw_rect(ctx, 14, -6, 3, 12, '#3A5A7A'); fillCircle(ctx, 6, 0, 2.4, '#C8402A');                             /* the wheelhouse */
  if (Sky.wave >= 6) csGlow(ctx, 10, 0, 16, '#FFE0A0', 0.35);
  ctx.restore();
  for (let b = 0; b < 3; b++){ const a = t * (1.6 + b * 0.3) + b * 2, cx = o.x - Math.cos(o.h) * 70 * s + Math.cos(a) * 26 * s, cy = o.y - Math.sin(o.h) * 70 * s + Math.sin(a) * 18 * s, fl = Math.sin(t * 8 + b) * 3 * s;   /* the gulls after the catch */
    ctx.strokeStyle = '#F4F4EE'; ctx.lineWidth = 2 * s; ctx.beginPath(); ctx.moveTo(cx - 7 * s, cy - fl); ctx.quadraticCurveTo(cx, cy - 3 * s, cx + 7 * s, cy - fl); ctx.stroke(); }
}
function skyDrawSail(ctx, o, s){                                                             /* a yacht: a white hull, a teak deck, the mast and the sail out to one side, flapping */
  const t = Sky.t, sd = Math.sin(o.seed) > 0 ? 1 : -1, fl = Math.sin(t * 3 + o.seed) * 0.08;
  ctx.save(); ctx.translate(o.x, o.y); ctx.rotate(o.h); ctx.scale(s, s);
  skyWake(ctx, 60, 14, t, o.seed);
  ctx.fillStyle = 'rgba(6,12,24,.25)'; ctx.beginPath(); ctx.ellipse(4, 6, 32, 10, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = '#E8E8E2'; ctx.beginPath(); ctx.moveTo(-28, -8); ctx.quadraticCurveTo(10, -12, 34, 0); ctx.quadraticCurveTo(10, 12, -28, 8); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#B88A5A'; ctx.beginPath(); ctx.moveTo(-24, -5); ctx.quadraticCurveTo(8, -8, 26, 0); ctx.quadraticCurveTo(8, 8, -24, 5); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(90,60,30,.5)'; ctx.lineWidth = 0.8; ctx.beginPath(); for (let q = -2; q <= 2; q++){ ctx.moveTo(-22, q * 1.8); ctx.lineTo(20, q * 1.2); } ctx.stroke();
  tw_rr(ctx, -22, -4, 10, 8, 2, '#F4F4EE'); fillCircle(ctx, -18, 0, 2.2, '#C8402A');                                                              /* the cockpit and the sailor */
  ctx.save(); ctx.translate(4, 0); ctx.rotate(sd * (0.7 + fl)); ctx.fillStyle = 'rgba(250,250,246,.95)'; ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(-14, sd * 10, -30, 0); ctx.lineTo(0, 0); ctx.fill();   /* the mainsail, bellied by the wind */
  ctx.strokeStyle = '#8A8A84'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-30, 0); ctx.stroke(); ctx.restore();
  ctx.fillStyle = 'rgba(250,250,246,.9)'; ctx.beginPath(); ctx.moveTo(4, 0); ctx.quadraticCurveTo(18, sd * 6, 30, 0); ctx.lineTo(4, 0); ctx.fill();   /* the jib */
  fillCircle(ctx, 4, 0, 2, '#5A5A54');
  ctx.restore();
}
function skyDrawSpeed(ctx, o, s){                                                            /* a speedboat, nose up, a long white wake and spray off the bow */
  const t = Sky.t, bob = Math.sin(t * 9 + o.seed) * 0.6;
  ctx.save(); ctx.translate(o.x, o.y); ctx.rotate(o.h); ctx.scale(s, s);
  for (let q = 0; q < 12; q++){ const a = (t * 1.6 + q / 12) % 1; fillCircle(ctx, -18 - a * 200, Math.sin(q * 2 + t * 3) * 3 * a, 2 + a * 9, 'rgba(240,250,255,' + (0.45 * (1 - a)).toFixed(3) + ')'); }
  ctx.strokeStyle = 'rgba(240,250,255,.4)'; ctx.lineWidth = 2.4; ctx.beginPath(); for (const sd of [-1, 1]){ ctx.moveTo(10, sd * 6); ctx.quadraticCurveTo(-60, sd * 16, -200, sd * 50); } ctx.stroke();
  for (const sd of [-1, 1]) for (let q = 0; q < 3; q++){ const a = (t * 3 + q / 3) % 1; fillCircle(ctx, 18 - a * 10, sd * (8 + a * 10), 1.6, 'rgba(240,250,255,' + (0.7 * (1 - a)).toFixed(3) + ')'); }
  ctx.fillStyle = 'rgba(6,12,24,.25)'; ctx.beginPath(); ctx.ellipse(2, 5, 22, 7, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = '#F4F4EE'; ctx.beginPath(); ctx.moveTo(-20, -7); ctx.lineTo(8, -7); ctx.quadraticCurveTo(26, -3 + bob, 28, 0); ctx.quadraticCurveTo(26, 3 + bob, 8, 7); ctx.lineTo(-20, 7); ctx.closePath(); ctx.fill();
  tw_rect(ctx, -20, -7, 40, 2, '#C8402A'); tw_rect(ctx, -20, 5, 40, 2, '#C8402A');
  ctx.fillStyle = 'rgba(120,190,220,.85)'; ctx.beginPath(); ctx.moveTo(0, -5); ctx.quadraticCurveTo(6, 0, 0, 5); ctx.lineTo(-2, 5); ctx.quadraticCurveTo(3, 0, -2, -5); ctx.fill();  /* the windscreen */
  tw_rr(ctx, -14, -4, 12, 8, 2, '#3A3A40'); fillCircle(ctx, -6, 0, 2.2, '#E8C24A'); tw_rect(ctx, -23, -3, 4, 6, '#1A1E20');                                 /* seats, the driver, the outboard */
  ctx.restore();
}
function skyDrawWhale(ctx, o, s){                                                            /* a whale: mostly a long dark shape under the water; now and then it comes up, blows, and goes down tail last */
  const t = Sky.t, cyc = (o.ph % 14) / 14, up = cyc > 0.55 && cyc < 0.85, u = up ? (cyc - 0.55) / 0.3 : 0;
  ctx.save(); ctx.translate(o.x, o.y); ctx.rotate(o.h); ctx.scale(s, s);
  if (!up){ ctx.fillStyle = 'rgba(10,22,34,.32)'; ctx.beginPath(); ctx.ellipse(0, 0, 46, 13, 0, 0, TAU); ctx.fill(); ctx.beginPath(); ctx.moveTo(-44, 0); ctx.lineTo(-60, -10); ctx.lineTo(-56, 0); ctx.lineTo(-60, 10); ctx.closePath(); ctx.fill();
    ringPath(ctx, 10, 0, 14 + Math.sin(t * 2) * 2, 1.2, '#E8F6FF', 0.2); }
  else {
    const a = Math.sin(u * Math.PI);
    ctx.fillStyle = 'rgba(240,250,255,.35)'; ctx.beginPath(); ctx.ellipse(0, 0, 50 * a + 10, 16 * a + 4, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = '#3A4650'; ctx.beginPath(); ctx.ellipse(6, 0, 40 * a + 4, 11 * a + 2, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = '#56646E'; ctx.beginPath(); ctx.ellipse(10, -3, 26 * a + 2, 4 * a + 1, 0, 0, TAU); ctx.fill();
    for (let q = 0; q < 5; q++) fillCircle(ctx, -10 + q * 9, (q % 2 ? 4 : -2) * a, 1.4, 'rgba(220,220,210,.7)');                                          /* barnacles */
    fillCircle(ctx, 30 * a, 0, 2, '#1A2228');                                                                                                     /* the blowhole */
    if (u < 0.35) for (let q = 0; q < 8; q++){ const b = (t * 2 + q / 8) % 1; fillCircle(ctx, 30 * a + (Math.sin(q * 2.3) * 8) * b, Math.cos(q * 1.7) * 8 * b, 3 + b * 6, 'rgba(250,252,255,' + (0.6 * (1 - b)).toFixed(3) + ')'); }   /* the blow */
    if (u > 0.7){ const f = (u - 0.7) / 0.3; ctx.fillStyle = '#2A343C'; ctx.beginPath(); ctx.moveTo(-36, 0); ctx.quadraticCurveTo(-52, -22 * f, -60, -26 * f); ctx.lineTo(-48, 0); ctx.lineTo(-60, 26 * f); ctx.quadraticCurveTo(-52, 22 * f, -36, 0); ctx.fill(); }   /* the flukes as it dives */
  }
  ctx.restore();
}
function skyDrawDolphins(ctx, o, s){                                                         /* a pod of four, leaping one after another, a splash each time */
  const t = Sky.t;
  ctx.save(); ctx.translate(o.x, o.y); ctx.rotate(o.h); ctx.scale(s, s);
  for (let k = 0; k < 4; k++){
    const dx = -k * 22 + (k % 2) * 6, dy = (k % 2 ? 12 : -10) + Math.sin(t + k) * 3, ph = (t * 0.7 + k * 0.23 + o.seed) % 1, air = ph < 0.3, u = air ? ph / 0.3 : 0;
    if (air){ const z = 1 + Math.sin(u * Math.PI) * 0.35;                                                                                         /* in the air: bigger (nearer), its shadow left behind on the water */
      ctx.fillStyle = 'rgba(6,12,24,.2)'; ctx.beginPath(); ctx.ellipse(dx + 6, dy + 8, 10, 3, 0, 0, TAU); ctx.fill();
      ctx.save(); ctx.translate(dx, dy); ctx.scale(z, z); ctx.fillStyle = '#6A7A88'; ctx.beginPath(); ctx.ellipse(0, 0, 11, 3.6, 0, 0, TAU); ctx.fill(); ctx.fillStyle = '#9AAAB6'; ctx.beginPath(); ctx.ellipse(1, 1, 8, 1.6, 0, 0, TAU); ctx.fill();
      tw_poly(ctx, [-10, 0, -15, -4, -13, 0, -15, 4], '#5A6A78'); tw_poly(ctx, [-1, -3, -5, -7, 2, -3.4], '#5A6A78'); tw_ln(ctx, [10, 0, 14, 0], 2, '#6A7A88'); ctx.restore(); }
    else { ctx.fillStyle = 'rgba(30,50,70,.3)'; ctx.beginPath(); ctx.ellipse(dx, dy, 10, 3, 0, 0, TAU); ctx.fill(); if (ph < 0.42) ringPath(ctx, dx - 8, dy, 4 + (ph - 0.3) * 60, 1.2, '#E8F6FF', 0.6 * (1 - (ph - 0.3) / 0.12)); }
  }
  ctx.restore();
}
