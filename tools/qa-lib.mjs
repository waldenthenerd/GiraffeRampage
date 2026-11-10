// What tools/qa-cloud.mjs (one scenario) and tools/qa-batch.mjs (a list of them in one browser) share: the QA page, the file server, the browser,
// and one check in a fresh browser context (its own empty storage, as if it were the only one).
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

export const here = path.dirname(fileURLToPath(import.meta.url));
export const repo = path.resolve(here, '..');

// The QA page: the real index.html of that copy plus the harness block that lives in qa.html (single source of truth for the QA object).
export function qaPage(root) {
  const qaHtml = fs.readFileSync(path.join(here, 'qa.html'), 'utf8');
  const m = qaHtml.match(/<script>\s*\/\* QA harness[\s\S]*?<\/script>/);
  if (!m) throw new Error('could not find the QA harness block in tools/qa.html');
  return fs.readFileSync(path.join(root, 'index.html'), 'utf8').replace('</body>', m[0] + '\n</body>');
}

const types = { '.js': 'text/javascript', '.css': 'text/css', '.html': 'text/html', '.png': 'image/png', '.svg': 'image/svg+xml', '.json': 'application/json', '.mp3': 'audio/mpeg', '.ogg': 'audio/ogg', '.woff2': 'font/woff2', '.txt': 'text/plain' };
// One server for one copy of the game. /qa-full.html is the QA page; /__scenario.js?f=<absolute path> is a scenario (any file under tools/scenarios,
// or the one file given as `only`). The game's files are read once and kept, since every check asks for the same two hundred of them.
export async function serve(root, only) {
  const page = qaPage(root), mem = new Map(), scen = path.join(repo, 'tools', 'scenarios') + path.sep;
  const server = http.createServer((req, res) => {
    const [p, qs] = req.url.split('?'), u = decodeURIComponent(p);
    if (u === '/' || u === '/qa-full.html') { res.writeHead(200, { 'content-type': 'text/html' }); return res.end(page); }
    if (u === '/__scenario.js') {
      const f = only || path.resolve(new URLSearchParams(qs || '').get('f') || '');
      if (!(f === only || f.startsWith(scen)) || !fs.existsSync(f)) { res.writeHead(404); return res.end(); }
      res.writeHead(200, { 'content-type': 'text/javascript', 'cache-control': 'no-store' }); return res.end(fs.readFileSync(f));
    }
    const f = path.join(root, u);
    if (!f.startsWith(root)) { res.writeHead(404); return res.end(); }
    let body = mem.get(f);
    if (body === undefined) { body = fs.existsSync(f) && !fs.statSync(f).isDirectory() ? fs.readFileSync(f) : null; if (/[\\/](js|css)[\\/]/.test(f)) mem.set(f, body); }
    if (body === null) { res.writeHead(404); return res.end(); }
    res.writeHead(200, { 'content-type': types[path.extname(f)] || 'application/octet-stream' }); res.end(body);
  });
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  return { server, port: server.address().port };
}

// Pinned playwright may want a different Chromium revision than the one pre-installed (cloud: PLAYWRIGHT_BROWSERS_PATH); QA_CHROMIUM overrides, else fall back to any installed chromium-*/chrome-linux/chrome.
function findChromium() {
  if (process.env.QA_CHROMIUM) return process.env.QA_CHROMIUM;
  const base = process.env.PLAYWRIGHT_BROWSERS_PATH;
  if (!base || !fs.existsSync(base)) return undefined;
  for (const d of fs.readdirSync(base).filter(n => /^chromium-\d+$/.test(n)).sort().reverse()) {
    for (const rel of ['chrome-linux/chrome', 'chrome-linux64/chrome']) { const f = path.join(base, d, rel); if (fs.existsSync(f)) return f; }
  }
  return undefined;
}
const launchArgs = ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--autoplay-policy=no-user-gesture-required', '--no-sandbox', '--enable-precise-memory-info'];
export async function launch() {
  try { return await chromium.launch({ args: launchArgs }); }
  catch (e) { const exe = findChromium(); if (!exe) throw e; return chromium.launch({ args: launchArgs, executablePath: exe }); }
}

// Parse runner options (the same words qa-cloud.mjs takes) into an object.
export function options(words) {
  const opt = (n, d) => { const i = words.indexOf('--' + n); return i >= 0 ? words[i + 1] : d; };
  return { w: +opt('w', 1280), h: +opt('h', 720), scale: +opt('scale', 1), wait: +opt('wait', 20000), seed: opt('seed', '12345'), params: opt('params', ''),
    shot: opt('shot', ''), touch: words.includes('--touch'), draw: opt('draw', process.env.QA_DRAW || 'all'), profile: words.includes('--profile'), heap: words.includes('--heap') };
}

// One check: a fresh context and page, the scenario, its result as the JSON line the runner prints. `hooks.before(ctx, pg)` / `hooks.after(pg)` let
// qa-cloud.mjs add its profiler and screenshot. The result comes back the moment QA.done is called (an exposed function), with a slow poll behind it
// for a page whose harness is older than that.
export async function runCheck(browser, port, scenarioAbs, o, hooks = {}) {
  const ctx = await browser.newContext({ viewport: { width: o.w, height: o.h }, deviceScaleFactor: o.scale, hasTouch: o.touch, isMobile: o.touch });
  /* the game asks once how she plays (touch or keyboard and mouse); a test has already answered, so the question does not stand in front of the menu */
  await ctx.addInitScript(function(mode){ try { if (!localStorage.getItem('giraffe_rampage_save_v1')) localStorage.setItem('giraffe_rampage_save_v1', JSON.stringify({ inputMode: mode })); } catch (e) {} }, o.touch ? 'touch' : 'mouse');
  let signal; const doneP = new Promise(r => { signal = r; });
  await ctx.exposeFunction('__qaDone', () => { signal(); });
  const pg = await ctx.newPage();
  const pageErrors = [];
  pg.on('pageerror', e => pageErrors.push(String(e)));
  const url = `http://127.0.0.1:${port}/qa-full.html?s=${encodeURIComponent('/__scenario.js?f=' + scenarioAbs)}&seed=${o.seed}&draw=${o.draw}${o.params ? '&' + o.params : ''}`;
  if (hooks.before) await hooks.before(ctx, pg);
  await pg.goto(url);
  let out = null;
  try {
    const poll = pg.waitForFunction(() => window.QA && window.QA.result !== null, null, { timeout: o.wait, polling: 1000 });
    await Promise.race([doneP.then(() => pg.waitForFunction(() => window.QA && window.QA.result !== null, null, { timeout: o.wait })), poll]);
    poll.catch(() => {});
    out = await pg.evaluate(() => JSON.stringify({ done: true, result: QA.result, errors: QA.errors, logs: QA.logs, draw: QA.draw }));
  } catch (e) {
    out = await pg.evaluate(() => window.QA ? JSON.stringify({ done: false, result: null, errors: QA.errors, logs: QA.logs }) : null).catch(() => null);
    if (!out) out = JSON.stringify({ done: false, result: null, errors: ['no result: the scenario did not run, never called QA.done, or the page did not load'].concat(pageErrors), logs: [] });
  }
  if (hooks.after) await hooks.after(pg);
  await ctx.close();
  return out;
}
