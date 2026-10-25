-- Suivi des étudiants : profil, revenus, dépenses pub, calls
-- Usage : psql -U postgres -d winner_school -f migration-admin.sql

CREATE TABLE IF NOT EXISTS student_profiles (
  user_id    UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  niche      VARCHAR(120),
  product    VARCHAR(200),
  goal_xof   INTEGER NOT NULL DEFAULT 0,
  status     VARCHAR(20) NOT NULL DEFAULT 'actif' CHECK (status IN ('actif', 'pause', 'termine', 'abandon')),
  notes      TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS student_revenues (
  id         SERIAL PRIMARY KEY,
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount_xof INTEGER NOT NULL CHECK (amount_xof > 0),
  source     VARCHAR(100),
  note       VARCHAR(500),
  earned_on  DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_revenues_user ON student_revenues(user_id, earned_on);

CREATE TABLE IF NOT EXISTS ad_spends (
  id         SERIAL PRIMARY KEY,
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount_xof INTEGER NOT NULL CHECK (amount_xof > 0),
  platform   VARCHAR(50),
  note       VARCHAR(500),
  spent_on   DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_ads_user ON ad_spends(user_id, spent_on);

CREATE TABLE IF NOT EXISTS calls (
  id               SERIAL PRIMARY KEY,
  user_id          UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  scheduled_at     TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 30,
  topic            VARCHAR(200),
  meeting_url      TEXT,
  status           VARCHAR(20) NOT NULL DEFAULT 'prevu' CHECK (status IN ('prevu', 'fait', 'annule', 'absent')),
  notes            TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_calls_user ON calls(user_id, scheduled_at);
CREATE INDEX IF NOT EXISTS idx_calls_date ON calls(scheduled_at);
