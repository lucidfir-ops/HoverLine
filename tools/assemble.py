import os, re
def assemble(SRC):
    """Join src/ back into the page body (what src/hoverline.html used to hold), exactly."""
    rd = lambda p: open(os.path.join(SRC, p), encoding='utf-8', newline='').read()
    def part(p):
        t = rd(p); t = re.sub(r'\A(?://#(?: [^\n]*)?\n)+', '', t)      # the header lines
        return re.sub(r'^//#include (\S+)$', lambda m: rd(m.group(1)), t, flags=re.M)
    js = ''.join(part(p) for p in rd('js/ORDER').split())
    page = rd('page.html').replace('<!--#js-->', js)
    return re.sub(r'<!--#include (\S+)-->', lambda m: rd(m.group(1)), page)
if __name__ == '__main__':
    import sys; open(sys.argv[2], 'w', encoding='utf-8', newline='').write(assemble(sys.argv[1]))
