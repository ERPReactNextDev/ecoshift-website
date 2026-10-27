import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'
import { rng, type Mats, type Tex } from './helpers'

export type Variant = 'straight' | 'bent'

/** Mark every mesh under obj as shadow caster/receiver. */
export function shade<T extends THREE.Object3D>(obj: T, cast = true, receive = true): T {
  obj.traverse(o => {
    if ((o as THREE.Mesh).isMesh) {
      o.castShadow = cast
      o.receiveShadow = receive
    }
  })
  return obj
}

export function cylBetween(a: THREE.Vector3, b: THREE.Vector3, r: number, mat: THREE.Material, seg = 10) {
  const dir = new THREE.Vector3().subVectors(b, a)
  const len = dir.length()
  const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, len, seg), mat)
  m.position.copy(a).addScaledVector(dir, 0.5)
  m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize())
  return m
}

/* ------------------------------------------------------------------ */
/* Solar streetlight                                                   */
/* ------------------------------------------------------------------ */
export interface LampRig {
  root: THREE.Group
  /** lamp head + panel + struts: slides in during installation */
  top: THREE.Group
  variant: Variant
  lensMat: THREE.MeshStandardMaterial
  panelMat: THREE.MeshPhysicalMaterial
  cone: THREE.Mesh
  pool: THREE.Mesh
  halo: THREE.Sprite
  /** where the light comes from, in root-local coordinates */
  lensLocal: THREE.Vector3
  anchors: Record<'panel' | 'head' | 'arm' | 'pole' | 'base', THREE.Vector3>
  /** battery hatch (only built when requested) */
  battery?: { bar: THREE.Mesh; box: THREE.Group }
  poleHeight: number
  lit: number
  setLit(v: number): void
}

