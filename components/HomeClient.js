"use client"
// Parties interactives de la page d'accueil : apparition au défilement, onglets, simulateur, calculateur
import { useEffect, useRef, useState } from 'react'
import { xof } from '../lib/format'

// Fait apparaître le contenu quand il entre à l'écran
export function Reveal({ children, delay = 0, as: Tag = 'div', className = '' }) {
  const ref = useRef(null)
  const [on, setOn] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el || typeof IntersectionObserver === 'undefined') { setOn(true); return }
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setOn(true); io.disconnect() } }, { threshold: 0.12 })
    io.observe(el)
    return () => io.disconnect()
  }, [])
  return <Tag ref={ref} className={`lp-reveal ${on ? 'in' : ''} ${className}`} style={{ transitionDelay: `${delay}ms` }}>{children}</Tag>
}

const TABS = [
  ['add', '1 · Ajouter', 'Créez votre catalogue',
    'Pour chaque produit : prix d’achat, prix de vente, stock. Vous voyez tout de suite votre marge, et une alerte vous prévient avant la rupture.'],
  ['sell', '2 · Enregistrer', 'Notez vos ventes et vos dépenses',
    'Client, téléphone, moyen de paiement, état de la livraison. La pub et les charges (déplacement, emballage…) se rattachent à un produit, ou à toute la boutique.'],
  ['read', '3 · Analyser', 'Lisez votre vrai bénéfice',
    'Chiffre d’affaires, dépenses et bénéfice net, au total et produit par produit, avec comparaison à la période précédente.'],
]

function Mock({ id }) {
  if (id === 'add') return (
    <div className="lp-mock">
      <div className="lp-mrow"><b>Robe wax</b><span>achat 6 000 · vente 15 000</span><em className="ok">marge 9 000</em></div>
      <div className="lp-mrow"><b>Sac en cuir</b><span>achat 9 000 · vente 22 000</span><em className="ok">marge 13 000</em></div>
      <div className="lp-mrow"><b>Montre connectée</b><span>stock : 2</span><em className="warn">Stock bas</em></div>
    </div>
  )
  if (id === 'sell') return (
    <div className="lp-mock">
      <div className="lp-mrow"><b>Robe wax × 2</b><span>Awa · Orange Money</span><em className="ok">Livrée</em></div>
      <div className="lp-mrow"><b>Sac en cuir</b><span>Moussa · Wave</span><em className="info">En cours d’expédition</em></div>
      <div className="lp-mrow"><b>Déplacement à Bobo</b><span>charge · produit : Robe wax</span><em>− 3 000</em></div>
    </div>
  )
  return (
    <div className="lp-mock">
      <div className="lp-mrow"><b>Robe wax</b><span>CA 120 000 · achat 48 000 · pub 20 000</span><em className="ok">+ 52 000</em></div>
      <div className="lp-mrow"><b>Sac en cuir</b><span>CA 92 000 · achat 41 500 · pub 18 000</span><em className="ok">+ 32 500</em></div>
      <div className="lp-mrow total"><b>Bénéfice net</b><span>aujourd’hui</span><em className="ok">+ 84 500 FCFA</em></div>
    </div>
  )
}

export function HowItWorks() {
  const [tab, setTab] = useState('add')
  const cur = TABS.find((t) => t[0] === tab)
  return (
    <div className="lp-tabs">
      <div className="seg lp-seg" role="tablist" aria-label="Étapes">
        {TABS.map(([k, label]) => <button key={k} role="tab" aria-selected={tab === k} onClick={() => setTab(k)}>{label}</button>)}
      </div>
      <div className="lp-tabbody" key={tab}>
        <div><h3>{cur[2]}</h3><p>{cur[3]}</p></div>
        <Mock id={tab} />
      </div>
    </div>
  )
}

// Simulateur : seules les ventes « livrées » entrent dans le chiffre d'affaires
const ORDERS = [
  { name: 'Robe wax × 2', qty: 2, price: 15000, cost: 6000, status: 'livree' },
  { name: 'Sac en cuir', qty: 1, price: 22000, cost: 9000, status: 'en_cours' },
  { name: 'Montre connectée', qty: 1, price: 28000, cost: 12000, status: 'en_attente' },
  { name: 'Parfum 50 ml', qty: 1, price: 18000, cost: 7000, status: 'non_livree' },
]
const STATUS = { en_attente: 'En attente', en_cours: 'En cours d’expédition', livree: 'Livrée', non_livree: 'Non livrée', retour: 'Retour' }
const ADS = 5000, TRAVEL = 3000

