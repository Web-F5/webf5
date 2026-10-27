'use client'

import { useDiyWizard } from './DiyWizardContext'
import { buildDiyPrompt } from './buildDiyPrompt'
import {
  Field, Input, Textarea, Select, OptionCard, CheckRow,
  StepHeader, Divider, InfoBox, PageCard, SectionHeading,
  AddButton, ItemCard, ColourSwatch, PalettePreview,
  FontSelector, lightenHex,
} from '../wizard/WizardUI'
import { SOCIAL_OPTIONS } from '../../types'
import type { FaqItem, Testimonial } from '../../types'
import { useState, useRef } from 'react'

// ── Step 1: Starting point ─────────────────────────────────────────────────

export function DiyStep1() {
  const { data, update, currentStep, totalSteps } = useDiyWizard()
  const showExisting = data.startType === 'rebuild'

  return (
    <div>
      <StepHeader
        step={currentStep} total={totalSteps}
        title="Where are you starting from?"
        description="Tell us your current situation so we can tailor your brief."
      />
      <div className="flex flex-col gap-3">
        <OptionCard
          selected={data.startType === 'fresh'}
          onClick={() => update({ startType: 'fresh' })}
          icon="✦" title="Starting fresh"
          subtitle="I don't have a website yet"
        />
        <OptionCard
          selected={data.startType === 'rebuild'}
          onClick={() => update({ startType: 'rebuild' })}
          icon="⟳" title="Rebuilding or refreshing an existing site"
          subtitle="I have a site but want to rebuild it in Next.js"
        />
      </div>

      {showExisting && (
        <>
          <Divider />
          <div className="flex flex-col gap-4">
            <Field label="Current website URL">
              <Input type="url" value={data.existingUrl} onChange={e => update({ existingUrl: e.target.value })} placeholder="https://yoursite.com" />
            </Field>
            <Field label="What do you like about your current site?">
              <Textarea value={data.siteLike} onChange={e => update({ siteLike: e.target.value })} placeholder="Design, content, structure…" />
            </Field>
            <Field label="What would you like to change?">
              <Textarea value={data.siteDislike} onChange={e => update({ siteDislike: e.target.value })} placeholder="Speed, mobile layout, outdated design…" />
            </Field>
          </div>
        </>
      )}
    </div>
  )
}

// ── Step 2: Domain ─────────────────────────────────────────────────────────

export function DiyStep2() {
  const { data, update, currentStep, totalSteps } = useDiyWizard()

  return (
    <div>
      <StepHeader step={currentStep} total={totalSteps} title="Domain name" description="Your domain is your address on the internet." />
      <div className="flex flex-col gap-3">
        <OptionCard
          selected={data.domainStatus === 'have'}
          onClick={() => update({ domainStatus: 'have' })}
          icon="✔" title="I already have a domain"
          subtitle="I'll provide my existing domain details"
        />
        <OptionCard
          selected={data.domainStatus === 'new'}
          onClick={() => update({ domainStatus: 'new' })}
          icon="+" title="I need a new domain"
          subtitle="I need to purchase one"
        />
      </div>

      {data.domainStatus === 'have' && (
        <>
          <Divider />
          <div className="flex flex-col gap-4">
            <Field label="Your domain name">
              <Input value={data.domainName} onChange={e => update({ domainName: e.target.value })} placeholder="yourbusiness.com.au" />
            </Field>
            <Field label="Domain registrar" hint="(where it's registered)">
              <Input value={data.domainRegistrar} onChange={e => update({ domainRegistrar: e.target.value })} placeholder="GoDaddy, Namecheap, Crazy Domains…" />
            </Field>
          </div>
        </>
      )}

      {data.domainStatus === 'new' && (
        <>
          <Divider />
          <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-5 flex flex-col gap-3">
            <p className="text-sm text-slate-300 font-medium">Purchase a .com.au domain through Web F5</p>
            <p className="text-xs text-slate-400 leading-relaxed">
              We recommend getting your domain before you start building. A .com.au typically costs $25–$35/year.
              Once purchased, come back here and enter it above.
            </p>
            <a
              href="https://www.webf5.au/domain-names/domain-search/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 transition-colors w-fit"
            >
              Search for a domain →
            </a>
            <p className="text-xs text-slate-400 mt-1">
              Already have an idea? Enter it in the field above after purchase.
            </p>
            <Field label="Domain ideas (optional — jot them down)">
              <Input value={data.domainIdeas} onChange={e => update({ domainIdeas: e.target.value })} placeholder="e.g. smithelectrical, bendigoplumber…" />
            </Field>
          </div>
        </>
      )}
    </div>
  )
}

// ── Step 3: Business info ──────────────────────────────────────────────────

