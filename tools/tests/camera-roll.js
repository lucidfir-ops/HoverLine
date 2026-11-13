// Prototype 64: the chase camera through corkscrews, twists and helixes, at Redline in a Tether, boosted, flown by the
// autopilot (Eric: "sometimes on corkscrews the camera can't keep up"). For every frame of the stretch it measures the
// angle between the camera's up and the road's up under the ship (how far the picture rolls against the road), and how
// far the ship sits from where it sits on the straight before it (as a fraction of the half screen), for each camera
// (Near, Standard, Far, Cockpit; the cockpit's ship is hidden, so only its up counts) and for the split-screen cameras
// (two local pilots). Before the change a corkscrew or twist rolled the picture 24 to 32 degrees off the road; the
// bounds below are the numbers after, with some room. Loops are measured and not tightened (the camera's lag in a loop
// is its pitch, not its roll): they must stay as they were (45 degrees in this flight, before and after). Prints every run; ONLY=corkscrew,twist CAMS=1 PER=2 narrow it.
//       node tools/tests/camera-roll.js
const { launch, open, ok, done } = require('./lib.js');
const KINDS = ['corkscrew', 'twist', 'helix', 'loop'];
const PER = +(process.env.PER || 3);
// bounds: the worst angle (degrees) between the camera's up and the road's, and the most the ship drifts from its place on the straight
const UP = { corkscrew: 9, twist: 9, helix: 6, loop: 46 }, DRIFT = 0.08;
const RUN = ({ per, kinds, cams }) => (async () => {
  const H = window.__hl; let a = 0x64ca3e7; const rnd = () => { a = (Math.imul(a, 1103515245) + 12345) & 0x7fffffff; return a / 0x7fffffff };
  const out = {}, got = {}; for (const k of kinds) got[k] = 0; const proj = new THREE.Vector3();
  /* one stretch: pilots [r, camera, state of the camera's smoothing is the game's own]; returns the worst up angle and drift per pilot */
  const fly = async (code, f, split, cms) => { const c = H.parseCode(code); H.build.frame = 'tether'; H.S.cls = 1; H.loadTrack(c.seed, c.wk, c.cx, c.lk, c.sp || null, c.bm);
    if (split) { H.SPL.pilots.length = 0; cms.forEach((cm, k) => H.SPL.pilots.push({ src: 'pad', pad: k, cm })); H.SPL.laps = 1; H.splGo() } else { await H.startRace(); document.querySelectorAll('[data-cam]').forEach((b) => b.dataset.cam == cms[0] && b.click()) }
    H.S.goAt = null; H.fit(); const T = H.T, L = T.L, m = (x) => ((x % L) + L) % L, me = H.player;
    const pil = split ? H.SPL.pilots.map((P) => ({ r: P.r, cam: P.cam, cm: P.cm })) : [{ r: me, cam: H.camera, cm: cms[0] }];
    for (const r of H.racers) if (!pil.some((q) => q.r === r)) { r.u = r.utot = m(f.u0 - 3000); r.v = 0 }
    pil.forEach((q, k) => { q.r.u = q.r.utot = m(f.u0 - 260 - k * 30); q.r.v = 150; q.up = 0; q.off = 0; q.offB = null; q.n = 0; q.wr = 0 });
    for (let g = 0; g < 400 && H.S.state !== 'race'; g++) H.step(1 / 60); const end = f.u1 + 40;
    for (let k = 0; k < 60 * 14 && pil.some((q) => !q.done && !q.wr); k++) { for (const q of pil) q.r.boost = 99;
      H.step(1 / 60);
      for (const q of pil) { if (q.done || q.wr) continue; if (q.r.wreck > 0) { q.wr = 1; continue }
        const d = m(q.r.u - f.u0), inF = d < f.u1 - f.u0 + 40;
        const s = H.sampleAt(q.r.u), cu = q.cam.up.clone().normalize(), ang = Math.acos(Math.max(-1, Math.min(1, cu.dot(s.u))));
        q.cam.updateMatrixWorld(); proj.copy(q.r.ship.position).project(q.cam); const o = Math.hypot(proj.x, proj.y);
        if (!inF) { if (q.n) q.done = true; else if (d > L - 60) q.offB = o; continue }
        q.up = Math.max(q.up, ang); q.off = Math.max(q.off, o); q.n++ } }
    return pil.map((q) => ({ cm: q.cm, up: +(q.up * 180 / Math.PI).toFixed(1), drift: q.cm === 3 || q.offB == null ? null : +(q.off - q.offB).toFixed(2), n: q.n, wr: q.wr, off: +q.off.toFixed(2), offB: q.offB == null ? null : +q.offB.toFixed(2) })) };
  for (let tries = 0; tries < 400 && kinds.some((k) => got[k] < per); tries++) {
    const code = 'WSN'[tries % 3] + 'XL1' + Math.floor(rnd() * 0xefffff).toString(16).toUpperCase().padStart(6, '0'), c = H.parseCode(code);
    H.loadTrack(c.seed, c.wk, c.cx, c.lk, c.sp || null, c.bm); const T = H.T;
    for (const kind of kinds.filter((k) => got[k] < per && T.feats.some((f) => f.kind === k))) { const f = T.feats.find((q) => q.kind === kind); got[kind]++;
      for (const cm of cams) for (const x of await fly(code, f, false, [cm])) (out[kind] = out[kind] || []).push({ code, ...x });
      if (kind !== 'loop' && got[kind] <= 2) for (const x of await fly(code, f, true, [1, 2])) (out['split-' + kind] = out['split-' + kind] || []).push({ code, ...x }) } }
  return out })();
