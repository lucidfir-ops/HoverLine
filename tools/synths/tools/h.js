// Headless loader for the P45 synth work: const H=require('./h.js'); const {browser,page}=await H.open(html)
// Exposes window.__s = {music,audio,SYN,SL,TBP,TBF,TREG,TPL,TPD,rng,mtof,parseTune}. three.js is routed locally.
const { chromium } = require('/opt/npm-tools/node_modules/playwright'); const fs = require('fs');
const three = fs.readFileSync('/home/claude/sim/node_modules/three/build/three.min.js', 'utf8');
function prep(HTML) {
  let html = fs.readFileSync(HTML, 'utf8'); const a = 'requestAnimationFrame(frame);\n})();';
  if (!html.includes(a)) throw new Error('hook anchor');
  const has = html.includes('const SYN={');
  return html.replace(a, 'requestAnimationFrame(frame);window.__s={music,audio,rng,mtof,parseTune,SL,TBP,TBF,TREG,TPD,TFALL,' + (has ? 'SYN,' : '') + 'get TPL(){return TPL}};\n})();')
}
async function open(HTML, opts = {}) {
  const html = prep(HTML);
  const browser = await chromium.launch({ args: ['--use-gl=swiftshader', '--autoplay-policy=no-user-gesture-required', '--js-flags=--max-old-space-size=4096'] });
  const ctx = await browser.newContext(); const page = await ctx.newPage();
  page.on('pageerror', e => console.log('PAGEERROR', String(e.stack || e).slice(0, 800)));
  page.on('console', m => { if (m.type() === 'error' || opts.verbose) console.log('CONSOLE', m.type(), m.text().slice(0, 400)) });
  await page.route('**/*', r => { const u = r.request().url(); if (u.startsWith('http://127.0.0.1:8099/')) return r.fulfill({ contentType: 'text/html; charset=utf-8', body: html }); if (u.includes('three')) return r.fulfill({ contentType: 'application/javascript', body: three }); return r.abort() });
  await page.goto('http://127.0.0.1:8099/?quick=0&share=0&lb=http://127.0.0.1:9' + (opts.render0 ? '&render=0' : ''));
  await page.waitForFunction(() => !!window.__s, null, { timeout: 90000 });
  return { browser, page }
}
// write interleaved 16-bit stereo WAV
function wav(path, L, R, sr) {
  const n = L.length, b = Buffer.alloc(44 + n * 4); b.write('RIFF', 0); b.writeUInt32LE(36 + n * 4, 4); b.write('WAVE', 8); b.write('fmt ', 12); b.writeUInt32LE(16, 16); b.writeUInt16LE(1, 20); b.writeUInt16LE(2, 22);
  b.writeUInt32LE(sr, 24); b.writeUInt32LE(sr * 4, 28); b.writeUInt16LE(4, 32); b.writeUInt16LE(16, 34); b.write('data', 36); b.writeUInt32LE(n * 4, 40);
  for (let i = 0; i < n; i++) { b.writeInt16LE(Math.round(Math.max(-1, Math.min(1, L[i])) * 32767), 44 + i * 4); b.writeInt16LE(Math.round(Math.max(-1, Math.min(1, R[i])) * 32767), 46 + i * 4) }
  fs.writeFileSync(path, b)
}
module.exports = { open, prep, wav };
