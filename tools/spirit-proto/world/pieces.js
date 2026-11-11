// Spirit realm world prototype (Prototype 61): the road set pieces (heads, serpent, portals, tunnel, ghost riders, echoes,
// the music clock). Uses world.js's SW. Not game code.
(function () {
'use strict';
const SW = window.SW, H = SW.h, V3 = THREE.Vector3, Q4 = THREE.Quaternion, M4 = THREE.Matrix4, Col = THREE.Color, TAU = Math.PI * 2;
const { rng, clamp, lerp, ss, BOX, setI, U } = H;
const C = () => H.C, fr = SW.fr, at = SW.at;
const _m = new M4(), _q = new Q4(), _p = new V3(), _s = new V3(), _v = new V3(), _w = new V3();
const WUP = new V3(0, 1, 0);

// ---------------------------------------------------------------- shared materials
// a see-through neon body (ghost riders, echoes): bright at the silhouette, faint in the middle
const GHOST_V = `varying vec3 vN; varying vec3 vV; void main(){ vec4 w=modelMatrix*vec4(position,1.); vN=normalize(mat3(modelMatrix)*normal); vV=cameraPosition-w.xyz; gl_Position=projectionMatrix*viewMatrix*w; }`;
const GHOST_F = `uniform vec3 uC; uniform float uA; varying vec3 vN; varying vec3 vV; void main(){ float f=1.-abs(dot(normalize(vN),normalize(vV))); float k=0.16+1.25*pow(f,2.0); gl_FragColor=vec4(uC*k*uA,1.); }`;
function ghostMat(col, a = 1) { return new THREE.ShaderMaterial({ vertexShader: GHOST_V, fragmentShader: GHOST_F, uniforms: { uC: { value: new Col(col) }, uA: { value: a } }, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide }) }
SW.ghostMat = ghostMat;
function ghostOf(ship, mat) { const g = ship.clone(true); g.traverse((o) => { if (o.isMesh || o.isLine || o.isPoints) { o.material = mat; o.castShadow = false } }); return g }
// the swirl in a portal (view a: one draw), coloured by the palette
const SWIRL_F = SW.GL_COMMON + `varying vec2 vUv; uniform float uSpin; void main(){ vec2 q=vUv*2.-1.; float r=length(q); if(r>1.) discard; float a=atan(q.y,q.x);
  float s=sin(a*5.+r*16.-uT*uSpin); float arms=smoothstep(0.35,1.,s)*(0.35+0.65*r); vec3 c=pal(r*110.+uT*25.)*arms*1.3+vec3(0.015,0.005,0.03);
  c+=vec3(1.)*exp(-r*7.)*0.9; c*=smoothstep(1.,0.93,r); gl_FragColor=vec4(c*(1.+uPulse*0.5),1.); }`;
const UV_V = `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }`;
function swirlMat() { return new THREE.ShaderMaterial({ vertexShader: UV_V, fragmentShader: SWIRL_F, uniforms: Object.assign({}, U, { uSpin: { value: 5 } }) }) }

// ---------------------------------------------------------------- 1. heads that chase the pack (wireframe, lat-long grid)
function headGeo() {
  const g = new THREE.SphereGeometry(1, 36, 26), P = g.attributes.position;
  for (let i = 0; i < P.count; i++) { let x = P.getX(i), y = P.getY(i), z = P.getZ(i);
    x *= 0.76; z *= 0.94; y *= 1.12;
    if (y < -0.15) { const k = clamp((-y - 0.15) / 0.95, 0, 1); x *= 1 - 0.42 * k; z *= 1 - 0.12 * k }
    if (z < 0) { z *= 1.06; if (y < -0.4) z *= 0.75 }
    const fz = Math.max(0, z / 0.94), front = fz * fz;
    z -= 0.16 * Math.exp(-(((Math.abs(x) - 0.26) / 0.11) ** 2 + ((y - 0.12) / 0.075) ** 2)) * front;           // eye sockets
    z += 0.08 * Math.exp(-(((y - 0.25) / 0.06) ** 2)) * Math.exp(-((x / 0.5) ** 2)) * front;                  // brow
    z += 0.34 * Math.exp(-((x / 0.085) ** 2 + ((y + 0.07) / 0.19) ** 2)) * front * (y < 0.16 ? 1 : 0.4);      // nose
    z -= 0.07 * Math.exp(-(((y + 0.42) / 0.03) ** 2 + (x / 0.2) ** 2)) * front;                                // mouth line
    z += 0.05 * Math.exp(-(((y + 0.36) / 0.05) ** 2 + (x / 0.2) ** 2)) * front;                                // upper lip
    z += 0.08 * Math.exp(-(((y + 0.82) / 0.1) ** 2 + (x / 0.2) ** 2)) * front;                                 // chin
    x *= 1 + 0.07 * Math.exp(-(((y + 0.02) / 0.14) ** 2)) * front;                                              // cheekbones
    P.setXYZ(i, x, y, z) }
  g.computeVertexNormals(); return g }
SW.heads = function (o = {}) {
  const geo = headGeo(), list = o.list || [{ side: -1, d: 34, up: 10, s: 9, du: 30 }, { side: 1, d: 46, up: 16, s: 13, du: 70 }, { side: -1, d: 120, up: 40, s: 34, du: 160 }];
  const out = [];
  list.forEach((h, k) => { const mat = SW.wireMat({ mode: 'GRID', grid: [18, 13], cs: 1e6, con: 0, fill: 0x030208, side: THREE.FrontSide }); mat.uniforms.uI.value.set(k * 37 + 10, -1, 0.55, 1); mat.uniforms.uHueK.value = 0.2;
    const m = new THREE.Mesh(geo, mat); const eyes = new THREE.Group();
    for (const sx of [-1, 1]) { const e = new THREE.Mesh(new THREE.SphereGeometry(0.075, 12, 8), new THREE.MeshBasicMaterial({ color: 0xffffff })); e.position.set(sx * 0.26, 0.12, 0.8); eyes.add(e);
      const halo = new THREE.Mesh(new THREE.SphereGeometry(0.15, 12, 8), new THREE.MeshBasicMaterial({ color: SW.palCol(k * 60 + 30), transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending, depthWrite: false })); halo.position.copy(e.position); eyes.add(halo) }
    const grp = new THREE.Group(); grp.add(m); grp.add(eyes); grp.scale.setScalar(h.s); SW.track('heads', grp); out.push({ h, grp, mat }) });
  SW.anim.push((t, dt, b) => { const P = SW.P; if (!P || !P.length) return; let um = 0; for (const q of P) um += q.r.u; um /= P.length;
    const tgt = SW.P[0].r.ship.position;
    out.forEach(({ h, grp, mat }, k) => { const fade = h.t0 != null ? ss((t - h.t0) / 1.2) * (h.t1 != null ? 1 - ss((t - h.t1) / 1.2) : 1) : 1;
      const u = um + h.du + Math.sin(t * 0.35 + k) * 6, f = fr(u); grp.position.copy(f.p).addScaledVector(f.r, h.side * h.d).addScaledVector(WUP, h.up + Math.sin(t * 0.8 + k * 2) * h.s * 0.06);
      // turn to watch the pack: the racers nearest, with a slow lag
      _v.copy(tgt).sub(grp.position); _v.y *= 0.5; const want = Math.atan2(_v.x, _v.z), pitch = -Math.atan2(_v.y, Math.hypot(_v.x, _v.z)) * 0.6;
      grp.rotation.set(pitch, want + Math.sin(t * 0.5 + k) * 0.08, Math.sin(t * 0.3 + k) * 0.05, 'YXZ');
      mat.uniforms.uI.value.z = 0.55 * fade * (1 + (b ? b.kick * 0.5 : 0)); grp.visible = fade > 0.01; grp.children[1].children.forEach((e) => { if (e.material.opacity != null && e.material.transparent) e.material.opacity = 0.6 * fade }) }) });
  return out };

// ---------------------------------------------------------------- 2. the serpent of segments under the spiral road
// Its body follows the road's own centreline a few metres under it (so the pack rides its back up the spiral), its
// segments sway out past the road's edges, and the head rises at the front, turned back to look at the racers.
SW.serpent = function (o = {}) {
  const n = o.n || 46, segL = o.segL || 9, gap = o.gap || 1.3, rad = o.rad || (C().W / 2 + 8), flat = o.flat || 0.36, depth = o.depth || rad * flat + 1.0, neck = o.neck || 8;
  // the body: open octagonal rings drawn as a wire grid (an edge per facet), one instanced draw; fins: boxes, a second draw
  const ringG = new THREE.CylinderGeometry(1, 1, 1, 8, 1, true); ringG.rotateX(Math.PI / 2);
  const body = SW.h.instanced(ringG, SW.wireMat({ mode: 'GRID', grid: [8, 1], inst: true, cs: 2.2, con: 0.7, fill: 0x04100c, side: THREE.DoubleSide }), n);
  const fins = SW.h.instanced(BOX, SW.wireMat({ mode: 'QUAD', inst: true, cs: 1.5, con: 0.5, fill: 0x04100c }), n * 2);
  for (let i = 0; i < n; i++) { body.aI.setXYZW(i, (i % 3) * 45 + 20, -1, 1.25, 1); fins.aI.setXYZW(i, 70, -1, 1.1, 1); fins.aI.setXYZW(n + i, 70, -1, 1.1, 1) }
  const L = []; for (let i = 0; i < n; i++) { const k = i / (n - 1); L.push({ i, taper: i < 3 ? lerp(0.75, 1, i / 3) : 1 - 0.75 * Math.pow(k, 2.0) }) }
  // the head: skull, snout, open jaw, horns, eyes
  const head = new THREE.Group(), hm = SW.wireMat({ mode: 'QUAD', cs: 0.12, con: 0.5, fill: 0x04100c }); hm.uniforms.uI.value.set(30, -1, 1.5, 1);
  const bx = (sx, sy, sz, x, y, z, rx = 0, ry = 0, rz = 0) => { const b = new THREE.Mesh(BOX, hm); b.scale.set(sx, sy, sz); b.position.set(x, y, z); b.rotation.set(rx, ry, rz); head.add(b); return b };
  bx(1.0, 0.62, 1.0, 0, 0.15, 0); bx(0.62, 0.36, 0.95, 0, 0.12, 0.9, -0.08); const jaw = bx(0.56, 0.18, 1.05, 0, -0.3, 0.78, 0.35);
  bx(0.12, 0.12, 0.9, 0.32, 0.62, -0.45, 0.9, 0.25); bx(0.12, 0.12, 0.9, -0.32, 0.62, -0.45, 0.9, -0.25); bx(0.2, 0.2, 0.25, 0.42, 0.25, 0.42); bx(0.2, 0.2, 0.25, -0.42, 0.25, 0.42);
  bx(0.06, 0.06, 1.2, 0.2, 0.0, 1.5, 0, 0.5, 0); bx(0.06, 0.06, 1.2, -0.2, 0.0, 1.5, 0, -0.5, 0);
  for (const sx of [-1, 1]) { const e = new THREE.Mesh(new THREE.SphereGeometry(0.1, 10, 8), new THREE.MeshBasicMaterial({ color: 0xffffff })); e.position.set(sx * 0.4, 0.32, 0.5); head.add(e) }
  head.scale.setScalar(o.headS || 15); SW.track('serpent body', body); SW.track('serpent fins', fins); SW.track('serpent head', head);
  const outSide = (u) => { const a = fr(u), b = fr(u + 25); return -Math.sign(b.t.clone().sub(a.t).dot(a.r)) || 1 };
  const st = { u: o.u ?? 0 };
  SW.anim.push((t, dt) => { const P = SW.P; const lead = P && P.length ? Math.max(...P.map((q) => q.r.u)) : 0;
    const uh = o.follow ? lead + (o.ahead || 60) : st.u + (o.v || 160) * t, sd = o.side || (st.sd = st.sd || outSide(uh));
    const pts = L.map((s, i) => { const u = uh - i * (segL + gap), f = fr(u); const sway = Math.sin(u * 0.05 - t * 2.4) * (o.sway ?? 2.5) * Math.min(1, i / 6);
      // the neck: the first segments climb out beside the road, so the head rises past the edge, ahead of the pack
      const nk = ss(1 - i / neck), sOff = nk * (C().W / 2 + rad * s.taper + 6), side = sd * sOff, lift = ss((sOff - (C().W / 2 + rad * s.taper + 1)) / 5) * (depth + 12);
      const c = f.p.clone().addScaledVector(f.u, -depth * (0.6 + 0.4 * s.taper) + lift).addScaledVector(f.r, sway + side); return { c, f, s, lk: lift / (depth + 12) } });
    pts.forEach(({ c, f, s, lk }, i) => { const nx = pts[Math.min(i + 1, n - 1)].c, pv = pts[Math.max(i - 1, 0)].c, tg = pv.clone().sub(nx).normalize();
      const rr = new V3().crossVectors(tg, f.u).normalize(), uu = new V3().crossVectors(rr, tg); _m.makeBasis(rr, uu, tg); _q.setFromRotationMatrix(_m);
      const R = rad * s.taper * lerp(1, 0.6, lk); _s.set(R, rad * s.taper * lerp(flat, 0.5, lk), segL); setI(body, i, c, _q, _s);
      for (const k of [-1, 1]) { const fp = c.clone().addScaledVector(rr, k * (R + 2.2)).addScaledVector(uu, -R * flat * 0.5); const fq = _q.clone().multiply(new Q4().setFromAxisAngle(new V3(0, 0, 1), -k * 0.6));
        _s.set(5.5 * s.taper, 0.7, segL * 0.6); setI(fins, i + (k > 0 ? n : 0), fp, fq, _s) } });
    body.instanceMatrix.needsUpdate = true; fins.instanceMatrix.needsUpdate = true;
    const h0 = pts[0], h1 = pts[1]; const dir = h0.c.clone().sub(h1.c).normalize(); head.position.copy(h0.c).addScaledVector(dir, 10).addScaledVector(WUP, 3);
    // the head looks back over its shoulder at the pack
    const tgt = SW.P[SW.camI].r.ship.position.clone(); const look = o.lookBack ? tgt : head.position.clone().add(dir);
    _m.lookAt(look, head.position, WUP); head.quaternion.setFromRotationMatrix(_m); head.rotateY(Math.PI); head.rotateX(Math.sin(t * 0.9) * 0.08);
    jaw.rotation.x = 0.35 + Math.sin(t * 2.1) * 0.15 });
  return { body, fins, head } };

// ---------------------------------------------------------------- 3. road ribbons (portal ramps, catch roads) in the game's road look
// pts: [{p, r, u}] every metre or two. The surface uses the game's road material (it reflects the realm as the road does).
SW.ribbon = function (pts, o = {}) {
  const C0 = C(), W = o.W || C0.W, M = C0.T.mats, grp = new THREE.Group(); let acc = 0;
  const strip = (a, b, ha, hb, mat, uvk) => { const pos = [], uv = [], idx = []; acc = 0;
    pts.forEach((q, i) => { if (i) acc += q.p.distanceTo(pts[i - 1].p); for (const [lat, h, x] of [[a, ha, 0], [b, hb, 1]]) { const v = q.p.clone().addScaledVector(q.r, lat).addScaledVector(q.u, h); pos.push(v.x, v.y, v.z); uv.push(x, acc * uvk) }
      if (i) { const k = i * 2; idx.push(k - 2, k, k - 1, k - 1, k, k + 1) } });
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx); g.computeVertexNormals();
    const m = new THREE.Mesh(g, mat); grp.add(m); return m };
  const dark = new THREE.MeshBasicMaterial({ color: 0x0e1015, side: THREE.DoubleSide });
  strip(-W / 2, W / 2, 0, 0, M.roadM, 1 / 24); strip(W / 2, -W / 2, -0.6, -0.6, dark, 1);
  for (const sd of [-1, 1]) { strip(sd * W / 2 - 0.25, sd * W / 2 + 0.25, 0.06, 0.06, M.rail, 1); if (o.walls !== false) { strip(sd * W / 2, sd * W / 2, 0, 1.3, M.glass, 1); strip(sd * (W / 2) - 0.15, sd * (W / 2) + 0.15, 1.3, 1.3, M.rail, 1) } }
  // lane lines, faint
  for (const lat of [-W / 6, W / 6]) strip(lat - 0.12, lat + 0.12, 0.04, 0.04, M.edgeM.clone ? new THREE.MeshBasicMaterial({ color: 0x9f7bff, transparent: true, opacity: 0.5 }) : M.edgeM, 1);
  if (o.pads) for (const [s0, lat] of o.pads) { const i0 = Math.round(s0 / (o.ds || 1)), sub = pts.slice(i0, i0 + 14); if (sub.length < 2) continue; const keep = pts; pts = sub;
    const pm = new THREE.MeshBasicMaterial({ map: C0.padTex, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }); strip(lat - 2.4, lat + 2.4, 0.05, 0.05, pm, 1 / 12); pts = keep }
  SW.track(o.name || 'portal roads', grp); return grp };
// a path a racer can fly: points every metre with the heading and up; at(s) interpolates
function pathOf(pts, extra = {}) { const cum = [0]; for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + pts[i].p.distanceTo(pts[i - 1].p));
  return Object.assign({ pts, len: cum[cum.length - 1], at(s) { let lo = 0, hi = cum.length - 1; s = clamp(s, 0, cum[hi]); while (hi - lo > 1) { const m = (lo + hi) >> 1; if (cum[m] <= s) lo = m; else hi = m }
    const f = (s - cum[lo]) / Math.max(1e-6, cum[hi] - cum[lo]), a = pts[lo], b = pts[hi];
    return { p: a.p.clone().lerp(b.p, f), t: b.p.clone().sub(a.p).normalize(), up: a.u.clone().lerp(b.u, f).normalize(), air: a.air, hide: a.hide } } }, extra) }
