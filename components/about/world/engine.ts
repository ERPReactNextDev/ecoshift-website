import * as THREE from 'three'
import { Sky } from 'three/examples/jsm/objects/Sky.js'
import { createMats, createTextures, makeEnvironment, rng, type Mats, type Tex } from './helpers'
import {
  buildBuilding,
  buildCar,
  buildCoconut,
  buildCrane,
  buildMountain,
  buildStreetlight,
  buildTree,
  buildTruck,
  dashes,
  groundPlane,
  roadStrip,
  shade,
  slab,
  type CraneRig,
  type LampRig,
  type Variant
} from './models'
import { CHAPTERS, MAP_POINTS, MAP_ROUTE, MAP_CUM, chapterAt, clamp, ease, installState, lerp, reachState, routePoint, seg, solarState } from './content'

export interface WorldOptions {
  canvas: HTMLCanvasElement
  getProgress: () => number
  milestoneCount: number
  /** one element per MAP_POINTS entry; the engine moves them over the 3D pins */
  labelEls?: (HTMLElement | null)[]
}

export interface World {
  dispose(): void
  resize(): void
}

/* ------------------------------------------------------------------ */
/* Environment (sky, light, fog) per moment                            */
/* ------------------------------------------------------------------ */
interface Env {
  sky: boolean
  bg: number
  elev: number
  az: number
  sunColor: THREE.Color
  sunI: number
  moonI: number
  hemi: number
  envI: number
  exposure: number
  fog: THREE.Color
  fogD: number
  stars: number
}

const C = (hex: number) => new THREE.Color(hex)
const NIGHT_FOG = C(0x070b16)
const DAY_FOG = C(0xbcd6ee)
const DUSK_FOG = C(0xd99466)

function timeEnv(elev: number, az: number, base: Partial<Env> = {}): Env {
  const d = clamp((elev + 3) / 14)
  const tw = clamp(1 - Math.abs(elev - 2) / 12)
  const fog = NIGHT_FOG.clone().lerp(DAY_FOG, d).lerp(DUSK_FOG, tw * 0.75)
  return {
    sky: true,
    bg: 0x000000,
    elev,
    az,
    sunColor: C(0xffb274).lerp(C(0xfff1de), clamp(elev / 25)),
    sunI: 3.4 * d,
    moonI: 0.5 * (1 - d),
    hemi: 0.18 + 0.5 * d,
    envI: 0.22 + 0.7 * d,
    exposure: lerp(0.95, 0.72, d),
    fog,
    fogD: lerp(0.011, 0.0055, d),
    stars: 1 - clamp((elev + 4) / 10),
    ...base
  }
}

interface Out {
  pos: THREE.Vector3
  target: THREE.Vector3
  fov: number
  env: Env
  focus: THREE.Vector3
  lamps: LampRig[]
  labels?: THREE.Vector3[]
  labelOn?: boolean[]
}

interface Chapter {
  group: THREE.Group
  update(q: number, t: number): Out
}

interface Ctx {
  mats: Mats
  tex: Tex
  scene: THREE.Scene
  milestoneCount: number
}

const rad = (d: number) => (d * Math.PI) / 180

/* ------------------------------------------------------------------ */
/* 1. Story: a night road, lamps switch on one by one                  */
/* ------------------------------------------------------------------ */
function storyChapter(ctx: Ctx): Chapter {
  const { mats, tex, scene, milestoneCount } = ctx
  const g = new THREE.Group()
  scene.add(g)
  const r = rng(11)

  g.add(groundPlane(mats.ground.grass(70, 40), 40, 0, 360, 200, -0.02))
  g.add(roadStrip(mats, -80, 260, 8, 0))
  g.add(dashes(mats, 260, -80, 0, 3, 4, 'white'))
  for (const z of [-3.6, 3.6]) {
    const edge = new THREE.Mesh(new THREE.BoxGeometry(260, 0.012, 0.12), mats.paint.white)
    edge.position.set(50, 0.012, z)
    g.add(edge)
  }
  g.add(slab(mats.sidewalk, -80, 260, -5.3, 2.6, 0.15))
  g.add(slab(mats.sidewalk, -80, 260, 5.3, 2.6, 0.15))

  // buildings on the far side
  let x = -70
  while (x < 140) {
    const w = 9 + r() * 10
    const h = 9 + r() * 28
    const b = buildBuilding(mats, w, h, 11)
    b.position.set(x + w / 2, h / 2, -17 - r() * 4)
    g.add(b)
    x += w + 1.5 + r() * 3
  }
  // a few low shops on the near side + trees
  for (let k = 0; k < 9; k++) {
    const t = buildTree(mats, 20 + k)
    t.position.set(-60 + k * 20 + r() * 5, 0, -8.4)
    g.add(t)
  }

  const lamps: LampRig[] = []
  for (let i = 0; i < Math.max(2, milestoneCount); i++) {
    const rig = buildStreetlight('straight', mats, tex)
    const yaw = new THREE.Group()
    yaw.rotation.y = Math.PI / 2
    yaw.position.set(14 * i, 0, -4.7)
    yaw.add(rig.root)
    g.add(yaw)
    lamps.push(rig)
  }

  const out: Out = {
    pos: new THREE.Vector3(),
    target: new THREE.Vector3(),
    fov: 52,
    env: timeEnv(-10, 40, { sunI: 0, moonI: 0.55, hemi: 0.42, envI: 0.3, exposure: 1.0, fogD: 0.013, stars: 1 }),
    focus: new THREE.Vector3(),
    lamps
  }

  return {
    group: g,
    update(q) {
      const f = q * (Math.max(2, milestoneCount) - 1)
      lamps.forEach((l, i) => l.setLit(ease(clamp((f - i + 0.6) / 0.5))))
      const xc = 14 * f
      out.pos.set(xc - 8.5, 2.0, 7.4)
      out.target.set(xc + 5, 3.2, -4.5)
      out.focus.set(xc, 0, -2)
      return out
    }
  }
}

