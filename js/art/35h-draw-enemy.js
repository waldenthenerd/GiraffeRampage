'use strict';
/* Assembles ENEMY_LOOK_DRAW from every chapter table and draws an enemy (the Chapter 1 / Savannah creatures live in the switch inside drawEnemy). */
const ENEMY_LOOK_DRAW = Object.assign({}, ARCTIC_DRAW, SWAMP_DRAW, OCEAN_DRAW, JUNGLE_DRAW, CITY_DRAW, SPACE_DRAW, MARINE_DRAW, ALIEN_DRAW, INFERNO_DRAW);


Object.keys(A51_ALIAS).forEach(k => {
  const base = A51_ALIAS[k];
  ENEMY_LOOK_DRAW[k] = function(ctx, e, b, dk, bob, wind, d){
    MARINE_DRAW[base](ctx, e, b, dk, bob, wind, d);
    if (A51_HELMETED[base]) a51Gear(ctx, e, dk, bob);
  };
});

Object.assign(ENEMY_LOOK_DRAW, DUST_DRAW);
ENEMY_LOOK_DRAW.mars_warden = ENEMY_LOOK_DRAW.warden; ENEMY_LOOK_DRAW.mars_admiral = ENEMY_LOOK_DRAW.admiral;

/* ========================= CHAPTER 1 (SAVANNAH) CREATURE ART =========================
   One drawing function per animal, called from the cases in drawEnemy below. All of them draw in the creature's local space (center at 0,0, facing +x,
   +y is its right side), take the body color b and dark color dk (both blended toward white briefly when hit) and build every shade from those two.
   ch1_s / ch1_m memoise the shade() / blendHex() strings so that a crowd of enemies does not parse colors every frame. */
const CH1_MEMO = {}; let CH1_MEMO_N = 0;
const CH1_DASH_FINE = [1.3, 2.7], CH1_DASH_RING = [1.1, 4.4], CH1_DASH_NONE = [];
function ch1_s(hex, amt){
  const k = hex + amt, m = CH1_MEMO[k];
  if (m !== undefined) return m;
  if (CH1_MEMO_N > 900){ for (const q in CH1_MEMO) delete CH1_MEMO[q]; CH1_MEMO_N = 0; }
  CH1_MEMO_N++; return (CH1_MEMO[k] = shade(hex, amt));
}
function ch1_m(a, c, t){
  const k = a + c + t, m = CH1_MEMO[k];
  if (m !== undefined) return m;
  if (CH1_MEMO_N > 900){ for (const q in CH1_MEMO) delete CH1_MEMO[q]; CH1_MEMO_N = 0; }
  CH1_MEMO_N++; return (CH1_MEMO[k] = blendHex(a, c, t));
}
/* a spiky crest stripe running from x0 to x1 along y, hw half-width, n spikes per side */
function ch1_zig(ctx, x0, x1, y, hw, n, c){
  const st = (x1 - x0) / n;
  ctx.fillStyle = c; ctx.beginPath(); ctx.moveTo(x0, y);
  for (let i = 0; i < n; i++){ ctx.lineTo(x0 + st * (i + 0.5), y - hw); ctx.lineTo(x0 + st * (i + 1), y - hw * 0.4); }
  ctx.lineTo(x1, y);
  for (let i = n - 1; i >= 0; i--){ ctx.lineTo(x0 + st * (i + 0.5), y + hw); ctx.lineTo(x0 + st * i, y + hw * 0.4); }
  ctx.closePath(); ctx.fill();
}
/* the four legs of a walking quadruped: front pair at xf, rear pair at xr, spanning y = yi .. yo out from the body; sw is the stride, in px */
function ch1_leg4(ctx, xf, xr, yi, yo, sw, w, c, pr, pc){
  ctx.strokeStyle = c; ctx.lineWidth = w; ctx.lineCap = 'round'; ctx.beginPath();
  ctx.moveTo(xf, -yi); ctx.lineTo(xf + sw, -yo);
  ctx.moveTo(xf, yi); ctx.lineTo(xf - sw, yo);
  ctx.moveTo(xr, -yi); ctx.lineTo(xr - sw, -yo);
  ctx.moveTo(xr, yi); ctx.lineTo(xr + sw, yo);
  ctx.stroke(); ctx.lineCap = 'butt';
  if (pr > 0){                                                                           /* paws: little ovals, long along the stride */
    lkOV(ctx, xf + sw + pr * 0.3, -yo, pr * 1.35, pr * 0.9, pc); lkOV(ctx, xf - sw + pr * 0.3, yo, pr * 1.35, pr * 0.9, pc);
    lkOV(ctx, xr - sw + pr * 0.3, -yo, pr * 1.35, pr * 0.9, pc); lkOV(ctx, xr + sw + pr * 0.3, yo, pr * 1.35, pr * 0.9, pc);
  }
}
/* a small eye: colored iris, dark pupil, tiny highlight */
function ch1_eye(ctx, x, y, r, iris){
  fillCircle(ctx, x, y, r, iris);
  fillCircle(ctx, x + r * 0.18, y, r * 0.55, '#2B1D12');
  fillCircle(ctx, x + r * 0.4, y - r * 0.38, r * 0.28, '#FFF6DC');
}
/* a tapering curved stroke drawn as a sprinkling of round tufts: used for tails */
function ch1_tuft(ctx, x, y, n, len, spread, c){
  ctx.fillStyle = c; ctx.beginPath();
  for (let i = 0; i < n; i++){
    const a = (i - (n - 1) / 2) * spread;
    ctx.moveTo(x, y - 1.4); ctx.lineTo(x - Math.cos(a) * len, y - Math.sin(a) * len); ctx.lineTo(x, y + 1.4);
  }
  ctx.fill();
}

function ch1_hyena(ctx, e, b, dk, bob){
  const a = e.anim, sw = Math.sin(a * 1.7) * 2.4, wag = Math.sin(a * 2.2);
  const hi = ch1_s(b, 0.22), lo = ch1_m(b, dk, 0.32), spot = ch1_m(b, dk, 0.55), rim = ch1_s(dk, -0.12);
  ch1_leg4(ctx, 8, -9, 7, 13.4, sw, 3.4, lo, 2.2, ch1_s(dk, 0.08));
  lkCV(ctx, -15, bob, -20, bob + wag * 3, -24, bob + wag * 5, 3.8, lo);                 /* short bushy tail */
  lkOV(ctx, -25, bob + wag * 5.4, 3.2, 2.4, dk, wag * 0.5);
  lkOV(ctx, -1, bob, 18.3, 11.5, rim);                                                   /* body: rim, rump, back, shoulders */
  lkOV(ctx, -1, bob, 17, 10.3, b);
  lkOV(ctx, 5, bob, 9.6, 11.3, b);
  lkOV(ctx, -2, bob - 8.6, 11, 1.8, hi); lkOV(ctx, -2, bob + 8.6, 11, 1.8, hi);          /* rim light along the flanks */
  lkOV(ctx, -10, bob + 4, 7.2, 4.4, ch1_s(b, -0.07), 0.25); lkOV(ctx, -10, bob - 4, 7.2, 4.4, ch1_s(b, -0.07), -0.25);
  ch1_zig(ctx, 12, -9, bob, 3, 7, ch1_m(b, dk, 0.72));                                    /* dark mane crest */
  ctx.fillStyle = spot; ctx.beginPath();                                                 /* spots */
  const sp = [-13, -4.6, 2.2, -8.5, 5.2, 2.5, -4, -6.2, 2, 0.5, 6.4, 2.3, -6, 1, 1.9, -15, 2.4, 1.6, 8, -7.4, 1.7, 3, -2.4, 1.5];
  for (let i = 0; i < sp.length; i += 3){ ctx.moveTo(sp[i] + sp[i + 2], bob + sp[i + 1]); ctx.arc(sp[i], bob + sp[i + 1], sp[i + 2], 0, TAU); }
  ctx.fill();
  lkOV(ctx, 11.5, bob, 5.2, 6.6, b);                                                     /* neck, head */
  lkOV(ctx, 15, bob, 7.2, 6.3, b);
  lkOV(ctx, 20.6, bob, 4.8, 3.7, lo);                                                    /* muzzle */
  lkOV(ctx, 19.2, bob, 3.2, 1.2, ch1_s(lo, 0.18));
  lkOV(ctx, 24.4, bob, 1.9, 1.6, '#2B1D12');
  for (let s = -1; s <= 1; s += 2){
    lkOV(ctx, 10.6, bob + s * 6.7, 3.5, 3.2, dk);                                        /* round ears */
    lkOV(ctx, 11.2, bob + s * 6.7, 2, 1.8, ch1_m(b, '#D9A890', 0.5));
    lkTRI(ctx, 13, bob + s * 5.8, 9.4, bob + s * 8.8, 12.4, bob + s * 7.4, hi);          /* cheek ruff */
    ch1_eye(ctx, 17.6, bob + s * 3.1, 1.35, '#FFD23F');
  }
}

function ch1_cheetah(ctx, e, b, dk, bob, wind){
  const a = e.anim, sw = Math.sin(a * 1.9) * 3, t1 = Math.sin(a * 2);
  const hi = ch1_s(b, 0.28), lo = ch1_m(b, dk, 0.28), spot = ch1_m(b, dk, 0.62), rim = ch1_s(dk, 0.05);
  if (wind){ ctx.strokeStyle = '#FFFFFF'; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(0, 0, 22, 12, 0, 0, TAU); ctx.stroke(); }
  ctx.lineCap = 'round'; ctx.lineWidth = 3.4; ctx.strokeStyle = b;                       /* long ringed tail with a dark tip */
  ctx.beginPath(); ctx.moveTo(-15, bob); ctx.quadraticCurveTo(-26, bob + t1 * 7, -32, bob + t1 * 11); ctx.stroke();
  ctx.strokeStyle = spot; ctx.setLineDash(CH1_DASH_FINE); ctx.stroke(); ctx.setLineDash(CH1_DASH_NONE);
  ctx.lineCap = 'butt';
  fillCircle(ctx, -32.4, bob + t1 * 11, 2.3, dk);
  ch1_leg4(ctx, 9.5, -10, 5, 11, sw, 2.8, lo, 2, dk);
  lkOV(ctx, 0, bob, 18.7, 9.4, rim);
  lkOV(ctx, 0, bob, 18, 8.6, b);
  lkOV(ctx, -10, bob + 5.4, 6, 3.6, ch1_s(b, -0.08), 0.3); lkOV(ctx, -10, bob - 5.4, 6, 3.6, ch1_s(b, -0.08), -0.3);   /* haunches */
  lkOV(ctx, -1, bob - 6.6, 13.5, 1.5, hi); lkOV(ctx, -1, bob + 6.6, 13.5, 1.5, hi);
  ctx.fillStyle = spot; ctx.beginPath();
  const sp = [-14, -3.4, 1.7, -9.5, 4.2, 1.6, -6.5, -5.4, 1.5, -3, 1.4, 1.4, 0, -3.2, 1.7, 3, 5.2, 1.5, 6, -1, 1.4, 8.6, -5.2, 1.4, 10, 3.2, 1.5, -16, 0.8, 1.2, -1, 6.4, 1.2, 4.6, -6.6, 1.2, -11.5, 0.6, 1.3, 12.5, -2, 1.1];
  for (let i = 0; i < sp.length; i += 3){ ctx.moveTo(sp[i] + sp[i + 2], bob + sp[i + 1]); ctx.arc(sp[i], bob + sp[i + 1], sp[i + 2], 0, TAU); }
  ctx.fill();
  lkOV(ctx, 12, bob, 4.2, 5, b);
  lkOV(ctx, 16, bob, 6.4, 5.6, b);                                                       /* small round head */
  lkOV(ctx, 20.2, bob, 3.4, 2.7, hi);                                                    /* pale muzzle */
  lkOV(ctx, 23.2, bob, 1.5, 1.3, '#2B1D12');
  for (let s = -1; s <= 1; s += 2){
    lkOV(ctx, 12.8, bob + s * 5.2, 2.2, 2, dk);
    lkOV(ctx, 13.3, bob + s * 5.2, 1.2, 1.1, hi);
    lkLN(ctx, [18.6, bob + s * 3.1, 20.6, bob + s * 5.2], 1.3, dk);                      /* the black tear lines */
    ch1_eye(ctx, 18.6, bob + s * 2.6, 1.3, '#FFE066');
  }
}

