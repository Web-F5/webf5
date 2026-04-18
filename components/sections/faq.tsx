'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Minus } from 'lucide-react'

const faqs = [
  {
    question: 'How long does a website take to build?',
    answer:
      'Most local business and trades sites take 2–4 weeks from brief to launch. Ecommerce builds are typically 4–8 weeks depending on catalogue size and complexity. Shopify Hydrogen projects run 8–12 weeks. We\'ll give you a specific timeline in your quote — not a vague estimate.',
  },
  {
    question: 'Do I need to provide content and images?',
    answer:
      'We\'ll guide you on both. If you have content and photos, great — we\'ll work with what you have. If not, we can advise on copywriting and sourcing images that suit your brand. We won\'t leave you staring at a blank page.',
  },
  {
    question: 'Can you take over my existing website?',
    answer:
      'Yes. We handle migrations, redesigns, and platform changes regularly — from WordPress to Shopify, from one host to another, from an old static site to a modern build. Tell us about your current setup in the discovery wizard and we\'ll factor it into the scope.',
  },
  {
    question: 'What happens after my site launches?',
    answer:
      'You get full access to everything — hosting, CMS, domain — and we\'re available for ongoing support. We offer monthly hosting and maintenance packages, SEO services, and ad-hoc updates. Or we hand everything over and you manage it yourself. Your call.',
  },
  {
    question: 'Where are you based?',
    answer:
      'Central Victoria, Australia. We work with clients across Victoria, WA, and nationally for ecommerce and Shopify projects. We\'re not remote-first by necessity — we\'re local by choice.',
  },
  {
    question: 'Do you offer fixed-price quotes?',
    answer:
      'Always. Once we\'ve reviewed your discovery brief we come back with a fixed-price quote — not a range, not a "starting from." You know exactly what you\'re paying before any work begins. Scope changes are discussed and agreed before they affect the price.',
  },
  {
    question: 'What do you need from me to get started?',
    answer:
      'Just 5 minutes in the discovery wizard. Answer the questions as best you can — even rough answers help us scope accurately. We\'ll follow up with any questions before putting together your quote.',
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
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ opacity: [0.1, 0.2, 0.1] }}
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
          <p className="text-sm font-medium text-accent mb-3">Common questions</p>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 text-balance">
            Questions? We have answers.
          </h2>
          <p className="text-lg text-foreground/60 max-w-xl mx-auto text-balance">
            If something isn't covered here, start the wizard and ask us directly.
          </p>
        </motion.div>

        {/* FAQ items */}
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
                  className="flex-shrink-0 ml-4"
                >
                  {openIndex === index ? (
                    <Minus size={18} className="text-primary" />
                  ) : (
                    <Plus size={18} className="text-foreground/40" />
                  )}
                </motion.div>
              </button>

              <AnimatePresence initial={false}>
                {openIndex === index && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="px-6 pb-5 pt-0 text-sm text-foreground/60 leading-relaxed border-t border-border"
                  >
                    <div className="pt-4">{faq.answer}</div>
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