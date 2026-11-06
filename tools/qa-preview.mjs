// Browser-visible version of the existing QA harness, for local interactive QA.
// node tools/qa-preview.mjs; visit /?s=/tools/scenarios/challenge-builder.js
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const harness = fs.readFileSync(path.join(root, 'tools/qa.html'), 'utf8').match(/<script>\s*\/\* QA harness[\s\S]*?<\/script>/)[0];
const page = fs.readFileSync(path.join(root, 'index.html'), 'utf8').replace('</body>', harness + '\n</body>');
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.json': 'application/json' };
const server = http.createServer((req, res) => {
  let route;
  try { route = decodeURIComponent(new URL(req.url, 'http://localhost').pathname); }
  catch (_) { res.writeHead(400); res.end(); return; }
  if (route === '/') { res.writeHead(200, { 'Content-Type': 'text/html', 'Cache-Control': 'no-store' }); res.end(page); return; }
  const file = path.resolve(root, '.' + route);
  if (!file.startsWith(root + path.sep) || !fs.existsSync(file) || !fs.statSync(file).isFile()) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
  fs.createReadStream(file).pipe(res);
});
server.listen(8133, '127.0.0.1', () => console.log('Local QA: http://127.0.0.1:8133/?s=/tools/scenarios/challenge-builder.js'));
