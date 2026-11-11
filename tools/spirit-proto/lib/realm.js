/* Spirit realm prototype, round 2, part 1 (SPR): the bridge that puts the neon objects (SPFX) into the world harness
   (SW) under one clock, the beat (a simulated clock or the game's own tune), and the round-2 pieces:
   - SPR.lattice      the lattice as the backbone, much stronger, in sections that fade in, strengthen and fade out along
                      the lap; tiers of struts appear as a section strengthens; driven by the music (pulses along the
                      struts on the kick, a flare on the drop, dim in the breakdown, drawn in tight in the build)
   - SPR.colossus     larger, sunk to the waist in the void's floor (a plane of light), the head following the leader
   - SPR.shoalForm    shoals as a material: any shape's lines become a flock of small solids that hold the shape,
                      loosen on the beat and re-form (one draw; the motion is in the vertex shader)
   - SPR.gyroGate     a gyroscope the road passes through: its rings turn only about the road, clear of the keep-out
   - SPR.roomLattice  the lattice hall rebuilt to follow the road's frames round bends, cut where it would hide the road
   Every placement goes through clear.js (SPC). Not game code. */
(function () {
'use strict';
const SPR = window.SPR = {}, SPFX = window.SPFX, SW = window.SW, V3 = THREE.Vector3, TAU = Math.PI * 2;
const clamp = (x, a, b) => Math.max(a, Math.min(b, x)), lerp = (a, b, t) => a + (b - a) * t, ss = (x) => { x = clamp(x, 0, 1); return x * x * (3 - 2 * x) };
SPR.h = { clamp, lerp, ss };
const fr = (u) => SW.fr(u);

// ---------------------------------------------------------------- the bridge
SPR.init = function (o = {}) {
  SPR.objs = []; SPR.W = o.w || 640; SPR.H = o.h || 360; SPFX.G.uFog.value.set(o.fog0 || 450, o.fog1 || 3600);
  SPFX.stage = { c: window.__cv, T: window.__cv.T, lead: () => SPR.leadU(), at: (u, lat = 0, h = 0) => { const f = fr(u); return { p: f.p.clone().addScaledVector(f.r, lat).addScaledVector(f.u, h), r: f.r, u: f.u, t: f.t } } };
  SW.beat = { at: (t) => (SPR.clockFn || SPR.simClock)(t) }; SPR.clockFn = null;
  SW.anim.push((t, dt, b) => { SPFX.G.uTime.value = t; SPFX.G.uRes.value.set(SPR.W, SPR.H); SPR.bt = b; for (const x of SPR.objs) if (x.update) x.update(t, b, dt) });
};
SPR.leadU = () => (SW.P && SW.P.length ? Math.max(...SW.P.map((q) => q.r.u)) : 0);
SPR.leadPos = () => { if (!SW.P || !SW.P.length) return new V3(); let b = SW.P[0]; for (const q of SW.P) if (q.r.u > b.r.u) b = q; return b.r.ship.position.clone() };
SPR.add = function (obj, name) { SW.track(name || 'objects', obj.group); SPR.objs.push(obj); return obj };
// a pose in the road's frame at u (+z along the road, +y up, +x to the LEFT, as SPFX objects are built), or level
SPR.pose = function (g, u, lat, h, o = {}) { const f = fr(u); g.position.copy(f.p).addScaledVector(f.r, lat).addScaledVector(f.u, h);
  if (o.level) { const t = f.t.clone(); t.y = 0; t.normalize(); g.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(new V3(0, 1, 0).cross(t).normalize(), new V3(0, 1, 0), t)) }
  else g.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(f.r.clone().negate(), f.u, f.t));
  if (o.yaw) g.rotateY(o.yaw); g.updateMatrixWorld(true); return g };
/* place an SPFX object with rule A: cand(k, rnd) -> {u, lat, h, level, yaw} for try k; checked over its animation */
SPR.put = function (name, obj, cand, o = {}) {
  const r = SW.h.rng(o.seed || name.length * 131 + 7), times = o.dyn === false ? [null] : (o.times || SPC.times(o.nt || 8));
  const ok = SPC.fit(name, obj, (g, k) => { const c = cand(k, r); SPR.pose(g, c.u, c.lat, c.h, c) }, { times, tries: o.tries || 14, step: o.step, pad: o.pad });
  if (ok) SPR.add(obj, o.cost || name); return ok ? obj : null };

// hide the game's supports under the road (Prism's spire pylons): any road mesh that reaches more than 5 m under the road
SPR.hideSupports = function () { const C = window.__cv, v = new V3(); let n = 0;
  for (const g of SW.roadObjs || []) g.traverse((m) => { if (!m.isMesh || !m.geometry || !m.geometry.attributes.position) return; const P = m.geometry.attributes.position; m.updateMatrixWorld(true);
    for (let k = 0; k < 40; k++) { const i = Math.floor(k / 39 * (P.count - 1)); v.fromBufferAttribute(P, i).applyMatrix4(m.matrixWorld); const s = SPC.inKeep ? nearestSample(v) : null; if (s && v.clone().sub(s.p).dot(s.up) < -5) { m.visible = false; n++; break } } });
  return n };
function nearestSample(p) { let b = null, d = 1e18; for (let i = 0; i < SPC.samples.length; i += 3) { const s = SPC.samples[i], dd = s.p.distanceToSquared(p); if (dd < d) { d = dd; b = s } } return b }
// ---------------------------------------------------------------- the beat
/* One beat object for every piece (SPFX's fields and SW's): t, spb, b (beats), step, ph, k (kick, decays), bar, bb,
   bars, dropN, drop (decays over a bar after a drop starts), tDrop, toDrop, build (0..1 through a build), brk (1 in a
   breakdown), breath, sec ('rise' build, 'drop', 'b', 'brk' breakdown), bi/bl (bar in section / its length), barN, barF,
   beatN, beatF, kick, kA (ages of the last four kicks, seconds), s16 (sixteenth step).
   o: {bpm, secs: [[bar, name, len], ...]} simulated, or {tl: {bars: [{t, sec: [name, bi, bl]}], kicks: [t], bd}} from
   the game's own tune, with o.offset (the tune's time at clip time 0). */