export function Simulator() {
  const [st, setSt] = useState(ORDERS.map((o) => o.status))
  const done = ORDERS.filter((_, i) => st[i] === 'livree')
  const waiting = ORDERS.filter((_, i) => st[i] === 'en_attente' || st[i] === 'en_cours')
  const revenue = done.reduce((a, o) => a + o.qty * o.price, 0)
  const cogs = done.reduce((a, o) => a + o.qty * o.cost, 0)
  const net = revenue - cogs - (ADS + TRAVEL)
  const pending = waiting.reduce((a, o) => a + o.qty * o.price, 0)
  return (
    <div className="lp-sim">
      <ul className="lp-orders">
        {ORDERS.map((o, i) => (
          <li key={o.name} className={st[i] === 'livree' ? 'on' : ''}>
            <div><b>{o.name}</b><small>{xof(o.qty * o.price)}</small></div>
            <select value={st[i]} aria-label={`Statut de ${o.name}`} onChange={(e) => setSt((s) => s.map((v, j) => (j === i ? e.target.value : v)))}>
              {Object.entries(STATUS).map(([k, n]) => <option key={k} value={k}>{n}</option>)}
            </select>
          </li>
        ))}
        <li className="fixed"><div><b>Publicité</b><small>charge du produit</small></div><span>− {xof(ADS)}</span></li>
        <li className="fixed"><div><b>Déplacement</b><small>charge</small></div><span>− {xof(TRAVEL)}</span></li>
      </ul>
      <div className="lp-result">
        <span className="lp-lbl">Chiffre d’affaires (livré)</span>
        <div className="lp-big">{xof(revenue)}</div>
        <div className="lp-line"><span>Coût des produits livrés</span><b>{xof(cogs)}</b></div>
        <div className="lp-line"><span>Publicité + charges</span><b>{xof(ADS + TRAVEL)}</b></div>
        <div className="lp-line total"><span>Bénéfice net</span><b className={net < 0 ? 'neg' : 'pos'}>{net < 0 ? '− ' : ''}{xof(Math.abs(net))}</b></div>
        <p className="lp-hint">{pending > 0 ? `${xof(pending)} en attente de livraison : non compté tant que ce n’est pas livré.` : 'Passez une commande en « Livrée » pour la voir entrer dans votre chiffre d’affaires.'}</p>
      </div>
    </div>
  )
}

// Calculateur : bénéfice net d'un produit
export function Calculator() {
  const [v, setV] = useState({ cost: 6000, price: 15000, qty: 20, ads: 20000, extra: 5000 })
  const set = (k) => (e) => setV((s) => ({ ...s, [k]: Math.max(0, Number(e.target.value) || 0) }))
  const revenue = v.price * v.qty, cogs = v.cost * v.qty
  const net = revenue - cogs - v.ads - v.extra
  const unit = v.price - v.cost
  const breakeven = unit > 0 ? Math.ceil((v.ads + v.extra) / unit) : null
  const margin = revenue > 0 ? Math.round((net / revenue) * 100) : 0
  const F = ({ k, label }) => <label className="field"><span>{label}</span><input type="number" min="0" inputMode="numeric" value={v[k]} onChange={set(k)} /></label>
  return (
    <div className="lp-sim">
      <div className="lp-calc">
        <F k="cost" label="Prix d’achat (FCFA)" /><F k="price" label="Prix de vente (FCFA)" />
        <F k="qty" label="Quantité vendue (livrée)" /><F k="ads" label="Pub pour ce produit (FCFA)" />
        <F k="extra" label="Autres charges du produit (FCFA)" />
      </div>
      <div className="lp-result">
        <span className="lp-lbl">Bénéfice net du produit</span>
        <div className={`lp-big ${net < 0 ? 'neg' : 'pos'}`}>{net < 0 ? '− ' : ''}{xof(Math.abs(net))}</div>
        <div className="lp-line"><span>Chiffre d’affaires</span><b>{xof(revenue)}</b></div>
        <div className="lp-line"><span>Marge nette</span><b>{margin} %</b></div>
        <div className="lp-line"><span>Marge par unité (avant pub)</span><b>{xof(unit)}</b></div>
        <p className="lp-hint">{breakeven === null ? 'Votre prix de vente doit dépasser le prix d’achat.' : `Il faut vendre ${breakeven} unité${breakeven > 1 ? 's' : ''} pour couvrir la pub et les charges.`}</p>
      </div>
    </div>
  )
}
