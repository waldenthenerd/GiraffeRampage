'use strict';
/* Minigames between the chapters, and the hats and boots they hand out. */
/* ========================= 44f. MINIGAMES: CORE ========================= */
/* One minigame follows each chapter (the games themselves are in 44g-minigames-a.js and 44h-minigames-b.js). When a chapter is
   finished a popup offers the minigame or the next chapter; either way the next chapter follows. Every finished minigame ends
   with a spin of the accessory wheel (hat 65%, boots 30%, rare hat 5%). Starting one begins a 120 second cooldown for all of them.
   Save.data.mini = { own:{id:count}, hat:'id', boot:'id', best:{ch:score}, last:ms, plays:n }. Everything is cosmetic. */
const MINI_COOLDOWN_MS = 120 * 1000;
const MINI = [];                                   /* MINI[chapter] = definition; filled by registerMini() in 44g and 44h */
function registerMini(def){ MINI[def.ch] = def; }

/* ---- the accessories ---- */
const ACC = {
  hats: [
    { id: 'straw', name: 'Straw Hat', c: '#E9CB7C' }, { id: 'tophat', name: 'Top Hat', c: '#2E2E34' }, { id: 'party', name: 'Party Hat', c: '#E85D9F' },
    { id: 'beanie', name: 'Woolly Beanie', c: '#3E86D6' }, { id: 'cowboy', name: 'Cowboy Hat', c: '#9A6A38' }, { id: 'toque', name: 'Chef\u2019s Toque', c: '#F4F4F4' },
    { id: 'sailor', name: 'Sailor Cap', c: '#DDE6F2' }, { id: 'flowers', name: 'Flower Crown', c: '#F29AC0' }, { id: 'propeller', name: 'Propeller Cap', c: '#E5483B' },
    { id: 'bag', name: 'Paper Bag', c: '#B58B55' }
  ],
  boots: [
    { id: 'wellies', name: 'Red Wellies', c: '#D5352B' }, { id: 'cowboyb', name: 'Cowboy Boots', c: '#8A5A2B' }, { id: 'snow', name: 'Snow Boots', c: '#CFE0F4' },
    { id: 'sneaker', name: 'Racing Sneakers', c: '#F6F6F6' }, { id: 'frog', name: 'Frog Boots', c: '#5DBB45' }, { id: 'rocket', name: 'Rocket Boots', c: '#8A93A3' },
    { id: 'golden', name: 'Golden Boots', c: '#F2C230' }, { id: 'clown', name: 'Clown Shoes', c: '#FFD93D' }, { id: 'skates', name: 'Ice Skates', c: '#C9D2DE' },
    { id: 'bunny', name: 'Bunny Slippers', c: '#F7B6D2' }
  ],
  rare: [
    { id: 'crown', name: 'Golden Crown', c: '#F2C230' }, { id: 'wizard', name: 'Wizard Hat', c: '#6B47D6' }, { id: 'halo', name: 'Aurora Halo', c: '#6FF0DC' }
  ]
};
const ACC_ODDS = { hat: 0.65, boot: 0.30, rare: 0.05 };
const ACC_ITEMS = [], ACC_BY_ID = {}, ACC_SLICES = [];
(function(){
  ACC.hats.forEach(function(h){ h.kind = 'hat'; h.rare = false; h.p = ACC_ODDS.hat / ACC.hats.length; });
  ACC.boots.forEach(function(b){ b.kind = 'boot'; b.rare = false; b.p = ACC_ODDS.boot / ACC.boots.length; });
  ACC.rare.forEach(function(r){ r.kind = 'hat'; r.rare = true; r.p = ACC_ODDS.rare / ACC.rare.length; });
  let at = 0;
  ACC.hats.concat(ACC.boots, ACC.rare).forEach(function(it){
    ACC_ITEMS.push(it); ACC_BY_ID[it.id] = it;
    ACC_SLICES.push({ item: it, a0: at, a1: at + it.p }); at += it.p;       /* the wheel's slices are exactly the odds */
  });
})();

/* ---- save data ---- */
function miniData(){
  const d = Save.data; if (!d) return { own: {}, best: {}, last: 0, plays: 0, hat: '', boot: '' };
  let m = d.mini;
  if (!m || typeof m !== 'object' || Array.isArray(m)) m = d.mini = {};
  if (!m.own || typeof m.own !== 'object' || Array.isArray(m.own)) m.own = {};
  if (!m.best || typeof m.best !== 'object' || Array.isArray(m.best)) m.best = {};
  if (!m.stars || typeof m.stars !== 'object' || Array.isArray(m.stars)) m.stars = {};
  m.last = +m.last || 0; m.plays = m.plays | 0;
  if (typeof m.hat !== 'string' || !m.own[m.hat]) m.hat = '';
  if (typeof m.boot !== 'string' || !m.own[m.boot]) m.boot = '';
  return m;
}
function accOwned(id){ return !!miniData().own[id]; }
function accOwnedCount(){ let n = 0; for (let i = 0; i < ACC_ITEMS.length; i++) if (accOwned(ACC_ITEMS[i].id)) n++; return n; }
function accEquipped(kind){ const id = miniData()[kind === 'boot' ? 'boot' : 'hat']; return id && ACC_BY_ID[id] && ACC_BY_ID[id].kind === kind ? ACC_BY_ID[id] : null; }
function accWear(kind, id){ const m = miniData(); m[kind === 'boot' ? 'boot' : 'hat'] = id && accOwned(id) ? id : ''; Save.write(); }
function miniReadyIn(){ const last = miniData().last, now = Date.now(); return last > now ? 0 : Math.max(0, last + MINI_COOLDOWN_MS - now); }      /* a time in the future counts as over */
function miniUnlocked(ch){ return !!(MINI[ch] && Save.data && Save.data['chapter' + ch + 'Complete']); }

/* ---- hat and boot art ----
   drawHatSide: side view, origin at the top of the head, +x toward the nose.   drawHatTop: top-down, origin at the middle of the hat.
   drawBootSide: origin at the ankle, toe toward +x, sole 7px below.             drawBootTop: origin at the hoof, toe toward +x. */
