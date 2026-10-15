import type { ReactNode } from 'react'
import { Src, Reveal, useReveal } from './shared'
import type { SourceId } from '../../data/ideation-sources'

// Reflection and debate, laid out like the team's debate board: one question in
// the middle, two opposing sides branching out, and where we landed.

function Branch({ tone, title, items, delay = 0 }: { delay?: number; tone: 'green' | 'red'; title: string; items: ReactNode[] }) {
  const c =
    tone === 'green'
      ? { ring: 'ring-emerald-400/40', bg: 'bg-emerald-400/[.07]', head: 'text-emerald-300', dot: 'bg-emerald-400' }
      : { ring: 'ring-rose-400/40', bg: 'bg-rose-400/[.07]', head: 'text-rose-300', dot: 'bg-rose-400' }
  const r = useReveal(delay)
  return (
    <div ref={r.ref} style={r.style} className={'rounded-2xl p-5 ring-1 ' + c.ring + ' ' + c.bg}>
      <div className={'text-lg font-bold ' + c.head}>{title}</div>
      <ul className="mt-3 grid gap-3">
        {items.map((it, i) => (
          <li key={i} className="flex gap-3 text-[15px] leading-relaxed text-ink-100">
            <span className={'mt-2 h-2 w-2 shrink-0 rounded-full ' + c.dot} />
            <span>{it}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function Thinker({ name, work, year, idea, src, delay = 0 }: { delay?: number; name: string; work: string; year: string; idea: string; src: SourceId }) {
  const r = useReveal(delay)
  return (
    <div ref={r.ref} style={r.style} className="card flex flex-col p-5">
      <div className="text-lg font-bold text-white">{name}</div>
      <div className="mt-0.5 text-sm italic text-ink-300">
        {work} <span className="not-italic text-ink-400">({year})</span>
      </div>
      <p className="mt-3 flex-1 text-[15px] leading-relaxed text-ink-100">{idea}</p>
      <div className="mt-3">
        <Src id={src} />
      </div>
    </div>
  )
}

export function DebateBoard() {
  return (
    <div>
      <Reveal className="mx-auto max-w-xl rounded-2xl bg-white p-5 text-center text-ink-900 shadow-xl">
        <div className="text-[11px] font-bold uppercase tracking-[.12em] text-ink-500">The debate</div>
        <p className="mt-1 text-2xl font-extrabold leading-tight lg:text-3xl">Who should Stratus serve first: students or organisations?</p>
      </Reveal>

      <svg viewBox="0 0 800 70" className="hidden h-[70px] w-full lg:block" preserveAspectRatio="none" aria-hidden="true">
        <path d="M400 0 C 400 40, 200 30, 200 70" stroke="#34D399" strokeWidth="3" fill="none" strokeLinecap="round" />
        <path d="M400 0 C 400 40, 600 30, 600 70" stroke="#FB7185" strokeWidth="3" fill="none" strokeLinecap="round" />
      </svg>
      <div className="h-4 lg:hidden" />

      <div className="grid gap-4 lg:grid-cols-2">
        <Branch
          delay={150}
          tone="green"
          title="Students first"
          items={[
            <>They are the ones locked out. The library closes and licences end with enrolment.<Src id="utsSoftware" /></>,
            <>Their ability to pay is a constraint we cannot remove, so access has to be affordable first.<Src id="laptop" /></>,
            'A free, capped tier with no ID and no proof of need reaches people who would never apply.',
          ]}
        />
        <Branch
          delay={450}
          tone="red"
          title="Organisations first"
          items={[
            'Libraries, clubs and societies can pool hours and fund access at a scale one student cannot.',
            'A whole cohort practises in one identical environment, and facilitators fix one setup instead of thirty.',
            'Vendors decide where their licences can run, so partnerships decide what can be offered.',
          ]}
        />
      </div>

      <Reveal className="mt-4 rounded-2xl bg-sky-500 p-5 text-white">
        <div className="text-[11px] font-bold uppercase tracking-[.12em] text-white/80">Where we landed</div>
        <p className="mt-1 text-xl font-extrabold leading-snug lg:text-2xl">Student access first, funded through organisations.</p>
        <p className="mt-2 text-[15px] text-white/90">We chose affordable access over some peak performance on weaker connections.</p>
      </Reveal>

      <h3 className="mt-12 text-xl font-bold text-white lg:text-2xl">Thinking about who technology serves</h3>
      <p className="mt-1 max-w-2xl text-sm text-ink-400">Three writers who shaped how we argued the question. Each link goes to a page about the work.</p>
      <div className="mt-5 grid gap-4 md:grid-cols-3">
        <Thinker
          name="Langdon Winner"
          work="Do Artifacts Have Politics?"
          year="1980"
          idea="Winner argues that technologies are not politically neutral: some are built to settle who holds power. Deciding who Stratus serves first is that kind of choice, so we built the answer into the product, with a free tier that needs no proof of need."
          src="winner"
          delay={0}
        />
        <Thinker
          name="Martin Heidegger"
          work="The Question Concerning Technology"
          year="1954"
          idea="Heidegger describes technology as a way of revealing the world, one that turns things into a standing-reserve, held ready to be used. Cloud computing looks a lot like that. The question for Stratus is who gets to draw on the reserve, and who is left out."
          src="heidegger"
          delay={150}
        />
        <Thinker
          name="David Edgerton"
          work="The Shock of the Old"
          year="2007"
          idea="Edgerton follows technology in use over its whole life, including maintenance, instead of only counting new inventions. In use, the laptop people already own matters more than the newest machine, so Stratus works with the device you already have."
          src="edgerton"
          delay={300}
        />
      </div>
    </div>
  )
}
