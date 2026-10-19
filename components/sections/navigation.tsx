'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, ChevronDown } from 'lucide-react'
import Image from 'next/image'
import dynamic from 'next/dynamic'

const BriefAuthButton = dynamic(
  () => import('@/components/BriefAuthButton').then(m => m.BriefAuthButton),
  { ssr: false }
)

const RESOURCES = [
  { label: 'Free Website Audit', href: '/audit', desc: 'Instant report — speed, SEO, contact & more' },
  { label: 'Website Checklist', href: '/resources/website-checklist', desc: '12 checks every small business site needs' },
  { label: 'Review Request Sender', href: '/resources/review-sender', desc: 'Email review requests to customers — Google, Facebook & more' },
]

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const [resourcesOpen, setResourcesOpen] = useState(false)
  const pathname = usePathname()
  const isHome = pathname === '/'
  const isBrief = pathname === '/brief'

  const anchor = (hash: string) => (isHome ? hash : `/${hash}`)

  const navItems = [
    { label: 'Solutions', href: anchor('#solutions') },
    { label: 'Work', href: '/work' },
    { label: 'Process', href: anchor('#process') },
    { label: 'Pricing', href: anchor('#pricing') },
    { label: 'FAQ', href: anchor('#faq') },
  ]

  return (
    <motion.nav
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="fixed w-full top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        {/* Logo */}
        <motion.a
          href="/"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="flex items-center gap-2"
        >
          <Image src="/images/logo.webp" alt="Web F5 Logo" width={60} height={60} className="h-10 w-auto" priority />
        </motion.a>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          {navItems.map((item, index) => (
            <motion.a
              key={item.label}
              href={item.href}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.05 }}
              className="text-sm font-medium text-foreground/70 hover:text-foreground transition-colors"
            >
              {item.label}
            </motion.a>
          ))}

          {/* Resources dropdown */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + navItems.length * 0.05 }}
            className="relative"
            onMouseEnter={() => setResourcesOpen(true)}
            onMouseLeave={() => setResourcesOpen(false)}
          >
            <button className="flex items-center gap-1 text-sm font-medium text-amber-400 hover:text-amber-300 transition-colors">
              Resources
              <ChevronDown size={14} className={`transition-transform duration-200 ${resourcesOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {resourcesOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 6 }}
                  transition={{ duration: 0.15 }}
                  className="absolute top-full right-0 mt-2 w-64 bg-[#111827] border border-white/10 rounded-xl shadow-xl overflow-hidden"
                >
                  {RESOURCES.map(r => (
                    <a
                      key={r.href}
                      href={r.href}
                      className="flex flex-col gap-0.5 px-4 py-3.5 hover:bg-white/5 transition-colors border-b border-white/5 last:border-0"
                    >
                      <span className="text-sm font-semibold text-white">{r.label}</span>
                      <span className="text-xs text-slate-400">{r.desc}</span>
                    </a>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* CTA / Auth Button Desktop */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="hidden md:flex items-center gap-4"
        >
          <a
            href="tel:+61419510206"
            className="text-sm font-medium text-slate-400 hover:text-white transition-colors"
          >
            0419 510 206
          </a>
          {isBrief ? (
            <BriefAuthButton />
          ) : (
            <a
              href="/brief"
              className="px-6 py-2 bg-indigo-700 text-white rounded-full text-sm font-semibold hover:bg-indigo-600 hover:shadow-lg hover:shadow-primary/50 transition-all"
            >
              Get Started
            </a>
          )}
        </motion.div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden p-2 text-foreground"
          aria-label="Toggle menu"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden border-t border-border bg-card"
          >
            <div className="px-4 py-4 space-y-3">
              {navItems.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="block text-sm font-medium text-foreground/70 hover:text-foreground py-2 transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  {item.label}
                </a>
              ))}

              {/* Resources section in mobile */}
              <div className="pt-1 border-t border-border/50">
                <p className="text-xs font-semibold text-amber-400 uppercase tracking-wider py-2">Resources</p>
                {RESOURCES.map(r => (
                  <a
                    key={r.href}
                    href={r.href}
                    className="block text-sm font-medium text-foreground/70 hover:text-foreground py-2 transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    {r.label}
                  </a>
                ))}
              </div>

              <a
                href="tel:+61419510206"
                className="block text-sm font-medium text-indigo-400 hover:text-indigo-300 py-2 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                📞 0419 510 206
              </a>

              <a
                href="/brief"
                className="block w-full mt-4 px-6 py-2 bg-primary text-primary-foreground rounded-full text-sm font-semibold text-center"
                onClick={() => setIsOpen(false)}
              >
                Get Started
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}
