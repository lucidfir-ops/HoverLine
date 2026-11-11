/* Spirit realm prototype: THE RULE (Eric, round 1 notes): nothing ever intersects the road, and nothing blocks the view
   of the road ahead. Every placer in the library asks this module before it puts anything down. Not game code.

   Two volumes, built once per track (SPC.init):
   - the keep-out: in every road sample's own frame, the road's width plus a margin each side (margin), from under the
     road (below) to well above it (above; jumpAbove over a jump and its landing, so a frame in the air is clear too).
     Extra roads (a portal's ramp and catch road) are added with SPC.addRoad.
   - the sight lines: from a chase camera (camBack metres behind a racer, camUp up, on three lines across the road)
     every camStep metres round the lap, to points on the road (both edges and the middle, 1 m up) every tgtStep metres
     up to `sight` metres ahead. Every ray is marched into a set of small voxels (vox metres); anything that touches a
     voxel is in front of the road for some chase camera.
   SPC.ok(p, r) says whether a ball of radius r at p is clear of both. SPC.objOk(obj) checks a whole object, point by
   point along its lines and over its faces, at several moments of its animation (pieces in flight included); SPC.fit
   tries placements until one is clear, or drops the object. SPC.stats counts what was checked, moved and dropped. */
(function () {
'use strict';
const SPC = window.SPC = { on: false, stats: {}, notes: {} };
let C = null, T = null;
const V3 = () => new THREE.Vector3();
SPC.note = (k, n = 1) => { SPC.notes[k] = (SPC.notes[k] || 0) + n };
const st = (k) => SPC.stats[k] || (SPC.stats[k] = { tried: 0, placed: 0, moved: 0, dropped: 0, pts: 0 });

SPC.init = function (o = {}) {
  C = window.__cv; T = C.T;
  const O = SPC.o = Object.assign({ margin: 6, below: 4, above: 16, jumpAbove: 40, sight: 300, camBack: 12, camUp: 4.5, vox: 3, camStep: 8, tgtStep: 15, cell: 32 }, o);
  SPC.hw = C.W / 2; SPC.cell = O.cell; SPC.maxAbove = 0; SPC.hash = new Map(); SPC.samples = []; SPC.stats = {}; SPC.notes = {};
  const jumpy = (u) => (T.jumps || []).some((j) => u > j.u0 - 30 && u < j.u1 + 80);
  for (let i = 0; i < T.N; i++) SPC.addSample({ p: T.P[i].clone(), r: T.R[i].clone(), up: T.U[i].clone(), t: T.Tg[i].clone(), hw: SPC.hw, above: jumpy(i * T.ds) ? O.jumpAbove : O.above, u: i * T.ds, ds: T.ds });
  SPC.buildSight(O.range);
  SPC.on = true; return { samples: SPC.samples.length, sightVox: SPC.nVox };
};
const key3 = (a, b, c) => (a + 32768) * 4294967296 + (b + 32768) * 65536 + (c + 32768);
SPC.addSample = function (s) { SPC.samples.push(s); SPC.maxAbove = Math.max(SPC.maxAbove || 0, s.above); const c = SPC.cell, k = key3(Math.floor(s.p.x / c), Math.floor(s.p.y / c), Math.floor(s.p.z / c)); let L = SPC.hash.get(k); if (!L) SPC.hash.set(k, L = []); L.push(s) };
// an extra road (portal ramps, catch roads): points [{p, r, u (up)}] about a metre apart; o.above, o.hw
SPC.addRoad = function (pts, o = {}) { for (let i = 0; i < pts.length; i += 2) { const q = pts[i], n = pts[Math.min(i + 1, pts.length - 1)], m = pts[Math.max(i - 1, 0)];
  const t = n.p.clone().sub(m.p).normalize(); SPC.addSample({ p: q.p.clone(), r: q.r.clone(), up: q.u.clone(), t, hw: o.hw || SPC.hw, above: o.above || SPC.o.above, u: -1, ds: 2.2 }) } };

// ---------------------------------------------------------------- the keep-out
// the road sample whose keep-out box a ball (p, r) touches, or null
const _d = new THREE.Vector3();
SPC.inKeep = function (p, r = 0) {
  const O = SPC.o, c = SPC.cell, reach = SPC.hw + O.margin + SPC.maxAbove + r, n = Math.ceil(reach / c);
  const cx = Math.floor(p.x / c), cy = Math.floor(p.y / c), cz = Math.floor(p.z / c);
  for (let a = -n; a <= n; a++) for (let b = -n; b <= n; b++) for (let e = -n; e <= n; e++) { const L = SPC.hash.get(key3(cx + a, cy + b, cz + e)); if (!L) continue;
    for (const s of L) { _d.subVectors(p, s.p); if (Math.abs(_d.dot(s.t)) > s.ds * 0.75 + r) continue; const lat = Math.abs(_d.dot(s.r)), h = _d.dot(s.up);
      if (lat < s.hw + O.margin + r && h > -O.below - r && h < s.above + r) return s } }
  return null;
};

// ---------------------------------------------------------------- the sight lines
SPC.buildSight = function (range) {
  const O = SPC.o, vs = O.vox, F = new Map(), cs = 24; let n = 0; const fine = new Set();
  const u0 = range ? range[0] : 0, u1 = range ? range[1] : T.L, hw = SPC.hw, p = V3(), d = V3();
  for (let uc = u0; uc < u1; uc += O.camStep) {
    const a = C.sampleAt(uc - O.camBack);
    for (const lc of [-hw * 0.6, 0, hw * 0.6]) { const cam = a.p.clone().addScaledVector(a.r, lc).addScaledVector(a.u, O.camUp);
      for (let dd = O.tgtStep; dd <= O.sight; dd += O.tgtStep) { const b = C.sampleAt(uc + dd);
        for (const lt of [-hw + 1, 0, hw - 1]) { const tg = b.p.clone().addScaledVector(b.r, lt).addScaledVector(b.u, 1);
          d.subVectors(tg, cam); const L = d.length(), m = Math.ceil(L / (vs * 0.7));
          for (let i = 0; i <= m; i++) { p.copy(cam).addScaledVector(d, i / m); const ix = Math.floor(p.x / vs), iy = Math.floor(p.y / vs), iz = Math.floor(p.z / vs), k = key3(ix, iy, iz);
            if (fine.has(k)) continue; fine.add(k); n++;
            const ck = key3(Math.floor(p.x / cs), Math.floor(p.y / cs), Math.floor(p.z / cs)); let Lc = F.get(ck); if (!Lc) F.set(ck, Lc = []); Lc.push((ix + 0.5) * vs, (iy + 0.5) * vs, (iz + 0.5) * vs) } } } } }
  SPC.sight = F; SPC.sightCell = cs; SPC.nVox = n;
};
// does a ball (p, r) touch a sight-line voxel? (the voxel counts as a ball of half its diagonal)
SPC.inSight = function (p, r = 0) {
  if (!SPC.sight) return false; const cs = SPC.sightCell, vr = SPC.o.vox * 0.87, R = r + vr, n = Math.ceil(R / cs);
  const cx = Math.floor(p.x / cs), cy = Math.floor(p.y / cs), cz = Math.floor(p.z / cs), R2 = R * R;
  for (let a = -n; a <= n; a++) for (let b = -n; b <= n; b++) for (let e = -n; e <= n; e++) { const L = SPC.sight.get(key3(cx + a, cy + b, cz + e)); if (!L) continue;
    for (let i = 0; i < L.length; i += 3) { const dx = L[i] - p.x, dy = L[i + 1] - p.y, dz = L[i + 2] - p.z; if (dx * dx + dy * dy + dz * dz < R2) return true } }
  return false;
};
// the whole rule for a ball; name: a counter in SPC.stats (null: don't count)
SPC.ok = function (p, r = 0, name) { if (!SPC.on) return true; const s = name ? st(name) : null; if (s) s.tried++;
  const bad = SPC.inKeep(p, r) || SPC.inSight(p, r); if (s && bad) s.dropped++; else if (s) s.placed++; return !bad };
// a stepped stack (half width, height; inv: it hangs down from p) as a grid of balls
SPC.okBox = function (p, half, h, inv, name) { const s = name ? st(name) : null; if (s) s.tried++; const n = 4, m = 4, cr = Math.max(half / n, h / m) * 0.9;
  for (let i = 0; i <= n; i++) for (let j = 0; j <= n; j++) for (let k = 0; k <= m; k++) { const q = new THREE.Vector3(-half + 2 * half * i / n, (inv ? -1 : 1) * h * k / m, -half + 2 * half * j / n).add(p);
    if (SPC.inKeep(q, cr) || SPC.inSight(q, cr)) { if (s) s.dropped++; return false } }
  if (s) s.placed++; return true };
// the smallest radius a ring round the road (centred lift metres up) can have and stay clear of the keep-out
SPC.ringR = function (lift = 0, thick = 2) { const O = SPC.o, w = SPC.hw + O.margin, top = O.above - lift, bot = O.below + lift;
  return Math.max(Math.hypot(w, top), Math.hypot(w, bot)) + thick + 1 };

// ---------------------------------------------------------------- whole objects
// points (world) with a radius along every line and over every face of an object. Pieces (shatter, merge, arches) are
// sampled at several stages of their flight (home -> target, burst out); instanced meshes at every instance.
const _m = new THREE.Matrix4(), _mi = new THREE.Matrix4(), _a = new THREE.Vector3(), _b = new THREE.Vector3();
SPC.pointsOf = function (group, o = {}) {
  group.updateMatrixWorld(true); const out = [], step = o.step || 3;
  const stages = o.stages || [[0, 0], [0.33, 0], [0.66, 0], [1, 0], [1, 0.5], [1, 1], [0, 1]];
  group.traverse((m) => { if (!m.isMesh || !m.visible && !o.hidden || !m.geometry) return; const g = m.geometry, A = g.attributes;
    const inst = m.isInstancedMesh ? m.count : 1;
    for (let ii = 0; ii < inst; ii++) {
      _m.copy(m.matrixWorld); if (m.isInstancedMesh) { m.getMatrixAt(ii, _mi); _m.multiply(_mi) }
      if (m.userData.spcInst) { // a big instanced field: one ball per instance
        if (!g.boundingSphere) g.computeBoundingSphere(); const sc = new THREE.Vector3().setFromMatrixScale(_m); _a.copy(g.boundingSphere.center).applyMatrix4(_m);
        out.push({ p: _a.clone(), r: g.boundingSphere.radius * Math.max(sc.x, sc.y, sc.z) }); continue }
      const pieces = !!A.aHome, sts = pieces ? stages : [[0, 0]];
      const at = (arr, i, v) => v.set(arr.getX(i), arr.getY(i), arr.getZ(i));
      if (A.pa && A.pb) { // neon lines: 4 vertices a segment
        for (let i = 0; i < A.pa.count; i += 4) { for (const [mo, ex] of sts) { at(A.pa, i, _a); at(A.pb, i, _b);
            if (pieces) { const h = at(A.aHome, i, new THREE.Vector3()), tg = at(A.aTarget, i, new THREE.Vector3()), dr = at(A.aDir, i, new THREE.Vector3()), c = h.lerp(tg, mo).addScaledVector(dr, ex); _a.add(c); _b.add(c) }
            _a.applyMatrix4(_m); _b.applyMatrix4(_m); const L = _a.distanceTo(_b), k = Math.max(1, Math.ceil(L / step));
            for (let j = 0; j <= k; j++) out.push({ p: _a.clone().lerp(_b, j / k), r: Math.min(step, L / k) * 0.6 + (o.pad || 0.3) }) } } }
      else if (A.position) { const P = A.position, every = Math.max(1, Math.floor(P.count / (o.maxV || 600)));
        for (let i = 0; i < P.count; i += every) for (const [mo, ex] of sts) { at(P, i, _a); if (pieces) { const h = at(A.aHome, i, new THREE.Vector3()), tg = at(A.aTarget, i, new THREE.Vector3()), dr = at(A.aDir, i, new THREE.Vector3()); _a.add(h.lerp(tg, mo).addScaledVector(dr, ex)) }
          out.push({ p: _a.clone().applyMatrix4(_m), r: o.pad || 0.5 }) } } } });
  return out;
};
// is the object clear now, and (o.times) at each of those moments of its animation? bt(t): a beat for its update
SPC.objOk = function (obj, o = {}) {
  const times = o.times || [null]; let n = 0;
  for (const t of times) { if (t != null && obj.update) obj.update(t, o.bt ? o.bt(t) : SPC.fakeBeat(t), 1 / 15);
    const pts = obj.spcPoints ? obj.spcPoints() : SPC.pointsOf(obj.group, o); n += pts.length;
    for (const q of pts) { const ks = SPC.inKeep(q.p, q.r); if (ks || SPC.inSight(q.p, q.r)) { SPC.lastBad = { why: ks ? 'keep-out' : 'sight', p: q.p.toArray().map(Math.round), r: +q.r.toFixed(1), t, u: ks ? Math.round(ks.u) : null }; return false } } }
  if (times[0] != null && obj.update) obj.update(0, o.bt ? o.bt(0) : SPC.fakeBeat(0), 1 / 15);
  SPC.lastPts = n; return true;
};
// try placements place(group, k) for k = 0..tries-1 until the object is clear; otherwise it is dropped (returns false)
SPC.fit = function (name, obj, place, o = {}) { const s = st(name); s.tried++;
  for (let k = 0; k < (o.tries || 12); k++) { place(obj.group, k); if (SPC.objOk(obj, o)) { s.placed++; if (k) s.moved++; s.pts += SPC.lastPts || 0; return true } }
  s.dropped++; return false };
// a beat for checking animations: every moment of a 140 bpm, 8-bar phrase is reached by some t
SPC.fakeBeat = (t) => { const spb = 60 / 140, b = t / spb, bi = Math.floor(b), ph = b - bi, bar = Math.floor(bi / 4), bars = bar % 8, tDrop = (b - Math.floor(bar / 8) * 32) * spb;
  return { t, bpm: 140, spb, b, step: bi, ph, k: Math.exp(-ph * 5.5), bar, bb: bi % 4, bars, dropN: Math.floor(bar / 8), drop: Math.exp(-tDrop / (spb * 4)), tDrop, toDrop: (32 - (b % 32)) * spb,
    build: 0, breath: Math.sin(2 * Math.PI * b / 8), sec: 'drop', barN: bar, barF: (b / 4) % 1, beatN: bi, beatF: ph, kick: Math.exp(-ph * 5.5), brk: 0 } };
// the times to check an animated object at: n moments spread over 16 bars
SPC.times = (n = 12) => Array.from({ length: n }, (_, i) => i * (16 * 4 * 60 / 140) / n + 0.05);

// ---------------------------------------------------------------- a picture of the two volumes (for the rule-A clip)
SPC.debug = function (o = {}) {
  const g = new THREE.Group(), O = SPC.o, u0 = o.u0 || 0, u1 = o.u1 || T.L, pos = [];
  for (let u = u0; u < u1; u += 4) { const a = SW.fr(u), b = SW.fr(u + 4), w = SPC.hw + O.margin;
    for (const [x, y] of [[-w, -O.below], [w, -O.below], [-w, O.above], [w, O.above]]) { const pa = a.p.clone().addScaledVector(a.r, x).addScaledVector(a.u, y), pb = b.p.clone().addScaledVector(b.r, x).addScaledVector(b.u, y); pos.push(pa.x, pa.y, pa.z, pb.x, pb.y, pb.z) }
    if (Math.round(u) % 20 === 0) for (const [x0, y0, x1, y1] of [[-w, -O.below, w, -O.below], [-w, O.above, w, O.above], [-w, -O.below, -w, O.above], [w, -O.below, w, O.above]]) {
      const pa = a.p.clone().addScaledVector(a.r, x0).addScaledVector(a.u, y0), pb = a.p.clone().addScaledVector(a.r, x1).addScaledVector(a.u, y1); pos.push(pa.x, pa.y, pa.z, pb.x, pb.y, pb.z) } }
  const kg = new THREE.BufferGeometry(); kg.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  const km = new THREE.LineSegments(kg, new THREE.LineBasicMaterial({ color: 0xff4a3d, transparent: true, opacity: 0.55, blending: THREE.AdditiveBlending, depthWrite: false })); km.frustumCulled = false; g.add(km);
  const sp = []; for (const L of SPC.sight.values()) for (let i = 0; i < L.length; i += 3) sp.push(L[i], L[i + 1], L[i + 2]);
  const sg = new THREE.BufferGeometry(); sg.setAttribute('position', new THREE.Float32BufferAttribute(sp, 3));
  const sm = new THREE.Points(sg, new THREE.PointsMaterial({ color: 0x3ff0ff, size: o.ps || 1.6, sizeAttenuation: true, transparent: true, opacity: 0.22, blending: THREE.AdditiveBlending, depthWrite: false })); sm.frustumCulled = false; g.add(sm);
  return g;
};
})();
