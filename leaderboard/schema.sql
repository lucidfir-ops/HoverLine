-- Hoverline online leaderboard (Cloudflare D1)
CREATE TABLE IF NOT EXISTS runs (
  id      INTEGER PRIMARY KEY AUTOINCREMENT,
  track   TEXT    NOT NULL,          -- track code, e.g. B3X01A2F4
  laps    INTEGER NOT NULL,
  name    TEXT    NOT NULL,          -- pilot name, 1-12 chars
  ship    TEXT    NOT NULL,          -- frame id: blade, orb, roller, mono, ...
  time_ms INTEGER NOT NULL,          -- race time
  lap_ms  INTEGER NOT NULL,          -- best lap
  created INTEGER NOT NULL,          -- unix ms
  who     TEXT    NOT NULL           -- salted hash of the sender's IP (never the IP itself)
);
CREATE INDEX IF NOT EXISTS runs_board ON runs (track, laps, time_ms);
CREATE INDEX IF NOT EXISTS runs_who   ON runs (who, created);

-- Shared race data (each finished race's log, sent by players who leave Share race data on)
CREATE TABLE IF NOT EXISTS logs (
  id      INTEGER PRIMARY KEY AUTOINCREMENT,
  created INTEGER NOT NULL,          -- unix ms
  who     TEXT    NOT NULL,          -- salted hash of the sender's IP (never the IP itself)
  ver     INTEGER NOT NULL,          -- game prototype number
  track   TEXT    NOT NULL,          -- track code
  data    TEXT    NOT NULL           -- the race log as JSON (other humans' names already replaced)
);
CREATE INDEX IF NOT EXISTS logs_time ON logs (created);
CREATE INDEX IF NOT EXISTS logs_who  ON logs (who, created);