export function buildStreetlight(variant: Variant, mats: Mats, tex: Tex, opts: { battery?: boolean } = {}): LampRig {
  const root = new THREE.Group()
  const top = new THREE.Group()
  root.add(top)

  const H = variant === 'straight' ? 5.4 : 5.5
  const poleMat = mats.galv

  /* --- base: concrete plinth, plate, flange, bolts --- */
  const base = new THREE.Group()
  const plinth = new THREE.Mesh(new THREE.CylinderGeometry(0.27, 0.3, 0.24, 28), mats.concrete)
  plinth.position.y = 0.12
  const plate = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.025, 28), poleMat)
  plate.position.y = 0.2525
  const flange = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.16, 0.14, 24), poleMat)
  flange.position.y = 0.335
  base.add(plinth, plate, flange)
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + Math.PI / 4
    const bolt = new THREE.Mesh(new THREE.CylinderGeometry(0.011, 0.011, 0.075, 8), mats.chrome)
    bolt.position.set(Math.cos(a) * 0.135, 0.29, Math.sin(a) * 0.135)
    const nut = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.016, 6), mats.chrome)
    nut.position.set(Math.cos(a) * 0.135, 0.33, Math.sin(a) * 0.135)
    base.add(bolt, nut)
  }
  root.add(base)

  /* --- pole --- */
  const pole = new THREE.Group()
  const lowerH = variant === 'straight' ? H : 4.2
  const lower = new THREE.Mesh(new THREE.CylinderGeometry(variant === 'straight' ? 0.05 : 0.056, 0.078, lowerH, 24), poleMat)
  lower.position.y = lowerH / 2
  pole.add(lower)
  root.add(pole)

  /* --- arm + head --- */
  const arm = new THREE.Group()
  let headCenter: THREE.Vector3
  if (variant === 'straight') {
    const a = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.5, 14), poleMat)
    a.rotation.z = Math.PI / 2
    a.position.set(-0.25, 5.28, 0)
    const elbow = new THREE.Mesh(new THREE.SphereGeometry(0.045, 14, 10), poleMat)
    elbow.position.set(0, 5.28, 0)
    arm.add(a, elbow)
    headCenter = new THREE.Vector3(-0.78, 5.27, 0)
  } else {
    const curve = new THREE.CurvePath<THREE.Vector3>()
    curve.add(new THREE.CubicBezierCurve3(new THREE.Vector3(0, 4.2, 0), new THREE.Vector3(0, 5.1, 0), new THREE.Vector3(-0.15, 5.52, 0), new THREE.Vector3(-0.85, 5.52, 0)))
    curve.add(new THREE.LineCurve3(new THREE.Vector3(-0.85, 5.52, 0), new THREE.Vector3(-1.05, 5.52, 0)))
    const tube = new THREE.Mesh(new THREE.TubeGeometry(curve, 56, 0.05, 16, false), poleMat)
    arm.add(tube)
    headCenter = new THREE.Vector3(-1.32, 5.5, 0)
  }
  root.add(arm)

  const headGroup = new THREE.Group()
  headGroup.position.copy(headCenter)
  headGroup.rotation.z = -0.04
  const body = new THREE.Mesh(new RoundedBoxGeometry(0.78, 0.1, 0.3, 4, 0.045), mats.paintGrey)
  const fin = new THREE.Mesh(new RoundedBoxGeometry(0.5, 0.03, 0.2, 2, 0.012), mats.steelDark)
  fin.position.y = 0.062
  const lensMesh = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.012, 0.24), mats.lens.clone())
  lensMesh.position.y = -0.052
  headGroup.add(body, fin, lensMesh)
  top.add(headGroup)
  const lensMat = lensMesh.material as THREE.MeshStandardMaterial

  /* --- panel + struts --- */
  const panelPivot = variant === 'straight' ? new THREE.Vector3(0.3, 5.6, 0) : new THREE.Vector3(0.33, 4.62, 0)
  const panelGroup = new THREE.Group()
  panelGroup.position.copy(panelPivot)
  panelGroup.rotation.z = -0.4
  const frame = new THREE.Mesh(new RoundedBoxGeometry(0.46, 0.034, 0.58, 2, 0.01), mats.panelFrame)
  const panelMat = mats.panel.clone() as THREE.MeshPhysicalMaterial
  const glass = new THREE.Mesh(new THREE.BoxGeometry(0.43, 0.006, 0.55), panelMat)
  glass.position.y = 0.019
  panelGroup.add(frame, glass)
  top.add(panelGroup)
  const pAt = (lx: number, lz: number) => new THREE.Vector3(lx, -0.02, lz).applyEuler(panelGroup.rotation).add(panelPivot)
  const sy = variant === 'straight' ? [5.18, 5.38] : [4.3, 4.5]
  top.add(cylBetween(new THREE.Vector3(0.02, sy[0], 0.1), pAt(-0.1, 0.18), 0.012, poleMat, 8))
  top.add(cylBetween(new THREE.Vector3(0.02, sy[0], -0.1), pAt(-0.1, -0.18), 0.012, poleMat, 8))
  top.add(cylBetween(new THREE.Vector3(0.02, sy[1], 0), pAt(0.16, 0), 0.014, poleMat, 8))

  /* --- optional battery box (solar scene) --- */
  let battery: LampRig['battery']
  if (opts.battery) {
    const box = new THREE.Group()
    const shell = new THREE.Mesh(new RoundedBoxGeometry(0.2, 0.62, 0.17, 3, 0.02), mats.paintGrey)
    const glassWin = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.46, 0.012), new THREE.MeshStandardMaterial({ color: 0x07140c, roughness: 0.08, metalness: 0.9, transparent: true, opacity: 0.82 }))
    glassWin.position.set(0, 0, 0.088)
    const bar = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.4, 0.01), new THREE.MeshStandardMaterial({ color: 0x22c55e, emissive: new THREE.Color(0x22c55e), emissiveIntensity: 1.4, roughness: 0.4 }))
    bar.position.set(0, 0, 0.082)
    box.add(shell, glassWin, bar)
    box.position.set(0, 1.9, 0.12)
    root.add(box)
    battery = { bar, box }
  }

  /* --- light: cone, ground pool, halo --- */
  const lensLocal = new THREE.Vector3(headCenter.x, headCenter.y - 0.06, 0)
  const coneH = lensLocal.y
  const coneMat = new THREE.MeshBasicMaterial({ map: tex.fade, color: 0xffe0a6, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide })
  const cone = new THREE.Mesh(new THREE.ConeGeometry(3.0, coneH, 40, 1, true), coneMat)
  cone.position.set(lensLocal.x, coneH / 2, 0)
  cone.renderOrder = 2
  const poolMat = new THREE.MeshBasicMaterial({ map: tex.glow, color: 0xffd48a, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false })
  const pool = new THREE.Mesh(new THREE.CircleGeometry(3.4, 40), poolMat)
  pool.rotation.x = -Math.PI / 2
  pool.position.set(lensLocal.x, 0.02, 0)
  pool.renderOrder = 2
  const haloMat = new THREE.SpriteMaterial({ map: tex.glow, color: 0xffe3b0, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false })
  const halo = new THREE.Sprite(haloMat)
  halo.scale.setScalar(1.7)
  halo.position.copy(lensLocal)
  root.add(cone, pool)
  top.add(halo)

  shade(root)
  // glow helpers never cast/receive shadows
  for (const m of [cone, pool]) {
    m.castShadow = false
    m.receiveShadow = false
  }

  const rig: LampRig = {
    root,
    top,
    variant,
    lensMat,
    panelMat,
    cone,
    pool,
    halo,
    lensLocal,
    battery,
    poleHeight: H,
    lit: 0,
    anchors: {
      panel: panelPivot.clone().add(new THREE.Vector3(0.05, 0.1, 0)),
      head: headCenter.clone(),
      arm: variant === 'straight' ? new THREE.Vector3(-0.2, 5.28, 0) : new THREE.Vector3(-0.4, 5.3, 0),
      pole: new THREE.Vector3(0, 2.6, 0),
      base: new THREE.Vector3(0, 0.25, 0)
    },
    setLit(v: number) {
      rig.lit = v
      lensMat.emissiveIntensity = v * 7
      coneMat.opacity = v * 0.18
      poolMat.opacity = v * 0.6
      haloMat.opacity = v * 0.95
      cone.visible = v > 0.01
      pool.visible = v > 0.01
      halo.visible = v > 0.01
    }
  }
  rig.setLit(0)
  return rig
}

