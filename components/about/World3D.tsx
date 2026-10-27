'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import {
  ArrowRight,
  ArrowUpRight,
  Award,
  BatteryCharging,
  Building2,
  Check,
  ChevronsRight,
  ClipboardCheck,
  Headset,
  Landmark,
  Lightbulb,
  MapPin,
  Monitor,
  Route,
  Settings,
  Sun,
  Users,
  Wrench,
  type LucideIcon
} from 'lucide-react'
import { btnAmber, btnGhostDark } from '@/lib/ui'
import ScrollStage from './ScrollStage'
import type { AboutData, IconKey } from './world/data'
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
  ease,
  fadeAt,
  installState,
  reachState,
  reveal,
  seg,
  solarState
} from './world/content'

interface Props {
  data: AboutData
  onFail: () => void
}

export default function World3D(props: Props) {
  return <ScrollStage heightVh={WORLD_HEIGHT_VH}>{p => <Stage p={p} {...props} />}</ScrollStage>
}

const ICONS: Record<IconKey, LucideIcon> = {
  landmark: Landmark,
  route: Route,
  users: Users,
  building: Building2,
  award: Award,
  settings: Settings,
  headset: Headset,
  mapPin: MapPin,
  monitor: Monitor,
  clipboard: ClipboardCheck,
  wrench: Wrench
}

const kindLabel = { office: 'Office', warehouse: 'Warehouse', branch: 'Branch' } as const
const glass = 'rounded-2xl border border-white/10 bg-black/50 backdrop-blur-md'

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

const eyebrowCls = 'text-[0.7rem] font-bold uppercase tracking-[0.18em] text-amber-300'