function ch1_rhino(ctx, e, b, dk, bob, wind){
  const a = e.anim, sw = Math.sin(a * 1.4) * 2.6, wag = Math.sin(a * 2);
  const hi = ch1_s(b, 0.2), lo = ch1_m(b, dk, 0.55), rim = ch1_s(dk, -0.25);
  if (wind){ ctx.strokeStyle = '#FF6A4A'; ctx.lineWidth = 4; ctx.beginPath(); ctx.ellipse(0, 0, 32, 22, 0, 0, TAU); ctx.stroke(); }
  lkLN(ctx, [-27, bob, -33, bob + wag * 2.6, -37, bob + wag * 4], 2.2, dk);              /* thin tail with a tuft */
  lkOV(ctx, -37.5, bob + wag * 4, 3, 2, rim);
  ch1_leg4(ctx, 14, -17, 14, 21, sw, 8.4, lo, 4.4, dk);                                  /* thick pillar legs */
  lkOV(ctx, -2, bob, 28, 20.2, rim);
  lkOV(ctx, -2, bob, 27, 19, b);
  lkOV(ctx, -4, bob - 9, 20, 5.6, hi); lkOV(ctx, -4, bob + 9.5, 18, 3.4, ch1_s(b, 0.08));   /* sheen on the barrel */
  lkOV(ctx, -15, bob, 10.4, 15, lo);                                                     /* hip plate */
  lkOV(ctx, -15, bob - 1.4, 7.6, 11, ch1_m(b, dk, 0.3));
  ctx.strokeStyle = rim; ctx.lineWidth = 1.7; ctx.lineCap = 'round'; ctx.globalAlpha = 0.7;   /* skin folds behind the shoulder and across the hip */
  ctx.beginPath();
  ctx.moveTo(6, bob - 15.5); ctx.quadraticCurveTo(0, bob, 6, bob + 15.5);
  ctx.moveTo(-5, bob - 16.5); ctx.quadraticCurveTo(-9, bob, -5, bob + 16.5);
  ctx.moveTo(-21, bob - 12); ctx.quadraticCurveTo(-18, bob - 6, -22, bob - 2);
  ctx.moveTo(-21, bob + 12); ctx.quadraticCurveTo(-18, bob + 6, -22, bob + 2);
  ctx.stroke(); ctx.globalAlpha = 1; ctx.lineCap = 'butt';
  lkOV(ctx, 10, bob, 6.6, 13.4, lo);                                                     /* shoulder shield */
  lkOV(ctx, 11, bob - 1, 4.6, 9.6, ch1_m(b, dk, 0.25));
  lkOV(ctx, 17, bob, 8, 12.2, rim);                                                      /* neck and head */
  lkOV(ctx, 22, bob, 13, 10.6, b);
  lkOV(ctx, 31.5, bob, 6.4, 7.6, ch1_s(b, 0.06));
  lkOV(ctx, 31, bob - 5, 4, 1.6, hi); lkOV(ctx, 31, bob + 5, 4, 1.6, hi);
  fillCircle(ctx, 35, bob - 3.3, 1, rim); fillCircle(ctx, 35, bob + 3.3, 1, rim);        /* nostrils */
  for (let s = -1; s <= 1; s += 2){
    lkOV(ctx, 14.5, bob + s * 10.2, 4.2, 3, rim, s * 0.55);                              /* ears */
    lkOV(ctx, 14.9, bob + s * 10.2, 2.5, 1.7, ch1_m(b, '#C9A7A0', 0.5), s * 0.55);
    ch1_eye(ctx, 25, bob + s * 7.4, 1.6, '#8A5A2A');
    lkLN(ctx, [23, bob + s * 8.8, 28, bob + s * 8.2], 1.2, rim);
  }
  lkOV(ctx, 29, bob, 4, 5.4, lo);                                                        /* horn bases */
  lkTRI(ctx, 29, bob - 4.8, 46, bob, 29, bob + 4.8, '#E8E0D2');                          /* the big nose horn, shaded along its lower edge */
  lkTRI(ctx, 29, bob, 46, bob, 29, bob + 4.8, '#C9BFAC');
  lkOV(ctx, 29.5, bob, 2, 4.8, '#8A7A60');
  lkTRI(ctx, 21.6, bob - 3, 31, bob, 21.6, bob + 3, '#E8E0D2');                          /* the smaller second horn */
  lkTRI(ctx, 21.6, bob, 31, bob, 21.6, bob + 3, '#C9BFAC');
}

function ch1_termite(ctx, e, b, dk, bob){
  const a = e.anim, hi = ch1_s(b, 0.32), lo = ch1_m(b, dk, 0.45), head = ch1_m(b, dk, 0.62);
  ctx.strokeStyle = dk; ctx.lineWidth = 1.7; ctx.lineCap = 'round'; ctx.lineJoin = 'round';   /* six jointed legs, walking */
  ctx.beginPath();
  for (let i = 0; i < 3; i++){
    const x = 5 - i * 7.4, ph = Math.sin(a * 2.3 + i * 2.1) * 2.4, fx = x + (i - 1) * 2.2; ctx.lineWidth = 2;
    ctx.moveTo(x, bob - 4.6); ctx.lineTo(fx + 1.4 + ph, bob - 11.6); ctx.lineTo(fx + ph * 1.2 + (i - 1) * 1.6, bob - 17);
    ctx.moveTo(x, bob + 4.6); ctx.lineTo(fx + 1.4 - ph, bob + 11.6); ctx.lineTo(fx - ph * 1.2 + (i - 1) * 1.6, bob + 17);
  }
  ctx.stroke(); ctx.lineCap = 'butt'; ctx.lineJoin = 'miter';
  lkOV(ctx, -9, bob, 13.4, 10.6, dk);                                                    /* swollen abdomen with pale growth bands */
  lkOV(ctx, -9, bob, 12.4, 9.6, b);
  lkOV(ctx, -12, bob - 3.6, 7.5, 2.2, hi, -0.08);
  ctx.strokeStyle = lo; ctx.lineWidth = 1.5; ctx.lineCap = 'round'; ctx.beginPath();
  for (let i = 0; i < 4; i++){ const x = -17 + i * 5, h = 9.2 * Math.sqrt(Math.max(0, 1 - ((x + 9) / 12.4) * ((x + 9) / 12.4))); ctx.moveTo(x, bob - h); ctx.quadraticCurveTo(x + 1.6, bob, x, bob + h); }
  ctx.stroke(); ctx.lineCap = 'butt';
  lkOV(ctx, 3.6, bob, 8, 7.2, dk);                                                       /* thorax with a pale plate */
  lkOV(ctx, 3.6, bob, 7.2, 6.4, b);
  lkOV(ctx, 4, bob, 4, 5.2, hi);
  lkOV(ctx, 14.6, bob, 7.8, 6.8, dk);                                                    /* big soldier head */
  lkOV(ctx, 14.6, bob, 7, 6, head);
  lkOV(ctx, 13.4, bob - 1.2, 3.8, 2.4, ch1_s(head, 0.2));
  ctx.strokeStyle = dk; ctx.lineWidth = 1.9; ctx.lineCap = 'round';                      /* sickle mandibles and beaded antennae */
  ctx.beginPath();
  ctx.moveTo(19.6, bob - 3.2); ctx.quadraticCurveTo(26, bob - 6.4, 27, bob - 0.8);
  ctx.moveTo(19.6, bob + 3.2); ctx.quadraticCurveTo(26, bob + 6.4, 27, bob + 0.8);
  ctx.stroke();
  ctx.lineWidth = 1.5; ctx.setLineDash(CH1_DASH_RING); ctx.beginPath();
  const aw = Math.sin(a * 1.6) * 1.6;
  ctx.moveTo(18, bob - 4); ctx.quadraticCurveTo(24, bob - 9 + aw, 28, bob - 13 + aw);
  ctx.moveTo(18, bob + 4); ctx.quadraticCurveTo(24, bob + 9 - aw, 28, bob + 13 - aw);
  ctx.stroke(); ctx.setLineDash(CH1_DASH_NONE); ctx.lineCap = 'butt';
  ch1_eye(ctx, 16.8, bob - 3.6, 1.4, '#FF8A4A'); ch1_eye(ctx, 16.8, bob + 3.6, 1.4, '#FF8A4A');
}

function ch1_grub(ctx, e, b, dk, bob){
  const a = e.anim, hi = ch1_s(b, 0.25), lo = ch1_m(b, dk, 0.35), rim = ch1_m(dk, b, 0.25);
  ctx.strokeStyle = rim; ctx.lineWidth = 1.1; ctx.lineCap = 'round'; ctx.beginPath();    /* three pairs of stubby legs */
  for (let i = 0; i < 3; i++){ const x = 2.6 - i * 3.6; ctx.moveTo(x, bob - 4); ctx.lineTo(x + 0.8, bob - 7); ctx.moveTo(x, bob + 4); ctx.lineTo(x + 0.8, bob + 7); }
  ctx.stroke(); ctx.lineCap = 'butt';
  /* five plump segments, wriggling */
  for (let i = 0; i < 5; i++){
    const x = -8.4 + i * 3.7, y = bob + Math.sin(a * 2.4 - i * 0.9) * 0.9, r = 3.2 + 1.7 * Math.sin((i + 0.6) / 5.4 * Math.PI);
    fillCircle(ctx, x, y, r + 0.7, rim);
  }
  for (let i = 0; i < 5; i++){
    const x = -8.4 + i * 3.7, y = bob + Math.sin(a * 2.4 - i * 0.9) * 0.9, r = 3.2 + 1.7 * Math.sin((i + 0.6) / 5.4 * Math.PI);
    fillCircle(ctx, x, y, r, i % 2 ? b : ch1_s(b, 0.07));
    fillCircle(ctx, x - 0.4, y - r * 0.38, r * 0.4, hi);
    fillCircle(ctx, x + 0.3, y + r * 0.55, 0.65, lo);
  }
  const hy = bob + Math.sin(a * 2.4 - 4.5) * 0.9;
  lkOV(ctx, 9.4, hy, 3.6, 3.3, dk);                                                      /* head capsule with tiny jaws */
  lkOV(ctx, 9.1, hy - 0.5, 2.2, 1.4, ch1_s(dk, 0.2));
  lkLN(ctx, [12, hy - 1.2, 13.6, hy - 0.4], 1, dk); lkLN(ctx, [12, hy + 1.2, 13.6, hy + 0.4], 1, dk);
  fillCircle(ctx, 10.4, hy - 1.7, 0.75, '#F2E6C0'); fillCircle(ctx, 10.4, hy + 1.7, 0.75, '#F2E6C0');
}

