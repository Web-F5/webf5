import { Navigation } from '@/components/sections/navigation'
import { Footer } from '@/components/sections/footer'
import { DiscoveryWizard } from '@/components/wizard'
import { BriefAuthButton } from '@/components/BriefAuthButton'

export const metadata = {
  title: 'Start Your Brief — Web F5',
  description: 'Tell us about your project. Our discovery process asks the right questions upfront so we can give you a clear plan and a real fixed-price quote.',
}

export default function BriefPage() {
  return (
    <main className="min-h-screen" style={{ backgroundColor: '#0A0F1E' }}>
      <Navigation />
      <section id="brief" className="py-24 px-4 bg-[#0A0F1E]">
        <div className="mx-auto max-w-4xl text-center mb-12">
          <p className="text-xs font-medium uppercase tracking-widest text-indigo-400 mb-3">
            How it starts
          </p>
          <h1 className="text-4xl font-semibold text-white mb-4">
            Skip the back-and-forth. Tell us what you need.
          </h1>
          <p className="text-slate-400 max-w-xl mx-auto mb-6">
            Most agencies start with a phone call, then a long email chain, then a proposal you didn't quite ask for. Our discovery process asks the right questions upfront — so we can come back to you with a clear plan and a real fixed-price quote. No fluff, no vague timelines. Takes about 20 minutes.
          </p>
          <div className="flex justify-center">
            <BriefAuthButton />
          </div>
        </div>
        <DiscoveryWizard />
      </section>
      <Footer />
    </main>
  )
}
