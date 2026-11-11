/* Spirit realm prototype, round 2, part 2: the overlay (caption, beat marks, section), echoes redone (57), the portal
   that shows the road ahead (49), and SPR.everything, the whole realm at once along a stretch. Not game code. */
(function () {
'use strict';
const SPR = window.SPR, SPFX = window.SPFX, SW = window.SW, V3 = THREE.Vector3, Q4 = THREE.Quaternion, M4 = THREE.Matrix4, TAU = Math.PI * 2;
const { clamp, lerp, ss } = SPR.h;
const fr = (u) => SW.fr(u);

// ---------------------------------------------------------------- the overlay
const SECN = { rise: 'BUILD', drop: 'DROP', b: 'DROP (B)', brk: 'BREAKDOWN' };
SPR.overlay = function () {
  let el = document.getElementById('r2o');
  if (!el) { el = document.createElement('div'); el.id = 'r2o'; el.style.cssText = 'position:fixed;left:0;top:0;right:0;bottom:0;pointer-events:none;font:600 12px/1.3 "DejaVu Sans Mono",monospace;color:#f2efe6;z-index:99';
    el.innerHTML = '<div id="r2c" style="position:absolute;left:9px;top:6px;right:9px;text-shadow:0 0 3px #000,0 0 6px #000"></div><div id="r2m" style="position:absolute;left:9px;bottom:8px;display:flex;gap:4px;align-items:center;text-shadow:0 0 3px #000"></div>' +
      '<div id="r2s" style="position:absolute;right:10px;bottom:8px;font-size:17px;font-weight:700;letter-spacing:2px;padding:1px 7px;border-radius:3px"></div>'; document.body.append(el) }
  const t = SW.t, b = SW.b; document.getElementById('r2c').innerHTML = SPR.cap ? SPR.cap(t, b) : '';
  const M = document.getElementById('r2m'), S = document.getElementById('r2s');
  if (!SPR.meter || !b) { M.innerHTML = ''; S.textContent = ''; S.style.background = 'none'; return }
  let h = ''; for (let i = 0; i < 4; i++) { const on = i === b.bb, a = on ? 0.3 + 0.7 * b.k : 0; h += `<span style="width:11px;height:11px;border:1px solid #ffb000;background:rgba(255,176,0,${a.toFixed(2)})"></span>` }
  h += '<span style="width:6px"></span>'; const n = Math.min(16, b.bl || 8);
  for (let i = 0; i < n; i++) h += `<span style="width:4px;height:${i === (b.bi || 0) ? 11 : 6}px;background:${i < (b.bi || 0) ? 'rgba(63,240,255,.75)' : i === b.bi ? '#3ff0ff' : 'rgba(63,240,255,.25)'}"></span>`;
  h += `<span style="margin-left:6px;color:#b8bfcc">${SPR.meterNote ? SPR.meterNote(b) : Math.round(b.bpm) + ' bpm'} · bar ${(b.bi || 0) + 1}/${b.bl || 8}</span>`; M.innerHTML = h;
  const nm = SECN[b.sec] || b.sec; S.textContent = nm; const col = b.sec === 'brk' ? '#8b93a2' : b.sec === 'rise' ? '#3ff0ff' : '#ffb000';
  S.style.background = col; S.style.color = '#111'; S.style.opacity = b.sec === 'drop' && b.tDrop < 2 ? 1 : 0.85;
};

// ---------------------------------------------------------------- G: echoes, redone
/* One merged mesh per frame type (every part of the frame's model in one geometry), drawn as an instanced ghost: three
   after-images of a leader are one draw. They live only on a short marked stretch (o.u0 to o.u1): entering it, the
   after-images peel off one by one (lags o.lags seconds behind); leaving it, they collapse in a cascade: the third joins
   the second, then the second the first, then the first the real frame (o.tau seconds each), with a small flash at
   each join. Very faint (o.alpha). */
const GI_V = `attribute float iA;attribute vec3 iC;varying vec3 vN;varying vec3 vV;varying float vA;varying vec3 vC;
  void main(){mat4 m=modelMatrix*instanceMatrix;vec4 w=m*vec4(position,1.);vN=normalize(mat3(m)*normal);vV=cameraPosition-w.xyz;vA=iA;vC=iC;gl_Position=projectionMatrix*viewMatrix*w;}`;
const GI_F = `varying vec3 vN;varying vec3 vV;varying float vA;varying vec3 vC;void main(){float f=1.-abs(dot(normalize(vN),normalize(vV)));float k=0.1+1.5*pow(f,2.2);gl_FragColor=vec4(vC*k*vA,1.);}`;
function mergeShip(ship) { ship.updateMatrixWorld(true); const inv = new M4().copy(ship.matrixWorld).invert(), P = [], N = [];
  ship.traverse((o) => { if (!o.isMesh || o.isInstancedMesh || !o.visible || !o.geometry.attributes.position || !o.geometry.attributes.normal) return; if (o.material && (o.material.blending === THREE.AdditiveBlending)) return;
    const g = o.geometry.index ? o.geometry.toNonIndexed() : o.geometry, m = new M4().multiplyMatrices(inv, o.matrixWorld), nm = new THREE.Matrix3().getNormalMatrix(m), v = new V3();
    for (let i = 0; i < g.attributes.position.count; i++) { v.fromBufferAttribute(g.attributes.position, i).applyMatrix4(m); P.push(v.x, v.y, v.z); v.fromBufferAttribute(g.attributes.normal, i).applyMatrix3(nm).normalize(); N.push(v.x, v.y, v.z) } });
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(P, 3)); geo.setAttribute('normal', new THREE.Float32BufferAttribute(N, 3)); return geo }
SPR.echoes = function (o = {}) {
  const C0 = SW.h.C, W = C0.W, lags = o.lags || [0.1, 0.2, 0.3], alpha = o.alpha || [0.2, 0.14, 0.09], tau = o.tau || 0.12, out = [], K = lags.length;
  // the marked stretch: the walls' tops glow violet along it, and a seam of light crosses the road at each end
  const L = SPFX.Lines(), pal = SPFX.newPal('iceViolet');
  for (let u = o.u0; u < o.u1; u += 4) { const a = fr(u), b = fr(u + 4); for (const s of [-1, 1]) L.seg(a.p.clone().addScaledVector(a.r, s * (W / 2 + 0.15)).addScaledVector(a.u, 1.45), b.p.clone().addScaledVector(b.r, s * (W / 2 + 0.15)).addScaledVector(b.u, 1.45), 0.75, 1.1) }
  for (const u of [o.u0, o.u1]) { const a = fr(u); for (let k = 0; k < 3; k++) L.seg(a.p.clone().addScaledVector(a.r, -W / 2).addScaledVector(a.u, 0.06).addScaledVector(a.t, k * 1.2), a.p.clone().addScaledVector(a.r, W / 2).addScaledVector(a.u, 0.06).addScaledVector(a.t, k * 1.2), 0.85, 1 - k * 0.3) }
  const mk = L.mesh(SPFX.lineMat({ pal, width: 0.22, minPx: 1.5, maxPx: 6 })); SW.track('echo marks', mk);
  const byType = new Map(); let draws = 0;
  SW.P.forEach((P, i) => { if (i === SW.camI && !o.withCam || (P.q.du ?? 0) < (o.minLead ?? 20)) return;
    const f = P.r.build ? P.r.build.frame : P.q.f; let T = byType.get(f); const col = SW.palCol(i * 47 + 20).lerp(new THREE.Color(1, 1, 1), 0.25);
    if (!T) { const geo = mergeShip(P.r.ship); const n = K * 4; geo.setAttribute('iA', new THREE.InstancedBufferAttribute(new Float32Array(n), 1)); geo.setAttribute('iC', new THREE.InstancedBufferAttribute(new Float32Array(n * 3), 3));
      const mat = new THREE.ShaderMaterial({ vertexShader: GI_V, fragmentShader: GI_F, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
      const m = new THREE.InstancedMesh(geo, mat, n); m.frustumCulled = false; m.count = 0; T = { m, geo, used: 0, tris: geo.attributes.position.count / 3 }; byType.set(f, T); SW.track('echoes (one draw per frame type)', m); draws++ }
    const slots = []; for (let j = 0; j < K; j++) slots.push(T.used++); out.push({ P, T, slots, col, inT: null, outT: null }) });
  const _m = new M4(), _p = new V3(), _q = new Q4(), _s = new V3();
  const posAt = (P, lag, tNow) => { const H = P.hist, tt = tNow - lag; if (!H.length) return null; if (tt >= H[0].t) return H[0]; for (let i = 0; i + 1 < H.length; i++) if (H[i + 1].t <= tt) { const a = H[i + 1], b = H[i], f = (tt - a.t) / Math.max(1e-6, b.t - a.t); return { p: a.p.clone().lerp(b.p, f), q: a.q.clone().slerp(b.q, f) } } return H[H.length - 1] };
  SPR.extra = Object.assign(SPR.extra || {}, { echoes: { leaders: out.length, frameTypes: byType.size, drawsTotal: draws, trisPerEcho: [...byType.values()].map((T) => Math.round(T.tris)) } });
  SW.anim.push((t) => { for (const T of byType.values()) { T.m.count = T.used; for (let i = 0; i < T.used; i++) T.geo.attributes.iA.setX(i, 0) }
    for (const E of out) { const r = E.P.r, inside = r.u >= o.u0 && r.u < o.u1; if (inside && E.inT == null) E.inT = t; if (!inside && E.inT != null && E.outT == null && r.u >= o.u1) E.outT = t;
      if (E.inT == null) continue; const sc = r.ship.scale;
      for (let j = 0; j < K; j++) { let lag = lags[j] * ss((t - E.inT) / 0.18 - j * 0.6), a = alpha[j], vis = true;
        if (E.outT != null) { const s = (t - E.outT) / tau; // the cascade: the last joins the one before it, and so on to the frame
          const joinAt = K - 1 - j; // echo j (0 nearest) moves during step K-1-j
          if (s >= joinAt + 1) vis = false; else if (s > joinAt) { const f = ss(s - joinAt); lag = lerp(lags[j], j ? lags[j - 1] : 0, f); a *= 1 + 0.8 * f }
          // the echo that is joined flashes a little
          const got = K - 2 - j; if (s > got + 1 && s < got + 1.6) a *= 1 + 1.6 * (1 - (s - got - 1) / 0.6) }
        const h = posAt(E.P, lag, t); if (!h || !vis) continue; _m.compose(h.p, h.q, sc); E.T.m.setMatrixAt(E.slots[j], _m); E.T.geo.attributes.iA.setX(E.slots[j], a); E.T.geo.attributes.iC.setXYZ(E.slots[j], E.col.r, E.col.g, E.col.b) } }
    for (const T of byType.values()) { T.m.instanceMatrix.needsUpdate = true; T.geo.attributes.iA.needsUpdate = true; T.geo.attributes.iC.needsUpdate = true } });
  return { out, byType };
};

// ---------------------------------------------------------------- H: the portal shows the road you come out on
/* The entrance disc shows the scene from a second camera: the viewer's camera carried from the entrance to the exit
   (M = exit frame x inverse(entrance frame)), its near plane tilted to the exit's plane (oblique clipping) so nothing
   behind the exit gets in the way. Rendered into a target at o.scale of the screen, only while the disc is in view, and
   drawn on the disc with screen-space coordinates, so it lines up with the world behind it. The camera crosses on the
   far side's terms: until the chase camera itself reaches the entrance, it is drawn on the entrance side. */
const PV_F = `uniform sampler2D uTex;uniform vec2 uRes;uniform float uT,uOn;varying vec2 vUv;void main(){vec2 s=gl_FragCoord.xy/uRes;vec3 c=texture2D(uTex,s).rgb*1.12;
  vec2 q=vUv*2.-1.;float r=length(q);if(r>1.)discard;float rim=smoothstep(0.82,1.,r);c=mix(c,c*0.4+vec3(0.35,0.3,0.6)*0.5,rim*0.6);c+=vec3(0.5,0.4,0.9)*pow(rim,3.)*0.6*(0.8+0.2*sin(uT*6.+atan(q.y,q.x)*6.));gl_FragColor=vec4(c*uOn,1.);}`;
const PV_V = `varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`;
SPR.portalView = function (o = {}) {
  const J = SW.jump, C0 = SW.h.C, ren = C0.renderer, WUP = new V3(0, 1, 0), sc = o.scale || 0.5;
  const sz = ren.getDrawingBufferSize(new THREE.Vector2()), rt = new THREE.WebGLRenderTarget(Math.round(sz.x * sc), Math.round(sz.y * sc), { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter });
  const disc = J.ringE.disc; disc.material = new THREE.ShaderMaterial({ vertexShader: PV_V, fragmentShader: PV_F, uniforms: { uTex: { value: rt.texture }, uRes: { value: sz.clone() }, uT: { value: 0 }, uOn: { value: 1 } }, side: THREE.DoubleSide });
  if (J.ringX.disc) J.ringX.disc.visible = false; SW.noFlash = true;
  const cE = J.ringE.position.clone(), cX = J.ringX.position.clone(), rH = new V3().crossVectors(J.h, WUP).normalize();
  const ME = new M4().makeBasis(J.r0, WUP, J.f0).setPosition(cE), MX = new M4().makeBasis(rH, WUP, J.h).setPosition(cX), Mrel = new M4().multiplyMatrices(MX, new M4().copy(ME).invert()), Minv = new M4().copy(Mrel).invert();
  const vcam = new THREE.PerspectiveCamera(), plane = new THREE.Plane(), v4 = new THREE.Vector4(), q4 = new THREE.Vector4(), fr0 = new THREE.Frustum(), pm = new M4(), R = J.ringE.blocks.R;
  const st = { renders: 0, frames: 0, calls: 0, tris: 0 }; SPR.extra = Object.assign(SPR.extra || {}, { portalView: st });
  // the chase camera is drawn on the entrance side until it reaches the entrance (its racer is through already)
  SW.camPost = () => { const cam = C0.camera; if (dotPlane(cam.position, cX, J.h) < 0 && SW.P[SW.camI].r.path && SW.P[SW.camI].r.u >= SW.P[SW.camI].r.path.u0) { cam.matrixWorld.premultiply(Minv); cam.matrixWorld.decompose(cam.position, cam.quaternion, cam.scale); cam.updateMatrixWorld(true) } };
  const dotPlane = (p, c, n) => _d.subVectors(p, c).dot(n); const _d = new V3();
  SW.preDraw = () => { const cam = C0.camera; st.frames++; disc.material.uniforms.uT.value = SW.t;
    // in view? (in front of the entrance, the disc inside the frustum)
    cam.updateMatrixWorld(true); pm.multiplyMatrices(cam.projectionMatrix, cam.matrixWorldInverse); fr0.setFromProjectionMatrix(pm);
    const front = dotPlane(cam.position, cE, J.f0) < 0, see = front && fr0.intersectsSphere(new THREE.Sphere(cE, R)); disc.visible = see; if (!see) return;
    vcam.matrixWorld.multiplyMatrices(Mrel, cam.matrixWorld); vcam.matrixWorld.decompose(vcam.position, vcam.quaternion, vcam.scale); vcam.updateMatrixWorld(true);
    vcam.projectionMatrix.copy(cam.projectionMatrix);
    plane.setFromNormalAndCoplanarPoint(J.h, cX.clone().addScaledVector(J.h, -0.05)).applyMatrix4(vcam.matrixWorldInverse); v4.set(plane.normal.x, plane.normal.y, plane.normal.z, plane.constant);
    const e = vcam.projectionMatrix.elements; q4.set((Math.sign(v4.x) + e[8]) / e[0], (Math.sign(v4.y) + e[9]) / e[5], -1, (1 + e[10]) / e[14]); v4.multiplyScalar(2 / v4.dot(q4)); e[2] = v4.x; e[6] = v4.y; e[10] = v4.z + 1; e[14] = v4.w;
    vcam.projectionMatrixInverse.copy(vcam.projectionMatrix).invert();
    const keep = disc.visible; disc.visible = false; const oldRT = ren.getRenderTarget(), ac = ren.autoClear; ren.setRenderTarget(rt); ren.autoClear = true; ren.info.autoReset = false; ren.info.reset();
    ren.render(C0.scene, vcam); st.renders++; SPR.xPass = { calls: ren.info.render.calls, tris: ren.info.render.triangles }; st.calls = Math.max(st.calls, ren.info.render.calls); st.tris = Math.max(st.tris, ren.info.render.triangles);
    ren.info.autoReset = true; ren.setRenderTarget(oldRT); ren.autoClear = ac; disc.visible = keep };
  return { rt, Mrel };
};

// ---------------------------------------------------------------- B: everything at once
/* The whole realm along a stretch (u0..u1) round a real track, every piece placed with rule A. o.density, o.pal,
   o.sections (lattice), o.room {u0, len}, o.gate (u), o.spiral [u0, u1] for the serpent, o.shoalSome (which pieces are
   made of shoals). Returns the pieces; their costs are in SW.stats. */
SPR.everything = function (o = {}) {
  const u0 = o.u0, u1 = o.u1, k = o.density ?? 1, rnd = SW.h.rng(o.seed || 2026), C0 = SW.h.C, W = C0.W, out = {};
  const R = (a, b) => lerp(a, b, rnd()), side = () => (rnd() < 0.5 ? -1 : 1), along = (i, n) => lerp(u0 + 80, u1 - 60, (i + rnd() * 0.8) / n);
  SW.stars({ u0, u1, n: 1600 });
  // the backbone: the lattice in sections
  out.lattice = SPR.lattice({ u0: u0 - 150, u1: u1 + 150, sections: o.sections, pal: o.latPal || 'cyanMagenta', gain: o.latGain || 1 });
  // the room the road passes through
  if (o.room) out.room = SPR.roomLattice({ u0: o.room.u0, len: o.room.len, pal: o.room.pal || 'cyanMagenta', bodies: 6 });
  // floating solids near and in the sky (SW, instanced), carved blocks, block rings, pyramids, the stepped sky
  SW.solids({ u0: u0 - 100, u1: u1 + 400, n: Math.round(220 * k), side0: 40, side1: 420, up0: -120, up1: 260, clear: 30, s0: 4, s1: 24, name: 'floating solids' });
  SW.solids({ u0: u0 - 200, u1: u1 + 800, n: Math.round(220 * k), side0: 0, side1: 700, up0: 80, up1: 560, clear: 60, s0: 14, s1: 60, seed: 77, spin: 0.12, name: 'sky solids' });
  SW.carved({ u0, u1: u1 + 200, n: Math.round(16 * k), tumble: true, name: 'carved blocks' });
  if (o.rings) SW.rings({ us: o.rings, w: 0.2 });
  if (o.pairs) SW.pyramids({ u0, pairs: o.pairs });
  SW.stepped({ u0, u1: u1 + 300, n: 12, far: 8, stairs: false, big: o.bigZig || [] });
  // the serpent under the spiral (seen only while the leader is on it)
  if (o.spiral) { const S = SW.serpent({ follow: true, ahead: 150, n: 50, neck: 10, lookBack: true }); const hide = (t) => { const l = SPR.leadU(), on = l > o.spiral[0] && l < o.spiral[1]; S.body.visible = S.fins.visible = S.head.visible = on }; SW.anim.push(hide) }
  // chasing heads
  if (o.heads !== false) SW.heads({ list: [{ side: -1, d: 34, up: 10, s: 8, du: 20, t0: 0.4 }, { side: 1, d: 48, up: 16, s: 12, du: 55, t0: 1.2 }, { side: -1, d: 130, up: 50, s: 34, du: 170, t0: 0 }, { side: 1, d: 170, up: 80, s: 46, du: 280, t0: 0 }] });
  // SPFX objects, each placed with rule A over its whole animation
  const P = (name, obj, u, lat, h, x = {}) => SPR.put(name, obj, (kk) => ({ u: u + (kk % 2 ? 1 : -1) * kk * 9, lat: lat * (1 + kk * 0.08), h: h + kk * 2, level: x.level, yaw: x.yaw }), x);
  const pals = ['goldViolet', 'emberWhite', 'jade', 'iceViolet', 'cyanMagenta'], pk = () => pals[Math.floor(rnd() * pals.length)];
  const breathe = (obj, a) => obj && SPFX.breathe(obj, a || 0.04, { kick: 0.3 });
  const O = SPFX.obj;
  // stacks stepping (medium carved pairs; huge ones far off)
  for (let i = 0; i < Math.round(3 * k); i++) P('stacks', O.stacks(THREE, { pal: 'jade', size: R(10, 16), tiers: 5, stacks: 2, carve: true, seed: 3 + i }), along(i, 3), side() * R(48, 80), R(-6, 4), { level: true });
  for (let i = 0; i < 2; i++) P('stacks (huge)', O.stacks(THREE, { pal: 'emberWhite', size: R(90, 140), tiers: 6, stacks: 3, seed: 7 + i, turn: 0.2 }), along(i, 2) + 300, side() * R(420, 650), R(-140, -60), { level: true, nt: 4 });
  // gyroscopes beside the road (and the gate over it)
  for (let i = 0; i < Math.round(4 * k); i++) breathe(P('gyroscopes', O.gyro(THREE, { pal: pk(), size: R(10, 26), rings: 4 + (i % 2), tick: true }), along(i, 4), side() * R(45, 110), R(14, 50)));
  P('gyroscopes (huge)', O.gyro(THREE, { pal: 'iceViolet', size: 260, rings: 6, speeds: [0.05, -0.08, 0.11, -0.14, 0.2, -0.25] }), u1 - 200, side() * 900, 380, { nt: 3 });
  if (o.gate) { const cands = [].concat(o.gate), g = SPR.gyroGate({ tick: true, pal: 'goldViolet' });
    const ok = SPR.put('gyroscope gate (road through it)', g, (kk) => ({ u: cands[kk % cands.length], lat: 0, h: 0 }), { tries: cands.length, nt: 8 }); if (ok) { breathe(g, 0.03); SPR.extra = Object.assign(SPR.extra || {}, { gateAt: Math.round(g.group.position.x) + ',' + Math.round(g.group.position.z) }) } else SPR.extra = Object.assign(SPR.extra || {}, { gateBad: SPC.lastBad }) }
  // knots, unfolding solids
  for (let i = 0; i < Math.round(2 * k); i++) breathe(P('knots', O.knot(THREE, { pal: pk(), size: R(14, 24), bars: 2, seg: 240, strands: 3 }), along(i, 2) + 60, side() * R(55, 100), R(20, 50)));
  P('knots (huge)', O.knot(THREE, { pal: 'jade', size: 240, bars: 2, phase: 1.3, strands: 4, seg: 300 }), u0 + (u1 - u0) * 0.6, side() * 800, 300, { nt: 4 });
  for (let i = 0; i < Math.round(2 * k); i++) { P('unfolding solids', O.unfoldCube(THREE, { pal: pk(), size: R(9, 14) }), along(i, 2) + 120, side() * R(40, 80), R(14, 34)); P('unfolding solids', O.unfoldFlower(THREE, { pal: pk(), size: R(7, 10) }), along(i, 2) + 200, side() * R(40, 80), R(16, 36)) }
  // a free shoal wheeling beside the road
  for (let i = 0; i < Math.round(2 * k); i++) P('shoals', O.shoal(THREE, { pal: pk(), n: 140, size: R(1, 1.6), radius: R(26, 40), speed: 0.5, flat: 0.5, seed: 9 + i }), along(i, 2) + 40, side() * R(110, 150), R(40, 70), { pad: 1 });
  // colossi, sunk to the waist; one of them made of shoals
  const floor = o.floor ?? -260, lead = () => SPR.leadPos();
  // (checked with rule A too: a far colossus can still stand across another part of the lap)
  const col = (name, obj, d, lat) => { const f = fr(u0 + d), t = f.t.clone().setY(0).normalize(), r = new V3(0, 1, 0).cross(t).negate();
    const ok = SPC.fit(name, obj, (g, kk) => { const a = kk * 0.35 * (kk % 2 ? 1 : -1), dir = r.clone().applyAxisAngle(new V3(0, 1, 0), a); g.position.copy(f.p).addScaledVector(dir, lat * (1 + kk * 0.1)); g.position.y = floor; g.lookAt(f.p.x, floor, f.p.z) }, { tries: 8, step: 12, times: [null] });
    if (ok) SPR.add(obj, name); return obj };
  col('colossi', SPR.colossus({ size: 1500, target: lead, pal: 'iceViolet' }), (u1 - u0) * 0.35, -2200);
  col('colossi', SPR.colossus({ size: 1250, target: lead, pal: 'goldViolet' }), (u1 - u0) * 0.75, 2000);
  if (o.shoalSome !== false) { // a colossus made of shoals: its body's lines, as a flock that holds the shape
    const ghost = SPR.colossus({ size: 1100 }), segs = SPR.segsOf(ghost.group).filter(([a, b]) => a.y > -20 || b.y > -20).map(([a, b]) => [a.y < 0 ? a.clone().lerp(b, -a.y / Math.max(1e-3, b.y - a.y)) : a, b.y < 0 ? b.clone().lerp(a, -b.y / Math.max(1e-3, a.y - b.y)) : b]);
    const sh = SPR.shoalForm(segs, { n: 2200, fish: 6, amp: 60, pal: 'emberWhite', slideM: 40, slide: 0.05, swirl: 1 }); col('shoal colossus', sh, (u1 - u0) * 1.0 + 300, -1600) }
  // arches assembling ahead of the leader (blocks fly in along their own radius); one made of shoals
  const span = 2 * (W / 2 + SPC.o.margin) * 1.6, rise = SPC.o.above * 1.9;
  (o.arches || []).forEach((uas, i) => { const cand = [].concat(uas), ua = cand[0], cu = (kk) => cand.length > 1 ? cand[kk % cand.length] : ua + (kk % 2 ? 1 : -1) * kk * 15; if (o.shoalSome !== false && i === 1) { const segs = SPR.shape.arch(span * 1.15, rise * 1.15, 17, 5); const sh = SPR.shoalForm(segs, { n: 900, fish: 0.9, amp: 5, pal: 'jade', mode: 'both' }); SPR.put('arch of shoals', sh, (kk) => ({ u: cu(kk), lat: 0, h: 0 }), { tries: Math.max(12, cand.length), nt: 3 }) || (SPR.extra = Object.assign(SPR.extra || {}, { archShoalBad: SPC.lastBad })); return }
    SPR.put('arches (assemble ahead of the leader)', O.arch(THREE, { pal: i % 2 ? 'jade' : 'goldViolet', u: ua, span, rise, n: 19, block: 3.2, ready: 140, flyIn: 260, after: 20, lastDu: -45, outward: true, seed: 5 + i }), (kk) => ({ u: cu(kk), lat: 0, h: 0 }), { tries: Math.max(12, cand.length), nt: 3, times: [null] }) || (SPR.extra = Object.assign(SPR.extra || {}, { ['archBad' + i]: SPC.lastBad })) });
  // a pyramid and a ring made of shoals ("just sometimes")
  if (o.shoalSome !== false) { P('pyramid of shoals', SPR.shoalForm(SPR.shape.pyramid(70, 6), { n: 1000, fish: 1.4, amp: 10, pal: 'goldViolet' }), u0 + (u1 - u0) * 0.5, side() * 150, -30, { level: true, nt: 3 }) }
  // sacred geometry
  breathe(P('sacred geometry', O.platonic(THREE, { pal: 'goldViolet', size: 4 }), along(0, 3), side() * 55, 22));
  P('sacred geometry', O.flower(THREE, { pal: 'emberWhite', size: 34 }), along(1, 3), side() * 75, 40, { yaw: 0.6 });
  for (let i = 0; i < 2; i++) P('sacred geometry', O.merkaba(THREE, { pal: 'cyanMagenta', size: 3.5 }), along(i, 2) + 30, side() * 28, 6);
  P('sacred geometry (huge)', O.nested(THREE, { pal: 'goldViolet', size: 260 }), u0 + (u1 - u0) * 0.3, side() * 700, 420, { nt: 3 });
  // pieces of the other realms
  ['prism', 'urban', 'reef', 'forest'].forEach((kind, i) => P('other realms', O.realm(THREE, { kind, size: R(16, 26), seed: 33 + i, pal: i % 2 ? 'goldViolet' : null }), along(i, 4) + 70, side() * R(60, 120), R(10, 40)));
  // breathing road edges (subtle): the game's road edge, a neon line just inside it that swells
  if (o.edges !== false) { const re = SPFX.obj.roadLines(THREE, { pal: 'amber', u0: u0 - 50, u1: u1 + 50, width: 0.26 }); SPFX.breathe(re, 0.04, { scale: false, swell: 6 }); SPR.add(re, 'breathing road edges') }
  return out;
};
})();
