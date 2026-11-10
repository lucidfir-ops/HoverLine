// Prototype 52: Prism remade (contour look, cave mouths, rivers, lakes, dark haze inside).
// node tools/tests/game52.js (about half a minute)
const { wait, launch, open, ok, done } = require('./lib.js');
(async () => {
  const b = await launch();
  const p = await open(b, 'p52', { vp: { width: 1280, height: 800 }, render: true, storage: { 'hoverline.tod': 'day' } });
  const r = await p.evaluate(() => { const h = window.__hl, out = {};
    for (const sd of [2, 4, 7, 8]) { h.loadTrack(sd, null, null, null, undefined, { k: 'P', d: null }); const PR = h.T.prism; out[sd] = { mode: PR.mode, mouths: PR.mouths, rivers: PR.rivers, lakes: PR.lakes.length } }
    // the haze goes dark inside a cavern, by day too, and comes back outside
    h.loadTrack(4, null, null, null, undefined, { k: 'P', d: null }); const T = h.T, c = h.camera, q = T.P[900], fog = h.scene.fog.color, before = fog.getHSL({}).l;
    c.position.set(q.x, q.y + 5, q.z); for (let k = 0; k < 90; k++) T.env.cave(c); out.dark = fog.getHSL({}).l; out.before = before; return out });
  ok(r[2].mode === 'mix' && r[2].mouths >= 4 && r[2].rivers >= 1, 'an in-and-out map has cave mouths and rivers ' + JSON.stringify(r[2]));
  ok(r[4].mode === 'in' && r[4].mouths === 0 && r[4].rivers >= 1, 'an all-inside map has rivers and no mouths ' + JSON.stringify(r[4]));
  ok(r[7].mode === 'out' && r[8].lakes >= 1, 'all-outside maps have lakes in the valleys ' + JSON.stringify([r[7], r[8]]));
  ok(r.dark < r.before * 0.3, `the haze goes dark inside a cavern by day (lightness ${r.before.toFixed(2)} -> ${r.dark.toFixed(2)})`);
  // a race on an in-and-out map, drawn, with no errors (the contour shader compiles)
  await p.evaluate(() => { const h = window.__hl; h.loadTrack(2, null, null, null, undefined, { k: 'P', d: null }); h.startRace() }); await wait(6000);
  ok(p.errs.length === 0, 'no page errors ' + JSON.stringify(p.errs));
  await b.close(); done();
})();
