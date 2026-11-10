// Prototype 51: the redesigned frames, Prism (the wireframe mountain), and the brake taught as the drift button.
// node tools/tests/game51.js (about a minute)
const { wait, until, launch, open, ok, done } = require('./lib.js');
(async () => {
  const b = await launch();
  const p = await open(b, 'p51', { vp: { width: 1280, height: 800 }, query: '&bot=1', storage: { 'hoverline.biomes': 'UOFNR', 'hoverline.bioR': '1' } });
  // the frames: every one has its ammo bars, steering and braking parts and a brake light; the bars dim as ammo goes
  const fr = await p.evaluate(() => { const h = window.__hl, out = [];
    for (const k of ['blade', 'tether', 'skiff', 'hauler', 'dart', 'orb', 'roller', 'mono']) { const g = h.makeShip({ body: 0x2a2f3a, stripe: 0x3ff0ff, num: '07' }, { speed: 3, thrust: 3, handling: 3, shield: 3, ammo: 3 }, k), u = g.userData;
      h.shipCtl(u, 1, 0.5, 0.5); const lit = u.ammo.lit; h.shipCtl(u, 0, 0, 1); out.push({ k, nb: u.ammo.nb, half: lit, full: u.ammo.lit, brake: u.ctl.brake.length, steer: u.ctl.steer.length, light: !!u.ctl.light }) }
    return out });
  for (const f of fr) ok(f.nb >= 6 && f.full === f.nb && f.half < f.nb && f.half > 0 && f.brake > 0 && f.steer > 0 && f.light, `${f.k}: ${f.nb} ammo bars (${f.half} lit at half), ${f.steer} steering and ${f.brake} braking parts, a brake light`);
  // Prism: new settings join the ticked ones once; the letter is in track codes
  ok((await p.evaluate(() => window.__hl.bioOn)).includes('P'), 'Prism joins the ticked settings for someone who had them all ticked');
  ok(await p.evaluate(() => { const c = window.__hl.parseCode('S1234-P2210'); return c && c.bm && c.bm.k === 'P' }), 'a track code with -P parses as Prism');
  // the rock never comes into the road: a ray up from every few metres of road, 18 m long, meets no rock
  for (const seed of [1, 2, 4, 7, 777, 1234, 4242, 90210]) {
    const r = await p.evaluate((seed) => { const h = window.__hl; h.loadTrack(seed, null, null, null, undefined, { k: 'P', d: null }); const T = h.T, PR = T.prism, rc = new THREE.Raycaster(), up = new THREE.Vector3(), o = new THREE.Vector3();
      PR.meshes.forEach((m) => m.updateMatrixWorld()); let bad = 0, nIn = 0, first = -1;
      for (let i = 0; i < T.N; i += 3) { if (PR.ins[i]) nIn++; up.copy(T.U[i]); o.copy(T.P[i]).addScaledVector(up, 0.5); rc.set(o, up); rc.far = 18; if (rc.intersectObjects(PR.meshes, false).length) { bad++; if (first < 0) first = i } }
      return { bad, first, inside: Math.round(nIn * 3 / T.N * 100), mode: PR.mode, info: T.bmInfo } }, seed);
    ok(r.bad === 0, `Prism ${seed} (${r.mode}, ${r.inside}% inside): no rock in the road${r.bad ? ` (${r.bad} places, first at ${r.first})` : ''} · ${r.info}`);
  }
  // a race on Prism runs
  await p.evaluate(() => window.__hl.startRace()); await until(p, () => window.__hl.S.state === 'race', 60000, 'race'); await wait(8000);
  ok(await p.evaluate(() => window.__hl.player.u > 300), 'a bot race on Prism runs');
  await p.evaluate(() => document.getElementById('quitBtn').click()); await wait(500);
  // the brake is taught as the drift button: the tutorial step, and the last quick race opens it
  ok(await p.evaluate(() => { const s = window.__hl.TUT.find((x) => x.k === 'brake'); return /drift/i.test(s.n) && /for drifting/.test(s.why) }), 'tutorial: the brake step teaches drifting');
  const p2 = await open(b, 'p51b', { vp: { width: 1280, height: 800 }, query: '&quick=0' });
  const qk = await p2.evaluate(() => { const h = window.__hl, Q = h.QK, was = [Q.live, Q.lvl], r = {};
    Q.live = true; Q.lvl = 4; r.b4 = h.qkIn({ steer: 1, brake: 1, pitch: 0, boost: false, fire: [false, false], hold: [false, false] }).brake; r.m4 = h.isMan(h.player);
    Q.lvl = 5; r.b5 = h.qkIn({ steer: 1, brake: 1, pitch: 0, boost: false, fire: [false, false], hold: [false, false] }).brake; r.m5 = h.isMan(h.player);
    [Q.live, Q.lvl] = was; return r });
  await p2.close();
  ok(qk.b4 === 0 && !qk.m4 && qk.b5 === 1 && qk.m5, 'quick races: the brake (and drifting) opens in race 5 only ' + JSON.stringify(qk));
  // the Frame lab says which pilot sits out
  await p.evaluate(() => document.getElementById('labBtn').click()); await wait(400);
  ok(/sits out/.test(await p.evaluate(() => document.getElementById('labFdesc').textContent)), 'Frame lab: the frame\'s own pilot sits out, it says so');
  ok(p.errs.length === 0, 'no page errors ' + JSON.stringify(p.errs));
  await b.close(); done();
})();
