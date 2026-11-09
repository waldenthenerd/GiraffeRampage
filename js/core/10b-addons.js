'use strict';
/* Add-ons: optional features the player switches on and off from the Add-ons page (js/ui/44zzzzn-addons-page.js).
   An add-on lives in a file of its own under js/addons/, loaded after everything it wraps and before js/core/45-test-exports.js. It registers itself
   with addonRegister({...}) and changes the game only through wrappers that ask addonOn(id) on every call, so with the switch off the game runs
   exactly as it does without the file:
     const base = someDraw;
     someDraw = function(){ if (!addonOn('myidea')) return base.apply(this, arguments); ...the add-on's own version... };
   Taking an add-on out of the game is deleting its file and its <script> line. The choices are kept in Save.data.addons ({ id: 1 } for each one that
   is on); ids the game does not know are kept as they are, so an older or newer copy of the game does not wipe them, and erasing progress keeps them. */

const ADDONS = [];                                                                /* every registered add-on, in the order their files load */
const ADDON_TAGS = {
  experimental: { name: 'Experimental', col: '#FF9A4A', small: 'Still being tried out: it may change, or go away.' },
  extra:        { name: 'Extra',        col: '#7FD8FF', small: 'Something more that sits beside the main game.' },
  silly:        { name: 'Silly',        col: '#E89AFF', small: 'Just for fun.' }
};
const ADDON_ON = {};                                                              /* id -> true for each add-on that is on and usable; rebuilt by addonsSync, read by addonOn on every call */

/* def: { id, name, desc, tag, def (on for a new player), when ('any', or 'between-runs' for a change only from the menu), dev (hidden from players),
          needs() (an unlock rule: false shows it locked), lock (what the lock says), on(), off() (called when the player switches it) } */
function addonRegister(def){
  if (!def || typeof def.id !== 'string' || !/^[a-z0-9]{1,24}$/.test(def.id)) throw new Error('addonRegister: the id must be 1-24 lowercase letters or digits');
  if (addonById(def.id)) throw new Error('addonRegister: "' + def.id + '" is registered twice');
  const a = Object.assign({ name: def.id, desc: '', tag: 'experimental', def: false, when: 'any', dev: false, needs: null, lock: '', on: null, off: null }, def);
  if (!ADDON_TAGS[a.tag]) a.tag = 'experimental';
  if (a.when !== 'between-runs') a.when = 'any';
  ADDONS.push(a);
  addonsSync();
  return a;
}
function addonById(id){ for (let i = 0; i < ADDONS.length; i++) if (ADDONS[i].id === id) return ADDONS[i]; return null; }

/* developer add-ons show only with the testing panel loaded, or with ?addons=all in the address */
function addonsShowDev(){
  if (typeof handleDebugAction === 'function') return true;
  try { return /[?&]addons=all(&|$)/.test(window.location.search); } catch (e) { return false; }
}
function addonVisible(a){ return !!a && (!a.dev || addonsShowDev()); }
function addonUnlocked(a){ if (!a || typeof a.needs !== 'function') return true; try { return !!a.needs(); } catch (e) { return false; } }
/* what the player chose: a stored 1 or 0 wins, and an add-on she never touched follows its default */
function addonChosen(a){
  const s = Save.data && Save.data.addons;
  if (s && s[a.id] !== undefined) return s[a.id] === 1;
  return !!a.def;
}
function addonsSync(){
  for (const k in ADDON_ON) delete ADDON_ON[k];
  for (let i = 0; i < ADDONS.length; i++){ const a = ADDONS[i]; if (addonVisible(a) && addonUnlocked(a) && addonChosen(a)) ADDON_ON[a.id] = true; }
}
function addonOn(id){ return ADDON_ON[id] === true; }
function addonsActive(){ return ADDONS.filter(function(a){ return ADDON_ON[a.id] === true; }); }
function addonsList(){ return ADDONS.filter(addonVisible); }

/* a run is going: an add-on that only changes between runs waits until it is over */
function addonsInRun(){ return typeof G !== 'undefined' && !!G.state && ['playing', 'paused', 'levelup', 'transform', 'dead', 'victory', 'sky'].indexOf(G.state) >= 0; }
function addonCanSwitch(a){ return addonVisible(a) && addonUnlocked(a) && !(a.when === 'between-runs' && addonsInRun()); }

/* switch one add-on; false (and nothing changes) when it cannot be switched now */
function addonSet(id, on){
  const a = addonById(id);
  if (!a || !addonCanSwitch(a)) return false;
  on = !!on;
  if (addonOn(id) === on) return true;
  if (!Save.data.addons || typeof Save.data.addons !== 'object') Save.data.addons = {};
  Save.data.addons[id] = on ? 1 : 0;
  addonsSync();
  try { const f = on ? a.on : a.off; if (typeof f === 'function') f(); } catch (e) { if (window.console) console.warn('add-on ' + id + ': ' + (e && e.message)); }
  Save.write();
  return true;
}
/* switches every add-on it can off; returns how many it switched */
function addonsAllOff(){
  let n = 0;
  addonsActive().forEach(function(a){ if (addonSet(a.id, false)) n++; });
  return n;
}

/* the choices come from the save, so read them again whenever the save is loaded or erased */
{
  const baseLoad = Save.load, baseReset = Save.reset;
  Save.load = function(){ const r = baseLoad.apply(this, arguments); addonsSync(); return r; };
  Save.reset = function(){ const r = baseReset.apply(this, arguments); addonsSync(); return r; };
}
