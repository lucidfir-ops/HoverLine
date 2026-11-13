// Prototype 63: the Spirit realm's underside (track/004t): a split whose second route rolls over the road's edge and runs
// on the underside of the same slab.
//   - bot races (2 laps) on Wide, Standard and Narrow underside tracks run to the end: laps counted as on any track,
//     distance and places never jump, frames take both faces (the AI chooses as at any split), nobody falls or wrecks on
//     it, and every frame on the under face sits on it: its height over the face (along the face's own up, turned with
//     the roll) is the hover, and its up is the face's up (within its own steering lean and nose);
//   - the turn and the press in the route's own frame (kx, kv): a frame upside down feels the road's bends the other way
//     round and its crests as dips;
//   - the chase camera's up follows the roll (within a bound) and nothing of the road stands between it and the frame;
//   - a cannon shot fired on the under face flies on it (drawn on the face) and hits a frame ahead on that face, never one
//     on the top face over it; its ammo strip charges and its boost pads boost a frame on that face only;
//   - a ghost's and a remote ship's pose round-trip which face they ride;
//   - the editor's count builds one on Spirit codes only, round-trips in the code, and its row shows for Spirit only;
//   - how many Spirit tracks get one (about one in five).          node tools/tests/underside.js
const { launch, open, ok, done } = require('./lib.js');
const FS = '1' + '0'.repeat(16) + '1';
const CODES = (process.env.CODES || ['W1B85AB4-S', 'SL14C3D65-S', 'N174B7E1-S', 'NXL128DB8B-S'].join(',')).split(',');

const RACE = (code) => (async () => {
  const H = window.__hl; H.RACE.force = 630031; const c = H.parseCode(code); H.loadTrack(c.seed, c.wk, c.cx, c.lk, c.sp || null, c.bm);
  await H.startRace(); H.S.goAt = null; const T = H.T, SP = T.splits.find((x) => x.kind === 'flip'); if (!SP) return { err: 'no underside' };
  const L = T.L, m = (x) => ((x % L) + L) % L, inS = (r) => m(r.u - SP.u0) <= SP.n * T.ds;
  const st = new Map(); for (const r of H.racers) st.set(r, { ut: r.utot, wr: r.wreck, under: 0, top: 0, was: null, falls: 0 });
  H.player.brPick = { SP, b: SP.fB, long: true };/* the player (a bot here) rides the under face, for the ghost below */const kills = [];
  let t = 0, jWhy = null, utJump = 0, rkJump = 0, onFace = 0, hWorst = 0, upWorst = 0, lifts = 0, walls = 0, nUnder = 0, phMax = 0;
  const V = H.player.ship.position.constructor, a = new V(), up = new V();
  while (t < 700) { const rk0 = H.ranking(); H.step(1 / 60); t += 1 / 60; const rk1 = H.ranking(), resp = H.racers.some((r) => r.wreck <= 0 && st.get(r).wr > 0);
    for (const r of H.racers) { const s = st.get(r);
      const near = m(r.u - SP.u0 + 60) < SP.n * T.ds + 120;/* (on it and 60 m either side) */
      if (near && r.wreck <= 0 && s.wr <= 0 && !resp) { const jd = (r.utot - s.ut) - Math.max(r.v, s.v || 0) / 60 - 1e-6; if (jd > utJump) { utJump = jd; jWhy = { n: r.name, d: Math.round(m(r.u - SP.u0)), v: Math.round(r.v), air: !!r.air, k: r.air && r.air.kind } } rkJump = Math.max(rkJump, Math.abs(rk1.indexOf(r) - rk0.indexOf(r))) }
      const on = inS(r) && r.brS === SP ? (r.br === SP.fB ? 'u' : 't') : null;
      if (on && on !== s.was) { if (on === 'u') s.under++; else s.top++ } if (!inS(r)) s.was = null; else if (on) s.was = on;
      if (r.wreck > 0 && s.wr <= 0 && inS(r)) { if (r.hp > 0) s.falls++; else kills.push(Math.round(m(r.u - SP.u0))) }
      if (on === 'u' && r.wreck <= 0) { nUnder++; if (r.air === true) lifts++; if (r.wallT === H.S.raceT) walls++;
        /* the frame as drawn: over the face by the hover, along the face's up */
        H.placeShip(r, 0); const f = H.surf(m(r.u), r.lat, r, true); phMax = Math.max(phMax, f.ph);
        if (f.ph > 0.05) { onFace++; const sp = H.sampleAt(r.u), rr = sp.r.clone(), uu = sp.u.clone(), aa = f.ph * f.fs, cs = Math.cos(aa), sn = Math.sin(aa);
          up.copy(uu).multiplyScalar(cs).addScaledVector(rr, sn); a.copy(sp.p).addScaledVector(rr, f.cw).addScaledVector(uu, f.h);
          const fr = rr.clone().multiplyScalar(cs).addScaledVector(uu, -sn); a.addScaledVector(fr, r.lat - f.c);
          const h = r.ship.position.clone().sub(a).dot(up), want = r.air ? r.h : 1.05; hWorst = Math.max(hWorst, Math.abs(h - want) - 0.07);
          const su = new V(0, 1, 0).applyQuaternion(r.ship.quaternion); upWorst = Math.max(upWorst, Math.acos(Math.max(-1, Math.min(1, su.dot(up))))) } }
      s.ut = r.utot; s.wr = r.wreck; s.v = r.v }
    if (H.racers.every((r) => r.finishT != null)) break }
  const rs = H.racers;
  return { info: T.bmInfo, L: Math.round(L), side: SP.side, len: Math.round(SP.n * T.ds), t: Math.round(t), fin: rs.filter((r) => r.finishT != null).length, n: rs.length, laps: H.LAPS, done: rs.map((r) => r.done),
    under: rs.map((r) => st.get(r).under), top: rs.map((r) => st.get(r).top), falls: rs.reduce((x, r) => x + st.get(r).falls, 0), utJump: +utJump.toFixed(3), jWhy, rkJump,
    onFace, hWorst: +hWorst.toFixed(3), upWorst: +(upWorst * 180 / Math.PI).toFixed(1), lifts, walls, nUnder, phMax: +phMax.toFixed(2), wrecks: rs.reduce((x, r) => x + r.stat.wrecks, 0), kills,
    times: rs.map((r) => r.finishT && +r.finishT.toFixed(2)) };
})();

