-- The Winner School : schéma PostgreSQL
-- Usage : psql "$DATABASE_URL" -f schema.sql


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
  id            SERIAL PRIMARY KEY,
  slug          VARCHAR(100) NOT NULL UNIQUE,      -- /formations/[formation]
  title         VARCHAR(200) NOT NULL,
  subtitle      TEXT,
  description   TEXT,
  cover_image   TEXT,
  cover_video   TEXT,
  price_xof     INTEGER NOT NULL DEFAULT 0,        -- prix en FCFA
  level         VARCHAR(20) DEFAULT 'debutant' CHECK (level IN ('debutant', 'intermediaire', 'avance')),
  position      INTEGER NOT NULL DEFAULT 0,        -- ordre d'affichage des cartes
  is_published  BOOLEAN NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
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

-- ========== PARCOURS (regroupement de formations) ==========
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
  duration_days INTEGER,                           -- NULL = accès à vie
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
  method       VARCHAR(30),                        -- orange_money, moov_money, wave, carte...
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

-- ========== DONNÉES DE DÉPART : les 6 cartes Formations ==========
INSERT INTO formations (slug, title, position, is_published) VALUES
  ('creer-un-ebook-qui-se-vend',   'Créer un ebook qui se vend',   1, TRUE),
  ('lancer-sa-formation-en-ligne', 'Lancer sa formation en ligne', 2, TRUE),
  ('templates-et-modeles-a-vendre','Templates et modèles à vendre',3, TRUE),
  ('page-de-vente-qui-convertit',  'Une page de vente qui convertit',4, TRUE),
  ('encaisser-en-ligne',           'Encaisser en ligne',           5, TRUE),
  ('marketing-sur-les-reseaux',    'Marketing sur les réseaux',    6, TRUE)
ON CONFLICT (slug) DO NOTHING;