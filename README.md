# Compta Ecom

Gestion comptable pour e-commerçants de produits physiques (FCFA). Next.js 14 + PostgreSQL.

## Démarrage
    cp .env.example .env.local      # mets l'URL d'une NOUVELLE base PostgreSQL
    npm install
    npm run db:init                 # crée les tables (schema.sql)
    npm run dev                     # http://localhost:3000

Données de démo (35 jours de ventes, pub, charges) :

    DATABASE_URL=... npm run db:demo   # demo@compta-ecom.test / demo12345

## Pages
/dashboard (aujourd'hui, hier, 7 j, 30 j, mois) · /dashboard/ventes · /produits · /publicite · /charges · /parametres

Fuseau des « jours » : `SHOP_TZ` (défaut Africa/Ouagadougou).
