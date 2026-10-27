import * as THREE from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'

/** Small deterministic random generator so every visit looks the same. */
export function rng(seed: number) {
  let a = seed | 0
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const c8 = (v: number) => Math.max(0, Math.min(255, v))

function finish(t: THREE.DataTexture, opts: { srgb?: boolean; repeat?: boolean; mip?: boolean } = {}) {
  const { srgb = true, repeat = true, mip = true } = opts
  t.wrapS = t.wrapT = repeat ? THREE.RepeatWrapping : THREE.ClampToEdgeWrapping
  t.magFilter = THREE.LinearFilter
  t.minFilter = mip ? THREE.LinearMipmapLinearFilter : THREE.LinearFilter
  t.generateMipmaps = mip
  if (srgb) t.colorSpace = THREE.SRGBColorSpace
  t.anisotropy = 4
  t.needsUpdate = true
  return t
}

/** Fine grain + soft blotches. Good for asphalt, concrete, soil, grass. */
export function noiseTexture(size: number, base: [number, number, number], grain: number, blotch: number, seed = 1, srgb = true) {
  const r = rng(seed)
  const g = 12
  const grid = Array.from({ length: g * g }, () => r() - 0.5)
  const data = new Uint8Array(size * size * 4)
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const fx = (x / size) * g
      const fy = (y / size) * g
      const x0 = Math.floor(fx) % g
      const y0 = Math.floor(fy) % g
      const x1 = (x0 + 1) % g
      const y1 = (y0 + 1) % g
      const tx = fx - Math.floor(fx)
      const ty = fy - Math.floor(fy)
      const top = grid[y0 * g + x0] * (1 - tx) + grid[y0 * g + x1] * tx
      const bot = grid[y1 * g + x0] * (1 - tx) + grid[y1 * g + x1] * tx
      const b = (top * (1 - ty) + bot * ty) * blotch
      const n = (r() - 0.5) * grain + b
      const i = (y * size + x) * 4
      data[i] = c8(base[0] + n)
      data[i + 1] = c8(base[1] + n)
      data[i + 2] = c8(base[2] + n)
      data[i + 3] = 255
    }
  }
  return finish(new THREE.DataTexture(data, size, size, THREE.RGBAFormat), { srgb })
}

/** Rows of rice paddy / crop rows. */
export function paddyTexture(size = 256, seed = 4) {
  const r = rng(seed)
  const data = new Uint8Array(size * size * 4)
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const row = Math.sin((x / size) * Math.PI * 2 * 16) * 0.5 + 0.5
      const n = (r() - 0.5) * 26
      const i = (y * size + x) * 4
      data[i] = c8(72 + row * 18 + n)
      data[i + 1] = c8(118 + row * 38 + n)
      data[i + 2] = c8(40 + row * 10 + n)
      data[i + 3] = 255
    }
  }
  return finish(new THREE.DataTexture(data, size, size, THREE.RGBAFormat))
}

/** Solar cell grid. */
export function cellTexture(size = 128) {
  const data = new Uint8Array(size * size * 4)
  const cells = 6
  const step = size / cells
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const lx = x % step
      const ly = y % step
      const edge = lx < 2 || ly < 2
      const bus = Math.abs(lx - step / 2) < 0.8 || Math.abs(lx - step / 3) < 0.5 || Math.abs(lx - (2 * step) / 3) < 0.5
      const sheen = 0.5 + 0.5 * Math.sin((x + y) * 0.05)
      const i = (y * size + x) * 4
      let rr = 14 + sheen * 8
      let gg = 28 + sheen * 14
      let bb = 78 + sheen * 30
      if (edge) {
        rr = 150
        gg = 165
        bb = 190
      } else if (bus) {
        rr += 55
        gg += 62
        bb += 70
      }
      data[i] = c8(rr)
      data[i + 1] = c8(gg)
      data[i + 2] = c8(bb)
      data[i + 3] = 255
    }
  }
  return finish(new THREE.DataTexture(data, size, size, THREE.RGBAFormat))
}

/** Building facade: dark glass grid + emissive map with randomly lit windows. */
export function windowTextures(seed = 9) {
  const size = 256
  const r = rng(seed)
  const cols = 8
  const rows = 16
  const cw = size / cols
  const ch = size / rows
  const map = new Uint8Array(size * size * 4)
  const em = new Uint8Array(size * size * 4)
  const lit: boolean[] = Array.from({ length: cols * rows }, () => r() < 0.16)
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const cx = Math.floor(x / cw)
      const cy = Math.floor(y / ch)
      const lx = x - cx * cw
      const ly = y - cy * ch
      const win = lx > 4 && lx < cw - 4 && ly > 4 && ly < ch - 4
      const on = win && lit[cy * cols + cx]
      const i = (y * size + x) * 4
      const wall = 52 + ((x * 7 + y * 3) % 9)
      map[i] = win ? (on ? 255 : 30) : wall
      map[i + 1] = win ? (on ? 215 : 40) : wall - 4
      map[i + 2] = win ? (on ? 150 : 58) : wall - 10
      map[i + 3] = 255
      em[i] = on ? 255 : 0
      em[i + 1] = on ? 200 : 0
      em[i + 2] = on ? 120 : 0
      em[i + 3] = 255
    }
  }
  return {
    map: finish(new THREE.DataTexture(map, size, size, THREE.RGBAFormat)),
    emissive: finish(new THREE.DataTexture(em, size, size, THREE.RGBAFormat))
  }
}

