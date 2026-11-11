// Round-2 clips (see run.js). setup runs in the page (SW, SPFX, SPC, SPR are there); arg is passed to it.
const SPIRE = 'W1000456-00000000001-P'; // a Wide v1 code: a tight spiral rising 134 m (2200 to 3800 m), a flat top, a dive, a long run after
const TRACK = 'W1000456-0000000010-P';  // round 1's track: a flat loop and a 500 m straight (3500 to 4000 m), then a bend
const PACK = [
  { f: 'dart', du: 40, lat: 1.5 }, { f: 'blade', du: 33, lat: -3.5 }, { f: 'skiff', du: 27, lat: 5.5 }, { f: 'hauler', du: 21, lat: -6.5 },
  { f: 'mono', du: 15, lat: 1 }, { f: 'orb', du: 10, lat: 7.5 }, { f: 'roller', du: 5, lat: -4.5 }, { f: 'tether', du: 0, lat: 2 }];
const SPREAD = [
  { f: 'dart', du: 330, lat: 1.5 }, { f: 'blade', du: 300, lat: -4 }, { f: 'skiff', du: 268, lat: 5 }, { f: 'hauler', du: 236, lat: -6 },
  { f: 'mono', du: 160, lat: 1 }, { f: 'orb', du: 100, lat: 7 }, { f: 'roller', du: 50, lat: -4.5 }, { f: 'tether', du: 0, lat: 2 }];
const ECHO = [
  { f: 'dart', du: 52, lat: 3, weave: 6 }, { f: 'blade', du: 44, lat: -6, weave: 6.5 }, { f: 'skiff', du: 37, lat: 7, weave: 5.5 }, { f: 'hauler', du: 30, lat: -3, weave: 7 },
  { f: 'mono', du: 23, lat: 3, weave: 6 }, { f: 'orb', du: 8, lat: 9, weave: 1 }, { f: 'roller', du: 5, lat: -9, weave: 1 }, { f: 'tether', du: 0, lat: 0, weave: 1 }];
const UE = 4000;
// the simulated clock for clips without the real tune: 2 bars of build, then the drop (140 bpm)
const SIM = { bpm: 140, secs: [[0, 'rise', 2], [2, 'drop', 8], [10, 'b', 8]] };
const ALL = { u0: 2900, u1: 5480, sections: [{ u: 3250, half: 220, fade: 220, peak: 0.6 }, { u: 4350, half: 160, fade: 200, peak: 1 }, { u: 5150, half: 260, fade: 220, peak: 0.9 }],
  room: { u0: 4960, len: 360 }, gate: [3880, 3900, 3920, 3940, 3960, 3980, 4000, 4020, 4860, 4880, 4900, 4920, 4940], arches: [[5380, 5400, 5420, 5440, 5460, 5360, 5340], [4870, 4890, 4910, 4930, 4950, 4850, 4830, 4810], [3900, 3920, 3940, 3960, 3980, 4000, 4020, 4040, 5470, 5490]], rings: [3060, 3460, 4250, 4540, 4880], spiral: [2550, 3720],
  pairs: [{ u: 3300, side: 1, d: 150, du: 160 }, { u: 4420, side: -1, d: 120, du: 150 }, { u: 5150, side: 1, d: 140, du: 150 }], bigZig: [{ u: 4700, side: 0, y: 210, half: 140, n: 8, sh: 18, inv: true }] };
