"use client"
import { useEffect, useState } from 'react'

const TARGET = 68
const BARS = [45, 70, 55, 90, 35, 80, 60]
const DAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']
const GOALS = [['Terminer le module Valider son idée', true], ['Réussir le quiz sur l’offre', true], ['Rédiger sa page de vente', false], ['Publier son premier produit', false]]

export default function Suivi({ first = true, title = 'Voyez votre progression', text = 'Chaque leçon terminée fait avancer votre parcours. Vos objectifs restent toujours visibles.' }) {
  const [on, setOn] = useState(false)
  const [pct, setPct] = useState(0)
  useEffect(() => {
    const s = setTimeout(() => setOn(true), 80)
    let n = 0
    const t = setInterval(() => { n++; setPct(n); if (n >= TARGET) clearInterval(t) }, 1800 / TARGET)
    return () => { clearTimeout(s); clearInterval(t) }
  }, [])
  return (
    <section id="suivi" className={first ? 'first' : ''}>
      <div className="head"><h2>{title}</h2><p>{text}</p></div>
      <div className="dash">
        <div className="box glass">
          <div className="ring">
            <svg viewBox="0 0 200 200"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#7db1ff" /><stop offset="1" stopColor="#1f6bff" /></linearGradient></defs>
              <circle className="tr" cx="100" cy="100" r="88" />
              <circle className="pg" cx="100" cy="100" r="88" style={{ strokeDashoffset: on ? 553 * (1 - TARGET / 100) : 553 }} /></svg>
            <div className="n"><b>{pct}%</b><span>du parcours</span></div>
          </div>
          <p className="note" style={{ textAlign: 'center' }}>Exemple d’aperçu de votre espace</p>
        </div>
        <div className="box glass"><h4>Objectifs de la semaine</h4>
          <ul className="goals">{GOALS.map(([g, ok]) => <li key={g} className={ok ? 'ok' : ''}>{g}</li>)}</ul></div>
        <div className="box glass wide"><h4>Temps d’étude cette semaine</h4>
          <div className="bars">{BARS.map((h, i) => <div key={i} style={{ height: on ? h + '%' : 0 }} />)}</div>
          <div className="days">{DAYS.map((d) => <span key={d}>{d}</span>)}</div></div>
      </div>
    </section>
  )
}
