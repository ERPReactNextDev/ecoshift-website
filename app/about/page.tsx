import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import {
  ArrowRight,
  Award,
  Building2,
  Check,
  ClipboardCheck,
  Headset,
  Landmark,
  MapPin,
  Monitor,
  Route,
  Settings,
  Users,
  Wrench,
  type LucideIcon
} from 'lucide-react'
import Breadcrumbs from '@/components/Breadcrumbs'
import Reveal from '@/components/Reveal'
import Streetlight from '@/components/about/Streetlight'
import { AnatomyScene, InstallScene, ReachScene, SolarScene, StoryScene, TruckScene, type Milestone, type Region } from '@/components/about/Scenes'
import { panelGreen, btnAmber, btnGhostDark } from '@/lib/ui'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://ecoshiftcorp.com'

export const metadata: Metadata = {
  title: 'About Us',
  description:
    'Ecoshift Corporation is a fast-growing provider of innovative, energy-efficient lighting solutions in the Philippines since 2011, with branches in Luzon, Visayas, and Mindanao.',
  alternates: { canonical: `${siteUrl}/about` }
}

const FOUNDED = 2011

/* ------------------------------------------------------------------ */
/* Content (edit these)                                                */
/* ------------------------------------------------------------------ */

// Story timeline. Only 2011 is a dated fact; add real years/milestones if you have them.
const milestones: Milestone[] = [
  { label: String(FOUNDED), title: 'The first lamp', text: 'Ecoshift Corporation starts supplying energy-efficient lighting to Philippine businesses.' },
  { label: 'Luzon', title: 'Rooted in Metro Manila', text: 'A head office in Mandaluyong and a warehouse in Pasig keep stock close to projects across Luzon.' },
  { label: 'Visayas', title: 'Reaching the islands', text: 'The Cebu branch in Mandaue brings supply and support to the Visayas.' },
  { label: 'Mindanao', title: 'Covering the south', text: 'Branches in Davao and a Cagayan de Oro warehouse serve Mindanao.' },
  { label: 'Today', title: 'From design to switch-on', text: 'Dialux design, project management, and in-house installation, all under one roof.' }
]

// Add real client or project names here (or logos later). Leave empty to hide the name strip.
const clientNames: string[] = []

const clientTypes: { Icon: LucideIcon; title: string; text: string }[] = [
  { Icon: Landmark, title: 'Government institutions', text: 'Compliant, durable, and cost-efficient lighting for public projects.' },
  { Icon: Route, title: 'Large-scale projects', text: 'Roads, campuses, and developments that need dependable supply and installation.' },
  { Icon: Users, title: 'Communities', text: 'Safer streets, schools, and health facilities through lighting partnerships.' },
  { Icon: Building2, title: 'Multi-branch businesses', text: 'One supplier with branches and warehouses near every site.' }
]

// Qualitative only. Add certified figures (IP rating, wind load, coating) once confirmed per product.
const durability = ['Corrosion-resistant finish', 'Weather-sealed lamp housing', 'Anchor-bolted base', 'Made for sun, rain, and strong wind']

const regions: Region[] = [
  {
    name: 'Luzon',
    blurb: 'Stock moves out of Metro Manila to projects across the island.',
    branches: [
      { name: 'Head Office', address: 'J&L Building, EDSA, Mandaluyong City', kind: 'office' },
      { name: 'NCR Warehouse', address: '#4780 Ortigas Avenue Extension, Pasig City', kind: 'warehouse' }
    ]
  },
  {
    name: 'Visayas',
    blurb: 'The Cebu branch keeps the Visayas supplied and supported.',
    branches: [{ name: 'Cebu Branch', address: 'Unit 7A, Zuellig Avenue Street, Mandaue Reclamation Area, Mandaue City, Cebu', kind: 'branch' }]
  },
  {
    name: 'Mindanao',
    blurb: 'Davao and Cagayan de Oro cover the south.',
    branches: [
      { name: 'Davao Branch', address: 'Saavedra Bldg., No. 3 Pag-Asa Village, Davao City, Matina Aplaya', kind: 'branch' },
      { name: 'Cagayan de Oro Branch (Warehouse)', address: '#29 Alwana Business Park, Cugman, Cagayan de Oro', kind: 'warehouse' }
    ]
  }
]

