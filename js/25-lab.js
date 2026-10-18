'use strict';
/* The Giraffe Lab (Mutation Vial). */
/* ========================= THE GIRAFFE LAB (the Mutation Vial) ========================= */
/* After Chapter 13 the giraffe builds a lab in the Underground Giraffe City. Every Mutation Vial can be used exactly once: it gives one random mutation out of
   fifteen, permanent, and the same mutation can never come up twice. The first vial is the one from Area 51; more are still to be found. Mutations come in
   three tiers, and the better ones are rarer: Rare (60%), Epic (30%) and Legendary (10%) while any of that tier is left. */
const MUT_TIERS = { 1: { name: 'Rare', col: '#6FB8FF', w: 60 }, 2: { name: 'Epic', col: '#C07AFF', w: 30 }, 3: { name: 'Legendary', col: '#FFC84A', w: 10 } };
const MUTATIONS = [
  { id: 'm_neck',    tier: 1, icon: '@t-x-height', name: 'Longer Neck',        desc: 'Kick range +30%.',                                         apply(s){ s.kickRangeMul += 0.3; } },
  { id: 'm_hooves',  tier: 1, icon: '@t-run', name: 'Quick Hooves',       desc: 'Move 14% faster.',                                         apply(s){ s.speedMul += 0.14; } },
  { id: 'm_eyes',    tier: 1, icon: '@t-eye', name: 'Sharp Eyes',         desc: 'Critical chance +10% and critical hits hit 30% harder.',   apply(s){ s.crit += 0.1; s.critMul += 0.3; } },
  { id: 'm_mind',    tier: 1, icon: '@t-brain', name: 'Fast Learner',       desc: 'Experience +25%.',                                         apply(s){ s.xpMul += 0.25; } },
  { id: 'm_gut',     tier: 1, icon: '@t-x-greedy', name: 'Greedy Gut',         desc: 'Gold +25% and pickup range +35%.',                         apply(s){ s.goldMul += 0.25; s.pickupMul += 0.35; } },
  { id: 'm_luck',    tier: 1, icon: '@t-x-bloodclover', name: 'Lucky Blood',        desc: 'Drops are 40% more common.',                               apply(s){ s.dropMul += 0.4; } },
  { id: 'm_hide',    tier: 2, icon: '@t-x-shield', name: 'Thick Hide',         desc: 'Damage taken \u221215%.',                                  apply(s){ s.dr += 0.15; } },
  { id: 'm_iron',    tier: 2, icon: '@t-x-hoof', name: 'Iron Hooves',        desc: 'Kick damage +30%.',                                        apply(s){ s.kickDmgMul += 0.3; } },
  { id: 'm_stomach', tier: 2, icon: '@t-x-stomach', name: 'Second Stomach',     desc: 'Max health +70.',                                          apply(s){ s.maxHpAdd += 70; } },
  { id: 'm_cells',   tier: 2, icon: '@t-x-cells', name: 'Regenerating Cells', desc: 'Regenerate 3 health per second.',                          apply(s){ s.regen += 3; } },
  { id: 'm_gland',   tier: 2, icon: '@t-x-adrenal',    name: 'Adrenal Glands',     desc: 'Invulnerable 40% longer after a hit.',                     apply(s){ s.invulnMul += 0.4; } },
  { id: 'm_bone',    tier: 2, icon: '@t-x-bone', name: 'Bone Plating',       desc: 'Kick knockback +45% and damage taken \u22124%.',            apply(s){ s.kickKb *= 1.45; s.dr += 0.04; } },
  { id: 'm_heart',   tier: 3, icon: '@t-heartbeat', name: 'Stampede Heart',     desc: 'Everything you own fires 15% faster.',                     apply(s){ s.hasteMul *= 0.85; } },
  { id: 'm_ants',    tier: 3, icon: '@t-x-pheromone', name: 'Pheromones',         desc: 'Your ants have 40% more health and hit 40% harder.',       apply(s){} },
  { id: 'm_res',     tier: 3, icon: '@t-test-pipe', name: 'Vial Resonance',     desc: 'All damage +20%.',                                         apply(s){ s.allDmgMul += 0.2; } }
];
const MUT_BY_ID = {}; MUTATIONS.forEach(m => { MUT_BY_ID[m.id] = m; });
function mutHas(id){ return !!(Save.data && Save.data.mutations && Save.data.mutations[id]); }
function mutCount(){ return MUTATIONS.filter(m => mutHas(m.id)).length; }
function applyMutations(s){ for (let i = 0; i < MUTATIONS.length; i++) if (mutHas(MUTATIONS[i].id)) MUTATIONS[i].apply(s); }
function labUnlocked(){ return !!(Save.data && Save.data.chapter13Complete); }
/* the vial from Area 51 is the first one, and it is put in her hands the first time the lab exists */
function grantFirstVial(){ const d = Save.data; if (d && !d.vialGiven && (d.mutUses | 0) > 0){ d.vialGiven = true; Save.write(); } if (d && d.chapter13Complete && !d.vialGiven){ d.vialGiven = true; d.vials = (d.vials | 0) + 1; Save.write(); } }
function vialCount(){ grantFirstVial(); return Save.data.vials | 0; }
function useVial(){
  if (!labUnlocked() || vialCount() < 1) return null;
  const left = MUTATIONS.filter(m => !mutHas(m.id));
  if (!left.length) return null;
  const tiers = [1, 2, 3].filter(t => left.some(m => m.tier === t));
  let r = Math.random() * tiers.reduce((s, t) => s + MUT_TIERS[t].w, 0), tier = tiers[0];
  for (const t of tiers){ r -= MUT_TIERS[t].w; if (r <= 0){ tier = t; break; } }
  const pool = left.filter(m => m.tier === tier), m = pool[Math.floor(Math.random() * pool.length)];
  Save.data.vials = (Save.data.vials | 0) - 1;
  if (!Save.data.mutations) Save.data.mutations = {};
  Save.data.mutations[m.id] = 1; Save.data.mutUses = (Save.data.mutUses | 0) + 1;
  Save.write(); recalcStats();
  return m;
}
let labLast = null;
function labButtonHTML(){
  if (!labUnlocked()) return '';
  return '<button class="btn ghost" data-a="lab">Giraffe lab<small>' + mutCount() + ' of ' + MUTATIONS.length + ' mutations \u00B7 ' + vialCount() + (vialCount() === 1 ? ' vial' : ' vials') + '</small></button>';
}
function drawLabView(cv){
  if (!cv || !cv.getContext) return;
  const ctx = cv.getContext('2d'); if (!ctx) return;
  const W = cv.width, H = cv.height, t = 1.7, n = vialCount();
  const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#1E1A22'); g.addColorStop(1, '#0E0C12'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  for (let k = 0; k < 18; k++){ ctx.fillStyle = 'rgba(255,230,160,.5)'; ctx.fillRect(csR(k + 15000) * W, csR(k + 15050) * H * 0.5, 2, 2); }
  ctx.fillStyle = '#4A3A2A'; ctx.fillRect(W * 0.2, H * 0.74, W * 0.6, 14); ctx.fillRect(W * 0.24, H * 0.74, 10, H * 0.26); ctx.fillRect(W * 0.76 - 10, H * 0.74, 10, H * 0.26);
  if (n > 0){ ctx.save(); ctx.translate(W * 0.5, H * 0.46); marsVial(ctx, 0, 0, 0.62, t, labLast ? 1 : 0.8); ctx.restore(); }
  else { ctx.fillStyle = 'rgba(243,234,216,.55)'; ctx.font = '700 15px sans-serif'; ctx.textAlign = 'center'; ctx.fillText('The bench is empty. No vials left.', W * 0.5, H * 0.46); ctx.textAlign = 'left'; }
  csGiraffe(ctx, { x: W * 0.12, y: H * 0.98, s: 0.46, face: 1, neck: 0.4, head: 0.1, bare: true, boots: false });
  for (let k = 0; k < mutCount(); k++) fillCircle(ctx, W * 0.82 + (k % 5) * 14, H * 0.2 + Math.floor(k / 5) * 14, 5, MUT_TIERS[MUTATIONS.filter(m => mutHas(m.id))[k].tier].col);
}
function showLab(){
  if (!labUnlocked()){ showMenu(); return; }
  G.state = 'shop'; G.attract = true; G.labScreen = true; G.marsScreen = false; G.venusScreen = false; HUD.classList.remove('on');
  const d = Save.data, left = MUTATIONS.filter(m => !mutHas(m.id)).length, vials = vialCount(), can = left > 0 && vials > 0;
  let rows = '';
  for (let t = 3; t >= 1; t--){
    rows += '<div class="sub" style="margin:14px 0 2px;font-weight:700;color:' + MUT_TIERS[t].col + '">' + MUT_TIERS[t].name + ' \u2014 ' + MUTATIONS.filter(m => m.tier === t && mutHas(m.id)).length + ' of ' + MUTATIONS.filter(m => m.tier === t).length + '</div>';
    MUTATIONS.filter(m => m.tier === t).forEach(m => {
      const has = mutHas(m.id);
      rows += '<div class="shoprow"' + (has ? '' : ' style="opacity:.5"') + '><div class="ic">' + (has ? ico(m.icon, MUT_TIERS[t].col) : ico('@t-x-help')) + '</div><div class="txt"><div class="nm" style="' + (has ? 'color:' + MUT_TIERS[t].col : '') + '">' + (has ? m.name : 'Unknown mutation') + (has ? ' \u2714' : '') + '</div><div class="ds">' + (has ? m.desc : 'Not yet found.') + '</div></div></div>';
    });
  }
  const res = labLast ? '<div class="enginepart vial" style="margin:8px 0;border-color:' + MUT_TIERS[labLast.tier].col + '"><div class="epicon">' + ico(labLast.icon) + '</div><div><b style="color:' + MUT_TIERS[labLast.tier].col + '">' + MUT_TIERS[labLast.tier].name.toUpperCase() + ' MUTATION: ' + labLast.name.toUpperCase() + '</b><br><span>' + labLast.desc + '</span></div></div>' : '';
  setOverlay(
    '<div class="panel slab">' +
      '<div class="goldline"><span class="goldnum" style="color:#9BE86A">' + vials + '</span><span class="sub" style="margin:0">' + (vials === 1 ? 'Mutation Vial' : 'Mutation Vials') + '</span></div>' +
      '<h2 class="head">Giraffe lab</h2>' +
      '<canvas id="labView" width="720" height="240" style="width:100%;border-radius:6px;border:1px solid var(--bark2);margin:2px 0 8px"></canvas>' +
      '<p class="sub">In the Underground Giraffe City, a lab built around the Mutation Vial. <b>Each vial can be used once.</b> It changes the giraffe for good with one of fifteen mutations picked at random, and you can never get the same one twice. The rarer the mutation, the stronger it is: Rare, Epic and Legendary. More vials are still out there.</p>' +
      res +
      '<button class="btn' + (can ? '' : ' ghost') + '" data-a="lab-use"' + (can ? '' : ' disabled') + ' style="margin:6px auto 4px;display:block">' + (left ? (vials > 0 ? 'Use a Mutation Vial<br><small>One use, then it is gone</small>' : 'No vials<br><small>Find another to use here</small>') : 'Every mutation found') + '</button>' +
      '<div class="shoplist">' + rows + '</div>' +
      '<div class="row" style="margin-top:12px"><button class="btn ghost" data-a="menu">Main menu</button></div>' +
    '</div>');
  drawLabView(document.getElementById('labView'));
}
