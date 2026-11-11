// Renders the clips: node tools/spirit-proto/fx/render.js <outDir> <clip,clip,...|all> [--frames] [--still N]
// Each clip: frames at FPS from the game's own renderer (bloom and composite on), then ffmpeg makes an MP4 (with a
// 140 bpm click track so the beat can be heard) and a GIF. --still N writes only frame N as a PNG (for checking).
const fs = require('fs'), path = require('path'), { execFileSync } = require('child_process');
const { openPage, launch } = require('./page.js');
const LIB = ['lib/neon.js', 'lib/stage.js', 'lib/objects.js', 'lib/objects2.js', 'lib/rooms.js', 'clips.js'].map((f) => path.join(__dirname, f));
const W = 640, H = 360;
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
const args = process.argv.slice(2), out = args[0], names = (args[1] || 'all').split(',');
const still = args.includes('--still') ? +args[args.indexOf('--still') + 1] : null;
const keepFrames = args.includes('--frames');
(async () => {
  fs.mkdirSync(out, { recursive: true });
  const b = await launch();
  const list = names[0] === 'all' ? null : names;
  let p = await openPage(b, W, H, LIB);
  const all = await p.evaluate(() => Object.keys(window.SPFX.CLIPS));
  const todo = list || all;
  const costs = {};
  for (const name of todo) {
    const t0 = Date.now();
    // a fresh page per clip, so nothing from one clip leaks into the next
    if (p.used) { await p.context().close(); p = await openPage(b, W, H, LIB) } p.used = true;
    const info = await p.evaluate(([n, w, h]) => { const SP = window.SPFX, C = SP.CLIPS[n]; SP.stage.size(w, h); SP.stage.patchComp(); const r = C.setup(); SP.stage.size(w, h);
      return { dur: C.dur, fps: C.fps || 18, t0: C.t0 || 0, cost: C.cost ? C.cost() : null, info: r || null, beatOffset: C.beatOffset || 0, audio: C.audio !== false } }, [name, W, H]);
    costs[name] = info.cost;
    const n = Math.round(info.dur * info.fps), dir = path.join(out, 'frames-' + name);
    fs.rmSync(dir, { recursive: true, force: true }); fs.mkdirSync(dir, { recursive: true });
    for (let i = 0; i < n; i++) {
      if (still != null && i !== still && i !== 0) { continue }
      const t = info.t0 + i / info.fps;
      await p.evaluate(([n, t, dt]) => { const SP = window.SPFX; SP.stage.frame(t, dt, SP.CLIPS[n]) }, [name, t, 1 / info.fps]);
      if (still != null && i !== still) continue;
      await p.screenshot({ path: path.join(dir, String(i).padStart(4, '0') + '.png') });
    }
    if (still != null) { fs.copyFileSync(path.join(dir, String(still).padStart(4, '0') + '.png'), path.join(out, name + '-' + still + '.png')); fs.rmSync(dir, { recursive: true, force: true }); console.log(name, 'still', Date.now() - t0, 'ms'); continue }
    const mp4 = path.join(out, name + '.mp4'), gif = path.join(out, name + '.gif');
    // the click track: a kick on every beat, a soft riser in the two bars before each drop and a crash on it
    const wav = path.join(dir, 'click.wav'); fs.writeFileSync(wav, clickTrack(n / info.fps, info.t0 + info.beatOffset));
    const fin = ['-y', '-loglevel', 'error', '-framerate', String(info.fps), '-i', path.join(dir, '%04d.png')];
    if (info.audio) execFileSync('ffmpeg', [...fin, '-i', wav, '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '20', '-preset', 'slow', '-c:a', 'aac', '-b:a', '96k', '-shortest', '-movflags', '+faststart', mp4]);
    else execFileSync('ffmpeg', [...fin, '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '20', '-preset', 'slow', '-movflags', '+faststart', mp4]);
    // GIF: 12 fps, 64 colours, as wide as fits under 4 MB (560, then 480, then 400 px)
    for (const gw of [560, 480, 400]) { execFileSync('ffmpeg', [...fin, '-vf', `fps=12,scale=${gw}:-2:flags=lanczos,split[a][b];[a]palettegen=max_colors=64:stats_mode=diff[p];[b][p]paletteuse=dither=none:diff_mode=rectangle`, gif]); if (fs.statSync(gif).size < 4.0 * 1048576) break }
    if (!keepFrames) fs.rmSync(dir, { recursive: true, force: true });
    const sz = (f) => (fs.statSync(f).size / 1048576).toFixed(2);
    console.log(name, n, 'frames', Date.now() - t0, 'ms', 'gif', sz(gif), 'MB', 'mp4', sz(mp4), 'MB', JSON.stringify(info.cost), info.info ? JSON.stringify(info.info) : '');
  }
  const cf = path.join(out, 'costs.json'); let prev = {}; try { prev = JSON.parse(fs.readFileSync(cf, 'utf8')) } catch (e) {}
  fs.writeFileSync(cf, JSON.stringify({ ...prev, ...costs }, null, 1));
  await b.close();
})();
