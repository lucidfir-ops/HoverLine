// Prototype 63: the Spirit realm's portal jump (track/004s-portals.js).
//   - the road: the break (sampleAt is always at the entrance's side or the exit's, never between), u runs straight
//     through it, the editor's count builds one on Spirit codes only (and its row shows only for the Spirit realm);
//   - bot races (2 laps) on Wide (across, 49, and diagonal, 50), Standard and Narrow codes run to the end: everyone flies
//     the portal jump every lap, nobody falls in it, utot never jumps at the crossing, positions change by at most one
//     place at a crossing, laps are counted as on any track;
//   - a cannon shot fired before the entrance comes out of the exit and hits a frame beyond it;
//   - a ghost's and a remote ship's pose (u, sent and replayed) draw on the right side of the break;
//   - the camera through the crossing: its offset from the frame turns with the portal (no swing, no jump);
//   - the view through the portal is drawn only while an entrance is ahead, in view and within 300 m (none behind it, far
//     away, on Ultra low or in split screen), and what it costs (draw calls, triangles).      node tools/tests/portals.js
const { launch, open, ok, done } = require('./lib.js');
const SP = '1' + '0'.repeat(15) + '1';
const CODES = (process.env.CODES || ['W1234567-' + SP + '-S', 'WX1ABCDE-' + SP + '-S', 'SL19E3779-' + SP + '-S', 'NL19E3779-' + SP + '-S'].join(',')).split(',');

const RACE = (code) => (async () => {
  const H = window.__hl; H.RACE.force = 630001; const c = H.parseCode(code); H.loadTrack(c.seed, c.wk, c.cx, c.lk, c.sp || null, c.bm);
  await H.startRace(); H.S.goAt = null; const T = H.T, o = T.port[0], L = T.L, m = (x) => ((x % L) + L) % L;
  const st = new Map(); for (const r of H.racers) st.set(r, { u: r.u, ut: r.utot, fl: 0, wr: r.wreck, bad: 0, rk: 0, rkJump: 0, falls: 0 });
  let t = 0, cross = 0, maxRankJump = 0, utJump = 0;
  while (t < 700) { const rk0 = H.ranking(); H.step(1 / 60); t += 1 / 60; const rk1 = H.ranking();
    for (const r of H.racers) { const s = st.get(r), d = m(o.uE - s.u), du = m(r.u - s.u);
      if (r.wreck > 0 && s.wr <= 0 && r.hp > 0 && m(r.u - o.uE) < 700) s.falls++;
      if (d > 0 && d <= du && du < L / 2 && r.wreck <= 0) { cross++; maxRankJump = Math.max(maxRankJump, Math.abs(rk1.indexOf(r) - rk0.indexOf(r))); utJump = Math.max(utJump, (r.utot - s.ut) - r.v / 60 - 1) }
      if (r.air && r.air.kind === 'portal' && !s.inAir) s.fl++; s.inAir = !!(r.air && r.air.kind === 'portal');
      s.u = r.u; s.ut = r.utot; s.wr = r.wreck }
    if (H.racers.every((r) => r.finishT != null)) break }
  const rs = H.racers;
  return { info: T.bmInfo, pv: o.pv, L: Math.round(L), t: Math.round(t), fin: rs.filter((r) => r.finishT != null).length, n: rs.length, laps: H.LAPS,
    done: rs.map((r) => r.done), flights: rs.map((r) => st.get(r).fl), falls: rs.reduce((a, r) => a + st.get(r).falls, 0), cross, maxRankJump, utJump: +utJump.toFixed(2),
    wrecks: rs.reduce((a, r) => a + r.stat.wrecks, 0), recN: H.rec.d.length };
})();

