#!/bin/bash
# /home/claude/mptest/*_q0.js on the P47 page: the page goes into /home/claude/itch/index.html for the run and the
# original goes back afterwards (checked). A local MQTT broker runs for the room tests.   bash run_q0.sh
L=/home/claude/p47/tests/logsq0; mkdir -p $L /home/claude/p47/tests/q0out; rm -f $L/sum.txt
I=/home/claude/itch/index.html; B=/home/claude/p47/work/itch_index.orig.html
cp -p $I $B && sha=$(sha256sum < $I) && cp /home/claude/p47/pages/p47.html $I
restore(){ cp -p $B $I; [ "$(sha256sum < $I)" = "$sha" ] && echo "itch index restored" >> $L/sum.txt || echo "ITCH INDEX NOT RESTORED" >> $L/sum.txt; }
trap restore EXIT
cd /home/claude/mptest && (node broker.js 18884 > $L/broker.log 2>&1 &) ; sleep 1.5
s(){ echo "$1 exit=$2 fails=$(grep -c '^FAIL\| FAIL\|PAGEERROR' $L/$1.log 2>/dev/null) $(grep -v 'GL Driver\|^\s*$\|publishes' $L/$1.log 2>/dev/null|tail -1|cut -c1-170)" >> $L/sum.txt; }
for t in autoul38_q0 both35_q0 driftlog39_q0 e2e38_q0 music38_q0 p34menu_q0 paint38_q0 pub38_q0 rings38_q0 ringsmp38_q0; do
  timeout 1500 nice node $t.js /home/claude/p47/tests/q0out/ > $L/$t.log 2>&1; s $t $?; done
pkill -f "broker.js 18884"
echo DONE >> $L/sum.txt
