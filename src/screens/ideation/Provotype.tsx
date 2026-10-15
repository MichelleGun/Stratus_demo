import { Src, useReveal } from './shared'

// The provotype section: this whole demo site is the provotype.

const NOTES = [
  { c: '#FFE680', rot: -2.2, q: 'Should a free tier need no proof of need?' },
  { c: '#FFB5C9', rot: 1.6, q: 'Who should come first: students or organisations?' },
  { c: '#B9F0C2', rot: -1.1, q: 'What should you be able to do with the device you already own?' },
]

export function Provotype() {
  const r = useReveal()
  return (
    <div className="grid items-center gap-8 lg:grid-cols-[1.1fr_1fr]">
      <div>
        <p className="text-xl font-semibold leading-snug text-white">
          A provotype is a prototype made to provoke, not to be finished. It exists to get people thinking about other views.
          <Src id="provotype" />
        </p>
        <p className="mt-3 text-sm text-ink-400">
          The approach comes from Preben Mogensen’s work on provotyping in systems development.<Src id="mogensen" />
        </p>
        <p className="mt-4 text-[15px] leading-relaxed text-ink-200">
          In the example we learned from, that was a wall of sticky notes and doodles. For us, it is this whole demo website. Every screen takes a position, such as a free tier with no proof of need, a spending limit before you start, and shared hours from organisations. We built it so you can react to the positions, and tell us where you disagree.
        </p>
        <p className="mt-4 text-[15px] leading-relaxed text-ink-300">Nothing in it is real. That is the point, because it is cheap to argue with and cheap to change.</p>
      </div>
      <div ref={r.ref} className="relative min-h-[300px] rounded-3xl bg-[#F4F5F7] p-5" style={{ backgroundImage: 'radial-gradient(#C3C8D2 1.2px, transparent 1.2px)', backgroundSize: '22px 22px' }}>
        <div className="mb-3 text-[12px] font-semibold text-slate-500">Questions the demo is built to provoke</div>
        <div className="grid gap-4 sm:grid-cols-2">
          {NOTES.map((n, i) => (
            <div
              key={n.q}
              className={'rounded-[3px] p-4 text-[15px] font-semibold leading-snug text-slate-900 ' + (i === 2 ? 'sm:col-span-2 sm:mx-auto sm:max-w-[70%]' : '')}
              style={{ background: n.c, opacity: r.on ? 1 : 0, transform: r.on ? `rotate(${n.rot}deg)` : `translateY(-30px) rotate(${n.rot * 4}deg) scale(.9)`, transition: `all .6s cubic-bezier(.3,1.4,.5,1) ${i * 250}ms`, boxShadow: '0 1px 1px rgba(0,0,0,.12), 0 8px 12px -4px rgba(0,0,0,.28)' }}
            >
              {n.q}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
