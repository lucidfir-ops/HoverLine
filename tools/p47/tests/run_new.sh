#!/bin/bash
# Prototype 47's own tests, then the P44 pairing suites, on the P47 page.   bash run_new.sh   (logs in tests/logs47)
L=/home/claude/p47/tests/logs47; mkdir -p $L; rm -f $L/sum.txt
P=${PAGE:-/home/claude/p47/pages/p47.html}; export PAGE=$P
s(){ echo "$1 exit=$2 fails=$(grep -c '^FAIL\| FAIL\|PAGEERROR' $L/$1.log 2>/dev/null) $(grep -v 'GL Driver\|^\s*$' $L/$1.log 2>/dev/null|tail -1|cut -c1-170)" >> $L/sum.txt; }
cd /home/claude/p47/tests
for t in orient47 qr47 codes47 meter47 class47; do timeout 1800 nice node $t.js > $L/$t.log 2>&1; s $t $?; done
timeout 1200 nice node ff_wav47.js clean room > $L/ff_wav47.log 2>&1; s ff_wav47 $?
cd /home/claude/p44/nearby/tests
timeout 900 nice node chirp_iframe_test.js > $L/chirp_iframe.log 2>&1; s chirp_iframe $?
timeout 1500 nice node chirp_pair_e2e.js > $L/chirp_pair_e2e.log 2>&1; s chirp_pair_e2e $?
OUT=/home/claude/p47/work/wav timeout 1500 nice node chirp_wav_e2e.js > $L/chirp_wav_e2e.log 2>&1; s chirp_wav_e2e $?
CORE=/home/claude/p47/work/chirp_core.js timeout 600 nice node chirp_unit.js > $L/chirp_unit.log 2>&1; s chirp_unit $?
echo DONE >> $L/sum.txt
