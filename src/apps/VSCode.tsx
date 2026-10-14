import { useEffect, useRef, useState } from 'react'
import type { AppProps } from '../screens/Session'
import { load, save } from '../lib/storage'

const FILES: Record<string, string> = {
  'src/app.py': `"""Stratus demo: train a small model on the student survey."""
import numpy as np
from model import TinyNet

SEED = 67
rng = np.random.default_rng(SEED)


def load_data(n: int = 50_000):
    # Hours on old laptops vs. grade outcome (synthetic)
    x = rng.normal(size=(n, 8))
    y = (x[:, 0] * 0.8 + x[:, 3] * 0.4 > 0).astype(int)
    return x, y


def main():
    x, y = load_data()
    net = TinyNet(inputs=8, hidden=64)
    for epoch in range(1, 6):
        loss = net.fit(x, y, lr=0.01)
        print(f"epoch {epoch}/5  loss={loss:.3f}")
    print(f"Accuracy: {net.score(x, y):.2f}")


if __name__ == "__main__":
    main()
`,
  'src/model.py': `import numpy as np


class TinyNet:
    def __init__(self, inputs: int, hidden: int):
        self.w1 = np.random.randn(inputs, hidden) * 0.1
        self.w2 = np.random.randn(hidden, 1) * 0.1

    def forward(self, x):
        self.h = np.maximum(0, x @ self.w1)
        return 1 / (1 + np.exp(-(self.h @ self.w2)))

    def fit(self, x, y, lr=0.01):
        p = self.forward(x).ravel()
        grad = (p - y)[:, None] / len(y)
        self.w2 -= lr * self.h.T @ grad
        return float(np.mean((p - y) ** 2))

    def score(self, x, y):
        return float(np.mean((self.forward(x).ravel() > 0.5) == y))
`,
  'README.md': `# stratus-demo

A tiny Python project that runs on a Stratus cloud machine.

## Run it

    python src/app.py

Works the same on an old laptop, a Chromebook or a phone,
because the computer doing the work is in the cloud.
`,
  'requirements.txt': `numpy==2.1.2
pandas==2.2.3
matplotlib==3.9.2
`,
}