SW.pathOf = pathOf;

// ---------------------------------------------------------------- 4. portals
function portalRing(pos, normal, R, o = {}) {
  const g = new THREE.Group(); const ring = new THREE.Mesh(new THREE.TorusGeometry(R, o.tube || 1.1, 10, 64), new THREE.MeshBasicMaterial({ color: SW.palCol(o.hue || 40).multiplyScalar(1.4) }));
  const ring2 = new THREE.Mesh(new THREE.TorusGeometry(R + 2.2, 0.35, 6, 64), new THREE.MeshBasicMaterial({ color: SW.palCol((o.hue || 40) + 50) }));
  g.add(ring); g.add(ring2); if (o.disc !== false) { const d = new THREE.Mesh(new THREE.CircleGeometry(R, 48), swirlMat()); g.add(d); g.disc = d }
  // a frame of blocks round the ring (they burst apart and come back: 56)
  const nb = o.blocks ?? 18, bm = SW.h.instanced(BOX, SW.wireMat({ mode: 'QUAD', inst: true, cs: 1.5, con: 0.5 }), nb), home = [];
  for (let i = 0; i < nb; i++) { const a = i / nb * TAU; home.push({ a, out: new V3(Math.cos(a), Math.sin(a), 0), sp: new V3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize() }); bm.aI.setXYZW(i, i * 6, -1, 1.2, 1) }
  g.add(bm); g.position.copy(pos); g.lookAt(pos.clone().add(normal)); g.blocks = { bm, home, R };
  g.updBlocks = (burst, t) => { home.forEach((h, i) => { const k = burst; _p.copy(h.out).multiplyScalar(R + 4 + k * (30 + (i % 5) * 12)); _p.z += k * ((i % 3) - 1) * 14;
    _q.setFromAxisAngle(new V3(0, 0, 1), h.a).multiply(new Q4().setFromAxisAngle(h.sp, k * 6 + t * 0.4 * k)); _s.set(3, 4.2, 2.4); setI(bm, i, _p, _q, _s) }); bm.instanceMatrix.needsUpdate = true };
  g.updBlocks(0, 0); SW.track('portal', g); return g }
