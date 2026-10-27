import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { courseEntitlements } from '@/lib/db/schema'
import { and, eq, isNull, or } from 'drizzle-orm'
import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Optimise Your Google Business Profile',
  robots: { index: false },
}

export default async function GbpOptimiseContentPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in?redirect_url=/guides/gbp-optimise/content')

  const [entitlement] = await db
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

  if (!entitlement) redirect('/guides/gbp-optimise')

  return (
    <main className="min-h-screen pt-16 pb-16 px-4">
      <div className="max-w-2xl mx-auto">

        <div className="mb-12 pt-8">
          <p className="text-emerald-400 text-sm font-medium tracking-widest uppercase mb-3">Web F5 · GBP Guide 2 of 2</p>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 leading-tight text-balance">
            Optimise Your Google Business Profile
          </h1>
          <p className="text-foreground/60 text-base">
            8 steps · 3-4 hours initial setup, then 30 minutes/fortnight ongoing
          </p>
        </div>

        <nav className="mb-12 flex flex-wrap gap-2">
          {[
            ['#step-0', '0 · Before You Start'],
            ['#step-1', '1 · Categories'],
            ['#step-2', '2 · Services'],
            ['#step-3', '3 · Photos'],
            ['#step-4', '4 · Google Posts'],
            ['#step-5', '5 · Getting Reviews'],
            ['#step-6', '6 · Review Request Sender'],
            ['#step-7', '7 · Responding to Reviews'],
            ['#step-8', '8 · Reviews and Ethics'],
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
            <p className="guide-intro">This guide assumes you already have a verified Google Business Profile. If you haven't set one up yet, start with <a href="/guides/gbp-setup/content" className="text-emerald-400 underline underline-offset-2">Guide 1</a>.</p>

            <p className="text-sm text-foreground/70 leading-relaxed my-4">
              Optimisation is the work that separates a profile that sits idle from one that ranks and converts. Most of the changes in this guide are one-time work that compounds over months. The ongoing habit - posting and reviewing - takes about 30 minutes a fortnight once you have a rhythm.
            </p>

            <h3 className="guide-h3">What this guide will do for your profile</h3>
            <ul className="guide-list">
              <li>Improve your ranking for relevant local searches through better category and service signals</li>
              <li>Increase the number of reviews you receive through a simple, repeatable system</li>
              <li>Make your profile look more active and trustworthy to both Google and customers</li>
              <li>Give you a tool (the Review Request Sender) to ask for reviews in seconds, not minutes</li>
            </ul>

            <Callout type="tip" title="Do steps 1-3 first">
              Categories, services, and photos are the highest-leverage changes in this guide. Do them before the ongoing habits (posts and reviews). The structural work compounds the activity signals.
            </Callout>
          </section>

          {/* STEP 1 */}
          <section id="step-1" className="guide-module">
            <ModuleHeader num="01" label="The biggest ranking lever" title="Categories" />
            <p className="guide-intro">Your primary category is the single most powerful ranking signal in Google Business Profile. Getting it right - and adding the right secondary categories - can change where you appear in search results more than any other change.</p>

            <Steps items={[
              {
                n: 1,
                title: 'Review your primary category',
                body: <>
                  <p>Go to <strong>Edit profile → Business information → Category.</strong> Your primary category should be the most specific description of your core work. Check the list below for examples:</p>
                  <div className="mt-3 rounded-xl overflow-hidden border border-border text-sm">
                    {[
                      ['Too broad', 'Better'],
                      ['Contractor', 'Electrician'],
                      ['Home Services', 'Plumber'],
                      ['Construction Company', 'Roofer'],
                      ['Tradesperson', 'Painter'],
                      ['Repair Service', 'Appliance Repair Service'],
                    ].map(([broad, better], i) => (
                      <div key={broad} className={`grid grid-cols-2 px-3 py-2 ${i === 0 ? 'bg-card/80 font-semibold text-foreground/50 text-xs uppercase tracking-wide' : 'border-t border-border/50 text-foreground/70'}`}>
                        <span>{broad}</span>
                        <span className={i > 0 ? 'text-emerald-400' : ''}>{better}</span>
                      </div>
                    ))}
                  </div>
                </>,
              },
              {
                n: 2,
                title: 'Add secondary categories',
                body: <>
                  <p>Secondary categories let you appear in additional searches without diluting your primary ranking signal. Add up to 9 secondary categories that accurately describe other services you offer.</p>
                  <p>Example for a plumber who also does gas fitting and hot water:</p>
                  <ul className="guide-list mt-2">
                    <li><strong>Primary:</strong> Plumber</li>
                    <li><strong>Secondary:</strong> Gas installation service</li>
                    <li><strong>Secondary:</strong> Hot water system supplier</li>
                    <li><strong>Secondary:</strong> Drainage service</li>
                  </ul>
                  <Callout type="warn" title="Only add what you actually do">
                    Adding irrelevant categories to appear in more searches is against Google's guidelines and can trigger a suspension. Only add categories that accurately describe your business.
                  </Callout>
                </>,
              },
              {
                n: 3,
                title: 'Research what categories your top competitors use',
                body: <>
                  <p>Search Google for your main service + suburb (e.g. "plumber Bendigo") and look at the profiles ranking in the top 3. Click through to each profile and note what category they're using.</p>
                  <p>If a competitor ranking above you uses a more specific category than you, consider whether it's more accurate for your business. Don't copy categories that don't fit - but do make sure you're not underselling yourself with a vague one.</p>
                </>,
              },
            ]} />
          </section>

          {/* STEP 2 */}
          <section id="step-2" className="guide-module">
            <ModuleHeader num="02" label="Content that converts" title="Services" />
            <p className="guide-intro">The Services section of your GBP does two things: it tells Google what you offer (ranking signal), and it tells customers what they can book or enquire about (conversion signal). Most profiles treat it as an afterthought. Don't.</p>

            <Steps items={[
              {
                n: 1,
                title: 'Go to Edit profile → Services',
                body: <>
                  <p>Google will show suggested services based on your category. Check the ones you offer. These are a good starting point, but the real value is in what you add next.</p>
                </>,
              },
              {
                n: 2,
                title: 'Add custom services with descriptions',
                body: <>
                  <p>Below the Google-suggested services, you can add your own. For each service, you can write a short description (up to 300 characters). Use this.</p>
                  <p>Good service descriptions are specific and practical. They mention the outcome, not just the task:</p>
                  <div className="mt-3 rounded-xl overflow-hidden border border-border text-sm">
                    {[
                      ['Weak description', 'Strong description'],
                      ['Hot water installation', 'Hot water system installation - gas, electric, and solar. Supply and install from $890.'],
                      ['Drain clearing', 'Blocked drain clearing - kitchen, bathroom, and stormwater. Same-day service available.'],
                      ['Smoke alarm install', 'Smoke alarm installation to meet rental compliance requirements. Certificate of compliance included.'],
                    ].map(([weak, strong], i) => (
                      <div key={weak} className={`grid grid-cols-2 gap-2 px-3 py-2.5 ${i === 0 ? 'bg-card/80 font-semibold text-foreground/50 text-xs uppercase tracking-wide' : 'border-t border-border/50 text-foreground/70'}`}>
                        <span>{weak}</span>
                        <span className={i > 0 ? 'text-foreground/90' : ''}>{strong}</span>
                      </div>
                    ))}
                  </div>
                </>,
              },
              {
                n: 3,
                title: 'Match services to how people actually search',
                body: <>
                  <p>Think about how your customers describe the problem, not how you describe the service. "Burst pipe" not "pipe repair." "No hot water" not "hot water service." "Leaking tap" not "tap maintenance."</p>
                  <p>Go to Google and start typing your main service. Note the autocomplete suggestions - those are real searches. Make sure your service list covers them.</p>
                </>,
              },
            ]} />
          </section>

          {/* STEP 3 */}
          <section id="step-3" className="guide-module">
            <ModuleHeader num="03" label="Visual trust signals" title="Photos: Strategy, Types, and Frequency" />
            <p className="guide-intro">Photos do two things: they build trust with potential customers who are deciding whether to call you, and they signal to Google that your profile is active and engaged. Having the right photo types matters more than having many photos.</p>

            <Steps items={[
              {
                n: 1,
                title: 'The five photo types that matter',
                body: <>
                  <div className="flex flex-col gap-3 mt-2 text-sm text-foreground/70">
                    {[
                      ['Work photos', 'Completed jobs. Before/after pairs are the most convincing. Even a single "after" photo of a clean, professional install tells a story.'],
                      ['Team photos', 'You and/or your team in uniform or on-site. People hire people. A photo of a real person creates trust that a logo cannot.'],
                      ['Vehicle photos', 'Your work vehicle with signage. Signals an established, professional operation.'],
                      ['Equipment photos', 'Your tools, machinery, or specialist equipment. Shows you have what the job requires.'],
                      ['Location photos', 'Your workshop, office, or yard if customers visit. If they don\'t, skip this one.'],
                    ].map(([type, desc]) => (
                      <div key={type} className="flex gap-3">
                        <span className="text-emerald-400 mt-0.5 flex-shrink-0">✓</span>
                        <div><strong>{type}:</strong> {desc}</div>
                      </div>
                    ))}
                  </div>
                </>,
              },
              {
                n: 2,
                title: 'Photo quality checklist',
                body: <>
                  <ul className="guide-list">
                    <li>Taken in good light (outdoor natural light, or a well-lit interior)</li>
                    <li>In focus - blurry photos look unprofessional</li>
                    <li>Horizontal (landscape) orientation works best in the GBP photo display</li>
                    <li>No watermarks, text overlays, or promotional graphics</li>
                    <li>Real photos of real work - not stock photos</li>
                  </ul>
                </>,
              },
              {
                n: 3,
                title: 'Frequency: add photos regularly',
                body: <>
                  <p>Google's algorithm rewards active profiles. Adding a new photo every 1-2 weeks is a simple signal that your business is operational. It doesn't have to be a masterpiece - a quick phone photo of a finished job on the way out the door is enough.</p>
                  <p>A simple habit: at the end of every job, take one photo. Upload it to your GBP that evening or at the end of the week. Over 6 months, this builds a genuinely impressive portfolio.</p>
                </>,
              },
            ]} />
          </section>

          {/* STEP 4 */}
          <section id="step-4" className="guide-module">
            <ModuleHeader num="04" label="Staying active" title="Google Posts" />
            <p className="guide-intro">Google Posts are short updates - similar to a Facebook post - that appear on your profile. They expire after 7 days unless they're an event or offer. Posting fortnightly is a consistent signal that your business is active.</p>

            <Steps items={[
              {
                n: 1,
                title: 'What to post',
                body: <>
                  <div className="flex flex-col gap-2 mt-2 text-sm text-foreground/70">
                    {[
                      'A completed job photo with a 2-3 sentence description of what was done and where',
                      'A seasonal tip relevant to your trade ("Now is a good time to check your gutters before winter")',
                      'A current promotion or limited-time offer',
                      'A new service you\'ve added',
                      'A highlight from a good customer review (with their permission)',
                    ].map((item) => (
                      <div key={item} className="flex gap-3">
                        <span className="text-emerald-400 mt-0.5 flex-shrink-0">✓</span>
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </>,
              },
              {
                n: 2,
                title: 'How to write a post that works',
                body: <>
                  <p>The best GBP posts are short and specific. Vague posts ("Great service as always!") add no value. Specific posts ("Installed a new 315L heat pump hot water system at a property in Strathfieldsaye this week - upgrade from an old storage gas unit") give Google keyword signals and give customers a reason to keep reading.</p>
                  <p>Include a call to action at the end: "Call us for a quote," "Available for bookings," or "Get in touch."</p>
                </>,
              },
              {
                n: 3,
                title: 'The fortnightly habit',
                body: <>
                  <p>Set a reminder in your phone for every second Monday morning: "GBP post." Before you go to your first job for the week, spend 5 minutes writing a post about a recent job. Add the photo you took when you finished it. That's it.</p>
                  <p>Consistency matters more than quality. A mediocre post published fortnightly beats a great post published once every six months.</p>
                </>,
              },
            ]} />
          </section>

          {/* STEP 5 */}
          <section id="step-5" className="guide-module">
            <ModuleHeader num="05" label="Social proof" title="Getting Reviews: The Right Way to Ask" />
            <p className="guide-intro">Reviews are the most powerful ranking and conversion factor in local search. A profile with 30 reviews at 4.8 stars will consistently outrank one with 5 reviews at 5.0 stars. Volume and recency both matter.</p>

            <Steps items={[
              {
                n: 1,
                title: 'When to ask',
                body: <>
                  <p>The best time to ask for a review is immediately after the job is done - when the customer is happy, the result is fresh, and you're still in their thoughts. Waiting a week makes it less likely they'll follow through.</p>
                  <p>Ask in person when you hand over the invoice, then follow up with a text or email containing your review link. The in-person ask primes them; the message gives them the link when they're at their phone.</p>
                </>,
              },
              {
                n: 2,
                title: 'What to say',
                body: <>
                  <p>Keep it simple and personal. Avoid corporate-sounding scripts. A message like this works:</p>
                  <div className="mt-3 bg-card/50 border border-border rounded-xl p-4 text-sm text-foreground/70 leading-relaxed">
                    <p>Hi [name], good to catch up today. If you had a chance to leave us a Google review I'd really appreciate it - it makes a big difference for a small business like ours. Here's the link: [URL]</p>
                    <p className="mt-2">Thanks, [your name]</p>
                  </div>
                  <p className="mt-3">The "small business" framing is genuine and effective - people respond to helping a local operator.</p>
                </>,
              },
              {
                n: 3,
                title: 'Get your review link',
                body: <>
                  <p>In your GBP dashboard, go to <strong>Get more reviews</strong> or look for <strong>Share review form.</strong> Copy the short link Google provides. This takes customers directly to the review form, skipping the search step that causes most drop-off.</p>
                  <p>Save this link in your phone's notes app, your email signature, and your website. You should be able to share it in two taps.</p>
                </>,
              },
              {
                n: 4,
                title: 'Who to ask',
                body: <>
                  <p>Ask every satisfied customer. Don't pre-screen (only ask people you think will give 5 stars) - that's against Google's policies and creates a false picture of your business. Ask everyone who seemed happy and let honest reviews do their job.</p>
                  <p>Genuine 4-star reviews from real customers are more credible than a perfect 5.0 with 6 reviews. Customers are becoming savvy enough to distrust perfection.</p>
                </>,
              },
            ]} />
          </section>

          {/* STEP 6 */}
          <section id="step-6" className="guide-module">
            <ModuleHeader num="06" label="The tool" title="The Web F5 Review Request Sender" />
            <p className="guide-intro">The Web F5 Review Request Sender is a free tool at webf5.com.au that lets you send a review request email to a customer in seconds - just their name, email address, and your review link.</p>

            <Steps items={[
              {
                n: 1,
                title: 'Set up your sender profile',
                body: <>
                  <p>Go to <strong><a href="/resources/review-sender" target="_blank" rel="noopener" className="text-emerald-400 underline underline-offset-2">webf5.com.au/resources/review-sender</a></strong> and sign in with your account. Enter your business name, your Google review link, and your name.</p>
                  <p>The sender uses your details to personalise the email - the customer sees a message that looks like it came from you personally, not from a generic platform.</p>
                </>,
              },
              {
                n: 2,
                title: 'Send a review request',
                body: <>
                  <p>Enter the customer's first name and email address. The tool composes and sends the email immediately. No copy-pasting, no drafting, no forgetting.</p>
                  <p>The email is short and personal - it doesn't look like a mass mail-out. It contains your review link and a brief, human message.</p>
                </>,
              },
              {
                n: 3,
                title: 'Build it into your end-of-job habit',
                body: <>
                  <p>The Review Request Sender works best when it's part of your invoicing routine. When you mark a job as complete and send the invoice, open the sender on your phone and fire off the review request at the same time.</p>
                  <p>Businesses that do this consistently average 3-5 new reviews per month without any additional effort.</p>
                </>,
              },
            ]} />
          </section>

          {/* STEP 7 */}
          <section id="step-7" className="guide-module">
            <ModuleHeader num="07" label="The response habit" title="Responding to Reviews" />
            <p className="guide-intro">Responding to reviews is both a ranking signal and a trust signal. Google's own documentation confirms that responding to reviews improves local search ranking. Customers also read responses - how you handle a bad review matters as much as the review itself.</p>

            <Steps items={[
              {
                n: 1,
                title: 'Respond to every review',
                body: <>
                  <p>Every review, positive or negative, deserves a response. For positive reviews, a short, specific thank-you is enough. Avoid generic templates like "Thank you for your review!" - personalise it even slightly.</p>
                  <div className="mt-3 bg-card/50 border border-border rounded-xl p-4 text-sm text-foreground/70 leading-relaxed">
                    <p><strong>Weak response:</strong> "Thanks for the great review!"</p>
                    <p className="mt-2"><strong>Better response:</strong> "Thanks [name], really glad the hot water install worked out well. Appreciate you taking the time to write this - it means a lot for a small operation like ours."</p>
                  </div>
                </>,
              },
              {
                n: 2,
                title: 'Responding to negative reviews',
                body: <>
                  <p>Don't respond when you're angry. Wait 24 hours if needed. When you do respond:</p>
                  <ul className="guide-list mt-2">
                    <li>Acknowledge the issue without admitting fault if it's disputed</li>
                    <li>Offer to resolve it offline (provide your contact number)</li>
                    <li>Keep it short - don't write a defense essay</li>
                    <li>Never attack the customer or call them a liar</li>
                  </ul>
                  <div className="mt-3 bg-card/50 border border-border rounded-xl p-4 text-sm text-foreground/70 leading-relaxed">
                    <p><strong>Example:</strong> "Hi [name], sorry to hear you had this experience. That's not the standard we hold ourselves to. Please give us a call on [number] and we'll sort it out."</p>
                  </div>
                  <p className="mt-3">Future customers reading the review will see your response. A calm, professional response to a harsh review often creates more trust than no negative reviews at all.</p>
                </>,
              },
              {
                n: 3,
                title: 'Flag fake or irrelevant reviews',
                body: <>
                  <p>If a review is clearly fake, from someone who was never a customer, or violates Google's policies (spam, offensive content), click the three dots next to the review and flag it. Google's removal rate is low, but it's worth doing.</p>
                  <p>Don't flag reviews just because they're negative and accurate. Focus on genuine policy violations.</p>
                </>,
              },
            ]} />
          </section>

          {/* STEP 8 */}
          <section id="step-8" className="guide-module">
            <ModuleHeader num="08" label="The important bit" title="Why Asking for Reviews Is Not Gate-Keeping" />
            <p className="guide-intro">There's a misconception in the trades that asking happy customers for reviews is somehow unfair, manipulative, or "gaming the system." It's not. Here's the honest case for why asking is the right thing to do.</p>

            <div className="text-sm text-foreground/70 leading-relaxed flex flex-col gap-4 my-6">
              <p>
                <strong className="text-foreground">What gate-keeping actually is:</strong> Gate-keeping is when a business only shows or shares positive feedback while hiding or suppressing negative feedback. For example: sending a satisfaction survey, and only directing the 4-5 star responders to Google while ignoring or privately resolving the 1-3 star ones. That's manufacturing a misleading picture of your reputation.
              </p>
              <p>
                <strong className="text-foreground">What asking for reviews is:</strong> Sending a review request to every satisfied customer - and letting them write whatever they genuinely think. You can't control what they say. You're not filtering by satisfaction score first. You're just removing friction for people who are happy but wouldn't otherwise bother.
              </p>
              <p>
                <strong className="text-foreground">The real problem reviews solve:</strong> Unhappy customers are far more motivated to write reviews than happy ones. Without any effort to collect reviews, your profile will slowly accumulate a skewed picture of your business - heavy on the few complaints, light on the many satisfied jobs. Asking for reviews from happy customers corrects that imbalance and creates an accurate representation.
              </p>
              <p>
                <strong className="text-foreground">Google's own position:</strong> Google explicitly allows - and encourages - businesses to ask customers for reviews. What Google prohibits is incentivising reviews (paying for them, offering discounts), creating fake reviews, and the gate-keeping method described above. Sending a polite request to a real customer after a real job is exactly what the system is designed for.
              </p>
              <p>
                <strong className="text-foreground">The practical argument:</strong> Your competitors who are ranking above you are not all getting more reviews through luck. They're asking. The question isn't whether to ask - it's whether you'll let a misplaced concern about fairness leave you at a structural disadvantage.
              </p>
            </div>

            <Callout type="tip" title="The one line that matters">
              Ask every satisfied customer. Don't pre-screen. Don't offer incentives. Don't write reviews yourself. Just ask real people to share their real experience. That's it.
            </Callout>
          </section>

          {/* SUBJECT TO CHANGE */}
          <section id="stc" className="guide-module">
            <div className="bg-card/50 border border-border rounded-2xl p-6">
              <h2 className="text-base font-bold mb-4">Subject to Change</h2>
              <p className="text-sm text-foreground/50 mb-6">Google Business Profile's features and interface change frequently. Notes on what may have changed since this guide was written.</p>
              <div className="flex flex-col divide-y divide-border">
                {[
                  ['Category list', 'Google adds and removes categories periodically. If a category mentioned in this guide isn\'t available, choose the closest equivalent. The general principle - be specific rather than broad - remains constant.'],
                  ['Services section', 'The Services interface has changed layout several times. If you can\'t find it at "Edit profile → Services," look for it under "Products" or in your profile\'s main edit menu. Google sometimes combines or separates these sections.'],
                  ['Google Posts expiry', 'Standard Google Posts currently expire after 7 days. Event and Offer posts can be set to run longer. Check current GBP help documentation if post behaviour has changed.'],
                  ['Review policies', 'Google\'s review policies, including what counts as gate-keeping and what incentives are prohibited, are detailed in their official guidelines. Check the current version at Google\'s Business Profile help centre before changing your review request practice.'],
                  ['Review Request Sender', 'The Web F5 Review Request Sender is maintained by Web F5 and updated independently. If it\'s not working as described, contact Web F5 directly at contact@webf5.au.'],
                ].map(([service, detail]) => (
                  <div key={service} className="py-4">
                    <p className="font-semibold text-sm mb-1">{service}</p>
                    <p className="text-sm text-foreground/50 leading-relaxed">{detail}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Web F5 CTA */}
          <div className="mt-12 border border-primary/20 rounded-2xl p-6 bg-primary/5 text-center">
            <p className="font-semibold mb-2">Want someone to manage this for you?</p>
            <p className="text-sm text-foreground/50 mb-4">Web F5 manages Google Business Profiles for tradies across Central Victoria - setup, optimisation, and ongoing posting.</p>
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