SPR.clock = function (o) {
  const tl = o.tl, bd = tl ? tl.bd : 240 / o.bpm, spb = bd / 4, off = o.offset || 0;
  const secAt = (barN) => { if (tl) { const B = tl.bars; const i = clamp(barN, 0, B.length - 1); return B[i].sec }
    let cur = ['drop', 0, 8]; for (const [b0, n, len] of o.secs) if (barN >= b0) cur = [n, barN - b0, len]; return cur };
  const barT = (barN) => tl ? (barN < tl.bars.length ? tl.bars[barN].t : tl.bars[tl.bars.length - 1].t + (barN - tl.bars.length + 1) * bd) : barN * bd;
  return (t0) => { const t = t0 + off;
    let barN; if (tl) { const B = tl.bars; barN = 0; while (barN + 1 < B.length && B[barN + 1].t <= t) barN++; if (t > B[B.length - 1].t + bd) barN = B.length - 1 + Math.floor((t - B[B.length - 1].t) / bd) } else barN = Math.floor(t / bd);
    const barF = clamp((t - barT(barN)) / bd, 0, 0.99999), [sec, bi, bl] = secAt(barN);
    const b = barN * 4 + barF * 4, step = Math.floor(b), ph = b - step;
    // kicks: the tune's own kick times, or one on every beat outside a breakdown
    const kA = [9, 9, 9, 9]; let k;
    if (tl) { const K = tl.kicks; let j = K.length - 1; while (j >= 0 && K[j] > t) j--; for (let q = 0; q < 4 && j - q >= 0; q++) kA[q] = t - K[j - q]; k = Math.exp(-kA[0] / spb * 5.5) }
    else { const on = sec !== 'brk'; for (let q = 0; q < 4; q++) kA[q] = on ? (ph + q) * spb : 9; k = on ? Math.exp(-ph * 5.5) : 0 }
    // the last drop's start
    let dropStart = null, dropN = 0; for (let q = barN; q >= 0; q--) { const s = secAt(q); if (s[0] === 'drop' && s[1] === 0) { dropStart = barT(q); break } }
    for (let q = 0; q <= barN; q++) { const s = secAt(q); if (s[0] === 'drop' && s[1] === 0) dropN++ }
    const tDrop = dropStart == null ? 99 : t - dropStart, build = sec === 'rise' ? (bi + barF) / bl : 0, toDrop = sec === 'rise' ? (bl - bi - barF) * bd : 99;
    const brk = sec === 'brk' ? ss(Math.min((bi + barF) / 0.5, (bl - bi - barF) / 0.35)) : 0;
    return { t: t0, tt: t, bpm: 60 / spb, spb, b, step, ph, k, bar: barN, bb: step % 4, bars: barN % 8, dropN, drop: dropStart == null ? 0 : Math.exp(-tDrop / (spb * 4)), tDrop, toDrop, build, brk,
      breath: Math.sin(2 * Math.PI * b / 8), sec, bi, bl, barN, barF, beatN: step, beatF: ph, kick: k, kA, s16: Math.floor(barF * 16) } };
};
SPR.simClock = SPR.clock({ bpm: 140, secs: [[0, 'drop', 8]] });
SPR.useClock = (o) => { SPR.clockFn = o ? SPR.clock(o) : null };

// ---------------------------------------------------------------- nearest road point (for the lattice and room)
// brute force over road samples in a range of u, every 6 m (fast enough: a few hundred points)
function roadPts(u0, u1, step = 6) { const out = []; for (let u = u0; u <= u1; u += step) { const f = fr(u); out.push({ u, p: f.p, up: f.u }) } return out }
function nearest(R, p) { let b = null, d = 1e18; for (const q of R) { const dd = q.p.distanceToSquared(p); if (dd < d) { d = dd; b = q } } return { q: b, d: Math.sqrt(d) } }

// ---------------------------------------------------------------- D: the lattice, much stronger, in sections
const LAT_SH = {
  vhead: `attribute float aU;attribute vec2 aDD;attribute float aT;attribute vec3 aAnA;attribute vec3 aAnB;
    uniform vec4 uSec[6];uniform float uL,uTime,uTight,uBase,uSwellT;varying float vD;varying float vSt;
    float secS(float u){float s=uBase;for(int i=0;i<6;i++){vec4 q=uSec[i];if(q.w<=0.)continue;float d=abs(u-q.x);d=min(d,uL-d);s=max(s,q.w*(1.-smoothstep(q.y,q.y+q.z,d)));}return s;}
    vec4 toView2(vec3 p,float e){vec3 an=e<0.5?aAnA:aAnB;return modelViewMatrix*vec4(mix(p,an,uTight),1.);}`,
  vpre: `float S=secS(aU)*(1.-uSwellT*0.3*(0.5-0.5*sin(uTime*0.55+aU*0.0031)));float th=aT*0.22;float vis=smoothstep(th+0.02,th+0.15,S);
    if(vis<0.004){gl_Position=vec4(0.,0.,-2.,1.);return;}gW=0.55+0.9*S;gK=vis*(0.1+0.75*S);vSt=S;`,
  vpost: `vD=endp<0.5?aDD.x:aDD.y;`,
  fhead: `uniform float uKA[4];uniform float uPV,uPK;varying float vD;varying float vSt;`,
  custom: true,
  fpost: `float pu=0.;for(int i=0;i<4;i++){float a=uKA[i];float x=(vD-uPV*a)/16.;pu+=exp(-x*x)*exp(-a*1.4);}col*=1.+uPK*pu*2.6;col+=vec3(0.5,0.45,0.6)*uPK*pu*0.25*vSt*a;`,
};
/* o: u0, u1 (the stretch), sp (grid step, m), ext (how far from the road it reaches), clear (nearest it comes), y0/y1
   (below/above the road), sections [{u, half, fade, peak}] in lap metres, pal, tightMax, chunk (m of road per draw) */
