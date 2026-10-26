import type { Metadata } from 'next'
import { ArrowUpRight, Clock, Leaf, MapPin, Sprout, Sun, Users, type LucideIcon } from 'lucide-react'
import Breadcrumbs from '@/components/Breadcrumbs'
import Reveal from '@/components/Reveal'
import PageHero, { Glow } from '@/components/PageHero'
import { eyebrow, h2, btnGreen, btnAmber } from '@/lib/ui'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://ecoshiftcorp.com'
export const metadata: Metadata = {
  title: 'Careers',
  description: 'Join the Ecoshift Corporation team. Explore open positions in sales, engineering, project coordination, and operations across our branches nationwide.',
  alternates: { canonical: `${siteUrl}/careers` }
}

const positions = [
  { title: 'Sales Engineer', location: 'Mandaluyong City, Metro Manila', type: 'Full-time', description: 'Drive B2B sales of our energy-efficient lighting products. Requires strong technical aptitude and client relationship skills.' },
  { title: 'Lighting Design Specialist', location: 'Mandaue City, Cebu', type: 'Full-time', description: 'Create lighting layouts and specifications for commercial projects. Proficiency in Dialux or similar tools is a plus.' },
  { title: 'Project Coordinator', location: 'Davao City, Davao', type: 'Full-time', description: 'Coordinate delivery schedules, vendor logistics, and client communications for installation projects.' },
  { title: 'Warehouse Associate', location: 'Pasig City, Metro Manila', type: 'Full-time', description: 'Manage inventory, process orders, and ensure accurate fulfillment of product shipments.' }
]

const perks: { Icon: LucideIcon; title: string; text: string }[] = [
  { Icon: Sun, title: 'Work that matters', text: 'Help businesses and communities switch to efficient LED and solar lighting.' },
  { Icon: Users, title: 'A nationwide team', text: 'Join colleagues across Luzon, Visayas, and Mindanao.' },
  { Icon: Sprout, title: 'Room to grow', text: 'Learn lighting design, project management, and installation with experts.' }
]

export default function CareersPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Careers' }]} />

      <PageHero
        eyebrow="Careers at Ecoshift"
        title={<>Help us light the way to a <Glow>greener future</Glow></>}
        description="We're always looking for talented people who share our commitment to sustainable energy."
        compact
      >
        <a href="#openings" className={btnAmber}>
          See open roles
        </a>
      </PageHero>

      {/* Perks */}
      <section className="mt-12 sm:mt-16" aria-labelledby="why-join">
        <Reveal>
          <p className={eyebrow}>Why join us</p>
          <h2 id="why-join" className={h2}>Built on purpose and people</h2>
        </Reveal>
        <ul className="mt-8 grid gap-4 sm:grid-cols-3">
          {perks.map(({ Icon, title, text }, i) => (
            <li key={title}>
              <Reveal delay={i * 80} className="h-full">
                <div className="group relative h-full overflow-hidden rounded-3xl border border-zinc-200 bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:border-brand-500/40 hover:shadow-xl hover:shadow-brand-900/10">
                  <span className="pointer-events-none absolute -right-2 -top-4 text-8xl font-extrabold text-zinc-100 transition-colors group-hover:text-brand-50" aria-hidden="true">{i + 1}</span>
                  <span className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-600 to-emerald-500 text-white shadow-lg shadow-brand-600/25">
                    <Icon className="h-6 w-6" aria-hidden="true" />
                  </span>
                  <h3 className="relative mt-5 text-lg font-bold text-zinc-900">{title}</h3>
                  <p className="relative mt-2 text-sm leading-relaxed text-zinc-600">{text}</p>
                </div>
              </Reveal>
            </li>
          ))}
        </ul>
      </section>

      {/* Openings */}
      <section id="openings" className="mt-16 scroll-mt-24 sm:mt-24" aria-labelledby="openings-heading">
        <Reveal>
          <p className={eyebrow}>Open positions</p>
          <h2 id="openings-heading" className={h2}>Find your role</h2>
        </Reveal>
        <ul className="mt-8 space-y-4">
          {positions.map((pos, i) => (
            <li key={pos.title}>
              <Reveal delay={i * 60}>
                <div className="group rounded-3xl border border-zinc-200 bg-white p-6 transition-all duration-300 hover:border-brand-500/40 hover:shadow-xl hover:shadow-brand-900/10 sm:p-7">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-bold text-zinc-900">{pos.title}</h3>
                      <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-zinc-500">
                        <span className="inline-flex items-center gap-1.5"><MapPin className="h-4 w-4 text-brand-600" aria-hidden="true" />{pos.location}</span>
                        <span className="inline-flex items-center gap-1.5"><Clock className="h-4 w-4 text-brand-600" aria-hidden="true" />{pos.type}</span>
                      </p>
                    </div>
                    <a href={`mailto:careers@ecoshift.com?subject=${encodeURIComponent(`Application: ${pos.title}`)}`} className={`${btnGreen} min-h-11 px-5`}>
                      Apply via Email <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                    </a>
                  </div>
                  <p className="mt-4 max-w-3xl text-sm leading-relaxed text-zinc-600">{pos.description}</p>
                </div>
              </Reveal>
            </li>
          ))}
        </ul>
      </section>

      {/* General application */}
      <section className="mt-16 sm:mt-24" aria-labelledby="general-app">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-700 via-brand-600 to-emerald-600 px-6 py-12 text-center sm:px-12 sm:py-14">
            <div className="pointer-events-none absolute left-1/2 top-0 h-48 w-[36rem] max-w-full -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-300/25 blur-3xl" aria-hidden="true" />
            <div className="relative mx-auto max-w-2xl">
              <Leaf className="mx-auto h-8 w-8 text-emerald-200" aria-hidden="true" />
              <h2 id="general-app" className="mt-3 text-3xl font-extrabold tracking-tight text-white">Don&rsquo;t see the right role?</h2>
              <p className="mt-3 text-brand-50">Send us your resume and we&rsquo;ll reach out when a matching position opens.</p>
              <a
                href="mailto:careers@ecoshift.com?subject=General%20Application"
                className={`${btnAmber} mt-7`}
              >
                Send Your Resume
              </a>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  )
}
