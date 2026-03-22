'use client'

import { motion } from 'framer-motion'
import { Star } from 'lucide-react'

const testimonials = [
  {
    quote:
      "Web F5 cut our project timeline in half. What used to take 3 months now takes 6 weeks. The clarity we got from their process was invaluable.",
    author: 'Sarah Chen',
    role: 'Creative Director',
    company: 'Digital Studios',
  },
  {
    quote:
      "Our clients love how we can now deliver faster without sacrificing quality. Web F5's execution plan became our playbook.",
    author: 'Marcus Rodriguez',
    role: 'Agency Founder',
    company: 'Creative Forward',
  },
  {
    quote:
      "The AI brief analysis saved us countless hours of back-and-forth with clients. Everyone finally understood the vision.",
    author: 'Emma Thompson',
    role: 'Project Manager',
    company: 'Brand Solutions',
  },
]

export function TestimonialsSection() {
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
    <section className="py-24 px-4 relative overflow-hidden">
      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="text-sm font-medium text-accent mb-3">Social Proof</p>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 text-balance">
            Loved by creative teams
          </h2>
        </motion.div>

        {/* Testimonials Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid md:grid-cols-3 gap-6"
        >
          {testimonials.map((testimonial) => (
            <motion.div
              key={testimonial.author}
              variants={cardVariants}
              className="p-8 rounded-lg border border-border bg-card/50 hover:bg-card transition-colors flex flex-col"
            >
              {/* Rating */}
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} className="fill-accent text-accent" />
                ))}
              </div>

              {/* Quote */}
              <p className="text-foreground/80 mb-6 flex-grow italic">"{testimonial.quote}"</p>

              {/* Author */}
              <div>
                <p className="font-semibold text-foreground">{testimonial.author}</p>
                <p className="text-sm text-foreground/60">
                  {testimonial.role} at {testimonial.company}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
