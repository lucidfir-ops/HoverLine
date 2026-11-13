// Prototype 62: the guard for the built-in recordings (src/assets). The game asks for its recordings by key and by built
// names ('x_'+instrument+'_'+note, 'x_tabla_'+bol, 'v_'+line), so a text search can't say which are used. This runs the
// light matrix of tools/audio/sample-usage.js (every template once in Generative, the tabla bols and "do do do" seeds,
// Pregen, Lite and the older generator on a spread of tunes, the menu music, long races with Shuffle, the sound
// effects, announcer and frame lines) with the request recorder in the page, and fails when:
//   - the game asks for a recording that is in none of the tables (a new template or effect that names a sound that is
//     not there, or one that was pruned), unless tools/audio/known-absent.json lists it as a lookup the code allows to
//     miss (it has a fallback);
//   - a request for a recording listed in tools/audio/cut.json (pruned in Prototype 62) is made at all;
//   - playing a tune throws.
// It also reports the keys in the tables that this run never asked for, and which of those the full run
// (tools/audio/sample-usage.json: node tools/audio/sample-usage.js, about an hour) never asked for either: those are
// dead weight again and can be pruned (tools/audio/prune-assets.js).
const fs = require('fs');
const path = require('path');
const { ok, done } = require('./lib.js');
const { run } = require('../audio/sample-usage.js');
const A = path.join(__dirname, '..', 'audio');
(async () => {
  const cutF = path.join(A, 'cut.json'), absent = JSON.parse(fs.readFileSync(path.join(A, 'known-absent.json'), 'utf8'));
  const t0 = Date.now();
  const r = await run({ guard: true, out: null, strict: fs.existsSync(cutF) ? cutF : null, workers: 4 });
  console.log('ran in', Math.round((Date.now() - t0) / 1000), 's');
  const unknown = Object.keys(r.requestedButNotInAnyTable).filter((k) => !absent.keys.includes(k));
  ok(!unknown.length, 'every recording the game asks for is in a table (or is a listed optional lookup)' + (unknown.length ? ': ' + unknown.join(' ') + ' (' + unknown.map((k) => (r.requestedButNotInAnyTable[k].ex || [])[0]).join('; ') + ')' : ''));
  ok(!r.requestsForCutKeys.length, 'nothing asks for a recording that was pruned' + (r.requestsForCutKeys.length ? ': ' + r.requestsForCutKeys.slice(0, 5).join('; ') : ''));
  ok(!r.failedRuns, 'no tune threw while playing' + (r.failedRuns ? ': ' + JSON.stringify(r.failedRunsDetail).slice(0, 300) : ''));
  const covered = Object.values(r.coverage.runs).reduce((a, x) => a + (x.runs || 0), 0);
  ok(covered > 300, 'the run covered ' + covered + ' plays');
  let full = null; try { full = JSON.parse(fs.readFileSync(path.join(A, 'sample-usage.json'), 'utf8')) } catch (e) {}
  let never = 0, dead = [];
  for (const [f, t] of Object.entries(r.tables)) { never += t.never.length; for (const k of t.never) if (full && full.tables[f] && full.tables[f].never.includes(k)) dead.push(f + ':' + k) }
  console.log('keys in the tables this run never asked for:', never, '(the full run asks for the rest)');
  console.log('keys neither this run nor the full run asks for (prune them):', dead.length ? dead.join(' ') : 'none');
  done();
})().catch((e) => { console.log('FAIL', e.stack || e.message); process.exit(1) });
