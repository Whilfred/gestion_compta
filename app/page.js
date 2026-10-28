import Link from 'next/link'
import Logo from '../components/Logo'
import HomeActions from '../components/HomeActions'
import { Calculator, HowItWorks, Reveal, Simulator } from '../components/HomeClient'

export const metadata = {
  title: 'Compta Ecom — La compta de votre boutique, jour après jour',
  description: 'Chiffre d’affaires des ventes livrées, bénéfice net par produit, stock, clients, pub et charges : voyez ce qu’il vous reste vraiment dans la poche. Pour les e-commerçants, en FCFA.',
}

// ───────── Fond du hero ─────────
// Meilleure qualité : déposez vos fichiers dans /public (hero.mp4 + hero.jpg en 2400 px de large).
// HERO_HD est essayée en premier ; si elle ne charge pas, HERO_IMAGE (déjà utilisée) reste visible dessous.
const HERO_VIDEO = '/hero.mp4'
const HERO_IMAGE = 'https://i.pinimg.com/1200x/21/d7/c2/21d7c2397970989b91e16ef62183c811.jpg'
const HERO_HD = 'https://i.pinimg.com/originals/21/d7/c2/21d7c2397970989b91e16ef62183c811.jpg'

// ───────── Images de la grille (facultatives) ─────────
// Déposez bento-1.jpg … bento-4.jpg dans /public. Tant qu'elles n'existent pas, un dégradé s'affiche.
const BENTO = [
  ['/bento-1.jpg', 'Ventes livrées', 'Seul l’argent réellement encaissé entre dans votre chiffre d’affaires.', 'b-wide'],
  ['/bento-2.jpg', 'Bénéfice par produit', 'Pub et charges rattachées : vous voyez enfin quoi pousser.', ''],
  ['/bento-3.jpg', 'Stock et alertes', 'Prévenu avant la rupture, jamais surpris.', ''],
  ['/bento-4.jpg', 'Clients qui rachètent', 'Historique d’achats, numéros et export CSV.', 'b-wide'],
]

// Vidéo de démonstration (section avant la grille). Déposez demo.mp4 dans /public.
const DEMO_VIDEO = '/demo.mp4'
// Capture d'écran facultative de votre vrai tableau de bord : déposez apercu.png dans /public.
// Si elle existe, elle remplace automatiquement la maquette ci-dessous.
const APERCU = '/apercu.png'

const CANAUX = ['WhatsApp', 'Facebook', 'Mobile money', 'Montants en FCFA', 'Ventes livrées', 'Stock en temps réel', 'Pub par produit', 'Mode discret', 'Équipe et droits', 'Sauvegarde']

