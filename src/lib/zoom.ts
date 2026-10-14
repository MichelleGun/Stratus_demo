import { useEffect, useState } from 'react'

// In-app display size, for phones where there is no Ctrl + / Ctrl -.
export const ZOOM_STEPS = [0.75, 0.85, 1, 1.15, 1.3, 1.5]
const KEY = 'stratus.zoom'
const subs = new Set<(z: number) => void>()

function read(): number {
  try {
    const v = Number(localStorage.getItem(KEY))
    if (ZOOM_STEPS.includes(v)) return v
  } catch {
    /* storage blocked */
  }
  return 1
}

let current = read()

function apply(z: number) {
  document.documentElement.style.zoom = z === 1 ? '' : String(z)
}

export function initZoom() {
  apply(current)
}

export function setZoom(z: number) {
  current = z
  apply(z)
  try {
    localStorage.setItem(KEY, String(z))
  } catch {
    /* storage blocked */
  }
  subs.forEach((f) => f(z))
  window.dispatchEvent(new Event('resize'))
}

export function stepZoom(dir: 1 | -1) {
  const i = ZOOM_STEPS.indexOf(current)
  const next = ZOOM_STEPS[Math.max(0, Math.min(ZOOM_STEPS.length - 1, i + dir))]
  if (next !== current) setZoom(next)
}

export function useZoom() {
  const [z, setZ] = useState(current)
  useEffect(() => {
    subs.add(setZ)
    return () => {
      subs.delete(setZ)
    }
  }, [])
  return z
}
