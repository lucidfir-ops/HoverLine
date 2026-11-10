#!/bin/bash
# Prototype 60: stripbench.js for the four rival levels in parallel.  usage: runall.sh MODE N GAMEFILE TAG
cd "$(dirname "$0")"; mkdir -p results
for l in tilt easy normal hard; do (LEVELS=$l GAME=./$3 node stripbench.js $1 $2 0 2>&1 | grep -v flatShading > results/$1_$4_$l.txt) & done; wait
