import Link from 'next/link'
import Logo from '../components/Logo'
import HomeActions from '../components/HomeActions'
import { Calculator, HowItWorks, Reveal, Simulator } from '../components/HomeClient'

export const metadata = {
  title: 'Compta Ecom — La compta de votre boutique, jour après jour',
  description: 'Chiffre d’affaires des ventes livrées, bénéfice net par produit, stock, clients, pub et charges : voyez ce qu’il vous reste vraiment dans la poche. Pour les e-commerçants, en FCFA.',
}

const PAINS = [
  ['Vous comptez des ventes pas encore livrées', 'Un colis en route n’est pas de l’argent encaissé. Ici, seules les ventes livrées entrent dans votre chiffre d’affaires.'],
  ['La pub et les déplacements disparaissent', 'Chaque dépense est rattachée à son produit : vous savez enfin lesquels vous rapportent vraiment.'],
  ['Le stock vous surprend', 'Impossible de vendre plus que ce que vous avez, et une alerte arrive avant la rupture.'],
]

const BENEFITS = [
  ['Un vrai bénéfice net', 'Chiffre d’affaires moins coût d’achat, pub et charges. Au total et produit par produit, pour savoir quoi pousser et quoi arrêter.', 'M3 17l6-6 4 4 8-8M15 7h6v6'],
  ['Tout votre commerce au même endroit', 'Ventes, livraisons, clients, stock, pub, charges et moyens de paiement, sans tableur ni calculette.', 'M21 8l-9-5-9 5v8l9 5 9-5zM3 8l9 5 9-5M12 13v8'],
  ['Pensé pour votre quotidien', 'Montants en FCFA, mobile money, WhatsApp et Facebook comme canaux de vente, et un affichage qui marche sur téléphone.', 'M7 2h10a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zM11 18h2'],
]

const FEATS = [
  ['Ventes et livraisons', '5 états : en attente, en cours d’expédition, livrée, non livrée, retour. Filtrez par état, produit ou dates.'],
  ['Dépenses par produit', 'Pub, déplacement, emballage… rattachés à un produit, ou indépendants (loyer, salaires).'],
  ['Stock et alertes', 'Stock mis à jour à chaque vente, refus si insuffisant, notification avant la rupture.'],
  ['Clients et récurrents', 'Liste des numéros, clients qui rachètent, historique d’achats et export CSV.'],
  ['Objectifs du mois', 'Fixez un objectif de chiffre d’affaires et de bénéfice, et suivez la progression.'],
  ['Équipe et droits', 'Ajoutez des employés et choisissez ce que chacun peut voir ou modifier.'],
  ['Mode discret', 'Masquez chiffre d’affaires, ventes et bénéfices (xxxx) en un clic.'],
  ['Clair, sombre, à votre couleur', 'Changez le mode, la couleur du site, la densité et la taille du texte.'],
  ['Sauvegarde', 'Téléchargez une copie de vos données et restaurez-la quand vous voulez.'],
]

const FAQ = [
  ['Quelles ventes comptent dans le chiffre d’affaires ?', 'Uniquement les ventes à l’état « Livrée ». Les ventes en attente, en cours d’expédition, non livrées ou en retour ne changent pas votre chiffre d’affaires ; elles sont affichées à part.'],
  ['Puis-je suivre la pub et les charges d’un seul produit ?', 'Oui. Chaque pub ou charge peut être rattachée à un produit (ou laissée « indépendante »). Le tableau de bord affiche le bénéfice net de chaque produit et, à part, les charges indépendantes.'],
  ['Que se passe-t-il si je n’ai plus assez de stock ?', 'La vente est refusée avec un message clair. Quand le stock approche de zéro, une alerte apparaît dans les notifications.'],
  ['Mes employés voient-ils tous mes chiffres ?', 'Non. Vous choisissez, rubrique par rubrique, ce que chaque utilisateur peut voir ou modifier, et s’il peut supprimer. Vous pouvez aussi masquer vos chiffres à l’écran.'],
  ['Puis-je modifier une vente, une dépense ou une pub ?', 'Oui. Tout se modifie : produits, stock, ventes, charges et dépenses de pub. Le stock se recalcule automatiquement.'],
  ['Mes données sont-elles sauvegardées ?', 'Vous pouvez télécharger une sauvegarde à tout moment et la restaurer ensuite depuis les réglages.'],
  ['Ça marche sur téléphone ?', 'Oui, l’interface s’adapte aux petits écrans, avec une navigation en bas de l’écran.'],
]

