import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { useEffect, useRef, useState } from 'react'
import type { AppProps } from '../screens/Session'
import { useThreeScene, studioLights } from './three'
import { rng } from '../lib/prng'

type Mode = 'move' | 'rotate' | 'scale'
interface Obj {
  name: string
  mesh: THREE.Object3D
}

export default function GameEngine({ autoplay, mobile }: AppProps) {
  const [playing, setPlaying] = useState(false)
  const [coins, setCoins] = useState(0)
  const [selName, setSelName] = useState('Player')
  const [mode, setMode] = useState<Mode>('move')
  const [tf, setTf] = useState({ x: 0, y: 0.5, z: 0, r: 0, s: 1 })
  const [log, setLog] = useState<string[]>(['[12:00:01] Scene "Arena" loaded', '[12:00:01] GPU: RTX-class Cloud GPU, Vulkan 1.3'])
  const [build, setBuild] = useState<number | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const [hier, setHier] = useState<string[]>([])
  const input = useRef({ x: 0, z: 0 })
  const keys = useRef<Record<string, boolean>>({})
  const api = useRef<{ select: (n: string) => void; setTf: (t: typeof tf) => void; play: (p: boolean) => void; mode: Mode } | null>(null)

  const ref = useThreeScene(({ scene, camera, renderer }) => {
    scene.background = new THREE.Color(0x1f2430)
    scene.fog = new THREE.Fog(0x1f2430, 18, 40)
    studioLights(scene)
    camera.position.set(9, 9, 11)
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.target.set(0, 0, 0)
    controls.enableDamping = true
    const objs: Obj[] = []
    const add = (name: string, mesh: THREE.Object3D) => {
      mesh.name = name
      mesh.traverse((o) => {
        ;(o as THREE.Mesh).castShadow = true
        ;(o as THREE.Mesh).receiveShadow = true
      })
      scene.add(mesh)
      objs.push({ name, mesh })
    }
    const ground = new THREE.Mesh(new THREE.BoxGeometry(14, 0.4, 14), new THREE.MeshStandardMaterial({ color: 0x3d4a66, roughness: 0.9 }))
    ground.position.y = -0.2
    add('Ground', ground)
    const wallMat = new THREE.MeshStandardMaterial({ color: 0x8e7cff, roughness: 0.5 })
    ;[
      [0, 7, 14, 0.5],
      [0, -7, 14, 0.5],
      [7, 0, 0.5, 14],
      [-7, 0, 0.5, 14],
    ].forEach(([x, z, w, d], i) => {
      const m = new THREE.Mesh(new THREE.BoxGeometry(w, 0.8, d), wallMat)
      m.position.set(x, 0.4, z)
      add(`Wall ${i + 1}`, m)
    })
    const player = new THREE.Mesh(new THREE.SphereGeometry(0.5, 32, 16), new THREE.MeshStandardMaterial({ color: 0x4cc3ff, roughness: 0.25, metalness: 0.2 }))
    player.position.set(0, 0.5, 0)
    add('Player', player)
    const r = rng(77)
    const coinGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.08, 20)
    const coinMat = new THREE.MeshStandardMaterial({ color: 0xffc83d, metalness: 0.8, roughness: 0.25, emissive: 0x6b4a00 })
    const coinMeshes: THREE.Mesh[] = []
    for (let i = 0; i < 10; i++) {
      const c = new THREE.Mesh(coinGeo, coinMat)
      const a = (i / 10) * Math.PI * 2 + r() * 0.4
      const d = 2.2 + r() * 3.8
      c.position.set(Math.cos(a) * d, 0.6, Math.sin(a) * d)
      c.rotation.x = Math.PI / 2
      coinMeshes.push(c)
      add(`Coin ${i + 1}`, c)
    }
    const crate = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshStandardMaterial({ color: 0xff9f43, roughness: 0.7 }))
    crate.position.set(-4, 0.5, -3.5)
    add('Crate', crate)
    setHier(objs.map((o) => o.name))

    // Selection box and gizmo arrows
    const box = new THREE.BoxHelper(player, 0xffffff)
    scene.add(box)
    const gizmo = new THREE.Group()
    ;[
      [0xff4d4d, new THREE.Vector3(1, 0, 0)],
      [0x4dff7a, new THREE.Vector3(0, 1, 0)],
      [0x4d8bff, new THREE.Vector3(0, 0, 1)],
    ].forEach(([c, dir]) => gizmo.add(new THREE.ArrowHelper(dir as THREE.Vector3, new THREE.Vector3(), 1.4, c as number, 0.3, 0.18)))
    scene.add(gizmo)
    let selected: THREE.Object3D = player
    const syncTf = () => setTf({ x: +selected.position.x.toFixed(2), y: +selected.position.y.toFixed(2), z: +selected.position.z.toFixed(2), r: Math.round(THREE.MathUtils.radToDeg(selected.rotation.y)), s: +selected.scale.x.toFixed(2) })
    const select = (n: string) => {
      const o = objs.find((x) => x.name === n)
      if (!o) return
      selected = o.mesh
      box.setFromObject(selected)
      setSelName(n)
      syncTf()
    }
    // Pick and drag
    const ray = new THREE.Raycaster()
    const ndc = new THREE.Vector2()
    const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0)
    let dragging = false
    let lastX = 0
    const el = renderer.domElement
    const setNdc = (e: PointerEvent) => {
      const rect = el.getBoundingClientRect()
      ndc.set(((e.clientX - rect.left) / rect.width) * 2 - 1, -((e.clientY - rect.top) / rect.height) * 2 + 1)
    }
    const down = (e: PointerEvent) => {
      if (state.playing) return
      setNdc(e)
      ray.setFromCamera(ndc, camera)
      const hits = ray.intersectObjects(objs.filter((o) => o.name !== 'Ground').map((o) => o.mesh), true)
      if (hits.length) {
        let o: THREE.Object3D | null = hits[0].object
        while (o && !objs.find((x) => x.mesh === o)) o = o.parent
        if (o) {
          select(o.name)
          dragging = true
          lastX = e.clientX
          controls.enabled = false
        }
      }
    }
    const move = (e: PointerEvent) => {
      if (!dragging) return
      if (api.current?.mode === 'move') {
        setNdc(e)
        ray.setFromCamera(ndc, camera)
        plane.constant = -selected.position.y
        const p = new THREE.Vector3()
        if (ray.ray.intersectPlane(plane, p)) selected.position.set(THREE.MathUtils.clamp(p.x, -6.5, 6.5), selected.position.y, THREE.MathUtils.clamp(p.z, -6.5, 6.5))
      } else if (api.current?.mode === 'rotate') {
        selected.rotation.y += (e.clientX - lastX) * 0.02
      } else {
        selected.scale.setScalar(THREE.MathUtils.clamp(selected.scale.x + (e.clientX - lastX) * 0.01, 0.2, 4))
      }
      lastX = e.clientX
      box.setFromObject(selected)
      syncTf()
    }
    const up = () => {
      if (dragging) setLog((l) => [...l.slice(-30), `[12:0${Math.min(9, l.length % 10)}:14] ${selected.name} transform updated`])
      dragging = false
      controls.enabled = true
    }
    el.addEventListener('pointerdown', down)
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)

    const state = { playing: false, vel: new THREE.Vector3(), got: 0, start: new THREE.Vector3() }
    api.current = {
      select,
      setTf: (t) => {
        selected.position.set(t.x, t.y, t.z)
        selected.rotation.y = THREE.MathUtils.degToRad(t.r)
        selected.scale.setScalar(t.s)
        box.setFromObject(selected)
      },
      play: (p) => {
        state.playing = p
        box.visible = !p
        gizmo.visible = !p
        controls.enabled = !p
        if (p) {
          state.start.copy(player.position)
          state.vel.set(0, 0, 0)
          state.got = 0
          coinMeshes.forEach((c) => (c.visible = true))
        } else {
          player.position.copy(state.start)
          coinMeshes.forEach((c) => (c.visible = true))
          camera.position.set(9, 9, 11)
          controls.target.set(0, 0, 0)
        }
      },
      mode: 'move',
    }
    const camGoal = new THREE.Vector3()
    return {
      frame: (dt, t) => {
        coinMeshes.forEach((c, i) => (c.rotation.z = t * 2 + i))
        if (state.playing) {
          let ix = input.current.x + (keys.current.ArrowRight || keys.current.d ? 1 : 0) - (keys.current.ArrowLeft || keys.current.a ? 1 : 0)
          let iz = input.current.z + (keys.current.ArrowDown || keys.current.s ? 1 : 0) - (keys.current.ArrowUp || keys.current.w ? 1 : 0)
          if (autoplay && !ix && !iz && state.got < 1) {
            const target = coinMeshes.find((c) => c.visible)
            if (target) {
              const d = target.position.clone().sub(player.position)
              d.y = 0
              d.normalize()
              ix = d.x
              iz = d.z
            }
          }
          state.vel.x += ix * dt * 14
          state.vel.z += iz * dt * 14
          state.vel.multiplyScalar(Math.pow(0.35, dt))
          player.position.x = THREE.MathUtils.clamp(player.position.x + state.vel.x * dt, -6.2, 6.2)
          player.position.z = THREE.MathUtils.clamp(player.position.z + state.vel.z * dt, -6.2, 6.2)
          player.rotation.x += state.vel.z * dt * 2
          player.rotation.z -= state.vel.x * dt * 2
          for (const c of coinMeshes) {
            if (c.visible && c.position.distanceTo(player.position) < 0.85) {
              c.visible = false
              state.got++
              setCoins(state.got)
            }
          }
          camGoal.set(player.position.x, 9, player.position.z + 8)
          camera.position.lerp(camGoal, 0.08)
          camera.lookAt(player.position)
        } else {
          gizmo.position.copy(selected.position)
          controls.update()
        }
      },
      dispose: () => {
        el.removeEventListener('pointerdown', down)
        window.removeEventListener('pointermove', move)
        window.removeEventListener('pointerup', up)
        controls.dispose()
      },
    }
  })

  useEffect(() => {
    if (api.current) api.current.mode = mode
  }, [mode])
  useEffect(() => {
    const d = (e: KeyboardEvent) => (keys.current[e.key] = true)
    const u = (e: KeyboardEvent) => (keys.current[e.key] = false)
    window.addEventListener('keydown', d)
    window.addEventListener('keyup', u)
    return () => {
      window.removeEventListener('keydown', d)
      window.removeEventListener('keyup', u)
    }
  }, [])
  const togglePlay = () => {
    const p = !playing
    setPlaying(p)
    setCoins(0)
    api.current?.play(p)
    setLog((l) => [...l.slice(-30), p ? '[12:01:02] Entering Play mode' : '[12:01:40] Exiting Play mode'])
  }
  useEffect(() => {
    if (!autoplay) return
    const t = window.setTimeout(() => {
      setPlaying(true)
      api.current?.play(true)
    }, 1000)
    return () => window.clearTimeout(t)
  }, [autoplay])
  useEffect(() => {
    if (coins === 10) {
      setToast('You collected all 10 coins')
      window.setTimeout(() => setToast(null), 2600)
    }
  }, [coins])
  const doBuild = () => {
    setBuild(0)
    const start = performance.now()
    const id = window.setInterval(() => {
      const p = Math.min(1, (performance.now() - start) / 2600)
      setBuild(p)
      if (p >= 1) {
        window.clearInterval(id)
        setBuild(null)
        setLog((l) => [...l.slice(-30), '[12:02:10] Build succeeded: Arena.webgl (38.2 MB) in 2.6 s'])
        setToast('Build succeeded')
        window.setTimeout(() => setToast(null), 2600)
      }
    }, 60)
  }

  // Touch joystick
  const joy = useRef<{ cx: number; cy: number } | null>(null)
  const [knob, setKnob] = useState({ x: 0, y: 0 })
  const joyMove = (x: number, y: number) => {
    if (!joy.current) return
    let dx = x - joy.current.cx
    let dy = y - joy.current.cy
    const len = Math.hypot(dx, dy)
    if (len > 40) {
      dx = (dx / len) * 40
      dy = (dy / len) * 40
    }
    setKnob({ x: dx, y: dy })
    input.current = { x: dx / 40, z: dy / 40 }
  }

  const Panel = ({ title, children, className = '' }: { title: string; children: React.ReactNode; className?: string }) => (
    <div className={'flex min-h-0 flex-col bg-[#262a33] ' + className}>
      <div className="border-b border-black/30 px-2 py-1.5 text-[11px] font-bold uppercase tracking-wide text-[#9aa3b8]">{title}</div>
      <div className="thin-scroll min-h-0 flex-1 overflow-auto">{children}</div>
    </div>
  )
  return (
    <div className="flex h-full flex-col bg-[#1c1f26] text-[12px] text-[#d6dbe7]">
      <div className="flex h-10 shrink-0 items-center gap-1 border-b border-black/40 bg-[#2b303b] px-2">
        {(['move', 'rotate', 'scale'] as Mode[]).map((m) => (
          <button key={m} disabled={playing} onClick={() => setMode(m)} className={'min-h-[30px] rounded px-2.5 font-semibold capitalize ' + (mode === m ? 'bg-[#5B3FD9] text-white' : 'bg-white/5')}>
            {m}
          </button>
        ))}
        <button onClick={togglePlay} className={'mx-auto flex min-h-[30px] items-center gap-1.5 rounded px-4 font-bold ' + (playing ? 'bg-[#4cc3ff] text-[#002033]' : 'bg-white/10')}>
          {playing ? '■ Stop' : '▶ Play'}
        </button>
        <span className="hidden tabnum text-[#7ee2a8] sm:inline">60 fps</span>
        <button onClick={doBuild} disabled={build != null} className="min-h-[30px] rounded bg-white/10 px-3 font-semibold">
          {build != null ? `Building ${Math.round(build * 100)}%` : 'Build'}
        </button>
      </div>
      <div className="flex min-h-0 flex-1">
        {!mobile && (
          <Panel title="Hierarchy" className="w-40 shrink-0 border-r border-black/40">
            {hier.map((h) => (
              <button key={h} onClick={() => api.current?.select(h)} className={'block w-full px-3 py-1 text-left ' + (selName === h ? 'bg-[#5B3FD9]/50 text-white' : 'hover:bg-white/5')}>
                {h}
              </button>
            ))}
          </Panel>
        )}
        <div className="relative min-w-0 flex-1">
          <div ref={ref} className="absolute inset-0" />
          <div className="pointer-events-none absolute left-2 top-2 rounded bg-black/50 px-2 py-1 text-[11px] text-white">{playing ? 'Game' : 'Scene'} view</div>
          {playing && (
            <div className="pointer-events-none absolute right-2 top-2 rounded-lg bg-black/60 px-3 py-1.5 text-sm font-bold text-[#ffc83d] tabnum">
              Coins {coins} / 10 · <span className="text-[#7ee2a8]">60 fps</span>
            </div>
          )}
          {playing && mobile && (
            <div
              className="absolute bottom-4 left-4 h-28 w-28 rounded-full bg-white/10 ring-2 ring-white/20"
              style={{ touchAction: 'none' }}
              onPointerDown={(e) => {
                const r = e.currentTarget.getBoundingClientRect()
                joy.current = { cx: r.left + r.width / 2, cy: r.top + r.height / 2 }
                e.currentTarget.setPointerCapture(e.pointerId)
                joyMove(e.clientX, e.clientY)
              }}
              onPointerMove={(e) => joyMove(e.clientX, e.clientY)}
              onPointerUp={() => {
                joy.current = null
                setKnob({ x: 0, y: 0 })
                input.current = { x: 0, z: 0 }
              }}
            >
              <div className="absolute left-1/2 top-1/2 h-12 w-12 rounded-full bg-white/80 shadow-lg" style={{ transform: `translate(calc(-50% + ${knob.x}px), calc(-50% + ${knob.y}px))` }} />
            </div>
          )}
          {playing && !mobile && <div className="pointer-events-none absolute bottom-2 left-1/2 -translate-x-1/2 rounded bg-black/50 px-2 py-1 text-[11px]">Arrow keys or WASD to roll</div>}
          {toast && <div className="anim-pop absolute left-1/2 top-12 -translate-x-1/2 rounded-full bg-white px-4 py-2 text-[13px] font-semibold text-[#222] shadow-xl">{toast}</div>}
        </div>
        {!mobile && (
          <Panel title="Inspector" className="w-48 shrink-0 border-l border-black/40">
            <div className="p-2">
              <div className="mb-2 font-semibold text-white">{selName}</div>
              {(['x', 'y', 'z', 'r', 's'] as const).map((k) => (
                <label key={k} className="mb-1 flex items-center gap-2" htmlFor={`ge-${k}`}>
                  <span className="w-16 text-[#9aa3b8]">{{ x: 'Position X', y: 'Position Y', z: 'Position Z', r: 'Rotation Y', s: 'Scale' }[k]}</span>
                  <input
                    id={`ge-${k}`}
                    type="number"
                    step={k === 'r' ? 5 : 0.1}
                    value={tf[k]}
                    onChange={(e) => {
                      const t = { ...tf, [k]: Number(e.target.value) }
                      setTf(t)
                      api.current?.setTf(t)
                    }}
                    className="min-w-0 flex-1 rounded bg-black/30 px-1.5 py-1 tabnum outline-none ring-1 ring-white/10"
                  />
                </label>
              ))}
            </div>
          </Panel>
        )}
      </div>
      <div className={'flex shrink-0 border-t border-black/40 ' + (mobile ? 'h-16' : 'h-28')}>
        {!mobile && (
          <Panel title="Project" className="w-56 shrink-0 border-r border-black/40">
            <div className="grid grid-cols-3 gap-1 p-2 text-[10px]">
              {['Scenes', 'Scripts', 'Materials', 'Prefabs', 'Audio', 'Textures'].map((f) => (
                <div key={f} className="flex flex-col items-center gap-0.5 rounded p-1 hover:bg-white/5">
                  <span className="text-lg leading-none text-[#ffc83d]">▰</span>
                  {f}
                </div>
              ))}
            </div>
          </Panel>
        )}
        <Panel title="Console" className="min-w-0 flex-1">
          <div className="px-2 py-1 font-mono text-[11px] leading-[16px]">
            {log.slice(mobile ? -2 : -6).map((l, i) => (
              <div key={i} className={l.includes('succeeded') ? 'text-[#7ee2a8]' : ''}>
                {l}
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  )
}
