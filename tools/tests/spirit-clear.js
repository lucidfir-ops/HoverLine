// Prototype 62: Eric's rule for the Spirit realm, as a test: nothing ever touches the road, and nothing stands between a
// chase camera and the road ahead. For a dozen Spirit codes (every width, simple and complex, short and long, and the
// Prototype 60 drops, speed jumps, long jumps, rising spires and down spirals), every piece the realm placed is taken
// from its batches and moved on the CPU exactly as its vertex shader moves it (004n: turns, notches, tiers, flights,
// hinges, knots, breathing, the kick's swell, shoals' puffs and scatters, the lattice drawn in), at many moments of its
// motion, and each point is checked against volumes rebuilt here, independently of the game's own check (004o):
//   - the keep-out: in every road sample's frame (main road and every split route), the half width plus 6 m each side,
//     from 4 m under the road to 16 m over it (40 m over jumps, drops and 80 m after them);
//   - the sight lines, every one of them (none left out): from a chase camera 12 m behind and 4.5 m over a racer, on
//     three lines across the road, every 16 m round the lap, to the road's edges and middle every 20 m to 300 m ahead.
// Points are taken every 4 m along each line and at every corner of each solid. A point inside the keep-out, or within
// 0.5 m of a sight line, fails. The moving parts posed each frame (heads, colossi's heads, riders) are checked in
// tools/tests/spirit-race.js, during real bot races.        node tools/tests/spirit-clear.js
const { launch, open, ok, done } = require('./lib.js');
const KINDS = { vspire: 10, dhelix: 11, drop: 12, sjump: 13, cjump: 14 };
const spec = (k, n) => { const c = Array(15).fill(0); c[KINDS[k]] = n; return '1' + c.join('').replace(/0+$/, '') };
const CODES = (process.env.CODES || '').split(',').filter(Boolean).length ? process.env.CODES.split(',') : ['W1234567-S', 'NX1ABCDEF-S', 'SL1C0FFEE-S', 'WX1F1F1F-S', 'NQ1777777-S', 'SXL1A0B0C4-' + spec('drop', 2) + '-S',
  'NXL1C0D0E5-' + spec('sjump', 1) + '-S', 'WXL10F1F25-' + spec('cjump', 1) + '-S', 'SXL1A0B0C6-' + spec('vspire', 1) + '-S', 'WXL10F1F26-' + spec('dhelix', 1) + '-S',
  'NXQ5102B5-33224444222-S', 'WXL641365-23224444222-S'];

