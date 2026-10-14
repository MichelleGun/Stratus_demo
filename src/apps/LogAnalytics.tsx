import { useEffect, useMemo, useRef, useState } from 'react'
import type { AppProps } from '../screens/Session'
import { rng, pick } from '../lib/prng'

interface Ev {
  t: number
  host: string
  src: string
  user: string
  status: 'success' | 'failed'
  bytes: number
  index: 'auth' | 'web'
}

const N = 200_000
const DAY = 86400
const USERS = ['alex', 'priya', 'sam', 'jordan', 'mei', 'lucas', 'admin', 'root', 'svc_backup', 'noah', 'chloe', 'oliver']
const HOSTS = ['web-01', 'web-02', 'auth-01', 'vpn-gw', 'db-01', 'mail-01']
const NOW = Date.UTC(2026, 9, 14, 9, 0, 0) / 1000

let cache: Ev[] | null = null
function events(): Ev[] {
  if (cache) return cache
  const r = rng(303)
  const out: Ev[] = new Array(N)
  const normal = () => `10.0.${Math.floor(r() * 8)}.${2 + Math.floor(r() * 250)}`
  const attackers = ['203.0.113.42', '198.51.100.7', '192.0.2.199', '203.0.113.88']
  for (let i = 0; i < N; i++) {
    const t = NOW - Math.floor(r() * DAY)
    const isAuth = r() < 0.42
    let src = r() < 0.18 ? `192.168.${Math.floor(r() * 4)}.${2 + Math.floor(r() * 200)}` : normal()
    let status: Ev['status'] = r() < 0.06 ? 'failed' : 'success'
    let user = pick(r, USERS)
    if (isAuth && r() < 0.012) {
      src = attackers[Math.min(3, Math.floor(Math.pow(r(), 2.2) * 4))]
      status = 'failed'
      user = pick(r, ['admin', 'root', 'admin', 'svc_backup'])
    }
    out[i] = { t, host: isAuth ? pick(r, ['auth-01', 'vpn-gw']) : pick(r, HOSTS), src, user, status, bytes: 200 + Math.floor(r() * 48000), index: isAuth ? 'auth' : 'web' }
  }
  out.sort((a, b) => b.t - a.t)
  cache = out
  return out
}

type Result =
  | { kind: 'table'; cols: string[]; rows: (string | number)[][]; scanned: number; ms: number }
  | { kind: 'chart'; series: number[]; scanned: number; ms: number }
  | { kind: 'error'; msg: string }

// A tiny parser for a Splunk-like query language.
function runQuery(q: string, rangeH: number): Result {
  const t0 = performance.now()
  const evs = events()
  const [search, ...pipes] = q.split('|').map((s) => s.trim())
  const terms = search.split(/\s+/).filter(Boolean)
  const filters: [string, string][] = []
  for (const term of terms) {
    const m = term.match(/^(\w+)=(.+)$/)
    if (!m) return { kind: 'error', msg: `I did not understand "${term}". Use field=value, like index=auth.` }
    filters.push([m[1], m[2]])
  }
  const since = NOW - rangeH * 3600
  const rows = evs.filter((e) => {
    if (e.t < since) return false
    for (const [k, v] of filters) {
      if (v === '*') continue
      const val = String((e as unknown as Record<string, unknown>)[k === 'src_ip' ? 'src' : k] ?? '')
      if (val !== v) return false
    }
    return true
  })
  const scanned = Math.round(evs.length * 6.02 + 13)
  const done = (r: Result) => ({ ...r, ms: Math.max(0.21, (performance.now() - t0) / 1000 + 0.31) }) as Result
  const pipe = pipes[0] || ''
  const fmt = (t: number) => new Date(t * 1000).toISOString().replace('T', ' ').slice(0, 19)
  let m: RegExpMatchArray | null
  if ((m = pipe.match(/^stats\s+count\s+by\s+(\w+)$/))) {
    const f = m[1] === 'src_ip' ? 'src' : m[1]
    const c = new Map<string, number>()
    for (const e of rows) {
      const k = String((e as unknown as Record<string, unknown>)[f])
      c.set(k, (c.get(k) ?? 0) + 1)
    }
    const sorted = [...c.entries()].sort((a, b) => b[1] - a[1]).slice(0, 200)
    return done({ kind: 'table', cols: [m[1], 'count'], rows: sorted, scanned, ms: 0 })
  }
  if ((m = pipe.match(/^top\s+(\w+)$/))) {
    const f = m[1] === 'src_ip' ? 'src' : m[1]
    const c = new Map<string, number>()
    for (const e of rows) {
      const k = String((e as unknown as Record<string, unknown>)[f])
      c.set(k, (c.get(k) ?? 0) + 1)
    }
    const sorted = [...c.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10)
    return done({ kind: 'table', cols: [m[1], 'count', 'percent'], rows: sorted.map(([k, v]) => [k, v, ((v / rows.length) * 100).toFixed(1) + '%']), scanned, ms: 0 })
  }
  if (/^timechart\s+count$/.test(pipe)) {
    const buckets = new Array(24).fill(0)
    for (const e of rows) buckets[Math.min(23, Math.floor((NOW - e.t) / 3600))]++
    return done({ kind: 'chart', series: buckets.reverse(), scanned, ms: 0 })
  }
  if ((m = pipe.match(/^head\s+(\d+)$/)) || !pipe) {
    const n = m ? Math.min(500, Number(m[1])) : 200
    return done({ kind: 'table', cols: ['_time', 'index', 'host', 'src_ip', 'user', 'status', 'bytes'], rows: rows.slice(0, n).map((e) => [fmt(e.t), e.index, e.host, e.src, e.user, e.status, e.bytes]), scanned, ms: 0 })
  }
  return { kind: 'error', msg: `Unknown command "${pipe}". Try stats count by src_ip, top user, timechart count or head 20.` }
}

