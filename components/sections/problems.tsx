'use client'

import { motion } from 'framer-motion'
import { AlertCircle, Clock, DollarSign, Users } from 'lucide-react'

const problems = [
  {
    icon: Clock,
    title: 'Wasted Time',
    description: 'Agencies spend weeks translating vague briefs into actionable plans.',
  },
  {
    icon: DollarSign,
    title: 'Budget Overruns',
    description: 'Projects exceed budgets due to scope creep and unclear requirements.',
  },
  {
    icon: Users,
    title: 'Stakeholder Misalignment',
    description: 'Teams struggle to stay aligned on vision and goals throughout execution.',
  },
  {
    icon: AlertCircle,
    title: 'Quality Concerns',
    description: 'Rushed execution leads to compromised design and poor user experience.',
  },
]

export function ProblemsSection() {
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
    <section id="solutions" className="py-24 px-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute top-1/4 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl"
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
          <p className="text-sm font-medium text-accent mb-3">The Challenge</p>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 text-balance">
            Your brief deserves better
          </h2>
          <p className="text-lg text-foreground/60 max-w-2xl mx-auto text-balance">
            Today's agencies struggle to bridge the gap between vision and execution. Here's what we're solving.
          </p>
        </motion.div>

        {/* Problems Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid md:grid-cols-2 gap-6"
        >
          {problems.map((problem) => {
            const Icon = problem.icon
            return (
              <motion.div
                key={problem.title}
                variants={cardVariants}
                className="p-6 rounded-lg border border-border bg-card/50 hover:bg-card transition-colors group"
              >
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <Icon size={24} className="text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{problem.title}</h3>
                <p className="text-foreground/60">{problem.description}</p>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}
