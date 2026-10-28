'use strict';
/* Starts the game. */
recalcStats();
boot();
{ const ld = document.getElementById('boot'); if (ld) ld.remove(); }                /* the loading screen in index.html, there from the first paint until the scripts have run */
