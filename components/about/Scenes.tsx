'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'
import { ArrowUpRight, BatteryCharging, ChevronsRight, Lightbulb, Sun } from 'lucide-react'
import ScrollStage, { clamp, ease, lerp, seg } from './ScrollStage'
import Streetlight, { StreetlightDefs, StreetlightGroup, type Variant } from './Streetlight'

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */
export type Milestone = { label: string; title: string; text: string }
export type Branch = { name: string; address: string; kind: 'office' | 'warehouse' | 'branch' }
export type Region = { name: string; blurb: string; branches: Branch[] }

/* ------------------------------------------------------------------ */
/* Shared UI                                                           */
/* ------------------------------------------------------------------ */
function useBox<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  const [size, setSize] = useState({ w: 800, h: 500 })
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const read = () => setSize({ w: el.clientWidth || 800, h: el.clientHeight || 500 })
    const ro = new ResizeObserver(read)
    ro.observe(el)
    read()
    return () => ro.disconnect()
  }, [])
  return [ref, size] as const
}

function Dots({ n, i }: { n: number; i: number }) {
  return (
    <div className="mt-4 flex gap-1.5" aria-hidden="true">
      {Array.from({ length: n }, (_, k) => (
        <span key={k} className={`h-1.5 rounded-full transition-all duration-300 ${k === i ? 'w-8 bg-amber-300' : 'w-3 bg-white/20'}`} />
      ))}
    </div>
  )
}

function Chip({ children }: { children: ReactNode }) {
  return <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium text-zinc-200">{children}</span>
}

