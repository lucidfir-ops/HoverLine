"""Build the playable files from src/ (the page, its styles and its scripts as separate files; see docs/ARCHITECTURE.md).

  python3 tools/build.py

Writes index.html (a full page for itch.io or any web host), dist/hoverline-itch.zip, dist/hoverline-offline.html
(Three.js inside, plays with no internet) and dist/hoverline-wifi-host.zip (which carries the offline page).
The itch.io and Wi-Fi zips also carry songs/ (Songs mode's recorded tracks) and samples/ (the sample library,
Prototype 45: manifest.json and one .bin pack per kit or instrument) beside the page. dist/hoverline-offline.zip is the
full download: the offline page as index.html with samples/ in its file:// form (manifest.js and one .js script per
pack, since a page opened from a file can load scripts but not fetch). dist/hoverline-offline.html stays a single
file: it plays on the recordings inside the page, as before.
build/hoverline.html is the joined page body (what src/hoverline.html held up to Prototype 48), written for tools and tests.
"""
import os, zipfile, shutil
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
import sys; sys.path.insert(0, os.path.join(ROOT, 'tools'))
from assemble import assemble
src = assemble(os.path.join(ROOT, 'src'))      # the page body, joined from src/ (Prototype 49; see docs/ARCHITECTURE.md)
os.makedirs(os.path.join(ROOT, 'build'), exist_ok=True)
open(os.path.join(ROOT, 'build', 'hoverline.html'), 'w', encoding='utf-8', newline='').write(src)   # the joined body, for tools and tests
head = '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover,user-scalable=no"><meta name="mobile-web-app-capable" content="yes"><meta name="apple-mobile-web-app-capable" content="yes"><meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">'
i = src.find('</style>') + len('</style>')
page = head + src[:i] + '</head><body>' + src[i:] + '</body></html>'
open(os.path.join(ROOT, 'index.html'), 'w', encoding='utf-8').write(page)
dist = os.path.join(ROOT, 'dist'); os.makedirs(dist, exist_ok=True)
SONGS = os.path.join(ROOT, 'songs')
SAMPLES = os.path.join(ROOT, 'samples')
# Songs mode routes its audio element through WebAudio, which Chrome silences for file:// media ("outputs zeroes due to
# CORS access restrictions"), so songs/ would be dead weight in the file:// download; set True if Songs learns to play
# without WebAudio there.
OFFLINE_SONGS = False


def add_samples(z, pre, script=False):
    """The sample library beside the page. Packs are FLAC already, so they are stored, not deflated. script=True writes
    the file:// form: manifest.js and <pack>.js (base64 inside), which zip deflates back to about the binary size."""
    import json, base64
    mf = os.path.join(SAMPLES, 'manifest.json')
    if not os.path.exists(mf): return
    text = open(mf, encoding='utf-8').read()
    man = json.loads(text)
    if script:
        z.writestr(pre + 'samples/manifest.js', 'HLSMP_MAN(' + text.strip() + ');\n', zipfile.ZIP_DEFLATED)
    else:
        z.writestr(pre + 'samples/manifest.json', text, zipfile.ZIP_DEFLATED)
    for name, P in sorted(man['packs'].items()):
        data = open(os.path.join(SAMPLES, P['file']), 'rb').read()
        assert len(data) == P['bytes'], 'samples/' + P['file'] + ' does not match the manifest: rebuild the library'
        if script:
            z.writestr(pre + 'samples/' + P['file'][:-4] + '.js', 'HLSMP_PACK(' + json.dumps(name) + ',"' + base64.b64encode(data).decode() + '");\n', zipfile.ZIP_DEFLATED)
        else:
            z.writestr(pre + 'samples/' + P['file'], data, zipfile.ZIP_STORED)
    for extra in ('README.md', 'CREDITS.md'):
        f = os.path.join(SAMPLES, extra)
        if os.path.exists(f): z.write(f, pre + 'samples/' + extra, zipfile.ZIP_DEFLATED)
    # the spoken tabla bols (Prototype 45), one FLAC per bol, fetched as files, so not in the file:// form
    vb = os.path.join(SAMPLES, 'vox-bols')
    if not script and os.path.isdir(vb):
        for f in sorted(os.listdir(vb)):
            if f.endswith('.flac'): z.write(os.path.join(vb, f), pre + 'samples/vox-bols/' + f, zipfile.ZIP_STORED)
def add_songs(z, pre):
    """Songs mode's tracks (CC0, see README) and their list, beside the page; the MP3s are stored, not deflated."""
    if not os.path.isdir(SONGS): return
    for f in sorted(os.listdir(SONGS)):
        if f.endswith('.mp3') or f == 'songs.json':
            z.write(os.path.join(SONGS, f), pre + 'songs/' + f, zipfile.ZIP_STORED if f.endswith('.mp3') else zipfile.ZIP_DEFLATED)
with zipfile.ZipFile(os.path.join(dist, 'hoverline-itch.zip'), 'w', zipfile.ZIP_DEFLATED) as z:
    z.write(os.path.join(ROOT, 'index.html'), 'index.html')
    add_songs(z, '')
    add_samples(z, '')
tag = '<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>'
three = open(os.path.join(ROOT, 'vendor', 'three.min.js'), encoding='utf-8').read()
offline = page.replace(tag, '<script>' + three + '</script>')
open(os.path.join(dist, 'hoverline-offline.html'), 'w', encoding='utf-8').write(offline)
with zipfile.ZipFile(os.path.join(dist, 'hoverline-wifi-host.zip'), 'w', zipfile.ZIP_DEFLATED) as z:
    z.writestr('hoverline-wifi/index.html', offline)
    add_songs(z, 'hoverline-wifi/')
    add_samples(z, 'hoverline-wifi/')
    for f in os.listdir(os.path.join(ROOT, 'wifi-host')):
        z.write(os.path.join(ROOT, 'wifi-host', f), 'hoverline-wifi/' + f)
with zipfile.ZipFile(os.path.join(dist, 'hoverline-offline.zip'), 'w', zipfile.ZIP_DEFLATED) as z:
    z.writestr('hoverline/index.html', offline)
    add_samples(z, 'hoverline/', script=True)
    if OFFLINE_SONGS: add_songs(z, 'hoverline/')
print('built index.html, dist/hoverline-offline.html and dist/*.zip')
