'use strict';
/* The photo studio: a backdrop, her in a pose, and things placed on the picture that can be dragged around (effects, and creatures
   from the Bestiary that she has discovered). Opened from the wardrobe. */
/* ========================= 44n. PHOTO STUDIO ========================= */
/* PHOTO.items = [{ t:'fx'|'foe', id, ch, x, y, s, f, r }] in picture coordinates (960 x 540). PHOTO.sel is -1 for her, an index into
   items, or -2 for nothing. The picture on screen is drawn with a selection ring; saving and copying draw it again without. */
const PHOTO = { bg: 0, pose: 0, flip: false, gx: 480, gy: 453.6, gs: 1, moved: false, tab: 'scene', foeCh: 1, items: [], sel: -2, filter: 0, frame: 0, tod: -1, freeze: false };      /* filter, frame, tod (the time of day in half hours, -1 = the backdrop's own light) and freeze: 44zzp-photo-looks.js */
const PHOTO_BG = ['Golden savanna', 'Snowfield', 'Night sky', 'Neon city', 'Studio'];
const PHOTO_POSE = [
  { n: 'Standing', o: {} },
  { n: 'Walking', o: { ph: 0.9, moving: true } },
  { n: 'Sprinting', o: { ph: 1.7, moving: true, lean: 10, rot: 0.08 } },
  { n: 'Leaping', o: { air: true, rot: -0.12 }, lift: 52 },
  { n: 'Proud', o: { lean: 8, dip: -5 } },
  { n: 'Grazing', o: { dip: 92, lean: 16 } },
  { n: 'Rearing up', o: { air: true, rot: -0.42, dip: -8 }, lift: 30 },
  { n: 'Spinning', o: { air: true, rot: 0.9 }, lift: 60 },
  { n: 'Roaring', o: { dip: -14, lean: -4, rot: -0.1 } },
  { n: 'Dizzy', o: { rot: 0.3, lean: -6, dip: 10 } }
];
const PHOTO_FX = [['sparkles', 'Sparkles'], ['hearts', 'Hearts'], ['stars', 'Star burst'], ['fire', 'Fire'], ['snow', 'Snowflakes'], ['lightning', 'Lightning'],
  ['rainbow', 'Rainbow'], ['smoke', 'Smoke'], ['notes', 'Music'], ['shine', 'Shine'], ['dust', 'Dust cloud'], ['speed', 'Speed lines'], ['bubbles', 'Bubbles'],
  ['confetti', 'Confetti'], ['pow', 'POW!']];
const PHOTO_MAX = 24;

