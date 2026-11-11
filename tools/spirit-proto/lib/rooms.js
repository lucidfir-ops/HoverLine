/* Spirit realm prototype, effects library, part 3: rooms (6) and the seam between them (54, 66).
   A room is a distinct enclosed realm the road passes through, built in the road's frame at its entrance (local +Z
   along the road, +Y up, X across), so a straight stretch of road holds it. Each returns { group, update(t, beat), len }.
   SPFX.room.lattice  (7)  a hall whose walls are a lattice of light, with lattice bodies hanging in it
   SPFX.room.mural    (8)  a tunnel of ribs carrying mirrored bands, ending in a symmetric mandala wall
   SPFX.room.bloom    (9)  a tunnel of rings leading to the chrysanthemum at the vanishing point
   SPFX.room.portal   (54) the ring on the road where one room ends and the next begins, with a swirl inside */
(function (root) {
  const SPFX = root.SPFX, R = SPFX.room = {};
  function kit(THREE, o) { const pal = o.palU || SPFX.newPal(o.pal || 'goldViolet');
    return { pal, lm: (x = {}) => SPFX.lineMat({ pal, ...x }), cm: (x = {}) => SPFX.coreMat({ pal, ...x }), setPal(p) { SPFX.setPal(pal, p) } } }

  /* ---------- 7: the lattice hall ---------- */
  R.lattice = function (THREE, o = {}) {
    const k = kit(THREE, { pal: o.pal || 'cyanMagenta' }), len = o.len || 700, hw = o.hw || 90, yb = o.yb || -50, yt = o.yt || 80, sp = o.sp || 18;
    const clx = o.clx || 24, cly = o.cly || 22, rnd = SPFX.rng(o.seed || 7), grp = new THREE.Group(), L = SPFX.Lines(), G = SPFX.Lines();
    const inside = (x, y) => Math.abs(x) < clx && y > -12 && y < cly; // the road's clear tube
    const nx = Math.round(2 * hw / sp), ny = Math.round((yt - yb) / sp), nz = Math.round(len / sp);
    const P = (i, j, kk) => new THREE.Vector3(-hw + i * sp, yb + j * sp, kk * sp);
    const pc = (p) => 0.15 + (p.y - yb) / (yt - yb) * 0.7;
    for (let i = 0; i <= nx; i++) for (let j = 0; j <= ny; j++) for (let kk = 0; kk <= nz; kk++) { const a = P(i, j, kk); if (inside(a.x, a.y)) continue;
      const beam = (i % 3 === 0 && j % 3 === 0) || (j % 3 === 0 && kk % 3 === 0) || (i % 3 === 0 && kk % 3 === 0);
      for (const [di, dj, dk] of [[1, 0, 0], [0, 1, 0], [0, 0, 1]]) { if (i + di > nx || j + dj > ny || kk + dk > nz) continue; const b = P(i + di, j + dj, kk + dk); if (inside(b.x, b.y)) continue;
        (beam ? L : G).seg(a, b, pc, beam ? 1 : 0.55) }
      if ((i + j + kk) % 2 === 0 && i < nx && j < ny && kk < nz) { const c = P(i + 0.5, j + 0.5, kk + 0.5); if (!inside(c.x, c.y) && rnd() < 0.35)
        for (const d of [[0, 0, 0], [1, 1, 0], [1, 0, 1], [0, 1, 1]]) { const q = P(i + d[0], j + d[1], kk + d[2]); if (!inside(q.x, q.y)) G.seg(c, q, (p) => pc(p) + 0.3, 0.4) } } }
    const lmB = k.lm({ width: 0.35, minPx: 1.6, maxPx: 5 }), lmG = k.lm({ width: 0.2, minPx: 1.2, maxPx: 3, gain: 0.7 });
    grp.add(L.mesh(lmB), G.mesh(lmG));
    // light packets running along the beams: short bright segments moved each frame
    const pk = SPFX.Lines(), packets = [];
    for (let n = 0; n < 160; n++) { const i = 3 * Math.floor(rnd() * (nx / 3 + 1)), j = 3 * Math.floor(rnd() * (ny / 3 + 1)); const x = -hw + i * sp, y = yb + j * sp; if (inside(x, y)) continue;
      packets.push({ x, y, z: rnd() * len, v: (rnd() < 0.5 ? -1 : 1) * (30 + rnd() * 60) }); pk.seg([0, 0, 0], [0, 0, 1], 0.95, 1.6) }
    const pg = pk.geometry(), pm = new THREE.Mesh(pg, k.lm({ width: 0.6, minPx: 2, maxPx: 6 })); pm.frustumCulled = false; grp.add(pm);
    // lattice bodies: dark translucent cores, bright edges, an inner nested copy and an inner grid
    const bodies = [], shapes = [(r) => new THREE.IcosahedronGeometry(r, 0), (r) => new THREE.OctahedronGeometry(r), (r) => new THREE.DodecahedronGeometry(r), (r) => new THREE.BoxGeometry(r * 1.3, r * 1.3, r * 1.3)];
    for (let n = 0; n < (o.bodies || 9); n++) { const r = 6 + rnd() * 10, side = n % 2 ? 1 : -1, geo = shapes[n % 4](r), b = new THREE.Group();
      b.add(SPFX.Cores().add(geo, null, 0).mesh(k.cm({ ca: 0.5, cs: r * 0.15, cy: 0.02, opacity: 0.72, core: '#04030a' })));
      const BL = SPFX.Lines().edges(geo, 0.2 + rnd() * 0.3, 1.2); BL.edges(shapes[(n + 1) % 4](r * 0.5), 0.75, 0.9);
      for (let g = -2; g <= 2; g++) { BL.seg([g * r * 0.25, -r * 0.6, 0], [g * r * 0.25, r * 0.6, 0], 0.6, 0.35); BL.seg([-r * 0.6, g * r * 0.25, 0], [r * 0.6, g * r * 0.25, 0], 0.6, 0.35) }
      b.add(BL.mesh(k.lm({ width: r * 0.025, maxPx: 6 })));
      b.position.set(side * (clx + 8 + rnd() * 40), -5 + rnd() * 50, 60 + n * (len - 120) / (o.bodies || 9)); grp.add(b); bodies.push({ b, sp: 0.2 + rnd() * 0.4, ph: rnd() * 6 }) }
    // the far wall: a lattice plane with a square gate where the road leaves
    return { group: grp, k, len, update(t, bt) {
        const pa = pg.attributes.pa, pb = pg.attributes.pb;
        packets.forEach((p, i) => { const z = ((p.z + p.v * t) % len + len) % len, z2 = z + Math.sign(p.v) * 6; for (let q = 0; q < 4; q++) { pa.setXYZ(i * 4 + q, p.x, p.y, z); pb.setXYZ(i * 4 + q, p.x, p.y, z2) } });
        pa.needsUpdate = pb.needsUpdate = true;
        bodies.forEach((x) => { x.b.rotation.set(t * x.sp * 0.5, t * x.sp + x.ph, 0); x.b.scale.setScalar(1 + 0.04 * bt.k) });
        lmB.uniforms.uGain.value = 0.9 + 0.35 * bt.k + 0.6 * bt.drop; lmG.uniforms.uGain.value = 0.55 + 0.2 * bt.k } };
  };

  /* ---------- 8: the mural tunnel and its mandala wall ---------- */
  // a mirrored motif: random polylines in one wedge (0..a, r0..r1), mirrored and repeated n times round
  function motif(THREE, L, n, r0, r1, z, rnd, pc, pk, depth) { const a = Math.PI / n; const lines = [];
    for (let m = 0; m < 4 + Math.floor(rnd() * 3); m++) { const pts = [], steps = 2 + Math.floor(rnd() * 3); for (let s = 0; s <= steps; s++) pts.push([r0 + (r1 - r0) * rnd(), a * rnd()]); lines.push(pts) }
    if (rnd() < 0.6) lines.push([[r0 + (r1 - r0) * 0.5, 0], [r0 + (r1 - r0) * 0.5, a]]);
    for (let i = 0; i < n; i++) for (const mirror of [1, -1]) { const base = i * 2 * a;
      for (const pl of lines) L.poly(pl.map(([r, an]) => { const g = base + mirror * an; return new THREE.Vector3(Math.cos(g) * r, Math.sin(g) * r, z + (depth ? depth * Math.sin(r * 0.05) : 0)) }), false, pc, pk) } }
  R.mural = function (THREE, o = {}) {
    const k = kit(THREE, { pal: o.pal || 'goldViolet' }), len = o.len || 700, rad = o.rad || 60, rnd = SPFX.rng(o.seed || 8), grp = new THREE.Group();
    // the tunnel: ribs every 28 m (polygonal rings with a mirrored band each), long rails between them
    const T = SPFX.Lines(), sides = 16, ribs = [];
    for (let z = 20; z < len; z += 28) { const ring = SPFX.circleXY(rad, sides, Math.PI / sides).map((p) => p.setZ(z)); T.poly(ring, true, 0.1 + (z / len) * 0.3, 1.2);
      T.poly(SPFX.circleXY(rad * 0.9, sides, 0).map((p) => p.setZ(z)), true, 0.6, 0.7);
      for (let i = 0; i < sides; i++) T.seg(ring[i], SPFX.circleXY(rad * 0.9, sides, 0)[i].setZ(z), 0.5, 0.6);
      if (z + 28 < len) for (let i = 0; i < sides; i += 2) T.seg(ring[i], ring[i].clone().setZ(z + 28), 0.35, 0.45) }
    // a mirrored band on each rib's inner face (a temple map seen from inside)
    const B = SPFX.Lines(); let zi = 0; for (let z = 20; z < len; z += 56, zi++) motif(THREE, B, 8, rad * 0.6, rad * 0.9, z + 0.2, SPFX.rng(80 + zi), 0.75, 0.8, 0);
    const lmT = k.lm({ width: 0.4, minPx: 1.6, maxPx: 6 }), lmB = k.lm({ width: 0.25, minPx: 1.3, maxPx: 4, gain: 0.8 }); grp.add(T.mesh(lmT), B.mesh(lmB));
    // the mandala wall ahead: layers of mirrored bands at different symmetries, turning against each other
    const wall = new THREE.Group(); wall.position.z = len + (o.wallDist || 500); grp.add(wall); const layers = [], W = o.wallR || 520;
    const syms = [8, 16, 12, 24, 8, 32];
    for (let i = 0; i < syms.length; i++) { const L = SPFX.Lines(), r0 = W * (0.06 + i * 0.155), r1 = W * (0.06 + (i + 1) * 0.155);
      motif(THREE, L, syms[i], r0, r1, 0, SPFX.rng(200 + i * 7), 0.1 + i * 0.16, 1, 0); L.poly(SPFX.circleXY(r1, 128), true, 0.1 + i * 0.16 + 0.1, 1.3);
      const m = L.mesh(k.lm({ width: W * 0.0025, minPx: 1.6, maxPx: 5 })); const g = new THREE.Group(); g.add(m); wall.add(g); layers.push(g) }
    const core = SPFX.Lines(); for (let i = 0; i < 48; i++) { const a = i / 48 * Math.PI * 2; core.seg([0, 0, 1], [Math.cos(a) * W * 0.06, Math.sin(a) * W * 0.06, 1], 0.98, 1.5) }
    const cm = core.mesh(k.lm({ width: W * 0.004, maxPx: 6 })); wall.add(cm);
    return { group: grp, k, len, update(t, bt) { layers.forEach((g, i) => { g.rotation.z = (i % 2 ? -1 : 1) * t * 0.05 * (1 + i * 0.3) + (o.tick ? Math.floor(bt.b) * 0.02 * (i % 2 ? -1 : 1) : 0); g.children[0].material.uniforms.uGain.value = 0.8 + 0.5 * (bt.bb === i % 4 ? bt.k : 0) + 0.6 * bt.drop });
        cm.material.uniforms.uGain.value = 1.4 + bt.k; lmT.uniforms.uGain.value = 0.9 + 0.4 * bt.k; lmB.uniforms.uShift.value = t * 0.05 } };
  };

  /* ---------- 9: the chrysanthemum at the vanishing point, and a ring tunnel into it (11) ---------- */
  R.chrysanthemum = function (THREE, o = {}) { // the flower alone: layers of petals, each turning the other way, a white-hot centre
    const k = kit(THREE, { pal: o.pal || 'emberWhite' }), Rr = o.size || 400, grp = new THREE.Group(), layers = [];
    const petal = (L, a, r0, r1, w, pc) => { const n = 7, pts = []; for (let i = 0; i <= n; i++) { const f = i / n, r = r0 + (r1 - r0) * f, ww = w * Math.sin(Math.PI * f) * (1 - 0.3 * f); pts.push([r, ww]) }
      const P = (r, off) => new THREE.Vector3(Math.cos(a) * r - Math.sin(a) * off, Math.sin(a) * r + Math.cos(a) * off, 0);
      L.poly(pts.map(([r, ww]) => P(r, ww)), false, pc, 1); L.poly(pts.map(([r, ww]) => P(r, -ww)), false, pc, 1); L.seg(P(r0, 0), P(r1 * 0.92, 0), pc + 0.3, 0.5) };
    const nL = o.layers || 7;
    for (let i = 0; i < nL; i++) { const L = SPFX.Lines(), n = 10 + i * 4, r0 = Rr * (0.05 + i * 0.12), r1 = Rr * (0.2 + i * 0.13), pc = 0.95 - i / nL * 0.85;
      for (let j = 0; j < n; j++) petal(L, (j + (i % 2) * 0.5) / n * Math.PI * 2, r0, r1, (r1 - r0) * Math.PI / n * 1.6, pc);
      const g = new THREE.Group(); g.add(L.mesh(k.lm({ width: Rr * 0.0022, minPx: 1.6, maxPx: 5 }))); g.position.z = -i * Rr * 0.02; grp.add(g); layers.push(g) }
    const hot = SPFX.Lines(); for (let i = 0; i < 64; i++) { const a = i / 64 * Math.PI * 2; hot.seg([0, 0, 2], [Math.cos(a) * Rr * 0.07, Math.sin(a) * Rr * 0.07, 2], 1, 2) } hot.poly(SPFX.circleXY(Rr * 0.03, 24).map((p) => p.setZ(2)), true, 1, 2);
    const hm = hot.mesh(k.lm({ width: Rr * 0.006, minPx: 2, maxPx: 8 })); grp.add(hm);
    return { group: grp, k, update(t, bt) { layers.forEach((g, i) => { g.rotation.z = (i % 2 ? -1 : 1) * t * (0.04 + 0.025 * i); const br = 1 + 0.06 * bt.breath * (i / nL) + 0.04 * bt.k * (1 - i / nL); g.scale.setScalar(br);
        g.children[0].material.uniforms.uGain.value = 0.75 + 0.5 * Math.max(0, Math.cos((bt.b * 0.5 - i) * 0.9)) * bt.k + 0.7 * bt.drop });
      hm.material.uniforms.uGain.value = 1.6 + 1.2 * bt.k + bt.drop; hm.rotation.z = t * 0.5 } };
  };
  R.bloom = function (THREE, o = {}) {
    const k = kit(THREE, { pal: o.pal || 'emberWhite' }), len = o.len || 700, rad = o.rad || 26, grp = new THREE.Group(), rings = [];
    const L = SPFX.Lines(); let n = 0;
    for (let z = 15; z < len; z += 15, n++) { const hex = SPFX.circleXY(rad + (n % 2) * 3, 6, n * 0.12).map((p) => p.setZ(z)), pc = (z / len) * 2;
      L.poly(hex, true, pc, n % 4 === 0 ? 1.5 : 0.8); if (n % 2 === 0) for (let i = 0; i < 6; i++) L.seg(hex[i], hex[i].clone().multiplyScalar(1.25).setZ(z), pc + 0.2, 0.7) }
    const lm = k.lm({ width: 0.45, minPx: 1.6, maxPx: 7 }); const tun = L.mesh(lm); grp.add(tun);
    const flower = R.chrysanthemum(THREE, { palU: k.pal, size: o.size || 420 }); grp.add(flower.group);
    return { group: grp, k, len, flower, update(t, bt) { flower.update(t, bt); lm.uniforms.uShift.value = -t * 0.35; lm.uniforms.uGain.value = 0.9 + 0.6 * bt.k + 0.5 * bt.drop;
        // the flower stays at the vanishing point: a fixed distance ahead of the camera, in the room's frame
        if (o.camera) { const c = o.camera.position.clone(); grp.worldToLocal(c); flower.group.position.set(0, 18, Math.max(len * 0.5, c.z + (o.ahead || 900))) } } };
  };

  /* ---------- 54: the portal ring on the road, a seam between rooms, with a swirl (view a) ---------- */
  R.portal = function (THREE, o = {}) {
    const k = kit(THREE, { pal: o.pal || 'iceViolet' }), r = o.r || 22, grp = new THREE.Group(), L = SPFX.Lines();
    for (let i = 0; i < 3; i++) L.poly(SPFX.circleXY(r + i * 1.4, 96), true, 0.1 + i * 0.3, 1.4 - i * 0.3);
    for (let i = 0; i < 24; i++) { const a = i / 24 * Math.PI * 2; L.seg([Math.cos(a) * r, Math.sin(a) * r, 0], [Math.cos(a) * (r + 4.5), Math.sin(a) * (r + 4.5), 0], 0.8, i % 3 ? 0.5 : 1.2) }
    const rm = L.mesh(k.lm({ width: 0.5, minPx: 2, maxPx: 8 })); grp.add(rm);
    const S = SPFX.Lines(); for (let arm = 0; arm < 6; arm++) { const pts = []; for (let i = 0; i <= 40; i++) { const f = i / 40, a = arm / 6 * Math.PI * 2 + f * 5; pts.push(new THREE.Vector3(Math.cos(a) * r * f, Math.sin(a) * r * f, -0.2)) } S.poly(pts, false, (p) => p.length() / r, 1) }
    const sk = o.swirlPal ? SPFX.newPal(o.swirlPal) : k.pal;
    const sw = S.mesh(SPFX.lineMat({ pal: sk, width: 0.35, minPx: 1.6, maxPx: 5 })); grp.add(sw);
    const disc = new THREE.Mesh(new THREE.CircleGeometry(r, 48), new THREE.MeshBasicMaterial({ color: 0x050310 })); disc.position.z = -0.4; grp.add(disc);
    return { group: grp, k, update(t, bt) { sw.rotation.z = -t * 2.2; rm.rotation.z = t * 0.3; rm.material.uniforms.uGain.value = 1.1 + 0.6 * bt.k; sw.material.uniforms.uGain.value = 1 + 0.5 * bt.k } };
  };
})(window);