/* the frame's own terms: the turn kx and the press kv at the hold and the roll's middle, against the base road's */
const TERMS = (code) => (() => {
  const H = window.__hl, c = H.parseCode(code); H.loadTrack(c.seed, c.wk, c.cx, c.lk, c.sp || null, c.bm); const T = H.T, SP = T.splits.find((x) => x.kind === 'flip'), F = SP.b[SP.fB], Tp = SP.b[SP.tB];
  let kxErr = 0, ends = 0, endsC = 0;
  for (let k = 0; k <= SP.n; k++) { const i = (SP.i0 + k) % T.N, p = F.ph[k], s = SP.side, K = T.K[i], Kn = T.Kn[i];
    kxErr = Math.max(kxErr, Math.abs(K + F.kx[k] - (K * Math.cos(p) + s * Kn * Math.sin(p))));
  }
  ends = Math.abs(F.c[SP.n] - F.cw[SP.n]) + Math.abs(F.c[0] - F.cw[0]); endsC = Math.abs(F.c[SP.n] - F.c[0]);
  const hold = SP.kC + 4, i = (SP.i0 + hold) % T.N;
  return { kxErr, ends: +ends.toFixed(4), endsC: +endsC.toFixed(4), holdKv: +(T.Kn[i] + F.kv[hold]).toFixed(5), baseKn: +T.Kn[i].toFixed(5), holdKx: +(T.K[i] + F.kx[hold]).toFixed(5), baseK: +T.K[i].toFixed(5),
    topNoRoll: !Tp.ph, cMax: +Math.max(...F.c.map(Math.abs)).toFixed(1) } })();

