import type { Metadata } from 'next'
import { Navigation } from '@/components/sections/navigation'
import { Footer } from '@/components/sections/footer'

export const metadata: Metadata = {
  title: 'Privacy Policy — Web F5',
  description: 'Privacy Policy for Web F5. Learn how we collect, use, and protect your personal information.',
}

export default function PrivacyPage() {
  return (
    <>
      <Navigation />
      <main className="min-h-screen pt-32 pb-24 px-4" style={{ backgroundColor: '#0A0F1E', color: '#FFFFFF' }}>
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold mb-2">Privacy Policy</h1>
          <p className="text-slate-400 text-sm mb-12">Last updated: 25 June 2026</p>

          <div className="flex flex-col gap-10 text-slate-300 leading-relaxed">

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">1. Who we are</h2>
              <p>Web F5 is a web design and development business based in Victoria, Australia. We build websites for small businesses and tradies across Australia. You can contact us at <a href="mailto:contact@webf5.au" className="text-indigo-400 hover:text-indigo-300">contact@webf5.au</a>.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">2. Information we collect</h2>
              <p className="mb-3">We collect information you provide directly to us when you:</p>
              <ul className="list-disc list-inside space-y-1 text-slate-400">
                <li>Complete our website discovery brief (name, business name, email, phone, and project details)</li>
                <li>Contact us by email or phone</li>
                <li>Upload files as part of your project brief</li>
              </ul>
              <p className="mt-3">We also collect anonymous usage data through Google Analytics 4 (page views, session duration, device type) to understand how visitors use our site.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">3. How we use your information</h2>
              <ul className="list-disc list-inside space-y-1 text-slate-400">
                <li>To respond to your enquiry and prepare a quote</li>
                <li>To deliver the web design services you have engaged us for</li>
                <li>To send you project-related communications</li>
                <li>To improve our website and services using anonymised analytics data</li>
                <li>To comply with legal obligations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">4. How we store your information</h2>
              <p>Files you upload through our discovery brief are stored securely via Vercel Blob storage. Your brief details are transmitted to us by email via Resend. We do not store your personal information in a database beyond what is necessary to deliver your project.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">5. Sharing your information</h2>
              <p>We do not sell, trade, or rent your personal information to third parties. We may share information with trusted service providers (such as hosting and email services) solely to operate our business. All third-party providers are bound by confidentiality obligations.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">6. Cookies and tracking</h2>
              <p>Our website uses Google Tag Manager and Google Analytics 4 to collect anonymous usage statistics. These tools use cookies. You can opt out of Google Analytics tracking by installing the <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:text-indigo-300">Google Analytics Opt-out Browser Add-on</a>.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">7. Your rights</h2>
              <p>Under the Australian Privacy Act 1988, you have the right to access, correct, or request deletion of your personal information. To make a request, email us at <a href="mailto:contact@webf5.au" className="text-indigo-400 hover:text-indigo-300">contact@webf5.au</a> and we will respond within 30 days.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">8. Changes to this policy</h2>
              <p>We may update this Privacy Policy from time to time. Changes will be posted on this page with an updated date. Continued use of our website after changes constitutes acceptance of the updated policy.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">9. Contact us</h2>
              <p>If you have any questions about this Privacy Policy, please contact us at <a href="mailto:contact@webf5.au" className="text-indigo-400 hover:text-indigo-300">contact@webf5.au</a>.</p>
            </section>

          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
