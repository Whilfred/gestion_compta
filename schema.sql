-- Compta Ecom : gestion comptable pour e-commerçants de produits physiques (FCFA)
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

-- Boutique du commerçant (nom, objectif mensuel)
CREATE TABLE IF NOT EXISTS shops (
  user_id          UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  name             VARCHAR(120),
  goal_monthly_xof INTEGER NOT NULL DEFAULT 0 CHECK (goal_monthly_xof >= 0),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Catalogue : prix d'achat (coût), prix de vente, stock
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

-- Ventes : le prix et le coût sont figés au moment de la vente
CREATE TABLE IF NOT EXISTS sales (
  id             SERIAL PRIMARY KEY,
  user_id        UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id     INTEGER REFERENCES products(id) ON DELETE SET NULL,
  product_name   VARCHAR(150) NOT NULL,
  quantity       INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  unit_price_xof INTEGER NOT NULL CHECK (unit_price_xof >= 0),
  unit_cost_xof  INTEGER NOT NULL DEFAULT 0 CHECK (unit_cost_xof >= 0),
  source         VARCHAR(60),                       -- d'où vient la vente (Facebook, WhatsApp, boutique...)
  customer       VARCHAR(120),
  status         VARCHAR(20) NOT NULL DEFAULT 'livree' CHECK (status IN ('livree', 'en_attente', 'retour')),
  note           VARCHAR(500),
  sold_on        DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_sales_user_date ON sales(user_id, sold_on);

-- Dépenses publicitaires
CREATE TABLE IF NOT EXISTS ad_spends (
  id         SERIAL PRIMARY KEY,
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  platform   VARCHAR(60),
  amount_xof INTEGER NOT NULL CHECK (amount_xof > 0),
  leads      INTEGER NOT NULL DEFAULT 0 CHECK (leads >= 0),   -- messages / prospects générés
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
