"use client"

import './HomeExperience.css'
import Link from 'next/link'
import { Fragment, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../lib/auth'

const steps = [
  { number: '01', title: 'Clarifiez votre idée', text: 'Un parcours guidé pour passer d’une intuition à une offre digitale qui a du sens.', tone: 'royal', art: 'a1' },
  { number: '02', title: 'Apprenez en faisant', text: 'Des formations courtes, des exercices concrets et des modèles prêts à adapter.', tone: 'light', art: 'a2' },
  { number: '03', title: 'Lancez sans attendre', text: 'Mettez votre produit en ligne, suivez vos progrès et commencez à vendre.', tone: 'night', art: 'a3' },
]

const courses = [
  { tag: 'Démarrage', title: 'Trouver son idée rentable', meta: '4 modules · 38 min', color: 'sky' },
  { tag: 'Création', title: 'Construire son premier ebook', meta: '6 modules · 1 h 12', color: 'royal' },
  { tag: 'Vente', title: 'Lancer sa page et convertir', meta: '5 modules · 52 min', color: 'night' },
]

const themes = ['Création de produits', 'Vente en ligne', 'Personal branding', 'Automatisation']

function Arrow() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
}

/* Mot par mot (masque + montée) */
function Words({ text, start = 0 }) {
  return text.split(' ').map((word, i) => (
    <Fragment key={i}>
      <b className="wx-w" style={{ '--i': start + i }}><i>{word}</i></b>{' '}
    </Fragment>
  ))
}

/* Bouton magnétique */
function Magnetic({ children, strength = 0.35, className = '' }) {
  const inner = useRef(null)
  const move = (event) => {
    const el = inner.current
    if (!el) return
    const rect = el.parentElement.getBoundingClientRect()
    const x = event.clientX - (rect.left + rect.width / 2)
    const y = event.clientY - (rect.top + rect.height / 2)
    el.style.transform = `translate(${x * strength}px, ${y * strength}px)`
  }
  const leave = () => { if (inner.current) inner.current.style.transform = '' }
  return (
    <span className={`wx-mag ${className}`} onPointerMove={move} onPointerLeave={leave}>
      <span className="wx-mag-in" ref={inner}>{children}</span>
    </span>
  )
}

/* Halo qui suit la souris sur une carte */
const spot = (event) => {
  const rect = event.currentTarget.getBoundingClientRect()
  event.currentTarget.style.setProperty('--px', `${event.clientX - rect.left}px`)
  event.currentTarget.style.setProperty('--py', `${event.clientY - rect.top}px`)
}

function Reveal({ children, className = '', delay = 0, split = false }) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const node = ref.current
    if (!node) return
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setVisible(true)
        observer.disconnect()
      }
    }, { threshold: 0.15 })
    observer.observe(node)
    return () => observer.disconnect()
  }, [])
  return (
    <div ref={ref} style={{ '--d': `${delay}s` }} className={`wx-reveal ${split ? 'wx-split' : ''} ${visible ? 'is-in' : ''} ${className}`}>
      {children}
    </div>
  )
}

function Counter({ value, suffix = '' }) {
  const ref = useRef(null)
  const [count, setCount] = useState(0)
  useEffect(() => {
    const node = ref.current
    if (!node) return
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return
      const duration = 1600
      const started = performance.now()
      const tick = (time) => {
        const p = Math.min((time - started) / duration, 1)
        setCount(Math.round((1 - Math.pow(1 - p, 4)) * value))
        if (p < 1) requestAnimationFrame(tick)
      }
      requestAnimationFrame(tick)
      observer.disconnect()
    }, { threshold: 0.5 })
    observer.observe(node)
    return () => observer.disconnect()
  }, [value])
  return <span ref={ref}>{count}{suffix}</span>
}

