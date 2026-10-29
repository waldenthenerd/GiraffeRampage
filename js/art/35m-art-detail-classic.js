'use strict';
/* Enemy art: the detail layer for Chapters 1 to 13. */
/* The creatures of the first thirteen chapters (and the Arctic animals the Domes borrow) get the same treatment as the later chapters in js/art/35l-art-detail.js: many small
   extra parts drawn on top of the original drawing. There are two hundred of them, so the parts come from ten families (fur, feathers, scales, amphibian skin, insect plates,
   fish, machines, troopers, ember and dust creatures) and are placed from a table of where each creature's body is: DT_SPEC[look or type] = [family, body centre x, half length,
   half width, head x, boss]. The table was measured from the drawings (the bounding box of each, minus head and tail). The parts are laid out by a seeded generator keyed on the
   creature's name, so a creature always looks the same, and they read only def, type, r, anim and state, so the sprite cache still keeps pictures of the ordinary ones. */
const DT_SPEC = {hyena:[0,-5.4,16.4,11.7,12.7,0],cheetah:[0,-9.9,17.8,10.5,9.7,0],rhino:[0,-4.3,25.9,20.6,24.2,0],termite:[4,-1.2,15.2,11.7,15.6,0],grub:[4,-1.7,8.1,5.1,7.2,0],vulture:[1,-4.7,15.6,9.4,12.5,0],jackal:[0,-7.0,15.9,10.4,10.5,0],warthog:[0,-5.2,20.5,15.1,17.4,0],baboon:[0,-0.3,14.0,12.9,15.1,0],honeybadger:[0,-2.9,13.8,10.9,12.3,0],mamba:[2,-2.5,15.8,6.1,14.9,0],ember:[4,-1.7,8.1,6.8,7.2,0],lion:[0,-15.7,43.0,29.8,31.6,1],matriarch:[0,-5.2,49.5,42.8,49.2,1],buffalo:[0,-7.3,42.3,34.0,39.2,1],crocodile:[2,-16.1,49.9,28.2,38.9,1],wildfire:[8,4.1,38.0,32.9,45.9,1],arcticwolf:[0,-6.5,17.5,10.5,12.7,0],lynx:[0,-3.6,14.4,10.5,12.3,0],muskox:[0,-2.5,23.5,19.8,23.4,0],arctichare:[0,0.2,13.6,11.8,15.2,0],leveret:[0,-1.1,6.9,5.6,6.5,0],gyrfalcon:[1,-6.4,16.4,10.0,11.7,0],arcticfox:[0,-8.9,16.1,9.5,8.9,0],caribou:[0,1.2,16.1,16.6,18.9,0],ermine:[0,-6.7,16.5,9.0,11.5,0],wolverine:[0,-4.4,14.2,10.6,11.2,0],lemming:[0,0.2,7.6,6.7,8.6,0],owlet:[1,-0.4,7.4,4.1,7.8,0],polarbear:[0,1.1,34.3,29.6,38.9,1],walrus:[0,2.9,45.3,39.8,52.8,1],moose:[0,2.3,37.3,35.7,43.4,1],narwhal:[5,-5.3,53.7,32.7,53.8,1],snowyowl:[1,1.5,39.3,21.7,44.8,1],nutria:[0,-8.4,17.8,10.0,11.2,0],bobcat:[0,-3.6,13.9,10.1,11.7,0],feralhog:[0,-1.5,23.0,18.1,23.8,0],bullfrog:[3,-3.7,15.6,14.0,13.5,0],tadpole:[3,-5.2,9.0,5.8,4.8,0],heron:[1,-4.8,17.6,8.9,14.6,0],otter:[0,-6.4,15.4,9.3,10.6,0],beaver:[0,-5.9,19.7,14.0,15.8,0],raccoon:[0,-7.6,17.0,10.4,11.1,0],opossum:[0,-7.8,17.5,10.0,11.4,0],cottonmouth:[2,-8.9,14.7,5.9,7.2,0],mosquito:[4,-1.5,8.0,6.5,7.3,0],panther:[0,-12.0,41.1,27.7,33.2,1],blackbear:[0,4.4,44.5,37.6,53.4,1],snapper:[2,-8.2,42.8,29.1,38.9,1],alligator:[2,-21.3,52.6,28.2,36.6,1],mosquitoqueen:[4,0.1,40.0,34.2,44.1,1],barracuda:[5,-4.7,17.3,9.3,14.4,0],sailfish:[5,-1.6,18.1,10.5,18.4,0],hammerhead:[5,-6.8,25.7,19.8,21.6,0],jellyfish:[5,-12.1,20.0,12.7,9.9,0],jellylet:[5,-3.2,8.0,6.4,5.6,0],pelican:[1,-1.8,18.9,9.9,19.0,0],dolphin:[5,-5.8,15.8,10.5,11.6,0],swordfish:[5,0.9,22.0,13.7,25.1,0],octopus:[5,-2.3,14.3,14.4,13.4,0],crab:[5,3.6,13.5,15.2,18.5,0],seasnake:[2,-9.5,14.9,5.6,6.9,0],lanternfish:[5,-1.1,7.8,6.9,7.5,0],greatwhite:[5,-7.0,38.5,31.7,35.4,1],whale:[5,-8.4,51.1,43.9,47.9,1],orca:[5,-6.4,41.9,30.6,39.6,1],giantsquid:[5,11.7,46.9,31.7,63.4,1],anglerfish:[5,-2.3,41.2,42.2,43.1,1],peccary:[0,-1.1,13.5,11.3,13.8,0],jaguar:[0,-7.9,17.4,10.8,11.3,0],tapir:[0,-1.3,22.9,20.2,23.9,0],leafcutter:[4,0.2,13.6,10.8,15.2,0],ant:[4,0.1,6.7,5.0,7.4,0],harpy:[1,-4.6,15.5,8.9,12.4,0],capybara:[0,-0.4,16.9,14.7,18.2,0],howler:[0,-4.0,15.2,11.9,12.7,0],anteater:[0,-4.5,19.3,11.1,16.7,0],dartfrog:[3,-1.0,8.2,8.7,8.1,0],froglet:[3,-0.5,7.5,7.6,7.8,0],shadowjag:[0,-13.4,41.9,31.1,32.6,1],harpyqueen:[1,1.2,46.2,25.9,52.0,1],armadillo:[2,-10.5,44.0,27.6,37.9,1],anaconda:[2,-18.7,51.3,27.3,37.8,1],venomqueen:[5,0.1,40.0,40.6,44.1,1],streetdog:[0,-5.0,15.8,11.3,12.4,0],alleycat:[0,-5.1,14.2,11.2,10.5,0],lighttank:[6,2.4,21.0,19.8,25.5,0],pigeonflock:[1,-1.1,14.2,7.0,14.6,0],pigeon:[1,-1.4,7.1,3.1,6.4,0],helicopter:[6,-8.3,17.6,11.4,11.1,0],coyote:[0,-6.4,16.1,10.3,11.4,0],ninebanded:[0,-2.1,17.8,13.9,17.5,0],grackle:[1,-3.9,15.1,10.3,12.7,0],k9:[0,-6.4,16.4,11.4,11.7,0],rat:[0,-7.9,12.1,7.1,5.4,0],drone:[6,-0.2,7.3,7.2,7.9,0],rottweiler:[0,-2.7,36.3,28.1,37.2,1],gunship:[6,-8.4,51.1,52.7,47.9,1],abrams:[6,5.3,37.3,35.1,46.4,1],sewergator:[2,-19.8,51.9,28.2,37.2,1],a10:[6,-10.4,45.5,42.6,39.6,1],quadbot:[6,-2.1,13.0,16.3,12.2,0],hoverbike:[6,-1.4,12.6,12.4,12.5,0],hovertank:[6,0.7,21.9,23.9,24.8,0],swarmcarrier:[6,1.8,12.8,12.8,15.9,0],microdrone:[6,0.6,6.0,5.9,7.3,0],reaperdrone:[6,-3.6,14.9,19.5,12.9,0],scoutrover:[6,0.7,11.2,10.4,13.0,0],crawlerbot:[6,2.5,15.4,13.9,19.5,0],quadcopter:[6,1.5,12.3,12.7,15.0,0],sentrywalker:[6,1.2,11.2,11.2,13.6,0],snakebot:[6,-10.7,14.7,7.6,5.5,0],plasmaorb:[6,-2.8,10.1,12.7,8.4,0],titanmech:[6,4.0,32.8,33.0,40.1,1],stealthbomber:[6,5.5,44.0,50.8,53.9,1],railgunner:[6,13.3,43.0,34.7,60.6,1],siegewalker:[6,4.5,39.3,44.2,47.8,1],skyfortress:[6,-3.4,41.9,46.1,42.6,1],rifleman:[7,2.1,12.1,12.2,15.4,0],jumptrooper:[7,0.5,11.3,11.4,12.9,0],riottrooper:[7,2.5,20.9,23.6,25.6,0],droppod:[6,-2.7,15.1,16.0,13.9,0],attackdrone:[6,-0.9,6.8,8.2,6.6,0],lancer:[7,16.2,22.8,12.9,41.3,0],shocktrooper:[7,7.7,15.4,11.4,24.7,0],engineer:[7,-0.5,17.0,17.4,18.1,0],medic:[7,-0.1,13.1,12.9,14.4,0],siegebreaker:[7,1.6,16.9,16.8,20.2,0],shadowop:[7,-0.3,9.6,12.7,10.3,0],breacher:[7,0.0,11.1,13.6,12.2,0],sergeant:[7,2.3,61.6,46.2,70.1,1],spotter:[6,-33.6,64.2,59.1,37.0,1],colossus:[6,8.8,48.5,48.9,62.1,1],warden:[6,-9.7,46.6,55.7,41.6,1],admiral:[6,-18.9,52.9,70.9,39.4,1],sentryturret:[6,1.2,12.5,13.6,14.9,0],bladeguard:[7,12.1,19.2,12.2,33.3,0],cinderspitter:[8,-7.0,16.4,11.5,11.1,0],flareleaper:[8,-10.4,16.9,12.0,8.2,0],obsidianbrute:[8,-10.0,32.8,26.9,26.1,0],magmaegg:[8,-2.3,15.0,15.4,14.3,0],firewisp:[8,-9.2,11.6,7.5,3.6,0],spearfiend:[8,7.0,29.9,13.5,39.9,0],cinderbrawler:[8,-6.5,14.9,13.0,9.9,0],forgetender:[8,-1.7,24.3,16.5,25.0,0],emberpriest:[8,3.9,17.3,12.3,22.9,0],pyrecrusher:[8,-3.2,24.0,20.4,23.3,0],smokewraith:[8,-11.4,16.7,13.3,6.9,0],sporeimp:[8,-5.0,10.0,8.5,6.0,0],pyrax:[8,-35.3,81.9,46.8,54.8,1],pyreseer:[8,-20.6,64.9,50.5,50.9,1],magmacolossus:[8,-6.4,41.9,41.1,39.6,1],maelstrom:[8,-9.8,46.9,46.0,41.9,1],infernoqueen:[8,-13.9,47.2,61.5,38.1,1],magmatotem:[6,4.1,12.9,11.9,18.2,0],emberblade:[8,1.8,25.1,11.8,29.4,0],cinderimp:[8,-7.7,15.9,10.0,9.8,0],magmahopper:[8,-1.7,12.4,13.0,12.0,0],slagram:[8,2.6,27.8,29.5,33.1,0],magmacocoon:[8,-1.6,14.8,15.2,14.7,0],cindergnat:[8,-4.9,9.0,9.9,5.0,0],spikecharger:[8,6.9,22.0,10.2,31.1,0],bladewhirl:[8,-3.4,13.3,13.1,11.2,0],slagslinger:[8,7.0,19.8,14.2,28.8,0],sootshaman:[8,-2.1,20.1,12.7,20.0,0],magmamaw:[8,-11.1,17.6,9.7,8.3,0],smokeserpent:[8,-23.3,21.2,6.7,0.1,0],blastbeetle:[8,-1.9,11.5,8.9,10.7,0],tyrant:[8,-45.6,61.4,48.6,21.9,1],magmamother:[8,-8.0,60.8,65.0,58.9,1],rampager:[8,14.7,56.5,37.6,76.9,1],leviathan:[8,-33.0,83.5,46.2,58.9,1],sovereign:[8,-31.2,66.3,58.3,41.8,1],infernoblade:[8,12.1,19.7,15.0,33.8,0],glim_hyena:[0,-5.4,16.4,11.8,12.7,0],glim_cheetah:[0,-9.9,17.8,10.5,9.7,0],glim_rhino:[0,-4.3,25.9,21.4,24.2,0],glim_termite:[4,-1.2,15.2,11.8,15.6,0],glim_grub:[4,-1.7,8.1,5.2,7.2,0],glim_vulture:[1,-4.7,15.6,9.6,12.5,0],glim_jackal:[0,-7.0,15.9,10.5,10.5,0],glim_warthog:[0,-5.2,20.5,15.6,17.4,0],glim_baboon:[0,-0.3,14.0,13.0,15.1,0],glim_honeybadger:[0,-2.9,13.8,11.0,12.3,0],glim_mamba:[2,-2.5,15.8,6.1,14.9,0],glim_ember:[4,-1.7,8.1,6.8,7.2,0],glim_lion:[0,-15.7,43.0,32.3,31.6,1],glim_matriarch:[0,-5.5,49.6,43.0,49.1,1],glim_buffalo:[0,-7.3,42.3,35.7,39.2,1],glim_crocodile:[2,-16.1,49.9,29.4,38.9,1],glim_wildfire:[8,0.1,40.0,34.9,44.1,1],a51_guard:[7,2.1,12.1,12.2,15.4,0],a51_jumper:[7,0.5,11.3,11.4,12.9,0],a51_riot:[7,2.5,20.9,23.6,25.6,0],a51_pod:[6,-2.7,15.1,16.0,13.9,0],a51_drone:[6,-0.9,6.8,8.2,6.6,0],a51_lancer:[7,16.2,22.8,12.9,41.3,0],a51_shock:[7,7.7,15.4,11.4,24.7,0],a51_engineer:[7,-0.5,17.0,17.4,18.1,0],a51_medic:[7,-0.1,13.1,12.9,14.4,0],a51_sledge:[7,1.6,16.9,16.8,20.2,0],a51_ghost:[7,-0.3,9.6,12.7,10.3,0],a51_demo:[7,0.0,11.1,13.6,12.2,0],a51_colonel:[7,2.3,61.6,46.2,70.1,1],a51_major:[7,-33.6,64.2,55.1,37.0,1],a51_walker:[6,8.8,48.5,48.9,62.1,1],a51_general:[7,-18.9,52.9,66.1,39.4,1],a51_turret:[6,1.2,12.5,13.6,14.9,0],a51_blade:[7,12.1,19.2,12.2,33.3,0],dust_scuttler:[9,0.1,11.3,10.4,12.6,0],dust_strider:[9,-2.2,12.7,14.1,11.7,0],dust_crusher:[9,2.6,29.3,27.2,34.8,0],dust_brood:[9,-3.3,19.8,16.7,18.5,0],dust_mite:[9,0.0,3.6,3.1,4.0,0],dust_devil:[9,-3.9,15.1,15.0,12.7,0],dust_skink:[9,-6.5,13.6,8.4,8.5,0],dust_beetle:[9,2.5,20.9,18.4,25.6,0],dust_leaper:[9,-6.7,16.5,10.6,11.5,0],dust_raker:[9,-2.1,14.4,10.0,13.8,0],dust_worm:[9,-11.4,14.3,6.0,4.4,0],dust_spore:[9,-2.4,8.6,8.6,7.1,0],dust_alpha:[9,-21.8,46.2,29.4,29.0,1],dust_matron:[9,-17.1,55.7,46.2,44.1,1],dust_titan:[9,3.7,36.6,33.6,44.0,1],mars_warden:[6,-9.7,46.6,55.7,41.6,1],mars_admiral:[6,-18.9,52.9,70.9,39.4,1],a51_warden:[6,-6,22,22,20,1],ocelot:[0,-6.2,15,10.5,11,0]};
const DT_FAMILIES = ['fur', 'bird', 'scale', 'amph', 'insect', 'fish', 'machine', 'trooper', 'inferno', 'dust'];
/* a small seeded random generator (never Math.random: the creature must look the same every frame) */
function dt_rng(key){
  let h = 2166136261; for (let i = 0; i < key.length; i++){ h ^= key.charCodeAt(i); h = Math.imul(h, 16777619); }
  return function(){ h = (h + 0x6D2B79F5) | 0; let t = Math.imul(h ^ h >>> 15, 1 | h); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
}
/* The shape of each creature is read once from its own drawing (drawn small into a scratch canvas), so parts can be placed on the creature and its true outline, not on a guessed
   ellipse. DT_M is the mask of the creature being drawn (or null: then the ellipse is used). */
const DT_MASKS = {};
let DT_M = null;
function dt_mask(key, P, e, d){
  let M = DT_MASKS[key]; if (M !== undefined) return M;
  M = null;
  try {
    const H = Math.ceil(Math.max(P[2] + Math.abs(P[1]), P[3]) * 1.8 + 16), res = H < 36 ? 3 : H < 80 ? 2 : 1, N = H * 2 * res, cv = document.createElement('canvas'); cv.width = cv.height = N;
    const c = cv.getContext('2d', { willReadFrequently: true }); c.setTransform(res, 0, 0, res, N / 2, N / 2);
    const fe = { def: d, type: e.type, r: e.r, anim: 0.6, state: 'idle', flash: 0, big: e.big, portrait: false, x: 0, y: 0, ang: 0, hp: 1, maxHp: 1, p2: false, glow: 0, phase: 1, open: 0 };
    dt_classicBody(c, fe, d.color, d.dark, 0, false, d);
    const px = c.getImageData(0, 0, N, N).data, g = new Uint8Array(N * N); for (let i = 0; i < g.length; i++) g[i] = px[i * 4 + 3] > 90 ? 1 : 0;
    M = { g: g, N: N, res: res };
  } catch (err){ M = null; }
  DT_MASKS[key] = M; return M;
}
/* is (x, y) on the creature (y measured from its middle line, not counting the bob) */
function dt_ok(x, y){ const M = DT_M; if (!M) return true; const ix = Math.round(x * M.res + M.N / 2), iy = Math.round(y * M.res + M.N / 2); return ix >= 0 && iy >= 0 && ix < M.N && iy < M.N && M.g[iy * M.N + ix] === 1; }
/* a point on the creature (inside the body ellipse stretched by f when there is a mask) */
function dt_in(R, P, bob, f){
  for (let t = 0; t < 12; t++){ const a = R() * TAU, r = Math.sqrt(R()) * f * (DT_M ? 1.3 : 1), x = P[1] + Math.cos(a) * r * P[2], y = Math.sin(a) * r * P[3]; if (dt_ok(x, y)) return [x, bob + y]; }
  const a = R() * TAU, r = Math.sqrt(R()) * f; return [P[1] + Math.cos(a) * r * P[2], bob + Math.sin(a) * r * P[3]];
}
/* a point on the creature close to its edge: for bolts and rivets */
function dt_edge(R, P, bob, k){
  for (let t = 0; t < 24; t++){ const a = R() * TAU, r = (0.7 + R() * 0.6), x = P[1] + Math.cos(a) * r * P[2], y = Math.sin(a) * r * P[3]; if (dt_ok(x, y) && !(dt_ok(x + 2.6 * k, y) && dt_ok(x - 2.6 * k, y) && dt_ok(x, y + 2.6 * k) && dt_ok(x, y - 2.6 * k))) return [x, bob + y]; }
  return dt_in(R, P, bob, 0.9);
}
/* half the body's width at x: the real outline when there is a mask */
function dt_hw(P, x){
  const u = (x - P[1]) / P[2], el = u * u >= 1 ? 0 : P[3] * Math.sqrt(1 - u * u);
  if (!DT_M) return el;
  let y = 0; while (y < P[3] * 1.7 && dt_ok(x, y + 0.5)) y += 0.5;
  return y < P[3] * 0.2 ? el : y;
}
function dt_str(ctx, x0, y0, x1, y1, w, c, a){ ctx.globalAlpha = a; tw_ln(ctx, [x0, y0, x1, y1], w, c); ctx.globalAlpha = 1; }

/* a stroke that stops where it would leave the creature */
function dt_strM(ctx, x0, y0, x1, y1, bob, w, c, a){
  if (!DT_M){ dt_str(ctx, x0, y0, x1, y1, w, c, a); return; }
  let ex = x0, ey = y0; for (let i = 1; i <= 6; i++){ const u = i / 6, x = x0 + (x1 - x0) * u, y = y0 + (y1 - y0) * u; if (!dt_ok(x, y - bob)) break; ex = x; ey = y; }
  if (ex !== x0 || ey !== y0) dt_str(ctx, x0, y0, ex, ey, w, c, a);
}
const DT_GEN = {
  fur(ctx, e, b, dk, bob, P, R, k, big){
    const cx = P[1], L = P[2], W = P[3], hi = tw_li(b, 0.35), lo = tw_sh(b, 0.3);
    const n = Math.max(5, Math.round(L / 2.6));
    for (let i = 0; i < n; i++){ const x = cx - L * 0.92 + i * (1.84 * L) / (n - 1), ew = dt_hw(P, x); for (const sd of [-1, 1]){ ctx.globalAlpha = 0.75; lkTRI(ctx, x - 0.8 * k, bob + sd * (ew - 0.4 * k), x + 0.3 * k, bob + sd * (ew + 1 * k), x + 0.9 * k, bob + sd * (ew - 0.5 * k), i % 3 ? hi : lo); ctx.globalAlpha = 1; } }
    const m = Math.min(90, Math.round(L * W / 12));
    for (let i = 0; i < m; i++){ const p = dt_in(R, P, bob, 0.86), an = Math.PI + (R() - 0.5) * 0.9 * (p[1] > bob ? 1 : -1) * 0; dt_str(ctx, p[0], p[1], p[0] - Math.cos(0.3 + R() * 0.5) * 2.4 * k, p[1] + Math.sign(p[1] - bob || 1) * R() * 1.4 * k, 0.45 * k, i % 2 ? lo : hi, 0.55); }
    ctx.strokeStyle = lo; ctx.lineWidth = 0.55 * k; ctx.globalAlpha = 0.5;                                              /* shoulder and haunch contours */
    ctx.beginPath(); ctx.arc(cx + L * 0.5, bob, W * 0.8, 1.9, 4.38); ctx.stroke(); ctx.beginPath(); ctx.arc(cx - L * 0.55, bob, W * 0.85, -1.2, 1.2); ctx.stroke(); ctx.globalAlpha = 1;
    ctx.globalAlpha = 0.35; for (let i = 0; i < Math.max(3, Math.round(L / 3.2)); i++) lkOV(ctx, cx - L * 0.8 + i * 3.2 * k * 0.9, bob, 0.8 * k, 0.55 * k, dk, 0); ctx.globalAlpha = 1;
    for (const [px, sx] of [[cx + L * 0.5, 1], [cx - L * 0.55, -1]]) for (const sd of [-1, 1]) dt_toes(ctx, px + 2.6 * k, bob + sd * W * 1.0, sd * 0.35, 3, 2.2 * k, 0.8 * k, tw_sh(dk, 0.2));        /* toes */
    const tip = P[4] + L * 0.45;
    for (const sd of [-1, 1]) for (let i = 0; i < 3; i++) dt_str(ctx, tip - 1.4 * k, bob + sd * (0.6 + i * 0.5) * k, tip + 3.6 * k, bob + sd * (2.2 + i * 1.6) * k, 0.3 * k, tw_li(b, 0.7), 0.8);   /* whiskers */
    if (big) for (let i = 0; i < 6; i++){ const p = dt_in(R, P, bob, 0.7); fillCircle(ctx, p[0], p[1], 1.1 * k, tw_sh(b, 0.18)); fillCircle(ctx, p[0] - 0.3 * k, p[1] - 0.3 * k, 0.45 * k, tw_li(b, 0.35)); }
  },
  bird(ctx, e, b, dk, bob, P, R, k, big){
    const cx = P[1], L = P[2], W = P[3], Wf = Math.max(W, W / 0.38 * 0.85), hi = tw_li(b, 0.4), lo = tw_sh(b, 0.35), a = e.anim;
    for (const sd of [-1, 1]) for (let i = 0; i < 7; i++){ const x = cx + L * 0.6 - i * L * 0.32, root = W * 0.9, tipY = root + (Wf - root) * (0.55 + 0.45 * (i % 3) / 2) + Math.sin(a + i) * 0.4 * k;
      dt_strM(ctx, x, bob + sd * root * 0.6, x - 2.6 * k, bob + sd * tipY, bob, 0.7 * k, i % 2 ? lo : hi, 0.7); dt_strM(ctx, x - 0.9 * k, bob + sd * root * 0.6, x - 3.4 * k, bob + sd * (tipY - 0.6 * k), bob, 0.45 * k, lo, 0.4); }
    for (let r = 0; r < 4; r++) for (let c = 0; c < Math.round(L / 2.4); c++){ const x = cx - L * 0.7 + c * 2.4 * k + (r % 2) * 1.2 * k, y = bob + (r - 1.5) * W * 0.4; if (dt_hw(P, x) < Math.abs(y - bob)) continue; ctx.strokeStyle = lo; ctx.globalAlpha = 0.45; ctx.lineWidth = 0.4 * k; ctx.beginPath(); ctx.moveTo(x, y - 0.9 * k); ctx.lineTo(x + 0.8 * k, y); ctx.lineTo(x, y + 0.9 * k); ctx.stroke(); ctx.globalAlpha = 1; }
    for (const sd of [-1, 1]) dt_toes(ctx, cx - L * 0.9, bob + sd * W * 0.45, Math.PI, 3, 2.6 * k, 0.8 * k, '#4A3A22');
    for (let i = 0; i < 4; i++) dt_str(ctx, P[4] - 2 * k, bob + (i - 1.5) * 0.8 * k, P[4] - 5 * k - i * 0.6 * k, bob + (i - 1.5) * 1.4 * k, 0.5 * k, hi, 0.7);
  },
  scale(ctx, e, b, dk, bob, P, R, k, big){
    const cx = P[1], L = P[2], W = P[3], lo = tw_sh(b, 0.38), hi = tw_li(b, 0.3), snake = L / W > 2.4;
    const step = 2.5 * k, rows = Math.max(2, Math.round(W / (step * 0.55)));
    for (let r = -rows + 1; r < rows; r++) for (let x = cx - L * 0.95 + ((r & 1) ? step * 0.5 : 0); x < cx + L * 0.8; x += step){ const y = bob + r * (W / rows); if (Math.abs(y - bob) > dt_hw(P, x) * 0.9) continue;
      ctx.strokeStyle = lo; ctx.globalAlpha = 0.55; ctx.lineWidth = 0.45 * k; ctx.beginPath(); ctx.moveTo(x - 0.7 * k, y - 0.8 * k); ctx.lineTo(x + 0.7 * k, y); ctx.lineTo(x - 0.7 * k, y + 0.8 * k); ctx.stroke(); ctx.globalAlpha = 1; }
    for (let x = cx - L * 0.9; x < cx + L * 0.8; x += 3 * k) lkTRI(ctx, x, bob - 0.9 * k, x + 1.6 * k, bob, x, bob + 0.9 * k, hi);                                    /* a ridge down the back */
    if (snake) for (let x = cx - L * 0.8; x < cx + L * 0.7; x += 2.4 * k){ const hw = dt_hw(P, x); dt_str(ctx, x, bob - hw * 0.85, x, bob + hw * 0.85, 0.4 * k, lo, 0.3); }
    else for (const [px, sx] of [[cx + L * 0.5, 1], [cx - L * 0.5, -1]]) for (const sd of [-1, 1]) dt_toes(ctx, px + 2 * k, bob + sd * W * 1.12, sd * 0.4, 3, 2.6 * k, 1 * k, tw_sh(dk, 0.1));
    const eyeY = 1.8 * k; for (const sd of [-1, 1]) dt_str(ctx, P[4] - 1 * k, bob + sd * (eyeY + 1.2 * k), P[4] + 3 * k, bob + sd * (eyeY + 0.4 * k), 0.5 * k, lo, 0.8);
  },
  amph(ctx, e, b, dk, bob, P, R, k, big){
    const cx = P[1], L = P[2], W = P[3], hi = tw_li(b, 0.35), lo = tw_sh(b, 0.35);
    for (let i = 0; i < Math.min(26, Math.round(L * W / 8)); i++){ const p = dt_in(R, P, bob, 0.85), r = (0.5 + R() * 0.7) * k; fillCircle(ctx, p[0], p[1], r * 1.25, lo); fillCircle(ctx, p[0], p[1], r, i % 3 ? hi : tw_li(b, 0.15)); fillCircle(ctx, p[0] - r * 0.3, p[1] - r * 0.3, r * 0.3, '#FFFFFF'); }
    for (const sd of [-1, 1]) dt_str(ctx, cx - L * 0.7, bob + sd * W * 0.3, cx + L * 0.6, bob + sd * W * 0.38, 0.5 * k, lo, 0.5);
    for (const [px] of [[cx + L * 0.5], [cx - L * 0.55]]) for (const sd of [-1, 1]){ dt_toes(ctx, px + 2 * k, bob + sd * W * 1.05, sd * 0.5, 4, 3 * k, 0.9 * k, lo); for (let t = 0; t < 4; t++) fillCircle(ctx, px + 2 * k + Math.cos(sd * 0.5 + (t - 1.5) * 0.5) * 3 * k, bob + sd * W * 1.05 + Math.sin(sd * 0.5 + (t - 1.5) * 0.5) * 3 * k, 0.55 * k, hi); }
  },
  insect(ctx, e, b, dk, bob, P, R, k, big){
    const cx = P[1], L = P[2], W = P[3], lo = tw_sh(b, 0.4), hi = tw_li(b, 0.45), a = e.anim;
    const segs = Math.max(3, Math.round(L / 2.8));
    for (let i = 1; i < segs; i++){ const x = cx - L + i * (2 * L) / segs, hw = dt_hw(P, x); ctx.strokeStyle = lo; ctx.lineWidth = 0.55 * k; ctx.globalAlpha = 0.6; ctx.beginPath(); ctx.moveTo(x, bob - hw * 0.95); ctx.quadraticCurveTo(x + 1.2 * k, bob, x, bob + hw * 0.95); ctx.stroke(); ctx.globalAlpha = 1; }
    ctx.strokeStyle = hi; ctx.lineWidth = 0.6 * k; ctx.globalAlpha = 0.7; ctx.beginPath(); ctx.moveTo(cx - L * 0.8, bob - W * 0.45); ctx.quadraticCurveTo(cx, bob - W * 0.7, cx + L * 0.7, bob - W * 0.35); ctx.stroke(); ctx.globalAlpha = 1;
    for (let i = 0; i < 7; i++){ const p = dt_in(R, P, bob, 0.8); fillCircle(ctx, p[0], p[1], (0.4 + R() * 0.4) * k, lo); }
    for (let i = 0; i < 3; i++) for (const sd of [-1, 1]){ const x = cx + (i - 1) * L * 0.6, y = bob + sd * (dt_hw(P, x) + 0.6 * k); fillCircle(ctx, x, y, 0.9 * k, tw_sh(dk, 0.1)); fillCircle(ctx, x, y, 0.4 * k, hi); }
    for (const sd of [-1, 1]){ const wv = Math.sin(a * 2 + sd) * 0.5 * k, ax = P[4] + 1.5 * k, ay = bob + sd * 1.2 * k; dt_str(ctx, ax, ay, ax + 4 * k, ay + sd * (2.4 * k + wv), 0.45 * k, dk, 1); fillCircle(ctx, ax + 4 * k, ay + sd * (2.4 * k + wv), 0.6 * k, hi); }
  },
  fish(ctx, e, b, dk, bob, P, R, k, big){
    const cx = P[1], L = P[2], W = P[3], lo = tw_sh(b, 0.35), hi = tw_li(b, 0.4), a = e.anim;
    const step = 2.8 * k, rows = Math.max(2, Math.round(W / (step * 0.6)));
    for (let r = -rows + 1; r < rows; r++) for (let x = cx - L * 0.9 + ((r & 1) ? step * 0.5 : 0); x < cx + L * 0.7; x += step){ const y = bob + r * (W / rows); if (Math.abs(y - bob) > dt_hw(P, x) * 0.88) continue; ctx.strokeStyle = hi; ctx.globalAlpha = 0.4; ctx.lineWidth = 0.4 * k; ctx.beginPath(); ctx.arc(x, y, 1 * k, 2.2, 4.1); ctx.stroke(); ctx.globalAlpha = 1; }
    for (let x = cx - L * 0.7; x < cx + L * 0.5; x += 2.6 * k){ const hw = dt_hw(P, x); for (const sd of [-1, 1]) dt_str(ctx, x, bob + sd * hw, x - 1.2 * k, bob + sd * (hw + 2.2 * k), 0.4 * k, lo, 0.7); }                       /* fin rays */
    for (let i = 0; i < 3; i++){ ctx.strokeStyle = lo; ctx.lineWidth = 0.55 * k; ctx.globalAlpha = 0.65; ctx.beginPath(); ctx.arc(cx + L * 0.55 - i * 1.6 * k, bob, W * 0.6, -0.9, 0.9); ctx.stroke(); ctx.globalAlpha = 1; }                    /* gills */
    for (let x = cx - L * 0.8; x < cx + L * 0.4; x += 2 * k) fillCircle(ctx, x, bob, 0.35 * k, hi);                                          /* the lateral line */
    for (let i = 0; i < 3; i++){ const ph = (a / TAU + i / 3) % 1; ctx.globalAlpha = 0.7 * (1 - ph); ctx.strokeStyle = '#DFF8FF'; ctx.lineWidth = 0.4 * k; ctx.beginPath(); ctx.arc(P[4] + 2 * k + ph * 3 * k, bob + (i - 1) * 2 * k - ph * 4 * k, (0.7 + ph * 0.5) * k, 0, TAU); ctx.stroke(); } ctx.globalAlpha = 1;
  },
  machine(ctx, e, b, dk, bob, P, R, k, big){
    const lo = tw_sh(b, 0.4), hi = tw_li(b, 0.4), a = e.anim, area = P[2] * P[3];
    for (let i = 0; i < Math.min(16, 5 + Math.round(area / 40)); i++){ const p = dt_edge(R, P, bob, k); dt_bolt(ctx, p[0], p[1], 0.6 * k, '#C8CCD6'); }
    for (let i = 0; i < 4; i++){ const p = dt_in(R, P, bob, 0.8), q = [p[0] + (R() - 0.3) * P[2] * 0.9, p[1] + (R() - 0.5) * P[3] * 0.5]; if (dt_ok(q[0], q[1] - bob) && dt_ok((p[0] + q[0]) / 2, (p[1] + q[1]) / 2 - bob)) dt_str(ctx, p[0], p[1], q[0], q[1], 0.5 * k, lo, 0.7); }
    for (let i = 0; i < 3; i++){ const p = dt_in(R, P, bob, 0.75); if (dt_ok(p[0] + 3 * k, p[1] - bob) && dt_ok(p[0] - 3 * k, p[1] - bob)){ ctx.strokeStyle = lo; ctx.lineWidth = 0.5 * k; ctx.globalAlpha = 0.8; ctx.strokeRect(p[0] - 2.4 * k, p[1] - 1.6 * k, 4.8 * k, 3.2 * k); ctx.globalAlpha = 1; tw_rect(ctx, p[0] - 1.6 * k, p[1] - 0.2 * k, 3.2 * k, 0.4 * k, lo); } }
    for (let i = 0; i < 2; i++){ const p = dt_in(R, P, bob, 0.7); if (dt_ok(p[0] + 2 * k, p[1] - bob) && dt_ok(p[0], p[1] - bob + 2 * k)) dt_vent(ctx, p[0] - 1.6 * k, p[1] - 1.2 * k, 3.2 * k, 2.4 * k, 4, lo, false); }
    for (let i = 0; i < 3; i++){ const p = dt_in(R, P, bob, 0.7); dt_led(ctx, p[0], p[1], 0.5 * k, i === 0 ? '#6AFFB0' : i === 1 ? '#FFB84A' : '#FF5A4A', Math.sin(a * 2 + i * 2) > -0.4); }
    if (!big){ const w = [dt_in(R, P, bob, 0.7), dt_in(R, P, bob, 0.7), dt_in(R, P, bob, 0.7), dt_in(R, P, bob, 0.7)]; if (w.every(function(p, i){ return i === 0 || dt_ok((p[0] + w[i - 1][0]) / 2, (p[1] + w[i - 1][1]) / 2 - bob); })) dt_wire(ctx, [w[0][0], w[0][1], w[1][0], w[1][1], w[2][0], w[2][1], w[3][0], w[3][1]], 0.3 * k, '#B8803A'); }
    if (big) for (let i = 0; i < 8; i++){ const p = dt_in(R, P, bob, 0.8); tw_ln(ctx, [p[0], p[1], p[0] + 2.6 * k, p[1] + (R() - 0.5) * 2 * k], 0.4 * k, 'rgba(0,0,0,.3)'); }
  },
  trooper(ctx, e, b, dk, bob, P, R, k, big){
    const cx = P[1], L = P[2], W = P[3], lo = tw_sh(b, 0.4), hi = tw_li(b, 0.35), a = e.anim;
    for (const sd of [-1, 1]){ lkOV(ctx, cx + L * 0.1, bob + sd * W * 0.85, L * 0.32, W * 0.2, hi); dt_bolt(ctx, cx + L * 0.1, bob + sd * W * 0.85, 0.5 * k, '#C8CCD6'); }
    for (const sd of [-1, 1]) tw_ln(ctx, [cx + L * 0.35, bob + sd * W * 0.7, cx - L * 0.35, bob - sd * W * 0.2], 0.9 * k, lo);
    tw_rect(ctx, cx - L * 0.5, bob - W * 0.8, 1.4 * k, W * 1.6, lo); tw_rect(ctx, cx - L * 0.5 - 0.4 * k, bob - 0.8 * k, 2.2 * k, 1.6 * k, '#C8A850');
    for (const sd of [-1, 1]){ tw_rr(ctx, cx - L * 0.8, bob + sd * W * 0.5 - 1.2 * k, 2.6 * k, 2.4 * k, 0.5 * k, lo); tw_rr(ctx, cx - L * 0.2, bob + sd * W * 0.55 - 1.2 * k, 2.2 * k, 2.4 * k, 0.5 * k, lo); }
    for (let i = 0; i < 6; i++){ const p = dt_in(R, P, bob, 0.8); ctx.globalAlpha = 0.4; tw_rect(ctx, p[0] - 1.1 * k, p[1] - 0.8 * k, 2.2 * k, 1.6 * k, tw_mix(b, dk, 0.6)); ctx.globalAlpha = 1; }
    ctx.strokeStyle = lo; ctx.lineWidth = 0.7 * k; ctx.beginPath(); ctx.arc(P[4] - 1.5 * k, bob, W * 0.55, -1.2, 1.2); ctx.stroke();
    dt_led(ctx, cx + L * 0.55, bob - W * 0.45, 0.5 * k, '#FF5A4A', Math.sin(a * 2) > 0);
  },
  inferno(ctx, e, b, dk, bob, P, R, k, big){
    const cx = P[1], L = P[2], W = P[3], a = e.anim;
    for (let c = 0; c < 2; c++){ let p = dt_in(R, P, bob, 0.7); const pts = [p[0], p[1]]; for (let i = 0; i < 4; i++){ const nx = p[0] + (1.4 + R() * 1.6) * k, ny = p[1] + (R() - 0.5) * 3 * k; if (!dt_ok(nx, ny - bob)) break; pts.push(nx, ny); p = [nx, ny]; } if (pts.length > 3){ ctx.globalAlpha = 0.6; tw_ln(ctx, pts, 0.45 * k, '#FFB84A'); ctx.globalAlpha = 1; fillCircle(ctx, pts[pts.length - 2], pts[pts.length - 1], 0.5 * k, '#FFE08A'); } }
    for (let i = 0; i < Math.min(30, Math.round(L * W / 10)); i++){ const p = dt_in(R, P, bob, 0.9), fl = 0.5 + 0.5 * Math.sin(a * 2 + i * 1.7); ctx.globalAlpha = 0.35 + 0.5 * fl; fillCircle(ctx, p[0], p[1], (0.35 + R() * 0.4) * k, i % 3 ? '#FFB84A' : '#FF6A2A'); } ctx.globalAlpha = 1;
    for (let i = 0; i < 6; i++){ const p = dt_in(R, P, bob, 0.8); fillCircle(ctx, p[0], p[1], 0.5 * k, 'rgba(20,10,8,.4)'); }
    for (let x = cx - L * 0.8; x < cx + L * 0.6; x += 3.2 * k){ const hw = dt_hw(P, x); for (const sd of [-1, 1]) lkTRI(ctx, x, bob + sd * hw, x - 1.4 * k, bob + sd * (hw + 2.4 * k), x + 1 * k, bob + sd * hw, tw_sh(b, 0.5)); }
    for (let i = 0; i < 3; i++){ const ph = (a / TAU + i / 3) % 1; ctx.globalAlpha = 0.4 * (1 - ph); fillCircle(ctx, cx - L * 0.4 - ph * 3 * k, bob + (i - 1) * W * 0.4 - ph * 3 * k, (1 + ph * 1.6) * k, '#5A5058'); } ctx.globalAlpha = 1;
  },
  dust(ctx, e, b, dk, bob, P, R, k, big){
    const cx = P[1], L = P[2], W = P[3], lo = tw_sh(b, 0.4), hi = tw_li(b, 0.45), a = e.anim;
    for (let i = 0; i < Math.min(22, Math.round(L * W / 10)); i++){ const p = dt_in(R, P, bob, 0.85), r = (1 + R()) * k; ctx.strokeStyle = lo; ctx.globalAlpha = 0.5; ctx.lineWidth = 0.4 * k; ctx.beginPath(); for (let j = 0; j < 6; j++){ const an = j * TAU / 6; j ? ctx.lineTo(p[0] + Math.cos(an) * r, p[1] + Math.sin(an) * r) : ctx.moveTo(p[0] + r, p[1]); } ctx.closePath(); ctx.stroke(); ctx.globalAlpha = 1; }
    for (let i = 0; i < 4; i++){ const p = dt_in(R, P, bob, 0.7); dt_bolt(ctx, p[0], p[1], 0.6 * k, hi); csGlow(ctx, p[0], p[1], 3 * k, hi, 0.2 + 0.15 * Math.sin(a * 2 + i)); }
    for (let i = 0; i < 14; i++){ const p = dt_in(R, P, bob, 1.05); fillCircle(ctx, p[0], p[1], 0.3 * k, hi); }
    for (let x = cx - L * 0.8; x < cx + L * 0.6; x += 3.4 * k){ const hw = dt_hw(P, x); for (const sd of [-1, 1]) lkTRI(ctx, x, bob + sd * hw, x + 0.8 * k, bob + sd * (hw + 1.8 * k), x + 1.6 * k, bob + sd * hw, lo); }
    for (const sd of [-1, 1]) dt_str(ctx, P[4] + 1 * k, bob + sd * 1.4 * k, P[4] + 5 * k, bob + sd * 3.2 * k, 0.4 * k, hi, 0.9);
  }
};
function dt_classic(ctx, e, b, dk, bob, d, key){
  const P = DT_SPEC[key]; if (!P) return;
  const k = Math.max(0.55, Math.min(2.4, Math.sqrt(P[2] * P[3]) / 11)), R = dt_rng(key);
  DT_M = dt_mask(key, P, e, d);
  DT_GEN[DT_FAMILIES[P[0]]](ctx, e, b, dk, bob, P, R, k, P[5] === 1);
  DT_M = null;
}
const dt_classicBody = drawEnemyBody;
drawEnemyBody = function(ctx, e, body, dk, bob, wind, d){
  dt_classicBody.apply(this, arguments);
  const key = d.look || e.type; if (DT_SPEC[key] && !(d.look && /^(tw_|sg_|dome_)/.test(d.look))) dt_classic(ctx, e, body, dk, bob, d, key);
};
