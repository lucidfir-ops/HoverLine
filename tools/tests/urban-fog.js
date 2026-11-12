// Prototype 63: Urban ground fog (004f). On three Urban codes, day and night, built twice (the fog, and low detail, which has
// none and keeps its grid):
//  - the mist floor stands in the grid's place; low detail keeps the grid;
//  - the fog costs no draw call: the same fogged build drawn with its mist floor swapped for the grid makes the same number of calls;
//  - the road is untouched: the strip of road under the chase camera is the same pixels with and without the fog;
//  - the fog does its job: from the road's height, over the ground beyond the city, the ground is one flat colour (the
//    mist's), where with the grid it shows the grid's lines;
//  - the shaders compile (no console error).                                  node tools/tests/urban-fog.js
const fs = require('fs'), path = require('path'), os = require('os');
const { launch, open, ok, done, PAGE } = require('./lib.js');
// the page with a hook of this test's own (RES, the renderer, the camera and THREE are not in lib.js's hook)
const src = fs.readFileSync(PAGE, 'utf8'), A = 'requestAnimationFrame(frame);\n})();';
if (!src.includes(A)) throw new Error('hook anchor missing in ' + PAGE);
const tmp = path.join(os.tmpdir(), 'hl-urban-fog-' + process.pid + '.html');
fs.writeFileSync(tmp, src.replace(A, 'window.__sh={loadTrack,parseCode,RES,getT:()=>T,camera,renderer,scene};' + A));
const CODES = ['WX630A48', 'NX3D7DBD', 'SLE54D5C'];
const CLOCK = () => { let T = 1000; performance.now = () => T; window.requestAnimationFrame = () => 0; window.cancelAnimationFrame = () => {} };
(async () => {
  const b = await launch();
  for (const tod of ['night', 'day']) {
    const p = await open(b, 'fog-' + tod, { file: tmp, vp: { width: 400, height: 225 }, render: true, init: CLOCK, settle: 300, storage: { 'hoverline.orient': 'landscape', 'hoverline.tod': tod, 'hoverline.tods': tod } });
    const bad = []; p.on('console', (m) => { if (m.type() === 'error' || /shader|WebGLProgram/i.test(m.text())) bad.push(m.text().slice(0, 160)) });
    for (const code of CODES) {
      const tag = tod + ' ' + code;
      const run = (low) => p.evaluate(([code, low]) => { const h = window.__sh, c = h.parseCode(code); h.RES.low = low; h.loadTrack(c.seed, c.wk, c.cx, c.lk, c.sp || null, { k: 'U', d: c.bm && c.bm.d }); h.RES.low = false;
        const T = h.getT(), cam = h.camera, N = T.N; let hi = 0, maxX = -1e9, cz = 0; for (let i = 0; i < N; i++) { if (T.P[i].y > T.P[hi].y) hi = i; if (T.P[i].x > maxX) { maxX = T.P[i].x; cz = T.P[i].z } }
        const kinds = { plane: 0, grid: 0 }; T.group.traverse((o) => { if (o.geometry && o.geometry.type === 'PlaneGeometry' && o.geometry.parameters.width === 7000) kinds.plane++; if (o.type === 'GridHelper') kinds.grid++ });
        const shot = (set) => { set(); cam.aspect = 400 / 225; cam.updateProjectionMatrix(); cam.updateMatrixWorld(); h.renderer.setSize(400, 225, false); h.renderer.info.reset(); h.renderer.render(h.scene, cam);
          const gl = h.renderer.getContext(), px = new Uint8Array(400 * 225 * 4); gl.readPixels(0, 0, 400, 225, gl.RGBA, gl.UNSIGNED_BYTE, px); return { px, calls: h.renderer.info.render.calls } };
        const chase = shot(() => { const i = Math.floor(N * 0.3), U = T.U[i], t = T.Tg[i], q = T.P[i].clone().addScaledVector(U, 1.1); cam.position.copy(q).addScaledVector(t, -11).addScaledVector(U, 3.9); cam.up.copy(U); cam.lookAt(q.clone().addScaledVector(t, 12).addScaledVector(U, 0.8)); cam.fov = 80 });
        // from the road's height, 700 m past the city's edge, looking straight down: only the ground is in view
        const down = shot(() => { cam.up.set(0, 0, -1); cam.position.set(maxX + 700, T.P[hi].y, cz); cam.lookAt(maxX + 700, T.P[hi].y - 100, cz); cam.fov = 60 });
        const road = []; for (let y = 0; y < 60; y++) for (let x = 100; x < 300; x++) { const k = (y * 400 + x) * 4; road.push(chase.px[k], chase.px[k + 1], chase.px[k + 2]) }
        let mn = [255, 255, 255], mx = [0, 0, 0]; for (let y = 40; y < 185; y++) for (let x = 100; x < 300; x++) { const k = (y * 400 + x) * 4; for (let q = 0; q < 3; q++) { mn[q] = Math.min(mn[q], down.px[k + q]); mx[q] = Math.max(mx[q], down.px[k + q]) } }
        let swap = null;   // the mist floor swapped for the grid: the same number of calls?
        if (kinds.plane) { let pl; T.group.traverse((o) => { if (o.geometry && o.geometry.type === 'PlaneGeometry' && o.geometry.parameters.width === 7000) pl = o }); pl.visible = false; const g = new window.THREE.GridHelper(6000, 150, 0x1f2c38, 0x131a22); g.position.y = T.floorY; T.group.add(g);
          swap = shot(() => { const i = Math.floor(N * 0.3), U = T.U[i], t = T.Tg[i], q = T.P[i].clone().addScaledVector(U, 1.1); cam.position.copy(q).addScaledVector(t, -11).addScaledVector(U, 3.9); cam.up.copy(U); cam.lookAt(q.clone().addScaledVector(t, 12).addScaledVector(U, 0.8)); cam.fov = 80 }).calls; T.group.remove(g); pl.visible = true }
        return { kinds, road: Array.from(road), spread: Math.max(mx[0] - mn[0], mx[1] - mn[1], mx[2] - mn[2]), calls: chase.calls, swap } }, [code, low]);
      const fog = await run(false), low = await run(true);
      ok(fog.kinds.plane === 1 && fog.kinds.grid === 0 && low.kinds.plane === 0 && low.kinds.grid === 1, tag + ': the mist floor stands in the grid\'s place, low detail keeps the grid ' + JSON.stringify([fog.kinds, low.kinds]));
      ok(fog.swap === fog.calls, tag + ': no draw call more than with the grid (' + fog.calls + ' and ' + fog.swap + ')');
      ok(JSON.stringify(fog.road) === JSON.stringify(low.road), tag + ': the road under the chase camera is the same pixels with and without the fog');
      ok(fog.spread <= 2 && low.spread > fog.spread, tag + ': the ground seen from the road\'s height is one flat colour (spread ' + fog.spread + ' levels; the grid\'s ' + low.spread + ')');
    }
    ok(!bad.length, tod + ': no shader or console errors ' + bad.join(' | '));
    await p.ctx.close();
  }
  fs.unlinkSync(tmp); await b.close(); done();
})().catch((e) => { console.log('FAIL', e.message); process.exit(1) });
