-- ============================================================
-- Phase 1: School Holidays & Replacement Overrides
-- Run this in Supabase SQL Editor (after existing schema)
-- ============================================================

-- ── School Holidays ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS school_holidays (
  id         TEXT PRIMARY KEY,
  name       TEXT NOT NULL,
  start_date TEXT NOT NULL,
  end_date   TEXT NOT NULL,
  year       TEXT NOT NULL
);

-- ── School Holiday ↔ State (many-to-many) ───────────────────
CREATE TABLE IF NOT EXISTS school_holiday_states (
  school_holiday_id TEXT NOT NULL REFERENCES school_holidays(id) ON DELETE CASCADE,
  state_id          TEXT NOT NULL REFERENCES states(id) ON DELETE CASCADE,
  PRIMARY KEY (school_holiday_id, state_id)
);

-- ── Replacement Holiday Overrides ────────────────────────────
-- Stores only manual exceptions; auto-calc used when no row exists
CREATE TABLE IF NOT EXISTS holiday_replacement_overrides (
  holiday_id          TEXT NOT NULL REFERENCES holidays(id) ON DELETE CASCADE,
  state_id            TEXT NOT NULL REFERENCES states(id)   ON DELETE CASCADE,
  year                TEXT NOT NULL,
  original_date       TEXT NOT NULL,
  replacement_date    TEXT NOT NULL,
  PRIMARY KEY (holiday_id, state_id, year)
);

-- ── Enable Row Level Security ─────────────────────────────────
ALTER TABLE school_holidays               ENABLE ROW LEVEL SECURITY;
ALTER TABLE school_holiday_states         ENABLE ROW LEVEL SECURITY;
ALTER TABLE holiday_replacement_overrides ENABLE ROW LEVEL SECURITY;

-- Allow anonymous reads
CREATE POLICY "Public read school_holidays"               ON school_holidays               FOR SELECT USING (true);
CREATE POLICY "Public read school_holiday_states"         ON school_holiday_states         FOR SELECT USING (true);
CREATE POLICY "Public read holiday_replacement_overrides" ON holiday_replacement_overrides FOR SELECT USING (true);

-- ── Sample 2026 School Holidays (approximate — update with official dates) ──
INSERT INTO school_holidays (id, name, start_date, end_date, year) VALUES
  ('school-2026-midterm1', 'Mid-Term Break 1',   '2026-03-14', '2026-03-22', '2026'),
  ('school-2026-midyear',  'Mid-Year Break',      '2026-05-30', '2026-06-14', '2026'),
  ('school-2026-midterm2', 'Mid-Term Break 2',    '2026-08-08', '2026-08-16', '2026'),
  ('school-2026-yearend',  'Year-End Break',      '2026-11-14', '2027-01-03', '2026');

-- All states for each school holiday (national school calendar)
INSERT INTO school_holiday_states (school_holiday_id, state_id)
SELECT s.id AS school_holiday_id, st.id AS state_id
FROM (VALUES
  ('school-2026-midterm1'),
  ('school-2026-midyear'),
  ('school-2026-midterm2'),
  ('school-2026-yearend')
) AS s(id)
CROSS JOIN states st;
