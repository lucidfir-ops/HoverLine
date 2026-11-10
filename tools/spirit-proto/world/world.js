// Spirit realm world prototype (Prototype 61): the void scenery and road set pieces, added to the real game page by
// lib.js (window.__cv is the hook into the game's scope). Not game code: a sketch of how each piece could be built in
// Three.js r128 and what it costs (triangles, draw calls). Everything here has its own clock and its own random numbers.
(function () {
'use strict';
const SW = window.SW = {};
const V3 = THREE.Vector3, Q4 = THREE.Quaternion, M4 = THREE.Matrix4, Col = THREE.Color;
const TAU = Math.PI * 2;
let C = null, G = null, T = null;
const clamp = (x, a, b) => Math.max(a, Math.min(b, x)), lerp = (a, b, t) => a + (b - a) * t, ss = (x) => { x = clamp(x, 0, 1); return x * x * (3 - 2 * x) };
function rng(s) { return () => { s |= 0; s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296 } }

// ---------------------------------------------------------------- palettes (colour by height, as Prism's contours)
const PALS = {
  prism: { n: 'Prism rainbow', c: ['#ff4040', '#ffa21f', '#f0ff3a', '#3dff7a', '#2fd6ff', '#4a6bff', '#b04dff', '#ff3fd0'], per: 150 },
  goldviolet: { n: 'Gold and violet', c: ['#ffd27a', '#ffb000', '#ff7a2a', '#c04dff', '#6a2cff', '#9a5bff'], per: 140 },
  cyanmag: { n: 'Cyan and magenta', c: ['#3ff0ff', '#2a8cff', '#7a4dff', '#ff3fd0', '#ff2a8a', '#9a4dff'], per: 140 },
  ember: { n: 'Ember and white', c: ['#ffffff', '#ffe2b0', '#ffa040', '#ff5a14', '#ff8a2a', '#ffd8a0'], per: 120 },
  jade: { n: 'Jade, turquoise and gold', c: ['#2fd6a4', '#3fd8ff', '#1fa07a', '#ffc23a', '#ffe08a', '#3fffc8'], per: 140 }
};
SW.PALS = PALS;
const U = { uT: { value: 0 }, uPal: { value: Array.from({ length: 8 }, () => new V3()) }, uPN: { value: 4 }, uPer: { value: 140 }, uDrift: { value: 0.004 },
  uFog: { value: new THREE.Vector2(300, 1500) }, uPulse: { value: 0 }, uGain: { value: 1 }, uPx: { value: 1.15 }, uAtlas: { value: null } };
SW.U = U;
function setPal(k) { const P = PALS[k] || PALS.prism; SW.pal = k; U.uPN.value = P.c.length; U.uPer.value = P.per;
  P.c.forEach((h, i) => { const c = new Col(h); U.uPal.value[i].set(c.r, c.g, c.b) }) }
SW.setPal = setPal;
function palCol(h, t = 0) { const P = PALS[SW.pal || 'prism'], n = P.c.length; let x = (((h / P.per + t * U.uDrift.value) % 1) + 1) % 1 * n; const i = Math.floor(x), f = x - i;
  return new Col(P.c[i % n]).lerp(new Col(P.c[(i + 1) % n]), f) }
SW.palCol = palCol;

// ---------------------------------------------------------------- shaders
const GL_COMMON = `
uniform float uT; uniform vec3 uPal[8]; uniform float uPN; uniform float uPer; uniform float uDrift; uniform vec2 uFog; uniform float uPulse; uniform float uGain; uniform float uPx;
vec3 pal(float h){ float x=fract(h/uPer+uT*uDrift)*uPN; vec3 c=vec3(0.); for(int k=0;k<8;k++){ float fk=float(k); if(fk>=uPN) break;
  float w=max(0.,1.-abs(x-fk))+max(0.,1.-abs(x-fk-uPN)); c+=uPal[k]*w; } return c; }
float fogK(vec3 w){ return 1.-smoothstep(uFog.x,uFog.y,distance(w,cameraPosition)); }
float aaLine(float d,float px){ return 1.-smoothstep(px-0.6,px+0.6,d); }
`;
// the wire look: dark faces, bright edges, contour lines every uCs metres coloured by height. Modes: QUAD (edges of each
// face, from its uv), TRI (every triangle edge, from a bary attribute), GRID (a uv grid: the wireframe heads).
const WIRE_V = `
attribute vec3 bary; varying vec2 vUv; varying vec3 vB; varying vec3 vW; varying vec3 vN; varying vec3 vON; varying vec4 vI;
#ifdef INST_ATTR
attribute vec4 aI;
#else
uniform vec4 uI;
#endif
void main(){ vec4 p=vec4(position,1.); vec3 n=normal;
#ifdef USE_INSTANCING
  p=instanceMatrix*p; n=mat3(instanceMatrix)*n;
#endif
#ifdef INST_ATTR
  vI=aI;
#else
  vI=uI;
#endif
  vec4 w=modelMatrix*p; vW=w.xyz; vN=normalize(mat3(modelMatrix)*n); vON=normal; vUv=uv; vB=bary; gl_Position=projectionMatrix*viewMatrix*w; }`;
const WIRE_F = GL_COMMON + `
uniform float uCs; uniform float uEdge; uniform float uCon; uniform vec3 uFill; uniform vec2 uGrid; uniform sampler2D uAtlas; uniform float uHueK;
varying vec2 vUv; varying vec3 vB; varying vec3 vW; varying vec3 vN; varying vec3 vON; varying vec4 vI;
void main(){
  float dist=distance(vW,cameraPosition); float px=uPx*clamp(60./dist,1.,2.2);
  float e=0.;
#ifdef QUAD
  { vec2 d=min(vUv,1.-vUv); vec2 fw=max(fwidth(vUv),vec2(1e-5)); vec2 q=d/fw; e=aaLine(min(q.x,q.y),px); }
#endif
#ifdef TRI
  { vec3 fw=max(fwidth(vB),vec3(1e-5)); vec3 q=vB/fw; e=aaLine(min(min(q.x,q.y),q.z),px*0.8); }
#endif
#ifdef GRID
  { vec2 g=vUv*uGrid; vec2 d=abs(fract(g-0.5)-0.5); vec2 fw=max(fwidth(g),vec2(1e-5)); vec2 q=d/fw; e=aaLine(min(q.x,q.y),px*0.75); }
#endif
  float c=0.;
  { float y=vW.y/uCs; float f=abs(fract(y-0.5)-0.5); float fw=max(fwidth(y),1e-5); c=aaLine(f/fw,px*0.5)*(1.-smoothstep(0.12,0.35,fw))*smoothstep(0.02,0.25,1.-abs(vN.y)); }
  vec3 col=pal(vW.y*uHueK+vI.x);
  float g=0.;
#ifdef GLYPH
  if(vI.y>=0. && abs(vON.y)<0.5){ vec2 q=vec2((vUv.x-0.12)/0.76,(vUv.y-0.07)/0.86);
    if(q.x>0.&&q.x<1.&&q.y>0.&&q.y<1.){ g=texture2D(uAtlas,vec2((vI.y+q.x)/4.,q.y)).r; } }
#endif
  float fk=fogK(vW); float br=vI.z*(1.+uPulse*0.8)*uGain;
  vec3 fill=uFill*(0.7+0.6*max(vN.y,0.)+0.25*abs(vN.x));
  vec3 o=fill*fk+col*(e*uEdge+c*uCon)*br*fk + mix(col,vec3(1.),0.35)*g*1.6*br*fk;
#ifdef ADD
  gl_FragColor=vec4(o*vI.w,1.);
#else
  gl_FragColor=vec4(o,1.);
#endif
}`;
function wireMat(o = {}) {
  const defs = {}; defs[o.mode || 'QUAD'] = 1; if (o.inst) defs.INST_ATTR = 1; if (o.glyph) defs.GLYPH = 1; if (o.add) defs.ADD = 1;
  const m = new THREE.ShaderMaterial({ defines: defs, vertexShader: WIRE_V, fragmentShader: WIRE_F,
    uniforms: Object.assign({}, U, { uCs: { value: o.cs || 4 }, uEdge: { value: o.edge ?? 1 }, uCon: { value: (o.con ?? 0.5) * 0.6 }, uFill: { value: new Col(o.fill ?? 0x0a0812) },
      uGrid: { value: new THREE.Vector2(...(o.grid || [24, 16])) }, uI: { value: new THREE.Vector4(0, -1, 1, 1) }, uHueK: { value: o.hueK ?? 1 } }),
    side: o.side ?? (o.add ? THREE.DoubleSide : THREE.FrontSide), transparent: !!o.add, depthWrite: !o.add, blending: o.add ? THREE.AdditiveBlending : THREE.NormalBlending });
  m.extensions = { derivatives: true }; return m;
}
SW.wireMat = wireMat; SW.lineMat = (a, h) => lineMat(a, h); SW.GL_COMMON = GL_COMMON;
// lines and points coloured by height (the lattice, stars, trails)
const LINE_V = `attribute float aA; varying vec3 vW; varying float vA; void main(){ vec4 w=modelMatrix*vec4(position,1.); vW=w.xyz; vA=aA; gl_Position=projectionMatrix*viewMatrix*w; }`;
const LINE_F = GL_COMMON + `uniform float uA; uniform float uHue; uniform vec3 uTint; uniform float uTintK; varying vec3 vW; varying float vA; void main(){ vec3 c=mix(pal(vW.y+uHue),uTint,uTintK); gl_FragColor=vec4(c*uA*vA*fogK(vW)*(1.+uPulse*0.6)*uGain,1.); }`;
function lineMat(a = 0.5, hue = 0) { return new THREE.ShaderMaterial({ vertexShader: LINE_V, fragmentShader: LINE_F, uniforms: Object.assign({}, U, { uA: { value: a }, uHue: { value: hue }, uTint: { value: new Col(1, 1, 1) }, uTintK: { value: 0 } }),
  transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }) }
const PT_V = `attribute float aS; varying vec3 vW; void main(){ vec4 w=modelMatrix*vec4(position,1.); vW=w.xyz; vec4 mv=viewMatrix*w; gl_PointSize=aS; gl_Position=projectionMatrix*mv; }`;
const PT_F = GL_COMMON + `varying vec3 vW; void main(){ vec2 q=gl_PointCoord-0.5; float r=1.-smoothstep(0.1,0.5,length(q)); gl_FragColor=vec4(mix(pal(vW.y*3.),vec3(1.),0.5)*r*0.9,1.); }`;

// ---------------------------------------------------------------- geometry helpers
function baryGeo(g) { g = g.index ? g.toNonIndexed() : g; const n = g.attributes.position.count, b = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) b[i * 3 + (i % 3)] = 1; g.setAttribute('bary', new THREE.BufferAttribute(b, 3)); g.computeVertexNormals(); return g }
const BOX = new THREE.BoxGeometry(1, 1, 1);
SW.h = { rng, clamp, lerp, ss, baryGeo, BOX, setI, get G() { return G }, get C() { return C }, instanced, scatter: (o, r, n, pl) => scatter(o, r, n, pl), U };
function instanced(geo, mat, n) { const m = new THREE.InstancedMesh(geo, mat, n); m.instanceMatrix.setUsage(THREE.DynamicDrawUsage); m.frustumCulled = false;
  if (mat.defines && mat.defines.INST_ATTR) { const a = new THREE.InstancedBufferAttribute(new Float32Array(n * 4), 4); for (let i = 0; i < n; i++) a.setXYZW(i, 0, -1, 1, 1); a.setUsage(THREE.DynamicDrawUsage); geo = m.geometry = geo.clone(); geo.setAttribute('aI', a); m.aI = a }
  return m }
const _m = new M4(), _q = new Q4(), _s = new V3(), _p = new V3(), _e = new THREE.Euler(), _v = new V3(), _w = new V3();
function setI(m, i, p, q, s) { _m.compose(p, q, s); m.setMatrixAt(i, _m) }

// the track frame at a distance along the lap
function fr(u) { const a = C.sampleAt(u); return { p: a.p.clone(), r: a.r.clone(), u: a.u.clone(), t: a.t.clone() } }
SW.fr = fr;
function at(u, side, up, fwd = 0) { const f = fr(u); return f.p.addScaledVector(f.r, side).addScaledVector(f.u, up).addScaledVector(f.t, fwd) }
SW.at = at;
// distance to the nearest road centreline sample (a grid of samples every 4 m)
let HASH = null;
function buildHash() { HASH = new Map(); const P = T.P; for (let i = 0; i < T.N; i += 2) { const p = P[i], k = Math.floor(p.x / 60) + ',' + Math.floor(p.z / 60); if (!HASH.has(k)) HASH.set(k, []); HASH.get(k).push(p) } }
function dRoad(x, y, z) { const cx = Math.floor(x / 60), cz = Math.floor(z / 60); let d = 1e9;
  for (let a = -1; a <= 1; a++) for (let b = -1; b <= 1; b++) { const L = HASH.get((cx + a) + ',' + (cz + b)); if (!L) continue; for (const p of L) { const dd = (p.x - x) ** 2 + (p.y - y) ** 2 + (p.z - z) ** 2; if (dd < d) d = dd } }
  return d === 1e9 ? 1e4 : Math.sqrt(d) }
SW.dRoad = dRoad;

// ---------------------------------------------------------------- the void
const ANIM = [];   // {update(t,dt,beat)}
SW.anim = ANIM;
SW.stats = {};
function track(name, obj) { G.add(obj); let tri = 0, calls = 0; obj.traverse((o) => { if (o.geometry && o.geometry.attributes.position) { const g = o.geometry; const n = (g.index ? g.index.count : g.attributes.position.count);
  const per = o.isLineSegments ? 2 : o.isPoints ? 1 : 3; tri += n / per * (o.count || 1); calls++ } }); const s = SW.stats[name] || (SW.stats[name] = { prims: 0, calls: 0 }); s.prims += Math.round(tri); s.calls += calls; return obj }
SW.track = track;
SW.voidify = function (o = {}) {
  C = window.__cv; T = C.T; buildHash();
  if (G) { C.scene.remove(G); G.traverse((q) => { if (q.geometry) q.geometry.dispose() }) }
  G = new THREE.Group(); G.name = 'spirit'; C.scene.add(G); ANIM.length = 0; SW.stats = {};
  // keep the road (everything the builder adds before the sky dome); hide Prism's rock, pools, glow worms and sky
  const ch = T.group.children, sky = ch.indexOf(T.env.sky); SW.roadObjs = [];
  ch.forEach((q, i) => { if (i < sky) SW.roadObjs.push(q); else q.visible = false });
  T.env.update = () => {}; T.env.cave = null; T.env.sky = null;
  C.VFX.init(); C.VFX.sky.visible = false; C.G2.sky = 0; C.G2.haze = 0; C.G2.motes = 0;
  C.scene.background = new Col(0); C.scene.fog.color.setHex(0); C.scene.fog.near = 400; C.scene.fog.far = 2600; T.look = Object.assign({}, T.look, { bg: 0, haze: 0, fog: [400, 2600] }); C.VFX.hz = null;
  setPal(o.pal || 'prism'); U.uFog.value.set(o.fog0 || 260, o.fog1 || 1500);
  SW.t = 0; SW.beat = null; SW.avoid = []; return { L: T.L, N: T.N, W: C.W };
};
SW.update = function (dt) {
  SW.t += dt; U.uT.value = SW.t; const b = SW.beat ? SW.beat.at(SW.t) : null; SW.b = b;
  U.uPulse.value = b ? b.kick * (SW.beatAmt ?? 0.5) : 0;
  for (const a of ANIM) a(SW.t, dt, b);
  C.scene.background.setHex(0); C.scene.fog.color.setHex(0);
};

// ---------------------------------------------------------------- the carvings (bestiary): four creatures as line drawings
const circ = (cx, cy, r, n = 24, a0 = 0) => Array.from({ length: n + 1 }, (_, i) => [cx + r * Math.cos(a0 + i * TAU / n), cy + r * Math.sin(a0 + i * TAU / n)]);
const mir = (pl) => pl.map((p) => [-p[0], p[1]]);
function cSerpent() { const N = 100, Lf = [], Rt = [], ch = []; const cx = (t) => 0.5 * Math.sin(t * Math.PI * 3.4) * (1 - 0.2 * t), cy = (t) => 0.25 + t * 3.2;
  for (let i = 0; i <= N; i++) { const t = i / N * 0.9; const dx = (cx(t + 0.003) - cx(t - 0.003)) / (cy(t + 0.003) - cy(t - 0.003)); const nl = Math.hypot(1, dx);
    const w = 0.04 + 0.2 * Math.pow(Math.sin(Math.PI * Math.min(1, t * 1.1 + 0.05)), 0.7); const c = [cx(t), cy(t)]; const n = [1 / nl, -dx / nl];
    Lf.push([c[0] + n[0] * w, c[1] + n[1] * w]); Rt.push([c[0] - n[0] * w, c[1] - n[1] * w]); ch.push({ c, n, w, tg: [dx / nl, 1 / nl] }) }
  const out = [Lf, Rt, [Lf[0], Rt[0]]];
  for (let i = 6; i < N - 4; i += 4) { const q = ch[i]; out.push([Lf[i], [q.c[0] - q.tg[0] * 0.13, q.c[1] - q.tg[1] * 0.13], Rt[i]]) }
  const h = ch[N], hc = h.c, n = h.n, tg = h.tg, pt = (a, b) => [hc[0] + n[0] * a + tg[0] * b, hc[1] + n[1] * a + tg[1] * b];
  out.push([Lf[N], pt(0.34, 0.12), pt(0.22, 0.5), pt(0, 0.8), pt(-0.22, 0.5), pt(-0.34, 0.12), Rt[N]]);
  out.push([pt(0.2, 0.45), pt(0.42, 0.75), pt(0.36, 1.05)], [pt(-0.2, 0.45), pt(-0.42, 0.75), pt(-0.36, 1.05)]);
  out.push([pt(0.08, 0.36), pt(0.16, 0.44), pt(0.08, 0.52), pt(0, 0.44), pt(0.08, 0.36)], [pt(-0.08, 0.36), pt(-0.16, 0.44), pt(-0.08, 0.52), pt(0, 0.44), pt(-0.08, 0.36)]);
  out.push([pt(0, 0.5), pt(0, 0.78)]); return out }
function cFirebird() { const o = []; o.push(circ(0, 3.7, 0.26, 20));
  o.push([[0, 3.96], [0, 4.4]], [[0.12, 3.93], [0.34, 4.25]], [[-0.12, 3.93], [-0.34, 4.25]], [[0.2, 3.85], [0.52, 4.0]], [[-0.2, 3.85], [-0.52, 4.0]]);
  o.push([[-0.07, 3.5], [0, 3.18], [0.07, 3.5]]); o.push([[0, 3.44], [0.36, 3.0], [0.26, 2.2], [0, 1.75], [-0.26, 2.2], [-0.36, 3.0], [0, 3.44]]);
  for (let j = 0; j < 6; j++) { const ang = (34 - j * 13) * Math.PI / 180, L = 0.68 - 0.02 * j, sx = 0.34, sy = 3.02 - j * 0.1; const pts = [], pts2 = [];
    for (let f = 0; f <= 10; f++) { const t = f / 10, a = ang - 0.35 * t * t, x = sx + L * t * Math.cos(a), y = sy + L * t * Math.sin(a); const wd = 0.1 * Math.sin(Math.PI * t) ** 0.8 + 0.01;
      pts.push([x + wd * Math.sin(a), y - wd * Math.cos(a)]); pts2.push([x - wd * Math.sin(a), y + wd * Math.cos(a)]) }
    const lf = pts.concat(pts2.reverse()); o.push(lf); o.push(lf.map((p) => [-p[0], p[1]])) }
  [[-0.5, 0.2], [0, 0], [0.5, -0.2]].forEach(([dx, ph]) => { const c = []; for (let i = 0; i <= 30; i++) { const t = i / 30; c.push([dx * t + 0.18 * Math.sin(t * 9 + ph * 5) * (0.4 + t), 1.75 - t * 1.55]) } o.push(c);
    const e = c[c.length - 1]; o.push(circ(e[0], e[1] - 0.1, 0.1, 10)); const c2 = c.map((p) => [p[0] + 0.14, p[1]]); o.push(c2.slice(0, 26)) });
  return o }
function cStag() { const o = []; const face = [[0, 0.3], [0.38, 1.2], [0.46, 2.0], [0.3, 2.5], [0, 2.62]]; o.push(face.concat(mir(face).reverse()));
  o.push([[0.44, 1.95], [0.95, 2.32], [0.34, 2.45]], [[-0.44, 1.95], [-0.95, 2.32], [-0.34, 2.45]]);
  for (const s of [1, -1]) o.push([[s * 0.12, 1.78], [s * 0.28, 1.9], [s * 0.12, 2.0]]);
  o.push([[0, 0.62], [0.1, 0.82], [-0.1, 0.82], [0, 0.62]]); o.push([[0, 2.62], [0, 2.1]]);
  for (const sg of [1, -1]) { const beam = [[0.2, 2.6], [0.45, 2.95], [0.62, 3.45], [0.58, 4.0], [0.42, 4.35]].map((p) => [sg * p[0], p[1]]); o.push(beam);
    o.push([beam[1], [sg * 0.9, 3.2], [sg * 0.98, 3.6]]); o.push([beam[2], [sg * 0.95, 3.9], [sg * 0.9, 4.25]]); o.push([beam[3], [sg * 0.78, 4.35]]); o.push([beam[1], [sg * 0.35, 3.2]]); o.push([[sg * 0.9, 3.2], [sg * 1.0, 3.0]]) }
  o.push(circ(0, 3.45, 0.26, 20)); for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; o.push([[0.34 * Math.cos(a), 3.45 + 0.34 * Math.sin(a)], [0.46 * Math.cos(a), 3.45 + 0.46 * Math.sin(a)]]) }
  return o }