function ch1_jackal(ctx, e, b, dk, bob){
  const a = e.anim, sw = Math.sin(a * 2) * 2.6, wag = Math.sin(a * 2.4);
  const hi = ch1_s(b, 0.2), lo = ch1_m(b, dk, 0.3), saddle = ch1_m(b, dk, 0.52), rim = ch1_s(dk, -0.1);
  lkCV(ctx, -14, bob, -20, bob + wag * 3, -25, bob + wag * 6, 3.6, b);                   /* brush tail with a dark tip */
  lkOV(ctx, -26, bob + wag * 6.2, 3.2, 2.2, dk, wag * 0.5);
  ch1_leg4(ctx, 8, -8, 5.2, 10.6, sw, 2.5, lo, 1.8, dk);
  lkOV(ctx, -2, bob, 16, 8.9, rim);
  lkOV(ctx, -2, bob, 15, 8, b);
  lkOV(ctx, -3, bob, 11.6, 4.9, saddle);                                                 /* dark saddle over the back */
  lkOV(ctx, 0, bob, 8, 2.7, ch1_s(saddle, 0.12));
  lkOV(ctx, -2, bob - 6.5, 11, 1.4, hi); lkOV(ctx, -2, bob + 6.5, 11, 1.4, hi);
  lkOV(ctx, 9.5, bob, 4.4, 5, b);
  lkOV(ctx, 13.5, bob, 6.6, 5.2, b);
  lkOV(ctx, 18.6, bob, 4.8, 2.9, hi);                                                    /* slim pale muzzle */
  lkOV(ctx, 22.2, bob, 1.6, 1.3, '#2B1D12');
  for (let s = -1; s <= 1; s += 2){
    lkTRI(ctx, 9.6, bob + s * 4.6, 6, bob + s * 13.6, 13.4, bob + s * 6, dk);            /* tall ears with pale inners */
    lkTRI(ctx, 9.8, bob + s * 5.4, 7.6, bob + s * 11.2, 12, bob + s * 6.2, ch1_m(b, '#D8B8A0', 0.45));
    ch1_eye(ctx, 16.2, bob + s * 2.6, 1.3, '#FFD23F');
  }
}

function ch1_warthog(ctx, e, b, dk, bob, wind){
  const a = e.anim, sw = Math.sin(a * 1.5) * 2.5, wag = Math.sin(a * 2.6);
  const hi = ch1_s(b, 0.24), lo = ch1_m(b, dk, 0.45), rim = ch1_s(dk, -0.2), mane = ch1_m(b, '#E8E0D2', 0.4);
  if (wind){ ctx.strokeStyle = '#FF9C6A'; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(0, 0, 26, 17, 0, 0, TAU); ctx.stroke(); }
  lkCV(ctx, -21, bob, -26, bob - 3 + wag * 2, -29, bob + 3 + wag * 4, 1.8, dk);         /* thin tail and a tuft */
  ch1_tuft(ctx, -29, bob + 3 + wag * 4, 3, 5, 0.5, mane);
  ch1_leg4(ctx, 9, -12, 9.5, 15.5, sw, 4.4, lo, 2.8, rim);
  lkOV(ctx, -3, bob, 21, 14.2, rim);
  lkOV(ctx, -3, bob, 20, 13, b);
  lkOV(ctx, -15, bob, 7.4, 10.6, lo);                                                    /* dark haunch */
  lkOV(ctx, -3, bob - 9.6, 14, 2.3, hi); lkOV(ctx, -3, bob + 9.6, 14, 2.3, hi);
  lkOV(ctx, 3, bob, 9, 9.6, ch1_s(b, 0.06));
  ch1_zig(ctx, 14, -21, bob, 3.8, 9, ch1_m(b, dk, 0.78));                                /* dark spiky mane with pale tips */
  ch1_zig(ctx, 11, -17, bob, 2, 7, ch1_m(b, '#E8E0D2', 0.3));
  lkOV(ctx, 11, bob, 6, 8, b);
  lkOV(ctx, 16.6, bob, 9.6, 8.2, b);
  lkOV(ctx, 17.6, bob, 5.2, 4, hi);                                                      /* forehead */
  lkOV(ctx, 23.2, bob, 5, 5.8, lo);                                                      /* snout disc */
  lkOV(ctx, 24, bob, 3, 4, ch1_s(lo, 0.14));
  fillCircle(ctx, 26.3, bob - 1.7, 0.95, '#1E1610'); fillCircle(ctx, 26.3, bob + 1.7, 0.95, '#1E1610');
  for (let s = -1; s <= 1; s += 2){
    lkCV(ctx, 22, bob + s * 4.2, 30, bob + s * 5.2, 33.5, bob + s * 10.6, 2.4, '#E8E0D2');   /* curling tusks */
    lkCV(ctx, 24, bob + s * 4.6, 30, bob + s * 6, 33, bob + s * 10.4, 1.2, '#BFB59E');
    lkOV(ctx, 11.4, bob + s * 7.6, 3.1, 2.3, lo, s * 0.4);                               /* warts and ears */
    lkOV(ctx, 15.8, bob + s * 8, 2.2, 1.7, lo, s * 0.2);
    lkOV(ctx, 8, bob + s * 7.6, 3.6, 2.7, dk, s * 0.7);
    ch1_tuft(ctx, 6.4, bob + s * 8.6, 3, 4, 0.5, mane);
    ch1_eye(ctx, 19.2, bob + s * 3.6, 1.4, '#C98A2A');
  }
}

function ch1_baboon(ctx, e, b, dk, bob){
  const a = e.anim, sw = Math.sin(a * 1.7) * 2.2, tw = Math.sin(a * 1.4) * 2.4;
  const hi = ch1_s(b, 0.2), lo = ch1_m(b, dk, 0.4), cape = ch1_m(b, '#CDBBA0', 0.3), face = ch1_m(b, dk, 0.62), rim = ch1_s(dk, -0.12);
  lkCV(ctx, -13, bob, -22 + tw * 0.4, bob - 8, -20 + tw, bob - 16, 2.4, dk);            /* long tail held up in an arc */
  lkOV(ctx, -20 + tw, bob - 16.6, 2.4, 2, rim);
  ch1_leg4(ctx, 5, -9, 8, 13, sw, 3.2, lo, 2.1, rim);
  lkOV(ctx, -3, bob, 13, 13, rim);
  lkOV(ctx, -3, bob, 12, 12, b);
  lkOV(ctx, -10, bob, 6.4, 8.8, ch1_s(b, -0.06));                                        /* hips with the pink sitting pads */
  fillCircle(ctx, -14.4, bob - 2.6, 2.1, '#C9707A'); fillCircle(ctx, -14.4, bob + 2.6, 2.1, '#C9707A');
  lkOV(ctx, 3, bob, 10, 11.4, cape);                                                     /* pale shoulder mantle */
  ch1_zig(ctx, 9, -4, bob, 6.6, 6, ch1_s(cape, 0.12));
  lkOV(ctx, 2, bob, 5, 6, ch1_m(cape, b, 0.4));
  lkOV(ctx, 12.4, bob, 8, 7.2, b);                                                       /* head */
  lkOV(ctx, 20, bob, 6, 3.9, face);                                                      /* long dark muzzle */
  lkOV(ctx, 24.4, bob, 2.4, 2.6, rim);
  fillCircle(ctx, 25, bob - 1.1, 0.7, '#6A5A50'); fillCircle(ctx, 25, bob + 1.1, 0.7, '#6A5A50');
  lkLN(ctx, [15.4, bob - 5.2, 16.4, bob, 15.4, bob + 5.2], 2.1, rim);                    /* heavy brow */
  for (let s = -1; s <= 1; s += 2){
    lkOV(ctx, 9.2, bob + s * 7, 2.5, 2.1, rim);
    lkOV(ctx, 9.6, bob + s * 7, 1.4, 1.1, ch1_m(b, '#D9B2A0', 0.5));
    ch1_eye(ctx, 16.2, bob + s * 3.1, 1.35, '#E0A838');
  }
}

function ch1_honeybadger(ctx, e, b, dk, bob, d){
  const a = e.anim, pale = d.pale || '#E8E4D8', sw = Math.sin(a * 2.4) * 2.2, heat = (e.glimHeat || 0) > 0.4;
  const fur = ch1_s(b, 0.22), mantle = ch1_m(pale, b, 0.18), edge = ch1_s(pale, 0.2);
  lkOV(ctx, -18, bob + Math.sin(a * 2) * 1.2, 4.2, 3.2, b);                              /* short bushy tail */
  lkOV(ctx, -18.4, bob + Math.sin(a * 2) * 1.2, 2.6, 1.6, fur);
  ch1_leg4(ctx, 9, -9, 6, 10.6, sw, 3.6, dk, 2.5, dk);
  ctx.strokeStyle = '#D8D0C0'; ctx.lineWidth = 0.9; ctx.lineCap = 'round'; ctx.beginPath();   /* long digging claws on the front paws */
  ctx.moveTo(9 + sw + 1.6, bob - 10.6); ctx.lineTo(9 + sw + 5, bob - 11.6); ctx.moveTo(9 + sw + 1.4, bob - 9.4); ctx.lineTo(9 + sw + 4.8, bob - 9.4);
  ctx.moveTo(9 - sw + 1.6, bob + 10.6); ctx.lineTo(9 - sw + 5, bob + 11.6); ctx.moveTo(9 - sw + 1.4, bob + 9.4); ctx.lineTo(9 - sw + 4.8, bob + 9.4);
  ctx.stroke(); ctx.lineCap = 'butt';
  lkOV(ctx, 0, bob, 17.8, 9.8, fur);                                                     /* black body, lighter fur edge */
  lkOV(ctx, 0, bob, 17, 9, b);
  lkOV(ctx, -2, bob, 15.4, 7.4, mantle);                                                 /* the pale mantle over the whole back */
  lkOV(ctx, -3, bob - 2.4, 11, 2.6, edge);
  lkOV(ctx, -4, bob + 3.4, 11, 2, ch1_m(mantle, b, 0.3));
  lkLN(ctx, [10, bob, 2, bob + 0.4, -8, bob - 0.4, -15, bob], 1, ch1_m(mantle, b, 0.35));
  lkOV(ctx, 13.6, bob, 7.4, 6.2, b);
  lkOV(ctx, 12.2, bob, 5.2, 3.9, mantle);                                                /* pale crown */
  lkOV(ctx, 19.2, bob, 3.8, 2.8, ch1_s(b, 0.1));
  lkOV(ctx, 22.4, bob, 1.5, 1.3, '#1A1210');
  for (let s = -1; s <= 1; s += 2){
    lkOV(ctx, 9.4, bob + s * 5.6, 1.9, 1.7, b); lkOV(ctx, 9.6, bob + s * 5.6, 1, 0.9, fur);
    ch1_eye(ctx, 17.2, bob + s * 3.2, 1.3, heat ? '#FF5A32' : '#E3B64A');
  }
}

