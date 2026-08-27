'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp, Download, Trash2 } from 'lucide-react'

interface BriefRowProps {
  draft: {
    id: string
    userId: string | null
    guestEmail: string | null
    currentStep: number
    data: unknown
    status: string
    consentFollowupEmail: boolean
    lastActivityAt: Date
    createdAt: Date
  }
  timeAgo: string
  createdLabel: string
}

type D = Record<string, unknown>

function scalar(v: unknown): string {
  if (v === null || v === undefined || v === '') return '—'
  if (typeof v === 'boolean') return v ? 'Yes' : '—'
  if (Array.isArray(v)) return v.length ? v.join(', ') : '—'
  return String(v)
}

// Renders a comma-separated value as one item per line
function commaSepLines(v: unknown): string[] | null {
  const s = scalar(v)
  if (s === '—') return null
  return s.split(/,\s*/).map(t => t.trim()).filter(Boolean)
}

function Row({ label, value }: { label: string; value: unknown }) {
  const text = scalar(value)
  if (text === '—') return null
  return (
    <div className="flex gap-3 py-1.5 border-b border-white/5 last:border-0">
      <span className="text-slate-500 text-xs w-44 shrink-0 pt-0.5">{label}</span>
      <span className="text-slate-200 text-xs break-words flex-1">{text}</span>
    </div>
  )
}

function ListRow({ label, value }: { label: string; value: unknown }) {
  const items = commaSepLines(value)
  if (!items) return null
  return (
    <div className="flex gap-3 py-1.5 border-b border-white/5 last:border-0">
      <span className="text-slate-500 text-xs w-44 shrink-0 pt-0.5">{label}</span>
      <ul className="flex-1 space-y-0.5">
        {items.map((item, i) => (
          <li key={i} className="text-slate-200 text-xs">{item}</li>
        ))}
      </ul>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-5">
      <p className="text-indigo-400 text-xs font-semibold uppercase tracking-widest mb-2">{title}</p>
      {children}
    </div>
  )
}

// ── Download helper ────────────────────────────────────────────────────────────

