// Hoverline online leaderboard — a Cloudflare Worker with a D1 database.
//   GET  /top?track=CODE&laps=3&era=28   → { rows:[{name,ship,time,lap,at}], total }
//   GET  /boards?sort=recent|popular&era=28 → { boards:[{track,laps,pilots,best,holder,last}] }   (for the in-game Leaderboard screen)
//   POST /run  {track,laps,name,ship,time,lap,len,era}  → { rank, total, rows }
//   POST /log  {v, log}                       → { ok, id }            (shared race data; no names)
//   GET  /logs?key=ADMIN_KEY&since=MS&limit=N → { logs:[{id,created,ver,track,log}], more }
//   GET  /logs/count?key=ADMIN_KEY            → { n, bytes }
// Times are in seconds on the wire, stored as ms. One row per run; the board shows each pilot's best.
// Boards are split by era: the game's BOARD_ERA, raised whenever tracks or handling change enough that old times aren't
// comparable. Every read and write takes ?era= / {era}; a client that sends none (Prototype 28) is era 28.
// Rows from before eras existed are era 0 and never shown.
const CORS = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET,POST,OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' };
const LOG_MAX = 400000; // bytes of JSON per race log
const json = (o, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { 'Content-Type': 'application/json', ...CORS } });
const TRACK = /^[A-Z0-9-]{4,40}$/i, SHIP = /^[a-z]{2,12}$/;
const eraOf = v => { const n = parseInt(v, 10); return n > 0 && n < 10000 ? n : 28 };
const cleanName = n => String(n || '').replace(/[\u0000-\u001f\u007f<>&"]/g, '').trim().slice(0, 12);

async function top(db, track, laps, era, n = 10) {
  const r = await db.prepare(
    `SELECT name, ship, MIN(time_ms) AS t, lap_ms, created FROM runs WHERE track=?1 AND laps=?2 AND era=?4
     GROUP BY name ORDER BY t ASC LIMIT ?3`).bind(track, laps, n, era).all();
  const c = await db.prepare(`SELECT COUNT(DISTINCT name) AS n FROM runs WHERE track=?1 AND laps=?2 AND era=?3`).bind(track, laps, era).first();
  return { rows: r.results.map(x => ({ name: x.name, ship: x.ship, time: x.t / 1000, lap: x.lap_ms / 1000, at: x.created })), total: c ? c.n : 0 };
}

async function boards(db, sort, era) {
  const order = sort === 'popular' ? 'pilots DESC, last DESC' : 'last DESC';
  const r = await db.prepare(
    `SELECT b.track, b.laps, b.pilots, b.t, b.last,
       (SELECT name FROM runs r WHERE r.track=b.track AND r.laps=b.laps AND r.era=?1 ORDER BY time_ms ASC LIMIT 1) AS holder
     FROM (SELECT track, laps, COUNT(DISTINCT name) AS pilots, MIN(time_ms) AS t, MAX(created) AS last FROM runs WHERE era=?1 GROUP BY track, laps) b
     ORDER BY ${order} LIMIT 30`).bind(era).all();
  return { boards: r.results.map(x => ({ track: x.track, laps: x.laps, pilots: x.pilots, best: x.t / 1000, holder: x.holder, last: x.last })) };
}

async function hash(s) {
  const d = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s));
  return [...new Uint8Array(d)].slice(0, 12).map(b => b.toString(16).padStart(2, '0')).join('');
}

