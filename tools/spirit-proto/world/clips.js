// The clips (see run.js). setup runs in the page with world.js's SW and pieces.js; arg is passed to it.
const TRACK = 'W1000456-0000000010-P'; // a v1 Wide code with one spiral (helix 2106-3494 m) and a 700 m straight after it
// the pack, as cover.js's chase: du metres from the camera's racer (the last), lat across the road
const PACK = [
  { f: 'dart', du: 40, lat: 1.5 }, { f: 'blade', du: 33, lat: -3.5 }, { f: 'skiff', du: 27, lat: 5.5 }, { f: 'hauler', du: 21, lat: -6.5 },
  { f: 'mono', du: 15, lat: 1 }, { f: 'orb', du: 10, lat: 7.5 }, { f: 'roller', du: 5, lat: -4.5 }, { f: 'tether', du: 0, lat: 2 }];
// a strung-out field for the portal: leaders 1 to 1.6 s ahead of the camera's racer
const SPREAD = [
  { f: 'dart', du: 330, lat: 1.5 }, { f: 'blade', du: 300, lat: -4 }, { f: 'skiff', du: 268, lat: 5 }, { f: 'hauler', du: 236, lat: -6 },
  { f: 'mono', du: 160, lat: 1 }, { f: 'orb', du: 100, lat: 7 }, { f: 'roller', du: 50, lat: -4.5 }, { f: 'tether', du: 0, lat: 2 }];
// the jumper's view: the camera's racer (hauler) mid-field, two ahead, the rest close behind on the main road below
const JUMP = [
  { f: 'dart', du: 150, lat: 1.5 }, { f: 'blade', du: 110, lat: -4 }, { f: 'skiff', du: 40, lat: 5 }, { f: 'hauler', du: 0, lat: -1 },
  { f: 'mono', du: -60, lat: 1 }, { f: 'orb', du: -85, lat: 7 }, { f: 'roller', du: -110, lat: -4.5 }, { f: 'tether', du: -140, lat: 2 }];
const UE = 4000; // the portal's entrance, 506 m into the straight
module.exports = {
  test: { title: 'test still', code: TRACK, secs: 2, arg: { u: 3560, pack: PACK },
    setup: (a) => { SW.base({ u0: a.u - 100, u1: a.u + 900 }); SW.pack(a.pack, { u: a.u }); SW.camO = { mode: 'chase', d: 11, h: 3.9, l: 14, fov: 76 } } },
  portal_last: { title: 'Portal jump (49) from the last racer', code: TRACK, secs: 8, arg: { u: UE - 420, uE: UE, pack: SPREAD },
    setup: (a) => { const E = SW.fr(a.uE); SW.avoid = [{ c: E.p.clone().addScaledVector(E.t, -120), r: 200 }]; SW.base({ u0: a.u - 100, u1: a.u + 900, rings: false, pyr: false });
      SW.pack(a.pack, { u: a.u }); SW.portalJump({ uE: a.uE, breaking: false }); SW.jumpAll(); SW.airTrails({ n: 16 }); SW.slow = 0.5;
      SW.camO = { mode: 'chase', d: 11, h: 4.5, l: 14, lu: 5, fov: 70 }; SW.cap = () => 'Portal jump (49) · half speed' } },
  portal_wide: { title: 'Portal jump (49), the whole piece from the side', code: TRACK, secs: 6, arg: { u: UE - 560, uE: UE, pack: SPREAD },
    setup: (a) => { const E = SW.fr(a.uE); SW.avoid = [{ c: E.p.clone(), r: 260 }]; SW.base({ u0: a.u - 100, u1: a.u + 900, rings: false, pyr: false, carvedN: 6 }); SW.pack(a.pack, { u: a.u }); const J = SW.portalJump({ uE: a.uE }); SW.jumpAll();
      const c = J.E.p.clone().addScaledVector(J.f0, -105).addScaledVector(J.r0, 5).add(new THREE.Vector3(0, 8, 0)); const pos = J.E.p.clone().addScaledVector(J.f0, -20).addScaledVector(J.r0, -150).add(new THREE.Vector3(0, 55, 0));
      SW.camO = { mode: 'fixed', pos, look: c, fov: 66 } } },
  portal_top: { title: 'debug: from above', code: TRACK, secs: 3, arg: { u: UE - 560, uE: UE, pack: SPREAD },
    setup: (a) => { const E = SW.fr(a.uE); SW.avoid = [{ c: E.p.clone(), r: 400 }]; SW.base({ u0: a.u - 100, u1: a.u + 900, rings: false, pyr: false, carvedN: 0, lattice: false }); SW.pack(a.pack, { u: a.u }); const J = SW.portalJump({ uE: a.uE }); SW.jumpAll();
      const c = J.E.p.clone().addScaledVector(J.f0, -100).addScaledVector(J.r0, -40); const pos = c.clone().add(new THREE.Vector3(0, 420, 0)).addScaledVector(J.f0, -1);
      SW.camO = { mode: 'fixed', pos, look: c, fov: 60 } } },
  portal_jumper: { title: 'Portal jump (49) from a jumper', code: TRACK, secs: 7, arg: { u: UE - 230, uE: UE, pack: JUMP },
    setup: (a) => { const E = SW.fr(a.uE); SW.avoid = [{ c: E.p.clone().addScaledVector(E.t, -120), r: 200 }]; SW.base({ u0: a.u - 100, u1: a.u + 900, rings: false, pyr: false });
      SW.pack(a.pack, { u: a.u, cam: 3 }); SW.portalJump({ uE: a.uE }); SW.jumpAll(); SW.airTrails({ n: 12 }); SW.slow = 0.6;
      SW.slowFn = () => { const r = SW.P[SW.camI].r, s = r.u - r.path.u0; return s > -20 && s < 200 ? 0.25 : 0.6 };
      SW.camO = { mode: 'chase', d: 13, h: 5, l: 12, lu: 0, fov: 80, air: { h: 9, lu: -9, d: 15 } }; SW.cap = () => 'Portal jump (49) · from a jumper · ' + (SW.slow < 0.4 ? 'quarter speed' : 'slow motion') } },
};
