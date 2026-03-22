'use client'

import { motion } from 'framer-motion'
import { TrendingUp, Clock, CheckCircle, Users } from 'lucide-react'

const stats = [
  {
    icon: TrendingUp,
    number: '10x',
    label: 'Faster execution',
    description: 'From brief to launch in days, not months',
  },
  {
    icon: Clock,
    number: '80%',
    label: 'Time saved',
    description: 'Automated brief analysis and planning',
  },
  {
    icon: CheckCircle,
    number: '100%',
    label: 'Scope clarity',
    description: 'No more hidden requirements or scope creep',
  },
  {
    icon: Users,
    number: '50+',
    label: 'Teams served',
    description: 'From startups to enterprise agencies',
  },
]

export function TrustSection() {
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
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.6 },
    },
  }

  return (
    <section className="py-24 px-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            opacity: [0.1, 0.2, 0.1],
          }}
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
          <p className="text-sm font-medium text-accent mb-3">Why Teams Choose Web F5</p>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 text-balance">
            Results that speak for themselves
          </h2>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {stats.map((stat) => {
            const Icon = stat.icon
            return (
              <motion.div
                key={stat.label}
                variants={cardVariants}
                className="p-6 rounded-lg border border-border bg-card/50 hover:bg-card transition-colors"
              >
                <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                  <Icon size={24} className="text-accent" />
                </div>
                <div className="text-3xl font-bold mb-1 text-primary">{stat.number}</div>
                <h3 className="text-sm font-semibold mb-2">{stat.label}</h3>
                <p className="text-sm text-foreground/60">{stat.description}</p>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}
