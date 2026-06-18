import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
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
      <body className="font-sans antialiased" style={{ backgroundColor: '#0A0F1E', color: '#FFFFFF' }}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