/* the rest of the road: a lap of a complex track by the autopilot, the camera's up against the road's and how much it turns in a frame,
   over the stretches that are not corkscrews, twists or loops (where the rate stays under the 0.8 a second the faster follow starts at) */
const LAP = (code) => (async () => { const H = window.__hl, c = H.parseCode(code); H.build.frame = 'tether'; H.S.cls = 1; H.loadTrack(c.seed, c.wk, c.cx, c.lk, c.sp || null, c.bm); await H.startRace(); H.S.goAt = null; H.fit();
  const T = H.T, L = T.L, me = H.player, cam = H.camera, spans = T.feats.filter((f) => ['corkscrew', 'twist', 'loop', 'sdrop', 'portal'].includes(f.kind)).map((f) => [f.u0 - 60, f.u1 + 120]), m = (x) => ((x % L) + L) % L;
  for (const r of H.racers) if (r !== me) { r.u = r.utot = m(me.u - 3000); r.v = 0 }
  let prev = null, worst = 0, step = 0, n = 0, sum = 0, t = 0; for (let k = 0; k < 60 * 75 && me.done < 1 && me.wreck <= 0; k++) { H.step(1 / 60); const u = m(me.u); if (spans.some(([a, b]) => u > a && u < b) || k < 120) { prev = null; continue }
    const s = H.sampleAt(me.u), cu = cam.up.clone().normalize(), ang = Math.acos(Math.max(-1, Math.min(1, cu.dot(s.u)))) * 180 / Math.PI; worst = Math.max(worst, ang); sum += ang; n++;
    if (prev) step = Math.max(step, Math.acos(Math.max(-1, Math.min(1, cu.dot(prev)))) * 180 / Math.PI); prev = cu }
  return { n, worst: +worst.toFixed(1), mean: +(sum / Math.max(1, n)).toFixed(2), step: +step.toFixed(2), done: me.done, wreck: me.wreck > 0, u: Math.round(me.u), L: Math.round(L) } })();
(async () => {
  const b = await launch(); const p = await open(b, 'camroll', { vp: { width: 1280, height: 720 }, render: true, query: '&bot=1' });
  const cams = (process.env.CAMS || '0,1,2,3').split(',').map(Number), kinds = (process.env.ONLY || KINDS.join(',')).split(',');
  const r = await p.evaluate(RUN, { per: PER, kinds, cams });
  for (const k of Object.keys(r)) { console.log(k); for (const x of r[k]) console.log('  ', JSON.stringify(x)) }
  for (const k of Object.keys(r)) { const kind = k.replace('split-', ''), a = r[k], up = Math.max(...a.map((x) => x.up)), dr = Math.max(...a.map((x) => x.drift == null ? 0 : x.drift)), wr = a.filter((x) => x.wr).length;
    ok(a.length > 0 && a.every((x) => x.n > 40), `${k}: ${a.length} runs, each flew the stretch`);
    ok(up <= UP[kind], `${k}: the camera's up stays within ${UP[kind]} degrees of the road's (worst ${up})`);
    if (kind !== 'loop') ok(dr <= DRIFT, `${k}: the ship stays within ${DRIFT} of where it sits on the straight (worst ${dr}, ${wr} wrecks)`) }
  if (!process.env.ONLY) for (const code of ['WXL1D9F12A', 'SXL172F185']) { const l = await p.evaluate(LAP, code); console.log('lap', code, JSON.stringify(l));
    ok(l.n > 800 && l.worst < 18 && l.step < 5, `a lap elsewhere on ${code}: the up stays within ${l.worst} degrees of the road's (mean ${l.mean}), turning at most ${l.step} degrees a frame`) }
  await b.close(); done();
})();