SPR.lattice = function (o = {}) {
  const sp = o.sp || 30, ext = o.ext || 240, clear = o.clear || 34, y0 = o.y0 ?? -150, y1 = o.y1 ?? 300, tight = o.tightMax ?? 0.26, chunk = o.chunk || 320;
  const R = roadPts(o.u0 - 120, o.u1 + 120, 6), mn = new V3(1e9, 1e9, 1e9), mx = new V3(-1e9, -1e9, -1e9);
  for (const q of R) { mn.min(q.p); mx.max(q.p) } mn.x -= ext; mn.z -= ext; mx.x += ext; mx.z += ext; mn.y += y0; mx.y += y1;
  const I0 = Math.floor(mn.x / sp), I1 = Math.ceil(mx.x / sp), J0 = Math.floor(mn.y / sp), J1 = Math.ceil(mx.y / sp), K0 = Math.floor(mn.z / sp), K1 = Math.ceil(mx.z / sp);
  const node = new Map(), key = (i, j, k) => (i - I0) * 1e6 + (j - J0) * 1e3 + (k - K0);
  const anchor = (q) => q.p.clone().addScaledVector(q.up, 6);
  const okP = (p, an) => SPC.ok(p, 1.2, null) && SPC.ok(p.clone().lerp(an, tight), 1.2, null);
  let nn = 0;
  for (let i = I0; i <= I1; i++) for (let j = J0; j <= J1; j++) for (let k = K0; k <= K1; k++) {
    const p = new V3(i * sp, j * sp, k * sp), nr = nearest(R, p); if (nr.d < clear || nr.d > ext) continue;
    const an = anchor(nr.q); if (!okP(p, an)) { SPC.note('lattice nodes cut (rule A)'); continue } node.set(key(i, j, k), { p, d: nr.d, u: nr.q.u, an }); nn++ }
  const chunks = new Map(), lm = [];
  const Lof = (u) => { const c = Math.floor(u / chunk); let L = chunks.get(c); if (!L) { L = { L: SPFX.Lines(), ex: { aU: [], aDD: [], aT: [], aAnA: [], aAnB: [] } }; chunks.set(c, L) } return L };
  const H = mx.y - mn.y; let ns = 0, cut = 0;
  const seg = (a, b, tier, pk) => { const mid = a.p.clone().lerp(b.p, 0.5), amid = a.an.clone().lerp(b.an, 0.5); if (!okP(mid, amid)) { cut++; return }
    const u = (a.u + b.u) / 2, C = Lof(u), pc = 0.08 + (mid.y - mn.y) / H * 0.75 + (u % 900) / 900 * 0.15;
    C.L.seg(a.p, b.p, pc, pk); for (let q = 0; q < 4; q++) { C.ex.aU.push(u); C.ex.aDD.push(a.d, b.d); C.ex.aT.push(tier); C.ex.aAnA.push(a.an.x, a.an.y, a.an.z); C.ex.aAnB.push(b.an.x, b.an.y, b.an.z) } ns++ };
  const rnd = SW.h.rng(o.seed || 61);
  for (const [kk, a] of node) { const i = Math.floor(kk / 1e6) + I0, j = Math.floor(kk / 1e3) % 1e3 + J0, k = kk % 1e3 + K0;
    const major = (x, y) => ((x % 3) + 3) % 3 === 0 && ((y % 3) + 3) % 3 === 0;
    for (const [di, dj, dk] of [[1, 0, 0], [0, 1, 0], [0, 0, 1]]) { const b = node.get(key(i + di, j + dj, k + dk)); if (!b) continue;
      const beam = di ? major(j, k) : dj ? major(i, k) : major(i, j), dd = Math.max(a.d, b.d);
      if (beam) seg(a, b, 0, 1.15); else if (dd < (o.minorReach || 170) || rnd() < 0.3) seg(a, b, 1, 0.62) }
    if (((i + j + k) & 1) === 0 && a.d < (o.diagReach || 130) && rnd() < 0.7) { const cc = new V3((i + 0.5) * sp, (j + 0.5) * sp, (k + 0.5) * sp), nr = nearest(R, cc);
      if (nr.d >= clear) { const c = { p: cc, d: nr.d, u: nr.q.u, an: anchor(nr.q) }; for (const d of [[0, 0, 0], [1, 1, 0], [1, 0, 1], [0, 1, 1]]) { const q = node.get(key(i + d[0], j + d[1], k + d[2])); if (q) seg(c, q, 2, 0.5) } } } }
  if (cut) SPC.note('lattice struts cut (rule A)', cut);
  // one material for all chunks (its uniforms are the lattice's controls)
  const sec = (o.sections || []).slice(0, 6).map((s) => new THREE.Vector4(s.u, s.half, s.fade, s.peak)); while (sec.length < 6) sec.push(new THREE.Vector4(0, 0, 1, 0));
  const U = { uSec: { value: sec }, uL: { value: SW.h.C.T.L }, uTime: { value: 0 }, uTight: { value: 0 }, uBase: { value: o.base || 0 }, uSwellT: { value: o.swellT ?? 1 }, uKA: { value: [9, 9, 9, 9] }, uPV: { value: o.pv || 260 }, uPK: { value: 0 } };
  const mat = SPFX.lineMat({ pal: SPFX.newPal(o.pal || 'cyanMagenta'), width: o.width || 0.34, minPx: 1.2, maxPx: 6, gain: 1, fog: o.fog || [180, 1500], shader: LAT_SH, uniforms: U });
  mat.extensions = mat.extensions || {};
  const grp = new THREE.Group();
  for (const [, C] of chunks) { const g = C.L.geometry(); for (const [k, n] of [['aU', 1], ['aDD', 2], ['aT', 1], ['aAnA', 3], ['aAnB', 3]]) g.setAttribute(k, new THREE.Float32BufferAttribute(C.ex[k], n));
    g.computeBoundingSphere(); g.boundingSphere.radius += 40; const m = new THREE.Mesh(g, mat); m.frustumCulled = true; m.renderOrder = 2; grp.add(m) }
  const obj = { group: grp, mat, U, nodes: nn, segs: ns, chunks: chunks.size, music: o.music !== false,
    update(t, b) { U.uTime.value = t; if (!b) return;
      if (obj.music) { // the music: pulses on the kick, a flare on the drop, dim in the breakdown, drawn in in the build
        for (let q = 0; q < 4; q++) U.uKA.value[q] = b.kA ? b.kA[q] : 9; U.uPK.value = 1 - 0.7 * b.brk;
        const flare = b.drop * 1.6, tgt = b.sec === 'rise' ? tight * ss(b.build) : 0; obj.tight = obj.tight == null ? tgt : (tgt < obj.tight ? lerp(obj.tight, tgt, 0.35) : tgt); U.uTight.value = obj.tight;
        mat.uniforms.uGain.value = (o.gain || 1) * (1 + flare + 0.35 * b.build) * (1 - 0.75 * b.brk); mat.uniforms.uSwell.value = 1 + 0.25 * b.drop + 0.08 * b.k * (1 - b.brk) }
      else { mat.uniforms.uGain.value = o.gain || 1 } } };
  SPR.add(obj, 'lattice (sections)'); return obj;
};

