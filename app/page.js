import Link from 'next/link'
import Logo from '../components/Logo'
import HomeActions from '../components/HomeActions'
import { Calculator, HowItWorks, Reveal, Simulator } from '../components/HomeClient'

export const metadata = {
  title: 'Compta Ecom — La compta de votre boutique, jour après jour',
  description: 'Chiffre d’affaires des ventes livrées, bénéfice net par produit, stock, clients, pub et charges : voyez ce qu’il vous reste vraiment dans la poche. Pour les e-commerçants, en FCFA.',
}

// Fond du hero : placez vos fichiers dans le dossier /public
//   /public/hero.mp4  (vidéo courte en boucle, < 5 Mo)
//   /public/hero.jpg  (image de secours / affichée avant la vidéo)
const HERO_VIDEO = '/hero.mp4'
const HERO_IMAGE = 'https://i.pinimg.com/736x/2e/d4/56/2ed4563f79d3be8dbefae55d51d16a2c.jpg'

const HERO_CSS = `
.hero-wrap{position:relative;min-height:100svh;display:flex;flex-direction:column;color:#fff;overflow:hidden;isolation:isolate}
.hero-bg{position:absolute;inset:0;z-index:-1;background:#0b1220}
.hero-bg img,.hero-bg video{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.hero-bg .shade{position:absolute;inset:0;background:linear-gradient(180deg,rgba(5,10,20,.55) 0%,rgba(5,10,20,.15) 35%,rgba(5,10,20,.55) 75%,rgba(5,10,20,.9) 100%)}
@media (prefers-reduced-motion:reduce){.hero-bg video{display:none}}

.glass-head{position:absolute;top:14px;left:0;right:0;z-index:20;padding:0 clamp(12px,3vw,40px)}
.glass-head-in{max-width:1200px;margin:0 auto;display:flex;align-items:center;justify-content:space-between;gap:16px;padding:8px 12px 8px 18px;border-radius:999px;background:rgba(255,255,255,.10);border:1px solid rgba(255,255,255,.22);-webkit-backdrop-filter:blur(18px) saturate(160%);backdrop-filter:blur(18px) saturate(160%);box-shadow:0 8px 30px rgba(0,0,0,.18)}
.glass-nav{display:flex;gap:6px}
.glass-nav a{color:rgba(255,255,255,.9);text-decoration:none;font-weight:500;font-size:.95rem;padding:8px 14px;border-radius:999px;transition:background .2s}
.glass-nav a:hover{background:rgba(255,255,255,.16)}
@media (max-width:900px){.glass-nav{display:none}}

.hero-center{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:120px clamp(16px,4vw,40px) 90px;gap:18px}
.glass-tag{display:inline-block;font-size:.82rem;letter-spacing:.02em;padding:7px 14px;border-radius:999px;background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.25);-webkit-backdrop-filter:blur(12px);backdrop-filter:blur(12px)}
.hero-center h1{margin:0;max-width:16ch;font-weight:800;line-height:1.05;letter-spacing:-.02em;font-size:clamp(2.2rem,6.5vw,5rem);color:#fff;text-shadow:0 4px 30px rgba(0,0,0,.35)}
.hero-center h1 em{font-style:normal;color:rgba(255,255,255,.72);font-weight:600}
.hero-center .hero-sub{margin:0;max-width:56ch;font-size:clamp(1rem,2vw,1.25rem);color:rgba(255,255,255,.85);text-shadow:0 2px 16px rgba(0,0,0,.4)}

.hero-prompt{width:min(760px,100%);margin-top:10px;display:flex;align-items:center;gap:12px;padding:8px 8px 8px 10px;border-radius:999px;background:rgba(255,255,255,.14);border:1px solid rgba(255,255,255,.30);-webkit-backdrop-filter:blur(20px) saturate(170%);backdrop-filter:blur(20px) saturate(170%);box-shadow:0 20px 60px rgba(0,0,0,.28),inset 0 1px 0 rgba(255,255,255,.25)}
.hero-thumb{flex:none;width:54px;height:38px;border-radius:999px;border:1px solid rgba(255,255,255,.35);background:url('${HERO_IMAGE}') center/cover,linear-gradient(135deg,#3b82f6,#0ea5e9)}
.hero-bar{flex:none;width:1px;height:22px;background:rgba(255,255,255,.5)}
.hero-typed{flex:1;min-width:0;text-align:left;font-size:.98rem;color:rgba(255,255,255,.92);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.hero-go{flex:none;text-decoration:none;font-weight:700;color:#fff;background:#0a0a0a;padding:14px 26px;border-radius:999px;transition:transform .15s}
.hero-go:hover{transform:scale(1.04)}
@media (max-width:560px){.hero-thumb,.hero-bar{display:none}.hero-go{padding:12px 18px}}

.hero-chips{list-style:none;margin:6px 0 0;padding:0;display:flex;flex-wrap:wrap;justify-content:center;gap:8px}
.hero-chips li{font-size:.85rem;padding:6px 12px;border-radius:999px;background:rgba(255,255,255,.10);border:1px solid rgba(255,255,255,.2);-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px)}

.glass-demo-wrap{position:relative;z-index:5;margin-top:-70px;padding:0 clamp(16px,4vw,40px) 20px}
.glass-demo{max-width:460px;margin:0 auto;padding:20px 22px;border-radius:28px;background:rgba(255,255,255,.88);color:#0f172a;border:1px solid rgba(255,255,255,.6);-webkit-backdrop-filter:blur(24px) saturate(180%);backdrop-filter:blur(24px) saturate(180%);box-shadow:0 30px 80px rgba(0,0,0,.25)}
.glass-demo small{letter-spacing:.08em;color:#64748b;font-weight:600}
.glass-demo .big{font-size:2rem;font-weight:800;margin:6px 0 12px;color:#16a34a}
.glass-demo .row{display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid rgba(15,23,42,.07);font-size:.92rem}
.glass-demo .row b.pos{color:#16a34a}
.glass-demo .demo-sub{margin:12px 0 2px;font-weight:700;font-size:.85rem;color:#475569}
.glass-demo .demo-note{margin-top:12px;font-size:.8rem;color:#64748b}
`

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
      <style dangerouslySetInnerHTML={{ __html: HERO_CSS }} />

      <section className="hero-wrap">
        <div className="hero-bg" aria-hidden="true">
          <img src={HERO_IMAGE} alt="" />
          <video src={HERO_VIDEO} poster={HERO_IMAGE} autoPlay muted loop playsInline preload="auto" />
          <div className="shade" />
        </div>

        <header className="glass-head">
          <div className="glass-head-in">
            <Logo />
            <nav className="glass-nav" aria-label="Sections">
              <a href="#avantages">Avantages</a>
              <a href="#fonctionnement">Comment ça marche</a>
              <a href="#simulateur">Essayer</a>
              <a href="#fonctionnalites">Fonctionnalités</a>
              <a href="#faq">Questions</a>
            </nav>
            <div className="lp-head-cta"><HomeActions /></div>
          </div>
        </header>

        <div className="hero-center">
          <span className="glass-tag">Pour les e-commerçants · montants en FCFA</span>
          <h1>La compta de votre boutique, <em>jour après jour.</em></h1>
          <p className="hero-sub">Ventes livrées, bénéfice net par produit, stock, clients, pub et charges : voyez en un coup d’œil ce qu’il vous reste vraiment dans la poche.</p>

          <div className="hero-prompt">
            <span className="hero-thumb" aria-hidden="true" />
            <span className="hero-bar" aria-hidden="true" />
            <span className="hero-typed">Enregistrer 3 robes wax livrées aujourd’hui…</span>
            <Link href="/inscription" className="hero-go">Commencer</Link>
          </div>

          <ul className="hero-chips">
            <li>Aucun calcul à faire</li>
            <li>Marche sur téléphone</li>
            <li>Vos données, sauvegardables</li>
          </ul>
        </div>
      </section>

      <div className="glass-demo-wrap">
        <div className="glass-demo" aria-label="Exemple de tableau de bord">
          <small>EXEMPLE · AUJOURD’HUI</small>
          <div className="big">+ 84 500 FCFA</div>
          <div className="row"><span>Chiffre d’affaires (livré)</span><b>212 000 FCFA</b></div>
          <div className="row"><span>Coût des produits</span><b>89 500 FCFA</b></div>
          <div className="row"><span>Publicité</span><b>38 000 FCFA</b></div>
          <div className="demo-sub">Bénéfice net par produit</div>
          <div className="row"><span>Robe wax</span><b className="pos">+ 52 000 FCFA</b></div>
          <div className="row"><span>Sac en cuir</span><b className="pos">+ 32 500 FCFA</b></div>
          <div className="demo-note">3 commandes encore en route : non comptées tant qu’elles ne sont pas livrées.</div>
        </div>
      </div>

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
