// Prototype 64: the direction mix of spires and spirals on new complex codes. A spire goes up round the ring
// and dives down the middle (the original) or rises up the middle and spirals down (reversed, Prototype 60); a spiral
// rises (the original) or falls. Eric (11-12): "i don't remember seeing an upwards spiral into a dive since the update".
// Builds N random version 2 complex codes (seven digits starting with 2, from Prototype 64) of every width and length,
// counts the pieces on the finished road (T.feats), and checks the original spire is the more common one (about 60 to
// 40) and that rising spirals are at least half. Version 1 codes (starting with 1) keep their coin toss: N1 of them
// are counted too, and the draw on them is left alone (about half each). New random codes are version 2.
//       node tools/tests/spire-mix.js [N=500] [N1=300]
const { launch, open, ok, done } = require('./lib.js');
const N = +(process.argv[2] || 500), N1 = +(process.argv[3] || 300);
(async () => {
  const b = await launch(); const p = await open(b, 'spire-mix', {});
  const COUNT = (N, ver) => { const h = window.__hl; let a = 0x64a11ce; const rnd = () => { a = (Math.imul(a, 1103515245) + 12345) & 0x7fffffff; return a / 0x7fffffff };
    const o = { spire: 0, vspire: 0, helixUp: 0, helixDown: 0, tracks: 0, withSpire: 0, errs: 0 }, by = {};
    for (let i = 0; i < N; i++) { const s = 0x1000000 + Math.floor(rnd() * 0xffffff), c = 'WSN'[i % 3] + 'X' + ['', 'Q', 'L'][Math.floor(i / 3) % 3] + ver + (s & 0xffffff).toString(16).toUpperCase().padStart(6, '0'), pc = h.parseCode(c);
      if (!pc) { o.errs++; continue } try { h.loadTrack(pc.seed, pc.wk, pc.cx, pc.lk, pc.sp || null, pc.bm) } catch (e) { o.errs++; continue }
      o.tracks++; let any = false; for (const f of h.T.feats) { if (f.kind === 'spire') { f.rev ? o.vspire++ : o.spire++; any = true; const k = c[0] + (/[QL]/.test(c[2]) ? c[2] : ''); by[k] = by[k] || [0, 0]; by[k][f.rev ? 1 : 0]++ } if (f.kind === 'helix') f.down ? o.helixDown++ : o.helixUp++ } if (any) o.withSpire++ }
    o.by = by; return o };
  const r = await p.evaluate(`(${COUNT})(${N}, '2')`), r1 = await p.evaluate(`(${COUNT})(${N1}, '1')`);
  console.log(JSON.stringify(r)); console.log('version 1: ' + JSON.stringify(r1));
  p.rnd = await p.evaluate(() => window.__hl.rndSeed()); ok(p.rnd >= 0x2000000, 'new random codes are version 2 (' + p.rnd.toString(16) + ')');
  const sp = r.spire + r.vspire, hx = r.helixUp + r.helixDown;
  console.log(`spires ${sp}: original ${r.spire} (${(100 * r.spire / sp).toFixed(0)}%), reversed ${r.vspire} (${(100 * r.vspire / sp).toFixed(0)}%) · spirals ${hx}: rising ${r.helixUp} (${(100 * r.helixUp / hx).toFixed(0)}%), falling ${r.helixDown} (${(100 * r.helixDown / hx).toFixed(0)}%)`);
  ok(!r.errs, 'every code built');
  ok(sp >= 30 && r.spire / sp >= 0.5 && r.spire / sp <= 0.8, `spires: the original (spiral up, dive down the middle) is the more common, 50 to 80%: ${(100 * r.spire / sp).toFixed(0)}% of ${sp}`);
  ok(hx >= 30 && r.helixUp / hx >= 0.5, `spirals: rising is at least half: ${(100 * r.helixUp / hx).toFixed(0)}% of ${hx}`);
  const s1 = r1.spire + r1.vspire; ok(s1 >= 10 && r1.vspire / s1 >= 0.3 && r1.vspire / s1 <= 0.7, `version 1 codes keep the coin toss: ${(100 * r1.vspire / s1).toFixed(0)}% reversed of ${s1}`);
  await b.close(); done();
})();