SW.portalRing = portalRing;
// a flash over the picture as the camera's racer crosses (0.15 s), on a plane fixed to the camera
let flashQ = null; function flash(col) { const cam = C().camera; if (!flashQ) { flashQ = new THREE.Mesh(new THREE.PlaneGeometry(4, 4), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, depthTest: false, depthWrite: false, blending: THREE.AdditiveBlending }));
  flashQ.position.z = -0.5; flashQ.renderOrder = 999; cam.add(flashQ); if (!cam.parent) C().scene.add(cam) } flashQ.material.color.copy(col || new Col(1, 1, 1)); flashQ.material.opacity = 1; SW.flashT = 0 }
SW.anim.flash = true;
function flashStep(dt) { if (!flashQ) return; SW.flashT = (SW.flashT || 0) + dt; flashQ.material.opacity = Math.max(0, 1 - SW.flashT / 0.18) * 0.6; flashQ.visible = flashQ.material.opacity > 0.01 }
// clip the main road beyond the entrance (the road ends in the portal)
function clipRoad(E) { const n = E.t.clone().setY(0).normalize().negate(), pl = new THREE.Plane(n, -n.dot(E.p) - 0.5); C().renderer.localClippingEnabled = true;
  for (const o of SW.roadObjs) o.traverse((q) => { if (q.material) (Array.isArray(q.material) ? q.material : [q.material]).forEach((m) => { m.clippingPlanes = [pl]; m.needsUpdate = true }) }); return pl }