function photoBackdrop(c, W, H, n){
  const R = miniRng(77 + n * 13), gy = H * 0.84;
  /* light surface texture: tiny flecks and short strokes on the ground, kept faint */
  const flecks = function(rgb, a, cnt, y0, y1){ c.fillStyle = 'rgba(' + rgb + ',' + a + ')'; for (let i = 0; i < cnt; i++){ const x = R() * W, y = y0 + R() * (y1 - y0); c.fillRect(x, y, 2 + R() * 5, 1.2); } };
  const tufts = function(rgb, a, cnt, y0, y1){ c.strokeStyle = 'rgba(' + rgb + ',' + a + ')'; c.lineWidth = 1.4; c.lineCap = 'round'; for (let i = 0; i < cnt; i++){ const x = R() * W, y = y0 + R() * (y1 - y0), h = 5 + R() * 7; c.beginPath(); c.moveTo(x, y); c.lineTo(x - 3, y - h); c.moveTo(x, y); c.lineTo(x, y - h * 1.15); c.moveTo(x, y); c.lineTo(x + 3, y - h * 0.9); c.stroke(); } };
  const trunk = function(x, y, h, w, col){ c.fillStyle = col; c.beginPath(); c.moveTo(x - w / 2, y); c.lineTo(x - w * 0.32, y - h); c.lineTo(x + w * 0.32, y - h); c.lineTo(x + w / 2, y); c.closePath(); c.fill(); };
  const sky = function(a, b){ const g = c.createLinearGradient(0, 0, 0, gy); g.addColorStop(0, a); g.addColorStop(1, b); c.fillStyle = g; c.fillRect(0, 0, W, H); };
  const hills = function(col, base, amp, ph, step){
    c.fillStyle = col; c.beginPath(); c.moveTo(0, H);
    for (let x = 0; x <= W + step; x += step) c.lineTo(x, base + Math.sin(x * 0.006 + ph) * amp + Math.sin(x * 0.017 + ph * 2) * amp * 0.35);
    c.lineTo(W, H); c.closePath(); c.fill();
  };
  if (n === 0){                                                           /* savanna at golden hour */
    sky('#FFB45C', '#FFE7A8');
    const sg = c.createRadialGradient(W * 0.72, gy - 90, 10, W * 0.72, gy - 90, 220); sg.addColorStop(0, 'rgba(255,250,210,1)'); sg.addColorStop(0.25, 'rgba(255,225,140,.85)'); sg.addColorStop(1, 'rgba(255,200,100,0)');
    c.fillStyle = sg; c.fillRect(0, 0, W, H);
    hills('#C98B3C', gy - 60, 18, 1, 14); hills('#A86A28', gy - 20, 14, 3, 12);
    c.fillStyle = '#4A2E12';                                              /* an acacia */
    trunk(W * 0.14 + 3, gy - 14, 84, 9, '#4A2E12'); c.beginPath(); c.ellipse(W * 0.14 + 3, gy - 100, 74, 17, 0, 0, TAU); c.fill();
    c.fillStyle = 'rgba(30,60,20,.35)'; c.beginPath(); c.ellipse(W * 0.14 - 20, gy - 104, 40, 8, 0, 0, TAU); c.fill();
    trunk(W * 0.9, gy - 12, 60, 7, '#4A2E12'); c.fillStyle = '#4A2E12'; c.beginPath(); c.ellipse(W * 0.9, gy - 70, 50, 12, 0, 0, TAU); c.fill();
    c.fillStyle = '#B5782E'; c.fillRect(0, gy, W, H - gy);
    flecks('255,230,170', 0.16, 90, gy + 4, H); flecks('90,50,15', 0.12, 70, gy + 4, H); tufts('120,80,30', 0.35, 26, gy + 6, H - 6);
  } else if (n === 1){                                                    /* snow */
    sky('#9CC8EE', '#EAF4FC');
    hills('#D7E8F6', gy - 80, 20, 2, 14); hills('#EEF6FC', gy - 36, 14, 5, 12);
    for (let i = 0; i < 9; i++){
      const x = R() * W, h = 50 + R() * 50, y = gy - 30 - R() * 40;
      trunk(x, y + 10, 14, 6, '#5A3B22');                                  /* a trunk under each pine */
      c.fillStyle = '#2F5F4C'; c.beginPath(); c.moveTo(x, y - h); c.lineTo(x + h * 0.32, y); c.lineTo(x - h * 0.32, y); c.closePath(); c.fill();
      c.fillStyle = 'rgba(255,255,255,.7)'; c.beginPath(); c.moveTo(x, y - h); c.lineTo(x + h * 0.14, y - h * 0.62); c.lineTo(x - h * 0.14, y - h * 0.62); c.closePath(); c.fill();
    }
    c.fillStyle = '#F8FCFF'; c.fillRect(0, gy, W, H - gy);
    c.strokeStyle = 'rgba(150,185,220,.28)'; c.lineWidth = 1.6; c.lineCap = 'round';                    /* wind-drift ripples in the snow */
    for (let i = 0; i < 16; i++){ const x = R() * W, y = gy + 8 + R() * (H - gy - 14), l = 30 + R() * 60; c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + l / 2, y - 5, x + l, y); c.stroke(); }
    flecks('180,205,230', 0.3, 60, gy + 4, H);
    c.fillStyle = 'rgba(255,255,255,.85)'; for (let i = 0; i < 90; i++){ c.beginPath(); c.arc(R() * W, R() * H, 1 + R() * 2.4, 0, TAU); c.fill(); }
  } else if (n === 2){                                                    /* night */
    sky('#0B1130', '#2B3A78');
    c.fillStyle = '#FFFFFF'; for (let i = 0; i < 140; i++){ c.globalAlpha = 0.3 + R() * 0.7; c.beginPath(); c.arc(R() * W, R() * gy, 0.6 + R() * 1.6, 0, TAU); c.fill(); }
    c.globalAlpha = 1;
    const mg = c.createRadialGradient(W * 0.2, H * 0.2, 4, W * 0.2, H * 0.2, 90); mg.addColorStop(0, 'rgba(255,252,225,1)'); mg.addColorStop(0.35, 'rgba(255,248,200,.9)'); mg.addColorStop(1, 'rgba(255,248,200,0)');
    c.fillStyle = mg; c.fillRect(0, 0, W, H);
    hills('#141C3E', gy - 40, 22, 4, 14);
    for (let i = 0; i < 4; i++){ const x = W * (0.1 + i * 0.27 + R() * 0.05), h = 70 + R() * 40; trunk(x, gy - 6, h, 8, '#0A1026'); c.fillStyle = '#0A1026'; c.beginPath(); c.arc(x, gy - h - 6, 26 + R() * 10, 0, TAU); c.fill(); }
    c.fillStyle = '#0E1530'; c.fillRect(0, gy, W, H - gy);
    flecks('150,170,255', 0.14, 70, gy + 4, H); tufts('90,110,190', 0.3, 20, gy + 6, H - 6);
  } else if (n === 3){                                                    /* neon city */
    sky('#2A0F4D', '#E2549C');
    for (let i = 0; i < 14; i++){
      const w = 40 + R() * 70, h = 90 + R() * 220, x = i * (W / 13) - 20;
      c.fillStyle = 'rgb(' + Math.round(20 + R() * 20) + ',' + Math.round(8 + R() * 14) + ',' + Math.round(50 + R() * 30) + ')'; c.fillRect(x, gy - h, w, h);
      c.fillStyle = 'rgba(255,220,120,.75)';
      for (let yy = gy - h + 10; yy < gy - 10; yy += 18) for (let xx = x + 8; xx < x + w - 8; xx += 14) if (R() < 0.45) c.fillRect(xx, yy, 6, 8);
    }
    c.fillStyle = '#17082E'; c.fillRect(0, gy, W, H - gy);
    c.fillStyle = 'rgba(255,255,255,.07)';                                   /* paving slabs and a lane line */
    for (let x = -20; x < W + 80; x += 120) c.fillRect(x, gy, 2, H - gy);
    c.fillRect(0, gy + (H - gy) * 0.55, W, 2);
    c.fillStyle = 'rgba(255,230,120,.22)'; for (let x = 10; x < W; x += 90) c.fillRect(x, gy + (H - gy) * 0.78, 40, 3);
    const ng = c.createLinearGradient(0, gy, 0, H); ng.addColorStop(0, 'rgba(255,90,200,.45)'); ng.addColorStop(1, 'rgba(255,90,200,0)'); c.fillStyle = ng; c.fillRect(0, gy, W, H - gy);
  } else {                                                                /* studio */
    const bgd = c.createRadialGradient(W / 2, H * 0.45, 40, W / 2, H * 0.5, Math.hypot(W, H) * 0.6); bgd.addColorStop(0, '#F2EEE6'); bgd.addColorStop(1, '#8F8A82');
    c.fillStyle = bgd; c.fillRect(0, 0, W, H);
    const fl = c.createLinearGradient(0, gy - 20, 0, H); fl.addColorStop(0, 'rgba(0,0,0,0)'); fl.addColorStop(1, 'rgba(0,0,0,.25)'); c.fillStyle = fl; c.fillRect(0, gy - 20, W, H);
    c.fillStyle = 'rgba(0,0,0,.05)'; c.fillRect(0, gy - 1, W, 2);                       /* the seam where wall meets floor */
    c.strokeStyle = 'rgba(255,255,255,.18)'; c.lineWidth = 1;
    for (let x = -W; x < 2 * W; x += 70){ c.beginPath(); c.moveTo(W / 2 + (x - W / 2) * 0.35, gy); c.lineTo(x, H); c.stroke(); }
  }
}


