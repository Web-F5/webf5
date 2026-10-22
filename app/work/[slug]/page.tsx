import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, ArrowRight, Check, MapPin, Quote } from 'lucide-react'
import { projects } from '@/lib/portfolio'

export async function generateStaticParams() {
  return projects
    .filter(p => p.caseStudy)
    .map(p => ({ slug: p.id }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const project = projects.find(p => p.id === slug)
  if (!project?.caseStudy) return {}
  return {
    title: `${project.name} Case Study — Web F5`,
    description: project.caseStudy.tagline,
  }
}

export default async function CaseStudyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const project = projects.find(p => p.id === slug)

  if (!project || !project.caseStudy) notFound()

  const { caseStudy: cs } = project

  return (
    <main className="min-h-screen bg-background text-foreground">

      {/* Back nav */}
      <div className="max-w-4xl mx-auto px-4 pt-8 pb-0">
        <Link
          href="/work"
          className="inline-flex items-center gap-2 text-sm text-foreground/50 hover:text-foreground transition-colors"
        >
          <ArrowLeft size={14} />
          All work
        </Link>
      </div>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-4 pt-10 pb-14">
        <div className="flex items-center gap-3 mb-5">
          <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400 border border-indigo-500/30 rounded-full px-3 py-1">
            {project.industry}
          </span>
          <span className="flex items-center gap-1.5 text-xs text-foreground/40">
            <MapPin size={11} />
            {project.location}
          </span>
        </div>

        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight text-balance mb-5">
          {cs.headline}
        </h1>
        <p className="text-lg text-foreground/60 leading-relaxed max-w-2xl">
          {cs.tagline}
        </p>

        {/* Project image */}
        <div className="mt-10 rounded-2xl overflow-hidden border border-white/8 shadow-2xl">
          <Image
            src={project.image}
            alt={`${project.name} website`}
            width={1200}
            height={675}
            className="w-full object-cover"
            priority
          />
        </div>
      </section>

      {/* Results strip */}
      <section className="border-y border-white/8 bg-white/[0.02]">
        <div className="max-w-4xl mx-auto px-4 py-10">
          <div className="grid sm:grid-cols-3 gap-6">
            {cs.results.map((r) => (
              <div key={r.metric} className="text-center sm:text-left">
                <p className="text-2xl md:text-3xl font-bold text-white mb-1">{r.metric}</p>
                <p className="text-sm text-foreground/50 leading-snug">{r.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Body */}
      <section className="max-w-4xl mx-auto px-4 py-16 grid md:grid-cols-[1fr_280px] gap-12 items-start">

        {/* Main content */}
        <div className="space-y-12">

          {/* The challenge */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-indigo-400 mb-4">The challenge</p>
            <p className="text-foreground/75 leading-relaxed text-base">{cs.problem}</p>
          </div>

          {/* What we built */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-indigo-400 mb-4">What we built</p>
            <p className="text-foreground/75 leading-relaxed text-base">{cs.solution}</p>
          </div>

          {/* Client quote */}
          {cs.quote && (
            <blockquote className="relative border-l-2 border-indigo-500/40 pl-6 py-1">
              <Quote size={20} className="text-indigo-400/40 mb-3" />
              <p className="text-lg italic text-foreground/85 leading-relaxed mb-4">
                &ldquo;{cs.quote}&rdquo;
              </p>
              <footer>
                <p className="text-sm font-semibold text-white">{cs.quoteAuthor}</p>
                <p className="text-xs text-foreground/40">{cs.quoteRole}</p>
              </footer>
            </blockquote>
          )}

        </div>

        {/* Sidebar */}
        <aside className="space-y-6">

          {/* Logo / name */}
          <div className="rounded-xl border border-white/8 bg-white/[0.02] p-5">
            {project.logo ? (
              <Image
                src={project.logo}
                alt={`${project.name} logo`}
                width={160}
                height={60}
                className="h-12 w-auto object-contain mb-3"
              />
            ) : (
              <p className="font-semibold text-white mb-3">{project.name}</p>
            )}
            <p className="text-xs text-foreground/40">{project.industry}</p>
            <p className="text-xs text-foreground/40">{project.location}</p>
          </div>

          {/* Services */}
          <div className="rounded-xl border border-white/8 bg-white/[0.02] p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-foreground/40 mb-4">Services</p>
            <ul className="space-y-2">
              {cs.services.map(s => (
                <li key={s} className="flex items-start gap-2.5 text-sm text-foreground/70">
                  <Check size={13} className="text-indigo-400 mt-0.5 flex-shrink-0" />
                  {s}
                </li>
              ))}
            </ul>
          </div>

          {/* Tech stack */}
          <div className="rounded-xl border border-white/8 bg-white/[0.02] p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-foreground/40 mb-4">Built with</p>
            <div className="flex flex-wrap gap-2">
              {project.features.map(f => (
                <span key={f} className="text-xs bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 rounded-full px-3 py-1">
                  {f}
                </span>
              ))}
            </div>
          </div>

          {/* Visit site */}
          {project.url && (
            <a
              href={project.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl px-5 py-3 transition-colors"
            >
              Visit live site
              <ArrowRight size={14} />
            </a>
          )}
        </aside>
      </section>

      {/* CTA */}
      <section className="border-t border-white/5 py-20 px-4 text-center">
        <p className="text-sm font-medium text-indigo-400 mb-3">Ready to grow?</p>
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 text-balance">
          Let&apos;s build something like this for you
        </h2>
        <p className="text-foreground/50 mb-8 max-w-md mx-auto text-balance">
          Get a free website audit and see exactly where you stand — no obligation.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/#audit"
            className="inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-7 py-3 rounded-xl transition-colors text-sm"
          >
            Get your free audit
            <ArrowRight size={14} />
          </Link>
          <Link
            href="/work"
            className="inline-flex items-center justify-center gap-2 border border-white/15 hover:border-white/30 text-foreground/70 hover:text-foreground font-semibold px-7 py-3 rounded-xl transition-colors text-sm"
          >
            See all work
          </Link>
        </div>
      </section>

    </main>
  )
}
