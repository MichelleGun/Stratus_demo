import { useEffect, useMemo, useRef, useState } from 'react'
import { useStore } from '../lib/store'
import { Shell, Sheet } from '../components/Shell'
import { Icon } from '../components/Icon'
import { rng } from '../lib/prng'
import { appById, PLANS } from '../lib/catalog'
import { AppIcon } from '../components/AppIcon'

export function More() {
  const { go } = useStore()
  const items = [
    { r: 'hourbank' as const, t: 'Hour Bank', d: 'Shared hours from libraries and clubs', icon: 'bank' },
    { r: 'teams' as const, t: 'Teams', d: 'Set up a whole class in one go', icon: 'users' },
    { r: 'settings' as const, t: 'Settings', d: 'Region, defaults, sound, reset', icon: 'settings' },
    { r: 'about' as const, t: 'About Stratus', d: 'What is real and what is simulated', icon: 'info' },
  ]
  return (
    <Shell title="More">
      <ul className="card divide-y divide-white/5">
        {items.map((i) => (
          <li key={i.r}>
            <button onClick={() => go(i.r)} className="flex w-full items-center gap-4 p-4 text-left">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/5 text-ink-100">
                <Icon name={i.icon} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-semibold text-white">{i.t}</span>
                <span className="block text-sm text-ink-400">{i.d}</span>
              </span>
              <Icon name="chevron" className="text-ink-400" />
            </button>
          </li>
        ))}
      </ul>
    </Shell>
  )
}

function Ring({ value, size = 64 }: { value: number; size?: number }) {
  const r = size / 2 - 6
  const c = 2 * Math.PI * r
  return (
    <svg width={size} height={size} className="-rotate-90" aria-hidden="true">
      <circle cx={size / 2} cy={size / 2} r={r} stroke="rgba(255,255,255,.08)" strokeWidth="6" fill="none" />
      <circle cx={size / 2} cy={size / 2} r={r} stroke="url(#ringg)" strokeWidth="6" fill="none" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - value)} style={{ transition: 'stroke-dashoffset .6s ease' }} />
      <defs>
        <linearGradient id="ringg">
          <stop offset="0" stopColor="#4CC3FF" />
          <stop offset="1" stopColor="#8E7CFF" />
        </linearGradient>
      </defs>
    </svg>
  )
}

function useTicker(start: number, perSec: number) {
  const [v, setV] = useState(start)
  useEffect(() => {
    const id = window.setInterval(() => setV((x) => x + perSec / 4), 250)
    return () => window.clearInterval(id)
  }, [perSec])
  return v
}