/* ------------------------------------------------------------------ */
/* Truck with a long trailer of poles                                  */
/* ------------------------------------------------------------------ */
export interface TruckRig {
  group: THREE.Group
  wheels: THREE.Group[]
  length: number
}

export function buildTruck(mats: Mats, tex: Tex): TruckRig {
  const g = new THREE.Group()
  const wheels: THREE.Group[] = []

  const box = (w: number, h: number, d: number, m: THREE.Material, x: number, y: number, z: number) => {
    const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m)
    b.position.set(x, y, z)
    return b
  }

  /* trailer deck + frame */
  g.add(box(13.6, 0.16, 2.55, mats.paintGrey, 6.8, 1.2, 0))
  g.add(box(13.4, 0.22, 0.34, mats.steelDark, 6.8, 1.0, 0.75))
  g.add(box(13.4, 0.22, 0.34, mats.steelDark, 6.8, 1.0, -0.75))
  for (let i = 0; i < 7; i++) g.add(box(0.14, 0.12, 2.3, mats.steelDark, 0.8 + i * 2, 1.06, 0))
  g.add(box(0.1, 0.34, 2.55, mats.steelDark, 0.05, 1.28, 0)) // tail board
  // low side rails
  g.add(box(13.5, 0.08, 0.05, mats.steelDark, 6.8, 1.33, 1.25))
  g.add(box(13.5, 0.08, 0.05, mats.steelDark, 6.8, 1.33, -1.25))

  /* poles: 5 + 4 + 3 lying lengthwise, staggered at the tail */
  const rows = [
    { y: 1.46, zs: [-0.78, -0.39, 0, 0.39, 0.78] },
    { y: 1.8, zs: [-0.58, -0.2, 0.2, 0.58] },
    { y: 2.13, zs: [-0.39, 0, 0.39] }
  ]
  rows.forEach((row, ri) => {
    row.zs.forEach((z, zi) => {
      const start = -0.7 + ri * 0.45 + (zi % 2) * 0.25
      const len = 10.6
      const p = new THREE.Mesh(new THREE.CylinderGeometry(0.052, 0.112, len, 16), mats.galv)
      p.rotation.z = -Math.PI / 2
      p.position.set(start + len / 2, row.y, z)
      g.add(p)
      const plate = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.17, 0.025, 20), mats.galv)
      plate.rotation.z = Math.PI / 2
      plate.position.set(start, row.y, z)
      g.add(plate)
    })
  })

  /* straps over the load */
  for (const x of [1.8, 5.0, 8.2]) {
    g.add(box(0.07, 0.03, 2.1, mats.strap, x, 2.34, 0))
    g.add(box(0.07, 1.2, 0.03, mats.strap, x, 1.78, 1.05))
    g.add(box(0.07, 1.2, 0.03, mats.strap, x, 1.78, -1.05))
  }

  /* red flag on the longest overhang */
  g.add(cylBetween(new THREE.Vector3(-0.72, 1.46, 0.78), new THREE.Vector3(-0.72, 2.2, 0.78), 0.012, mats.steelDark, 6))
  const flag = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.36), mats.cloth)
  flag.position.set(-0.72, 2.0, 0.98)
  flag.rotation.y = Math.PI / 2
  g.add(flag)

  /* crates at the front of the deck: solar panels + lamp heads */
  const panelsMat = mats.panel.clone() as THREE.MeshPhysicalMaterial
  g.add(box(2.4, 0.7, 1.9, mats.cardboard, 11.9, 1.63, 0.2))
  const pk = box(1.4, 0.5, 1.2, panelsMat, 11.5, 2.23, 0.2)
  pk.rotation.y = 0.03
  g.add(pk)
  g.add(box(1.0, 0.5, 1.0, mats.cardboard, 12.6, 2.23, -0.55))

  /* tractor (cab-over) */
  g.add(box(3.6, 0.3, 1.1, mats.steelDark, 15.6, 0.85, 0)) // chassis
  const cab = new THREE.Mesh(new RoundedBoxGeometry(2.6, 2.3, 2.5, 5, 0.2), mats.truckPaint)
  cab.position.set(15.9, 2.0, 0)
  g.add(cab)
  const fairing = new THREE.Mesh(new RoundedBoxGeometry(2.2, 0.55, 2.3, 4, 0.2), mats.truckPaint)
  fairing.position.set(15.4, 3.35, 0)
  fairing.rotation.z = 0.12
  g.add(fairing)
  for (const sd of [1, -1]) {
    g.add(box(2.45, 0.16, 0.03, mats.paint.white, 15.9, 1.3, 1.255 * sd)) // side stripe
    g.add(box(0.025, 1.5, 0.03, mats.steelDark, 16.5, 1.95, 1.255 * sd)) // door seam
    g.add(box(0.5, 0.06, 0.3, mats.steelDark, 16.3, 0.95, 1.3 * sd)) // step
  }
  const wind = new THREE.Mesh(new THREE.PlaneGeometry(2.1, 1.05), mats.glass)
  wind.position.set(17.205, 2.55, 0)
  wind.rotation.y = Math.PI / 2
  g.add(wind)
  for (const s of [1, -1]) {
    const side = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 0.95), mats.glass)
    side.position.set(16.35, 2.6, 1.258 * s)
    if (s < 0) side.rotation.y = Math.PI
    g.add(side)
    g.add(box(0.3, 0.45, 0.1, mats.steelDark, 17.1, 2.6, 1.34 * s)) // mirror
    const hl = box(0.06, 0.22, 0.4, mats.headlight, 17.23, 1.35, 0.85 * s)
    g.add(hl)
    // exhaust stack + fuel tank
    g.add(cylBetween(new THREE.Vector3(14.45, 1.0, 1.3 * s), new THREE.Vector3(14.45, 3.7, 1.3 * s), 0.07, mats.chrome, 10))
    const tank = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.36, 1.5, 20), mats.chrome)
    tank.rotation.x = Math.PI / 2
    tank.position.set(15.6, 0.95, 1.2 * s)
    tank.rotation.z = Math.PI / 2
    g.add(tank)
  }
  g.add(box(0.12, 0.5, 1.9, mats.steelDark, 17.22, 1.0, 0)) // grille
  g.add(box(0.2, 0.22, 2.5, mats.chrome, 17.3, 0.55, 0)) // bumper
  if (tex.logo) {
    const decalMat = new THREE.MeshBasicMaterial({ map: tex.logo, transparent: true })
    for (const s of [1, -1]) {
      const d = new THREE.Mesh(new THREE.PlaneGeometry(1.7, 0.42), decalMat)
      d.position.set(15.9, 1.55, 1.262 * s)
      if (s < 0) d.rotation.y = Math.PI
      g.add(d)
    }
  }

  /* wheels */
  const addWheel = (x: number, z: number, dual = false) => {
    const w = new THREE.Group()
    const tire = new THREE.Mesh(new THREE.CylinderGeometry(0.52, 0.52, 0.3, 28), mats.rubber)
    tire.rotation.x = Math.PI / 2
    const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.32, 18), mats.chrome)
    hub.rotation.x = Math.PI / 2
    const nuts = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.34, 8), mats.steelDark)
    nuts.rotation.x = Math.PI / 2
    nuts.position.x = 0.08
    w.add(tire, hub, nuts)
    if (dual) {
      const t2 = tire.clone()
      t2.position.z = 0.32 * Math.sign(z)
      w.add(t2)
    }
    w.position.set(x, 0.52, z)
    g.add(w)
    wheels.push(w)
  }
  for (const x of [1.7, 3.0, 4.3]) for (const s of [1, -1]) addWheel(x, 1.05 * s, true)
  for (const x of [14.3, 15.4]) for (const s of [1, -1]) addWheel(x, 1.0 * s, true)
  for (const s of [1, -1]) addWheel(16.6, 1.05 * s)
  // axles
  for (const x of [1.7, 3.0, 4.3, 14.3, 15.4, 16.6]) {
    const ax = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 2.2, 10), mats.steelDark)
    ax.rotation.x = Math.PI / 2
    ax.position.set(x, 0.52, 0)
    g.add(ax)
  }

  shade(g)
  return { group: g, wheels, length: 17.4 }
}

