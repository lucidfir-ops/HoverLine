// Prototype 63: frames (and with ffmpeg an MP4 and a GIF) of a bot race through the Spirit realm's underside (track/004t),
// from the game's own chase camera (the player's, as in the game: its roll, bloom and grade).
//   node tools/tests/underside-clip.js <outDir> [code] [route: under|top] [seconds of frames] [fps] [camera index]
// The player is set to take the route asked for (the others choose as they like); the frames start 180 m before the fork.
const fs = require('fs'), path = require('path'), { execFileSync } = require('child_process');
const { launch, open } = require('./lib.js');
const [out, code = 'W1B85AB4-S', route = 'under', secs = '9', fps = '15', cam = '1'] = process.argv.slice(2);
const CLOCK = () => { let T = 1000; performance.now = () => T; window.__adv = (ms) => { T += ms }; window.requestAnimationFrame = () => 0; window.cancelAnimationFrame = () => {} };
(async () => {
  fs.mkdirSync(out, { recursive: true });
  const b = await launch();
  const p = await open(b, 'clip', { vp: { width: 640, height: 360 }, render: true, init: CLOCK, settle: 300, query: '&bot=1',
    storage: { 'hoverline.orient': 'landscape', 'hoverline.laps': '1', 'hoverline.cam': cam } });
  await p.addStyleTag({ content: 'body>*:not(canvas){visibility:hidden!important}' });
  const info = await p.evaluate(async ([code, route]) => { const H = window.__hl; H.RACE.force = 630011; const c = H.parseCode(code); H.loadTrack(c.seed, c.wk, c.cx, c.lk, c.sp || null, c.bm);
    await H.startRace(); H.S.goAt = null; const T = H.T, SP = T.splits.find((x) => x.kind === 'flip'), me = H.player;
    if (!SP) return { err: 'no underside on ' + code };
    let g = 0; while (((SP.u0 - me.u) % T.L + T.L) % T.L > 180 && g++ < 30000) H.step(1 / 60);
    const b = route === 'top' ? SP.tB : SP.fB; me.brPick = { SP, b, long: SP.b[b].long };
    /* a few of the field close by, on both faces */
    const others = H.racers.filter((r) => r !== me).sort((a, b2) => Math.abs(a.utot - me.utot) - Math.abs(b2.utot - me.utot)).slice(0, 4);
    others.forEach((r, i) => { const d = [-30, 25, -60, 55][i]; r.u = me.u + d; r.utot = me.utot + d; r.v = me.v; r.lat = me.lat + (i % 2 ? 2 : -2); r.wreck = 0; const bb = i % 2 ? SP.fB : SP.tB; r.brPick = { SP, b: bb, long: SP.b[bb].long } });
    return { u0: Math.round(SP.u0), n: SP.n, side: SP.side, L: Math.round(T.L), info: T.bmInfo } }, [code, route]);
  console.log(JSON.stringify(info)); if (info.err) { await b.close(); return }
  const n = Math.round(+secs * +fps), sub = Math.round(60 / +fps), stats = [];
  for (let f = 0; f < n; f++) {
    const st = await p.evaluate(([sub]) => { const H = window.__hl; for (let k = 0; k < sub; k++) { window.__adv(1000 / 60); H.step(1 / 60) }
      H.fit(); H.VFX.update(1 / 60 * sub); H.portalView(H.camera); H.gfxRender(H.scene, H.camera);
      const T = H.T, SP = T.splits.find((x) => x.kind === 'flip'), me = H.player, f0 = H.surf(me.u, me.lat, me, true), up = H.camera.up.clone(), ang = Math.acos(Math.max(-1, Math.min(1, up.dot(me.ship.up ? new me.ship.up.constructor(0, 1, 0).applyQuaternion(me.ship.quaternion) : up))));
      return { d: Math.round(((me.u - SP.u0) % T.L + T.L) % T.L), v: Math.round(me.v), ph: +(f0.ph || 0).toFixed(2), b: f0.b, camUp: +(ang * 180 / Math.PI).toFixed(1) } }, [sub]);
    stats.push(st);
    await p.screenshot({ path: path.join(out, 'f' + String(f).padStart(4, '0') + '.jpg'), type: 'jpeg', quality: 85, clip: { x: 0, y: 0, width: 640, height: 360 } });
  }
  fs.writeFileSync(path.join(out, 'frames.json'), JSON.stringify({ info, route, code, stats }, null, 0));
  console.log(stats.filter((s, i) => i % 5 === 0).map((s) => s.d + 'm/' + s.ph + '/' + s.camUp).join(' '));
  try { execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-framerate', fps, '-i', path.join(out, 'f%04d.jpg'), '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '24', path.join(out, 'clip.mp4')]);
    execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', path.join(out, 'clip.mp4'), '-vf', 'fps=10,scale=360:-1:flags=lanczos,split[a][b];[a]palettegen=max_colors=64[p];[b][p]paletteuse=dither=bayer:bayer_scale=3', path.join(out, 'clip.gif')]) } catch (e) { console.log('ffmpeg:', e.message) }
  if (p.errs.length) console.log('errors', p.errs);
  await b.close();
})();
