#!/bin/sh
# Fetch every source the library is built from: blob-less sparse clones, only the files the kits use (about 2 GB).
# Run from samples/prep/. Then run the prep scripts and ../build_samples.py (see ../README.md).
set -e
R=../raw; mkdir -p $R/freepats
c() { [ -d "$2/.git" ] || git clone -q --filter=blob:none --sparse --depth 1 "$1" "$2"; git -C "$2" config gc.auto 0; }
c https://github.com/sfzinstruments/virtuosity_drums $R/virtuosity_drums
c https://github.com/sgossner/VCSL $R/VCSL
c https://github.com/sgossner/VSCO-2-CE $R/VSCO-2-CE
c https://github.com/sonic-pi-net/sonic-pi $R/sonic-pi
for r in hang-D-minor electric-guitar-FSBS-clean electric-guitar-FSBS-dist1 electric-guitar-FSBS-direct electric-bass-YR world-percussion muldjordkit; do
  c https://github.com/freepats/$r $R/freepats/$r; done
SP="README.md bd_tek drum_heavy_kick drum_bass_hard bd_klub sn_dolf sn_zome drum_snare_hard elec_hi_snare drum_snare_soft perc_snap perc_snap2
 hat_zild drum_cymbal_closed drum_cymbal_open drum_cymbal_pedal drum_cymbal_hard drum_cymbal_soft ride_tri drum_tom_hi_hard drum_tom_mid_hard
 drum_tom_lo_hard drum_tom_hi_soft drum_tom_mid_soft drum_tom_lo_soft bd_zum bd_pure hat_hier hat_star sn_generic elec_lo_snare drum_cowbell
 elec_soft_kick elec_hollow_kick elec_pop bd_sone elec_filt_snare bd_gas bd_808 tabla_ghe1 tabla_ghe2 tabla_ghe3 tabla_ghe4 tabla_ghe5 tabla_ghe6
 tabla_ghe7 tabla_ghe8 tabla_ke1 tabla_ke2 tabla_ke3 tabla_te1 tabla_te2 tabla_te_m tabla_te_ne tabla_na tabla_na_s tabla_na_o tabla_tun1
 tabla_tun2 tabla_tun3 tabla_tas1 tabla_tas2 tabla_tas3 tabla_re tabla_dhec"
for n in $SP; do case $n in README.md) echo /etc/samples/README.md;; *) echo /etc/samples/$n.flac;; esac; done | git -C $R/sonic-pi sparse-checkout set --no-cone --stdin
python3 prep_virtuosity.py fetch
python3 prep_muldjord.py fetch
python3 prep_world.py fetch
python3 prep_instruments.py fetch
echo fetched
