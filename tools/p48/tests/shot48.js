const { wait, launch, open, ANDROID_UA, FS_MOCK } = require('./lib48.js');
(async () => { const b = await launch();
  for (const [n, vp] of [['portrait', { width: 390, height: 844 }], ['landscape', { width: 844, height: 390 }]]) {
    const p = await open(b, n, { vp, touch: true, ua: ANDROID_UA, init: FS_MOCK, storage: { 'hoverline.orient': n }, render: true, settle: 2500 });
    await p.screenshot({ path: `/home/claude/p48/title_${n}.png` }); await p.ctx.close() }
  await b.close() })();
