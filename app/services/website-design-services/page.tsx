import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Website Design Services - Central Victoria | Web F5',
  description:
    'Professional website design services for trades, local businesses, and ecommerce brands across Central Victoria. Custom builds, fixed-price quotes, and local SEO included.',
  alternates: { canonical: 'https://webf5.com.au/services/website-design-services' },
}

const services = [
  {
    title: 'Trade and local service websites',
    body: 'Built for electricians, plumbers, builders, landscapers, and any local service business that relies on customers finding them through Google. Local SEO, mobile-first layouts, click-to-call design, and suburb-specific pages.',
    price: 'From $1,800',
  },
  {
    title: 'Small business websites',
    body: 'For retail stores, professional services, health and wellness businesses, and any small business that needs a professional online presence. Clean design, fast loading, and conversion-focused page structure.',
    price: 'From $2,200',
  },
  {
    title: 'Ecommerce websites',
    body: 'Custom online stores built on proven foundations. Product pages optimised for search, streamlined checkout flows, and integrations with the platforms your business already uses.',
    price: 'From $3,500',
  },
  {
    title: 'Website redesigns and audits',
    body: 'If your current site exists but isn\'t generating enquiries, we audit what\'s wrong, identify the specific gaps costing you leads, and rebuild or fix it with a clear scope and a fixed price.',
    price: 'From $900',
  },
]

const included = [
  'Structured discovery process before any design begins',
  'Custom design - no templates',
  'Mobile-first, fast-loading build',
  'On-page SEO foundations included as standard',
  'Google Business Profile alignment',
  'Contact form and click-to-call setup',
  'SSL, hosting setup assistance, and domain connection',
  'Post-launch support period',
]

export default function WebsiteDesignServicesPage() {
  return (
    <main className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="mb-12">
          <p className="text-primary text-sm font-medium tracking-widest uppercase mb-3">Web F5 · Central Victoria</p>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-5 leading-tight text-balance">
            Website Design Services
          </h1>
          <p className="text-foreground/60 text-lg leading-relaxed">
            Web F5 provides website design services for trades, local businesses, and ecommerce brands across Central Victoria. Every project starts with discovery, is scoped with a fixed price, and is built to generate real results - not just look good.
          </p>
        </div>

        {/* What's included */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">What's included in every project</h2>
          <ul className="flex flex-col gap-3">
            {included.map((item) => (
              <li key={item} className="flex gap-3 items-start">
                <span className="text-primary mt-0.5 flex-shrink-0">✓</span>
                <span className="text-foreground/80 text-sm leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Services */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Services and pricing</h2>
          <div className="flex flex-col gap-4">
            {services.map((s) => (
              <div key={s.title} className="border border-border rounded-xl p-5 bg-card/30">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <h3 className="font-semibold">{s.title}</h3>
                  <span className="text-sm font-semibold text-primary flex-shrink-0">{s.price}</span>
                </div>
                <p className="text-sm text-foreground/60 leading-relaxed">{s.body}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-foreground/40 mt-4">All prices are indicative starting points. Every project is quoted individually based on scope. Fixed-price quotes are provided before work begins.</p>
        </div>

        {/* How we work */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-4">How we work</h2>
          <p className="text-foreground/70 leading-relaxed mb-4">
            Our website design services follow a fixed process. It starts with a structured discovery brief - a detailed conversation about your business, your customers, your service area, and your goals. That brief drives every design decision and eliminates the guesswork that causes scope creep and disappointing outcomes.
          </p>
          <p className="text-foreground/70 leading-relaxed mb-4">
            Once scope is agreed, we quote a fixed price. No hourly billing, no moving targets. You know what you are getting and what it costs before anyone opens a design file.
          </p>
          <p className="text-foreground/70 leading-relaxed">
            We are based in Central Victoria. Our clients are mostly trades and local service businesses in Bendigo, Ballarat, Shepparton, Seymour, Castlemaine, and surrounding towns. We understand regional Victorian business and what local customers actually search for.
          </p>
        </div>

        {/* CTA */}
        <div className="border border-primary/20 rounded-2xl p-8 bg-primary/5 text-center">
          <h2 className="text-2xl font-bold mb-3">Get a fixed-price quote</h2>
          <p className="text-foreground/60 mb-6 leading-relaxed">
            Tell us about your project through our brief tool and we will come back with a clear scope and a fixed price within 24 hours.
          </p>
          <Link
            href="/brief"
            className="inline-block bg-primary text-white font-semibold px-8 py-3.5 rounded-xl hover:bg-primary/90 transition-colors text-base"
          >
            Start your brief →
          </Link>
          <p className="text-foreground/30 text-xs mt-4">No obligation. No sales call required. Based in Central Victoria.</p>
        </div>

      </div>
    </main>
  )
}
