'use strict';
/* =============================================================================================================================
   44zzzzi-sky-art.js  --  CHAPTER 17.5, THE AIR CHASE: WHAT IT LOOKS LIKE FROM ABOVE. The town helicopter (green, with her in the cabin at the nose
   gun or in either side door), the scientists' white helicopter LAB-1 (the White Bird), the grey escort gunships and the five kinds of lab drone.
   Every machine is drawn in its own space facing +x, like every creature, so the same drawing serves the sky shooter (js/sky/44zzzzj-sky-chase.js,
   which turns them to face where they fly), the Bestiary and the menu's round window. ETYPES_SKY puts them in the Bestiary's usual slots.
   ============================================================================================================================= */
const SKY_LAB = '#5AE0C8', SKY_RED = '#FF4A3A', SKY_GLASS = '#9ED8EC';
const SKY_PAL = {
  town:  { g: '#35543A', gd: '#223A28', gl: '#4A7050', band: '#E8C24A', ink: '#14201A' },
  white: { g: '#E8ECEE', gd: '#AEB8BE', gl: '#FFFFFF', band: '#2A8A7A', ink: '#26343A' },
  grey:  { g: '#6A727A', gd: '#3E464C', gl: '#8A9298', band: '#C8402A', ink: '#1C2226' },
  greyB: { g: '#5A6268', gd: '#30383E', gl: '#7A8288', band: '#E8B83A', ink: '#14181C' }
};
/* a spinning rotor seen from above: a pale disc, a darker rim and the blades, turned by a */
function skyRotor(ctx, x, y, r, a, n, dark, noHub){
  ctx.fillStyle = dark ? 'rgba(30,36,40,.16)' : 'rgba(230,240,244,.16)'; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
  ctx.strokeStyle = dark ? 'rgba(30,36,40,.28)' : 'rgba(240,248,250,.32)'; ctx.lineWidth = Math.max(1, r * 0.06); ctx.beginPath(); ctx.arc(x, y, r * 0.96, 0, TAU); ctx.stroke();
  ctx.strokeStyle = dark ? 'rgba(24,28,32,.55)' : 'rgba(40,46,50,.5)'; ctx.lineWidth = Math.max(1.2, r * 0.09); ctx.lineCap = 'round'; ctx.beginPath();
  for (let i = 0; i < n; i++){ const b = a + i * TAU / n; ctx.moveTo(x, y); ctx.lineTo(x + Math.cos(b) * r * 0.94, y + Math.sin(b) * r * 0.94); }
  ctx.stroke(); ctx.lineCap = 'butt';
  if (!noHub) fillCircle(ctx, x, y, Math.max(1.4, r * 0.12), '#2A3034');
}
/* a helicopter from above, facing +x, its body about 2.2 r long: tail boom and tail rotor behind, stub wings, the cabin and the glass at the nose.
   o.open: the cabin roof is off (the town helicopter: she stands in it), o.doors: which doors are slid open ('left', 'right' or both), o.spin: the rotor angle,
   o.smoke: the White Bird hit hard, o.pods: rocket pods on the wings, o.noRotor: leave the main rotor off (it is drawn later, over her) */
