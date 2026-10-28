'use strict';
/* =============================================================================================================================
   33b-gear-art-weapons.js  --  SIXTEEN WEAPONS YOU CAN SEE. The weapon gear used to be only a damage arc; now each one is worn on her:
   spurs and claws on the front hooves, stone caps, star guards, vines; fangs, a maul, spears, a trident and an anglerfish lure on the head;
   twin tails and a spinning maw ring on the body. drawPlayer() (33-giraffe-art.js) calls weaponArtBody() while it is still in the body's
   rotated space and weaponArtHead() while it is in the head's, and the weapon's own look comes from WEAPON_ART[id]:
       hoof(ctx, o)  drawn at each front hoof (o.side -1 or 1), pointing forward (+x)
       body(ctx, o)  drawn once, at the body's center
       head(ctx, o)  drawn once, at the head, pointing forward (+x)
   o = { e (kick progress 0 to 1, or -1 when not kicking), swing (0 at rest, 1 at the strike), t, color, level, side }.
   The swing is timed to the neck lunge in 36n-neck-stretch.js (the head lands at e = 0.3). Level 4 and up gives a glow in the weapon's color.
   Nothing here changes damage, range or cooldown.
   ============================================================================================================================= */
function weaponSwing(){
  if (!(P.kickAnim > 0)) return { e: -1, swing: 0 };
  const e = 1 - P.kickAnim / 0.30;
  return { e: e, swing: Math.sin(Math.max(0, Math.min(1, (e - 0.04) / 0.5)) * Math.PI) };
}
function wpStar(ctx, r, n, inner){ ctx.beginPath(); for (let i = 0; i < n * 2; i++){ const a = i / (n * 2) * TAU - Math.PI / 2, rr = i % 2 ? r * inner : r; if (i) ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); else ctx.moveTo(Math.cos(a) * rr, Math.sin(a) * rr); } ctx.closePath(); }
function wpSpike(ctx, x, y, len, wid, ang){ ctx.save(); ctx.translate(x, y); ctx.rotate(ang); ctx.beginPath(); ctx.moveTo(0, -wid); ctx.lineTo(len, 0); ctx.lineTo(0, wid); ctx.closePath(); ctx.fill(); ctx.restore(); }