function cSunRing() { const o = [], cx = 0, cy = 2.5; o.push(circ(cx, cy, 0.94, 48), circ(cx, cy, 0.7, 48));
  const z = []; for (let i = 0; i <= 40; i++) { const r = i % 2 ? 0.94 : 0.7, a = i * TAU / 40; z.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]) } o.push(z);
  const st = []; for (let i = 0; i <= 8; i++) { const a = (i * 3 % 8) * TAU / 8 + Math.PI / 8; st.push([cx + 0.6 * Math.cos(a), cy + 0.6 * Math.sin(a)]) } o.push(st);
  o.push(circ(cx, cy, 0.14, 12), circ(cx, cy, 0.38, 16)); o.push([[-0.16, 3.45], [0, 3.82], [0.16, 3.45]], [[0, 3.82], [0, 4.2]]);
  for (let k = 0; k < 4; k++) { const hw = 0.9 - k * 0.2, y = 1.45 - k * 0.32; o.push([[-hw, y], [hw, y], [hw, y - 0.3], [-hw, y - 0.3], [-hw, y]]) }
  o.push([[-0.9, 0.17], [0.9, 0.17]]); return o }
const CREATURES = [cSerpent, cFirebird, cStag, cSunRing];
SW.CREATURES = CREATURES;
function atlas() { if (U.uAtlas.value) return U.uAtlas.value; const tw = 256, th = 512, c = document.createElement('canvas'); c.width = tw * 4; c.height = th; const g = c.getContext('2d');
  g.fillStyle = '#000'; g.fillRect(0, 0, c.width, c.height);
  CREATURES.forEach((fn, k) => { const pl = fn(); const X = (x) => k * tw + tw / 2 + x * tw * 0.46, Y = (y) => th - (y / 4.4) * th * 0.98 - 4;
    for (const pass of [[14, 'rgba(255,255,255,0.18)'], [7, 'rgba(255,255,255,0.45)'], [3.2, '#fff']]) { g.lineWidth = pass[0]; g.strokeStyle = pass[1]; g.lineJoin = 'round'; g.lineCap = 'round';
      for (const line of pl) { g.beginPath(); line.forEach((p, i) => i ? g.lineTo(X(p[0]), Y(p[1])) : g.moveTo(X(p[0]), Y(p[1]))); g.stroke() } } });
  const t = new THREE.CanvasTexture(c); t.minFilter = THREE.LinearMipmapLinearFilter; t.anisotropy = 4; U.uAtlas.value = t; SW.atlasCanvas = c; return t }
