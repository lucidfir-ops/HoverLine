/* Spirit realm prototype, effects library, part 2b: the colossus (31), arches that assemble (32) and pieces of the
   other realms (33). Same contract as objects.js: SPFX.obj.<name>(THREE, opts) -> { group, update(t, beat) }. */
(function (root) {
  const SPFX = root.SPFX, O = SPFX.obj;
  function kit(THREE, o) { const pal = o.palU || SPFX.newPal(o.pal || 'goldViolet');
    return { pal, lm: (x = {}) => SPFX.lineMat({ pal, width: o.width, ...x }), cm: (x = {}) => SPFX.coreMat({ pal, ...x }), setPal(p) { SPFX.setPal(pal, p) } } }
  const v3 = (THREE, a) => new THREE.Vector3(a[0], a[1], a[2]);

  /* ---------- 31 the colossus: a vast lattice presence whose ring head turns towards the race ---------- */
  O.colossus = function (THREE, o = {}) {
    const k = kit(THREE, o), H = o.size || 600, grp = new THREE.Group(), L = SPFX.Lines();
    const rings = 14, sides = 8, R0 = H * 0.09, R1 = H * 0.16, y0 = -H * 0.5, y1 = H * 0.18, ring = [];
    for (let i = 0; i <= rings; i++) { const f = i / rings, y = y0 + (y1 - y0) * f, r = R0 + (R1 - R0) * Math.pow(f, 1.5) * (1 - 0.25 * Math.sin(f * Math.PI)); ring.push(SPFX.circle(r, sides, y, i * 0.2)) }
    for (let i = 0; i <= rings; i++) { L.poly(ring[i], true, 0.1 + i / rings * 0.5, i % 3 ? 0.6 : 1.1);
      if (i < rings) for (let j = 0; j < sides; j++) { L.seg(ring[i][j], ring[i + 1][j], 0.1 + i / rings * 0.5, 0.9); L.seg(ring[i][j], ring[i + 1][(j + 1) % sides], 0.3 + i / rings * 0.5, 0.45) } }
    for (let i = 0; i < 9; i++) { const y = y0 + (i + 0.5) * (y1 - y0) / 9; L.edges(new THREE.OctahedronGeometry(R0 * 0.55), 0.85, 0.8, null, new THREE.Matrix4().makeTranslation(0, y, 0)) }
    const sh = [-1, 1].map((s) => new THREE.Vector3(s * R1 * 1.7, y1 - H * 0.02, 0)); L.seg(sh[0], sh[1], 0.6, 1.2);
    for (const s of [-1, 1]) { const a = new THREE.Vector3(s * R1 * 1.7, y1 - H * 0.02, 0), b = new THREE.Vector3(s * R1 * 2.3, y1 - H * 0.3, H * 0.05), c = new THREE.Vector3(s * R1 * 2.0, y1 - H * 0.55, H * 0.12);
      for (const [p, q] of [[a, b], [b, c]]) { const n = 6, w = R0 * 0.35; for (let i = 0; i < n; i++) { const pa = p.clone().lerp(q, i / n), pb = p.clone().lerp(q, (i + 1) / n);
        for (const off of [[w, 0, 0], [-w, 0, 0], [0, 0, w], [0, 0, -w]]) L.seg(pa.clone().add(v3(THREE, off)), pb.clone().add(v3(THREE, off)), 0.5, 0.7);
        L.seg(pa.clone().add(v3(THREE, [w, 0, 0])), pb.clone().add(v3(THREE, [-w, 0, 0])), 0.55, 0.4); L.seg(pa.clone().add(v3(THREE, [0, 0, w])), pb.clone().add(v3(THREE, [0, 0, -w])), 0.55, 0.4) } }
      L.edges(new THREE.IcosahedronGeometry(R0 * 0.5), 0.9, 1, null, new THREE.Matrix4().makeTranslation(c.x, c.y, c.z)) }
    const body = L.mesh(k.lm({ width: H * 0.0012, minPx: 1.8, maxPx: 5 })); grp.add(body);
    const head = new THREE.Group(); head.position.y = y1 + H * 0.16; grp.add(head); const hl = SPFX.Lines(), hr = H * 0.13;
    for (let i = 0; i < 4; i++) hl.poly(SPFX.circleXY(hr * (0.3 + 0.23 * i), 64), true, 0.6 + i * 0.1, i === 3 ? 1.3 : 0.9);
    for (let i = 0; i < 32; i++) { const a = i / 32 * Math.PI * 2, r2 = hr * (i % 2 ? 1.25 : 1.45); hl.seg([Math.cos(a) * hr * 1.05, Math.sin(a) * hr * 1.05, 0], [Math.cos(a) * r2, Math.sin(a) * r2, 0], 0.95, 0.8) }
    const hm = hl.mesh(k.lm({ width: H * 0.0016, minPx: 1.8, maxPx: 6 })); head.add(hm);
    const eye = SPFX.solid(new THREE.IcosahedronGeometry(hr * 0.18), { pal: k.pal, width: H * 0.002, ca: 0.8, cs: hr * 0.04, pc0: 0.9, pcSpan: 0.1 }); head.add(eye);
    const inner = new THREE.Group(); head.add(inner); const il = SPFX.Lines(); il.poly(SPFX.circleXY(hr * 0.5, 6), true, 0.8, 0.8); il.poly(SPFX.circleXY(hr * 0.5, 6, Math.PI / 6), true, 0.8, 0.8); inner.add(il.mesh(k.lm({ width: H * 0.0012, maxPx: 4 })));
    const tgt = new THREE.Vector3(), m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), pw = new THREE.Vector3();
    return { group: grp, k, head, update(t, bt) {
        if (o.target) { grp.updateMatrixWorld(true); tgt.copy(o.target(t)); head.getWorldPosition(pw);
          // the head's local frame looks along -z by lookAt; we want its face (+z) toward the target
          m4.lookAt(tgt, pw, new THREE.Vector3(0, 1, 0)); q.setFromRotationMatrix(m4); const pq = new THREE.Quaternion(); grp.getWorldQuaternion(pq); q.premultiply(pq.invert());
          head.quaternion.slerp(q, o.turnK || 0.05) }
        inner.rotation.z = t * 0.3; eye.rotation.y = t * 0.5; hm.material.uniforms.uGain.value = 1 + 0.6 * bt.k + bt.drop; body.material.uniforms.uGain.value = 0.85 + 0.25 * bt.k } };
  };

  /* ---------- 32 arches that assemble over the road ---------- */
  /* An arch of blocks across the road at o.u (stage metres). Pieces fly in from the void and lock before the leader is
     o.ready metres away; it bursts after the last racer (o.lastDu behind the leader) is o.after metres past. */
  O.arch = function (THREE, o = {}) {
    const k = kit(THREE, o), span = o.span || 30, rise = o.rise || 16, n = o.n || 21, rnd = SPFX.rng(o.seed || 32), blk = o.block || span * 0.07;
    const L = SPFX.Lines(), C = SPFX.Cores(), box = new THREE.BoxGeometry(blk * 1.4, blk, blk * 1.6);
    for (let i = 0; i < n; i++) { const a = Math.PI * (i + 0.5) / n, x = -Math.cos(a) * span / 2, y = Math.sin(a) * rise;
      const m = new THREE.Matrix4().makeRotationZ(a - Math.PI / 2);
      const far = new THREE.Vector3((rnd() - 0.5) * span * 6, rise * (1 + rnd() * 5), (rnd() - 0.2) * span * 5);
      const out = new THREE.Vector3(x, y, 0).normalize().multiplyScalar(span * (1 + rnd())).add(new THREE.Vector3(0, rise * rnd(), (rnd() - 0.5) * span));
      const pi = { home: far.toArray(), target: [x, y, 0], dir: out.toArray(), axis: [rnd() - 0.5, rnd() - 0.5, rnd() - 0.5], r: rnd() }, pc = i / n;
      L.edges(box, pc, 1, pi, m); C.add(box, m, pc, pi);
      if (i === (n >> 1)) { const pts = []; SPFX.BEAST[3].forEach((pl) => { const q = pl.map(([px, py]) => new THREE.Vector3(px * blk * 0.2, (py - 2.2) * blk * 0.2, -blk * 0.81).applyMatrix4(m)); L.poly(q, false, 0.95, 1.2, pi) }) } }
    const lm = k.lm({ pieces: true, width: blk * 0.05, maxPx: 6, stag: 0.55, spin: 2.5 }), cm = k.cm({ pieces: true, ca: 0.4, cs: blk * 0.25, cy: 0, core: '#07060c' }); SPFX.linkPieces(lm, cm);
    const grp = new THREE.Group(); grp.add(C.mesh(cm), L.mesh(lm));
    return { group: grp, k, mats: [lm], update(t, bt) { const ST = SPFX.stage, lead = ST.lead(t), last = lead + (o.lastDu || -40);
        const dA = o.u - lead, m = SPFX.easeIO(1 - Math.max(0, Math.min(1, (dA - (o.ready || 150)) / (o.flyIn || 220))));
        const e = SPFX.ease(Math.max(0, Math.min(1, (last - o.u - (o.after || 15)) / 60)));
        lm.uniforms.uMorph.value = m; lm.uniforms.uExplode.value = e; lm.uniforms.uGain.value = (m > 0.99 && e < 0.01 ? 1.2 + 0.5 * bt.k : 0.9 + 0.3 * bt.k) } };
  };

  /* ---------- 33 pieces of the other realms ---------- */
  function brokenBase(THREE, L, C, r, y, pc, rnd) { const n = 9, top = [];
    for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2, rr = r * (0.8 + 0.35 * rnd()); top.push(new THREE.Vector3(Math.cos(a) * rr, y, Math.sin(a) * rr)) }
    const tip = new THREE.Vector3((rnd() - 0.5) * r * 0.3, y - r * (0.9 + 0.5 * rnd()), (rnd() - 0.5) * r * 0.3);
    for (let i = 0; i < n; i++) { const a = top[i], b = top[(i + 1) % n], mid = a.clone().lerp(b, 0.5).multiplyScalar(0.7).setY(y - r * (0.25 + 0.3 * rnd()));
      C.add(new THREE.BufferGeometry().setFromPoints([a, mid, b, b, mid, tip, a, tip, mid]), null, pc); L.seg(a, mid, pc, 0.7); L.seg(mid, tip, pc, 0.5) }
    L.poly(top, true, pc, 1); C.add(new THREE.BufferGeometry().setFromPoints(top.flatMap((p, i) => [new THREE.Vector3(0, y, 0), top[(i + 1) % n], p])), null, pc); return top }
  SPFX.HOME = { prism: 'rainbow', urban: { name: 'Urban amber + cyan', stops: ['#ffb000', '#ffcf5a', '#3ff0ff', '#aef8ff'] },
    reef: { name: 'Reef coral + teal', stops: ['#ff4f8b', '#ff9a6a', '#2fe0c8', '#5ab8ff'] }, forest: { name: 'Forest green', stops: ['#0f7a3a', '#2fd06a', '#46ff8c', '#c8ff9a'] } };
  O.realm = function (THREE, o = {}) {
    const kind = o.kind || 'prism', s = o.size || 20, rnd = SPFX.rng(o.seed || 33), grp = new THREE.Group();
    const k = kit(THREE, { ...o, pal: o.pal || SPFX.HOME[kind] }), L = SPFX.Lines(), C = SPFX.Cores(), lw = s * 0.008;
    const spin = (t) => grp.rotation.set(Math.sin(t * 0.23 + s) * 0.25, t * 0.1 + s, Math.sin(t * 0.17) * 0.15);
    if (kind === 'prism') { // contour-lined black rock, as Prism's
      const g = new THREE.IcosahedronGeometry(s * 0.6, 3), p = g.attributes.position, v = new THREE.Vector3();
      for (let i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i); const n = Math.sin(v.x * 0.31 * 20 / s + 1.7) * Math.cos(v.z * 0.27 * 20 / s) + Math.sin(v.y * 0.4 * 20 / s + v.x * 0.2 * 20 / s) * 0.6; let y = v.y;
        y = y > 0 ? y * (1.3 + 0.3 * n) * (1 - 0.15 * Math.abs(v.x) / s) + s * 0.1 : y * 0.45; v.multiplyScalar(1 + 0.12 * n); v.y = y; p.setXYZ(i, v.x, v.y, v.z) }
      C.add(g, null, 0); const cm = k.cm({ ca: 1.1, cs: s * 0.045, cy: 0.6 / s, core: '#040308' }); grp.add(C.mesh(cm));
      return { group: grp, k, update(t, bt) { spin(t); cm.uniforms.uGain.value = 1 + 0.4 * bt.k } } }
    if (kind === 'urban') { brokenBase(THREE, L, C, s * 0.6, 0, 0.1, rnd);
      for (let i = 0; i < 7; i++) { const w = s * (0.14 + 0.1 * rnd()), h = s * (0.4 + 0.9 * rnd()), x = (rnd() - 0.5) * s * 0.7, z = (rnd() - 0.5) * s * 0.7, geo = new THREE.BoxGeometry(w, h, w), m = new THREE.Matrix4().makeTranslation(x, h / 2, z);
        C.add(geo, m, 0.2); L.edges(geo, 0.05, 1, null, m);
        for (let fy = h * 0.08; fy < h * 0.95; fy += s * 0.045) for (let fx = -w * 0.38; fx < w * 0.38; fx += w * 0.19) if (rnd() < 0.55) { const pc = rnd() < 0.8 ? 0.15 : 0.8;
          L.seg([x + fx, fy, z + w / 2 + 0.01], [x + fx + w * 0.1, fy, z + w / 2 + 0.01], pc, 0.9); L.seg([x + w / 2 + 0.01, fy, z + fx], [x + w / 2 + 0.01, fy, z + fx + w * 0.1], pc, 0.9) } } }
    if (kind === 'reef') { brokenBase(THREE, L, C, s * 0.45, 0, 0.6, rnd);
      const branch = (p, d, len, depth) => { const q = p.clone().addScaledVector(d, len); L.seg(p, q, 0.05 + depth * 0.12, 1);
        if (depth > 0) { for (let i = 0; i < 2 + (rnd() < 0.4 ? 1 : 0); i++) branch(q, d.clone().add(new THREE.Vector3(rnd() - 0.5, rnd() * 0.4, rnd() - 0.5).multiplyScalar(1.3)).normalize(), len * 0.72, depth - 1) }
        else L.poly(SPFX.circle(len * 0.25, 8).map((c) => c.add(q)), true, 0.95, 1.2) };
      for (let i = 0; i < 5; i++) branch(new THREE.Vector3((rnd() - 0.5) * s * 0.5, 0, (rnd() - 0.5) * s * 0.5), new THREE.Vector3(rnd() - 0.5, 1.5, rnd() - 0.5).normalize(), s * 0.22, 4);
      for (let i = 0; i < 2; i++) { const c = new THREE.Vector3((rnd() - 0.5) * s * 0.6, 0, (rnd() - 0.5) * s * 0.4), a = rnd() * Math.PI, arc = [];
        for (let j = 0; j <= 20; j++) { const b = Math.PI * j / 20, d = new THREE.Vector3(Math.cos(b) * Math.cos(a), Math.sin(b), Math.cos(b) * Math.sin(a)); arc.push(c.clone().addScaledVector(d, s * 0.45)); if (j % 2 === 0) L.seg(c, arc[j], 0.7, 0.6) }
        L.poly(arc, false, 0.75, 1) } }
    if (kind === 'forest') { brokenBase(THREE, L, C, s * 0.4, 0, 0.1, rnd);
      const trunk = new THREE.CylinderGeometry(s * 0.04, s * 0.07, s * 0.6, 6), tm = new THREE.Matrix4().makeTranslation(0, s * 0.3, 0); C.add(trunk, tm, 0.2); L.edges(trunk, 0.4, 1, null, tm);
      for (let i = 0; i < 3; i++) L.poly(SPFX.circle(s * 0.075, 12, s * (0.1 + i * 0.15)), true, 0.9, 1.3);
      for (let i = 0; i < 6; i++) { const r = s * (0.18 + 0.1 * rnd()), c = new THREE.Vector3((rnd() - 0.5) * s * 0.5, s * (0.65 + 0.35 * rnd()), (rnd() - 0.5) * s * 0.5), g = new THREE.IcosahedronGeometry(r, 0), m = new THREE.Matrix4().makeTranslation(c.x, c.y, c.z);
        C.add(g, m, 0.45); L.edges(g, 0.6 + 0.3 * rnd(), 1, null, m) } }
    const lm = k.lm({ width: lw, maxPx: 5 }), cm = k.cm({ ca: 0.3, cs: s * 0.06, core: '#06050a' }); grp.add(C.mesh(cm), L.mesh(lm));
    return { group: grp, k, update(t, bt) { spin(t); lm.uniforms.uGain.value = 1 + 0.4 * bt.k } };
  };
})(window);
