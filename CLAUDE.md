# Giraffe Rampage: notes for Claude

Classic-`<script>` canvas game, no build step. Open `index.html`, or serve the folder (`python3 -m http.server 8123`).
Read `README.md` (file map) and `lovable.md` (rules for the hosted Lovable copy) first.

## Standing rules
1. Cutscenes must not announce the end of the game unless told to.
2. Edit with exact-match replacements; later script declarations override earlier ones (wrapper pattern); `index.html` load order matters.
3. Test by running the game. Update tests and the README when behaviour changes; recount the README per-file line counts and totals after every change (also the script count in `lovable.md`).
4. `js/45b-dev-panel.js` must stay out of the website build. Keep the Lovable `GR` export/save bridge and keep saves backward compatible.
5. No shake-reduction setting. Present ideas as NUMBERED lists, never bullets.
6. Verify visual work with screenshots.

## Testing in a cloud / Linux session
- Windows-only runner: `tools/qa-run.ps1` (Edge). Cloud runner: `tools/qa-cloud.mjs` (Playwright Chromium, full game from `index.html`).
- One-time setup: `cd tools && npm install && npx playwright install --with-deps chromium`
- Run: `node tools/qa-cloud.mjs my.js --shot my.png --wait 20000`, then look at the PNG. Scenario format and the `GR`/`QA` API are in `tools/QA-GUIDE.md`.
- `qa-cloud.mjs` was written on Windows without Node installed, so it has never been run. First job in the cloud: run it with a tiny scenario (`GR.handleAction('splash-go'); QA.done({ok:1})`) and fix anything that breaks.
- Headless frames are throttled: use `GR.step` loops, not wall-clock waits. Gym/town state lives in `Town.gym`, `Save.data.town.gym`.