// ---------------------------------------------------------------- E: colossi sunk to the waist in the void's floor
const CLIP_SH = (floorVar) => ({
  vhead: `uniform float uFloor;varying float vWy;float gWa,gWb;vec4 toView2(vec3 p,float e){vec4 w=modelMatrix*vec4(p,1.);if(e<0.5)gWa=w.y;else gWb=w.y;return viewMatrix*w;}`,
  vpost: `vWy=endp<0.5?gWa:gWb;`,
  fhead: `uniform float uFloor,uGlowH;varying float vWy;`,
  fpost: `if(vWy<uFloor)discard;col*=1.+2.2*exp(-(vWy-uFloor)/uGlowH);`, custom: true });
/* o.size: height from the floor to the top of the head (m); o.floor: the floor's world height; o.target(t): what the
   head follows. Built standing on its waist at y = 0 (the floor); the hips and arms go on under the floor and are cut. */
SPR.colossus = function (o = {}) {
  const H = o.size || 1300, pal = o.palU || SPFX.newPal(o.pal || 'iceViolet'), grp = new THREE.Group(), L = SPFX.Lines(), v = (x, y, z) => new V3(x, y, z);
  const Rw = H * 0.1, Rc = H * 0.15, yS = H * 0.5, rings = 12, sides = 8, ring = [];
  for (let i = 0; i <= rings; i++) { const f = i / rings, y = -H * 0.14 + (yS + H * 0.14) * f, r = Rw + (Rc - Rw) * Math.pow(clamp((y + H * 0.02) / (yS * 0.8), 0, 1), 1.3) * (1 - 0.18 * Math.sin(Math.PI * f)); ring.push(SPFX.circle(r, sides, y, i * 0.2)) }
  for (let i = 0; i <= rings; i++) { L.poly(ring[i], true, 0.1 + i / rings * 0.5, i % 3 ? 0.6 : 1.15);
    if (i < rings) for (let j = 0; j < sides; j++) { L.seg(ring[i][j], ring[i + 1][j], 0.1 + i / rings * 0.5, 0.95); L.seg(ring[i][j], ring[i + 1][(j + 1) % sides], 0.3 + i / rings * 0.5, 0.45) } }
  for (let i = 0; i < 8; i++) { const y = -H * 0.05 + (i + 0.5) * yS / 8; L.edges(new THREE.OctahedronGeometry(Rw * 0.5), 0.85, 0.85, null, new THREE.Matrix4().makeTranslation(0, y, 0)) }
  const sh = [-1, 1].map((s) => v(s * Rc * 1.75, yS, 0)); L.seg(sh[0], sh[1], 0.6, 1.25); L.seg(sh[0], v(0, yS + H * 0.04, 0), 0.6, 1); L.seg(sh[1], v(0, yS + H * 0.04, 0), 0.6, 1);
  for (const s of [-1, 1]) { const a = sh[(s + 1) / 2], b = v(s * Rc * 2.5, yS - H * 0.26, H * 0.06), c = v(s * Rc * 2.2, -H * 0.12, H * 0.14);
    for (const [p, q] of [[a, b], [b, c]]) { const n = 7, w = Rw * 0.32; for (let i = 0; i < n; i++) { const pa = p.clone().lerp(q, i / n), pb = p.clone().lerp(q, (i + 1) / n);
      for (const off of [[w, 0, 0], [-w, 0, 0], [0, 0, w], [0, 0, -w]]) L.seg(pa.clone().add(v(...off)), pb.clone().add(v(...off)), 0.5, 0.75);
      L.seg(pa.clone().add(v(w, 0, 0)), pb.clone().add(v(-w, 0, 0)), 0.55, 0.4); L.seg(pa.clone().add(v(0, 0, w)), pb.clone().add(v(0, 0, -w)), 0.55, 0.4) } }
    L.edges(new THREE.IcosahedronGeometry(Rw * 0.45), 0.9, 1, null, new THREE.Matrix4().makeTranslation(b.x, b.y, b.z)) }
  const fog = o.fog || [1800, 8000];
  const bodyM = SPFX.lineMat({ pal, width: H * 0.0013, minPx: 1.8, maxPx: 5.5, fog, shader: CLIP_SH(), uniforms: { uFloor: { value: 0 }, uGlowH: { value: H * 0.012 } } });
  const body = L.mesh(bodyM); grp.add(body);
  // the head: rings, rays, an eye, a turning hexagram; on a neck
  const head = new THREE.Group(); head.position.y = yS + H * 0.2; grp.add(head); const hl = SPFX.Lines(), hr = H * 0.13;
  hl.seg([0, -hr * 1.0, 0], [0, -H * 0.2 + H * 0.02, 0], 0.6, 1);
  for (let i = 0; i < 4; i++) hl.poly(SPFX.circleXY(hr * (0.3 + 0.23 * i), 72), true, 0.6 + i * 0.1, i === 3 ? 1.35 : 0.9);
  for (let i = 0; i < 36; i++) { const a = i / 36 * TAU, r2 = hr * (i % 2 ? 1.28 : 1.5); hl.seg([Math.cos(a) * hr * 1.05, Math.sin(a) * hr * 1.05, 0], [Math.cos(a) * r2, Math.sin(a) * r2, 0], 0.95, 0.85) }
  const hm = hl.mesh(SPFX.lineMat({ pal, width: H * 0.0017, minPx: 1.8, maxPx: 6, fog })); head.add(hm);
  const eye = SPFX.solid(new THREE.IcosahedronGeometry(hr * 0.18), { pal, width: H * 0.002, ca: 0.8, cs: hr * 0.04, pc0: 0.9, pcSpan: 0.1, fog }); head.add(eye);
  const inner = new THREE.Group(); head.add(inner); const il = SPFX.Lines(); il.poly(SPFX.circleXY(hr * 0.5, 6), true, 0.8, 0.85); il.poly(SPFX.circleXY(hr * 0.5, 6, Math.PI / 6), true, 0.8, 0.85); inner.add(il.mesh(SPFX.lineMat({ pal, width: H * 0.0012, maxPx: 4, fog })));
  // the floor round it: ripples spreading from the waist, and a fading grid of light
  const fl = SPFX.Lines(); for (let i = 0; i < 6; i++) fl.poly(SPFX.circle(Rw * (1.25 + i * 0.55), 96, 0.5), true, 0.2 + i * 0.1, 1.2 - i * 0.16);
  const rip = new THREE.Group(); const ripM = SPFX.lineMat({ pal, width: H * 0.0012, minPx: 1.5, maxPx: 4, fog }); rip.add(fl.mesh(ripM)); grp.add(rip);
  const gl = SPFX.Lines(), G = H * 1.3, gs = H / 12; for (let x = -G; x <= G + 1; x += gs) for (let z = -G; z < G; z += gs) { const fa = 1 - Math.hypot(x, z) / G, fb = 1 - Math.hypot(x + gs, z) / G, fc = 1 - Math.hypot(x, z + gs) / G;
    if (fa > 0 && fb > 0) gl.seg([x, 0.5, z], [x + gs, 0.5, z], 0.15, 0.55 * Math.min(fa, fb)); if (fa > 0 && fc > 0) gl.seg([x, 0.5, z], [x, 0.5, z + gs], 0.15, 0.55 * Math.min(fa, fc)) }
  const gm = gl.mesh(SPFX.lineMat({ pal, width: H * 0.0008, minPx: 1.1, maxPx: 2.5, fog, gain: 0.7 })); grp.add(gm);
  const tgt = new V3(), m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), pw = new V3(), pq = new THREE.Quaternion();
  return { group: grp, head, H, update(t, bt) { bt = bt || SPC.fakeBeat(t);
      bodyM.uniforms.uFloor.value = grp.position.y + 0.5; grp.updateMatrixWorld(true);
      if (o.target) { tgt.copy(o.target(t)); head.getWorldPosition(pw); m4.lookAt(tgt, pw, new V3(0, 1, 0)); q.setFromRotationMatrix(m4); grp.getWorldQuaternion(pq); q.premultiply(pq.invert()); head.quaternion.slerp(q, o.turnK || 0.08) }
      inner.rotation.z = t * 0.3; eye.rotation.y = t * 0.5; hm.material.uniforms.uGain.value = 1 + 0.6 * bt.k + bt.drop; bodyM.uniforms.uGain.value = 0.85 + 0.3 * bt.k + 0.5 * bt.drop;
      const sp = (t * 0.08) % 1; rip.scale.setScalar(1 + sp * 0.55 + 0.04 * bt.k); ripM.uniforms.uGain.value = (1 - sp) * (0.8 + 0.6 * bt.k) + 0.2 } };
};

