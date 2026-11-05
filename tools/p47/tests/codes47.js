// Prototype 47: the text codes and the legs of pairing.      node codes47.js [A B C D E]
//   A  by code both ways, typed: the pilot types the host's invitation (small letters, spaces, O for 0, I for 1), the host
//      types the reply; the numbered steps light up as it goes
//   B  typing slips: one wrong, missing or extra letter is put right; two are refused with a line saying so; a short code
//      and the wrong kind of code are refused
//   C  codes from Prototype 46 still read
//   D  mixed: the host calls by sound but this pilot can't hear it: the pilot types the host's code, answers by sound,
//      and the host hears it
//   E  mixed: the pilot hears the call but the host can't hear the answer: the host types the reply shown on the pilot
const { wait, until, launch, open, toLan, makeAir, inLobby, ok, done, PAGE } = require('./lib47.js');
const steps = (p) => p.evaluate(() => { const box = document.getElementById('lanBox').hidden ? 'chirpSteps' : 'lanSteps'; const li = [...document.querySelectorAll('#' + box + ' li')]; return { n: li.length, cur: li.findIndex((x) => x.classList.contains('cur')), done: li.filter((x) => x.classList.contains('done')).length } });
const mangle = (c) => c.toLowerCase().replace(/(.{5})/g, '$1 ').replace(/0/g, 'O').replace(/1/g, 'I');
async function codeRoom(b, names, o = {}) { const ps = [];
  for (const n of names) { const p = await open(b, n, { perms: ['microphone', 'camera'], ...o }); await toLan(p, n); await p.click('[data-pair="qr"]'); ps.push(p) }
  await ps[0].click('#chirpHostBtn'); await until(ps[0], () => !!window.__nb.lan.code, 15000, 'invitation'); return ps }