// The portal jump (49) and its diagonal (50). uE: the entrance on a straight. The exit X sits right of the road, back
// from E and up; its ramp launches the racers over the main road onto a catch road that turns back to run on.
// a: the exit's heading, 0 = facing left (49), 45 = forward-left (50).
SW.portalJump = function (o = {}) {
  const C0 = C(), W = C0.W, E = fr(o.uE), f0 = E.t.clone().setY(0).normalize(), r0 = new V3().crossVectors(f0, WUP).normalize(); // right
  const a = (o.a || 0) * Math.PI / 180, h = r0.clone().multiplyScalar(-Math.cos(a)).addScaledVector(f0, Math.sin(a)).normalize();
  const back = o.back ?? 120, right = o.right ?? 75, up = o.up ?? 18, rampL = 45, rise = 2;
  const X = E.p.clone().addScaledVector(f0, -back).addScaledVector(r0, right).addScaledVector(WUP, up);
  const R = 1.5 * W / 2, ringE = portalRing(E.p.clone().addScaledVector(WUP, R * 0.55), f0.clone().negate(), R, { hue: 20 }), ringX = portalRing(X.clone().addScaledVector(WUP, R * 0.55), h, R, { hue: 80, disc: true });
  ringX.disc.rotation.y = Math.PI; // the exit's swirl faces back into the portal, so from the ramp it is open
  ringX.disc.visible = o.exitDisc ?? true;
  clipRoad(E);
  const rH = new V3().crossVectors(h, WUP).normalize(); // right of the exit heading
  // the ramp and the lip
  const ramp = []; for (let s = 0; s <= rampL; s += 1) ramp.push({ p: X.clone().addScaledVector(h, s).addScaledVector(WUP, rise * (s / rampL) ** 2), r: rH, u: WUP.clone() });
  const lip = ramp[ramp.length - 1].p, slope = 2 * rise / rampL;
  // the catch road: from where the flight has crossed the main road's far wall to 250 m on, easing down to the main road's
  // height, then a turn back to the main road's heading and a straight away
  const d0 = (right - 30 + 30) / Math.cos(a) + 0.0, yEnd = E.p.y + (o.landY ?? 2), catchL = 250;
  const yAt = (d) => lerp(lip.y - 3.5, yEnd, ss((d - d0) / catchL));
  const road = []; for (let d = d0; d <= d0 + catchL; d += 1) road.push({ p: lip.clone().addScaledVector(h, d).setY(yAt(d)), r: rH, u: WUP.clone() });
  // the turn: heading h swings to f0 on a radius
  let P = road[road.length - 1].p.clone(), hd = h.clone(); const turn = Math.acos(clamp(h.dot(f0), -1, 1)), Rt = o.turnR || 110, sgn = Math.sign(new V3().crossVectors(h, f0).y) || 1;
  for (let s = 1; s <= Rt * turn; s += 1) { hd.applyAxisAngle(WUP, sgn / Rt); P = P.clone().addScaledVector(hd, 1); road.push({ p: P, r: new V3().crossVectors(hd, WUP).normalize(), u: WUP.clone() }) }
  for (let s = 1; s <= 500; s += 1) { P = P.clone().addScaledVector(hd, 1); road.push({ p: P, r: new V3().crossVectors(hd, WUP).normalize(), u: WUP.clone() }) }
  SW.ribbon(ramp, { name: 'portal ramp and catch road' }); SW.ribbon(road, { name: 'portal ramp and catch road' });
  // a short stub of road behind the exit, inside the ring (so a racer comes out of something)
  // each racer's path from the entrance: the exit, the ramp, the flight at its speed, then the catch road
  const g = o.g || 24;
  const mk = (v) => { const pts = ramp.map((q) => ({ ...q })); const th = Math.atan(slope), vh = v * Math.cos(th), vy = v * Math.sin(th);
    let landed = -1; for (let tt = 0.02; tt < 6; tt += 0.02) { const d = vh * tt, y = lip.y + vy * tt - g * tt * tt / 2; const p = lip.clone().addScaledVector(h, d).setY(y);
      const yr = d >= d0 ? yAt(Math.min(d, d0 + catchL)) : -1e9; if (y <= yr + 0.6 && d >= d0) { landed = Math.round(d - d0); break } pts.push({ p, r: rH, u: WUP.clone(), air: true }) }
    if (landed < 0) landed = 0; for (let i = landed; i < road.length; i++) pts.push({ p: road[i].p.clone().addScaledVector(WUP, 0.9), r: road[i].r, u: road[i].u });
    return pathOf(pts, { u0: o.uE, rot: new Q4().setFromUnitVectors(f0, h) }) };
  SW.jump = { E, X, h, f0, r0, ringE, ringX, mk, lip, road };
  // burst the rings' blocks apart after the last racer and back before the next (56), crossing flashes for the camera's racer
  let lastIn = false;
  SW.anim.push((t, dt) => { ringE.disc.material.uniforms.uSpin.value = 5; const P = SW.P; if (!P) return; const cr = P[SW.camI].r; const inP = cr.path && cr.u >= cr.path.u0;
    if (inP && !lastIn) flash(SW.palCol(40).lerp(new Col(1, 1, 1), 0.6)); lastIn = inP; flashStep(dt);
    if (o.breaking) { const near = Math.min(...P.map((q) => Math.abs(q.r.u - o.uE))); const k = ss((near - 260) / 200); ringE.updBlocks(k, t); ringX.updBlocks(k, t) } });
  return SW.jump };
