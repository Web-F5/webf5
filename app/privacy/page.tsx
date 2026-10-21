import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'How Web F5 collects, uses, and protects your personal information.',
}

const UPDATED = '21 October 2025'

export default function PrivacyPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-16 text-slate-300">
      <div className="mb-10">
        <Link href="/" className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors">← webf5.com.au</Link>
      </div>

      <h1 className="text-3xl font-bold text-white mb-2">Privacy Policy</h1>
      <p className="text-sm text-slate-500 mb-10">Last updated: {UPDATED}</p>

      <div className="space-y-8 text-sm leading-relaxed">

        <section>
          <h2 className="text-base font-semibold text-white mb-3">Who we are</h2>
          <p>
            Web F5 is a web design and development business based in Central Victoria, Australia, operated by Josh Ekberg.
            We build websites for trades, local businesses, and ecommerce brands.
          </p>
          <p className="mt-2">
            Contact: <a href="mailto:contact@webf5.au" className="text-indigo-400 hover:text-indigo-300">contact@webf5.au</a> · <a href="tel:+61419510206" className="text-indigo-400 hover:text-indigo-300">0419 510 206</a>
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-white mb-3">What information we collect</h2>
          <p>We collect personal information only when you voluntarily provide it to us. This may include:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Your name and email address when you request a website audit, checklist, or make an enquiry</li>
            <li>Your business name and website URL when using our free audit tool</li>
            <li>Technical information about your website (publicly accessible data) when you request an audit report</li>
          </ul>
          <p className="mt-2">
            We do not collect payment details, government identifiers, or sensitive personal information.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-white mb-3">How we use your information</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>To deliver the service you requested (e.g. sending you an audit report or checklist)</li>
            <li>To follow up about your website or our services, where relevant</li>
            <li>To improve our tools and services</li>
          </ul>
          <p className="mt-2">We do not sell, rent, or share your personal information with third parties for marketing purposes.</p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-white mb-3">Email communications</h2>
          <p>
            If you receive an email from Web F5, it is because you or your business requested information from us, or we identified your business as a potential fit for our services.
          </p>
          <p className="mt-2">
            You can unsubscribe from our emails at any time by replying with &ldquo;Unsubscribe&rdquo; or emailing{' '}
            <a href="mailto:contact@webf5.au?subject=Unsubscribe" className="text-indigo-400 hover:text-indigo-300">contact@webf5.au</a>.
            We will honour all unsubscribe requests within 5 business days.
          </p>
          <p className="mt-2">
            Our emails comply with the <em>Spam Act 2003</em> (Cth).
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-white mb-3">Third-party services</h2>
          <p>We use the following third-party services to operate our website and tools:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li><strong className="text-slate-200">Vercel</strong> — website hosting (USA). <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noreferrer" className="text-indigo-400 hover:text-indigo-300">Privacy policy ↗</a></li>
            <li><strong className="text-slate-200">Resend</strong> — email delivery (USA). <a href="https://resend.com/legal/privacy-policy" target="_blank" rel="noreferrer" className="text-indigo-400 hover:text-indigo-300">Privacy policy ↗</a></li>
            <li><strong className="text-slate-200">Google PageSpeed / Places API</strong> — used to analyse websites and find businesses. <a href="https://policies.google.com/privacy" target="_blank" rel="noreferrer" className="text-indigo-400 hover:text-indigo-300">Privacy policy ↗</a></li>
            <li><strong className="text-slate-200">Neon (PostgreSQL)</strong> — secure database hosting (USA). <a href="https://neon.tech/privacy-policy" target="_blank" rel="noreferrer" className="text-indigo-400 hover:text-indigo-300">Privacy policy ↗</a></li>
          </ul>
          <p className="mt-2">These providers may process data outside Australia. We only use providers with appropriate data protection practices.</p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-white mb-3">Cookies and analytics</h2>
          <p>
            Our website uses Google Tag Manager and Meta Pixel for analytics and advertising purposes. These tools may set cookies on your device.
            You can disable cookies in your browser settings at any time.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-white mb-3">Data retention</h2>
          <p>
            We retain audit and lead data to improve our services and for our own business records.
            You may request deletion of your data at any time by contacting us at{' '}
            <a href="mailto:contact@webf5.au" className="text-indigo-400 hover:text-indigo-300">contact@webf5.au</a>.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-white mb-3">Your rights</h2>
          <p>Under the <em>Privacy Act 1988</em> (Cth) and the Australian Privacy Principles, you have the right to:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Access the personal information we hold about you</li>
            <li>Request correction of inaccurate information</li>
            <li>Request deletion of your information</li>
            <li>Opt out of direct marketing communications</li>
          </ul>
          <p className="mt-2">
            To exercise any of these rights, contact us at{' '}
            <a href="mailto:contact@webf5.au" className="text-indigo-400 hover:text-indigo-300">contact@webf5.au</a>.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-white mb-3">Changes to this policy</h2>
          <p>
            We may update this policy from time to time. The date at the top of this page shows when it was last revised.
            Continued use of our services after changes are posted constitutes acceptance of the updated policy.
          </p>
        </section>

      </div>
    </main>
  )
}
