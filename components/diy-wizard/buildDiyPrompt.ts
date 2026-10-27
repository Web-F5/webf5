import type { WizardData } from '../../types'

export function buildDiyPrompt(data: WizardData): string {
  const val = (v: string | undefined | null) => v?.trim() || '—'

  const socialLines = data.socialMedia.length
    ? data.socialMedia.map(s => {
        const url = data.socialMediaUrls?.[s]
        return url ? `  - ${s}: ${url}` : `  - ${s}`
      }).join('\n')
    : '  —'

  const reviewLines = data.testimonials.length
    ? data.testimonials.map((t, i) =>
        `  Review ${i + 1}: "${t.review}" — ${t.name || 'Customer'} (${t.stars}/5 stars)`
      ).join('\n')
    : '  No reviews added yet — add them before submitting to Claude.'

  const serviceLines = data.pageServices.filter(s => s.name).length
    ? data.pageServices.filter(s => s.name).map((s, i) =>
        `  ${i + 1}. ${s.name}${s.desc ? `: ${s.desc}` : ''}`
      ).join('\n')
    : '  —'

  const faqLines = data.faqItems.filter(f => f.question).length
    ? data.faqItems.filter(f => f.question).map((f, i) =>
        `  Q${i + 1}: ${f.question}\n  A${i + 1}: ${f.answer || '—'}`
      ).join('\n')
    : '  —'

  const pageLabels: Record<string, string> = {
    home: 'Home', about: 'About Us', services: 'Services',
    gallery: 'Portfolio/Gallery', faq: 'FAQ', testimonials: 'Testimonials',
    contact: 'Contact', careers: 'Careers',
  }
  const pagesList = data.pages.map(p => pageLabels[p] || p).join(', ') || '—'

  return `You are building a complete website for a local Australian trade or service business.

Here is the discovery brief:

BUSINESS DETAILS
Business name:       ${val(data.bizName)}
ABN:                 ${val(data.bizReg)}
Contact name:        ${val(data.contactName)}
Phone:               ${val(data.bizPhone)}
Email:               ${val(data.bizEmail)}
Tagline:             ${val(data.bizTagline)}
Year established:    ${val(data.bizYear)}
Description:         ${val(data.bizDesc)}
What makes us different: ${val(data.bizUsp)}
Qualifications:      ${val(data.bizQualifications)}
Memberships:         ${val(data.bizMemberships)}
Guarantees:          ${val(data.bizGuarantees)}
Business hours:      Mon–Fri ${val(data.bizHoursMF)} | Sat ${val(data.bizHoursSat)} | Sun ${val(data.bizHoursSun)}

LOCATION & SERVICE AREA
Address:             ${val(data.bizAddress)}
Service reach:       ${val(data.serviceReach)}
Service area:        ${val(data.serviceRadiusTowns || data.localArea)}
Client visits:       ${val(data.visitType)}

DIGITAL PRESENCE
Google Business Profile: ${val(data.googleBusiness)}
Social media:
${socialLines}

DESIGN PREFERENCES
Style:               ${val(data.designStyle)}
Primary colour:      ${val(data.brandPrimary)}
Light background:    ${val(data.brandLightBg)}
Dark background:     ${val(data.brandDarkBg)}
Button colour:       ${val(data.brandBtnPrimary)}
Accent colour:       ${val(data.brandAccent)}
Dark text:           ${val(data.brandDarkText)}
Display font:        ${val(data.displayFont)}
Body font:           ${val(data.bodyFont)}
Sites I love:        ${val(data.sitesLove)}

PAGES REQUIRED
${pagesList}

SERVICES
${serviceLines}

CUSTOMER REVIEWS (include on the homepage and testimonials page)
${reviewLines}

FAQ
${faqLines}

${data.aboutDesc ? `ABOUT US\n${data.aboutDesc}\n\n` : ''}---

Build a complete Next.js 14 site with TypeScript and Tailwind CSS with the following pages:

Homepage sections (in this order):
- Header: logo/business name, phone number as a tap-to-call link, and a simple nav
- Hero: benefit-led headline using the business name, primary service, and main suburb from the brief. One short subheading. One CTA button saying "Call for a Free Quote" linking to the phone number.
- Services: the services listed above, each written as an outcome the customer gets (not a technical description)
- Trust/About: years in business, any licences or credentials from the brief, and the customer reviews listed above
- Contact: a form with fields for Name, Phone, Suburb, and Message. Set the form action to: [PASTE YOUR FORMSPREE URL HERE]
- Footer: business name, phone, email, suburbs served, and copyright

Additional pages as selected above (e.g. /about, /services, /gallery, /faq, /testimonials, /contact, /careers)

Requirements:
- Mobile-first design, clean and professional, suited to a trades business
- Use the exact colour palette and fonts specified in the brief
- Every page title and meta description includes the primary service and suburb
- Business name, phone number, and suburb consistent in the footer of every page
- LocalBusiness schema markup in the site layout
- No heavy animations. Fast loading is the priority
- Images: use placeholder components I can replace with real photos later (attach any photos to this chat and I will incorporate them)

Return the complete file and folder structure with all files needed to deploy to Vercel. Start with the folder structure overview, then give me each file in full.`
}
