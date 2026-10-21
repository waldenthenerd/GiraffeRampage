'use strict';
/* Longneck Town, fifth part: the old runway, the plane shop, and flying. */
/* ========================= 44ze. THE RUNWAY AND THE PLANE ========================= */
/* THE PLACE. The Old Runway is the street at the far right of town, painted like the airfield in the homecoming film (21-film-homecoming.js:
   the same dusk sky and sun, far hills, savannah grass, dark acacias, the strip with its dashes and yellow lights, Hangar 7 and the windsock).
   It is not gated by any chapter (the tram map goes straight to it); on foot it is the last street, past the Launchpad. The hangar is Wingnut
   Aviation, a plane shop (Save.data.town.plane = { own:1, col:n }). "Take off" is offered anywhere along the strip.
   FLYING. G.state is 'fly'. The plane has a throttle (right / left) and an elevator (up / down) and a small physical model: thrust against
   drag, lift that depends on airspeed (below FV.stall it stalls: the nose drops and she sinks), a rotation speed on the runway, thin air very
   high up, and gravity on climbs and dives. Landing gently on the runway (or a rough one in a field) is fine; coming down too hard, too steep,
   or too fast off the runway is a crash, which plays a short scene: another giraffe lands, fetches her and flies her home.
   THE WORLD. A side-on strip: Longneck Town, then the chapters on the Earth in order: 1 to 7; Chapter 11 once Chapter 10 is finished; Chapter 12
   once 11 is. Each has its own ground and scenery, regions blend into one another with a gateway between, and a fog wall ends what is open.
   Gold rings hang along the way. Nothing about a chapter changes. Esc leaves the flight (back on the runway, no harm done). */
const PLANE_PRICE = 60000, FLY_GROUND = 540, FLY_H = 700, FLY_REGION_W = 2600, FLY_TOWN_W = 3800, FLY_RUNWAY_LEN = 1400, FLY_ZONE = 320;
const FV = { stall: 135, rotate: 165, cruise: 250, max: 335, g: 330 };
const FLY_BIOME = {
  0: { name: 'Longneck Town', g: '#D6A24E', g2: '#8A5A2A', hill: '#6A4A52', tint: null },
  1: { name: 'The Savanna', g: '#D8B25A', g2: '#9A7230', hill: '#B58F3A', tint: ['#FFB060', 0.1] },
  2: { name: 'Frostreach', g: '#EEF4FA', g2: '#B8CCE0', hill: '#BFD0E0', tint: ['#BFDFFF', 0.16] },
  3: { name: 'Murkfen', g: '#4A5A32', g2: '#2A3818', hill: '#3E4E2A', tint: ['#7A9A3A', 0.18] },
  4: { name: 'The Deep', g: '#3A82B8', g2: '#16406A', hill: '#2A5A8A', tint: ['#4A8ACA', 0.12] },
  5: { name: 'The Canopy', g: '#2E7A36', g2: '#17501E', hill: '#2A5A2E', tint: ['#3A9A4A', 0.14] },
  6: { name: 'Houston', g: '#6A6F78', g2: '#40454E', hill: '#5A606A', tint: ['#8A8A9A', 0.14] },
  7: { name: 'Space Center', g: '#C0AE92', g2: '#8A7A60', hill: '#A89A80', tint: ['#E8E8F0', 0.08] },
  11: { name: 'The Changed Savannah', g: '#9AC85A', g2: '#5A9A3A', hill: '#7AB04A', tint: ['#C9A0FF', 0.16] },
  12: { name: 'Area 51', g: '#DDBE82', g2: '#B08C52', hill: '#C8A86A', tint: ['#FFD890', 0.14] }
};
function planeData(){ const t = townData(); if (!t.plane || typeof t.plane !== 'object' || Array.isArray(t.plane)) t.plane = { own: 0, col: 0 }; t.plane.own = t.plane.own ? 1 : 0; t.plane.col = t.plane.col | 0; return t.plane; }

/* ---- the plane, side view, facing right; her neck comes up through the cockpit ----
   o: col, flip, bank (radians), prop (angle), s, t, riders: [{ x, look, reach }] (default: her, alone; rider:false for none) */
function flyPlane(ctx, x, y, o){
  o = o || {};
  const col = o.col || planeColour(), dk = wardShade(col, 0.68), lt = blendHex(col, '#FFFFFF', 0.4), t = o.t || 0;
  ctx.save(); ctx.translate(x, y); ctx.rotate(o.bank || 0);
  ctx.scale(o.flipScale !== undefined ? o.flipScale : (o.flip ? -1 : 1), 1); if (o.s) ctx.scale(o.s, o.s);
  const riders = o.riders || (o.rider === false ? [] : [{ x: 8 }]);
  riders.forEach(function(r){ townGiraffe(ctx, r.x, 32, { s: 1.0, sit: true, noLegs: true, reach: r.reach === undefined ? 0.05 : r.reach, look: r.look, flip: false, t: t, seed: r.x }); });
  ctx.fillStyle = dk; ctx.beginPath(); ctx.moveTo(-54, 2); ctx.lineTo(-92, -34); ctx.lineTo(-76, -34); ctx.lineTo(-48, 10); ctx.closePath(); ctx.fill();
  ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(-60, 10); ctx.lineTo(-96, 6); ctx.lineTo(-96, 12); ctx.lineTo(-56, 18); ctx.closePath(); ctx.fill();
  ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(-62, 12); ctx.quadraticCurveTo(-30, -14, 22, -14); ctx.quadraticCurveTo(62, -12, 70, 8); ctx.quadraticCurveTo(60, 30, 10, 30); ctx.quadraticCurveTo(-40, 30, -62, 12); ctx.closePath(); ctx.fill();
  ctx.fillStyle = lt; ctx.beginPath(); ctx.moveTo(-50, 8); ctx.quadraticCurveTo(-20, -8, 24, -9); ctx.quadraticCurveTo(48, -8, 58, 4); ctx.quadraticCurveTo(10, -2, -50, 12); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#F4F1E8'; ctx.fillRect(-40, 14, 80, 4);
  ctx.fillStyle = '#9FD8F2'; ctx.beginPath(); ctx.moveTo(28, -13); ctx.lineTo(38, -22); ctx.lineTo(44, -12); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = dk; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(26, -14); ctx.lineTo(38, -22); ctx.stroke();
  ctx.fillStyle = dk; ctx.beginPath(); ctx.ellipse(6, 12, 52, 5.5, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = '#F2C230'; ctx.fillRect(-30, 9, 8, 5);
  ctx.strokeStyle = '#2A2A34'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-14, 30); ctx.lineTo(-18, 40); ctx.moveTo(30, 30); ctx.lineTo(34, 40); ctx.stroke();
  ctx.fillStyle = '#16161C'; ctx.beginPath(); ctx.arc(-18, 42, 6, 0, TAU); ctx.arc(34, 42, 6, 0, TAU); ctx.fill();
  ctx.fillStyle = '#C9CDD9'; ctx.beginPath(); ctx.arc(-18, 42, 2.6, 0, TAU); ctx.arc(34, 42, 2.6, 0, TAU); ctx.fill();
  ctx.fillStyle = '#3A3A44'; ctx.beginPath(); ctx.ellipse(70, 8, 5, 6, 0, 0, TAU); ctx.fill();
  const spin = o.prop === undefined ? t * 38 : o.prop, bw = Math.abs(Math.cos(spin)) * 24 + 4;
  ctx.fillStyle = 'rgba(60,60,70,' + (Math.abs(Math.cos(spin)) > 0.8 ? 0.85 : 0.35).toFixed(2) + ')'; ctx.beginPath(); ctx.ellipse(74, 8, 3.4, bw, 0, 0, TAU); ctx.fill();
  ctx.restore();
}

/* ---- the district, the hangar, the person ---- */
(function(){
  const L = TOWN_DIST.launch;
  TOWN_ORDER.push('runway'); TOWN_IDS.splice(TOWN_IDS.indexOf('burrows'), 0, 'runway');
  TOWN_DIST.runway = { id: 'runway', name: 'The Old Runway', w: 3000, spawn: 220, theme: 'runway', fixedDusk: true, left: 'launch', right: null, open: function(){ return true; }, need: '',
    b: [
      { id: 'hangar', kind: 'hangar', x: 760, w: 300, h: 215, label: 'Hangar 7', act: 'plane', to: 'in_hangar' },
      { id: 'strip', kind: 'stripzone', x: 1500, w: 100, h: 0, label: 'The runway', act: 'fly' },
      { id: 'beacon', kind: 'beacon', x: 2520, w: 90, h: 250, label: 'The beacon', act: 'beacon' }
    ],
    p: [{ k: 'runwaystrip', x: 0 }, { k: 'dacacia', x: 200, s: 0.9 }, { k: 'dacacia', x: 1260, s: 0.6 }, { k: 'dacacia', x: 2140, s: 0.8 }, { k: 'dacacia', x: 2800, s: 1.0 }, { k: 'windsockpole', x: 1000 },
      { k: 'fuel', x: 1760 }, { k: 'cones', x: 1380 }, { k: 'cones', x: 1640 }, { k: 'crates', x: 470 }],
    L: [{ x: 760, y: 410, r: 150 }],
    npcs: [], dig: [420, 1760, 2700] };
  L.right = 'runway';
  townRoomDef('in_hangar', 'Hangar 7', 'hangar', 1200, 190, { b: [{ id: 'door', kind: 'door', x: 110, w: 100, h: 130, label: 'Out', act: 'out' },
      { id: 'planedisplay', kind: 'turntable', x: 620, w: 340, h: 90, label: 'The plane for sale', act: 'plane' }, { id: 'bench', kind: 'toolwall', x: 1040, w: 200, h: 200, label: 'Tools', act: 'tools' }],
    p: [{ k: 'tyres', x: 330 }, { k: 'plant', x: 1140 }], L: [{ x: 160, y: 170, r: 190 }, { x: 640, y: 80, r: 210 }, { x: 1000, y: 80, r: 170 }], npcs: ['wingnut'] });
  TOWN_IN_IDS.push('in_hangar'); TOWN_ROOM_PARENT.in_hangar = 'runway';
  TOWN_ROOM.hangar = { wall: '#4A3A2C', wains: '#2A2018', stripe: 'rgba(0,0,0,.18)', floor: '#6A5A4A', beam: '#1C1410' };
  [
    { id: 'rw_c1', d: 'runway', t: 'coin', x: 340, h: 0, note: 'in the grass by the first acacia' },
    { id: 'rw_c2', d: 'runway', t: 'coin', x: 760, h: 270, note: 'on the roof of the hangar' },
    { id: 'rw_c3', d: 'runway', t: 'coin', x: 1000, h: 215, note: 'by the windsock' },
    { id: 'rw_g1', d: 'runway', t: 'gem', x: 1760, h: 120, note: 'on top of the fuel truck' },
    { id: 'rw_s1', d: 'runway', t: 'star', x: 2520, h: 268, note: 'at the very top of the beacon' },
    { id: 'rw_tr', d: 'runway', t: 'track', x: 2800, h: 0, ch: 1, type: 'rhino', note: 'in the soft earth past the beacon' },
    { id: 'hg_c1', d: 'runway', in: 'in_hangar', t: 'coin', x: 300, h: 150, note: 'on the tyre stack in the hangar' }
  ].forEach(function(it){ TOWN_ITEMS.push(it); TOWN_ITEM_BY_ID[it.id] = it; });
  TOWN_NPCS.wingnut = { id: 'wingnut', name: 'Wingnut', d: 'in_hangar', x: 900, range: 60, habit: 'tinker', fav: 'sweets', look: { coat: '#E8C070', spot: '#8A5A24', pat: 12, hat: 'aviator', s: 1.05 }, gift: { acc: 'pilot' },
    say: ['Every plane has a personality. Mine are mostly grumpy.', 'Chocks away! Whenever you’re ready.', 'Don’t pull up before you have the speed. The air won’t hold you.', 'Up there you can see the whole world and not one queue.',
      'Nose down if she shudders. She’ll forgive you.'],
    night: ['The runway lights are the prettiest thing in town.'], rain: ['Rain on the hangar roof. Best sound there is.'] };
  TOWN_NPC_LIST.push('wingnut');
  TOWN_GIFT_OF.wingnut = { acc: 'pilot' }; TOWN_NPCS.wingnut.gift = TOWN_GIFT_OF.wingnut;
  TOWN_LINES.wingnut = { day: ['Clear skies all the way to the Moon, I’d say. Well. Not the Moon.', 'Wind’s from the west. Perfect for a long flight.'], dusk: ['Golden hour. The best light to fly in.'], night: ['Night flying is for the brave. Or the bored.'],
    new: ['Hello! Come to look at the planes? Or to fly one?'], friend: ['You’ve got a pilot’s hands. I can tell.'], best: ['Take any plane you like. I’d say “my plane” but it’s really yours now.'],
    chap: [[1, 'The savanna looks lovely from up there.'], [6, 'Houston from the air is something else. Big. Grey. Busy.'], [10, 'They say the Changed Savannah glitters from the sky.']] };
  TOWN_ERRANDS.push(
    { id: 'wn1', npc: 'wingnut', title: 'First flight', offer: 'Buy a plane, take off from the runway, and come back. That is all a pilot is.', done: 'First flight in the logbook. Always a special one.', need: { k: 'stat', key: 'flights', n: 1 }, r: { coin: 3 } },
    { id: 'wn2', npc: 'wingnut', title: 'Through the hoops', offer: 'Fly through ten gold rings in the sky. Just to prove you can steer.', done: 'Ten hoops. Smooth as butter.', need: { k: 'stat', key: 'rings', n: 10 }, r: { gems: 25 } });
  TOWN_ERRANDS.forEach(function(e){ TOWN_ERR_BY_ID[e.id] = e; });
  const h = { id: 'pilot', name: 'Pilot’s Peaked Cap', c: '#5A6A3A', kind: 'hat', rare: false, p: 0, town: true };
  ACC.townHats.push(h); ACC_ITEMS.push(h); ACC_BY_ID.pilot = h;
  TOWN_HAT_SIDE.pilot = function(c){
    c.fillStyle = '#5A6A3A'; c.beginPath(); c.moveTo(-9, 0); c.lineTo(-8, -9); c.quadraticCurveTo(0, -14, 9, -9); c.lineTo(10, 0); c.closePath(); c.fill();
    c.fillStyle = '#3A4A22'; c.fillRect(-9, -3.4, 19, 3.4);
    c.fillStyle = '#F2C230'; c.beginPath(); c.moveTo(0.5, -6); c.lineTo(-4, -8); c.lineTo(-2, -5); c.closePath(); c.moveTo(0.5, -6); c.lineTo(5, -8); c.lineTo(3, -5); c.closePath(); c.fill(); c.beginPath(); c.arc(0.5, -5.6, 1.4, 0, TAU); c.fill();
    c.fillStyle = '#2A1E0C'; c.beginPath(); c.ellipse(11.5, 0.4, 7, 1.8, 0.1, 0, TAU); c.fill();
  };
  TOWN_HAT_TOP.pilot = function(c){ c.fillStyle = '#5A6A3A'; c.beginPath(); c.arc(0, 0, 9, 0, TAU); c.fill(); c.fillStyle = '#2A1E0C'; c.beginPath(); c.ellipse(9, 0, 5, 7, 0, 0, TAU); c.fill(); c.fillStyle = '#F2C230'; c.beginPath(); c.arc(6, 0, 1.6, 0, TAU); c.fill(); };
})();

