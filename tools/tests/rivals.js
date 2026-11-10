// P58: the Rivals setting (Tilt / Beginner / Default / Expert; Default was Normal before Prototype 60): the dropdown, saved, used for the race.
const { launch, open, ok, done, wait } = require('./lib.js');
(async () => {
  const b = await launch(); const p = await open(b, 'rivals', { vp: { width: 1280, height: 800 }, query: '&bot=1' });
  await p.evaluate(() => { document.getElementById('playBtn').click() }); await wait(300); await p.evaluate(() => { document.getElementById('raceMode').click() }); await wait(300);
  const opts = await p.evaluate(() => [...document.getElementById('ailSel').options].map(o => o.value + ':' + o.textContent));
  ok(opts.join() === 'tilt:Tilt,easy:Beginner,normal:Default,hard:Expert', 'Rivals offers Tilt, Beginner, Default, Expert (' + opts.join() + ')');
  ok(await p.evaluate(() => document.getElementById('ailSel').value) === 'normal', 'Default by default (no tilt)');
  await p.evaluate(() => { const s = document.getElementById('ailSel'); s.value = 'hard'; s.dispatchEvent(new Event('change')) });
  ok(await p.evaluate(() => localStorage.getItem('hoverline.ail')) === 'hard', 'the choice is saved');
  await p.evaluate(() => window.__hl.startRace()); await wait(500);
  ok(await p.evaluate(() => window.__hl.S.ail) === 'hard', 'the race runs with Expert rivals');
  ok(p.errs.length === 0, 'no page errors');
  await b.close(); done();
})();
