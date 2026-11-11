// Prototype 61: the guard for refactors of the track builder (track/004*). Builds ~40 codes (every biome, night and day,
// simple and complex, Eric's codes, new-feature codes, low detail, the First flight races and the drill tracks) and hashes
// every object in T.group in traversal order: its type and transform, every geometry attribute and index (the exact
// float bits), instance matrices and colours, its materials' settings and canvas textures' pixels, plus the road
// (centreline, frames, features, splits, pads, strips, walls), T.bmInfo, the moving parts' items and Prism's summary.
// A refactor must leave every hash as it was: any change in what is built, or in the order random numbers are drawn,
// shows up here. scene-hash.json was made from the build before the Prototype 61 split of 004-track.js.
//       node tools/tests/scene-hash.js            MAKE=1 node tools/tests/scene-hash.js  (writes the hashes)
//       ADD=1 node tools/tests/scene-hash.js   (adds the hashes of builds the file lacks, leaving every other as it is)
const fs = require('fs'), path = require('path'), os = require('os');
const { launch, open, ok, done } = require('./lib.js');
const HF = path.join(__dirname, 'scene-hash.json');
const PAGE = process.env.PAGE || path.join(__dirname, '..', '..', 'index.html');
const ERIC = ['NL9A7E2A-N', 'NLEDBAFE-R', 'NQ45F875-P', 'NX130F38-P', 'NX3D7DBD', 'NXD8C77A-P', 'NXFC1ECA-R', 'NXL1FDB51-23224444222-P3443',
  'NXL2CF89D-23224444222-O', 'NXL4ADBF6-F', 'NXL7D6FF6-33224444222-P3443', 'NXL9F9857', 'NXLC4B123-N', 'NXQ5102B5-33224444222-F', 'SLC32957-P',
  'SLE54D5C', 'SXFAB551-R', 'SXL26F230-F', 'SXLB8350A-P', 'W3ADFB8-P', 'W8F8E4D-R', 'WL1861CC-N', 'WX630A48', 'WXL2AAD94-O',
  'WXQD87244-33224444222-P', 'WXL641365-23224444222-O', 'W1AAE848-P'];
// the editor's counts for one new piece (as trackfeat60 writes them)
const KINDS = { vspire: 10, dhelix: 11, drop: 12, sjump: 13, cjump: 14 };
const spec = (k, n) => { const c = Array(15).fill(0); c[KINDS[k]] = n; return '1' + c.join('').replace(/0+$/, '') };
const MORE = ['W2B4C6D', 'S5A5A5A-O', 'N3C3C3C-F', 'WQ777777-N', 'SL0ABCDE-R', 'N0FEDCB-P', 'SX1A2B3C4-U3434', 'NX1B2C3D-F3444',
  'WXL1C4D5E-O3444', 'SX1D00D1E-R3444', 'NXL1E0E0F-N3444', 'WX1F1F1F-U0000', 'SXL1A0B0C4-' + spec('drop', 2) + '-U', 'NXL1C0D0E5-' + spec('sjump', 1) + '-P',
  'WXL10F1F25-' + spec('cjump', 1) + '-R', 'SXL1A0B0C6-' + spec('vspire', 1) + '-F', 'WXL10F1F26-' + spec('dhelix', 1) + '-O'];
// Prototype 62: Spirit realm codes (S), their hashes added with ADD=1 (which writes only the builds the file lacks)
const SPIRIT = ['W1234567-S', 'NX1ABCDEF-S', 'SL1C0FFEE-S', 'NXL1C0D0E5-' + spec('sjump', 1) + '-S', 'WXL10F1F26-' + spec('dhelix', 1) + '-S', 'NXQ5102B5-33224444222-S'];
const CODES = [...ERIC, ...MORE, ...SPIRIT];
const LOW = ['NX130F38-P', 'NXL2CF89D-23224444222-O', 'NXL4ADBF6-F', 'NXLC4B123-N', 'SXFAB551-R', 'WX630A48'];

// the page with a hook of this test's own (tod, RES, the First flight and drill tracks are not in lib.js's hook)
const src = fs.readFileSync(PAGE, 'utf8'), A = 'requestAnimationFrame(frame);\n})();';
if (!src.includes(A)) throw new Error('hook anchor missing in ' + PAGE);
const tmp = path.join(os.tmpdir(), 'hl-scene-hash-' + process.pid + '.html');
fs.writeFileSync(tmp, src.replace(A, 'window.__sh={loadTrack,getT:()=>T,parseCode,setTod:v=>{tod=v},RES,QK_T,qkSpec,qkBio,TR_F,FK};' + A));