function accStar(ctx, x, y, r, n){
  ctx.beginPath();
  for (let k = 0; k < n * 2; k++){ const a = -Math.PI / 2 + k * Math.PI / n, rr = k % 2 ? r * 0.45 : r; ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); }
  ctx.closePath(); ctx.fill();
}
function drawHatSide(ctx, id, t){
  t = t || 0;
  ctx.save(); ctx.lineJoin = 'round'; ctx.lineWidth = 1;
  switch (id){
    case 'straw':
      ctx.fillStyle = '#EBCF84'; ctx.strokeStyle = '#A98336';
      ctx.beginPath(); ctx.ellipse(0, 0, 14, 3.2, 0, 0, TAU); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-7, -0.5); ctx.quadraticCurveTo(-7.5, -12.5, 0, -12.5); ctx.quadraticCurveTo(7.5, -12.5, 7, -0.5); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#C4442F'; ctx.fillRect(-7, -4.6, 14, 3);
      break;
    case 'tophat':
      ctx.fillStyle = '#26262B'; ctx.beginPath(); ctx.ellipse(0, 0, 11, 2.6, 0, 0, TAU); ctx.fill();
      ctx.fillRect(-6.5, -17, 13, 17); ctx.fillStyle = '#3A3A42'; ctx.beginPath(); ctx.ellipse(0, -17, 6.5, 2, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = '#B3282D'; ctx.fillRect(-6.5, -5.5, 13, 3.2);
      break;
    case 'party':
      ctx.fillStyle = '#E85D9F'; ctx.beginPath(); ctx.moveTo(-7.5, 0); ctx.lineTo(7.5, 0); ctx.lineTo(0, -20); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#FFE15A'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-5, -5); ctx.lineTo(4.4, -8); ctx.moveTo(-3, -11); ctx.lineTo(2.2, -13); ctx.stroke();
      ctx.fillStyle = '#FFE15A'; ctx.beginPath(); ctx.arc(0, -20.5, 3, 0, TAU); ctx.fill();
      break;
    case 'beanie':
      ctx.fillStyle = '#3E86D6'; ctx.beginPath(); ctx.arc(0, 0, 8.5, Math.PI, TAU); ctx.fill();
      ctx.fillStyle = '#2E64A8'; ctx.fillRect(-9.2, -3, 18.4, 3.6);
      ctx.fillStyle = '#FFFFFF'; ctx.beginPath(); ctx.arc(0, -9.6, 3.2, 0, TAU); ctx.fill();
      break;
    case 'cowboy':
      ctx.fillStyle = '#8A5A2B'; ctx.beginPath(); ctx.moveTo(-15, -3); ctx.quadraticCurveTo(0, 6, 15, -3); ctx.quadraticCurveTo(0, -1.5, -15, -3); ctx.fill();
      ctx.fillStyle = '#9A6A38'; ctx.beginPath(); ctx.moveTo(-6.5, -0.5); ctx.lineTo(-5.5, -10); ctx.quadraticCurveTo(0, -12.5, 5.5, -10); ctx.lineTo(6.5, -0.5); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#3A2412'; ctx.fillRect(-6.4, -4, 12.8, 2.4);
      break;
    case 'toque':
      ctx.fillStyle = '#FFFFFF'; ctx.strokeStyle = '#CFCFCF';
      [[-5.5, -9, 5], [0, -12.5, 5.8], [5.5, -9, 5], [0, -7.5, 5]].forEach(function(c){ ctx.beginPath(); ctx.arc(c[0], c[1], c[2], 0, TAU); ctx.fill(); ctx.stroke(); });
      ctx.fillRect(-7.2, -5, 14.4, 5.6); ctx.strokeRect(-7.2, -5, 14.4, 5.6);
      break;
    case 'sailor':
      ctx.fillStyle = '#F4F4F4'; ctx.strokeStyle = '#B9C2CF'; ctx.beginPath(); ctx.ellipse(0, -4, 9.4, 5.2, 0, 0, TAU); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#1D3A6B'; ctx.fillRect(-9.4, -2.6, 18.8, 3.4);
      ctx.fillStyle = '#D5352B'; ctx.beginPath(); ctx.arc(0, -9.4, 2.2, 0, TAU); ctx.fill();
      break;
    case 'flowers': {
      ctx.fillStyle = '#4E8A3A'; ctx.beginPath(); ctx.ellipse(0, -0.5, 9.5, 2.2, 0, 0, TAU); ctx.fill();
      const cols = ['#F29AC0', '#FFFFFF', '#FFA24A', '#B58CFF'];
      [-7, -2.5, 2.5, 7].forEach(function(x, i){
        const y = -2.4 - (i % 2) * 1.6;
        ctx.fillStyle = cols[i];
        for (let k = 0; k < 5; k++){ const a = k * TAU / 5; ctx.beginPath(); ctx.arc(x + Math.cos(a) * 2.2, y + Math.sin(a) * 2.2, 1.6, 0, TAU); ctx.fill(); }
        ctx.fillStyle = '#FFE15A'; ctx.beginPath(); ctx.arc(x, y, 1.3, 0, TAU); ctx.fill();
      });
      break;
    }
    case 'propeller': {
      ctx.fillStyle = '#E5483B'; ctx.beginPath(); ctx.arc(0, 0, 8, Math.PI, TAU); ctx.fill();
      ctx.fillStyle = '#FFD84D'; ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, 8, Math.PI * 1.34, Math.PI * 1.66); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#3E86D6'; ctx.fillRect(-8.4, -2.4, 16.8, 3);
      ctx.strokeStyle = '#555'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(0, -8); ctx.lineTo(0, -12); ctx.stroke();
      const w = Math.abs(Math.cos(t * 17)) * 10 + 1.2;
      ctx.fillStyle = 'rgba(70,70,80,.85)'; ctx.beginPath(); ctx.ellipse(0, -12.4, w, 1.3, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = '#FFD84D'; ctx.beginPath(); ctx.arc(0, -12.4, 1.5, 0, TAU); ctx.fill();
      break;
    }
    case 'crown': {
      ctx.fillStyle = '#F2C230'; ctx.strokeStyle = '#B8860B'; ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.moveTo(-8, 0); ctx.lineTo(-9, -12); ctx.lineTo(-4.5, -6.5); ctx.lineTo(0, -14); ctx.lineTo(4.5, -6.5); ctx.lineTo(9, -12); ctx.lineTo(8, 0); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#D5352B'; ctx.beginPath(); ctx.arc(0, -3.4, 1.7, 0, TAU); ctx.fill();
      ctx.fillStyle = '#3E86D6'; ctx.beginPath(); ctx.arc(-4.8, -2.6, 1.2, 0, TAU); ctx.arc(4.8, -2.6, 1.2, 0, TAU); ctx.fill();
      ctx.fillStyle = '#FFF6B0'; ctx.globalAlpha = 0.5 + 0.5 * Math.sin(t * 5); accStar(ctx, 0, -16, 2.4, 4); ctx.globalAlpha = 1;
      break;
    }
    case 'wizard': {
      ctx.fillStyle = '#4A3098'; ctx.beginPath(); ctx.ellipse(0, 0, 14.5, 3.2, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = '#6B47D6'; ctx.beginPath(); ctx.moveTo(-9, -0.5); ctx.quadraticCurveTo(-4, -12, 1, -20); ctx.quadraticCurveTo(7, -25, 10, -22); ctx.quadraticCurveTo(7, -14, 9, -0.5); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#FFD84D'; accStar(ctx, -2, -9, 2.6, 5); accStar(ctx, 3.4, -15, 1.9, 5);
      ctx.beginPath(); ctx.arc(4.2, -6, 1.1, 0, TAU); ctx.fill();
      break;
    }
    case 'halo': {
      const bob = Math.sin(t * 2.4) * 1.2;
      ctx.shadowColor = '#6FF0DC'; ctx.shadowBlur = 10;
      ctx.strokeStyle = '#9DFBEA'; ctx.lineWidth = 2.6; ctx.beginPath(); ctx.ellipse(0, -9 + bob, 9, 3, 0, 0, TAU); ctx.stroke();
      ctx.shadowBlur = 0; ctx.strokeStyle = '#FFFFFF'; ctx.lineWidth = 1; ctx.beginPath(); ctx.ellipse(0, -9 + bob, 9, 3, 0, 0, TAU); ctx.stroke();
      ctx.fillStyle = '#FFFFFF'; ctx.globalAlpha = 0.6 + 0.4 * Math.sin(t * 6); accStar(ctx, 8 * Math.cos(t * 1.6), -9 + bob + 3 * Math.sin(t * 1.6), 1.8, 4); ctx.globalAlpha = 1;
      break;
    }
    case 'bag': {                                    /* origin is the middle of the head; covers all of it */
      ctx.fillStyle = '#B58B55'; ctx.strokeStyle = '#7A5A30'; ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.moveTo(-14.5, 9); ctx.lineTo(-15.5, -8); ctx.lineTo(-11, -12.5); ctx.lineTo(-5, -10.5); ctx.lineTo(1, -13); ctx.lineTo(7, -10.5); ctx.lineTo(13, -12); ctx.lineTo(16.5, -6); ctx.lineTo(15.5, 8.5); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillStyle = 'rgba(70,40,15,.28)'; ctx.beginPath(); ctx.moveTo(-14.5, 9); ctx.lineTo(15.5, 8.5); ctx.lineTo(16, 3); ctx.lineTo(-15, 3.4); ctx.closePath(); ctx.fill();
      ctx.fillStyle = 'rgba(255,235,190,.3)'; ctx.beginPath(); ctx.moveTo(-14, -8); ctx.lineTo(-10, -11); ctx.lineTo(-9, -3); ctx.lineTo(-13, 0); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = 'rgba(70,40,15,.55)'; ctx.lineWidth = 0.9; ctx.beginPath();
      ctx.moveTo(-6, -10); ctx.lineTo(-5, 2); ctx.lineTo(-7, 8); ctx.moveTo(3, -12); ctx.lineTo(4.5, -3); ctx.lineTo(2.5, 8.5); ctx.moveTo(10, -10); ctx.lineTo(8, 0); ctx.lineTo(11, 8);
      ctx.moveTo(-14, 0); ctx.lineTo(-8, -1.5); ctx.moveTo(-3, 4); ctx.lineTo(6, 3); ctx.stroke();
      ctx.fillStyle = '#26160A'; ctx.beginPath(); ctx.ellipse(8.5, -2.5, 2.4, 3, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = '#FFF'; ctx.beginPath(); ctx.arc(8.9, -2.6, 0.9, 0, TAU); ctx.fill();
      break;
    }
  }
  ctx.restore();
}
function drawHatTop(ctx, id, t){
  t = t || 0;
  ctx.save(); ctx.lineJoin = 'round'; ctx.lineWidth = 1;
  switch (id){
    case 'straw':
      ctx.fillStyle = '#EBCF84'; ctx.strokeStyle = '#A98336'; ctx.beginPath(); ctx.ellipse(0, 0, 9.4, 8.4, 0, 0, TAU); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#F2DA9A'; ctx.beginPath(); ctx.arc(0, 0, 4.8, 0, TAU); ctx.fill(); ctx.strokeStyle = '#C4442F'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.arc(0, 0, 5, 0, TAU); ctx.stroke();
      break;
    case 'tophat':
      ctx.fillStyle = '#26262B'; ctx.beginPath(); ctx.arc(0, 0, 8, 0, TAU); ctx.fill();
      ctx.fillStyle = '#3A3A42'; ctx.beginPath(); ctx.arc(0, 0, 5, 0, TAU); ctx.fill(); ctx.strokeStyle = '#B3282D'; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.arc(0, 0, 5.2, 0, TAU); ctx.stroke();
      break;
    case 'party':
      ctx.fillStyle = '#E85D9F'; ctx.beginPath(); ctx.arc(0, 0, 6.6, 0, TAU); ctx.fill();
      ctx.strokeStyle = '#FFE15A'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.arc(0, 0, 4.4, 0.4, 3.6); ctx.stroke(); ctx.beginPath(); ctx.arc(0, 0, 2.6, 3.4, 6.5); ctx.stroke();
      ctx.fillStyle = '#FFE15A'; ctx.beginPath(); ctx.arc(0, 0, 1.8, 0, TAU); ctx.fill();
      break;
    case 'beanie':
      ctx.fillStyle = '#3E86D6'; ctx.beginPath(); ctx.arc(0, 0, 7.2, 0, TAU); ctx.fill();
      ctx.strokeStyle = '#2E64A8'; ctx.lineWidth = 1; ctx.beginPath();
      for (let k = 0; k < 8; k++){ const a = k * TAU / 8; ctx.moveTo(Math.cos(a) * 2.6, Math.sin(a) * 2.6); ctx.lineTo(Math.cos(a) * 7, Math.sin(a) * 7); }
      ctx.stroke(); ctx.fillStyle = '#FFFFFF'; ctx.beginPath(); ctx.arc(0, 0, 2.7, 0, TAU); ctx.fill();
      break;
    case 'cowboy':
      ctx.fillStyle = '#8A5A2B'; ctx.beginPath(); ctx.ellipse(0, 0, 10.4, 7.2, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = '#9A6A38'; ctx.beginPath(); ctx.ellipse(0, 0, 5.8, 4.2, 0, 0, TAU); ctx.fill();
      ctx.strokeStyle = '#3A2412'; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.ellipse(0, 0, 6, 4.4, 0, 0, TAU); ctx.stroke();
      break;
    case 'toque':
      ctx.fillStyle = '#FFFFFF'; ctx.strokeStyle = '#CFCFCF';
      for (let k = 0; k < 6; k++){ const a = k * TAU / 6; ctx.beginPath(); ctx.arc(Math.cos(a) * 4.4, Math.sin(a) * 4.4, 3.6, 0, TAU); ctx.fill(); ctx.stroke(); }
      ctx.beginPath(); ctx.arc(0, 0, 4.4, 0, TAU); ctx.fill();
      break;
    case 'sailor':
      ctx.fillStyle = '#F4F4F4'; ctx.beginPath(); ctx.arc(0, 0, 7.4, 0, TAU); ctx.fill();
      ctx.strokeStyle = '#1D3A6B'; ctx.lineWidth = 1.8; ctx.beginPath(); ctx.arc(0, 0, 6.3, 0, TAU); ctx.stroke();
      ctx.fillStyle = '#D5352B'; ctx.beginPath(); ctx.arc(0, 0, 2.2, 0, TAU); ctx.fill();
      break;
    case 'flowers': {
      ctx.strokeStyle = '#4E8A3A'; ctx.lineWidth = 2.4; ctx.beginPath(); ctx.arc(0, 0, 6.6, 0, TAU); ctx.stroke();
      const cols = ['#F29AC0', '#FFFFFF', '#FFA24A', '#B58CFF', '#F29AC0', '#FFFFFF'];
      for (let k = 0; k < 6; k++){
        const a = k * TAU / 6, fx = Math.cos(a) * 6.6, fy = Math.sin(a) * 6.6;
        ctx.fillStyle = cols[k];
        for (let j = 0; j < 5; j++){ const b = j * TAU / 5; ctx.beginPath(); ctx.arc(fx + Math.cos(b) * 1.9, fy + Math.sin(b) * 1.9, 1.4, 0, TAU); ctx.fill(); }
        ctx.fillStyle = '#FFE15A'; ctx.beginPath(); ctx.arc(fx, fy, 1.1, 0, TAU); ctx.fill();
      }
      break;
    }
    case 'propeller': {
      ctx.fillStyle = '#E5483B'; ctx.beginPath(); ctx.arc(0, 0, 6.8, 0, TAU); ctx.fill();
      ctx.fillStyle = '#FFD84D'; ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, 6.8, 0, 1.57); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#3E86D6'; ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, 6.8, 3.14, 4.71); ctx.closePath(); ctx.fill();
      ctx.save(); ctx.rotate(t * 22); ctx.fillStyle = 'rgba(70,70,80,.8)';
      ctx.beginPath(); ctx.ellipse(0, 0, 10, 1.7, 0, 0, TAU); ctx.fill(); ctx.beginPath(); ctx.ellipse(0, 0, 1.7, 10, 0, 0, TAU); ctx.fill(); ctx.restore();
      ctx.fillStyle = '#FFD84D'; ctx.beginPath(); ctx.arc(0, 0, 1.7, 0, TAU); ctx.fill();
      break;
    }
    case 'crown': {
      ctx.fillStyle = '#F2C230'; ctx.strokeStyle = '#B8860B'; ctx.lineWidth = 1.2; ctx.beginPath();
      for (let k = 0; k < 10; k++){ const a = k * TAU / 10, r = k % 2 ? 5.2 : 9; ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r); }
      ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#C8961A'; ctx.beginPath(); ctx.arc(0, 0, 4.4, 0, TAU); ctx.fill();
      ctx.fillStyle = '#D5352B'; ctx.beginPath(); ctx.arc(0, 0, 2, 0, TAU); ctx.fill();
      break;
    }
    case 'wizard':
      ctx.fillStyle = '#4A3098'; ctx.beginPath(); ctx.arc(0, 0, 10, 0, TAU); ctx.fill();
      ctx.fillStyle = '#6B47D6'; ctx.beginPath(); ctx.arc(-0.5, 0, 5.8, 0, TAU); ctx.fill();
      ctx.fillStyle = '#FFD84D'; accStar(ctx, 2.4, -1.4, 2.6, 5); accStar(ctx, -3, 2.6, 1.6, 5);
      break;
    case 'halo': {
      ctx.shadowColor = '#6FF0DC'; ctx.shadowBlur = 10; ctx.strokeStyle = '#9DFBEA'; ctx.lineWidth = 2.6; ctx.beginPath(); ctx.arc(0, 0, 8.4, 0, TAU); ctx.stroke();
      ctx.shadowBlur = 0; ctx.strokeStyle = '#FFFFFF'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(0, 0, 8.4, 0, TAU); ctx.stroke();
      ctx.fillStyle = '#FFFFFF'; ctx.globalAlpha = 0.6 + 0.4 * Math.sin(t * 6); accStar(ctx, Math.cos(t * 2) * 8.4, Math.sin(t * 2) * 8.4, 2, 4); ctx.globalAlpha = 1;
      break;
    }
    case 'bag':                                      /* the closed, folded top of a paper bag seen from above; origin is the middle of the head */
      ctx.fillStyle = '#B58B55'; ctx.strokeStyle = '#7A5A30'; ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.moveTo(-14, -9); ctx.lineTo(-6, -11); ctx.lineTo(4, -10); ctx.lineTo(13.5, -9.5); ctx.lineTo(15, -3); ctx.lineTo(14.5, 4); ctx.lineTo(15, 9.5); ctx.lineTo(5, 11); ctx.lineTo(-5, 10); ctx.lineTo(-14, 10.5); ctx.lineTo(-15, 1); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillStyle = 'rgba(255,235,190,.32)'; ctx.fillRect(-12, -8, 12, 5);
      ctx.fillStyle = 'rgba(70,40,15,.25)'; ctx.fillRect(-12, 4.5, 26, 4.5);
      ctx.strokeStyle = 'rgba(70,40,15,.6)'; ctx.lineWidth = 1; ctx.beginPath();
      ctx.moveTo(4, -10); ctx.lineTo(5.5, 0); ctx.lineTo(3.5, 10); ctx.moveTo(-10, -4); ctx.lineTo(0, -2); ctx.lineTo(2, 3); ctx.moveTo(8, -6); ctx.lineTo(12, -1); ctx.moveTo(-12, 6); ctx.lineTo(-4, 3); ctx.stroke();
      ctx.fillStyle = '#26160A'; ctx.beginPath(); ctx.ellipse(14.6, -4.8, 1.2, 2.2, 0, 0, TAU); ctx.ellipse(14.6, 5, 1.2, 2.2, 0, 0, TAU); ctx.fill();
      break;
  }
  ctx.restore();
}
/* where a hat sits on the head, so every drawing of the giraffe agrees: set back and tipped back so the eyes stay clear.
   Top-down: origin is the middle of the head ellipse, nose toward +x.   Side: (hx, hy) is the middle of the head, nose toward +x. */
function drawHatOnHeadTop(ctx, id, t){
  ctx.save();
  if (id === 'bag') ctx.translate(3, 0); else { ctx.translate(-8, 0); ctx.scale(0.8, 0.8); }
  drawHatTop(ctx, id, t);
  ctx.restore();
}
function drawHatOnHeadSide(ctx, id, t, hx, hy){
  ctx.save();
  if (id === 'bag') ctx.translate(hx, hy); else { ctx.translate(hx - 5.5, hy - 4.4); ctx.rotate(-0.46); }      /* sits on the head, the ossicones tucked under it */
  drawHatSide(ctx, id, t);
  ctx.restore();
}
const BOOT_PAL = { wellies: ['#D5352B', '#8E1F18'], cowboyb: ['#8A5A2B', '#5A3A1C'], snow: ['#CFE0F4', '#8FA9C6'], sneaker: ['#F6F6F6', '#E34040'],
  frog: ['#5DBB45', '#2E8A2B'], rocket: ['#8A93A3', '#E8642C'], golden: ['#F2C230', '#B8860B'], clown: ['#FFD93D', '#D5352B'],
  skates: ['#F4F6FA', '#9FB0C4'], bunny: ['#F7B6D2', '#D77FA3'] };
function drawBootSide(ctx, id, t, moving){
  const pal = BOOT_PAL[id]; if (!pal) return;
  ctx.save(); ctx.lineJoin = 'round'; ctx.lineWidth = 1;
  if (id === 'clown'){                               /* long floppy shoes with red dots and a bow */
    ctx.fillStyle = '#FFD93D'; ctx.strokeStyle = '#B8860B';
    ctx.beginPath(); ctx.rect(-4.2, -9, 8.4, 10); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.ellipse(5.5, 3.2, 13, 4.6, 0, 0, TAU); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#D5352B'; ctx.beginPath(); ctx.ellipse(14, 3.2, 4.2, 3.6, 0, 0, TAU); ctx.fill();
    ctx.fillRect(-4.2, -9, 8.4, 2.6);
    [[1, 2.6], [6, 1.6], [-1, -3.5], [10, 4.2], [3, 4.8]].forEach(function(d){ ctx.beginPath(); ctx.arc(d[0], d[1], 1.2, 0, TAU); ctx.fill(); });
    ctx.beginPath(); ctx.moveTo(0, -9); ctx.lineTo(-5, -12); ctx.lineTo(-5, -6); ctx.closePath(); ctx.moveTo(0, -9); ctx.lineTo(5, -12); ctx.lineTo(5, -6); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#26201C'; ctx.fillRect(-7, 6, 24, 1.4);
    ctx.restore(); return;
  }
  if (id === 'skates'){                              /* white boot on a steel blade */
    ctx.fillStyle = '#C9D2DE'; ctx.strokeStyle = '#7C8A9C';
    ctx.beginPath(); ctx.moveTo(-7, 8.2); ctx.lineTo(11, 8.2); ctx.quadraticCurveTo(14.5, 8.2, 14.5, 4.8); ctx.lineTo(13, 5.6); ctx.quadraticCurveTo(11.5, 6.8, 10, 6.8); ctx.lineTo(-6, 6.8); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillRect(-3.4, 5.4, 1.6, 2); ctx.fillRect(6.4, 5.4, 1.6, 2);
    ctx.fillStyle = '#F4F6FA'; ctx.strokeStyle = '#9FB0C4';
    ctx.beginPath(); ctx.rect(-4.6, -9, 9.2, 10.5); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.ellipse(3, 3, 7.6, 3.6, 0, 0, TAU); ctx.fill(); ctx.stroke();
    ctx.strokeStyle = '#7C8A9C'; ctx.lineWidth = 0.9; ctx.beginPath();
    for (let k = 0; k < 4; k++){ ctx.moveTo(-3, -7 + k * 2.6); ctx.lineTo(3, -5.8 + k * 2.6); ctx.moveTo(3, -7 + k * 2.6); ctx.lineTo(-3, -5.8 + k * 2.6); }
    ctx.stroke();
    ctx.restore(); return;
  }
  if (id === 'bunny'){                               /* a fuzzy pink slipper with ears and a nose */
    ctx.fillStyle = '#F7B6D2'; ctx.strokeStyle = '#D77FA3';
    ctx.beginPath(); ctx.ellipse(-3, -8, 2.2, 6.2, -0.25, 0, TAU); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.ellipse(2, -9, 2.2, 6.6, 0.15, 0, TAU); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#FFDDEA'; ctx.beginPath(); ctx.ellipse(-3, -8, 1, 4.2, -0.25, 0, TAU); ctx.ellipse(2, -9, 1, 4.6, 0.15, 0, TAU); ctx.fill();
    ctx.fillStyle = '#F7B6D2'; ctx.strokeStyle = '#D77FA3';
    ctx.beginPath(); ctx.ellipse(0, -1, 5.6, 4.6, 0, 0, TAU); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.ellipse(3.5, 3.4, 9.2, 4.6, 0, 0, TAU); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#FFE3EE'; for (let k = 0; k < 7; k++){ ctx.beginPath(); ctx.arc(-4.4 + k * 2.4, 6.6, 1.5, 0, TAU); ctx.fill(); }
    ctx.fillStyle = '#E86A9A'; ctx.beginPath(); ctx.arc(11.6, 2.6, 1.7, 0, TAU); ctx.fill();
    ctx.fillStyle = '#1A1A1A'; ctx.beginPath(); ctx.arc(8, 0.2, 0.9, 0, TAU); ctx.fill();
    ctx.strokeStyle = '#B25A80'; ctx.lineWidth = 0.7; ctx.beginPath(); ctx.moveTo(11, 3.6); ctx.lineTo(15, 4.4); ctx.moveTo(11, 3); ctx.lineTo(15, 2); ctx.stroke();
    ctx.restore(); return;
  }
  if (id === 'rocket' && moving){
    const f = 5 + Math.sin((t || 0) * 40) * 2.4;
    ctx.fillStyle = '#FFB347'; ctx.beginPath(); ctx.moveTo(-3, 1); ctx.lineTo(-3 - f * 1.3, 3.4); ctx.lineTo(-3, 6); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#FFF2B0'; ctx.beginPath(); ctx.moveTo(-3, 2.4); ctx.lineTo(-3 - f * 0.7, 3.4); ctx.lineTo(-3, 4.6); ctx.closePath(); ctx.fill();
  }
  ctx.fillStyle = pal[0]; ctx.strokeStyle = pal[1];
  ctx.beginPath(); ctx.rect(-4.8, -9, 9.6, 10.5); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.ellipse(3, 3, 7.6, 4, 0, 0, TAU); ctx.fill(); ctx.stroke();
  ctx.fillStyle = id === 'sneaker' ? '#D8D8D8' : '#26201C'; ctx.fillRect(-4.4, 5.4, 14, 1.8);
  switch (id){
    case 'wellies': ctx.fillStyle = pal[1]; ctx.fillRect(-4.8, -9, 9.6, 2.4); ctx.fillStyle = 'rgba(255,255,255,.35)'; ctx.fillRect(-2.8, -6, 1.6, 6); break;
    case 'cowboyb': ctx.fillStyle = pal[1]; ctx.beginPath(); ctx.ellipse(6, 3, 3, 3.4, 0, 0, TAU); ctx.fill(); ctx.fillStyle = '#E8C860'; ctx.beginPath(); ctx.arc(-6.2, 4.6, 1.8, 0, TAU); ctx.fill(); break;
    case 'snow': ctx.fillStyle = '#FFFFFF'; ctx.beginPath(); ctx.ellipse(0, -9, 6.6, 2.8, 0, 0, TAU); ctx.fill(); ctx.strokeStyle = '#DDE6F2'; ctx.stroke(); break;
    case 'sneaker': ctx.strokeStyle = pal[1]; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-1, 6); ctx.lineTo(7, 0.5); ctx.stroke(); ctx.fillStyle = pal[1]; ctx.fillRect(-4.8, -9, 9.6, 2); break;
    case 'frog': ctx.fillStyle = '#FFFFFF'; ctx.beginPath(); ctx.arc(7, 0, 2.4, 0, TAU); ctx.fill(); ctx.fillStyle = '#1A1A1A'; ctx.beginPath(); ctx.arc(7.6, 0, 1.1, 0, TAU); ctx.fill(); break;
    case 'rocket': ctx.fillStyle = pal[1]; ctx.fillRect(-4.8, -4, 9.6, 2.6); ctx.fillStyle = '#FFD84D'; ctx.beginPath(); ctx.arc(0, -7, 1.2, 0, TAU); ctx.fill(); break;
    case 'golden': ctx.fillStyle = 'rgba(255,255,255,.55)'; ctx.fillRect(-3, -7, 1.6, 7); break;
  }
  ctx.restore();
}
function drawBootTop(ctx, id, t, moving){
  const pal = BOOT_PAL[id]; if (!pal) return;
  ctx.save(); ctx.lineJoin = 'round'; ctx.lineWidth = 1;
  if (id === 'clown'){
    ctx.fillStyle = '#FFD93D'; ctx.strokeStyle = '#B8860B'; ctx.beginPath(); ctx.ellipse(3, 0, 11, 6.4, 0, 0, TAU); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#D5352B'; ctx.beginPath(); ctx.ellipse(10.2, 0, 4, 4.8, 0, 0, TAU); ctx.fill();
    [[-2, -3], [2, 2.6], [-4, 2], [5, -2.6]].forEach(function(d){ ctx.beginPath(); ctx.arc(d[0], d[1], 1.2, 0, TAU); ctx.fill(); });
    ctx.restore(); return;
  }
  if (id === 'skates'){
    ctx.fillStyle = '#F4F6FA'; ctx.strokeStyle = '#9FB0C4'; ctx.beginPath(); ctx.ellipse(0.5, 0, 7.4, 4.6, 0, 0, TAU); ctx.fill(); ctx.stroke();
    ctx.strokeStyle = '#C9D2DE'; ctx.lineWidth = 1.8; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-8.4, 0); ctx.lineTo(10, 0); ctx.stroke();
    ctx.strokeStyle = '#7C8A9C'; ctx.lineWidth = 0.9; ctx.beginPath(); ctx.moveTo(-2, -2.6); ctx.lineTo(2, 2.6); ctx.moveTo(2, -2.6); ctx.lineTo(-2, 2.6); ctx.stroke();
    ctx.restore(); return;
  }
  if (id === 'bunny'){
    ctx.fillStyle = '#F7B6D2'; ctx.strokeStyle = '#D77FA3';
    ctx.beginPath(); ctx.ellipse(-7, -3.4, 5, 2, -0.35, 0, TAU); ctx.fill(); ctx.stroke(); ctx.beginPath(); ctx.ellipse(-7, 3.4, 5, 2, 0.35, 0, TAU); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.ellipse(0.5, 0, 7.8, 5.6, 0, 0, TAU); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#E86A9A'; ctx.beginPath(); ctx.arc(7, 0, 1.7, 0, TAU); ctx.fill();
    ctx.fillStyle = '#1A1A1A'; ctx.beginPath(); ctx.arc(3.6, -2.4, 0.9, 0, TAU); ctx.arc(3.6, 2.4, 0.9, 0, TAU); ctx.fill();
    ctx.restore(); return;
  }
  if (id === 'rocket' && moving){
    const f = 6 + Math.sin((t || 0) * 40) * 2.6;
    ctx.fillStyle = '#FFB347'; ctx.beginPath(); ctx.moveTo(-6, -2.6); ctx.lineTo(-6 - f * 1.4, 0); ctx.lineTo(-6, 2.6); ctx.closePath(); ctx.fill();
  }
  ctx.fillStyle = pal[0]; ctx.strokeStyle = pal[1];
  ctx.beginPath(); ctx.ellipse(0.5, 0, 7.4, 5.4, 0, 0, TAU); ctx.fill(); ctx.stroke();
  switch (id){
    case 'wellies': ctx.fillStyle = pal[1]; ctx.beginPath(); ctx.ellipse(-3.4, 0, 2.2, 5, 0, 0, TAU); ctx.fill(); ctx.fillStyle = 'rgba(255,255,255,.4)'; ctx.beginPath(); ctx.ellipse(1.6, -2.4, 2.6, 1, 0, 0, TAU); ctx.fill(); break;
    case 'cowboyb': ctx.fillStyle = pal[1]; ctx.beginPath(); ctx.ellipse(3.6, 0, 3.2, 4.2, 0, 0, TAU); ctx.fill(); ctx.fillStyle = '#E8C860'; ctx.beginPath(); ctx.arc(-7.4, 0, 1.6, 0, TAU); ctx.fill(); break;
    case 'snow': ctx.strokeStyle = '#FFFFFF'; ctx.lineWidth = 2.6; ctx.beginPath(); ctx.ellipse(-2.4, 0, 3.6, 5.6, 0, 0, TAU); ctx.stroke(); break;
    case 'sneaker': ctx.strokeStyle = pal[1]; ctx.lineWidth = 1.8; ctx.beginPath(); ctx.moveTo(-3, 3.4); ctx.lineTo(3.6, -3); ctx.stroke(); break;
    case 'frog': ctx.fillStyle = '#FFFFFF'; ctx.beginPath(); ctx.arc(3.4, -2.8, 2, 0, TAU); ctx.arc(3.4, 2.8, 2, 0, TAU); ctx.fill(); ctx.fillStyle = '#1A1A1A'; ctx.beginPath(); ctx.arc(4, -2.8, 1, 0, TAU); ctx.arc(4, 2.8, 1, 0, TAU); ctx.fill(); break;
    case 'rocket': ctx.fillStyle = pal[1]; ctx.fillRect(-3, -5.2, 3, 10.4); break;
    case 'golden': ctx.fillStyle = 'rgba(255,255,255,.6)'; ctx.beginPath(); ctx.ellipse(1, -2.4, 3, 1, 0, 0, TAU); ctx.fill(); break;
  }
  ctx.restore();
}
/* a small picture of any item, for the wheel, the prize card and the wardrobe */
/* _accOv: the colors to tint the hat and boots with while a portrait of a saved outfit is drawn (otherwise the worn ones, see 44m) */
let _accOv = null;
function drawAccIcon(ctx, it, cx, cy, sc, t){
  ctx.save(); ctx.translate(cx, cy); ctx.scale(sc, sc);
  if (it.kind === 'boot') drawBootSide(ctx, it.id, t || 0, false);
  else { ctx.translate(0, 6); drawHatSide(ctx, it.id, t || 0); }
  ctx.restore();
}

