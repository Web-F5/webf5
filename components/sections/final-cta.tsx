'use client'

import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'

export function FinalCTASection() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: 'easeOut' },
    },
  }

  return (
    <section id="brief" className="py-24 px-4 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute top-0 left-1/2 w-96 h-96 bg-primary/10 rounded-full blur-3xl -translate-x-1/2"
        />
        <motion.div
          animate={{
            opacity: [0.2, 0.3, 0.2],
          }}
          transition={{ duration: 10, repeat: Infinity, delay: 1 }}
          className="absolute bottom-0 right-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl"
        />
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="max-w-3xl mx-auto text-center relative z-10"
      >
        <motion.h2 variants={itemVariants} className="text-5xl md:text-6xl font-bold tracking-tight mb-6 text-balance">
          Ready to transform your brief?
        </motion.h2>

        <motion.p variants={itemVariants} className="text-lg text-foreground/70 mb-10 text-balance">
          Join agencies and studios already using Web F5 to deliver faster, better projects.
        </motion.p>

        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="#pricing"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary text-primary-foreground rounded-full font-semibold hover:shadow-lg hover:shadow-primary/50 transition-all"
          >
            Get Started Now
            <ArrowRight size={20} />
          </a>
          <a
            href="#process"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 border border-border text-foreground rounded-full font-semibold hover:bg-card transition-all"
          >
            Learn More
          </a>
        </motion.div>
      </motion.div>
    </section>
  )
}
