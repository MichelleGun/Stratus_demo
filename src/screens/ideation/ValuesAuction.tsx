import { useReveal } from './shared'
import { VALUES, PLACEHOLDER, TEAM_LABEL } from '../../data/values'

export function ValuesAuction() {
  const total = VALUES.reduce((a, v) => a + v.points, 0)
  const max = Math.max(...VALUES.map((v) => v.points), 1)
  const r = useReveal()
  const rows = [...VALUES].sort((a, b) => b.points - a.points)
  return (
    <div className="card overflow-hidden">
      <div className="flex flex-wrap items-start gap-3 border-b border-white/5 p-5">
        <div className="min-w-0 flex-1">
          <div className="label">The values auction</div>
          <p className="mt-1 text-lg font-bold text-white">{TEAM_LABEL}: 100 points across nine values</p>
          <p className="mt-1 text-sm text-ink-300">You can’t buy everything, so what a team spends points on shows what it will not trade away.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="tabnum rounded-full bg-white/10 px-3 py-1 text-sm font-bold text-white">{total} / 100</span>
        </div>
      </div>
      {PLACEHOLDER && (
        <div className="border-b border-amber-300/30 bg-amber-300/10 px-5 py-2.5 text-[13px] font-medium text-amber-200">
          Placeholder numbers. Our real allocation goes here.
        </div>
      )}
      <ul ref={r.ref as never} className="grid gap-3 p-5">
        {rows.map((v, i) => (
          <li key={v.value} className="grid grid-cols-[minmax(0,9.5rem)_1fr_2.25rem] items-center gap-3 sm:grid-cols-[11rem_1fr_2.5rem]">
            <span className="text-sm font-medium text-ink-100">{v.value}</span>
            <span className="h-3 overflow-hidden rounded-full bg-white/[.07]" role="img" aria-label={`${v.points} points`}>
              <span className="block h-full rounded-full bg-gradient-to-r from-sky-400 to-violet-400" style={{ width: r.on ? `${(v.points / max) * 100}%` : '0%', transition: `width .9s cubic-bezier(.2,.7,.2,1) ${i * 90}ms` }} />
            </span>
            <span className="tabnum text-right text-sm font-bold text-white">{v.points}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
