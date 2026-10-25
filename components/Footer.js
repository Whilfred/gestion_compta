import Link from 'next/link'
export default function Footer() {
  return (
    <footer>
      <span>© 2026 The Winner School. Tous droits réservés.</span>
      <nav aria-label="Pied de page">
        <Link href="/parcours">Parcours</Link><Link href="/formations">Formations</Link>
        <Link href="/suivi">Suivi</Link><Link href="/tarifs">Tarifs</Link><Link href="/a-propos">À propos</Link><Link href="/contact">Contact</Link>
      </nav>
    </footer>
  )
}
