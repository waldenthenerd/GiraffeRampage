'use strict';
/* =============================================================================================================================
   33c-gear-art-armor.js  --  THE ARMOR PASS. The sixteen armors in ARMOR_DESIGNS (33-giraffe-art.js) were checked at three times their size;
   four were weak (the Herdhide Vest was a smudge, the Tideshell and Riptide plates thin, the Twinsoul harness a plain cross) and are redrawn
   here (ARMOR_REDRAW). Every armor also gets what its piece is worth: a glint by rarity (rare: a faint rim, epic: pulsing sparkles,
   legendary: motes circling it, mythical: a ring of shifting colours) and one gold pip per level above the first. The original functions stay in place and are wrapped, so
   drawPlayer() is untouched; armorDraw() is the single entry point (the Gear page icons and the preview use it too).
   P.armorLevel is kept up to date by 33a-gear-art-capes.js.
   ============================================================================================================================= */
const ARMOR_REDRAW = {
  herdhide(ctx, c, t){                                                         /* a hide vest: two shoulder panels, a spine strap, stitching, a brass ring */
    ctx.fillStyle = c; ctx.beginPath(); ctx.ellipse(-2, -1, 17, 9.5, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = shade(c, -0.14); ctx.beginPath(); ctx.ellipse(-2, -1, 17, 9.5, 0, 0.15, Math.PI - 0.15); ctx.fill();
    ctx.strokeStyle = shade(c, -0.4); ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-18, -1); ctx.lineTo(14, -1); ctx.stroke();
    ctx.lineWidth = 2.2; ctx.beginPath(); ctx.moveTo(-11, -9); ctx.lineTo(-11, 8); ctx.moveTo(8, -9); ctx.lineTo(8, 8); ctx.stroke();
    ctx.strokeStyle = shade(c, 0.5); ctx.lineWidth = 0.8; ctx.setLineDash([1.6, 1.6]); ctx.beginPath(); ctx.ellipse(-2, -1, 14.5, 7.4, 0, 0, TAU); ctx.stroke(); ctx.setLineDash([]);
    [-11, 8].forEach(function(x){ fillCircle(ctx, x, -6, 1.1, '#D9B25A'); fillCircle(ctx, x, 5, 1.1, '#D9B25A'); });
    ctx.strokeStyle = '#D9B25A'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.arc(-2, -1, 3.4, 0, TAU); ctx.stroke(); fillCircle(ctx, -2, -1, 1.2, '#8A6A2A');
  },
  tideshell(ctx, c, t){                                                        /* rows of overlapping shells, a pearl in the middle */
    ctx.fillStyle = shade(c, -0.3); ctx.beginPath(); ctx.ellipse(-2, -1, 17, 9.8, 0, 0, TAU); ctx.fill();
    ctx.save(); ctx.beginPath(); ctx.ellipse(-2, -1, 17, 9.8, 0, 0, TAU); ctx.clip();
    for (let row = 0; row < 4; row++) for (let k = 0; k < 6; k++){
      const x = -17 + k * 6 + (row % 2) * 3, y = -9 + row * 5.2;
      ctx.fillStyle = (row + k) % 2 ? c : shade(c, 0.16); ctx.strokeStyle = shade(c, -0.5); ctx.lineWidth = 0.7;
      ctx.beginPath(); ctx.arc(x, y, 4.2, 0, Math.PI); ctx.fill(); ctx.stroke();
      ctx.strokeStyle = shade(c, 0.4); ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y + 3.4); ctx.stroke();
    }
    ctx.restore();
    fillCircle(ctx, -2, -1, 3, '#F3EFE6'); fillCircle(ctx, -2.8, -1.8, 1, '#FFFFFF');
  },
  riptide(ctx, c, t){                                                          /* bands of rolling wave, foam on the crests */
    ctx.fillStyle = shade(c, -0.35); ctx.beginPath(); ctx.ellipse(-2, -1, 17, 9.8, 0, 0, TAU); ctx.fill();
    ctx.save(); ctx.beginPath(); ctx.ellipse(-2, -1, 17, 9.8, 0, 0, TAU); ctx.clip();
    for (let b = 0; b < 4; b++){
      ctx.strokeStyle = b % 2 ? shade(c, 0.25) : c; ctx.lineWidth = 3.2; ctx.beginPath();
      for (let x = -19; x <= 15; x += 2){ const y = -8 + b * 5.4 + Math.sin(x * 0.45 + t * 2 + b) * 1.8; if (x === -19) ctx.moveTo(x, y); else ctx.lineTo(x, y); }
      ctx.stroke();
      ctx.fillStyle = '#F4FBFF'; for (let k = 0; k < 3; k++){ const x = -15 + k * 11 + b * 2; ctx.beginPath(); ctx.arc(x, -8 + b * 5.4 + Math.sin(x * 0.45 + t * 2 + b) * 1.8 - 1.2, 0.9, 0, TAU); ctx.fill(); }
    }
    ctx.restore();
    ctx.strokeStyle = shade(c, 0.5); ctx.lineWidth = 1; ctx.beginPath(); ctx.ellipse(-2, -1, 16.4, 9.2, 0, 0, TAU); ctx.stroke();
  },
  twinsoul(ctx, c, t){                                                         /* two halves in two tones, a linking chain and a bead for each soul */
    const c2 = shade(c, -0.32);
    ctx.fillStyle = c; ctx.beginPath(); ctx.ellipse(-2, -1, 17, 9.8, 0, Math.PI, TAU); ctx.fill();
    ctx.fillStyle = c2; ctx.beginPath(); ctx.ellipse(-2, -1, 17, 9.8, 0, 0, Math.PI); ctx.fill();
    ctx.strokeStyle = shade(c, 0.5); ctx.lineWidth = 1; ctx.beginPath(); ctx.ellipse(-2, -1, 16.4, 9.2, 0, 0, TAU); ctx.stroke();
    ctx.lineWidth = 1.4; ctx.strokeStyle = '#E9F7FF'; ctx.setLineDash([2.2, 1.6]); ctx.beginPath(); ctx.moveTo(-14, -5); ctx.quadraticCurveTo(-2, 5 + Math.sin(t * 2) * 1.5, 10, 4); ctx.stroke(); ctx.setLineDash([]);
    fillCircle(ctx, -9, -4.5, 2.6, shade(c, 0.45)); fillCircle(ctx, 6, 4.2, 2.6, shade(c2, 0.4)); fillCircle(ctx, -9, -4.5, 1, c2); fillCircle(ctx, 6, 4.2, 1, c);
  }
};
const ARMOR_ORIG = {};
Object.keys(ARMOR_DESIGNS).forEach(function(id){ ARMOR_ORIG[id] = ARMOR_DESIGNS[id]; });

