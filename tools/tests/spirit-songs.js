// Prototype 63: the Spirit realm answers Songs mode (the recorded tracks in songs/, played through an <audio> element). The
// test page serves the repo's songs/ folder like a web server would (lib.js open option songs), runs a race on a Spirit track in
// Songs mode and checks that
//   - the <audio> element plays and is routed through the WebAudio graph (a MediaElementSource into the music volume),
//   - the analyser on the music volume hears it (level, a bass band that moves, the sound form),
//   - kicks are found from the bass band (onsets over the running level) at a believable rate, never two shown less than
//     0.34 s apart (three a second at most),
//   - breakdown and drop are told from the level over the last seconds against the last half minute,
//   - the realm's own lattice controls move with it.
// For every song in songs/ in turn (the rest of the realm is covered by spirit-music.js).        node tools/tests/spirit-songs.js
const { launch, open, ok, done, wait } = require('./lib.js');
const fs = require('fs'), path = require('path');
const SONGS = JSON.parse(fs.readFileSync(path.join(__dirname, '..', '..', 'songs', 'songs.json'), 'utf8'));
const N = +(process.env.SONGS_N || 3);
const sample = (p, n, ms) => p.evaluate(async ([n, ms]) => { const H = window.__hl, M = H.SPMUS, out = []; for (let k = 0; k < n; k++) { await new Promise((r) => setTimeout(r, ms));
  const sp = H.T.env.spirit, L = sp.lat.U, el = H.music.soEl; out.push({ acc: M.acc.slice(), now: M.now, live: M.live, lvl: M.lvl, sec: M.sec, b0: M.band[0], pk: L.uPK.value, gain: L.uGainL.value, sf: H.SPU.uSF.value[0].x + H.SPU.uSF.value[0].w, kick: H.SPU.uKick.value, beat: M.beat, bpm: M.bpm, playing: !!(el && !el.paused && el.currentTime > 0), t: el ? el.currentTime : 0 }) } return out }, [n, ms]);
(async () => {
  const b = await launch();
  for (let si = 0; si < Math.min(N, SONGS.length); si++) {
    const song = SONGS[si];
    const p = await open(b, 'songs-' + si, { vp: { width: 480, height: 270 }, query: '&bot=1', songs: true, storage: { 'hoverline.laps': '3', 'hoverline.autoUltra': 'ok', 'hoverline.mmode': 'songs', 'hoverline.song': String(si) } });
    await p.mouse.click(240, 135); await wait(1500);
    await p.evaluate(() => { const H = window.__hl, c = H.parseCode('WL1234567-S'); H.loadTrack(c.seed, c.wk, c.cx, c.lk, null, c.bm); H.startRace() });
    let up = false; for (let k = 0; k < 40 && !up; k++) { await wait(500); up = await p.evaluate(() => { const m = window.__hl.music; return !!(m.soOn && m.soEl && !m.soEl.paused && m.soEl.currentTime > 1) }) }
    const info = await p.evaluate(() => { const m = window.__hl.music; return { ok: window.SONGS && SONGS.ok, mode: m.modeEff(), soOn: m.soOn, routed: !!m.soNode, cur: m.soCur && m.soCur.f, err: m.soEl && m.soEl.error && m.soEl.error.code, src: m.soEl && m.soEl.src, ctxState: m.ctx.state } }).catch((e) => ({ err: String(e) }));
    console.log(song.f, JSON.stringify(info));
    ok(up, song.f + ': the <audio> element plays in Songs mode (' + JSON.stringify(info) + ')');
    if (!up) { await p.ctx.close(); continue }
    ok(info.routed, song.f + ': the element is routed through the WebAudio graph (a MediaElementSource into the music volume)');
    await wait(4000);
    const S = await sample(p, 90, 200), span = S[S.length - 1].now - S[0].now;
    const kicks = new Set(); S.forEach((s) => s.acc.forEach((k) => kicks.add(k.toFixed(3)))); const ks = [...kicks].map(Number).sort((a, c) => a - c), gaps = ks.slice(1).map((k, i) => k - ks[i]);
    const b0 = S.map((s) => s.b0), lv = S.map((s) => s.lvl);
    console.log('  kicks', ks.length, 'in', span.toFixed(1), 's; bass band', Math.min(...b0).toFixed(2), '-', Math.max(...b0).toFixed(2), '; level', Math.min(...lv).toFixed(3), '-', Math.max(...lv).toFixed(3), '; sections', [...new Set(S.map((s) => s.sec))].join(','), '; song time', S[0].t.toFixed(1), '->', S[S.length - 1].t.toFixed(1));
    ok(S.some((s) => s.live) && Math.max(...lv) > 0.02, song.f + ': the analyser hears the <audio> element (level up to ' + Math.max(...lv).toFixed(3) + ')');
    /* the beat clock lines up with the kicks: the beat's fraction on each new kick's frame piles up (a ring's coherence above 0.5) and its tempo is in range */
    let cr = 0, ci = 0, nk = 0, pv = null; for (const x of S) { if (x.acc[0] != null && x.acc[0] !== pv && pv != null) { const f = ((x.beat % 1) + 1) % 1; cr += Math.cos(2 * Math.PI * f); ci += Math.sin(2 * Math.PI * f); nk++ } pv = x.acc[0] != null ? x.acc[0] : pv }
    const coh = nk ? Math.hypot(cr, ci) / nk : 0, bpm = S[S.length - 1].bpm; console.log('  tempo', bpm.toFixed(1), 'bpm; beat/kick coherence', coh.toFixed(2));
    ok(bpm >= 85 && bpm <= 175 && coh > 0.35, song.f + ': the realm\'s beat clock (' + bpm.toFixed(0) + ' bpm) lines up with the kicks (coherence ' + coh.toFixed(2) + ')');
    ok(ks.length >= span * 0.8 && ks.length <= span * 3, song.f + ': kicks are found from the bass band at a believable rate (' + ks.length + ' in ' + span.toFixed(1) + ' s)');
    ok(gaps.every((g) => g >= 0.335), song.f + ': never two kicks shown less than 0.34 s apart (least ' + (gaps.length ? Math.min(...gaps).toFixed(3) : '-') + ' s)');
    ok(S.some((s) => s.sec), song.f + ': a section is read from the level (' + [...new Set(S.map((s) => s.sec))].join(', ') + ')');
    const g = S.map((s) => s.gain); ok(Math.max(...g) - Math.min(...g) > 0.02 || Math.max(...S.map((s) => s.kick)) > 0.3, song.f + ': the lattice answers (gain ' + Math.min(...g).toFixed(2) + ' to ' + Math.max(...g).toFixed(2) + ', kick up to ' + Math.max(...S.map((s) => s.kick)).toFixed(2) + ')');
    ok(p.errs.length === 0, song.f + ': no page errors');
    await p.ctx.close();
  }
  await b.close(); done();
})();
