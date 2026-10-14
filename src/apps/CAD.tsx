import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { useEffect, useRef, useState } from 'react'
import type { AppProps } from '../screens/Session'
import { useThreeScene, studioLights } from './three'
import { load, save } from '../lib/storage'

type Tool = 'select' | 'line' | 'rect' | 'circle' | 'dim'
type Layer = 'Walls' | 'Doors' | 'Furniture' | 'Dimensions'
type Shape =
  | { id: number; kind: 'line'; layer: Layer; x1: number; y1: number; x2: number; y2: number }
  | { id: number; kind: 'rect'; layer: Layer; x: number; y: number; w: number; h: number }
  | { id: number; kind: 'circle'; layer: Layer; x: number; y: number; r: number }
  | { id: number; kind: 'dim'; layer: Layer; x1: number; y1: number; x2: number; y2: number }
  | { id: number; kind: 'arc'; layer: Layer; x: number; y: number; r: number; a0: number }

const LAYER_COL: Record<Layer, string> = { Walls: '#E2E8F0', Doors: '#FBBF24', Furniture: '#38BDF8', Dimensions: '#F472B6' }
const GRID = 0.5 // metres

// A two bedroom apartment, 12 m by 8 m, in metres.
function plan(): Shape[] {
  let id = 1
  const W = (x1: number, y1: number, x2: number, y2: number): Shape => ({ id: id++, kind: 'line', layer: 'Walls', x1, y1, x2, y2 })
  return [
    W(0, 0, 12, 0), W(12, 0, 12, 8), W(12, 8, 0, 8), W(0, 8, 0, 0),
    W(5, 0, 5, 3.5), W(5, 4.5, 5, 8), W(5, 4, 8.5, 4), W(9.5, 4, 12, 4), W(8.5, 0, 8.5, 2.5),
    { id: id++, kind: 'arc', layer: 'Doors', x: 5, y: 3.5, r: 1, a0: 90 },
    { id: id++, kind: 'arc', layer: 'Doors', x: 8.5, y: 4, r: 1, a0: 0 },
    { id: id++, kind: 'arc', layer: 'Doors', x: 2, y: 8, r: 1, a0: 270 },
    { id: id++, kind: 'rect', layer: 'Furniture', x: 1, y: 1, w: 2.5, h: 1 },
    { id: id++, kind: 'rect', layer: 'Furniture', x: 1, y: 5, w: 2, h: 1.6 },
    { id: id++, kind: 'circle', layer: 'Furniture', x: 3, y: 3.5, r: 0.6 },
    { id: id++, kind: 'rect', layer: 'Furniture', x: 9.5, y: 5.5, w: 2, h: 1.8 },
    { id: id++, kind: 'rect', layer: 'Furniture', x: 6, y: 5.5, w: 1.6, h: 2 },
    { id: id++, kind: 'rect', layer: 'Furniture', x: 9.5, y: 0.5, w: 2, h: 1.5 },
    { id: id++, kind: 'dim', layer: 'Dimensions', x1: 0, y1: -1, x2: 12, y2: -1 },
    { id: id++, kind: 'dim', layer: 'Dimensions', x1: -1, y1: 0, x2: -1, y2: 8 },
  ]
}

const snap = (v: number) => Math.round(v / GRID) * GRID

