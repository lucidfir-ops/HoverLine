// Triangles and draw calls per object as built for the clips: node tools/spirit-proto/fx/cost.js
// (a neon line segment is 2 triangles; an instanced mesh counts once per draw but its triangles per instance)
const path = require('path');
const { openPage, launch } = require('./page.js');
const LIB = ['lib/neon.js', 'lib/stage.js', 'lib/objects.js', 'lib/objects2.js', 'lib/rooms.js', 'clips.js'].map((f) => path.join(__dirname, f));
(async () => {
  const b = await launch(); const p = await openPage(b, 640, 360, LIB);
  const r = await p.evaluate(() => { const SP = window.SPFX, O = SP.obj, R = SP.room, ST = SP.stage; ST.size(640, 360); ST.init({ seed: 1234 });
    const L = [
      ['solid (icosahedron)', () => O.solid(THREE, { size: 9 })], ['stars (1400)', () => O.stars(THREE, {})], ['planes of light', () => O.grids(THREE, {})],
      ['road lines (900 m)', () => O.roadLines(THREE, { u0: ST.u0, u1: ST.u0 + 900 })],
      ['stacks 2x5 carved', () => O.stacks(THREE, { size: 16, tiers: 5, stacks: 2, carve: true })], ['stacks 3x6', () => O.stacks(THREE, { size: 140, tiers: 6, stacks: 3 })],
      ['shatter, 80 pieces', () => O.shatter(THREE, { size: 15, depth: 1 })], ['shatter, 12 pieces (small)', () => O.shatter(THREE, { size: 2.4, depth: 0, geo: (s) => new THREE.DodecahedronGeometry(s) })],
      ['merge, 150 shards', () => O.merge(THREE, { size: 12, n: 150 })], ['merge, 260 shards', () => O.merge(THREE, { size: 120, n: 260 })],
      ['unfold cube', () => O.unfoldCube(THREE, { size: 12 })], ['unfold flower', () => O.unfoldFlower(THREE, { size: 8 })],
      ['gyroscope 5 rings', () => O.gyro(THREE, { size: 26, rings: 5 })], ['gyroscope 3 rings', () => O.gyro(THREE, { size: 2.6, rings: 3 })],
      ['knot (360 x 4 strands)', () => O.knot(THREE, { size: 22 })], ['shoal 180', () => O.shoal(THREE, { n: 180 })], ['shoal 60 cubes', () => O.shoal(THREE, { n: 60, geo: (r) => new THREE.BoxGeometry(r, r, r) })],
      ['colossus', () => O.colossus(THREE, { size: 900 })], ['arch 15 blocks', () => O.arch(THREE, { u: 0, n: 15 })], ['arch 31 blocks', () => O.arch(THREE, { u: 0, n: 31, span: 360, rise: 200 })],
      ['realm: Prism rock', () => O.realm(THREE, { kind: 'prism' })], ['realm: Urban block', () => O.realm(THREE, { kind: 'urban' })], ['realm: Reef coral', () => O.realm(THREE, { kind: 'reef' })], ['realm: Forest crown', () => O.realm(THREE, { kind: 'forest' })],
      ['platonic five', () => O.platonic(THREE, {})], ['nested solids', () => O.nested(THREE, {})], ['flower of life + Metatron', () => O.flower(THREE, {})], ['star tetrahedra', () => O.merkaba(THREE, {})], ['beast block', () => O.beastBlock(THREE, {})],
      ['room: lattice hall (700 m)', () => R.lattice(THREE, {})], ['room: mural (700 m)', () => R.mural(THREE, {})], ['room: bloom tunnel + flower', () => R.bloom(THREE, {})], ['chrysanthemum alone', () => R.chrysanthemum(THREE, {})], ['portal', () => R.portal(THREE, {})],
    ];
    return L.map(([n, f]) => { const o = f(); const c = SP.cost(o); return n + ': ' + c.tris + ' tris, ' + c.draws + ' draws' + (c.inst ? ' (' + c.inst + ' instanced)' : '') }) });
  console.log(r.join('\n')); await b.close();
})();
