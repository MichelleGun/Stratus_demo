import { useRef, type ReactNode } from 'react'
import { useStore, type Route } from '../lib/store'
import { Logo } from './Logo'
import { Icon } from './Icon'
import { PLANS } from '../lib/catalog'
import { ZoomButton, ZoomControl } from './ZoomControl'

const TABS: { r: Route; label: string; icon: string }[] = [
  { r: 'home', label: 'Home', icon: 'home' },
  { r: 'library', label: 'Library', icon: 'grid' },
  { r: 'plans', label: 'Plans', icon: 'tag' },
  { r: 'more', label: 'More', icon: 'more' },
]
const SIDE: { r: Route; label: string; icon: string }[] = [
  { r: 'home', label: 'Home', icon: 'home' },
  { r: 'library', label: 'Software Library', icon: 'grid' },
  { r: 'plans', label: 'Plans', icon: 'tag' },
  { r: 'hourbank', label: 'Hour Bank', icon: 'bank' },
  { r: 'teams', label: 'Teams', icon: 'users' },
  { r: 'settings', label: 'Settings', icon: 'settings' },
  { r: 'about', label: 'About', icon: 'info' },
]
const MORE_ROUTES: Route[] = ['more', 'hourbank', 'teams', 'settings', 'about']

export function useLogoTaps() {
  const { setDirector, director } = useStore()
  const taps = useRef<number[]>([])
  return () => {
    const now = Date.now()
    taps.current = [...taps.current.filter((t) => now - t < 1500), now]
    if (taps.current.length >= 5) {
      taps.current = []
      setDirector({ open: !director.open })
    }
  }
}

export function Shell({ children, title, action }: { children: ReactNode; title?: string; action?: ReactNode }) {
  const { route, go, s } = useStore()
  const tap = useLogoTaps()
  const activeTab = MORE_ROUTES.includes(route) ? 'more' : route === 'limit' ? 'plans' : route
  return (
    <div className="flex h-full w-full">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-white/5 bg-ink-950/60 px-4 py-6 lg:flex">
        <div className="px-2">
          <Logo onTap={tap} />
        </div>
        <nav className="mt-8 flex flex-col gap-1">
          {SIDE.map((t) => {
            const on = route === t.r || (t.r === 'plans' && route === 'limit')
            return (
              <button key={t.r} onClick={() => go(t.r)} className={'flex min-h-[44px] items-center gap-3 rounded-xl px-3 text-sm font-medium transition ' + (on ? 'bg-white/10 text-white' : 'text-ink-300 hover:bg-white/5 hover:text-white')}>
                <Icon name={t.icon} size={18} />
                {t.label}
              </button>
            )
          })}
        </nav>
        <div className="mt-auto mb-3 px-2">
          <div className="label mb-2">Display size</div>
          <ZoomControl compact />
        </div>
        <div className="card p-4">
          <div className="label">Current plan</div>
          <div className="mt-1 font-semibold text-white">{PLANS[s.plan].name}</div>
          <div className="text-xs text-ink-400">{PLANS[s.plan].spec}</div>
          <button className="btn-ghost mt-3 w-full text-sm" onClick={() => go('plans')}>
            Change plan
          </button>
        </div>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="safe-x safe-t-flow sticky top-0 z-20 flex items-center justify-between border-b border-white/5 bg-ink-900/85 backdrop-blur lg:hidden" style={{ minHeight: 56 }}>
          <Logo size={26} onTap={tap} />
          <div className="flex items-center gap-2">
            <ZoomButton />
            {action}
          </div>
        </header>
        <main className="scroll-y thin-scroll min-h-0 flex-1">
          <div className="safe-x mx-auto w-full max-w-5xl pb-28 pt-5 lg:pb-12 lg:pt-10">
            {title && (
              <div className="mb-5 flex items-center justify-between gap-3">
                <h1 className="text-2xl font-bold tracking-tight text-white lg:text-3xl" style={{ textWrap: 'balance' }}>
                  {title}
                </h1>
                <div className="hidden lg:block">{action}</div>
              </div>
            )}
            {children}
          </div>
        </main>
        <nav className="safe-b fixed inset-x-0 bottom-0 z-30 border-t border-white/5 bg-ink-950/90 backdrop-blur lg:hidden" style={{ paddingLeft: 'env(safe-area-inset-left,0px)', paddingRight: 'env(safe-area-inset-right,0px)' }}>
          <div className="mx-auto grid max-w-md grid-cols-4">
            {TABS.map((t) => {
              const on = activeTab === t.r
              return (
                <button key={t.r} onClick={() => go(t.r)} className={'flex min-h-[56px] flex-col items-center justify-center gap-1 text-[11px] font-semibold ' + (on ? 'text-white' : 'text-ink-400')}>
                  <span className={'flex h-7 w-12 items-center justify-center rounded-full transition ' + (on ? 'bg-white/10' : '')}>
                    <Icon name={t.icon} size={20} />
                  </span>
                  {t.label}
                </button>
              )
            })}
          </div>
        </nav>
      </div>
    </div>
  )
}

export function Sheet({ open, onClose, children, title }: { open: boolean; onClose: () => void; children: ReactNode; title?: string }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center" onClick={onClose}>
      <div
        className="anim-rise safe-b w-full max-w-md rounded-t-3xl bg-ink-850 p-6 ring-1 ring-white/10 sm:rounded-3xl"
        style={{ paddingBottom: 'max(24px, env(safe-area-inset-bottom, 0px))' }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          {title && <h2 className="text-lg font-bold text-white">{title}</h2>}
          <button onClick={onClose} className="-mr-2 -mt-2 flex h-11 w-11 items-center justify-center rounded-full text-ink-300 hover:bg-white/10" aria-label="Close">
            <Icon name="x" />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

export function Toasts() {
  const { toasts, director } = useStore()
  if (director.clean) return null
  return (
    <div className="pointer-events-none fixed inset-x-0 z-[70] flex flex-col items-center gap-2 px-4" style={{ top: 'calc(env(safe-area-inset-top, 0px) + 64px)' }}>
      {toasts.map((t) => (
        <div key={t.id} className="anim-pop flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-semibold text-ink-900 shadow-2xl">
          <span className={'flex h-5 w-5 items-center justify-center rounded-full ' + (t.tone === 'info' ? 'bg-sky-500' : 'bg-emerald-500')}>
            <Icon name={t.tone === 'info' ? 'info' : 'check'} size={13} className="text-white" stroke={3} />
          </span>
          {t.text}
        </div>
      ))}
    </div>
  )
}

export function PlanChip({ plan }: { plan: 'free' | 'standard' | 'pro' }) {
  const cls = plan === 'pro' ? 'bg-violet-500/20 text-violet-400' : plan === 'standard' ? 'bg-sky-500/15 text-sky-400' : 'bg-emerald-500/15 text-emerald-300'
  return <span className={'chip ' + cls}>{PLANS[plan].name}</span>
}
