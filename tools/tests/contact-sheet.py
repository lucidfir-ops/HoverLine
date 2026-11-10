#!/usr/bin/env python3
"""Prototype 60: a contact sheet of views (for looking at many renders at once).
python3 tools/tests/contact-sheet.py OUT.jpg 'DIR/pattern*.jpg' [columns=4] [width=320]"""
import glob, sys
from PIL import Image
out, pat = sys.argv[1], sys.argv[2]
cols = int(sys.argv[3]) if len(sys.argv) > 3 else 4
w = int(sys.argv[4]) if len(sys.argv) > 4 else 320
fs = sorted(glob.glob(pat))
if not fs:
    sys.exit('no files')
h = w * 9 // 16
rows = (len(fs) + cols - 1) // cols
sheet = Image.new('RGB', (w * cols, h * rows))
for k, f in enumerate(fs):
    sheet.paste(Image.open(f).resize((w, h)), ((k % cols) * w, (k // cols) * h))
sheet.save(out, quality=85)
print(out, len(fs), 'views')
