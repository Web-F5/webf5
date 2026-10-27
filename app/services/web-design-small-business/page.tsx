import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Web Design for Small Business - Central Victoria | Web F5',
  description:
    'Web F5 specialises in web design for small business across Central Victoria. Fixed-price quotes, custom builds, and local SEO foundations baked in from day one.',
  alternates: { canonical: 'https://webf5.com.au/services/web-design-small-business' },
}

const reasons = [
  {
    title: 'Built around your business, not a template',
    body: 'Every site we build starts with a structured discovery process. We find out which services matter most, which suburbs you work in, and what your customers actually search for before anyone opens a design tool.',
  },
  {
    title: 'Local SEO baked in from day one',
    body: 'Web design for small business only works if Google can find you. We build service pages and location pages structured for local search - not bolted on afterwards as an afterthought.',
  },
  {
    title: 'Mobile-first, fast to load',
    body: 'Most of your visitors will arrive on a phone. We build for mobile first and optimise for speed. A slow site costs you calls before a visitor has read a single word.',
  },
  {
    title: 'Fixed-price quotes, no surprises',
    body: 'Scope is agreed before work begins. You know exactly what you are getting and what it costs. No scope creep, no runaway invoices.',
  },
]

const faqs = [
  {
    q: 'What does web design for small business typically cost?',
    a: 'At Web F5, small business websites start from $1,800 for a clean, fast, mobile-first site with local SEO foundations. Larger projects with multiple service pages and location pages are quoted individually. All prices are fixed upfront.',
  },
  {
    q: 'How long does a small business website take to build?',
    a: 'Most projects are live within four to eight weeks. The most common delay is content - if you have your copy, photos, and details ready at the start, the timeline shortens considerably.',
  },
  {
    q: 'Do I need to provide the content?',
    a: 'We help you shape the content through our discovery process, but you know your business best. We work with you to turn that knowledge into copy that converts. Photos of real work are strongly recommended - they outperform stock images every time.',
  },
  {
    q: 'Can you take over a site I already have?',
    a: 'Yes. We can audit what you have, identify the specific gaps that are costing you enquiries, and either fix the existing site or rebuild it properly. We will tell you honestly which option makes more sense for your situation.',
  },
]

export default function WebDesignSmallBusinessPage() {
  return (
    <main className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="mb-12">
          <p className="text-primary text-sm font-medium tracking-widest uppercase mb-3">Web F5 · Central Victoria</p>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-5 leading-tight text-balance">
            Web Design for Small Business
          </h1>
          <p className="text-foreground/60 text-lg leading-relaxed">
            Most small business websites look fine but generate nothing. Web F5 builds sites that rank locally, load fast on a phone, and turn visitors into enquiry calls - for tradies and local service businesses across Central Victoria.
          </p>
        </div>

        {/* Why it matters */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Why most small business websites don't work</h2>
          <p className="text-foreground/70 leading-relaxed mb-4">
            Web design for small business is a different discipline from building a corporate site. The goal is local visibility and phone calls - not brand storytelling. That means the right page structure, suburb-specific content, a visible click-to-call number, and pages Google can actually index for the searches your customers are using.
          </p>
          <p className="text-foreground/70 leading-relaxed">
            Template builders are fast to launch but structurally weak for local SEO and custom conversion work. A site that doesn't rank for your service area isn't an asset - it's a monthly cost that returns nothing.
          </p>
        </div>

        {/* What we do differently */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">What Web F5 does differently</h2>
          <div className="flex flex-col gap-5">
            {reasons.map((r) => (
              <div key={r.title} className="flex gap-4">
                <span className="text-primary mt-1 flex-shrink-0">✓</span>
                <div>
                  <p className="font-semibold mb-1">{r.title}</p>
                  <p className="text-sm text-foreground/60 leading-relaxed">{r.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Who we work with */}
        <div className="mb-12 border border-border rounded-2xl p-6 bg-card/30">
          <h2 className="text-xl font-bold mb-3">Who we work with</h2>
          <p className="text-foreground/60 text-sm leading-relaxed mb-4">
            We work with trades and local service businesses across Central Victoria - electricians, plumbers, builders, landscapers, fencing contractors, earthmovers, and more. If your business relies on local customers finding you online, we build sites that make that happen.
          </p>
          <p className="text-foreground/60 text-sm leading-relaxed">
            Our clients include businesses in Bendigo, Ballarat, Shepparton, Echuca, Seymour, Castlemaine, Maryborough, and across the region. We understand what local search looks like in regional Victoria because we are based here.
          </p>
        </div>

        {/* FAQ */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Common questions</h2>
          <div className="flex flex-col gap-5">
            {faqs.map((faq) => (
              <div key={faq.q} className="border-b border-border pb-5">
                <p className="font-semibold mb-2">{faq.q}</p>
                <p className="text-sm text-foreground/60 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="border border-primary/20 rounded-2xl p-8 bg-primary/5 text-center">
          <h2 className="text-2xl font-bold mb-3">Ready to get started?</h2>
          <p className="text-foreground/60 mb-6 leading-relaxed">
            Tell us about your business and we will send you a fixed-price quote within 24 hours. No obligation, no sales call required.
          </p>
          <Link
            href="/brief"
            className="inline-block bg-primary text-white font-semibold px-8 py-3.5 rounded-xl hover:bg-primary/90 transition-colors text-base"
          >
            Start your brief →
          </Link>
          <p className="text-foreground/30 text-xs mt-4">Fixed-price quotes. No lock-in contracts. Based in Central Victoria.</p>
        </div>

      </div>
    </main>
  )
}
