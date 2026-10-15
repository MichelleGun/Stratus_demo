import { useStore } from '../lib/store'
import { APPS, INDUSTRIES, type AppId } from '../lib/catalog'
import { Icon } from './Icon'

export function Director() {
  const { director, setDirector, set, s, go, route, startLaunch, reset } = useStore()
  if (!director.open) return null
  const inSession = route === 'session'
  const openApp = (id: AppId) => {
    if (inSession) setDirector({ openApp: { id, n: (director.openApp?.n ?? 0) + 1 } })
    else startLaunch({ apps: [id], plan: 'pro', quick: true })
  }
  const B = ({ on, children, onClick }: { on?: boolean; children: React.ReactNode; onClick: () => void }) => (
    <button onClick={onClick} className={'min-h-[36px] rounded-lg px-2.5 text-xs font-semibold ' + (on ? 'bg-white text-ink-900' : 'bg-white/10 text-white hover:bg-white/15')}>
      {children}
    </button>
  )
  return (
    <div className="fixed inset-x-2 z-[1000] max-h-[80%] overflow-y-auto rounded-2xl bg-black/90 p-4 text-white shadow-2xl ring-1 ring-white/15 backdrop-blur sm:left-auto sm:right-3 sm:w-[380px]" style={{ top: 'calc(env(safe-area-inset-top,0px) + 8px)' }}>
      <div className="mb-3 flex items-center justify-between">
        <div>
          <div className="text-sm font-bold">Director panel</div>
          <div className="text-[11px] text-white/50">Shift + D or tap the logo 5 times</div>
        </div>
        <button onClick={() => setDirector({ open: false })} className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-white/10" aria-label="Close director">
          <Icon name="x" />
        </button>
      </div>
      <div className="space-y-3">
        <div>
          <div className="mb-1 text-[10px] font-bold uppercase tracking-widest text-white/50">Switch industry</div>
          <div className="flex flex-wrap gap-1">
            {INDUSTRIES.map((i) => (
              <B key={i.id} on={s.industry === i.id} onClick={() => set({ industry: i.id, plan: i.plan })}>
                {i.name}
              </B>
            ))}
          </div>
        </div>
        <div>
          <div className="mb-1 text-[10px] font-bold uppercase tracking-widest text-white/50">Open app</div>
          <div className="flex flex-wrap gap-1">
            {APPS.map((a) => (
              <B key={a.id} onClick={() => openApp(a.id)}>
                {a.name}
              </B>
            ))}
          </div>
        </div>
        <div>
          <div className="mb-1 text-[10px] font-bold uppercase tracking-widest text-white/50">Time speed</div>
          <div className="flex gap-1">
            {([1, 10, 60] as const).map((x) => (
              <B key={x} on={director.speed === x} onClick={() => setDirector({ speed: x })}>
                {x}x
              </B>
            ))}
          </div>
        </div>
        <div>
          <div className="mb-1 text-[10px] font-bold uppercase tracking-widest text-white/50">Shortcuts</div>
          <div className="flex flex-wrap gap-1">
            <B onClick={() => (inSession ? setDirector({ limitNow: director.limitNow + 1 }) : startLaunch({ apps: ['spreadsheet'], plan: s.plan, quick: true }))}>Trigger limit reached</B>
            <B
              onClick={() => {
                set({ saved: s.saved ?? { apps: ['vscode', 'spreadsheet'], active: 'spreadsheet', seconds: 5400, cost: 5.25, plan: 'pro', savedAt: Date.now() } })
                go('home')
              }}
            >
              Jump to Welcome back
            </B>
            <B onClick={() => startLaunch({ apps: ['studio3d'], plan: 'pro' })}>Show launch sequence</B>
          </div>
        </div>
        <div>
          <div className="mb-1 text-[10px] font-bold uppercase tracking-widest text-white/50">Toggles</div>
          <div className="flex flex-wrap gap-1">
            <B on={director.hud} onClick={() => setDirector({ hud: !director.hud })}>HUD</B>
            <B on={s.sound} onClick={() => set({ sound: !s.sound })}>Sound</B>
            <B on={director.forceLowBw} onClick={() => setDirector({ forceLowBw: !director.forceLowBw })}>Low bandwidth</B>
            <B on={director.clean} onClick={() => setDirector({ clean: !director.clean })}>Clean mode</B>
          </div>
        </div>
        <button onClick={reset} className="min-h-[40px] w-full rounded-lg bg-rose-500/80 text-xs font-bold">
          Reset demo to fresh state
        </button>
      </div>
    </div>
  )
}