const HERO_CSS = `
/* ===== HERO ===== */
.hero-wrap{position:relative;min-height:100svh;display:flex;flex-direction:column;color:#fff;overflow:hidden;isolation:isolate}
.hero-bg{position:absolute;inset:0;z-index:-1;background:#0b1220}
.hero-bg .pic{position:absolute;inset:0;background-image:url('${HERO_HD}'),url('${HERO_IMAGE}');background-size:cover,cover;background-position:center,center;animation:kb 28s ease-in-out infinite alternate;will-change:transform}
@keyframes kb{from{transform:scale(1)}to{transform:scale(1.07)}}
.hero-bg video{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.hero-bg .shade{position:absolute;inset:0;background:linear-gradient(180deg,rgba(5,10,20,.35) 0%,rgba(5,10,20,0) 30%,rgba(5,10,20,.25) 70%,#050a14 100%)}
@media (prefers-reduced-motion:reduce){.hero-bg video{display:none}.hero-bg .pic{animation:none}}

.glass-head{position:absolute;top:14px;left:0;right:0;z-index:20;padding:0 clamp(12px,3vw,40px)}
.glass-head-in{max-width:1200px;margin:0 auto;display:flex;align-items:center;justify-content:space-between;gap:16px;padding:8px 12px 8px 18px;border-radius:999px;background:rgba(255,255,255,.10);border:1px solid rgba(255,255,255,.22);-webkit-backdrop-filter:blur(18px) saturate(160%);backdrop-filter:blur(18px) saturate(160%);box-shadow:0 8px 30px rgba(0,0,0,.18)}
.glass-nav{display:flex;gap:6px}
.glass-nav a{color:rgba(255,255,255,.9);text-decoration:none;font-weight:500;font-size:.95rem;padding:8px 14px;border-radius:999px;transition:background .2s}
.glass-nav a:hover{background:rgba(255,255,255,.16)}
@media (max-width:900px){.glass-nav{display:none}}

.hero-center{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:120px clamp(16px,4vw,40px) 90px;gap:18px}
.glass-tag{display:inline-block;font-size:.82rem;letter-spacing:.02em;padding:7px 14px;border-radius:999px;background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.25);-webkit-backdrop-filter:blur(12px);backdrop-filter:blur(12px)}
.hero-center h1{margin:0;max-width:16ch;font-weight:800;line-height:1.05;letter-spacing:-.02em;font-size:clamp(2.2rem,6.5vw,5rem);color:#fff;text-shadow:0 4px 30px rgba(0,0,0,.45)}
.hero-center h1 em{font-style:normal;color:rgba(255,255,255,.75);font-weight:600}
.hero-center .hero-sub{margin:0;max-width:56ch;font-size:clamp(1rem,2vw,1.25rem);color:rgba(255,255,255,.88);text-shadow:0 2px 16px rgba(0,0,0,.5)}

.hero-prompt{width:min(760px,100%);margin-top:10px;display:flex;align-items:center;gap:12px;padding:8px 8px 8px 10px;border-radius:999px;background:rgba(255,255,255,.14);border:1px solid rgba(255,255,255,.30);-webkit-backdrop-filter:blur(20px) saturate(170%);backdrop-filter:blur(20px) saturate(170%);box-shadow:0 20px 60px rgba(0,0,0,.28),inset 0 1px 0 rgba(255,255,255,.25)}
.hero-thumb{flex:none;width:54px;height:38px;border-radius:999px;border:1px solid rgba(255,255,255,.35);background:url('${HERO_IMAGE}') center/cover,linear-gradient(135deg,#3b82f6,#0ea5e9)}
.hero-bar{flex:none;width:1px;height:22px;background:rgba(255,255,255,.5)}
.hero-typed{flex:1;min-width:0;text-align:left;font-size:.98rem;color:rgba(255,255,255,.92);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.hero-go{flex:none;text-decoration:none;font-weight:700;color:#fff;background:#0a0a0a;padding:14px 26px;border-radius:999px;transition:transform .15s}
.hero-go:hover{transform:scale(1.04)}
@media (max-width:560px){.hero-thumb,.hero-bar{display:none}.hero-go{padding:12px 18px}}

.hero-chips{list-style:none;margin:6px 0 0;padding:0;display:flex;flex-wrap:wrap;justify-content:center;gap:8px}
.hero-chips li{font-size:.85rem;padding:6px 12px;border-radius:999px;background:rgba(255,255,255,.10);border:1px solid rgba(255,255,255,.2);-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px)}

/* ===== Bandeau défilant ===== */
.mq{background:#050a14;border-top:1px solid rgba(255,255,255,.08);border-bottom:1px solid rgba(255,255,255,.08);overflow:hidden;padding:16px 0;-webkit-mask-image:linear-gradient(90deg,transparent,#000 8%,#000 92%,transparent);mask-image:linear-gradient(90deg,transparent,#000 8%,#000 92%,transparent)}
.mq-track{display:flex;gap:14px;width:max-content;animation:mq 38s linear infinite}
.mq:hover .mq-track{animation-play-state:paused}
.mq-track span{white-space:nowrap;color:rgba(255,255,255,.85);font-weight:600;font-size:.95rem;padding:9px 18px;border-radius:999px;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.14)}
@keyframes mq{to{transform:translateX(-50%)}}
@media (prefers-reduced-motion:reduce){.mq-track{animation:none}}

/* ===== Vitrine téléphone ===== */
.show{position:relative;color:#fff;padding:90px clamp(16px,4vw,40px) 100px;overflow:hidden;isolation:isolate;background:#050a14}
.show::before{content:"";position:absolute;inset:0;z-index:-2;background:linear-gradient(rgba(5,10,20,.82),rgba(5,10,20,.92)),url('${HERO_IMAGE}') center/cover fixed}
.show::after{content:"";position:absolute;width:640px;height:640px;left:50%;top:55%;transform:translate(-50%,-50%);z-index:-1;background:radial-gradient(circle,rgba(59,130,246,.35),transparent 65%);filter:blur(20px);animation:pulse 6s ease-in-out infinite}
@keyframes pulse{50%{opacity:.55;transform:translate(-50%,-50%) scale(1.15)}}
.show-head{text-align:center;max-width:720px;margin:0 auto 50px}
.show-head .k{display:inline-block;font-size:.8rem;letter-spacing:.12em;text-transform:uppercase;color:#7dd3fc;font-weight:700}
.show-head h2{margin:10px 0 12px;font-size:clamp(1.8rem,4.5vw,3rem);line-height:1.1;color:#fff}
.show-head p{margin:0;color:rgba(255,255,255,.75);font-size:1.05rem}
.show-stage{position:relative;max-width:980px;margin:0 auto;display:flex;justify-content:center}

.phone{position:relative;width:min(300px,78vw);aspect-ratio:9/18.5;border-radius:46px;padding:11px;background:linear-gradient(145deg,#2a2f3a,#0b0d12);box-shadow:0 40px 90px rgba(0,0,0,.55),inset 0 0 0 2px rgba(255,255,255,.12);animation:bob 7s ease-in-out infinite}
@keyframes bob{50%{transform:translateY(-12px)}}
.phone::before{content:"";position:absolute;top:19px;left:50%;transform:translateX(-50%);width:34%;height:24px;border-radius:99px;background:#000;z-index:3}
.screen{height:100%;border-radius:36px;overflow:hidden;background:linear-gradient(180deg,#0f1b33,#0a1224);padding:58px 18px 18px;display:flex;flex-direction:column;gap:10px;position:relative}
.screen small{letter-spacing:.1em;color:#7c8aa5;font-weight:600;font-size:.66rem}
.screen .big{font-size:1.9rem;font-weight:800;color:#4ade80;margin:2px 0 6px}
.screen .row{display:flex;justify-content:space-between;font-size:.78rem;padding:8px 10px;border-radius:12px;background:rgba(255,255,255,.06);color:#cbd5e1}
.screen .row b{color:#fff}
.screen .row b.pos{color:#4ade80}
.screen .note{margin-top:auto;font-size:.7rem;color:#8ea0bd;padding:10px;border-radius:12px;background:rgba(56,189,248,.1);border:1px solid rgba(56,189,248,.25)}
.bar{display:flex;align-items:flex-end;gap:6px;height:54px;margin:4px 0}
.bar i{flex:1;border-radius:6px 6px 2px 2px;background:linear-gradient(180deg,#38bdf8,#2563eb);animation:grow 3.2s ease-in-out infinite alternate;transform-origin:bottom}
.bar i:nth-child(1){height:40%}.bar i:nth-child(2){height:65%;animation-delay:.2s}.bar i:nth-child(3){height:50%;animation-delay:.4s}.bar i:nth-child(4){height:85%;animation-delay:.6s}.bar i:nth-child(5){height:70%;animation-delay:.8s}.bar i:nth-child(6){height:100%;animation-delay:1s}
@keyframes grow{from{transform:scaleY(.7)}to{transform:scaleY(1)}}

.fl{position:absolute;display:flex;align-items:center;gap:10px;padding:12px 16px;border-radius:18px;font-size:.88rem;color:#fff;background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.25);-webkit-backdrop-filter:blur(16px) saturate(160%);backdrop-filter:blur(16px) saturate(160%);box-shadow:0 18px 50px rgba(0,0,0,.35);animation:bob 6s ease-in-out infinite}
.fl b{display:block;font-size:1rem}
.fl em{font-style:normal;width:34px;height:34px;border-radius:50%;display:grid;place-items:center;font-size:1rem;background:rgba(255,255,255,.18)}
.fl.a{left:2%;top:12%}.fl.b{right:2%;top:30%;animation-delay:-2s}.fl.c{left:6%;bottom:12%;animation-delay:-4s}.fl.d{right:8%;bottom:4%;animation-delay:-1s}
@media (max-width:760px){.fl{display:none}}

/* ===== Aperçu du tableau de bord ===== */
.dash{position:relative;width:min(940px,100%);border-radius:20px;overflow:hidden;background:#f4f6fb;color:#0f172a;box-shadow:0 40px 100px rgba(0,0,0,.55);border:1px solid rgba(255,255,255,.3);animation:bob 8s ease-in-out infinite;text-align:left}
.dash-shot{position:absolute;inset:0;z-index:5;background:url('${APERCU}') left top/cover no-repeat}
.dash-win{display:flex;gap:7px;align-items:center;height:34px;padding:0 14px;background:#e6ebf5}
.dash-win i{width:11px;height:11px;border-radius:50%;background:#cbd5e1}
.dash-win i:nth-child(1){background:#ff6b6b}.dash-win i:nth-child(2){background:#fbbf24}.dash-win i:nth-child(3){background:#4ade80}
.dash-body{display:grid;grid-template-columns:210px 1fr}
.dash-side{background:#fff;padding:18px 12px;border-right:1px solid #e5e9f2}
.dash-logo{display:flex;align-items:center;gap:9px;font-weight:800;font-size:1.02rem;margin:0 6px 18px}
.dash-logo i{width:30px;height:30px;border-radius:9px;background:#3b82f6;display:grid;place-items:center;color:#fff;font-style:normal;font-size:.9rem}
.dash-nav span{display:block;padding:10px 12px;border-radius:12px;font-size:.84rem;font-weight:500;color:#475569;margin-bottom:4px}
.dash-nav span.on{background:#eaf0ff;color:#f4585f;border:1px solid #cfdcff}
.dash-main{padding:22px 24px 26px}
.dash-main h4{margin:0;font-size:1.55rem;font-weight:800;letter-spacing:-.02em}
.dash-main .sub{margin:2px 0 14px;color:#64748b;font-size:.85rem}
.dash-tabs{display:inline-flex;gap:4px;padding:5px;border-radius:14px;background:#fff;border:1px solid #e5e9f2;margin-bottom:14px;max-width:100%;overflow:hidden}
.dash-tabs span{padding:7px 12px;font-size:.78rem;font-weight:600;color:#334155;border-radius:10px;white-space:nowrap}
.dash-tabs span.on{background:#ff6b7a;color:#fff}
.dash-net{display:grid;grid-template-columns:1.1fr 1fr;gap:20px;padding:18px 20px;border-radius:20px;background:#eef3ff;border:1px solid #dbe4f7;margin-bottom:12px}
.dash-net small{letter-spacing:.08em;font-weight:700;color:#64748b;font-size:.7rem}
.dash-net .n{font-size:clamp(2rem,5vw,3rem);font-weight:800;color:#0f9d6b;line-height:1.1;margin:6px 0 4px}
.dash-net .n em{font-style:normal;font-size:.9rem;color:#475569;margin-left:6px}
.dash-net p{margin:0;font-size:.74rem;color:#64748b}
.dash-obj .t{height:9px;border-radius:99px;background:#dfe5f1;margin:8px 0 6px;overflow:hidden}
.dash-obj .t i{display:block;height:100%;border-radius:99px;background:linear-gradient(90deg,#fb7185,#22c55e)}
.dash-obj p{font-size:.72rem}
.dash-kpis{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}
.dash-kpis div{padding:14px 16px;border-radius:16px;background:#fff;border:1px solid #e5e9f2}
.dash-kpis small{display:block;font-size:.72rem;color:#64748b;font-weight:600}
.dash-kpis b{display:block;font-size:1.25rem;margin:4px 0 2px}
.dash-kpis span{font-size:.68rem;color:#94a3b8}
@media (max-width:760px){.dash-body{grid-template-columns:1fr}.dash-side{display:none}.dash-net{grid-template-columns:1fr}.dash-kpis{grid-template-columns:1fr 1fr}.dash-tabs span:nth-child(n+5){display:none}}

/* ===== Section vidéo ===== */
.vid-sec{background:#050a14;color:#fff;padding:30px clamp(16px,4vw,40px) 90px;text-align:center;position:relative;overflow:hidden}
.vid-sec::before{content:"";position:absolute;left:50%;top:60%;width:720px;height:420px;transform:translate(-50%,-50%);background:radial-gradient(ellipse,rgba(37,99,235,.35),transparent 70%);filter:blur(30px);z-index:0}
.vid-head{position:relative;z-index:1;max-width:680px;margin:0 auto 34px}
.vid-head .k{font-size:.8rem;letter-spacing:.12em;text-transform:uppercase;color:#7dd3fc;font-weight:700}
.vid-head h2{margin:10px 0 10px;font-size:clamp(1.7rem,4vw,2.7rem);line-height:1.1;color:#fff}
.vid-head p{margin:0;color:rgba(255,255,255,.75)}
.vid-frame{position:relative;z-index:1;max-width:980px;margin:0 auto;aspect-ratio:16/9;border-radius:28px;overflow:hidden;border:1px solid rgba(255,255,255,.2);box-shadow:0 40px 100px rgba(0,0,0,.55),0 0 0 8px rgba(255,255,255,.05);background:linear-gradient(rgba(5,10,20,.35),rgba(5,10,20,.35)),url('${HERO_IMAGE}') center/cover,#0b1220}
.vid-frame video{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;background:transparent}

/* ===== Chiffres ===== */
.stats{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;max-width:900px;margin:60px auto 0}
.stat{text-align:center;padding:22px 12px;border-radius:22px;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.14);-webkit-backdrop-filter:blur(12px);backdrop-filter:blur(12px)}
.stat b{display:block;font-size:clamp(1.6rem,4vw,2.6rem);font-weight:800;color:#fff}
.stat span{font-size:.85rem;color:rgba(255,255,255,.72)}
@media (max-width:560px){.stats{grid-template-columns:1fr}}

/* ===== Grille d'images (bento) ===== */
.bento-sec{background:#050a14;color:#fff;padding:20px clamp(16px,4vw,40px) 100px}
.bento{max-width:1100px;margin:0 auto;display:grid;grid-template-columns:repeat(3,1fr);gap:16px}
.bcard{position:relative;min-height:260px;border-radius:28px;overflow:hidden;display:flex;align-items:flex-end;padding:22px;background-size:cover;background-position:center;border:1px solid rgba(255,255,255,.12);transition:transform .35s,box-shadow .35s}
.bcard:hover{transform:translateY(-6px) scale(1.01);box-shadow:0 30px 70px rgba(0,0,0,.5)}
.bcard::before{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(5,10,20,0) 25%,rgba(5,10,20,.88));z-index:0}
.bcard>div{position:relative;z-index:1}
.bcard h3{margin:0 0 6px;font-size:1.25rem;color:#fff}
.bcard p{margin:0;font-size:.92rem;color:rgba(255,255,255,.8);max-width:36ch}
.b-wide{grid-column:span 2}
.bcard.g0{background-image:var(--img),linear-gradient(135deg,#1d4ed8,#0ea5e9)}
.bcard.g1{background-image:var(--img),linear-gradient(135deg,#7c3aed,#2563eb)}
.bcard.g2{background-image:var(--img),linear-gradient(135deg,#0f766e,#22c55e)}
.bcard.g3{background-image:var(--img),linear-gradient(135deg,#be185d,#f97316)}
@media (max-width:760px){.bento{grid-template-columns:1fr}.b-wide{grid-column:auto}}
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
          <div className="pic" />
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

      <div className="mq" aria-hidden="true">
        <div className="mq-track">
          {[...CANAUX, ...CANAUX].map((c, i) => <span key={i}>{c}</span>)}
        </div>
      </div>

      <section className="show" aria-label="Aperçu de l’application">
        <Reveal>
          <div className="show-head">
            <span className="k">Aperçu</span>
            <h2>Votre tableau de bord, en un coup d’œil.</h2>
            <p>Bénéfice net, objectifs du mois, chiffre d’affaires des ventes livrées : tout est là, dès la connexion.</p>
          </div>
        </Reveal>

        <div className="show-stage">
          <div className="fl a"><em>✓</em><div><b>Livrée</b>+ 52 000 FCFA</div></div>
          <div className="fl b"><em>!</em><div><b>Stock bas</b>Sac en cuir : 2 restants</div></div>
          <div className="fl c"><em>↗</em><div><b>Publicité</b>38 000 FCFA ce mois-ci</div></div>
          <div className="fl d"><em>★</em><div><b>Client fidèle</b>3e commande</div></div>

          <div className="dash" aria-label="Aperçu du tableau de bord">
            <div className="dash-shot" aria-hidden="true" />
            <div className="dash-win" aria-hidden="true"><i /><i /><i /></div>
            <div className="dash-body">
              <aside className="dash-side" aria-hidden="true">
                <div className="dash-logo"><i>↗</i>Compta Ecom</div>
                <div className="dash-nav">
                  <span className="on">Vue d’ensemble</span>
                  <span>Ventes</span>
                  <span>Produits</span>
                  <span>Clients</span>
                  <span>Publicité</span>
                  <span>Charges</span>
                  <span>Réglages</span>
                </div>
              </aside>
              <div className="dash-main">
                <h4>Bonjour Awa · MA BOUTIQUE</h4>
                <p className="sub">Depuis le début · toutes les ventes livrées</p>
                <div className="dash-tabs" aria-hidden="true">
                  <span className="on">Total</span><span>Aujourd’hui</span><span>Hier</span><span>7 jours</span><span>30 jours</span><span>Ce mois</span>
                </div>
                <div className="dash-net">
                  <div>
                    <small>BÉNÉFICE NET</small>
                    <div className="n">497 700<em>FCFA</em></div>
                    <p>Chiffre d’affaires – coût des produits – publicité – charges.</p>
                  </div>
                  <div className="dash-obj">
                    <small>OBJECTIFS DU MOIS</small>
                    <div className="t"><i style={{ width: '11%' }} /></div>
                    <p>Chiffre d’affaires : 777 800 sur 7 000 000 FCFA (11 %)</p>
                    <div className="t"><i style={{ width: '0%' }} /></div>
                    <p>Bénéfice net : 497 700 sur 100 000 000 FCFA (0 %)</p>
                  </div>
                </div>
                <div className="dash-kpis">
                  <div><small>Chiffre d’affaires total</small><b>777 800 FCFA</b><span>ventes livrées uniquement</span></div>
                  <div><small>Ventes livrées</small><b>2</b><span>&nbsp;</span></div>
                  <div><small>Articles livrés</small><b>80</b><span>&nbsp;</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Reveal delay={100}>
          <div className="stats">
            <div className="stat"><b>5</b><span>états de livraison suivis</span></div>
            <div className="stat"><b>100 %</b><span>en FCFA, sur téléphone</span></div>
            <div className="stat"><b>0</b><span>calcul à faire à la main</span></div>
          </div>
        </Reveal>
      </section>

      <section className="vid-sec" aria-label="Vidéo de démonstration">
        <Reveal>
          <div className="vid-head">
            <span className="k">En vidéo</span>
            <h2>Voyez Compta Ecom en action.</h2>
            <p>De l’enregistrement d’une vente à votre bénéfice net, en quelques secondes.</p>
          </div>
        </Reveal>
        <Reveal delay={80}>
          <div className="vid-frame">
            <video src={DEMO_VIDEO} poster={HERO_IMAGE} controls playsInline preload="metadata" />
          </div>
        </Reveal>
      </section>

      <section className="bento-sec" aria-label="Points forts">
        <div className="bento">
          {BENTO.map(([img, t, d, wide], i) => (
            <Reveal key={t} delay={i * 80}>
              <div className={`bcard g${i} ${wide}`} style={{ '--img': `url('${img}')` }}>
                <div><h3>{t}</h3><p>{d}</p></div>
              </div>
            </Reveal>
          ))}
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
