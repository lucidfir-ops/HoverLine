// P58: menus with a pad. A dropdown changes only with A (left/right move on, e.g. from the speed class to Pacifist);
// Up from the top row of a screen goes to its main button (the Frame lab: from the frames to Done).
const { launch, open, ok, done, wait } = require('./lib.js');
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
  await b.close(); done();
})();
