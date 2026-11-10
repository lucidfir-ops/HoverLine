// Prototype 50: the thumbs down is soft (toggles, clears a Like, weighs -2.5) and chords are voiced in the tune's key.
const { launch, open, wait, ok, done } = require('./lib.js');
(async () => { const b = await launch(); const p = await open(b, 'm', { vp: { width: 1280, height: 720 } });
  await p.evaluate(async () => { const M = window.__hl.music; document.querySelector('.listen') && document.querySelector('.listen').click() }); await wait(4000);
  const r = await p.evaluate(() => { const M = window.__hl.music; if (!M.T) return { skip: true }; const tp = M.T.id;
    document.getElementById('likeTune').click(); const liked = M.liked(); M.pinned = true;
    document.getElementById('dislikeTune').click(); const after = { dis: M.disliked(), liked: M.liked(), pr: document.getElementById('dislikeTune').getAttribute('aria-pressed') };
    const w = JSON.parse(window.__hl.store.get('hoverline.mlike')).filter(x => x[0] === tp).map(x => x[1]);
    document.getElementById('dislikeTune').click(); return { liked, after, w, again: M.disliked() } });
  ok(!r.skip && r.liked && r.after.dis && !r.after.liked && r.after.pr === 'true' && r.w.join() === '-2.5' && !r.again, 'thumbs down: toggles, clears the Like, weighs -2.5 ' + JSON.stringify(r));
  ok(p.errs.length === 0, 'no page errors ' + JSON.stringify(p.errs.slice(0, 2))); await b.close(); done() })().catch(e => { console.log('FAIL', e.message); process.exit(1) });