export function HourBank() {
  const { s, set, toast } = useStore()
  const shared = useTicker(12480, 0.6)
  const [pools, setPools] = useState([
    { name: 'UTS Library', hours: 1240, cap: 2000, members: 412, tone: '#4CC3FF' },
    { name: 'NineTenDo Game Pty Ltd', hours: 310, cap: 600, members: 88, tone: '#8E7CFF' },
    { name: 'Coding Club', hours: 515, cap: 800, members: 146, tone: '#22B573' },
  ])
  const [join, setJoin] = useState(false)
  const [code, setCode] = useState('')
  const [joined, setJoined] = useState<string | null>(null)
  const [gift, setGift] = useState<string | null>(null)
  const [amount, setAmount] = useState(5)
  const anim = useRef<number>()
  const giveHours = () => {
    const target = gift!
    setGift(null)
    let left = amount
    window.clearInterval(anim.current)
    anim.current = window.setInterval(() => {
      left -= 1
      setPools((ps) => ps.map((p) => (p.name === target ? { ...p, hours: p.hours + 1 } : p)))
      if (left <= 0) {
        window.clearInterval(anim.current)
        toast(`Thank you. ${amount} hours added to ${target}`)
      }
    }, 120)
  }
  return (
    <Shell title="Hour Bank">
      <section className="relative overflow-hidden rounded-3xl p-6" style={{ background: 'radial-gradient(120% 140% at 100% 0%, #3B2C8F 0%, #141B33 60%)' }}>
        <div className="label text-violet-300">Community</div>
        <div className="tabnum mt-1 text-4xl font-bold text-white lg:text-5xl">{Math.floor(shared).toLocaleString()}</div>
        <p className="text-ink-200">hours shared this term</p>
        <p className="mt-3 max-w-lg text-sm text-ink-300">Libraries, clubs and companies pool hours so nobody misses out because their laptop is old.</p>
        <div className="mt-5 flex flex-wrap gap-2">
          <button className="btn-light" onClick={() => setJoin(true)}>
            Join with code
          </button>
          <button className="btn-ghost" onClick={() => setGift(pools[0].name)}>
            Gift hours
          </button>
        </div>
      </section>
      <div className="mt-6 grid gap-3 md:grid-cols-3">
        {pools.map((p) => (
          <article key={p.name} className="card flex flex-col p-5">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Ring value={p.hours / p.cap} />
                <span className="tabnum absolute inset-0 flex items-center justify-center text-xs font-bold text-white">{Math.round((p.hours / p.cap) * 100)}%</span>
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold text-white">{p.name}</h3>
                <div className="tabnum text-sm text-ink-300">
                  {p.hours.toLocaleString()} of {p.cap.toLocaleString()} h
                </div>
                <div className="text-xs text-ink-400">{p.members} members</div>
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              {s.joinedPools.includes(p.name) ? <span className="chip bg-emerald-500/15 text-emerald-300">Member</span> : <span className="chip bg-white/5 text-ink-300">Open to students</span>}
              <button className="ml-auto min-h-[36px] text-sm font-semibold text-sky-400" onClick={() => setGift(p.name)}>
                Gift hours
              </button>
            </div>
          </article>
        ))}
      </div>
      <Sheet open={join} onClose={() => { setJoin(false); setJoined(null); setCode('') }} title="Join with code">
        {joined ? (
          <div className="anim-pop text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500 text-white">
              <Icon name="check" size={32} stroke={3} />
            </div>
            <h3 className="mt-4 text-xl font-bold text-white">You joined {joined}</h3>
            <p className="mt-1 text-ink-300">40 shared hours are now in your balance. Use them for any session.</p>
            <button className="btn-primary mt-5 w-full" onClick={() => { setJoin(false); setJoined(null); setCode('') }}>
              Done
            </button>
          </div>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault()
              const name = code.trim().toUpperCase() === 'UTSLIB' ? 'UTS Library' : code.trim() ? `${code.trim().toUpperCase()} pool` : ''
              if (!name) return
              if (!s.joinedPools.includes(name)) set({ joinedPools: [...s.joinedPools, name] })
              setJoined(name)
            }}
          >
            <label htmlFor="pool-code" className="label">
              Code from your library or club
            </label>
            <input id="pool-code" className="input mt-2 uppercase tracking-widest" placeholder="UTSLIB" value={code} onChange={(e) => setCode(e.target.value)} autoCapitalize="characters" />
            <button className="btn-primary mt-4 w-full" type="submit">
              Join
            </button>
          </form>
        )}
      </Sheet>
      <Sheet open={!!gift} onClose={() => setGift(null)} title={`Gift hours to ${gift ?? ''}`}>
        <div className="grid grid-cols-4 gap-2">
          {[1, 5, 10, 20].map((n) => (
            <button key={n} onClick={() => setAmount(n)} className={'min-h-[52px] rounded-xl text-lg font-bold ring-1 ' + (amount === n ? 'brand-bg text-white ring-transparent' : 'bg-white/5 text-white ring-white/10')}>
              {n}h
            </button>
          ))}
        </div>
        <p className="mt-3 text-sm text-ink-400">Hours come from your own balance. Example only, nothing is charged.</p>
        <button className="btn-primary mt-4 w-full" onClick={giveHours}>
          Gift {amount} hours
        </button>
      </Sheet>
    </Shell>
  )
}

type DeviceKind = 'laptop' | 'chromebook' | 'tablet' | 'phone'
const DEVICE_PATH: Record<DeviceKind, string> = {
  laptop: 'M4 6h16v10H4zM2 19h20',
  chromebook: 'M5 5h14v11H5zM3 19h18M10 10a2 2 0 1 0 4 0 2 2 0 0 0-4 0',
  tablet: 'M6 3h12v18H6zM11 18h2',
  phone: 'M8 3h8v18H8zM11 18h2',
}
const TEMPLATES = [
  { name: 'Python Data Course', apps: ['vscode', 'spreadsheet'] },
  { name: 'Cyber Analyst Bootcamp', apps: ['logs', 'vscode'] },
  { name: 'Business Analytics', apps: ['spreadsheet', 'bi'] },
  { name: 'Game Jam', apps: ['game', 'studio3d'] },
  { name: 'Science Lab', apps: ['notebook', 'spreadsheet'] },
  { name: 'Research Methods', apps: ['qualitative', 'notebook'] },
] as const

