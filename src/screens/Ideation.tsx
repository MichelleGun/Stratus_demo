import { useEffect, useRef, useState } from 'react'
import { Shell } from '../components/Shell'
import { Icon } from '../components/Icon'
import { useStore } from '../lib/store'
import { SOURCES, type Source } from '../data/ideation-sources'
import { Src, Chapter, Found, Does, Arrow, Legend, Reveal, useReveal } from './ideation/shared'
import { EmpathyCanvas } from './ideation/EmpathyCanvas'
import { SystemsBoard } from './ideation/SystemsBoard'
import { ValuesAuction } from './ideation/ValuesAuction'
import { DebateBoard } from './ideation/DebateBoard'
import { ComBBoard } from './ideation/ComBBoard'
import { Provotype } from './ideation/Provotype'

// "Behind the ideation": the research story behind Stratus, as one scrolling page.

const CHAPTERS = [
  { id: 'disconnection', n: '01', t: 'Disconnection Challenge' },
  { id: 'empathy', n: '02', t: 'Empathy Mapping' },
  { id: 'systems', n: '03', t: 'Systems Mapping' },
  { id: 'constraints', n: '04', t: 'Constraints and Values' },
  { id: 'debate', n: '05', t: 'Reflection and Debate' },
  { id: 'comb', n: '06', t: 'COM-B' },
  { id: 'provotype', n: '07', t: 'Provotype' },
] as const

function Loop() {
  const box = 'fill-[#1C2544] stroke-white/20'
  const r = useReveal<HTMLDivElement>()
  // Build the loop in reading order: box, arrow, box, arrow... then the R and the leverage point.
  const at = (ms: number) => ({ opacity: r.on ? 1 : 0, transition: `opacity .5s ease ${ms}ms` })
  return (
    <div ref={r.ref} className="w-full max-w-[560px]">
    <svg viewBox="0 0 520 330" className="h-auto w-full" role="img" aria-label="Reinforcing loop: no capable laptop leads to less practice, then fewer opportunities, then no money for a laptop, and back again.">
      <defs>
        <marker id="ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M0 0 10 5 0 10z" fill="#7480AA" />
        </marker>
      </defs>
      <g fontFamily="Inter, system-ui, sans-serif" fontWeight="600" fontSize="15" fill="#E9ECF7" textAnchor="middle">
        <g style={at(0)}>
          <rect x="10" y="30" width="170" height="64" rx="12" className={box} />
          <text x="95" y="67">No capable laptop</text>
        </g>
        <g style={at(600)}>
          <rect x="340" y="30" width="170" height="64" rx="12" className={box} />
          <text x="425" y="67">Less practice</text>
        </g>
        <g style={at(1200)}>
          <rect x="340" y="236" width="170" height="64" rx="12" className={box} />
          <text x="425" y="273">Fewer opportunities</text>
        </g>
        <g style={at(1800)}>
          <rect x="10" y="236" width="170" height="64" rx="12" className={box} />
          <text x="95" y="264">No money for</text>
          <text x="95" y="283">a laptop</text>
        </g>
      </g>
      <g stroke="#7480AA" strokeWidth="2" fill="none">
        <path d="M182 62H336" markerEnd="url(#ah)" style={at(300)} />
        <path d="M425 96V232" markerEnd="url(#ah)" style={at(900)} />
        <path d="M338 268H184" markerEnd="url(#ah)" style={at(1500)} />
        <path d="M95 234V98" markerEnd="url(#ah)" style={at(2100)} />
      </g>
      <g style={at(2400)}>
        <circle cx="260" cy="165" r="28" fill="none" stroke="#E9ECF7" strokeWidth="2.5" />
        <text x="260" y="175" textAnchor="middle" fontFamily="Inter, system-ui, sans-serif" fontSize="26" fontWeight="800" fill="#E9ECF7">R</text>
        <text x="260" y="214" textAnchor="middle" fontFamily="Inter, system-ui, sans-serif" fontSize="12" fill="#A3ADCF">Reinforcing loop</text>
      </g>
      <g style={at(2900)}>
        <circle cx="260" cy="62" r="26" fill="none" stroke="#F97316" strokeWidth="3" className={r.on ? 'animate-pulse' : ''} />
        <text x="260" y="20" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="11" fontWeight="700" letterSpacing="1.5" fill="#FB923C">LEVERAGE POINT</text>
      </g>
    </svg>
    </div>
  )
}


