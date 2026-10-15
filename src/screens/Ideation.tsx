import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Shell } from '../components/Shell'
import { Icon } from '../components/Icon'
import { useStore } from '../lib/store'
import { SOURCES, type Source, type SourceId } from '../data/ideation-sources'

// "Behind the ideation": the research story behind Stratus, as one scrolling page.

const CHAPTERS = [
  { id: 'disconnection', n: '01', t: 'Disconnection Challenge' },
  { id: 'empathy', n: '02', t: 'Empathy Mapping' },
  { id: 'systems', n: '03', t: 'Systems Mapping' },
  { id: 'constraints', n: '04', t: 'Constraints and Values' },
  { id: 'debate', n: '05', t: 'Reflection and Debate' },
  { id: 'comb', n: '06', t: 'COM-B' },
] as const

function Src({ id }: { id: SourceId }) {
  const s: Source = SOURCES[id]
  if (!s.url) {
    return <span className="ml-1 whitespace-nowrap rounded-full bg-white/5 px-2 py-0.5 align-middle text-[11px] font-medium text-ink-400">{s.label}</span>
  }
  return (
    <a href={s.url} target="_blank" rel="noopener noreferrer" className="ml-1 inline-flex items-center gap-1 whitespace-nowrap rounded-full bg-sky-400/10 px-2 py-0.5 align-middle text-[11px] font-semibold text-sky-300 ring-1 ring-sky-400/30 hover:bg-sky-400/20" title={s.title}>
      {s.label}
      <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M7 17 17 7M9 7h8v8" />
      </svg>
    </a>
  )
}

function Chapter({ id, n, kicker, title, children }: { id: string; n: string; kicker: string; title: string; children: ReactNode }) {
  return (
    <section id={`ch-${id}`} data-chapter={id} className="scroll-mt-20 border-t border-white/5 pt-10 pb-4 first:border-0">
      <div className="flex items-baseline gap-3">
        <span className="tabnum font-mono text-sm font-semibold text-sky-400">{n}</span>
        <span className="label">{kicker}</span>
      </div>
      <h2 className="mt-2 text-2xl font-bold leading-tight tracking-tight text-white lg:text-[34px]" style={{ textWrap: 'balance' }}>
        {title}
      </h2>
      <div className="mt-6">{children}</div>
    </section>
  )
}

function Found({ label, children, className = '' }: { label?: string; children: ReactNode; className?: string }) {
  return (
    <div className={'rounded-2xl bg-white/[.04] p-4 ring-1 ring-white/10 lg:p-5 ' + className}>
      {label && <div className="label mb-2">{label}</div>}
      <div className="text-[15px] leading-relaxed text-ink-100">{children}</div>
    </div>
  )
}

function Does({ label, children, className = '' }: { label?: string; children: ReactNode; className?: string }) {
  return (
    <div className={'rounded-2xl bg-sky-400/[.08] p-4 ring-1 ring-sky-400/40 lg:p-5 ' + className}>
      {label && <div className="mb-2 text-[11px] font-semibold uppercase tracking-[.08em] text-sky-300">{label}</div>}
      <div className="text-[15px] leading-relaxed text-ink-100">{children}</div>
    </div>
  )
}

function Legend() {
  return (
    <div className="flex flex-wrap gap-4 text-xs text-ink-400">
      <span className="flex items-center gap-2"><span className="h-3 w-3 rounded bg-white/10 ring-1 ring-white/20" />What we found</span>
      <span className="flex items-center gap-2"><span className="h-3 w-3 rounded bg-sky-400/20 ring-1 ring-sky-400/60" />What Stratus does</span>
    </div>
  )
}

function Arrow({ down = false }: { down?: boolean }) {
  return (
    <div className={'flex items-center justify-center text-ink-500 ' + (down ? 'py-1' : 'py-1 lg:px-1 lg:py-0')} aria-hidden="true">
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={down ? '' : 'rotate-90 lg:rotate-0'}>
        <path d="M5 12h14M13 6l6 6-6 6" />
      </svg>
    </div>
  )
}