/* ------------------------------------------------------------------ */
/* 2. Anatomy: straight vs curved, part by part                        */
/* ------------------------------------------------------------------ */
function anatomyChapter(ctx: Ctx): Chapter {
  const { mats, tex, scene } = ctx
  const g = new THREE.Group()
  scene.add(g)
  const X0 = 300

  g.add(groundPlane(mats.ground.grass(70, 70), X0, 0, 400, 400, -0.02))
  const pad = new THREE.Mesh(new THREE.CylinderGeometry(9, 9, 0.3, 64), mats.concrete)
  pad.position.set(X0, -0.15, 0)
  pad.receiveShadow = true
  g.add(pad)
  const rim = new THREE.Mesh(new THREE.TorusGeometry(9, 0.08, 8, 96), mats.paint.yellow)
  rim.rotation.x = Math.PI / 2
  rim.position.set(X0, 0.01, 0)
  g.add(rim)
  for (let i = 0; i < 12; i++) {
    const t = buildTree(mats, 40 + i)
    const a = (i / 12) * Math.PI * 2 + 0.3
    t.position.set(X0 + Math.cos(a) * 44, 0, Math.sin(a) * 44 - 2)
    t.scale.setScalar(1.6)
    g.add(t)
  }
  for (let i = 0; i < 5; i++) {
    const m = buildMountain(mats, 60, 28 + i * 6, 70 + i)
    m.position.set(X0 - 160 + i * 80, 0, -190)
    g.add(m)
  }

  const straight = buildStreetlight('straight', mats, tex)
  const bent = buildStreetlight('bent', mats, tex)
  straight.root.position.set(X0 - 1.4, 0, 0)
  bent.root.position.set(X0 + 1.4, 0, 0)
  g.add(straight.root, bent.root)

  // highlight ring
  const ringMat = new THREE.SpriteMaterial({ map: tex.ring, color: 0xfbbf24, transparent: true, opacity: 0, depthTest: false, depthWrite: false })
  const ring = new THREE.Sprite(ringMat)
  ring.renderOrder = 10
  g.add(ring)

  const K = [
    { pos: [2.2 - 1.4, 7.4, 3.2], tgt: [0.3 - 1.4, 5.5, 0] },
    { pos: [-2.6 - 1.4, 6.5, 3.2], tgt: [-0.75 - 1.4, 5.15, 0] },
    { pos: [0, 5.9, 7.2], tgt: [0, 5.1, 0] },
    { pos: [1.6, 0.8, 9.2], tgt: [0, 2.9, 0] },
    { pos: [-1.4 + 1.0, 0.85, 1.6], tgt: [-1.4, 0.3, 0] }
  ]
  const ringAt = [
    new THREE.Vector3(X0 - 1.4 + 0.35, 5.75, 0),
    new THREE.Vector3(X0 - 1.4 - 0.78, 5.25, 0),
    null,
    null,
    new THREE.Vector3(X0 - 1.4, 0.3, 0)
  ]
  const ringSize = [0.95, 1.05, 0, 0, 0.7]

  const out: Out = {
    pos: new THREE.Vector3(),
    target: new THREE.Vector3(),
    fov: 40,
    env: timeEnv(6, 38, { exposure: 0.85, hemi: 0.95, envI: 0.9 }),
    focus: new THREE.Vector3(X0, 0, 0),
    lamps: [straight, bent]
  }

  return {
    group: g,
    update(q, t) {
      const n = 5
      const i = Math.min(n - 1, Math.floor(q * n))
      const u = q * n - i
      const s = i < n - 1 ? ease(seg(u, 0.6, 1)) : 0
      const a = K[i]
      const b = K[Math.min(n - 1, i + 1)]
      const mix = (k: 'pos' | 'tgt', idx: number) => lerp(a[k][idx], b[k][idx], s)
      out.pos.set(X0 + mix('pos', 0), mix('pos', 1), mix('pos', 2))
      out.target.set(X0 + mix('tgt', 0), mix('tgt', 1), mix('tgt', 2))
      out.fov = i === 3 ? 48 : 40

      const litT = ease(seg(q, 0.18, 0.25)) * (1 - ease(seg(q, 0.58, 0.62)))
      straight.setLit(litT * 0.9)
      bent.setLit(litT * 0.9)
      straight.panelMat.emissiveIntensity = i === 0 ? 0.1 : 0
      bent.panelMat.emissiveIntensity = i === 0 ? 0.1 : 0

      const sway = ease(seg(q, 0.58, 0.66)) * (1 - ease(seg(q, 0.8, 0.86)))
      straight.root.rotation.z = Math.sin(t * 1.7) * 0.022 * sway
      bent.root.rotation.z = Math.sin(t * 1.7 + 0.7) * 0.022 * sway

      const rp = ringAt[i]
      if (rp) {
        ring.visible = true
        ring.position.copy(rp)
        const pulse = 1 + Math.sin(t * 3.2) * 0.06
        ring.scale.setScalar(ringSize[i] * pulse)
        ringMat.opacity = 0.95 * (i < n - 1 ? 1 - ease(seg(u, 0.75, 0.95)) : 1)
      } else ring.visible = false

      out.focus.set(X0, 0, 0)
      return out
    }
  }
}

