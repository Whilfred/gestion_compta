"use client"
// Masquage des chiffres (CA, nombre de ventes, bénéfices…) : affichés « xxxx » quand c'est activé.
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { num as n0, xof as x0 } from './format'

const KEY = 'ec_hide'
const Ctx = createContext({ hidden: false, toggle() {}, xof: x0, num: n0, cnt: (n) => n })
export const MASK = 'xxxx'

export function PrivacyProvider({ initial = false, children }) {
  const [hidden, setHidden] = useState(initial)
  // Le choix fait sur cet appareil (œil) passe avant le réglage par défaut de la boutique
  useEffect(() => {
    try { const v = localStorage.getItem(KEY); setHidden(v === null ? initial : v === '1') } catch { setHidden(initial) }
  }, [initial])
  const toggle = useCallback(() => setHidden((h) => { try { localStorage.setItem(KEY, h ? '0' : '1') } catch {} return !h }), [])
  const value = useMemo(() => ({
    hidden, toggle,
    xof: (n) => (hidden ? `${MASK} FCFA` : x0(n)),
    num: (n) => (hidden ? MASK : n0(n)),
    cnt: (n) => (hidden ? MASK : n),
  }), [hidden, toggle])
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export const useFmt = () => useContext(Ctx)
