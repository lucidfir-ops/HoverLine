// Encoding for the clips: the click track and the ffmpeg calls (shared by render.js and encode.js).
const fs = require('fs'), path = require('path'), { execFileSync } = require('child_process');
// the click track (16-bit mono WAV): a kick on every beat, a hat off the beat, a rising sweep over the 2 bars before
// each drop and a low boom on it; off = the beat clock's time at the clip's start
function clickTrack(dur, off) {
  const sr = 22050, n = Math.ceil(dur * sr), spb = 60 / 140, ph8 = spb * 32, buf = Buffer.alloc(44 + n * 2);
  let seed = 1; const noise = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x3fffffff - 1 };
  for (let i = 0; i < n; i++) { const t = i / sr + off, tb = t % spb, t8 = t % ph8, toff = (t + spb / 2) % spb;
    let v = 0.6 * Math.sin(2 * Math.PI * (45 * tb + 90 * (1 - Math.exp(-tb * 28)) / 28)) * Math.exp(-tb * 9);
    v += 0.08 * noise() * Math.exp(-toff * 60);
    if (t8 > ph8 - spb * 8) { const f = (t8 - (ph8 - spb * 8)) / (spb * 8); v += 0.07 * f * noise() * (0.5 + 0.5 * Math.sin(2 * Math.PI * (2 + 14 * f) * t)) }
    if (t8 < spb * 3) v += 0.35 * Math.exp(-t8 * 1.8) * Math.sin(2 * Math.PI * 50 * t8);
    buf.writeInt16LE(Math.max(-32767, Math.min(32767, Math.round(v * 26000))), 44 + i * 2) }
  buf.write('RIFF', 0); buf.writeUInt32LE(36 + n * 2, 4); buf.write('WAVEfmt ', 8); buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(1, 22);
  buf.writeUInt32LE(sr, 24); buf.writeUInt32LE(sr * 2, 28); buf.writeUInt16LE(2, 32); buf.writeUInt16LE(16, 34); buf.write('data', 36); buf.writeUInt32LE(n * 2, 40);
  return buf;
}
// MP4 (640x360, the frames' rate, with the click track) and GIF (10 fps, 64 colours, as wide as fits under 2.5 MB:
// 480, then 400, then 360 px), so the whole folder stays under 60 MB
function encode(dir, out, name, fps, n, beatAt0, audio) {
  const mp4 = path.join(out, name + '.mp4'), gif = path.join(out, name + '.gif'), wav = path.join(dir, 'click.wav');
  fs.writeFileSync(wav, clickTrack(n / fps, beatAt0));
  const fin = ['-y', '-loglevel', 'error', '-framerate', String(fps), '-i', path.join(dir, '%04d.png')];
  const v = ['-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '26', '-preset', 'slow', '-movflags', '+faststart'];
  execFileSync('ffmpeg', audio ? [...fin, '-i', wav, ...v, '-c:a', 'aac', '-b:a', '64k', '-shortest', mp4] : [...fin, ...v, mp4]);
  for (const gw of [480, 400, 360]) { execFileSync('ffmpeg', [...fin, '-vf', `fps=10,scale=${gw}:-2:flags=lanczos,split[a][b];[a]palettegen=max_colors=64:stats_mode=diff[p];[b][p]paletteuse=dither=none:diff_mode=rectangle`, gif]); if (fs.statSync(gif).size < 2.5 * 1048576) break }
  const sz = (f) => (fs.statSync(f).size / 1048576).toFixed(2);
  console.log(name, n, 'frames', 'gif', sz(gif), 'MB', 'mp4', sz(mp4), 'MB');
}
module.exports = { clickTrack, encode };
