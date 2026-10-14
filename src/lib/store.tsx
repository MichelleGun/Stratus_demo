import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { load, save, clear } from './storage'
import type { AppId, IndustryId, PlanId } from './catalog'
import { industryById } from './catalog'
import { ding } from './sound'

export type Route =
  | 'splash' | 'signin' | 'onboarding' | 'home' | 'library' | 'plans' | 'limit' | 'more'
  | 'hourbank' | 'teams' | 'settings' | 'about' | 'launch' | 'session' | 'film-icon'

export interface SavedSession {
  apps: AppId[]
  active: AppId | null
  seconds: number
  cost: number
  plan: PlanId
  savedAt: number
}

export interface Persisted {
  user: { name: string; email: string } | null
  onboarded: boolean
  industry: IndustryId | null
  plan: PlanId
  limit: number
  region: 'Sydney' | 'Melbourne' | 'Singapore'
  sound: boolean
  lowBandwidthDefault: boolean
  recent: { app: AppId; at: number }[]
  extraDock: AppId[]
  saved: SavedSession | null
  personalHours: number
  joinedPools: string[]
}

const DEFAULTS: Persisted = {
  user: null,
  onboarded: false,
  industry: null,
  plan: 'standard',
  limit: 10,
  region: 'Sydney',
  sound: false,
  lowBandwidthDefault: false,
  recent: [],
  extraDock: [],
  saved: null,
  personalHours: 3.5,
  joinedPools: ['UTS Library'],
}

export interface LaunchRequest {
  apps: AppId[]
  plan: PlanId
  resume?: boolean
  quick?: boolean
  montage?: boolean
}

export interface Director {
  open: boolean
  speed: 1 | 10 | 60
  hud: boolean
  clean: boolean
  forceLowBw: boolean
  limitNow: number
  openApp: { id: AppId; n: number } | null
}

export interface Toast {
  id: number
  text: string
  tone?: 'ok' | 'info'
}

interface Ctx {
  s: Persisted
  set: (patch: Partial<Persisted>) => void
  route: Route
  go: (r: Route) => void
  launch: LaunchRequest | null
  startLaunch: (req: LaunchRequest) => void
  director: Director
  setDirector: (patch: Partial<Director>) => void
  toasts: Toast[]
  toast: (text: string, tone?: Toast['tone']) => void
  film: string | null
  reset: () => void
  sfx: (pitch?: number) => void
}

const StoreCtx = createContext<Ctx | null>(null)
const KEY = 'stratus.v1.state'

const ROUTES: Route[] = ['splash', 'signin', 'onboarding', 'home', 'library', 'plans', 'limit', 'more', 'hourbank', 'teams', 'settings', 'about', 'launch', 'session', 'film-icon']

