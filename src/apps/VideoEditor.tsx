import { useEffect, useRef, useState } from 'react'
import type { AppProps } from '../screens/Session'

const DUR = 24
const TRACKS = [
  { name: 'V2', clips: [{ s: 6, e: 10, label: 'Title: Stratus', c: '#8E7CFF' }, { s: 17, e: 21, label: 'Lower third', c: '#8E7CFF' }] },
  { name: 'V1', clips: [{ s: 0, e: 7.5, label: 'campus_wide.mp4', c: '#5C7CFA' }, { s: 7.5, e: 15, label: 'laptop_freeze.mp4', c: '#3B4FD1' }, { s: 15, e: 24, label: 'phone_demo.mp4', c: '#5C7CFA' }] },
  { name: 'A1', clips: [{ s: 0, e: 24, label: 'music_bed.wav', c: '#22B573' }] },
  { name: 'A2', clips: [{ s: 2, e: 12, label: 'voiceover.wav', c: '#13804F' }] },
]
const SCENES = [
  { until: 7.5, a: '#1E3A8A', b: '#0EA5E9', text: 'UTS campus, 8:42 am' },
  { until: 15, a: '#7F1D1D', b: '#F97316', text: 'The old laptop freezes' },
  { until: 24, a: '#4C1D95', b: '#8E7CFF', text: 'Same project, on a phone' },
]

export default function VideoEditor({ autoplay, mobile }: AppProps) {
  const [t, setT] = useState(0)
  const [playing, setPlaying] = useState(!!autoplay)
  const [exp, setExp] = useState<number | null>(null)
  const [done, setDone] = useState(false)
  const canvas = useRef<HTMLCanvasElement>(null)
  const tRef = useRef(0)
  tRef.current = t

  useEffect(() => {
    if (!playing) return
    let raf = 0
    let last = performance.now()
    const step = (now: number) => {
      const dt = (now - last) / 1000
      last = now
      setT((x) => (x + dt >= DUR ? 0 : x + dt))
      raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [playing])

  useEffect(() => {
    const c = canvas.current
    if (!c) return
    const ctx = c.getContext('2d')!
    const W = c.width
    const H = c.height
    const sc = SCENES.find((s) => t < s.until) || SCENES[2]
    const g = ctx.createLinearGradient(0, 0, W, H)
    g.addColorStop(0, sc.a)
    g.addColorStop(1, sc.b)
    ctx.fillStyle = g
    ctx.fillRect(0, 0, W, H)
    for (let i = 0; i < 6; i++) {
      ctx.fillStyle = `rgba(255,255,255,${0.05 + i * 0.01})`
      ctx.beginPath()
      ctx.arc(((t * 40 + i * 120) % (W + 200)) - 100, H * (0.3 + 0.1 * Math.sin(t + i)), 40 + i * 12, 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.fillStyle = '#fff'
    ctx.font = 'bold 34px Inter, sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(sc.text, W / 2, H / 2 + 10)
    if (t > 6 && t < 10) {
      ctx.font = '800 22px Inter, sans-serif'
      ctx.fillText('STRATUS', W / 2, H / 2 - 40)
    }
    ctx.textAlign = 'left'
    ctx.font = '14px "JetBrains Mono", monospace'
    ctx.fillStyle = 'rgba(255,255,255,.85)'
    ctx.fillText(tc(t), 16, H - 16)
  }, [t])

  const doExport = () => {
    setPlaying(false)
    setExp(0)
    const start = performance.now()
    const id = window.setInterval(() => {
      const p = Math.min(1, (performance.now() - start) / 3000)
      setExp(p)
      if (p >= 1) {
        window.clearInterval(id)
        setExp(null)
        setDone(true)
        window.setTimeout(() => setDone(false), 3000)
      }
    }, 60)
  }
  const scrub = (e: React.PointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    setT(Math.max(0, Math.min(DUR - 0.01, ((e.clientX - r.left) / r.width) * DUR)))
  }
  return (
    <div className="relative flex h-full flex-col bg-[#18181d] text-[12px] text-[#ddd]">
      <div className="flex min-h-0 flex-1 items-center justify-center bg-black p-2">
        <canvas ref={canvas} width={960} height={540} className="max-h-full max-w-full rounded" style={{ aspectRatio: '16/9' }} />
      </div>
      <div className="flex shrink-0 items-center gap-2 border-y border-black/50 bg-[#222229] px-3 py-1.5">
        <button onClick={() => setPlaying(!playing)} className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#18181d]" aria-label={playing ? 'Pause' : 'Play'}>
          {playing ? '❚❚' : '▶'}
        </button>
        <span className="tabnum font-mono">
          {tc(t)} / {tc(DUR)}
        </span>
        <span className="hidden text-[#888] sm:inline">4K · 60 fps · GPU accelerated</span>
        <button onClick={doExport} disabled={exp != null} className="ml-auto min-h-[32px] rounded bg-[#5C7CFA] px-4 font-bold text-white">
          {exp != null ? `Exporting ${Math.round(exp * 100)}%` : 'Export'}
        </button>
      </div>
      <div className={'shrink-0 bg-[#1d1d23] ' + (mobile ? 'h-32' : 'h-44')}>
        <div className="relative ml-10 h-5 cursor-pointer border-b border-black/40" onPointerDown={scrub} onPointerMove={(e) => e.buttons && scrub(e)} style={{ touchAction: 'none' }}>
          {Array.from({ length: 7 }, (_, i) => (
            <span key={i} className="absolute top-0.5 font-mono text-[9px] text-[#777]" style={{ left: `${(i / 6) * 100}%` }}>
              {i * 4}s
            </span>
          ))}
        </div>
        <div className="relative">
          {TRACKS.map((tr) => (
            <div key={tr.name} className={'flex border-b border-black/30 ' + (mobile ? 'h-[25px]' : 'h-9')}>
              <div className="flex w-10 shrink-0 items-center justify-center font-bold text-[#888]">{tr.name}</div>
              <div className="relative flex-1">
                {tr.clips.map((c) => (
                  <div key={c.label} className="absolute bottom-0.5 top-0.5 truncate rounded px-1.5 text-[10px] font-semibold leading-[22px] text-white" style={{ left: `${(c.s / DUR) * 100}%`, width: `${((c.e - c.s) / DUR) * 100}%`, background: c.c, border: '1px solid rgba(255,255,255,.25)' }}>
                    {c.label}
                  </div>
                ))}
              </div>
            </div>
          ))}
          <div className="pointer-events-none absolute -top-5 bottom-0 ml-10 w-[calc(100%-2.5rem)]">
            <div className="absolute bottom-0 top-0 w-0.5 bg-[#ff4d6d]" style={{ left: `${(t / DUR) * 100}%` }}>
              <div className="absolute -left-1.5 top-0 h-3 w-3.5 rounded-sm bg-[#ff4d6d]" />
            </div>
          </div>
        </div>
      </div>
      {done && <div className="anim-pop absolute left-1/2 top-4 -translate-x-1/2 rounded-full bg-white px-4 py-2 text-[13px] font-semibold text-[#222] shadow-xl">Exported stratus_pitch.mp4 in 3.0 s on GPU</div>}
    </div>
  )
}

function tc(s: number) {
  const f = Math.floor((s % 1) * 60)
  return `00:${String(Math.floor(s)).padStart(2, '0')}:${String(f).padStart(2, '0')}`
}
