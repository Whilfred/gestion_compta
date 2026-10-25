import Logo from '../components/Logo'
import HomeActions from '../components/HomeActions'

export default function Home() {
  return (
    <>
      <header className="pub-head">
        <Logo />
        <nav><HomeActions /></nav>
      </header>

      <section className="hero">
        <div>
          <h1>La compta de votre boutique, <em>jour après jour.</em></h1>
          <p>Ventes du jour, produits vendus, d’où viennent vos clients, argent dépensé en pub : voyez en un coup d’œil ce qu’il vous reste vraiment dans la poche.</p>
          <div className="acts"><HomeActions big /></div>
        </div>
        <div className="demo" aria-label="Exemple de tableau de bord">
          <small>EXEMPLE · AUJOURD’HUI</small>
          <div className="big pos">+ 84 500 FCFA</div>
          <div className="row"><span>Chiffre d’affaires</span><b>212 000 FCFA</b></div>
          <div className="row"><span>Ventes</span><b>14 commandes · 19 articles</b></div>
          <div className="row"><span>Publicité</span><b>38 000 FCFA</b></div>
          <div className="row"><span>Meilleur canal</span><b>WhatsApp · 6 ventes</b></div>
        </div>
      </section>

      <section className="feats">
        <div className="feat"><b>Chaque jour, chaque semaine</b><p>Aujourd’hui, hier, 7 jours, 30 jours, mois : chiffre d’affaires, ventes et bénéfice net comparés à la période précédente.</p></div>
        <div className="feat"><b>Produits et canaux</b><p>Quels produits se vendent, sur quel canal (Facebook, TikTok, WhatsApp, boutique…) et combien la pub rapporte sur chacun.</p></div>
        <div className="feat"><b>Stock et retours</b><p>Le stock baisse à chaque vente, les retours et les livraisons en attente sont suivis à part.</p></div>
      </section>
      <p className="foot">Compta Ecom · montants en FCFA</p>
    </>
  )
}
