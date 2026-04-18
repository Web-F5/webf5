'use client'

import { motion } from 'framer-motion'
import { Copy, HelpCircle, Rocket, Wrench } from 'lucide-react'

const problems = [
  {
    icon: Copy,
    title: 'Built for everyone, suited to no one',
    description:
      'Template sites look like every other business in your industry. Your competitors have the same one — and so does the one down the street.',
  },
  {
    icon: HelpCircle,
    title: 'Nobody asked the right questions',
    description:
      'If the agency doesn\'t understand your business, your customers, or your goals — the site won\'t either. Guesswork costs money and time.',
  },
  {
    icon: Wrench,
    title: 'Slow, vague, and over budget',
    description:
      'Without a clear brief, projects drag out. Scope creep kicks in. The final invoice surprises nobody more than you.',
  },
  {
    icon: Rocket,
    title: 'Launched and forgotten',
    description:
      'A site that can\'t be updated, found on Google, or adapted as your business grows is a liability — not an asset.',
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
          animate={{ opacity: [0.1, 0.2, 0.1] }}
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
          <p className="text-sm font-medium text-accent mb-3">The problem</p>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 text-balance">
            Most small business websites fail before they're even launched.
          </h2>
          <p className="text-lg text-foreground/60 max-w-2xl mx-auto text-balance">
            It's not bad luck — it's the same four problems, every time. Our discovery process is built specifically to fix them.
          </p>
        </motion.div>

        {/* Problems grid */}
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