#!/bin/bash
# Prototype 60: before / after for strips and smoke, one process at a time (MAXT sim seconds a race). Results in results/.
cd "$(dirname "$0")"; mkdir -p results
export MAXT=${MAXT:-200}
for m in strips smoke; do
  node stripbench.js $m ${N:-2} 0 2>&1 | grep -v flatShading > results/${m}_before.txt
  GAME=./game_after2.js node stripbench.js $m ${N:-2} 0 2>&1 | grep -v flatShading > results/${m}_after.txt
done
echo done > results/ALLDONE
