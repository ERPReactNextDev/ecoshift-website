// Single source of truth for branch data (matches the About page).
export type BranchKind = 'office' | 'warehouse' | 'branch'
export type Branch = { name: string; address: string; kind: BranchKind }
export type Region = { name: string; tagline: string; branches: Branch[] }

export const regions: Region[] = [
  {
    name: 'Luzon',
    tagline: 'Head office and NCR warehouse',
    branches: [
      { name: 'Head Office', address: 'J&L Building, EDSA, Mandaluyong City', kind: 'office' },
      { name: 'NCR Warehouse', address: '#4780 Ortigas Avenue Extension, Pasig City', kind: 'warehouse' }
    ]
  },
  {
    name: 'Visayas',
    tagline: 'Serving Cebu and nearby provinces',
    branches: [
      { name: 'Cebu Branch', address: 'Unit 7A, Zuellig Avenue Street, Mandaue Reclamation Area, Mandaue City, Cebu', kind: 'branch' }
    ]
  },
  {
    name: 'Mindanao',
    tagline: 'Davao and Northern Mindanao',
    branches: [
      { name: 'Davao Branch', address: 'Saavedra Bldg., No. 3 Pag-Asa Village, Davao City, Matina Aplaya', kind: 'branch' },
      { name: 'Cagayan de Oro Branch (Warehouse)', address: '#29 Alwana Business Park, Cugman, Cagayan de Oro', kind: 'warehouse' }
    ]
  }
]

export const allBranches = regions.flatMap(r => r.branches.map(b => ({ ...b, region: r.name })))
export const branchNames = allBranches.map(b => b.name)

export const mapsUrl = (b: Pick<Branch, 'name' | 'address'>) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${b.name} ${b.address}`)}`

export const CONTACT = {
  email: 'info@ecoshiftcorp.com',
  phone: '+63 (2) 8888-8888',
  phoneHref: 'tel:+6328888888',
  hours: 'Mon–Fri, 8:00 AM – 5:00 PM'
}
