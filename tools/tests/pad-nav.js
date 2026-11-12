// P58: menus with a pad. A dropdown changes only with A (left/right move on, e.g. from the speed class to Pacifist);
// Up from the top row of a screen goes to its main button (the Frame lab: from the frames to Done).
const { launch, open, ok, done, wait, until, ANDROID_UA, FS_MOCK } = require('./lib.js');
(async () => {
  const b = await launch(); const p = await open(b, 'nav', { vp: { width: 1280, height: 800 } });
  await p.evaluate(() => { document.getElementById('playBtn').click() }); await wait(300); await p.evaluate(() => { document.getElementById('raceMode').click() }); await wait(400);
  const r1 = await p.evaluate(() => { const h = window.__hl, sel = document.getElementById('clsSel'); h.navFocus(sel); const v0 = sel.value; h.navDir('r'); const after = sel.value, foc = document.activeElement && (document.activeElement.id || document.activeElement.textContent.trim());
    h.navFocus(sel); h.navAct(); return { v0, after, foc, act: sel.value } });
  ok(r1.after === r1.v0, 'right on the speed class leaves it as it was (' + r1.v0 + ')');
  ok(r1.foc !== 'clsSel', 'right moves on from the speed class (to ' + r1.foc + ')');
  ok(r1.act !== r1.v0, 'A changes the speed class (' + r1.v0 + ' -> ' + r1.act + ')');
  await p.evaluate(() => { const s = document.getElementById('clsSel'); s.selectedIndex = 0; s.dispatchEvent(new Event('change')) });
  await p.evaluate(() => { document.querySelectorAll('.overlay').forEach(o => o.hidden = o.id !== 'menu'); const m = document.getElementById('menu'); if (m) m.hidden = false; document.getElementById('labBtn').click() }); await wait(500);
  const r2 = await p.evaluate(() => { const h = window.__hl, f = document.querySelector('#labFrame button'); if (!f) return { err: 'no frame buttons' }; h.navFocus(f); h.navDir('u'); return { foc: document.activeElement && document.activeElement.id } });
  ok(r2.foc === 'labDone', 'up from the frames goes to Done (' + JSON.stringify(r2) + ')');
  // P61: the Training page (four buttons in a 2x2 grid and Back) with a pad: move, press, and B goes back
  await p.evaluate(() => { document.getElementById('labDone').click() }); await wait(300);
  await p.evaluate(() => { window.__hl.showPage('play'); document.getElementById('trainBtn').click() }); await wait(300);
  const r3 = await p.evaluate(() => { const h = window.__hl, id = () => document.activeElement && document.activeElement.id, o = {};
    h.NAV.el = null; h.navDir('d'); o.first = id(); h.navDir('r'); o.right = id(); h.navDir('d'); o.down = id(); h.navDir('l'); o.left = id(); h.navDir('d'); o.back = id(); return o });
  ok(r3.first === 'guideBtn' && r3.right === 'tutBtn' && r3.down === 'pracBtn' && r3.left === 'ffBtn' && r3.back === 'trmBack', 'Training: the pad reaches all four and Back (' + JSON.stringify(r3) + ')');
  await p.evaluate(() => { const h = window.__hl; h.navFocus(document.getElementById('pracBtn')); h.navAct() }); await wait(400);
  ok(await p.evaluate(() => !document.getElementById('train').hidden), 'Training: A on Practice tracks opens the drill page');
  await p.evaluate(() => window.__hl.navBack()); await wait(300);
  ok(await p.evaluate(() => !document.getElementById('trmenu').hidden), 'Training: B from Practice tracks comes back to Training');
  await p.evaluate(() => { const h = window.__hl; h.navFocus(document.getElementById('ffBtn')); h.navAct() }); await wait(500);
  const r4 = await p.evaluate(() => ({ tap: !document.getElementById('qkTap').hidden, rep: window.__hl.QK.rep }));
  ok(r4.tap && r4.rep, 'Training: A on First flight opens Tap to race');
  await p.evaluate(() => window.__hl.navBack()); await wait(400);
  ok(await p.evaluate(() => !document.getElementById('trmenu').hidden && document.getElementById('qkTap').hidden), 'Training: B on Tap to race (Back) returns to Training');
  await p.evaluate(() => window.__hl.navBack()); await wait(200);
  ok(await p.evaluate(() => !document.getElementById('play').hidden), 'Training: B goes back to the Race page');
  ok(p.errs.length === 0, 'no page errors');
  // P63: the pause menu has the rotate button (a phone that can lock the screen): the pad reaches it, it turns the lock to the
  // other way round and saves it; coming back to a hidden, paused race locks again, and the Resume tap does it where the
  // browser let go of full screen. (How it feels on a phone is Eric's: Chromium here has no real lock.)
  { const q = await open(b, 'rot', { vp: { width: 390, height: 844 }, touch: true, ua: ANDROID_UA, init: FS_MOCK, storage: { 'hoverline.orient': 'portrait' } });
    await q.evaluate(() => window.__hl.startRace()); await until(q, () => window.__hl.S.state === 'race' && window.__hl.S.raceT > 1, 90000, 'race');
    await q.evaluate(() => window.__hl.togglePause('test')); await wait(300);
    const vis = await q.evaluate(() => { const e = document.getElementById('pauseRot'); return !e.hidden && e.getClientRects().length > 0 && /landscape/.test(e.getAttribute('aria-label')) });
    ok(vis, 'pause menu: the rotate button shows on a phone, offering landscape');
    const nav = await q.evaluate(() => { const h = window.__hl, id = () => document.activeElement && document.activeElement.id; h.navFocus(document.getElementById('resumeBtn')); const seen = [id()]; for (let i = 0; i < 6 && id() !== 'pauseRot'; i++) { h.navDir('r'); seen.push(id()) } return { at: id(), seen } });
    ok(nav.at === 'pauseRot', 'pause menu: the pad reaches the rotate button (' + nav.seen.join(' > ') + ')');
    await q.evaluate(() => window.__hl.navAct()); await wait(400);
    let r = await q.evaluate(() => ({ pick: window.__hl.orPick, saved: window.__hl.store.get('hoverline.orient'), locks: window.__locks.slice(), fs: !!document.fullscreenElement, st: window.__hl.S.state, lab: document.getElementById('pauseRot').getAttribute('aria-label') }));
    ok(r.pick === 'landscape' && r.saved === 'landscape' && r.st === 'paused' && r.fs && r.locks.length && /^landscape/.test(r.locks[r.locks.length - 1]) && /portrait/.test(r.lab), 'pause menu: the button turns the lock to landscape, saves it, stays in the pause ' + JSON.stringify(r));
    await q.evaluate(() => window.__hl.navAct()); await wait(300);
    r = await q.evaluate(() => ({ pick: window.__hl.orPick, locks: window.__locks.slice() }));
    ok(r.pick === 'portrait' && /^portrait/.test(r.locks[r.locks.length - 1]), 'pause menu: pressed again it goes back to portrait (' + r.locks.join(',') + ')');
    // away and back: the page was hidden (the race paused itself), the browser dropped full screen and the lock
    await q.evaluate(() => { document.exitFullscreen(); window.__vis = 'hidden'; Object.defineProperty(document, 'hidden', { get: () => window.__vis === 'hidden', configurable: true }); Object.defineProperty(document, 'visibilityState', { get: () => window.__vis, configurable: true }); document.dispatchEvent(new Event('visibilitychange')); window.__locks.length = 0 });
    await wait(300); await q.evaluate(() => { window.__vis = 'visible'; document.dispatchEvent(new Event('visibilitychange')) }); await wait(300);
    r = await q.evaluate(() => ({ st: window.__hl.S.state, fs: !!document.fullscreenElement, locks: window.__locks.slice() }));
    ok(r.st === 'paused' && !r.fs, 'back from elsewhere: still paused; the browser let go of full screen, so it waits for a tap (' + JSON.stringify(r) + ')');
    await q.evaluate(() => document.getElementById('resumeBtn').click()); await wait(500);
    r = await q.evaluate(() => ({ st: window.__hl.S.state, fs: !!document.fullscreenElement, locks: window.__locks.slice() }));
    ok(r.st === 'race' && r.fs && r.locks.length && /^portrait/.test(r.locks[r.locks.length - 1]), 'Resume: full screen again and the portrait lock taken again ' + JSON.stringify(r));
    // and away and back with full screen kept: the lock is taken again at once, with no tap
    await q.evaluate(() => window.__hl.togglePause('test')); await wait(200);
    await q.evaluate(() => { window.__vis = 'hidden'; document.dispatchEvent(new Event('visibilitychange')); window.__locks.length = 0 }); await wait(100);
    await q.evaluate(() => { window.__vis = 'visible'; document.dispatchEvent(new Event('visibilitychange')) }); await wait(300);
    r = await q.evaluate(() => ({ locks: window.__locks.slice() }));
    ok(r.locks.length > 0 && /^portrait/.test(r.locks[0]), 'back with full screen kept: the lock is taken again with no tap (' + r.locks.join(',') + ')');
    ok(q.errs.length === 0, 'no page errors (pause rotate)'); await q.ctx.close() }
  { const q = await open(b, 'rot-desk', { vp: { width: 1280, height: 800 } });
    await q.evaluate(() => window.__hl.startRace()); await until(q, () => window.__hl.S.state === 'race' && window.__hl.S.raceT > 1, 90000, 'race'); await q.evaluate(() => window.__hl.togglePause('test')); await wait(200);
    ok(await q.evaluate(() => document.getElementById('pauseRot').hidden), 'pause menu: no rotate button on a desktop or the Deck'); await q.ctx.close() }
  await b.close(); done();
})();