// one build's fingerprint, in the page
const HASH = (job) => {
  const h = window.__sh; h.setTod(job.tod); h.RES.low = !!job.low;
  if (job.code) { const c = h.parseCode(job.code); if (!c) return null; h.loadTrack(c.seed, c.wk, c.cx, c.lk, c.sp || null, c.bm) }
  else if (job.quick) h.loadTrack(h.QK_T[job.quick].seed, 'W', false, 'M', h.qkSpec(job.quick), h.qkBio(job.quick));
  else if (job.train) { const n = {}; for (const k of h.FK) n[k] = 0; Object.assign(n, h.TR_F[job.train] || {}); h.loadTrack(0x7A0001 + 'HCPJSRM'.indexOf(job.train) * 0x100, 'W', null, 'M', { b: 1, n, train: job.train }, { k: job.bio, d: [2, 0, 0, 0] }) }
  h.RES.low = false; const T = h.getT();
  let x = 2166136261 >>> 0;
  const u32 = (n) => { x = Math.imul(x ^ (n & 0xff), 16777619); x = Math.imul(x ^ ((n >>> 8) & 0xff), 16777619); x = Math.imul(x ^ ((n >>> 16) & 0xff), 16777619); x = Math.imul(x ^ (n >>> 24), 16777619) >>> 0 };
  const str = (s) => { s = String(s); for (let i = 0; i < s.length; i++) x = Math.imul(x ^ s.charCodeAt(i), 16777619) >>> 0; u32(s.length) };
  const F64 = new Float64Array(1), U64 = new Uint32Array(F64.buffer), num = (v) => { F64[0] = v; u32(U64[0]); u32(U64[1]) };
  const arr = (a) => { if (!a) { str('-'); return } str(a.constructor.name); u32(a.length);
    if (a.buffer && a.BYTES_PER_ELEMENT) { const b = a.BYTES_PER_ELEMENT === 4 ? new Uint32Array(a.buffer, a.byteOffset, a.length) : null; if (b) for (let i = 0; i < b.length; i++) u32(b[i]); else for (let i = 0; i < a.length; i++) num(a[i]) }
    else for (let i = 0; i < a.length; i++) num(+a[i]) };
  const json = (o) => str(JSON.stringify(o, (k, v) => (typeof v === 'function' ? 'fn' : v && v.isVector3 ? [v.x, v.y, v.z] : v)));
  const part = {}; const cut = (k, fn) => { x = 2166136261 >>> 0; fn(); part[k] = x.toString(16) };
  const tex = (t) => { if (!t) { str('no map'); return } str(t.type || 'tex'); num(t.repeat.x); num(t.repeat.y); num(t.wrapS); num(t.anisotropy);
    const im = t.image; if (im && im.getContext) { u32(im.width); u32(im.height); const d = im.getContext('2d').getImageData(0, 0, im.width, im.height).data; for (let i = 0; i < d.length; i += 4) u32(d[i] | (d[i + 1] << 8) | (d[i + 2] << 16) | (d[i + 3] << 24)) } else str(im ? im.width + 'x' + im.height : 'no image') };
  const mat = (m) => { str(m.type); for (const k of ['color', 'emissive']) if (m[k]) u32(m[k].getHex()); for (const k of ['opacity', 'side', 'blending', 'size', 'polygonOffsetFactor']) if (m[k] != null) num(m[k]);
    for (const k of ['transparent', 'depthWrite', 'vertexColors', 'fog', 'sizeAttenuation', 'polygonOffset']) str(k + m[k]);
    tex(m.map); if (m.emissiveMap) tex(m.emissiveMap);
    if (m.uniforms) for (const k of Object.keys(m.uniforms).sort()) { const v = m.uniforms[k].value; str(k); if (typeof v === 'number') num(v); else if (v && v.isColor) u32(v.getHex()); else if (v && v.isVector3) { num(v.x); num(v.y); num(v.z) } }
    if (m.vertexShader && m.type === 'ShaderMaterial') { str(m.vertexShader); str(m.fragmentShader) } if (m.onBeforeCompile) str(String(m.onBeforeCompile)) };
  // the road (as trackfeat60, but every array exactly)
  cut('road', () => { u32(T.N); num(T.L); num(T.ds); for (let i = 0; i < T.N; i++) for (const V of [T.P[i], T.R[i], T.U[i], T.Tg[i]]) { num(V.x); num(V.y); num(V.z) }
    arr(T.H); arr(T.K); arr(T.Kn); arr(T.Cs); arr(T.kind); arr(T.gap); arr(T.spl); arr(T.wallH); arr(T.ctop); arr(T.mag); arr(T.jg); arr(T.tun);
    json(T.feats); json(T.jumps.map((j) => ({ ...j, sp: !!j.sp, stk: !!j.stk }))); json(T.drops); json(T.pads.map((p) => ({ ...p, sp: !!p.sp }))); json(T.zones.map((z) => ({ ...z, sp: !!z.sp }))); json(T.marks);
    for (const S of T.splits) { json({ ...S, b: 0, pts: S.pts.length, adj: 0 }); arr(S.adj); for (const B of S.b) for (const k of Object.keys(B).sort()) arr(B[k]) }
    json([T.bounds, T.stats, T.floorY, T.fig8, T.theme, T.dropped, T.bm, T.wk, T.cx, T.lk]) });
  // the scene, object by object
  let nObj = 0, nVert = 0; const each = [];
  cut('scene', () => { T.group.traverse((o) => { nObj++; if (job.dump) each.push(o.type + ' ' + (o.material && o.material.type) + ' ' + x.toString(16)); str(o.type); str(o.visible + '/' + o.renderOrder + '/' + o.frustumCulled + '/' + o.children.length); arr(o.matrix.elements);
    const g = o.geometry; if (g) { str(g.type); if (g.parameters) json(g.parameters); for (const k of Object.keys(g.attributes).sort()) { str(k); arr(g.attributes[k].array) } arr(g.index && g.index.array); if (g.attributes.position) nVert += g.attributes.position.count }
    if (o.isInstancedMesh) { u32(o.count); arr(o.instanceMatrix.array); arr(o.instanceColor && o.instanceColor.array) }
    if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach(mat) }) });
  part.n = nObj + '/' + nVert; if (job.dump) return each;
  cut('env', () => { const e = T.env; for (const k of ['fallItems', 'lavaItems', 'capItems', 'jelItems', 'kelpItems', 'fishItems', 'schools', 'mantas']) json(e[k]);
    json(e.gItems.map((o) => ({ ...o, g: [o.g.x, o.g.z, o.g.base, o.g.h, o.g.per, o.g.ph, o.g.lava] }))); json([e.k, e.floorY, e.capY, !!e.cave, !!e.sky]) });
  part.info = T.bmInfo;
  const P = T.prism; if (P) cut('prism', () => { json([P.mode, P.caves, P.cal, P.spikes, P.rivers, P.mouths, P.cut, P.lakes && P.lakes.length, P.pools && P.pools.length, P.caveL, (P.meshes || []).length, (P.skirts || []).length, (P.gates || []).length]);
    for (const [a, b] of [[100, 200], [-300, 50], [0, 0], [T.P[0].x, T.P[0].z]]) { num(P.h(a, b)); num(P.f(a, b)); num(P.c(a, b)); num(P.ground(a, b)); num(P.surfH(a, b)); str(P.inside(a, P.h(a, b) - 5, b)) } });
  return part };