export function Teams() {
  const { film, sfx } = useStore()
  const [name, setName] = useState('Data Course, Week 3')
  const [tpl, setTpl] = useState(0)
  const [seats, setSeats] = useState(30)
  const [launched, setLaunched] = useState(film === 'film-cohort')
  const [t, setT] = useState(0)
  const tiles = useMemo(() => {
    const r = rng(11)
    const kinds: DeviceKind[] = ['laptop', 'chromebook', 'tablet', 'phone']
    return Array.from({ length: seats }, (_, i) => ({ kind: kinds[Math.floor(r() * 4)], ready: 0.6 + r() * 3.6 + (i % 7) * 0.05, who: `Student ${i + 1}` }))
  }, [seats])
  const done = Math.max(...tiles.map((x) => x.ready))
  useEffect(() => {
    if (!launched) return
    setT(0)
    const start = performance.now()
    const id = window.setInterval(() => {
      const el = (performance.now() - start) / 1000
      setT(el)
      if (el > done + 0.2) window.clearInterval(id)
    }, 100)
    return () => window.clearInterval(id)
  }, [launched, done])
  const readyCount = tiles.filter((x) => x.ready <= t).length
  useEffect(() => {
    if (launched && readyCount === seats) sfx(1040)
  }, [readyCount, seats, launched, sfx])
  // Display a believable countdown: the real fake run lasts ~4 s, shown as 2m 14s.
  const remain = Math.max(0, Math.round(134 * (1 - Math.min(1, t / done))))
  const template = TEMPLATES[tpl]
  const perSeat = 12
  const price = template.apps.some((a) => appById(a)!.plan === 'pro') ? PLANS.pro.price : PLANS.standard.price
  return (
    <Shell title="Teams">
      {!launched ? (
        <section className="card max-w-2xl p-5">
          <h2 className="text-lg font-bold text-white">Create a cohort</h2>
          <p className="text-sm text-ink-400">One setup for the whole class. Students open a link on whatever device they have.</p>
          <label htmlFor="cohort" className="label mt-5 block">
            Cohort name
          </label>
          <input id="cohort" className="input mt-2" value={name} onChange={(e) => setName(e.target.value)} />
          <div className="label mt-5">Environment template</div>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {TEMPLATES.map((x, i) => (
              <button key={x.name} onClick={() => setTpl(i)} className={'flex min-h-[56px] items-center gap-3 rounded-xl p-3 text-left ring-1 ' + (tpl === i ? 'bg-white/10 ring-violet-400' : 'bg-white/5 ring-white/10')}>
                <span className="flex -space-x-2">
                  {x.apps.map((a) => (
                    <AppIcon key={a} id={a} size={28} className="ring-2 ring-ink-850" />
                  ))}
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-white">{x.name}</span>
                  <span className="block truncate text-xs text-ink-400">{x.apps.map((a) => appById(a)!.name).join(' + ')}</span>
                </span>
              </button>
            ))}
          </div>
          <label htmlFor="seats" className="label mt-5 block">
            Seats: <span className="tabnum text-white">{seats}</span>
          </label>
          <input id="seats" type="range" min={5} max={60} value={seats} onChange={(e) => setSeats(Number(e.target.value))} className="mt-2 h-10 w-full" />
          <button className="btn-primary mt-4 w-full" onClick={() => setLaunched(true)}>
            Launch for everyone
          </button>
        </section>
      ) : (
        <div className="flex flex-col gap-4">
          <section className="card flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="label">{name}</div>
              <div className="tabnum mt-1 text-3xl font-bold text-white">{readyCount === seats ? 'Everyone is ready' : `Ready in ${Math.floor(remain / 60)}m ${String(remain % 60).padStart(2, '0')}s`}</div>
              <div className="tabnum text-sm text-ink-300">
                {readyCount} of {seats} machines ready · {template.name}
              </div>
            </div>
            <button className="btn-ghost" onClick={() => setLaunched(false)}>
              Edit cohort
            </button>
          </section>
          <div className="grid grid-cols-5 gap-2 sm:grid-cols-6 lg:grid-cols-10">
            {tiles.map((x, i) => {
              const ok = x.ready <= t
              return (
                <div key={i} className={'flex aspect-square flex-col items-center justify-center gap-1 rounded-xl ring-1 transition-colors duration-300 ' + (ok ? 'bg-emerald-500/15 ring-emerald-400/50 text-emerald-300' : 'bg-white/5 ring-white/10 text-ink-500')}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d={DEVICE_PATH[x.kind]} />
                  </svg>
                  <span className="text-[9px] font-bold uppercase tracking-wide">{ok ? 'Ready' : 'Setting up'}</span>
                </div>
              )
            })}
          </div>
          <div className="rounded-2xl p-4 text-center font-semibold text-white" style={{ background: 'linear-gradient(120deg, rgba(41,168,245,.18), rgba(124,107,245,.22))' }}>
            Everyone has the same setup. No installing software on {seats} laptops.
          </div>
          <section className="card grid grid-cols-3 divide-x divide-white/5 p-0 text-center">
            {[
              ['Per seat', `${perSeat} h / month`],
              ['Monthly cap', `$${(perSeat * price * seats).toFixed(0)}`],
              ['Projected', `$${(perSeat * price * seats * 0.72).toFixed(0)}`],
            ].map(([k, v]) => (
              <div key={k} className="p-4">
                <div className="label">{k}</div>
                <div className="tabnum mt-1 text-lg font-bold text-white">{v}</div>
              </div>
            ))}
          </section>
          <p className="text-xs text-ink-400">Predictable cost: sessions stop at the cap. Example pricing.</p>
        </div>
      )}
    </Shell>
  )
}
