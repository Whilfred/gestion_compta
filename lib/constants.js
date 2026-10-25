// Listes partagées client / serveur. Les noms de canaux de vente et de plateformes pub
// sont identiques pour pouvoir calculer le ROAS par canal.
export const SOURCES = ['Facebook', 'Instagram', 'TikTok', 'WhatsApp', 'Google', 'Snapchat', 'Site web', 'Boutique', 'Bouche-à-oreille', 'Autre']
export const PLATFORMS = ['Facebook', 'Instagram', 'TikTok', 'Google', 'Snapchat', 'Autre']
export const CATEGORIES = ['Déplacement', 'Livraison', 'Emballage', 'Transport', 'Commission', 'Loyer', 'Salaires', 'Outils & abonnements', 'Mobile money (frais)', 'Autre']

// Statuts d'une vente. Les statuts « annulés » ne comptent ni dans le chiffre d'affaires ni dans le stock vendu.
export const STATUS = { en_attente: 'En attente', en_cours: 'En cours d’expédition', livree: 'Livrée', non_livree: 'Non livrée', retour: 'Retour' }
export const CANCELED = ['retour', 'non_livree']

export const PERIODS = [
  ['today', 'Aujourd’hui'],
  ['yesterday', 'Hier'],
  ['7d', '7 jours'],
  ['30d', '30 jours'],
  ['month', 'Ce mois'],
]

// Rubriques sur lesquelles on peut restreindre un utilisateur
export const SECTIONS = {
  dashboard: 'Vue d’ensemble',
  ventes: 'Ventes',
  produits: 'Produits & stock',
  clients: 'Clients',
  publicite: 'Publicité',
  charges: 'Charges',
}
export const LEVELS = { none: 'Aucun accès', view: 'Lecture seule', edit: 'Lecture + modification' }
export const ACCENTS = ['#4c8dff', '#34d399', '#f5b73d', '#ff6b7a', '#a78bfa', '#f472b6', '#22d3ee', '#f97316']

// perms = { ventes: 'edit', ..., delete: true }
export const can = (perms, section, level = 'view') => {
  const have = perms?.[section] || 'none'
  return level === 'view' ? have !== 'none' : have === 'edit'
}
