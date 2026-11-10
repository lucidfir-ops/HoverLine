//# net/075-session.js: multiplayer session: lobby, host, load check, synchronised start
/* ---------- multiplayer session: lobby, host, load check, synchronised start ----------
   Game-agnostic layer on top of a room link ({id, send, close, paths}) from the transport.
   Why it exists: a link only says "someone is here" and carries messages. A game also needs one agreed list of who is in
   the room, one player whose word is final (the host), proof that every player has finished loading before anything
   moves, and one shared moment to start. Without those, two players can be connected and still never see each other.
   - The room creator is host. The host keeps the roster (join order, profile, state) and rebroadcasts it every 3 s and
     whenever it changes; everyone else only ever adopts the host's roster.
   - start(payload): host sends s.start with the field (players in the lobby). Each client builds its world, then calls
     loaded(). When every player in the field is loaded (or after 15 s, without the missing ones) the host sends s.go
     with a start time on its own clock, 3 s ahead. Clients convert it with their clock offset (ping/pong at jittered
     times; the lowest-round-trip of the last 16 wins). state.goAt stays on the host's clock, so a game can keep
     re-converting it while the estimate improves (only while state.hostId === state.goHost).
   - If the host leaves, the next player in roster order takes over (everyone computes the same answer).
   Messages are small JSON objects; session messages have t starting with "s.". Everything else goes to onMessage. */
