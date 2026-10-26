import type { ReactNode } from 'react'

export type Variant = 'straight' | 'bent'
export type Part = 'panel' | 'head' | 'arm' | 'pole' | 'base'

/**
 * Coordinate system: the pole's base plate sits at (0,0) and the pole grows UP (negative y).
 * Natural height is ~360 units. Scenes scale/translate this group as needed.
 */
type Geo = {
  pole: string
  arm: string
  armW: number
  head: { x: number; y: number }
  panel: { x: number; y: number; r: number }
  struts: string[]
  panelBottom: [number, number]
  wireB: string
  anchors: Record<Part, [number, number]>
}

const GEO: Record<Variant, Geo> = {
  // Straight pole, short horizontal arm, lamp to the left, panel tilted on top
  straight: {
    pole: 'M0 0 V-340',
    arm: 'M0 -322 H-30',
    armW: 9,
    head: { x: -128, y: -334 },
    panel: { x: 36, y: -354, r: -22 },
    struts: ['M0 -334 L46 -326', 'M0 -306 L40 -324'],
    panelBottom: [47, -326],
    wireB: 'M-5 -190 V-322 H-30',
    anchors: { panel: [36, -354], head: [-78, -322], arm: [-16, -322], pole: [0, -160], base: [0, 4] }
  },
  // Gooseneck pole: the top bends over the road, lamp hangs at the end
  bent: {
    pole: 'M0 0 V-236',
    arm: 'M0 -236 C0 -306 -10 -346 -64 -346 H-84',
    armW: 13,
    head: { x: -172, y: -358 },
    panel: { x: 54, y: -262, r: -24 },
    struts: ['M0 -226 L60 -238', 'M0 -250 L50 -252'],
    panelBottom: [65, -235],
    wireB: 'M-5 -190 V-236 C-5 -300 -14 -340 -66 -340 H-90',
    anchors: { panel: [54, -262], head: [-122, -346], arm: [-30, -330], pole: [0, -140], base: [0, 4] }
  }
}

const RING: Record<Part, number> = { panel: 76, head: 66, arm: 38, pole: 52, base: 46 }

export function StreetlightDefs() {
  return (
    <defs>
      <linearGradient id="sl-cone" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#fde68a" stopOpacity="0.75" />
        <stop offset="1" stopColor="#fde68a" stopOpacity="0" />
      </linearGradient>
      <radialGradient id="sl-halo">
        <stop offset="0" stopColor="#fef08a" stopOpacity="0.9" />
        <stop offset="1" stopColor="#fef08a" stopOpacity="0" />
      </radialGradient>
      <linearGradient id="sl-panel" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#1e40af" />
        <stop offset="1" stopColor="#172554" />
      </linearGradient>
    </defs>
  )
}

export interface GroupProps {
  variant?: Variant
  /** 0..1 lamp brightness */
  lit?: number
  /** 0..1 sunlight hitting the panel */
  charge?: number
  /** show battery + controller inside the pole */
  cutaway?: boolean
  battery?: number
  /** dash offset for the energy-flow wires */
  flow?: number
  charging?: boolean
  discharging?: boolean
  highlight?: Part | null
  /** pole sway in degrees (rotates around the base) */
  sway?: number
  /** used by the install animation: slide lamp + panel in from above */
  topOffset?: number
  topOpacity?: number
}

