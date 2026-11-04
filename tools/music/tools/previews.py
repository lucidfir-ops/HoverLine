#!/usr/bin/env python3
"""The preview set. python3 previews.py jobs > jobs.json ; python3 previews.py encode <wavdir> <outdir>"""
import json, sys, os, subprocess, re
SPEC = json.load(open('/home/claude/p43/music/new/catalogue_spec.json'))
BY = {e['n']: e for e in SPEC['templates']}
# (template, why it is in the set)
PICK = [
 ('Wet Asphalt', 'Agnostic guide sub-genre 1, wave / drift phonk (RACE 001): 808 cowbell riff over a reese'),
 ('Slap Shot', 'Agnostic guide sub-genre 2, glitch-hop / neuro-funk (RACE 037): slap bass, clavisynth riff'),
 ('Work Groove', 'Agnostic guide sub-genre 3, industrial / cyberpunk techno (RACE 069): square bass, no melody'),
 ('Horn Pump', 'Agnostic guide sub-genre 4, bass house / tech house (RACE 103): horn stabs, sub only'),
 ('Two-Octave Sub', 'Agnostic guide sub-genre 5, dubstep / tearout (RACE 137): growl line, sub drops, chops'),
 ('Downhill 155', 'Agnostic guide sub-genre 6, eurobeat / high-speed trance (RACE 168): the line on a stacked-saw lead'),
 ('Rain Glass', 'RACE 007, wave phonk: no hook, upright piano chords in a rain-soaked pad'),
 ('Acid Resonance', 'RACE 073, acid techno: the acid line is the only melody'),
 ('Clean Sub', 'RACE 106, tech house: house piano chords, congas'),
 ('Screech Vowel', 'RACE 135, dubstep: the screech lead on the line'),
 ('Hall Pluck', 'RACE 170, high-speed trance: a pluck arpeggio through a dotted echo'),
 ('Aggressive Riff', 'MIDI guide track 01: the nine-note riff on a clipped saw'),
 ('Euphoric Floor', 'MIDI guide track 02: euphoric supersaw line'),
 ('Tritone Reese', 'MIDI guide track 03: the neuro reese line, no melody'),
 ('Liquid Pluck', 'MIDI guide track 04: liquid electric piano'),
 ('Jump Glide', 'MIDI guide track 05: jump-up glide bass and vocal chops'),
 ('Pedal Pluck', 'MIDI guide track 06: 16th pedal pluck'),
 ('Dream Piano', 'MIDI guide track 07: dream piano on the grand piano'),
 ('Stadium Anthem', 'MIDI guide track 08: stadium supersaw'),
 ('Euro Vocal Pluck', 'MIDI guide track 09: euro-trance pluck'),
 ('Fast Arp Theme', 'MIDI guide track 10: the twelve-note arpeggio'),
 ('Halftime Drop', 'Classic DnB 061, halftime: 808 line, no melody'),
 ('Mentasm', 'Classic DnB 058, old-skool hardcore: hoover stabs over amen edits'),
 ('Psy KBBB', 'Classic TR 024, psytrance: kick-bass-bass-bass and an acid riff'),
 ('Piano Roller', 'Classic DnB 044: the hook on the grand piano'),
 ('Amen Roller', 'Voice note: the amen, chopped and re-edited (re-played from CC0 hits), reese line'),
 ('Breakcore Riot', 'Voice note: breakcore leaning to pure drum mixes'),
 ('Goa Sitar', 'Voice note: a sitar riff and a sitar solo over the drone (goa trance)'),
 ('Peak Time', 'Voice note: techno four-on-the-floor "boom boom boom", chord stabs'),
 ('Siren Grid', 'Voice note: industrial with sirens'),
]
def slug(s): return re.sub(r'[^a-z0-9]+', '-', s.lower()).strip('-')
def code(e, k=0): return 'S%02X%08X' % (e['id'], (e['id'] * 7919 + k * 104729 + 12345) & 0xFFFFF)
if __name__ == '__main__':
    if sys.argv[1] == 'jobs':
        J = [dict(name='t%03d-%s' % (BY[n]['id'], slug(n)), code=code(BY[n]), secs=62, mode='tune', preview=True) for n, _ in PICK]
        J.append(dict(name='race-4min-two-tune-changes', mode='race', seed=777, secs=242, finalAt=205))
        J.append(dict(name='menu-radio-3min', code=code(BY['Rain Glass'], 3), mode='radio', secs=182))
        print(json.dumps(J))
    elif sys.argv[1] == 'encode':
        W, O = sys.argv[2], sys.argv[3]; os.makedirs(O, exist_ok=True); idx = []
        why = {('t%03d-%s' % (BY[n]['id'], slug(n))): w for n, w in PICK}
        for f in sorted(os.listdir(W)):
            if not f.endswith('.wav'): continue
            n = f[:-4]; J = json.load(open(os.path.join(W, n + '.json'))); dur = J['job']['secs'] - 2
            subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', os.path.join(W, f), '-t', str(dur), '-af', f'afade=t=out:st={dur - 1.5}:d=1.5', '-b:a', '128k', os.path.join(O, n + '.mp3')], check=True)
            fx = lambda s: s.encode('cp1252', 'replace').decode('utf8', 'replace') if isinstance(s, str) and 'Â' in s else s
            J['info'] = fx(J['info'])
            seq = []
            for b in J['tl']:
                if b.get('tpl') and (not seq or seq[-1][1] != b['tpl']): seq.append((round(b['t'], 1), b['tpl']))
            ent = dict(file=n + '.mp3', go_in_file_s=round(J['goT'], 1), code=J['code'], line=why.get(n) or ('4-minute race: the track\'s tune sequence, changing every 90 s at a phrase line' if n.startswith('race') else '3-minute menu radio: a new template every 90 s'), info=J['info'])
            if len(seq) > 1 or n.startswith(('race', 'menu')):
                ID = {e['id']: e for e in SPEC['templates']}
                ent['tunes'] = [dict(from_s=max(0, t), template=i, name=ID[i]['n'], family=ID[i]['sub'], tempo=ID[i]['b']) for t, i in seq]
            if J.get('chg'): ent['changes'] = [dict(at=round(c['t'] - J['goT'], 1), how=c.get('how'), code=c.get('code'), template=c.get('name')) for c in J['chg']]
            idx.append(ent)
        json.dump(idx, open(os.path.join(O, 'index.json'), 'w'), indent=1, ensure_ascii=False); print(len(idx), 'previews')
