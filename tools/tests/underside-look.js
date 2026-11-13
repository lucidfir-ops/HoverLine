// Prototype 63: still views of the Spirit realm's underside (track/004t) from outside the race: from beside the road at
// the fork, the roll, the tuck and the hold, from under it, and from above, with racers set on both faces; for looking at.
//   node tools/tests/underside-look.js <outDir> [code ...]        (Calm visuals: CALM=1)
const fs = require('fs'), path = require('path');
const { launch, open } = require('./lib.js');
const [out, ...codes] = process.argv.slice(2);
const CODES = codes.length ? codes : ['W1B85AB4-S'];
(async () => {
  fs.mkdirSync(out, { recursive: true });
  const b = await launch();
  const p = await open(b, 'look', { vp: { width: 800, height: 450 }, render: true, init: () => { window.requestAnimationFrame = () => 0 }, settle: 300, query: '&bot=1',
    storage: { 'hoverline.orient': 'landscape', 'hoverline.laps': '1', ...(process.env.CALM ? { 'hoverline.calm': '1' } : {}) } });
  await p.addStyleTag({ content: 'body>*:not(canvas){visibility:hidden!important}' });
  for (const code of CODES) {
    const views = await p.evaluate(async (code) => { const H = window.__hl; H.RACE.force = 630021; const c = H.parseCode(code); H.loadTrack(c.seed, c.wk, c.cx, c.lk, c.sp || null, c.bm);
      await H.startRace(); H.S.goAt = null; for (let k = 0; k < 30; k++) H.step(1 / 60);
      const T = H.T, SP = T.splits.find((x) => x.kind === 'flip'); if (!SP) return null; const s = SP.side, n = SP.n, ds = T.ds;
      const marks = { fork: SP.nA * 0.6, roll: SP.kA + SP.nB * 0.5, tuck: SP.kB + SP.nC * 0.6, hold: SP.kC + SP.nD * 0.3 };
      return Object.entries(marks).map(([k, v]) => [k, Math.round(SP.u0 + v * ds)]).concat([['s', s], ['W', H.W]]) }, code);
    if (!views) { console.log(code, 'no underside'); continue }
    const V = Object.fromEntries(views);
    console.log(code, JSON.stringify(V));
    const shots = [];
    for (const [name, u] of Object.entries(V)) { if (name === 's' || name === 'W') continue;
      for (const [vw, f] of [['side', [0, 1, 0]], ['under', [0, -1, 1]], ['behind', [-1, 0.3, 0]], ['above', [0, 1, 1]]]) shots.push([name, u, vw, f]) }
    for (const [name, u, vw, f] of shots) {
      await p.evaluate(([u, vw, f, s, W]) => { const H = window.__hl, T = H.T, SP = T.splits.find((x) => x.kind === 'flip'), cam = H.camera;
        /* racers on both faces, near u */
        H.racers.forEach((r, i) => { const d = (i - 3) * 9; r.u = u + d; r.utot = r.u; r.v = 0; r.wreck = 0; r.inv = 0; const bb = i % 2 ? SP.fB : SP.tB; r.brS = SP; r.br = bb; r.flipU = bb === SP.fB;
          const k = Math.round((r.u - SP.u0) / T.ds), B = SP.b[bb]; r.lat = B.c[Math.max(0, Math.min(SP.n, k))] + (i % 3 - 1) * 2; r.yaw = 0; r.isGhost0 = r.isGhost; H.placeShip(r, 0) });
        const sp = H.sampleAt(u), P = sp.p.clone(), R = sp.r.clone(), Uu = sp.u.clone(), Tt = sp.t.clone(), side = R.clone().multiplyScalar(s);
        if (vw === 'side') { cam.position.copy(P).addScaledVector(side, 55).addScaledVector(Uu, 6).addScaledVector(Tt, -35); cam.up.copy(Uu); cam.lookAt(P.clone().addScaledVector(side, 10).addScaledVector(Tt, 10)) }
        else if (vw === 'under') { cam.position.copy(P).addScaledVector(Uu, -14).addScaledVector(Tt, -40).addScaledVector(side, 6); cam.up.copy(Uu).negate(); cam.lookAt(P.clone().addScaledVector(Uu, -3).addScaledVector(Tt, 25)) }
        else if (vw === 'behind') { cam.position.copy(P).addScaledVector(Tt, -45).addScaledVector(Uu, 4).addScaledVector(side, 12); cam.up.copy(Uu); cam.lookAt(P.clone().addScaledVector(Tt, 30).addScaledVector(side, 8)) }
        else { cam.position.copy(P).addScaledVector(Uu, 45).addScaledVector(Tt, -30).addScaledVector(side, 20); cam.up.copy(Uu); cam.lookAt(P.clone().addScaledVector(Tt, 15)) }
        H.fit(); cam.fov = 60; cam.updateProjectionMatrix(); cam.updateMatrixWorld(); H.VFX.update(1 / 60); H.gfxRender(H.scene, cam) }, [u, vw, f, V.s, V.W]);
      await p.screenshot({ path: path.join(out, code + '-' + name + '-' + vw + '.jpg'), type: 'jpeg', quality: 85 });
    }
  }
  if (p.errs.length) console.log('errors', p.errs);
  await b.close();
})();
