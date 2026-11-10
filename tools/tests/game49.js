// Prototype 49 game fixes: pause menu (tune, Like, Recentre tilt), Pacifist, Phase look, tilt recentre at GO.
const { wait, until, launch, open, ok, done, ANDROID_UA, FS_MOCK } = require('./lib.js');
const MOTION = () => { window.__g = { x: 0, y: 9.8, z: 0 }; setInterval(() => { try { window.dispatchEvent(new DeviceMotionEvent('devicemotion', { accelerationIncludingGravity: window.__g, interval: 16 })) } catch (e) {} }, 50) };
(async () => {
  const b = await launch();
  { const p = await open(b, 'desk', { vp: { width: 1280, height: 720 }, render: true });
    // Pacifist
    await p.evaluate(() => { window.__hl.showPage && window.__hl.showPage('track') });
    const pb = await p.evaluate(() => { document.getElementById('pacBtn').click(); return { on: window.__hl.pacOn, st: window.__hl.store.get('hoverline.pacifist'), pr: document.getElementById('pacBtn').getAttribute('aria-pressed') } });
    ok(pb.on && pb.st === '1' && pb.pr === 'true', 'Pacifist switches on and is saved ' + JSON.stringify(pb));
    await p.evaluate(() => window.__hl.startRace()); await until(p, () => window.__hl.S.state === 'race', 60000, 'race'); await wait(6000);
    const f = await p.evaluate(() => { const h = window.__hl; h.player.ammo = 999; h.player.cd = [0, 0]; return { can: h.canFire(h.player, 0), ai: h.racers.filter(r => r.isAI).map(r => { r.ammo = 999; r.cd = [0, 0]; return h.canFire(r, 0) }).some(Boolean) } });
    ok(!f.can && !f.ai, 'Pacifist: nobody can fire ' + JSON.stringify(f));
    await p.evaluate(() => { document.getElementById('pacBtn').click() });
    const f2 = await p.evaluate(() => { const h = window.__hl; h.player.ammo = 999; h.player.cd = [0, 0]; return h.canFire(h.player, 0) || !h.player.weapons[0] });
    ok(f2, 'Pacifist off: the player can fire again');
    // pause menu tune + like
    await p.evaluate(() => window.__hl.togglePause('test')); await wait(300);
    const pm = await p.evaluate(() => ({ row: !document.getElementById('pauseTuneRow').hidden, t: document.getElementById('pauseTune').textContent, like: !document.getElementById('likeTune3').hidden, tilt: !document.getElementById('tiltRe').hidden }));
    ok(pm.row && pm.t.length > 3 && !pm.tilt, 'pause menu shows the tune, no Recentre on desktop ' + JSON.stringify(pm));
    if (pm.like) { const lk = await p.evaluate(() => { document.getElementById('likeTune3').click(); return { liked: window.__hl.music.liked(), pr: document.getElementById('likeTune3').getAttribute('aria-pressed') } }); ok(lk.liked && lk.pr === 'true', '  Like in the pause menu likes the tune ' + JSON.stringify(lk)) }
    else console.log('  (tune not likeable: ' + pm.t + ')');
    await p.evaluate(() => window.__hl.togglePause('test')); await wait(300);
    // Phase look
    await p.evaluate(() => { const h = window.__hl; h.player.phase = 1.5 }); await wait(200);
    await p.screenshot({ path: '/home/claude/p49/tests/phase.png' });
    const ph = await p.evaluate(() => { let n = 0, t = 0, bub = window.__hl.player.ship.userData.shield.visible; window.__hl.player.ship.traverse(m => { if (m.isMesh && m.material) { t++; if (!Array.isArray(m.material) && m.material.transparent && m.material.opacity < 0.6) n++ } }); return { n, t, bub } });
    ok(ph.n > 0 && !ph.bub, 'Phase: the frame is see-through and there is no bubble ' + JSON.stringify(ph));
    await p.evaluate(() => { window.__hl.player.phase = 0 }); await wait(300);
    const ph2 = await p.evaluate(() => { let n = 0; window.__hl.player.ship.traverse(m => { if (m.isMesh && m.material && !Array.isArray(m.material) && m.material.opacity < 0.6 && m.userData.phM) n++ }); return n });
    ok(ph2 === 0, 'Phase over: the frame is solid again (' + ph2 + ')');
    ok(p.errs.length === 0, 'no page errors ' + JSON.stringify(p.errs.slice(0, 3))); await p.ctx.close() }
  { // tilt: centred at GO even if held oddly at the countdown; Recentre in the pause menu
    const p = await open(b, 'tilt', { vp: { width: 390, height: 844 }, touch: true, ua: ANDROID_UA, init: MOTION, storage: { 'hoverline.orient': 'portrait', 'hoverline.touch': 'tilt' } });
    await p.evaluate(() => { window.__g = { x: 6, y: 7.5, z: 0 } });   // held at an angle as the countdown starts
    await p.evaluate(() => { const h = window.__hl; h.tilt.enabled = true; h.startRace() }); await wait(700);
    await p.evaluate(() => { window.__g = { x: 0, y: 9.8, z: 0 } });   // then upright for the race
    await until(p, () => window.__hl.S.state === 'race', 60000, 'race'); await wait(500);
    const t = await p.evaluate(() => ({ n: window.__hl.tilt.neutral, a: window.__hl.tilt.ang, en: window.__hl.tilt.enabled }));
    ok(Math.abs(t.n - t.a) < 0.05, 'tilt centred again at GO: upright steers straight ' + JSON.stringify(t));
    await p.evaluate(() => { window.__g = { x: -4, y: 9, z: 0 } }); await wait(300);
    await p.evaluate(() => window.__hl.togglePause('test')); await wait(200);
    const vis = await p.evaluate(() => !document.getElementById('tiltRe').hidden);
    await p.evaluate(() => document.getElementById('tiltRe').click());
    const t2 = await p.evaluate(() => ({ n: window.__hl.tilt.neutral, a: window.__hl.tilt.ang }));
    ok(vis && Math.abs(t2.n - t2.a) < 0.02, 'Recentre tilt in the pause menu ' + JSON.stringify({ vis, ...t2 }));
    ok(p.errs.length === 0, 'no page errors'); await p.ctx.close() }
  await b.close(); done();
})().catch((e) => { console.log('FAIL', e.message); process.exit(1) });
