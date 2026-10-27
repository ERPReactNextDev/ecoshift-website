import type { Metadata } from 'next'
import './globals.css'
import { QuoteProvider } from '@/lib/quote-context'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import ScrollToTop from '@/components/ScrollToTop'
import Script from 'next/script'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://ecoshiftcorp.com'
const siteName = process.env.NEXT_PUBLIC_SITE_NAME || 'Ecoshift Corporation'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${siteName} — Energy-Efficient Lighting & Electrical Solutions`,
    template: `%s | ${siteName}`
  },
  description: 'Energy-efficient lighting and electrical solutions for businesses across the Philippines. Request a quote today.',
  openGraph: {
    type: 'website',
    siteName,
    images: [{ url: '/og-default.webp', width: 1200, height: 630 }]
  },
  twitter: { card: 'summary_large_image' },
  robots: { index: true, follow: true }
}

const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: siteName,
  url: siteUrl,
  logo: `${siteUrl}/og-default.webp`,
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'customer service',
    availableLanguage: 'English'
  }
}

const gaId = process.env.NEXT_PUBLIC_GA_ID

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        {process.env.NEXT_PUBLIC_GSC_VERIFICATION && (
          <meta name="google-site-verification" content={process.env.NEXT_PUBLIC_GSC_VERIFICATION} />
        )}
      </head>
      <body>
        <QuoteProvider>
          <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-1 pt-20">{children}</main>
            <Footer />
          </div>
          <ScrollToTop />
        </QuoteProvider>

        {gaId && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
              strategy="afterInteractive"
            />
            <Script id="ga-init" strategy="afterInteractive">{`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${gaId}');
            `}</Script>
          </>
        )}
      </body>
    </html>
  )
}

