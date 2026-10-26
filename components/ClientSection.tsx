'use client'

import { useEffect, useRef, useState } from 'react'
import Reveal from '@/components/Reveal'
import { eyebrow, h2 } from '@/lib/ui'

/**
 * Drop the official logo files into /public/clients using EXACTLY these names
 * (transparent PNG, SVG or WebP all work — just keep the file name/extension in sync below).
 * Until a file exists, the client's name is shown instead, so nothing looks broken.
 */
const clients = [
  { name: 'Sun Life', logo: '/clients/sunlife.png' },
  { name: 'PLDT', logo: '/clients/pldt.png' },
  { name: 'GMA Network', logo: '/clients/gma.png' },
  { name: 'Clark International Airport', logo: '/clients/clark.png' },
  { name: 'J.P. Morgan', logo: '/clients/jpmorgan.png' }
]

function ClientLogo({ name, logo }: { name: string; logo: string }) {
  const [failed, setFailed] = useState(false)
  const ref = useRef<HTMLImageElement>(null)

  // Catch images that already failed before hydration attached onError
  useEffect(() => {
    const img = ref.current
    if (img && img.complete && img.naturalWidth === 0) setFailed(true)
  }, [])

  if (failed) {
    return (
      <span className="px-3 text-center text-base font-bold leading-snug tracking-tight text-zinc-400 sm:text-lg">
        {name}
      </span>
    )
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      ref={ref}
      src={logo}
      alt={name}
      loading="lazy"
      onError={() => setFailed(true)}
      className="max-h-full max-w-full object-contain grayscale transition duration-300 group-hover:grayscale-0"
    />
  )
}

export default function ClientsSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 pt-16 sm:px-6 sm:pt-24 lg:px-8" aria-labelledby="clients-heading">
      <Reveal>
        <div className="text-center">
          <p className={eyebrow}>Our clients</p>
          <h2 id="clients-heading" className={`${h2} mx-auto`}>Trusted by leading companies</h2>
        </div>
      </Reveal>

      <ul className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-5">
        {clients.map((c, i) => (
          <li key={c.name}>
            <Reveal delay={(i % 5) * 60} className="h-full">
              <div className="group flex aspect-[4/3] items-center justify-center overflow-hidden rounded-3xl border border-zinc-200 bg-white p-8 transition-all duration-300 hover:-translate-y-1 hover:border-brand-500/40 hover:shadow-xl hover:shadow-brand-900/10">
                <ClientLogo name={c.name} logo={c.logo} />
              </div>
            </Reveal>
          </li>
        ))}
      </ul>
    </section>
  )
}