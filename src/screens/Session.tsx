import { ZoomButton } from '../components/ZoomControl'
import { Component, lazy, Suspense, type ReactNode, useCallback, useEffect, useMemo, useRef, useState, type ComponentType } from 'react'
import { useStore, firstName } from '../lib/store'
import { appById, dockFor, PLANS, planAllows, REGION_LATENCY, type AppId, type PlanId } from '../lib/catalog'
import { AppIcon } from '../components/AppIcon'
import { Icon } from '../components/Icon'
import { CloudMark } from '../components/Logo'
import { useIsMobile, useIsPortrait } from '../lib/useIsMobile'
import { rng, gauss } from '../lib/prng'

export interface AppProps {
  autoplay?: boolean
  mobile: boolean
}

const LOADERS: Record<AppId, () => Promise<{ default: ComponentType<AppProps> }>> = {
  vscode: () => import('../apps/VSCode'),
  spreadsheet: () => import('../apps/Spreadsheet'),
  studio3d: () => import('../apps/Studio3D'),
  logs: () => import('../apps/LogAnalytics'),
  bi: () => import('../apps/BIDashboard'),
  game: () => import('../apps/GameEngine'),
  notebook: () => import('../apps/Notebook'),
  qualitative: () => import('../apps/Qualitative'),
  video: () => import('../apps/VideoEditor'),
  cad: () => import('../apps/CAD'),
  arch: () => import('../apps/Architecture'),
}
const LAZY = Object.fromEntries(Object.entries(LOADERS).map(([k, f]) => [k, lazy(f)])) as unknown as Record<AppId, ComponentType<AppProps>>

interface Win {
  id: AppId
  x: number
  y: number
  w: number
  h: number
  z: number
  min: boolean
  max: boolean
}

const MONTAGE: { app: AppId; field: string }[] = [
  { app: 'logs', field: 'Cybersecurity' },
  { app: 'bi', field: 'Business' },
  { app: 'qualitative', field: 'Social science' },
  { app: 'notebook', field: 'AI' },
  { app: 'game', field: 'Game design' },
]

function fmtTime(sec: number) {
  const h = Math.floor(sec / 3600)
  const m = Math.floor((sec % 3600) / 60)
  const s = Math.floor(sec % 60)
  return (h ? h + ':' : '') + String(m).padStart(h ? 2 : 1, '0') + ':' + String(s).padStart(2, '0')
}

// Keeps one app's crash inside its own window so the session never goes blank.
class AppBoundary extends Component<{ name: string; onClose: () => void; children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  componentDidCatch(e: unknown) {
    console.warn('App crashed', e)
  }
  render() {
    if (!this.state.failed) return this.props.children
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 bg-[#1b1f2a] p-6 text-center text-sm text-ink-200">
        <div className="font-semibold text-white">{this.props.name} needs a restart</div>
        <button className="btn-ghost" onClick={() => this.setState({ failed: false })}>
          Restart app
        </button>
        <button className="text-ink-400 underline" onClick={this.props.onClose}>
          Close window
        </button>
      </div>
    )
  }
}

function Skeleton() {
  return (
    <div className="flex h-full flex-col gap-3 bg-[#1b1f2a] p-4">
      <div className="skeleton h-8 w-1/3 rounded-lg" />
      <div className="skeleton h-4 w-2/3 rounded" />
      <div className="skeleton flex-1 rounded-xl" />
    </div>
  )
}