/* what the piece is worth, on top of the design: pips for levels, a glint for rarity */
function armorDecorate(ctx, setId, color, rarity, level, t){
  ctx.save();
  ctx.shadowBlur = 0;                                                         /* the giraffe's dark rim is for her outline; pips and sparkles are drawn plain */
  for (let i = 0; i < level - 1; i++){ ctx.fillStyle = '#FFD84D'; ctx.beginPath(); ctx.arc(-14 + i * 3.6, 12.2, 1.35, 0, TAU); ctx.fill(); ctx.strokeStyle = '#8A6A12'; ctx.lineWidth = 0.5; ctx.stroke(); }
  if (rarity === 'rare'){ ctx.globalAlpha = 0.3; ctx.strokeStyle = '#FFFFFF'; ctx.lineWidth = 0.9; ctx.beginPath(); ctx.ellipse(-2, -1, 17.4, 10.2, 0, 0, TAU); ctx.stroke(); }
  else if (rarity === 'epic'){
    for (let i = 0; i < 3; i++){ const p = 0.5 + 0.5 * Math.sin(t * 3 + i * 2.1), a = i * 2.1 + t * 0.3; ctx.globalAlpha = 0.3 + p * 0.6; ctx.fillStyle = '#FFFFFF'; ctx.beginPath(); ctx.arc(-2 + Math.cos(a) * 11, -1 + Math.sin(a) * 5.8, 0.8 + p * 0.9, 0, TAU); ctx.fill(); }
  } else if (rarity === 'mythical'){
    const glow = fxLevelNow() >= 2 ? lightSprite([255, 107, 214]) : null;      /* a cached soft halo per mote instead of a blur pass on each */
    for (let i = 0; i < 7; i++){
      const a = i / 7 * TAU - t * 1.1, k = 0.55 + 0.45 * Math.sin(t * 4 + i * 1.7), mx = -2 + Math.cos(a) * 20, my = -1 + Math.sin(a) * 12.4, r = 1.2 + k * 0.8;
      ctx.globalAlpha = 0.5 + 0.5 * k; ctx.fillStyle = 'hsl(' + Math.round((i * 51 + t * 90) % 360) + ',85%,72%)'; ctx.beginPath(); ctx.arc(mx, my, r, 0, TAU); ctx.fill();
      if (glow){ ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = 0.35 * k; ctx.drawImage(glow, mx - 7, my - 7, 14, 14); ctx.globalCompositeOperation = 'source-over'; }
    }
  } else if (rarity === 'legendary'){
    const glow = fxLevelNow() >= 2 ? lightSprite([255, 230, 140]) : null;
    for (let i = 0; i < 5; i++){
      const a = i / 5 * TAU + t * 0.9, mx = -2 + Math.cos(a) * 19, my = -1 + Math.sin(a) * 11.4;
      ctx.globalAlpha = 0.85; ctx.fillStyle = '#FFF6C0'; ctx.beginPath(); ctx.arc(mx, my, 1.3, 0, TAU); ctx.fill();
      if (glow){ ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = 0.3; ctx.drawImage(glow, mx - 6, my - 6, 12, 12); ctx.globalCompositeOperation = 'source-over'; }
    }
  }
  ctx.restore();
}
/* one armor, at a given level: the redraw or the original design, then the decoration */
function armorDraw(ctx, setId, color, rarity, level, t){
  const d = ARMOR_REDRAW[setId] || ARMOR_ORIG[setId]; if (!d) return false;
  d(ctx, color, t); armorDecorate(ctx, setId, color, rarity, level, t); return true;
}
Object.keys(ARMOR_ORIG).forEach(function(id){
  ARMOR_DESIGNS[id] = function(ctx, c, t){ armorDraw(ctx, id, c, (typeof SETMAP !== 'undefined' && SETMAP[id] ? SETMAP[id].rarity : 'common'), P.armorLevel || 1, t); };
});
