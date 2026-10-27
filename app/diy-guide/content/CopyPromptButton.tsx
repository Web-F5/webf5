'use client'

import { useState } from 'react'

const PROMPT = `You are building a complete website for a local Australian trade or service business.

Here is the discovery brief:

[PASTE YOUR FULL WEB F5 BRIEF HERE (everything from the wizard, including the customer reviews you added)]

Build a complete Next.js 14 site with TypeScript and Tailwind CSS with the following pages:

Homepage sections (in this order):
- Header: logo/business name, phone number as a tap-to-call link, and a simple nav
- Hero: benefit-led headline using the business name, primary service, and main suburb from the brief. One short subheading. One CTA button saying "Call for a Free Quote" linking to the phone number.
- Services: 3–6 services from the brief, each written as an outcome the customer gets (not a technical description)
- Trust/About: years in business, any licences or credentials from the brief, and the customer reviews I've included
- Contact: a form with fields for Name, Phone, Suburb, and Message. Set the form action to: [PASTE YOUR FORMSPREE URL HERE]
- Footer: business name, phone, email, suburbs served, and copyright

Additional pages:
- /contact: a dedicated contact page with the same form and a Google Maps embed for the main service area
- One service page per service listed in the brief (e.g. /services/hot-water-repairs)

Requirements:
- Mobile-first design, clean and professional, suited to a trades business
- Every page title and meta description includes the primary service and suburb
- Business name, phone number, and suburb consistent in the footer of every page
- LocalBusiness schema markup in the site layout
- No heavy animations. Fast loading is the priority
- Images: use placeholder components I can replace with real photos later

Return the complete file and folder structure with all files needed to deploy to Vercel. Start with the folder structure overview, then give me each file in full.`

export default function CopyPromptButton() {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(PROMPT)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard not available
    }
  }

  return (
    <div className="bg-[#090B14] rounded-xl overflow-hidden my-4">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/8">
        <span className="text-xs text-white/40">Web F5 Prompt Template: copy and fill in the two sections</span>
        <button
          onClick={handleCopy}
          className="text-xs bg-white/10 text-white/60 hover:bg-white/20 px-3 py-1 rounded transition-colors"
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <pre className="text-xs text-slate-300 p-4 overflow-x-auto whitespace-pre-wrap leading-relaxed font-mono">{PROMPT}</pre>
    </div>
  )
}
