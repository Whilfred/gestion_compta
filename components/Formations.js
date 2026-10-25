import Link from 'next/link'
import { CONFIG } from '../config'
import { FORMATIONS } from '../lib/formations'

export default function Formations({ first = true }) {
  return (
    <section id="formations" className={first ? 'first' : ''}>
      <div className="head"><h2>Des formations concrètes</h2>
        <p>Des contenus courts et pratiques pour créer et vendre vos produits digitaux. Faites défiler pour les découvrir.</p></div>
      <div className="rail" tabIndex={0} aria-label="Formations">
        {FORMATIONS.map((f, i) => {
          const c = (CONFIG.cards || [])[i] || {}
          return (
            <Link className="card glass" href={`/formations/${f.slug}`} key={f.slug}>
              <div className={`thumb t${i + 1}${c.image || c.video ? ' has-media' : ''}`}>
                {c.image && <img src={c.image} alt="" loading="lazy" />}
                {c.video && <video src={c.video} poster={c.image || undefined} autoPlay muted loop playsInline />}
              </div>
              <h4>{f.t}</h4><p>{f.d}</p>
              <div className="meta"><span className="pill">{f.h}</span><span className="pill">{f.l}</span></div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
