-- Cuke Cutter's logs (Cloudflare D1 database `cuke-cutter`, bound to the hoverline-board Worker as CUKE_DB).
-- Cuke Cutter is a different game that sends its logs to this Worker's POST /log. The Worker spots them by
-- log.game === 'cuke-cutter' and keeps them here, apart from Hoverline's race data. Same columns as Hoverline's logs.
-- Create once: npx wrangler d1 execute cuke-cutter --remote --file=cuke-schema.sql
CREATE TABLE IF NOT EXISTS logs (
  id      INTEGER PRIMARY KEY AUTOINCREMENT,
  created INTEGER NOT NULL,          -- unix ms
  who     TEXT    NOT NULL,          -- salted hash of the sender's IP (never the IP itself)
  ver     INTEGER NOT NULL,          -- the {v} Cuke Cutter sends (1001 for its 1.0.x builds)
  track   TEXT    NOT NULL,          -- log.track.code, or CUKE-CUTTER
  data    TEXT    NOT NULL           -- the log as JSON
);
CREATE INDEX IF NOT EXISTS logs_time ON logs (created);
CREATE INDEX IF NOT EXISTS logs_who  ON logs (who, created);
