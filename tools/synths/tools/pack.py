#!/usr/bin/env python3
"""Packs the auditions: phrase renders (work/aud/*.f32) into family MP3s with a timeline, and the in-context demos
(work/demo/*.wav + .json) into MP3s with their bar timeline. Output: /home/claude/p45/synths/auditions/"""
import json, os, subprocess, numpy as np, wave
W = '/home/claude/p45/synths/work'; OUT = '/home/claude/p45/synths/auditions'; os.makedirs(OUT, exist_ok=True)
FAM = {
  'leads': [('a_anthem', 'anthem: trance anthem supersaw'), ('a_eurobrass', 'eurobrass: brassy eurobeat supersaw'), ('a_hardcore', 'hardcore: happy hardcore supersaw with octave'),
            ('a_sawpluck', 'sawpluck: staccato supersaw pluck'), ('a_smooth', 'smooth: the clean lead replacing the tooty clipped saw'), ('a_clip_new', 'clip: the clipped saw, now quieter and darker')],
  'acid': [('a_tb303', 'tb303: saw, accents and slides'), ('a_tb303sq', 'tb303sq: square'), ('a_tb303_selfosc', 'tb303 with resonance 1.02 (self-oscillating)')],
  'basses': [('a_reese7', 'reese7: default movement 0.3'), ('a_reese7_still', 'reese7: move 0 (no wubs)'), ('a_reese7_moving', 'reese7: move 1 (most)'),
             ('a_growlbass', 'growlbass: slow o-to-u formant motion'), ('a_fmgrowl', 'fmgrowl: neuro FM growl'), ('a_talkbass', 'talkbass: talk-box FM pluck')],
  'keys_fm': [('a_rhodes', 'rhodes: FM electric piano'), ('a_fmbell', 'fmbell'), ('a_hang', 'hang: modal fallback'), ('a_fmbrass', 'fmbrass: brass stabs'), ('a_fmstab', 'fmstab: metallic stabs')],
  'pads': [('a_warmpad', 'warmpad'), ('a_choirpad', 'choirpad'), ('a_sawpad', 'sawpad: soft supersaw pad')],
  'world': [('a_erhu', 'erhu: bowed, slides and vibrato'), ('a_bansuri', 'bansuri: breathy flute'), ('a_guzheng', 'guzheng: plucked, slides in'),
            ('a_guzheng_press', 'guzheng with presses (bends up after the pluck)'), ('a_tanpura', 'tanpura drone in D')]}
def mp3(path, L, R, sr):
    tmp = path[:-4] + '.tmp.wav'; w = wave.open(tmp, 'wb'); w.setnchannels(2); w.setsampwidth(2); w.setframerate(sr)
    x = np.stack([L, R], 1); w.writeframes((np.clip(x, -1, 1) * 32767).astype('<i2').tobytes()); w.close()
    subprocess.run(['ffmpeg', '-hide_banner', '-loglevel', 'error', '-y', '-i', tmp, '-codec:a', 'libmp3lame', '-q:a', '2', path], check=True); os.remove(tmp)
index = {}
for fam, items in FAM.items():
    Ls, Rs, tl, t = [], [], [], 0.0
    for nm, what in items:
        f = os.path.join(W, 'aud', nm + '.f32')
        if not os.path.exists(f): print('missing', nm); continue
        J = json.load(open(os.path.join(W, 'aud', nm + '.json'))); sr = J['info']['sr']; x = np.fromfile(f, np.float32); n = len(x) // 2
        L, R = x[:n], x[n:]; a = np.abs((L + R) / 2); last = np.nonzero(a > 1e-4)[0]; end = min(n, (last[-1] if len(last) else n) + int(0.3 * sr))
        tl.append(dict(t=round(t, 2), name=nm[2:], what=what, notes=len(J['job']['notes']), peak=round(0.5 * float(max(np.abs(L).max(), np.abs(R).max())), 3)))
        Ls.append(L[:end]); Rs.append(R[:end]); g = np.zeros(int(0.6 * sr), np.float32); Ls.append(g); Rs.append(g); t += end / sr + 0.6
    p = os.path.join(OUT, 'phrases-' + fam + '.mp3'); mp3(p, 0.5 * np.concatenate(Ls), 0.5 * np.concatenate(Rs), sr)
    json.dump(dict(file=os.path.basename(p), sr=sr, note='each phrase played through the game engine and master, reverb and echo on; t = start in seconds', timeline=tl), open(p[:-4] + '.json', 'w'), indent=1)
    index[os.path.basename(p)] = [x['name'] for x in tl]; print(p, round(t, 1), 's')
os.makedirs(os.path.join(OUT, 'context'), exist_ok=True)
for f in sorted(os.listdir(os.path.join(W, 'demo'))):
    if not f.endswith('.wav'): continue
    nm = f[:-4]; w = wave.open(os.path.join(W, 'demo', f)); sr = w.getframerate(); x = np.frombuffer(w.readframes(w.getnframes()), np.int16).reshape(-1, 2).astype(np.float32) / 32768
    J = json.load(open(os.path.join(W, 'demo', nm + '.json'))); p = os.path.join(OUT, 'context', nm + '.mp3'); mp3(p, x[:, 0], x[:, 1], sr)
    job = J.get('job', {}); tl = [dict(t=round(J['goT'] + b['t'], 2), section=b['sec'], bpm=b['bpm']) for b in J['tl'] if b['t'] >= -0.01]
    json.dump(dict(file=nm + '.mp3', tune=J['info'], code=J['code'], go_at=round(J['goT'], 2), changed=job.get('mut', {}), pads=job.get('padSyn'), drone=job.get('drone'),
                   note='a real template through the game engine and master; "changed" lists what this demo swapped in (the template itself is not changed in the game); t = seconds into the file',
                   bars=tl), open(p[:-4] + '.json', 'w'), indent=1)
    index['context/' + nm + '.mp3'] = J['info']
json.dump(index, open(os.path.join(OUT, 'index.json'), 'w'), indent=1); print('context demos', len([k for k in index if k.startswith('context/')]))
