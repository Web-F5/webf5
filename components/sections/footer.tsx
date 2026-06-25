'use client'

import { motion } from 'framer-motion'

const footerLinks = {
  Services: [
    { label: 'Web Design',       href: '/#solutions' },
    { label: 'Web Development',  href: '/#solutions' },
    { label: 'SEO Setup',        href: '/#pricing' },
    { label: 'Care Plans',       href: '/#pricing' },
  ],
  Company: [
    { label: 'Our Work',   href: '/work' },
    { label: 'Pricing',    href: '/#pricing' },
    { label: 'Process',    href: '/#process' },
    { label: 'Contact',    href: 'mailto:contact@webf5.au' },
  ],
  Legal: [
    { label: 'Privacy Policy', href: '/privacy' },
  ],
}

export function Footer() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
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
    <footer className="border-t border-border bg-card/30 py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid md:grid-cols-5 gap-8 mb-12"
        >
          {/* Brand */}
          <motion.div variants={itemVariants}>
            <h3 className="text-2xl font-bold tracking-tighter bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2">
              Web F5
            </h3>
            <p className="text-foreground/60 text-sm">
              Brief to execution in minutes. For creative teams that demand better.
            </p>
          </motion.div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <motion.div key={category} variants={itemVariants}>
              <h4 className="font-semibold mb-4">{category}</h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.label}>
                    <a href={link.href} className="text-foreground/60 hover:text-foreground text-sm transition-colors">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </motion.div>

        {/* Divider */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="border-t border-border pt-8"
        >
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-foreground/60">
            <p>&copy; {new Date().getFullYear()} Web F5. All rights reserved.</p>
            <a href="mailto:contact@webf5.au" className="hover:text-foreground transition-colors">
              contact@webf5.au
            </a>
          </div>
        </motion.div>
      </div>
    </footer>
  )
}
