'use client'

import { motion } from 'framer-motion'
import { Check } from 'lucide-react'

const steps = [
  { number: '01', title: 'Upload Your Brief', description: 'Share your vision, goals, and requirements in a single document.' },
  { number: '02', title: 'AI Analysis', description: 'Our AI extracts key insights, identifies gaps, and clarifies scope.' },
  { number: '03', title: 'Expert Review', description: 'Our team reviews and adds strategic recommendations.' },
  { number: '04', title: 'Execution Plan', description: 'Get a detailed roadmap with milestones and timelines.' },
  { number: '05', title: 'Asset Generation', description: 'Receive wireframes, prototypes, and design system ready to build.' },
  { number: '06', title: 'Launch Ready', description: 'Deploy your project with confidence using our templates.' },
]

export function ProcessSection() {
  return (
    <section id="process" className="py-24 px-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            opacity: [0.2, 0.3, 0.2],
          }}
          transition={{ duration: 10, repeat: Infinity }}
          className="absolute bottom-1/4 left-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl"
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
          <p className="text-sm font-medium text-accent mb-3">The Process</p>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 text-balance">
            Six steps to perfection
          </h2>
          <p className="text-lg text-foreground/60 max-w-2xl mx-auto text-balance">
            Our proven methodology turns your brief into a complete, execution-ready web presence.
          </p>
        </motion.div>

        {/* Steps Timeline */}
        <div className="relative">
          {/* Vertical Line */}
          <div className="absolute left-0 md:left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-primary/0 via-primary/40 to-primary/0 transform -translate-x-1/2" />

          {/* Steps */}
          <div className="space-y-8">
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className={`flex items-center gap-8 ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}
              >
                {/* Content */}
                <div className={`flex-1 ${index % 2 === 0 ? 'md:text-right' : 'md:text-left'}`}>
                  <div className="p-6 rounded-lg border border-border bg-card/50 hover:bg-card transition-colors">
                    <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                    <p className="text-foreground/60">{step.description}</p>
                  </div>
                </div>

                {/* Dot */}
                <motion.div
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.1 + 0.2 }}
                  viewport={{ once: true }}
                  className="relative z-10 flex-shrink-0"
                >
                  <div className="w-12 h-12 rounded-full bg-primary border-4 border-background flex items-center justify-center">
                    <span className="text-primary-foreground font-bold text-sm">{step.number}</span>
                  </div>
                </motion.div>

                {/* Spacer */}
                <div className="flex-1 md:block hidden" />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
