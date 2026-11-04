'use strict';
/* =============================================================================================================================
   44zzzzh-town-critters.js  --  A LITTLE LIFE ON THE STREETS AND IN THE ROOMS. Pigeons peck along the pavement of the Town Square,
   Market Street and the park path, and gulls stand on the harbor quay; when she walks up they lift off, and a while later they come
   back down. After dark the birds have gone to roost. In a few of the cosier rooms a cat sleeps on the floor, breathing slowly.
   All of it is drawn in townDynamic (the tier for things that move: under the herd, over the street's pictures).
   ============================================================================================================================= */
const TOWN_BIRDS = {                                                     /* street: [x, how many, kind] */
  square: [[880, 3], [1540, 2], [2240, 3]],
  market: [[1130, 2], [1960, 3], [2860, 2]],
  park: [[720, 3], [1320, 2], [2300, 2]],
  harbour: [[620, 2, 'gull'], [1420, 2, 'gull']]
};
const TOWN_CATS = { in_bakery: [1010, 1, '#E8A050'], in_library: [1310, -1, '#3A3A40'], in_house1: [640, 1, '#C9C4B8'], in_fhouse: [930, -1, '#E8A050'], in_icottage: [760, 1, '#F4F1E8'] };

/* one bird, standing (flap undefined) or flying (flap -1..1); k is how far its head is down, pecking */
function townBird(ctx, x, y, face, k, gull, flap){
  const body = gull ? '#F4F4F0' : '#8A8E9A', wing = gull ? '#A8B0BC' : '#6A6E7A', head = gull ? '#F4F4F0' : '#5A6070', hy = -10 + k * 6;
  ctx.save(); ctx.translate(x, y); ctx.scale(face * (gull ? 1.4 : 1), gull ? 1.4 : 1);
  if (flap === undefined){ tRect(ctx, '#D5703A', -2, -2.5, 1.4, 3); tRect(ctx, '#D5703A', 1, -2.5, 1.4, 3); }
  tPoly(ctx, wing, [-5, -7, -11, -9, -10, -5]);                                                       /* the tail */
  tEll(ctx, body, 0, -6, 7, 4.5);
  if (flap === undefined) tEll(ctx, wing, -1, -6.5, 5, 3);
  else { tPoly(ctx, wing, [-4, -7, 3, -7, -1, -7 - 9 * flap]); }
  if (!gull) tCircle(ctx, 'rgba(120,200,160,.55)', 4.6, hy + 2.6, 1.8);                              /* a pigeon's green neck */
  tCircle(ctx, head, 6, hy, 2.8); tPoly(ctx, gull ? '#F2C230' : '#3A3A44', [8.4, hy - 0.6, 11, hy + 0.4, 8.4, hy + 1.2]); tCircle(ctx, '#111', 6.8, hy - 0.6, 0.7);
  ctx.restore();
}
/* a cat asleep, curled up, its back rising and falling */
function townCat(ctx, x, y, face, col, t){
  const s = 1 + 0.035 * Math.sin(t * 1.6), dk = col === '#3A3A40' ? '#2A2A30' : 'rgba(0,0,0,.18)';
  ctx.save(); ctx.translate(x, y); ctx.scale(face, 1);
  tEll(ctx, 'rgba(0,0,0,.18)', 0, 1, 20, 4);
  ctx.strokeStyle = col; ctx.lineWidth = 4; ctx.lineCap = 'round'; ctx.beginPath(); ctx.arc(-4, -3, 14, 0.2, 1.9); ctx.stroke(); ctx.lineCap = 'butt';   /* the tail round the front */
  tEll(ctx, col, -2, -8 * s, 16, 8.5 * s); tEll(ctx, dk, -6, -11 * s, 7, 3);
  tCircle(ctx, col, 12, -7, 6.2); tPoly(ctx, col, [8, -11, 9.5, -17, 12.5, -12]); tPoly(ctx, col, [13, -12, 16.5, -16.5, 17, -10.5]);
  ctx.strokeStyle = '#2A2A30'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(12.5, -7); ctx.quadraticCurveTo(14.5, -5.6, 16.5, -7); ctx.stroke();   /* a shut eye */
  tCircle(ctx, '#E8A0A8', 17.6, -5.4, 1);
  ctx.restore();
}

(function(){
  const dy = townDynamic;
  townDynamic = function(ctx, D, t, dark){
    dy.apply(this, arguments);
    const cat = TOWN_CATS[D.id];
    if (cat) townCat(ctx, cat[0], TG + 16, cat[1], cat[2], t);
    const flocks = TOWN_BIRDS[D.id];
    if (!flocks || dark > 0.55) return;
    const st = Town._birds || (Town._birds = {}), V = townView(), cam = Town.camX;
    flocks.forEach(function(f, j){
      const fx = f[0], n = f[1], gull = f[2] === 'gull', key = D.id + j, s = st[key] || (st[key] = { up: -1 });
      const near = Math.abs(Town.x - fx) < 110;
      if (s.up < 0 && near) s.up = t;                                                              /* she came close: off they go */
      let p = 0;                                                                                  /* 0 on the ground, 1 out of sight */
      if (s.up >= 0){
        const e = t - s.up;
        if (e < 1.6) p = e / 1.6; else if (e < 12) p = 1; else if (e < 13.6){ if (near){ s.up = t - 1.6; p = 1; } else p = 1 - (e - 12) / 1.6; } else s.up = -1;
      }
      if (fx < cam - 300 || fx > cam + V.vw + 300 || p >= 1) return;
      for (let i = 0; i < n; i++){
        const bx = fx + (i - (n - 1) / 2) * (gull ? 26 : 16) + Math.sin(t * 0.3 + i * 2.1) * 6, face = Math.sin(t * 0.2 + i * 2 + j) > 0 ? 1 : -1, by = TG + (gull ? 8 : 16) + (i % 2) * 4;
        if (p <= 0) townBird(ctx, bx, by, face, Math.pow(Math.max(0, Math.sin(t * 3 + i * 1.7 + j)), 4), gull);
        else { const dir = i % 2 ? 1 : -1; townBird(ctx, bx + dir * p * 180, by - p * p * 260 - p * 20, dir, 0, gull, Math.sin(t * 28 + i)); }
      }
    });
  };
})();
