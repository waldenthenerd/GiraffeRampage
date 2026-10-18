'use strict';
/* Water that moves, wet and icy ground that shines, and depth sorting so tall scenery overlaps creatures. */
/* ========================= WATER AND DEPTH ========================= */
/* drawWaterFX(...) runs right after the base ground, drawActorsSorted(...) replaces the creature and player drawing in
   render(), and waterUpdate(dt) runs once per frame from update(). Settings.fxLevel 0 skips all of it. */

const WATER_BIOMES = { savanna: 1, snow: 1, swamp: 1, ocean: 1, jungle: 1, city: 1, space: 1 };
/* ground zones that are wet or slick: a moving highlight crosses them */
const SHEEN_ZONES = { ar_ice: 'ice', sv_glassice: 'ice', ct_puddle: 'wet', sw_bog: 'wet', sw_marsh: 'wet', jg_mud: 'wet', sc_mud: 'wet' };
/* scenery that stands tall enough to overlap a creature walking behind it */
const SCEN_TALL = {
  sv_acacia: 1, sv_cathedral: 1, sv_stonetree: 1, sv_withered: 1, ar_conifer: 1, ar_spires: 1, sw_cypress: 1,
  ct_tower: 1, ct_lamp: 1, sc_gantry: 1, a5_joshua: 1, vn_spire: 1, in_spire: 1, in_ribs: 1, mn_flag: 1
};

function waterGlint(ctx, x, y, s, a){
  ctx.globalAlpha = a;
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(x - s * 2.4, y - 0.6, s * 4.8, 1.2);
  ctx.fillRect(x - 0.6, y - s * 1.6, 1.2, s * 3.2);
}

