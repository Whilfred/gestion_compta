// Côté serveur : réglages de la boutique
import { query } from './db'

const DEFAULT_PAYMENTS = ['Espèces', 'Orange Money', 'Moov Money', 'Wave', 'Virement']

// Réglages de la boutique (lus par tous les comptes du commerçant, modifiés par le propriétaire seulement)
export async function loadSettings(uid) {
  const { rows } = await query(
    `SELECT name, goal_monthly_xof AS goal, goal_profit_monthly_xof AS "goalProfit", theme, accent, density,
            font_size AS "fontSize", low_stock_threshold AS threshold, hide_figures AS "hideFigures", payment_methods AS "paymentMethods"
       FROM shops WHERE user_id = $1`, [uid])
  return rows[0] || { name: '', goal: 0, goalProfit: 0, theme: 'dark', accent: '#4c8dff', density: 'normal', fontSize: 'normal', threshold: 3, hideFigures: false, paymentMethods: DEFAULT_PAYMENTS }
}
