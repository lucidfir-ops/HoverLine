"""Write CREDITS.md: every source with its licence and credit line, and every recording in the library with the
original files it was made from.
    python3 tools/credits.py            -> CREDITS.md (and a copy in out/samples/)"""
import json, os, re, collections, shutil
D = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
man = json.load(open(os.path.join(D, 'out', 'samples', 'manifest.json')))
files = json.load(open(os.path.join(D, 'out', 'files.json')))
srcs = json.load(open(os.path.join(D, 'sources.json')))
prov = {}
pd = os.path.join(D, 'work', 'prep', 'provenance')
if os.path.isdir(pd):
    for f in os.listdir(pd):
        prov.update(json.load(open(os.path.join(pd, f))))
PREP = os.path.join(D, 'work', 'prep')
# Sonic Pi's README gives the freesound page of each sample
spurl = {}
rd = os.path.join(D, 'raw', 'sonic-pi', 'etc', 'samples', 'README.md')
keep = os.path.join(D, 'prep', 'sonicpi_samples_README.md')
if os.path.exists(rd):
    shutil.copy(rd, keep)
rd = keep
if os.path.exists(rd):
    for m in re.finditer(r'`:(\w+)` - (\S+)', open(rd).read()):
        spurl[m.group(1)] = m.group(2)
import subprocess
CF = os.path.join(D, 'prep', 'commits.json')
COMMITS = json.load(open(CF)) if os.path.exists(CF) else {}


def commit(d):
    """The commit the files came from: from the clone in raw/ if it is there (and remembered), else remembered."""
    try:
        c = subprocess.run(['git', '-C', os.path.join(D, 'raw', d), 'rev-parse', 'HEAD'], capture_output=True, text=True).stdout.strip()
    except Exception:
        c = ''
    if c:
        COMMITS[d] = c
        json.dump(COMMITS, open(CF, 'w'), indent=1, sort_keys=True)
    return COMMITS.get(d, 'HEAD')
REPO = {'virtuosity_drums': 'https://github.com/sfzinstruments/virtuosity_drums/blob/%s/' % commit('virtuosity_drums'),
        'VCSL': 'https://github.com/sgossner/VCSL/blob/%s/' % commit('VCSL'),
        'VSCO-2-CE': 'https://github.com/sgossner/VSCO-2-CE/blob/%s/' % commit('VSCO-2-CE'),
        'sonic-pi': 'https://github.com/sonic-pi-net/sonic-pi/blob/%s/' % commit('sonic-pi')}


def originals(i):
    out = []
    for p in files.get(i, []):
        rel = os.path.relpath(p, PREP)
        out += prov.get(rel, [os.path.relpath(p, D)])
    return out


def link(o):
    if o.startswith('freepats/'):
        repo, rest = o.split('/')[1], '/'.join(o.split('/')[2:])
        return '[%s](https://github.com/freepats/%s/blob/%s/%s)' % (o.split('/')[-1], repo, commit('freepats/' + repo), rest.replace(' ', '%20'))
    for k, u in REPO.items():
        if o.startswith(k + '/'):
            name = o.split('/')[-1]
            extra = ''
            if k == 'sonic-pi':
                s = name.rsplit('.', 1)[0]
                if s in spurl:
                    extra = ' ([freesound](%s))' % spurl[s]
            return '[%s](%s%s)%s' % (name, u, o[len(k) + 1:].replace(' ', '%20'), extra)
    return o


L = ['# Hoverline sample library: credits', '',
     'Every recording in `samples/` is CC0 1.0 (public domain) or CC BY 4.0, or was synthesised for Hoverline (CC0). '
     'Nothing here is BY-SA, NC, "royalty-free" or of unverified origin.', '', '## Sources', '',
     'Links point at the exact commits the files were taken from.', '',
     '| Source | Licence | Credit line | Where |', '| --- | --- | --- | --- |']
used = collections.Counter(s['src'] for s in man['sounds'].values())
for k, S in srcs.items():
    if used[k]:
        L.append('| %s | %s | %s | %s |' % (S['name'], S['licence'], S['credit'], S['url']))
L += ['', 'CC BY 4.0 (MuldjordKit) requires this credit wherever the game or its music is published: '
      '"Drum samples provided by DrumGizmo.org." (MuldjordKit by Lars Muldjord, FreePats version by Roberto).', '',
      '## Every recording', '', 'Sound id, its source and licence, and the original files it was made from (several when '
      'mic positions were mixed; "derived" round robins are small retunings of the recording before them).', '']
bykit = collections.OrderedDict()
for i, s in man['sounds'].items():
    bykit.setdefault(i.split('.')[0], []).append(i)
for kit, ids in bykit.items():
    K = man['kits'].get(kit) or man['instruments'].get(kit) or {}
    L += ['### %s: %s' % (kit, K.get('label', kit)), '', '| Sound | Source | Licence | Made from |', '| --- | --- | --- | --- |']
    for i in ids:
        s = man['sounds'][i]
        S = srcs.get(s['src'], {})
        o = originals(i)
        L.append('| `%s` | %s | %s | %s |' % (i, S.get('name', s['src']), S.get('licence', '?'), '; '.join(link(x) for x in o)))
    L.append('')
open(os.path.join(D, 'CREDITS.md'), 'w').write('\n'.join(L) + '\n')
shutil.copy(os.path.join(D, 'CREDITS.md'), os.path.join(D, 'out', 'samples', 'CREDITS.md'))
print('CREDITS.md', len(L), 'lines')