/* ------------------------------------------------------------------ */
/* 3. Solar: a day in the life                                         */
/* ------------------------------------------------------------------ */
function solarChapter(ctx: Ctx): Chapter {
  const { mats, tex, scene } = ctx
  const g = new THREE.Group()
  scene.add(g)
  const X0 = 600

  g.add(groundPlane(mats.ground.grass(80, 80), X0, 0, 460, 460, -0.02))
  g.add(roadStrip(mats, X0 - 120, 240, 7, -13))
  g.add(dashes(mats, 240, X0 - 120, -13, 3, 4, 'yellow'))
  const pad = new THREE.Mesh(new THREE.CylinderGeometry(3.2, 3.2, 0.12, 40), mats.concrete)
  pad.position.set(X0, -0.06, 0)
  pad.receiveShadow = true
  g.add(pad)
  for (let i = 0; i < 16; i++) {
    const t = buildTree(mats, 80 + i)
    const a = (i / 16) * Math.PI * 2
    t.position.set(X0 + Math.cos(a) * 34, 0, Math.sin(a) * 34 - 4)
    t.scale.setScalar(1.5)
    g.add(t)
  }
  for (let i = 0; i < 6; i++) {
    const m = buildMountain(mats, 70, 30 + (i % 3) * 8, 90 + i)
    m.position.set(X0 - 200 + i * 80, 0, -220)
    g.add(m)
  }

  const rig = buildStreetlight('bent', mats, tex, { battery: true })
  rig.root.position.set(X0, 0, 0)
  g.add(rig.root)

  // energy particles flowing along two paths (charging / discharging)
  const pathA = new THREE.CatmullRomCurve3([new THREE.Vector3(0.18, 4.72, 0.08), new THREE.Vector3(0.05, 4.4, 0.12), new THREE.Vector3(0, 3.4, 0.13), new THREE.Vector3(0, 2.3, 0.14)])
  const pathB = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 2.3, 0.14),
    new THREE.Vector3(0, 3.6, 0.13),
    new THREE.Vector3(0, 4.25, 0.1),
    new THREE.Vector3(-0.25, 5.3, 0.05),
    new THREE.Vector3(-0.85, 5.52, 0.02),
    new THREE.Vector3(-1.3, 5.46, 0)
  ])
  const N = 22
  const mkPoints = () => {
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(N * 3), 3))
    const mat = new THREE.PointsMaterial({ map: tex.glow, color: 0xffc247, size: 0.14, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })
    const pts = new THREE.Points(geo, mat)
    pts.frustumCulled = false
    rig.root.add(pts)
    return pts
  }
  const ptsA = mkPoints()
  const ptsB = mkPoints()
  const fill = (pts: THREE.Points, curve: THREE.Curve<THREE.Vector3>, phase: number) => {
    const a = pts.geometry.attributes.position as THREE.BufferAttribute
    const v = new THREE.Vector3()
    for (let i = 0; i < N; i++) {
      curve.getPoint((i / N + phase) % 1, v)
      a.setXYZ(i, v.x, v.y, v.z)
    }
    a.needsUpdate = true
  }

  const out: Out = {
    pos: new THREE.Vector3(),
    target: new THREE.Vector3(),
    fov: 40,
    env: timeEnv(0, 90),
    focus: new THREE.Vector3(X0, 0, 0),
    lamps: [rig]
  }

  return {
    group: g,
    update(q, t) {
      const st = solarState(q)
      out.env = timeEnv(st.elev, st.az)
      rig.setLit(st.lit)
      rig.panelMat.emissiveIntensity = st.sunUp * 0.28
      if (rig.battery) {
        const b = Math.max(0.05, st.battery)
        rig.battery.bar.scale.y = b
        rig.battery.bar.position.y = -0.2 + 0.2 * b
        const m = rig.battery.bar.material as THREE.MeshStandardMaterial
        m.color.setHex(b > 0.35 ? 0x22c55e : 0xf59e0b)
        m.emissive.setHex(b > 0.35 ? 0x22c55e : 0xf59e0b)
      }
      const flow = q * 16 + t * 0.15
      ptsA.visible = st.charging
      ptsB.visible = st.discharging
      if (st.charging) fill(ptsA, pathA, flow)
      if (st.discharging) fill(ptsB, pathB, flow)

      const a = lerp(-0.45, 0.35, q) + 0.55
      out.pos.set(X0 + 8.6 * Math.sin(a), 3.3, 8.6 * Math.cos(a))
      out.target.set(X0 - 0.2, 3.4, 0)
      return out
    }
  }
}

/* ------------------------------------------------------------------ */
/* 4. Truck: scroll along a very long trailer                          */
/* ------------------------------------------------------------------ */
function truckChapter(ctx: Ctx): Chapter {
  const { mats, tex, scene } = ctx
  const g = new THREE.Group()
  scene.add(g)
  const X0 = 900
  const r = rng(31)

  g.add(groundPlane(mats.ground.grass(100, 60), X0 + 20, 0, 420, 300, -0.02))
  g.add(roadStrip(mats, X0 - 120, 300, 10, 0))
  g.add(dashes(mats, 300, X0 - 120, 0, 3.5, 5, 'yellow'))
  for (const z of [-4.5, 4.5]) {
    const edge = new THREE.Mesh(new THREE.BoxGeometry(300, 0.012, 0.14), mats.paint.white)
    edge.position.set(X0 + 30, 0.012, z)
    g.add(edge)
  }
  g.add(groundPlane(mats.ground.dirt(60, 3), X0 + 30, 6.2, 300, 3, 0.002))
  g.add(groundPlane(mats.ground.dirt(60, 3), X0 + 30, -6.2, 300, 3, 0.002))
  for (let k = 0; k < 18; k++) {
    const t = buildTree(mats, 120 + k)
    t.position.set(X0 - 70 + k * 12 + r() * 4, 0, -14 - r() * 6)
    t.scale.setScalar(1.3)
    g.add(t)
  }
  for (let i = 0; i < 6; i++) {
    const m = buildMountain(mats, 70, 34 + (i % 3) * 10, 130 + i)
    m.position.set(X0 - 140 + i * 70, 0, -150)
    g.add(m)
  }

  const truck = buildTruck(mats, tex)
  truck.group.position.set(X0, 0, 0)
  g.add(truck.group)

  const out: Out = {
    pos: new THREE.Vector3(),
    target: new THREE.Vector3(),
    fov: 50,
    env: timeEnv(36, 40, { exposure: 0.72, hemi: 0.85, envI: 0.9 }),
    focus: new THREE.Vector3(),
    lamps: []
  }

  return {
    group: g,
    update(q, t) {
      const cx = lerp(-3.5, 17.5, ease(q))
      out.pos.set(X0 + cx, lerp(2.4, 2.8, q), lerp(12, 10, q))
      out.target.set(X0 + cx + 2.5, 1.7, 0)
      out.focus.set(X0 + cx, 0, 0)
      const spin = -q * 140
      truck.wheels.forEach(w => (w.rotation.z = spin))
      truck.group.position.y = Math.sin(t * 24) * 0.0025
      return out
    }
  }
}