// give every racer in the pack its path through the portal
SW.jumpAll = function () { for (const P of SW.P) P.r.path = SW.jump.mk(P.r.v) };

// ---------------------------------------------------------------- 5. the hyperspace tunnel with boost pads (11, 59)
SW.tunnel = function (o = {}) {
  const u0 = o.u0, u1 = o.u1, step = o.step || 7, n = Math.floor((u1 - u0) / step), R = o.R || C().W * 0.62 + 6, sides = o.sides || 6;
  const ringG = new THREE.RingGeometry(R, R + (o.th || 1.1), sides, 1); ringG.rotateZ(Math.PI / sides);
  const RING_V = `attribute vec4 aI; varying vec4 vI; varying vec3 vW; void main(){ vI=aI; vec4 w=modelMatrix*instanceMatrix*vec4(position,1.); vW=w.xyz; gl_Position=projectionMatrix*viewMatrix*w; }`;
  const RING_F = SW.GL_COMMON + `varying vec4 vI; varying vec3 vW; void main(){ vec3 c=pal(vI.x*1.+uT*90.); gl_FragColor=vec4(c*vI.z*fogK(vW)*(1.+uPulse),1.); }`;
  const mat = new THREE.ShaderMaterial({ vertexShader: RING_V, fragmentShader: RING_F, uniforms: Object.assign({}, U), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide });
  const m = SW.h.instanced(ringG, Object.assign(mat, { defines: { INST_ATTR: 1 } }), n); const fs = [];
  for (let i = 0; i < n; i++) { const u = u0 + i * step, f = fr(u); fs.push({ u, f }); _m.makeBasis(f.r, f.u, f.t); _q.setFromRotationMatrix(_m); _p.copy(f.p).addScaledVector(f.u, o.lift ?? 3); _s.set(1, 1, 1); setI(m, i, _p, _q, _s);
    m.aI.setXYZW(i, u * 1.6, -1, 1, 1) }
  m.instanceMatrix.needsUpdate = true; SW.track('tunnel rings', m);
  // streaks along the walls: lines at the ring's corners with dashes running forward
  const pos = [], aa = []; for (let k = 0; k < sides * 2; k++) { const th = (k / (sides * 2)) * TAU + Math.PI / sides; for (let i = 0; i < n - 1; i++) { const a = fs[i], b = fs[i + 1];
    for (const q of [a, b]) { const v = q.f.p.clone().addScaledVector(q.f.u, (o.lift ?? 3) + Math.sin(th) * (R + 0.5)).addScaledVector(q.f.r, Math.cos(th) * (R + 0.5)); pos.push(v.x, v.y, v.z); aa.push(q.u) } } }
  const lg = new THREE.BufferGeometry(); lg.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); lg.setAttribute('aU', new THREE.Float32BufferAttribute(aa, 1));
  const LV = `attribute float aU; varying float vU; varying vec3 vW; void main(){ vU=aU; vec4 w=modelMatrix*vec4(position,1.); vW=w.xyz; gl_Position=projectionMatrix*viewMatrix*w; }`;
  const LF = SW.GL_COMMON + `varying float vU; varying vec3 vW; void main(){ float d=fract(vU/38.-uT*7.); float k=smoothstep(0.,0.15,d)*(1.-smoothstep(0.35,0.6,d)); gl_FragColor=vec4(pal(vU*1.6+uT*90.)*(0.15+1.2*k)*fogK(vW),1.); }`;
  const lm = new THREE.LineSegments(lg, new THREE.ShaderMaterial({ vertexShader: LV, fragmentShader: LF, uniforms: Object.assign({}, U), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })); lm.frustumCulled = false; SW.track('tunnel streaks', lm);
  // boost pads: lots of them, staggered across the lanes, in the game's pad look
  const W = C().W, padPts = [], padM = new THREE.MeshBasicMaterial({ map: C().padTex, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false });
  const pg = []; const lanes = [-W / 3, 0, W / 3]; let k = 0;
  for (let u = u0 + 20; u < u1 - 20; u += o.padEvery || 22) { const lat = lanes[k++ % 3], len = 12; for (let s = 0; s < len; s += 1) { const f0 = fr(u + s), f1 = fr(u + s + 1);
      const a = (f, x) => f.p.clone().addScaledVector(f.r, lat + x).addScaledVector(f.u, 0.05); const A = a(f0, -2.4), B = a(f0, 2.4), Cc = a(f1, -2.4), D = a(f1, 2.4);
      const v0 = s / len, v1 = (s + 1) / len; pg.push([A, B, Cc, D, v0, v1]) } }
  const ppos = [], puv = []; for (const [A, B, Cc, D, v0, v1] of pg) { for (const [v, uv] of [[A, [0, v0]], [B, [1, v0]], [Cc, [0, v1]], [B, [1, v0]], [D, [1, v1]], [Cc, [0, v1]]]) { ppos.push(v.x, v.y, v.z); puv.push(uv[0], uv[1] * 1.2) } }
  const pgeo = new THREE.BufferGeometry(); pgeo.setAttribute('position', new THREE.Float32BufferAttribute(ppos, 3)); pgeo.setAttribute('uv', new THREE.Float32BufferAttribute(puv, 2));
  const pads = new THREE.Mesh(pgeo, padM); pads.frustumCulled = false; SW.track('tunnel boost pads', pads);
  SW.anim.push((t, dt, b) => { // the rings breathe outwards in a wave that runs forward with the pack
    const P = SW.P, lead = P && P.length ? P[SW.camI].r.u : 0; fs.forEach((q, i) => { const d = q.u - lead, wv = Math.exp(-(((d - 60 - ((t * 240) % 300)) / 30) ** 2));
      m.aI.setZ(i, (0.55 + 1.1 * wv) * (d < -30 ? 0.5 : 1)); }); m.aI.needsUpdate = true });
  return { m, lm, pads } };

