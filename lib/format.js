export const xof = (n) =>
  new Intl.NumberFormat('fr-FR').format(Math.round(Number(n) || 0)).replace(/[\u202f\u00a0]/g, ' ') + ' FCFA'
export const day = (d) => new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
export const dt = (d) => new Date(d).toLocaleString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
export const hm = (d) => new Date(d).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
export const roi = (profit, spend) => (spend > 0 ? Math.round((profit / spend) * 100) : null)
export const pct = (a, b) => (b > 0 ? Math.round((a / b) * 100) : null)
