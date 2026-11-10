-- Prototype 60: one board per rivals' level. Run once on the live database (D1 console: paste, Execute).
-- Every time already on the board becomes lvl 'normal' (shown as Default), which is what it was: before Prototype 60 only
-- Normal races were sent. Nothing is deleted. Fresh databases get the column from schema.sql and don't need this.
-- Run it a second time and the first line says "duplicate column name: lvl": that means it is already done.
ALTER TABLE runs ADD COLUMN lvl TEXT NOT NULL DEFAULT 'normal';
CREATE INDEX IF NOT EXISTS runs_lvl ON runs (era, lvl, track, laps, time_ms);