/* ---- the giraffe in the minigames ---- */
function miniGeom(){ const W = G.W, H = G.H; return { W: W, H: H, s: clamp(Math.min(H / 760, W / 900), 0.62, 1.4) }; }
/* side view, facing right (o.flip turns her); origin is the middle of her body, her feet are 37 below it */
function drawSideGiraffe(ctx, x, y, sc, o){
  o = o || {};
  const cl = giraffeColours(), pat = giraffePattern(), hat = accEquipped('hat'), boot = accEquipped('boot'), t = G.time;
  ctx.save(); ctx.translate(x, y); ctx.scale(sc * (o.flip ? -1 : 1), sc);
  if (o.rot) ctx.rotate(o.rot);
  if (o.alpha !== undefined) ctx.globalAlpha = o.alpha;
  const ph = o.ph || 0, lean = o.lean || 0, lx = [-15, -9, 10, 16];
  ctx.lineCap = 'round';
  for (let i = 0; i < 4; i++){
    const far = i % 2 === 0;
    const sw = o.air ? (far ? -6 : 6) : Math.sin(ph + (far ? 0 : Math.PI)) * 7;
    const lift = o.air ? 5 : Math.max(0, Math.cos(ph + (far ? 0 : Math.PI))) * 5;
    const fx = lx[i] + sw, fy = 30 - lift;
    ctx.strokeStyle = far ? cl.dark : cl.coat; ctx.lineWidth = 5.2; ctx.beginPath(); ctx.moveTo(lx[i], 8); ctx.lineTo(fx, fy); ctx.stroke();
    if (boot){ ctx.save(); ctx.translate(fx, fy); drawBootSide(ctx, boot.id, t, o.moving); ctx.restore(); }
    else { ctx.fillStyle = '#4A2E12'; ctx.beginPath(); ctx.ellipse(fx + 1, fy + 3, 4.6, 3.4, 0, 0, TAU); ctx.fill(); }
  }
  ctx.strokeStyle = cl.dark; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-22, -2); ctx.quadraticCurveTo(-32, 0, -34, 9 + Math.sin(t * 6) * 3); ctx.stroke();
  ctx.fillStyle = cl.coat; ctx.beginPath(); ctx.ellipse(0, 0, 24, 15, 0, 0, TAU); ctx.fill();
  ctx.save(); ctx.beginPath(); ctx.ellipse(0, 0, 24, 15, 0, 0, TAU); ctx.clip(); ctx.fillStyle = cl.spot;
  if (typeof SPOTS !== 'undefined') for (let i = 0; i < SPOTS.length; i++){ const sp = SPOTS[i]; wardSpot(ctx, pat, sp.x, sp.y * 0.9, sp.r, sp.r * 0.82, i * 0.7); }
  ctx.restore();
  const hx = 27 + lean, hy = -55 + (o.dip || 0);
  ctx.fillStyle = cl.coat; ctx.beginPath(); ctx.moveTo(10, -8); ctx.lineTo(hx - 8, hy + 4); ctx.lineTo(hx + 4, hy + 4); ctx.lineTo(20, 2); ctx.closePath(); ctx.fill();
  ctx.fillStyle = cl.spot;
  for (let k = 0; k < 4; k++){ const u = (k + 0.7) / 4.4; wardSpot(ctx, pat, lerp(15, hx - 2, u), lerp(-3, hy + 8, u), 3.2 - k * 0.3, 2.8 - k * 0.25, 0.3); }
  ctx.fillStyle = cl.coat; ctx.beginPath(); ctx.ellipse(hx, hy, 12, 7.2, -0.25, 0, TAU); ctx.fill();
  ctx.fillStyle = cl.dark; ctx.beginPath(); ctx.ellipse(hx + 8, hy + 2, 5.4, 4.4, -0.25, 0, TAU); ctx.fill();
  ctx.strokeStyle = cl.dark; ctx.lineWidth = 2.4; ctx.beginPath(); ctx.moveTo(hx - 4, hy - 6); ctx.lineTo(hx - 6, hy - 14); ctx.moveTo(hx + 1, hy - 6.5); ctx.lineTo(hx + 1, hy - 14); ctx.stroke();
  ctx.fillStyle = '#4A2E12'; ctx.beginPath(); ctx.arc(hx - 6, hy - 14.5, 2.1, 0, TAU); ctx.arc(hx + 1, hy - 14.5, 2.1, 0, TAU); ctx.fill();
  if (hat && hat.id !== 'bag') drawHatOnHeadSide(ctx, hat.id, t, hx, hy);
  ctx.fillStyle = '#FFF'; ctx.beginPath(); ctx.arc(hx + 6, hy - 1.6, 2.2, 0, TAU); ctx.fill(); ctx.fillStyle = '#20140C'; ctx.beginPath(); ctx.arc(hx + 7, hy - 1.6, 1.2, 0, TAU); ctx.fill();
  if (hat && hat.id === 'bag') drawHatOnHeadSide(ctx, hat.id, t, hx, hy);              /* the bag goes over the face, eyes and all */
  ctx.restore();
}
/* top-down, facing `ang`; the origin is the middle of her body */
function drawTopGiraffe(ctx, x, y, ang, sc, ph, o){
  o = o || {};
  const cl = giraffeColours(), pat = giraffePattern(), hat = accEquipped('hat'), boot = accEquipped('boot'), t = G.time;
  ctx.save(); ctx.translate(x, y); ctx.scale(sc * 1.3, sc * 1.3); ctx.rotate(ang);
  if (o.alpha !== undefined) ctx.globalAlpha = o.alpha;
  ctx.fillStyle = 'rgba(0,0,0,.22)'; ctx.beginPath(); ctx.ellipse(1, 3, 26, 16, 0, 0, TAU); ctx.fill();
  const legs = [[-13, -11, 1], [-13, 11, -1], [12, -10, -1], [12, 10, 1]], sw = Math.sin(ph) * 6;
  for (let i = 0; i < 4; i++){
    const L = legs[i];
    ctx.save(); ctx.translate(L[0] + sw * L[2] * 0.7, L[1]);
    ctx.fillStyle = cl.dark; ctx.beginPath(); ctx.ellipse(0, 0, 6.2, 4.6, 0, 0, TAU); ctx.fill();
    if (boot) drawBootTop(ctx, boot.id, t, o.moving); else { ctx.fillStyle = '#5C3A16'; ctx.beginPath(); ctx.ellipse(2, 0, 2.6, 2.6, 0, 0, TAU); ctx.fill(); }
    ctx.restore();
  }
  ctx.strokeStyle = cl.dark; ctx.lineWidth = 3; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-22, 0); ctx.quadraticCurveTo(-32, Math.sin(ph * 1.4) * 7, -36, Math.sin(ph * 1.4) * 11); ctx.stroke();
  ctx.fillStyle = cl.coat; ctx.beginPath(); ctx.ellipse(0, 0, 24, 16, 0, 0, TAU); ctx.fill();
  ctx.save(); ctx.beginPath(); ctx.ellipse(0, 0, 24, 16, 0, 0, TAU); ctx.clip(); ctx.fillStyle = cl.spot;
  if (typeof SPOTS !== 'undefined') for (let i = 0; i < SPOTS.length; i++){ const sp = SPOTS[i]; wardSpot(ctx, pat, sp.x, sp.y, sp.r, sp.r * 0.82, i * 0.7); }
  ctx.restore();
  const nl = o.neck || 34;
  ctx.fillStyle = cl.coat; ctx.beginPath(); ctx.moveTo(10, -8.5); ctx.lineTo(10 + nl, -5.5); ctx.lineTo(10 + nl, 5.5); ctx.lineTo(10, 8.5); ctx.closePath(); ctx.fill();
  ctx.fillStyle = cl.spot; for (let k = 1; k <= 3; k++) wardSpot(ctx, pat, 10 + nl * k / 4, (k % 2 ? 2.2 : -2.2), 3, 2.6, 0);
  ctx.save(); ctx.translate(10 + nl, 0);
  ctx.fillStyle = cl.coat; ctx.beginPath(); ctx.ellipse(2, 0, 11, 7.6, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = cl.dark; ctx.beginPath(); ctx.ellipse(10, 0, 5.4, 4.4, 0, 0, TAU); ctx.fill();
  ctx.strokeStyle = cl.dark; ctx.lineWidth = 2.6; ctx.beginPath(); ctx.moveTo(-3, -4.6); ctx.lineTo(-6, -8.6); ctx.moveTo(-3, 4.6); ctx.lineTo(-6, 8.6); ctx.stroke();
  ctx.fillStyle = '#4A2E12'; ctx.beginPath(); ctx.arc(-6.4, -9, 2.3, 0, TAU); ctx.arc(-6.4, 9, 2.3, 0, TAU); ctx.fill();
  if (hat && hat.id !== 'bag') drawHatOnHeadTop(ctx, hat.id, t);
  ctx.fillStyle = '#FFF'; ctx.beginPath(); ctx.arc(1, -5.4, 2.2, 0, TAU); ctx.arc(1, 5.4, 2.2, 0, TAU); ctx.fill();
  ctx.fillStyle = '#20140C'; ctx.beginPath(); ctx.arc(2.2, -5.4, 1.2, 0, TAU); ctx.arc(2.2, 5.4, 1.2, 0, TAU); ctx.fill();
  if (hat && hat.id === 'bag') drawHatOnHeadTop(ctx, hat.id, t);
  ctx.restore();
  ctx.restore();
}