SW.atlas = atlas;

// ---------------------------------------------------------------- scenery builders. o.u0..o.u1: the stretch of road to dress
// a cubic lattice of light with tetrahedral diagonals, cleared round the road (concept 1 and 8)
SW.lattice = function (o = {}) {
  const r = rng(o.seed || 3), sp = o.sp || 26, clear = o.clear || 34, pos = [], aa = [];
  const c0 = fr((o.u0 + o.u1) / 2).p, ext = o.ext || [700, 260, 700], yaw = o.yaw || 0, cy = Math.cos(yaw), sy = Math.sin(yaw);
  const nx = Math.round(ext[0] * 2 / sp), ny = Math.round(ext[1] * 2 / sp), nz = Math.round(ext[2] * 2 / sp);
  const P = (i, j, k) => { const x = -ext[0] + i * sp, y = -ext[1] + j * sp + (o.dy || 0), z = -ext[2] + k * sp; return [c0.x + x * cy + z * sy, c0.y + y, c0.z - x * sy + z * cy] };
  const ok = new Map(); const key = (i, j, k) => (i * 512 + j) * 512 + k;
  for (let i = 0; i <= nx; i++) for (let j = 0; j <= ny; j++) for (let k = 0; k <= nz; k++) { const p = P(i, j, k); const d = dRoad(p[0], p[1], p[2]); if (d > clear && !(SW.avoid || []).some((a) => a.c.distanceTo(new V3(...p)) < a.r * (a.lat ?? 0.6))) ok.set(key(i, j, k), [p, d]) }
  const E = (a, b, w) => { const near = clamp((160 - Math.min(a[1], b[1])) / 160, 0, 1); pos.push(...a[0], ...b[0]); const al = w * (0.35 + 0.65 * near); aa.push(al, al) };
  for (const [kk, a] of ok) { const k = kk % 512, j = Math.floor(kk / 512) % 512, i = Math.floor(kk / 262144);
    const beam = (i % 4 === 0 && j % 4 === 0) || (i % 4 === 0 && k % 4 === 0) || (j % 4 === 0 && k % 4 === 0);
    for (const [di, dj, dk] of [[1, 0, 0], [0, 1, 0], [0, 0, 1]]) { const b = ok.get(key(i + di, j + dj, k + dk)); if (b && (beam || r() < (o.thin ?? 0.45))) E(a, b, beam ? 1 : 0.55) }
    if (((i + j + k) & 1) === 0 && r() < (o.diag ?? 0.35)) { const cc = P(i + 0.5, j + 0.5, k + 0.5), dd = dRoad(...cc); if (dd > clear) for (const d of [[0, 0, 0], [1, 1, 0], [1, 0, 1], [0, 1, 1]]) { const q = ok.get(key(i + d[0], j + d[1], k + d[2])); if (q) E([cc, dd], q, 0.4) } } }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('aA', new THREE.Float32BufferAttribute(aa, 1));
  const m = new THREE.LineSegments(g, lineMat(o.a ?? 0.55, o.hue || 0)); m.frustumCulled = false; track('lattice', m);
  // light packets running along the struts
  if (o.packets !== 0) { const n = o.packets || 260, pg = new THREE.BufferGeometry(), pp = new Float32Array(n * 3), ps = new Float32Array(n), segs = pos.length / 6, sel = [];
    for (let q = 0; q < n; q++) { sel.push([Math.floor(r() * segs), r(), 0.15 + r() * 0.5]); ps[q] = 3 + r() * 5 }
    pg.setAttribute('position', new THREE.BufferAttribute(pp, 3)); pg.setAttribute('aS', new THREE.BufferAttribute(ps, 1));
    const pm = new THREE.Points(pg, new THREE.ShaderMaterial({ vertexShader: PT_V, fragmentShader: PT_F, uniforms: Object.assign({}, U), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
    pm.frustumCulled = false; track('lattice packets', pm);
    ANIM.push((t) => { for (let q = 0; q < n; q++) { const [s, f0, v] = sel[q], f = (f0 + t * v) % 1, i = s * 6; for (let d = 0; d < 3; d++) pp[q * 3 + d] = pos[i + d] + (pos[i + 3 + d] - pos[i + d]) * f } pg.attributes.position.needsUpdate = true }) }
  return m };
// stars in every direction (sparse; the void stays black)
SW.stars = function (o = {}) { const r = rng(o.seed || 9), n = o.n || 1500, pp = new Float32Array(n * 3), ps = new Float32Array(n), c0 = fr((o.u0 + o.u1) / 2).p;
  for (let i = 0; i < n; i++) { const th = r() * TAU, ph = Math.acos(2 * r() - 1), R = 1200 + r() * 900; pp[i * 3] = c0.x + R * Math.sin(ph) * Math.cos(th); pp[i * 3 + 1] = c0.y + R * Math.cos(ph); pp[i * 3 + 2] = c0.z + R * Math.sin(ph) * Math.sin(th); ps[i] = 1 + r() * r() * 3 }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pp, 3)); g.setAttribute('aS', new THREE.BufferAttribute(ps, 1));
  const m = new THREE.Points(g, new THREE.ShaderMaterial({ vertexShader: PT_V, fragmentShader: PT_F.replace('fogK(vW)', '1.'), uniforms: Object.assign({}, U), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
  m.frustumCulled = false; track('stars', m); ANIM.push(() => { m.position.set(0, 0, 0) }); return m };

// a field of floating solids: boxes (QUAD) and octahedra / tetrahedra (TRI), tumbling slowly. Placed by the road's frame:
// u along the road, a side offset and a height, never inside the clearance round the road.
function scatter(o, r, n, place) { const out = []; let tries = 0;
  while (out.length < n && tries++ < n * 30) { const u = lerp(o.u0, o.u1, r()), side = (r() < 0.5 ? -1 : 1) * lerp(o.side0 || 40, o.side1 || 420, Math.pow(r(), o.sideP || 1.3)), up = lerp(o.up0 ?? -160, o.up1 ?? 240, r());
    const p = at(u, side, up); const s = place ? place(r) : 1; const d = dRoad(p.x, p.y, p.z); if (d < (o.clear || 30) + s * 0.9) continue;
    if ((SW.avoid || []).some((a) => a.c.distanceTo(p) < a.r + s)) continue; out.push({ p, s, u }) } return out }
SW.solids = function (o = {}) {
  const r = rng(o.seed || 5), n = o.n || 260;
  const list = scatter(o, r, n, (r) => lerp(o.s0 || 5, o.s1 || 34, Math.pow(r(), 2.2)));
  const boxes = list.filter((_, i) => i % 3 !== 2), octs = list.filter((_, i) => i % 3 === 2);
  const mB = instanced(BOX, wireMat({ mode: 'QUAD', inst: true, cs: 3, con: 0.55 }), boxes.length), oct = baryGeo(new THREE.OctahedronGeometry(0.7, 0));
  const mO = instanced(oct, wireMat({ mode: 'TRI', inst: true, cs: 3, con: 0.5 }), octs.length);
  const st = (L, m) => L.map((b, i) => { const q = new Q4().setFromEuler(new THREE.Euler(r() * TAU, r() * TAU, r() * TAU)); const ax = new V3(r() - 0.5, r() - 0.5, r() - 0.5).normalize();
    const sc = new V3(b.s, b.s * (r() < 0.3 ? lerp(0.4, 1.8, r()) : 1), b.s); if (m.aI) m.aI.setXYZW(i, r() * 60, -1, 0.75 + r() * 0.5, 1); return { ...b, q, ax, w: (r() - 0.5) * (o.spin ?? 0.25), sc, bob: r() * TAU } });
  const sB = st(boxes, mB), sO = st(octs, mO);
  const upd = (m, L) => (t) => { L.forEach((b, i) => { _q.setFromAxisAngle(b.ax, b.w * t).premultiply(b.q); _p.copy(b.p); _p.y += Math.sin(t * 0.4 + b.bob) * b.s * 0.08; setI(m, i, _p, _q, b.sc) }); m.instanceMatrix.needsUpdate = true };
  track('floating solids', mB); track('floating solids', mO); ANIM.push(upd(mB, sB)); ANIM.push(upd(mO, sO)); upd(mB, sB)(0); upd(mO, sO)(0);
  return { mB, mO, list };
};
// carved blocks: the bestiary on the sides of big blocks that turn (Eric: some blocks carry the creatures, and they rotate)
SW.carved = function (o = {}) {
  atlas(); const r = rng(o.seed || 17), n = o.n || 14, list = o.list || scatter({ ...o, side0: o.side0 || 34, side1: o.side1 || 140, up0: o.up0 ?? -10, up1: o.up1 ?? 60, sideP: 1 }, r, n, (r) => lerp(o.s0 || 10, o.s1 || 18, r()));
  const m = instanced(BOX, wireMat({ mode: 'QUAD', inst: true, glyph: true, cs: 2.5, con: 0.4 }), list.length);
  const L = list.map((b, i) => { const k = b.k ?? (i % 4); m.aI.setXYZW(i, r() * 40, k, 1.05, 1); return { ...b, k, a0: r() * TAU, w: (r() < 0.5 ? -1 : 1) * (o.w ?? lerp(0.25, 0.6, r())), tilt: o.tumble && r() < 0.35 ? lerp(0.2, 0.6, r()) : 0, hk: o.hk ?? 1.55 } });
  const upd = (t, dt, b) => { L.forEach((q, i) => { const step = b && SW.carvedStep ? Math.floor(b.beatN) * (Math.PI / 8) + ss((b.beatF) * 3) * (Math.PI / 8) : q.w * t; _q.setFromEuler(_e.set(q.tilt * Math.sin(t * 0.3 + i), q.a0 + (SW.carvedStep ? step * Math.sign(q.w) : step), q.tilt * 0.5));
    _p.copy(q.p); _p.y += Math.sin(t * 0.5 + i) * 0.6; _s.set(q.s, q.s * q.hk, q.s); setI(m, i, _p, _q, _s) }); m.instanceMatrix.needsUpdate = true; m.aI.needsUpdate = true };
  track('carved blocks', m); ANIM.push(upd); upd(0, 0, null); return { m, L };
};
// block pyramids that shed their crowns across the road into an unfinished pyramid on the other side, and back (concept 3)
SW.pyramids = function (o = {}) {
  const r = rng(o.seed || 21), pairs = o.pairs || [{ u: o.u0 + 150, side: -1 }], all = [];
  for (const pr of pairs) { const n = pr.n || 8, pitch = pr.pitch || 9, cu = pitch * 0.92, A = at(pr.u, pr.side * (pr.d || 110), pr.y ?? -40), B = at(pr.u + (pr.du || 140), -pr.side * (pr.d || 110), pr.y ?? -40);
    const fA = fr(pr.u), fB = fr(pr.u + (pr.du || 140)); const mk = (c, f) => { const L = []; for (let k = 0; k < n; k++) { const m = n - k; for (let a = 0; a < m; a++) for (let b = 0; b < m; b++)
      L.push({ k, p: c.clone().addScaledVector(f.r, (a - (m - 1) / 2) * pitch).addScaledVector(f.t, (b - (m - 1) / 2) * pitch).add(new V3(0, (k + 0.5) * pitch, 0)) }) } return L };
    const LA = mk(A, fA), LB = mk(B, fB); const crown = (L) => L.filter((c) => c.k >= n - 3); const moveA = crown(LA), restB = crown(LB);
    for (const c of LA) if (!moveA.includes(c)) all.push({ home: c.p, s: cu, fixed: true });
    for (const c of LB) if (!restB.includes(c)) all.push({ home: c.p, s: cu, fixed: true });
    moveA.forEach((c, i) => { const tgt = restB[i % restB.length].p; const mid = c.p.clone().lerp(tgt, 0.5).add(new V3(0, 60 + r() * 50, 0)).addScaledVector(fA.t, (r() - 0.5) * 40);
      all.push({ home: c.p, tgt, mid, s: cu, delay: r() * 0.5, spin: new V3(r() - 0.5, r() - 0.5, r() - 0.5).normalize(), sp: lerp(2, 6, r()) * (r() < 0.5 ? -1 : 1) }) });
    // a ghost of the finished pyramid B (gold lines): built as 4 lines
  }
  const m = instanced(BOX, wireMat({ mode: 'QUAD', inst: true, cs: 3, con: 0.6 }), all.length);
  all.forEach((c, i) => m.aI.setXYZW(i, 0, -1, 1, 1));
  const per = o.per || 9; SW.pyrPhase = null;
  const upd = (t, dt, b) => { let ph; if (SW.pyrDrive) ph = SW.pyrDrive(t, b); else { const x = (t % (per * 2)) / per; ph = x < 1 ? x : 2 - x }
    all.forEach((c, i) => { if (c.fixed) { _q.identity(); _s.setScalar(c.s); setI(m, i, c.home, _q, _s); return }
      const k = ss((ph * 1.6 - c.delay) / 1.1); const a = c.home, bb = c.tgt, mid = c.mid; const u = k, iu = 1 - u;
      _p.set(iu * iu * a.x + 2 * u * iu * mid.x + u * u * bb.x, iu * iu * a.y + 2 * u * iu * mid.y + u * u * bb.y, iu * iu * a.z + 2 * u * iu * mid.z + u * u * bb.z);
      _q.setFromAxisAngle(c.spin, Math.sin(Math.PI * u) * c.sp); _s.setScalar(c.s); setI(m, i, _p, _q, _s); m.aI.setX(i, u * 90) });
    m.instanceMatrix.needsUpdate = true; m.aI.needsUpdate = true };
  track('breaking pyramids', m); ANIM.push(upd); upd(0, 0, null); return m;
};
// rings of blocks round the road, each turning slowly about the road (concept 3 and 8)
SW.rings = function (o = {}) {
  const r = rng(o.seed || 31), list = [], us = o.us || []; if (!us.length) for (let u = o.u0; u < o.u1; u += o.every || 70) us.push(u);
  us.forEach((u, ri) => { const f = fr(u), R = (o.R || C.W * 0.5 + 9) + (ri % 3) * 2.2, N = (o.N || 14) + 2 * (ri % 3), sz = o.size || 2.6;
    for (let i = 0; i < N; i++) list.push({ f, ri, i, N, R, sz, ph: r() * 0.4 + ri * 0.7 }) });
  const m = instanced(BOX, wireMat({ mode: 'QUAD', inst: true, cs: 1.6, con: 0.6 }), list.length);
  list.forEach((c, i) => m.aI.setXYZW(i, c.i * 4 + c.ri * 13, -1, 1.1, 1));
  const upd = (t, dt, b) => { list.forEach((c, i) => { const spin = (c.ri % 2 ? 1 : -1) * (o.w ?? 0.18) * t + (b && SW.ringStep ? Math.floor(b.barN) * TAU / c.N / 2 + ss(b.barF * 4) * TAU / c.N / 2 : 0);
      const th = c.ph + spin + c.i * TAU / c.N, ca = Math.cos(th), sa = Math.sin(th); const pulse = b && SW.ringKick ? b.kick * 0.35 : 0;
      _v.copy(c.f.r).multiplyScalar(ca).addScaledVector(c.f.u, sa); _p.copy(c.f.p).addScaledVector(_v, c.R * (1 + pulse * 0.12)).addScaledVector(c.f.u, 1.5);
      _w.crossVectors(c.f.t, _v); _m.makeBasis(_v, c.f.t, _w); _q.setFromRotationMatrix(_m); const s = c.sz * (1 + pulse);
      _s.set(s, s * 1.4, c.R * TAU / c.N * 0.78); setI(m, i, _p, _q, _s) }); m.instanceMatrix.needsUpdate = true };
  track('block rings', m); ANIM.push(upd); upd(0, 0, null); return m;
};
// the stepped sky: inverted ziggurats hanging over the road, stepped mountains beside it, floating stair slabs (concept 2)
SW.stepped = function (o = {}) {
  const r = rng(o.seed || 11), boxes = [];
  const zig = (c, f, half, n, sh, inv, hue) => { for (let k = 0; k < n; k++) { const sz = half * (1 - k / (n + 0.6)); boxes.push({ p: c.clone().addScaledVector(new V3(0, 1, 0), (inv ? -1 : 1) * (k + 0.5) * sh), f, sx: sz * 2, sy: sh, sz: sz * 2, k, n, inv, hue, dir: r() < 0.5 ? -1 : 1 }) } };
  const big = o.big || [{ u: o.u0 + 420, side: 0, y: 190, half: 150, n: 9, sh: 18, inv: true }];
  for (const b of big) zig(at(b.u, b.side, b.y), fr(b.u), b.half, b.n, b.sh, b.inv, 0);
  for (let i = 0; i < (o.n || 16); i++) { const u = lerp(o.u0, o.u1, i / (o.n || 16)) + r() * 30, side = (i % 2 ? -1 : 1) * (95 + r() * 120), y = -70 + r() * 110, h = 30 + r() * 26;
    const c = at(u, side, y); if (dRoad(c.x, c.y, c.z) < h * 1.6 + 20) continue; zig(c, fr(u), h, 5 + Math.floor(r() * 3), 7 + r() * 3, r() < 0.3, r() * 40) }
  for (let i = 0; i < (o.far || 8); i++) { const u = lerp(o.u0, o.u1, r()) + 200, side = (r() < 0.5 ? -1 : 1) * (260 + r() * 200), y = -120 + r() * 160, h = 60 + r() * 60;
    const c = at(u, side, y); if (dRoad(c.x, c.y, c.z) < h * 1.5 + 30) continue; zig(c, fr(u), h, 6 + Math.floor(r() * 4), 12 + r() * 8, r() < 0.5, r() * 40) }
  // floating stair flights beside the road
  if (o.stairs !== false) for (let u = o.u0 + 40; u < o.u1; u += 9) for (const sd of [-1, 1]) { const k = Math.floor((u - o.u0) / 9); const c = at(u, sd * (C.W / 2 + 7 + (k % 3) * 1.4), -3 - (k % 4) * 0.6);
    boxes.push({ p: c, f: fr(u), sx: 4.4, sy: 1.2, sz: 7, k: 0, n: 1, inv: false, hue: 0, step: true }) }
  const m = instanced(BOX, wireMat({ mode: 'QUAD', inst: true, cs: 3.2, con: 0.75 }), boxes.length);
  const upd = (t, dt, b) => { boxes.forEach((q, i) => { const f = q.f; _m.makeBasis(f.r.clone().setY(0).normalize(), new V3(0, 1, 0), f.t.clone().setY(0).normalize()); _q.setFromRotationMatrix(_m);
      let off = 0; if (b && SW.tierStep && q.n > 1) { const bar = b.barN + b.barF; const which = Math.floor(bar) % q.n; off = (which === q.k ? ss(b.barF * 2) - ss(b.barF * 2 - 1) : 0) * q.sx * 0.18 * q.dir }
      _p.copy(q.p).addScaledVector(f.r, off); _s.set(q.sx, q.sy, q.sz); setI(m, i, _p, _q, _s); if (m.aI) m.aI.setXYZW(i, q.hue, -1, q.step ? 0.9 : 1.1, 1) }); m.instanceMatrix.needsUpdate = true; m.aI.needsUpdate = true };
  track('stepped sky', m); ANIM.push(upd); upd(0, 0, null); return m;
};
// everything together: the base set Eric chose (concept 8) with more in the sky
SW.base = function (o = {}) {
  const u0 = o.u0, u1 = o.u1, k = o.density ?? 1;
  SW.stars({ u0, u1, n: 1400 });
  if (o.lattice !== false) SW.lattice({ u0, u1, sp: 44, clear: 44, a: 0.3, ext: [700, 260, 700], thin: 0.22, diag: 0.18 });
  if (o.lattice2) SW.lattice({ u0, u1, sp: 52, clear: 60, a: 0.35, ext: [700, 300, 700], yaw: 0.6435, hue: 70, seed: 9, packets: 120, thin: 0.6, diag: 0.2 });
  SW.solids({ u0: u0 - 100, u1: u1 + 500, n: Math.round(320 * k), side0: 40, side1: 520, up0: -200, up1: 300, clear: 30 });
  SW.carved({ u0, u1: u1 + 200, n: o.carvedN ?? Math.round(16 * k), tumble: true });
  if (o.rings !== false) SW.rings({ u0: u0 + 60, u1: u1 + 300, every: o.ringEvery || 110 });
  if (o.pyr !== false) SW.pyramids({ u0, pairs: o.pairs || [{ u: u0 + 260, side: -1, d: 105, du: 160 }, { u: u0 + 700, side: 1, d: 115, du: 150 }] });
  if (o.stepped) SW.stepped({ u0, u1: u1 + 300, n: 10, far: 6, ...o.stepped });
};

// ---------------------------------------------------------------- the pack and the camera
// pack: [{f: frame name, du: metres from the camera's racer, lat, vk: speed factor, weave}]. Racers fly the road at speed
// (no physics: a mock-up), or a custom path (portal jumps) when r.path is set: path(s) -> {p, t, up}
SW.pack = function (list, o = {}) {
  const c = C, S = c.S; c.player.ship.visible = false; c.player.shadow.visible = false; c.player.off = true; c.racers.length = 0; const byFrame = {};
  for (let i = 1; i < c.roster.length; i++) { const r = c.roster[i], cf = c.ROSTER[i]; if (!r.build || r.build.frame !== cf.b.frame) c.setShip(r, cf.b, cf.paint); byFrame[cf.b.frame] = r; r.ship.visible = false; r.shadow.visible = false; r.off = true }
  const v = c.VMAX * (o.speed ?? 1.0); SW.v = v; SW.P = [];
  for (const q of list) { const r = byFrame[q.f]; if (!r) continue; const u = o.u + q.du; c.freshRacer(r, u, u, q.lat);
    Object.assign(r, { v: v * (q.vk ?? 1), boost: q.boost ? 1 : 0, selfBoost: false, steerS: 0, yaw: 0, pitch: 0, brk: 0, ammo: r.d.ammo, hp: r.d.hp, off: false });
    r.ship.visible = true; r.shadow.visible = true; c.racers.push(r); SW.P.push({ r, q, lat0: q.lat, hist: [] }) }
  S.state = 'race'; S.t = 3; SW.camI = o.cam ?? SW.P.length - 1; return SW.P.length;
};
const _f = new V3(), _u = new V3(), _r = new V3();
SW.movePack = function (dt) {
  const c = C, S = c.S; S.t += dt;
  for (const P of SW.P) { const r = P.r, q = P.q; const vk = (q.vk ?? 1) + (q.surge ? q.surge * Math.sin(SW.t * 0.7 + q.du) : 0); r.v = SW.v * vk * (SW.vMul ?? 1);
    r.u += r.v * dt; r.utot += r.v * dt; const w = q.weave ?? 1.6; const nl = P.lat0 + w * Math.sin(SW.t * 0.9 + q.du * 0.37); r.steerS = clamp((nl - r.lat) / dt * 0.08, -0.6, 0.6); r.lat = nl;
    if (r.path && r.u >= r.path.u0) { const s = r.u - r.path.u0, a = r.path.at(s); r.ship.position.copy(a.p); _f.copy(a.t).normalize(); _u.copy(a.up).normalize(); _r.crossVectors(_u, _f.clone().negate()).normalize(); _u.crossVectors(_f.clone().negate(), _r);
      _m.makeBasis(_r, _u, _f.clone().negate()); r.ship.quaternion.setFromRotationMatrix(_m); r.shadow.visible = false; r.air = a.air; if (a.hide) r.ship.visible = false; else r.ship.visible = true }
    else { c.placeShip(r, S.t); if (r.hideAfter != null && r.u > r.hideAfter) r.ship.visible = false }
    P.hist.unshift({ t: SW.t, p: r.ship.position.clone(), q: r.ship.quaternion.clone(), vis: r.ship.visible, inP: !!(r.path && r.u >= r.path.u0) }); if (P.hist.length > 90) P.hist.pop() }
};
// cameras: chase (behind racer i), rail (fixed to the road's frame at an offset from a racer), fixed (a point looking at a point)
const camS = { p: new V3(), f: new V3(), up: new V3(), init: false, inP: false, airK: 0 };
SW.cam = function (dt, o) {
  const cam = C.camera; let pos, look, up;
  if (o.mode === 'chase') { const P = SW.P[o.i ?? SW.camI], r = P.r, sp = r.ship.position; let s;
    if (r.path && r.u >= r.path.u0) { const a = r.path.at(r.u - r.path.u0); s = { t: a.t.clone().normalize(), u: a.up.clone().normalize() } } else { const a = C.sampleAt(r.u); s = { t: a.t.clone(), u: a.u.clone() } }
    const inP = !!(r.path && r.u >= r.path.u0); if (inP && !camS.inP && r.path.rot && camS.init) { camS.f.applyQuaternion(r.path.rot); camS.up.applyQuaternion(r.path.rot) } camS.inP = inP;
    if (!camS.init || o.snap) { camS.f.copy(s.t); camS.up.copy(s.u); camS.init = true } else { camS.f.lerp(s.t, 1 - Math.exp(-dt * (o.k || 6))).normalize(); camS.up.lerp(s.u, 1 - Math.exp(-dt * 8)).normalize() }
    if (o.air) { const k = camS.airK = lerp(camS.airK || 0, r.air ? 1 : 0, 1 - Math.exp(-dt * 3)); o = Object.assign({}, o, { h: lerp(o.h ?? 3.9, o.air.h, k), lu: lerp(o.lu ?? 0.8, o.air.lu, k), d: lerp(o.d ?? 11, o.air.d ?? o.d ?? 11, k) }) }
    const side = new V3().crossVectors(camS.f, camS.up).normalize();
    pos = sp.clone().addScaledVector(camS.f, -(o.d ?? 11)).addScaledVector(camS.up, o.h ?? 3.9).addScaledVector(side, o.side || 0);
    look = sp.clone().addScaledVector(camS.f, o.l ?? 14).addScaledVector(camS.up, o.lu ?? 0.8).addScaledVector(side, o.ls || 0); up = camS.up }
  else if (o.mode === 'rail') { const u = (o.u != null ? o.u : SW.P[o.i ?? 0].r.u) + (o.at || 0), a = fr(u), b = fr(u + (o.look ?? 40));
    pos = a.p.clone().addScaledVector(a.r, o.side || 0).addScaledVector(a.u, o.up ?? 6); look = b.p.clone().addScaledVector(b.r, o.ls || 0).addScaledVector(b.u, o.lu ?? 1); up = o.worldUp ? new V3(0, 1, 0) : a.u }
  else { pos = typeof o.pos === 'function' ? o.pos(SW.t) : o.pos; look = typeof o.look === 'function' ? o.look(SW.t) : o.look; up = new V3(0, 1, 0) }
  cam.position.copy(pos); cam.up.copy(up); cam.lookAt(look); if (o.roll) cam.rotateZ(o.roll); cam.fov = o.fov || 74; cam.near = 0.3; cam.far = 3000; cam.updateProjectionMatrix(); cam.updateMatrixWorld();
};
SW.camReset = () => { camS.init = false; camS.inP = false; camS.airK = 0 };
// one frame: the world's clock, the pack, the camera, the exhaust, then the game's own draw (bloom, speed blur, grade)
SW.frame = function (dt0, camO, fx) {
  if (SW.slowFn) SW.slow = lerp(SW.slow || 1, SW.slowFn(), 1 - Math.exp(-dt0 * 6)); const dt = dt0 * (SW.slow || 1); SW.movePack(dt); SW.cam(dt, camO); SW.update(dt); if (SW.preRender) SW.preRender(dt);
  C.VFX.update(dt); C.scene.background.setHex(0); C.scene.fog.color.setHex(0);
  C.GFX.fx = fx ?? 0.45; C.GFX.gl = 0; C.gfxRender(C.scene, C.camera); return { calls: C.GFX.calls, tris: C.GFX.tris };
};
SW.size = function (w, h) { C.fit(); C.renderer.setPixelRatio(1); C.renderer.setSize(w, h, false); C.camera.aspect = w / h; C.camera.updateProjectionMatrix() };
// the road reflects the realm (the game's own reflection: a cube map from the middle of the track, every 30 frames)
SW.reflect = function (at) { const V = C.VFX; V.envT = null; if (at) { /* capture from a chosen point */ } V.applyEnv() };
})();