/* sampleAt at the break, the editor's count, a shot, a ghost, a remote pose */
const ROAD = (code) => (async () => {
  const H = window.__hl, out = {}; let c = H.parseCode(code); H.loadTrack(c.seed, c.wk, c.cx, c.lk, c.sp || null, c.bm); const T = H.T, o = T.port[0], L = T.L;
  let worst = 0; for (let u = o.uE - 4; u <= o.uE + 4; u += 0.05) { const p = H.sampleAt(u).p, dE = p.distanceTo(o.E), dX = p.distanceTo(o.X); worst = Math.max(worst, (u < o.uE ? dE : dX) - Math.abs(u - o.uE)) }
  out.sampleWorst = +worst.toFixed(2);
  out.code = H.codeStr(); out.specPortal = c.sp.n.portal;
  /* the same counts on an Urban code: no portal */
  const cu = H.parseCode(code.replace(/-S$/, '-U')); H.loadTrack(cu.seed, cu.wk, cu.cx, cu.lk, cu.sp || null, cu.bm); out.urbanPort = !!H.T.port; out.urbanDropped = JSON.stringify(H.T.dropped);
  H.loadTrack(c.seed, c.wk, c.cx, c.lk, c.sp || null, c.bm);
  /* the editor: the portal row shows on Spirit, not on Urban */
  H.openEd('menu'); const row = () => document.querySelector('#edFeats [data-k="portal"]'); out.rowS = row() && !row().hidden; H.ed.bm.k = 'U'; document.querySelector('[data-edbio="U"]') && 0; H.closeEd(false);
  H.openEd('menu'); H.ed.bm = { k: 'U', d: [2, 0, 0, 0] }; document.querySelector('[data-edw="' + H.ed.wk + '"]').click(); out.rowU = row() ? !row().hidden : false; clearTimeout(H.ed.t); H.ed.dirty = false; document.getElementById('ed').hidden = true; H.showPage('menu');
  H.loadTrack(c.seed, c.wk, c.cx, c.lk, c.sp || null, c.bm);
  return out })();

const SHOT = (code) => (async () => {
  const H = window.__hl; H.RACE.force = 630002; const c = H.parseCode(code); H.loadTrack(c.seed, c.wk, c.cx, c.lk, c.sp || null, c.bm);
  await H.startRace(); H.S.goAt = null; const T = H.T, o = T.port[0], me = H.player, tg = H.racers[1];
  for (const r of H.racers) { if (r !== me && r !== tg) { r.u = r.utot = o.uE - 1500; r.v = 0 } }
  me.u = me.utot = o.uE - 40; me.lat = 0; me.v = 120; tg.u = tg.utot = o.uE + 12; tg.lat = 0; tg.v = 100; tg.hp = tg.d.hp; me.weapons = ['cannon', me.weapons[1]]; me.ammo = me.d.ammo; me.cd = [0, 0];
  for (const r of H.racers) { r.isAI2 = r.isAI } const hp0 = tg.hp; H.fire(me, 0); const s = H.shots[H.shots.length - 1]; let before = null, after = null, hit = false;
  for (let k = 0; k < 30 && H.shots.includes(s); k++) { const u0 = s.u; for (const r of H.racers) if (r !== me) r.v = r === tg ? 100 : 0; H.updateShots(1 / 60); if (!H.shots.includes(s)) { hit = tg.hp < hp0; break }
    if (s.u < o.uE) before = s.mesh.position.distanceTo(o.E); else if (after == null) after = s.mesh.position.distanceTo(o.X) }
  return { type: s.type, before: before && +before.toFixed(1), after: after && +after.toFixed(1), hit, hp: [hp0, tg.hp] } })();

