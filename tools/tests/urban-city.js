// Urban city (Prototype 60): the city is dense, stands on the street grid (or faces the road), and never meets the road.
// node tools/tests/urban-city.js [seeds, default 8]   (Prototype 60: or whole track codes, built as the game builds them, in Urban)
// For each map, reads every building (the instanced mesh with lit windows) and checks:
//  - there are many (at least 800 at the default density, the old city had about 400),
//  - every footprint stays at least W/2+40 m (horizontally, nearest face) from every road point and every split route,
//    the road's flights through the air included (the road is sampled every 2 m),
//  - each building is on the street grid (turned a multiple of 90 degrees) or faces the road (its long face within 5
//    degrees of the heading of some road within 150 m).
const { launch, open, ok, done } = require('./lib.js');
const seeds = process.argv.slice(2).length ? process.argv.slice(2).map((a) => /^\d+$/.test(a) ? Number(a) : a) : [11, 222, 3333, 4, 57, 808, 9001, 31337];
(async () => {
  const b = await launch(); const p = await open(b, 'city', { render: true });
  let rot = 0, tot = 0;
  for (const s of seeds) for (const wk of typeof s === 'string' ? [null] : ['N', 'W']) {
    const r = await p.evaluate(([s, wk]) => {
      const h = window.__hl; if (typeof s === 'string') { const c = h.parseCode(s); h.loadTrack(c.seed, c.wk, c.cx, c.lk, c.sp || null, { k: 'U', d: c.bm && c.bm.d }) } else h.loadTrack(s, wk, null, null, null, { k: 'U', d: null });
      const T = h.T, W = T.D.w, pts = [...T.P];
      for (const S of T.splits || []) for (const q of S.pts || []) pts.push(q);
      let best = null; h.scene.traverse((o) => { if (o.isInstancedMesh && o.material.emissiveMap && (!best || o.count > best.count)) best = o });
      const A = best.instanceMatrix.array, n = best.count, G = new Map(), key = (a, c) => a * 65537 + c;
      pts.forEach((q, i) => { const k = key(Math.floor(q.x / 64), Math.floor(q.z / 64)); let L = G.get(k); if (!L) G.set(k, L = []); L.push(i) });
      let minClr = 1e9, off = 0, rotated = 0, bad = 0;
      for (let k = 0; k < n; k++) {
        const m = k * 16, sx = Math.hypot(A[m], A[m + 1], A[m + 2]), sz = Math.hypot(A[m + 8], A[m + 9], A[m + 10]), x = A[m + 12], z = A[m + 14];
        const ry = Math.atan2(A[m + 8] / sz, A[m + 10] / sz), c = Math.cos(ry), sn = Math.sin(ry), R = Math.hypot(sx, sz) / 2 + W / 2 + 60;
        let clr = 1e9, nearQ = null;
        for (let a = Math.floor((x - R) / 64); a <= Math.floor((x + R) / 64); a++) for (let e = Math.floor((z - R) / 64); e <= Math.floor((z + R) / 64); e++) { const L = G.get(key(a, e)); if (!L) continue;
          for (const i of L) { const q = pts[i], dx = q.x - x, dz = q.z - z, lx = dx * c - dz * sn, lz = dx * sn + dz * c, ex = Math.max(Math.abs(lx) - sx / 2, 0), ez = Math.max(Math.abs(lz) - sz / 2, 0), d = Math.hypot(ex, ez); if (d < clr) { clr = d; nearQ = i } } }
        minClr = Math.min(minClr, clr - W / 2);
        const q90 = Math.abs(((ry / (Math.PI / 2)) % 1 + 1.5) % 1 - 0.5) * 90;   // degrees off a multiple of 90
        if (q90 < 1) continue;
        rotated++;
        let okF = false;   // some road within 150 m runs the way its long face points (within 5 degrees)
        for (let a = Math.floor((x - 150) / 64); a <= Math.floor((x + 150) / 64) && !okF; a++) for (let e = Math.floor((z - 150) / 64); e <= Math.floor((z + 150) / 64) && !okF; e++) for (const i of G.get(key(a, e)) || []) {
          if (i >= T.N || Math.hypot(pts[i].x - x, pts[i].z - z) > 150) continue; const t = T.Tg[i], df = (((ry - Math.atan2(t.x, t.z)) % Math.PI) + Math.PI) % Math.PI; if (Math.min(df, Math.PI - df) * 180 / Math.PI < 5) { okF = true; break } }
        if (!okF) bad++;
      }
      return { n, minClr, rotated, bad, W } }, [s, wk]);
    tot += r.n; rot += r.rotated;
    ok(r.n >= 800, `${s}${wk || ''}: ${r.n} buildings`);
    ok(r.minClr >= 40, `${s}${wk || ''}: nearest building ${r.minClr.toFixed(1)} m from the road edge`);
    ok(r.bad === 0, `${s}${wk || ''}: ${r.rotated} turned buildings, ${r.bad} neither on the grid nor facing the road`);
  }
  ok(rot > 0, `some buildings face the road (${rot} of ${tot})`);
  ok(p.errs.length === 0, 'no page errors');
  await b.close(); done();
})();
