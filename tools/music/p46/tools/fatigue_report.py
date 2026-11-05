#!/usr/bin/env python3
"""The fatigue audit report (Prototype 46): python3 fatigue_report.py <outdir>
Reads the audits fatigue.py made (sounds of P46, P45 and P43; rare events of an hour-long radio; the spectrum of the
previews) from /home/claude/p46/work and writes <outdir>/fatigue_audit.md and fatigue_audit.json."""
import json, sys, os, statistics
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import fatigue as F
W = '/home/claude/p46/work'; OUT = sys.argv[1]
S46 = F.sounds(os.path.join(W, 'audit_p46.json'), 'Prototype 46')
os.environ['TPLJS'] = '/home/claude/hoverline/tools/music/p45/src/tpl_table.js'
S45 = F.sounds(os.path.join(W, 'audit_p45.json'), 'Prototype 45')
os.environ['TPLJS'] = '/nonexistent'
S43 = F.sounds(os.path.join(W, 'audit_p43.json'), 'Prototype 43') if os.path.exists(os.path.join(W, 'audit_p43.json')) else None
R46 = F.rare(os.path.join(W, 'radio_p46.json')); R45 = F.rare(os.path.join(W, 'radio_p45.json'))
SP = json.load(open(os.path.join(W, 'spectrum.json'))) if os.path.exists(os.path.join(W, 'spectrum.json')) else None
pct = lambda x: '%.0f%%' % (100 * x)
L = ['# Fatigue audit (Prototype 46)', '',
     'Eric: "next update please check your work before submitting to ensure you haven\'t become fixated on something new and unexpected." '
     'This is that check, run on the final build. Nobody can listen, so these measurements are the ears.', '',
     '## How it is measured', '',
     '- Every template in rotation, two seeds each, is played for 100 s after GO the way a race plays it, without rendering audio (`tools/probe.js`): every note, sample, synth patch, texture and effect is recorded with its start and length.',
     '- For every sound: the share of templates that use it, and how much of each tune it sounds (the share of beats during which it plays; median over the tunes that use it, and the most in any tune).',
     '- Flags: **MANY** when more than a quarter of the templates use it; **LONG** when it sounds through most of a tune: a background sound (a pad, a percussion layer, a texture, a voice) above half the beats (median) or above 80% in any tune, a featured instrument (a lead, keys, arpeggio) above 85% (a part that never rests).',
     '- Listed apart, not flagged: the drum kit (kick, snare, clap, hats, ride, toms, the crash on a drop), the build and drop markers (riser, uplift, reverse crash, cymbal swell, impact, the tuned bass hit on a drop, the rewind) and the bass voice. Every tune has drums, builds and a bass.',
     '- Two rows add up what Eric heard as one thing: **the synth drone** (any pad; a pad under a drop) and **the shaker** (any percussion layer or shaker lane).',
     '- What Eric allowed is listed apart: the pads he let stay (Hard Pressure, Modal Friction, Tape Haze, Tabla Psy, and the ones he liked with theirs: Rain Glass, Glass Coast, Double Kick\'s strings, Deep Shuffle at half level) and the percussion he praised.',
     '- Parts at once: the non-drum parts (bass, lead, keys, arpeggio, pad, answer, voice, effects) sounding on each beat, averaged in drops and elsewhere.',
     '- Rare events: twelve hours of menu radio for each build (about 37 tunes an hour, each from a fresh seed), counting the bols, the "do do do", the breakdown wash, the rewind, sirens and the whoosh.', '']
L += ['## The two things Eric named', '', '| | Prototype 43 | Prototype 45 | Prototype 46 |', '| --- | --- | --- | --- |']
for k in S46['aggregate']:
    row = [k]
    for S in (S43, S45, S46):
        a = S['aggregate'].get(k) if S else None
        row.append('%d templates (%s), %s of a tune' % (a['templates'], pct(a['share']), pct(a['median_time'])) if a else '-')
    L.append('| ' + ' | '.join(row) + ' |')
L += ['', '"Of a tune" is the median share of beats with that sound, over the tunes that have it (for the drop rows, over all tunes). In Prototype 46 a pad is still in nearly every template, but only in breakdowns and builds (a quarter of a tune, where it is the part that carries the chords), and not even there when the keys play; it holds under the drops only in the eight templates Eric allowed. The shaker rows are the percussion layers of the eleven templates that name one (nine of them praised by Eric) and Mentasm\'s quiet shaker; no template has a shaker lane.', '',
      '## Parts at once', '', '| | Prototype 43 | Prototype 45 | Prototype 46 |', '| --- | --- | --- | --- |']
for k, n in (('drop_mean', 'Non-drum parts at once in drops (mean)'), ('drop_p90', 'in drops, 90th percentile tune'), ('else_mean', 'elsewhere (mean)'), ('else_p90', 'elsewhere, 90th percentile')):
    L.append('| %s | %s | %s | %s |' % (n, S43['parts'][k] if S43 else '-', S45['parts'][k], S46['parts'][k]))
