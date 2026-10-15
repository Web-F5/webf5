import React from 'react'
import { Document, Page, View, Text, StyleSheet, renderToBuffer, Link } from '@react-pdf/renderer'

export interface AuditReportData {
  lcp:            number
  pageSpeedScore?: number | null
  desktopScore?:  number | null
  mobileCls?:     number | null
  mobileFcp?:     number | null
  mobileTbt?:     number | null
  desktopLcp?:    number | null
  desktopCls?:    number | null
  desktopFcp?:    number | null
  desktopTbt?:    number | null
  pageWeightKb?:  number | null
  lighthouseAccessibility?: number | null
  lighthouseBestPractices?: number | null
  grade:          string
  overallScore:   number
  subScores?: {
    onPage:      number
    performance: number
    usability:   number
    social:      number
  }
  ssl:          boolean
  hasSitemap:   boolean
  hasRobotsTxt?: boolean
  hasLlmsTxt?:  boolean
  content: {
    metaTitle:       string | null
    metaDesc:        string | null
    h1:              string | null
    metaTitleLen?:   number | null
    metaDescLen?:    number | null
    hasContact:      boolean
    hasCta:          boolean
    hasTapToCall?:   boolean
    hasSchema?:      boolean
    hasCanonical?:   boolean
    hasFavicon?:     boolean
    hasLang?:        boolean
    hasAnalytics?:   boolean
    hasMetaPixel?:   boolean
    hasGoogleAds?:   boolean
    hasOpenGraph?:   boolean
    hasTwitterCard?: boolean
    hasViewport?:    boolean
    imagesTotal?:    number
    imagesMissingAlt?: number
    linkCount?:      number
  }
  url: string
}

// ── Colours ────────────────────────────────────────────────────────────────

const C = {
  navy:    '#0A0F1E',
  dark:    '#111827',
  indigo:  '#6366F1',
  white:   '#FFFFFF',
  slate:   '#94A3B8',
  light:   '#F1F5F9',
  border:  '#E2E8F0',
  pass:    '#22C55E',
  fail:    '#EF4444',
  amber:   '#F59E0B',
  lime:    '#84CC16',
}

function gradeColor(grade: string): string {
  return { A: C.pass, B: C.lime, C: C.amber, D: C.fail }[grade] ?? C.indigo
}

function subScoreColor(score: number): string {
  if (score >= 80) return C.pass
  if (score >= 60) return C.amber
  return C.fail
}

function coverHeadline(grade: string): string {
  return {
    A: 'Looking good.',
    B: 'A solid start.',
    C: 'Room to improve.',
    D: 'Action needed.',
  }[grade] ?? 'Here are your results.'
}

function coverSubline(grade: string): string {
  return {
    A: 'Your site is performing well across the fundamentals. There may still be conversion and design improvements worth exploring.',
    B: 'Your site has a solid foundation, but a few key gaps are worth addressing to get more enquiries.',
    C: 'Several issues are holding your site back. The findings below show exactly what to fix first.',
    D: 'Multiple significant issues were found. Fixing these could meaningfully increase the enquiries your site generates.',
  }[grade] ?? ''
}

