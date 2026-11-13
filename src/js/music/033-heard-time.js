//# music/033-heard-time.js: when a sound is HEARD, not when it is scheduled: the clock every music-driven picture reads (the track's beat lights, the Spirit realm)
/* Prototype 63 (Eric, from his phone: "I see a light bloom briefly and then hear the associated noise"). The engine
   schedules a note at an audio-clock time t, up to 0.3 s before it plays; the sound leaves the speaker only when the
   context's clock has reached t plus the output latency (a phone's audio path, and much more on Bluetooth). A picture that
   fires when currentTime reaches t is that much early. musHeard() is the context clock minus the output latency
   (outputLatency where the browser reports it, baseLatency otherwise) minus the player's own Music sync offset
   (Music page, hoverline.msync, in ms: later lights are a positive number, default 0), so "t <= musHeard()" is "it is
   audible now". An analyser reads the sound before that delay, so what it hears is held back by the same time. */
let MUS_SYNC=(()=>{const v=+store.get('hoverline.msync');return isFinite(v)?Math.max(-200,Math.min(300,v)):0})();
function musLat(){const c=music.ctx;return c?(c.outputLatency||c.baseLatency||0):0}
function musHeard(){const c=music.ctx;return c?c.currentTime-musLat()-MUS_SYNC/1000:performance.now()/1000}
