import { useState } from 'react'
import { useStore } from '../lib/store'
import { Shell } from '../components/Shell'
import { INDUSTRIES, PLAN_ORDER, PLANS, REGIONS, APPS, industryById } from '../lib/catalog'
import { DEMO_FILES } from './Home'

function Row({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <div className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <div className="font-medium text-white">{label}</div>
        {hint && <div className="text-sm text-ink-400">{hint}</div>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  )
}

function Toggle({ on, onChange, id }: { on: boolean; onChange: (v: boolean) => void; id: string }) {
  return (
    <button id={id} role="switch" aria-checked={on} onClick={() => onChange(!on)} className={'relative h-8 w-14 rounded-full transition ' + (on ? 'brand-bg' : 'bg-white/15')}>
      <span className={'absolute top-1 h-6 w-6 rounded-full bg-white shadow transition-all ' + (on ? 'left-7' : 'left-1')} />
    </button>
  )
}

function Seg<T extends string>({ value, options, onChange }: { value: T; options: { v: T; l: string }[]; onChange: (v: T) => void }) {
  return (
    <div className="flex flex-wrap gap-1 rounded-xl bg-white/5 p-1">
      {options.map((o) => (
        <button key={o.v} onClick={() => onChange(o.v)} className={'min-h-[38px] rounded-lg px-3 text-sm font-semibold ' + (value === o.v ? 'bg-white text-ink-900' : 'text-ink-300')}>
          {o.l}
        </button>
      ))}
    </div>
  )
}

export function Settings() {
  const { s, set, reset, toast } = useStore()
  const [confirm, setConfirm] = useState(false)
  return (
    <Shell title="Settings">
      <div className="flex flex-col gap-5">
        <section className="card divide-y divide-white/5">
          <Row label="Name">
            <input id="set-name" className="input w-full sm:w-56" value={s.user?.name ?? ''} onChange={(e) => set({ user: { name: e.target.value, email: s.user?.email ?? '' } })} />
          </Row>
          <Row label="Study or work area" hint="Sets your recommended apps and dock">
            <select id="set-ind" className="input w-full sm:w-56" value={s.industry ?? 'notsure'} onChange={(e) => { const i = industryById(e.target.value)!; set({ industry: i.id }); toast(`Desktop set up for ${i.name}`) }}>
              {INDUSTRIES.map((i) => (
                <option key={i.id} value={i.id}>{i.name}</option>
              ))}
            </select>
          </Row>
          <Row label="Region" hint="Closest data centre gives the lowest delay">
            <Seg value={s.region} options={REGIONS.map((r) => ({ v: r, l: r }))} onChange={(v) => set({ region: v })} />
          </Row>
        </section>
        <section className="card divide-y divide-white/5">
          <Row label="Default plan">
            <Seg value={s.plan} options={PLAN_ORDER.map((p) => ({ v: p, l: PLANS[p].name }))} onChange={(v) => set({ plan: v })} />
          </Row>
          <Row label="Default spending limit" hint={`$${s.limit} per session`}>
            <input id="set-limit" type="range" min={0} max={50} value={s.limit} onChange={(e) => set({ limit: Number(e.target.value) })} className="h-10 w-full sm:w-56" />
          </Row>
          <Row label="Low-bandwidth by default" hint="Uses less data on mobile networks">
            <Toggle id="set-lowbw" on={s.lowBandwidthDefault} onChange={(v) => set({ lowBandwidthDefault: v })} />
          </Row>
          <Row label="Sound" hint="A soft ding when a session connects">
            <Toggle id="set-sound" on={s.sound} onChange={(v) => set({ sound: v })} />
          </Row>
        </section>
        <section className="card divide-y divide-white/5">
          <Row label="Export all files" hint={`${DEMO_FILES.length} files across ${APPS.length} apps`}>
            <button className="btn-ghost text-sm" onClick={() => toast('Your files are ready to take with you', 'info')}>
              Export
            </button>
          </Row>
          <Row label="Reset demo" hint="Signs you out and clears everything on this device">
            {confirm ? (
              <div className="flex gap-2">
                <button className="btn-ghost text-sm" onClick={() => setConfirm(false)}>Cancel</button>
                <button className="btn text-sm bg-rose-500 text-white" onClick={reset}>Reset now</button>
              </div>
            ) : (
              <button className="btn-ghost text-sm text-rose-300" onClick={() => setConfirm(true)}>
                Reset demo
              </button>
            )}
          </Row>
        </section>
      </div>
    </Shell>
  )
}

export function About() {
  return (
    <Shell title="About Stratus">
      <div className="max-w-2xl space-y-5 text-ink-200">
        <p className="text-xl font-semibold text-white">A supercomputer in your pocket.</p>
        <p>Heavy software like CAD, 3D, data science and security tools usually needs an expensive computer. Stratus runs that software on powerful machines in a data centre and streams the screen to whatever device you already own.</p>
        <div className="card p-5">
          <div className="label">Honest prototype note</div>
          <p className="mt-2">Stratus is a student prototype built for a university project. The cloud machines are simulated in your browser. No payments are taken and no data leaves your device.</p>
          <p className="mt-3">The apps inside are simulated look-alikes. They are not affiliated with any software vendor. In a real Stratus, vendors would partner with us to offer their official software.</p>
        </div>
        <p className="text-sm text-ink-400">Prices shown are example pricing. Every number in the demo comes from a fixed random seed (67), so it looks the same every time.</p>
      </div>
    </Shell>
  )
}
