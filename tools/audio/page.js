// Prototype 62: a headless Chromium page of the built game with the request recorder (req-hook.js) in it.
//   open({file, samples: true|false, strict, cut})  samples: serve the repo's samples/ folder (the hosted build) or
//   answer 404 for it (the single-file offline copy, or a failed fetch: the music falls back to the embedded recordings).
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
const { prepHtml } = require('./req-hook.js');
const ROOT = path.join(__dirname, '..', '..');
const THREE = fs.readFileSync(path.join(ROOT, 'vendor', 'three.min.js'), 'utf8');
const ORIGIN = 'http://127.0.0.1:8099';
const MIME = { '.json': 'application/json', '.js': 'application/javascript', '.flac': 'audio/flac' };

const htmlCache = {};
function html(file, opt) { const k = file + JSON.stringify(opt); return htmlCache[k] || (htmlCache[k] = prepHtml(file, opt)) }

async function launch() {
  return chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--autoplay-policy=no-user-gesture-required', '--disable-renderer-backgrounding', '--disable-background-timer-throttling'] });
}

async function open(browser, o = {}) {
  const file = o.file || process.env.PAGE || path.join(ROOT, 'index.html');
  const body = html(file, { strict: !!o.strict, cut: o.cut });
  const ctx = await browser.newContext({ viewport: { width: 480, height: 270 } });
  if (o.storage) await ctx.addInitScript((st) => { try { for (const [k, v] of Object.entries(st)) localStorage.setItem(k, v) } catch (e) {} }, o.storage);
  const p = await ctx.newPage(); p.errs = [];
  p.on('pageerror', (e) => p.errs.push(String(e.stack || e.message || e).slice(0, 500)));
  p.on('console', (m) => { if (o.verbose) console.log('  [page]', m.text().slice(0, 200)) });
  p.reqs404 = []; p.fetched = {};
  await p.route('**/*', (r) => {
    const u = r.request().url();
    if (u.startsWith(ORIGIN + '/samples/')) {
      if (!o.samples) { p.reqs404.push(u); return r.fulfill({ status: 404, body: '' }) }
      const rel = decodeURIComponent(u.slice((ORIGIN + '/samples/').length).split('?')[0]); p.fetched[rel] = (p.fetched[rel] || 0) + 1;
      const f = path.join(ROOT, 'samples', rel);
      if (f.startsWith(path.join(ROOT, 'samples')) && fs.existsSync(f)) return r.fulfill({ contentType: MIME[path.extname(f)] || 'application/octet-stream', body: fs.readFileSync(f) });
      return r.fulfill({ status: 404, body: '' });
    }
    if (u.startsWith(ORIGIN + '/songs/')) return r.fulfill({ status: 404, body: '' });
    if (u.startsWith(ORIGIN + '/')) return r.fulfill({ contentType: 'text/html; charset=utf-8', body });
    if (u.includes('three')) return r.fulfill({ contentType: 'application/javascript', body: THREE });
    return r.abort();
  });
  await p.goto(ORIGIN + '/?quick=0&share=0&lb=http://127.0.0.1:9&render=0' + (o.query || ''));
  await p.waitForFunction(() => !!window.__hook, null, { timeout: 60000 });
  return p;
}
module.exports = { open, launch, ROOT, ORIGIN };
