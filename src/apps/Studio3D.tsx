import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { useRef, useState } from 'react'
import type { AppProps } from '../screens/Session'
import { useThreeScene, studioLights } from './three'

const PARTS = ['Seat', 'Backrest', 'Leg FL', 'Leg FR', 'Leg BL', 'Leg BR', 'Rail', 'Floor', 'Key light']

function buildChair(mat: THREE.Material, accent: THREE.Material) {
  const g = new THREE.Group()
  const add = (geo: THREE.BufferGeometry, m: THREE.Material, x: number, y: number, z: number, name: string, rx = 0) => {
    const mesh = new THREE.Mesh(geo, m)
    mesh.position.set(x, y, z)
    mesh.rotation.x = rx
    mesh.castShadow = true
    mesh.receiveShadow = true
    mesh.name = name
    g.add(mesh)
    return mesh
  }
  add(new THREE.BoxGeometry(1.6, 0.14, 1.5), accent, 0, 1.0, 0, 'Seat')
  add(new THREE.BoxGeometry(1.6, 1.3, 0.12), accent, 0, 1.75, -0.72, 'Backrest', -0.12)
  const legGeo = new THREE.CylinderGeometry(0.06, 0.045, 1.0, 6)
  ;[
    [-0.68, 0.62, 'Leg FL'],
    [0.68, 0.62, 'Leg FR'],
    [-0.68, -0.62, 'Leg BL'],
    [0.68, -0.62, 'Leg BR'],
  ].forEach(([x, z, n]) => add(legGeo, mat, x as number, 0.5, z as number, n as string))
  add(new THREE.BoxGeometry(1.36, 0.06, 0.06), mat, 0, 0.35, 0.62, 'Rail')
  return g
}

