-- Espace étudiant : saisies détaillées (livres vendus, prospects, autres charges, infos produit)
-- À exécuter APRÈS schema.sql et migration-admin.sql
-- Usage : psql "$DATABASE_URL" -f migration-espace.sql

-- Nombre de livres / produits vendus sur chaque vente
ALTER TABLE student_revenues ADD COLUMN IF NOT EXISTS units INTEGER NOT NULL DEFAULT 0 CHECK (units >= 0);

-- Prospects (leads) générés par chaque dépense publicitaire
ALTER TABLE ad_spends ADD COLUMN IF NOT EXISTS leads INTEGER NOT NULL DEFAULT 0 CHECK (leads >= 0);

-- Autres charges : outils, design, frais de paiement, production...
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

-- Infos produit renseignées par l'étudiant
ALTER TABLE student_profiles
  ADD COLUMN IF NOT EXISTS price_xof INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS channel   VARCHAR(60),
  ADD COLUMN IF NOT EXISTS sales_url TEXT;
