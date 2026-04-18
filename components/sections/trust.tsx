'use client'

import { motion } from 'framer-motion'
import { MapPin, FileText, DollarSign } from 'lucide-react'

const reasons = [
  {
    icon: FileText,
    number: 'Better questions.',
    description:
      'Our discovery wizard is a structured process that forces clarity before any work begins. A better brief means a better site — and far fewer surprises along the way.',
  },
  {
    icon: DollarSign,
    number: 'Built for your needs.',
    description:
      'No upselling features you don\'t need. No bloated page builders. Clean, fast, maintainable websites built to suit your business — not the agency\'s preferred workflow.',
  },
  {
    icon: MapPin,
    number: 'We\'re not going anywhere.',
    description:
      'We\'re a small local agency based in Central Victoria, not an offshore churn operation. When something needs fixing, you\'re not lodging a support ticket into a queue.',
  },
]

export function TrustSection() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
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
    <section className="py-24 px-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute top-0 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl"
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
          <p className="text-sm font-medium text-accent mb-3">Why Web F5</p>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 text-balance">
            Why businesses choose us over a bigger agency.
          </h2>
          <p className="text-lg text-foreground/60 max-w-2xl mx-auto text-balance">
            Size isn't the advantage it used to be. Here's what actually matters.
          </p>
        </motion.div>

        {/* Three reasons */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid md:grid-cols-3 gap-6"
        >
          {reasons.map((reason) => {
            const Icon = reason.icon
            return (
              <motion.div
                key={reason.number}
                variants={cardVariants}
                className="p-8 rounded-lg border border-border bg-card/50 hover:bg-card transition-colors flex flex-col gap-4"
              >
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Icon size={22} className="text-primary" />
                </div>
                <h3 className="text-xl font-bold">{reason.number}</h3>
                <p className="text-foreground/60 leading-relaxed text-sm">{reason.description}</p>
              </motion.div>
            )
          })}
        </motion.div>

      </div>
    </section>
  )
}