/** Soft round glow (sprites, light pools). */
export function radialTexture(size = 128, power = 2.2) {
  const data = new Uint8Array(size * size * 4)
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dx = (x + 0.5) / size - 0.5
      const dy = (y + 0.5) / size - 0.5
      const d = Math.min(1, Math.sqrt(dx * dx + dy * dy) * 2)
      const a = Math.pow(1 - d, power)
      const i = (y * size + x) * 4
      data[i] = data[i + 1] = data[i + 2] = 255
      data[i + 3] = c8(a * 255)
    }
  }
  return finish(new THREE.DataTexture(data, size, size, THREE.RGBAFormat), { srgb: false, repeat: false, mip: false })
}

/** Thin ring (highlight marker). */
export function ringTexture(size = 128) {
  const data = new Uint8Array(size * size * 4)
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dx = (x + 0.5) / size - 0.5
      const dy = (y + 0.5) / size - 0.5
      const d = Math.sqrt(dx * dx + dy * dy) * 2
      const a = Math.max(0, 1 - Math.abs(d - 0.86) / 0.05)
      const i = (y * size + x) * 4
      data[i] = data[i + 1] = data[i + 2] = 255
      data[i + 3] = c8(a * 255)
    }
  }
  return finish(new THREE.DataTexture(data, size, size, THREE.RGBAFormat), { srgb: false, repeat: false, mip: false })
}

/** 1D vertical fade: alpha 0 at v=0 (ground) up to 1 at v=1 (lamp). */
export function fadeTexture() {
  const h = 64
  const data = new Uint8Array(4 * h * 4)
  for (let y = 0; y < h; y++) {
    const a = Math.pow(y / (h - 1), 1.4)
    for (let x = 0; x < 4; x++) {
      const i = (y * 4 + x) * 4
      data[i] = data[i + 1] = data[i + 2] = 255
      data[i + 3] = c8(a * 255)
    }
  }
  return finish(new THREE.DataTexture(data, 4, h, THREE.RGBAFormat), { srgb: false, repeat: false, mip: false })
}

/** Text decal. Browser only (needs a 2D canvas); returns null elsewhere. */
export function textTexture(text: string, color = '#ecfdf5', w = 512, h = 128): THREE.Texture | null {
  if (typeof document === 'undefined') return null
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')
  if (!ctx) return null
  ctx.clearRect(0, 0, w, h)
  ctx.fillStyle = color
  ctx.font = '800 84px system-ui, -apple-system, Segoe UI, sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(text, w / 2, h / 2 + 4)
  const t = new THREE.CanvasTexture(canvas)
  t.colorSpace = THREE.SRGBColorSpace
  return t
}

/** Neutral studio environment so metals have something to reflect. */
export function makeEnvironment(renderer: THREE.WebGLRenderer): THREE.Texture | null {
  try {
    const pmrem = new THREE.PMREMGenerator(renderer)
    const env = new RoomEnvironment()
    const rt = pmrem.fromScene(env, 0.04)
    pmrem.dispose()
    return rt.texture
  } catch {
    return null
  }
}

export interface Tex {
  asphalt: THREE.DataTexture
  concrete: THREE.DataTexture
  concreteBump: THREE.DataTexture
  grass: THREE.DataTexture
  dirt: THREE.DataTexture
  paddy: THREE.DataTexture
  cells: THREE.DataTexture
  glow: THREE.DataTexture
  ring: THREE.DataTexture
  fade: THREE.DataTexture
  win: { map: THREE.DataTexture; emissive: THREE.DataTexture }
  logo: THREE.Texture | null
}

export function createTextures(): Tex {
  return {
    asphalt: noiseTexture(256, [64, 64, 68], 38, 26, 3),
    concrete: noiseTexture(256, [150, 150, 146], 26, 30, 5),
    concreteBump: noiseTexture(256, [128, 128, 128], 80, 40, 6, false),
    grass: noiseTexture(256, [64, 104, 48], 54, 34, 7),
    dirt: noiseTexture(256, [112, 86, 56], 40, 36, 8),
    paddy: paddyTexture(256, 4),
    cells: cellTexture(128),
    glow: radialTexture(128, 2.2),
    ring: ringTexture(128),
    fade: fadeTexture(),
    win: windowTextures(9),
    logo: textTexture('ECOSHIFT')
  }
}

