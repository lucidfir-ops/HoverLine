// Prototype 63: frames (and with ffmpeg an MP4 and a GIF) of a bot race through a portal jump, from the game's own chase
// camera (the player's, as in the game: its carry through the portal, the view through the disc, bloom and grade).
//   node tools/tests/portal-clip.js <outDir> [code] [view: last|jump] [seconds of frames] [fps]
// last: the player starts 1.6 s late, so it trails the pack and watches them jump; jump: the others start late, so the
// player jumps first and looks down on them. Frames are drawn only round the portal (from 600 m before the entrance).
const fs = require('fs'), path = require('path'), { execFileSync } = require('child_process');
const { launch, open } = require('./lib.js');
const SP = '1' + '0'.repeat(15) + '1';
const [out, code = 'W1234567-' + SP + '-S', view = 'last', secs = '7', fps = '15', delay = '1.6'] = process.argv.slice(2);
const CLOCK = () => { let T = 1000; performance.now = () => T; window.__adv = (ms) => { T += ms }; window.requestAnimationFrame = () => 0; window.cancelAnimationFrame = () => {} };
(async () => {
  fs.mkdirSync(out, { recursive: true });
  const b = await launch();
  const p = await open(b, 'clip', { vp: { width: 640, height: 360 }, render: true, init: CLOCK, settle: 300, query: '&bot=1',
    storage: { 'hoverline.orient': 'landscape', 'hoverline.laps': '1' } });
  await p.addStyleTag({ content: 'body>*:not(canvas){visibility:hidden!important}' });
  const info = await p.evaluate(async ([code, view, delay, gap]) => { const H = window.__hl; H.RACE.force = 630001; const c = H.parseCode(code); H.loadTrack(c.seed, c.wk, c.cx, c.lk, c.sp || null, c.bm);
    await H.startRace(); H.S.goAt = null; const T = H.T, o = T.port[0], me = H.player;
    /* the late start: the chosen racers held still for the delay */
    const held = view === 'last' ? [me] : H.racers.filter((r) => r !== me); let t = 0;
    while (t < +delay) { for (const r of held) { r.v = 0 } H.step(1 / 60); for (const r of held) { r.v = 0 } t += 1 / 60 }
    /* then on to 600 m before the entrance */
    let g = 0; while (((o.uE - me.u) % T.L + T.L) % T.L > 600 && g++ < 20000) H.step(1 / 60);
    /* GAP=s: two racers set that many seconds ahead of the player (last) or behind it (jump), at its speed, so the clip
       shows the crossing at a known gap */
    if (gap) { const others = H.racers.filter((r) => r !== me).sort((a, b) => Math.abs(a.utot - me.utot) - Math.abs(b.utot - me.utot)).slice(0, 2);
      others.forEach((r, i) => { const d = (view === 'last' ? 1 : -1) * (+gap + i * 0.35) * me.v; r.u += d + (me.u - r.u); r.utot = me.utot + d; r.u = me.u + d; r.v = me.v; r.lat = (i ? 1 : -1) * 3; r.wreck = 0 }) }
    return { uE: o.uE, pv: o.pv, L: T.L, info: T.bmInfo } }, [code, view, delay, process.env.GAP || 0]);
  console.log(JSON.stringify(info));
  const n = Math.round(+secs * +fps), sub = Math.round(60 / +fps), stats = [];
  for (let f = 0; f < n; f++) {
    const st = await p.evaluate(([sub]) => { const H = window.__hl; for (let k = 0; k < sub; k++) { window.__adv(1000 / 60); H.step(1 / 60) }
      H.fit(); H.VFX.update(1 / 60 * sub); H.portalView(H.camera); H.gfxRender(H.scene, H.camera);
      const T = H.T, o = T.port[0], me = H.player, rk = [...H.racers].sort((a, b) => b.utot - a.utot);
      return { d: Math.round(((me.u - o.uE + T.L / 2) % T.L + T.L) % T.L - T.L / 2), v: Math.round(me.v), pos: rk.indexOf(me) + 1, view: !!H.PVW.on, calls: H.PVW.on ? H.PVW.calls : 0, pvms: +H.PVW.ms.toFixed(1),
        air: H.racers.filter((r) => r.air && r.air.kind === 'portal').length } }, [sub]);
    stats.push(st);
    await p.screenshot({ path: path.join(out, 'f' + String(f).padStart(4, '0') + '.jpg'), type: 'jpeg', quality: 85, clip: { x: 0, y: 0, width: 640, height: 360 } });
  }
  fs.writeFileSync(path.join(out, 'frames.json'), JSON.stringify({ info, view, code, stats }, null, 0));
  console.log(stats.filter((s, i) => i % 5 === 0).map((s) => s.d + 'm/' + s.pos + (s.view ? 'V' : '') + (s.air ? 'A' + s.air : '')).join(' '));
  try { execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-framerate', fps, '-i', path.join(out, 'f%04d.jpg'), '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '24', path.join(out, 'clip.mp4')]);
    execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', path.join(out, 'clip.mp4'), '-vf', 'fps=10,scale=360:-1:flags=lanczos,split[a][b];[a]palettegen=max_colors=64[p];[b][p]paletteuse=dither=bayer:bayer_scale=3', path.join(out, 'clip.gif')]) } catch (e) { console.log('ffmpeg:', e.message) }
  if (p.errs.length) console.log('errors', p.errs);
  await b.close();
})();
