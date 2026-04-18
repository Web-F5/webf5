'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, ChevronLeft, ChevronRight } from 'lucide-react'

const testimonials = [
  {
    quote: 'Web F5 transformed our online presence. Thanks to their SEO, web design, and hosting expertise, we now rank on the first page for key trenching and excavation terms. The team was friendly, professional, and took the time to understand our business. We\'ve seen a notable increase in local enquiries since switching to Web F5. Highly recommend them for anyone needing digital services that actually deliver results.',
    author: 'CJ Ogston',
    role: 'Australian Trenching & Excavations',
    location: '',
  },
  {
    quote: 'Web F5 has been instrumental in elevating our digital footprint. Their expertise in web design, SEO, and hosting has given us a competitive edge in our local market. From crafting our professional website to optimising it for local searches, their team was meticulous and truly understood our industry. Thanks to their strategic SEO work, we now rank on the first page for key terms, driving more qualified leads. What impressed us most was their customised approach — they didn\'t just deliver a template but tailored every element to reflect our brand.',
    author: 'Ben Speechley',
    role: 'Speechless Electrical',
    location: 'Seymour, VIC',
  },
  {
    quote: 'Web F5 updated our website and pushed our site from ranking on the 7th page of Google to hitting number 1 in local and regular results — and even in the AI section for most of our key words. Couldn\'t be happier!',
    author: 'Ben Quaggin',
    role: '',
    location: '',
  },
  {
    quote: 'Web F5 helped us from start to finish. We started with a website from Web F5, they offered a competitive rate on hosting and organised a domain that we liked. After the site was done they worked with us to get our SEO sorted out, stepping in when it got too technical. Fantastic service, we highly recommend Web F5.',
    author: 'Rebecca Austin',
    role: '',
    location: '',
  },
  {
    quote: 'Web F5 designed and developed our website, organised a domain, email and hosting. Very happy with the results. Fantastic service, highly recommend!',
    author: 'Sophie Fair',
    role: 'FSM Recycling & Demolition',
    location: '',
  },
  {
    quote: 'Josh is a problem-solver par excellence. He never gives up when it comes to bringing customised solutions to the table. Whatever your expectations are, be sure that Josh will exceed them.',
    author: 'Steph',
    role: '',
    location: '',
  },
]

const AUTOPLAY_MS = 6000

export function TestimonialsSection() {
  const [current, setCurrent] = useState(0)
  const [direction, setDirection] = useState<1 | -1>(1)
  const [paused, setPaused] = useState(false)
  const total = testimonials.length

  const goTo = useCallback((index: number, dir: 1 | -1) => {
    setDirection(dir)
    setCurrent((index + total) % total)
  }, [total])

  const next = useCallback(() => goTo(current + 1, 1),  [current, goTo])
  const prev = useCallback(() => goTo(current - 1, -1), [current, goTo])

  useEffect(() => {
    if (paused) return
    const id = setInterval(next, AUTOPLAY_MS)
    return () => clearInterval(id)
  }, [paused, next])

  const variants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 80 : -80,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
      transition: { duration: 0.45, ease: 'easeOut' },
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -80 : 80,
      opacity: 0,
      transition: { duration: 0.3, ease: 'easeIn' },
    }),
  }

  const t = testimonials[current]
  const initials = t.author
    .split(' ')
    .map(n => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <section className="py-24 px-4 relative overflow-hidden">

      {/* Ambient glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 9, repeat: Infinity }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-primary/5 rounded-full blur-3xl"
        />
      </div>

      <div className="max-w-4xl mx-auto relative z-10">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="text-sm font-medium text-accent mb-3">Client reviews</p>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 text-balance">
            What our clients say
          </h2>
          <div className="inline-flex items-center gap-2 mt-2">
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={16} className="fill-accent text-accent" />
              ))}
            </div>
            <span className="text-sm text-foreground/60">
              5.0 · 7 reviews on Google
            </span>
          </div>
        </motion.div>

        {/* Carousel */}
        <div
          className="relative"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          {/* Card */}
          <div className="overflow-hidden rounded-xl border border-border bg-card/50 px-8 py-10 md:px-14 md:py-12 min-h-[280px] flex items-center">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={current}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                className="w-full flex flex-col gap-6"
              >
                {/* Stars */}
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={16} className="fill-accent text-accent" />
                  ))}
                </div>

                {/* Quote */}
                <p className="text-lg md:text-xl text-foreground/85 italic leading-relaxed">
                  &ldquo;{t.quote}&rdquo;
                </p>

                {/* Author */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/15 border border-primary/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-semibold text-primary">
                      {initials}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-foreground text-sm">{t.author}</p>
                    {(t.role || t.location) && (
                      <p className="text-xs text-foreground/50">
                        {[t.role, t.location].filter(Boolean).join(' · ')}
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Prev button */}
          <button
            onClick={prev}
            aria-label="Previous review"
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-5 w-10 h-10 rounded-full border border-border bg-card flex items-center justify-center text-foreground/60 hover:text-foreground hover:bg-card/80 transition-colors shadow-md"
          >
            <ChevronLeft size={18} />
          </button>

          {/* Next button */}
          <button
            onClick={next}
            aria-label="Next review"
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-5 w-10 h-10 rounded-full border border-border bg-card flex items-center justify-center text-foreground/60 hover:text-foreground hover:bg-card/80 transition-colors shadow-md"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        {/* Dot indicators */}
        <div className="flex justify-center gap-2 mt-8">
          {testimonials.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i, i > current ? 1 : -1)}
              aria-label={`Go to review ${i + 1}`}
            >
              <span
                className={`block rounded-full transition-all duration-300 ${
                  i === current
                    ? 'w-6 h-2 bg-primary'
                    : 'w-2 h-2 bg-foreground/20 hover:bg-foreground/40'
                }`}
              />
            </button>
          ))}
        </div>

        {/* Google link */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="text-center mt-8"
        >
          <a
            href="https://www.google.com/search?q=Web+F5&stick=H4sIAAAAAAAA_-NgU1I1qDBLTDFPM021MEpKMU5LNrO0MqgwtjRIszA0MDcztzQxTDJPXMTKFp6apOBmCgBAhwsgMgAAAA&hl=en&mat=CZHilsOvVomxElcBTVDHntzX4t3AT1uKBPedVW80xNrIduvnBXvZfKiOYdpRUw_kn2Q0sK6I28vJhHfhIVBaNs_4lnOsb8XE8mWHbC6pYb52EBOZIRv5HSCuW5glPlPNyHk&authuser=0"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-foreground/40 hover:text-foreground/70 transition-colors underline underline-offset-2"
          >
            View all reviews on Google
          </a>
        </motion.div>

      </div>
    </section>
  )
}