// place a colossus (or anything huge on the floor) d metres along from u, lat metres to the side, checked with rule A
SPR.placeFloor = function (name, obj, u, lat, floor) { const f = fr(u), t = f.t.clone().setY(0).normalize(), r = new V3(0, 1, 0).cross(t).negate();
  const ok = SPC.fit(name, obj, (g, kk) => { const a = kk * 0.35 * (kk % 2 ? 1 : -1), dir = r.clone().applyAxisAngle(new V3(0, 1, 0), a); g.position.copy(f.p).addScaledVector(dir, lat * (1 + kk * 0.1)); g.position.y = floor; g.lookAt(f.p.x, floor, f.p.z) }, { tries: 8, step: 12, times: [null] });
  if (ok) SPR.add(obj, name); return ok };
// ---------------------------------------------------------------- C: shoals as a material
const SHOAL_SH = {
  vhead: `attribute vec3 iA;attribute vec3 iB;attribute vec4 iR;uniform float uTime,uLoose,uSlide,uAmp,uFish,uSwirl;uniform vec3 uCen;
    vec3 rotA2(vec3 v,vec3 k,float a){float c=cos(a),s=sin(a);return v*c+cross(k,v)*s+k*dot(k,v)*(1.-c);}
    vec4 toView2(vec3 p,float e){float sl=fract(iR.w*7.3+uTime*uSlide*(0.4+iR.w));float f=abs(sl*2.-1.);vec3 home=mix(iA,iB,f);
      vec3 dir=normalize(iR.xyz*2.-1.+1e-4);vec3 rad=home-uCen;rad.y*=0.3;vec3 out1=normalize(rad+1e-4);
      float L=uLoose*(0.45+0.9*iR.w);vec3 sw=cross(vec3(0.,1.,0.),rad)*uSwirl*L*0.01;
      vec3 c=home+(dir*0.6+out1*0.8)*uAmp*L+sw;
      vec3 ax=normalize(vec3(iR.y-0.5,0.7,iR.x-0.5));float ang=uTime*(1.2+iR.z*2.5)+iR.x*6.28;
      return modelViewMatrix*vec4(c+rotA2(p*uFish*(0.6+0.8*iR.z),ax,ang),1.);}`,
  vpre: `gK=1.+0.6*uLoose;`, custom: true };
