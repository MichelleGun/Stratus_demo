import { useEffect, useRef, useState } from 'react'
import { ZOOM_STEPS, setZoom, stepZoom, useZoom } from '../lib/zoom'

export function ZoomControl({ compact = false }: { compact?: boolean }) {
  const z = useZoom()
  const h = compact ? 'h-9 w-9' : 'h-11 w-11'
  return (
    <div className="flex items-center gap-1 rounded-xl bg-white/5 p-1 ring-1 ring-white/10">
      <button className={`${h} flex items-center justify-center rounded-lg text-sm font-bold text-white hover:bg-white/10 disabled:opacity-30`} onClick={() => stepZoom(-1)} disabled={z === ZOOM_STEPS[0]} aria-label="Smaller">
        A−
      </button>
      <button className={`${compact ? 'h-9' : 'h-11'} tabnum min-w-[56px] rounded-lg px-1 text-xs font-semibold text-ink-200 hover:bg-white/10`} onClick={() => setZoom(1)} aria-label="Reset size" title="Reset to 100%">
        {Math.round(z * 100)}%
      </button>
      <button className={`${h} flex items-center justify-center rounded-lg text-base font-bold text-white hover:bg-white/10 disabled:opacity-30`} onClick={() => stepZoom(1)} disabled={z === ZOOM_STEPS[ZOOM_STEPS.length - 1]} aria-label="Bigger">
        A+
      </button>
    </div>
  )
}

// "Aa" button that pops the size control open. `up` opens above the button.
export function ZoomButton({ up = false, className = '' }: { up?: boolean; className?: string }) {
  const [open, setOpen] = useState(false)
  const box = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!open) return
    const off = (e: PointerEvent) => {
      if (box.current && !box.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', off)
    return () => document.removeEventListener('pointerdown', off)
  }, [open])
  return (
    <div ref={box} className={'relative ' + className}>
      <button onClick={() => setOpen(!open)} className={'flex h-10 min-w-[44px] items-center justify-center rounded-xl px-2 text-sm font-bold ' + (open ? 'bg-white/15 text-white' : 'text-ink-200 hover:bg-white/10')} aria-label="Display size" aria-expanded={open}>
        Aa
      </button>
      {open && (
          <div className={'anim-pop absolute right-0 z-[800] rounded-2xl bg-ink-850 p-3 shadow-2xl ring-1 ring-white/10 ' + (up ? 'bottom-full mb-2' : 'top-full mt-2')}>
            <div className="mb-2 text-xs font-semibold text-ink-300">Display size</div>
            <ZoomControl />
          </div>
      )}
    </div>
  )
}
