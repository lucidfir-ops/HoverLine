// Probe: render the test clip's frame plain and through the composite, to find where a haze comes from.
const path = require('path');
const { openPage, launch } = require('./page.js');
const LIB = ['lib/neon.js', 'lib/stage.js', 'lib/objects.js', 'lib/rooms.js', 'clips.js'].map((f) => path.join(__dirname, f));
const out = process.argv[2];
(async () => {
  const b = await launch(); const p = await openPage(b, 640, 360, LIB);
  await p.evaluate(() => { const SP = window.SPFX, ST = SP.stage; ST.size(640, 360); ST.patchComp(); SP.CLIPS.test.setup(); ST.size(640, 360); ST.frame(1, 1 / 6, SP.CLIPS.test) });
  await p.screenshot({ path: out + '/a.png' });
  const info = await p.evaluate(() => { const c = window.__cv; c.renderer.setRenderTarget(null); c.renderer.render(c.scene, c.camera); return { calls: c.renderer.info.render.calls, ok: c.GFX.ok, comp: !!c.GFX.comp.userData.spfx } });
  console.log(JSON.stringify(info));
  await p.screenshot({ path: out + '/b.png' });
  await p.evaluate(() => { const c = window.__cv; c.scene.background.set(0xff0000); c.renderer.render(c.scene, c.camera) });
  await p.screenshot({ path: out + '/c.png' });
  await b.close();
})();
