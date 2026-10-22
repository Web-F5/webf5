'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, MapPin, ChevronLeft, ChevronRight } from 'lucide-react'
import Image from 'next/image'

// Each showcase entry: desktop image required, tablet/mobile optional (fall back to desktop)
type ShowcaseEntry = {
  name: string
  url: string
  desktop: string
  tablet?: string
  mobile?: string
}

const showcase: ShowcaseEntry[] = [
  { name: 'Chuck E Electrical',   desktop: '/images/Licensed-Electricians- Chuck-E-Electrical.webp',                        mobile: '/images/mobile-chuck-e-electrical.webp',   url: 'https://chuckelec.com' },
  { name: 'F.S.M. Recycling',     desktop: '/images/FSM-Recycling-and-Demolition.webp',                                     mobile: '/images/mobile-fsm-recycling.webp',        url: 'https://fsmrecycle.com.au' },
  { name: 'Outright Electrical',  desktop: '/images/Outright-Electrical-Heathcote-Victoria.webp',                            mobile: '/images/mobile-outright-electrical.webp',  url: 'https://outrightelectrical.com.au' },
  { name: 'Valley Feeds',         desktop: '/images/Valley-Feeds-Katandra-West-Victoria.webp',                               mobile: '/images/mobile-valley-feeds.webp',         url: 'https://valleyfeeds.com.au' },
  { name: 'Horse Hay',            desktop: '/images/Horse-Hay-Invergordan-Victoria.webp',                                    mobile: '/images/mobile-horse-hay.webp',            url: 'https://horsehay.com.au' },
  { name: 'Australian Trenching', desktop: '/images/Australian-Trenching-and-Excavations-Seymour-Victoria.webp',             mobile: '/images/mobile-australian-trenching.webp', url: 'https://austrenching.com.au' },
  { name: 'Appti',                desktop: '/images/Appti.webp',                                                             mobile: '/images/mobile-appti.webp',                url: 'https://appti.net' },
  { name: 'Speechless Electrical',desktop: '/images/Speechless-Electrical-Licensed-Electrician-Seymour.webp',                mobile: '/images/mobile-speechless-electrical.webp',url: 'https://speechlesselec.com' },
  { name: "Let's Get Trowled",    desktop: '/images/Lets-Get-Trowled-Plastering-Services-Seymour.webp',                      mobile: '/images/mobile-lets-get-trowled.webp',     url: 'https://letsgettrowled.com.au' },
  { name: 'LKF Contracting',      desktop: '/images/LKF-Contracting-Agricultural-and- -Civil-Contractors-Invergordon.webp', mobile: '/images/mobile-lkf-contracting.webp',      url: 'https://lkfcontracting.com.au' },
]

const clients = [
  { name: 'Outright Electrical',              logo: '/images/outrightelectrical-logo.webp',  url: 'https://outrightelectrical.com.au' },
  { name: 'Valley Feeds & General',            logo: '/images/valley-feeds-logo.webp',        url: 'https://valleyfeeds.com.au' },
  { name: 'Horse Hay',                         logo: '/images/horse-hay-logo.webp',           url: 'https://horsehay.com.au' },
  { name: 'Australian Trenching',              logo: '/images/ATE-logo.webp',                 url: 'https://austrenching.com.au' },
  { name: 'Chuck E Electrical',                logo: '/images/logo-chuckelec2.webp',          url: 'https://chuckelec.com' },
  { name: 'F.S.M. Recycling',                  logo: '/images/fsm-logo.webp',                url: 'https://fsmrecycle.com.au' },
  { name: 'Appti',                             logo: '/images/Appti-logo.webp',               url: 'https://appti.net' },
  { name: 'Speechless Electrical',             logo: '/images/logo-speechless-electrical.webp', url: 'https://speechlesselec.com' },
  { name: "Let's Get Trowled",                 logo: '/images/logo-lets-get-trowled.webp',    url: 'https://letsgettrowled.com.au' },
  { name: 'LKF Contracting',                   logo: '/images/LKF-logo.webp',                url: 'https://lkfcontracting.com.au' },
]

