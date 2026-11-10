// The clips (see run.js). setup runs in the page with world.js's SW; arg is passed to it.
const TRACK = 'W1000456-0000000010-P'; // a v1 Wide code with one spiral (helix 2106-3494 m) and a 700 m straight after it
// the pack, as cover.js's chase: du metres from the camera's racer (the last), lat across the road
const PACK = [
  { f: 'dart', du: 40, lat: 1.5 }, { f: 'blade', du: 33, lat: -3.5 }, { f: 'skiff', du: 27, lat: 5.5 }, { f: 'hauler', du: 21, lat: -6.5 },
  { f: 'mono', du: 15, lat: 1 }, { f: 'orb', du: 10, lat: 7.5 }, { f: 'roller', du: 5, lat: -4.5 }, { f: 'tether', du: 0, lat: 2 }];
module.exports = {
  test: { title: 'test still', code: TRACK, secs: 2, arg: { u: 3560, pack: PACK },
    setup: (a) => { SW.base({ u0: a.u - 100, u1: a.u + 900 }); SW.pack(a.pack, { u: a.u }); SW.camO = { mode: 'chase', d: 11, h: 3.9, l: 14, fov: 76 } } },
};
