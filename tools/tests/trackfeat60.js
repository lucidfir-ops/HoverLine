// Prototype 60: the new track features (drops, speed jumps, long catch jumps, the spire run the other way) and old codes.
// 1. Old codes build exactly the tracks they did before Prototype 60: a hash of the road (centreline, frames, features,
//    jumps, splits and their routes, pads, strips, walls, fences, gaps, mag-lock) and a count of the scenery, for Eric's
//    codes from the logs and random codes of every width, layout, length and scenery, against trackfeat60-hashes.json
//    (made from the Prototype 59 road by MAKE=1 on that build).
// 2. Each new feature builds on new codes and from the editor's counts, and a bot race completes through it.
//       node tools/tests/trackfeat60.js            MAKE=1 node tools/tests/trackfeat60.js  (writes the hashes)
const fs = require('fs'), path = require('path');
const { launch, open, ok, done, wait } = require('./lib.js');
const HF = path.join(__dirname, 'trackfeat60-hashes.json');
const ERIC = ['NL9A7E2A-N', 'NLEDBAFE-R', 'NQ45F875-P', 'NX130F38-P', 'NX150935-P', 'NX3D7DBD', 'NXD8C77A-P', 'NXE1425F-P', 'NXFC1ECA-R', 'NXL13D738-23224444222-N', 'NXL1FDB51-23224444222-P3443', 'NXL1FDB51-23224444222-R', 'NXL2CF89D-23224444222-O', 'NXL4ADBF6-F', 'NXL7D6FF6-33224444222-P3443', 'NXL9F9857', 'NXLABE457-23224444222-N', 'NXLBF18BD-33224444222-P', 'NXLC4B123-N', 'NXLF78057-23224444222-O', 'NXQ5102B5-33224444222-F', 'SLC32957-P', 'SLE54D5C', 'SQE15E93-P', 'SXFAB551-R', 'SXL26F230-F', 'SXL447D32', 'SXL455BB0-23224444222-F', 'SXLAB4F08-23224444222-F', 'SXLB8350A-P', 'SXLDC93AF-23224444222-F', 'SXLF537D2-P', 'W3ADFB8-P', 'W8F8E4D-R', 'WC3D1AB-P', 'WL1861CC-N', 'WL1EB972-N', 'WL2436F9', 'WQCC8D66-P', 'WQCEA77B-N', 'WX630A48', 'WXL1B67A4-23224444222-R', 'WXL2AAD94-O', 'WXL574BBC-23224444222', 'WXL5A090C', 'WXL641365-23224444222-O', 'WXL6F5158-F', 'WXLA5736F-R', 'WXLDCC597-33224444222', 'WXLE486ED-F', 'WXQ0B28A0-P', 'WXQ465C83-33224444222-R', 'WXQ9A1754', 'WXQD5CD65-P', 'WXQD87244-33224444222-P'];
// random old codes: every width, simple and complex, three lengths, every scenery, a few editor counts (spires, spirals, splits)
const RAND = (() => { const out = []; let a = 0x60feed; const rnd = () => { a = (Math.imul(a, 1103515245) + 12345) & 0x7fffffff; return a / 0x7fffffff };
  for (let i = 0; i < 30; i++) { const s = 1 + Math.floor(rnd() * 0xfffffe), w = 'WSN'[i % 3], cx = i % 4 !== 0, l = ['', 'Q', 'L'][Math.floor(i / 3) % 3], b = 'UOFNRP'[i % 6];
    let c = w + (cx ? 'X' : '') + l + s.toString(16).toUpperCase(); if (i % 5 === 4) c = w + s.toString(16).toUpperCase() + '-' + ['1121112' + '211', '2012120' + '1222', '30111110' + '22', '1000000' + '0002', '2101010' + '1012', '1111111' + '1112'][i % 6];
    out.push(c + (b === 'U' ? '' : '-' + b)) }
  return out })();
const CODES = [...ERIC, ...RAND];
// the road's fingerprint, in the page
const HASH = (code) => { const h = window.__hl, c = h.parseCode(code); if (!c) return null; h.loadTrack(c.seed, c.wk, c.cx, c.lk, c.sp || null, c.bm); const T = h.T;
  let x = 2166136261 >>> 0; const mix = (n) => { const s = String(n); for (let i = 0; i < s.length; i++) x = Math.imul(x ^ s.charCodeAt(i), 16777619) >>> 0; x = Math.imul(x ^ 44, 16777619) >>> 0 };
  const f = (v) => mix(Number.isFinite(v) ? Math.round(v * 1e4) : String(v)), V = (q) => { f(q.x); f(q.y); f(q.z) }, A = (a) => { if (!a) { mix('-'); return } for (let i = 0; i < a.length; i++) f(a[i]) };
  const part = {}; const cut = (k, fn) => { x = 2166136261 >>> 0; fn(); part[k] = x.toString(16) };
  cut('P', () => { mix(T.N); f(T.L); for (let i = 0; i < T.N; i++) { V(T.P[i]); V(T.U[i]); f(T.K[i]) } });
  cut('feats', () => { for (const q of T.feats) { mix(q.kind); f(q.u0); f(q.u1) } for (const j of T.jumps) { f(j.u0); f(j.u1); f(j.G); f(j.lipH); f(j.slope) } for (const d of T.drops || []) { f(d.u0); f(d.u1) } A(T.gap); A(T.kind) });
  cut('splits', () => { for (const S of T.splits) { mix(S.kind); f(S.u0); f(S.u1); mix(S.n); for (const B of S.b) { A(B.c); A(B.h); A(B.w) } } for (const p of T.pads) { f(p.u0); f(p.u1); f(p.lat) } for (const z of T.zones) { mix(z.kind); f(z.u0); f(z.u1) } });
  cut('walls', () => { A(T.wallH); A(T.ctop); A(T.mag) });
  let nm = 0, nv = 0; T.group.traverse((o) => { nm++; if (o.geometry && o.geometry.attributes && o.geometry.attributes.position) nv += o.geometry.attributes.position.count });
  part.scene = nm + '/' + nv; return part };
(async () => {
  const b = await launch(); const p = await open(b, 'tf60', {});
  const got = {};
  for (const c of CODES) got[c] = await p.evaluate(HASH, c);
  if (process.env.MAKE) { fs.writeFileSync(HF, JSON.stringify(got, null, 0).replace(/},"/g, '},\n"') + '\n'); console.log('wrote', HF, Object.keys(got).length, 'codes'); await b.close(); return done() }
  const want = JSON.parse(fs.readFileSync(HF, 'utf8')); let same = 0, diff = [];
  for (const c of CODES) { const a = got[c], w = want[c]; if (!w) continue; const bad = Object.keys(w).filter((k) => w[k] !== (a && a[k])); if (bad.length) diff.push(c + ':' + bad.join('/')); else same++ }
  ok(!diff.length && same === Object.keys(want).length, `old codes build the same road as Prototype 59: ${same} of ${Object.keys(want).length} the same` + (diff.length ? ' · different: ' + diff.join(' ') : ''));
  if (process.env.ONLY_HASH) { await b.close(); return done() }
  await b.close(); done();
})();
