-- Compta Ecom : mise Ã  jour (charges par produit, clients, utilisateurs, alertes, rÃ©glages)
-- Ã€ lancer UNE FOIS aprÃ¨s schema.sql :  psql "$DATABASE_URL" -f migration-compta.sql
-- Le script est rejouable sans risque.

-- ===== Utilisateurs : sous-comptes (employÃ©s) rattachÃ©s Ã  un commerÃ§ant + restrictions =====
ALTER TABLE users ADD COLUMN IF NOT EXISTS owner_id    UUID REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS permissions JSONB NOT NULL DEFAULT '{}';
CREATE INDEX IF NOT EXISTS idx_users_owner ON users(owner_id);

-- ===== RÃ©glages de la boutique =====
ALTER TABLE shops ADD COLUMN IF NOT EXISTS goal_profit_monthly_xof INTEGER NOT NULL DEFAULT 0 CHECK (goal_profit_monthly_xof >= 0);
ALTER TABLE shops ADD COLUMN IF NOT EXISTS theme                VARCHAR(10) NOT NULL DEFAULT 'dark';
ALTER TABLE shops ADD COLUMN IF NOT EXISTS accent               VARCHAR(9)  NOT NULL DEFAULT '#4c8dff';
ALTER TABLE shops ADD COLUMN IF NOT EXISTS density              VARCHAR(10) NOT NULL DEFAULT 'normal';
ALTER TABLE shops ADD COLUMN IF NOT EXISTS font_size            VARCHAR(10) NOT NULL DEFAULT 'normal';
ALTER TABLE shops ADD COLUMN IF NOT EXISTS low_stock_threshold  INTEGER NOT NULL DEFAULT 3 CHECK (low_stock_threshold >= 0);
ALTER TABLE shops ADD COLUMN IF NOT EXISTS hide_figures         BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE shops ADD COLUMN IF NOT EXISTS payment_methods      JSONB NOT NULL DEFAULT '["EspÃ¨ces","Orange Money","Moov Money","Wave","Virement"]';

-- ===== Ventes : tÃ©lÃ©phone client, moyen de paiement, statuts de livraison =====
ALTER TABLE sales ADD COLUMN IF NOT EXISTS customer_phone VARCHAR(30);
ALTER TABLE sales ADD COLUMN IF NOT EXISTS payment_method VARCHAR(60);
ALTER TABLE sales DROP CONSTRAINT IF EXISTS sales_status_check;
ALTER TABLE sales ADD CONSTRAINT sales_status_check
  CHECK (status IN ('en_attente', 'en_cours', 'livree', 'non_livree', 'retour'));
CREATE INDEX IF NOT EXISTS idx_sales_customer ON sales(user_id, customer_phone);
CREATE INDEX IF NOT EXISTS idx_sales_product  ON sales(product_id);

-- ===== Pub et charges rattachables Ã  UN produit (NULL = charge indÃ©pendante) =====
ALTER TABLE ad_spends ADD COLUMN IF NOT EXISTS product_id INTEGER REFERENCES products(id) ON DELETE RESTRICT;
ALTER TABLE expenses  ADD COLUMN IF NOT EXISTS product_id INTEGER REFERENCES products(id) ON DELETE RESTRICT;
CREATE INDEX IF NOT EXISTS idx_ads_product ON ad_spends(product_id);
CREATE INDEX IF NOT EXISTS idx_exp_product ON expenses(product_id);

-- ===== Notifications (alertes de stock) =====
CREATE TABLE IF NOT EXISTS notifications (
  id         SERIAL PRIMARY KEY,
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,   -- le commerÃ§ant propriÃ©taire
  kind       VARCHAR(30) NOT NULL DEFAULT 'stock',
  product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
  message    VARCHAR(300) NOT NULL,
  is_read    BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_notif_user ON notifications(user_id, is_read, created_at DESC);
-- une seule alerte non lue par produit
CREATE UNIQUE INDEX IF NOT EXISTS uq_notif_open ON notifications(user_id, product_id, kind) WHERE NOT is_read;
