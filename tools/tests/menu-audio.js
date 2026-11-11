// P61: menu audio. Fresh storage: after the first press the menus play the race music (not ambient), Ambient is a
// remembered option; moving through the menus keeps the same tune; the engine hum is silent outside flying.
const { launch, open, ok, done, wait } = require('./lib.js');
const st = (p) => p.evaluate(() => { const h = window.__hl, a = window.__nb.audio; return { code: h.music.code(), mood: h.music.mood, eg: a.eg ? a.eg.gain.value : -1, state: h.S.state, menu: h.store.get('hoverline.menumus'), chip: document.querySelector('.listen').textContent } });
const click = (p, id) => p.evaluate((i) => document.getElementById(i).click(), id);
const VP = { width: 1280, height: 800 };
(async () => {
  const b = await launch(); const p = await open(b, 'ma', { vp: VP });
  await p.mouse.click(640, 400); await wait(3500);
  let s = await st(p);
  ok(s.mood === 'listen' && /Race/.test(s.chip), 'fresh: first press starts the race music in the menu (' + JSON.stringify(s) + ')');
  ok(s.eg >= 0 && s.eg < 0.002, 'engine silent in the title menu (' + s.eg + ')');
  const c0 = s.code; ok(!!c0, 'a tune is playing');
  const same = async (what) => { await wait(400); const x = await st(p); ok(x.code === c0 && x.mood === 'listen', 'same tune after ' + what + ' (' + x.code + ' vs ' + c0 + ', ' + x.mood + ')') };
  await click(p, 'optBtn'); await same('Options');
  await click(p, 'setBtn'); await same('Settings');
  await p.evaluate(() => window.openMus ? 0 : 0); await p.evaluate(() => { const b = [...document.querySelectorAll('#set button')].find((x) => /music/i.test(x.textContent)); if (b) b.click() }); await same('Music');
  await p.evaluate(() => window.__hl.showPage('title')); await same('back to the title');
  await click(p, 'carBtn'); await same('Career'); await p.evaluate(() => window.__hl.showPage('title'));
  await click(p, 'playBtn'); await same('Play'); await p.evaluate(() => window.__hl.showPage('title')); await same('title again');
  await p.evaluate(() => { window.__hl.loadTrack(12345); window.__hl.loadTrack(777) }); await same('picking other tracks (loadTrack)');
  await p.evaluate(() => { window.__hl.S.state = 'fsel' }); await wait(1500); s = await st(p); ok(s.eg < 0.002, 'engine silent in the frame select (' + s.eg + ')');
  await p.evaluate(() => { window.__hl.S.state = 'lab' }); await wait(500); s = await st(p); ok(s.eg < 0.002, 'engine silent in the Frame lab (' + s.eg + ')');
  await p.evaluate(() => { window.__hl.S.state = 'menu' });
  await p.evaluate(() => window.__hl.startRace()); await wait(5500);
  s = await st(p); ok(s.eg > 0.02, 'engine audible in a race (' + s.eg + ', ' + s.state + ')');
  await p.evaluate(() => { document.querySelector('.listen').click() }); await wait(200);
  s = await st(p); ok(s.menu === 'ambient' || s.menu === 'race', 'choice saved (' + s.menu + ')');
  const p2 = await open(b, 'ma2', { vp: VP, storage: { 'hoverline.menumus': 'ambient' } });
  await p2.mouse.click(640, 400); await wait(2500); s = await st(p2);
  ok(s.mood === 'menu' && /Ambient/.test(s.chip), 'saved Ambient stays (' + JSON.stringify(s) + ')');
  await p2.evaluate(() => { window.__hl.loadTrack(4242) }); await wait(400); const s2 = await st(p2); ok(s2.code === s.code, 'ambient tune carries on when a track is picked (' + s.code + ' vs ' + s2.code + ')');
  const p3 = await open(b, 'ma3', { vp: VP, storage: { 'hoverline.music': 'dnb' } });
  await p3.mouse.click(640, 400); await wait(2500); s = await st(p3);
  ok(s.mood === 'menu', 'existing player (music saved, no menu choice) keeps ambient (' + s.mood + ')');
  ok(p.errs.length + p2.errs.length + p3.errs.length === 0, 'no page errors'); await b.close(); done();
})().catch((e) => { console.log('FAIL', e.message); process.exit(1) });