export function Ideation() {
  const { go } = useStore()
  const [active, setActive] = useState<string>(CHAPTERS[0].id)
  const navRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>('[data-chapter]'))
    const io = new IntersectionObserver(
      (entries) => {
        const vis = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (vis[0]) setActive((vis[0].target as HTMLElement).dataset.chapter!)
      },
      { rootMargin: '-20% 0px -60% 0px' },
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])

  useEffect(() => {
    const nav = navRef.current
    const pill = nav?.querySelector<HTMLElement>(`[data-pill="${active}"]`)
    if (nav && pill) nav.scrollTo({ left: pill.offsetLeft - nav.clientWidth / 2 + pill.clientWidth / 2, behavior: 'smooth' })
  }, [active])

  const jump = (id: string) => document.getElementById(`ch-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })

  return (
    <Shell>
      <div className="max-w-4xl">
        <button onClick={() => go('about')} className="-ml-2 mb-4 flex min-h-[40px] items-center gap-1 rounded-lg px-2 text-sm font-medium text-ink-300 hover:bg-white/5 hover:text-white">
          <Icon name="back" size={16} /> About Stratus
        </button>

        <header className="pb-8">
          <div className="label text-sky-300">Behind the ideation</div>
          <h1 className="mt-3 text-[34px] font-extrabold leading-[1.05] tracking-tight text-white lg:text-6xl" style={{ textWrap: 'balance' }}>
            What you can do shouldn’t depend on what you own.
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-ink-300">
            Six methods took us from one bad day without a laptop to the features in this app. Every number links to where it came from.
          </p>
          <div className="mt-6">
            <Legend />
          </div>
        </header>

        <div ref={navRef} className="no-scrollbar sticky top-0 z-10 -mx-4 flex gap-2 overflow-x-auto border-b border-white/5 bg-ink-900 px-4 py-3 lg:-mx-0 lg:px-0">
          {CHAPTERS.map((c) => (
            <button key={c.id} data-pill={c.id} onClick={() => jump(c.id)} className={'flex min-h-[36px] shrink-0 items-center gap-2 rounded-full px-3 text-sm font-medium transition ' + (active === c.id ? 'bg-white text-ink-900' : 'bg-white/5 text-ink-300 hover:bg-white/10')}>
              <span className="tabnum font-mono text-xs opacity-70">{c.n}</span>
              {c.t}
            </button>
          ))}
        </div>

        <Chapter id="disconnection" n="01" kicker="Disconnection Challenge" title="A day without a laptop showed what depended on it">
          <div className="grid items-stretch gap-0 lg:grid-cols-[1fr_auto_1fr_auto_1fr]">
            <Reveal><Found className="h-full" label="The challenge">One of us went 24 hours without their laptop, keeping a log.</Found></Reveal>
            <Reveal delay={250} className="flex items-center justify-center"><Arrow /></Reveal>
            <Reveal delay={400} className="rounded-2xl bg-white p-4 text-ink-900 lg:p-5">
              <div className="mb-2 text-[11px] font-semibold uppercase tracking-[.08em] text-ink-500">From the log</div>
              <p className="text-lg font-semibold leading-snug">“I needed Excel, tried my phone, and it was a struggle.”</p>
            </Reveal>
            <Reveal delay={650} className="flex items-center justify-center"><Arrow /></Reveal>
            <Reveal delay={800}><Found className="h-full" label="What we realised">How much depended on that one laptop.</Found></Reveal>
          </div>
          <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_2fr]">
            <Reveal className="rounded-2xl border border-dashed border-white/20 p-5">
              <div className="label">It’s not just us</div>
              <div className="mt-2 text-5xl font-extrabold tracking-tight text-white">10.5%</div>
              <p className="mt-2 text-[15px] leading-relaxed text-ink-200">
                of Australians were mobile-only in 2023, rising to 20.7% on the lowest incomes.
                <Src id="adii" />
              </p>
            </Reveal>
            <div className="grid gap-4 sm:grid-cols-2">
              <Reveal delay={200}><Does className="h-full" label="The problem we start from">The phone-only struggle in the log is the exact situation Stratus is built for.</Does></Reveal>
              <Reveal delay={400}><Does className="h-full" label="A risk we designed for">Relying on one platform is risky too, so you can export your files whenever you like.</Does></Reveal>
            </div>
          </div>
        </Chapter>

        <Chapter id="empathy" n="02" kicker="Empathy Mapping" title="What they say isn’t what they do">
          <EmpathyCanvas />
          <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2">
            <Legend lead />
            <span className="text-xs text-ink-400">
              Layout: Empathy Map Canvas by Dave Gray, XPLANE.
              <Src id="empathyCanvas" />
            </span>
          </div>
          <Reveal className="mt-6 flex flex-col gap-1 rounded-2xl bg-white p-4 text-ink-900 sm:flex-row sm:items-center sm:gap-4 lg:p-5">
            <span className="text-[11px] font-bold uppercase tracking-[.1em] text-ink-500">The gap</span>
            <span className="text-lg font-bold">“Fine” only lasts until the library closes.</span>
          </Reveal>
        </Chapter>

        <Chapter id="systems" n="03" kicker="Systems Mapping" title="Why capable software stays out of reach">
          <SystemsBoard />

          <h3 className="mt-12 text-xl font-bold text-white lg:text-2xl">The loop we’re trying to break</h3>
          <p className="mt-1 text-sm text-ink-400">From our team systems map. Each step feeds the next.</p>
          <div className="mt-5 grid items-center gap-6 lg:grid-cols-[1.2fr_1fr]">
            <div className="card flex justify-center p-4">
              <Loop />
            </div>
            <Reveal delay={600}>
              <div className="text-[11px] font-bold uppercase tracking-[.1em] text-orange-400">Leverage point</div>
              <p className="mt-2 text-2xl font-bold leading-tight text-white">“What you can do shouldn’t depend on what you own.”</p>
              <Does className="mt-4">So Stratus cuts the first link: instead of upgrading the laptop, you borrow a more powerful computer through the cloud, on the device you already have.</Does>
              <div className="label mt-5 mb-2">As drawn on the whiteboard</div>
              <div className="flex items-center gap-1.5 text-sm font-semibold text-white">
                <span className="rounded-lg px-3 py-2 ring-1 ring-white/30">Old laptop</span>
                <span className="flex h-7 w-7 items-center justify-center rounded-full ring-2 ring-orange-400"><span className="h-0.5 w-4 bg-ink-300" /></span>
                <span className="rounded-lg px-3 py-2 ring-1 ring-white/30">Cloud</span>
                <span className="text-ink-400">→</span>
                <span className="rounded-lg px-3 py-2 ring-1 ring-white/30">Powerful computer</span>
              </div>
            </Reveal>
          </div>
        </Chapter>

        <Chapter id="constraints" n="04" kicker="Constraints and Values" title="Built around the weakest connection">
          <p className="-mt-2 mb-6 text-ink-300">Two constraints we could not remove, and what we built because of them.</p>
          <div className="grid gap-6 lg:grid-cols-2">
            <div>
              <Reveal className="rounded-2xl p-5 ring-1 ring-white/15" bg={{ background: 'repeating-linear-gradient(135deg, rgba(255,255,255,.03) 0 10px, rgba(255,255,255,.06) 10px 20px)' }}>
                <div className="label">Constraint 1 · can’t be removed</div>
                <div className="mt-1 text-xl font-bold text-white">A student’s connection</div>
                <p className="mt-2 text-[15px] leading-relaxed text-ink-200">
                  Game streaming at 720p uses 2.7 to 4.5 GB an hour.<Src id="stadia" /> On prepaid data that’s about A$3.90 to 8.70 an hour,<Src id="prepaid" /><Src id="math" /> more than the A$1.41 compute.<Src id="pricing" />
                </p>
              </Reveal>
              <Reveal delay={300}><Arrow down /></Reveal>
              <div className="grid gap-2">
                <Reveal delay={450}><Does>Testing a low-bandwidth mode, the default on phones</Does></Reveal>
                <Reveal delay={650}><Does>Testing library hubs with Wi-Fi</Does></Reveal>
              </div>
            </div>
            <div>
              <Reveal className="rounded-2xl p-5 ring-1 ring-white/15" bg={{ background: 'repeating-linear-gradient(135deg, rgba(255,255,255,.03) 0 10px, rgba(255,255,255,.06) 10px 20px)' }}>
                <div className="label">Constraint 2 · can’t be removed</div>
                <div className="mt-1 text-xl font-bold text-white">Their ability to pay</div>
                <p className="mt-2 text-[15px] leading-relaxed text-ink-200">
                  A design or media laptop costs A$1,800 to 2,800.<Src id="laptop" /> We found students worry about cost even more than performance.<Src id="interview" />
                </p>
              </Reveal>
              <Reveal delay={300}><Arrow down /></Reveal>
              <div className="grid gap-2">
                <Reveal delay={450}><Does>A spending limit, set before you start</Does></Reveal>
                <Reveal delay={650}><Does>Shared hours from a library, club or society</Does></Reveal>
                <Reveal delay={850}><Does>A free, capped tier: no ID, no proof of need</Does></Reveal>
              </div>
            </div>
          </div>
        <h3 className="mt-12 text-xl font-bold text-white lg:text-2xl">What we would not trade away</h3>
          <p className="mt-1 mb-5 max-w-2xl text-sm text-ink-400">In a values auction, a team has 100 points to spread across nine values.</p>
          <ValuesAuction />
        </Chapter>

        <Chapter id="debate" n="05" kicker="Reflection and Debate" title="Students versus organisations">
          <DebateBoard />
        </Chapter>

        <Chapter id="comb" n="06" kicker="COM-B" title="Every feature maps to a barrier, or it’s cut">
          <ComBBoard />
        </Chapter>

        <Chapter id="provotype" n="07" kicker="Provotype" title="This whole website is the provotype">
          <Provotype />
        </Chapter>

        <section className="mt-10 border-t border-white/5 pt-8">
          <h2 className="text-lg font-bold text-white">Sources</h2>
          <ol className="mt-3 grid gap-2 text-sm text-ink-300">
            {(Object.values(SOURCES) as Source[]).filter((s, i, all) => all.findIndex((o) => (o.url || o.title) === (s.url || s.title)) === i).map((s) => (
              <li key={s.url || s.title} className="flex gap-2">
                <span className="text-ink-500">·</span>
                {s.url ? (
                  <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-sky-300 underline decoration-sky-300/30 underline-offset-2 hover:decoration-sky-300">
                    {s.title}
                  </a>
                ) : (
                  <span>{s.title}</span>
                )}
              </li>
            ))}
          </ol>
        </section>
      </div>
    </Shell>
  )
}