export default function HomeExperience() {
  const router = useRouter()
  const { user } = useAuth()
  const [goal, setGoal] = useState('')
  const [activeCourse, setActiveCourse] = useState(1)
  const heroRef = useRef(null)
  const barRef = useRef(null)
  const stackRef = useRef([])

  /* Souris : tilt + halo */
  useEffect(() => {
    const node = heroRef.current
    if (!node) return
    const move = (event) => {
      const rect = node.getBoundingClientRect()
      const x = event.clientX / window.innerWidth - 0.5
      const y = event.clientY / window.innerHeight - 0.5
      node.style.setProperty('--rx', `${7 - y * 6}deg`)
      node.style.setProperty('--ry', `${x * 8}deg`)
      node.style.setProperty('--sx', `${event.clientX - rect.left}px`)
      node.style.setProperty('--sy', `${event.clientY - rect.top}px`)
    }
    window.addEventListener('pointermove', move, { passive: true })
    return () => window.removeEventListener('pointermove', move)
  }, [])

  /* Scroll : progression, parallax hero, cartes empilées */
  useEffect(() => {
    let raf = 0
    const update = () => {
      raf = 0
      const y = window.scrollY
      const max = document.documentElement.scrollHeight - window.innerHeight
      if (barRef.current) barRef.current.style.transform = `scaleX(${max > 0 ? y / max : 0})`
      if (heroRef.current) heroRef.current.style.setProperty('--sp', Math.min(y / 700, 1).toFixed(3))
      const cards = stackRef.current
      cards.forEach((el, i) => {
        if (!el) return
        const art = el.firstElementChild
        const next = cards[i + 1]
        if (!art || !next) return
        const stick = 100 + i * 22
        const d = next.getBoundingClientRect().top - stick
        const p = Math.min(Math.max(1 - d / el.offsetHeight, 0), 1)
        art.style.transform = `scale(${1 - p * 0.06})`
        art.style.filter = `brightness(${1 - p * 0.22})`
      })
    }
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update) }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [])

  const submit = (event) => {
    event.preventDefault()
    if (goal.trim()) sessionStorage.setItem('ws_goal', goal.trim())
    router.push(user ? '/dashboard' : '/inscription')
  }

  return (
    <div className="wx">
      <div className="wx-progress" ref={barRef} aria-hidden="true" />

      {/* ================= HERO ================= */}
      <section className="wx-hero" ref={heroRef}>
        <div className="wx-hero-bg" aria-hidden="true">
          <i className="wx-blob b1" /><i className="wx-blob b2" /><i className="wx-blob b3" />
          <i className="wx-gridbg" />
          <i className="wx-spot" />
        </div>

        <div className="wx-hero-copy">
          <div className="wx-badge"><i className="wx-live" /> L’école digitale qui vous met en mouvement</div>
          <h1 className="wx-h1">
            <Words text="Votre idée mérite" />
            <em><Words text="un vrai départ." start={3} /></em>
          </h1>
          <p className="wx-lead">Apprenez à créer, lancer et vendre vos produits digitaux avec un parcours clair, pratique et pensé pour avancer vraiment.</p>

          <form className="wx-search" onSubmit={submit}>
            <svg className="wx-search-ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z" /></svg>
            <input value={goal} onChange={(event) => setGoal(event.target.value)} placeholder="Quel est votre prochain objectif ?" aria-label="Votre prochain objectif" />
            <Magnetic strength={0.25}><button type="submit">Commencer <Arrow /></button></Magnetic>
          </form>

          <div className="wx-proof">
            <span className="wx-avatars"><i>AM</i><i>FK</i><i>SD</i></span>
            <span><strong>+2 500</strong> créateurs accompagnés</span>
            <span className="wx-stars">★★★★★</span>
          </div>
        </div>

        <div className="wx-stage" aria-hidden="true">
          <div className="wx-chip wx-chip-a"><i className="wx-chip-ico">↗</i><span><small>Progression</small><b>+38% ce mois-ci</b></span></div>
          <div className="wx-chip wx-chip-b"><i className="wx-chip-ico">✓</i><span><small>Prochaine étape</small><b>Publier mon offre</b></span></div>

          <div className="wx-window">
            <div className="wx-win-top">
              <span className="wx-dot" /><span className="wx-dot" /><span className="wx-dot" />
              <span className="wx-url">Mon parcours</span>
            </div>
            <div className="wx-win-body">
              <aside className="wx-side">
                <div className="wx-side-logo">W</div>
                <span className="on">Parcours</span><span>Formations</span><span>Ventes</span><span>Suivi</span>
              </aside>
              <div className="wx-main">
                <div className="wx-main-head">
                  <div><small>Objectif du mois</small><strong>Créer mon ebook</strong></div>
                  <div className="wx-ring"><b>68<em>%</em></b></div>
                </div>
                <div className="wx-grid">
                  <div className="wx-panel">
                    <small>Activité de la semaine</small>
                    <div className="wx-bars">
                      <span style={{ height: '32%' }} /><span style={{ height: '48%' }} /><span style={{ height: '42%' }} /><span style={{ height: '66%' }} /><span style={{ height: '58%' }} /><span className="hot" style={{ height: '88%' }} /><span style={{ height: '74%' }} />
                    </div>
                    <div className="wx-days"><small>L</small><small>M</small><small>M</small><small>J</small><small>V</small><small>S</small><small>D</small></div>
                  </div>
                  <div className="wx-panel wx-list">
                    <small>Mes étapes</small>
                    <div className="wx-row done"><i>✓</i><span>Page de vente</span></div>
                    <div className="wx-row done"><i>✓</i><span>Idée validée</span></div>
                    <div className="wx-row"><i /><span>Publier l’offre</span></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= DÉFILEMENT ================= */}
      <div className="wx-marq" aria-label="Thématiques proposées">
        <div className="wx-marq-row">
          {[0, 1].map((r) => themes.map((t) => <span key={`a${r}${t}`}>{t}<i>✦</i></span>))}
        </div>
        <div className="wx-marq-row rev">
          {[0, 1].map((r) => [...themes].reverse().map((t) => <span key={`b${r}${t}`}>{t}<i>✦</i></span>))}
        </div>
      </div>

      {/* ================= MÉTHODE ================= */}
      <section className="wx-sec wx-method" id="methode">
        <Reveal split className="wx-intro">
          <span className="wx-kicker">La méthode Winner</span>
          <h2 className="wx-h2"><Words text="Moins de théorie." /><em><Words text="Plus de mouvement." start={3} /></em></h2>
          <p>Chaque écran a une mission : vous aider à passer à l’étape suivante, sans vous perdre dans le bruit.</p>
        </Reveal>

        <div className="wx-stack">
          {steps.map((step, index) => (
            <div key={step.number} className="wx-stack-item" style={{ top: 100 + index * 22 }} ref={(el) => { stackRef.current[index] = el }}>
              <article className={`wx-card ${step.tone}`} onPointerMove={spot}>
                <div className="wx-card-info">
                  <div className="wx-card-top">
                    <span className="wx-card-n">{step.number}</span>
                    <span className="wx-card-l">Étape {index + 1}</span>
                  </div>
                  <div className="wx-card-body">
                    <h3>{step.title}</h3>
                    <p>{step.text}</p>
                    <Magnetic strength={0.3}><Link href="/parcours" className="wx-card-link">Voir le parcours <Arrow /></Link></Magnetic>
                  </div>
                </div>
                <div className={`wx-art ${step.art}`} aria-hidden="true">
                  {step.art === 'a1' && (<><i /><i /><i /><b>✦</b></>)}
                  {step.art === 'a2' && (<><i /><i /><i /><i /><i /></>)}
                  {step.art === 'a3' && (<><i className="orbit" /><i className="ring" /><b>◒</b></>)}
                </div>
              </article>
            </div>
          ))}
        </div>
      </section>

      {/* ================= STATS ================= */}
      <section className="wx-sec wx-stats-wrap">
        <div className="wx-stats">
          <i className="wx-blob s1" aria-hidden="true" /><i className="wx-blob s2" aria-hidden="true" />
          <Reveal split className="wx-stats-head">
            <span className="wx-kicker light">L’élan est collectif</span>
            <h2 className="wx-h2"><Words text="Des chiffres qui" /><em><Words text="donnent envie d’y aller." start={3} /></em></h2>
          </Reveal>
          <div className="wx-stats-grid">
            <Reveal className="wx-stat"><div onPointerMove={spot} className="wx-stat-in"><i className="wx-stat-line" /><strong><Counter value={2500} suffix="+" /></strong><span>créateurs dans la communauté</span></div></Reveal>
            <Reveal delay={0.12} className="wx-stat"><div onPointerMove={spot} className="wx-stat-in"><i className="wx-stat-line" /><strong><Counter value={94} suffix="%" /></strong><span>terminent leur premier parcours</span></div></Reveal>
            <Reveal delay={0.24} className="wx-stat"><div onPointerMove={spot} className="wx-stat-in"><i className="wx-stat-line" /><strong><Counter value={16} /></strong><span>formations pour passer à l’action</span></div></Reveal>
          </div>
        </div>
      </section>

      {/* ================= FORMATIONS ================= */}
      <section className="wx-sec wx-courses" id="formations">
        <Reveal split className="wx-intro">
          <span className="wx-kicker">Apprendre à son rythme</span>
          <h2 className="wx-h2"><Words text="Un parcours pour" /><em><Words text="chaque ambition." start={4} /></em></h2>
          <p>Choisissez votre point de départ. On s’occupe de la suite.</p>
        </Reveal>

        <div className="wx-showcase">
          <div className="wx-tabs" role="tablist" style={{ '--ai': activeCourse }}>
            <i className="wx-tab-ind" aria-hidden="true" />
            {courses.map((course, index) => (
              <button key={course.title} role="tab" aria-selected={activeCourse === index} className={activeCourse === index ? 'on' : ''} onClick={() => setActiveCourse(index)}>
                <span>0{index + 1}</span>{course.tag}
              </button>
            ))}
          </div>

          <div key={activeCourse} className={`wx-feature ${courses[activeCourse].color}`} onPointerMove={spot}>
            <div className="wx-feature-art" aria-hidden="true">
              <i className="c1" /><i className="c2" /><i className="c3" />
              <b>W</b>
            </div>
            <div className="wx-feature-body">
              <span className="wx-feature-tag">{courses[activeCourse].tag}</span>
              <h3>{courses[activeCourse].title}</h3>
              <p>Un atelier guidé pour construire quelque chose de concret, même si vous partez de zéro.</p>
              <small>{courses[activeCourse].meta}</small>
              <Magnetic strength={0.3}><Link className="wx-link" href="/formations">Explorer les formations <Arrow /></Link></Magnetic>
            </div>
          </div>
        </div>
      </section>

      {/* ================= CTA FINAL ================= */}
      <section className="wx-sec wx-final-wrap">
        <div className="wx-final">
          <i className="wx-blob f1" aria-hidden="true" /><i className="wx-blob f2" aria-hidden="true" />
          <Reveal split className="wx-final-in">
            <div className="wx-final-stars" aria-hidden="true">✦ ✦ ✦</div>
            <h2 className="wx-h2"><Words text="Le bon moment" /><em><Words text="c’est maintenant." start={3} /></em></h2>
            <p>Votre prochaine étape est plus proche que vous ne le pensez.</p>
            <Magnetic strength={0.4}><Link href={user ? '/dashboard' : '/inscription'} className="wx-cta">Commencer mon parcours <Arrow /></Link></Magnetic>
          </Reveal>
        </div>
      </section>
    </div>
  )
}
