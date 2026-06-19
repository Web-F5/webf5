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
    //   from: 'briefs@webf5.com.au',
    //   to: 'hello@webf5.com.au',
    //   subject: `New brief — ${data.bizName}`,
    //   html: buildEmailHtml(data),
    // })

    // ── 3. Save to CRM / database ────────────────────────────────────────────
    // Example using Prisma:
    //
    // await prisma.brief.create({ data: { ...data, logoFiles: undefined, photoFiles: undefined } })

    // ── 4. Send client confirmation email ────────────────────────────────────
    // await resend.emails.send({
    //   from: 'hello@webf5.com.au',
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
  const val = (v: string | undefined | null) => v?.trim() || '—'
  const yesNo = (v: boolean) => v ? 'Yes' : 'No'
  const list = (arr: string[] | undefined) => arr?.length ? arr.join(', ') : '—'

  const lines: string[] = [
    `=== WEBSITE BRIEF — ${data.bizName} ===`,
    '',

    // ── Step 1 & 2: Project & Domain ─────────────────────────────────────────
    `── Project ──────────────────────────────────────────────`,
    `Project type:         ${val(data.startType)}`,
    ...(data.startType !== 'fresh' ? [
      `Existing URL:         ${val(data.existingUrl)}`,
      `What they like:       ${val(data.siteLike)}`,
      `What they dislike:    ${val(data.siteDislike)}`,
    ] : []),
    '',
    `── Domain ───────────────────────────────────────────────`,
    `Domain status:        ${val(data.domainStatus)}`,
    ...(data.domainStatus === 'have' ? [
      `Domain name:          ${val(data.domainName)}`,
      `Registrar:            ${val(data.domainRegistrar)}`,
    ] : [
      `Domain ideas:         ${val(data.domainIdeas)}`,
      `Preferred extension:  ${val(data.domainExtension)}`,
    ]),
    '',

    // ── Step 3: Business info ─────────────────────────────────────────────────
    `── Business info ────────────────────────────────────────`,
    `Contact name:         ${val(data.contactName)}`,
    `Business name:        ${val(data.bizName)}`,
    `Email:                ${val(data.bizEmail)}`,
    `Phone:                ${val(data.bizPhone)}`,
    `Business registration:${val(data.bizReg)}`,
    `Year established:     ${val(data.bizYear)}`,
    `Tagline:              ${val(data.bizTagline)}`,
    `Description:          ${val(data.bizDesc)}`,
    `USP:                  ${val(data.bizUsp)}`,
    `Target audience:      ${val(data.bizAudience)}`,
    `Qualifications:       ${val(data.bizQualifications)}`,
    `Memberships:          ${val(data.bizMemberships)}`,
    `Guarantees:           ${val(data.bizGuarantees)}`,
    `Hours Mon–Fri:        ${val(data.bizHoursMF)}`,
    `Hours Saturday:       ${val(data.bizHoursSat)}`,
    `Hours Sunday:         ${val(data.bizHoursSun)}`,
    '',

    // ── Step 4: Location ──────────────────────────────────────────────────────
    `── Location & service area ──────────────────────────────`,
    `Service reach:        ${val(data.serviceReach)}`,
    `Business address:     ${val(data.bizAddress)}`,
    ...(data.serviceReach === 'local' ? [
      `Service radius:       ${data.serviceRadiusKm ? `${data.serviceRadiusKm} km` : '—'}`,
      `Service area towns:`,
      ...(data.serviceRadiusTowns?.trim()
        ? data.serviceRadiusTowns.trim().split(',').map(t => `  • ${t.trim()}`)
        : ['  —']),
    ] : [
      `Local area:           ${val(data.localArea)}`,
    ]),
    `Client visits:        ${val(data.visitType)}`,
    `Online/remote:        ${val(data.onlineServices)}`,
    '',

    // ── Step 5: Digital presence ──────────────────────────────────────────────
    `── Digital presence ─────────────────────────────────────`,
    `Google Business:      ${val(data.googleBusiness)}`,
    `Social media:         ${list(data.socialMedia)}`,
    `Email list / CRM:     ${val(data.crm)}`,
    `Ad accounts:          ${val(data.adAccounts)}`,
    '',

    // ── Step 6: Branding ──────────────────────────────────────────────────────
    `── Branding & design ────────────────────────────────────`,
    `Design style:         ${val(data.designStyle)}`,
    `Brand primary:        ${val(data.brandPrimary)}`,
    `Light background:     ${val(data.brandLightBg)}`,
    `Dark background:      ${val(data.brandDarkBg)}`,
    `Button primary:       ${val(data.brandBtnPrimary)}`,
    `Button hover:         ${val(data.brandBtnHover)}`,
    `Accent:               ${val(data.brandAccent)}`,
    `Accent hover:         ${val(data.brandAccentHover)}`,
    `Dark text:            ${val(data.brandDarkText)}`,
    `Display font:         ${val(data.displayFont)}`,
    `Body font:            ${val(data.bodyFont)}`,
    `Sites they love:      ${val(data.sitesLove)}`,
    `Sites they dislike:   ${val(data.sitesDislike)}`,
    '',

    // ── Step 7: Pages & content ───────────────────────────────────────────────
    `── Pages & content ──────────────────────────────────────`,
    `Pages selected:       ${list(data.pages)}`,
    '',

    // Home
    ...(data.pages.includes('home') ? [
      `  [ Home ]`,
      `  Landscape hero images: ${data.heroLandscapeUrls?.length || 0} uploaded`,
      `  Portrait hero images:  ${data.heroPortraitUrls?.length || 0} uploaded`,
      '',
    ] : []),

    // About
    ...(data.pages.includes('about') ? [
      `  [ About us ]`,
      `  Description:  ${val(data.aboutDesc)}`,
      `  Image:        ${data.aboutImageUrl ? data.aboutImageUrl : '—'}`,
      '',
    ] : []),

    // Services
    ...(data.pages.includes('services') && data.pageServices?.length ? [
      `  [ Services ]`,
      ...data.pageServices.map((s, i) =>
        `  ${i + 1}. ${s.name || '(unnamed)'} — ${s.desc || '(no description)'}${s.imageUrl ? ' [image]' : ''}`
      ),
      '',
    ] : []),

    // Portfolio / gallery
    ...(data.pages.includes('portfolio') && data.pageGallery?.length ? [
      `  [ Portfolio / gallery ]`,
      ...data.pageGallery.map((g, i) =>
        `  ${i + 1}. ${g.name || '(unnamed)'} — ${g.desc || ''}${g.imageUrl ? ' [image]' : ''}`
      ),
      '',
    ] : []),

    // Team
    ...(data.pages.includes('team') && data.pageTeam?.length ? [
      `  [ Team ]`,
      ...data.pageTeam.map((m, i) =>
        `  ${i + 1}. ${m.name} (${m.role})${m.info ? ' — ' + m.info : ''}${m.imageUrl ? ' [photo]' : ''}`
      ),
      '',
    ] : []),

    // Blog
    ...(data.pages.includes('blog') && data.blogTopics?.length ? [
      `  [ Blog topics ]`,
      ...data.blogTopics.filter(Boolean).map(t => `  • ${t}`),
      '',
    ] : []),

    // FAQ
    ...(data.pages.includes('faq') && data.faqItems?.length ? [
      `  [ FAQ ]`,
      ...data.faqItems.map((f, i) => `  ${i + 1}. Q: ${f.question}\n     A: ${f.answer}`),
      '',
    ] : []),

    // Testimonials
    ...(data.pages.includes('testimonials') && data.testimonials?.length ? [
      `  [ Testimonials ]`,
      ...data.testimonials.map((t, i) => `  ${i + 1}. ${t.name} (${t.stars}★) — "${t.review}"`),
      '',
    ] : []),

    // Contact
    ...(data.pages.includes('contact') ? [
      `  [ Contact form ]`,
      `  Intro message: ${val(data.contactFormIntro)}`,
      ...(data.contactFormFields?.length
        ? data.contactFormFields.map(f => `  Extra field: ${f.name} (${f.desc})`)
        : []),
      '',
    ] : []),

    // Careers
    ...(data.pages.includes('careers') ? [
      `  [ Careers ]`,
      `  Heading:     ${val(data.careersTitle)}`,
      `  Description: ${val(data.careersDesc)}`,
      '',
    ] : []),

    `Content author:       ${val(data.contentAuthor)}`,
    `Existing copy:        ${val(data.existingCopy)}`,
    `Multilingual:         ${val(data.multilingual)}`,
    ...(data.multilingual === 'Yes' ? [`Languages:            ${val(data.languages)}`] : []),
    '',

    // ── Step 8: Features ──────────────────────────────────────────────────────
    `── Features & functionality ─────────────────────────────`,
    `E-commerce:           ${yesNo(data.hasEcommerce)}`,
    ...(data.hasEcommerce ? [
      `  Product type:       ${val(data.productType)}`,
      `  Product count:      ${val(data.productCount)}`,
      `  Payment gateways:   ${val(data.paymentGateways)}`,
      `  Inventory mgmt:     ${val(data.inventoryMgmt)}`,
    ] : []),
    `Bookings:             ${yesNo(data.hasBookings)}`,
    ...(data.hasBookings ? [
      `  Booking payment:    ${val(data.bookingPayment)}`,
      `  Staff count:        ${val(data.staffCount)}`,
    ] : []),
    `Features:             ${list(data.features)}`,
    `Integrations:         ${val(data.integrations)}`,
    '',

    // ── Step 9: Add-ons ───────────────────────────────────────────────────────
    `── Add-ons ───────────────────────────────────────────────`,
    `Selected:             ${list(data.addOns)}`,
    '',

    // ── Step 10: Timeline & budget ────────────────────────────────────────────
    `── Timeline & budget ────────────────────────────────────`,
    `Budget:               ${val(data.budget)}`,
    `Has deadline:         ${val(data.hasDeadline)}`,
    ...(data.hasDeadline === 'Yes' ? [
      `Launch date:          ${val(data.launchDate)}`,
      `Deadline reason:      ${val(data.deadlineReason)}`,
    ] : []),
    `Build approach:       ${val(data.buildApproach)}`,
    `Internal resources:   ${val(data.internalResources)}`,
    ...(data.internalResources === 'Yes' ? [
      `  Contact name:       ${val(data.internalContactName)}`,
      `  Contact email:      ${val(data.internalContactEmail)}`,
      `  Contact phone:      ${val(data.internalContactPhone)}`,
    ] : []),
    `Extra notes:          ${val(data.extraNotes)}`,
  ]

  return lines.join('\n')
}

