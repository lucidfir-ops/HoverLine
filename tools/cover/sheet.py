"""A contact sheet: images in a grid, each labelled with its file name, saved as one small JPG.
python3 tools/cover/sheet.py out.jpg cols tile_width img1 img2 ..."""
import os
import sys

from PIL import Image, ImageDraw

out, cols, tw, files = sys.argv[1], int(sys.argv[2]), int(sys.argv[3]), sys.argv[4:]
ims = [Image.open(f).convert('RGB') for f in files]
th = max(round(tw * im.height / im.width) for im in ims)
rows = (len(ims) + cols - 1) // cols
pad, lab = 6, 16
sheet = Image.new('RGB', (cols * (tw + pad) + pad, rows * (th + pad + lab) + pad), (9, 11, 16))
d = ImageDraw.Draw(sheet)
for k, (f, im) in enumerate(zip(files, ims)):
    x, y = pad + (k % cols) * (tw + pad), pad + (k // cols) * (th + pad + lab)
    t = im.resize((tw, round(tw * im.height / im.width)), Image.LANCZOS)
    sheet.paste(t, (x, y + lab))
    d.text((x + 2, y + 2), '%d  %s' % (k + 1, os.path.splitext(os.path.basename(f))[0]), fill=(242, 239, 230))
sheet.save(out, 'JPEG', quality=80, optimize=True)
print(out, sheet.size, os.path.getsize(out) // 1024, 'KB')