/* the camera: the player on the under face, the race's own chase camera, on a drawing page */
const CAM = (code) => (async () => {
  const H = window.__hl; H.RACE.force = 630032; const c = H.parseCode(code); H.loadTrack(c.seed, c.wk, c.cx, c.lk, c.sp || null, c.bm);
  await H.startRace(); H.S.goAt = null; H.fit(); const T = H.T, SP = T.splits.find((x) => x.kind === 'flip'), me = H.player, cam = H.camera, L = T.L, m = (x) => ((x % L) + L) % L;
  let g = 0; while (m(SP.u0 - me.u) > 150 && g++ < 30000) H.step(1 / 60);
  me.brPick = { SP, b: SP.fB, long: true };
  let worst = 0, n = 0, blocked = 0, under = 0, phMax = 0;
  const meshes = []; T.group.traverse((o) => { if (o.isMesh && o.material && !o.material.transparent) meshes.push(o) });
  let inside = false; for (let k = 0; k < 60 * 14; k++) { H.step(1 / 60); if (!(m(me.u - SP.u0) < SP.n * T.ds)) { if (inside) break; continue } inside = true;
    const f = H.surf(m(me.u), me.lat, me, true); if (me.br === SP.fB) under++; phMax = Math.max(phMax, f.ph);
    const sp = H.sampleAt(me.u), aa = f.ph * f.fs, up = sp.u.clone().multiplyScalar(Math.cos(aa)).addScaledVector(sp.r, Math.sin(aa));
    const a = Math.acos(Math.max(-1, Math.min(1, cam.up.clone().normalize().dot(up)))); worst = Math.max(worst, a); n++;
    /* nothing opaque of the road between the camera and the frame */
    const rc = new THREE.Raycaster(cam.position.clone(), me.ship.position.clone().sub(cam.position).normalize(), 0.3, me.ship.position.distanceTo(cam.position) - 2.5);
    if (rc.intersectObjects(meshes, false).length) blocked++ }
  return { n, under, phMax: +phMax.toFixed(2), worst: +(worst * 180 / Math.PI).toFixed(1), blocked } })();

/* shots, pads and strips on the under face */
const SHOT = (code) => (async () => {
  const H = window.__hl; H.RACE.force = 630033; const c = H.parseCode(code); H.loadTrack(c.seed, c.wk, c.cx, c.lk, c.sp || null, c.bm);
  await H.startRace(); H.S.goAt = null; for (let k = 0; k < 400 && H.S.state !== 'race'; k++) H.step(1 / 60);
  const T = H.T, SP = T.splits.find((x) => x.kind === 'flip'), F = SP.b[SP.fB], ds = T.ds, me = H.player, tg = H.racers[1], tt = H.racers[2];
  const kAt = SP.kC + Math.round(SP.nD * 0.5), uA = SP.u0 + kAt * ds, cA = F.c[kAt], cT = SP.b[SP.tB].c[kAt];
  const put = (r, u, b, lat) => { r.u = r.utot = u; r.brS = SP; r.br = b; r.lat = lat; r.v = 0; r.wreck = 0; r.inv = 0; r.hp = r.d.hp; r.yaw = H.surf(u, lat, r, true).yb };
  for (const r of H.racers) if (r !== me && r !== tg && r !== tt) { r.u = r.utot = uA - 1500; r.v = 0 }
  put(me, uA - 30, SP.fB, cA); put(tg, uA, SP.fB, cA); put(tt, uA - 8, SP.tB, cT + (cA - cA));
  /* the one on the top face sits right over the shot's line in u and across the base road */
  me.weapons = ['cannon', me.weapons[1]]; me.ammo = me.d.ammo; me.cd = [0, 0]; const hpT = tg.hp, hpO = tt.hp; me.v = 0;
  H.fire(me, 0); const s = H.shots[H.shots.length - 1]; let onFace = null, hit = false;
  for (let k = 0; k < 40 && H.shots.includes(s); k++) { for (const r of H.racers) r.v = 0; H.updateShots(1 / 60);
    if (H.shots.includes(s) && onFace == null) { const f = H.surf(s.u, s.lat, s, true), sp = H.sampleAt(s.u), aa = f.ph * f.fs, up = sp.u.clone().multiplyScalar(Math.cos(aa)).addScaledVector(sp.r, Math.sin(aa));
      const a = sp.p.clone().addScaledVector(sp.r, f.cw).addScaledVector(sp.u, f.h); onFace = +s.mesh.position.clone().sub(a).dot(up).toFixed(2) } }
  hit = tg.hp < hpT;
  /* the ammo strip and a pad: the player run over them on the under face, then on the top face */
  const zone = T.zones.find((z) => z.sp === SP), pad = T.pads.find((q) => q.sp === SP), out = { type: s.type, onFace, hit, overHit: tt.hp < hpO };
  const ride = (b) => { put(me, zone.u0 + 2, b, b === SP.fB ? zone.laneF(zone.u0 + 2) : SP.b[SP.tB].c[Math.round((zone.u0 + 2 - SP.u0) / ds)]); me.ammo = 0; me.v = 60; for (let k = 0; k < 30; k++) { me.v = 60; H.step(1 / 60) } return me.ammo };
  out.ammoUnder = +ride(SP.fB).toFixed(1); out.ammoTop = +ride(SP.tB).toFixed(1);
  const boost = (b) => { const lat = b === SP.fB ? pad.latF(pad.u0) : SP.b[SP.tB].c[Math.round((pad.u0 - SP.u0) / ds)]; put(me, pad.u0 - 4, b, lat); me.boost = 0; me.v = 60; for (let k = 0; k < 20; k++) { me.v = 60; H.step(1 / 60) } return me.boost > 0 };
  out.padUnder = boost(SP.fB); out.padTop = boost(SP.tB);
  return out })();

