'use strict';
/* The spaceplane. */
/* ========================= THE SPACEPLANE (after Chapter 10) ========================= */
/* The spaceship engine part from the end of Chapter 10 makes a way home possible. At the Venus outpost the giraffe can build a
   spaceplane in four stages, paid for with everything the game has taught her to collect: sulfur and basalt from Venus, and gems
   and gold from everywhere else. Finishing it lets her fly home (the homecoming film). Sulfur and basalt are the scarce ones. */
const SHIP_STAGES = [
  { id: 'frame',   icon: '@t-x-hull', name: 'Hull Frame',            desc: 'Ribs and spars on the launch pad, cut from Venus basalt and welded with sulfur.',                          cost: { s: 150, b: 250, gems: 4000,  gold: 500000 } },
  { id: 'wings',   icon: '@t-x-plane', name: 'Wings and Heat Tiles',  desc: 'Skin, swept wings and a belly of black tiles, to survive the way back down.',                               cost: { s: 200, b: 200, gems: 6000,  gold: 800000 } },
  { id: 'engine',  icon: '@t-x-cog', name: 'Fit the Engine Core', desc: 'The spaceship engine part goes into the tail. It still glows. Nobody is quite sure why.',                  cost: { s: 250, b: 150, gems: 8000,  gold: 1200000 } },
  { id: 'cockpit', icon: '@t-x-fuel',    name: 'Fuel and Cockpit',       desc: 'A tall cockpit dome, built for a long neck, and enough fuel to cross the void.',                            cost: { s: 300, b: 200, gems: 12000, gold: 1500000 } }
];
const SHIP_CUR = [['s', 'sulfur', 'sulfur', '#F2D43A'], ['b', 'basalt', 'basalt', '#AEB8E0'], ['gems', 'gems', 'gems', '#7AD8FF'], ['gold', 'gold', 'gold', '#FFD27A']];
function shipUnlocked(){ return !!(Save.data && Save.data.enginePart); }
function shipStage(){ return Math.max(0, Math.min(SHIP_STAGES.length, (Save.data && Save.data.spaceplane) | 0)); }
function shipBuilt(){ return shipStage() >= SHIP_STAGES.length; }
function shipHave(k){ return k === 's' ? Save.data.sulfur | 0 : k === 'b' ? Save.data.basalt | 0 : Save.data[k] | 0; }
function shipLacking(i){ const c = SHIP_STAGES[i].cost, out = []; for (const cur of SHIP_CUR) if (shipHave(cur[0]) < c[cur[0]]) out.push(cur[1]); return out; }
/* why a stage cannot be built right now: 'nopart' (no engine part), 'built', 'order' (an earlier stage is missing), 'poor', or null */
function shipBuyCheck(i){
  if (!(i >= 0 && i < SHIP_STAGES.length)) return 'order';
  if (!shipUnlocked()) return 'nopart';
  if (i < shipStage()) return 'built';
  if (i > shipStage()) return 'order';
  return shipLacking(i).length ? 'poor' : null;
}
function buyShipStage(i){
  i = i | 0; if (shipBuyCheck(i)) return false;
  const c = SHIP_STAGES[i].cost, d = Save.data;
  d.sulfur = (d.sulfur | 0) - c.s; d.basalt = (d.basalt | 0) - c.b; d.gems = (d.gems | 0) - c.gems; d.gold = (d.gold | 0) - c.gold;
  d.spaceplane = i + 1; Save.write(); return true;
}
function shipCostHTML(i){
  const c = SHIP_STAGES[i].cost; let out = '';
  for (const cur of SHIP_CUR){ const lack = shipHave(cur[0]) < c[cur[0]]; out += (out ? ' \u00B7 ' : '') + '<span style="color:' + (lack ? '#FF7A6A' : cur[3]) + '">' + fmt(c[cur[0]]) + ' ' + cur[2] + '</span>'; }
  return out;
}
function shipTabHTML(){
  const st = shipStage(), built = shipBuilt(), done = !!Save.data.homecoming;
  let out = '<p class="sub">' + (built
    ? 'The spaceplane stands on its pad, fuelled and ready.'
    : 'The spaceship engine part is more than a trophy: with enough metal, sulfur, gems and gold it could carry a giraffe home. Build the spaceplane one stage at a time; each stage needs the one before it, and <b>every kind of material</b> listed.') + '</p>';
  out += '<div class="sub" style="margin:2px 0 6px">You have: ' + SHIP_CUR.map(c => '<span style="color:' + c[3] + '">' + fmt(shipHave(c[0])) + ' ' + c[2] + '</span>').join(' \u00B7 ') + '</div>';
  out += '<canvas id="shipPic" width="720" height="260" style="width:100%;border-radius:6px;border:1px solid var(--bark2);margin:2px 0 8px"></canvas><div class="shoplist">';
  for (let i = 0; i < SHIP_STAGES.length; i++){
    const S = SHIP_STAGES[i], why = shipBuyCheck(i), isBuilt = why === 'built';
    out += '<div class="shoprow" data-srow="' + S.id + '"' + (why === 'order' ? ' style="opacity:.55"' : '') + '>' +
      '<div class="ic">' + ico(S.icon) + '</div>' +
      '<div class="txt"><div class="nm">' + (i + 1) + '. ' + S.name + (isBuilt ? ' \u2714' : '') + '</div>' +
        '<div class="ds">' + S.desc + '</div>' +
        (isBuilt ? '' : '<div class="ds">' + shipCostHTML(i) + '</div>') +
        (why === 'order' ? '<div class="ds" style="color:#E8A060">Requires: ' + SHIP_STAGES[i - 1].name + '</div>' : '') + '</div>' +
      (isBuilt ? '<div class="maxed">Built</div>'
        : '<button class="btn sm buy' + (why ? ' ghost' : '') + '" data-ship="' + i + '"' + (why ? ' disabled' : '') + '>' + (why === 'order' ? 'Locked' : 'Build') + '</button>') +
      '</div>';
  }
  out += '</div>';
  out += built
    ? '<button class="btn" data-a="ship-launch" style="margin:14px auto 4px;display:block">' + (done ? 'Replay the flight home' : 'Fly home to Earth') + '</button>' +
      (done ? '<p class="sub" style="text-align:center">You are home. The giraffe is safe in the Underground Giraffe City.</p>' : '<p class="sub" style="text-align:center">There is no coming back to Venus on this flight: but the outpost will still be here, and so will you.</p>')
    : '<p class="sub" style="text-align:center;margin-top:12px">Finish all four stages to fly home (' + st + ' of ' + SHIP_STAGES.length + ' built).</p>';
  return out;
}
/* the picture of the pad: the plane appears part by part as it is built, inside a scaffold that comes down when it is finished */
function drawShipPic(cv){
  if (!cv || !cv.getContext) return;
  const ctx = cv.getContext('2d'), W = cv.width, H = cv.height, st = shipStage(), t = G.time || 0;
  const sg = ctx.createLinearGradient(0, 0, 0, H); sg.addColorStop(0, '#2A1208'); sg.addColorStop(0.6, '#8A3A14'); sg.addColorStop(1, '#E8A050'); ctx.fillStyle = sg; ctx.fillRect(0, 0, W, H);
  const gg = ctx.createLinearGradient(0, 196, 0, H); gg.addColorStop(0, '#6A4A32'); gg.addColorStop(1, '#2A1C16'); ctx.fillStyle = gg; ctx.fillRect(0, 196, W, H - 196);
  ctx.fillStyle = '#4A4650'; ctx.fillRect(40, 196, W - 80, 14); ctx.fillStyle = '#6A6670'; ctx.fillRect(40, 196, W - 80, 4);
  ctx.fillStyle = '#F4C040'; for (let x = 70; x < W - 90; x += 70) ctx.fillRect(x, 202, 30, 3);
  const px = 380, py = st >= 2 ? 196 - 44 * 1.3 : 150;           /* with the wheels down, the tyres rest on the pad */
  if (st < 4){                                                                        /* the scaffold round the plane, taller as the plane grows */
    ctx.strokeStyle = '#8A8E9A'; ctx.lineWidth = 3;
    for (const sx of [150, 610]){ ctx.beginPath(); ctx.moveTo(sx, 196); ctx.lineTo(sx, 66); ctx.moveTo(sx + 26, 196); ctx.lineTo(sx + 26, 66); ctx.stroke(); ctx.lineWidth = 1.6; for (let y = 196; y > 66; y -= 26){ ctx.beginPath(); ctx.moveTo(sx, y); ctx.lineTo(sx + 26, y - 26); ctx.moveTo(sx + 26, y); ctx.lineTo(sx, y - 26); ctx.stroke(); } ctx.lineWidth = 3; }
    ctx.beginPath(); ctx.moveTo(150, 66); ctx.lineTo(636, 66); ctx.moveTo(176, 66); ctx.lineTo(176, 66); ctx.stroke();
    fillCircle(ctx, 163, 60, 4, Math.sin(t * 4) > 0 ? '#FF8A3A' : '#6A3A20');
  }
  if (st < 3){                                                                         /* the salvaged engine core waits on the pad until it is fitted */
    const cx = st >= 1 ? 560 : 520; csGlow(ctx, cx, 180, 46, '#FFB050', 0.5 + 0.2 * Math.sin(t * 3));
    ctx.fillStyle = '#3A3E48'; ctx.fillRect(cx - 18, 168, 36, 28); ctx.fillStyle = '#FF8A30'; ctx.beginPath(); ctx.ellipse(cx, 168, 14, 5, 0, 0, TAU); ctx.fill(); fillCircle(ctx, cx, 168, 4, '#FFF2C0');
  }
  if (st === 1){ ctx.strokeStyle = '#8A8E9A'; ctx.lineWidth = 4; for (const dx of [-110, 70]){ ctx.beginPath(); ctx.moveTo(px + dx * 1.3, 166); ctx.lineTo(px + dx * 1.3, 196); ctx.stroke(); } }      /* cradles hold the bare frame */
  if (st >= 1) hmPlane(ctx, { x: px, y: st >= 2 ? py : 150, s: 1.3, gear: true, build: st, t: t, core: 0.55 + 0.25 * Math.sin(t * 2), flame: 0 });
  ctx.fillStyle = 'rgba(0,0,10,.55)'; ctx.fillRect(0, H - 30, W, 30);
  csText(ctx, st >= 4 ? 'SP-1 \u2014 READY TO FLY' : 'Stage ' + (st + 1) + ' of ' + SHIP_STAGES.length + ': ' + SHIP_STAGES[st].name, 14, H - 10, 14, st >= 4 ? '#7AF0A0' : '#FFD27A', 'left', '700');
  csText(ctx, st + '/' + SHIP_STAGES.length + ' built', W - 14, H - 10, 13, '#C8D0E0', 'right', '600');
}
/* ---- the flight home, and what comes after it ---- */
function startHomeFlight(){ if (!shipUnlocked() || !shipBuilt()) return false; startCutscene(showHomecoming, false, 'home'); return true; }
function showHomecoming(){
  Save.data.homecoming = true; Save.write();
  G.state = 'shop'; G.attract = true; G.venusScreen = false; G.marsScreen = false; G.labScreen = false; HUD.classList.remove('on');
  setOverlay(
    '<div class="panel slab">' +
      '<h2 class="head">Home</h2>' +
      '<p class="sub" style="text-align:center">The Underground Giraffe City has taken her in: lanterns, long corridors, and giraffes of every spot and shade. A place with room for a long neck.</p>' +
      '<p class="sub" style="text-align:center">She is home, but the story is not over. The market is open to her now, and a lift in the hangar climbs back up to the savannah, where the grass is glittering and the creatures are not quite what they were.</p>' +
      '<div class="row" style="margin-top:18px"><button class="btn" data-a="tab-city">Visit the City</button><button class="btn ghost" data-a="menu">Back to the menu</button></div>' +
    '</div>');
}