(async () => {
  const jobs = [];
  for (const c of CODES) for (const tod of ['night', 'day']) jobs.push({ key: c + '@' + tod, code: c, tod });
  for (const c of LOW) jobs.push({ key: c + '@low', code: c, tod: 'night', low: 1 });
  for (let q = 1; q <= 5; q++) jobs.push({ key: 'quick' + q, quick: q, tod: 'night' });
  for (const [d, bio] of [['J', 'U'], ['S', 'P'], ['R', 'O']]) jobs.push({ key: 'train' + d + '-' + bio, train: d, bio, tod: 'day' });
  const b = await launch(); const p = await open(b, 'scene-hash', { file: tmp });
  // DUMP=code@tod (e.g. WX630A48@night): print the running hash after each object of that build, to find the first that differs
  if (process.env.DUMP) { const [code, tod] = process.env.DUMP.split('@'); console.log((await p.evaluate(HASH, { code, tod: tod || 'night', dump: 1 })).join('\n')); fs.unlinkSync(tmp); await b.close(); return }
  const got = {}, t0 = Date.now();
  for (const j of jobs) got[j.key] = await p.evaluate(HASH, j);
  // and the same again for a few, so a flaky hash (a texture drawn before its font loaded, say) shows as such
  const again = {}; for (const j of jobs.filter((j, i) => i % 9 === 0)) again[j.key] = await p.evaluate(HASH, j);
  const secs = ((Date.now() - t0) / 1000).toFixed(0);
  fs.unlinkSync(tmp);
  const flaky = Object.keys(again).filter((k) => JSON.stringify(again[k]) !== JSON.stringify(got[k]));
  ok(!flaky.length, `a second build of ${Object.keys(again).length} codes hashes the same as the first` + (flaky.length ? ' · differ: ' + flaky.join(' ') : ''));
  if (process.env.ADD) { const have = JSON.parse(fs.readFileSync(HF, 'utf8')), add = Object.keys(got).filter((k) => !have[k]); for (const k of add) have[k] = got[k];
    fs.writeFileSync(HF, JSON.stringify(have, null, 0).replace(/},"/g, '},\n"') + '\n'); console.log('added', add.length, 'builds:', add.join(' ')); await b.close(); return done() }
  if (process.env.MAKE) { fs.writeFileSync(HF, JSON.stringify(got, null, 0).replace(/},"/g, '},\n"') + '\n'); console.log('wrote', HF, Object.keys(got).length, 'builds in', secs, 's'); await b.close(); return done() }
  const want = JSON.parse(fs.readFileSync(HF, 'utf8')); let same = 0; const diff = [];
  for (const k of Object.keys(want)) { const a = got[k], w = want[k]; const bad = Object.keys(w).filter((q) => w[q] !== (a && a[q])); if (bad.length) diff.push(k + ':' + bad.join('/')); else same++ }
  ok(!diff.length && same === Object.keys(want).length, `every build is the same as before: ${same} of ${Object.keys(want).length} (${secs} s)` + (diff.length ? ' · different: ' + diff.join(' ') : ''));
  ok(!p.errs.length, 'no page errors ' + JSON.stringify(p.errs.slice(0, 3)));
  await b.close(); done();
})();