function drawWaterFX(ctx, cx, cy, vw, vh){
  if (fxLevelNow() <= 0) return;
  const t = G.time, x0 = cx - vw / 2, y0 = cy - vh / 2, fx = fxLevelNow();
  const w = G.water, b = G.biome;
  if (w && WATER_BIOMES[b] && w.x > x0 - w.r - 60 && w.x < x0 + vw + w.r + 60 && w.y > y0 - w.r - 60 && w.y < y0 + vh + w.r + 60){
    const rx = w.r, ry = w.r * 0.74;
    const tone = b === 'snow' ? [225, 245, 255] : b === 'swamp' ? [190, 220, 120] : b === 'ocean' ? [120, 255, 235] : b === 'jungle' ? [170, 220, 170] : [235, 248, 255];
    const col = tone[0] + ',' + tone[1] + ',' + tone[2];
    ctx.save();
    ctx.beginPath(); ctx.ellipse(w.x, w.y, rx, ry, 0, 0, TAU); ctx.clip();
    /* rings spreading slowly from the middle (the ice only gets a gleam) */
    if (b !== 'snow'){
      ctx.lineWidth = 1.4;
      for (let i = 0; i < 3; i++){
        const k = (t * 0.16 + i / 3) % 1;
        ctx.strokeStyle = 'rgba(' + col + ',' + (0.22 * (1 - k)).toFixed(3) + ')';
        ctx.beginPath(); ctx.ellipse(w.x + Math.sin(i * 2.1) * rx * 0.2, w.y + Math.cos(i * 1.7) * ry * 0.2, rx * (0.12 + k * 0.85), ry * (0.12 + k * 0.85), 0, 0, TAU); ctx.stroke();
      }
    }
    /* a bright band sliding across the surface */
    const bx = w.x + Math.sin(t * 0.22) * rx * 0.7, bw = rx * 0.34;
    const gr = ctx.createLinearGradient(bx - bw, w.y - ry, bx + bw, w.y + ry);
    gr.addColorStop(0, 'rgba(' + col + ',0)'); gr.addColorStop(0.5, 'rgba(' + col + ',' + (b === 'snow' ? 0.3 : 0.17) + ')'); gr.addColorStop(1, 'rgba(' + col + ',0)');
    ctx.fillStyle = gr; ctx.fillRect(w.x - rx, w.y - ry, rx * 2, ry * 2);
    /* sun glitter */
    ctx.globalCompositeOperation = 'lighter';
    const n = fx >= 2 ? 11 : 6;
    for (let i = 0; i < n; i++){
      const a = scRnd(i + 0.31, 7) * TAU, d = Math.sqrt(scRnd(i + 0.31, 11)) * 0.88;
      const tw = Math.max(0, Math.sin(t * (1.4 + scRnd(i, 3)) + i * 2.3));
      if (tw < 0.2) continue;
      waterGlint(ctx, w.x + Math.cos(a) * rx * d, w.y + Math.sin(a) * ry * d, 1.6 + tw * 1.6, 0.55 * tw);
    }
    ctx.restore();
    ctx.globalAlpha = 1;
    /* a ring of foam where the water meets the bank, breathing in and out (not on ice) */
    if (b !== 'snow' && b !== 'ocean'){
      const br = 1 + 0.012 * Math.sin(t * 1.3);
      ctx.strokeStyle = 'rgba(' + col + ',0.22)'; ctx.lineWidth = 2.4;
      ctx.setLineDash([22, 14]); ctx.lineDashOffset = -t * 5;
      ctx.beginPath(); ctx.ellipse(w.x, w.y, rx * 1.02 * br, ry * 1.02 * br, 0, 0, TAU); ctx.stroke();
      ctx.setLineDash([]);
    }
  }
  /* wet and icy terrain: a highlight sweeps through the slick ground */
  if (SCEN.ch && SCEN.zones.length){
    for (let i = 0; i < SCEN.zones.length; i++){
      const z = SCEN.zones[i], kind = SHEEN_ZONES[z.def.id]; if (!kind) continue;
      if (z.x < x0 - z.rx || z.x > x0 + vw + z.rx || z.y < y0 - z.rx || z.y > y0 + vh + z.rx) continue;
      ctx.save(); ctx.translate(z.x, z.y); ctx.rotate(z.rot);
      ctx.beginPath(); ctx.ellipse(0, 0, z.rx * 0.97, z.ry * 0.97, 0, 0, TAU); ctx.clip();
      const sp = kind === 'ice' ? 0.28 : 0.16, bx = Math.sin(t * sp + z.seed * 9) * z.rx * 0.6, bw = z.rx * (kind === 'ice' ? 0.22 : 0.3);
      const g = ctx.createLinearGradient(bx - bw, -z.ry, bx + bw, z.ry);
      const c = kind === 'ice' ? '235,248,255' : '200,215,225';
      g.addColorStop(0, 'rgba(' + c + ',0)'); g.addColorStop(0.5, 'rgba(' + c + ',' + (kind === 'ice' ? 0.34 : 0.18) + ')'); g.addColorStop(1, 'rgba(' + c + ',0)');
      ctx.fillStyle = g; ctx.fillRect(-z.rx, -z.ry, z.rx * 2, z.ry * 2);
      if (kind === 'ice'){
        ctx.globalCompositeOperation = 'lighter';
        for (let k = 0; k < 5; k++){
          const a = scRnd(z.seed, k + 20) * TAU, d = Math.sqrt(scRnd(z.seed, k + 40)) * 0.85, tw = Math.max(0, Math.sin(t * (1.1 + k * 0.23) + k * 3.1 + z.seed * 40));
          if (tw > 0.25) waterGlint(ctx, Math.cos(a) * z.rx * d, Math.sin(a) * z.ry * d, 1.4 + tw * 1.8, 0.7 * tw);
        }
      }
      ctx.restore();
    }
    ctx.globalAlpha = 1;
  }
}

/* creatures wading through the pond leave rings behind them */
let _wakeAcc = 0; const _wakeQ = [];
function waterUpdate(dt){
  if (fxLevelNow() <= 0) return;
  const w = G.water; if (!w || !WATER_BIOMES[G.biome] || G.biome === 'snow' || G.biome === 'ocean') return;
  const rx = w.r, ry = w.r * 0.74;
  const inside = function(x, y, pad){ const a = (x - w.x) / (rx + pad), c = (y - w.y) / (ry + pad); return a * a + c * c < 1; };
  _wakeAcc += dt;
  if (_wakeAcc < 0.14) return;
  _wakeAcc = 0;
  const wake = function(x, y, r){ addParticle(x, y, 0, 0, r, 0.8, 'rgba(235,248,255,0.8)', { shape: 'wake', drag: 0, shrink: false, spin: 0 }); };
  if (!P.dead && inside(P.x, P.y, -4) && Math.hypot(P.vx, P.vy) > 24) wake(P.x, P.y + 14, 12);
  const near = enemiesNear(w.x, w.y, rx + 30, _wakeQ);
  let n = 0;
  for (let i = 0; i < near.length && n < 4; i++){
    const e = near[i];
    if (e.dead || e.untarg || !inside(e.x, e.y, -2) || Math.random() > 0.5) continue;
    wake(e.x, e.y + e.r * 0.5, Math.max(7, e.r * 0.7)); n++;
  }
}

