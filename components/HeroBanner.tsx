'use client'

import { Fragment, useCallback, useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Bricolage_Grotesque } from 'next/font/google'
import './hero-banner.css'

const font = Bricolage_Grotesque({
  subsets: ['latin'],
  weight: ['400', '600', '800'],
  variable: '--hb-font',
  display: 'swap'
})

const DURATION = 6500

type Slide = {
  category: string
  headline: string
  description: string
  chips: string[]
  cta: string
  href: string
  image: string
  // position of the lamp in the photo (glow origin)
  lx: string
  ly: string
}

// TODO: point each `href` to the real category/filter URL in /products
const SLIDES: Slide[] = [
  {
    category: 'Peace and Order',
    headline: 'Safe streets start with light.',
    description: 'Powerful LED street lights that save energy and last for years.',
    chips: ['LED Street Lights', 'Solar Post Lights', 'Park & Plaza Lighting'],
    cta: 'Shop street lights',
    href: '/products',
    image: '/banner/peace-and-order.jpg',
    lx: '43%',
    ly: '14%'
  },
  {
    category: 'Disaster and Risk Management',
    headline: 'Light that keeps going when the power doesn’t.',
    description: 'Solar and rechargeable lights for rescue teams, evacuation centers, and blackouts.',
    chips: ['Solar Lanterns', 'Rechargeable Headlamps', 'Emergency Lights'],
    cta: 'Shop emergency lights',
    href: '/products',
    image: '/banner/disaster-risk.jpg',
    lx: '37%',
    ly: '27%'
  },
  {
    category: 'Health & Nutrition',
    headline: 'Clear light for careful hands.',
    description: 'Bright, flicker-free light in the right color for clinics, health centers, and hospitals.',
    chips: ['Clinic Lighting', 'Examination Lamps', 'Ward & Corridor LEDs'],
    cta: 'Shop clinic lighting',
    href: '/products',
    image: '/banner/health-nutrition.jpg',
    lx: '38%',
    ly: '27%'
  },
  {
    category: 'Education',
    headline: 'A brighter room makes a brighter mind.',
    description: 'LED panel and tube lights that make the board easy to read and go easy on the eyes.',
    chips: ['LED Panel Lights', 'Classroom Tube Lights', 'Whiteboard Lights'],
    cta: 'Shop classroom lights',
    href: '/products',
    image: '/banner/education.jpg',
    lx: '31%',
    ly: '11%'
  }
]

export default function HeroBanner() {
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const [reduceMotion, setReduceMotion] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    setReduceMotion(window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  }, [])

  const go = useCallback((n: number) => {
    setIndex((n + SLIDES.length) % SLIDES.length)
  }, [])

  // auto-advance; restarts whenever the slide changes or pause toggles
  useEffect(() => {
    if (paused || reduceMotion) return
    timer.current = setTimeout(() => go(index + 1), DURATION)
    return () => {
      if (timer.current) clearTimeout(timer.current)
    }
  }, [index, paused, reduceMotion, go])

  return (
    <section
      className={`hb ${font.variable}${paused ? ' paused' : ''}`}
      aria-roledescription="carousel"
      aria-label="Brighter choice for every Filipino"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {SLIDES.map((s, k) => {
        const words = s.headline.split(' ')
        return (
          <article
            key={s.category}
            className={`slide${k === index ? ' on' : ''}`}
            style={{ '--lx': s.lx, '--ly': s.ly } as React.CSSProperties}
            aria-label={s.category}
            aria-hidden={k !== index}
          >
            <div className="bg">
              <Image
                src={s.image}
                alt=""
                fill
                sizes="100vw"
                priority={k === 0}
                style={{ objectFit: 'cover' }}
              />
            </div>
            <div className="glow" />
            <div className="beam b1" />
            <div className="beam b2" />
            <div className="core" />
            <div className="shade" />
            <div className="copy">
              <div className="cat">
                {s.category}
                <i />
              </div>
              {k === 0 ? (
                <h1 aria-label={s.headline}>{renderWords(words)}</h1>
              ) : (
                <h2 className="hb-h" aria-label={s.headline}>{renderWords(words)}</h2>
              )}
              <div className="product">
                <p>{s.description}</p>
                <ul className="chips">
                  {s.chips.map(c => (
                    <li key={c}>{c}</li>
                  ))}
                </ul>
                <Link className="cta" href={s.href} tabIndex={k === index ? 0 : -1}>
                  {s.cta}
                </Link>
              </div>
            </div>
          </article>
        )
      })}

      <p className="tag">
        Together, let’s choose the brighter choice for every Filipino,
        <em>one community at a time</em>
      </p>

      <div className="nav" role="tablist" aria-label="Choose slide">
        {SLIDES.map((s, k) => (
          <button
            key={s.category}
            type="button"
            role="tab"
            aria-selected={k === index}
            aria-label={s.category}
            className={`dot${k === index ? ' on' : ''}${k < index ? ' done' : ''}`}
            onClick={() => go(k)}
          />
        ))}
      </div>

      <span className="sr" aria-live="polite">
        {SLIDES[index].category}
      </span>
    </section>
  )
}

function renderWords(words: string[]) {
  return words.map((w, i) => (
    <Fragment key={i}>
      <span>
        <b style={{ '--i': i } as React.CSSProperties}>{w}</b>
      </span>
      {i < words.length - 1 ? ' ' : ''}
    </Fragment>
  ))
}