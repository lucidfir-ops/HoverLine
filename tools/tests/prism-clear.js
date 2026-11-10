// Prism: is the road clear? For many maps, checks every rock triangle (mountain, cavern floor and roof, stalactites and
// stalagmites, cave mouths) against vertical probes across the road every few metres, from just under its (banked)
// surface to 8 m over it; and every lake, river, pool and caldera against the road under it. And nothing of the caverns
// (floor, roof, stalactites, tunnels, the faces round the mouths) may stand out of the mountain's outside.
// node tools/tests/prism-clear.js [seeds, default 30 of them] [codes...]
const { launch, open, ok, done } = require('./lib.js');
const args = process.argv.slice(2);
const seeds = args.length ? args : Array.from({ length: 30 }, (_, k) => String(1000 + k * 7919 % 99991));
(async () => {
  const b = await launch(); const p = await open(b, 'clear', {});
  let worst = 0;
  for (const s of seeds) {
    const r = await p.evaluate((s) => { const h = window.__hl; const c = /^\d+$/.test(s) ? null : h.parseCode(s);
      if (c) h.loadTrack(c.seed, c.wk, c.cx, c.lk, c.sp || null, c.bm && c.bm.k === 'P' ? c.bm : { k: 'P', d: null }); else h.loadTrack(+s, null, null, null, null, { k: 'P', d: null });
      const T = h.T, PR = T.prism, sc = h.scene, V3 = h.camera.position.constructor, W = T.D.w;
      // the road's probes: x, z, bottom, top (main road, every 4 m, 7 across, banked)
      const pr = []; const st = Math.max(1, Math.round(4 / T.ds));
      for (let i = 0; i < T.N; i += st) { const p = T.P[i], r = T.R[i]; for (let k = -3; k <= 3; k++) { const l = k / 3 * (W / 2 - 0.5); const x = p.x + r.x * l, y = p.y + r.y * l, z = p.z + r.z * l; pr.push(x, z, y - 0.3, y + 8, i) } }
      const G = new Map(), CS = 8, key = (a, b) => a * 100003 + b; for (let k = 0; k < pr.length; k += 5) { const kk = key(Math.floor(pr[k] / CS), Math.floor(pr[k + 1] / CS)); let L = G.get(kk); if (!L) G.set(kk, L = []); L.push(k) }
      const hits = {}; let nT = 0;
      const test = (a, b2, c2, what) => { nT++; const x0 = Math.min(a.x, b2.x, c2.x), x1 = Math.max(a.x, b2.x, c2.x), z0 = Math.min(a.z, b2.z, c2.z), z1 = Math.max(a.z, b2.z, c2.z);
        const den = (b2.z - c2.z) * (a.x - c2.x) + (c2.x - b2.x) * (a.z - c2.z); if (Math.abs(den) < 1e-9) return;
        for (let gx = Math.floor(x0 / CS); gx <= Math.floor(x1 / CS); gx++) for (let gz = Math.floor(z0 / CS); gz <= Math.floor(z1 / CS); gz++) { const L = G.get(key(gx, gz)); if (!L) continue;
          for (const k of L) { const px = pr[k], pz = pr[k + 1]; const u = ((b2.z - c2.z) * (px - c2.x) + (c2.x - b2.x) * (pz - c2.z)) / den, v = ((c2.z - a.z) * (px - c2.x) + (a.x - c2.x) * (pz - c2.z)) / den, w = 1 - u - v;
            if (u < 0 || v < 0 || w < 0) continue; const y = a.y * u + b2.y * v + c2.y * w; if (y > pr[k + 2] && y < pr[k + 3]) { const L2 = hits[what] = hits[what] || []; L2.push(pr[k + 4]) } } } };
      const rock = new Set(PR.meshes);
      sc.traverse((o) => { if (!o.isMesh || !o.geometry || !o.material) return; const m = o.material; const liq = m.uniforms && m.uniforms.uW, cyl = m.isMeshBasicMaterial && o.geometry.type === 'CylinderGeometry' && o.geometry.parameters.radiusTop > 8;
        if (!rock.has(o) && !liq && !cyl) return; const what = rock.has(o) ? 'rock' : liq ? 'liquid' : 'pool'; o.updateMatrixWorld();
        const A = o.geometry.attributes.position, I = o.geometry.index, n = I ? I.count : A.count, va = new V3(), vb = new V3(), vc = new V3();
        for (let k = 0; k < n; k += 3) { va.fromBufferAttribute(A, I ? I.getX(k) : k).applyMatrix4(o.matrixWorld); vb.fromBufferAttribute(A, I ? I.getX(k + 1) : k + 1).applyMatrix4(o.matrixWorld); vc.fromBufferAttribute(A, I ? I.getX(k + 2) : k + 2).applyMatrix4(o.matrixWorld); test(va, vb, vc, what) } });
      // nothing from inside the mountain standing out of it: every vertex of every other rock mesh under the outside
      if (PR.mode !== 'in') { const M = PR.meshes[0].geometry, Q = M.attributes.position.array, I = M.index.array, SB = new Map(), bc = 20, bk = (a, b) => a * 65537 + b;
        for (let t = 0; t < I.length; t += 3) { const a = I[t] * 3, b = I[t + 1] * 3, c = I[t + 2] * 3; for (let i = Math.floor(Math.min(Q[a], Q[b], Q[c]) / bc); i <= Math.floor(Math.max(Q[a], Q[b], Q[c]) / bc); i++) for (let j = Math.floor(Math.min(Q[a + 2], Q[b + 2], Q[c + 2]) / bc); j <= Math.floor(Math.max(Q[a + 2], Q[b + 2], Q[c + 2]) / bc); j++) { const k = bk(i, j); let L = SB.get(k); if (!L) SB.set(k, L = []); L.push(t) } }
        const surf = (x, z) => { const L = SB.get(bk(Math.floor(x / bc), Math.floor(z / bc))); if (!L) return Infinity; for (const t of L) { const a = I[t] * 3, b = I[t + 1] * 3, c = I[t + 2] * 3, den = (Q[b + 2] - Q[c + 2]) * (Q[a] - Q[c]) + (Q[c] - Q[b]) * (Q[a + 2] - Q[c + 2]); if (Math.abs(den) < 1e-9) continue;
          const u = ((Q[b + 2] - Q[c + 2]) * (x - Q[c]) + (Q[c] - Q[b]) * (z - Q[c + 2])) / den, v = ((Q[c + 2] - Q[a + 2]) * (x - Q[c]) + (Q[a] - Q[c]) * (z - Q[c + 2])) / den, w = 1 - u - v; if (u >= -1e-3 && v >= -1e-3 && w >= -1e-3) return Q[a + 1] * u + Q[b + 1] * v + Q[c + 1] * w } return Infinity };
        let n = 0, mx = 0; PR.meshes.forEach((m, mi) => { if (!mi) return; const A = m.geometry.attributes.position, J = m.geometry.index; const used = new Uint8Array(A.count); if (J) for (let q = 0; q < J.count; q++) used[J.getX(q)] = 1; else used.fill(1);
          for (let v = 0; v < A.count; v++) { if (!used[v]) continue; const d = A.getY(v) - surf(A.getX(v), A.getZ(v)); if (d > 0.5) { n++; mx = Math.max(mx, d) } } });
        if (n) hits['inside out'] = Array(n).fill(Math.round(mx)) }
      const sum = {}; for (const w in hits) { const L = [...new Set(hits[w])]; sum[w] = { n: L.length, at: L.slice(0, 6) } }
      return { s, mode: PR.mode, tris: nT, sum } }, s);
    const n = Object.values(r.sum).reduce((a, x) => a + x.n, 0); worst = Math.max(worst, n);
    ok(n === 0, `${s} (${r.mode}) road clear of rock and liquid ${n ? JSON.stringify(r.sum) : ''}`);
  }
  ok(p.errs.length === 0, 'no page errors');
  await b.close(); done();
})();
