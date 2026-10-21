'use strict';
/* Bread from the bakery, and the car from the garage. */
/* ========================= 44z. BREAD AND THE CAR ========================= */
/* BREAD. Bought at the bakery in Market Street (Save.data.town.n.loaves is the stock, n.bought counts every loaf ever bought).
   In a run, a loaf heals 5% of her maximum health; there is a 15 second cooldown between loaves. The key (default B, rebindable) or the
   button eats one; with Settings.autoBread on (the default) one is eaten by itself whenever she is under 75% health and the cooldown
   is over. Nothing else about the run changes.
   THE CAR. Bought at the garage (Save.data.town.car = { own:1, col:n }, col any unlocked colour number). In Longneck Town the C key (or
   the Car button) gets in and out, and driving is 2.2 times as fast; the neck still stretches out of the open roof. It is left behind at
   the manhole: cars cannot go underground, so the Burrows and every indoor place put it away. In a run it is only in Chapter 6
   (Houston), where it is 45% faster and is drawn under her. Everywhere else it simply is not used. */
const BREAD_COOLDOWN = 15, BREAD_HEAL = 0.05, BREAD_CAP = 30, BREAD_AUTO_BELOW = 0.75, CAR_PRICE = 24000, TOWN_CAR_MUL = 2.2, CAR_RUN_MUL = 1.45;
const Bread = { cd: 0 };
function breadStock(){ return Math.max(0, townData().n.loaves | 0); }
function breadPrice(){ return Math.max(20, Math.round(townCoin() * 0.35)); }
function breadBuy(n){
  const t = townData(), have = breadStock(), room = (typeof breadCap === 'function' ? breadCap() : BREAD_CAP) - have;
  n = Math.min(n, room);
  if (n <= 0){ SFX.deny(); return 0; }
  const cost = n * breadPrice();
  if ((Save.data.gold | 0) < cost){ SFX.deny(); return 0; }
  Save.data.gold -= cost; t.n.loaves = have + n; t.n.bought = (t.n.bought | 0) + n; Save.write(); SFX.coin();
  return n;
}
function breadReady(){ return G.state === 'playing' && !G.attract && !P.dead && Bread.cd <= 0 && breadStock() > 0 && P.hp > 0 && P.hp < P.maxHp; }
function breadEat(manual){
  if (!breadReady()){ if (manual) SFX.deny(); return false; }
  const t = townData(), h = Math.max(1, Math.round(P.maxHp * (typeof breadHeal === 'function' ? breadHeal() : BREAD_HEAL)));
  t.n.loaves = breadStock() - 1; t.n.eaten = (t.n.eaten | 0) + 1; Save.write();
  P.hp = Math.min(P.maxHp, P.hp + h); Bread.cd = BREAD_COOLDOWN;
  addText(P.x, P.y - 46, '+' + h + ' bread', '#F2D79A', 14, false);
  try { SFX.pickupS ? sfx('pickupS', 0.04) : SFX.coin(); } catch (e) {}
  return true;
}
(function(){
  const tick = Feedback.tick;
  let btn = null, lastTxt = '', lastCd = -1, shown = false;
  function make(){
    btn = document.createElement('button'); btn.id = 'breadBtn'; btn.type = 'button';
    ['pointerdown', 'mousedown', 'touchstart'].forEach(function(ev){ btn.addEventListener(ev, function(e){ e.stopPropagation(); }); });
    btn.addEventListener('click', function(e){ e.stopPropagation(); breadEat(true); });
    document.body.appendChild(btn);
  }
  Feedback.tick = function(dt){
    tick.call(this, dt);
    const playing = G.state === 'playing' && !G.attract;
    if (playing){
      if (Bread.cd > 0) Bread.cd = Math.max(0, Bread.cd - dt);
      if (Settings.autoBread !== false && Bread.cd <= 0 && breadStock() > 0 && P.hp > 0 && P.hp <= P.maxHp * BREAD_AUTO_BELOW) breadEat(false);
    }
    const want = playing && breadStock() > 0;
    if (want !== shown){ if (!btn) make(); shown = want; btn.className = want ? 'on' : ''; }
    if (want && btn){
      const cdv = Math.ceil(Bread.cd), pct = Math.round(Math.max(0, Bread.cd) / BREAD_COOLDOWN * 50) * 2;
      const txt = breadStock() + '|' + cdv + '|' + pct + '|' + (Input.hasTouch ? 't' : keyName(keyOf('bread')));
      if (txt !== lastTxt){
        btn.innerHTML = '<svg class="bi" viewBox="0 0 40 28" width="34" height="24"><ellipse cx="20" cy="15" rx="18" ry="11" fill="#D9A05A"/><ellipse cx="20" cy="12" rx="16" ry="8" fill="#E8B876"/><path d="M10 9 L14 17 M18 7 L22 16 M26 8 L30 17" stroke="#A66A2C" stroke-width="2.6" stroke-linecap="round"/></svg>' +
          '<span class="bt"><b>x' + breadStock() + '</b>' + (cdv > 0 ? '<i>' + cdv + 's</i>' : (Input.hasTouch ? '' : '<i>' + keyName(keyOf('bread')) + '</i>')) + '</span>' +
          '<span class="bcd" style="width:' + pct + '%"></span>';
        lastTxt = txt;
      }
      btn.classList.toggle('cool', cdv > 0);
      const ready = Bread.cd <= 0 && P.hp < P.maxHp;
      btn.classList.toggle('ready', ready);
    }
  };
  window.addEventListener('keydown', function(e){
    if (e.repeat || G.rebinding || e.code !== keyOf('bread')) return;
    const a = document.activeElement; if (a && (a.tagName === 'INPUT' || a.tagName === 'TEXTAREA' || a.tagName === 'SELECT')) return;
    if (G.state === 'playing' && breadEat(true)) e.preventDefault();
  });
  /* a fresh run starts with the loaf ready */
  const sr = startRun;
  startRun = function(){ Bread.cd = 0; return sr.apply(this, arguments); };
})();

