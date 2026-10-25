export const xof = (n) =>
  new Intl.NumberFormat('fr-FR').format(Math.round(Number(n) || 0)).replace(/[  ]/g, ' ') + ' FCFA'
export const num = (n) => new Intl.NumberFormat('fr-FR').format(Math.round(Number(n) || 0)).replace(/[  ]/g, ' ')
const D = (s) => new Date(`${String(s).slice(0, 10)}T12:00:00Z`)
export const day = (s) => D(s).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', timeZone: 'UTC' })
export const dayLong = (s) => D(s).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' })
export const weekday = (s) => D(s).toLocaleDateString('fr-FR', { weekday: 'short', timeZone: 'UTC' })
export const dec = (n, d = 2) => Number(n).toFixed(d).replace('.', ',')
export const ratio = (a, b) => (b > 0 ? a / b : null)
export const pct = (a, b) => (b > 0 ? Math.round((a / b) * 100) : null)
// Variation en % entre la valeur actuelle et la précédente (null si pas de base de comparaison)
export const delta = (cur, prev) => (prev > 0 ? Math.round(((cur - prev) / prev) * 100) : null)
