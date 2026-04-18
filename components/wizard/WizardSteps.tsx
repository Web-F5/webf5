'use client'

import { useWizard } from './WizardContext'
import {
  Field, Input, Textarea, Select, OptionCard, CheckRow,
  AddOnRow, UploadZone, InfoBox, StepHeader, Divider,
} from './WizardUI'
import { ADD_ONS, SOCIAL_OPTIONS, PAGE_OPTIONS, FEATURE_OPTIONS } from '../../types'
import { useState } from 'react'

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
        <OptionCard
          selected={data.startType === 'fresh'}
          onClick={() => update({ startType: 'fresh' })}
          icon="✦"
          title="Starting fresh"
          subtitle="I don't have a website yet"
        />
        <OptionCard
          selected={data.startType === 'rebuild'}
          onClick={() => update({ startType: 'rebuild' })}
          icon="⟳"
          title="Rebuilding an existing site"
          subtitle="I have a site but want a new one"
        />
        <OptionCard
          selected={data.startType === 'refresh'}
          onClick={() => update({ startType: 'refresh' })}
          icon="✎"
          title="Refreshing my current site"
          subtitle="I want to update or improve what I have"
        />
      </div>

      {showExisting && (
        <>
          <Divider />
          <div className="flex flex-col gap-4">
            <Field label="Current website URL">
              <Input
                type="url"
                value={data.existingUrl}
                onChange={e => update({ existingUrl: e.target.value })}
                placeholder="https://yoursite.com"
              />
            </Field>
            <Field label="What do you like about your current site?">
              <Textarea
                value={data.siteLike}
                onChange={e => update({ siteLike: e.target.value })}
                placeholder="Design, content, structure..."
              />
            </Field>
            <Field label="What would you like to change?">
              <Textarea
                value={data.siteDislike}
                onChange={e => update({ siteDislike: e.target.value })}
                placeholder="Speed, mobile layout, outdated design..."
              />
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
          const res = await fetch(
            `/api/domains/check?domain=${encodeURIComponent(data.domainIdeas.trim())}&tld=${encodeURIComponent(tld)}`
          )
          const json = await res.json()
          const domainResult = Array.isArray(json.data) ? json.data[0] : json.data
          return {
            tld,
            domain: domainResult?.domain_name ?? `${data.domainIdeas.trim()}${tld}`,
            available: domainResult?.is_available === true,
            price: domainResult?.register_price,
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
      <StepHeader
        step={currentStep}
        total={totalSteps}
        title="Domain name"
        description="Your domain is your address on the internet. Let's work out where you're at."
      />
      <div className="flex flex-col gap-3">
        <OptionCard
          selected={data.domainStatus === 'have'}
          onClick={() => update({ domainStatus: 'have' })}
          icon="✔"
          title="I already have a domain"
          subtitle="I'll provide my existing domain details"
        />
        <OptionCard
          selected={data.domainStatus === 'new'}
          onClick={() => update({ domainStatus: 'new' })}
          icon="+"
          title="I need a new domain"
          subtitle="Help me find and register one"
        />
        <OptionCard
          selected={data.domainStatus === 'unsure'}
          onClick={() => update({ domainStatus: 'unsure' })}
          icon="?"
          title="Not sure yet"
          subtitle="I'd like advice on this"
        />
      </div>

      {data.domainStatus === 'have' && (
        <>
          <Divider />
          <div className="flex flex-col gap-4">
            <Field label="Your domain name">
              <Input
                value={data.domainName}
                onChange={e => update({ domainName: e.target.value })}
                placeholder="yourbusiness.com.au"
              />
            </Field>
            <Field label="Domain registrar" hint="(where it's registered)">
              <Input
                value={data.domainRegistrar}
                onChange={e => update({ domainRegistrar: e.target.value })}
                placeholder="GoDaddy, Namecheap, Crazy Domains..."
              />
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
                  {checking ? 'Checking...' : 'Check'}
                </button>
              </div>
            </Field>

            {checking && (
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <span className="animate-spin inline-block">⟳</span>
                Checking availability across extensions...
              </div>
            )}

            {searched && results.length > 0 && (
              <>
                <p className="text-xs text-slate-500">
                  {results.filter(r => r.available).length > 0
                    ? 'Select your preferred domain to continue.'
                    : 'No available domains found. Try a different name.'}
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
                          <span className={`flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full border text-xs transition-colors ${
                            selectedDomain === r.domain
                              ? 'border-indigo-500 bg-indigo-500 text-white'
                              : 'border-slate-600'
                          }`}>
                            {selectedDomain === r.domain ? '✓' : ''}
                          </span>
                        )}
                        <span className={`font-medium text-sm ${
                          selectedDomain === r.domain ? 'text-indigo-200' : 'text-white'
                        }`}>
                          {r.domain}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        {r.available && r.price && (
                          <span className={`text-xs ${
                            selectedDomain === r.domain ? 'text-indigo-400' : 'text-slate-400'
                          }`}>
                            ${r.price.toFixed(2)}/yr
                          </span>
                        )}
                        {r.available ? (
                          <span className="text-xs font-medium text-emerald-400">Available</span>
                        ) : (
                          <span className="text-xs text-slate-600">Taken</span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>

                {selectedDomain && (
                  <div className="rounded-lg border border-indigo-500/30 bg-indigo-500/5 px-4 py-3">
                    <p className="text-sm text-indigo-300">
                      Selected: <span className="font-semibold text-white">{selectedDomain}</span>
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      Click Continue to proceed with this domain.
                    </p>
                  </div>
                )}
              </>
            )}

            {searched && results.length === 0 && (
              <InfoBox>Could not retrieve results. Please try again.</InfoBox>
            )}
          </div>
        </>
      )}
    </div>
  )
}


// ── Step 3: Business info ──────────────────────────────────────────────────
// Changes to steps 3 & 5: fields with errors get a red border + inline error message
// clearError() is called onChange so the red clears as soon as the user types

//      Added bizEmail and bizPhone fields at the bottom (required).
//         clearError() called on every onChange so red clears as user types.
//

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

        {/* ── Contact details — top of form ── */}
        <p className="text-xs font-medium uppercase tracking-widest text-indigo-400">
          Your contact details
        </p>
        <p className="text-xs text-slate-500 -mt-2">
          So we can follow up with your quote. These stay private.
        </p>

        <Field label="Contact name" required>
          <Input
            value={data.contactName ?? ''}
            onChange={e => { update({ contactName: e.target.value }); clearError('contactName') }}
            placeholder="e.g. Josh Smith"
            error={stepErrors['contactName']}
          />
          {stepErrors['contactName'] && (
            <p className="mt-1 text-xs text-red-400">{stepErrors['contactName']}</p>
          )}
        </Field>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Business email" required>
            <Input
              type="email"
              value={data.bizEmail}
              onChange={e => { update({ bizEmail: e.target.value }); clearError('bizEmail') }}
              placeholder="hello@yourbusiness.com"
              error={stepErrors['bizEmail']}
            />
            {stepErrors['bizEmail'] && (
              <p className="mt-1 text-xs text-red-400">{stepErrors['bizEmail']}</p>
            )}
          </Field>

          <Field label="Business phone" required>
            <Input
              type="tel"
              value={data.bizPhone}
              onChange={e => { update({ bizPhone: e.target.value }); clearError('bizPhone') }}
              placeholder="+61 4xx xxx xxx"
              error={stepErrors['bizPhone']}
            />
            {stepErrors['bizPhone'] && (
              <p className="mt-1 text-xs text-red-400">{stepErrors['bizPhone']}</p>
            )}
          </Field>
        </div>

        <Divider />

        {/* ── Business info ── */}
        <Field label="Business name" required>
          <Input
            value={data.bizName}
            onChange={e => { update({ bizName: e.target.value }); clearError('bizName') }}
            placeholder="e.g. Acme Solutions"
            error={stepErrors['bizName']}
          />
          {stepErrors['bizName'] && (
            <p className="mt-1 text-xs text-red-400">{stepErrors['bizName']}</p>
          )}
        </Field>

        <Field label="Tagline or slogan" hint="(optional)">
          <Input
            value={data.bizTagline}
            onChange={e => update({ bizTagline: e.target.value })}
            placeholder="e.g. Building tomorrow, today"
          />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Business registration" hint="(optional)">
            <Input
              value={data.bizReg}
              onChange={e => update({ bizReg: e.target.value })}
              placeholder="ABN, ACN..."
            />
          </Field>
          <Field label="Year established">
            <Input
              value={data.bizYear}
              onChange={e => update({ bizYear: e.target.value })}
              placeholder="e.g. 2018"
            />
          </Field>
        </div>

        <Field label="What does your business do?" hint="(elevator pitch)">
          <Textarea
            value={data.bizDesc}
            onChange={e => update({ bizDesc: e.target.value })}
            placeholder="Describe your product or service in 2–3 sentences..."
          />
        </Field>

        <Field label="What makes you different from competitors?">
          <Textarea
            value={data.bizUsp}
            onChange={e => update({ bizUsp: e.target.value })}
            placeholder="Your unique selling proposition..."
          />
        </Field>

        <Field label="Who is your ideal customer?">
          <Textarea
            value={data.bizAudience}
            onChange={e => update({ bizAudience: e.target.value })}
            placeholder="e.g. Small business owners aged 30–50 in regional Victoria who need..."
          />
        </Field>

      </div>
    </div>
  )
}

