-- Run once on a database made before board eras (Prototype 29). Existing times become era 0 and stop showing;
-- they stay in the table. Fresh databases get the column from schema.sql and don't need this.
ALTER TABLE runs ADD COLUMN era INTEGER NOT NULL DEFAULT 0;
CREATE INDEX IF NOT EXISTS runs_era ON runs (era, track, laps, time_ms);
