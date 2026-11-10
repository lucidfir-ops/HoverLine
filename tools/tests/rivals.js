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
  /* Prototype 60: Expert's speed per road width (fitted in tools/sim so the clean Eric pilot of each width finishes
     mid-field on it; Wide was 1.15 and Standard 1.09 before), its mistakes the same on every width, and the other levels
     unchanged (Default is the board's reference). ailOf() gives the level as raced on the current track's width. */
  const lv = await p.evaluate(() => { const H = window.__hl, out = {}, T0 = H.T, ail0 = H.S.ail;
    for (const wk of ['W', 'S', 'N']) { H.T.wk = wk; for (const k of ['tilt', 'easy', 'normal', 'hard']) { H.S.ail = k; const L = H.ailOf(); out[k + wk] = [L.pace, L.sig, L.tau, L.nose, L.strip, L.react, L.sharp || 0, L.band, L.sb].join('/') } }
    H.T.wk = T0.wk; H.S.ail = ail0; H.ailOf(); return out });
  const want = { hardW: '1.22/0.4/0.75/0/0/0/1/0.3/1', hardS: '1.17/0.4/0.75/0/0/0/1/0.3/1', hardN: '1.1/0.4/0.75/0/0/0/1/0.3/1' };
  for (const wk of ['W', 'S', 'N']) {
    ok(lv['hard' + wk] === want['hard' + wk], 'Expert on ' + wk + ': pace/sig/tau/nose/strip/react/sharp/band/sb ' + lv['hard' + wk]);
    ok(lv['normal' + wk] === '1/1/1/0/0/0/0/1/0', 'Default unchanged on ' + wk + ' (' + lv['normal' + wk] + ')');
    ok(lv['easy' + wk] === '1/1.7/1.35/0.4/0.5/0.5/0/0.3/1', 'Beginner unchanged on ' + wk + ' (' + lv['easy' + wk] + ')');
    ok(lv['tilt' + wk] === '0.93/1.9/1.45/0.5/0.6/0.6/0/0.4/1', 'Tilt unchanged on ' + wk + ' (' + lv['tilt' + wk] + ')');
  }
  ok(p.errs.length === 0, 'no page errors');
  await b.close(); done();
})();
