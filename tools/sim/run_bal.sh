#!/bin/bash
# run_bal.sh GAME DIR FROM TO [CHUNK]: bal45.js 'full' races FROM..TO-1 in chunks (default 50), 2 workers, nice -n 10,
# each race seeded from its own number (RESEED=1), the sim's fast path on. One file per chunk in results/DIR.
cd /home/claude/p45/race/sim; G=$1; D=results/$2; C=${5:-50}; mkdir -p $D
seq $3 $C $(($4-1)) | xargs -P 2 -I{} sh -c "[ -s $D/full_{}.races.jsonl ] && [ \$(wc -l < $D/full_{}.races.jsonl) -ge $C ] || { rm -f $D/full_{}.jsonl $D/full_{}.races.jsonl; GAME=$G RESEED=1 SEED={} nice -n 10 node --require ./seedrand.js --require ./fast.js bal45.js full $C {} $D/full_{}.jsonl $AIXARGS; }"
echo finished $2
