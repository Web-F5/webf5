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
                Web design &amp; development · Central Victoria and Greater Geelong
              </span>
            </div>
          </div>

          <h1 className="text-3xl md:text-4xl lg:text-5xl tracking-tight mb-5 text-balance leading-[1.1]" style={{ fontFamily: 'var(--font-syne)', fontWeight: 700 }}>
            A website built around{' '}
            <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              your business.
            </span>
          </h1>

          <p className="text-base md:text-lg text-foreground/80 mb-3 max-w-lg leading-relaxed">
            We build websites
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
          {/* Brand name above devices */}
          <p className="text-7xl tracking-tight text-white leading-none" style={{ fontFamily: 'var(--font-syne)', fontWeight: 700, textShadow: '0 2px 24px rgba(99,102,241,0.45), 0 6px 16px rgba(0,0,0,0.9)' }}>
            Web F5
          </p>

          {/* Device composition */}
          <div className="relative w-full" style={{ height: '280px' }}>

            {/* ── Tablet — left, behind ── */}
            <div
              className="absolute"
              style={{
                left: '0%',
                top: '28px',
                zIndex: 2,
                transform: 'perspective(700px) rotateY(18deg)',
                transformOrigin: 'left center',
                willChange: 'transform',
                backfaceVisibility: 'hidden',
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
                right: '3%',
                top: '24px',
                zIndex: 2,
                transform: 'perspective(700px) rotateY(-10deg)',
                transformOrigin: 'right center',
                willChange: 'transform',
                backfaceVisibility: 'hidden',
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
            className="absolute -right-4 bg-primary/10 border border-primary/20 rounded-2xl px-3 py-2 shadow-md pointer-events-none"
            style={{ zIndex: 10, top: '350px', right: '-35px' }}
          >
            <p className="text-xs text-primary/70 mb-0.5">Desktop · Tablet · Mobile</p>
            <p className="text-sm font-semibold text-primary">Every device, pixel-perfect</p>
            <p className="text-xs text-accent/80 mt-0.5">check them out on your devices!</p>
          </motion.div>

        </motion.div>
      </div>
    </section>
  )
}

/* ─── Device frame components ─── */

/** Rounded-rect SVG path — used for evenodd body+screen-cutout */
function rrect(x: number, y: number, w: number, h: number, r: number) {
  const ri = Math.min(r, w / 2, h / 2)
  return `M${x+ri},${y} H${x+w-ri} Q${x+w},${y} ${x+w},${y+ri} V${y+h-ri} Q${x+w},${y+h} ${x+w-ri},${y+h} H${x+ri} Q${x},${y+h} ${x},${y+h-ri} V${y+ri} Q${x},${y} ${x+ri},${y} Z`
}

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
          unoptimized
          className="object-cover object-top"
        />
      </motion.div>
    </AnimatePresence>
  )
}

