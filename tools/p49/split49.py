#!/usr/bin/env python3
"""Prototype 49: split src/hoverline.html into src/ modules. Run once; tools/build.py joins them back, byte for byte."""
import os, re, sys
R = sys.argv[1]; S = open(R + '/src/hoverline.html', encoding='utf-8').read()
OUT = R + '/src'
def w(p, t):
    p = os.path.join(OUT, p); os.makedirs(os.path.dirname(p), exist_ok=True); open(p, 'w', encoding='utf-8', newline='').write(t)
# --- the page: style, markup, vendor scripts, main script
a = S.index('<style>') + 7; b = S.index('</style>')
g0 = S.index('<script type="text/plain" id="ggwaveJs">'); g0 = S.index('>', g0) + 1; g1 = S.index('</script>', g0)
q0 = S.index('<script type="text/plain" id="jsqrJs">'); q0 = S.index('>', q0) + 1; q1 = S.index('</script>', q0)
m0 = S.index('<script>\n(()=>{'); m0 += len('<script>'); m1 = S.rindex('</script>')
assert a < b < g0 < g1 < q0 < q1 < m0 < m1
w('css/hoverline.css', S[a:b]); w('vendor/ggwave.js', S[g0:g1]); w('vendor/jsqr.min.js', S[q0:q1])
page = S[:a] + '<!--#include css/hoverline.css-->' + S[b:g0] + '<!--#include vendor/ggwave.js-->' + S[g1:q0] + '<!--#include vendor/jsqr.min.js-->' + S[q1:m0] + '<!--#js-->' + S[m1:]
w('page.html', page)
# --- the main script: one file per section
J = S[m0:m1]; lines = J.split('\n'); lines = [l + '\n' for l in lines[:-1]] + [lines[-1]]
base = S[:m0].count('\n') + 1          # source line of J's first line
mk = [0]
for i, l in enumerate(lines):
    n = base + i
    if l.startswith('/* ---------- ') or (l.startswith('  /* ---- ') and 4376 <= n < 5775) or (l.startswith('/* ---- ') and (3253 <= n < 3955 or 8984 <= n < 9656)) or n in (4373, 4376):
        if i not in mk: mk.append(i)
mk.append(len(lines))
AREAS = [(1167, 'core'), (2244, 'track'), (2688, 'ships'), (2733, 'audio'), (3955, 'music'), (4269, 'music/synths'), (4373, 'music/samples'),
         (5775, 'music/engine'), (6054, 'input'), (6320, 'weapons'), (6880, 'race'), (7068, 'race'), (8001, 'ui'), (9656, 'net'),
         (10031, 'loop'), (10**9, 'ui')]
def area(n):
    for lim, a in AREAS:
        if n < lim: return a
def slug(l):
    t = re.sub(r'^\s*/\* -+\s*|\s*-+\s*\*/.*$|\(Prototype [^)]*\)', '', l.strip())
    t = re.split(r'[:.;(]| -+', t)[0].strip().lower()
    t = re.sub(r'[^a-z0-9]+', '-', t).strip('-')
    return (t or 'part')[:40]
RN = {'music-data': 'themes-grooves-timbres-codes', 'hooks-from-the-all-the-music-space': 'hooks', 'blueprints-from-the-synth-reference-guid': 'blueprints',
      'the-200-blueprint-library': 'library-200', 'music-variety': ['variety-p34', 'variety-p38'], 'evolving-composer': 'composer', 'the-sound-lab': 'sound-lab',
      'song-templates': ['templates', 'template-tunes'], 'the-generators': 'generators', 'melodies-with-intent': 'melodies', 'what-eric-s-prototype-44-race-logs-said': 'log-lean',
      'how-often-each-track-was-raced-on-your-o': 'track-plays', 'the-library': ['library-loader', 'library-kept'], 'engine-0': 'engine-analog', 'engine-1': 'engine-fm',
      'engine-2': 'engine-acid', 'engine-3': 'engine-modal', 'synth-instruments': 'instruments', 'smp': 'sample-library', 'songs': 'songs-mode', 'const-music': 'music-object',
      'the-sound-lab-at-work': 'sound-lab-voices', 'tunes': 'tune-state', 'reactive-race-music': 'reactive', 'once-per-bar': 'per-bar', 'ambient': 'ambient',
      'transport-race-hooks': 'transport', 'music-modes': 'modes', 'instruments': 'instrument-voices', 'one-sixteenth-of-the-arrangement': ['step-classic', 'step-blueprint'],
      'the-answering-voices': 'answers', 'one-sixteenth-of-a-template-tune': 'step-template', 'menus-with-a-pad-or-the-keys': 'menu-navigation',
      'debris-sparks-smoke-fireworks-and-confet': 'effects', 'each-frame-its-own-way': 'frame-styles', 'prototype-43': 'drift-and-collisions', 'flow': 'race-flow',
      'full-screen-and-the-controls-screen': 'fullscreen-controls', 'set-orientation': 'orientation', 'menu-pages': 'menu-pages', 'career-home-frame-select-and-guidance': 'career-home',
      'the-career-page': 'career-page', 'the-frame-s-own-tutorial-step': 'frame-tutorial', 'multiplayer-transport': 'transport', 'wi-fi-with-no-internet': 'wifi-no-internet',
      'multiplayer-session': 'session', 'multiplayer': 'lobby-field', 'same-room-no-internet': ['pairing-screens', 'pairing-by-sound'], 'graphics-options-at-work': 'graphics-options',
      'the-finished-race-s-log': 'race-log-share', 'the-quiet-hud-and-the-prompts': 'hud-prompts', 'the-screens': 'screens', 'entering-racing-and-leaving': 'enter-race-leave',
      '3d-track-preview': 'track-preview', 'ships-builds': 'ships-builds', 'in-game-leaderboard': 'leaderboard', 'on-screen-keyboard': 'osk', 'the-multiplayer-screen': 'mp-screen',
      'weapons-over-the-network': 'net-weapons', 'name-tags-over-the-other-pilots': 'name-tags', 'test-sound': 'test-sound'}
order, used, k = [], set(), 0
for s, e in zip(mk, mk[1:]):
    if s == e: continue
    n = base + s; ar = area(n); nm = 'start' if s == 0 else slug(lines[s])
    if n == 4376: nm = 'const-music'
    if n == 4373: nm = 'songs'
    k += 1
    body = ''.join(lines[s:e]); out = []
    for l in body.split('\n'):
        if len(l) > 40000:                       # a base64 blob: its own asset file
            key = re.match(r'\s*(?:const |let |var )?([A-Za-z0-9_.]+)', l).group(1).lower().replace('.', '-')
            an = f'assets/{key}.js'; assert an not in used; used.add(an); w(an, l); out.append('//#include ' + an)
        else: out.append(l)
    body = '\n'.join(out)
    if nm in RN: nm = RN[nm] if isinstance(RN[nm], str) else RN[nm].pop(0)
    fn = f'js/{ar}/{k:03d}-{nm}.js'
    if n == 4373: ar = 'music/samples'
    head = ''
    if ar == 'music/engine' and n > 4376: head = '//# A fragment of the `music` object literal (it opens in music/engine/*-music-object.js): methods only, not a stand-alone script.\n'
    head = f'//# {fn[3:]}: from line {n} of the old single file\n' + head
    w(fn, head + body); order.append(fn)
w('js/ORDER', '\n'.join(order) + '\n')
print(len(order), 'script parts;', len(used), 'assets')
