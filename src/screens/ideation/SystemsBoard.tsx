import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Src } from './shared'

// The systems map, drawn like a Miro board: sticky notes grouped into frames on
// a dotted canvas, joined by labelled connectors. The canvas is wider than a
// phone, so it pans: swipe on touch, drag with a mouse. Each frame builds when
// it is actually on screen, so on a narrow screen the map builds as you swipe.

interface Col {
  title: string
  note: string
  frame: string
  items: { rot: number; body: ReactNode }[]
}

const COLS: Col[] = [
  {
    title: 'Who is stuck',
    note: '#FFE680',
    frame: '#E8C547',
    items: [
      { rot: -1.6, body: 'Students on an old laptop, or only a phone' },
      { rot: 1.2, body: 'High schoolers and self-learners with no enrolment' },
      { rot: -0.8, body: 'Graduates whose uni software licences end' },
      { rot: 1.7, body: 'Trainers who set up a new cohort’s laptops' },
    ],
  },
  {
    title: 'Barriers',
    note: '#FFB5C9',
    frame: '#E57A9B',
    items: [
      { rot: 1.1, body: <>A design or media laptop costs A$1,800 to 2,800<Src id="laptop" tone="light" /></> },
      { rot: -1.4, body: <>10.5% of Australians were mobile-only (2023)<Src id="adii" tone="light" /></> },
      { rot: 0.9, body: <>UTS site licences stop when enrolment ends<Src id="utsSoftware" tone="light" /></> },
      { rot: -1.2, body: <>Loan laptops: hardship-tested, approved semester by semester<Src id="loanLaptops" tone="light" /><Src id="loanMq" tone="light" /></> },
    ],
  },
  {
    title: 'What people do now',
    note: '#B9F0C2',
    frame: '#5DBE74',
    items: [
      { rot: -1.0, body: <>Library computers, until the library closes<Src id="interview" tone="light" /></> },
      { rot: 1.5, body: <>Uni virtual desktops (UTS, ANU), tied to enrolment<Src id="utsVdi" tone="light" /><Src id="anuVdi" tone="light" /></> },
      { rot: -1.3, body: <>Laptop loans: one US uni (UNH) had all ~150 loaners out at once<Src id="unh" tone="light" /></> },
      { rot: 0.8, body: <>A phone: “it was a struggle”<Src id="log" tone="light" /></> },
    ],
  },
  {
    title: 'Forces and risks',
    note: '#FFC98F',
    frame: '#E8923A',
    items: [
      { rot: 1.4, body: 'Mobile data can cost more than the compute' },
      { rot: -1.1, body: 'Vendors decide where their licences can run' },
      { rot: 1.0, body: 'Cloud servers still need power' },
      { rot: -1.5, body: 'Relying on one rented platform risks lock-in' },
    ],
  },
]

const FW = 216 // frame width
const GAP = 100
const X0 = 28
const FY = 78
const FH = 430
const W = X0 * 2 + COLS.length * FW + (COLS.length - 1) * GAP
const H = FY + FH + 28

const LINKS = ['meet', 'so they use', 'but face']

