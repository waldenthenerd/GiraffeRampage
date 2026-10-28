'use strict';
/* =============================================================================================================================
   44zv-gym-art.js  --  Longneck Fitness, the painting: the big building on Market Street, the gym floor, every machine, the new gym hats
   and boots. Pure drawing (the rules are in 44zu-training-gym.js).

   GYM_KINDS (a table of painters, like FR_KINDS) draws each machine from a floor-standing frame: nothing hangs in the air, every bar and
   rail joins a post or the floor. The parts that move (the punch bag, the treadmill belt, the bike wheel, the rower seat, the barbell on the
   bench, the sparring partner, the steam) are drawn live by 44zu from the same coordinates (gymMachineDraw). IV_ROOMS.gym is the wall and
   floor dressing (mirrors, tier banners, rubber mats and floor tape); the generic windows are switched off for this room.
   ============================================================================================================================= */
const GYM_COL = { basic: '#4DB8FF', plus: '#6BE08A', pro: '#FFC83D', longneck: '#FF8A3D', legend: '#E85DFF' };
const GYM_KINDS = {
  gm_desk: function(c, D, b){
    const x0 = b.x - b.w / 2, W = b.w;
    ivShadow(c, b.x, W + 20);
    tRect(c, '#2B3040', x0, TG - 98, W, 98); tRect(c, '#3A4256', x0 + 8, TG - 90, W - 16, 82); tRect(c, '#FF8A3D', x0 + 8, TG - 58, W - 16, 6);
    ivText(c, 'DAY PASSES', b.x, TG - 66, 18, '#FFF6E0');
    for (let i = 0; i < 5; i++){ tRound(c, ['#4DB8FF', '#6BE08A', '#FFC83D', '#FF8A3D', '#E85DFF'][i], x0 + 30 + i * ((W - 80) / 4), TG - 42, 26, 18, 3); tRect(c, 'rgba(255,255,255,.4)', x0 + 33 + i * ((W - 80) / 4), TG - 39, 14, 2); }
    tRect(c, '#E8E4DC', x0 - 6, TG - 108, W + 12, 12); tRect(c, 'rgba(0,0,0,.14)', x0 - 6, TG - 98, W + 12, 2);
    tRect(c, '#1E2230', x0 + 24, TG - 124, 8, 16); tRound(c, '#0E1220', x0 + 2, TG - 176, 54, 54, 5); tRound(c, '#6BD6FF', x0 + 7, TG - 171, 44, 40, 3);                 /* the monitor, on its stand */
    c.strokeStyle = '#0E1220'; c.lineWidth = 2; for (let k = 0; k < 4; k++){ c.beginPath(); c.moveTo(x0 + 12, TG - 164 + k * 8); c.lineTo(x0 + 12 + 14 + (k % 2) * 12, TG - 164 + k * 8); c.stroke(); }
    tRound(c, '#D5352B', x0 + W - 46, TG - 120, 26, 12, 6); tRect(c, '#8A8E98', x0 + W - 36, TG - 108, 6, 4);                                                       /* the bell */
    tRound(c, '#3A4256', x0 + W - 110, TG - 134, 44, 26, 3); ivText(c, '1 DAY', x0 + W - 88, TG - 116, 12, '#FFD84D');
  },
  gm_board: function(c, D, b){
    const x0 = b.x - b.w / 2, W = b.w;
    ivShadow(c, b.x, W);
    ivLine(c, '#4A4F5C', 6, x0 + 30, TG - 166, x0 + 8, TG); ivLine(c, '#4A4F5C', 6, x0 + W - 30, TG - 166, x0 + W - 8, TG); ivLine(c, '#4A4F5C', 5, b.x, TG - 160, b.x, TG - 8); tRect(c, '#4A4F5C', x0 + 4, TG - 10, W - 8, 10);
    tRound(c, '#2B3040', x0 + 4, TG - 246, W - 8, 140, 8); tRound(c, '#1A1E2C', x0 + 10, TG - 240, W - 20, 128, 5);
    ivText(c, 'GAINS BOARD', b.x, TG - 218, 16, '#FFD84D');
    const cs = ['#4DB8FF', '#4DB8FF', '#6BE08A', '#6BE08A', '#FFC83D', '#FFC83D', '#FF8A3D', '#FF8A3D', '#E85DFF', '#E85DFF'];
    for (let i = 0; i < 10; i++){ const h = 14 + ((i * 37) % 7) * 9; tRect(c, cs[i], x0 + 24 + i * ((W - 56) / 10), TG - 118 - h, (W - 56) / 10 - 4, h); }
    tRect(c, 'rgba(255,255,255,.3)', x0 + 22, TG - 118, W - 44, 2);
  },
  gm_free: function(c, D, b){
    const x0 = b.x - b.w / 2, W = b.w;
    ivShadow(c, b.x, W);
    tRect(c, '#3A3F4A', x0 + 4, TG - 8, W - 8, 8);
    tRect(c, '#4A5062', x0 + 10, TG - 176, 10, 176); tRect(c, '#4A5062', x0 + W - 20 - 66, TG - 176, 10, 176);
    for (let r = 0; r < 3; r++){
      const y = TG - 40 - r * 56; tRect(c, '#2B3040', x0 + 10, y, W - 96, 8); tRect(c, 'rgba(255,255,255,.14)', x0 + 10, y, W - 96, 2);
      for (let i = 0; i < 3; i++){ const hx = x0 + 34 + i * 40, hs = 8 + r * 3 + i; ivLine(c, '#C9CDD9', 3, hx - 12, y - hs, hx + 12, y - hs); tRound(c, ['#4DB8FF', '#6BE08A', '#FFC83D'][(r + i) % 3], hx - 18, y - hs * 2, 10, hs * 2, 3); tRound(c, ['#4DB8FF', '#6BE08A', '#FFC83D'][(r + i) % 3], hx + 8, y - hs * 2, 10, hs * 2, 3); tRect(c, 'rgba(0,0,0,.2)', hx - 18, y - 2, 36, 2); }
    }
    tRect(c, '#4A5062', x0 + W - 52, TG - 130, 6, 130); tRect(c, '#2B3040', x0 + W - 66, TG - 6, 34, 6);                                                     /* the plate tree */
    for (let k = 0; k < 4; k++) tRound(c, ['#D5352B', '#2F5F94', '#F2C230', '#6BE08A'][k], x0 + W - 70 + (k % 2) * 3, TG - 20 - k * 26, 28, 8, 3);
  },
  gm_tread: function(c, D, b){
    const x0 = b.x - b.w / 2, W = b.w;
    ivShadow(c, b.x, W);
    tRound(c, '#23262F', x0, TG - 30, W - 60, 22, 8); tRect(c, '#1A1C24', x0 + 6, TG - 30, W - 72, 6);                                                         /* deck and belt */
    c.strokeStyle = 'rgba(255,255,255,.1)'; c.lineWidth = 2; for (let x = x0 + 14; x < x0 + W - 70; x += 20){ c.beginPath(); c.moveTo(x, TG - 30); c.lineTo(x - 6, TG - 12); c.stroke(); }
    tRect(c, '#4A5062', x0 + 10, TG - 8, 14, 8); tRect(c, '#4A5062', x0 + W - 80, TG - 8, 14, 8);
    tRect(c, '#4A5062', x0 + W - 66, TG - 176, 12, 176 - 8); tRect(c, '#3A3F4A', x0 + W - 74, TG - 12, 28, 12);                                             /* the console post, standing on the floor */
    ivLine(c, '#8A8E98', 6, x0 + W - 60, TG - 108, x0 + 36, TG - 100); ivLine(c, '#8A8E98', 5, x0 + 36, TG - 100, x0 + 36, TG - 30);                        /* the handrail */
    tRound(c, '#0E1220', x0 + W - 98, TG - 200, 78, 52, 6); tRound(c, '#0B3A4A', x0 + W - 92, TG - 194, 66, 38, 4);
    ivText(c, '12.0 km/h', x0 + W - 59, TG - 170, 11, '#6BFFE8'); tRect(c, '#6BFFE8', x0 + W - 88, TG - 164, 56, 2);
  },
  gm_bench: function(c, D, b){
    const x0 = b.x - b.w / 2, W = b.w;
    ivShadow(c, b.x, W);
    tRect(c, '#3A3F4A', x0 + 30, TG - 6, W - 60, 6);
    tRect(c, '#4A5062', x0 + 36, TG - 52, 10, 46); tRect(c, '#4A5062', x0 + W - 46, TG - 52, 10, 46);
    tRound(c, '#1E1E26', x0 + 24, TG - 66, W - 48, 20, 8); tRect(c, 'rgba(255,255,255,.14)', x0 + 34, TG - 64, W - 68, 3);
    tRect(c, '#4A5062', x0 + 12, TG - 170, 10, 170); tRect(c, '#4A5062', x0 + W - 22, TG - 170, 10, 170); tRect(c, '#3A3F4A', x0 + 2, TG - 8, 30, 8); tRect(c, '#3A3F4A', x0 + W - 32, TG - 8, 30, 8);
    tPoly(c, '#8A8E98', [x0 + 22, TG - 132, x0 + 38, TG - 132, x0 + 38, TG - 124, x0 + 22, TG - 116]); tPoly(c, '#8A8E98', [x0 + W - 22, TG - 132, x0 + W - 38, TG - 132, x0 + W - 38, TG - 124, x0 + W - 22, TG - 116]);
  },
  gm_bag: function(c, D, b){
    const x0 = b.x - b.w / 2, W = b.w;
    ivShadow(c, b.x + 30, W);
    tRound(c, '#3A3F4A', b.x - 10, TG - 14, 118, 14, 5); tRect(c, '#4A5062', b.x + 84, TG - 262, 14, 252);
    tRect(c, '#4A5062', b.x - 10, TG - 262, 104, 12); tRect(c, '#2B3040', b.x - 12, TG - 268, 14, 24);
    ivLine(c, '#4A5062', 6, b.x + 90, TG - 70, b.x + 30, TG - 14);
    tRound(c, '#E85D4A', b.x + 100, TG - 130, 22, 40, 4); tRound(c, '#1A1E2C', b.x + 104, TG - 124, 14, 12, 2);                                              /* a speed bag box */
    tRect(c, '#4A5062', b.x + 92, TG - 90, 14, 6);
    tRound(c, '#D5352B', b.x - 134, TG - 6, 126, 6, 3);                                                                                                       /* the mat she stands on */
  },
  gm_row: function(c, D, b){
    const x0 = b.x - b.w / 2, W = b.w;
    ivShadow(c, b.x, W);
    tRect(c, '#3A3F4A', x0 + 6, TG - 8, 30, 8); tRect(c, '#3A3F4A', x0 + W - 80, TG - 8, 70, 8);
    tRect(c, '#4A5062', x0 + 16, TG - 36, 10, 30); tRect(c, '#4A5062', x0 + W - 60, TG - 36, 10, 30);
    tRound(c, '#8A8E98', x0 + 10, TG - 44, W - 70, 10, 4); tRect(c, 'rgba(255,255,255,.3)', x0 + 14, TG - 43, W - 78, 2);                                      /* the rail */
    tRect(c, '#4A5062', x0 + W - 108, TG - 88, 8, 46); tRect(c, '#2B3040', x0 + W - 112, TG - 90, 40, 6);                                                    /* the foot rest */
    tCircle(c, '#2B3040', x0 + W - 34, TG - 74, 40); tCircle(c, '#1A1E2C', x0 + W - 34, TG - 74, 34);
    c.strokeStyle = '#8A8E98'; c.lineWidth = 2; for (let k = 0; k < 8; k++){ const a = k * TAU / 8; c.beginPath(); c.moveTo(x0 + W - 34, TG - 74); c.lineTo(x0 + W - 34 + Math.cos(a) * 33, TG - 74 + Math.sin(a) * 33); c.stroke(); }
    tCircle(c, '#D5352B', x0 + W - 34, TG - 74, 7);
    tRect(c, '#4A5062', x0 + W - 44, TG - 36, 20, 30);
    tRound(c, '#0E1220', x0 + W - 90, TG - 156, 46, 28, 4); tRound(c, '#0B3A4A', x0 + W - 86, TG - 152, 38, 20, 3); tRect(c, '#4A5062', x0 + W - 70, TG - 128, 6, 40);
  },
  gm_yoga: function(c, D, b){
    const x0 = b.x - b.w / 2, W = b.w;
    ivShadow(c, b.x, W);
    tRound(c, '#6A3AA8', x0 + 4, TG - 9, W - 80, 9, 4); tRect(c, 'rgba(255,255,255,.22)', x0 + 12, TG - 8, W - 96, 2);
    tCircle(c, '#38C8B0', x0 + W - 36, TG - 36, 36); c.strokeStyle = 'rgba(255,255,255,.35)'; c.lineWidth = 2; c.beginPath(); c.arc(x0 + W - 36, TG - 36, 26, 3.6, 5.2); c.stroke();
    tRound(c, '#E8C060', x0 + W - 98, TG - 22, 34, 22, 4); tRound(c, '#D8A840', x0 + W - 94, TG - 40, 26, 18, 4);
    tEll(c, '#2B7A6A', x0 + W - 70, TG - 4, 18, 4);
    for (let i = 0; i < 3; i++){ tEll(c, ['#E85DFF', '#6BE08A', '#4DB8FF'][i], x0 + W - 124, TG - 10 - i * 14, 20, 7); tCircle(c, 'rgba(255,255,255,.4)', x0 + W - 142, TG - 10 - i * 14, 4); }
  },
  gm_pull: function(c, D, b){
    const x0 = b.x - b.w / 2, W = b.w;
    ivShadow(c, b.x, W + 20);
    tRect(c, '#3A3F4A', x0, TG - 10, W, 10);
    tRect(c, '#4A5062', x0 + 14, TG - 360, 12, 352); tRect(c, '#4A5062', x0 + W - 26, TG - 360, 12, 352);
    tRect(c, '#4A5062', x0 + 14, TG - 360, W - 28, 12); tRect(c, '#C9CDD9', x0 + 30, TG - 364, W - 60, 6); tRect(c, '#D5352B', x0 + 70, TG - 366, W - 140, 10);
    ivLine(c, '#4A5062', 7, x0 + 20, TG - 120, x0 + W - 20, TG - 120);
    tRect(c, '#4A5062', x0 + 14, TG - 200, 28, 8); tRect(c, '#4A5062', x0 + W - 42, TG - 200, 28, 8);
    ivLine(c, '#4A5062', 6, x0 + 20, TG - 300, x0 + 64, TG - 360);
  },
  gm_bike: function(c, D, b){
    const x0 = b.x - b.w / 2, W = b.w;
    ivShadow(c, b.x, W);
    tRect(c, '#3A3F4A', x0 + 8, TG - 8, 40, 8); tRect(c, '#3A3F4A', x0 + W - 70, TG - 8, 60, 8);
    ivLine(c, '#E8552B', 9, x0 + 30, TG - 8, x0 + 50, TG - 112); ivLine(c, '#E8552B', 9, x0 + 50, TG - 112, x0 + W - 70, TG - 66);
    ivLine(c, '#E8552B', 9, x0 + W - 70, TG - 66, x0 + W - 44, TG - 8); ivLine(c, '#E8552B', 8, x0 + W - 70, TG - 66, x0 + W - 52, TG - 150); ivLine(c, '#8A8E98', 6, x0 + W - 52, TG - 150, x0 + W - 24, TG - 154);
    tRound(c, '#1E1E26', x0 + 18, TG - 124, 54, 14, 7); ivLine(c, '#8A8E98', 6, x0 + 50, TG - 112, x0 + 46, TG - 124);
    tRect(c, '#2B3040', x0 + W - 36, TG - 162, 10, 22); tRound(c, '#0E1220', x0 + W - 52, TG - 190, 46, 24, 4); tRound(c, '#0B3A4A', x0 + W - 48, TG - 186, 38, 16, 3);
    tCircle(c, '#D5352B', x0 + W - 76, TG - 100, 6);
  },
  gm_ring: function(c, D, b){
    const x0 = b.x - b.w / 2, W = b.w;
    ivShadow(c, b.x, W + 30);
    tRect(c, '#2B3040', x0, TG - 40, W, 40); tRect(c, '#D5352B', x0, TG - 40, W, 8); tRect(c, '#E85D4A', x0, TG - 32, W, 4); tRect(c, 'rgba(255,255,255,.2)', x0, TG - 40, W, 2);
    for (let i = 0; i < 6; i++) tRect(c, 'rgba(255,255,255,.12)', x0 + 14 + i * ((W - 28) / 6), TG - 28, 3, 28);
    tRect(c, '#5A6AA8', x0 + 4, TG - 46, W - 8, 8);
    for (let k = 0; k < 2; k++){ const px = k ? x0 + W - 22 : x0 + 10; tRect(c, '#C9CDD9', px, TG - 200, 12, 160); tRound(c, k ? '#2F5F94' : '#D5352B', px - 4, TG - 150, 20, 70, 5); }
    [['#D5352B', 160], ['#F4F1E8', 120], ['#2F5F94', 80]].forEach(function(r){ ivLine(c, r[0], 4, x0 + 16, TG - r[1] - 40 + 40, x0 + W - 16, TG - r[1] - 40 + 40); });
    tRound(c, '#E8C060', x0 + W - 12, TG - 118, 30, 12, 6); ivLine(c, '#8A8E98', 3, x0 + W + 3, TG - 108, x0 + W + 3, TG - 78);
    tRect(c, '#3A3F4A', x0 + W - 6, TG - 86, 44, 6); tRect(c, '#3A3F4A', x0 + W + 12, TG - 80, 8, 80);                                                          /* the bell on its post */
    for (let i = 0; i < 3; i++) tRect(c, '#4A5062', x0 - 40 + i * 14, TG - 14 - i * 12, 40 - i * 14, 12 + i * 12 - (i ? 0 : 0));                              /* steps up to the apron */
  },
  gm_sauna: function(c, D, b){
    const x0 = b.x - b.w / 2, W = b.w;
    ivShadow(c, b.x, W + 10);
    tRect(c, '#7A5230', x0, TG - 290, W, 290); tRect(c, '#9A6A3E', x0 + 18, TG - 270, W - 36, 262);
    for (let i = 0; i < 12; i++) tRect(c, 'rgba(0,0,0,.14)', x0 + 18 + i * ((W - 36) / 12), TG - 270, 2, 262);
    tRect(c, '#5A3A1E', x0 - 8, TG - 300, W + 16, 14); tRect(c, 'rgba(255,255,255,.18)', x0 - 8, TG - 300, W + 16, 2);
    tRect(c, '#6A4524', x0 + 18, TG - 134, W - 36, 8); tRect(c, '#6A4524', x0 + 18, TG - 78, 150, 8);
    tRect(c, '#5A3A1E', x0 + 30, TG - 126, 8, 120); tRect(c, '#5A3A1E', x0 + 140, TG - 70, 8, 62);
    tRect(c, '#3A2A1E', x0 + W - 74, TG - 62, 42, 62); tRound(c, '#5A5E68', x0 + W - 70, TG - 82, 34, 20, 4);
    for (let i = 0; i < 5; i++) tCircle(c, ['#6E6E78', '#8A8A94', '#5A5A64'][i % 3], x0 + W - 66 + i * 7, TG - 88, 6);
    tRect(c, '#3A2A1E', x0 + W - 52, TG - 124, 4, 44);
    tRound(c, '#E8E0C8', x0 + 80, TG - 250, 18, 44, 4); tRect(c, '#D5352B', x0 + 87, TG - 244, 4, 32); ivText(c, '80°', x0 + 89, TG - 256, 12, '#FFE9A0');
    tRound(c, '#6A4524', x0 + W - 86, TG - 250, 62, 30, 4); ivText(c, 'SAUNA', x0 + W - 55, TG - 230, 14, '#FFE9A0');
  }
};