export default {
  async fetch(req, env) {
    const u = new URL(req.url);
    if (req.method === 'OPTIONS') return new Response(null, { headers: CORS });
    try {
      if (req.method === 'GET' && u.pathname === '/top') {
        const track = u.searchParams.get('track') || '', laps = parseInt(u.searchParams.get('laps') || '3', 10);
        if (!TRACK.test(track) || !(laps >= 1 && laps <= 9)) return json({ error: 'bad track' }, 400);
        return json(await top(env.DB, track.toUpperCase(), laps, eraOf(u.searchParams.get('era'))));
      }
      if (req.method === 'GET' && u.pathname === '/boards') return json(await boards(env.DB, u.searchParams.get('sort'), eraOf(u.searchParams.get('era'))));
      if (req.method === 'POST' && u.pathname === '/run') {
        const b = await req.json().catch(() => null);
        if (!b) return json({ error: 'bad json' }, 400);
        const track = String(b.track || '').toUpperCase(), laps = b.laps | 0, name = cleanName(b.name), ship = String(b.ship || '');
        const time = +b.time, lap = +b.lap, len = +b.len, era = eraOf(b.era);
        if (!TRACK.test(track) || !(laps >= 1 && laps <= 9) || !name || !SHIP.test(ship)) return json({ error: 'bad run' }, 400);
        // Plausibility, not proof: nobody averages more than ~240 m/s, the best lap can't be slower than the average lap, and races end inside 30 minutes.
        if (!(len > 500 && len < 40000) || !(time > 0 && time < 1800) || !(lap > 0 && lap <= time / laps + 0.01) || time < laps * len / 240)
          return json({ error: 'implausible time' }, 422);
        const who = await hash((req.headers.get('CF-Connecting-IP') || 'local') + (env.SALT || 'hoverline'));
        const now = Date.now();
        const recent = await env.DB.prepare(`SELECT COUNT(*) AS n FROM runs WHERE who=?1 AND created>?2`).bind(who, now - 60000).first();
        if (recent && recent.n >= 6) return json({ error: 'slow down' }, 429);
        await env.DB.prepare(`INSERT INTO runs (track,laps,name,ship,time_ms,lap_ms,created,who,era) VALUES (?1,?2,?3,?4,?5,?6,?7,?8,?9)`)
          .bind(track, laps, name, ship, Math.round(time * 1000), Math.round(lap * 1000), now, who, era).run();
        const best = await env.DB.prepare(`SELECT MIN(time_ms) AS t FROM runs WHERE track=?1 AND laps=?2 AND name=?3 AND era=?4`).bind(track, laps, name, era).first();
        const ahead = await env.DB.prepare(
          `SELECT COUNT(*) AS n FROM (SELECT name, MIN(time_ms) AS t FROM runs WHERE track=?1 AND laps=?2 AND era=?4 GROUP BY name) WHERE t < ?3`)
          .bind(track, laps, best.t, era).first();
        const board = await top(env.DB, track, laps, era);
        return json({ rank: ahead.n + 1, best: best.t / 1000, ...board });
      }
      if (req.method === 'POST' && u.pathname === '/log') {
        const txt = await req.text();
        if (txt.length > LOG_MAX) return json({ error: 'too big' }, 413);
        let b = null; try { b = JSON.parse(txt) } catch (e) { }
        const L = b && b.log;
        if (!L || typeof L !== 'object' || !Array.isArray(L.s) || !L.track) return json({ error: 'bad log' }, 400);
        const who = await hash((req.headers.get('CF-Connecting-IP') || 'local') + (env.SALT || 'hoverline'));
        const now = Date.now();
        const recent = await env.DB.prepare(`SELECT COUNT(*) AS n FROM logs WHERE who=?1 AND created>?2`).bind(who, now - 3600000).first();
        if (recent && recent.n >= 40) return json({ error: 'slow down' }, 429);
        const track = String(L.track.code || '').slice(0, 40), ver = (b.v | 0) || 0;
        const r = await env.DB.prepare(`INSERT INTO logs (created,who,ver,track,data) VALUES (?1,?2,?3,?4,?5)`).bind(now, who, ver, track, JSON.stringify(L)).run();
        return json({ ok: true, id: r.meta ? r.meta.last_row_id : null });
      }
      if (req.method === 'GET' && (u.pathname === '/logs' || u.pathname === '/logs/count')) {
        if (!env.ADMIN_KEY || u.searchParams.get('key') !== env.ADMIN_KEY) return json({ error: 'key' }, 403);
        if (u.pathname === '/logs/count') {
          const c = await env.DB.prepare(`SELECT COUNT(*) AS n, SUM(LENGTH(data)) AS bytes FROM logs`).first();
          return json({ n: c ? c.n : 0, bytes: c ? c.bytes || 0 : 0 });
        }
        const since = parseInt(u.searchParams.get('since') || '0', 10) || 0, limit = Math.min(200, parseInt(u.searchParams.get('limit') || '100', 10) || 100);
        const r = await env.DB.prepare(`SELECT id, created, ver, track, data FROM logs WHERE created>?1 ORDER BY created ASC LIMIT ?2`).bind(since, limit + 1).all();
        const rows = r.results.slice(0, limit).map(x => { let log = null; try { log = JSON.parse(x.data) } catch (e) { } return { id: x.id, created: x.created, ver: x.ver, track: x.track, log } });
        return json({ logs: rows, more: r.results.length > limit, next: rows.length ? rows[rows.length - 1].created : since });
      }
      return json({ error: 'not found' }, 404);
    } catch (e) { return json({ error: 'server', detail: String(e).slice(0, 200) }, 500) }
  }
};