// segments [[a, b], ...] (local) of any neon object's lines
SPR.segsOf = function (group) { const out = []; group.updateMatrixWorld(true); const inv = new THREE.Matrix4().copy(group.matrixWorld).invert();
  group.traverse((m) => { if (!m.isMesh || !m.geometry.attributes.pa) return; const A = m.geometry.attributes, M = new THREE.Matrix4().multiplyMatrices(inv, m.matrixWorld);
    for (let i = 0; i < A.pa.count; i += 4) out.push([new V3(A.pa.getX(i), A.pa.getY(i), A.pa.getZ(i)).applyMatrix4(M), new V3(A.pb.getX(i), A.pb.getY(i), A.pb.getZ(i)).applyMatrix4(M)]) });
  return out };
/* segs: the shape's lines; o.n fish (spread by length), o.fish (size, m), o.amp (how far they loosen, m), o.geo (the
   fish solid), o.mode: 'kick' (a small loosening on every kick), 'bars' (every 2 bars it loosens and re-forms), both */
SPR.shoalForm = function (segs, o = {}) {
  const n = o.n || 900, rnd = SW.h.rng(o.seed || 5), pal = o.palU || SPFX.newPal(o.pal || 'jade');
  const lens = segs.map(([a, b]) => a.distanceTo(b)), tot = lens.reduce((x, y) => x + y, 0), cen = new V3(); segs.forEach(([a, b]) => cen.add(a).add(b)); cen.multiplyScalar(1 / (2 * segs.length));
  const geo = (o.geo || ((r) => new THREE.TetrahedronGeometry(r)))(1), base = SPFX.Lines().edges(geo, 0.5, 1).geometry();
  const iA = new Float32Array(n * 3), iB = new Float32Array(n * 3), iR = new Float32Array(n * 4), pcs = [];
  let acc = 0, si = 0; for (let i = 0; i < n; i++) { const x = (i + rnd()) / n * tot; while (si < segs.length - 1 && acc + lens[si] < x) { acc += lens[si]; si++ }
    const [a, b] = segs[si], f0 = clamp((x - acc) / Math.max(1e-6, lens[si]), 0, 1), span = Math.min(1, (o.slideM || 6) / Math.max(1e-3, lens[si]));
    const pa = a.clone().lerp(b, Math.max(0, f0 - span / 2)), pb = a.clone().lerp(b, Math.min(1, f0 + span / 2));
    iA.set([pa.x, pa.y, pa.z], i * 3); iB.set([pb.x, pb.y, pb.z], i * 3); iR.set([rnd(), rnd(), rnd(), rnd()], i * 4) }
  base.setAttribute('iA', new THREE.InstancedBufferAttribute(iA, 3)); base.setAttribute('iB', new THREE.InstancedBufferAttribute(iB, 3)); base.setAttribute('iR', new THREE.InstancedBufferAttribute(iR, 4));
  const U = { uTime: { value: 0 }, uLoose: { value: 0 }, uSlide: { value: o.slide ?? 0.12 }, uAmp: { value: o.amp || 8 }, uFish: { value: o.fish || 1 }, uSwirl: { value: o.swirl ?? 2 }, uCen: { value: cen } };
  const mat = SPFX.lineMat({ pal, width: (o.fish || 1) * 0.09, minPx: 1.2, maxPx: 3.2, shader: SHOAL_SH, uniforms: U, gain: o.gain || 1.1 });
  const mesh = new THREE.InstancedMesh(base, mat, n); mesh.frustumCulled = false; mesh.renderOrder = 2; const grp = new THREE.Group(); grp.add(mesh);
  const per = (o.bars || 2) * 4;
  // for rule A: the shape's lines, padded by how far the fish loosen
  const spcPoints = () => { grp.updateMatrixWorld(true); const out = [], r = (o.amp || 8) * 1.6 + (o.fish || 1) * 2; for (const [a, b] of segs) { const k = Math.max(1, Math.ceil(a.distanceTo(b) / Math.max(6, r * 0.8))); for (let j = 0; j <= k; j++) out.push({ p: a.clone().lerp(b, j / k).applyMatrix4(grp.matrixWorld), r }) } return out };
  return { group: grp, mat, U, n, spcPoints, update(t, bt) { bt = bt || SPC.fakeBeat(t); U.uTime.value = t;
      // a long loosening every `bars` bars (out over half a bar, hanging, back over a bar), a puff on every kick, all of it on the drop
      const ph = ((bt.b % per) + per) % per, big = ph < 0.6 ? ss(ph / 0.6) : ph < 2 ? 1 : ph < 5.5 ? 1 - ss((ph - 2) / 3.5) : 0;
      const L = Math.max((o.mode === 'kick' ? 0 : big) * (o.big ?? 1), 0.22 * bt.k * (1 - bt.brk), 1.6 * bt.drop);
      U.uLoose.value = L; mat.uniforms.uGain.value = (o.gain || 1.1) * (0.9 + 0.4 * bt.k) * (1 - 0.5 * bt.brk); mat.uniforms.uShift.value = t * 0.03 } };
};
// shapes for the shoal material, as line sets (local; +y up, base at y = 0)
SPR.shape = {
  pyramid(s = 60, n = 6) { const L = SPFX.Lines(); for (let k = 0; k < n; k++) { const w = s * (1 - k / n), h = s / n * 0.8, g = new THREE.BoxGeometry(w, h, w); L.edges(g, k / n, 1, null, new THREE.Matrix4().makeTranslation(0, (k + 0.5) * h, 0)) }
    return SPR.segsOf(new THREE.Group().add(L.mesh(SPFX.lineMat({})))) },
  ring(r = 40, thick = 4) { const L = SPFX.Lines(); for (const dr of [-thick / 2, thick / 2]) for (const dz of [-thick / 2, thick / 2]) L.poly(SPFX.circleXY(r + dr, 64).map((p) => p.setZ(dz)), true, 0.5, 1);
    for (let i = 0; i < 32; i++) { const a = i / 32 * TAU, c = Math.cos(a), s = Math.sin(a); L.seg([c * (r - thick / 2), s * (r - thick / 2), 0], [c * (r + thick / 2), s * (r + thick / 2), 0], 0.5, 1) }
    return SPR.segsOf(new THREE.Group().add(L.mesh(SPFX.lineMat({})))) },
  arch(span = 60, rise = 40, n = 17, blk = 5) { const L = SPFX.Lines(), box = new THREE.BoxGeometry(blk * 1.4, blk, blk * 1.6);
    for (let i = 0; i < n; i++) { const a = Math.PI * (i + 0.5) / n, m = new THREE.Matrix4().makeRotationZ(a - Math.PI / 2).setPosition(-Math.cos(a) * span / 2, Math.sin(a) * rise, 0); L.edges(box, i / n, 1, null, m) }
    return SPR.segsOf(new THREE.Group().add(L.mesh(SPFX.lineMat({})))) },
};

