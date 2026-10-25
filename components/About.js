const ITEMS = [
  ['M4 19V5l8 4 8-4v14l-8-4z', 'De l’idée à la vente', 'Des étapes ordonnées pour savoir toujours quoi faire ensuite.'],
  ['M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 7v5l3 2', 'À votre rythme', 'Apprenez quand vous voulez, sur ordinateur ou sur téléphone.'],
  ['M3 17l6-6 4 4 8-8M15 7h6v6', 'Un suivi clair', 'Progression, objectifs atteints et temps d’étude en un coup d’œil.'],
]
export default function About({ first }) {
  return (
    <section id="a-propos" className={first ? 'first' : ''}>
      <div className="head"><h2>La plateforme des créateurs de produits digitaux</h2>
        <p>The Winner School vous apprend à créer, lancer et vendre vos produits digitaux, avec un suivi pour garder le cap.</p></div>
      <div className="about">
        {ITEMS.map(([d, t, p]) => (
          <div className="glass" key={t}>
            <div className="ico"><svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={d} /></svg></div>
            <h4>{t}</h4><p>{p}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