/* ---- the painters hooked in: street front, rooms, machines ---- */
(function(){
  const bx = townBuildingX;
  townBuildingX = function(c, D, b, P, r){
    if (b.kind === 'gym_front'){
      const x = b.x, W = b.w, h = b.h, x0 = x - W / 2;
      c.save();
      tEll(c, 'rgba(0,0,0,.2)', x, TG + 6, W / 2 + 14, 8);
      tRect(c, '#B26A46', x0, TG - h, W, h); if (window.townDetailKit) townDetailKit.bricks(c, x0, TG - h, W, h, 9, 22, 77);                       /* brick, like the rest of the street */
      tRect(c, '#8A4A32', x0, TG - h, W, 40); tRect(c, '#E8B83A', x0, TG - h + 40, W, 8);                                                                       /* the roofline and the orange stripe */
      tRect(c, '#5A3022', x0 - 10, TG - h - 14, W + 20, 16); tRect(c, 'rgba(255,255,255,.12)', x0 - 10, TG - h - 14, W + 20, 2);
      /* the neon sign */
      tRound(c, '#12141C', x - 250, TG - h + 4, 500, 34, 8); c.save(); c.shadowColor = '#FF8A3D'; c.shadowBlur = 14; ivText(c, 'LONGNECK FITNESS', x, TG - h + 30, 26, '#FFB070'); c.restore();
      /* a barbell on the roof */
      ivLine(c, '#8A8E98', 6, x - 60, TG - h - 40, x + 60, TG - h - 40); tRound(c, '#D5352B', x - 76, TG - h - 62, 14, 44, 4); tRound(c, '#D5352B', x + 62, TG - h - 62, 14, 44, 4); tRound(c, '#F2C230', x - 90, TG - h - 52, 12, 24, 3); tRound(c, '#F2C230', x + 78, TG - h - 52, 12, 24, 3);
      ivLine(c, '#4A4F5C', 5, x - 40, TG - h - 40, x - 40, TG - h - 14); ivLine(c, '#4A4F5C', 5, x + 40, TG - h - 40, x + 40, TG - h - 14);
      /* the big front windows, with the weights seen through them */
      const wy = TG - h + 74, wh = 130;
      for (let i = 0; i < 5; i++){
        const wx = x0 + 28 + i * 118; if (i === 2) continue;
        tRect(c, '#12141C', wx - 4, wy - 4, 112, wh + 8); tRect(c, '#9FD0E8', wx, wy, 104, wh); tRect(c, 'rgba(255,255,255,.28)', wx + 8, wy + 6, 22, wh - 12);
        tRect(c, '#3A4256', wx + 18, wy + wh - 62, 6, 62); tRect(c, '#3A4256', wx + 80, wy + wh - 62, 6, 62); ivLine(c, '#3A4256', 5, wx + 8, wy + wh - 64, wx + 96, wy + wh - 64); tRect(c, '#3A4256', wx + 6, wy + wh - 80, 8, 32); tRect(c, '#3A4256', wx + 90, wy + wh - 80, 8, 32); tRound(c, '#3A4256', wx + 28, wy + wh - 24, 48, 12, 4); tRect(c, '#3A4256', wx + 34, wy + wh - 12, 6, 12); tRect(c, '#3A4256', wx + 64, wy + wh - 12, 6, 12);
        tRect(c, '#12141C', wx + 50, wy, 3, wh); D._win.push({ x: wx, y: wy, w: 104, h: wh });
      }
      /* the entrance: glass doors under an orange awning */
      const dx = x0 + 28 + 2 * 118 - 4;
      tAwning(c, dx - 14, wy - 8, 140, 22, '#2F7A5A', '#F4F1E8');
      tRect(c, '#12141C', dx, wy + 22, 112, TG - wy - 22); tRect(c, '#9FD0E8', dx + 6, wy + 28, 48, TG - wy - 28); tRect(c, '#9FD0E8', dx + 58, wy + 28, 48, TG - wy - 28);
      tRect(c, 'rgba(255,255,255,.3)', dx + 12, wy + 34, 10, TG - wy - 40); tRect(c, '#C9CDD9', dx + 50, wy + 110, 4, 40); tRect(c, '#C9CDD9', dx + 58, wy + 110, 4, 40);
      tRect(c, '#9A9078', dx - 20, TG - 6, 152, 6);
      tRound(c, '#FFF6E0', dx + 36, wy + 44, 40, 16, 4); ivText(c, 'OPEN', dx + 56, wy + 56, 11, '#D5352B');
      /* flags and a poster either side */
      ivLine(c, '#8A8E98', 4, x0 + 12, TG - h - 8, x0 + 12, TG - h - 70); tPoly(c, '#C9503C', [x0 + 14, TG - h - 70, x0 + 56, TG - h - 58, x0 + 14, TG - h - 46]);
      ivLine(c, '#8A8E98', 4, x0 + W - 12, TG - h - 8, x0 + W - 12, TG - h - 70); tPoly(c, '#2F7A5A', [x0 + W - 14, TG - h - 70, x0 + W - 56, TG - h - 58, x0 + W - 14, TG - h - 46]);
      tRound(c, '#12141C', x0 + W - 98, wy + 14, 80, 100, 4); tRect(c, '#FFC83D', x0 + W - 92, wy + 20, 68, 14); ivText(c, 'DAY PASS', x0 + W - 58, wy + 32, 11, '#2B3040'); ivText(c, 'DESK', x0 + W - 58, wy + 62, 20, '#FF8A3D'); ivText(c, 'INSIDE', x0 + W - 58, wy + 84, 13, '#FFF6E0');
      c.restore(); return true;
    }
    const f = GYM_KINDS[b.kind];
    if (f && D.indoor){ c.save(); try { f(c, D, b); } finally { c.restore(); } return true; }
    return bx(c, D, b, P, r);
  };
  /* the walls and floor of the gym */
  IV_ROOMS.gym = function(c, D, K){
    const W = D.w, Z = [['basic', 1100, 1700], ['plus', 1760, 2340], ['pro', 2440, 3100], ['longneck', 3160, 3700], ['legend', 3760, 4600]];
    /* a long mirror, in panels */
    tRect(c, '#2B3040', 1010, 124, W - 1070, 184);
    for (let x = 1020; x < W - 150; x += 88){
      tRect(c, '#C4CCD8', x, 130, 80, 172); tRect(c, '#DCE2EA', x, 130, 80, 24);
      tPoly(c, 'rgba(255,255,255,.34)', [x + 22, 130, x + 36, 130, x + 14, 302, x + 0, 302]); tPoly(c, 'rgba(255,255,255,.2)', [x + 44, 130, x + 50, 130, x + 28, 302, x + 22, 302]); tRect(c, 'rgba(60,70,90,.1)', x, 250, 80, 52);
      tRect(c, 'rgba(0,0,0,.12)', x + 78, 130, 2, 172);
    }
    tRect(c, '#4A5062', 1010, 302, W - 1070, 8);
    /* the tiers: a banner each, hanging from the beam, and a rubber mat and a strip of tape on the floor */
    Z.forEach(function(z){
      const cx = (z[1] + z[2]) / 2, col = GYM_COL[z[0]], nm = z[0].toUpperCase();
      ivChains(c, cx - 70, cx + 70, 36, 50); tRound(c, '#12141C', cx - 80, 50, 160, 62, 6); tRect(c, col, cx - 80, 50, 160, 8); ivText(c, nm, cx, 88, 22, col); ivText(c, 'PASS ZONE', cx, 104, 10, '#C9CDD9', '600');
      tRect(c, 'rgba(0,0,0,.28)', z[1] + 20, TG + 6, z[2] - z[1] - 40, 46); tRect(c, col, z[1] + 20, TG + 6, z[2] - z[1] - 40, 4); tRect(c, col, z[1] + 20, TG + 48, z[2] - z[1] - 40, 4);
    });
    /* the lobby: a clock, a poster and the rules */
    tCircle(c, '#2B3040', 660, 190, 34); tCircle(c, '#F4F1E8', 660, 190, 29); c.strokeStyle = '#2B3040'; c.lineWidth = 3; c.beginPath(); c.moveTo(660, 190); c.lineTo(660, 168); c.moveTo(660, 190); c.lineTo(676, 196); c.stroke();
    ivLine(c, '#2A2A30', 2, 660, 36, 660, 154);
    ivBoard(c, 250, 150, 200, 100, '#FF8A3D', '#2B3040'); ivText(c, 'NO PAIN', 350, 192, 28, '#12141C'); ivText(c, 'NO GAIN', 350, 224, 28, '#FFF6E0');
    ivChains(c, 280, 420, 36, 144);
    tRound(c, '#12141C', 170, 270, 150, 44, 4);
    tRect(c, '#4A5062', 170, 270, 150, 4); ivText(c, 'PASSES LAST A DAY', 245, 290, 11, '#FFD84D'); ivText(c, 'WIPE THE MACHINES', 245, 304, 10, '#C9CDD9', '600');
    ivLine(c, '#4A5062', 5, 190, 314, 190, TG); ivLine(c, '#4A5062', 5, 300, 314, 300, TG);
    /* the lobby floor */
    tRect(c, '#FF8A3D', 140, TG + 6, 900, 4); tRect(c, '#FF8A3D', 140, TG + 48, 900, 4);
  };
  /* the same rule as the other interiors: no generic windows in here */
})();

