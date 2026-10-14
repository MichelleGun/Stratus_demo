import type { AppId } from '../lib/catalog'
import { appById } from '../lib/catalog'

const GLYPH: Record<AppId, JSX.Element> = {
  vscode: <path d="M17 7 9 15l8 8M27 7l8 8-8 8M23 5l-4 22" stroke="#fff" strokeWidth="2.6" fill="none" strokeLinecap="round" strokeLinejoin="round" transform="translate(-2 1)" />,
  spreadsheet: (
    <g stroke="#fff" strokeWidth="2.2" fill="none">
      <rect x="8" y="8" width="24" height="24" rx="3" />
      <path d="M8 16h24M8 24h24M17 8v24" />
    </g>
  ),
  studio3d: (
    <g stroke="#fff" strokeWidth="2.2" fill="none" strokeLinejoin="round">
      <path d="M20 6 32 13v14l-12 7-12-7V13z" />
      <path d="M8 13l12 7 12-7M20 20v14" />
    </g>
  ),
  logs: (
    <g stroke="#fff" strokeWidth="2.4" fill="none" strokeLinecap="round">
      <circle cx="18" cy="18" r="8" />
      <path d="m24 24 8 8M14 18h8" />
    </g>
  ),
  bi: (
    <g fill="#fff">
      <rect x="9" y="20" width="5" height="12" rx="1.5" />
      <rect x="17.5" y="13" width="5" height="19" rx="1.5" />
      <rect x="26" y="8" width="5" height="24" rx="1.5" />
    </g>
  ),
  game: (
    <g fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round">
      <path d="M12 14h16a6 6 0 0 1 6 6l1 6a3 3 0 0 1-5 2l-3-3H13l-3 3a3 3 0 0 1-5-2l1-6a6 6 0 0 1 6-6z" />
      <path d="M13 18v5M10.5 20.5h5" />
      <circle cx="26" cy="19" r="1" fill="#fff" />
      <circle cx="29" cy="22" r="1" fill="#fff" />
    </g>
  ),
  notebook: (
    <g fill="none" stroke="#fff" strokeWidth="2.2">
      <ellipse cx="20" cy="20" rx="13" ry="5" transform="rotate(-25 20 20)" />
      <ellipse cx="20" cy="20" rx="13" ry="5" transform="rotate(25 20 20)" />
      <circle cx="20" cy="20" r="2.5" fill="#fff" />
    </g>
  ),
  qualitative: (
    <g fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 10h24v15H19l-6 5v-5H8z" />
      <path d="M13 16h14M13 20h9" />
    </g>
  ),
  cad: (
    <g fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 32 20 8l12 24z" />
      <path d="M14 22h12M8 32h24" />
      <circle cx="20" cy="8" r="2" fill="#fff" />
    </g>
  ),
  arch: (
    <g fill="none" stroke="#fff" strokeWidth="2.2" strokeLinejoin="round">
      <path d="M7 33V17l9-6v22M16 33V9l17 6v18M5 33h30" />
      <path d="M21 17h2M27 18h2M21 23h2M27 24h2M21 29h2M27 29h2" strokeLinecap="round" />
    </g>
  ),
  video: (
    <g fill="none" stroke="#fff" strokeWidth="2.2" strokeLinejoin="round">
      <rect x="7" y="11" width="19" height="18" rx="3" />
      <path d="m26 17 7-4v14l-7-4z" />
    </g>
  ),
}

export function AppIcon({ id, size = 44, className = '' }: { id: AppId; size?: number; className?: string }) {
  const app = appById(id)!
  return (
    <span
      className={'inline-flex shrink-0 items-center justify-center ' + className}
      style={{ width: size, height: size, borderRadius: size * 0.26, background: `linear-gradient(140deg, ${app.color[0]}, ${app.color[1]})`, boxShadow: `0 6px 16px -8px ${app.color[1]}` }}
    >
      <svg viewBox="0 0 40 40" width={size * 0.66} height={size * 0.66} aria-hidden="true">
        {GLYPH[id]}
      </svg>
    </span>
  )
}
