#!/usr/bin/env python3
"""The spoken tabla bols (Prototype 45): samples/vox-bols/<bol>.flac, in the announcer's voice.

The announcer is the Kokoro speech model's British female voice, bf_emma (Apache-2.0). This script runs the same
model (sherpa-onnx's kokoro-en-v0_19 export, speaker 7 = bf_emma) directly with onnxruntime, feeding it phonemes, since
bols aren't English words. Each bol is said quickly (speed 1.7), high-passed at 110 Hz, low-passed at 7.5 kHz, trimmed to
its onset and at most 320 ms (the game cuts a spoken bol at three 16ths), faded out over 50 ms and peak-normalised.

  curl -L -O https://github.com/k2-fsa/sherpa-onnx/releases/download/tts-models/kokoro-en-v0_19.tar.bz2
  tar xjf kokoro-en-v0_19.tar.bz2
  pip install onnxruntime soundfile scipy numpy
  python3 make_vox_bols.py kokoro-en-v0_19 ../../samples/vox-bols
"""
import os, sys
import numpy as np, onnxruntime as ort, soundfile as sf
from scipy.signal import butter, sosfilt

D, OUT = sys.argv[1].rstrip('/') + '/', sys.argv[2]
SID, SPEED, SR = 7, 1.7, 24000
# plain English phonemes: the aspirated dh/gh of the bols are said as d and g (the model has no aspirated stops)
BOLS = {'dha': 'dˈɑː', 'dhin': 'dˈɪn', 'dhe': 'dˈeɪ', 'ta': 'tˈɑː', 'na': 'nˈɑː', 'tin': 'tˈɪn', 'tun': 'tˈuːn',
        'te': 'tˈeɪ', 'ti': 'tˈiː', 're': 'ɹˈeɪ', 'ra': 'ɹˈɑː', 'ki': 'kˈiː', 'ke': 'kˈeɪ', 'ka': 'kˈɑː',
        'ghe': 'ɡˈeɪ', 'ge': 'ɡˈɛ'}

tok = {}
for line in open(D + 'tokens.txt', encoding='utf-8'):
    line = line.rstrip('\n')
    if line:
        n = line.split(' ')[-1]; tok[line[:-len(n) - 1]] = int(n)
V = np.fromfile(D + 'voices.bin', dtype=np.float32).reshape(-1, 511, 256)
S = ort.InferenceSession(D + 'model.onnx', providers=['CPUExecutionProvider'])
hp = butter(2, 110, 'hp', fs=SR, output='sos'); lp = butter(2, 7500, 'lp', fs=SR, output='sos')
os.makedirs(OUT, exist_ok=True)
for name, ipa in BOLS.items():
    ids = [tok[c] for c in ipa + '.']
    x = S.run(None, {'tokens': np.array([[0] + ids + [0]], dtype=np.int64), 'style': V[SID][len(ids)][None, :],
                     'speed': np.array([SPEED], dtype=np.float32)})[0].reshape(-1).astype(np.float64)
    x = sosfilt(lp, sosfilt(hp, x))
    env = np.convolve(np.abs(x), np.ones(120) / 120, 'same'); act = env > env.max() * 0.04
    i, on = 0, 0
    while i < len(act):  # the first stretch of sound at least 15 ms long
        if act[i]:
            j = i
            while j < len(act) and act[j]: j += 1
            if (j - i) / SR >= 0.015: on = i; break
            i = j
        else: i += 1
    on = max(0, on - int(0.004 * SR)); end = min(np.where(act)[0][-1] + int(0.02 * SR), on + int(0.32 * SR))
    y = x[on:end].copy(); fo = min(len(y), int(0.05 * SR)); y[-fo:] *= np.linspace(1, 0, fo) ** 1.5
    fi = int(0.002 * SR); y[:fi] *= np.linspace(0, 1, fi); y = y / np.abs(y).max() * 0.7
    sf.write(os.path.join(OUT, name + '.flac'), y.astype(np.float32), SR, subtype='PCM_16')
    print(name, '%.0f ms' % (len(y) / SR * 1000))