export function DiyStep3() {
  const { data, update, currentStep, totalSteps, stepErrors, clearError } = useDiyWizard()

  return (
    <div>
      <StepHeader step={currentStep} total={totalSteps} title="About your business" description="This shapes every part of the brief and the prompt Claude will receive." />
      <div className="flex flex-col gap-4">

        <p className="text-xs font-medium uppercase tracking-widest text-indigo-400">Your contact details</p>
        <Field label="Contact name" required>
          <Input value={data.contactName ?? ''} onChange={e => { update({ contactName: e.target.value }); clearError('contactName') }} placeholder="e.g. Josh Smith" error={stepErrors['contactName']} />
          {stepErrors['contactName'] && <p className="mt-1 text-xs text-red-400">{stepErrors['contactName']}</p>}
        </Field>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Business email" required>
            <Input type="email" value={data.bizEmail} onChange={e => { update({ bizEmail: e.target.value }); clearError('bizEmail') }} placeholder="hello@yourbusiness.com" error={stepErrors['bizEmail']} />
            {stepErrors['bizEmail'] && <p className="mt-1 text-xs text-red-400">{stepErrors['bizEmail']}</p>}
          </Field>
          <Field label="Business phone" required>
            <Input type="tel" value={data.bizPhone} onChange={e => { update({ bizPhone: e.target.value }); clearError('bizPhone') }} placeholder="+61 4xx xxx xxx" error={stepErrors['bizPhone']} />
            {stepErrors['bizPhone'] && <p className="mt-1 text-xs text-red-400">{stepErrors['bizPhone']}</p>}
          </Field>
        </div>

        <Divider />

        <AbnLookupField
          bizName={data.bizName}
          bizReg={data.bizReg}
          error={stepErrors['bizName']}
          onNameChange={v => { update({ bizName: v }); clearError('bizName') }}
          onRegChange={v => update({ bizReg: v })}
        />

        <div className="grid grid-cols-2 gap-4">
          <Field label="Business registration / ABN" hint="(auto-filled from lookup)">
            <Input value={data.bizReg} onChange={e => update({ bizReg: e.target.value })} placeholder="ABN, ACN…" />
          </Field>
          <Field label="Year established">
            <Input value={data.bizYear} onChange={e => update({ bizYear: e.target.value })} placeholder="e.g. 2018" />
          </Field>
        </div>

        <Field label="Tagline or slogan" hint="(optional)">
          <Input value={data.bizTagline} onChange={e => update({ bizTagline: e.target.value })} placeholder="e.g. Central Victoria's trusted electrician" />
        </Field>

        <Field label="What does your business do?">
          <Textarea value={data.bizDesc} onChange={e => update({ bizDesc: e.target.value })} placeholder="Describe your services in 2–3 sentences…" />
        </Field>

        <Field label="What makes you different from competitors?">
          <Textarea value={data.bizUsp} onChange={e => update({ bizUsp: e.target.value })} placeholder="Your unique selling proposition…" />
        </Field>

        <Field label="Key qualifications or licences" hint="(optional)">
          <Input value={data.bizQualifications} onChange={e => update({ bizQualifications: e.target.value })} placeholder="e.g. Licensed Electrician A-Grade, Builder's Licence…" />
        </Field>

        <Field label="Memberships / associations" hint="(optional)">
          <Input value={data.bizMemberships} onChange={e => update({ bizMemberships: e.target.value })} placeholder="e.g. Master Builders Association, NECA…" />
        </Field>

        <Field label="Guarantees or warranties" hint="(optional)">
          <Input value={data.bizGuarantees} onChange={e => update({ bizGuarantees: e.target.value })} placeholder="e.g. 12-month workmanship guarantee…" />
        </Field>

        <Field label="Business hours">
          <div className="flex flex-col gap-2">
            {[
              { label: 'Monday–Friday', field: 'bizHoursMF' as const, placeholder: '7:00am – 5:00pm' },
              { label: 'Saturday',      field: 'bizHoursSat' as const, placeholder: '8:00am – 12:00pm, or Closed' },
              { label: 'Sunday',        field: 'bizHoursSun' as const, placeholder: 'Closed' },
            ].map(row => (
              <div key={row.field} className="flex items-center gap-3">
                <span className="text-sm text-slate-400 w-32 flex-shrink-0">{row.label}</span>
                <Input value={data[row.field]} onChange={e => update({ [row.field]: e.target.value })} placeholder={row.placeholder} />
              </div>
            ))}
          </div>
        </Field>

      </div>
    </div>
  )
}

// ── Address autocomplete (reused in Step 4) ────────────────────────────────

interface NominatimResult {
  display_name: string; lat: string; lon: string
  address: { suburb?: string; town?: string; city?: string; village?: string; hamlet?: string; municipality?: string; [k: string]: string | undefined }
}

