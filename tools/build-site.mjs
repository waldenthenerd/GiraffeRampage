// Builds the website copy of the game: index.html + css/ + js/ with the scripts joined, in index.html order, into a few larger files and minified.
// The source in js/ and css/ is never touched. Called by tools/make-lovable-package.sh:   node tools/build-site.mjs <output folder>
// Needs terser from tools/node_modules (cd tools && npm ci).
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.resolve(process.argv[2] || '');
if (!process.argv[2]) { console.error('usage: node tools/build-site.mjs <output folder>'); process.exit(2); }
let terser, acorn;
try { const req = createRequire(import.meta.url); terser = req('terser'); acorn = req('acorn'); } catch (e) { console.error('terser is missing: run  cd tools && npm ci'); process.exit(2); }
const BUNDLES = 6;                                   // about this many script files (more when the strict / sloppy mode changes)
const hash = s => crypto.createHash('sha256').update(s).digest('hex').slice(0, 8);

let html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const tagRe = /^[ \t]*<script src="(js\/[^"\r\n]+)"[^>]*><\/script>[^\r\n]*\r?\n/gm;
const srcs = [...html.matchAll(tagRe)].map(m => m[1]).filter(f => !/js\/dev\//.test(f));
if (!srcs.length) throw new Error('no game scripts in index.html');

// 1. A script of its own sees a later script's `const` as "not there yet", so `typeof LaterThing` is 'undefined'; inside one joined file the same
//    name is in its dead zone and `typeof` throws. So a top-level const / let that some file tests with `typeof` is joined as a `var`
//    (a var reads as undefined until it is set, which is what a script that has not run yet looks like).
const texts = srcs.map(f => fs.readFileSync(path.join(root, f), 'utf8'));
const asts = texts.map((t, i) => acorn.parse(t, { ecmaVersion: 'latest', sourceType: 'script' }));
const typeofNames = new Set();
(function walk(n) { if (!n || typeof n.type !== 'string') return; if (n.type === 'UnaryExpression' && n.operator === 'typeof' && n.argument.type === 'Identifier') typeofNames.add(n.argument.name);
  for (const k in n) { const v = n[k]; if (Array.isArray(v)) v.forEach(walk); else if (v && typeof v.type === 'string') walk(v); } })({ type: 'X', body: asts });
const idents = p => p.type === 'Identifier' ? [p.name] : p.type === 'ObjectPattern' ? p.properties.flatMap(q => idents(q.value || q.argument)) : p.type === 'ArrayPattern' ? p.elements.filter(Boolean).flatMap(idents) : p.type === 'AssignmentPattern' ? idents(p.left) : p.type === 'RestElement' ? idents(p.argument) : [];
const toVar = new Set();
function varify(i) {                                                  // the file's text with the chosen top-level const / let turned into var
  let t = texts[i]; const cuts = [];
  for (const n of asts[i].body) if (n.type === 'VariableDeclaration' && n.kind !== 'var' && n.declarations.some(d => idents(d.id).some(x => typeofNames.has(x)))) { cuts.push(n); n.declarations.forEach(d => idents(d.id).forEach(x => toVar.add(x))); }
  for (const n of asts[i].body) if (n.type === 'ClassDeclaration' && typeofNames.has(n.id.name)) throw new Error(srcs[i] + ': class ' + n.id.name + ' is tested with typeof; the builder cannot join it');
  for (const n of cuts.reverse()) t = t.slice(0, n.start) + 'var' + t.slice(n.start + n.kind.length);
  return t;
}

// 2. minify each file on its own, so a mistake is blamed on the right file
const pieces = [];
for (const [i, f] of srcs.entries()) {
  const code = varify(i);
  const r = process.env.NOMIN ? { code } : await terser.minify(code, { compress: { passes: 1 }, mangle: true, keep_fnames: true, keep_classnames: true, format: { comments: false, ascii_only: false } });
  if (r.error || !r.code) throw new Error(f + ': ' + (r.error || 'empty output'));
  const strict = /^\s*(['"])use strict\1/.test(code);                       // a "use strict" in the middle of a bundle means nothing, so a bundle is all strict or all sloppy
  pieces.push({ f, strict, code: r.code.replace(/^(['"])use strict\1;?/, ''), srcBytes: texts[i].length });
}
const total = pieces.reduce((n, p) => n + p.code.length, 0);

// 3. join neighbours into about BUNDLES files of similar size, never mixing strict and sloppy
const bundles = []; let cur = null, acc = 0;
for (const p of pieces) {
  const full = cur && cur.strict === p.strict && acc >= total / BUNDLES * bundles.length && bundles.length < BUNDLES;
  if (!cur || cur.strict !== p.strict || full) { cur = { strict: p.strict, parts: [] }; bundles.push(cur); }
  cur.parts.push(p); acc += p.code.length;
}
fs.mkdirSync(path.join(outDir, 'js'), { recursive: true }); fs.mkdirSync(path.join(outDir, 'css'), { recursive: true });
const jsNames = [];
bundles.forEach((b, i) => {
  const body = (b.strict ? '"use strict";\n' : '') + b.parts.map(p => p.code).join(';\n') + '\n';
  const name = 'js/game-' + (i + 1) + '-' + hash(body) + '.js';
  fs.writeFileSync(path.join(outDir, name), body); jsNames.push(name);
});

// 4. the stylesheets: comments and spare whitespace out, joined in index.html order
const cssSrcs = [...html.matchAll(/<link rel="stylesheet" href="(css\/[^"]+)">\s*\r?\n/g)].map(m => m[1]);
const css = cssSrcs.map(f => fs.readFileSync(path.join(root, f), 'utf8')
  .replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ').replace(/ ?([{};]) ?/g, '$1').replace(/;}/g, '}').trim()).join('\n') + '\n';
const cssName = 'css/game-' + hash(css) + '.css';
fs.writeFileSync(path.join(outDir, cssName), css);

// 5. index.html: the first script tag becomes the bundles, the other script and stylesheet tags go
let first = true;
html = html.replace(tagRe, (m, src) => /js\/dev\//.test(src) ? '' : first ? (first = false, jsNames.map(n => '<script src="' + n + '"></script>\n').join('')) : '');
let firstCss = true;
html = html.replace(/<link rel="stylesheet" href="css\/[^"]+">\s*\r?\n/g, () => firstCss ? (firstCss = false, '<link rel="stylesheet" href="' + cssName + '">\n') : '');
if (/45b-dev-panel/.test(html)) throw new Error('the developer panel line is still in index.html');
fs.writeFileSync(path.join(outDir, 'index.html'), html);

const src = pieces.reduce((n, p) => n + p.srcBytes, 0);
if (toVar.size) console.log('joined as var (tested with typeof elsewhere): %d names', toVar.size);
if (process.env.VARS) console.log([...toVar].join(' '));
console.log('site: %d scripts -> %d files (%s), %s of source -> %s; css %d -> 1',
  srcs.length, jsNames.length, jsNames.join(', '), (src / 1048576).toFixed(2) + ' MiB', (total / 1048576).toFixed(2) + ' MiB', cssSrcs.length);
