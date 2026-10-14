export function CloudMark({ size = 32, glow = false }: { size?: number; glow?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true" style={glow ? { filter: 'drop-shadow(0 0 18px rgba(124,107,245,.7))' } : undefined}>
      <defs>
        <linearGradient id="sg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#4CC3FF" />
          <stop offset="1" stopColor="#8E7CFF" />
        </linearGradient>
      </defs>
      <rect x="1" y="1" width="46" height="46" rx="13" fill="url(#sg)" />
      <path d="M15.5 33.5h17.2a7.3 7.3 0 0 0 .9-14.55A9.5 9.5 0 0 0 15.4 21.2a6.2 6.2 0 0 0 .1 12.3z" fill="#fff" />
      <path d="M20 28.5h9" stroke="#7C6BF5" strokeWidth="2.4" strokeLinecap="round" opacity=".55" />
    </svg>
  )
}

export function Logo({ size = 28, onTap }: { size?: number; onTap?: () => void }) {
  return (
    <button type="button" onClick={onTap} className="flex items-center gap-2 select-none" aria-label="Stratus">
      <CloudMark size={size} />
      <span className="font-bold tracking-tight text-white" style={{ fontSize: size * 0.68 }}>
        Stratus
      </span>
    </button>
  )
}
