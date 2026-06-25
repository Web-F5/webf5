'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import { ArrowRight, MapPin } from 'lucide-react'
import { projects } from '@/lib/portfolio'
import { Navigation } from '@/components/sections/navigation'
import { Footer } from '@/components/sections/footer'

export default function WorkPage() {
  return (
    <main className="min-h-screen" style={{ backgroundColor: '#0A0F1E' }}>
      <Navigation />

      {/* Page header */}
      <section className="pt-32 pb-16 px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-xs font-medium uppercase tracking-widest text-indigo-400 mb-4">
            Our work
          </p>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-5 text-white">
            Sites built for{' '}
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
              real businesses
            </span>
          </h1>
          <p className="text-base md:text-lg text-white/60 max-w-2xl mx-auto">
            Every project below started with a conversation about what the business actually needed.
            No templates, no guesswork; just sites built to perform.
          </p>
        </motion.div>
      </section>

      {/* Project cards */}
      <section className="pb-24 px-4">
        <div className="max-w-6xl mx-auto space-y-16">
          {projects.map((project, index) => {
            const imageLeft = index % 2 === 0
            return (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                whileHover={{ y: -4 }}
                className="group flex flex-col lg:flex-row gap-8 bg-white/[0.03] border border-white/10 rounded-2xl overflow-hidden hover:border-indigo-500/30 hover:bg-white/[0.05] transition-colors duration-300"
              >
                {/* Image */}
                <a
                  href={project.url || undefined}
                  target={project.url ? '_blank' : undefined}
                  rel="noopener noreferrer"
                  className={`relative w-full lg:w-[45%] shrink-0 aspect-video lg:aspect-auto lg:min-h-[280px] block overflow-hidden ${!project.url ? 'pointer-events-none' : 'cursor-pointer'} ${imageLeft ? 'lg:order-first' : 'lg:order-last'}`}
                >
                  <Image
                    src={project.image}
                    alt={`${project.name} website screenshot`}
                    fill
                    className="object-cover object-top transition-transform duration-500 group-hover:scale-[1.03]"
                    sizes="(max-width: 1024px) 100vw, 45vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
                  {project.url && (
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <span className="text-sm font-semibold text-white bg-black/60 backdrop-blur-sm px-4 py-2 rounded-full">
                        Visit site ↗
                      </span>
                    </div>
                  )}
                </a>

                {/* Details */}
                <div className="flex flex-col justify-center p-8 lg:py-10">
                  {/* Badge */}
                  <div className="flex items-center gap-2 mb-4">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-xs font-medium text-indigo-400">
                      {project.industry}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs text-white/40">
                      <MapPin size={11} />
                      {project.location}
                    </span>
                  </div>

                  {/* Name */}
                  <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
                    {project.name}
                  </h2>

                  {/* Description */}
                  <p className="text-white/60 text-sm leading-relaxed mb-6">
                    {project.description}
                  </p>

                  {/* Feature tags */}
                  <div className="flex flex-wrap gap-2 mb-8">
                    {project.features.map((f) => (
                      <span
                        key={f}
                        className="px-2.5 py-1 bg-white/5 border border-white/10 rounded-full text-xs text-white/70"
                      >
                        {f}
                      </span>
                    ))}
                  </div>

                  {/* CTA */}
                  {project.url && (
                    <a
                      href={project.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-400 border border-indigo-500/30 rounded-full px-5 py-2.5 w-fit hover:bg-indigo-500/10 transition-colors"
                    >
                      Visit site
                      <ArrowRight size={14} />
                    </a>
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-20 px-4 text-center border-t border-white/5">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to be next?
          </h2>
          <p className="text-white/55 mb-8 max-w-md mx-auto">
            Tell us about your business and we&apos;ll come back with a clear plan and a real quote.
          </p>
          <a
            href="/#brief"
            className="inline-flex items-center gap-2 px-8 py-4 bg-indigo-500 text-white rounded-full font-semibold text-sm hover:shadow-lg hover:shadow-indigo-500/40 transition-all"
          >
            Start your brief
            <ArrowRight size={16} />
          </a>
        </motion.div>
      </section>

      <Footer />
    </main>
  )
}
