import type { AuditReportData } from './audit-pdf'

// ── Helpers ────────────────────────────────────────────────────────────────

function gradeColor(grade: string): string {
  return { A: '#22C55E', B: '#84CC16', C: '#F59E0B', D: '#EF4444' }[grade] ?? '#6366F1'
}

function coverHeadline(grade: string): string {
  return { A: 'Looking good.', B: 'A solid start.', C: 'Room to improve.', D: 'Action needed.' }[grade] ?? 'Here are your results.'
}

function tick(pass: boolean): string {
  return pass
    ? '<span style="color:#22C55E;font-size:14px;">✔</span>'
    : '<span style="color:#EF4444;font-size:14px;">✖</span>'
}

function checkRow(pass: boolean, label: string, detail: string, tag?: string): string {
  const color = pass ? '#111827' : '#EF4444'
  return `
    <tr>
      <td style="padding:10px 16px;border-bottom:1px solid #F1F5F9;vertical-align:top;">
        <table cellpadding="0" cellspacing="0" width="100%"><tr>
          <td style="width:24px;padding-top:1px;vertical-align:top;">${tick(pass)}</td>
          <td>
            <div style="font-size:13px;font-weight:600;color:${color};margin-bottom:2px;">
              ${label}${tag ? `&nbsp;<span style="font-size:11px;font-weight:400;color:#6366F1;">${tag}</span>` : ''}
            </div>
            <div style="font-size:12px;color:#64748B;line-height:1.5;">${detail}</div>
          </td>
        </tr></table>
      </td>
    </tr>`
}

function sectionHeader(title: string): string {
  return `
    <tr>
      <td style="padding:20px 16px 4px;background:#F8FAFC;">
        <div style="font-size:10px;font-weight:700;color:#6366F1;letter-spacing:1.5px;text-transform:uppercase;">${title}</div>
        <div style="height:1px;background:#E2E8F0;margin-top:6px;"></div>
      </td>
    </tr>`
}

// ── Main builder ───────────────────────────────────────────────────────────

