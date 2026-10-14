import { useStore } from '../lib/store'
import { CloudMark } from '../components/Logo'

export function FilmIcon() {
  const { startLaunch, s } = useStore()
  return (
    <div className="flex h-full items-center justify-center" style={{ background: 'linear-gradient(180deg, #8C9099, #6E727B)' }}>
      <button onClick={() => startLaunch({ apps: ['spreadsheet'], plan: s.plan })} className="flex flex-col items-center gap-3 rounded-2xl p-4 transition active:scale-95" aria-label="Open Stratus">
        <span className="anim-float">
          <CloudMark size={88} glow />
        </span>
        <span className="rounded px-2 text-sm font-semibold text-white" style={{ textShadow: '0 1px 3px rgba(0,0,0,.5)' }}>
          Stratus
        </span>
      </button>
    </div>
  )
}
