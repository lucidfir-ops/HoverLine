// Prototype 48: menus hold the chosen orientation, the title's rotate button and Settings apply at once, the first touch
// goes full screen with a way chosen, no Open with tilt on the title, and tilt steers in the quick races on phones.
const { wait, until, launch, open, ok, done, ANDROID_UA, TABLET_UA, IPHONE_UA, DECK_UA, FS_MOCK } = require('./lib48.js');
const MOTION = () => { window.__g = { x: 0, y: 9.8, z: 0 }; setInterval(() => { try { window.dispatchEvent(new DeviceMotionEvent('devicemotion', { accelerationIncludingGravity: window.__g, interval: 16 })) } catch (e) {} }, 50) };

const st = (p) => p.evaluate(() => ({ locks: window.__locks.slice(), unl: window.__unl, on: window.__hl.OR.on, pick: window.__hl.orPick, fs: !!document.fullscreenElement,
  rot: !document.getElementById('rotBtn').hidden, own: !document.getElementById('ownTab').hidden, state: window.__hl.S.state }));
(async () => {
  const b = await launch();
  { const p = await open(b, 'phone', { vp: { width: 390, height: 844 }, touch: true, ua: ANDROID_UA, init: FS_MOCK, quick: true });
    await p.click('[data-or="portrait"]'); await wait(500);
    await p.evaluate(() => document.getElementById('qkTapMenu').click()); await wait(800);
    let v = await st(p); ok(v.on && v.unl === 0 && v.locks.at(-1) === 'portrait-primary', `menus keep the portrait lock after leaving Tap to race (${JSON.stringify(v)})`);
    ok(v.rot, 'the title shows the rotate button on an Android phone'); ok(!v.own, 'no Open with tilt on the title');
    await p.click('#rotBtn'); await wait(400); v = await st(p);
    ok(v.pick === 'landscape' && v.locks.at(-1) === 'landscape-primary' && v.on, `rotate: landscape saved and locked at once (${JSON.stringify(v.locks)})`);
    ok(await p.evaluate(() => window.__hl.store.get('hoverline.orient')) === 'landscape', '  and saved');
    await p.evaluate(() => { const b = document.querySelector('[data-orient="portrait"]'); b.click() }); await wait(400); v = await st(p);
    ok(v.pick === 'portrait' && v.locks.at(-1) === 'portrait-primary', `Settings Portrait applies at once (${JSON.stringify(v.locks)})`);
    await p.reload(); await wait(2500); v = await st(p); ok(!v.fs && v.locks.length === 0, 'reloaded: not full screen yet, no lock');
    await p.touchscreen.tap(200, 120); await wait(600); v = await st(p);
    ok(v.fs && v.locks.at(-1) === 'portrait-primary', `  the first touch goes full screen and locks portrait (${JSON.stringify(v)})`);
    ok(p.errs.length === 0, 'no page errors ' + JSON.stringify(p.errs)); await p.ctx.close() }
  for (const [lab, ua, vp, touch] of [['desktop', undefined, { width: 1280, height: 720 }, false], ['deck', DECK_UA, { width: 1280, height: 800 }, false], ['iphone', IPHONE_UA, { width: 390, height: 844 }, true]]) {
    const p = await open(b, lab, { vp, touch, ua, init: FS_MOCK }); const v = await st(p);
    ok(!v.rot && !v.own, `${lab}: no rotate button, no Open with tilt`); await p.ctx.close() }
  // quick race tilt: a phone steers by tilt alongside the slider; a tablet doesn't
  for (const [lab, vp, ua, want] of [['phone', { width: 390, height: 844 }, ANDROID_UA, true], ['tablet', { width: 800, height: 1280 }, TABLET_UA, false]]) {
    const p = await open(b, 'tilt-' + lab, { vp, touch: true, ua, init: MOTION, quick: true, storage: { 'hoverline.orient': 'portrait' } });
    await p.evaluate(() => { const t = document.getElementById('qkTap'); if (!t.hidden) t.click(); else document.getElementById('qkGo') && document.getElementById('qkGo').click() });
    await until(p, () => window.__hl.S.state === 'race', 60000, 'race'); await wait(500);
    const s0 = await p.evaluate(() => window.__hl.readInput().steer);
    await p.evaluate(() => { window.__g = { x: 4, y: 9, z: 0 } }); await wait(400);
    const r = await p.evaluate(() => ({ steer: window.__hl.readInput().steer, ok: window.__hl.tilt.ok, bl: window.__hl.tilt.blocked, q: window.__hl.QK.live }));
    ok(r.q && Math.abs(s0) < 0.05, `${lab} quick race: level phone, no steer (${s0.toFixed(3)})`);
    ok(want ? Math.abs(r.steer) > 0.3 : Math.abs(r.steer) < 0.05, `${lab} quick race: tilted ${want ? 'steers' : 'does not steer'} (${r.steer.toFixed(3)}, ok ${r.ok})`);
    ok(p.errs.length === 0, '  no page errors'); await p.ctx.close() }
  await b.close(); done();
})().catch((e) => { console.log('FAIL', e.message); process.exit(1) });
