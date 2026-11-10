// Quick check that the built page loads and races: menus up, a bot race runs 20 s, no page errors.  node smoke.js
const { launch, open, until, wait, ok, done } = require('./lib.js');
(async () => { const b = await launch();
  const p = await open(b, 'smoke', { vp: { width: 1280, height: 720 }, query: '&bot=1' });
  ok(await p.evaluate(() => !!window.__hl && window.__hl.S.state === 'menu'), 'the page loads to the menu');
  await p.evaluate(() => window.__hl.startRace()); await until(p, () => window.__hl.S.state === 'race', 60000, 'race');
  await wait(20000); const u = await p.evaluate(() => window.__hl.player.utot);
  ok(u > 500, 'a bot race runs (' + Math.round(u) + ' m in 20 s)');
  ok(p.errs.length === 0, 'no page errors ' + JSON.stringify(p.errs.slice(0, 3)));
  await b.close(); done() })().catch((e) => { console.log('FAIL', e.message); process.exit(1) });
