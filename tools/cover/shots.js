// The cover shots: a track (seed, width, biome, night or day), a place on it (at, metres from the start), the pack
// (each frame's distance from the leader du and its place across the road lat, in metres; steer -1..1; boost), the
// camera (at/look: metres from the leader along the road; up/side: metres above and right of the road's centre line;
// roll in radians; fov) and the speed blur (fx 0..1).
const PACK = {
  // a chase: the Tether nearest the camera, the rest in a staggered wedge ahead of it, the Dart leading
  chase: [
    { f: 'dart', du: 0, lat: 1.5, steer: 0.15 },
    { f: 'blade', du: -5, lat: -3.5, steer: 0.1 },
    { f: 'skiff', du: -9, lat: 5.5, steer: 0.3 },
    { f: 'hauler', du: -13, lat: -7.5 },
    { f: 'mono', du: -17, lat: 1, steer: 0.2 },
    { f: 'orb', du: -21, lat: 8.5 },
    { f: 'roller', du: -25, lat: -4.5, steer: -0.2 },
    { f: 'tether', du: -31, lat: 3, steer: 0.25 }],
  // a V: two big frames either side of a low camera, the rest down the middle to the leader
  vee: [
    { f: 'blade', du: 0, lat: -1.5, steer: 0.1 },
    { f: 'skiff', du: -3, lat: 3.5, steer: 0.3 },
    { f: 'dart', du: -6, lat: -5, steer: 0.15 },
    { f: 'mono', du: -9.5, lat: 1, steer: 0.2 },
    { f: 'roller', du: -12, lat: 7.5, steer: -0.2 },
    { f: 'orb', du: -14, lat: -8.5 },
    { f: 'hauler', du: -19, lat: -4.4, steer: -0.1 },
    { f: 'tether', du: -21, lat: 4.6, steer: 0.25 }],
  // the V spread across the road, for a camera a little higher, so every frame shows
  vee2: [
    { f: 'blade', du: 2, lat: 1.5, steer: 0.1 },
    { f: 'skiff', du: -2, lat: -3, steer: 0.3 },
    { f: 'roller', du: -5, lat: 5.5, steer: -0.2 },
    { f: 'dart', du: -8.5, lat: -7, steer: 0.15 },
    { f: 'mono', du: -11.5, lat: 0.5, steer: 0.2 },
    { f: 'orb', du: -14, lat: 8.8 },
    { f: 'hauler', du: -18.5, lat: -4.6, steer: -0.1 },
    { f: 'tether', du: -20.5, lat: 4.8, steer: 0.25 }],
  // head-on: the pack coming at a camera ahead of it, the Blade leading
  front: [
    { f: 'blade', du: 0, lat: -2, steer: -0.2 },
    { f: 'tether', du: -6, lat: 4.5, steer: -0.1 },
    { f: 'orb', du: -10, lat: -7.5 },
    { f: 'mono', du: -13, lat: 0.5, steer: -0.2 },
    { f: 'dart', du: -17, lat: 7.5 },
    { f: 'hauler', du: -21, lat: -4, steer: -0.1 },
    { f: 'skiff', du: -25, lat: 3, steer: 0.2 },
    { f: 'roller', du: -29, lat: -8, steer: 0.2 }]};
const CHASE = { at: -38, look: -8, up: 1.3, side: 0, lookUp: 1.0, fov: 52, roll: 0.04 };
const REAR = { at: -34, look: -6, up: 1.1, side: -10, lookSide: 1, lookUp: 1.0, fov: 42, roll: 0.03 };
const FRONT = { at: 10, look: -16, up: 0.8, side: 2.5, lookSide: -1, lookUp: 1.4, fov: 46, roll: -0.04 };
const LOW = { at: -29, look: 25, up: 3.0, side: 0, lookUp: 0, fov: 56, roll: 0.03 };
const shots = {
  tunnel_night: { seed: 0x2c41, wk: 'W', biome: 'U', tod: 'night', at: 2740, pack: 'vee2', cam: LOW, warm: 0.45, fx: 0.35 },
  prism_bend_night: { seed: 0x5a17, wk: 'W', biome: 'P', tod: 'night', at: 1000, pack: 'chase', cam: REAR, warm: 0.5, fx: 0.4 },
  prism_front_night: { seed: 0x5a17, wk: 'W', biome: 'P', tod: 'night', at: 1000, pack: 'front', cam: FRONT, warm: 0.5, fx: 0.4 },
  prism_hills_day: { seed: 0x5a17, wk: 'W', biome: 'P', tod: 'day', at: 2400, pack: 'vee2', cam: LOW, warm: 0.45, fx: 0.35 },
  prism_hills_night: { seed: 0x5a17, wk: 'W', biome: 'P', tod: 'night', at: 2600, pack: 'vee2', cam: LOW, warm: 0.45, fx: 0.35 },
  skyline_night: { seed: 0x2c41, wk: 'W', biome: 'U', tod: 'night', at: 4900, pack: 'chase', cam: REAR, warm: 0.5, fx: 0.4 }};
// the title: HOVER in ink, LINE in amber, italic Chakra Petch as the game's .logo; a dim caps line under it as .sub
function layout(s, w, h) {
  const a = w / h, big = a > 1.5 ? h * 0.2 : a > 1.1 ? h * 0.2 : h * 0.15;
  const pos = s.title || (a > 1.5 ? 'bl' : 'tl');
  const P = { bl: `left:${w * 0.045}px;bottom:${h * 0.07}px`, tl: `left:${w * 0.05}px;top:${h * 0.06}px`, tc: `left:0;right:0;top:${h * 0.06}px;text-align:center`, bc: `left:0;right:0;bottom:${h * 0.07}px;text-align:center` }[pos];
  return {
    style: `position:fixed;${P};z-index:99;pointer-events:none`,
    html: `<div class="logo">HOVER<b>LINE</b></div><div class="cvtag">Anti-grav racing</div>`,
    css: `#cover .logo{font-size:${big}px;letter-spacing:-.01em;text-shadow:0 ${big * 0.03}px ${big * 0.12}px rgba(0,0,0,.65),0 0 ${big * 0.4}px rgba(9,11,16,.45)}
      #cover .logo b{text-shadow:0 0 ${big * 0.25}px rgba(255,176,0,.45),0 ${big * 0.03}px ${big * 0.12}px rgba(0,0,0,.6)}
      #cover .cvtag{font:600 ${Math.max(11, big * 0.17)}px var(--display);letter-spacing:.32em;text-transform:uppercase;color:var(--ink);opacity:.85;margin-top:${big * 0.12}px;padding-left:${big * 0.06}px;text-shadow:0 1px ${big * 0.08}px rgba(0,0,0,.8)}` };
}
// the itch.io sizes: the cover (630x500, shown at 315x250), a wide banner and a square
const finals = [
  { shot: 'tunnel_night', w: 630, h: 500, file: 'hoverline-cover-630x500.png' },
  { shot: 'tunnel_night', w: 1920, h: 1080, file: 'hoverline-banner-1920x1080.png' },
  { shot: 'tunnel_night', w: 1024, h: 1024, file: 'hoverline-square-1024.png' }];
module.exports = { shots, layout, finals, PACK };
