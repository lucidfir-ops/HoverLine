// Mock-ups of frame looks: renders the game's own ships (makeShip) with look ideas applied, plus a concept Blade hull.
const { chromium } = require('playwright');
const fs = require('fs');
const THREE_JS = fs.readFileSync('/home/claude/hoverline/vendor/three.min.js', 'utf8');
const scene = fs.readFileSync(__dirname + '/scene.js', 'utf8');
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'] });
  const ctx = await b.newContext({ viewport: { width: 640, height: 400 }, deviceScaleFactor: 2 });
  await ctx.route('**/three.min.js', (r) => r.fulfill({ body: THREE_JS, contentType: 'text/javascript' }));
  await ctx.route('**/samples/**', (r) => r.fulfill({ status: 404, body: '' }));
  await ctx.route(/^https?:\/\/(?!cdnjs)/, (r) => r.fulfill({ status: 404, body: '' }));
  const p = await ctx.newPage();
  p.on('pageerror', (e) => console.log('ERR', e.message));
  await p.goto('file:///home/claude/mock/game.html?render=0&share=0&quick=0&lb=http://127.0.0.1:9');
  await p.waitForFunction(() => window.__mk, null, { timeout: 30000 });
  await p.addScriptTag({ content: fs.readFileSync(__dirname + '/tether2.js', 'utf8') });
  await p.addScriptTag({ content: fs.readFileSync(__dirname + '/frames2.js', 'utf8') });
  await p.addScriptTag({ content: scene });
  const jobs = JSON.parse(process.argv[2]);
  for (const j of jobs) {
    await p.evaluate((j) => window.mockShot(j), j);
    await p.waitForTimeout(150);
    await p.locator('#mockc').screenshot({ path: __dirname + '/out/' + j.out + '.png' });
    console.log('ok', j.out);
  }
  await b.close();
})();
