// Prototype 47: chirp_wav_e2e.js (Prototype 44's real-audio pairing) with both browsers made Firefox-like: a microphone
// can't join an AudioContext at another sample rate (Chromium's here run at 44.1 kHz), MediaStreamTrack settings carry
// no sample rate, no BarcodeDetector. The microphone then goes to a context of its own at 48 kHz.
//   PAGE=... node ff_wav47.js [clean room noisy loud]
const FF = () => { const AC = window.AudioContext, o = AC.prototype.createMediaStreamSource;
  AC.prototype.createMediaStreamSource = function (s) { if (this.sampleRate !== 48000) throw new DOMException('different sample-rate', 'NotSupportedError'); return o.call(this, s) };
  const g = MediaStreamTrack.prototype.getSettings; MediaStreamTrack.prototype.getSettings = function () { const r = { ...g.call(this) }; delete r.sampleRate; return r };
  delete window.BarcodeDetector };
// Pairing by sound with real audio: two browsers, each with its own fake microphone file (Chrome's
// --use-file-for-fake-audio-capture). Every chirp a phone plays (as played, ?nbtap=1) goes through a room model
// (mkwav.py) into the other phone's microphone file, and that microphone is reopened (Chrome reads the file again on
// each open). So the pilot hears the host's call, answers; the host hears the answer (or, in a room too loud for the
// fastest speed, calls again at the fast speed and the pilot answers that); WebRTC connects them and both land in the
// lobby. The test prints every chirp that was relayed.
//   node chirp_wav_e2e.js [clean room noisy loud]    (default: all four)
const fs = require('fs'), path = require('path'), { execFileSync } = require('child_process');
const { wait, until, launch, pilot, roster } = require('/home/claude/p44/nearby/tests/lib.js');
const OUT = process.env.OUT || '/home/claude/p47/work/wav';
fs.mkdirSync(OUT, { recursive: true });
function silence(file) { // 1 s of nothing, as a 16-bit 48 kHz WAV
  const n = 48000, b = Buffer.alloc(44 + n * 2); b.write('RIFF', 0); b.writeUInt32LE(36 + n * 2, 4); b.write('WAVEfmt ', 8); b.writeUInt32LE(16, 16); b.writeUInt16LE(1, 20); b.writeUInt16LE(1, 22);
  b.writeUInt32LE(48000, 24); b.writeUInt32LE(96000, 28); b.writeUInt16LE(2, 32); b.writeUInt16LE(16, 34); b.write('data', 36); b.writeUInt32LE(n * 2, 40); fs.writeFileSync(file, b);
}
async function grab(p, file, cond) { // the last chirp the page played, through the room, as that file
  const b64 = await p.evaluate(() => { const s = window.__nb.ChirpIO.last; const u = new Uint8Array(s.buffer, s.byteOffset, s.byteLength); let t = ''; for (let i = 0; i < u.length; i += 0x8000) t += String.fromCharCode.apply(null, u.subarray(i, i + 0x8000)); return btoa(t) });
  const raw = file.replace(/\.wav$/, '.f32'); fs.writeFileSync(raw, Buffer.from(b64, 'base64'));
  // 8 s of room after the chirp: Chrome plays the file in a loop, and a real host listens about that long between calls
  execFileSync('python3', ['/home/claude/p44/nearby/tests/mkwav.py', raw, file, cond, '8']);
}
async function run(cond) {
  const H = path.join(OUT, `host_mic_${cond}.wav`), G = path.join(OUT, `pilot_mic_${cond}.wav`); silence(H); silence(G);
  const fake = (f) => ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream', '--use-file-for-fake-audio-capture=' + f];
  const bh = await launch(fake(H)), bg = await launch(fake(G));
  try {
    const host = await pilot(bh, 'Host', { query: '&nbtap=1', before: (p) => p.addInitScript(FF) }), guest = await pilot(bg, 'Pilot', { query: '&nbtap=1', before: (p) => p.addInitScript(FF) });
    const t0 = Date.now(), log = [];
    // every chirp either phone plays goes through the room into the other's microphone file, which is then reopened
    const relay = async (from, to, file, who) => {
      const s = await from.evaluate(() => { const l = window.__nb.ChirpIO.last; if (!l || l === window.__seen) return null; window.__seen = l; const c = window.__nb.chirp; return { s: l.length / 48000, tag: c.offer ? c.offer.tag : c.g && c.g.o.tag } });
      if (!s) return false;
      await grab(from, file, cond); const r0 = Date.now(); await to.evaluate(() => window.__nb.ChirpIO.reopen()); const rm = Date.now() - r0;
      log.push(`${((Date.now() - t0) / 1000).toFixed(0)} s ${who} ${s.s < 4 ? 'fastest' : 'fast'}${rm > 2000 ? ` (the test's microphone reopen took ${(rm / 1000).toFixed(0)} s)` : ''}`); return true;
    };
    await host.click('#chirpHostBtn');
    await until(host, () => !!window.__nb.ChirpIO.last, 15000, 'host chirp');
    const off = await host.evaluate(() => window.__nb.Chirp.pack({ ...window.__nb.chirp.offer, kind: 0, speed: 'fastest' }).length);
    await relay(host, guest, G, 'call');
    await guest.click('#chirpJoinBtn');
    let ms = 0;
    for (;;) {
      if (await guest.evaluate(() => { const s = window.__hl.mp.sess; return !!s && s.state.phase === 'lobby' && s.state.roster.length === 2 })) break;
      if (Date.now() - t0 > 120000) throw new Error('not paired in 120 s: ' + log.join(', '));
      await relay(host, guest, G, 'call'); await relay(guest, host, H, 'answer'); await wait(150);
      if (process.env.DEBUG && Date.now() - (run.dbg || 0) > 2000) { run.dbg = Date.now();
        const hs = await host.evaluate(() => { const c = window.__nb.chirp, I = window.__nb.ChirpIO; return `host: mode ${c.mode} tag ${c.offer && c.offer.tag} fresh ${c.fresh} sending ${I.sending()} busy ${I.busy()} lv ${I.level().toFixed(2)} pending ${window.__nb.LAN.L.pending.size} guests ${window.__nb.LAN.L.guests.size} msg "${document.getElementById('chirpMsg').textContent}"` });
        const gs = await guest.evaluate(() => { const c = window.__nb.chirp, g = c.g, I = window.__nb.ChirpIO; return `pilot: tag ${g && g.o.tag} tries ${g && g.tries} sent ${g && !!g.sentAt} sending ${g && g.sending} pc ${g && g.pc && g.pc.connectionState} old ${c.old && c.old.pc.connectionState} busy ${I.busy()} msg "${document.getElementById('chirpMsg').textContent}"` });
        console.log(`  ${((Date.now() - t0) / 1000).toFixed(0)}s ${hs} | ${gs}`) }
    }
    await until(host, () => window.__hl.mp.sess.state.roster.length === 2, 8000, 'host roster');
    const rate = await guest.evaluate(() => window.__nb.audio.ctx.sampleRate + ' Hz game audio, which the microphone could not join');
    console.log(`${cond.padEnd(5)}  offer ${off} B · paired in ${((Date.now() - t0) / 1000).toFixed(0)} s · chirps: ${log.join(', ')} · devices at ${rate} · lobby ${(await roster(host)).join(', ')}`);
    return true;
  } finally { await bh.close(); await bg.close() }
}
(async () => {
  const conds = process.argv.slice(2).length ? process.argv.slice(2) : ['clean', 'room', 'noisy', 'loud'];
  let fail = 0;
  for (const c of conds) { try { await run(c) } catch (e) { fail++; console.log(c, 'FAIL', e.message) } }
  console.log(fail ? fail + ' FAILED' : 'all passed'); process.exit(fail ? 1 : 0);
})();