const POSE = (code) => (async () => {
  const H = window.__hl, T = H.T, o = T.port[0], d = H.rec.d, n = d.length / 7; if (n < 10) return { err: 'no recording' };
  /* a ghost of the player's own run: at every tenth of a second either side of its crossing, drawn at sampleAt(u) */
  let ti = -1; for (let i = 1; i < n; i++) { const a = d[(i - 1) * 7] / 10, b = d[i * 7] / 10, ua = ((a % T.L) + T.L) % T.L, ub = ((b % T.L) + T.L) % T.L; if (ua < o.uE && ub >= o.uE && b - a < 100) { ti = i; break } }
  const g = H.makeGhost(0, { d: d.slice(), T: 60 }, 1, 'portal ghost'); let gw = 0, gs = 0;
  for (let k = -8; k <= 8; k++) { const tt = (ti + k * 0.25) / 10; H.ghostPose(g, tt); H.placeShip(g, 0); const sp = H.sampleAt(g.u).p, dd = g.ship.position.distanceTo(sp); gw = Math.max(gw, dd); gs++ }
  /* a remote ship's pose (as sent each 100 ms) just before and just after the entrance */
  const r = H.racers[2]; r.proxy = true; let pw = 0;
  for (const du of [-6, -2, 1, 5]) { r.net = null; const fake = { utot: o.uE + du, lat: 1, yaw: 0, v: 120, air: false, h: 1.05, pitch: 0, steerS: 0, brk: 0, hp: 50, done: 0, wreck: 0, inv: 0, barrier: 0, boost: 0, d: r.d, stat: r.stat, build: r.build };
    const s = H.mpPack(Object.assign(Object.create(null), fake, { u: o.uE + du, finishT: null, weapons: [] })); H.mpApply(r, s, (H.S.raceT || 0) * 1000); H.proxyStep(r, 1 / 60); H.placeShip(r, 0);
    const want = du < 0 ? o.E : o.X; pw = Math.max(pw, r.ship.position.distanceTo(want) - Math.abs(du) - 4) }
  r.proxy = false;
  return { ti, gw: +gw.toFixed(2), gs, pw: +pw.toFixed(2) } })();

/* the view pass and the camera, on a drawing page */
const VIEW = (code) => (async () => {
  const H = window.__hl; H.RACE.force = 630003; const c = H.parseCode(code); H.loadTrack(c.seed, c.wk, c.cx, c.lk, c.sp || null, c.bm);
  await H.startRace(); H.S.goAt = null; H.fit(); const T = H.T, o = T.port[0], me = H.player, cam = H.camera, out = { at: [] };
  const look = (u) => { const s = H.sampleAt(u), p = s.p.clone().addScaledVector(s.u, 5).addScaledVector(s.t, -12); cam.position.copy(p); cam.up.copy(s.u); cam.lookAt(s.p.clone().addScaledVector(s.t, 30)); cam.updateMatrixWorld() };
  for (const d of [-1200, -600, -280, -150, -40]) { look(o.uE + d); H.portalView(cam); out.at.push([d, !!H.PVW.on]) }
  look(o.uE - 150); H.RES.low = true; H.portalView(cam); out.ultra = !!H.PVW.on; H.RES.low = false;
  /* behind the entrance, looking back at it */
  { const s = H.sampleAt(o.uE - 2); cam.position.copy(o.E).addScaledVector(s.t, 60).addScaledVector(s.u, 6); cam.lookAt(o.E); cam.updateMatrixWorld(); H.portalView(cam); out.behind = !!H.PVW.on }
  /* cost: the scene alone and the view pass, 150 m out */
  look(o.uE - 150); H.gfxRender(H.scene, cam); out.scene = { calls: H.GFX.calls, tris: H.GFX.tris };
  H.portalView(cam); out.view = { calls: H.PVW.calls, tris: H.PVW.tris, scale: H.PVW.scale };
  /* the race's own camera through the crossing: its offset from the frame, turned by the portal, carries on */
  let g = 0; while (((o.uE - me.u) % T.L + T.L) % T.L > 60 && g++ < 30000) H.step(1 / 60);
  let prev = null, worst = 0, crossed = false;
  for (let k = 0; k < 60; k++) { const u0 = me.u; H.step(1 / 60); const rel = cam.position.clone().sub(me.ship.position);
    const cr = H.portalCross(u0, me.u); if (prev) { const want = cr ? prev.clone().applyQuaternion(cr.Q) : prev; if (cr) crossed = true; worst = Math.max(worst, rel.distanceTo(want)) } prev = rel }
  out.camWorst = +worst.toFixed(2); out.crossed = crossed;
  return out })();

