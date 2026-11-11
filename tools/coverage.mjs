// The coverage record: which checks the browser suite makes, so a change to the suite (splitting a scenario, a new runner) cannot lose one unseen.
// Every check's result object is turned into "group|key" lines: the group is the check's label without a " (part i of n)" ending, so a scenario split
// into parts still owns every key the whole scenario had; the keys are the result's field paths (two levels deep, arrays as []), and each key that held
// a true/false says so, since those are the things a scenario asserts.
//
//   node tools/coverage.mjs record <manifest>              manifest lines: "<label>\t<output file>"; prints the record, sorted
//   node tools/coverage.mjs check <baseline> <record...>   every line of the baseline must be in one of the records; exit 1 and list what is missing
//   node tools/coverage.mjs merge <record...>              join records (one per share) into one, sorted
//
// The baseline is tools/coverage-baseline.txt. A check that is meant to go (or a key a scenario no longer reports) is taken out of the baseline in the
// same pull request, where a reviewer sees it; it never disappears on its own.
import fs from 'node:fs';

const [cmd, ...rest] = process.argv.slice(2);
const group = label => label.replace(/ \(part \d+ of \d+\)$/, '');
function keys(prefix, v, depth, out) {
  if (Array.isArray(v)) { out.add(prefix + '[]'); return; }
  if (v && typeof v === 'object') {
    if (depth >= 2) { out.add(prefix + '{}'); return; }
    for (const k of Object.keys(v)) keys(prefix ? prefix + '.' + k : k, v[k], depth + 1, out);
    return;
  }
  out.add(prefix + (typeof v === 'boolean' ? ':bool' : ''));
}
function resultOf(file) {
  const txt = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '';
  for (const line of txt.split('\n').reverse()) { if (line.startsWith('{"done"')) { try { return JSON.parse(line).result; } catch (e) {} } }
  return null;
}
const readLines = f => fs.readFileSync(f, 'utf8').split('\n').filter(Boolean);

if (cmd === 'record') {
  const out = new Set();
  for (const line of readLines(rest[0])) {
    const [label, file] = line.split('\t'); const g = group(label), r = resultOf(file), ks = new Set();
    out.add(g + '|(ran)');
    if (r && typeof r === 'object') keys('', r, 0, ks); else if (r !== null) ks.add('(value)');
    for (const k of ks) out.add(g + '|' + k);
  }
  process.stdout.write([...out].sort().join('\n') + '\n');
} else if (cmd === 'merge') {
  const out = new Set(); for (const f of rest) readLines(f).forEach(l => out.add(l));
  process.stdout.write([...out].sort().join('\n') + '\n');
} else if (cmd === 'check') {
  const [base, ...recs] = rest, have = new Set();
  for (const f of recs) readLines(f).forEach(l => have.add(l));
  const want = readLines(base), missing = want.filter(l => !have.has(l));
  if (missing.length) { console.log(missing.length + ' of ' + want.length + ' recorded checks are missing:'); missing.slice(0, 60).forEach(l => console.log('  ' + l)); process.exit(1); }
  console.log('all ' + want.length + ' recorded checks are there');
} else { console.error('usage: node tools/coverage.mjs record <manifest> | check <baseline> <record...> | merge <record...>'); process.exit(2); }