function createSession(o) {
  const now = o.now || (() => performance.now());
  const S = {
    code: o.code, id: null, isHost: !!o.host, hostId: null, roster: [], info: o.info || {}, max: o.max || 6,
    phase: 'connecting', race: 0, field: null, loaded: new Set(), goAt: null, offset: 0, rtt: null, busy: false,
    me: { p: o.profile || {}, st: 'lobby', rd: false }, peers: new Set(), link: null, closed: false,
  };
  const samples = [];
  let rosterTimer = null, pingTimer = null, noHostTimer = null, loadTimer = null, pings = 0;
  const change = () => { try { o.onChange && o.onChange(S) } catch (e) { console.error(e) } };
  const send = (m) => { if (S.link && !S.closed) S.link.send(m) };
  const entry = (id) => S.roster.find((e) => e.id === id);
  const present = (id) => id === S.id || S.peers.has(id);
  const hostNow = () => (S.isHost ? now() : now() + S.offset);
  const sendRoster = () => {
    if (!S.isHost) return;
    S.roster = S.roster.filter((e) => present(e.id));
    send({ t: 's.roster', host: S.id, list: S.roster, info: S.info, race: S.race, busy: S.phase === 'loading' || S.phase === 'race', max: S.max });
  };
  const sendHi = () => send({ t: 's.hi', p: S.me.p, st: S.me.st, rd: !!S.me.rd, host: S.isHost, v: 1 });
  function becomeHost() {
    S.isHost = true; S.hostId = S.id; S.offset = 0;
    if (!entry(S.id)) S.roster.unshift({ id: S.id, p: S.me.p, st: S.me.st, rd: !!S.me.rd });
    sendRoster(); o.onHost && o.onHost(S); change();
  }
  function pickHost() {
    // The first player in the last roster who is still here; everyone holds the same roster, so all agree.
    const next = S.roster.find((e) => present(e.id) && e.id !== S.hostId);
    if (!next) return becomeHost();
    if (next.id === S.id) becomeHost();
    else { S.hostId = next.id; S.offset = 0; samples.length = 0; change() }
  }
  function startLoading(race, field, payload) {
    S.race = race; S.field = field; S.loaded = new Set(); S.goAt = null;
    if (field.includes(S.id)) { S.phase = 'loading'; S.busy = false; S.me.st = 'loading'; o.onStart && o.onStart(payload, field, race) }
    else { S.busy = true }
    change();
  }
  function checkLoaded(force) {
    if (!S.isHost || S.phase !== 'loading' || S.goAt != null) return;
    const field = S.field.filter((id) => present(id));
    if (!force && !field.every((id) => S.loaded.has(id))) return;
    clearTimeout(loadTimer);
    S.field = field.filter((id) => S.loaded.has(id));
    const at = hostNow() + (o.countdownMs || 3000);
    send({ t: 's.go', race: S.race, at, field: S.field });
    // Messages travel at most once per path, so the go is repeated: a guest that missed it would wait forever.
    for (const ms of [500, 1300]) setTimeout(() => { if (!S.closed && S.goAt === at) send({ t: 's.go', race: S.race, at, field: S.field }) }, ms);
    go(at, S.field);
  }
  function go(at, field) {
    S.goAt = at; S.goHost = S.hostId; S.field = field; S.phase = 'race';
    if (!field.includes(S.id)) { S.phase = 'lobby'; S.busy = true; change(); return }
    o.onGo && o.onGo(at - (S.isHost ? 0 : S.offset), field, S.race); change();
  }
  function receive(m, from) {
    if (!m || typeof m !== 'object') return;
    if (m.to && m.to !== S.id) return;
    if (typeof m.t !== 'string' || !m.t.startsWith('s.')) return o.onMessage && o.onMessage(m, from);
    S.peers.add(from);
    if (m.t === 's.hi') {
      if (m.host && S.isHost && from < S.id) { S.isHost = false; S.hostId = from; sendHi() } // two hosts: lower id wins
      if (!S.isHost) { if (m.host && !S.hostId) S.hostId = from; return change() }
      let e = entry(from);
      if (!e) {
        if (S.roster.length >= S.max) return send({ t: 's.full', to: from });
        S.roster.push((e = { id: from, p: m.p, st: m.st, rd: !!m.rd }));
      } else { e.p = m.p; e.st = m.st; e.rd = !!m.rd }
      sendRoster(); change();
    } else if (m.t === 's.roster') {
      if (S.isHost) { if (from < S.id) { S.isHost = false; S.hostId = from; sendHi() } else return sendRoster() }
      if (S.hostId && from !== S.hostId && present(S.hostId)) return;
      S.hostId = from; S.roster = m.list || []; S.info = m.info || {}; S.max = m.max || S.max; S.busy = !!m.busy && (S.phase === 'lobby' || S.phase === 'connecting');
      clearTimeout(noHostTimer);
      if (S.phase === 'connecting' || S.phase === 'full') S.phase = entry(S.id) ? 'lobby' : S.phase;
      if (!entry(S.id) && S.phase !== 'full') sendHi();
      o.onInfo && o.onInfo(S.info); change();
    } else if (m.t === 's.full') { S.phase = 'full'; o.onFull && o.onFull(); change() }
    else if (m.t === 's.start' && from === S.hostId && !(m.race === S.race && (S.phase === 'loading' || S.phase === 'race'))) startLoading(m.race, m.field, m.payload);
    else if (m.t === 's.loaded' && S.isHost && m.race === S.race) { S.loaded.add(from); const e = entry(from); if (e) e.st = 'loading'; change(); checkLoaded(false) }
    else if (m.t === 's.go' && from === S.hostId && m.race === S.race && S.goAt !== m.at) go(m.at, m.field);
    else if (m.t === 's.ping' && S.isHost) send({ t: 's.pong', to: from, c: m.c, h: now() });
    else if (m.t === 's.pong' && from === S.hostId) {
      const t2 = now(), rtt = t2 - m.c;
      samples.push([rtt, m.h + rtt / 2 - t2]); if (samples.length > 16) samples.shift();
      const best = samples.reduce((a, b) => (b[0] < a[0] ? b : a));
      S.rtt = Math.round(best[0]); S.offset = best[1]; change();
    }
  }
  const handlers = {
    onOpen() { if (S.isHost) { S.phase = 'lobby'; becomeHost() } else sendHi(); change() },
    onPeer(id) { S.peers.add(id); sendHi(); if (S.isHost) sendRoster(); change() },
    onLeave(id) {
      S.peers.delete(id);
      if (S.isHost) {
        S.roster = S.roster.filter((e) => e.id !== id);
        if (S.phase === 'loading') checkLoaded(false);
        sendRoster();
      } else if (id === S.hostId) pickHost();
      o.onLeave && o.onLeave(id); change();
    },
    onMessage: receive,
    onError(text) { o.onError && o.onError(text) },
  };
  Promise.resolve(o.openLink(S.code, handlers, o.carrier)).then((link) => {
    if (S.closed) return link.close();
    S.link = link; S.id = link.id;
    if (S.isHost) { S.hostId = S.id; S.roster = [{ id: S.id, p: S.me.p, st: S.me.st, rd: !!S.me.rd }] }
    rosterTimer = setInterval(() => { if (S.isHost) sendRoster(); else if (S.phase === 'connecting') sendHi() }, 3000);
    // Pings at jittered times: on a fixed interval they would always land at the same point of the link's send batching,
    // and the clock estimate would carry that delay as a fixed error. With jitter the best-of-8 sample is near the truth.
    const ping = () => { if (S.closed) return; if (!S.isHost && S.hostId) send({ t: 's.ping', to: S.hostId, c: now() });
      pingTimer = setTimeout(ping, (pings++ < 30 ? 500 : 2500) + Math.random() * 500) };
    pingTimer = setTimeout(ping, 300);
    if (!S.isHost && o.claimMs) noHostTimer = setTimeout(() => { if (S.phase === 'connecting' && !S.closed) { S.phase = 'lobby'; becomeHost() } }, o.claimMs);
    else if (!S.isHost) noHostTimer = setTimeout(() => { if (S.phase === 'connecting') o.onError && o.onError('No host answered for room ' + S.code + ' yet. Check the code, or create a room.') }, 12000);
    change();
  }, (e) => o.onError && o.onError(String(e && e.message || e)));
  return {
    state: S,
    hostNow,
    send(m) { send(m) },
    update(fields) {
      Object.assign(S.me, fields);
      if (S.isHost) { const e = entry(S.id); if (e) { e.p = S.me.p; e.st = S.me.st; e.rd = !!S.me.rd } sendRoster() } else sendHi();
      change();
    },
    setInfo(info) { if (!S.isHost) return; S.info = info; sendRoster(); change() },
    start(payload) {
      if (!S.isHost) return false;
      // Pilots race once they have pressed Ready; the host is in whenever they start.
      const field = S.roster.filter((e) => present(e.id) && ((e.st === 'lobby' && e.rd) || e.id === S.id)).map((e) => e.id);
      const race = S.race + 1;
      send({ t: 's.start', race, field, payload });
      for (const ms of [900, 2200]) setTimeout(() => { if (!S.closed && S.phase === 'loading' && S.goAt == null && S.race === race) send({ t: 's.start', race, field, payload }) }, ms);
      startLoading(race, field, payload);
      clearTimeout(loadTimer); loadTimer = setTimeout(() => checkLoaded(true), o.loadTimeoutMs || 15000);
      return true;
    },
    loaded() {
      if (S.phase !== 'loading') return;
      if (S.isHost) { S.loaded.add(S.id); checkLoaded(false) } else {
        const race = S.race; let n = 0;
        const tell = () => { if (S.closed || S.phase !== 'loading' || S.goAt != null || S.race !== race || n++ > 8) return; send({ t: 's.loaded', race }); setTimeout(tell, 1200) };
        tell();
      }
    },
    backToLobby() { S.phase = 'lobby'; S.field = null; S.goAt = null; this.update({ st: 'lobby', rd: false }) },
    close() {
      if (S.closed) return; S.closed = true;
      clearInterval(rosterTimer); clearTimeout(pingTimer); clearTimeout(noHostTimer); clearTimeout(loadTimer);
      if (S.link) S.link.close();
    },
  };
}

