'use strict';
/* Chapter 15, the Siege: Longneck Town as the arena (the chapter itself is in js/30e-chapter-siege.js). */
/* ========================= THE SIEGE IN PLAY ========================= */
function buildSiegeWorld(){ G.buildings = []; G.rocket = null; }
function drawGroundSiege(ctx, cx, cy, vw, vh){
  ctx.fillStyle = '#6E6A60'; ctx.fillRect(cx - vw / 2 - 40, cy - vh / 2 - 40, vw + 80, vh + 80);
}
