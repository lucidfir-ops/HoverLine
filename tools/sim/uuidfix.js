// For the equality check, with seedrand.js (Prototype 51): three.js draws four Math.random numbers for the id of every
// object, geometry and material it makes, so a change to how many parts a ship model has (or any other drawing) moves
// every later random number and the races drift apart though nothing about racing changed. This gives three's ids a
// counter of their own instead.  node --require ./seedrand.js --require ./uuidfix.js balance.js ...
const Module = require('module'), fs = require('fs'), orig = Module._extensions['.js'];
Module._extensions['.js'] = function (m, f) {
  if (!/three[\\/]build[\\/]three(\.min)?\.js$/.test(f)) return orig(m, f);
  let s = fs.readFileSync(f, 'utf8'), n = 0;
  s = s.replace('function generateUUID() {', 'var _uidN = 0;\n\tfunction generateUUID() {');
  s = s.replace(/const d(\d) = Math\.random\(\) \* 0xffffffff \| 0;/g, (a, d) => { n++; return `const d${d} = (++_uidN * 2654435761) | 0;` });
  if (n !== 4) throw new Error('uuidfix: three.js generateUUID not found');
  m._compile(s, f);
};
