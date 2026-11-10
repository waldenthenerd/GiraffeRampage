// Cross-platform QA runner (Linux/cloud/macOS/Windows): same scenarios as qa-run.ps1, but with Playwright's Chromium and the FULL game
// (index.html's script list, so town, sea and gym code are all loaded; tools/qa.html is kept in sync by sync-gallery.mjs).
//
// usage: node tools/qa-cloud.mjs <scenario.js> [--shot out.png] [--params "view=boss&ch=3"] [--seed 12345] [--w 1280] [--h 720] [--scale 1] [--touch] [--wait 20000]
//        [--draw all|sampled] [--profile] [--heap]
// setup (once): cd tools && npm install && npx playwright install --with-deps chromium
// prints one JSON line: {"done":true,"result":...,"errors":[...],"logs":[...]}   (see tools/QA-GUIDE.md for how to write scenarios)
// --draw sampled draws only some of the frames GR.step makes (what tools/ci-check.sh uses; see the harness in tools/qa.html); all, the default, draws every one.
// A list of scenarios in one browser is tools/qa-batch.mjs; both share tools/qa-lib.mjs.
import fs from 'node:fs';
import path from 'node:path';
import { repo, serve, launch, options, runCheck } from './qa-lib.mjs';

const args = process.argv.slice(2);
const scenario = args.find((a, i) => !a.startsWith('--') && !(i > 0 && args[i - 1].startsWith('--')));
if (!scenario) { console.error('usage: node tools/qa-cloud.mjs <scenario.js> [--shot out.png] [--params "a=1&b=2"] [--seed N] [--w N] [--h N] [--scale N] [--touch] [--wait ms] [--draw all|sampled]'); process.exit(2); }
const o = options(args);
const root = process.env.QA_ROOT ? path.resolve(process.env.QA_ROOT) : repo;
const scenarioAbs = path.resolve(scenario);
const { server, port } = await serve(root, scenarioAbs);
const browser = await launch();

let cdp = null;
const out = await runCheck(browser, port, scenarioAbs, o, {
  async before(ctx, pg) {
    if (o.heap) { cdp = await ctx.newCDPSession(pg); await cdp.send('HeapProfiler.enable'); await cdp.send('HeapProfiler.startSampling', { samplingInterval: 2048, includeObjectsCollectedByMajorGC: true, includeObjectsCollectedByMinorGC: true }); }
    if (o.profile) { cdp = await ctx.newCDPSession(pg); await cdp.send('Profiler.enable'); await cdp.send('Profiler.setSamplingInterval', { interval: 200 }); await cdp.send('Profiler.start'); }
  },
  async after(pg) {
    if (o.heap) {                                       // --heap: which functions allocate the most (everything the page allocated, collected or not), as a table on stderr
      const { profile: hp } = await cdp.send('HeapProfiler.stopSampling'); const by = new Map();
      (function walk(n) { const k = (n.callFrame.functionName || '(anonymous)') + ' ' + path.basename(n.callFrame.url) + ':' + (n.callFrame.lineNumber + 1); by.set(k, (by.get(k) || 0) + n.selfSize); n.children.forEach(walk); })(hp.head);
      const tot = [...by.values()].reduce((a, b) => a + b, 0); console.error('--- allocations (KB, % of ' + (tot / 1024).toFixed(0) + ' KB) ---');
      [...by.entries()].sort((a, b) => b[1] - a[1]).slice(0, 40).forEach(([k, v]) => console.error((v / 1024).toFixed(0).padStart(8) + ' ' + (100 * v / tot).toFixed(1).padStart(5) + '%  ' + k));
    } else if (o.profile) {                             // --profile: top functions by self time, as a table on stderr
      const { profile: pr } = await cdp.send('Profiler.stop'); const self = new Map(), byId = new Map(pr.nodes.map(n => [n.id, n]));
      const dt = pr.timeDeltas; for (let i = 0; i < pr.samples.length; i++) { const n = byId.get(pr.samples[i]); const k = n.callFrame.functionName + ' ' + path.basename(n.callFrame.url) + ':' + (n.callFrame.lineNumber + 1); self.set(k, (self.get(k) || 0) + (dt[i] || 0)); }
      const tot = [...self.values()].reduce((a, b) => a + b, 0); console.error('--- profile (self ms, % of ' + (tot / 1000).toFixed(0) + ' ms) ---');
      [...self.entries()].sort((a, b) => b[1] - a[1]).slice(0, 40).forEach(([k, v]) => console.error((v / 1000).toFixed(1).padStart(8) + ' ' + (100 * v / tot).toFixed(1).padStart(5) + '%  ' + k));
    }
    if (o.shot) { await pg.waitForTimeout(300); await pg.screenshot({ path: o.shot, clip: { x: 0, y: 0, width: o.w, height: o.h } }); }
  }
});
fs.writeFileSync(scenarioAbs + '.json', out);
console.log(out);
if (o.shot) console.log('screenshot: ' + o.shot);
await browser.close();
server.close();
