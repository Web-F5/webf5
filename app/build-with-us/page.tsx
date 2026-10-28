import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Build With Us - Done With You Website Service | Web F5',
  description:
    'Build your trade website together with Web F5. Three live sessions, step-by-step Loom walkthroughs, and a live site at the end. $697 fixed price.',
}

const sessions = [
  {
    num: '01',
    title: 'Brief and strategy',
    duration: '60 min',
    body: 'We run through your business together - your services, suburbs, customers, and goals. By the end of this session you have a complete brief, a site structure, and a clear plan for what we are building and why. You leave with your Claude prompt ready to go.',
  },
  {
    num: '02',
    title: 'Build with Claude',
    duration: '90 min',
    body: 'We sit on a screen-share while you build. You paste your brief into Claude, generate your site code, and push it to GitHub with our guidance. We handle anything that gets confusing. By the end of this session your site is live on a Vercel URL.',
  },
  {
    num: '03',
    title: 'Domain, email, and Google',
    duration: '60 min',
    body: 'We connect your domain, set up email routing through Cloudflare, and get your Google Business Profile and Search Console configured. The technical steps that trip most people up - done together, so you understand what you have set up and why.',
  },
  {
    num: '04',
    title: 'Review and go-live',
    duration: '45 min',
    body: 'We review the finished site together on mobile and desktop, work through the go-live checklist, and talk through how to make updates and keep your Google Business Profile active. You leave with a live site and the confidence to maintain it yourself.',
  },
]

const videos = [
  'Brief and strategy walkthrough - watch before Session 1',
  'How to use Claude to build your site - watch before Session 2',
  'Domain and DNS setup explained - watch before Session 3',
  'After launch - making updates, Google Posts, and getting reviews',
]

const included = [
  'Four live sessions via Zoom (total approx. 4.5 hours)',
  'Four Loom walkthrough videos to keep - watch before each session',
  'Complete website live on your own domain by the end',
  'Google Business Profile set up and verified',
  'Email routing configured - enquiries go straight to your inbox',
  'Google Search Console and Analytics connected',
  'Go-live checklist reviewed together',
  'Two weeks of email support after your final session',
]

const forWho = [
  'You want a real website, not a template - but you want to understand how it works',
  'You have tried DIY before and got stuck on the technical parts',
  'You want someone alongside you, not just a guide to follow alone',
  'You are happy to put in the hours but need structure and support to get there',
  'Your budget doesn\'t stretch to a fully done-for-you build right now',
]

const notForWho = [
  'You want everything handled without any involvement from you - see our Done For You service',
  'You have zero time to commit to four sessions over two to three weeks',
]