const EXAMPLES = ['index=auth status=failed | stats count by src_ip', 'index=web | timechart count', 'index=auth | top user', 'index=* | head 20']
const ALERTS = [
  'Brute force suspected: 519 failed logins from 203.0.113.42',
  'Impossible travel: priya signed in from 2 countries in 9 min',
  'New admin account created on auth-01',
  'Spike in 404s on web-02 (x6 normal)',
  'svc_backup used outside its schedule',
]

export default function LogAnalytics({ autoplay, mobile }: AppProps) {
  const [q, setQ] = useState(EXAMPLES[0])
  const [range, setRange] = useState(24)
  const [res, setRes] = useState<Result | null>(null)
  const [running, setRunning] = useState(false)
  const [tab, setTab] = useState<'search' | 'dash' | 'alerts'>('search')
  const [alerts, setAlerts] = useState<{ t: string; a: string }[]>([{ t: '09:00:12', a: ALERTS[0] }])
  const [scroll, setScroll] = useState(0)
  const boxH = useRef(400)
  const failedBy = useMemo(() => runQuery('index=auth status=failed | stats count by src_ip', 24), [])

  const go = (query = q) => {
    setRunning(true)
    window.setTimeout(() => {
      setRes(runQuery(query, range))
      setRunning(false)
      setScroll(0)
    }, 380)
  }
  useEffect(() => {
    if (!autoplay) return
    const t = window.setTimeout(() => go(EXAMPLES[0]), 700)
    return () => window.clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoplay])
  useEffect(() => {
    let k = 1
    const id = window.setInterval(() => {
      const d = new Date(NOW * 1000 + k * 37000)
      setAlerts((a) => [{ t: d.toISOString().slice(11, 19), a: ALERTS[k % ALERTS.length] }, ...a].slice(0, 20))
      k++
    }, 6000)
    return () => window.clearInterval(id)
  }, [])

  const ROW = 28
  return (
    <div className="flex h-full flex-col bg-[#13151c] text-[12px] text-[#d8dbe5]">
      <div className="flex shrink-0 items-center gap-1 border-b border-white/5 bg-[#1a1d26] px-2">
        {(
          [
            ['search', 'Search'],
            ['dash', 'Dashboards'],
            ['alerts', `Alerts (${alerts.length})`],
          ] as const
        ).map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)} className={'min-h-[38px] px-3 font-semibold ' + (tab === k ? 'border-b-2 border-[#FF5C7A] text-white' : 'text-[#8b90a3]')}>
            {l}
          </button>
        ))}
      </div>
      {tab === 'search' && (
        <div className="flex min-h-0 flex-1 flex-col p-2 sm:p-3">
          <form
            className="flex flex-col gap-2 sm:flex-row"
            onSubmit={(e) => {
              e.preventDefault()
              go()
            }}
          >
            <input id="logs-q" data-primary-input value={q} onChange={(e) => setQ(e.target.value)} className="min-h-[40px] min-w-0 flex-1 rounded-lg bg-[#0d0f14] px-3 font-mono text-[13px] text-[#9be7ff] outline-none ring-1 ring-white/10 focus:ring-[#FF5C7A]" autoCapitalize="off" autoCorrect="off" spellCheck={false} aria-label="Search query" />
            <div className="flex gap-2">
              <select id="logs-range" value={range} onChange={(e) => setRange(Number(e.target.value))} className="min-h-[40px] rounded-lg bg-[#0d0f14] px-2 ring-1 ring-white/10" aria-label="Time range">
                <option value={1}>Last 1 hour</option>
                <option value={4}>Last 4 hours</option>
                <option value={24}>Last 24 hours</option>
              </select>
              <button type="submit" className="min-h-[40px] flex-1 rounded-lg bg-[#FF5C7A] px-5 font-bold text-white sm:flex-none">
                {running ? 'Running…' : 'Run'}
              </button>
            </div>
          </form>
          <div className="no-scrollbar mt-2 flex gap-1.5 overflow-x-auto">
            {EXAMPLES.map((x) => (
              <button
                key={x}
                onClick={() => {
                  setQ(x)
                  go(x)
                }}
                className="shrink-0 rounded-full bg-white/5 px-2.5 py-1 font-mono text-[11px] text-[#aab0c4] hover:bg-white/10"
              >
                {x}
              </button>
            ))}
          </div>
          <div className="mt-2 min-h-0 flex-1 overflow-hidden rounded-lg bg-[#0d0f14] ring-1 ring-white/5">
            {!res && !running && <div className="p-6 text-center text-[#8b90a3]">Press Run to search 200,000 security events.</div>}
            {running && (
              <div className="p-4">
                <div className="skeleton h-3 w-1/2 rounded" />
                <div className="skeleton mt-3 h-24 rounded" />
              </div>
            )}
            {res && !running && res.kind === 'error' && <div className="p-4 text-[#ff9aa9]">{res.msg}</div>}
            {res && !running && res.kind !== 'error' && (
              <div className="flex h-full flex-col">
                <div className="flex shrink-0 items-center gap-2 border-b border-white/5 px-3 py-2 tabnum text-[#8b90a3]">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  <span>
                    <b className="text-white">{res.scanned.toLocaleString()}</b> events scanned in <b className="text-white">{res.ms.toFixed(2)} s</b>
                  </span>
                  {res.kind === 'table' && <span className="ml-auto">{res.rows.length.toLocaleString()} results</span>}
                </div>
                {res.kind === 'chart' ? (
                  <TimeChart series={res.series} />
                ) : (
                  <div
                    className="thin-scroll min-h-0 flex-1 overflow-auto"
                    ref={(el) => {
                      if (el) boxH.current = el.clientHeight
                    }}
                    onScroll={(e) => setScroll(e.currentTarget.scrollTop)}
                  >
                    <div style={{ height: (res.rows.length + 1) * ROW, position: 'relative', minWidth: res.cols.length > 3 ? 760 : undefined }}>
                      <div className="sticky top-0 z-10 flex bg-[#1a1d26] font-semibold text-[#aab0c4]" style={{ height: ROW }}>
                        {res.cols.map((c) => (
                          <div key={c} className="flex flex-1 items-center px-3">{c}</div>
                        ))}
                        {res.cols[1] === 'count' && <div className="flex flex-[2] items-center px-3" />}
                      </div>
                      {res.rows.slice(Math.max(0, Math.floor(scroll / ROW) - 4), Math.floor(scroll / ROW) + Math.ceil(boxH.current / ROW) + 6).map((row, i0) => {
                        const i = Math.max(0, Math.floor(scroll / ROW) - 4) + i0
                        const max = Number(res.rows[0][1]) || 1
                        return (
                          <div key={i} className="absolute left-0 right-0 flex border-b border-white/[.04] font-mono tabnum" style={{ top: (i + 1) * ROW, height: ROW }}>
                            {row.map((v, j) => (
                              <div key={j} className={'flex flex-1 items-center truncate px-3 ' + (v === 'failed' ? 'text-[#ff7a90]' : String(v).startsWith('203.0.113') || String(v).startsWith('198.51') || String(v).startsWith('192.0.2') ? 'text-[#ffb86b]' : '')}>
                                {v}
                              </div>
                            ))}
                            {res.cols[1] === 'count' && (
                              <div className="flex flex-[2] items-center px-3">
                                <div className="h-2 rounded bg-[#FF5C7A]" style={{ width: `${(Number(row[1]) / max) * 100}%` }} />
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
      {tab === 'dash' && (
        <div className="thin-scroll grid min-h-0 flex-1 gap-3 overflow-auto p-3 md:grid-cols-2">
          <div className="rounded-lg bg-[#0d0f14] p-3 ring-1 ring-white/5">
            <div className="font-semibold text-white">Failed logins by source, last 24 h</div>
            {failedBy.kind === 'table' &&
              failedBy.rows.slice(0, 6).map(([ip, n]) => (
                <div key={ip} className="mt-2 flex items-center gap-2 font-mono tabnum">
                  <span className="w-28 shrink-0 truncate">{ip}</span>
                  <div className="h-3 flex-1 rounded bg-white/5">
                    <div className="h-3 rounded bg-[#FF5C7A]" style={{ width: `${(Number(n) / Number(failedBy.rows[0][1])) * 100}%` }} />
                  </div>
                  <span className="w-10 text-right">{n}</span>
                </div>
              ))}
          </div>
          <div className="rounded-lg bg-[#0d0f14] p-3 ring-1 ring-white/5">
            <div className="font-semibold text-white">Events over time</div>
            {(() => {
              const r = runQuery('index=* | timechart count', 24)
              return r.kind === 'chart' ? <TimeChart series={r.series} small /> : null
            })()}
          </div>
          {!mobile && (
            <div className="rounded-lg bg-[#0d0f14] p-3 ring-1 ring-white/5 md:col-span-2">
              <div className="font-semibold text-white">Saved searches</div>
              {EXAMPLES.map((x) => (
                <div key={x} className="mt-2 font-mono text-[#9be7ff]">{x}</div>
              ))}
            </div>
          )}
        </div>
      )}
      {tab === 'alerts' && (
        <div className="thin-scroll min-h-0 flex-1 overflow-auto p-3">
          {alerts.map((a, i) => (
            <div key={a.t + i} className={'mb-2 flex gap-3 rounded-lg bg-[#0d0f14] p-3 ring-1 ring-white/5 ' + (i === 0 ? 'anim-rise' : '')}>
              <span className={'mt-1 h-2.5 w-2.5 shrink-0 rounded-full ' + (a.a.startsWith('Brute') ? 'bg-[#FF5C7A]' : 'bg-amber-400')} />
              <div>
                <div className="font-semibold text-white">{a.a}</div>
                <div className="font-mono text-[11px] text-[#8b90a3]">{a.t} UTC · auto-triage on</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function TimeChart({ series, small }: { series: number[]; small?: boolean }) {
  const max = Math.max(...series)
  const w = 600
  const h = small ? 140 : 220
  const pts = series.map((v, i) => [30 + (i / (series.length - 1)) * (w - 40), h - 24 - (v / max) * (h - 44)])
  return (
    <div className="min-h-0 flex-1 p-3">
      <svg viewBox={`0 0 ${w} ${h}`} className="h-full w-full" preserveAspectRatio="none">
        {[0, 0.5, 1].map((g) => (
          <line key={g} x1="30" x2={w - 10} y1={h - 24 - g * (h - 44)} y2={h - 24 - g * (h - 44)} stroke="rgba(255,255,255,.07)" />
        ))}
        <path d={`M${pts.map((p) => p.join(',')).join(' L')} L${w - 10},${h - 24} L30,${h - 24} Z`} fill="rgba(255,92,122,.18)" />
        <path d={`M${pts.map((p) => p.join(',')).join(' L')}`} fill="none" stroke="#FF5C7A" strokeWidth="2" />
        <text x="30" y={h - 6} fontSize="11" fill="#8b90a3">24 h ago</text>
        <text x={w - 10} y={h - 6} fontSize="11" fill="#8b90a3" textAnchor="end">now</text>
        <text x="26" y="20" fontSize="11" fill="#8b90a3" textAnchor="end">{max.toLocaleString()}</text>
      </svg>
    </div>
  )
}
