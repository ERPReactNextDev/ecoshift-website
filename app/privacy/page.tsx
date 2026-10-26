import type { Metadata } from 'next'
import Breadcrumbs from '@/components/Breadcrumbs'
import PageHero, { Glow } from '@/components/PageHero'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://ecoshiftcorp.com'
export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Read the Ecoshift Corporation privacy policy to understand how we collect, use, and protect your data.',
  alternates: { canonical: `${siteUrl}/privacy` }
}

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Privacy Policy' }]} />

      <PageHero
        eyebrow="Legal"
        title={<>Your data, <Glow>handled with care</Glow></>}
        description={`Last updated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`}
        compact
      />

      <div className="mx-auto mt-10 max-w-3xl rounded-3xl border border-zinc-200 bg-white p-6 sm:p-10">
        <div className="prose prose-zinc max-w-none prose-headings:font-extrabold prose-headings:tracking-tight prose-h2:mt-10 prose-h2:text-2xl first:prose-h2:mt-0 prose-a:text-brand-700 prose-li:marker:text-brand-600">
          <p>Ecoshift Corporation is committed to protecting your privacy. This policy explains what data we collect, how we use it, and your rights.</p>
          <h2>Data We Collect</h2>
          <ul>
            <li><strong>Quote request data:</strong> Name, company, email, phone, and products selected.</li>
            <li><strong>Contact form data:</strong> Name, email, phone, subject, message, and branch.</li>
            <li><strong>Usage data:</strong> Pages visited, browser type, and IP address via server logs and Google Analytics.</li>
          </ul>
          <h2>Cookies</h2>
          <p>We use cookies for authentication (Supabase auth), analytics (Google Analytics 4), and your quote basket (localStorage — not sent to our server).</p>
          <h2>Google Analytics</h2>
          <p>If configured, we use GA4 to collect anonymous usage data. You can opt out using the Google Analytics opt-out browser add-on.</p>
          <h2>How We Use Your Data</h2>
          <ul>
            <li>To process and respond to quotation requests</li>
            <li>To respond to contact form submissions</li>
            <li>To improve our website through aggregated analytics</li>
          </ul>
          <h2>Your Rights</h2>
          <p>You may request access to, correction of, or deletion of your personal data. Contact us at <a href="mailto:privacy@ecoshift.com">privacy@ecoshift.com</a>.</p>
        </div>
      </div>
    </div>
  )
}
