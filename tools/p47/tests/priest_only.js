// the machine-priest alone, on a light and a dark panel, calling and listening: node priest_only.js OUT.png
const { launch, open, wait } = require('./lib47.js');
(async () => { const b = await launch(); const p = await open(b, 'priest', { vp: { width: 760, height: 220 }, dpr: 2 });
  await p.evaluate(() => { const row = document.createElement('div'); row.style.cssText = 'position:fixed;inset:0;z-index:99;display:flex'; document.body.appendChild(row);
    for (const [bg, ink, glow, jaw, eyes, tx] of [['#ffffff', '#1b1f27', '#0a8fa0', 0.95, 1, true], ['#ffffff', '#1b1f27', '#0a8fa0', 0, 0.5, false], ['#0a0c12', '#f2efe6', '#3ff0ff', 0.95, 1, true], ['#0a0c12', '#f2efe6', '#3ff0ff', 0.45, 1, true], ['#0a0c12', '#f2efe6', '#3ff0ff', 0, 0.5, false]]) {
      const d = document.createElement('div'); d.style.cssText = `flex:1;background:${bg};display:flex;align-items:center;justify-content:center`; const c = document.createElement('canvas'); c.className = 'priest'; c.style.cssText = `width:140px;height:120px;color:${ink};--glow:${glow}`; d.appendChild(c); row.appendChild(d);
      window.__nb.priestDraw(c, { t: 0.31, still: true, tx, jaw, eyes }) } });
  await wait(200); await p.screenshot({ path: process.argv[2] }); await b.close() })();
