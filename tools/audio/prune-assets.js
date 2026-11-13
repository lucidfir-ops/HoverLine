// Prototype 62: remove recordings from the tables in src/assets that nothing can ask for.
//
//   node tools/audio/prune-assets.js tools/audio/cut.json [--write]
//
// cut.json: { "cut": [keys...], "why": {key: reason}, "tables": {"sl-ext": [keys...], ...} } (tables is written by this
// script). Without --write it only reports sizes. The tables are single-line JS (SL.EXT={"key":"base64",...};), so a
// key is removed by parsing the object and writing it back in the same order and format; the script first checks that
// writing the untouched object back gives the file byte for byte, so nothing else can change.
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..', '..');
const FILES = { 'sl-smp': 'SL.SMP', 'sl-vox': 'SL.VOX', 'sl-ext': 'SL.EXT', 'sl-ext2': 'SL.EXT2', 'sl-sfx': 'SL.SFX', cvox: 'const CVOX' };
const cutFile = path.resolve(process.argv[2] || path.join(__dirname, 'cut.json')), write = process.argv.includes('--write');
const spec = JSON.parse(fs.readFileSync(cutFile, 'utf8')), cut = new Set(spec.cut || []);
const tables = {}; let total = 0, before = 0, after = 0;
for (const [f, head] of Object.entries(FILES)) {
  const file = path.join(ROOT, 'src', 'assets', f + '.js'), s = fs.readFileSync(file, 'utf8');
  const m = /^(SL\.[A-Z0-9]+|const CVOX)=(\{.*\});$/s.exec(s); if (!m || m[1] !== head) throw new Error(f + ': not in the expected form');
  const obj = f === 'cvox' ? new Function('return ' + m[2])() : JSON.parse(m[2]);
  const back = m[1] + '=' + (f === 'cvox' ? '{' + Object.entries(obj).map(([k, v]) => k + ':' + JSON.stringify(v)).join(',') + '}' : JSON.stringify(obj)) + ';';
  if (back !== s) throw new Error(f + ': writing the table back would change it (not a plain JSON table), refusing');
  const keep = Object.entries(obj).filter(([k]) => !cut.has(k)), gone = Object.keys(obj).filter((k) => cut.has(k));
  tables[f] = gone; total += gone.length; before += s.length;
  const out = m[1] + '=' + (f === 'cvox' ? '{' + keep.map(([k, v]) => k + ':' + JSON.stringify(v)).join(',') + '}' : JSON.stringify(Object.fromEntries(keep))) + ';';
  after += out.length;
  console.log(f.padEnd(8), 'keys', String(Object.keys(obj).length).padStart(4), 'cut', String(gone.length).padStart(4), 'keep', String(keep.length).padStart(4), 'bytes', s.length, '->', out.length);
  if (write && gone.length) fs.writeFileSync(file, out);
}
for (const k of cut) if (!Object.values(tables).some((t) => t.includes(k))) console.log('note: not in any table (already gone):', k);
console.log('total cut', total, 'bytes', before, '->', after, '(' + (before - after) + ' fewer)');
if (write) { spec.tables = tables; fs.writeFileSync(cutFile, JSON.stringify(spec, null, 1) + '\n'); console.log('wrote', path.relative(ROOT, cutFile)) }
