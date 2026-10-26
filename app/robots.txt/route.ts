export function GET() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://ecoshiftcorp.com'
  const body = [
    'User-agent: *',
    'Allow: /',
    'Disallow: /admin',
    'Disallow: /api/',
    '',
    `Sitemap: ${siteUrl}/sitemap.xml`
  ].join('\n')
  return new Response(body, { headers: { 'Content-Type': 'text/plain', 'Cache-Control': 'public, max-age=3600' } })
}
