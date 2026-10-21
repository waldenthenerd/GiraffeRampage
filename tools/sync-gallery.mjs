// Keep the three developer pages in index.html load order, including the optional dev panel.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const check = process.argv.includes('--check');
const scripts = [...fs.readFileSync(path.join(root, 'index.html'), 'utf8').matchAll(/^[ \t]*<script src="js\/[^"\r\n]+"[^>]*><\/script>[^\r\n]*/gm)].map(m => m[0].trim().replace('src="js/', 'src="../js/'));
if (!scripts.length) throw new Error('No game scripts in index.html');
let stale = 0;
for (const file of ['enemy-gallery.html', 'scenery-preview.html', 'qa.html']) {
  const target = path.join(root, 'tools', file), old = fs.readFileSync(target, 'utf8'), nl = old.includes('\r\n') ? '\r\n' : '\n';
  const block = '<!-- scripts:begin -->' + nl + scripts.join(nl) + nl + '<!-- scripts:end -->';
  let next;
  if (old.includes('<!-- scripts:begin -->')) {
    if ((old.match(/<!-- scripts:begin -->/g) || []).length !== 1 || (old.match(/<!-- scripts:end -->/g) || []).length !== 1) throw new Error(file + ': ambiguous script markers');
    next = old.replace(/<!-- scripts:begin -->[\s\S]*?<!-- scripts:end -->/, block);
  } else {
    // Migrate old pages once. Inline dev-panel comments split the old PowerShell regex's runs,
    // making it expand one list into several; only tags, comments and whitespace may lie here.
    const tags = [...old.matchAll(/<script src="\.\.\/js\/[^"\r\n]+"[^>]*><\/script>/g)];
    if (!tags.length) throw new Error(file + ': no game script list');
    const start = tags[0].index, last = tags[tags.length - 1], end = last.index + last[0].length;
    const region = old.slice(start, end);
    if (region.replace(/<script src="\.\.\/js\/[^"\r\n]+"[^>]*><\/script>/g, '').replace(/<!--[\s\S]*?-->/g, '').trim()) throw new Error(file + ': unexpected content between game scripts');
    const tail = old.slice(end).replace(/^[ \t]*<!-- developer panel:[^\r\n]*-->/, '');
    next = old.slice(0, start) + block + tail;
  }
  const actual = [...next.matchAll(/<script src="\.\.\/js\/([^"]+)"/g)].map(m => m[1]);
  const expected = scripts.map(s => s.match(/src="\.\.\/js\/([^"]+)"/)[1]);
  if (JSON.stringify(actual) !== JSON.stringify(expected)) throw new Error(file + ': scripts outside the marked list or an invalid list');
  if (next !== old) { stale++; console.log(file + (check ? ' is out of date' : ' synced')); if (!check) fs.writeFileSync(target, next); }
}
if (check && stale) { console.error('Run: node tools/sync-gallery.mjs'); process.exitCode = 1; }
else console.log('All three tool pages list ' + scripts.length + ' scripts in index.html order.');
