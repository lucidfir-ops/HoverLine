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
  ok(p.errs.length === 0, 'no page errors');
  await b.close(); done();
})();
