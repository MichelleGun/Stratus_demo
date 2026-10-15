import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { SOURCES, type Source, type SourceId } from '../../data/ideation-sources'

// Source chip. Blue and clickable when there is a verified link, grey when the
// source is the team's own research or arithmetic. `tone="light"` is for chips
// that sit on a light surface, such as the sticky notes.
export function Src({ id, tone = 'dark' }: { id: SourceId; tone?: 'dark' | 'light' }) {
  const s: Source = SOURCES[id]
  if (!s.url) {
    return (
      <span className={'ml-1 whitespace-nowrap rounded-full px-2 py-0.5 align-middle text-[11px] font-medium ' + (tone === 'light' ? 'bg-black/10 text-black/60' : 'bg-white/5 text-ink-400')}>
        {s.label}
      </span>
    )
  }
  return (
    <a
      href={s.url}
      target="_blank"
      rel="noopener noreferrer"
      className={
        'ml-1 inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2 py-0.5 align-middle text-[11px] font-semibold ring-1 ' +
        (tone === 'light' ? 'bg-white/70 text-blue-800 ring-blue-700/30 hover:bg-white' : 'bg-sky-400/10 text-sky-300 ring-sky-400/30 hover:bg-sky-400/20')
      }
      title={s.title}
    >
      {s.label}
      <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M7 17 17 7M9 7h8v8" />
      </svg>
    </a>
  )
}

export function Chapter({ id, n, kicker, title, children }: { id: string; n: string; kicker: string; title: string; children: ReactNode }) {
  return (
    <section id={`ch-${id}`} data-chapter={id} className="scroll-mt-20 border-t border-white/5 pt-10 pb-4 first:border-0">
      <div className="flex items-baseline gap-3">
        <span className="tabnum font-mono text-sm font-semibold text-sky-400">{n}</span>
        <span className="label">{kicker}</span>
      </div>
      <h2 className="mt-2 text-2xl font-bold leading-tight tracking-tight text-white lg:text-[34px]" style={{ textWrap: 'balance' }}>
        {title}
      </h2>
      <div className="mt-6">{children}</div>
    </section>
  )
}

export function Found({ label, children, className = '' }: { label?: string; children: ReactNode; className?: string }) {
  return (
    <div className={'rounded-2xl bg-white/[.04] p-4 ring-1 ring-white/10 lg:p-5 ' + className}>
      {label && <div className="label mb-2">{label}</div>}
      <div className="text-[15px] leading-relaxed text-ink-100">{children}</div>
    </div>
  )
}

export function Does({ label, children, className = '' }: { label?: string; children: ReactNode; className?: string }) {
  return (
    <div className={'rounded-2xl bg-sky-400/[.08] p-4 ring-1 ring-sky-400/40 lg:p-5 ' + className}>
      {label && <div className="mb-2 text-[11px] font-semibold uppercase tracking-[.08em] text-sky-300">{label}</div>}
      <div className="text-[15px] leading-relaxed text-ink-100">{children}</div>
    </div>
  )
}

// A lead or open question, not a finding. Dashed, like the team's slides.
export function Lead({ label = 'A lead to check, not a finding', children, className = '' }: { label?: string; children: ReactNode; className?: string }) {
  return (
    <div className={'rounded-2xl border border-dashed border-white/25 p-3.5 ' + className}>
      <div className="label mb-1.5">{label}</div>
      <div className="text-[14px] leading-relaxed text-ink-200">{children}</div>
    </div>
  )
}

export function Arrow({ down = false }: { down?: boolean }) {
  return (
    <div className={'flex items-center justify-center text-ink-500 ' + (down ? 'py-1' : 'py-1 lg:px-1 lg:py-0')} aria-hidden="true">
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={down ? '' : 'rotate-90 lg:rotate-0'}>
        <path d="M5 12h14M13 6l6 6-6 6" />
      </svg>
    </div>
  )
}

export function Legend({ lead = false }: { lead?: boolean }) {
  return (
    <div className="flex flex-wrap gap-4 text-xs text-ink-400">
      <span className="flex items-center gap-2"><span className="h-3 w-3 rounded bg-white/10 ring-1 ring-white/20" />What we found</span>
      <span className="flex items-center gap-2"><span className="h-3 w-3 rounded bg-sky-400/20 ring-1 ring-sky-400/60" />What Stratus does</span>
      {lead && <span className="flex items-center gap-2"><span className="h-3 w-3 rounded border border-dashed border-white/40" />A lead or open question</span>}
    </div>
  )
}

// Scroll reveal. Each element fades and rises into place the first time it
// scrolls into view, and `delay` staggers neighbours so a diagram builds in
// reading order. `force` lets a parent drive the timing (the pannable board).
// With reduced motion, or no IntersectionObserver, everything is just shown.
const still = () => typeof window === 'undefined' || !('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches

export function useReveal<T extends HTMLElement = HTMLDivElement>(delay = 0, force?: boolean) {
  const ref = useRef<T>(null)
  const [seen, setSeen] = useState(still)
  useEffect(() => {
    if (seen || force !== undefined) return
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      (es) => {
        if (es.some((e) => e.isIntersecting)) {
          setSeen(true)
          io.disconnect()
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [seen, force])
  const on = force ?? seen
  const style: CSSProperties = {
    opacity: on ? 1 : 0,
    transform: on ? 'none' : 'translateY(22px) scale(.98)',
    transition: `opacity .65s ease ${delay}ms, transform .65s cubic-bezier(.2,.7,.2,1) ${delay}ms`,
  }
  return { ref, style, on }
}

export function Reveal({ delay = 0, className = '', bg, children }: { delay?: number; className?: string; bg?: CSSProperties; children: ReactNode }) {
  const { ref, style } = useReveal(delay)
  return (
    <div ref={ref} style={{ ...bg, ...style }} className={className}>
      {children}
    </div>
  )
}
