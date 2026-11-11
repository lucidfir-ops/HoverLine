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
const UE = 4000;
const SPIRE = 'W1000456-00000000001-P'; // the same seed with a rising spire: a spiral climbing 134 m from 2600 to 3840 m // the portal's entrance, 506 m into the straight
const ECHO = [
  { f: 'dart', du: 70, lat: 3, weave: 4 }, { f: 'blade', du: 58, lat: -5, weave: 4.5 }, { f: 'skiff', du: 46, lat: 6, weave: 3.5 }, { f: 'hauler', du: 36, lat: -2, weave: 5 },
  { f: 'mono', du: 26, lat: 2, weave: 4 }, { f: 'orb', du: 16, lat: 7.5, weave: 2 }, { f: 'roller', du: 8, lat: -6, weave: 3 }, { f: 'tether', du: 0, lat: 0, weave: 1 }];
const MUSIC = (a) => { // the hooks: a simulated 140 bpm clock (bars 0 build, 1-2 drop, 3 breakdown, 4- drop)
  SW.clock({ bpm: 140, bars: [[0, 'build'], [1, 'drop'], [3, 'breakdown'], [4, 'drop']], offset: 0 });
  SW.ringKick = true; SW.ringStep = true; SW.tierStep = true; SW.carvedStep = true; SW.beatAmt = 0.7;
  let ph = 0; SW.pyrDrive = (t, b) => { const tgt = b && b.sec === 'drop' ? 1 : 0; ph += (tgt - ph) * 0.06; return ph };
  SW.anim.push((t, dt, b) => { SW.h.U.uGain.value = b && b.sec === 'breakdown' ? 0.45 : b && b.sec === 'build' ? 0.6 + 0.4 * b.barF : 1 });
  SW.cap = () => { const b = SW.b; return b ? `${b.sec.toUpperCase()}  bar ${b.barN + 1}  ` + [0, 1, 2, 3].map((i) => i === Math.floor(b.barF * 4) ? '●' : '○').join(' ') + '   (simulated 140 bpm)' : '' } };
