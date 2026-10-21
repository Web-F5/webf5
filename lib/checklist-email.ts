// ── Checklist items ────────────────────────────────────────────────────────

interface CheckItem {
  num:    number
  label:  string
  detail: string
}

const SECTIONS: { title: string; items: CheckItem[] }[] = [
  {
    title: 'First Impressions',
    items: [
      { num: 1, label: 'Clear headline',         detail: 'Visitors know within 5 seconds what you do and who you serve.' },
      { num: 2, label: 'Professional imagery',   detail: 'Real photos of your work, team, or premises. Not stock photos.' },
      { num: 3, label: 'Mobile-friendly design', detail: 'The site looks and works well on a phone. Over 60% of visitors are on mobile.' },
    ],
  },
  {
    title: 'Trust Signals',
    items: [
      { num: 4,  label: 'Contact details on every page',    detail: 'Phone number is visible on every page, not just the contact page.' },
      { num: 5,  label: 'Google reviews / testimonials',    detail: 'At least 3 visible on your homepage. Social proof converts browsers into buyers.' },
      { num: 6,  label: 'SSL certificate (HTTPS)',          detail: 'Padlock icon in the browser bar. Required by Google and expected by visitors.' },
      { num: 7,  label: 'About page',                       detail: 'Real information about the business owner or team. People buy from people.' },
    ],
  },
  {
    title: 'Getting Found on Google',
    items: [
      { num: 8,  label: 'Page title and meta description',  detail: 'Every page has a unique, descriptive title under 60 characters.' },
      { num: 9,  label: 'Google Business Profile',          detail: 'Claimed, verified, and linked to your website. Free and essential for local search.' },
      { num: 10, label: 'Fast loading (under 3 seconds)',   detail: 'Test free at pagespeed.web.dev. Slow sites lose visitors and Google ranking.' },
    ],
  },
  {
    title: 'Converting Visitors',
    items: [
      { num: 11, label: 'Clear call to action',   detail: 'One obvious next step on every page. "Call now", "Get a quote", "Book online".' },
      { num: 12, label: 'Privacy policy',         detail: 'Required under the Australian Privacy Act for any site collecting personal information.' },
    ],
  },
]

// ── Helpers ────────────────────────────────────────────────────────────────

function sectionHeader(title: string): string {
  return `
    <tr>
      <td style="padding:20px 16px 4px;background:#F8FAFC;">
        <div style="font-size:10px;font-weight:700;color:#6366F1;letter-spacing:1.5px;text-transform:uppercase;">${title}</div>
        <div style="height:1px;background:#E2E8F0;margin-top:6px;"></div>
      </td>
    </tr>`
}

function checkRow(item: CheckItem): string {
  return `
    <tr>
      <td style="padding:10px 16px;border-bottom:1px solid #F1F5F9;vertical-align:top;">
        <table cellpadding="0" cellspacing="0" width="100%"><tr>
          <td style="width:32px;padding-top:1px;vertical-align:top;">
            <div style="width:22px;height:22px;border:2px solid #E2E8F0;border-radius:4px;display:inline-block;"></div>
          </td>
          <td>
            <div style="font-size:13px;font-weight:600;color:#111827;margin-bottom:2px;">
              <span style="color:#94A3B8;font-size:11px;margin-right:6px;">${item.num}.</span>${item.label}
            </div>
            <div style="font-size:12px;color:#64748B;line-height:1.5;">${item.detail}</div>
          </td>
        </tr></table>
      </td>
    </tr>`
}

// ── Main builder ───────────────────────────────────────────────────────────

