// Runs a list of browser checks in ONE browser, each in its own fresh context (its own empty storage, exactly as when run alone), N at a time,
// longest first as listed. tools/ci-check.sh uses it, so Node, Playwright, the browser and the file servers start once instead of once per check.
//
// usage: node tools/qa-batch.mjs <list> <out-dir> [--jobs N] [--fail-fast]
//   list lines: "<n>|<label>|<site folder or empty>|<scenario name>|<runner options>"   (the options are qa-cloud.mjs's: --touch --w 390 --params ...)
//   for each line it writes <out-dir>/<n>.out (the JSON line qa-cloud.mjs would print) and <out-dir>/<n>.res ("pass <s>" or "fail <s>"),
//   and prints "  done <label> (<s>s)" as each one ends.
import fs from 'node:fs';
import path from 'node:path';
import { repo, serve, launch, options, runCheck } from './qa-lib.mjs';

const args = process.argv.slice(2);
const [listFile, outDir] = args;
const jobs = Math.max(1, +(args[args.indexOf('--jobs') + 1] || 1) || 1), failFast = args.includes('--fail-fast');   /* --fail-fast: start no new check after one fails */
if (!listFile || !outDir) { console.error('usage: node tools/qa-batch.mjs <list> <out-dir> [--jobs N]'); process.exit(2); }
const checks = fs.readFileSync(listFile, 'utf8').split('\n').filter(Boolean).map(l => {
  const [n, label, site, name, opts] = l.split('|');
  return { n, label, site: site ? path.resolve(site) : repo, name, words: (opts || '').split(/\s+/).filter(Boolean) };
});
const servers = new Map();
async function portFor(site) { if (!servers.has(site)) servers.set(site, serve(site)); return (await servers.get(site)).port; }

let browser = await launch();
async function one(c) {
  const t0 = Date.now(), o = options(c.words); o.wait = Math.max(o.wait, 240000);
  let out;
  try { out = await runCheck(browser, await portFor(c.site), path.join(repo, 'tools', 'scenarios', c.name + '.js'), o); }
  catch (e) { out = JSON.stringify({ done: false, result: null, errors: ['the runner failed: ' + String(e && e.message || e)], logs: [] }); }
  const secs = Math.round((Date.now() - t0) / 1000), pass = /"pass":true/.test(out);
  fs.writeFileSync(path.join(outDir, c.n + '.out'), out + '\n');
  fs.writeFileSync(path.join(outDir, c.n + '.res'), (pass ? 'pass ' : 'fail ') + secs + '\n');
  fs.appendFileSync(path.join(outDir, 'times.tsv'), c.label + '\t' + ((Date.now() - t0) / 1000).toFixed(1) + '\n');
  console.log('  done ' + c.label + ' (' + secs + 's)' + (pass ? '' : ' FAILED'));
  if (!pass && failFast) stop = true;
}
let next = 0, stop = false;
async function worker() {
  while (next < checks.length && !stop) {
    const c = checks[next++];
    if (!browser.isConnected()) browser = await launch();            /* a crashed browser takes only its own check with it */
    await one(c);
  }
}
await Promise.all(Array.from({ length: Math.min(jobs, checks.length) }, worker));
await browser.close().catch(() => {});
for (const s of servers.values()) (await s).server.close();