/* ---- the car ---- */
function townCarData(){ const t = townData(); if (!t.car || typeof t.car !== 'object' || Array.isArray(t.car)) t.car = { own: 0, col: 0 }; t.car.own = t.car.own ? 1 : 0; t.car.col = t.car.col | 0; return t.car; }
function townCarColour(){ const c = townCarData().col | 0; return c >= 1 && c <= WARD_MAX && wardUnlocked(c) ? WARD[c].c : '#D5352B'; }
function townCarPaint(n){ const c = townCarData(); if (n === 0 || (n >= 1 && n <= WARD_MAX && wardUnlocked(n))){ c.col = n; Save.write(); return true; } return false; }
function townCarRunActive(){ return townCarOwned() && G.state === 'playing' && !G.attract && typeof chapterOf === 'function' && chapterOf(G.wave) === 6; }
/* the car as the town sees it: side view, an open roof, her neck up through it. Drawn AFTER her so the body hides her legs. */
function townCarSide(ctx, x, gy, o){
  o = o || {};
  const dir = o.flip ? -1 : 1, col = o.col || townCarColour(), t = o.t || 0, spin = o.spin || 0, hover = o.moving ? Math.sin(t * 24) * 0.7 : 0;
  ctx.save(); ctx.translate(x, gy + hover); ctx.scale(1.5 * dir, 1.5);
  ctx.fillStyle = 'rgba(0,0,0,.22)'; ctx.beginPath(); ctx.ellipse(0, 1, 52, 5, 0, 0, TAU); ctx.fill();
  const dk = wardShade(col, 0.7), lt = blendHex(col, '#FFFFFF', 0.35);
  ctx.fillStyle = dk;                                                                   /* the rear and the underside */
  ctx.beginPath(); ctx.moveTo(-50, -8); ctx.lineTo(-52, -26); ctx.lineTo(50, -26); ctx.lineTo(52, -8); ctx.closePath(); ctx.fill();
  ctx.fillStyle = col;                                                                  /* the body: low at the back, a long bonnet */
  ctx.beginPath(); ctx.moveTo(-50, -10); ctx.lineTo(-52, -28); ctx.quadraticCurveTo(-30, -32, -8, -31); ctx.lineTo(20, -31); ctx.quadraticCurveTo(40, -30, 50, -22); ctx.lineTo(52, -10); ctx.closePath(); ctx.fill();
  ctx.fillStyle = lt; ctx.beginPath(); ctx.moveTo(-46, -26); ctx.quadraticCurveTo(-26, -29, -6, -28); ctx.lineTo(18, -28); ctx.lineTo(18, -25); ctx.lineTo(-46, -23); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#1E2230'; ctx.fillRect(-50, -14, 100, 4);                            /* the sill */
  ctx.fillStyle = 'rgba(255,255,255,.12)'; ctx.fillRect(-20, -22, 34, 1.4);
  ctx.fillStyle = '#9FD8F2'; ctx.beginPath(); ctx.moveTo(14, -31); ctx.lineTo(28, -46); ctx.lineTo(32, -45); ctx.lineTo(24, -30); ctx.closePath(); ctx.fill();   /* the windscreen */
  ctx.strokeStyle = dk; ctx.lineWidth = 2.2; ctx.beginPath(); ctx.moveTo(14, -31); ctx.lineTo(28, -46); ctx.stroke();
  ctx.fillStyle = '#2A2A34'; ctx.beginPath(); ctx.roundRect(-20, -37, 30, 8, 3); ctx.fill();   /* the seat back and rest */
  ctx.fillStyle = '#FFF2B0'; ctx.beginPath(); ctx.ellipse(48, -20, 3.4, 4.2, 0, 0, TAU); ctx.fill();    /* a headlight */
  ctx.fillStyle = '#D5352B'; ctx.fillRect(-52, -24, 3, 6);
  [-32, 34].forEach(function(wx){
    ctx.save(); ctx.translate(wx, -9);
    ctx.fillStyle = '#16161C'; ctx.beginPath(); ctx.arc(0, 0, 11, 0, TAU); ctx.fill();
    ctx.fillStyle = '#C9CDD9'; ctx.beginPath(); ctx.arc(0, 0, 6, 0, TAU); ctx.fill();
    ctx.rotate(spin); ctx.strokeStyle = '#6A6F78'; ctx.lineWidth = 2; ctx.beginPath(); for (let k = 0; k < 3; k++){ ctx.moveTo(0, 0); ctx.lineTo(Math.cos(k * TAU / 3) * 5.4, Math.sin(k * TAU / 3) * 5.4); } ctx.stroke();
    ctx.restore();
  });
  ctx.restore();
}
/* from above, under her: only the car's own colours and lights, on the ground in Houston */
function townCarTop(ctx, x, y, ang, moving){
  const col = townCarColour(), dk = wardShade(col, 0.7);
  ctx.save(); ctx.translate(x, y); ctx.rotate(ang);
  ctx.fillStyle = 'rgba(0,0,0,.28)'; ctx.beginPath(); ctx.ellipse(2, 5, 46, 24, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = '#16161C'; [[-26, -23], [26, -23], [-26, 23], [26, 23]].forEach(function(w){ ctx.beginPath(); ctx.roundRect(w[0] - 9, w[1] - 5, 18, 10, 3); ctx.fill(); });
  ctx.fillStyle = col; ctx.beginPath(); ctx.roundRect(-44, -20, 88, 40, 10); ctx.fill();
  ctx.fillStyle = dk; ctx.fillRect(-44, -3, 88, 6);
  ctx.fillStyle = 'rgba(255,255,255,.28)'; ctx.fillRect(-36, -16, 70, 3);
  ctx.fillStyle = '#9FD8F2'; ctx.fillRect(14, -16, 10, 32);
  ctx.fillStyle = '#2A2A34'; ctx.beginPath(); ctx.roundRect(-24, -14, 20, 28, 5); ctx.fill();
  ctx.fillStyle = '#FFF2B0'; ctx.beginPath(); ctx.arc(43, -12, 3.4, 0, TAU); ctx.arc(43, 12, 3.4, 0, TAU); ctx.fill();
  if (moving){ const g = ctx.createLinearGradient(44, 0, 120, 0); g.addColorStop(0, 'rgba(255,244,170,.32)'); g.addColorStop(1, 'rgba(255,244,170,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(44, -10); ctx.lineTo(120, -34); ctx.lineTo(120, 34); ctx.lineTo(44, 10); ctx.closePath(); ctx.fill(); }
  ctx.fillStyle = '#D5352B'; ctx.fillRect(-45, -16, 3, 7); ctx.fillRect(-45, 9, 3, 7);
  ctx.restore();
}
(function(){
  const dp = drawPlayer;
  drawPlayer = function(ctx){
    if (!townCarRunActive()) return dp(ctx);
    townCarTop(ctx, P.x, P.y + 4, P.face, Math.hypot(P.vx, P.vy) > 40);
    const ae = accEquipped;                                                      /* her boots are not shown while she drives */
    accEquipped = function(kind){ return kind === 'boot' ? null : ae(kind); };
    try { return dp(ctx); } finally { accEquipped = ae; }
  };
})();

/* ---- getting in and out, and drawing her (a car, or not) ---- */
function townCarToggle(){
  const D = TOWN_DIST[Town.d];
  if (Town.car){ Town.car = false; SFX.click(); townToast('She gets out. The car is parked somewhere sensible.', '#E8D8B0'); return; }
  if (!townCarOwned()){ townToast('Buy a car at Torque Motors on Market Street.', '#E8D8B0'); SFX.deny(); return; }
  if (D.cave){ townToast('Cars cannot go underground.', '#FFB89A'); SFX.deny(); return; }
  if (D.indoor){ townToast('Not indoors!', '#FFB89A'); SFX.deny(); return; }
  Town.car = true; SFX.level(); townToast('Vroom. Hold up to stretch her neck out of the roof.', '#E8D8B0');
}
function townDrawPlayer(ctx, t){
  const o = { s: 1.5, flip: Town.face < 0, ph: Town.ph, moving: Math.abs(Town.vx) > 12, reach: Town.reach, t: t };
  if (!Town.car){ townGiraffe(ctx, Town.x, TG, o); return; }
  o.sit = true; o.moving = false; o.noLegs = true;
  townGiraffe(ctx, Town.x, TG, o);
  Town.spin = (Town.spin || 0) + Town.vx * 0.0016;
  townCarSide(ctx, Town.x, TG, { flip: o.flip, t: t, spin: Town.spin, moving: Math.abs(Town.vx) > 30 });
  if (Math.abs(Town.vx) > 90 && fxLevelNow() > 0 && Math.random() < 0.35) townBurst(Town.x - Town.face * 78, TG - 16, 'rgba(210,210,220,.8)', 1);
}