const NOTES: { head: string; tone: string; dot: string; items: ReactNode[] }[] = [
  {
    head: 'Who is stuck',
    tone: 'bg-amber-300/10 ring-amber-300/30',
    dot: 'bg-amber-300',
    items: ['Students on an old laptop, or only a phone', 'High schoolers and self-learners with no enrolment', 'Graduates whose uni software licences end', 'Trainers who set up a new cohort’s laptops'],
  },
  {
    head: 'Barriers',
    tone: 'bg-rose-400/10 ring-rose-400/30',
    dot: 'bg-rose-400',
    items: [
      <>A design or media laptop costs A$1,800 to 2,800<Src id="laptop" /></>,
      <>10.5% of Australians were mobile-only (2023)<Src id="adii" /></>,
      <>UTS site licences stop when enrolment ends<Src id="utsSoftware" /></>,
      <>Loan laptops: hardship-tested, approved semester by semester<Src id="loanLaptops" /><Src id="loanMq" /></>,
    ],
  },
  {
    head: 'What people do now',
    tone: 'bg-emerald-400/10 ring-emerald-400/30',
    dot: 'bg-emerald-400',
    items: [
      <>Library computers, until the library closes<Src id="interview" /></>,
      <>Uni virtual desktops (UTS, ANU), tied to enrolment<Src id="utsVdi" /><Src id="anuVdi" /><Src id="utsSoftware" /></>,
      <>Laptop loans: one US uni (UNH) had all ~150 loaners out at once<Src id="unh" /></>,
      <>A phone: “it was a struggle”<Src id="log" /></>,
    ],
  },
  {
    head: 'Forces and risks',
    tone: 'bg-orange-400/10 ring-orange-400/30',
    dot: 'bg-orange-400',
    items: ['Mobile data can cost more than the compute', 'Vendors decide where their licences can run', 'Cloud servers still need power', 'Relying on one rented platform risks lock-in'],
  },
]

