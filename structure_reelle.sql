CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ========== UTILISATEURS ==========
CREATE TABLE IF NOT EXISTS users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name     VARCHAR(120) NOT NULL,
  email         VARCHAR(255) NOT NULL UNIQUE,
  phone         VARCHAR(30),
  password_hash TEXT NOT NULL,
  role          VARCHAR(20) NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'admin')),
  avatar_url    TEXT,
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sessions (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);

-- ========== FORMATIONS ==========
CREATE TABLE IF NOT EXISTS formations (
  id           SERIAL PRIMARY KEY,
  slug         VARCHAR(100) NOT NULL UNIQUE,
  title        VARCHAR(200) NOT NULL,
  subtitle     TEXT,
  description  TEXT,
  cover_image  TEXT,
  cover_video  TEXT,
  price_xof    INTEGER NOT NULL DEFAULT 0,
  level        VARCHAR(20) DEFAULT 'debutant' CHECK (level IN ('debutant', 'intermediaire', 'avance')),
  position     INTEGER NOT NULL DEFAULT 0,
  is_published BOOLEAN NOT NULL DEFAULT FALSE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS modules (
  id           SERIAL PRIMARY KEY,
  formation_id INTEGER NOT NULL REFERENCES formations(id) ON DELETE CASCADE,
  title        VARCHAR(200) NOT NULL,
  position     INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_modules_formation ON modules(formation_id);

CREATE TABLE IF NOT EXISTS lessons (
  id               SERIAL PRIMARY KEY,
  module_id        INTEGER NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  title            VARCHAR(200) NOT NULL,
  content          TEXT,
  video_url        TEXT,
  duration_minutes INTEGER,
  position         INTEGER NOT NULL DEFAULT 0,
  is_free_preview  BOOLEAN NOT NULL DEFAULT FALSE
);
CREATE INDEX IF NOT EXISTS idx_lessons_module ON lessons(module_id);

-- ========== PARCOURS ==========
CREATE TABLE IF NOT EXISTS paths (
  id          SERIAL PRIMARY KEY,
  slug        VARCHAR(100) NOT NULL UNIQUE,
  title       VARCHAR(200) NOT NULL,
  description TEXT,
  position    INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS path_formations (
  path_id      INTEGER NOT NULL REFERENCES paths(id) ON DELETE CASCADE,
  formation_id INTEGER NOT NULL REFERENCES formations(id) ON DELETE CASCADE,
  position     INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (path_id, formation_id)
);

-- ========== TARIFS ==========
CREATE TABLE IF NOT EXISTS plans (
  id            SERIAL PRIMARY KEY,
  slug          VARCHAR(50) NOT NULL UNIQUE,
  name          VARCHAR(100) NOT NULL,
  price_xof     INTEGER NOT NULL,
  duration_days INTEGER,
  features      JSONB NOT NULL DEFAULT '[]',
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  position      INTEGER NOT NULL DEFAULT 0
);

-- ========== INSCRIPTIONS & SUIVI ==========
CREATE TABLE IF NOT EXISTS enrollments (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  formation_id INTEGER NOT NULL REFERENCES formations(id) ON DELETE CASCADE,
  plan_id      INTEGER REFERENCES plans(id),
  status       VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  enrolled_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  UNIQUE (user_id, formation_id)
);
CREATE INDEX IF NOT EXISTS idx_enrollments_user ON enrollments(user_id);

CREATE TABLE IF NOT EXISTS lesson_progress (
  user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  lesson_id    INTEGER NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  completed    BOOLEAN NOT NULL DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  PRIMARY KEY (user_id, lesson_id)
);

-- ========== PAIEMENTS ==========
CREATE TABLE IF NOT EXISTS payments (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  formation_id INTEGER REFERENCES formations(id) ON DELETE SET NULL,
  plan_id      INTEGER REFERENCES plans(id) ON DELETE SET NULL,
  amount_xof   INTEGER NOT NULL,
  method       VARCHAR(30),
  provider_ref VARCHAR(120),
  status       VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed', 'refunded')),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  paid_at      TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_payments_user ON payments(user_id);

-- ========== CONTACT ==========
CREATE TABLE IF NOT EXISTS contact_messages (
  id         SERIAL PRIMARY KEY,
  name       VARCHAR(120) NOT NULL,
  email      VARCHAR(255) NOT NULL,
  subject    VARCHAR(200),
  message    TEXT NOT NULL,
  is_read    BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ========== SUIVI DES ETUDIANTS ==========
CREATE TABLE IF NOT EXISTS student_profiles (
  user_id    UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  niche      VARCHAR(120),
  product    VARCHAR(200),
  goal_xof   INTEGER NOT NULL DEFAULT 0,
  status     VARCHAR(20) NOT NULL DEFAULT 'actif' CHECK (status IN ('actif', 'pause', 'termine', 'abandon')),
  notes      TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  price_xof  INTEGER NOT NULL DEFAULT 0,
  channel    VARCHAR(60),
  sales_url  TEXT
);

CREATE TABLE IF NOT EXISTS student_revenues (
  id         SERIAL PRIMARY KEY,
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount_xof INTEGER NOT NULL CHECK (amount_xof > 0),
  source     VARCHAR(100),
  note       VARCHAR(500),
  earned_on  DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  units      INTEGER NOT NULL DEFAULT 0 CHECK (units >= 0)
);
CREATE INDEX IF NOT EXISTS idx_revenues_user ON student_revenues(user_id, earned_on);

CREATE TABLE IF NOT EXISTS ad_spends (
  id         SERIAL PRIMARY KEY,
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount_xof INTEGER NOT NULL CHECK (amount_xof > 0),
  platform   VARCHAR(50),
  note       VARCHAR(500),
  spent_on   DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  leads      INTEGER NOT NULL DEFAULT 0 CHECK (leads >= 0)
);
CREATE INDEX IF NOT EXISTS idx_ads_user ON ad_spends(user_id, spent_on);

CREATE TABLE IF NOT EXISTS student_expenses (
  id         SERIAL PRIMARY KEY,
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount_xof INTEGER NOT NULL CHECK (amount_xof > 0),
  label      VARCHAR(100),
  note       VARCHAR(500),
  spent_on   DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_expenses_user ON student_expenses(user_id, spent_on);

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

-- Compta Ecom : gestion comptable pour e-commercants de produits physiques (FCFA)
-- Usage : psql "$DATABASE_URL" -f schema.sql   (sur une base vide)

CREATE TABLE IF NOT EXISTS users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name     VARCHAR(120) NOT NULL,
  email         VARCHAR(255) NOT NULL UNIQUE,
  phone         VARCHAR(30),
  password_hash TEXT NOT NULL,
  role          VARCHAR(20) NOT NULL DEFAULT 'merchant',
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sessions (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);

-- Boutique du commercant (nom, objectif mensuel)
CREATE TABLE IF NOT EXISTS shops (
  user_id          UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  name             VARCHAR(120),
  goal_monthly_xof INTEGER NOT NULL DEFAULT 0 CHECK (goal_monthly_xof >= 0),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Catalogue : prix d'achat (cout), prix de vente, stock
CREATE TABLE IF NOT EXISTS products (
  id         SERIAL PRIMARY KEY,
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name       VARCHAR(150) NOT NULL,
  sku        VARCHAR(50),
  cost_xof   INTEGER NOT NULL DEFAULT 0 CHECK (cost_xof >= 0),
  price_xof  INTEGER NOT NULL DEFAULT 0 CHECK (price_xof >= 0),
  stock      INTEGER NOT NULL DEFAULT 0,
  is_active  BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_products_user ON products(user_id);

-- Ventes : le prix et le cout sont figes au moment de la vente
CREATE TABLE IF NOT EXISTS sales (
  id             SERIAL PRIMARY KEY,
  user_id        UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id     INTEGER REFERENCES products(id) ON DELETE SET NULL,
  product_name   VARCHAR(150) NOT NULL,
  quantity       INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  unit_price_xof INTEGER NOT NULL CHECK (unit_price_xof >= 0),
  unit_cost_xof  INTEGER NOT NULL DEFAULT 0 CHECK (unit_cost_xof >= 0),
  source         VARCHAR(60),                       -- d'ou vient la vente (Facebook, WhatsApp, boutique...)
  customer       VARCHAR(120),
  status         VARCHAR(20) NOT NULL DEFAULT 'livree' CHECK (status IN ('livree', 'en_attente', 'retour')),
  note           VARCHAR(500),
  sold_on        DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_sales_user_date ON sales(user_id, sold_on);

-- Depenses publicitaires
CREATE TABLE IF NOT EXISTS ad_spends (
  id         SERIAL PRIMARY KEY,
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  platform   VARCHAR(60),
  amount_xof INTEGER NOT NULL CHECK (amount_xof > 0),
  leads      INTEGER NOT NULL DEFAULT 0 CHECK (leads >= 0),   -- messages / prospects generes
  note       VARCHAR(500),
  spent_on   DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_ads_user_date ON ad_spends(user_id, spent_on);

-- Autres charges : livraison, emballage, loyer, salaires, outils...
CREATE TABLE IF NOT EXISTS expenses (
  id         SERIAL PRIMARY KEY,
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category   VARCHAR(60),
  label      VARCHAR(150),
  amount_xof INTEGER NOT NULL CHECK (amount_xof > 0),
  note       VARCHAR(500),
  spent_on   DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_expenses_user_date ON expenses(user_id, spent_on);

ALTER TABLE users ADD CONSTRAINT users_role_check
  CHECK (role IN ('owner', 'admin', 'staff', 'student'));