export function buildAuditEmailHtml(
  name: string,
  biz: string,
  report: AuditReportData,
): string {
  const { lcp, ssl, hasSitemap, content, grade, overallScore } = report
  const gc = gradeColor(grade)
  const allImagesAlt = (content.imagesTotal ?? 0) === 0 || (content.imagesMissingAlt ?? 0) === 0
  const speedPass = lcp < 4

  const totalChecks = 14
  const passCount = [
    ssl, speedPass, !!content.metaTitle, !!content.metaDesc, !!content.h1,
    !!hasSitemap, !!content.hasSchema, allImagesAlt,
    !!content.hasAnalytics, !!content.hasMetaPixel, !!content.hasGoogleAds,
    !!content.hasTapToCall, content.hasContact, content.hasCta,
  ].filter(Boolean).length

  const lcpDetail = lcp < 2.5
    ? `${lcp.toFixed(1)}s — fast. Visitors stay and explore.`
    : lcp < 4
    ? `${lcp.toFixed(1)}s — acceptable but there's room to improve.`
    : `${lcp.toFixed(1)}s — slow. Roughly ${Math.min(Math.round((lcp - 2) * 10), 70)}% of mobile visitors leave before the page finishes loading.`

  const date = new Date().toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' })

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Your Website Audit — ${biz}</title>
</head>
<body style="margin:0;padding:0;background:#F1F5F9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">

<table width="100%" cellpadding="0" cellspacing="0" style="background:#F1F5F9;padding:32px 16px;">
  <tr><td align="center">
  <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

    <!-- ═══ HERO (dark) ═══ -->
    <tr><td style="background:#0A0F1E;border-radius:16px 16px 0 0;padding:40px 40px 36px;">

      <!-- Brand -->
      <div style="font-size:20px;font-weight:800;color:#6366F1;margin-bottom:4px;">Web F5</div>
      <div style="font-size:10px;color:#475569;letter-spacing:2px;text-transform:uppercase;margin-bottom:36px;">Website Audit Report · ${date}</div>

      <!-- Grade + score -->
      <table cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
        <tr>
          <td style="padding-right:20px;">
            <div style="width:80px;height:80px;border-radius:50%;border:4px solid ${gc};display:flex;align-items:center;justify-content:center;text-align:center;line-height:80px;">
              <span style="font-size:38px;font-weight:900;color:${gc};line-height:80px;display:block;">${grade}</span>
            </div>
          </td>
          <td style="vertical-align:middle;">
            <div style="font-size:42px;font-weight:900;color:${gc};line-height:1;">${overallScore}</div>
            <div style="font-size:13px;color:#64748B;margin-top:2px;">out of 100 · ${passCount}/${totalChecks} checks passed</div>
          </td>
        </tr>
      </table>

      <!-- Headline -->
      <div style="font-size:28px;font-weight:800;color:#FFFFFF;margin-bottom:8px;">${coverHeadline(grade)}</div>
      <div style="font-size:14px;color:#94A3B8;line-height:1.6;margin-bottom:8px;">
        Hi ${name} — here's the audit for <strong style="color:#CBD5E1;">${biz}</strong>.
      </div>
      <div style="font-size:12px;color:#475569;">${report.url}</div>
    </td></tr>

    <!-- ═══ FINDINGS ═══ -->
    <tr><td style="background:#FFFFFF;padding:0;">
      <table width="100%" cellpadding="0" cellspacing="0">

        ${sectionHeader('Mobile Speed')}
        ${checkRow(speedPass, `Load time — ${lcp.toFixed(1)}s`, lcpDetail, report.pageSpeedScore != null ? `PageSpeed ${report.pageSpeedScore}/100` : undefined)}

        ${sectionHeader('Search &amp; SEO')}
        ${checkRow(ssl, 'Secure connection (HTTPS)', ssl ? 'Your site is secure. Visitors and Google trust it.' : 'Browsers display a "Not Secure" warning — this loses visitors and hurts your Google ranking.')}
        ${checkRow(!!content.metaTitle, 'Page title', content.metaTitle ? `"${content.metaTitle}"` : 'Missing — Google has nothing to show in search results.', content.metaTitleLen != null ? `${content.metaTitleLen} chars` : undefined)}
        ${checkRow(!!content.metaDesc, 'Meta description', content.metaDesc ? 'Set — you control what people read before clicking your result.' : 'Missing — Google will choose what to display instead of you.', content.metaDescLen != null ? `${content.metaDescLen} chars${(content.metaDescLen < 120 || content.metaDescLen > 155) ? ' · aim 120–155' : ' · good'}` : undefined)}
        ${checkRow(!!content.h1, 'Page heading (H1)', content.h1 ? `"${content.h1}"` : 'Missing — no clear message for visitors or search engines.')}
        ${checkRow(!!hasSitemap, 'XML sitemap', hasSitemap ? 'Found — Google can discover every page on your site.' : 'Not found — Google has a harder time finding and indexing all your pages.')}
        ${checkRow(!!content.hasSchema, 'Structured data (schema)', content.hasSchema ? 'Found — Google and AI assistants can read your business details.' : 'Not found — adding LocalBusiness schema helps you appear in local results and AI assistant answers.')}
        ${checkRow(allImagesAlt, 'Image alt text', allImagesAlt ? 'All images are described — good for accessibility and search engines.' : `${content.imagesMissingAlt} image${(content.imagesMissingAlt ?? 0) > 1 ? 's' : ''} missing alt text — screen readers and Google can't read these.`, content.imagesTotal != null ? `${(content.imagesTotal ?? 0) - (content.imagesMissingAlt ?? 0)}/${content.imagesTotal} described` : undefined)}

        ${sectionHeader('Tracking')}
        ${checkRow(!!content.hasAnalytics, 'Google Analytics / Tag Manager', content.hasAnalytics ? 'Found — you can see which pages and sources bring in enquiries.' : 'Not found — without analytics there is no way to know what brings in enquiries.')}
        ${checkRow(!!content.hasMetaPixel, 'Meta (Facebook) Pixel', content.hasMetaPixel ? 'Found — you can retarget visitors with Facebook and Instagram ads.' : 'Not found — adding the Pixel lets you retarget website visitors with social ads.')}
        ${checkRow(!!content.hasGoogleAds, 'Google Ads conversion tag', content.hasGoogleAds ? 'Found — you can measure which ad clicks become enquiries.' : 'Not found — if you run Google Ads, a conversion tag shows which keywords generate leads.')}

        ${sectionHeader('Enquiry Path')}
        ${checkRow(!!content.hasTapToCall, 'Tap-to-call phone link', content.hasTapToCall ? 'A tap-to-call link is in place — mobile visitors can call with one tap.' : 'Not found — mobile visitors have to manually copy-paste your number, and most won\'t bother.')}
        ${checkRow(content.hasContact, 'Contact details on page', content.hasContact ? 'Contact details are visible on the page.' : 'Not found — visitors who can\'t reach you quickly will call your competitor.')}
        ${checkRow(content.hasCta, 'Clear call to action', content.hasCta ? 'Your page has a clear next step for visitors.' : 'Not found — visitors who are ready to enquire may not know what to do next.')}

      </table>
    </td></tr>

    <!-- ═══ CTA ═══ -->
    <tr><td style="background:#EEF2FF;padding:36px 40px;text-align:center;">
      <div style="font-size:20px;font-weight:800;color:#1E1B4B;margin-bottom:10px;">
        ${grade === 'A' ? 'Want to go further?' : 'Ready to fix this?'}
      </div>
      <div style="font-size:14px;color:#4338CA;line-height:1.6;margin-bottom:24px;max-width:400px;margin-left:auto;margin-right:auto;">
        ${grade === 'A'
          ? 'We can review your conversion flow, design, and content to find growth opportunities beyond the basics.'
          : 'We fix exactly these problems for local businesses across Victoria. Book a free 15-minute call — no obligation.'}
      </div>
      <a href="https://webf5.com.au/brief" style="display:inline-block;background:#4F46E5;color:#FFFFFF;font-weight:700;font-size:14px;padding:14px 32px;border-radius:50px;text-decoration:none;">
        Book a free 15-minute call →
      </a>
      <div style="margin-top:16px;font-size:12px;color:#6366F1;">
        The full report PDF is attached to this email.
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
      </table>
    </td></tr>

  </table>
  </td></tr>
</table>

</body>
</html>`
}
