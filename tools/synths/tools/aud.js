// Offline phrase renders: node aud.js <html> <outdir> <jobs.json>
// job: {name, secs, sr, bpm, key, master:false (true = through the game's master chain), wet:false (reverb/echo on),
//       prep:[names], notes:[{i, t, m, d, v, o, bass}]}  i = a SYN name, an existing tSyn lead patch, or with bass:1 a TBP patch
const H = require('./h.js'); const fs = require('fs'); const path = require('path');
const [, , HTML, OUT, JF] = process.argv; fs.mkdirSync(OUT, { recursive: true }); const jobs = JSON.parse(fs.readFileSync(JF, 'utf8'));
(async () => {
  let { browser, page } = await H.open(HTML); let used = 0;
  for (const job of jobs) {
    if (used++ >= 8) { await browser.close(); ({ browser, page } = await H.open(HTML)); used = 1 }
    const t0 = Date.now();
    const res = await page.evaluate(async (job) => {
      const S = window.__s, M = S.music, sr = job.sr || 48000, secs = job.secs || 6, off = new OfflineAudioContext(2, Math.round(sr * secs), sr);
      M.timer && clearInterval(M.timer); M.timer = null; M.ctx = null; M.lite = !!job.lite; M.init(off); await M.readyP;
      M.T = { b: job.bpm || 140, fx: [] }; M.tO = 0; M.st = M.st || { key: job.key || 0 }; M.st.key = job.key || 0;
      if (job.kit) { try { await M.renderKit() } catch (e) { } }
      if (job.vox) { M.vbuf = M.vbuf || {}; for (const [src, pre] of job.vox) { const v = await M.decodeVox(off, k => k.startsWith(pre), S.SL[src]); Object.assign(M.vbuf, v) } }
      for (const k in M.bus) M.bus[k].gain.value = 1;
      if (!job.wet) { try { M.rev.disconnect() } catch (e) { } try { M.dly.disconnect() } catch (e) { } }
      if (!job.master) { try { M.out.disconnect() } catch (e) { } M.out.connect(off.destination) }
      const SY = S.SYN; let errs = 0, last = '';
      if (SY && job.prep) await SY.prep(job.prep, job.key || 0);
      const bpm = job.bpm || 140;
      const W = 0.25, post = (a, b) => { for (const n of job.notes) { if (!(n.t >= a && n.t < b)) continue;
        try {
          if (n.drum) { if (n.drum === 'k') M.kick(n.t, n.v || 0.9); else if (n.drum === 's') M.snare(n.t, n.v || 0.8); else if (n.drum === 'h') M.hat(n.t, n.v || 0.15, !!n.open); else if (n.drum === 'c') M.clap(n.t, n.v || 0.6); continue }
          if (SY && SY.P[n.i]) { const o = Object.assign({}, n.o || {}); if (o.dest === 'bass') o.dest = M.bus.bass; if (o.dest === 'pad') o.dest = M.bus.pad; if (o.dest === 'lead') o.dest = M.bus.lead; if (o.dest === 'keys') o.dest = M.bus.keys; if (n.chord) SY.chord(n.i, n.t, n.m, n.d, n.v || 0.9, o); else SY.play(n.i, n.t, n.m, n.d, n.v == null ? 0.9 : n.v, o) }
          else if (n.bass) { const o = { ...S.TBP[n.i](bpm), tag: 'bass', a: 0.003, rel: 0.03 }; if (n.acc) { o.env = (o.env || 0) * 1.6; o.vol *= 1.25 } if (n.sl || o.glide) { o.from = M.lastBass; o.glide = o.glide || 0.05 } o.dest = o.d === 'dN' ? M.dN : o.d === 'dB' ? M.dB : M.bus.bass; M.bassNote(n.m + (o.o || 0), n.t, n.d * (o.len || 0.9), o); M.lastBass = n.m + (o.o || 0) }
          else if (n.pad) { M.saw(n.m, n.t, n.d, { tag: 'pad', vol: (S.TPD[n.i] || S.TPD.saw).vol, voices: (S.TPD[n.i] || S.TPD.saw).voices, spread: (S.TPD[n.i] || S.TPD.saw).spread, cut: (S.TPD[n.i] || S.TPD.saw).cut, a: (S.TPD[n.i] || S.TPD.saw).a, rel: (S.TPD[n.i] || S.TPD.saw).rel, dest: M.bus.pad }) }
          else if (n.sitar) { M.tV('sitar', n.m, n.t, n.d, n.v || 0.9, M.bus.lead, n.sl || 0) }
          else if (n.tv) { M.tV(n.i, n.m, n.t, n.d, n.v == null ? 0.9 : n.v, n.keys ? M.xKeys() : M.bus.lead, 0) }
          else M.tSyn(n.i, n.m, n.t, n.d, n.v == null ? 0.9 : n.v, M.bus.lead)
        } catch (e) { errs++; last = String(e.stack || e) } } };
      const sync = () => SY && SY.sync ? SY.sync() : Promise.resolve();
      post(-1, 2 * W); await sync();
      for (let k = 1; k * W < secs; k++) off.suspend(Math.round(k * W * sr / 128) * 128 / sr).then(async () => { post((k + 1) * W, (k + 2) * W); await sync(); off.resume() });
      const b = await off.startRendering(), L = b.getChannelData(0), R = b.getChannelData(1);
      const enc = a => { const u = new Uint8Array(a.buffer.slice(0)); let s = ''; for (let i = 0; i < u.length; i += 0x8000) s += String.fromCharCode.apply(null, u.subarray(i, i + 0x8000)); return btoa(s) };
      return { L: enc(L), R: enc(R), sr, errs, last }
    }, job);
    const dec = s => { const b = Buffer.from(s, 'base64'); return new Float32Array(b.buffer, b.byteOffset, b.length / 4) };
    const L = dec(res.L), R = dec(res.R);
    fs.writeFileSync(path.join(OUT, job.name + '.f32'), Buffer.concat([Buffer.from(L.buffer, L.byteOffset, L.byteLength), Buffer.from(R.buffer, R.byteOffset, R.byteLength)]));
    H.wav(path.join(OUT, job.name + '.wav'), L, R, res.sr);
    let pk = 0, e = 0, nan = 0; for (let i = 0; i < L.length; i++) { const a = Math.max(Math.abs(L[i]), Math.abs(R[i])); if (!(a === a)) nan++; else { if (a > pk) pk = a; e += (L[i] * L[i] + R[i] * R[i]) / 2 } }
    const info = { name: job.name, sr: res.sr, n: L.length, peak: pk, rms: 10 * Math.log10(e / L.length + 1e-12), nan, errs: res.errs, last: res.last.slice(0, 300) };
    fs.writeFileSync(path.join(OUT, job.name + '.json'), JSON.stringify({ job, info }));
    console.log(job.name.padEnd(26), 'peak', pk.toFixed(3), 'rms', info.rms.toFixed(1), 'nan', nan, 'err', res.errs, res.last.slice(0, 160), ((Date.now() - t0) / 1000).toFixed(1) + 's')
  }
  await browser.close(); process.exit(0)
})().catch(e => { console.error('FAIL', e); process.exit(1) });
