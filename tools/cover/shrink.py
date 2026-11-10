"""Downscale a 2x screenshot to the itch.io size (Lanczos) and save it as PNG (or JPG with --jpg), under 2 MB.
python3 tools/cover/shrink.py in.png out.png W H [--jpg]"""
import os
import sys

from PIL import Image

src, out, w, h = sys.argv[1], sys.argv[2], int(sys.argv[3]), int(sys.argv[4])
im = Image.open(src).convert('RGB')
if im.size != (w, h):
    im = im.resize((w, h), Image.LANCZOS)
if '--jpg' in sys.argv or out.endswith('.jpg'):
    im.save(out, 'JPEG', quality=88, optimize=True, progressive=True)
else:
    im.save(out, 'PNG', optimize=True)
    if os.path.getsize(out) > 2_000_000:  # over the 2 MB we keep to: write a high-quality JPG beside it as well
        alt = out[:-4] + '.jpg'
        im.save(alt, 'JPEG', quality=90, optimize=True, progressive=True)
        print('  over 2 MB as PNG (%d KB); wrote %s (%d KB)' % (os.path.getsize(out) // 1024, alt, os.path.getsize(alt) // 1024))
print('  %s %dx%d %d KB' % (out, w, h, os.path.getsize(out) // 1024))
