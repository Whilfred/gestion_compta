import './globals.css'

export const metadata = {
  title: 'Compta Ecom — La compta de votre boutique, chaque jour',
  description: 'Suivez vos ventes, vos dépenses pub et votre bénéfice net au jour le jour. Pensé pour les e-commerçants de produits physiques.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  )
}
