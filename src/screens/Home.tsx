import { useStore, firstName } from '../lib/store'
import { Shell, PlanChip } from '../components/Shell'
import { AppIcon } from '../components/AppIcon'
import { Icon } from '../components/Icon'
import { appById, dockFor, industryById, PLANS, planAllows, APPS } from '../lib/catalog'

export const DEMO_FILES = [
  { name: 'app.py', where: 'VS Code', ago: '2 min ago' },
  { name: 'model.py', where: 'VS Code', ago: '2 min ago' },
  { name: 'sales_2026.xlsx', where: 'Spreadsheet', ago: '14 min ago' },
  { name: 'chair_lowpoly.blend', where: '3D Studio', ago: 'Yesterday' },
  { name: 'interviews_coded.qda', where: 'Qualitative Lab', ago: 'Yesterday' },
]

function timeAgo(t: number) {
  const m = Math.max(1, Math.round((Date.now() - t) / 60000))
  if (m < 60) return `${m} min ago`
  const h = Math.round(m / 60)
  if (h < 24) return `${h} h ago`
  return `${Math.round(h / 24)} d ago`
}

export function Home() {
  const { s, go, startLaunch, film, toast } = useStore()
  const name = firstName(s)
  const ind = industryById(s.industry)
  const dock = dockFor(s.industry, s.extraDock)
  const hours = s.plan === 'free' ? 5 : s.limit / PLANS[s.plan].price
  const bankHours = s.joinedPools.length * 40
  const launchNow = () => {
    if (film === 'film-prototype') return go('plans')
    const first = dock.find((a) => planAllows(s.plan, appById(a)!.plan)) ?? 'qualitative'
    startLaunch({ apps: [first], plan: s.plan })
  }
  const recent = s.recent.length
    ? s.recent.slice(0, 4)
    : [
        { app: dock[0], at: Date.now() - 3600_000 * 5 },
        { app: dock[1], at: Date.now() - 3600_000 * 28 },
      ]
  return (
    <Shell>
      <div className="flex flex-col gap-6">
        <div className="anim-rise flex items-end justify-between gap-3">
          <div>
            <p className="text-ink-400">{greeting()}</p>
            <h1 className="text-3xl font-bold tracking-tight text-white lg:text-4xl">Hi {name}</h1>
          </div>
          <button onClick={() => go('plans')} className="flex min-h-[44px] items-center gap-2">
            <PlanChip plan={s.plan} />
          </button>
        </div>

        {s.saved && (
          <section className="anim-rise card relative overflow-hidden p-5">
            <div className="absolute inset-0 opacity-20 brand-bg" />
            <div className="relative">
              <div className="label text-ink-200">Session saved</div>
              <h2 className="mt-1 text-2xl font-bold text-white">Welcome back, {name}</h2>
              <p className="mt-1 text-ink-200">Everything is where you left it.</p>
              <ul className="mt-4 divide-y divide-white/10 rounded-xl bg-ink-950/50">
                {DEMO_FILES.slice(0, 4).map((f) => (
                  <li key={f.name} className="flex items-center gap-3 px-3 py-2.5 text-sm">
                    <Icon name="file" size={16} className="text-ink-300" />
                    <span className="min-w-0 flex-1 truncate font-medium text-white">{f.name}</span>
                    <span className="hidden text-ink-400 sm:inline">{f.where}</span>
                    <span className="tabnum text-xs text-ink-400">{f.ago}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
                <button className="btn-light" onClick={() => startLaunch({ apps: s.saved!.apps, plan: s.saved!.plan, resume: true })}>
                  <Icon name="play" size={16} />
                  Resume session
                </button>
                <button className="btn-ghost" onClick={() => toast(`${DEMO_FILES.length} files ready in Files. You can always take them with you.`, 'info')}>
                  <Icon name="download" size={16} />
                  Export my files
                </button>
              </div>
            </div>
          </section>
        )}

        <section className="anim-rise relative overflow-hidden rounded-3xl p-6 lg:p-8" style={{ background: 'radial-gradient(120% 140% at 0% 0%, #1D3B7A 0%, #141B33 55%), #141B33' }}>
          <div className="pointer-events-none absolute -right-10 -top-10 h-56 w-56 rounded-full opacity-50 blur-2xl brand-bg" />
          <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="label text-sky-400">Your cloud computer</div>
              <h2 className="mt-1 text-2xl font-bold text-white lg:text-3xl">{PLANS[s.plan].name} machine, ready in Sydney</h2>
              <p className="mt-1 text-sm text-ink-300 tabnum">
                {PLANS[s.plan].spec} · limit ${s.limit.toFixed(0)}
              </p>
            </div>
            <button onClick={launchNow} className="group relative flex h-16 items-center justify-center gap-3 rounded-2xl bg-white px-8 text-lg font-bold text-ink-900 shadow-2xl transition active:scale-[.98] lg:h-20 lg:px-10 lg:text-xl">
              <span className="absolute inset-0 rounded-2xl ring-4 ring-white/30" style={{ animation: 'pulseRing 2s ease-out infinite' }} />
              <Icon name="power" size={24} stroke={2.6} />
              Launch
            </button>
          </div>
          <button onClick={() => go('plans')} className="relative mt-3 min-h-[44px] text-sm font-semibold text-ink-300 underline-offset-4 hover:underline">
            Change plan or spending limit
          </button>
        </section>

        <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <section>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-semibold text-white">Recent sessions</h2>
            </div>
            <ul className="card divide-y divide-white/5">
              {recent.map((r, i) => {
                const a = appById(r.app)!
                return (
                  <li key={i} className="flex items-center gap-3 p-3">
                    <AppIcon id={a.id} size={40} />
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-semibold text-white">{a.name}</div>
                      <div className="text-xs text-ink-400">{timeAgo(r.at)}</div>
                    </div>
                    <button className="btn-ghost min-h-[40px] px-3 text-sm" onClick={() => startLaunch({ apps: [a.id], plan: planAllows(s.plan, a.plan) ? s.plan : a.plan })}>
                      Resume
                    </button>
                  </li>
                )
              })}
            </ul>
          </section>
          <section>
            <h2 className="mb-3 font-semibold text-white">Hour balance</h2>
            <div className="card p-5">
              <div className="flex items-baseline gap-2">
                <span className="tabnum text-4xl font-bold text-white">{hours.toFixed(1)}</span>
                <span className="text-ink-300">hours on {PLANS[s.plan].name}</span>
              </div>
              <div className="mt-1 text-sm text-ink-400">{s.plan === 'free' ? 'Free hours this month' : `Your $${s.limit} limit buys this much`}</div>
              <div className="mt-4 flex items-center justify-between rounded-xl bg-white/5 p-3 text-sm">
                <span className="flex items-center gap-2 text-ink-200">
                  <Icon name="bank" size={16} /> Hour Bank
                </span>
                <span className="tabnum font-semibold text-emerald-300">+{bankHours} h available</span>
              </div>
              <button className="btn-ghost mt-3 w-full text-sm" onClick={() => go('hourbank')}>
                Open Hour Bank
              </button>
            </div>
          </section>
        </div>

        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-semibold text-white">{ind && ind.id !== 'notsure' ? `Picked for ${ind.name}` : 'Popular apps'}</h2>
            <button className="min-h-[44px] text-sm font-semibold text-sky-400" onClick={() => go('library')}>
              See all {APPS.length}
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {dock.slice(0, 4).map((id) => {
              const a = appById(id)!
              return (
                <button key={id} onClick={() => startLaunch({ apps: [id], plan: planAllows(s.plan, a.plan) ? s.plan : a.plan })} className="card flex flex-col items-start gap-3 p-4 text-left transition hover:bg-ink-800">
                  <AppIcon id={id} size={44} />
                  <div className="min-w-0">
                    <div className="truncate font-semibold text-white">{a.name}</div>
                    <div className="line-clamp-2 text-xs text-ink-400">{a.blurb}</div>
                  </div>
                </button>
              )
            })}
          </div>
        </section>
      </div>
    </Shell>
  )
}

function greeting() {
  const h = new Date().getHours()
  return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening'
}