/* ------------------------------------------------------------------ */
/* Mobile crane                                                        */
/* ------------------------------------------------------------------ */
export interface CraneRig {
  group: THREE.Group
  boom: THREE.Group
  /** boom tip in crane-local coordinates when the boom is raised */
  tipLocal: THREE.Vector3
  cable: THREE.Line
}

export function buildCrane(mats: Mats): CraneRig {
  const group = new THREE.Group()
  const box = (w: number, h: number, d: number, m: THREE.Material, x: number, y: number, z: number) => {
    const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m)
    b.position.set(x, y, z)
    return b
  }
  group.add(box(6.2, 0.5, 2.4, mats.craneYellow, 0, 1.1, 0))
  group.add(box(1.7, 1.5, 2.3, mats.craneYellow, 2.9, 1.8, 0)) // cab at the pole side
  const win = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 0.7), mats.glass)
  win.position.set(3.76, 2.05, 0)
  win.rotation.y = Math.PI / 2
  group.add(win)
  group.add(box(2.0, 0.9, 2.0, mats.steelDark, -1.6, 1.7, 0)) // turret
  for (const x of [-2.2, -0.9, 2.1]) for (const s of [1, -1]) {
    const w = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 0.45, 22), mats.rubber)
    w.rotation.x = Math.PI / 2
    w.position.set(x, 0.55, 1.15 * s)
    group.add(w)
  }
  // outriggers
  for (const s of [1, -1]) {
    group.add(box(0.2, 0.2, 1.5, mats.steelDark, -2.6, 0.85, 1.7 * s))
    group.add(box(0.7, 0.1, 0.7, mats.steelDark, -2.6, 0.08, 2.4 * s))
    group.add(box(0.2, 0.2, 1.5, mats.steelDark, 2.2, 0.85, 1.7 * s))
    group.add(box(0.7, 0.1, 0.7, mats.steelDark, 2.2, 0.08, 2.4 * s))
  }

  const boom = new THREE.Group()
  boom.position.set(-1.6, 2.1, 0)
  const L = 8
  const b1 = box(L, 0.28, 0.34, mats.craneYellow, L / 2, 0, 0)
  const b2 = box(L * 0.6, 0.2, 0.26, mats.steelDark, L * 0.5 + 0.2, 0, 0)
  boom.add(b1, b2)
  boom.rotation.z = (58 * Math.PI) / 180
  group.add(boom)

  const tipLocal = new THREE.Vector3(L, 0, 0).applyEuler(boom.rotation).add(boom.position)
  const cableGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3(0, -1, 0)])
  const cable = new THREE.Line(cableGeo, new THREE.LineBasicMaterial({ color: 0xe5e5e5 }))
  cable.frustumCulled = false
  group.add(cable)

  shade(group)
  return { group, boom, tipLocal, cable }
}

