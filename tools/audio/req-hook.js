// Prototype 62: the request recorder for the built-in sound tables. TEST BUILD ONLY: it is text added to a copy of
// index.html in memory (like window.__hl in tools/tests/lib.js); nothing here ships in the game.
//
// The game keeps its recordings as base64 MP3 in six tables (src/assets): SL.SMP (kit sources), SL.VOX (announcer,
// vocals, instrument one-shots), SL.EXT and SL.EXT2 (the Prototype 34 and 38 recordings), SL.SFX (sound effects) and
// CVOX (the frame lines). The tables are decoded into dictionaries of AudioBuffers and the game looks a key up there
// (`V[k]`, `this.vbuf[k]`, `audio.fx[k]`, `audio.vb['v_'+k]`, `smp[lay.s]`, `fsv.buf[k]`) or tests it in the raw table
// (`SL.EXT2[k]`). The hook puts a Proxy in each of those places that records every key read, with the scenario the
// driver set (window.__SC) and the code that read it. Bulk operations that touch every key without choosing one
// (Object.assign / entries / keys / values / fromEntries, SL.tame) are muted so they don't count as requests.
//
// strict (the pruned build): a request for a key listed in `cut` (a recording that was removed) throws, so nothing can
// go silent without a loud failure.
const fs = require('fs');
const path = require('path');
const ANCHOR = 'requestAnimationFrame(frame);\n})();';

