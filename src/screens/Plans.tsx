import { useEffect, useRef, useState } from 'react'
import { useStore } from '../lib/store'
import { Shell } from '../components/Shell'
import { Icon } from '../components/Icon'
import { AppIcon } from '../components/AppIcon'
import { appById, HELP_CHIPS, PLAN_ORDER, PLANS, recommend, type PlanId, dockFor, planAllows } from '../lib/catalog'

export function Plans() {
  const { s, set, go } = useStore()
  const [text, setText] = useState('')
  const [thinking, setThinking] = useState(false)
  const [rec, setRec] = useState<ReturnType<typeof recommend> | null>(null)
  const [picked, setPicked] = useState<PlanId>(s.plan)
  const timer = useRef<number>()
  useEffect(() => () => window.clearTimeout(timer.current), [])
  const ask = (t: string) => {
    if (!t.trim()) return
    setText(t)
    setRec(null)
    setThinking(true)
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => {
      const r = recommend(t)
      setRec(r)
      setPicked(r.plan)
      setThinking(false)
    }, 1100)
  }
  const choose = (p: PlanId) => {
    setPicked(p)
    set({ plan: p })
    window.setTimeout(() => go('limit'), 220)
  }
  return (
    <Shell title="Pick your power">
      <section className="card p-5">
        <div className="flex items-center gap-2 font-semibold text-white">
          <Icon name="sparkle" size={18} className="text-violet-400" />
          Help me pick
        </div>
        <p className="mt-1 text-sm text-ink-400">Tell us what you need to do. We will match the plan so you do not pay for power you will not use.</p>
        <form
          className="mt-4 flex gap-2"
          onSubmit={(e) => {
            e.preventDefault()
            ask(text)
          }}
        >
          <input id="help-text" className="input" placeholder="For example, 3D modelling for uni" value={text} onChange={(e) => setText(e.target.value)} />
          <button className="btn-primary shrink-0" type="submit" aria-label="Recommend a plan">
            <Icon name="chevron" />
          </button>
        </form>
        <div className="mt-3 flex flex-wrap gap-2">
          {HELP_CHIPS.map((c) => (
            <button key={c} onClick={() => ask(c)} className="min-h-[36px] rounded-full bg-white/5 px-3 text-xs font-semibold text-ink-200 ring-1 ring-white/10 hover:bg-white/10">
              {c}
            </button>
          ))}
        </div>
        {thinking && (
          <div className="anim-rise mt-4 flex items-center gap-3 rounded-xl bg-white/5 p-4 text-sm text-ink-300">
            <span className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <span key={i} className="h-2 w-2 rounded-full bg-violet-400" style={{ animation: `float .9s ${i * 0.15}s ease-in-out infinite` }} />
              ))}
            </span>
            Matching "{text}" to the right machine
          </div>
        )}
        {rec && !thinking && (
          <div className="anim-rise mt-4 rounded-xl p-4 ring-1 ring-violet-400/40" style={{ background: 'linear-gradient(120deg, rgba(41,168,245,.12), rgba(124,107,245,.18))' }}>
            <div className="label text-violet-300">We recommend</div>
            <div className="mt-1 text-2xl font-bold text-white">{PLANS[rec.plan].name}</div>
            <p className="mt-1 text-sm text-ink-200">{rec.reason}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {rec.apps.map((a) => (
                <span key={a} className="flex items-center gap-2 rounded-full bg-ink-950/60 py-1 pl-1 pr-3 text-xs font-semibold text-ink-100">
                  <AppIcon id={a} size={22} />
                  {appById(a)!.name}
                </span>
              ))}
            </div>
            <button className="btn-light mt-4 w-full sm:w-auto" onClick={() => choose(rec.plan)}>
              Use {PLANS[rec.plan].name}
            </button>
          </div>
        )}
      </section>

      <div className="mt-6 grid gap-3 md:grid-cols-3">
        {PLAN_ORDER.map((p) => {
          const plan = PLANS[p]
          const on = picked === p
          return (
            <button key={p} onClick={() => choose(p)} className={'card relative flex flex-col p-5 text-left transition ' + (on ? 'ring-2 ring-violet-400 bg-ink-800' : 'hover:bg-ink-800')}>
              {p === 'pro' && <span className="chip absolute right-4 top-4 bg-amber-400/15 text-amber-300">GPU</span>}
              <div className="text-lg font-bold text-white">{plan.name}</div>
              <div className="mt-1 text-2xl font-bold text-white tabnum">{plan.priceLabel}</div>
              <p className="mt-1 text-sm text-ink-300">{plan.blurb}</p>
              <div className="mt-3 text-xs font-medium text-ink-400">{plan.spec}</div>
              <ul className="mt-4 flex flex-col gap-2 text-sm text-ink-200">
                {plan.perks.map((x) => (
                  <li key={x} className="flex gap-2">
                    <Icon name="check" size={16} className="mt-0.5 shrink-0 text-emerald-400" />
                    {x}
                  </li>
                ))}
              </ul>
              <span className={'mt-5 flex min-h-[44px] items-center justify-center rounded-xl text-sm font-semibold ' + (on ? 'brand-bg text-white' : 'bg-white/5 text-ink-100')}>{on ? 'Selected' : `Choose ${plan.name}`}</span>
            </button>
          )
        })}
      </div>
      <p className="mt-3 text-xs text-ink-400">Example pricing for the prototype. No payments are taken.</p>
    </Shell>
  )
}

export function Limit() {
  const { s, set, go, startLaunch } = useStore()
  const plan = PLANS[s.plan]
  const hours = s.plan === 'free' ? 5 : s.limit / plan.price
  const dock = dockFor(s.industry, s.extraDock)
  const first = dock.find((a) => planAllows(s.plan, appById(a)!.plan)) ?? 'qualitative'
  return (
    <Shell title="Set a spending limit">
      <section className="card mx-auto max-w-xl p-6">
        <div className="flex items-center justify-between">
          <span className="text-ink-300">
            Plan: <span className="font-semibold text-white">{plan.name}</span>
          </span>
          <button className="min-h-[44px] text-sm font-semibold text-sky-400" onClick={() => go('plans')}>
            Change
          </button>
        </div>
        <div className="mt-6 text-center">
          <div className="tabnum text-6xl font-bold tracking-tight text-white">${s.limit}</div>
          <div className="tabnum mt-2 text-lg text-ink-200">{s.plan === 'free' ? '5 free hours this month' : `about ${hours.toFixed(1)} hours on ${plan.name}`}</div>
        </div>
        <label htmlFor="limit" className="sr-only">
          Spending limit
        </label>
        <input id="limit" type="range" min={0} max={50} step={1} value={s.limit} onChange={(e) => set({ limit: Number(e.target.value) })} className="mt-8 h-10 w-full" />
        <div className="tabnum flex justify-between text-xs text-ink-400">
          <span>$0</span>
          <span>$25</span>
          <span>$50</span>
        </div>
        <p className="mt-6 flex gap-3 rounded-xl bg-white/5 p-4 text-sm text-ink-200">
          <Icon name="check" size={18} className="mt-0.5 shrink-0 text-emerald-400" />
          We stop the session and save your work when you hit this.
        </p>
        <button className="btn-primary mt-6 w-full text-base" disabled={s.limit === 0 && s.plan !== 'free'} onClick={() => startLaunch({ apps: [first], plan: s.plan })}>
          <Icon name="power" size={18} />
          Start session
        </button>
      </section>
    </Shell>
  )
}
