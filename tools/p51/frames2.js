// Mock-ups: the Tether's design principles applied to the other seven frames. window.frame2(name, paint, st) -> Group.
// Principles (TETHER-SPEC.md): designed low-poly shapes; open six-sided nozzles with a thin inset rim and a recessed glow;
// no tacked-on rings or bricks; canopy = the hull's own facets as flush glass with square edges; ammo = purple bars laid
// in hull panels (length = ammo stat, dim as spent); vertical fins steer with hinged rudders, horizontal surfaces brake
// with hinged flaps that light at the trailing edge; swept bevelled fins with lit leading edges; stats grow the parts.
(() => {
  const T = THREE;
  function kit(g, paint, st) {
    const K = { g };
    K.lam = (c) => new T.MeshLambertMaterial({ color: c, flatShading: true });
    K.mB = K.lam(paint.body); K.mS = K.lam(paint.stripe); K.mD = K.lam(0x161a22); K.mA = K.lam(0x8a93a3); K.mT = K.lam(0x2a2e36);
    K.glow = new T.MeshBasicMaterial({ color: 0x3ff0ff }); K.hot = new T.MeshBasicMaterial({ color: 0xffc040 });
    K.glass = new T.MeshLambertMaterial({ color: 0x3a8aa6, emissive: 0x0c3a4a, flatShading: true });
    const BRK = st.brake || 0, STR = st.steer || 0; K.BRK = BRK; K.STR = STR;
    K.put = (geo, m, x, y, z, par) => { const me = new T.Mesh(geo, m); me.position.set(x, y, z); (par || g).add(me); return me };
    K.cylZ = (r1, r2, len, seg) => { const c = new T.CylinderGeometry(r1, r2, len, seg); c.rotateX(Math.PI / 2); return c };
    K.noEdge = (m) => { m.userData.noEdge = 1; return m };
    // a thin fin from a 2D outline (x = back, y = up), bevelled, thinner toward the tip; the outline's plane is y-z
    K.finGeo = (pts, thick) => {
      const s = new T.Shape(); s.moveTo(pts[0][0], pts[0][1]); for (const q of pts.slice(1)) s.lineTo(q[0], q[1]);
      const geo = new T.ExtrudeGeometry(s, { depth: thick, bevelEnabled: true, bevelThickness: thick * 0.4, bevelSize: thick * 0.5, bevelSegments: 1, steps: 1 });
      geo.translate(0, 0, -thick / 2); geo.rotateY(-Math.PI / 2);
      const p = geo.attributes.position; let ym = 0; for (const q of pts) ym = Math.max(ym, Math.abs(q[1]));
      for (let i = 0; i < p.count; i++) { const k = 1 - 0.6 * Math.abs(p.getY(i)) / ym; p.setX(i, p.getX(i) * k) }
      geo.computeVertexNormals(); return geo;
    };
    // a moving surface on a fin: outline starts at the hinge line x=0; swings about the fin's span (out of its plane)
    K.hinge = (parent, outline, thick, mat, hz, ang) => { const pv = new T.Group(); pv.position.set(0, 0, hz); parent.add(pv); pv.add(new T.Mesh(K.finGeo(outline, thick), mat)); pv.rotation.y = ang; return pv };
    // a lit strip between two points (in the parent's space)
    K.strip = (a, b, r = 0.022, mat = K.glow, par) => { const d = new T.Vector3().subVectors(b, a), L = d.length(), m = new T.Mesh(new T.BoxGeometry(r, r, L), mat); m.position.copy(a).addScaledVector(d, 0.5); (par || g).add(m); m.lookAt(par ? b : b); if (par) { m.lookAt(new T.Vector3().copy(b).applyMatrix4(par.matrixWorld)) } return K.noEdge(m) };
    // a vertical fin with a rudder: base along z from z0, length L, height H; rudder from fraction rf of L; steers
    K.finRudder = (x, y, z0, L, H, mat, opt = {}) => {
      const xr = L * (opt.rf ?? 0.66), sweep = opt.sweep ?? 0.55;
      const f = K.put(K.finGeo([[0, 0], [xr, 0], [xr, H * 0.92], [L * 0.3 + H * sweep, H], [L * 0.12, H * 0.2]], opt.t ?? 0.05), mat, x, y, z0);
      if (opt.rz) f.rotation.z = opt.rz;
      const rl = L - xr + 0.05; K.hinge(f, [[0, 0], [rl, 0], [rl * 0.75, H * 0.85], [0, H * 0.92]], (opt.t ?? 0.05) * 0.8, mat, xr + 0.01, -STR * 0.5);
      if (!opt.noLight) { f.updateMatrixWorld(true); const a = new T.Vector3(0, H * 0.2, L * 0.12), b = new T.Vector3(0, H, L * 0.3 + H * sweep); const m = new T.Mesh(new T.BoxGeometry(0.02, 0.02, a.distanceTo(b)), K.glow); m.position.copy(a).lerp(b, 0.5); m.lookAt(b); f.add(m); K.noEdge(m) }
      return f;
    };
    // a horizontal surface (wing/canard) with a brake flap: outline in (back, span); laid flat by rz; flap kicks up
    K.wingFlap = (x, y, z0, root, span, mat, s, opt = {}) => {
      const xr = root * (opt.rf ?? 0.7), tipF = opt.tipF ?? 0.6;
      const w = K.put(K.finGeo([[0, 0], [xr, 0], [xr - (root - root * tipF) * 0.1, span], [root * (1 - tipF) * 0.9, span]], opt.t ?? 0.04), opt.fixMat || mat, x, y, z0);
      w.rotation.z = s * (-Math.PI / 2 - (opt.droop ?? 0.12));
      const fl = root - xr + 0.02, fp = K.hinge(w, [[0, 0], [fl, 0], [fl * 0.7, span * 0.94], [0, span * 0.94]], (opt.t ?? 0.04) * 0.75, mat, xr + 0.01, -s * BRK * 1.0);
      // brake light along the flap's trailing edge
      const a0 = new T.Vector3(0, 0, fl), b0 = new T.Vector3(0, span * 0.94, fl * 0.7), d = b0.clone().sub(a0), L = d.length();
      const lm = new T.Mesh(new T.BoxGeometry(0.045, 0.02, L), new T.MeshBasicMaterial({ color: new T.Color(0x2a1210).lerp(new T.Color(0xff5a2a), BRK) }));
      lm.position.copy(a0).addScaledVector(d, 0.5); lm.lookAt(b0); fp.add(K.noEdge(lm));
      return w;
    };
    // an engine: hull of the nacelle is the caller's; this is the open six-sided nozzle at z with exit radius re, length nL
    K.nozzle = (x, y, z, re, nL, par) => {
      const nzG = new T.CylinderGeometry(re, re * 1.12, nL, 6, 1, true); nzG.rotateX(Math.PI / 2);
      K.put(nzG, new T.MeshLambertMaterial({ color: 0x2a2e36, flatShading: true, side: T.DoubleSide }), x, y, z + nL / 2, par);
      const ri = re * 0.775, ze = z + nL;
      const lip = K.noEdge(K.put(new T.RingGeometry(ri, re, 6), K.mD, x, y, ze + 0.002, par)); lip.rotation.z = Math.PI / 2;
      K.noEdge(K.put(K.cylZ(ri, ri, 0.12, 6), new T.MeshBasicMaterial({ color: 0x2a1404, side: T.BackSide }), x, y, ze - 0.06, par));
      const c = K.noEdge(K.put(new T.CircleGeometry(ri, 6), K.hot, x, y, ze - 0.11, par)); c.rotation.z = Math.PI / 2;
    };
    // a faceted nacelle: an n-sided tube with stripe bands, a dark intake, and the nozzle at the back
    K.nacelle = (x, y, z0, r, len, opt = {}) => {
      const n = opt.n ?? 8; K.put(K.cylZ(r, r * 0.9, len, n), opt.mat || K.mS, x, y, z0 + len / 2).rotation.z = Math.PI / n;
      if (!opt.noBand) for (const bz of opt.bands || [z0 + len * 0.62]) K.put(K.cylZ(r * 1.07, r * 1.07, 0.16, n), opt.bandMat || K.mB, x, y, bz).rotation.z = Math.PI / n;
      K.put(new T.CircleGeometry(r * 0.88, n), K.mD, x, y, z0 - 0.012).rotation.y = Math.PI;
      const nL = opt.nL ?? 0.3; K.nozzle(x, y, z0 + len, r * 0.85 * 0.9, nL);
      return z0 + len + nL;
    };
    // a faceted teardrop body (lathe of n sides) along z, centred at z c, length L, radius R, flattened by fy
    K.pod = (x, y, c, L, R, fy, opt = {}) => {
      const prof = [], N = opt.rings ?? 8, sh = opt.shape || ((t) => Math.sin(Math.PI * Math.pow(t, 0.75)) * 0.82 + 0.18 * (1 - t));
      for (let i = 0; i <= N; i++) { const t = i / N; prof.push(new T.Vector2(Math.max(0.02, sh(t) * R), (t - 0.5) * L)) }
      const geo = new T.LatheGeometry(prof, opt.n ?? 8); geo.rotateX(Math.PI / 2); geo.scale(opt.fx ?? 1, fy, 1); geo.rotateZ(Math.PI / (opt.n ?? 8));
      const m = K.put(geo, opt.mat || K.mB, x, y, c); m.userData.L = L; m.userData.N = N; return m;
    };
    // flush glass: the facets of mesh between rings zA..zB (fractions of L from the nose, measured -0.5..0.5) facing up past ny
    K.glassOn = (mesh, zA, zB, ny = 0.75) => {
      const gp = mesh.geometry.clone().toNonIndexed(), P = gp.attributes.position, keep = [], L = mesh.userData.L || 1, va = new T.Vector3(), vb = new T.Vector3(), vc = new T.Vector3();
      for (let i = 0; i < P.count; i += 3) { va.fromBufferAttribute(P, i); vb.fromBufferAttribute(P, i + 1); vc.fromBufferAttribute(P, i + 2);
        const nr = new T.Vector3().crossVectors(vb.clone().sub(va), vc.clone().sub(va)).normalize(), z0 = Math.min(va.z, vb.z, vc.z), z1 = Math.max(va.z, vb.z, vc.z);
        if (Math.abs(nr.y) > ny && Math.max(va.y, vb.y, vc.y) > 0 && z0 >= zA * L - 1e-3 && z1 <= zB * L + 1e-3) for (const v of [va, vb, vc]) keep.push(v.x * 1.012, v.y * 1.012 + 0.002, v.z) }
      const cg = new T.BufferGeometry(); cg.setAttribute('position', new T.Float32BufferAttribute(keep, 3)); cg.computeVertexNormals();
      const gl = K.noEdge(new T.Mesh(cg, K.glass)); gl.position.copy(mesh.position); mesh.parent.add(gl); gl.add(new T.LineSegments(new T.EdgesGeometry(cg, 89), new T.LineBasicMaterial({ color: 0x9ff8ff }))); return gl;
    };
    // ammo bars laid in a panel of `mesh`: cast toward the axis from direction `ang` (0 = straight down onto the top)
    K.ammoBars = (mesh, ys, z0, gap, nb, ang, width) => {
      const am = st.ammo, lenK = 0.3 + 0.7 * (am - 1) / 4, lit = Math.round(nb * (st.frac ?? 1));
      g.updateMatrixWorld(true); const rc = new T.Raycaster(), on = new T.MeshBasicMaterial({ color: 0xc070ff }), off = new T.MeshBasicMaterial({ color: 0x3a1a55 });
      for (const s of [-1, 1]) for (let k = 0; k < nb; k++) {
        const z = z0 + k * gap, dir = new T.Vector3(-s * Math.sin(ang), -Math.cos(ang), 0), o = new T.Vector3(mesh.position.x, ys, z).addScaledVector(dir, -3);
        rc.set(o, dir); const hit = rc.intersectObject(mesh)[0]; if (!hit) continue;
        const nrm = hit.face.normal.clone().transformDirection(mesh.matrixWorld), fwd = new T.Vector3(0, 0, 1).addScaledVector(nrm, -nrm.z).normalize(), across = new T.Vector3().crossVectors(fwd, nrm).normalize();
        const W = (typeof width === 'function' ? width(z) : width), m = K.noEdge(new T.Mesh(new T.BoxGeometry(W * lenK, 0.028, 0.012), k < lit ? on : off));
        m.quaternion.setFromRotationMatrix(new T.Matrix4().makeBasis(across, fwd, nrm)); m.position.copy(hit.point).addScaledVector(nrm, 0.006);
        const inward = across.clone().multiplyScalar(across.x * s > 0 ? -1 : 1); m.position.addScaledVector(inward, W * (1 - lenK) / 2); g.add(m);
      }
    };
    return K;
  }

  const B = {};
  // ---- Blade: the dart hull of the first concept, swept wing with brake flaps, two hex nacelles, a rudder tail fin
  B.blade = (K, st) => {
    const { put } = K, sp = st.speed, th = st.thrust, hd = st.handling, sh = st.shield, hb = 0.9 + 0.05 * sh;
    const hull = K.pod(0, 0.12, -0.35, 4.0, 0.52 * hb, 0.62, { shape: (t) => Math.pow(Math.sin(Math.PI * Math.pow(t, 0.62)), 0.8) * 0.9 + 0.1 * t, fx: 1.25 });
    K.glassOn(hull, -0.3, -0.12);
    // armour cheeks low on the hull (shield)
    for (const s of [-1, 1]) { const c = put(K.finGeo([[0, 0], [0.8 + 0.25 * sh, 0], [0.7 + 0.25 * sh, 0.1 + 0.03 * sh], [0.15, 0.13 + 0.03 * sh]], 0.035 + 0.012 * sh), K.mA, s * 0.5 * hb, 0.05, -1.2); c.rotation.z = s * -1.2 }
    // nacelles (speed) on the wing tips' inner third
    const podX = 1.0 + 0.04 * sp, r = 0.2 + 0.02 * sp, len = 2.0 + 0.2 * sp;
    for (const s of [-1, 1]) K.nacelle(s * podX, 0.02, -0.9, r, len, { nL: 0.22 + 0.06 * th });
    // the wing: a swept panel from hull to nacelle and past it, with brake flaps (handling)
    const span = 0.55 + 0.1 * hd;
    for (const s of [-1, 1]) { put(new T.BoxGeometry(podX - 0.3, 0.06, 0.9), K.mD, s * (0.3 + (podX - 0.3) / 2), 0.0, 0.25);
      K.wingFlap(s * (podX + r * 0.9), 0.02, -0.1, 1.15, span, K.mS, s, { fixMat: K.mB, droop: 0.05 }) }
    K.finRudder(0, 0.38, 0.55, 1.0, 0.42 + 0.1 * hd, K.mS);
    K.ammoBars(hull, 0.12, 0.05, 0.044, 8, 0.85, 0.2);
  };
  // ---- Skiff: a hover bike, faceted tank body, the rider in a fairing with a flush visor, one big engine
  B.skiff = (K, st) => {
    const { put } = K, sp = st.speed, th = st.thrust, hd = st.handling, sh = st.shield, hb = 0.9 + 0.05 * sh;
    const body = K.pod(0, 0.14, -0.35, 3.2, 0.36 * hb, 0.85, { shape: (t) => Math.pow(Math.sin(Math.PI * Math.pow(t, 0.7)), 0.7) * 0.9 + 0.1 });
    // the rider: a faceted helmet and back, tucked low; visor as flush glass on the helmet
    const back = put(new T.CylinderGeometry(0.16, 0.2, 0.55, 6), K.mD, 0, 0.55, 0.2); back.rotation.x = -1.0;
    const helm = K.pod(0, 0.74, -0.15, 0.5, 0.17, 0.85, { shape: (t) => Math.sin(Math.PI * Math.pow(t, 0.8)), mat: K.mS, rings: 6 });
    K.glassOn(helm, -0.5, -0.05, 0.3);
    // fairing cheeks (shield)
    for (const s of [-1, 1]) { const c = put(K.finGeo([[0, 0], [0.75 + 0.2 * sh, 0], [0.62 + 0.2 * sh, 0.16 + 0.04 * sh], [0.12, 0.2 + 0.04 * sh]], 0.035 + 0.012 * sh), K.mA, s * 0.3 * hb, 0.06, -1.25); c.rotation.z = s * -0.7 }
    // the engine (speed) and side boosters (thrust)
    const r = 0.24 + 0.035 * sp, len = 0.9 + 0.14 * sp; K.nacelle(0, 0.12, 0.65, r, len, { mat: K.mS, bandMat: K.mD, nL: 0.25 });
    const br = 0.07 + 0.02 * th; for (const s of [-1, 1]) { put(K.cylZ(br, br, 0.5, 6), K.mT, s * (r + 0.12), 0.0, 0.95); K.nozzle(s * (r + 0.12), 0.0, 1.2, br * 0.95, 0.12) }
    // steering: front fork vanes and a tail fin are rudders; braking: small flaps either side of the engine
    for (const s of [-1, 1]) K.finRudder(s * 0.25, -0.02, -1.7, 0.55 + 0.06 * hd, 0.22 + 0.06 * hd, K.mS, { rz: s * 2.7, noLight: true });
    K.finRudder(0, 0.12 + r * 0.9, 0.95, 0.75, 0.28 + 0.07 * hd, K.mB);
    for (const s of [-1, 1]) K.wingFlap(s * r * 0.95, 0.12, 0.9, 0.6, 0.28 + 0.05 * hd, K.mS, s, { fixMat: K.mB, droop: -0.1 });
    K.ammoBars(body, 0.14, -1.2, 0.044, 8, 0.95, 0.16);
  };
  // ---- Hauler: a heavy slab with chamfered faces, four stacked nacelles, twin rudder fins, a rear wing that brakes,
  //      and the missile rack become a glowing ammo deck on the roof
  B.hauler = (K, st) => {
    const { put } = K, sp = st.speed, th = st.thrust, hd = st.handling, sh = st.shield, hb = 0.95 + 0.06 * sh;
    const bw = 1.45 * hb, bh = 0.62 * hb;
    const prof = new T.Shape(); // cross-section: a chamfered box
    const c = 0.16; prof.moveTo(-bw / 2 + c, -bh / 2); prof.lineTo(bw / 2 - c, -bh / 2); prof.lineTo(bw / 2, -bh / 2 + c); prof.lineTo(bw / 2, bh / 2 - c * 1.4); prof.lineTo(bw / 2 - c * 1.6, bh / 2); prof.lineTo(-bw / 2 + c * 1.6, bh / 2); prof.lineTo(-bw / 2, bh / 2 - c * 1.4); prof.lineTo(-bw / 2, -bh / 2 + c); prof.closePath();
    const geo = new T.ExtrudeGeometry(prof, { depth: 3.6, bevelEnabled: false }); geo.translate(0, 0, -2.0);
    const p = geo.attributes.position; for (let i = 0; i < p.count; i++) { const z = p.getZ(i); if (z < -1.0) { const k = 1 - 0.32 * (-1.0 - z); p.setX(i, p.getX(i) * k); p.setY(i, p.getY(i) * (0.85 + 0.15 * k) - (1 - k) * 0.12) } }
    geo.computeVertexNormals(); const hull = put(geo, K.mB, 0, 0.22, 0); hull.userData.L = 1;
    K.glassOn(hull, -1.75, -1.25, 0.3);
    // armour (shield): a chamfered nose bumper and side skirts
    put(new T.BoxGeometry(bw * 0.8, 0.18 + 0.05 * sh, 0.1 + 0.06 * sh), K.mA, 0, 0.0, -2.12);
    for (const s of [-1, 1]) { const k = put(K.finGeo([[0, 0], [1.4 + 0.3 * sh, 0], [1.3 + 0.3 * sh, 0.18 + 0.04 * sh], [0.1, 0.22 + 0.04 * sh]], 0.04 + 0.015 * sh), K.mA, s * (bw / 2 + 0.02), -0.02, -1.2); k.rotation.z = s * -0.4 }
    // four nacelles in two stacks (speed), nozzles (thrust)
    const r = 0.17 + 0.015 * sp, ex = bw / 2 + 0.26, len = 1.9 + 0.18 * sp;
    for (const s of [-1, 1]) for (const yy of [0.5, 0.06]) K.nacelle(s * ex, yy, -0.4, r, len, { nL: 0.2 + 0.05 * th, bandMat: K.mD });
    for (const s of [-1, 1]) put(new T.BoxGeometry(0.2, 0.62, 1.2), K.mD, s * (bw / 2 + 0.1), 0.28, 0.6);
    // rear wing across the stacks, with brake flaps; twin rudder fins on top
    for (const s of [-1, 1]) K.wingFlap(s * 0.05, 0.62 + 0.18, 1.0, 0.75, ex + 0.25 + 0.06 * hd, K.mS, s, { fixMat: K.mB, droop: 0 });
    for (const s of [-1, 1]) K.finRudder(s * 0.45, 0.22 + bh / 2, 0.75, 0.95, 0.34 + 0.09 * hd, K.mS);
    // the ammo deck: bars across the roof in a sunken dark panel, length = stat
    put(new T.BoxGeometry(bw * 0.55, 0.02, 1.0), K.mD, 0, 0.22 + bh / 2 + 0.005, -0.5);
    const am = st.ammo, lenK = 0.3 + 0.7 * (am - 1) / 4, lit = Math.round(10 * (st.frac ?? 1));
    for (let k = 0; k < 10; k++) K.noEdge(put(new T.BoxGeometry(bw * 0.5 * lenK, 0.012, 0.05), new T.MeshBasicMaterial({ color: k < lit ? 0xc070ff : 0x3a1a55 }), 0, 0.22 + bh / 2 + 0.018, -0.95 + k * 0.1));
  };
  // ---- Dart: a bevelled delta with the engines buried in the tail, wingtip rudders, elevon brake flaps
  B.dart = (K, st) => {
    const { put } = K, sp = st.speed, th = st.thrust, hd = st.handling, sh = st.shield, hb = 0.88 + 0.05 * sh;
    const span = 1.5 + 0.12 * hd, tail = 1.35, nose = 2.7, shp = new T.Shape();
    shp.moveTo(0, nose); shp.lineTo(span, -tail); shp.lineTo(span * 0.62, -tail + 0.12); shp.lineTo(span * 0.3, -tail + 0.32); shp.lineTo(-span * 0.3, -tail + 0.32); shp.lineTo(-span * 0.62, -tail + 0.12); shp.lineTo(-span, -tail); shp.closePath();
    const wg = new T.ExtrudeGeometry(shp, { depth: 0.06, bevelEnabled: true, bevelThickness: 0.03, bevelSize: 0.05, bevelSegments: 1 }); wg.rotateX(-Math.PI / 2); put(wg, K.mB, 0, -0.04, 0);
    const body = K.pod(0, 0.12, -0.5, 4.0, 0.34 * hb, 0.62, { shape: (t) => Math.pow(Math.sin(Math.PI * Math.pow(t, 0.6)), 0.7) * 0.9 + 0.1 * t, fx: 1.2 });
    K.glassOn(body, -0.32, -0.12);
    for (const s of [-1, 1]) { const c = put(K.finGeo([[0, 0], [0.8 + 0.25 * sh, 0], [0.7 + 0.25 * sh, 0.09 + 0.03 * sh], [0.15, 0.12 + 0.03 * sh]], 0.035 + 0.01 * sh), K.mA, s * 0.36 * hb, 0.05, -1.5); c.rotation.z = s * -1.25 }
    // two engines buried in the tail (speed), nozzles (thrust)
    const r = 0.15 + 0.02 * sp; for (const s of [-1, 1]) { put(K.cylZ(r * 1.05, r * 1.05, 1.0, 8), K.mS, s * 0.42, 0.06, 0.7).rotation.z = Math.PI / 8; K.nozzle(s * 0.42, 0.06, 1.2, r * 0.9, 0.18 + 0.05 * th) }
    // elevons (brake) on the trailing edge, wingtip rudders (steer)
    for (const s of [-1, 1]) K.wingFlap(s * span * 0.3, 0.0, 0.85, 0.55, span * 0.42, K.mS, s, { fixMat: K.mD, droop: 0 });
    for (const s of [-1, 1]) K.finRudder(s * span * 0.95, 0.0, 0.5, 0.75, 0.25 + 0.09 * hd, K.mS);
    K.ammoBars(body, 0.12, -0.05, 0.044, 8, 0.85, 0.15);
  };
  // ---- Orb: a faceted ball with a rolling stripe band, a flush window, engines on pylons, side brake flaps, a rudder fin
  B.orb = (K, st) => {
    // A clean rolling ball that does the driving, and a tiny pilot pod flying above and behind it on two energy tethers.
    // The ball's band widens with shield; its engines sit behind on a short fixed axle; the pod carries the canopy, the
    // ammo bars, the rudder and the brake winglets, and a small booster.
    const { put } = K, sp = st.speed, th = st.thrust, hd = st.handling, sh = st.shield, R = 0.92, cy = 0.42;
    const rollG = new T.Group(); rollG.position.set(0, cy, 0); K.g.add(rollG);
    put(new T.IcosahedronGeometry(R, 1), K.mB, 0, 0, 0, rollG);
    const bw = 0.12 + 0.05 * sh; // the band, wider with shield (armour)
    for (let k = 0; k < 12; k++) { const a = k / 12 * Math.PI * 2, m = put(new T.BoxGeometry(bw, 0.06, 2 * Math.PI * R / 12 * 0.98), k % 2 ? K.mS : K.mA, 0, Math.cos(a) * R * 0.99, Math.sin(a) * R * 0.99, rollG); m.rotation.x = a }
    for (let k = 0; k < 6; k++) { const a = k / 6 * Math.PI * 2 + 0.5, sd = k % 2 ? 1 : -1, d = new T.Vector3(sd * 0.55, Math.sin(a) * 0.75, Math.cos(a) * 0.75).normalize().multiplyScalar(R * 0.985);
      const m = K.noEdge(put(new T.CircleGeometry(0.12, 6), K.mS, d.x, d.y, d.z, rollG)); m.lookAt(d.clone().multiplyScalar(2).add(rollG.position)) }
    rollG.rotation.x = -(st.roll || 0);
    // nothing on the sides: a faceted cradle cups the back of the ball (fixed), carrying the engines (speed) low on its flanks
    const cr = new T.SphereGeometry(R * 1.07, 8, 5, Math.PI * 0.3, Math.PI * 0.4, Math.PI * 0.42, Math.PI * 0.4);
    put(cr, new T.MeshLambertMaterial({ color: 0x161a22, flatShading: true, side: T.DoubleSide }), 0, cy, 0);
    const r = 0.17 + 0.03 * sp, len = 0.6 + 0.12 * sp;
    for (const s of [-1, 1]) { put(new T.BoxGeometry(0.34, 0.08, 0.22), K.mD, s * 0.5, cy - 0.1, R * 0.86); K.nacelle(s * 0.62, cy - 0.12, R * 0.7, r, len, { nL: 0.18, bandMat: K.mD }) }
    // the pod: tiny, high and behind
    const pz = R + 0.38, py = cy + R * 0.98, pl = 1.05;
    const pod = K.pod(0, py, pz, pl, 0.24, 0.8, { mat: K.mB });
    K.glassOn(pod, -0.36, -0.1);
    K.finRudder(0, py + 0.12, pz + 0.05, 0.42, 0.2 + 0.06 * hd, K.mS, { t: 0.035 });
    for (const s of [-1, 1]) K.wingFlap(s * 0.2, py - 0.02, pz - 0.05, 0.4, 0.16 + 0.07 * hd, K.mS, s, { fixMat: K.mB, droop: 0.15, t: 0.03 });
    const br = 0.05 + 0.02 * th; K.nozzle(0, py, pz + pl / 2 - 0.08, br, 0.08 + 0.02 * th);
    K.ammoBars(pod, py, pz - 0.02, 0.034, 7, 0.85, 0.1);
    // the energy tethers: from the top of the cradle up to the pod, pulsing in the stripe colour
    const tm = new T.MeshBasicMaterial({ color: K.mS.color, transparent: true, opacity: 0.7, blending: T.AdditiveBlending, depthWrite: false });
    for (const s of [-1, 1]) { const a = new T.Vector3(s * 0.2, cy + R * 0.3, R * 1.02), b = new T.Vector3(s * 0.12, py - 0.1, pz - 0.2), d = b.clone().sub(a), Ln = d.length();
      const beam = K.noEdge(new T.Mesh(new T.CylinderGeometry(0.025, 0.025, Ln, 5, 1, true), tm)); beam.position.copy(a).addScaledVector(d, 0.5); beam.quaternion.setFromUnitVectors(new T.Vector3(0, 1, 0), d.normalize()); K.g.add(beam);
      const core = K.noEdge(new T.Mesh(new T.CylinderGeometry(0.008, 0.008, Ln, 4), K.glow)); core.position.copy(beam.position); core.quaternion.copy(beam.quaternion); K.g.add(core) }
  };
  // ---- Roller: the hover car, its rounded body made faceted, flush glass, the rear wing brakes, its endplates steer
  B.roller = (K, st) => {
    const { put } = K, sp = st.speed, th = st.thrust, hd = st.handling, sh = st.shield, hb = 0.95 + 0.05 * sh, bw = 1.3 * hb;
    const shp = new T.Shape(); shp.moveTo(-1.9, 0.18); shp.lineTo(1.75, 0.18); shp.lineTo(2.08, 0.3); shp.lineTo(1.2, 0.5); shp.lineTo(0.55, 0.64); shp.lineTo(-0.2, 0.8); shp.lineTo(-0.95, 0.76); shp.lineTo(-1.6, 0.66); shp.lineTo(-1.98, 0.48); shp.closePath();
    const bg = new T.ExtrudeGeometry(shp, { depth: bw - 0.24, bevelEnabled: true, bevelThickness: 0.12, bevelSize: 0.1, bevelSegments: 1 }); bg.translate(0, 0, -(bw - 0.24) / 2); bg.rotateY(Math.PI / 2); bg.computeVertexNormals();
    const body = put(bg, K.mB, 0, 0, 0); body.userData.L = 1;
    K.glassOn(body, -0.6, 0.35, 0.55);
    // discs (spin in the game): flat, with a lit rim set in their edge
    const dr = 0.42, dx = bw / 2 + 0.08;
    // the anti-grav pads glow as before: a lit rim, the amber core underneath, and a cone of cyan light down to the road
    const fieldM = new T.MeshBasicMaterial({ color: 0x3ff0ff, transparent: true, opacity: 0.24, blending: T.AdditiveBlending, depthWrite: false, side: T.DoubleSide });
    for (const z of [-1.25, 1.2]) for (const s of [-1, 1]) { const dg = new T.Group(); dg.position.set(s * dx, 0.2, z); dg.rotation.y = st.spin || 0; K.g.add(dg);
      put(new T.CylinderGeometry(dr, dr * 0.92, 0.11, 8), K.mD, 0, 0, 0, dg);
      const rim = K.noEdge(put(new T.TorusGeometry(dr * 0.96, 0.028, 4, 8), K.glow, 0, 0, 0, dg)); rim.rotation.x = Math.PI / 2;
      for (let k = 0; k < 3; k++) { const v = put(new T.BoxGeometry(dr * 1.6, 0.02, 0.06), K.mT, 0, 0.065, 0, dg); v.rotation.y = k * Math.PI / 3 }
      const core = K.noEdge(put(new T.CircleGeometry(dr * 0.82, 8), K.hot, s * dx, 0.14, z)); core.rotation.x = Math.PI / 2;
      K.noEdge(put(new T.CylinderGeometry(dr * 0.9, dr * 0.6, 0.26, 8, 1, true), fieldM, s * dx, 0.02, z));
      const pr = K.noEdge(put(new T.TorusGeometry(dr * 0.8, 0.02, 4, 8), fieldM, s * dx, -0.06, z)); pr.rotation.x = Math.PI / 2 }
    // armour (shield): nose and tail guards, side skirts
    put(new T.BoxGeometry(bw * 0.8, 0.1 + 0.04 * sh, 0.08 + 0.05 * sh), K.mA, 0, 0.24, -2.1);
    for (const s of [-1, 1]) { const k = put(K.finGeo([[0, 0], [1.2 + 0.3 * sh, 0], [1.1 + 0.3 * sh, 0.12 + 0.03 * sh], [0.1, 0.15 + 0.03 * sh]], 0.04 + 0.012 * sh), K.mA, s * (bw / 2 + 0.04), 0.22, -0.6); k.rotation.z = s * -0.2 }
    // exhausts (speed) and booster (thrust) as nozzles in the tail
    for (const s of [-1, 1]) { put(K.cylZ(0.1 + 0.02 * sp, 0.1 + 0.02 * sp, 0.3, 6), K.mT, s * 0.4, 0.32, 1.95); K.nozzle(s * 0.4, 0.32, 2.08, (0.1 + 0.02 * sp) * 0.95, 0.12) }
    // rear wing on two struts with a brake flap; its endplates are the rudders
    const sw = bw * 0.5 + 0.08 * (hd - 1), wy = 0.98 + 0.05 * hd;
    for (const s of [-1, 1]) { const stt = put(new T.BoxGeometry(0.05, wy - 0.6, 0.22), K.mD, s * 0.32, (wy + 0.6) / 2, 1.55); stt.rotation.x = 0.25 }
    for (const s of [-1, 1]) K.wingFlap(s * 0.02, wy, 1.3, 0.55, sw, K.mS, s, { fixMat: K.mB, droop: -0.03 });
    for (const s of [-1, 1]) K.finRudder(s * (sw + 0.03), wy - 0.12, 1.25, 0.65, 0.32, K.mS, { rf: 0.62, sweep: 0.25 });
    K.ammoBars(body, 0.5, 0.75, 0.05, 8, 0.6, 0.24);
  };
  // ---- Mono: the big ring (rolls in the game) round a faceted pod with a flush canopy; axle engines; brakes and rudders
  B.mono = (K, st) => {
    const { put } = K, sp = st.speed, th = st.thrust, hd = st.handling, sh = st.shield, R = 1.02, tube = 0.16, cy = R + tube + 0.2 - 1.05 - (R + tube + 0.2 - R - tube) + 0.02;
    const ring = put(new T.TorusGeometry(R, tube, 6, 24), K.mB, 0, cy, 0); ring.rotation.y = Math.PI / 2;
    const inner = put(new T.TorusGeometry(R - tube * 0.9, 0.035, 4, 24), K.mS, 0, cy, 0); inner.rotation.y = Math.PI / 2;
    for (let k = 0; k < 12; k++) { const a = k / 12 * Math.PI * 2, m = put(new T.BoxGeometry(tube * 2.2, 0.05, 0.2), k % 2 ? K.mD : K.lam(0x24303c), 0, cy + Math.cos(a) * (R + tube * 0.9), Math.sin(a) * (R + tube * 0.9)); m.rotation.x = a }
    const pod = K.pod(0, cy - 0.15, 0.05, 1.3, 0.42, 0.8, { mat: K.mB });
    K.glassOn(pod, -0.42, -0.1);
    put(K.cylZ(0.1, 0.1, tube * 2.6 + 0.5, 6), K.mT, 0, cy, 0).rotation.y = Math.PI / 2;
    // axle engines (speed) with nozzles; booster under the pod (thrust)
    const r = 0.15 + 0.028 * sp, len = 0.7 + 0.12 * sp, ex = tube + 0.38;
    for (const s of [-1, 1]) { put(new T.BoxGeometry(ex - 0.05, 0.07, 0.2), K.mD, s * ex / 2, cy, 0); K.nacelle(s * ex, cy - 0.05, -0.2, r, len, { nL: 0.16, bandMat: K.mD }) }
    const br = 0.07 + 0.03 * th; put(K.cylZ(br, br, 0.3, 6), K.mT, 0, cy - 0.45, 0.45); K.nozzle(0, cy - 0.45, 0.6, br * 0.95, 0.1);
    // armour (shield) as low sponsons on the pod
    for (const s of [-1, 1]) { const c = put(K.finGeo([[0, 0], [0.5 + 0.12 * sh, 0], [0.42 + 0.12 * sh, 0.1 + 0.03 * sh], [0.1, 0.13 + 0.03 * sh]], 0.035 + 0.01 * sh), K.mA, s * 0.32, cy - 0.25, -0.15); c.rotation.z = s * -1.1 }
    // rudders on top of each engine, brake flaps outboard
    for (const s of [-1, 1]) K.finRudder(s * ex, cy - 0.05 + r * 0.9, -0.05, 0.55, 0.2 + 0.07 * hd, K.mS);
    for (const s of [-1, 1]) K.wingFlap(s * (ex + r * 0.9), cy - 0.05, 0.0, 0.5, 0.2 + 0.06 * hd, K.mS, s, { fixMat: K.mB, droop: 0.1 });
    K.ammoBars(pod, cy - 0.15, 0.1, 0.044, 6, 0.85, 0.16);
  };

  window.frame2 = (name, paint, st) => { const g = new T.Group(), K = kit(g, paint, st); B[name](K, st); return g };
})();