// ---------------------------------------------------------------- 6. ghost riders: a pack of neon riders fading in and out beside the real one
SW.ghostRiders = function (o = {}) {
  const C0 = C(), out = []; const src = SW.P.map((q) => q.r.ship);
  (o.list || []).forEach((g, k) => { const mat = ghostMat(g.col || SW.palCol(k * 40 + 20).getHex(), 0); const m = ghostOf(src[k % src.length], mat); C0.scene.add(m); H.G.add(m);
    const trail = new THREE.Line(new THREE.BufferGeometry().setAttribute('position', new THREE.BufferAttribute(new Float32Array(60 * 3), 3)), new THREE.LineBasicMaterial({ color: mat.uniforms.uC.value, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false }));
    trail.frustumCulled = false; H.G.add(trail); out.push({ g, m, mat, trail, hist: [] }) });
  SW.anim.push((t, dt) => { const P = SW.P; if (!P) return; const base = P[SW.camI].r.u;
    out.forEach((q, k) => { const g = q.g; const fade = ss((t - g.t0) / (g.fin || 1.0)) * (1 - ss((t - g.t1) / (g.fout || 1.0)));
      const u = base + g.du + (g.dv || 0) * (t - g.t0), f = fr(u), lat = g.lat + Math.sin(t * 1.3 + k) * 1.5, up = g.up + Math.sin(t * 2 + k) * 0.5;
      q.m.position.copy(f.p).addScaledVector(f.r, lat).addScaledVector(f.u, up); _m.makeBasis(f.r, f.u, f.t.clone().negate()); q.m.quaternion.setFromRotationMatrix(_m);
      q.m.rotateZ(-Math.cos(t * 1.3 + k) * 0.25); const flick = 0.75 + 0.25 * Math.sin(t * 23 + k * 7) * Math.sin(t * 7.3 + k); q.mat.uniforms.uA.value = fade * flick * (g.a || 1); q.m.visible = fade > 0.01;
      q.hist.unshift(q.m.position.clone()); if (q.hist.length > 60) q.hist.pop(); const A = q.trail.geometry.attributes.position.array; for (let i = 0; i < 60; i++) { const v = q.hist[Math.min(i, q.hist.length - 1)]; A[i * 3] = v.x; A[i * 3 + 1] = v.y; A[i * 3 + 2] = v.z }
      q.trail.geometry.attributes.position.needsUpdate = true; q.trail.material.opacity = 0.7 * fade }) });
  return out };