function ch1_mamba(ctx, e, b, dk, bob, wind){
  const a3 = e.anim * 3, N = 10, hi = ch1_m(b, '#C8E080', 0.4), lo = ch1_m(b, dk, 0.45);
  for (let pass = 0; pass < 2; pass++){
    for (let i = 0; i < N; i++){
      const t = i / (N - 1), x = -22 + t * 36, y = bob + Math.sin(a3 + t * 5.4) * 5.2 * (1 - t * 0.55), r = 1.5 + 2.4 * Math.sin(Math.min(1, t * 1.15) * 1.57);
      if (pass === 0) fillCircle(ctx, x, y, r + 0.9, dk);
      else {
        fillCircle(ctx, x, y, r, i % 2 ? b : ch1_s(b, 0.06));
        fillCircle(ctx, x, y - r * 0.2, r * 0.42, hi);
        if (i % 2 && i > 1) fillCircle(ctx, x - 0.2, y + r * 0.45, 0.65, lo);
      }
    }
  }
  const hy = bob;
  lkOV(ctx, 17.8, hy, 6, 3.9, dk);                                                       /* wedge head with a brow */
  lkOV(ctx, 17.8, hy, 5.2, 3.2, b);
  lkOV(ctx, 21.6, hy, 3.4, 2.3, ch1_s(b, 0.1));
  lkOV(ctx, 16.6, hy, 3, 1.1, hi);
  fillCircle(ctx, 24, hy - 0.8, 0.5, dk); fillCircle(ctx, 24, hy + 0.8, 0.5, dk);
  const tg = wind ? 6 : Math.max(0, Math.sin(e.anim * 2.2)) * 6;                         /* forked tongue, flicking */
  if (tg > 0.8){
    ctx.strokeStyle = '#D2402A'; ctx.lineWidth = 0.9; ctx.beginPath();
    ctx.moveTo(25, hy); ctx.lineTo(25 + tg * 0.6, hy); ctx.lineTo(25 + tg, hy - 1.5); ctx.moveTo(25 + tg * 0.6, hy); ctx.lineTo(25 + tg, hy + 1.5);
    ctx.stroke();
  }
  for (let s = -1; s <= 1; s += 2){
    fillCircle(ctx, 20, hy + s * 2, 1.25, '#FFE066');
    fillCircle(ctx, 20.2, hy + s * 2, 0.55, '#2B1D12');
  }
}

function ch1_ember(ctx, e, b, dk, bob, d){
  const a = e.anim, flick = 0.7 + 0.3 * Math.sin(a * 8), wob = Math.sin(a * 5.3), wob2 = Math.sin(a * 6.7 + 1);
  const core = d.ocean ? '#B8F5F0' : d.swamp ? '#D8E8A0' : d.frost ? '#DFF3FF' : '#FFE08A';
  softBlob(ctx, 0, bob, 12.5 * flick, b, 0.34);
  ctx.fillStyle = dk; ctx.beginPath();                                                   /* the dark outer flame, streaming back */
  ctx.moveTo(1, bob - 6.8); ctx.quadraticCurveTo(-9, bob - 7 + wob * 2, -17 * flick - 2, bob + wob * 3);
  ctx.quadraticCurveTo(-8, bob + 7 + wob2 * 2, 1, bob + 6.8); ctx.closePath(); ctx.fill();
  ctx.fillStyle = b; ctx.beginPath();
  ctx.moveTo(1, bob - 5.4); ctx.quadraticCurveTo(-6, bob - 5 + wob2 * 2, -12 * flick - 1, bob - wob2 * 2);
  ctx.quadraticCurveTo(-6, bob + 5 + wob * 2, 1, bob + 5.4); ctx.closePath(); ctx.fill();
  ctx.fillStyle = ch1_m(b, core, 0.55); ctx.beginPath();
  ctx.moveTo(1, bob - 3); ctx.quadraticCurveTo(-3, bob - 2, -7 * flick, bob + wob); ctx.quadraticCurveTo(-3, bob + 2, 1, bob + 3); ctx.closePath(); ctx.fill();
  ctx.fillStyle = dk; ctx.beginPath();                                                   /* two little flame horns */
  ctx.moveTo(3, bob - 5.4); ctx.lineTo(7 + wob2, bob - 11.6); ctx.lineTo(7, bob - 4.6);
  ctx.moveTo(3, bob + 5.4); ctx.lineTo(7 - wob2, bob + 11.6); ctx.lineTo(7, bob + 4.6);
  ctx.fill();
  fillCircle(ctx, 0, bob, 7.6 * flick, dk);
  fillCircle(ctx, 0.6, bob, 6.8 * flick, b);
  fillCircle(ctx, 1, bob, 3.7 * flick, core);
  fillCircle(ctx, 4.3, bob - 2.1, 1, '#5A1A06'); fillCircle(ctx, 4.3, bob + 2.1, 1, '#5A1A06');
  for (let i = 0; i < 3; i++){                                                           /* sparks drifting round it */
    const s = a * 2.1 + i * 2.1;
    fillCircle(ctx, Math.cos(s) * 10.5 - 2, bob + Math.sin(s) * 8, 0.95, core);
  }
}

function ch1_vulture(ctx, e, b, dk, bob){
  const a = e.anim, flap = Math.sin(a * 1.6) * 0.5, tw = Math.sin(a * 1.1) * 0.12;
  const cov = ch1_s(b, 0.2), hi = ch1_s(b, 0.34), ruff = ch1_m(b, '#EADFC6', 0.78), rim = ch1_s(dk, -0.2);
  for (let s = -1; s <= 1; s += 2){                                                      /* the wings sweep back and forward as they flap */
    ctx.save(); ctx.rotate(s * flap);
    for (let j = 0; j < 6; j++){
      const bx = 2 - j * 0.5, by = s * (6.5 + j * 3), L = j < 5 ? 11 + j * 1.5 : 12;
      const dx = -1, dy = s * (0.14 + 0.07 * j), n = Math.hypot(dx, dy);
      lkOV(ctx, bx + dx / n * L * 0.5, by + dy / n * L * 0.5, L * 0.5 + 1, 2.5, j % 2 ? ch1_s(dk, 0.14) : ch1_s(dk, 0.04), Math.atan2(dy, dx));
    }
    lkLN(ctx, [2.4, s * 5, 2.2, s * 13, 3.4, s * 23.4], 4.4, b);                         /* leading edge of the wing */
    lkOV(ctx, -1.6, s * 12.4, 6.4, 8.6, cov, s * 0.12);
    lkOV(ctx, -1.2, s * 11, 4, 5.4, hi, s * 0.12);
    ctx.restore();
  }
  lkOV(ctx, -15, bob - 2.4, 6.6, 2.2, dk, 0.16 + tw); lkOV(ctx, -15, bob + 2.4, 6.6, 2.2, dk, -0.16 - tw); lkOV(ctx, -17, bob, 7, 2.4, rim);   /* tail feathers */
  lkOV(ctx, -1, bob, 13.4, 8.8, rim);
  lkOV(ctx, -1, bob, 12.6, 8, b);
  lkOV(ctx, -3, bob, 8.6, 4.4, cov);
  lkOV(ctx, 8.8, bob, 4.4, 6.8, ruff);                                                   /* pale neck ruff */
  lkOV(ctx, 9.6, bob, 3.2, 5, ch1_s(ruff, 0.15));
  lkOV(ctx, 14, bob, 4.8, 4.1, '#C79A96');                                               /* bald head */
  lkOV(ctx, 13.4, bob - 0.4, 2.4, 1.6, ch1_s('#C79A96', 0.22));
  lkTRI(ctx, 17.4, bob - 2.2, 25.4, bob + 0.5, 17.4, bob + 2.2, '#E8B84A');              /* hooked beak */
  lkTRI(ctx, 22.2, bob - 0.4, 25.8, bob + 1.2, 22.6, bob + 1, '#6A4A22');
  for (let s = -1; s <= 1; s += 2) ch1_eye(ctx, 15.4, bob + s * 2.4, 1.25, '#E0902A');
}

