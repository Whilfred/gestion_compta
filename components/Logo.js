import Link from 'next/link'
export default function Logo({ href = '/' }) {
  return (
    <Link href={href} className="logo" aria-label="Compta Ecom">
      <svg viewBox="0 0 32 32" aria-hidden="true">
        <rect width="32" height="32" rx="9" fill="#4c8dff" />
        <path d="M8 21l5-5 4 3 7-8" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      Compta Ecom
    </Link>
  )
}