function skyHeliTop(ctx, r, pal, o){
  o = o || {}; const L = r * 1.1, Wd = r * 0.46;
  /* the tail boom and its fin and rotor */
  ctx.fillStyle = pal.gd; ctx.beginPath(); ctx.moveTo(-L * 0.35, -Wd * 0.28); ctx.lineTo(-L * 1.55, -Wd * 0.12); ctx.lineTo(-L * 1.55, Wd * 0.12); ctx.lineTo(-L * 0.35, Wd * 0.28); ctx.closePath(); ctx.fill();
  ctx.fillStyle = pal.g; ctx.fillRect(-L * 1.5, -Wd * 0.62, L * 0.16, Wd * 1.24);
  ctx.fillStyle = pal.band; ctx.fillRect(-L * 1.1, -Wd * 0.18, L * 0.12, Wd * 0.36);
  skyRotor(ctx, -L * 1.5, Wd * 0.62, r * 0.2, (o.spin || 0) * 2.3, 2, true);
  /* stub wings, with pods */
  ctx.fillStyle = pal.gd; ctx.fillRect(-L * 0.18, -Wd * 1.55, L * 0.26, Wd * 3.1);
  if (o.pods){ for (const s of [-1, 1]){ ctx.fillStyle = '#2A3034'; tw_rr(ctx, -L * 0.26, s * Wd * 1.42 - Wd * 0.2, L * 0.46, Wd * 0.4, Wd * 0.18, '#2A3034'); fillCircle(ctx, L * 0.2, s * Wd * 1.42, Wd * 0.12, '#C8402A'); } }
  /* the body: a long rounded cabin, darker underside at the edges */
  ctx.fillStyle = pal.ink; ctx.beginPath(); ctx.ellipse(0, 0, L * 0.82 + 1.5, Wd + 1.5, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = pal.g; ctx.beginPath(); ctx.ellipse(0, 0, L * 0.82, Wd, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = pal.gl; ctx.beginPath(); ctx.ellipse(-L * 0.05, -Wd * 0.3, L * 0.62, Wd * 0.34, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = pal.band; ctx.fillRect(-L * 0.62, -Wd * 0.95, L * 0.14, Wd * 1.9);
  /* the cabin: open (her floor and the door frames) or a roof with an engine hump */
  if (o.open){
    ctx.fillStyle = '#7A6A52'; ctx.beginPath(); ctx.ellipse(-L * 0.02, 0, L * 0.44, Wd * 0.74, 0, 0, TAU); ctx.fill();
    ctx.strokeStyle = 'rgba(60,48,34,.45)'; ctx.lineWidth = 1; ctx.beginPath(); for (let k = -3; k <= 3; k++){ ctx.moveTo(-L * 0.4, k * Wd * 0.18); ctx.lineTo(L * 0.38, k * Wd * 0.18); } ctx.stroke();
    const dr = o.doors || '';
    for (const s of [-1, 1]){ const open = dr.indexOf(s < 0 ? 'left' : 'right') >= 0; ctx.fillStyle = open ? 'rgba(255,214,120,.5)' : pal.gd; ctx.fillRect(-L * 0.28, s * Wd * 0.86 - (s > 0 ? Wd * 0.16 : 0), L * 0.5, Wd * 0.16); }
  } else {
    tw_rr(ctx, -L * 0.42, -Wd * 0.34, L * 0.62, Wd * 0.68, Wd * 0.3, pal.gd);
    fillCircle(ctx, -L * 0.3, -Wd * 0.16, Wd * 0.12, '#3A4044'); fillCircle(ctx, -L * 0.3, Wd * 0.16, Wd * 0.12, '#3A4044');
  }
  /* the glass at the nose */
  ctx.fillStyle = SKY_GLASS; ctx.beginPath(); ctx.ellipse(L * 0.52, 0, L * 0.28, Wd * 0.72, 0, -1.25, 1.25); ctx.closePath(); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,.55)'; ctx.beginPath(); ctx.ellipse(L * 0.6, -Wd * 0.28, L * 0.1, Wd * 0.14, 0.4, 0, TAU); ctx.fill();
  ctx.strokeStyle = pal.ink; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(L * 0.4, 0); ctx.lineTo(L * 0.78, 0); ctx.stroke();
  if (o.gun){ ctx.fillStyle = '#2A3034'; ctx.fillRect(L * 0.72, -Wd * 0.1, L * 0.34, Wd * 0.2); fillCircle(ctx, L * 1.06, 0, Wd * 0.1, '#14181A'); }
  if (o.smoke){ ctx.fillStyle = 'rgba(30,30,34,.55)'; ctx.beginPath(); ctx.ellipse(-L * 0.25, Wd * 0.2, L * 0.22, Wd * 0.28, 0.3, 0, TAU); ctx.fill(); fillCircle(ctx, -L * 0.22, Wd * 0.22, Wd * 0.12, '#FF8A3A'); }
  if (!o.noRotor) skyRotor(ctx, -L * 0.05, 0, r * 1.25, o.spin || 0, 4, pal === SKY_PAL.white);
}
/* a small drone's arm and rotor, out from the hub at angle a */
function skyArm(ctx, a, len, rr, spin, col){
  const x = Math.cos(a) * len, y = Math.sin(a) * len;
  tw_ln(ctx, [0, 0, x, y], Math.max(2, len * 0.16), '#2A3034'); fillCircle(ctx, x, y, rr * 0.3, col);
  skyRotor(ctx, x, y, rr, spin, 2, true);
}
const SKY_DRAW = {
  sk_rotor(ctx, e, b, dk, bob, wind, d){                                        /* Rotor Drone: a lab quadcopter with a red eye lamp at the front, that rams */
    const r = e.r, sp = (e.anim || 0) * 9;
    for (let i = 0; i < 4; i++) skyArm(ctx, Math.PI / 4 + i * Math.PI / 2, r * 0.82, r * 0.48, sp + i, dk);
    fillCircle(ctx, 0, 0, r * 0.5, dk); fillCircle(ctx, 0, 0, r * 0.42, b); fillCircle(ctx, -r * 0.08, -r * 0.08, r * 0.2, tw_li(b, 0.3));
    tw_rect(ctx, -r * 0.42, -r * 0.08, r * 0.84, r * 0.16, SKY_LAB);
    fillCircle(ctx, r * 0.38, 0, r * 0.14, SKY_RED); fillCircle(ctx, r * 0.42, -r * 0.04, r * 0.05, '#FFE0D8');
  },
  sk_net(ctx, e, b, dk, bob, wind, d){                                          /* Net Drone: six rotors and a canister of folded net at the front */
    const r = e.r, sp = (e.anim || 0) * 8;
    for (let i = 0; i < 6; i++) skyArm(ctx, i * Math.PI / 3 + Math.PI / 6, r * 0.8, r * 0.36, sp + i, dk);
    fillCircle(ctx, 0, 0, r * 0.52, dk); fillCircle(ctx, 0, 0, r * 0.44, b);
    tw_rr(ctx, r * 0.1, -r * 0.3, r * 0.62, r * 0.6, r * 0.12, '#C8B87A');
    ctx.strokeStyle = 'rgba(80,60,30,.7)'; ctx.lineWidth = 1; ctx.beginPath(); for (let k = 0; k < 4; k++){ ctx.moveTo(r * (0.14 + k * 0.14), -r * 0.28); ctx.lineTo(r * (0.24 + k * 0.14), r * 0.28); ctx.moveTo(r * (0.24 + k * 0.14), -r * 0.28); ctx.lineTo(r * (0.14 + k * 0.14), r * 0.28); } ctx.stroke();
    fillCircle(ctx, -r * 0.24, 0, r * 0.1, SKY_LAB);
  },
  sk_mine(ctx, e, b, dk, bob, wind, d){                                         /* Mine Drone: a spiked ball under a little rotor, with a light that blinks faster as it gets close */
    const r = e.r;
    for (let i = 0; i < 8; i++){ const a = i * TAU / 8; tw_poly(ctx, [Math.cos(a - 0.18) * r * 0.62, Math.sin(a - 0.18) * r * 0.62, Math.cos(a) * r * 1.02, Math.sin(a) * r * 1.02, Math.cos(a + 0.18) * r * 0.62, Math.sin(a + 0.18) * r * 0.62], '#3A3A40'); }
    fillCircle(ctx, 0, 0, r * 0.7, dk); fillCircle(ctx, 0, 0, r * 0.62, b); fillCircle(ctx, -r * 0.2, -r * 0.2, r * 0.22, tw_li(b, 0.35));
    tw_rect(ctx, -r * 0.62, -r * 0.06, r * 1.24, r * 0.12, '#E8C24A');
    fillCircle(ctx, 0, 0, r * 0.2, (e.blink || 0) > 0.5 ? '#FFF0A0' : SKY_RED);
    skyRotor(ctx, 0, 0, r * 0.9, (e.anim || 0) * 10, 2, true);
  },
  sk_laser(ctx, e, b, dk, bob, wind, d){                                        /* Laser Drone: a flat wedge on two rotors with a big lens at its point */
    const r = e.r, sp = (e.anim || 0) * 9;
    skyArm(ctx, Math.PI * 0.75, r * 0.85, r * 0.42, sp, dk); skyArm(ctx, -Math.PI * 0.75, r * 0.85, r * 0.42, sp + 1, dk);
    tw_poly(ctx, [r * 0.95, 0, -r * 0.6, -r * 0.62, -r * 0.38, 0, -r * 0.6, r * 0.62], dk);
    tw_poly(ctx, [r * 0.82, 0, -r * 0.5, -r * 0.5, -r * 0.3, 0, -r * 0.5, r * 0.5], b);
    tw_ln(ctx, [-r * 0.3, 0, r * 0.5, 0], 1.4, SKY_LAB);
    fillCircle(ctx, r * 0.55, 0, r * 0.22, '#2A1414'); fillCircle(ctx, r * 0.55, 0, r * 0.15, (e.charge || 0) > 0 ? '#FFB0A0' : SKY_RED); fillCircle(ctx, r * 0.5, -r * 0.05, r * 0.05, '#FFFFFF');
  },
  sk_carrier(ctx, e, b, dk, bob, wind, d){                                      /* Carrier Drone: a flying box on four rotors with three small drones clamped in its bay */
    const r = e.r, sp = (e.anim || 0) * 7;
    for (let i = 0; i < 4; i++) skyArm(ctx, Math.PI / 4 + i * Math.PI / 2, r * 0.95, r * 0.42, sp + i, dk);
    tw_rr(ctx, -r * 0.72, -r * 0.52, r * 1.44, r * 1.04, r * 0.14, dk); tw_rr(ctx, -r * 0.66, -r * 0.46, r * 1.32, r * 0.92, r * 0.12, b);
    tw_rect(ctx, -r * 0.56, -r * 0.34, r * 1.12, r * 0.68, '#2A3034');
    for (let k = 0; k < 3; k++){ const cx = -r * 0.34 + k * r * 0.34; fillCircle(ctx, cx, 0, r * 0.13, '#8A9298'); fillCircle(ctx, cx + r * 0.05, 0, r * 0.04, SKY_RED); }
    tw_rect(ctx, -r * 0.66, -r * 0.08, r * 0.1, r * 0.16, SKY_LAB); fillCircle(ctx, r * 0.62, 0, r * 0.08, '#FFE08A');
  },
  sk_gunship(ctx, e, b, dk, bob, wind, d){                                      /* Escort Gunship: a hired grey helicopter with rocket pods */
    skyHeliTop(ctx, e.r * 0.7, SKY_PAL.grey, { spin: (e.anim || 0) * 5, pods: true, gun: true });
  },
  sk_greyescort(ctx, e, b, dk, bob, wind, d){                                   /* Grey Escort: the two big hired gunships, flying as a pair */
    skyHeliTop(ctx, e.r * 0.7, SKY_PAL.greyB, { spin: (e.anim || 0) * 5, pods: true, gun: true });
    if (e.portrait){ ctx.save(); ctx.translate(-e.r * 0.4, e.r * 1.1); ctx.scale(0.6, 0.6); skyHeliTop(ctx, e.r * 0.7, SKY_PAL.greyB, { spin: (e.anim || 0) * 5 + 1, pods: true, gun: true }); ctx.restore(); }
  },
  sk_whitebird(ctx, e, b, dk, bob, wind, d){                                    /* The White Bird: LAB-1, the scientists' white helicopter */
    skyHeliTop(ctx, e.r * 0.62, SKY_PAL.white, { spin: (e.anim || 0) * 5, gun: (e.phase | 0) >= 2, smoke: (e.phase | 0) >= 3 });
    ctx.save(); ctx.rotate(Math.PI / 2); ctx.fillStyle = '#2A8A7A'; ctx.font = 'bold ' + Math.round(e.r * 0.2) + 'px system-ui, sans-serif'; ctx.textAlign = 'center'; ctx.fillText('LAB-1', 0, e.r * 0.08); ctx.restore();
  }
};
/* in the Bestiary's boxes (e.portrait) a machine is drawn half again as big: its rotors stay inside its radius, where a creature's legs and tail reach out past it */
Object.keys(SKY_DRAW).forEach(function(k){
  ENEMY_LOOK_DRAW[k] = function(ctx, e){ if (!e.portrait) return SKY_DRAW[k].apply(this, arguments); const z = k === 'sk_greyescort' ? 1.15 : 1.5; ctx.save(); ctx.scale(z, z); SKY_DRAW[k].apply(this, arguments); ctx.restore(); };
});
/* the Bestiary's table: the drones and the escorts in the usual slots (BESTIARY_ORDER), the two bosses where the fifth and tenth waves' bosses sit */
const SKY_KIT = {
  hyena:    { look: 'sk_rotor',      color: '#9AA6B0', dark: '#2A343C', r: 22, name: 'Rotor Drone' },
  grub:     { look: 'sk_net',        color: '#A8B4A0', dark: '#3A4436', r: 25, name: 'Net Drone' },
  jackal:   { look: 'sk_mine',       color: '#5A5A64', dark: '#24242A', r: 20, name: 'Mine Drone' },
  cheetah:  { look: 'sk_laser',      color: '#C8CED4', dark: '#4A5258', r: 26, name: 'Laser Drone' },
  vulture:  { look: 'sk_carrier',    color: '#8A949C', dark: '#2E363C', r: 40, name: 'Carrier Drone' },
  rhino:    { look: 'sk_gunship',    color: '#6A727A', dark: '#3E464C', r: 50, name: 'Escort Gunship' },
  lion:     { look: 'sk_greyescort', color: '#5A6268', dark: '#30383E', r: 64, name: 'Grey Escort', title: 'Grey Escort', big: true },
  wildfire: { look: 'sk_whitebird',  color: '#E8ECEE', dark: '#AEB8BE', r: 88, name: 'The White Bird', title: 'The White Bird', big: true }
};
const ETYPES_SKY = {};
Object.keys(SKY_KIT).forEach(function(id){
  const k = SKY_KIT[id], base = ETYPES[id] || {};
  ETYPES_SKY[id] = Object.assign({}, base, { look: k.look, color: k.color, dark: k.dark, pale: '#F4F8FA', blood: '#3A3A40', r: k.r, big: !!k.big, title: k.title, sky: true, splitInto: undefined, splitCount: undefined });
  LOOK_NAMES[k.look] = k.name;
});