export default function CAD({ autoplay, mobile }: AppProps) {
  const [shapes, setShapes] = useState<Shape[]>(() => load('stratus.app.cad', plan()))
  const [tool, setTool] = useState<Tool>('line')
  const [hidden, setHidden] = useState<Layer[]>([])
  const [layer, setLayer] = useState<Layer>('Walls')
  const [draft, setDraft] = useState<{ x: number; y: number; cx: number; cy: number } | null>(null)
  const [cursor, setCursor] = useState({ x: 0, y: 0 })
  const [mode3d, setMode3d] = useState(false)
  const [sel, setSel] = useState<number | null>(null)
  const svg = useRef<SVGSVGElement>(null)
  useEffect(() => save('stratus.app.cad', shapes), [shapes])
  useEffect(() => {
    if (!autoplay) return
    const t = window.setTimeout(() => setMode3d(true), 1600)
    return () => window.clearTimeout(t)
  }, [autoplay])

  const toWorld = (e: React.PointerEvent) => {
    const s = svg.current!
    const pt = s.createSVGPoint()
    pt.x = e.clientX
    pt.y = e.clientY
    const p = pt.matrixTransform(s.getScreenCTM()!.inverse())
    return { x: snap(p.x), y: snap(p.y) }
  }
  const down = (e: React.PointerEvent) => {
    if (tool === 'select') return
    const p = toWorld(e)
    ;(e.target as Element).setPointerCapture?.(e.pointerId)
    setDraft({ x: p.x, y: p.y, cx: p.x, cy: p.y })
  }
  const move = (e: React.PointerEvent) => {
    const p = toWorld(e)
    setCursor(p)
    if (draft) setDraft({ ...draft, cx: p.x, cy: p.y })
  }
  const up = () => {
    if (!draft) return
    const { x, y, cx, cy } = draft
    setDraft(null)
    if (x === cx && y === cy) return
    const id = Date.now()
    const lay: Layer = tool === 'dim' ? 'Dimensions' : layer
    const s: Shape =
      tool === 'rect'
        ? { id, kind: 'rect', layer: lay, x: Math.min(x, cx), y: Math.min(y, cy), w: Math.abs(cx - x), h: Math.abs(cy - y) }
        : tool === 'circle'
          ? { id, kind: 'circle', layer: lay, x, y, r: Math.hypot(cx - x, cy - y) }
          : { id, kind: tool === 'dim' ? 'dim' : 'line', layer: lay, x1: x, y1: y, x2: cx, y2: cy }
    setShapes((sh) => [...sh, s])
  }
  const drawShape = (s: Shape, preview = false) => {
    const col = preview ? '#22D3EE' : sel === s.id ? '#22D3EE' : LAYER_COL[s.layer]
    const sw = s.layer === 'Walls' ? 0.2 : 0.05
    const common = { stroke: col, fill: 'none', vectorEffect: 'non-scaling-stroke' as const }
    const onClick = () => tool === 'select' && setSel(s.id)
    switch (s.kind) {
      case 'line':
        return <line key={s.id} x1={s.x1} y1={s.y1} x2={s.x2} y2={s.y2} stroke={col} strokeWidth={sw} strokeLinecap="square" onClick={onClick} />
      case 'rect':
        return <rect key={s.id} x={s.x} y={s.y} width={s.w} height={s.h} {...common} strokeWidth={1.5} onClick={onClick} />
      case 'circle':
        return <circle key={s.id} cx={s.x} cy={s.y} r={s.r} {...common} strokeWidth={1.5} onClick={onClick} />
      case 'arc': {
        const a = (s.a0 * Math.PI) / 180
        const b = a + Math.PI / 2
        return (
          <g key={s.id} onClick={onClick}>
            <line x1={s.x} y1={s.y} x2={s.x + Math.cos(a) * s.r} y2={s.y + Math.sin(a) * s.r} {...common} strokeWidth={1.5} />
            <path d={`M${s.x + Math.cos(a) * s.r},${s.y + Math.sin(a) * s.r} A${s.r},${s.r} 0 0 1 ${s.x + Math.cos(b) * s.r},${s.y + Math.sin(b) * s.r}`} {...common} strokeWidth={1} strokeDasharray="4 3" />
          </g>
        )
      }
      case 'dim': {
        const len = Math.hypot(s.x2 - s.x1, s.y2 - s.y1)
        const vertical = Math.abs(s.x2 - s.x1) < Math.abs(s.y2 - s.y1)
        const mx = (s.x1 + s.x2) / 2
        const my = (s.y1 + s.y2) / 2
        return (
          <g key={s.id} onClick={onClick}>
            <line x1={s.x1} y1={s.y1} x2={s.x2} y2={s.y2} {...common} strokeWidth={1} />
            <circle cx={s.x1} cy={s.y1} r={0.08} fill={col} />
            <circle cx={s.x2} cy={s.y2} r={0.08} fill={col} />
            <text x={mx} y={my} dy={vertical ? 0 : -0.15} fontSize={0.42} fill={col} textAnchor="middle" transform={vertical ? `rotate(-90 ${mx} ${my})` : undefined} style={{ fontFamily: 'JetBrains Mono, monospace' }}>
              {(len * 1000).toFixed(0)}
            </text>
          </g>
        )
      }
    }
  }
  const preview: Shape | null = draft
    ? tool === 'rect'
      ? { id: -1, kind: 'rect', layer, x: Math.min(draft.x, draft.cx), y: Math.min(draft.y, draft.cy), w: Math.abs(draft.cx - draft.x), h: Math.abs(draft.cy - draft.y) }
      : tool === 'circle'
        ? { id: -1, kind: 'circle', layer, x: draft.x, y: draft.y, r: Math.hypot(draft.cx - draft.x, draft.cy - draft.y) }
        : { id: -1, kind: tool === 'dim' ? 'dim' : 'line', layer: 'Dimensions', x1: draft.x, y1: draft.y, x2: draft.cx, y2: draft.cy }
    : null
  const TOOLS: [Tool, string][] = [
    ['select', 'Select'],
    ['line', 'Line'],
    ['rect', 'Rect'],
    ['circle', 'Circle'],
    ['dim', 'Dimension'],
  ]
  return (
    <div className="flex h-full flex-col bg-[#0F172A] text-[12px] text-[#CBD5E1]">
      <div className="no-scrollbar flex h-10 shrink-0 items-center gap-1 overflow-x-auto border-b border-black/40 bg-[#1E293B] px-2">
        {!mode3d &&
          TOOLS.map(([t, l]) => (
            <button key={t} onClick={() => setTool(t)} className={'min-h-[30px] shrink-0 rounded px-2.5 font-semibold ' + (tool === t ? 'bg-[#0369A1] text-white' : 'bg-white/5')}>
              {l}
            </button>
          ))}
        {!mode3d && (
          <button onClick={() => (sel != null ? (setShapes(shapes.filter((s) => s.id !== sel)), setSel(null)) : setShapes(shapes.slice(0, -1)))} className="min-h-[30px] shrink-0 rounded bg-white/5 px-2.5 font-semibold">
            {sel != null ? 'Delete' : 'Undo'}
          </button>
        )}
        <button onClick={() => setMode3d(!mode3d)} className="ml-auto min-h-[30px] shrink-0 rounded bg-[#38BDF8] px-3 font-bold text-[#04263a]">
          {mode3d ? 'Back to 2D' : '3D Extrude'}
        </button>
      </div>
      <div className="flex min-h-0 flex-1">
        <div className="relative min-w-0 flex-1">
          {mode3d ? (
            <Extrude shapes={shapes.filter((s) => !hidden.includes(s.layer))} />
          ) : (
            <svg ref={svg} viewBox="-2 -2 16 12" className="absolute inset-0 h-full w-full" style={{ touchAction: 'none', cursor: tool === 'select' ? 'default' : 'crosshair' }} onPointerDown={down} onPointerMove={move} onPointerUp={up}>
              <defs>
                <pattern id="cadgrid" width={GRID} height={GRID} patternUnits="userSpaceOnUse">
                  <path d={`M${GRID} 0H0V${GRID}`} fill="none" stroke="#1E293B" strokeWidth="0.02" />
                </pattern>
                <pattern id="cadgrid5" width={2.5} height={2.5} patternUnits="userSpaceOnUse">
                  <rect width="2.5" height="2.5" fill="url(#cadgrid)" />
                  <path d="M2.5 0H0V2.5" fill="none" stroke="#334155" strokeWidth="0.03" />
                </pattern>
              </defs>
              <rect x="-20" y="-20" width="60" height="60" fill="url(#cadgrid5)" />
              {shapes.filter((s) => !hidden.includes(s.layer)).map((s) => drawShape(s))}
              {preview && drawShape(preview, true)}
              <circle cx={cursor.x} cy={cursor.y} r="0.09" fill="#22D3EE" />
            </svg>
          )}
          {!mode3d && (
            <div className="pointer-events-none absolute bottom-2 left-2 rounded bg-black/50 px-2 py-1 font-mono text-[11px] tabnum">
              X {cursor.x.toFixed(2)} m · Y {cursor.y.toFixed(2)} m · Snap {GRID * 1000} mm
            </div>
          )}
          <div className="pointer-events-none absolute left-2 top-2 rounded bg-black/50 px-2 py-1 text-[11px]">{mode3d ? 'Extruded model · walls 2,700 mm' : 'Level 1 floor plan · apartment_2bed.dwg'}</div>
        </div>
        <div className={(mobile ? 'w-32' : 'w-44') + ' shrink-0 border-l border-black/40 bg-[#111827] p-2'}>
          <div className="mb-1 text-[11px] font-bold uppercase tracking-wide text-[#64748B]">Layers</div>
          {(Object.keys(LAYER_COL) as Layer[]).map((l) => (
            <div key={l} className={'mb-1 flex items-center gap-1.5 rounded px-1 ' + (layer === l ? 'bg-white/10' : '')}>
              <button onClick={() => setHidden(hidden.includes(l) ? hidden.filter((x) => x !== l) : [...hidden, l])} className="flex h-8 w-6 items-center justify-center" aria-label={`Toggle ${l}`}>
                <span className="h-3 w-3 rounded-sm" style={{ background: hidden.includes(l) ? 'transparent' : LAYER_COL[l], border: `1.5px solid ${LAYER_COL[l]}` }} />
              </button>
              <button onClick={() => setLayer(l)} className="min-h-[32px] flex-1 text-left">
                {l}
              </button>
            </div>
          ))}
          {!mobile && (
            <div className="mt-3 border-t border-white/5 pt-2 text-[11px] text-[#64748B]">
              <div className="font-bold uppercase tracking-wide">Drawing</div>
              <div className="tabnum mt-1">{shapes.length} objects</div>
              <div>Units: millimetres</div>
              <div>Floor area: 96.0 m²</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function Extrude({ shapes }: { shapes: Shape[] }) {
  const ref = useThreeScene(({ scene, camera, renderer }) => {
    scene.background = new THREE.Color(0x0f172a)
    studioLights(scene)
    camera.position.set(14, 13, 16)
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.target.set(6, 0, 4)
    controls.enableDamping = true
    const floor = new THREE.Mesh(new THREE.BoxGeometry(12.4, 0.15, 8.4), new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.9 }))
    floor.position.set(6, -0.075, 4)
    floor.receiveShadow = true
    scene.add(floor)
    const grid = new THREE.GridHelper(30, 60, 0x334155, 0x1e293b)
    grid.position.set(6, -0.16, 4)
    scene.add(grid)
    const wallMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.7 })
    const furnMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.5 })
    const walls = new THREE.Group()
    const furn = new THREE.Group()
    for (const s of shapes) {
      if (s.kind === 'line' && s.layer === 'Walls') {
        const len = Math.hypot(s.x2 - s.x1, s.y2 - s.y1)
        const m = new THREE.Mesh(new THREE.BoxGeometry(len + 0.2, 1, 0.2), wallMat)
        m.position.set((s.x1 + s.x2) / 2, 0.5, (s.y1 + s.y2) / 2)
        m.rotation.y = -Math.atan2(s.y2 - s.y1, s.x2 - s.x1)
        m.castShadow = m.receiveShadow = true
        walls.add(m)
      } else if (s.kind === 'rect' && s.layer !== 'Dimensions') {
        const m = new THREE.Mesh(new THREE.BoxGeometry(s.w, 0.7, s.h), furnMat)
        m.position.set(s.x + s.w / 2, 0.35, s.y + s.h / 2)
        m.castShadow = true
        furn.add(m)
      } else if (s.kind === 'circle' && s.layer !== 'Dimensions') {
        const m = new THREE.Mesh(new THREE.CylinderGeometry(s.r, s.r, 0.75, 24), furnMat)
        m.position.set(s.x, 0.375, s.y)
        m.castShadow = true
        furn.add(m)
      }
    }
    scene.add(walls, furn)
    walls.scale.y = 0.01
    furn.scale.y = 0.01
    return {
      frame: (_dt, t) => {
        const k = Math.min(1, t / 1.6)
        const e = 1 - Math.pow(1 - k, 3)
        walls.scale.y = Math.max(0.01, e * 2.7)
        furn.scale.y = Math.max(0.01, Math.min(1, (t - 0.8) / 0.8))
        controls.update()
      },
      dispose: () => controls.dispose(),
    }
  })
  return <div ref={ref} className="absolute inset-0" />
}
