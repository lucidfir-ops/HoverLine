/* The clips for Eric: each sets up the stage, places objects and says what the camera does. Not game code. */
(function (root) {
  const SPFX = root.SPFX, THREE = root.THREE, ST = SPFX.stage, O = SPFX.obj, CL = SPFX.CLIPS = {};
  const cap = (num, title, extra) => (t, bt) => `<b style="color:#ffb000">${num}</b> ${title}${extra ? '<br><span style="color:#8b93a2">' + (typeof extra === 'function' ? extra(t, bt) : extra) + '</span>' : ''}`;
  // the void: stars and the two planes of light, following the camera
  function voidSky(pal, o = {}) { const cam = ST.c.camera; const s = ST.add(O.stars(THREE, { pal: pal || 'iceViolet', follow: cam, n: o.stars || 1400 }));
    const g = o.grids === false ? null : ST.add(O.grids(THREE, { pal: pal || 'iceViolet', follow: cam, ys: o.ys }));
    return { s, g } }
  CL.test = { dur: 2, fps: 6, setup() { ST.init({ seed: 1234 }); ST.pack(null, 80); voidSky();
      const u = ST.u0 + 200; ST.place(O.solid(THREE, { size: 14, pal: 'goldViolet' }), u, -40, 18);
      ST.place(O.gyro(THREE, { size: 30, pal: "cyanMagenta" }), u + 160, 30, 30);
      ST.place(O.shatter(THREE, { size: 18, pal: 'emberWhite' }), u + 60, 0, 45);
      ST.place(O.stacks(THREE, { size: 14, pal: "jade", carve: true }), u + 10, -30, -6, { level: true });
    }, caption: cap('test', 'look test') };
})(window);
