import { useEffect, useMemo, useState } from 'react'
import { useStore } from '../lib/store'
import { appById, PLANS, REGION_LATENCY } from '../lib/catalog'
import { CloudMark } from '../components/Logo'
import { Icon } from '../components/Icon'

export function Launch() {
  const { launch, go, s, sfx } = useStore()
  const plan = launch?.plan ?? s.plan
  const app = appById(launch?.apps[0] ?? 'vscode')!
  const resume = !!launch?.resume
  const target = REGION_LATENCY[s.region] ?? 18
  const steps = useMemo(
    () =>
      resume
        ? [`Reconnecting to ${s.region}`, 'Restoring your desktop', 'Reopening your apps', `Streaming at 60 fps`]
        : [
            `Finding the nearest data centre (${s.region})`,
            `Reserving your ${PLANS[plan].name} machine`,
            app.gpu ? app.launchCopy : 'Loading your files',
            'Connecting you to the cloud...',
            'Streaming at 60 fps',
          ],
    [resume, s.region, plan, app],
  )
  const [i, setI] = useState(0)
  const [lat, setLat] = useState(140)
  const per = resume ? 520 : 800
  useEffect(() => {
    if (i >= steps.length) {
      const t = window.setTimeout(() => go('session'), 350)
      return () => window.clearTimeout(t)
    }
    const t = window.setTimeout(() => {
      sfx(660 + i * 90)
      setI(i + 1)
    }, per)
    return () => window.clearTimeout(t)
  }, [i, steps.length, go, per, sfx])
  useEffect(() => {
    const id = window.setInterval(() => setLat((l) => Math.max(target, Math.round(l - (l - target) * 0.35))), 160)
    return () => window.clearInterval(id)
  }, [target])
  const spec = PLANS[plan].spec
  return (
    <div className="safe-x relative flex h-full flex-col items-center justify-center overflow-hidden bg-ink-950 py-8">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute left-1/2 top-1/3 h-[60vmax] w-[60vmax] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-30 blur-3xl brand-bg" />
      </div>
      <div className="relative flex w-full max-w-md flex-col items-center">
        <div className="relative">
          <span className="absolute inset-0 rounded-[28px] brand-bg" style={{ animation: 'pulseRing 1.6s ease-out infinite' }} />
          <div className="anim-float relative">
            <CloudMark size={88} glow />
          </div>
        </div>
        <h1 className="mt-8 text-center text-2xl font-bold text-white">{resume ? 'Welcome back' : 'Starting your cloud computer'}</h1>
        <ol className="mt-6 w-full space-y-3">
          {steps.map((st, k) => {
            const done = k < i
            const now = k === i
            return (
              <li key={st} className={'flex items-center gap-3 text-sm transition-opacity duration-300 ' + (k > i ? 'opacity-35' : 'opacity-100')}>
                <span className={'flex h-6 w-6 shrink-0 items-center justify-center rounded-full ' + (done ? 'bg-emerald-500 text-white' : now ? 'ring-2 ring-sky-400' : 'ring-1 ring-white/20')}>
                  {done ? <Icon name="check" size={14} stroke={3} /> : now ? <span className="h-3 w-3 rounded-full border-2 border-sky-400 border-t-transparent" style={{ animation: 'spin .7s linear infinite' }} /> : null}
                </span>
                <span className={done ? 'text-ink-200' : now ? 'font-semibold text-white' : 'text-ink-300'}>{st}</span>
              </li>
            )
          })}
        </ol>
        <div className="mt-8 grid w-full grid-cols-3 gap-2 text-center">
          {[
            ['Latency', `${lat} ms`],
            ['Region', s.region],
            ['Machine', PLANS[plan].name],
          ].map(([k, v]) => (
            <div key={k} className="rounded-xl bg-white/5 p-3">
              <div className="label">{k}</div>
              <div className="tabnum mt-1 font-semibold text-white">{v}</div>
            </div>
          ))}
        </div>
        <p className="tabnum mt-3 text-center text-xs text-ink-400">{spec}</p>
      </div>
    </div>
  )
}
