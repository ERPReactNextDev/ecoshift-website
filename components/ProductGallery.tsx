'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, ImageOff, Maximize2, Search, X, ZoomIn, ZoomOut } from 'lucide-react'

type Props = { images: string[]; name: string }
type Pos = { x: number; y: number }

const ZOOM = 2.5

function pctPos(rect: DOMRect, clientX: number, clientY: number): Pos {
  const x = Math.min(100, Math.max(0, ((clientX - rect.left) / rect.width) * 100))
  const y = Math.min(100, Math.max(0, ((clientY - rect.top) / rect.height) * 100))
  return { x, y }
}

/**
 * Product gallery with a magnifier:
 *  - hover (desktop) zooms the image under the cursor
 *  - click / tap opens a full-screen lightbox with zoom, arrows, thumbnails and keyboard support
 * Drop-in replacement for the old ProductGallery (same props).
 */
export default function ProductGallery({ images, name }: Props) {
  const [active, setActive] = useState(0)
  const [pos, setPos] = useState<Pos | null>(null)
  const [open, setOpen] = useState(false)
  const count = images.length

  const go = useCallback((d: number) => setActive(i => (i + d + count) % count), [count])

  if (count === 0) {
    return (
      <div className="flex aspect-square items-center justify-center rounded-3xl border border-zinc-200 bg-zinc-50 text-zinc-300">
        <ImageOff className="h-16 w-16" aria-hidden="true" />
        <span className="sr-only">No image available for {name}</span>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Main viewer */}
      <div
        role="button"
        tabIndex={0}
        aria-label={`Enlarge image of ${name}`}
        onClick={() => setOpen(true)}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setOpen(true) }
        }}
        onMouseMove={e => setPos(pctPos(e.currentTarget.getBoundingClientRect(), e.clientX, e.clientY))}
        onMouseLeave={() => setPos(null)}
        className="group relative aspect-square cursor-zoom-in overflow-hidden rounded-3xl border border-zinc-200 bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={images[active]}
          alt={name}
          draggable={false}
          className="h-full w-full select-none object-contain p-6 transition-transform duration-200 ease-out sm:p-10"
          style={pos ? { transform: `scale(${ZOOM})`, transformOrigin: `${pos.x}% ${pos.y}%` } : undefined}
        />

        <span
          className={`pointer-events-none absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-brand-900/80 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur transition-opacity ${
            pos ? 'opacity-0' : 'opacity-100'
          }`}
        >
          <Search className="h-3.5 w-3.5 text-brand-300" aria-hidden="true" />
          <span className="hidden sm:inline">Hover to zoom · Click to enlarge</span>
          <span className="sm:hidden">Tap to enlarge</span>
        </span>

        <span className="pointer-events-none absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-zinc-700 shadow-sm">
          <Maximize2 className="h-4 w-4" aria-hidden="true" />
        </span>

        {count > 1 && (
          <>
            <button
              type="button"
              aria-label="Previous image"
              onClick={e => { e.stopPropagation(); go(-1) }}
              className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-zinc-800 shadow-md transition-all hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
            >
              <ChevronLeft className="h-5 w-5" aria-hidden="true" />
            </button>
            <button
              type="button"
              aria-label="Next image"
              onClick={e => { e.stopPropagation(); go(1) }}
              className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-zinc-800 shadow-md transition-all hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
            >
              <ChevronRight className="h-5 w-5" aria-hidden="true" />
            </button>
            <span className="pointer-events-none absolute bottom-3 right-3 rounded-full bg-brand-900/80 px-2.5 py-1 text-xs font-semibold text-white">
              {active + 1} / {count}
            </span>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {count > 1 && (
        <ul className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {images.map((src, i) => (
            <li key={src + i} className="shrink-0">
              <button
                type="button"
                onClick={() => setActive(i)}
                aria-label={`Show image ${i + 1} of ${count}`}
                aria-current={i === active ? 'true' : undefined}
                className={`h-16 w-16 overflow-hidden rounded-2xl border-2 bg-white p-1 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 sm:h-20 sm:w-20 ${
                  i === active ? 'border-brand-600 shadow-md shadow-brand-600/20' : 'border-zinc-200 opacity-70 hover:border-brand-500/50 hover:opacity-100'
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt="" loading="lazy" draggable={false} className="h-full w-full object-contain" />
              </button>
            </li>
          ))}
        </ul>
      )}

      {open && (
        <Lightbox
          images={images}
          name={name}
          index={active}
          onIndex={setActive}
          onClose={() => setOpen(false)}
        />
      )}
    </div>
  )
}

function Lightbox({
  images,
  name,
  index,
  onIndex,
  onClose
}: {
  images: string[]
  name: string
  index: number
  onIndex: (i: number) => void
  onClose: () => void
}) {
  const count = images.length
  const [zoomed, setZoomed] = useState(false)
  const [pos, setPos] = useState<Pos>({ x: 50, y: 50 })
  const closeRef = useRef<HTMLButtonElement>(null)

  const step = useCallback(
    (d: number) => {
      setZoomed(false)
      onIndex((index + d + count) % count)
    },
    [index, count, onIndex]
  )

  useEffect(() => {
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeRef.current?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      else if (e.key === 'ArrowLeft' && count > 1) step(-1)
      else if (e.key === 'ArrowRight' && count > 1) step(1)
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prevOverflow
      window.removeEventListener('keydown', onKey)
    }
  }, [onClose, step, count])

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${name} image viewer`}
      className="fixed inset-0 z-[100] flex flex-col bg-[#020a05]/95 backdrop-blur-sm"
    >
      {/* Top bar */}
      <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <p className="min-w-0 truncate text-sm font-semibold text-white">
          {name}
          {count > 1 && <span className="ml-2 font-normal text-zinc-400">{index + 1} / {count}</span>}
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => { setZoomed(z => !z); setPos({ x: 50, y: 50 }) }}
            className="inline-flex h-10 items-center gap-1.5 rounded-full bg-white/10 px-4 text-sm font-semibold text-white transition-colors hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-300"
          >
            {zoomed ? <ZoomOut className="h-4 w-4" aria-hidden="true" /> : <ZoomIn className="h-4 w-4" aria-hidden="true" />}
            {zoomed ? 'Zoom out' : 'Zoom in'}
          </button>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close image viewer"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-300"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Stage */}
      <div className="relative min-h-0 flex-1 px-2 sm:px-16">
        <div
          className={`relative h-full w-full overflow-hidden rounded-2xl bg-white ${zoomed ? 'cursor-zoom-out' : 'cursor-zoom-in'}`}
          onClick={() => setZoomed(z => !z)}
          onMouseMove={e => zoomed && setPos(pctPos(e.currentTarget.getBoundingClientRect(), e.clientX, e.clientY))}
          onTouchMove={e => {
            if (zoomed && e.touches[0]) setPos(pctPos(e.currentTarget.getBoundingClientRect(), e.touches[0].clientX, e.touches[0].clientY))
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={images[index]}
            alt={name}
            draggable={false}
            className="h-full w-full select-none object-contain p-4 transition-transform duration-200 ease-out"
            style={zoomed ? { transform: `scale(${ZOOM})`, transformOrigin: `${pos.x}% ${pos.y}%` } : undefined}
          />
        </div>

        {count > 1 && (
          <>
            <button
              type="button"
              aria-label="Previous image"
              onClick={() => step(-1)}
              className="absolute left-3 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white transition-colors hover:bg-white/25 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-300 sm:left-4"
            >
              <ChevronLeft className="h-6 w-6" aria-hidden="true" />
            </button>
            <button
              type="button"
              aria-label="Next image"
              onClick={() => step(1)}
              className="absolute right-3 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white transition-colors hover:bg-white/25 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-300 sm:right-4"
            >
              <ChevronRight className="h-6 w-6" aria-hidden="true" />
            </button>
          </>
        )}
      </div>

      {/* Thumbs */}
      <div className="px-4 py-3 sm:px-6">
        {count > 1 ? (
          <ul className="mx-auto flex max-w-full justify-start gap-2 overflow-x-auto sm:justify-center [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {images.map((src, i) => (
              <li key={src + i} className="shrink-0">
                <button
                  type="button"
                  onClick={() => { setZoomed(false); onIndex(i) }}
                  aria-label={`Show image ${i + 1} of ${count}`}
                  aria-current={i === index ? 'true' : undefined}
                  className={`h-14 w-14 overflow-hidden rounded-xl border-2 bg-white p-1 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-300 sm:h-16 sm:w-16 ${
                    i === index ? 'border-brand-300' : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt="" draggable={false} className="h-full w-full object-contain" />
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-center text-xs text-zinc-500">{zoomed ? 'Move your cursor or finger to pan' : 'Click the image to zoom'}</p>
        )}
      </div>
    </div>
  )
}