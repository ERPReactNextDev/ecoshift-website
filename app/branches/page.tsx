import type { Metadata } from 'next'
import { ArrowUpRight, Building2, Clock, Mail, MapPin, Phone, Warehouse, type LucideIcon } from 'lucide-react'
import Breadcrumbs from '@/components/Breadcrumbs'
import Reveal from '@/components/Reveal'
import PageHero, { Glow } from '@/components/PageHero'
import { regions, allBranches, mapsUrl, CONTACT, type BranchKind } from '@/lib/branches'
import { eyebrow, h2, panelGreen } from '@/lib/ui'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://ecoshiftcorp.com'
export const metadata: Metadata = {
  title: 'Branches',
  description: 'Find an Ecoshift Corporation branch near you, with offices and warehouses across Luzon, Visayas, and Mindanao.',
  alternates: { canonical: `${siteUrl}/branches` }
}

const kindIcon: Record<BranchKind, LucideIcon> = { office: Building2, warehouse: Warehouse, branch: MapPin }
const kindLabel: Record<BranchKind, string> = { office: 'Head office', warehouse: 'Warehouse', branch: 'Branch' }

export default function BranchesPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Branches' }]} />

      <PageHero
        eyebrow="Nationwide reach"
        title={<>{allBranches.length} locations, <Glow>one standard</Glow> of service</>}
        description="Visit any branch for product inquiries, quote requests, and technical support on our LED and solar lighting."
        compact
      />

      <div className="mt-12 space-y-14 sm:mt-16">
        {regions.map(region => (
          <section key={region.name} aria-labelledby={`region-${region.name}`}>
            <Reveal>
              <p className={eyebrow}>{region.tagline}</p>
              <h2 id={`region-${region.name}`} className={h2}>{region.name}</h2>
            </Reveal>
            <ul className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
              {region.branches.map((b, i) => {
                const Icon = kindIcon[b.kind]
                return (
                  <li key={b.name}>
                    <Reveal delay={i * 80} className="h-full">
                      <div className="group flex h-full flex-col rounded-3xl border border-zinc-200 bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:border-brand-500/40 hover:shadow-xl hover:shadow-brand-900/10 sm:p-7">
                        <div className="flex items-start gap-4">
                          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-600 to-emerald-500 text-white shadow-lg shadow-brand-600/25">
                            <Icon className="h-6 w-6" aria-hidden="true" />
                          </span>
                          <div className="min-w-0">
                            <span className="rounded-full bg-brand-50 px-2.5 py-0.5 text-[0.65rem] font-bold uppercase tracking-[0.12em] text-brand-700">{kindLabel[b.kind]}</span>
                            <h3 className="mt-1.5 text-lg font-bold leading-snug text-zinc-900">{b.name}</h3>
                          </div>
                        </div>
                        <ul className="mt-5 space-y-3 text-sm text-zinc-600">
                          <li className="flex gap-2.5"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" aria-hidden="true" />{b.address}</li>
                          <li className="flex gap-2.5"><Clock className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" aria-hidden="true" />{CONTACT.hours}</li>
                        </ul>
                        <a
                          href={mapsUrl(b)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-6 inline-flex items-center gap-1.5 pt-1 text-sm font-bold text-brand-700 hover:underline"
                        >
                          Open in Google Maps <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                        </a>
                      </div>
                    </Reveal>
                  </li>
                )
              })}
            </ul>
          </section>
        ))}
      </div>

      {/* Contact strip */}
      <section className="mt-16 sm:mt-24" aria-labelledby="reach-us">
        <Reveal>
          <div className={`${panelGreen} px-5 py-10 sm:px-10 sm:py-12 lg:px-14`}>
            <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-emerald-300/25 blur-3xl" aria-hidden="true" />
            <div className="relative grid gap-8 lg:grid-cols-2 lg:items-center">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-700">Can&rsquo;t visit?</p>
                <h2 id="reach-us" className="mt-2 text-3xl font-extrabold tracking-tight text-brand-900">Reach us directly</h2>
                <p className="mt-3 max-w-md text-zinc-600">Our team will route your inquiry to the branch nearest your project.</p>
              </div>
              <ul className="grid gap-3 sm:grid-cols-2">
                <li>
                  <a href={`mailto:${CONTACT.email}`} className="flex items-center gap-3 rounded-2xl border border-brand-100 bg-white p-4 transition-colors hover:border-brand-300">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-100 text-brand-600"><Mail className="h-5 w-5" aria-hidden="true" /></span>
                    <span className="min-w-0 break-words text-sm font-semibold text-brand-900">{CONTACT.email}</span>
                  </a>
                </li>
                <li>
                  <a href={CONTACT.phoneHref} className="flex items-center gap-3 rounded-2xl border border-brand-100 bg-white p-4 transition-colors hover:border-brand-300">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-100 text-brand-600"><Phone className="h-5 w-5" aria-hidden="true" /></span>
                    <span className="text-sm font-semibold text-brand-900">{CONTACT.phone}</span>
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  )
}
