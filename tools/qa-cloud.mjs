// Cross-platform QA runner (Linux/cloud/macOS/Windows): same scenarios as qa-run.ps1, but with Playwright's Chromium and the FULL game
// (index.html's script list, so town, sea and gym code are all loaded; tools/qa.html is an older, shorter list).
//
// usage: node tools/qa-cloud.mjs <scenario.js> [--shot out.png] [--params "view=boss&ch=3"] [--seed 12345] [--w 1280] [--h 720] [--wait 20000]
// setup (once): cd tools && npm install && npx playwright install --with-deps chromium
// prints one JSON line: {"done":true,"result":...,"errors":[...],"logs":[...]}   (see tools/QA-GUIDE.md for how to write scenarios)
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const args = process.argv.slice(2);
const opt = (n, d) => { const i = args.indexOf('--' + n); return i >= 0 ? args[i + 1] : d; };
const scenario = args.find((a, i) => !a.startsWith('--') && !(i > 0 && args[i - 1].startsWith('--')));
if (!scenario) { console.error('usage: node tools/qa-cloud.mjs <scenario.js> [--shot out.png] [--params "a=1&b=2"] [--seed N] [--w N] [--h N] [--wait ms]'); process.exit(2); }
const W = +opt('w', 1280), H = +opt('h', 720), waitMs = +opt('wait', 20000), seed = opt('seed', '12345'), params = opt('params', ''), shot = opt('shot', '');

// Build the QA page from the real index.html plus the harness block that lives in qa.html (single source of truth for the QA object).
const qaHtml = fs.readFileSync(path.join(here, 'qa.html'), 'utf8');
const m = qaHtml.match(/<script>\s*\/\* QA harness[\s\S]*?<\/script>/);
if (!m) { console.error('could not find the QA harness block in tools/qa.html'); process.exit(2); }
let page = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
page = page.replace('</body>', m[0] + '\n</body>');

const types = { '.js': 'text/javascript', '.css': 'text/css', '.html': 'text/html', '.png': 'image/png', '.svg': 'image/svg+xml', '.json': 'application/json', '.mp3': 'audio/mpeg', '.ogg': 'audio/ogg', '.woff2': 'font/woff2' };
const scenarioAbs = path.resolve(scenario);
const server = http.createServer((req, res) => {
  const u = decodeURIComponent(req.url.split('?')[0]);
  if (u === '/' || u === '/qa-full.html') { res.writeHead(200, { 'content-type': 'text/html' }); return res.end(page); }
  if (u === '/__scenario.js') { res.writeHead(200, { 'content-type': 'text/javascript' }); return res.end(fs.readFileSync(scenarioAbs)); }
  const f = path.join(root, u);
  if (!f.startsWith(root) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'content-type': types[path.extname(f)] || 'application/octet-stream' }); res.end(fs.readFileSync(f));
});
await new Promise(r => server.listen(0, '127.0.0.1', r));
const port = server.address().port;

const browser = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--autoplay-policy=no-user-gesture-required'] });
const ctx = await browser.newContext({ viewport: { width: W, height: H } });
const pg = await ctx.newPage();
const pageErrors = [];
pg.on('pageerror', e => pageErrors.push(String(e)));
const url = `http://127.0.0.1:${port}/qa-full.html?s=${encodeURIComponent('/__scenario.js')}&seed=${seed}${params ? '&' + params : ''}`;
await pg.goto(url);
let out = null;
try {
  await pg.waitForFunction(() => window.QA && window.QA.result !== null, null, { timeout: waitMs });
  out = await pg.evaluate(() => JSON.stringify({ done: true, result: QA.result, errors: QA.errors, logs: QA.logs }));
} catch (e) {
  out = await pg.evaluate(() => window.QA ? JSON.stringify({ done: false, result: null, errors: QA.errors, logs: QA.logs }) : null).catch(() => null);
  if (!out) out = JSON.stringify({ done: false, result: null, errors: ['no result: the scenario did not run, never called QA.done, or the page did not load'].concat(pageErrors), logs: [] });
}
if (shot) { await pg.waitForTimeout(300); await pg.screenshot({ path: shot, clip: { x: 0, y: 0, width: W, height: H } }); }
fs.writeFileSync(scenarioAbs + '.json', out);
console.log(out);
if (shot) console.log('screenshot: ' + shot);
await browser.close();
server.close();
