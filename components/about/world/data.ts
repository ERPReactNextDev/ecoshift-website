import type { Milestone, Region } from '../Scenes'

export type IconKey = 'landmark' | 'route' | 'users' | 'building' | 'award' | 'settings' | 'headset' | 'mapPin' | 'monitor' | 'clipboard' | 'wrench'

/** Everything the 3D page shows. Plain, serializable data so the server page can pass it in. */
export interface AboutData {
  hero: { eyebrow: string; titleStart: string; titleAccent: string; titleEnd: string; sub: string }
  stats: { value: string; label: string }[]
  milestones: Milestone[]
  clientsIntro: { eyebrow: string; title: string; text: string }
  clientTypes: { icon: IconKey; title: string; text: string }[]
  clientNames: string[]
  durability: string[]
  regions: Region[]
  whyIntro: { eyebrow: string; title: string }
  pillars: { icon: IconKey; title: string; text: string }[]
  mission: string
  whatWeDo: string[]
  servicesIntro: { eyebrow: string; title: string; text: string }
  services: { icon: IconKey; step: string; title: string; text: string }[]
  communityIntro: { eyebrow: string; title: string; text: string }
  community: { image: string; tag: string; line: string }[]
  cta: { title: string; accent: string; text: string }
}