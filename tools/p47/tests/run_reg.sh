#!/bin/bash
# Prototype 47: the earlier suites on the P47 page (built from work/p47.html the way tools/build.py builds index.html).
#   bash run_reg.sh [page]        logs in tests/logs, one line a suite in tests/logs/sum.txt
L=/home/claude/p47/tests/logs; mkdir -p $L; rm -f $L/sum.txt
P=${1:-/home/claude/p47/pages/p47.html}
s(){ echo "$1 exit=$2 fails=$(grep -c '^FAIL\|PAGEERROR\| FAIL' $L/$1.log 2>/dev/null) $(grep -v 'GL Driver\|^\s*$' $L/$1.log 2>/dev/null|tail -1|cut -c1-170)" >> $L/sum.txt; }
# P44 pairing
cd /home/claude/p44/nearby/tests
PAGE=$P timeout 900 nice node chirp_iframe_test.js > $L/chirp_iframe.log 2>&1; s chirp_iframe $?
CORE=/home/claude/p47/work/chirp_core.js timeout 600 nice node chirp_unit.js > $L/chirp_unit.log 2>&1; s chirp_unit $?
# P40 orientation (its pages are m40.html and p39.html beside it)
D=/home/claude/p47/tests/o40; rm -rf $D; mkdir -p $D/shots; cp /home/claude/p40/orient/orient40m.js $D/; cp $P $D/m40.html; cp /home/claude/p40/orient/p39.html $D/p39.html
cd $D && timeout 1800 nice node orient40m.js > $L/orient40m.log 2>&1; s orient40m $?
# P40 quick races
cd /home/claude/p40/quick/tests
HTML=$P V=46 timeout 2400 nice node ladder.js > $L/ladder.log 2>&1; s ladder $?
HTML=$P V=46 timeout 2400 nice node record.js > $L/record.log 2>&1; s record $?
# P40 settings (a repo-like root: the page as index.html, songs/ and samples/ beside it)
R=/home/claude/p47/root; rm -rf $R; mkdir -p $R; cp $P $R/index.html; ln -s /home/claude/hoverline/songs $R/songs; ln -s /home/claude/hoverline/samples $R/samples
cd /home/claude/p40/reg/settings && ROOT=$R timeout 2400 nice node test.js > $L/settings.log 2>&1; s settings $?
# P43 inputs
cd /home/claude/p43/handling/tests && ERA=45 timeout 1800 nice node inputs.js $P > $L/inputs.log 2>&1; s inputs $?
echo DONE >> $L/sum.txt