/* ------------------------------------------------------------------ */
/* 5. Reach: a 3D map of the islands and the delivery route            */
/* ------------------------------------------------------------------ */
// [cx, cy, rx, ry, rot, region]
const ISLANDS: [number, number, number, number, number, number][] = [
  [105, 78, 62, 46, 0, 0],
  [98, 132, 12, 18, 20, 0],
  [58, 185, 9, 50, 28, 0],
  [150, 176, 17, 12, 0, 1],
  [158, 203, 10, 20, 15, 1],
  [178, 190, 6, 20, 0, 1],
  [206, 166, 14, 22, 0, 1],
  [198, 192, 9, 15, 0, 1],
  [190, 214, 9, 8, 0, 1],
  [222, 305, 62, 44, 0, 2],
  [160, 348, 9, 6, 0, 2],
  [138, 360, 6, 4, 0, 2]
]

const MAP_S = 0.1
const mapX = (x: number) => (x - 160) * MAP_S
const mapZ = (y: number) => (y - 195) * MAP_S

function reachChapter(ctx: Ctx): Chapter {
  const { mats, tex, scene } = ctx
  const g = new THREE.Group()
  scene.add(g)
  const X0 = 1200

  const ocean = new THREE.Mesh(new THREE.PlaneGeometry(120, 120), mats.ocean)
  ocean.rotation.x = -Math.PI / 2
  ocean.position.set(X0, -0.05, 0)
  ocean.receiveShadow = true
  g.add(ocean)

  const regionMats = [0, 1, 2].map(() => mats.island.clone())
  const hillMats = [0, 1, 2].map(() => new THREE.MeshStandardMaterial({ color: 0x2f6b3b, roughness: 0.95 }))
  const makeShape = (cx: number, cy: number, rx: number, ry: number, rot: number, seed: number, k: number) => {
    const r = rng(seed)
    const shape = new THREE.Shape()
    const N = 36
    const ph1 = r() * 6
    const ph2 = r() * 6
    const cr = Math.cos(rad(rot))
    const sr = Math.sin(rad(rot))
    for (let i = 0; i < N; i++) {
      const a = (i / N) * Math.PI * 2
      const j = 1 + 0.13 * Math.sin(3 * a + ph1) + 0.08 * Math.sin(5 * a + ph2) + (r() - 0.5) * 0.05
      const lx = Math.cos(a) * rx * j * k
      const ly = Math.sin(a) * ry * j * k
      const x = cx + lx * cr - ly * sr
      const y = cy + lx * sr + ly * cr
      if (i === 0) shape.moveTo(mapX(x), -mapZ(y))
      else shape.lineTo(mapX(x), -mapZ(y))
    }
    shape.closePath()
    return shape
  }
  const extrude = (shape: THREE.Shape, depth: number, bevel: number) => {
    const geo = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: true, bevelThickness: bevel, bevelSize: bevel * 1.2, bevelSegments: 2, curveSegments: 24 })
    geo.rotateX(-Math.PI / 2)
    return geo
  }
  ISLANDS.forEach(([cx, cy, rx, ry, rot, region], idx) => {
    const m = new THREE.Mesh(extrude(makeShape(cx, cy, rx, ry, rot, 500 + idx, 1), 0.22, 0.05), regionMats[region])
    m.position.set(X0, 0, 0)
    m.castShadow = true
    m.receiveShadow = true
    g.add(m)
    if (rx > 25) {
      const hill = new THREE.Mesh(extrude(makeShape(cx, cy, rx, ry, rot + 15, 900 + idx, 0.55), 0.34, 0.12), hillMats[region])
      hill.position.set(X0, 0.24, 0)
      hill.castShadow = true
      hill.receiveShadow = true
      g.add(hill)
    }
  })

  // route tube
  const routePts = MAP_ROUTE.map(([x, y]) => new THREE.Vector3(X0 + mapX(x), 0.8, mapZ(y)))
  const path = new THREE.CurvePath<THREE.Vector3>()
  for (let i = 0; i < routePts.length - 1; i++) path.add(new THREE.LineCurve3(routePts[i], routePts[i + 1]))
  const routeGeo = new THREE.TubeGeometry(path, 160, 0.045, 8, false)
  const route = new THREE.Mesh(routeGeo, new THREE.MeshBasicMaterial({ color: 0xfbbf24 }))
  g.add(route)
  const routeBase = new THREE.Mesh(new THREE.TubeGeometry(path, 80, 0.02, 6, false), new THREE.MeshBasicMaterial({ color: 0xbbf7d0, transparent: true, opacity: 0.35 }))
  g.add(routeBase)
  const idxCount = routeGeo.index ? routeGeo.index.count : 0

  // pins
  const pins: { grp: THREE.Group; th: number }[] = MAP_POINTS.map((p, i) => {
    const grp = new THREE.Group()
    grp.position.set(X0 + mapX(p.x), 0.66, mapZ(p.y))
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.6, 8), mats.chrome)
    stem.position.y = 0.3
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.17, 18, 14), new THREE.MeshStandardMaterial({ color: 0xfbbf24, emissive: new THREE.Color(0xfbbf24), emissiveIntensity: 1.2 }))
    head.position.y = 0.68
    const ringM = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex.ring, color: 0xfde68a, transparent: true, opacity: 0.8, depthWrite: false }))
    ringM.scale.setScalar(1.3)
    ringM.position.y = 0.05
    grp.add(stem, head, ringM)
    g.add(grp)
    return { grp, th: i < 2 ? 0 : i === 2 ? MAP_CUM[1] : i === 3 ? MAP_CUM[2] : 1 }
  })

  const truck = buildTruck(mats, tex)
  truck.group.scale.setScalar(0.05)
  g.add(truck.group)

  const labels = MAP_POINTS.map(() => new THREE.Vector3())
  const labelOn = MAP_POINTS.map(() => false)
  const tmp = new THREE.Vector3()
  const out: Out = {
    pos: new THREE.Vector3(),
    target: new THREE.Vector3(),
    fov: 38,
    env: timeEnv(45, 60, { sky: false, bg: 0x06222d, sunColor: C(0xfff3de), sunI: 3.1, moonI: 0, hemi: 0.9, envI: 0.5, exposure: 0.85, fog: C(0x06222d), fogD: 0.004, stars: 0 }),
    focus: new THREE.Vector3(X0, 0, 0),
    lamps: [],
    labels,
    labelOn
  }

  return {
    group: g,
    update(q, t) {
      const { region, r } = reachState(q)
      const [px, py] = routePoint(r)
      const wx = X0 + mapX(px)
      const wz = mapZ(py)
      const [px2, py2] = routePoint(Math.min(1, r + 0.01))
      const dx = mapX(px2) - mapX(px)
      const dz = mapZ(py2) - mapZ(py)
      truck.group.position.set(wx, 0.66, wz)
      if (Math.abs(dx) + Math.abs(dz) > 1e-6) truck.group.rotation.y = Math.atan2(-dz, dx)
      truck.wheels.forEach(w => (w.rotation.z = -r * 400))

      route.geometry.setDrawRange(0, Math.floor((r * idxCount) / 3) * 3)
      hillMats.forEach(m => m.emissive.setHex(0x0a2a12))
      regionMats.forEach((m, i) => {
        const on = i === region
        m.emissive.setHex(0x1f7a3a)
        m.emissiveIntensity = on ? 0.42 + Math.sin(t * 2) * 0.05 : 0.02
      })

      pins.forEach((p, i) => {
        const on = r >= p.th - 0.02
        const s = on ? 1 : 0.0001
        p.grp.scale.setScalar(lerp(p.grp.scale.x, s, 0.2))
        labelOn[i] = on
        tmp.set(p.grp.position.x, 0.95, p.grp.position.z)
        labels[i].copy(tmp)
      })

      // camera follows the truck from above
      const cxw = lerp(X0 + mapX(105), wx, 0.8)
      const czw = lerp(mapZ(78), wz, 0.8)
      out.target.set(cxw, 0, czw)
      out.pos.set(cxw + 1.5, 17, czw + 13)
      out.fov = 36
      return out
    }
  }
}

