const STEPS = [
  ['Choisissez votre parcours', 'Dites ce que vous voulez créer ou vendre, on vous indique par où commencer.'],
  ['Suivez les formations', 'Des leçons courtes et pratiques, à votre rythme, avec des exercices.'],
  ['Lancez et vendez', 'Publiez votre produit, encaissez en ligne et mesurez vos premières ventes.'],
]
export default function Steps() {
  return (
    <section id="comment-ca-marche">
      <div className="head"><h2>Comment ça marche</h2><p>Trois étapes simples pour passer de l’idée à votre premier produit en ligne.</p></div>
      <div className="about">
        {STEPS.map(([t, p], i) => (
          <div className="glass" key={t}>
            <div className="ico"><b>{i + 1}</b></div>
            <h4>{t}</h4><p>{p}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
