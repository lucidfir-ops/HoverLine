#!/bin/bash
cd /home/claude/hoverline/tools/sim; R=/home/claude/p49/game/runs; L=/home/claude/p49/game/logs48.json; P=/home/claude/p49/game/eric48.json
export MATCH='Prototype 4[68]' PARAMS=$P
run(){ n=$1; shift; [ -f $R/$n.done ] && return; rm -f $R/$n.jsonl $R/$n.logs.jsonl; env "$@" nice node eric.js replay $L $R/$n.jsonl 1 > $R/$n.out 2>&1 && touch $R/$n.done; }
run h1 HAND=1
run h5a0 HAND=5 LANEA=0
run h5a2 HAND=5 LANEA=2
run h5a3 HAND=5 LANEA=3
run h5a5 HAND=5 LANEA=5
run h1a3 HAND=1 LANEA=3
echo DONE > $R/ALL.done
