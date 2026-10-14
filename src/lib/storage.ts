// localStorage wrapped in try/catch so private browsing and blocked storage still work.
const memory = new Map<string, string>()

export function load<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key)
    if (raw != null) return JSON.parse(raw) as T
  } catch {
    const raw = memory.get(key)
    if (raw != null) return JSON.parse(raw) as T
  }
  return fallback
}

export function save(key: string, value: unknown) {
  const raw = JSON.stringify(value)
  memory.set(key, raw)
  try {
    window.localStorage.setItem(key, raw)
  } catch {
    /* storage blocked, memory copy is enough for this visit */
  }
}

export function clear(prefix: string) {
  for (const k of [...memory.keys()]) if (k.startsWith(prefix)) memory.delete(k)
  try {
    const keys: string[] = []
    for (let i = 0; i < window.localStorage.length; i++) {
      const k = window.localStorage.key(i)
      if (k && k.startsWith(prefix)) keys.push(k)
    }
    keys.forEach((k) => window.localStorage.removeItem(k))
  } catch {
    /* ignore */
  }
}