function ch1_lion(ctx, e, b, dk, bob){
  const a = e.anim, sw = Math.sin(a * 1.3) * 3.2, ts = Math.sin(a);
  const hi = ch1_s(b, 0.24), lo = ch1_m(b, dk, 0.28), rim = ch1_s(dk, -0.25);
  const m1 = ch1_s(dk, 0.2), m2 = ch1_m(dk, b, 0.55);
  /* tail with a dark tuft */
  const tx = -64, ty = bob + ts * 20;
  lkCV(ctx, -36, bob, -56, bob + ts * 12, tx, ty, 4.6, lo);
  fillCircle(ctx, tx, ty, 6.6, dk); fillCircle(ctx, tx - 1.4, ty, 4, m1);
  ctx.fillStyle = dk; ctx.beginPath();
  ctx.moveTo(tx - 4, ty - 3); ctx.lineTo(tx - 12, ty - 2 + ts * 2); ctx.lineTo(tx - 4, ty + 0.5);
  ctx.moveTo(tx - 4, ty + 3); ctx.lineTo(tx - 12, ty + 3 + ts * 2); ctx.lineTo(tx - 4, ty - 0.5); ctx.fill();
  /* four big paws */
  ch1_leg4(ctx, 17, -25, 20, 27.5, sw, 9, lo, 0, 0);
  ctx.fillStyle = hi;
  const pw = [17 + sw, -27.5, 17 - sw, 27.5, -25 - sw, -27.5, -25 + sw, 27.5];
  for (let i = 0; i < 8; i += 2){ lkOV(ctx, pw[i], pw[i + 1], 6.8, 5, b); lkOV(ctx, pw[i] + 2, pw[i + 1], 3, 3.6, hi); }
  ctx.strokeStyle = lo; ctx.lineWidth = 1; ctx.beginPath();
  for (let i = 0; i < 8; i += 2){ ctx.moveTo(pw[i] + 3.4, pw[i + 1] - 2.4); ctx.lineTo(pw[i] + 6.4, pw[i + 1] - 2); ctx.moveTo(pw[i] + 3.4, pw[i + 1] + 2.4); ctx.lineTo(pw[i] + 6.4, pw[i + 1] + 2); }
  ctx.stroke();
  /* the body */
  lkOV(ctx, -4, bob, 41.4, 28.2, rim);
  lkOV(ctx, -4, bob, 40, 27, b);
  lkOV(ctx, -8, bob - 19.4, 30, 5, hi); lkOV(ctx, -8, bob + 19.4, 30, 5, hi);
  lkOV(ctx, -26, bob - 14.5, 14, 11, ch1_s(b, -0.09), -0.3); lkOV(ctx, -26, bob + 14.5, 14, 11, ch1_s(b, -0.09), 0.3);   /* haunches */
  lkOV(ctx, -8, bob, 31, 9.4, lo);                                                       /* darker back ridge */
  lkOV(ctx, -8, bob, 28, 5.4, ch1_m(lo, b, 0.5));
  lkLN(ctx, [-36, bob, -20, bob + 0.6, -4, bob - 0.4, 10, bob], 1.6, ch1_m(lo, dk, 0.4));
  /* three rings of mane */
  ctx.fillStyle = dk; ctx.beginPath();
  for (let i = 0; i < 16; i++){
    const ang = i * TAU / 16, cx = 24 + Math.cos(ang) * 22.5, cy = bob + Math.sin(ang) * 22.5, rx = 9.6 + Math.sin(a + i) * 1.7;
    ctx.moveTo(cx + rx * Math.cos(ang), cy + rx * Math.sin(ang)); ctx.ellipse(cx, cy, rx, 7.2, ang, 0, TAU);
  }
  ctx.fill();
  ctx.fillStyle = m1; ctx.beginPath();
  for (let i = 0; i < 14; i++){
    const ang = (i + 0.5) * TAU / 14, cx = 24 + Math.cos(ang) * 16.5, cy = bob + Math.sin(ang) * 16.5, rx = 8 + Math.sin(a * 1.2 + i * 1.7) * 1.4;
    ctx.moveTo(cx + rx * Math.cos(ang), cy + rx * Math.sin(ang)); ctx.ellipse(cx, cy, rx, 5.8, ang, 0, TAU);
  }
  ctx.fill();
  ctx.fillStyle = m2; ctx.beginPath();
  for (let i = 0; i < 10; i++){
    const ang = i * TAU / 10 + 0.2, cx = 26 + Math.cos(ang) * 10.6, cy = bob + Math.sin(ang) * 10.6, rx = 6.4;
    ctx.moveTo(cx + rx * Math.cos(ang), cy + rx * Math.sin(ang)); ctx.ellipse(cx, cy, rx, 4.4, ang, 0, TAU);
  }
  ctx.fill();
  /* head */
  lkOV(ctx, 20.6, bob - 14.2, 4.6, 4.4, dk); lkOV(ctx, 20.6, bob + 14.2, 4.6, 4.4, dk);
  lkOV(ctx, 21.2, bob - 14.2, 2.6, 2.4, ch1_m(b, '#C98F78', 0.4)); lkOV(ctx, 21.2, bob + 14.2, 2.6, 2.4, ch1_m(b, '#C98F78', 0.4));
  lkOV(ctx, 28, bob, 16.6, 14.6, b);
  lkOV(ctx, 26, bob, 9, 7.6, hi);
  lkOV(ctx, 30, bob, 12, 3.2, ch1_s(b, 0.34));
  lkLN(ctx, [32, bob, 40, bob], 1.5, lo);                                                /* nose bridge */
  lkOV(ctx, 40, bob, 8.6, 7.6, '#F0DCB4');                                               /* pale muzzle */
  lkOV(ctx, 38.4, bob - 3.6, 3.6, 3.2, '#E2C99A'); lkOV(ctx, 38.4, bob + 3.6, 3.6, 3.2, '#E2C99A');
  ctx.fillStyle = ch1_m(dk, b, 0.1);
  for (let s = -1; s <= 1; s += 2){ fillCircle(ctx, 38, bob + s * 4.8, 0.75, ch1_m(dk, b, 0.1)); fillCircle(ctx, 40.6, bob + s * 5.2, 0.75, ch1_m(dk, b, 0.1)); }
  lkOV(ctx, 45.4, bob, 3.2, 2.6, '#2B1D12');
  lkOV(ctx, 44.6, bob - 0.9, 1.3, 0.8, '#6A5448');
  if (e.state === 'roar'){
    ctx.fillStyle = '#6E241C';
    ctx.beginPath(); ctx.ellipse(44, bob, 6, 5 + Math.sin(G.time * 30) * 1.5, 0, 0, TAU); ctx.fill();
    lkTRI(ctx, 41.6, bob - 4.4, 45.4, bob - 3.6, 43.2, bob - 0.6, '#FFF6DC'); lkTRI(ctx, 41.6, bob + 4.4, 45.4, bob + 3.6, 43.2, bob + 0.6, '#FFF6DC');
  }
  for (let s = -1; s <= 1; s += 2){
    lkLN(ctx, [32.6, bob + s * 11, 36, bob + s * 9.6, 39, bob + s * 7.8], 2.3, ch1_m(dk, b, 0.1));      /* heavy brow */
    fillCircle(ctx, 36, bob + s * 6.5, 3, '#F0B93A');
    lkOV(ctx, 36.6, bob + s * 6.5, 1.1, 2.1, '#2B1D12');
    fillCircle(ctx, 37.2, bob + s * 5.6, 0.7, '#FFF6DC');
  }
}

function ch1_matriarch(ctx, e, b, dk, bob){
  const a = e.anim, sw = Math.sin(a * 0.9) * 2.6, ts = Math.sin(a * 0.8), ear = Math.sin(a * 0.7) * 0.13;
  const hi = ch1_s(b, 0.14), lo = ch1_m(b, dk, 0.5), rim = ch1_s(dk, -0.28), pink = ch1_m(b, '#C9A3A0', 0.45);
  /* ears (under the body), outer rim, pinkish inner, veins */
  for (let s = -1; s <= 1; s += 2){
    lkOV(ctx, 8, s * 34, 21, 17.4, dk, s * (0.4 + ear));
    lkOV(ctx, 8.4, s * 34.6, 17, 13.4, pink, s * (0.4 + ear));
    lkOV(ctx, 4, s * 30, 9, 6, ch1_s(pink, 0.1), s * (0.4 + ear));
    lkLN(ctx, [4, s * 28, 10, s * 36, 16, s * 42], 1.3, lo);
    lkLN(ctx, [0, s * 28, 2, s * 38, 5, s * 46], 1.2, lo);
  }
  lkLN(ctx, [-56, bob, -63, bob + ts * 4, -68, bob + ts * 7], 2.6, dk);                  /* tail with a bristle tuft */
  ch1_tuft(ctx, -68, bob + ts * 7, 4, 7, 0.45, rim);
  /* four pillar feet with toenails */
  const fx = [24 + sw, -28 - sw, 24 - sw, -28 + sw], fy = [-31, -32, 31, 32];
  for (let i = 0; i < 4; i++){
    fillCircle(ctx, fx[i], fy[i], 12.4, rim); fillCircle(ctx, fx[i], fy[i], 10.8, lo);
    ctx.fillStyle = '#D8CDB8'; ctx.beginPath();
    for (let k = -1; k <= 1; k++){ const ny = fy[i] + k * 5.4; ctx.moveTo(fx[i] + 12, ny); ctx.ellipse(fx[i] + 10.8, ny, 2.2, 1.9, 0, 0, TAU); }
    ctx.fill();
  }
  /* the body: rim, dome, shaded edge, back ridge, wrinkles */
  lkOV(ctx, -8, bob, 51.4, 37.4, rim);
  lkOV(ctx, -8, bob, 50, 36, b);
  ctx.strokeStyle = lo; ctx.lineWidth = 8; ctx.globalAlpha = 0.32;
  ctx.beginPath(); ctx.ellipse(-8, bob, 46, 32, 0, 0, TAU); ctx.stroke(); ctx.globalAlpha = 1;
  lkOV(ctx, -12, bob - 8, 34, 16, hi); lkOV(ctx, -14, bob - 9, 24, 9, ch1_s(hi, 0.1));
  lkOV(ctx, -6, bob + 15, 28, 8, ch1_s(b, 0.05));
  ctx.strokeStyle = rim; ctx.lineWidth = 1.8; ctx.lineCap = 'round'; ctx.globalAlpha = 0.5; ctx.beginPath();
  for (let k = 0; k < 5; k++){
    const x = -46 + k * 11.5, u = (x + 8) / 50, h = 32 * Math.sqrt(Math.max(0, 1 - u * u)), bend = 5 - k * 0.8;
    ctx.moveTo(x, bob - h); ctx.quadraticCurveTo(x + bend, bob, x, bob + h);
  }
  ctx.stroke(); ctx.globalAlpha = 1; ctx.lineCap = 'butt';
  lkLN(ctx, [-50, bob, -30, bob + 0.6, -8, bob - 0.5, 14, bob], 2.4, lo);
  lkOV(ctx, -22, bob + 12, 5, 3, hi, 0.4); lkOV(ctx, -34, bob - 14, 4, 2.4, hi, -0.3);        /* dust patches */
  /* head, brow dome, eyes */
  lkOV(ctx, 34, bob, 22.6, 20.6, rim);
  lkOV(ctx, 34, bob, 22, 20, b);
  lkOV(ctx, 32, bob, 14, 12.6, hi);
  lkOV(ctx, 28, bob - 11, 6, 3, lo, -0.4); lkOV(ctx, 28, bob + 11, 6, 3, lo, 0.4);
  lkOV(ctx, 38, bob - 2, 8, 4.4, ch1_s(hi, 0.08));
  /* trunk: outline, body, ring wrinkles, tip */
  const ex = 76, ey = bob + 22 + ts * 10, cx = 70, cy = bob + ts * 8;
  ctx.lineCap = 'round';
  ctx.strokeStyle = rim; ctx.lineWidth = 14.5; ctx.beginPath(); ctx.moveTo(48, bob); ctx.quadraticCurveTo(cx, cy, ex, ey); ctx.stroke();
  ctx.strokeStyle = b; ctx.lineWidth = 12; ctx.stroke();
  ctx.strokeStyle = hi; ctx.lineWidth = 4; ctx.globalAlpha = 0.7; ctx.stroke(); ctx.globalAlpha = 1;
  ctx.strokeStyle = lo; ctx.lineWidth = 12; ctx.setLineDash(CH1_DASH_RING); ctx.globalAlpha = 0.5; ctx.stroke(); ctx.globalAlpha = 1; ctx.setLineDash(CH1_DASH_NONE);
  ctx.lineCap = 'butt';
  lkOV(ctx, ex + 0.6, ey + 2.4, 4.4, 3.4, lo, 0.5);
  fillCircle(ctx, ex - 0.4, ey + 3.4, 1.2, rim); fillCircle(ctx, ex + 2.4, ey + 3, 1.2, rim);
  /* tusks */
  for (let s = -1; s <= 1; s += 2){
    ctx.fillStyle = '#F0E6D2'; ctx.beginPath();
    ctx.moveTo(45, bob + s * 12.4); ctx.quadraticCurveTo(62, bob + s * 15, 75, bob + s * 21.4); ctx.quadraticCurveTo(61, bob + s * 10.4, 48, bob + s * 5); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#CFC2A6'; ctx.beginPath();
    ctx.moveTo(48, bob + s * 5); ctx.quadraticCurveTo(61, bob + s * 10.4, 75, bob + s * 21.4); ctx.quadraticCurveTo(62, bob + s * 8.6, 48, bob + s * 3.8); ctx.closePath(); ctx.fill();
    fillCircle(ctx, 46.4, bob + s * 8.8, 3.6, lo);
    fillCircle(ctx, 74.6, bob + s * 21.2, 1.3, '#8A7A60');
    fillCircle(ctx, 44, bob + s * 9, 3.7, '#2B1D12');                                    /* eye with a warm ring */
    fillCircle(ctx, 44.2, bob + s * 9, 2.5, '#8A5A2A');
    fillCircle(ctx, 44.5, bob + s * 9, 1.4, '#1A100A');
    fillCircle(ctx, 45.2, bob + s * 8.2, 0.7, '#FFF6DC');
  }
}

