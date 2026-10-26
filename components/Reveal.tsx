'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'

interface Props {
  children: ReactNode
  className?: string
  /** stagger in ms */
  delay?: number
}

/**
 * Fades + lifts content in as it scrolls into view.
 * Content is visible by default (no-JS / above the fold) and only hidden
 * when it starts below the fold, so nothing flashes or gets stuck invisible.
 */
export default function Reveal({ children, className = '', delay = 0 }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const [state, setState] = useState<'visible' | 'hidden' | 'shown'>('visible')

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    if (el.getBoundingClientRect().top < window.innerHeight * 0.95) return

    setState('hidden')
    const io = new IntersectionObserver(
      entries => {
        if (entries.some(e => e.isIntersecting)) {
          setState('shown')
          io.disconnect()
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      style={{ transitionDelay: state === 'shown' ? `${delay}ms` : '0ms' }}
      className={`transition-all duration-700 ease-out ${
        state === 'hidden' ? 'translate-y-6 opacity-0' : 'translate-y-0 opacity-100'
      } ${className}`}
    >
      {children}
    </div>
  )
}