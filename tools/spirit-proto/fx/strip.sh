#!/bin/bash
# strip.sh <dir with frames-NAME folders> <outdir> NAME... : a 3x2 sheet of six frames spread over each clip, for checking
D=$1; O=$2; shift 2
for n in "$@"; do
  F=($(ls "$D/frames-$n"/*.png)); c=${#F[@]}
  python3 "$(dirname "$0")/sheet.py" "$O/strip-$n.png" 3 "${F[$((c*1/12))]}" "${F[$((c*3/12))]}" "${F[$((c*5/12))]}" "${F[$((c*7/12))]}" "${F[$((c*9/12))]}" "${F[$((c*11/12))]}"
done
