// Prototype 60: pictures of the new road pieces, to look at. For each code, every rising spire, down spiral, drop, speed
// jump and long jump gets a side view of the whole piece from 300 to 600 m off (over the ground, by day), and chase
// views along it (12 m behind, 4 m up, as in a race).  node tools/tests/feat60-look.js OUTDIR CODE[,CODE...] [night]
// KIND=drop only that kind; EVERY=m between chase views (default 60).
const fs = require('fs');
const { launch, open } = require('./lib.js');
const [out, codesArg, TOD = 'day'] = process.argv.slice(2);
const CLOCK = () => { let T = 1000; performance.now = () => T; window.requestAnimationFrame = () => 0; window.cancelAnimationFrame = () => {} };
(async () => {
  fs.mkdirSync(out, { recursive: true });
  const b = await launch();
  const p = await open(b, 'look', { vp: { width: 960, height: 540 }, render: true, init: CLOCK, settle: 300,
    storage: { 'hoverline.orient': 'landscape', 'hoverline.tod': TOD, 'hoverline.tods': TOD } });
  await p.addStyleTag({ content: 'body>*:not(canvas){visibility:hidden!important}' });
  const files = [];
  for (const code of codesArg.split(',')) {
    const info = await p.evaluate((code) => { const h = window.__hl, c = h.parseCode(code); h.loadTrack(c.seed, c.wk, c.cx, c.lk, c.sp || null, c.bm); const T = h.T;
      const F = T.feats.filter((f) => f.rev || f.down || ['drop', 'sjump', 'cjump'].includes(f.kind)).map((f) => ({ k: f.rev ? 'vspire' : f.down ? 'dhelix' : f.kind, u0: f.u0, u1: f.u1, j: T.jumps.filter((j) => j.kind && j.u0 >= f.u0 && j.u0 <= f.u1).map((j) => [j.u0, j.u1]) }));
      return { L: T.L, ds: T.ds, N: T.N, F } }, code);
    console.log(code, JSON.stringify(info.F.map((f) => [f.k, Math.round(f.u0), Math.round(f.u1)])));
    const tag = code.replace(/[^\w-]/g, '_');
    for (const [n, f] of info.F.entries()) {
      if (process.env.KIND && f.k !== process.env.KIND) continue;
      const shots = [['side', (f.u0 + f.u1) / 2, 0]];
      for (const [a, b2] of f.j) { shots.push(['near', (a + b2) / 2, 1]); shots.push(['near', b2 + 40, -1]) }
      const ev = +(process.env.EVERY || 60);
      for (let u = f.u0 - 80; u < f.u1 + 40; u += ev) shots.push(['chase', u, 0]);
      for (const [mode, u, lat] of shots) {
        await p.evaluate(([mode, u, lat, f]) => { const h = window.__hl, T = h.T, cam = h.camera, sc = h.scene, N = T.N, i = ((Math.round(u / T.ds) % N) + N) % N;
          if (mode === 'side') { // the whole piece from the side, a little above
            let cx = 0, cy = 0, cz = 0, n = 0, lo = 1e9, hi = -1e9; const a = Math.floor(f.u0 / T.ds), b2 = Math.ceil(f.u1 / T.ds);
            for (let k = a; k <= b2; k++) { const q = T.P[((k % N) + N) % N]; cx += q.x; cy += q.y; cz += q.z; n++; lo = Math.min(lo, q.y); hi = Math.max(hi, q.y) }
            for (const S of T.splits) if (S.u0 >= f.u0 - 5 && S.u0 <= f.u1 + 5) for (const B of S.b) for (let k = 0; k <= S.n; k += 4) { const j = (S.i0 + k) % N; hi = Math.max(hi, T.P[j].y + B.h[k]) }
            cx /= n; cy /= n; cz /= n; const t = T.Tg[i], rx = -t.z, rz = t.x, rl = Math.hypot(rx, rz) || 1, span = Math.max(220, (f.u1 - f.u0) * 0.55);
            cam.position.set(cx + rx / rl * span, (lo + hi) / 2 + span * 0.28, cz + rz / rl * span); cam.up.set(0, 1, 0); cam.lookAt(cx, (lo + hi) / 2, cz); cam.fov = 60 }
          else if (mode === 'near') { // the gap and the road that catches you, from 110 m to one side and 30 m up
            const P = T.P[i], t = T.Tg[i], rx = -t.z, rz = t.x, rl = Math.hypot(rx, rz) || 1, sd = lat;
            cam.position.set(P.x + sd * rx / rl * 110 - t.x * 40, P.y + 30, P.z + sd * rz / rl * 110 - t.z * 40); cam.up.set(0, 1, 0); cam.lookAt(P.x + t.x * 30, P.y + 4, P.z + t.z * 30); cam.fov = 70 }
          else { const s = h.sampleAt ? null : null, P = T.P[i], R = T.R[i], U = T.U[i], t = T.Tg[i], q = P.clone().addScaledVector(R, lat).addScaledVector(U, 1.1);
            cam.position.copy(q).addScaledVector(t, -12).addScaledVector(U, 4); cam.up.copy(U); cam.lookAt(q.clone().addScaledVector(t, 14).addScaledVector(U, 0.8)); cam.fov = 80 }
          cam.near = 0.5; cam.far = 6000; cam.aspect = 960 / 540; cam.updateProjectionMatrix(); cam.updateMatrixWorld();
          if (T.env && T.env.cave) T.env.cave(cam); if (T.env && T.env.sky) T.env.sky.position.copy(cam.position);
          h.renderer.setSize(960, 540, false); h.renderer.render(sc, cam) }, [mode, u, lat, f]);
        const file = `${out}/${tag}-${f.k}${n}-${mode}-${String(Math.round(u)).padStart(5, '0')}.jpg`;
        await p.screenshot({ path: file, type: 'jpeg', quality: 82 }); files.push(file);
      }
    }
  }
  console.log('wrote', files.length, 'views to', out, 'errors', p.errs.length);
  await b.close();
})();
