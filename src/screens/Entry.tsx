import { useEffect, useRef, useState } from 'react'
import { useStore } from '../lib/store'
import { CloudMark } from '../components/Logo'
import { useLogoTaps } from '../components/Shell'
import { INDUSTRIES, industryById, PLANS, type IndustryId } from '../lib/catalog'
import { Icon } from '../components/Icon'

function Backdrop() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <div className="absolute -left-1/4 -top-1/4 h-[70vmax] w-[70vmax] rounded-full opacity-30 blur-3xl" style={{ background: 'radial-gradient(circle, #29A8F5 0%, transparent 60%)' }} />
      <div className="absolute -bottom-1/3 -right-1/4 h-[70vmax] w-[70vmax] rounded-full opacity-25 blur-3xl" style={{ background: 'radial-gradient(circle, #7C6BF5 0%, transparent 60%)' }} />
    </div>
  )
}

export function Splash() {
  const { go, s, film } = useStore()
  const tap = useLogoTaps()
  const still = film === 'film-splash'
  useEffect(() => {
    if (still) return
    const t = window.setTimeout(() => go(s.user ? (s.onboarded ? 'home' : 'onboarding') : 'signin'), 2000)
    return () => window.clearTimeout(t)
  }, [go, s.user, s.onboarded, still])
  return (
    <div className="relative flex h-full flex-col items-center justify-center bg-ink-950" onClick={tap}>
      <Backdrop />
      <div className="relative flex flex-col items-center gap-5 text-center">
        <div className="anim-pop">
          <CloudMark size={96} glow />
        </div>
        <div className="anim-rise text-5xl font-bold tracking-tight text-white" style={{ animationDelay: '.15s' }}>
          Stratus
        </div>
        <p className="anim-rise text-lg text-ink-300" style={{ animationDelay: '.3s' }}>
          A supercomputer in your pocket
        </p>
      </div>
    </div>
  )
}

export function SignIn() {
  const { set, go } = useStore()
  const [email, setEmail] = useState('')
  const tap = useLogoTaps()
  const signIn = (name: string, mail: string) => {
    set({ user: { name, email: mail } })
    go('onboarding')
  }
  const fromEmail = () => {
    const local = email.split('@')[0] || 'Alex'
    const name = local.split(/[._-]/)[0]
    signIn(name.charAt(0).toUpperCase() + name.slice(1), email || 'alex@student.uts.edu.au')
  }
  return (
    <div className="safe-x relative flex h-full flex-col items-center justify-center overflow-y-auto bg-ink-950 py-10">
      <Backdrop />
      <div className="anim-rise relative w-full max-w-sm">
        <button onClick={tap} className="mb-8 flex items-center gap-3" aria-label="Stratus">
          <CloudMark size={48} />
          <span className="text-3xl font-bold tracking-tight text-white">Stratus</span>
        </button>
        <h1 className="text-3xl font-bold leading-tight tracking-tight text-white" style={{ textWrap: 'balance' }}>
          Run heavy software on any device.
        </h1>
        <p className="mt-3 text-ink-300">Your laptop or phone stays the same. The computer doing the work lives in the cloud.</p>
        <form
          className="mt-8 flex flex-col gap-3"
          onSubmit={(e) => {
            e.preventDefault()
            fromEmail()
          }}
        >
          <label htmlFor="email" className="label">
            University email
          </label>
          <input id="email" type="email" inputMode="email" autoComplete="email" className="input" placeholder="you@student.uni.edu.au" value={email} onChange={(e) => setEmail(e.target.value)} />
          <button type="submit" className="btn-primary w-full">
            Continue with university email
          </button>
        </form>
        <div className="my-5 flex items-center gap-3 text-xs text-ink-400">
          <div className="h-px flex-1 bg-white/10" />
          or
          <div className="h-px flex-1 bg-white/10" />
        </div>
        <button className="btn-ghost w-full" onClick={() => signIn('Alex', 'alex@student.uts.edu.au')}>
          Try the demo as Alex
        </button>
        <p className="mt-6 text-center text-xs text-ink-400">Student prototype. Any email works and nothing is sent anywhere.</p>
      </div>
    </div>
  )
}

