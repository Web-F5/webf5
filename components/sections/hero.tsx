'use client'

import { motion } from 'framer-motion'
import { ArrowRight, Sparkles } from 'lucide-react'
import Image from 'next/image'

export function HeroSection() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
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
    <section className="min-h-screen flex items-center justify-center pt-20 px-4 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute top-20 right-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{ duration: 10, repeat: Infinity, delay: 1 }}
          className="absolute bottom-20 left-20 w-96 h-96 bg-accent/5 rounded-full blur-3xl"
        />
      </div>

      {/* Content */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-4xl mx-auto text-center relative z-10"
      >
        {/* Logo */}
        <motion.div variants={itemVariants} className="mb-12 flex justify-center">
          <Image src="./images/logo.webp" alt="Web F5 Logo" width={260} height={260} className="h-16 w-auto" priority />
        </motion.div>

        {/* Badge */}
        <motion.div variants={itemVariants} className="mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full">
            <Sparkles size={16} className="text-primary" />
            <span className="text-sm font-medium text-primary">AI-Powered Brief Execution</span>
          </div>
        </motion.div>

        {/* Headline */}
        <motion.h1 variants={itemVariants} className="text-5xl md:text-7xl font-bold tracking-tight mb-6 text-balance">
          From Brief to{' '}
          <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            Complete
          </span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          variants={itemVariants}
          className="text-lg md:text-xl text-foreground/70 max-w-2xl mx-auto mb-10 text-balance"
        >
          Upload your brief, get expert guidance, and receive a fully executed web presence. All in one platform.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
          <a
            href="#brief"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary text-primary-foreground rounded-full font-semibold hover:shadow-lg hover:shadow-primary/50 transition-all"
          >
            Upload Your Brief
            <ArrowRight size={20} />
          </a>
          <a
            href="#process"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 border border-border text-foreground rounded-full font-semibold hover:bg-card transition-all"
          >
            See How It Works
          </a>
        </motion.div>

        {/* Trust Bar */}
        <motion.div variants={itemVariants} className="pt-8 border-t border-border">
          <p className="text-sm text-foreground/50 mb-6">Trusted by forward-thinking brands</p>
          <div className="flex justify-center items-center gap-8 md:gap-12 flex-wrap">
            {['Brand A', 'Brand B', 'Brand C', 'Brand D'].map((brand) => (
              <div key={brand} className="text-foreground/40 font-medium text-sm">
                {brand}
              </div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </section>
  )
}