function Loop() {
  const box = 'fill-[#1C2544] stroke-white/20'
  return (
    <svg viewBox="0 0 520 330" className="h-auto w-full max-w-[560px]" role="img" aria-label="Reinforcing loop: no capable laptop leads to less practice, then fewer opportunities, then no money for a laptop, and back again.">
      <defs>
        <marker id="ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M0 0 10 5 0 10z" fill="#7480AA" />
        </marker>
      </defs>
      <g fontFamily="Inter, system-ui, sans-serif" fontWeight="600" fontSize="15" fill="#E9ECF7" textAnchor="middle">
        <rect x="10" y="30" width="170" height="64" rx="12" className={box} />
        <text x="95" y="67">No capable laptop</text>
        <rect x="340" y="30" width="170" height="64" rx="12" className={box} />
        <text x="425" y="67">Less practice</text>
        <rect x="340" y="236" width="170" height="64" rx="12" className={box} />
        <text x="425" y="273">Fewer opportunities</text>
        <rect x="10" y="236" width="170" height="64" rx="12" className={box} />
        <text x="95" y="264">No money for</text>
        <text x="95" y="283">a laptop</text>
      </g>
      <g stroke="#7480AA" strokeWidth="2" fill="none">
        <path d="M182 62H336" markerEnd="url(#ah)" />
        <path d="M425 96V232" markerEnd="url(#ah)" />
        <path d="M338 268H184" markerEnd="url(#ah)" />
        <path d="M95 234V98" markerEnd="url(#ah)" />
      </g>
      <circle cx="260" cy="62" r="26" fill="none" stroke="#F97316" strokeWidth="3" />
      <text x="260" y="20" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="11" fontWeight="700" letterSpacing="1.5" fill="#FB923C">LEVERAGE POINT</text>
      <circle cx="260" cy="165" r="28" fill="none" stroke="#E9ECF7" strokeWidth="2.5" />
      <text x="260" y="175" textAnchor="middle" fontFamily="Inter, system-ui, sans-serif" fontSize="26" fontWeight="800" fill="#E9ECF7">R</text>
      <text x="260" y="214" textAnchor="middle" fontFamily="Inter, system-ui, sans-serif" fontSize="12" fill="#A3ADCF">Reinforcing loop</text>
    </svg>
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
            <Found label="The challenge">One of us went 24 hours without their laptop, keeping a log.</Found>
            <Arrow />
            <div className="rounded-2xl bg-white p-4 text-ink-900 lg:p-5">
              <div className="mb-2 text-[11px] font-semibold uppercase tracking-[.08em] text-ink-500">From the log</div>
              <p className="text-lg font-semibold leading-snug">“I needed Excel, tried my phone, and it was a struggle.”</p>
            </div>
            <Arrow />
            <Found label="What we realised">How much depended on that one laptop.</Found>
          </div>
          <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_2fr]">
            <div className="rounded-2xl border border-dashed border-white/20 p-5">
              <div className="label">It’s not just us</div>
              <div className="mt-2 text-5xl font-extrabold tracking-tight text-white">10.5%</div>
              <p className="mt-2 text-[15px] leading-relaxed text-ink-200">
                of Australians were mobile-only in 2023, rising to 20.7% on the lowest incomes.
                <Src id="adii" />
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Does label="The problem we open on">The phone-only struggle became our first scene, acted from the real log.</Does>
              <Does label="A risk we designed for">Relying on one platform is risky too, so you can export your files whenever you like.</Does>
            </div>
          </div>
        </Chapter>

        <Chapter id="empathy" n="02" kicker="Empathy Mapping" title="What they say isn’t what they do">
          <div className="grid gap-4 lg:grid-cols-[260px_1fr]">
            <div className="card flex flex-row items-center gap-4 p-5 lg:flex-col lg:items-start">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-white/5 text-ink-300 ring-1 ring-white/10">
                <Icon name="users" size={28} />
              </div>
              <div>
                <div className="label">Who we interviewed</div>
                <div className="mt-1 text-xl font-bold text-white">A student</div>
                <p className="mt-1 text-sm text-ink-300">Relies on the library computers. Their story is dramatised in the Career scene of our video.</p>
              </div>
            </div>
            <div className="grid gap-4">
              <div className="grid items-center gap-3 sm:grid-cols-[1fr_auto_1fr]">
                <Found label="Says">
                  <span className="text-lg font-semibold text-white">“I’m fine, I just use the library computers.”</span>
                </Found>
                <div className="text-center text-3xl font-bold text-orange-400" aria-label="does not equal">≠</div>
                <Found label="Does">Leaves when the library closes. Finishes projects a day late.</Found>
              </div>
              <div className="flex flex-col gap-1 rounded-2xl bg-white p-4 text-ink-900 sm:flex-row sm:items-center sm:gap-4 lg:p-5">
                <span className="text-[11px] font-bold uppercase tracking-[.1em] text-ink-500">The gap</span>
                <span className="text-lg font-bold">“Fine” only lasts until the library closes.</span>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-dashed border-white/20 p-4 lg:p-5">
                  <div className="label mb-2">A lead to check, not a finding</div>
                  <p className="text-[15px] leading-relaxed text-ink-200">
                    Why say “fine”? A US dean says financial insecurity can bring shame or guilt.
                    <Src id="dean" />
                  </p>
                </div>
                <Does label="What Stratus does">Practise from home on the laptop you already have, with a free tier that needs no application or proof of need.</Does>
              </div>
            </div>
          </div>
        </Chapter>

        <Chapter id="systems" n="03" kicker="Systems Mapping" title="Why capable software stays out of reach">
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {NOTES.map((col) => (
              <div key={col.head}>
                <div className="mb-3 flex items-center gap-2">
                  <span className={'h-3 w-3 rounded-sm ' + col.dot} />
                  <span className="text-xs font-bold uppercase tracking-[.1em] text-ink-200">{col.head}</span>
                </div>
                <ul className="grid gap-2">
                  {col.items.map((it, i) => (
                    <li key={i} className={'rounded-xl p-3 text-[14px] leading-snug text-ink-100 ring-1 ' + col.tone}>
                      {it}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <h3 className="mt-12 text-xl font-bold text-white lg:text-2xl">The loop we’re trying to break</h3>
          <p className="mt-1 text-sm text-ink-400">From our team systems map. Each step feeds the next.</p>
          <div className="mt-5 grid items-center gap-6 lg:grid-cols-[1.2fr_1fr]">
            <div className="card flex justify-center p-4">
              <Loop />
            </div>
            <div>
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
            </div>
          </div>
        </Chapter>

        <Chapter id="constraints" n="04" kicker="Constraints and Values" title="Built around the weakest connection">
          <p className="-mt-2 mb-6 text-ink-300">Two constraints we could not remove, and what we built because of them.</p>
          <div className="grid gap-6 lg:grid-cols-2">
            <div>
              <div className="rounded-2xl p-5 ring-1 ring-white/15" style={{ background: 'repeating-linear-gradient(135deg, rgba(255,255,255,.03) 0 10px, rgba(255,255,255,.06) 10px 20px)' }}>
                <div className="label">Constraint 1 · can’t be removed</div>
                <div className="mt-1 text-xl font-bold text-white">A student’s connection</div>
                <p className="mt-2 text-[15px] leading-relaxed text-ink-200">
                  Game streaming at 720p uses 2.7 to 4.5 GB an hour.<Src id="stadia" /> On prepaid data that’s about A$3.90 to 8.70 an hour,<Src id="prepaid" /><Src id="math" /> more than the A$1.41 compute.<Src id="pricing" />
                </p>
              </div>
              <Arrow down />
              <div className="grid gap-2">
                <Does>Testing a low-bandwidth mode, the default on phones</Does>
                <Does>Testing library hubs with Wi-Fi</Does>
              </div>
            </div>
            <div>
              <div className="rounded-2xl p-5 ring-1 ring-white/15" style={{ background: 'repeating-linear-gradient(135deg, rgba(255,255,255,.03) 0 10px, rgba(255,255,255,.06) 10px 20px)' }}>
                <div className="label">Constraint 2 · can’t be removed</div>
                <div className="mt-1 text-xl font-bold text-white">Their ability to pay</div>
                <p className="mt-2 text-[15px] leading-relaxed text-ink-200">
                  A design or media laptop costs A$1,800 to 2,800.<Src id="laptop" /> We found students worry about cost even more than performance.<Src id="interview" />
                </p>
              </div>
              <Arrow down />
              <div className="grid gap-2">
                <Does>A spending limit, set before you start</Does>
                <Does>Shared hours from a library, club or society</Does>
                <Does>A free, capped tier: no ID, no proof of need</Does>
              </div>
            </div>
          </div>
        </Chapter>

        <Chapter id="debate" n="05" kicker="Reflection and Debate" title="What we gave up, and who comes first">
          <div className="grid gap-6 lg:grid-cols-2">
            <div>
              <div className="label mb-3">The trade-off we chose</div>
              <div className="rounded-2xl bg-sky-500 p-5 text-center text-2xl font-extrabold text-white">Affordable access first</div>
              <div className="py-2 text-center text-xs font-bold tracking-[.2em] text-ink-400">OVER</div>
              <div className="rounded-2xl bg-white/[.04] p-4 text-center text-ink-300 ring-1 ring-white/10">Some peak performance on weaker connections</div>
            </div>
            <div>
              <div className="label mb-3">The debate we settled</div>
              <div className="card p-5 ring-1 ring-sky-400/40">
                <p className="text-lg font-bold text-white">Who comes first: students or organisations?</p>
                <p className="mt-2 text-[15px] leading-relaxed text-ink-200">Student access first, funded through organisations.</p>
              </div>
            </div>
          </div>
        </Chapter>

        <Chapter id="comb" n="06" kicker="COM-B" title="Every feature maps to a barrier, or it’s cut">
          <p className="-mt-2 mb-6 text-ink-300">
            COM-B says behaviour needs Capability, Opportunity and Motivation, and that the first two shape the third.<Src id="comb" />
          </p>
          <div className="grid gap-3">
            {[
              { k: 'Capability', d: 'Knowing which software and how much power a task needs', f: 'One-tap launch, plus “What do you study or work in?” with a plan picker' },
              { k: 'Motivation', d: 'Worry about cost, even more than about performance', f: 'A spending limit, set before you start' },
              { k: 'Opportunity', d: 'No capable device or licence where and when you need it', f: 'Shared hours: libraries, clubs and societies pool hours for people who need them' },
            ].map((r) => (
              <div key={r.k} className="grid items-center gap-0 sm:grid-cols-[1fr_auto_1fr]">
                <Found>
                  <span className="block text-lg font-bold text-white">{r.k}</span>
                  <span className="text-sm text-ink-300">{r.d}</span>
                </Found>
                <Arrow />
                <Does>{r.f}</Does>
              </div>
            ))}
          </div>
          <div className="mt-6 rounded-3xl bg-white p-6 text-ink-900 lg:p-8">
            <div className="text-[11px] font-bold uppercase tracking-[.1em] text-sky-600">The behaviour</div>
            <p className="mt-2 text-2xl font-extrabold leading-tight lg:text-3xl">Learners complete the work without their device getting in the way.</p>
            <p className="mt-2 text-ink-600">This is also the success test for our six-week pilot.</p>
            <div className="mt-5 border-t border-ink-200 pt-4">
              <div className="text-[11px] font-bold uppercase tracking-[.1em] text-sky-600">At organisation scale</div>
              <p className="mt-1 text-ink-700">A whole cohort practises in one identical environment, and facilitators fix one setup instead of thirty.</p>
            </div>
          </div>
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
