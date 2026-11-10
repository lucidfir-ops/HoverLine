// Renders the clips: node tools/spirit-proto/fx/render.js <outDir> <clip,clip,...|all> [--frames] [--still N]
// Each clip: frames at FPS from the game's own renderer (bloom and composite on), then ffmpeg makes an MP4 (with a
// 140 bpm click track so the beat can be heard) and a GIF. --still N writes only frame N as a PNG (for checking).
const fs = require('fs'), path = require('path'), { execFileSync } = require('child_process');
const { openPage, launch } = require('./page.js');
const LIB = ['lib/neon.js', 'lib/stage.js', 'lib/objects.js', 'lib/objects2.js', 'lib/rooms.js', 'clips.js'].map((f) => path.join(__dirname, f));
const W = 640, H = 360;
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
    const spb = 60 / 140, off = info.t0 + info.beatOffset, bars8 = spb * 32;
    const tb = `mod(t+${off},${spb})`, tl = `mod(t+${off},${bars8})`;
    const aexpr = `0.55*sin(2*PI*(45*${tb}+90*(1-exp(-${tb}*28))/28))*exp(-${tb}*9)` +
      `+0.10*gt(${tl},${bars8 - spb * 8})*((${tl}-${bars8 - spb * 8})/${spb * 8})*sin(2*PI*(300+900*((${tl}-${bars8 - spb * 8})/${spb * 8}))*t)*sin(2*PI*7*t)` +
      `+0.25*lt(${tl},${spb * 2})*exp(-${tl}*2.5)*sin(2*PI*55*t)`;
    const fin = ['-y', '-loglevel', 'error', '-framerate', String(info.fps), '-i', path.join(dir, '%04d.png')];
    if (info.audio) execFileSync('ffmpeg', [...fin, '-f', 'lavfi', '-i', `aevalsrc=${aexpr}:s=44100:d=${n / info.fps}`, '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '20', '-preset', 'slow', '-c:a', 'aac', '-b:a', '96k', '-shortest', '-movflags', '+faststart', mp4]);
    else execFileSync('ffmpeg', [...fin, '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '20', '-preset', 'slow', '-movflags', '+faststart', mp4]);
    execFileSync('ffmpeg', [...fin, '-vf', 'split[a][b];[a]palettegen=max_colors=128:stats_mode=full[p];[b][p]paletteuse=dither=bayer:bayer_scale=4', gif]);
    if (!keepFrames) fs.rmSync(dir, { recursive: true, force: true });
    const sz = (f) => (fs.statSync(f).size / 1048576).toFixed(2);
    console.log(name, n, 'frames', Date.now() - t0, 'ms', 'gif', sz(gif), 'MB', 'mp4', sz(mp4), 'MB', JSON.stringify(info.cost), info.info ? JSON.stringify(info.info) : '');
  }
  const cf = path.join(out, 'costs.json'); let prev = {}; try { prev = JSON.parse(fs.readFileSync(cf, 'utf8')) } catch (e) {}
  fs.writeFileSync(cf, JSON.stringify({ ...prev, ...costs }, null, 1));
  await b.close();
})();
