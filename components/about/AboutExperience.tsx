'use client'

import dynamic from 'next/dynamic'
import { useEffect, useState, type ReactNode } from 'react'
import type { AboutData } from './world/data'

const World3D = dynamic(() => import('./World3D'), {
  ssr: false,
  loading: () => <div className="mt-5 flex h-[70svh] items-center justify-center rounded-3xl bg-[#04110a] text-sm font-semibold text-zinc-300">Loading 3D scene…</div>
})

/** WebGL2 + no reduced-motion + not on a data saver. Anything else gets the regular page. */
function canUse3D(): boolean {
  try {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false
    const conn = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection
    if (conn?.saveData) return false
    const mem = (navigator as Navigator & { deviceMemory?: number }).deviceMemory
    if (typeof mem === 'number' && mem < 2) return false
    return !!document.createElement('canvas').getContext('webgl2')
  } catch {
    return false
  }
}

/**
 * The whole About page as one scrollable 3D film.
 * `fallback` is the regular server-rendered page: it is what search engines, no-WebGL devices,
 * data-saver and reduced-motion visitors get.
 */
export default function AboutExperience({ data, fallback }: { data: AboutData; fallback: ReactNode }) {
  const [mode, setMode] = useState<'legacy' | '3d'>('legacy')

  useEffect(() => {
    if (canUse3D()) setMode('3d')
  }, [])

  if (mode === '3d') {
    return (
      <div className="mt-5">
        <World3D data={data} onFail={() => setMode('legacy')} />
      </div>
    )
  }
  return <>{fallback}</>
}