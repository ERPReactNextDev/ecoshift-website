'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'

export const STICKY_TOP = 72
export const STAGE_OFFSET = 88

export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v))
export const seg = (p: number, a: number, b: number) => clamp((p - a) / (b - a))
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t
export const ease = (t: number) => t * t * (3 - 2 * t)

export default function ScrollStage({
  heightVh = 300,
  children
}: {
  heightVh?: number
  children: (p: number, reduced: boolean) => ReactNode
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [p, setP] = useState(0)
  const [reduced, setReduced] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReduced(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])

  useEffect(() => {
    if (reduced) { setP(1); return }
    const el = ref.current
    if (!el) return
    let raf = 0
    const calc = () => {
      raf = 0
      const r = el.getBoundingClientRect()
      const total = r.height - (window.innerHeight - STAGE_OFFSET)
      const next = total > 0 ? clamp((STICKY_TOP - r.top) / total) : 0
      setP(prev => (Math.abs(prev - next) < 0.0015 ? prev : next))
    }
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(calc) }
    let listening = false
    const attach = () => {
      if (listening) return
      listening = true
      window.addEventListener('scroll', onScroll, { passive: true })
      window.addEventListener('resize', onScroll)
      calc()
    }
    const detach = () => {
      if (!listening) return
      listening = false
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
    const io = new IntersectionObserver(([entry]) => (entry.isIntersecting ? attach() : detach()), { rootMargin: '150px 0px' })
    io.observe(el)
    return () => { io.disconnect(); detach(); if (raf) cancelAnimationFrame(raf) }
  }, [reduced])

  return (
    <div ref={ref} className="relative" style={reduced ? undefined : { height: `${heightVh}vh` }}>
      <div
        className={reduced ? 'h-[80svh] min-h-[480px]' : 'sticky'}
        style={reduced ? undefined : { top: STICKY_TOP, height: `calc(100svh - ${STAGE_OFFSET}px)` }}
      >
        {children(p, reduced)}
      </div>
    </div>
  )
}