export default function Home() {
  return (
    <>
      <header className="lp-head">
        <div className="lp-head-in">
          <Logo />
          <nav className="lp-nav" aria-label="Sections">
            <a href="#avantages">Avantages</a>
            <a href="#fonctionnement">Comment ça marche</a>
            <a href="#simulateur">Essayer</a>
            <a href="#fonctionnalites">Fonctionnalités</a>
            <a href="#faq">Questions</a>
          </nav>
          <div className="lp-head-cta"><HomeActions /></div>
        </div>
      </header>

      <section className="hero">
        <div>
          <span className="hero-tag">Pour les e-commerçants · montants en FCFA</span>
          <h1>La compta de votre boutique, <em>jour après jour.</em></h1>
          <p>Ventes livrées, bénéfice net de chaque produit, stock, clients, pub et charges : voyez en un coup d’œil ce qu’il vous reste vraiment dans la poche.</p>
          <div className="acts"><HomeActions big /><a className="btn btn-line" href="#simulateur">Essayer le simulateur</a></div>
          <ul className="hero-points">
            <li>Aucun calcul à faire</li>
            <li>Marche sur téléphone</li>
            <li>Vos données, sauvegardables</li>
          </ul>
        </div>
        <div className="demo" aria-label="Exemple de tableau de bord">
          <small>EXEMPLE · AUJOURD’HUI</small>
          <div className="big pos">+ 84 500 FCFA</div>
          <div className="row"><span>Chiffre d’affaires (livré)</span><b>212 000 FCFA</b></div>
          <div className="row"><span>Coût des produits</span><b>89 500 FCFA</b></div>
          <div className="row"><span>Publicité</span><b>38 000 FCFA</b></div>
          <div className="demo-sub">Bénéfice net par produit</div>
          <div className="row"><span>Robe wax</span><b className="pos">+ 52 000 FCFA</b></div>
          <div className="row"><span>Sac en cuir</span><b className="pos">+ 32 500 FCFA</b></div>
          <div className="demo-note">3 commandes encore en route : non comptées tant qu’elles ne sont pas livrées.</div>
        </div>
      </section>

      <section className="lp-sec" aria-label="Le problème">
        <Reveal><span className="lp-kicker">Le constat</span><h2>Vendre, c’est bien. Savoir ce que vous gagnez, c’est mieux.</h2>
          <p className="lp-lead">Beaucoup de boutiques en ligne ne connaissent leur résultat qu’à la fin du mois, quand il est trop tard pour réagir. Compta Ecom règle trois problèmes courants.</p></Reveal>
        <div className="lp-grid3">
          {PAINS.map(([t, d], i) => <Reveal key={t} delay={i * 90}><div className="lp-card"><i className="lp-x">!</i><b>{t}</b><p>{d}</p></div></Reveal>)}
        </div>
      </section>

      <section className="lp-sec" id="avantages">
        <Reveal><span className="lp-kicker">Avantages</span><h2>Ce que vous gagnez avec Compta Ecom</h2></Reveal>
        <div className="lp-grid3">
          {BENEFITS.map(([t, d, icon], i) => (
            <Reveal key={t} delay={i * 90}>
              <div className="lp-card hi">
                <span className="lp-ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={icon} /></svg></span>
                <b>{t}</b><p>{d}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="lp-sec" id="fonctionnement">
        <Reveal><span className="lp-kicker">Comment ça marche</span><h2>De la vente au bénéfice en 3 étapes</h2>
          <p className="lp-lead">Cliquez sur une étape pour voir à quoi elle ressemble.</p></Reveal>
        <Reveal delay={80}><HowItWorks /></Reveal>
      </section>

      <section className="lp-sec" id="simulateur">
        <Reveal><span className="lp-kicker">Essayez</span><h2>Seules les ventes livrées comptent</h2>
          <p className="lp-lead">Changez l’état d’une commande et regardez votre chiffre d’affaires et votre bénéfice net se mettre à jour.</p></Reveal>
        <Reveal delay={80}><Simulator /></Reveal>
      </section>

      <section className="lp-sec" id="calculateur">
        <Reveal><span className="lp-kicker">Calculez</span><h2>Ce produit est-il vraiment rentable ?</h2>
          <p className="lp-lead">Saisissez vos chiffres : bénéfice net, marge, et nombre de ventes nécessaires pour couvrir la pub et les charges.</p></Reveal>
        <Reveal delay={80}><Calculator /></Reveal>
      </section>

      <section className="lp-sec" id="fonctionnalites">
        <Reveal><span className="lp-kicker">Fonctionnalités</span><h2>Tout ce qu’il faut pour piloter votre boutique</h2></Reveal>
        <div className="lp-grid3 feats-lp">
          {FEATS.map(([t, d], i) => <Reveal key={t} delay={(i % 3) * 80}><div className="lp-card"><b>{t}</b><p>{d}</p></div></Reveal>)}
        </div>
      </section>

      <section className="lp-sec" id="faq">
        <Reveal><span className="lp-kicker">Questions</span><h2>Foire aux questions</h2></Reveal>
        <Reveal delay={80}>
          <div className="lp-faq">
            {FAQ.map(([q, a], i) => <details key={q} open={i === 0}><summary>{q}</summary><p>{a}</p></details>)}
          </div>
        </Reveal>
      </section>

      <section className="cta-band">
        <Reveal>
          <h2>Sachez enfin ce que vous gagnez vraiment.</h2>
          <p>Créez votre compte et enregistrez votre première vente en moins de deux minutes.</p>
          <div className="acts"><HomeActions big /></div>
        </Reveal>
      </section>

      <footer className="lp-foot">
        <div className="lp-foot-in">
          <div><Logo /><p>La compta de votre boutique, jour après jour.</p></div>
          <div><b>Aller à</b><a href="#avantages">Avantages</a><a href="#fonctionnement">Comment ça marche</a><a href="#fonctionnalites">Fonctionnalités</a><a href="#faq">Questions</a></div>
          <div><b>Compte</b><Link href="/connexion">Se connecter</Link><Link href="/inscription">Créer mon espace</Link><Link href="/dashboard">Tableau de bord</Link></div>
        </div>
        <p className="foot">Compta Ecom · montants en FCFA</p>
      </footer>
    </>
  )
}
