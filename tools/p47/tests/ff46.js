// P46 under the same Firefox-like emulation as meter47.js part 4: what Join shows
const { wait, launch, open, toLan } = require('./lib47.js');
const FF = () => { const AC = window.AudioContext, o = AC.prototype.createMediaStreamSource;
  AC.prototype.createMediaStreamSource = function (s) { if (this.sampleRate !== 48000) throw new DOMException('different sample-rate', 'NotSupportedError'); return o.call(this, s) };
  const g = MediaStreamTrack.prototype.getSettings; MediaStreamTrack.prototype.getSettings = function () { const r = { ...g.call(this) }; delete r.sampleRate; return r } };
(async () => { const b = await launch(['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream']);
  const p = await open(b, 'P46', { perms: ['microphone'], init: FF, file: '/home/claude/p47/pages/p46.html' }); await toLan(p, 'Fox'); await p.click('#chirpJoinBtn'); await wait(3000);
  console.log('P46, Firefox-like Join:', JSON.stringify(await p.evaluate(() => [document.getElementById('chirpTitle').textContent, document.getElementById('chirpSteps').textContent])));
  await b.close() })();
