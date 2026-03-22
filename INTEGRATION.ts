// ─────────────────────────────────────────────────────────────────────────────
// app/page.tsx  (or wherever your #brief section lives in V0-generated code)
// ─────────────────────────────────────────────────────────────────────────────
//
// Replace the placeholder <section id="brief"> in your V0-generated page with:
//
//   import { DiscoveryWizard } from '@/components/wizard'
//
//   <section id="brief" className="py-24 px-4 bg-[#0A0F1E]">
//     <div className="mx-auto max-w-4xl text-center mb-12">
//       <p className="text-xs font-medium uppercase tracking-widest text-indigo-400 mb-3">
//         Start your free brief
//       </p>
//       <h2 className="text-4xl font-semibold text-white mb-4">
//         Tell us about your business
//       </h2>
//       <p className="text-slate-400 max-w-xl mx-auto">
//         This 15-minute process is the most important investment you'll make
//         in your website. Every answer shapes the final result.
//       </p>
//     </div>
//     <DiscoveryWizard />
//   </section>
//
// ─────────────────────────────────────────────────────────────────────────────


// ─────────────────────────────────────────────────────────────────────────────
// app/api/brief/route.ts  — API route to handle form submission
// ─────────────────────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server'
import type { WizardData } from '@/components/wizard'

export async function POST(req: NextRequest) {
  try {
    const data: WizardData = await req.json()

    // ── 1. Validate required fields ─────────────────────────────────────────
    if (!data.bizName || !data.bizEmail) {
      return NextResponse.json(
        { error: 'Business name and email are required.' },
        { status: 400 }
      )
    }

    // ── 2. Send notification email ───────────────────────────────────────────
    // Example using Resend (npm install resend):
    //
    // import { Resend } from 'resend'
    // const resend = new Resend(process.env.RESEND_API_KEY)
    // await resend.emails.send({
    //   from: 'briefs@webcraft.com.au',
    //   to: 'hello@webcraft.com.au',
    //   subject: `New brief — ${data.bizName}`,
    //   html: buildEmailHtml(data),
    // })

    // ── 3. Save to CRM / database ────────────────────────────────────────────
    // Example using Prisma:
    //
    // await prisma.brief.create({ data: { ...data, logoFiles: undefined, photoFiles: undefined } })

    // ── 4. Send client confirmation email ────────────────────────────────────
    // await resend.emails.send({
    //   from: 'hello@webcraft.com.au',
    //   to: data.bizEmail,
    //   subject: 'We've received your brief!',
    //   html: confirmationEmailHtml(data),
    // })

    // ── 5. Trigger webhook / Zapier / Make ───────────────────────────────────
    // await fetch(process.env.WEBHOOK_URL!, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ source: 'website-brief', data }),
    // })

    console.log('Brief received:', {
      bizName: data.bizName,
      bizEmail: data.bizEmail,
      budget: data.budget,
      addOns: data.addOns,
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Brief submission error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


// ─────────────────────────────────────────────────────────────────────────────
// Helper: build a plain-text summary of the brief (for emails / CRM notes)
// ─────────────────────────────────────────────────────────────────────────────

export function buildBriefSummary(data: WizardData): string {
  const lines: string[] = [
    `=== WEBSITE BRIEF — ${data.bizName} ===`,
    '',
    `Project type:    ${data.startType}`,
    `Domain:          ${data.domainName || data.domainIdeas || data.domainStatus}`,
    '',
    `Business:        ${data.bizName}`,
    `Tagline:         ${data.bizTagline}`,
    `Description:     ${data.bizDesc}`,
    `USP:             ${data.bizUsp}`,
    `Audience:        ${data.bizAudience}`,
    '',
    `Service reach:   ${data.serviceReach}`,
    `Service area:    ${data.localArea}`,
    '',
    `Email:           ${data.bizEmail}`,
    `Phone:           ${data.bizPhone}`,
    `Google Business: ${data.googleBusiness}`,
    `Social media:    ${data.socialMedia.join(', ')}`,
    '',
    `Design style:    ${data.designStyle}`,
    `Brand colours:   ${data.brandColours}`,
    '',
    `Pages:           ${data.pages.join(', ')}`,
    `Content author:  ${data.contentAuthor}`,
    `E-commerce:      ${data.hasEcommerce ? 'Yes' : 'No'}`,
    `Bookings:        ${data.hasBookings ? 'Yes' : 'No'}`,
    `Features:        ${data.features.join(', ')}`,
    `Integrations:    ${data.integrations}`,
    '',
    `Add-ons:         ${data.addOns.join(', ')}`,
    '',
    `Budget:          ${data.budget}`,
    `Launch date:     ${data.launchDate}`,
    `Approach:        ${data.buildApproach}`,
    `Notes:           ${data.extraNotes}`,
  ]

  return lines.join('\n')
}