function formatAsText(draft: BriefRowProps['draft']): string {
  const d = (draft.data ?? {}) as D
  const lines: string[] = []

  const add = (label: string, value: unknown) => {
    const v = scalar(value)
    if (v !== '—') lines.push(`${label}: ${v}`)
  }

  lines.push('WEB F5 — CLIENT BRIEF')
  lines.push(`Generated: ${new Date().toLocaleString('en-AU')}`)
  lines.push(`Status: ${draft.status === 'in_progress' ? 'In progress' : 'Submitted'} (step ${draft.currentStep}/11)`)
  lines.push('')

  lines.push('── CONTACT ──────────────────────────')
  add('Name',    d.contactName)
  add('Email',   draft.guestEmail || d.bizEmail)
  add('Phone',   d.bizPhone)
  lines.push('')

  lines.push('── STEP 1: STARTING POINT ───────────')
  add('Start type',     d.startType)
  add('Existing URL',   d.existingUrl)
  add('Sites they like',    d.siteLike)
  add('Sites they dislike', d.siteDislike)
  lines.push('')

  lines.push('── STEP 2: DOMAIN ───────────────────')
  add('Domain status',  d.domainStatus)
  add('Domain name',    d.domainName)
  add('Registrar',      d.domainRegistrar)
  add('Domain ideas',   d.domainIdeas)
  add('Extension',      d.domainExtension)
  lines.push('')

  lines.push('── STEP 3: BUSINESS INFO ────────────')
  add('Business name',    d.bizName)
  add('Tagline',          d.bizTagline)
  add('ABN / ACN',        d.bizReg)
  add('Year established', d.bizYear)
  add('Description',      d.bizDesc)
  add('Hours M–F',        d.bizHoursMF)
  add('Hours Sat',        d.bizHoursSat)
  add('Hours Sun',        d.bizHoursSun)
  add('USP',              d.bizUsp)
  add('Target audience',  d.bizAudience)
  add('Qualifications',   d.bizQualifications)
  add('Memberships',      d.bizMemberships)
  add('Guarantees',       d.bizGuarantees)
  lines.push('')

  lines.push('── STEP 4: LOCATION ─────────────────')
  add('Address',          d.bizAddress)
  add('Town',             d.bizAddressTown)
  add('Service reach',    d.serviceReach)
  add('Radius (km)',      d.serviceRadiusKm)
  add('Service towns',    d.serviceRadiusTowns)
  add('Local area',       d.localArea)
  add('Visit type',       d.visitType)
  add('Online services',  d.onlineServices)
  lines.push('')

  lines.push('── STEP 5: DIGITAL PRESENCE ─────────')
  add('Google Business',  d.googleBusiness)
  add('Social media',     d.socialMedia)
  add('CRM',              d.crm)
  add('Ad accounts',      d.adAccounts)
  lines.push('')

  lines.push('── STEP 6: BRANDING ─────────────────')
  add('Design style',     d.designStyle)
  add('Primary colour',   d.brandPrimary)
  add('Display font',     d.displayFont)
  add('Body font',        d.bodyFont)
  add('Sites they love',  d.sitesLove)
  add('Sites they dislike', d.sitesDislike)
  add('Brand summary',    d.brandColours)
  lines.push('')

  lines.push('── STEP 7: PAGES & CONTENT ──────────')
  add('Pages',            d.pages)
  add('About description', d.aboutDesc)
  add('Blog topics',      d.blogTopics)
  add('Content author',   d.contentAuthor)
  add('Existing copy',    d.existingCopy)
  add('Multilingual',     d.multilingual)
  add('Languages',        d.languages)
  lines.push('')

  lines.push('── STEP 8: FEATURES ─────────────────')
  add('Ecommerce',        d.hasEcommerce ? 'Yes' : null)
  add('Product type',     d.productType)
  add('Product count',    d.productCount)
  add('Payment gateways', d.paymentGateways)
  add('Inventory mgmt',   d.inventoryMgmt)
  add('Bookings',         d.hasBookings ? 'Yes' : null)
  add('Booking payment',  d.bookingPayment)
  add('Staff count',      d.staffCount)
  add('Features',         d.features)
  add('Integrations',     d.integrations)
  lines.push('')

  lines.push('── STEP 9: ADD-ONS ──────────────────')
  add('Add-ons',          d.addOns)
  lines.push('')

  lines.push('── STEP 10: TIMELINE & BUDGET ───────')
  add('Budget',              d.budget)
  add('Has deadline',        d.hasDeadline)
  add('Launch date',         d.launchDate)
  add('Deadline reason',     d.deadlineReason)
  add('Build approach',      d.buildApproach)
  add('Internal resources',  d.internalResources)
  add('Internal contact',    d.internalContactName)
  add('Internal email',      d.internalContactEmail)
  add('Internal phone',      d.internalContactPhone)
  add('Extra notes',         d.extraNotes)

  return lines.join('\n')
}

