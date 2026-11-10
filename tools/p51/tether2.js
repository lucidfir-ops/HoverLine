// Concept Tether: the same layout (two engines ahead, the pilot's pod towed behind on cables, an energy arc between the
// engines), with designed fins and a designed pod. Stats still grow the parts, as in the game.
window.tether2 = (paint, st) => {
  const g = new THREE.Group(), T = THREE;
  const lam = (c) => new T.MeshLambertMaterial({ color: c, flatShading: true });
  const put = (geo, m, x, y, z) => { const me = new T.Mesh(geo, m); me.position.set(x, y, z); g.add(me); return me };
  const cylZ = (r1, r2, len, seg) => { const c = new T.CylinderGeometry(r1, r2, len, seg); c.rotateX(Math.PI / 2); return c };
  const sp = st.speed, th = st.thrust, hd = st.handling, sh = st.shield, am = st.ammo, hb = 0.88 + 0.06 * sh;
  const mB = lam(paint.body), mS = lam(paint.stripe), mD = lam(0x161a22), mA = lam(0x8a93a3), mT = lam(0x2a2e36);
  const glow = new T.MeshBasicMaterial({ color: 0x3ff0ff }), hot = new T.MeshBasicMaterial({ color: 0xffc040 });

  // a thin fin from a 2D outline (x back, y up), bevelled so it has a real edge, thinner at the tip
  const fin = (pts, thick) => {
    const s = new T.Shape(); s.moveTo(pts[0][0], pts[0][1]); for (const q of pts.slice(1)) s.lineTo(q[0], q[1]);
    const geo = new T.ExtrudeGeometry(s, { depth: thick, bevelEnabled: true, bevelThickness: thick * 0.4, bevelSize: thick * 0.5, bevelSegments: 1, steps: 1 });
    geo.translate(0, 0, -thick / 2); geo.rotateY(-Math.PI / 2); // outline x -> +z (back), extrusion -> x
    const p = geo.attributes.position, ymax = Math.max(...pts.map((q) => q[1]));
    for (let i = 0; i < p.count; i++) { const k = 1 - 0.65 * Math.max(0, p.getY(i)) / ymax; p.setX(i, p.getX(i) * k) } // thinner toward the tip
    geo.computeVertexNormals(); return geo;
  };
  // a moving surface hinged on a fin: its outline starts at the hinge (x=0); it swings about the fin's span (out of the fin's plane)
  const hinge = (parent, outline, thick, mat, hz, ang) => { const pv = new T.Group(); pv.position.set(0, 0, hz); parent.add(pv); const m = new T.Mesh(fin(outline, thick), mat); pv.add(m); pv.rotation.y = ang; return pv };
  const BRK = st.brake || 0, STR = st.steer || 0;
  // a lit strip along two points (leading edges, tips)
  const strip = (a, b, r = 0.022) => { const d = new T.Vector3().subVectors(b, a), L = d.length(), m = new T.Mesh(new T.BoxGeometry(r, r, L), glow); m.position.copy(a).addScaledVector(d, 0.5); m.lookAt(b); m.userData.noEdge = 1; g.add(m); return m };

  // ---- the engines (as before: these were already good), hexagonal glow rings at the exhaust
  const er = 0.3 + 0.035 * sp, el = 2.2 + 0.22 * sp, ex = 1.0 + 0.04 * sp, ey = 0.16, z0 = -3.4, zr = z0 + el;
  for (const s of [-1, 1]) {
    const x = s * ex;
    put(cylZ(er, er * 0.9, el, 14), mB, x, ey, z0 + el / 2);
    for (const bz of [z0 + 0.12, z0 + el * 0.62]) put(cylZ(er * 1.09, er * 1.09, 0.2, 14), mS, x, ey, bz);
    put(new T.CircleGeometry(er * 0.9, 14), mD, x, ey, z0 - 0.015).rotation.y = Math.PI;
    const nL = 0.22 + 0.08 * th, nzG = new T.CylinderGeometry(er * 0.72, er * (0.8 + 0.05 * th), nL, 6, 1, true); nzG.rotateX(Math.PI / 2); put(nzG, new T.MeshLambertMaterial({ color: 0x2a2e36, flatShading: true, side: T.DoubleSide }), x, ey, zr + nL / 2);
    // the exhaust: a lip around a recessed hot core, set inside the nozzle (no ring stuck on the end)
    // the nozzle's open end has radius re; the rim runs from the glow's edge out to it, attached to the nozzle wall
    const re = er * 0.72, ri = re * (st.lipIn || 0.85), cr = st.nolip ? re : ri;
    if (!st.nolip) { const lip = put(new T.RingGeometry(ri, re, 6), mD, x, ey, zr + nL + 0.002); lip.rotation.z = Math.PI / 2; lip.userData.noEdge = 1 }
    const well = put(cylZ(cr, cr, 0.12, 6), new T.MeshBasicMaterial({ color: 0x2a1404, side: T.BackSide }), x, ey, zr + nL - 0.06); well.userData.noEdge = 1;
    const core = put(new T.CircleGeometry(cr, 6), hot, x, ey, zr + nL - 0.11); core.rotation.z = Math.PI / 2; core.userData.noEdge = 1;

    // ---- handling: a swept dorsal fin on each engine (grows with handling) ...
    const fh = 0.28 + 0.1 * hd, fl = 0.6 + 0.09 * hd, fz = z0 + el * 0.5;
    // the fixed fin ends in a straight hinge line; behind it a rudder swings with the steering
    const xr = fl * 0.66, dors = put(fin([[0, 0], [xr, 0], [xr, fh * 0.92], [fl * 0.35 + fh * 0.55, fh], [fl * 0.15, fh * 0.2]], 0.05), mS, x, ey + er * 0.9, fz);
    const rl = fl * 0.38; hinge(dors, [[0, 0], [rl, 0], [rl * 0.75, fh * 0.85], [0, fh * 0.92]], 0.04, mS, xr + 0.01, -STR * 0.5);
    strip(new T.Vector3(x, ey + er * 0.9 + fh * 0.2, fz + fl * 0.15), new T.Vector3(x, ey + er * 0.9 + fh, fz + fl * 0.35 + fh * 0.55));
    // ... and an outboard canard: a swept delta, angled down, with a tip light
    const cw = 0.32 + 0.1 * hd;
    // the canard ends in a hinge line; behind it an airbrake flap kicks up when braking
    const can = put(fin([[0, 0], [0.52, 0], [0.5, cw], [0.42, cw]], 0.04), mB, s * (ex + er * 0.85), ey - 0.02, z0 + el * 0.32);
    const fp = hinge(can, [[0, 0], [0.24, 0], [0.12, cw * 0.95], [0, cw * 0.95]], 0.03, mS, 0.53, -s * BRK * 1.0);
    { // a brake light along the flap's trailing edge: dark when cruising, glowing red-orange in proportion to the brake
      const a0 = new T.Vector3(0, 0, 0.24), b0 = new T.Vector3(0, cw * 0.95, 0.12), d = b0.clone().sub(a0), L = d.length();
      const col = new T.Color(0x2a1210).lerp(new T.Color(0xff5a2a), BRK);
      const m = new T.Mesh(new T.BoxGeometry(0.045, 0.02, L), new T.MeshBasicMaterial({ color: col })); m.position.copy(a0).addScaledVector(d, 0.5); m.lookAt(b0); m.userData.noEdge = 1; fp.add(m) }
    can.rotation.z = s * (-Math.PI / 2 - 0.25);
    const tip = put(new T.BoxGeometry(0.05, 0.05, 0.22), hot, s * (ex + er * 0.85 + Math.cos(0.25) * cw), ey - 0.02 - Math.sin(0.25) * cw, z0 + el * 0.32 + 0.52); tip.userData.noEdge = 1;
  }
  // ---- the energy arc between the engines (as before)
  const aw = 2 * (ex - er) - 0.05, arcM = new T.MeshBasicMaterial({ color: paint.stripe, transparent: true, opacity: .6, blending: T.AdditiveBlending, depthWrite: false, side: T.DoubleSide });
  put(new T.PlaneGeometry(aw, 0.2), arcM, 0, ey, z0 + el * 0.3); put(new T.PlaneGeometry(aw, 0.07), arcM, 0, ey, z0 + el * 0.62);

  // ---- the pilot's pod: a faceted teardrop (an 8-sided lathe), nose ring facing the engines, a gem canopy set in a
  //      spine, swept armour cheeks (shield), a short tail fin, ammo pods slung under
  const ze = zr + 0.22 + 0.08 * th, cz = ze + 1.35, pl = 1.9;
  const prof = []; for (let i = 0; i <= 8; i++) { const t = i / 8, r = (Math.sin(Math.PI * Math.pow(t, 0.75)) * 0.82 + 0.18 * (1 - t)) * 0.4 * hb; prof.push(new T.Vector2(Math.max(0.02, r), (t - 0.5) * pl)) }
  const podG = new T.LatheGeometry(prof, 8); podG.rotateX(Math.PI / 2); podG.scale(1, 0.72, 1); // flatter than round
  const pod = put(podG, mB, 0, 0.12, cz); pod.rotation.z = Math.PI / 8;
  // the canopy is the pod's own top facets ahead of the middle, as glass: flush with the hull, framed by its edges
  { const gp = podG.clone().toNonIndexed(); gp.rotateZ(Math.PI / 8); const P = gp.attributes.position, keep = [];
    let ymax = 0; for (let i = 0; i < P.count; i++) ymax = Math.max(ymax, P.getY(i));
    // whole facets between two rings of the pod (so the glass ends square at the front and back), facing upward
    const zA = -pl * (st.glassF ?? 0.375) - 1e-3, zB = -pl * (st.glassB ?? 0.125) + 1e-3, va = new T.Vector3(), vb = new T.Vector3(), vc = new T.Vector3();
    for (let i = 0; i < P.count; i += 3) { va.fromBufferAttribute(P, i); vb.fromBufferAttribute(P, i + 1); vc.fromBufferAttribute(P, i + 2);
      const nrm = new T.Vector3().crossVectors(vb.clone().sub(va), vc.clone().sub(va)).normalize(), zmin = Math.min(va.z, vb.z, vc.z), zmax = Math.max(va.z, vb.z, vc.z);
      if (Math.abs(nrm.y) > (st.glassN ?? 0.75) && Math.max(va.y, vb.y, vc.y) > 0 && zmin >= zA && zmax <= zB) for (let k = 0; k < 3; k++) keep.push(P.getX(i + k) * 1.012, P.getY(i + k) * 1.012 + 0.002, P.getZ(i + k)) }
    const cg = new T.BufferGeometry(); cg.setAttribute('position', new T.Float32BufferAttribute(keep, 3)); cg.computeVertexNormals();
    const glass = put(cg, new T.MeshLambertMaterial({ color: 0x3a8aa6, emissive: 0x0c3a4a, flatShading: true }), 0, 0.12, cz); glass.userData.noEdge = 1;
    glass.add(new T.LineSegments(new T.EdgesGeometry(cg, 89), new T.LineBasicMaterial({ color: 0x9ff8ff }))) }
  for (const s of [-1, 1]) {
    const ch = put(fin([[0, 0], [0.5 + 0.12 * sh, 0], [0.42 + 0.12 * sh, 0.1 + 0.03 * sh], [0.12, 0.13 + 0.03 * sh]], 0.035 + 0.012 * sh), mA, s * 0.3 * hb, 0.02, cz - 0.05);
    ch.rotation.z = s * -1.15; // armour sponsons, swept out low
    if (!st.ammoStyle) { const aL = 0.35 + 0.17 * am; strip(new T.Vector3(s * 0.31 * hb, 0.17, cz + 0.55 - aL), new T.Vector3(s * 0.29 * hb, 0.17, cz + 0.55), 0.018) } // side light: as long as the ammo stat
    else strip(new T.Vector3(s * 0.31 * hb, 0.17, cz - 0.6), new T.Vector3(s * 0.29 * hb, 0.17, cz + 0.2), 0.016); // plain side light
  }
  { // tail fin: its root follows the pod's top surface, so it grows straight out of the hull (no spine under it)
    g.updateMatrixWorld(true); const rc = new T.Raycaster(), zs = cz + 0.2, L = 0.62, H = 0.36, surf = (z) => { rc.set(new T.Vector3(0, 3, z), new T.Vector3(0, -1, 0)); const h = rc.intersectObject(pod)[0]; return h ? h.point.y : 0.12 };
    const y0 = surf(zs), base = []; for (let i = 0; i <= 6; i++) { const x = L * i / 6; base.push([x, surf(zs + x) - y0 - 0.015]) }
    const xr = L * 0.7, bi = base.filter((q) => q[0] <= xr + 1e-6), yr = bi[bi.length - 1][1];
    const out = [...bi, [xr, yr + H * 0.88], [L * 0.62, base[6][1] + H * 0.95], [L * 0.2, base[0][1] + 0.05]];
    const tf = put(fin(out, 0.04), mS, 0, y0, zs);
    const rb = base.filter((q) => q[0] >= xr - 1e-6).map((q) => [q[0] - xr, q[1] - yr]);
    const rud = hinge(tf, [...rb, [L * 1.02 - xr, base[6][1] - yr + H * 0.9], [0.0, H * 0.88]], 0.035, mS, xr + 0.005, -STR * 0.5); rud.position.y = yr }
  // ---- the cables
  const mC = lam(0x161a22);
  const rod = (a, b, r) => { const d = new T.Vector3().subVectors(b, a), L = d.length(), m = new T.Mesh(new T.CylinderGeometry(r, r, L, 5), mC); m.position.copy(a).addScaledVector(d, 0.5); m.quaternion.setFromUnitVectors(new T.Vector3(0, 1, 0), d.normalize()); g.add(m) };
  for (const s of [-1, 1]) { rod(new T.Vector3(s * (ex - er * 0.5), ey, zr - 0.15), new T.Vector3(s * 0.2, 0.12, cz - 0.8), 0.028); rod(new T.Vector3(s * (ex - er * 0.2), ey + er * 0.5, z0 + el * 0.5), new T.Vector3(s * 0.16, 0.22, cz - 0.75), 0.02) }
  // ---- ammo shown as glow (purple, the colour of the ammo strips); one cell per ammo point
  const AM = new T.MeshBasicMaterial({ color: 0xc070ff }), AMd = new T.MeshBasicMaterial({ color: 0x3a1a55 });
  const lit = (geo, x, y, z, on) => { const m = put(geo, on ? AM : AMd, x, y, z); m.userData.noEdge = 1; return m };
  const sty = st.ammoStyle, n = am, shown = st.ammoLeft ?? n;
  if (sty === 'pips') { // a magazine readout: five slots along each flank, lit up to the ammo stat
    for (const s of [-1, 1]) for (let k = 0; k < 5; k++) { if (k >= n) continue; const m = lit(new T.BoxGeometry(0.035, 0.07, 0.11), s * (0.305 * hb - 0.006 * k), 0.07, cz - 0.05 + k * 0.15, k < shown); m.rotation.z = s * 0.35 } }
  if (sty === 'rings') { // glowing bands round the back of each engine, one per point: seen from the chase camera
    for (const s of [-1, 1]) for (let k = 0; k < n; k++) lit(cylZ(er * 1.035, er * 1.035, 0.06, 14), s * ex, ey, zr - 0.18 - k * 0.13, k < shown) }
  if (sty === 'beads') { // charge beads riding the tether cables
    for (const s of [-1, 1]) { const a = new T.Vector3(s * (ex - er * 0.5), ey, zr - 0.15), b = new T.Vector3(s * 0.2, 0.12, cz - 0.8);
      for (let k = 0; k < n; k++) { const t = 0.18 + k * 0.16, m = lit(new T.OctahedronGeometry(0.075, 0), 0, 0, 0, k < shown); m.position.copy(a).lerp(b, t) } } }
  if (sty === 'spine') { // the pod's spine as a cell meter
    for (let k = 0; k < n; k++) lit(new T.BoxGeometry(0.09, 0.045, 0.1), 0, 0.12 + 0.27 * hb * 0.72 + 0.04, cz + 0.12 + k * 0.13, k < shown) }
  if (sty === 'flank') { // cells on the angled upper facets either side of the spine, on the pod's rear half
    g.updateMatrixWorld(true); const rc = new T.Raycaster(), up = 0.12, ang = st.flankAng ?? 0.85;
    const per = st.perPoint ?? 2, z0b = cz + (st.barZ0 ?? 0.15), gapB = st.barGap ?? 0.044;
    const nb = st.bars ?? (st.statMode === 'count' ? 3 + n : 8), lenK = st.statMode === 'len' ? 0.3 + 0.7 * (n - 1) / 4 : 1;
    for (const s of [-1, 1]) for (let k = 0; k < nb; k++) {
      const z = z0b + k * gapB, dir = new T.Vector3(-s * Math.sin(ang), -Math.cos(ang), 0), o = new T.Vector3(0, up, z).addScaledVector(dir, -2);
      rc.set(o, dir); const hit = rc.intersectObject(pod)[0]; if (!hit) continue;
      const nrm = hit.face.normal.clone().transformDirection(pod.matrixWorld);
      // a bar across the panel, as wide as the panel is there (it narrows with the pod's taper), laid in its plane
      const tt = (z - cz) / pl + 0.5, rr = (Math.sin(Math.PI * Math.pow(tt, 0.75)) * 0.82 + 0.18 * (1 - tt)) * 0.4 * hb, side = 2 * rr * Math.sin(Math.PI / 8) * 0.86;
      const fwd = new T.Vector3(0, 0, 1).addScaledVector(nrm, -nrm.z).normalize(), across = new T.Vector3().crossVectors(fwd, nrm).normalize();
      const m = lit(new T.BoxGeometry(side * 0.78 * lenK, st.barW ?? 0.028, 0.012), 0, 0, 0, k < Math.round(nb * (st.frac ?? shown / Math.max(1, n))));
      m.quaternion.setFromRotationMatrix(new T.Matrix4().makeBasis(across, fwd, nrm)); m.position.copy(hit.point).addScaledVector(nrm, 0.006);
      const inward = across.clone().multiplyScalar(across.x * s > 0 ? -1 : 1); m.position.addScaledVector(inward, side * 0.78 * (1 - lenK) / 2); } } // short bars sit against the spine
  if (sty === 'tank') { // a glowing cell set into the pod's back, filling with the stat
    const H = 0.06 + 0.035 * n; lit(new T.BoxGeometry(0.26, H, 0.04), 0, 0.02 + H / 2, cz + pl / 2 - 0.42, true); }
  // centre it like the game's model
  return g;
};
