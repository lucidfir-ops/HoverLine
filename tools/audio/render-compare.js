// Prototype 62: render the same tunes with two builds of the page and compare the audio, sample for sample.
//
//   node tools/audio/render-compare.js --a path/to/before/index.html --b index.html [--out report.json] [--quick]
//
// For each tune, with the samples/ folder absent (the music plays on the recordings in the page) and present, it renders
//   pregen  the race tune through Pregen (pgMake: what the game plays as one recording), and
//   gen     the live engine for 24 bars on a fake clock, into a real offline context (as tools/music/tools/render.js),
// in both builds, with Math.random seeded the same, and compares an FNV-1a hash of every channel's float bits. Equal
// hashes mean the buffers are identical, bit for bit. Any difference is listed with the level of each side.
const fs = require('fs');
const path = require('path');
const { open, launch, ROOT } = require('./page.js');
const { driverMain } = require('./driver.js');
const cli = (n, d) => { const i = process.argv.indexOf('--' + n); return i < 0 ? d : (process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : true) };
const A = path.resolve(cli('a', '')), B = path.resolve(cli('b', path.join(ROOT, 'index.html'))), QUICK = !!cli('quick', false);
const OUT = cli('out', null);
// templates that between them use every kind of recording: drum kits of the library and the embedded ones, the Prototype 34
// and 38 instruments, percussion layers (cajon, latin, hand, bells, tabla, iron, tabla loop), the textures, the pads
const IDS = QUICK ? [5, 34, 88, 114] : [5, 12, 14, 22, 27, 34, 40, 45, 55, 60, 63, 70, 82, 88, 98, 103, 107, 111, 114, 125, 131];
const TUNE = (id, seed) => 'S' + id.toString(16).toUpperCase().padStart(2, '0') + (seed >>> 0).toString(16).toUpperCase().padStart(8, '0');
(async () => {
  const browser = await launch(), rows = []; let same = 0, diff = 0;
  for (const samples of [false, true]) {
    const pages = {};
    for (const [n, f] of [['a', A], ['b', B]]) { const p = pages[n] = await open(browser, { file: f, samples }); await p.evaluate(`(${driverMain})()`); await p.evaluate(() => __D.boot()) }
    const codes = [...IDS.map((id) => TUNE(id, 4242 + id)), ...(QUICK ? [] : ['T2488000406000001', 'D21820003F0001892', 'M3000019A001056', 'N608000145F400827'])];
    for (const code of codes) for (const kind of ['pregen', 'gen']) {
      if (kind === 'pregen' && QUICK && samples) continue;
      const r = {};
      for (const n of ['a', 'b']) r[n] = await pages[n].evaluate(([c, k]) => (k === 'pregen' ? __D.pregenHash(c, { rs: 5 }) : __D.renderGen(c, { rs: 5, bars: 24 })), [code, kind]).catch((e) => ({ err: String(e.message).slice(0, 120) }));
      const eq = r.a.ch && r.b.ch && r.a.ch.join() === r.b.ch.join(); eq ? same++ : diff++;
      rows.push({ samples: samples ? 'present' : 'absent', kind, code, same: !!eq, a: r.a, b: r.b });
      console.log((eq ? 'same ' : 'DIFF ') + (samples ? 'present' : 'absent ') + ' ' + kind.padEnd(6) + code + '  ' + (r.a.ch ? r.a.secs + ' s, ' + r.a.rms + ' dB rms, peak ' + r.a.peak : JSON.stringify(r.a)) + (eq ? '' : '  vs ' + (r.b.ch ? r.b.rms + ' dB, peak ' + r.b.peak : JSON.stringify(r.b))));
    }
    for (const p of Object.values(pages)) await p.context().close();
  }
  console.log(`\n${same} of ${same + diff} renders identical bit for bit` + (diff ? `, ${diff} differ` : ''));
  if (OUT) fs.writeFileSync(OUT, JSON.stringify({ a: A, b: B, same, diff, rows }, null, 1));
  await browser.close(); process.exit(diff ? 1 : 0);
})().catch((e) => { console.error('FAIL', e); process.exit(1) });
