// Prism: views along the road of several maps, to find holes in the rock and rock in the road by eye.
// node tools/tests/prism-look.js <outDir> <seed,seed,...> [day|night] [every metres] [ways in: 1 = only views round the cave mouths]
// WK=N CX=1 for Narrow complex tracks.
// Each view is drawn twice: as in the game (a.jpg) and with the sky magenta and no haze (b.jpg), so a hole in the rock shows
// as magenta. Writes index.json with the magenta share under the horizon of each view, for ranking (and over it, top,
// with cin = 1 when the camera is inside the mountain, where any sky seen is through a hole or a way out).
// Prototype 60: a seed may also be a whole track code (WQCC8D66-P, NXL1FDB51-23224444222-P3443), built as the game builds
// it. AT="u:lat,u:lat,..." (metres along the lap and across the road, from a race log) draws those places instead, from
// the Far chase camera (11 m behind, 3.9 m up), as on Eric's screenshots.
const fs = require('fs');
const { launch, open } = require('./lib.js');
const [out, seedsArg = '1,2,3', TOD = 'night', EVERY = '120', MOUTHS = '0'] = process.argv.slice(2);
const AT = process.env.AT ? process.env.AT.split(',').map((s) => s.split(':').map(Number)) : null;
const CLOCK = () => { let T = 1000; performance.now = () => T; window.requestAnimationFrame = () => 0; window.cancelAnimationFrame = () => {} };
(async () => {
  fs.mkdirSync(out, { recursive: true });
  const b = await launch();
  const p = await open(b, 'prism', { vp: { width: 960, height: 540 }, render: true, init: CLOCK, settle: 300,
    storage: { 'hoverline.orient': 'landscape', 'hoverline.tod': TOD, 'hoverline.tods': TOD } });
  await p.addStyleTag({ content: 'body>*:not(canvas){visibility:hidden!important}' });
  const index = [];
  for (const seedS of seedsArg.split(',')) {
    const seed = /^\d+$/.test(seedS) ? +seedS : seedS, tag = String(seed).replace(/[^\w-]/g, '_');
    const info = await p.evaluate(([s, wk, cx]) => { const h = window.__hl; const c = typeof s === 'string' ? h.parseCode(s) : null;
      if (c) h.loadTrack(c.seed, c.wk, c.cx, c.lk, c.sp || null, c.bm && c.bm.k === 'P' ? c.bm : { k: 'P', d: null }); else h.loadTrack(s, wk, cx, null, null, { k: 'P', d: null }); const T = h.T;
      const ins = T.prism ? T.prism.ins : null, at = []; if (ins) for (let i = 0; i < T.N; i++) if (ins[i] !== ins[(i + T.N - 1) % T.N]) at.push(i);
      return { L: T.L, N: T.N, ds: T.ds, mode: T.prism && T.prism.mode, info: T.bmInfo, at } }, [seed, process.env.WK || null, process.env.CX ? true : null]);
    console.log(seed, JSON.stringify(info));
    const step = Math.max(1, Math.round(+EVERY / info.ds)), list = [];
    if (AT) for (const [u, lat] of AT) list.push([Math.round(u / info.ds) % info.N, lat || 0]);
    else if (+MOUTHS) { for (const a of info.at) for (const d of [-80, -40, -15, 10, 40]) list.push([((a + Math.round(d / info.ds)) % info.N + info.N) % info.N]) }
    else for (let i = 0; i < info.N; i += step) list.push([i]);
    for (const [i, lat] of list) {
      for (const pass of ['a', 'b']) {
        const st = await p.evaluate(([i, pass, chase, lat]) => { const h = window.__hl, T = h.T, cam = h.camera, sc = h.scene, P = T.P, N = T.N, Tg = T.Tg;
          if (chase) { const R = T.R[i], U = T.U[i], t = Tg[i], q = P[i].clone().addScaledVector(R, lat).addScaledVector(U, 1.1);
            cam.position.copy(q).addScaledVector(t, -11).addScaledVector(U, 3.9); cam.up.copy(U); cam.lookAt(q.clone().addScaledVector(t, 12).addScaledVector(U, 0.8)); cam.fov = 80 }
          else { const j = (i - Math.round(14 / T.ds) + N) % N, k = (i + Math.round(40 / T.ds)) % N; cam.up.set(0, 1, 0);
            cam.position.set(P[j].x, P[j].y + 5, P[j].z); cam.lookAt(P[k].x, P[k].y + 2, P[k].z); cam.fov = 72 }
          cam.aspect = 960 / 540; cam.updateProjectionMatrix(); cam.updateMatrixWorld();
          if (T.env && T.env.cave) T.env.cave(cam); if (T.env && T.env.sky) T.env.sky.position.copy(cam.position);  // as the game does each frame
          const sky = []; sc.traverse((o) => { if (o.material && o.material.side === 1 && o.geometry && o.geometry.parameters && o.geometry.parameters.radius >= 2000) sky.push(o) });
          const bg = sc.background, fog = sc.fog && { n: sc.fog.near, f: sc.fog.far };
          if (pass === 'b') { sc.background = new (sc.fog.color.constructor)(0xff00ff); sky.forEach((o) => o.visible = false); if (sc.fog) { sc.fog.near = 1e6; sc.fog.far = 2e6 } }
          h.renderer.setSize(960, 540, false); h.renderer.render(sc, cam);
          let mag = 0, top = 0;
          if (pass === 'b') { const gl = h.renderer.getContext(), px = new Uint8Array(960 * 540 * 4); gl.readPixels(0, 0, 960, 540, gl.RGBA, gl.UNSIGNED_BYTE, px);
            for (let q = 0; q < px.length; q += 4) if (px[q] > 200 && px[q + 1] < 60 && px[q + 2] > 200) { if (q < 960 * 270 * 4) mag++; else top++ } mag /= 960 * 270; top /= 960 * 270 }
          window.__restore = () => { sc.background = bg; sky.forEach((o) => o.visible = true); if (fog) { sc.fog.near = fog.n; sc.fog.far = fog.f } };
          const c = cam.position, PR = T.prism; return { mag, top, ins: PR ? PR.ins[i] : 0, cin: PR && (PR.inside(c.x, c.y, c.z) || c.y < PR.surfH(c.x, c.z) - 2) ? 1 : 0 } }, [i, pass, !!AT, lat || 0]);
        await p.screenshot({ path: `${out}/s${tag}-${String(i).padStart(5, '0')}-${pass}.jpg`, type: 'jpeg', quality: 85 });
        await p.evaluate(() => window.__restore());
        if (pass === 'b') index.push({ seed, i, u: Math.round(i * info.ds), ins: st.ins, cin: st.cin, mag: +st.mag.toFixed(4), top: +st.top.toFixed(4) });
      }
    }
  }
  fs.writeFileSync(out + '/index.json', JSON.stringify(index));
  console.log('views', index.length, 'errors', p.errs.length);
  await b.close();
})();