module.exports = {
  ghosts: { title: 'Ghost riders fading in and out beside the pack', code: TRACK, secs: 6.5, arg: { u: 3540, pack: PACK },
    setup: (a) => { SW.base({ u0: a.u - 100, u1: a.u + 1000, rings: false, carvedN: 8, density: 0.7 }); SW.pack(a.pack, { u: a.u });
      SW.ghostRiders({ list: [{ du: 30, lat: -24, up: 4, t0: 0.6, t1: 4.6, dv: 6 }, { du: 18, lat: -30, up: 7, t0: 0.9, t1: 4.9, dv: 6 }, { du: 44, lat: -27, up: 10, t0: 1.2, t1: 5.0, dv: 6 }, { du: 50, lat: 26, up: 5, t0: 1.6, t1: 5.4, dv: 4 }, { du: 32, lat: 31, up: 9, t0: 1.9, t1: 5.6, dv: 4 }] });
      SW.camO = { mode: 'chase', d: 13, h: 5, l: 16, lu: 2, fov: 82 }; SW.cap = () => 'Hallucination: ghost riders' } },
  echoes: { title: 'Echoes of the leaders (57)', code: TRACK, secs: 6, arg: { u: 3540, pack: ECHO },
    setup: (a) => { SW.base({ u0: a.u - 100, u1: a.u + 1000, rings: false, carvedN: 6, density: 0.6 }); SW.pack(a.pack, { u: a.u }); SW.echoes({ k: 6, every: 3, a: 0.8 });
      SW.camO = { mode: 'chase', d: 12, h: 5, l: 16, lu: 1, fov: 78 }; SW.cap = () => 'Echoes: where the racers ahead were, 0.2 to 1.2 s ago' } },
  music: { title: 'The world on the beat (58)', code: TRACK, secs: 8, arg: { u: 3540, pack: PACK },
    setup: (a) => { SW.base({ u0: a.u - 100, u1: a.u + 1000, ringEvery: 80, stepped: { big: [{ u: a.u + 700, side: 0, y: 200, half: 140, n: 8, sh: 18, inv: true }], n: 10, far: 4, stairs: false } });
      SW.pack(a.pack, { u: a.u }); MUSIC(a); SW.camO = { mode: 'chase', d: 12, h: 4.5, l: 16, lu: 2, fov: 78 } } },
  portal_diag: { title: 'Diagonal portal jump (50), from the side', code: TRACK, secs: 7, arg: { u: UE - 500, uE: UE, pack: SPREAD },
    setup: (a) => { const E = SW.fr(a.uE); SW.avoid = [{ c: E.p.clone().addScaledVector(E.t, -150), r: 280 }]; SW.base({ u0: a.u - 100, u1: a.u + 900, rings: false, pyr: false, carvedN: 4 });
      SW.pack(a.pack, { u: a.u }); const J = SW.portalJump({ uE: a.uE, a: 45, back: 200 }); SW.jumpAll(); SW.airTrails({ n: 18, all: true }); SW.slow = 0.5;
      const c = J.E.p.clone().addScaledVector(J.f0, -130).add(new THREE.Vector3(0, 10, 0)); const pos = J.E.p.clone().addScaledVector(J.f0, -60).addScaledVector(J.r0, -170).add(new THREE.Vector3(0, 70, 0));
      SW.camO = { mode: 'fixed', pos, look: c, fov: 66 }; SW.cap = () => 'Diagonal portal jump (50) · half speed' } },
  void_chase: { title: 'Everything together in the void, chase view', code: TRACK, secs: 6, arg: { u: 3540, pack: PACK },
    setup: (a) => { SW.base({ u0: a.u - 100, u1: a.u + 1000, stepped: { big: [{ u: a.u + 700, side: 0, y: 200, half: 140, n: 8, sh: 18, inv: true }], n: 8, far: 4, stairs: false } });
      SW.pack(a.pack, { u: a.u }); SW.camO = { mode: 'chase', d: 12, h: 4.5, l: 16, lu: 2, fov: 78 }; SW.cap = () => 'Everything together, in the void (8 + 2)' } },
  void_wide: { title: 'Everything together in the void, wide', code: TRACK, secs: 6, arg: { u: 3560, pack: PACK },
    setup: (a) => { SW.base({ u0: a.u - 300, u1: a.u + 1000, stepped: { big: [{ u: a.u + 600, side: 0, y: 210, half: 150, n: 8, sh: 18, inv: true }], n: 10, far: 6, stairs: false } });
      SW.pack(a.pack, { u: a.u }); SW.camF = (t) => { const P = SW.P[SW.camI].r; return { mode: 'rail', u: P.u - 60 + t * 12, side: -55, up: 34, look: 160, ls: 10, lu: 10, fov: 70, worldUp: true } };
      SW.cap = () => 'Everything together, in the void · wide' } },
  bestiary: { title: 'Carved blocks (the bestiary) turning beside the road', code: TRACK, secs: 6, arg: { u: 3520, pack: PACK },
    setup: (a) => { const list = []; for (let i = 0; i < 12; i++) { const side = i % 2 ? 1 : -1, u = a.u + 110 + i * 70; list.push({ p: SW.at(u, side * (34 + (i % 3) * 10), 6 + (i % 4) * 7), s: 11 + (i % 3) * 3, k: i % 4, u }) }
      SW.base({ u0: a.u - 100, u1: a.u + 1000, carvedN: 0, rings: false }); SW.carved({ list, w: 0.5 }); SW.pack(a.pack, { u: a.u });
      SW.camO = { mode: 'chase', d: 12, h: 4.5, l: 16, lu: 3, fov: 74 }; SW.cap = () => 'Carved blocks: serpent-dragon, firebird, stag, sun-ring serpent' } },
  tunnel: { title: 'Hyperspace tunnel with boost pads (11, 59)', code: TRACK, secs: 6, arg: { u: 3420, pack: PACK },
    setup: (a) => { SW.base({ u0: a.u - 100, u1: a.u + 1000, rings: false, pyr: false, carvedN: 6 }); SW.tunnel({ u0: a.u + 60, u1: a.u + 1250, padEvery: 18 }); SW.pack(a.pack, { u: a.u });
      SW.preRender = () => { for (const P of SW.P) { const ins = P.r.u > a.u + 60 && P.r.u < a.u + 1250; P.r.boost = ins ? 1 : 0 } };
      SW.vMul = 1; SW.anim.push((t) => { const r = SW.P[SW.camI].r; SW.vMul = r.u > a.u + 60 ? 1.08 : 1; SW.fx = r.u > a.u + 60 ? 0.55 : 0.2 });
      SW.camO = { mode: 'chase', d: 11, h: 3.9, l: 14, lu: 1, fov: 84 }; SW.cap = () => 'Hyperspace tunnel, boost pads, light stream +8%' } },
  heads: { title: 'Wireframe heads that chase the pack', code: TRACK, secs: 6, arg: { u: 3540, pack: PACK },
    setup: (a) => { SW.base({ u0: a.u - 100, u1: a.u + 1000, rings: false, carvedN: 6, density: 0.7 });
      SW.pack(a.pack, { u: a.u }); SW.heads({ list: [{ side: -1, d: 30, up: 9, s: 8, du: 10, t0: 0.3 }, { side: 1, d: 40, up: 15, s: 12, du: 45, t0: 1.0 }, { side: -1, d: 110, up: 45, s: 32, du: 150, t0: 0 }, { side: 1, d: 150, up: 70, s: 44, du: 260, t0: 0 }] });
      SW.camO = { mode: 'chase', d: 12, h: 4.5, l: 16, lu: 3, fov: 80 }; SW.cap = () => 'Faces that follow the pack' } },
  serpent_ride: { title: 'Serpent (18) under the spiral, from the pack', code: SPIRE, secs: 6.5, arg: { u: 2760, pack: PACK },
    setup: (a) => { SW.base({ u0: a.u - 100, u1: a.u + 900, rings: false, pyr: false, carvedN: 8 }); SW.pack(a.pack, { u: a.u }); SW.serpent({ follow: true, ahead: 150, n: 50, neck: 10, lookBack: true });
      SW.camO = { mode: 'chase', d: 14, h: 9, l: 18, lu: -2.5, fov: 80 }; SW.cap = () => 'Serpent of segments (18) under the rising spiral' } },
  serpent_wide: { title: 'Serpent (18) under the spiral, from outside', code: SPIRE, secs: 6.5, arg: { u: 2700, pack: PACK },
    setup: (a) => { SW.avoid = [{ c: new THREE.Vector3(-320, 70, -460), r: 520, lat: 1 }]; SW.base({ u0: a.u - 600, u1: a.u + 900, rings: false, pyr: false, carvedN: 6, lattice: false }); SW.pack(a.pack, { u: a.u }); SW.serpent({ follow: true, ahead: 150, n: 50, neck: 10, lookBack: true });
      const c = new THREE.Vector3(-320, 70, -460); SW.camO = { mode: 'fixed', pos: (t) => c.clone().add(new THREE.Vector3(Math.cos(0.9 + t * 0.06) * 300, 30, Math.sin(0.9 + t * 0.06) * 300)), look: c.clone().add(new THREE.Vector3(0, 10, 0)), fov: 55 };
      SW.cap = () => 'Serpent (18) under the rising spiral · wide' } },
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
// the colour themes: the same view in each palette (stills for a sheet)
for (const pal of ['prism', 'goldviolet', 'cyanmag', 'ember', 'jade']) module.exports['pal_' + pal] = Object.assign({}, module.exports.void_chase, { pal, title: 'Colour theme: ' + pal, arg: Object.assign({ pal }, module.exports.void_chase.arg),
  setup: (a) => { SW.base({ u0: a.u - 100, u1: a.u + 1000, stepped: { big: [{ u: a.u + 700, side: 0, y: 200, half: 140, n: 8, sh: 18, inv: true }], n: 8, far: 4, stairs: false } });
    SW.pack(a.pack, { u: a.u }); SW.camO = { mode: 'chase', d: 12, h: 4.5, l: 16, lu: 2, fov: 78 }; SW.cap = () => SW.PALS[a.pal].n } });
