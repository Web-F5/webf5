import type { Metadata } from 'next'
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
import { SchemaOrg } from '@/components/SchemaOrg'

export const metadata: Metadata = {
  title: 'Web Design & Development Central Victoria | Web F5',
  description:
    'Web F5 builds websites for trades, local businesses, and ecommerce brands across Central Victoria. Fixed-price quotes, no lock-in contracts. Start your brief today.',
}

export default function Home() {
  return (
    <main className="min-h-screen" style={{ backgroundColor: '#0A0F1E' }}>
      <SchemaOrg />
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
