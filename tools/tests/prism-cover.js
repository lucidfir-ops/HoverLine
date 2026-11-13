// Prototype 60: Prism, is the road inside the mountain covered? From every point of the road inside (every 4 m, more
// than 40 m from a way in or out, where you see out through the mouth) rays go out in the road's own frame, a fan of 19
// from one side through straight up to the other, 2.5 km long. A ray that meets no rock goes out to the sky through a
// hole. Fails a map where more than 2% of its inside points see the sky.
// Before Prototype 60, Eric's maps had holes over 3 to 17% of their inside road: caves made where an inside stretch
// crossed an outside one, ways in on spires, loops, jumps and splits, slots in the mouths' tunnels.
// And the lakes sit in the ground: no more than 2% of the points round a lake's edge may stand over the outside of the
// mountain by more than 0.5 m (before, 9% did, by up to 149 m on the valley side: a sheet floating over the slope).
// Prototype 64: and three more, for the cave mouths and the spirals:
// - nothing stands in the middle of a spiral but rock: no box over 100 m tall within 40 m of a helix's middle (the night
//   biomes' black monolith stood there in the caverns, from under the floor to over the roof: Eric's "giant black cube"
//   in SX14D5571-3322444422222322-P), and where there is room, a rock column stands there;
// - every gate, every stone of rubble and every column is closed: each edge of its triangles is shared by two of them
//   (that is what keeps the hewn gates from breaking up);
// - inside every gate, rays from the road out to its walls and roof meet the gate first, never other rock (on a banked
//   way out the mountain showed inside the tunnel as a black slab: 2-P at 8.1 km).
// node tools/tests/prism-cover.js [codes or seeds...]   (WK=N CX=1 for Narrow complex seeds)
const { launch, open, ok, done } = require('./lib.js');
const args = process.argv.slice(2);
const seeds = args.length ? args : ['SX14D5571-3322444422222322-P', '2', 'NXD8C77A-P', 'NX130F38-P', 'WXQD87244-33224444222-P', 'SXLB8350A-P', 'NXL1FDB51-23224444222-P3443', 'NXL7D6FF6-33224444222-P3443', '1000', '8919', '16838', '24757', '32676', '40595', '505', '909', '1818', 'SLC32957-P'];
(async () => {
  const b = await launch(); const p = await open(b, 'cover', {});
  for (const s of seeds) {
    const r = await p.evaluate(([s, wk, cx]) => { const h = window.__hl; const c = /^\d+$/.test(s) ? null : h.parseCode(s);
      if (c) h.loadTrack(c.seed, c.wk, c.cx, c.lk, c.sp || null, c.bm && c.bm.k === 'P' ? c.bm : { k: 'P', d: null }); else h.loadTrack(+s, wk, cx, null, null, { k: 'P', d: null });
      const T = h.T, PR = T.prism, V3 = h.camera.position.constructor, N = T.N, ds = T.ds, ins = PR.ins;
      // every rock triangle, in a 3D grid (gate triangles flagged in gt, by their first index / 9)
      const tris = [], gt = new Set(), va = new V3(); for (const m of PR.meshes.concat(PR.gates || [])) { const isG = (PR.gates || []).includes(m); m.updateMatrixWorld(); const A = m.geometry.attributes.position, I = m.geometry.index, n = I ? I.count : A.count;
        for (let k = 0; k < n; k++) { if (isG && k % 3 === 0) gt.add(tris.length); va.fromBufferAttribute(A, I ? I.getX(k) : k).applyMatrix4(m.matrixWorld); tris.push(va.x, va.y, va.z) } }
      const C = 24, G = new Map(), kk = (a, b, c) => (a * 2003 + b) * 2003 + c;
      for (let t = 0; t < tris.length; t += 9) { const lo = [0, 1, 2].map((d) => Math.floor(Math.min(tris[t + d], tris[t + 3 + d], tris[t + 6 + d]) / C)), hi = [0, 1, 2].map((d) => Math.floor(Math.max(tris[t + d], tris[t + 3 + d], tris[t + 6 + d]) / C));
        for (let a = lo[0]; a <= hi[0]; a++) for (let b2 = lo[1]; b2 <= hi[1]; b2++) for (let c2 = lo[2]; c2 <= hi[2]; c2++) { const q = kk(a, b2, c2); let L = G.get(q); if (!L) G.set(q, L = []); L.push(t) } }
      const hit = (ox, oy, oz, dx, dy, dz, len) => { const seen = new Set(); for (let s2 = 0; s2 <= len; s2 += C * 0.5) { const L = G.get(kk(Math.floor((ox + dx * s2) / C), Math.floor((oy + dy * s2) / C), Math.floor((oz + dz * s2) / C))); if (!L) continue;
        for (const t of L) { if (seen.has(t)) continue; seen.add(t); const ax = tris[t], ay = tris[t + 1], az = tris[t + 2], e1x = tris[t + 3] - ax, e1y = tris[t + 4] - ay, e1z = tris[t + 5] - az, e2x = tris[t + 6] - ax, e2y = tris[t + 7] - ay, e2z = tris[t + 8] - az;
          const px = dy * e2z - dz * e2y, py = dz * e2x - dx * e2z, pz = dx * e2y - dy * e2x, det = e1x * px + e1y * py + e1z * pz; if (Math.abs(det) < 1e-12) continue; const tx = ox - ax, ty = oy - ay, tz = oz - az, u = (tx * px + ty * py + tz * pz) / det; if (u < 0 || u > 1) continue;
          const qx = ty * e1z - tz * e1y, qy = tz * e1x - tx * e1z, qz = tx * e1y - ty * e1x, v = (dx * qx + dy * qy + dz * qz) / det; if (v < 0 || u + v > 1) continue; const d = (e2x * qx + e2y * qy + e2z * qz) / det; if (d > 0.5 && d < len) return true } } return false };
      // (Prototype 64) the nearest triangle a ray meets: [distance, is it a gate's]
      const first = (ox, oy, oz, dx, dy, dz, len) => { let best = len, g = false; const seen = new Set(); for (let s2 = 0; s2 <= len; s2 += 1) { /* (fine steps: a cell the ray only clips is still looked in) */ const L = G.get(kk(Math.floor((ox + dx * s2) / C), Math.floor((oy + dy * s2) / C), Math.floor((oz + dz * s2) / C))); if (!L) continue;
        for (const t of L) { if (seen.has(t)) continue; seen.add(t); const ax = tris[t], ay = tris[t + 1], az = tris[t + 2], e1x = tris[t + 3] - ax, e1y = tris[t + 4] - ay, e1z = tris[t + 5] - az, e2x = tris[t + 6] - ax, e2y = tris[t + 7] - ay, e2z = tris[t + 8] - az;
          const px = dy * e2z - dz * e2y, py = dz * e2x - dx * e2z, pz = dx * e2y - dy * e2x, det = e1x * px + e1y * py + e1z * pz; if (Math.abs(det) < 1e-12) continue; const tx = ox - ax, ty = oy - ay, tz = oz - az, u = (tx * px + ty * py + tz * pz) / det; if (u < 0 || u > 1) continue;
          const qx = ty * e1z - tz * e1y, qy = tz * e1x - tx * e1z, qz = tx * e1y - ty * e1x, v = (dx * qx + dy * qy + dz * qz) / det; if (v < 0 || u + v > 1) continue; const d = (e2x * qx + e2y * qy + e2z * qz) / det; if (d > 0.05 && d < best) { best = d; g = gt.has(t) } } if (best < len && s2 > best + C) break } return [best, g] };
      const inGate = []; let gRays = 0; for (const q of PR.gateL || []) for (let s2 = Math.round(8 / ds); s2 <= q.n - Math.round(8 / ds); s2 += Math.max(1, Math.round(4 / ds))) { /* (not within 8 m of its ends, where a ray on a bend or a climb leaves by the open end) */ const i = ((q.i + s2 * q.dir) % N + N) % N, P0 = T.P[i], R = T.R[i], U = T.U[i];
        for (const h0 of [1.5, 6]) { const o = [P0.x + U.x * h0, P0.y + U.y * h0, P0.z + U.z * h0]; for (let a = 0; a <= 180; a += 15) { const l = Math.cos(a / 57.2958), u = Math.sin(a / 57.2958); gRays++;
          const [d, g] = first(o[0], o[1], o[2], R.x * l + U.x * u, R.y * l + U.y * u, R.z * l + U.z * u, 60); if (d < 60 && !g) inGate.push(Math.round(i * ds)) } } }
      // (Prototype 64) closed meshes: every edge shared by exactly two triangles (a gate's two meshes share their points)
      const open = (ms) => { const E = new Map(); for (const m of ms) { const I = m.geometry.index.array; for (let t = 0; t < I.length; t += 3) for (let e = 0; e < 3; e++) { const a = I[t + e], b = I[t + (e + 1) % 3], k = a < b ? a * 4194304 + b : b * 4194304 + a; E.set(k, (E.get(k) || 0) + 1) } } let n = 0; for (const c of E.values()) if (c !== 2) n++; return n };
      const openE = { gates: PR.gates && PR.gates.length ? open(PR.gates) : 0, rubble: (PR.rubble || []).reduce((s3, m) => s3 + open([m]), 0), cols: (PR.cols || []).concat(PR.meshes.filter((m) => m.material.defines && m.material.defines.FACET)).reduce((s3, m) => s3 + open([m]), 0) };
      // (Prototype 64) the middles of the spirals: no tall box, and a column where there is room
      const boxes = []; T.group.traverse((o) => { if (!o.isInstancedMesh) return; const M = new o.matrixWorld.constructor(); for (let k = 0; k < o.count; k++) { o.getMatrixAt(k, M); const e = M.elements; if (Math.hypot(e[4], e[5], e[6]) > 100) boxes.push([e[12], e[14]]) } });
      const hx = T.feats.filter((f) => f.kind === 'helix'), mid = hx.map((f) => { let x = 0, z = 0, n2 = 0; for (let k = Math.floor(f.u0 / ds); k <= Math.ceil(f.u1 / ds); k++) { const q = T.P[(k % N + N) % N]; x += q.x; z += q.z; n2++ } return [x / n2, z / n2] });
      const cube = mid.filter(([x, z]) => boxes.some(([bx, bz]) => Math.hypot(bx - x, bz - z) < 40)).length;
      // inside points away from the ways in and out
      const mouthD = new Float32Array(N).fill(1e9); for (let i = 0; i < N; i++) if (ins[i] !== ins[(i + N - 1) % N]) for (let k = -Math.round(40 / ds); k <= Math.round(40 / ds); k++) mouthD[((i + k) % N + N) % N] = 0;
      const dirs = []; for (let a = 0; a <= 180; a += 10) dirs.push([Math.cos(a / 57.2958), Math.sin(a / 57.2958)]);
      const esc = []; let n = 0; const st = Math.max(1, Math.round(4 / ds));
      for (let i = 0; i < N; i += st) { if (!ins[i] || !mouthD[i]) continue; n++; const q = T.P[i], R = T.R[i], U = T.U[i], o = [q.x + U.x * 3, q.y + U.y * 3, q.z + U.z * 3];
        for (const [l, u] of dirs) if (!hit(o[0], o[1], o[2], R.x * l + U.x * u, R.y * l + U.y * u, R.z * l + U.z * u, 2500)) { esc.push(Math.round(i * ds)); break } }
      let le = 0, lf = 0; T.group.traverse((o) => { if (!o.isMesh || !o.material.uniforms || !o.material.uniforms.uW || o.geometry.type !== 'CircleGeometry') return; o.updateMatrixWorld(); const A = o.geometry.attributes.position;
        for (let k = 1; k < A.count; k++) { va.fromBufferAttribute(A, k).applyMatrix4(o.matrixWorld); const g = PR.surfH(va.x, va.z); le++; if (isFinite(g) && va.y - g > 0.5) lf++ } });
      return { mode: PR.mode, n, esc, le, lf, inGate, gRays, openE, nHx: hx.length, cube, cols: PR.nCols || 0 } }, [s, process.env.WK || null, process.env.CX ? true : null]);
    const share = r.n ? r.esc.length / r.n : 0;
    ok(share <= 0.02, `${s} (${r.mode}) ${r.esc.length} of ${r.n} inside points see the sky (${(share * 100).toFixed(1)}%)${r.esc.length ? ' at ' + r.esc.slice(0, 8).join(', ') + ' m' : ''}`);
    if (r.le) ok(r.lf <= r.le * 0.02, `${s} lakes sit in the ground: ${r.lf} of ${r.le} edge points over it`);
    if (r.gRays) ok(r.inGate.length === 0, `${s} inside its gates rays meet the gate before any other rock: ${r.inGate.length} of ${r.gRays} do not${r.inGate.length ? ' at ' + [...new Set(r.inGate)].slice(0, 8).join(', ') + ' m' : ''}`);
    ok(!r.openE.gates && !r.openE.rubble && !r.openE.cols, `${s} gates, rubble and columns are closed (open edges ${JSON.stringify(r.openE)})`);
    if (r.nHx) ok(!r.cube && r.cols > 0, `${s} the middles of its ${r.nHx} spirals: ${r.cube} with a tall box, ${r.cols} rock columns`);
  }
  ok(p.errs.length === 0, 'no page errors');
  await b.close(); done();
})();
