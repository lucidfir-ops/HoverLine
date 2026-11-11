// Renders the clips: node tools/spirit-proto/fx/render.js <outDir> <clip,clip,...|all> [--frames] [--still N]
// Each clip: frames at FPS from the game's own renderer (bloom and composite on), then ffmpeg makes an MP4 (with a
// 140 bpm click track so the beat can be heard) and a GIF. --still N writes only frame N as a PNG (for checking).
const fs = require('fs'), path = require('path'), { execFileSync } = require('child_process');
const { openPage, launch } = require('./page.js');
const LIB = ['lib/neon.js', 'lib/stage.js', 'lib/objects.js', 'lib/objects2.js', 'lib/rooms.js', 'clips.js'].map((f) => path.join(__dirname, f));
const W = 640, H = 360;
const { encode } = require('./render-lib.js');
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
    encode(dir, out, name, info.fps, n, info.t0 + info.beatOffset, info.audio);
    if (!keepFrames) fs.rmSync(dir, { recursive: true, force: true });
    console.log(name, 'rendered in', Date.now() - t0, 'ms', info.info ? JSON.stringify(info.info) : '');
  }
  const cf = path.join(out, 'costs.json'); let prev = {}; try { prev = JSON.parse(fs.readFileSync(cf, 'utf8')) } catch (e) {}
  fs.writeFileSync(cf, JSON.stringify({ ...prev, ...costs }, null, 1));
  await b.close();
})();
