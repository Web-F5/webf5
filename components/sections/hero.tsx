'use client'

import { motion } from 'framer-motion'
import { ArrowRight, MapPin } from 'lucide-react'
import Image from 'next/image'

export function HeroSection() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
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

  const clients = [
    {
      name: 'Outright Electrical',
      logo: '/images/outrightelectrical-logo.png',
      url: 'https://outrightelectrical.com.au',
      logoClass: 'h-7',
    },
    {
      name: 'Valley Feeds & General',
      logo: '/images/vfg-logo.png',
      url: 'https://valleyfeeds.com.au',
      logoClass: 'h-8',
    },
    {
      name: 'Horse Hay',
      logo: '/images/horse-hay-logo.webp',
      url: 'https://horsehay.com.au',
      logoClass: 'h-10',
    },
    {
      name: 'LKF Contracting',
      logo: '/images/LKF-logo.webp',
      url: 'https://webf5.com.au/demos/LKF-Contracting/',
      logoClass: 'h-12',
    },
  ]

  const screenshots = [
    {
      src: '/images/Screenshot_Outright_Electrical.png',
      alt: 'Outright Electrical website',
      url: 'https://outrightelectrical.com.au',
      rotate: '-2deg',
      x: '-4%',
      delay: 0.4,
      // top-left card expands down-right
      originX: '0%',
      originY: '0%',
    },
    {
      src: '/images/Screenshot_Valley_Feeds.png',
      alt: 'Valley Feeds & General website',
      url: 'https://valleyfeeds.com.au',
      rotate: '1.5deg',
      x: '4%',
      delay: 0.55,
      // top-right card expands down-left
      originX: '100%',
      originY: '0%',
    },
    {
      src: '/images/Screenshot_Horse_Hay.png',
      alt: 'Horse Hay website',
      url: 'https://horsehay.com.au',
      rotate: '2deg',
      x: '-3%',
      delay: 0.7,
      // bottom-left card expands up-right
      originX: '0%',
      originY: '100%',
    },
    {
      src: '/images/Screenshot_LKF_Contracting.png',
      alt: 'LKF Contracting website',
      url: 'https://webf5.com.au/demos/LKF-Contracting/',
      rotate: '-1.5deg',
      x: '3%',
      delay: 0.85,
      // bottom-right card expands up-left
      originX: '100%',
      originY: '100%',
    },
  ]

  return (
    <section className="min-h-screen flex items-center justify-center pt-20 px-4 relative overflow-hidden">

      {/* Ambient glows */}
      <div className="absolute inset-0 overflow-hidden z-0 pointer-events-none">
        <motion.div
          animate={{ opacity: [0.15, 0.3, 0.15] }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute top-20 right-10 w-[500px] h-[500px] bg-primary/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ opacity: [0.08, 0.18, 0.08] }}
          transition={{ duration: 11, repeat: Infinity, delay: 1.5 }}
          className="absolute bottom-10 left-10 w-[400px] h-[400px] bg-accent/5 rounded-full blur-3xl"
        />
      </div>

      {/* Two-column layout */}
      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center relative z-10">

        {/* ── Left: copy ── */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col items-start"
        >
          {/* Location badge */}
          <motion.div variants={itemVariants} className="mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 border border-primary/20 rounded-full">
              <MapPin size={13} className="text-primary" />
              <span className="text-xs font-medium text-primary tracking-wide">
                Web design &amp; development · Central Victoria
              </span>
            </div>
          </motion.div>

          {/* Headline */}
          <motion.h1
            variants={itemVariants}
            className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-5 text-balance leading-[1.1]"
          >
            A website built around{' '}
            <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              your business.
            </span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            variants={itemVariants}
            className="text-base md:text-lg text-foreground/65 mb-3 max-w-lg leading-relaxed"
          >
            <span className="font-bold text-white">Web F5</span> builds websites
            for trades, local businesses, and ecommerce brands across Victoria.
            Our discovery process means we understand your business before we
            write a line of code.
          </motion.p>

          <motion.p
            variants={itemVariants}
            className="text-sm text-foreground/45 mb-8 max-w-md"
          >
            No templates. No guesswork. A site that actually works for you.
          </motion.p>

          {/* CTAs */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row gap-3 mb-8"
          >
            <a
              href="#brief"
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-primary text-primary-foreground rounded-full font-semibold text-sm hover:shadow-lg hover:shadow-primary/40 transition-all"
            >
              Tell us about your project
              <ArrowRight size={16} />
            </a>
            <a
              href="#work"
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 border border-border text-foreground rounded-full font-semibold text-sm hover:bg-card transition-all"
            >
              See our work
            </a>
          </motion.div>

          {/* Trust signals */}
          <motion.div variants={itemVariants} className="mb-10">
            <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-xs text-foreground/45">
              {['No lock-in contracts', 'Fixed-price quotes', 'Real people, real builds'].map((t) => (
                <span key={t} className="flex items-center gap-1.5">
                  <span className="w-1 h-1 rounded-full bg-primary/50 inline-block" />
                  {t}
                </span>
              ))}
            </div>
          </motion.div>

          {/* Client logos */}
          <motion.div variants={itemVariants} className="w-full">
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
                  className="opacity-40 hover:opacity-80 transition-opacity grayscale hover:grayscale-0"
                >
                  <Image
                    src={client.logo}
                    alt={client.name}
                    width={120}
                    height={48}
                    className={`${client.logoClass} w-auto object-contain`}
                  />
                </a>
              ))}
            </div>
          </motion.div>
        </motion.div>

        {/* ── Right: screenshot collage ── */}
        {/*
          Outer wrapper is relative + overflow-visible so scaled cards
          can expand outside the grid boundary without clipping.
          Each card is aspect-video (16:9) so screenshots display correctly.
        */}
        <div className="relative hidden lg:flex flex-col gap-4">

          {/* Row 1 */}
          <div className="grid grid-cols-2 gap-4">
            {screenshots.slice(0, 2).map((shot) => (
              <motion.a
                key={shot.src}
                href={shot.url}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 40 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  rotate: shot.rotate,
                  x: shot.x,
                }}
                whileHover={{
                  rotate: '0deg',
                  x: 0,
                  y: -6,
                  scale: 1.55,
                  zIndex: 35,
                }}
                transition={{
                  duration: 0.8,
                  delay: shot.delay,
                  ease: 'easeOut',
                  type: 'spring',
                  stiffness: 360,
                  damping: 28,
                }}
                className="relative rounded-xl overflow-hidden border border-white/10 shadow-2xl shadow-black/50 cursor-pointer block aspect-video"
                style={{
                  transformOrigin: `${shot.originX} ${shot.originY}`,
                  zIndex: 10,
                }}
              >
                <Image
                  src={shot.src}
                  alt={shot.alt}
                  fill
                  className="object-cover object-top"
                  sizes="320px"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent" />
                <motion.div
                  className="absolute inset-0 flex items-end justify-center pb-3"
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 1 }}
                  transition={{ duration: 0.15 }}
                >
                  <span className="text-xs font-semibold text-white bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-full">
                    Visit site ↗
                  </span>
                </motion.div>
              </motion.a>
            ))}
          </div>

          {/* Row 2 */}
          <div className="grid grid-cols-2 gap-4">
            {screenshots.slice(2, 4).map((shot) => (
              <motion.a
                key={shot.src}
                href={shot.url}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 40 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  rotate: shot.rotate,
                  x: shot.x,
                }}
                whileHover={{
                  rotate: '0deg',
                  x: 0,
                  y: -6,
                  scale: 1.55,
                  zIndex: 35,
                }}
                transition={{
                  duration: 0.8,
                  delay: shot.delay,
                  ease: 'easeOut',
                  type: 'spring',
                  stiffness: 360,
                  damping: 28,
                }}
                className="relative rounded-xl overflow-hidden border border-white/10 shadow-2xl shadow-black/50 cursor-pointer block aspect-video"
                style={{
                  transformOrigin: `${shot.originX} ${shot.originY}`,
                  zIndex: 10,
                }}
              >
                <Image
                  src={shot.src}
                  alt={shot.alt}
                  fill
                  className="object-cover object-top"
                  sizes="320px"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent" />
                <motion.div
                  className="absolute inset-0 flex items-end justify-center pb-3"
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 1 }}
                  transition={{ duration: 0.15 }}
                >
                  <span className="text-xs font-semibold text-white bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-full">
                    Visit site ↗
                  </span>
                </motion.div>
              </motion.a>
            ))}
          </div>

          {/*
            Centre logo — positioned over the gap between rows.
            Using absolute with top/left percentages accounting for the gap.
            The gap between rows is 16px (gap-4). Each row is aspect-video.
            We position at exactly the midpoint between rows.
            Tailwind -translate-x-1/2 -translate-y-1/2 handles the offset
            correctly without inline transform conflicts.
          */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.0, duration: 0.5, ease: 'easeOut' }}
            className="absolute left-1/2 -translate-x-1/2 pointer-events-none"
            style={{
              top: 'calc(50% - 40px)',  /* 50% minus half-gap (8px) minus ~10mm raise (38px) */
              transform: 'translate(-50%, -50%)',
              zIndex: 20,
            }}
          >
            <div className="w-20 h-20 rounded-full bg-primary/10 border border-primary/20 backdrop-blur-sm flex items-center justify-center shadow-xl">
              <Image
                src="/images/logo.webp"
                alt="Web F5"
                width={56}
                height={56}
                className="w-12 h-12 object-contain"
              />
            </div>
          </motion.div>

          {/* Bottom-left badge — z-20 so hovered card (z-35) slides over it, returns when focus lost */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.1, duration: 0.5, ease: 'easeOut' }}
            className="absolute -bottom-5 -left-5 bg-card border border-border rounded-2xl px-4 py-3 shadow-xl pointer-events-none"
            style={{ zIndex: 20 }}
          >
            <p className="text-xs text-foreground/50 mb-0.5">Built for</p>
            <p className="text-sm font-semibold text-foreground">
              Local businesses across Vic
            </p>
          </motion.div>

          {/* Top-right badge — z-40 always on top, lifted above top-right image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.25, duration: 0.5, ease: 'easeOut' }}
            className="absolute -right-5 bg-primary/10 border border-primary/20 rounded-2xl px-4 py-3 shadow-xl pointer-events-none"
            style={{ top: '-75px', zIndex: 40 }}
          >
            <p className="text-xs text-primary/70 mb-0.5">
              Ecommerce · Trades · Agriculture
            </p>
            <p className="text-sm font-semibold text-primary">
              Every industry, custom built
            </p>
          </motion.div>

        </div>
      </div>
    </section>
  )
}