/* ---- effects, each drawn around the origin, about 140 units across ---- */
function pStar4(c, x, y, r){ c.beginPath(); c.moveTo(x, y - r); c.quadraticCurveTo(x, y, x + r, y); c.quadraticCurveTo(x, y, x, y + r); c.quadraticCurveTo(x, y, x - r, y); c.quadraticCurveTo(x, y, x, y - r); c.fill(); }
function pHeart(c, x, y, r){ c.beginPath(); c.moveTo(x, y + r * 0.9); c.bezierCurveTo(x - r * 1.4, y - r * 0.1, x - r * 0.7, y - r * 1.1, x, y - r * 0.35); c.bezierCurveTo(x + r * 0.7, y - r * 1.1, x + r * 1.4, y - r * 0.1, x, y + r * 0.9); c.fill(); }
function pFlame(c, w, h){ c.beginPath(); c.moveTo(0, -h); c.quadraticCurveTo(w, -h * 0.25, w * 0.55, h * 0.55); c.quadraticCurveTo(0, h * 1.05, -w * 0.55, h * 0.55); c.quadraticCurveTo(-w, -h * 0.25, 0, -h); c.fill(); }
const PHOTO_FXDRAW = {
  sparkles: function(c, R){
    c.shadowColor = 'rgba(255,240,170,.9)'; c.shadowBlur = 8;
    for (let i = 0; i < 8; i++){ c.fillStyle = i % 3 ? '#FFFFFF' : '#FFE27A'; pStar4(c, (R() - 0.5) * 120, (R() - 0.5) * 100, 5 + R() * 13); }
    c.shadowBlur = 0;
  },
  hearts: function(c, R){
    for (let i = 0; i < 6; i++){
      const x = (R() - 0.5) * 90, y = 40 - i * 17 + (R() - 0.5) * 10, r = 8 + R() * 10;
      c.fillStyle = i % 2 ? '#FF6B9A' : '#E83A6E'; pHeart(c, x, y, r);
      c.fillStyle = 'rgba(255,255,255,.55)'; c.beginPath(); c.ellipse(x - r * 0.45, y - r * 0.4, r * 0.22, r * 0.14, -0.6, 0, TAU); c.fill();
    }
  },
  stars: function(c, R){
    c.strokeStyle = 'rgba(255,230,120,.85)'; c.lineWidth = 3; c.lineCap = 'round';
    for (let i = 0; i < 10; i++){ const a = i * TAU / 10 + 0.2; c.beginPath(); c.moveTo(Math.cos(a) * 26, Math.sin(a) * 26); c.lineTo(Math.cos(a) * (50 + R() * 16), Math.sin(a) * (50 + R() * 16)); c.stroke(); }
    const cols = ['#FFD84D', '#FFFFFF', '#FF9A3D', '#FFE9A0', '#FFD84D'];
    for (let i = 0; i < 5; i++){ const a = i * TAU / 5, r = 62 + R() * 8; c.fillStyle = cols[i]; accStar(c, Math.cos(a) * r, Math.sin(a) * r, 10 + R() * 8, 5); }
    c.fillStyle = '#FFE27A'; accStar(c, 0, 0, 24, 5);
  },
  fire: function(c){
    const g = c.createRadialGradient(0, 20, 4, 0, 20, 62); g.addColorStop(0, 'rgba(255,170,60,.6)'); g.addColorStop(1, 'rgba(255,120,30,0)'); c.fillStyle = g; c.fillRect(-70, -50, 140, 140);
    c.save(); c.translate(-22, 26); c.fillStyle = '#D93B10'; pFlame(c, 20, 38); c.restore();
    c.save(); c.translate(24, 28); c.fillStyle = '#D93B10'; pFlame(c, 18, 32); c.restore();
    c.save(); c.translate(0, 22); c.fillStyle = '#EE5A14'; pFlame(c, 30, 58); c.restore();
    c.save(); c.translate(0, 28); c.fillStyle = '#FFA02A'; pFlame(c, 20, 40); c.restore();
    c.save(); c.translate(0, 34); c.fillStyle = '#FFE27A'; pFlame(c, 11, 22); c.restore();
  },
  snow: function(c, R){
    c.strokeStyle = '#EAF6FF'; c.lineCap = 'round'; c.shadowColor = 'rgba(150,200,255,.9)'; c.shadowBlur = 5;
    for (let i = 0; i < 5; i++){
      const x = (R() - 0.5) * 110, y = (R() - 0.5) * 90, r = 8 + R() * 11;
      c.save(); c.translate(x, y); c.rotate(R() * 1.5); c.lineWidth = 1.8;
      for (let k = 0; k < 6; k++){ c.rotate(Math.PI / 3); c.beginPath(); c.moveTo(0, 0); c.lineTo(r, 0); c.moveTo(r * 0.6, 0); c.lineTo(r * 0.8, r * 0.25); c.moveTo(r * 0.6, 0); c.lineTo(r * 0.8, -r * 0.25); c.stroke(); }
      c.restore();
    }
    c.shadowBlur = 0;
  },
  lightning: function(c){
    const pts = [[8, -64], [-16, -8], [2, -4], [-20, 60], [18, 8], [2, 4], [26, -38]];
    c.shadowColor = 'rgba(255,240,120,1)'; c.shadowBlur = 16;
    c.fillStyle = '#FFE23A'; c.beginPath(); pts.forEach(function(p, i){ i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1]); }); c.closePath(); c.fill();
    c.shadowBlur = 0; c.fillStyle = '#FFFBD0'; c.save(); c.scale(0.55, 0.8); c.beginPath(); pts.forEach(function(p, i){ i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1]); }); c.closePath(); c.fill(); c.restore();
  },
  rainbow: function(c){
    const cols = ['#E63B3B', '#F58A2B', '#F5D12B', '#4CB84A', '#3A8EE0', '#7A4FD0'];
    c.lineWidth = 9; c.lineCap = 'butt';
    cols.forEach(function(col, i){ c.strokeStyle = col; c.beginPath(); c.arc(0, 36, 70 - i * 8.6, Math.PI, 0); c.stroke(); });
  },
  smoke: function(c, R){
    for (let i = 0; i < 7; i++){
      const y = 44 - i * 16, x = Math.sin(i * 1.3) * 16 + (R() - 0.5) * 12, r = 12 + i * 3.2;
      c.fillStyle = 'rgba(' + (92 + i * 18) + ',' + (92 + i * 18) + ',' + (98 + i * 18) + ',' + (0.8 - i * 0.08).toFixed(2) + ')'; c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill();
    }
  },
  notes: function(c, R){
    c.font = 'bold 30px system-ui, "Segoe UI Symbol", sans-serif'; c.textAlign = 'center'; c.lineWidth = 4; c.strokeStyle = 'rgba(20,12,6,.7)'; c.lineJoin = 'round';
    ['♪', '♫', '♬', '♪'].forEach(function(ch, i){
      const x = -48 + i * 32, y = 30 - i * 20 + (R() - 0.5) * 14;
      c.save(); c.translate(x, y); c.rotate((R() - 0.5) * 0.7); c.strokeText(ch, 0, 0); c.fillStyle = i % 2 ? '#FFE27A' : '#FFFFFF'; c.fillText(ch, 0, 0); c.restore();
    });
  },
  shine: function(c){
    const g = c.createRadialGradient(0, 0, 2, 0, 0, 70); g.addColorStop(0, 'rgba(255,255,255,.95)'); g.addColorStop(0.3, 'rgba(255,240,170,.55)'); g.addColorStop(1, 'rgba(255,230,120,0)');
    c.fillStyle = g; c.beginPath(); c.arc(0, 0, 70, 0, TAU); c.fill();
    c.fillStyle = 'rgba(255,255,230,.8)';
    for (let k = 0; k < 8; k++){ c.save(); c.rotate(k * Math.PI / 4); c.beginPath(); c.moveTo(0, -3); c.lineTo(k % 2 ? 54 : 78, 0); c.lineTo(0, 3); c.closePath(); c.fill(); c.restore(); }
  },
  dust: function(c, R){
    for (let i = 0; i < 8; i++){
      const x = (i - 3.5) * 16 + (R() - 0.5) * 8, y = 40 - Math.abs(i - 3.5) * 5 + (R() - 0.5) * 6, r = 11 + R() * 9;
      c.fillStyle = 'rgba(214,186,140,' + (0.45 + R() * 0.2).toFixed(2) + ')'; c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill();
    }
  },
  speed: function(c, R){
    c.lineCap = 'round'; c.strokeStyle = 'rgba(255,255,255,.8)';
    for (let i = 0; i < 7; i++){ const y = -48 + i * 16, l = 40 + R() * 50, x0 = 64 - l; c.lineWidth = 2 + R() * 2.4; c.beginPath(); c.moveTo(x0 - R() * 10, y); c.lineTo(64, y); c.stroke(); }
  },
  bubbles: function(c, R){
    for (let i = 0; i < 8; i++){
      const x = (R() - 0.5) * 110, y = (R() - 0.5) * 100, r = 6 + R() * 14;
      c.fillStyle = 'rgba(190,230,255,.22)'; c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill();
      c.strokeStyle = 'rgba(220,245,255,.85)'; c.lineWidth = 1.8; c.stroke();
      c.strokeStyle = 'rgba(255,255,255,.9)'; c.beginPath(); c.arc(x, y, r * 0.65, Math.PI * 1.1, Math.PI * 1.45); c.stroke();
    }
  },
  confetti: function(c, R){
    const cols = ['#FF5A5A', '#FFD84D', '#5ADBFF', '#8AFF7A', '#FF8AE0', '#FFFFFF', '#FFA24D'];
    for (let i = 0; i < 26; i++){ c.save(); c.translate((R() - 0.5) * 130, (R() - 0.5) * 110); c.rotate(R() * TAU); c.fillStyle = cols[i % cols.length]; c.fillRect(-5, -2.4, 10, 4.8); c.restore(); }
  },
  pow: function(c){
    c.beginPath();
    for (let i = 0; i < 28; i++){ const a = i * TAU / 28 - Math.PI / 2, r = i % 2 ? 36 : 72; c.lineTo(Math.cos(a) * r, Math.sin(a) * r * 0.8); }
    c.closePath(); c.fillStyle = '#FFD21F'; c.fill(); c.lineWidth = 4; c.strokeStyle = '#E8321A'; c.lineJoin = 'round'; c.stroke();
    c.font = '900 28px system-ui, "Arial Black", sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.lineWidth = 5; c.strokeStyle = '#FFFFFF'; c.strokeText('POW!', 0, 2);
    c.fillStyle = '#C8200C'; c.fillText('POW!', 0, 2); c.textBaseline = 'alphabetic';
  }
};
function photoFxDraw(c, it){
  const f = PHOTO_FXDRAW[it.id]; if (!f) return;
  let h = 7; for (let i = 0; i < it.id.length; i++) h = (h * 31 + it.id.charCodeAt(i)) | 0;
  c.save(); c.translate(it.x, it.y); c.rotate(it.r || 0); c.scale((it.f ? -1 : 1) * it.s, it.s);
  try { f(c, miniRng(h >>> 0)); } catch (e) {}
  c.restore();
}

