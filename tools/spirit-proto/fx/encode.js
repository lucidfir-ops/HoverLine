// Re-encode clips from kept frames (render.js --frames): node encode.js <framesRoot> <outDir> name,name,...
// Uses the same settings and click track as render.js (the beat offset is read from clips.js through a tiny shim).
const fs = require('fs'), path = require('path'), { execFileSync } = require('child_process');
const [root, out, list] = process.argv.slice(2);
// read beatOffset and fps without a browser: evaluate clips.js with stubs
const SP = { stage: {}, obj: {}, room: {}, G: { uFog: { value: { set() {} } } }, palName: () => '' };
global.window = { SPFX: SP, THREE: {} }; require('./clips.js'); const CL = SP.CLIPS;
const R = require('./render-lib.js');
for (const name of list.split(',')) {
  const C = CL[name], fps = C.fps || 18, dir = path.join(root, 'frames-' + name), n = fs.readdirSync(dir).filter((f) => f.endsWith('.png')).length;
  R.encode(dir, out, name, fps, n, (C.t0 || 0) + (C.beatOffset || 0), C.audio !== false);
}
