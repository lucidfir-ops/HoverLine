// Prototype 60: one online board per rivals' level. node tools/tests/board-lvl.js
// Part 1 runs leaderboard/worker.js's fetch handler against a real SQLite database (node:sqlite behind a small D1-shaped
// adapter): a database from before levels, migrate-lvl.sql on it, then old-style requests (no lvl: Default) and new ones.
// Part 2 serves the game's board requests from that same worker: the results card asks for the level you raced, and the
// Leaderboard screen opens on Default and switches level with its chips (and a pad).
process.removeAllListeners('warning'); // node:sqlite is "experimental" and says so on every run
const fs = require('fs'), path = require('path');
const { DatabaseSync } = require('node:sqlite');
const { launch, open, ok, done, wait, until } = require('./lib.js');
const KIT = path.join(__dirname, '..', '..', 'leaderboard');

// D1's prepare(sql).bind(...).all()/first()/run(), over node:sqlite (both are SQLite, so ?1-style numbered params just work)
function d1(db) {
  return { prepare(sql) { const st = db.prepare(sql); let a = []; const o = {
    bind(...x) { a = x; return o },
    async all() { return { results: st.all(...a) } },
    async first() { return st.get(...a) ?? null },
    async run() { const r = st.run(...a); return { meta: { last_row_id: Number(r.lastInsertRowid), changes: r.changes } } } }; return o } };
}
// the runs table as it was before levels (Prototype 29-59)
const OLD = `CREATE TABLE runs (id INTEGER PRIMARY KEY AUTOINCREMENT, track TEXT NOT NULL, laps INTEGER NOT NULL, name TEXT NOT NULL,
  ship TEXT NOT NULL, time_ms INTEGER NOT NULL, lap_ms INTEGER NOT NULL, created INTEGER NOT NULL, who TEXT NOT NULL, era INTEGER NOT NULL DEFAULT 0);
  CREATE INDEX runs_board ON runs (track, laps, time_ms); CREATE INDEX runs_era ON runs (era, track, laps, time_ms); CREATE INDEX runs_who ON runs (who, created);
  CREATE TABLE logs (id INTEGER PRIMARY KEY AUTOINCREMENT, created INTEGER NOT NULL, who TEXT NOT NULL, ver INTEGER NOT NULL, track TEXT NOT NULL, data TEXT NOT NULL);`;
const TR = 'W5F0917-U', ERA = +fs.readFileSync(path.join(__dirname, '..', '..', 'src', 'js', 'core', '001-start.js'), 'utf8').match(/BOARD_ERA=(\d+)/)[1]; // the game's era, so its screens see these
let ip = 0;
async function call(W, env, method, url, body) {
  const req = new Request('http://board' + url, { method, headers: { 'Content-Type': 'application/json', 'CF-Connecting-IP': '10.0.0.' + (++ip) }, body: body ? JSON.stringify(body) : undefined });
  const r = await W.fetch(req, env); return { status: r.status, o: await r.json() };
}
const run = (name, time, x = {}) => ({ track: TR, laps: 3, name, ship: 'blade', time, lap: time / 3 - 1, len: 3000, era: ERA, ...x });