const pillars: { Icon: LucideIcon; title: string; text: string }[] = [
  { Icon: Award, title: `Industry experts since ${FOUNDED}`, text: 'Years of hands-on experience in lighting and electrical systems for businesses, government, and communities.' },
  { Icon: Settings, title: 'Commitment to product development', text: 'We keep improving what we offer so every product is efficient, durable, and ready for the future.' },
  { Icon: Headset, title: 'Excellent after-sales service', text: 'Our team stays with you after delivery, from technical questions to installation support.' },
  { Icon: MapPin, title: 'Nationwide presence', text: 'Branches and warehouses across Luzon, Visayas, and Mindanao keep support close to every project.' }
]

const whatWeDo = [
  'Supply LED lighting, fixtures, and electrical components from trusted brands',
  'Expert consultation for energy-efficient retrofits and new installations',
  'Competitive B2B pricing through our quote-request system',
  'Support for businesses across multiple branches nationwide'
]

const services: { Icon: LucideIcon; step: string; title: string; text: string }[] = [
  {
    Icon: Monitor,
    step: '01',
    title: 'Dialux Services',
    text: 'Our Dialux simulations help create and identify lighting designs and specifications, so you can see your desired lighting scheme before anything is installed.'
  },
  {
    Icon: ClipboardCheck,
    step: '02',
    title: 'Project Management',
    text: 'Our electrical engineers conduct site visits before and after implementation, giving accurate recommendations for proper execution and installation of products.'
  },
  {
    Icon: Wrench,
    step: '03',
    title: 'Installation',
    text: 'An in-house team of technical professionals handles installation services, so the finished result matches the plan.'
  }
]

const community = [
  { image: '/banner/peace-and-order.jpg', tag: 'Peace and Order', line: 'Safe streets start with light.' },
  { image: '/banner/disaster-risk.jpg', tag: 'Disaster and Risk Management', line: 'Light that keeps going when the power doesn’t.' },
  { image: '/banner/health-nutrition.jpg', tag: 'Health & Nutrition', line: 'Clear light for careful hands.' },
  { image: '/banner/education.jpg', tag: 'Education', line: 'A brighter room makes a brighter mind.' }
]

const eyebrow = 'text-xs font-bold uppercase tracking-[0.18em] text-brand-700'
const h2 = 'mt-2 text-3xl font-extrabold tracking-tight text-zinc-900 sm:text-4xl'

/* Keyframes used by the scroll scenes */
const keyframes = `
@keyframes ecoFade{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
@keyframes ecoMarquee{to{transform:translateX(-50%)}}
@keyframes ecoGlow{0%,100%{opacity:.8}50%{opacity:1}}
@media (prefers-reduced-motion:reduce){.eco-motion,.eco-motion *{animation:none!important}}
`