function ch1_buffalo(ctx, e, b, dk, bob){
  const a = e.anim, sw = Math.sin(a * 1.2) * 3, ts = Math.sin(a * 1.1);
  const hi = ch1_s(b, 0.2), fur = ch1_s(b, 0.34), rim = '#120E0A', cape = ch1_m(dk, b, 0.18), hoof = '#14100C';
  if (e.state === 'dash' || e.state === 'wind') softBlob(ctx, 10, bob, 52, '#FF5A2C', 0.1);
  lkCV(ctx, -48, bob, -57, bob + ts * 5, -60, bob + ts * 10, 3.2, dk);                   /* tail with a tuft */
  lkOV(ctx, -62, bob + ts * 10.6, 4.4, 3.4, rim, ts * 0.5);
  ch1_leg4(ctx, 20, -26, 22, 31.5, sw, 10, dk, 5.2, hoof);
  lkOV(ctx, -6, bob, 45.4, 31.4, rim);
  lkOV(ctx, -6, bob, 44, 30, b);
  lkOV(ctx, -20, bob - 20, 24, 6, hi); lkOV(ctx, -20, bob + 20, 24, 6, hi);              /* rump and flank sheen */
  lkOV(ctx, -30, bob, 13, 17, ch1_s(b, -0.1));
  lkLN(ctx, [-46, bob, -30, bob + 0.5, -10, bob - 0.4, 6, bob], 2.6, ch1_s(b, -0.18));
  ctx.strokeStyle = fur; ctx.lineWidth = 1.2; ctx.lineCap = 'round'; ctx.globalAlpha = 0.55; ctx.beginPath();   /* shaggy strands along the flanks */
  for (let i = 0; i < 9; i++){
    const x = -36 + i * 6.8, u = (x + 6) / 44, h = 28 * Math.sqrt(Math.max(0, 1 - u * u));
    ctx.moveTo(x, bob - h + 3); ctx.lineTo(x + 3.4, bob - h + 8.6); ctx.moveTo(x, bob + h - 3); ctx.lineTo(x + 3.4, bob + h - 8.6);
  }
  ctx.stroke(); ctx.globalAlpha = 1; ctx.lineCap = 'butt';
  lkOV(ctx, 8, bob, 26, 25, cape);                                                       /* the great shoulder hump, shaggy at the front */
  lkOV(ctx, 6, bob, 20, 19, ch1_s(cape, 0.12));
  ctx.fillStyle = cape; ctx.beginPath();
  for (let i = 0; i < 12; i++){
    const ang = -1.35 + i * (2.7 / 11), rr = 26;
    ctx.moveTo(8 + Math.cos(ang) * (rr - 3), bob + Math.sin(ang) * (rr - 3)); ctx.lineTo(8 + Math.cos(ang - 0.14) * (rr - 4), bob + Math.sin(ang - 0.14) * (rr - 4));
    ctx.lineTo(8 + Math.cos(ang - 0.05) * (rr + 6), bob + Math.sin(ang - 0.05) * (rr + 6));
  }
  ctx.fill();
  lkOV(ctx, 4, bob - 5, 14, 5, ch1_s(cape, 0.22)); lkOV(ctx, 2, bob + 7, 12, 4, ch1_s(cape, 0.1));
  for (let s = -1; s <= 1; s += 2) { lkOV(ctx, 19, bob + s * 17, 5.6, 3.4, dk, s * 0.5); lkOV(ctx, 19.4, bob + s * 17, 3.2, 1.8, ch1_m(b, '#8A6A58', 0.4), s * 0.5); }   /* ears */
  lkOV(ctx, 26, bob, 19.4, 17.4, rim);                                                   /* head */
  lkOV(ctx, 26, bob, 18.6, 16.6, b);
  lkOV(ctx, 24, bob - 4, 11, 4, hi);
  lkOV(ctx, 39, bob, 9.2, 8.2, dk);                                                      /* broad muzzle */
  lkOV(ctx, 41, bob - 1.5, 5.5, 3.4, ch1_s(dk, 0.2));
  fillCircle(ctx, 44.5, bob - 3.6, 1.4, rim); fillCircle(ctx, 44.5, bob + 3.6, 1.4, rim);
  lkOV(ctx, 22, bob, 6.4, 13.4, '#241E18');                                              /* the horn boss across the forehead */
  lkOV(ctx, 20.6, bob, 3.4, 10.6, ch1_s('#241E18', 0.2));
  for (let s = -1; s <= 1; s += 2){
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#6A5226'; ctx.lineWidth = 9; ctx.beginPath(); ctx.moveTo(23, bob + s * 8); ctx.quadraticCurveTo(42, bob + s * 22, 34, bob + s * 38); ctx.stroke();   /* horns: shadow, ivory, groove, growth rings */
    ctx.strokeStyle = '#C9A45C'; ctx.lineWidth = 7; ctx.stroke();
    ctx.strokeStyle = '#8A6E3C'; ctx.lineWidth = 3; ctx.stroke();
    ctx.strokeStyle = '#E8CF8C'; ctx.lineWidth = 1.5; ctx.setLineDash(CH1_DASH_RING); ctx.globalAlpha = 0.75; ctx.stroke(); ctx.globalAlpha = 1; ctx.setLineDash(CH1_DASH_NONE);
    ctx.lineCap = 'butt';
    fillCircle(ctx, 34, bob + s * 38.2, 3.3, '#3A2E18');                                 /* dark horn tips */
    fillCircle(ctx, 30, bob + s * 8.4, 3.4, '#FF5A3C');                                  /* the red eyes */
    fillCircle(ctx, 31.4, bob + s * 8.4, 1.4, '#2B1D12');
    fillCircle(ctx, 32, bob + s * 7.6, 0.7, '#FFF0D8');
  }
}

function ch1_crocodile(ctx, e, b, dk, bob){
  const a = e.anim, sw = Math.sin(a * 1.1) * 4.6, ts = Math.sin(a);
  const hi = ch1_s(b, 0.26), lo = ch1_m(b, dk, 0.5), rim = ch1_s(dk, -0.22), belly = ch1_m(b, '#D8D8A0', 0.32), scute = ch1_m(b, dk, 0.62);
  /* tail: tapering chain of circles following the old curve, with a ridge of scutes */
  const tc = bob + ts * 14, te = bob + ts * 24;
  for (let pass = 0; pass < 2; pass++){
    for (let i = 0; i < 9; i++){
      const t = i / 8, u = 1 - t, x = u * u * -46 + 2 * u * t * -70 + t * t * -83, y = u * u * bob + 2 * u * t * tc + t * t * te, r = 8.6 - 6.6 * t;
      if (pass === 0) fillCircle(ctx, x, y, r + 0.9, rim);
      else { fillCircle(ctx, x, y, r, i % 2 ? b : ch1_s(b, -0.04)); fillCircle(ctx, x + 0.6, y, r * 0.34, scute); }
    }
  }
  /* four splayed legs with webbed feet and claws */
  ctx.strokeStyle = lo; ctx.lineWidth = 7.4; ctx.lineCap = 'round'; ctx.beginPath();
  ctx.moveTo(14, bob - 12); ctx.lineTo(21 + sw, bob - 25); ctx.moveTo(14, bob + 12); ctx.lineTo(21 - sw, bob + 25);
  ctx.moveTo(-31, bob - 12); ctx.lineTo(-38 - sw, bob - 26); ctx.moveTo(-31, bob + 12); ctx.lineTo(-38 + sw, bob + 26);
  ctx.stroke(); ctx.lineCap = 'butt';
  const px = [21 + sw, 21 - sw, -38 - sw, -38 + sw], py = [-25, 25, -26, 26];
  for (let i = 0; i < 4; i++){ lkOV(ctx, px[i] + 3, bob + py[i], 5.4, 4.6, lo, py[i] < 0 ? -0.3 : 0.3); }
  ctx.strokeStyle = rim; ctx.lineWidth = 1.5; ctx.lineCap = 'round'; ctx.beginPath();
  for (let i = 0; i < 4; i++){
    const sd = py[i] < 0 ? -1 : 1;
    for (let k = -1; k <= 1; k++){ ctx.moveTo(px[i] + 6, bob + py[i] + k * 2.4); ctx.lineTo(px[i] + 10, bob + py[i] + k * 3.6 + sd * 0.4); }
  }
  ctx.stroke(); ctx.lineCap = 'butt';
  /* body */
  lkOV(ctx, -20, bob, 37.2, 18.2, rim);
  lkOV(ctx, -20, bob, 36, 17, b);
  lkOV(ctx, -20, bob - 14, 30, 3.4, belly); lkOV(ctx, -20, bob + 14, 30, 3.4, belly);
  ctx.fillStyle = scute; ctx.beginPath();                                                /* mottling down the flanks */
  for (let i = 0; i < 6; i++){ const x = -44 + i * 9.4; ctx.moveTo(x + 3.4, bob - 10); ctx.ellipse(x, bob - 10 + (i % 2) * 1.4, 3.4, 2.2, 0.3, 0, TAU); ctx.moveTo(x + 7.4, bob + 10); ctx.ellipse(x + 4, bob + 10 - (i % 2) * 1.4, 3.4, 2.2, -0.3, 0, TAU); }
  ctx.fill();
  ctx.fillStyle = lo; ctx.beginPath();                                                   /* two rows of keeled back scutes */
  for (let i = 0; i < 9; i++){ const x = -50 + i * 6.6; ctx.moveTo(x + 3.2, bob - 4.4); ctx.ellipse(x, bob - 4.4, 3.2, 2.5, 0, 0, TAU); ctx.moveTo(x + 3.2, bob + 4.4); ctx.ellipse(x, bob + 4.4, 3.2, 2.5, 0, 0, TAU); }
  ctx.fill();
  ctx.fillStyle = hi; ctx.beginPath();
  for (let i = 0; i < 9; i++){ const x = -50 + i * 6.6; ctx.moveTo(x + 1.6, bob - 5); ctx.ellipse(x - 0.2, bob - 5, 1.6, 1.1, 0, 0, TAU); ctx.moveTo(x + 1.6, bob + 3.8); ctx.ellipse(x - 0.2, bob + 3.8, 1.6, 1.1, 0, 0, TAU); }
  ctx.fill();
  /* head and long snout */
  lkOV(ctx, 18, bob, 17.6, 12.6, rim);
  lkOV(ctx, 18, bob, 17, 12, b);
  ctx.fillStyle = rim; ctx.beginPath();
  ctx.moveTo(24, bob - 11.4); ctx.lineTo(52, bob - 5.6); ctx.quadraticCurveTo(58.6, bob, 52, bob + 5.6); ctx.lineTo(24, bob + 11.4); ctx.closePath(); ctx.fill();
  ctx.fillStyle = b; ctx.beginPath();
  ctx.moveTo(24, bob - 10); ctx.lineTo(52, bob - 4.4); ctx.quadraticCurveTo(57, bob, 52, bob + 4.4); ctx.lineTo(24, bob + 10); ctx.closePath(); ctx.fill();
  lkOV(ctx, 40, bob, 14, 1.6, hi);
  lkOV(ctx, 29, bob, 6, 4, ch1_s(b, 0.08));
  fillCircle(ctx, 54, bob - 2.2, 1.7, rim); fillCircle(ctx, 54, bob + 2.2, 1.7, rim);      /* nostril bumps */
  fillCircle(ctx, 53.6, bob - 2.6, 0.8, hi); fillCircle(ctx, 53.6, bob + 1.8, 0.8, hi);
  ctx.fillStyle = '#EFE6D4'; ctx.beginPath();
  for (let i = 0; i < 5; i++){
    ctx.moveTo(30 + i * 5.4, bob - 9); ctx.lineTo(32 + i * 5.4, bob - 4); ctx.lineTo(28 + i * 5.4, bob - 4); ctx.closePath();
    ctx.moveTo(30 + i * 5.4, bob + 9); ctx.lineTo(32 + i * 5.4, bob + 4); ctx.lineTo(28 + i * 5.4, bob + 4); ctx.closePath();
  }
  ctx.fill();
  for (let s = -1; s <= 1; s += 2){
    fillCircle(ctx, 21, bob + s * 10, 4.4, b);                                           /* raised eye socket */
    fillCircle(ctx, 21, bob + s * 10, 3.6, rim);
    fillCircle(ctx, 22, bob + s * 10, 2.2, '#C8E060');
    lkOV(ctx, 22.2, bob + s * 10, 0.8, 1.9, '#1A2210');
    fillCircle(ctx, 22.8, bob + s * 9.1, 0.6, '#FFF6DC');
  }
  if (e.state === 'roll') ringPath(ctx, 0, bob, 58, 3, '#4E6B3E', 0.4);
}