/* ---- what level looks like: bigger plates, faster belts, a tougher partner, an aura ---- */
const GYM_TIER_COL = ['#C9CDD9', '#CD8A4A', '#C9CDD9', '#FFD84D'];                              /* none, bronze (5), silver (10), gold (15) */
function gymTierOf(L){ return L >= 15 ? 3 : L >= 10 ? 2 : L >= 5 ? 1 : 0; }
function gymBarbell(ctx, cx, cy, L){
  /* a barbell seen from the side: the bar, and plates that get taller, more numerous and shinier with level */
  const half = 52 + L * 1.6, n = 1 + Math.floor(L / 4), cols = ['#D5352B', '#2F5F94', '#F2C230', '#3A3F4A', '#E8E4DC'], ph = 34 + L * 1.9;
  ivLine(ctx, '#C9CDD9', 5, cx - half - 14, cy, cx + half + 14, cy);
  [-1, 1].forEach(function(s){
    for (let k = 0; k < n; k++){
      const hh = ph * (1 - k * 0.1), px = cx + s * (half - k * 11) - 6;
      tRound(ctx, cols[(Math.floor(L / 4) - k + 5) % 5], px, cy - hh / 2, 12, hh, 4); tRect(ctx, 'rgba(255,255,255,.28)', px + 2, cy - hh / 2 + 3, 3, hh - 6);
    }
    tRect(ctx, '#8A8E98', cx + s * (half + 8) - 4, cy - 9, 8, 18);
  });
  if (L >= 15){ ctx.save(); ctx.globalAlpha = 0.5; ctx.strokeStyle = '#FFD84D'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(cx - half, cy - ph / 2 - 4); ctx.lineTo(cx + half, cy - ph / 2 - 4); ctx.stroke(); ctx.restore(); }
}
function gymAura(ctx, x, y, L, t){
  const T = gymTierOf(L); if (!T) return;
  const col = GYM_TIER_COL[T], g = ctx.createRadialGradient(x, y, 10, x, y, 120 + T * 14);
  g.addColorStop(0, T === 3 ? 'rgba(255,216,77,.34)' : T === 2 ? 'rgba(201,205,217,.26)' : 'rgba(205,138,74,.2)'); g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, 130 + T * 14, 0, TAU); ctx.fill();
  const n = 2 + T * 2;
  for (let i = 0; i < n; i++){ const a = t * (0.9 + i * 0.07) + i * TAU / n, r = 54 + T * 6 + Math.sin(t * 2 + i) * 6; tCircle(ctx, col, x + Math.cos(a) * r * 1.1, y + Math.sin(a) * r * 0.9 - 20, 2 + (i % 2)); }
  if (T === 3) for (let i = 0; i < 5; i++){ const p = (t * 0.8 + i / 5) % 1; ctx.globalAlpha = (1 - p) * 0.7; tEll(ctx, '#FF9A3A', x - 50 + i * 25 + Math.sin(t * 5 + i) * 4, y + 36 - p * 110, 5 * (1 - p) + 1.5, 9 * (1 - p) + 2); ctx.globalAlpha = 1; }
}
function gymMachineDraw(ctx, b, id, act, t, u, L){
  /* act: this machine is being used right now (u: the rep's lift 0..1); otherwise the parts idle. L: the skill's level */
  const x = b.x, x0 = b.x - b.w / 2, W = b.w; L = L | 0;
  switch (id){
    case 'tread': {
      const sp = act ? 100 + L * 24 : 0, off = (t * sp) % 20;
      ctx.save(); ctx.beginPath(); ctx.rect(x0 + 6, TG - 30, W - 72, 22); ctx.clip(); ctx.strokeStyle = 'rgba(255,255,255,' + (act ? 0.3 : 0.1) + ')'; ctx.lineWidth = 2;
      for (let xx = x0 + 14 - off; xx < x0 + W - 66; xx += 20){ ctx.beginPath(); ctx.moveTo(xx, TG - 30); ctx.lineTo(xx - 6, TG - 12); ctx.stroke(); } ctx.restore();
      tRect(ctx, '#0B3A4A', x0 + W - 92, TG - 194, 66, 38); ivText(ctx, (8 + L * 1.1).toFixed(1) + ' km/h', x0 + W - 59, TG - 170, 11, L >= 10 ? '#FFD84D' : '#6BFFE8'); tRect(ctx, L >= 10 ? '#FFD84D' : '#6BFFE8', x0 + W - 88, TG - 164, 20 + L * 2.4, 2);
      if (act && L >= 6) for (let i = 0; i < 3 + Math.floor(L / 4); i++){ const p = (t * 2 + i * 0.37) % 1; ctx.globalAlpha = (1 - p) * 0.5; ivLine(ctx, '#FFFFFF', 2, x0 + 60 - p * 70, TG - 60 - i * 16, x0 + 20 - p * 70, TG - 60 - i * 16); ctx.globalAlpha = 1; }
      break;
    }
    case 'bag': {
      const sc = 1 + L * 0.018, a = -(act ? u * (0.42 + L * 0.015) : 0) + Math.sin(t * 1.3) * 0.02, cx = x, top = TG - 256, col = L >= 15 ? '#E8B830' : L >= 10 ? '#2F5F94' : L >= 5 ? '#8A3AA8' : '#D5352B', dk = L >= 15 ? '#8A6A18' : L >= 10 ? '#1E3A5A' : L >= 5 ? '#5A2478' : '#8A1F18';
      ctx.save(); ctx.translate(cx, top); ctx.rotate(a);
      ivLine(ctx, '#2A2A30', 3, -6, 0, -6, 40); ivLine(ctx, '#2A2A30', 3, 6, 0, 6, 40);
      tRound(ctx, col, -26 * sc, 38, 52 * sc, 130 * sc, 14); tRect(ctx, dk, -26 * sc, 38 + 36 * sc, 52 * sc, 6); tRect(ctx, dk, -26 * sc, 38 + 90 * sc, 52 * sc, 6); tRect(ctx, 'rgba(255,255,255,.22)', -18 * sc, 44, 7, 118 * sc);
      if (L >= 10) for (let k = 0; k < 4; k++) tRect(ctx, '#F4F1E8', -26 * sc, 52 + k * 26 * sc, 52 * sc, 2);
      ctx.restore();
      if (act && u > 0.55){ const px = cx - 30, py = top + 120; ctx.save(); ctx.translate(px, py); ctx.rotate(t * 3); ctx.globalAlpha = Math.min(1, (u - 0.55) * 3); tPoly(ctx, L >= 10 ? '#FFD84D' : '#FFE9A0', [0, -22, 6, -7, 22, -6, 9, 3, 14, 20, 0, 9, -14, 20, -9, 3, -22, -6, -6, -7]); ctx.restore(); }
      break;
    }
    case 'bench': {
      const by = act ? TG - 118 - u * 54 : TG - 132;
      gymBarbell(ctx, x, by, L);
      break;
    }
    case 'row': {
      const fx = x0 + W - 34, fy = TG - 74, a = t * (act ? 4 + L * 0.9 : 0.5);
      tCircle(ctx, '#1A1E2C', fx, fy, 35); ctx.strokeStyle = L >= 10 ? '#FFD84D' : '#8A8E98'; ctx.lineWidth = 2; for (let k = 0; k < 8; k++){ const q = a + k * TAU / 8; ctx.beginPath(); ctx.moveTo(fx, fy); ctx.lineTo(fx + Math.cos(q) * 33, fy + Math.sin(q) * 33); ctx.stroke(); }
      tCircle(ctx, L >= 5 ? '#FF8A3D' : '#D5352B', fx, fy, 7);
      const sx = x0 + W - 150 - (act ? u * 90 : 20) + 40;
      tRound(ctx, '#1E1E26', sx - 22, TG - 62, 44, 14, 6); tRect(ctx, '#4A5062', sx - 4, TG - 48, 8, 6);
      ivLine(ctx, '#2A2A30', 2.4, fx, fy, sx + 30, TG - 90); tRound(ctx, '#2B3040', sx + 26, TG - 96, 12, 10, 3);
      break;
    }
    case 'bike': {
      const cx = x0 + W - 70, cy = TG - 66, a = t * (act ? 5 + L * 0.8 : 0.4);
      ctx.save(); ctx.translate(cx, cy); ctx.rotate(a); tCircle(ctx, '#2B3040', 0, 0, 38); tCircle(ctx, '#3A4256', 0, 0, 30); ctx.strokeStyle = L >= 10 ? '#FFD84D' : '#E8552B'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(-26, 0); ctx.lineTo(26, 0); ctx.moveTo(0, -26); ctx.lineTo(0, 26); ctx.stroke(); tCircle(ctx, '#8A8E98', 0, 0, 6); ctx.restore();
      ctx.save(); ctx.translate(cx - 26, cy + 8); ctx.rotate(a); ivLine(ctx, '#2A2A30', 5, 0, -22, 0, 22); tRound(ctx, '#C9CDD9', -9, 18, 18, 7, 2); tRound(ctx, '#C9CDD9', -9, -25, 18, 7, 2); ctx.restore();
      if (act && L >= 4) for (let i = 0; i < 3 + Math.floor(L / 3); i++){ const p = (t * 2.4 + i * 0.31) % 1; ctx.globalAlpha = (1 - p) * 0.55; ivLine(ctx, L >= 10 ? '#FFD84D' : '#FFFFFF', 2, x0 + 10 - p * 80, TG - 150 + i * 14, x0 - 36 - p * 80, TG - 150 + i * 14); ctx.globalAlpha = 1; }
      break;
    }
    case 'ring': {
      const hit = act ? u : 0, sc = 1.3 + L * 0.04, px = x0 + W - 90 + hit * (22 + L), bob = Math.sin(t * 6) * 2;
      const coat = L >= 15 ? '#2A2A34' : L >= 10 ? '#A64A4A' : L >= 5 ? '#7A6AA6' : '#8C93A6', spot = L >= 15 ? '#C9962F' : L >= 10 ? '#6A2A2A' : L >= 5 ? '#4A3E78' : '#545B70';
      townGiraffe(ctx, px, TG - 40 + bob, { s: sc, flip: true, look: { coat: coat, spot: spot, pat: 0, hat: L >= 15 ? 'laurel' : L >= 5 ? 'sweatband' : '' }, lean: -hit * 8, reach: 0.15 - hit * 0.3, t: t, seed: 3 });
      tRound(ctx, L >= 10 ? '#FFD84D' : '#D5352B', px - 40 - L * 1.4, TG - 100 - L * 2, 18 + L * 0.5, 14 + L * 0.4, 6);
      break;
    }
    case 'yoga': {
      const T = gymTierOf(L), mc = ['#6A3AA8', '#3A8AA8', '#3AA86A', '#C9A62A'][T];
      tRound(ctx, mc, x0 + 4, TG - 9, W - 80, 9, 4); tRect(ctx, 'rgba(255,255,255,.22)', x0 + 12, TG - 8, W - 96, 2);
      for (let i = 0; i < Math.floor(L / 2); i++){ const p = (t * 0.4 + i * 0.137) % 1; ctx.globalAlpha = (1 - p) * 0.8; tCircle(ctx, GYM_TIER_COL[Math.max(1, T)], x0 + 30 + ((i * 53) % (W - 130)), TG - 14 - p * 120, 2 + (i % 2)); ctx.globalAlpha = 1; }
      break;
    }
    case 'pull': {
      if (L >= 5){ ctx.globalAlpha = 0.9; tRound(ctx, GYM_TIER_COL[gymTierOf(L)], x0 + 74, TG - 366, 70, 5, 2); ctx.globalAlpha = 1; }                    /* chalked bar */
      break;
    }
    case 'sauna': {
      const n = 6 + L, heat = 80 + L * 2;
      tRect(ctx, '#9A6A3E', x0 + 76, TG - 268, 26, 20); ivText(ctx, heat + '°', x0 + 89, TG - 256, 12, L >= 10 ? '#FF8A5A' : '#FFE9A0');
      tCircle(ctx, 'rgba(255,90,40,' + (0.2 + L * 0.03).toFixed(2) + ')', x0 + W - 52, TG - 86, 18 + L);
      for (let i = 0; i < n; i++){ const p = (t * (0.3 + L * 0.02) + i / n) % 1; ctx.globalAlpha = (1 - p) * (act ? 0.5 : 0.22); tCircle(ctx, '#FFFFFF', x0 + W - 66 + Math.sin(p * 6 + i) * 12, TG - 96 - p * 130, 9 + p * 16); }
      ctx.globalAlpha = 1;
      break;
    }
    case 'free': case 'yoga0': break;
  }
}
/* ---- the gym's hats and boots (side and top views) ---- */
(function(){
  [{ id: 'sweatband', name: 'Sweatband', c: '#D5352B', kind: 'hat' }, { id: 'laurel', name: 'Champion’s Laurel', c: '#D9B13A', kind: 'hat' }].forEach(function(o){
    const h = { id: o.id, name: o.name, c: o.c, kind: 'hat', rare: false, p: 0, town: true }; if (ACC_ITEMS.length < 62){ ACC.townHats.push(h); ACC_ITEMS.push(h); ACC_BY_ID[o.id] = h; }
  });
  [{ id: 'trainers', name: 'Trainers', c: '#F4F1E8' }, { id: 'boxboots', name: 'Boxing Boots', c: '#D5352B' }].forEach(function(o){
    const b = { id: o.id, name: o.name, c: o.c, kind: 'boot', rare: false, p: 0, town: true }; if (ACC_ITEMS.length < 62){ ACC.townBoots.push(b); ACC_ITEMS.push(b); ACC_BY_ID[o.id] = b; }
  });
  Object.assign(TOWN_HAT_SIDE, {
    sweatband: function(c){
      c.fillStyle = '#D5352B'; c.beginPath(); c.moveTo(-10, -1); c.quadraticCurveTo(0, -7, 11, -1); c.lineTo(11, 3); c.quadraticCurveTo(0, -3, -10, 3); c.closePath(); c.fill();
      c.fillStyle = '#F4F1E8'; c.fillRect(-9, -1.4, 19, 1.8); c.strokeStyle = '#D5352B'; c.lineWidth = 2; c.beginPath(); c.moveTo(-10, 2); c.lineTo(-15, 5); c.moveTo(-10, 2); c.lineTo(-14, 0); c.stroke();
    },
    laurel: function(c){
      c.strokeStyle = '#B8902A'; c.lineWidth = 1.4; c.beginPath(); c.arc(0, 1, 9, Math.PI * 1.02, Math.PI * 1.98); c.stroke();
      for (let i = 0; i < 6; i++){ const a = Math.PI * (1.08 + i * 0.16), lx = Math.cos(a) * 9, ly = 1 + Math.sin(a) * 9; c.save(); c.translate(lx, ly); c.rotate(a + Math.PI / 2 - 0.5); c.fillStyle = '#E8C84A'; c.beginPath(); c.ellipse(0, -3, 2.2, 4.4, 0, 0, TAU); c.fill(); c.restore(); }
      c.fillStyle = '#E8C84A'; c.beginPath(); c.arc(0, -9, 2, 0, TAU); c.fill();
    }
  });
  Object.assign(TOWN_HAT_TOP, {
    sweatband: function(c){ c.strokeStyle = '#D5352B'; c.lineWidth = 4; c.beginPath(); c.arc(0, 0, 8, 0, TAU); c.stroke(); c.strokeStyle = '#F4F1E8'; c.lineWidth = 1.4; c.beginPath(); c.arc(0, 0, 8, 0, TAU); c.stroke(); },
    laurel: function(c){ for (let i = 0; i < 12; i++){ const a = i * TAU / 12; c.save(); c.translate(Math.cos(a) * 8, Math.sin(a) * 8); c.rotate(a + 1.2); c.fillStyle = '#E8C84A'; c.beginPath(); c.ellipse(0, 0, 2, 4, 0, 0, TAU); c.fill(); c.restore(); } c.strokeStyle = '#B8902A'; c.lineWidth = 1; c.beginPath(); c.arc(0, 0, 8, 0, TAU); c.stroke(); }
  });
  Object.assign(TOWN_BOOT_SIDE, {
    trainers: function(c){
      c.fillStyle = '#F4F1E8'; c.strokeStyle = '#9A9AA4'; c.beginPath(); c.moveTo(-5, -9); c.lineTo(5, -9); c.lineTo(5, 0); c.lineTo(12, 3); c.lineTo(12, 7); c.lineTo(-5, 7); c.closePath(); c.fill(); c.stroke();
      c.fillStyle = '#D5352B'; c.beginPath(); c.moveTo(-5, 1); c.lineTo(7, 1.5); c.lineTo(6, 3.6); c.lineTo(-5, 3.4); c.fill(); c.fillStyle = '#2B3040'; c.fillRect(-5.4, 6, 18, 2.2); c.fillStyle = '#9A9AA4'; c.fillRect(-5, -9, 10, 2.4);
    },
    boxboots: function(c){
      c.fillStyle = '#D5352B'; c.strokeStyle = '#8A1F18'; c.beginPath(); c.rect(-5.2, -15, 10.4, 16.5); c.fill(); c.stroke(); c.beginPath(); c.ellipse(3, 3, 8, 4, 0, 0, TAU); c.fill(); c.stroke();
      c.strokeStyle = '#F4F1E8'; c.lineWidth = 1.2; for (let k = 0; k < 4; k++){ c.beginPath(); c.moveTo(-4, -12 + k * 3.4); c.lineTo(4, -10.4 + k * 3.4); c.stroke(); } c.fillStyle = '#F4F1E8'; c.fillRect(-5.4, -15, 10.8, 2.4); c.fillStyle = '#2B3040'; c.fillRect(-5.4, 5.2, 15, 2.2);
    }
  });
  Object.assign(TOWN_BOOT_TOP, {
    trainers: function(c){ c.fillStyle = '#F4F1E8'; c.strokeStyle = '#9A9AA4'; c.beginPath(); c.ellipse(0.5, 0, 7.8, 5.2, 0, 0, TAU); c.fill(); c.stroke(); c.fillStyle = '#D5352B'; c.fillRect(-2, -5, 2.4, 10); },
    boxboots: function(c){ c.fillStyle = '#D5352B'; c.strokeStyle = '#8A1F18'; c.beginPath(); c.ellipse(0.5, 0, 7.8, 5.6, 0, 0, TAU); c.fill(); c.stroke(); c.strokeStyle = '#F4F1E8'; c.lineWidth = 1; for (let k = -2; k <= 2; k++){ c.beginPath(); c.moveTo(-2, k * 1.8); c.lineTo(3, k * 1.8); c.stroke(); } }
  });
})();