// ── Styles ─────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  // Cover
  coverPage:       { backgroundColor: C.navy, padding: 50, flexDirection: 'column', justifyContent: 'space-between' },
  brandText:       { fontSize: 18, fontFamily: 'Helvetica-Bold', color: C.indigo, marginBottom: 4 },
  coverLabel:      { fontSize: 9, fontFamily: 'Helvetica', color: C.slate, letterSpacing: 2 },
  coverHeadline:   { fontSize: 42, fontFamily: 'Helvetica-Bold', color: C.white, marginBottom: 8, marginTop: 48 },
  coverBizName:    { fontSize: 22, fontFamily: 'Helvetica-Bold', color: C.white, marginBottom: 4 },
  coverUrl:        { fontSize: 11, fontFamily: 'Helvetica', color: C.slate, marginBottom: 40 },
  coverSubline:    { fontSize: 12, fontFamily: 'Helvetica', color: C.slate, lineHeight: 1.6, maxWidth: 380 },
  gradeRow:        { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  gradeCircle:     { width: 72, height: 72, borderRadius: 36, borderWidth: 4, alignItems: 'center', justifyContent: 'center', marginRight: 20 },
  gradeLetter:     { fontSize: 34, fontFamily: 'Helvetica-Bold' },
  scoreBlock:      { flexDirection: 'column' },
  scoreNumber:     { fontSize: 36, fontFamily: 'Helvetica-Bold', lineHeight: 1 },
  scoreLabel:      { fontSize: 11, fontFamily: 'Helvetica', color: C.slate, marginTop: 2 },
  subScoreRow:     { flexDirection: 'row', marginTop: 20, gap: 12 },
  subScoreItem:    { alignItems: 'center', backgroundColor: '#0F1729', borderRadius: 6, paddingVertical: 10, paddingHorizontal: 12 },
  subScoreNum:     { fontSize: 18, fontFamily: 'Helvetica-Bold' },
  subScoreLabel:   { fontSize: 8, fontFamily: 'Helvetica', color: C.slate, marginTop: 2 },
  coverFooterRow:  { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: '#1E293B', paddingTop: 16 },
  coverFooterText: { fontSize: 9, fontFamily: 'Helvetica', color: C.slate },

  // Report page
  reportPage:  { backgroundColor: C.white, padding: 44, flexDirection: 'column' },
  pageHeader:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, paddingBottom: 14, borderBottomWidth: 1, borderBottomColor: C.border },
  pageTitle:   { fontSize: 10, fontFamily: 'Helvetica-Bold', color: C.dark },
  pageSubtitle:{ fontSize: 9, fontFamily: 'Helvetica', color: C.slate },
  pageBrand:   { fontSize: 10, fontFamily: 'Helvetica-Bold', color: C.indigo },

  summaryRow:  { flexDirection: 'row', alignItems: 'center', backgroundColor: C.light, borderRadius: 8, padding: 14, marginBottom: 20 },
  summaryScore:{ fontSize: 28, fontFamily: 'Helvetica-Bold', marginRight: 12 },
  summaryLabel:{ fontSize: 11, fontFamily: 'Helvetica', color: C.slate },

  // Metrics grid
  metricsGrid: { flexDirection: 'row', gap: 8, marginBottom: 4 },
  metricBox:   { flex: 1, backgroundColor: C.light, borderRadius: 6, padding: 8, alignItems: 'center' },
  metricVal:   { fontSize: 14, fontFamily: 'Helvetica-Bold' },
  metricLbl:   { fontSize: 7, fontFamily: 'Helvetica', color: C.slate, marginTop: 2 },

  sectionTitle:{ fontSize: 8, fontFamily: 'Helvetica-Bold', color: C.indigo, letterSpacing: 1.5, marginBottom: 8, marginTop: 16 },
  sectionLine: { borderBottomWidth: 1, borderBottomColor: C.border, marginBottom: 4 },

  checkRow:    { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  checkDot:    { width: 8, height: 8, borderRadius: 4, marginTop: 3, marginRight: 10, flexShrink: 0 },
  checkLabel:  { fontSize: 10, fontFamily: 'Helvetica-Bold', marginBottom: 1 },
  checkDetail: { fontSize: 9, fontFamily: 'Helvetica', color: C.slate, lineHeight: 1.4 },
  checkTag:    { fontSize: 8, fontFamily: 'Helvetica', color: C.indigo, marginLeft: 6 },

  ctaBox:      { backgroundColor: '#EEF2FF', borderRadius: 8, padding: 20, marginTop: 20, alignItems: 'center' },
  ctaTitle:    { fontSize: 13, fontFamily: 'Helvetica-Bold', color: C.dark, marginBottom: 6, textAlign: 'center' },
  ctaBody:     { fontSize: 10, fontFamily: 'Helvetica', color: '#475569', textAlign: 'center', lineHeight: 1.5, marginBottom: 12 },
  ctaButton:   { backgroundColor: C.indigo, borderRadius: 6, paddingHorizontal: 24, paddingVertical: 10 },
  ctaButtonText:{ fontSize: 11, fontFamily: 'Helvetica-Bold', color: C.white },
  ctaContact:  { fontSize: 9, fontFamily: 'Helvetica', color: '#475569', marginTop: 8, textAlign: 'center' },
})

// ── Components ─────────────────────────────────────────────────────────────

