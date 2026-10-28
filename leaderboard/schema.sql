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
