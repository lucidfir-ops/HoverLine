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
  // --- the code scheme ---
  const sch = await p.evaluate(() => { const h = window.__hl, out = {};
    const s = h.rndSeed(); out.rnd = s >= 0x1000000 && s < 0x2000000;
    h.loadTrack(0x123456, 'S', true, 'M', null, { k: 'U', d: null }); out.old = h.codeStr();
    h.loadTrack(0x1123456, 'S', true, 'M', null, { k: 'U', d: null }); out.v1 = h.codeStr(); const c = h.parseCode(out.v1); out.v1back = c && c.seed === 0x1123456;
    out.bad = h.parseCode('S2123456') === null && h.parseCode('S11234567') === null;
    out.oldSpec = h.specStr({ b: 1, n: { sweep: 1, jump: 2 } }); out.newSpec = h.specStr({ b: 1, n: { drop: 1 } });
    const q = h.parseCode('SX1ABCDEF-' + out.newSpec); out.newBack = q && q.sp && q.sp.n.drop === 1 && q.sp.n.sjump === 0;
    return out });
  ok(sch.rnd && sch.old === 'SX123456' && sch.v1 === 'SX1123456' && sch.v1back && sch.bad, 'codes: new tracks are version 1, seven hex digits from 1 (' + sch.v1 + '); six-digit codes stay as they were (' + sch.old + ')');
  ok(sch.oldSpec === '11002000000' && sch.newSpec === '1000000000000' + '1' && sch.newBack, 'editor codes: older counts write as before (' + sch.oldSpec + '), a new count adds digits (' + sch.newSpec + ') and reads back');
  // --- each new piece builds from the editor's counts ---
  const KINDS = { vspire: 10, dhelix: 11, drop: 12, sjump: 13, cjump: 14 };
  const spec = (k, n) => { const c = Array(15).fill(0); c[KINDS[k]] = n; return '1' + c.join('').replace(/0+$/, '') };
  const built = {};
  for (const k of Object.keys(KINDS)) for (const code of [`SXL1A0B0C${k.length}-` + spec(k, 1), `NXL1C0D0E${k.length}-` + spec(k, 2), `WXL10F1F2${k.length}-` + spec(k, 1)]) {
    const r = await p.evaluate(([code, k]) => { const h = window.__hl, c = h.parseCode(code); h.loadTrack(c.seed, c.wk, c.cx, c.lk, c.sp, c.bm); const T = h.T;
      const F = T.feats.filter((f) => (k === 'vspire' ? f.rev : k === 'dhelix' ? f.down : f.kind === k)), J = T.jumps.filter((j) => j.kind === k), S = T.splits.filter((s) => s.feat);
      const o = { n: F.length, want: c.sp.n[k], dropped: (T.dropped || {})[k] || 0, J: J.length, ok: true, why: '' };
      if (k === 'vspire') { o.ok = F.every((f) => T.drops.some((d) => d.u0 >= f.u0 - 2 && d.u1 <= f.u1)); o.why = 'mag-lock in each' }
      if (k === 'dhelix') { o.ok = F.every((f) => { const a = T.P[Math.round(f.u0 / T.ds) % T.N].y, b = T.P[Math.round((f.u1 - 30) / T.ds) % T.N].y; return b < a - 8 }); o.why = 'ends lower than it starts' }
      if (k === 'drop') { o.ok = J.length >= F.length && J.every((j) => j.lipH >= 10 && j.lipH <= 17.5 && j.slope === 0); o.why = 'each drop 10-17 m' }
      if (k === 'sjump') { const st = S.filter((s) => s.kind === 'stack'); o.stack = st.length; o.ok = J.every((j) => !j.stk || (j.hu > 15 && j.hu < 25 && j.stk.b[j.stk.upB].h[0] > 15 && j.stk.b[j.stk.lowB].h[0] === 0)); o.why = 'upper road 15-25 m over the lower' }
      if (k === 'cjump') { const st = S.filter((s) => s.kind === 'catch'); o.catch = st.length; o.ok = J.every((j) => j.G >= 135 && j.lipH >= 25) && st.every((s) => s.b[0].w[0] > T.D.w * 0.7); o.why = 'gap 135 m or more, landing 25 m down, catch road half as wide again' }
      return o }, [code, k]);
    built[k] = built[k] || []; built[k].push(r);
    ok(r.n >= 1 && r.n + r.dropped === r.want && r.ok, `${k} from the editor (${code}): ${r.n} of ${r.want} built` + (r.dropped ? `, ${r.dropped} left out for room` : '') + `; ${r.why}` + (r.stack != null ? `; ${r.stack} with both roads` : '') + (r.catch != null ? `; ${r.catch} with the catch road` : ''));
  }
  // --- how rare they are on generated tracks ---
  const share = await p.evaluate(() => { const h = window.__hl, c = { n: 0, cx: 0, drop: 0, sjump: 0, cjump: 0, spire: 0, vspire: 0, helix: 0, dhelix: 0, any: 0 }; let a = 0x5eed60;
    const rnd = () => { a = (Math.imul(a, 1103515245) + 12345) & 0x7fffffff; return a / 0x7fffffff };
    for (let i = 0; i < 160; i++) { const s = 0x1000000 + 1 + Math.floor(rnd() * 0xfffffe), cx = i % 5 !== 0; h.loadTrack(s, 'WSN'[i % 3], cx, ['M', 'L', 'Q'][i % 3 ? (i % 7 === 0 ? 2 : 0) : 1], null, { k: 'U', d: null }); const T = h.T; c.n++; if (cx) c.cx++;
      let any = 0; for (const k of ['drop', 'sjump', 'cjump']) if (T.feats.some((f) => f.kind === k)) { c[k]++; any = 1 }
      for (const f of T.feats) { if (f.kind === 'spire') { c.spire++; if (f.rev) { c.vspire++; any = 1 } } if (f.kind === 'helix') { c.helix++; if (f.down) { c.dhelix++; any = 1 } } } c.any += any }
    return c });
  const pc = (x, n) => Math.round(100 * x / n);
  ok(share.drop / share.cx < 0.2 && share.sjump / share.cx < 0.16 && share.cjump / share.cx < 0.13 && share.drop + share.sjump + share.cjump > 0, `rare: of ${share.cx} new complex tracks ${pc(share.drop, share.cx)}% have a drop, ${pc(share.sjump, share.cx)}% a speed jump, ${pc(share.cjump, share.cx)}% a long jump; ${share.vspire} of ${share.spire} spires rise, ${share.dhelix} of ${share.helix} spirals fall; ${pc(share.any, share.n)}% of all new tracks have something new`);
  // --- the editor: the new counts are rows like the others and build what they say ---
  const edr = await p.evaluate(async () => { const h = window.__hl; h.loadTrack(0x1A1B1C, 'S', true, 'L', null, { k: 'U', d: null }); h.openEd('menu'); await new Promise((r) => setTimeout(r, 300));
    const rows = [...document.querySelectorAll('#edFeats .erow')].map((r) => r.dataset.k);
    const row = document.querySelector('#edFeats .erow[data-k="drop"]'); row.querySelector('[data-d="1"]').click(); await new Promise((r) => setTimeout(r, 1500));
    const T = h.T, o = { rows, drops: T.feats.filter((f) => f.kind === 'drop').length, code: h.codeStr(), fit: document.getElementById('edFit').textContent }; o.n = (h.parseCode(o.code).sp || { n: {} }).n.drop;
    h.closeEd(false); return o });
  ok(['vspire', 'dhelix', 'drop', 'sjump', 'cjump'].every((k) => edr.rows.includes(k)) && edr.drops === 1 && edr.n === 1, 'editor: rows for the five new counts; + on Drops builds one (' + edr.code + ' · ' + edr.fit + ')');
  // --- bot races through each piece: everyone finishes a lap, nothing goes wrong ---
  const RACES = ['SXL1A0B0C4-' + spec('drop', 2), 'NXL1C0D0E5-' + spec('sjump', 1), 'WXL10F1F25-' + spec('cjump', 1), 'SXL1A0B0C6-' + spec('vspire', 1), 'WXL10F1F26-' + spec('dhelix', 1), 'SXL1ABABAB-' + spec('sjump', 1)];
  const q = await open(b, 'tf60race', { query: '&bot=1', storage: { 'hoverline.laps': '1' } });
  for (const code of RACES) {
    const r = await q.evaluate(async (code) => { const h = window.__hl, c = h.parseCode(code); h.loadTrack(c.seed, c.wk, c.cx, c.lk, c.sp, c.bm);
      await h.startRace(); for (let k = 0; k < 100 && h.S.state !== 'race'; k++) await new Promise((r) => setTimeout(r, 100));
      const T = h.T, J = T.jumps.filter((j) => j.kind), seen = new Set(), up = new Set(); let bad = 0, steps = 0;
      while (steps < 60 * 400 && !h.racers.every((r) => r.finishT != null)) { for (let k = 0; k < 120; k++) { h.step(1 / 60); steps++ }
        for (const r of h.racers) { if (![r.u, r.v, r.lat, r.h, r.utot].every(Number.isFinite)) bad++; if (r.air && r.air.kind) seen.add(r.name); if (h.onUpper(r)) up.add(r.name) } }
      return { L: Math.round(T.L), fin: h.racers.filter((r) => r.finishT != null).length, n: h.racers.length, flew: seen.size, up: up.size, bad, t: Math.round(steps / 60), state: h.S.state, jumps: J.length } }, code);
    ok(r.fin === r.n && !r.bad && (r.jumps === 0 || r.flew > 0), `bot race on ${code}: ${r.fin} of ${r.n} finish a lap in ${r.t} s, ${r.flew} flew its new jumps` + (r.up ? `, ${r.up} reached the upper road` : '') + (r.bad ? `, ${r.bad} bad numbers` : ''));
  }
  // --- ghosts and remote ships know which of the two roads a frame is on ---
  const gh = await q.evaluate(() => { const h = window.__hl, c = h.parseCode('NXL1C0D0E5-' + '1' + '0'.repeat(13) + '1'); h.loadTrack(c.seed, c.wk, c.cx, c.lk, c.sp, c.bm); const T = h.T, S0 = T.splits.find((s) => s.kind === 'stack'); if (!S0) return null;
    const r = h.player; r.u = S0.u0 + 40; r.brS = S0; r.br = S0.upB; const f1 = h.mpFlags(r) & 32768, u1 = h.onUpper(r); r.br = S0.lowB; const f0 = h.mpFlags(r) & 32768;
    const g = { isGhost: true, stkUp: true, u: S0.u0 + 40 }, a = h.surf(S0.u0 + 40, 0, g); const gu = a.b === S0.upB && a.h > 15; g.stkUp = false; const b2 = h.surf(S0.u0 + 40, 0, { isGhost: true, stkUp: false, u: S0.u0 + 40 });
    return { f1: !!f1, f0: !!f0, u1, gu, gl: b2.b === S0.lowB } });
  ok(gh && gh.f1 && !gh.f0 && gh.u1 && gh.gu && gh.gl, 'speed jump: a remote ship\'s pose and a ghost carry the upper road, and are drawn on it ' + JSON.stringify(gh));
  ok(!p.errs.length && !q.errs.length, 'no page errors ' + JSON.stringify([...p.errs, ...q.errs].slice(0, 3)));
  await b.close(); done();
})();
