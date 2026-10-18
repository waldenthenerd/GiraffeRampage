/* Icon tables (Material + Tabler) and the icon helpers. Runs outside strict mode, as it always did. */
/* The old filled Material icon table was replaced by the drawn set in 00b-icons-custom.js and the Tabler set below; this stays for any stock icon added later. */
const ICONS = {};
const ICON_ALIAS = {};                                  /* old name -> new key, filled by 00b-icons-custom.js */

/* Icon colours by what the thing is (water blue, plants green, fire orange ...). Overrides any colour passed in. */
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
const ICONS_T = {
  'apple':'M4 11.319c0 3.102 .444 5.319 2.222 7.978c1.351 1.797 3.156 2.247 5.08 .988c.426 -.268 .97 -.268 1.397 0c1.923 1.26 3.728 .809 5.079 -.988c1.778 -2.66 2.222 -4.876 2.222 -7.977c0 -2.661 -1.99 -5.32 -4.444 -5.32c-1.267 0 -2.41 .693 -3.22 1.44a.5 .5 0 0 1 -.672 0c-.809 -.746 -1.953 -1.44 -3.22 -1.44c-2.454 0 -4.444 2.66 -4.444 5.319 M7 12c0 -1.47 .454 -2.34 1.5 -3 M12 7c0 -1.2 .867 -4 3 -4',
  'skull':'M12 4c4.418 0 8 3.358 8 7.5c0 1.901 -.755 3.637 -2 4.96l0 2.54a1 1 0 0 1 -1 1h-10a1 1 0 0 1 -1 -1v-2.54c-1.245 -1.322 -2 -3.058 -2 -4.96c0 -4.142 3.582 -7.5 8 -7.5z M10 17v3 M14 17v3 M9 11m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0 M15 11m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0',
  'bell':'M10 5a2 2 0 1 1 4 0a7 7 0 0 1 4 6v3a4 4 0 0 0 2 3h-16a4 4 0 0 0 2 -3v-3a7 7 0 0 1 4 -6 M9 17v1a3 3 0 0 0 6 0v-1',
  'biohazard':'M12 12m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0 M11.939 14c0 .173 .048 .351 .056 .533l0 .217a4.75 4.75 0 0 1 -4.533 4.745l-.217 0m-4.75 -4.75a4.75 4.75 0 0 1 7.737 -3.693m6.513 8.443a4.75 4.75 0 0 1 -4.69 -5.503l-.06 0m1.764 -2.944a4.75 4.75 0 0 1 7.731 3.477l0 .217m-11.195 -3.813a4.75 4.75 0 0 1 -1.828 -7.624l.164 -.172m6.718 0a4.75 4.75 0 0 1 -1.665 7.798',
  'bomb':'M15.349 5.349l3.301 3.301a1.2 1.2 0 0 1 0 1.698l-.972 .972a7.5 7.5 0 1 1 -5 -5l.972 -.972a1.2 1.2 0 0 1 1.698 0z M17 7l1.293 -1.293a2.414 2.414 0 0 0 .707 -1.707a1 1 0 0 1 1 -1h1 M7 13a3 3 0 0 1 3 -3',
  'brain':'M15.5 13a3.5 3.5 0 0 0 -3.5 3.5v1a3.5 3.5 0 0 0 7 0v-1.8 M8.5 13a3.5 3.5 0 0 1 3.5 3.5v1a3.5 3.5 0 0 1 -7 0v-1.8 M17.5 16a3.5 3.5 0 0 0 0 -7h-.5 M19 9.3v-2.8a3.5 3.5 0 0 0 -7 0 M6.5 16a3.5 3.5 0 0 1 0 -7h.5 M5 9.3v-2.8a3.5 3.5 0 0 1 7 0v10',
  'bug':'M9 9v-1a3 3 0 0 1 6 0v1 M8 9h8a6 6 0 0 1 1 3v3a5 5 0 0 1 -10 0v-3a6 6 0 0 1 1 -3 M3 13l4 0 M17 13l4 0 M12 20l0 -6 M4 19l3.35 -2 M20 19l-3.35 -2 M4 7l3.75 2.4 M20 7l-3.75 2.4',
  'butterfly':'M12 18.176a3 3 0 1 1 -4.953 -2.449l-.025 .023a4.502 4.502 0 0 1 1.483 -8.75c1.414 0 2.675 .652 3.5 1.671a4.5 4.5 0 1 1 4.983 7.079a3 3 0 1 1 -4.983 2.25z M12 19v-10 M9 3l3 2l3 -2',
  'campfire':'M4 21l16 -4 M20 21l-16 -4 M12 15a4 4 0 0 0 4 -4c0 -3 -2 -3 -2 -8c-4 2 -6 5 -6 8a4 4 0 0 0 4 4z',
  'cloud-storm':'M7 18a4.6 4.4 0 0 1 0 -9a5 4.5 0 0 1 11 2h1a3.5 3.5 0 0 1 0 7h-1 M13 14l-2 4l3 0l-2 4',
  'coin':'M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0 M14.8 9a2 2 0 0 0 -1.8 -1h-2a2 2 0 1 0 0 4h2a2 2 0 1 1 0 4h-2a2 2 0 0 1 -1.8 -1 M12 7v10',
  'coins':'M9 14c0 1.657 2.686 3 6 3s6 -1.343 6 -3s-2.686 -3 -6 -3s-6 1.343 -6 3z M9 14v4c0 1.656 2.686 3 6 3s6 -1.344 6 -3v-4 M3 6c0 1.072 1.144 2.062 3 2.598s4.144 .536 6 0c1.856 -.536 3 -1.526 3 -2.598c0 -1.072 -1.144 -2.062 -3 -2.598s-4.144 -.536 -6 0c-1.856 .536 -3 1.526 -3 2.598z M3 6v10c0 .888 .772 1.45 2 2 M3 11c0 .888 .772 1.45 2 2',
  'crown':'M12 6l4 6l5 -4l-2 10h-14l-2 -10l5 4z',
  'droplet-half-2':'M7.502 19.423c2.602 2.105 6.395 2.105 8.996 0c2.602 -2.105 3.262 -5.708 1.566 -8.546l-4.89 -7.26c-.42 -.625 -1.287 -.803 -1.936 -.397a1.376 1.376 0 0 0 -.41 .397l-4.893 7.26c-1.695 2.838 -1.035 6.441 1.567 8.546z M5 14h14',
  'ear':'M6 10a7 7 0 1 1 13 3.6a10 10 0 0 1 -2 2a8 8 0 0 0 -2 3a4.5 4.5 0 0 1 -6.8 1.4 M10 10a3 3 0 1 1 5 2.2',
  'eye':'M10 12a2 2 0 1 0 4 0a2 2 0 0 0 -4 0 M21 12c-2.4 4 -5.4 6 -9 6c-3.6 0 -6.6 -2 -9 -6c2.4 -4 5.4 -6 9 -6c3.6 0 6.6 2 9 6',
  'feather':'M4 20l10 -10m0 -5v5h5m-9 -1v5h5m-9 -1v5h5m-5 -5l4 -4l4 -4 M19 10c.638 -.636 1 -1.515 1 -2.486a3.515 3.515 0 0 0 -3.517 -3.514c-.97 0 -1.847 .367 -2.483 1m-3 13l4 -4l4 -4',
  'filter':'M4 4h16v2.172a2 2 0 0 1 -.586 1.414l-4.414 4.414v7l-6 2v-8.5l-4.48 -4.928a2 2 0 0 1 -.52 -1.345v-2.227z',
  'flame':'M12 12c2 -2.96 0 -7 -1 -8c0 3.038 -1.773 4.741 -3 6c-1.226 1.26 -2 3.24 -2 5a6 6 0 1 0 12 0c0 -1.532 -1.056 -3.94 -2 -5c-1.786 3 -2.791 3 -4 2z',
  'flask-2':'M6.1 15h11.8 M14 3v7.342a6 6 0 0 1 1.318 10.658h-6.635a6 6 0 0 1 1.317 -10.66v-7.34h4z M9 3h6',
  'hammer':'M11.414 10l-7.383 7.418a2.091 2.091 0 0 0 0 2.967a2.11 2.11 0 0 0 2.976 0l7.407 -7.385 M18.121 15.293l2.586 -2.586a1 1 0 0 0 0 -1.414l-7.586 -7.586a1 1 0 0 0 -1.414 0l-2.586 2.586a1 1 0 0 0 0 1.414l7.586 7.586a1 1 0 0 0 1.414 0z',
  'heartbeat':'M19.5 13.572l-7.5 7.428l-2.896 -2.868m-6.117 -8.104a5 5 0 0 1 9.013 -3.022a5 5 0 1 1 7.5 6.572 M3 13h2l2 3l2 -6l1 3h3',
  'horseshoe':'M19 17c.5 -1.242 2 -2 2 -5s-1 -9 -9 -9s-9 6 -9 9s1.495 3.749 2 5l-2 1l2 3l2.406 -1.147c1.25 -.714 1.778 -2.08 1.203 -3.363c-1.078 -2.407 -1.609 -8.49 3.391 -8.49s4.469 6.083 3.39 8.49c-.574 1.284 -.045 2.649 1.204 3.363l2.406 1.147l2 -3l-2 -1z',
  'lamp-2':'M5 21h9 M10 21l-7 -8l8.5 -5.5 M13 14c-2.148 -2.148 -2.148 -5.852 0 -8c2.088 -2.088 5.842 -1.972 8 0l-8 8z M11.742 7.574l-1.156 -1.156a2 2 0 0 1 2.828 -2.829l1.144 1.144 M15.5 12l.208 .274a2.527 2.527 0 0 0 3.556 0c.939 -.933 .98 -2.42 .122 -3.4l-.366 -.369',
  'leaf':'M5 21c.5 -4.5 2.5 -8 7 -10 M9 18c6.218 0 10.5 -3.288 11 -12v-2h-4.014c-9 0 -11.986 4 -12 9c0 1 0 3 2 5h3z',
  'magnet':'M4 13v-8a2 2 0 0 1 2 -2h1a2 2 0 0 1 2 2v8a2 2 0 0 0 6 0v-8a2 2 0 0 1 2 -2h1a2 2 0 0 1 2 2v8a8 8 0 0 1 -16 0 M4 8l5 0 M15 8l4 0',
  'meteor':'M21 3l-5 9h5l-6.891 7.086a6.5 6.5 0 1 1 -8.855 -9.506l7.746 -6.58l-1 5l9 -5z M9.5 14.5m-2.5 0a2.5 2.5 0 1 0 5 0a2.5 2.5 0 1 0 -5 0',
  'mountain':'M3 20h18l-6.921 -14.612a2.3 2.3 0 0 0 -4.158 0l-6.921 14.612z M7.5 11l2 2.5l2.5 -2.5l2 3l2.5 -2',
  'paw':'M14.7 13.5c-1.1 -2 -1.441 -2.5 -2.7 -2.5c-1.259 0 -1.736 .755 -2.836 2.747c-.942 1.703 -2.846 1.845 -3.321 3.291c-.097 .265 -.145 .677 -.143 .962c0 1.176 .787 2 1.8 2c1.259 0 3 -1 4.5 -1s3.241 1 4.5 1c1.013 0 1.8 -.823 1.8 -2c0 -.285 -.049 -.697 -.146 -.962c-.475 -1.451 -2.512 -1.835 -3.454 -3.538z M20.188 8.082a1.039 1.039 0 0 0 -.406 -.082h-.015c-.735 .012 -1.56 .75 -1.993 1.866c-.519 1.335 -.28 2.7 .538 3.052c.129 .055 .267 .082 .406 .082c.739 0 1.575 -.742 2.011 -1.866c.516 -1.335 .273 -2.7 -.54 -3.052z M9.474 9c.055 0 .109 0 .163 -.011c.944 -.128 1.533 -1.346 1.32 -2.722c-.203 -1.297 -1.047 -2.267 -1.932 -2.267c-.055 0 -.109 0 -.163 .011c-.944 .128 -1.533 1.346 -1.32 2.722c.204 1.293 1.048 2.267 1.933 2.267z M16.456 6.733c.214 -1.376 -.375 -2.594 -1.32 -2.722a1.164 1.164 0 0 0 -.162 -.011c-.885 0 -1.728 .97 -1.93 2.267c-.214 1.376 .375 2.594 1.32 2.722c.054 .007 .108 .011 .162 .011c.885 0 1.73 -.974 1.93 -2.267z M5.69 12.918c.816 -.352 1.054 -1.719 .536 -3.052c-.436 -1.124 -1.271 -1.866 -2.009 -1.866c-.14 0 -.277 .027 -.407 .082c-.816 .352 -1.054 1.719 -.536 3.052c.436 1.124 1.271 1.866 2.009 1.866c.14 0 .277 -.027 .407 -.082z',
  'plant-2':'M2 9a10 10 0 1 0 20 0 M12 19a10 10 0 0 1 10 -10 M2 9a10 10 0 0 1 10 10 M12 4a9.7 9.7 0 0 1 2.99 7.5 M9.01 11.5a9.7 9.7 0 0 1 2.99 -7.5',
  'ripple':'M3 7c3 -2 6 -2 9 0s6 2 9 0 M3 17c3 -2 6 -2 9 0s6 2 9 0 M3 12c3 -2 6 -2 9 0s6 2 9 0',
  'run':'M13 4m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0 M4 17l5 1l.75 -1.5 M15 21l0 -4l-4 -3l1 -6 M7 12l0 -3l5 -1l3 3l3 1',
  'shield-chevron':'M12 3a12 12 0 0 0 8.5 3a12 12 0 0 1 -8.5 15a12 12 0 0 1 -8.5 -15a12 12 0 0 0 8.5 -3 M4 14l8 -3l8 3',
  'shield-half':'M12 3a12 12 0 0 0 8.5 3a12 12 0 0 1 -8.5 15a12 12 0 0 1 -8.5 -15a12 12 0 0 0 8.5 -3 M12 3v18',
  'shield-star':'M11.143 20.743a12 12 0 0 1 -7.643 -14.743a12 12 0 0 0 8.5 -3a12 12 0 0 0 8.5 3c.504 1.716 .614 3.505 .343 5.237 M17.8 20.817l-2.172 1.138a.392 .392 0 0 1 -.568 -.41l.415 -2.411l-1.757 -1.707a.389 .389 0 0 1 .217 -.665l2.428 -.352l1.086 -2.193a.392 .392 0 0 1 .702 0l1.086 2.193l2.428 .352a.39 .39 0 0 1 .217 .665l-1.757 1.707l.414 2.41a.39 .39 0 0 1 -.567 .411l-2.172 -1.138z',
  'shoe':'M4 6h5.426a1 1 0 0 1 .863 .496l1.064 1.823a3 3 0 0 0 1.896 1.407l4.677 1.114a4 4 0 0 1 3.074 3.89v2.27a1 1 0 0 1 -1 1h-16a1 1 0 0 1 -1 -1v-10a1 1 0 0 1 1 -1z M14 13l1 -2 M8 18v-1a4 4 0 0 0 -4 -4h-1 M10 12l1.5 -3',
  'sparkles':'M16 18a2 2 0 0 1 2 2a2 2 0 0 1 2 -2a2 2 0 0 1 -2 -2a2 2 0 0 1 -2 2zm0 -12a2 2 0 0 1 2 2a2 2 0 0 1 2 -2a2 2 0 0 1 -2 -2a2 2 0 0 1 -2 2zm-7 12a6 6 0 0 1 6 -6a6 6 0 0 1 -6 -6a6 6 0 0 1 -6 6a6 6 0 0 1 6 6z',
  'speakerphone':'M18 8a3 3 0 0 1 0 6 M10 8v11a1 1 0 0 1 -1 1h-1a1 1 0 0 1 -1 -1v-5 M12 8h0l4.524 -3.77a.9 .9 0 0 1 1.476 .692v12.156a.9 .9 0 0 1 -1.476 .692l-4.524 -3.77h-8a1 1 0 0 1 -1 -1v-4a1 1 0 0 1 1 -1h8',
  'stars':'M17.8 19.817l-2.172 1.138a.392 .392 0 0 1 -.568 -.41l.415 -2.411l-1.757 -1.707a.389 .389 0 0 1 .217 -.665l2.428 -.352l1.086 -2.193a.392 .392 0 0 1 .702 0l1.086 2.193l2.428 .352a.39 .39 0 0 1 .217 .665l-1.757 1.707l.414 2.41a.39 .39 0 0 1 -.567 .411l-2.172 -1.138z M6.2 19.817l-2.172 1.138a.392 .392 0 0 1 -.568 -.41l.415 -2.411l-1.757 -1.707a.389 .389 0 0 1 .217 -.665l2.428 -.352l1.086 -2.193a.392 .392 0 0 1 .702 0l1.086 2.193l2.428 .352a.39 .39 0 0 1 .217 .665l-1.757 1.707l.414 2.41a.39 .39 0 0 1 -.567 .411l-2.172 -1.138z M12 9.817l-2.172 1.138a.392 .392 0 0 1 -.568 -.41l.415 -2.411l-1.757 -1.707a.389 .389 0 0 1 .217 -.665l2.428 -.352l1.086 -2.193a.392 .392 0 0 1 .702 0l1.086 2.193l2.428 .352a.39 .39 0 0 1 .217 .665l-1.757 1.707l.414 2.41a.39 .39 0 0 1 -.567 .411l-2.172 -1.138z',
  'sun-electricity':'M8 12a4 4 0 0 0 4 4m0 -8a4 4 0 0 0 -4 4 M3 12h1 M12 3v1 M12 20v1 M5.6 5.6l.7 .7 M6.3 17.7l-.7 .7 M20 7l-3 5h4l-3 5',
  'sword':'M20 4v5l-9 7l-4 4l-3 -3l4 -4l7 -9z M6.5 11.5l6 6',
  'swords':'M21 3v5l-11 9l-4 4l-3 -3l4 -4l9 -11z M5 13l6 6 M14.32 17.32l3.68 3.68l3 -3l-3.365 -3.365 M10 5.5l-2 -2.5h-5v5l3 2.5',
  'test-pipe':'M20 8.04l-12.122 12.124a2.857 2.857 0 1 1 -4.041 -4.04l12.122 -12.124 M7 13h8 M19 15l1.5 1.6a2 2 0 1 1 -3 0l1.5 -1.6z M15 3l6 6',
  'tornado':'M21 4l-18 0 M13 16l-6 0 M11 20l4 0 M6 8l14 0 M4 12l12 0',
  'vacuum-cleaner':'M21 12a9 9 0 1 1 -18 0a9 9 0 0 1 18 0z M14 9a2 2 0 1 1 -4 0a2 2 0 0 1 4 0z M12 16h.01',
  'walk':'M13 4m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0 M7 21l3 -4 M16 21l-2 -4l-3 -3l1 -6 M6 12l2 -3l4 -1l3 3l3 1',
  'wave-sine':'M21 12h-2c-.894 0 -1.662 -.857 -1.761 -2c-.296 -3.45 -.749 -6 -2.749 -6s-2.5 3.582 -2.5 8s-.5 8 -2.5 8s-2.452 -2.547 -2.749 -6c-.1 -1.147 -.867 -2 -1.763 -2h-2',
  'wind':'M5 8h8.5a2.5 2.5 0 1 0 -2.34 -3.24 M3 12h15.5a2.5 2.5 0 1 1 -2.34 3.24 M4 16h5.5a2.5 2.5 0 1 1 -2.34 3.24'
};
/* Material icons (Apache 2.0) are solid shapes (ICONS); Tabler icons (MIT) are 2px outlines (ICONS_T, written '@t-name'). Both are inline SVG paths. Icon values are written '@name'. */
function ico(v, col){
  if (typeof v !== 'string' || v.charAt(0) !== '@') return v;
  let key = v.slice(1), ov = null; const ci = key.indexOf(':'); if (ci > 0){ ov = key.slice(ci + 1); key = key.slice(0, ci); }      /* '@t-x-drop:#A8D24A' draws that icon in its own colour */
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
