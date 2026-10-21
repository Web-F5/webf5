'use client'

import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { HostingPricing } from '@/components/sections/HostingPricing'
import { SeoPricing } from '@/components/sections/SeoPricing'

const plans = [
  {
    name: 'Starter',
    price: '$2,500',
    tagline: 'A professional, mobile-friendly website to get your business found online. Built lean and fast, priced to compete with DIY builders, minus the DIY.',
    features: [
      'Professionally designed, streamlined build tailored to your business',
      'Up to 8 pages',
      'Mobile-first and fast-loading',
      'Contact form and click-to-call',
      'Google Business Profile setup',
      'Basic on-page SEO',
    ],
    footnote: null,
    featured: false,
  },
  {
    name: 'Professional',
    price: '$6,500',
    tagline: 'A custom-built website designed to generate real enquiries and rank locally, with the content, blog and SEO depth to back it up, or a full Shopify store if you\'re ready to sell online.',
    features: [
      'Custom design, no templates',
      'Up to 20 pages',
      'Mobile-first and fast-loading',
      'Blog and content sections built for local SEO',
      'Google Business Profile setup',
      '---',
      'Full Shopify store with cart and checkout',
    ],
    footnote: 'Shopify stores require a separate Shopify subscription, billed directly by Shopify, from around $56/month.',
    featured: true,
  },
  {
    name: 'Hydrogen / SaaS',
    price: '$15,000',
    tagline: 'A fully custom headless Shopify storefront or bespoke web application, built for scale, speed, and a product that looks nothing like an off-the-shelf theme.',
    features: [
      'Custom React / Hydrogen storefront',
      'Shopify Storefront API integration',
      'Built for high-volume, scaling products',
      'PageSpeed 95+ performance target',
      'No theme limitations or app conflicts',
      '---',
      'Bespoke web application or SaaS build',
      'Custom backend and database architecture',
      'Scoped and quoted per project',
    ],
    footnote: 'Hydrogen stores require a Shopify subscription billed directly by Shopify. SaaS projects are scoped individually.',
    featured: false,
  },
]

export function PricingSection() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  }

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  }

  return (
    <section id="pricing" className="py-24 px-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
        <motion.div
          animate={{ opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute top-1/4 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl"
        />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="text-sm font-medium text-accent mb-3">Investment</p>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 text-balance">
            Straightforward pricing for real projects.
          </h2>
          <p className="text-lg text-foreground/60 max-w-2xl mx-auto text-balance">
            Every project is scoped individually; these are starting points, not hard limits.
            Tell us what you need and we'll come back with a fixed quote.
          </p>
        </motion.div>

        {/* Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid md:grid-cols-3 gap-6 lg:gap-8 items-start"
        >
          {plans.map((plan) => (
            <motion.div
              key={plan.name}
              variants={cardVariants}
              className={`group rounded-xl border p-8 flex flex-col transition-all duration-300 relative ${
                plan.featured
                  ? 'border-primary/60 bg-primary/5 shadow-xl shadow-primary/10'
                  : 'border-border bg-card/50 hover:border-primary/50 hover:bg-primary/5 hover:shadow-xl hover:shadow-primary/10'
              }`}
            >
              {plan.featured && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="bg-primary text-white text-xs font-semibold px-3 py-1 rounded-full">
                    Most popular
                  </span>
                </div>
              )}

              <h3 className={`text-xl font-bold mb-2 transition-colors duration-300 ${plan.featured ? 'text-primary' : 'group-hover:text-primary'}`}>
                {plan.name}
              </h3>
              <p className="text-foreground/60 text-sm mb-5 leading-relaxed">
                {plan.tagline}
              </p>

              <div className="mb-6">
                <span className="text-xs text-foreground/50 uppercase tracking-wider">From</span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-3xl font-bold">{plan.price}</span>
                  <span className="text-foreground/50 text-sm">one-off</span>
                </div>
              </div>

              <a
                href="/brief"
                className={`w-full py-3 rounded-lg font-semibold text-center mb-8 text-sm border transition-all duration-300 ${
                  plan.featured
                    ? 'bg-primary text-white border-primary hover:bg-indigo-600 hover:shadow-lg hover:shadow-primary/40'
                    : 'border-border text-foreground group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary group-hover:shadow-lg group-hover:shadow-primary/40'
                }`}
              >
                Get a quote →
              </a>

              <div className="space-y-3 flex-grow">
                {plan.features.map((feature) =>
                  feature === '---' ? (
                    <div key={feature} className="flex items-center gap-2 py-0.5">
                      <div className="flex-1 h-px bg-border" />
                      <span className="text-xs font-semibold text-foreground/35 uppercase tracking-wider">or</span>
                      <div className="flex-1 h-px bg-border" />
                    </div>
                  ) : (
                    <div key={feature} className="flex items-start gap-3">
                      <Check
                        size={16}
                        className={`flex-shrink-0 mt-0.5 transition-colors duration-300 ${plan.featured ? 'text-accent' : 'text-foreground/40 group-hover:text-accent'}`}
                      />
                      <span className="text-foreground/75 text-sm leading-snug">{feature}</span>
                    </div>
                  )
                )}
              </div>

              {plan.footnote && (
                <p className="mt-6 pt-4 border-t border-border text-xs text-foreground/40 leading-relaxed italic">
                  {plan.footnote}
                </p>
              )}
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom note */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="text-center text-sm text-foreground/40 mt-4 max-w-xl mx-auto"
        >
          Not sure which applies to you? Start the discovery wizard and we'll work it out together.
        </motion.p>

        {/* Live hosting, domain, SSL and email pricing */}
        <HostingPricing />

        {/* SEO packages */}
        <SeoPricing />

      </div>
    </section>
  )
}
