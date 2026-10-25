"use client"
import { useState } from 'react'

const DATA = [
  { tab: 'Créer un produit', t: 'Créer un produit digital', d: 'Trouvez une idée qui répond à un vrai besoin, puis transformez-la en ebook, formation ou modèle prêt à vendre.', m: ['6 semaines', 'Débutant'],
    mods: [['Trouver et valider son idée', 'Public cible, problème à résoudre'], ['Choisir son format', 'Ebook, formation, templates'], ['Produire son contenu', 'Plan, rédaction, enregistrement'], ['Packager et fixer son prix', 'Présentation, offre, tarif']] },
  { tab: 'Vendre en ligne', t: 'Vendre en ligne', d: 'Mettez en place votre boutique, votre page de vente et vos moyens de paiement pour encaisser sans friction.', m: ['5 semaines', 'Débutant → Intermédiaire'],
    mods: [['Créer sa page de vente', 'Promesse, preuves, appel à l’action'], ['Choisir sa plateforme', 'Hébergement et livraison du produit'], ['Encaisser en ligne', 'Mobile money et carte bancaire'], ['Automatiser la livraison', 'Accès, e-mails de confirmation']] },
  { tab: 'Marketing et audience', t: 'Marketing et audience', d: 'Construisez une audience, donnez envie d’acheter et faites grandir vos ventes dans la durée.', m: ['8 semaines', 'Intermédiaire'],
    mods: [['Poser sa marque', 'Positionnement et image'], ['Créer du contenu qui attire', 'Réseaux sociaux, vidéo courte'], ['Bâtir une liste e-mail', 'Aimant à prospects, séquences'], ['Lancer et mesurer', 'Campagnes, chiffres clés']] },
]

export default function Parcours({ first = true }) {
  const [i, setI] = useState(0)
  const p = DATA[i]
  return (
    <section id="parcours" className={first ? 'first' : ''}>
      <div className="head"><h2>Du premier produit aux premières ventes</h2>
        <p>Choisissez votre objectif. The Winner School organise les étapes pour créer, lancer et vendre vos produits digitaux.</p></div>
      <div className="seg glass" role="tablist" aria-label="Parcours">
        {DATA.map((x, k) => (
          <button key={x.tab} role="tab" aria-selected={k === i} onClick={() => setI(k)}>{x.tab}</button>
        ))}
      </div>
      <div className="panel glass on" role="tabpanel">
        <div><h3>{p.t}</h3><p>{p.d}</p>
          <div className="meta">{p.m.map((x) => <span className="pill" key={x}>{x}</span>)}</div></div>
        <ul className="mods">
          {p.mods.map(([a, b], k) => (
            <li key={a}><i>{k + 1}</i><div><b>{a}</b><small>{b}</small></div></li>
          ))}
        </ul>
      </div>
    </section>
  )
}
