"""The original and tight kits as lossless FLAC originals from the Sonic Pi pack (the page carried them as small MP3s).
One recording each, so round robins are derived (common.derive_rr)."""
from common import *
SP = os.path.join(RAW, 'sonic-pi', 'etc', 'samples')

def put(kit, voice, layer, name, n=4, seed=0):
    x, sr = A.load(os.path.join(SP, name + '.flac'))
    if sr != SR: x = A.resample(x, sr, SR)
    import zlib
    for i, y in enumerate(derive_rr(x, SR, n, seed=zlib.crc32((kit + voice + name).encode()))):
        wav(os.path.join(PREP, 'sonicpi', kit, '%s_v%d_%s_r%d.wav' % (voice, layer, name, i + 1)), y, src=[os.path.join(SP, name + '.flac')] + (['(round robin derived from it)'] if i else []))

ORIG = {  # voice: [(layer, sample, rr count)]
 'kick': [(1, 'bd_tek', 3)], 'kick_metal': [(1, 'drum_heavy_kick', 3)], 'kick_trance': [(1, 'drum_bass_hard', 3)], 'kick_short': [(1, 'bd_klub', 3)],
 'snare': [(1, 'drum_snare_soft', 3), (2, 'sn_dolf', 3), (2, 'sn_zome', 3)], 'snare_metal': [(1, 'drum_snare_hard', 3)], 'snare_brk': [(1, 'elec_hi_snare', 3)],
 'clap': [(1, 'perc_snap', 3)], 'chh': [(1, 'hat_zild', 3), (1, 'drum_cymbal_closed', 3)], 'ohh': [(1, 'drum_cymbal_open', 3)], 'pedal': [(1, 'drum_cymbal_pedal', 3)],
 'crash': [(1, 'drum_cymbal_soft', 1), (2, 'drum_cymbal_hard', 2)], 'ride': [(1, 'ride_tri', 2)],
 'tomL': [(1, 'drum_tom_lo_soft', 2), (2, 'drum_tom_lo_hard', 2)], 'tomM': [(1, 'drum_tom_mid_soft', 2), (2, 'drum_tom_mid_hard', 2)], 'tomH': [(1, 'drum_tom_hi_soft', 2), (2, 'drum_tom_hi_hard', 2)],
 'cowbell': [(1, 'drum_cowbell', 3)],
}
TIGHT = {'kick': [(1, 'bd_zum', 4)], 'kick_long': [(1, 'bd_pure', 4)], 'snare': [(1, 'sn_generic', 4)], 'snare_lo': [(1, 'elec_lo_snare', 4)],
         'chh': [(1, 'hat_hier', 3), (1, 'hat_star', 3)], 'clap': [(1, 'perc_snap2', 4)]}

def build(kit, table, label, genres, notes, extra=None):
    voices = {}
    for v, L in table.items():
        layers = sorted({l for l, _, _ in L})
        for l, name, n in L:
            put(kit, v, l, name, n)
        vel = {1: [0, 0.45], 2: [0.45, 1]} if len(layers) == 2 else {1: [0, 1]}
        voices[v] = [{'files': ['%s_v%d_*_r*.wav' % (v, l)], 'vel': vel[l], 'tags': ['rr-derived']} for l in layers]
        P = {'ohh': {'maxlen': 1.1}, 'ride': {'maxlen': 2.2, 'fade_from': 1.2}, 'crash': {'maxlen': 2.0, 'fade_from': 1.0}}.get(v)
        if P:
            for x in voices[v]: x['process'] = P
    if extra: voices.update(extra)
    mapping(kit, {'kit': kit, 'label': label, 'family': 'electronic', 'genres': genres, 'notes': notes, 'source': 'sonicpi',
                  'dir': '../work/prep/sonicpi/' + kit, 'voices': voices})

ELECTRO = {'kick': [(1, 'elec_soft_kick', 4)], 'kick_hollow': [(1, 'elec_hollow_kick', 4)], 'snare_lo': [(1, 'elec_lo_snare', 4)], 'perc_pop': [(1, 'elec_pop', 4)]}
TAPE = {'kick': [(1, 'bd_sone', 4)], 'kick_808': [(1, 'bd_808', 4)], 'snare_filt': [(1, 'elec_filt_snare', 4)], 'clap': [(1, 'perc_snap2', 4)]}
GAS = {'kick': [(1, 'bd_gas', 4)], 'kick_sone': [(1, 'bd_sone', 4)]}

build('original', ORIG, 'Original kit (lossless)', ['drum & bass', 'breakcore', 'jungle', 'metal'],
      'The Prototype 25 kit from its lossless FLAC originals: bd_tek, sn_dolf and sn_zome, the menegass acoustic hits. '
      'Each hit has 3-4 round robins derived from the one recording. The bright closed hat (drum_cymbal_closed) is shelved above 10 kHz.')
build('tight', TIGHT, 'Tight kit (lossless)', ['psytrance', 'trance', 'techno'],
      'The tight kit Eric liked for psytrance (bd_zum, bd_pure, sn_generic), lossless. Its open hat (hat_gump, the likely '
      '"tsshh") is left out: the open hat comes from the soft synthesised hats instead.',
      extra={'ohh': {'use': 'hats:ohh_psy'}, 'pedal': {'use': 'hats:pedal'}})
build('electro', ELECTRO, 'Electro kit (new top end)', ['electro', 'breakbeat', 'glitch-hop'],
      'The electro kit\'s Sonic Pi kicks and low snare (lossless), with a new tight electro snare and the dark synthesised hats '
      'in place of the old bright ones Eric disliked.',
      extra={'snare': {'use': 'esn:snare_electro'}, 'clap': {'use': '808:clap'}, 'chh': {'use': 'hats:chh_dark'}, 'ohh': {'use': 'hats:ohh_dark'},
             'crash': {'use': 'cym:crash_dark'}})
build('tape', TAPE, 'Tape kit (new top end)', ['lo-fi', 'phonk', 'hip hop', 'breakbeat'],
      'The tape kit\'s kicks and filtered snare (lossless), with the new tape-coloured hats (dark, rolled off above 9 kHz).',
      extra={'snare': {'use': 'esn:snare_dub'}, 'chh': {'use': 'hats:chh_tape'}, 'ohh': {'use': 'hats:ohh_tape'}, 'crash': {'use': 'cym:crash_dark'}})
build('gas', GAS, 'Gas kit (new snare)', ['dub techno', 'deep house', 'ambient techno'],
      'The gas kit\'s kicks (lossless) with a new dark, round dub snare in place of the one Eric disliked on 2 and 4, and dark hats.',
      extra={'snare': {'use': 'esn:snare_dub'}, 'chh': {'use': 'hats:chh_dark'}, 'ohh': {'use': 'hats:ohh_dark'}, 'ride': {'use': 'cym:ride_dark'},
             'clap': {'use': 'house:clap'}})
print('ok')