/* ---- creatures ---- */
function photoFoeUnlocked(ch, type){ return (bestiaryData().creatures[ch + ':' + type] | 0) > 0; }
function photoFoeScale(def){ return Math.min(2.2, 110 / def.r); }
/* One light for the whole picture: the sun (or moon, or lamp) of the backdrop. Every shadow falls away from that point on the ground,
   whatever way the creature or she is turned. photoShadow() draws them; the creatures' own shadows are switched off while they are drawn. */
const PHOTO_SUN = [[0.74, 0.5], [0.15, 0.1], [0.2, 0.2], [0.5, 0.18], [0.5, -0.5]];       /* as fractions of the picture, one per backdrop */
function photoShadow(c, x, groundY, rx, ry, a){
  const W = 960, H = 540, s = PHOTO_SUN[PHOTO.bg] || PHOTO_SUN[0], sx = s[0] * W, sy = s[1] * H;
  const e = clamp((groundY - sy) / (H * 0.9), 0.15, 1);                       /* how high the light is: low light throws long shadows */
  const dirx = clamp((x - sx) / 260, -1, 1);
  const cx = x + dirx * rx * (1.5 * (1 - e) + 0.05), srx = rx * (1 + 0.8 * (1 - e)), sry = ry * (1 - 0.2 * (1 - e));
  c.save(); c.translate(cx, groundY); c.scale(srx, sry);
  const g = c.createRadialGradient(0, 0, 0, 0, 0, 1);
  g.addColorStop(0, 'rgba(10,6,2,' + a + ')'); g.addColorStop(0.65, 'rgba(10,6,2,' + (a * 0.7).toFixed(3) + ')'); g.addColorStop(1, 'rgba(10,6,2,0)');
  c.fillStyle = g; c.beginPath(); c.arc(0, 0, 1, 0, TAU); c.fill(); c.restore();
}
function photoFoeDraw(c, it){
  const def = bestiaryTable(it.ch)[it.id]; if (!def) return;
  const sc = photoFoeScale(def) * it.s, keep = G.particles.length;
  photoShadow(c, it.x, it.y + def.r * sc * 0.5, def.r * sc * 1.05, def.r * sc * 0.42, 0.4);
  const ss = softShadow; softShadow = function(){};                           /* its own shadow would turn with it */
  c.save(); c.translate(it.x, it.y); c.rotate(it.r || 0); c.scale((it.f ? -1 : 1) * sc, sc);
  const e = { portrait: true, def: def, type: it.id, x: 0, y: 0, r: def.r, ang: 0, flash: 0, state: 'idle', anim: 1.2, hp: 1, maxHp: 1, big: def.big,
    kx: 0, ky: 0, stunT: 0, burnT: 0, slowT: 0, slowMul: 1 };
  try { drawEnemy(c, e); } catch (err) {}
  finally { softShadow = ss; }
  c.restore();
  if (G.particles.length > keep) G.particles.length = keep;
}