/* ------------------------------------------------------------------ */
/* 6. Install: city, highway, provincial road                          */
/* ------------------------------------------------------------------ */
interface ActRig {
  group: THREE.Group
  rigs: LampRig[]
  tilts: THREE.Group[]
  yaws: THREE.Group[]
  blocks: THREE.Mesh[]
  crane: CraneRig
  slotX: number[]
  poleZ: number
  scale: number
  camZ: number
  X: number
}

function buildAct(ctx: Ctx, idx: number): ActRig {
  const { mats, tex } = ctx
  const g = new THREE.Group()
  const X = 1500 + idx * 200
  const r = rng(700 + idx)
  const variant: Variant = idx === 1 ? 'bent' : 'straight'
  const poleZ = [-4.9, -8.4, -3.9][idx]
  const scale = [1, 1.3, 0.92][idx]
  const camZ = [7, 12, 7.5][idx]

  if (idx === 0) {
    // city street
    g.add(groundPlane(mats.ground.grass(60, 30), X, 0, 300, 160, -0.02))
    g.add(roadStrip(mats, X - 90, 180, 8, 0))
    g.add(dashes(mats, 180, X - 90, 0, 3, 4, 'white'))
    for (const z of [-3.6, 3.6]) {
      const e = new THREE.Mesh(new THREE.BoxGeometry(180, 0.012, 0.12), mats.paint.white)
      e.position.set(X, 0.012, z)
      g.add(e)
    }
    g.add(slab(mats.sidewalk, X - 90, 180, -5.4, 2.8, 0.15))
    g.add(slab(mats.sidewalk, X - 90, 180, 5.4, 2.8, 0.15))
    let x = X - 85
    while (x < X + 85) {
      const w = 9 + r() * 9
      const h = 10 + r() * 26
      const b = buildBuilding(mats, w, h, 11)
      b.position.set(x + w / 2, h / 2, -17.5 - r() * 3)
      g.add(b)
      x += w + 1.5 + r() * 3
    }
    for (let k = 0; k < 8; k++) {
      const t = buildTree(mats, 200 + k)
      t.position.set(X - 70 + k * 20, 0, -8.6)
      g.add(t)
    }
    for (let k = 0; k < 3; k++) {
      const car = buildCar(mats)
      car.position.set(X + [-52, 50, 78][k] + r() * 4, 0, k % 2 ? 1.9 : -1.9)
      car.rotation.y = k % 2 ? Math.PI : 0
      g.add(car)
    }
  } else if (idx === 1) {
    // highway
    g.add(groundPlane(mats.ground.grass(60, 30), X, 0, 300, 200, -0.02))
    g.add(roadStrip(mats, X - 90, 180, 14, 0))
    g.add(slab(mats.sidewalk, X - 90, 180, -8.4, 2.2, 0.06)) // paved shoulder
    for (const z of [-2.3, 2.3]) g.add(dashes(mats, 180, X - 90, z, 3.5, 5, 'white'))
    for (const z of [-6.9, 6.9]) {
      const e = new THREE.Mesh(new THREE.BoxGeometry(180, 0.012, 0.16), mats.paint.white)
      e.position.set(X, 0.012, z)
      g.add(e)
    }
    // guardrail on the far side
    const rail = new THREE.Mesh(new THREE.BoxGeometry(180, 0.3, 0.06), mats.galv)
    rail.position.set(X, 0.65, -9.9)
    g.add(rail)
    const posts = new THREE.InstancedMesh(new THREE.BoxGeometry(0.09, 0.75, 0.09), mats.steelDark, 45)
    const mm = new THREE.Matrix4()
    for (let k = 0; k < 45; k++) {
      mm.makeTranslation(X - 88 + k * 4, 0.37, -9.9)
      posts.setMatrixAt(k, mm)
    }
    g.add(posts)
    for (let i = 0; i < 6; i++) {
      const m = buildMountain(mats, 70, 34 + (i % 3) * 9, 300 + i)
      m.position.set(X - 150 + i * 60, 0, -130)
      g.add(m)
    }
    for (let k = 0; k < 10; k++) {
      const t = buildTree(mats, 260 + k)
      t.position.set(X - 80 + k * 17, 0, -16 - r() * 6)
      t.scale.setScalar(1.4)
      g.add(t)
    }
  } else {
    // provincial road
    g.add(groundPlane(mats.ground.paddy(70, 28), X, 0, 300, 180, -0.02))
    g.add(roadStrip(mats, X - 90, 180, 5.6, 0))
    g.add(dashes(mats, 180, X - 90, 0, 2.6, 4, 'yellow'))
    g.add(groundPlane(mats.ground.dirt(60, 2), X, -3.9, 180, 2.4, 0.003))
    g.add(groundPlane(mats.ground.dirt(60, 2), X, 3.9, 180, 2.4, 0.003))
    for (let k = 0; k < 11; k++) {
      const c = buildCoconut(mats, 400 + k)
      c.position.set(X - 82 + k * 16 + r() * 5, 0, -9 - r() * 8)
      g.add(c)
    }
    // nipa hut
    const hut = new THREE.Group()
    const walls = new THREE.Mesh(new THREE.BoxGeometry(4.2, 2.2, 3.4), new THREE.MeshStandardMaterial({ color: 0x8a6a43, roughness: 0.95 }))
    walls.position.y = 1.3
    const roof = new THREE.Mesh(new THREE.ConeGeometry(3.9, 1.9, 4), new THREE.MeshStandardMaterial({ color: 0xa8873f, roughness: 1 }))
    roof.position.y = 3.35
    roof.rotation.y = Math.PI / 4
    const stilts = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.4, 3.4), mats.trunk)
    stilts.position.y = 0.2
    hut.add(walls, roof, stilts)
    hut.position.set(X + 22, 0, -16)
    shade(hut)
    g.add(hut)
    for (let i = 0; i < 7; i++) {
      const m = buildMountain(mats, 65, 36 + (i % 3) * 10, 350 + i)
      m.position.set(X - 170 + i * 58, 0, -125)
      g.add(m)
    }
  }

  const slotX = [-14, 0, 14].map(d => X + d)
  const rigs: LampRig[] = []
  const tilts: THREE.Group[] = []
  const yaws: THREE.Group[] = []
  const blocks: THREE.Mesh[] = []
  slotX.forEach(sx => {
    const rig = buildStreetlight(variant, mats, tex)
    const tilt = new THREE.Group()
    tilt.position.set(sx, 0, poleZ)
    const yaw = new THREE.Group()
    yaw.rotation.y = Math.PI / 2
    yaw.scale.setScalar(scale)
    yaw.add(rig.root)
    tilt.add(yaw)
    g.add(tilt)
    const block = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.3, 0.24, 24), mats.concrete)
    block.position.set(sx, 0.12, poleZ)
    block.castShadow = true
    block.receiveShadow = true
    g.add(block)
    rigs.push(rig)
    tilts.push(tilt)
    yaws.push(yaw)
    blocks.push(block)
  })

  const crane = buildCrane(mats)
  crane.group.position.set(slotX[0] - 8.2, 0, poleZ)
  g.add(crane.group)

  return { group: g, rigs, tilts, yaws, blocks, crane, slotX, poleZ, scale, camZ, X }
}

