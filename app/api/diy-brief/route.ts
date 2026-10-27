import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import type { WizardData } from '@/types'
import { buildDiyPrompt } from '@/components/diy-wizard/DiyWizardSteps'

const resend = new Resend(process.env.RESEND_API_KEY)

const FROM_ADDRESS = 'contact@webf5.au'
const NOTIFY_TO = process.env.NOTIFY_EMAIL!

function buildDiyBriefMd(data: WizardData): string {
  const val = (v: string | undefined | null) => v?.trim() || '—'
  const list = (arr: string[] | undefined) => arr?.length ? arr.join(', ') : '—'

  const socialLines = data.socialMedia.length
    ? data.socialMedia.map(s => {
        const url = data.socialMediaUrls?.[s]
        return url ? `  - ${s}: ${url}` : `  - ${s}`
      }).join('\n')
    : '  —'

  return `# DIY Website Brief

## Contact
- **Name:** ${val(data.contactName)}
- **Email:** ${val(data.bizEmail)}
- **Phone:** ${val(data.bizPhone)}

## Business
- **Business name:** ${val(data.bizName)}
- **ABN:** ${val(data.bizReg)}
- **Tagline:** ${val(data.bizTagline)}
- **Year established:** ${val(data.bizYear)}
- **Description:** ${val(data.bizDesc)}
- **USP:** ${val(data.bizUsp)}
- **Qualifications:** ${val(data.bizQualifications)}
- **Memberships:** ${val(data.bizMemberships)}
- **Guarantees:** ${val(data.bizGuarantees)}
- **Hours:** Mon–Fri ${val(data.bizHoursMF)} | Sat ${val(data.bizHoursSat)} | Sun ${val(data.bizHoursSun)}

## Starting point
- **Type:** ${val(data.startType)}
${data.startType === 'rebuild' ? `- **Existing URL:** ${val(data.existingUrl)}\n- **Likes:** ${val(data.siteLike)}\n- **Change:** ${val(data.siteDislike)}` : ''}

## Domain
- **Status:** ${val(data.domainStatus)}
- **Domain:** ${val(data.domainName)}
- **Registrar:** ${val(data.domainRegistrar)}

## Location
- **Address:** ${val(data.bizAddress)}
- **Service reach:** ${val(data.serviceReach)}
- **Service area:** ${val(data.serviceRadiusTowns || data.localArea)}
- **Client visits:** ${val(data.visitType)}

## Digital presence
- **Google Business Profile:** ${val(data.googleBusiness)}
- **Social media:**
${socialLines}

## Design
- **Style:** ${val(data.designStyle)}
- **Primary:** ${val(data.brandPrimary)}
- **Light bg:** ${val(data.brandLightBg)}
- **Dark bg:** ${val(data.brandDarkBg)}
- **Button:** ${val(data.brandBtnPrimary)}
- **Accent:** ${val(data.brandAccent)}
- **Dark text:** ${val(data.brandDarkText)}
- **Display font:** ${val(data.displayFont)}
- **Body font:** ${val(data.bodyFont)}
- **Sites love:** ${val(data.sitesLove)}

## Pages
${list(data.pages)}

## Services
${data.pageServices.filter(s => s.name).map((s, i) => `${i + 1}. **${s.name}**: ${s.desc || '—'}`).join('\n') || '—'}

## Testimonials
${data.testimonials.map((t, i) => `${i + 1}. "${t.review}" — ${t.name} (${t.stars}/5)`).join('\n') || '—'}

## FAQ
${data.faqItems.filter(f => f.question).map((f, i) => `${i + 1}. Q: ${f.question}\n   A: ${f.answer || '—'}`).join('\n') || '—'}
`
}

export async function POST(req: NextRequest) {
  try {
    const data: WizardData = await req.json()

    if (!data.bizEmail?.trim()) {
      return NextResponse.json({ error: 'Email address is required.' }, { status: 400 })
    }

    const clientName = data.contactName?.trim() || data.bizName?.trim() || 'there'
    const briefMd = buildDiyBriefMd(data)
    const promptText = buildDiyPrompt(data)
    const combined = `${briefMd}\n\n---\n\n## Your Claude Prompt\n\n\`\`\`\n${promptText}\n\`\`\``

    const briefFilename = `diy-brief-${(data.bizName || 'website').trim().toLowerCase().replace(/[^a-z0-9]+/g, '-')}.md`
    const briefBase64 = Buffer.from(combined, 'utf-8').toString('base64')

    // Notify Josh
    await resend.emails.send({
      from: FROM_ADDRESS,
      to: NOTIFY_TO,
      subject: `New DIY brief — ${data.bizName?.trim() || 'Unknown'}`,
      text: `New DIY brief received from ${clientName} (${data.bizEmail.trim()}).\n\nSee attached .md file for the full brief and generated Claude prompt.`,
      attachments: [{ filename: briefFilename, content: briefBase64 }],
    })

    // Send to client
    const clientEmailText = [
      `Hi ${clientName},`,
      '',
      `Here's a copy of your website brief and your personalised Claude prompt.`,
      '',
      `Your brief is attached as a .md file — open it in any text editor or Markdown viewer.`,
      '',
      `Next steps:`,
      `1. Open claude.ai and start a new Claude Code conversation (click the </> symbol, top left)`,
      `2. Click the + button (bottom left) to attach your logo and any photos`,
      `3. Copy the Claude prompt from the attached file and paste it into the chat`,
      `4. Send it and Claude will write your complete website`,
      '',
      `If you get stuck or decide you'd prefer us to build it for you, just reply to this email.`,
      '',
      `Good luck with the build!`,
      `Josh`,
      `Web F5`,
      `contact@webf5.au`,
    ].join('\n')

    await resend.emails.send({
      from: FROM_ADDRESS,
      to: data.bizEmail.trim(),
      replyTo: 'contact@webf5.au',
      subject: `Your DIY website brief — ${data.bizName?.trim() || 'Website'}`,
      text: clientEmailText,
      attachments: [{ filename: briefFilename, content: briefBase64 }],
    })

    return NextResponse.json({ success: true })

  } catch (err) {
    console.error('[diy-brief]', err)
    return NextResponse.json(
      { error: 'Something went wrong. Please try again or email contact@webf5.au' },
      { status: 500 }
    )
  }
}