const CARDS = [
  { t: 'Open it anywhere', d: 'Old laptop, Chromebook, tablet or phone. If it has a browser, it can run pro software.', icon: 'wifi' },
  { t: 'Pick your power', d: 'Free for notes, Standard for study apps, Pro when you need a real GPU. Switch any time.', icon: 'gpu' },
  { t: 'Set a limit', d: 'Choose how much you want to spend. We stop the session and save your work when you hit it.', icon: 'clock' },
]

export function Onboarding() {
  const { set, go, s, film } = useStore()
  const [step, setStep] = useState(film === 'film-onboarding' ? 3 : 0)
  const [choice, setChoice] = useState<IndustryId | null>(s.industry)
  const touchX = useRef<number | null>(null)
  const finish = () => {
    const ind = industryById(choice ?? 'notsure')!
    set({ onboarded: true, industry: ind.id, plan: ind.plan })
    go('home')
  }
  return (
    <div
      className="safe-x relative flex h-full flex-col bg-ink-950 py-6"
      onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touchX.current == null || step > 2) return
        const dx = e.changedTouches[0].clientX - touchX.current
        if (dx < -50) setStep((x) => Math.min(3, x + 1))
        if (dx > 50) setStep((x) => Math.max(0, x - 1))
        touchX.current = null
      }}
    >
      <Backdrop />
      <div className="relative mx-auto flex w-full max-w-md flex-1 flex-col">
        <div className="flex items-center justify-between">
          <div className="flex gap-1.5">
            {[0, 1, 2, 3].map((i) => (
              <span key={i} className={'h-1.5 rounded-full transition-all ' + (i === step ? 'w-6 bg-white' : 'w-1.5 bg-white/25')} />
            ))}
          </div>
          {step < 3 && (
            <button className="min-h-[44px] px-2 text-sm font-semibold text-ink-300" onClick={() => setStep(3)}>
              Skip
            </button>
          )}
        </div>
        {step < 3 ? (
          <div key={step} className="anim-rise flex flex-1 flex-col justify-center">
            <div className="brand-bg mb-8 flex h-20 w-20 items-center justify-center rounded-3xl text-white shadow-2xl">
              <Icon name={CARDS[step].icon} size={36} />
            </div>
            <div className="label">Step {step + 1} of 3</div>
            <h1 className="mt-2 text-4xl font-bold tracking-tight text-white">{CARDS[step].t}</h1>
            <p className="mt-4 text-lg text-ink-300">{CARDS[step].d}</p>
            <button className="btn-primary mt-10 w-full" onClick={() => setStep(step + 1)}>
              Next
            </button>
          </div>
        ) : (
          <div className="anim-rise flex flex-1 flex-col justify-center py-6">
            <h1 className="text-3xl font-bold tracking-tight text-white" style={{ textWrap: 'balance' }}>
              What do you study or work in?
            </h1>
            <p className="mt-2 text-ink-300">We will set up your desktop with the right apps. You can change this later.</p>
            <div className="mt-6 flex flex-wrap gap-2">
              {INDUSTRIES.map((i) => (
                <button
                  key={i.id}
                  onClick={() => setChoice(i.id)}
                  className={'min-h-[44px] rounded-full px-4 text-sm font-semibold ring-1 transition ' + (choice === i.id ? 'brand-bg text-white ring-transparent' : 'bg-white/5 text-ink-200 ring-white/10 hover:bg-white/10')}
                >
                  {i.name}
                </button>
              ))}
            </div>
            {choice && (
              <div className="anim-rise card mt-6 p-4 text-sm text-ink-300">
                We recommend <span className="font-semibold text-white">{PLANS[industryById(choice)!.plan].name}</span> for {industryById(choice)!.name.toLowerCase()}.
              </div>
            )}
            <button className="btn-primary mt-8 w-full" disabled={!choice} onClick={finish}>
              Set up my desktop
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
