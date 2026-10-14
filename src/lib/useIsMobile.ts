import { useEffect, useState } from 'react'

function check() {
  return window.innerWidth < 900 || (window.matchMedia && window.matchMedia('(pointer: coarse)').matches && window.innerWidth < 1100)
}

export function useIsMobile() {
  const [m, setM] = useState(check)
  useEffect(() => {
    const on = () => setM(check())
    window.addEventListener('resize', on)
    return () => window.removeEventListener('resize', on)
  }, [])
  return m
}

export function useIsPortrait() {
  const [p, setP] = useState(() => window.innerHeight > window.innerWidth)
  useEffect(() => {
    const on = () => setP(window.innerHeight > window.innerWidth)
    window.addEventListener('resize', on)
    return () => window.removeEventListener('resize', on)
  }, [])
  return p
}

export function useReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}