// ── Step 4: Location & reach ───────────────────────────────────────────────

export function Step4() {
  const { data, update, currentStep, totalSteps } = useWizard()

  return (
    <div>
      <StepHeader
        step={currentStep}
        total={totalSteps}
        title="Location & service area"
        description="Where do you operate and who do you serve? This informs your SEO strategy and content."
      />
      <div className="flex flex-col gap-4">
        <Field label="Business address" hint="(leave blank if home-based or virtual)">
          <Input value={data.bizAddress} onChange={e => update({ bizAddress: e.target.value })} placeholder="123 Main St, Sydney NSW 2000" />
        </Field>

        <Field label="Service reach">
          <div className="flex flex-col gap-2">
            <OptionCard selected={data.serviceReach === 'local'} onClick={() => update({ serviceReach: 'local' })} title="Local / regional" subtitle="Serving a specific area or city" />
            <OptionCard selected={data.serviceReach === 'national'} onClick={() => update({ serviceReach: 'national' })} title="National" subtitle="Serving across the country" />
            <OptionCard selected={data.serviceReach === 'international'} onClick={() => update({ serviceReach: 'international' })} title="International" subtitle="Serving customers globally" />
          </div>
        </Field>

        {data.serviceReach === 'local' && (
          <Field label="Which suburbs, cities or regions do you serve?">
            <Input value={data.localArea} onChange={e => update({ localArea: e.target.value })} placeholder="e.g. Inner West Sydney, Blue Mountains..." />
          </Field>
        )}

        <Field label="Do clients visit you, or do you visit clients?">
          <Select value={data.visitType} onChange={e => update({ visitType: e.target.value })}>
            <option value="">Select...</option>
            <option>Clients visit my premises</option>
            <option>I visit clients</option>
            <option>Both</option>
            <option>Fully remote / online</option>
          </Select>
        </Field>

        <Field label="Do you offer online or remote services?">
          <Select value={data.onlineServices} onChange={e => update({ onlineServices: e.target.value })}>
            <option value="">Select...</option>
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
// Step 5: bizEmail and bizPhone removed — captured earlier in Step 3.
//         adAccounts field retained. Layout otherwise unchanged.

export function Step5() {
  const { data, update, toggleArray, currentStep, totalSteps } = useWizard()
 
  return (
    <div>
      <StepHeader
        step={currentStep}
        total={totalSteps}
        title="Your digital presence"
        description="Tell us where you currently exist online so we can connect everything together seamlessly."
      />
      <div className="flex flex-col gap-4">
 
        <Field label="Google Business Profile">
          <Select
            value={data.googleBusiness}
            onChange={e => update({ googleBusiness: e.target.value })}
          >
            <option value="">Select...</option>
            <option>Yes, I have one</option>
            <option>No, I'd like one set up</option>
            <option>Not sure</option>
          </Select>
        </Field>
 
        <Field label="Social media accounts" hint="(select all that apply)">
          <div className="flex flex-col gap-2">
            {SOCIAL_OPTIONS.map(s => (
              <CheckRow
                key={s}
                checked={data.socialMedia.includes(s)}
                onChange={() => toggleArray('socialMedia', s)}
                label={s}
              />
            ))}
          </div>
        </Field>
 
        <Divider />
 
        <Field label="Do you have existing email lists or CRM data?">
          <Select
            value={data.crm}
            onChange={e => update({ crm: e.target.value })}
          >
            <option value="">Select...</option>
            <option>Yes</option>
            <option>No</option>
            <option>Not sure</option>
          </Select>
        </Field>
 
        <Field label="Existing advertising accounts" hint="(optional)">
          <Input
            value={data.adAccounts}
            onChange={e => update({ adAccounts: e.target.value })}
            placeholder="e.g. Google Ads, Meta Ads..."
          />
        </Field>
 
      </div>
    </div>
  )
}
 

// ── Step 6: Branding & design ──────────────────────────────────────────────

export function Step6() {
  const { data, update, currentStep, totalSteps } = useWizard()

  return (
    <div>
      <StepHeader
        step={currentStep}
        total={totalSteps}
        title="Branding & design"
        description="Upload your brand assets and tell us about your visual style. The more detail, the better we can match your vision."
      />
      <div className="flex flex-col gap-5">
        <Field label="Business logo">
          <UploadZone
            id="logo-upload"
            label="Click to upload your logo"
            sublabel="SVG, PNG, AI, EPS or PDF — any size"
            accept="image/*,.svg,.pdf,.ai,.eps"
            files={data.logoFiles}
            onFiles={files => update({ logoFiles: files })}
          />
          {data.logoFiles.length === 0 && (
            <InfoBox>No logo yet? We can design one — add Logo Design in the add-ons step.</InfoBox>
          )}
        </Field>

        <Field label="Photos & images for your website">
          <UploadZone
            id="photos-upload"
            label="Click to upload photos"
            sublabel="JPG, PNG, WEBP — multiple files accepted"
            accept="image/*"
            multiple
            files={data.photoFiles}
            onFiles={files => update({ photoFiles: files })}
          />
        </Field>

        <Field label="Design style preference">
          <Select value={data.designStyle} onChange={e => update({ designStyle: e.target.value })}>
            <option value="">Select...</option>
            {['Modern & minimal', 'Bold & vibrant', 'Corporate & professional', 'Warm & friendly', 'Luxury & premium', 'Playful & creative', 'Industrial & technical', "Not sure — I'd like suggestions"].map(s => (
              <option key={s}>{s}</option>
            ))}
          </Select>
        </Field>

        <Field label="Brand colours" hint="(hex codes or descriptions)">
          <Input value={data.brandColours} onChange={e => update({ brandColours: e.target.value })} placeholder="e.g. #1A2E4A, #F5A623, or 'deep navy and gold'" />
        </Field>

        <Field label="Websites you love" hint="(and why)">
          <Textarea value={data.sitesLove} onChange={e => update({ sitesLove: e.target.value })} placeholder="URL — what you like about it..." />
        </Field>

        <Field label="Websites you dislike" hint="(and why)">
          <Textarea value={data.sitesDislike} onChange={e => update({ sitesDislike: e.target.value })} placeholder="URL — what to avoid..." />
        </Field>
      </div>
    </div>
  )
}

// ── Step 7: Pages & content ────────────────────────────────────────────────

export function Step7() {
  const { data, update, toggleArray, currentStep, totalSteps } = useWizard()

  return (
    <div>
      <StepHeader
        step={currentStep}
        total={totalSteps}
        title="Pages & content"
        description="Select the pages you need and tell us about your content situation."
      />
      <div className="flex flex-col gap-5">
        <Field label="Which pages do you need?" hint="(select all that apply)">
          <div className="flex flex-col gap-2">
            {PAGE_OPTIONS.map(p => (
              <CheckRow
                key={p.value}
                checked={data.pages.includes(p.value)}
                onChange={() => toggleArray('pages', p.value)}
                label={p.label}
              />
            ))}
          </div>
        </Field>

        <Divider />

        <Field label="Who will write the website content?">
          <Select value={data.contentAuthor} onChange={e => update({ contentAuthor: e.target.value })}>
            <option value="">Select...</option>
            <option>I'll provide all content</option>
            <option>Done-for-me copywriting (add-on)</option>
            <option>A mix — I'll provide some, you fill in the rest</option>
          </Select>
        </Field>

        <Field label="Do you have existing text or copy to use?">
          <Select value={data.existingCopy} onChange={e => update({ existingCopy: e.target.value })}>
            <option value="">Select...</option>
            <option>Yes, I'll provide it</option>
            <option>No, starting from scratch</option>
          </Select>
        </Field>

        <Field label="Do you need multilingual support?">
          <Select value={data.multilingual} onChange={e => update({ multilingual: e.target.value })}>
            <option value="">Select...</option>
            <option>No</option>
            <option>Yes</option>
          </Select>
        </Field>

        {data.multilingual === 'Yes' && (
          <Field label="Which languages?">
            <Input value={data.languages} onChange={e => update({ languages: e.target.value })} placeholder="e.g. English, Mandarin, Spanish..." />
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
      <StepHeader
        step={currentStep}
        total={totalSteps}
        title="Features & functionality"
        description="Select everything you'd like your website to do. We'll scope it all out properly."
      />
      <div className="flex flex-col gap-5">
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-widest text-slate-500">E-commerce</p>
          <AddOnRow
            checked={data.hasEcommerce}
            onChange={() => update({ hasEcommerce: !data.hasEcommerce })}
            name="Online shop"
            description="Sell products or services directly from your site"
            price="Included in selected plans"
          />
          {data.hasEcommerce && (
            <div className="mt-3 flex flex-col gap-3 rounded-xl border border-slate-800 bg-slate-900/60 p-4">
              <Field label="Physical or digital products?">
                <Select value={data.productType} onChange={e => update({ productType: e.target.value })}>
                  <option value="">Select...</option>
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
                <Input value={data.paymentGateways} onChange={e => update({ paymentGateways: e.target.value })} placeholder="Stripe, PayPal, Afterpay, Zip..." />
              </Field>
              <Field label="Do you need inventory management?">
                <Select value={data.inventoryMgmt} onChange={e => update({ inventoryMgmt: e.target.value })}>
                  <option value="">Select...</option>
                  <option>Yes</option>
                  <option>No</option>
                </Select>
              </Field>
            </div>
          )}
        </div>

        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-widest text-slate-500">Bookings & scheduling</p>
          <AddOnRow
            checked={data.hasBookings}
            onChange={() => update({ hasBookings: !data.hasBookings })}
            name="Online bookings"
            description="Let clients book appointments or services online"
            price="Included in selected plans"
          />
          {data.hasBookings && (
            <div className="mt-3 flex flex-col gap-3 rounded-xl border border-slate-800 bg-slate-900/60 p-4">
              <Field label="Do you require deposits or upfront payment?">
                <Select value={data.bookingPayment} onChange={e => update({ bookingPayment: e.target.value })}>
                  <option value="">Select...</option>
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
              <CheckRow
                key={f.value}
                checked={data.features.includes(f.value)}
                onChange={() => toggleArray('features', f.value)}
                label={f.label}
              />
            ))}
          </div>
        </div>

        <Field label="Third-party integrations needed" hint="(optional)">
          <Input value={data.integrations} onChange={e => update({ integrations: e.target.value })} placeholder="e.g. Xero, HubSpot, Mailchimp, POS system..." />
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
      <StepHeader
        step={currentStep}
        total={totalSteps}
        title="Add-ons & extras"
        description="Enhance your website with premium services. Selected items are added to your project quote."
      />
      <div className="flex flex-col gap-3">
        {ADD_ONS.map(a => (
          <AddOnRow
            key={a.id}
            checked={data.addOns.includes(a.id)}
            onChange={() => toggleArray('addOns', a.id)}
            name={a.name}
            description={a.description}
            price={a.price}
          />
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
      <StepHeader
        step={currentStep}
        total={totalSteps}
        title="Timeline & budget"
        description="Help us plan the project around your needs. There are no wrong answers here."
      />
      <div className="flex flex-col gap-4">
        <Field label="Budget range">
          <Select value={data.budget} onChange={e => update({ budget: e.target.value })}>
            <option value="">Select...</option>
            {['Under $1,000', '$1,000 – $2,500', '$2,500 – $5,000', '$5,000 – $10,000', '$10,000 – $25,000', '$25,000+', "Not sure — I'd like a quote"].map(b => (
              <option key={b}>{b}</option>
            ))}
          </Select>
        </Field>

        <Field label="Do you have a launch deadline?">
          <Select value={data.hasDeadline} onChange={e => update({ hasDeadline: e.target.value })}>
            <option value="">Select...</option>
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
              <Input value={data.deadlineReason} onChange={e => update({ deadlineReason: e.target.value })} placeholder="e.g. event launch, campaign, product release..." />
            </Field>
          </>
        )}

        <Field label="Build approach">
          <Select value={data.buildApproach} onChange={e => update({ buildApproach: e.target.value })}>
            <option value="">Select...</option>
            <option>Full build at once</option>
            <option>Launch MVP first, add features later</option>
            <option>Not sure — advise me</option>
          </Select>
        </Field>

        <Field label="Do you have internal resources to assist?" hint="(design, dev, content)">
          <Select value={data.internalResources} onChange={e => update({ internalResources: e.target.value })}>
            <option value="">Select...</option>
            <option>Yes</option>
            <option>No</option>
            <option>Maybe — depends on scope</option>
          </Select>
        </Field>

        <Field label="Anything else you'd like us to know?">
          <Textarea
            rows={4}
            value={data.extraNotes}
            onChange={e => update({ extraNotes: e.target.value })}
            placeholder="Special requirements, concerns, questions, or anything that didn't fit above..."
          />
        </Field>
      </div>
    </div>
  )
}

// ── Step 11: Summary & submit ──────────────────────────────────────────────
// Replace the Step11 export in WizardSteps.tsx with this version.
//
// Changes from original:
//  - Pre-submit validation checks bizName + bizEmail before fetch
//  - Inline error state replaces alert()
//  - Submitting state disables button and shows loading label
//  - Client confirmation email copy matches Path A positioning

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

  // Check required fields before attempting fetch
  const getMissingFields = () => {
    const missing: string[] = []
    if (!data.bizName?.trim()) missing.push('business name (Step 3)')
    if (!data.bizEmail?.trim()) missing.push('email address (Step 5)')
    return missing
  }

  const handleSubmit = async () => {
  setError(null)

  const missing = getMissingFields()
  if (missing.length > 0) {
    setError(`Please go back and complete the following before submitting: ${missing.join(' and ')}.`)
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
      // Scroll the brief section into view before swapping content
      document.getElementById('brief')?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      })
      // Small delay so the scroll completes before the DOM swap
      setTimeout(() => setIsSubmitted(true), 400)
    } else {
      const body = await res.json().catch(() => null)
      setError(
        body?.error ??
        'Something went wrong. Please try again, or email us at contact@webf5.au'
      )
    }
  } catch {
    setError('Could not reach the server — please check your connection and try again.')
  } finally {
    setSubmitting(false)
  }
}

  return (
    <div>
      <StepHeader
        step={currentStep}
        total={totalSteps}
        title="Review your brief"
        description="Here's a summary of everything you've told us. Take a moment to review before submitting."
      />
      <div className="flex flex-col gap-4">

        <SummarySection title="Starting point">
          <SummaryRow label="Project type" value={data.startType} />
          <SummaryRow label="Current URL" value={data.existingUrl} />
        </SummarySection>

        <SummarySection title="Domain">
          <SummaryRow label="Domain situation" value={data.domainStatus} />
          <SummaryRow label="Domain" value={data.domainName || data.domainIdeas} />
          <SummaryRow label="Registrar" value={data.domainRegistrar} />
        </SummarySection>

        <SummarySection title="Business">
          <SummaryRow label="Name" value={data.bizName} />
          <SummaryRow label="Tagline" value={data.bizTagline} />
          <SummaryRow label="Year est." value={data.bizYear} />
          <SummaryRow label="Description" value={data.bizDesc} />
          <SummaryRow label="Audience" value={data.bizAudience} />
        </SummarySection>

        <SummarySection title="Location">
          <SummaryRow label="Address" value={data.bizAddress} />
          <SummaryRow label="Reach" value={data.serviceReach} />
          <SummaryRow label="Service area" value={data.localArea} />
        </SummarySection>

        <SummarySection title="Digital presence">
          <SummaryRow label="Google Business" value={data.googleBusiness} />
          <SummaryRow label="Social media" value={data.socialMedia.join(', ')} />
          <SummaryRow label="Email" value={data.bizEmail} />
          <SummaryRow label="Phone" value={data.bizPhone} />
        </SummarySection>

        <SummarySection title="Design">
          <SummaryRow label="Style" value={data.designStyle} />
          <SummaryRow label="Brand colours" value={data.brandColours} />
          <SummaryRow label="Logo uploaded" value={data.logoFiles.length > 0 ? `${data.logoFiles.length} file(s)` : ''} />
          <SummaryRow label="Photos uploaded" value={data.photoFiles.length > 0 ? `${data.photoFiles.length} file(s)` : ''} />
        </SummarySection>

        <SummarySection title="Pages & content">
          <SummaryRow label="Pages" value={data.pages.join(', ')} />
          <SummaryRow label="Content author" value={data.contentAuthor} />
          <SummaryRow label="Multilingual" value={data.multilingual} />
        </SummarySection>

        <SummarySection title="Features">
          <SummaryRow label="E-commerce" value={data.hasEcommerce ? 'Yes' : ''} />
          <SummaryRow label="Bookings" value={data.hasBookings ? 'Yes' : ''} />
          <SummaryRow label="Other features" value={data.features.join(', ')} />
          <SummaryRow label="Integrations" value={data.integrations} />
        </SummarySection>

        {selectedAddOns.length > 0 && (
          <SummarySection title="Add-ons">
            {selectedAddOns.map(a => (
              <SummaryRow key={a.id} label={a.name} value={a.price} />
            ))}
          </SummarySection>
        )}

        <SummarySection title="Timeline & budget">
          <SummaryRow label="Budget" value={data.budget} />
          <SummaryRow label="Launch date" value={data.launchDate} />
          <SummaryRow label="Approach" value={data.buildApproach} />
          <SummaryRow label="Notes" value={data.extraNotes} />
        </SummarySection>

        {/* Inline error message */}
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