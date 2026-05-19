-- ============================================================
-- Malaysian Holiday Calendar — Supabase Schema
-- Run this FIRST in the Supabase SQL Editor
-- ============================================================

-- Drop existing tables if re-running (safe order due to FK deps)
DROP TABLE IF EXISTS holiday_variable_dates CASCADE;
DROP TABLE IF EXISTS holiday_states CASCADE;
DROP TABLE IF EXISTS holidays CASCADE;
DROP TABLE IF EXISTS states CASCADE;
DROP TABLE IF EXISTS year_config CASCADE;

-- ── States ───────────────────────────────────────────────────
CREATE TABLE states (
  id           TEXT PRIMARY KEY,
  name         TEXT NOT NULL,
  weekend_days TEXT[] NOT NULL DEFAULT '{}'
);

-- ── Holidays ─────────────────────────────────────────────────
CREATE TABLE holidays (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  type        TEXT NOT NULL CHECK (type IN ('national', 'state')),
  date_type   TEXT NOT NULL CHECK (date_type IN ('fixed', 'variable')),
  fixed_month INTEGER,
  fixed_day   INTEGER
);

-- ── Holiday ↔ State (many-to-many) ───────────────────────────
CREATE TABLE holiday_states (
  holiday_id TEXT NOT NULL REFERENCES holidays(id) ON DELETE CASCADE,
  state_id   TEXT NOT NULL REFERENCES states(id)   ON DELETE CASCADE,
  PRIMARY KEY (holiday_id, state_id)
);

-- ── Variable dates per holiday per year ──────────────────────
CREATE TABLE holiday_variable_dates (
  holiday_id TEXT NOT NULL REFERENCES holidays(id) ON DELETE CASCADE,
  year       TEXT NOT NULL,
  date       TEXT NOT NULL,
  PRIMARY KEY (holiday_id, year)
);

-- ── Enabled years ────────────────────────────────────────────
CREATE TABLE year_config (
  year    TEXT    PRIMARY KEY,
  enabled BOOLEAN NOT NULL DEFAULT TRUE
);

-- ── Enable Row Level Security (read-only public access) ──────
ALTER TABLE states                ENABLE ROW LEVEL SECURITY;
ALTER TABLE holidays              ENABLE ROW LEVEL SECURITY;
ALTER TABLE holiday_states        ENABLE ROW LEVEL SECURITY;
ALTER TABLE holiday_variable_dates ENABLE ROW LEVEL SECURITY;
ALTER TABLE year_config           ENABLE ROW LEVEL SECURITY;

-- Allow anonymous reads
CREATE POLICY "Public read states"                 ON states                 FOR SELECT USING (true);
CREATE POLICY "Public read holidays"               ON holidays               FOR SELECT USING (true);
CREATE POLICY "Public read holiday_states"         ON holiday_states         FOR SELECT USING (true);
CREATE POLICY "Public read holiday_variable_dates" ON holiday_variable_dates FOR SELECT USING (true);
CREATE POLICY "Public read year_config"            ON year_config            FOR SELECT USING (true);