/* ---- the picture ---- */
function photoPoseNow(){ return PHOTO_POSE[PHOTO.pose] || PHOTO_POSE[0]; }
function photoGiraffeGeom(){
  const sc = 2.75 * PHOTO.gs, p = photoPoseNow(), lift = (p.lift || 0) * PHOTO.gs;
  let oy = PHOTO.gy - 37 * sc - lift;
  if (!PHOTO.moved) oy = Math.max(oy, 100 * sc + 6);                         /* until she is moved, keep her head in the picture */
  return { x: PHOTO.gx, y: oy, sc: sc, lift: lift };
}
function photoRender(cv, ui){
  const c = cv.getContext('2d'), W = cv.width, H = cv.height;
  c.clearRect(0, 0, W, H);
  photoBackdrop(c, W, H, PHOTO.bg);
  const gm = photoGiraffeGeom(), items = PHOTO.items;
  const order = [];                                                          /* what is lower in the picture is in front */
  order.push({ k: -1, y: PHOTO.gy });
  items.forEach(function(it, i){ if (it.t === 'foe') order.push({ k: i, y: it.y + 30 }); });
  order.sort(function(a, b){ return a.y - b.y; });
  order.forEach(function(o){
    if (o.k === -1){
      photoShadow(c, gm.x, PHOTO.gy + 6, (96 - gm.lift * 0.4) * PHOTO.gs, (15 - gm.lift * 0.08) * PHOTO.gs * 1.1, 0.42);
      const o2 = {}, po = photoPoseNow().o; for (const k in po) o2[k] = po[k]; o2.flip = PHOTO.flip;
      drawSideGiraffe(c, gm.x, gm.y, gm.sc, o2);
    } else photoFoeDraw(c, items[o.k]);
  });
  items.forEach(function(it){ if (it.t === 'fx') photoFxDraw(c, it); });
  c.font = 'bold 15px system-ui, sans-serif'; c.textAlign = 'right'; c.fillStyle = 'rgba(255,255,255,.75)'; c.strokeStyle = 'rgba(0,0,0,.35)'; c.lineWidth = 3;
  c.strokeText('Giraffe Rampage', W - 16, H - 14); c.fillText('Giraffe Rampage', W - 16, H - 14);
  if (ui && PHOTO.sel !== -2){                                                /* the selection ring (not in the saved picture) */
    const b = photoBounds(PHOTO.sel);
    if (b){
      c.save(); c.setLineDash([7, 5]); c.lineWidth = 2.4; c.strokeStyle = '#FFD84D'; c.shadowColor = 'rgba(0,0,0,.6)'; c.shadowBlur = 3;
      c.beginPath(); c.ellipse(b.x, b.y, b.rx, b.ry, 0, 0, TAU); c.stroke(); c.restore();
    }
  }
}
function photoDraw(){ const cv = document.getElementById('photoCv'); if (cv) photoRender(cv, true); photoSelText(); }

