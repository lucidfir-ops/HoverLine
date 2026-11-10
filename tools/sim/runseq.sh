#!/bin/bash
cd "$(dirname "$0")"
./runall.sh strips 3 game_before.js before
./runall.sh strips 3 game_after.js after
./runall.sh smoke 3 game_before.js before
./runall.sh smoke 3 game_after2.js after
echo done > results/ALLDONE
