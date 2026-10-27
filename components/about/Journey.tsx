'use client'

import dynamic from 'next/dynamic'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { useEffect, useState } from 'react'
import Reveal from '@/components/Reveal'
import { AnatomyScene, InstallScene, ReachScene, SolarScene, StoryScene, TruckScene, type Milestone, type Region } from './Scenes'

const World3D = dynamic(() => import('./World3D'), {
  ssr: false,
  loading: () => (
    <div className="flex h-[60svh] items-center justify-center rounded-3xl bg-[#04110a] text-sm font-semibold text-zinc-300">Loading 3D scene…</div>
  )
})

interface Props {
  milestones: Milestone[]
  regions: Region[]
  durability: string[]
}

const eyebrow = 'text-xs font-bold uppercase tracking-[0.18em] text-brand-700'
const h2 = 'mt-2 text-3xl font-extrabold tracking-tight text-zinc-900 sm:text-4xl'

/** WebGL2 + no reduced-motion + not on a data saver. Anything else gets the lighter SVG version. */
function canUse3D(): boolean {
  try {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false
    const conn = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection
    if (conn?.saveData) return false
    const mem = (navigator as Navigator & { deviceMemory?: number }).deviceMemory
    if (typeof mem === 'number' && mem < 2) return false
    const c = document.createElement('canvas')
    return !!c.getContext('webgl2')
  } catch {
    return false
  }
}

export default function Journey(props: Props) {
  const [mode, setMode] = useState<'legacy' | '3d'>('legacy')

  useEffect(() => {
    if (canUse3D()) setMode('3d')
  }, [])

  if (mode === '3d') {
    return (
      <section className="mt-16 sm:mt-24" aria-label="The Ecoshift journey">
        <Reveal>
          <p className={eyebrow}>The Ecoshift journey</p>
          <h2 className={h2}>From our first lamp to your roadside</h2>
          <p className="mt-3 max-w-2xl text-zinc-600">Scroll to ride along: how we started, how a solar streetlight works, how it travels, and how it goes up.</p>
        </Reveal>
        <div className="mt-6">
          <World3D {...props} onFail={() => setMode('legacy')} />
        </div>
        <Link href="/branches" className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 hover:underline">
          See all branch details <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </section>
    )
  }

  return <LegacyJourney {...props} />
}

/** Lighter illustrated version (also what search engines and no-WebGL devices see). */
function LegacyJourney({ milestones, regions, durability }: Props) {
  const branchCount = regions.reduce((n, r) => n + r.branches.length, 0)
  return (
    <>
      <section className="mt-16 sm:mt-24" aria-label="Our story">
        <Reveal>
          <p className={eyebrow}>Our story</p>
          <h2 className={h2}>One lamp, then a whole country</h2>
        </Reveal>
        <div className="mt-6">
          <StoryScene milestones={milestones} />
        </div>
      </section>

      <section className="mt-16 sm:mt-24" aria-label="Anatomy of a solar streetlight">
        <Reveal>
          <p className={eyebrow}>The product</p>
          <h2 className={h2}>Straight or curved, built to last</h2>
          <p className="mt-3 max-w-2xl text-zinc-600">Scroll to take a solar streetlight apart, one part at a time.</p>
        </Reveal>
        <div className="mt-6">
          <AnatomyScene durability={durability} />
        </div>
      </section>

      <section className="mt-16 sm:mt-24" aria-label="How solar streetlights work">
        <Reveal>
          <p className={eyebrow}>Powered by the sun</p>
          <h2 className={h2}>One day in the life of a solar lamp</h2>
        </Reveal>
        <div className="mt-6">
          <SolarScene />
        </div>
      </section>

      <section className="mt-16 sm:mt-24" aria-label="Delivery by truck">
        <Reveal>
          <p className={eyebrow}>Delivery</p>
          <h2 className={h2}>Long poles, longer trucks</h2>
        </Reveal>
        <div className="mt-6">
          <TruckScene />
        </div>
      </section>

      <section className="mt-16 sm:mt-24" aria-labelledby="reach-heading">
        <Reveal>
          <p className={eyebrow}>Nationwide reach</p>
          <h2 id="reach-heading" className={h2}>
            {branchCount} branches, one standard of service
          </h2>
          <p className="mt-3 max-w-2xl text-zinc-600">Ecoshift is located in {branchCount} branches nationwide, across Luzon, Visayas, and Mindanao.</p>
        </Reveal>
        <div className="mt-6">
          <ReachScene regions={regions} />
        </div>
        <Link href="/branches" className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 hover:underline">
          See all branch details <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </section>

      <section className="mt-16 sm:mt-24" aria-label="How streetlights are installed">
        <Reveal>
          <p className={eyebrow}>Installation</p>
          <h2 className={h2}>From the truck to the roadside</h2>
          <p className="mt-3 max-w-2xl text-zinc-600">City streets, highways, and provincial roads: same crew, different challenges.</p>
        </Reveal>
        <div className="mt-6">
          <InstallScene />
        </div>
      </section>
    </>
  )
}