const allCap = (what) => `SPR.cap = () => '<b style="color:#ffb000">B</b> Everything at once · ${what}<br><span style="color:#b8bfcc">lattice in sections, stacks, pyramids, rings, gyroscopes, knots, unfolding solids, shoals, colossi, arches, sacred geometry, carved blocks, stepped sky, other realms, a room, the serpent, heads · simulated 140 bpm</span>'; SPR.meter = true;`;
const cap = (s) => `SPR.cap = () => ${JSON.stringify(s)};`;
module.exports = {
  // ---------------------------------------------------------------- B: everything at once
  '01-all-chase': { title: 'B: everything at once, chase camera, race speed', code: SPIRE, secs: 14, range: [2400, 5543], arg: { u: 2950, pack: PACK, all: ALL, sim: SIM },
    setup: new Function('a', `SPR.useClock(a.sim); SPR.everything(a.all); SW.pack(a.pack, { u: a.u }); SW.camO = { mode: 'chase', d: 12, h: 4.5, l: 16, lu: 2, fov: 78 }; ${allCap('chase camera at race speed (150 m/s)')}`) },
  '02-all-slow': { title: 'B: everything at once, half speed', code: SPIRE, secs: 14, range: [2400, 5543], arg: { u: 4380, pack: PACK, all: ALL, sim: SIM },
    setup: new Function('a', `SPR.useClock(a.sim); SPR.everything(a.all); SW.pack(a.pack, { u: a.u, speed: 0.5 }); SW.camO = { mode: 'chase', d: 12, h: 4.8, l: 16, lu: 3, fov: 80 }; ${allCap('chase camera at half speed (75 m/s)')}`) },
  '03-all-wide': { title: 'B: everything at once, wide', code: SPIRE, secs: 12, range: [2400, 5543], arg: { u: 2980, pack: PACK, all: ALL, sim: SIM },
    setup: new Function('a', `SPR.useClock(a.sim); SPR.everything(a.all); SW.pack(a.pack, { u: a.u, speed: 0.6 });
      SW.camF = (t) => { const r = SW.P[SW.camI].r; return { mode: 'rail', u: r.u - 90 + t * 20, side: 150, up: 95, look: 260, ls: 0, lu: 20, fov: 66, worldUp: true } }; ${allCap('wide, from a crane outside the spiral (90 m/s)')}`) },
  // ---------------------------------------------------------------- A: rule A shown (gate and room on a bend)
  '04-gate-and-room': { title: 'A: a gyroscope gate and the lattice hall round a bend', code: TRACK, secs: 10, range: [3200, 5160], arg: { u: 3480, pack: PACK, sim: SIM },
    setup: new Function('a', `SPR.useClock(a.sim); SW.stars({ u0: 3300, u1: 4800, n: 1400 }); SW.solids({ u0: 3300, u1: 4900, n: 160, side0: 40, side1: 420, up0: -120, up1: 260, clear: 30, s0: 4, s1: 24, name: 'floating solids' });
      const g = SPR.gyroGate({ tick: true }); SPR.put('gyroscope gate', g, (k) => ({ u: 3640 + k * 12, lat: 0, h: 0 }), { nt: 10 });
      for (const [u, s] of [[3600, -1], [3700, 1]]) SPR.put('gyroscopes', SPFX.obj.gyro(THREE, { pal: 'iceViolet', size: 16, rings: 4, tick: true }), (k) => ({ u: u + k * 10, lat: s * (50 + k * 6), h: 22 }));
      SPR.roomLattice({ u0: 3820, len: 520, bodies: 7 }); SW.pack(a.pack, { u: a.u, speed: 0.55 }); SW.camO = { mode: 'chase', d: 12, h: 4.8, l: 16, lu: 2, fov: 80 };
      ${cap('<b style="color:#ffb000">A</b> The rule: nothing on the road, nothing in front of it<br><span style="color:#b8bfcc">the road runs through the gyroscope’s open middle (its rings turn only round the road); the lattice hall follows the bend and opens where its inner wall would hide the road · 82 m/s</span>')} SPR.meter = true;`) },
  '00-rule-a': { title: 'A: the keep-out and the sight lines, drawn', code: SPIRE, secs: 1, range: [2400, 5543], arg: { u: 2950, pack: PACK, all: ALL, sim: SIM },
    setup: new Function('a', `SPR.useClock(a.sim); SPR.everything(a.all); SW.pack(a.pack, { u: a.u }); SW.h.G.add(SPC.debug({ u0: 2400, u1: 5540, ps: 2.2 }));
      const c = SW.fr(3150).p.clone(); SW.camO = { mode: 'fixed', pos: c.clone().add(new THREE.Vector3(420, 520, 380)), look: c, fov: 60 };
      ${cap('<b style="color:#ffb000">A</b> The rule, drawn: red = the keep-out round the road (width + 6 m each side, 4 m under, 16 m over); cyan = every sight line from a chase camera to the next 300 m of road. Nothing is placed where it touches either.')}`) },
  // ---------------------------------------------------------------- F: the game's own tune on the lattice
  '05-music': { title: 'F: the world on the game\'s own tune (with sound)', code: TRACK, secs: 20, range: [3100, 5160], arg: { u: 3400, pack: PACK },
    music: { from: 'brkEnd', brkBars: 3, secs: 20, code: 'S5800016053' },
    setup: new Function('a', `SW.stars({ u0: 3300, u1: 5000, n: 1400 });
      const L = SPR.lattice({ u0: 3250, u1: 5000, sections: [{ u: 3800, half: 380, fade: 160, peak: 1 }, { u: 4600, half: 320, fade: 160, peak: 0.95 }], gain: 1.1 });
      const g = SPR.gyroGate({ tick: true, pal: 'goldViolet' }); SPR.put('gyroscope gate', g, (k) => ({ u: 3660 + k * 12, lat: 0, h: 0 }), { nt: 10 });
      SW.rings({ us: [3560, 3900, 4450], w: 0.15 }); SW.carved({ u0: 3400, u1: 4900, n: 12 }); SW.pyramids({ u0: 3400, pairs: [{ u: 3600, side: 1, d: 150, du: 150 }, { u: 4250, side: -1, d: 160, du: 150 }] });
      SW.ringKick = SW.ringStep = SW.tierStep = SW.carvedStep = true; SW.beatAmt = 0.7; let ph = 0; SW.pyrDrive = (t, b) => { const tg = b && (b.sec === 'drop' || b.sec === 'b') ? 1 : 0; ph += (tg - ph) * 0.06; return ph };
      SW.anim.push((t, dt, b) => { SW.h.U.uGain.value = b ? (1 - 0.7 * b.brk) * (1 + 0.4 * b.drop) : 1 });
      for (const [u, s] of [[3600, 1], [3980, -1], [4400, 1]]) SPR.put('stacks', SPFX.obj.stacks(THREE, { pal: 'jade', size: 13, tiers: 5, stacks: 2, carve: true, seed: u }), (k) => ({ u: u + k * 10, lat: s * (55 + k * 5), h: -4, level: true }));
      SPR.put('shoal ring', SPR.shoalForm(SPR.shape.ring(26, 4), { n: 700, fish: 1, amp: 7, pal: 'emberWhite' }), (k) => ({ u: 3850 + k * 15, lat: -70 - k * 5, h: 34 }), { nt: 3 });
      SPR.placeFloor('colossi', SPR.colossus({ size: 1400, target: () => SPR.leadPos(), pal: 'iceViolet' }), 4100, 1900, -260);
      SW.pack(a.pack, { u: a.u, speed: 0.47 }); SW.camO = { mode: 'chase', d: 16, h: 7, l: 18, lu: 6, fov: 82 };
      SPR.meter = true; SPR.meterNote = (b) => 'tune ' + SPR.tune.code + ' · ' + Math.round(b.bpm) + ' bpm';
      SPR.cap = () => '<b style="color:#ffb000">F</b> The world on the game’s own music (sound in the MP4)<br><span style="color:#b8bfcc">the tune rendered by the game’s Pregen; the lattice: a pulse along the struts on every kick, drawn in through the build, a flare on the drop, dim in the breakdown</span>';`) },
  // ---------------------------------------------------------------- H: the portal shows the road beyond
  '06-portal-full': { title: 'H: portal showing the road ahead, full speed', code: TRACK, secs: 6, range: [3200, 5160], arg: { u: UE - 430, uE: UE, pack: SPREAD, slow: 1, sim: SIM },
    setup: new Function('a', `SPR.useClock(a.sim); const E = SW.fr(a.uE); SW.avoid = [{ c: E.p.clone().addScaledVector(E.t, -120), r: 200 }];
      SW.pack(a.pack, { u: a.u }); const J = SW.portalJump({ uE: a.uE, breaking: false }); SPC.addRoad(J.road); SW.jumpAll(); SW.airTrails({ n: 16 });
      SW.stars({ u0: a.u - 100, u1: a.u + 900, n: 1400 }); SW.solids({ u0: a.u - 100, u1: a.u + 1200, n: 160, side0: 40, side1: 420, up0: -100, up1: 260, clear: 30, s0: 4, s1: 24, name: 'floating solids' });
      SPR.lattice({ u0: a.u - 200, u1: a.u + 900, sections: [{ u: a.uE - 120, half: 260, fade: 200, peak: 0.55 }] }); SW.carved({ u0: a.u, u1: a.u + 600, n: 8 });
      SPR.portalView({ scale: 0.5 }); SW.slow = a.slow; SW.camO = { mode: 'chase', d: 11, h: 4.5, l: 14, lu: 4, fov: 72 };
      ${cap('<b style="color:#ffb000">H</b> The portal shows the road you come out on (and the racers already there)')} const cp0 = SPR.cap; SPR.cap = (t) => cp0(t) + '<br><span style="color:#b8bfcc">' + (a.slow < 1 ? 'half speed' : 'full speed') + ' · the view is a second render of the scene at half resolution, only while the portal is in view</span>';`) },
  // ---------------------------------------------------------------- G: echoes, redone
  '08-echoes': { title: 'G: echoes on a marked stretch, collapsing in a cascade', code: TRACK, secs: 9, range: [3200, 5160], arg: { u: 3500, pack: ECHO, sim: SIM },
    setup: new Function('a', `SPR.useClock(a.sim); SW.base({ u0: a.u - 100, u1: a.u + 1000, rings: false, pyr: false, carvedN: 6, density: 0.6, lattice: false });
      SPR.lattice({ u0: a.u - 200, u1: a.u + 1000, sections: [{ u: a.u + 400, half: 300, fade: 200, peak: 0.45 }] });
      SW.pack(a.pack, { u: a.u }); SPR.echoes({ u0: 3640, u1: 3760 }); SPR.echoes2 = SPR.echoes({ u0: 3920, u1: 4040 }); SW.slow = 0.5;
      SW.camO = { mode: 'chase', d: 10, h: 4.4, l: 16, lu: 1, fov: 74 };
      ${cap('<b style="color:#ffb000">G</b> Echoes: only on the violet-edged stretches; three faint after-images of each leader, and as it leaves, 3 joins 2, 2 joins 1, 1 joins the frame<br><span style="color:#b8bfcc">half speed · one merged mesh per frame type, all three after-images in one draw</span>')}`) },
  // ---------------------------------------------------------------- C: shoals as a material
  '09-shoal-forms': { title: 'C: things made of shoals', code: TRACK, secs: 10, range: [3200, 5160], arg: { u: 3480, pack: PACK, sim: SIM },
    setup: new Function('a', `SPR.useClock(a.sim); SW.stars({ u0: 3300, u1: 4800, n: 1400 });
      SPR.lattice({ u0: 3300, u1: 4600, sections: [{ u: 3900, half: 400, fade: 200, peak: 0.35 }] });
      const span = 2 * (13 + SPC.o.margin) * 2.1, rise = SPC.o.above * 2.5;
      SPR.put('arch of shoals', SPR.shoalForm(SPR.shape.arch(span, rise, 17, 5), { n: 1000, fish: 0.9, amp: 5, pal: 'jade' }), (k) => ({ u: 3820 + k * 12, lat: 0, h: 0 }), { tries: 10, nt: 3 });
      SPR.put('pyramid of shoals', SPR.shoalForm(SPR.shape.pyramid(80, 6), { n: 1300, fish: 1.5, amp: 10, pal: 'goldViolet' }), (k) => ({ u: 3700 + k * 15, lat: 120 + k * 8, h: -40, level: true }), { nt: 3 });
      SPR.put('ring of shoals', SPR.shoalForm(SPR.shape.ring(30, 5), { n: 800, fish: 1.1, amp: 8, pal: 'cyanMagenta' }), (k) => ({ u: 3640 + k * 15, lat: -75 - k * 6, h: 36, yaw: 0.9 }), { nt: 3 });
      const ghost = SPR.colossus({ size: 900 }), segs = SPR.segsOf(ghost.group).filter(([p, q]) => p.y > 0 && q.y > 0);
      const sc = SPR.shoalForm(segs, { n: 2600, fish: 5, amp: 45, pal: 'emberWhite', slideM: 30, slide: 0.05, swirl: 1 }); SPR.placeFloor('colossus of shoals', sc, 4300, -1300, -200);
      SW.pack(a.pack, { u: a.u, speed: 0.4 }); SW.camO = { mode: 'chase', d: 13, h: 5.5, l: 16, lu: 8, fov: 82 };
      ${cap('<b style="color:#ffb000">C</b> Shoals as a material: an arch over the road, a pyramid, a ring and a colossus, each a flock holding the shape<br><span style="color:#b8bfcc">a puff on every kick; every 2 bars they loosen, wheel and re-form; they scatter on the drop · 60 m/s · simulated 140 bpm</span>')} SPR.meter = true;`) },
  // ---------------------------------------------------------------- E: colossi
  '10-colossi': { title: 'E: colossi sunk to the waist', code: TRACK, secs: 9, range: [3200, 5160], arg: { u: 3450, pack: PACK, sim: SIM },
    setup: new Function('a', `SPR.useClock(a.sim); SW.stars({ u0: 3300, u1: 4800, n: 1600 }); SW.solids({ u0: 3300, u1: 5000, n: 200, side0: 0, side1: 700, up0: 80, up1: 560, clear: 60, s0: 14, s1: 60, seed: 77, spin: 0.12, name: 'sky solids' });
      const lead = () => SPR.leadPos(); const put = (H, d, lat, pal) => SPR.placeFloor('colossi', SPR.colossus({ size: H, target: lead, pal }), a.u + d, lat, -260);
      put(1600, 900, -2000, 'iceViolet'); put(1300, 1400, 1800, 'goldViolet'); put(1900, 2600, -600, 'cyanMagenta');
      SW.pack(a.pack, { u: a.u, speed: 0.75 }); SW.camO = { mode: 'chase', d: 13, h: 5, l: 16, lu: 22, fov: 84 };
      ${cap('<b style="color:#ffb000">E</b> Colossi, 1.3 to 1.9 km tall, sunk to the waist in the void’s floor; their heads follow the leader<br><span style="color:#b8bfcc">the floor is a faint plane of light; ripples spread from each waist · 112 m/s</span>')}`) },
  // ---------------------------------------------------------------- D: the lattice in sections
  '11-lattice-sections': { title: 'D: the lattice strengthening and fading in sections', code: TRACK, secs: 12, range: [2900, 5160], arg: { u: 3300, pack: PACK },
    setup: new Function('a', `SPR.useClock({ bpm: 140, secs: [[0, 'b', 99]] }); SW.stars({ u0: 3000, u1: 5100, n: 1600 });
      const L = SPR.lattice({ u0: 3150, u1: 5100, sections: [{ u: 3700, half: 160, fade: 220, peak: 1 }, { u: 4500, half: 200, fade: 260, peak: 0.8 }] }); L.music = false;
      SW.pack(a.pack, { u: a.u, speed: 0.9 });
      SW.camF = (t) => { const r = SW.P[SW.camI].r; return { mode: 'rail', u: r.u - 160, side: -170, up: 120, look: 420, ls: 0, lu: 0, fov: 70, worldUp: true } };
      ${cap('<b style="color:#ffb000">D</b> The lattice, much stronger, in sections: it fades in, strengthens (more struts, brighter, bolder), and fades out along the lap<br><span style="color:#b8bfcc">two sections here (peak 1 and 0.8); between them almost nothing · high camera beside the pack, 135 m/s</span>')}`) },
};
module.exports['07-portal-half'] = Object.assign({}, module.exports['06-portal-full'], { title: 'H: portal showing the road ahead, half speed', secs: 9, arg: Object.assign({}, module.exports['06-portal-full'].arg, { slow: 0.5 }) });
module.exports.allTest = Object.assign({}, module.exports['01-all-chase'], { secs: 1 });
