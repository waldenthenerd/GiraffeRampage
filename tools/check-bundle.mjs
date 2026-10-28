// Checks that the joined website copy behaves like the separate scripts: both are loaded in a browser (the developer panel left out of both) and every global the
// game defines is compared: its kind, and for a function its source, for an object how many keys it has. A script of its own and a joined file differ in two ways
// (a later `const` is "not there yet" instead of in its dead zone, and a later function declaration is not hoisted into an earlier file), so a new `typeof Later`
// guard that runs while the scripts load can make the two differ; this finds it. The joined copy here is not minified (a minified function reads differently);
// the minified package is tested by the scenarios that ci-check.sh runs on it.   usage: node tools/check-bundle.mjs
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import http from 'node:http';
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
const here = path.dirname(fileURLToPath(import.meta.url)), root = path.resolve(here, '..');
const req = createRequire(import.meta.url);
const acorn = req('acorn'), { chromium } = req('playwright');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const files = [...html.matchAll(/<script src="(js\/[^"]+)"/g)].map(m => m[1]).filter(f => !/js\/dev\//.test(f));
const noDev = html.split('\n').filter(l => !/js\/dev\//.test(l)).join('\n');

// every top-level name the scripts declare (const, let, var, function, class), so lexical ones, which are not on window, are compared too
const names = new Set();
for (const f of files) for (const n of acorn.parse(fs.readFileSync(path.join(root, f), 'utf8'), { ecmaVersion: 'latest' }).body) {
  if (n.type === 'FunctionDeclaration' || n.type === 'ClassDeclaration') names.add(n.id.name);
  else if (n.type === 'VariableDeclaration') for (const d of n.declarations) (function w(p) { if (!p) return; if (p.type === 'Identifier') names.add(p.name); else if (p.type === 'ObjectPattern') p.properties.forEach(q => w(q.value || q.argument)); else if (p.type === 'ArrayPattern') p.elements.forEach(w); else if (p.type === 'AssignmentPattern') w(p.left); })(d.id);
}

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'gr-bundle-'));
execFileSync('node', [path.join(here, 'build-site.mjs'), tmp], { env: { ...process.env, NOMIN: '1' }, stdio: ['ignore', 'pipe', 'inherit'] });

function serve(dir, indexText) {
  const types = { '.js': 'text/javascript', '.css': 'text/css', '.html': 'text/html' };
  const srv = http.createServer((q, r) => {
    let u = q.url.split('?')[0]; if (u === '/') u = '/index.html';
    if (u === '/index.html' && indexText) { r.writeHead(200, { 'content-type': 'text/html' }); return r.end(indexText); }
    const f = path.join(dir, u); if (!f.startsWith(dir) || !fs.existsSync(f)) { r.writeHead(404); return r.end(); }
    r.writeHead(200, { 'content-type': types[path.extname(f)] || 'application/octet-stream' }); r.end(fs.readFileSync(f));
  });
  return new Promise(res => srv.listen(0, '127.0.0.1', () => res(srv)));
}
async function fingerprint(browser, srv) {
  const page = await browser.newPage(), errs = [];
  page.on('pageerror', e => errs.push(e.message.slice(0, 200)));
  await page.goto('http://127.0.0.1:' + srv.address().port + '/'); try { await page.waitForFunction(() => typeof window.GR === 'object', null, { timeout: 20000 }); } catch (e) { errs.push('the game did not start (window.GR is missing)'); await page.close(); return { fp: {}, errs }; }
  await page.waitForTimeout(500);
  const fp = await page.evaluate(list => { const o = {};
    for (const k of list) { let v, t; try { v = (0, eval)(k); t = typeof v; } catch (e) { o[k] = 'throws'; continue; }
      o[k] = t === 'function' ? 'f:' + String(v) : t === 'object' && v ? 'o:' + Object.keys(v).length : t; }
    return o; }, [...names]);
  await page.close(); return { fp, errs };
}
const browser = await chromium.launch(process.env.QA_CHROMIUM ? { executablePath: process.env.QA_CHROMIUM } : {});
const s1 = await serve(root, noDev), s2 = await serve(tmp, null);
const a = await fingerprint(browser, s1), b = await fingerprint(browser, s2);
await browser.close(); s1.close(); s2.close(); fs.rmSync(tmp, { recursive: true, force: true });
const diffs = [...names].filter(k => a.fp[k] !== b.fp[k]);
console.log('page errors, separate scripts:', a.errs.length, '; joined:', b.errs.length, '; names compared:', names.size, '; different:', diffs.length);
for (const k of diffs.slice(0, 20)) console.log('  DIFF', k, '|', String(a.fp[k]).slice(0, 70).replace(/\s+/g, ' '), '|', String(b.fp[k]).slice(0, 70).replace(/\s+/g, ' '));
if (a.errs.length || b.errs.length || diffs.length) { console.log('errors:', a.errs.concat(b.errs).slice(0, 5)); process.exit(1); }
console.log('the joined copy matches the separate scripts');