const POSE = (code) => (async () => {
  const H = window.__hl, T = H.T, SP = T.splits.find((x) => x.kind === 'flip'), d = H.rec.d, n = d.length / 7; if (n < 10) return { err: 'no recording' };
  /* the player's recording: the samples on the under face (flag 32) */
  const idx = []; for (let i = 0; i < n; i++) if (d[i * 7 + 6] & 32) idx.push(i);
  const g = H.makeGhost(0, { d: d.slice(), T: 60 }, 1, 'under ghost'); let gw = 0, gs = 0, gb = 0;
  for (const i of idx.filter((x, k) => k % 7 === 3)) { H.ghostPose(g, i / 10); H.placeShip(g, 0); const f = H.surf(g.u, g.lat, g, true); if (g.br === SP.fB) gb++; gs++;
    const sp = H.sampleAt(g.u), aa = f.ph * f.fs, up = sp.u.clone().multiplyScalar(Math.cos(aa)).addScaledVector(sp.r, Math.sin(aa)), a = sp.p.clone().addScaledVector(sp.r, f.cw).addScaledVector(sp.u, f.h).addScaledVector(sp.r.clone().multiplyScalar(Math.cos(aa)).addScaledVector(sp.u, -Math.sin(aa)), g.lat - f.c);
    gw = Math.max(gw, Math.abs(g.ship.position.clone().sub(a).dot(up) - g.h) - 0.07) }
  /* a remote ship on the under face, then on the top face, at the same u */
  const r = H.racers[2]; r.proxy = true; const res = [];
  for (const under of [true, false]) { const u = SP.u0 + (SP.kC + 6) * T.ds, B = SP.b[under ? SP.fB : SP.tB]; r.net = null; r.brS = null; r.br = null;
    const fake = { utot: u, u, lat: B.c[SP.kC + 6], yaw: 0, v: 120, air: false, h: 1.05, pitch: 0, steerS: 0, brk: 0, hp: 50, done: 0, wreck: 0, inv: 0, barrier: 0, boost: 0, d: r.d, stat: r.stat, build: r.build, finishT: null, weapons: [],
      brS: SP, br: under ? SP.fB : SP.tB };
    const pk = H.mpPack(fake); H.mpApply(r, pk, (H.S.raceT || 0) * 1000); H.proxyStep(r, 1 / 60); H.placeShip(r, 0); const sp = H.sampleAt(r.u);
    res.push({ under, flag: !!(pk[8] & 65536), br: r.br === SP.fB ? 'u' : 't', y: +r.ship.position.clone().sub(sp.p).dot(sp.u).toFixed(2) }) }
  r.proxy = false;
  return { nUnder: idx.length, gs, gb, gw: +gw.toFixed(3), res } })();