/* where something is, for picking it and for the selection ring */
function photoBounds(k){
  if (k === -1){ const g = photoGiraffeGeom(); return { x: g.x, y: g.y - 28 * g.sc, rx: 62 * g.sc, ry: 82 * g.sc }; }
  const it = PHOTO.items[k]; if (!it) return null;
  if (it.t === 'foe'){ const def = bestiaryTable(it.ch)[it.id], r = def ? def.r * photoFoeScale(def) * it.s : 30; return { x: it.x, y: it.y, rx: r * 1.15 + 6, ry: r * 1.15 + 6 }; }
  return { x: it.x, y: it.y, rx: 62 * it.s, ry: 58 * it.s };
}
function photoPick(x, y){
  for (let i = PHOTO.items.length - 1; i >= 0; i--){                          /* effects are on top, then creatures, then her */
    if (PHOTO.items[i].t !== 'fx') continue;
    const b = photoBounds(i); if (b && Math.pow((x - b.x) / b.rx, 2) + Math.pow((y - b.y) / b.ry, 2) <= 1) return i;
  }
  for (let i = PHOTO.items.length - 1; i >= 0; i--){
    if (PHOTO.items[i].t !== 'foe') continue;
    const b = photoBounds(i); if (b && Math.pow((x - b.x) / b.rx, 2) + Math.pow((y - b.y) / b.ry, 2) <= 1) return i;
  }
  const g = photoBounds(-1);
  if (Math.pow((x - g.x) / g.rx, 2) + Math.pow((y - g.y) / g.ry, 2) <= 1) return -1;
  return -2;
}
function photoSelText(){
  const e = document.getElementById('photoSel'); if (!e) return;
  let t = 'Nothing selected. Click or touch something in the picture to select it, and drag it to move it.';
  if (PHOTO.sel === -1) t = 'Selected: her. Drag to move her.';
  else if (PHOTO.items[PHOTO.sel]){
    const it = PHOTO.items[PHOTO.sel];
    t = 'Selected: ' + (it.t === 'fx' ? (PHOTO_FX.filter(function(f){ return f[0] === it.id; })[0] || [0, 'effect'])[1] : bestiaryName(it.ch, it.id).title) + '. Drag to move it.';
  }
  e.textContent = t;
}
function photoBind(){
  const cv = document.getElementById('photoCv'); if (!cv) return;
  let drag = null;
  const at = function(ev){ const r = cv.getBoundingClientRect(); return { x: (ev.clientX - r.left) * cv.width / r.width, y: (ev.clientY - r.top) * cv.height / r.height }; };
  cv.style.touchAction = 'none'; cv.style.cursor = 'grab';
  cv.addEventListener('pointerdown', function(ev){
    const p = at(ev), k = photoPick(p.x, p.y);
    PHOTO.sel = k;
    if (k !== -2){
      const b = k === -1 ? { x: PHOTO.gx, y: PHOTO.gy } : PHOTO.items[k];
      drag = { dx: b.x - p.x, dy: b.y - p.y, id: ev.pointerId };
      try { cv.setPointerCapture(ev.pointerId); } catch (e) {}
      cv.style.cursor = 'grabbing';
    }
    ev.preventDefault(); photoDraw();
  });
  cv.addEventListener('pointermove', function(ev){
    if (!drag || ev.pointerId !== drag.id) return;
    const p = at(ev), x = clamp(p.x + drag.dx, 0, cv.width), y = clamp(p.y + drag.dy, 0, cv.height);
    if (PHOTO.sel === -1){ PHOTO.gx = x; PHOTO.gy = clamp(y, 140, cv.height - 4); PHOTO.moved = true; }
    else if (PHOTO.items[PHOTO.sel]){ PHOTO.items[PHOTO.sel].x = x; PHOTO.items[PHOTO.sel].y = y; }
    photoDraw();
  });
  const end = function(ev){ if (drag && ev.pointerId === drag.id){ drag = null; cv.style.cursor = 'grab'; } };
  cv.addEventListener('pointerup', end); cv.addEventListener('pointercancel', end);
}

