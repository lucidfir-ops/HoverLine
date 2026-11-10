(() => {
  const W = 640, H = 400;
  const cv = document.createElement('canvas'); cv.id = 'mockc'; cv.width = W * 2; cv.height = H * 2;
  Object.assign(cv.style, { position: 'fixed', left: 0, top: 0, width: W + 'px', height: H + 'px', zIndex: 99999 });
  document.body.appendChild(cv);
  const R = new THREE.WebGLRenderer({ canvas: cv, antialias: true, preserveDrawingBuffer: true }); R.setSize(W, H, false); R.setPixelRatio(2);
  const { makeShip, ROSTER } = window.__mk;

  // ---------- look ideas ----------
  const solid = (o) => o.isMesh && o.visible && o.material && !o.material.transparent && o.material.blending !== THREE.AdditiveBlending && o.material.isMeshLambertMaterial;
  // 1. light edges: a glowing line on every hard edge (Tron)
  function edges(g, col, thr = 28) {
    const lm = new THREE.LineBasicMaterial({ color: col });
    g.traverse((o) => { if (solid(o) && !o.userData.noEdge) { const e = new THREE.LineSegments(new THREE.EdgesGeometry(o.geometry, thr), lm); o.add(e) } });
  }
  // 2. two-tone: faceted shading and a baked gradient (dark belly, bright spine) instead of flat plastic
  function tone(g) {
    g.updateMatrixWorld(true);
    g.traverse((o) => {
      if (!solid(o)) return;
      const geo = o.geometry.index ? o.geometry.toNonIndexed() : o.geometry.clone(); const p = geo.attributes.position, c = new Float32Array(p.count * 3), v = new THREE.Vector3();
      for (let i = 0; i < p.count; i++) { v.set(p.getX(i), p.getY(i), p.getZ(i)).applyMatrix4(o.matrixWorld); const k = THREE.MathUtils.clamp(0.42 + (v.y + 0.1) * 0.9, 0.38, 1.05); c[i * 3] = c[i * 3 + 1] = c[i * 3 + 2] = k }
      geo.setAttribute('color', new THREE.BufferAttribute(c, 3)); geo.computeVertexNormals(); o.geometry = geo;
      const m = o.material.clone(); m.vertexColors = true; m.flatShading = true; m.needsUpdate = true; o.material = m;
    });
  }
  // 3. livery: a tiny canvas texture with panel seams, a race number and a hazard band
  function livery(base, stripe, num) {
    const S = 128, c = document.createElement('canvas'); c.width = c.height = S; const x = c.getContext('2d');
    const hex = (n) => '#' + n.toString(16).padStart(6, '0');
    x.fillStyle = hex(base); x.fillRect(0, 0, S, S);
    x.strokeStyle = 'rgba(0,0,0,.45)'; x.lineWidth = 1.2;
    for (const [a, b, cc, d] of [[0, 34, 128, 34], [0, 92, 128, 92], [44, 0, 44, 34], [88, 34, 88, 92], [30, 92, 30, 128], [100, 92, 100, 128]]) { x.beginPath(); x.moveTo(a, b); x.lineTo(cc, d); x.stroke() }
    x.fillStyle = 'rgba(255,255,255,.10)'; x.fillRect(0, 35, 128, 3);
    x.fillStyle = hex(stripe); x.fillRect(0, 56, 128, 14);
    x.fillStyle = 'rgba(0,0,0,.55)'; for (let k = -2; k < 12; k++) { x.beginPath(); x.moveTo(k * 12, 70); x.lineTo(k * 12 + 7, 70); x.lineTo(k * 12 + 14, 56); x.lineTo(k * 12 + 7, 56); x.fill() }
    x.font = 'bold 26px monospace'; x.textAlign = 'center'; x.fillStyle = 'rgba(255,255,255,.85)'; x.fillText(num, 64, 26);
    x.fillStyle = 'rgba(0,0,0,.35)'; for (let k = 0; k < 6; k++) x.fillRect(10 + k * 4, 112, 2, 2);
    const t = new THREE.CanvasTexture(c); t.magFilter = THREE.NearestFilter; return t;
  }
  function applyLivery(g, paint, num) {
    const t = livery(paint.body, paint.stripe, num);
    g.traverse((o) => { if (solid(o) && o.material.color && o.material.color.getHex() === paint.body) { const m = o.material.clone(); m.map = t; m.color.set(0xffffff); o.material = m } });
  }
  // 4. running lights: emissive strips that would pulse with speed (here lit)
  function lights(g, col) {
    const m = new THREE.MeshBasicMaterial({ color: col });
    const bb = new THREE.Box3(); g.updateMatrixWorld(true); g.traverse((o) => { if (solid(o)) bb.expandByObject(o) });
    for (const sd of [-1, 1]) { const s = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.03, (bb.max.z - bb.min.z) * 0.7), m); s.position.set(sd * (bb.max.x - 0.08), bb.min.y + 0.18, (bb.min.z + bb.max.z) / 2 + 0.2); g.add(s) }
  }
  // 5. concept Blade: a bespoke low-poly hull (an extruded side profile, bevelled, pinched to a nose) instead of a tapered box
  function conceptBlade(paint, look) {
    const g = new THREE.Group(), lam = (c) => new THREE.MeshLambertMaterial({ color: c, flatShading: true });
    const prof = new THREE.Shape(); // side profile: z forward (negative), y up
    prof.moveTo(-2.3, 0.0); prof.lineTo(-1.2, 0.16); prof.lineTo(-0.5, 0.34); prof.lineTo(0.3, 0.42); prof.lineTo(1.25, 0.36); prof.lineTo(1.6, 0.18); prof.lineTo(1.55, -0.12); prof.lineTo(0.2, -0.2); prof.lineTo(-1.6, -0.1); prof.lineTo(-2.3, 0.0);
    const hullG = new THREE.ExtrudeGeometry(prof, { depth: 0.9, bevelEnabled: true, bevelThickness: 0.08, bevelSize: 0.06, bevelSegments: 1, steps: 1 });
    hullG.translate(0, 0, -0.45); hullG.rotateY(-Math.PI / 2); // profile x -> z (nose at -z)
    const p = hullG.attributes.position; for (let i = 0; i < p.count; i++) { const z = p.getZ(i), k = THREE.MathUtils.clamp((z + 2.3) / 2.6, 0.18, 1); p.setX(i, p.getX(i) * k) }
    hullG.computeVertexNormals();
    const body = new THREE.Mesh(hullG, lam(paint.body)); g.add(body);
    // canopy: a faceted gem, set into the spine
    const can = new THREE.Mesh(new THREE.OctahedronGeometry(0.42, 0), new THREE.MeshLambertMaterial({ color: 0x0c1a22, emissive: 0x0a3a48, flatShading: true }));
    can.scale.set(0.55, 0.32, 1.25); can.position.set(0, 0.42, -0.25); can.userData.noEdge = 1; g.add(can);
    // side pods: angular nacelles with lit intakes and glow rings at the exhaust
    for (const sd of [-1, 1]) {
      const pod = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.24, 1.7, 6), lam(paint.stripe)); pod.rotation.x = Math.PI / 2; pod.position.set(sd * 0.68, 0.02, 0.55); g.add(pod);
      const strut = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.05, 0.6), lam(0x1a1e26)); strut.position.set(sd * 0.45, 0.04, 0.45); g.add(strut);
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.035, 4, 6), new THREE.MeshBasicMaterial({ color: 0x3ff0ff })); ring.position.set(sd * 0.68, 0.02, 1.41); g.add(ring);
      const glow = new THREE.Mesh(new THREE.CircleGeometry(0.17, 6), new THREE.MeshBasicMaterial({ color: 0xffc040 })); glow.position.set(sd * 0.68, 0.02, 1.405); glow.userData.noEdge = 1; g.add(glow);
      const fin = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.34, 0.5), lam(paint.stripe)); fin.position.set(sd * 0.36, 0.56, 1.25); fin.rotation.z = sd * 0.28; g.add(fin);
      const blade = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.025, 0.22), lam(0x1a1e26)); blade.position.set(sd * 0.95, 0.0, -0.25); blade.rotation.y = sd * 0.5; g.add(blade);
    }
    const wing = new THREE.Mesh(new THREE.BoxGeometry(1.25, 0.035, 0.26), lam(0x1a1e26)); wing.position.set(0, 0.74, 1.32); wing.rotation.x = 0.12; g.add(wing);
    const sideS = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.05, 2.4), new THREE.MeshBasicMaterial({ color: paint.stripe })); for (const sd of [-1, 1]) { const m = sideS.clone(); m.position.set(sd * 0.47, 0.18, 0.05); m.userData.noEdge = 1; g.add(m) }
    if (look.includes('tone')) tone(g);
    if (look.includes('livery')) applyLivery(g, paint, look.num || '07');
    if (look.includes('edges')) edges(g, look.edge || 0x3ff0ff, 20);
    return g;
  }

  // ---------- the set ----------
  function stage(lightRig) {
    const s = new THREE.Scene(); s.background = new THREE.Color(0x05070d); s.fog = new THREE.Fog(0x05070d, 9, 22);
    const grid = new THREE.GridHelper(40, 40, 0x1f8fa0, 0x0d3a44); grid.position.y = -0.55; s.add(grid);
    s.add(new THREE.HemisphereLight(0x9ab8ff, 0x101018, 0.55));
    const key = new THREE.DirectionalLight(0xffffff, 0.75); key.position.set(-4, 6, -3); s.add(key);
    const rim = new THREE.DirectionalLight(0x3ff0ff, 0.32); rim.position.set(4, 2, 5); s.add(rim);
    return s;
  }
  window.mockShot = (j) => {
    const s = stage();
    const c = ROSTER.find((x) => x.name === (j.pilot || 'Sable')) || ROSTER[1];
    const paint = j.paint || c.paint, st = { speed: 3, thrust: 3, handling: 3, shield: 3, ammo: 3 };
    let g;
    if (j.frame === 'concept') g = conceptBlade(paint, j.look || []);
    else {
      g = j.frame === 'tether2' ? window.tether2(paint, j.st || st) : j.frame.startsWith('x:') ? window.frame2(j.frame.slice(2), paint, j.st || st) : makeShip(paint, j.st || st, j.frame);
      const L = j.look || [];
      if (L.includes('tone')) tone(g);
      if (L.includes('livery')) applyLivery(g, paint, j.num || '07');
      if (L.includes('lights')) lights(g, j.edge || 0x3ff0ff);
      if (L.includes('edges')) edges(g, j.edge || 0x3ff0ff);
    }
    if (j.ctl) window.__mk.shipCtl(g.userData, j.ctl[0], j.ctl[1], j.ctl[2]); if (j.merge) window.__mk.mergeShip(g);
    g.rotation.y = j.yaw ?? -2.45; if (j.tz || j.ty) { const w = new THREE.Group(); g.position.z = -(j.tz || 0); g.position.x = -(j.tx || 0); g.position.y = -(j.ty || 0); w.add(g); w.rotation.y = g.rotation.y; g.rotation.y = 0; s.add(w) } else s.add(g);
    const cam = new THREE.PerspectiveCamera(32, W / H, 0.1, 60); const d = j.dist || 6.2;
    cam.position.set(0, d * (j.h ?? 0.26), d); cam.lookAt(0, 0.1, 0);
    R.render(s, cam);
  };
})();