const WEAPON_ART = {
  hooves: {                                                                    /* nothing at rest; a pale glint on the hoof as it lands */
    hoof(ctx, o){ if (o.swing < 0.15) return; ctx.globalAlpha = o.swing * 0.8; ctx.strokeStyle = '#FFF6D8'; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.arc(2, 0, 6.5, -0.9, 0.9); ctx.stroke(); ctx.globalAlpha = 1; }
  },
  spurs: {                                                                     /* thorns on the hoof, longer as it cuts */
    hoof(ctx, o){
      ctx.fillStyle = o.color; ctx.strokeStyle = '#3A5A1C'; ctx.lineWidth = 0.7; const L = 5 + o.swing * 4;
      [[5, -3.4, L, 1.8, -0.5], [6, 0, L + 1.6, 2, 0], [5, 3.4, L, 1.8, 0.5]].forEach(function(r){ wpSpike(ctx, r[0], r[1], r[2], r[3], r[4]); ctx.save(); ctx.translate(r[0], r[1]); ctx.rotate(r[4]); ctx.beginPath(); ctx.moveTo(0, -r[3]); ctx.lineTo(r[2], 0); ctx.lineTo(0, r[3]); ctx.stroke(); ctx.restore(); });
      ctx.fillStyle = '#3A5A1C'; ctx.fillRect(-3, -4.2, 2, 8.4);
      if (o.swing > 0.5){ ctx.fillStyle = '#C8344A'; ctx.beginPath(); ctx.arc(11 + o.swing * 2, o.side * 1.5, 1.2, 0, TAU); ctx.fill(); }
    }
  },
  stone: {                                                                     /* a stone cap over the hoof */
    hoof(ctx, o){
      const g = ctx.createLinearGradient(0, -6, 0, 6); g.addColorStop(0, '#EDE6DA'); g.addColorStop(1, '#8F877B');
      ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(1.5, 0, 8.4 + o.swing * 1.4, 6.4 + o.swing, 0, 0, TAU); ctx.fill();
      ctx.strokeStyle = '#5F584E'; ctx.lineWidth = 0.9; ctx.beginPath(); ctx.moveTo(-2, -4); ctx.lineTo(1, -1); ctx.lineTo(0, 2); ctx.lineTo(4, 5); ctx.stroke();
      if (o.swing > 0.6){ ctx.globalAlpha = (o.swing - 0.6) * 2; ctx.fillStyle = '#CDBFA8'; for (let i = 0; i < 4; i++) ctx.fillRect(9 + i * 2.5, -4 + (i % 2) * 6 - i, 1.8, 1.8); ctx.globalAlpha = 1; }
    }
  },
  icefangs: {                                                                  /* two ice fangs at the mouth */
    head(ctx, o){
      ctx.fillStyle = o.color; ctx.strokeStyle = '#E9FAFF'; ctx.lineWidth = 0.6; const L = 7 + o.swing * 5;
      [-1, 1].forEach(function(s){ ctx.save(); ctx.translate(13, s * 3.2); ctx.rotate(s * 0.22); ctx.beginPath(); ctx.moveTo(0, -s * 1.6); ctx.lineTo(L, 0); ctx.lineTo(0, s * 1.6); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.restore(); });
    }
  },
  lance: {                                                                     /* a long acacia lance held out ahead of the head */
    head(ctx, o){
      const L = 30 + o.swing * 14;
      ctx.strokeStyle = '#7B5A33'; ctx.lineWidth = 2.2; ctx.beginPath(); ctx.moveTo(8, 0); ctx.lineTo(8 + L, 0); ctx.stroke();
      ctx.fillStyle = o.color; ctx.beginPath(); ctx.moveTo(8 + L - 2, 0); ctx.quadraticCurveTo(8 + L + 2, -5, 8 + L + 12, 0); ctx.quadraticCurveTo(8 + L + 2, 5, 8 + L - 2, 0); ctx.fill();
      ctx.strokeStyle = '#4C6B24'; ctx.lineWidth = 0.8; ctx.beginPath(); ctx.moveTo(8 + L, 0); ctx.lineTo(8 + L + 10, 0); ctx.stroke();
      ctx.fillStyle = '#A8C463'; ctx.beginPath(); ctx.ellipse(8 + 7, -3, 3.2, 1.5, -0.6, 0, TAU); ctx.fill(); ctx.beginPath(); ctx.ellipse(8 + 7, 3, 3.2, 1.5, 0.6, 0, TAU); ctx.fill();
    }
  },
  twin: {                                                                      /* two tails that whip out with the kick */
    body(ctx, o){
      [-1, 1].forEach(function(s){
        const w = Math.sin(o.t * 4 + s) * 0.3 + o.swing * 1.0 * s;
        ctx.strokeStyle = o.color; ctx.lineWidth = 2.4; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-20, s * 4);
        ctx.quadraticCurveTo(-30, s * 4 + Math.sin(w) * 8, -38 - o.swing * 4, s * (7 + o.swing * 6) + Math.sin(w) * 12); ctx.stroke();
        ctx.fillStyle = '#E9FAFF'; ctx.beginPath(); ctx.arc(-38 - o.swing * 4, s * (7 + o.swing * 6) + Math.sin(w) * 12, 2.4, 0, TAU); ctx.fill();
      });
      ctx.lineCap = 'butt';
    }
  },
  glaciermaul: {                                                               /* a block of glacier on the end of the snout */
    head(ctx, o){
      const k = 1 + o.swing * 0.25; ctx.save(); ctx.translate(20, 0); ctx.scale(k, k);
      const g = ctx.createLinearGradient(-8, -9, 8, 9); g.addColorStop(0, '#EAFBFF'); g.addColorStop(1, o.color);
      ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(-6, -8); ctx.lineTo(7, -9); ctx.lineTo(10, -2); ctx.lineTo(8, 8); ctx.lineTo(-5, 9); ctx.lineTo(-8, 1); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#FFFFFF'; ctx.globalAlpha = 0.6; ctx.lineWidth = 0.8; ctx.beginPath(); ctx.moveTo(-6, -8); ctx.lineTo(2, 0); ctx.lineTo(8, 8); ctx.moveTo(2, 0); ctx.lineTo(10, -2); ctx.stroke(); ctx.globalAlpha = 1;
      ctx.strokeStyle = '#7BB7CC'; ctx.lineWidth = 1.1; ctx.beginPath(); ctx.moveTo(-6, -8); ctx.lineTo(7, -9); ctx.lineTo(10, -2); ctx.lineTo(8, 8); ctx.lineTo(-5, 9); ctx.lineTo(-8, 1); ctx.closePath(); ctx.stroke(); ctx.restore();
      ctx.strokeStyle = '#6C5330'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(9, 0); ctx.lineTo(14, 0); ctx.stroke();
    }
  },
  sunspear: {                                                                  /* a spear with a tip of flame */
    head(ctx, o){
      const L = 32 + o.swing * 12, fl = Math.sin(o.t * 14) * 1.4;
      ctx.strokeStyle = '#8A5A2A'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(8, 0); ctx.lineTo(8 + L, 0); ctx.stroke();
      ctx.fillStyle = '#FFD166'; wpSpike(ctx, 8 + L - 2, 0, 11, 3.6, 0);
      ctx.fillStyle = 'rgba(255,140,40,.85)'; ctx.beginPath(); ctx.moveTo(8 + L + 8, 0); ctx.quadraticCurveTo(8 + L + 14, -3 + fl, 8 + L + 20 + o.swing * 6, fl * 0.5); ctx.quadraticCurveTo(8 + L + 14, 3 + fl, 8 + L + 8, 0); ctx.fill();
      ctx.fillStyle = 'rgba(255,240,170,.9)'; ctx.beginPath(); ctx.arc(8 + L + 9, 0, 1.6, 0, TAU); ctx.fill();
    }
  },
  aurora: {                                                                    /* two fangs and a ribbon that shifts color */
    head(ctx, o){
      const h = 150 + Math.sin(o.t * 1.2) * 60, L = 11 + o.swing * 6;
      [-1, 1].forEach(function(s, i){
        ctx.fillStyle = 'hsl(' + Math.round(h + i * 50) + ',75%,68%)'; ctx.save(); ctx.translate(13, s * 3.4); ctx.rotate(s * 0.3);
        ctx.beginPath(); ctx.moveTo(0, -s * 1.5); ctx.quadraticCurveTo(L * 0.6, s * 1.2, L, s * 2.4); ctx.quadraticCurveTo(L * 0.5, -s * 0.3, 0, s * 1.5); ctx.closePath(); ctx.fill(); ctx.restore();
      });
      ctx.globalAlpha = 0.7; ctx.strokeStyle = 'hsl(' + Math.round(h + 90) + ',80%,72%)'; ctx.lineWidth = 1.4;
      [-1, 1].forEach(function(s){ ctx.beginPath(); ctx.moveTo(14 + L * 0.6, s * 5.5); ctx.quadraticCurveTo(14 + L, s * (8 + Math.sin(o.t * 4) * 2), 14 + L + 5, s * (6 + Math.sin(o.t * 4 + 1) * 3)); ctx.stroke(); }); ctx.globalAlpha = 1;
    }
  },
  starbreaker: {                                                               /* a golden star over each hoof, spinning when it strikes */
    hoof(ctx, o){
      ctx.save(); ctx.translate(2, 0); ctx.rotate(o.swing * 2.4 + o.t * 0.4); ctx.fillStyle = '#FFD84D'; ctx.strokeStyle = '#B8860B'; ctx.lineWidth = 0.8;
      wpStar(ctx, 8.4 + o.swing * 2, 5, 0.45); ctx.fill(); ctx.stroke(); ctx.fillStyle = '#FFF3B0'; ctx.beginPath(); ctx.arc(0, 0, 1.8, 0, TAU); ctx.fill(); ctx.restore();
    }
  },
  tideshellclub: {                                                             /* a club with a spiralled shell for its head */
    head(ctx, o){
      ctx.strokeStyle = '#6B4F30'; ctx.lineWidth = 2.4; ctx.beginPath(); ctx.moveTo(8, 0); ctx.lineTo(28, 0); ctx.stroke();
      const k = 1 + o.swing * 0.2; ctx.save(); ctx.translate(33, 0); ctx.scale(k, k);
      ctx.fillStyle = o.color; ctx.beginPath(); ctx.ellipse(0, 0, 8.5, 7, 0, 0, TAU); ctx.fill(); ctx.strokeStyle = '#E6F4FA'; ctx.lineWidth = 1;
      ctx.beginPath(); for (let i = 0; i < 30; i++){ const a = i * 0.32, r = 0.4 + i * 0.22; if (i) ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r * 0.8); else ctx.moveTo(0, 0); } ctx.stroke(); ctx.restore();
      if (o.swing > 0.4){ ctx.fillStyle = '#BEE8FF'; for (let i = 0; i < 3; i++){ ctx.beginPath(); ctx.arc(30 + i * 5, -9 - i * 2 + o.swing * 3, 1.2, 0, TAU); ctx.fill(); } }
    }
  },
  riptide: {                                                                   /* a trident, with foam on the thrust */
    head(ctx, o){
      const L = 30 + o.swing * 12;
      ctx.strokeStyle = '#2F6F95'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(8, 0); ctx.lineTo(8 + L, 0); ctx.stroke();
      ctx.strokeStyle = o.color; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(8 + L - 4, -6); ctx.lineTo(8 + L - 4, 6); ctx.moveTo(8 + L - 4, -6); ctx.lineTo(8 + L + 9, -6); ctx.moveTo(8 + L - 4, 6); ctx.lineTo(8 + L + 9, 6); ctx.moveTo(8 + L, 0); ctx.lineTo(8 + L + 11, 0); ctx.stroke();
      ctx.fillStyle = '#D5F1FF'; [[-6], [0], [6]].forEach(function(r){ wpSpike(ctx, 8 + L + 8, r[0], 4, 1.4, 0); });
      if (o.swing > 0.3){ ctx.globalAlpha = o.swing; ctx.fillStyle = '#F4FBFF'; for (let i = 0; i < 5; i++){ ctx.beginPath(); ctx.arc(8 + L - 8 - i * 4, Math.sin(i * 2 + o.t * 12) * 4, 1.3, 0, TAU); ctx.fill(); } ctx.globalAlpha = 1; }
    }
  },
  abyssal: {                                                                   /* an anglerfish lure on a stalk, and small teeth */
    head(ctx, o){
      const p = 0.6 + 0.4 * Math.sin(o.t * 3), sx = 12 + o.swing * 6, sy = -2 - o.swing * 2;
      ctx.strokeStyle = '#1E3B3A'; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(-1, -3); ctx.quadraticCurveTo(8, -16, 20 + o.swing * 4, -11 + sy); ctx.stroke();
      ctx.save(); gaGlow(ctx, o.color, 9 + 5 * p); ctx.fillStyle = 'rgba(190,255,235,' + (0.6 + 0.4 * p) + ')'; ctx.beginPath(); ctx.arc(20 + o.swing * 4, -11 + sy, 3, 0, TAU); ctx.fill(); ctx.restore();
      ctx.fillStyle = '#DFF6F0'; for (let i = 0; i < 4; i++){ wpSpike(ctx, 14 + i * 0.4, -3.4 + i * 2.3, 2.6 + o.swing * 1.4, 0.8, 0); }
    }
  },
  vinelash: {                                                                  /* a vine trailing from each hoof, lashing forward on the kick */
    hoof(ctx, o){
      const ext = o.swing * 12;
      ctx.strokeStyle = o.color; ctx.lineWidth = 3; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(3, 0);
      ctx.quadraticCurveTo(-4 + ext * 0.5, o.side * 5 + Math.sin(o.t * 4) * 2, -9 + ext * 1.8, o.side * 2 + Math.sin(o.t * 4 + 1.4) * 4); ctx.stroke(); ctx.lineCap = 'butt';
      ctx.fillStyle = '#7FC24A'; ctx.beginPath(); ctx.ellipse(-3 + ext, o.side * 4, 4, 2, 0.6 * o.side, 0, TAU); ctx.fill(); ctx.beginPath(); ctx.ellipse(-8 + ext * 1.6, o.side * 3, 3.6, 1.8, -0.5 * o.side, 0, TAU); ctx.fill();
    }
  },
  jaguarfang: {                                                                /* three curved claws on each hoof */
    hoof(ctx, o){
      const L = 6 + o.swing * 3.5; ctx.strokeStyle = '#F4E7C3'; ctx.lineWidth = 1.5; ctx.lineCap = 'round';
      [-3, 0, 3].forEach(function(y){ ctx.beginPath(); ctx.moveTo(4, y); ctx.quadraticCurveTo(4 + L * 0.7, y + (y ? Math.sign(y) * 1.5 : 0), 4 + L, y + (y ? Math.sign(y) * 3.2 : 0)); ctx.stroke(); });
      ctx.lineCap = 'butt'; ctx.fillStyle = o.color; ctx.beginPath(); ctx.ellipse(1, 0, 3.4, 5, 0, 0, TAU); ctx.fill();
    }
  },
  leviathan: {                                                                 /* a ring of teeth around her, spinning faster as she strikes */
    body(ctx, o){
      const a = o.t * 1.2 + o.swing * 3.2, al = 0.28 + o.swing * 0.65; ctx.save(); ctx.rotate(a); ctx.globalAlpha = al; ctx.fillStyle = o.color;
      for (let i = 0; i < 14; i++){ const th = i / 14 * TAU; ctx.save(); ctx.rotate(th); ctx.translate(26 + o.swing * 6, 0); ctx.beginPath(); ctx.moveTo(0, -2.4); ctx.lineTo(-5.5, 0); ctx.lineTo(0, 2.4); ctx.closePath(); ctx.fill(); ctx.restore(); }
      ctx.globalAlpha = al * 0.6; ctx.strokeStyle = '#E9FBFF'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(0, 0, 26 + o.swing * 6, 0, TAU); ctx.stroke(); ctx.restore(); ctx.globalAlpha = 1;
    }
  }
};
WEAPON_ART.hooves.name = 'hooves';