const ROAD = (code) => (async () => {
  const H = window.__hl, out = {}, c = H.parseCode(code); H.loadTrack(c.seed, c.wk, c.cx, c.lk, c.sp || null, c.bm);
  out.flip = !!H.T.splits.find((x) => x.kind === 'flip'); out.code = H.codeStr(); out.spec = c.sp && c.sp.n.flip;
  const cu = H.parseCode(code.replace(/-S$/, '-U')); H.loadTrack(cu.seed, cu.wk, cu.cx, cu.lk, cu.sp || null, cu.bm); out.urban = !!H.T.splits.find((x) => x.kind === 'flip'); out.urbanDropped = JSON.stringify(H.T.dropped);
  H.loadTrack(c.seed, c.wk, c.cx, c.lk, c.sp || null, c.bm);
  H.openEd('menu'); const row = () => document.querySelector('#edFeats [data-k="flip"]'); out.rowS = !!row() && !row().hidden; H.closeEd(false);
  H.openEd('menu'); H.ed.bm = { k: 'U', d: [2, 0, 0, 0] }; document.querySelector('[data-edw="' + H.ed.wk + '"]').click(); out.rowU = row() ? !row().hidden : false; clearTimeout(H.ed.t); H.ed.dirty = false; document.getElementById('ed').hidden = true; H.showPage('menu');
  /* how many generated Spirit codes get one */
  let a = 0x63f11b, nn = 0, nf = 0; const rnd = () => { a = (Math.imul(a, 1103515245) + 12345) & 0x7fffffff; return a / 0x7fffffff };
  const per = { W: [0, 0], S: [0, 0], N: [0, 0] };
  for (let i = 0; i < +(window.__NRAND || 60); i++) { const s = 0x1000000 + Math.floor(rnd() * 0xffffff), w = 'WSN'[i % 3], cx = rnd() < 0.5, l = ['', 'Q', 'L'][Math.floor(rnd() * 3)], cc = H.parseCode(w + (cx ? 'X' : '') + l + s.toString(16).toUpperCase() + '-S');
    H.loadTrack(cc.seed, cc.wk, cc.cx, cc.lk, null, cc.bm); const f = H.T.splits.some((x) => x.kind === 'flip'); nn++; if (f) nf++; per[w][0]++; if (f) per[w][1]++;
    if (f && H.T.port) { const P0 = H.T.port[0], S0 = H.T.splits.find((x) => x.kind === 'flip'), m = (x) => ((x % H.T.L) + H.T.L) % H.T.L; if (m(P0.uE - S0.u0) < S0.n * H.T.ds) out.overlap = (out.overlap || 0) + 1 } }
  out.rate = [nf, nn]; out.per = per;
  return out })();