export function buildChecklistEmailHtml(name: string): string {
  const date = new Date().toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' })

  const rows = SECTIONS.map(section =>
    sectionHeader(section.title) + section.items.map(checkRow).join('')
  ).join('')

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>12-Point Website Checklist — Web F5</title>
</head>
<body style="margin:0;padding:0;background:#F1F5F9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">

<table width="100%" cellpadding="0" cellspacing="0" style="background:#F1F5F9;padding:32px 16px;">
  <tr><td align="center">
  <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

    <!-- ═══ HERO (dark) ═══ -->
    <tr><td style="background:#0A0F1E;border-radius:16px 16px 0 0;padding:40px 40px 36px;">

      <!-- Brand -->
      <table cellpadding="0" cellspacing="0" style="margin-bottom:4px;">
        <tr>
          <td style="padding-right:10px;vertical-align:middle;">
            <img src="https://webf5.com.au/images/web-app-manifest-512x512.png" alt="Web F5" width="36" height="36"
              style="display:block;border:0;" />
          </td>
          <td style="vertical-align:middle;">
            <div style="font-size:20px;font-weight:800;color:#6366F1;line-height:1;">Web F5</div>
          </td>
        </tr>
      </table>
      <div style="font-size:10px;color:#475569;letter-spacing:2px;text-transform:uppercase;margin-bottom:36px;">Website Checklist · ${date}</div>

      <!-- Icon -->
      <div style="font-size:48px;margin-bottom:20px;">✅</div>

      <!-- Headline -->
      <div style="font-size:28px;font-weight:800;color:#FFFFFF;margin-bottom:8px;">Your 12-Point Website Checklist</div>
      <div style="font-size:14px;color:#94A3B8;line-height:1.6;">
        Hi ${name}, here's the checklist for Australian small business websites. Print it out, tick off what you have, and see what needs attention.
      </div>
    </td></tr>

    <!-- ═══ CHECKLIST ═══ -->
    <tr><td style="background:#FFFFFF;padding:0;">
      <table width="100%" cellpadding="0" cellspacing="0">
        ${rows}
      </table>
    </td></tr>

    <!-- ═══ CTA ═══ -->
    <tr><td style="background:#EEF2FF;padding:36px 40px;text-align:center;">
      <div style="font-size:20px;font-weight:800;color:#1E1B4B;margin-bottom:10px;">
        Not sure how your site stacks up?
      </div>
      <div style="font-size:14px;color:#4338CA;line-height:1.6;margin-bottom:24px;max-width:400px;margin-left:auto;margin-right:auto;">
        Get a free automated audit of your website in seconds. Speed, SEO, usability, and more — delivered as a full PDF report.
      </div>
      <a href="https://webf5.com.au/audit" style="display:inline-block;background:#4F46E5;color:#FFFFFF;font-weight:700;font-size:14px;padding:14px 32px;border-radius:50px;text-decoration:none;">
        Get a free website audit →
      </a>
      <div style="margin-top:16px;font-size:12px;color:#6366F1;">
        The checklist PDF is attached to this email.
      </div>
    </td></tr>

    <!-- ═══ FOOTER ═══ -->
    <tr><td style="background:#0A0F1E;border-radius:0 0 16px 16px;padding:24px 40px;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="vertical-align:top;">
            <div style="font-size:14px;font-weight:800;color:#6366F1;margin-bottom:4px;">Web F5</div>
            <div style="font-size:11px;color:#475569;">Web design &amp; development · Central Victoria</div>
          </td>
          <td style="text-align:right;vertical-align:top;">
            <div style="font-size:11px;color:#475569;margin-bottom:3px;">
              <a href="tel:+61419510206" style="color:#6366F1;text-decoration:none;">0419 510 206</a>
            </div>
            <div style="font-size:11px;color:#475569;">
              <a href="mailto:contact@webf5.au" style="color:#475569;text-decoration:none;">contact@webf5.au</a>
            </div>
          </td>
        </tr>
        <tr><td colspan="2" style="padding-top:16px;border-top:1px solid #1E293B;">
          <div style="font-size:10px;color:#334155;line-height:1.7;text-align:center;">
            <a href="https://webf5.com.au/privacy" style="color:#475569;text-decoration:underline;">Privacy Policy</a>
            &nbsp;·&nbsp;
            <a href="mailto:contact@webf5.au?subject=Unsubscribe" style="color:#475569;text-decoration:underline;">Unsubscribe</a>
            <br/>You received this email because you requested information from Web F5, or we identified your business as a potential fit for our services.
          </div>
        </td></tr>
      </table>
    </td></tr>

  </table>
  </td></tr>
</table>

</body>
</html>`
}

export function buildChecklistNotifyEmailHtml(
  name: string,
  businessName: string | undefined,
  email: string,
  industry: string | undefined,
): string {
  const date = new Date().toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' })
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><title>Checklist Lead</title></head>
<body style="margin:0;padding:24px;background:#F1F5F9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
<table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;background:#FFFFFF;border-radius:12px;overflow:hidden;">
  <tr><td style="background:#0A0F1E;padding:24px 28px;">
    <div style="font-size:16px;font-weight:800;color:#6366F1;">Web F5 — New Checklist Lead</div>
    <div style="font-size:11px;color:#475569;margin-top:2px;">${date}</div>
  </td></tr>
  <tr><td style="padding:24px 28px;">
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr><td style="padding:8px 0;border-bottom:1px solid #F1F5F9;font-size:13px;color:#94A3B8;width:120px;">Name</td><td style="padding:8px 0;border-bottom:1px solid #F1F5F9;font-size:13px;font-weight:600;color:#111827;">${name}</td></tr>
      <tr><td style="padding:8px 0;border-bottom:1px solid #F1F5F9;font-size:13px;color:#94A3B8;">Email</td><td style="padding:8px 0;border-bottom:1px solid #F1F5F9;font-size:13px;color:#111827;"><a href="mailto:${email}" style="color:#6366F1;text-decoration:none;">${email}</a></td></tr>
      <tr><td style="padding:8px 0;border-bottom:1px solid #F1F5F9;font-size:13px;color:#94A3B8;">Business</td><td style="padding:8px 0;border-bottom:1px solid #F1F5F9;font-size:13px;color:#111827;">${businessName || '—'}</td></tr>
      <tr><td style="padding:8px 0;font-size:13px;color:#94A3B8;">Industry</td><td style="padding:8px 0;font-size:13px;color:#111827;">${industry || '—'}</td></tr>
    </table>
  </td></tr>
</table>
</body>
</html>`
}
