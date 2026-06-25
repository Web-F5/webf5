import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import Script from 'next/script'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'Web F5 - Brief to Execution in Minutes',
  description: 'Transform your brief into a fully executed web presence with AI-powered guidance.',
  generator: 'v0.app',
  openGraph: {
    title: 'Web F5 - Brief to Execution in Minutes',
    description: 'Transform your brief into a fully executed web presence with AI-powered guidance.',
    url: 'https://webf5.com.au',
    siteName: 'Web F5',
    images: [
      {
        url: '/images/Web-F5-brief-to-execution-in-minutes.webp',
        width: 1200,
        height: 630,
        alt: 'Web F5 - Brief to Execution in Minutes',
      },
    ],
    locale: 'en_AU',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Web F5 - Brief to Execution in Minutes',
    description: 'Transform your brief into a fully executed web presence with AI-powered guidance.',
    images: ['/images/Web-F5-brief-to-execution-in-minutes.webp'],
  },
  icons: {
    icon: [
      {
        url: '/favicon.ico',
        type: 'image/x-icon',
      },
      {
        url: '/favicon-96x96.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/web-app-manifest-192x192.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/favicon.svg',
        type: 'image/svg+xml',
      }
    ],
    apple: '/apple-touch-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <Script
          id="gtm-head"
          strategy="beforeInteractive"
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
        {children}
        <Analytics />
      </body>
    </html>
  )
}