/* ------------------------------------------------------------------ */
/* Scenery                                                             */
/* ------------------------------------------------------------------ */
export function buildTree(mats: Mats, seed: number): THREE.Group {
  const r = rng(seed)
  const g = new THREE.Group()
  const h = 2 + r() * 1.5
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.2, h, 8), mats.trunk)
  trunk.position.y = h / 2
  g.add(trunk)
  for (let i = 0; i < 3; i++) {
    const s = 1.1 + r() * 0.9
    const leaf = new THREE.Mesh(new THREE.IcosahedronGeometry(s, 1), mats.leaf)
    leaf.position.set((r() - 0.5) * 1.1, h + 0.5 + i * 0.5, (r() - 0.5) * 1.1)
    g.add(leaf)
  }
  return shade(g)
}

export function buildCoconut(mats: Mats, seed: number): THREE.Group {
  const r = rng(seed)
  const g = new THREE.Group()
  const lean = (r() - 0.5) * 1.6
  const H = 7 + r() * 2.5
  const curve = new THREE.CatmullRomCurve3([new THREE.Vector3(0, 0, 0), new THREE.Vector3(lean * 0.3, H * 0.5, 0), new THREE.Vector3(lean, H, 0)])
  g.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 14, 0.18, 8, false), mats.trunk))
  const top = new THREE.Vector3(lean, H, 0)
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2
    const frond = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 3.4, 1, 4), mats.leaf)
    frond.geometry.translate(0, 1.7, 0)
    frond.position.copy(top)
    frond.rotation.order = 'YXZ'
    frond.rotation.y = a
    frond.rotation.x = 1.15 + r() * 0.25
    g.add(frond)
  }
  return shade(g)
}

