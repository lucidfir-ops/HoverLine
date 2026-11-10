// Shared helpers for the browser tests (Playwright + headless Chromium). PAGE: the page to test, default the repo's
// index.html (run tools/build.py first). The page gets a hook, window.__hl, with internals the tests need; add names to
// HOOK as tests need them (it is only in the test copy, never in the game).
const fs = require('fs');
const { chromium } = require('playwright');
const THREE = fs.readFileSync(require('path').join(__dirname, '..', '..', 'vendor', 'three.min.js'), 'utf8');
const PAGE = process.env.PAGE || require('path').join(__dirname, '..', '..', 'index.html');
const ORIGIN = 'http://127.0.0.1:8099';
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const HOOK = 'requestAnimationFrame(frame);window.__hl={S,racers,player,mp,startRace,setHud,store,TS,OR,orNow,get orPick(){return orPick},orShow,CLS,clsCtx,bestKey,ghostTag,getBest,LOG,lbSubmit,QK,qkOn,carSel,carUI,showPage,mpRender,tilt,readInput,qkTilt,orApply,get coarse(){return coarse},togglePause,canFire,pacifist,tiltCentre,phaseLook,shots,fire,updateShots,WDEF,wrapU,live,aiWants,mpFlags,flareCostOf,REFLECT_T,FLARE_K,FLARE_UNIT,reflectLook,get pacOn(){return pacOn},music,loadTrack,get T(){return T},aiInput,aiStripBoost,AI_STRIP,aiSmoked,smokeH,SMOKE_AI,get seed(){return seed},scene,camera,renderer,makeShip,shipCtl,parseCode,QK,qkIn,isMan,TUT,get bioOn(){return bioOn},navDir,navAct,navFocus,NAV,SPL,splOpen,splGo,splLayoutFor,PADC,roster,ranking,toMenu,get LAPS(){return LAPS},mpTrackInfo,AIL,lbv};' +
  'window.__nb={Chirp,ChirpIO,chirp,LAN,lan,lanUse,audio,PDG,priestDraw,qrDraw,jsqrLib};\n})();';
