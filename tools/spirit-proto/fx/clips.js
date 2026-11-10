/* The clips for Eric: each sets up the stage, places objects and says what the camera does. Not game code.
   Every clip runs on the 140 bpm clock (SPFX.Beat) with a drop every 8 bars; dropAt(s) puts the drop s seconds in.
   Most show two palettes: palette A until the switch time, B after (the caption says which). */
(function (root) {
  const SPFX = root.SPFX, THREE = root.THREE, ST = SPFX.stage, O = SPFX.obj, R = SPFX.room, CL = SPFX.CLIPS = {};
  const SPB = 60 / 140, dropAt = (s) => 32 * SPB - s;
  const cap = (num, title, extra) => (t, bt) => `<b style="color:#ffb000">${num}</b> ${title}${extra ? '<br><span style="color:#b8bfcc">' + (typeof extra === 'function' ? extra(t, bt) : extra) + '</span>' : ''}`;
  const sky = (pal, o = {}) => { const cam = ST.c.camera; const s = ST.add(O.stars(THREE, { pal: pal || 'iceViolet', follow: cam, n: o.stars || 1400 }));
    const g = o.grids === false ? null : ST.add(O.grids(THREE, { pal: pal || 'iceViolet', follow: cam, ys: o.ys || [-70, 140] })); return { s, g } };
  // palette switch for a list of objects at time ts (A before, B after)
  const swap = (list, A, B, ts) => { let cur = null; return (t) => { const want = t < ts ? A : B; if (want === cur) return; cur = want; list.forEach((o) => o.k && o.k.setPal(want)) } };
  const palCap = (A, B, ts) => (t) => 'palette: ' + SPFX.palName(t < ts ? A : B) + (t < ts ? '  (then ' + SPFX.palName(B) + ')' : '');
  const fog = (a, b) => SPFX.G.uFog.value.set(a, b);
  const W = () => ST.c.W;

  /* ===== 2: everything breathing ===== */
  // a shared scene: solids at three sizes along the road
  function breathScene(pal, v) {
    ST.init({ seed: 1234 }); ST.pack(null, v || 55); fog(350, 3600);
    const u = ST.u0, list = [];
    const mk = (f, o, uu, lat, h) => { const x = ST.place(f(THREE, { pal, ...o }), u + uu, lat, h); list.push(x); return x };
    list.push(...Object.values(sky(pal)).filter(Boolean));
    mk(O.solid, { size: 9, geo: (s) => new THREE.IcosahedronGeometry(s, 0) }, 140, -32, 14);
    mk(O.solid, { size: 7, geo: (s) => new THREE.OctahedronGeometry(s) }, 210, 30, 10);
    mk(O.gyro, { size: 22 }, 300, -48, 24);
    mk(O.solid, { size: 12, geo: (s) => new THREE.DodecahedronGeometry(s) }, 330, 42, 26);
    mk(O.solid, { size: 2.2, geo: (s) => new THREE.BoxGeometry(s, s, s) }, 90, 15, 3);
    mk(O.solid, { size: 2.2, geo: (s) => new THREE.TetrahedronGeometry(s) }, 160, -15, 3);
    mk(O.solid, { size: 2.2, geo: (s) => new THREE.OctahedronGeometry(s) }, 240, 15, 3);
    mk(O.solid, { size: 2.2, geo: (s) => new THREE.BoxGeometry(s, s, s) }, 300, -15, 3);
    mk(O.merkaba, { size: 3 }, 380, 16, 4);
    const huge = ST.placeFar(O.solid(THREE, { pal, size: 160, geo: (s) => new THREE.IcosahedronGeometry(s, 1), spin: [0.03, 0.05, 0.01], cs: 9 }), 1400, 120, 160); list.push(huge);
    ST.cam = { back: 16, up: 5.5, ahead: 60, lookUp: 6, fov: 72 };
    return list;
  }
  const half = 4.5, amt = (lo, hi) => (t) => t < half ? lo : hi, lvl = (t) => (t < half ? 'subtle' : 'STRONG');
  CL['01-breathe-some'] = { dur: 9, fps: 16, beatOffset: dropAt(3.2),
    setup() { const L = breathScene('goldViolet'); // only the gyroscope, the dodecahedron, two small ones and the huge one breathe
      [4, 5, 7, 10, 11].forEach((i) => SPFX.breathe(L[i], amt(0.04, 0.14))) },
    caption: cap('2', 'Breathing: only some objects', (t) => lvl(t) + ' · gold + violet') };
  CL['02-breathe-all'] = { dur: 9, fps: 16, beatOffset: dropAt(3.2),
    setup() { const L = breathScene('cyanMagenta'); const road = ST.place(O.roadLines(THREE, { pal: 'amber', u0: ST.u0 - 40, u1: ST.u0 + 900, width: 0.28 }), 0, 0, 0); road.group.position.set(0, 0, 0); road.group.quaternion.identity();
      L.forEach((o, i) => SPFX.breathe(o, amt(0.035, 0.12), { kick: i % 2 ? 0.2 : 0.5 })); SPFX.breathe(road, amt(0.04, 0.14), { scale: false, swell: 8 });
      // the sky breathes too: the planes of light move in and out
      const g = L[1], base = g.group.position.clone(); const up0 = g.update; g.update = (t, bt) => { up0(t, bt); const A = amt(0.04, 0.14)(t); g.group.scale.set(1, 1 + A * 3 * bt.breath, 1) } },
    caption: cap('2', 'Breathing: everything (objects, road edges, sky)', (t) => lvl(t) + ' · cyan + magenta, road edges amber') };
  CL['03-breathe-screen'] = { dur: 9, fps: 16, beatOffset: dropAt(3.2),
    setup() { breathScene('jade') },
    update(t, bt) { const A = t < half ? 1 : 3.2; ST.fx.br = A * 0.012 * (bt.breath * 0.8 + 0.3 * bt.k + 0.6 * bt.drop); ST.fx.dr = A * 0.35 },
    caption: cap('63 + 64', 'Screen breathing and drifting (edges only, centre still)', (t) => lvl(t) + ' · jade + turquoise + gold') };

  /* ===== 3 / 28: stacks that unstack and re-stack ===== */
  CL['04-stacks'] = { dur: 9, fps: 16, beatOffset: dropAt(5.5),
    setup() { ST.init({ seed: 1234 }); ST.pack(null, 30); fog(350, 4000); const A = 'jade', B = 'emberWhite', u = ST.u0, L = [];
      L.push(...Object.values(sky('iceViolet')).filter(Boolean));
      L.push(ST.place(O.stacks(THREE, { pal: A, size: 16, tiers: 5, stacks: 2, carve: true, seed: 3 }), u + 150, -52, -4, { level: true }));
      L.push(ST.place(O.stacks(THREE, { pal: A, size: 4, tiers: 4, stacks: 3, seed: 5, turn: 0.3 }), u + 95, 17, 0.5, { level: true }));
      L.push(ST.place(O.stacks(THREE, { pal: A, size: 4, tiers: 4, stacks: 2, seed: 9, turn: -0.3 }), u + 170, -17, 0.5, { level: true }));
      L.push(ST.placeFar(O.stacks(THREE, { pal: A, size: 140, tiers: 6, stacks: 3, seed: 7, turn: 0.2 }), 1300, 260, -120));
      const inv = ST.placeFar(O.stacks(THREE, { pal: A, size: 110, tiers: 6, stacks: 2, seed: 11, turn: -0.4 }), 1100, -330, 330); inv.group.rotation.x = Math.PI; L.push(inv);
      this.sw = swap(L.slice(2), A, B, 4.5); ST.cam = { back: 14, up: 5, ahead: 60, lookUp: 9, fov: 74 } },
    update(t) { this.sw(t) },
    caption: cap('3 / 28', 'Stacks that unstack: tiers slide out, turn, swap; a top tier flies to the other stack every 2 bars', palCap('jade', 'emberWhite', 4.5)) };

  /* ===== 24 shatter and reform ===== */
  CL['05-shatter'] = { dur: 9, fps: 16, beatOffset: dropAt(2.4),
    setup() { ST.init({ seed: 1234 }); ST.pack(null, 35); fog(350, 4200); const A = 'emberWhite', B = 'cyanMagenta', u = ST.u0, L = [];
      L.push(...Object.values(sky('iceViolet')).filter(Boolean));
      L.push(ST.place(O.shatter(THREE, { pal: A, size: 16, depth: 1, trigger: 'drop', seed: 2 }), u + 150, -34, 22));
      L.push(ST.place(O.shatter(THREE, { pal: A, size: 2.4, depth: 0, geo: (s) => new THREE.DodecahedronGeometry(s), trigger: 'cycle', period: 2, phase: 0.6, fly: 2 }), u + 80, 14, 3.5));
      L.push(ST.place(O.shatter(THREE, { pal: A, size: 2.4, depth: 0, geo: (s) => new THREE.OctahedronGeometry(s), trigger: 'cycle', period: 2, phase: 0.1, fly: 2 }), u + 120, -14, 3.5));
      L.push(ST.place(O.shatter(THREE, { pal: A, size: 2.4, depth: 0, geo: (s) => new THREE.IcosahedronGeometry(s), trigger: 'cycle', period: 2, phase: 0.35, fly: 2 }), u + 175, 14, 3.5));
      L.push(ST.placeFar(O.shatter(THREE, { pal: A, size: 170, depth: 2, trigger: 'drop', seed: 4, fly: 0.9, lw: 0.006 }), 1500, 120, 200));
      this.sw = swap(L.slice(2), A, B, 6.2); ST.cam = { back: 15, up: 5, ahead: 60, lookUp: 10, fov: 74 } },
    update(t) { this.sw(t) },
    caption: cap('24', 'Shatter and reform: medium and huge burst on the drop; small ones every 2 bars', palCap('emberWhite', 'cyanMagenta', 6.2)) };

  /* ===== 25 merge and become ===== */
  CL['06-merge'] = { dur: 9, fps: 16, beatOffset: dropAt(4),
    setup() { ST.init({ seed: 1234 }); ST.pack(null, 25); fog(350, 4200); const A = 'goldViolet', B = 'jade', u = ST.u0, L = [];
      L.push(...Object.values(sky('iceViolet')).filter(Boolean));
      L.push(ST.place(O.merge(THREE, { pal: A, size: 11, n: 260, period: 4 }), u + 150, 0, 30));
      L.push(ST.place(O.merge(THREE, { pal: A, size: 2.2, n: 90, period: 2, A: (r) => new THREE.BoxGeometry(r * 1.2, r * 1.2, r * 1.2), B: (r) => new THREE.OctahedronGeometry(r), C: (r) => new THREE.TorusGeometry(r * 0.8, r * 0.25, 6, 16), shard: 0.12 }), u + 75, 15, 3.5));
      L.push(ST.placeFar(O.merge(THREE, { pal: A, size: 120, n: 500, period: 4, apart: 2.0, shard: 0.06 }), 1500, -260, 230));
      this.sw = swap(L.slice(2), A, B, 4.6); ST.cam = { back: 14, up: 4.5, ahead: 60, lookUp: 16, fov: 76 } },
    update(t) { this.sw(t) },
    caption: cap('25', 'Merge and become: an icosahedron and a torus trade pieces into a knot, then split', palCap('goldViolet', 'jade', 4.6)) };

  /* ===== 26 unfolding solids ===== */
  CL['07-unfold'] = { dur: 9, fps: 16, beatOffset: dropAt(4),
    setup() { ST.init({ seed: 1234 }); ST.pack(null, 22); fog(350, 4200); const A = 'cyanMagenta', B = 'emberWhite', u = ST.u0, L = [];
      L.push(...Object.values(sky('iceViolet')).filter(Boolean));
      L.push(ST.place(O.unfoldCube(THREE, { pal: A, size: 14 }), u + 140, -36, 20));
      L.push(ST.place(O.unfoldFlower(THREE, { pal: A, size: 9 }), u + 160, 38, 26));
      L.push(ST.place(O.unfoldCube(THREE, { pal: A, size: 2.5 }), u + 70, 14, 4));
      L.push(ST.place(O.unfoldFlower(THREE, { pal: A, size: 1.6 }), u + 95, -14, 4));
      const big = ST.placeFar(O.unfoldFlower(THREE, { pal: A, size: 110 }), 1500, 60, 330); L.push(big);
      this.sw = swap(L.slice(2), A, B, 4.6); ST.cam = { back: 14, up: 4.5, ahead: 60, lookUp: 14, fov: 76 } },
    update(t) { this.sw(t) },
    caption: cap('26', 'Unfolding solids: a cube opens to its cross, a dodecahedron opens like a flower', palCap('cyanMagenta', 'emberWhite', 4.6)) };

  /* ===== 27 gyroscopes ===== */
  CL['08-gyro'] = { dur: 9, fps: 16, beatOffset: dropAt(4.5),
    setup() { ST.init({ seed: 1234 }); ST.pack(null, 60); fog(350, 4200); const A = 'goldViolet', B = 'iceViolet', u = ST.u0, L = [];
      L.push(...Object.values(sky('iceViolet')).filter(Boolean));
      L.push(ST.place(O.gyro(THREE, { pal: A, size: 26, rings: 5, tick: true }), u + 200, -46, 26));
      for (let i = 0; i < 4; i++) L.push(ST.place(O.gyro(THREE, { pal: A, size: 2.6, rings: 3, speeds: [1.2, -1.6, 2.1] }), u + 70 + i * 70, i % 2 ? 15 : -15, 4));
      const big = ST.place(O.gyro(THREE, { pal: A, size: 120, rings: 4, speeds: [0.12, -0.18, 0.25, -0.3] }), u + 420, 0, 10); L.push(big); // the road runs through its centre
      L.push(ST.placeFar(O.gyro(THREE, { pal: A, size: 300, rings: 6, speeds: [0.05, -0.08, 0.11, -0.14, 0.2, -0.25] }), 1700, 320, 300));
      this.sw = swap(L.slice(2), A, B, 4.6); ST.cam = { back: 15, up: 5, ahead: 60, lookUp: 8, fov: 74 } },
    update(t) { this.sw(t) },
    caption: cap('27', 'Gyroscopes: small by the road, medium beside it, one the road runs through, one far off', palCap('goldViolet', 'iceViolet', 4.6)) };

  /* ===== 29 knots that untie ===== */
  CL['09-knots'] = { dur: 9, fps: 16, beatOffset: dropAt(4.5),
    setup() { ST.init({ seed: 1234 }); ST.pack(null, 25); fog(350, 4200); const A = 'jade', B = 'goldViolet', u = ST.u0, L = [];
      L.push(...Object.values(sky('iceViolet')).filter(Boolean));
      L.push(ST.place(O.knot(THREE, { pal: A, size: 22, bars: 2 }), u + 160, -40, 30));
      L.push(ST.place(O.knot(THREE, { pal: A, size: 3, bars: 1, strands: 3, seg: 200, phase: 0.5 }), u + 70, 15, 4.5));
      L.push(ST.placeFar(O.knot(THREE, { pal: A, size: 260, bars: 2, phase: 1.3, strands: 5 }), 1600, 200, 260));
      this.sw = swap(L.slice(2), A, B, 4.6); ST.cam = { back: 14, up: 4.5, ahead: 60, lookUp: 14, fov: 76 } },
    update(t) { this.sw(t) },
    caption: cap('29', 'Knots that untie: a trefoil loosens to a loop and ties again as another knot', palCap('jade', 'goldViolet', 4.6)) };

  /* ===== 30 shoals of shapes ===== */
  CL['10-shoals'] = { dur: 9, fps: 16, beatOffset: dropAt(4.5),
    setup() { ST.init({ seed: 1234 }); ST.pack(null, 45); fog(350, 4200); const A = 'cyanMagenta', B = 'emberWhite', u = ST.u0, L = [];
      L.push(...Object.values(sky('iceViolet')).filter(Boolean));
      L.push(ST.place(O.shoal(THREE, { pal: A, n: 180, size: 0.9, radius: 34, speed: 0.6, flat: 0.5 }), u + 200, 0, 22));
      L.push(ST.place(O.shoal(THREE, { pal: A, n: 90, size: 4, radius: 110, speed: 0.25, geo: (r) => new THREE.TetrahedronGeometry(r), seed: 9 }), u + 380, -140, 60));
      L.push(ST.placeFar(O.shoal(THREE, { pal: A, n: 60, size: 30, radius: 700, speed: 0.08, geo: (r) => new THREE.BoxGeometry(r, r, r), seed: 4, flat: 0.4 }), 1800, 0, 250));
      this.sw = swap(L.slice(2), A, B, 4.6); ST.cam = { back: 15, up: 5, ahead: 60, lookUp: 9, fov: 76 } },
    update(t) { this.sw(t) },
    caption: cap('30', 'Shoals of shapes: they wheel round the road, bunch on the kick, scatter on the drop', palCap('cyanMagenta', 'emberWhite', 4.6)) };

  /* ===== 31 the colossus ===== */
  CL['11-colossus'] = { dur: 9, fps: 16, beatOffset: dropAt(5),
    setup() { ST.init({ seed: 1234 }); ST.pack(null, 110); fog(500, 6000); const A = 'iceViolet', B = 'goldViolet', u = ST.u0, L = [];
      L.push(...Object.values(sky('iceViolet')).filter(Boolean));
      const lead = () => ST.at(ST.lead(this.t || 0), 0, 2).p;
      L.push(ST.placeFar(O.colossus(THREE, { pal: A, size: 900, target: lead, turnK: 0.12 }), 900, -650, 250));
      L.push(ST.placeFar(O.colossus(THREE, { pal: A, size: 140, target: lead, turnK: 0.15 }), 700, 130, 50));
      this.sw = swap(L.slice(2), A, B, 4.6); ST.cam = { back: 16, up: 4, ahead: 60, lookUp: 16, fov: 80 } },
    update(t) { this.t = t; this.sw(t) },
    caption: cap('31', 'The colossus: a lattice presence far off the road; its ring head follows the leader', palCap('iceViolet', 'goldViolet', 4.6)) };

  /* ===== 32 arches that assemble ===== */
  CL['12-arches'] = { dur: 10, fps: 16, beatOffset: dropAt(5),
    setup() { ST.init({ seed: 1234 }); ST.pack(null, 70); fog(400, 5000); const A = 'goldViolet', B = 'jade', u = ST.u0, L = [];
      L.push(...Object.values(sky('iceViolet')).filter(Boolean));
      const w = W();
      L.push(ST.place(O.arch(THREE, { pal: A, u: u + 300, span: w + 8, rise: 11, n: 15, ready: 90, flyIn: 160, after: 10 }), u + 300, 0, 0));
      L.push(ST.place(O.arch(THREE, { pal: A, u: u + 520, span: 70, rise: 40, n: 25, ready: 120, flyIn: 220, seed: 5 }), u + 520, 0, -6));
      L.push(ST.place(O.arch(THREE, { pal: A, u: u + 900, span: 360, rise: 200, n: 31, block: 16, ready: 200, flyIn: 400, seed: 9 }), u + 900, 0, -40));
      this.sw = swap(L.slice(2), A, B, 5.5); ST.cam = { back: 15, up: 5, ahead: 60, lookUp: 8, fov: 76 } },
    update(t) { this.sw(t) },
    caption: cap('32', 'Arches that assemble before the leader and burst after the last racer (small, medium, huge)', palCap('goldViolet', 'jade', 5.5)) };

  /* ===== 33 pieces of the other realms ===== */
  CL['13-other-realms'] = { dur: 9, fps: 16, beatOffset: dropAt(5),
    setup() { ST.init({ seed: 1234 }); ST.pack(null, 40); fog(350, 4500); const u = ST.u0, L = [];
      L.push(...Object.values(sky('iceViolet')).filter(Boolean));
      L.push(ST.place(O.realm(THREE, { kind: 'prism', size: 26 }), u + 160, -38, 18));
      L.push(ST.place(O.realm(THREE, { kind: 'urban', size: 22 }), u + 210, 40, 20));
      L.push(ST.place(O.realm(THREE, { kind: 'reef', size: 18 }), u + 280, -30, 26));
      L.push(ST.place(O.realm(THREE, { kind: 'forest', size: 20 }), u + 330, 30, 30));
      L.push(ST.place(O.realm(THREE, { kind: 'urban', size: 4, seed: 3 }), u + 80, 15, 4));
      L.push(ST.place(O.realm(THREE, { kind: 'forest', size: 4, seed: 4 }), u + 120, -15, 4));
      L.push(ST.placeFar(O.realm(THREE, { kind: 'prism', size: 320, seed: 5 }), 1600, -200, 120));
      this.L = L.slice(2); this.home = this.L.map((o) => o.k.pal.value.map((v) => v.clone())); ST.cam = { back: 15, up: 5, ahead: 60, lookUp: 12, fov: 76 } },
    update(t) { const B = t >= 4.6; if (B !== this.b) { this.b = B; this.L.forEach((o, i) => B ? o.k.setPal('goldViolet') : this.home[i].forEach((v, j) => o.k.pal.value[j].copy(v))) } },
    caption: cap('33', 'Pieces of the other realms: Prism rock, an Urban block, Reef coral, a Forest crown', (t) => t < 4.6 ? 'in their own colours (then all in the realm\'s gold + violet)' : 'all in the realm\'s gold + violet') };

  /* ===== 14 sacred geometry ===== */
  CL['14-sacred-geometry'] = { dur: 10, fps: 16, beatOffset: dropAt(5.5),
    setup() { ST.init({ seed: 1234 }); ST.pack(null, 22); fog(350, 4500); const A = 'goldViolet', B = 'cyanMagenta', u = ST.u0, L = [];
      L.push(...Object.values(sky('iceViolet')).filter(Boolean));
      L.push(ST.place(O.platonic(THREE, { pal: A, size: 3.2 }), u + 130, -34, 18));
      L.push(ST.place(O.merkaba(THREE, { pal: A, size: 2.5 }), u + 75, 15, 4));
      L.push(ST.place(O.merkaba(THREE, { pal: A, size: 2.5 }), u + 105, -15, 4));
      L.push(ST.place(O.flower(THREE, { pal: A, size: 30 }), u + 170, 42, 34));
      L.push(ST.placeFar(O.nested(THREE, { pal: A, size: 230 }), 1500, -120, 280));
      this.sw = swap(L.slice(2), A, B, 5.0); ST.cam = { back: 14, up: 4.5, ahead: 60, lookUp: 14, fov: 76 } },
    update(t) { this.sw(t) },
    caption: cap('14', 'Sacred geometry: the five solids, star tetrahedra, flower of life drawn beat by beat into Metatron\'s lines, nested solids', palCap('goldViolet', 'cyanMagenta', 5.0)) };

  /* ===== 6 rooms ===== */
  function roomClip(make, pal, extra) { return function () { ST.init({ seed: 1234 }); ST.pack(null, 75); fog(400, 5000);
    const room = ST.place(make(THREE, { pal, camera: ST.c.camera, ...extra }), ST.u0 - 60, 0, 0, { level: true }); ST.add(O.stars(THREE, { pal: 'iceViolet', follow: ST.c.camera, n: 900 }));
    ST.cam = { back: 15, up: 5.5, ahead: 60, lookUp: 7, fov: 76 }; this.room = room } }
  CL['15-room-lattice'] = { dur: 8, fps: 16, beatOffset: dropAt(4.5), setup: roomClip(R.lattice, 'cyanMagenta'),
    caption: cap('6 + 7', 'Room: the lattice hall. Walls of light all round; lattice bodies hang in it', 'cyan + magenta') };
  CL['16-room-mural'] = { dur: 8, fps: 16, beatOffset: dropAt(4.5), setup: roomClip(R.mural, 'goldViolet', { tick: true }),
    caption: cap('6 + 8', 'Room: the mural. A ribbed tunnel of mirrored bands, a symmetric mandala wall ahead', 'gold + violet') };
  CL['17-room-bloom'] = { dur: 8, fps: 16, beatOffset: dropAt(4.5), setup: roomClip(R.bloom, 'emberWhite'),
    caption: cap('6 + 9 + 11', 'Room: the chrysanthemum at the vanishing point, through a tunnel of rings', 'ember + white') };

  /* ===== 54 + 66: a crossing between two rooms ===== */
  CL['18-room-crossing'] = { dur: 8, fps: 16, beatOffset: dropAt(4.0),
    setup() { ST.init({ seed: 1234 }); ST.pack(null, 75); fog(400, 5000); const u = ST.u0;
      this.uP = u + 300; // the seam: about 4 s in for the camera
      this.A = ST.place(R.lattice(THREE, { pal: 'cyanMagenta', len: 420 }), u - 60, 0, 0, { level: true });
      this.B = ST.place(R.bloom(THREE, { pal: 'emberWhite', camera: ST.c.camera, len: 700 }), this.uP, 0, 0, { level: true });
      this.P = ST.place(R.portal(THREE, { pal: 'iceViolet', swirlPal: 'emberWhite', r: W() * 0.75 + 2 }), this.uP, 0, W() * 0.3, { level: true });
      ST.add(O.stars(THREE, { pal: 'iceViolet', follow: ST.c.camera, n: 900 }));
      ST.cam = { back: 15, up: 5.5, ahead: 60, lookUp: 7, fov: 76 } },
    update(t) { const camU = ST.lead(t) - ST.cam.back, past = camU > this.uP; this.A.group.visible = !past; this.B.group.visible = past; this.P.group.visible = !past;
      // the camera crosses: kaleidoscope for 0.45 s (six slices turning) and a short flash, then the new room
      const tc = (this.uP - (ST.u0 - ST.cam.back)) / ST.v, d = t - tc; ST.fx.k = Math.abs(d) < 0.225 ? 1 : 0; ST.fx.kRot = d * 3; ST.fx.flash = Math.max(0, 0.35 * (1 - Math.abs(d) / 0.12)) },
    caption: cap('54 + 66', 'Crossing: lattice hall to the chrysanthemum through a portal; kaleidoscope for 0.45 s', (t) => t < 4 ? 'room A: lattice, cyan + magenta' : 'room B: chrysanthemum, ember + white') };

  /* ===== 58: the music moves the world ===== */
  CL['19-music'] = { dur: 10, fps: 16, beatOffset: dropAt(5.0),
    setup() { ST.init({ seed: 1234 }); ST.pack(null, 30); fog(350, 4500); const u = ST.u0, P = 'goldViolet';
      sky('iceViolet');
      ST.place(O.shatter(THREE, { pal: P, size: 15, depth: 1, trigger: 'drop' }), u + 160, -40, 24);
      ST.place(O.stacks(THREE, { pal: 'jade', size: 12, tiers: 5, stacks: 2, carve: true }), u + 140, 42, -2, { level: true });
      ST.place(O.gyro(THREE, { pal: 'cyanMagenta', size: 14, rings: 4, tick: true }), u + 230, 22, 30);
      ST.place(O.platonic(THREE, { pal: 'emberWhite', size: 2.4 }), u + 95, -16, 9);
      ST.place(O.beastBlock(THREE, { pal: 'cyanMagenta', size: 3, step: true }), u + 70, 15, 4);
      ST.place(O.beastBlock(THREE, { pal: 'emberWhite', size: 3, first: 2, step: true }), u + 110, -15, 4);
      ST.place(O.shoal(THREE, { pal: 'iceViolet', n: 100, size: 0.8, radius: 26 }), u + 260, 0, 22);
      ST.placeFar(R.chrysanthemum(THREE, { pal: 'emberWhite', size: 500 }), 1900, 0, 200);
      ST.cam = { back: 14, up: 4.5, ahead: 60, lookUp: 12, fov: 78 } },
    caption: cap('58', 'The music moves the world: kicks light and step things, the drop bursts the solid', '140 bpm, drop every 8 bars; the MP4 has a click track') };
})(window);