export function buildBuilding(mats: Mats, w: number, h: number, d: number): THREE.Mesh {
  const m = mats.building()
  const rx = Math.max(1, Math.round(w / 6))
  const ry = Math.max(1, Math.round(h / 8))
  m.map = m.map!.clone()
  m.map.repeat.set(rx, ry)
  m.emissiveMap = m.emissiveMap!.clone()
  m.emissiveMap.repeat.set(rx, ry)
  m.map.needsUpdate = m.emissiveMap.needsUpdate = true
  const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m)
  b.position.y = h / 2
  b.castShadow = true
  b.receiveShadow = true
  return b
}

export function buildMountain(mats: Mats, radius: number, height: number, seed: number): THREE.Mesh {
  const r = rng(seed)
  const geo = new THREE.ConeGeometry(radius, height, 9, 4)
  const pos = geo.attributes.position
  for (let i = 0; i < pos.count; i++) {
    const y = pos.getY(i)
    if (y > -height / 2 + 0.01) {
      pos.setX(i, pos.getX(i) * (0.8 + r() * 0.4))
      pos.setZ(i, pos.getZ(i) * (0.8 + r() * 0.4))
      pos.setY(i, y + (r() - 0.5) * height * 0.08)
    }
  }
  geo.computeVertexNormals()
  const m = new THREE.Mesh(geo, mats.mountain)
  m.position.y = height / 2 - 0.5
  return m
}

