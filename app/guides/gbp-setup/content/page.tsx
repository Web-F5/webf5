import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { courseEntitlements } from '@/lib/db/schema'
import { and, eq, isNull, or } from 'drizzle-orm'
import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Set Up Your Google Business Profile',
  robots: { index: false },
}

export default async function GbpSetupContentPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in?redirect_url=/guides/gbp-setup/content')

  const [entitlement] = await db
    .select()
    .from(courseEntitlements)
    .where(and(
      eq(courseEntitlements.userId, userId),
      or(
        eq(courseEntitlements.courseId, 'gbp-setup'),
        eq(courseEntitlements.courseId, 'gbp-bundle'),
      ),
      isNull(courseEntitlements.refundedAt),
    ))
    .limit(1)

  if (!entitlement) redirect('/guides/gbp-setup')

  const [guide2Entitlement] = await db
    .select()
    .from(courseEntitlements)
    .where(and(
      eq(courseEntitlements.userId, userId),
      or(
        eq(courseEntitlements.courseId, 'gbp-optimise'),
        eq(courseEntitlements.courseId, 'gbp-bundle'),
      ),
      isNull(courseEntitlements.refundedAt),
    ))
    .limit(1)

  const hasGuide2 = !!guide2Entitlement

  return (
    <main className="min-h-screen pt-16 pb-16 px-4">
      <div className="max-w-2xl mx-auto">

        <div className="mb-12 pt-8">
          <p className="text-emerald-400 text-sm font-medium tracking-widest uppercase mb-3">Web F5 · GBP Guide 1 of 2</p>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 leading-tight text-balance">
            Set Up Your Google Business Profile
          </h1>
          <p className="text-foreground/60 text-base">
            7 steps · 2-3 hours total · Assumes no existing profile
          </p>
        </div>

        <nav className="mb-12 flex flex-wrap gap-2">
          {[
            ['#step-0', '0 · Before You Start'],
            ['#step-1', '1 · Create Your Profile'],
            ['#step-2', '2 · Choose Verification'],
            ['#step-3', '3 · Fill Every Field'],
            ['#step-4', '4 · Add Photos'],
            ['#step-5', '5 · Service Area'],
            ['#step-6', '6 · Your First Week'],
            ['#stc', 'Subject to Change'],
          ].map(([href, label]) => (
            <a key={href} href={href} className="text-xs font-medium bg-card/50 border border-border rounded-lg px-3 py-1.5 text-foreground/60 hover:text-foreground hover:border-emerald-500/30 transition-colors">
              {label}
            </a>
          ))}
        </nav>

        <div className="guide-content">

          {/* STEP 0 */}
          <section id="step-0" className="guide-module">
            <ModuleHeader num="00" label="Getting started" title="Before You Start" />
            <p className="guide-intro">Five minutes here will save you two hours of frustration. Google Business Profile setup has a few gotchas that catch most people. Read this first.</p>

            <h3 className="guide-h3">What you'll have when you're done</h3>
            <ul className="guide-list">
              <li>A verified Google Business Profile visible in Google Search and Maps</li>
              <li>Every field filled in correctly - not just the minimum</li>
              <li>Photos uploaded in a way that signals an active, trustworthy business</li>
              <li>Your service area set so you appear in the right suburbs</li>
            </ul>

            <h3 className="guide-h3">What you need</h3>
            <ul className="guide-list">
              <li>A Google account (Gmail is fine)</li>
              <li>Your business name, phone number, and address (or service area)</li>
              <li>Your ABN handy - Google may ask to verify you're a real business</li>
              <li>3-5 photos of your work or yourself (phone photos are fine)</li>
              <li>15-20 minutes to complete the initial setup</li>
              <li>Patience for the verification step, which can take 3-14 days</li>
            </ul>

            <h3 className="guide-h3">The one thing most people get wrong</h3>
            <p className="text-sm text-foreground/70 leading-relaxed my-4">
              Most tradies rush the setup, do the bare minimum to get the profile live, then wonder why competitors rank above them. The difference between a mediocre GBP and one that drives enquiries is 90 minutes of careful setup. That's what this guide is for.
            </p>

            <Callout type="tip" title="Already have a profile?">
              If your business already has a GBP (sometimes Google creates them automatically), search for it at <strong>business.google.com</strong> and claim it rather than creating a duplicate. Duplicates confuse Google and split your reviews. Once you've claimed it, use this guide to fill it in properly - then use <a href="/guides/gbp-optimise" className="text-emerald-400 underline underline-offset-2">Guide 2</a> to optimise it.
            </Callout>
          </section>

          {/* STEP 1 */}
          <section id="step-1" className="guide-module">
            <ModuleHeader num="01" label="The foundation" title="Create Your Google Business Profile" />
            <p className="guide-intro">Creating the profile takes about 15 minutes. The key is making the right choices at each step - particularly your business category, which is the single most important ranking factor in local search.</p>

            <Steps items={[
              {
                n: 1,
                title: 'Go to business.google.com',
                body: <>
                  <p>Open <strong>business.google.com</strong> in a browser where you're signed into your Google account. Click <strong>"Manage now"</strong> or <strong>"Add your business."</strong></p>
                  <p>If you're signed into multiple Google accounts, make sure you're using the one you want permanently associated with this business. You can add managers later, but you can't easily transfer ownership.</p>
                </>,
              },
              {
                n: 2,
                title: 'Enter your business name',
                body: <>
                  <p>Type your exact business name. As you type, Google will show suggestions for existing businesses. If your business appears in the list, click <strong>Claim this business</strong> rather than creating a new one.</p>
                  <p>If it doesn't appear, type your full business name and click <strong>Add your business to Google.</strong></p>
                  <Callout type="warn" title="Exact name matters">
                    Use your real, legal trading name. Don't stuff keywords into it (e.g. "Smith Plumbing - Best Plumber Bendigo"). Google has suspended profiles for this, and it looks unprofessional to customers.
                  </Callout>
                </>,
              },
              {
                n: 3,
                title: 'Choose your primary business category',
                body: <>
                  <p>This is the most important decision in your entire GBP setup. Your primary category tells Google what kind of business you are, and it directly determines which searches you appear in.</p>
                  <p>Be specific. Don't choose "Contractor" when "Electrician" or "Plumber" is available. Don't choose "Home Services" when "Landscaper" exists.</p>
                  <ul className="guide-list mt-2">
                    <li><strong>Plumber</strong> - not "Plumbing Supply Store" or "Plumbing Service"</li>
                    <li><strong>Electrician</strong> - not "Electrical Supply Store"</li>
                    <li><strong>Roofer</strong> - not "Roofing Contractor" (check what's available)</li>
                    <li><strong>Painter</strong> - not "Painting" or "Painting Contractor"</li>
                  </ul>
                  <p>You can add secondary categories later. Pick the most accurate primary category first.</p>
                </>,
              },
              {
                n: 4,
                title: 'Choose whether you have a physical location',
                body: <>
                  <p>Google asks: "Do you want to add a location customers can visit?"</p>
                  <ul className="guide-list mt-2">
                    <li><strong>Yes</strong> - if you have a shopfront, office, or workshop customers visit</li>
                    <li><strong>No</strong> - if you go to customers (most tradies)</li>
                  </ul>
                  <p>Most Victorian tradies choose <strong>No</strong>. This makes your profile a "Service Area Business" - your address stays private (or you can optionally show your suburb), and you set the areas you serve instead.</p>
                  <p>If you work from a home address and don't want it public, definitely choose <strong>No.</strong></p>
                </>,
              },
              {
                n: 5,
                title: 'Add your service area',
                body: <>
                  <p>If you chose "No" above, Google will ask for your service area. Enter the cities, suburbs, or regions you serve. You can add up to 20 areas.</p>
                  <p>Be realistic. Listing 50 suburbs when you only work in 10 can dilute your local ranking. Start with your main areas and expand later.</p>
                </>,
              },
              {
                n: 6,
                title: 'Add your contact details',
                body: <>
                  <p>Enter your phone number and website URL.</p>
                  <ul className="guide-list mt-2">
                    <li><strong>Phone:</strong> Use the number you actually answer. Missed calls from GBP are missed jobs.</li>
                    <li><strong>Website:</strong> If you have one, add it. If not, leave it blank for now - adding a poor website is worse than none.</li>
                  </ul>
                  <Callout type="tip" title="NAP consistency">
                    Your business Name, Address (or suburb), and Phone must be identical everywhere online - your website, your GBP, and any other directories. "0419 510 206" and "(0419) 510 206" are technically different to some crawlers. Pick one format and stick to it everywhere.
                  </Callout>
                </>,
              },
            ]} />
          </section>

          {/* STEP 2 */}
          <section id="step-2" className="guide-module">
            <ModuleHeader num="02" label="Proving you're real" title="Choose Your Verification Method" />
            <p className="guide-intro">Google won't show your profile publicly until you verify it. The verification method you're offered depends on your business type and category. Here's what each option means and which to choose.</p>

            <Steps items={[
              {
                n: 1,
                title: 'Postcard verification (most common)',
                body: <>
                  <p>Google mails a postcard with a 5-digit PIN to your business address. When it arrives (usually 3-14 days), sign into your GBP and enter the PIN.</p>
                  <p>This is the most common method for new profiles. The card looks like junk mail - keep an eye out for it and don't discard it. If it doesn't arrive after 14 days, you can request a new one.</p>
                  <Callout type="warn" title="Service area businesses">
                    If you're a service area business with no physical address, Google may ask for a postcard at your home address. This is normal and your home address will not be made public on your profile.
                  </Callout>
                </>,
              },
              {
                n: 2,
                title: 'Phone or SMS verification',
                body: <>
                  <p>Some accounts are offered instant phone or SMS verification. Google calls or texts your business number with a code. Enter it and you're verified immediately.</p>
                  <p>If this option is available to you, take it - it's much faster than waiting for a postcard.</p>
                </>,
              },
              {
                n: 3,
                title: 'Video recording verification',
                body: <>
                  <p>Google may ask you to record a short video showing your business, your tools, your vehicle, or your team. This is increasingly common for new profiles.</p>
                  <p>Film a 1-2 minute walkthrough showing: your business vehicle with signage (if you have it), your tools or equipment, yourself at work, and ideally your business name written somewhere. It doesn't need to be professional - a phone video is fine. Google reviewers watch these within a few days.</p>
                </>,
              },
              {
                n: 4,
                title: 'What to do while you wait',
                body: <>
                  <p>Your profile is partially visible while you wait for verification, but Google limits what it shows. Use this time to complete Steps 3-5 in this guide - fill in all the details, add photos, and set your service area. Everything will go live as soon as you verify.</p>
                  <p>Don't wait to fill in the profile. The faster you complete it after verifying, the faster Google starts showing it.</p>
                </>,
              },
            ]} />
          </section>

          {/* STEP 3 */}
          <section id="step-3" className="guide-module">
            <ModuleHeader num="03" label="The detail work" title="Fill In Every Field" />
            <p className="guide-intro">Most profiles are half-finished. Competitors who fill in every field have a consistent ranking advantage. This step takes about 45 minutes but it compounds over time.</p>

            <Steps items={[
              {
                n: 1,
                title: 'Business description (750 characters)',
                body: <>
                  <p>Write a description that covers: what you do, where you work, and who you're best for. Mention your main services and suburbs naturally - don't stuff it with keywords.</p>
                  <p>Example for a plumber in Bendigo: <em>"Smith Plumbing provides residential and commercial plumbing services across Bendigo and Central Victoria. We specialise in hot water systems, drain clearing, bathroom renovations, and emergency callouts. Family-owned and operating in the region since 2008."</em></p>
                  <p>The description does not directly affect ranking, but it's the first thing a potential customer reads when they click your profile. Write it for them, not for Google.</p>
                </>,
              },
              {
                n: 2,
                title: 'Business hours',
                body: <>
                  <p>Set your real hours. If you do emergency callouts outside regular hours, add a note in your description - GBP doesn't have a field for this.</p>
                  <p>If your hours vary by season, update them before the change. A profile showing "Open" when you're closed is worse than showing accurate hours. Google penalises profiles with high rates of "marked as closed" reports from customers.</p>
                </>,
              },
              {
                n: 3,
                title: 'Attributes',
                body: <>
                  <p>In your profile dashboard, look for <strong>Edit profile → More → Attributes.</strong> These are checkboxes specific to your business category. Common ones for tradies include:</p>
                  <ul className="guide-list mt-2">
                    <li>Identifies as veteran-led</li>
                    <li>Women-led</li>
                    <li>On-site services available</li>
                    <li>LGBTQ+ friendly</li>
                  </ul>
                  <p>Check everything that honestly applies. Attributes appear on your profile and some customers filter by them.</p>
                </>,
              },
              {
                n: 4,
                title: 'Services',
                body: <>
                  <p>Go to <strong>Edit profile → Services.</strong> Google will suggest services based on your category. Add the ones you offer. You can also add custom services Google doesn't suggest.</p>
                  <p>For each service, add a description - one or two sentences is enough. This is important for Guide 2's optimisation work, but do the basics now.</p>
                </>,
              },
              {
                n: 5,
                title: 'From the business',
                body: <>
                  <p>Some categories show a <strong>"From the business"</strong> section where you can highlight key points in a more structured way. If you see it, use it. Write 2-3 short bullet points about what makes you different: years of experience, specific qualifications, a guarantee you offer, or a niche you've built.</p>
                </>,
              },
            ]} />
          </section>

          {/* STEP 4 */}
          <section id="step-4" className="guide-module">
            <ModuleHeader num="04" label="Visual credibility" title="Add Photos" />
            <p className="guide-intro">Profiles with photos get significantly more clicks than those without. You don't need professional photography. You need recent, real photos that show your work and your professionalism.</p>

            <Steps items={[
              {
                n: 1,
                title: 'Add a logo',
                body: <>
                  <p>Go to <strong>Edit profile → Photos → Logo.</strong> Recommended size: 720x720px. If you don't have a logo, a clean photo of your business name on your vehicle or uniform is fine.</p>
                  <p>The logo appears as a small thumbnail next to your business name in search results. It doesn't need to be elaborate - it just needs to exist and be clear at small sizes.</p>
                </>,
              },
              {
                n: 2,
                title: 'Add a cover photo',
                body: <>
                  <p>Go to <strong>Edit profile → Photos → Cover.</strong> Recommended size: 1080x608px (landscape). This is the main image shown when someone views your full profile.</p>
                  <p>Use a photo of a completed job, your team, or your vehicle. Avoid stock photos - Google's algorithm and customers both respond better to real photos.</p>
                </>,
              },
              {
                n: 3,
                title: 'Add at least 5 work photos',
                body: <>
                  <p>Go to <strong>Edit profile → Photos → Add photos.</strong> Upload photos of completed jobs. Good options include: before/after pairs, your team on-site, close-ups of quality workmanship, and your vehicle(s).</p>
                  <p>Phone photos from recent jobs are perfect. You don't need a DSLR camera. Clean, well-lit, in-focus photos of real work are more convincing than posed professional shots.</p>
                  <Callout type="tip" title="File names matter">
                    Rename your photos descriptively before uploading. "bendigo-plumber-hot-water-installation.jpg" sends a mild signal to Google. "IMG_4829.jpg" sends none. It's a small thing, but do it while you're here.
                  </Callout>
                </>,
              },
              {
                n: 4,
                title: 'Turn on photo updates from customers',
                body: <>
                  <p>Customers can add photos to your profile. You can't turn this off, but you can flag inappropriate photos for removal. Check your profile periodically to ensure photos from customers accurately represent your business.</p>
                </>,
              },
            ]} />
          </section>

          {/* STEP 5 */}
          <section id="step-5" className="guide-module">
            <ModuleHeader num="05" label="Getting found locally" title="Set Your Service Area Correctly" />
            <p className="guide-intro">For service area businesses (tradies who go to customers), your service area determines which location-based searches you can appear in. Getting this right is important.</p>

            <Steps items={[
              {
                n: 1,
                title: 'Edit your service area',
                body: <>
                  <p>Go to <strong>Edit profile → Business location → Service area.</strong> You can add up to 20 areas. You can enter: cities, suburbs, postcodes, or regions.</p>
                  <p>Google recommends keeping your service area within a 2-hour drive of your base. Areas outside that range may not show your profile even if listed.</p>
                </>,
              },
              {
                n: 2,
                title: 'Strategy: depth before breadth',
                body: <>
                  <p>It's better to rank well in 10 suburbs than poorly in 50. Start with the areas you actually work in most. You can always add more later as your profile gains authority through reviews and activity.</p>
                  <p>Include the suburbs where your best customers are located, even if you cover a wider area. Quality signals (reviews, engagement) from a concentrated area build ranking faster than spreading thin.</p>
                </>,
              },
              {
                n: 3,
                title: 'Include your base suburb',
                body: <>
                  <p>Even if you don't show an address, include the suburb or city where you're based. Google uses proximity signals to determine relevance - if your base is Bendigo, being listed in Bendigo searches is more achievable than ranking in Melbourne.</p>
                </>,
              },
            ]} />
          </section>

          {/* STEP 6 */}
          <section id="step-6" className="guide-module">
            <ModuleHeader num="06" label="The first 7 days" title="Your First Week After Verification" />
            <p className="guide-intro">The week after verification is when Google is actively evaluating your new profile. Here's what to do immediately to get the best start.</p>

            <Steps items={[
              {
                n: 1,
                title: 'Ask for your first 3-5 reviews immediately',
                body: <>
                  <p>Reviews are the single most powerful ranking factor for a new GBP. Go into your profile, find the share link (it looks like "g.page/yourbusiness/review"), and send it to 3-5 happy past customers.</p>
                  <p>Keep the message simple: <em>"Hi [name], I've just set up my Google Business Profile and I'd appreciate a quick review. Here's the link: [URL]. Even a sentence or two would be a great help."</em></p>
                  <p>Don't ask for 5 stars specifically - that can feel pushy and Google may filter reviews that mention star ratings in the ask.</p>
                </>,
              },
              {
                n: 2,
                title: 'Create your first Google Post',
                body: <>
                  <p>Go to <strong>Google Posts</strong> in your profile dashboard. Write a short post - a completed job, an introduction to your business, or a current offer. Add a photo.</p>
                  <p>This signals to Google that your profile is active. An active profile ranks better than a dormant one.</p>
                </>,
              },
              {
                n: 3,
                title: 'Answer any questions in the Q&A section',
                body: <>
                  <p>Anyone can add a question to your profile's Q&A section - including you. Pre-populate it with the questions you get asked most: "Do you offer free quotes?", "What areas do you cover?", "Are you licensed and insured?"</p>
                  <p>Answering your own common questions provides useful information and fills the profile with relevant keywords naturally.</p>
                </>,
              },
              {
                n: 4,
                title: 'Set up notifications',
                body: <>
                  <p>In your GBP settings, turn on email notifications for new reviews, questions, and messages. Responding to reviews and questions quickly is both good for customers and good for your ranking.</p>
                </>,
              },
              {
                n: 5,
                title: 'Check how you appear',
                body: <>
                  <p>Google "your business name + your suburb" on your phone (not your computer - Google personalises desktop results based on your account). Your profile should appear in the right panel. If it doesn't appear yet, wait 24-48 hours after verification.</p>
                </>,
              },
            ]} />
          </section>

          {/* SUBJECT TO CHANGE */}
          <section id="stc" className="guide-module">
            <div className="bg-card/50 border border-border rounded-2xl p-6">
              <h2 className="text-base font-bold mb-4">Subject to Change</h2>
              <p className="text-sm text-foreground/50 mb-6">Google Business Profile's interface, verification methods, and features change regularly. If the steps above don't match what you're seeing, check the notes below.</p>
              <div className="flex flex-col divide-y divide-border">
                {[
                  ['Verification methods', 'Google has progressively phased out phone and email verification in favour of postcard, video, and manual review. The method offered to you depends on your category and account history. As of mid-2025, video verification is increasingly common for new accounts. Check Google\'s own help documentation for the current list of methods.'],
                  ['Profile interface', 'Google has moved GBP management from a dedicated app and website to appearing directly in Google Search. To manage your profile in 2025, search for your business name while signed in, and you\'ll see "Manage your Business Profile" at the top. The menus referenced in this guide may have moved. If you can\'t find something, use Google\'s built-in help.'],
                  ['Category availability', "Google regularly adds and removes business categories. If the specific category mentioned in this guide isn't available, choose the closest equivalent. Your ranking will adjust as Google maps your category to searches."],
                  ['Photo requirements', 'Minimum photo sizes and formats are occasionally updated. Current recommendation: JPEG or PNG, minimum 720px on the short side, under 5MB. Check Google\'s current guidelines if photos are being rejected.'],
                ].map(([service, detail]) => (
                  <div key={service} className="py-4">
                    <p className="font-semibold text-sm mb-1">{service}</p>
                    <p className="text-sm text-foreground/50 leading-relaxed">{detail}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Next guide upsell / access */}
          <div className="mt-12 border border-emerald-500/20 rounded-2xl p-6 bg-emerald-500/5">
            <p className="text-xs font-medium uppercase tracking-widest text-emerald-400 mb-2">Next: Guide 2</p>
            <h3 className="text-xl font-bold mb-2">Ready to optimise what you've built?</h3>
            <p className="text-sm text-foreground/50 leading-relaxed mb-5">
              Guide 2 covers the optimisation work: categories, services, photos strategy, Google Posts, getting reviews, and using the Web F5 Review Request Sender.
            </p>
            {hasGuide2 ? (
              <Link href="/guides/gbp-optimise/content" className="inline-block bg-emerald-600 text-white text-sm font-semibold px-6 py-2.5 rounded-xl hover:bg-emerald-500 transition-colors">
                Read Guide 2 →
              </Link>
            ) : (
              <Link href="/guides/gbp-optimise" className="inline-block bg-emerald-600 text-white text-sm font-semibold px-6 py-2.5 rounded-xl hover:bg-emerald-500 transition-colors">
                Get Guide 2 - $19 →
              </Link>
            )}
          </div>

          {/* Web F5 CTA */}
          <div className="mt-6 border border-primary/20 rounded-2xl p-6 bg-primary/5 text-center">
            <p className="font-semibold mb-2">Want someone to do this for you?</p>
            <p className="text-sm text-foreground/50 mb-4">Web F5 sets up and manages Google Business Profiles for tradies across Central Victoria.</p>
            <Link href="/contact" className="inline-block bg-primary text-white text-sm font-semibold px-6 py-2.5 rounded-xl hover:bg-primary/90 transition-colors">Talk to Web F5 →</Link>
          </div>

        </div>
      </div>
    </main>
  )
}

// ── Sub-components ────────────────────────────────────────────────────────────

function ModuleHeader({ num, label, title }: { num: string; label: string; title: string }) {
  return (
    <div className="flex items-start gap-4 mb-6 pb-5 border-b border-border">
      <span className="font-bold text-2xl text-emerald-400/20 tabular-nums flex-shrink-0 w-12 text-right">{num}</span>
      <div>
        <p className="text-xs font-semibold tracking-widest uppercase text-emerald-400 mb-1">{label}</p>
        <h2 className="text-xl font-bold leading-snug text-balance">{title}</h2>
      </div>
    </div>
  )
}

function Steps({ items }: { items: { n: number; title: string; body: React.ReactNode }[] }) {
  return (
    <div className="flex flex-col">
      {items.map((item, i) => (
        <div key={item.n} className="grid grid-cols-[36px_1fr] gap-4 pb-7">
          <div className="flex flex-col items-center">
            <div className="w-9 h-9 rounded-full bg-emerald-500/10 text-emerald-400 text-sm font-bold flex items-center justify-center flex-shrink-0">{item.n}</div>
            {i < items.length - 1 && <div className="w-px flex-1 bg-border mt-2" />}
          </div>
          <div className="pt-1.5">
            <p className="font-semibold mb-2">{item.title}</p>
            <div className="text-sm text-foreground/70 leading-relaxed [&_p+p]:mt-2 [&_p]:leading-relaxed">{item.body}</div>
          </div>
        </div>
      ))}
    </div>
  )
}

function Callout({ type, title, children }: { type: 'tip' | 'warn'; title: string; children: React.ReactNode }) {
  const styles = type === 'tip'
    ? 'bg-emerald-500/5 border-emerald-500/30 [&_.ct]:text-emerald-400'
    : 'bg-amber-500/5 border-amber-500/30 [&_.ct]:text-amber-400'
  return (
    <div className={`border-l-2 rounded-r-lg px-4 py-3 mt-4 mb-2 text-sm ${styles}`}>
      <p className="ct font-semibold text-xs uppercase tracking-wide mb-1">{title}</p>
      <div className="text-foreground/60 leading-relaxed">{children}</div>
    </div>
  )
}