function weaponArtParts(){
  if (!Settings.showGear || !P.weapon || !WEAPON_ART[P.weapon.id]) return null;
  const sw = weaponSwing();
  return { art: WEAPON_ART[P.weapon.id], o: { e: sw.e, swing: sw.swing, t: G.time, color: P.weapon.color, level: P.weaponLevel || 1, side: 1 } };
}
function weaponGlow(ctx, o){ if (o.level >= 4){ gaGlow(ctx, o.color, 5 + (o.level - 4) * 3); ctx.shadowOffsetX = 0; ctx.shadowOffsetY = 0; } }
/* in the body's own space (the legs array and stride come from drawPlayer): hooves, and anything on the body */
function weaponArtBody(ctx, legs, sw, ke){
  const w = weaponArtParts(); if (!w) return;
  if (w.art.hoof){
    for (let i = 2; i < 4; i++){
      const L = legs[i]; ctx.save(); ctx.translate(L[0] + sw * L[2] * 0.7 + ke * 10 + 3, L[1] + (L[1] < 0 ? -6 : 6));
      const o = Object.assign({}, w.o, { side: L[1] < 0 ? -1 : 1 }); weaponGlow(ctx, o); w.art.hoof(ctx, o); ctx.restore();
    }
  }
  if (w.art.body){ ctx.save(); weaponGlow(ctx, w.o); w.art.body(ctx, w.o); ctx.restore(); }
}
/* in the head's space, pointing forward */
function weaponArtHead(ctx){
  const w = weaponArtParts(); if (!w || !w.art.head) return;
  ctx.save(); weaponGlow(ctx, w.o); w.art.head(ctx, w.o); ctx.restore();
}
