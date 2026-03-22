'use client'

import { motion } from 'framer-motion'
import { Check } from 'lucide-react'

const plans = [
  {
    name: 'Starter',
    price: '$499',
    description: 'Perfect for freelancers and small projects',
    features: [
      'AI Brief Analysis',
      'Execution Plan',
      'Basic Asset Generation',
      '5 Revisions',
      'Email Support',
    ],
  },
  {
    name: 'Professional',
    price: '$1,299',
    description: 'For growing agencies and complex projects',
    features: [
      'Everything in Starter',
      'Strategic Recommendations',
      'Advanced Asset Generation',
      'Unlimited Revisions',
      'Priority Support',
      'Team Collaboration',
      'Custom Branding',
    ],
    highlighted: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    description: 'For large teams and custom needs',
    features: [
      'Everything in Professional',
      'Dedicated Account Manager',
      'Custom Integrations',
      'White-label Options',
      '24/7 Phone Support',
      'SLA Guarantee',
      'Custom Workflows',
    ],
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
          animate={{
            opacity: [0.1, 0.2, 0.1],
          }}
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
          <p className="text-sm font-medium text-accent mb-3">Pricing</p>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 text-balance">
            Plans for every team
          </h2>
          <p className="text-lg text-foreground/60 max-w-2xl mx-auto text-balance">
            Start with what you need, upgrade as you grow. No hidden fees.
          </p>
        </motion.div>

        {/* Plans Grid */}
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
              className={`rounded-lg border transition-all ${
                plan.highlighted
                  ? 'bg-primary/5 border-primary/50 md:scale-105 md:shadow-xl md:shadow-primary/20'
                  : 'bg-card/50 border-border hover:bg-card'
              } p-8 flex flex-col`}
            >
              {plan.highlighted && (
                <div className="mb-4 inline-block">
                  <span className="px-3 py-1 bg-primary/20 text-primary rounded-full text-sm font-semibold">
                    Most Popular
                  </span>
                </div>
              )}

              <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
              <p className="text-foreground/60 text-sm mb-6">{plan.description}</p>

              <div className="mb-6">
                <span className="text-4xl font-bold">{plan.price}</span>
                {plan.price !== 'Custom' && <span className="text-foreground/60">/project</span>}
              </div>

              <a
                href="#brief"
                className={`w-full py-3 rounded-lg font-semibold text-center mb-8 transition-all ${
                  plan.highlighted
                    ? 'bg-primary text-primary-foreground hover:shadow-lg hover:shadow-primary/50'
                    : 'border border-border text-foreground hover:bg-secondary'
                }`}
              >
                Get Started
              </a>

              <div className="space-y-4 flex-grow">
                {plan.features.map((feature) => (
                  <div key={feature} className="flex items-center gap-3">
                    <Check size={18} className="text-accent flex-shrink-0" />
                    <span className="text-foreground/80 text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