/* ---- painting the airfield, the way the film does ---- */
const FILM_R = function(i){ const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
function townPaintRunwayField(c, D, W, H, R){
  D._win = [];
  /* far hills and the grass behind the strip, as in hmSavannahBack */
  const gg = c.createLinearGradient(0, TG - 60, 0, 600); gg.addColorStop(0, '#D6A24E'); gg.addColorStop(1, '#8A5A2A'); c.fillStyle = gg; c.fillRect(0, TG - 60, W, 660);
  c.strokeStyle = 'rgba(120,80,30,.35)'; c.lineWidth = 1;
  for (let k = 0; k < W / 9; k++){ const x = FILM_R(k + 3500) * W, y = TG - 56 + FILM_R(k + 3600) * 54; c.beginPath(); c.moveTo(x, y); c.lineTo(x + 2, y - 8 - FILM_R(k + 3700) * 8); c.stroke(); }
  /* the strip: dark asphalt, a lighter edge, the dashed centreline and the row of lights (the lights glow in townDynX) */
  tRect(c, '#54505A', 0, TG + 2, W, 56); tRect(c, '#6A6670', 0, TG + 2, W, 4);
  c.fillStyle = '#E8E0C8'; for (let x = 20; x < W; x += 90) c.fillRect(x, TG + 26, 46, 4);
  tRect(c, '#3A2A1E', 0, TG + 58, W, 6);
  for (let i = 0; i < D.p.length; i++) townProp(c, D, D.p[i], TOWN_PAL.park, null);
  for (let i = 0; i < D.b.length; i++) townBuilding(c, D, D.b[i], TOWN_PAL.park, null);
}
(function(){
  const pfar = townPaintFar, pmid = townPaintMid, pf = townPaintField, px = townPropX, bx = townBuildingX, rp = townRoomProps, sky = townDrawSky;
  townPaintFar = function(c, D, W, H, R){
    if (D.theme !== 'runway') return pfar(c, D, W, H, R);
    c.fillStyle = '#6A4A52'; c.beginPath(); c.moveTo(0, TG + 20);
    for (let x = 0; x <= W + 40; x += 40) c.lineTo(x, TG - 90 - 22 * Math.abs(Math.sin(x * 0.007 + 1.3)) - 10 * Math.sin(x * 0.02) - 26 * Math.abs(Math.sin(x * 0.0023)));
    c.lineTo(W, TG + 20); c.closePath(); c.fill();
  };
  townPaintMid = function(c, D, W, H, R){
    if (D.theme !== 'runway') return pmid(c, D, W, H, R);
    /* a far herd, the way the film shows it: small dark giraffes, and acacias */
    for (let k = 0; k < 9; k++){ const x = 80 + k * (W / 9) + FILM_R(k) * 60, s = 0.5 + FILM_R(k + 9) * 0.35;
      c.fillStyle = '#34402A'; c.beginPath(); c.ellipse(x - 6, TG - 90 * s, 54 * s, 13 * s, 0, 0, TAU); c.ellipse(x - 28, TG - 82 * s, 30 * s, 9 * s, 0, 0, TAU); c.fill();
      c.fillStyle = '#2A1E16'; c.fillRect(x - 5 * s, TG - 86 * s, 8 * s, 86 * s); }
    for (let k = 0; k < 7; k++){ const x = 160 + k * (W / 7) + FILM_R(k + 30) * 90, s = 0.34 + FILM_R(k + 40) * 0.1;
      c.fillStyle = '#3A2A24'; c.beginPath(); c.ellipse(x, TG - 30 * s, 16 * s, 11 * s, 0, 0, TAU); c.fill(); c.fillRect(x + 8 * s, TG - 74 * s, 5 * s, 44 * s); c.beginPath(); c.ellipse(x + 12 * s, TG - 78 * s, 10 * s, 6 * s, 0, 0, TAU); c.fill(); }
  };
  townPaintField = function(c, D, W, H, R){ if (D.theme === 'runway') return townPaintRunwayField(c, D, W, H, R); return pf(c, D, W, H, R); };
  townDrawSky = function(ctx, W, H, h, D){
    if (!D || D.theme !== 'runway') return sky(ctx, W, H, h, D);
    const V = townView(), hy = H - (600 - TG) * V.sc;                              /* the horizon: the film's dusk, always */
    const g = ctx.createLinearGradient(0, 0, 0, hy + 20); g.addColorStop(0, '#2E2A5E'); g.addColorStop(0.5, '#C86A5A'); g.addColorStop(1, '#F8B868'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    const sx = W * 0.22, sy = hy - 56 * V.sc;
    let gl = ctx.createRadialGradient(sx, sy, 6, sx, sy, 380 * V.sc); gl.addColorStop(0, 'rgba(255,192,112,.55)'); gl.addColorStop(1, 'rgba(255,192,112,0)'); ctx.fillStyle = gl; ctx.fillRect(0, 0, W, H);
    tCircle(ctx, '#FFE2A0', sx, sy, 54 * V.sc * 0.8);
    gl = ctx.createRadialGradient(sx, sy, 2, sx, sy, 90 * V.sc); gl.addColorStop(0, 'rgba(255,246,216,.6)'); gl.addColorStop(1, 'rgba(255,246,216,0)'); ctx.fillStyle = gl; ctx.fillRect(sx - 100, sy - 100, 200, 200);
    for (let i = 0; i < 3; i++){ const cx = ((i * 0.37 + Town.t * 0.003) % 1.2 - 0.1) * W; tEll(ctx, 'rgba(255,200,170,.28)', cx, H * 0.18 + i * 34, 130, 18); }
  };
  townPropX = function(c, D, p, P, r){
    const x = p.x, W = D.w; let ok = true;
    c.save();
    switch (p.k){
      case 'runwaystrip': break;                                                  /* painted by townPaintRunwayField */
      case 'dacacia': {                                                            /* the film's dark acacia (hmAcacia) */
        const s = (p.s || 1) * 1.1, y = TG;
        c.fillStyle = '#2A1E16'; c.beginPath(); c.moveTo(x - 6 * s, y); c.quadraticCurveTo(x - 4 * s, y - 70 * s, x - 14 * s, y - 110 * s); c.lineTo(x + 2 * s, y - 108 * s); c.quadraticCurveTo(x + 2 * s, y - 60 * s, x + 7 * s, y); c.fill();
        c.fillStyle = '#34402A'; c.beginPath(); c.ellipse(x - 6 * s, y - 118 * s, 70 * s, 17 * s, 0, 0, TAU); c.ellipse(x - 34 * s, y - 108 * s, 40 * s, 12 * s, 0, 0, TAU); c.ellipse(x + 26 * s, y - 112 * s, 44 * s, 12 * s, 0, 0, TAU); c.fill();
        break;
      }
      case 'fuel':
        tRound(c, '#C8C0B0', x - 70, TG - 70, 110, 44, 22); tRect(c, '#B84A2A', x - 70, TG - 52, 110, 8);
        tRound(c, '#5A6A4A', x + 40, TG - 66, 40, 40, 6); tRect(c, '#9AB0B8', x + 56, TG - 60, 20, 16); tCircle(c, '#1E1A1A', x - 40, TG - 20, 11); tCircle(c, '#1E1A1A', x + 20, TG - 20, 11); tCircle(c, '#1E1A1A', x + 66, TG - 20, 11);
        break;
      case 'windsockpole':
        c.strokeStyle = '#4A4036'; c.lineWidth = 4; c.beginPath(); c.moveTo(x, TG); c.lineTo(x, TG - 110); c.stroke();
        break;
      case 'cones':
        for (let i = 0; i < 3; i++) tPoly(c, '#E8662A', [x - 10 + i * 24, TG, x - 4 + i * 24, TG - 28, x + 4 + i * 24, TG - 28, x + 10 + i * 24, TG]);
        break;
      default: ok = false;
    }
    c.restore();
    return ok || px(c, D, p, P, r);
  };
  townBuildingX = function(c, D, b, P, r){
    const x = b.x, W = b.w, h = b.h, x0 = x - W / 2, y = TG + 20;
    switch (b.kind){
      case 'hangar':                                                               /* hmHangar: HANGAR 7 */
        c.save();
        c.fillStyle = 'rgba(0,0,0,.3)'; c.fillRect(x0 - 10, TG + 14, W + 20, 12);
        c.fillStyle = '#7A6A5A'; c.fillRect(x0, TG - 190, W, 210);
        c.fillStyle = '#6A5A4A'; c.beginPath(); c.moveTo(x0 - 14, TG - 186); c.quadraticCurveTo(x, TG - 270, x0 + W + 14, TG - 186); c.lineTo(x0 + W + 14, TG - 176); c.lineTo(x0 - 14, TG - 176); c.closePath(); c.fill();
        c.strokeStyle = 'rgba(40,30,24,.4)'; c.lineWidth = 2; for (let k = 1; k < 14; k++){ c.beginPath(); c.moveTo(x0 + k * W / 14, TG - 186); c.lineTo(x0 + k * W / 14, TG + 20); c.stroke(); }
        c.fillStyle = '#1A1210'; c.fillRect(x0 + 40, TG - 150, W - 80, 170);
        const gr = c.createRadialGradient(x, TG - 60, 4, x, TG - 60, 150); gr.addColorStop(0, 'rgba(255,184,104,.35)'); gr.addColorStop(1, 'rgba(255,184,104,0)'); c.fillStyle = gr; c.fillRect(x - 150, TG - 210, 300, 290);
        c.fillStyle = '#C8A878'; c.font = '800 22px "Courier New", monospace'; c.textAlign = 'center'; c.fillText('HANGAR 7', x, TG - 200);
        c.fillStyle = '#4A4036'; c.fillRect(x0 + W - 28, TG - 250, 10, 70);
        D._win.push({ x: x0 + 60, y: TG - 130, w: W - 120, h: 130 });
        tSign(c, 'Wingnut Aviation', x, TG - 164, 190, '#3A2A1E', '#FFD890');
        c.restore(); return true;
      case 'stripzone': return true;
      case 'beacon':
        c.save();
        c.strokeStyle = '#4A4036'; c.lineWidth = 5; c.beginPath(); c.moveTo(x - 20, TG + 18); c.lineTo(x - 5, TG - h); c.moveTo(x + 20, TG + 18); c.lineTo(x + 5, TG - h); c.stroke();
        c.lineWidth = 3; for (let i = 1; i < 5; i++){ const yy = TG + 18 - i * ((h + 18) / 5), hw = lerp(20, 5, i / 5); c.beginPath(); c.moveTo(x - hw, yy); c.lineTo(x + hw, yy); c.stroke(); }
        tRect(c, '#4A4036', x - 10, TG - h - 14, 20, 14); c.restore(); return true;
    }
    return bx(c, D, b, P, r);
  };
  townRoomProps = function(c, D, K, r){
    rp(c, D, K, r);
    if (D.room === 'hangar'){                                                      /* inside the film's hangar */
      const wall = c.createLinearGradient(0, 0, 0, TG); wall.addColorStop(0, '#2A2018'); wall.addColorStop(1, '#5A4636'); c.fillStyle = wall; c.fillRect(0, 36, D.w, TG - 36 - 90);
      c.strokeStyle = 'rgba(0,0,0,.3)'; c.lineWidth = 3; for (let x = 0; x < D.w; x += 80){ c.beginPath(); c.moveTo(x, 36); c.lineTo(x, TG - 90); c.stroke(); }
      tRect(c, '#FFD890', 280, 120, 90, 150); tRect(c, '#1C1410', 286, 126, 78, 138);
      tRect(c, '#6A5A4A', 0, TG - 12, D.w, 12);
      c.fillStyle = '#C8A878'; c.font = '800 22px "Courier New", monospace'; c.textAlign = 'center'; c.fillText('HANGAR 7', 640, 86);
    }
  };
})();

/* ---- life on the runway ---- */
(function(){
  const dyx = townDynX;
  townDynX = function(ctx, D, t, dark){
    dyx(ctx, D, t, dark);
    if (D.id === 'runway'){
      /* the row of lights along the strip: they blink in turn, as in the film */
      const cam = Town.camX, V = townView();
      for (let x = Math.floor((cam - 40) / 70) * 70; x < cam + V.vw + 40; x += 70){
        const on = Math.sin(t * 3 + x * 0.05) > -0.6;
        tCircle(ctx, on ? '#FFD060' : '#7A6A30', x, TG + 52, 3);
        if (on){ const g = ctx.createRadialGradient(x, TG + 52, 1, x, TG + 52, 16); g.addColorStop(0, 'rgba(255,192,64,.5)'); g.addColorStop(1, 'rgba(255,192,64,0)'); ctx.fillStyle = g; ctx.fillRect(x - 16, TG + 36, 32, 32); }
      }
      /* the windsock on its pole, and the orange light on the hangar */
      ctx.save(); ctx.translate(1000, TG - 110);
      const sw = Math.sin(t * 2) * 6;
      ctx.fillStyle = '#E8662A'; ctx.beginPath(); ctx.moveTo(0, -2); ctx.lineTo(60 + sw, 6 + Math.sin(t * 3) * 3); ctx.lineTo(0, 24); ctx.fill();
      ctx.fillStyle = '#F4F4F0'; ctx.beginPath(); ctx.moveTo(20, 2); ctx.lineTo(36, 4); ctx.lineTo(20, 14); ctx.fill();
      ctx.restore();
      tCircle(ctx, Math.sin(t * 3) > 0 ? '#FF8A3A' : '#6A3A20', 760 + 150 - 23, TG - 254, 6);
      /* the beacon */
      if (Math.sin(t * 2.2) > 0){ tCircle(ctx, '#FF4A3C', 2520, TG - 264, 6); const g = ctx.createRadialGradient(2520, TG - 264, 2, 2520, TG - 264, 60); g.addColorStop(0, 'rgba(255,90,60,.5)'); g.addColorStop(1, 'rgba(255,90,60,0)'); ctx.fillStyle = g; ctx.fillRect(2460, TG - 324, 120, 120); }
      /* a plane that rolls, lifts off and climbs away, now and then */
      const c = (Date.now() / 1000) % 50;
      if (c < 16){ const k = c / 16, x = 120 + k * k * 3000, lift = Math.max(0, k - 0.45) / 0.55; flyPlane(ctx, x, TG + 24 - lift * lift * 520, { col: '#E87A5A', rider: false, bank: -lift * 0.35, prop: t * 40, s: 0.8, t: t }); }
      if (planeOwned()) flyPlane(ctx, 1260, TG - 8, { rider: false, prop: t * 1.4, s: 1.0, t: t });
    }
    if (D.id === 'in_hangar'){
      flyPlane(ctx, 620, TG - 40 + Math.sin(t * 1.3) * 1.5, { rider: false, prop: t * 6, s: 1.5, t: t, col: planeOwned() ? planeColour() : '#E8B648' });
      if (!planeOwned()){ tRound(ctx, '#F2C230', 560, TG - 200, 120, 30, 6); ctx.fillStyle = '#3A2A1E'; ctx.font = 'bold 18px system-ui'; ctx.textAlign = 'center'; ctx.fillText('FOR SALE', 620, TG - 179); }
    }
  };
  /* the runway fades into the film's dusk: the town's own clock does not tint it */
})();

/* ---- the shop panel and what the doors do ---- */
(function(){
  const h = handleTownAction;
  handleTownAction = function(a){
    if (a === 'town-buyplane'){ if (planeBuy()) townToast('She owns a plane! The runway is outside.', '#BFFF9A'); townShowHangar(); return true; }
    const m = /^town-planepaint-(\d+)$/.exec(a);
    if (m){ if (planePaint(+m[1])) SFX.pick(); else SFX.deny(); townShowHangar(); return true; }
    return h(a);
  };
  const tu = townUse, nr = townNearest;
  townUse = function(o){
    if (o.k === 'b'){
      const b = o.b;
      if (b.act === 'plane' && !b.to){ townShowHangar(); return; }
      if (b.act === 'fly'){ if (!planeOwned()){ townSay({ name: 'The runway', text: 'A long strip of tarmac in the dusk. Nothing to fly yet: Wingnut sells a small plane in the hangar.' }, []); SFX.deny(); } else flyTakeoff(); return; }
      if (b.act === 'beacon'){ townSay({ name: 'The beacon', text: 'A red light turns slowly at the top, for pilots who are lost. You have always known where you are.' }, []); return; }
    }
    tu(o);
  };
  townNearest = function(D, inp){
    let o = nr(D, inp);
    if (D.id === 'runway' && (!o || o.k === 'walker')){            /* take off from anywhere along the strip */
      const sb = D.b.find(function(b){ return b.act === 'fly'; });
      return { k: 'b', b: sb, label: planeOwned() ? 'Take off' : 'Look at the runway' };
    }
    if (o && o.k === 'b'){
      if (o.b.act === 'fly') o.label = planeOwned() ? 'Take off' : 'Look at the runway';
      else if (o.b.act === 'plane' && !o.b.to) o.label = 'Look at the plane';
      else if (o.b.act === 'beacon') o.label = 'Look up';
    }
    return o;
  };
})();

/* ---- flying ---- */
const Fly = { on: false, mode: 'fly', x: 0, y: 0, v: 0, vy: 0, th: 0, thr: 0, face: 1, faceVis: 1, onGround: true, stall: false, t: 0, prop: 0, cam: 0, rings: [], got: 0, earned: 0, regions: [], end: 0, reg: -1,
  bannerT: 0, prev: {}, shake: 0, crash: null, puffs: [], turnCd: 0, restT: 0, beep: 0, engT: 0, landBtn: null, pop: null, roll: 0 };
function flyRunwayX0(){ return Fly.regions[0].x0; }
function flyOnRunway(x){ return x >= flyRunwayX0() && x <= flyRunwayX0() + FLY_RUNWAY_LEN; }
function flyTakeoff(){
  if (!planeOwned()) return;
  const t = townData(); t.n.flights = (t.n.flights | 0) + 1; Save.write();
  Town.car = false; Town.hold = false; Town.panel = false; if (typeof townCloseDialog === 'function') townCloseDialog(true);
  Fly.regions = flyRegions(); Fly.end = Fly.regions[Fly.regions.length - 1].x1;
  Fly.on = true; Fly.mode = 'fly'; Fly.x = 150; Fly.y = FLY_GROUND - 46; Fly.v = 0; Fly.vy = 0; Fly.th = 0; Fly.thr = 0; Fly.face = 1; Fly.faceVis = 1; Fly.onGround = true; Fly.stall = false;
  Fly.t = 0; Fly.got = 0; Fly.earned = 0; Fly.reg = -1; Fly.bannerT = 0; Fly.crash = null; Fly.puffs = []; Fly.restT = 0; Fly.shake = 0; Fly.cam = 0;
  Fly.rings = [];
  const r = miniRng(townHash(String(Date.now() >> 12)));
  Fly.regions.forEach(function(R, i){ const n = i === 0 ? 5 : 6; for (let k = 0; k < n; k++) Fly.rings.push({ x: R.x0 + (i === 0 ? 1300 : 500) + k * (R.w - (i === 0 ? 1700 : 800)) / (n - 1), y: 190 + r() * 250, got: false, ph: r() * 6 }); });
  G.state = 'fly'; G.attract = false; G.subScreen = ''; G.townReturn = false;
  HUD.classList.remove('on'); TOUCH.classList.remove('on'); PAUSEBTN.classList.remove('on'); hideOverlay();
  Input.sx = G.W / 2; Input.sy = G.H / 2;
  SFX.level(); screenFadeIn(0.5);
}
function flyLand(){
  if (!Fly.on) return;
  Fly.on = false;
  if (Fly.earned) townToast('Flight over: ' + Fly.got + ' ring' + (Fly.got === 1 ? '' : 's') + ', ' + fmt(Fly.earned) + ' gold.', '#BFFF9A');
  Save.write();
  townEnter('runway', 1500, 1);
}
function flyEdge(name, v){ const e = v && !Fly.prev[name]; Fly.prev[name] = v; return e; }
function flyCrash(why){
  if (Fly.mode === 'crash') return;
  Fly.mode = 'crash'; Fly.crash = { t: 0, x: Fly.x, why: why || 'a hard landing', fired: 0 };
  Fly.shake = 1; Fly.v = 0; Fly.vy = 0; Fly.puffs = [];
  try { SFX.explode ? SFX.explode() : SFX.hit && SFX.hit(); } catch (e) {}
  try { SFX.tone('sawtooth', 120, 40, 0.5, 0.18, 0, 0); } catch (e) {}
  for (let i = 0; i < 16; i++) Fly.puffs.push({ x: Fly.x + (Math.random() - 0.5) * 40, y: FLY_GROUND - 30, vx: (Math.random() - 0.5) * 220, vy: -60 - Math.random() * 160, r: 8 + Math.random() * 14, t: 0, life: 1.4 + Math.random() * 1.6, c: Math.random() < 0.3 ? '#FF9A3A' : '#5A5560' });
}
function updateFly(dt){
  dt = Math.min(dt, 0.05); Fly.t += dt; G.time += dt;
  if (Fly.shake > 0) Fly.shake = Math.max(0, Fly.shake - dt * 1.6);
  const sc = clamp(G.H / FLY_H, 0.5, 1.5), V = G.W / sc;
  if (Fly.mode === 'crash'){ updateCrash(dt, V); return; }
  const k = Input.keys, any = function(a){ for (let i = 0; i < a.length; i++) if (k[a[i]]) return true; return false; };
  let thrIn = (any(['ArrowRight', 'KeyD', keyOf('right')]) ? 1 : 0) - (any(['ArrowLeft', 'KeyA', keyOf('left')]) ? 1 : 0);
  let pitIn = (any(['ArrowUp', 'KeyW', keyOf('up')]) ? 1 : 0) - (any(['ArrowDown', 'KeyS', keyOf('down')]) ? 1 : 0);
  if (Input.padOn){ if (Math.abs(Input.padX) > 0.25) thrIn += Input.padX; if (Math.abs(Input.padY) > 0.25) pitIn -= Input.padY; }
  let turnReq = flyEdge('turn', !!(k.KeyF || k.Space));
  if (Input.mdown && !thrIn && !pitIn){                                      /* a held finger or button flies her toward it: throttle up, nose to the point */
    const px = (Fly.x - Fly.cam) * sc, py = Fly.y * sc + (G.H - FLY_H * sc), dx = Input.sx - px, dy = Input.sy - py;
    thrIn = 1;
    if (dy < -26) pitIn = 1; else if (dy > 26) pitIn = -1;
    if (Math.abs(dx) > 60 && (dx > 0) !== (Fly.face > 0) && Fly.v > FV.stall + 10) turnReq = true;
  }
  thrIn = clamp(thrIn, -1, 1); pitIn = clamp(pitIn, -1, 1);
  Fly.thr = clamp(Fly.thr + thrIn * dt * 0.6, 0, 1);
  if (Fly.turnCd > 0) Fly.turnCd -= dt;
  if (turnReq && Fly.turnCd <= 0 && !Fly.onGround){ Fly.face = -Fly.face; Fly.turnCd = 0.9; Fly.v *= 0.9; }
  Fly.faceVis += (Fly.face - Fly.faceVis) * Math.min(1, dt * 7);
  const R0 = flyRunwayX0(), onRunway = flyOnRunway(Fly.x), alt = FLY_GROUND - 46 - Fly.y;
  const Lf = clamp((Fly.v - FV.stall * 0.8) / (FV.cruise * 0.85 - FV.stall * 0.8), 0, 1), thin = clamp(1 - Math.max(0, alt - 230) / 200, 0.25, 1);
  /* speed: thrust against drag, gravity on climbs and dives, the grass drags more than the tarmac */
  const thrust = Fly.thr * 240 * (0.55 + 0.45 * thin);
  let dv = thrust - 0.0024 * Fly.v * Fly.v - FV.g * Math.sin(Fly.th) * 0.55;
  if (Fly.onGround) dv -= 16 + Fly.v * 0.3 + (onRunway ? 0 : 70);
  Fly.v = Math.max(0, Math.min(FV.max + 20, Fly.v + dv * dt * 0.5));          /* she has some weight: speed changes gradually */
  /* the elevator, and the nose drop of a stall */
  const tt = pitIn > 0 ? 0.4 : pitIn < 0 ? -0.55 : 0;
  Fly.th += (tt - Fly.th) * Math.min(1, dt * 2.3 * FV.agile);
  Fly.stall = !Fly.onGround && Fly.v < FV.stall && alt > 10;
  if (Fly.stall) Fly.th -= (1 - Lf) * 0.9 * dt;
  Fly.th = clamp(Fly.th, -0.9, 0.7);
  if (Fly.onGround){
    Fly.th = Math.max(0, Fly.th * 0.9 + (pitIn > 0 && Fly.v > FV.rotate * 0.6 ? 0.02 : 0)); Fly.y = FLY_GROUND - 46; Fly.vy = 0;
    if (Fly.v >= FV.rotate * 0.97 && pitIn > 0){ Fly.onGround = false; Fly.vy = 40; try { SFX.tone('triangle', 520, 880, 0.18, 0.1, 0, 0); } catch (e) {} }
  } else {
    const climb = Fly.v * Math.sin(Fly.th) * (0.3 + 0.7 * Lf) * thin * FV.climb, sink = (1 - Lf) * (1 - Lf) * FV.g * 0.6;
    Fly.vy += (climb - sink - Fly.vy) * Math.min(1, dt * 2.1);
    Fly.y -= Fly.vy * dt;
    if (Fly.y < 130){ Fly.y = 130; Fly.vy = Math.min(0, Fly.vy); }
    if (Fly.y >= FLY_GROUND - 46){                                            /* touching the ground */
      const down = -Fly.vy, steep = Fly.th > 0.42 || Fly.th < -0.34;
      const reg = Fly.regions.filter(function(R){ return Fly.x >= R.x0 && Fly.x < R.x1; })[0];
      const water = reg && reg.ch === 4;
      if (down > 185 || steep || (!onRunway && (down > 120 || Fly.v > 175)) || water){ flyCrash(water ? 'the sea' : Fly.stall ? 'a stall' : 'a hard landing'); return; }
      Fly.y = FLY_GROUND - 46; Fly.onGround = true; Fly.vy = 0; Fly.th = 0;
      if (down > 90){ Fly.shake = 0.35; try { SFX.tone('square', 90, 60, 0.12, 0.1, 0, 0); } catch (e) {} }
    }
  }
  const dir = Fly.face;
  Fly.x = clamp(Fly.x + dir * Fly.v * Math.cos(Fly.th) * dt, 40, Fly.end - 40);
  if (Fly.x <= 40 || Fly.x >= Fly.end - 40) Fly.v *= 1 - Math.min(1, dt * 3);
  Fly.prop += dt * (14 + Fly.thr * 40);
  /* sound: a low engine note, a stall horn */
  Fly.engT -= dt; if (Fly.engT <= 0){ Fly.engT = 0.16; try { SFX.tone('sawtooth', 64 + Fly.thr * 40 + Fly.v * 0.06, 64 + Fly.thr * 40 + Fly.v * 0.06, 0.18, 0.025, 0, 0); } catch (e) {} }
  if (Fly.stall){ Fly.beep -= dt; if (Fly.beep <= 0){ Fly.beep = 0.35; try { SFX.tone('square', 880, 880, 0.12, 0.07, 0, 0); } catch (e) {} } }
  Fly.cam += ((Fly.x - V * 0.42 - dir * 80) - Fly.cam) * Math.min(1, dt * 3.2);
  Fly.cam = clamp(Fly.cam, 0, Math.max(0, Fly.end - V));
  for (let i = 0; i < Fly.regions.length; i++){ const R = Fly.regions[i]; if (Fly.x >= R.x0 && Fly.x < R.x1 && i !== Fly.reg){ Fly.reg = i; Fly.bannerT = 3.4; } }
  if (Fly.bannerT > 0) Fly.bannerT -= dt;
  const t = townData();
  for (let i = 0; i < Fly.rings.length; i++){
    const r = Fly.rings[i]; if (r.got) continue;
    if (Math.hypot(Fly.x - r.x, Fly.y - r.y) < 54){
      r.got = true; Fly.got++; const g = Math.max(10, Math.round(townCoin() * 0.25 * FV.rings));
      Save.data.gold = (Save.data.gold | 0) + g; Fly.earned += g; t.n.rings = (t.n.rings | 0) + 1; SFX.coin(); Fly.pop = { x: r.x, y: r.y, t: 0, txt: '+' + g };
    }
  }
  if (Fly.pop){ Fly.pop.t += dt; if (Fly.pop.t > 1.2) Fly.pop = null; }
  /* parked on the runway with the engine off: that is landing */
  if (Fly.onGround && Fly.v < 6 && Fly.thr < 0.08 && Fly.regions[0] && Fly.x < Fly.regions[0].x1 && Fly.t > 6){ Fly.restT += dt; if (Fly.restT > 1.2) flyLand(); } else Fly.restT = 0;
  const tapLand = flyEdge('ptr', !!Input.mdown) && Fly.landBtn && Input.sx >= Fly.landBtn.x && Input.sx <= Fly.landBtn.x + Fly.landBtn.w && Input.sy >= Fly.landBtn.y && Input.sy <= Fly.landBtn.y + Fly.landBtn.h;
  if (tapLand) flyLand();
}

/* ---- the crash: another giraffe lands, fetches her and flies her home ---- */
const FLY_RESCUE_END = 9.6;
function updateCrash(dt, V){
  const c = Fly.crash; c.t += dt;
  for (let i = Fly.puffs.length - 1; i >= 0; i--){ const p = Fly.puffs[i]; p.t += dt; p.x += p.vx * dt; p.y += p.vy * dt; p.vx *= 1 - Math.min(1, dt * 1.2); p.vy -= 20 * dt; if (p.t > p.life) Fly.puffs.splice(i, 1); }
  if (c.t < 7 && Fly.puffs.length < 24 && Math.random() < 0.5) Fly.puffs.push({ x: c.x + (Math.random() - 0.5) * 26, y: FLY_GROUND - 40, vx: (Math.random() - 0.5) * 30, vy: -50 - Math.random() * 40, r: 8 + Math.random() * 10, t: 0, life: 1.8 + Math.random(), c: '#5A5560' });
  Fly.cam += ((c.x + 140 - V * 0.5) - Fly.cam) * Math.min(1, dt * 2.4);
  Fly.cam = clamp(Fly.cam, 0, Math.max(0, Fly.end - V));
  if (c.t > 1.2 && !c.horn){ c.horn = true; try { SFX.tone('triangle', 660, 660, 0.25, 0.08, 0, 0); SFX.tone('triangle', 880, 880, 0.25, 0.08, 0.2, 0); } catch (e) {} }
  const skip = flyEdge('skip', !!(Input.keys.Enter || Input.keys.Space || Input.keys.KeyE));
  if (c.t > FLY_RESCUE_END || skip){
    Fly.on = false; Save.write();
    townEnter('runway', 1500, 1);
    townToast('Wingnut flew her home. The plane is fine. Her pride, less so.', '#E8D8B0');
  }
}
function flyDrawCrash(ctx, t){
  const c = Fly.crash, cx = c.x, gy = FLY_GROUND, wl = TOWN_NPCS.wingnut.look, u = c.t;
  const ease = function(k){ k = clamp(k, 0, 1); return 1 - Math.pow(1 - k, 3); };
  const stop = cx + 270;
  /* the wreck, with smoke and a little fire */
  flyPlane(ctx, cx, gy - 30, { rider: false, bank: 0.32, col: wardShade(planeColour(), 0.6), prop: 0.7, t: t });
  if (u < 5.5){ for (let i = 0; i < 4; i++){ const f = Math.sin(t * 14 + i * 2) * 0.5 + 0.5; ctx.fillStyle = 'rgba(255,' + (120 + f * 90 | 0) + ',30,.85)'; ctx.beginPath(); ctx.ellipse(cx - 30 + i * 14, gy - 22, 5, 9 + f * 8, 0, 0, TAU); ctx.fill(); } }
  /* her, thrown clear: dizzy at first, stands up when the other giraffe arrives */
  const walkBack = clamp((u - 5.2) / 1.2, 0, 1), hx = lerp(cx + 100, stop - 30, walkBack), standing = u > 4.6;
  if (u < 6.4){
    townGiraffe(ctx, hx, gy, { s: 1.3, sit: !standing, reach: standing ? 0.2 : -0.1, flip: walkBack > 0, ph: u * 8, moving: walkBack > 0 && walkBack < 1, t: t, seed: 2, dip: standing ? 0 : 12 });
    if (u < 4.6) for (let i = 0; i < 3; i++){ const a = t * 4 + i * 2.1; tCircle(ctx, '#FFD84D', hx + 38 + Math.cos(a) * 22, gy - 100 + Math.sin(a) * 6, 3); }
  }
  /* the rescue plane comes in from the right, lands, and the helper climbs down */
  const land = clamp((u - 1.0) / 2.6, 0, 1), roll = clamp((u - 3.6) / 0.8, 0, 1), takeoff = clamp((u - 7.0) / 2.4, 0, 1);
  let px = lerp(cx + 1300, cx + 560, ease(land)), py = lerp(gy - 340, gy - 46, Math.pow(land, 1.6));
  if (u >= 3.6) px = lerp(cx + 560, stop, ease(roll));
  let riders = [{ x: 8, look: wl }];
  if (u > 6.5) riders = [{ x: 8, look: wl }, { x: -26, look: undefined }];
  if (u >= 7.0){ px = stop - ease(takeoff) * 1400; py = gy - 46 - Math.pow(Math.max(0, takeoff - 0.25) / 0.75, 1.5) * 380; }
  if (u > 0.8 && u < FLY_RESCUE_END){
    const nose = land < 1 ? 0.14 * (1 - land) : 0;
    flyPlane(ctx, px, py, { col: '#E87A5A', flip: true, bank: u >= 7 ? 0.12 * takeoff : -nose, riders: riders, prop: t * 38, t: t });
  }
  /* the helper walks to her, then they walk back together */
  if (u >= 4.4 && u < 6.7){
    const out = clamp((u - 4.4) / 1.0, 0, 1), back = clamp((u - 5.2) / 1.2, 0, 1);
    const x = u < 5.2 ? lerp(stop - 10, cx + 150, out) : lerp(cx + 150, stop - 20, back);
    townGiraffe(ctx, x, gy, { s: 1.3, look: wl, flip: u < 5.2, ph: u * 7, moving: (out > 0 && out < 1) || (back > 0 && back < 1), t: t, seed: 5 });
  }
  /* smoke over everything */
  Fly.puffs.forEach(function(p){ ctx.globalAlpha = Math.max(0, 0.7 * (1 - p.t / p.life)); tCircle(ctx, p.c, p.x, p.y, p.r * (1 + p.t * 0.5)); }); ctx.globalAlpha = 1;
}

/* ---- the world below ---- */
function flyH(i, s){ const x = Math.sin(i * 127.1 + s * 311.7) * 43758.5453; return x - Math.floor(x); }
function flyGroundY(x){ return FLY_GROUND + Math.sin(x * 0.011) * 3 + Math.sin(x * 0.0037) * 5; }
function flyRegionIndex(x){ for (let i = 0; i < Fly.regions.length; i++) if (x >= Fly.regions[i].x0 && x < Fly.regions[i].x1) return i; return x < 0 ? 0 : Fly.regions.length - 1; }
/* how much of the neighbouring region's colours to mix in at x: up to half, right at the boundary */
function flyBlendAt(x){
  const i = flyRegionIndex(x), R = Fly.regions[i], loc = x - R.x0;
  if (loc < FLY_ZONE && i > 0) return { a: i, b: i - 1, k: 0.5 * (1 - loc / FLY_ZONE) };
  if (R.x1 - x < FLY_ZONE && i < Fly.regions.length - 1) return { a: i, b: i + 1, k: 0.5 * (1 - (R.x1 - x) / FLY_ZONE) };
  return { a: i, b: i, k: 0 };
}
function flyBiome(i){ const R = Fly.regions[i]; return FLY_BIOME[R ? R.ch : 0] || FLY_BIOME[0]; }
function flyGroundDetail(ctx, R, B, x0, x1, t){
  const gy = FLY_GROUND;
  /* a patchwork of fields in three depths, lighter and darker, under the detail */
  for (let c = Math.floor(x0 / 70); c <= Math.ceil(x1 / 70); c++){ for (let b = 0; b < 3; b++){ const v = flyH(c * 3 + b, 11 + R.ch); ctx.fillStyle = v > 0.5 ? 'rgba(255,255,255,' + (0.04 + (v - 0.5) * 0.12).toFixed(3) + ')' : 'rgba(0,0,0,' + (0.04 + (0.5 - v) * 0.14).toFixed(3) + ')'; ctx.fillRect(c * 70, gy + 8 + b * 40 + b * b * 6, 70, 36 + b * 10); } }
  const cell = 36, c0 = Math.floor(x0 / cell), c1 = Math.ceil(x1 / cell);
  for (let c = c0; c <= c1; c++){
    const x = c * cell + flyH(c, 1) * cell, y0 = flyGroundY(x), f = flyH(c, 2), f2 = flyH(c, 3), band = gy + 8 + f2 * 150;
    switch (R.ch){
      case 0: case 1:
        ctx.strokeStyle = 'rgba(90,60,20,.32)'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(x, band); ctx.lineTo(x + Math.sin(t * 2 + c) * 2, band - 7 - f * 8); ctx.stroke();
        if (f > 0.86){ ctx.fillStyle = 'rgba(70,45,20,.35)'; ctx.beginPath(); ctx.ellipse(x, band + 4, 9 + f * 8, 3.5, 0, 0, TAU); ctx.fill(); }
        break;
      case 2:
        if (f > 0.5){ ctx.fillStyle = 'rgba(255,255,255,.7)'; ctx.beginPath(); ctx.ellipse(x, band, 18 + f * 22, 5 + f * 3, 0, 0, TAU); ctx.fill(); }
        ctx.strokeStyle = 'rgba(120,160,200,.45)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x, band + 10); ctx.lineTo(x + 14, band + 16 + f * 8); ctx.stroke();
        break;
      case 3:
        if (f > 0.6){ ctx.fillStyle = 'rgba(20,34,24,.6)'; ctx.beginPath(); ctx.ellipse(x, band, 24 + f * 16, 6, 0, 0, TAU); ctx.fill(); ctx.strokeStyle = 'rgba(160,200,140,.35)'; ctx.beginPath(); ctx.ellipse(x, band, 14 + Math.sin(t * 1.5 + c) * 3, 3, 0, 0, TAU); ctx.stroke(); }
        ctx.strokeStyle = '#6A8A3A'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(x, band + 6); ctx.lineTo(x + Math.sin(t + c) * 2, band - 10 - f * 12); ctx.stroke();
        break;
      case 4:
        ctx.strokeStyle = 'rgba(255,255,255,' + (0.18 + f * 0.25).toFixed(2) + ')'; ctx.lineWidth = 1.6; ctx.beginPath(); const wx = x + Math.sin(t * 1.2 + c) * 6; ctx.moveTo(wx - 12, band); ctx.quadraticCurveTo(wx, band - 5, wx + 12, band); ctx.stroke();
        if (f > 0.93){ ctx.fillStyle = 'rgba(255,255,255,.55)'; ctx.fillRect(x - 8, y0 - 1, 16, 2.4); }
        break;
      case 5:
        ctx.fillStyle = 'rgba(' + (20 + f * 20 | 0) + ',' + (80 + f * 50 | 0) + ',30,.8)'; ctx.beginPath(); ctx.arc(x, y0 + 4 + f2 * 70, 10 + f * 14, 0, TAU); ctx.fill();
        break;
      case 6:
        if (c % 4 === 0){ ctx.fillStyle = 'rgba(30,32,38,.7)'; ctx.fillRect(c * cell, gy + 36, cell * 2, 12); ctx.fillStyle = 'rgba(255,230,120,.7)'; ctx.fillRect(c * cell + 4, gy + 41, 10, 2); ctx.fillRect(c * cell + 22, gy + 41, 10, 2); }
        if (f > 0.55){ ctx.fillStyle = 'rgba(' + (60 + f * 60 | 0) + ',' + (64 + f * 60 | 0) + ',' + (76 + f * 60 | 0) + ',.9)'; ctx.fillRect(x - 8, gy + 70 + f2 * 70, 10 + f * 20, 8 + f2 * 14); }
        break;
      case 7:
        if (c % 6 === 0){ ctx.fillStyle = 'rgba(70,60,50,.55)'; ctx.fillRect(c * cell, gy + 20, 70, 36); ctx.strokeStyle = '#F2C230'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(c * cell + 8, gy + 38); ctx.lineTo(c * cell + 62, gy + 38); ctx.stroke(); }
        if (f > 0.8){ ctx.fillStyle = 'rgba(120,100,80,.4)'; ctx.beginPath(); ctx.ellipse(x, band, 10, 4, 0, 0, TAU); ctx.fill(); }
        break;
      case 11:
        if (f > 0.55){ const a = 0.4 + 0.5 * Math.sin(t * 3 + c); ctx.fillStyle = 'rgba(255,255,255,' + a.toFixed(2) + ')'; ctx.fillRect(x, band, 2.6, 2.6); }
        if (f2 > 0.8){ ctx.fillStyle = 'rgba(200,170,255,.5)'; ctx.beginPath(); ctx.ellipse(x, band + 6, 16, 5, 0, 0, TAU); ctx.fill(); }
        break;
      case 12:
        ctx.strokeStyle = 'rgba(150,110,60,.4)'; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(x - 20, band); ctx.quadraticCurveTo(x, band - 8, x + 24, band); ctx.stroke();
        if (f > 0.9){ ctx.fillStyle = 'rgba(110,90,60,.5)'; ctx.beginPath(); ctx.ellipse(x, band + 4, 8, 4, 0, 0, TAU); ctx.fill(); }
        break;
    }
  }
}
function flyFeatures(ctx, R, cam, vw, t){
  const B = FLY_BIOME[R.ch]; if (!B || R.ch === 0) return;
  const cell = 120, c0 = Math.floor(Math.max(R.x0, cam - 200) / cell), c1 = Math.ceil(Math.min(R.x1, cam + vw + 200) / cell);
  for (let c = c0; c <= c1; c++){
    const fx = c * cell + flyH(c, 4) * cell * 0.9, kind = flyH(c, 5), s = 0.7 + flyH(c, 6) * 0.7, ph = flyH(c, 7) * 6, gy = flyGroundY(fx);
    if (fx < R.x0 + 30 || fx > R.x1 - 30) continue;
    switch (R.ch){
      case 1:
        if (kind < 0.5){ tRect(ctx, '#5A3C28', fx - 5 * s, gy - 72 * s, 10 * s, 72 * s); ctx.strokeStyle = '#5A3C28'; ctx.lineWidth = 5 * s; ctx.beginPath(); ctx.moveTo(fx, gy - 56 * s); ctx.lineTo(fx - 26 * s, gy - 80 * s); ctx.moveTo(fx, gy - 60 * s); ctx.lineTo(fx + 24 * s, gy - 82 * s); ctx.stroke(); tEll(ctx, '#4F8A44', fx, gy - 86 * s, 50 * s, 14 * s); tEll(ctx, '#5E9E55', fx + 10 * s, gy - 94 * s, 32 * s, 10 * s); }
        else if (kind < 0.72){ tEll(ctx, '#7A5A38', fx, gy - 16 * s, 26 * s, 17 * s); tEll(ctx, '#8A6A44', fx - 6 * s, gy - 24 * s, 14 * s, 8 * s); }
        else if (kind < 0.88){ for (let k = 0; k < 4; k++){ const hx = fx + k * 22 * s; ctx.fillStyle = '#3A2A24'; ctx.beginPath(); ctx.ellipse(hx, gy - 14 * s, 9 * s, 5 * s, 0, 0, TAU); ctx.fill(); ctx.fillRect(hx + 5 * s, gy - 30 * s, 2.4 * s, 18 * s); ctx.fillRect(hx - 6 * s, gy - 12 * s, 2 * s, 12 * s); ctx.fillRect(hx + 4 * s, gy - 12 * s, 2 * s, 12 * s); } }
        else { tRect(ctx, '#6A4A30', fx - 12 * s, gy - 44 * s, 24 * s, 44 * s); tEll(ctx, '#5E9E55', fx, gy - 52 * s, 36 * s, 18 * s); }
        break;
      case 2:
        if (kind < 0.55){ tPoly(ctx, '#CFE6F6', [fx - 22 * s, gy, fx - 4 * s, gy - 120 * s, fx + 24 * s, gy]); tPoly(ctx, '#FFFFFF', [fx - 4 * s, gy - 120 * s, fx + 10 * s, gy - 60 * s, fx - 10 * s, gy - 68 * s]); tPoly(ctx, '#9FC0DC', [fx + 4 * s, gy, fx + 24 * s, gy, fx - 4 * s, gy - 120 * s]); }
        else if (kind < 0.85){ tRect(ctx, '#4A3A28', fx - 2 * s, gy - 18 * s, 4 * s, 18 * s); for (let k = 0; k < 3; k++) tPoly(ctx, '#3E6A4A', [fx - (24 - k * 6) * s, gy - (14 + k * 24) * s, fx, gy - (46 + k * 24) * s, fx + (24 - k * 6) * s, gy - (14 + k * 24) * s]); tEll(ctx, '#FFFFFF', fx, gy - 54 * s, 12 * s, 4 * s); }
        else { tEll(ctx, '#E8F0F8', fx, gy - 4, 30 * s, 24 * s); tEll(ctx, '#1E2A3A', fx + 8 * s, gy - 2, 8 * s, 10 * s); }
        break;
      case 3:
        if (kind < 0.6){ tRect(ctx, '#4A3A28', fx - 5 * s, gy - 56 * s, 10 * s, 56 * s); tEll(ctx, '#3E5A32', fx, gy - 70 * s, 26 * s, 34 * s); ctx.strokeStyle = '#7A9A6A'; ctx.lineWidth = 2; for (let k = 0; k < 4; k++){ ctx.beginPath(); ctx.moveTo(fx - 14 * s + k * 9 * s, gy - 56 * s); ctx.lineTo(fx - 14 * s + k * 9 * s + Math.sin(t + k) * 2, gy - 28 * s); ctx.stroke(); } }
        else if (kind < 0.85){ tRect(ctx, '#5A4A30', fx - 20 * s, gy - 34 * s, 4 * s, 34 * s); tRect(ctx, '#5A4A30', fx + 16 * s, gy - 34 * s, 4 * s, 34 * s); tRect(ctx, '#7A5A38', fx - 26 * s, gy - 50 * s, 52 * s, 20 * s); tPoly(ctx, '#4A3A28', [fx - 30 * s, gy - 50 * s, fx, gy - 70 * s, fx + 30 * s, gy - 50 * s]); }
        else { ctx.fillStyle = 'rgba(180,220,160,.35)'; tEll(ctx, ctx.fillStyle, fx, gy - 30, 50 * s, 16); }
        break;
      case 4: {
        const wy = gy - 12 + Math.sin(t * 1.4 + ph) * 3;
        if (kind < 0.4){ tEll(ctx, '#3A5A7A', fx, wy, 42 * s, 16 * s); tPoly(ctx, '#3A5A7A', [fx + 36 * s, wy, fx + 60 * s, wy - 20 * s, fx + 50 * s, wy + 4]); tEll(ctx, '#C9DCEC', fx - 12 * s, wy + 5 * s, 20 * s, 6 * s); if (Math.sin(t * 1.4 + ph) > 0.5) tEll(ctx, 'rgba(220,240,255,.7)', fx - 16 * s, wy - 30 * s, 4, 16); }
        else if (kind < 0.62){ tPoly(ctx, '#F4F1E8', [fx - 30 * s, wy - 2, fx + 30 * s, wy - 2, fx + 22 * s, wy + 12 * s, fx - 22 * s, wy + 12 * s]); tRect(ctx, '#6A5848', fx - 1.5, wy - 54 * s, 3, 52 * s); tPoly(ctx, '#FFFFFF', [fx + 4, wy - 50 * s, fx + 28 * s, wy - 6, fx + 4, wy - 6]); }
        else if (kind < 0.85){ tEll(ctx, '#C9A24A', fx, wy - 6, 44 * s, 12 * s); tEll(ctx, '#4F8A44', fx, wy - 12, 34 * s, 9 * s); tRect(ctx, '#6A4A2A', fx - 3, wy - 40 * s, 6, 34 * s); ctx.strokeStyle = '#2E8A3A'; ctx.lineWidth = 4; for (let k = 0; k < 3; k++){ ctx.beginPath(); ctx.moveTo(fx, wy - 40 * s); ctx.quadraticCurveTo(fx + (k - 1) * 20, wy - 54 * s, fx + (k - 1) * 28, wy - 36 * s); ctx.stroke(); } }
        else { tCircle(ctx, '#D5352B', fx, wy - 6, 7); tRect(ctx, '#F4F1E8', fx - 3, wy - 6, 6, 5); }
        break;
      }
      case 5:
        if (kind < 0.6){ tRect(ctx, '#5A4A2A', fx - 6 * s, gy - 90 * s, 12 * s, 90 * s); [[-30, -24], [24, -30], [0, -40]].forEach(function(o){ tCircle(ctx, '#2E7A36', fx + o[0] * s, gy - (110 + o[1]) * s, 30 * s); }); tCircle(ctx, '#3A9A44', fx - 6 * s, gy - 126 * s, 26 * s); }
        else if (kind < 0.8){ tRect(ctx, '#6A4A2A', fx - 3 * s, gy - 80 * s, 6 * s, 80 * s); for (let k = 0; k < 5; k++){ ctx.strokeStyle = '#2E8A3A'; ctx.lineWidth = 6 * s; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(fx, gy - 80 * s); ctx.quadraticCurveTo(fx + (k - 2) * 24 * s, gy - 110 * s, fx + (k - 2) * 34 * s, gy - 76 * s); ctx.stroke(); } }
        else { tRect(ctx, '#7A8A6A', fx - 26 * s, gy - 40 * s, 52 * s, 40 * s); tRect(ctx, '#6A7A5A', fx - 18 * s, gy - 62 * s, 36 * s, 22 * s); tRect(ctx, '#1E2A1E', fx - 7 * s, gy - 24 * s, 14 * s, 24 * s); ctx.fillStyle = '#4A8A3A'; ctx.fillRect(fx - 26 * s, gy - 42 * s, 52 * s, 4); }
        break;
      case 6: {
        const h = 60 + flyH(c, 8) * 170;
        tRect(ctx, '#6A707A', fx - 22 * s, gy - h, 44 * s, h); tRect(ctx, '#565C66', fx + 8 * s, gy - h, 14 * s, h);
        for (let yy = gy - h + 8; yy < gy - 10; yy += 16) for (let xx = -14; xx < 14; xx += 11){ ctx.fillStyle = flyH(c * 31 + yy + xx, 9) > 0.45 ? 'rgba(255,225,130,.85)' : 'rgba(150,200,235,.7)'; ctx.fillRect(fx + xx * s - 2, yy, 6, 8); }
        if (kind > 0.75){ ctx.strokeStyle = '#C9962F'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(fx + 30 * s, gy); ctx.lineTo(fx + 30 * s, gy - h - 50); ctx.lineTo(fx + 90 * s, gy - h - 50); ctx.stroke(); }
        break;
      }
      case 7:
        if (kind < 0.35){ tRect(ctx, '#8A93A8', fx - 6, gy - 170 * s, 12, 170 * s); for (let k = 0; k < 4; k++) tRect(ctx, '#8A93A8', fx - 4, gy - (30 + k * 36) * s, 40 * s, 5); tPoly(ctx, '#E8EAF0', [fx + 44 * s, gy, fx + 50 * s, gy - 100 * s, fx + 60 * s, gy - 126 * s, fx + 70 * s, gy - 100 * s, fx + 76 * s, gy]); tRect(ctx, '#D5352B', fx + 50 * s, gy - 70 * s, 20 * s, 10); }
        else if (kind < 0.6){ tEll(ctx, '#E8EAF0', fx, gy, 46 * s, 38 * s); tRect(ctx, '#B8A890', fx - 54 * s, gy, 108 * s, 6); tEll(ctx, '#9FD8F2', fx - 8 * s, gy - 14 * s, 14 * s, 9 * s); }
        else if (kind < 0.82){ tRound(ctx, '#C9CDD9', fx - 14 * s, gy - 80 * s, 28 * s, 80 * s, 10); tRect(ctx, '#D5352B', fx - 14 * s, gy - 50 * s, 28 * s, 8); }
        else { ctx.save(); ctx.translate(fx, gy - 70 * s); ctx.rotate(Math.sin(t * 0.8) * 0.4 - 0.4); tEll(ctx, '#C9CDD9', 0, 0, 36 * s, 8 * s); tRect(ctx, '#6A6F78', -2, 0, 4, 70 * s); ctx.restore(); tRect(ctx, '#6A6F78', fx - 2, gy - 70 * s, 4, 70 * s); }
        break;
      case 11:
        if (kind < 0.55){ tPoly(ctx, '#C9A0FF', [fx - 12 * s, gy, fx, gy - 84 * s, fx + 14 * s, gy]); tPoly(ctx, '#8AF1FF', [fx + 8 * s, gy, fx + 20 * s, gy - 56 * s, fx + 32 * s, gy]); tPoly(ctx, '#FFFFFF', [fx - 12 * s, gy, fx - 2 * s, gy - 60 * s, fx - 6 * s, gy]); if (Math.sin(t * 3 + ph) > 0.4) tCircle(ctx, '#FFFFFF', fx + 2, gy - 70 * s, 3); }
        else { tRect(ctx, '#7A6A9A', fx - 5 * s, gy - 72 * s, 10 * s, 72 * s); tEll(ctx, '#B88AF0', fx, gy - 82 * s, 46 * s, 14 * s); tEll(ctx, '#E8C8FF', fx + 10 * s, gy - 90 * s, 28 * s, 9 * s); }
        break;
      case 12:
        if (kind < 0.3){ tEll(ctx, '#E8EAF0', fx, gy, 46 * s, 38 * s); tRect(ctx, '#D8B87A', fx - 54 * s, gy, 108 * s, 6); tRect(ctx, '#3A4A62', fx - 8 * s, gy - 14 * s, 16 * s, 14 * s); }
        else if (kind < 0.55){ tRect(ctx, '#9AA0AA', fx - 40 * s, gy - 40 * s, 80 * s, 40 * s); tPoly(ctx, '#7A808A', [fx - 46 * s, gy - 40 * s, fx, gy - 64 * s, fx + 46 * s, gy - 40 * s]); tRect(ctx, '#1A1E26', fx - 14 * s, gy - 22 * s, 28 * s, 22 * s); }
        else if (kind < 0.7){ const hv = Math.sin(t * 1.5 + ph) * 8; tEll(ctx, '#C9CDD9', fx, gy - 120 + hv, 30 * s, 8 * s); tEll(ctx, '#9FD8F2', fx, gy - 128 + hv, 12 * s, 7 * s); tEll(ctx, 'rgba(180,255,200,.25)', fx, gy - 62 + hv, 14 * s, 56); }
        else { tEll(ctx, '#B89A62', fx, gy - 8, 26 * s, 14 * s); tEll(ctx, '#C8AA72', fx - 6 * s, gy - 12, 14 * s, 7 * s); }
        break;
    }
  }
}
function flyTownStrip(ctx, R, cam, vw, t){
  const open = TOWN_IDS.filter(townOpen).filter(function(id){ return id !== 'runway'; });
  const gy = FLY_GROUND, n = open.length, step = (R.w - FLY_RUNWAY_LEN - 400) / Math.max(1, n);
  /* the runway at the start, painted like the film's */
  tRect(ctx, '#54505A', R.x0, gy - 4, FLY_RUNWAY_LEN, 14); tRect(ctx, '#6A6670', R.x0, gy - 4, FLY_RUNWAY_LEN, 3);
  for (let x = R.x0 + 30; x < R.x0 + FLY_RUNWAY_LEN - 40; x += 90) tRect(ctx, '#E8E0C8', x, gy + 2, 46, 3);
  for (let x = R.x0 + 20; x < R.x0 + FLY_RUNWAY_LEN; x += 70){ const on = Math.sin(t * 3 + x * 0.05) > -0.6; tCircle(ctx, on ? '#FFD060' : '#7A6A30', x, gy + 8, 2.6); }
  const hx = R.x0 + 700; ctx.fillStyle = '#7A6A5A'; ctx.fillRect(hx, gy - 70, 150, 70); ctx.fillStyle = '#6A5A4A'; ctx.beginPath(); ctx.moveTo(hx - 7, gy - 68); ctx.quadraticCurveTo(hx + 75, gy - 104, hx + 157, gy - 68); ctx.lineTo(hx + 157, gy - 64); ctx.lineTo(hx - 7, gy - 64); ctx.fill();
  ctx.fillStyle = '#1A1210'; ctx.fillRect(hx + 20, gy - 54, 110, 54); miniText(ctx, 'The Old Runway', R.x0 + 420, gy - 120, 16, '#FFF6E0');
  open.forEach(function(id, i){
    const x = R.x0 + FLY_RUNWAY_LEN + 200 + i * step + step / 2, D = TOWN_DIST[id];
    if (x < cam - 220 || x > cam + vw + 220) return;
    ctx.save(); ctx.translate(x, gy);
    ctx.fillStyle = 'rgba(0,0,0,.14)'; ctx.beginPath(); ctx.ellipse(0, 6, 90, 8, 0, 0, TAU); ctx.fill();
    switch (id){
      case 'square': tRect(ctx, '#B8A890', -14, -160, 28, 160); tPoly(ctx, '#8A4A3A', [-20, -160, 0, -194, 20, -160]); tCircle(ctx, '#FFFDF4', 0, -128, 10); tRect(ctx, '#E8E0D0', -78, -66, 50, 66); tPoly(ctx, '#D9D0BC', [-84, -66, -53, -88, -22, -66]); tRect(ctx, '#E2C7A0', 30, -54, 52, 54); tEll(ctx, '#6BAEE0', 0, -4, 24, 6); break;
      case 'market': for (let k = 0; k < 4; k++){ const hh = 54 + k % 2 * 22; tRect(ctx, ['#E9C9A0', '#D9B08A', '#E8D49E', '#C9D1A8'][k], -84 + k * 42, -hh, 38, hh); tPoly(ctx, '#A8442F', [-88 + k * 42, -hh, -65 + k * 42, -hh - 20, -42 + k * 42, -hh]); tRect(ctx, '#7A4B2A', -72 + k * 42, -26, 12, 26); } break;
      case 'park': tCircle(ctx, 'rgba(201,205,217,.0)', 0, -96, 1); ctx.strokeStyle = '#C9CDD9'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(0, -98, 52, 0, TAU); ctx.stroke(); tPoly(ctx, '#6A6F78', [-34, 0, 0, -98, 34, 0]); for (let k = 0; k < 8; k++){ const a = t * 0.2 + k * TAU / 8; tCircle(ctx, ['#D5352B', '#F2C230', '#4DA0D8', '#6BBB45'][k % 4], Math.cos(a) * 52, -98 + Math.sin(a) * 52, 5); } tEll(ctx, '#4F8A44', -84, -26, 28, 24); tEll(ctx, '#5E9E55', 82, -30, 30, 26); break;
      case 'harbour': tPoly(ctx, '#F4F1E8', [-14, 0, -10, -126, 10, -126, 14, 0]); tRect(ctx, '#D5352B', -12, -96, 24, 14); tRect(ctx, '#BFE8F8', -10, -140, 20, 14); tPoly(ctx, '#D5352B', [-16, -140, 0, -160, 16, -140]); tRect(ctx, '#4F86AA', -110, -8, 220, 10); tPoly(ctx, '#F4F1E8', [-90, -10, -60, -10, -66, -2, -84, -2]); break;
      case 'roofs': for (let k = 0; k < 5; k++){ tRect(ctx, '#9AA0B2', -76 + k * 34, -54 - k * 12, 28, 54 + k * 12); tRect(ctx, '#6A6F78', -64 + k * 34, -76 - k * 12, 2, 22); tRect(ctx, 'rgba(255,225,130,.8)', -70 + k * 34, -40 - k * 12, 6, 6); } break;
      case 'launch': tRect(ctx, '#8A93A8', 34, -170, 8, 170); tPoly(ctx, '#E8EAF0', [-16, 0, -9, -110, 0, -142, 9, -110, 16, 0]); tRect(ctx, '#D5352B', -9, -70, 18, 10); tEll(ctx, '#B8A890', 0, 2, 60, 8); break;
      case 'burrows': tEll(ctx, '#3A3A44', 0, -2, 40, 9); tEll(ctx, '#6A6A74', 0, -5, 32, 6); tRect(ctx, '#5A5A64', -16, -14, 32, 8); break;
    }
    ctx.restore();
    miniText(ctx, D.name, x, gy + 28, 13, '#FFF6E0');
  });
}
function flyDrawWorld(ctx, W, H, h){
  const sc = clamp(H / FLY_H, 0.5, 1.5), vw = W / sc, cam = Fly.cam, t = Fly.t, dark = townDark(h);
  const cx = cam + vw / 2, bl = flyBlendAt(cx), B1 = flyBiome(bl.a), B2 = flyBiome(bl.b);
  const shx = Fly.shake > 0 ? (Math.random() - 0.5) * 10 * Fly.shake : 0, shy = Fly.shake > 0 ? (Math.random() - 0.5) * 10 * Fly.shake : 0;
  ctx.save(); ctx.translate(shx, H - FLY_H * sc + shy); ctx.scale(sc, sc);
  /* sky: a little cloud deck at two depths */
  for (let l = 0; l < 2; l++){
    const par = l ? 0.35 : 0.18;
    for (let i = 0; i < 9; i++){
      const wx = (i * 420 + l * 190 + flyH(i, 20 + l) * 90) - (cam * par) % 3800, x = ((wx % 3800) + 3800) % 3800 - 200, y = 60 + flyH(i, 30 + l) * 260 + l * 70;
      ctx.fillStyle = 'rgba(255,255,255,' + (l ? 0.34 : 0.5).toFixed(2) + ')'; tEll(ctx, ctx.fillStyle, x, y, 90 + flyH(i, 40) * 50, 16 + l * 4); tEll(ctx, ctx.fillStyle, x + 50, y - 10, 56, 14);
    }
  }
  /* far mountains and hills at two speeds, in the colours of the place she is over (mixed at the boundaries) */
  const hill = blendHex(B1.hill, B2.hill, bl.k), mtn = blendHex(wardShade(hill, 0.7), '#8FA6C0', 0.35);
  ctx.fillStyle = mtn; ctx.beginPath(); ctx.moveTo(-40, FLY_GROUND);
  for (let sx = -40; sx <= vw + 40; sx += 40){ const wx = sx + cam * 0.25; ctx.lineTo(sx, FLY_GROUND - 150 - Math.abs(Math.sin(wx * 0.0031 + 1.2)) * 110 - Math.sin(wx * 0.011) * 18); }
  ctx.lineTo(vw + 40, FLY_GROUND); ctx.closePath(); ctx.fill();
  ctx.fillStyle = hill; ctx.beginPath(); ctx.moveTo(-40, FLY_GROUND);
  for (let sx = -40; sx <= vw + 40; sx += 40){ const wx = sx + cam * 0.5; ctx.lineTo(sx, FLY_GROUND - 80 - Math.sin(wx * 0.004 + 2) * 46 - Math.sin(wx * 0.013) * 16); }
  ctx.lineTo(vw + 40, FLY_GROUND); ctx.closePath(); ctx.fill();
  ctx.translate(-cam, 0);
  /* each region's ground: a rolling top edge, a gradient, detail on it; at each end the neighbour's colours fade in */
  Fly.regions.forEach(function(R, i){
    if (R.x1 < cam - 60 || R.x0 > cam + vw + 60) return;
    const B = FLY_BIOME[R.ch] || FLY_BIOME[0];
    const xa = Math.max(R.x0, cam - 40), xb = Math.min(R.x1, cam + vw + 40);
    const g = ctx.createLinearGradient(0, FLY_GROUND - 8, 0, FLY_H); g.addColorStop(0, B.g); g.addColorStop(1, B.g2);
    ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(xa, FLY_H + 4);
    for (let x = xa; x <= xb + 12; x += 12) ctx.lineTo(Math.min(x, xb), flyGroundY(x));
    ctx.lineTo(xb, FLY_H + 4); ctx.closePath(); ctx.fill();
    flyGroundDetail(ctx, R, B, xa, xb, t);
    if (R.ch === 4){ for (let x = xa; x < xb; x += 60){ ctx.fillStyle = 'rgba(255,255,255,.12)'; ctx.fillRect(x + (t * 14) % 60, FLY_GROUND + 14 + (x / 60 % 4) * 28, 30, 2); } }
    if (i > 0){ const pB = flyBiome(i - 1), gr = ctx.createLinearGradient(R.x0, 0, R.x0 + FLY_ZONE, 0); gr.addColorStop(0, pB.g); gr.addColorStop(1, 'rgba(0,0,0,0)'); ctx.save(); ctx.globalAlpha = 0.85; ctx.fillStyle = gr; ctx.beginPath(); ctx.moveTo(R.x0, FLY_H); for (let x = R.x0; x <= R.x0 + FLY_ZONE; x += 12) ctx.lineTo(x, flyGroundY(x)); ctx.lineTo(R.x0 + FLY_ZONE, FLY_H); ctx.closePath(); ctx.fill(); ctx.restore(); }
    if (i < Fly.regions.length - 1){ const nB = flyBiome(i + 1), gr = ctx.createLinearGradient(R.x1, 0, R.x1 - FLY_ZONE, 0); gr.addColorStop(0, nB.g); gr.addColorStop(1, 'rgba(0,0,0,0)'); ctx.save(); ctx.globalAlpha = 0.85; ctx.fillStyle = gr; ctx.beginPath(); ctx.moveTo(R.x1, FLY_H); for (let x = R.x1; x >= R.x1 - FLY_ZONE; x -= 12) ctx.lineTo(x, flyGroundY(x)); ctx.lineTo(R.x1 - FLY_ZONE, FLY_H); ctx.closePath(); ctx.fill(); ctx.restore(); }
    if (R.ch === 0) flyTownStrip(ctx, R, cam, vw, t); else flyFeatures(ctx, R, cam, vw, t);
  });
  /* the gateways between regions: two masts and a banner to fly through, with lights and a veil of mist */
  for (let i = 1; i < Fly.regions.length; i++){
    const R = Fly.regions[i], x = R.x0; if (R.noGate || x < cam - 200 || x > cam + vw + 200) continue;
    const P = Fly.regions[i - 1];
    tRect(ctx, '#C9CDD9', x - 90, FLY_GROUND - 300, 8, 300); tRect(ctx, '#C9CDD9', x + 82, FLY_GROUND - 300, 8, 300);
    ctx.fillStyle = 'rgba(14,18,30,.78)'; ctx.beginPath(); ctx.roundRect(x - 100, FLY_GROUND - 340, 200, 52, 10); ctx.fill();
    ctx.strokeStyle = '#FFD84D'; ctx.lineWidth = 2; ctx.stroke();
    miniText(ctx, 'leaving ' + P.name, x, FLY_GROUND - 318, 11, '#BFC8D8', 'center', false); miniText(ctx, 'entering ' + R.name, x, FLY_GROUND - 298, 15, '#FFFFFF');
    for (let k = 0; k < 9; k++){ const lx = x - 100 + k * 25; tCircle(ctx, Math.sin(t * 4 + k) > 0 ? '#FFE9A0' : '#8A7A40', lx, FLY_GROUND - 342, 3); }
    for (let k = 0; k < 6; k++){ const my = 120 + k * 56 + Math.sin(t * 0.7 + k) * 8; ctx.fillStyle = 'rgba(255,255,255,0.09)'; tEll(ctx, ctx.fillStyle, x + Math.sin(t * 0.5 + k) * 30, my, 130, 26); }
    if (R.ch > 0){ const done = townDoneCh(R.ch); miniText(ctx, 'Chapter ' + R.ch + (done ? ' · finished' : ' · not finished'), x, FLY_GROUND - 360, 12, done ? '#BFFF9A' : '#FFD0C0', 'center', false); }
  }
  const fg = ctx.createLinearGradient(Fly.end - 360, 0, Fly.end, 0); fg.addColorStop(0, 'rgba(235,240,250,0)'); fg.addColorStop(1, 'rgba(235,240,250,.96)'); ctx.fillStyle = fg; ctx.fillRect(Fly.end - 360, 0, 360, FLY_H);
  miniText(ctx, 'The edge of the map', Fly.end - 190, 240, 15, '#3A4A62');
  /* rings */
  Fly.rings.forEach(function(r){
    if (r.got || r.x < cam - 80 || r.x > cam + vw + 80) return;
    const pulse = 1 + Math.sin(t * 3 + r.ph) * 0.06;
    ctx.save(); ctx.translate(r.x, r.y); ctx.scale(pulse, pulse);
    ctx.strokeStyle = 'rgba(255,230,120,.35)'; ctx.lineWidth = 16; ctx.beginPath(); ctx.ellipse(0, 0, 18, 46, 0, 0, TAU); ctx.stroke();
    ctx.strokeStyle = '#FFD84D'; ctx.lineWidth = 6; ctx.beginPath(); ctx.ellipse(0, 0, 18, 46, 0, 0, TAU); ctx.stroke(); ctx.restore();
  });
  if (Fly.pop){ ctx.globalAlpha = 1 - Fly.pop.t / 1.2; miniText(ctx, Fly.pop.txt, Fly.pop.x, Fly.pop.y - Fly.pop.t * 40, 18, '#FFE9A0'); ctx.globalAlpha = 1; }
  if (typeof flyNightFX === 'function') flyNightFX(ctx, cam, vw, t, dark);
  if (Fly.mode === 'crash') flyDrawCrash(ctx, t);
  else {
    const alt = Math.max(0, FLY_GROUND - 46 - Fly.y), sh = clamp(1 - alt / 420, 0.2, 1);
    tEll(ctx, 'rgba(0,0,0,' + (0.28 * sh).toFixed(2) + ')', Fly.x, flyGroundY(Fly.x) - 2, 54 * sh + 12, 6);
    const buffet = Fly.stall ? Math.sin(Fly.t * 60) * 1.6 : 0;
    flyPlane(ctx, Fly.x, Fly.y + buffet, { flipScale: Fly.faceVis, bank: -Fly.th * Fly.face, prop: Fly.prop, t: t, s: 1.0, reach: Fly.stall ? 0.0 : 0.05 });
  }
  ctx.restore();
  /* the colour of the place over the whole picture, and the evening */
  const tn = B1.tint || [null, 0], tn2 = B2.tint || [null, 0], ta = lerp(tn[1] || 0, tn2[1] || 0, bl.k), tc = tn[0] && tn2[0] ? blendHex(tn[0], tn2[0], bl.k) : (tn[0] || tn2[0]);
  if (tc && ta > 0.005){ ctx.fillStyle = tc; ctx.globalAlpha = ta; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1; }
  if (dark > 0.01){ ctx.fillStyle = 'rgba(10,18,60,' + (dark * 0.35).toFixed(3) + ')'; ctx.fillRect(0, 0, W, H); }
}
function flyGauge(ctx, x, y, w, h, v, lo, hi, red, label){
  ctx.fillStyle = 'rgba(14,10,8,.62)'; ctx.beginPath(); ctx.roundRect(x - 4, y - 16, w + 8, h + 22, 6); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,.14)'; ctx.fillRect(x, y, w, h);
  ctx.fillStyle = 'rgba(255,90,70,.55)'; ctx.fillRect(x, y, w * (red / hi), h);
  ctx.fillStyle = 'rgba(120,230,120,.4)'; ctx.fillRect(x + w * (FV.stall + 20) / hi, y, w * (FV.cruise + 60 - FV.stall - 20) / hi, h);
  ctx.fillStyle = '#FFF6E0'; ctx.fillRect(x + clamp(v / hi, 0, 1) * w - 1.5, y - 3, 3, h + 6);
  ctx.fillStyle = '#E8D8B0'; ctx.font = '600 11px system-ui,sans-serif'; ctx.textAlign = 'left'; ctx.fillText(label, x, y - 4);
}
function renderFly(ctx){
  const W = G.W, H = G.H, h = townHour();
  townDrawSky(ctx, W, H, h, {});
  flyDrawWorld(ctx, W, H, h);
  const s = clamp(Math.min(H / 700, W / 760), 0.8, 1.2), R = Fly.regions[Math.max(0, Fly.reg)] || { name: '', ch: 0 };
  if (Fly.mode === 'crash'){
    const u = Fly.crash.t, cap = u < 1.0 ? 'Crash!' : u < 3.2 ? 'A plane is coming in...' : u < 4.8 ? '“Hang on! I’m coming down!”' : u < 6.6 ? '“Hop in. The plane’s fine. You, less so.”' : '“We’ll fetch the wreck tomorrow.”';
    miniText(ctx, cap, W / 2, H - 40 * s, 20 * s, '#FFF6E0');
    miniText(ctx, 'Enter to skip', W - 14, H - 14, 12, '#C9B890', 'right', false);
    if (u > FLY_RESCUE_END - 1.2){ ctx.fillStyle = 'rgba(8,6,5,' + clamp((u - (FLY_RESCUE_END - 1.2)) / 1.2, 0, 1).toFixed(2) + ')'; ctx.fillRect(0, 0, W, H); }
    if (u < 0.35){ ctx.fillStyle = 'rgba(255,240,200,' + (0.8 * (1 - u / 0.35)).toFixed(2) + ')'; ctx.fillRect(0, 0, W, H); }
    return;
  }
  ctx.fillStyle = 'rgba(14,10,8,.5)'; ctx.beginPath(); ctx.roundRect(10, 10, Math.min(W - 130, 330 * s), 54 * s, 10); ctx.fill();
  miniText(ctx, R.name, 22, 36 * s, 20 * s, '#FFE9A0', 'left');
  miniText(ctx, R.sub ? R.sub : R.ch ? 'Chapter ' + R.ch + (townDoneCh(R.ch) ? ' · finished' : ' · not finished') : 'Where it all starts', 22, 55 * s, 12.5 * s, '#E8D8B0', 'left', false);
  miniText(ctx, 'Rings ' + Fly.got + '  ·  ' + fmt(Fly.earned) + ' gold', W - 14, 28 * s, 14 * s, '#FFE9A0', 'right');
  const bw = 100 * s, bh = 34 * s, bx = W - 10 - bw, by = 44 * s;
  ctx.fillStyle = 'rgba(14,10,8,.62)'; ctx.beginPath(); ctx.roundRect(bx, by, bw, bh, 8); ctx.fill(); ctx.strokeStyle = 'rgba(242,179,61,.5)'; ctx.lineWidth = 1.2; ctx.stroke();
  ctx.fillStyle = '#FFF6E0'; ctx.font = 'bold ' + Math.round(12.5 * s) + 'px system-ui,sans-serif'; ctx.textAlign = 'center'; ctx.fillText(Input.hasTouch ? 'Leave' : 'Leave (Esc)', bx + bw / 2, by + bh / 2 + 4.5); Fly.landBtn = { x: bx, y: by, w: bw, h: bh };
  /* the instruments: airspeed (red below the stall), throttle, height, and the warnings */
  const gx = 14, gy = H - 56 * s;
  flyGauge(ctx, gx, gy, 150 * s, 10 * s, Fly.v, 0, 360, FV.stall, 'AIRSPEED  ' + Math.round(Fly.v));
  flyGauge(ctx, gx + 170 * s, gy, 110 * s, 10 * s, Fly.thr * 360, 0, 360, 0, 'THROTTLE  ' + Math.round(Fly.thr * 100) + '%');
  miniText(ctx, 'HEIGHT ' + Math.max(0, Math.round(FLY_GROUND - 46 - Fly.y)), gx + 300 * s, gy + 10 * s, 12 * s, '#E8D8B0', 'left', false);
  if (Fly.stall && Math.sin(Fly.t * 14) > 0) miniText(ctx, 'STALL', W / 2, H * 0.22, 34 * s, '#FF5A4A');
  else if (Fly.onGround && Fly.v > FV.rotate * 0.85 && Fly.v < FV.rotate + 40 && Fly.t > 0.5) miniText(ctx, 'ROTATE: pull up', W / 2, H * 0.22, 22 * s, '#BFFF9A');
  if (Fly.bannerT > 0 && Fly.reg >= 0){ ctx.globalAlpha = Math.min(1, Fly.bannerT, (3.4 - Fly.bannerT) * 3); miniText(ctx, R.name, W / 2, H * 0.32, 38 * s, '#FFF6E0'); ctx.globalAlpha = 1; }
  if (Fly.t < 9) miniText(ctx, Input.hasTouch ? 'Hold a finger where you want to fly.' : 'Right: throttle  ·  hold it, then pull Up at ' + FV.rotate + ' to take off  ·  Down: nose down  ·  F: turn  ·  Esc: leave', W / 2, H - 18 * s, 13 * s, '#E8D8B0', 'center', false);
  drawFade(ctx);
}

/* ---- joining the loop ---- */
(function(){
  const st = step, rn = render;
  step = function(dt){ if (Fly.on && G.state === 'fly') updateFly(dt); return st(dt); };
  render = function(){
    if (Fly.on && G.state === 'fly'){ const ctx = CTX; if (!ctx) return; ctx.setTransform(G.dpr, 0, 0, G.dpr, 0, 0); ctx.globalAlpha = 1; ctx.fillStyle = STAGE_BG; ctx.fillRect(0, 0, G.W, G.H); renderFly(ctx); return; }
    return rn.apply(this, arguments);
  };
  const t = GUIDE_TOPICS.find(function(x){ return x.id === 'town'; });
  if (t){ const base = t.html; t.html = function(){ return base().replace('</ul>', '<li><b>The Old Runway</b> is the last street, at the far right of town, and is open from the start (the tram goes straight there). Wingnut sells a small <b>propeller plane</b>. Take off from anywhere on the runway: the right and left keys are the throttle, up and down the elevator, F turns her round. Pull up too early and she <b>stalls</b>; come down too hard, or too fast off the runway, and she crashes (another giraffe will pick her up). Fly over the town and the chapters that are on the Earth (the Changed Savannah once Chapter 10 is finished, Area 51 once Chapter 11 is). Gold rings hang in the sky. Esc leaves the flight.</li></ul>'); }; }
})();
