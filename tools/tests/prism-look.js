// Prism: views along the road of several maps, to find holes in the rock and rock in the road by eye.
// node tools/tests/prism-look.js <outDir> <seed,seed,...> [day|night] [every metres] [ways in: 1 = only views round the cave mouths]
// WK=N CX=1 for Narrow complex tracks.
// Each view is drawn twice: as in the game (a.jpg) and with the sky magenta and no haze (b.jpg), so a hole in the rock shows
// as magenta. Writes index.json with the magenta share under the horizon of each view, for ranking.
const fs = require('fs');
const { launch, open } = require('./lib.js');
const [out, seedsArg = '1,2,3', TOD = 'night', EVERY = '120', MOUTHS = '0'] = process.argv.slice(2);
const CLOCK = () => { let T = 1000; performance.now = () => T; window.requestAnimationFrame = () => 0; window.cancelAnimationFrame = () => {} };
(async () => {
  fs.mkdirSync(out, { recursive: true });
  const b = await launch();
  const p = await open(b, 'prism', { vp: { width: 960, height: 540 }, render: true, init: CLOCK, settle: 300,
    storage: { 'hoverline.orient': 'landscape', 'hoverline.tod': TOD, 'hoverline.tods': TOD } });
  await p.addStyleTag({ content: 'body>*:not(canvas){visibility:hidden!important}' });
  const index = [];
  for (const seed of seedsArg.split(',').map(Number)) {
    const info = await p.evaluate(([s, wk, cx]) => { const h = window.__hl; h.loadTrack(s, wk, cx, null, null, { k: 'P', d: null }); const T = h.T;
      const ins = T.prism ? T.prism.ins : null, at = []; if (ins) for (let i = 0; i < T.N; i++) if (ins[i] !== ins[(i + T.N - 1) % T.N]) at.push(i);
      return { L: T.L, N: T.N, ds: T.ds, mode: T.prism && T.prism.mode, info: T.bmInfo, at } }, [seed, process.env.WK || null, process.env.CX ? true : null]);
    console.log(seed, JSON.stringify(info));
    const step = Math.max(1, Math.round(+EVERY / info.ds)), list = [];
    if (+MOUTHS) { for (const a of info.at) for (const d of [-80, -40, -15, 10, 40]) list.push(((a + Math.round(d / info.ds)) % info.N + info.N) % info.N) }
    else for (let i = 0; i < info.N; i += step) list.push(i);
    for (const i of list) {
      for (const pass of ['a', 'b']) {
        const st = await p.evaluate(([i, pass]) => { const h = window.__hl, T = h.T, cam = h.camera, sc = h.scene, P = T.P, N = T.N, Tg = T.Tg;
          const j = (i - Math.round(14 / T.ds) + N) % N, k = (i + Math.round(40 / T.ds)) % N;
          cam.position.set(P[j].x, P[j].y + 5, P[j].z); cam.lookAt(P[k].x, P[k].y + 2, P[k].z); cam.aspect = 960 / 540; cam.fov = 72; cam.updateProjectionMatrix(); cam.updateMatrixWorld();
          if (T.env && T.env.cave) T.env.cave(cam); if (T.env && T.env.sky) T.env.sky.position.copy(cam.position);  // as the game does each frame
          const sky = []; sc.traverse((o) => { if (o.material && o.material.side === 1 && o.geometry && o.geometry.parameters && o.geometry.parameters.radius >= 2000) sky.push(o) });
          const bg = sc.background, fog = sc.fog && { n: sc.fog.near, f: sc.fog.far };
          if (pass === 'b') { sc.background = new (sc.fog.color.constructor)(0xff00ff); sky.forEach((o) => o.visible = false); if (sc.fog) { sc.fog.near = 1e6; sc.fog.far = 2e6 } }
          h.renderer.setSize(960, 540, false); h.renderer.render(sc, cam);
          let mag = 0;
          if (pass === 'b') { const gl = h.renderer.getContext(), px = new Uint8Array(960 * 270 * 4); gl.readPixels(0, 0, 960, 270, gl.RGBA, gl.UNSIGNED_BYTE, px);
            for (let q = 0; q < px.length; q += 4) if (px[q] > 200 && px[q + 1] < 60 && px[q + 2] > 200) mag++; mag /= 960 * 270 }
          window.__restore = () => { sc.background = bg; sky.forEach((o) => o.visible = true); if (fog) { sc.fog.near = fog.n; sc.fog.far = fog.f } };
          return { mag, ins: T.prism ? T.prism.ins[i] : 0 } }, [i, pass]);
        await p.screenshot({ path: `${out}/s${seed}-${String(i).padStart(5, '0')}-${pass}.jpg`, type: 'jpeg', quality: 85 });
        await p.evaluate(() => window.__restore());
        if (pass === 'b') index.push({ seed, i, u: Math.round(i * info.ds), ins: st.ins, mag: +st.mag.toFixed(4) });
      }
    }
  }
  fs.writeFileSync(out + '/index.json', JSON.stringify(index));
  console.log('views', index.length, 'errors', p.errs.length);
  await b.close();
})();