function Caption({ eyebrow, title, text, i, n, children }: { eyebrow: string; title: string; text: string; i: number; n: number; children?: ReactNode }) {
  return (
    <div className="flex flex-col justify-center p-5 sm:p-8 lg:p-10">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-300">{eyebrow}</p>
      <div key={i} className="mt-2" style={{ animation: 'ecoFade .45s ease both' }}>
        <h3 className="text-2xl font-extrabold leading-tight tracking-tight sm:text-3xl lg:text-4xl">{title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-zinc-300 sm:text-base">{text}</p>
        {children}
      </div>
      <Dots n={n} i={i} />
    </div>
  )
}

/** Visual on top for phones, text on the left for desktop */
function Split({ caption, children }: { caption: ReactNode; children: ReactNode }) {
  return (
    <div className="relative h-full overflow-hidden rounded-3xl bg-[#04110a] text-white">
      <div className="grid h-full grid-rows-[minmax(0,1fr)_auto] lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:grid-rows-1">
        <div className="relative order-1 min-h-0 overflow-hidden lg:order-2">{children}</div>
        <div className="order-2 lg:order-1">{caption}</div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* 1. Story: lamps light up one by one along a road                    */
/* ------------------------------------------------------------------ */
export function StoryScene({ milestones }: { milestones: Milestone[] }) {
  return <ScrollStage heightVh={milestones.length * 75 + 50}>{p => <StoryStage p={p} milestones={milestones} />}</ScrollStage>
}

function StoryStage({ p, milestones }: { p: number; milestones: Milestone[] }) {
  const [ref, { w }] = useBox<HTMLDivElement>()
  const n = milestones.length
  const f = p * (n - 1)
  const itemW = Math.min(w * 0.82, 420)
  const tx = w / 2 - (f * itemW + itemW / 2)

  return (
    <div className="relative h-full overflow-hidden rounded-3xl bg-[#04110a] text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_50%_at_50%_100%,rgba(250,204,21,0.14),transparent)]" />
      <p className="absolute left-5 top-5 z-10 text-xs font-bold uppercase tracking-[0.18em] text-amber-300 sm:left-8 sm:top-7">How it started</p>
      <p className="absolute right-5 top-5 z-10 font-mono text-xs text-zinc-400 sm:right-8 sm:top-7">
        {String(Math.round(f) + 1).padStart(2, '0')} / {String(n).padStart(2, '0')}
      </p>

      <div ref={ref} className="absolute inset-0">
        {/* Road with dashes that travel with the scroll */}
        <div className="absolute inset-x-0 bottom-0 h-[12%] border-t border-zinc-700 bg-zinc-900">
          <div
            className="absolute inset-x-0 top-1/2 h-[3px] opacity-60"
            style={{ backgroundImage: 'repeating-linear-gradient(90deg,#fbbf24 0 28px,transparent 28px 56px)', backgroundPositionX: tx }}
          />
        </div>

        <div className="absolute inset-y-0 left-0 flex" style={{ width: n * itemW, transform: `translate3d(${tx}px,0,0)` }}>
          {milestones.map((m, i) => {
            const lit = clamp(1 - Math.abs(f - i) * 1.15)
            return (
              <div key={m.label} className="relative h-full shrink-0" style={{ width: itemW }}>
                <div className="absolute inset-x-0 top-[14%] px-5 sm:px-6" style={{ opacity: 0.25 + 0.75 * lit, transform: `translateY(${(1 - lit) * 14}px)` }}>
                  <p className="text-5xl font-extrabold tracking-tight text-transparent [-webkit-text-stroke:1.5px_#fbbf24] sm:text-6xl">{m.label}</p>
                  <h3 className="mt-2 text-xl font-bold sm:text-2xl">{m.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-zinc-300">{m.text}</p>
                </div>
                <svg viewBox="-230 -410 460 430" className="absolute bottom-[11%] left-1/2 h-[40%] -translate-x-1/2" aria-hidden="true">
                  <StreetlightDefs />
                  <StreetlightGroup variant="straight" lit={lit} />
                </svg>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* 2. Anatomy: part by part, then durability                           */
/* ------------------------------------------------------------------ */
const PARTS = [
  {
    part: 'panel' as const,
    title: 'Solar panel',
    text: 'Soaks up sunlight all day and turns it into electricity. No cable to the grid, no monthly power bill.',
    chips: ['Sample panel: 348 × 290 mm']
  },
  {
    part: 'head' as const,
    title: 'LED lamp head',
    text: 'Energy-efficient LEDs in a sealed housing, aimed to put light on the road instead of the sky.',
    chips: ['Sample lamp: 487 × 210 mm']
  },
  {
    part: 'arm' as const,
    title: 'Straight or curved arm',
    text: '',
    chips: []
  },
  {
    part: 'pole' as const,
    title: 'Built to stand strong',
    text: 'The pole carries the lamp, panel, and battery, and takes the wind, rain, and sun of Philippine roads.',
    chips: []
  },
  {
    part: 'base' as const,
    title: 'Anchored base',
    text: 'A base plate bolted into a concrete foundation keeps the whole unit planted, even in strong wind.',
    chips: ['Base plate', 'Anchor bolts', 'Concrete foundation']
  }
]

export function AnatomyScene({ durability }: { durability: string[] }) {
  const [pref, setPref] = useState<Variant>('straight')
  return <ScrollStage heightVh={420}>{p => <AnatomyStage p={p} pref={pref} setPref={setPref} durability={durability} />}</ScrollStage>
}

function AnatomyStage({ p, pref, setPref, durability }: { p: number; pref: Variant; setPref: (v: Variant) => void; durability: string[] }) {
  const n = PARTS.length
  const i = Math.min(n - 1, Math.floor(p * n))
  const t = p * n - i
  const cur = PARTS[i]
  const variant: Variant = cur.part === 'arm' ? (t < 0.5 ? 'straight' : 'bent') : pref
  const sway = cur.part === 'pole' ? Math.sin(p * 70) * 2.4 : 0

  const text =
    cur.part === 'arm'
      ? variant === 'straight'
        ? 'Straight design: a vertical pole with a short arm. Simple, sturdy, and ideal for sidewalks and narrow roads.'
        : 'Bent design: a curved gooseneck that reaches over the road, so light lands on the lanes, not the shoulder.'
      : cur.text
  const chips = cur.part === 'pole' ? durability : cur.chips

  return (
    <Split
      caption={
        <Caption eyebrow="Anatomy of a solar streetlight" title={cur.title} text={text} i={i} n={n}>
          {chips.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {chips.map(c => (
                <Chip key={c}>{c}</Chip>
              ))}
            </div>
          )}
        </Caption>
      }
    >
      <div className="absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_30%,rgba(250,204,21,0.12),transparent)]" />
      <div className="absolute right-3 top-3 z-10 flex gap-1 rounded-full bg-white/10 p-1 text-xs font-semibold">
        {(['straight', 'bent'] as Variant[]).map(v => (
          <button
            key={v}
            type="button"
            onClick={() => setPref(v)}
            aria-pressed={variant === v}
            className={`rounded-full px-3 py-1.5 transition-colors ${variant === v ? 'bg-amber-300 text-[#1b1400]' : 'text-zinc-300 hover:text-white'}`}
          >
            {v === 'straight' ? 'Straight' : 'Curved'}
          </button>
        ))}
      </div>
      <Streetlight
        className="absolute inset-0 h-full w-full"
        variant={variant}
        highlight={cur.part}
        sway={sway}
        lit={cur.part === 'head' ? 0.9 : 0}
        charge={cur.part === 'panel' ? 0.8 : 0}
      >
        {cur.part === 'pole' &&
          [-270, -210, -150].map((y, k) => (
            <path key={y} d={`M-226 ${y} H-140`} stroke="#a7f3d0" strokeOpacity={0.7} strokeWidth={3} strokeLinecap="round" strokeDasharray="26 16" strokeDashoffset={-p * 900 - k * 20} />
          ))}
      </Streetlight>
    </Split>
  )
}

/* ------------------------------------------------------------------ */
/* 3. Solar: one day in the life of the lamp                           */
/* ------------------------------------------------------------------ */
const SOLAR_STEPS = [
  { title: 'Sunrise: the panel wakes up', text: 'Sunlight hits the solar panel, and it starts generating electricity right away.' },
  { title: 'Daytime: charging', text: 'A charge controller sends the power down the pole and stores it in the battery.' },
  { title: 'Dusk: the sensor says go', text: 'When daylight fades, the controller switches the LED on by itself. No wiring, no switch, no timer to set.' },
  { title: 'Night: powered by the sun', text: 'The lamp runs on the energy stored during the day, until the sun rises and the cycle starts again.' }
]

export function SolarScene() {
  return <ScrollStage heightVh={360}>{p => <SolarStage p={p} />}</ScrollStage>
}

function SolarStage({ p }: { p: number }) {
  const n = SOLAR_STEPS.length
  const i = Math.min(n - 1, Math.floor(p * n))
  const step = SOLAR_STEPS[i]

  const sunT = seg(p, 0, 0.5)
  const moonT = seg(p, 0.5, 1)
  const sunUp = Math.sin(Math.PI * sunT)
  const dusk = clamp(1 - Math.abs(p - 0.52) / 0.2)
  const night = ease(seg(p, 0.45, 0.7))
  const lit = ease(seg(p, 0.5, 0.6))
  const battery = p <= 0.5 ? lerp(0.18, 1, ease(sunT)) : lerp(1, 0.58, seg(p, 0.55, 1))
  const charging = p < 0.5 && sunUp > 0.12
  const discharging = lit > 0.3

  return (
    <Split
      caption={
        <Caption eyebrow="How solar works" title={step.title} text={step.text} i={i} n={n}>
          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs font-semibold">
            <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 ${charging ? 'bg-amber-300 text-[#1b1400]' : 'bg-white/10 text-zinc-400'}`}>
              <Sun className="h-3.5 w-3.5" aria-hidden="true" /> Panel
            </span>
            <ChevronsRight className="h-4 w-4 text-zinc-500" aria-hidden="true" />
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-400/20 px-3 py-1.5 text-emerald-200">
              <BatteryCharging className="h-3.5 w-3.5" aria-hidden="true" /> Battery {Math.round(battery * 100)}%
            </span>
            <ChevronsRight className="h-4 w-4 text-zinc-500" aria-hidden="true" />
            <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 ${discharging ? 'bg-amber-300 text-[#1b1400]' : 'bg-white/10 text-zinc-400'}`}>
              <Lightbulb className="h-3.5 w-3.5" aria-hidden="true" /> LED {discharging ? 'on' : 'off'}
            </span>
          </div>
        </Caption>
      }
    >
      {/* Sky: day, dusk and night layers cross-fade */}
      <div className="absolute inset-0 bg-gradient-to-b from-sky-400 to-sky-200" />
      <div className="absolute inset-0 bg-gradient-to-b from-violet-700 via-rose-500 to-amber-400" style={{ opacity: dusk }} />
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900 to-indigo-950" style={{ opacity: night }} />
      <div className="absolute inset-0" style={{ opacity: night }}>
        {[[12, 14], [28, 28], [44, 10], [60, 22], [74, 12], [86, 30], [20, 40], [66, 42], [92, 8]].map(([x, y]) => (
          <span key={`${x}-${y}`} className="absolute h-1 w-1 rounded-full bg-white/80" style={{ left: `${x}%`, top: `${y}%` }} />
        ))}
      </div>

      {/* Sun */}
      <div
        className="absolute h-14 w-14 -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-300 shadow-[0_0_60px_20px_rgba(252,211,77,0.65)]"
        style={{ left: `${lerp(8, 92, sunT)}%`, top: `${58 - 46 * sunUp}%`, opacity: p < 0.56 ? 1 : 0 }}
      />
      {/* Moon */}
      <div
        className="absolute h-10 w-10 -translate-x-1/2 -translate-y-1/2 rounded-full bg-zinc-100 shadow-[0_0_40px_10px_rgba(228,228,231,0.35)]"
        style={{ left: `${lerp(8, 92, moonT)}%`, top: `${58 - 40 * Math.sin(Math.PI * moonT)}%`, opacity: p > 0.5 ? 1 : 0 }}
      />

      {/* Ground */}
      <div className="absolute inset-x-0 bottom-0 h-[10%] bg-emerald-950" />

      <Streetlight
        className="absolute inset-0 h-full w-full"
        ground={false}
        variant="bent"
        cutaway
        battery={battery}
        flow={p * 420}
        charging={charging}
        discharging={discharging}
        lit={lit}
        charge={sunUp}
      />
    </Split>
  )
}

/* ------------------------------------------------------------------ */
/* 4. Truck: a long trailer you scroll along                           */
/* ------------------------------------------------------------------ */
const TRAILER_W = 1900
const CAB_END = 2200
const VH = 420

function hillPath(width: number, base: number, amp: number, step: number, seed: number) {
  let d = `M0 ${VH} L0 ${base}`
  for (let x = 0; x <= width; x += step) {
    const y = base - amp * (0.55 + 0.45 * Math.sin(x * 0.011 + seed) * Math.cos(x * 0.0043 + seed * 2))
    d += ` L${x} ${y.toFixed(1)}`
  }
  return `${d} L${width} ${VH} Z`
}
const HILLS_FAR = hillPath(5200, 250, 110, 40, 1)
const HILLS_NEAR = hillPath(5200, 330, 70, 36, 4)

function Wheel({ cx, spin }: { cx: number; spin: number }) {
  return (
    <g transform={`translate(${cx} 352)`}>
      <circle r={33} fill="#0a0a0a" />
      <circle r={19} fill="#52525b" />
      <g transform={`rotate(${spin})`}>
        {[0, 60, 120].map(a => (
          <line key={a} x1={-17} x2={17} stroke="#a1a1aa" strokeWidth={3} transform={`rotate(${a})`} />
        ))}
        <circle r={5} fill="#d4d4d8" />
      </g>
    </g>
  )
}

const TRUCK_STEPS = [
  { title: 'Loaded at the warehouse', text: 'Poles go on lengthwise, lamp heads and solar panels are crated beside them.' },
  { title: 'Strapped and secured', text: 'One long trailer carries a whole project’s worth of poles in a single trip.' },
  { title: 'Ready to roll to your site', text: 'From our warehouses to the roadside, wherever your project is.' }
]

export function TruckScene() {
  return <ScrollStage heightVh={300}>{p => <TruckStage p={p} />}</ScrollStage>
}

function TruckStage({ p }: { p: number }) {
  const [ref, { w, h }] = useBox<HTMLDivElement>()
  const vw = Math.max(520, (VH * w) / h)
  const pan = Math.max(0, CAB_END + 120 - vw)
  const tx = 60 - p * pan
  const spin = p * 1800
  const i = Math.min(2, Math.floor(p * 3))
  const step = TRUCK_STEPS[i]

  return (
    <div className="relative h-full overflow-hidden rounded-3xl bg-gradient-to-b from-sky-950 via-sky-800 to-amber-200 text-white">
      <div ref={ref} className="absolute inset-0">
        <svg viewBox={`0 0 ${vw} ${VH}`} preserveAspectRatio="xMidYMax meet" className="absolute inset-0 h-full w-full" role="img" aria-label="A long truck trailer loaded with streetlight poles">
          <defs>
            <linearGradient id="tr-pole" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#f4f4f5" />
              <stop offset="1" stopColor="#71717a" />
            </linearGradient>
          </defs>

          {/* Parallax scenery */}
          <path d={HILLS_FAR} fill="#0c4a6e" opacity={0.55} transform={`translate(${-p * pan * 0.25} 0)`} />
          <path d={HILLS_NEAR} fill="#14532d" opacity={0.9} transform={`translate(${-p * pan * 0.55} 0)`} />

          {/* Road */}
          <rect x={-2000} y={364} width={6000} height={200} fill="#18181b" />
          <line x1={-2000} x2={4000} y1={364} y2={364} stroke="#3f3f46" strokeWidth={3} />
          <line x1={-2000} x2={4000} y1={398} y2={398} stroke="#fbbf24" strokeWidth={3} strokeDasharray="44 36" strokeDashoffset={p * pan * 1.4} opacity={0.8} />

          {/* Truck */}
          <g transform={`translate(${tx} 0)`}>
            {/* trailer frame */}
            <rect x={0} y={300} width={TRAILER_W} height={14} rx={3} fill="#27272a" />
            <rect x={0} y={314} width={TRAILER_W} height={9} fill="#18181b" />

            {/* poles, longest at the bottom, ends staggered like a real load */}
            {[0, 1, 2, 3].map(k => {
              const y = 288 - k * 13
              const x1 = -70 + k * 16
              const x2 = TRAILER_W - 70 - k * 22
              return (
                <g key={k}>
                  <polygon points={`${x1},${y - 6} ${x2},${y - 3.5} ${x2},${y + 3.5} ${x1},${y + 6}`} fill="url(#tr-pole)" stroke="#52525b" strokeWidth={0.8} />
                  <rect x={x1 - 3} y={y - 11} width={7} height={22} rx={1.5} fill="#a1a1aa" />
                </g>
              )
            })}
            {/* red safety flag on the longest overhang */}
            <rect x={-100} y={262} width={30} height={18} fill="#dc2626" />
            <line x1={-70} x2={-70} y1={258} y2={290} stroke="#a1a1aa" strokeWidth={2} />

            {/* straps */}
            {[420, 900, 1380].map(x => (
              <rect key={x} x={x} y={238} width={6} height={64} fill="#f59e0b" />
            ))}

            {/* crates of lamp heads and solar panels */}
            <rect x={1500} y={226} width={170} height={66} fill="#1e3a8a" stroke="#93c5fd" strokeOpacity={0.5} />
            {[1540, 1580, 1620].map(x => (
              <line key={x} x1={x} x2={x} y1={226} y2={292} stroke="#93c5fd" strokeOpacity={0.35} />
            ))}
            <rect x={1690} y={236} width={140} height={56} fill="#a16207" stroke="#713f12" />
            <rect x={1690} y={254} width={140} height={8} fill="#fde68a" opacity={0.5} />

            {/* tractor cab */}
            <path d="M1900 323 V232 Q1900 216 1916 216 H2085 L2148 262 Q2172 270 2172 292 V323 Z" fill="#15803d" />
            <path d="M1930 226 H2078 L2128 262 H1930 Z" fill="#bae6fd" opacity={0.85} />
            <rect x={1900} y={300} width={272} height={10} fill="#052e16" opacity={0.5} />
            <text x={1950} y={296} fontSize={20} fontWeight={800} fill="#ecfdf5" letterSpacing={2}>ECOSHIFT</text>
            <circle cx={2160} cy={289} r={8} fill="#fde68a" />
            <polygon points="2168,283 2300,262 2300,318 2168,295" fill="#fde68a" opacity={0.18} />

            {/* wheels */}
            {[170, 258, 346, 1962, 2034, 2128].map(cx => (
              <Wheel key={cx} cx={cx} spin={spin} />
            ))}

            {/* labels */}
            <g fontSize={15} fontWeight={700} fill="#fff" opacity={0.9}>
              <text x={0} y={196}>Poles, loaded lengthwise</text>
              <line x1={0} x2={TRAILER_W - 440} y1={206} y2={206} stroke="#fff" strokeOpacity={0.5} strokeDasharray="6 6" />
              <text x={1500} y={196}>Lamp heads &amp; solar panels</text>
            </g>
          </g>
        </svg>
      </div>

      <div className="pointer-events-none absolute inset-x-0 top-0 bg-gradient-to-b from-black/55 via-black/25 to-transparent p-5 sm:p-8">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-300">On the road</p>
        <div key={i} style={{ animation: 'ecoFade .45s ease both' }}>
          <h3 className="mt-1 text-2xl font-extrabold tracking-tight text-white sm:text-4xl">{step.title}</h3>
          <p className="mt-1.5 max-w-md text-sm leading-relaxed text-zinc-100 sm:text-base">{step.text}</p>
        </div>
        <Dots n={3} i={i} />
      </div>

      <div className="absolute bottom-4 right-5 flex items-center gap-1.5 text-xs font-semibold text-white/80">
        Keep scrolling <ChevronsRight className="h-4 w-4 animate-pulse" aria-hidden="true" />
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* 5. Reach: truck route across the islands                            */
/* ------------------------------------------------------------------ */
const ROUTE: [number, number][] = [
  [122, 90],
  [172, 190],
  [206, 295],
  [244, 316]
]
const SEG_LEN = ROUTE.slice(1).map((pt, k) => Math.hypot(pt[0] - ROUTE[k][0], pt[1] - ROUTE[k][1]))
const ROUTE_LEN = SEG_LEN.reduce((a, b) => a + b, 0)
const CUM = SEG_LEN.reduce<number[]>((acc, l) => [...acc, acc[acc.length - 1] + l / ROUTE_LEN], [0])

function along(r: number): [number, number] {
  let d = r * ROUTE_LEN
  for (let k = 0; k < SEG_LEN.length; k++) {
    if (d <= SEG_LEN[k] || k === SEG_LEN.length - 1) {
      const t = clamp(d / SEG_LEN[k])
      return [lerp(ROUTE[k][0], ROUTE[k + 1][0], t), lerp(ROUTE[k][1], ROUTE[k + 1][1], t)]
    }
    d -= SEG_LEN[k]
  }
  return ROUTE[0]
}

const POINTS = [
  { x: 92, y: 70, label: 'Head Office', region: 0, th: 0, dx: -10, anchor: 'end' as const },
  { x: 122, y: 90, label: 'NCR Warehouse', region: 0, th: 0, dx: 10, anchor: 'start' as const },
  { x: 172, y: 190, label: 'Cebu', region: 1, th: CUM[1], dx: 12, anchor: 'start' as const },
  { x: 206, y: 295, label: 'Davao', region: 2, th: CUM[2], dx: -10, anchor: 'end' as const },
  { x: 244, y: 316, label: 'Cagayan de Oro', region: 2, th: 1, dx: -10, anchor: 'end' as const }
]

// [cx, cy, rx, ry, rotation, region]
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

const kindLabel: Record<Branch['kind'], string> = { office: 'Office', warehouse: 'Warehouse', branch: 'Branch' }

export function ReachScene({ regions }: { regions: Region[] }) {
  return <ScrollStage heightVh={320}>{p => <ReachStage p={p} regions={regions} />}</ScrollStage>
}

function ReachStage({ p, regions }: { p: number; regions: Region[] }) {
  const region = p < 0.34 ? 0 : p < 0.67 ? 1 : 2
  const r = p < 0.34 ? 0 : p < 0.67 ? lerp(0, CUM[1], ease(seg(p, 0.34, 0.6))) : lerp(CUM[1], 1, ease(seg(p, 0.67, 0.95)))
  const [tx, ty] = along(r)
  const active = regions[region]

  return (
    <Split
      caption={
        <Caption eyebrow="Delivered nationwide" title={active.name} text={active.blurb} i={region} n={regions.length}>
          <ul className="mt-3 space-y-2">
            {active.branches.map(b => (
              <li key={b.name}>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${b.name} ${b.address}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-start justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 px-3.5 py-2.5 transition-colors hover:border-amber-300/50 hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
                >
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold">
                      {b.name} <span className="ml-1 text-[0.65rem] font-bold uppercase tracking-wider text-amber-300">{kindLabel[b.kind]}</span>
                    </span>
                    <span className="mt-0.5 line-clamp-2 block text-xs leading-relaxed text-zinc-400">{b.address}</span>
                  </span>
                  <ArrowUpRight className="mt-0.5 h-4 w-4 shrink-0 text-zinc-500 group-hover:text-amber-300" aria-hidden="true" />
                </a>
              </li>
            ))}
          </ul>
        </Caption>
      }
    >
      <div className="absolute inset-0 bg-[radial-gradient(60%_60%_at_50%_45%,rgba(22,163,74,0.18),transparent)]" />
      <svg viewBox="0 0 320 390" className="absolute inset-0 h-full w-full p-3" role="img" aria-label="Delivery route from Luzon through Visayas to Mindanao">
        <defs>
          <pattern id="rc-dots" width="16" height="16" patternUnits="userSpaceOnUse">
            <circle cx="1.5" cy="1.5" r="1" fill="rgba(74,222,128,.14)" />
          </pattern>
        </defs>
        <rect width="320" height="390" fill="url(#rc-dots)" rx="16" />

        {ISLANDS.map(([cx, cy, rx, ry, rot, reg], k) => (
          <ellipse
            key={k}
            cx={cx}
            cy={cy}
            rx={rx}
            ry={ry}
            transform={`rotate(${rot} ${cx} ${cy})`}
            fill={reg === region ? 'rgba(74,222,128,.32)' : 'rgba(74,222,128,.08)'}
            stroke={reg === region ? 'rgba(134,239,172,.9)' : 'rgba(74,222,128,.3)'}
            strokeWidth={1.2}
            style={{ transition: 'fill .5s, stroke .5s' }}
          />
        ))}
        {[
          ['LUZON', 105, 24],
          ['VISAYAS', 190, 140],
          ['MINDANAO', 222, 372]
        ].map(([label, x, y], k) => (
          <text key={label} x={x as number} y={y as number} textAnchor="middle" fontSize="10" fontWeight="700" letterSpacing="2.5" fill={k === region ? '#fde68a' : 'rgba(187,247,208,.55)'}>
            {label}
          </text>
        ))}

        {/* Route: faint full path + bright part the truck has covered */}
        <path d={`M${ROUTE.map(pt => pt.join(' ')).join(' L')}`} fill="none" stroke="rgba(187,247,208,.35)" strokeWidth={1.5} strokeDasharray="3 5" />
        <path d={`M${ROUTE.map(pt => pt.join(' ')).join(' L')}`} fill="none" stroke="#fbbf24" strokeWidth={2.2} strokeLinecap="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - r} />

        {POINTS.map(pt => {
          const on = r >= pt.th - 0.02
          return (
            <g key={pt.label} style={{ opacity: on ? 1 : 0.25, transition: 'opacity .4s' }}>
              {on && pt.region === region && <circle cx={pt.x} cy={pt.y} r={6} fill="#fbbf24" opacity={0.5} className="origin-center animate-ping [transform-box:fill-box]" />}
              <circle cx={pt.x} cy={pt.y} r={5} fill={on ? '#fbbf24' : '#4ade80'} stroke="#04110a" strokeWidth={2} />
              <text x={pt.x + pt.dx} y={pt.y + 3.5} textAnchor={pt.anchor} fontSize="9" fontWeight="600" fill="#ecfdf5">
                {pt.label}
              </text>
            </g>
          )
        })}

        {/* Truck marker */}
        <g transform={`translate(${tx} ${ty - 7})`}>
          <rect x={-10} y={-6} width={12} height={8} rx={1.5} fill="#fbbf24" />
          <rect x={2} y={-4} width={6} height={6} rx={1.5} fill="#f59e0b" />
          <circle cx={-6} cy={3} r={2} fill="#171717" />
          <circle cx={5} cy={3} r={2} fill="#171717" />
        </g>
      </svg>
    </Split>
  )
}

/* ------------------------------------------------------------------ */
/* 6. Installation: city, highway, provincial road                     */
/* ------------------------------------------------------------------ */
const ACTS = [
  {
    id: 'city',
    label: 'City streets',
    title: 'Lighting the city block',
    text: 'Straight poles along the sidewalk keep crossings, storefronts, and pedestrians visible after dark.',
    variant: 'straight' as Variant,
    k: 0.5,
    baseY: 296,
    xs: [130, 350, 570]
  },
  {
    id: 'highway',
    label: 'Highways',
    title: 'Reaching across wide lanes',
    text: 'Curved arms stretch over the carriageway so the light lands on the lanes, not the shoulder.',
    variant: 'bent' as Variant,
    k: 0.54,
    baseY: 286,
    xs: [150, 380, 610]
  },
  {
    id: 'rural',
    label: 'Provincial roads',
    title: 'Power where the grid isn’t',
    text: 'Solar needs no trenching and no power line, so poles go up fast, even in far-flung barangays.',
    variant: 'straight' as Variant,
    k: 0.46,
    baseY: 302,
    xs: [120, 350, 580]
  }
]
const INSTALL_STEPS = ['Dig and pour the foundation', 'Crane lifts the pole', 'Mount the lamp and solar panel', 'Switch on']

function CityBG() {
  const buildings: [number, number, number][] = [[-60, 150, 70], [20, 110, 56], [90, 190, 80], [180, 130, 60], [250, 170, 72], [330, 120, 64], [400, 200, 84], [490, 140, 66], [566, 175, 76], [650, 120, 70], [730, 160, 70]]
  return (
    <g>
      <rect x={-1000} y={-700} width={2700} height={1000} fill="url(#sky-city)" />
      {buildings.map(([x, h, w], bi) => (
        <g key={x}>
          <rect x={x} y={296 - h} width={w} height={h} fill="#1c1b3a" />
          {Array.from({ length: Math.floor(h / 24) }, (_, r) =>
            Array.from({ length: Math.floor(w / 20) }, (_, c) =>
              (bi * 7 + r * 3 + c * 5) % 4 === 0 ? <rect key={`${r}-${c}`} x={x + 7 + c * 20} y={296 - h + 10 + r * 24} width={9} height={11} fill="#fde68a" opacity={0.8} /> : null
            )
          )}
        </g>
      ))}
      <rect x={-1000} y={296} width={2700} height={10} fill="#57534e" />
      <rect x={-1000} y={306} width={2700} height={120} fill="#1c1917" />
      <line x1={-1000} x2={1700} y1={338} y2={338} stroke="#e7e5e4" strokeWidth={3} strokeDasharray="30 24" opacity={0.6} />
    </g>
  )
}

function HighwayBG() {
  return (
    <g>
      <rect x={-1000} y={-700} width={2700} height={1000} fill="url(#sky-hwy)" />
      <path d="M-1000 286 L-1000 240 Q-700 190 -420 250 T120 236 T480 252 T900 226 T1700 250 V286 Z" fill="#0c2a4a" />
      <path d="M-1000 286 L-1000 262 Q-600 236 -200 262 T300 258 T800 266 T1700 256 V286 Z" fill="#14343f" />
      <rect x={-1000} y={286} width={2700} height={140} fill="#1c1917" />
      <line x1={-1000} x2={1700} y1={296} y2={296} stroke="#e7e5e4" strokeWidth={2} opacity={0.7} />
      <line x1={-1000} x2={1700} y1={322} y2={322} stroke="#e7e5e4" strokeWidth={3} strokeDasharray="42 30" opacity={0.7} />
      <line x1={-1000} x2={1700} y1={350} y2={350} stroke="#e7e5e4" strokeWidth={3} strokeDasharray="42 30" opacity={0.7} />
      {/* guardrail */}
      <line x1={-1000} x2={1700} y1={288} y2={288} stroke="#a1a1aa" strokeWidth={3} />
      {Array.from({ length: 36 }, (_, k) => (
        <rect key={k} x={-300 + k * 60} y={288} width={4} height={10} fill="#71717a" />
      ))}
    </g>
  )
}

function RuralBG() {
  return (
    <g>
      <rect x={-1000} y={-700} width={2700} height={1000} fill="url(#sky-rural)" />
      <polygon points="-300,262 -170,170 -60,262" fill="#14532d" opacity={0.65} />
      <polygon points="-100,262 80,150 220,262" fill="#14532d" />
      <polygon points="180,262 330,184 470,262" fill="#166534" opacity={0.8} />
      <polygon points="420,262 590,140 760,262" fill="#14532d" />
      <polygon points="700,262 840,190 980,262" fill="#166534" opacity={0.8} />
      <rect x={-1000} y={256} width={2700} height={46} fill="#4d7c0f" />
      {Array.from({ length: 26 }, (_, k) => (
        <line key={k} x1={-300 + k * 60} x2={-300 + k * 60 + 24} y1={256} y2={302} stroke="#3f6212" strokeWidth={3} opacity={0.7} />
      ))}
      {/* coconut trees */}
      {[40, 470, 690].map(x => (
        <g key={x}>
          <path d={`M${x} 256 Q${x + 8} 210 ${x + 3} 168`} stroke="#713f12" strokeWidth={5} fill="none" strokeLinecap="round" />
          {[-34, -12, 12, 34].map(a => (
            <ellipse key={a} cx={x + 3 + a} cy={170 + Math.abs(a) * 0.25} rx={24} ry={5} transform={`rotate(${a * 0.9} ${x + 3} 168)`} fill="#166534" />
          ))}
        </g>
      ))}
      {/* nipa hut */}
      <polygon points="262,256 292,228 322,256" fill="#a16207" />
      <rect x={270} y={256} width={44} height={0} />
      <rect x={272} y={248} width={40} height={8} fill="#78350f" />
      <rect x={-1000} y={298} width={2700} height={5} fill="#78350f" />
      <rect x={-1000} y={303} width={2700} height={120} fill="#3f3f46" />
      <line x1={-1000} x2={1700} y1={338} y2={338} stroke="#fbbf24" strokeWidth={3} strokeDasharray="34 26" opacity={0.8} />
    </g>
  )
}

function InstallPole({ x, y, k, s, variant, crane }: { x: number; y: number; k: number; s: number; variant: Variant; crane: boolean }) {
  if (s <= 0) return null
  const found = ease(seg(s, 0, 0.2))
  const L = ease(seg(s, 0.22, 0.55))
  const M = ease(seg(s, 0.55, 0.75))
  const lit = ease(seg(s, 0.78, 0.92))
  const theta = 80 * (1 - L)
  const rad = (theta * Math.PI) / 180
  const H = 340 * k
  const attach: [number, number] = [x - Math.sin(rad) * H * 0.8, y - Math.cos(rad) * H * 0.8]
  const cx = x - 175
  const tip: [number, number] = [x - 90, y - 175]
  const craneOpacity = ease(seg(s, 0.08, 0.2)) * (1 - ease(seg(s, 0.78, 0.88)))

  return (
    <g>
      {/* foundation */}
      <rect x={x - 20} y={y + 2} width={40} height={16 * found} fill="#78716c" stroke="#a8a29e" strokeWidth={1} />
      {s > 0.2 && (
        <g transform={`translate(${x} ${y}) rotate(${-theta}) scale(${k})`}>
          <StreetlightGroup variant={variant} lit={lit} topOffset={-80 * (1 - M)} topOpacity={M} />
        </g>
      )}
      {crane && craneOpacity > 0.01 && (
        <g opacity={craneOpacity}>
          <rect x={cx} y={y - 26} width={86} height={22} rx={4} fill="#f59e0b" />
          <rect x={cx + 86} y={y - 38} width={30} height={34} rx={4} fill="#d97706" />
          <rect x={cx + 92} y={y - 33} width={18} height={14} rx={2} fill="#bae6fd" />
          {[18, 66, 104].map(dx => (
            <circle key={dx} cx={cx + dx} cy={y - 4} r={9} fill="#171717" />
          ))}
          <line x1={cx + 20} y1={y - 26} x2={tip[0]} y2={tip[1]} stroke="#fbbf24" strokeWidth={6} strokeLinecap="round" />
          <line x1={tip[0]} y1={tip[1]} x2={attach[0]} y2={attach[1]} stroke="#e5e5e5" strokeWidth={1.5} />
        </g>
      )}
    </g>
  )
}

export function InstallScene() {
  return <ScrollStage heightVh={420}>{p => <InstallStage p={p} />}</ScrollStage>
}

function InstallStage({ p }: { p: number }) {
  const actI = Math.min(2, Math.floor(p * 3))
  const t = p * 3 - actI
  const act = ACTS[actI]
  const stages = act.xs.map((_, i) => seg(t, i * 0.3, i * 0.3 + 0.4))
  const cur = stages.findIndex(s => s > 0 && s < 1)
  const focus = cur >= 0 ? cur : stages[0] <= 0 ? 0 : 2
  const step = Math.min(3, Math.floor(stages[focus] * 4))

  return (
    <Split
      caption={
        <Caption eyebrow="Installation" title={act.title} text={act.text} i={actI} n={3}>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {ACTS.map((a, k) => (
              <span key={a.id} className={`rounded-full px-3 py-1 text-xs font-semibold ${k === actI ? 'bg-amber-300 text-[#1b1400]' : 'bg-white/10 text-zinc-400'}`}>
                {a.label}
              </span>
            ))}
          </div>
          <ol className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
            {INSTALL_STEPS.map((s, k) => (
              <li key={s} className={`flex items-start gap-2 transition-colors ${k === step ? 'text-white' : k < step ? 'text-emerald-300' : 'text-zinc-500'}`}>
                <span className={`mt-px flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[0.6rem] font-bold ${k === step ? 'bg-amber-300 text-[#1b1400]' : 'bg-white/10'}`}>{k + 1}</span>
                {s}
              </li>
            ))}
          </ol>
        </Caption>
      }
    >
      <svg viewBox="0 0 700 360" preserveAspectRatio="xMidYMax meet" className="absolute inset-0 h-full w-full" role="img" aria-label={`Installing solar streetlights on a ${act.label.toLowerCase()} road`}>
        <defs>
          <linearGradient id="sky-city" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#0f172a" />
            <stop offset="0.6" stopColor="#3b2a6b" />
            <stop offset="1" stopColor="#c2410c" />
          </linearGradient>
          <linearGradient id="sky-hwy" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#0b1e3f" />
            <stop offset="0.65" stopColor="#1e40af" />
            <stop offset="1" stopColor="#f59e0b" />
          </linearGradient>
          <linearGradient id="sky-rural" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#1e3a5f" />
            <stop offset="0.65" stopColor="#9a3412" />
            <stop offset="1" stopColor="#fdba74" />
          </linearGradient>
        </defs>
        <StreetlightDefs />

        <g key={act.id} style={{ animation: 'ecoFade .5s ease both' }}>
          {act.id === 'city' && <CityBG />}
          {act.id === 'highway' && <HighwayBG />}
          {act.id === 'rural' && <RuralBG />}
        </g>

        {act.xs.map((x, i) => (
          <InstallPole key={`${act.id}-${i}`} x={x} y={act.baseY} k={act.k} s={stages[i]} variant={act.variant} crane={i === cur} />
        ))}
      </svg>
    </Split>
  )
}