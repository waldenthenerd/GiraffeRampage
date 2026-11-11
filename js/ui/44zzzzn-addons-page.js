'use strict';
/* The Add-ons page: the list from js/core/10b-addons.js as rows with a switch each, opened from the main menu and from the pause menu.
   Also here: the "+N ADD-ONS" tag in the HUD while any is on, and the line in the run report that names them, so a screenshot or a bug report
   always shows that a run was not the plain game. Runs with add-ons on count as usual. */

const ADDON_SUGGEST_URL = 'https://github.com/waldenthenerd/GiraffeRampage';           /* the box under the list: ideas for add-ons go to the repository */

function addonsButtonHTML(){
  const all = addonsList(), on = addonsActive().length;
  const small = !all.length ? 'Optional and experimental features' : on ? on + ' of ' + all.length + ' on' : all.length + ' to try, all off';
  return '<button class="btn ghost" data-a="addons">Add-ons<small>' + small + '</small></button>';
}

/* an add-on's name, description and lock are plain text: a player's own add-on may put a < or & in them, so they are escaped before they go in the page */
function addonEsc(s){ return String(s == null ? '' : s).replace(/[&<>"']/g, function(c){ return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }

function addonRowHTML(a){
  const t = ADDON_TAGS[a.tag], on = addonOn(a.id), un = addonUnlocked(a), can = addonCanSwitch(a);
  const notes = [];
  if (!un) notes.push('Locked' + (a.lock ? ': ' + addonEsc(a.lock) : '.'));
  else if (a.when === 'between-runs') notes.push(addonsInRun() ? 'Can be switched after this run.' : 'Takes effect from the next run.');
  if (a.dev) notes.push('Developer add-on, hidden from players.');
  return '<div class="kv addonrow' + (un ? '' : ' locked') + '"><div>' + addonEsc(a.name) +
      ' <span class="addontag" style="color:' + t.col + ';border-color:' + t.col + '" title="' + t.small + '">' + t.name + '</span>' +
      (a.local ? ' <span class="addontag local" title="Your own add-on, from addons/' + addonEsc(a.local) + '">Local \u00b7 ' + addonEsc(a.local) + '</span>' : '') +
      '<small>' + addonEsc(a.desc) + (notes.length ? ' <em>' + notes.join(' ') + '</em>' : '') + '</small></div>' +
    '<button class="toggle' + (on ? ' on' : '') + '" data-a="addon-t-' + a.id + '"' + (can ? '' : ' disabled') + '>' + (un ? (on ? 'On' : 'Off') : 'Locked') + '</button></div>';
}

function showAddons(){
  if (G.state !== 'paused'){ G.state = 'help'; G.attract = true; }
  G.subScreen = 'addons';
  const all = addonsList(), on = addonsActive().length;
  const rows = all.length ? all.map(addonRowHTML).join('')
    : '<div class="addonempty">No add-ons yet. New and experimental features will appear here, each with a switch of its own, so you can try them and turn them off again.</div>';
  setOverlay(
    '<div class="panel slab wide addonspanel" style="max-width:560px">' +
      '<h2 class="head">Add-ons</h2>' +
      '<p class="sub">Optional features that sit beside the main game: experiments, extras and silly things. Each one is off until you switch it on, and changes save as you make them. While any is on, the HUD and the run report say so.</p>' +
      '<div class="addonlist">' + rows + '</div>' +
      (typeof localAddonsNoteHTML === 'function' ? localAddonsNoteHTML() : '') +
      '<div class="addonsuggest">Have an idea for an add-on? Suggest it on GitHub: <a href="' + ADDON_SUGGEST_URL + '" target="_blank" rel="noopener">github.com/waldenthenerd/GiraffeRampage</a></div>' +
      '<div class="row" style="margin-top:14px;justify-content:center;gap:10px">' +
        '<button class="btn sm ghost" data-a="addons-alloff"' + (on ? '' : ' disabled') + '>Turn all off</button>' +
        '<button class="btn sm" data-a="addons-back">Back</button>' +
      '</div>' +
    '</div>');
}

{
  const baseAction = handleAction;
  handleAction = function(a){
    if (a === 'addons'){ SFX.click(); showAddons(); return; }
    if (a === 'addons-back'){ SFX.click(); G.subScreen = ''; if (G.state === 'paused') showPause(); else showMenu(); return; }
    if (a === 'addons-alloff'){ if (addonsAllOff()) SFX.click(); else SFX.deny(); showAddons(); return; }
    if (typeof a === 'string' && a.indexOf('addon-t-') === 0){ const id = a.slice(8); if (addonSet(id, !addonOn(id))) SFX.click(); else SFX.deny(); showAddons(); return; }
    return baseAction.apply(this, arguments);
  };
  const baseRefresh = refreshScreen;
  refreshScreen = function(){
    if ((G.state === 'help' || G.state === 'paused') && G.subScreen === 'addons'){ showAddons(); return; }
    return baseRefresh.apply(this, arguments);
  };
  /* the HUD tag beside the wave, the chapter and the speed */
  const baseHUD = updateHUD;
  updateHUD = function(){
    const r = baseHUD.apply(this, arguments);
    if (el('hAddons')){ const n = addonsActive().length; hudTxt('hAddons', n ? '+' + n + (n === 1 ? ' ADD-ON' : ' ADD-ONS') : ''); }
    return r;
  };
  /* the run report keeps the names of the add-ons that were on when the run ended */
  const baseReport = runReport;
  runReport = function(){
    const r = baseReport.apply(this, arguments);
    if (r){ const on = addonsActive(); if (on.length) r.addons = on.map(function(a){ return a.name; }); }
    return r;
  };
  const baseReportHTML = runReportHTML;
  runReportHTML = function(r){
    const out = baseReportHTML.apply(this, arguments);
    const names = r && r.report && r.report.addons;
    if (!out || !names || !names.length) return out;
    const at = out.lastIndexOf('</div>');
    return out.slice(0, at) + '<div class="rr-line">Add-ons on: <b>' + names.map(addonEsc).join(', ') + '</b>.</div>' + out.slice(at);
  };
}
