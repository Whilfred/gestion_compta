import Link from 'next/link'
const PLANS = [
  ['Découverte', 'Gratuit', '', ['Premières leçons de chaque parcours', 'Suivi de progression', 'Accès sur téléphone et ordinateur'], 'Commencer', false],
  ['Créateur', '9 900 FCFA', '/mois', ['Tous les parcours et formations', 'Exercices et modèles à télécharger', 'Objectifs et suivi détaillé'], 'Choisir Créateur', true],
  ['Pro', '24 900 FCFA', '/mois', ['Tout le plan Créateur', 'Accompagnement personnalisé', 'Retours sur vos projets'], 'Choisir Pro', false],
]
const FAQ = [
  ['Faut-il de l’expérience pour commencer ?', 'Non. Les parcours débutants partent de zéro et vous guident étape par étape.'],
  ['Puis-je apprendre à mon rythme ?', 'Oui. Les contenus sont disponibles à tout moment, sur ordinateur comme sur téléphone.'],
  ['Comment puis-je payer ?', 'Par mobile money ou carte bancaire. Les moyens de paiement exacts seront précisés au lancement.'],
  ['Puis-je changer de formule ?', 'Oui, vous pouvez passer d’une formule à une autre quand vous le souhaitez.'],
]
export default function Pricing() {
  return (
    <section className="first">
      <div className="head"><h2>Une formule pour chaque ambition</h2><p>Commencez gratuitement, puis passez à la formule qui vous convient.</p></div>
      <div className="plans">
        {PLANS.map(([n, p, per, items, cta, hot]) => (
          <div className={`plan glass${hot ? ' hot' : ''}`} key={n}>
            <h4>{n}</h4>
            <div className="price">{p}<small>{per}</small></div>
            <ul>{items.map((x) => <li key={x}>{x}</li>)}</ul>
            <Link className={`btn ${hot ? 'btn-blue' : 'btn-glass'}`} href="/inscription">{cta}</Link>
          </div>
        ))}
      </div>
      <p className="note">Tarifs donnés à titre d’exemple, à adapter.</p>
      <div className="head" style={{ marginTop: 80 }}><h2>Questions fréquentes</h2></div>
      <div className="faq">
        {FAQ.map(([q, a]) => <details className="glass" key={q}><summary>{q}</summary><p>{a}</p></details>)}
      </div>
    </section>
  )
}
