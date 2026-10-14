import { useEffect, useMemo, useRef, useState } from 'react'
import type { AppProps } from '../screens/Session'
import { rng, gauss } from '../lib/prng'

interface Cell {
  id: number
  code: string
  kind: 'load' | 'describe' | 'plot' | 'train'
}
const CELLS: Cell[] = [
  { id: 1, kind: 'load', code: "import pandas as pd\nimport torch\n\ndf = pd.read_csv('student_devices.csv')\ndf.shape" },
  { id: 2, kind: 'describe', code: 'df.describe().round(2)' },
  { id: 3, kind: 'plot', code: "df['laptop_age_years'].hist(bins=12)" },
  { id: 4, kind: 'train', code: 'model = DeviceNet().cuda()\nhistory = model.fit(X_train, y_train, epochs=10)\nprint(f"Accuracy: {model.score(X_test, y_test):.2f}")' },
]

const DESCRIBE = [
  ['count', '50000', '50000', '50000', '50000'],
  ['mean', '4.12', '7.84', '1.31', '68.20'],
  ['std', '2.07', '3.95', '0.88', '12.41'],
  ['min', '0.10', '0.00', '0.00', '21.00'],
  ['50%', '3.90', '7.50', '1.20', '69.00'],
  ['max', '11.80', '22.00', '6.40', '99.00'],
]

