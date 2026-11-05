#!/usr/bin/env python3
"""The Prototype 46 preview set (Prototype 45's tool; the seeds are the same, so a preview compares with Prototype 45's).
python3 previews.py jobs [all|changed] > jobs.json   one-minute previews (all templates, or the changed and new ones), a
                                                    4-minute race and a 3-minute radio
python3 previews.py calib > jobs.json              the calibration pass (every template, one seed)
python3 previews.py encode <wavdir> <outdir>       mp3s and index.json (Prototype 43's format)"""
import json, sys, os, subprocess, re
SPEC = json.load(open('/home/claude/p46/music/new/catalogue_spec.json'))
BY = {e['id']: e for e in SPEC['templates']}
def slug(s): return re.sub(r'[^a-z0-9]+', '-', s.lower()).strip('-')
def code(e, k=0): return 'S%02X%08X' % (e['id'], (e['id'] * 7919 + k * 104729 + 12345) & 0xFFFFF)
def name(e): return 't%03d-%s' % (e['id'], slug(e['n']))
def line(e):
    w = e.get('why46') or 'Unchanged apart from the global changes (no drone under the drops, no shaker, space in the mix).'
    tag = 'New' if e.get('new46') else 'Revised' if e.get('why46') else 'Global changes only'
    return '%s · %s: %s' % (tag, e['sub'], w)
RACE_SEED, RADIO_CODE_ID = 777, 7
if __name__ == '__main__':
    if sys.argv[1] in ('jobs', 'calib'):
        which = sys.argv[2] if len(sys.argv) > 2 else 'all'
        L = [e for e in SPEC['templates'] if not e.get('ret') and (which == 'all' or e.get('why46') or e.get('new46') or (which.startswith('ids:') and str(e['id']) in which[4:].split(',')))]
        if which.startswith('ids:'): L = [e for e in L if str(e['id']) in which[4:].split(',')]
        J = [dict(name=name(e), code=code(e), secs=62, mode='tune', preview=True, noBol=True) for e in L]  # the bols have their own demo
        if sys.argv[1] == 'jobs':
            J.append(dict(name='race-4min-tune-changes', mode='race', seed=RACE_SEED, secs=242, finalAt=205))
            J.append(dict(name='menu-radio-3min', code=code(BY[RADIO_CODE_ID], 3), mode='radio', secs=182))
            J.append(dict(name='bols-call-and-answer', code=code(BY[112]), secs=50, mode='tune', preview=True, mvs=[['drop', 4], ['brk', 12], ['rise', 4], ['drop', 8]], firstDrop=4, forceBol=True, bolPh='theka'))
        print(json.dumps(J))
    elif sys.argv[1] == 'encode':
        W, O = sys.argv[2], sys.argv[3]; os.makedirs(O, exist_ok=True); idx = []
        for f in sorted(os.listdir(W)):
            if not f.endswith('.wav'): continue
            n = f[:-4]; J = json.load(open(os.path.join(W, n + '.json'))); dur = J['job']['secs'] - 2
            subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', os.path.join(W, f), '-t', str(dur), '-af', f'afade=t=out:st={dur - 1.5}:d=1.5', '-b:a', '128k', os.path.join(O, n + '.mp3')], check=True)
            seq = []
            for b in J['tl']:
                if b.get('tpl') and (not seq or seq[-1][1] != b['tpl']): seq.append((round(b['t'], 1), b['tpl']))
            tid = int(n[1:4]) if re.match(r't\d{3}-', n) else None
            ln = line(BY[tid]) if tid else ('4-minute race: the track\'s tune sequence, changing about every 90 s at a phrase line' if n.startswith('race') else '3-minute menu radio: a new template about every 90 s, from every genre' if n.startswith('menu') else 'The tabla bols in Tabla Psy: the spoken call and the tabla\'s answer, twice, the second a tihai; everything else nearly silent while the tabla answers')
            ent = dict(file=n + '.mp3', go_in_file_s=round(J['goT'], 1), code=J['code'], line=ln, info=J['info'])
            if tid: ent.update(template=tid, name=BY[tid]['n'], genres=BY[tid].get('gn'), tempo=BY[tid]['b'], status='new' if BY[tid].get('new46') else 'revised' if BY[tid].get('why46') else 'global changes only')
            if len(seq) > 1 or n.startswith(('race', 'menu')):
                ent['tunes'] = [dict(from_s=max(0, t), template=i, name=BY[i]['n'], family=BY[i]['sub'], genres=BY[i].get('gn'), tempo=BY[i]['b']) for t, i in seq]
            ent['timeline'] = [dict(t=b['t'], section=b['sec'], tpl=b.get('tpl')) for i, b in enumerate(J['tl']) if i == 0 or b['sec'].split('/')[0] != J['tl'][i - 1]['sec'].split('/')[0] or b.get('tpl') != J['tl'][i - 1].get('tpl')]
            if J.get('chg'): ent['changes'] = [dict(at=round(c['t'] - J['goT'], 1), how=c.get('how'), code=c.get('code'), template=c.get('name')) for c in J['chg']]
            ent['levels'] = dict(peak=round(J['peak'], 3), clipped_samples=J['clip'])
            idx.append(ent)
        idx.sort(key=lambda e: (0 if e['file'].startswith(('race', 'menu', 'bols')) else 1, e['file']))
        json.dump(idx, open(os.path.join(O, 'index.json'), 'w'), indent=1, ensure_ascii=False); print(len(idx), 'previews')
