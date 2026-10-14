import { useEffect, useMemo, useRef, useState } from 'react'
import type { AppProps } from '../screens/Session'
import { sales, money, REGIONS, moneyK } from './data'
import { load, save } from '../lib/storage'

const ROW_H = 26
const COLS = [
  { key: 'date', label: 'Date', w: 104 },
  { key: 'region', label: 'Region', w: 100 },
  { key: 'product', label: 'Product', w: 128 },
  { key: 'units', label: 'Units', w: 64 },
  { key: 'price', label: 'Price', w: 72 },
  { key: 'revenue', label: 'Revenue', w: 104 },
  { key: 'margin', label: 'Margin %', w: 84 },
] as const
const LETTERS = 'ABCDEFG'

type Edits = Record<string, number>

export default function Spreadsheet({ autoplay }: AppProps) {
  const base = useMemo(() => sales(), [])
  const [edits, setEdits] = useState<Edits>(() => load('stratus.app.sheet.edits', {}))
  const [sel, setSel] = useState<{ r: number; c: number }>({ r: 0, c: 5 })
  const [scrollTop, setScrollTop] = useState(0)
  const [height, setHeight] = useState(500)
  const [tab, setTab] = useState<'data' | 'pivot' | 'chart'>('data')
  const [editVal, setEditVal] = useState<string | null>(null)
  const box = useRef<HTMLDivElement>(null)

  useEffect(() => save('stratus.app.sheet.edits', edits), [edits])
  useEffect(() => {
    const el = box.current
    if (!el) return
    const ro = new ResizeObserver(() => setHeight(el.clientHeight))
    ro.observe(el)
    return () => ro.disconnect()
  }, [tab])

  const val = (r: number, key: string): number | string => {
    const row = base[r]
    const u = edits[`${r}:units`] ?? row.units
    const p = edits[`${r}:price`] ?? row.price
    if (key === 'units') return u
    if (key === 'price') return p
    if (key === 'revenue') return u * p
    return (row as unknown as Record<string, number | string>)[key]
  }
  const total = useMemo(() => {
    let t = 0
    for (let i = 0; i < base.length; i++) t += base[i].units * base[i].price
    const touched = new Set(Object.keys(edits).map((k) => +k.split(':')[0]))
    for (const r of touched) {
      const row = base[r]
      t += (edits[`${r}:units`] ?? row.units) * (edits[`${r}:price`] ?? row.price) - row.units * row.price
    }
    return t
  }, [base, edits])

  useEffect(() => {
    if (!autoplay || tab !== 'data') return
    let raf = 0
    const start = performance.now()
    const stepFn = (t: number) => {
      const el = box.current
      if (el) el.scrollTop = Math.min(el.scrollHeight, ((t - start) / 1000) * 2600)
      if (t - start < 6000) raf = requestAnimationFrame(stepFn)
    }
    const d = window.setTimeout(() => (raf = requestAnimationFrame(stepFn)), 800)
    return () => {
      window.clearTimeout(d)
      cancelAnimationFrame(raf)
    }
  }, [autoplay, tab])

  const first = Math.max(0, Math.floor(scrollTop / ROW_H) - 5)
  const count = Math.ceil(height / ROW_H) + 10
  const rows = []
  for (let r = first; r < Math.min(base.length, first + count); r++) rows.push(r)
  const selKey = COLS[sel.c].key
  const selVal = val(sel.r, selKey)
  const formula = selKey === 'revenue' ? `=D${sel.r + 2}*E${sel.r + 2}` : String(selVal)
  const editable = selKey === 'units' || selKey === 'price'
  const commit = () => {
    if (editVal == null) return
    const n = Number(editVal.replace(/[^0-9.]/g, ''))
    if (!Number.isNaN(n) && editable) setEdits({ ...edits, [`${sel.r}:${selKey}`]: n })
    setEditVal(null)
  }
  const totalW = 48 + COLS.reduce((a, c) => a + c.w, 0)

  return (
    <div className="flex h-full flex-col bg-white font-sans text-[12px] text-[#222]">
      <div className="flex shrink-0 items-center gap-2 border-b border-[#ddd] bg-[#f3f3f3] px-2 py-1.5">
        <div className="w-16 shrink-0 rounded border border-[#ccc] bg-white px-2 py-1 text-center font-mono">
          {LETTERS[sel.c]}
          {sel.r + 2}
        </div>
        <span className="font-serif italic text-[#888]">fx</span>
        <input
          id="sheet-fx"
          data-primary-input
          className="min-w-0 flex-1 rounded border border-[#ccc] bg-white px-2 py-1 font-mono outline-none focus:border-[#22B573]"
          value={editVal ?? formula}
          onFocus={() => editable && setEditVal(String(selVal))}
          onChange={(e) => setEditVal(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => e.key === 'Enter' && (e.currentTarget as HTMLInputElement).blur()}
          readOnly={!editable}
          aria-label="Formula bar"
        />
      </div>
      {tab === 'data' && (
        <>
          <div ref={box} className="thin-scroll relative min-h-0 flex-1 overflow-auto" onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)}>
            <div style={{ width: totalW, height: (base.length + 1) * ROW_H, position: 'relative' }}>
              <div className="sticky top-0 z-20 flex bg-[#f3f3f3]" style={{ height: ROW_H }}>
                <div className="sticky left-0 z-10 w-12 shrink-0 border-b border-r border-[#d4d4d4] bg-[#f3f3f3]" />
                {COLS.map((c, i) => (
                  <div key={c.key} className={'flex shrink-0 items-center justify-center border-b border-r border-[#d4d4d4] font-semibold ' + (sel.c === i ? 'bg-[#d6efe2] text-[#13804F]' : 'text-[#555]')} style={{ width: c.w }}>
                    {LETTERS[i]}
                  </div>
                ))}
              </div>
              {rows.map((r) => (
                <div key={r} className="absolute left-0 flex" style={{ top: (r + 1) * ROW_H, height: ROW_H }}>
                  <div className={'sticky left-0 z-10 flex w-12 shrink-0 items-center justify-center border-b border-r border-[#e1e1e1] tabnum ' + (sel.r === r ? 'bg-[#d6efe2] text-[#13804F]' : 'bg-[#f3f3f3] text-[#666]')}>{r + 2}</div>
                  {COLS.map((c, ci) => {
                    const v = val(r, c.key)
                    const on = sel.r === r && sel.c === ci
                    const edited = edits[`${r}:${c.key}`] != null
                    let style: React.CSSProperties = { width: c.w }
                    let text: string = String(v)
                    if (c.key === 'price') text = money(v as number)
                    if (c.key === 'revenue') {
                      text = money(v as number)
                      const pct = Math.min(1, (v as number) / 3000)
                      style = { ...style, background: `linear-gradient(90deg, rgba(34,181,115,.22) ${pct * 100}%, transparent ${pct * 100}%)` }
                    }
                    if (c.key === 'margin') {
                      const m = v as number
                      style = { ...style, color: m < 15 ? '#c62828' : m > 32 ? '#13804F' : undefined, fontWeight: m < 15 || m > 32 ? 600 : undefined }
                    }
                    return (
                      <div
                        key={c.key}
                        onClick={() => {
                          setSel({ r, c: ci })
                          setEditVal(null)
                        }}
                        onDoubleClick={() => {
                          if (c.key === 'units' || c.key === 'price') {
                            setSel({ r, c: ci })
                            setEditVal(String(v))
                            requestAnimationFrame(() => document.getElementById('sheet-fx')?.focus())
                          }
                        }}
                        className={'flex shrink-0 cursor-cell items-center truncate border-b border-r border-[#e8e8e8] px-1.5 tabnum ' + (typeof v === 'number' ? 'justify-end' : '') + (on ? ' outline outline-2 -outline-offset-2 outline-[#22B573]' : '') + (edited ? ' bg-amber-50' : '')}
                        style={style}
                      >
                        {text}
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-4 border-t border-[#ddd] bg-[#f8f8f8] px-3 py-1.5 tabnum">
            <span className="font-semibold">SUM(F2:F{base.length + 1})</span>
            <span className="font-bold text-[#13804F]">{money(total)}</span>
            <span className="ml-auto text-[#777]">{base.length.toLocaleString()} rows · smooth on any device</span>
          </div>
        </>
      )}
      {tab === 'pivot' && <Pivot />}
      {tab === 'chart' && <Chart />}
      <div className="flex h-9 shrink-0 items-end gap-0.5 border-t border-[#ccc] bg-[#e9e9e9] px-2">
        {(
          [
            ['data', 'Sales 2026'],
            ['pivot', 'Pivot'],
            ['chart', 'Chart'],
          ] as const
        ).map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)} className={'h-8 rounded-t px-4 font-semibold ' + (tab === k ? 'bg-white text-[#13804F] shadow' : 'text-[#555]')}>
            {l}
          </button>
        ))}
      </div>
    </div>
  )
}

function usePivot() {
  return useMemo(() => {
    const rows = sales()
    const m: Record<string, number[]> = {}
    for (const r of REGIONS) m[r] = [0, 0, 0, 0]
    for (const r of rows) m[r.region][r.quarter - 1] += r.units * r.price
    return m
  }, [])
}

function Pivot() {
  const m = usePivot()
  const max = Math.max(...Object.values(m).flat())
  return (
    <div className="thin-scroll min-h-0 flex-1 overflow-auto p-4">
      <div className="mb-2 text-sm font-bold">Revenue by region and quarter</div>
      <table className="tabnum border-collapse text-[12px]">
        <thead>
          <tr className="bg-[#13804F] text-white">
            <th className="px-3 py-1.5 text-left">Region</th>
            {['Q1', 'Q2', 'Q3', 'Q4', 'Total'].map((q) => (
              <th key={q} className="px-3 py-1.5 text-right">{q}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Object.entries(m).map(([r, qs]) => (
            <tr key={r} className="border-b border-[#eee]">
              <td className="px-3 py-1.5 font-semibold">{r}</td>
              {qs.map((v, i) => (
                <td key={i} className="px-3 py-1.5 text-right" style={{ background: `rgba(34,181,115,${(v / max) * 0.45})` }}>
                  {moneyK(v)}
                </td>
              ))}
              <td className="px-3 py-1.5 text-right font-bold">{moneyK(qs.reduce((a, b) => a + b, 0))}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function Chart() {
  const m = usePivot()
  const totals = Object.entries(m).map(([r, q]) => [r, q.reduce((a, b) => a + b, 0)] as const)
  const max = Math.max(...totals.map((t) => t[1]))
  return (
    <div className="min-h-0 flex-1 overflow-auto p-4">
      <div className="mb-3 text-sm font-bold">Revenue by region, 2026</div>
      <svg viewBox="0 0 420 220" className="w-full max-w-xl">
        {[0, 0.25, 0.5, 0.75, 1].map((g) => (
          <g key={g}>
            <line x1="70" x2="410" y1={190 - g * 160} y2={190 - g * 160} stroke="#eee" />
            <text x="64" y={194 - g * 160} textAnchor="end" fontSize="10" fill="#888">
              {moneyK(max * g)}
            </text>
          </g>
        ))}
        {totals.map(([r, v], i) => {
          const h = (v / max) * 160
          return (
            <g key={r}>
              <rect x={86 + i * 64} y={190 - h} width="40" height={h} rx="4" fill={i === 0 ? '#13804F' : '#22B573'} />
              <text x={106 + i * 64} y="206" textAnchor="middle" fontSize="10" fill="#555">
                {r}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}
