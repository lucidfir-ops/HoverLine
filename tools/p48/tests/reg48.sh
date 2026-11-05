#!/bin/bash
L=/home/claude/p48/tests/logs; mkdir -p $L; rm -f $L/sum.txt; P=/home/claude/hoverline/index.html
s(){ echo "$1 exit=$2 $(grep -c '^FAIL\| FAIL\|PAGEERROR' $L/$1.log) $(grep -v 'GL Driver\|^\s*$' $L/$1.log|tail -1|cut -c1-160)" >> $L/sum.txt; }
D=/home/claude/p48/tests/o40; rm -rf $D; mkdir -p $D/shots; cp /home/claude/p40/orient/orient40m.js $D/; cp $P $D/m40.html; cp /home/claude/p40/orient/p39.html $D/
cd $D && timeout 1800 nice node orient40m.js > $L/orient40m.log 2>&1; s orient40m $?
cd /home/claude/p40/quick/tests && HTML=$P V=48 timeout 2400 nice node ladder.js > $L/ladder.log 2>&1; s ladder $?
HTML=$P V=48 timeout 2400 nice node record.js > $L/record.log 2>&1; s record $?
cd /home/claude/p43/handling/tests && ERA=45 timeout 1800 nice node inputs.js $P > $L/inputs.log 2>&1; s inputs $?
cd /home/claude/p47/tests && for t in class47 codes47; do PAGE=$P timeout 1500 nice node $t.js > $L/$t.log 2>&1; s $t $?; done
echo DONE >> $L/sum.txt
