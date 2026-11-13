// Prototype 62: remove kits, instruments and packs from the sample library (samples/) that nothing can request.
//
//   node tools/audio/prune-samples.js tools/audio/cut.json [--write]
//
// cut.json's "samples" section lists them: { "kits": [...], "instruments": [...], "packs": [...] }. With --write the script
//   - removes those entries and every sound of those packs from samples/manifest.json, and the sources no remaining sound
//     is made from;
//   - deletes the pack files (<pack>.bin);
//   - deletes tools/samples/kits/<name>.json for each kit and instrument, so build_samples.py doesn't build them again;
//   - removes their sections from samples/CREDITS.md and the sources nothing uses any more.
// It refuses when a kit or instrument that stays points at a pack that goes, or a sound that stays is in a pack that goes.
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..', '..');
const cutFile = path.resolve(process.argv[2] || path.join(__dirname, 'cut.json')), write = process.argv.includes('--write');
const spec = JSON.parse(fs.readFileSync(cutFile, 'utf8')).samples;
const S = path.join(ROOT, 'samples'), man = JSON.parse(fs.readFileSync(path.join(S, 'manifest.json'), 'utf8'));
const kits = new Set(spec.kits), inst = new Set(spec.instruments), packs = new Set(spec.packs);
// safety: what stays must not need what goes
for (const [k, K] of Object.entries(man.kits)) if (!kits.has(k)) for (const p of K.packs || []) if (packs.has(p)) throw new Error('kit ' + k + ' stays but uses pack ' + p);
for (const [k, I] of Object.entries(man.instruments)) if (!inst.has(k)) for (const p of I.packs || []) if (packs.has(p)) throw new Error('instrument ' + k + ' stays but uses pack ' + p);
const before = fs.statSync(path.join(S, 'manifest.json')).size; let bytes = 0;
for (const p of packs) { if (!man.packs[p]) throw new Error('no pack ' + p); bytes += man.packs[p].bytes; delete man.packs[p] }
for (const k of kits) { if (!man.kits[k]) throw new Error('no kit ' + k); delete man.kits[k] }
for (const k of inst) { if (!man.instruments[k]) throw new Error('no instrument ' + k); delete man.instruments[k] }
let sounds = 0; for (const [id, s] of Object.entries(man.sounds)) if (packs.has(s.pack)) { delete man.sounds[id]; sounds++ }
// every id a remaining kit or instrument names must still exist
for (const [k, K] of Object.entries(man.kits)) for (const ids of Object.values(K.voices || {})) for (const id of ids) if (!man.sounds[id]) throw new Error('kit ' + k + ' names a sound that is gone: ' + id);
for (const [k, I] of Object.entries(man.instruments)) for (const z of I.zones) if (!man.sounds[z.id]) throw new Error('instrument ' + k + ' names a sound that is gone: ' + z.id);
const used = new Set(Object.values(man.sounds).map((s) => s.src)), goneSrc = Object.keys(man.sources).filter((k) => !used.has(k));
for (const k of goneSrc) delete man.sources[k];
console.log('packs', [...packs].join(' '), '\nkits', [...kits].join(' '), '\ninstruments', [...inst].join(' '));
console.log('sounds removed', sounds, '| pack bytes', bytes, '| sources no longer used:', goneSrc.join(', ') || 'none');
if (write) {
  fs.writeFileSync(path.join(S, 'manifest.json'), JSON.stringify(man));
  for (const p of packs) fs.unlinkSync(path.join(S, p + '.bin'));
  for (const n of [...kits, ...inst]) { const f = path.join(ROOT, 'tools', 'samples', 'kits', n + '.json'); if (fs.existsSync(f)) fs.unlinkSync(f) }
  // CREDITS.md: the "### <pack>: ..." sections of the removed packs (by kit or instrument name), then the unused sources
  const cf = path.join(S, 'CREDITS.md'); let c = fs.readFileSync(cf, 'utf8');
  const secs = c.split(/(?=^### )/m), keepSec = secs.filter((s) => { const m = /^### ([\w]+):/.exec(s); return !(m && (kits.has(m[1]) || inst.has(m[1]) || packs.has(m[1]))) });
  c = keepSec.join('');
  fs.writeFileSync(cf, c); console.log('manifest', before, '->', fs.statSync(path.join(S, 'manifest.json')).size, 'bytes; CREDITS.md sections removed:', secs.length - keepSec.length);
  console.log('sources to take out of CREDITS.md and the README by hand:', goneSrc.join(', ') || 'none');
}
