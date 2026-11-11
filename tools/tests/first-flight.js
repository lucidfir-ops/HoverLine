// P61: First flight is the five quick races (QK). A fresh browser launches straight into race 1 in the Blade, with no
// frame select; Skip lands on the title with the notice and stops it starting by itself; finishing race 5 offers Start new
// career -> frame select -> control tutorial -> career page. Training is four buttons (Nose guide, Control tutorial,
// First flight, Practice tracks), each opening the right thing; a First flight replay leaves the career, builds, bests and
// settings alone. Options has no Nose guide or Tutorial. The touch controls hide after a pad or a key and come back on a
// touch, in a race and in the control tutorial. SHOTS=dir saves the Training page and the end of First flight.
const { launch, open, ok, done, wait, until } = require('./lib.js');
const SHOTS = process.env.SHOTS || '';
const vis = (p, id) => p.evaluate((i) => { const e = document.getElementById(i); return !!e && !e.hidden && e.getClientRects().length > 0 }, id);
const click = (p, id) => p.evaluate((i) => document.getElementById(i).click(), id);
const txt = (p, id) => p.evaluate((i) => document.getElementById(i).textContent, id);
const note = (p) => p.evaluate(() => { const e = document.getElementById('note'); return e.hidden ? '' : e.textContent });
const state = (p) => p.evaluate(() => window.__hl.S.state);
// a fake pad: navigator.getGamepads returns window.__pad, whose buttons a test can press
const fakePad = () => { const mk = () => ({ pressed: false, value: 0, touched: false });
  window.__pad = { id: 'Xbox 360 Controller (XInput STANDARD GAMEPAD)', index: 0, connected: true, mapping: 'standard', axes: [0, 0, 0, 0], buttons: Array.from({ length: 17 }, mk), timestamp: 0 };
  navigator.getGamepads = () => [window.__pad] };
const padPress = async (p, i) => { await p.evaluate((i) => { window.__pad.buttons[i].pressed = true; window.__pad.buttons[i].value = 1 }, i); await wait(250);
  await p.evaluate((i) => { window.__pad.buttons[i].pressed = false; window.__pad.buttons[i].value = 0 }, i); await wait(150) };
