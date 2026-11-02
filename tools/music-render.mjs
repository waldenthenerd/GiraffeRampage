// Draw the game's music into a WAV file, offline, with the real band engine (js/audio/02e-02g): nothing is recorded live.
//
// usage: node tools/music-render.mjs <theme> [--bars 32] [--out song.wav] [--solo part] [--mute part,part] [--at "<keyframes>"]
//   <theme>     any song in BAND_SONGS or MUSIC_THEMES (savanna, town, boss3, minigame...)
//   --at        how the game changes as the song plays, bar by bar: "0:run=1,I=0.2,rest=1;6:rest=0,I=0.5;20:I=0.9;34:theme=boss1,lvl=2"
//               (keys: theme, lvl 0-3, run 0/1, I 0-1 the fight's intensity, rest 0/1 between waves, low 0-1 nearly dead, dense 0/1,
//               shift semitones, tempo, jump a section to go to next). Each keyframe holds until the next one.
//   --list      print every song and its name instead
// It serves the repository, opens the game in Playwright's Chromium, calls Band.render and writes the file.
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const here = path.dirname(fileURLToPath(import.meta.url)), root = path.resolve(here, '..');
const args = process.argv.slice(2), opt = (n, d) => { const i = args.indexOf('--' + n); return i >= 0 ? args[i + 1] : d; };
const theme = args.find((a, i) => !a.startsWith('--') && !(i > 0 && args[i - 1].startsWith('--')));
const list = args.includes('--list');
if (!theme && !list) { console.error('usage: node tools/music-render.mjs <theme> [--bars 32] [--out song.wav] [--solo part] [--mute a,b] [--at "0:I=0.3;8:I=0.9"] | --list'); process.exit(2); }
const bars = +opt('bars', 32), out = opt('out', (theme || 'song') + '.wav'), at = opt('at', ''), solo = opt('solo', ''), mute = opt('mute', '');

const types = { '.js': 'text/javascript', '.css': 'text/css', '.html': 'text/html', '.png': 'image/png', '.svg': 'image/svg+xml', '.json': 'application/json' };
const server = http.createServer((req, res) => {
  const u = decodeURIComponent(req.url.split('?')[0]), f = path.join(root, u === '/' ? 'index.html' : u);
  if (!f.startsWith(root) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'content-type': types[path.extname(f)] || 'application/octet-stream' }); res.end(fs.readFileSync(f));
});
await new Promise(r => server.listen(0, '127.0.0.1', r));
const browser = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required', '--no-sandbox'] });
const pg = await browser.newPage();
await pg.goto(`http://127.0.0.1:${server.address().port}/`);
await pg.waitForFunction(() => typeof Band !== 'undefined');
if (list) {
  console.log(await pg.evaluate(() => Object.keys(BAND_SONGS).map(k => k.padEnd(11) + (BAND_SONGS[k].name || '')).join('\n')));
} else {
  const b64 = await pg.evaluate(async ({ theme, bars, at, solo, mute }) => {
    const keys = at ? at.split(';').map(s => { const [b, kv] = s.split(':'); const o = {}; (kv || '').split(',').filter(Boolean).forEach(p => { const [k, v] = p.split('='); o[k] = isNaN(+v) ? v : +v; }); return { b: +b, o }; }).sort((a, b) => a.b - b.b) : [];
    const fn = bar => { const w = { theme }; keys.forEach(k => { if (k.b <= bar){ const o = Object.assign({}, k.o); if ('jump' in o){ if (k.b === bar) w.jump = o.jump; delete o.jump; } Object.assign(w, o); } }); w.run = !!w.run; w.rest = !!w.rest; w.dense = !!w.dense; return w; };
    const muted = {}; mute.split(',').filter(Boolean).forEach(p => { muted[p] = true; });
    const secs = [];
    const buf = await Band.render({ theme, bars, at: fn, solo: solo || null, mute: mute ? muted : null, onBar: S => secs.push(S.secName + (S.secBar ? '' : '*')) });
    const bytes = new Uint8Array(Band.wav(buf)); let s = '';
    for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
    return { b64: btoa(s), secs };
  }, { theme, bars, at, solo, mute });
  fs.writeFileSync(out, Buffer.from(b64.b64, 'base64'));
  console.log('sections by bar (* a new one): ' + b64.secs.join(' '));
  console.log('wrote ' + out + ' (' + (fs.statSync(out).size / 1048576).toFixed(1) + ' MB)');
}
await browser.close();
server.close();
