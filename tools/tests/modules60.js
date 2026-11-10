// Prototype 60: the Reflector (turns shots round and sends them back owned by you) and Flares (the old Decoy: spend 1.5x the
// incoming homing attack's ammo cost to pull it off you; nothing without the ammo). Set up by hand with the race frozen
// (S.state 'paused'), then updateShots() stepped here.
const { launch, open, ok, done, wait } = require('./lib.js');
(async () => {
  const b = await launch(); const p = await open(b, 'mods', { query: '&bot=1' });
  await p.evaluate(() => { document.getElementById('playBtn').click() }); await wait(300); await p.evaluate(() => { document.getElementById('raceMode').click() }); await wait(300);
  await p.evaluate(() => window.__hl.startRace()); await wait(500);
  // the scene: A (the player, behind the module under test) at 500 m, B (the shooter) 50 m behind it; nobody else
  const setup = (aw, bw, aAmmo) => p.evaluate(([aw, bw, aAmmo]) => {
    const h = window.__hl, R = h.racers, A = h.player, B = R.find((r) => r !== A);
    h.S.state = 'paused'; h.S.raceT = 99; h.shots.length = 0;
    for (const o of R) { o.left = o !== A && o !== B; o.wreck = 0; o.finishT = null; o.phase = o.refl = o.barrier = o.inv = o.od = o.emp = 0; o.fl = null; o.cd = [0, 0]; o.proxy = false }
    A.isAI = B.isAI = false;
    A.u = A.utot = 500; B.u = B.utot = 450; A.lat = B.lat = 0; A.v = B.v = 100; A.hp = A.d.hp; B.hp = B.d.hp;
    A.weapons = aw; B.weapons = bw; A.ammo = aAmmo; B.ammo = 999;
    window.__ab = { A, B }; return true;
  }, [aw, bw, aAmmo]);
  const run = (frames) => p.evaluate((n) => { const h = window.__hl; for (let i = 0; i < n; i++) h.updateShots(1 / 60); return { A: window.__ab.A.hp, B: window.__ab.B.hp, ammoA: window.__ab.A.ammo } }, frames);
  const info = () => p.evaluate(() => { const h = window.__hl, { A, B } = window.__ab; return { n: h.shots.length, types: h.shots.map((s) => s.type + (s.mini ? '*' : '') + ':' + (s.owner === A ? 'A' : s.owner === B ? 'B' : '?') + ':' + (s.target ? (s.target === A ? 'A' : s.target === B ? 'B' : s.target.isDecoy ? 'flare' : '?') : '-') + (s.rear ? ':rear' : '') + (s.dud ? ':dud' : '')), ammoA: A.ammo, hpA: A.hp, hpB: B.hp, flares: h.shots.filter((s) => s.isDecoy).length } });
  const fireB = (slot) => p.evaluate((slot) => { const { A, B } = window.__ab; B.ammo = 999; B.cd = [0, 0]; return window.__hl.fire(B, slot) }, slot);
  const fireA = (slot) => p.evaluate((slot) => { const { A } = window.__ab; A.cd = [0, 0]; return window.__hl.fire(A, slot) }, slot);

  // numbers
  const nums = await p.evaluate(() => { const h = window.__hl; return { rc: h.WDEF.reflector.cost, pc: h.WDEF.phase.cost, rt: h.REFLECT_T, d: h.WDEF.decoy } });
  ok(nums.rc === nums.pc / 2 && nums.rt === 0.75, 'Reflector costs half of Phase (' + nums.rc + ' of ' + nums.pc + ') and lasts 0.75 s');
  ok(nums.d.name === 'Flares' && nums.d.passive && /1\.5/.test(nums.d.desc), 'the decoy key is Flares, passive, with the numbers in its description');

  // (a) Reflector: a missile and a cannon bolt come back
  await setup(['reflector', 'cannon'], ['missile', 'cannon'], 100);
  ok(await fireA(0) && await p.evaluate(() => window.__ab.A.refl) === 0.75, 'Reflector fires and the shell is up for 0.75 s');
  ok(await p.evaluate(() => window.__hl.mpFlags(window.__ab.A) & 16384) !== 0, 'multiplayer flags carry the Reflector (like Phase)');
  await fireB(0); let i0 = await info();
  ok(i0.types[0] === 'missile:B:A', 'B fires a missile at A (' + i0.types + ')');
  ok(await p.evaluate(() => window.__hl.aiWants(window.__ab.A, 'reflector')) === false, 'the AI does not fire the Reflector while it is up');
  let r = await run(40); let i1 = await info();
  ok(r.A === i0.hpA, 'the missile did not hurt A (' + r.A + ' of ' + i0.hpA + ')');
  ok(r.B < i0.hpB, 'the missile came back and hit B (' + i0.hpB + ' to ' + r.B + ')');
  await setup(['reflector', 'cannon'], ['missile', 'cannon'], 100); await fireA(0); await fireB(1); await p.evaluate(() => { window.__hl.shots[0].u = window.__ab.A.u - 40 }); i0 = await info();
  ok(i0.types[0] === 'bolt:B:-', 'B fires a cannon bolt (' + i0.types + ')');
  await p.evaluate(() => { for (let i = 0; i < 12 && window.__hl.shots[0] && window.__hl.shots[0].owner !== window.__ab.A; i++) window.__hl.updateShots(1 / 60) });
  i1 = await info(); ok(i1.types[0] === 'bolt:A:-:rear', 'the bolt turned round: owned by A, flying back (' + i1.types + ')');
  r = await run(40); ok(r.A === i0.hpA && r.B < i0.hpB, 'the bolt hit B, not A (A ' + r.A + ' of ' + i0.hpA + ', B ' + i0.hpB + ' to ' + r.B + ')');
  // without the Reflector the same missile hurts A, and a mine is not reflected
  await setup(['cannon', 'cannon'], ['missile', 'cannon'], 100); await fireB(0); r = await run(40); ok(r.A < (await info()).hpA + 1e-9 && r.A < (await p.evaluate(() => window.__ab.A.d.hp)), 'control: with no Reflector the missile hurts A');
  await setup(['reflector', 'cannon'], ['mines', 'cannon'], 100); await fireA(0);
  await p.evaluate(() => { const h = window.__hl, { A } = window.__ab; h.shots.push({ type: 'mine', u: A.u + 1, lat: 0, owner: window.__ab.B, life: 30, arm: 0, mesh: new THREE.Object3D() }); });
  r = await run(3); ok(r.A < await p.evaluate(() => window.__ab.A.d.hp), 'a mine still gets through the Reflector');
  // a hunter comes back as a hunter, flying backward at B
  await setup(['reflector', 'cannon'], ['hunter', 'cannon'], 100); await fireA(0); await fireB(0);
  await p.evaluate(() => { const h = window.__hl, { A } = window.__ab; const s = h.shots[0]; s.wait = false; s.u = A.u - 1; });
  await run(2); i1 = await info(); ok(i1.types[0] === 'hunter:A:B:rear', 'the Hunter turned round and hunts B (' + i1.types + ')');
  r = await run(60); ok(r.B < await p.evaluate(() => window.__ab.B.d.hp), 'the reflected Hunter hit B (' + r.B + ')');
  // the AI uses it for a missile about to land
  await setup(['reflector', 'cannon'], ['missile', 'cannon'], 100); await fireB(0);
  await p.evaluate(() => { const h = window.__hl, { A } = window.__ab; h.shots[0].u = A.u - 25 }); // 25 m back, closing 110 m/s: 0.23 s
  ok(await p.evaluate(() => window.__hl.aiWants(window.__ab.A, 'reflector')) === true, 'the AI fires the Reflector for a missile 0.2 s out');

  // (b) Flares
  const cost = await p.evaluate(() => ({ m: window.__hl.flareCostOf('missile'), s: window.__hl.flareCostOf('missile', true), h: window.__hl.flareCostOf('hunter') }));
  ok(cost.m === 37.5 && cost.s === 13.125 && cost.h === 60, 'Flares cost 1.5 x the attack: Missile 37.5, Swarm missile 13.125, Hunter 60 (' + JSON.stringify(cost) + ')');
  await setup(['decoy', 'cannon'], ['missile', 'cannon'], 100); await fireB(0); await run(1); let f = await info();
  ok(Math.abs(f.ammoA - 62.5) < 0.2 && f.flares === 3 && /missile:B:flare/.test(f.types[0]), 'a Missile: 37.5 ammo spent, 3 flares, the missile follows a flare (' + f.ammoA.toFixed(1) + ' ammo, ' + f.flares + ' flares, ' + f.types[0] + ')');
  await run(90); f = await info(); ok(f.hpA === await p.evaluate(() => window.__ab.A.d.hp), 'the Missile was blocked: A took no damage');
  ok(await p.evaluate(() => window.__ab.A.fl.block) === 1, 'the block was counted');
  await setup(['decoy', 'cannon'], ['hunter', 'cannon'], 100); await fireB(0); await p.evaluate(() => { const s = window.__hl.shots[0]; s.wait = false; s.target = window.__ab.A; s.v = 160 }); await run(1); f = await info();
  ok(Math.abs(f.ammoA - 40) < 0.2 && f.flares === 4, 'a Hunter: 60 ammo spent, 4 flares (' + f.ammoA.toFixed(1) + ' ammo, ' + f.flares + ' flares)');
  await run(120); f = await info(); ok(f.hpA === await p.evaluate(() => window.__ab.A.d.hp), 'the Hunter was blocked');
  await setup(['decoy', 'cannon'], ['swarm', 'cannon'], 100); await fireB(0); await run(1); f = await info();
  ok(Math.abs(f.ammoA - (100 - 4 * 13.125)) < 0.2 && f.flares === 4, 'a Swarm of 4: 13.1 each, 52.5 ammo, one flare each (' + f.ammoA.toFixed(1) + ', ' + f.flares + ')');
  await setup(['decoy', 'cannon'], ['missile', 'cannon'], 37); await fireB(0); await run(1); f = await info();
  ok(f.ammoA === 37 && f.flares === 0, 'with 37 ammo (under 37.5) nothing fires');
  await run(40); f = await info(); ok(f.hpA < await p.evaluate(() => window.__ab.A.d.hp), 'and the Missile hits');
  await setup(['decoy', 'cannon'], ['hunter', 'cannon'], 59); await fireB(0); await p.evaluate(() => { const s = window.__hl.shots[0]; s.wait = false; s.target = window.__ab.A }); await run(1); f = await info();
  ok(f.ammoA === 59 && f.flares === 0, 'with 59 ammo (under 60) the Hunter gets no flares');
  await setup(['decoy', 'cannon'], ['missile', 'cannon'], 100); await p.evaluate(() => { window.__ab.A.emp = 1 }); await fireB(0); await run(1); f = await info();
  ok(f.flares === 0, 'an EMPed ship fires no flares');
  ok(await p.evaluate(() => window.__hl.fire(window.__ab.A, 0)) === false, 'Flares have no button: fire() does nothing');
  ok(p.errs.length === 0, 'no page errors ' + JSON.stringify(p.errs));
  await b.close(); done();
})();