(async () => {
  const b = await launch(); const errs = [];
  const page = (k, o = {}) => open(b, 'underside-' + k, Object.assign({ vp: { width: 640, height: 360 }, query: '&bot=1', storage: { 'hoverline.laps': '2' }, init: () => { window.requestAnimationFrame = () => 0 } }, o));
  const allU = [];
  for (const [i, code] of CODES.entries()) {
    const p = await page(code); const R = await p.evaluate(RACE, code); errs.push(...p.errs);
    if (R.err) { ok(false, code + ': ' + R.err); await p.ctx.close(); continue }
    console.log(code, '|', R.info, '| L', R.L, '| underside', R.len, 'm, side', R.side, '|', R.t, 's | under', JSON.stringify(R.under), 'top', JSON.stringify(R.top), '| frames on the face', R.onFace, 'lifts', R.lifts, 'wall steps', R.walls, '| wrecks', R.wrecks, '(destroyed on it at', JSON.stringify(R.kills) + ')');
    allU.push(...R.under);
    ok(R.fin === R.n, code + ': the bot race ran to the end (' + R.fin + ' of ' + R.n + ' finished)');
    ok(R.done.every((d) => d === R.laps), code + ': every racer counted ' + R.laps + ' laps');
    ok(R.under.reduce((a, x) => a + x, 0) > 0 && R.top.reduce((a, x) => a + x, 0) > 0, code + ': frames took both faces (under ' + R.under.reduce((a, x) => a + x, 0) + ', top ' + R.top.reduce((a, x) => a + x, 0) + ' passes)');
    ok(R.falls === 0, code + ': nobody fell or crashed on it (' + R.falls + '; destroyed by shots there: ' + R.kills.length + ')');
    ok(R.utJump <= 0.05 && R.rkJump <= 1, code + ': distance and places never jump on it (utot over v*dt by ' + R.utJump + ' m ' + JSON.stringify(R.jWhy) + '; most places changed in a step ' + R.rkJump + ')');
    ok(R.phMax > 3.1 && R.onFace > 100 && R.hWorst < 0.1, code + ': frames on the under face sit on it, the hover over it along its own up (' + R.onFace + ' frame steps rolled, worst ' + R.hWorst + ' m off)');
    ok(R.upWorst < 40, code + ': and their up is the face\'s up, within their steering lean and nose (worst ' + R.upWorst + ' degrees)');
    const P = i === 0 ? await p.evaluate(POSE, code) : null;
    const Tm = await p.evaluate(TERMS, code); console.log('  terms', JSON.stringify(Tm));
    ok(Tm.kxErr < 1e-6 && Tm.ends < 1e-3 && Tm.endsC < 1e-3 && Tm.topNoRoll, code + ': the turn in the route\'s own frame is the bend turned with the roll, and the route\'s own lateral ends where the road\'s is');
    ok(Math.abs(Tm.holdKv + Tm.baseKn) < 1e-4 && Math.abs(Tm.holdKx + Tm.baseK) < 1e-4, code + ': upside down, a crest is a dip (' + Tm.baseKn + ' to ' + Tm.holdKv + ') and a bend the other way round (' + Tm.baseK + ' to ' + Tm.holdKx + ')');
    if (i === 0) {
      console.log('  ghost and pose', JSON.stringify(P));
      ok(P.nUnder > 20 && P.gb === P.gs && P.gs > 5 && P.gw < 0.1, 'a ghost of a run on the under face rides it again (' + P.gb + ' of ' + P.gs + ' samples, worst ' + P.gw + ' m off the face)');
      ok(P.res[0].flag && P.res[0].br === 'u' && P.res[0].y < -1.8 && !P.res[1].flag && P.res[1].br === 't' && P.res[1].y > 0.5, 'a remote ship\'s pose carries its face: drawn under the road (' + P.res[0].y + ' m) or on it (' + P.res[1].y + ' m)');
      const Q = await p.evaluate(ROAD, code + ''); console.log('  road', JSON.stringify(Q));
      ok(Q.rowS && !Q.rowU, 'the editor shows the Undersides row for the Spirit realm only');
      ok(!Q.overlap, 'an underside never overlaps a portal');
      const r = Q.rate[0] / Q.rate[1]; ok(r >= 0.12 && r <= 0.32, 'about one generated Spirit track in five gets one: ' + Q.rate[0] + ' of ' + Q.rate[1] + ' (' + JSON.stringify(Q.per) + ')');
      const Q2 = await p.evaluate(ROAD, 'S1ABCDE-' + FS + '-S'); console.log('  editor', JSON.stringify({ ...Q2, per: undefined }));
      ok(Q2.flip && Q2.spec === 1 && Q2.code.endsWith('-' + FS + '-S') && !Q2.urban && /flip/.test(Q2.urbanDropped) === false, 'the editor\'s count builds one on a Spirit code (' + Q2.code + ') and nothing on the same code elsewhere');
      const pS = await page('shot', { query: '' }); const Sx = await pS.evaluate(SHOT, code); errs.push(...pS.errs); await pS.ctx.close(); console.log('  shot', JSON.stringify(Sx));
      ok(Sx.hit && !Sx.overHit && Sx.onFace > 0.8 && Sx.onFace < 1.4, 'a cannon shot on the under face flies on it (' + Sx.onFace + ' m over it) and hits the frame ahead on it, not the one on the top face');
      ok(Sx.ammoUnder > 10 && Sx.ammoTop < 1 && Sx.padUnder && !Sx.padTop, 'its ammo strip (' + Sx.ammoUnder + ' ammo) and boost pads work on the under face only');
      const pV = await page('cam', { render: true, storage: { 'hoverline.laps': '2', 'hoverline.orient': 'landscape' } }); const V = await pV.evaluate(CAM, code); errs.push(...pV.errs); await pV.ctx.close(); console.log('  camera', JSON.stringify(V));
      ok(V.under > 100 && V.phMax > 3.1 && V.worst < 20, 'the chase camera\'s up follows the frame round the roll and under the road (worst ' + V.worst + ' degrees over ' + V.n + ' frames)');
      ok(V.blocked <= V.n * 0.01, 'nothing of the road stands between the chase camera and the frame (' + V.blocked + ' of ' + V.n + ' frames)');
    }
    await p.ctx.close();
  }
  ok(errs.length === 0, 'no page errors ' + JSON.stringify(errs.slice(0, 3)));
  await b.close(); done();
})();