function AddressAutocomplete() {
  const { data, update } = useDiyWizard()
  const [query, setQuery]     = useState(data.bizAddress)
  const [results, setResults] = useState<NominatimResult[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen]       = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const search = async (q: string) => {
    if (q.trim().length < 4) { setResults([]); setOpen(false); return }
    setLoading(true)
    try {
      const res = await fetch(`/api/address/search?q=${encodeURIComponent(q)}`)
      const d = await res.json()
      setResults(d); setOpen(d.length > 0)
    } catch { setResults([]) } finally { setLoading(false) }
  }

  return (
    <div className="relative">
      <div className="relative">
        <Input
          value={query}
          onChange={e => {
            const val = e.target.value
            setQuery(val)
            update({ bizAddress: val, bizAddressLat: '', bizAddressLng: '', bizAddressTown: '' })
            if (timer.current) clearTimeout(timer.current)
            timer.current = setTimeout(() => search(val), 400)
          }}
          onBlur={() => setTimeout(() => setOpen(false), 200)}
          placeholder="Start typing your business address…"
        />
        {loading && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 animate-pulse">Searching…</span>}
      </div>
      {open && results.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-slate-800 border border-slate-700 rounded-lg overflow-hidden shadow-2xl">
          {results.map((r, i) => (
            <button key={i} type="button"
              onMouseDown={() => {
                const town = r.address.suburb || r.address.town || r.address.city || r.address.village || r.address.hamlet || r.address.municipality || ''
                setQuery(r.display_name); setOpen(false)
                update({ bizAddress: r.display_name, bizAddressLat: r.lat, bizAddressLng: r.lon, bizAddressTown: town })
              }}
              className="w-full text-left px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-700 border-b border-slate-800 last:border-0 transition-colors"
            >{r.display_name}</button>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Step 4: Location & service area ───────────────────────────────────────

export function DiyStep4() {
  const { data, update, currentStep, totalSteps, stepErrors, clearError } = useDiyWizard()
  const [fetchingTowns, setFetchingTowns] = useState(false)
  const [townsMsg, setTownsMsg] = useState<{ type: 'ok' | 'empty' | 'error'; text: string } | null>(null)
  const isLocal = data.serviceReach === 'local'
  const town = data.bizAddressTown || 'your area'

  const findTowns = async () => {
    if (!data.bizAddressLat || !data.bizAddressLng || !data.serviceRadiusKm) return
    setFetchingTowns(true); setTownsMsg(null)
    try {
      const res = await fetch(`/api/address/towns?lat=${data.bizAddressLat}&lng=${data.bizAddressLng}&km=${data.serviceRadiusKm}`)
      if (!res.ok) throw new Error(`Server error ${res.status}`)
      const towns = await res.json() as string[]
      if (towns.length === 0) {
        setTownsMsg({ type: 'empty', text: `No places found using ${data.serviceRadiusKm} km. Try a smaller or larger radius, or enter your service area manually below.` })
      } else {
        update({ serviceRadiusTowns: towns.join(', ') })
        setTownsMsg({ type: 'ok', text: `✓ ${towns.length} place${towns.length === 1 ? '' : 's'} found` })
        setTimeout(() => setTownsMsg(null), 3000)
      }
    } catch (err) {
      setTownsMsg({ type: 'error', text: `Could not reach the lookup service. Enter towns manually below.` })
      console.error(err)
    } finally { setFetchingTowns(false) }
  }

  return (
    <div>
      <StepHeader step={currentStep} total={totalSteps} title="Location & service area" description="Where do you operate? This drives your local SEO." />
      <div className="flex flex-col gap-4">

        <Field label="Business address" hint={isLocal ? undefined : '(leave blank if home-based or virtual)'} required={isLocal}>
          <AddressAutocomplete />
          {data.bizAddressTown && <p className="text-xs text-emerald-400 mt-1">✓ Suburb/town identified: <strong>{data.bizAddressTown}</strong></p>}
          {stepErrors['bizAddress'] && <p className="mt-1 text-xs text-red-400">{stepErrors['bizAddress']}</p>}
        </Field>

        <Field label="Service reach">
          <div className="flex flex-col gap-2">
            <OptionCard selected={data.serviceReach === 'local'}         onClick={() => { update({ serviceReach: 'local' }); clearError('bizAddress') }}         title="Local / regional" subtitle="Serving a specific area or city" />
            <OptionCard selected={data.serviceReach === 'national'}      onClick={() => update({ serviceReach: 'national' })}      title="National"     subtitle="Serving across the country" />
            <OptionCard selected={data.serviceReach === 'international'} onClick={() => update({ serviceReach: 'international' })} title="International" subtitle="Serving customers globally" />
          </div>
        </Field>

        {isLocal && (
          <div className="rounded-xl border border-slate-700 bg-slate-800/30 p-4 flex flex-col gap-4">
            {!data.bizAddressLat && <InfoBox>Enter your business address above first — we need it to calculate which towns fall within your service radius.</InfoBox>}
            {data.bizAddressLat && <p className="text-sm text-slate-300">How far from <strong className="text-white">{town}</strong> does your business service?</p>}

            <Field label="Service radius (km)">
              <div className="flex gap-2">
                <Input type="number" min="1" max="500" value={data.serviceRadiusKm} onChange={e => update({ serviceRadiusKm: e.target.value })} placeholder="e.g. 130" className="flex-1" />
                <button type="button" onClick={findTowns} disabled={fetchingTowns || !data.bizAddressLat || !data.serviceRadiusKm}
                  className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-40 whitespace-nowrap">
                  {fetchingTowns ? (
                    <>
                      <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Finding…
                    </>
                  ) : 'Find towns'}
                </button>
              </div>
              {townsMsg && <p className={`mt-1.5 text-xs ${townsMsg.type === 'ok' ? 'text-emerald-400' : townsMsg.type === 'empty' ? 'text-amber-400' : 'text-red-400'}`}>{townsMsg.text}</p>}
            </Field>

            <Field label="Service area">
              <Textarea value={data.serviceRadiusTowns} onChange={e => update({ serviceRadiusTowns: e.target.value })} rows={4} placeholder="Click 'Find towns' to auto-populate, or type manually — e.g. Seymour, Kilmore, Broadford…" />
              <p className="text-xs text-slate-400 mt-1">Edit down to the 20 most relevant areas for your business.</p>
            </Field>
          </div>
        )}

        <Field label="Do clients visit you, or do you visit clients?">
          <Select value={data.visitType} onChange={e => update({ visitType: e.target.value })}>
            <option value="">Select…</option>
            <option>Clients visit my premises</option>
            <option>I visit clients</option>
            <option>Both</option>
            <option>Fully remote / online</option>
          </Select>
        </Field>

      </div>
    </div>
  )
}

// ── Step 5: Digital presence ───────────────────────────────────────────────

export function DiyStep5() {
  const { data, update, toggleArray, currentStep, totalSteps } = useDiyWizard()

  return (
    <div>
      <StepHeader step={currentStep} total={totalSteps} title="Your digital presence" description="Tell us where you already exist online so your site can connect everything." />
      <div className="flex flex-col gap-4">

        <Field label="Google Business Profile">
          <Select value={data.googleBusiness} onChange={e => update({ googleBusiness: e.target.value })}>
            <option value="">Select…</option>
            <option>Yes, I have one</option>
            <option>No, I'd like one set up</option>
            <option>Not sure</option>
          </Select>
        </Field>

        <Field label="Social media accounts" hint="(select all that apply — add your profile URL)">
          <div className="flex flex-col gap-2">
            {SOCIAL_OPTIONS.map(s => (
              <div key={s}>
                <CheckRow checked={data.socialMedia.includes(s)} onChange={() => toggleArray('socialMedia', s)} label={s} />
                {data.socialMedia.includes(s) && (
                  <div className="ml-7 mt-1.5 mb-1">
                    <Input
                      type="url"
                      value={data.socialMediaUrls?.[s] ?? ''}
                      onChange={e => update({ socialMediaUrls: { ...data.socialMediaUrls, [s]: e.target.value } })}
                      placeholder={`Your ${s} profile URL`}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </Field>

      </div>
    </div>
  )
}

// ── Shared palette / font data ─────────────────────────────────────────────

interface Palette { name: string; brandPrimary: string; brandLightBg: string; brandDarkBg: string; brandBtnPrimary: string; brandAccent: string; brandDarkText: string }

const STYLE_PALETTES: Record<string, Palette[]> = {
  'Modern & minimal': [
    { name: 'Summer Ocean Breeze',   brandPrimary: '#457b9d', brandLightBg: '#f1faee', brandDarkBg: '#1d3557', brandBtnPrimary: '#457b9d', brandAccent: '#e63946', brandDarkText: '#1d3557' },
    { name: 'Black & Gold Elegance', brandPrimary: '#fca311', brandLightBg: '#e5e5e5', brandDarkBg: '#000000', brandBtnPrimary: '#fca311', brandAccent: '#14213d', brandDarkText: '#14213d' },
    { name: 'Deep Sea',              brandPrimary: '#415a77', brandLightBg: '#e0e1dd', brandDarkBg: '#0d1b2a', brandBtnPrimary: '#415a77', brandAccent: '#778da9', brandDarkText: '#1b263b' },
  ],
  'Bold & vibrant': [
    { name: 'Refreshing Summer Fun', brandPrimary: '#219ebc', brandLightBg: '#8ecae6', brandDarkBg: '#023047', brandBtnPrimary: '#fb8500', brandAccent: '#ffb703', brandDarkText: '#023047' },
    { name: 'Warm Autumn Glow',      brandPrimary: '#d62828', brandLightBg: '#eae2b7', brandDarkBg: '#003049', brandBtnPrimary: '#f77f00', brandAccent: '#fcbf49', brandDarkText: '#003049' },
  ],
  'Corporate & professional': [
    { name: 'Ocean Breeze',      brandPrimary: '#58a4b0', brandLightBg: '#d8dbe2', brandDarkBg: '#1b1b1e', brandBtnPrimary: '#58a4b0', brandAccent: '#373f51', brandDarkText: '#1b1b1e' },
    { name: 'Gentle Sea Breeze', brandPrimary: '#1f7a8c', brandLightBg: '#e1e5f2', brandDarkBg: '#022b3a', brandBtnPrimary: '#1f7a8c', brandAccent: '#bfdbf7', brandDarkText: '#022b3a' },
  ],
  'Warm & friendly': [
    { name: 'Earthy Warmth',        brandPrimary: '#cb997e', brandLightBg: '#ffe8d6', brandDarkBg: '#6b705c', brandBtnPrimary: '#cb997e', brandAccent: '#a5a58d', brandDarkText: '#6b705c' },
    { name: 'Golden Summer Fields', brandPrimary: '#d4a373', brandLightBg: '#fefae0', brandDarkBg: '#5c4a2a', brandBtnPrimary: '#d4a373', brandAccent: '#ccd5ae', brandDarkText: '#5c4a2a' },
  ],
  'Industrial & technical': [
    { name: 'Industrial Blue', brandPrimary: '#1985a1', brandLightBg: '#dcdcdd', brandDarkBg: '#46494c', brandBtnPrimary: '#1985a1', brandAccent: '#4c5c68', brandDarkText: '#46494c' },
    { name: 'Silent Waters',   brandPrimary: '#5c6b73', brandLightBg: '#e0fbfc', brandDarkBg: '#253237', brandBtnPrimary: '#5c6b73', brandAccent: '#9db4c0', brandDarkText: '#253237' },
  ],
}

const FONT_SUGGESTIONS: Record<string, { display: string; body: string }> = {
  'Modern & minimal':         { display: 'Space Grotesk',    body: 'DM Sans' },
  'Bold & vibrant':           { display: 'Oswald',           body: 'Nunito' },
  'Corporate & professional': { display: 'Montserrat',       body: 'Open Sans' },
  'Warm & friendly':          { display: 'Nunito',           body: 'Lato' },
  'Industrial & technical':   { display: 'Barlow Condensed', body: 'Barlow' },
}

// ── Step 6: Design ────────────────────────────────────────────────────────

export function DiyStep6() {
  const { data, update, currentStep, totalSteps } = useDiyWizard()
  const fontSuggestion = FONT_SUGGESTIONS[data.designStyle]
  const paletteColours = [
    { label: 'Primary',   value: data.brandPrimary },
    { label: 'Light Bg',  value: data.brandLightBg },
    { label: 'Dark Bg',   value: data.brandDarkBg },
    { label: 'Btn',       value: data.brandBtnPrimary },
    { label: 'Btn Hover', value: data.brandBtnHover },
    { label: 'Accent',    value: data.brandAccent },
    { label: 'Acc Hover', value: data.brandAccentHover },
    { label: 'Dark Text', value: data.brandDarkText },
  ]

  return (
    <div>
      <StepHeader step={currentStep} total={totalSteps} title="Branding & design" description="Your colour palette and typography will be passed directly to Claude. You can attach your logo later inside Claude." />
      <div className="flex flex-col gap-5">

        <InfoBox>
          <strong>Logo tip:</strong> You can attach your logo directly in Claude when you paste the prompt. Use the + symbol at the bottom-left of the Claude chat box.
        </InfoBox>

        <Field label="Design style preference">
          <Select value={data.designStyle} onChange={e => update({ designStyle: e.target.value })}>
            <option value="">Select…</option>
            {Object.keys(FONT_SUGGESTIONS).map(s => <option key={s}>{s}</option>)}
            <option>Not sure — I'd like suggestions</option>
          </Select>
        </Field>

        {STYLE_PALETTES[data.designStyle] && (
          <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-4 flex flex-col gap-3">
            <p className="text-xs font-medium uppercase tracking-widest text-indigo-400">Suggested palettes</p>
            <p className="text-xs text-slate-400 -mt-1">Choose a starting point — fine-tune any colour below.</p>
            {STYLE_PALETTES[data.designStyle].map(palette => {
              const isApplied = data.brandPrimary === palette.brandPrimary && data.brandDarkBg === palette.brandDarkBg
              const swatches = [
                { hex: palette.brandPrimary, title: 'Primary' }, { hex: palette.brandLightBg, title: 'Light Bg' },
                { hex: palette.brandDarkBg,  title: 'Dark Bg' }, { hex: palette.brandBtnPrimary, title: 'Button' },
                { hex: palette.brandAccent,  title: 'Accent' },  { hex: palette.brandDarkText, title: 'Text' },
              ]
              return (
                <div key={palette.name} className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-300">{palette.name}</span>
                    <button type="button" onClick={() => update({
                      brandPrimary: palette.brandPrimary, brandLightBg: palette.brandLightBg, brandDarkBg: palette.brandDarkBg,
                      brandBtnPrimary: palette.brandBtnPrimary, brandBtnHover: lightenHex(palette.brandBtnPrimary, 15),
                      brandAccent: palette.brandAccent, brandAccentHover: lightenHex(palette.brandAccent, 15), brandDarkText: palette.brandDarkText,
                    })} className={`rounded-md px-3 py-1 text-xs font-medium transition-all ${isApplied ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-700 text-slate-200 hover:bg-indigo-600 hover:text-white border border-slate-600'}`}>
                      {isApplied ? '✓ Applied' : 'Apply'}
                    </button>
                  </div>
                  <div className="flex h-8 w-full overflow-hidden rounded-lg border border-slate-700/60">
                    {swatches.map((s, i) => <div key={i} className="flex-1 h-full" style={{ backgroundColor: s.hex }} title={`${s.title}: ${s.hex}`} />)}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        <Divider />

        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-indigo-400 mb-1">Brand colours</p>
          <p className="text-xs text-slate-400 mb-4">Click any colour dot to open the picker, or type a hex code directly.</p>
          <div className="flex flex-col gap-0 divide-y divide-slate-800/60">
            <ColourSwatch label="Primary colour"    hint="Main brand colour — headings, highlights"       value={data.brandPrimary}    onChange={hex => update({ brandPrimary: hex })} />
            <ColourSwatch label="Light background"  hint="Light page background — secondary sections"    value={data.brandLightBg}    onChange={hex => update({ brandLightBg: hex })} />
            <ColourSwatch label="Dark background"   hint="Dark page sections, footer background"         value={data.brandDarkBg}     onChange={hex => update({ brandDarkBg: hex })} />
            <ColourSwatch label="Dark text"         hint="Body text on light backgrounds"                value={data.brandDarkText}   onChange={hex => update({ brandDarkText: hex })} />
          </div>
        </div>

        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-indigo-400 mb-1">Button colours</p>
          <div className="flex flex-col gap-0 divide-y divide-slate-800/60">
            <ColourSwatch label="Primary button"       hint="CTA button background"          value={data.brandBtnPrimary}  onChange={hex => update({ brandBtnPrimary: hex, brandBtnHover: lightenHex(hex, 15) })} />
            <ColourSwatch label="Primary button hover" hint="Auto-suggested — 15% lighter"  value={data.brandBtnHover}    onChange={hex => update({ brandBtnHover: hex })} autoNote="Auto-suggested from primary button" />
            <ColourSwatch label="Accent colour"        hint="Secondary CTA button"           value={data.brandAccent}      onChange={hex => update({ brandAccent: hex, brandAccentHover: lightenHex(hex, 15) })} />
            <ColourSwatch label="Accent hover"         hint="Auto-suggested — 15% lighter"  value={data.brandAccentHover} onChange={hex => update({ brandAccentHover: hex })} autoNote="Auto-suggested from accent colour" />
          </div>
        </div>

        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-slate-400 mb-2">Your palette</p>
          <PalettePreview colours={paletteColours} />
        </div>

        <Divider />

        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-indigo-400 mb-1">Typography</p>
          {fontSuggestion && <p className="text-xs text-slate-400 mb-4">Based on <strong className="text-slate-300">{data.designStyle}</strong>, we suggest <strong className="text-slate-300">{fontSuggestion.display}</strong> + <strong className="text-slate-300">{fontSuggestion.body}</strong>.</p>}
        </div>

        <FontSelector label="Display font" hint="For headings" value={data.displayFont} onChange={font => update({ displayFont: font })} suggested={fontSuggestion?.display} />
        <FontSelector label="Body font"    hint="For body copy" value={data.bodyFont}    onChange={font => update({ bodyFont: font })}    suggested={fontSuggestion?.body} />

        <Divider />

        <Field label="Websites you love" hint="(and why)">
          <Textarea value={data.sitesLove} onChange={e => update({ sitesLove: e.target.value })} placeholder="URL — what you like about it…" />
        </Field>

      </div>
    </div>
  )
}

// ── Step 7: Pages ─────────────────────────────────────────────────────────

const DIY_PAGES = [
  { value: 'home',         label: 'Home' },
  { value: 'about',        label: 'About Us' },
  { value: 'services',     label: 'Services' },
  { value: 'gallery',      label: 'Portfolio / Gallery' },
  { value: 'faq',          label: 'FAQ' },
  { value: 'testimonials', label: 'Testimonials / Reviews' },
  { value: 'contact',      label: 'Contact' },
  { value: 'careers',      label: 'Careers' },
]

export function DiyStep7() {
  const { data, update, toggleArray, currentStep, totalSteps } = useDiyWizard()

  function updItem<T>(arr: T[], idx: number, patch: Partial<T>): T[] { return arr.map((item, i) => i === idx ? { ...item, ...patch } : item) }
  function delItem<T>(arr: T[], idx: number): T[] { return arr.filter((_, i) => i !== idx) }

  const renderPageContent = (pageValue: string) => {
    switch (pageValue) {
      case 'home':
        return (
          <PageCard>
            <SectionHeading>Home page content</SectionHeading>
            <p className="text-xs text-slate-400">You can attach hero images directly in Claude when you paste the prompt. Label them clearly (e.g. "hero-1.jpg") so Claude knows where they should go.</p>
          </PageCard>
        )

      case 'about':
        return (
          <PageCard>
            <SectionHeading>About Us content</SectionHeading>
            <Field label="About us description" hint="(1–2 sentences)">
              <Textarea value={data.aboutDesc} onChange={e => update({ aboutDesc: e.target.value })} placeholder="Your business story, values, or what drives you…" />
            </Field>
            <p className="text-xs text-slate-400">You can attach a team photo directly in Claude. Label it "about-image.jpg".</p>
          </PageCard>
        )

      case 'services':
        return (
          <PageCard>
            <SectionHeading>Services</SectionHeading>
            {data.pageServices.length === 0 && <p className="text-xs text-slate-400">Add each service you offer.</p>}
            {data.pageServices.map((svc, idx) => (
              <ItemCard key={idx} label={`Service ${idx + 1}`} onRemove={() => update({ pageServices: delItem(data.pageServices, idx) })}>
                <Field label="Service name" required>
                  <Input value={svc.name} onChange={e => update({ pageServices: updItem(data.pageServices, idx, { name: e.target.value }) })} placeholder="e.g. Residential Electrical" />
                </Field>
                <Field label="Brief description">
                  <Textarea rows={2} value={svc.desc} onChange={e => update({ pageServices: updItem(data.pageServices, idx, { desc: e.target.value }) })} placeholder="What this service includes…" />
                </Field>
              </ItemCard>
            ))}
            <AddButton onClick={() => update({ pageServices: [...data.pageServices, { name: '', desc: '', imageUrl: '', imageName: '' }] })} label="Add service" />
          </PageCard>
        )

      case 'gallery':
        return (
          <PageCard>
            <SectionHeading>Portfolio / Gallery</SectionHeading>
            <p className="text-xs text-slate-400">You can attach portfolio photos directly in Claude. Label them clearly (e.g. "gallery-job-1.jpg") so Claude knows where they should go.</p>
            {data.pageGallery.length === 0 && <p className="text-xs text-slate-400 mt-1">Add gallery item names here if you'd like them included in the brief.</p>}
            {data.pageGallery.map((item, idx) => (
              <ItemCard key={idx} label={`Item ${idx + 1}`} onRemove={() => update({ pageGallery: delItem(data.pageGallery, idx) })}>
                <Field label="Project name">
                  <Input value={item.name} onChange={e => update({ pageGallery: updItem(data.pageGallery, idx, { name: e.target.value }) })} placeholder="e.g. Office Fitout — Bendigo" />
                </Field>
              </ItemCard>
            ))}
            <AddButton onClick={() => update({ pageGallery: [...data.pageGallery, { name: '', desc: '', imageUrl: '', imageName: '' }] })} label="Add item" />
          </PageCard>
        )

      case 'faq':
        return (
          <PageCard>
            <SectionHeading>FAQ</SectionHeading>
            {data.faqItems.length === 0 && <p className="text-xs text-slate-400">Add your most common customer questions.</p>}
            {data.faqItems.map((item, idx) => (
              <ItemCard key={idx} label={`FAQ ${idx + 1}`} onRemove={() => update({ faqItems: delItem(data.faqItems, idx) })}>
                <Field label="Question"><Input value={item.question} onChange={e => update({ faqItems: updItem(data.faqItems, idx, { question: e.target.value }) })} placeholder="e.g. Do you offer free quotes?" /></Field>
                <Field label="Answer"><Textarea rows={2} value={item.answer} onChange={e => update({ faqItems: updItem(data.faqItems, idx, { answer: e.target.value }) })} placeholder="Your answer…" /></Field>
              </ItemCard>
            ))}
            <AddButton onClick={() => update({ faqItems: [...data.faqItems, { question: '', answer: '' }] })} label="Add FAQ" />
          </PageCard>
        )

      case 'testimonials':
        return (
          <PageCard>
            <SectionHeading>Testimonials / Reviews</SectionHeading>
            {data.testimonials.length === 0 && <p className="text-xs text-slate-400">Add 2–3 real reviews from Google, Facebook, or word-of-mouth.</p>}
            {data.testimonials.map((t, idx) => (
              <ItemCard key={idx} label={`Review ${idx + 1}`} onRemove={() => update({ testimonials: delItem(data.testimonials, idx) })}>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Customer name"><Input value={t.name} onChange={e => update({ testimonials: updItem(data.testimonials, idx, { name: e.target.value }) })} placeholder="e.g. Sarah M." /></Field>
                  <Field label="Stars (1–5)">
                    <Select value={String(t.stars)} onChange={e => update({ testimonials: updItem(data.testimonials, idx, { stars: Number(e.target.value) }) })}>
                      {[5,4,3,2,1].map(n => <option key={n} value={n}>{n} stars</option>)}
                    </Select>
                  </Field>
                </div>
                <Field label="Review text"><Textarea rows={2} value={t.review} onChange={e => update({ testimonials: updItem(data.testimonials, idx, { review: e.target.value }) })} placeholder="What did they say?" /></Field>
              </ItemCard>
            ))}
            <AddButton onClick={() => update({ testimonials: [...data.testimonials, { name: '', review: '', stars: 5 }] })} label="Add review" />
          </PageCard>
        )

      case 'contact':
        return (
          <PageCard>
            <SectionHeading>Contact page</SectionHeading>
            <p className="text-xs text-slate-400">A contact form with Name, Phone, Suburb, and Message will be included automatically. Your Formspree URL will be added when you paste the prompt into Claude.</p>
          </PageCard>
        )

      case 'careers':
        return (
          <PageCard>
            <SectionHeading>Careers</SectionHeading>
            <Field label="Careers page heading" hint="(optional)">
              <Input value={data.careersTitle} onChange={e => update({ careersTitle: e.target.value })} placeholder="e.g. Join our team" />
            </Field>
            <Field label="Description" hint="(optional)">
              <Textarea rows={2} value={data.careersDesc} onChange={e => update({ careersDesc: e.target.value })} placeholder="What you're looking for…" />
            </Field>
          </PageCard>
        )

      default: return null
    }
  }

  return (
    <div>
      <StepHeader step={currentStep} total={totalSteps} title="Pages & content" description="Select the pages you need and add content for each one." />
      <div className="flex flex-col gap-5">

        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-indigo-400 mb-3">Select your pages</p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {DIY_PAGES.map(p => {
              const isSelected = data.pages.includes(p.value)
              const isRequired = p.value === 'home' || p.value === 'contact'
              return (
                <button key={p.value} type="button"
                  disabled={isRequired}
                  onClick={() => !isRequired && toggleArray('pages', p.value)}
                  className={`rounded-xl border px-4 py-3 text-left text-sm font-medium transition-all ${
                    isSelected ? 'border-indigo-500 bg-indigo-500/10 text-indigo-200' : 'border-slate-700 bg-slate-800/40 text-slate-300 hover:border-slate-500'
                  } ${isRequired ? 'opacity-60 cursor-default' : 'cursor-pointer'}`}
                >
                  {p.label}
                  {isRequired && <span className="block text-xs font-normal text-slate-500 mt-0.5">Required</span>}
                </button>
              )
            })}
          </div>
        </div>

        {data.pages.filter(p => DIY_PAGES.some(dp => dp.value === p)).map(pageValue => (
          <div key={pageValue}>{renderPageContent(pageValue)}</div>
        ))}

      </div>
    </div>
  )
}

// ── Step 8: Review & send ─────────────────────────────────────────────────

export function DiyStep8() {
  const { data, currentStep, totalSteps, setIsSubmitted } = useDiyWizard()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const prompt = buildDiyPrompt(data)

  const handleSubmit = async () => {
    if (!data.bizEmail?.trim()) { setError('Please go back and add your email address (Step 3).'); return }
    setSubmitting(true); setError(null)
    try {
      const res = await fetch('/api/diy-brief', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const json = await res.json()
      if (!res.ok) { setError(json.error ?? 'Something went wrong. Please try again.'); setSubmitting(false); return }
      setIsSubmitted(true)
    } catch {
      setError('Something went wrong. Please try again or email us at contact@webf5.au')
      setSubmitting(false)
    }
  }

  return (
    <div>
      <StepHeader step={currentStep} total={totalSteps} title="Your Claude prompt is ready" description="Copy this and paste it into a new Claude Code conversation. Attach your logo and any images before you send." />
      <div className="flex flex-col gap-5">

        <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-4 flex flex-col gap-2">
          <p className="text-sm font-semibold text-indigo-300">How to use this prompt</p>
          <ol className="text-xs text-slate-400 leading-relaxed list-decimal ml-4 flex flex-col gap-1">
            <li>Open <strong className="text-slate-300">claude.ai</strong> and start a new <strong className="text-slate-300">Claude Code</strong> conversation — click the <strong className="text-slate-300">&lt;/&gt;</strong> symbol at the top left of the page.</li>
            <li>Click the <strong className="text-slate-300">+</strong> symbol (bottom left of the chat box) to attach your logo and any photos. Label them clearly — e.g. <em>logo.png</em>, <em>hero-1.jpg</em>, <em>gallery-job-1.jpg</em>.</li>
            <li>Copy the prompt below and paste it into the chat box. Fill in your Formspree URL where indicated.</li>
            <li>Send it and Claude will write your complete site.</li>
          </ol>
        </div>

        <div className="bg-[#090B14] rounded-xl overflow-hidden border border-slate-700/50">
          <div className="flex items-center px-4 py-2.5 border-b border-white/8">
            <span className="text-xs text-white/40">Review your brief</span>
          </div>
          <pre className="text-xs text-slate-300 p-4 overflow-x-auto whitespace-pre-wrap leading-relaxed font-mono max-h-64 overflow-y-auto">{prompt}</pre>
        </div>

        <Divider />

        <div>
          {error && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 mb-4">
              <p className="text-sm text-red-300">{error}</p>
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full rounded-xl bg-indigo-600 px-6 py-4 text-base font-semibold text-white transition-all hover:bg-indigo-500 active:scale-[0.98] disabled:opacity-50"
          >
            {submitting ? 'Sending…' : 'Email me a copy of my brief →'}
          </button>
          <p className="text-xs text-slate-400 text-center mt-2">
            A copy will be sent to <strong className="text-slate-300">{data.bizEmail || 'your email'}</strong>
          </p>
        </div>

      </div>
    </div>
  )
}

// ── ABN lookup (same pattern as main wizard) ───────────────────────────────

interface AbnLookupFieldProps {
  bizName: string; bizReg: string; error?: string
  onNameChange: (v: string) => void; onRegChange: (v: string) => void
}

function AbnLookupField({ bizName, bizReg: _bizReg, error, onNameChange, onRegChange }: AbnLookupFieldProps) {
  const [suggestions, setSuggestions] = useState<{ abn: string; name: string; state: string; postcode: string }[]>([])
  const [loading, setLoading]         = useState(false)
  const [open, setOpen]               = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  function handleChange(v: string) {
    onNameChange(v)
    setSuggestions([]); setOpen(false)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (v.trim().length < 3) return
    debounceRef.current = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/abn-lookup?name=${encodeURIComponent(v.trim())}`)
        const data = await res.json()
        if (data.results?.length > 0) { setSuggestions(data.results); setOpen(true) }
      } catch { /* silent */ } finally { setLoading(false) }
    }, 600)
  }

  return (
    <Field label="Business name" required>
      <div style={{ position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Input value={bizName} onChange={e => handleChange(e.target.value)} onBlur={() => setTimeout(() => setOpen(false), 200)} placeholder="e.g. Acme Electrical" error={error} />
          {loading && <span style={{ fontSize: '0.72rem', color: '#6366f1', whiteSpace: 'nowrap', flexShrink: 0 }}>Looking up ABN…</span>}
        </div>
        {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
        {open && suggestions.length > 0 && (
          <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 50, background: '#1e293b', border: '1px solid #334155', borderRadius: 10, marginTop: 4, overflow: 'hidden', boxShadow: '0 8px 24px rgba(0,0,0,0.4)' }}>
            {suggestions.map(s => (
              <button key={s.abn} type="button" onMouseDown={() => { onNameChange(s.name); onRegChange(s.abn); setSuggestions([]); setOpen(false) }}
                style={{ display: 'block', width: '100%', textAlign: 'left', padding: '10px 14px', background: 'transparent', border: 'none', cursor: 'pointer', borderBottom: '1px solid #334155' }}
                onMouseEnter={e => (e.currentTarget.style.background = '#334155')} onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                <span style={{ display: 'block', fontSize: '0.85rem', color: '#e2e8f0', fontWeight: 500 }}>{s.name}</span>
                <span style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginTop: 2 }}>ABN {s.abn.replace(/(\d{2})(\d{3})(\d{3})(\d{3})/, '$1 $2 $3 $4')} · {s.state} {s.postcode}</span>
              </button>
            ))}
            <button type="button" onMouseDown={() => setOpen(false)}
              style={{ display: 'block', width: '100%', textAlign: 'left', padding: '8px 14px', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '0.75rem', color: '#64748b' }}>
              None of these — I&apos;ll type it manually
            </button>
          </div>
        )}
      </div>
    </Field>
  )
}