function installChapter(ctx: Ctx): Chapter {
  const acts = [0, 1, 2].map(i => buildAct(ctx, i))
  const group = new THREE.Group()
  acts.forEach(a => group.add(a.group))
  const out: Out = {
    pos: new THREE.Vector3(),
    target: new THREE.Vector3(),
    fov: 46,
    env: timeEnv(3, 40),
    focus: new THREE.Vector3(),
    lamps: []
  }
  const sunEl = [3, 2, 4]
  const tipW = new THREE.Vector3()
  const attachW = new THREE.Vector3()
  const attachL = new THREE.Vector3()

  return {
    group,
    update(q) {
      const st = installState(q)
      const act = acts[st.act]
      acts.forEach((a, i) => (a.group.visible = i === st.act))

      act.rigs.forEach((rig, i) => {
        const s = st.stages[i]
        const found = ease(seg(s, 0, 0.2))
        const L = ease(seg(s, 0.22, 0.55))
        const M = ease(seg(s, 0.55, 0.75))
        const lit = ease(seg(s, 0.78, 0.92))
        const poleOn = s > 0.2
        act.blocks[i].visible = s > 0 && !poleOn
        act.blocks[i].scale.y = Math.max(0.001, found)
        act.blocks[i].position.y = 0.12 * Math.max(0.001, found)
        act.tilts[i].visible = poleOn
        act.tilts[i].rotation.z = rad(82) * (1 - L)
        rig.top.position.y = 2.4 * (1 - M)
        rig.top.visible = M > 0.01
        rig.setLit(lit)
      })

      // crane works on the current pole
      const cur = st.cur
      const craneOn = cur >= 0 && st.stages[cur] > 0.1 && st.stages[cur] < 0.88
      act.crane.group.visible = craneOn
      if (craneOn) {
        const sx = act.slotX[cur]
        act.crane.group.position.set(sx - 8.2, 0, act.poleZ)
        const L = ease(seg(st.stages[cur], 0.22, 0.55))
        const theta = rad(82) * (1 - L)
        const H = act.rigs[cur].poleHeight * act.scale
        attachW.set(sx - Math.sin(theta) * H * 0.78, Math.cos(theta) * H * 0.78, act.poleZ)
        tipW.copy(act.crane.tipLocal)
        act.crane.group.localToWorld(tipW)
        attachL.copy(attachW)
        act.crane.group.worldToLocal(attachL)
        const pos = act.crane.cable.geometry.attributes.position as THREE.BufferAttribute
        pos.setXYZ(0, act.crane.tipLocal.x, act.crane.tipLocal.y, act.crane.tipLocal.z)
        pos.setXYZ(1, attachL.x, attachL.y, attachL.z)
        pos.needsUpdate = true
      }

      const fx = act.X + lerp(-14, 14, ease(st.t))
      out.pos.set(fx - 5.5, 3.4, act.camZ)
      out.target.set(fx - 3.0, 3.0, act.poleZ + 1)
      out.fov = 52
      out.focus.set(fx, 0, 0)
      out.env = timeEnv(sunEl[st.act], 40, { exposure: 0.95, hemi: 0.95, envI: 0.8 })
      out.lamps = act.rigs
      return out
    }
  }
}