// ---------------------------------------------------------------- A: a gyroscope the road passes through
/* rings round the road's axis (in the plane across the road), each turning only in its own plane, with a little
   nod (o.nod radians) that the keep-out check allows; ticks point outward; no core on the road. Built at u (road frame). */
SPR.gyroGate = function (o = {}) {
  const pal = o.palU || SPFX.newPal(o.pal || 'goldViolet'), lift = o.lift ?? 6, R0 = o.r || SPC.ringR(lift, 3), n = o.rings || 4, grp = new THREE.Group(), rings = [];
  for (let i = 0; i < n; i++) { const r = R0 + i * (o.gap || 4.5), L = SPFX.Lines(), pc = 0.1 + 0.8 * i / Math.max(1, n - 1);
    L.poly(SPFX.circleXY(r, 120), true, pc, 1.2); L.poly(SPFX.circleXY(r + 1.4, 120), true, pc, 0.5);
    for (let j = 0; j < 36; j++) { const a = j / 36 * TAU, c = Math.cos(a), s = Math.sin(a), l = j % 6 ? 1.6 : 4.5; L.seg([c * (r + 1.4), s * (r + 1.4), 0], [c * (r + 1.4 + l), s * (r + 1.4 + l), 0], pc + 0.1, j % 6 ? 0.5 : 1.3) }
    // beads: small solids riding the ring
    for (let j = 0; j < 3; j++) { const a = j / 3 * TAU + i, m = new THREE.Matrix4().makeTranslation(Math.cos(a) * (r + 3.5), Math.sin(a) * (r + 3.5), 0); L.edges(new THREE.OctahedronGeometry(1.6), 0.95, 1.2, null, m) }
    const tg = new THREE.RingGeometry(r, r + 1.4, 120, 1); const m = new THREE.Group();
    m.add(SPFX.Cores().add(tg, null, pc).mesh(SPFX.coreMat({ pal, ca: 0, side: THREE.DoubleSide, core: '#06050a' })), L.mesh(SPFX.lineMat({ pal, width: 0.22 + i * 0.05, maxPx: 6 })));
    const hold = new THREE.Group(); hold.add(m); hold.position.y = lift; grp.add(hold); rings.push({ hold, m }) }
  const sp = o.speeds || [0.35, -0.5, 0.7, -0.9, 1.1];
  return { group: grp, R0, update(t, bt) { bt = bt || SPC.fakeBeat(t); rings.forEach((r, i) => { const tick = o.tick ? (Math.floor(bt.b) + ss(Math.min(1, bt.ph * 4))) * 0.13 * (i % 2 ? -1 : 1) : 0;
      r.m.rotation.z = t * sp[i % sp.length] + tick; r.hold.rotation.x = (o.nod ?? 0.12) * Math.sin(t * 0.4 + i * 1.7); r.hold.rotation.y = (o.nod ?? 0.12) * 0.6 * Math.sin(t * 0.33 + i);
      r.m.children[1].material.uniforms.uGain.value = 1 + 0.5 * bt.k + 0.6 * bt.drop }) } };
};

// ---------------------------------------------------------------- A: the lattice hall, rebuilt round the road
/* A hall whose walls, floor and roof are a lattice in the road's own frame: it follows the road round bends as a
   tunnel does. The road's tube (the keep-out, plus room) is always open, and any strut that would stand between a chase
   camera and the road ahead is left out (on a bend the inner wall opens). o: u0, len, hw (half width), yb/yt (floor,
   roof, from the road), sp across, su along, pal; lattice bodies hang in it (o.bodies). */
