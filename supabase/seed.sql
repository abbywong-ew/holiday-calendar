-- ============================================================
-- Malaysian Holiday Calendar — Seed Data
-- Run this SECOND in the Supabase SQL Editor (after schema.sql)
-- ============================================================

-- ── States ───────────────────────────────────────────────────
INSERT INTO states (id, name, weekend_days) VALUES
  ('johor',          'Johor',                              ARRAY['saturday','sunday']),
  ('kedah',          'Kedah',                              ARRAY['friday','saturday']),
  ('kelantan',       'Kelantan',                           ARRAY['friday','saturday']),
  ('melaka',         'Melaka',                             ARRAY['saturday','sunday']),
  ('negeri_sembilan','Negeri Sembilan',                    ARRAY['saturday','sunday']),
  ('pahang',         'Pahang',                             ARRAY['saturday','sunday']),
  ('penang',         'Penang',                             ARRAY['saturday','sunday']),
  ('perak',          'Perak',                              ARRAY['saturday','sunday']),
  ('perlis',         'Perlis',                             ARRAY['friday','saturday']),
  ('sabah',          'Sabah',                              ARRAY['saturday','sunday']),
  ('sarawak',        'Sarawak',                            ARRAY['saturday','sunday']),
  ('selangor',       'Selangor',                           ARRAY['saturday','sunday']),
  ('terengganu',     'Terengganu',                         ARRAY['friday','saturday']),
  ('wp_kl',          'Wilayah Persekutuan Kuala Lumpur',   ARRAY['saturday','sunday']),
  ('wp_labuan',      'Wilayah Persekutuan Labuan',         ARRAY['friday','saturday']),
  ('wp_putrajaya',   'Wilayah Persekutuan Putrajaya',      ARRAY['saturday','sunday']);

-- ── Holidays (base rows) ─────────────────────────────────────
INSERT INTO holidays (id, name, type, date_type, fixed_month, fixed_day) VALUES
  -- Fixed national holidays
  ('new-year',          'New Year''s Day',              'national', 'fixed',    1,  1),
  ('labour-day',        'Labour Day',                   'national', 'fixed',    5,  1),
  ('national-day',      'National Day',                 'national', 'fixed',    8, 31),
  ('malaysia-day',      'Malaysia Day',                 'national', 'fixed',    9, 16),
  ('christmas',         'Christmas Day',                'national', 'fixed',   12, 25),
  -- Variable national holidays
  ('cny-d1',            'Chinese New Year Day 1',       'national', 'variable', NULL, NULL),
  ('cny-d2',            'Chinese New Year Day 2',       'national', 'variable', NULL, NULL),
  ('wesak',             'Wesak Day',                    'national', 'variable', NULL, NULL),
  ('agong-bday',        'Agong''s Birthday',            'national', 'variable', NULL, NULL),
  ('hari-raya-d1',      'Hari Raya Puasa Day 1',        'national', 'variable', NULL, NULL),
  ('hari-raya-d2',      'Hari Raya Puasa Day 2',        'national', 'variable', NULL, NULL),
  ('hari-raya-haji',    'Hari Raya Haji',               'national', 'variable', NULL, NULL),
  ('awal-muharam',      'Awal Muharam',                 'national', 'variable', NULL, NULL),
  ('prophet-bday',      'Prophet Muhammad''s Birthday', 'national', 'variable', NULL, NULL),
  -- Variable state holidays
  ('thaipusam',         'Thaipusam',                    'state',    'variable', NULL, NULL),
  ('nuzul-al-quran',    'Nuzul Al-Quran',               'state',    'variable', NULL, NULL),
  ('perak-sultan-bday', 'Perak Sultan''s Birthday',     'state',    'variable', NULL, NULL),
  ('deepavali',         'Deepavali',                    'state',    'variable', NULL, NULL);

-- ── Holiday ↔ State assignments ──────────────────────────────
-- All-states holidays (national fixed)
INSERT INTO holiday_states (holiday_id, state_id)
SELECT h.id, s.id FROM holidays h CROSS JOIN states s
WHERE h.id IN ('new-year','labour-day','national-day','malaysia-day','christmas',
               'cny-d1','cny-d2','wesak','agong-bday',
               'hari-raya-d1','hari-raya-d2','hari-raya-haji',
               'awal-muharam','prophet-bday');

-- Thaipusam: Perak, Selangor, Penang, WP KL
INSERT INTO holiday_states (holiday_id, state_id) VALUES
  ('thaipusam', 'perak'),
  ('thaipusam', 'selangor'),
  ('thaipusam', 'penang'),
  ('thaipusam', 'wp_kl');

-- Nuzul Al-Quran: Perak only
INSERT INTO holiday_states (holiday_id, state_id) VALUES
  ('nuzul-al-quran', 'perak');

-- Perak Sultan's Birthday: Perak only
INSERT INTO holiday_states (holiday_id, state_id) VALUES
  ('perak-sultan-bday', 'perak');

-- Deepavali: all states except Kelantan & Terengganu
INSERT INTO holiday_states (holiday_id, state_id)
SELECT 'deepavali', id FROM states
WHERE id NOT IN ('kelantan', 'terengganu');

-- ── Variable dates (2026 seed) ────────────────────────────────
INSERT INTO holiday_variable_dates (holiday_id, year, date) VALUES
  ('cny-d1',            '2026', '2026-02-17'),
  ('cny-d2',            '2026', '2026-02-18'),
  ('wesak',             '2026', '2026-05-31'),
  ('agong-bday',        '2026', '2026-06-01'),
  ('hari-raya-d1',      '2026', '2026-03-21'),
  ('hari-raya-d2',      '2026', '2026-03-22'),
  ('hari-raya-haji',    '2026', '2026-05-27'),
  ('awal-muharam',      '2026', '2026-06-17'),
  ('prophet-bday',      '2026', '2026-08-25'),
  ('thaipusam',         '2026', '2026-02-01'),
  ('nuzul-al-quran',    '2026', '2026-03-07'),
  ('perak-sultan-bday', '2026', '2026-11-06'),
  ('deepavali',         '2026', '2026-11-08');

-- ── Year config (2020–2030, all enabled) ─────────────────────
INSERT INTO year_config (year, enabled) VALUES
  ('2020', TRUE), ('2021', TRUE), ('2022', TRUE), ('2023', TRUE),
  ('2024', TRUE), ('2025', TRUE), ('2026', TRUE), ('2027', TRUE),
  ('2028', TRUE), ('2029', TRUE), ('2030', TRUE);
