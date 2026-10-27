/**
 * Timeline + copy for the 3D journey. Pure data/functions (no three.js, no React)
 * so both the engine and the overlay can use them.
 */

export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v))
export const seg = (p: number, a: number, b: number) => clamp((p - a) / (b - a))
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t
export const ease = (t: number) => t * t * (3 - 2 * t)

export const CHAPTERS = [
  { id: 'hero', label: 'Welcome', weight: 3 },
  { id: 'story', label: 'Our story', weight: 5 },
  { id: 'clients', label: 'Who we serve', weight: 3 },
  { id: 'anatomy', label: 'The product', weight: 5 },
  { id: 'solar', label: 'Solar', weight: 4 },
  { id: 'truck', label: 'Delivery', weight: 3.5 },
  { id: 'reach', label: 'Nationwide', weight: 4 },
  { id: 'install', label: 'Installation', weight: 6 },
  { id: 'why', label: 'Why Ecoshift', weight: 3 },
  { id: 'mission', label: 'Our mission', weight: 3 },
  { id: 'services', label: 'Services', weight: 3 },
  { id: 'community', label: 'Community', weight: 3 },
  { id: 'cta', label: 'Work with us', weight: 3 }
] as const

export type ChapterId = (typeof CHAPTERS)[number]['id']

const TOTAL = CHAPTERS.reduce((n, c) => n + c.weight, 0)
const STARTS: number[] = []
CHAPTERS.reduce((acc, c) => {
  STARTS.push(acc / TOTAL)
  return acc + c.weight
}, 0)
STARTS.push(1)

/** Height of the whole pinned journey, in viewport heights. */
export const WORLD_HEIGHT_VH = Math.round(TOTAL * 56)

export function chapterAt(p: number): { i: number; q: number } {
  let i = 0
  for (let k = 0; k < CHAPTERS.length; k++) if (p >= STARTS[k]) i = k
  const a = STARTS[i]
  const b = STARTS[i + 1]
  return { i, q: clamp((p - a) / (b - a)) }
}

/** 0..1 black overlay used to hide the cut between chapters. */
export function fadeAt(p: number): number {
  let d = 1
  for (let k = 1; k < CHAPTERS.length; k++) d = Math.min(d, Math.abs(p - STARTS[k]))
  return clamp(1 - d / 0.008)
}

/* ---------------- Anatomy ---------------- */
export const PARTS = [
  { key: 'panel', title: 'Solar panel', text: 'Soaks up sunlight all day and turns it into electricity. No cable to the grid, no monthly power bill.', chips: ['Sample panel: 348 × 290 mm'] },
  { key: 'head', title: 'LED lamp head', text: 'Energy-efficient LEDs in a sealed housing, aimed to put light on the road instead of the sky.', chips: ['Sample lamp: 487 × 210 mm'] },
  { key: 'arm', title: 'Straight or curved arm', text: 'Left: a straight pole with a short arm, simple and sturdy for sidewalks. Right: a curved gooseneck that reaches over the lanes of wider roads.', chips: [] as string[] },
  { key: 'pole', title: 'Built to stand strong', text: 'The pole carries the lamp, panel, and battery, and takes the wind, rain, and sun of Philippine roads.', chips: [] as string[] },
  { key: 'base', title: 'Anchored base', text: 'A base plate bolted into a concrete foundation keeps the whole unit planted, even in strong wind.', chips: ['Base plate', 'Anchor bolts', 'Concrete foundation'] }
] as const

/* ---------------- Solar ---------------- */
export const SOLAR_STEPS = [
  { title: 'Sunrise: the panel wakes up', text: 'Sunlight hits the solar panel, and it starts generating electricity right away.' },
  { title: 'Daytime: charging', text: 'A charge controller sends the power down the pole and stores it in the battery.' },
  { title: 'Dusk: the sensor says go', text: 'When daylight fades, the controller switches the LED on by itself. No wiring, no switch, no timer to set.' },
  { title: 'Night: powered by the sun', text: 'The lamp runs on the energy stored during the day, until the sun rises and the cycle starts again.' }
]