function downloadText(draft: BriefRowProps['draft']) {
  const text = formatAsText(draft)
  const d = (draft.data ?? {}) as D
  const name = (d.bizName as string || d.contactName as string || 'brief').replace(/\s+/g, '-').toLowerCase()
  const blob = new Blob([text], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${name}-brief.txt`
  a.click()
  URL.revokeObjectURL(url)
}

// ── Component ──────────────────────────────────────────────────────────────────

export function BriefRow({ draft, timeAgo, createdLabel }: BriefRowProps) {
  const [open, setOpen]       = useState(false)
  const [deleted, setDeleted] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const d = (draft.data ?? {}) as D
  const name    = scalar(d.contactName)
  const email   = draft.guestEmail || scalar(d.bizEmail)
  const phone   = scalar(d.bizPhone)
  const bizName = scalar(d.bizName)
  const isGuest = !draft.userId

  async function handleDelete() {
    if (!confirm(`Delete brief for ${bizName === '—' ? name : bizName}? This cannot be undone.`)) return
    setDeleting(true)
    const res = await fetch(`/api/admin/briefs/${draft.id}`, { method: 'DELETE' })
    if (res.ok) {
      setDeleted(true)
    } else {
      alert('Delete failed — try again.')
      setDeleting(false)
    }
  }

  if (deleted) return null

  return (
    <>
      {/* Summary row */}
      <tr
        className="bg-[#0d1421] hover:bg-[#111827] transition-colors cursor-pointer select-none"
        onClick={() => setOpen(o => !o)}
      >
        <td className="px-4 py-3">
          <p className="font-medium text-white">{name}</p>
          <p className="text-slate-400 text-xs">{email}</p>
          <p className="text-slate-500 text-xs">{phone}</p>
        </td>
        <td className="px-4 py-3 text-slate-300">{bizName}</td>
        <td className="px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="w-20 h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-500 rounded-full"
                style={{ width: `${(draft.currentStep / 11) * 100}%` }}
              />
            </div>
            <span className="text-slate-400 text-xs whitespace-nowrap">
              {draft.currentStep} / 11
            </span>
          </div>
        </td>
        <td className="px-4 py-3">
          <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
            draft.status === 'in_progress'
              ? 'bg-amber-500/15 text-amber-400'
              : 'bg-green-500/15 text-green-400'
          }`}>
            {draft.status === 'in_progress' ? 'In progress' : 'Submitted'}
          </span>
        </td>
        <td className="px-4 py-3">
          {draft.consentFollowupEmail
            ? <span className="text-green-400 text-xs">✓ Opted in</span>
            : <span className="text-slate-500 text-xs">No</span>
          }
        </td>
        <td className="px-4 py-3 text-slate-400 text-xs whitespace-nowrap">{timeAgo}</td>
        <td className="px-4 py-3 text-slate-500 text-xs whitespace-nowrap">{createdLabel}</td>
        <td className="px-4 py-3">
          <span className={`text-xs ${isGuest ? 'text-slate-500' : 'text-indigo-400'}`}>
            {isGuest ? 'Guest' : 'Account'}
          </span>
        </td>
        <td className="px-4 py-3 text-slate-500">
          {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </td>
      </tr>

      {/* Expanded detail panel */}
      {open && (
        <tr className="bg-[#0a0f1c]">
          <td colSpan={9} className="px-6 py-5">

            {/* Actions */}
            <div className="flex items-center gap-3 mb-6">
              <button
                onClick={e => { e.stopPropagation(); downloadText(draft) }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-700 hover:bg-indigo-600 text-white text-xs font-medium transition-colors"
              >
                <Download size={13} />
                Download .txt
              </button>
              <button
                onClick={e => { e.stopPropagation(); handleDelete() }}
                disabled={deleting}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-900/40 hover:bg-red-800/60 text-red-400 hover:text-red-300 text-xs font-medium transition-colors disabled:opacity-50"
              >
                <Trash2 size={13} />
                {deleting ? 'Deleting…' : 'Delete brief'}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-2">

              <Section title="Step 1 — Starting point">
                <Row label="Start type"          value={d.startType} />
                <Row label="Existing URL"         value={d.existingUrl} />
                <Row label="Sites they like"      value={d.siteLike} />
                <Row label="Sites they dislike"   value={d.siteDislike} />
              </Section>

              <Section title="Step 2 — Domain">
                <Row label="Domain status"        value={d.domainStatus} />
                <Row label="Domain name"          value={d.domainName} />
                <Row label="Registrar"            value={d.domainRegistrar} />
                <Row label="Domain ideas"         value={d.domainIdeas} />
                <Row label="Extension"            value={d.domainExtension} />
              </Section>

              <Section title="Step 3 — Business info">
                <Row label="Business name"        value={d.bizName} />
                <Row label="Tagline"              value={d.bizTagline} />
                <Row label="ABN / ACN"            value={d.bizReg} />
                <Row label="Year established"     value={d.bizYear} />
                <Row label="Description"          value={d.bizDesc} />
                <Row label="Hours M–F"            value={d.bizHoursMF} />
                <Row label="Hours Sat"            value={d.bizHoursSat} />
                <Row label="Hours Sun"            value={d.bizHoursSun} />
                <Row label="USP"                  value={d.bizUsp} />
                <Row label="Target audience"      value={d.bizAudience} />
                <Row label="Qualifications"       value={d.bizQualifications} />
                <Row label="Memberships"          value={d.bizMemberships} />
                <Row label="Guarantees"           value={d.bizGuarantees} />
              </Section>

              <Section title="Step 4 — Location">
                <Row label="Address"              value={d.bizAddress} />
                <Row label="Town"                 value={d.bizAddressTown} />
                <Row label="Service reach"        value={d.serviceReach} />
                <Row label="Radius (km)"          value={d.serviceRadiusKm} />
                <ListRow label="Service towns"    value={d.serviceRadiusTowns} />
                <Row label="Local area"           value={d.localArea} />
                <Row label="Visit type"           value={d.visitType} />
                <Row label="Online services"      value={d.onlineServices} />
              </Section>

              <Section title="Step 5 — Digital presence">
                <Row label="Google Business"      value={d.googleBusiness} />
                <Row label="Social media"         value={d.socialMedia} />
                <Row label="CRM"                  value={d.crm} />
                <Row label="Ad accounts"          value={d.adAccounts} />
              </Section>

              <Section title="Step 6 — Branding">
                <Row label="Design style"         value={d.designStyle} />
                <Row label="Primary colour"       value={d.brandPrimary} />
                <Row label="Display font"         value={d.displayFont} />
                <Row label="Body font"            value={d.bodyFont} />
                <Row label="Sites they love"      value={d.sitesLove} />
                <Row label="Sites they dislike"   value={d.sitesDislike} />
                <Row label="Brand summary"        value={d.brandColours} />
              </Section>

              <Section title="Step 7 — Pages & content">
                <Row label="Pages"                value={d.pages} />
                <Row label="About description"    value={d.aboutDesc} />
                <Row label="Blog topics"          value={d.blogTopics} />
                <Row label="Content author"       value={d.contentAuthor} />
                <Row label="Existing copy"        value={d.existingCopy} />
                <Row label="Multilingual"         value={d.multilingual} />
                <Row label="Languages"            value={d.languages} />
              </Section>

              <Section title="Step 8 — Features">
                <Row label="Ecommerce"            value={d.hasEcommerce ? 'Yes' : null} />
                <Row label="Product type"         value={d.productType} />
                <Row label="Product count"        value={d.productCount} />
                <Row label="Payment gateways"     value={d.paymentGateways} />
                <Row label="Inventory mgmt"       value={d.inventoryMgmt} />
                <Row label="Bookings"             value={d.hasBookings ? 'Yes' : null} />
                <Row label="Booking payment"      value={d.bookingPayment} />
                <Row label="Staff count"          value={d.staffCount} />
                <Row label="Features"             value={d.features} />
                <Row label="Integrations"         value={d.integrations} />
              </Section>

              <Section title="Step 9 — Add-ons">
                <Row label="Add-ons selected"     value={d.addOns} />
              </Section>

              <Section title="Step 10 — Timeline & budget">
                <Row label="Budget"               value={d.budget} />
                <Row label="Has deadline"         value={d.hasDeadline} />
                <Row label="Launch date"          value={d.launchDate} />
                <Row label="Deadline reason"      value={d.deadlineReason} />
                <Row label="Build approach"       value={d.buildApproach} />
                <Row label="Internal resources"   value={d.internalResources} />
                <Row label="Internal contact"     value={d.internalContactName} />
                <Row label="Internal email"       value={d.internalContactEmail} />
                <Row label="Internal phone"       value={d.internalContactPhone} />
                <Row label="Extra notes"          value={d.extraNotes} />
              </Section>

            </div>
          </td>
        </tr>
      )}
    </>
  )
}
