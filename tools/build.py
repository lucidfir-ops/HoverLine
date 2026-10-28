"""Build the playable files from src/hoverline.html.

  python3 tools/build.py

Writes index.html (a full page for itch.io or any web host), dist/hoverline-itch.zip and dist/hoverline-wifi-host.zip.
src/hoverline.html is the page body as published on Claude; the reference/ builds use the same format.
"""
import os, zipfile, shutil
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
src = open(os.path.join(ROOT, 'src', 'hoverline.html'), encoding='utf-8').read()
head = '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover,user-scalable=no">'
i = src.find('</style>') + len('</style>')
page = head + src[:i] + '</head><body>' + src[i:] + '</body></html>'
open(os.path.join(ROOT, 'index.html'), 'w', encoding='utf-8').write(page)
dist = os.path.join(ROOT, 'dist'); os.makedirs(dist, exist_ok=True)
with zipfile.ZipFile(os.path.join(dist, 'hoverline-itch.zip'), 'w', zipfile.ZIP_DEFLATED) as z:
    z.write(os.path.join(ROOT, 'index.html'), 'index.html')
with zipfile.ZipFile(os.path.join(dist, 'hoverline-wifi-host.zip'), 'w', zipfile.ZIP_DEFLATED) as z:
    z.write(os.path.join(ROOT, 'index.html'), 'hoverline-wifi/index.html')
    for f in os.listdir(os.path.join(ROOT, 'wifi-host')):
        z.write(os.path.join(ROOT, 'wifi-host', f), 'hoverline-wifi/' + f)
print('built index.html and dist/*.zip')