/* ---- running a minigame ---- */
function miniText(ctx, txt, x, y, size, col, align, bold){
  if (size < 12.5) size = 12.5;                                                   /* small screens still get readable text */
  ctx.font = (bold === false ? '' : 'bold ') + Math.round(size) + 'px system-ui, "Segoe UI", sans-serif'; ctx.textAlign = align || 'center';
  ctx.lineWidth = Math.max(2, size / 5); ctx.strokeStyle = 'rgba(12,9,8,.75)'; ctx.lineJoin = 'round'; ctx.strokeText(txt, x, y);
  ctx.fillStyle = col || '#FFF6E0'; ctx.fillText(txt, x, y);
}
function miniPop(m, x, y, txt, col){
  if (m.pops.length < 24) m.pops.push({ x: x, y: y, t: 0, txt: txt, col: col || '#FFE9A0' });
  miniBurst(m, x, y + 10, 9, col || '#FFE9A0', { speed: 170, r: 3.4, life: 0.6, up: 60 });               /* every pop comes with a spray of sparks */
}
/* particles: a spray from a point, a ring that spreads, a puff of dust. Drawn above the scene by renderMini(). */
function miniBurst(m, x, y, n, col, o){
  o = o || {};
  const f = m.fx || (m.fx = []);
  for (let i = 0; i < n && f.length < 220; i++){
    const a = o.ang !== undefined ? o.ang + (Math.random() - 0.5) * (o.spread || 1) : Math.random() * TAU, sp = (o.speed || 110) * (0.35 + Math.random() * 0.8);
    f.push({ x: x, y: y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - (o.up || 0), g: o.g === undefined ? 300 : o.g, r: (o.r || 3) * (0.6 + Math.random() * 0.7),
      t: 0, life: (o.life || 0.6) * (0.6 + Math.random() * 0.7), col: col, glow: o.glow !== false, ring: false });
  }
}
function miniRing(m, x, y, col, r1, life, sq){ const f = m.fx || (m.fx = []); if (f.length < 220) f.push({ x: x, y: y, vx: 0, vy: 0, g: 0, r: 3, r1: r1 || 40, t: 0, life: life || 0.5, col: col, ring: true, sq: sq || 0.45 }); }
function miniDust(m, x, y, col){ miniBurst(m, x, y, 1, col || 'rgba(225,205,165,.55)', { speed: 26, g: -18, r: 4.5, life: 0.7, glow: false }); }
function miniFxUpdate(m, dt){
  const f = m.fx; if (!f) return;
  for (let i = f.length - 1; i >= 0; i--){
    const p = f[i]; p.t += dt;
    if (p.t >= p.life){ f.splice(i, 1); continue; }
    p.x += p.vx * dt; p.y += p.vy * dt; p.vy += p.g * dt; p.vx *= 1 - Math.min(1, 1.6 * dt);
  }
}
function miniFxDraw(ctx, m){
  const f = m.fx; if (!f) return;
  for (let i = 0; i < f.length; i++){
    const p = f[i], k = p.t / p.life, a = 1 - k;
    if (p.ring){ ctx.strokeStyle = p.col; ctx.globalAlpha = a * 0.8; ctx.lineWidth = 2.4 * a + 0.6; ctx.beginPath(); ctx.ellipse(p.x, p.y, p.r + (p.r1 - p.r) * k, (p.r + (p.r1 - p.r) * k) * p.sq, 0, 0, TAU); ctx.stroke(); continue; }
    ctx.globalAlpha = a * (p.glow ? 0.9 : 0.5); ctx.fillStyle = p.col; ctx.beginPath(); ctx.arc(p.x, p.y, p.r * (p.glow ? a * 0.7 + 0.3 : 1 + k * 0.8), 0, TAU); ctx.fill();
  }
  ctx.globalAlpha = 1;
}
/* shared drawing helpers for the minigame backdrops */
function miniRng(seed){ let a = seed >>> 0; return function(){ a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
/* a backdrop painted once into its own canvas and re-used every frame (repainted if the window changes size) */
function miniBg(m, g, key, paint, w, h){
  w = Math.ceil(w || g.W); h = Math.ceil(h || g.H);
  const bg = m.bg || (m.bg = {});
  let e = bg[key];
  if (!e || e.w !== w || e.h !== h){
    const d = G.dpr || 1, cv = document.createElement('canvas'); cv.width = Math.ceil(w * d); cv.height = Math.ceil(h * d);
    const c = cv.getContext('2d'); c.scale(d, d); paint(c, w, h, g.s, miniRng(key.length * 7919 + w));
    e = bg[key] = { cv: cv, w: w, h: h };
  }
  return e;
}
function miniLayer(ctx, m, g, key, paint, w, h, x, y){ const e = miniBg(m, g, key, paint, w, h); ctx.drawImage(e.cv, x || 0, y || 0, e.w, e.h); }
/* a soft round light or shadow */
function miniGlow(ctx, x, y, r, rgb, a){
  const gr = ctx.createRadialGradient(x, y, 0, x, y, r);
  gr.addColorStop(0, 'rgba(' + rgb + ',' + a + ')'); gr.addColorStop(1, 'rgba(' + rgb + ',0)');
  ctx.fillStyle = gr; ctx.fillRect(x - r, y - r, r * 2, r * 2);
}
function miniShadow(ctx, x, y, rx, ry, a){ ctx.fillStyle = 'rgba(10,6,2,' + (a === undefined ? 0.28 : a) + ')'; ctx.beginPath(); ctx.ellipse(x, y, rx, ry, 0, 0, TAU); ctx.fill(); }
let _miniVig = null, _miniVigKey = '';
function miniVignette(ctx, W, H, a){
  const key = W + 'x' + H;
  if (key !== _miniVigKey){ _miniVigKey = key; const r = Math.hypot(W, H) / 2; _miniVig = ctx.createRadialGradient(W / 2, H / 2, r * 0.5, W / 2, H / 2, r); _miniVig.addColorStop(0, 'rgba(8,5,3,0)'); _miniVig.addColorStop(1, 'rgba(8,5,3,1)'); }
  ctx.globalAlpha = a === undefined ? 0.4 : a; ctx.fillStyle = _miniVig; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1;
}
const _miniPrev = {};
function miniReadInput(m){
  const k = Input.keys, I = m.in;
  const any = function(a){ for (let i = 0; i < a.length; i++) if (k[a[i]]) return true; return false; };
  const l = any(['ArrowLeft', 'KeyA', keyOf('left')]), r = any(['ArrowRight', 'KeyD', keyOf('right')]);
  const u = any(['ArrowUp', 'KeyW', keyOf('up')]), d = any(['ArrowDown', 'KeyS', keyOf('down')]);
  const act = !!(k.Space || k.Enter || k.NumpadEnter || Input.padBtn || Input.mdown);
  const edge = function(name, v){ const e = v && !_miniPrev[name]; _miniPrev[name] = v; return e; };
  I.l = l; I.r = r; I.u = u; I.d = d; I.act = act;
  I.pL = edge('l', l); I.pR = edge('r', r); I.pU = edge('u', u); I.pD = edge('d', d); I.pAct = edge('act', act);
  I.jump = act || u; I.pJump = edge('jump', I.jump);
  I.px = Input.sx; I.py = Input.sy; I.ptr = !!Input.mdown;
  I.pClick = edge('ptr', I.ptr);
  I.digit = 0; for (let n = 1; n <= 9; n++){ if (edge('d' + n, !!(k['Digit' + n] || k['Numpad' + n]))) I.digit = n; }
}
/* keys, a stick, or a held mouse button / finger pulling toward the pointer: one movement vector */
function miniSteer(m, px, py){
  const I = m.in; let x = (I.r ? 1 : 0) - (I.l ? 1 : 0), y = (I.d ? 1 : 0) - (I.u ? 1 : 0);
  if (Input.padOn){ x += Input.padX; y += Input.padY; }
  if (!x && !y && I.ptr){ const dx = I.px - px, dy = I.py - py, dd = Math.hypot(dx, dy); if (dd > 12){ x = dx / dd; y = dy / dd; } }
  const mg = Math.hypot(x, y); if (mg > 1){ x /= mg; y /= mg; }
  return { x: x, y: y };
}
function startMini(ch, then, from){
  const def = MINI[ch];
  if (!def){ return false; }
  if (miniReadyIn() > 0){ SFX.deny(); return false; }
  const md = miniData(), prevLast = md.last; md.last = Date.now(); md.plays++; Save.write();
  G.mini = { def: def, ch: ch, then: then || null, from: from || 'menu', phase: 'intro', t: 0, time: 0, score: 0, goal: def.goal, lives: 0,
    over: false, won: false, prize: null, pops: [], in: {}, prevLast: prevLast, bestAtStart: md.best[ch] | 0, stars: 0, liveStars: 0, goalDone: false, newBestShown: false,
    streak: 0, lastPick: -9, pickN: 0 };
  miniReadInput(G.mini);                                                          /* what is held now is not a fresh press */
  G.state = 'mini'; G.attract = false; G.subScreen = '';
  hideOverlay();
  HUD.classList.remove('on'); TOUCH.classList.remove('on'); PAUSEBTN.classList.remove('on');
  Input.sx = G.W / 2; Input.sy = G.H * 0.5;
  def.init(G.mini, miniGeom());
  return true;
}
function updateMini(dt){
  const m = G.mini; G.time += dt;
  if (!m) return;
  if (dt > 0.05) dt = 0.05;
  miniReadInput(m);
  if (m.in.pJump) m.jumpAt = m.time;                                          /* remembered for a moment, so a press just before landing still counts */
  for (let i = m.pops.length - 1; i >= 0; i--){ m.pops[i].t += dt; if (m.pops[i].t > 0.9) m.pops.splice(i, 1); }
  miniFxUpdate(m, dt);
  if (G.shake > 0) G.shake = Math.max(0, G.shake - dt * 46);
  if (G.flash){ G.flash.t += dt; if (G.flash.t >= G.flash.dur) G.flash = null; }
  if (m.phase === 'intro'){
    m.t += dt;
    if (m.t > 0.6 && (m.in.pAct || m.in.pClick || m.in.pJump)){ m.phase = 'play'; m.t = 0; SFX.level(); }
    return;
  }
  if (m.phase === 'cele'){ miniCeleUpdate(m, dt); return; }
  if (m.phase !== 'play') return;
  const sdt = dt * (typeof miniTimeScale === 'function' ? miniTimeScale(m) : 1);       /* the last second of a win runs in slow motion */
  m.time += sdt;
  m.def.update(m, sdt, miniGeom());
  if (typeof miniJuice === 'function') miniJuice(m, dt);
  if (m.def.dur && m.time >= m.def.dur) m.over = true;
  if (m.over) endMini(false);
}
/* a jump pressed up to win seconds ago that has not been used yet (jump buffering); use miniJumpUse() when it is spent */
function miniJumpBuffered(m, win){ return m.jumpAt !== undefined && m.time - m.jumpAt <= win; }
function miniJumpUse(m){ m.jumpAt = -99; }
function miniHeartsText(n){ let s = ''; for (let i = 0; i < n; i++) s += '\u2665 '; return s.trim(); }
function renderMini(ctx){
  const m = G.mini; if (!m) return;
  const g = miniGeom(), W = g.W, s = g.s;
  ctx.save();
  if (G.shake > 0.5 && !Settings.calmFlash){ ctx.translate(rand(-G.shake, G.shake) * 0.5, rand(-G.shake, G.shake) * 0.5); }
  m.def.draw(ctx, m, g);
  miniFxDraw(ctx, m);
  ctx.restore();
  if (m.phase === 'play' && bagEquipped()){ const f = m.focus || { x: Input.sx, y: Input.sy }; drawBagVision(ctx, f.x, f.y); }      /* seen through the paper bag; the bar and score stay clear */
  if (m.phase !== 'intro') miniVignette(ctx, g.W, g.H, 0.38);
  if (G.flash && G.flash.t < G.flash.dur){ ctx.globalAlpha = G.flash.a * (1 - G.flash.t / G.flash.dur) * 0.6; ctx.fillStyle = G.flash.color; ctx.fillRect(0, 0, g.W, g.H); ctx.globalAlpha = 1; }
  for (let i = 0; i < m.pops.length; i++){ const p = m.pops[i]; ctx.globalAlpha = 1 - p.t / 0.9; miniText(ctx, p.txt, p.x, p.y - p.t * 40 * s, 17 * s, p.col); ctx.globalAlpha = 1; }
  if (typeof miniHud === 'function') miniHud(ctx, m, g);                                  /* the bar along the top (44l) */
  else {
    ctx.fillStyle = 'rgba(14,10,8,.55)'; ctx.fillRect(0, 0, W, 46 * s);
    miniText(ctx, m.def.name, 14 * s, 29 * s, 19 * s, '#FFE9A0', 'left');
    const sc = m.def.hudText ? m.def.hudText(m) : m.score + ' / ' + m.goal + ' ' + (m.def.unit || '');
    miniText(ctx, sc, W - 14 * s, 29 * s, 19 * s, '#FFFFFF', 'right');
    if (m.lives > 0 && m.phase === 'play') miniText(ctx, miniHeartsText(m.lives), W / 2, 29 * s, 20 * s, '#FF6A5A');
    if (m.def.dur){
      const k = clamp(1 - m.time / m.def.dur, 0, 1);
      ctx.fillStyle = 'rgba(255,255,255,.18)'; ctx.fillRect(0, 46 * s, W, 5 * s);
      ctx.fillStyle = k < 0.25 ? '#FF6A5A' : '#FFD84D'; ctx.fillRect(0, 46 * s, W * k, 5 * s);
    }
  }
  if (m.phase === 'intro') miniIntro(ctx, m, g);
  if (typeof miniRewardsDraw === 'function') miniRewardsDraw(ctx, m, g);                  /* stars, best score, edge flash, the celebration (44k) */
}
/* ---- the how-to-play card: the keys to press (the keys she has bound, plus the arrows), and what the mouse or a finger does ---- */
const MINI_CTL = {
  1: { keys: [['move', 'Walk']], ptr: 'Hold the mouse button or a finger down: she walks toward it.' },
  2: { keys: [['move', 'Steer (there are no brakes)']], ptr: 'Hold the mouse button or a finger down: she is pulled toward it.' },
  3: { keys: [[['left', 'right'], 'Hop left or right'], [['Space', 'up'], 'Hop forward']], ptr: 'Click or tap the left, middle or right of the screen to hop left, forward or right.' },
  4: { keys: [[['Space', 'up'], 'Jump']], ptr: 'Click or tap anywhere to jump.' },
  5: { keys: [[['Space', 'up'], 'Hold to grab a vine, let go to fly']], ptr: 'Hold the mouse button or a finger down to grab a vine; let go to fly.' },
  6: { keys: [[['Space', 'up'], 'Jump (hold for higher)']], ptr: 'Click or tap to jump; hold for a higher jump.' },
  7: { keys: [['move', 'Fly the ship']], ptr: 'Hold the mouse button or a finger down: the ship follows it.' },
  8: { keys: [[['left', 'right'], 'Drift left or right'], [['Space', 'up'], 'Hold as you land: a much bigger bounce']], ptr: 'Hold on the left or right to drift that way; keep holding as you land for a big bounce.' },
  9: { keys: [['move', 'Walk']], ptr: 'Hold the mouse button or a finger down: she walks toward it.' },
  10: { keys: [['move', 'Walk and ride the stones']], ptr: 'Hold the mouse button or a finger down: she walks toward it.' },
  11: { keys: [[['1', '2', '3', '4', '5'], 'Play back the crystals, left to right']], ptr: 'Click or tap the crystals in the order they lit up.' },
  12: { keys: [[['up', 'left', 'down', 'right'], 'Move the highlight'], [['Space'], 'Turn the tile']], ptr: 'Click or tap a tile to turn it.' },
  13: { keys: [['move', 'Steer']], ptr: 'Hold the mouse button or a finger down: she runs toward it.' }
};
function miniCapName(tok){
  const bound = { left: 'left', right: 'right', up: 'up', down: 'down' };
  if (bound[tok]) return keyName(keyOf(tok));
  return tok;
}
const MINI_ARROW = { left: '\u2190', right: '\u2192', up: '\u2191', down: '\u2193' };
function miniCapW(ctx, label, s){ ctx.font = 'bold ' + Math.round(13 * s) + 'px system-ui, sans-serif'; return Math.max(26 * s, ctx.measureText(label).width + 14 * s); }
function miniCap(ctx, label, x, y, s){                         /* a keyboard key, x is its left edge and y the middle */
  const w = miniCapW(ctx, label, s), h = 26 * s;
  ctx.fillStyle = '#15100C'; ctx.beginPath(); ctx.roundRect(x, y - h / 2 + 2, w, h, 5); ctx.fill();
  ctx.fillStyle = '#EFE6D4'; ctx.beginPath(); ctx.roundRect(x, y - h / 2, w, h, 5); ctx.fill();
  ctx.fillStyle = '#2A1E10'; ctx.font = 'bold ' + Math.round(13 * s) + 'px system-ui, sans-serif'; ctx.textAlign = 'center'; ctx.fillText(label, x + w / 2, y + 4.5 * s);
  return w;
}
function miniIntro(ctx, m, g){
  const W = g.W, H = g.H, s = Math.max(g.s, 0.8), def = m.def, ctl = MINI_CTL[m.ch] || { keys: [], ptr: '' };
  ctx.fillStyle = 'rgba(10,7,5,.78)'; ctx.fillRect(0, 0, W, H);
  let y = Math.max(34, H * 0.08);
  miniText(ctx, 'AFTER CHAPTER ' + m.ch, W / 2, y, 14 * s, '#C9B890'); y += 40 * s;
  miniText(ctx, def.name, W / 2, y, Math.max(26, Math.min(44 * s, W * 0.08)), '#FFE9A0'); y += 14 * s;
  const ls = Math.max(20, 22 * s);
  def.blurb.split('\n').forEach(function(ln){ y += ls; miniText(ctx, ln, W / 2, y, 15 * s, '#FFFFFF', 'center', false); });
  y += ls * 0.9;
  /* keyboard rows: caps for the keys, then what they do */
  miniText(ctx, 'KEYBOARD', W / 2, y, 12.5 * s, '#C9B890'); y += ls * 0.95;
  ctl.keys.forEach(function(row){
    let groups = [];                                            /* alternatives (her bound keys, then the arrows) are joined by 'or' */
    if (row[0] === 'move'){ groups = [['up', 'left', 'down', 'right'].map(miniCapName), ['up', 'left', 'down', 'right'].map(function(k){ return MINI_ARROW[k]; })]; }
    else {
      const toks = row[0];
      const main = toks.map(function(k){ return k === 'Space' ? 'Space' : miniCapName(k); });
      groups = [main];
      const arr2 = toks.map(function(k){ return MINI_ARROW[k] && k !== 'Space' ? MINI_ARROW[k] : null; }).filter(Boolean);
      if (arr2.length) groups.push(arr2);
    }
    /* measure the row so it can be centered */
    const gap = 5 * s, orW = 26 * s;
    let tw = 0; ctx.font = 'bold ' + Math.round(13 * s) + 'px system-ui, sans-serif';
    groups.forEach(function(gr, gi){ gr.forEach(function(c){ tw += miniCapW(ctx, c, s) + gap; }); if (gi < groups.length - 1) tw += orW; });
    ctx.font = Math.round(15 * s) + 'px system-ui, sans-serif';
    const dw = ctx.measureText(row[1]).width;
    let x = Math.max(8, (W - (tw + 14 * s + dw)) / 2);
    groups.forEach(function(gr, gi){
      gr.forEach(function(c){ x += miniCap(ctx, c, x, y, s) + gap; });
      if (gi < groups.length - 1){ ctx.fillStyle = '#C9B890'; ctx.font = Math.round(13 * s) + 'px system-ui, sans-serif'; ctx.textAlign = 'center'; ctx.fillText('or', x + orW / 2 - gap, y + 4.5 * s); x += orW; }
    });
    ctx.textAlign = 'left'; ctx.fillStyle = '#FFFFFF'; ctx.font = Math.round(15 * s) + 'px system-ui, sans-serif'; ctx.fillText(row[1], x + 10 * s, y + 5 * s);
    y += 34 * s;
  });
  y += 2 * s;
  miniText(ctx, 'MOUSE OR TOUCH', W / 2, y, 12.5 * s, '#C9B890'); y += ls * 0.95;
  miniText(ctx, ctl.ptr, W / 2, y, 15 * s, '#FFFFFF', 'center', false); y += ls * 1.2;
  const tip = (def.hint || '').split('\n')[1];
  if (tip){ miniText(ctx, tip, W / 2, y, 14 * s, '#E8D8B0', 'center', false); y += ls; }
  miniText(ctx, def.goalText ? def.goalText : 'Goal: ' + m.goal + ' ' + (def.unit || '') + (def.dur ? ' in ' + def.dur + ' seconds' : ''), W / 2, y, 15 * s, '#BFFF9A', 'center', false); y += ls * 1.5;
  miniText(ctx, 'Press Space, click or tap to begin  \u00b7  Esc to skip', W / 2, y, 16 * s, '#FFD84D');
}/* Esc: before it has begun this simply declines (and gives the cooldown back); once it has begun it ends it as a loss, with no wheel */
function miniEscape(){
  const m = G.mini; if (!m || m.phase === 'done') return;
  if (m.phase === 'cele'){ miniCeleDone(m); return; }
  if (m.phase === 'intro'){
    const md = miniData(); md.last = m.prevLast; md.plays = Math.max(0, md.plays - 1); Save.write();
    miniFinish(); return;
  }
  endMini(true);
}
function endMini(abandon){
  const m = G.mini; if (!m || m.phase === 'done' || m.phase === 'cele') return;
  m.phase = 'done';
  const md = miniData(), def = m.def;
  m.won = !abandon && (def.win ? !!def.win(m) : m.score >= m.goal);
  m.abandon = !!abandon;
  m.prevBest = md.best[m.ch] | 0;
  m.newBest = m.score > m.prevBest;
  md.best[m.ch] = Math.max(m.prevBest, m.score);                                    /* the score is kept whether she won or lost */
  m.stars = (!abandon && typeof miniStarsOf === 'function') ? miniStarsOf(m) : (m.won ? 1 : 0);
  m.prevStars = md.stars[m.ch] | 0;
  m.newStars = Math.max(0, m.stars - m.prevStars);
  md.stars[m.ch] = Math.max(m.prevStars, m.stars);
  m.starGems = m.newStars * 20;                                                     /* each star level is paid for once per minigame */
  if (m.starGems) Save.data.gems = (Save.data.gems | 0) + m.starGems;
  m.prize = abandon ? null : miniRoll(m.stars);
  if (m.prize) miniAward(m.prize);
  Save.write();
  if (!abandon && typeof miniCeleStart === 'function'){ miniCeleStart(m); return; }  /* a short celebration, then the result and the wheel */
  showMiniResult();
}
/* one roll of the wheel: the item is chosen first (so closing the game mid-spin loses nothing), the spin then lands on it.
   More stars make the rare hat likelier, and from two stars a duplicate is rolled again (once, then twice at three stars). */
function miniRoll(stars){
  stars = stars | 0;
  const sl = typeof miniSlicesFor === 'function' ? miniSlicesFor(stars) : ACC_SLICES;
  const draw = function(){
    const r = Math.random();
    for (let i = 0; i < sl.length; i++) if (r < sl[i].a1) return sl[i];
    return sl[sl.length - 1];
  };
  let s = draw(), again = Math.max(0, stars - 1), rerolls = 0;
  while (again > 0 && accOwned(s.item.id)){ again--; rerolls++; s = draw(); }
  return { item: s.item, u: lerp(s.a0, s.a1, 0.2 + 0.6 * Math.random()), dupe: false, gems: 0, wasEmpty: false, slices: sl, rerolls: rerolls, stars: stars };
}
function miniAward(pz){
  const md = miniData(), it = pz.item;
  pz.dupe = !!md.own[it.id];
  md.own[it.id] = (md.own[it.id] | 0) + 1;
  if (pz.dupe){ pz.gems = it.rare ? 100 : 25; Save.data.gems = (Save.data.gems | 0) + pz.gems; }
  const slot = it.kind === 'boot' ? 'boot' : 'hat';
  if (!md[slot]){ md[slot] = it.id; pz.wasEmpty = true; }                          /* the first of each is put on straight away */
}

/* ---- the popup after a chapter ---- */
function miniCdText(){ const ms = miniReadyIn(); return ms > 0 ? 'Ready in ' + fmtClock(ms) : 'Ready'; }
function miniOffer(ch, proceed){
  const def = MINI[ch];
  if (!def || G.attract) return false;
  G.miniThen = proceed; G.miniCh = ch; G.mini = null;
  G.state = 'miniask'; G.subScreen = '';
  const next = ch === TOWER_CHAPTER ? 'the end of the run' : BESTIARY_CHAPTERS[ch] || 'the next chapter', best = miniData().best[ch];
  const ready = miniReadyIn() <= 0;
  setOverlay(
    '<div class="panel slab" style="max-width:500px">' +
      '<h2 class="head">Chapter ' + chapterLabel(ch) + ' complete</h2>' +
      '<p class="sub">Before moving on: <b>' + def.name + '</b>. ' + def.blurb.replace(/\n/g, ' ') + '</p>' +
      '<p class="sub" style="margin-top:0">Finish it for a spin of the wheel: a hat, boots or, rarely, a very special hat for the giraffe. Win it, and earn up to three stars for better odds.' + (best ? ' Your best here: <b>' + best + '</b>.' : '') + '</p>' +
      (typeof tipOnce === 'function' ? tipOnce('offer', 'Stars: win the minigame for one star, and reach the two harder targets for the second and third. More stars give better odds at the rare hats, and three stars in a minigame unlocks its own coat color.') : '') +
      '<div class="menucol" style="margin-top:6px;width:100%">' +
        '<button class="btn" data-a="mini-go" data-mini-play' + (ready ? '' : ' disabled') + '>Play the minigame<small data-mini-cd>' + miniCdText() + '</small></button>' +
        '<button class="btn ghost" data-a="mini-skip">' + (ch === TOWER_CHAPTER ? 'See the results' : 'Start Chapter ' + chapterLabel(ch + 1)) + '<small>' + next + '</small></button>' +
      '</div>' +
    '</div>');
  return true;
}

/* ---- the result and the wheel ---- */
let _wheel = null;
function showMiniResult(){
  const m = G.mini, def = m.def, md = miniData();
  const nextLabel = m.then ? (m.ch === TOWER_CHAPTER ? 'See the results' : 'Start Chapter ' + chapterLabel(m.ch + 1)) : G.townReturn ? 'Back to town' : 'Back to the menu';
  const starLine = (m.abandon || typeof miniStarsHTML !== 'function') ? '' : miniStarsHTML(m);
  setOverlay(
    '<div class="panel slab" style="max-width:480px">' +
      '<h2 class="head">' + (m.abandon ? 'Stopped early' : m.won ? 'Well done!' : (def.loseText || 'Not this time')) + '</h2>' + starLine + (m.prize && typeof tipOnce === 'function' ? tipOnce('result', 'The wheel gives a hat, boots or a rare hat. A duplicate pays gems instead. Everything you win can be worn from the Wardrobe or the Collection, and hats and boots can be recoloured there.') : '') +
      '<p class="sub">' + def.name + ': <b>' + (def.hudText ? def.hudText(m) : m.score + ' ' + (def.unit || '')) + '</b>' +
        (m.abandon || m.won || !(m.goal > 0) ? '' : ' (goal ' + m.goal + ')') + '. ' +
        (m.newBest ? 'A new best score' + (m.prevBest ? ' (was ' + m.prevBest + ')' : '') + '. ' : 'Your best is ' + (md.best[m.ch] | 0) + '. ') + 'The score is saved.' + '</p>' +
      (m.prize ? '<canvas id="miniWheel" width="300" height="300" style="display:block;margin:4px auto;max-width:100%"></canvas><div id="miniPrize" class="sub" style="min-height:92px">Spinning the wheel\u2026</div>' : '') +
      '<div class="row" id="miniBtns"' + (m.prize ? ' style="visibility:hidden"' : '') + '>' +
        '<button class="btn sm" data-a="mini-done">' + nextLabel + '</button>' +
      '</div>' +
    '</div>');
  if (m.prize) _wheel = { t: 0, dur: 4.6, rot: 0, end: (5 + 1 - m.prize.u) * TAU, last: -1, landed: false, slices: m.prize.slices || ACC_SLICES };
  else _wheel = null;
  if (_wheel) drawMiniWheel(0);
}
function drawMiniWheel(rot){
  const cv = document.getElementById('miniWheel'); if (!cv) return;
  const c = cv.getContext('2d'), W = cv.width, cx = W / 2, cy = W / 2 + 6, R = W / 2 - 18;
  c.clearRect(0, 0, W, W);
  c.save(); c.translate(cx, cy);
  c.fillStyle = '#1A130E'; c.beginPath(); c.arc(0, 0, R + 8, 0, TAU); c.fill();
  c.save(); c.rotate(rot);
  const SL = (_wheel && _wheel.slices) || ACC_SLICES;
  for (let i = 0; i < SL.length; i++){
    const sl = SL[i], a0 = sl.a0 * TAU - Math.PI / 2, a1 = sl.a1 * TAU - Math.PI / 2;
    c.fillStyle = sl.item.c; c.beginPath(); c.moveTo(0, 0); c.arc(0, 0, R, a0, a1); c.closePath(); c.fill();
    c.strokeStyle = 'rgba(20,14,10,.8)'; c.lineWidth = 1.2; c.stroke();
    if (sl.a1 - sl.a0 > 0.025){
      const am = (a0 + a1) / 2; c.save(); c.translate(Math.cos(am) * R * 0.72, Math.sin(am) * R * 0.72); c.rotate(am + Math.PI / 2);
      drawAccIcon(c, sl.item, 0, 0, sl.a1 - sl.a0 > 0.05 ? 0.9 : 0.6, 0); c.restore();
    }
  }
  c.restore();
  c.strokeStyle = '#FFD84D'; c.lineWidth = 4; c.beginPath(); c.arc(0, 0, R + 1, 0, TAU); c.stroke();
  c.fillStyle = '#FFD84D'; c.beginPath(); c.arc(0, 0, 14, 0, TAU); c.fill(); c.fillStyle = '#7A4A10'; c.beginPath(); c.arc(0, 0, 7, 0, TAU); c.fill();
  c.restore();
  c.fillStyle = '#FF5A3C'; c.strokeStyle = '#FFF6E0'; c.lineWidth = 2;                                    /* the pointer at the top */
  c.beginPath(); c.moveTo(cx - 12, 2); c.lineTo(cx + 12, 2); c.lineTo(cx, 36); c.closePath(); c.fill(); c.stroke();
}
function miniSliceAt(rot){
  const u = (((-rot / TAU) % 1) + 1) % 1;
  const SL = (_wheel && _wheel.slices) || ACC_SLICES;
  for (let i = 0; i < SL.length; i++) if (u < SL[i].a1) return i;
  return SL.length - 1;
}
function miniWheelTick(dt){
  const w = _wheel; if (!w || w.landed || !G.mini || !G.mini.prize) return;
  w.t += dt;
  const k = clamp(w.t / w.dur, 0, 1), e = 1 - Math.pow(1 - k, 4);
  w.rot = w.end * e;
  const idx = miniSliceAt(w.rot);
  if (idx !== w.last){ if (w.last >= 0){ try { SFX.tone('square', 520 + (idx % 7) * 38, 520 + (idx % 7) * 38, 0.03, 0.05, 0, 0, SFX.abilityGain); } catch (er) {} } w.last = idx; }
  drawMiniWheel(w.rot);
  if (k >= 1){
    w.landed = true;
    const pz = G.mini.prize, it = pz.item, el = document.getElementById('miniPrize');
    try { it.rare ? SFX.transform() : SFX.level(); } catch (er) {}
    if (el){
      el.innerHTML = '<canvas id="miniPrizeArt" width="150" height="86" style="display:block;margin:0 auto"></canvas>' +
        '<b style="color:' + (it.rare ? '#FFD84D' : '#FFE9A0') + '">' + (it.rare ? 'RARE: ' : '') + it.name + '</b>' +
        (pz.rerolls ? '<br><span style="font-size:13px;color:#BFFF9A">Lucky: ' + (pz.rerolls > 1 ? pz.rerolls + ' duplicates were' : 'a duplicate was') + ' rolled again.</span>' : '') +
        (pz.dupe ? '<br><span style="font-size:13px">You already had it: +' + pz.gems + ' gems instead.</span>' : pz.wasEmpty ? '<br><span style="font-size:13px">She is wearing it now.</span>' : '<br><span style="font-size:13px">New for the wardrobe.</span>');
      const pc = document.getElementById('miniPrizeArt');
      if (pc){ const q = pc.getContext('2d'); q.save(); q.translate(75, 44); if (it.kind === 'boot') q.translate(0, -2); drawAccIcon(q, it, 0, 0, 3.4, 0); q.restore(); }
    }
    const bt = document.getElementById('miniBtns');
    if (bt){
      const md = miniData(), slot = it.kind === 'boot' ? 'boot' : 'hat';
      if (md[slot] !== it.id) bt.insertAdjacentHTML('afterbegin', '<button class="btn sm ghost" data-a="mini-wear">Wear it</button>');
      bt.style.visibility = 'visible';
    }
  }
}
function miniFinish(){
  const m = G.mini; if (!m) return;
  const then = m.then; G.mini = null; _wheel = null;
  if (then){ hideOverlay(); if (typeof marsRestoreHUD === 'function') marsRestoreHUD(); then(); }
  else { startAttract(); showMenu(); }
}

/* ---- the minigames list, from the main menu ---- */
function miniButtonHTML(){
  return '<button class="btn ghost" data-a="mini-menu">Minigames<small>' + accOwnedCount() + ' of ' + ACC_ITEMS.length + ' hats and boots won</small></button>';
}
function showMiniMenu(){
  G.state = 'help'; G.attract = true; G.subScreen = 'minis';
  const md = miniData();
  let rows = '';
  for (let ch = 1; ch <= TOTAL_CHAPTERS; ch++){
    const d = MINI[ch]; if (!d) continue;
    const un = miniUnlocked(ch), b = md.best[ch] | 0;
    rows += '<div class="minirow' + (un ? '' : ' locked') + '"><div class="mrn"><b>' + d.name + '</b><span>After Chapter ' + chapterLabel(ch) + ' \u00b7 ' + BESTIARY_CHAPTERS[ch - 1] + '</span>' +
      '<span>' + (un ? (b ? 'Best: ' + b : 'Not played yet') + (md.stars[ch] ? ' · <b style="color:#FFD84D">' + '★'.repeat(md.stars[ch]) + '<span style="opacity:.3">' + '★'.repeat(3 - md.stars[ch]) + '</span></b>' : '') + (md.stars[ch] >= 3 && WARD[miniWardOf(ch)] ? ' <span title="' + WARD[miniWardOf(ch)].name + '" style="display:inline-block;width:11px;height:11px;border-radius:50%;vertical-align:-1px;background:' + WARD[miniWardOf(ch)].c + ';border:1px solid #fff"></span>' : '') : 'Finish Chapter ' + chapterLabel(ch) + ' to unlock') + '</span></div>' +
      '<button class="btn sm' + (un ? '' : ' ghost') + '" data-a="mini-start-' + ch + '" data-mini-play' + (un ? '' : ' data-mini-lock disabled') + '>' + (un ? 'Play' : 'Locked') + '</button></div>';
  }
  setOverlay(
    '<div class="panel slab wide" style="max-width:560px">' +
      '<h2 class="head">Minigames</h2>' +
      '<p class="sub">One after each chapter. Every one you finish spins the wheel: 65% a hat, 30% boots, 5% a rare hat. Win it and earn stars for better odds at the rare hats. Stars: <b>' + miniStarTotal() + ' of ' + MINI_STAR_CHAPTERS.length * 3 + '</b>. One play every two minutes: <b data-mini-cd>' + miniCdText() + '</b></p>' +
      '<div class="minilist">' + rows + '</div>' +
      '<div class="row" style="margin-top:14px"><button class="btn sm ghost" data-a="mini-collection">Collection (' + accOwnedCount() + ' of ' + ACC_ITEMS.length + ')</button><button class="btn sm ghost" data-a="wardrobe">Wardrobe</button><button class="btn sm" data-a="mini-back">Back</button></div>' +
    '</div>');
}
function handleMiniAction(a){
  if (a === 'mini-menu'){ SFX.click(); showMiniMenu(); return true; }
  if (a === 'mini-back'){ SFX.click(); showMenu(); return true; }
  if (typeof handleCollAction === 'function' && handleCollAction(a)) return true;           /* the collection screen (44k) */
  if (a === 'mini-go'){ if (startMini(G.miniCh, G.miniThen, 'chapter')) SFX.click(); return true; }       /* on cooldown the button is disabled and this does nothing */
  if (a === 'mini-skip'){ SFX.click(); const go = G.miniThen; G.miniThen = null; if (go){ hideOverlay(); go(); } return true; }
  if (a === 'mini-done'){ SFX.click(); miniFinish(); return true; }
  if (a === 'mini-wear'){
    const m = G.mini, it = m && m.prize ? m.prize.item : null;
    if (it){ accWear(it.kind, it.id); SFX.pick(); const b = document.querySelector('[data-a="mini-wear"]'); if (b) b.remove(); }
    return true;
  }
  const mm = /^mini-start-(\d+)$/.exec(a);
  if (mm){ const ch = +mm[1]; if (!miniUnlocked(ch)){ SFX.deny(); return true; } if (startMini(ch, null, 'menu')) SFX.click(); return true; }
  return false;
}

/* ---- wardrobe rows for hats and boots (shown by 44e-wardrobe.js) ---- */
function accRowsHTML(){
  const md = miniData();
  const row = function(kind, label, list){
    const cur = md[kind];
    let h = '<div class="sub" style="margin:12px 0 4px;font-weight:700;color:var(--sun)">' + label + ': ' + (cur && ACC_BY_ID[cur] ? ACC_BY_ID[cur].name : 'None') + '</div><div class="swatches">';
    h += '<button class="swatch pat' + (cur ? '' : ' on') + '" data-a="ward-' + kind + '-none" title="None" aria-label="None">\u2205</button>';
    list.forEach(function(it){
      const own = !!md.own[it.id];
      h += '<button class="swatch pat' + (cur === it.id ? ' on' : '') + (own ? '' : ' locked') + '" data-a="ward-' + kind + '-' + it.id + '"' + (own ? '' : ' disabled') +
        ' title="' + (own ? it.name : it.town ? 'Hidden in Longneck Town' : 'Win this from a minigame wheel') + '" aria-label="' + it.name + '">' +
        (own ? '<canvas width="30" height="30" data-acc="' + it.id + '"></canvas>' : '?') + '</button>';
    });
    return h + '</div>' + (typeof accColourRowHTML === 'function' ? accColourRowHTML(kind) : '');
  };
  return row('hat', 'Hat', ACC.hats.concat(ACC.rare, ACC.townHats || [])) + row('boot', 'Boots', ACC.boots.concat(ACC.townBoots || []));
}
function paintAccIcons(){
  const cs = document.querySelectorAll('canvas[data-acc]');
  for (let i = 0; i < cs.length; i++){
    const it = ACC_BY_ID[cs[i].getAttribute('data-acc')]; if (!it) continue;
    const q = cs[i].getContext('2d'); q.clearRect(0, 0, 30, 30);
    drawAccIcon(q, it, 15, it.kind === 'boot' ? 14 : 16, it.kind === 'boot' ? 1.05 : 0.95, 0);
  }
}
function handleAccAction(a){
  if (typeof handleExtraAction === 'function' && handleExtraAction(a)) return true;       /* accessory colors and the photo screen (44m) */
  const m = /^ward-(hat|boot)-([a-z0-9]+)$/.exec(a);
  if (!m) return false;
  if (m[2] === 'none'){ accWear(m[1], ''); SFX.click(); }
  else if (accOwned(m[2]) && ACC_BY_ID[m[2]] && ACC_BY_ID[m[2]].kind === m[1]){ accWear(m[1], m[2]); SFX.pick(); }
  else SFX.deny();
  if (typeof showWardrobe === 'function') showWardrobe();
  return true;
}

/* ---- keep the countdowns and the wheel moving (called every frame from step) ---- */
(function(){
  const tick = Feedback.tick;
  let cdT = 0;
  Feedback.tick = function(dt){
    tick.call(this, dt);
    miniWheelTick(dt);
    cdT -= dt;
    if (cdT > 0) return;
    cdT = 0.25;
    const labels = document.querySelectorAll('[data-mini-cd]');
    if (!labels.length) return;
    const txt = miniCdText(), ready = miniReadyIn() <= 0;
    for (let i = 0; i < labels.length; i++) if (labels[i].textContent !== txt) labels[i].textContent = txt;
    const btns = document.querySelectorAll('[data-mini-play]');
    for (let i = 0; i < btns.length; i++) btns[i].disabled = !ready || btns[i].hasAttribute('data-mini-lock');
  };
})();

/* ---- the paper bag: she can hardly see ----
   While the Paper Bag is worn, everything on the canvas is seen through brown paper: multiplied by a crinkled paper texture, then
   almost black except a small soft window around her. Only the canvas is affected; menus and cards stay clear. */
let _bagTex = null;
function bagTexture(){
  if (_bagTex) return _bagTex;
  const S = 512, cv = document.createElement('canvas'); cv.width = cv.height = S;
  const c = cv.getContext('2d'), R = miniRng(4242);
  c.fillStyle = '#C9A06A'; c.fillRect(0, 0, S, S);
  for (let i = 0; i < 1800; i++){                                         /* mottling */
    const x = R() * S, y = R() * S, r = 2 + R() * 11;
    c.fillStyle = R() < 0.5 ? 'rgba(70,42,14,' + (0.05 + R() * 0.12) + ')' : 'rgba(240,210,150,' + (0.05 + R() * 0.12) + ')';
    c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill();
  }
  c.lineCap = 'round';
  for (let i = 0; i < 2600; i++){                                         /* fibres */
    const x = R() * S, y = R() * S, a = R() * TAU, l = 3 + R() * 10;
    c.strokeStyle = R() < 0.55 ? 'rgba(250,225,170,' + (0.25 + R() * 0.4) + ')' : 'rgba(60,34,10,' + (0.15 + R() * 0.3) + ')';
    c.lineWidth = 0.6 + R() * 0.9; c.beginPath(); c.moveTo(x, y); c.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); c.stroke();
  }
  for (let k = 0; k < 18; k++){                                           /* creases: a dark line with a light edge beside it */
    let x = R() * S, y = R() * S; const a0 = R() * TAU, pts = [[x, y]];
    for (let s2 = 0; s2 < 9; s2++){ const a = a0 + (R() - 0.5) * 0.9; x += Math.cos(a) * 34; y += Math.sin(a) * 34; pts.push([x, y]); }
    for (let pass = 0; pass < 2; pass++){
      c.save(); if (pass) c.translate(1.6, 1.6);
      c.strokeStyle = pass ? 'rgba(255,232,180,.55)' : 'rgba(45,25,6,.7)'; c.lineWidth = pass ? 1 : 1.7; c.beginPath();
      pts.forEach(function(q, i){ if (i) c.lineTo(q[0], q[1]); else c.moveTo(q[0], q[1]); }); c.stroke(); c.restore();
    }
  }
  _bagTex = cv; return cv;
}
function bagEquipped(){ const h = accEquipped('hat'); return !!(h && h.id === 'bag'); }
function drawBagVision(ctx, fx, fy){
  const W = G.W, H = G.H, t = G.time, r = 64 + Math.sin(t * 2.1) * 5;            /* she breathes in the bag */
  ctx.setTransform(G.dpr, 0, 0, G.dpr, 0, 0);
  ctx.globalAlpha = 1;
  const pat = ctx.createPattern(bagTexture(), 'repeat');
  ctx.save(); ctx.translate(Math.sin(t * 0.7) * 2, Math.cos(t * 0.9) * 2);
  ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = pat; ctx.fillRect(-4, -4, W + 8, H + 8);
  ctx.restore();
  ctx.globalCompositeOperation = 'source-over';
  const gr = ctx.createRadialGradient(fx, fy, r * 0.2, fx, fy, r * 2.1);
  gr.addColorStop(0, 'rgba(60,34,10,0.12)'); gr.addColorStop(0.4, 'rgba(38,21,6,0.8)'); gr.addColorStop(1, 'rgba(20,10,3,0.96)');
  ctx.fillStyle = gr; ctx.fillRect(0, 0, W, H);
  ctx.globalAlpha = 0.28; ctx.fillStyle = pat; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1;      /* the paper again, so its grain shows even in the dark */
}
(function(){
  const inner = render;
  render = function(){
    inner();
    if (!CTX || !bagEquipped()) return;
    const s = G.state; let fx, fy;
    if ((s === 'playing' || s === 'levelup' || s === 'transform' || s === 'paused') && !G.attract){
      fx = (P.x - G.camX) * G.zoom + G.W / 2; fy = (P.y - G.camY) * G.zoom + G.H / 2;
    } else return;
    drawBagVision(CTX, fx, fy);
  };
})();
