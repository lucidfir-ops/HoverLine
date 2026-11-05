// Prototype 47: the microphone meter, Test sound, the pairing record in the log export, and a Firefox-like browser
// (a microphone that won't join the game's audio context, no sample rate in its settings, no BarcodeDetector).
//   node meter47.js
const fs = require('fs');
const { wait, until, launch, open, toLan, ok, done } = require('./lib47.js');
const FF = () => { const AC = window.AudioContext, o = AC.prototype.createMediaStreamSource;
  AC.prototype.createMediaStreamSource = function (s) { if (this.sampleRate !== 48000) throw new DOMException('AudioContext.createMediaStreamSource: Connecting AudioNodes from AudioContexts with different sample-rate is currently not supported.', 'NotSupportedError'); return o.call(this, s) };
  const g = MediaStreamTrack.prototype.getSettings; MediaStreamTrack.prototype.getSettings = function () { const r = { ...g.call(this) }; delete r.sampleRate; return r };
  delete window.BarcodeDetector };
const meterRun = async (p, ms) => { let mx = 0, css = 0; const t0 = Date.now(); while (Date.now() - t0 < ms) { const m = await p.evaluate(() => ({ lv: window.__nb.ChirpIO.meter().lv, css: +getComputedStyle(document.getElementById('chirpMeter')).getPropertyValue('--lv') || 0, shown: !document.getElementById('chirpMeter').hidden })); if (m.shown) { mx = Math.max(mx, m.lv); css = Math.max(css, m.css) } await wait(120) } return { mx, css } };
(async () => {
  const b = await launch(['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream']);
  // 1. the meter, on Chromium's fake microphone (a beep a second)
  { const p = await open(b, 'Pilot', { perms: ['microphone'] }); await toLan(p, 'Pilot'); await p.click('#chirpJoinBtn');
    await until(p, () => window.__nb.ChirpIO.isOpen() && !document.getElementById('chirpMeter').hidden, 8000, 'meter');
    const m = await meterRun(p, 3500), d = await p.evaluate(() => window.__nb.PDG.cur);
    ok(m.mx > 0.3 && m.css > 0.3, `listening: the meter moves with the microphone (peak ${m.mx.toFixed(2)}, bar ${m.css.toFixed(2)})`);
    ok(d.mic.result === 'allowed' && d.mic.rate > 0 && d.sound.frames > 50 && d.sound.peak > 0.01 && d.mic.track, `pairing record: microphone ${d.mic.result} in ${d.mic.ms} ms, game audio ${d.mic.gameRate} Hz, mic taken by ${d.mic.took} at ${d.mic.rate} Hz, ${d.sound.frames} frames, peak ${d.sound.peak}, floor ${d.sound.floorDb} dB, label "${d.mic.track.label}"`);
    await p.ctx.close() }
  // 2. Test sound on the fake microphone: it can't hear the speaker, so it says so; the record keeps the result
  { const p = await open(b, 'Test', { perms: ['microphone'] }); await toLan(p, 'Test');
    ok(await p.evaluate(() => !document.getElementById('chirpTest').hidden), '"Test sound" sits by "Pair by: Sound | Code only"');
    await p.click('#chirpTest'); await until(p, () => /Sound works|didn't hear/.test(document.getElementById('chirpTitle').textContent), 30000, 'test result');
    const v = await p.evaluate(() => ({ t: document.getElementById('chirpTitle').textContent, s: document.getElementById('chirpSteps').textContent, d: window.__nb.PDG.cur }));
    ok(/didn't hear/.test(v.t) && /bar doesn't move/.test(v.s) && v.d.selfTest === false && v.d.sound.sent === 2, `a device that can't hear itself: "${v.t}" · ${v.d.sound.sent} calls played, heard ${v.d.sound.self}`);
    await p.click('#chirpDone'); await wait(200); const e = await p.evaluate(() => window.__nb.PDG.all().slice(-1)[0]);
    ok(e && e.role === 'test' && e.outcome === 'stopped' && e.selfTest === false, `  Done: the record is closed and kept (${e && e.role}, ${e && e.outcome})`);
    // the export carries it with no race recorded
    await p.evaluate(() => { document.getElementById('mp').hidden = true; window.__hl.showPage('title') }); await p.click('#optBtn'); await p.click('#setBtn'); await p.click('#logOpen');
    const [dl] = await Promise.all([p.waitForEvent('download', { timeout: 10000 }), p.click('#logAll')]);
    const j = JSON.parse(fs.readFileSync(await dl.path(), 'utf8'));
    ok(Array.isArray(j.pairing) && j.pairing.length === 1 && j.logs.length === 0 && j.pairing[0].browser && j.pairing[0].mic && j.pairing[0].sound, `Download all logs with no race: ${dl.suggestedFilename()} with ${j.pairing.length} pairing record (keys ${Object.keys(j.pairing[0]).join(', ')})`);
    await p.ctx.close() }
  // 3. Test sound in the tests' simulated room: heard, and not heard when the device is deaf
  for (const deaf of [false, true]) { const p = await open(b, deaf ? 'Deaf' : 'Hears', { query: '&nbtest=1', before: (q) => q.exposeFunction('nbAirTx', () => {}) });
    if (deaf) await p.evaluate(() => { window.__nbDeaf = true }); await toLan(p, 'T'); await p.click('#chirpTest');
    await until(p, () => /Sound works|didn't hear/.test(document.getElementById('chirpTitle').textContent), 30000, 'test result');
    const t = await p.textContent('#chirpTitle'); ok(deaf ? /didn't hear/.test(t) : /Sound works/.test(t), `Test sound, ${deaf ? 'deaf' : 'hearing'} device: "${t}"`); await p.ctx.close() }
  // 4. Firefox-like: the microphone joins a context of its own at 48 kHz; Join listens and the meter moves
  { const p = await open(b, 'Firefox', { perms: ['microphone'], init: FF }); await toLan(p, 'Fox'); await p.click('#chirpJoinBtn');
    await until(p, () => window.__nb.ChirpIO.isOpen(), 8000, 'mic'); const m = await meterRun(p, 3000), d = await p.evaluate(() => window.__nb.PDG.cur);
    ok(d.mic.shared === 'NotSupportedError' && /own context at 48000/.test(d.mic.took) && d.sound.frames > 50 && m.mx > 0.3, `Firefox-like: the game's ${d.mic.gameRate} Hz context refused the mic (${d.mic.shared}); taken by ${d.mic.took}; ${d.sound.frames} frames; meter ${m.mx.toFixed(2)}`);
    ok(await p.evaluate(() => /Listening/.test(document.getElementById('chirpTitle').textContent) && window.__nb.chirp.mode === 'guest'), '  and it listens');
    await p.ctx.close() }
  // 5. a microphone prompt left unanswered: after 2.5 s the screen says the browser is asking
  { const p = await open(b, 'Prompt', { init: () => { const md = navigator.mediaDevices, o = md.getUserMedia.bind(md); md.getUserMedia = (c) => c && c.audio ? new Promise(() => {}) : o(c) } });
    await toLan(p, 'P'); await p.click('#chirpJoinBtn'); await wait(3200); const t = await p.textContent('#chirpMsg');
    ok(/Allow the microphone/.test(t), `a prompt nobody has answered yet: "${t}"`); await p.ctx.close() }
  await b.close(); done();
})().catch((e) => { console.error('FAIL', e); process.exit(1) });
