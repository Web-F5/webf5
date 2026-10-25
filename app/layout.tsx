import type { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/next'
import Script from 'next/script'
import { Syne } from 'next/font/google'
import './globals.css'

const syne = Syne({ subsets: ['latin'], weight: '700', variable: '--font-syne', display: 'swap' })

export const metadata: Metadata = {
  title: {
    default: 'Web Design & Development Central Victoria | Web F5',
    template: '%s | Web F5',
  },
  description:
    'Web F5 builds websites for trades, local businesses, and ecommerce brands across Central Victoria. Fixed-price quotes, no lock-in contracts.',
  metadataBase: new URL('https://webf5.com.au'),
  alternates: {
    canonical: 'https://webf5.com.au',
  },
  openGraph: {
    title: 'Web Design & Development Central Victoria | Web F5',
    description:
      'Web F5 builds websites for trades, local businesses, and ecommerce brands across Central Victoria. Fixed-price quotes, no lock-in contracts.',
    url: 'https://webf5.com.au',
    siteName: 'Web F5',
    images: [
      {
        url: '/images/Web-F5-brief-to-execution-in-minutes.webp',
        width: 1200,
        height: 630,
        alt: 'Web F5 — Web Design & Development Central Victoria',
      },
    ],
    locale: 'en_AU',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Web Design & Development Central Victoria | Web F5',
    description:
      'Web F5 builds websites for trades, local businesses, and ecommerce brands across Central Victoria. Fixed-price quotes, no lock-in contracts.',
    images: ['/images/Web-F5-brief-to-execution-in-minutes.webp'],
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon-96x96.png', type: 'image/png', sizes: '96x96' },
    ],
    apple: '/apple-touch-icon.png',
  },
}

const schemaOrg = {
  '@context': 'https://schema.org',
  '@type': ['LocalBusiness', 'ProfessionalService'],
  name: 'Web F5',
  description: 'Web design and development for trades, local businesses, and ecommerce brands across Central Victoria. Fixed-price quotes, no lock-in contracts.',
  url: 'https://webf5.com.au',
  telephone: '+61419510206',
  email: 'contact@webf5.au',
  address: {
    '@type': 'PostalAddress',
    addressRegion: 'Victoria',
    addressCountry: 'AU',
  },
  areaServed: {
    '@type': 'State',
    name: 'Victoria',
    addressCountry: 'AU',
  },
  priceRange: '$$',
  image: 'https://webf5.com.au/images/web-app-manifest-512x512.png',
  sameAs: [
    'https://webf5.com.au',
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`dark ${syne.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaOrg) }}
        />
        <Script
          id="meta-pixel"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window,document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init','4839672882933902');
fbq('track','PageView');`,
          }}
        />
        <Script
          id="gtm-head"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-PJ85D9J5');`,
          }}
        />
      </head>
      <body className="font-sans antialiased" style={{ backgroundColor: '#0A0F1E', color: '#FFFFFF' }}>
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-PJ85D9J5"
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
          />
        </noscript>
        <noscript>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img height="1" width="1" style={{ display: 'none' }}
            src="https://www.facebook.com/tr?id=4839672882933902&ev=PageView&noscript=1"
            alt=""
          />
        </noscript>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