// part-file line map: the build strips each part's "//#" header lines, so find every part of src/js/ORDER in the built
// page by its first 160 characters, in order; the result is [[first line, 'music/engine/036-....js'], ...]
function lineMap(html) {
  const SRC = path.join(__dirname, '..', '..', 'src'), out = []; let cur = 0;
  for (const p of fs.readFileSync(path.join(SRC, 'js', 'ORDER'), 'utf8').split(/\s+/).filter(Boolean)) {
    const t = fs.readFileSync(path.join(SRC, p), 'utf8').replace(/^(?:\/\/#(?: [^\n]*)?\n)+/, '');
    const needle = t.slice(0, 160), at = html.indexOf(needle, cur);
    if (at < 0 || !needle.trim()) continue;
    const hdr = (fs.readFileSync(path.join(SRC, p), 'utf8').match(/^(?:\/\/#(?: [^\n]*)?\n)+/) || [''])[0].split('\n').length - 1;
    out.push([html.slice(0, at).split('\n').length - hdr, p.replace(/^js\//, '')]); cur = at + needle.length;
  }
  return out;
}

// runs inside the game's scope (SL, music, SMP, CVOX and fsv are the game's own names)
function hookMain(LMAP, HOOKLN, STRICT, CUT) {
  const REQ = {}, QUIET = { n: 0 }, PX = new WeakSet(); window.__SC = { kind: 'idle', label: '' }; CUT = new Set(CUT);
  const TBL = { SMP: SL.SMP, VOX: SL.VOX, EXT: SL.EXT, EXT2: SL.EXT2, SFX: SL.SFX, CVOX: CVOX }, KT = {};
  for (const [n, t] of Object.entries(TBL)) if (t) for (const k of Object.keys(t)) (KT[k] || (KT[k] = [])).push(n);
  const part = (ln) => { let p = '?', s = 0; for (const [l, f] of LMAP) { if (l <= ln) { p = f; s = l } else break } return p === '?' ? p : p + ':' + (ln - s + 1) };
  const site = () => {
    for (const s of (new Error().stack || '').split('\n').slice(1)) {
      const m = /:(\d+):\d+\)?$/.exec(s); if (!m) continue; const ln = +m[1]; if (ln >= HOOKLN) continue;
      const f = /at (?:async )?([\w$.]+) \(/.exec(s), p = part(ln); if (p === '?') continue;
      return (f && !/^(Object\.|Proxy|new|Array)/.test(f[1]) ? f[1] + '@' : '') + p;
    } return '?';
  };
  const rec = (chan, k) => {
    if (QUIET.n || typeof k !== 'string' || k === 'then') return;
    if (STRICT && CUT.has(k)) { (window.__CUTHIT || (window.__CUTHIT = [])).push(chan + '.' + k + ' (' + window.__SC.label + ')'); throw new Error('request for a pruned sound: ' + chan + '.' + k + ' (' + window.__SC.label + ')') }
    const R = REQ[chan] || (REQ[chan] = {}); let r = R[k]; if (!r) r = R[k] = { n: 0, by: {}, ex: [], sites: [] };
    const S = window.__SC; r.n++; const newKind = !r.by[S.kind]; r.by[S.kind] = (r.by[S.kind] || 0) + 1;
    if (r.ex.length < 3 && !r.ex.includes(S.label)) r.ex.push(S.label);
    if (r.n <= 6 || newKind) { const s = site(); if (!r.sites.includes(s) && r.sites.length < 6) r.sites.push(s) }
  };
  const track = (o, chan) => {
    if (!o || typeof o !== 'object' || PX.has(o)) return o;
    const p = new Proxy(o, { get(t, k, r) { rec(chan, k); return Reflect.get(t, k, r) }, has(t, k) { rec(chan, k); return Reflect.has(t, k) } });
    PX.add(p); return p;
  };
  const mute = (o, n) => { const f = o[n]; o[n] = function (...a) { QUIET.n++; try { return f.apply(this, a) } finally { QUIET.n-- } } };
  for (const n of ['assign', 'entries', 'keys', 'values', 'fromEntries', 'getOwnPropertyNames']) mute(Object, n);
  mute(SL, 'tame');
  /* the decoded dictionaries */
  const dv = music.decodeVox; music.decodeVox = async function (c, keep, src) {
    const r = await dv.call(this, c, keep, src), kk = String(keep).replace(/\s/g, '');
    /* only the announcer's and the effects' dictionaries are read by key as they are; the rest are merged into music.vbuf */
    return src === SL.SFX ? track(r, 'fx') : kk === "x=>x[0]==='v'" ? track(r, 'vb') : r;
  };
  const ds = music.decodeSamples; music.decodeSamples = async function () { return track(await ds.call(this), 'smp') };
  { const m = new WeakMap(); Object.defineProperty(music, 'vbuf', { configurable: true, enumerable: true,
    get() { let o = this; while (o) { if (m.has(o)) return m.get(o); o = Object.getPrototypeOf(o) } return undefined },
    set(v) { m.set(this, track(v, 'vbuf')) } }) }
  SL.EXT2 = track(SL.EXT2, 'ext2raw');
  { let b = fsv.buf; Object.defineProperty(fsv, 'buf', { configurable: true, enumerable: true, get() { return b }, set(v) { b = track(v, 'fsv') } }) }
  /* the recorded library (samples/): what is asked for by name */
  const sm = (n, f) => { const o = SMP[n]; SMP[n] = function (...a) { f(...a); return o.apply(this, a) } };
  sm('need', (l) => { for (const x of [].concat(l || [])) rec('smp.need', String(x)) });
  sm('pick', (kit, v) => rec('smp.pick', kit + ':' + v)); sm('zone', (i) => rec('smp.zone', String(i))); sm('buf', (id) => rec('smp.buf', String(id)));
  sm('kit', (n) => rec('smp.kit', String(n))); sm('inst', (n) => rec('smp.inst', String(n))); sm('info', (id) => rec('smp.info', String(id)));
  window.__REQ = () => JSON.parse(JSON.stringify(REQ)); window.__REQ_RESET = () => { for (const k of Object.keys(REQ)) delete REQ[k] };
  window.__KT = KT; window.__hook = true;
}

function prepHtml(file, opt = {}) {
  const h = fs.readFileSync(file, 'utf8');
  const at = h.indexOf(ANCHOR); if (at < 0) throw new Error('hook anchor missing in ' + file);
  const hookLn = h.slice(0, at).split('\n').length;
  const inj = 'requestAnimationFrame(frame);\nwindow.__ev=s=>eval(s);\n(' + hookMain + ')(' + [JSON.stringify(lineMap(h)), hookLn, !!opt.strict, JSON.stringify(opt.cut || [])].join(',') + ');\n})();';
  return h.slice(0, at) + inj + h.slice(at + ANCHOR.length);
}
module.exports = { prepHtml, lineMap };
