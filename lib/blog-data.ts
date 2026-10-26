import type { BlogPost } from './types'

export const blogPosts: BlogPost[] = [
  {
    slug: 'led-retrofit-roi-guide',
    title: 'LED Retrofit ROI: How to Calculate Your Savings',
    excerpt: 'Learn how to calculate the return on investment for an LED lighting retrofit, including energy savings, maintenance costs, and payback periods.',
    content: '<p>Upgrading to LED lighting is one of the most impactful energy-saving investments a business can make.</p><h2>Step 1: Measure Current Consumption</h2><p>Start by auditing your existing lighting. Note wattage, hours of operation, and quantity for each fixture type.</p><h2>Step 2: Calculate Proposed Consumption</h2><p>LED replacements typically use 50–70% less energy.</p><h2>Step 3: Factor in Maintenance</h2><p>LEDs last 3–5× longer than fluorescent or halogen lamps.</p><h2>Step 4: Determine Payback Period</h2><p>Divide the total project cost by annual savings. Most retrofits pay back in 1–3 years.</p>',
    author: 'Ecoshift Team',
    publishedAt: '2026-01-15',
    tags: ['LED', 'Energy Savings', 'ROI', 'Retrofit'],
    ogImage: '/og-default.webp'
  },
  {
    slug: 'choosing-right-color-temperature',
    title: 'Choosing the Right Color Temperature for Your Space',
    excerpt: 'Warm, neutral, or cool? Understanding color temperature and how it affects mood, productivity, and visual comfort in different environments.',
    content: '<p>Color temperature, measured in Kelvin (K), describes the appearance of light.</p><h2>Warm White (2700K–3000K)</h2><p>Ideal for hospitality and relaxing environments.</p><h2>Neutral White (3500K–4000K)</h2><p>Suitable for offices, retail, and general commercial spaces.</p><h2>Cool White (5000K–6500K)</h2><p>Best for industrial, healthcare, and detail-oriented work areas.</p>',
    author: 'Ecoshift Team',
    publishedAt: '2026-02-08',
    tags: ['Color Temperature', 'Design', 'Lighting Basics'],
    ogImage: '/og-default.webp'
  },
  {
    slug: 'smart-lighting-controls-explained',
    title: 'Smart Lighting Controls Explained',
    excerpt: 'From occupancy sensors to daylight harvesting, discover how smart controls can reduce energy costs beyond LED upgrades.',
    content: '<p>LED upgrades deliver significant savings, but smart controls can push energy reduction further — sometimes by an additional 30–50%.</p><h2>Occupancy Sensors</h2><p>Detect presence and turn lights on or off automatically.</p><h2>Daylight Harvesting</h2><p>Uses photosensors to dim artificial light when natural light is sufficient.</p><h2>Scheduling</h2><p>Time-based control ensures lights are off when spaces are unoccupied.</p>',
    author: 'Ecoshift Team',
    publishedAt: '2026-03-20',
    tags: ['Smart Lighting', 'Controls', 'Energy Savings'],
    ogImage: '/og-default.webp'
  },
  {
    slug: 'warehouse-lighting-best-practices',
    title: 'Warehouse Lighting Best Practices',
    excerpt: 'High-bay LED lighting design for warehouses: optimal lux levels, uniformity ratios, and fixture placement.',
    content: '<p>Proper warehouse lighting is critical for safety, productivity, and energy efficiency.</p><h2>Lux Levels</h2><p>General storage areas need 150–200 lux; packing and inspection zones need 300–500 lux.</p><h2>Uniformity</h2><p>A uniformity ratio of 0.6 or better prevents dark spots and eye strain.</p><h2>Motion Sensors</h2><p>In aisles and low-traffic zones, motion sensors reduce energy waste.</p>',
    author: 'Ecoshift Team',
    publishedAt: '2026-04-12',
    tags: ['Warehouse', 'Industrial', 'High-Bay', 'Best Practices'],
    ogImage: '/og-default.webp'
  },
  {
    slug: 'understanding-lumen-output',
    title: 'Understanding Lumen Output vs. Wattage',
    excerpt: 'Why lumens matter more than watts when comparing lighting products, and how to use efficacy to evaluate efficiency.',
    content: '<p>Watts measure power consumption, not light output. Lumens measure the actual light a fixture produces.</p><h2>What Are Lumens?</h2><p>A lumen is a unit of luminous flux — the total quantity of visible light emitted by a source.</p><h2>Lumens Per Watt (Efficacy)</h2><p>A 100 lm/W LED is far more efficient than a 15 lm/W incandescent.</p>',
    author: 'Ecoshift Team',
    publishedAt: '2026-05-03',
    tags: ['Lumens', 'Wattage', 'Efficacy', 'Lighting Basics'],
    ogImage: '/og-default.webp'
  }
]