const touchShown = (p) => p.evaluate(() => { const t = document.getElementById('touch'); return !t.hidden });
(async () => {
  const b = await launch();
  // 1 a fresh browser launches into quick race 1 in the Blade, no frame select, no offer card
  let p = await open(b, 'ff1', { quick: true, vp: { width: 1280, height: 800 } });
  let r = await p.evaluate(() => ({ live: window.__hl.QK.live, cur: window.__hl.QK.cur, frame: window.__hl.build.frame, ffAsk: !!document.getElementById('ffAsk') }));
  ok(r.live && r.cur === 1, 'fresh storage: First flight, race 1, is up at launch (' + JSON.stringify(r) + ')');
  ok(await vis(p, 'qkTap') && !(await vis(p, 'title')) && !(await vis(p, 'fsel')), 'Tap to race shows; no title, no frame select');
  ok(!r.ffAsk, 'the Prototype 60 offer card is gone');
  ok(r.frame === 'blade', 'flown in the Blade (' + r.frame + ')');
  ok(await vis(p, 'qkTapMenu') && /Skip/.test(await txt(p, 'qkTapMenu')), 'the corner chip says Skip');
  await click(p, 'qkGo'); await wait(600);
  r = await p.evaluate(() => ({ st: window.__hl.S.state, frame: window.__hl.player.frame || window.__hl.build.frame, fsel: !document.getElementById('fsel').hidden }));
  ok((r.st === 'countdown' || r.st === 'race') && !r.fsel, 'Tap to race starts race 1 straight away (' + r.st + ')');
  ok(p.errs.length === 0, 'no page errors (launch)');
  await p.ctx.close();

  // 2 Skip: the title, the notice, and a reload goes to the title
  p = await open(b, 'ff2', { quick: true, vp: { width: 1280, height: 800 } });
  await click(p, 'qkTapMenu'); await wait(300);
  ok(await vis(p, 'title') && !(await vis(p, 'qkTap')), 'Skip lands on the title');
  const n = await note(p);
  ok(/^First flight skipped\. Replay it any time from Training › First flight\.$/.test(n), 'the notice says where to replay it (' + n + ')');
  ok(await p.evaluate(() => JSON.parse(window.__hl.store.get('hoverline.quick') || '{}').on === false), 'skipping stops it starting by itself');
  await p.reload(); for (let k = 0; k < 40; k++) { if (await p.evaluate(() => !!window.__hl).catch(() => false)) break; await wait(250) } await wait(700);
  ok(await vis(p, 'title') && !(await vis(p, 'qkTap')), 'the next launch goes to the title');
  ok(p.errs.length === 0, 'no page errors (skip)');
  await p.ctx.close();

  // 3 finishing race 5: Start new career -> frame select -> control tutorial -> career page
  p = await open(b, 'ff3', { quick: true, query: '&quick=5', vp: { width: 1280, height: 800 } });
  ok(await p.evaluate(() => window.__hl.QK.cur) === 5, 'race 5 is up');
  await click(p, 'qkGo'); await until(p, () => window.__hl.S.state === 'race', 15000, 'race 5 start');
  await p.evaluate(() => { const h = window.__hl; h.player.finishT = 61.2; h.qkFinish() }); await until(p, () => !document.getElementById('qkEnd').hidden, 5000, 'end screen');
  ok(await vis(p, 'qkEndMsg') && /Start new career/.test(await txt(p, 'qkNext')), 'the end of First flight offers Start new career');
  ok(await vis(p, 'qkEndSub'), 'with a line on what comes next');
  ok(!(await vis(p, 'qkOnEnd')), 'no "Start with a quick race" chip on the First flight ladder');
  if (SHOTS) { await p.screenshot({ path: SHOTS + '/ff-end-1280.png' }); await p.setViewportSize({ width: 800, height: 400 }); await wait(300); await p.screenshot({ path: SHOTS + '/ff-end-800x400.png' }); await p.setViewportSize({ width: 1280, height: 800 }); await wait(200) }
  await click(p, 'qkNext'); await wait(600);
  ok(await vis(p, 'fsel') && /New career/.test(await txt(p, 'fsSub')), 'Start new career opens the frame select');
  await p.evaluate(() => document.querySelector('#fsRow [data-fk="skiff"]').click()); await wait(300);
  await click(p, 'fsGo'); await wait(700);
  r = await p.evaluate(() => ({ st: window.__hl.S.state, frame: window.__hl.build.frame, car: window.__hl.carExists(), tut: !document.getElementById('tut').hidden }));
  ok(r.st === 'tut' && r.tut && r.frame === 'skiff' && r.car, 'choosing a frame starts the career and the control tutorial with it (' + JSON.stringify(r) + ')');
  ok(!(await vis(p, 'tutAsk')), 'no guidance question in between');
  await click(p, 'tutSkip'); await wait(400);
  ok(await vis(p, 'career'), 'the control tutorial ends on the career page');
  ok(/Control tutorial skipped.*Training › Control tutorial/.test(await note(p)), 'skipping it says where to replay it');
  ok(p.errs.length === 0, 'no page errors (career)');
  await p.ctx.close();

  // 4 Training: four buttons, each opening the right thing; Options has neither Nose guide nor Tutorial
  p = await open(b, 'ff4', { vp: { width: 1280, height: 800 }, storage: { 'hoverline.career': JSON.stringify({ v: 2, cr: 777, up: 1, fr: 'dart', best: [1, 2] }) } });
  ok(!(await vis(p, 'qkTap')) && await vis(p, 'title'), 'a used browser (quick=0) opens on the title');
  await click(p, 'optBtn'); await wait(150);
  r = await p.evaluate(() => [...document.querySelectorAll('#opts .btn.mode')].map((e) => e.id));
  ok(!r.includes('guideBtn') && !r.includes('tutBtn') && r.length === 2, 'Options: Settings and Controls only (' + r.join(' ') + ')');
  await click(p, 'optDone'); await click(p, 'playBtn'); await click(p, 'trainBtn'); await wait(200);
  r = await p.evaluate(() => [...document.querySelectorAll('#trmenu .btn.mode')].map((e) => e.firstChild.textContent.trim()));
  ok(await vis(p, 'trmenu') && JSON.stringify(r) === JSON.stringify(['Nose guide', 'Control tutorial', 'First flight', 'Practice tracks']), 'Training has the four buttons (' + r.join(', ') + ')');
  if (SHOTS) { await p.screenshot({ path: SHOTS + '/training-1280.png' }); await p.setViewportSize({ width: 800, height: 400 }); await wait(300); await p.screenshot({ path: SHOTS + '/training-800x400.png' }); await p.setViewportSize({ width: 1280, height: 800 }); await wait(200) }
  const snap = () => p.evaluate(() => { const o = {}; for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (!/^hoverline\.(quick|log|logs|mhist|mtpl|mtrk|tut|fheard|lbq|mood)/.test(k)) o[k] = localStorage.getItem(k) } return o });
  const before = await snap(); // the music's memory (mhist, mtpl, mtrk), logs and the quick races' own record may change
  await click(p, 'guideBtn'); await wait(200);
  ok(await vis(p, 'guide') && !(await vis(p, 'trmenu')), 'Nose guide opens the guide');
  await click(p, 'guideDone'); await wait(150);
  ok(await vis(p, 'trmenu'), 'Done returns to Training');
  await click(p, 'tutBtn'); await wait(500);
  r = await p.evaluate(() => ({ st: window.__hl.S.state, frame: window.__hl.build.frame }));
  ok(r.st === 'tut' && await vis(p, 'tut') && !(await vis(p, 'fsel')), 'Control tutorial starts the tutorial with the frame you have, no frame select (' + r.frame + ')');
  await click(p, 'tutSkip'); await wait(300);
  ok(await vis(p, 'trmenu'), 'Skip in the control tutorial returns to Training');
  await click(p, 'pracBtn'); await wait(400);
  ok(await vis(p, 'train') && /PRACTICE/.test(await p.evaluate(() => document.querySelector('#train .logo').textContent)), 'Practice tracks opens the drill page');
  await click(p, 'trBack'); await wait(300);
  ok(await vis(p, 'trmenu'), 'Back from Practice tracks returns to Training');
  await click(p, 'ffBtn'); await wait(500);
  r = await p.evaluate(() => ({ live: window.__hl.QK.live, rep: window.__hl.QK.rep, frame: window.__hl.build.frame, chip: document.getElementById('qkTapMenu').textContent }));
  ok(r.live && r.rep && r.frame === 'blade' && await vis(p, 'qkTap') && r.chip === 'Back', 'First flight replays the quick races in the Blade (' + JSON.stringify(r) + ')');
  await click(p, 'qkGo'); await until(p, () => window.__hl.S.state === 'race', 15000, 'replay race');
  ok(await p.evaluate(() => window.__hl.S.car == null && !window.__hl.S.train), 'the replay is not a career or practice race');
  await p.evaluate(() => window.__hl.toMenu()); await wait(500);
  ok(await vis(p, 'trmenu') && !(await note(p)), 'leaving the replay returns to Training, with no skip notice');
  const after = await snap(), diff = Object.keys({ ...before, ...after }).filter((k) => before[k] !== after[k]);
  ok(diff.length === 0, 'career, builds, bests and settings untouched by the replay and the tutorial (' + diff.join(' ') + ')');
  ok(p.errs.length === 0, 'no page errors (training)');
  await p.ctx.close();

  // 5 touch controls follow the device in use: a race and the control tutorial, on a touch screen with a pad
  p = await open(b, 'ff5', { touch: true, vp: { width: 900, height: 500 }, init: fakePad });
  ok(await p.evaluate(() => window.__hl.coarse && window.__hl.lastDev === 'touch'), 'a touch screen starts in touch');
  await p.evaluate(() => window.__hl.startRace()); await wait(800);
  ok(await touchShown(p), 'race: touch controls show for a touch player');
  await padPress(p, 0);
  ok(await p.evaluate(() => window.__hl.lastDev) === 'pad' && !(await touchShown(p)), 'race: a pad press hides the touch controls');
  ok(await vis(p, 'slots'), 'race: the module slots with the pad buttons show instead');
  await p.touchscreen.tap(450, 120); await wait(250);
  ok(await touchShown(p), 'race: a touch brings them back');
  await p.keyboard.press('ArrowLeft'); await wait(250);
  ok(!(await touchShown(p)), 'race: a key hides them');
  await p.evaluate(() => window.__hl.toMenu()); await wait(500);
  await p.touchscreen.tap(5, 5); await wait(150);
  await click(p, 'playBtn'); await click(p, 'trainBtn'); await wait(100);
  await click(p, 'tutBtn'); await wait(700);
  ok(await p.evaluate(() => window.__hl.S.state) === 'tut', 'the control tutorial starts on a touch screen');
  const tutDo = () => p.evaluate(() => document.getElementById('tutDo').textContent);
  const t0 = await tutDo();
  ok(await touchShown(p) && await p.evaluate(() => document.getElementById('tut').classList.contains('touch')), 'tutorial: touch controls show for a touch player (' + t0 + ')');
  await padPress(p, 1); await wait(200);
  const t1 = await tutDo();
  ok(!(await touchShown(p)) && /stick/i.test(t1) && t1 !== t0, 'tutorial: a pad press hides them and names the pad (' + t1 + ')');
  ok(/Menu/.test(await txt(p, 'tutSkip')), 'tutorial: Skip names the pad button');
  await p.touchscreen.tap(450, 400); await wait(300);
  ok(await touchShown(p) && await tutDo() === t0, 'tutorial: a touch brings them back with the touch words');
  await p.keyboard.press('ArrowRight'); await wait(300);
  ok(!(await touchShown(p)) && /←|→|A|D/.test(await tutDo()), 'tutorial: a key hides them and names the keys');
  await click(p, 'tutSkip'); await wait(300);
  ok(!(await touchShown(p)), 'the touch controls go with the tutorial');
  ok(p.errs.length === 0, 'no page errors (touch)');
  await b.close(); done();
})();
