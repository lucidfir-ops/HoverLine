#!/usr/bin/env python3
"""One command to check a change: build, syntax-check the joined script, then the smoke test in a browser.
  python3 tools/check.py            (add --no-browser to skip the browser part)"""
import os, subprocess, sys
R = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
def run(c, **k): print('$', ' '.join(c)); return subprocess.run(c, cwd=R, **k).returncode
if run([sys.executable, 'tools/build.py']): sys.exit('build failed')
s = open(os.path.join(R, 'build', 'hoverline.html'), encoding='utf-8').read(); k = s.rfind('<script>'); l = s.rfind('</script>')
os.makedirs(os.path.join(R, 'build'), exist_ok=True); js = os.path.join(R, 'build', 'main.js'); open(js, 'w', encoding='utf-8').write(s[k + 8:l])
if run(['node', '--check', js]): sys.exit('syntax error in the joined script (build/main.js); the line number points into it')
print('syntax ok')
if '--no-browser' not in sys.argv and run(['node', 'tools/tests/smoke.js']): sys.exit('smoke test failed')
print('all checks passed')
