/* The icon table and the icon helpers. Runs outside strict mode, as it always did. */
/* ICONS is the table for filled icons; the game draws all of its pictures as outlines (ICONS_T here and in 00b-icons-custom.js), so it stays empty. */
const ICONS = {};
const ICON_ALIAS = {};                                  /* old name -> new key, filled by 00b-icons-custom.js */

/* Icon colors by what the thing is (water blue, plants green, fire orange ...). Overrides any color passed in. */
const ICON_COL = {
  't-wind':'#A8E6F0','t-tornado':'#E8A070','t-cloud-storm':'#E8A070','t-bell':'#F2C14A','t-ear':'#7AE8D0','t-wave-sine':'#9AF0E0','t-speakerphone':'#D8FFF4',
  't-shield-star':'#F2B33D','t-shield-chevron':'#B8C4CE','t-shield-half':'#9FB4C8','t-horseshoe':'#E8A060','t-bomb':'#FF8A3D','t-sun-electricity':'#FFF3CC','t-stars':'#FFC98A',
  't-bug':'#15100C','t-biohazard':'#B6D870','t-droplet-half-2':'#E0D060','t-walk':'#C8A070','t-paw':'#C98A4A','t-feather':'#E8ECF2','t-vacuum-cleaner':'#A8E6F0','t-run':'#7FD6A0',
  't-plant-2':'#7E9B4E','t-leaf':'#8AD070','t-sparkles':'#FFE680','t-meteor':'#FF8A4A','t-crown':'#6FA83C','t-ripple':'#5BB8FF','t-heartbeat':'#F25A6A','t-flame':'#FF7A2A',
  't-campfire':'#FF5A2A','t-shoe':'#C8A070','t-lamp-2':'#FFC870','t-hammer':'#B8C0C8','t-coin':'#FFC83A','t-coins':'#FFC83A','t-flask-2':'#B880FF','t-test-pipe':'#7FE06A',
  't-butterfly':'#FF9F5A','t-mountain':'#8A93B8','t-swords':'#C8A070','t-sword':'#C8D0DC','t-filter':'#E8A070','t-magnet':'#C8505A','t-brain':'#F29AC8','t-eye':'#9ACBFF',  't-apple':'#E8503A','t-skull':'#E8E4DA',
  water_drop:'#5BB8FF', waves:'#4AA3E8', umbrella:'#5BB8FF', thunderstorm:'#8FB8FF', cloud:'#C9D3DD', air:'#A8E6F0', tornado:'#A8E6F0', cyclone:'#8FD3E8',
  grass:'#6FCB4A', park:'#4FA83C', nature:'#5FCB5A', energy_savings_leaf:'#8FE04A', local_florist:'#F08AC0', spa:'#7ED66A',
  local_fire_department:'#FF7A2A', flare:'#FFB347', wb_sunny:'#FFD23F', light_mode:'#FFD23F', star:'#FFD84D', auto_awesome:'#FFE680', public:'#7FB8FF', nights_stay:'#A58CFF', dark_mode:'#9AA8E8', contrast:'#9AA8C8',
  bolt:'#FFE23F', flash_on:'#FFE23F', lightbulb:'#FFE680', emoji_objects:'#FFD23F',
  shield:'#9FB4C8', security:'#B8C4CE', castle:'#C8B8A0', military_tech:'#9BE04A', health_and_safety:'#6FD6A8', hexagon:'#6FE8FF',
  paid:'#FFC83A', savings:'#FFC83A', workspace_premium:'#FFC83A', notifications:'#F2C14A', campaign:'#F2A03A',
  favorite:'#F25A6A', bloodtype:'#E8403A', sentiment_very_dissatisfied:'#E8E4DA', accessibility_new:'#E8DCC4', biotech:'#7FE0C0', science:'#7FE06A', visibility:'#9ACBFF',
  pets:'#C98A4A', bubble_chart:'#9A7040', circle:'#9FBF52', pest_control:'#15100C', bug_report:'#D8A040', flutter_dash:'#B58AC4', egg:'#F0E4C8',
  construction:'#C8A070', build:'#B8C0C8', hardware:'#B8C0C8', gavel:'#C8A070', precision_manufacturing:'#D8803A', settings:'#B8C0C8', cable:'#D8A040', oil_barrel:'#7A6A5A', view_module:'#B07A5A', landslide:'#C8783A', landscape:'#A89070', terrain:'#A89070',
  home:'#D8A878', cottage:'#D8A878', cabin:'#D8A878', domain:'#B8C0C8', account_balance:'#E8DCC4', airport_shuttle:'#7FA8D8', flight:'#B8D0E8', local_gas_station:'#E8A040',
  directions_run:'#7FD6A0', directions_walk:'#C8A070', sports_martial_arts:'#E8A060', fitness_center:'#B8C0C8', height:'#E8B860', warning:'#B6FF5C', lock:'#C8C0B0', help:'#A89E90',
  swap_horiz:'#9ACBFF', gps_fixed:'#FF6A5A', adjust:'#C8505A', style:'#E8DCC4', timer:'#9ACBFF', restaurant:'#E89A6A', content_cut:'#D0D8E0', menu_book:'#C8A070', book:'#C8A070', redeem:'#F25A8A', inventory_2:'#C8A070', recycling:'#6FCB6A', gps_not_fixed:'#FF6A5A'
};
const ICONS_T = {                                      /* drawn for this game: 24x24, 2px round-capped outlines */
  'apple':'M12 8c-2-1.6-6-1.6-7 2.2-.9 3.6 1 8.6 3.4 10.2 1.3.9 2.4.2 3.6.2s2.3.7 3.6-.2c2.4-1.6 4.3-6.6 3.4-10.2-1-3.8-5-3.8-7-2.2z M12 8c0-2 .8-3.6 2.6-4.6',
  'bell':'M6 17v-5a6 6 0 0 1 12 0v5 M4 17h16 M10 20.5a2 2 0 0 0 4 0 M12 4V2.5',
  'bomb':'M10.5 7.5a6.5 6.5 0 1 0 0 13a6.5 6.5 0 0 0 0-13z M14.8 8.6l2.4-2.4 M17.2 6.2c.4-2 1.8-3 4-2.6 M20.6 8.2l1.4-.4 M19.4 2.2l.2 1.6',
  'brain':'M12 5v14.5 M12 5c-1-1.5-3.2-1.6-4.3-.5-1.2 1-1.4 2.5-.8 3.6-1.7.5-2.5 2.4-1.7 3.9-1.3 1-1.4 3 0 4.1-.1 1.6 1.1 3 2.8 2.9.7 1 2.6 1.2 4 .5 M12 5c1-1.5 3.2-1.6 4.3-.5 1.2 1 1.4 2.5.8 3.6 1.7.5 2.5 2.4 1.7 3.9 1.3 1 1.4 3 0 4.1.1 1.6-1.1 3-2.8 2.9-.7 1-2.6 1.2-4 .5 M9 11.5c1.2.3 2.2-.2 3-1.3 M15 13.5c-1.2.3-2.2-.2-3-1.3',
  'bug':'M8.5 14a3.5 5 0 1 0 7 0a3.5 5 0 1 0 -7 0 M10 9.2a2 2 0 0 1 4 0 M10.6 7.4L9 4.5 M13.4 7.4L15 4.5 M12 9.5v9.5 M8.6 12.5H4.5 M8.8 15.8l-3.3 1.7 M15.4 12.5h4.1 M15.2 15.8l3.3 1.7',
  'cloud-storm':'M7 15.5a4 4 0 0 1-.4-8 5.5 5.5 0 0 1 10.4-.8A4 4 0 0 1 17 15.5 M12.8 12.5L10 17h3.2l-2.2 4.5',
  'coin':'M12 3a9 9 0 1 0 0 18a9 9 0 0 0 0-18z M12 7a5 5 0 1 0 0 10a5 5 0 0 0 0-10z',
  'crown':'M4 18L3 8l5 4.5L12 5l4 7.5L21 8l-1 10z M4.5 21h15',
  'ear':'M7 10a5 5 0 0 1 10 0c0 2.6-1.7 3.7-2.7 4.9-.8 1-.5 2.2-1.3 3.2a3.2 3.2 0 0 1-5.6-1.2 M10.5 10.3a1.5 1.5 0 0 1 3 0c0 1.1-1 1.5-1.4 2.3',
  'eye':'M2.5 12c2.5-4.5 5.5-6.5 9.5-6.5s7 2 9.5 6.5c-2.5 4.5-5.5 6.5-9.5 6.5S5 16.5 2.5 12z M12 9a3 3 0 1 0 0 6a3 3 0 0 0 0-6z',
  'feather':'M20 4C13 4.3 8 8 6.5 14.5L5 19.5l4.5-1.5C16 16.5 19.7 11 20 4z M5 19.5L14 10',
  'filter':'M4 5h16l-6.2 7.6V19l-3.6 1.8v-8.2z',
  'flame':'M12 21c-4 0-6.5-2.8-6.5-6.2 0-3.4 2.4-5.2 3.6-8 .5-1.1.6-2.2.4-3.3 3.7 1.6 6.2 4.6 6.8 8 .5-.4.9-1 1.1-1.8 1.4 1.6 1.6 3 1.6 4.6 0 3.6-2.7 6.7-7 6.7z M12 21c-1.8 0-3-1.2-3-2.8 0-1.8 1.6-2.4 2.2-4.2 1.6 1 3.8 2.4 3.8 4.6 0 1.4-1.2 2.4-3 2.4z',
  'flask-2':'M9.5 3h5 M10 3v6l-5.4 9.2A1.8 1.8 0 0 0 6.2 21h11.6a1.8 1.8 0 0 0 1.6-2.8L14 9V3 M7.6 15h8.8',
  'hammer':'M9 7l4-4 8 8-4 4z M12.2 11.8l-8.7 8.7',
  'heartbeat':'M12 20.5c-5-3.5-8.5-6.8-8.5-10.6a4.7 4.7 0 0 1 8.5-2.7 4.7 4.7 0 0 1 8.5 2.7c0 3.8-3.5 7.1-8.5 10.6z M7 12.5h2.5l1.5-3 2 5.5 1.5-2.5h2',
  'horseshoe':'M5 20.5v-9.5a7 7 0 0 1 14 0v9.5h-4.5v-9.5a2.5 2.5 0 0 0-5 0v9.5z M7.2 12h.01 M7.2 16h.01 M16.8 12h.01 M16.8 16h.01',
  'lamp-2':'M12 2.5v2 M8.5 7h7l1 2.5v6l-1.5 2.5H9L7.5 15.5v-6z M9 20.5h6 M10 11v5 M14 11v5',
  'magnet':'M5 4v8a7 7 0 0 0 14 0V4h-4.5v8a2.5 2.5 0 0 1-5 0V4z M5 8h4.5 M14.5 8H19',
  'meteor':'M16 12a4 4 0 1 0 0 8a4 4 0 0 0 0-8z M12.8 12.8L4 4 M10.5 16L3 11 M16 10.5L11 3',
  'mountain':'M2.5 20l6.5-12 3.5 6.5 2-3L21.5 20z M7.4 10.6l1.6 1.8 1.4-1',
  'paw':'M12 12.5c-3 0-5.5 2.6-5.5 5 0 1.7 1.4 2.5 3 2.5 1 0 1.5-.5 2.5-.5s1.5.5 2.5.5c1.6 0 3-.8 3-2.5 0-2.4-2.5-5-5.5-5z M3.4 10.5a1.6 2 0 1 0 3.2 0a1.6 2 0 1 0 -3.2 0 M7.9 6a1.6 2 0 1 0 3.2 0a1.6 2 0 1 0 -3.2 0 M12.9 6a1.6 2 0 1 0 3.2 0a1.6 2 0 1 0 -3.2 0 M17.4 10.5a1.6 2 0 1 0 3.2 0a1.6 2 0 1 0 -3.2 0',
  'ripple':'M3 9c3-2.5 6-2.5 9 0s6 2.5 9 0 M3 14c3-2.5 6-2.5 9 0s6 2.5 9 0 M3 19c3-2.5 6-2.5 9 0s6 2.5 9 0',
  'run':'M14.2 5a1.8 1.8 0 1 0 3.6 0a1.8 1.8 0 1 0 -3.6 0 M15 9l-3.5 4.5 3.5 2.2.8 5 M11.5 13.5l-4.5.8-2 3 M14.2 9.6l4.3 1.4 1.7 2.8',
  'shield-chevron':'M12 3l8 3v6c0 4.6-3.2 7.8-8 9.5C7.2 19.8 4 16.6 4 12V6z M8.5 11l3.5 3.2 3.5-3.2',
  'shield-half':'M12 3l8 3v6c0 4.6-3.2 7.8-8 9.5C7.2 19.8 4 16.6 4 12V6z M12 3.2v18 M12 9h5 M12 13h4',
  'shield-star':'M12 3l8 3v6c0 4.6-3.2 7.8-8 9.5C7.2 19.8 4 16.6 4 12V6z M12 8.5l1.1 2.3 2.5.3-1.8 1.8.5 2.5-2.3-1.2-2.3 1.2.5-2.5-1.8-1.8 2.5-.3z',
  'shoe':'M5.5 4h5.5v6.5c0 1.2.7 2 1.8 2.5l4.7 2.1c1.5.7 2.5 1.7 2.5 3.4v1H5.5z M5.5 17h14 M5.5 7.5h5.5',
  'skull':'M12 3c-4.4 0-8 3.2-8 7.4 0 2.4 1.1 4.3 3 5.6V19c0 .6.4 1 1 1h8c.6 0 1-.4 1-1v-3c1.9-1.3 3-3.2 3-5.6C20 6.2 16.4 3 12 3z M7.8 10.5a1.7 1.7 0 1 0 3.4 0a1.7 1.7 0 1 0 -3.4 0 M12.8 10.5a1.7 1.7 0 1 0 3.4 0a1.7 1.7 0 1 0 -3.4 0 M10.5 16v3 M13.5 16v3',
  'sparkles':'M10 4l1.8 5 5 1.8-5 1.8L10 17.6l-1.8-5-5-1.8 5-1.8z M18.5 3v4 M16.5 5h4 M18 15.5v5 M15.5 18h5',
  'speakerphone':'M4 10v4a1 1 0 0 0 1 1h2l7 4.5V5.5L7 9H5a1 1 0 0 0-1 1z M17.5 9.5a4 4 0 0 1 0 5 M20 7a7.5 7.5 0 0 1 0 10 M7 15l1 5',
  'stars':'M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1 5.9L12 16.9 6.8 19.7l1-5.9L3.5 9.7l5.9-.8z M3.5 4v2.6 M2.2 5.3h2.6 M20.5 17.5v2.6 M19.2 18.8h2.6',
  'sun-electricity':'M12 5.5a6.5 6.5 0 1 0 0 13a6.5 6.5 0 0 0 0-13z M12 2v2 M12 20v2 M2 12h2 M20 12h2 M4.9 4.9l1.4 1.4 M17.7 17.7l1.4 1.4 M4.9 19.1l1.4-1.4 M17.7 6.3l1.4-1.4 M12.8 8.5L10 12.5h4L11.2 16',
  'sword':'M20.5 3.5L7.5 13.1l3.4 3.4z M6 12.6l5.4 5.4 M8.7 15.3L4 20',
  'swords':'M4 4l11 11 M16 16l4 4 M12.5 17.5l5-5 M20 4L9 15 M8 16l-4 4 M6.5 12.5l5 5',
  'test-pipe':'M9 3h6 M10 3v13a2 2 0 0 0 4 0V3 M10 11h4',
  'tornado':'M3 5c6 1.5 12 1.5 18 0 M5 9c5 1.2 9 1.2 14 0 M8 13c3 .8 5 .8 8 0 M10.5 17c1 .5 2 .5 3 0 M12 20.5h.01',
  'vacuum-cleaner':'M8 3h6 M11 3v10 M6.5 13h9l2 7h-13z M8 17.5h.01 M15 17.5h.01',
  'walk':'M10.4 4.5a1.6 1.6 0 1 0 3.2 0a1.6 1.6 0 1 0 -3.2 0 M12 8v6 M12 14l-2.5 7 M12 14l3 7 M12 9.5l-3.5 3 M12 9.5l3.5 2.5',
  'wave-sine':'M2.5 12c1.5-7 4-7 5.5 0s4 7 5.5 0 4-7 5.5 0 M19 12h2.5',
  'wind':'M3 9h11.5a2.8 2.8 0 1 0-2.8-2.8 M3 13.5h16a2.8 2.8 0 1 1-2.8 2.8 M3 18h6'
};
/* Filled icons would go in ICONS; outlined icons (2px, written '@t-name') are in ICONS_T. Both are inline SVG paths, written '@name'. Colors: '@t-name:#RRGGBB' draws in that color. */
function ico(v, col){
  if (typeof v !== 'string' || v.charAt(0) !== '@') return v;
  let key = v.slice(1), ov = null; const ci = key.indexOf(':'); if (ci > 0){ ov = key.slice(ci + 1); key = key.slice(0, ci); }      /* '@t-x-drop:#A8D24A' draws that icon in its own color */
  if (ICON_ALIAS[key]) key = ICON_ALIAS[key];
  const tab = key.indexOf('t-') === 0;
  const p = tab ? ICONS_T[key.slice(2)] : ICONS[key]; if (!p) return '';
  col = ov || ICON_COL[key] || col;
  const halo = col === '#15100C' ? ' style="filter:drop-shadow(0 0 1.2px rgba(240,230,210,.9))"' : '';
  if (tab) return '<svg class="mi" viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="' + (col || 'currentColor') + '" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"' + halo + '><path d="' + p + '"/></svg>';
  return '<svg class="mi" viewBox="0 0 24 24" width="1em" height="1em" fill="' + (col || 'currentColor') + '" aria-hidden="true"' + halo + '><path d="' + p + '"/></svg>';
}
const ICON_P2D = {};
function drawIcon(ctx, v, x, y, size, col){
  if (typeof v !== 'string' || v.charAt(0) !== '@'){ ctx.fillText(v, x, y); return; }
  let key = v.slice(1), ov = null; const ci = key.indexOf(':'); if (ci > 0){ ov = key.slice(ci + 1); key = key.slice(0, ci); }
  if (ICON_ALIAS[key]) key = ICON_ALIAS[key];
  const tab = key.indexOf('t-') === 0;
  let p = ICON_P2D[v];
  if (!p){ const d = tab ? ICONS_T[key.slice(2)] : ICONS[key]; if (!d) return; p = ICON_P2D[v] = new Path2D(d); }
  col = ov || ICON_COL[key] || col;
  ctx.save(); ctx.translate(x - size / 2, y - size / 2); ctx.scale(size / 24, size / 24);
  if (tab){ ctx.strokeStyle = col || ctx.fillStyle; ctx.lineWidth = 2; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.stroke(p); }
  else { if (col) ctx.fillStyle = col; ctx.fill(p); }
  ctx.restore();
}/* ============================================================================
   GIRAFFE RAMPAGE
   A single-file top-down savanna survival roguelite.
   ==========================================================================*/