/** Dashes along a road, drawn as one InstancedMesh. */
export function dashes(mats: Mats, length: number, x0: number, z: number, dash = 3, gap = 4, color: 'white' | 'yellow' = 'white') {
  const n = Math.floor(length / (dash + gap))
  const mesh = new THREE.InstancedMesh(new THREE.BoxGeometry(dash, 0.012, 0.14), color === 'white' ? mats.paint.white : mats.paint.yellow, n)
  const m = new THREE.Matrix4()
  for (let i = 0; i < n; i++) {
    m.makeTranslation(x0 + i * (dash + gap) + dash / 2, 0.012, z)
    mesh.setMatrixAt(i, m)
  }
  mesh.instanceMatrix.needsUpdate = true
  mesh.receiveShadow = true
  return mesh
}

/** Flat road strip along +x. */
export function roadStrip(mats: Mats, x0: number, length: number, width: number, z = 0) {
  const geo = new THREE.PlaneGeometry(length, width)
  const mat = mats.ground.asphalt(length / 7, width / 7)
  const m = new THREE.Mesh(geo, mat)
  m.rotation.x = -Math.PI / 2
  m.position.set(x0 + length / 2, 0.005, z)
  m.receiveShadow = true
  return m
}

export function groundPlane(mat: THREE.Material, x: number, z: number, w: number, d: number, y = 0) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), mat)
  m.rotation.x = -Math.PI / 2
  m.position.set(x, y, z)
  m.receiveShadow = true
  return m
}

export function slab(mat: THREE.Material, x0: number, length: number, z: number, width: number, height: number) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(length, height, width), mat)
  m.position.set(x0 + length / 2, height / 2, z)
  m.castShadow = true
  m.receiveShadow = true
  return m
}

export function buildCar(mats: Mats): THREE.Group {
  const g = new THREE.Group()
  const body = new THREE.Mesh(new RoundedBoxGeometry(4.2, 0.7, 1.8, 3, 0.15), mats.car)
  body.position.y = 0.7
  const cab = new THREE.Mesh(new RoundedBoxGeometry(2.2, 0.62, 1.6, 3, 0.2), mats.car)
  cab.position.set(-0.2, 1.3, 0)
  const win = new THREE.Mesh(new RoundedBoxGeometry(2.0, 0.45, 1.64, 2, 0.12), mats.glass)
  win.position.set(-0.2, 1.32, 0)
  g.add(body, cab, win)
  for (const x of [-1.3, 1.3]) for (const s of [1, -1]) {
    const w = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.34, 0.25, 16), mats.rubber)
    w.rotation.x = Math.PI / 2
    w.position.set(x, 0.34, 0.85 * s)
    g.add(w)
  }
  return shade(g)
}