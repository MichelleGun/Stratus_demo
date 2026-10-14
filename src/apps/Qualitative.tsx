import { useEffect, useMemo, useState } from 'react'
import type { AppProps } from '../screens/Session'
import data from '../data/transcript.json'
import { load, save } from '../lib/storage'

interface Sentence {
  key: string
  turn: number
  who: string
  text: string
}

const STOP = new Set('the a an and or but i i\'m i\'ve i\'ll it it\'s is was to of for in on at my me just like that this there\'s they be so do don\'t what when you your with are have has been kind bit which go up out every two my about tell think would could thought until'.split(' '))

export default function Qualitative({ autoplay, mobile }: AppProps) {
  const sentences = useMemo<Sentence[]>(() => {
    const out: Sentence[] = []
    data.turns.forEach((t, ti) => {
      const parts = t.text.match(/[^.!?]+[.!?]?/g) || [t.text]
      parts.forEach((p, pi) => out.push({ key: `${ti}.${pi}`, turn: ti, who: t.who, text: p.trim() }))
    })
    return out
  }, [])
  const [applied, setApplied] = useState<Record<string, string[]>>(() =>
    load('stratus.app.qual', { '1.2': ['frustration'], '3.0': ['access'], '3.1': ['workaround'], '6.0': ['cost'], '7.0': ['mobile', 'workaround'] }),
  )
  const [sel, setSel] = useState<string[]>([])
  const [tab, setTab] = useState<'code' | 'freq' | 'cloud' | 'says'>('code')
  const [panel, setPanel] = useState(!mobile)
  useEffect(() => save('stratus.app.qual', applied), [applied])

  const apply = (code: string, keys = sel) => {
    if (!keys.length) return
    setApplied((a) => {
      const n = { ...a }
      for (const k of keys) n[k] = [...new Set([...(n[k] || []), code])]
      return n
    })
    setSel([])
  }
  useEffect(() => {
    if (!autoplay) return
    const t1 = window.setTimeout(() => setSel(['8.1']), 500)
    const t2 = window.setTimeout(() => apply('frustration', ['8.1']), 1300)
    const t3 = window.setTimeout(() => setTab('says'), 2200)
    return () => [t1, t2, t3].forEach(window.clearTimeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoplay])

  // Map a native text selection to sentences.
  useEffect(() => {
    const on = () => {
      const s = window.getSelection()
      if (!s || s.isCollapsed) return
      const keys = sentences.filter((x) => {
        const el = document.querySelector(`[data-sent="${x.key}"]`)
        return el && s.containsNode(el, true)
      })
      if (keys.length) setSel(keys.map((k) => k.key))
    }
    document.addEventListener('selectionchange', on)
    return () => document.removeEventListener('selectionchange', on)
  }, [sentences])

  const freq = data.codes.map((c) => ({ ...c, n: Object.values(applied).filter((v) => v.includes(c.id)).length }))
  const fmax = Math.max(1, ...freq.map((f) => f.n))
  const words = useMemo(() => {
    const m = new Map<string, number>()
    data.turns.filter((t) => t.who !== 'Interviewer').forEach((t) =>
      t.text
        .toLowerCase()
        .replace(/[^a-z' ]/g, ' ')
        .split(/\s+/)
        .filter((w) => w.length > 3 && !STOP.has(w))
        .forEach((w) => m.set(w, (m.get(w) || 0) + 1)),
    )
    return [...m.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).slice(0, 28)
  }, [])
  const codeColor = (id: string) => data.codes.find((c) => c.id === id)?.color ?? '#999'

  return (
    <div className="flex h-full flex-col bg-[#f7f6f2] text-[13px] text-[#222]">
      <div className="no-scrollbar flex shrink-0 items-center gap-1 overflow-x-auto border-b border-[#e3e0d6] bg-white px-2">
        {(
          [
            ['code', 'Coding'],
            ['freq', 'Frequency'],
            ['cloud', 'Word cloud'],
            ['says', 'Says versus does'],
          ] as const
        ).map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)} className={'min-h-[38px] shrink-0 px-3 font-semibold ' + (tab === k ? 'border-b-2 border-[#138A80] text-[#138A80]' : 'text-[#777]')}>
            {l}
          </button>
        ))}
        {mobile && tab === 'code' && (
          <button onClick={() => setPanel(!panel)} className="ml-auto min-h-[32px] shrink-0 rounded bg-[#138A80] px-3 font-semibold text-white">
            Codes
          </button>
        )}
      </div>
      {tab === 'code' && (
        <div className="relative flex min-h-0 flex-1">
          <div className="thin-scroll min-w-0 flex-1 overflow-auto p-3 sm:p-4">
            <div className="text-[15px] font-bold">{data.title}</div>
            <div className="mb-3 text-[11px] text-[#8a8577]">{data.note}</div>
            {data.turns.map((t, ti) => (
              <p key={ti} className="mb-2 leading-relaxed">
                <span className={'mr-1 font-bold ' + (t.who === 'Interviewer' ? 'text-[#999]' : 'text-[#138A80]')}>{t.who}:</span>
                {sentences
                  .filter((s) => s.turn === ti)
                  .map((s) => {
                    const codes = applied[s.key] || []
                    const on = sel.includes(s.key)
                    return (
                      <span
                        key={s.key}
                        data-sent={s.key}
                        onClick={() => setSel(on ? sel.filter((k) => k !== s.key) : [...sel, s.key])}
                        className={'cursor-pointer rounded px-0.5 transition ' + (on ? 'bg-[#138A80]/20 outline outline-2 outline-[#138A80]' : '')}
                        style={codes.length && !on ? { background: codes[0] ? codeColor(codes[0]) + '40' : undefined, boxShadow: `inset 0 -2px 0 ${codeColor(codes[0])}` } : undefined}
                      >
                        {s.text}{' '}
                      </span>
                    )
                  })}
              </p>
            ))}
          </div>
          {panel && (
            <div className={'w-52 shrink-0 border-l border-[#e3e0d6] bg-white p-3 ' + (mobile ? 'absolute inset-y-0 right-0 z-10 shadow-2xl' : '')}>
              <div className="mb-1 text-[11px] font-bold uppercase tracking-wide text-[#8a8577]">Codebook</div>
              <div className="mb-2 text-[11px] text-[#8a8577]">{sel.length ? `${sel.length} selected. Tap a code to apply.` : 'Tap or highlight text first.'}</div>
              {freq.map((c) => (
                <button
                  key={c.id}
                  onClick={() => {
                    apply(c.id)
                    if (mobile) setPanel(false)
                  }}
                  className="mb-1 flex min-h-[38px] w-full items-center gap-2 rounded-lg px-2 text-left hover:bg-[#f2f0ea]"
                >
                  <span className="h-3 w-3 shrink-0 rounded-sm" style={{ background: c.color }} />
                  <span className="flex-1">{c.name}</span>
                  <span className="tabnum text-[#8a8577]">{c.n}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
      {tab === 'freq' && (
        <div className="p-4">
          <div className="mb-3 font-bold">Code frequency</div>
          {freq
            .slice()
            .sort((a, b) => b.n - a.n)
            .map((c) => (
              <div key={c.id} className="mb-2 flex items-center gap-2">
                <span className="w-28 shrink-0">{c.name}</span>
                <div className="h-5 flex-1 rounded bg-[#ebe8df]">
                  <div className="h-5 rounded transition-all" style={{ width: `${(c.n / fmax) * 100}%`, background: c.color }} />
                </div>
                <span className="w-6 text-right tabnum font-semibold">{c.n}</span>
              </div>
            ))}
        </div>
      )}
      {tab === 'cloud' && (
        <div className="flex flex-wrap content-center items-center justify-center gap-x-3 gap-y-1 p-6">
          {words.map(([w, n], i) => (
            <span key={w} style={{ fontSize: 12 + n * 7, color: data.codes[i % data.codes.length].color, fontWeight: n > 1 ? 800 : 600, filter: 'brightness(.8)' }}>
              {w}
            </span>
          ))}
        </div>
      )}
      {tab === 'says' && (
        <div className="thin-scroll min-h-0 flex-1 overflow-auto p-4">
          <div className="mb-3 font-bold">Says versus does</div>
          <div className="grid grid-cols-2 gap-2 text-[12px] font-bold uppercase tracking-wide text-[#8a8577]">
            <div>What they say</div>
            <div>What we observed</div>
          </div>
          {data.observed.map((o, i) => (
            <div key={i} className="anim-rise mt-2 grid grid-cols-2 gap-2" style={{ animationDelay: `${i * 0.12}s` }}>
              <div className="rounded-lg bg-white p-3 shadow-sm ring-1 ring-black/5">"{o.says}"</div>
              <div className="rounded-lg bg-[#138A80] p-3 font-semibold text-white">{o.does}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