function highlight(code: string) {
  return code.split('\n').map((line, i) => (
    <div key={i}>
      {line.split(/(\b(?:import|as|print|from|def|return)\b|'[^']*'|"[^"]*"|f"[^"]*"|\d+)/).map((t, j) => (
        <span key={j} style={{ color: /^(import|as|print|from|def|return)$/.test(t) ? '#7c3aed' : /^[f]?["']/.test(t) ? '#b45309' : /^\d+$/.test(t) ? '#15803d' : undefined }}>
          {t}
        </span>
      ))}
    </div>
  ))
}

export default function Notebook({ autoplay }: AppProps) {
  const [out, setOut] = useState<Record<number, 'run' | 'done'>>({})
  const [exec, setExec] = useState<Record<number, number>>({})
  const [kernel, setKernel] = useState<'idle' | 'busy'>('idle')
  const [epoch, setEpoch] = useState(0)
  const counter = useRef(0)
  const hist = useMemo(() => {
    const r = rng(9)
    const b = new Array(12).fill(0)
    for (let i = 0; i < 4000; i++) b[Math.max(0, Math.min(11, Math.floor(4 + gauss(r) * 2.1)))]++
    return b
  }, [])
  const losses = [0.69, 0.52, 0.41, 0.33, 0.27, 0.22, 0.19, 0.17, 0.155, 0.148]

  const run = (c: Cell) => {
    setOut((o) => ({ ...o, [c.id]: 'run' }))
    setKernel('busy')
    if (c.kind === 'train') {
      setEpoch(0)
      let e = 0
      const id = window.setInterval(() => {
        e++
        setEpoch(e)
        if (e >= 10) {
          window.clearInterval(id)
          finish(c)
        }
      }, 180)
    } else window.setTimeout(() => finish(c), 420)
  }
  const finish = (c: Cell) => {
    counter.current++
    setExec((x) => ({ ...x, [c.id]: counter.current }))
    setOut((o) => ({ ...o, [c.id]: 'done' }))
    setKernel('idle')
  }
  useEffect(() => {
    if (!autoplay) return
    setOut({ 1: 'done', 2: 'done', 3: 'done' })
    setExec({ 1: 1, 2: 2, 3: 3 })
    counter.current = 3
    const t = window.setTimeout(() => run(CELLS[3]), 300)
    return () => window.clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoplay])
  const trainRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (autoplay) trainRef.current?.scrollIntoView({ block: 'end' })
  }, [autoplay, epoch])

  const runAll = async () => {
    for (const c of CELLS) {
      run(c)
      await new Promise((r) => setTimeout(r, c.kind === 'train' ? 2600 : 500))
    }
  }
  return (
    <div className="flex h-full flex-col bg-white text-[13px] text-[#1f2937]">
      <div className="flex shrink-0 flex-wrap items-center gap-2 border-b border-[#e5e7eb] bg-[#f9fafb] px-3 py-1.5">
        <span className="font-semibold">device_study.ipynb</span>
        <button onClick={runAll} className="min-h-[30px] rounded bg-[#F37726] px-3 font-semibold text-white">
          ▶▶ Run all
        </button>
        <div className="ml-auto flex items-center gap-2 text-[12px]">
          <span>Python 3 (GPU)</span>
          <span className={'h-3 w-3 rounded-full ' + (kernel === 'busy' ? 'bg-[#F37726]' : 'border-2 border-[#9ca3af]')} title={`Kernel ${kernel}`} />
        </div>
      </div>
      <div className="flex min-h-0 flex-1">
        <div className="thin-scroll min-w-0 flex-1 overflow-auto px-2 py-3 sm:px-4">
          {CELLS.map((c) => (
            <div key={c.id} className="mb-4">
              <div className="flex gap-2">
                <div className="w-12 shrink-0 pt-2 text-right font-mono text-[11px] text-[#6b7280]">[{out[c.id] === 'run' ? '*' : exec[c.id] ?? ' '}]:</div>
                <div className="min-w-0 flex-1 overflow-x-auto rounded border border-[#e5e7eb] bg-[#f7f7f7]">
                  <div className="flex items-start">
                    <pre className="m-0 min-w-0 flex-1 whitespace-pre px-3 py-2 font-mono text-[12px] leading-[18px]">{highlight(c.code)}</pre>
                    <button onClick={() => run(c)} disabled={out[c.id] === 'run'} className="m-1 flex h-9 w-9 shrink-0 items-center justify-center rounded text-[#F37726] hover:bg-[#fde8da]" aria-label={`Run cell ${c.id}`}>
                      ▶
                    </button>
                  </div>
                </div>
              </div>
              {out[c.id] && (
                <div className="ml-14 mt-1 overflow-x-auto font-mono text-[12px]" ref={c.kind === 'train' ? trainRef : undefined}>
                  {c.kind === 'load' && out[c.id] === 'done' && <div className="py-1">(50000, 8)</div>}
                  {c.kind === 'describe' && out[c.id] === 'done' && (
                    <table className="my-1 border-collapse tabnum text-[11px]">
                      <thead>
                        <tr>
                          {['', 'laptop_age', 'hrs_wait', 'crashes_wk', 'grade'].map((h) => (
                            <th key={h} className="border-b border-[#d1d5db] px-2 py-1 text-right">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {DESCRIBE.map((r) => (
                          <tr key={r[0]} className="odd:bg-[#f5f5f5]">
                            {r.map((v, i) => (
                              <td key={i} className={'px-2 py-0.5 text-right ' + (i === 0 ? 'font-bold' : '')}>{v}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                  {c.kind === 'plot' && out[c.id] === 'done' && (
                    <svg viewBox="0 0 300 140" className="my-1 h-36 w-full max-w-sm">
                      {hist.map((v, i) => (
                        <rect key={i} x={20 + i * 22} y={120 - (v / Math.max(...hist)) * 105} width="19" height={(v / Math.max(...hist)) * 105} fill="#1f77b4" />
                      ))}
                      <line x1="18" x2="286" y1="120" y2="120" stroke="#333" />
                      <text x="20" y="134" fontSize="9" fill="#555">0</text>
                      <text x="280" y="134" fontSize="9" fill="#555" textAnchor="end">12 yrs</text>
                    </svg>
                  )}
                  {c.kind === 'train' && (
                    <div className="py-1">
                      {losses.slice(0, epoch).map((l, i) => (
                        <div key={i} className="whitespace-pre">
                          Epoch {String(i + 1).padStart(2, ' ')}/10 [{'='.repeat(i + 1).padEnd(10, ' ')}] loss: {l.toFixed(3)} · GPU 0.21 s
                        </div>
                      ))}
                      <svg viewBox="0 0 240 90" className="my-2 h-24 w-full max-w-xs">
                        <line x1="20" y1="80" x2="235" y2="80" stroke="#999" />
                        <line x1="20" y1="5" x2="20" y2="80" stroke="#999" />
                        <polyline fill="none" stroke="#F37726" strokeWidth="2" points={losses.slice(0, Math.max(1, epoch)).map((l, i) => `${20 + i * 23},${80 - (l / 0.7) * 72}`).join(' ')} />
                        <text x="232" y="76" fontSize="8" textAnchor="end" fill="#666">epoch</text>
                        <text x="24" y="12" fontSize="8" fill="#666">loss</text>
                      </svg>
                      {out[c.id] === 'done' && <div className="text-[14px] font-bold text-[#15803d]">Accuracy: 0.94</div>}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="hidden w-52 shrink-0 border-l border-[#e5e7eb] bg-[#fafafa] p-3 text-[12px] md:block">
          <div className="mb-2 text-[11px] font-bold uppercase tracking-wide text-[#6b7280]">Variables</div>
          {[
            ['df', 'DataFrame', '50000×8'],
            ['X_train', 'Tensor', '40000×7'],
            ['y_train', 'Tensor', '40000'],
            ['model', 'DeviceNet', exec[4] ? 'trained' : '–'],
          ].map(([n, t, s]) => (
            <div key={n} className="flex justify-between border-b border-[#eee] py-1 font-mono">
              <span className="font-semibold">{n}</span>
              <span className="text-[#6b7280]">{t}</span>
              <span>{s}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
