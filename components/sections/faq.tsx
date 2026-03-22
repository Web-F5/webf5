'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Minus } from 'lucide-react'

const faqs = [
  {
    question: 'How long does the entire process take?',
    answer:
      'From upload to final assets, expect 5-7 business days. Rush options available for enterprise clients.',
  },
  {
    question: 'What file formats should I submit my brief in?',
    answer:
      'We accept PDF, DOCX, and plain text. You can also paste content directly into our platform.',
  },
  {
    question: 'Do I own the executed assets and plans?',
    answer:
      'Yes, 100%. All assets, designs, and plans are fully owned by you and can be used however you like.',
  },
  {
    question: 'Can I request revisions?',
    answer:
      'Absolutely. Each plan includes revisions. Starter includes 5, Professional includes unlimited.',
  },
  {
    question: 'Is there a team collaboration feature?',
    answer:
      'Yes, Professional and Enterprise plans include full team collaboration and commenting features.',
  },
  {
    question: 'Can you integrate with my existing tools?',
    answer:
      'We support integrations with popular design, project management, and development tools. Enterprise plans include custom integrations.',
  },
]

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4 },
    },
  }

  return (
    <section id="faq" className="py-24 px-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{ duration: 10, repeat: Infinity }}
          className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl"
        />
      </div>

      <div className="max-w-3xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="text-sm font-medium text-accent mb-3">Common Questions</p>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 text-balance">
            Questions? We have answers
          </h2>
        </motion.div>

        {/* FAQ Items */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="space-y-3"
        >
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="border border-border rounded-lg bg-card/50 overflow-hidden hover:bg-card transition-colors"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full px-6 py-4 flex items-center justify-between text-left font-semibold hover:text-primary transition-colors"
              >
                <span>{faq.question}</span>
                <motion.div
                  animate={{ rotate: openIndex === index ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {openIndex === index ? (
                    <Minus size={20} className="text-primary" />
                  ) : (
                    <Plus size={20} className="text-foreground/40" />
                  )}
                </motion.div>
              </button>

              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="px-6 pb-4 pt-0 text-foreground/60 border-t border-border"
                  >
                    {faq.answer}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
