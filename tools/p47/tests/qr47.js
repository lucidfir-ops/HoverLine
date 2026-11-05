// Prototype 47: QR codes read by the bundled decoder (jsQR) in browsers without a QR reader of their own (Firefox, the
// Steam Deck, Android browsers without Google's barcode service).      node qr47.js
//   1  every kind of pairing code the game makes draws as a QR code jsQR reads back exactly (alphanumeric mode, version)
//   2  two browsers with no BarcodeDetector pair by camera alone: the pilot scans the host's code, the host the reply
//      (each "camera" is a canvas stream showing the other's QR code, slightly turned, on grey)
//   3  a BarcodeDetector that throws (no barcode service): the scan hands over to jsQR
//   4  no camera at all (the Steam Deck): no Scan buttons, the steps say type it in
const { wait, until, launch, open, toLan, inLobby, ok, done } = require('./lib47.js');
const CAM = (mode) => {
  if (mode === 'none') delete window.BarcodeDetector;
  if (mode === 'broken') window.BarcodeDetector = class { static async getSupportedFormats() { return ['qr_code'] } async detect() { throw new DOMException('Barcode detection service unavailable.', 'NotSupportedError') } };
  if (mode === 'nocam') { delete window.BarcodeDetector; const md = navigator.mediaDevices;
    md.enumerateDevices = async () => [{ kind: 'audioinput', deviceId: '', label: '' }, { kind: 'audiooutput', deviceId: '', label: '' }];
    const o = md.getUserMedia.bind(md); md.getUserMedia = async (c) => { if (c && c.video) throw new DOMException('Requested device not found', 'NotFoundError'); return o(c) }; return }
  const md = navigator.mediaDevices, orig = md.getUserMedia.bind(md); window.__camSrc = null; window.__camOpens = 0;
  md.getUserMedia = async (c) => { if (!(c && c.video)) return orig(c); window.__camOpens++;
    const cv = document.createElement('canvas'); cv.width = 1280; cv.height = 720; const g = cv.getContext('2d'), img = new Image();
    const draw = () => { g.fillStyle = '#8a8d92'; g.fillRect(0, 0, 1280, 720);
      if (window.__camSrc) { if (img.src !== window.__camSrc) img.src = window.__camSrc; if (img.complete && img.naturalWidth) { g.save(); g.translate(640, 360); g.rotate(0.07); g.drawImage(img, -250, -250, 500, 500); g.restore() } }
      setTimeout(draw, 50) }; draw(); return cv.captureStream(20) } };
