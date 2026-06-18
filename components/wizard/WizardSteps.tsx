'use client'

import { useWizard } from './WizardContext'
import {
  Field, Input, Textarea, Select, OptionCard, CheckRow,
  AddOnRow, UploadZone, InfoBox, StepHeader, Divider,
  SectionHeading, PageCard, AddButton, ItemCard,
  ColourSwatch, PalettePreview, FontSelector, lightenHex,
} from './WizardUI'
import { ADD_ONS, SOCIAL_OPTIONS, PAGE_OPTIONS, FEATURE_OPTIONS } from '../../types'
import type { PageService, GalleryItem, TeamMember, FaqItem, Testimonial, ContactField } from '../../types'
import { useState, useRef } from 'react'

// ── Step 1: Starting point ─────────────────────────────────────────────────

export function Step1() {
  const { data, update, currentStep, totalSteps } = useWizard()
  const showExisting = data.startType === 'rebuild' || data.startType === 'refresh'

  return (
    <div>
      <StepHeader
        step={currentStep}
        total={totalSteps}
        title="Let's understand where you're starting from."
        description="Tell us about your current situation so we can tailor this process for you."
      />
      <div className="flex flex-col gap-3">
        <OptionCard selected={data.startType === 'fresh'}   onClick={() => update({ startType: 'fresh' })}   icon="✦" title="Starting fresh"                subtitle="I don't have a website yet" />
        <OptionCard selected={data.startType === 'rebuild'} onClick={() => update({ startType: 'rebuild' })} icon="⟳" title="Rebuilding an existing site"   subtitle="I have a site but want a new one" />
        <OptionCard selected={data.startType === 'refresh'} onClick={() => update({ startType: 'refresh' })} icon="✎" title="Refreshing my current site"     subtitle="I want to update or improve what I have" />
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

export function Step2() {
  const { data, update, currentStep, totalSteps } = useWizard()
  const [checking, setChecking] = useState(false)
  const [results, setResults] = useState<{ tld: string; domain: string; available: boolean; price?: number }[]>([])
  const [searched, setSearched] = useState(false)

  const tlds = ['.com.au', '.net.au', '.com', '.net', '.co', '.io']

  const checkAvailability = async () => {
    if (!data.domainIdeas.trim()) return
    setChecking(true)
    setSearched(false)
    setResults([])
    update({ domainName: '', domainExtension: '' })

    try {
      const checks = await Promise.all(
        tlds.map(async tld => {
          const res = await fetch(`/api/domains/check?domain=${encodeURIComponent(data.domainIdeas.trim())}&tld=${encodeURIComponent(tld)}`)
          const json = await res.json()
          const domainResult = Array.isArray(json.data) ? json.data[0] : json.data
          const wholesale = domainResult?.register_price
          return {
            tld,
            domain: domainResult?.domain_name ?? `${data.domainIdeas.trim()}${tld}`,
            available: domainResult?.is_available === true,
            price: wholesale ? Math.ceil(wholesale * 1.2) : undefined,
          }
        })
      )
      setResults(checks)
    } catch {
      setResults([])
    } finally {
      setChecking(false)
      setSearched(true)
    }
  }

  const selectedDomain = data.domainName

  return (
    <div>
      <StepHeader step={currentStep} total={totalSteps} title="Domain name" description="Your domain is your address on the internet. Let's work out where you're at." />
      <div className="flex flex-col gap-3">
        <OptionCard selected={data.domainStatus === 'have'}   onClick={() => update({ domainStatus: 'have' })}   icon="✔" title="I already have a domain"  subtitle="I'll provide my existing domain details" />
        <OptionCard selected={data.domainStatus === 'new'}    onClick={() => update({ domainStatus: 'new' })}    icon="+" title="I need a new domain"        subtitle="Help me find and register one" />
        <OptionCard selected={data.domainStatus === 'unsure'} onClick={() => update({ domainStatus: 'unsure' })} icon="?" title="Not sure yet"               subtitle="I'd like advice on this" />
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
          <div className="flex flex-col gap-4">
            <Field label="What name would you like to search for?">
              <div className="flex gap-2">
                <Input
                  value={data.domainIdeas}
                  onChange={e => update({ domainIdeas: e.target.value })}
                  placeholder="yourbusiness"
                  className="flex-1"
                  onKeyDown={e => e.key === 'Enter' && checkAvailability()}
                />
                <button
                  type="button"
                  onClick={checkAvailability}
                  disabled={checking || !data.domainIdeas.trim()}
                  className="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition-all hover:bg-indigo-500 disabled:opacity-40"
                >
                  {checking ? 'Checking…' : 'Check'}
                </button>
              </div>
            </Field>

            {checking && (
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <span className="animate-spin inline-block">⟳</span>
                Checking availability across extensions…
              </div>
            )}

            {searched && results.length > 0 && (
              <>
                <p className="text-xs text-slate-500">
                  {results.filter(r => r.available).length > 0 ? 'Select your preferred domain to continue.' : 'No available domains found. Try a different name.'}
                </p>
                <div className="flex flex-col gap-2">
                  {results.map(r => (
                    <button
                      key={r.tld}
                      type="button"
                      disabled={!r.available}
                      onClick={() => r.available && update({ domainName: r.domain, domainExtension: r.tld })}
                      className={`flex items-center justify-between rounded-lg border px-4 py-3 text-left transition-all duration-150 ${
                        !r.available
                          ? 'cursor-not-allowed border-slate-800 bg-slate-900/40 opacity-50'
                          : selectedDomain === r.domain
                          ? 'border-indigo-500 bg-indigo-500/10 ring-1 ring-indigo-500/30'
                          : 'border-slate-700 bg-slate-800/40 hover:border-slate-500 cursor-pointer'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {r.available && (
                          <span className={`flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full border text-xs transition-colors ${selectedDomain === r.domain ? 'border-indigo-500 bg-indigo-500 text-white' : 'border-slate-600'}`}>
                            {selectedDomain === r.domain ? '✓' : ''}
                          </span>
                        )}
                        <span className={`font-medium text-sm ${selectedDomain === r.domain ? 'text-indigo-200' : 'text-white'}`}>{r.domain}</span>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        {r.available && r.price && <span className={`text-xs ${selectedDomain === r.domain ? 'text-indigo-400' : 'text-slate-400'}`}>${r.price.toFixed(2)}/yr</span>}
                        {r.available ? <span className="text-xs font-medium text-emerald-400">Available</span> : <span className="text-xs text-slate-600">Taken</span>}
                      </div>
                    </button>
                  ))}
                </div>
                {selectedDomain && (
                  <div className="rounded-lg border border-indigo-500/30 bg-indigo-500/5 px-4 py-3">
                    <p className="text-sm text-indigo-300">Selected: <span className="font-semibold text-white">{selectedDomain}</span></p>
                    <p className="mt-0.5 text-xs text-slate-500">Click Continue to proceed with this domain.</p>
                  </div>
                )}
              </>
            )}

            {searched && results.length === 0 && <InfoBox>Could not retrieve results. Please try again.</InfoBox>}
          </div>
        </>
      )}
    </div>
  )
}

// ── Step 3: Business info ──────────────────────────────────────────────────

export function Step3() {
  const { data, update, currentStep, totalSteps, stepErrors, clearError } = useWizard()

  return (
    <div>
      <StepHeader
        step={currentStep}
        total={totalSteps}
        title="About your business"
        description="Help us understand what makes your business unique. This shapes every design and copy decision."
      />
      <div className="flex flex-col gap-4">

        <p className="text-xs font-medium uppercase tracking-widest text-indigo-400">Your contact details</p>
        <p className="text-xs text-slate-500 -mt-2">So we can follow up with your quote. These stay private.</p>

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

        <Field label="Business name" required>
          <Input value={data.bizName} onChange={e => { update({ bizName: e.target.value }); clearError('bizName') }} placeholder="e.g. Acme Solutions" error={stepErrors['bizName']} />
          {stepErrors['bizName'] && <p className="mt-1 text-xs text-red-400">{stepErrors['bizName']}</p>}
        </Field>

        <Field label="Tagline or slogan" hint="(optional)">
          <Input value={data.bizTagline} onChange={e => update({ bizTagline: e.target.value })} placeholder="e.g. Building tomorrow, today" />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Business registration" hint="(optional)">
            <Input value={data.bizReg} onChange={e => update({ bizReg: e.target.value })} placeholder="ABN, ACN…" />
          </Field>
          <Field label="Year established">
            <Input value={data.bizYear} onChange={e => update({ bizYear: e.target.value })} placeholder="e.g. 2018" />
          </Field>
        </div>

        <Field label="What does your business do?" hint="(elevator pitch)">
          <Textarea value={data.bizDesc} onChange={e => update({ bizDesc: e.target.value })} placeholder="Describe your product or service in 2–3 sentences…" />
        </Field>

        <Field label="Business hours">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <span className="text-sm text-slate-400 w-32 flex-shrink-0">Monday–Friday</span>
              <Input value={data.bizHoursMF} onChange={e => update({ bizHoursMF: e.target.value })} placeholder="e.g. 7:00am – 5:00pm" />
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-slate-400 w-32 flex-shrink-0">Saturday</span>
              <Input value={data.bizHoursSat} onChange={e => update({ bizHoursSat: e.target.value })} placeholder="e.g. 8:00am – 12:00pm, or Closed" />
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-slate-400 w-32 flex-shrink-0">Sunday</span>
              <Input value={data.bizHoursSun} onChange={e => update({ bizHoursSun: e.target.value })} placeholder="e.g. Closed" />
            </div>
          </div>
        </Field>

        <Divider />

        <Field label="What makes you different from competitors?">
          <Textarea value={data.bizUsp} onChange={e => update({ bizUsp: e.target.value })} placeholder="Your unique selling proposition…" />
        </Field>

        <Field label="Who is your ideal customer?">
          <Textarea value={data.bizAudience} onChange={e => update({ bizAudience: e.target.value })} placeholder="e.g. Small business owners aged 30–50 in regional Victoria who need…" />
        </Field>

        <Field label="Key qualifications or licences" hint="(optional)">
          <Input value={data.bizQualifications} onChange={e => update({ bizQualifications: e.target.value })} placeholder="e.g. Licensed Electrician A-Grade, Builder's Licence…" />
        </Field>

        <Field label="Memberships / associations" hint="(optional)">
          <Input value={data.bizMemberships} onChange={e => update({ bizMemberships: e.target.value })} placeholder="e.g. Master Builders Association, NECA…" />
        </Field>

        <Field label="Guarantees or warranties offered" hint="(optional)">
          <Input value={data.bizGuarantees} onChange={e => update({ bizGuarantees: e.target.value })} placeholder="e.g. 12-month workmanship guarantee, 5-year product warranty…" />
        </Field>

      </div>
    </div>
  )
}

// ── Address autocomplete (Step 4) ──────────────────────────────────────────

interface NominatimResult {
  display_name: string
  lat: string
  lon: string
  address: {
    suburb?: string
    town?: string
    city?: string
    village?: string
    hamlet?: string
    municipality?: string
    [key: string]: string | undefined
  }
}

function AddressAutocomplete() {
  const { data, update } = useWizard()
  const [query, setQuery]     = useState(data.bizAddress)
  const [results, setResults] = useState<NominatimResult[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen]       = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const search = async (q: string) => {
    if (q.trim().length < 4) { setResults([]); setOpen(false); return }
    setLoading(true)
    try {
      const res  = await fetch(`/api/address/search?q=${encodeURIComponent(q)}`)
      const data = await res.json()
      setResults(data)
      setOpen(data.length > 0)
    } catch { setResults([]) }
    finally { setLoading(false) }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setQuery(val)
    update({ bizAddress: val, bizAddressLat: '', bizAddressLng: '', bizAddressTown: '' })
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => search(val), 400)
  }

  const handleSelect = (r: NominatimResult) => {
    const town = r.address.suburb || r.address.town || r.address.city || r.address.village || r.address.hamlet || r.address.municipality || ''
    setQuery(r.display_name)
    setOpen(false)
    update({ bizAddress: r.display_name, bizAddressLat: r.lat, bizAddressLng: r.lon, bizAddressTown: town })
  }

  return (
    <div className="relative">
      <div className="relative">
        <Input
          value={query}
          onChange={handleChange}
          onBlur={() => setTimeout(() => setOpen(false), 200)}
          placeholder="Start typing your business address…"
        />
        {loading && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 animate-pulse">Searching…</span>}
      </div>
      {open && results.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-slate-800 border border-slate-700 rounded-lg overflow-hidden shadow-2xl">
          {results.map((r, i) => (
            <button
              key={i}
              type="button"
              onMouseDown={() => handleSelect(r)}
              className="w-full text-left px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-700 border-b border-slate-800 last:border-0 transition-colors"
            >
              {r.display_name}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Step 4: Location & reach ───────────────────────────────────────────────

export function Step4() {
  const { data, update, currentStep, totalSteps } = useWizard()
  const [fetchingTowns, setFetchingTowns] = useState(false)

  const town = data.bizAddressTown || 'your area'

  const findTowns = async () => {
    if (!data.bizAddressLat || !data.bizAddressLng || !data.serviceRadiusKm) return
    setFetchingTowns(true)
    try {
      const res   = await fetch(`/api/address/towns?lat=${data.bizAddressLat}&lng=${data.bizAddressLng}&km=${data.serviceRadiusKm}`)
      const towns = await res.json() as string[]
      update({ serviceRadiusTowns: towns.join(', ') })
    } catch { /* silent */ }
    finally { setFetchingTowns(false) }
  }

  return (
    <div>
      <StepHeader step={currentStep} total={totalSteps} title="Location & service area" description="Where do you operate and who do you serve? This informs your SEO strategy and content." />
      <div className="flex flex-col gap-4">

        <Field label="Business address" hint="(leave blank if home-based or virtual)">
          <AddressAutocomplete />
          {data.bizAddressTown && (
            <p className="text-xs text-emerald-400 mt-1">✓ Suburb/town identified: <strong>{data.bizAddressTown}</strong></p>
          )}
        </Field>

        <Field label="Service reach">
          <div className="flex flex-col gap-2">
            <OptionCard selected={data.serviceReach === 'local'}         onClick={() => update({ serviceReach: 'local' })}         title="Local / regional"    subtitle="Serving a specific area or city" />
            <OptionCard selected={data.serviceReach === 'national'}      onClick={() => update({ serviceReach: 'national' })}      title="National"            subtitle="Serving across the country" />
            <OptionCard selected={data.serviceReach === 'international'} onClick={() => update({ serviceReach: 'international' })} title="International"       subtitle="Serving customers globally" />
          </div>
        </Field>

        {data.serviceReach === 'local' && (
          <div className="rounded-xl border border-slate-700 bg-slate-800/30 p-4 flex flex-col gap-4">
            <p className="text-sm text-slate-300">
              Does your business service a particular area?{' '}
              <span className="text-slate-500">e.g. Within 130 km of <strong className="text-white">{town}</strong></span>
            </p>

            <Field label="Radius from your address (km)">
              <div className="flex gap-2">
                <Input
                  type="number"
                  min="1"
                  max="500"
                  value={data.serviceRadiusKm}
                  onChange={e => update({ serviceRadiusKm: e.target.value })}
                  placeholder="e.g. 130"
                  className="flex-1"
                />
                <button
                  type="button"
                  onClick={findTowns}
                  disabled={fetchingTowns || !data.bizAddressLat || !data.serviceRadiusKm}
                  className="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition-all hover:bg-indigo-500 disabled:opacity-40 whitespace-nowrap"
                >
                  {fetchingTowns ? 'Finding…' : 'Find towns'}
                </button>
              </div>
              {!data.bizAddressLat && (
                <p className="text-xs text-slate-500 mt-1">Select your address above first to enable town lookup.</p>
              )}
            </Field>

            {data.serviceRadiusTowns && (
              <Field label="Towns & suburbs within your service radius">
                <Textarea
                  value={data.serviceRadiusTowns}
                  onChange={e => update({ serviceRadiusTowns: e.target.value })}
                  rows={3}
                  placeholder="Towns will appear here after lookup, or enter manually…"
                />
                <p className="text-xs text-slate-500 mt-1">You can edit this list — remove any that don't apply.</p>
              </Field>
            )}

            {!data.serviceRadiusTowns && (
              <Field label="Or enter your service area manually">
                <Input value={data.localArea} onChange={e => update({ localArea: e.target.value })} placeholder="e.g. Seymour, Kilmore, Broadford, Wallan…" />
              </Field>
            )}
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

        <Field label="Do you offer online or remote services?">
          <Select value={data.onlineServices} onChange={e => update({ onlineServices: e.target.value })}>
            <option value="">Select…</option>
            <option>Yes, online only</option>
            <option>Yes, in addition to in-person</option>
            <option>No</option>
          </Select>
        </Field>

      </div>
    </div>
  )
}

// ── Step 5: Digital presence ───────────────────────────────────────────────

export function Step5() {
  const { data, update, toggleArray, currentStep, totalSteps } = useWizard()

  return (
    <div>
      <StepHeader step={currentStep} total={totalSteps} title="Your digital presence" description="Tell us where you currently exist online so we can connect everything together seamlessly." />
      <div className="flex flex-col gap-4">
        <Field label="Google Business Profile">
          <Select value={data.googleBusiness} onChange={e => update({ googleBusiness: e.target.value })}>
            <option value="">Select…</option>
            <option>Yes, I have one</option>
            <option>No, I'd like one set up</option>
            <option>Not sure</option>
          </Select>
        </Field>

        <Field label="Social media accounts" hint="(select all that apply)">
          <div className="flex flex-col gap-2">
            {SOCIAL_OPTIONS.map(s => (
              <CheckRow key={s} checked={data.socialMedia.includes(s)} onChange={() => toggleArray('socialMedia', s)} label={s} />
            ))}
          </div>
        </Field>

        <Divider />

        <Field label="Do you have existing email lists or CRM data?">
          <Select value={data.crm} onChange={e => update({ crm: e.target.value })}>
            <option value="">Select…</option>
            <option>Yes</option>
            <option>No</option>
            <option>Not sure</option>
          </Select>
        </Field>

        <Field label="Existing advertising accounts" hint="(optional)">
          <Input value={data.adAccounts} onChange={e => update({ adAccounts: e.target.value })} placeholder="e.g. Google Ads, Meta Ads…" />
        </Field>
      </div>
    </div>
  )
}

// ── Font suggestions per design style ─────────────────────────────────────

const FONT_SUGGESTIONS: Record<string, { display: string; body: string }> = {
  'Modern & minimal':          { display: 'Space Grotesk',     body: 'DM Sans' },
  'Bold & vibrant':            { display: 'Oswald',            body: 'Nunito' },
  'Corporate & professional':  { display: 'Montserrat',        body: 'Open Sans' },
  'Warm & friendly':           { display: 'Nunito',            body: 'Lato' },
  'Luxury & premium':          { display: 'Playfair Display',  body: 'Raleway' },
  'Playful & creative':        { display: 'Fredoka One',       body: 'Quicksand' },
  'Industrial & technical':    { display: 'Barlow Condensed',  body: 'Barlow' },
}

// ── Step 6: Branding & design ──────────────────────────────────────────────

export function Step6() {
  const { data, update, currentStep, totalSteps } = useWizard()
  const [uploading, setUploading] = useState(false)

  const fontSuggestion = FONT_SUGGESTIONS[data.designStyle]

  const handleLogoUpload = async (files: File[]) => {
    setUploading(true)
    try {
      const form = new FormData()
      files.forEach(f => form.append('logo', f))
      const slug = (data.bizName || 'unknown').trim().toLowerCase().replace(/[^a-z0-9]/g, '-')
      form.append('folder', slug)
      const res  = await fetch('/api/upload', { method: 'POST', body: form })
      const json = await res.json()
      const urls = json.uploads.map((u: { url: string }) => u.url)
      update({ logoFiles: files, logoUrls: urls })
    } catch (err) {
      console.error('Upload failed:', err)
    } finally {
      setUploading(false)
    }
  }

  const paletteColours = [
    { label: 'Primary',    value: data.brandPrimary },
    { label: 'Light Bg',   value: data.brandLightBg },
    { label: 'Dark Bg',    value: data.brandDarkBg },
    { label: 'Btn',        value: data.brandBtnPrimary },
    { label: 'Btn Hover',  value: data.brandBtnHover },
    { label: 'Accent',     value: data.brandAccent },
    { label: 'Acc Hover',  value: data.brandAccentHover },
    { label: 'Dark Text',  value: data.brandDarkText },
  ]

  return (
    <div>
      <StepHeader step={currentStep} total={totalSteps} title="Branding & design" description="Upload your brand assets and tell us about your visual style and colours." />
      <div className="flex flex-col gap-5">

        {/* Logo */}
        <Field label="Business logo">
          <UploadZone
            id="logo-upload"
            label={uploading ? 'Uploading…' : 'Click to upload your logo'}
            sublabel="SVG, PNG, AI, EPS or PDF — any size"
            accept="image/*,.svg,.pdf,.ai,.eps"
            files={data.logoFiles}
            onFiles={handleLogoUpload}
          />
          {data.logoUrls?.length > 0 && <p className="text-xs text-emerald-400 mt-1">✓ {data.logoUrls.length} file(s) uploaded</p>}
          {data.logoFiles.length === 0 && <InfoBox>No logo yet? We can design one — add Logo Design in the add-ons step.</InfoBox>}
        </Field>

        <Divider />

        {/* Design style */}
        <Field label="Design style preference">
          <Select value={data.designStyle} onChange={e => update({ designStyle: e.target.value })}>
            <option value="">Select…</option>
            {Object.keys(FONT_SUGGESTIONS).map(s => <option key={s}>{s}</option>)}
            <option>Not sure — I'd like suggestions</option>
          </Select>
        </Field>

        <Divider />

        {/* Colour swatches */}
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-indigo-400 mb-1">Brand colours</p>
          <p className="text-xs text-slate-500 mb-4">Click any colour dot to open the picker, or type a hex code directly.</p>

          <div className="flex flex-col gap-0 divide-y divide-slate-800/60">
            <ColourSwatch label="Primary colour" hint="Main brand colour — headings, highlights"
              value={data.brandPrimary} onChange={hex => update({ brandPrimary: hex })} />
            <ColourSwatch label="Light background" hint="Light page background — secondary sections"
              value={data.brandLightBg} onChange={hex => update({ brandLightBg: hex })} />
            <ColourSwatch label="Dark background" hint="Dark page sections, footer background"
              value={data.brandDarkBg} onChange={hex => update({ brandDarkBg: hex })} />
            <ColourSwatch label="Dark text" hint="Body text on light backgrounds"
              value={data.brandDarkText} onChange={hex => update({ brandDarkText: hex })} />
          </div>
        </div>

        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-indigo-400 mb-1">Button colours</p>
          <p className="text-xs text-slate-500 mb-4">Primary button is your main CTA. Accent is a secondary call-to-action.</p>

          <div className="flex flex-col gap-0 divide-y divide-slate-800/60">
            <ColourSwatch label="Primary button" hint="CTA button background"
              value={data.brandBtnPrimary}
              onChange={hex => update({ brandBtnPrimary: hex, brandBtnHover: lightenHex(hex, 15) })} />
            <ColourSwatch label="Primary button hover" hint="Auto-suggested — 15% lighter"
              value={data.brandBtnHover} onChange={hex => update({ brandBtnHover: hex })}
              autoNote="Auto-suggested from primary button — override if needed" />
            <ColourSwatch label="Accent colour" hint="Secondary CTA button"
              value={data.brandAccent}
              onChange={hex => update({ brandAccent: hex, brandAccentHover: lightenHex(hex, 15) })} />
            <ColourSwatch label="Accent hover" hint="Auto-suggested — 15% lighter"
              value={data.brandAccentHover} onChange={hex => update({ brandAccentHover: hex })}
              autoNote="Auto-suggested from accent colour — override if needed" />
          </div>
        </div>

        {/* Palette preview */}
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-slate-500 mb-2">Your palette</p>
          <PalettePreview colours={paletteColours} />
        </div>

        <Divider />

        {/* Fonts */}
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-indigo-400 mb-1">Typography</p>
          {fontSuggestion && (
            <p className="text-xs text-slate-500 mb-4">Based on your <strong className="text-slate-300">{data.designStyle}</strong> style, we suggest <strong className="text-slate-300">{fontSuggestion.display}</strong> + <strong className="text-slate-300">{fontSuggestion.body}</strong>. You can accept these or choose your own below.</p>
          )}
        </div>

        <FontSelector
          label="Display font"
          hint="For headings (e.g. Barlow Condensed)"
          value={data.displayFont}
          onChange={font => update({ displayFont: font })}
          suggested={fontSuggestion?.display}
        />

        <FontSelector
          label="Body font"
          hint="For body copy (e.g. Barlow)"
          value={data.bodyFont}
          onChange={font => update({ bodyFont: font })}
          suggested={fontSuggestion?.body}
        />

        <Divider />

        {/* Inspiration */}
        <Field label="Websites you love" hint="(and why)">
          <Textarea value={data.sitesLove} onChange={e => update({ sitesLove: e.target.value })} placeholder="URL — what you like about it…" />
        </Field>
        <Field label="Websites you dislike" hint="(and why)">
          <Textarea value={data.sitesDislike} onChange={e => update({ sitesDislike: e.target.value })} placeholder="URL — what to avoid…" />
        </Field>

      </div>
    </div>
  )
}

// ── Step 7: Pages & content ────────────────────────────────────────────────

export function Step7() {
  const { data, update, toggleArray, currentStep, totalSteps } = useWizard()
  const [uploading, setUploading] = useState<string | null>(null)

  // Helper: upload a single file to a subfolder, returns URL
  const uploadFile = async (file: File, subfolder: string): Promise<string> => {
    const form = new FormData()
    form.append('file', file)
    const slug = (data.bizName || 'unknown').trim().toLowerCase().replace(/[^a-z0-9]/g, '-')
    form.append('folder', `${slug}/${subfolder}`)
    try {
      const res  = await fetch('/api/upload', { method: 'POST', body: form })
      const json = await res.json()
      return json.uploads?.[0]?.url ?? ''
    } catch { return '' }
  }

  // Helper: upload multiple files
  const uploadFiles = async (files: File[], subfolder: string): Promise<string[]> => {
    return Promise.all(files.map(f => uploadFile(f, subfolder)))
  }

  // Generic list helpers
  function updItem<T>(arr: T[], idx: number, patch: Partial<T>): T[] {
    return arr.map((item, i) => i === idx ? { ...item, ...patch } : item)
  }
  function delItem<T>(arr: T[], idx: number): T[] {
    return arr.filter((_, i) => i !== idx)
  }

  return (
    <div>
      <StepHeader
        step={currentStep}
        total={totalSteps}
        title="Pages & content"
        description="Select the pages you need. Content fields will appear for each page you choose."
      />
      <div className="flex flex-col gap-5">

        {/* Page selector */}
        <Field label="Which pages do you need?" hint="(select all that apply)">
          <div className="flex flex-col gap-2">
            {PAGE_OPTIONS.map(p => (
              <CheckRow key={p.value} checked={data.pages.includes(p.value)} onChange={() => toggleArray('pages', p.value)} label={p.label} />
            ))}
          </div>
        </Field>

        {/* ── Home ── */}
        {data.pages.includes('home') && (
          <PageCard>
            <SectionHeading>Home page content</SectionHeading>
            <p className="text-xs text-slate-500 -mt-2">These images will be used in a hero carousel or similar display at the top of your homepage.</p>

            <Field label="Desktop hero images — landscape (up to 3)">
              <UploadZone
                id="hero-landscape"
                label={uploading === 'heroLandscape' ? 'Uploading…' : 'Upload landscape photos'}
                sublabel="Recommended: 1920×1080 · JPG or WEBP · Up to 3 images"
                accept="image/*"
                multiple
                files={data.heroLandscapeFiles}
                onFiles={async files => {
                  const limited = files.slice(0, 3)
                  setUploading('heroLandscape')
                  const urls = await uploadFiles(limited, 'hero/landscape')
                  update({ heroLandscapeFiles: limited, heroLandscapeUrls: urls })
                  setUploading(null)
                }}
              />
              {data.heroLandscapeUrls.length > 0 && <p className="text-xs text-emerald-400 mt-1">✓ {data.heroLandscapeUrls.length} image(s) uploaded</p>}
            </Field>

            <Field label="Mobile hero images — portrait (up to 3)">
              <UploadZone
                id="hero-portrait"
                label={uploading === 'heroPortrait' ? 'Uploading…' : 'Upload portrait photos'}
                sublabel="Recommended: 1080×1920 · JPG or WEBP · Up to 3 images"
                accept="image/*"
                multiple
                files={data.heroPortraitFiles}
                onFiles={async files => {
                  const limited = files.slice(0, 3)
                  setUploading('heroPortrait')
                  const urls = await uploadFiles(limited, 'hero/portrait')
                  update({ heroPortraitFiles: limited, heroPortraitUrls: urls })
                  setUploading(null)
                }}
              />
              {data.heroPortraitUrls.length > 0 && <p className="text-xs text-emerald-400 mt-1">✓ {data.heroPortraitUrls.length} image(s) uploaded</p>}
            </Field>
          </PageCard>
        )}

        {/* ── About us ── */}
        {data.pages.includes('about') && (
          <PageCard>
            <SectionHeading>About us content</SectionHeading>

            <Field label="About us description" hint="(1–2 sentences)*">
              <Textarea value={data.aboutDesc} onChange={e => update({ aboutDesc: e.target.value })} placeholder="A brief description of your business story, values, or what drives you…" />
            </Field>

            <Field label="Team or about us image" hint="(optional)">
              {data.aboutImageUrl ? (
                <div className="flex items-center gap-3">
                  <p className="text-xs text-emerald-400">✓ Image uploaded</p>
                  <button type="button" onClick={() => update({ aboutImageFile: null, aboutImageUrl: '' })} className="text-xs text-slate-500 hover:text-red-400">Remove</button>
                </div>
              ) : (
                <UploadZone
                  id="about-image"
                  label={uploading === 'about' ? 'Uploading…' : 'Upload team or about image'}
                  sublabel="JPG, PNG, or WEBP"
                  accept="image/*"
                  files={data.aboutImageFile ? [data.aboutImageFile] : []}
                  onFiles={async files => {
                    if (!files[0]) return
                    setUploading('about')
                    const url = await uploadFile(files[0], 'about')
                    update({ aboutImageFile: files[0], aboutImageUrl: url })
                    setUploading(null)
                  }}
                />
              )}
            </Field>
          </PageCard>
        )}

        {/* ── Services ── */}
        {data.pages.includes('services') && (
          <PageCard>
            <SectionHeading>Services</SectionHeading>
            {data.pageServices.length === 0 && (
              <p className="text-xs text-slate-500">Add the services you offer. Each gets its own section on your services page.</p>
            )}

            {data.pageServices.map((svc, idx) => (
              <ItemCard key={idx} label={`Service ${idx + 1}`} onRemove={() => update({ pageServices: delItem(data.pageServices, idx) })}>
                <Field label="Service name" required>
                  <Input value={svc.name} onChange={e => update({ pageServices: updItem(data.pageServices, idx, { name: e.target.value }) })} placeholder="e.g. Residential Electrical" />
                </Field>
                <Field label="Brief description" hint="(1–2 sentences)">
                  <Textarea rows={2} value={svc.desc} onChange={e => update({ pageServices: updItem(data.pageServices, idx, { desc: e.target.value }) })} placeholder="What this service includes…" />
                </Field>
                <Field label="Service image" hint="(optional)">
                  {svc.imageUrl ? (
                    <div className="flex items-center gap-3">
                      <p className="text-xs text-emerald-400">✓ Image uploaded</p>
                      <button type="button" onClick={() => update({ pageServices: updItem(data.pageServices, idx, { imageUrl: '' }) })} className="text-xs text-slate-500 hover:text-red-400">Remove</button>
                    </div>
                  ) : (
                    <label className="flex items-center gap-3 cursor-pointer text-sm text-slate-400 border border-dashed border-slate-700 rounded-lg px-4 py-2.5 hover:border-indigo-500/60 transition-colors">
                      <span>↑ Upload image</span>
                      <input type="file" accept="image/*" className="sr-only" onChange={async e => {
                        const file = e.target.files?.[0]
                        if (!file) return
                        setUploading(`service-${idx}`)
                        const url = await uploadFile(file, 'services')
                        update({ pageServices: updItem(data.pageServices, idx, { imageUrl: url }) })
                        setUploading(null)
                      }} />
                      {uploading === `service-${idx}` && <span className="text-xs text-indigo-400 animate-pulse">Uploading…</span>}
                    </label>
                  )}
                </Field>
              </ItemCard>
            ))}

            <AddButton
              label="Add a service"
              onClick={() => update({ pageServices: [...data.pageServices, { name: '', desc: '', imageUrl: '' }] })}
            />
          </PageCard>
        )}

        {/* ── Portfolio / Gallery ── */}
        {data.pages.includes('portfolio') && (
          <PageCard>
            <SectionHeading>Portfolio / gallery</SectionHeading>

            {data.pageGallery.map((item, idx) => (
              <ItemCard key={idx} label={`Image ${idx + 1}`} onRemove={() => update({ pageGallery: delItem(data.pageGallery, idx) })}>
                <Field label="Name" required>
                  <Input value={item.name} onChange={e => update({ pageGallery: updItem(data.pageGallery, idx, { name: e.target.value }) })} placeholder="e.g. Office renovation — Smith St" />
                </Field>
                <Field label="Brief description" hint="(a few words)">
                  <Input value={item.desc} onChange={e => update({ pageGallery: updItem(data.pageGallery, idx, { desc: e.target.value }) })} placeholder="e.g. Commercial fit-out, 2024" />
                </Field>
                <Field label="Image" required>
                  {item.imageUrl ? (
                    <div className="flex items-center gap-3">
                      <p className="text-xs text-emerald-400">✓ Image uploaded</p>
                      <button type="button" onClick={() => update({ pageGallery: updItem(data.pageGallery, idx, { imageUrl: '' }) })} className="text-xs text-slate-500 hover:text-red-400">Remove</button>
                    </div>
                  ) : (
                    <label className="flex items-center gap-3 cursor-pointer text-sm text-slate-400 border border-dashed border-slate-700 rounded-lg px-4 py-2.5 hover:border-indigo-500/60 transition-colors">
                      <span>↑ Upload image</span>
                      <input type="file" accept="image/*" className="sr-only" onChange={async e => {
                        const file = e.target.files?.[0]
                        if (!file) return
                        setUploading(`gallery-${idx}`)
                        const url = await uploadFile(file, 'gallery')
                        update({ pageGallery: updItem(data.pageGallery, idx, { imageUrl: url }) })
                        setUploading(null)
                      }} />
                      {uploading === `gallery-${idx}` && <span className="text-xs text-indigo-400 animate-pulse">Uploading…</span>}
                    </label>
                  )}
                </Field>
              </ItemCard>
            ))}

            <AddButton label="Add a gallery image" onClick={() => update({ pageGallery: [...data.pageGallery, { name: '', desc: '', imageUrl: '' }] })} />
          </PageCard>
        )}

        {/* ── Team / Staff ── */}
        {data.pages.includes('team') && (
          <PageCard>
            <SectionHeading>Team / staff</SectionHeading>

            {data.pageTeam.map((member, idx) => (
              <ItemCard key={idx} label={`Staff member ${idx + 1}`} onRemove={() => update({ pageTeam: delItem(data.pageTeam, idx) })}>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Name" required>
                    <Input value={member.name} onChange={e => update({ pageTeam: updItem(data.pageTeam, idx, { name: e.target.value }) })} placeholder="e.g. Sarah Jones" />
                  </Field>
                  <Field label="Role" required>
                    <Input value={member.role} onChange={e => update({ pageTeam: updItem(data.pageTeam, idx, { role: e.target.value }) })} placeholder="e.g. Operations Manager" />
                  </Field>
                </div>
                <Field label="Other information" hint="(optional)">
                  <Textarea rows={2} value={member.info} onChange={e => update({ pageTeam: updItem(data.pageTeam, idx, { info: e.target.value }) })} placeholder="Qualifications, years experience, fun fact…" />
                </Field>
                <Field label="Photo" hint="(recommended)">
                  {member.imageUrl ? (
                    <div className="flex items-center gap-3">
                      <p className="text-xs text-emerald-400">✓ Photo uploaded</p>
                      <button type="button" onClick={() => update({ pageTeam: updItem(data.pageTeam, idx, { imageUrl: '' }) })} className="text-xs text-slate-500 hover:text-red-400">Remove</button>
                    </div>
                  ) : (
                    <label className="flex items-center gap-3 cursor-pointer text-sm text-slate-400 border border-dashed border-slate-700 rounded-lg px-4 py-2.5 hover:border-indigo-500/60 transition-colors">
                      <span>↑ Upload photo</span>
                      <input type="file" accept="image/*" className="sr-only" onChange={async e => {
                        const file = e.target.files?.[0]
                        if (!file) return
                        setUploading(`team-${idx}`)
                        const url = await uploadFile(file, 'team')
                        update({ pageTeam: updItem(data.pageTeam, idx, { imageUrl: url }) })
                        setUploading(null)
                      }} />
                      {uploading === `team-${idx}` && <span className="text-xs text-indigo-400 animate-pulse">Uploading…</span>}
                    </label>
                  )}
                </Field>
              </ItemCard>
            ))}

            <AddButton label="Add a staff member" onClick={() => update({ pageTeam: [...data.pageTeam, { name: '', role: '', info: '', imageUrl: '' }] })} />
          </PageCard>
        )}

        {/* ── Blog / News ── */}
        {data.pages.includes('blog') && (
          <PageCard>
            <SectionHeading>Blog / news</SectionHeading>
            <p className="text-xs text-slate-500 -mt-2">Suggest topics you'd like to write about or have us create content for.</p>

            {data.blogTopics.map((topic, idx) => (
              <div key={idx} className="flex gap-2">
                <Input
                  value={topic}
                  onChange={e => update({ blogTopics: data.blogTopics.map((t, i) => i === idx ? e.target.value : t) })}
                  placeholder={`e.g. Topic ${idx + 1}`}
                  className="flex-1"
                />
                <button type="button" onClick={() => update({ blogTopics: data.blogTopics.filter((_, i) => i !== idx) })} className="text-xs text-slate-600 hover:text-red-400 px-2 transition-colors">×</button>
              </div>
            ))}

            <AddButton label="Add a blog topic" onClick={() => update({ blogTopics: [...data.blogTopics, ''] })} />
          </PageCard>
        )}

        {/* ── FAQ ── */}
        {data.pages.includes('faq') && (
          <PageCard>
            <SectionHeading>FAQ</SectionHeading>
            <p className="text-xs text-slate-500 -mt-2">We can populate general FAQs for your industry, but real examples from your customers are always best.</p>

            {data.faqItems.map((item, idx) => (
              <ItemCard key={idx} label={`FAQ ${idx + 1}`} onRemove={() => update({ faqItems: delItem(data.faqItems, idx) })}>
                <Field label="Question">
                  <Input value={item.question} onChange={e => update({ faqItems: updItem(data.faqItems, idx, { question: e.target.value }) })} placeholder="e.g. Do you offer free quotes?" />
                </Field>
                <Field label="Answer">
                  <Textarea rows={2} value={item.answer} onChange={e => update({ faqItems: updItem(data.faqItems, idx, { answer: e.target.value }) })} placeholder="Your answer…" />
                </Field>
              </ItemCard>
            ))}

            <AddButton label="Add a FAQ" onClick={() => update({ faqItems: [...data.faqItems, { question: '', answer: '' }] })} />
          </PageCard>
        )}

        {/* ── Testimonials ── */}
        {data.pages.includes('testimonials') && (
          <PageCard>
            <SectionHeading>Testimonials / reviews</SectionHeading>
            <InfoBox>We can pull reviews directly from your Google Business Profile. Add any additional testimonials below.</InfoBox>

            {data.testimonials.map((t, idx) => (
              <ItemCard key={idx} label={`Testimonial ${idx + 1}`} onRemove={() => update({ testimonials: delItem(data.testimonials, idx) })}>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Name">
                    <Input value={t.name} onChange={e => update({ testimonials: updItem(data.testimonials, idx, { name: e.target.value }) })} placeholder="e.g. John D." />
                  </Field>
                  <Field label="Stars">
                    <div className="flex gap-1 pt-2">
                      {[1,2,3,4,5].map(star => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => update({ testimonials: updItem(data.testimonials, idx, { stars: star }) })}
                          className={`text-xl transition-colors ${star <= t.stars ? 'text-yellow-400' : 'text-slate-700 hover:text-yellow-400/50'}`}
                        >★</button>
                      ))}
                    </div>
                  </Field>
                </div>
                <Field label="Review">
                  <Textarea rows={2} value={t.review} onChange={e => update({ testimonials: updItem(data.testimonials, idx, { review: e.target.value }) })} placeholder="What your customer said…" />
                </Field>
              </ItemCard>
            ))}

            <AddButton label="Add a testimonial" onClick={() => update({ testimonials: [...data.testimonials, { name: '', review: '', stars: 5 }] })} />
          </PageCard>
        )}

        {/* ── Contact ── */}
        {data.pages.includes('contact') && (
          <PageCard>
            <SectionHeading>Contact form</SectionHeading>
            <InfoBox>Your form will include: name, email, phone, preferred contact method, service interested in, and notes. Add any extra fields below.</InfoBox>

            <Field label="Contact form intro message" hint="(optional)">
              <Input value={data.contactFormIntro} onChange={e => update({ contactFormIntro: e.target.value })} placeholder={`e.g. Get in touch for a free quote`} />
            </Field>

            {data.contactFormFields.length > 0 && (
              <div className="flex flex-col gap-3">
                <p className="text-xs text-slate-500">Additional fields:</p>
                {data.contactFormFields.map((field, idx) => (
                  <div key={idx} className="flex gap-2 items-start">
                    <div className="flex-1 grid grid-cols-2 gap-2">
                      <Input value={field.name} onChange={e => update({ contactFormFields: updItem(data.contactFormFields, idx, { name: e.target.value }) })} placeholder="Field name" />
                      <Input value={field.desc} onChange={e => update({ contactFormFields: updItem(data.contactFormFields, idx, { desc: e.target.value }) })} placeholder="Description / placeholder" />
                    </div>
                    <button type="button" onClick={() => update({ contactFormFields: delItem(data.contactFormFields, idx) })} className="text-xs text-slate-600 hover:text-red-400 px-2 pt-2.5 transition-colors">×</button>
                  </div>
                ))}
              </div>
            )}

            <AddButton label="Add a field" onClick={() => update({ contactFormFields: [...data.contactFormFields, { name: '', desc: '' }] })} />
          </PageCard>
        )}

        {/* ── Careers ── */}
        {data.pages.includes('careers') && (
          <PageCard>
            <SectionHeading>Careers page</SectionHeading>

            <Field label="Careers page heading">
              <Input value={data.careersTitle} onChange={e => update({ careersTitle: e.target.value })} placeholder="e.g. Are you interested in joining our team?" />
            </Field>
            <Field label="Description">
              <Textarea value={data.careersDesc} onChange={e => update({ careersDesc: e.target.value })} placeholder="What you're looking for in team members, your culture, or current opportunities…" />
            </Field>
          </PageCard>
        )}

        <Divider />

        {/* General content questions */}
        <Field label="Who will write the website content?">
          <Select value={data.contentAuthor} onChange={e => update({ contentAuthor: e.target.value })}>
            <option value="">Select…</option>
            <option>I'll provide all content</option>
            <option>Done-for-me copywriting (add-on)</option>
            <option>A mix — I'll provide some, you fill in the rest</option>
          </Select>
        </Field>

        <Field label="Do you have existing text or copy to use?">
          <Select value={data.existingCopy} onChange={e => update({ existingCopy: e.target.value })}>
            <option value="">Select…</option>
            <option>Yes, I'll provide it</option>
            <option>No, starting from scratch</option>
          </Select>
        </Field>

        <Field label="Do you need multilingual support?">
          <Select value={data.multilingual} onChange={e => update({ multilingual: e.target.value })}>
            <option value="">Select…</option>
            <option>No</option>
            <option>Yes</option>
          </Select>
        </Field>

        {data.multilingual === 'Yes' && (
          <Field label="Which languages?">
            <Input value={data.languages} onChange={e => update({ languages: e.target.value })} placeholder="e.g. English, Mandarin, Spanish…" />
          </Field>
        )}

      </div>
    </div>
  )
}

// ── Step 8: Features & functionality ──────────────────────────────────────

export function Step8() {
  const { data, update, toggleArray, currentStep, totalSteps } = useWizard()

  return (
    <div>
      <StepHeader step={currentStep} total={totalSteps} title="Features & functionality" description="Select everything you'd like your website to do. We'll scope it all out properly." />
      <div className="flex flex-col gap-5">
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-widest text-slate-500">E-commerce</p>
          <AddOnRow checked={data.hasEcommerce} onChange={() => update({ hasEcommerce: !data.hasEcommerce })} name="Online shop" description="Sell products or services directly from your site" price="Included in selected plans" />
          {data.hasEcommerce && (
            <div className="mt-3 flex flex-col gap-3 rounded-xl border border-slate-800 bg-slate-900/60 p-4">
              <Field label="Physical or digital products?">
                <Select value={data.productType} onChange={e => update({ productType: e.target.value })}>
                  <option value="">Select…</option>
                  <option>Physical products</option>
                  <option>Digital downloads</option>
                  <option>Both</option>
                  <option>Services / bookings</option>
                </Select>
              </Field>
              <Field label="Approximate number of products">
                <Input value={data.productCount} onChange={e => update({ productCount: e.target.value })} placeholder="e.g. 10, 50–100, 500+" />
              </Field>
              <Field label="Payment gateways">
                <Input value={data.paymentGateways} onChange={e => update({ paymentGateways: e.target.value })} placeholder="Stripe, PayPal, Afterpay, Zip…" />
              </Field>
              <Field label="Do you need inventory management?">
                <Select value={data.inventoryMgmt} onChange={e => update({ inventoryMgmt: e.target.value })}>
                  <option value="">Select…</option>
                  <option>Yes</option>
                  <option>No</option>
                </Select>
              </Field>
            </div>
          )}
        </div>

        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-widest text-slate-500">Bookings & scheduling</p>
          <AddOnRow checked={data.hasBookings} onChange={() => update({ hasBookings: !data.hasBookings })} name="Online bookings" description="Let clients book appointments or services online" price="Included in selected plans" />
          {data.hasBookings && (
            <div className="mt-3 flex flex-col gap-3 rounded-xl border border-slate-800 bg-slate-900/60 p-4">
              <Field label="Do you require deposits or upfront payment?">
                <Select value={data.bookingPayment} onChange={e => update({ bookingPayment: e.target.value })}>
                  <option value="">Select…</option>
                  <option>Yes</option>
                  <option>No</option>
                </Select>
              </Field>
              <Field label="Number of staff or resources to schedule">
                <Input value={data.staffCount} onChange={e => update({ staffCount: e.target.value })} placeholder="e.g. 1, 5, 20+" />
              </Field>
            </div>
          )}
        </div>

        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-widest text-slate-500">Other features</p>
          <div className="flex flex-col gap-2">
            {FEATURE_OPTIONS.map(f => (
              <CheckRow key={f.value} checked={data.features.includes(f.value)} onChange={() => toggleArray('features', f.value)} label={f.label} />
            ))}
          </div>
        </div>

        <Field label="Third-party integrations needed" hint="(optional)">
          <Input value={data.integrations} onChange={e => update({ integrations: e.target.value })} placeholder="e.g. Xero, HubSpot, Mailchimp, POS system…" />
        </Field>
      </div>
    </div>
  )
}

// ── Step 9: Add-ons ────────────────────────────────────────────────────────

export function Step9() {
  const { data, toggleArray, currentStep, totalSteps } = useWizard()
  const selectedAddOns = ADD_ONS.filter(a => data.addOns.includes(a.id))
  const total = selectedAddOns.reduce((sum, a) => sum + a.priceNum, 0)

  return (
    <div>
      <StepHeader step={currentStep} total={totalSteps} title="Add-ons & extras" description="Enhance your website with premium services. Selected items are added to your project quote." />
      <div className="flex flex-col gap-3">
        {ADD_ONS.map(a => (
          <AddOnRow key={a.id} checked={data.addOns.includes(a.id)} onChange={() => toggleArray('addOns', a.id)} name={a.name} description={a.description} price={a.price} />
        ))}
      </div>
      {selectedAddOns.length > 0 && (
        <div className="mt-6 rounded-xl border border-indigo-500/30 bg-indigo-500/5 p-4">
          <p className="mb-3 text-xs font-medium uppercase tracking-widest text-indigo-400">Your add-ons</p>
          <div className="flex flex-col gap-2">
            {selectedAddOns.map(a => (
              <div key={a.id} className="flex items-center justify-between">
                <span className="text-sm text-slate-300">{a.name}</span>
                <span className="text-sm font-medium text-indigo-400">{a.price}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 flex items-center justify-between border-t border-indigo-500/20 pt-3">
            <span className="text-sm font-medium text-white">Add-ons subtotal</span>
            <span className="text-sm font-semibold text-indigo-300">${total.toLocaleString()}+</span>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Step 10: Timeline & budget ─────────────────────────────────────────────

export function Step10() {
  const { data, update, currentStep, totalSteps } = useWizard()

  return (
    <div>
      <StepHeader step={currentStep} total={totalSteps} title="Timeline & budget" description="Help us plan the project around your needs. There are no wrong answers here." />
      <div className="flex flex-col gap-4">
        <Field label="Budget range">
          <Select value={data.budget} onChange={e => update({ budget: e.target.value })}>
            <option value="">Select…</option>
            {['Under $1,000', '$1,000 – $2,500', '$2,500 – $5,000', '$5,000 – $10,000', '$10,000 – $25,000', '$25,000+', "Not sure — I'd like a quote"].map(b => <option key={b}>{b}</option>)}
          </Select>
        </Field>

        <Field label="Do you have a launch deadline?">
          <Select value={data.hasDeadline} onChange={e => update({ hasDeadline: e.target.value })}>
            <option value="">Select…</option>
            <option>Yes</option>
            <option>No, flexible</option>
          </Select>
        </Field>

        {data.hasDeadline === 'Yes' && (
          <>
            <Field label="Target launch date">
              <Input value={data.launchDate} onChange={e => update({ launchDate: e.target.value })} placeholder="e.g. 1 June 2025, or 'before Christmas'" />
            </Field>
            <Field label="Reason for deadline" hint="(optional)">
              <Input value={data.deadlineReason} onChange={e => update({ deadlineReason: e.target.value })} placeholder="e.g. event launch, campaign, product release…" />
            </Field>
          </>
        )}

        <Field label="Build approach">
          <Select value={data.buildApproach} onChange={e => update({ buildApproach: e.target.value })}>
            <option value="">Select…</option>
            <option>Full build at once</option>
            <option>Launch MVP first, add features later</option>
            <option>Not sure — advise me</option>
          </Select>
        </Field>

        <Field label="Do you have internal resources to assist?" hint="(design, dev, content)">
          <Select value={data.internalResources} onChange={e => update({ internalResources: e.target.value })}>
            <option value="">Select…</option>
            <option>Yes</option>
            <option>No</option>
            <option>Maybe — depends on scope</option>
          </Select>
        </Field>

        <Field label="Anything else you'd like us to know?">
          <Textarea rows={4} value={data.extraNotes} onChange={e => update({ extraNotes: e.target.value })} placeholder="Special requirements, concerns, questions, or anything that didn't fit above…" />
        </Field>
      </div>
    </div>
  )
}

// ── Step 11: Summary & submit ──────────────────────────────────────────────

interface SummaryRowProps { label: string; value: string }

function SummaryRow({ label, value }: SummaryRowProps) {
  if (!value) return null
  return (
    <div className="flex items-start justify-between gap-4 py-2 text-sm">
      <span className="flex-shrink-0 text-slate-500">{label}</span>
      <span className="text-right text-slate-200">{value}</span>
    </div>
  )
}

interface SummarySectionProps { title: string; children: React.ReactNode }

function SummarySection({ title, children }: SummarySectionProps) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
      <p className="mb-2 text-xs font-medium uppercase tracking-widest text-indigo-400">{title}</p>
      <div className="divide-y divide-slate-800">{children}</div>
    </div>
  )
}

export function Step11() {
  const { data, currentStep, totalSteps, setIsSubmitted } = useWizard()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const selectedAddOns = ADD_ONS.filter(a => data.addOns.includes(a.id))

  const getMissingFields = () => {
    const missing: string[] = []
    if (!data.bizName?.trim())  missing.push('business name (Step 3)')
    if (!data.bizEmail?.trim()) missing.push('email address (Step 3)')
    return missing
  }

  const handleSubmit = async () => {
    setError(null)
    const missing = getMissingFields()
    if (missing.length > 0) {
      setError(`Please go back and complete: ${missing.join(' and ')}.`)
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch('/api/brief', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (res.ok) {
        document.getElementById('brief')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
        setTimeout(() => setIsSubmitted(true), 400)
      } else {
        const body = await res.json().catch(() => null)
        setError(body?.error ?? 'Something went wrong. Please try again, or email us at contact@webf5.au')
      }
    } catch {
      setError('Could not reach the server — please check your connection and try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const colourSummary = [
    data.brandPrimary, data.brandLightBg, data.brandDarkBg,
    data.brandBtnPrimary, data.brandAccent, data.brandDarkText,
  ].filter(Boolean).join(', ')

  return (
    <div>
      <StepHeader step={currentStep} total={totalSteps} title="Review your brief" description="Here's a summary of everything you've told us. Take a moment to review before submitting." />
      <div className="flex flex-col gap-4">

        <SummarySection title="Starting point">
          <SummaryRow label="Project type" value={data.startType} />
          <SummaryRow label="Current URL"  value={data.existingUrl} />
        </SummarySection>

        <SummarySection title="Domain">
          <SummaryRow label="Domain situation" value={data.domainStatus} />
          <SummaryRow label="Domain"           value={data.domainName || data.domainIdeas} />
          <SummaryRow label="Registrar"        value={data.domainRegistrar} />
        </SummarySection>

        <SummarySection title="Business">
          <SummaryRow label="Name"            value={data.bizName} />
          <SummaryRow label="Tagline"         value={data.bizTagline} />
          <SummaryRow label="Year est."       value={data.bizYear} />
          <SummaryRow label="Description"     value={data.bizDesc} />
          <SummaryRow label="Hours Mon–Fri"   value={data.bizHoursMF} />
          <SummaryRow label="Hours Sat"       value={data.bizHoursSat} />
          <SummaryRow label="Hours Sun"       value={data.bizHoursSun} />
          <SummaryRow label="Audience"        value={data.bizAudience} />
          <SummaryRow label="Qualifications"  value={data.bizQualifications} />
          <SummaryRow label="Memberships"     value={data.bizMemberships} />
          <SummaryRow label="Guarantees"      value={data.bizGuarantees} />
        </SummarySection>

        <SummarySection title="Location">
          <SummaryRow label="Address"       value={data.bizAddress} />
          <SummaryRow label="Reach"         value={data.serviceReach} />
          <SummaryRow label="Radius"        value={data.serviceRadiusKm ? `${data.serviceRadiusKm} km` : ''} />
          <SummaryRow label="Service towns" value={data.serviceRadiusTowns || data.localArea} />
        </SummarySection>

        <SummarySection title="Digital presence">
          <SummaryRow label="Google Business" value={data.googleBusiness} />
          <SummaryRow label="Social media"    value={data.socialMedia.join(', ')} />
          <SummaryRow label="Email"           value={data.bizEmail} />
          <SummaryRow label="Phone"           value={data.bizPhone} />
        </SummarySection>

        <SummarySection title="Design">
          <SummaryRow label="Style"           value={data.designStyle} />
          <SummaryRow label="Colours"         value={colourSummary} />
          <SummaryRow label="Display font"    value={data.displayFont} />
          <SummaryRow label="Body font"       value={data.bodyFont} />
          <SummaryRow label="Logo uploaded"   value={data.logoFiles.length > 0 ? `${data.logoFiles.length} file(s)` : ''} />
        </SummarySection>

        <SummarySection title="Pages & content">
          <SummaryRow label="Pages"          value={data.pages.join(', ')} />
          <SummaryRow label="Services"       value={data.pageServices.filter(s => s.name).map(s => s.name).join(', ')} />
          <SummaryRow label="Team members"   value={data.pageTeam.filter(t => t.name).map(t => `${t.name} (${t.role})`).join(', ')} />
          <SummaryRow label="FAQ items"      value={data.faqItems.length > 0 ? `${data.faqItems.length} question(s)` : ''} />
          <SummaryRow label="Testimonials"   value={data.testimonials.length > 0 ? `${data.testimonials.length} review(s)` : ''} />
          <SummaryRow label="Content author" value={data.contentAuthor} />
          <SummaryRow label="Multilingual"   value={data.multilingual} />
        </SummarySection>

        <SummarySection title="Features">
          <SummaryRow label="E-commerce"    value={data.hasEcommerce ? 'Yes' : ''} />
          <SummaryRow label="Bookings"      value={data.hasBookings ? 'Yes' : ''} />
          <SummaryRow label="Other"         value={data.features.join(', ')} />
          <SummaryRow label="Integrations"  value={data.integrations} />
        </SummarySection>

        {selectedAddOns.length > 0 && (
          <SummarySection title="Add-ons">
            {selectedAddOns.map(a => <SummaryRow key={a.id} label={a.name} value={a.price} />)}
          </SummarySection>
        )}

        <SummarySection title="Timeline & budget">
          <SummaryRow label="Budget"      value={data.budget} />
          <SummaryRow label="Launch date" value={data.launchDate} />
          <SummaryRow label="Approach"    value={data.buildApproach} />
          <SummaryRow label="Notes"       value={data.extraNotes} />
        </SummarySection>

        {error && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3">
            <p className="text-sm text-red-300">{error}</p>
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="mt-2 w-full rounded-xl bg-indigo-600 px-6 py-4 text-base font-semibold text-white transition-all duration-150 hover:bg-indigo-500 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? 'Submitting…' : 'Submit my brief →'}
        </button>

        <p className="text-center text-xs text-slate-500">
          We'll review your brief within 1 business day and reach out with your personalised recommendation.
        </p>
      </div>
    </div>
  )
}
