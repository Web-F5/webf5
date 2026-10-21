'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Check } from 'lucide-react'

const ANNUAL_DISCOUNT = 0.10

const seoPlans = [
  {
    name: 'Local',
    monthlyPrice: 499,
    tagline: 'For single-location trades and small businesses wanting to rank in their suburb or town.',
    features: [
      'Google Business Profile optimisation',
      '2 optimised pages per month',
      'Local keyword research & targeting',
      'On-page SEO fixes',
      'Citation building',
      'Monthly performance report',
    ],
    footnote: null,
    featured: false,
  },
  {
    name: 'Growth',
    monthlyPrice: 999,
    tagline: 'For growing businesses targeting a wider region and competing for multiple high-value keywords.',
    features: [
      'Everything in Local',
      '4 optimised pages per month',
      'Regional keyword expansion',
      'Link building (3–5 links/month)',
      'Competitor ranking tracker',
      'Google Ads integration advice',
      'Monthly strategy call',
    ],
    footnote: null,
    featured: true,
  },
  {
    name: 'Authority',
    monthlyPrice: 1899,
    tagline: 'For established businesses wanting dominant local and regional authority in competitive industries.',
    features: [
      'Everything in Growth',
      '8 optimised pages per month',
      'Backlink outreach campaigns',
      'Schema markup implementation',
      'Core Web Vitals monitoring',
      'Quarterly strategy session',
      'Priority support',
    ],
    footnote: null,
    featured: false,
  },
]

function fmt(n: number) {
  return `$${Math.round(n).toLocaleString()}`
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
}

export function SeoPricing() {
  const [annual, setAnnual] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true }}
      id="seo-packages"
      className="mt-24"
    >
      {/* Header */}
      <div className="text-center mb-10">
        <p className="text-sm font-medium text-accent mb-3">SEO Packages</p>
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-balance">
          Rank higher. Get found. Stay there.
        </h2>
        <p className="text-foreground/60 max-w-2xl mx-auto text-balance text-base">
          Ongoing SEO that compounds over time, built around your location, your industry, and the customers you actually want.
        </p>
      </div>

      {/* Monthly / Annual toggle */}
      <div className="flex justify-center mb-10">
        <div className="inline-flex items-center bg-card border border-border rounded-full p-1 gap-1">
          <button
            onClick={() => setAnnual(false)}
            className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
              !annual ? 'bg-primary text-white shadow' : 'text-foreground/60 hover:text-foreground'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setAnnual(true)}
            className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 flex items-center gap-2 ${
              annual ? 'bg-primary text-white shadow' : 'text-foreground/60 hover:text-foreground'
            }`}
          >
            Annual
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full transition-colors ${
              annual ? 'bg-white/20 text-white' : 'bg-emerald-500/15 text-emerald-400'
            }`}>
              Save 10%
            </span>
          </button>
        </div>
      </div>

      {/* Cards */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="grid md:grid-cols-3 gap-6 lg:gap-8 items-start"
      >
        {seoPlans.map((plan) => {
          const monthly = annual
            ? plan.monthlyPrice * (1 - ANNUAL_DISCOUNT)
            : plan.monthlyPrice

          return (
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
              <p className="text-foreground/60 text-sm mb-5 leading-relaxed">{plan.tagline}</p>

              <div className="mb-2">
                <span className="text-xs text-foreground/50 uppercase tracking-wider">From</span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-3xl font-bold">{fmt(monthly)}</span>
                  <span className="text-foreground/50 text-sm">/month</span>
                </div>
                {annual && (
                  <p className="text-xs text-emerald-400 mt-1">
                    {fmt(monthly * 12)}/year, saving {fmt(plan.monthlyPrice * 12 * ANNUAL_DISCOUNT)}
                  </p>
                )}
              </div>

              <a
                href="/brief"
                className={`w-full py-3 rounded-lg font-semibold text-center mt-5 mb-8 text-sm border transition-all duration-300 ${
                  plan.featured
                    ? 'bg-primary text-white border-primary hover:bg-indigo-600 hover:shadow-lg hover:shadow-primary/40'
                    : 'border-border text-foreground group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary group-hover:shadow-lg group-hover:shadow-primary/40'
                }`}
              >
                Get started →
              </a>

              <div className="space-y-3 flex-grow">
                {plan.features.map((feature) => (
                  <div key={feature} className="flex items-start gap-3">
                    <Check
                      size={16}
                      className={`flex-shrink-0 mt-0.5 transition-colors duration-300 ${plan.featured ? 'text-accent' : 'text-foreground/40 group-hover:text-accent'}`}
                    />
                    <span className="text-foreground/75 text-sm leading-snug">{feature}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )
        })}
      </motion.div>

      <p className="text-center text-xs text-foreground/40 mt-8 max-w-2xl mx-auto leading-relaxed">
        All SEO packages are month-to-month on the monthly plan. Annual plans are billed upfront and attract a 10% discount. Prices exclude GST. Results typically become measurable within 60–90 days.
      </p>
    </motion.div>
  )
}
