"""Build the playable files from src/hoverline.html.

  python3 tools/build.py

Writes index.html (a full page for itch.io or any web host), dist/hoverline-itch.zip, dist/hoverline-offline.html
(Three.js inside, plays with no internet) and dist/hoverline-wifi-host.zip (which carries the offline page).
src/hoverline.html is the page body as published on Claude; the reference/ builds use the same format.
"""
import os, zipfile, shutil
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
src = open(os.path.join(ROOT, 'src', 'hoverline.html'), encoding='utf-8').read()
head = '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover,user-scalable=no"><meta name="mobile-web-app-capable" content="yes"><meta name="apple-mobile-web-app-capable" content="yes"><meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">'
i = src.find('</style>') + len('</style>')
page = head + src[:i] + '</head><body>' + src[i:] + '</body></html>'
open(os.path.join(ROOT, 'index.html'), 'w', encoding='utf-8').write(page)
dist = os.path.join(ROOT, 'dist'); os.makedirs(dist, exist_ok=True)
with zipfile.ZipFile(os.path.join(dist, 'hoverline-itch.zip'), 'w', zipfile.ZIP_DEFLATED) as z:
    z.write(os.path.join(ROOT, 'index.html'), 'index.html')
tag = '<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>'
three = open(os.path.join(ROOT, 'vendor', 'three.min.js'), encoding='utf-8').read()
offline = page.replace(tag, '<script>' + three + '</script>')
open(os.path.join(dist, 'hoverline-offline.html'), 'w', encoding='utf-8').write(offline)
with zipfile.ZipFile(os.path.join(dist, 'hoverline-wifi-host.zip'), 'w', zipfile.ZIP_DEFLATED) as z:
    z.writestr('hoverline-wifi/index.html', offline)
    for f in os.listdir(os.path.join(ROOT, 'wifi-host')):
        z.write(os.path.join(ROOT, 'wifi-host', f), 'hoverline-wifi/' + f)
print('built index.html, dist/hoverline-offline.html and dist/*.zip')