(async () => {
  const W = (await import('data:text/javascript,' + encodeURIComponent(fs.readFileSync(path.join(KIT, 'worker.js'), 'utf8')))).default;

  // ---- a live database from before levels, then the migration ----
  const db = new DatabaseSync(':memory:'); db.exec(OLD);
  const ins = db.prepare('INSERT INTO runs (track,laps,name,ship,time_ms,lap_ms,created,who,era) VALUES (?,?,?,?,?,?,?,?,?)');
  ins.run(TR, 3, 'Eric', 'blade', 70000, 23000, 1, 'a', ERA); ins.run(TR, 3, 'Old', 'orb', 80000, 26000, 2, 'b', ERA); ins.run(TR, 3, 'Ancient', 'orb', 60000, 19000, 3, 'c', 0);
  db.exec(fs.readFileSync(path.join(KIT, 'migrate-lvl.sql'), 'utf8'));
  ok(db.prepare('SELECT COUNT(*) AS n FROM runs WHERE lvl=?').get('normal').n === 3, 'migrate-lvl.sql: every old time is Default (lvl normal)');
  ok(!!db.prepare("SELECT name FROM sqlite_master WHERE type='index' AND name='runs_lvl'").get(), 'migrate-lvl.sql adds the runs_lvl index');
  let twice = ''; try { db.exec(fs.readFileSync(path.join(KIT, 'migrate-lvl.sql'), 'utf8')) } catch (e) { twice = e.message }
  ok(/duplicate column/i.test(twice), 'running it again only says the column is there (' + twice + ')');
  const env = { DB: d1(db), SALT: 'test' };

  // ---- an old game (no lvl) reads and writes Default ----
  let r = await call(W, env, 'GET', `/top?track=${TR}&laps=3&era=${ERA}`);
  ok(r.status === 200 && r.o.lvl === 'normal' && r.o.rows.map((x) => x.name).join() === 'Eric,Old', 'old-style /top gets the Default board ' + JSON.stringify(r.o.rows.map((x) => x.name)));
  r = await call(W, env, 'POST', '/run', run('Pell', 75));
  ok(r.status === 200 && r.o.lvl === 'normal' && r.o.rank === 2 && r.o.total === 3, 'old-style /run lands on Default, ranked among Default times (#' + r.o.rank + ' of ' + r.o.total + ')');
  ok(db.prepare("SELECT lvl FROM runs WHERE name='Pell'").get().lvl === 'normal', '... and is stored as normal');

  // ---- new game: each level its own board ----
  r = await call(W, env, 'POST', '/run', run('Vanta', 90, { lvl: 'hard' }));
  ok(r.status === 200 && r.o.lvl === 'hard' && r.o.rank === 1 && r.o.total === 1 && r.o.rows.length === 1, 'an Expert time is #1 of 1 on the Expert board (slower than every Default time)');
  r = await call(W, env, 'POST', '/run', run('Eric', 95, { lvl: 'hard' }));
  ok(r.o.rank === 2 && r.o.total === 2 && r.o.best === 95, 'Eric on Expert: #2 of 2, his best there is his Expert time, not his Default one');
  r = await call(W, env, 'POST', '/run', run('Tom', 99, { lvl: 'tilt' }));
  ok(r.o.lvl === 'tilt' && r.o.total === 1, 'Tilt has its own board');
  r = await call(W, env, 'POST', '/run', run('Ann', 85, { lvl: 'easy' }));
  ok(r.o.lvl === 'easy' && r.o.total === 1, 'Beginner has its own board');
  r = await call(W, env, 'POST', '/run', run('X', 85, { lvl: 'insane' }));
  ok(r.status === 400 && r.o.error === 'bad level', 'an unknown level is refused (' + r.status + ')');
  r = await call(W, env, 'POST', '/run', run('Y', 85, { lvl: 'normal' }));
  ok(r.o.lvl === 'normal' && r.o.total === 4, 'lvl normal is the same board as no lvl');
  r = await call(W, env, 'POST', '/run', run('Z', 2, { lvl: 'hard' }));
  ok(r.status === 422, 'the plausibility checks still hold (' + r.status + ')');

  r = await call(W, env, 'GET', `/top?track=${TR}&laps=3&era=${ERA}&lvl=hard`);
  ok(r.o.lvl === 'hard' && r.o.rows.map((x) => x.name).join() === 'Vanta,Eric' && r.o.total === 2, '/top?lvl=hard: Expert times only ' + JSON.stringify(r.o.rows.map((x) => x.name)));
  r = await call(W, env, 'GET', `/top?track=${TR}&laps=3&era=${ERA}&lvl=normal`);
  ok(r.o.rows.map((x) => x.name).join() === 'Eric,Pell,Old,Y', '/top?lvl=normal: Default times only, era 0 still hidden');
  r = await call(W, env, 'GET', `/top?track=${TR}&laps=3&era=${ERA}&lvl=nope`);
  ok(r.status === 400, '/top with an unknown level is refused');
  r = await call(W, env, 'GET', `/recent?n=30&era=${ERA}`);
  ok(r.o.lvl === 'normal' && r.o.runs.every((x) => x.lvl === 'normal') && r.o.runs.length === 4, 'old-style /recent: Default finishes only (' + r.o.runs.length + ')');
  r = await call(W, env, 'GET', `/recent?n=30&era=${ERA}&lvl=hard`);
  ok(r.o.runs.map((x) => x.name).join() === 'Eric,Vanta', '/recent?lvl=hard: the newest Expert finishes first');
  r = await call(W, env, 'GET', `/boards?sort=popular&era=${ERA}`);
  ok(r.o.lvl === 'normal' && r.o.boards.length === 1 && r.o.boards[0].runs === 4 && r.o.boards[0].holder === 'Eric', 'old-style /boards counts Default races only ' + JSON.stringify(r.o.boards[0]));
  r = await call(W, env, 'GET', `/boards?sort=recent&era=${ERA}&lvl=hard`);
  ok(r.o.boards.length === 1 && r.o.boards[0].runs === 2 && r.o.boards[0].holder === 'Vanta' && r.o.boards[0].best === 90, '/boards?lvl=hard: Expert races and holder');

  // ---- a fresh database from schema.sql; and schema.sql run again on a database from before levels ----
  const f = new DatabaseSync(':memory:'); f.exec(fs.readFileSync(path.join(KIT, 'schema.sql'), 'utf8')); f.exec(fs.readFileSync(path.join(KIT, 'schema.sql'), 'utf8'));
  r = await call(W, { DB: d1(f) }, 'POST', '/run', run('New', 80, { lvl: 'easy' }));
  ok(r.status === 200 && r.o.lvl === 'easy' && f.prepare('SELECT lvl FROM runs').get().lvl === 'easy', 'schema.sql makes a database the new worker can use (and can run twice)');
  const g = new DatabaseSync(':memory:'); g.exec(OLD.replace('CREATE TABLE logs', 'CREATE TABLE IF NOT EXISTS logs'));
  let gerr = ''; try { g.exec(fs.readFileSync(path.join(KIT, 'schema.sql'), 'utf8')) } catch (e) { gerr = e.message }
  ok(/lvl/.test(gerr) && !!g.prepare("SELECT name FROM sqlite_master WHERE name='logs_time'").get(), 'schema.sql on a pre-level database stops only at the last line, the level index (' + gerr + ')');

  // ---- Part 2: the game against this worker ----
  const seen = [];
  const serve = async (p) => p.route('http://127.0.0.1:9/**', async (rt) => {
    const q = rt.request(), u = new URL(q.url()); seen.push({ m: q.method(), path: u.pathname, lvl: u.searchParams.get('lvl'), body: q.postData() ? JSON.parse(q.postData()) : null });
    const req = new Request('http://board' + u.pathname + u.search, { method: q.method(), headers: { 'Content-Type': 'application/json', 'CF-Connecting-IP': '10.1.0.' + (++ip) }, body: q.method() === 'POST' ? q.postData() : undefined });
    const res = await W.fetch(req, { DB: d1(db) });
    return rt.fulfill({ status: res.status, contentType: 'application/json', headers: { 'Access-Control-Allow-Origin': '*' }, body: await res.text() });
  });
  const b = await launch();
  const p = await open(b, 'board-lvl', { vp: { width: 1280, height: 800 }, storage: { 'hoverline.ail': 'hard', 'hoverline.name': 'Tester' }, before: serve });
  await p.evaluate(() => window.__hl.startRace());
  await until(p, () => window.__hl.S.state === 'race', 15000, 'race');
  await p.evaluate(() => { const h = window.__hl; h.player.utot = h.T.L * 3 + 5 });
  await until(p, () => window.__hl.S.state === 'done', 8000, 'finish');
  await until(p, () => !document.getElementById('results').hidden, 5000, 'results');
  await wait(800);
  let post = seen.find((x) => x.m === 'POST' && x.path === '/run');
  ok(!!post && post.body.lvl === 'hard', 'a race with Expert rivals is sent with lvl hard (' + (post && post.body.lvl) + ')');
  // that real race was a few seconds long, so the server turned it down as implausible; send a plausible one the same way
  seen.length = 0;
  await p.evaluate(() => { const h = window.__hl; h.player.finishT = h.T.L * 3 / 90; h.lbSubmit(h.T.L / 90 - 1) });
  await until(p, () => /Expert rivals/.test(document.getElementById('resBoard').textContent), 5000, 'card');
  const card = await p.evaluate(() => document.getElementById('resBoard').textContent);
  const shot = async (n) => { if (process.env.SHOTS) await p.screenshot({ path: path.join(process.env.SHOTS, n + '.png') }) }; // SHOTS=dir: pictures to look at
  await shot('results-expert');
  post = seen.find((x) => x.m === 'POST' && x.path === '/run');
  ok(post && post.body.lvl === 'hard' && /Expert rivals/.test(card) && /Tester/.test(card) && !/one board/.test(card), 'the results card shows the Expert board: ' + card.slice(0, 120));
  const code = await p.evaluate(() => document.getElementById('resBoard').querySelector('b').textContent.match(/track (\S+)/)[1]);
  ok(db.prepare('SELECT lvl FROM runs WHERE track=? AND name=?').get(code, 'Tester').lvl === 'hard', 'the time is stored on the Expert board');
  // a time trial has no rivals: it goes on Default's board, as trials always did
  seen.length = 0;
  await p.evaluate(() => { const h = window.__hl; h.S.trial = true; h.lbSubmit(h.T.L / 90 - 1); });
  await until(p, () => /Default rivals/.test(document.getElementById('resBoard').textContent), 5000, 'trial card');
  ok(seen.find((x) => x.path === '/run').body.lvl === 'normal', 'a time trial is sent as Default');
  await p.evaluate(() => { window.__hl.S.trial = false });

  // ---- the Leaderboard screen ----
  await p.evaluate(() => window.__hl.toMenu()); await wait(300);
  await p.evaluate(() => { window.__hl.showPage('title'); document.getElementById('lbBtn').click() });
  await until(p, () => !/Loading/.test(document.getElementById('lbHead').textContent), 5000, 'board');
  const s1 = await p.evaluate(() => ({ chips: [...document.querySelectorAll('[data-lbl]')].map((b) => b.textContent + (b.getAttribute('aria-pressed') === 'true' ? '*' : '')).join(), head: document.getElementById('lbHead').textContent }));
  ok(s1.chips === 'Tilt,Beginner,Default*,Expert', 'the board screen has the level chips and starts on Default (' + s1.chips + ')');
  ok(seen.filter((x) => x.m === 'GET').every((x) => x.lvl === 'normal') && seen.some((x) => x.m === 'GET'), 'and asks for Default (' + seen.map((x) => x.path + ':' + x.lvl).join(' ') + ')');
  // pad: from Default, right to Expert, A presses it
  seen.length = 0;
  const pad = await p.evaluate(() => { const h = window.__hl; h.navFocus(document.querySelector('[data-lbl="normal"]')); h.navDir('r'); const f = document.activeElement && document.activeElement.dataset.lbl; h.navAct(); return f });
  ok(pad === 'hard', 'a pad moves along the level chips (' + pad + ')');
  await until(p, () => document.querySelector('[data-lbl="hard"]').getAttribute('aria-pressed') === 'true' && !/Loading/.test(document.getElementById('lbHead').textContent), 5000, 'expert');
  const s2 = await p.evaluate(() => ({ head: document.getElementById('lbHead').textContent, list: document.getElementById('lbList').textContent }));
  await shot('board-expert');
  ok(seen.some((x) => x.lvl === 'hard') && /Expert/.test(s2.head) && /Tester/.test(s2.list) && /Vanta/.test(s2.list), 'Expert shows the Expert times: ' + s2.head);
  // pick that track from the list: its top 10 on Expert
  seen.length = 0;
  await p.evaluate(() => { const b = [...document.querySelectorAll('#lbList .lbrow')].find((e) => /W5F0917/.test(e.textContent)); b.click() });
  await until(p, () => !!document.getElementById('lbTop'), 5000, 'top');
  const s3 = await p.evaluate(() => ({ head: document.getElementById('lbHead').textContent, rows: [...document.querySelectorAll('#lbTop tr')].map((t) => t.children[1].textContent).join() }));
  await shot('board-expert-top');
  ok(seen.some((x) => x.path === '/top' && x.lvl === 'hard') && s3.rows === 'Vanta,Eric' && /Expert rivals/.test(s3.head), 'a track picked on Expert shows its Expert top 10 (' + s3.rows + ')');
  // Default again from the chip: the same track's Default top 10
  await p.evaluate(() => document.querySelector('[data-lbl="normal"]').click());
  await until(p, () => /Default rivals/.test(document.getElementById('lbHead').textContent), 5000, 'default top');
  ok(await p.evaluate(() => [...document.querySelectorAll('#lbTop tr')].map((t) => t.children[1].textContent).join()) === 'Eric,Pell,Old,Y', 'switching back to Default shows the Default top 10');
  // closing on Expert and opening again: Default
  await p.evaluate(() => document.querySelector('[data-lbl="hard"]').click()); await wait(300);
  await p.evaluate(() => { document.getElementById('lbDone').click(); document.getElementById('lbBtn').click() }); await wait(500);
  ok(await p.evaluate(() => window.__hl.lbv.lvl) === 'normal', 'the screen opens on Default again');

  // ---- an old worker (no lvl in its answers): the screen says all levels share one board ----
  await p.route('http://127.0.0.1:9/**', (rt) => rt.fulfill({ status: 200, contentType: 'application/json', headers: { 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify({ runs: [{ track: TR, laps: 3, name: 'Old', ship: 'orb', time: 80, lap: 26, at: Date.now() }] }) }));
  await p.evaluate(() => document.querySelector('[data-lbl="easy"]').click());
  await until(p, () => /one board/.test(document.getElementById('lbHead').textContent), 5000, 'old worker');
  ok(true, 'against a worker from before levels the head says every level is on one board for now');

  // ---- a room: the host's level goes with the track ----
  const info = await p.evaluate(() => window.__hl.mpTrackInfo());
  ok(info.ail === 'hard', 'the room info carries the host\'s rivals level (' + info.ail + ')');
  ok(p.errs.length === 0, 'no page errors');
  await b.close(); done();
})().catch((e) => { console.log('FAIL', e); process.exit(1) });
