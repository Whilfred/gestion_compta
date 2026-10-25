"use client"
import { useState } from 'react'

export default function ContactForm() {
  const [sent, setSent] = useState(false)
  return (
    <section className="first">
      <form className="auth glass" onSubmit={(e) => { e.preventDefault(); setSent(true) }}>
        <h2>Contactez-nous</h2>
        <p>Une question sur les parcours ou les formations ? Écrivez-nous.</p>
        <input type="text" placeholder="Votre nom" required autoComplete="name" />
        <input type="email" placeholder="Adresse e-mail" required autoComplete="email" />
        <textarea placeholder="Votre message" required />
        <button className="btn btn-blue" type="submit">Envoyer le message</button>
        {sent && <small role="status">Merci ! Votre message a bien été pris en compte.</small>}
      </form>
    </section>
  )
}