export function HeroSection() {
  const [index, setIndex]   = useState(0)
  const [paused, setPaused] = useState(false)

  const go = useCallback((next: number, _dir?: number) => {
    setIndex((next + showcase.length) % showcase.length)
  }, [])

  const prev = () => go(index - 1)
  const next = () => go(index + 1)

  useEffect(() => {
    if (paused) return
    const id = setInterval(() => go(index + 1), 5000)
    return () => clearInterval(id)
  }, [index, paused, go])

  const current = showcase[index]

  return (
    <section className="min-h-screen flex items-center justify-center pt-20 px-4 relative overflow-hidden">

      {/* Ambient glows — CSS animation, no JS frame loop */}
      <div className="absolute inset-0 overflow-hidden z-0 pointer-events-none" aria-hidden="true">
        <div className="absolute top-20 right-10 w-[500px] h-[500px] bg-primary/10 rounded-full blur-3xl" style={{ opacity: 0.15, animation: 'heroPulse1 8s ease-in-out infinite', willChange: 'opacity', transform: 'translateZ(0)' }} />
        <div className="absolute top-[60%] left-10 w-[400px] h-[400px] bg-accent/5 rounded-full blur-3xl" style={{ opacity: 0.08, animation: 'heroPulse2 11s ease-in-out infinite', willChange: 'opacity', transform: 'translateZ(0)' }} />
      </div>

      {/* Two-column layout */}
      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center relative z-10">

        {/* ── Left: copy — static, no Framer Motion so LCP element paints immediately ── */}
        <div className="flex flex-col items-start">
          {/* Location badge */}
          <div className="mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 border border-primary/20 rounded-full">
              <MapPin size={13} className="text-primary" />
              <span className="text-xs font-medium text-indigo-300 tracking-wide">
                Web design &amp; development · Central Victoria
              </span>
            </div>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-5 text-balance leading-[1.1]">
            A website built around{' '}
            <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              your business.
            </span>
          </h1>

          <p className="text-base md:text-lg text-foreground/80 mb-3 max-w-lg leading-relaxed">
            <span className="font-bold text-white">Web F5</span> builds websites
            for trades, local businesses, and ecommerce brands across Victoria.
            Our discovery process means we understand your business before we
            write a line of code.
          </p>

          <p className="text-sm text-foreground/45 mb-8 max-w-md">
            No templates. No guesswork. A site that actually works for you.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-3 mb-8">
            <a
              href="/brief"
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-indigo-700 text-white rounded-full font-semibold text-sm hover:bg-indigo-600 hover:shadow-lg hover:shadow-primary/40 transition-all"
            >
              Tell us about your project
              <ArrowRight size={16} />
            </a>
            <a
              href="/work"
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 border border-border text-foreground rounded-full font-semibold text-sm hover:bg-card transition-all"
            >
              See our work
            </a>
          </div>

          {/* Trust signals */}
          <div className="mb-10">
            <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-xs text-foreground/70">
              {['No lock-in contracts', 'Fixed-price quotes', 'Real people, real builds'].map((t) => (
                <span key={t} className="flex items-center gap-1.5">
                  <span className="w-1 h-1 rounded-full bg-primary/50 inline-block" />
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* Client logos */}
          <div className="w-full">
            <p className="text-xs text-foreground/35 mb-4 uppercase tracking-widest">
              Recent projects
            </p>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-4">
              {clients.map((client) => (
                <a
                  key={client.name}
                  href={client.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={client.name}
                  className="opacity-40 hover:opacity-80 transition-opacity grayscale hover:grayscale-0 flex-shrink-0"
                  style={{ position: 'relative', width: '80px', height: '48px', display: 'inline-block' }}
                >
                  <Image
                    src={client.logo}
                    alt={client.name}
                    fill
                    sizes="80px"
                    priority
                    className="object-contain"
                  />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* ── Right: responsive device showcase ── */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.3, ease: 'easeOut' }}
          className="relative hidden lg:flex flex-col items-center gap-6"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          {/* Device composition */}
          <div className="relative w-full" style={{ height: '380px' }}>

            {/* ── Tablet — left, behind ── */}
            <div
              className="absolute"
              style={{
                left: '2%',
                top: '28px',
                zIndex: 2,
                transform: 'perspective(700px) rotateY(14deg)',
                transformOrigin: 'left center',
              }}
            >
              <TabletFrame entry={current} priority={false} />
            </div>

            {/* ── Laptop — centre, front ── */}
            <div
              className="absolute"
              style={{
                left: '50%',
                top: 0,
                transform: 'translateX(-50%)',
                zIndex: 4,
              }}
            >
              <LaptopFrame entry={current} priority />
            </div>

            {/* ── Phone — right, behind ── */}
            <div
              className="absolute"
              style={{
                right: '2%',
                top: '48px',
                zIndex: 2,
                transform: 'perspective(700px) rotateY(-14deg)',
                transformOrigin: 'right center',
              }}
            >
              <PhoneFrame entry={current} priority={false} />
            </div>

          </div>

          {/* Site name label */}
          <AnimatePresence mode="wait">
            <motion.a
              key={current.name}
              href={current.url}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.25 }}
              className="text-sm font-medium text-foreground/60 hover:text-foreground transition-colors"
            >
              {current.name} ↗
            </motion.a>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center gap-4">
            <button
              onClick={prev}
              aria-label="Previous site"
              className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-foreground/50 hover:text-foreground hover:border-primary/50 transition-all"
            >
              <ChevronLeft size={15} />
            </button>

            <div className="flex items-center gap-1.5">
              {showcase.map((_, i) => (
                <button
                  key={i}
                  onClick={() => go(i)}
                  aria-label={`Go to ${showcase[i].name}`}
                  className={`rounded-full transition-all ${
                    i === index
                      ? 'w-4 h-1.5 bg-primary'
                      : 'w-1.5 h-1.5 bg-foreground/20 hover:bg-foreground/40'
                  }`}
                />
              ))}
            </div>

            <button
              onClick={next}
              aria-label="Next site"
              className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-foreground/50 hover:text-foreground hover:border-primary/50 transition-all"
            >
              <ChevronRight size={15} />
            </button>
          </div>

          {/* Responsive badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            className="absolute -top-8 -right-4 bg-primary/10 border border-primary/20 rounded-2xl px-3 py-2 shadow-xl pointer-events-none"
            style={{ zIndex: 10 }}
          >
            <p className="text-xs text-primary/70 mb-0.5">Desktop · Tablet · Mobile</p>
            <p className="text-sm font-semibold text-primary">Every device, pixel-perfect</p>
          </motion.div>

        </motion.div>
      </div>
    </section>
  )
}

/* ─── Device frame components ─── */

function DeviceImage({
  src, alt, priority, sizes,
}: {
  src: string; alt: string; priority: boolean; sizes: string
}) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={src}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="absolute inset-0"
      >
        <Image
          src={src}
          alt={alt}
          fill
          priority={priority}
          sizes={sizes}
          className="object-cover object-top"
        />
      </motion.div>
    </AnimatePresence>
  )
}

function LaptopFrame({ entry, priority }: { entry: ShowcaseEntry; priority: boolean }) {
  return (
    <div style={{ width: '320px' }}>
      {/* Screen bezel */}
      <div
        className="rounded-t-xl border border-white/15 bg-[#1a1a2e] shadow-2xl shadow-black/60"
        style={{ padding: '8px 8px 0' }}
      >
        {/* Camera dot */}
        <div className="flex justify-center mb-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
        </div>
        {/* Screen area */}
        <div className="relative rounded overflow-hidden bg-slate-900" style={{ aspectRatio: '16/10', width: '100%' }}>
          <DeviceImage src={entry.desktop} alt={entry.name} priority={priority} sizes="304px" />
        </div>
      </div>
      {/* Base / keyboard */}
      <div
        className="rounded-b-2xl border-x border-b border-white/10 bg-[#111122]"
        style={{ height: '18px', position: 'relative' }}
      >
        {/* Trackpad */}
        <div
          className="absolute left-1/2 top-2 -translate-x-1/2 rounded border border-white/10 bg-white/5"
          style={{ width: '60px', height: '10px' }}
        />
      </div>
      {/* Stand */}
      <div className="flex justify-center">
        <div className="bg-[#0e0e1c] border-x border-b border-white/8 rounded-b-xl" style={{ width: '80px', height: '4px' }} />
      </div>
    </div>
  )
}

function TabletFrame({ entry, priority }: { entry: ShowcaseEntry; priority: boolean }) {
  const src = entry.tablet ?? entry.mobile ?? entry.desktop
  return (
    <div
      className="rounded-2xl border border-white/15 bg-[#1a1a2e] shadow-xl shadow-black/50"
      style={{ width: '120px', padding: '8px 6px' }}
    >
      {/* Camera */}
      <div className="flex justify-center mb-1.5">
        <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
      </div>
      {/* Screen */}
      <div className="relative rounded overflow-hidden bg-slate-900" style={{ aspectRatio: '3/4', width: '100%' }}>
        <DeviceImage src={src} alt={entry.name} priority={priority} sizes="108px" />
      </div>
      {/* Home indicator */}
      <div className="flex justify-center mt-1.5">
        <div className="w-8 h-1 rounded-full bg-white/20" />
      </div>
    </div>
  )
}

function PhoneFrame({ entry, priority }: { entry: ShowcaseEntry; priority: boolean }) {
  const src = entry.mobile ?? entry.desktop
  return (
    <div
      className="rounded-3xl border border-white/15 bg-[#1a1a2e] shadow-xl shadow-black/50"
      style={{ width: '75px', padding: '8px 5px' }}
    >
      {/* Notch */}
      <div className="flex justify-center mb-1.5">
        <div className="w-10 h-2 rounded-full bg-[#0e0e1c] border border-white/10 flex items-center justify-center gap-1">
          <div className="w-1 h-1 rounded-full bg-white/20" />
        </div>
      </div>
      {/* Screen */}
      <div className="relative rounded-xl overflow-hidden bg-slate-900" style={{ aspectRatio: '9/19', width: '100%' }}>
        <DeviceImage src={src} alt={entry.name} priority={priority} sizes="65px" />
      </div>
      {/* Home indicator */}
      <div className="flex justify-center mt-2">
        <div className="w-6 h-1 rounded-full bg-white/20" />
      </div>
    </div>
  )
}