export default function BuildWithUsPage() {
  return (
    <main className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="mb-12">
          <p className="text-primary text-sm font-medium tracking-widest uppercase mb-3">Done With You · $697</p>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-5 leading-tight text-balance">
            Build Your Website With Us
          </h1>
          <p className="text-foreground/60 text-lg leading-relaxed">
            Not quite DIY and not quite done for you. We build your website together across four live sessions, with Loom walkthroughs to prepare you for each one. You end up with a live site, a real understanding of how it works, and the skills to keep it going yourself.
          </p>
        </div>

        {/* Who it's for */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-5">Who this is for</h2>
          <ul className="flex flex-col gap-3 mb-6">
            {forWho.map((item) => (
              <li key={item} className="flex gap-3 items-start">
                <span className="text-primary mt-0.5 flex-shrink-0">✓</span>
                <span className="text-foreground/80 text-sm leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
          <div className="border border-border/50 rounded-xl p-4 bg-card/20">
            <p className="text-xs font-semibold uppercase tracking-widest text-foreground/40 mb-3">Not the right fit if</p>
            <ul className="flex flex-col gap-2">
              {notForWho.map((item) => (
                <li key={item} className="flex gap-3 items-start">
                  <span className="text-foreground/30 mt-0.5 flex-shrink-0 text-xs">✗</span>
                  <span className="text-foreground/50 text-sm leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* How it works - sessions */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-2">How it works</h2>
          <p className="text-foreground/50 text-sm mb-8">Four sessions over two to three weeks. Each one has a Loom video to watch beforehand so you arrive prepared.</p>

          <div className="flex flex-col">
            {sessions.map((s, i) => (
              <div key={s.num} className="grid grid-cols-[36px_1fr] gap-4 pb-8">
                <div className="flex flex-col items-center">
                  <div className="w-9 h-9 rounded-full bg-primary/10 text-primary text-sm font-bold flex items-center justify-center flex-shrink-0">{s.num}</div>
                  {i < sessions.length - 1 && <div className="w-px flex-1 bg-border mt-2" />}
                </div>
                <div className="pt-1.5">
                  <div className="flex items-center gap-3 mb-1.5">
                    <p className="font-semibold">{s.title}</p>
                    <span className="text-xs text-foreground/40 border border-border/50 rounded-full px-2 py-0.5">{s.duration}</span>
                  </div>
                  <p className="text-sm text-foreground/60 leading-relaxed">{s.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Loom videos */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-2">Loom walkthroughs included</h2>
          <p className="text-foreground/50 text-sm mb-5">Four pre-session videos you keep. Watch each one before the corresponding session so we can skip the basics and spend the time on your specific build.</p>
          <ul className="flex flex-col gap-3">
            {videos.map((v) => (
              <li key={v} className="flex gap-3 items-start">
                <span className="text-primary mt-0.5 flex-shrink-0">▶</span>
                <span className="text-foreground/70 text-sm leading-relaxed">{v}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Everything included */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-5">Everything included</h2>
          <ul className="flex flex-col gap-3">
            {included.map((item) => (
              <li key={item} className="flex gap-3 items-start">
                <span className="text-primary mt-0.5 flex-shrink-0">✓</span>
                <span className="text-foreground/80 text-sm leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Compare options */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-5">Compare your options</h2>
          <div className="rounded-xl overflow-hidden border border-border text-sm">
            {[
              ['', 'DIY Guide', 'Build With Us', 'Done For You'],
              ['Price', '$27', '$697', 'From $1,800'],
              ['Live support', '✗', '✓', '✓'],
              ['You build it', '✓', 'Together', '✗'],
              ['Loom videos', '✗', '✓', '✗'],
              ['Time commitment', '4-6 hrs solo', '4.5 hrs guided', 'Minimal'],
              ['Suits', 'Confident DIYers', 'Want guidance', 'Want it done'],
            ].map((row, i) => (
              <div key={row[0]} className={`grid grid-cols-4 ${i === 0 ? 'bg-card/80 font-semibold text-foreground/50 text-xs uppercase tracking-wide' : 'border-t border-border/50'}`}>
                <div className={`px-3 py-3 ${i > 0 ? 'text-foreground/50' : ''}`}>{row[0]}</div>
                <div className={`px-3 py-3 ${i > 0 ? 'text-foreground/70' : ''}`}>{row[1]}</div>
                <div className={`px-3 py-3 font-semibold ${i > 0 ? 'text-primary' : ''}`}>{row[2]}</div>
                <div className={`px-3 py-3 ${i > 0 ? 'text-foreground/70' : ''}`}>{row[3]}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Pricing card */}
        <div className="border border-border rounded-2xl p-6 bg-card/30 mb-6">
          <div className="flex flex-col gap-0.5 mb-1">
            <div className="flex items-end gap-2">
              <span className="text-4xl font-bold">$697</span>
              <span className="text-foreground/40 mb-1">AUD · fixed price</span>
            </div>
          </div>
          <p className="text-foreground/50 text-sm mb-6 mt-2">Four sessions. Four Loom videos. One live website. No subscription.</p>

          <Link
            href="/brief"
            className="block w-full bg-primary text-white font-semibold py-3.5 rounded-xl hover:bg-primary/90 transition-colors text-base text-center"
          >
            Get started - tell us about your business →
          </Link>

          <p className="text-foreground/40 text-xs text-center mt-3">
            Fill in the brief and we will be in touch within one business day to book your first session.
          </p>
        </div>

        <p className="text-center text-foreground/30 text-xs">
          Based in Central Victoria. Sessions via Zoom. Refund available before Session 2 if it is not the right fit.
        </p>

      </div>
    </main>
  )
}
