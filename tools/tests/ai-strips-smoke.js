// P60: the AI boosts on shield strips for the part where it still gets to full, and flies erratically in smoke.
const { launch, open, ok, done, wait } = require('./lib.js');
(async () => {
  const b = await launch(); const p = await open(b, 'strips-smoke', { vp: { width: 1280, height: 800 }, query: '&bot=1' });
  await p.evaluate(() => { document.getElementById('playBtn').click() }); await wait(300); await p.evaluate(() => { document.getElementById('raceMode').click() }); await wait(300);
  await p.evaluate(() => window.__hl.startRace()); await wait(800);
  const R = await p.evaluate(() => {
    const H = window.__hl, T = H.T, out = {};
    const z = T.zones.filter(q => q.kind === 'hp').sort((a, c) => (c.u1 - c.u0) - (a.u1 - a.u0))[0];
    out.haveStrip = !!z; if (!z) return out;
    const r = H.racers.find(x => x.isAI && x !== H.player); out.haveAI = !!r;
    r.v = 60; r.u = z.u0 + 2; r.lat = 0; const D = r.d.hp, L = z.u1 - r.u; out.len = Math.round(z.u1 - z.u0);
    // nearly full: boosting to the end still fills it
    r.hp = D * 0.97; out.nearFull = H.aiStripBoost(r, r.u);
    // a deficit the strip fills only without the boost: stand where the strip has a boosted refill of 0.4 of the shield left
    const rate = 24 * (r.d.chg || 1) * (z.rate || 1), cost = D * 0.08, L2 = 0.4 * D * r.v * H.AI_STRIP.boostV / (rate - cost);
    r.u = z.u1 - L2; const gB = (rate - cost) * L2 / (r.v * H.AI_STRIP.boostV), gP = rate * L2 / r.v;
    out.gB = gB / D; out.gP = gP / D; const need = (gB / H.AI_STRIP.fullB + gP / H.AI_STRIP.full) / 2;
    r.hp = D - need; out.between = H.aiStripBoost(r, r.u); out.needOk = need <= D;
    // too big a deficit to fill either way: boosts only if it still leaves healthy
    r.hp = Math.max(1, D - gP * 3); r.u = z.u1 - L2; out.farLow = H.aiStripBoost(r, r.u) === (r.hp + gB >= D * H.AI_STRIP.keep);
    // smoke: a person is never flown by this, an AI is; the draw repeats and moves on
    const a = H.racers.find(x => x.isAI && x !== H.player); a.ink = 2;
    out.aiSmoked = H.aiSmoked(a); H.player.ink = 2; out.playerSmoked = H.aiSmoked(H.player); H.player.ink = 0;
    const t0 = H.S.t; H.S.t = 10.1; const h1 = H.smokeH(a, 1, 0.5), h2 = H.smokeH(a, 1, 0.5); H.S.t = 10.7; const h3 = H.smokeH(a, 1, 0.5); H.S.t = t0;
    out.repeat = h1 === h2; out.moves = h1 !== h3; out.inRange = h1 >= 0 && h1 < 1;
    // the steer wanders further in smoke: spread of aiInput's steer over two seconds, with and without
    const spread = (ink) => { const st = []; for (let k = 0; k < 120; k++) { H.S.t = 30 + k / 60; a.ink = ink; a.u = 100; a.lat = 0; a.v = 50; a.yaw = 0; st.push(H.aiInput(a, 1 / 60).steer) }
      const m = st.reduce((x, y) => x + y, 0) / st.length; return Math.sqrt(st.reduce((x, y) => x + (y - m) * (y - m), 0) / st.length) };
    out.spreadClear = spread(0); out.spreadSmoke = spread(2.4); H.S.t = t0;
    a.ink = 2.4; a.lat = 0; a.u = 100; a.v = 60; out.boostInSmoke = H.aiInput(a, 1 / 60).boost; a.ink = 0;
    return out;
  });
  console.log(JSON.stringify(R));
  ok(R.haveStrip && R.haveAI, 'the track has a shield strip and an AI pilot');
  ok(R.nearFull === true, 'nearly full on a strip: boosts');
  ok(R.needOk && R.between === false, 'a deficit only an unboosted pass fills: no boost yet');
  ok(R.farLow === true, 'a strip too short to fill from low: boosts only if it leaves healthy');
  ok(R.aiSmoked === true && R.playerSmoked === false, 'smoke flies AI pilots, never the player');
  ok(R.repeat && R.moves && R.inRange, 'the smoke draw is deterministic from the race clock');
  ok(R.spreadSmoke > R.spreadClear * 2, 'steering swings much more in smoke (' + R.spreadSmoke.toFixed(2) + ' vs ' + R.spreadClear.toFixed(2) + ')');
  ok(R.boostInSmoke === false, 'no boost in smoke');
  ok(p.errs.length === 0, 'no page errors');
  await b.close(); done();
})();
