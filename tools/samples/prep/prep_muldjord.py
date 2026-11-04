"""The big rock / metal kit: MuldjordKit by Lars Muldjord (FreePats version, CC BY 4.0: "Drum samples provided by
DrumGizmo.org"). Two kick drums (left and right foot, so double kicks alternate like a real double pedal), a snare in
three layers, closed and open hats, two crashes, a china, ride and bell, four toms. Files are numbered softest first.

    python3 prep_muldjord.py fetch ; python3 prep_muldjord.py
"""
from common import *
import subprocess
from prep_virtuosity import mono, comp
MK = os.path.join(RAW, 'freepats', 'muldjordkit')
F = lambda d, n, stem=None: os.path.join(MK, 'samples', d, '%d-%s.flac' % (n, stem or d))
SEL = {  # voice: [(vel range, [(folder, number, stem)])]
    'kick': [([0, 0.55], [('KdrumL', 15, None), ('KdrumR', 15, None), ('KdrumL', 17, None), ('KdrumR', 17, None)]),
             ([0.55, 1], [('KdrumL', 21, None), ('KdrumR', 21, None), ('KdrumL', 23, None), ('KdrumR', 23, None), ('KdrumL', 24, None), ('KdrumR', 24, None)])],
    'snare': [([0, 0.35], [('Snare1', 15, 'Snare'), ('Snare2', 15, 'Snare'), ('Snare1', 20, 'Snare'), ('Snare2', 20, 'Snare')]),
              ([0.35, 0.7], [('Snare1', 33, 'Snare'), ('Snare2', 33, 'Snare'), ('Snare1', 39, 'Snare'), ('Snare2', 39, 'Snare')]),
              ([0.7, 1], [('Snare1', 48, 'Snare'), ('Snare2', 48, 'Snare'), ('Snare1', 53, 'Snare'), ('Snare2', 53, 'Snare'), ('Snare1', 55, 'Snare'), ('Snare2', 55, 'Snare')])],
    'chh': [([0, 0.4], [('HihatClosed', n, None) for n in (8, 10, 12)]), ([0.4, 0.75], [('HihatClosed', n, None) for n in (16, 18, 20)]),
            ([0.75, 1], [('HihatClosed', n, None) for n in (24, 26, 27, 28)])],
    'ohh': [([0, 1], [('HihatOpen', n, None) for n in (22, 24, 26)])],
    'crash': [([0, 1], [('CrashL', n, None) for n in (8, 9)])],
    'china': [([0, 1], [('China', n, None) for n in (10, 11)])],
    'ride': [([0, 1], [('RideL', n, None) for n in (7, 8, 9)])],
    'rbell': [([0, 1], [('RideRBell', n, None) for n in (6, 8)])],
    'tomH': [([0, 0.6], [('Tom1', n, None) for n in (5, 6)]), ([0.6, 1], [('Tom1', n, None) for n in (9, 10)])],
    'tomM': [([0, 0.6], [('Tom2', n, None) for n in (6, 7)]), ([0.6, 1], [('Tom2', n, None) for n in (10, 11)])],
    'tomL': [([0, 0.6], [('Tom3', n, None) for n in (7, 8)]), ([0.6, 1], [('Tom3', n, None) for n in (12, 13)])],
    'tomF': [([0, 0.6], [('Tom4', n, None) for n in (11, 12)]), ([0.6, 1], [('Tom4', n, None) for n in (17, 18)])],
}
MAX = {'kick': (0.8, 0.45), 'snare': (0.7, 0.4), 'chh': (0.4, 0.22), 'ohh': (1.0, 0.6), 'crash': (2.4, 1.1), 'china': (2.0, 0.9),
       'ride': (1.8, 0.9), 'rbell': (1.8, 0.9), 'tomH': (1.1, 0.7), 'tomM': (1.2, 0.75), 'tomL': (1.3, 0.8), 'tomF': (1.5, 0.9)}

def fetch():
    pats = ['/LICENSE.txt', '/README.txt'] + ['/' + os.path.relpath(F(d, n, s), MK) for L in SEL.values() for _, sel in L for d, n, s in sel]
    subprocess.run(['git', '-C', MK, 'sparse-checkout', 'set', '--no-cone', '--stdin'], input='\n'.join(pats).encode(), check=True)

def build():
    out = os.path.join(PREP, 'muldjord')
    V = {}
    for voice, layers in SEL.items():
        Ls = []
        for li, (vel, sel) in enumerate(layers):
            for k, (d, n, s) in enumerate(sel):
                y = mono(F(d, n, s))
                if voice in ('kick', 'snare') or voice.startswith('tom'):
                    y = comp(y, SR, -15, 2.5, 0.005, 0.08)   # a little punch, as a rock mix would have
                if voice in ('chh', 'ohh', 'crash', 'crash2', 'china', 'ride', 'rbell'):
                    y = A.filt(A.filt(y, 'hp', 250, SR), 'hp', 250, SR)
                wav(os.path.join(out, '%s_v%d_r%d.wav' % (voice, li + 1, k + 1)), y, src=F(d, n, s))
            mx, fd = MAX[voice]
            Ls.append({'files': ['%s_v%d_r*.wav' % (voice, li + 1)], 'vel': vel, 'process': {'maxlen': mx, 'fade_from': fd}})
        V[voice] = Ls
    mapping('rock', {'kit': 'rock', 'label': 'Rock and metal (MuldjordKit)', 'family': 'acoustic', 'genres': ['metal', 'rock', 'drum & bass', 'breakcore', 'dubstep'],
                     'notes': 'MuldjordKit, a rock/metal kit recorded by Lars Muldjord (CC BY 4.0, credit: "Drum samples provided by DrumGizmo.org"). '
                              'kick alternates the left and right kick drums (a real double pedal); snare 3 layers; closed hats 3 layers; crash, china, '
                              'ride and bell; four toms (tomF is the floor tom).',
                     'source': 'muldjord', 'dir': '../work/prep/muldjord', 'voices': V, 'tags': ['acoustic', 'cc-by']})

if __name__ == '__main__':
    fetch() if sys.argv[1:] == ['fetch'] else build()
    print('ok')
