import { Navigation } from '@/components/sections/navigation'
import { DiscoveryWizard } from '@/components/wizard'
import { HeroSection } from '@/components/sections/hero'
import { ProblemsSection } from '@/components/sections/problems'
import { ProcessSection } from '@/components/sections/process'
import { TrustSection } from '@/components/sections/trust'
import { TestimonialsSection } from '@/components/sections/testimonials'
import { PricingSection } from '@/components/sections/pricing'
import { FAQSection } from '@/components/sections/faq'
import { FinalCTASection } from '@/components/sections/final-cta'
import { Footer } from '@/components/sections/footer'

export default function Home() {
  return (
    <main className="min-h-screen" style={{ backgroundColor: '#0A0F1E' }}>
      <Navigation />
      <HeroSection />
      <section id="brief" className="py-24 px-4 bg-[#0A0F1E]">
        <div className="mx-auto max-w-4xl text-center mb-12">
          <p className="text-xs font-medium uppercase tracking-widest text-indigo-400 mb-3">
            Start your free brief
          </p>
          <h2 className="text-4xl font-semibold text-white mb-4">
            Tell us about your business
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto">
            This 15-minute process is the most important investment you'll make
            in your website. Every answer shapes the final result.
          </p>
        </div>
        <DiscoveryWizard />
      </section>
      <ProblemsSection />
      <ProcessSection />
      <TrustSection />
      <TestimonialsSection />
      <PricingSection />
      <FAQSection />
      <FinalCTASection />
      <Footer />
    </main>
  )
}
