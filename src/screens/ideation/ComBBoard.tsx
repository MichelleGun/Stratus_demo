import { Src, Reveal, useReveal } from './shared'

// COM-B laid out like the team's whiteboard: Capability, Opportunity and
// Motivation, each split in two. In every box the benefits sit above the line
// and the barriers below it.

interface Box {
  title: string
  benefits: string[]
  barriers: string[]
}
interface Col {
  name: string
  accent: string
  ring: string
  boxes: Box[]
}

const COLS: Col[] = [
  {
    name: 'Capability',
    accent: 'text-sky-300',
    ring: 'ring-sky-400/40',
    boxes: [
      {
        title: 'Physical',
        benefits: ['Heavy software runs on the device you already own', 'A phone or an old laptop is enough'],
        barriers: ['Only an old laptop or a phone, and a capable one costs A$1,800 to 2,800'],
      },
      {
        title: 'Psychological',
        benefits: ['One-tap launch', '“What do you study or work in?” with a plan picker'],
        barriers: ['Not knowing which software to use, or how much power a task needs'],
      },
    ],
  },
  {
    name: 'Opportunity',
    accent: 'text-emerald-300',
    ring: 'ring-emerald-400/40',
    boxes: [
      {
        title: 'Physical',
        benefits: ['Shared hours: libraries, clubs and societies pool hours for people who need them', 'A free, capped tier'],
        barriers: ['No capable device or licence where and when you need it', 'Library computers close, and licences end with enrolment'],
      },
      {
        title: 'Social',
        benefits: ['A whole cohort practises in one identical environment', 'Facilitators fix one setup instead of thirty'],
        barriers: ['Trainers set up each cohort’s laptops one by one', 'Possible shame or guilt about not having a laptop'],
      },
    ],
  },
  {
    name: 'Motivation',
    accent: 'text-violet-300',
    ring: 'ring-violet-400/40',
    boxes: [
      {
        title: 'Reflective',
        benefits: ['A spending limit, set before you start', 'No surprise cost, so trying is safe'],
        barriers: ['Worry about cost, even more than about performance'],
      },
      {
        title: 'Automatic',
        benefits: ['No application or proof of need, so there is nothing to put off', 'Pick up where you left off'],
        barriers: ['The habit of saying “I’m fine” and working around the library’s hours'],
      },
    ],
  },
]

function BoxCard({ b, ring, delay }: { b: Box; ring: string; delay: number }) {
  const r = useReveal(delay)
  return (
    <div ref={r.ref} style={r.style} className={'overflow-hidden rounded-2xl bg-white/[.03] ring-1 ' + ring}>
      <div className="px-4 pt-3 text-center text-[13px] font-bold uppercase tracking-[.1em] text-ink-200">{b.title}</div>
      <ul className="grid gap-1.5 px-4 pb-3 pt-2">
        {b.benefits.map((t) => (
          <li key={t} className="flex gap-2 text-[14px] leading-snug text-ink-100">
            <span className="mt-[3px] shrink-0 font-bold text-emerald-400" aria-label="Benefit">+</span>
            {t}
          </li>
        ))}
      </ul>
      <div className="border-t-2 border-emerald-400/60" />
      <ul className="grid gap-1.5 bg-rose-400/[.06] px-4 pb-4 pt-3">
        {b.barriers.map((t) => (
          <li key={t} className="flex gap-2 text-[14px] leading-snug text-ink-200">
            <span className="mt-[3px] shrink-0 font-bold text-rose-400" aria-label="Barrier">−</span>
            {t}
          </li>
        ))}
      </ul>
    </div>
  )
}

export function ComBBoard() {
  return (
    <div>
      <div className="grid gap-5 lg:grid-cols-3">
        {COLS.map((c, ci) => (
          <div key={c.name}>
            <div className={'mb-3 text-2xl font-extrabold ' + c.accent}>{c.name}</div>
            <div className="grid gap-4">
              {c.boxes.map((b, j) => (
                <BoxCard key={b.title} b={b} ring={c.ring} delay={ci * 200 + j * 120} />
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-3 flex gap-5 text-xs text-ink-400">
        <span><span className="font-bold text-emerald-400">+</span> Above the line: what Stratus gives</span>
        <span><span className="font-bold text-rose-400">−</span> Below the line: what gets in the way</span>
      </div>
      <Reveal className="mt-6 rounded-3xl bg-white p-6 text-ink-900 lg:p-8">
        <div className="text-[11px] font-bold uppercase tracking-[.1em] text-sky-600">In one line</div>
        <p className="mt-2 text-2xl font-extrabold leading-tight lg:text-3xl">
          Stratus gives people a more powerful computer on the device they already have, so learners can finish the work without their device getting in the way.
        </p>
        <p className="mt-3 text-ink-600">This is also the success test for our six-week pilot.</p>
      </Reveal>
      <p className="mt-4 text-sm text-ink-400">
        COM-B says behaviour needs Capability, Opportunity and Motivation.<Src id="comb" />
      </p>
    </div>
  )
}