(async () => {
  const b = await launch(['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream']);
  // 1. codes as QR codes, read back by jsQR
  { const p = await open(b, 'unit', { init: CAM, initArg: 'none' });
    const r = await p.evaluate(async () => { const { LAN, Chirp, jsqrLib, qrDraw } = window.__nb, J = jsqrLib(), out = [];
      const fp = () => Array.from(crypto.getRandomValues(new Uint8Array(32)), (x) => x.toString(16).toUpperCase().padStart(2, '0')).join(':');
      const b64 = (n) => Array.from(crypto.getRandomValues(new Uint8Array(n)), (x) => 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'[x & 63]).join('');
      const hex = (n) => Array.from(crypto.getRandomValues(new Uint8Array(n / 2)), (x) => x.toString(16).padStart(2, '0')).join('');
      const shapes = { 'reply, Chrome, one address': { kind: 1, uf: b64(4), pw: b64(24), cands: [{ a: '192.168.1.23', port: 51234 }] },
        'invitation, Chrome, two addresses': { kind: 0, uf: b64(4), pw: b64(24), cands: [{ a: '192.168.1.23', port: 51234 }, { a: '10.0.0.4', port: 40000 }] },
        'invitation, Firefox': { kind: 0, uf: hex(8), pw: hex(32), cands: [{ a: '192.168.0.5', port: 3478 }, { a: '172.20.10.2', port: 3479 }] },
        'reply, mDNS name': { kind: 1, uf: b64(4), pw: b64(24), cands: [{ a: crypto.randomUUID() + '.local', port: 61000 }] } };
      const c = document.createElement('canvas'); c.width = 330; c.height = 330; const g = c.getContext('2d');
      for (const [nm, o] of Object.entries(shapes)) for (let t = 0; t < 8; t++) {
        const code = LAN.code({ ...o, code: 'K7QX2', tag: (t * 37) & 255, fp: fp() }), M = LAN.qr(code); qrDraw(c, code);
        const d = g.getImageData(0, 0, 330, 330), rd = J(d.data, 330, 330), back = LAN.unpack(code);
        out.push({ nm, len: code.length, mod: M.length, read: !!rd && rd.data === code, back: !!back && back.uf === o.uf && back.pw === o.pw && JSON.stringify(back.cands) === JSON.stringify(o.cands) && back.kind === o.kind }) }
      const plain = LAN.qr('https://example.com/?q=Hoverline'); return { out, plain: plain.length } });
    const by = {}; for (const x of r.out) { const k = x.nm; (by[k] ||= { n: 0, read: 0, back: 0, len: x.len, mod: new Set() }); by[k].n++; by[k].read += x.read; by[k].back += x.back; by[k].mod.add(x.mod) }
    for (const [k, v] of Object.entries(by)) ok(v.read === v.n && v.back === v.n, `${k}: ${v.len} letters, QR ${[...v.mod].join('/')} modules a side, jsQR read ${v.read}/${v.n}, code read back ${v.back}/${v.n}`);
    ok(Math.max(...r.out.map((x) => x.mod)) <= 41, 'every pairing code is a version 6 symbol or smaller (alphanumeric mode)'); ok(r.plain > 0, 'text with small letters still draws (byte mode)');
    await p.ctx.close() }
  // 2. two browsers with no BarcodeDetector pair by camera alone
  { const H = await open(b, 'Host', { init: CAM, initArg: 'none', perms: ['microphone', 'camera'], vp: { width: 844, height: 390 } }), G = await open(b, 'Pilot', { init: CAM, initArg: 'none', perms: ['microphone', 'camera'], vp: { width: 844, height: 390 } });
    for (const [p, n] of [[H, 'Host'], [G, 'Pilot']]) { await toLan(p, n); await p.click('[data-pair="qr"]') }
    ok(await H.evaluate(() => !('BarcodeDetector' in window)), 'no BarcodeDetector in either browser');
    await H.click('#chirpHostBtn'); await until(H, () => !!window.__nb.lan.code && !document.getElementById('lanQR').hidden, 15000, 'host QR');
    const inv = await H.evaluate(() => ({ code: window.__nb.lan.code, png: document.getElementById('lanQR').toDataURL() }));
    await G.click('#chirpJoinBtn'); await until(G, () => window.__nb.lan.mode === 'guest' && !document.getElementById('lanScan').hidden, 5000, 'pilot scan button');
    await G.evaluate((png) => { window.__camSrc = png }, inv.png); await G.click('#lanScan');
    await until(G, () => !!window.__nb.lan.code, 20000, 'pilot read the host code and made a reply');
    const g1 = await G.evaluate(() => ({ reply: window.__nb.lan.code, qr: window.__nb.PDG.cur && window.__nb.PDG.cur.qr, cam: document.getElementById('lanCam').hidden, png: document.getElementById('lanQR').toDataURL(), title: document.getElementById('lanTitle').textContent }));
    ok(g1.qr && g1.qr.found === 1 && g1.qr.by === 'jsQR' && g1.cam, `pilot: the camera read the host's code with jsQR (${JSON.stringify(g1.qr)}), the camera closed, "${g1.title}"`);
    await H.evaluate((png) => { window.__camSrc = png }, g1.png); await H.click('#lanScan');
    for (const p of [H, G]) await until(p, (n) => { const s = window.__hl.mp.sess; return !!s && s.state.phase === 'lobby' && s.state.roster.length === 2 }, 30000, 'both in the lobby');
    const h1 = await H.evaluate(() => window.__nb.PDG.cur && window.__nb.PDG.cur.qr);
    ok(h1 && h1.found === 1 && h1.by === 'jsQR', `host: scanned the reply with jsQR (${JSON.stringify(h1)}) and both are in the lobby`);
    ok(H.errs.length + G.errs.length === 0, 'no page errors'); await H.ctx.close(); await G.ctx.close() }
  // 3. a BarcodeDetector that throws hands over to jsQR
  { const H = await open(b, 'Host3', { init: CAM, initArg: 'none', perms: ['camera'] }), G = await open(b, 'Pilot3', { init: CAM, initArg: 'broken', perms: ['camera'] });
    for (const [p, n] of [[H, 'Host'], [G, 'Pilot']]) { await toLan(p, n); await p.click('[data-pair="qr"]') }
    await H.click('#chirpHostBtn'); await until(H, () => !!window.__nb.lan.code && !document.getElementById('lanQR').hidden, 15000, 'host QR');
    const png = await H.evaluate(() => document.getElementById('lanQR').toDataURL());
    await G.click('#chirpJoinBtn'); await G.evaluate((png) => { window.__camSrc = png }, png); await G.click('#lanScan');
    await until(G, () => !!window.__nb.lan.code, 20000, 'read through the fallback');
    const q = await G.evaluate(() => window.__nb.PDG.cur.qr); ok(q.found === 1 && q.by === 'jsQR' && /failed/.test(q.reader), `a built-in reader that throws: jsQR took over (${JSON.stringify(q)})`);
    await H.ctx.close(); await G.ctx.close() }
  // 4. no camera: no Scan buttons, typing only
  { const G = await open(b, 'Deck', { init: CAM, initArg: 'nocam', vp: { width: 1280, height: 800 } }); await toLan(G, 'Deck'); await G.click('[data-pair="qr"]'); await G.click('#chirpJoinBtn'); await wait(600);
    const v = await G.evaluate(() => ({ scan: !document.getElementById('lanScan').hidden, steps: document.getElementById('lanSteps').textContent, input: !document.getElementById('lanInRow').hidden, jsqr: typeof window.jsQR }));
    ok(!v.scan && v.input && /type in the code/.test(v.steps) && v.jsqr === 'undefined', `no camera: no Scan button, a typing box, "${v.steps.slice(0, 60)}…", jsQR never loaded`);
    await G.ctx.close() }
  await b.close(); done();
})().catch((e) => { console.error('FAIL', e); process.exit(1) });