const CHECK = (code) => {
  const h = window.__hl, c = h.parseCode(code); h.loadTrack(c.seed, c.wk, c.cx, c.lk, c.sp || null, c.bm);
  const T = h.T, sp = T.env.spirit, N = T.N, ds = T.ds, P = T.P, R = T.R, U = T.U, Tg = T.Tg, hw = h.W / 2, M = 6, BEL = 4, AB = 16, JAB = 40;
  if (!sp) return { code, err: 'no realm' };
  /* the keep-out */
  const air = new Uint8Array(N), mark = (u0, u1) => { for (let u = u0; u <= u1; u += ds) air[(((Math.round(u / ds)) % N) + N) % N] = 1 };
  for (const j of T.jumps || []) mark(j.u0 - 30, j.u1 + 80); for (const d of T.drops || []) if (d.u0 != null) mark(d.u0 - 30, (d.u1 != null ? d.u1 : d.u0) + 80);
  for (const f of T.feats || []) if (f.kind === 'drop' || f.kind === 'sjump' || f.kind === 'cjump') mark(f.u0 - 30, f.u1 + 80);
  const C = 20, G = new Map(), key = (a, b, c) => ((a + 4096) * 8192 + (b + 4096)) * 8192 + (c + 4096), S = [];
  const add = (p, r, u, t, w, ab) => { const s = { x: p.x, y: p.y, z: p.z, r, u, t, w, ab }; S.push(s); const k = key(Math.floor(p.x / C), Math.floor(p.y / C), Math.floor(p.z / C)); let L = G.get(k); if (!L) G.set(k, L = []); L.push(s) };
  for (let i = 0; i < N; i++) { if (T.gap[i] && !air[i]) continue; add(P[i], R[i], U[i], Tg[i], hw, air[i] ? JAB : AB) }
  for (const S0 of T.splits) for (const B of S0.b) for (let k = 0; k <= S0.n; k++) { const i = (S0.i0 + k) % N, p = P[i].clone().addScaledVector(R[i], B.c[k]).addScaledVector(U[i], B.h[k]); add(p, R[i], U[i], Tg[i], B.w[k], air[i] ? JAB : AB) }
  const maxW = Math.max(...S.map((s) => s.w));
  const inKeep = (x, y, z) => { const rr = maxW + M + ds, c0 = Math.floor((x - rr) / C), c1 = Math.floor((x + rr) / C), d0 = Math.floor((y - JAB - 2) / C), d1 = Math.floor((y + BEL + 2) / C), e0 = Math.floor((z - rr) / C), e1 = Math.floor((z + rr) / C);
    for (let a = c0; a <= c1; a++) for (let b = Math.min(d0, Math.floor((y - rr) / C)); b <= Math.max(d1, Math.floor((y + rr) / C)); b++) for (let cc = e0; cc <= e1; cc++) { const L = G.get(key(a, b, cc)); if (!L) continue;
      for (const s of L) { const dx = x - s.x, dy = y - s.y, dz = z - s.z; if (Math.abs(dx * s.t.x + dy * s.t.y + dz * s.t.z) > ds * 0.6) continue; if (Math.abs(dx * s.r.x + dy * s.r.y + dz * s.r.z) > s.w + M) continue;
        const hh = dx * s.u.x + dy * s.u.y + dz * s.u.z; if (hh > -BEL && hh < s.ab) return true } } return false };
  /* every sight line */
  const SG = 30, SL = [], SM = new Map(), sk = (a, b, c) => ((a + 2048) * 4096 + (b + 2048)) * 4096 + (c + 2048), st = Math.round(16 / ds), tt = Math.round(20 / ds), back = Math.round(12 / ds);
  const pt = (i, l, hh) => [P[i].x + R[i].x * l + U[i].x * hh, P[i].y + R[i].y * l + U[i].y * hh, P[i].z + R[i].z * l + U[i].z * hh];
  for (let i = 0; i < N; i += st) { if (T.gap[i]) continue; const ic = (i - back + N) % N;
    for (const cl of [-hw * 0.6, 0, hw * 0.6]) { const a = pt(ic, cl, 5.5); for (let k = 1; k <= 15; k++) { const it = (i + k * tt) % N; if (T.gap[it]) continue; for (const tl of [-hw, 0, hw]) { const b = pt(it, tl, 1), n = SL.push([...a, ...b]) - 1, len = Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]), m = Math.ceil(len / (SG / 2)), seen = new Set();
      for (let q = 0; q <= m; q++) { const f = q / m; seen.add(sk(Math.floor((a[0] + (b[0] - a[0]) * f) / SG), Math.floor((a[1] + (b[1] - a[1]) * f) / SG), Math.floor((a[2] + (b[2] - a[2]) * f) / SG))) }
      for (const kk of seen) { let L = SM.get(kk); if (!L) SM.set(kk, L = []); L.push(n) } } } } }
  const nearSight = (x, y, z) => { const r = 0.5, cx = Math.floor(x / SG), cy = Math.floor(y / SG), cz = Math.floor(z / SG);
    for (let a = cx - 1; a <= cx + 1; a++) for (let b = cy - 1; b <= cy + 1; b++) for (let c2 = cz - 1; c2 <= cz + 1; c2++) { const L = SM.get(sk(a, b, c2)); if (!L) continue;
      for (const n of L) { const s = SL[n], ux = s[3] - s[0], uy = s[4] - s[1], uz = s[5] - s[2], l2 = ux * ux + uy * uy + uz * uz, f = Math.max(0, Math.min(1, ((x - s[0]) * ux + (y - s[1]) * uy + (z - s[2]) * uz) / l2)), dx = s[0] + ux * f - x, dy = s[1] + uy * f - y, dz = s[2] + uz * f - z;
        if (dx * dx + dy * dy + dz * dz < r * r) return true } } return false };
  /* the shader's motion, on the CPU (004n) */
  const V3 = T.P[0].constructor, sst = (x) => { x = Math.max(0, Math.min(1, x)); return x * x * (3 - 2 * x) };
  const rotA = (v, k, a) => { const c = Math.cos(a), s = Math.sin(a), d = k[0] * v[0] + k[1] * v[1] + k[2] * v[2], cx = [k[1] * v[2] - k[2] * v[1], k[2] * v[0] - k[0] * v[2], k[0] * v[1] - k[1] * v[0]]; return [v[0] * c + cx[0] * s + k[0] * d * (1 - c), v[1] * c + cx[1] * s + k[1] * d * (1 - c), v[2] * c + cx[2] * s + k[2] * d * (1 - c)] };
  const rotQ = (q, v) => { const t = [2 * (q[1] * v[2] - q[2] * v[1]), 2 * (q[2] * v[0] - q[0] * v[2]), 2 * (q[0] * v[1] - q[1] * v[0])]; return [v[0] + q[3] * t[0] + (q[1] * t[2] - q[2] * t[1]), v[1] + q[3] * t[1] + (q[2] * t[0] - q[0] * t[2]), v[2] + q[3] * t[2] + (q[0] * t[1] - q[1] * t[0])] };
  const ang = (m, tm) => { const [md, rate, ph, amt] = m; if (md < 0.5) return 0; if (md < 1.5) return rate * tm.t + ph; if (md < 2.5) return ph + rate * (Math.floor(tm.b) + sst((tm.b % 1) * 3));
    if (md < 3.5) return ph + rate * (Math.floor(tm.b / 4) + sst(((tm.b / 4) % 1) * 4)) + amt * tm.t; if (md > 6.5 && md < 7.5) { const cc = ((tm.b / 8 + ph) % 1 + 1) % 1; return amt * sst(cc * 4) * (1 - sst(cc * 4 - 2.2)) } return 0 };
  const breath = (amt, tm) => 1 + amt * (0.6 * tm.br + 0.4 * tm.k);
  /* moments: time, beat, kick, breath, group progress, drop, tight; the beats chosen so every notch, tier and hinge is seen */
  const TM = []; for (let q = 0; q < 24; q++) TM.push({ t: q * 7.3, b: q * 1.37 + (q % 4) * 0.25, k: q % 3 === 0 ? 1 : 0, br: [1, -1, 0][q % 3], g: [0, 0.25, 0.5, 0.75, 1, 1][q % 6], drop: q % 5 === 0 ? 1 : 0, tight: [0, 0.13, 0.26][q % 3] });
  /* the colossi's gestures at their extremes, alone and together with the drop's raised arms */
  const COL_POSES = []; for (const g of [{}, { aR: 0.72, wv: 1 }, { aL: 0.72, wv: 1 }, { lean: 0.14 }, { bow: 0.55 }, { aR: 0.9, aL: 0.9 }, { wt: 1 }]) for (const drop of [0, 0.9]) COL_POSES.push({ lean: 0, bow: 0, aR: 0, aL: 0, wv: 0, wt: 0, ...g, ...(drop ? { aR: Math.max(g.aR || 0, drop), aL: Math.max(g.aL || 0, drop) } : {}) });
  const fails = {}, counts = {}, bad = [];let cur = null;
  const test = (kind, x, y, z) => { counts[kind] = (counts[kind] || 0) + 1; let w = null; if (inKeep(x, y, z)) w = 'keep-out'; else if (nearSight(x, y, z)) w = 'sight'; if (w) { fails[kind + ' ' + w] = (fails[kind + ' ' + w] || 0) + 1; if (bad.length < 12 && !bad.some((q) => q[5] === cur)) bad.push([kind, w, Math.round(x), Math.round(y), Math.round(z), cur]) } };
  const A = (g, k, i) => { const a = g.attributes[k]; return a ? [a.array[i * 4], a.array[i * 4 + 1], a.array[i * 4 + 2], a.array[i * 4 + 3]] : null };
  for (const m of sp.meshes) { const g = m.geometry, n = g.instanceCount;
    if (g.attributes.iO) { /* wire solids: every corner (the shape's own vertices) */
      const pos = g.attributes.position, vs = []; const seen = new Set(); for (let v = 0; v < pos.count; v++) { const kk = pos.getX(v).toFixed(3) + pos.getY(v).toFixed(3) + pos.getZ(v).toFixed(3); if (!seen.has(kk)) { seen.add(kk); vs.push([pos.getX(v), pos.getY(v), pos.getZ(v)]) } }
      for (let i = 0; i < n; i++) { cur = 'w' + i + ' C' + A(g, 'iC', i).map(Math.round) + ' M' + A(g, 'iM', i).map((x) => +x.toFixed(2)) + ' S' + A(g, 'iS', i).map(Math.round); const iC = A(g, 'iC', i), iQ = A(g, 'iQ', i), iO = A(g, 'iO', i), iB = A(g, 'iB', i), iS = A(g, 'iS', i), iM = A(g, 'iM', i), iX = A(g, 'iX', i), iF = A(g, 'iF', i), iI = A(g, 'iI', i);
        const md = iM[0], moving = md > 0.5 || iC[3] > 0, times = moving ? TM : [TM[0]];
        for (const tm of times) for (const v0 of vs) { let v = [v0[0] * iS[0], v0[1] * iS[1], v0[2] * iS[2]];
          if (md > 3.5 && md < 4.5) { const stp = Math.floor(tm.b), f = tm.b % 1, on = Math.abs(((stp % iM[1]) + iM[1]) % iM[1] - iM[2]) < 0.5 ? 1 : 0; v = rotA(v, [0, 1, 0], on * sst(f * 2.5 - 0.6) * Math.PI / 2 * Math.sign(iM[3])); v[0] += on * (sst(f * 3) - sst(f * 3 - 2)) * iM[3] }
          let b = rotQ(iB, v);
          if (md > 4.5 && md < 5.5) { const gk = sst((tm.g * 1.6 - iF[3]) / 1.1), j = 1 - gk, mid = [(iO[0] + iF[0]) / 2, (iO[1] + iF[1]) / 2 + iI[2], (iO[2] + iF[2]) / 2]; b = rotA(b, iX, Math.sin(Math.PI * gk) * iM[1]); for (let q = 0; q < 3; q++) b[q] += iO[q] * j * j + mid[q] * 2 * gk * j + iF[q] * gk * gk }
          else { b = [b[0] + iO[0], b[1] + iO[1], b[2] + iO[2]]; b = rotA(b, iX, ang(iM, tm)); if (md > 2.5 && md < 3.5) b = b.map((x) => x * (1 + 0.05 * tm.k)); if (md > 0.5 && md < 1.5) b[1] += Math.sin(tm.t * 0.4 + iM[2]) * iM[3] }
          const s = breath(iC[3], tm), w = rotQ(iQ, [b[0] * s, b[1] * s, b[2] * s]); test(md > 4.5 && md < 5.5 ? 'flying blocks' : 'wire solids', iC[0] + w[0], iC[1] + w[1], iC[2] + w[2]) } } }
    else if (g.attributes.sA) { /* neon lines: points every 4 m; the posed slots (heads, riders, echoes) are checked in races */
      const knot = !!g.attributes.sA2;
      for (let i = 0; i < n; i++) { cur = 'l' + i + ' C' + A(g, 'iC', i).map(Math.round) + ' M' + A(g, 'iM', i).map((x) => +x.toFixed(2)) + ' A' + A(g, 'sA', i).map(Math.round); const sA = A(g, 'sA', i), sB = A(g, 'sB', i), iC = A(g, 'iC', i), iQ = A(g, 'iQ', i), iM = A(g, 'iM', i), iX = A(g, 'iX', i), iP = A(g, 'iP', i), a2 = knot ? A(g, 'sA2', i) : null, b2 = knot ? A(g, 'sB2', i) : null;
        if (iM[0] > 7.5 && (iP[3] < 4 || iP[3] > 6)) continue; /* heads, riders: posed in races (spirit-race.js) */
        if (iM[0] > 7.5) { /* Prototype 63: a colossus's torso, arms and head, through every gesture (004n colG) and every yaw of its head: lean 0 to 0.14,
            bow to 0.55, arms 0 to 0.9 of a half turn (waving +-0.2 rad), turn to watch; the shader's order: part, head's bow and yaw, body yaw, lean */
          const len = Math.hypot(sB[0] - sA[0], sB[1] - sA[1], sB[2] - sA[2]), nn = Math.max(1, Math.ceil(len / 40)), isHead = iM[0] < 8.5;
          for (const ps of COL_POSES) for (const yw of [-1.2, 0, 1.2]) for (let q = 0; q <= nn; q++) { const f = q / nn;
            let qv = [sA[0] + (sB[0] - sA[0]) * f - iP[0], sA[1] + (sB[1] - sA[1]) * f - iP[1], sA[2] + (sB[2] - sA[2]) * f - iP[2]];
            if (!isHead) { if (iM[2] > 0.5) { const a = iM[2] < 1.5 ? ps.aL : ps.aR, sd = iM[2] < 1.5 ? -1 : 1; qv = rotA(qv, [0, 0, 1], sd * (Math.PI * a + 0.2 * ps.wv * (a >= 0.3 ? 1 : 0))) } }
            else { qv = rotA(qv, [1, 0, 0], ps.bow); qv = rotA(qv, [0, 1, 0], yw * (1 - 0.55 * ps.wt)) }
            qv = [qv[0] + iP[0], qv[1] + iP[1], qv[2] + iP[2]]; qv = rotA(rotA(qv, [0, 1, 0], 0.55 * yw * ps.wt), [1, 0, 0], ps.lean);
            const w = rotQ(iQ, qv); test('colossi (gestures)', iC[0] + w[0], iC[1] + w[1], iC[2] + w[2]) }
          continue }
        const md = iM[0], times = md > 0.5 || iC[3] > 0 || knot ? TM : [TM[0]], len = Math.hypot(sB[0] - sA[0], sB[1] - sA[1], sB[2] - sA[2]), nn = Math.max(1, Math.ceil(len / 4));
        for (const tm of times) { const mk = knot ? sst(Math.sin(tm.b * 0.098 + iM[2]) * 1.4 + 0.5) : 0;
          for (let q = 0; q <= nn; q++) { const f = q / nn; let p = [sA[0] + (sB[0] - sA[0]) * f, sA[1] + (sB[1] - sA[1]) * f, sA[2] + (sB[2] - sA[2]) * f];
            if (knot) { const p2 = [a2[0] + (b2[0] - a2[0]) * f, a2[1] + (b2[1] - a2[1]) * f, a2[2] + (b2[2] - a2[2]) * f]; p = p.map((x, k) => x + (p2[k] - x) * mk) }
            let qv = [p[0] - iP[0], p[1] - iP[1], p[2] - iP[2]];
            qv = rotA(qv, iX, ang(iM, tm)); qv = [qv[0] + iP[0], qv[1] + iP[1], qv[2] + iP[2]]; if (md > 0.5 && md < 1.5) qv[1] += Math.sin(tm.t * 0.4 + iM[2]) * iM[3];
            const s = breath(iC[3], tm), w = rotQ(iQ, [qv[0] * s, qv[1] * s, qv[2] * s]); test(knot ? 'knots' : 'lines', iC[0] + w[0], iC[1] + w[1], iC[2] + w[2]) } } } }
    else if (g.attributes.fH) { /* shoals: each fish at its farthest (puffed, scattered, loose) */
      for (let i = 0; i < n; i++) { const fH = A(g, 'fH', i), fD = A(g, 'fD', i), fC = A(g, 'fC', i), fK = A(g, 'fK', i);
        for (const tm of TM.slice(0, 8)) { let hh = [fH[0], fH[1], fH[2]]; if (fC[3] !== 0) { const r = rotA([hh[0] - fC[0], hh[1] - fC[1], hh[2] - fC[2]], [0, 1, 0], tm.t * fC[3]); hh = [fC[0] + r[0], fC[1] + r[1], fC[2] + r[2]] }
          const amp = fK[1], wob = [Math.sin(tm.t * 1.3 + fH[3] * 7), Math.sin(tm.t * 1.1 + fH[3] * 5) * 0.6, Math.cos(tm.t * 1.2 + fH[3] * 3)].map((x) => x * amp), sc = amp * (0.25 * tm.k + 1.6 * tm.drop);
          test('shoals', hh[0] + wob[0] + fD[0] * sc, hh[1] + wob[1] + fD[1] * sc, hh[2] + wob[2] + fD[2] * sc) } } }
    else if (g.attributes.lA) { /* the lattice: every strut, every 4 m, drawn in by 0, half and all of its build tightening */
      for (let i = 0; i < n; i++) { const a = A(g, 'lA', i), b = A(g, 'lB', i), an = A(g, 'lN', i), bn = A(g, 'lM', i), len = Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]), nn = Math.max(1, Math.ceil(len / 4));
        for (const tg of [0, 0.13, 0.26]) { const pa = [0, 1, 2].map((k) => a[k] + (an[k] - a[k]) * tg), pb = [0, 1, 2].map((k) => b[k] + (bn[k] - b[k]) * tg); for (let q = 0; q <= nn; q++) { const f = q / nn; test('lattice', pa[0] + (pb[0] - pa[0]) * f, pa[1] + (pb[1] - pa[1]) * f, pa[2] + (pb[2] - pa[2]) * f) } } } } }
  return { code, L: Math.round(T.L), q: sp.q, colossi: sp.colossi.length, info: T.bmInfo, rays: SL.length, counts, fails, bad, placed: sp.stats.placed, dropped: sp.stats.dropped, why: sp.why };
};

(async () => {
  const b = await launch(); const p = await open(b, 'spirit-clear', { vp: { width: 480, height: 270 }, init: () => { window.requestAnimationFrame = () => 0 } });
  let tot = 0;
  for (const code of CODES) {
    const t0 = Date.now(), r = await p.evaluate(CHECK, code), n = Object.values(r.counts || {}).reduce((a, x) => a + x, 0), nf = Object.values(r.fails || {}).reduce((a, x) => a + x, 0); tot += n;
    console.log(code, 'L', r.L, 'q', r.q, '|', r.info, '| colossi', r.colossi, '| points', n, 'sight lines', r.rays, '| placed', r.placed, 'left out', r.dropped, JSON.stringify(r.why), Math.round((Date.now() - t0) / 100) / 10 + ' s');
    ok(!r.err && nf === 0, code + ': every point of every piece, through its motion, clear of the road and of every sight line' + (nf ? ' (fails: ' + JSON.stringify(r.fails) + ' e.g. ' + JSON.stringify(r.bad) + ')' : ''));
  }
  ok(tot > 1e6, 'checked ' + tot + ' points in all');
  ok(p.errs.length === 0, 'no page errors');
  await b.close(); done();
})();
