import { useEffect, useMemo, useState } from 'react'
import type { AppProps } from '../screens/Session'
import { sales, REGIONS, PRODUCTS, moneyK } from './data'

const PCOL = ['#F7C948', '#29A8F5', '#8E7CFF', '#22B573', '#FF5C7A', '#FF9F43']
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export default function BIDashboard({ autoplay, mobile }: AppProps) {
  const all = useMemo(() => sales(), [])
  const [region, setRegion] = useState<string>('All')
  const [product, setProduct] = useState<string>('All')
  const [quarter, setQuarter] = useState<number>(0)
  const [refreshing, setRefreshing] = useState(false)
  const [note, setNote] = useState<string | null>(null)

  useEffect(() => {
    if (!autoplay) return
    const t = window.setTimeout(() => setRegion('Melbourne'), 1200)
    return () => window.clearTimeout(t)
  }, [autoplay])

  const agg = useMemo(() => {
    const byRegion: Record<string, number> = Object.fromEntries(REGIONS.map((r) => [r, 0]))
    const byProduct: Record<string, number> = Object.fromEntries(PRODUCTS.map((p) => [p, 0]))
    const byMonth = new Array(12).fill(0)
    let rev = 0
    let units = 0
    let marginSum = 0
    let n = 0
    for (const r of all) {
      if (product !== 'All' && r.product !== product) continue
      if (quarter && r.quarter !== quarter) continue
      const v = r.units * r.price
      byRegion[r.region] += v
      if (region !== 'All' && r.region !== region) continue
      byProduct[r.product] += v
      byMonth[+r.date.slice(5, 7) - 1] += v
      rev += v
      units += r.units
      marginSum += r.margin * v
      n++
    }
    return { byRegion, byProduct, byMonth, rev, units, margin: marginSum / Math.max(1, rev), orders: n }
  }, [all, region, product, quarter])

  const refresh = () => {
    setRefreshing(true)
    window.setTimeout(() => setRefreshing(false), 1100)
  }
  const exportPdf = () => {
    setNote('Exported Sales_Dashboard.pdf to your Stratus files')
    window.setTimeout(() => setNote(null), 2800)
  }
  const Select = ({ id, label, value, opts, onChange }: { id: string; label: string; value: string; opts: string[]; onChange: (v: string) => void }) => (
    <label className="flex min-w-0 flex-col gap-0.5" htmlFor={id}>
      <span className="text-[10px] font-bold uppercase tracking-wide text-[#8a7a3a]">{label}</span>
      <select id={id} value={value} onChange={(e) => onChange(e.target.value)} className="min-h-[34px] rounded-md border border-[#e5dcc0] bg-white px-2 text-[12px]">
        {opts.map((o) => (
          <option key={o}>{o}</option>
        ))}
      </select>
    </label>
  )
  const regMax = Math.max(...Object.values(agg.byRegion))
  const monMax = Math.max(...agg.byMonth, 1)
  const prodTotal = Object.values(agg.byProduct).reduce((a, b) => a + b, 0) || 1
  let acc = 0
  return (
    <div className={'relative flex h-full flex-col bg-[#f6f4ee] text-[12px] text-[#2a2a2a] transition-opacity ' + (refreshing ? 'opacity-50' : '')}>
      <div className="flex shrink-0 flex-wrap items-end gap-2 border-b border-[#e5dcc0] bg-white px-3 py-2">
        <div className="mr-2 font-bold text-[#2a2a2a]">Sales 2026</div>
        <Select id="bi-region" label="Region" value={region} opts={['All', ...REGIONS]} onChange={setRegion} />
        <Select id="bi-product" label="Product" value={product} opts={['All', ...PRODUCTS]} onChange={setProduct} />
        <Select id="bi-q" label="Quarter" value={quarter ? 'Q' + quarter : 'All'} opts={['All', 'Q1', 'Q2', 'Q3', 'Q4']} onChange={(v) => setQuarter(v === 'All' ? 0 : +v.slice(1))} />
        <div className="ml-auto flex gap-2">
          <button onClick={refresh} className="min-h-[34px] rounded-md border border-[#e5dcc0] bg-white px-3 font-semibold">
            {refreshing ? 'Refreshing…' : 'Refresh data'}
          </button>
          <button onClick={exportPdf} className="min-h-[34px] rounded-md bg-[#2a2a2a] px-3 font-semibold text-white">
            Export PDF
          </button>
        </div>
      </div>
      <div className="thin-scroll min-h-0 flex-1 overflow-auto p-3">
        <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
          {[
            ['Revenue', moneyK(agg.rev)],
            ['Orders', agg.orders.toLocaleString()],
            ['Units', agg.units.toLocaleString()],
            ['Avg margin', agg.margin.toFixed(1) + '%'],
          ].map(([k, v]) => (
            <div key={k} className="rounded-lg bg-white p-3 shadow-sm ring-1 ring-black/5">
              <div className="text-[10px] font-bold uppercase tracking-wide text-[#8a8a8a]">{k}</div>
              <div className="tabnum mt-1 text-xl font-bold">{v}</div>
            </div>
          ))}
        </div>
        <div className={'mt-2 grid gap-2 ' + (mobile ? '' : 'lg:grid-cols-2')}>
          <div className="rounded-lg bg-white p-3 shadow-sm ring-1 ring-black/5">
            <div className="flex justify-between font-semibold">
              Revenue by region
              {region !== 'All' && (
                <button className="text-[11px] text-[#b07f00] underline" onClick={() => setRegion('All')}>
                  Clear filter
                </button>
              )}
            </div>
            <div className="mt-2 space-y-1.5">
              {REGIONS.map((r) => {
                const v = agg.byRegion[r]
                const dim = region !== 'All' && region !== r
                return (
                  <button key={r} onClick={() => setRegion(region === r ? 'All' : r)} className="flex w-full items-center gap-2 text-left">
                    <span className="w-20 shrink-0">{r}</span>
                    <span className="h-5 flex-1 rounded bg-[#f2eedf]">
                      <span className="block h-5 rounded transition-all duration-300" style={{ width: `${(v / regMax) * 100}%`, background: dim ? '#e8dfbf' : '#F7C948' }} />
                    </span>
                    <span className="tabnum w-14 text-right font-semibold">{moneyK(v)}</span>
                  </button>
                )
              })}
            </div>
          </div>
          <div className="rounded-lg bg-white p-3 shadow-sm ring-1 ring-black/5">
            <div className="font-semibold">Monthly revenue{region !== 'All' ? `, ${region}` : ''}</div>
            <svg viewBox="0 0 320 130" className="mt-1 h-32 w-full">
              {[0, 0.5, 1].map((g) => (
                <line key={g} x1="0" x2="320" y1={110 - g * 95} y2={110 - g * 95} stroke="#eee" />
              ))}
              <polyline fill="none" stroke="#D99A00" strokeWidth="2.5" points={agg.byMonth.map((v, i) => `${10 + i * 27.3},${110 - (v / monMax) * 95}`).join(' ')} />
              {agg.byMonth.map((v, i) => (
                <circle key={i} cx={10 + i * 27.3} cy={110 - (v / monMax) * 95} r={i === 11 ? 4 : 2.2} fill="#D99A00" />
              ))}
              {MONTHS.map((m, i) =>
                i % 2 === 0 ? (
                  <text key={m} x={10 + i * 27.3} y="126" fontSize="9" textAnchor="middle" fill="#888">
                    {m}
                  </text>
                ) : null,
              )}
            </svg>
          </div>
          <div className="rounded-lg bg-white p-3 shadow-sm ring-1 ring-black/5">
            <div className="font-semibold">Share by product</div>
            <div className="mt-2 flex items-center gap-4">
              <svg viewBox="0 0 42 42" className="h-28 w-28 shrink-0 -rotate-90">
                {PRODUCTS.map((p, i) => {
                  const f = agg.byProduct[p] / prodTotal
                  const el = <circle key={p} cx="21" cy="21" r="15.9" fill="none" stroke={PCOL[i]} strokeWidth="6" strokeDasharray={`${f * 100} ${100 - f * 100}`} strokeDashoffset={-acc * 100} pathLength={100} onClick={() => setProduct(product === p ? 'All' : p)} style={{ cursor: 'pointer', opacity: product !== 'All' && product !== p ? 0.3 : 1 }} />
                  acc += f
                  return el
                })}
              </svg>
              <ul className="min-w-0 space-y-1">
                {PRODUCTS.map((p, i) => (
                  <li key={p} className="flex items-center gap-2 tabnum">
                    <span className="h-2.5 w-2.5 shrink-0 rounded-sm" style={{ background: PCOL[i] }} />
                    <span className="truncate">{p}</span>
                    <span className="ml-auto pl-2 text-[#888]">{Math.round((agg.byProduct[p] / prodTotal) * 100)}%</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="rounded-lg bg-white p-3 shadow-sm ring-1 ring-black/5">
            <div className="font-semibold">Top products</div>
            <table className="mt-2 w-full tabnum">
              <tbody>
                {[...PRODUCTS]
                  .sort((a, b) => agg.byProduct[b] - agg.byProduct[a])
                  .map((p, i) => (
                    <tr key={p} className="border-b border-[#f0f0f0]">
                      <td className="py-1 text-[#999]">{i + 1}</td>
                      <td className="py-1">{p}</td>
                      <td className="py-1 text-right font-semibold">{moneyK(agg.byProduct[p])}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {note && <div className="anim-pop absolute left-1/2 top-16 -translate-x-1/2 rounded-full bg-[#2a2a2a] px-4 py-2 font-semibold text-white shadow-xl">{note}</div>}
    </div>
  )
}
