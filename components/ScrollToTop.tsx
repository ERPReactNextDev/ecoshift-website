'use client'

import { useEffect, useState } from 'react'
import { ArrowUp } from 'lucide-react'

export default function ScrollToTop() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  function scrollTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <button
      type="button"
      onClick={scrollTop}
      aria-label="Scroll to top"
      className={`fixed bottom-6 right-6 z-40 flex h-11 w-11 items-center justify-center border border-rule bg-white text-ink shadow-md transition-all duration-300 hover:border-brand-600 hover:text-brand-700 hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 ${
        visible ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-4 pointer-events-none'
      }`}
      style={{ borderRadius: 'var(--radius)' }}
    >
      <ArrowUp className="h-5 w-5" />
    </button>
  )
}