function CheckRow({ pass, label, detail, tag }: { pass: boolean; label: string; detail: string; tag?: string }) {
  return (
    <View style={s.checkRow}>
      <View style={[s.checkDot, { backgroundColor: pass ? C.pass : C.fail }]} />
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={[s.checkLabel, { color: pass ? C.dark : C.fail }]}>{label}</Text>
          {tag ? <Text style={s.checkTag}>{tag}</Text> : null}
        </View>
        <Text style={s.checkDetail}>{detail}</Text>
      </View>
    </View>
  )
}

function InfoRow({ label, detail }: { label: string; detail: string }) {
  return (
    <View style={[s.checkRow, { borderBottomColor: '#F1F5F9' }]}>
      <View style={[s.checkDot, { backgroundColor: C.slate }]} />
      <View style={{ flex: 1 }}>
        <Text style={[s.checkLabel, { color: C.dark }]}>{label}</Text>
        <Text style={s.checkDetail}>{detail}</Text>
      </View>
    </View>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View>
      <Text style={s.sectionTitle}>{title.toUpperCase()}</Text>
      <View style={s.sectionLine} />
      {children}
    </View>
  )
}

function MetricBox({ val, label, color }: { val: string; label: string; color?: string }) {
  return (
    <View style={s.metricBox}>
      <Text style={[s.metricVal, { color: color ?? C.dark }]}>{val}</Text>
      <Text style={s.metricLbl}>{label}</Text>
    </View>
  )
}

// ── Pages ──────────────────────────────────────────────────────────────────

