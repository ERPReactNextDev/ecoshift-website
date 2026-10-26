import type { Metadata } from 'next'
import Link from 'next/link'
import {
  ArrowRight,
  Building2,
  GraduationCap,
  HeartPulse,
  Hotel,
  MapPin,
  Store,
  Warehouse,
  type LucideIcon
} from 'lucide-react'
import Breadcrumbs from '@/components/Breadcrumbs'
import Reveal from '@/components/Reveal'
import PageHero, { Glow } from '@/components/PageHero'
import { btnAmber, btnGhostDark, panelGreen } from '@/lib/ui'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://ecoshiftcorp.com'
export const metadata: Metadata = {
  title: 'Projects',
  description: 'Explore our portfolio of energy-efficient lighting projects across commercial, industrial, retail, healthcare, and institutional sectors in the Philippines.',
  alternates: { canonical: `${siteUrl}/projects` }
}

const projects: { title: string; client: string; category: string; description: string; Icon: LucideIcon }[] = [
  { title: 'Corporate Office LED Retrofit', client: 'Confidential — BGC, Taguig', category: 'Commercial Lighting', description: 'Full LED retrofit of a 15-floor corporate office, reducing energy consumption by 62%.', Icon: Building2 },
  { title: 'Warehouse Lighting Upgrade', client: 'Industrial — Calamba, Laguna', category: 'Industrial Lighting', description: 'High-bay LED installation across a 10,000 sqm logistics warehouse.', Icon: Warehouse },
  { title: 'Retail Store Rollout', client: 'Retail Chain — Nationwide', category: 'Retail Lighting', description: 'Standardized lighting design and supply for 25 retail branches nationwide.', Icon: Store },
  { title: 'Hospital Corridor Lighting', client: 'Healthcare — Quezon City', category: 'Healthcare Lighting', description: 'Energy-efficient, low-glare lighting for patient corridors and common areas.', Icon: HeartPulse },
  { title: 'School Campus Modernization', client: 'Education — Manila', category: 'Institutional Lighting', description: 'Classroom and outdoor lighting upgrade with smart controls.', Icon: GraduationCap },
  { title: 'Hotel Lobby & Facade', client: 'Hospitality — Cebu', category: 'Architectural Lighting', description: 'Decorative and functional lighting for hotel lobby, facade, and landscaped areas.', Icon: Hotel }
]

export default function ProjectsPage() {
  const [lead, ...rest] = projects

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Projects' }]} />

      <PageHero
        eyebrow="Our portfolio"
        title={<>Projects that <Glow>cut energy</Glow> and light up lives</>}
        description="A selection of lighting and electrical projects we've delivered for clients across the Philippines."
        compact
      />

      {/* Highlight project */}
      <section className="mt-12 sm:mt-16" aria-label="Highlighted project">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-600 to-emerald-600 p-8 text-white sm:p-10">
            <div className="pointer-events-none absolute -bottom-16 -right-16 h-64 w-64 rounded-full bg-brand-300/30 blur-3xl" aria-hidden="true" />
            <lead.Icon className="pointer-events-none absolute -bottom-6 right-6 h-44 w-44 text-white/10" aria-hidden="true" />
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-200">Featured project · {lead.category}</p>
            <h2 className="relative mt-3 max-w-2xl text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">{lead.title}</h2>
            <p className="relative mt-3 max-w-xl text-brand-50 sm:text-lg">{lead.description}</p>
            <p className="relative mt-4 inline-flex items-center gap-1.5 text-sm text-brand-50/90">
              <MapPin className="h-4 w-4 text-emerald-200" aria-hidden="true" />{lead.client}
            </p>
          </div>
        </Reveal>
      </section>

      {/* Grid */}
      <section className="mt-8" aria-label="More projects">
        <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {rest.map(({ Icon, title, client, category, description }, i) => (
            <li key={title}>
              <Reveal delay={(i % 3) * 80} className="h-full">
                <article className="group h-full overflow-hidden rounded-3xl border border-zinc-200 bg-white transition-all duration-300 hover:-translate-y-1 hover:border-brand-500/40 hover:shadow-xl hover:shadow-brand-900/10">
                  <div className="relative flex aspect-[16/9] items-center justify-center overflow-hidden bg-gradient-to-br from-brand-100 via-brand-50 to-emerald-100">
                    <div className="pointer-events-none absolute -right-8 -top-8 h-36 w-36 rounded-full bg-brand-300/25 blur-2xl" aria-hidden="true" />
                    <div className="pointer-events-none absolute inset-0 opacity-[0.06] [background-image:radial-gradient(#16a34a_1px,transparent_1px)] [background-size:18px_18px]" aria-hidden="true" />
                    <Icon className="relative h-14 w-14 text-brand-600 transition-transform duration-500 group-hover:scale-110" aria-hidden="true" />
                  </div>
                  <div className="p-5 sm:p-6">
                    <span className="inline-block rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-semibold text-brand-700">{category}</span>
                    <h3 className="mt-3 text-lg font-bold leading-snug text-zinc-900">{title}</h3>
                    <p className="mt-1 flex items-center gap-1.5 text-xs text-zinc-500"><MapPin className="h-3.5 w-3.5 text-brand-600" aria-hidden="true" />{client}</p>
                    <p className="mt-3 text-sm leading-relaxed text-zinc-600">{description}</p>
                  </div>
                </article>
              </Reveal>
            </li>
          ))}
        </ul>
      </section>

      {/* CTA */}
      <section className="mt-16 sm:mt-24" aria-labelledby="projects-cta">
        <Reveal>
          <div className={`${panelGreen} px-6 py-12 text-center sm:px-12 sm:py-14`}>
            <div className="pointer-events-none absolute left-1/2 top-0 h-48 w-[36rem] max-w-full -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-300/25 blur-3xl" aria-hidden="true" />
            <div className="relative mx-auto max-w-2xl">
              <h2 id="projects-cta" className="text-3xl font-extrabold tracking-tight text-zinc-900 sm:text-4xl">
                Have a project in <span className="italic text-brand-700">mind</span>?
              </h2>
              <p className="mt-3 text-zinc-600">From Dialux design to installation, our team can take it from the first idea to switch-on.</p>
              <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
                <Link href="/quote" className={btnAmber}>Request a Quote <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
                <Link href="/contact" className={btnGhostDark}>Contact Us</Link>
              </div>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  )
}