function readHash(): string {
  return (window.location.hash || '').replace(/^#\/?/, '').replace(/\//g, '-')
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [s, setS] = useState<Persisted>(() => ({ ...DEFAULTS, ...load<Partial<Persisted>>(KEY, {}) }))
  const initialHash = useRef(readHash())
  const isFilm = initialHash.current.startsWith('film')
  const [film, setFilm] = useState<string | null>(isFilm ? initialHash.current : null)
  const [route, setRoute] = useState<Route>(() => {
    if (isFilm) return 'splash'
    const h = initialHash.current as Route
    if (ROUTES.includes(h) && h !== 'launch' && h !== 'session' && h !== 'limit') return h
    return 'splash'
  })
  const [launch, setLaunch] = useState<LaunchRequest | null>(null)
  const [director, setDir] = useState<Director>({ open: false, speed: 1, hud: true, clean: false, forceLowBw: false, limitNow: 0, openApp: null })
  const [toasts, setToasts] = useState<Toast[]>([])
  const toastId = useRef(1)

  useEffect(() => {
    save(KEY, s)
  }, [s])

  const set = useCallback((patch: Partial<Persisted>) => setS((p) => ({ ...p, ...patch })), [])

  const go = useCallback((r: Route) => {
    setRoute(r)
    try {
      const token = r === 'launch' || r === 'session' ? 'session' : r
      if (window.location.hash.replace('#', '') !== token) window.history.replaceState(null, '', '#' + token)
    } catch {
      /* sandboxed history */
    }
  }, [])

  const startLaunch = useCallback(
    (req: LaunchRequest) => {
      setLaunch(req)
      go(req.quick ? 'session' : 'launch')
    },
    [go],
  )

  const setDirector = useCallback((patch: Partial<Director>) => setDir((d) => ({ ...d, ...patch })), [])

  const toast = useCallback((text: string, tone: Toast['tone'] = 'ok') => {
    const id = toastId.current++
    setToasts((t) => [...t, { id, text, tone }])
    window.setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200)
  }, [])

  const sfx = useCallback((pitch?: number) => ding(s.sound, pitch), [s.sound])

  const reset = useCallback(() => {
    clear('stratus.')
    setS({ ...DEFAULTS })
    setLaunch(null)
    setFilm(null)
    setDir((d) => ({ ...d, speed: 1, hud: true, clean: false, forceLowBw: false }))
    go('splash')
  }, [go])

  // Film deep links are applied once, after mount.
  useEffect(() => {
    if (!film) return
    const ensureUser = { user: s.user ?? { name: 'Alex', email: 'alex@student.uts.edu.au' }, onboarded: true }
    const parts = film.split('-')
    const kind = parts[1]
    if (kind === 'onboarding') {
      setS((p) => ({ ...p, user: p.user ?? ensureUser.user, onboarded: false }))
      setRoute('onboarding')
    } else if (kind === 'splash') {
      setRoute('splash')
    } else if (kind === 'icon') {
      setS((p) => ({ ...p, ...ensureUser }))
      setRoute('film-icon')
    } else if (kind === 'cohort') {
      setS((p) => ({ ...p, ...ensureUser }))
      setRoute('teams')
    } else if (kind === 'hourbank') {
      setS((p) => ({ ...p, ...ensureUser }))
      setRoute('hourbank')
    } else if (kind === 'library') {
      setS((p) => ({ ...p, ...ensureUser }))
      setRoute('library')
    } else if (kind === 'prototype') {
      setS((p) => ({ ...p, ...ensureUser, saved: null, limit: 2 }))
      setDir((d) => ({ ...d, speed: 60 }))
      setRoute('home')
    } else if (kind === 'montage') {
      setS((p) => ({ ...p, ...ensureUser, plan: 'pro' }))
      setLaunch({ apps: ['logs'], plan: 'pro', quick: true, montage: true })
      setRoute('session')
    } else if (kind === 'app' && parts[2]) {
      const id = parts.slice(2).join('-') as AppId
      setS((p) => ({ ...p, ...ensureUser, plan: 'pro' }))
      setLaunch({ apps: [id], plan: 'pro', quick: true })
      setRoute('session')
    } else {
      setS((p) => ({ ...p, ...ensureUser }))
      setRoute('home')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Director: Shift + D
  useEffect(() => {
    const on = (e: KeyboardEvent) => {
      if (e.shiftKey && (e.key === 'D' || e.key === 'd')) {
        const tag = (e.target as HTMLElement)?.tagName
        if (tag === 'INPUT' || tag === 'TEXTAREA' || (e.target as HTMLElement)?.isContentEditable) return
        setDir((d) => ({ ...d, open: !d.open }))
      }
    }
    window.addEventListener('keydown', on)
    return () => window.removeEventListener('keydown', on)
  }, [])

  const value = useMemo<Ctx>(
    () => ({ s, set, route, go, launch, startLaunch, director, setDirector, toasts, toast, film, reset, sfx }),
    [s, set, route, go, launch, startLaunch, director, setDirector, toasts, toast, film, reset, sfx],
  )
  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>
}

export function useStore() {
  const c = useContext(StoreCtx)
  if (!c) throw new Error('Store missing')
  return c
}

export function firstName(s: Persisted) {
  return (s.user?.name || 'Alex').split(' ')[0]
}

export function recommendedPlanFor(ind: IndustryId | null): PlanId {
  return industryById(ind)?.plan ?? 'standard'
}
