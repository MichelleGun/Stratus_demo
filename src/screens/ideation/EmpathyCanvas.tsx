import type { ReactNode } from 'react'
import { Src, Lead, useReveal } from './shared'

// Laid out on the Empathy Map Canvas (Dave Gray, XPLANE). Notes with a dashed
// border are leads or questions for the next interview, not findings.

function Cell({ n, title, hint, children, className = '', delay = 0 }: { delay?: number; n: number; title: ReactNode; hint: string; children: ReactNode; className?: string }) {
  const r = useReveal(delay)
  return (
    <div ref={r.ref} style={r.style} className={'p-4 lg:p-5 ' + className}>
      <div className="flex items-start gap-2.5">
        <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/20 text-xs font-bold text-white">{n}</span>
        <div className="min-w-0">
          <div className="text-[17px] font-bold leading-tight text-white">{title}</div>
          <div className="mt-0.5 text-[12px] leading-snug text-ink-400">{hint}</div>
        </div>
      </div>
      <div className="mt-3 grid gap-2.5">{children}</div>
    </div>
  )
}

function Note({ children, tone = 'found' }: { children: ReactNode; tone?: 'found' | 'does' }) {
  return (
    <div className={'rounded-xl p-3 text-[14px] leading-relaxed ring-1 ' + (tone === 'does' ? 'bg-sky-400/[.1] text-ink-100 ring-sky-400/40' : 'bg-white/[.06] text-ink-100 ring-white/10')}>
      {children}
    </div>
  )
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="rounded-lg bg-white px-3 py-2 text-ink-900">
      <div className="text-[11px] italic text-ink-500">{label}</div>
      <div className="text-sm font-semibold leading-snug">{children}</div>
    </div>
  )
}

export function EmpathyCanvas() {
  const head = useReveal(600)
  const goal = useReveal(150)
  return (
    <div className="overflow-hidden rounded-3xl bg-[#14192c] ring-1 ring-white/15">
      <div className="flex flex-wrap items-center gap-3 border-b border-white/10 bg-black/20 p-4 lg:p-5">
        <div className="mr-auto text-xl font-black tracking-tight text-white">Empathy Map Canvas</div>
        <div className="grid w-full gap-2 sm:grid-cols-3 lg:w-auto lg:min-w-[560px]">
          <Field label="Designed for:">Students without a capable laptop</Field>
          <Field label="Designed by:">The Stratus team</Field>
          <Field label="Based on:">One student interview</Field>
        </div>
      </div>

      {/* Top band: who, goal, do */}
      <div className="grid divide-y divide-white/10 border-b border-white/10 bg-white/[.07] lg:grid-cols-[1fr_auto_1fr] lg:divide-x lg:divide-y-0">
        <Cell delay={0} n={1} title="WHO are we empathising with?" hint="Who is the person, what is their situation and role?">
          <Note>
            <span className="font-semibold text-white">A student.</span> Relies on the library computers. Interviewed for this project.
          </Note>
        </Cell>
        <div ref={goal.ref} style={goal.style} className="flex flex-col items-center justify-center px-6 py-4 text-center lg:min-w-[200px]">
          <div className="text-lg font-black tracking-[.2em] text-white">GOAL</div>
          <p className="mt-1 text-[13px] leading-snug text-ink-300">Finish study work on time, without depending on a capable laptop.</p>
        </div>
        <Cell delay={300} n={2} title="What do they need to DO?" hint="What job do they need to get done, and how will we know it worked?">
          <Note>Finish projects on time, instead of when the library is open.</Note>
        </Cell>
      </div>

      {/* Middle: hears, head, sees and says */}
      <div className="grid lg:grid-cols-[0.8fr_1.6fr_0.8fr]">
        <Cell delay={900} n={6} title="What do they HEAR?" hint="What do others, friends and colleagues say?" className="order-3 border-t border-white/10 lg:order-none lg:border-t-0">
          <Lead label="To ask next">What do friends, lecturers and family say to them about not having a laptop?</Lead>
        </Cell>

        <div ref={head.ref} style={head.style} className="order-1 border-t border-white/10 p-4 lg:order-none lg:border-x lg:border-t-0 lg:p-6">
          <div className="mx-auto max-w-[520px] rounded-[40px] bg-black/25 p-4 ring-1 ring-white/20 lg:rounded-[72px] lg:px-7 lg:py-8">
            <div className="flex items-start justify-center gap-2.5 text-center">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/20 text-xs font-bold text-white">7</span>
              <div className="text-[17px] font-bold text-white">What do they THINK and FEEL?</div>
            </div>
            <div className="mt-3 grid grid-cols-2 divide-x divide-white/20 text-left">
              <div className="grid content-start gap-2 pr-3">
                <div className="text-[11px] font-bold uppercase tracking-[.1em] text-rose-300">Pains</div>
                <Note>Worry about cost, even more than about performance. <Src id="interview" /></Note>
                <Note>“Fine” only lasts until the library closes.</Note>
              </div>
              <div className="grid content-start gap-2 pl-3">
                <div className="text-[11px] font-bold uppercase tracking-[.1em] text-emerald-300">Gains</div>
                <Note tone="does">Practise from home on the laptop they already have.</Note>
                <Note tone="does">A free tier that needs no application or proof of need.</Note>
              </div>
            </div>
            <div className="mt-3 border-t border-white/20 pt-3 text-center">
              <div className="text-[12px] text-ink-400">What else might motivate their behaviour?</div>
              <p className="mt-1 text-[13px] leading-snug text-ink-200">
                Saying “fine” may protect them from shame or guilt. A US dean says financial insecurity can bring both. A lead to check, not a finding.
                <Src id="dean" />
              </p>
            </div>
          </div>
        </div>

        <div className="order-2 grid divide-y divide-white/10 border-t border-white/10 lg:order-none lg:border-t-0">
          <Cell delay={1200} n={3} title="What do they SEE?" hint="In the marketplace, in their environment, in what others do">
            <Note>
              Laptops for design and media work priced at A$1,800 to 2,800.
              <Src id="laptop" />
            </Note>
            <Lead label="To ask next">What do classmates with capable laptops do differently?</Lead>
          </Cell>
          <Cell delay={1500} n={4} title="What do they SAY?" hint="What have we heard them say?">
            <Note>
              <span className="text-[16px] font-semibold text-white">“I’m fine, I just use the library computers.”</span>
              <Src id="interview" />
            </Note>
          </Cell>
        </div>
      </div>

      {/* Bottom: does */}
      <div className="border-t border-white/10">
        <Cell delay={1800} n={5} title="What do they DO?" hint="What do they do today, and what behaviour have we observed?">
          <div className="grid gap-2.5 sm:grid-cols-2">
            <Note>Leaves when the library closes.</Note>
            <Note>Finishes projects a day late.</Note>
          </div>
        </Cell>
      </div>
    </div>
  )
}