/* ---- depth sorting: tall scenery, creatures and the giraffe are painted back to front ---- */
const _depthItems = [], _depthArr = [];       /* the pool, and this frame's items in the order they were added (the array that gets sorted) */
let _depthN = 0;
function _depthPush(y, kind, o){
  let it = _depthItems[_depthN];
  if (!it) it = _depthItems[_depthN] = { y: 0, k: 0, o: null };
  _depthN++;
  it.y = y; it.k = kind; it.o = o;
  _depthArr.push(it);
}
function drawGiraffeGroup(ctx){
  drawAntShadows(ctx);
  drawAnts(ctx);
  drawAllies(ctx);
  drawRover(ctx);
  drawPlayer(ctx);
  drawMarsCollector(ctx);
}
function drawActorsSorted(ctx, cx, cy, vw, vh){
  const es = G.enemies, fxOn = fxLevelNow() > 0 && SCEN.ch;
  let tall = null;
  if (fxOn){
    if (SCEN.tallFor !== SCEN.props){
      SCEN.tallFor = SCEN.props; SCEN.tall = [];
      for (let i = 0; i < SCEN.props.length; i++){ const p = SCEN.props[i]; if (SCEN_TALL[p.def.id]){ p.tall = true; p.fade = 1; SCEN.tall.push(p); } }
    }
    tall = SCEN.tall;
  }
  const x0 = cx - vw / 2, y0 = cy - vh / 2;
  _depthN = 0; _depthArr.length = 0;
  let tallVisible = 0;
  if (tall && tall.length){
    for (let i = 0; i < tall.length; i++){
      const p = tall[i], m = p.r * p.s + 150;
      if (p.x < x0 - m || p.x > x0 + vw + m || p.y < y0 - 40 || p.y > y0 + vh + m) continue;
      _depthPush(p.y + 2, 1, p); tallVisible++;
    }
  }
  if (!tallVisible){                                    /* nothing tall in view: the plain order */
    for (let i = 0; i < es.length; i++){
      const e = es[i];
      if (e.x < cx - vw / 2 - 90 || e.x > cx + vw / 2 + 90 || e.y < cy - vh / 2 - 90 || e.y > cy + vh / 2 + 90) continue;
      drawEnemy(ctx, e);
    }
    drawGiraffeGroup(ctx);
    return;
  }
  const tallEnd = _depthN;
  for (let i = 0; i < es.length; i++){
    const e = es[i];
    if (e.x < cx - vw / 2 - 90 || e.x > cx + vw / 2 + 90 || e.y < cy - vh / 2 - 90 || e.y > cy + vh / 2 + 90) continue;
    _depthPush(e.y + e.r * 0.5, 0, e);
  }
  _depthPush(P.y + 14, 2, null);
  /* a tree that hides something fades out so it can still be seen */
  for (let i = 0; i < tallEnd; i++){
    const p = _depthItems[i].o, W = p.r * p.s * 0.9, H = p.r * p.s * 1.7 + 20;
    let hid = false;
    for (let k = tallEnd; k < _depthN && !hid; k++){
      const it = _depthItems[k], a = it.k === 2 ? P : it.o, dy = p.y - a.y, dx = a.x - p.x;
      if (dy > 0 && dy < H && dx > -W - a.r && dx < W + a.r) hid = true;
    }
    p.fade += ((hid ? 0.36 : 1) - p.fade) * 0.18;
  }
  const arr = _depthArr;
  arr.sort(function(a, b){ return a.y - b.y; });
  const t = G.time;
  for (let i = 0; i < arr.length; i++){
    const it = arr[i];
    if (it.k === 0) drawEnemy(ctx, it.o);
    else if (it.k === 2) drawGiraffeGroup(ctx);
    else {
      const p = it.o;
      ctx.save(); ctx.translate(p.x, p.y); if (p.def.rot) ctx.rotate(p.rot); ctx.scale(p.s, p.s);
      if (p.fade < 0.99) ctx.globalAlpha = p.fade;
      p.def.draw(ctx, p, t); ctx.restore();
      ctx.globalAlpha = 1;
    }
  }
}
