// P61: a race replays from its two numbers (the track's seed and the race's number, RACE.n; the race log carries it as `rn`).
// The same bot race is run by hand on a fixed time step (the page's own frame loop is stopped, so the clock is the test's):
//   A and B on one page with the same track and number: the same finishing order and the same times, to the last digit;
//   D on a fresh page: the same again; C with another number: a different race. ?racen= makes the next race's number.
const { launch, open, ok, done } = require('./lib.js');
const CODE = 'WQ12345A', LAPS2 = { 'hoverline.laps': '2' };
const stopLoop = () => { window.requestAnimationFrame = () => 0 };
// one race: set the number, start, run the countdown and the race at 1/60 s, give back who finished when
async function race(p, n, code = CODE, view = false) {
  return p.evaluate(async ([n, code, view]) => {
    const H = window.__hl, T0 = Date.now(); H.RACE.force = n;
    const c = H.parseCode(code); H.loadTrack(c.seed, c.wk, c.cx, c.lk, c.sp, c.bm);
    await H.startRace(); H.S.goAt = null;
    const rn = H.LOG.cur ? H.LOG.cur.rn : null, rnNow = H.RACE.n;
    let t = 0; while (t < 400) { H.step(1 / 60); if (view) H.portalView(H.camera); t += 1 / 60; if (H.racers.every((r) => r.finishT != null)) break }
    const rk = [...H.racers].sort((a, b) => (a.finishT ?? 1e9) - (b.finishT ?? 1e9) || b.utot - a.utot);
    return { rn, rnNow, steps: Math.round(t * 60), order: rk.map((r) => r.name), times: rk.map((r) => r.finishT), wrecks: rk.map((r) => r.stat.wrecks), ms: Date.now() - T0 };
  }, [n, code, view]);
}
const same = (a, b) => JSON.stringify([a.order, a.times, a.wrecks]) === JSON.stringify([b.order, b.times, b.wrecks]);
(async () => {
  const b = await launch();
  const o = { vp: { width: 640, height: 360 }, query: '&bot=1', storage: LAPS2, init: stopLoop };
  // Prototype 63: a Spirit track with an underside (the route that rolls under the road, track/004t) replays, on two fresh pages (the rivals
  // Vanta and Pell take their pace from the races a page has logged, so pages with different histories field other rivals)
  const p3 = await open(b, 'replay3', o), p4 = await open(b, 'replay4', o);
  const UC = 'W1B85AB4-S', G = await race(p3, 777004, UC), Hh = await race(p4, 777004, UC); await p3.ctx.close(); await p4.ctx.close();
  console.log('G', JSON.stringify({ ...G, times: G.times.map((x) => x && +x.toFixed(2)) }));
  ok(G.times.every((x) => x != null) && same(G, Hh), 'an underside track (' + UC + '): the same race on another page');
  ok(p3.errs.length === 0 && p4.errs.length === 0, 'no page errors on the underside pages');
  const p = await open(b, 'replay', o);
  const A = await race(p, 777001), B = await race(p, 777001), C = await race(p, 777002);
  console.log('A', JSON.stringify({ ...A, times: A.times.map((x) => x && +x.toFixed(2)) }));console.log('B', JSON.stringify({ ...B, times: B.times.map((x) => x && +x.toFixed(2)) }));
  console.log('C', JSON.stringify({ ...C, times: C.times.map((x) => x && +x.toFixed(2)) }));
  ok(A.times.every((x) => x != null) && A.order.length >= 6, 'the race ran to the end: ' + A.order.length + ' racers, all finished');
  ok(A.rn === 777001 && A.rnNow === 777001 && C.rn === 777002, 'the race number is the one asked for, and goes in the race log as rn (' + A.rn + ', ' + C.rn + ')');
  ok(same(A, B), 'same track, same race number: the same order, times and wrecks, again on the same page');
  ok(!same(A, C), 'another race number on the same track: a different race');
  ok(JSON.stringify(A.times) !== JSON.stringify(C.times) && A.times.some((x, i) => x !== C.times[i]), 'the times differ with another number');
  const p2 = await open(b, 'replay2', o); const D = await race(p2, 777001);
  ok(same(A, D), 'a fresh page, same numbers: the same race');
  // Prototype 63: a Spirit track with a portal jump replays too, and the view through the portal (drawn after every step
  // here) changes nothing about the race
  const PC = 'W1234567-' + '1' + '0'.repeat(15) + '1-S', E = await race(p, 777003, PC), F = await race(p2, 777003, PC, true);
  console.log('E', JSON.stringify({ ...E, times: E.times.map((x) => x && +x.toFixed(2)) }));
  ok(E.times.every((x) => x != null) && same(E, F), 'a portal track (' + PC + '): the same race on another page, with the view through the portal drawn every step');
  // without forcing, each race gets a number of its own (two races on one track differ, as before)
  const R = await p.evaluate(async () => { const H = window.__hl, ns = []; for (let k = 0; k < 3; k++) { await H.startRace(); ns.push(H.RACE.n); H.S.goAt = null } return ns });
  ok(new Set(R).size === 3 && R.every((x) => x > 0), 'a race started without a forced number draws a new one each time (' + R.join(', ') + ')');
  // the stream: one for each racer, derived from the two numbers, so one racer's draws don't move another's
  const S = await p.evaluate(async () => { const H = window.__hl; H.RACE.force = 5; await H.startRace();
    const rs = H.racers.filter((r) => r.R), first = rs.map((r) => H.rand(r));
    H.RACE.force = 5; await H.startRace(); const again = rs.map((r) => H.rand(r));
    for (let k = 0; k < 50; k++) H.rand(rs[0]); H.RACE.force = 5; await H.startRace(); const skew = rs.map((r) => H.rand(r));
    return { first, again, skew, n: rs.length } });
  ok(S.n >= 6 && JSON.stringify(S.first) === JSON.stringify(S.again) && JSON.stringify(S.first) === JSON.stringify(S.skew), 'each racer\'s stream restarts from the two numbers');
  ok(new Set(S.first).size === S.first.length, 'and the racers\' streams differ from each other');
  ok(p.errs.length === 0 && p2.errs.length === 0, 'no page errors');
  await b.close(); done();
})();