SPR.roomLattice = function (o = {}) {
  const pal = SPFX.newPal(o.pal || 'cyanMagenta'), hw = o.hw || 84, yb = o.yb ?? -42, yt = o.yt ?? 72, sp = o.sp || 14, su = o.su || 14, u0 = o.u0, len = o.len || 600, rnd = SW.h.rng(o.seed || 7);
  const clx = SPC.hw + SPC.o.margin + 5, cyb = -SPC.o.below - 5, cyt = SPC.o.above + 6, inside = (x, y) => Math.abs(x) < clx && y > cyb && y < cyt;
  const nx = Math.round(2 * hw / sp), ny = Math.round((yt - yb) / sp), nz = Math.round(len / su), F = [];
  for (let k = 0; k <= nz; k++) F.push(fr(u0 + k * su));
  const P = (i, j, k) => { const f = F[k]; return f.p.clone().addScaledVector(f.r, -hw + i * sp).addScaledVector(f.u, yb + j * sp) };
  const L = SPFX.Lines(), G = SPFX.Lines(), ok = new Map(), K = (i, j, k) => (k * 1000 + i) * 1000 + j;
  const pc = (j, k) => 0.12 + j / ny * 0.7 + k / nz * 0.1;
  for (let k = 0; k <= nz; k++) for (let i = 0; i <= nx; i++) for (let j = 0; j <= ny; j++) { const x = -hw + i * sp, y = yb + j * sp; if (inside(x, y)) continue; const p = P(i, j, k); if (SPC.ok(p, 1, null)) ok.set(K(i, j, k), p); else SPC.note('room nodes cut (rule A)') }
  let cut = 0, nseg = 0;
  const seg = (a, b, beam, c) => { const m = a.clone().lerp(b, 0.5); if (!SPC.ok(m, 0.8, null)) { cut++; return } (beam ? L : G).seg(a, b, c, beam ? 1 : 0.55); nseg++ };
  for (let k = 0; k <= nz; k++) for (let i = 0; i <= nx; i++) for (let j = 0; j <= ny; j++) { const a = ok.get(K(i, j, k)); if (!a) continue;
    const beam = (i % 3 === 0 && j % 3 === 0) || (j % 3 === 0 && k % 3 === 0) || (i % 3 === 0 && k % 3 === 0);
    for (const [di, dj, dk] of [[1, 0, 0], [0, 1, 0], [0, 0, 1]]) { const b = ok.get(K(i + di, j + dj, k + dk)); if (b) seg(a, b, beam, pc(j, k)) }
    if ((i + j + k) % 2 === 0 && rnd() < 0.3) { const c = ok.get(K(i + 1, j + 1, k + 1)); if (c) seg(a, c, false, pc(j, k) + 0.3) } }
  if (cut) SPC.note('room struts cut (rule A)', cut);
  // a gate frame at each end: a bright square round the open tube
  const E = SPFX.Lines(); for (const k of [0, nz]) { const f = F[k], q = (x, y) => f.p.clone().addScaledVector(f.r, x).addScaledVector(f.u, y), x = clx + 1, y0 = cyb - 1, y1 = cyt + 1;
    E.poly([q(-x, y0), q(x, y0), q(x, y1), q(-x, y1)], true, 0.95, 1.6); E.poly([q(-x - 3, y0 - 3), q(x + 3, y0 - 3), q(x + 3, y1 + 3), q(-x - 3, y1 + 3)], true, 0.7, 0.9) }
  const fog = o.fog || [140, 900], lmB = SPFX.lineMat({ pal, width: 0.36, minPx: 1.6, maxPx: 5, fog }), lmG = SPFX.lineMat({ pal, width: 0.2, minPx: 1.2, maxPx: 3, gain: 0.6, fog }), lmE = SPFX.lineMat({ pal, width: 0.5, minPx: 2, maxPx: 7, fog });
  const grp = new THREE.Group(); grp.add(L.mesh(lmB), G.mesh(lmG), E.mesh(lmE));
  // light running along the hall: a band that travels with the race (u), in the beams' shader via a moving palette
  const obj = { group: grp, nseg, F, update(t, bt) { bt = bt || SPC.fakeBeat(t); lmB.uniforms.uGain.value = 0.75 + 0.3 * bt.k + 0.25 * bt.drop; lmB.uniforms.uShift.value = -t * 0.12; lmG.uniforms.uGain.value = 0.42 + 0.15 * bt.k; lmE.uniforms.uGain.value = 1.2 + 0.6 * bt.k } };
  SPR.add(obj, 'room: lattice hall');
  // lattice bodies hanging in the hall, each placed with rule A
  const shapes = [(r) => new THREE.IcosahedronGeometry(r, 0), (r) => new THREE.OctahedronGeometry(r), (r) => new THREE.DodecahedronGeometry(r), (r) => new THREE.BoxGeometry(r * 1.3, r * 1.3, r * 1.3)];
  for (let n = 0; n < (o.bodies ?? 8); n++) { const r = 5 + rnd() * 8, geo = shapes[n % 4](r), b = new THREE.Group();
    b.add(SPFX.Cores().add(geo, null, 0).mesh(SPFX.coreMat({ pal, ca: 0.5, cs: r * 0.15, cy: 0.02, opacity: 0.72, core: '#04030a' })));
    const BL = SPFX.Lines().edges(geo, 0.2 + rnd() * 0.3, 1.2); BL.edges(shapes[(n + 1) % 4](r * 0.5), 0.75, 0.9);
    for (let g = -2; g <= 2; g++) { BL.seg([g * r * 0.25, -r * 0.6, 0], [g * r * 0.25, r * 0.6, 0], 0.6, 0.35); BL.seg([-r * 0.6, g * r * 0.25, 0], [r * 0.6, g * r * 0.25, 0], 0.6, 0.35) }
    b.add(BL.mesh(SPFX.lineMat({ pal, width: r * 0.025, maxPx: 6 }))); const sp0 = 0.2 + rnd() * 0.4, ph = rnd() * 6;
    const body = { group: b, update(t, bt) { b.children[0].rotation.set(t * sp0 * 0.5, t * sp0 + ph, 0); b.children[1].rotation.copy(b.children[0].rotation) } };
    const side = n % 2 ? 1 : -1, uu = u0 + 50 + n * (len - 100) / Math.max(1, (o.bodies ?? 8) - 1);
    SPR.put('room bodies', body, (k, R) => ({ u: uu + (R() - 0.5) * 30, lat: side * (clx + r + 6 + R() * (hw - clx - r - 10)), h: -10 + R() * 50 }), { nt: 3 }) }
  return obj;
};
})();