export function StreetlightGroup({
  variant = 'straight',
  lit = 0,
  charge = 0,
  cutaway = false,
  battery = 0.6,
  flow = 0,
  charging = false,
  discharging = false,
  highlight = null,
  sway = 0,
  topOffset = 0,
  topOpacity = 1
}: GroupProps) {
  const g = GEO[variant]
  const dim = (part: Part) => (highlight && highlight !== part ? 0.28 : 1)
  const { head, panel } = g
  const hx = head.x
  const lensY = head.y + 22
  const coneTop = head.y + 26
  const poleW = variant === 'straight' ? 12 : 13
  const [ringX, ringY] = g.anchors[highlight ?? 'pole']

  const wire = (d: string, on: boolean) => (
    <g>
      <path d={d} stroke="#052e16" strokeWidth={5} fill="none" strokeLinecap="round" opacity={0.55} />
      <path
        d={d}
        stroke={on ? '#fbbf24' : '#3f6212'}
        strokeWidth={3}
        fill="none"
        strokeLinecap="round"
        strokeDasharray="4 8"
        strokeDashoffset={-flow}
      />
    </g>
  )

  return (
    <g>
      {/* Light cone + pool on the ground (stays put while the pole sways) */}
      {lit > 0.01 && (
        <g opacity={lit}>
          <polygon points={`${hx + 8},${coneTop} ${hx + 92},${coneTop} ${hx + 190},0 ${hx - 90},0`} fill="url(#sl-cone)" />
          <ellipse cx={hx + 50} cy={2} rx={120} ry={9} fill="#fde68a" opacity={0.35} />
        </g>
      )}

      <g transform={`rotate(${sway})`}>
        {/* Pole */}
        <g opacity={dim('pole')}>
          <path d={g.pole} stroke="#71717a" strokeWidth={poleW + 2} strokeLinecap="round" fill="none" />
          <path d={g.pole} stroke="#d4d4d8" strokeWidth={poleW - 2} strokeLinecap="round" fill="none" />
          <path d={g.pole} stroke="#fafafa" strokeWidth={2} strokeLinecap="round" fill="none" opacity={0.7} transform="translate(-2 0)" />
        </g>

        {/* Arm */}
        <g opacity={dim('arm')}>
          <path d={g.arm} stroke="#71717a" strokeWidth={g.armW + 2} strokeLinecap="round" fill="none" />
          <path d={g.arm} stroke="#d4d4d8" strokeWidth={g.armW - 2} strokeLinecap="round" fill="none" />
        </g>

        {/* Cutaway: battery + charge controller inside the pole */}
        {cutaway && (
          <g opacity={dim('pole')}>
            <rect x={-26} y={-198} width={52} height={118} rx={9} fill="#052e16" stroke="#4ade80" strokeOpacity={0.6} />
            <rect x={-13} y={-182} width={26} height={72} rx={4} fill="#0a0a0a" stroke="#a1a1aa" />
            <rect x={-5} y={-187} width={10} height={5} rx={1} fill="#a1a1aa" />
            <rect x={-10} y={-113 - 64 * battery} width={20} height={64 * battery} rx={2} fill={battery > 0.35 ? '#4ade80' : '#f59e0b'} />
            <rect x={-13} y={-102} width={26} height={16} rx={2} fill="#166534" stroke="#86efac" strokeOpacity={0.5} />
            {[-7, 0, 7].map(x => (
              <circle key={x} cx={x} cy={-94} r={1.8} fill="#bbf7d0" />
            ))}
            {wire(`M${g.panelBottom[0]} ${g.panelBottom[1]} V-216 H0 V-190`, charging)}
            {wire(g.wireB, discharging)}
          </g>
        )}

        {/* Lamp + panel (can slide in during the install animation) */}
        <g transform={`translate(0 ${topOffset})`} opacity={topOpacity}>
          <g opacity={dim('head')}>
            <rect x={hx} y={head.y} width={100} height={24} rx={11} fill="#3f3f46" stroke="#18181b" />
            <rect x={hx + 6} y={head.y + 3} width={88} height={4} rx={2} fill="#a1a1aa" opacity={0.35} />
            <rect x={hx + 8} y={lensY} width={84} height={5} rx={2.5} fill="#a3a3a3" />
            <rect x={hx + 8} y={lensY} width={84} height={5} rx={2.5} fill="#fde047" opacity={lit} />
            {lit > 0.01 && <ellipse cx={hx + 50} cy={lensY + 4} rx={72} ry={26} fill="url(#sl-halo)" opacity={lit} />}
          </g>

          <g opacity={dim('panel')}>
            {g.struts.map(d => (
              <path key={d} d={d} stroke="#a1a1aa" strokeWidth={4} strokeLinecap="round" fill="none" />
            ))}
            <g transform={`translate(${panel.x} ${panel.y}) rotate(${panel.r})`}>
              <rect x={-60} y={-30} width={120} height={60} rx={3} fill="url(#sl-panel)" stroke="#d4d4d8" strokeWidth={3} />
              {[-30, 0, 30].map(x => (
                <line key={x} x1={x} x2={x} y1={-30} y2={30} stroke="#93c5fd" strokeOpacity={0.35} />
              ))}
              {[-10, 10].map(y => (
                <line key={y} x1={-60} x2={60} y1={y} y2={y} stroke="#93c5fd" strokeOpacity={0.35} />
              ))}
              <rect x={-60} y={-30} width={120} height={60} rx={3} fill="#fbbf24" opacity={charge * 0.38} />
              <path d="M-60 -30 L-18 -30 L-60 12 Z" fill="#fff" opacity={0.12} />
            </g>
          </g>
        </g>

        {/* Base plate + anchor bolts */}
        <g opacity={dim('base')}>
          <rect x={-28} y={-5} width={56} height={9} rx={2} fill="#71717a" />
          {[-21, -8, 8, 21].map(x => (
            <rect key={x} x={x - 2.5} y={-13} width={5} height={9} rx={1} fill="#d4d4d8" />
          ))}
        </g>

        {highlight && (
          <circle
            cx={ringX}
            cy={ringY}
            r={RING[highlight]}
            fill="none"
            stroke="#fbbf24"
            strokeWidth={3}
            strokeDasharray="8 7"
            className="animate-pulse"
          />
        )}
      </g>
    </g>
  )
}

interface StreetlightProps extends GroupProps {
  className?: string
  /** draw ground + foundation block */
  ground?: boolean
  children?: ReactNode
}

/** Standalone streetlight illustration. */
export default function Streetlight({ className, ground = true, children, ...rest }: StreetlightProps) {
  return (
    <svg viewBox="-230 -430 460 490" className={className} role="img" aria-label="Solar streetlight illustration" preserveAspectRatio="xMidYMax meet">
      <StreetlightDefs />
      {ground && (
        <g>
          <rect x={-230} y={0} width={460} height={60} fill="#052e16" />
          <line x1={-230} x2={230} y1={0} y2={0} stroke="#166534" strokeWidth={2} />
          <rect x={-38} y={6} width={76} height={42} rx={3} fill="#3f3f46" stroke="#52525b" opacity={0.85} />
        </g>
      )}
      <StreetlightGroup {...rest} />
      {children}
    </svg>
  )
}