export default function Studio3D({ autoplay, mobile }: AppProps) {
  const [sel, setSel] = useState('Seat')
  const [shading, setShading] = useState<'solid' | 'wire'>('solid')
  const [render, setRender] = useState<number | null>(null)
  const [done, setDone] = useState(false)
  const api = useRef<{ setWire: (w: boolean) => void; spin: boolean } | null>(null)
  const ref = useThreeScene(({ scene, camera, renderer }) => {
    scene.background = new THREE.Color(0x2b2d33)
    camera.position.set(4.2, 3.2, 4.6)
    studioLights(scene)
    const wood = new THREE.MeshStandardMaterial({ color: 0x3a2a20, roughness: 0.6, flatShading: true })
    const fabric = new THREE.MeshStandardMaterial({ color: 0xff9f43, roughness: 0.75, flatShading: true })
    const chair = buildChair(wood, fabric)
    scene.add(chair)
    const floor = new THREE.Mesh(new THREE.CircleGeometry(4, 48), new THREE.MeshStandardMaterial({ color: 0x3a3d46, roughness: 1 }))
    floor.rotation.x = -Math.PI / 2
    floor.receiveShadow = true
    scene.add(floor)
    const grid = new THREE.GridHelper(12, 24, 0x555a66, 0x41454f)
    grid.position.y = 0.002
    scene.add(grid)
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.target.set(0, 1, 0)
    controls.enableDamping = true
    controls.minDistance = 2.5
    controls.maxDistance = 14
    const state = { spin: !!autoplay }
    api.current = {
      setWire: (w) => [wood, fabric].forEach((m) => (m.wireframe = w)),
      get spin() {
        return state.spin
      },
      set spin(v) {
        state.spin = v
      },
    }
    controls.addEventListener('start', () => (state.spin = false))
    return {
      frame: (dt) => {
        if (state.spin) chair.rotation.y += dt * 0.6
        controls.update()
      },
      dispose: () => controls.dispose(),
    }
  })
  const startRender = () => {
    setDone(false)
    setRender(0)
    const start = performance.now()
    const id = window.setInterval(() => {
      const p = Math.min(1, (performance.now() - start) / 2400)
      setRender(p)
      if (p >= 1) {
        window.clearInterval(id)
        setRender(null)
        setDone(true)
        window.setTimeout(() => setDone(false), 3200)
      }
    }, 60)
  }
  return (
    <div className="flex h-full flex-col bg-[#232428] text-[12px] text-[#ddd]">
      <div className="no-scrollbar flex h-10 shrink-0 items-center gap-1 overflow-x-auto border-b border-black/40 bg-[#2f3036] px-2">
        {['File', 'Edit', 'Add', 'Object'].map((m) => (
          <span key={m} className="hidden px-2 text-[#bbb] sm:inline">
            {m}
          </span>
        ))}
        {(['solid', 'wire'] as const).map((m) => (
          <button
            key={m}
            onClick={() => {
              setShading(m)
              api.current?.setWire(m === 'wire')
            }}
            className={'min-h-[30px] rounded px-2.5 font-semibold ' + (shading === m ? 'bg-[#E8590C] text-white' : 'bg-white/5')}
          >
            {m === 'solid' ? 'Solid' : 'Wireframe'}
          </button>
        ))}
        <button onClick={() => api.current && (api.current.spin = !api.current.spin)} className="min-h-[30px] rounded bg-white/5 px-2.5 font-semibold">
          Turntable
        </button>
        <button onClick={startRender} disabled={render != null} className="ml-auto min-h-[30px] shrink-0 rounded bg-[#FF9F43] px-3 font-bold text-[#231300]">
          Render
        </button>
      </div>
      <div className="flex min-h-0 flex-1">
        <div className="relative min-w-0 flex-1">
          <div ref={ref} className="absolute inset-0" />
          <div className="pointer-events-none absolute left-2 top-2 rounded bg-black/40 px-2 py-1 text-[11px] text-white/80">
            User Perspective · chair_lowpoly · {mobile ? 'drag to orbit, pinch to zoom' : 'drag to orbit, scroll to zoom'}
          </div>
          <div className="pointer-events-none absolute bottom-2 left-2 rounded bg-black/40 px-2 py-1 text-[11px] text-white/80 tabnum">Verts 1,284 · Faces 642 · GPU RTX-class</div>
          {render != null && (
            <div className="absolute inset-x-6 top-1/2 -translate-y-1/2 rounded-xl bg-black/70 p-4 text-white">
              <div className="flex justify-between text-[12px] font-semibold tabnum">
                <span>Rendering on cloud GPU, 256 samples</span>
                <span>{Math.round(render * 100)}%</span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/15">
                <div className="h-full rounded-full bg-[#FF9F43]" style={{ width: `${render * 100}%` }} />
              </div>
            </div>
          )}
          {done && <div className="anim-pop absolute left-1/2 top-4 -translate-x-1/2 rounded-full bg-white px-4 py-2 text-[13px] font-semibold text-[#222] shadow-xl">Render complete in 3.2 s on GPU</div>}
        </div>
        {!mobile && (
          <div className="w-48 shrink-0 border-l border-black/40 bg-[#2a2b30]">
            <div className="border-b border-black/30 px-3 py-2 text-[11px] font-bold uppercase tracking-wide text-[#999]">Outliner</div>
            {PARTS.map((p) => (
              <button key={p} onClick={() => setSel(p)} className={'flex w-full items-center gap-2 px-3 py-1.5 text-left ' + (sel === p ? 'bg-[#E8590C]/30 text-white' : 'hover:bg-white/5')}>
                <span className="text-[#FF9F43]">▸</span>
                {p}
              </button>
            ))}
            <div className="mt-3 border-t border-black/30 px-3 py-2 text-[11px] text-[#999]">
              <div className="font-bold uppercase tracking-wide">Properties</div>
              <div className="mt-1 tabnum">Location 0.00, 1.00, 0.00</div>
              <div className="tabnum">Scale 1.00</div>
              <div>Material: Fabric</div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
