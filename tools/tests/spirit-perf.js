// Prototype 63: what the Spirit realm costs a phone, per graphics preset. For each preset (Default, Lite, Ultra low) and each code,
// the track is built the way the game builds it, then drawn from chase cameras along the lap (and from the lattice sections),
// once with the realm and once with all of its meshes hidden; the difference in renderer.info (draw calls, triangles) is the
// realm's cost. With three frame types' echoes (three more meshes, shown on their stretches only) added. The budget set in
// Prototype 62 is about +60 draw calls and +120,000 triangles over the base on Default, less on Lite and Ultra low (the triangles are
// mostly the lattice's line quads: the Prototype 62 realm measured +84k to +107k on average and up to +133k in a section).
//        node tools/tests/spirit-perf.js
const { launch, open, ok, done } = require('./lib.js');
const CODES = (process.env.CODES || 'W1234567-S,NX1ABCDEF-S,SL1C0FFEE-S').split(',');
const BUDGET = { all: [60, 120000], lite: [45, 90000], ultra: [30, 60000] };
const CLOCK = () => { window.__T = 1000; performance.now = () => window.__T * 1000; window.requestAnimationFrame = () => 0; window.cancelAnimationFrame = () => {} };
(async () => {
  const b = await launch(); const rows = [];
  for (const preset of ['all', 'lite', 'ultra']) {
    const p = await open(b, 'perf-' + preset, { vp: { width: 640, height: 360 }, render: true, init: CLOCK, settle: 300, storage: { 'hoverline.orient': 'landscape', 'hoverline.autoUltra': 'ok' } });
    await p.addStyleTag({ content: 'body>*:not(canvas){visibility:hidden!important}' });
    for (const code of CODES) {
      const r = await p.evaluate(([code, preset]) => { const H = window.__hl; H.perfApply(preset, true); const c = H.parseCode(code); H.loadTrack(c.seed, c.wk, c.cx, c.lk, c.sp || null, c.bm);
        const T = H.T, sp = T.env.spirit, cam = H.camera, inf = H.renderer.info, V = T.P[0].constructor, S = { p: new V(), r: new V(), u: new V(), t: new V(), h: 0 };
        const mine = new Set([...sp.meshes, sp.sky, sp.floor].filter(Boolean)); let ghosts = 0;
        const draw = (u) => { const f = H.sampleAt(u, S); cam.up.copy(f.u); cam.position.copy(f.p).addScaledVector(f.t, -12).addScaledVector(f.u, 4.5); cam.lookAt(f.p.clone().addScaledVector(f.t, 40).addScaledVector(f.u, 1)); cam.fov = 75; cam.aspect = 640 / 360; cam.updateProjectionMatrix(); cam.updateMatrixWorld();
          T.env.update(1, true); H.renderer.setSize(640, 360, false); H.renderer.info.reset(); H.renderer.render(H.scene, cam); return [inf.render.calls, inf.render.triangles] };
        const us = [], secs = sp.lat.secs.map((s) => s.u); for (let k = 0; k < 14; k++) us.push(T.L * k / 14); for (const s of secs) us.push(s, s + 80);
        let dc = 0, dt = 0, mc = 0, mt = 0, n = 0, bc = 0, bt = 0;
        for (const u of us) { for (const m of mine) m.visible = true; const a = draw(u); for (const m of mine) m.visible = false; const z = draw(u); for (const m of mine) m.visible = true;
          const d = [a[0] - z[0], a[1] - z[1]]; dc += d[0]; dt += d[1]; mc = Math.max(mc, d[0]); mt = Math.max(mt, d[1]); bc += z[0]; bt += z[1]; n++ }
        return { q: sp.q, calls: [dc / n, mc], tris: [dt / n, mt], base: [bc / n, bt / n], info: T.bmInfo, n } }, [code, preset]);
      rows.push({ preset, code, ...r });
      console.log(preset.padEnd(5), code.padEnd(12), 'q', r.q, '| realm +' + r.calls[0].toFixed(0) + ' draw calls (worst +' + r.calls[1] + ')', '+' + Math.round(r.tris[0] / 1000) + 'k triangles (worst +' + Math.round(r.tris[1] / 1000) + 'k) | the rest of the scene: ' + r.base[0].toFixed(0) + ' calls, ' + Math.round(r.base[1] / 1000) + 'k triangles |', r.n, 'views');
      ok(r.calls[1] <= BUDGET[preset][0] && r.tris[0] <= BUDGET[preset][1] && r.tris[1] <= BUDGET[preset][1] * 1.15, preset + ' ' + code + ': within the phone budget (+' + BUDGET[preset][0] + ' calls; +' + BUDGET[preset][1] / 1000 + 'k triangles on average over the views, up to 15% over at the worst view, in a lattice section)');
    }
    ok(p.errs.length === 0, preset + ': no page errors'); await p.ctx.close();
  }
  await b.close(); done();
})();