function CoverPage({ report, biz, date }: { report: AuditReportData; biz: string; date: string }) {
  const gc = gradeColor(report.grade)
  return (
    <Page size="A4" style={s.coverPage}>
      {/* Top */}
      <View>
        <Text style={s.brandText}>Web F5</Text>
        <Text style={s.coverLabel}>WEBSITE AUDIT REPORT</Text>
      </View>

      {/* Centre */}
      <View>
        <Text style={s.coverHeadline}>{coverHeadline(report.grade)}</Text>
        <Text style={s.coverBizName}>{biz}</Text>
        <Text style={s.coverUrl}>{report.url}</Text>

        <View style={s.gradeRow}>
          <View style={[s.gradeCircle, { borderColor: gc }]}>
            <Text style={[s.gradeLetter, { color: gc }]}>{report.grade}</Text>
          </View>
          <View style={s.scoreBlock}>
            <Text style={[s.scoreNumber, { color: gc }]}>{report.overallScore}</Text>
            <Text style={s.scoreLabel}>out of 100</Text>
          </View>
        </View>

        {/* Sub-score tiles */}
        {report.subScores && (
          <View style={s.subScoreRow}>
            {([
              ['On-Page', report.subScores.onPage],
              ['Performance', report.subScores.performance],
              ['Usability', report.subScores.usability],
              ['Social', report.subScores.social],
            ] as [string, number][]).map(([label, score]) => (
              <View key={label} style={s.subScoreItem}>
                <Text style={[s.subScoreNum, { color: subScoreColor(score) }]}>{score}</Text>
                <Text style={s.subScoreLabel}>{label}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={{ marginTop: 20 }}>
          <Text style={s.coverSubline}>{coverSubline(report.grade)}</Text>
        </View>
      </View>

      {/* Footer */}
      <View style={s.coverFooterRow}>
        <Text style={s.coverFooterText}>Prepared by Web F5 · webf5.com.au</Text>
        <Text style={s.coverFooterText}>{date}</Text>
      </View>
    </Page>
  )
}

function FindingsPage({ report, biz }: { report: AuditReportData; biz: string }) {
  const { lcp, ssl, hasSitemap, content } = report
  const allImagesAlt  = (content.imagesTotal ?? 0) === 0 || (content.imagesMissingAlt ?? 0) === 0
  const mobilePass    = lcp < 4
  const desktopPass   = (report.desktopScore ?? 0) >= 80
  const accessPass    = (report.lighthouseAccessibility ?? 0) >= 80
  const bestPractPass = (report.lighthouseBestPractices ?? 0) >= 80
  const gc = gradeColor(report.grade)

  const speedColor = (v: number | null | undefined, good: number, ok: number) => {
    if (v == null) return C.slate
    if (v <= good) return C.pass
    if (v <= ok)   return C.amber
    return C.fail
  }

  const lcpDetail = lcp < 2.5
    ? `${lcp.toFixed(1)}s: fast. Visitors stay and explore.`
    : lcp < 4
    ? `${lcp.toFixed(1)}s: acceptable, but can be improved.`
    : `${lcp.toFixed(1)}s: slow. Many mobile visitors leave before the page finishes loading.`

  // Count for summary
  const checksForSummary = [
    ssl, mobilePass, desktopPass, !!content.metaTitle, !!content.metaDesc, !!content.h1,
    content.hasCanonical, !!hasSitemap, !!report.hasRobotsTxt, !!content.hasSchema, allImagesAlt,
    !!content.hasOpenGraph, !!content.hasTwitterCard,
    !!content.hasAnalytics, !!content.hasMetaPixel, !!content.hasGoogleAds,
    accessPass, !!content.hasTapToCall, content.hasContact, content.hasCta,
  ]
  const passCount  = checksForSummary.filter(Boolean).length
  const totalChecks = checksForSummary.length

  return (
    <Page size="A4" style={s.reportPage}>
      {/* Page header */}
      <View style={s.pageHeader}>
        <View>
          <Text style={s.pageTitle}>Audit Findings: {biz}</Text>
          <Text style={s.pageSubtitle}>{report.url}</Text>
        </View>
        <Text style={s.pageBrand}>Web F5</Text>
      </View>

      {/* Summary */}
      <View style={s.summaryRow}>
        <Text style={[s.summaryScore, { color: gc }]}>{passCount}/{totalChecks}</Text>
        <View>
          <Text style={[s.checkLabel, { color: C.dark, fontSize: 12 }]}>checks passed</Text>
          <Text style={s.summaryLabel}>Overall score: {report.overallScore}/100 · Grade {report.grade}</Text>
        </View>
      </View>

      {/* Performance */}
      <Section title="Performance">
        {/* Core Web Vitals grid */}
        <View style={[s.metricsGrid, { marginBottom: 8 }]}>
          <MetricBox val={`${lcp.toFixed(1)}s`}  label="Mobile LCP"  color={speedColor(lcp, 2.5, 4)} />
          <MetricBox val={report.mobileFcp != null ? `${report.mobileFcp.toFixed(1)}s` : '—'}  label="Mobile FCP"  color={speedColor(report.mobileFcp, 1.8, 3)} />
          <MetricBox val={report.mobileCls != null ? report.mobileCls.toFixed(3) : '—'}         label="Mobile CLS"  color={speedColor(report.mobileCls, 0.1, 0.25)} />
          <MetricBox val={report.mobileTbt != null ? `${Math.round(report.mobileTbt)}ms` : '—'} label="Mobile TBT"  color={speedColor(report.mobileTbt, 200, 600)} />
        </View>
        <View style={[s.metricsGrid, { marginBottom: 8 }]}>
          <MetricBox val={report.desktopLcp != null ? `${report.desktopLcp.toFixed(1)}s` : '—'} label="Desktop LCP" color={speedColor(report.desktopLcp, 2.5, 4)} />
          <MetricBox val={report.desktopFcp != null ? `${report.desktopFcp.toFixed(1)}s` : '—'} label="Desktop FCP" color={speedColor(report.desktopFcp, 1.8, 3)} />
          <MetricBox val={report.desktopCls != null ? report.desktopCls.toFixed(3) : '—'}        label="Desktop CLS" color={speedColor(report.desktopCls, 0.1, 0.25)} />
          <MetricBox val={report.pageWeightKb != null ? `${report.pageWeightKb} KB` : '—'}        label="Page Weight" color={report.pageWeightKb != null ? (report.pageWeightKb < 1024 ? C.pass : report.pageWeightKb < 2048 ? C.amber : C.fail) : C.slate} />
        </View>
        <CheckRow pass={mobilePass}   label={`Mobile PageSpeed: ${report.pageSpeedScore ?? '—'}/100`}  tag={`LCP ${lcp.toFixed(1)}s`}      detail={lcpDetail} />
        <CheckRow pass={desktopPass}  label={`Desktop PageSpeed: ${report.desktopScore ?? '—'}/100`}   tag={report.desktopLcp != null ? `LCP ${report.desktopLcp.toFixed(1)}s` : undefined} detail={desktopPass ? 'Desktop speed is good.' : 'Desktop score is below 80. Check image sizes and render-blocking resources.'} />
        <CheckRow pass={ssl}          label="Secure connection (HTTPS)"                                                                       detail={ssl ? 'Your site is secure. Visitors and Google trust it.' : 'Browsers display a "Not Secure" warning. This loses visitors and hurts your Google ranking.'} />
      </Section>

      {/* On-Page SEO */}
      <Section title="On-Page SEO">
        <CheckRow pass={!!content.metaTitle}   label="Page title"              tag={content.metaTitleLen != null ? `${content.metaTitleLen} chars` : undefined} detail={content.metaTitle ? `"${content.metaTitle}"` : 'Missing. Google has nothing to show in search results.'} />
        <CheckRow pass={!!content.metaDesc}    label="Meta description"        tag={content.metaDescLen != null ? `${content.metaDescLen} chars${(content.metaDescLen < 120 || content.metaDescLen > 155) ? ' · aim 120–155' : ' · good'}` : undefined} detail={content.metaDesc ? 'Set. You control what people read before clicking your result.' : 'Missing. Google will choose what to display instead of you.'} />
        <CheckRow pass={!!content.h1}          label="Page heading (H1)"                                                                      detail={content.h1 ? `"${content.h1}"` : 'Missing. No clear message for visitors or search engines.'} />
        <CheckRow pass={!!content.hasCanonical} label="Canonical tag"                                                                         detail={content.hasCanonical ? 'Set. Prevents duplicate-content issues.' : 'Missing. Add a canonical tag to tell Google which URL is authoritative.'} />
        <CheckRow pass={!!hasSitemap}           label="XML sitemap"                                                                           detail={hasSitemap ? 'Found. Google can discover every page on your site.' : 'Not found. Google has a harder time finding and indexing all your pages.'} />
        <CheckRow pass={!!report.hasRobotsTxt}  label="robots.txt"                                                                           detail={report.hasRobotsTxt ? 'Found. Search engine crawlers have guidance on your site.' : 'Not found. Add a robots.txt file to guide crawlers.'} />
        <CheckRow pass={!!content.hasSchema}    label="Structured data (schema)"                                                              detail={content.hasSchema ? 'Found. Google and AI assistants can read your business details.' : 'Not found. Adding LocalBusiness schema helps you appear in local results and AI assistant answers.'} />
        <CheckRow pass={allImagesAlt}           label="Image alt text"          tag={content.imagesTotal != null ? `${(content.imagesTotal ?? 0) - (content.imagesMissingAlt ?? 0)}/${content.imagesTotal} described` : undefined} detail={allImagesAlt ? 'All images are described. Good for accessibility and search engines.' : `${content.imagesMissingAlt} image${(content.imagesMissingAlt ?? 0) > 1 ? 's' : ''} missing alt text.`} />
        {content.hasFavicon != null && (
          <CheckRow pass={!!content.hasFavicon}  label="Favicon"                                                                              detail={content.hasFavicon ? 'Favicon set. Adds brand recognition in browser tabs and search results.' : 'No favicon detected. A small icon builds recognition in tabs and bookmarks.'} />
        )}
        {content.hasLang != null && (
          <CheckRow pass={!!content.hasLang}     label="Language declaration"                                                                 detail={content.hasLang ? 'Page declares its language. Helps search engines serve the right audience.' : 'No lang attribute on html. Add lang="en" or the appropriate language code.'} />
        )}
        {content.linkCount != null && (
          <InfoRow label={`${content.linkCount} links on page`} detail="Total anchor links found: internal and external." />
        )}
        {report.hasLlmsTxt != null && (
          <CheckRow pass={!!report.hasLlmsTxt}  label="llms.txt (AI readiness)"                                                              detail={report.hasLlmsTxt ? 'llms.txt found. Helps AI assistants understand your site content.' : 'No llms.txt file. This emerging standard helps AI models like ChatGPT better understand your business.'} />
        )}
      </Section>

      {/* Usability */}
      <Section title="Usability">
        <CheckRow pass={accessPass}      label={`Accessibility: ${report.lighthouseAccessibility ?? '—'}/100`}    detail={accessPass ? 'Good accessibility score. Your site works well for all users and search engines.' : 'Accessibility score below 80. Fix contrast, missing labels, and alt text to help all visitors and improve search rankings.'} />
        <CheckRow pass={bestPractPass}   label={`Best Practices: ${report.lighthouseBestPractices ?? '—'}/100`}   detail={bestPractPass ? 'Site follows best practices.' : 'Some best-practice issues detected. Check browser console errors, HTTPS, and deprecated APIs.'} />
        <CheckRow pass={!!content.hasViewport} label="Mobile viewport"                                             detail={content.hasViewport ? 'Responsive viewport is set. The site scales correctly on mobile.' : 'No viewport meta tag. The site may not display correctly on mobile devices.'} />
        <CheckRow pass={!!content.hasTapToCall} label="Tap-to-call phone link"                                     detail={content.hasTapToCall ? 'A tap-to-call link is in place. Mobile visitors can call with one tap.' : "Not found. Mobile visitors have to manually copy-paste your number, and most won't bother."} />
      </Section>

      {/* Social */}
      <Section title="Social &amp; Sharing">
        <CheckRow pass={!!content.hasOpenGraph}   label="Open Graph tags"      detail={content.hasOpenGraph   ? 'Set. Your site shows a rich preview when shared on Facebook, LinkedIn, and iMessage.' : 'Missing. Without OG tags, shared links show a plain URL. Add og:title, og:description, and og:image.'} />
        <CheckRow pass={!!content.hasTwitterCard} label="Twitter / X card tags" detail={content.hasTwitterCard ? 'Set. Links shared on X/Twitter show a rich card.' : 'Missing. Add Twitter card meta tags for better link previews on X and Twitter.'} />
        <CheckRow pass={!!content.hasMetaPixel}   label="Meta (Facebook) Pixel" detail={content.hasMetaPixel   ? 'Found. You can retarget visitors with Facebook and Instagram ads.' : 'Not found. Adding the Pixel lets you retarget website visitors with social ads.'} />
      </Section>

      {/* Tracking */}
      <Section title="Tracking">
        <CheckRow pass={!!content.hasAnalytics} label="Google Analytics / Tag Manager" detail={content.hasAnalytics ? 'Found. You can see which pages and sources bring in enquiries.' : 'Not found. Without analytics there is no way to know what brings in enquiries.'} />
        <CheckRow pass={!!content.hasGoogleAds} label="Google Ads conversion tag"      detail={content.hasGoogleAds ? 'Found. You can measure which ad clicks become enquiries.' : 'Not found. If you run Google Ads, a conversion tag shows which keywords generate leads.'} />
      </Section>

      {/* Enquiry Path */}
      <Section title="Enquiry Path">
        <CheckRow pass={content.hasContact} label="Contact details on page" detail={content.hasContact ? 'Contact details are visible on the page.' : "Not found. Visitors who can't reach you quickly will call your competitor."} />
        <CheckRow pass={content.hasCta}     label="Clear call to action"    detail={content.hasCta ? 'Your page has a clear next step for visitors.' : 'Not found. Visitors who are ready to enquire may not know what to do next.'} />
      </Section>

      {/* CTA */}
      <View style={s.ctaBox}>
        <Text style={s.ctaTitle}>Want to fix this?</Text>
        <Text style={s.ctaBody}>
          We fix exactly these problems for local businesses across Victoria.{'\n'}
          Book a free 15-minute call and we'll walk through your site together.
        </Text>
        <Link src={`mailto:contact@webf5.au?subject=${encodeURIComponent(`${biz} - request for a 15 minute call.`)}&body=${encodeURIComponent(`Please contact ${biz} regarding the items identified on the website audit.`)}`}
          style={{ textDecoration: 'none' }}>
          <View style={s.ctaButton}>
            <Text style={s.ctaButtonText}>Book a free 15-minute call</Text>
          </View>
        </Link>
        <Text style={s.ctaContact}>Or call Josh: 0419 510 206 · contact@webf5.au</Text>
      </View>
    </Page>
  )
}

// ── Export ─────────────────────────────────────────────────────────────────

export async function generateAuditPdf(
  report: AuditReportData,
  name: string,
  biz: string,
): Promise<Buffer> {
  const date = new Date().toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' })
  const doc = (
    <Document title={`Website Audit: ${biz}`} author="Web F5">
      <CoverPage report={report} biz={biz} date={date} />
      <FindingsPage report={report} biz={biz} />
    </Document>
  )
  return renderToBuffer(doc) as Promise<Buffer>
}