// ---------------------------------------------------------------- 7. echoes of the leaders (57): where the racers ahead were, 0.2 to 1.4 s ago
SW.echoes = function (o = {}) {
  const C0 = C(), K = o.k || 6, every = o.every || 3, out = [];
  SW.P.forEach((P, i) => { if (i === SW.camI) return; const col = o.col ? o.col(i) : SW.palCol(i * 45 + 15).getHex(); const list = [];
    for (let j = 1; j <= K; j++) { const mat = ghostMat(col, (1 - j / (K + 1)) * (o.a || 0.9)); const m = ghostOf(P.r.ship, mat); H.G.add(m); list.push({ m, mat, j }) } out.push({ P, list }) });
  SW.anim.push(() => { out.forEach(({ P, list }) => list.forEach(({ m, j }) => { const h = P.hist[j * every]; if (!h) { m.visible = false; return } m.visible = h.vis; m.position.copy(h.p); m.quaternion.copy(h.q) })) });
  return out };

// ---------------------------------------------------------------- light trails behind racers in the air (so a jump reads from far off)
SW.airTrails = function (o = {}) {
  const N = o.n || 26, out = SW.P.filter((P, i) => o.all || i !== SW.camI).map((P, i) => { const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(N * 6), 3)); const idx = [];
    for (let k = 0; k < N - 1; k++) { const a = k * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2) } g.setIndex(idx); g.setAttribute('aF', new THREE.BufferAttribute(new Float32Array(N * 2).map((_, j) => 1 - Math.floor(j / 2) / (N - 1)), 1));
    const m = new THREE.Mesh(g, new THREE.ShaderMaterial({ vertexShader: `attribute float aF; varying float vF; void main(){ vF=aF; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
      fragmentShader: `uniform vec3 uC; uniform float uA; varying float vF; void main(){ gl_FragColor=vec4(uC*vF*vF*uA,1.); }`, uniforms: { uC: { value: SW.palCol(i * 45 + 20).multiplyScalar(1.3) }, uA: { value: 0 } },
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide })); m.frustumCulled = false; H.G.add(m); return { P, m } });
  SW.anim.push(() => { const cam = C().camera.position; out.forEach(({ P, m }) => { const r = P.r, on = r.path && r.u >= r.path.u0 && r.u - r.path.u0 < (o.len || 420); const A = m.geometry.attributes.position.array;
    m.material.uniforms.uA.value = on ? 1 : Math.max(0, m.material.uniforms.uA.value - 0.1); if (!on && m.material.uniforms.uA.value <= 0) { m.visible = false; return } m.visible = true;
    let last = 0; while (last + 1 < Math.min(N, P.hist.length) && P.hist[last + 1].inP) last++;
    for (let k = 0; k < N; k++) { const h = P.hist[Math.min(k, last)], h2 = P.hist[Math.min(k + 1, last)]; if (!h) continue; const d = h2.p.clone().sub(h.p), tc = cam.clone().sub(h.p);
      const sd = new V3().crossVectors(d, tc).normalize().multiplyScalar((o.w || 1.2) * (1 - k / N)); if (!isFinite(sd.x)) sd.set(0, 0, 0);
      A.set([h.p.x + sd.x, h.p.y + sd.y, h.p.z + sd.z, h.p.x - sd.x, h.p.y - sd.y, h.p.z - sd.z], k * 6) } m.geometry.attributes.position.needsUpdate = true }) });
  return out };

// ---------------------------------------------------------------- 8. the music clock (58): bars, beats, sections and the kick
// o: {bpm, bars: [[startBar, 'drop'], ...], offset}, or o.tl: [{t, sec}] bar starts from a rendered tune, o.env: a kick envelope per frame
SW.clock = function (o) {
  const spb = 60 / o.bpm, bar = spb * 4;
  SW.beat = { o, at(t) { const tt = t + (o.offset || 0); let barN, barF, sec;
    if (o.tl) { let i = 0; while (i + 1 < o.tl.length && o.tl[i + 1].t <= tt) i++; const b0 = o.tl[i], b1 = o.tl[i + 1] || { t: b0.t + bar }; barN = i; barF = clamp((tt - b0.t) / (b1.t - b0.t), 0, 0.9999); sec = b0.sec }
    else { barN = Math.floor(tt / bar); barF = (tt / bar) % 1; sec = 'drop'; for (const [b0, s] of o.bars) if (barN >= b0) sec = s }
    const beatF = (barF * 4) % 1, beatN = barN * 4 + Math.floor(barF * 4), on = !/break|intro/.test(sec);
    let kick = on ? Math.exp(-beatF * spb * 9) : 0; if (o.env) kick = o.env[Math.min(o.env.length - 1, Math.round(t * (o.envFps || 15)))] || 0;
    return { barN, barF, beatN, beatF, sec, kick, bpm: o.bpm } } };
  return SW.beat };
})();
