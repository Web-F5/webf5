import { Navigation } from '@/components/sections/navigation'
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