export default function AboutPage() {
  const years = new Date().getFullYear() - FOUNDED
  const branchCount = regions.reduce((n, r) => n + r.branches.length, 0)

  const stats = [
    { value: `${years}+`, label: 'Years in lighting' },
    { value: String(branchCount), label: 'Branches nationwide' },
    { value: '3', label: 'Island groups served' },
    { value: '3', label: 'In-house services' }
  ]

  return (
    <div className="eco-motion mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <style>{keyframes}</style>
      <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'About' }]} />

      {/* Hero */}
      <section className={`${panelGreen} mt-5 px-5 pb-6 pt-12 sm:px-10 sm:pt-16 lg:px-14 lg:pt-20`}>
        <div className="pointer-events-none absolute -right-24 -top-24 h-[28rem] w-[28rem] animate-pulse rounded-full bg-brand-300/25 blur-3xl" aria-hidden="true" />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.06] [background-image:radial-gradient(#16a34a_1px,transparent_1px)] [background-size:22px_22px]"
          aria-hidden="true"
        />

        {/* Decorative streetlight, lit */}
        <div className="pointer-events-none absolute bottom-0 right-6 hidden h-[115%] w-[26rem] lg:block" aria-hidden="true" style={{ animation: 'ecoGlow 4s ease-in-out infinite' }}>
          <Streetlight variant="bent" ground={false} lit={1} charge={0.6} className="h-full w-full" />
        </div>

        <div className="relative max-w-3xl">
          <p className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-brand-700">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-500" aria-hidden="true" />
            About Ecoshift Corporation
          </p>
          <h1 className="mt-5 text-4xl font-extrabold leading-[1.05] tracking-tight text-zinc-900 sm:text-5xl lg:text-6xl">
            The fastest-growing provider of{' '}
            <span className="bg-gradient-to-r from-brand-600 to-emerald-500 bg-clip-text text-transparent">innovative lighting</span>{' '}
            solutions.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-zinc-600 sm:text-lg">
            Delivering sustainable, energy-efficient, and future-ready systems since {FOUNDED}.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/products" className={btnAmber}>
              Browse Products <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link href="/contact" className={btnGhostDark}>
              Contact Us
            </Link>
          </div>
        </div>

        <dl className="relative mt-12 grid grid-cols-2 gap-3 lg:mt-16 lg:grid-cols-4">
          {stats.map(s => (
            <div key={s.label} className="rounded-2xl border border-brand-100 bg-white p-4 backdrop-blur sm:p-5">
              <dt className="order-2 mt-1 text-xs font-medium text-zinc-500 sm:text-sm">{s.label}</dt>
              <dd className="order-1 text-3xl font-extrabold tracking-tight text-brand-700 sm:text-4xl">{s.value}</dd>
            </div>
          ))}
        </dl>

        <p className="relative mt-8 flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-brand-700">
          Scroll to follow the light
          <span className="inline-block animate-bounce" aria-hidden="true">↓</span>
        </p>
      </section>

      {/* 1. Story */}
      <section className="mt-16 sm:mt-24" aria-label="Our story">
        <Reveal>
          <p className={eyebrow}>Our story</p>
          <h2 className={h2}>One lamp, then a whole country</h2>
        </Reveal>
        <div className="mt-6">
          <StoryScene milestones={milestones} />
        </div>
      </section>

      {/* 2. Clients */}
      <section className="mt-16 sm:mt-24" aria-labelledby="clients-heading">
        <Reveal>
          <p className={eyebrow}>Who we work with</p>
          <h2 id="clients-heading" className={h2}>Trusted on projects big and small</h2>
          <p className="mt-3 max-w-2xl text-zinc-600">
            Ecoshift is a reliable partner for government institutions and large-scale projects, with a proven record of delivering sustainable and cost-efficient lighting.
          </p>
        </Reveal>

        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {clientTypes.map(({ Icon, title, text }, i) => (
            <li key={title}>
              <Reveal delay={i * 80} className="h-full">
                <div className="h-full rounded-3xl border border-zinc-200 bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:border-brand-500/40 hover:shadow-xl hover:shadow-brand-900/10">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-600 to-emerald-500 text-white shadow-lg shadow-brand-600/25">
                    <Icon className="h-6 w-6" aria-hidden="true" />
                  </span>
                  <h3 className="mt-5 text-lg font-bold text-zinc-900">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-zinc-600">{text}</p>
                </div>
              </Reveal>
            </li>
          ))}
        </ul>

        {clientNames.length > 0 && (
          <div className="relative mt-8 overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-50 py-4" aria-label="Selected clients">
            <div className="flex w-max gap-3" style={{ animation: 'ecoMarquee 40s linear infinite' }}>
              {[...clientNames, ...clientNames].map((name, i) => (
                <span key={`${name}-${i}`} className="whitespace-nowrap rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-700">
                  {name}
                </span>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* 3. Anatomy */}
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

      {/* 4. Solar */}
      <section className="mt-16 sm:mt-24" aria-label="How solar streetlights work">
        <Reveal>
          <p className={eyebrow}>Powered by the sun</p>
          <h2 className={h2}>One day in the life of a solar lamp</h2>
        </Reveal>
        <div className="mt-6">
          <SolarScene />
        </div>
      </section>

      {/* 5. Truck */}
      <section className="mt-16 sm:mt-24" aria-label="Delivery by truck">
        <Reveal>
          <p className={eyebrow}>Delivery</p>
          <h2 className={h2}>Long poles, longer trucks</h2>
        </Reveal>
        <div className="mt-6">
          <TruckScene />
        </div>
      </section>

      {/* 6. Nationwide */}
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

      {/* 7. Installation */}
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

      {/* Pillars */}
      <section className="mt-16 sm:mt-24" aria-labelledby="why-heading">
        <Reveal>
          <p className={eyebrow}>Why Ecoshift</p>
          <h2 id="why-heading" className={h2}>Built on four promises</h2>
        </Reveal>
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {pillars.map(({ Icon, title, text }, i) => (
            <li key={title}>
              <Reveal delay={i * 80} className="h-full">
                <div className="group relative h-full overflow-hidden rounded-3xl border border-zinc-200 bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:border-brand-500/40 hover:shadow-xl hover:shadow-brand-900/10">
                  <span className="pointer-events-none absolute -right-2 -top-4 text-8xl font-extrabold text-zinc-100 transition-colors group-hover:text-brand-50" aria-hidden="true">
                    {i + 1}
                  </span>
                  <span className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-600 to-emerald-500 text-white shadow-lg shadow-brand-600/25">
                    <Icon className="h-6 w-6" aria-hidden="true" />
                  </span>
                  <h3 className="relative mt-5 text-lg font-bold leading-snug text-zinc-900">{title}</h3>
                  <p className="relative mt-2 text-sm leading-relaxed text-zinc-600">{text}</p>
                </div>
              </Reveal>
            </li>
          ))}
        </ul>
      </section>

      {/* Mission + what we do */}
      <section className="mt-16 grid gap-6 sm:mt-24 lg:grid-cols-5" aria-label="Mission">
        <Reveal className="lg:col-span-3">
          <div className="relative h-full overflow-hidden rounded-3xl bg-gradient-to-br from-brand-600 to-emerald-600 p-8 text-white sm:p-10">
            <div className="pointer-events-none absolute -bottom-16 -right-16 h-64 w-64 rounded-full bg-emerald-300/25 blur-3xl" aria-hidden="true" />
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-200">Our mission</p>
            <p className="relative mt-4 text-2xl font-bold leading-snug tracking-tight sm:text-3xl">
              To accelerate the shift toward sustainable energy by delivering high-quality, cost-effective lighting and electrical products, backed by exceptional service.
            </p>
          </div>
        </Reveal>

        <Reveal delay={100} className="lg:col-span-2">
          <div className="h-full rounded-3xl border border-zinc-200 bg-zinc-50 p-6 sm:p-8">
            <h2 className="text-xl font-extrabold tracking-tight text-zinc-900">What we do</h2>
            <ul className="mt-5 space-y-4">
              {whatWeDo.map(item => (
                <li key={item} className="flex gap-3 text-sm leading-relaxed text-zinc-700">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-600 text-white">
                    <Check className="h-3 w-3" strokeWidth={3} aria-hidden="true" />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </section>

      {/* Services */}
      <section className="mt-16 sm:mt-24" aria-labelledby="services-heading">
        <Reveal>
          <p className={eyebrow}>Beyond the product</p>
          <h2 id="services-heading" className={h2}>From design to switch-on</h2>
          <p className="mt-3 max-w-2xl text-zinc-600">Three in-house services take your project from the first idea to the final installation.</p>
        </Reveal>

        <ol className="relative mt-10 grid gap-5 md:grid-cols-3">
          <div className="pointer-events-none absolute left-[16%] right-[16%] top-8 hidden h-px border-t-2 border-dashed border-brand-200 md:block" aria-hidden="true" />
          {services.map(({ Icon, step, title, text }, i) => (
            <li key={title}>
              <Reveal delay={i * 100} className="h-full">
                <div className="relative h-full rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-7">
                  <div className="flex items-center justify-between">
                    <span className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-50 text-brand-700 ring-8 ring-white">
                      <Icon className="h-7 w-7" aria-hidden="true" />
                    </span>
                    <span className="text-5xl font-extrabold tracking-tight text-zinc-100">{step}</span>
                  </div>
                  <h3 className="mt-5 text-xl font-bold text-zinc-900">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-zinc-600">{text}</p>
                </div>
              </Reveal>
            </li>
          ))}
        </ol>
      </section>

      {/* More than lighting */}
      <section className="mt-16 sm:mt-24" aria-labelledby="community-heading">
        <Reveal>
          <p className={eyebrow}>More than just lighting products</p>
          <h2 id="community-heading" className={h2}>Lighting the way to a brighter future</h2>
          <p className="mt-3 max-w-3xl text-zinc-600">
            Ecoshift Corporation is committed to uplifting Filipino communities through sustainable lighting solutions. Through energy-efficient technologies and community partnerships, we provide innovative systems that enhance safety, accessibility, and long-term progress, illuminating spaces and lives for a brighter, greener future.
          </p>
        </Reveal>

        <ul className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {community.map((c, i) => (
            <li key={c.tag}>
              <Reveal delay={i * 80}>
                <figure className="group relative aspect-[4/5] overflow-hidden rounded-3xl bg-gradient-to-br from-brand-100 via-brand-50 to-emerald-100">
                  <Image
                    src={c.image}
                    alt=""
                    fill
                    sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                    loading="lazy"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-900 via-brand-900/40 to-transparent" aria-hidden="true" />
                  <figcaption className="absolute inset-x-0 bottom-0 p-5">
                    <span className="text-[0.65rem] font-bold uppercase tracking-[0.16em] text-brand-200">{c.tag}</span>
                    <p className="mt-1.5 text-lg font-bold leading-snug text-white">{c.line}</p>
                  </figcaption>
                </figure>
              </Reveal>
            </li>
          ))}
        </ul>
      </section>

      {/* CTA */}
      <section className="mt-16 sm:mt-24" aria-labelledby="cta-heading">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-700 via-brand-600 to-emerald-600 px-6 py-12 text-center sm:px-12 sm:py-16">
            <div className="pointer-events-none absolute left-1/2 top-0 h-48 w-[36rem] max-w-full -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-300/25 blur-3xl" aria-hidden="true" />
            <div className="relative mx-auto max-w-3xl">
              <h2 id="cta-heading" className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                Let&rsquo;s build brighter futures <span className="italic text-emerald-200">together</span>
              </h2>
              <p className="mt-4 text-base leading-relaxed text-brand-50 sm:text-lg">
                Ecoshift is committed to being a reliable partner for government institutions and large-scale projects. With a proven track record in delivering sustainable and cost-efficient lighting solutions, we ensure compliance, durability, and long-term value.
              </p>
              <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                <Link href="/contact" className={btnAmber}>
                  Work With Us <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
                <Link href="/quote" className={btnGhostDark}>
                  Request a Quote
                </Link>
              </div>
              <Link href="/blog" className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-brand-50 hover:text-white hover:underline">
                Read our latest articles <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  )
}