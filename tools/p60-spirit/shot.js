// Spirit realm dossier thumbnails (docs/spirit-realm). Not game code.
// node tools/p60-spirit/shot.js docs/spirit-realm vendor/three.min.js lattice stepped knot portal  (writes <name>.jpg; rename to match the dossier)
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const [outDir, threePath, ...names] = process.argv.slice(2);
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'] });
  const p = await (await b.newContext({ viewport: { width: 640, height: 360 } })).newPage();
  p.on('pageerror', (e) => console.log('ERR', e.message));
  await p.setContent('<html><body style="margin:0;background:#000"></body></html>');
  await p.addScriptTag({ content: fs.readFileSync(threePath, 'utf8') });
  await p.addScriptTag({ content: fs.readFileSync(path.join(__dirname, 'scenes.js'), 'utf8') });
  for (const n of names) {
    await p.evaluate((n) => window.shot(n), n);
    const url = await p.evaluate(() => document.getElementById('out').toDataURL('image/jpeg', 0.82));
    const f = path.join(outDir, n + '.jpg'); fs.writeFileSync(f, Buffer.from(url.split(',')[1], 'base64'));
    console.log(n, fs.statSync(f).size);
  }
  await b.close();
})();
