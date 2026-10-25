import Link from 'next/link'
import { notFound } from 'next/navigation'
import { FORMATIONS } from '../../../lib/formations'
import { CONFIG } from '../../../config'

export function generateStaticParams() { return FORMATIONS.map((f) => ({ slug: f.slug })) }
export function generateMetadata({ params }) {
  const f = FORMATIONS.find((x) => x.slug === params.slug)
  return { title: `${f ? f.t : 'Formation'} — The Winner School` }
}

export default function Page({ params }) {
  const i = FORMATIONS.findIndex((x) => x.slug === params.slug)
  if (i < 0) notFound()
  const f = FORMATIONS[i]
  const c = (CONFIG.cards || [])[i] || {}
  return (
    <section className="first">
      <Link className="back" href="/formations">← Toutes les formations</Link>
      <div className={`thumb big t${i + 1}${c.image || c.video ? ' has-media' : ''}`}>
        {c.image && <img src={c.image} alt="" />}
        {c.video && <video src={c.video} poster={c.image || undefined} autoPlay muted loop playsInline />}
      </div>
      <div className="panel glass on">
        <div><h3>{f.t}</h3><p>{f.long}</p>
          <div className="meta"><span className="pill">{f.h}</span><span className="pill">{f.l}</span></div>
          <div className="meta"><Link className="btn btn-blue" href="/inscription">Commencer cette formation</Link></div></div>
        <ul className="mods">
          {f.mods.map(([a, b], k) => <li key={a}><i>{k + 1}</i><div><b>{a}</b><small>{b}</small></div></li>)}
        </ul>
      </div>
    </section>
  )
}
