"""Phrases for the synth auditions (times in seconds, MIDI notes). Used by mkjobs.py."""
def sd(bpm): return 60 / bpm / 4

def lead(bpm=140, key=0, i='anthem', v=0.9, base=72, t0=0.1, o=None, hi=True):
    """two bars: held notes, an eighth run, a leap up, and a long ending; then the top of the range"""
    s = sd(bpm); ev = []
    seq = [(0, 0, 3), (3, 3, 1), (4, 7, 4), (8, 5, 2), (10, 3, 2), (12, 2, 4), (16, 0, 2), (18, 3, 2), (20, 7, 2), (22, 10, 2), (24, 12, 6), (30, 10, 2)]
    for st, p, d in seq: ev.append(dict(i=i, t=t0 + st * s, m=base + key + p, d=d * s, v=v, o=o or {}))
    if hi:
        for j, p in enumerate([12, 15, 19, 24]): ev.append(dict(i=i, t=t0 + (32 + j * 2) * s, m=base + key + p, d=2 * s, v=v, o=o or {}))
    return ev

def stabs(bpm=128, key=0, i='fmbrass', v=0.9, base=60, t0=0.1):
    s = sd(bpm); ev = []
    for bar in range(2):
        for st in (2, 6, 10, 14):
            for p in (0, 3, 7): ev.append(dict(i=i, t=t0 + (bar * 16 + st) * s, m=base + key + p + (bar * 5 if bar else 0), d=s * 1.2, v=v))
    return ev

def acid(bpm=130, key=0, i='tb303', base=36, t0=0.1, bassP=False, o=None):
    """two bars of a 303 line: s=step, p=semitones, a=accent, l=slide into this note"""
    s = sd(bpm); ev = []
    pat = [(0, 0, 1, 0), (1, 0, 0, 0), (2, 12, 0, 1), (3, 0, 0, 0), (5, 3, 1, 0), (6, 0, 0, 0), (7, 15, 0, 1), (8, 12, 1, 0), (10, 0, 0, 0), (11, 7, 0, 1), (12, 10, 1, 0), (13, 0, 0, 0), (14, 12, 0, 1), (15, 3, 0, 0)]
    for bar in range(2):
        for st, p, a, l in pat:
            if bassP: ev.append(dict(i=i, bass=1, t=t0 + (bar * 16 + st) * s, m=base + key + p, d=s, acc=a, sl=l))
            else: ev.append(dict(i=i, t=t0 + (bar * 16 + st) * s, m=base + key + p, d=s * 0.85, v=0.85, o=dict(dict(accent=a, slide=bool(l)), **(o or {}))))
    return ev

def bass(bpm=172, key=0, i='reese7', base=36, t0=0.1, bassP=False, o=None):
    s = sd(bpm); ev = []
    pat = [(0, 0, 6), (6, 0, 2), (8, 3, 4), (12, -2, 4), (16, 0, 6), (22, 5, 2), (24, 3, 4), (28, 7, 4)]
    for st, p, d in pat:
        if bassP: ev.append(dict(i=i, bass=1, t=t0 + st * s, m=base + key + p, d=d * s))
        else: ev.append(dict(i=i, t=t0 + st * s, m=base + key + p, d=d * s * 0.95, v=0.85, o=o or {}))
    return ev

def pads(bpm=120, key=0, i='warmpad', t0=0.1, v=0.9):
    s = sd(bpm); ev = []
    for j, ch in enumerate([(0, 3, 7), (-4, 0, 3), (-2, 2, 5), (-5, -1, 2)]):
        ev.append(dict(i=i, chord=1, t=t0 + j * 16 * s, m=[60 + key + p for p in ch], d=16 * s * 0.98, v=v))
    return ev

def world(bpm=110, key=2, i='erhu', base=67, t0=0.1, v=0.9):
    """a pentatonic line with slides in and a held note (vibrato)"""
    s = sd(bpm); ev = []; pc = [0, 2, 4, 7, 9]
    seq = [(0, 0, 2, 0), (2, 2, 2, -2), (4, 4, 4, 0), (8, 7, 2, -1), (10, 4, 2, 0), (12, 2, 4, -2), (16, 0, 3, 0), (19, -3, 1, 0), (20, 0, 4, -2), (24, 4, 8, -2)]
    for st, p, d, b in seq:
        o = {}
        if b: o['bend'] = b
        if d >= 4: o['vib'] = 1
        ev.append(dict(i=i, t=t0 + st * s, m=base + key + p, d=d * s, v=v, o=o))
    return ev