function LaptopFrame({ entry, priority }: { entry: ShowcaseEntry; priority: boolean }) {
  const W = 320, LH = 200
  const sx = 14, sy = 10, sw = 292, sh = 176

  return (
    <div style={{ width: W, flexShrink: 0 }}>
      {/* Lid */}
      <div style={{ position: 'relative', width: W, height: LH }}>
        {/* Screenshot sits behind the SVG frame */}
        <div style={{ position: 'absolute', left: sx, top: sy, width: sw, height: sh, borderRadius: 3, overflow: 'hidden', background: '#0a0a14' }}>
          <DeviceImage src={entry.desktop} alt={entry.name} priority={priority} sizes={`${sw}px`} />
        </div>
        {/* SVG frame overlay */}
        <svg viewBox={`0 0 ${W} ${LH}`} fill="none" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
          {/* Body with screen cutout (evenodd = hole) */}
          <path fillRule="evenodd" fill="#12121f" d={`${rrect(0,0,W,LH,8)} ${rrect(sx,sy,sw,sh,3)}`} />
          {/* Outer border */}
          <rect x="0.5" y="0.5" width={W-1} height={LH-1} rx="7.5" stroke="rgba(255,255,255,0.18)" strokeWidth="1" />
          {/* Screen inner glow */}
          <rect x={sx} y={sy} width={sw} height={sh} rx="3" stroke="rgba(255,255,255,0.07)" strokeWidth="1" />
          {/* Camera */}
          <circle cx={W/2} cy="5.5" r="2.5" fill="#08080f" stroke="rgba(255,255,255,0.12)" strokeWidth="0.5" />
          <circle cx={W/2} cy="5.5" r="1" fill="#0d0d1a" />
          {/* Active indicator */}
          <circle cx={W/2+6} cy="5.5" r="1" fill="rgba(34,197,94,0.55)" />
          {/* Bottom hinge line */}
          <line x1="0" y1={LH-0.5} x2={W} y2={LH-0.5} stroke="rgba(255,255,255,0.07)" strokeWidth="1" />
        </svg>
      </div>
      {/* Keyboard base */}
      <div style={{
        width: W, height: 20,
        background: 'linear-gradient(to bottom, #1c1c30, #12121f)',
        borderLeft: '1px solid rgba(255,255,255,0.12)',
        borderRight: '1px solid rgba(255,255,255,0.12)',
        borderBottom: '1px solid rgba(255,255,255,0.12)',
        borderBottomLeftRadius: 5, borderBottomRightRadius: 5,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{ width: 64, height: 10, background: 'rgba(255,255,255,0.04)', borderRadius: 3, border: '1px solid rgba(255,255,255,0.08)' }} />
      </div>
      {/* Stand foot */}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <div style={{ width: 84, height: 5, background: '#0e0e1c', borderLeft: '1px solid rgba(255,255,255,0.08)', borderRight: '1px solid rgba(255,255,255,0.08)', borderBottom: '1px solid rgba(255,255,255,0.08)', borderBottomLeftRadius: 6, borderBottomRightRadius: 6 }} />
      </div>
    </div>
  )
}

function TabletFrame({ entry, priority }: { entry: ShowcaseEntry; priority: boolean }) {
  const W = 140, H = 196
  const sx = 10, sy = 10, sw = 120, sh = 168

  return (
    <div style={{ position: 'relative', width: W, height: H, flexShrink: 0 }}>
      <div style={{ position: 'absolute', left: sx, top: sy, width: sw, height: sh, borderRadius: 3, overflow: 'hidden', background: '#0a0a14' }}>
        <DeviceImage src={entry.tablet ?? entry.mobile ?? entry.desktop} alt={entry.name} priority={priority} sizes="300px" />
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} fill="none" shapeRendering="geometricPrecision" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', filter: 'drop-shadow(0 0 1px rgba(0,0,0,0))' }}>
        <path fillRule="evenodd" fill="#12121f" d={`${rrect(0,0,W,H,12)} ${rrect(sx,sy,sw,sh,3)}`} />
        <rect x="0.5" y="0.5" width={W-1} height={H-1} rx="11.5" stroke="rgba(255,255,255,0.18)" strokeWidth="1" />
        <rect x={sx} y={sy} width={sw} height={sh} rx="3" stroke="rgba(255,255,255,0.07)" strokeWidth="1" />
        {/* Front camera */}
        <circle cx={W/2} cy="5" r="2.5" fill="#08080f" stroke="rgba(255,255,255,0.12)" strokeWidth="0.5" />
        <circle cx={W/2} cy="5" r="1" fill="#0d0d1a" />
        {/* Home indicator */}
        <rect x={W/2-16} y={H-8} width="32" height="3" rx="1.5" fill="rgba(255,255,255,0.22)" />
        {/* Side button */}
        <rect x={W-1} y="62" width="2" height="32" rx="1" fill="#1a1a2e" stroke="rgba(255,255,255,0.12)" strokeWidth="0.5" />
        {/* Volume */}
        <rect x="-1" y="62" width="2" height="21" rx="1" fill="#1a1a2e" stroke="rgba(255,255,255,0.12)" strokeWidth="0.5" />
        <rect x="-1" y="87" width="2" height="21" rx="1" fill="#1a1a2e" stroke="rgba(255,255,255,0.12)" strokeWidth="0.5" />
      </svg>
    </div>
  )
}

function PhoneFrame({ entry, priority }: { entry: ShowcaseEntry; priority: boolean }) {
  const W = 100, H = 212
  const sx = 7, sy = 17, sw = 86, sh = 168

  return (
    <div style={{ position: 'relative', width: W, height: H, flexShrink: 0 }}>
      <div style={{ position: 'absolute', left: sx, top: sy, width: sw, height: sh, borderRadius: 4, overflow: 'hidden', background: '#0a0a14' }}>
        <DeviceImage src={entry.mobile ?? entry.desktop} alt={entry.name} priority={priority} sizes="300px" />
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} fill="none" shapeRendering="geometricPrecision" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', filter: 'drop-shadow(0 0 1px rgba(0,0,0,0))' }}>
        <path fillRule="evenodd" fill="#12121f" d={`${rrect(0,0,W,H,12)} ${rrect(sx,sy,sw,sh,4)}`} />
        <rect x="0.5" y="0.5" width={W-1} height={H-1} rx="11.5" stroke="rgba(255,255,255,0.18)" strokeWidth="1" />
        <rect x={sx} y={sy} width={sw} height={sh} rx="4" stroke="rgba(255,255,255,0.07)" strokeWidth="1" />
        {/* Dynamic island */}
        <rect x="27" y="5" width="32" height="8" rx="4" fill="#08080f" />
        <circle cx="50" cy="9" r="2" fill="#0f0f1e" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" />
        {/* Home indicator */}
        <rect x={W/2-14} y={H-9} width="28" height="3" rx="1.5" fill="rgba(255,255,255,0.22)" />
        {/* Power button */}
        <rect x={W-1} y="56" width="2" height="24" rx="1" fill="#1a1a2e" stroke="rgba(255,255,255,0.12)" strokeWidth="0.5" />
        {/* Mute switch */}
        <rect x="-1" y="32" width="2" height="11" rx="1" fill="#1a1a2e" stroke="rgba(255,255,255,0.12)" strokeWidth="0.5" />
        {/* Volume up */}
        <rect x="-1" y="47" width="2" height="18" rx="1" fill="#1a1a2e" stroke="rgba(255,255,255,0.12)" strokeWidth="0.5" />
        {/* Volume down */}
        <rect x="-1" y="68" width="2" height="18" rx="1" fill="#1a1a2e" stroke="rgba(255,255,255,0.12)" strokeWidth="0.5" />
      </svg>
    </div>
  )
}