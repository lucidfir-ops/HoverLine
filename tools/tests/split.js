// Prototype 60: split screen. Simulated gamepads (navigator.getGamepads stubbed) join in the split-screen lobby, a 2- and a
// 4-pilot local race run with one view per pilot, each pad steers its own ship, the small-pad mapping works, the results
// list every local pilot, nothing goes to the board, and a single-player race afterwards is as before. Renders 4- and
// 8-pilot screenshots into $OUT (default: the system's temp folder).      node tools/tests/split.js
const path = require('path');
const { wait, until, launch, open, ok, done } = require('./lib.js');
const OUT = process.env.OUT || require('os').tmpdir();
// pads: window.__pads[i] = {id, mapping, axes, buttons:[bool...]}; the stub returns live Gamepad-like objects
const PADS = () => {
  window.__pads = [];
  const mk = (q, i) => q && { id: q.id, index: i, connected: true, mapping: q.mapping, timestamp: performance.now(), axes: q.axes.slice(),
    buttons: q.buttons.map((b) => ({ pressed: !!b, value: b ? 1 : 0, touched: !!b })) };
  navigator.getGamepads = () => { const a = []; for (let i = 0; i < 4; i++) a.push(null); window.__pads.forEach((q, i) => { a[i] = mk(q, i) }); return a };
  window.__pad = (i, o) => { const q = window.__pads[i] || (window.__pads[i] = { id: o.id || 'Xbox Wireless Controller (STANDARD GAMEPAD Vendor: 045e Product: 0b13)', mapping: o.mapping ?? 'standard', axes: [0, 0, 0, 0], buttons: Array(o.nb || 17).fill(false) });
    if (o.axes) q.axes = o.axes; if (o.press != null) q.buttons[o.press] = true; if (o.release != null) q.buttons[o.release] = false };
};
const press = async (p, i, b) => { await p.evaluate(([i, b]) => window.__pad(i, { press: b }), [i, b]); await wait(160); await p.evaluate(([i, b]) => window.__pad(i, { release: b }), [i, b]); await wait(160) };
// count the views drawn in a frame: renderer.render calls between two animation frames, and the cameras they used
const views = (p) => p.evaluate(() => new Promise((res) => { const R = window.__hl.renderer, r0 = R.render, C = window.__hl.camera; let n = 0, main = 0; const cams = new Set();
  requestAnimationFrame(() => { R.render = function (s, c) { if (s === window.__hl.scene) { n++; cams.add(c); if (c === C) main++ } return r0.apply(this, arguments) }; requestAnimationFrame(() => { R.render = r0; res({ n, cams: cams.size, main }) }) }) }));
