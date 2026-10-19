#!/usr/bin/env python3
"""Recounts the README: the per-file line counts, the totals table, the 'without the developer panel' line, and the script count in lovable.md.
Run from anywhere:  python3 tools/recount-readme.py   (prints what changed; add --check to change nothing and exit 1 if a recount is needed, as CI does; run it after every change to a js/ or css/ file or to index.html).
A file's count is its number of lines, counting a last line that has no final newline (so it can be one higher than `wc -l`)."""
import glob, os, re, sys
root = os.path.dirname(os.path.dirname(os.path.abspath(__file__))); os.chdir(root)
def rd(p): return open(p, encoding='utf-8').read()
def cnt(p):
    b = open(p, 'rb').read(); return b.count(b'\n') + (0 if b.endswith(b'\n') or not b else 1), len(b)
js, css = sorted(glob.glob('js/*.js')), sorted(glob.glob('css/*.css'))
jl, jb = sum(cnt(p)[0] for p in js), sum(cnt(p)[1] for p in js)
cl, cb = sum(cnt(p)[0] for p in css), sum(cnt(p)[1] for p in css)
il, ib = cnt('index.html'); dl, db = cnt('js/45b-dev-panel.js')
mib = lambda b: '%.2f MiB (%s bytes)' % (b / 1048576, format(b, ','))
kib = lambda b: ('%.0f KiB' % (b / 1024) if b >= 102400 else '%.1f KiB' % (b / 1024)) + ' (%s bytes)' % format(b, ',')
s0 = s = rd('README.md')
s = re.sub(r'\| `((?:js|css)/[^`]+)` \| \d+ \|', lambda m: '| `%s` | %d |' % (m.group(1), cnt(m.group(1))[0]) if os.path.exists(m.group(1)) else m.group(0), s)
s = re.sub(r'\| JavaScript \(`js/`\) \| \d+ \| [\d,]+ \| [^|]+\|', '| JavaScript (`js/`) | %d | %s | %s |' % (len(js), format(jl, ','), mib(jb)), s)
s = re.sub(r'\| Styles \(`css/`\) \| \d+ \| [\d,]+ \| [^|]+\|', '| Styles (`css/`) | %d | %s | %s |' % (len(css), format(cl, ','), kib(cb)), s)
s = re.sub(r'\| Page \(`index.html`\) \| 1 \| [\d,]+ \| [^|]+\|', '| Page (`index.html`) | 1 | %s | %s |' % (format(il, ','), kib(ib)), s)
s = re.sub(r'\| \*\*Whole game\*\* \| \*\*\d+\*\* \| \*\*[\d,]+\*\* \| \*\*[^|]+\*\* \|', '| **Whole game** | **%d** | **%s** | **%s** |' % (len(js) + len(css) + 1, format(jl + cl + il, ','), mib(jb + cb + ib)), s)
s = re.sub(r'\*\*[\d,]+ lines, [\d.]+ MiB \([\d,]+ bytes\)\*\*', '**%s lines, %s**' % (format(jl + cl + il - dl, ','), mib(jb + cb + ib - db)), s, count=1)
missing = [p for p in js + css if '`%s`' % p not in s]
check = '--check' in sys.argv
if s != s0 and not check: open('README.md', 'w', encoding='utf-8').write(s)
l0 = l = rd('lovable.md'); l = re.sub(r'\((\d+) scripts;', '(%d scripts;' % len(js), l, count=1)
if l != l0 and not check: open('lovable.md', 'w', encoding='utf-8').write(l)
verb = 'is out of date' if check else 'updated'
print('README.md %s, lovable.md %s (%d scripts, %d stylesheets).' % (verb if s != s0 else 'already right', verb if l != l0 else 'already right', len(js), len(css)))
if check and (s != s0 or l != l0): print('Run: python3 tools/recount-readme.py'); sys.exit(1)
if missing: print('Not in the README file map yet (add a row for each):', ', '.join(missing)); sys.exit(1)