function Stage({ p, data, onFail }: Props & { p: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const pRef = useRef(p)
  pRef.current = p
  const labelRefs = useRef<(HTMLElement | null)[]>([])
  const [ready, setReady] = useState(false)
  const { milestones, regions, durability } = data

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
  const out = 1 - ease(seg(q, 0.9, 1))
  const item = (k: number): CSSProperties => {
    const a = reveal(q, k)
    return { opacity: a, transform: `translateY(${(1 - a) * 22}px)`, pointerEvents: a > 0.6 ? 'auto' : 'none' }
  }

  /* ---------- caption-card chapters ---------- */
  let card: { eyebrow: string; title: string; text: string; step: number; n: number; extra: ReactNode } | null = null

  if (chapter.id === 'story') {
    const f = q * (milestones.length - 1)
    const step = Math.round(f)
    const m = milestones[step]
    card = { eyebrow: 'How it started', title: m.title, text: m.text, step, n: milestones.length, extra: <Chip active>{m.label}</Chip> }
  } else if (chapter.id === 'anatomy') {
    const n = PARTS.length
    const step = Math.min(n - 1, Math.floor(q * n))
    const part = PARTS[step]
    const chips = part.key === 'pole' ? durability : part.chips
    card = {
      eyebrow: 'Anatomy of a solar streetlight',
      title: part.title,
      text: part.text,
      step,
      n,
      extra:
        chips.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {chips.map(c => (
              <Chip key={c}>{c}</Chip>
            ))}
          </div>
        ) : null
    }
  } else if (chapter.id === 'solar') {
    const n = SOLAR_STEPS.length
    const step = Math.min(n - 1, Math.floor(q * n))
    const st = solarState(q)
    card = {
      eyebrow: 'How solar works',
      title: SOLAR_STEPS[step].title,
      text: SOLAR_STEPS[step].text,
      step,
      n,
      extra: (
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
    }
  } else if (chapter.id === 'truck') {
    const n = TRUCK_STEPS.length
    const step = Math.min(n - 1, Math.floor(q * n))
    card = {
      eyebrow: 'On the road',
      title: TRUCK_STEPS[step].title,
      text: TRUCK_STEPS[step].text,
      step,
      n,
      extra: (
        <p className="flex items-center gap-1.5 text-xs font-semibold text-amber-200">
          Keep scrolling <ChevronsRight className="h-4 w-4 animate-pulse" aria-hidden="true" />
        </p>
      )
    }
  } else if (chapter.id === 'reach') {
    const { region } = reachState(q)
    const active = regions[region]
    card = {
      eyebrow: 'Delivered nationwide',
      title: active.name,
      text: active.blurb,
      step: region,
      n: regions.length,
      extra: (
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
    }
  } else if (chapter.id === 'install') {
    const st = installState(q)
    const act = ACTS[st.act]
    card = {
      eyebrow: 'Installation',
      title: act.title,
      text: act.text,
      step: st.act,
      n: 3,
      extra: (
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
  }

  /* ---------- page-section chapters ---------- */
  const shell = 'pointer-events-none absolute inset-0 flex flex-col justify-between gap-3 p-3 pt-16 sm:p-8 sm:pt-20'

  const heading = (eyebrow: string, title: string, text?: string) => (
    <div className="max-w-2xl" style={item(-1)}>
      <p className={eyebrowCls}>{eyebrow}</p>
      <h2 className="mt-1 text-2xl font-extrabold leading-tight tracking-tight sm:text-4xl">{title}</h2>
      {text && <p className="mt-2 line-clamp-4 text-sm leading-relaxed text-zinc-200 sm:line-clamp-none sm:text-base">{text}</p>}
    </div>
  )

  let page: ReactNode = null

  if (chapter.id === 'hero') {
    const h = data.hero
    page = (
      <div className={shell} style={{ opacity: out }}>
        <div className="pointer-events-auto max-w-3xl">
          <p className="inline-flex items-center gap-2 rounded-full border border-amber-300/30 bg-amber-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-amber-200">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-300" aria-hidden="true" />
            {h.eyebrow}
          </p>
          <h1 className="mt-4 text-3xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
            {h.titleStart} <span className="bg-gradient-to-r from-amber-200 to-amber-400 bg-clip-text text-transparent">{h.titleAccent}</span> {h.titleEnd}
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-zinc-200 sm:text-lg">{h.sub}</p>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <Link href="/products" className={btnAmber}>
              Browse Products <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link href="/contact" className={btnGhostDark}>
              Contact Us
            </Link>
          </div>
        </div>
        <div>
          <dl className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
            {data.stats.map(s => (
              <div key={s.label} className={`${glass} p-3 sm:p-4`}>
                <dd className="text-2xl font-extrabold tracking-tight text-amber-300 sm:text-4xl">{s.value}</dd>
                <dt className="mt-0.5 text-[0.7rem] font-medium text-zinc-300 sm:text-sm">{s.label}</dt>
              </div>
            ))}
          </dl>
          <p className="mt-3 flex items-center justify-center gap-2 text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-amber-200">
            Scroll to follow the light <span className="inline-block animate-bounce" aria-hidden="true">↓</span>
          </p>
        </div>
      </div>
    )
  } else if (chapter.id === 'clients') {
    page = (
      <div className={shell}>
        {heading(data.clientsIntro.eyebrow, data.clientsIntro.title, data.clientsIntro.text)}
        <div>
          <ul className="grid grid-cols-2 gap-2 sm:gap-4 lg:grid-cols-4">
            {data.clientTypes.map((c, k) => {
              const Icon = ICONS[c.icon]
              return (
                <li key={c.title} className={`${glass} p-3 sm:p-5`} style={item(k)}>
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-600 to-emerald-500 text-white sm:h-11 sm:w-11">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <h3 className="mt-2 text-sm font-bold sm:mt-3 sm:text-lg">{c.title}</h3>
                  <p className="mt-1 line-clamp-3 text-xs leading-relaxed text-zinc-300 sm:line-clamp-none sm:text-sm">{c.text}</p>
                </li>
              )
            })}
          </ul>
          {data.clientNames.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2" style={item(4)}>
              {data.clientNames.map(n => (
                <Chip key={n}>{n}</Chip>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  } else if (chapter.id === 'why') {
    page = (
      <div className={shell}>
        {heading(data.whyIntro.eyebrow, data.whyIntro.title)}
        <ul className="grid grid-cols-2 gap-2 sm:gap-4 lg:grid-cols-4">
          {data.pillars.map((c, k) => {
            const Icon = ICONS[c.icon]
            return (
              <li key={c.title} className={`${glass} relative overflow-hidden p-3 sm:p-5`} style={item(k)}>
                <span className="pointer-events-none absolute -right-1 -top-3 text-6xl font-extrabold text-white/5 sm:text-7xl" aria-hidden="true">
                  {k + 1}
                </span>
                <span className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-600 to-emerald-500 text-white sm:h-11 sm:w-11">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <h3 className="relative mt-2 text-sm font-bold leading-snug sm:mt-3 sm:text-base">{c.title}</h3>
                <p className="relative mt-1 line-clamp-3 text-xs leading-relaxed text-zinc-300 sm:line-clamp-none sm:text-sm">{c.text}</p>
              </li>
            )
          })}
        </ul>
      </div>
    )
  } else if (chapter.id === 'mission') {
    page = (
      <div className={`${shell} justify-end`}>
        <div className="grid gap-2 sm:gap-4 lg:grid-cols-5">
          <div className="rounded-2xl bg-gradient-to-br from-brand-600/90 to-emerald-600/90 p-4 shadow-xl backdrop-blur-md sm:p-8 lg:col-span-3" style={item(0)}>
            <p className="text-[0.7rem] font-bold uppercase tracking-[0.18em] text-emerald-100">Our mission</p>
            <p className="mt-2 text-base font-bold leading-snug tracking-tight sm:mt-3 sm:text-2xl lg:text-3xl">{data.mission}</p>
          </div>
          <div className={`${glass} p-4 sm:p-6 lg:col-span-2`} style={item(1)}>
            <h2 className="text-base font-extrabold tracking-tight sm:text-xl">What we do</h2>
            <ul className="mt-2 space-y-2 sm:mt-4 sm:space-y-3">
              {data.whatWeDo.map(w => (
                <li key={w} className="flex gap-2.5 text-xs leading-relaxed text-zinc-200 sm:text-sm">
                  <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-brand-600 text-white sm:h-5 sm:w-5">
                    <Check className="h-3 w-3" strokeWidth={3} aria-hidden="true" />
                  </span>
                  {w}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    )
  } else if (chapter.id === 'services') {
    page = (
      <div className={shell}>
        {heading(data.servicesIntro.eyebrow, data.servicesIntro.title, data.servicesIntro.text)}
        <ol className="grid gap-2 sm:gap-4 md:grid-cols-3">
          {data.services.map((c, k) => {
            const Icon = ICONS[c.icon]
            return (
              <li key={c.title} className={`${glass} p-3 sm:p-6`} style={item(k)}>
                <div className="flex items-center justify-between">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-amber-300 sm:h-14 sm:w-14 sm:rounded-2xl">
                    <Icon className="h-5 w-5 sm:h-7 sm:w-7" aria-hidden="true" />
                  </span>
                  <span className="text-3xl font-extrabold text-white/15 sm:text-5xl">{c.step}</span>
                </div>
                <h3 className="mt-2 text-base font-bold sm:mt-4 sm:text-xl">{c.title}</h3>
                <p className="mt-1 line-clamp-3 text-xs leading-relaxed text-zinc-300 sm:mt-2 sm:line-clamp-none sm:text-sm">{c.text}</p>
              </li>
            )
          })}
        </ol>
      </div>
    )
  } else if (chapter.id === 'community') {
    page = (
      <div className={shell}>
        {heading(data.communityIntro.eyebrow, data.communityIntro.title, data.communityIntro.text)}
        <ul className="grid grid-cols-2 gap-2 sm:gap-4 lg:grid-cols-4">
          {data.community.map((c, k) => (
            <li key={c.tag} style={item(k)}>
              <figure className="relative aspect-[16/11] overflow-hidden rounded-2xl bg-gradient-to-br from-brand-900 to-emerald-900 sm:aspect-[4/3]">
                <Image src={c.image} alt="" fill sizes="(min-width: 1024px) 22vw, 45vw" className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" aria-hidden="true" />
                <figcaption className="absolute inset-x-0 bottom-0 p-3 sm:p-4">
                  <span className="text-[0.6rem] font-bold uppercase tracking-[0.16em] text-amber-200 sm:text-[0.65rem]">{c.tag}</span>
                  <p className="mt-0.5 line-clamp-2 text-xs font-bold leading-snug sm:text-base">{c.line}</p>
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>
      </div>
    )
  } else if (chapter.id === 'cta') {
    page = (
      <div className={`${shell} items-center justify-center text-center`}>
        <div className={`${glass} pointer-events-auto max-w-3xl p-5 sm:p-10`} style={item(0)}>
          <h2 className="text-2xl font-extrabold tracking-tight sm:text-4xl">
            {data.cta.title} <span className="italic text-amber-300">{data.cta.accent}</span>
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-zinc-200 sm:text-lg">{data.cta.text}</p>
          <div className="mt-5 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/contact" className={btnAmber}>
              Work With Us <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link href="/quote" className={btnGhostDark}>
              Request a Quote
            </Link>
          </div>
          <Link href="/blog" className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-zinc-200 hover:text-white hover:underline">
            Read our latest articles <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="relative h-full overflow-hidden rounded-3xl bg-[#04110a] text-white">
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" role="img" aria-label="Interactive 3D tour of Ecoshift: from our first lamp to roadside installation" />

      {!ready && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-[#04110a] text-sm font-semibold text-zinc-300">
          <span className="mr-3 h-4 w-4 animate-spin rounded-full border-2 border-amber-300 border-t-transparent" aria-hidden="true" />
          Loading 3D scene…
        </div>
      )}

      {/* soft vignette so text stays readable over any scene */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_90%_at_50%_45%,transparent_45%,rgba(0,0,0,0.5))]" aria-hidden="true" />

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

      {/* top bar: chapter name + overall progress */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 bg-gradient-to-b from-black/60 to-transparent px-3 pb-6 pt-3 sm:px-6">
        <div className="flex items-center justify-between text-[11px] font-semibold sm:text-xs">
          <span className="rounded-full bg-amber-300 px-2.5 py-1 text-[#1b1400]">{chapter.label}</span>
          <span className="font-mono text-zinc-300">
            {String(i + 1).padStart(2, '0')} / {String(CHAPTERS.length).padStart(2, '0')}
          </span>
        </div>
        <div className="mt-2 h-0.5 rounded-full bg-white/15">
          <div className="h-full rounded-full bg-amber-300" style={{ width: `${p * 100}%` }} />
        </div>
      </div>

      {page && <div className="absolute inset-0 z-10">{page}</div>}

      {card && (
        <div className="pointer-events-auto absolute inset-x-3 bottom-3 z-10 rounded-2xl border border-white/10 bg-black/55 p-4 backdrop-blur-md sm:inset-x-auto sm:bottom-5 sm:left-5 sm:w-[27rem] sm:p-5">
          <p className={eyebrowCls}>{card.eyebrow}</p>
          <div key={`${chapter.id}-${card.step}`} style={{ animation: 'ecoFade .45s ease both' }}>
            <h3 className="mt-1 text-xl font-extrabold leading-tight tracking-tight sm:text-2xl">{card.title}</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-zinc-200">{card.text}</p>
            {card.extra && <div className="mt-3">{card.extra}</div>}
          </div>
          <Dots n={card.n} i={card.step} />
        </div>
      )}

      {/* dip to black between chapters */}
      <div className="pointer-events-none absolute inset-0 z-30 bg-black" style={{ opacity: fadeAt(p) }} aria-hidden="true" />
    </div>
  )
}