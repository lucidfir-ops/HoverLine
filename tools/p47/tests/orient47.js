// Prototype 47: Set orientation. Android phones and tablets (emulated: an Android user agent, full screen and the lock
// recorded) get the screen once, before Tap to race on a fresh browser and over the title otherwise; the choice is saved,
// races lock it, Settings changes it; desktops, the Steam Deck and iPhones never see it.      node orient47.js
const { wait, until, launch, open, ok, done, ANDROID_UA, TABLET_UA, IPHONE_UA, DECK_UA, FS_MOCK } = require('./lib47.js');
const view = (p) => p.evaluate(() => ({ or: !document.getElementById('orSet').hidden, tap: !document.getElementById('qkTap').hidden, title: !document.getElementById('title').hidden,
  locks: window.__locks ? window.__locks.slice() : null, unl: window.__unl, pick: window.__hl.orPick, saved: window.__hl.store.get('hoverline.orient'), fs: !!document.fullscreenElement,
  type: screen.orientation && screen.orientation.type, race: window.__hl.TS.race, on: window.__hl.OR.on, state: window.__hl.S.state }));
const startRace = async (p) => { await p.evaluate(() => document.getElementById('qkGo').click()); await until(p, () => /countdown|race/.test(window.__hl.S.state), 60000, 'race') };
(async () => {
  const b = await launch();
  // 1. a fresh Android phone held upright: Set orientation first, Portrait locks portrait, then Tap to race; the race keeps it
  { const p = await open(b, 'android-p', { vp: { width: 390, height: 844 }, touch: true, ua: ANDROID_UA, init: FS_MOCK, quick: true });
    let v = await view(p); ok(v.or && !v.tap, `fresh Android phone (portrait): Set orientation shows first, not Tap to race (or ${v.or}, tap ${v.tap})`);
    await p.click('[data-or="portrait"]'); await wait(500); v = await view(p);
    ok(!v.or && v.tap && v.pick === 'portrait' && v.saved === 'portrait', 'Portrait: saved, and Tap to race comes up');
    ok(v.fs && v.locks.length === 1 && v.locks[0] === 'portrait-primary' && v.on, `  full screen at once and the screen locked portrait for Tap to race (${JSON.stringify(v.locks)})`);
    await startRace(p); await wait(600); v = await view(p);
    ok(v.locks.length === 1 && v.race === 'p', `  the race keeps that lock and the portrait touch setup (locks ${JSON.stringify(v.locks)}, setup ${v.race})`);
    ok(await p.evaluate(() => window.__hl.qkOn()), '  the choice does not count as having played: the quick race is still on');
    ok(p.errs.length === 0, '  no page errors ' + JSON.stringify(p.errs));
    // the same browser again: no question, straight to Tap to race
    await p.reload(); await wait(2500); v = await view(p); ok(!v.or && v.tap, `  reloaded: no question, Tap to race (or ${v.or}, tap ${v.tap})`);
    await p.ctx.close() }
  // 2. itch's landscape lock: the frame comes up landscape (844x390) with the phone held upright; Portrait locks portrait
  { const p = await open(b, 'android-itch', { vp: { width: 844, height: 390 }, touch: true, ua: ANDROID_UA, init: FS_MOCK, quick: true });
    let v = await view(p); ok(v.or, 'fresh Android phone in a landscape frame (as itch.io opens it): Set orientation shows');
    await p.click('[data-or="portrait"]'); await wait(500); v = await view(p);
    ok(v.locks[0] === 'portrait-primary' && v.type === 'landscape-primary', `  Portrait asks for portrait although the screen stands landscape now (${v.type} -> ${v.locks[0]})`);
    await startRace(p); await wait(500); v = await view(p);
    ok(v.race === 'p', `  the race takes the portrait setup before the screen has turned (setup ${v.race})`);
    await p.ctx.close() }
  // 3. landscape chosen on a landscape screen: the lock keeps the way it stands (landscape-primary)
  { const p = await open(b, 'android-l', { vp: { width: 844, height: 390 }, touch: true, ua: ANDROID_UA, init: FS_MOCK, quick: true });
    await p.click('[data-or="landscape"]'); await wait(500); const v = await view(p);
    ok(v.pick === 'landscape' && v.locks[0] === 'landscape-primary', `Landscape: saved and locked landscape (${JSON.stringify(v.locks)})`); await p.ctx.close() }
  // 4. a phone held upright choosing Landscape: the lock turns it
  { const p = await open(b, 'android-pl', { vp: { width: 390, height: 844 }, touch: true, ua: ANDROID_UA, init: FS_MOCK, quick: true });
    await p.click('[data-or="landscape"]'); await wait(500); let v = await view(p);
    ok(v.locks[0] === 'landscape-primary', `upright phone, Landscape: locks landscape-primary (${JSON.stringify(v.locks)})`);
    await startRace(p); await wait(500); v = await view(p); ok(v.race === 'l', `  the race takes the landscape setup (${v.race})`); await p.ctx.close() }
  // 5. someone who has played here before (a saved setting), on the Doogee-like tablet: the question over the title, no
  //    full screen from it; Settings shows the choice and changes it; a race then locks it
  { const p = await open(b, 'tablet', { vp: { width: 800, height: 1280 }, touch: true, ua: TABLET_UA, init: FS_MOCK, storage: { 'hoverline.touch': '1', 'hoverline.name': 'Eric' } });
    let v = await view(p); ok(v.or && v.title && !v.tap, `returning player, Android tablet: the question over the title (or ${v.or}, title ${v.title})`);
    await p.click('[data-or="landscape"]'); await wait(400); v = await view(p);
    ok(!v.or && v.pick === 'landscape' && !v.fs && v.locks.length === 0, `  Landscape saved; no full screen or lock from the title (locks ${JSON.stringify(v.locks)})`);
    await p.click('#optBtn'); await wait(300); const so = await p.evaluate(() => { const b = [...document.querySelectorAll('#opts button,#opts .btn')].find((x) => /Settings/i.test(x.textContent)); if (b) b.click(); return !!b }); await wait(400);
    let row = await p.evaluate(() => ({ shown: !document.getElementById('orRow').hidden, pressed: [...document.querySelectorAll('[data-orient]')].filter((b) => b.getAttribute('aria-pressed') === 'true').map((b) => b.dataset.orient) }));
    ok(so && row.shown && row.pressed.join() === 'landscape', `  Settings shows "Races: Portrait | Landscape" with Landscape on (${JSON.stringify(row)})`);
    await p.click('[data-orient="portrait"]'); row = await p.evaluate(() => ({ saved: window.__hl.store.get('hoverline.orient'), pick: window.__hl.orPick })); ok(row.saved === 'portrait' && row.pick === 'portrait', '  Portrait in Settings: saved');
    await p.evaluate(() => { document.getElementById('set').hidden = true; window.__hl.startRace() }); await until(p, () => /countdown|race/.test(window.__hl.S.state), 60000, 'race'); await wait(500);
    v = await view(p); ok(v.fs && v.locks.length === 1 && v.locks[0] === 'portrait-primary', `  a race goes full screen and locks portrait (${JSON.stringify(v.locks)})`);
    await p.evaluate(() => { window.__hl.setHud(false); window.__hl.S.state = 'menu' }); await wait(300); v = await view(p); ok(v.unl === 1 && !v.on, '  back in the menus the lock is let go');
    ok(p.errs.length === 0, '  no page errors ' + JSON.stringify(p.errs)); await p.ctx.close() }
  // 6. framed on Android (itch): the lock the page around it set is let go at load
  { const f = await open(b, 'android-framed', { vp: { width: 844, height: 390 }, touch: true, ua: ANDROID_UA, init: FS_MOCK, quick: true, framed: true });
    const v = await f.evaluate(() => ({ unl: window.__unl, or: !document.getElementById('orSet').hidden }));
    ok(v.unl >= 1 && v.or, `framed on Android: the page's lock let go at load (unlock ${v.unl}) and the question shows`); await f.ctx.close() }
  // 7. desktop, the Steam Deck (Firefox, a touch screen), an iPhone: never asked; Settings has no row
  for (const [nm, o] of [['desktop', { vp: { width: 1440, height: 900 } }], ['Steam Deck', { vp: { width: 1280, height: 800 }, touch: true, ua: DECK_UA, init: FS_MOCK }], ['iPhone', { vp: { width: 390, height: 844 }, touch: true, ua: IPHONE_UA }]]) {
    const p = await open(b, nm, { ...o, quick: true }); const v = await view(p);
    const row = await p.evaluate(() => document.getElementById('orRow').hidden);
    ok(!v.or && v.tap && row, `${nm}: no Set orientation, straight to Tap to race; no Settings row`);
    if (nm === 'Steam Deck') { await startRace(p); await wait(500); const w = await view(p); ok(!w.locks || w.locks.length <= 1 && (!w.locks[0] || w.locks[0] === w.type), `  Steam Deck race: holds the way it stands, as before (${JSON.stringify(w.locks)})`) }
    ok(p.errs.length === 0, `  ${nm}: no page errors`); await p.ctx.close() }
  await b.close(); done();
})().catch((e) => { console.error('FAIL', e); process.exit(1) });