L += ['', 'How much of a tune each part sounds (median over tunes), Prototype 45 to 46: ' + ', '.join('%s %s to %s' % (k, pct(S45['roles'].get(k, {}).get('median_time', 0)), pct(v['median_time'])) for k, v in sorted(S46['roles'].items())) + '.', '']
if SP:
    L += ['## The mid band and the movement', '', 'The 300 Hz-6 kHz share of the energy (what was "constantly full in the middle") and how much the level moves from one 50 ms to the next, on the one-minute previews, over the templates that have a preview in every set (same seed in Prototype 45 and 46).', '',
          'Shares: the 300 Hz-6 kHz part of the power (20 Hz-11 kHz), which the sub bass dominates, and of the spectral magnitude, which it dominates less. These are this audit\'s own measures, not the ones behind the 26% and 30% quoted before; the direction is what to compare. Movement: the mean change in level between successive 50 ms; spread: the standard deviation of those levels.', '',
          '| Set | Templates | 300 Hz-6 kHz share (power) | (magnitude) | level movement (dB per 50 ms) | level spread (dB) |', '| --- | --- | --- | --- | --- | --- |']
    for row in SP['rows']: L.append('| %s | %d | %.1f%% | %.1f%% | %.2f | %.1f |' % (row['set'], row['n'], 100 * row['mid'], 100 * row['mid_mag'], row['move'], row['spread']))
    if SP.get('pairs'): L += ['', SP['pairs']]
    L.append('')
L += ['## Rare events per hour', '', '| Event | Prototype 45 | Prototype 46 | Budget |', '| --- | --- | --- | --- |']
BUD = {'bols (call and answer, twice)': 'about 1 (Eric: "perfect")', 'do-do-do': 'under one ("a special treat but only rarely")', 'breakdown wash': 'a few ("don\'t suddenly overdo it")', 'rewind': 'a few', 'siren': 'a few', 'whoosh into a breakdown': 'one per tune change at most'}
for k in sorted(set(R46['per_hour']) | set(R45['per_hour'])):
    L.append('| %s | %s | %s | %s |' % (k, R45['per_hour'].get(k, 0), R46['per_hour'].get(k, 0), BUD.get(k, '')))
L += ['', 'Tunes an hour: %s (Prototype 45 %s). The whoosh also marks every tune change on the radio (the old tune breaks down into it), so it comes about once a tune whichever template plays; inside tunes it is now in %d templates.' % (R46['tunes_per_hour'], R45['tunes_per_hour'], next((r['templates'] for r in S46['rows'] if r['sound'] == 'kit:wh'), 0)), '']
fl = [r for r in S46['rows'] if r['flag']]
L += ['## Flags', '', ('Nothing is flagged in Prototype 46.' if not fl else 'Flagged: ' + ', '.join('%s (%s)' % (r['sound'], r['flag']) for r in fl)),
      'Prototype 45, for comparison, had %d flagged sounds, among them the shaker (%s of templates, %s of a tune), the clock-tick percussion (%s of templates) and every pad preset (LONG).' % (
          len([r for r in S45['rows'] if r['flag']]), pct(next(r['share'] for r in S45['rows'] if r['sound'] == 'shaker')), pct(next(r['median_time'] for r in S45['rows'] if r['sound'] == 'shaker')),
          pct(next((r['share'] for r in S45['rows'] if r['sound'] == 'perc:x_elec_tick'), 0))), '']
L += ['## Every sound in Prototype 46', '', '| Sound | Kind | Templates | Share | Median time | Max time | Flag | Eric allowed |', '| --- | --- | --- | --- | --- | --- | --- | --- |']
for r in S46['rows']:
    L.append('| `%s` | %s | %d | %s | %s | %s | %s | %s |' % (r['sound'], r['kind'], r['templates'], pct(r['share']), pct(r['median_time']), pct(r['max_time']), r['flag'], ' '.join(map(str, r.get('allowed', []))) or ''))
os.makedirs(OUT, exist_ok=True)
open(os.path.join(OUT, 'fatigue_audit.md'), 'w').write('\n'.join(L) + '\n')
json.dump(dict(p46=S46, p45={k: S45[k] for k in ('aggregate', 'parts', 'roles', 'templates', 'tunes')}, p43={k: S43[k] for k in ('aggregate', 'parts', 'roles', 'templates', 'tunes')} if S43 else None,
               rare_p46=R46, rare_p45=R45, spectrum=SP), open(os.path.join(OUT, 'fatigue_audit.json'), 'w'), indent=1)
print('wrote', os.path.join(OUT, 'fatigue_audit.md'), len(fl), 'flags')