function buildFileLinks(data: WizardData): string {
  const sections: string[] = []

  if (data.logoUrls?.length) {
    sections.push('Logo:', ...data.logoUrls.map(u => `  ${u}`))
  }
  if (data.heroLandscapeUrls?.length) {
    sections.push('Hero landscape:', ...data.heroLandscapeUrls.map(u => `  ${u}`))
  }
  if (data.heroPortraitUrls?.length) {
    sections.push('Hero portrait:', ...data.heroPortraitUrls.map(u => `  ${u}`))
  }
  if (data.aboutImageUrl) {
    sections.push('About image:', `  ${data.aboutImageUrl}`)
  }
  if (data.pageServices?.some(s => s.imageUrl)) {
    sections.push('Service images:')
    data.pageServices.filter(s => s.imageUrl).forEach(s => sections.push(`  [${s.name}] ${s.imageUrl}`))
  }
  if (data.pageGallery?.some(g => g.imageUrl)) {
    sections.push('Gallery images:')
    data.pageGallery.filter(g => g.imageUrl).forEach(g => sections.push(`  [${g.name}] ${g.imageUrl}`))
  }
  if (data.pageTeam?.some(m => m.imageUrl)) {
    sections.push('Team photos:')
    data.pageTeam.filter(m => m.imageUrl).forEach(m => sections.push(`  [${m.name}] ${m.imageUrl}`))
  }
  if (data.existingCopyUrls?.length) {
    sections.push('Existing copy files:', ...data.existingCopyUrls.map(u => `  ${u}`))
  }
  if (data.photoUrls?.length) {
    sections.push('Other photos:', ...data.photoUrls.map(u => `  ${u}`))
  }

  return sections.length ? sections.join('\n') : 'No files uploaded'
}

export { buildFileLinks }
