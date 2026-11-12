// Prototype 62: bot races on Spirit tracks (each on a fresh page). For a Wide, a Standard and a Narrow code (and one with the new jumps):
//   - the race runs to the end (every racer finishes), with the realm's frame (heads, colossi, riders, echoes, arches,
//     the music's uniforms) run after every step, as the game's loop does;
//   - the realm is cosmetic: the same race number with the realm's frame and without it gives the same order and the same
//     times to the last digit (it draws nothing from the race's random streams and moves nothing the race reads);
//   - what is posed each frame keeps the rule: every head pacing the pack and every ghost rider is clear of the road's
//     keep-out and of the chase cameras' sight lines (the game's own volumes, 004o) whenever it is shown;
//   - echoes show on their stretches; arches assemble ahead of the leader.        node tools/tests/spirit-race.js
const { launch, open, ok, done } = require('./lib.js');
const CODES = (process.env.CODES || 'WQ1234567-S,SQ1ABCDEF-S,NQ1C0FFEE-S,NXQ1C0D0E5-100000000000001-S').split(',');
const RUN = async (p, code, n, live) => p.evaluate(async ([code, n, live]) => {
  const H = window.__hl, T0 = Date.now(); H.RACE.force = n; const c = H.parseCode(code); H.loadTrack(c.seed, c.wk, c.cx, c.lk, c.sp || null, c.bm);
  await H.startRace(); H.S.goAt = null; const T = H.T, sp = T.env.spirit, OP = H.SPU.uOP.value;
  const seen = { heads: 0, headBad: 0, riders: 0, riderBad: 0, echoes: 0, arch: 0, frames: 0, frameTypes: 0, segs: 0 }, bad = [];
  let t = 0; while (t < 500) { H.step(1 / 60); t += 1 / 60;
    if (live && sp) { T.env.update(H.S.t, true); seen.frames++;
      for (let s = 0; s < sp.heads.length; s++) if (OP[s].w > 0) { seen.heads++; const hd = sp.heads[s]; if (!sp.clr.ok(OP[s].x, OP[s].y, OP[s].z, hd.s * 0.55)) { seen.headBad++; if (bad.length < 5) bad.push(['head', s, OP[s].x | 0, OP[s].y | 0, OP[s].z | 0]) } }
      for (const G of sp.ghosts ? sp.ghosts.values() : []) for (let m = 0; m < G.OP.length; m++) { const o = G.OP[m]; if (o.w <= 0) continue;
        if (m >= 9) { seen.riders++; if (!sp.clr.ok(o.x, o.y, o.z, 2.6)) { seen.riderBad++; if (bad.length < 5) bad.push(['rider', m, o.x | 0, o.y | 0, o.z | 0]) } } else { seen.echoes++; seen.echoMax = Math.max(seen.echoMax || 0, o.w) } }
      const G = H.SPU.uG.value; for (const a of sp.arches) { const v = G[a.g >> 2].getComponent(a.g & 3); if (v > 0.99) seen.arch++ } }
    if (H.racers.every((r) => r.finishT != null)) break }
  if (sp && sp.ghosts) { seen.frameTypes = sp.ghosts.size; seen.segs = Math.max(0, ...[...sp.ghosts.values()].map((G) => G.segs)) }
  const rk = [...H.racers].sort((a, b) => (a.finishT ?? 1e9) - (b.finishT ?? 1e9) || b.utot - a.utot);
  return { order: rk.map((r) => r.name), times: rk.map((r) => r.finishT), wrecks: rk.map((r) => r.stat.wrecks), seen, bad, steps: Math.round(t * 60), ms: Date.now() - T0, info: T.bmInfo, echoN: sp ? sp.echoes.length : 0, nArch: sp ? sp.arches.length : 0 };
}, [code, n, live]);
(async () => {
  const b = await launch();
  /* each race on a fresh page: races later on one page can drift with the wall clock (a fifth race after slow steps
     differs on any track, with no realm code at all: a busy wait in place of the realm's frame does it too) */
  const page = (k) => open(b, 'spirit-race-' + k, { vp: { width: 640, height: 360 }, query: '&bot=1', storage: { 'hoverline.laps': '2' }, init: () => { window.requestAnimationFrame = () => 0 } });
  const pages = [];
  for (const code of CODES) {
    const pA = await page(code + 'A'), pB = await page(code + 'B'); pages.push(pA, pB);
    const A = await RUN(pA, code, 620001, true), B = await RUN(pB, code, 620001, false); await pA.ctx.close(); await pB.ctx.close();
    console.log(code, '|', A.info, '|', A.steps, 'steps', A.ms, 'ms', JSON.stringify(A.seen), A.bad.length ? JSON.stringify(A.bad) : '');
    ok(A.times.length >= 6 && A.times.every((x) => x != null), code + ': the bot race ran to the end (' + A.times.length + ' racers, all finished)');
    ok(JSON.stringify([A.order, A.times, A.wrecks]) === JSON.stringify([B.order, B.times, B.wrecks]), code + ': the same race with and without the realm\'s frame: same order, times and wrecks');
    ok(A.seen.headBad === 0 && A.seen.riderBad === 0, code + ': heads (' + A.seen.heads + ' frames shown) and ghost riders (' + A.seen.riders + ') always clear of the road and the sight lines');
    ok(A.seen.heads > 0 && (A.seen.arch > 0 || !A.nArch), code + ': the heads pace the pack and the arches assemble (' + A.nArch + ' arches)');
    ok(!A.echoN || A.seen.echoes > 0, code + ': echoes show on their ' + A.echoN + ' stretches (' + A.seen.echoes + ' after-image frames)');
  }
  ok(pages.every((p) => p.errs.length === 0), 'no page errors');
  await b.close(); done();
})();
