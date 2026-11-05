// Prototype 47 screenshots at phone portrait, phone landscape and desktop: Set orientation, the pairing steps (host and
// pilot, by sound and by code), the machine-priest mid-scream (and on a light panel), the class picks.
//   node shots47.js [OUT]     (default /home/claude/p47/shots)
const fs = require('fs');
const { wait, until, launch, open, toLan, makeAir, ok, done, ANDROID_UA, FS_MOCK } = require('./lib47.js');
const OUT = process.argv[2] || '/home/claude/p47/shots'; fs.mkdirSync(OUT, { recursive: true });
const VPS = [['phone-portrait', { width: 390, height: 844 }, 2, true], ['phone-landscape', { width: 844, height: 390 }, 2, true], ['desktop', { width: 1280, height: 800 }, 1, false]];
const shot = async (p, vp, name) => { const f = `${OUT}/${vp}_${name}.png`; await p.screenshot({ path: f }); console.log('   shot', f.split('/').pop()) };
(async () => {
  const b = await launch(['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream']);
  for (const [vn, vp, dpr, touch] of VPS) { console.log('--', vn);
    const base = { vp, dpr, touch, render: true, settle: 1500 };
    // Set orientation (on a desktop it never shows; drawn here only to see the layout)
    { const p = await open(b, 'or', { ...base, ua: touch ? ANDROID_UA : undefined, init: FS_MOCK, quick: true });
      if (!touch) await p.evaluate(() => window.__hl.orShow(null)); await wait(800); await shot(p, vn, 'orientation'); await p.ctx.close() }
    // by sound: the host calling (mid-scream) and with its code shown; a pilot whose answer the host doesn't hear
    { const air = makeAir({ block: (from, to) => from.label === 'Pilot' && to.label === 'Host' });
      const H = await open(b, 'Host', { ...base, query: '&nbtest=1', before: air.before }), G = await open(b, 'Pilot', { ...base, query: '&nbtest=1', before: air.before });
      air.pages.push(H, G); await toLan(H, 'Eric'); await toLan(G, 'Deck'); await H.evaluate(() => { window.__nbLevel = 0.35 }); await G.evaluate(() => { window.__nbLevel = 0.5 });
      await shot(G, vn, 'pair_choose');
      await H.click('#chirpHostBtn'); await until(H, () => window.__nb.chirp.mode === 'host', 15000, 'calling');
      await until(H, () => window.__nb.ChirpIO.sending() && window.__nb.ChirpIO.txLevel() > 0.75, 20000, 'mid-scream');
      await shot(H, vn, 'pair_host_sound_scream');
      if (vn === 'desktop') { const el = await H.$('#chirpWave'); await el.screenshot({ path: `${OUT}/priest_scream_dark.png` }); console.log('   shot priest_scream_dark.png') }
      await G.click('#chirpJoinBtn'); await until(G, () => window.__nb.chirp.mode === 'guest', 5000, 'listening'); await wait(400); await shot(G, vn, 'pair_pilot_listening');
      await until(G, () => { const g = window.__nb.chirp.g; return !!(g && g.sentAt) }, 30000, 'answered'); await wait(500); await shot(G, vn, 'pair_pilot_sound_reply');
      await until(H, () => !window.__nb.ChirpIO.sending(), 8000, 'between calls'); await H.click('#chirpQR'); await wait(300); await shot(H, vn, 'pair_host_sound_code');
      await H.ctx.close(); await G.ctx.close() }
    // by code: the host's invitation, the pilot's reply; then the lobby with the class pick
    { const H = await open(b, 'Host', { ...base, perms: ['microphone', 'camera'] }), G = await open(b, 'Pilot', { ...base, perms: ['microphone', 'camera'] });
      for (const [p, n] of [[H, 'Eric'], [G, 'Deck']]) { await toLan(p, n); await p.click('[data-pair="qr"]') }
      await H.click('#chirpHostBtn'); await until(H, () => !!window.__nb.lan.code, 15000, 'invitation'); await wait(300); await shot(H, vn, 'pair_host_code');
      await G.click('#chirpJoinBtn'); await wait(300); await shot(G, vn, 'pair_pilot_code_join');
      await G.fill('#lanIn', await H.evaluate(() => window.__nb.lan.code)); await G.click('#lanUse'); await until(G, () => !!window.__nb.lan.code, 10000, 'reply'); await wait(300); await shot(G, vn, 'pair_pilot_code_reply');
      await H.fill('#lanIn', await G.evaluate(() => window.__nb.lan.code)); await H.click('#lanUse');
      for (const p of [H, G]) await until(p, () => { const s = window.__hl.mp.sess; return !!s && s.state.phase === 'lobby' && s.state.roster.length === 2 }, 20000, 'lobby');
      await H.click('#lanCancel'); await H.selectOption('#mpCls', 'surge'); await until(G, () => /Surge/.test(document.getElementById('mpTrack').textContent), 8000, 'class');
      await H.evaluate(() => document.getElementById('mpCls').scrollIntoView({ block: 'center' })); await wait(300); await shot(H, vn, 'class_lobby_host'); await shot(G, vn, 'class_lobby_pilot');
      await H.ctx.close(); await G.ctx.close() }
    // the track page: Race and Time trial
    { const p = await open(b, 'solo', base); await p.click('#playBtn'); await p.click('#raceMode'); await p.selectOption('#clsSel', 'surge'); await wait(500); await shot(p, vn, 'class_race');
      await p.click('#setBack'); await p.click('#trialBtn'); await wait(500); await shot(p, vn, 'class_trial'); await p.ctx.close() }
  }
  // the machine-priest on a light panel and a dark one, mid-scream and listening
  { const p = await open(b, 'priest', { vp: { width: 700, height: 300 }, dpr: 2 });
    await p.evaluate(() => { const row = document.createElement('div'); row.style.cssText = 'position:fixed;inset:0;z-index:99;display:flex;gap:0'; document.body.appendChild(row);
      for (const [bg, ink, glow, jaw, eyes, tx] of [['#ffffff', '#1b1f27', '#0a8fa0', 0.95, 1, true], ['#ffffff', '#1b1f27', '#0a8fa0', 0, 0.6, false], ['#0a0c12', '#f2efe6', '#3ff0ff', 0.95, 1, true], ['#0a0c12', '#f2efe6', '#3ff0ff', 0, 0.6, false]]) {
        const d = document.createElement('div'); d.style.cssText = `flex:1;background:${bg};display:flex;align-items:center;justify-content:center`; const c = document.createElement('canvas'); c.className = 'priest'; c.style.cssText = `width:168px;height:144px;color:${ink};--glow:${glow}`; d.appendChild(c); row.appendChild(d);
        window.__nb.priestDraw(c, { t: 0.31, still: true, tx, jaw, eyes }) } });
    await wait(200); await p.screenshot({ path: `${OUT}/priest_light_and_dark.png` }); console.log('   shot priest_light_and_dark.png'); await p.ctx.close() }
  await b.close(); console.log('shots in', OUT); process.exit(0);
})().catch((e) => { console.error('FAIL', e); process.exit(1) });