export function Session() {
  const { s, set, go, launch, director, sfx, film, toast } = useStore()
  const mobile = useIsMobile()
  const portrait = useIsPortrait()
  const req = launch ?? { apps: s.saved?.apps ?? (['vscode'] as AppId[]), plan: s.plan }
  const [plan, setPlan] = useState<PlanId>(req.plan)
  const price = PLANS[plan].price
  const [seconds, setSeconds] = useState(0)
  const [cost, setCost] = useState(0)
  const [limit, setLimit] = useState(s.limit)
  const [limitHit, setLimitHit] = useState(false)
  const [freeMode, setFreeMode] = useState(false)
  const [lowBw, setLowBw] = useState(s.lowBandwidthDefault)
  const [hudOpen, setHudOpen] = useState(true)
  const [rotateHint, setRotateHint] = useState(() => !film)
  const [trackpad, setTrackpad] = useState(false)
  const [pillOpen, setPillOpen] = useState(() => window.innerHeight > window.innerWidth)
  const [cursor, setCursor] = useState({ x: 200, y: 200 })
  const [ending, setEnding] = useState(false)
  const [lower, setLower] = useState<string | null>(null)
  const zTop = useRef(10)
  const frameRef = useRef<HTMLDivElement>(null)
  const low = lowBw || director.forceLowBw

  const initialWins = useMemo<Win[]>(() => {
    const ids = req.montage ? [MONTAGE[0].app] : req.apps
    return ids.map((id, i) => ({ id, x: 60 + i * 40, y: 40 + i * 30, w: 980, h: 620, z: ++zTop.current, min: false, max: true }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  const [wins, setWins] = useState<Win[]>(initialWins)
  const active = useMemo(() => [...wins].filter((w) => !w.min).sort((a, b) => b.z - a.z)[0]?.id ?? null, [wins])

  const openApp = useCallback(
    (id: AppId) => {
      const app = appById(id)!
      if (!planAllows(plan, app.plan)) {
        setPlan(app.plan)
        toast(`Switched to ${PLANS[app.plan].name} for ${app.name}`, 'info')
      }
      setWins((ws) => {
        const ex = ws.find((w) => w.id === id)
        const z = ++zTop.current
        if (ex) return ws.map((w) => (w.id === id ? { ...w, min: false, z } : w))
        const n = ws.length
        return [...ws, { id, x: 80 + n * 36, y: 50 + n * 28, w: 940, h: 600, z, min: false, max: mobile }]
      })
      set({ recent: [{ app: id, at: Date.now() }, ...s.recent.filter((r) => r.app !== id)].slice(0, 8) })
    },
    [plan, mobile, set, s.recent, toast],
  )

  // Record the launched apps in recents once.
  useEffect(() => {
    sfx(1180)
    const ids = req.apps
    set({ recent: [...ids.map((a) => ({ app: a, at: Date.now() })), ...s.recent.filter((r) => !ids.includes(r.app))].slice(0, 8) })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Clock: session time and cost.
  useEffect(() => {
    if (limitHit || ending) return
    const id = window.setInterval(() => {
      setSeconds((x) => x + 0.25 * director.speed)
      if (!freeMode) setCost((c) => c + (0.25 * director.speed * price) / 3600)
    }, 250)
    return () => window.clearInterval(id)
  }, [director.speed, price, limitHit, ending, freeMode])

  const saveSession = useCallback(
    (c: number, sec: number) => {
      set({ saved: { apps: wins.map((w) => w.id), active, seconds: sec, cost: c, plan, savedAt: Date.now() } })
    },
    [set, wins, active, plan],
  )

  useEffect(() => {
    if (!limitHit && !freeMode && price > 0 && cost >= limit) {
      setLimitHit(true)
      saveSession(cost, seconds)
      sfx(520)
    }
  }, [cost, limit, limitHit, freeMode, price, saveSession, seconds, sfx])

  // Director hooks.
  const lastLimitNow = useRef(director.limitNow)
  useEffect(() => {
    if (director.limitNow !== lastLimitNow.current) {
      lastLimitNow.current = director.limitNow
      setCost(limit)
      setFreeMode(false)
    }
  }, [director.limitNow, limit])
  const lastOpen = useRef(director.openApp?.n ?? 0)
  useEffect(() => {
    if (director.openApp && director.openApp.n !== lastOpen.current) {
      lastOpen.current = director.openApp.n
      openApp(director.openApp.id)
    }
  }, [director.openApp, openApp])

  // Montage: cycle apps in one session.
  useEffect(() => {
    if (!req.montage) return
    let k = 0
    setLower(MONTAGE[0].field)
    const id = window.setInterval(() => {
      k = (k + 1) % MONTAGE.length
      const m = MONTAGE[k]
      setWins([{ id: m.app, x: 0, y: 0, w: 900, h: 600, z: ++zTop.current, min: false, max: true }])
      setLower(m.field)
    }, 3500)
    return () => window.clearInterval(id)
  }, [req.montage])

  useEffect(() => {
    if (!rotateHint) return
    const t = window.setTimeout(() => setRotateHint(false), 6000)
    return () => window.clearTimeout(t)
  }, [rotateHint])

  // Seeded jitter for stream metrics.
  const jitter = useMemo(() => {
    const r = rng(5)
    return Array.from({ length: 240 }, () => gauss(r))
  }, [])
  const tick = Math.floor(seconds / Math.max(1, director.speed / 2)) % 240
  const baseLat = REGION_LATENCY[s.region] ?? 18
  const latency = Math.max(9, Math.round(baseLat + jitter[tick] * 1.6 + (low ? 6 : 0)))
  const fps = low ? 30 : Math.min(60, Math.round(59.6 + jitter[(tick + 40) % 240] * 0.4))
  const mbps = low ? (5.2 + jitter[(tick + 80) % 240] * 0.3).toFixed(1) : (24 + jitter[(tick + 80) % 240] * 1.8).toFixed(1)
  const quality = latency < 30 ? 'good' : latency < 60 ? 'ok' : 'bad'
  const dock = dockFor(film?.startsWith('film-app') || req.montage ? null : s.industry, s.extraDock)
  const dockApps = [...dock, ...wins.map((w) => w.id).filter((id) => !dock.includes(id))]

  const endSession = () => {
    saveSession(cost, seconds)
    setEnding(true)
    window.setTimeout(() => go('home'), 900)
  }

  // Desktop drag and resize.
  const drag = useRef<{ id: AppId; mode: 'move' | 'size'; sx: number; sy: number; ox: number; oy: number; ow: number; oh: number } | null>(null)
  useEffect(() => {
    const move = (e: PointerEvent) => {
      const d = drag.current
      if (!d) return
      const dx = e.clientX - d.sx
      const dy = e.clientY - d.sy
      setWins((ws) => ws.map((w) => (w.id !== d.id ? w : d.mode === 'move' ? { ...w, x: d.ox + dx, y: Math.max(0, d.oy + dy) } : { ...w, w: Math.max(420, d.ow + dx), h: Math.max(300, d.oh + dy) })))
    }
    const up = () => (drag.current = null)
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
    return () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
    }
  }, [])

  const focusWin = (id: AppId) => setWins((ws) => ws.map((w) => (w.id === id ? { ...w, z: ++zTop.current, min: false } : w)))
  const closeWin = (id: AppId) => setWins((ws) => ws.filter((w) => w.id !== id))
  const minWin = (id: AppId) => setWins((ws) => ws.map((w) => (w.id === id ? { ...w, min: true } : w)))
  const maxWin = (id: AppId) => setWins((ws) => ws.map((w) => (w.id === id ? { ...w, max: !w.max, z: ++zTop.current } : w)))

  const showKeyboard = () => {
    const root = frameRef.current
    if (!root) return
    const target = root.querySelector<HTMLElement>(`[data-win="${active}"] [data-primary-input]`) || root.querySelector<HTMLElement>(`[data-win="${active}"] textarea, [data-win="${active}"] input`)
    if (target) {
      target.focus()
      toast('Keyboard connected to ' + (appById(active ?? 'vscode')?.name ?? 'app'), 'info')
    } else toast('This app does not need typing', 'info')
  }
  const fullscreen = () => {
    try {
      const el = document.documentElement
      if (document.fullscreenElement) document.exitFullscreen().catch(() => {})
      else el.requestFullscreen?.().catch(() => toast('Fullscreen is not available here', 'info'))
    } catch {
      toast('Fullscreen is not available here', 'info')
    }
  }

  // Trackpad mode: a virtual cursor driven by drag deltas.
  const tp = useRef<{ x: number; y: number; t: number; moved: boolean } | null>(null)
  const onTpStart = (e: React.TouchEvent) => {
    const t = e.touches[0]
    tp.current = { x: t.clientX, y: t.clientY, t: Date.now(), moved: false }
  }
  const onTpMove = (e: React.TouchEvent) => {
    const t = e.touches[0]
    const p = tp.current
    if (!p) return
    const dx = (t.clientX - p.x) * 1.6
    const dy = (t.clientY - p.y) * 1.6
    if (Math.abs(dx) + Math.abs(dy) > 2) p.moved = true
    p.x = t.clientX
    p.y = t.clientY
    setCursor((c) => ({ x: Math.max(0, Math.min(window.innerWidth - 4, c.x + dx)), y: Math.max(0, Math.min(window.innerHeight - 4, c.y + dy)) }))
  }
  const onTpEnd = (e: React.TouchEvent) => {
    const p = tp.current
    tp.current = null
    if (!p || p.moved || Date.now() - p.t > 300) return
    e.preventDefault()
    const overlay = e.currentTarget as HTMLElement
    overlay.style.pointerEvents = 'none'
    const el = document.elementFromPoint(cursor.x, cursor.y) as HTMLElement | null
    overlay.style.pointerEvents = ''
    if (el) {
      el.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, clientX: cursor.x, clientY: cursor.y }))
      el.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, clientX: cursor.x, clientY: cursor.y }))
      el.click()
      if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) el.focus()
    }
  }

  const hudVisible = director.hud
  const pct = Math.min(1, cost / Math.max(0.01, limit))
  const clock = new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })

  return (
    <div className="fixed inset-0 flex flex-col bg-black" style={{ paddingLeft: 'env(safe-area-inset-left,0px)', paddingRight: 'env(safe-area-inset-right,0px)' }}>
      {hudVisible && (
        <div className="safe-t z-40 shrink-0 border-b border-white/5 bg-ink-950/95 backdrop-blur">
          {hudOpen ? (
            <div className="flex min-h-[44px] items-center gap-2 px-2 text-xs sm:gap-4 sm:px-3">
              <CloudMark size={22} />
              <div className="tabnum flex items-center gap-1.5 font-semibold text-white">
                <Icon name="clock" size={14} className="text-ink-400" />
                {fmtTime(seconds)}
              </div>
              <div className="flex min-w-0 items-center gap-2">
                <span className="tabnum font-semibold text-white">{freeMode ? 'Free' : `$${cost.toFixed(2)}`}</span>
                <div className="hidden h-1.5 w-20 overflow-hidden rounded-full bg-white/10 sm:block" title="Spending limit">
                  <div className={'h-full rounded-full ' + (pct > 0.85 ? 'bg-rose-400' : 'brand-bg')} style={{ width: `${pct * 100}%` }} />
                </div>
                <span className="tabnum hidden text-ink-400 sm:inline">of ${limit}</span>
              </div>
              <div className="tabnum hidden items-center gap-3 text-ink-300 md:flex">
                <span>{latency} ms</span>
                <span>{fps} fps</span>
                <span>{mbps} Mbps</span>
              </div>
              <span className={'h-2.5 w-2.5 shrink-0 rounded-full ' + (quality === 'good' ? 'bg-emerald-400' : quality === 'ok' ? 'bg-amber-400' : 'bg-rose-500')} title={`Connection ${quality}`} />
              <span className="tabnum text-ink-300 md:hidden">{latency} ms</span>
              <button onClick={() => setLowBw(!lowBw)} className={'hidden min-h-[32px] rounded-full px-2.5 font-semibold sm:block ' + (low ? 'bg-amber-400/20 text-amber-300' : 'bg-white/5 text-ink-300')}>
                {low ? 'Saving data' : 'Low bandwidth'}
              </button>
              <span className="chip hidden bg-white/5 text-ink-200 lg:inline-flex">
                {PLANS[plan].name} · {s.region}
              </span>
              <div className="ml-auto flex items-center gap-1">
                <button onClick={() => setHudOpen(false)} className="flex h-9 w-9 items-center justify-center rounded-lg text-ink-300 hover:bg-white/10" aria-label="Collapse bar">
                  <Icon name="chevron" size={16} className="-rotate-90" />
                </button>
                <button onClick={endSession} className="min-h-[34px] rounded-lg bg-rose-500/90 px-3 font-semibold text-white">
                  End
                  <span className="hidden sm:inline">&nbsp;session</span>
                </button>
              </div>
            </div>
          ) : (
            <button onClick={() => setHudOpen(true)} className="tabnum flex min-h-[28px] w-full items-center justify-center gap-2 text-[11px] text-ink-300">
              <span className={'h-2 w-2 rounded-full ' + (quality === 'good' ? 'bg-emerald-400' : 'bg-amber-400')} />
              {fmtTime(seconds)} · ${cost.toFixed(2)} · {latency} ms
              <Icon name="chevron" size={12} className="rotate-90" />
            </button>
          )}
        </div>
      )}

      <div ref={frameRef} className="relative min-h-0 flex-1 overflow-hidden" style={{ filter: limitHit ? 'grayscale(.8) brightness(.45)' : low ? 'blur(.6px) saturate(.85) contrast(.95)' : undefined, transition: 'filter .3s' }}>
        <div className="absolute inset-0" style={{ background: 'radial-gradient(80% 90% at 20% 10%, #1E3A8A 0%, transparent 60%), radial-gradient(70% 80% at 90% 90%, #5B21B6 0%, transparent 60%), #0B1020' }} />
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-[.06]">
          <CloudMark size={260} />
        </div>
        <div className="absolute left-4 top-4 text-sm font-semibold text-white/70">Stratus Desktop</div>

        <div className="absolute inset-0 bottom-12">
          {wins.map((w) => {
            const app = appById(w.id)!
            const Comp = LAZY[w.id]
            const max = mobile || w.max
            const hidden = w.min || (mobile && w.id !== active)
            return (
              <div
                key={w.id}
                data-win={w.id}
                className={'absolute flex flex-col overflow-hidden bg-[#1b1f2a] shadow-2xl ' + (max ? '' : 'rounded-xl ring-1 ring-white/10')}
                style={max ? { inset: 0, zIndex: w.z, display: hidden ? 'none' : 'flex' } : { left: w.x, top: w.y, width: w.w, height: w.h, zIndex: w.z, display: hidden ? 'none' : 'flex' }}
                onPointerDown={() => w.id !== active && focusWin(w.id)}
              >
                <div
                  className="flex h-9 shrink-0 select-none items-center gap-2 border-b border-black/40 bg-[#14171f] px-2 text-xs text-ink-200"
                  onPointerDown={(e) => {
                    if (max || (e.target as HTMLElement).closest('button')) return
                    drag.current = { id: w.id, mode: 'move', sx: e.clientX, sy: e.clientY, ox: w.x, oy: w.y, ow: w.w, oh: w.h }
                  }}
                  onDoubleClick={() => !mobile && maxWin(w.id)}
                >
                  <AppIcon id={w.id} size={18} />
                  <span className="truncate font-semibold">{app.name}</span>
                  <span className="hidden text-ink-400 sm:inline">· Stratus {PLANS[plan].name}</span>
                  <div className="ml-auto flex">
                    <button className="flex h-8 w-9 items-center justify-center rounded hover:bg-white/10" onClick={() => minWin(w.id)} aria-label="Minimise">
                      <Icon name="minus" size={14} />
                    </button>
                    {!mobile && (
                      <button className="flex h-8 w-9 items-center justify-center rounded hover:bg-white/10" onClick={() => maxWin(w.id)} aria-label="Maximise">
                        <Icon name="square" size={12} />
                      </button>
                    )}
                    <button className="flex h-8 w-9 items-center justify-center rounded hover:bg-rose-500" onClick={() => closeWin(w.id)} aria-label="Close">
                      <Icon name="x" size={14} />
                    </button>
                  </div>
                </div>
                <div className="relative min-h-0 flex-1">
                  <AppBoundary name={app.name} onClose={() => closeWin(w.id)}>
                    <Suspense fallback={<Skeleton />}>
                      <Comp mobile={mobile} autoplay={req.montage || film?.startsWith('film-app') ? true : undefined} />
                    </Suspense>
                  </AppBoundary>
                </div>
                {!max && (
                  <div
                    className="absolute bottom-0 right-0 h-4 w-4 cursor-se-resize"
                    onPointerDown={(e) => {
                      e.stopPropagation()
                      drag.current = { id: w.id, mode: 'size', sx: e.clientX, sy: e.clientY, ox: w.x, oy: w.y, ow: w.w, oh: w.h }
                    }}
                  />
                )}
              </div>
            )
          })}
          {wins.every((w) => w.min) && (
            <div className="absolute inset-0 flex items-center justify-center p-6 text-center text-sm text-white/60">Tap an app in the dock to open it.</div>
          )}
        </div>

        <div className="absolute inset-x-0 bottom-0 z-[500] flex h-12 items-center gap-1 border-t border-white/5 bg-ink-950/80 px-2 backdrop-blur" style={{ paddingBottom: hudVisible ? 0 : 'env(safe-area-inset-bottom,0px)' }}>
          <div className="no-scrollbar flex min-w-0 flex-1 items-center gap-1 overflow-x-auto">
            {dockApps.map((id) => {
              const open = wins.some((w) => w.id === id)
              return (
                <button key={id} onClick={() => (active === id ? minWin(id) : openApp(id))} className={'relative flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ' + (active === id ? 'bg-white/15' : 'hover:bg-white/10')} aria-label={appById(id)!.name} title={appById(id)!.name}>
                  <AppIcon id={id} size={28} />
                  {open && <span className="absolute bottom-0.5 h-1 w-3 rounded-full bg-sky-400" />}
                </button>
              )
            })}
          </div>
          <ZoomButton up className="shrink-0" />
          <span className="tabnum shrink-0 px-2 text-xs font-medium text-white/80">{clock}</span>
        </div>

        {trackpad && mobile && (
          <div className="absolute inset-0 z-[600]" onTouchStart={onTpStart} onTouchMove={onTpMove} onTouchEnd={onTpEnd}>
            <div className="pointer-events-none fixed z-[601] h-5 w-5" style={{ left: cursor.x, top: cursor.y }}>
              <svg viewBox="0 0 24 24" width="22" height="22">
                <path d="M3 2l7 19 2.5-7.5L20 11z" fill="#fff" stroke="#0B1020" strokeWidth="1.5" />
              </svg>
            </div>
          </div>
        )}
      </div>

      {mobile && !limitHit && !director.clean && (
        <div className="pointer-events-none absolute right-2 z-[700] flex justify-end" style={{ bottom: 'calc(56px + env(safe-area-inset-bottom,0px))' }}>
          <div className="pointer-events-auto flex flex-col gap-1 rounded-2xl bg-ink-900/90 p-1 shadow-2xl ring-1 ring-white/10 backdrop-blur">
            <button onClick={() => setPillOpen(!pillOpen)} className="flex h-8 w-11 items-center justify-center rounded-xl text-ink-300 hover:bg-white/10" aria-label={pillOpen ? 'Hide controls' : 'Show controls'}>
              <Icon name="chevron" size={16} className={pillOpen ? 'rotate-90' : '-rotate-90'} />
            </button>
            {pillOpen && (
              <>
            <button onClick={showKeyboard} className="flex h-11 w-11 items-center justify-center rounded-xl text-white hover:bg-white/10" aria-label="Keyboard">
              <Icon name="keyboard" size={20} />
            </button>
            <button onClick={() => setTrackpad(!trackpad)} className={'flex h-11 w-11 items-center justify-center rounded-xl ' + (trackpad ? 'bg-sky-500 text-white' : 'text-white hover:bg-white/10')} aria-label={trackpad ? 'Switch to touch' : 'Switch to trackpad'}>
              <Icon name={trackpad ? 'mouse' : 'touch'} size={20} />
            </button>
            <button onClick={fullscreen} className="flex h-11 w-11 items-center justify-center rounded-xl text-white hover:bg-white/10" aria-label="Fullscreen">
              <Icon name="expand" size={20} />
            </button>
            <button onClick={() => setLowBw(!lowBw)} className={'flex h-11 w-11 items-center justify-center rounded-xl ' + (low ? 'bg-amber-400 text-ink-900' : 'text-white hover:bg-white/10')} aria-label="Quality">
              <Icon name="signal" size={20} />
            </button>
              </>
            )}
          </div>
        </div>
      )}

      {mobile && portrait && rotateHint && !director.clean && !limitHit && (
        <div className="absolute inset-x-3 z-[710] flex items-center gap-3 rounded-2xl bg-white p-3 text-sm text-ink-900 shadow-2xl" style={{ top: 'calc(env(safe-area-inset-top,0px) + 56px)' }}>
          <Icon name="rotate" size={22} className="shrink-0 text-violet-500" />
          <span className="flex-1 font-medium">Rotate your phone for the best view.</span>
          <button className="min-h-[36px] rounded-lg bg-ink-900 px-3 font-semibold text-white" onClick={() => setRotateHint(false)}>
            Continue
          </button>
        </div>
      )}

      {lower && !director.clean && (
        <div key={lower} className="anim-rise pointer-events-none absolute left-4 z-[720] rounded-xl bg-white/95 px-4 py-2 shadow-2xl" style={{ bottom: 'calc(64px + env(safe-area-inset-bottom,0px))' }}>
          <div className="text-[10px] font-bold uppercase tracking-[.12em] text-violet-600">Stratus for</div>
          <div className="text-lg font-bold text-ink-900">{lower}</div>
        </div>
      )}

      {limitHit && (
        <div className="absolute inset-0 z-[800] flex items-center justify-center bg-black/40 p-4">
          <div className="anim-pop w-full max-w-sm rounded-3xl bg-ink-850 p-6 text-center ring-1 ring-white/10">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500 text-white">
              <Icon name="check" size={28} stroke={3} />
            </div>
            <h2 className="mt-4 text-2xl font-bold text-white">Limit reached. Session saved.</h2>
            <p className="mt-1 text-sm text-ink-300">Your apps and files are exactly as you left them.</p>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <div className="rounded-xl bg-white/5 p-3">
                <div className="label">Cost</div>
                <div className="tabnum mt-1 text-lg font-bold text-white">${Math.min(cost, limit).toFixed(2)}</div>
              </div>
              <div className="rounded-xl bg-white/5 p-3">
                <div className="label">Time used</div>
                <div className="tabnum mt-1 text-lg font-bold text-white">{fmtTime(seconds)}</div>
              </div>
            </div>
            <div className="mt-5 flex flex-col gap-2">
              <button
                className="btn-primary"
                onClick={() => {
                  setLimit(limit + 5)
                  set({ limit: s.limit + 5 })
                  setLimitHit(false)
                }}
              >
                Add $5 and keep going
              </button>
              <button
                className="btn-ghost"
                onClick={() => {
                  setFreeMode(true)
                  setPlan('free')
                  setLowBw(true)
                  setLimitHit(false)
                }}
              >
                Keep working on Free (limited)
              </button>
              <button className="btn-ghost" onClick={() => go('home')}>
                End session
              </button>
            </div>
          </div>
        </div>
      )}

      {ending && (
        <div className="anim-rise absolute inset-0 z-[900] flex flex-col items-center justify-center gap-3 bg-ink-950 text-center">
          <CloudMark size={56} />
          <div className="text-xl font-bold text-white">Session saved</div>
          <div className="text-ink-300">See you soon, {firstName(s)}.</div>
        </div>
      )}
    </div>
  )
}
