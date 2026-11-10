// Prototype 60: a device as a controller. Two pages: a screen (split-screen lobby, Let devices join, a same-room room
// paired by code) and a controller (Multiplayer, Be a controller, joins by code). The controller shows the controller
// layout and draws no race; on the screen it is one more local pilot. The screen doesn't race itself (screen only);
// the controller starts the race, steers with the steer zone and boosts, and the screen's ship for it does so.
//      node tools/tests/padc.js
const { wait, until, launch, open, toLan, ok, done } = require('./lib.js');
(async () => {
  const b = await launch(['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream']);
  const H = await open(b, 'Screen', { vp: { width: 1280, height: 720 }, perms: ['microphone', 'camera'] });
  const G = await open(b, 'Pad', { vp: { width: 844, height: 390 }, perms: ['microphone', 'camera'] });
  // the screen: Split screen, then Let devices join, a same-room room by code
  await H.click('#playBtn'); await wait(150); await H.click('#mpBtn'); await wait(200); await H.click('#splBtn'); await wait(300);
  await H.click('#splJoin'); await wait(300);
  ok(await H.evaluate(() => window.__hl.mp.split === 'screen' && !document.getElementById('mp').hidden), 'screen: Let devices join opens the Multiplayer screen for a split room');
  await H.fill('#mpName', 'Screen'); await H.click('[data-conn="lan"]'); await wait(150); await H.click('[data-pair="qr"]');
  await H.click('#chirpHostBtn'); await until(H, () => !!window.__nb.lan.code, 15000, 'invitation');
  // the controller: Be a controller, then join by the host's code; the host takes its reply
  await toLan(G, 'Ana'); await G.click('[data-pair="qr"]'); await G.click('#padcBtn');
  await G.click('#chirpJoinBtn'); await G.fill('#lanIn', await H.evaluate(() => window.__nb.lan.code)); await G.click('#lanUse');
  await until(G, () => !!window.__nb.lan.code, 10000, 'reply');
  await H.fill('#lanIn', await G.evaluate(() => window.__nb.lan.code)); await H.click('#lanUse');
  await until(G, () => window.__hl.PADC.on, 20000, 'controller mode');
  let g = await G.evaluate(() => ({ on: !document.getElementById('padc').hidden, mp: document.getElementById('mp').hidden }));
  ok(g.on && g.mp, 'controller: joined, shows the controller layout ' + JSON.stringify(g));
  await until(H, () => window.__hl.SPL.pilots.some((P) => P.src === 'ctl'), 10000, 'controller pilot');
  let h = await H.evaluate(() => ({ max: window.__hl.mp.sess.state.max, info: window.__hl.mp.sess.state.info.split, p: window.__hl.SPL.pilots.map((P) => P.src + ':' + P.name) }));
  ok(h.max === 9 && h.info === 1 && h.p.length === 1 && h.p[0] === 'ctl:Ana', 'screen: the device is a pilot (a split room takes the screen and 8 devices) ' + JSON.stringify(h));
  await until(G, () => /P1/.test(document.getElementById('pcN').textContent), 8000, 'pilot number');
  ok(true, 'controller: the screen tells it it is ' + await G.textContent('#pcN'));
  await H.click('#lanCancel').catch(() => {}); await wait(200); await H.click('#mpSplBack'); await wait(300);
  h = await H.evaluate(() => ({ open: !document.getElementById('spl').hidden, cards: [...document.querySelectorAll('#splList .splp span')].map((e) => e.textContent), room: document.getElementById('splRoom').textContent }));
  ok(h.open && h.cards.length === 1 && /Phone · Ana/.test(h.cards[0]) && /1 device/.test(h.room), 'screen: back in the split lobby, the phone is P1, the screen only shows ' + JSON.stringify(h));
  // controller draws nothing
  const fr = await G.evaluate(() => new Promise((res) => { const R = window.__hl.renderer, r0 = R.render; let n = 0; R.render = function () { n++; return r0.apply(this, arguments) }; setTimeout(() => { R.render = r0; res(n) }, 500) }));
  ok(fr === 0, 'controller: draws no race (' + fr + ' renders in 0.5 s)');
  // start the race from the controller
  await H.click('[data-spllaps="1"]');
  await G.click('#pcGo'); await until(H, () => window.__hl.S.state === 'race', 60000, 'race'); await wait(1200);
  h = await H.evaluate(() => { const h = window.__hl, P = h.SPL.pilots[0]; return { player: P.r === h.player, human: h.racers.filter((r) => !r.isAI).length, views: h.SPL.ln } });
  ok(h.player && h.human === 1 && h.views === 1, 'the race: the controller flies pilot 1 on the screen, one view ' + JSON.stringify(h));
  // steer zone: drag left; Boost held
  const z = await G.evaluate(() => { const r = document.getElementById('pcSteer').getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 } });
  await G.mouse.move(z.x, z.y); await G.mouse.down(); await G.mouse.move(z.x - 200, z.y, { steps: 4 }); await wait(900);
  h = await H.evaluate(() => { const P = window.__hl.SPL.pilots[0]; return { in: P.inp.steer, s: +P.r.steerS.toFixed(2) } });
  ok(h.in < -0.9 && h.s < -0.3, 'controller: dragging left steers its ship left on the screen ' + JSON.stringify(h));
  await G.mouse.up(); await wait(400);
  h = await H.evaluate(() => window.__hl.SPL.pilots[0].inp.steer); ok(h === 0, '  letting go straightens up (' + h + ')');
  const bb = await G.evaluate(() => { const r = document.getElementById('pcBst').getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 } });
  await G.mouse.move(bb.x, bb.y); await G.mouse.down(); await wait(400);
  h = await H.evaluate(() => window.__hl.SPL.pilots[0].inp.boost); ok(h === true, 'controller: Boost held boosts on the screen');
  await G.mouse.up(); await wait(300);
  // a module press is counted, so it can't be lost
  await H.evaluate(() => { window.__hl.player.ammo = 999; window.__hl.player.cd = [0, 0] });
  const a0 = await H.evaluate(() => window.__hl.player.ammo);
  const w1 = await G.evaluate(() => { const r = document.getElementById('pcW1').getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 } });
  await G.mouse.move(w1.x, w1.y); await G.mouse.down(); await wait(120); await G.mouse.up(); await wait(500);
  const a1 = await H.evaluate(() => window.__hl.player.ammo); ok(a1 < a0, `controller: Module 1 fires on the screen (ammo ${a0} to ${a1})`);
  g = await G.textContent('#pcMsg'); ok(/of \d+ · lap 1\/1/.test(g), 'controller: shows its place and lap "' + g + '"');
  // the controller leaves mid-race: the ship coasts on, nothing breaks
  await G.click('#pcLeave'); await wait(2500);
  h = await H.evaluate(() => ({ gone: window.__hl.SPL.pilots[0].gone, st: window.__hl.S.state }));
  ok(h.gone && h.st === 'race', 'the controller leaves: its pilot is marked gone, the race goes on ' + JSON.stringify(h));
  ok(H.errs.length + G.errs.length === 0, 'no page errors ' + JSON.stringify([...H.errs, ...G.errs].slice(0, 3)));
  await H.ctx.close(); await G.ctx.close();
  // a normal same-room room still races two pilots on two screens, nobody in controller mode
  { const A = await open(b, 'Host', { perms: ['microphone', 'camera'], query: '&bot=1' }), B = await open(b, 'Pilot', { perms: ['microphone', 'camera'], query: '&bot=1' });
    for (const [p, n] of [[A, 'Host'], [B, 'Pilot']]) { await toLan(p, n); await p.click('[data-pair="qr"]') }
    await A.click('#chirpHostBtn'); await until(A, () => !!window.__nb.lan.code, 15000, 'invitation');
    await B.click('#chirpJoinBtn'); await B.fill('#lanIn', await A.evaluate(() => window.__nb.lan.code)); await B.click('#lanUse'); await until(B, () => !!window.__nb.lan.code, 10000, 'reply');
    await A.fill('#lanIn', await B.evaluate(() => window.__nb.lan.code)); await A.click('#lanUse');
    for (const p of [A, B]) await until(p, () => { const s = window.__hl.mp.sess; return !!s && s.state.phase === 'lobby' && s.state.roster.length === 2 }, 20000, 'lobby');
    await A.click('#lanCancel').catch(() => {}); await wait(200);
    for (const p of [A, B]) await p.click('#mpReady');
    for (const p of [A, B]) await until(p, () => /countdown|race/.test(window.__hl.S.state), 30000, 'room race');
    const r = await Promise.all([A, B].map((p) => p.evaluate(() => ({ mode: window.__hl.LOG.cur && window.__hl.LOG.cur.mode, padc: window.__hl.PADC.on, split: window.__hl.SPL.race, max: window.__hl.mp.sess.state.max, proxies: window.__hl.racers.filter((x) => x.proxy && !x.isAI).length }))));
    ok(r.every((x) => x.mode === 'room' && !x.padc && !x.split && x.max === 8 && x.proxies === 1), 'a normal room still races: two pilots, one proxy each, no controllers ' + JSON.stringify(r));
    ok(A.errs.length + B.errs.length === 0, 'no page errors in the normal room'); }
  await b.close(); done();
})().catch((e) => { console.log('FAIL', e.message); process.exit(1) });
