import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { useEffect, useRef, useState } from 'react'
import type { AppProps } from '../screens/Session'
import { useThreeScene } from './three'

const LEVELS = ['Ground', 'Level 1', 'Level 2', 'Roof']
const ROOMS = [
  ['G.01', 'Lobby', 'Ground', 86.4],
  ['G.02', 'Cafe', 'Ground', 54.0],
  ['1.01', 'Studio A', 'Level 1', 72.0],
  ['1.02', 'Computer lab', 'Level 1', 68.5],
  ['2.01', 'Library', 'Level 2', 110.2],
  ['2.02', 'Meeting rooms', 'Level 2', 31.8],
  ['R.01', 'Roof garden', 'Roof', 96.0],
] as const

interface Api {
  setLevel: (i: number, on: boolean) => void
  setCut: (v: number) => void
  setSun: (h: number) => void
  setSpin: (v: boolean) => void
}

export default function Architecture({ autoplay, mobile }: AppProps) {
  const [levels, setLevels] = useState([true, true, true, true])
  const [cut, setCut] = useState(1)
  const [sun, setSun] = useState(14)
  const [tab, setTab] = useState<'model' | 'schedule'>('model')
  const api = useRef<Api | null>(null)

  const ref = useThreeScene(({ scene, camera, renderer, el }) => {
    renderer.localClippingEnabled = true
    scene.background = new THREE.Color(0xdde6ee)
    scene.fog = new THREE.Fog(0xdde6ee, 40, 90)
    const far = el.clientWidth < el.clientHeight * 1.1 ? 1.8 : 1
    camera.position.set(22 * far, 14 * far, 24 * far)
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.target.set(0, 5, 0)
    controls.enableDamping = true
    controls.maxPolarAngle = Math.PI * 0.49
    scene.add(new THREE.HemisphereLight(0xffffff, 0x8a9a7a, 1.0))
    const sunLight = new THREE.DirectionalLight(0xfff1d6, 2.6)
    sunLight.castShadow = true
    sunLight.shadow.mapSize.set(2048, 2048)
    Object.assign(sunLight.shadow.camera, { left: -30, right: 30, top: 30, bottom: -30, far: 120 })
    scene.add(sunLight)
    const clip = new THREE.Plane(new THREE.Vector3(-1, 0, 0), 20)

    const ground = new THREE.Mesh(new THREE.PlaneGeometry(120, 120), new THREE.MeshStandardMaterial({ color: 0x9fb48e, roughness: 1 }))
    ground.rotation.x = -Math.PI / 2
    ground.receiveShadow = true
    scene.add(ground)
    const plaza = new THREE.Mesh(new THREE.BoxGeometry(30, 0.1, 22), new THREE.MeshStandardMaterial({ color: 0xcfcac0, roughness: 1 }))
    plaza.position.y = 0.05
    plaza.receiveShadow = true
    scene.add(plaza)

    const M = (color: number, extra: Partial<THREE.MeshStandardMaterialParameters> = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.7, clippingPlanes: [clip], clipShadows: true, side: THREE.DoubleSide, ...extra })
    const slabMat = M(0xf1f1ee)
    const colMat = M(0x9aa3ad)
    const glassMat = M(0x7fb2d6, { transparent: true, opacity: 0.45, roughness: 0.1, metalness: 0.3 })
    const finMat = M(0x4d7c0f)
    const coreMat = M(0x6b7280)
    const groups: THREE.Group[] = []
    const W = 18
    const D = 12
    const H = 3.6
    for (let l = 0; l < 4; l++) {
      const g = new THREE.Group()
      const y = l * H
      const slab = new THREE.Mesh(new THREE.BoxGeometry(W + (l === 3 ? 1 : 0), 0.35, D + (l === 3 ? 1 : 0)), slabMat)
      slab.position.set(l === 1 ? 1 : 0, y + 0.3, 0)
      g.add(slab)
      if (l < 3) {
        for (let i = 0; i <= 4; i++)
          for (const z of [-D / 2 + 0.4, D / 2 - 0.4]) {
            const c = new THREE.Mesh(new THREE.BoxGeometry(0.4, H, 0.4), colMat)
            c.position.set(-W / 2 + 0.4 + i * ((W - 0.8) / 4), y + H / 2 + 0.3, z)
            g.add(c)
          }
        for (const z of [-D / 2 + 0.1, D / 2 - 0.1]) {
          const glass = new THREE.Mesh(new THREE.BoxGeometry(W - 0.6, H - 0.4, 0.06), glassMat)
          glass.position.set(0, y + H / 2 + 0.4, z)
          g.add(glass)
        }
        const side = new THREE.Mesh(new THREE.BoxGeometry(0.06, H - 0.4, D - 0.6), glassMat)
        side.position.set(W / 2 - 0.1, y + H / 2 + 0.4, 0)
        g.add(side)
        for (let i = 0; i < 18; i++) {
          const fin = new THREE.Mesh(new THREE.BoxGeometry(0.12, H - 0.4, 0.6), finMat)
          fin.position.set(-W / 2 + 0.5 + i * ((W - 1) / 17), y + H / 2 + 0.4, D / 2 + 0.25)
          g.add(fin)
        }
        const core = new THREE.Mesh(new THREE.BoxGeometry(3, H, 4), coreMat)
        core.position.set(-W / 2 + 2, y + H / 2 + 0.3, -1)
        g.add(core)
      } else {
        for (let i = 0; i < 6; i++) {
          const tree = new THREE.Mesh(new THREE.SphereGeometry(0.8, 10, 8), M(0x3f8f3a))
          tree.position.set(-6 + i * 2.6, y + 1.3, (i % 2 ? 2 : -2))
          g.add(tree)
        }
      }
      g.traverse((o) => {
        const m = o as THREE.Mesh
        if (m.isMesh) {
          m.castShadow = m.material !== glassMat
          m.receiveShadow = true
        }
      })
      scene.add(g)
      groups.push(g)
    }
    // Neighbouring blocks for context
    ;[
      [-24, 6, 8, 10, -10],
      [22, 4, 8, 8, -14],
      [-4, 9, 7, 12, -20],
    ].forEach(([x, h, w, d, z]) => {
      const b = new THREE.Mesh(new THREE.BoxGeometry(w, h * 2.2, d), new THREE.MeshStandardMaterial({ color: 0xf4f4f2, roughness: 0.9 }))
      b.position.set(x, h * 1.1, z)
      b.castShadow = b.receiveShadow = true
      scene.add(b)
    })

    const state = { spin: !!autoplay }
    const placeSun = (h: number) => {
      const a = ((h - 6) / 12) * Math.PI
      sunLight.position.set(Math.cos(a) * 40, Math.max(2, Math.sin(a) * 40), -18)
      sunLight.intensity = 0.6 + Math.sin(a) * 2.2
    }
    placeSun(14)
    api.current = {
      setLevel: (i, on) => (groups[i].visible = on),
      setCut: (v) => (clip.constant = -W / 2 + v * (W + 2)),
      setSun: placeSun,
      setSpin: (v) => (state.spin = v),
    }
    controls.addEventListener('start', () => (state.spin = false))
    return {
      frame: (dt) => {
        if (state.spin) {
          const p = camera.position.clone().sub(controls.target)
          p.applyAxisAngle(new THREE.Vector3(0, 1, 0), dt * 0.25)
          camera.position.copy(controls.target).add(p)
        }
        controls.update()
      },
      dispose: () => controls.dispose(),
    }
  })

  useEffect(() => api.current?.setCut(cut), [cut])
  useEffect(() => api.current?.setSun(sun), [sun])
  useEffect(() => levels.forEach((on, i) => api.current?.setLevel(i, on)), [levels])
  useEffect(() => {
    if (!autoplay) return
    let s = 9
    const id = window.setInterval(() => {
      s += 0.25
      if (s > 18) s = 9
      setSun(s)
    }, 80)
    return () => window.clearInterval(id)
  }, [autoplay])

  const clock = `${Math.floor(sun)}:${String(Math.round((sun % 1) * 60)).padStart(2, '0')}`
  return (
    <div className="flex h-full flex-col bg-[#14181c] text-[12px] text-[#d6dde4]">
      <div className="flex h-10 shrink-0 items-center gap-1 border-b border-black/40 bg-[#1f262c] px-2">
        {(
          [
            ['model', '3D model'],
            ['schedule', 'Room schedule'],
          ] as const
        ).map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)} className={'min-h-[30px] rounded px-3 font-semibold ' + (tab === k ? 'bg-[#4D7C0F] text-white' : 'bg-white/5')}>
            {l}
          </button>
        ))}
        <span className="ml-auto hidden text-[#8a96a3] sm:inline">Campus_Learning_Hub.rvt · 4 levels · 1,284 m²</span>
      </div>
      <div className="flex min-h-0 flex-1">
        <div className="relative min-w-0 flex-1" style={{ display: tab === 'model' ? 'block' : 'none' }}>
          <div ref={ref} className="absolute inset-0" />
          <div className="pointer-events-none absolute left-2 top-2 rounded bg-black/55 px-2 py-1 text-[11px] text-white">
            Sun study · {clock} · 21 June · Sydney
          </div>
        </div>
        {tab === 'schedule' && (
          <div className="thin-scroll min-w-0 flex-1 overflow-auto p-3">
            <table className="w-full tabnum">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-wide text-[#8a96a3]">
                  <th className="py-1.5">No.</th>
                  <th>Room</th>
                  <th>Level</th>
                  <th className="text-right">Area</th>
                </tr>
              </thead>
              <tbody>
                {ROOMS.map(([n, r, l, a]) => (
                  <tr key={n} className="border-t border-white/5">
                    <td className="py-2 font-mono">{n}</td>
                    <td>{r}</td>
                    <td className="text-[#8a96a3]">{l}</td>
                    <td className="text-right">{a.toFixed(1)} m²</td>
                  </tr>
                ))}
                <tr className="border-t border-white/20 font-bold">
                  <td className="py-2" colSpan={3}>
                    Total net area
                  </td>
                  <td className="text-right">{ROOMS.reduce((s, r) => s + r[3], 0).toFixed(1)} m²</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
        <div className={(mobile ? 'w-36' : 'w-52') + ' thin-scroll shrink-0 overflow-y-auto border-l border-black/40 bg-[#1a2026] p-2'}>
          <div className="mb-1 text-[11px] font-bold uppercase tracking-wide text-[#8a96a3]">Levels</div>
          {LEVELS.map((l, i) => (
            <label key={l} className="flex min-h-[32px] items-center gap-2" htmlFor={`arch-l${i}`}>
              <input id={`arch-l${i}`} type="checkbox" checked={levels[i]} onChange={(e) => setLevels(levels.map((v, j) => (j === i ? e.target.checked : v)))} className="h-4 w-4 accent-[#4D7C0F]" />
              {l}
            </label>
          ))}
          <label htmlFor="arch-cut" className="mt-3 block text-[11px] font-bold uppercase tracking-wide text-[#8a96a3]">
            Section cut
          </label>
          <input id="arch-cut" type="range" min={0} max={1} step={0.01} value={cut} onChange={(e) => setCut(+e.target.value)} className="h-8 w-full" />
          <label htmlFor="arch-sun" className="mt-2 block text-[11px] font-bold uppercase tracking-wide text-[#8a96a3]">
            Sun study <span className="tabnum text-white">{clock}</span>
          </label>
          <input id="arch-sun" type="range" min={6} max={18} step={0.25} value={sun} onChange={(e) => setSun(+e.target.value)} className="h-8 w-full" />
          <button onClick={() => api.current?.setSpin(true)} className="mt-2 min-h-[32px] w-full rounded bg-white/5 font-semibold">
            Orbit view
          </button>
        </div>
      </div>
    </div>
  )
}
