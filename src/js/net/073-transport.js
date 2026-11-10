//# net/073-transport.js: multiplayer transport: MQTT over public brokers and WebRTC (from the browser-multiplayer-kit)
/* ---------- multiplayer transport ----------
   From browser-multiplayer-kit (first written for Eric's other game, Urchin Skipper, Oct 2026): mqtt.js + room-link.js, unchanged apart from the names,
   the ?broker= test override and the WebRTC path being left out. Every message goes through two public MQTT brokers
   over wss; the Wi-Fi relay carrier is used when the page comes from the bundled Wi-Fi host. */
const HLNet=(()=>{
// A minimal MQTT 3.1.1 client over WebSocket: connect, subscribe, publish at
// QoS 0, keep-alive and a last-will message. No dependencies, so it runs in any
// browser (and Node 22+, which has a global WebSocket) and copies to other games.
const encoder = new TextEncoder(),
  decoder = new TextDecoder();

function utf8(text) {
  const bytes = encoder.encode(text);
  return [bytes.length >> 8, bytes.length & 255, ...bytes];
}
function remainingLength(n) {
  const out = [];
  do {
    let byte = n % 128;
    n = Math.floor(n / 128);
    if (n > 0) byte |= 128;
    out.push(byte);
  } while (n > 0);
  return out;
}
function packet(type, body) {
  const head = [type, ...remainingLength(body.length)];
  const out = new Uint8Array(head.length + body.length);
  out.set(head);
  out.set(body, head.length);
  return out;
}
function publishPacket(topic, payload) {
  const t = utf8(topic),
    p = encoder.encode(payload);
  const body = new Uint8Array(t.length + p.length);
  body.set(t);
  body.set(p, t.length);
  return packet(0x30, body);
}

// Resolves with a client once the broker accepts the connection; rejects on
// refusal, socket error or timeout. handlers: onMessage(topic, text), onClose().
function connectMqtt(
  url,
  { clientId, keepAlive = 30, will = null, timeout = 6000, onMessage, onClose } = {},
) {
  return new Promise((resolve, reject) => {
    let socket;
    try {
      socket = new WebSocket(url, 'mqtt');
    } catch (error) {
      reject(error);
      return;
    }
    socket.binaryType = 'arraybuffer';
    let buffer = new Uint8Array(0),
      ready = false,
      closed = false,
      ping = null,
      packetId = 1;
    const fail = (why) => {
      if (!ready) reject(new Error(why));
      close();
    };
    const timer = setTimeout(() => fail(`${url} timed out`), timeout);
    function close() {
      if (closed) return;
      closed = true;
      clearTimeout(timer);
      clearInterval(ping);
      try {
        if (socket.readyState === 1) socket.send(new Uint8Array([0xe0, 0])); // DISCONNECT
        socket.close();
      } catch {
        /* Already closing. */
      }
      if (ready) onClose?.();
    }
    const send = (bytes) => {
      if (socket.readyState === 1) socket.send(bytes);
    };
    socket.onopen = () => {
      const flags = 0x02 | (will ? 0x04 : 0); // clean session, optional will at QoS 0
      const body = [0, 4, 77, 81, 84, 84, 4, flags, keepAlive >> 8, keepAlive & 255];
      body.push(...utf8(clientId));
      if (will) body.push(...utf8(will.topic), ...utf8(will.payload));
      send(packet(0x10, body));
    };
    socket.onerror = () => fail(`${url} unreachable`);
    socket.onclose = () => fail(`${url} closed`);
    socket.onmessage = ({ data }) => {
      const chunk = new Uint8Array(data);
      const joined = new Uint8Array(buffer.length + chunk.length);
      joined.set(buffer);
      joined.set(chunk, buffer.length);
      buffer = joined;
      // Several packets can share a frame, and one packet can span frames.
      for (;;) {
        if (buffer.length < 2) return;
        let length = 0,
          multiplier = 1,
          i = 1,
          byte;
        do {
          if (i >= buffer.length) return;
          byte = buffer[i++];
          length += (byte & 127) * multiplier;
          multiplier *= 128;
        } while (byte & 128);
        if (buffer.length < i + length) return;
        const type = buffer[0] >> 4,
          body = buffer.subarray(i, i + length);
        buffer = buffer.slice(i + length);
        if (type === 2) {
          // CONNACK
          if (body[1] !== 0) return fail(`${url} refused (${body[1]})`);
          ready = true;
          clearTimeout(timer);
          ping = setInterval(() => send(new Uint8Array([0xc0, 0])), (keepAlive * 1000) / 2);
          resolve(client);
        } else if (type === 3) {
          // PUBLISH (QoS 0 only: we subscribe at QoS 0)
          const topicLength = (body[0] << 8) | body[1];
          const topic = decoder.decode(body.subarray(2, 2 + topicLength));
          const qos = (buffer[0] >> 1) & 3;
          const offset = 2 + topicLength + (qos ? 2 : 0);
          onMessage?.(topic, decoder.decode(body.subarray(offset)));
        }
      }
    };
    const client = {
      url,
      get open() {
        return ready && !closed && socket.readyState === 1;
      },
      // Bytes waiting in the socket: lets a caller skip a pose when a link is slow.
      get backlog() {
        return socket.bufferedAmount;
      },
      subscribe(topic) {
        const id = packetId++ & 0xffff || 1;
        send(packet(0x82, [id >> 8, id & 255, ...utf8(topic), 0]));
      },
      publish(topic, text) {
        send(publishPacket(topic, text));
      },
      close,
    };
  });
}

// One connection between skippers. Four carriers share one interface:
//  net   — internet (itch.io, any network): every message goes both through a
//          public MQTT broker over secure WebSocket and, where the network
//          allows, directly over WebRTC; duplicates are dropped. The broker
//          path works where WebRTC alone fails (no TURN server, NAT without
//          hairpinning, hidden mDNS addresses), as on October 25.
//  relay — the local/Wi-Fi server's /mp/ endpoint (same Wi-Fi, no internet needed)
//  p2p   — WebRTC alone with Trystero's public signalling (diagnostics)
//  local — BroadcastChannel, two tabs on one device (tests)
// Messages are small JSON objects; carriers never interpret them. Every
// delivery names its sender: handlers.onMessage(message, fromId). Sends are
// broadcast to the room (up to eight skippers); the session addresses them.

// CHANGE BOTH per game: rooms of different games must never meet.
const APP_ID = 'hoverline-v1';
const RELAY_NAME = 'hoverline';
// Public brokers that accept anonymous WebSocket clients. All are joined and a
// message is sent through each that is open, so any one of them is enough.
// Both answered from a Steam Deck on October 25; each was briefly unreachable
// at some point that evening, which is why there are two.
// ?broker=ws://host:port/mqtt points every player at one test broker instead (used by the automated tests).
const BROKER_PARAM = new URLSearchParams(location.search).get('broker');
const MQTT_BROKERS = BROKER_PARAM ? [BROKER_PARAM] : ['wss://broker.hivemq.com:8884/mqtt', 'wss://broker.emqx.io:8084/mqtt'];
const NET = Object.freeze({
  heartbeatMs: 2000,
  // A skipper not heard from on any path for this long has left.
  silenceMs: 12000,
  // A pose is skipped (the next one replaces it) while a broker socket is this far behind.
  backlogBytes: 64 * 1024,
  reconnectMs: [1000, 3000, 8000, 15000],
  // Hold a new sender's first messages this long so a slower path can fill in
  // anything earlier; then wait at most gapMs for a missing message.
  firstContactMs: 400,
  // At most this many broker publishes per second per skipper (1000 / batchMs).
  batchMs: 125,
  gapMs: 1500,
});
const CODE_LETTERS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function roomCode(random = Math.random) {
  let code = '';
  for (let i = 0; i < 5; i++) code += CODE_LETTERS[Math.floor(random() * CODE_LETTERS.length)];
  return code;
}
const normaliseCode = (text) =>
  String(text || '')
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, 8);
const clientId = () =>
  Array.from(crypto.getRandomValues(new Uint8Array(8)), (n) => (n % 36).toString(36)).join('');

// Wi-Fi addresses the local server reported, for the host to read out.
const relayInfo = { lan: [] };
async function relayAvailable(fetcher = globalThis.fetch, timeout = 900) {
  // The Wi-Fi server is plain http; an https page (itch.io) cannot use it.
  if (!fetcher || location.protocol !== 'http:') return false;
  const abort = new AbortController(),
    timer = setTimeout(() => abort.abort(), timeout);
  try {
    const response = await fetcher('./mp/ping', { signal: abort.signal, cache: 'no-store' });
    const data = response.ok ? await response.json() : {};
    relayInfo.lan = Array.isArray(data.lan) ? data.lan.map(String) : [];
    return data.relay === RELAY_NAME;
  } catch {
    return false;
  } finally {
    clearTimeout(timer);
  }
}

// requested: a ?mp= override; mode: the lobby's choice, 'wifi' or 'internet'.
async function chooseCarrier(
  requested = new URLSearchParams(location.search).get('mp'),
  mode = null,
) {
  // The probe also learns the server's Wi-Fi addresses for the host to show.
  const relay = await relayAvailable();
  if (['relay', 'p2p', 'local', 'net'].includes(requested)) return requested;
  if (mode === 'wifi') {
    if (!relay) throw new Error(WIFI_UNAVAILABLE);
    return 'relay';
  }
  if (mode === 'internet') return 'net';
  return relay ? 'relay' : 'net';
}
const WIFI_UNAVAILABLE =
  'No Wi-Fi host here. On itch.io choose Internet: it works on the same Wi-Fi too.';

function relayLink(code, handlers) {
  const id = clientId(),
    base = `./mp/${code}`;
  const source = new EventSource(`${base}/events?id=${id}`);
  let open = false,
    opened;
  // Nothing is posted until the relay has registered this skipper's stream.
  let queue = new Promise((resolve) => (opened = resolve));
  source.onmessage = (event) => {
    let data;
    try {
      data = JSON.parse(event.data);
    } catch {
      return;
    }
    if (data.t === '_hello') {
      open = true;
      opened();
      handlers.onOpen?.();
      for (const peer of data.peers) handlers.onPeer?.(peer);
    } else if (data.t === '_join') handlers.onPeer?.(data.id);
    else if (data.t === '_leave') handlers.onLeave?.(data.id);
    else if (data.t === '_m') handlers.onMessage?.(data.m, data.from);
  };
  source.onerror = () => {
    if (!open) handlers.onError?.('The Wi-Fi relay is unavailable or the room is full.');
  };
  return {
    carrier: 'relay',
    id,
    // Ordered delivery: each POST waits for the previous one.
    send(message) {
      const body = JSON.stringify(message);
      queue = queue
        .then(() =>
          fetch(`${base}/send?id=${id}`, {
            method: 'POST',
            body,
            headers: { 'Content-Type': 'application/json' },
            keepalive: body.length < 60000,
          }),
        )
        .catch(() => {});
    },
    close() {
      source.close();
    },
  };
}

// Internet carrier. Presence comes from the messages themselves: each skipper
// sends a heartbeat every two seconds, and every message carries the sender's
// id and a sequence number, so a copy arriving by the second path is dropped.
function netLink(code, handlers, { brokers = MQTT_BROKERS, direct = false } = {}) {
  const id = clientId(),
    topic = `${APP_ID}/${code}`;
  const clients = new Set(),
    peers = new Map(),
    seen = new Map();
  // Gaps given up on (a message no path delivered), for diagnostics.
  let skipped = 0;
  let seq = 0,
    closed = false,
    room = null,
    action = null,
    opened = false;
  const open = () => {
    if (opened || closed) return;
    opened = true;
    handlers.onOpen?.();
  };
  // Broker traffic is batched: at most one publish per broker every batchMs,
  // carrying everything queued since. Public brokers cap each client's
  // publish rate (broker.emqx.io dropped a third of 15 messages a second on
  // October 25). Only the newest pose waits in the queue. The direct path
  // sends each message as it happens.
  let queued = [];
  const flush = () => {
    if (!queued.length) return;
    const batch = queued;
    queued = [];
    const text = JSON.stringify(batch),
      posesOnly = batch.every((e) => e.p !== undefined || e.t === '_hb');
    for (const client of clients)
      if (client.open && !(posesOnly && client.backlog > NET.backlogBytes))
        client.publish(topic, text);
  };
  const transmit = (envelope) => {
    if (envelope.p !== undefined) queued = queued.filter((e) => e.p === undefined);
    queued.push(envelope);
    action?.send(envelope).catch(() => {});
  };
  // Poses carry their own counter instead of a sequence number: a newer one
  // replaces an older one, so a lost or replaced pose never holds anything up.
  let poseCount = 0;
  const post = (fields) =>
    transmit(
      fields.m?.t === 'pose'
        ? { f: id, p: ++poseCount, ...fields }
        : fields.t === '_hb'
          ? { f: id, ...fields }
          : { f: id, s: ++seq, ...fields },
    );
  const heard = (from) => {
    const fresh = !peers.has(from);
    peers.set(from, Date.now());
    if (fresh) {
      handlers.onPeer?.(from);
      // Answer at once so the newcomer need not wait for the next heartbeat.
      post({ t: '_hb' });
    }
  };
  const forget = (from) => {
    clearTimeout(seen.get(from)?.timer);
    seen.delete(from);
    if (!peers.delete(from)) return;
    handlers.onLeave?.(from);
  };
  // Each sender's messages are delivered once and in order. Two paths can
  // disagree on order (one broker slower than the other), so a message that
  // arrives ahead of a missing one waits for it: briefly at first contact,
  // longer for a gap. A gap that never fills (a broker dropped it) is skipped.
  function receive(envelope) {
    if (!envelope || typeof envelope.f !== 'string' || envelope.f === id || closed) return;
    if (envelope.to && envelope.to !== id) return;
    if (envelope.t === '_bye') return forget(envelope.f);
    if (envelope.t === '_hb') return heard(envelope.f);
    if (typeof envelope.p === 'number') {
      let line = seen.get(envelope.f);
      if (!line) seen.set(envelope.f, (line = { last: null, held: new Map(), timer: null }));
      if (envelope.p <= (line.pose ?? 0)) return;
      line.pose = envelope.p;
      heard(envelope.f);
      handlers.onMessage?.(envelope.m, envelope.f);
      return;
    }
    if (typeof envelope.s !== 'number') return;
    let line = seen.get(envelope.f);
    if (!line) seen.set(envelope.f, (line = { last: null, held: new Map(), timer: null }));
    if ((line.last !== null && envelope.s <= line.last) || line.held.has(envelope.s)) return;
    line.held.set(envelope.s, envelope);
    heard(envelope.f);
    release(envelope.f, line);
  }
  function release(from, line) {
    if (line.last === null) {
      line.timer ??= setTimeout(() => {
        line.timer = null;
        line.last = Math.min(...line.held.keys()) - 1;
        release(from, line);
      }, NET.firstContactMs);
      return;
    }
    while (line.held.has(line.last + 1)) {
      const envelope = line.held.get(++line.last);
      line.held.delete(line.last);
      if (envelope.m !== undefined) handlers.onMessage?.(envelope.m, from);
      if (closed || seen.get(from) !== line) return;
    }
    if (!line.held.size) {
      clearTimeout(line.timer);
      line.timer = null;
    } else
      // One timer per gap: later arrivals must not keep pushing it back.
      line.timer ??= setTimeout(() => {
        line.timer = null;
        skipped++;
        line.last = Math.min(...line.held.keys()) - 1;
        release(from, line);
      }, NET.gapMs);
  }
  const fromBroker = (_topic, text) => {
    try {
      const data = JSON.parse(text);
      // A batch, or a single envelope (the broker's last-will goodbye).
      for (const envelope of Array.isArray(data) ? data : [data]) receive(envelope);
    } catch {
      /* Not one of ours. */
    }
  };
  let failures = 0;
  function joinBroker(url, attempt = 0) {
    if (closed) return;
    let client = null;
    connectMqtt(url, {
      clientId: `${APP_ID}-${id}`,
      // Public brokers sometimes take several seconds to accept.
      timeout: 10000,
      // The broker announces an unexpected drop to the room.
      will: { topic, payload: JSON.stringify({ f: id, t: '_bye' }) },
      onMessage: fromBroker,
      onClose: () => {
        if (closed) return;
        clients.delete(client);
        retry(url, 0);
      },
    }).then(
      (c) => {
        if (closed) return c.close();
        client = c;
        clients.add(c);
        c.subscribe(topic);
        post({ t: '_hb' });
        open();
      },
      () => {
        failures++;
        if (failures >= brokers.length && !direct)
          handlers.onError?.(
            'The internet relay could not be reached. Check this device is online.',
          );
        retry(url, attempt + 1);
      },
    );
  }
  const retry = (url, attempt) =>
    setTimeout(
      () => joinBroker(url, attempt),
      NET.reconnectMs[Math.min(attempt, NET.reconnectMs.length - 1)],
    );
  for (const url of brokers) joinBroker(url);
  const batching = setInterval(flush, NET.batchMs);
  let beatAt = Date.now();
  const heartbeat = setInterval(() => {
    post({ t: '_hb' });
    const now = Date.now(), stalled = now - beatAt > NET.heartbeatMs * 3;
    beatAt = now;
    // This device was frozen (a long load, or the app in the background): the silence was ours, so everyone gets a
    // fresh grace period instead of being dropped all at once.
    if (stalled) { for (const peer of peers.keys()) peers.set(peer, now); return; }
    for (const [peer, last] of peers) if (now - last > NET.silenceMs) forget(peer);
  }, NET.heartbeatMs);
  // Nothing reachable yet: open anyway so the lobby shows the room code.
  const fallback = setTimeout(open, 5000);
  // Neither path has produced anyone or any broker after a while: say so.
  const warning = setTimeout(() => {
    if (!clients.size && !peers.size && !closed)
      handlers.onError?.('The internet relay could not be reached. Check this device is online.');
  }, 20000);
  return {
    carrier: 'net',
    id,
    get paths() {
      return {
        skipped,
        broker: [...clients].filter((c) => c.open).length,
        direct: room ? Object.keys(room.getPeers()).length : 0,
      };
    },
    send: (message) => post({ m: message }),
    close() {
      if (closed) return;
      post({ t: '_bye' });
      flush();
      closed = true;
      clearInterval(batching);
      clearInterval(heartbeat);
      clearTimeout(fallback);
      clearTimeout(warning);
      for (const line of seen.values()) clearTimeout(line.timer);
      for (const client of clients) client.close();
      clients.clear();
      room?.leave();
    },
  };
}

function localLink(code, handlers) {
  const id = clientId(),
    channel = new BroadcastChannel(`${APP_ID}-${code}`);
  channel.onmessage = ({ data }) => {
    if (data.to && data.to !== id) return;
    if (data.t === '_join') {
      handlers.onPeer?.(data.id);
      if (!data.reply) channel.postMessage({ t: '_join', id, reply: true, to: data.id });
    } else if (data.t === '_leave') handlers.onLeave?.(data.id);
    else if (data.m) handlers.onMessage?.(data.m, data.from);
  };
  channel.postMessage({ t: '_join', id });
  setTimeout(() => handlers.onOpen?.(), 0);
  return {
    carrier: 'local',
    id,
    send: (m) => channel.postMessage({ m, from: id }),
    close: () => {
      channel.postMessage({ t: '_leave', id });
      channel.close();
    },
  };
}

async function openLink(code, handlers, carrier) {
  carrier ||= await chooseCarrier();
  if (carrier === 'lan') return LAN.link(code, handlers);
  if (carrier === 'relay') return relayLink(code, handlers);
  if (carrier === 'local') return localLink(code, handlers);
  return netLink(code, handlers);
}

return{openLink,chooseCarrier,roomCode,normaliseCode,relayAvailable,relayInfo,APP_ID,NET,WIFI_UNAVAILABLE};
})();