(async () => {
  const b = await launch(); const errs = [];
  const page = (k, o = {}) => open(b, 'portals-' + k, Object.assign({ vp: { width: 640, height: 360 }, query: '&bot=1', storage: { 'hoverline.laps': '2' }, init: () => { window.requestAnimationFrame = () => 0 } }, o));
  for (const [i, code] of CODES.entries()) {
    const p = await page(code); const R = await p.evaluate(RACE, code); errs.push(...p.errs);
    console.log(code, '|', R.info, '| portal', R.pv, '| L', R.L, '|', R.t, 's | flights', JSON.stringify(R.flights), 'done', JSON.stringify(R.done), '| crossings', R.cross, '| wrecks', R.wrecks);
    ok(R.fin === R.n, code + ': the bot race ran to the end (' + R.fin + ' of ' + R.n + ' finished)');
    ok(R.done.every((d) => d === R.laps), code + ': every racer counted ' + R.laps + ' laps');
    ok(R.flights.every((f) => f >= R.laps), code + ': every racer flew the portal jump every lap (' + R.flights.join(' ') + ')');
    ok(R.falls === 0, code + ': nobody fell at the portal (' + R.falls + ')');
    ok(R.utJump <= 0.5 && R.maxRankJump <= 1, code + ': distance and places carry through the crossing (utot step over v*dt by ' + R.utJump + ' m; most places changed in a crossing step ' + R.maxRankJump + ')');
    if (i === 0) {
      const P = await p.evaluate(POSE, code); console.log('  ghost and pose', JSON.stringify(P));
      ok(P.ti > 0 && P.gw < 6, 'a ghost of the run is drawn where its u is, either side of the crossing (worst ' + P.gw + ' m off the road there)');
      ok(P.pw < 3, 'a remote ship\'s pose before and after the entrance is drawn at the entrance\'s side and the exit\'s (worst ' + P.pw + ' m)');
      const Q = await p.evaluate(ROAD, code); console.log('  road', JSON.stringify(Q));
      ok(Q.sampleWorst < 0.5, 'sampleAt is never between the entrance and the exit (at most ' + Q.sampleWorst + ' m further from the side it is on than its distance along the road)');
      ok(Q.specPortal === 1 && /-1000000000000000+1-S$/.test(Q.code) && !Q.urbanPort, 'the editor\'s portal count round-trips in the code (' + Q.code + ') and builds nothing outside the Spirit realm (dropped ' + Q.urbanDropped + ')');
      ok(Q.rowS && !Q.rowU, 'the editor shows the Portals row for the Spirit realm only');
      const pS = await page('shot', { query: '' }); const Sx = await pS.evaluate(SHOT, code); errs.push(...pS.errs); await pS.ctx.close(); console.log('  shot', JSON.stringify(Sx));
      ok(Sx.hit && Sx.before != null && Sx.after != null && Sx.after < 40, 'a cannon shot fired 40 m before the entrance comes out of the exit (' + Sx.after + ' m from it) and hits a frame 12 m past it (shield ' + Sx.hp.join(' to ') + ')');
      const pV = await page('view', { render: true, query: '', storage: { 'hoverline.laps': '2', 'hoverline.orient': 'landscape' } }); const V = await pV.evaluate(VIEW, code); errs.push(...pV.errs); await pV.ctx.close(); console.log('  view', JSON.stringify(V));
      ok(JSON.stringify(V.at.map((x) => x[1])) === '[false,false,true,true,true]' && !V.ultra && !V.behind, 'the view through the portal is drawn only from the 300 m before the entrance, looking at it (not from 600 m or more, not from behind, not on Ultra low)');
      ok(V.crossed && V.camWorst < 3, 'the chase camera through the crossing: its offset from the frame turns with the portal (worst step ' + V.camWorst + ' m)');
      console.log('  cost: scene', JSON.stringify(V.scene), 'view pass', JSON.stringify(V.view));
    }
    await p.ctx.close();
  }
  ok(errs.length === 0, 'no page errors' + (errs.length ? ': ' + errs.slice(0, 3).join(' | ') : ''));
  await b.close(); done();
})();