export function solarState(q: number) {
  const day = clamp(q / 0.5)
  const sunUp = Math.sin(Math.PI * day)
  const elev = q <= 0.5 ? -4 + 66 * sunUp : -4 - 22 * seg(q, 0.5, 0.8)
  const az = lerp(95, 265, day)
  const lit = ease(seg(q, 0.48, 0.58))
  const battery = q <= 0.5 ? lerp(0.18, 1, ease(day)) : lerp(1, 0.58, seg(q, 0.55, 1))
  return { elev, az, lit, battery, charging: q < 0.5 && sunUp > 0.12, discharging: lit > 0.3, sunUp }
}

/* ---------------- Truck ---------------- */
export const TRUCK_STEPS = [
  { title: 'Loaded at the warehouse', text: 'Poles go on lengthwise, lamp heads and solar panels are crated beside them.' },
  { title: 'Strapped and secured', text: 'One long trailer carries a whole project’s worth of poles in a single trip.' },
  { title: 'Ready to roll to your site', text: 'From our warehouses to the roadside, wherever your project is.' }
]

/* ---------------- Install ---------------- */
export const ACTS = [
  { id: 'city', label: 'City streets', title: 'Lighting the city block', text: 'Straight poles along the sidewalk keep crossings, storefronts, and pedestrians visible after dark.' },
  { id: 'highway', label: 'Highways', title: 'Reaching across wide lanes', text: 'Curved arms stretch over the carriageway so the light lands on the lanes, not the shoulder.' },
  { id: 'rural', label: 'Provincial roads', title: 'Power where the grid isn’t', text: 'Solar needs no trenching and no power line, so poles go up fast, even in far-flung barangays.' }
]
export const INSTALL_STEPS = ['Dig and pour the foundation', 'Crane lifts the pole', 'Mount the lamp and solar panel', 'Switch on']

export function installState(q: number) {
  const act = Math.min(2, Math.floor(q * 3))
  const t = q * 3 - act
  const stages = [0, 1, 2].map(i => seg(t, i * 0.3, i * 0.3 + 0.4))
  const cur = stages.findIndex(s => s > 0 && s < 1)
  const focus = cur >= 0 ? cur : stages[0] <= 0 ? 0 : 2
  const step = Math.min(3, Math.floor(stages[focus] * 4))
  return { act, t, stages, cur, step }
}

/* ---------------- Reach (map) ---------------- */
export const MAP_POINTS = [
  { id: 'hq', label: 'Head Office', x: 92, y: 70, region: 0 },
  { id: 'ncr', label: 'NCR Warehouse', x: 122, y: 90, region: 0 },
  { id: 'ceb', label: 'Cebu', x: 172, y: 190, region: 1 },
  { id: 'dav', label: 'Davao', x: 206, y: 295, region: 2 },
  { id: 'cdo', label: 'Cagayan de Oro', x: 244, y: 316, region: 2 }
]
export const MAP_ROUTE: [number, number][] = [
  [122, 90],
  [172, 190],
  [206, 295],
  [244, 316]
]
const SEG = MAP_ROUTE.slice(1).map((pt, k) => Math.hypot(pt[0] - MAP_ROUTE[k][0], pt[1] - MAP_ROUTE[k][1]))
const LEN = SEG.reduce((a, b) => a + b, 0)
export const MAP_CUM = SEG.reduce<number[]>((acc, l) => [...acc, acc[acc.length - 1] + l / LEN], [0])

export function reachState(q: number) {
  const region = q < 0.34 ? 0 : q < 0.67 ? 1 : 2
  const r = q < 0.34 ? 0 : q < 0.67 ? lerp(0, MAP_CUM[1], ease(seg(q, 0.34, 0.6))) : lerp(MAP_CUM[1], 1, ease(seg(q, 0.67, 0.95)))
  return { region, r }
}

export function routePoint(r: number): [number, number] {
  let d = r * LEN
  for (let k = 0; k < SEG.length; k++) {
    if (d <= SEG[k] || k === SEG.length - 1) {
      const t = clamp(d / SEG[k])
      return [lerp(MAP_ROUTE[k][0], MAP_ROUTE[k + 1][0], t), lerp(MAP_ROUTE[k][1], MAP_ROUTE[k + 1][1], t)]
    }
    d -= SEG[k]
  }
  return MAP_ROUTE[0]
}

/** Staggered reveal for item k of n inside a chapter: 0..1, fades out near the end. */
export function reveal(q: number, k: number, step = 0.09): number {
  const start = 0.08 + k * step
  return ease(seg(q, start, start + 0.16)) * (1 - ease(seg(q, 0.9, 1)))
}