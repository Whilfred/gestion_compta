import './globals.css'
import Background from '../components/Background'
import Header from '../components/Header'
import Footer from '../components/Footer'
import CTA from '../components/CTA'

export const metadata = {
  title: 'The Winner School — Formation aux produits digitaux',
  description: 'Apprenez à créer, lancer et vendre vos produits digitaux.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body>
        <Background />
        <Header />
        <main>{children}</main>
        <CTA />
        <Footer />
      </body>
    </html>
  )
}
