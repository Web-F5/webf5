import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { db, checklistLeads } from '@/lib/db'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM   = 'contact@webf5.au'
const NOTIFY = 'leads@webf5.au'

const CHECKLIST_URL = 'https://webf5.com.au/resources/website-checklist'

function buildProspectEmail(name: string): string {
  return `Hi ${name},

Here's your copy of the 12-Point Website Checklist for Australian Small Businesses.

View and print it here:
${CHECKLIST_URL}

── The 12 Checks ─────────────────────────────────────────────

FIRST IMPRESSIONS
1. Clear headline — visitors know within 5 seconds what you do and who you serve
2. Professional imagery — real photos of your work, team, or premises (not stock photos)
3. Mobile-friendly — the site looks and works well on a phone

TRUST SIGNALS
4. Contact details on every page — phone number visible, not just on the contact page
5. Google reviews / testimonials — at least 3 visible on your homepage
6. SSL certificate — padlock icon in the browser bar (HTTPS)
7. About page — real information about the business owner or team

GETTING FOUND ON GOOGLE
8. Page title & description — every page has a unique, descriptive title
9. Google Business Profile — claimed, verified, and linked to your website
10. Fast loading — under 3 seconds on mobile (test free at pagespeed.web.dev)

CONVERTING VISITORS
11. Clear call to action — one obvious next step on every page ("Call now", "Get a quote", "Book online")
12. Privacy policy — required under the Australian Privacy Act for any site collecting personal information

─────────────────────────────────────────────────────────────

Not sure how your site stacks up? Get a free automated audit at:
${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://webf5.com.au'}/audit

Or reply to this email and we'll take a look for you.

Josh Ekberg
Web F5
contact@webf5.au
webf5.com.au
`
}

function buildNotifyEmail(name: string, businessName: string | undefined, email: string, industry: string | undefined): string {
  return `Checklist download — ${businessName || name}

Name: ${name}
Email: ${email}
Business: ${businessName || '—'}
Industry: ${industry || '—'}
`
}

export async function POST(req: NextRequest) {
  try {
    const { name, businessName, email, industry } = await req.json()

    if (!name?.trim() || !email?.trim()) {
      return NextResponse.json({ error: 'Name and email are required.' }, { status: 400 })
    }

    await db.insert(checklistLeads).values({
      name:         name.trim(),
      businessName: businessName?.trim() || null,
      email:        email.trim().toLowerCase(),
      industry:     industry || null,
    })

    await Promise.all([
      resend.emails.send({
        from:    FROM,
        to:      email.trim(),
        replyTo: 'contact@webf5.au',
        subject: 'Your 12-Point Website Checklist — Web F5',
        text:    buildProspectEmail(name.trim()),
      }),
      resend.emails.send({
        from:    FROM,
        to:      NOTIFY,
        subject: `Checklist download — ${businessName?.trim() || name.trim()}`,
        text:    buildNotifyEmail(name.trim(), businessName?.trim(), email.trim(), industry),
      }),
    ])

    return NextResponse.json({ success: true })

  } catch (err) {
    console.error('Checklist lead error:', err)
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }
}