async function lobbyJoin(p, pads) {
  await p.click('#playBtn'); await wait(150); await p.click('#mpBtn'); await wait(200); await p.click('#splBtn'); await wait(300);
  for (const [i, o] of pads) { await p.evaluate(([i, o]) => window.__pad(i, o), [i, o]); await press(p, i, 0) }
}
async function race(p, label) {
  await p.click('[data-spllaps="1"]'); await press(p, 0, 9);
  await until(p, () => window.__hl.S.state === 'race', 60000, label + ' race'); await wait(1500);
}
(async () => {
  const b = await launch();
  const p = await open(b, 'split', { vp: { width: 1280, height: 720 }, render: true, init: PADS });
  // --- two pilots ---
  await lobbyJoin(p, [[0, {}], [1, {}]]);
  let L = await p.evaluate(() => ({ n: window.__hl.SPL.pilots.length, cards: document.querySelectorAll('#splList .splp').length, open: !document.getElementById('spl').hidden, src: window.__hl.SPL.pilots.map((P) => P.src + P.pad) }));
  ok(L.open && L.n === 2 && L.cards === 2, 'lobby: two pads joined with a button each ' + JSON.stringify(L));
  await press(p, 1, 0); L = await p.evaluate(() => window.__hl.SPL.pilots.length); ok(L === 2, '  a joined pad pressing again doesn\'t join twice');
  await race(p, '2p');
  let st = await p.evaluate(() => { const h = window.__hl; return { ln: h.SPL.ln, lp: h.racers.filter((r) => r.lp).map((r) => [r.lp.n, r.name, r.isAI]), n: h.racers.length, laps: h.LAPS, vw: document.querySelectorAll('#views .vw').length, hud: document.getElementById('hudL').hidden, lay: h.SPL.cur && h.SPL.cur.name, mode: h.LOG.cur && h.LOG.cur.mode } });
  ok(st.ln === 2 && st.vw === 2 && st.lp.length === 2 && st.lp.every((x) => x[2] === false) && st.n === 8, '2 pilots: two views and two HUDs, both ships human, AI fills to 8 ' + JSON.stringify(st));
  ok(st.lay === 'Grid 1 × 2' || /stacked/.test(st.lay), '  16:9 with 2 pilots: one above the other (' + st.lay + ')');
  ok(st.mode === 'split' && st.laps === 1, '  the log says split, 1 lap ' + JSON.stringify([st.mode, st.laps]));
  let v = await views(p); ok(v.n === 2 && v.cams === 2, '  each frame draws two views with two cameras ' + JSON.stringify(v));
  // each pad steers its own ship
  await p.evaluate(() => { window.__pad(0, { axes: [-1, 0, 0, 0] }); window.__pad(1, { axes: [1, 0, 0, 0] }) }); await wait(900);
  st = await p.evaluate(() => window.__hl.SPL.pilots.map((P) => ({ s: +P.r.steerS.toFixed(2), in: +P.inp.steer.toFixed(2) })));
  ok(st[0].s < -0.3 && st[1].s > 0.3 && st[0].in === -1 && st[1].in === 1, '  pad 1 steers P1 left, pad 2 steers P2 right ' + JSON.stringify(st));
  await p.evaluate(() => { window.__pad(0, { axes: [1, 0, 0, 0] }); window.__pad(1, { axes: [-1, 0, 0, 0] }) }); await wait(900);
  st = await p.evaluate(() => window.__hl.SPL.pilots.map((P) => +P.r.steerS.toFixed(2)));
  ok(st[0] > 0.3 && st[1] < -0.3, '  and the other way round ' + JSON.stringify(st));
  await p.evaluate(() => { window.__pad(0, { axes: [0, 0, 0, 0] }); window.__pad(1, { axes: [0, 0, 0, 0] }) });
  // the finish: both cross the line; the results list both, nothing goes to the board or the best laps
  await p.evaluate(() => { const h = window.__hl; for (const P of h.SPL.pilots) { const r = P.r; r.done = h.LAPS - 1; r.utot = h.LAPS * h.T.L + 2; r.u = r.utot % h.T.L } });
  await until(p, () => !document.getElementById('results').hidden, 15000, 'results');
  st = await p.evaluate(() => ({ me: document.querySelectorAll('#resTable tr.me').length, pos: document.getElementById('resPos').textContent, rec: document.getElementById('resRecord').textContent, board: document.getElementById('resBoard').hidden, menu: document.getElementById('menuBtn').textContent, best: Object.keys(localStorage).filter((k) => k.startsWith('hoverline.best.')).length }));
  ok(st.me === 2 && /^P[12] wins/.test(st.pos) && st.board && st.best === 0 && st.menu === 'Split screen', 'results: both local pilots marked, a winner, no board, no best lap ' + JSON.stringify(st));
  await p.click('#menuBtn'); await wait(400);
  st = await p.evaluate(() => { const h = window.__hl; return { open: !document.getElementById('spl').hidden, race: h.SPL.race, lp: h.roster.filter((r) => r.lp).length, ai: h.roster.slice(1).every((r) => r.isAI), names: h.roster.slice(1).map((r) => r.name).join(','), views: document.getElementById('views').hidden } });
  ok(st.open && !st.race && st.lp === 0 && st.ai && !/P\d/.test(st.names) && st.views, '  back in the split-screen lobby, the AI places are AI again ' + JSON.stringify(st));
  // --- four pilots, one on a small pad ---
  await p.evaluate(() => window.__pad(2, { id: '8BitDo Micro gamepad (Vendor: 2dc8 Product: 9020)', mapping: '', nb: 12 })); await press(p, 2, 0);
  await p.evaluate(() => window.__pad(3, {})); await press(p, 3, 0);
  st = await p.evaluate(() => window.__hl.SPL.pilots.map((P) => [P.pad, P.small]));
  ok(st.length === 4 && st[2][1] === true && st[0][1] === false, '4 pads: the 8BitDo gets the small-pad buttons, the Xbox pads the full ones ' + JSON.stringify(st));
  const sk = await p.evaluate(() => document.querySelectorAll('#splSketch i').length); ok(sk === 4, '  the layout sketch shows 4 views (' + sk + ')');
  await race(p, '4p');
  st = await p.evaluate(() => ({ ln: window.__hl.SPL.ln, lay: window.__hl.SPL.cur.name, rects: window.__hl.SPL.cur.rects.map((r) => [r.x, r.y, r.w, r.h]) }));
  ok(st.ln === 4 && st.lay === 'Grid 2 × 2', '4 pilots: a 2 × 2 grid ' + JSON.stringify(st));
  v = await views(p); ok(v.n === 4 && v.cams === 4, '  each frame draws four views ' + JSON.stringify(v));
  // small pad: A boosts, the d-pad (as a hat on axis 9) steers, B fires whichever module is ready
  await p.evaluate(() => { const h = window.__hl, P = h.SPL.pilots[2]; P.r.ammo = 999; window.__pad(2, { axes: [0, 0, 0, 0, 0, 0, 0, 0, 0, -1 + 6 * 2 / 7], press: 0 }) }); await wait(500);
  st = await p.evaluate(() => { const P = window.__hl.SPL.pilots[2]; return { boost: P.inp.boost, steer: P.inp.steer, s: +P.r.steerS.toFixed(2), b0: window.__hl.SPL.pilots[0].inp.boost } });
  ok(st.boost && st.steer === -1 && st.s < -0.3 && !st.b0, '  small pad: A boosts and the hat d-pad steers left, on P3 only ' + JSON.stringify(st));
  await p.evaluate(() => window.__pad(2, { release: 0, axes: [0, 0, 0, 0, 0, 0, 0, 0, 0, 1.28] }));
  const a0 = await p.evaluate(() => window.__hl.SPL.pilots[2].r.ammo); await press(p, 2, 1); await wait(300);
  const a1 = await p.evaluate(() => window.__hl.SPL.pilots[2].r.ammo); ok(a1 < a0, `  small pad: B fires a module (ammo ${a0} to ${a1})`);
  await p.screenshot({ path: path.join(OUT, 'split-4p.png') });
  // --- eight pilots: the screenshot ---
  await p.evaluate(() => { window.__hl.togglePause('test') }); await wait(200); await p.click('#quitBtn'); await wait(400);
  await p.evaluate(() => { const h = window.__hl; while (h.SPL.pilots.length < 8) h.SPL.pilots.push({ src: 'pad', pad: 3, small: false, cm: 1 }) });
  await race(p, '8p');
  st = await p.evaluate(() => ({ ln: window.__hl.SPL.ln, lay: window.__hl.SPL.cur.name, n: window.__hl.racers.length, ai: window.__hl.racers.filter((r) => r.isAI).length }));
  ok(st.ln === 8 && st.ai === 0 && st.n === 8, '8 pilots: 8 views, no AI left in the field ' + JSON.stringify(st));
  v = await views(p); ok(v.n === 8, '  each frame draws eight views ' + JSON.stringify(v));
  await wait(1500); await p.screenshot({ path: path.join(OUT, 'split-8p.png') });
  // a portrait phone with 4: strips
  const lay = await p.evaluate(() => [window.__hl.splLayoutFor(4, 390, 844).pick.name, window.__hl.splLayoutFor(2, 2560, 1080).pick.name, window.__hl.splLayoutFor(3, 1280, 800).pick.name, window.__hl.splLayoutFor(8, 1280, 800).pick.name, window.__hl.splLayoutFor(5, 1280, 720).pick.name]);
  ok(lay[0] === '4 stacked' && lay[1] === '2 side by side' && /standings/.test(lay[2]) && lay[3] === 'Rows 2 + 3 + 3' && lay[4] === 'Columns 2 + 3', 'layouts: portrait 4 = strips, 21:9 2 = side by side, 3 = 2 × 2 with standings, 8 = 3 rows, 5 = columns of 2 and 3 ' + JSON.stringify(lay));
  // --- back to one player: a normal race ---
  await p.evaluate(() => { window.__hl.togglePause('test') }); await wait(200); await p.click('#quitBtn'); await wait(400); await p.click('#splBack'); await wait(300);
  await p.evaluate(() => window.__hl.startRace()); await until(p, () => window.__hl.S.state === 'race', 60000, 'single race'); await wait(1000);
  st = await p.evaluate(() => { const h = window.__hl; return { split: h.SPL.race, lp: h.racers.filter((r) => r.lp).length, human: h.racers.filter((r) => !r.isAI).length, hud: !document.getElementById('hudL').hidden, views: document.getElementById('views').hidden, mode: h.LOG.cur && h.LOG.cur.mode } });
  ok(!st.split && st.lp === 0 && st.human === 1 && st.hud && st.views && st.mode === 'race', 'a single-player race afterwards: one human, the normal HUD ' + JSON.stringify(st));
  v = await views(p); ok(v.n === 1 && v.main === 1, '  and one view, the usual camera ' + JSON.stringify(v));
  ok(p.errs.length === 0, 'no page errors ' + JSON.stringify(p.errs.slice(0, 3)));
  await b.close(); done();
})().catch((e) => { console.log('FAIL', e.message); process.exit(1) });
