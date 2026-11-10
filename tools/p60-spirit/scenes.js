// Concept thumbnails for the Spirit realm dossier. Not game code: a throwaway scene per direction.
(() => {
  const W = 640, H = 360;
  const cv = document.createElement('canvas'); cv.width = W; cv.height = H; document.body.appendChild(cv);
  const out = document.createElement('canvas'); out.id = 'out'; out.width = W; out.height = H; document.body.appendChild(out);
  const R = new THREE.WebGLRenderer({ canvas: cv, antialias: true, preserveDrawingBuffer: true }); R.setSize(W, H, false);
  const rnd = (() => { let s = 7; return () => (s = (s * 16807) % 2147483647) / 2147483647; })();
  const add = (THREE.AdditiveBlending);
  const basic = (c, o = {}) => new THREE.MeshBasicMaterial(Object.assign({ color: c }, o));
  const line = (c, o = {}) => new THREE.LineBasicMaterial(Object.assign({ color: c }, o));

  // a canvas texture helper
  function tex(w, h, draw, rep) {
    const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h);
    const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; if (rep) t.repeat.set(rep[0], rep[1]); return t;
  }
  // road ribbon along a curve: surface + two edge strips
  function road(sc, pts, width, surf, edgeCol, rep = 40) {
    const curve = new THREE.CatmullRomCurve3(pts), n = 200, pos = [], uv = [], idx = [], eL = [], eR = [];
    const up = new THREE.Vector3(0, 1, 0);
    for (let i = 0; i <= n; i++) {
      const u = i / n, p = curve.getPointAt(u), t = curve.getTangentAt(u), r = new THREE.Vector3().crossVectors(t, up).normalize();
      for (const s of [-1, 1]) { const q = p.clone().addScaledVector(r, s * width / 2); pos.push(q.x, q.y, q.z); uv.push(s < 0 ? 0 : 1, u * rep); }
      eL.push(p.clone().addScaledVector(r, -width / 2).add(new THREE.Vector3(0, 0.05, 0)));
      eR.push(p.clone().addScaledVector(r, width / 2).add(new THREE.Vector3(0, 0.05, 0)));
      if (i < n) { const a = i * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
    }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx);
    sc.add(new THREE.Mesh(g, surf));
    for (const e of [eL, eR]) sc.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(e), 200, 0.25, 4), basic(edgeCol)));
    return curve;
  }
  function ship(sc, p, yaw, col, s = 1) {
    const g = new THREE.ConeGeometry(0.9 * s, 3.2 * s, 4); g.rotateX(Math.PI / 2); g.rotateZ(Math.PI / 4); g.scale(1.4, 0.45, 1);
    const m = new THREE.Mesh(g, basic(col)); m.position.copy(p); m.rotation.y = yaw; sc.add(m);
    const j = new THREE.Mesh(new THREE.SphereGeometry(0.45 * s, 8, 6), basic(0x9ff8ff, { blending: add, transparent: true }));
    j.position.copy(p).add(new THREE.Vector3(-Math.sin(yaw) * 1.8 * s, 0, -Math.cos(yaw) * 1.8 * s)); sc.add(j); return m;
  }
  function skyDome(sc, top, mid, bot) {
    const t = tex(4, 256, (x, w, h) => { const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, top); g.addColorStop(0.5, mid); g.addColorStop(1, bot); x.fillStyle = g; x.fillRect(0, 0, w, h); });
    t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping;
    sc.add(new THREE.Mesh(new THREE.SphereGeometry(900, 32, 16), basic(0xffffff, { map: t, side: THREE.BackSide, fog: false })));
  }
  // cheap glow: blur the frame and add it on top (stands in for the game's bloom)
  function finish(glow = 0.55, blur = 7) {
    const x = out.getContext('2d'); x.globalCompositeOperation = 'source-over'; x.filter = 'none'; x.drawImage(cv, 0, 0);
    x.globalCompositeOperation = 'lighter'; x.globalAlpha = glow; x.filter = `blur(${blur}px)`; x.drawImage(cv, 0, 0);
    x.globalAlpha = glow * 0.5; x.filter = `blur(${blur * 3}px)`; x.drawImage(cv, 0, 0);
    x.globalAlpha = 1; x.filter = 'none'; x.globalCompositeOperation = 'source-over';
    // vignette
    const v = x.createRadialGradient(W / 2, H / 2, H * 0.35, W / 2, H / 2, W * 0.62); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,0.55)'); x.fillStyle = v; x.fillRect(0, 0, W, H);
  }

  const S = {};

  // ---------- 1. Hyperspace lattice ----------
  S.lattice = () => {
    const sc = new THREE.Scene(); sc.background = new THREE.Color(0x07031a); sc.fog = new THREE.FogExp2(0x0a0424, 0.0028);
    const cam = new THREE.PerspectiveCamera(70, W / H, 0.5, 2000); cam.position.set(0, 9, 30); cam.lookAt(0, 6, -60);
    // the chrysanthemum: layered rings of petals at the vanishing point
    const ch = new THREE.Group(); ch.position.set(0, 40, -420); sc.add(ch);
    for (let L = 0; L < 7; L++) {
      const n = 12 + L * 6, r = 30 + L * 26, hue = (0.78 + L * 0.07) % 1;
      for (let i = 0; i < n; i++) {
        const a = i / n * Math.PI * 2 + L * 0.21, pts = [];
        for (let k = 0; k <= 24; k++) { const t = k / 24 * Math.PI * 2; pts.push(new THREE.Vector3(Math.cos(t) * r * 0.5 + r, Math.sin(t) * r * 0.16, 0)); }
        const g = new THREE.BufferGeometry().setFromPoints(pts); const m = new THREE.Line(g, line(new THREE.Color().setHSL(hue, 1, 0.6), { transparent: true, opacity: 0.75, blending: add, fog: false }));
        m.rotation.z = a; ch.add(m);
      }
    }
    ch.add(new THREE.Mesh(new THREE.CircleGeometry(26, 48), basic(0xfff3d0, { fog: false })));
    // the lattice: a grid floor far below and a grid ceiling far above, both in light
    for (const [y, c] of [[-60, 0x6a2cff], [150, 0x1fd6ff]]) { const g = new THREE.GridHelper(2400, 120, c, c); g.position.y = y; g.material.transparent = true; g.material.opacity = 0.55; sc.add(g); }
    // hex rings of a hyperspace tunnel ahead
    for (let i = 0; i < 18; i++) {
      const r = new THREE.Mesh(new THREE.TorusGeometry(26, 0.35, 4, 6), basic(new THREE.Color().setHSL((0.5 + i * 0.045) % 1, 1, 0.55), { blending: add, transparent: true }));
      r.position.set(0, 8, -120 - i * 22); r.rotation.z = i * 0.09; sc.add(r);
    }
    // floating beings: wireframe lattices (icosahedra, torus knots), one breaking into shards
    const fl = [[-70, 40, -140, 22, 'ico'], [80, 55, -200, 30, 'knot'], [-120, 70, -300, 40, 'knot'], [110, 20, -90, 14, 'ico']];
    for (const [x, y, z, s, k] of fl) {
      const g = k === 'ico' ? new THREE.IcosahedronGeometry(s, 1) : new THREE.TorusKnotGeometry(s * 0.7, s * 0.18, 80, 8, 2, 3);
      const m = new THREE.LineSegments(new THREE.EdgesGeometry(g, 1), line(k === 'ico' ? 0xffd27a : 0x40f0ff, { transparent: true, opacity: 0.9 }));
      m.position.set(x, y, z); m.rotation.set(rnd() * 3, rnd() * 3, 0); sc.add(m);
      const core = new THREE.Mesh(g, basic(k === 'ico' ? 0x2a0f45 : 0x08203a, { transparent: true, opacity: 0.55 })); core.position.copy(m.position); core.rotation.copy(m.rotation); sc.add(core);
    }
    // shards drifting from the first icosahedron (breaking apart)
    for (let i = 0; i < 40; i++) {
      const t = new THREE.Mesh(new THREE.TetrahedronGeometry(1.5 + rnd() * 3), basic(new THREE.Color().setHSL(0.1 + rnd() * 0.1, 1, 0.6)));
      const d = new THREE.Vector3(rnd() - 0.5, rnd() - 0.3, rnd() - 0.5).normalize().multiplyScalar(26 + rnd() * 30); t.position.set(-70, 40, -140).add(d); t.rotation.set(rnd() * 6, rnd() * 6, 0); sc.add(t);
    }
    // eyes: rings of an all-seeing lattice being (abstract, no figure)
    // road: dark glass with flowing chevrons
    const rt = tex(64, 64, (x, w, h) => { x.fillStyle = '#0b0820'; x.fillRect(0, 0, w, h); x.strokeStyle = '#b04bff'; x.lineWidth = 3; x.beginPath(); x.moveTo(6, 44); x.lineTo(32, 20); x.lineTo(58, 44); x.stroke(); x.strokeStyle = '#2ee6ff'; x.lineWidth = 1.5; x.beginPath(); x.moveTo(32, 0); x.lineTo(32, 64); x.stroke(); });
    road(sc, [new THREE.Vector3(0, 0, 40), new THREE.Vector3(0, 0, -20), new THREE.Vector3(-6, 2, -100), new THREE.Vector3(4, 6, -200), new THREE.Vector3(0, 8, -400)], 14, basic(0xffffff, { map: rt }), 0xffb000, 60);
    ship(sc, new THREE.Vector3(1.5, 1.2, 12), Math.PI, 0xff4a3d); ship(sc, new THREE.Vector3(-3, 1.4, -16), Math.PI, 0x46ff8c);
    R.render(sc, cam); finish(0.6, 6);
  };

  // ---------- 2. Stepped sky (Mesoamerican principles) ----------
  S.stepped = () => {
    const sc = new THREE.Scene(); sc.fog = new THREE.Fog(0x2a1d3a, 120, 900);
    skyDome(sc, '#081a24', '#174a52', '#e8803a');
    const cam = new THREE.PerspectiveCamera(66, W / H, 0.5, 2000); cam.position.set(0, 10, 32); cam.lookAt(0, 10, -60);
    const obs = 0x14121c, jade = 0x2fd6a4, gold = 0xffb43a, turq = 0x3fd8ff, cinn = 0xd8432c;
    // the sun disc low on the horizon, with rings that turn in clicks
    const sun = new THREE.Group(); sun.position.set(0, 60, -700); sc.add(sun);
    sun.add(new THREE.Mesh(new THREE.CircleGeometry(70, 64), basic(0xffd27a, { fog: false })));
    for (let k = 0; k < 4; k++) { const r = 90 + k * 24, n = 20 + k * 8; for (let i = 0; i < n; i++) { const b = new THREE.Mesh(new THREE.BoxGeometry(10, 12, 1), basic(k % 2 ? gold : cinn, { fog: false })); const a = i / n * Math.PI * 2 + k * 0.1; b.position.set(Math.cos(a) * r, Math.sin(a) * r, 0); b.rotation.z = a; sun.add(b); } }
    // stepped pyramids, floating, one split in two halves sliding apart
    function pyr(x, y, z, s, split, rotY = 0) {
      const g = new THREE.Group(); g.position.set(x, y, z); g.rotation.y = rotY; sc.add(g);
      const tiers = 6;
      for (let i = 0; i < tiers; i++) {
        const w = s * (1 - i / tiers * 0.82), h = s * 0.12;
        for (const side of split ? [-1, 1] : [0]) {
          const ww = split ? w / 2 : w; const m = new THREE.Mesh(new THREE.BoxGeometry(ww, h, w), basic(i % 2 ? obs : 0x1e1a28));
          m.position.set(side * (ww / 2 + s * 0.18 * (1 + i * 0.15)), i * h + (split ? Math.abs(side) * i * 2 : 0), 0); g.add(m);
          const trim = new THREE.Mesh(new THREE.BoxGeometry(ww * 1.002, h * 0.16, w * 1.002), basic(i % 2 ? jade : gold)); trim.position.copy(m.position); trim.position.y += h * 0.42; g.add(trim);
        }
      }
      // underside: an inverted stepped root so it reads as floating, not sitting
      for (let i = 1; i < 4; i++) { const w = s * (1 - i * 0.22); const m = new THREE.Mesh(new THREE.BoxGeometry(w, s * 0.1, w), basic(0x0e0c14)); m.position.y = -i * s * 0.1; g.add(m); }
      return g;
    }
    pyr(-95, 30, -170, 70, false, 0.3); pyr(120, 60, -300, 110, true, -0.2); pyr(-200, 90, -420, 120, false, 0.1); pyr(40, 140, -520, 80, false, 0.6);
    // stelae: tall carved columns hovering beside the road, with a stepped notch pattern
    const stTex = tex(64, 256, (x, w, h) => { x.fillStyle = '#1b1824'; x.fillRect(0, 0, w, h); x.fillStyle = '#2fd6a4'; for (let y = 8; y < h; y += 40) { x.fillRect(8, y, 48, 4); x.fillRect(8, y, 4, 24); x.fillRect(8, y + 20, 30, 4); x.fillRect(34, y + 10, 4, 14); x.fillRect(20, y + 10, 18, 4); } });
    for (let i = 0; i < 6; i++) for (const s of [-1, 1]) { const m = new THREE.Mesh(new THREE.BoxGeometry(5, 34, 5), basic(0xffffff, { map: stTex })); m.position.set(s * (24 + i * 2), 22 + i * 1.5, -40 - i * 55); sc.add(m); }
    // a serpent of segments winding through the sky (generic, not a deity)
    const sp = []; for (let i = 0; i <= 60; i++) { const t = i / 60; sp.push(new THREE.Vector3(Math.sin(t * 9) * 90 + 30, 70 + Math.cos(t * 7) * 25 + t * 40, -80 - t * 500)); }
    const scurve = new THREE.CatmullRomCurve3(sp);
    for (let i = 0; i < 90; i++) { const u = i / 90, p = scurve.getPointAt(u), r = 7 * (1 - u * 0.6) * (i < 4 ? 1.3 : 1); const m = new THREE.Mesh(new THREE.BoxGeometry(r * 1.6, r, r * 1.2), basic(i % 3 === 0 ? gold : i % 3 === 1 ? turq : jade)); m.position.copy(p); m.lookAt(scurve.getPointAt(Math.min(1, u + 0.01))); sc.add(m); }
    // clouds below: flat slabs
    for (let i = 0; i < 40; i++) { const m = new THREE.Mesh(new THREE.BoxGeometry(40 + rnd() * 60, 3, 20 + rnd() * 30), basic(0x7a4a5a, { transparent: true, opacity: 0.6 })); m.position.set((rnd() - 0.5) * 600, -40 - rnd() * 30, -rnd() * 700); sc.add(m); }
    // road: obsidian with a step-fret (xicalcoliuhqui-like) band near each edge
    const rt = tex(128, 64, (x, w, h) => { x.fillStyle = '#121019'; x.fillRect(0, 0, w, h); x.fillStyle = '#ffb43a';
      for (const ox of [4, w - 20]) { for (let y = 0; y < h; y += 32) { x.fillRect(ox, y, 16, 3); x.fillRect(ox + 13, y, 3, 14); x.fillRect(ox + 6, y + 11, 10, 3); x.fillRect(ox + 6, y + 6, 3, 8); x.fillRect(ox, y + 16, 3, 16); x.fillRect(ox, y + 29, 16, 3); } } });
    road(sc, [new THREE.Vector3(0, 0, 40), new THREE.Vector3(0, 0, -20), new THREE.Vector3(8, 3, -110), new THREE.Vector3(-6, 8, -220), new THREE.Vector3(0, 12, -420)], 14, basic(0xffffff, { map: rt }), 0xffb000, 30);
    ship(sc, new THREE.Vector3(-2, 1.2, 10), Math.PI, 0x3ff0ff); ship(sc, new THREE.Vector3(3, 1.6, -22), Math.PI, 0xbe5aff);
    R.render(sc, cam); finish(0.35, 6);
  };

  // ---------- 3. Knotwork otherworld (Celtic, La Tene) ----------
  S.knot = () => {
    const sc = new THREE.Scene(); sc.fog = new THREE.FogExp2(0x2c3a2e, 0.0032);
    skyDome(sc, '#0d1a1a', '#2c4a3c', '#d9c98a');
    const cam = new THREE.PerspectiveCamera(66, W / H, 0.5, 2000); cam.position.set(0, 9, 30); cam.lookAt(0, 9, -60);
    const bronze = 0xd9a441, vell = 0xf1e3b8, lapis = 0x3a6cff, moss = 0x6ec27a;
    // a mirror-still sea of mist far below
    const sea = new THREE.Mesh(new THREE.PlaneGeometry(3000, 3000), basic(0x1b2a26)); sea.rotation.x = -Math.PI / 2; sea.position.y = -50; sc.add(sea);
    // giant interlace: torus knots as woven bands, some loosening
    const kn = [[-110, 50, -200, 40, 2, 3, bronze], [130, 70, -260, 50, 3, 4, vell], [-40, 120, -460, 70, 2, 5, bronze], [180, 30, -120, 24, 3, 2, moss]];
    for (const [x, y, z, s, p, q, c] of kn) { const m = new THREE.Mesh(new THREE.TorusKnotGeometry(s, s * 0.09, 220, 6, p, q), basic(c)); m.position.set(x, y, z); m.rotation.set(rnd() * 2, rnd() * 2, 0); sc.add(m);
      const e = new THREE.Mesh(new THREE.TorusKnotGeometry(s, s * 0.115, 220, 6, p, q), basic(0x101810, { side: THREE.BackSide })); e.position.copy(m.position); e.rotation.copy(m.rotation); sc.add(e); }
    // floating standing stones, root-down, with spiral marks
    const stT = tex(64, 128, (x, w, h) => { x.fillStyle = '#4a4f48'; x.fillRect(0, 0, w, h); x.strokeStyle = '#9ff0c0'; x.lineWidth = 2.5; for (const cy of [40, 92]) { x.beginPath(); for (let t = 0; t < 16; t += 0.1) { const r = t * 1.3; x.lineTo(32 + Math.cos(t) * r, cy + Math.sin(t) * r); } x.stroke(); } });
    for (let i = 0; i < 14; i++) { const s = 0.7 + rnd(); const m = new THREE.Mesh(new THREE.BoxGeometry(6 * s, 22 * s, 4 * s), basic(0xffffff, { map: stT })); const side = i % 2 ? 1 : -1; m.position.set(side * (30 + rnd() * 60), 10 + rnd() * 40, -30 - i * 34); m.rotation.set((rnd() - 0.5) * 0.4, rnd() * 3, (rnd() - 0.5) * 0.4); sc.add(m); }
    // a triskele gate over the road: three spiral arms in a ring (the portal)
    const gate = new THREE.Group(); gate.position.set(0, 11, -120); sc.add(gate);
    gate.add(new THREE.Mesh(new THREE.TorusGeometry(16, 0.9, 6, 64), basic(bronze)));
    for (let a = 0; a < 3; a++) { const pts = []; for (let t = 0; t <= 1; t += 0.02) { const ang = a * Math.PI * 2 / 3 + t * 5.2, r = 1 + t * 14; pts.push(new THREE.Vector3(Math.cos(ang) * r, Math.sin(ang) * r, 0)); }
      gate.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 80, 0.7, 5), basic(lapis))); }
    gate.add(new THREE.Mesh(new THREE.CircleGeometry(15.5, 48), basic(0xbff7ff, { transparent: true, opacity: 0.18, blending: add })));
    // road: cream vellum with an interlace edge band
    const rt = tex(128, 64, (x, w, h) => { x.fillStyle = '#1d231c'; x.fillRect(0, 0, w, h); x.strokeStyle = '#d9a441'; x.lineWidth = 3;
      for (const ox of [10, w - 10]) { x.beginPath(); for (let y = 0; y <= h; y++) x.lineTo(ox + Math.sin(y / h * Math.PI * 4) * 6, y); x.stroke(); x.beginPath(); for (let y = 0; y <= h; y++) x.lineTo(ox - Math.sin(y / h * Math.PI * 4) * 6, y); x.stroke(); } });
    road(sc, [new THREE.Vector3(0, 0, 40), new THREE.Vector3(0, 0, -30), new THREE.Vector3(-4, 1, -130), new THREE.Vector3(10, 6, -230), new THREE.Vector3(-10, 10, -420)], 14, basic(0xffffff, { map: rt }), 0xffb000, 30);
    ship(sc, new THREE.Vector3(2, 1.2, 12), Math.PI, 0xffb000); ship(sc, new THREE.Vector3(-3, 1.3, -30), Math.PI, 0x3ff0ff);
    R.render(sc, cam); finish(0.35, 6);
  };

  // ---------- 4. The portal jump (Eric's idea), seen from above and behind ----------
  S.portal = () => {
    const sc = new THREE.Scene(); sc.background = new THREE.Color(0x07031a); sc.fog = new THREE.FogExp2(0x0a0424, 0.0022);
    const cam = new THREE.PerspectiveCamera(55, W / H, 0.5, 3000); cam.position.set(-70, 42, 62); cam.lookAt(18, 4, -45);
    const g = new THREE.GridHelper(2400, 120, 0x4a1fb0, 0x4a1fb0); g.position.y = -40; g.material.transparent = true; g.material.opacity = 0.5; sc.add(g);
    const rt = tex(64, 64, (x, w, h) => { x.fillStyle = '#1c1648'; x.fillRect(0, 0, w, h); x.fillStyle = '#5a3cc0'; x.fillRect(30, 0, 4, h); x.fillStyle = '#3a2c90'; x.fillRect(0, 0, w, 3); });
    const rm = basic(0xffffff, { map: rt });
    // main road along -z; the entrance portal at z=-140
    road(sc, [new THREE.Vector3(0, 0, 160), new THREE.Vector3(0, 0, 60), new THREE.Vector3(0, 0, -40), new THREE.Vector3(0, 0, -140)], 14, rm, 0xffb000, 30);
    // the track carries on after the exit; the main road continues past the portal too (the lap's later part)
    road(sc, [new THREE.Vector3(0, 0, -150), new THREE.Vector3(0, 0, -260), new THREE.Vector3(-30, 0, -360)], 14, rm, 0x5a4a20, 20);
    function portal(p, rotY, col) { const gr = new THREE.Group(); gr.position.copy(p); gr.rotation.y = rotY; sc.add(gr);
      gr.add(new THREE.Mesh(new THREE.TorusGeometry(10, 0.9, 8, 48), basic(col)));
      for (let k = 0; k < 5; k++) gr.add(new THREE.Mesh(new THREE.TorusGeometry(8.6 - k * 1.6, 0.25, 4, 40, Math.PI * 1.4), basic(new THREE.Color().setHSL((0.75 + k * 0.08) % 1, 1, 0.6), { transparent: true, blending: add })).rotateZ(k * 1.1));
      gr.add(new THREE.Mesh(new THREE.CircleGeometry(9.6, 40), basic(col, { transparent: true, opacity: 0.25, blending: add, side: THREE.DoubleSide }))); return gr; }
    portal(new THREE.Vector3(0, 8, -140), 0, 0xbe5aff);
    // exit: 60 m to the right, 120 m back down the track, facing left (towards the road), into a ramp that jumps the road
    const ex = new THREE.Vector3(60, 8, -20); portal(ex, Math.PI / 2, 0x3ff0ff);
    // ramp from the exit heading -x, rising to a lip at x=22
    road(sc, [new THREE.Vector3(56, 0, -20), new THREE.Vector3(40, 1.5, -20), new THREE.Vector3(22, 6, -20)], 14, rm, 0x3ff0ff, 10);
    // landing on the far side, curving back to rejoin the line beyond
    road(sc, [new THREE.Vector3(-26, 2, -20), new THREE.Vector3(-46, 0, -20), new THREE.Vector3(-62, 0, -40), new THREE.Vector3(-60, 0, -120), new THREE.Vector3(-35, 0, -230), new THREE.Vector3(-30, 0, -360)], 14, rm, 0x3ff0ff, 30);
    // the arc of the jump, drawn in light
    const arc = []; for (let i = 0; i <= 30; i++) { const t = i / 30, x = 22 - t * 48; arc.push(new THREE.Vector3(x, 7 + 20 * Math.sin(t * Math.PI) - t * 5, -20)); }
    sc.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(arc), line(0x46ff8c, { transparent: true, opacity: 0.8 })));
    // racers: two in the air over the road, three on the road below heading for the entrance
    ship(sc, arc[10].clone().add(new THREE.Vector3(0, 2, 0)), -Math.PI / 2, 0xff4a3d, 2.4); ship(sc, arc[18].clone().add(new THREE.Vector3(0, 2, 0)), -Math.PI / 2, 0x46ff8c, 2.4);
    ship(sc, new THREE.Vector3(2, 1.8, 0), Math.PI, 0xffb000, 2.4); ship(sc, new THREE.Vector3(-3, 1.8, -60), Math.PI, 0xbe5aff, 2.4); ship(sc, new THREE.Vector3(1, 1.8, -110), Math.PI, 0x3ff0ff, 2.4);
    R.render(sc, cam); finish(0.5, 5);
  };

  window.shot = (k) => { S[k](); return true; };
})();
