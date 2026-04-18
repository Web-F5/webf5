'use client'

import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { HostingPricing } from '@/components/sections/HostingPricing'

const plans = [
  {
    name: 'Trades & local business',
    price: 'From $1,800',
    description: 'A professional website built around your trade or local service — designed to generate enquiries and rank locally.',
    features: [
      'Custom design — no templates',
      'Mobile-first and fast-loading',
      'Contact form and click-to-call',
      'Google Business Profile setup',
      'Basic on-page SEO included',
      'Domain and hosting setup',
    ],
    cta: 'Get a quote',
  },
  {
    name: 'Ecommerce & Shopify',
    price: 'From $3,500',
    description: 'A Shopify store built to sell — product pages, collections, cart, and checkout configured and ready to go.',
    features: [
      'Shopify store setup and configuration',
      'Custom theme or theme customisation',
      'Product catalogue setup',
      'Payment gateway integration',
      'Shipping and tax configuration',
      'SEO-ready product and collection pages',
    ],
    cta: 'Get a quote',
  },
  {
    name: 'Shopify Hydrogen',
    price: 'From $8,000',
    description: 'A fully custom headless Shopify frontend — built in React/Hydrogen for speed, flexibility, and a storefront that looks nothing like a theme.',
    features: [
      'Custom React/Hydrogen frontend',
      'Shopify Storefront API integration',
      'Purpose-built product and collection pages',
      'PageSpeed 95+ performance target',
      'No theme limitations or app conflicts',
      'Scalable for high-volume stores',
    ],
    cta: 'Get a quote',
  },
]

export function PricingSection() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  }

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  }

  return (
    <section id="pricing" className="py-24 px-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
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
            Every project is scoped individually — these are starting points, not hard limits.
            Tell us what you need and we'll come back with a fixed quote.
          </p>
        </motion.div>

        {/* Three-column grid — no card is highlighted by default, hover reveals the accent */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid md:grid-cols-3 gap-6 lg:gap-8"
        >
          {plans.map((plan) => (
            <motion.div
              key={plan.name}
              variants={cardVariants}
              className="group rounded-lg border border-border bg-card/50 p-8 flex flex-col transition-all duration-300 hover:border-primary/50 hover:bg-primary/5 hover:shadow-xl hover:shadow-primary/10"
            >
              <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors duration-300">
                {plan.name}
              </h3>
              <p className="text-foreground/60 text-sm mb-5 leading-relaxed">
                {plan.description}
              </p>

              <div className="mb-6">
                <span className="text-3xl font-bold">{plan.price}</span>
              </div>

              <a
                href="#brief"
                className="w-full py-3 rounded-lg font-semibold text-center mb-8 text-sm border border-border text-foreground transition-all duration-300 group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary group-hover:shadow-lg group-hover:shadow-primary/40"
              >
                {plan.cta} →
              </a>

              <div className="space-y-3 flex-grow">
                {plan.features.map((feature) => (
                  <div key={feature} className="flex items-start gap-3">
                    <Check
                      size={16}
                      className="text-foreground/40 group-hover:text-accent flex-shrink-0 mt-0.5 transition-colors duration-300"
                    />
                    <span className="text-foreground/75 text-sm leading-snug">{feature}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom note */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="text-center text-sm text-foreground/40 mt-10 max-w-xl mx-auto"
        >
          Not sure which applies to you? Start the discovery wizard and we'll work it out together.
        </motion.p>

        {/* Live hosting, domain, SSL and email pricing */}
        <HostingPricing />

      </div>
    </section>
  )
}