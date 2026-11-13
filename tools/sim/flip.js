// Prototype 63: the Spirit realm's underside (track/004t) in the headless game: races on underside tracks finish, which
// face the AI takes, and what the face is worth: the same race run with one racer held to the under face, then to the top.
//   cd tools/sim && python3 gen.py && node flip.js [races per code=4] [codes...]
const load = require('./hl.js'), H = load();
const n = +(process.argv[2] || 4), CODES = process.argv.slice(3).length ? process.argv.slice(3) : ['W1B85AB4-S', 'SL14C3D65-S', 'N174B7E1-S', 'NXL128DB8B-S', 'WQ1E5FA7B-S', 'SXQ1A67AEB-S'];
const out = [];
for (const code of CODES) { const c = H.parseCode(code);
  let fin = 0, tot = 0, under = 0, top = 0, wr = 0, dts = [];
  for (let k = 0; k < n; k++) {
    const res = {};
    for (const face of ['free', 'under', 'top']) {
      H.loadTrack(c.seed, c.wk, c.cx, c.lk, c.sp || null, c.bm); const T = H.getT(), SP = T.splits.find((x) => x.kind === 'flip'); if (!SP) { console.log(code, 'no underside'); break }
      H.RACE.force = 900000 + k * 7; H.startRace(); const me = H.racers[2];
      const seen = new Set(); let t = 0;
      while (t < 600) { if (face !== 'free') { const b = face === 'under' ? SP.fB : SP.tB; me.brPick = { SP, b, long: SP.b[b].long } }
        H.step(1 / 60); t += 1 / 60;
        if (face === 'free') for (const r of H.racers) if (r.brS === SP && ((r.u - SP.u0) % T.L + T.L) % T.L > SP.n * T.ds * 0.5) { const key = r.name + ':' + Math.floor(r.utot / T.L); if (!seen.has(key)) { seen.add(key); if (r.br === SP.fB) under++; else top++ } }
        if (H.racers.every((r) => r.finishT != null)) break }
      res[face] = me.finishT; if (face === 'free') { fin += H.racers.filter((r) => r.finishT != null).length; tot += H.racers.length; wr += H.racers.reduce((a, r) => a + r.stat.wrecks, 0) } }
    if (res.under && res.top) dts.push(res.top - res.under) }
  const m = dts.reduce((a, x) => a + x, 0) / Math.max(1, dts.length);
  out.push(code + ': finished ' + fin + '/' + tot + ', wrecks ' + wr + ', passes under ' + under + ' top ' + top + ', one racer held under is ' + m.toFixed(2) + ' s quicker over the race than held on top (' + dts.map((x) => x.toFixed(2)).join(' ') + ')');
  console.log(out[out.length - 1]) }