function ch1_wildfire(ctx, e, b, dk, bob, d){
  const a = e.anim, flick = Math.sin(a * 4);
  const hot = ch1_s(b, 0.32), core = d.ocean ? '#B8F5F0' : d.swamp ? '#D8E8A0' : d.frost ? '#DFF3FF' : '#FFE08A';
  const halo = d.ocean ? 'rgba(46,214,200,' : d.swamp ? 'rgba(122,154,62,' : d.frost ? 'rgba(120,190,232,' : 'rgba(255,90,44,';
  ctx.fillStyle = halo + '.14)';
  ctx.beginPath(); ctx.arc(0, bob, 60 + flick * 4, 0, TAU); ctx.fill();
  ctx.fillStyle = halo + '.16)';
  ctx.beginPath(); ctx.arc(0, bob, 52 + flick * 3, 0, TAU); ctx.fill();
  /* long flame tongues streaming behind */
  ctx.fillStyle = dk; ctx.beginPath();
  for (let s = -1; s <= 1; s += 2){
    const w = Math.sin(a * 3 + s) * 5;
    ctx.moveTo(-14, bob + s * 10); ctx.quadraticCurveTo(-30, bob + s * 12 + w, -50 - flick * 3, bob + s * 24 + w * 1.4); ctx.quadraticCurveTo(-34, bob + s * 4, -14, bob + s * 2);
  }
  ctx.fill();
  /* three layers of ragged flame: dark, body, hot */
  for (let L = 0; L < 3; L++){
    const base = L === 0 ? 38 : L === 1 ? 27 : 18, amp = L === 0 ? 9 : L === 1 ? 7 : 4, f = 4 + L, sp = L === 0 ? 3 : L === 1 ? -4 : 5, k = 14;
    ctx.fillStyle = L === 0 ? dk : L === 1 ? b : hot;
    ctx.beginPath();
    for (let i = 0; i <= k; i++){
      const an = (i / k) * TAU, rr = base + Math.sin(an * f + a * sp) * amp + (i % 2 ? 4 : -3) * (1 - L * 0.25);
      const px = Math.cos(an) * rr, py = Math.sin(an) * rr * 0.86 + bob;
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.closePath(); ctx.fill();
  }
  ctx.fillStyle = core;
  ctx.beginPath(); ctx.arc(6, bob, 14 + flick * 2, 0, TAU); ctx.fill();
  fillCircle(ctx, 7, bob, 7.6 + flick, '#FFF4C8');
  for (let s = -1; s <= 1; s += 2){                                                      /* slanted, glowing eyes */
    lkOV(ctx, 10, bob + s * 6.2, 3.8, 2.4, '#2B1206', s * 0.5);
    fillCircle(ctx, 10.6, bob + s * 6.4, 1.1, '#FFB030');
    lkLN(ctx, [6.4, bob + s * 11.6, 11.4, bob + s * 9, 16.4, bob + s * 8.8], 1.6, '#2B1206');   /* angry brow */
  }
  for (let i = 0; i < 6; i++){                                                           /* embers drifting off */
    const s = a * 1.3 + i * 1.05, rr = 44 + Math.sin(a * 2 + i * 2.3) * 5;
    fillCircle(ctx, Math.cos(s) * rr, bob + Math.sin(s) * rr * 0.82, 1.5 + (i % 2) * 0.6, i % 2 ? core : '#FFB030');
  }
}

function drawEnemy(ctx, e){
  const d = e.def;
  const wind = (e.state === 'wind');
  const pop = e.flash > 0 ? 1 + e.flash * 1.2 : 1;

  softShadow(ctx, e.x, e.y + e.r * 0.5, e.r * 1.02, e.r * 0.5, 0.42, e.r * 0.5);

  ctx.save();
  ctx.translate(e.x, e.y);
  ctx.rotate(e.ang);
  ctx.scale(pop, pop);
  /* how white a creature flashes when hit is a player setting (0-100%) */
  const hf = e.flash > 0 ? Settings.hitFlash : 0;
  const body = hf <= 0 ? d.color : hf >= 1 ? '#FFFFFF' : blendHex(d.color, '#FFFFFF', hf);
  const dk = hf <= 0 ? d.dark : hf >= 1 ? '#FFD9C4' : blendHex(d.dark, '#FFD9C4', hf);
  const bob = Math.sin(e.anim) * (e.r * 0.06);
  if (typeof EnemySprite === 'undefined' || !EnemySprite.draw(ctx, e, d)) drawEnemyBody(ctx, e, body, dk, bob, wind, d);      /* a cached picture when it is safe (js/game/44t-enemy-sprites.js), else the live drawing */
  ctx.restore();

  /* status tints */
  if (e.burnT > 0 && Math.random() < 0.5)
    softBlob(ctx, e.x + rand(-e.r, e.r), e.y + rand(-e.r, e.r) - 4, 4, '#FF9C4A', 0.4);
  if (e.stunT > 0){
    const a = G.time * 6;
    for (let i = 0; i < 3; i++)
      fillCircle(ctx, e.x + Math.cos(a + i * 2.1) * (e.r + 6), e.y - e.r - 8 + Math.sin(a + i * 2.1) * 3, 2.2, '#FFF3CC');
  }
  if (e.slowMul < 1) ringPath(ctx, e.x, e.y, e.r + 4, 2, '#8FD3E8', 0.35);

  /* frost tell: a faint cold breath and the occasional drifting ice
     crystal, so chapter 2's creatures read as icy even at a glance beyond
     their recoloured palette */
  if (e.def.frost && !e.portrait){
    ringPath(ctx, e.x, e.y, e.r + 2, 1.3, '#DFF3FF', 0.22 + 0.08 * Math.sin(G.time * 2 + e.anim));
    if (Math.random() < 0.05)
      addParticle(e.x + rand(-e.r, e.r), e.y + rand(-e.r, e.r), rand(-8, 8), -rand(14, 30),
        rand(1.2, 2.4), 0.6, '#EAF9FF', { glow: true, drag: 1.1 });
  }
  /* swamp tell: the same idea a third time -- a low miasma haze clinging to
     the creature and the occasional rising spore, so chapter 3's creatures
     read as toxic even at a glance beyond their recoloured palette */
  if (e.def.swamp && !e.portrait){
    ringPath(ctx, e.x, e.y, e.r + 2, 1.3, '#B8D66E', 0.2 + 0.08 * Math.sin(G.time * 1.6 + e.anim));
    if (Math.random() < 0.05)
      addParticle(e.x + rand(-e.r, e.r), e.y + rand(-e.r, e.r), rand(-6, 6), -rand(8, 20),
        rand(1.4, 2.8), 0.7, '#9ACB5E', { glow: true, drag: 1.3 });
  }
  /* ocean tell: a fourth pass -- a bioluminescent shimmer and the occasional
     rising bubble, so chapter 4's creatures read as deep-sea even at a
     glance beyond their recoloured palette */
  if (e.def.ocean && !e.portrait){
    ringPath(ctx, e.x, e.y, e.r + 2, 1.3, '#5FF5E8', 0.24 + 0.1 * Math.sin(G.time * 2.4 + e.anim));
    if (Math.random() < 0.06)
      addParticle(e.x + rand(-e.r, e.r), e.y + rand(-e.r, e.r), rand(-5, 5), -rand(16, 34),
        rand(1.3, 2.6), 0.65, '#B8FFF3', { glow: true, drag: 0.9 });
  }

  if (e.def.glim) glimOverlay(ctx, e);                                                       /* Chapter 11: the glimmer */

  /* health pip */
  if (!e.big && e.hp < e.maxHp){
    const w = e.r * 2, h = 3.4;
    const p = clamp(e.hp / e.maxHp, 0, 1);
    ctx.fillStyle = 'rgba(18,13,10,.8)';
    ctx.fillRect(e.x - w / 2, e.y - e.r - 11, w, h);
    ctx.fillStyle = p > 0.5 ? '#9FBF52' : p > 0.22 ? '#F2B33D' : '#CF4433';
    ctx.fillRect(e.x - w / 2, e.y - e.r - 11, w * p, h);
  }
}

/* The creature itself, drawn live in its own space (center 0,0, facing +x). drawEnemy() calls this, or uses a cached picture of the same drawing. */
function drawEnemyBody(ctx, e, body, dk, bob, wind, d){
  const frost = d.frost, swamp = d.swamp, ocean = d.ocean;
  if (d.look && ENEMY_LOOK_DRAW[d.look]) ENEMY_LOOK_DRAW[d.look](ctx, e, body, dk, bob, wind, d);
  else switch (e.type){
    case 'hyena':
      ch1_hyena(ctx, e, body, dk, bob);
      if (frost){ frostSpikes(ctx, -6, bob - 8, 3, 9, -1.5, '#DFF3FF'); icicleDrip(ctx, 20, bob + 6, 6, '#BEEFFF'); }
      else if (swamp){ mossPatch(ctx, -6, bob - 7, 3, 3, '#6E8248'); bogDrip(ctx, 2, bob + 9, 5, '#3E4A22'); }
      else if (ocean){ finFrill(ctx, -6, bob - 9, 10, -1.4, '#6FE0FF'); bioSpots(ctx, 2, bob, 3, 14, '#8FFFF0', e.anim); }
      break;

    case 'cheetah':
      ch1_cheetah(ctx, e, body, dk, bob, wind);
      if (frost){ frostSpikes(ctx, -2, bob - 7, 3, 8, -1.5, '#DFF3FF'); }
      else if (swamp){ mossPatch(ctx, -4, bob - 6, 3, 2.6, '#6E8248'); vineWrap(ctx, 4, bob + 7, 8, 0.3, '#5A6B3A'); }
      else if (ocean){ finFrill(ctx, -6, bob - 8, 9, -1.4, '#6FE0FF'); gillSlits(ctx, 13, bob + 4, 0.3, '#0A2A3C'); }
      break;

    case 'rhino':
      ch1_rhino(ctx, e, body, dk, bob, wind);
      if (frost){ frostSpikes(ctx, -14, bob - 12, 4, 11, -1.4, '#DFF3FF'); frostRime(ctx, -8, bob, 14, 10, 0); icicleDrip(ctx, 10, bob + 16, 8, '#BEEFFF'); }
      else if (swamp){ mossPatch(ctx, -14, bob - 10, 4, 4, '#6E8248'); mossPatch(ctx, 6, bob + 12, 3, 3.4, '#465326'); bogDrip(ctx, 22, bob + 10, 7, '#3E4A22'); }
      else if (ocean){ finFrill(ctx, -14, bob - 16, 14, -1.3, '#6FE0FF'); bioSpots(ctx, -2, bob, 4, 22, '#8FFFF0', e.anim); }
      break;

    case 'termite':
      ch1_termite(ctx, e, body, dk, bob);
      if (frost){ frostSpikes(ctx, -6, bob, 3, 7, TAU / 2, '#DFF3FF'); }
      else if (swamp){ mossPatch(ctx, -8, bob, 3, 3, '#6E8248'); }
      else if (ocean){ bioSpots(ctx, -6, bob, 3, 12, '#8FFFF0', e.anim); }
      break;

    case 'grub':
      ch1_grub(ctx, e, body, dk, bob);
      if (frost){ frostRime(ctx, 0, bob, 7, 4, 0); }
      else if (swamp){ mossPatch(ctx, -2, bob, 2, 2.4, '#6E8248'); }
      else if (ocean){ bioSpots(ctx, -2, bob, 2, 8, '#8FFFF0', e.anim); }
      break;

    case 'jackal':
      ch1_jackal(ctx, e, body, dk, bob);
      if (frost){ frostSpikes(ctx, -3, bob - 7, 2, 7, -1.5, '#DFF3FF'); }
      else if (swamp){ vineWrap(ctx, -18, bob + 3, 7, 0.4, '#5A6B3A'); }
      else if (ocean){ finFrill(ctx, -4, bob - 6, 7, -1.4, '#6FE0FF'); }
      break;

    case 'warthog':
      ch1_warthog(ctx, e, body, dk, bob, wind);
      if (frost){ frostSpikes(ctx, -10, bob - 10, 3, 9, -1.4, '#DFF3FF'); icicleDrip(ctx, 20, bob + 10, 6, '#BEEFFF'); }
      else if (swamp){ mossPatch(ctx, -10, bob - 9, 3, 3.4, '#6E8248'); bogDrip(ctx, 16, bob + 11, 6, '#3E4A22'); }
      else if (ocean){ finFrill(ctx, -12, bob - 12, 11, -1.3, '#6FE0FF'); bioSpots(ctx, 0, bob, 3, 16, '#8FFFF0', e.anim); }
      break;

    case 'baboon':
      ch1_baboon(ctx, e, body, dk, bob);
      if (frost){ frostSpikes(ctx, -2, bob - 11, 3, 8, -1.5, '#DFF3FF'); }
      else if (swamp){ mossPatch(ctx, -4, bob - 10, 3, 3, '#6E8248'); vineWrap(ctx, -18, bob - 2, 8, 1.1, '#5A6B3A'); }
      else if (ocean){ finFrill(ctx, -4, bob - 11, 8, -1.4, '#6FE0FF'); }
      break;

    case 'honeybadger':
      ch1_honeybadger(ctx, e, body, dk, bob, d);
      if (frost){ frostSpikes(ctx, -2, bob - 8, 4, 8, -1.5, '#DFF3FF'); }
      else if (swamp){ mossPatch(ctx, -2, bob - 7, 3, 3, '#6E8248'); bogDrip(ctx, 8, bob + 8, 5, '#3E4A22'); }
      else if (ocean){ finFrill(ctx, -4, bob - 8, 9, -1.4, '#6FE0FF'); bioSpots(ctx, 2, bob, 3, 14, '#8FFFF0', e.anim); }
      break;

    case 'mamba':
      ch1_mamba(ctx, e, body, dk, bob, wind);
      if (frost){ frostSpikes(ctx, 4, bob, 2, 6, -1.5, '#DFF3FF'); }
      else if (swamp){ mossPatch(ctx, -4, bob, 2, 2.4, '#6E8248'); }
      else if (ocean){ finFrill(ctx, -8, bob, 8, -1.5, '#6FE0FF'); bioSpots(ctx, 4, bob, 2, 8, '#8FFFF0', e.anim); }
      break;

    case 'ember':
      ch1_ember(ctx, e, body, dk, bob, d);
      break;

    case 'vulture':
      ch1_vulture(ctx, e, body, dk, bob);
      if (frost){ frostSpikes(ctx, -2, bob - 9, 3, 8, -1.5, '#DFF3FF'); }
      else if (swamp){ mossPatch(ctx, -3, bob - 8, 3, 3, '#6E8248'); }
      else if (ocean){ finFrill(ctx, -3, bob - 9, 9, -1.4, '#6FE0FF'); }
      break;

    case 'lion':
      ch1_lion(ctx, e, body, dk, bob);
      if (frost){
        frostSpikes(ctx, -2, bob - 20, 5, 16, -1.4, '#DFF3FF');
        frostSpikes(ctx, -2, bob + 20, 5, 16, 1.4, '#DFF3FF');
        icicleDrip(ctx, 30, bob + 22, 12, '#BEEFFF'); icicleDrip(ctx, 38, bob + 18, 9, '#BEEFFF');
      } else if (swamp){
        mossPatch(ctx, -6, bob - 22, 5, 5, '#6E8248'); mossPatch(ctx, -6, bob + 22, 5, 5, '#465326');
        vineWrap(ctx, 20, bob + 24, 16, 0.5, '#5A6B3A');
        bogDrip(ctx, 44, bob + 12, 9, '#3E4A22');
      } else if (ocean){
        finFrill(ctx, -8, bob - 26, 22, -1.3, '#6FE0FF'); finFrill(ctx, -8, bob + 26, 22, 1.3, '#6FE0FF');
        bioSpots(ctx, 20, bob, 6, 30, '#8FFFF0', e.anim);
      }
      break;

    case 'matriarch':
      ch1_matriarch(ctx, e, body, dk, bob);
      if (frost){
        frostSpikes(ctx, -20, bob - 30, 6, 15, -1.4, '#DFF3FF');
        frostSpikes(ctx, 20, bob, 4, 12, 0, '#DFF3FF');
        icicleDrip(ctx, 34, bob - 18, 10, '#BEEFFF'); icicleDrip(ctx, 34, bob + 18, 10, '#BEEFFF');
      } else if (swamp){
        mossPatch(ctx, -20, bob - 28, 6, 6, '#6E8248'); mossPatch(ctx, 10, bob, 5, 5, '#465326');
        vineWrap(ctx, 60, bob + 6, 20, 0.9, '#5A6B3A');
        bogDrip(ctx, 40, bob + 24, 8, '#3E4A22');
      } else if (ocean){
        finFrill(ctx, -30, bob - 38, 26, -1.2, '#6FE0FF'); finFrill(ctx, -30, bob + 38, 26, 1.2, '#6FE0FF');
        bioSpots(ctx, 0, bob, 7, 40, '#8FFFF0', e.anim);
        gillSlits(ctx, 40, bob - 10, -0.3, '#0A2A3C'); gillSlits(ctx, 40, bob + 10, 0.3, '#0A2A3C');
      }
      break;

    case 'buffalo':
      ch1_buffalo(ctx, e, body, dk, bob);
      if (frost){
        frostSpikes(ctx, -24, bob - 20, 5, 14, -1.4, '#DFF3FF');
        frostSpikes(ctx, -24, bob + 20, 5, 14, 1.4, '#DFF3FF');
        icicleDrip(ctx, 20, bob + 24, 11, '#BEEFFF');
      } else if (swamp){
        mossPatch(ctx, -24, bob - 22, 5, 5, '#6E8248'); mossPatch(ctx, -24, bob + 22, 5, 5, '#465326');
        vineWrap(ctx, 8, bob + 30, 16, 0.6, '#5A6B3A');
        bogDrip(ctx, 38, bob + 16, 8, '#3E4A22');
      } else if (ocean){
        finFrill(ctx, -30, bob - 26, 20, -1.3, '#6FE0FF'); finFrill(ctx, -30, bob + 26, 20, 1.3, '#6FE0FF');
        bioSpots(ctx, 0, bob, 6, 32, '#8FFFF0', e.anim);
      }
      break;

    case 'crocodile':
      ch1_crocodile(ctx, e, body, dk, bob);
      if (frost){
        frostSpikes(ctx, -30, bob - 14, 6, 12, -1.5, '#DFF3FF');
        frostSpikes(ctx, -30, bob + 14, 6, 12, 1.5, '#DFF3FF');
        icicleDrip(ctx, 40, bob - 10, 9, '#BEEFFF'); icicleDrip(ctx, 40, bob + 10, 9, '#BEEFFF');
      } else if (swamp){
        mossPatch(ctx, -30, bob - 14, 5, 5, '#6E8248'); mossPatch(ctx, -30, bob + 14, 5, 5, '#465326');
        vineWrap(ctx, -66, bob, 18, 0, '#5A6B3A');
        bogDrip(ctx, 40, bob, 10, '#3E4A22');
      } else if (ocean){
        finFrill(ctx, -40, bob - 18, 24, -1.3, '#6FE0FF'); finFrill(ctx, -40, bob + 18, 24, 1.3, '#6FE0FF');
        bioSpots(ctx, 0, bob, 6, 32, '#8FFFF0', e.anim);
        gillSlits(ctx, 12, bob - 12, -0.3, '#0A2A3C'); gillSlits(ctx, 12, bob + 12, 0.3, '#0A2A3C');
      }
      break;

    case 'wildfire':
      ch1_wildfire(ctx, e, body, dk, bob, d);
      break;
  }
}