/* ---- the screen ---- */
function photoThumbs(){
  const cs = document.querySelectorAll('canvas[data-pfoe]');
  const keep = G.particles.length;
  for (let i = 0; i < cs.length; i++){
    const ch = +cs[i].getAttribute('data-pch'), type = cs[i].getAttribute('data-pfoe'), def = bestiaryTable(ch)[type];
    paintBestiaryPortrait(cs[i], def, type, photoFoeUnlocked(ch, type));
  }
  if (G.particles.length > keep) G.particles.length = keep;
}
function showPhoto(){
  G.state = 'help'; G.attract = true; G.subScreen = 'photo';
  const chips = function(list, cur, pre){ return list.map(function(nm, i){ return '<button class="pchip' + (i === cur ? ' on' : '') + '" data-a="' + pre + i + '">' + nm + '</button>'; }).join(''); };
  const tabs = [['scene', 'Scene and pose'], ['look', 'Look and light'], ['fx', 'Effects'], ['foes', 'Creatures'], ['album', 'Album']].map(function(t){
    return '<button class="pchip' + (PHOTO.tab === t[0] ? ' on' : '') + '" data-a="ward-photo-tab-' + t[0] + '">' + t[1] + '</button>'; }).join('');
  let body = '';
  const lab = function(txt){ return '<div class="plabel">' + txt + '</div>'; };
  const pick = function(names, ids, cur, pre){ return '<div class="pchips">' + ids.map(function(i){ return '<button class="pchip' + (i === cur ? ' on' : '') + '" data-a="' + pre + i + '">' + names[i] + '</button>'; }).join('') + '</div>'; };
  const range = function(a, z){ const o = []; for (let i = a; i < z; i++) o.push(i); return o; };
  if (PHOTO.tab === 'scene'){
    const pn = PHOTO_POSE.map(function(p){ return p.n; });
    body = lab('Backdrop') + pick(PHOTO_BG, range(0, Math.min(5, PHOTO_BG.length)), PHOTO.bg, 'ward-photo-bg-') +
      (PHOTO_BG.length > 5 ? lab('Chapter scenes') + pick(PHOTO_BG, range(5, PHOTO_BG.length), PHOTO.bg, 'ward-photo-bg-') : '') +
      lab('Calm poses') + pick(pn, [0, 1, 4, 5], PHOTO.pose, 'ward-photo-pose-') +
      lab('Action poses') + pick(pn, [2, 3, 6, 7, 8, 9], PHOTO.pose, 'ward-photo-pose-') +
      lab('Direction') + '<div class="pchips"><button class="pchip' + (PHOTO.flip ? ' on' : '') + '" data-a="ward-photo-flip">Turn her around</button></div>';
  } else if (PHOTO.tab === 'fx'){
    const chipsOf = function(list){ return '<div class="pchips">' + list.map(function(f){ return '<button class="pchip" data-a="ward-photo-fx-' + f[0] + '">' + f[1] + '</button>'; }).join('') + '</div>'; };
    const veh = PHOTO_FX.filter(function(f, i){ return i >= 15 && /^(car|plane|boat)_/.test(f[0]); }), things = PHOTO_FX.filter(function(f, i){ return i >= 15 && !/^(car|plane|boat|st)_/.test(f[0]); }), stickers = PHOTO_FX.filter(function(f){ return /^st_/.test(f[0]); });
    body = '<div class="sub" style="margin:2px 0">Click one to add it to the picture, then drag it where you want it.</div>' +
      lab('Effects') + chipsOf(PHOTO_FX.slice(0, 15)) + (veh.length ? lab('Vehicles') + chipsOf(veh) : '') + (things.length ? lab('Things') + chipsOf(things) : '') + (stickers.length ? lab('Stickers') + chipsOf(stickers) : '');  } else if (PHOTO.tab === 'look'){
    body = typeof photoLookBody === 'function' ? photoLookBody() : '';
  } else if (PHOTO.tab === 'album'){
    body = typeof photoAlbumHTML === 'function' ? photoAlbumHTML() : '';
  } else {
    const t = bestiaryTable(PHOTO.foeCh); let found = 0, cells = '';
    BESTIARY_ORDER.forEach(function(type){
      if (!t[type]) return;
      const known = photoFoeUnlocked(PHOTO.foeCh, type), nm = bestiaryName(PHOTO.foeCh, type).title;
      if (known) found++;
      cells += '<button class="pcell' + (known ? '' : ' locked') + '" ' + (known ? 'data-a="ward-photo-foe-' + PHOTO.foeCh + '-' + type + '"' : 'disabled') +
        ' title="' + (known ? nm : 'Defeat this creature in a run to unlock it') + '"><canvas width="72" height="72" data-pch="' + PHOTO.foeCh + '" data-pfoe="' + type + '"></canvas><span>' + (known ? nm : '???') + '</span></button>';
    });
    body = '<div class="sub" style="margin:2px 0">Creatures you have defeated can be placed in the picture. Chapter ' + PHOTO.foeCh + ' (' + BESTIARY_CHAPTERS[PHOTO.foeCh - 1] + '): ' + found + ' found.</div>' +
      '<div class="pchips">' + BESTIARY_CHAPTERS.map(function(_, i){ return '<button class="pchip' + (i + 1 === PHOTO.foeCh ? ' on' : '') + '" data-a="ward-photo-foech-' + (i + 1) + '">' + chapterLabel(i + 1) + '</button>'; }).join('') + '</div>' +
      '<div class="pgrid">' + cells + '</div>';
  }
  setOverlay(
    '<div class="panel slab wide" style="max-width:900px">' +
      '<h2 class="head">Photo</h2>' +
      '<canvas id="photoCv" width="960" height="540" style="display:block;margin:4px auto 8px;max-width:100%;border-radius:10px;background:#222"></canvas>' +
      '<div class="pchips" id="photoAct">' +
        '<button class="pchip" data-a="ward-photo-act-smaller">Smaller</button><button class="pchip" data-a="ward-photo-act-bigger">Bigger</button>' +
        '<button class="pchip" data-a="ward-photo-act-turn">Turn around</button><button class="pchip" data-a="ward-photo-act-rotate">Tilt</button>' +
        '<button class="pchip" data-a="ward-photo-act-delete">Remove</button><button class="pchip" data-a="ward-photo-act-clear">Remove all</button>' +
      '</div>' +
      '<div class="sub" id="photoSel" style="min-height:20px;margin:2px 0 6px"></div>' +
      '<div class="pchips tabrow">' + tabs + '</div>' +
      '<div class="photobody">' + body + '</div>' +
      '<div class="sub" id="photoMsg" style="min-height:20px;margin:4px 0"></div>' +
      '<div class="row"><button class="btn sm" data-a="ward-photo-save">Save picture</button><button class="btn sm ghost" data-a="ward-photo-copy">Copy</button><button class="btn sm ghost" data-a="ward-album">Open album</button><button class="btn sm ghost" data-a="wardrobe">Back to the wardrobe</button></div>' +
    '</div>');
  photoDraw(); photoBind(); photoThumbs();
}
function photoMsg(t){ const e = document.getElementById('photoMsg'); if (e) e.textContent = t; }
function photoBlob(cb){
  const out = document.createElement('canvas'); out.width = 960; out.height = 540;
  photoRender(out, false);
  if (!out.toBlob){ cb(null); return; }
  out.toBlob(cb, 'image/png');
}
function photoAdd(it){
  if (PHOTO.items.length >= PHOTO_MAX){ SFX.deny(); photoMsg('That is the most the picture can hold (' + PHOTO_MAX + '). Remove something first.'); return; }
  PHOTO.items.push(it); PHOTO.sel = PHOTO.items.length - 1; SFX.pick(); photoDraw();
}
function photoAct(kind){
  const k = PHOTO.sel;
  if (kind === 'clear'){ PHOTO.items.length = 0; PHOTO.sel = -2; SFX.click(); photoDraw(); return; }
  if (k === -2){ SFX.deny(); photoMsg('Select something in the picture first.'); return; }
  if (k === -1){
    if (kind === 'smaller') PHOTO.gs = Math.max(0.5, PHOTO.gs - 0.12);
    else if (kind === 'bigger') PHOTO.gs = Math.min(1.7, PHOTO.gs + 0.12);
    else if (kind === 'turn') PHOTO.flip = !PHOTO.flip;
    else { SFX.deny(); return; }
  } else {
    const it = PHOTO.items[k]; if (!it) return;
    if (kind === 'smaller') it.s = Math.max(0.3, it.s * 0.85);
    else if (kind === 'bigger') it.s = Math.min(3.2, it.s * 1.18);
    else if (kind === 'turn') it.f = !it.f;
    else if (kind === 'rotate') it.r = ((it.r || 0) + 0.26) % TAU;
    else if (kind === 'delete'){ PHOTO.items.splice(k, 1); PHOTO.sel = -2; }
  }
  SFX.click(); photoDraw();
}
function photoAction(a){
  if (a === 'ward-photo'){ SFX.click(); showPhoto(); return true; }
  let m = /^ward-photo-tab-(scene|look|fx|foes|album)$/.exec(a);
  if (m){ PHOTO.tab = m[1]; SFX.click(); showPhoto(); return true; }
  m = /^ward-photo-(bg|pose)-(\d+)$/.exec(a);
  if (m){ PHOTO[m[1]] = +m[2]; if (m[1] === 'pose') PHOTO.sel = -1; SFX.click(); showPhoto(); return true; }
  if (a === 'ward-photo-flip'){ PHOTO.flip = !PHOTO.flip; SFX.click(); showPhoto(); return true; }
  m = /^ward-photo-fx-([a-z0-9_]+)$/.exec(a);
  if (m){ if (PHOTO_FXDRAW[m[1]]) photoAdd({ t: 'fx', id: m[1], x: 480 + (Math.random() - 0.5) * 240, y: 200 + (Math.random() - 0.5) * 120, s: 1, f: false, r: 0 }); return true; }
  m = /^ward-photo-foech-(\d+)$/.exec(a);
  if (m){ PHOTO.foeCh = clamp(+m[1], 1, BESTIARY_CHAPTERS.length); SFX.click(); showPhoto(); return true; }
  m = /^ward-photo-foe-(\d+)-([a-z0-9]+)$/.exec(a);
  if (m){
    const ch = +m[1], type = m[2], def = bestiaryTable(ch) && bestiaryTable(ch)[type];
    if (!def || !photoFoeUnlocked(ch, type)){ SFX.deny(); return true; }       /* only creatures she has discovered */
    const left = PHOTO.items.length % 2 === 0, sc = photoFoeScale(def);
    photoAdd({ t: 'foe', id: type, ch: ch, x: left ? 190 + Math.random() * 90 : 690 + Math.random() * 90, y: PHOTO.gy - def.r * sc * 0.5, s: 1, f: !left, r: 0 });
    return true;
  }
  m = /^ward-photo-act-(smaller|bigger|turn|rotate|delete|clear)$/.exec(a);
  if (m){ photoAct(m[1]); return true; }
  if (a === 'ward-photo-save'){
    photoBlob(function(b){
      if (!b){ photoMsg('This browser cannot save the picture from here.'); return; }
      try {
        const u = URL.createObjectURL(b), l = document.createElement('a');
        l.href = u; l.download = 'giraffe-rampage.png'; document.body.appendChild(l); l.click(); l.remove();
        setTimeout(function(){ URL.revokeObjectURL(u); }, 4000);
        photoMsg('Saved as giraffe-rampage.png.');
      } catch (e) { photoMsg('Saving did not work in this browser.'); }
    });
    SFX.pick(); return true;
  }
  if (a === 'ward-photo-copy'){
    photoBlob(function(b){
      try {
        if (!b || !navigator.clipboard || !window.ClipboardItem){ photoMsg('Copying is not available here. Use Save picture instead.'); return; }
        navigator.clipboard.write([new ClipboardItem({ 'image/png': b })]).then(function(){ photoMsg('Copied to the clipboard.'); }, function(){ photoMsg('Copying was not allowed. Use Save picture instead.'); });
      } catch (e) { photoMsg('Copying is not available here. Use Save picture instead.'); }
    });
    SFX.click(); return true;
  }
  return false;
}
(function(){
  const prev = handleExtraAction;
  handleExtraAction = function(a){ return (a.indexOf('ward-photo') === 0 && photoAction(a)) || prev(a); };
})();
