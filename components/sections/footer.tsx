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
    { label: 'Blog',       href: '/blog' },
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
          <motion.div variants={itemVariants} className="md:col-span-2">
            <h3 className="text-2xl tracking-tighter bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2" style={{ fontFamily: 'var(--font-syne)', fontWeight: 700 }}>
              Web F5
            </h3>
            <p className="text-foreground/60 text-sm mb-4">
              Web design &amp; development for trades, local businesses and ecommerce brands across Central Victoria.
            </p>
            <div className="flex flex-col gap-2">
              <a
                href="tel:+61419510206"
                className="inline-flex items-center gap-2 text-sm text-foreground/70 hover:text-foreground transition-colors"
              >
                <span>📞</span> 0419 510 206
              </a>
              <a
                href="mailto:contact@webf5.au"
                className="inline-flex items-center gap-2 text-sm text-foreground/70 hover:text-foreground transition-colors"
              >
                <span>✉️</span> contact@webf5.au
              </a>
              <a
                href="https://www.facebook.com/profile.php?id=61575794955380"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-foreground/70 hover:text-foreground transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="opacity-70">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                Facebook
              </a>
            </div>
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
            <p>Central Victoria, Australia</p>
          </div>
        </motion.div>
      </div>
    </footer>
  )
}