const cache = {};
function html(file) {
  file = file || PAGE; if (cache[file]) return cache[file];
  let h = fs.readFileSync(file, 'utf8');
  if (!h.includes('requestAnimationFrame(frame);\n})();')) throw new Error('hook anchor missing in ' + file);
  h = h.replace('requestAnimationFrame(frame);\n})();', file === PAGE ? HOOK : 'requestAnimationFrame(frame);window.__hl={S,mp,store};window.__nb={LAN,lan,lanUse};\n})();');
  return (cache[file] = h);
}
async function until(p, fn, ms, what, arg) {
  const t0 = Date.now();
  for (;;) { if (await p.evaluate(fn, arg)) return Date.now() - t0; if (Date.now() - t0 > ms) throw new Error('timeout ' + what + ' on ' + (p.label || '?')); await wait(200) }
}
function launch(extra = []) {
  return chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--disable-renderer-backgrounding', '--disable-background-timer-throttling', '--autoplay-policy=no-user-gesture-required', ...extra] });
}
// a page of its own (own context, own saves). o: vp, touch, ua, init (a function run before the page's scripts),
// storage ({key: value} set before load), query (added to quick=0&share=0&lb=dead), file (another page), framed
// (load the game inside a frame on another origin, as itch does), perms, before (called with the page before goto),
// render (draw the scene; off by default)
async function open(b, label, o = {}) {
  const vp = o.vp || { width: 480, height: 270 };
  const ctx = await b.newContext({ viewport: vp, hasTouch: !!o.touch, isMobile: !!o.touch && vp.width < 1000, deviceScaleFactor: o.dpr || 1, userAgent: o.ua || undefined });
  if (o.perms) await ctx.grantPermissions(o.perms, { origin: ORIGIN });
  if (o.init) await ctx.addInitScript(o.init, o.initArg);
  // P60: a fresh page offers First flight at launch; tests that are not about it start with it seen (o.fresh keeps it)
  if (!o.fresh) await ctx.addInitScript(() => { try { if (!localStorage.getItem('hoverline.tut')) localStorage.setItem('hoverline.tut', '1') } catch (e) {} });
  if (o.storage) await ctx.addInitScript((st) => { try { for (const [k, v] of Object.entries(st)) localStorage.setItem(k, v) } catch (e) {} }, o.storage);
  const p = await ctx.newPage(); p.label = label; p.ctx = ctx; p.errs = [];
  p.on('pageerror', (e) => { p.errs.push(e.message); console.log(label, 'PAGEERROR', e.message) });
  p.on('console', (m) => { const t = m.text(); if (m.type() === 'error' && !/ERR_FAILED|ERR_ABORTED|status of 4|net::/.test(t)) console.log(label, 'CONSOLE', t.slice(0, 240)) });
  const body = html(o.file);
  await p.route('**/*', (r) => { const u = r.request().url();
    if (u.startsWith('http://127.0.0.1:8098/')) return r.fulfill({ contentType: 'text/html', body: `<!doctype html><body style="margin:0;background:#222"><iframe id="g" src="${ORIGIN}/${o.q}" allow="autoplay; fullscreen *; microphone; camera; gyroscope; accelerometer" style="border:0;width:100vw;height:100vh"></iframe></body>` });
    if (u.startsWith(ORIGIN + '/')) return r.fulfill({ contentType: 'text/html; charset=utf-8', body });
    if (u.includes('three')) return r.fulfill({ contentType: 'application/javascript', body: THREE });
    return r.abort() });
  if (o.before) await o.before(p);
  const q = o.q = `?${o.quick ? '' : 'quick=0&'}share=0&lb=http://127.0.0.1:9${o.render ? '' : '&render=0'}${o.query || ''}`;
  await p.goto(o.framed ? 'http://127.0.0.1:8098/' : `${ORIGIN}/${q}`);
  const f = o.framed ? await (async () => { for (let k = 0; k < 40; k++) { const x = p.frames().find((fr) => fr.url().startsWith(ORIGIN)); if (x) return x; await wait(250) } throw new Error('no frame') })() : p;
  for (let k = 0; k < 80; k++) { if (await f.evaluate(() => !!window.__hl).catch(() => false)) break; await wait(250) }
  await wait(o.settle == null ? 700 : o.settle);
  if (o.framed) { f.label = label; f.ctx = ctx; f.errs = p.errs; f.top = p; return f }
  return p;
}
// Multiplayer, Same room · no internet, with a name
async function toLan(p, name) {
  await p.click('#playBtn'); await wait(150); await p.click('#mpBtn'); await p.fill('#mpName', name); await p.click('[data-conn="lan"]'); await wait(150);
}
// the simulated room of the P44 tests (?nbtest=1): every chirp reaches every other page after its real length unless
// two overlap; block(from, to) drops one direction (a device that can't hear another)
function makeAir(opts = {}) {
  const pages = [], txs = [], st = { chirps: 0, collisions: 0, heard: 0, blocked: 0 };
  const air = { pages, st,
    before: (p) => p.exposeFunction('nbAirTx', (hex, speed, dur) => air.tx(p, hex, speed, dur)),
    tx(src, hex, speed, dur) {
      const t0 = Date.now(), t1 = t0 + dur * 1000, me = { src, t0, t1 }; txs.push(me); st.chirps++;
      setTimeout(() => { for (const q of pages) if (q !== src && !(opts.block && opts.block(src, q))) q.evaluate((ms) => window.__nbAir && window.__nbAir.busy(ms), dur * 1000 + 150).catch(() => {}) }, 150);
      setTimeout(() => {
        if (txs.some((o) => o !== me && o.t0 < t1 && o.t1 > t0)) { st.collisions++; return }
        for (const q of pages) { if (q === src) continue; if (opts.block && opts.block(src, q)) { st.blocked++; continue }
          if (txs.some((o) => o.src === q && o.t0 < t1 && o.t1 > t0)) continue; st.heard++; q.evaluate((h) => window.__nbAir && window.__nbAir.rx(h), hex).catch(() => {}) }
      }, dur * 1000 + 30);
    } };
  return air;
}
const inLobby = (p, n) => p.evaluate((n) => { const s = window.__hl.mp.sess; return !!s && s.state.phase === 'lobby' && s.state.roster.length === n }, n);
let fails = 0;
const ok = (c, t) => { console.log((c ? 'ok   ' : 'FAIL ') + t); if (!c) fails++; return c };
const done = () => { console.log(fails ? fails + ' FAILED' : 'all passed'); process.exit(fails ? 1 : 0) };
const ANDROID_UA = 'Mozilla/5.0 (Linux; Android 14; SM-S901B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36';
const TABLET_UA = 'Mozilla/5.0 (Linux; Android 13; E3 Tab Max) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36';
const IPHONE_UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1';
const DECK_UA = 'Mozilla/5.0 (X11; Linux x86_64; rv:131.0) Gecko/20100101 Firefox/131.0';
// full screen and the orientation lock, recorded (Chromium headless has neither): window.__locks, window.__unl
const FS_MOCK = () => { window.__locks = []; window.__unl = 0; let fe = null;
  Object.defineProperty(Document.prototype, 'fullscreenElement', { get: () => fe, configurable: true });
  Element.prototype.requestFullscreen = function () { fe = this; setTimeout(() => document.dispatchEvent(new Event('fullscreenchange')), 0); return Promise.resolve() };
  Document.prototype.exitFullscreen = function () { fe = null; setTimeout(() => document.dispatchEvent(new Event('fullscreenchange')), 0); return Promise.resolve() };
  try { const so = screen.orientation; so.lock = (t) => { window.__locks.push(t); return Promise.resolve() }; so.unlock = () => { window.__unl++ } } catch (e) {} };
module.exports = { wait, until, launch, open, toLan, makeAir, inLobby, ok, done, html, PAGE, ORIGIN, ANDROID_UA, TABLET_UA, IPHONE_UA, DECK_UA, FS_MOCK, get fails() { return fails } };
