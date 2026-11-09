'use strict';
/* ADD-ON "Challenge Workshop" (id: challenges), part 1 of 3: registers the add-on, and holds the recipes, their checks, seeded randomness, the share
   codes and the separate draft shelf (localStorage 'giraffe_rampage_challenges_v1', never the campaign save). Written by Codex on the branch
   codex/challenge-builder and moved here as an add-on: parts 2 (js/addons/50b-addon-challenge-play.js, the arena) and 3
   (js/addons/50c-addon-challenge-ui.js, the workshop) follow. Removing the add-on is deleting the three files and their script lines. */
addonRegister({ id: 'challenges', name: 'Challenge Workshop', tag: 'extra',
  desc: 'Build small arena challenges of your own: waves, walls, hazards, pickups, an objective and a fixed kit. Playtest them, then share a code with a friend. It has its own arena and never touches campaign progress or gold.',
  off: function(){ try { GRChallengePlay.stop(); } catch (e) {} try { GRChallengeUI.close(); } catch (e) {} } });

// Challenge recipes are separate from campaign saves. Never execute imported data.
var GRChallengeData = (function () {
  const KEY = 'giraffe_rampage_challenges_v1', MAX_CODE = 24000;
  /* the enemy kinds a recipe may use, with each one's body radius (the arena, 50b, uses the same radii; a unit test checks they agree).
     Flyers cross walls, so a blocked edge does not stop them. */
  const KINDS = ['chaser', 'runner', 'brute', 'spitter', 'flyer', 'charger', 'splitter', 'badger'];
  const KIND_R = { chaser: 15, runner: 11, brute: 23, spitter: 14, flyer: 13, charger: 19, splitter: 17, badger: 15 };
  const fail = message => { throw new Error(message); };
  const obj = (value, name) => value && typeof value === 'object' && !Array.isArray(value) ? value : fail(name + ' must be an object.');
  const num = (value, min, max, name, integer) => typeof value === 'number' && Number.isFinite(value) && value >= min && value <= max && (!integer || Number.isInteger(value)) ? value : fail(name + ' must be ' + min + '–' + max + (integer ? ' (whole number).' : '.'));
  const one = (value, choices, name) => choices.includes(value) ? value : fail('Unknown ' + name + '.');
  const color = (value, name) => typeof value === 'string' && /^#[0-9a-f]{6}$/i.test(value) ? value.toLowerCase() : fail(name + ' must be a six-digit hex colour (for example #6a7944).');
  function str(value, max, name, required) {
    if (typeof value !== 'string' || value.length > max || /[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(value)) fail(name + ' must be text of at most ' + max + ' characters.');
    value = value.trim();
    if (required && !value) fail(name + ' is required.');
    return value;
  }
  function defaults() {
    return { v: 1, title: 'My first rampage', author: '', description: 'A little challenge for a friend.', seed: 7081,
      arena: { width: 960, height: 640, theme: 'savanna' }, objective: { type: 'clear', target: 1 }, loadout: 'balanced',
      appearance: { time: 'day', weather: 'clear', detail: 1, palette: 'biome', colors: { ground: '#a89958', accent: '#c9b979', foliage: '#6a7944' } }, customAssets: [],
      modifiers: { speed: 1, enemyHp: 1, darkness: false, playerSpeed: 1, attackRate: 1 },
      waves: [{ delay: 0, enemies: [{ kind: 'chaser', count: 5, spawn: 'north' }] }], objects: [] };
  }
  // Whitelist-copy every field: extra properties cannot become runtime configuration.
  function validate(raw) {
    const r = obj(raw, 'Challenge');
    if (r.v !== 1) fail('This challenge format is not supported.');
    const a = obj(r.arena, 'Arena'), o = obj(r.objective, 'Objective'), m = obj(r.modifiers, 'Modifiers');
    const look = r.appearance === undefined ? {} : obj(r.appearance, 'Appearance');
    const colors = look.colors === undefined ? {} : obj(look.colors, 'Palette colours');
    if (a.width !== 960 || a.height !== 640) fail('Arena must be 960 × 640.');
    const level = { v: 1, title: str(r.title, 60, 'Title', true), author: str(r.author, 32, 'Author'), description: str(r.description, 280, 'Description'),
      seed: num(r.seed, 0, 4294967295, 'Seed', true), arena: { width: 960, height: 640, theme: one(a.theme, ['savanna', 'arctic', 'moon', 'forest', 'desert', 'swamp', 'volcanic'], 'theme') },
      objective: { type: one(o.type, ['clear', 'survive', 'collect', 'exit'], 'objective'), target: num(o.target, 1, 300, 'Objective target', true) },
      loadout: one(r.loadout, ['balanced', 'swift', 'tank'], 'loadout'),
      appearance: { time: one(look.time === undefined ? 'day' : look.time, ['day', 'sunset', 'night'], 'time of day'), weather: one(look.weather === undefined ? 'clear' : look.weather, ['clear', 'drizzle', 'snow'], 'weather'), detail: num(look.detail === undefined ? 1 : look.detail, 0, 2, 'Scenery detail', true), palette: one(look.palette === undefined ? 'biome' : look.palette, ['biome', 'autumn', 'pastel', 'dusk', 'custom'], 'palette'), colors: { ground: color(colors.ground === undefined ? '#a89958' : colors.ground, 'Ground colour'), accent: color(colors.accent === undefined ? '#c9b979' : colors.accent, 'Accent colour'), foliage: color(colors.foliage === undefined ? '#6a7944' : colors.foliage, 'Foliage colour') } },
      modifiers: { speed: num(m.speed, .5, 2, 'Speed'), enemyHp: num(m.enemyHp, .5, 3, 'Enemy health'), darkness: m.darkness, playerSpeed: num(m.playerSpeed === undefined ? 1 : m.playerSpeed, .5, 2, 'Player speed'), attackRate: num(m.attackRate === undefined ? 1 : m.attackRate, .5, 2, 'Attack rate') }, customAssets: [], waves: [], objects: [] };
    if (typeof m.darkness !== 'boolean') fail('Darkness must be on or off.');
    const assets = r.customAssets === undefined ? [] : r.customAssets;
    if (!Array.isArray(assets) || assets.length > 8) fail('Use at most eight custom object designs.');
    const assetIds = new Set();
    for (const rawAsset of assets) {
      const asset = obj(rawAsset, 'Custom object');
      if (typeof asset.id !== 'string' || !/^[a-z][a-z0-9_-]{0,15}$/.test(asset.id)) fail('Custom object IDs need 1–16 lowercase letters, numbers, dashes or underscores, starting with a letter.');
      if (assetIds.has(asset.id)) fail('Every custom object needs a different ID.');
      assetIds.add(asset.id);
      const solid = asset.solid === undefined ? false : asset.solid;
      if (typeof solid !== 'boolean') fail('Custom object solidity must be on or off.');
      if (!Array.isArray(asset.parts) || !asset.parts.length || asset.parts.length > 12) fail('Use 1–12 shapes per custom object.');
      level.customAssets.push({ id: asset.id, name: str(asset.name, 32, 'Custom object name', true), solid, parts: asset.parts.map(rawPart => {
        const part = obj(rawPart, 'Custom shape');
        const p = { shape: one(part.shape, ['rect', 'ellipse', 'triangle'], 'custom shape'), x: num(part.x, 0, 100, 'Shape x'), y: num(part.y, 0, 100, 'Shape y'), w: num(part.w, 1, 100, 'Shape width'), h: num(part.h, 1, 100, 'Shape height'), color: color(part.color, 'Shape colour'), rotation: num(part.rotation === undefined ? 0 : part.rotation, -180, 180, 'Shape rotation'), opacity: num(part.opacity === undefined ? 1 : part.opacity, 0, 1, 'Shape opacity'), stroke: color(part.stroke === undefined ? '#3a2b20' : part.stroke, 'Outline colour'), strokeWidth: num(part.strokeWidth === undefined ? 0 : part.strokeWidth, 0, 6, 'Outline width') };
        if (p.x + p.w > 100 || p.y + p.h > 100) fail('Keep shape boxes inside the 100 × 100 design.');
        return p;
      }) });
    }
    if (!Array.isArray(r.waves) || !r.waves.length || r.waves.length > 12) fail('Use 1–12 waves.');
    let total = 0;
    for (const wave of r.waves) {
      obj(wave, 'Wave');
      if (!Array.isArray(wave.enemies) || !wave.enemies.length || wave.enemies.length > 4) fail('Use 1–4 enemy groups per wave.');
      level.waves.push({ delay: num(wave.delay, 0, 30, 'Wave delay'), enemies: wave.enemies.map(group => {
        obj(group, 'Enemy group');
        const count = num(group.count, 1, 30, 'Enemy count', true); total += count;
        return { kind: one(group.kind, KINDS, 'enemy'), count, spawn: one(group.spawn, ['north', 'east', 'south', 'west'], 'spawn direction') };
      }) });
    }
    if (total > 240) fail('Use at most 240 enemies across the level.');
    if (!Array.isArray(r.objects) || r.objects.length > 48) fail('Use at most 48 arena objects.');
    for (const item of r.objects) {
      obj(item, 'Arena object');
      const p = { kind: one(item.kind, ['wall', 'hazard', 'coin', 'exit', 'tree', 'rock', 'banner', 'heal', 'custom'], 'arena object'), x: num(item.x, 0, 944, 'Object x'), y: num(item.y, 0, 624, 'Object y'), w: num(item.w, 16, 320, 'Object width'), h: num(item.h, 16, 320, 'Object height') };
      if (p.kind === 'custom') { if (!assetIds.has(item.asset)) fail('A custom object refers to a missing design.'); p.asset = item.asset; }
      if (p.x + p.w > 960 || p.y + p.h > 640) fail('Keep objects inside the arena.');
      if ((isSolid(level, p) || p.kind === 'hazard') && p.x < 504 && p.x + p.w > 456 && p.y < 344 && p.y + p.h > 296) fail('Keep the central player start clear.');
      level.objects.push(p);
    }
    if (level.objective.type === 'collect' && level.objects.filter(p => p.kind === 'coin').length < level.objective.target) fail('Place enough coins for the collection target.');
    if (level.objective.type === 'exit' && level.objects.filter(p => p.kind === 'exit').length !== 1) fail('Place exactly one exit for an escape challenge.');
    for (const p of level.objects.filter(p => p.kind === 'coin' || p.kind === 'exit' || p.kind === 'heal')) {
      if (level.objects.some(w => isSolid(level, w) && p.x < w.x + w.w && p.x + p.w > w.x && p.y < w.y + w.h && p.y + p.h > w.y)) fail('Pickups and exits cannot overlap a solid object.');
    }
    checkReachable(level);
    checkSpawns(level);
    return level;
  }
  /* every entrance a wave uses must have room along its edge for that enemy, or the wave could not arrive (the arena tries the same spots) */
  function checkSpawns(level) {
    const walls = level.objects.filter(p => isSolid(level, p)), seen = {};
    for (const wave of level.waves) for (const g of wave.enemies) {
      const r = KIND_R[g.kind], key = g.spawn + r;
      if (g.kind === 'flyer' || seen[key]) continue;
      seen[key] = 1;
      let room = false;
      for (let i = 0; i <= 45 && !room; i++) {
        const z = .05 + i * .02, x = g.spawn === 'west' ? r + 4 : g.spawn === 'east' ? 956 - r : 960 * z, y = g.spawn === 'north' ? r + 4 : g.spawn === 'south' ? 636 - r : 640 * z;
        room = !walls.some(w => { const dx = x - Math.max(w.x, Math.min(x, w.x + w.w)), dy = y - Math.max(w.y, Math.min(y, w.y + w.h)); return dx * dx + dy * dy < r * r; });
      }
      if (!room) fail('The ' + g.spawn + ' entrance is walled off for the ' + g.kind + '. Leave a gap along that edge.');
    }
  }
  function isSolid(level, item) { return item.kind === 'wall' || (item.kind === 'custom' && !!(level.customAssets || []).find(asset => asset.id === item.asset && asset.solid)); }
  // A small, conservative navigation grid includes player clearance. This catches
  // sealed rooms without claiming to prove that combat can be beaten.
  function checkReachable(level) {
    const targets = level.objects.filter(p => p.kind === 'coin' || p.kind === 'exit' || p.kind === 'heal');
    if (!targets.length) return;
    const walls = level.objects.filter(p => isSolid(level, p));
    const cols = 117, rows = 77, radius = 16, step = 8;
    const blocked = (x, y) => walls.some(w => {
      const dx = Math.max(w.x - x, 0, x - w.x - w.w), dy = Math.max(w.y - y, 0, y - w.y - w.h);
      return dx * dx + dy * dy < radius * radius;
    });
    const seen = new Uint8Array(cols * rows), queue = [38 * cols + 58];
    seen[queue[0]] = 1;
    const reached = new Set();
    for (let head = 0; head < queue.length; head++) {
      const at = queue[head], cx = at % cols, cy = Math.floor(at / cols), x = 16 + cx * step, y = 16 + cy * step;
      for (let i = 0; i < targets.length; i++) {
        const p = targets[i], dx = Math.max(p.x - x, 0, x - p.x - p.w), dy = Math.max(p.y - y, 0, y - p.y - p.h);
        if (dx * dx + dy * dy <= 15 * 15) reached.add(i);
      }
      for (const [nx, ny] of [[cx - 1, cy], [cx + 1, cy], [cx, cy - 1], [cx, cy + 1]]) {
        if (nx < 0 || ny < 0 || nx >= cols || ny >= rows) continue;
        const next = ny * cols + nx;
        if (seen[next]) continue;
        const px = 16 + nx * step, py = 16 + ny * step;
        // Midpoint prevents an eight-pixel step crossing a thin corner.
        if (blocked(px, py) || blocked((x + px) / 2, (y + py) / 2)) continue;
        seen[next] = 1; queue.push(next);
      }
    }
    if (reached.size !== targets.length) fail('A pickup or exit is sealed behind walls. Leave a reachable passage at least 40 pixels wide.');
  }
  function hash(text) {
    let h = 2166136261;
    for (let i = 0; i < text.length; i++) { h ^= text.charCodeAt(i); h = Math.imul(h, 16777619); }
    return (h >>> 0).toString(16).padStart(8, '0');
  }
  function fingerprint(level) { return hash(JSON.stringify(validate(level))); }
  function encode(level) {
    const json = JSON.stringify(validate(level)), bytes = new TextEncoder().encode(json);
    let binary = ''; for (const b of bytes) binary += String.fromCharCode(b);
    const code = 'GRC1:' + hash(json) + ':' + btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    if (code.length > MAX_CODE) fail('This design is too large to share. Remove a few custom shapes or arena objects and try again.');
    return code;
  }
  /* Share codes: "GRC3:" + the recipe packed with the game's GR3 compressor (GRSave in js/core/01b-savepack.js). If GR3 ever could not give the text
     back exactly, the code falls back to the plain GRC1 form below. Packing takes a moment, so drafts keep the quick GRC1 form; GRC1 codes made before still import.
     Codes are only ever pasted in: there are no share links, and nothing is read from the page's address. */
  function packer() { const g = typeof window !== 'undefined' && window.GRSave; if (!g || typeof g.encode !== 'function' || typeof g.decode !== 'function') fail('Share codes need the game’s save packer, which is not loaded.'); return g; }
  function shareCode(level) {
    const clean = validate(level), packed = packer().encode(clean);
    const code = typeof packed === 'string' && packed.startsWith('GR3:') ? 'GRC3:' + packed.slice(4) : encode(clean);
    if (code.length > MAX_CODE) fail('This design is too large to share. Remove a few custom shapes or arena objects and try again.');
    return code;
  }
  function decode(input) {
    if (typeof input !== 'string' || input.length > MAX_CODE + 4000) fail('Share code is missing or too long.');
    let code = input.replace(/\s+/g, '');                                     /* a code pasted across lines still reads */
    if (code.length > MAX_CODE) fail('Challenge code is too long.');
    if (code.startsWith('GRC3:')) {
      if (!/^GRC3:[\x23-\x5b\x5d-\x7e]+$/.test(code)) fail('That share code is malformed.');               /* only GR3's own characters */
      let raw = null; try { raw = packer().decode('GR3:' + code.slice(5)); } catch (_) { raw = null; }
      if (!raw || typeof raw !== 'object') fail('That share code is damaged or incomplete. Copy the whole code and try again.');
      return validate(raw);
    }
    if (!code.startsWith('GRC1:')) fail(/^https?:/i.test(code) ? 'Links are not used any more: ask for the share code (it starts with GRC3:) and paste that.' : 'Paste a share code: it starts with GRC3: (older GRC1: codes work too).');
    const parts = /^GRC1:([a-f0-9]{8}):([A-Za-z0-9_-]+)$/.exec(code);
    if (!parts) fail('That challenge code is malformed or uses a newer format.');
    let json;
    try {
      const binary = atob(parts[2].replace(/-/g, '+').replace(/_/g, '/'));
      json = new TextDecoder('utf-8', { fatal: true }).decode(Uint8Array.from(binary, c => c.charCodeAt(0)));
    } catch (_) { fail('That challenge code is damaged.'); }
    if (hash(json) !== parts[1]) fail('That challenge code is damaged (checksum mismatch).');
    let raw; try { raw = JSON.parse(json); } catch (_) { fail('That challenge recipe is not valid JSON.'); }
    return validate(raw);
  }
  function seeded(seed) {
    let state = seed >>> 0;
    return function () { state = (state + 0x6D2B79F5) >>> 0; let t = state; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  }
  function listDrafts() {
    let data;
    try { const text = localStorage.getItem(KEY); if (!text || text.length > MAX_CODE * 24) return []; data = JSON.parse(text); } catch (_) { return []; }
    if (!Array.isArray(data)) return [];
    return data.slice(0, 24).flatMap(entry => {
      try { obj(entry, 'Draft'); const level = decode(entry.code); return [{ id: draftId(entry.id) || fingerprint(level), title: level.title, updated: Number.isFinite(entry.updated) ? entry.updated : 0, code: encode(level) }]; }
      catch (_) { return []; }
    });
  }
  /* a draft's own name on the shelf: the workshop keeps one for the recipe it has open, so saving it again after an edit replaces that draft instead of adding a copy.
     Without one (older shelves, or a plain save) the id is the recipe's fingerprint, so an identical recipe still replaces itself. */
  function draftId(id) { return typeof id === 'string' && /^d[a-z0-9]{6,20}$/.test(id) ? id : null; }
  function newDraftId() { return 'd' + Date.now().toString(36) + Math.floor(Math.random() * 1e6).toString(36); }
  function saveDraft(level, keepId) {
    const clean = validate(level), id = draftId(keepId) || fingerprint(clean), drafts = listDrafts(), entry = { id, title: clean.title, updated: Date.now(), code: encode(clean) };
    const existing = drafts.findIndex(d => d.id === id); if (existing !== -1) drafts.splice(existing, 1);
    if (drafts.length >= 24) fail('The challenge shelf is full. Remove a draft before saving another.');
    drafts.unshift(entry);
    try { localStorage.setItem(KEY, JSON.stringify(drafts)); } catch (_) { fail('This browser could not save the draft. Export its code to keep it.'); }
    return entry;
  }
  function removeDraft(id) {
    const drafts = listDrafts().filter(entry => entry.id !== id);
    try { localStorage.setItem(KEY, JSON.stringify(drafts)); } catch (_) { fail('This browser could not update the challenge shelf.'); }
  }
  const templates = [];
  function template(name, change) { const level = defaults(); level.title = name; change(level); templates.push({ name, level: validate(level) }); }
  template('First hoofsteps', () => {});
  template('The floor is regret', l => { l.description = 'Stay alive for 30 seconds. Watch the red ground!'; l.objective = { type: 'survive', target: 30 }; l.objects = [{kind:'hazard',x:160,y:120,w:160,h:80},{kind:'hazard',x:640,y:440,w:160,h:80}]; l.waves = [{delay:0,enemies:[{kind:'runner',count:8,spawn:'east'}]}]; });
  template('Coin courier', l => { l.description = 'Gather five coins before the crowd catches up.'; l.loadout = 'swift'; l.objective = {type:'collect',target:5}; l.objects = [80,240,480,700,840].map((x,i) => ({kind:'coin',x,y:i%2?460:120,w:24,h:24})); l.waves[0].enemies[0].count = 10; });
  template('The long way home', l => { l.description = 'Find the green exit. Walls make the direct route less direct.'; l.arena.theme = 'arctic'; l.objective = {type:'exit',target:1}; l.objects = [{kind:'exit',x:840,y:80,w:48,h:48},{kind:'wall',x:600,y:120,w:40,h:320}]; });
  template('One very angry brute', l => { l.description = 'One big opponent. One small giraffe.'; l.arena.theme = 'moon'; l.modifiers.enemyHp = 3; l.waves = [{delay:0,enemies:[{kind:'brute',count:1,spawn:'south'}]}]; });
  template('Dusk garden', l => {
    l.description = 'A sunset garden, two gentle waves, and a little medicine between the trees.';
    l.appearance = {time:'sunset',weather:'clear',detail:2}; l.modifiers.attackRate = 1.25;
    l.waves = [{delay:0,enemies:[{kind:'chaser',count:4,spawn:'north'}]},{delay:3,enemies:[{kind:'runner',count:3,spawn:'east'},{kind:'chaser',count:3,spawn:'west'}]}];
    l.objects = [{kind:'tree',x:100,y:90,w:80,h:100},{kind:'tree',x:770,y:100,w:90,h:110},{kind:'tree',x:100,y:450,w:100,h:100},{kind:'tree',x:760,y:450,w:90,h:110},{kind:'banner',x:430,y:70,w:40,h:80},{kind:'wall',x:240,y:200,w:120,h:32},{kind:'wall',x:600,y:408,w:120,h:32},{kind:'heal',x:450,y:480,w:32,h:32}];
  });
  template('Meteor yard', l => {
    l.description = 'A moonlit salvage yard: dodge the hot craters and escape through the beacon.';
    l.arena.theme = 'moon'; l.appearance = {time:'night',weather:'clear',detail:2}; l.loadout = 'tank'; l.modifiers.playerSpeed = 1.2;
    l.objective = {type:'exit',target:1}; l.waves = [{delay:0,enemies:[{kind:'brute',count:2,spawn:'south'},{kind:'spitter',count:2,spawn:'west'}]}];
    l.objects = [{kind:'rock',x:80,y:120,w:120,h:80},{kind:'rock',x:710,y:420,w:150,h:100},{kind:'rock',x:660,y:70,w:100,h:70},{kind:'hazard',x:230,y:110,w:100,h:80},{kind:'hazard',x:650,y:320,w:120,h:100},{kind:'wall',x:550,y:120,w:32,h:160},{kind:'exit',x:840,y:72,w:48,h:48},{kind:'banner',x:840,y:20,w:40,h:48},{kind:'heal',x:280,y:460,w:32,h:32}];
  });
  template('Rainy courier', l => {
    l.description = 'Five deliveries in a rainy courtyard. Take the speedy kit and weave around the hedges.';
    l.appearance = {time:'sunset',weather:'drizzle',detail:2}; l.loadout = 'swift'; l.modifiers.playerSpeed = 1.15;
    l.objective = {type:'collect',target:5}; l.waves = [{delay:0,enemies:[{kind:'chaser',count:6,spawn:'north'},{kind:'runner',count:3,spawn:'south'}]}];
    l.objects = [80,240,480,700,840].map((x,i) => ({kind:'coin',x,y:i%2?460:120,w:24,h:24})).concat([{kind:'tree',x:100,y:260,w:80,h:100},{kind:'tree',x:780,y:260,w:80,h:100},{kind:'banner',x:440,y:530,w:40,h:70},{kind:'wall',x:280,y:220,w:120,h:32},{kind:'wall',x:560,y:400,w:120,h:32},{kind:'heal',x:450,y:420,w:32,h:32}]);
  });
  template('Snow lanterns', l => {
    l.description = 'Stay warm, stay moving, and survive 25 seconds beneath the snow.';
    l.arena.theme = 'arctic'; l.appearance = {time:'night',weather:'snow',detail:2}; l.objective = {type:'survive',target:25};
    l.waves = [{delay:0,enemies:[{kind:'chaser',count:6,spawn:'east'}]},{delay:5,enemies:[{kind:'runner',count:4,spawn:'west'}]}];
    l.objects = [{kind:'tree',x:80,y:80,w:80,h:110},{kind:'tree',x:800,y:430,w:80,h:110},{kind:'rock',x:680,y:80,w:100,h:70},{kind:'banner',x:160,y:460,w:40,h:80},{kind:'banner',x:780,y:120,w:40,h:80},{kind:'heal',x:240,y:300,w:32,h:32}];
  });
  template('Mushroom forest', l => {
    l.description = 'A forest of home-made mushrooms. Slip between the stems to reach the far exit.';
    l.arena.theme = 'forest'; l.appearance = {time:'sunset',weather:'drizzle',detail:2,palette:'autumn'}; l.objective = {type:'exit',target:1};
    l.customAssets = [{id:'mushroom',name:'Spotted mushroom',solid:true,parts:[{shape:'rect',x:42,y:48,w:16,h:48,color:'#ead8b3'},{shape:'ellipse',x:8,y:8,w:84,h:48,color:'#c34c47'},{shape:'ellipse',x:26,y:18,w:12,h:10,color:'#fff5d8'},{shape:'ellipse',x:60,y:26,w:10,h:8,color:'#fff5d8'}]}];
    l.objects = [{kind:'custom',asset:'mushroom',x:180,y:120,w:100,h:100},{kind:'custom',asset:'mushroom',x:600,y:400,w:100,h:100},{kind:'custom',asset:'mushroom',x:680,y:120,w:80,h:80},{kind:'tree',x:60,y:420,w:120,h:120},{kind:'exit',x:840,y:80,w:48,h:48},{kind:'heal',x:280,y:460,w:32,h:32}];
  });
  template('Desert signal station', l => {
    l.description = 'Pastel dunes and hand-built signal towers. Clear two waves to claim the station.';
    l.arena.theme = 'desert'; l.appearance = {time:'day',weather:'clear',detail:2,palette:'custom',colors:{ground:'#d8b189',accent:'#f1d9ae',foliage:'#7c9e89'}};
    l.customAssets = [{id:'signal',name:'Signal tower',solid:false,parts:[{shape:'triangle',x:28,y:16,w:44,h:80,color:'#705a65'},{shape:'rect',x:12,y:28,w:76,h:16,color:'#f7a9a8',rotation:-12},{shape:'ellipse',x:40,y:0,w:20,h:20,color:'#ffe7a0'}]}];
    l.waves = [{delay:0,enemies:[{kind:'chaser',count:5,spawn:'west'}]},{delay:2,enemies:[{kind:'runner',count:3,spawn:'south'},{kind:'spitter',count:2,spawn:'north'}]}];
    l.objects = [{kind:'custom',asset:'signal',x:120,y:100,w:100,h:140},{kind:'custom',asset:'signal',x:760,y:420,w:100,h:140},{kind:'rock',x:680,y:140,w:100,h:70},{kind:'wall',x:260,y:420,w:160,h:32},{kind:'heal',x:680,y:480,w:32,h:32}];
  });
  return { key: KEY, kinds: KINDS.slice(), kindR: Object.assign({}, KIND_R), defaults, validate, encode, decode, shareCode, fingerprint, seeded, templates, isSolid, saveDraft, listDrafts, removeDraft, newDraftId };
}());
window.GRChallengeData = GRChallengeData;
