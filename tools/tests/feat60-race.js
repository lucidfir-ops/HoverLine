// Prototype 60: the new road pieces in a race, as the game draws them (chase camera, HUD hidden): a bot race on each code,
// screenshots while the player's frame flies a new jump (at the lip, over the gap, landing) or climbs a rising spire.
//   node tools/tests/feat60-race.js OUTDIR CODE[,CODE...]
const fs = require('fs');
const { launch, open, wait } = require('./lib.js');
const [out, codesArg] = process.argv.slice(2);
if (!out || !codesArg) { console.log('a render tool, not a test: give an output folder and track codes (see the first lines)'); process.exit(0) }
(async () => {
  fs.mkdirSync(out, { recursive: true });
  const b = await launch();
  const p = await open(b, 'race60', { vp: { width: 960, height: 540 }, render: true, query: '&bot=1', storage: { 'hoverline.laps': '1', 'hoverline.tod': 'day', 'hoverline.tods': 'day' } });
  await p.addStyleTag({ content: '#hudL,#hudR,#pauseBtn,#touch,#note,.overlay{visibility:hidden!important}' });
  for (const code of codesArg.split(',')) {
    await p.evaluate(async (code) => { const h = window.__hl, c = h.parseCode(code); h.loadTrack(c.seed, c.wk, c.cx, c.lk, c.sp, c.bm); await h.startRace() }, code);
    const tag = code.replace(/[^\w-]/g, '_'); let n = 0, last = -1e9; const t0 = Date.now();
    while (Date.now() - t0 < 150000 && n < 14) {
      const s = await p.evaluate(() => { const h = window.__hl, r = h.player, T = h.T; if (h.S.state !== 'race') return { st: h.S.state };
        const J = r.air && r.air.kind ? r.air : null, x = J ? h.modU(r.u - J.u0) : null, sp = T.feats.find((f) => f.rev && r.u > f.u0 && r.u < f.u1);
        return { st: 'race', u: Math.round(h.modU(r.u)), k: J ? J.kind : sp ? 'vspire' : null, x: x == null ? null : Math.round(x), G: J ? Math.round(J.G) : null, v: Math.round(r.v), h: +r.h.toFixed(1), up: h.onUpper(r) } });
      if (s.st === 'done') break;
      if (s.k && s.u - last > (s.k === 'vspire' ? 120 : 35)) { last = s.u; const f = `${out}/${tag}-${String(n++).padStart(2, '0')}-${s.k}-x${s.x}-v${s.v}${s.up ? '-up' : ''}.jpg`; await p.screenshot({ path: f, type: 'jpeg', quality: 80 }); console.log(f, JSON.stringify(s)) }
      else if (!s.k) last = -1e9;
      await wait(60);
    }
  }
  console.log('errors', p.errs.length); await b.close();
})();