const S = {
  async A(b) { const [H, G] = await codeRoom(b, ['Host', 'Pilot']);
    const inv = await H.evaluate(() => window.__nb.lan.code); let st = await steps(H);
    ok(/^HL[0-9A-Z]+$/.test(inv) && inv.length <= 125 && st.n === 3 && st.cur === 0, `host: invitation ${inv.length} letters, three steps, step 1 lit (${JSON.stringify(st)})`);
    await G.click('#chirpJoinBtn'); st = await steps(G); ok(st.n === 3 && st.cur === 0, `pilot: three steps, step 1 lit (${JSON.stringify(st)})`);
    await G.fill('#lanIn', mangle(inv)); await G.click('#lanUse'); await until(G, () => !!window.__nb.lan.code, 10000, 'reply');
    const rep = await G.evaluate(() => window.__nb.lan.code); st = await steps(G);
    ok(rep.length <= 116 && st.cur === 1 && st.done === 1, `pilot: typed the host's code in small letters with spaces, O and I; reply ${rep.length} letters, step 2 lit (${JSON.stringify(st)})`);
    await H.fill('#lanIn', mangle(rep)); await H.evaluate(() => { window.__st3 = null; new MutationObserver(() => { const li = [...document.querySelectorAll('#lanSteps li')]; if (li[2] && li[2].classList.contains('cur')) window.__st3 = true }).observe(document.getElementById('lanSteps'), { childList: true, subtree: true }) });
    await H.click('#lanUse'); await wait(400);
    ok(await H.evaluate(() => window.__st3 === true), 'host: typed the reply, step 3 lit while it connects (then the next invitation)');
    for (const p of [H, G]) await until(p, () => { const s = window.__hl.mp.sess; return !!s && s.state.phase === 'lobby' && s.state.roster.length === 2 }, 20000, 'lobby');
    const d = await H.evaluate(() => window.__nb.PDG.cur), dg = await G.evaluate(() => window.__nb.PDG.all().slice(-1)[0]);
    ok(d && d.codes.typed === 1 && d.rtc.length === 1, `host's pairing record: ${d && d.codes.typed} code typed, ${d && d.rtc.length} connection (${d && d.rtc[0] && d.rtc[0].states.slice(-1)[0]})`);
    ok(dg && dg.outcome === 'joined' && dg.how === 'code' && dg.codes.typed === 1, `pilot's record: how ${dg && dg.how}, outcome ${dg && dg.outcome}`);
    for (const p of [H, G]) await p.ctx.close() },
  async B(b) { const [H, G1, G2, G3] = await codeRoom(b, ['Host', 'One', 'Two', 'Three']);
    const flip = (c, i) => c.slice(0, i) + (c[i] === 'A' ? 'B' : 'A') + c.slice(i + 1);
    const take = async (G) => { const inv = await H.evaluate(() => window.__nb.lan.code); await G.click('#chirpJoinBtn'); await G.fill('#lanIn', inv); await G.click('#lanUse');
      await until(G, () => !!window.__nb.lan.code, 10000, 'reply'); return G.evaluate(() => window.__nb.lan.code) };
    const kinds = [(c) => flip(c, 40), (c) => c.slice(0, 61) + c.slice(62), (c) => c.slice(0, 30) + 'Q' + c.slice(30)], names = ['a wrong', 'a missing', 'an extra'];
    let m;
    for (let i = 0; i < 3; i++) { const G = [G1, G2, G3][i], rep = await take(G);
      if (i === 0) { // first the refusals, on this reply
        await H.fill('#lanIn', flip(flip(rep, 20), 70)); await H.click('#lanUse'); await wait(300); m = await H.textContent('#lanMsg'); ok(/slip/.test(m), `two letters off: refused ("${m}")`);
        await H.fill('#lanIn', rep.slice(0, 50)); await H.click('#lanUse'); await wait(200); m = await H.textContent('#lanMsg'); ok(/too short/.test(m), `half a code: "${m}"`);
        await H.fill('#lanIn', await H.evaluate(() => window.__nb.lan.code)); await H.click('#lanUse'); await wait(200); m = await H.textContent('#lanMsg'); ok(/invitation/.test(m), `the host's own code typed into the host: "${m}"`) }
      await H.evaluate(() => { window.__said = []; new MutationObserver(() => window.__said.push(document.getElementById('lanMsg').textContent)).observe(document.getElementById('lanMsg'), { childList: true, characterData: true, subtree: true }) });
      const t0 = Date.now(); await H.fill('#lanIn', kinds[i](rep)); await H.click('#lanUse'); await until(H, (n) => window.__hl.mp.sess.state.roster.length === n, 20000, 'joined', i + 2);
      m = (await H.evaluate(() => window.__said)).find((x) => /put right/.test(x)) || '';
      ok(/group \d+ was off/.test(m), `${names[i]} letter: "${m}", and the pilot joined (${Date.now() - t0} ms)`);
      await until(H, () => !!window.__nb.lan.code, 10000, 'next invitation'); await wait(200) }
    ok(await inLobby(G3, 4), 'all three pilots in the lobby');
    const d = await H.evaluate(() => window.__nb.PDG.cur); ok(d.codes.bad === 2 && d.events.filter((e) => e.e === 'code put right').length === 3, `host's record: ${d.codes.bad} refused, ${d.events.filter((e) => e.e === 'code put right').length} put right`);
    for (const p of [H, G1, G2, G3]) await p.ctx.close() },
  async C(b) { const O = await open(b, 'P46', { file: '/home/claude/p47/pages/p46.html' }); await toLan(O, 'Old'); await O.click('[data-pair="qr"]'); await O.click('#chirpHostBtn');
    await until(O, () => !!window.__nb.lan.code, 15000, 'P46 code'); const old = await O.evaluate(() => window.__nb.lan.code); const want = await O.evaluate((c) => window.__nb.LAN.unpack(c), old);
    const N = await open(b, 'P47'); const got = await N.evaluate((c) => window.__nb.LAN.unpack(c), old);
    ok(got && got.kind === 0 && got.code === want.code && got.uf === want.uf && got.pw === want.pw && got.fp === want.fp && JSON.stringify(got.cands) === JSON.stringify(want.cands), `a Prototype 46 code (${old.length} letters) reads the same in Prototype 47`);
    await O.ctx.close(); await N.ctx.close() },
  async D(b) { const air = makeAir({ block: (from, to) => from.label === 'Host' && to.label === 'Deaf' });
    const H = await open(b, 'Host', { query: '&nbtest=1', before: air.before, perms: ['microphone', 'camera'] }), G = await open(b, 'Deaf', { query: '&nbtest=1', before: air.before, perms: ['microphone', 'camera'] });
    air.pages.push(H, G); await toLan(H, 'Host'); await toLan(G, 'Deaf');
    await H.click('#chirpHostBtn'); await until(H, () => window.__nb.chirp.mode === 'host' && !!window.__nb.chirp.offer, 15000, 'calling');
    let v = await H.evaluate(() => ({ box: !document.getElementById('lanBox').hidden, btn: document.getElementById('chirpQR').textContent }));
    ok(!v.box && v.btn === 'Use a code', `host calling: the code box is closed, one button for it ("${v.btn}")`);
    await H.click('#chirpQR'); const inv = await H.evaluate(() => window.__nb.lan.code);
    v = await H.evaluate(() => ({ helper: !document.getElementById('lanBox').hidden && document.getElementById('lanBox').classList.contains('helper'), qr: !document.getElementById('lanQR').hidden, btn: document.getElementById('chirpQR').textContent, calling: window.__nb.chirp.mode }));
    ok(v.helper && v.qr && v.btn === 'Hide the code' && v.calling === 'host', `  "Use a code" opens it under the sound box with the invitation (${inv.length} letters) while it keeps calling`);
    await G.click('#chirpJoinBtn'); await until(G, () => window.__nb.chirp.mode === 'guest', 5000, 'listening'); await wait(4000);
    ok(await G.evaluate(() => !window.__nb.chirp.heardAt), 'the pilot hears nothing (this room never carries the host to it)');
    await G.click('#chirpQR'); await G.fill('#lanIn', inv, { timeout: 3000 }); await G.click('#lanUse');
    for (const p of [H, G]) await until(p, () => { const s = window.__hl.mp.sess; return !!s && s.state.phase === 'lobby' && s.state.roster.length === 2 }, 40000, 'lobby');
    const e = await G.evaluate(() => window.__nb.PDG.all().slice(-1)[0]);
    ok(e.outcome === 'joined' && e.events.some((x) => x.e === 'invitation by code') && e.sound.sent >= 1, `the invitation typed, the reply by sound: in the lobby (${e.sound.sent} chirp sent) · ${JSON.stringify(air.st)}`);
    await H.ctx.close(); await G.ctx.close() },
  async E(b) { const air = makeAir({ block: (from, to) => from.label === 'Pilot' && to.label === 'Host' });
    const H = await open(b, 'Host', { query: '&nbtest=1', before: air.before }), G = await open(b, 'Pilot', { query: '&nbtest=1', before: air.before });
    air.pages.push(H, G); await toLan(H, 'Host'); await toLan(G, 'Pilot');
    await H.click('#chirpHostBtn'); await until(H, () => window.__nb.chirp.mode === 'host', 15000, 'calling'); await G.click('#chirpJoinBtn');
    await until(G, () => { const g = window.__nb.chirp.g; return !!(g && g.sentAt) }, 30000, 'pilot answered');
    ok(await G.evaluate(() => document.getElementById('lanBox').hidden), 'the pilot answered by sound; its code box stays closed for now');
    await until(G, () => !document.getElementById('lanBox').hidden, 8000, 'reply box opens by itself');
    const v = await G.evaluate(() => ({ code: window.__nb.lan.code, title: document.getElementById('lanTitle').textContent, qr: !document.getElementById('lanQR').hidden }));
    ok(!!v.code && v.qr && /reply/i.test(v.title), `the pilot heard the call and answered; 3 s on, unheard, its reply shows as a code too ("${v.title}", ${v.code.length} letters)`);
    await wait(3000); ok(await H.evaluate(() => window.__hl.mp.sess.state.roster.length === 1), 'the host never heard the answer');
    await H.click('#chirpQR'); await H.fill('#lanIn', v.code); await H.click('#lanUse');
    for (const p of [H, G]) await until(p, () => { const s = window.__hl.mp.sess; return !!s && s.state.phase === 'lobby' && s.state.roster.length === 2 }, 30000, 'lobby');
    const e = await H.evaluate(() => window.__nb.PDG.cur);
    ok(e.events.some((x) => x.e === 'reply by code') && e.codes.typed === 1, `the host typed the reply into the box under the sound: in the lobby · ${JSON.stringify(air.st)}`);
    await H.ctx.close(); await G.ctx.close() } };
(async () => {
  const which = process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(S);
  const b = await launch(['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream']);
  for (const k of which) { try { console.log('--', k); await S[k](b) } catch (e) { ok(false, k + ' ' + e.message) } }
  await b.close(); done();
})();
