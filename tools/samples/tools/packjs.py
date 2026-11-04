"""Make the file:// form of a samples/ folder: every <pack>.bin as <pack>.js (a script that registers its bytes) and
manifest.json as manifest.js. A page opened from file:// can't fetch, but it can load scripts.
    python3 tools/packjs.py SRC_DIR DST_DIR        (DST may equal SRC to add the .js files beside the .bin ones)"""
import base64, json, os, sys


def pack_js(name, data):
    return 'HLSMP_PACK(' + json.dumps(name) + ',"' + base64.b64encode(data).decode() + '");\n'


def manifest_js(text):
    return 'HLSMP_MAN(' + text.strip() + ');\n'


def convert(src, dst, keep_bin=False):
    os.makedirs(dst, exist_ok=True)
    man = json.load(open(os.path.join(src, 'manifest.json')))
    out = {'manifest.js': manifest_js(open(os.path.join(src, 'manifest.json')).read())}
    for p, P in man['packs'].items():
        out[P['file'][:-4] + '.js'] = pack_js(p, open(os.path.join(src, P['file']), 'rb').read())
    for k, v in out.items():
        open(os.path.join(dst, k), 'w').write(v)
    return out


if __name__ == '__main__':
    o = convert(sys.argv[1], sys.argv[2])
    print('wrote', len(o), 'scripts,', round(sum(len(v) for v in o.values()) / 1e6, 2), 'MB')
