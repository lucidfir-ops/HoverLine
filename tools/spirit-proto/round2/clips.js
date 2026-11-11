// Round-2 clips (see run.js). setup runs in the page (SW, SPFX, SPC, SPR are there); arg is passed to it.
const SPIRE = 'W1000456-00000000001-P'; // a Wide v1 code with a spiral rising 134 m (2600 to 3840 m), its drop, and a long run after
const TRACK = 'W1000456-0000000010-P';  // round 1's track: a flat loop and a 700 m straight (3540 to 4240 m)
const PACK = [
  { f: 'dart', du: 40, lat: 1.5 }, { f: 'blade', du: 33, lat: -3.5 }, { f: 'skiff', du: 27, lat: 5.5 }, { f: 'hauler', du: 21, lat: -6.5 },
  { f: 'mono', du: 15, lat: 1 }, { f: 'orb', du: 10, lat: 7.5 }, { f: 'roller', du: 5, lat: -4.5 }, { f: 'tether', du: 0, lat: 2 }];
const ALL = { u0: 2900, u1: 5480, sections: [{ u: 3250, half: 220, fade: 220, peak: 0.85 }, { u: 4350, half: 160, fade: 200, peak: 1 }, { u: 5150, half: 260, fade: 220, peak: 0.9 }],
  room: { u0: 4960, len: 360 }, gate: 3930, arches: [3990, 4620, 5380], rings: [3060, 3460, 4250, 4540, 4880], spiral: [2550, 3720],
  pairs: [{ u: 3300, side: 1, d: 150, du: 160 }, { u: 4420, side: -1, d: 120, du: 150 }, { u: 5150, side: 1, d: 140, du: 150 }], bigZig: [{ u: 4700, side: 0, y: 210, half: 140, n: 8, sh: 18, inv: true }] };
module.exports = {
  allTest: { title: 'everything (test)', code: SPIRE, secs: 2, range: [2400, 5543], arg: { u: 3000, pack: PACK, all: ALL },
    setup: (a) => { SPR.everything(a.all); SW.pack(a.pack, { u: a.u }); SW.camO = { mode: 'chase', d: 12, h: 4.5, l: 16, lu: 2, fov: 78 } } },
  test: { title: 'test', code: TRACK, secs: 2, range: [3000, 5160], arg: { u: 3450, pack: PACK, noRoom: 1 },
    setup: (a) => { SW.stars({ u0: a.u - 200, u1: a.u + 1200, n: 1400 }); SPR.useClock({ bpm: 140, secs: [[0, 'b', 8]] });
      if (!a.noLat) SPR.lattice({ u0: a.u - 300, u1: a.u + 1300, sections: [{ u: a.u + 450, half: 200, fade: 250, peak: 1 }] });
      if (!a.noRoom) SPR.roomLattice({ u0: a.u + 250, len: 500 });
      const g = SPR.gyroGate({ tick: true }); SPR.put('gyro gate', g, (k) => ({ u: a.u + 150 + k * 20, lat: 0, h: 0 }), { nt: 10 });
      SW.pack(a.pack, { u: a.u }); SW.camO = { mode: 'chase', d: 12, h: 4.5, l: 16, lu: 2, fov: 78 } } },
};