export function createMats(env: THREE.Texture | null, tex: Tex) {
  const withEnv = <T extends THREE.MeshStandardMaterial>(m: T, k = 1): T => {
    if (env) {
      m.envMap = env
      m.envMapIntensity = k
    }
    return m
  }
  const tile = (t: THREE.DataTexture, rx: number, ry: number) => {
    const c = t.clone()
    c.repeat.set(rx, ry)
    c.needsUpdate = true
    return c
  }
  return {
    galv: withEnv(new THREE.MeshStandardMaterial({ color: 0xd2d6db, metalness: 0.65, roughness: 0.42 }), 1.1),
    steelDark: withEnv(new THREE.MeshStandardMaterial({ color: 0x2c2f34, metalness: 0.7, roughness: 0.42 })),
    paintGrey: withEnv(new THREE.MeshStandardMaterial({ color: 0x3b3e44, metalness: 0.55, roughness: 0.48 })),
    chrome: withEnv(new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 1, roughness: 0.12 }), 1.3),
    rubber: new THREE.MeshStandardMaterial({ color: 0x151515, metalness: 0, roughness: 0.92 }),
    panel: withEnv(
      new THREE.MeshPhysicalMaterial({
        map: tex.cells,
        color: 0xa8c0ff,
        metalness: 0.2,
        roughness: 0.25,
        clearcoat: 1,
        clearcoatRoughness: 0.08,
        emissive: new THREE.Color(0xffa63a),
        emissiveIntensity: 0
      }),
      1.2
    ),
    panelFrame: withEnv(new THREE.MeshStandardMaterial({ color: 0xb7bcc3, metalness: 0.9, roughness: 0.3 })),
    lens: new THREE.MeshStandardMaterial({ color: 0xcfd2d6, emissive: new THREE.Color(0xffd9a0), emissiveIntensity: 0, roughness: 0.25, metalness: 0 }),
    concrete: withEnv(new THREE.MeshStandardMaterial({ map: tile(tex.concrete, 1, 1), bumpMap: tile(tex.concreteBump, 1, 1), bumpScale: 1.2, roughness: 0.95, metalness: 0 }), 0.4),
    asphalt: new THREE.MeshStandardMaterial({ map: tex.asphalt, roughness: 0.93, metalness: 0 }),
    cardboard: new THREE.MeshStandardMaterial({ color: 0xa8793f, roughness: 0.95 }),
    cloth: new THREE.MeshStandardMaterial({ color: 0xd62828, roughness: 0.8, side: THREE.DoubleSide }),
    strap: new THREE.MeshStandardMaterial({ color: 0xf2a007, roughness: 0.7 }),
    truckPaint: withEnv(new THREE.MeshPhysicalMaterial({ color: 0x15803d, metalness: 0.3, roughness: 0.35, clearcoat: 0.8, clearcoatRoughness: 0.2 }), 1),
    glass: withEnv(new THREE.MeshStandardMaterial({ color: 0x0b1620, metalness: 0.9, roughness: 0.06 }), 1.4),
    craneYellow: withEnv(new THREE.MeshStandardMaterial({ color: 0xf5b301, metalness: 0.35, roughness: 0.5 })),
    headlight: new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: new THREE.Color(0xfff1c2), emissiveIntensity: 1.2 }),
    leaf: new THREE.MeshStandardMaterial({ color: 0x2f7d32, roughness: 0.85, side: THREE.DoubleSide }),
    trunk: new THREE.MeshStandardMaterial({ color: 0x6b4a2b, roughness: 0.95 }),
    sidewalk: new THREE.MeshStandardMaterial({ map: tile(tex.concrete, 8, 1), roughness: 0.9 }),
    paint: {
      white: new THREE.MeshStandardMaterial({ color: 0xe8e8e8, roughness: 0.7 }),
      yellow: new THREE.MeshStandardMaterial({ color: 0xf2b705, roughness: 0.7 })
    },
    ground: {
      grass: (rx: number, ry: number) => new THREE.MeshStandardMaterial({ map: tile(tex.grass, rx, ry), roughness: 0.98 }),
      dirt: (rx: number, ry: number) => new THREE.MeshStandardMaterial({ map: tile(tex.dirt, rx, ry), roughness: 0.98 }),
      paddy: (rx: number, ry: number) => new THREE.MeshStandardMaterial({ map: tile(tex.paddy, rx, ry), roughness: 0.95 }),
      asphalt: (rx: number, ry: number) => new THREE.MeshStandardMaterial({ map: tile(tex.asphalt, rx, ry), roughness: 0.93 })
    },
    building: () => {
      const w = tex.win
      return new THREE.MeshStandardMaterial({
        map: w.map,
        emissiveMap: w.emissive,
        emissive: new THREE.Color(0xffffff),
        emissiveIntensity: 1.1,
        roughness: 0.8
      })
    },
    mountain: new THREE.MeshStandardMaterial({ color: 0x2f5d3a, roughness: 1, flatShading: true }),
    island: new THREE.MeshStandardMaterial({ color: 0x4a8a50, map: tile(tex.grass, 0.35, 0.35), roughness: 0.95 }),
    ocean: new THREE.MeshPhysicalMaterial({ color: 0x0b4a63, roughness: 0.28, metalness: 0.1, clearcoat: 0.6 }),
    car: withEnv(new THREE.MeshPhysicalMaterial({ color: 0x9a1b1b, metalness: 0.5, roughness: 0.3, clearcoat: 0.8 }))
  }
}

export type Mats = ReturnType<typeof createMats>