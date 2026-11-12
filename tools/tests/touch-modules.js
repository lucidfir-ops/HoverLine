// Prototype 63: touch controls fire the modules. Eric's phone (Android Chrome, portrait, the Tilt steer layout, a Spirit
// track, tilt events streaming, a finger holding Boost) could tap Turbo and Phase and nothing fired. This taps the module
// buttons with real touch events (Chrome's Input.dispatchTouchEvent, so pointer events and a second finger are real) in
// every touch layout x portrait/landscape, on a Spirit track and a plain one, and checks the ammo is spent.
//                                                                          node tools/tests/touch-modules.js
const { wait, until, launch, open, ok, done, ANDROID_UA } = require('./lib.js');
const MOTION = () => { window.__g = { x: 0, y: 9.8, z: 0 }; setInterval(() => { try { window.dispatchEvent(new DeviceMotionEvent('devicemotion', { accelerationIncludingGravity: window.__g, interval: 16 })) } catch (e) {} }, 50) };
const LAYOUTS = { tiltsteer: { tilt: true, pm: 0, steer: 'tilt', psl: false, mods: 'left' }, fulltilt: { tilt: true, pm: 0, steer: 'stick', psl: false, mods: 'auto' }, sliders: { tilt: false, pm: 2, steer: 'slider', psl: true, mods: 'auto' }, buttons: { tilt: false, pm: 2, steer: 'btns', psl: true, mods: 'right' }, stick: { tilt: false, pm: 2, steer: 'stick', psl: false, mods: 'split' } };
const only = process.env.ONLY;
const centre = (p, id) => p.evaluate((i) => { const e = document.getElementById(i), r = e.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2, w: r.width, h: r.height, vis: !e.hidden && r.width > 0 } }, id);
const tp = (c, type, pts) => c.send('Input.dispatchTouchEvent', { type, touchPoints: pts.map(([x, y, id]) => ({ x, y, id })) });
async function race(b, label, o, code, weapons) {
  const p = await open(b, label, { vp: o.vp, touch: true, ua: ANDROID_UA, init: MOTION,
    storage: { 'hoverline.touchset': JSON.stringify({ v: 42, p: o.set, l: o.set }), 'hoverline.touch': '1', 'hoverline.laps': '3', 'hoverline.orient': o.vp.height > o.vp.width ? 'portrait' : 'landscape' } });
  await p.evaluate(async ([code, w]) => { const H = window.__hl; if (code) { const c = H.parseCode(code); H.loadTrack(c.seed, c.wk, c.cx, c.lk, c.sp || null, c.bm) } H.build.weapons = w; H.startRace() }, [code, weapons]);
  await until(p, () => window.__hl.S.state === 'race' && window.__hl.S.raceT > 1, 90000, 'race');
  await p.evaluate((w) => { const H = window.__hl; H.S.raceT = Math.max(H.S.raceT, 30); H.player.weapons = w.slice(); H.player.ammo = H.player.d.ammo; H.player.cd = [0, 0]; H.player.wreck = 0 }, weapons);
  return p;
}
const ammo = (p) => p.evaluate(() => window.__hl.player.ammo);
(async () => {
  const b = await launch();
  for (const [name, set] of Object.entries(LAYOUTS)) {
    if (only && only !== name) continue;
    for (const [orn, vp] of [['portrait', { width: 390, height: 844 }], ['landscape', { width: 844, height: 390 }]]) {
      for (const [track, code] of [['spirit', 'WQ1234567-S'], ['plain', null]]) {
        const tag = `${name}/${orn}/${track}`;
        const p = await race(b, tag, { vp, set }, code, ['turbo', 'phase']);
        const c = await p.ctx.newCDPSession(p);
        const w1 = await centre(p, 'w1'), w2 = await centre(p, 'w2'), bst = await centre(p, 'bst');
        ok(w1.vis && w2.vis, tag + ': module buttons shown');
        await tp(c, 'touchStart', [[bst.x, bst.y, 1]]); await wait(120);
        const a0 = await ammo(p);
        await tp(c, 'touchStart', [[bst.x, bst.y, 1], [w1.x, w1.y, 2]]); await wait(60); await tp(c, 'touchEnd', [[bst.x, bst.y, 1]]); await wait(250);
        const a1 = await ammo(p);
        ok(a1 < a0 - 5, tag + ': Turbo fires on a tap with Boost held (' + a0.toFixed(0) + ' -> ' + a1.toFixed(0) + ')');
        await tp(c, 'touchEnd', []); await wait(700);
        await p.evaluate(() => { const H = window.__hl; H.player.ammo = H.player.d.ammo; H.player.cd = [0, 0]; H.player.boost = 0 });
        const b0 = await ammo(p);
        await tp(c, 'touchStart', [[w2.x, w2.y, 1]]); await wait(80); await tp(c, 'touchEnd', []); await wait(250);
        const b1 = await ammo(p);
        ok(b1 < b0 - 5, tag + ': Phase fires on a plain tap (' + b0.toFixed(0) + ' -> ' + b1.toFixed(0) + ')');
        // hold-to-fire (Cannon) and passive (Flares, shows "auto"): the same finger rules
        await p.evaluate(() => { const H = window.__hl; H.player.weapons = ['cannon', 'decoy']; H.player.ammo = H.player.d.ammo; H.player.cd = [0, 0]; H.player.boost = 0; H.player.selfBoost = false });
        await wait(300);
        const c0 = await ammo(p);
        await tp(c, 'touchStart', [[w1.x, w1.y, 1]]); await wait(700);
        const c1 = await ammo(p);
        ok(c0 - c1 >= 10, tag + ': Cannon fires again and again while held (' + c0.toFixed(0) + ' -> ' + c1.toFixed(0) + ')');
        await tp(c, 'touchEnd', []); await wait(300);
        const c2 = await ammo(p); await wait(400); const c3 = await ammo(p);
        ok(c3 >= c2 - 0.5, tag + ': Cannon stops when the finger lifts');
        const lab = await p.evaluate(() => document.querySelector('#w2 small').textContent);
        const f0 = await ammo(p);
        await tp(c, 'touchStart', [[w2.x, w2.y, 1]]); await wait(100); await tp(c, 'touchEnd', []); await wait(300);
        ok(lab === 'auto' && (await ammo(p)) >= f0 - 0.5, tag + ': Flares show "' + lab + '" and a tap spends nothing');
        ok(p.errs.length === 0, tag + ': no page errors ' + p.errs.slice(0, 2).join('|'));
        await p.ctx.close();
      }
    }
  }
  // Pacifist stops every module: the buttons say so (dashed, "off") and a tap says why; nothing fires
  { const set = LAYOUTS.tiltsteer, vp = { width: 390, height: 844 };
    const p = await open(b, 'pacifist', { vp, touch: true, ua: ANDROID_UA, init: MOTION, storage: { 'hoverline.pacifist': '1', 'hoverline.touchset': JSON.stringify({ v: 42, p: set, l: set }), 'hoverline.touch': '1', 'hoverline.orient': 'portrait' } });
    await p.evaluate(() => { const H = window.__hl; H.build.weapons = ['turbo', 'phase']; H.startRace() });
    await until(p, () => window.__hl.S.state === 'race' && window.__hl.S.raceT > 1, 90000, 'race');
    await p.evaluate(() => { const H = window.__hl; H.player.ammo = H.player.d.ammo }); await wait(700);
    const c = await p.ctx.newCDPSession(p), w1 = await centre(p, 'w1');
    const st = await p.evaluate(() => ({ pac: document.body.classList.contains('pac'), after: getComputedStyle(document.getElementById('w1'), '::after').content, bs: getComputedStyle(document.getElementById('w1')).borderStyle }));
    ok(st.pac && /off/.test(st.after) && st.bs === 'dashed', 'Pacifist: the module buttons show "off" and a dashed edge ' + JSON.stringify(st));
    await tp(c, 'touchStart', [[w1.x, w1.y, 1]]); await wait(100); await tp(c, 'touchEnd', []); await wait(250);
    const note = await p.evaluate(() => { const n = document.getElementById('note'); return n.hidden ? '' : n.textContent });
    ok(/Pacifist is on/.test(note) && (await ammo(p)) === await p.evaluate(() => window.__hl.player.d.ammo), 'Pacifist: a tap says why and spends nothing (' + note + ')');
    await p.evaluate(() => document.getElementById('pacBtn').click()); await wait(700);
    ok(!(await p.evaluate(() => document.body.classList.contains('pac'))), 'Pacifist off: the buttons look ready again');
    await p.ctx.close() }
  // First flight, race 2 (the module button comes in at race 2): the one module button fires
  { const vp = { width: 390, height: 844 };
    const p = await open(b, 'first-flight', { vp, touch: true, ua: ANDROID_UA, init: MOTION, quick: true, query: '&quick=2', storage: { 'hoverline.orient': 'portrait' } });
    await p.evaluate(() => document.getElementById('qkGo').click());
    await until(p, () => window.__hl.S.state === 'race' && window.__hl.S.raceT > 1, 90000, 'quick race');
    await wait(500);
    const c = await p.ctx.newCDPSession(p), f = await centre(p, 'qkFire'), a0 = await ammo(p);
    ok(f.vis, 'First flight race 2: the module button shows');
    await tp(c, 'touchStart', [[f.x, f.y, 1]]); await wait(100); await tp(c, 'touchEnd', []); await wait(300);
    const a1 = await ammo(p);
    ok(a1 < a0 - 5, 'First flight race 2: a tap fires (' + a0.toFixed(0) + ' -> ' + a1.toFixed(0) + ')');
    await p.ctx.close() }
  await b.close(); done();
})().catch((e) => { console.log('FAIL', e.message); process.exit(1) });
