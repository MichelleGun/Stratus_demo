import { useMemo, useState } from 'react'
import { useStore } from '../lib/store'
import { Shell, Sheet, PlanChip } from '../components/Shell'
import { AppIcon } from '../components/AppIcon'
import { Icon } from '../components/Icon'
import { APPS, INDUSTRIES, industryById, planAllows, PLANS, type AppDef, type IndustryId } from '../lib/catalog'

export function Library() {
  const { s, set, startLaunch, toast } = useStore()
  const [q, setQ] = useState('')
  const [filter, setFilter] = useState<IndustryId | 'all'>('all')
  const [locked, setLocked] = useState<AppDef | null>(null)
  const list = useMemo(() => {
    const t = q.trim().toLowerCase()
    return APPS.filter((a) => (filter === 'all' || a.industry === filter || industryById(filter)?.apps.includes(a.id)) && (!t || (a.name + ' ' + a.like + ' ' + a.blurb).toLowerCase().includes(t)))
  }, [q, filter])
  const recent = [...new Set(s.recent.map((r) => r.app))].slice(0, 5)
  const open = (a: AppDef) => {
    if (!planAllows(s.plan, a.plan)) return setLocked(a)
    startLaunch({ apps: [a.id], plan: s.plan })
  }
  const chips: { id: IndustryId | 'all'; name: string }[] = [{ id: 'all', name: 'All' }, ...INDUSTRIES.filter((i) => i.id !== 'notsure')]
  return (
    <Shell title="Software Library">
      <div className="relative">
        <Icon name="search" size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-400" />
        <input id="lib-search" className="input pl-11" placeholder="Search apps, like Splunk or Blender" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      <div className="no-scrollbar -mx-4 mt-4 flex gap-2 overflow-x-auto px-4 lg:mx-0 lg:flex-wrap lg:px-0">
        {chips.map((c) => (
          <button key={c.id} onClick={() => setFilter(c.id)} className={'min-h-[40px] shrink-0 rounded-full px-4 text-sm font-semibold ring-1 transition ' + (filter === c.id ? 'bg-white text-ink-900 ring-white' : 'bg-white/5 text-ink-200 ring-white/10')}>
            {c.name}
          </button>
        ))}
      </div>
      {recent.length > 0 && !q && filter === 'all' && (
        <div className="mt-6">
          <div className="label mb-2">Recently used</div>
          <div className="no-scrollbar flex gap-4 overflow-x-auto">
            {recent.map((id) => (
              <button key={id} className="flex w-16 shrink-0 flex-col items-center gap-1.5" onClick={() => open(APPS.find((a) => a.id === id)!)}>
                <AppIcon id={id} size={52} />
                <span className="w-full truncate text-center text-[11px] text-ink-300">{APPS.find((a) => a.id === id)!.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}
      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((a) => {
          const ok = planAllows(s.plan, a.plan)
          const pinned = s.extraDock.includes(a.id)
          return (
            <article key={a.id} className="card flex flex-col p-4">
              <div className="flex items-start gap-3">
                <AppIcon id={a.id} size={48} />
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold leading-tight text-white">{a.name}</h3>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    <span className="chip bg-white/5 text-ink-300">{industryById(a.industry)!.name}</span>
                    <PlanChip plan={a.plan} />
                    {a.gpu && <span className="chip bg-amber-400/15 text-amber-300">GPU</span>}
                  </div>
                </div>
                {!ok && <Icon name="lock" size={18} className="text-ink-400" />}
              </div>
              <p className="mt-3 text-sm text-ink-300">{a.blurb}</p>
              <p className="mt-1 text-xs text-ink-400">The same kind of tool as {a.like}.</p>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <button className={ok ? 'btn-primary text-sm' : 'btn-ghost text-sm'} onClick={() => open(a)}>
                  {ok ? 'Launch' : 'Trial'}
                </button>
                <button
                  className="btn-ghost text-sm"
                  onClick={() => {
                    set({ extraDock: pinned ? s.extraDock.filter((x) => x !== a.id) : [...s.extraDock, a.id] })
                    toast(pinned ? `Removed ${a.name} from your desktop` : `Added ${a.name} to your desktop`)
                  }}
                >
                  {pinned ? 'On desktop' : 'Add to desktop'}
                </button>
              </div>
            </article>
          )
        })}
      </div>
      {list.length === 0 && <p className="mt-10 text-center text-ink-400">No apps match "{q}". Try a tool name like Excel or Unity.</p>}
      <Sheet open={!!locked} onClose={() => setLocked(null)} title={locked ? `Try ${locked.name} on ${PLANS[locked.plan].name}` : ''}>
        {locked && (
          <div>
            <div className="flex items-center gap-3">
              <AppIcon id={locked.id} size={52} />
              <p className="text-ink-200">
                {locked.gpu ? `This one needs ${PLANS[locked.plan].name} because it uses a GPU.` : `This one needs ${PLANS[locked.plan].name} for the extra memory.`}
              </p>
            </div>
            <p className="mt-3 text-sm text-ink-400">
              {PLANS[locked.plan].priceLabel}, only while the session runs. Your spending limit still applies. Example pricing.
            </p>
            <button
              className="btn-primary mt-5 w-full"
              onClick={() => {
                const a = locked
                setLocked(null)
                startLaunch({ apps: [a.id], plan: a.plan })
              }}
            >
              Start a {PLANS[locked.plan].name} trial
            </button>
          </div>
        )}
      </Sheet>
    </Shell>
  )
}
