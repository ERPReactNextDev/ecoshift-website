'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'
import { ArrowUpRight, BatteryCharging, ChevronsRight, Lightbulb, Sun } from 'lucide-react'
import ScrollStage from './ScrollStage'
import type { Milestone, Region } from './Scenes'
import {
  ACTS,
  CHAPTERS,
  INSTALL_STEPS,
  MAP_POINTS,
  PARTS,
  SOLAR_STEPS,
  TRUCK_STEPS,
  WORLD_HEIGHT_VH,
  chapterAt,
  fadeAt,
  installState,
  reachState,
  solarState
} from './world/content'

interface Props {
  milestones: Milestone[]
  regions: Region[]
  durability: string[]
  onFail: () => void
}

export default function World3D(props: Props) {
  return <ScrollStage heightVh={WORLD_HEIGHT_VH}>{p => <Stage p={p} {...props} />}</ScrollStage>
}

const kindLabel = { office: 'Office', warehouse: 'Warehouse', branch: 'Branch' } as const

function Chip({ children, active }: { children: ReactNode; active?: boolean }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${active ? 'bg-amber-300 text-[#1b1400]' : 'border border-white/15 bg-white/5 text-zinc-200'}`}>
      {children}
    </span>
  )
}

function Dots({ n, i }: { n: number; i: number }) {
  return (
    <div className="mt-3 flex gap-1.5" aria-hidden="true">
      {Array.from({ length: n }, (_, k) => (
        <span key={k} className={`h-1.5 rounded-full transition-all duration-300 ${k === i ? 'w-8 bg-amber-300' : 'w-3 bg-white/25'}`} />
      ))}
    </div>
  )
}

function Stage({ p, milestones, regions, durability, onFail }: Props & { p: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const pRef = useRef(p)
  pRef.current = p
  const labelRefs = useRef<(HTMLElement | null)[]>([])
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let cancelled = false
    let world: { dispose(): void } | null = null
    const canvas = canvasRef.current
    const lost = () => onFail()
    canvas?.addEventListener('webglcontextlost', lost)
    ;(async () => {
      try {
        const { createWorld } = await import('./world/engine')
        if (cancelled || !canvasRef.current) return
        world = createWorld({
          canvas: canvasRef.current,
          getProgress: () => pRef.current,
          milestoneCount: milestones.length,
          labelEls: labelRefs.current
        })
        setReady(true)
      } catch (err) {
        console.error('[about] 3D scene failed, using fallback', err)
        if (!cancelled) onFail()
      }
    })()
    return () => {
      cancelled = true
      canvas?.removeEventListener('webglcontextlost', lost)
      world?.dispose()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const { i, q } = chapterAt(p)
  const chapter = CHAPTERS[i]

  /* ---- caption for the current chapter ---- */
  let eyebrow: string = chapter.label
  let title = ''
  let text = ''
  let step = 0
  let n = 1
  let extra: ReactNode = null

  if (chapter.id === 'story') {
    const f = q * (milestones.length - 1)
    step = Math.round(f)
    n = milestones.length
    const m = milestones[step]
    eyebrow = 'How it started'
    title = m.title
    text = m.text
    extra = <Chip active>{m.label}</Chip>
  } else if (chapter.id === 'anatomy') {
    n = PARTS.length
    step = Math.min(n - 1, Math.floor(q * n))
    const part = PARTS[step]
    eyebrow = 'Anatomy of a solar streetlight'
    title = part.title
    text = part.text
    const chips = part.key === 'pole' ? durability : part.chips
    extra =
      chips.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {chips.map(c => (
            <Chip key={c}>{c}</Chip>
          ))}
        </div>
      ) : null
  } else if (chapter.id === 'solar') {
    n = SOLAR_STEPS.length
    step = Math.min(n - 1, Math.floor(q * n))
    const st = solarState(q)
    eyebrow = 'How solar works'
    title = SOLAR_STEPS[step].title
    text = SOLAR_STEPS[step].text
    extra = (
      <div className="flex flex-wrap items-center gap-2">
        <Chip active={st.charging}>
          <Sun className="h-3.5 w-3.5" aria-hidden="true" /> Panel
        </Chip>
        <ChevronsRight className="h-4 w-4 text-zinc-500" aria-hidden="true" />
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-400/20 px-3 py-1 text-xs font-semibold text-emerald-200">
          <BatteryCharging className="h-3.5 w-3.5" aria-hidden="true" /> Battery {Math.round(st.battery * 100)}%
        </span>
        <ChevronsRight className="h-4 w-4 text-zinc-500" aria-hidden="true" />
        <Chip active={st.discharging}>
          <Lightbulb className="h-3.5 w-3.5" aria-hidden="true" /> LED {st.discharging ? 'on' : 'off'}
        </Chip>
      </div>
    )
  } else if (chapter.id === 'truck') {
    n = TRUCK_STEPS.length
    step = Math.min(n - 1, Math.floor(q * n))
    eyebrow = 'On the road'
    title = TRUCK_STEPS[step].title
    text = TRUCK_STEPS[step].text
    extra = (
      <p className="flex items-center gap-1.5 text-xs font-semibold text-amber-200">
        Keep scrolling <ChevronsRight className="h-4 w-4 animate-pulse" aria-hidden="true" />
      </p>
    )
  } else if (chapter.id === 'reach') {
    const { region } = reachState(q)
    n = regions.length
    step = region
    const active = regions[region]
    eyebrow = 'Delivered nationwide'
    title = active.name
    text = active.blurb
    extra = (
      <ul className="space-y-2">
        {active.branches.map(b => (
          <li key={b.name}>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${b.name} ${b.address}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-start justify-between gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2 transition-colors hover:border-amber-300/50 hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
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
    )
  } else {
    const st = installState(q)
    const act = ACTS[st.act]
    n = 3
    step = st.act
    eyebrow = 'Installation'
    title = act.title
    text = act.text
    extra = (
      <div>
        <div className="flex flex-wrap gap-1.5">
          {ACTS.map((a, k) => (
            <Chip key={a.id} active={k === st.act}>
              {a.label}
            </Chip>
          ))}
        </div>
        <ol className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs">
          {INSTALL_STEPS.map((s, k) => (
            <li key={s} className={`flex items-start gap-2 transition-colors ${k === st.step ? 'text-white' : k < st.step ? 'text-emerald-300' : 'text-zinc-500'}`}>
              <span className={`mt-px flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[0.6rem] font-bold ${k === st.step ? 'bg-amber-300 text-[#1b1400]' : 'bg-white/10'}`}>{k + 1}</span>
              {s}
            </li>
          ))}
        </ol>
      </div>
    )
  }

  return (
    <div className="relative h-full overflow-hidden rounded-3xl bg-[#04110a] text-white">
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" role="img" aria-label="Interactive 3D journey from the first lamp to roadside installation" />

      {!ready && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#04110a] text-sm font-semibold text-zinc-300">
          <span className="mr-3 h-4 w-4 animate-spin rounded-full border-2 border-amber-300 border-t-transparent" aria-hidden="true" />
          Loading 3D scene…
        </div>
      )}

      {/* map labels, positioned by the engine each frame */}
      {MAP_POINTS.map((pt, k) => (
        <span
          key={pt.id}
          ref={el => {
            labelRefs.current[k] = el
          }}
          className="pointer-events-none absolute left-0 top-0 whitespace-nowrap rounded-full bg-black/70 px-2.5 py-1 text-[11px] font-semibold text-white opacity-0 shadow-lg transition-opacity"
        >
          {pt.label}
        </span>
      ))}

      {/* chapter pills + overall progress */}
      <div className="pointer-events-none absolute inset-x-0 top-0 bg-gradient-to-b from-black/55 to-transparent px-3 pb-6 pt-3 sm:px-5">
        <ol className="flex gap-1.5 overflow-hidden text-[11px] font-semibold sm:text-xs" aria-label="Chapters">
          {CHAPTERS.map((c, k) => (
            <li key={c.id} className={`whitespace-nowrap rounded-full px-2.5 py-1 transition-colors ${k === i ? 'bg-amber-300 text-[#1b1400]' : 'bg-white/10 text-zinc-300'} ${k !== i ? 'hidden sm:block' : ''}`}>
              {c.label}
            </li>
          ))}
        </ol>
        <div className="mt-2 h-0.5 rounded-full bg-white/15">
          <div className="h-full rounded-full bg-amber-300" style={{ width: `${p * 100}%` }} />
        </div>
      </div>

      {/* caption card */}
      <div className="pointer-events-auto absolute inset-x-3 bottom-3 rounded-2xl border border-white/10 bg-black/55 p-4 backdrop-blur-md sm:inset-x-auto sm:bottom-5 sm:left-5 sm:w-[27rem] sm:p-5">
        <p className="text-[0.7rem] font-bold uppercase tracking-[0.18em] text-amber-300">{eyebrow}</p>
        <div key={`${chapter.id}-${step}`} style={{ animation: 'ecoFade .45s ease both' }}>
          <h3 className="mt-1 text-xl font-extrabold leading-tight tracking-tight sm:text-2xl">{title}</h3>
          <p className="mt-1.5 text-sm leading-relaxed text-zinc-200">{text}</p>
          {extra && <div className="mt-3">{extra}</div>}
        </div>
        <Dots n={n} i={step} />
      </div>

      {/* dip to black between chapters */}
      <div className="pointer-events-none absolute inset-0 bg-black" style={{ opacity: fadeAt(p) }} aria-hidden="true" />
    </div>
  )
}