const KW = /\b(def|class|import|from|return|for|in|if|else|elif|while|print|as|with|self|None|True|False|range|float|int|lambda|pass)\b/
function highlight(line: string, md: boolean): JSX.Element[] {
  if (md) {
    if (line.startsWith('#')) return [<span key="h" style={{ color: '#569CD6', fontWeight: 700 }}>{line}</span>]
    if (line.startsWith('    ')) return [<span key="c" style={{ color: '#CE9178' }}>{line}</span>]
    return [<span key="t">{line}</span>]
  }
  const out: JSX.Element[] = []
  const re = /("""[^]*?"""|"[^"]*"|'[^']*'|f"[^"]*"|#.*$|\b\d[\d_.]*\b|\b[A-Za-z_]\w*\b|\s+|.)/g
  let m: RegExpExecArray | null
  let k = 0
  while ((m = re.exec(line))) {
    const t = m[0]
    let c: string | undefined
    if (t.startsWith('#')) c = '#6A9955'
    else if (/^f?["']/.test(t)) c = '#CE9178'
    else if (/^\d/.test(t)) c = '#B5CEA8'
    else if (KW.test(t) && t.match(KW)![0] === t) c = t === 'self' ? '#9CDCFE' : '#C586C0'
    else if (/^[A-Z]\w*$/.test(t)) c = '#4EC9B0'
    else if (/^[a-z_]\w*$/.test(t) && line.slice(m.index + t.length).startsWith('(')) c = '#DCDCAA'
    out.push(
      <span key={k++} style={c ? { color: c } : undefined}>
        {t}
      </span>,
    )
  }
  return out
}

const GPU_TABLE = `+-----------------------------------------------------------+
| STRATUS-SMI 550.54        Driver: 550.54    CUDA: 12.4    |
|-------------------------------+---------------------------|
| GPU  Name                     | Memory-Usage   GPU-Util   |
|   0  RTX-class Cloud GPU 24GB |  1,204MiB / 24,576MiB  7% |
+-------------------------------+---------------------------+
| Processes: python (PID 4021)  1,180MiB                    |
+-----------------------------------------------------------+`

export default function VSCode({ mobile, autoplay }: AppProps) {
  const [files, setFiles] = useState<Record<string, string>>(() => ({ ...FILES, ...load('stratus.app.vscode.files', {}) }))
  const [tabs, setTabs] = useState<string[]>(['src/app.py', 'src/model.py'])
  const [cur, setCur] = useState('src/app.py')
  const [explorer, setExplorer] = useState(!mobile)
  const [term, setTerm] = useState<string[]>(() => load('stratus.app.vscode.term', ['Stratus Pro terminal. Type help to see commands.']))
  const [cmd, setCmd] = useState('')
  const [pos, setPos] = useState({ ln: 1, col: 1 })
  const [busy, setBusy] = useState(false)
  const ta = useRef<HTMLTextAreaElement>(null)
  const pre = useRef<HTMLDivElement>(null)
  const termEnd = useRef<HTMLDivElement>(null)
  const code = files[cur] ?? ''
  const lines = code.split('\n')
  const md = cur.endsWith('.md') || cur.endsWith('.txt')

  useEffect(() => save('stratus.app.vscode.files', files), [files])
  useEffect(() => {
    save('stratus.app.vscode.term', term.slice(-80))
    termEnd.current?.scrollIntoView({ block: 'end' })
  }, [term])

  const print = (...l: string[]) => setTerm((t) => [...t, ...l])
  const run = (raw: string) => {
    const c = raw.trim()
    print(`alex@stratus:~/stratus-demo$ ${c}`)
    if (!c) return
    if (c === 'clear') return setTerm([])
    if (c === 'help') return print('Commands: ls, pwd, python src/app.py, nvidia-smi, npm run dev, clear')
    if (c === 'ls') return print('README.md  requirements.txt  src/')
    if (c === 'pwd') return print('/home/alex/stratus-demo')
    if (c === 'nvidia-smi' || c === 'stratus-smi') return print(...GPU_TABLE.split('\n'))
    if (c === 'npm run dev') return print('', '  VITE v5.4.10  ready in 212 ms', '', '  ➜  Local:   http://localhost:5173/', '  ➜  Network: https://alex.sydney.stratus.app/')
    if (c.startsWith('python')) {
      setBusy(true)
      const steps = [
        'Loading 50,000 rows on 8 vCPU...',
        ...[0.412, 0.297, 0.214, 0.163, 0.131].map((l, i) => `epoch ${i + 1}/5  [${'#'.repeat((i + 1) * 4).padEnd(20, '.')}]  loss=${l.toFixed(3)}`),
        'Accuracy: 0.94',
        'Done in 3.1 s on Stratus Pro (Sydney)',
      ]
      steps.forEach((s, i) =>
        window.setTimeout(() => {
          print(s)
          if (i === steps.length - 1) setBusy(false)
        }, 380 * (i + 1)),
      )
      return
    }
    print(`${c.split(' ')[0]}: not on this demo machine yet. Try help.`)
  }

  useEffect(() => {
    if (!autoplay) return
    const t = window.setTimeout(() => run('python src/app.py'), 900)
    return () => window.clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoplay])

  const updatePos = () => {
    const el = ta.current
    if (!el) return
    const before = el.value.slice(0, el.selectionStart)
    const ls = before.split('\n')
    setPos({ ln: ls.length, col: ls[ls.length - 1].length + 1 })
  }
  const openFile = (f: string) => {
    if (!tabs.includes(f)) setTabs([...tabs, f])
    setCur(f)
    if (mobile) setExplorer(false)
  }
  const tree = ['README.md', 'requirements.txt']
  return (
    <div className="flex h-full flex-col bg-[#1e1e1e] font-mono text-[13px] text-[#d4d4d4]">
      <div className="flex min-h-0 flex-1">
        <div className="flex w-11 shrink-0 flex-col items-center gap-1 bg-[#333333] py-2">
          {[
            ['M4 4h7v16H4zM13 4h7v7h-7z', () => setExplorer(!explorer), explorer],
            ['M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM21 21l-4.3-4.3', () => {}, false],
            ['M6 3v12M18 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM6 21a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM18 9a9 9 0 0 1-9 9', () => {}, false],
            ['M7 4v16l13-8z', () => run('python src/app.py'), false],
          ].map(([d, fn, on], i) => (
            <button key={i} onClick={fn as () => void} className={'flex h-10 w-10 items-center justify-center ' + (on ? 'text-white border-l-2 border-white' : 'text-[#858585] hover:text-white')} aria-label={['Explorer', 'Search', 'Source control', 'Run'][i]}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                <path d={d as string} />
              </svg>
            </button>
          ))}
        </div>
        {explorer && (
          <div className={'flex w-52 shrink-0 flex-col bg-[#252526] font-sans text-[13px] ' + (mobile ? 'absolute inset-y-0 left-11 z-10 shadow-2xl' : '')}>
            <div className="px-4 py-2 text-[11px] uppercase tracking-wider text-[#bbbbbb]">Explorer</div>
            <div className="px-2 text-[12px] font-bold uppercase text-[#cccccc]">▾ stratus-demo</div>
            <div className="mt-1">
              <div className="px-5 py-1 text-[#cccccc]">▾ src</div>
              {['src/app.py', 'src/model.py'].map((f) => (
                <button key={f} onClick={() => openFile(f)} className={'flex min-h-[30px] w-full items-center gap-2 px-9 text-left ' + (cur === f ? 'bg-[#37373d] text-white' : 'text-[#cccccc] hover:bg-[#2a2d2e]')}>
                  <span className="text-[#3776AB]">●</span>
                  {f.split('/')[1]}
                </button>
              ))}
              {tree.map((f) => (
                <button key={f} onClick={() => openFile(f)} className={'flex min-h-[30px] w-full items-center gap-2 px-5 text-left ' + (cur === f ? 'bg-[#37373d] text-white' : 'text-[#cccccc] hover:bg-[#2a2d2e]')}>
                  <span className={f.endsWith('.md') ? 'text-[#519aba]' : 'text-[#c5c5c5]'}>{f.endsWith('.md') ? 'ⓘ' : '≡'}</span>
                  {f}
                </button>
              ))}
            </div>
          </div>
        )}
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="no-scrollbar flex h-9 shrink-0 overflow-x-auto bg-[#252526]">
            {tabs.map((t) => (
              <button key={t} onClick={() => setCur(t)} className={'flex shrink-0 items-center gap-2 border-r border-[#1e1e1e] px-3 font-sans text-[13px] ' + (cur === t ? 'bg-[#1e1e1e] text-white' : 'bg-[#2d2d2d] text-[#969696]')}>
                {t.split('/').pop()}
                <span
                  role="button"
                  className="text-[#858585] hover:text-white"
                  onClick={(e) => {
                    e.stopPropagation()
                    const next = tabs.filter((x) => x !== t)
                    if (!next.length) return
                    setTabs(next)
                    if (cur === t) setCur(next[0])
                  }}
                >
                  ×
                </span>
              </button>
            ))}
          </div>
          <div className="truncate px-4 py-1 font-sans text-[12px] text-[#a9a9a9]">stratus-demo › {cur.split('/').join(' › ')}</div>
          <div className="relative min-h-0 flex-1">
            <div className="absolute inset-0 flex overflow-hidden">
              <div ref={pre} className="relative min-w-0 flex-1 overflow-auto thin-scroll">
                <div className="relative inline-block min-w-full" style={{ minHeight: '100%' }}>
                  <pre className="pointer-events-none m-0 whitespace-pre py-1 leading-[20px]" aria-hidden="true">
                    {lines.map((l, i) => (
                      <div key={i} className={'flex ' + (i + 1 === pos.ln ? 'bg-[#2a2d2e]' : '')}>
                        <span className="inline-block w-12 shrink-0 select-none pr-4 text-right text-[#858585]">{i + 1}</span>
                        <span>{highlight(l, md)}</span>
                      </div>
                    ))}
                  </pre>
                  <textarea
                    ref={ta}
                    data-primary-input
                    spellCheck={false}
                    wrap="off"
                    autoCapitalize="off"
                    autoCorrect="off"
                    value={code}
                    onChange={(e) => setFiles({ ...files, [cur]: e.target.value })}
                    onKeyUp={updatePos}
                    onClick={updatePos}
                    onKeyDown={(e) => {
                      if (e.key === 'Tab') {
                        e.preventDefault()
                        const el = e.currentTarget
                        const s = el.selectionStart
                        const v = el.value.slice(0, s) + '    ' + el.value.slice(el.selectionEnd)
                        setFiles({ ...files, [cur]: v })
                        requestAnimationFrame(() => el.setSelectionRange(s + 4, s + 4))
                      }
                    }}
                    className="absolute inset-0 m-0 h-full w-full resize-none overflow-hidden whitespace-pre bg-transparent py-1 pl-12 font-mono leading-[20px] text-transparent outline-none"
                    style={{ caretColor: '#aeafad', tabSize: 4 }}
                    aria-label={`Edit ${cur}`}
                  />
                </div>
              </div>
              {!mobile && (
                <div className="pointer-events-none w-20 shrink-0 overflow-hidden border-l border-[#2b2b2b] bg-[#1e1e1e] pt-1 opacity-60">
                  <pre className="m-0 origin-top-left scale-[.18] whitespace-pre text-[13px] leading-[20px]" style={{ width: '555%' }}>
                    {lines.map((l, i) => (
                      <div key={i}>{highlight(l, md)}</div>
                    ))}
                  </pre>
                </div>
              )}
            </div>
          </div>
          <div className={'flex shrink-0 flex-col border-t border-[#3c3c3c] bg-[#1e1e1e] ' + (mobile ? 'h-[30%] min-h-[96px]' : 'h-48')}>
            <div className="flex items-center gap-4 px-4 py-1.5 font-sans text-[11px] uppercase tracking-wide text-[#e7e7e7]">
              <span className="border-b border-white pb-0.5">Terminal</span>
              <span className="text-[#969696]">Problems</span>
              <span className="text-[#969696]">Output</span>
              {busy && <span className="ml-auto normal-case text-[#4ec9b0]">running on GPU…</span>}
            </div>
            <div className="thin-scroll min-h-0 flex-1 overflow-auto px-4 pb-2 text-[12px] leading-[18px]">
              {term.map((l, i) => (
                <div key={i} className={'whitespace-pre ' + (l.startsWith('alex@') ? 'text-[#4ec9b0]' : l.startsWith('Accuracy') ? 'font-bold text-[#b5cea8]' : '')}>
                  {l || ' '}
                </div>
              ))}
              <form
                className="flex"
                onSubmit={(e) => {
                  e.preventDefault()
                  run(cmd)
                  setCmd('')
                }}
              >
                <span className="shrink-0 text-[#4ec9b0]">alex@stratus:~/stratus-demo$&nbsp;</span>
                <input id="vs-term" value={cmd} onChange={(e) => setCmd(e.target.value)} className="min-w-0 flex-1 bg-transparent text-[#d4d4d4] outline-none" autoCapitalize="off" autoCorrect="off" spellCheck={false} aria-label="Terminal command" />
              </form>
              <div ref={termEnd} />
            </div>
          </div>
        </div>
      </div>
      <div className="flex h-6 shrink-0 items-center gap-3 overflow-hidden whitespace-nowrap bg-[#007acc] px-3 font-sans text-[11px] text-white">
        <span>⎇ main</span>
        <span>Stratus Pro · Sydney · 18 ms</span>
        <span className="ml-auto">
          Ln {pos.ln}, Col {pos.col}
        </span>
        <span>Python 3.12</span>
      </div>
    </div>
  )
}
