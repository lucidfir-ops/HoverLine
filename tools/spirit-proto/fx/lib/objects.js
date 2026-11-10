/* Spirit realm prototype, effects library, part 2: the objects. Each is SPFX.obj.<name>(THREE, opts) and returns
   { group, update(t, beat), mats } where beat is SPFX.Beat's output. Sizes are in metres; every object takes
   opts.pal (a palette name) and opts.size. Cost per object is in the README (tools/spirit-proto/fx/README.md). */
(function (root) {
  const SPFX = root.SPFX; const O = SPFX.obj = {};
  const ease = SPFX.ease, easeIO = SPFX.easeIO;

  // common: a palette uniform of its own (so each object can be shown in its own palette) and its materials
  function kit(THREE, o) {
    const pal = o.palU || SPFX.newPal(o.pal || 'goldViolet');
    const lm = (x = {}) => SPFX.lineMat({ pal, width: o.width, ...x }), cm = (x = {}) => SPFX.coreMat({ pal, ...x });
    return { pal, lm, cm, setPal(p) { SPFX.setPal(pal, p) } };
  }
  const v3 = (THREE, a) => new THREE.Vector3(a[0], a[1], a[2]);

  /* Breathing (2, 42): an envelope for any object. mode 'scale' (the object swells and shrinks), 'swell' (lines get
     bolder and brighter) or both. amt 0.03 is subtle, 0.12 strong. In time with the music: one breath per 2 bars,
     with a small push on each kick. */
  SPFX.breathe = function (obj, amt = 0.05, o = {}) {
    const base = obj.group.scale.clone(), mats = [];
    obj.group.traverse((m) => { if (m.material && m.material.uniforms && m.material.uniforms.uSwell) mats.push(m.material) });
    const up = obj.update;
    obj.update = function (t, bt, dt) { if (up) up.call(obj, t, bt, dt);
      const A = typeof amt === 'function' ? amt(t) : amt, s = A * (bt.breath * 0.8 + (o.kick == null ? 0.35 : o.kick) * bt.k + (o.drop || 0.6) * bt.drop);
      if (o.scale !== false) obj.group.scale.copy(base).multiplyScalar(1 + s);
      for (const m of mats) m.uniforms.uSwell.value = Math.max(0.3, 1 + s * (o.swell == null ? 4 : o.swell)) };
    return obj;
  };

  /* ---------- a lone solid: core with contour bands and bold edges ---------- */
  O.solid = function (THREE, o = {}) {
    const k = kit(THREE, o), size = o.size || 10;
    const geo = (o.geo || ((s) => new THREE.IcosahedronGeometry(s, 0)))(size);
    const g = SPFX.solid(geo, { pal: k.pal, width: o.width || size * 0.012, cs: o.cs || size * 0.12, ca: o.ca == null ? 0.5 : o.ca, cy: 0, pcSpan: o.pcSpan || 1, maxPx: o.maxPx || 6 });
    const grp = new THREE.Group(); grp.add(g); const spin = o.spin || [0.13, 0.21, 0.07];
    return { group: grp, k, update(t, bt) { g.rotation.set(t * spin[0], t * spin[1], t * spin[2]); g.userData.lm.uniforms.uGain.value = 1 + 0.5 * bt.k * (o.beat == null ? 1 : o.beat) } };
  };

  /* ---------- star field and planes of light (34, 38): the void's only reference ---------- */
  O.stars = function (THREE, o = {}) {
    const k = kit(THREE, o), n = o.n || 1500, R = o.r || 2500, r = SPFX.rng(o.seed || 5), L = SPFX.Lines();
    for (let i = 0; i < n; i++) { const u = r() * 2 - 1, a = r() * Math.PI * 2, s = Math.sqrt(1 - u * u), d = R * (0.6 + 0.4 * r());
      const p = new THREE.Vector3(s * Math.cos(a) * d, u * d, s * Math.sin(a) * d), q = p.clone().multiplyScalar(1.0008); L.seg(p, q, r(), 0.4 + 0.8 * r()) }
    const m = L.mesh(k.lm({ width: 1.6, minPx: 1.3, maxPx: 2.6, gain: 0.8 })); const grp = new THREE.Group(); grp.add(m);
    return { group: grp, k, update(t, bt) { if (o.follow) grp.position.copy(o.follow.position) } };
  };
  O.grids = function (THREE, o = {}) {
    const k = kit(THREE, o), S = o.span || 900, st = o.step || 40, L = SPFX.Lines(), ys = o.ys || [-90, 160];
    for (const y of ys) for (let x = -S; x <= S; x += st) { L.seg([x, y, -S], [x, y, S], (y > 0 ? 0.7 : 0.1) + x / S * 0.1, 0.5); L.seg([-S, y, x], [S, y, x], (y > 0 ? 0.75 : 0.15) + x / S * 0.1, 0.5) }
    const lm = k.lm({ width: 0.3, minPx: 1.2, maxPx: 2.5, gain: 0.6, fog: o.fog || [120, 700] }); const m = L.mesh(lm); const grp = new THREE.Group(); grp.add(m);
    return { group: grp, k, mats: [lm], update(t, bt) { if (o.follow) { grp.position.x = Math.round(o.follow.position.x / st) * st; grp.position.z = Math.round(o.follow.position.z / st) * st; grp.position.y = o.follow.position.y * 0 } } };
  };

  /* ---------- neon road edges and lane lines along the game's road (40, 42) ---------- */
  O.roadLines = function (THREE, o = {}) {
    const k = kit(THREE, o), ST = SPFX.stage, T = ST.T, W = ST.c.W, L = SPFX.Lines(), u0 = o.u0, u1 = o.u1, step = 4;
    const lanes = o.lanes || [-1, 1];
    for (let u = u0; u < u1; u += step) { const a = ST.c.sampleAt(u), b = ST.c.sampleAt(u + step);
      for (const f of lanes) { const pa = a.p.clone().addScaledVector(a.r, f * (W / 2 - 0.4)).addScaledVector(a.u, 0.12), pb = b.p.clone().addScaledVector(b.r, f * (W / 2 - 0.4)).addScaledVector(b.u, 0.12);
        L.seg(pa, pb, (Math.abs(f) > 0.9 ? 0.05 : 0.6 + f * 0.2) + u * 0.0006, Math.abs(f) > 0.9 ? 1.2 : 0.6) } }
    const lm = k.lm({ width: o.width || 0.32, minPx: 1.5, maxPx: 9 }); const grp = new THREE.Group(); grp.add(L.mesh(lm));
    return { group: grp, k, update() {} };
  };

  /* ---------- 14 sacred geometry ---------- */
  const PHI = (1 + Math.sqrt(5)) / 2;
  O.platonic = function (THREE, o = {}) { // the five solids in a turning ring; each lights on its beat
    const k = kit(THREE, o), s = o.size || 6, grp = new THREE.Group(), items = [];
    const G = [new THREE.TetrahedronGeometry(s), new THREE.BoxGeometry(s * 1.15, s * 1.15, s * 1.15), new THREE.OctahedronGeometry(s), new THREE.DodecahedronGeometry(s), new THREE.IcosahedronGeometry(s)];
    G.forEach((geo, i) => { const g = SPFX.solid(geo, { pal: k.pal, width: s * 0.03, cs: s * 0.18, ca: 0.45, pc0: i / 5, pcSpan: 0.5 }); const a = i / 5 * Math.PI * 2;
      const h = new THREE.Group(); h.add(g); h.position.set(Math.cos(a) * s * 3.2, Math.sin(a) * s * 3.2, 0); grp.add(h); items.push(g) });
    return { group: grp, k, update(t, bt) { grp.rotation.z = t * 0.12; items.forEach((g, i) => { g.rotation.set(t * 0.4 + i, t * 0.6 + i * 2, 0); const on = bt.bb === i % 4 || (i === 4 && bt.bars % 2 === 1 && bt.bb === 0);
      g.userData.lm.uniforms.uGain.value = 0.8 + (on ? 1.2 * bt.k : 0) + bt.drop; g.scale.setScalar(1 + (on ? 0.12 * bt.k : 0)) }) } };
  };
  O.nested = function (THREE, o = {}) { // nested polyhedra turning against each other (Kepler-like nesting)
    const k = kit(THREE, o), s = o.size || 20, grp = new THREE.Group(), layers = [];
    const G = [(r) => new THREE.OctahedronGeometry(r), (r) => new THREE.BoxGeometry(r * 1.15, r * 1.15, r * 1.15), (r) => new THREE.TetrahedronGeometry(r), (r) => new THREE.DodecahedronGeometry(r), (r) => new THREE.IcosahedronGeometry(r)];
    const rs = [0.22, 0.38, 0.55, 0.75, 1.0];
    G.forEach((f, i) => { const g = SPFX.solid(f(s * rs[i]), { pal: k.pal, width: s * 0.006 * (1 + i * 0.3), cs: s * 0.06, ca: i === 0 ? 0.6 : 0, core: i === 0, pc0: i * 0.22, pcSpan: 0.4, maxPx: 5 }); grp.add(g); layers.push(g) });
    return { group: grp, k, update(t, bt) { layers.forEach((g, i) => { const d = i % 2 ? -1 : 1, st = bt.step + bt.ph; g.rotation.set(d * t * 0.11 * (i + 1), d * (t * 0.17 + Math.floor(st / 4 + i) * 0.0), t * 0.05 * i);
      const pulse = Math.max(0, 1 - Math.abs(((bt.b % 8) / 8 * 5) - i) * 1.2); g.userData.lm.uniforms.uGain.value = 0.7 + 0.9 * pulse + 0.8 * bt.drop }) } };
  };
  // flower of life: 19 circles (with the outer ring) drawn in on the beat, then the Metatron lines between 13 centres
  O.flower = function (THREE, o = {}) {
    const k = kit(THREE, o), R = o.size || 20, r = R / 3, grp = new THREE.Group();
    const centres = [[0, 0]]; for (let ring = 1; ring <= 2; ring++) for (let i = 0; i < 6 * ring; i++) { const side = Math.floor(i / ring), f = i % ring;
      const a0 = side * Math.PI / 3, a1 = (side + 1) * Math.PI / 3; const p0 = [Math.cos(a0) * ring * r, Math.sin(a0) * ring * r], p1 = [Math.cos(a1) * ring * r, Math.sin(a1) * ring * r];
      centres.push([p0[0] + (p1[0] - p0[0]) * f / ring, p0[1] + (p1[1] - p0[1]) * f / ring]) }
    const circles = centres.map(([x, y], i) => { const L = SPFX.Lines(); L.poly(SPFX.circleXY(r, 72, 0, x, y), true, (p) => 0.15 + Math.hypot(p.x, p.y) / R * 0.7, 1);
      const m = L.mesh(k.lm({ width: R * 0.004, minPx: 1.4, maxPx: 4 })); grp.add(m); return m });
    const outer = SPFX.Lines(); outer.poly(SPFX.circleXY(3 * r, 120), true, 0.95, 1.2); outer.poly(SPFX.circleXY(3 * r * 1.04, 120), true, 0.9, 0.8); const om = outer.mesh(k.lm({ width: R * 0.006, maxPx: 5 })); grp.add(om);
    // Metatron: the 13 centres of the fruit of life (centre, 6 at 2r, 6 at 2r*sqrt3... approximated by the 13 nearest), all joined
    const M = SPFX.Lines(); const met = [[0, 0]]; for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3 + Math.PI / 6; met.push([Math.cos(a) * r * 1.0 * Math.sqrt(3), Math.sin(a) * r * Math.sqrt(3)]); met.push([Math.cos(a) * r * 2 * Math.sqrt(3), Math.sin(a) * r * 2 * Math.sqrt(3)]) }
    for (let i = 0; i < met.length; i++) for (let j = i + 1; j < met.length; j++) M.seg([met[i][0], met[i][1], 0.05], [met[j][0], met[j][1], 0.05], 0.55 + 0.3 * ((i + j) % 3) / 3, 0.9);
    const mm = M.mesh(k.lm({ width: R * 0.003, minPx: 1.2, maxPx: 3 })); grp.add(mm);
    return { group: grp, k, update(t, bt) { const n = Math.floor(bt.b) % 32; // beat by beat: circles appear, then Metatron's lines, then all pulse
      circles.forEach((m, i) => { const on = i <= n; m.visible = on; m.material.uniforms.uGain.value = on ? (i === n ? 1 + 1.5 * bt.k : 0.8) + bt.drop : 0 });
      mm.visible = n >= 19; mm.material.uniforms.uGain.value = n >= 19 ? Math.min(1, (n - 19 + bt.ph) / 3) * (0.8 + 0.6 * bt.k) : 0;
      om.material.uniforms.uGain.value = 0.6 + 0.6 * bt.k; grp.rotation.z = t * 0.05 } };
  };
  // Metatron's cube as a solid construction: the 13 spheres as rings around nested star tetrahedra (a merkaba)
  O.merkaba = function (THREE, o = {}) {
    const k = kit(THREE, o), s = o.size || 12, grp = new THREE.Group();
    const t1 = SPFX.solid(new THREE.TetrahedronGeometry(s), { pal: k.pal, width: s * 0.02, cs: s * 0.15, ca: 0.5, pc0: 0.1, pcSpan: 0.4 });
    const t2 = SPFX.solid(new THREE.TetrahedronGeometry(s), { pal: k.pal, width: s * 0.02, cs: s * 0.15, ca: 0.5, pc0: 0.6, pcSpan: 0.4 });
    t2.rotation.set(0, Math.PI / 2, 0); const tw = new THREE.Group(); tw.add(t2); tw.rotation.x = Math.PI; const a = new THREE.Group(), b = new THREE.Group(); a.add(t1); b.add(tw); grp.add(a, b);
    const ring = SPFX.Lines(); for (let i = 0; i < 3; i++) { const pts = SPFX.circle(s * 1.25, 96); const m = new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(i * Math.PI / 3, 0, i * Math.PI / 2.5)); ring.poly(pts.map((p) => p.applyMatrix4(m)), true, 0.4 + i * 0.2, 0.9) }
    const rm = ring.mesh(k.lm({ width: s * 0.01, maxPx: 4 })); grp.add(rm);
    return { group: grp, k, update(t, bt) { a.rotation.y = t * 0.5; b.rotation.y = -t * 0.5; rm.rotation.set(t * 0.2, t * 0.3, 0); const sp = 1 + 0.15 * bt.drop; a.scale.setScalar(sp + 0.05 * bt.k); b.scale.setScalar(sp + 0.05 * bt.k) } };
  };

  /* ---------- 24 shatter and reform, 25 merge and become (pieces on the GPU: one uniform moves them all) ---------- */
  // sample a shape's surface as shard placements: returns [{p (centre), n (normal)}]
  function surfaceShards(THREE, geo, n, rnd) {
    const g = geo.index ? geo.toNonIndexed() : geo, P = g.attributes.position, tri = [], area = []; let A = 0;
    const a = new THREE.Vector3(), b = new THREE.Vector3(), c = new THREE.Vector3();
    for (let i = 0; i < P.count; i += 3) { a.fromBufferAttribute(P, i); b.fromBufferAttribute(P, i + 1); c.fromBufferAttribute(P, i + 2);
      const ar = new THREE.Vector3().crossVectors(b.clone().sub(a), c.clone().sub(a)).length() / 2; A += ar; area.push(A); tri.push([a.clone(), b.clone(), c.clone()]) }
    const out = [];
    for (let i = 0; i < n; i++) { const x = (i + rnd() * 0.999) / n * A; let j = 0; while (area[j] < x) j++; const [p, q, r] = tri[j]; let u = rnd(), v = rnd(); if (u + v > 1) { u = 1 - u; v = 1 - v }
      const pt = p.clone().addScaledVector(q.clone().sub(p), u).addScaledVector(r.clone().sub(p), v); const nn = new THREE.Vector3().crossVectors(q.clone().sub(p), r.clone().sub(p)).normalize(); out.push({ p: pt, n: nn }) }
    return out;
  }
  // a set of shards on a solid's faces: each face of the solid is split into triangles (a real shatter of that solid)
  function faceShards(THREE, geo, depth) {
    const g = geo.index ? geo.toNonIndexed() : geo, P = g.attributes.position, out = [];
    for (let i = 0; i < P.count; i += 3) { const a = new THREE.Vector3().fromBufferAttribute(P, i), b = new THREE.Vector3().fromBufferAttribute(P, i + 1), c = new THREE.Vector3().fromBufferAttribute(P, i + 2);
      const sub = (a, b, c, d) => { if (d <= 0) { out.push([a, b, c]); return } const ab = a.clone().lerp(b, 0.5), bc = b.clone().lerp(c, 0.5), ca = c.clone().lerp(a, 0.5); sub(a, ab, ca, d - 1); sub(ab, b, bc, d - 1); sub(ca, bc, c, d - 1); sub(ab, bc, ca, d - 1) };
      sub(a, b, c, depth) }
    return out;
  }
  /* shatter: a solid of N triangular shards (thin prisms) that fly out along their normals, spin, hang, and pull back.
     o.geo (a Three geometry), o.size, o.depth (subdivision: pieces = faces x 4^depth), o.fly (metres out),
     o.trigger 'drop' (bursts on the music's drop) or 'cycle' (every o.period bars). */
  O.shatter = function (THREE, o = {}) {
    const k = kit(THREE, o), s = o.size || 10, rnd = SPFX.rng(o.seed || 7), geo = (o.geo || ((r) => new THREE.IcosahedronGeometry(r, 1)))(s);
    const tris = faceShards(THREE, geo, o.depth == null ? 1 : o.depth), L = SPFX.Lines(), C = SPFX.Cores(), th = s * (o.thick || 0.06);
    for (const [a, b, c] of tris) { const cen = a.clone().add(b).add(c).divideScalar(3), n = new THREE.Vector3().crossVectors(b.clone().sub(a), c.clone().sub(a)).normalize();
      if (n.dot(cen) < 0) n.negate();
      const la = a.clone().sub(cen), lb = b.clone().sub(cen), lc = c.clone().sub(cen), d = n.clone().multiplyScalar(-th);
      const dir = n.clone().multiplyScalar(s * (o.fly || 1.4) * (0.6 + 0.8 * rnd())).add(new THREE.Vector3(rnd() - 0.5, rnd() - 0.5, rnd() - 0.5).multiplyScalar(s * 0.5));
      const pi = { home: cen.toArray(), dir: dir.toArray(), axis: [rnd() - 0.5, rnd() - 0.5, rnd() - 0.5], r: rnd() };
      const pc = 0.05 + (cen.y / s * 0.5 + 0.5) * 0.9;
      L.poly([la, lb, lc], true, pc, 1, pi); L.poly([la.clone().add(d), lb.clone().add(d), lc.clone().add(d)], true, pc, 0.35, pi);
      const tg = new THREE.BufferGeometry().setFromPoints([la, lb, lc, la.clone().add(d), lc.clone().add(d), lb.clone().add(d)]); C.add(tg, null, pc, pi) }
    const lm = k.lm({ pieces: true, width: s * (o.lw || 0.012), maxPx: o.maxPx || 5, stag: 0.5, spin: o.spin || 1.6 }), cm = k.cm({ pieces: true, ca: 0, core: '#07060c', side: THREE.DoubleSide }); SPFX.linkPieces(lm, cm);
    const grp = new THREE.Group(), inner = new THREE.Group(); inner.add(C.mesh(cm), L.mesh(lm)); grp.add(inner);
    // glow core seen through the gaps
    const hot = SPFX.Lines(); for (let i = 0; i < 3; i++) hot.poly(SPFX.circle(s * 0.35, 48).map((p) => p.applyEuler(new THREE.Euler(i, i * 2, 0))), true, 0.98, 1.6);
    const hm = hot.mesh(k.lm({ width: s * 0.02, maxPx: 6 })); grp.add(hm);
    const per = (o.period || 4) * 4; // beats per cycle
    return { group: grp, k, mats: [lm], pieces: tris.length,
      update(t, bt) { let e;
        if (o.trigger === 'drop') { const x = bt.tDrop; e = x < 0.25 ? ease(x / 0.25) : x < 2.2 ? 1 : x < 4.0 ? 1 - easeIO((x - 2.2) / 1.8) : 0; if (bt.t < 0) e = 0 }
        else { const ph = ((bt.b + (o.phase || 0) * per) % per) / per; e = ph < 0.08 ? ease(ph / 0.08) : ph < 0.45 ? 1 : ph < 0.75 ? 1 - easeIO((ph - 0.45) / 0.3) : 0 }
        lm.uniforms.uExplode.value = e; lm.uniforms.uGain.value = 1 + 0.4 * bt.k + 0.6 * e;
        inner.rotation.set(t * 0.07, t * 0.11, 0); hm.material.uniforms.uGain.value = 0.3 + 1.6 * e + 0.4 * bt.k; hm.rotation.set(t * 0.9, t * 0.6, 0) } };
  };
  /* merge and become: shards (small tetrahedra) that sit on shape A (left) and shape B (right), then all fly to shape C
     in the middle, and split again. A, B, C are geometries (default: icosahedron + torus -> torus knot). */
  O.merge = function (THREE, o = {}) {
    const k = kit(THREE, o), s = o.size || 10, rnd = SPFX.rng(o.seed || 11), n = o.n || 220;
    const gA = (o.A || ((r) => new THREE.IcosahedronGeometry(r, 0)))(s * 0.8), gB = (o.B || ((r) => new THREE.TorusGeometry(r * 0.7, r * 0.22, 8, 24)))(s), gC = (o.C || ((r) => new THREE.TorusKnotGeometry(r * 0.75, r * 0.2, 96, 8)))(s * 1.1);
    const sA = surfaceShards(THREE, gA, n >> 1, rnd), sB = surfaceShards(THREE, gB, n - (n >> 1), rnd), sC = surfaceShards(THREE, gC, n, rnd);
    const off = s * (o.apart || 1.7), L = SPFX.Lines(), C = SPFX.Cores(), sh = s * (o.shard || 0.09), tet = new THREE.TetrahedronGeometry(sh);
    const order = sC.map((q, i) => i).sort(() => rnd() - 0.5);
    const home = [...sA.map((q) => q.p.clone().add(new THREE.Vector3(-off, 0, 0))), ...sB.map((q) => q.p.clone().add(new THREE.Vector3(off, 0, 0)))];
    home.forEach((h, i) => { const tg = sC[order[i]].p, pc = i < sA.length ? 0.1 + rnd() * 0.25 : 0.65 + rnd() * 0.3;
      const pi = { home: h.toArray(), target: tg.toArray(), dir: [0, 0, 0], axis: [rnd() - 0.5, rnd() - 0.5, rnd() - 0.5], r: rnd() };
      const m = new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(rnd() * 6, rnd() * 6, rnd() * 6)).scale(new THREE.Vector3(1, 1, 1).multiplyScalar(0.7 + rnd() * 0.6));
      L.edges(tet, pc, 1, pi, m); C.add(tet, m, pc, pi) });
    const lm = k.lm({ pieces: true, width: s * 0.008, maxPx: 4, stag: 0.7, spin: 2 }), cm = k.cm({ pieces: true, ca: 0, core: '#08060e' }); SPFX.linkPieces(lm, cm);
    const grp = new THREE.Group(), inner = new THREE.Group(); inner.add(C.mesh(cm), L.mesh(lm)); grp.add(inner);
    const per = (o.period || 4) * 4;
    return { group: grp, k, mats: [lm], pieces: n,
      update(t, bt) { const ph = (bt.b % per) / per; const m = ph < 0.15 ? 0 : ph < 0.45 ? easeIO((ph - 0.15) / 0.3) : ph < 0.7 ? 1 : ph < 0.95 ? 1 - easeIO((ph - 0.7) / 0.25) : 0;
        lm.uniforms.uMorph.value = m; lm.uniforms.uGain.value = 1 + 0.5 * bt.k; inner.rotation.y = t * 0.15 } };
  };

  /* ---------- 26 unfolding solids: faces hinged on their edges ---------- */
  // a cube opens into its flat cross and folds back; built from 6 hinged faces
  O.unfoldCube = function (THREE, o = {}) {
    const k = kit(THREE, o), s = o.size || 8, h = s / 2, grp = new THREE.Group(), lw = s * 0.018;
    const face = (pc) => { const g = new THREE.Group(); const sq = new THREE.PlaneGeometry(s, s); const cm = k.cm({ ca: 0.45, cs: s * 0.125, cy: 0.02, side: THREE.DoubleSide, core: '#07060d' });
      const m = SPFX.Cores().add(sq, null, pc).mesh(cm); const L = SPFX.Lines(); L.poly([[-h, -h, 0], [h, -h, 0], [h, h, 0], [-h, h, 0]], true, pc, 1);
      L.poly([[-h * 0.6, -h * 0.6, 0.01], [h * 0.6, -h * 0.6, 0.01], [h * 0.6, h * 0.6, 0.01], [-h * 0.6, h * 0.6, 0.01]], true, pc + 0.3, 0.6);
      L.seg([-h * 0.6, -h * 0.6, 0.01], [h * 0.6, h * 0.6, 0.01], pc + 0.4, 0.4); L.seg([h * 0.6, -h * 0.6, 0.01], [-h * 0.6, h * 0.6, 0.01], pc + 0.4, 0.4);
      g.add(m, L.mesh(k.lm({ width: lw, maxPx: 5 }))); return g };
    // base face lies in XZ at y=-h; four side faces hinge on its edges; the top hinges on the far side face
    const base = face(0.1); base.rotation.x = -Math.PI / 2; const root = new THREE.Group(); root.position.y = -h; root.add(base); grp.add(root);
    const hinges = [];
    const mk = (pos, rotY, pc) => { const hg = new THREE.Group(); hg.position.copy(pos); hg.rotation.y = rotY; const f = face(pc); f.position.set(0, h, 0); const piv = new THREE.Group(); piv.add(f); hg.add(piv); root.add(hg); hinges.push(piv); return piv };
    const pN = mk(new THREE.Vector3(0, 0, -h), 0, 0.3), pS = mk(new THREE.Vector3(0, 0, h), Math.PI, 0.45), pE = mk(new THREE.Vector3(h, 0, 0), -Math.PI / 2, 0.6), pW = mk(new THREE.Vector3(-h, 0, 0), Math.PI / 2, 0.75);
    // the top hangs off the north face's top edge
    const th = new THREE.Group(); th.position.set(0, s, 0); const tp = new THREE.Group(); const tf = face(0.95); tf.position.set(0, 0, h); tf.rotation.x = Math.PI / 2; tp.add(tf); th.add(tp); pN.children[0].add(th); th.position.set(0, h, 0);
    hinges.push(tp);
    return { group: grp, k, update(t, bt) { const per = 16, ph = (bt.b % per) / per; // fold in steps on the beat
        const st = Math.floor(bt.b % per), q = (x) => SPFX.ease(x);
        const open = ph < 0.4 ? q(ph / 0.4) : ph < 0.6 ? 1 : 1 - q((ph - 0.6) / 0.4);
        const a = (1 - open) * Math.PI / 2; // 90 degrees closed, 0 open flat (faces stand up from the base when closed)
        hinges[0].rotation.x = -a; hinges[1].rotation.x = -a; hinges[2].rotation.x = -a; hinges[3].rotation.x = -a; hinges[4].rotation.x = -(1 - open) * Math.PI / 2 * 0 + (-(1 - open) * Math.PI / 2);
        grp.rotation.set(-0.5 + 0.4 * open, t * 0.25, 0); grp.position.y = 0 } };
  };
  // a dodecahedron-like flower: 12 pentagons, one at the base, 5 petals hinged on it, 5 on those, and the crown
  O.unfoldFlower = function (THREE, o = {}) {
    const k = kit(THREE, o), s = o.size || 8, grp = new THREE.Group(), lw = s * 0.02;
    const R = s / (2 * Math.sin(Math.PI / 5)); // circumradius of a pentagon with side s
    const apo = R * Math.cos(Math.PI / 5);
    const pent = (pc, lift = 0) => { const g = new THREE.Group(); const pts = Array.from({ length: 5 }, (_, i) => new THREE.Vector3(R * Math.cos(i * 2 * Math.PI / 5 + Math.PI / 2), R * Math.sin(i * 2 * Math.PI / 5 + Math.PI / 2), 0));
      const shp = new THREE.Shape(pts.map((p) => new THREE.Vector2(p.x, p.y))); const geo = new THREE.ShapeGeometry(shp);
      g.add(SPFX.Cores().add(geo, null, pc).mesh(k.cm({ ca: 0.5, cs: s * 0.14, cy: 0.03, side: THREE.DoubleSide, core: '#07050c' })));
      const L = SPFX.Lines(); L.poly(pts, true, pc, 1); L.poly(pts.map((p) => p.clone().multiplyScalar(0.55)), true, pc + 0.35, 0.7);
      for (let i = 0; i < 5; i++) L.seg(pts[i].clone().multiplyScalar(0.55), pts[(i + 2) % 5].clone().multiplyScalar(0.55), pc + 0.5, 0.5);
      g.add(L.mesh(k.lm({ width: lw, maxPx: 5 }))); return g };
    // dihedral angle of the dodecahedron: 116.565 deg; a petal folded up by (180 - 116.565)
    const fold = Math.PI - 2.0344;
    const base = pent(0.05); grp.add(base); const petals = [], outer = [];
    for (let i = 0; i < 5; i++) { const a = i * 2 * Math.PI / 5 + Math.PI / 2 + Math.PI / 5; // edge midpoint direction
      const hinge = new THREE.Group(); hinge.rotation.z = a - Math.PI / 2; const off = new THREE.Group(); off.position.y = apo; hinge.add(off); const piv = new THREE.Group(); off.add(piv);
      const p = pent(0.3 + i * 0.04); p.position.y = apo; p.rotation.z = Math.PI; const pw = new THREE.Group(); pw.add(p); piv.add(pw); base.add(hinge); petals.push(piv);
      // second ring: a pentagon on the petal's far edge (two edges out)
      const h2 = new THREE.Group(); h2.position.y = apo; p.add(h2); h2.rotation.z = Math.PI + 2 * Math.PI / 5; const o2 = new THREE.Group(); o2.position.y = apo; h2.add(o2); const piv2 = new THREE.Group(); o2.add(piv2);
      const q = pent(0.62 + i * 0.05); q.position.y = apo; q.rotation.z = Math.PI; piv2.add(q); outer.push(piv2) }
    return { group: grp, k, update(t, bt) { const per = 16, ph = (bt.b % per) / per; const open = ph < 0.35 ? SPFX.easeIO(ph / 0.35) : ph < 0.55 ? 1 : ph < 0.9 ? 1 - SPFX.easeIO((ph - 0.55) / 0.35) : 0;
        const a = (1 - open) * fold; petals.forEach((p) => p.rotation.x = a); outer.forEach((p) => p.rotation.x = a);
        grp.rotation.set(-Math.PI / 2 + 0.5, 0, t * 0.2); base.children.forEach(() => {}) } };
  };

  /* ---------- 27 gyroscopes: nested rings on different axes round a glowing core ---------- */
  O.gyro = function (THREE, o = {}) {
    const k = kit(THREE, o), s = o.size || 20, n = o.rings || 5, grp = new THREE.Group(), rings = [];
    for (let i = 0; i < n; i++) { const r = s * (0.45 + 0.55 * (i + 1) / n), L = SPFX.Lines(), pc = 0.1 + 0.8 * i / Math.max(1, n - 1);
      L.poly(SPFX.circle(r, 96), true, pc, 1.1); L.poly(SPFX.circle(r * 0.94, 96), true, pc, 0.45);
      for (let j = 0; j < 24; j++) { const a = j / 24 * Math.PI * 2, c = Math.cos(a), si = Math.sin(a); L.seg([c * r * 0.94, 0, si * r * 0.94], [c * r, 0, si * r], pc + 0.1, j % 6 ? 0.5 : 1.3) }
      // a band: the ring as a flat torus (core) so it hides what is behind
      const tg = new THREE.RingGeometry(r * 0.94, r, 96, 1); tg.rotateX(-Math.PI / 2);
      const m = new THREE.Group(); m.add(SPFX.Cores().add(tg, null, pc).mesh(k.cm({ ca: 0, side: THREE.DoubleSide, core: '#06050a' })), L.mesh(k.lm({ width: s * 0.006 * (1 + i * 0.2), maxPx: 6 })));
      const hold = new THREE.Group(); hold.add(m); (rings[i - 1] ? rings[i - 1].m : grp).add(hold); rings.push({ m: hold, inner: m, ax: i % 3 }) }
    const core = SPFX.solid(new THREE.OctahedronGeometry(s * 0.18), { pal: k.pal, width: s * 0.01, ca: 0.8, cs: s * 0.03, pc0: 0.95, pcSpan: 0.1 }); grp.add(core);
    const sp = o.speeds || [0.3, -0.45, 0.6, -0.8, 1.0, -1.2];
    return { group: grp, k, update(t, bt) { rings.forEach((r, i) => { const a = t * sp[i % sp.length] + (o.tick ? Math.floor(bt.b) * 0.12 * (i % 2 ? -1 : 1) + ease(Math.min(1, bt.ph * 4)) * 0.12 * (i % 2 ? -1 : 1) : 0);
        if (r.ax === 0) r.m.rotation.x = a; else if (r.ax === 1) r.m.rotation.z = a; else r.m.rotation.y = a; });
      core.rotation.y = t; core.scale.setScalar(1 + 0.25 * bt.k + 0.5 * bt.drop); core.userData.lm.uniforms.uGain.value = 1.2 + 1.5 * bt.k } };
  };

  /* ---------- 29 knots that untie: one tube drawn as strands, morphing knot -> loop -> another knot ---------- */
  O.knot = function (THREE, o = {}) {
    const k = kit(THREE, o), s = o.size || 20, N = o.seg || 360, strands = o.strands || 4, tubeR = s * 0.09, grp = new THREE.Group();
    const knot = (p, q) => (u) => { const a = u * Math.PI * 2, r = 0.55 + 0.25 * Math.cos(q * a); return new THREE.Vector3(r * Math.cos(p * a), r * Math.sin(p * a), 0.3 * Math.sin(q * a)).multiplyScalar(s) };
    const loop = (u) => { const a = u * Math.PI * 2; return new THREE.Vector3(Math.cos(a) * 0.8, Math.sin(a) * 0.8, 0.12 * Math.sin(3 * a)).multiplyScalar(s) };
    const fig8 = (u) => { const a = u * Math.PI * 2; return new THREE.Vector3((2 + Math.cos(2 * a)) * Math.cos(3 * a) * 0.28, (2 + Math.cos(2 * a)) * Math.sin(3 * a) * 0.28, Math.sin(4 * a) * 0.35).multiplyScalar(s) };
    const shapes = o.shapes || [knot(2, 3), loop, fig8, loop, knot(3, 5), loop];
    // one geometry; positions rewritten each frame from the blend of two shapes (in the game: morph targets)
    const L = SPFX.Lines(); for (let j = 0; j < strands; j++) for (let i = 0; i < N; i++) L.seg([0, 0, 0], [0, 0, 0], j / strands * 0.3 + i / N, 1);
    for (let i = 0; i < N; i += 6) for (let j = 0; j < strands; j++) L.seg([0, 0, 0], [0, 0, 0], i / N + 0.5, 0.5);
    const geo = L.geometry(); const lm = k.lm({ width: s * 0.007, maxPx: 5 }); const mesh = new THREE.Mesh(geo, lm); mesh.frustumCulled = false; grp.add(mesh);
    const pa = geo.attributes.pa, pb = geo.attributes.pb; const ring = [], fr = (sh, u) => sh(((u % 1) + 1) % 1);
    const pts = new Array(N), off = [];
    return { group: grp, k, update(t, bt) {
        const per = (o.bars || 2) * 4, ph = ((Math.max(0, bt.b) + (o.phase || 0) * per) / per) % shapes.length, i0 = Math.floor(ph), f = ph - i0, m = easeIO(Math.max(0, Math.min(1, (f - 0.35) / 0.5)));
        const A = shapes[i0], B = shapes[(i0 + 1) % shapes.length];
        for (let i = 0; i < N; i++) { const u = i / N; pts[i] = fr(A, u).lerp(fr(B, u), m) }
        // a frame along the curve, strands round it
        for (let i = 0; i < N; i++) { const p = pts[i], q = pts[(i + 1) % N], tg = q.clone().sub(p).normalize(), nn = new THREE.Vector3(0, 0, 1).cross(tg).normalize(), bn = tg.clone().cross(nn);
          off[i] = []; for (let j = 0; j < strands; j++) { const a = j / strands * Math.PI * 2 + t * 0.8 + u2(i); off[i].push(p.clone().addScaledVector(nn, Math.cos(a) * tubeR).addScaledVector(bn, Math.sin(a) * tubeR)) } }
        function u2(i) { return i / N * Math.PI * 4 }
        let s4 = 0; const put = (a, b) => { for (let k2 = 0; k2 < 4; k2++) { pa.setXYZ(s4 * 4 + k2, a.x, a.y, a.z); pb.setXYZ(s4 * 4 + k2, b.x, b.y, b.z) } s4++ };
        for (let j = 0; j < strands; j++) for (let i = 0; i < N; i++) put(off[i][j], off[(i + 1) % N][j]);
        for (let i = 0; i < N; i += 6) for (let j = 0; j < strands; j++) put(off[i][j], off[i][(j + 1) % strands]);
        pa.needsUpdate = pb.needsUpdate = true; lm.uniforms.uGain.value = 1 + 0.5 * bt.k + 0.8 * bt.drop; grp.rotation.set(t * 0.1, t * 0.17, 0) } };
  };

  /* ---------- 30 shoals of shapes: instanced small solids wheeling round a moving centre ---------- */
  O.shoal = function (THREE, o = {}) {
    const k = kit(THREE, o), n = o.n || 160, s = o.size || 1.2, R = o.radius || 30, rnd = SPFX.rng(o.seed || 3), grp = new THREE.Group();
    const geo = (o.geo || ((r) => new THREE.OctahedronGeometry(r)))(s);
    const lm = k.lm({ width: s * 0.06, maxPx: 3.5, minPx: 1.2 }), cm = k.cm({ ca: 0, core: '#07060c' });
    const lines = new THREE.InstancedMesh(SPFX.Lines().edges(geo, 0.5).geometry(), lm, n);
    const cg = new THREE.BufferGeometry(); { const g2 = geo.index ? geo.toNonIndexed() : geo; cg.setAttribute('position', g2.attributes.position.clone()); cg.setAttribute('pc', new THREE.Float32BufferAttribute(new Float32Array(g2.attributes.position.count), 1)) }
    const coreI = new THREE.InstancedMesh(cg, cm, n); grp.add(coreI, lines); lines.frustumCulled = coreI.frustumCulled = false;
    // per-fish colour: the line geometry's pc is one value, so colour comes from a shift per instance -> use instanceColor as a brightness
    const fish = []; for (let i = 0; i < n; i++) fish.push({ a: rnd() * Math.PI * 2, r: R * (0.55 + 0.45 * rnd()), y: (rnd() - 0.5) * R * 0.35, sp: 0.5 + 0.25 * rnd(), ph: rnd() * 6.28, sc: 0.6 + 0.8 * rnd(), lag: rnd() });
    const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), p = new THREE.Vector3(), sc = new THREE.Vector3(), prev = new THREE.Vector3();
    // the shoal's path: a wide wheel round the centre that turns and tilts
    const path = (f, t) => { const a = f.a + t * f.sp * (o.speed || 0.5) - f.lag * 0.6, wob = Math.sin(t * 0.7 + f.ph) * 0.12;
      const r = f.r * (1 + wob) * (1 + 0.15 * Math.sin(t * 0.4));
      const x = Math.cos(a) * r, z = Math.sin(a) * r * (o.flat || 0.6), y = f.y + Math.sin(a * 2 + t * 0.5) * R * 0.18;
      return new THREE.Vector3(x, y, z).applyEuler(new THREE.Euler(Math.sin(t * 0.21) * 0.5, t * 0.05, Math.sin(t * 0.17) * 0.3)) };
    return { group: grp, k, mats: [lm], update(t, bt) {
        const tight = 1 - 0.35 * bt.drop; // on the drop the shoal bunches and scatters
        for (let i = 0; i < n; i++) { const f = fish[i]; const a = path(f, t).multiplyScalar(tight + 0.6 * bt.drop * (f.lag - 0.3)), b = path(f, t + 0.05);
          const dir = b.sub(path(f, t)).normalize(); q.setFromUnitVectors(new THREE.Vector3(0, 0, 1), dir);
          sc.setScalar(f.sc * (1 + 0.3 * bt.k)); m4.compose(a, q, sc); lines.setMatrixAt(i, m4); coreI.setMatrixAt(i, m4) }
        lines.instanceMatrix.needsUpdate = coreI.instanceMatrix.needsUpdate = true; lm.uniforms.uGain.value = 1 + 0.6 * bt.k; lm.uniforms.uShift.value = t * 0.05 } };
  };

  /* ---------- 28 / 3 stacks that unstack: stepped stacks whose tiers slide out, turn and re-stack ---------- */
  /* o.stacks: how many stacks side by side (pieces leave one and join another); tiers per stack; o.size the base width.
     Each beat is one step of stone machinery: a tier slides out, turns a quarter, slides back; every 2 bars the top tier
     of one stack flies to the next stack. */
  O.stacks = function (THREE, o = {}) {
    const k = kit(THREE, o), s = o.size || 12, nT = o.tiers || 5, nS = o.stacks || 2, gap = s * 1.6, th = s * 0.16, grp = new THREE.Group(), rnd = SPFX.rng(o.seed || 21);
    const lw = s * 0.008;
    // a tier: a stepped slab (a box with a fret band) with carved symbols on two faces sometimes
    const tier = (w, pc, carve) => { const g = new THREE.Group(); const geo = new THREE.BoxGeometry(w, th, w);
      g.add(SPFX.Cores().add(geo, null, pc).mesh(k.cm({ ca: 0.5, cs: th / 3, cy: 0, core: '#07060c' })));
      const L = SPFX.Lines().edges(geo, pc, 1); const h = th / 2, hw = w / 2;
      // step-fret band (a stepped spiral motif drawn as a squared meander) along each side
      const n = Math.max(2, Math.round(w / (th * 1.4)));
      for (let f = 0; f < 4; f++) { const m = new THREE.Matrix4().makeRotationY(f * Math.PI / 2); const pts = [];
        for (let i = 0; i < n; i++) { const x0 = -hw + (i + 0.15) * w / n, x1 = -hw + (i + 0.85) * w / n, xm = (x0 + x1) / 2, a = h * 0.6;
          pts.push([[x0, -a], [x0, a], [x1, a], [x1, -a * 0.2], [xm, -a * 0.2], [xm, a * 0.3]]) }
        for (const pl of pts) L.poly(pl.map(([x, y]) => new THREE.Vector3(x, y, hw + 0.01).applyMatrix4(m)), false, pc + 0.35, 0.65) }
      if (carve) for (const f of [0, 2]) { const m = new THREE.Matrix4().makeRotationY(f * Math.PI / 2); SPFX.carve(L, carve, m, hw + 0.02, th * 0.8, pc + 0.6) }
      g.add(L.mesh(k.lm({ width: lw, maxPx: 5 }))); return g };
    const stacks = [];
    for (let j = 0; j < nS; j++) { const st = []; for (let i = 0; i < nT; i++) { const w = s * (1 - i / (nT + 0.8)); const tg = tier(w, 0.05 + i / nT * 0.8, o.carve && i === 1 ? SPFX.BEAST[(j + i) % 4] : null); grp.add(tg); st.push({ g: tg, w, i }) } stacks.push(st) }
    // every tier's state: which stack, which level, its turn
    const T = []; stacks.forEach((st, j) => st.forEach((tr) => T.push({ g: tr.g, w: tr.w, j, lv: tr.i, rot: 0 })));
    const X = (j) => (j - (nS - 1) / 2) * gap;
    // a deterministic script of moves per beat: returns each tier's pose at beat b (replayed from 0 so it is the same every time)
    const script = (b) => { const st = T.map((x) => ({ j: x.j, lv: x.lv, rot: 0 })); const moves = [];
      const B = Math.floor(b); const r = SPFX.rng(o.seed || 21);
      for (let i = 0; i <= B; i++) { const m = { beat: i, kind: '', tier: -1 };
        if (i % 8 === 7 && nS > 1) { // a top tier leaves its stack for the shortest other one
          const counts = Array.from({ length: nS }, (_, j) => st.filter((q) => q.j === j).length); const from = counts.indexOf(Math.max(...counts)), to = counts.indexOf(Math.min(...counts));
          if (from !== to) { const tops = st.map((q, k2) => [q, k2]).filter(([q]) => q.j === from).sort((a, b) => b[0].lv - a[0].lv); const [q, ki] = tops[0];
            m.kind = 'fly'; m.tier = ki; m.from = { j: q.j, lv: q.lv }; q.j = to; q.lv = counts[to]; m.to = { j: q.j, lv: q.lv } } }
        else if (i % 2 === 0) { // a tier slides out, turns a quarter and slides back
          const ki = Math.floor(r() * st.length); m.kind = 'turn'; m.tier = ki; m.dir = r() < 0.5 ? -1 : 1; m.rot0 = st[ki].rot; st[ki].rot += m.dir }
        else if (i % 8 === 3) { // two neighbouring tiers of a stack swap places (re-stack differently)
          const j = Math.floor(r() * nS), mine = st.map((q, k2) => [q, k2]).filter(([q]) => q.j === j).sort((a, b) => a[0].lv - b[0].lv);
          if (mine.length > 2) { const a = 1 + Math.floor(r() * (mine.length - 2)); const [qa, ka] = mine[a], [qb, kb] = mine[a - 1] ? mine[a - 1 + 0] : mine[a]; const [qc, kc] = mine[a + 1] || mine[a - 1];
            m.kind = 'swap'; m.a = ka; m.b = kc; m.la = qa.lv; m.lb = qc.lv; const t0 = qa.lv; qa.lv = qc.lv; qc.lv = t0 } }
        moves.push(m) }
      return { st, last: moves[moves.length - 1] } };
    const pose = (j, lv) => new THREE.Vector3(X(j), lv * th * 1.02 + th / 2, 0);
    return { group: grp, k, update(t, bt) {
        const b = Math.max(0, bt.b), ph = b - Math.floor(b), cur = script(b), prev = script(b - 1 >= 0 ? b - 1 : 0);
        const before = (b >= 1) ? script(Math.floor(b) - 1).st : T.map((x) => ({ j: x.j, lv: x.lv, rot: 0 }));
        const m = cur.last, e = SPFX.easeIO(Math.min(1, ph / 0.8));
        T.forEach((x, i) => { const a = before[i], z = cur.st[i]; const pa = pose(a.j, a.lv), pz = pose(z.j, z.lv); let p = pa.clone().lerp(pz, e), rot = (a.rot + (z.rot - a.rot) * e) * Math.PI / 2, out = 0;
          if (m.kind === 'turn' && m.tier === i) out = Math.sin(Math.PI * e) * x.w * 0.55;
          if (m.kind === 'fly' && m.tier === i) { p.y += Math.sin(Math.PI * e) * s * 0.9; rot += Math.sin(Math.PI * e) * 0.6 }
          if (m.kind === 'swap' && (m.a === i || m.b === i)) out = Math.sin(Math.PI * e) * x.w * 0.6 * (m.a === i ? 1 : -1);
          x.g.position.set(p.x, p.y, p.z + out); x.g.rotation.y = rot; const lit = (m.tier === i || m.a === i || m.b === i) ? 0.8 * (1 - ph) : 0;
          x.g.children[1].material.uniforms.uGain.value = 1 + lit + 0.3 * bt.k + 0.5 * bt.drop });
        grp.rotation.y = o.turn == null ? Math.sin(t * 0.15) * 0.3 : o.turn } };
  };

  /* ---------- bestiary carvings (from concept 6): flat line drawings in a -1..1 x 0..4.4 frame ---------- */
  const circ = (cx, cy, r, n = 24) => Array.from({ length: n + 1 }, (_, i) => [cx + r * Math.cos(i * 2 * Math.PI / n), cy + r * Math.sin(i * 2 * Math.PI / n)]);
  const mir = (pl) => pl.map((p) => [-p[0], p[1]]);
  function bSerpent() { const N = 60, Lf = [], Rt = [], ch = [], out = []; const cx = (t) => 0.5 * Math.sin(t * Math.PI * 3.4) * (1 - 0.2 * t), cy = (t) => 0.25 + t * 3.2;
    for (let i = 0; i <= N; i++) { const t = i / N * 0.9, dx = (cx(t + 0.003) - cx(t - 0.003)) / (cy(t + 0.003) - cy(t - 0.003)), nl = Math.hypot(1, dx), w = 0.04 + 0.2 * Math.pow(Math.sin(Math.PI * Math.min(1, t * 1.1 + 0.05)), 0.7), c = [cx(t), cy(t)], n = [1 / nl, -dx / nl];
      Lf.push([c[0] + n[0] * w, c[1] + n[1] * w]); Rt.push([c[0] - n[0] * w, c[1] - n[1] * w]); ch.push({ c, n, w, tg: [dx / nl, 1 / nl] }) }
    out.push(Lf, Rt, [Lf[0], Rt[0]]); for (let i = 4; i < N - 3; i += 3) { const q = ch[i]; out.push([Lf[i], [q.c[0] - q.tg[0] * 0.13, q.c[1] - q.tg[1] * 0.13], Rt[i]]) }
    const h = ch[N], hc = h.c, n = h.n, tg = h.tg, pt = (a, b) => [hc[0] + n[0] * a + tg[0] * b, hc[1] + n[1] * a + tg[1] * b];
    out.push([Lf[N], pt(0.34, 0.12), pt(0.22, 0.5), pt(0, 0.8), pt(-0.22, 0.5), pt(-0.34, 0.12), Rt[N]]); out.push([pt(0.2, 0.45), pt(0.42, 0.75), pt(0.36, 1.05)], [pt(-0.2, 0.45), pt(-0.42, 0.75), pt(-0.36, 1.05)]); return out }
  function bFirebird() { const o = [circ(0, 3.7, 0.26, 16)]; o.push([[0, 3.96], [0, 4.4]], [[0.12, 3.93], [0.34, 4.25]], [[-0.12, 3.93], [-0.34, 4.25]]); o.push([[-0.07, 3.5], [0, 3.18], [0.07, 3.5]]);
    o.push([[0, 3.44], [0.36, 3.0], [0.26, 2.2], [0, 1.75], [-0.26, 2.2], [-0.36, 3.0], [0, 3.44]]);
    for (let j = 0; j < 5; j++) { const ang = (34 - j * 15) * Math.PI / 180, L = 0.68 - 0.03 * j, sx = 0.34, sy = 3.02 - j * 0.12, pts = [], pts2 = [];
      for (let f = 0; f <= 6; f++) { const t = f / 6, a = ang - 0.35 * t * t, x = sx + L * t * Math.cos(a), y = sy + L * t * Math.sin(a), wd = 0.1 * Math.sin(Math.PI * t) ** 0.8 + 0.01; pts.push([x + wd * Math.sin(a), y - wd * Math.cos(a)]); pts2.push([x - wd * Math.sin(a), y + wd * Math.cos(a)]) }
      const lf = pts.concat(pts2.reverse()); o.push(lf, mir(lf)) }
    [[-0.5, 0.2], [0, 0], [0.5, -0.2]].forEach(([dx, ph]) => { const c = []; for (let i = 0; i <= 16; i++) { const t = i / 16; c.push([dx * t + 0.18 * Math.sin(t * 9 + ph * 5) * (0.4 + t), 1.75 - t * 1.55]) } o.push(c); const e = c[c.length - 1]; o.push(circ(e[0], e[1] - 0.1, 0.1, 8)) }); return o }
  function bStag() { const o = [], face = [[0, 0.3], [0.38, 1.2], [0.46, 2.0], [0.3, 2.5], [0, 2.62]]; o.push(face.concat(mir(face).reverse())); o.push([[0.44, 1.95], [0.95, 2.32], [0.34, 2.45]], [[-0.44, 1.95], [-0.95, 2.32], [-0.34, 2.45]]);
    for (const s of [1, -1]) o.push([[s * 0.12, 1.78], [s * 0.28, 1.9], [s * 0.12, 2.0]]); o.push([[0, 0.62], [0.1, 0.82], [-0.1, 0.82], [0, 0.62]]);
    for (const sg of [1, -1]) { const beam = [[0.2, 2.6], [0.45, 2.95], [0.62, 3.45], [0.58, 4.0], [0.42, 4.35]].map((p) => [sg * p[0], p[1]]); o.push(beam); o.push([beam[1], [sg * 0.9, 3.2], [sg * 0.98, 3.6]]); o.push([beam[2], [sg * 0.95, 3.9], [sg * 0.9, 4.25]]); o.push([beam[3], [sg * 0.78, 4.35]]) }
    o.push(circ(0, 3.45, 0.26, 16)); for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; o.push([[0.34 * Math.cos(a), 3.45 + 0.34 * Math.sin(a)], [0.46 * Math.cos(a), 3.45 + 0.46 * Math.sin(a)]]) } return o }
  function bSunRing() { const o = [circ(0, 2.5, 0.94, 40), circ(0, 2.5, 0.7, 40)], z = []; for (let i = 0; i <= 32; i++) { const r = i % 2 ? 0.94 : 0.7, a = i * 2 * Math.PI / 32; z.push([r * Math.cos(a), 2.5 + r * Math.sin(a)]) } o.push(z);
    const st = []; for (let i = 0; i <= 8; i++) { const a = (i * 3 % 8) * 2 * Math.PI / 8 + Math.PI / 8; st.push([0.6 * Math.cos(a), 2.5 + 0.6 * Math.sin(a)]) } o.push(st, circ(0, 2.5, 0.14, 10));
    for (let k = 0; k < 4; k++) { const hw = 0.9 - k * 0.2, y = 1.45 - k * 0.32; o.push([[-hw, y], [hw, y], [hw, y - 0.3], [-hw, y - 0.3], [-hw, y]]) } return o }
  SPFX.BEAST = [bSerpent(), bFirebird(), bStag(), bSunRing()];
  // carve a creature onto a face: m rotates the face, z its depth, h the height to fill
  SPFX.carve = function (L, beast, m, z, h, pc) { const sc = h / 4.4; for (const pl of beast) L.poly(pl.map(([x, y]) => new root.THREE.Vector3(x * sc, (y - 2.2) * sc, z).applyMatrix4(m)), false, pc, 1.1) };
  // a block with a creature on each side face, turning slowly (for the stacks and as loose blocks)
  O.beastBlock = function (THREE, o = {}) { const k = kit(THREE, o), s = o.size || 6, geo = new THREE.BoxGeometry(s, s * 1.6, s), grp = new THREE.Group();
    const L = SPFX.Lines().edges(geo, 0.1, 1); for (let f = 0; f < 4; f++) SPFX.carve(L, SPFX.BEAST[(f + (o.first || 0)) % 4], new THREE.Matrix4().makeRotationY(f * Math.PI / 2), s / 2 + 0.02, s * 1.35, 0.3 + f * 0.17);
    grp.add(SPFX.Cores().add(geo, null, 0).mesh(k.cm({ ca: 0.25, cs: s * 0.2, core: '#07060c' })), L.mesh(k.lm({ width: s * 0.012, maxPx: 4 })));
    return { group: grp, k, update(t, bt) { grp.rotation.y = t * 0.3 + (o.step ? Math.floor(bt.b / 4) * Math.PI / 2 + ease(Math.min(1, (bt.b % 4) / 0.8)) * 0 : 0) } } };
})(window);