export function SystemsBoard() {
  const scroller = useRef<HTMLDivElement>(null)
  const frames = useRef<(HTMLDivElement | null)[]>([])
  const reduced = typeof window === 'undefined' || !('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const [shown, setShown] = useState<boolean[]>(() => COLS.map(() => reduced))

  useEffect(() => {
    if (reduced) return
    const io = new IntersectionObserver(
      (es) => {
        for (const e of es) {
          if (!e.isIntersecting) continue
          const i = Number((e.target as HTMLElement).dataset.frame)
          setShown((s) => (s[i] ? s : s.map((v, k) => v || k === i)))
          io.unobserve(e.target)
        }
      },
      // Clipped by the pan area, so a frame counts only once most of it is visible.
      { threshold: 0.45 },
    )
    frames.current.forEach((el) => el && io.observe(el))
    return () => io.disconnect()
  }, [reduced])
  const drag = useRef<{ x: number; left: number } | null>(null)

  return (
    <div className="overflow-hidden rounded-3xl bg-[#F4F5F7] ring-1 ring-black/10">
      <div className="flex items-center gap-3 border-b border-black/10 bg-white px-4 py-2.5 text-[13px] text-slate-600">
        <span className="flex h-6 w-6 items-center justify-center rounded-md bg-[#FFD02F] text-[13px] font-black text-slate-900">S</span>
        <span className="font-semibold text-slate-800">Stratus systems map</span>
        <span className="ml-auto hidden text-slate-400 sm:inline">Drag the board to pan</span>
        <span className="ml-auto text-slate-400 sm:hidden">Swipe to pan</span>
      </div>
      <div
        ref={scroller}
        className="cursor-grab overflow-x-auto overscroll-x-contain active:cursor-grabbing"
        style={{ touchAction: 'pan-x pan-y' }}
        onPointerDown={(e) => {
          if (e.pointerType !== 'mouse' || (e.target as HTMLElement).closest('a')) return
          drag.current = { x: e.clientX, left: scroller.current!.scrollLeft }
        }}
        onPointerMove={(e) => {
          if (drag.current && scroller.current) scroller.current.scrollLeft = drag.current.left - (e.clientX - drag.current.x)
        }}
        onPointerUp={() => (drag.current = null)}
        onPointerLeave={() => (drag.current = null)}
      >
        <div
          className="relative select-none"
          style={{ width: W, height: H, backgroundImage: 'radial-gradient(#C3C8D2 1.2px, transparent 1.2px)', backgroundSize: '22px 22px' }}
        >
          {/* connectors */}
          <svg className="pointer-events-none absolute inset-0" width={W} height={H} aria-hidden="true">
            <defs>
              <marker id="sb-ah" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="8" markerHeight="8" orient="auto">
                <path d="M0 0 10 5 0 10z" fill="#4262FF" />
              </marker>
            </defs>
            {LINKS.map((_, i) => {
              const x1 = X0 + (i + 1) * FW + i * GAP + 4
              const x2 = x1 + GAP - 8
              return <path key={i} d={`M${x1} ${FY + 200} C ${x1 + 26} ${FY + 200}, ${x2 - 26} ${FY + 200}, ${x2} ${FY + 200}`} stroke="#4262FF" strokeWidth="2.5" fill="none" markerEnd="url(#sb-ah)" style={{ opacity: shown[i + 1] ? 1 : 0, transition: 'opacity .5s ease' }} />
            })}
          </svg>
          {LINKS.map((l, i) => (
            <div key={l} className="absolute -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-full bg-white px-2 py-0.5 text-[11px] font-semibold text-[#4262FF] shadow ring-1 ring-[#4262FF]/30" style={{ left: X0 + (i + 1) * FW + i * GAP + GAP / 2, top: FY + 200, opacity: shown[i + 1] ? 1 : 0, transition: 'opacity .5s ease .1s' }}>
              {l}
            </div>
          ))}

          {COLS.map((c, i) => {
            const on = shown[i]
            return (
            <div key={c.title} ref={(el) => (frames.current[i] = el)} data-frame={i} className="absolute" style={{ left: X0 + i * (FW + GAP), top: FY - 30, width: FW, opacity: shown[i] ? 1 : 0.25, transform: shown[i] ? 'none' : 'translateY(20px)', transition: 'all .6s ease' }}>
              <div className="mb-1.5 flex items-center gap-1.5 text-[13px] font-bold text-slate-700">
                <span className="h-2.5 w-2.5 rounded-sm" style={{ background: c.frame }} />
                {c.title}
              </div>
              <div className="grid content-start gap-3 rounded-xl border-2 border-dashed bg-white/60 p-3" style={{ borderColor: c.frame, height: FH }}>
                {c.items.map((it, j) => (
                  <div
                    key={j}
                    className="rounded-[3px] px-3 py-2.5 text-[13.5px] font-medium leading-snug text-slate-900"
                    style={{ background: c.note, opacity: on ? 1 : 0, transform: on ? `rotate(${it.rot}deg)` : `rotate(${it.rot * 3}deg) scale(.85)`, transition: `all .45s cubic-bezier(.3,1.4,.5,1) ${250 + j * 160}ms`, boxShadow: '0 1px 1px rgba(0,0,0,.12), 0 6px 10px -4px rgba(0,0,0,.25)' }}
                  >
                    {it.body}
                  </div>
                ))}
              </div>
            </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