/* ------------------------------------------------------------------ */
/* World                                                               */
/* ------------------------------------------------------------------ */
export function createWorld(opts: WorldOptions): World {
  const { canvas, getProgress, milestoneCount, labelEls } = opts
  const small = Math.min(window.innerWidth, window.innerHeight) < 700

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: !small, powerPreference: 'high-performance' })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, small ? 1.5 : 1.75))
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap

  const scene = new THREE.Scene()
  scene.fog = new THREE.FogExp2(0x070b16, 0.01)
  const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 3500)

  const envTex = makeEnvironment(renderer)
  const tex = createTextures()
  const mats = createMats(envTex, tex)
  const envMats: { m: THREE.MeshStandardMaterial; base: number }[] = []
  const collect = (o: unknown) => {
    if (!o || typeof o !== 'object') return
    if ((o as THREE.Material).isMaterial) {
      const m = o as THREE.MeshStandardMaterial
      if (m.envMap) envMats.push({ m, base: m.envMapIntensity })
      return
    }
    if (typeof o === 'function') return
    Object.values(o as Record<string, unknown>).forEach(collect)
  }
  collect(mats)

  /* sky + stars */
  const sky = new Sky()
  sky.scale.setScalar(1500)
  const su = sky.material.uniforms
  su['turbidity'].value = 6
  su['rayleigh'].value = 1.6
  su['mieCoefficient'].value = 0.006
  su['mieDirectionalG'].value = 0.85
  scene.add(sky)

  const starGeo = new THREE.BufferGeometry()
  {
    const r = rng(77)
    const arr = new Float32Array(900 * 3)
    for (let i = 0; i < 900; i++) {
      const u = r() * 2 - 1
      const th = r() * Math.PI * 2
      const s = Math.sqrt(1 - u * u)
      const y = Math.abs(u)
      arr[i * 3] = s * Math.cos(th) * 1100
      arr[i * 3 + 1] = y * 1100
      arr[i * 3 + 2] = s * Math.sin(th) * 1100
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(arr, 3))
  }
  const starMat = new THREE.PointsMaterial({ color: 0xffffff, size: 1.6, sizeAttenuation: false, transparent: true, opacity: 0, depthWrite: false, fog: false })
  const stars = new THREE.Points(starGeo, starMat)
  stars.frustumCulled = false
  scene.add(stars)

  /* lights */
  const hemi = new THREE.HemisphereLight(0xbcd3ff, 0x3a3a2a, 0.5)
  scene.add(hemi)
  const sun = new THREE.DirectionalLight(0xffffff, 2)
  sun.castShadow = true
  const shadowSize = small ? 1024 : 2048
  sun.shadow.mapSize.set(shadowSize, shadowSize)
  sun.shadow.camera.near = 1
  sun.shadow.camera.far = 220
  const SH = 26
  sun.shadow.camera.left = -SH
  sun.shadow.camera.right = SH
  sun.shadow.camera.top = SH
  sun.shadow.camera.bottom = -SH
  sun.shadow.bias = -0.0004
  sun.shadow.normalBias = 0.04
  scene.add(sun, sun.target)

  const spots: THREE.SpotLight[] = []
  for (let i = 0; i < 3; i++) {
    const s = new THREE.SpotLight(0xffd9a0, 0, 24, 0.9, 0.65, 2)
    s.castShadow = false
    scene.add(s, s.target)
    spots.push(s)
  }

  /* chapters */
  const ctx: Ctx = { mats, tex, scene, milestoneCount }
  const chapters: Chapter[] = [storyChapter(ctx), anatomyChapter(ctx), solarChapter(ctx), truckChapter(ctx), reachChapter(ctx), installChapter(ctx)]
  scene.add(chapters[5].group)

  /* sizing */
  let w = 1
  let h = 1
  const resize = () => {
    const el = canvas.parentElement
    w = Math.max(1, (el ? el.clientWidth : canvas.clientWidth) || 1)
    h = Math.max(1, (el ? el.clientHeight : canvas.clientHeight) || 1)
    renderer.setSize(w, h, false)
    camera.aspect = w / h
    camera.updateProjectionMatrix()
  }
  resize()
  const ro = new ResizeObserver(resize)
  if (canvas.parentElement) ro.observe(canvas.parentElement)

  let visible = true
  const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting), { rootMargin: '200px' })
  io.observe(canvas)

  /* helpers per frame */
  const dir = new THREE.Vector3()
  const tmpV = new THREE.Vector3()
  const sunDir = (elev: number, az: number) => dir.setFromSphericalCoords(1, rad(90 - elev), rad(az))

  const applyEnv = (env: Env, focus: THREE.Vector3) => {
    scene.background = env.sky ? null : new THREE.Color(env.bg)
    sky.visible = env.sky
    su['sunPosition'].value.copy(sunDir(env.elev, env.az))
    renderer.toneMappingExposure = env.exposure

    const night = env.elev < 0
    if (night) {
      sun.color.setHex(0x86a4ff)
      sun.intensity = env.moonI
      sunDir(42, env.az + 180)
    } else {
      sun.color.copy(env.sunColor)
      sun.intensity = env.sunI
      sunDir(env.elev, env.az)
    }
    sun.target.position.copy(focus)
    sun.position.copy(focus).addScaledVector(dir, 90)
    sun.target.updateMatrixWorld()

    hemi.intensity = env.hemi
    hemi.color.copy(env.fog).lerp(C(0xbcd3ff), 0.4)
    ;(scene.fog as THREE.FogExp2).color.copy(env.fog)
    ;(scene.fog as THREE.FogExp2).density = env.fogD
    starMat.opacity = env.stars
    envMats.forEach(e => (e.m.envMapIntensity = e.base * env.envI * 1.6))
  }

  const assignSpots = (lamps: LampRig[]) => {
    const scored = lamps
      .filter(l => l.lit > 0.02 && l.root.visible)
      .map(l => {
        l.root.localToWorld(tmpV.copy(l.lensLocal))
        return { l, d: tmpV.distanceToSquared(camera.position), x: tmpV.x, y: tmpV.y, z: tmpV.z }
      })
      .sort((a, b) => a.d / (a.l.lit + 0.01) - b.d / (b.l.lit + 0.01))
    spots.forEach((s, i) => {
      const e = scored[i]
      if (!e) {
        s.intensity = 0
        return
      }
      s.position.set(e.x, e.y, e.z)
      s.target.position.set(e.x, 0, e.z)
      s.target.updateMatrixWorld()
      s.intensity = e.l.lit * 320
    })
  }

  const proj = new THREE.Vector3()
  const updateLabels = (out: Out) => {
    if (!labelEls) return
    labelEls.forEach((el, i) => {
      if (!el) return
      if (!out.labels || !out.labelOn) {
        el.style.opacity = '0'
        return
      }
      proj.copy(out.labels[i]).project(camera)
      const vis = out.labelOn[i] && proj.z < 1 && Math.abs(proj.x) < 1.1 && Math.abs(proj.y) < 1.1
      el.style.opacity = vis ? '1' : '0'
      el.style.transform = `translate3d(${((proj.x + 1) / 2) * w}px, ${((1 - proj.y) / 2) * h}px, 0) translate(-50%, -100%)`
    })
  }

  let cur = getProgress()
  let last = performance.now()
  let raf = 0
  let disposed = false

  const frame = (now: number) => {
    if (disposed) return
    raf = requestAnimationFrame(frame)
    const dt = Math.min(0.1, (now - last) / 1000)
    last = now
    if (!visible || document.hidden) return

    const target = getProgress()
    cur += (target - cur) * (1 - Math.exp(-dt * 7))
    if (Math.abs(target - cur) < 0.00005) cur = target

    const { i, q } = chapterAt(cur)
    chapters.forEach((c, k) => (c.group.visible = k === i))
    const t = now / 1000
    const out = chapters[i].update(q, t)

    const aspect = camera.aspect
    const fov = out.fov * (aspect < 1.25 ? Math.min(1.8, Math.pow(1.25 / aspect, 0.6)) : 1)
    if (Math.abs(camera.fov - fov) > 0.01) {
      camera.fov = fov
      camera.updateProjectionMatrix()
    }
    camera.position.set(out.pos.x + Math.sin(t * 0.35) * 0.035, out.pos.y + Math.cos(t * 0.3) * 0.025, out.pos.z)
    camera.lookAt(out.target)
    camera.updateMatrixWorld()

    applyEnv(out.env, out.focus)
    sky.position.copy(camera.position)
    stars.position.copy(camera.position)
    assignSpots(out.lamps)
    updateLabels(out)

    renderer.render(scene, camera)
  }
  raf = requestAnimationFrame(frame)

  return {
    resize,
    dispose() {
      disposed = true
      cancelAnimationFrame(raf)
      ro.disconnect()
      io.disconnect()
      scene.traverse(o => {
        const m = o as THREE.Mesh
        if (m.geometry) m.geometry.dispose()
      })
      envTex?.dispose()
      renderer.dispose()
      renderer.forceContextLoss()
    }
  }
}

export const CHAPTER_COUNT = CHAPTERS.length