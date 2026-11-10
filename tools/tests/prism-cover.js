// Prototype 60: Prism, is the road inside the mountain covered? From every point of the road inside (every 4 m, more
// than 40 m from a way in or out, where you see out through the mouth) rays go out in the road's own frame, a fan of 19
// from one side through straight up to the other, 2.5 km long. A ray that meets no rock goes out to the sky through a
// hole. Fails a map where more than 2% of its inside points see the sky.
// Before Prototype 60, Eric's maps had holes over 3 to 17% of their inside road: caves made where an inside stretch
// crossed an outside one, ways in on spires, loops, jumps and splits, slots in the mouths' tunnels.
// And the lakes sit in the ground: no more than 2% of the points round a lake's edge may stand over the outside of the
// mountain by more than 0.5 m (before, 9% did, by up to 149 m on the valley side: a sheet floating over the slope).
// node tools/tests/prism-cover.js [codes or seeds...]   (WK=N CX=1 for Narrow complex seeds)
const { launch, open, ok, done } = require('./lib.js');
const args = process.argv.slice(2);
const seeds = args.length ? args : ['NXD8C77A-P', 'NX130F38-P', 'WXQD87244-33224444222-P', 'SXLB8350A-P', 'NXL1FDB51-23224444222-P3443', 'NXL7D6FF6-33224444222-P3443', '1000', '8919', '16838', '24757', '32676', '40595', '505', '909', '1818', 'SLC32957-P'];
(async () => {
  const b = await launch(); const p = await open(b, 'cover', {});
  for (const s of seeds) {
    const r = await p.evaluate(([s, wk, cx]) => { const h = window.__hl; const c = /^\d+$/.test(s) ? null : h.parseCode(s);
      if (c) h.loadTrack(c.seed, c.wk, c.cx, c.lk, c.sp || null, c.bm && c.bm.k === 'P' ? c.bm : { k: 'P', d: null }); else h.loadTrack(+s, wk, cx, null, null, { k: 'P', d: null });
      const T = h.T, PR = T.prism, V3 = h.camera.position.constructor, N = T.N, ds = T.ds, ins = PR.ins;
      // every rock triangle, in a 3D grid
      const tris = [], va = new V3(); for (const m of PR.meshes) { m.updateMatrixWorld(); const A = m.geometry.attributes.position, I = m.geometry.index, n = I ? I.count : A.count;
        for (let k = 0; k < n; k++) { va.fromBufferAttribute(A, I ? I.getX(k) : k).applyMatrix4(m.matrixWorld); tris.push(va.x, va.y, va.z) } }
      const C = 24, G = new Map(), kk = (a, b, c) => (a * 2003 + b) * 2003 + c;
      for (let t = 0; t < tris.length; t += 9) { const lo = [0, 1, 2].map((d) => Math.floor(Math.min(tris[t + d], tris[t + 3 + d], tris[t + 6 + d]) / C)), hi = [0, 1, 2].map((d) => Math.floor(Math.max(tris[t + d], tris[t + 3 + d], tris[t + 6 + d]) / C));
        for (let a = lo[0]; a <= hi[0]; a++) for (let b2 = lo[1]; b2 <= hi[1]; b2++) for (let c2 = lo[2]; c2 <= hi[2]; c2++) { const q = kk(a, b2, c2); let L = G.get(q); if (!L) G.set(q, L = []); L.push(t) } }
      const hit = (ox, oy, oz, dx, dy, dz, len) => { const seen = new Set(); for (let s2 = 0; s2 <= len; s2 += C * 0.5) { const L = G.get(kk(Math.floor((ox + dx * s2) / C), Math.floor((oy + dy * s2) / C), Math.floor((oz + dz * s2) / C))); if (!L) continue;
        for (const t of L) { if (seen.has(t)) continue; seen.add(t); const ax = tris[t], ay = tris[t + 1], az = tris[t + 2], e1x = tris[t + 3] - ax, e1y = tris[t + 4] - ay, e1z = tris[t + 5] - az, e2x = tris[t + 6] - ax, e2y = tris[t + 7] - ay, e2z = tris[t + 8] - az;
          const px = dy * e2z - dz * e2y, py = dz * e2x - dx * e2z, pz = dx * e2y - dy * e2x, det = e1x * px + e1y * py + e1z * pz; if (Math.abs(det) < 1e-12) continue; const tx = ox - ax, ty = oy - ay, tz = oz - az, u = (tx * px + ty * py + tz * pz) / det; if (u < 0 || u > 1) continue;
          const qx = ty * e1z - tz * e1y, qy = tz * e1x - tx * e1z, qz = tx * e1y - ty * e1x, v = (dx * qx + dy * qy + dz * qz) / det; if (v < 0 || u + v > 1) continue; const d = (e2x * qx + e2y * qy + e2z * qz) / det; if (d > 0.5 && d < len) return true } } return false };
      // inside points away from the ways in and out
      const mouthD = new Float32Array(N).fill(1e9); for (let i = 0; i < N; i++) if (ins[i] !== ins[(i + N - 1) % N]) for (let k = -Math.round(40 / ds); k <= Math.round(40 / ds); k++) mouthD[((i + k) % N + N) % N] = 0;
      const dirs = []; for (let a = 0; a <= 180; a += 10) dirs.push([Math.cos(a / 57.2958), Math.sin(a / 57.2958)]);
      const esc = []; let n = 0; const st = Math.max(1, Math.round(4 / ds));
      for (let i = 0; i < N; i += st) { if (!ins[i] || !mouthD[i]) continue; n++; const q = T.P[i], R = T.R[i], U = T.U[i], o = [q.x + U.x * 3, q.y + U.y * 3, q.z + U.z * 3];
        for (const [l, u] of dirs) if (!hit(o[0], o[1], o[2], R.x * l + U.x * u, R.y * l + U.y * u, R.z * l + U.z * u, 2500)) { esc.push(Math.round(i * ds)); break } }
      let le = 0, lf = 0; T.group.traverse((o) => { if (!o.isMesh || !o.material.uniforms || !o.material.uniforms.uW || o.geometry.type !== 'CircleGeometry') return; o.updateMatrixWorld(); const A = o.geometry.attributes.position;
        for (let k = 1; k < A.count; k++) { va.fromBufferAttribute(A, k).applyMatrix4(o.matrixWorld); const g = PR.surfH(va.x, va.z); le++; if (isFinite(g) && va.y - g > 0.5) lf++ } });
      return { mode: PR.mode, n, esc, le, lf } }, [s, process.env.WK || null, process.env.CX ? true : null]);
    const share = r.n ? r.esc.length / r.n : 0;
    ok(share <= 0.02, `${s} (${r.mode}) ${r.esc.length} of ${r.n} inside points see the sky (${(share * 100).toFixed(1)}%)${r.esc.length ? ' at ' + r.esc.slice(0, 8).join(', ') + ' m' : ''}`);
    if (r.le) ok(r.lf <= r.le * 0.02, `${s} lakes sit in the ground: ${r.lf} of ${r.le} edge points over it`);
  }
  ok(p.errs.length === 0, 'no page errors');
  await b.close(); done();
})();
