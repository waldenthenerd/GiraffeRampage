// Says in a few lines why a browser check failed, for tools/ci-check.sh: the keys that failed, the page errors and the last log lines, ahead of the
// raw result. The raw JSON line is cut short in the log, and the failed keys often came after the cut (a long value in front of them), so a failure
// could not be read without running the check again.   usage: node tools/ci-explain.mjs <check's .out file> [--errors]
//   --errors: only the page errors of a check that passed (ci-check.sh warns about those: a check can pass while the game throws).
import fs from 'node:fs';

const [file, mode] = process.argv.slice(2);
let o;
try { o = JSON.parse(fs.readFileSync(file, 'utf8').split('\n').find(l => l.trim()) || 'null'); } catch (e) { console.log('the result is not JSON: ' + String(e.message).slice(0, 120)); process.exit(0); }
if (!o) { console.log('no result'); process.exit(0); }
const cut = (v, n) => { const s = typeof v === 'string' ? v : JSON.stringify(v); return s.length > n ? s.slice(0, n) + '...' : s; };
const r = o.result && typeof o.result === 'object' ? o.result : {};
const errors = [].concat(o.errors || [], Array.isArray(r.errs) ? r.errs : [], Array.isArray(r.errors) ? r.errors : []).map(String);
if (mode === '--errors') { for (const e of [...new Set(errors)].slice(0, 3)) console.log(cut(e, 240)); process.exit(0); }

if (!o.done) console.log('it did not finish: the scenario never called QA.done within the wait (a stall, a script error before the end, or a page that did not load)');
const failed = Array.isArray(r.failed) ? r.failed.map(String) : [];
const falsy = Object.keys(r).filter(k => r[k] === false && k !== 'pass' && !failed.includes(k));
if (failed.length) console.log('failed: ' + cut(failed.join(', '), 400));
if (falsy.length) console.log((failed.length ? 'also false: ' : 'false: ') + cut(falsy.join(', '), 400));
for (const k of failed.concat(falsy).slice(0, 6)) {                     // what the scenario wrote beside a failed key (out.x and out.xInfo, out.x_n ...)
  const near = Object.keys(r).filter(n => n !== k && n.startsWith(k) && r[n] !== true && r[n] !== false).slice(0, 2);
  for (const n of near) console.log('  ' + n + ': ' + cut(r[n], 160));
}
if (errors.length) console.log('page errors: ' + cut([...new Set(errors)].slice(0, 3).join(' | '), 500));
const logs = Array.isArray(o.logs) ? o.logs : [];
if (logs.length) console.log('last log lines: ' + cut(logs.slice(-3).join(' | '), 300));
