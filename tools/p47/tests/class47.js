// Prototype 47: speed classes. The pick on the Race track page and the Time trial page (one pick for both) and in the
// multiplayer lobby (the host's, shown to everyone); the class reaches S.cls, the logs, the best-lap and ghost keys, the
// online board (Redline only); the d-pad and arrow keys step it; career tiers show theirs; a room at Surge races at 0.8
// on every device.      node class47.js
const { wait, until, launch, open, toLan, ok, done } = require('./lib47.js');
const sel = (p, id) => p.evaluate((id) => { const s = document.getElementById(id); return s ? { shown: !!s.getClientRects().length && !s.closest('[hidden]'), value: s.value, n: s.options.length, text: s.options[s.selectedIndex] && s.options[s.selectedIndex].textContent, all: [...s.options].map((o) => o.textContent) } : null }, id);
(async () => {
  const b = await launch(['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream']);
  { const p = await open(b, 'Solo', { query: '&bot=1' });
    await p.click('#playBtn'); await p.click('#raceMode'); await wait(300);
    let s = await sel(p, 'clsSel'); ok(s && s.shown && s.n === 4 && s.value === 'redline', `Race page: one class pick, Redline by default (${s && s.all.join(', ')})`);
    const k0 = await p.evaluate(() => window.__hl.bestKey()); ok(!/\.(glide|surge|rush|redline)$/.test(k0), `  Redline best laps keep the old key (${k0})`);
    await p.selectOption('#clsSel', 'surge'); await wait(150);
    let v = await p.evaluate(() => ({ saved: window.__hl.store.get('hoverline.cls'), note: document.getElementById('clsNote').textContent, best: document.getElementById('menuBest').textContent, key: window.__hl.bestKey(), gt: window.__hl.ghostTag() }));
    ok(v.saved === 'surge' && /Redline only/.test(v.note) && /at Surge/.test(v.best) && v.key.endsWith('.surge') && v.gt.endsWith('.surge'), `  Surge: saved, "${v.note}", "${v.best}", its own best-lap and ghost keys`);
    // keys: arrow right steps the pick on
    await p.focus('#clsSel'); await p.keyboard.press('ArrowRight'); await wait(150); s = await sel(p, 'clsSel'); ok(s.value === 'rush', `  arrow right steps it on (Surge to ${s.text})`);
    await p.keyboard.press('ArrowLeft'); await wait(100); s = await sel(p, 'clsSel'); ok(s.value === 'surge', `  arrow left steps it back (${s.text})`);
    await p.click('#raceBtn'); await until(p, () => /countdown|race/.test(window.__hl.S.state), 60000, 'race'); await wait(1300);
    v = await p.evaluate(() => ({ cls: window.__hl.S.cls, log: window.__hl.LOG.cur && [window.__hl.LOG.cur.cls, window.__hl.LOG.cur.clsName, window.__hl.LOG.cur.mode], note: document.getElementById('note').textContent }));
    ok(v.cls === 0.8 && v.log && v.log[1] === 'Surge' && v.log[2] === 'race', `  a race at Surge: S.cls ${v.cls}, the log says ${JSON.stringify(v.log)}, "${v.note}"`);
    v = await p.evaluate(() => { const h = window.__hl; h.player.finishT = 75; h.lbSubmit(24); return document.getElementById('resBoard').textContent });
    ok(/Redline races only/.test(v), `  the online board takes Redline only: "${v}"`);
    await p.evaluate(() => { window.__hl.setHud(false); window.__hl.S.state = 'menu'; window.__hl.LOG.cur = null; window.__hl.showPage('play') }); await wait(200);
    await p.click('#trialBtn'); await wait(300); s = await sel(p, 'clsSel');
    const logo = await p.textContent('#setLogo'); ok(/TIME/i.test(logo) && s.shown && s.value === 'surge', `Time trial page: the same pick, still Surge ("${logo}")`);
    await p.selectOption('#clsSel', 'glide'); await p.click('#raceBtn'); await until(p, () => /countdown|race/.test(window.__hl.S.state), 60000, 'trial'); await wait(1300);
    v = await p.evaluate(() => ({ cls: window.__hl.S.cls, trial: window.__hl.S.trial, n: window.__hl.LOG.cur && window.__hl.LOG.cur.clsName, note: document.getElementById('note').textContent }));
    ok(v.cls === 0.7 && v.trial && v.n === 'Glide' && /^Glide · Time trial/.test(v.note), `  a time trial at Glide: S.cls ${v.cls}, "${v.note}"`);
    await p.evaluate(() => { window.__hl.setHud(false); window.__hl.S.state = 'menu'; window.__hl.LOG.cur = null });
    // career tiers show their class
    const car = await p.evaluate(() => { window.__hl.carSel(0); return [...document.querySelectorAll('#carList .tier .sub')].map((x) => x.textContent) });
    ok(car.length === 4 && /Rookie · Glide · 70% speed/.test(car[0]) && /Elite · Redline/.test(car[3]), `Career tiers: ${car.join(' | ')}`);
    ok(p.errs.length === 0, 'no page errors ' + JSON.stringify(p.errs)); await p.ctx.close() }
  // a room: the host picks Surge; the pilot sees it; both race at 0.8
  { const H = await open(b, 'Host', { perms: ['microphone', 'camera'], query: '&bot=1' }), G = await open(b, 'Pilot', { perms: ['microphone', 'camera'], query: '&bot=1' });
    for (const [p, n] of [[H, 'Host'], [G, 'Pilot']]) { await toLan(p, n); await p.click('[data-pair="qr"]') }
    await H.click('#chirpHostBtn'); await until(H, () => !!window.__nb.lan.code, 15000, 'invitation');
    await G.click('#chirpJoinBtn'); await G.fill('#lanIn', await H.evaluate(() => window.__nb.lan.code)); await G.click('#lanUse'); await until(G, () => !!window.__nb.lan.code, 10000, 'reply');
    await H.fill('#lanIn', await G.evaluate(() => window.__nb.lan.code)); await H.click('#lanUse');
    for (const p of [H, G]) await until(p, () => { const s = window.__hl.mp.sess; return !!s && s.state.phase === 'lobby' && s.state.roster.length === 2 }, 20000, 'lobby');
    await H.click('#lanCancel'); await wait(200);
    let s = await sel(H, 'mpCls'), g = await sel(G, 'mpCls'); ok(s.shown && s.value === 'redline' && !g.shown, `lobby: the host has the class pick (${s.text}); the pilot doesn't`);
    await H.selectOption('#mpCls', 'surge'); await until(G, () => /Surge/.test(document.getElementById('mpTrack').textContent), 8000, 'class reaches the pilot');
    const t = await G.textContent('#mpTrack'); ok(/· Surge$/.test(t), `  the host picks Surge; the pilot's lobby says "${t}"`);
    for (const p of [H, G]) await p.click('#mpReady');
    for (const p of [H, G]) await until(p, () => /mpwait|countdown|race/.test(window.__hl.S.state), 30000, 'room race');
    await wait(800);
    const r = await Promise.all([H, G].map((p) => p.evaluate(() => ({ cls: window.__hl.S.cls, log: window.__hl.LOG.cur && window.__hl.LOG.cur.clsName, mode: window.__hl.LOG.cur && window.__hl.LOG.cur.mode, key: window.__hl.bestKey() }))));
    ok(r.every((x) => x.cls === 0.8 && x.log === 'Surge' && x.mode === 'room' && x.key.endsWith('.surge')), `  both race at 0.8: ${JSON.stringify(r)}`);
    ok(await H.evaluate(() => window.__hl.store.get('hoverline.mpcls')) === 'surge', '  the host\'s pick is remembered for its next room');
    ok(H.errs.length + G.errs.length === 0, 'no page errors'); await H.ctx.close(); await G.ctx.close() }
  await b.close(); done();
})().catch((e) => { console.error('FAIL', e); process.exit(1) });
